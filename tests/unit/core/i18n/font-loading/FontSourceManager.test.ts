import { jest } from '@jest/globals';
import { FontSourceManager, LocalFontSource, GoogleFontSource, SystemFontSource } from '../../../../../src/core/i18n/font-loading/FontSourceManager.js';

// Type definitions
interface MockFetch {
    mockResolvedValue: (value => void);
    mockRejectedValue: (error: Error) => void;
    mockClear: () => void;
}

interface MockFontFace {
    load: jest.Mock<Promise<void>, []>;
}

interface MockCanvasContext {
    font: string;
    measureText: jest.Mock<{ width: number }, [string]>;
}

interface MockCanvas {
    getContext: jest.Mock<MockCanvasContext, [string]>;
}

interface MockDocument {
    fonts?: {
        add: jest.Mock<void, [any]>;
    };
    createElement: jest.Mock<any, [string]>;
    head: {
        appendChild: jest.Mock<void, [any]>;
    };
    querySelectorAll: jest.Mock<any[], [string]>;
}

interface MockNavigator {
    onLine: boolean;
}

interface MockLink {
    rel: string;
    href: string;
    onload: (() => void) | null;
    onerror: (() => void) | null;
}

interface FontSource {
    load: jest.Mock<Promise<any>, [string, any?]>;
    isAvailable: jest.Mock<boolean, []>;
}

interface LoadResult {
    loaded: boolean;
    path?: string;
    url?: string;
    cached?: boolean;
    system?: boolean;
}

interface SourceLoadResult {
    success: boolean;
    fontFamily: string;
    source: string;
    loadTime?: number;
}

interface LoadHistory {
    timestamp: number;
    failed: boolean;
    error?: any;
}

interface FontManagerStats {
    enabledSources: string[];
    availableSources: string[];
    loadAttempts: number;
    timeouts: any;
}

interface ConsoleSpy {
    warn: jest.SpyInstance;
    log: jest.SpyInstance;
}

interface FontSourceConfig {
    enabledSources?: string[];
    fontDirectory?: string;
    formats?: string[];
    weights?: string[];
}

// Mock DOM and Web APIs
(global as any).fetch = jest.fn() as MockFetch;
(global as any).document = {
    fonts: {
        add: jest.fn()
    },
    createElement: jest.fn(() => ({
        getContext: jest.fn(() => ({
            font: '',
            measureText: jest.fn(() => ({ width: 100 }))
        }))
    })),
    head: {
        appendChild: jest.fn()
    },
    querySelectorAll: jest.fn(() => [])
} as MockDocument;

(global as any).FontFace = jest.fn(() => ({
    load: jest.fn(() => Promise.resolve())
}));

(global as any).navigator = {
    onLine: true
} as MockNavigator;

