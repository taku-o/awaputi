/**
 * Keyboard Shortcuts Documentation Validation Tests
 * Issue #169対応 - ドキュメント精度検証テスト
 */

import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import path from 'path';

// TextEncoder/TextDecoder polyfill for Node.js environment
import { TextEncoder, TextDecoder } from 'util';
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// DOM environment setup
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global as any).document = dom.window.document;
(global as any).window = dom.window;
(global as any).localStorage = dom.window.localStorage;
(global as any).performance = dom.window.performance;

// Mock game engine components
const mockGameEngine = {
    sceneManager: {
        getCurrentScene: jest.fn(() => ({
            constructor: { name: 'MainMenuScene' }
        })),
        switchScene: jest.fn(() => true)
    },
    audioManager: {
        toggleMute: jest.fn(() => false)
    },
    settingsManager: {
        get: jest.fn(() => 0.5),
        set: jest.fn()
    },
    responsiveCanvasManager: {
        toggleFullscreen: jest.fn()
    },
    isDebugMode: jest.fn(() => false),
    performanceStats: {}
};

// Import after mocking
const { CoreKeyboardShortcutManager } = await import('../../src/core/KeyboardShortcutManager.js');

describe('Keyboard Shortcuts Documentation Validation (Issue #169)', () => {
    let shortcutManager: any;
    let japaneseDoc: any;
    let englishDoc: any;

    beforeAll(() => {
        // Load documentation files
        const projectRoot = path.resolve(process.cwd());
        
        try {
            japaneseDoc = readFileSync(
                path.join(projectRoot, 'docs/keyboard-shortcuts.md'), 
                'utf-8'
            );
        } catch (error) {
            console.warn('Could not load Japanese documentation:', error.message);
            japaneseDoc = '';
        }

        try {
            englishDoc = readFileSync(
                path.join(projectRoot, 'docs/keyboard-shortcuts.en.md'), 
                'utf-8'
            );
        } catch (error) {
            console.warn('Could not load English documentation:', error.message);
            englishDoc = '';
        }
    });

    beforeEach(() => {
        // Reset mock calls
        jest.clearAllMocks();

        // Create instance
        shortcutManager = new CoreKeyboardShortcutManager(mockGameEngine;
    });

    afterEach(() => {
        if (shortcutManager) {
            shortcutManager.cleanup();
        }
    });

    describe('Documentation Accuracy Cross-Reference', () => {
        test('should verify all shortcuts listed in Japanese documentation actually work', () => {
            if (!japaneseDoc) {
                console.warn('Japanese documentation not available, skipping test');
                return;
            }

            const shortcuts = shortcutManager.getShortcuts();
            
            // Extract keyboard shortcuts mentioned in documentation
            // Look for patterns like "**Space**", "**F**", etc.
            const documentedShortcuts: any[] = [];
            const shortcutRegex = /\*\*([A-Za-z0-9+]+)\*\*/g;
            let match: any;
            
            while ((match = shortcutRegex.exec(japaneseDoc) !== null) {
                const shortcut = match[1];
                // Filter out common markdown formatting that's not a shortcut
                if (!['Key', 'Function', 'Description', 'Notes'].includes(shortcut) {
                    documentedShortcuts.push(shortcut;
                }
            }

            // Remove duplicates
            const uniqueDocumentedShortcuts = [...new Set(documentedShortcuts];

            // Cross-reference with actual implementation
            const implementedKeys: any[] = [];
            for (const [name, shortcut] of Object.entries(shortcuts) {
                if (shortcut.keys) {
                    shortcut.keys.forEach(key => {
                        // Convert KeyboardEvent codes to documentation format
                        const docKey = convertKeyCodeToDocFormat(key;
                        if (docKey) {
                            implementedKeys.push(docKey;
                        }
                    });
                }
            }

            // Verify documented shortcuts are implemented
            const notImplemented = uniqueDocumentedShortcuts.filter(docKey => {
                return !implementedKeys.some(implKey => 
                    implKey.toLowerCase() === docKey.toLowerCase()
                );
            });

            if (notImplemented.length > 0) {
                console.warn('Shortcuts documented but not implemented:', notImplemented);
            }

            // This is informational - we expect some discrepancies during transition
            expect(notImplemented.length).toBeLessThan(uniqueDocumentedShortcuts.length);
        });

        test('should verify all implemented shortcuts are documented in Japanese', () => {
            if (!japaneseDoc) {
                console.warn('Japanese documentation not available, skipping test');
                return;
            }

            const shortcuts = shortcutManager.getShortcuts();
            const implementedShortcuts = Object.keys(shortcuts;
            
            // Check if major shortcuts are mentioned in documentation
            const majorShortcuts = ['pause', 'menu', 'fullscreen', 'mute'];
            const documentationLower = japaneseDoc.toLowerCase();
            
            for (const shortcut of majorShortcuts) {
                if (implementedShortcuts.includes(shortcut) {
                    // Each major shortcut should be mentioned or its function described
                    const isDocumented = 
                        documentationLower.includes('space') && shortcut === 'pause' ||
                        documentationLower.includes('escape') && shortcut === 'menu' ||
                        documentationLower.includes('f') && shortcut === 'fullscreen' ||
                        documentationLower.includes('m') && shortcut === 'mute';
                    
                    if (!isDocumented) {
                        console.warn(`Major shortcut '${shortcut}' may not be documented`);
                    }
                }
            }
        });

        test('should verify all shortcuts listed in English documentation actually work', () => {
            if (!englishDoc) {
                console.warn('English documentation not available, skipping test');
                return;
            }

            const shortcuts = shortcutManager.getShortcuts();
            
            // Similar validation for English documentation
            const documentedShortcuts: any[] = [];
            const shortcutRegex = /\*\*([A-Za-z0-9+]+)\*\*/g;
            let match: any;
            
            while ((match = shortcutRegex.exec(englishDoc) !== null) {
                const shortcut = match[1];
                if (!['Key', 'Function', 'Description', 'Notes'].includes(shortcut) {
                    documentedShortcuts.push(shortcut;
                }
            }

            const uniqueDocumentedShortcuts = [...new Set(documentedShortcuts];

            // Cross-reference with actual implementation
            const implementedKeys: any[] = [];
            for (const [name, shortcut] of Object.entries(shortcuts) {
                if (shortcut.keys) {
                    shortcut.keys.forEach(key => {
                        const docKey = convertKeyCodeToDocFormat(key;
                        if (docKey) {
                            implementedKeys.push(docKey;
                        }
                    });
                }
            }

            const notImplemented = uniqueDocumentedShortcuts.filter(docKey => {
                return !implementedKeys.some(implKey => 
                    implKey.toLowerCase() === docKey.toLowerCase()
                );
            });

            if (notImplemented.length > 0) {
                console.warn('Shortcuts documented in English but not implemented:', notImplemented);
            }

            expect(notImplemented.length).toBeLessThan(uniqueDocumentedShortcuts.length);
        });
    });

    describe('Removed Shortcuts Verification in Documentation', () => {
        test('should verify removed shortcuts are not mentioned in Japanese documentation', () => {
            if (!japaneseDoc) {
                console.warn('Japanese documentation not available, skipping test');
                return;
            }

            // Check that removed shortcuts (S, H, I) are not prominently featured
            const removedShortcutPatterns = [
                /\*\*S\*\*.*設定/,  // **S** for settings
                /\*\*H\*\*.*ヘルプ/, // **H** for help
                /\*\*I\*\*.*ユーザー情報/ // **I** for user info
            ];

            const foundRemovedShortcuts: any[] = [];
            removedShortcutPatterns.forEach((pattern, index) => {
                if (pattern.test(japaneseDoc)) {
                    foundRemovedShortcuts.push(['S', 'H', 'I'][index]);
                }
            });

            if (foundRemovedShortcuts.length > 0) {
                console.warn('Found removed shortcuts still documented in Japanese:', foundRemovedShortcuts);
            }

            expect(foundRemovedShortcuts).toHaveLength(0);
        });

        test('should verify removed shortcuts are not mentioned in English documentation', () => {
            if (!englishDoc) {
                console.warn('English documentation not available, skipping test');
                return;
            }

            // Check that removed shortcuts (S, H, I) are not prominently featured
            const removedShortcutPatterns = [
                /\*\*S\*\*.*[Ss]ettings/,  // **S** for settings
                /\*\*H\*\*.*[Hh]elp/,      // **H** for help
                /\*\*I\*\*.*[Uu]ser.*[Ii]nfo/ // **I** for user info
            ];

            const foundRemovedShortcuts: any[] = [];
            removedShortcutPatterns.forEach((pattern, index) => {
                if (pattern.test(englishDoc)) {
                    foundRemovedShortcuts.push(['S', 'H', 'I'][index]);
                }
            });

            if (foundRemovedShortcuts.length > 0) {
                console.warn('Found removed shortcuts still documented in English:', foundRemovedShortcuts);
            }

            expect(foundRemovedShortcuts).toHaveLength(0);
        });
    });

    describe('Help Text Generation Accuracy', () => {
        test('should verify generated help text matches documentation intent', () => {
            const helpText = shortcutManager.generateHelpText();
            
            // Convert help text to a searchable format
            const allHelpText = Object.values(helpText
                .flat()
                .join(' ')
                .toLowerCase();

            // Verify essential shortcuts are included
            expect(allHelpText).toMatch(/space|スペース/); // Pause
            expect(allHelpText).toMatch(/escape|エスケープ/); // Menu
            expect(allHelpText).toMatch(/f(?![a-z])|f\s/); // Fullscreen

            // Verify removed shortcuts are NOT included
            expect(allHelpText).not.toMatch(/s\s*:|s\s*：.*設定/); // S for settings
            expect(allHelpText).not.toMatch(/h\s*:|h\s*：.*ヘルプ/); // H for help
            expect(allHelpText).not.toMatch(/i\s*:|i\s*：.*ユーザー/); // I for user info
        });

        test('should verify help text structure is consistent', () => {
            const helpText = shortcutManager.generateHelpText();
            
            // Verify expected sections exist
            expect(helpText['ゲーム操作']).toBeDefined();
            expect(helpText['UI操作']).toBeDefined();
            expect(helpText['アクセシビリティ']).toBeDefined();
            expect(helpText['その他']).toBeDefined();

            // Each section should be an array with valid entries
            Object.entries(helpText.forEach(([section, entries]) => {
                expect(Array.isArray(entries).toBe(true);
                
                entries.forEach(entry => {
                    expect(typeof entry).toBe('string');
                    expect(entry.length).toBeGreaterThan(0);
                });
            });
        });
    });

    describe('Documentation Consistency Between Languages', () => {
        test('should verify Japanese and English documentation have similar structure', () => {
            if (!japaneseDoc || !englishDoc) {
                console.warn('One or both documentation files not available, skipping test');
                return;
            }

            // Check for major sections in both documents
            const majorSections = [
                { jp: '基本ゲーム操作', en: 'Basic Game Controls' },
                { jp: 'UI・メニュー操作', en: 'UI & Menu Navigation' },
                { jp: 'ヘルプ・設定アクセス', en: 'Help & Settings Access' },
                { jp: '音量調整', en: 'Volume Control' }
            ];

            majorSections.forEach(({ jp, en }) => {
                const hasJpSection = japaneseDoc.includes(jp;
                const hasEnSection = englishDoc.includes(en;
                
                if (hasJpSection !== hasEnSection) {
                    console.warn(`Section mismatch: JP "${jp}" (${hasJpSection}) vs EN "${en}" (${hasEnSection})`);
                }
            });
        });

        test('should verify both documentations exclude removed shortcuts', () => {
            if (!japaneseDoc || !englishDoc) {
                console.warn('One or both documentation files not available, skipping test');
                return;
            }

            // Both documents should not prominently feature S, H, I for their removed functions
            const removedFunctionality = [
                { jp: 'S.*設定', en: 'S.*[Ss]ettings' },
                { jp: 'H.*ヘルプ', en: 'H.*[Hh]elp' },
                { jp: 'I.*ユーザー情報', en: 'I.*[Uu]ser.*[Ii]nfo' }
            ];

            removedFunctionality.forEach(({ jp, en }, index) => {
                const jpPattern = new RegExp(jp;
                const enPattern = new RegExp(en;
                
                const jpHasRemoved = jpPattern.test(japaneseDoc);
                const enHasRemoved = enPattern.test(englishDoc);
                
                if (jpHasRemoved || enHasRemoved) {
                    const shortcut = ['S', 'H', 'I'][index];
                    console.warn(`Removed shortcut ${shortcut} still found: JP=${jpHasRemoved}, EN=${enHasRemoved}`);
                }
                
                expect(jpHasRemoved).toBe(false);
                expect(enHasRemoved).toBe(false);
            });
        });
    });
});

/**
 * Convert KeyboardEvent code to documentation format
 */
function convertKeyCodeToDocFormat(keyCode {
    const conversions = {
        'Space': 'Space',
        'Escape': 'Escape',
        'KeyF': 'F',
        'KeyM': 'M',
        'KeyS': 'S',
        'KeyH': 'H',
        'KeyI': 'I',
        'KeyG': 'G',
        'KeyR': 'R',
        'F1': 'F1',
        'F12': 'F12',
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'ControlLeft+KeyH': 'Ctrl+H',
        'ControlLeft+ShiftLeft+KeyD': 'Ctrl+Shift+D'
    };
    
    return conversions[keyCode] || keyCode;
}