describe('FontSourceManager', () => {
    let fontSourceManager: FontSourceManager;
    let consoleSpy: ConsoleSpy;

    beforeEach(() => {
        fontSourceManager = new FontSourceManager();
        consoleSpy = {
            warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
            log: jest.spyOn(console, 'log').mockImplementation(() => {})
        };

        // Reset mocks
        (fetch as unknown as jest.Mock).mockClear();
        ((global as any).FontFace as jest.Mock).mockClear();
        ((global as any).document.fonts.add as jest.Mock).mockClear();
    });

    afterEach(() => {
        Object.values(consoleSpy).forEach(spy => spy.mockRestore());
        fontSourceManager.clearLoadHistory();
    });

    describe('Source Management', () => {
        test('should initialize with default enabled sources', () => {
            const availableSources = fontSourceManager.getAvailableSources();
            
            expect(availableSources).toContain('system');
            expect(availableSources).toContain('google');
            expect(availableSources).toContain('local');
        });

        test('should allow custom enabled sources configuration', () => {
            const config: FontSourceConfig = {
                enabledSources: ['system', 'google']
            };
            
            const manager = new FontSourceManager(config);
            const availableSources = manager.getAvailableSources();
            
            expect(availableSources).toContain('system');
            expect(availableSources).toContain('google');
            expect(availableSources).not.toContain('local');
        });

        test('should check source availability', () => {
            expect(fontSourceManager.isSourceAvailable('system')).toBe(true);
            expect(fontSourceManager.isSourceAvailable('google')).toBe(true);
            expect(fontSourceManager.isSourceAvailable('nonexistent')).toBe(false);
        });

        test('should enable and disable sources dynamically', () => {
            fontSourceManager.disableSource('google');
            expect(fontSourceManager.enabledSources).not.toContain('google');
            
            fontSourceManager.enableSource('google');
            expect(fontSourceManager.enabledSources).toContain('google');
        });
    });

    describe('Font Loading', () => {
        test('should load font from available source', async () => {
            const mockSource: FontSource = {
                load: jest.fn(() => Promise.resolve({ loaded: true })),
                isAvailable: jest.fn(() => true)
            };
            
            fontSourceManager.sources.test = mockSource;
            fontSourceManager.enabledSources.push('test');
            
            const result = await fontSourceManager.loadFromSource('test', 'Arial');
            
            expect(result.success).toBe(true);
            expect(result.fontFamily).toBe('Arial');
            expect(result.source).toBe('test');
            expect(mockSource.load).toHaveBeenCalledWith('Arial', {});
        });

        test('should handle font loading failure', async () => {
            const mockSource: FontSource = {
                load: jest.fn(() => Promise.reject(new Error('Load failed'))),
                isAvailable: jest.fn(() => true)
            };
            
            fontSourceManager.sources.test = mockSource;
            fontSourceManager.enabledSources.push('test');
            
            await expect(fontSourceManager.loadFromSource('test', 'Arial')).rejects.toThrow('Failed to load Arial from test');
        });

        test('should handle disabled source', async () => {
            await expect(fontSourceManager.loadFromSource('disabled', 'Arial')).rejects.toThrow('Font source \'disabled\' is disabled');
        });

        test('should handle unknown source', async () => {
            fontSourceManager.enabledSources.push('unknown');
            await expect(fontSourceManager.loadFromSource('unknown', 'Arial')).rejects.toThrow('Unknown font source: unknown');
        });

        test('should respect timeout settings', async () => {
            const mockSource: FontSource = {
                load: jest.fn(() => new Promise(resolve => setTimeout(resolve, 2000))),
                isAvailable: jest.fn(() => true)
            };
            
            fontSourceManager.sources.test = mockSource;
            fontSourceManager.enabledSources.push('test');
            fontSourceManager.timeouts.test = 100; // Very short timeout
            
            await expect(fontSourceManager.loadFromSource('test', 'Arial')).rejects.toThrow('timeout');
        });

        test('should implement cooldown for failed sources', async () => {
            const mockSource: FontSource = {
                load: jest.fn(() => Promise.reject(new Error('Load failed'))),
                isAvailable: jest.fn(() => true)
            };
            
            fontSourceManager.sources.test = mockSource;
            fontSourceManager.enabledSources.push('test');
            
            // First attempt should fail
            await expect(fontSourceManager.loadFromSource('test', 'Arial')).rejects.toThrow();
            
            // Second attempt within cooldown should be rejected immediately
            await expect(fontSourceManager.loadFromSource('test', 'Arial')).rejects.toThrow('cooldown active');
        });
    });

    describe('Load History Management', () => {
        test('should track load attempts', async () => {
            const mockSource: FontSource = {
                load: jest.fn(() => Promise.resolve({ loaded: true })),
                isAvailable: jest.fn(() => true)
            };
            
            fontSourceManager.sources.test = mockSource;
            fontSourceManager.enabledSources.push('test');
            
            await fontSourceManager.loadFromSource('test', 'Arial');
            
            const history = fontSourceManager.getLoadAttemptHistory('test', 'Arial');
            expect(history).toBeDefined();
            expect(history!.timestamp).toBeDefined();
            expect(history!.failed).toBe(false);
        });

        test('should track failed load attempts', async () => {
            const mockSource: FontSource = {
                load: jest.fn(() => Promise.reject(new Error('Load failed'))),
                isAvailable: jest.fn(() => true)
            };
            
            fontSourceManager.sources.test = mockSource;
            fontSourceManager.enabledSources.push('test');
            
            try {
                await fontSourceManager.loadFromSource('test', 'Arial');
            } catch (error) {
                // Expected to fail
            }
            
            const history = fontSourceManager.getLoadAttemptHistory('test', 'Arial');
            expect(history!.failed).toBe(true);
            expect(history!.error).toBeDefined();
        });

        test('should clear load history', async () => {
            const mockSource: FontSource = {
                load: jest.fn(() => Promise.resolve({ loaded: true })),
                isAvailable: jest.fn(() => true)
            };
            
            fontSourceManager.sources.test = mockSource;
            fontSourceManager.enabledSources.push('test');
            
            await fontSourceManager.loadFromSource('test', 'Arial');
            fontSourceManager.clearLoadHistory('test');
            
            const history = fontSourceManager.getLoadAttemptHistory('test', 'Arial');
            expect(history).toBeNull();
        });
    });

    describe('Statistics', () => {
        test('should provide comprehensive statistics', () => {
            const stats = fontSourceManager.getStats();
            
            expect(stats.enabledSources).toBeDefined();
            expect(Array.isArray(stats.enabledSources)).toBe(true);
            expect(stats.availableSources).toBeDefined();
            expect(Array.isArray(stats.availableSources)).toBe(true);
            expect(typeof stats.loadAttempts).toBe('number');
            expect(stats.timeouts).toBeDefined();
        });
    });
});

describe('LocalFontSource', () => {
    let localFontSource: LocalFontSource;

    beforeEach(() => {
        localFontSource = new LocalFontSource();
        (fetch as unknown as jest.Mock).mockClear();
        ((global as any).FontFace as jest.Mock).mockClear();
    });

    describe('Font Loading', () => {
        test('should load local font successfully', async () => {
            (fetch as unknown as jest.Mock).mockResolvedValue({ ok: true });
            
            const result = await localFontSource.load('TestFont');
            
            expect(result.loaded).toBe(true);
            expect(result.path).toContain('testfont.woff2');
            expect((global as any).FontFace).toHaveBeenCalled();
        });

        test('should handle missing CSS Font Loading API', async () => {
            const originalFonts = (global as any).document.fonts;
            delete (global as any).document.fonts;
            
            await expect(localFontSource.load('TestFont')).rejects.toThrow('CSS Font Loading API not supported');
            
            (global as any).document.fonts = originalFonts;
        });

        test('should check font file existence', async () => {
            (fetch as unknown as jest.Mock).mockResolvedValue({ ok: false });
            
            await expect(localFontSource.load('MissingFont')).rejects.toThrow('Font file not found');
        });

        test('should handle font loading errors', async () => {
            (fetch as unknown as jest.Mock).mockResolvedValue({ ok: true });
            ((global as any).FontFace as jest.Mock).mockImplementation(() => ({
                load: jest.fn(() => Promise.reject(new Error('Font load error')))
            }));
            
            await expect(localFontSource.load('ErrorFont')).rejects.toThrow('Failed to load local font');
        });
    });

    describe('Configuration', () => {
        test('should accept custom font directory', () => {
            const config: FontSourceConfig = { fontDirectory: '/custom/fonts' };
            const source = new LocalFontSource(config);
            
            expect(source.fontDirectory).toBe('/custom/fonts');
        });

        test('should accept custom font formats', () => {
            const config: FontSourceConfig = { formats: ['woff', 'ttf'] };
            const source = new LocalFontSource(config);
            
            expect(source.formats).toEqual(['woff', 'ttf']);
        });
    });
});

describe('GoogleFontSource', () => {
    let googleFontSource: GoogleFontSource;

    beforeEach(() => {
        googleFontSource = new GoogleFontSource();
    });

    describe('Font Loading', () => {
        test('should load Google Font successfully', async () => {
            const mockLink: MockLink = {
                rel: '',
                href: '',
                onload: null,
                onerror: null
            };
            
            (document.createElement as jest.Mock).mockReturnValue(mockLink);
            
            const loadPromise = googleFontSource.load('Open Sans');
            
            // Simulate successful load
            setTimeout(() => mockLink.onload?.(), 10);
            
            const result = await loadPromise;
            
            expect(result.loaded).toBe(true);
            expect(result.url).toContain('Open+Sans');
        });

        test('should handle Google Font loading failure', async () => {
            const mockLink: MockLink = {
                rel: '',
                href: '',
                onload: null,
                onerror: null
            };
            
            (document.createElement as jest.Mock).mockReturnValue(mockLink);
            
            const loadPromise = googleFontSource.load('InvalidFont');
            
            // Simulate failed load
            setTimeout(() => mockLink.onerror?.(), 10);
            
            await expect(loadPromise).rejects.toThrow('Failed to load Google Font');
        });

        test('should return cached font if already loaded', async () => {
            googleFontSource.loadedFonts.add('Roboto');
            
            const result = await googleFontSource.load('Roboto');
            
            expect(result.loaded).toBe(true);
            expect(result.cached).toBe(true);
        });
    });

    describe('Configuration', () => {
        test('should build correct font URL with default settings', () => {
            const url = googleFontSource._buildFontUrl('Open Sans');
            
            expect(url).toContain('googleapis.com/css2');
            expect(url).toContain('Open+Sans');
            expect(url).toContain('400;500;700');
            expect(url).toContain('display=swap');
        });

        test('should build font URL with custom weights', () => {
            const options = { weights: ['300', '600'] };
            const url = googleFontSource._buildFontUrl('Roboto', options);
            
            expect(url).toContain('300;600');
        });
    });

    describe('Availability', () => {
        test('should be available when online', () => {
            (navigator.onLine = true;
            expect(googleFontSource.isAvailable()).toBe(true);
        });

        test('should be unavailable when offline', () => {
            (navigator.onLine = false;
            expect(googleFontSource.isAvailable()).toBe(false);
            
            // Restore original state
            (navigator.onLine = true;
        });
    });
});

describe('SystemFontSource', () => {
    let systemFontSource: SystemFontSource;

    beforeEach(() => {
        systemFontSource = new SystemFontSource();
    });

    describe('Font Loading', () => {
        test('should load system font if available', async () => {
            // Mock font as available (different width)
            const mockContext: MockCanvasContext = {
                font: '',
                measureText: jest.fn()
                    .mockReturnValueOnce({ width: 100 })  // baseline
                    .mockReturnValue({ width: 120 })      // different = available
            };
            
            (document.createElement as jest.Mock).mockReturnValue({
                getContext: jest.fn(() => mockContext)
            });
            
            const result = await systemFontSource.load('Arial');
            
            expect(result.loaded).toBe(true);
            expect(result.system).toBe(true);
        });

        test('should reject unavailable system font', async () => {
            // Mock font as unavailable (same width)
            const mockContext: MockCanvasContext = {
                font: '',
                measureText: jest.fn(() => ({ width: 100 }))
            };
            
            (document.createElement as jest.Mock).mockReturnValue({
                getContext: jest.fn(() => mockContext)
            });
            
            await expect(systemFontSource.load('NonexistentFont')).rejects.toThrow('System font not available');
        });
    });

    describe('Availability', () => {
        test('should be available in browser environment', () => {
            expect(systemFontSource.isAvailable()).toBe(true);
        });

        test('should be unavailable in non-browser environment', () => {
            const originalDocument = (global as any).document;
            delete (global as any).document;
            
            const source = new SystemFontSource();
            expect(source.isAvailable()).toBe(false);
            
            (global as any).document = originalDocument;
        });
    });
});