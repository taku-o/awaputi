import { FontSourceManager } from './FontSourceManager.js';''
import { FontFallbackHandler } from './FontFallbackHandler.js';''
import { FontErrorHandler, FontErrorConfig } from './FontErrorHandler.js';

// 型定義
export interface FontLoadingConfig extends FontErrorConfig { enabledSources: string[],
    timeouts: {
        google: number,
        local: number,
        system: number }
    },
    fallbackBehavior: { useSystemFonts: boolean,
        suppressErrors: boolean,
        maxRetries: number }
    },
    logging: { level: string,
        suppressRepeated: boolean,
        maxErrorsPerSource: number }
    },
    development: { disableExternalFonts: boolean,
        verboseLogging: boolean; }
    };
}

export interface FontLoadResult { success: boolean,
    fontFamily: string,
    source: string,
    fallbackUsed: boolean,
    loadTime: number,
    error?: Error | null;
    cached?: boolean;
    originalFont?: string; }
}
';
export interface FontLoadOptions { ''
    priority?: 'high' | 'normal' | 'low';
    timeout?: number;
    retries?: number; }
}

export interface ApplyElementResults { total: number,
    successful: number,
    failed: number; }
}

export class FontLoadingManager {
    private static _instance: FontLoadingManager | null = null,
    
    private config: FontLoadingConfig;
    private sourceManager: FontSourceManager;
    private fallbackHandler: FontFallbackHandler;
    private errorHandler: FontErrorHandler;
    private loadAttempts: Map<string, Promise<FontLoadResult>>;
    private failedSources: Set<string>;
    private successfulLoads: Set<string>;
    private initialized: boolean;
    private globalErrorHandler: any;
    private errorIntegration: any;
    static getInstance(config: Partial<FontLoadingConfig> = {), globalErrorHandler: any = null): FontLoadingManager {
        if(!FontLoadingManager._instance) {
            
        }
            FontLoadingManager._instance = new FontLoadingManager(config, globalErrorHandler); }
        }
        return FontLoadingManager._instance;
    }
    
    constructor(config: Partial<FontLoadingConfig> = { ), globalErrorHandler: any = null) {
        this.config = this._mergeWithDefaults(config);
        this.sourceManager = new FontSourceManager(this.config);
        this.fallbackHandler = new FontFallbackHandler(this.config);
        this.errorHandler = new FontErrorHandler(this.config);
        
        this.loadAttempts = new Map<string, Promise<FontLoadResult>>();
        this.failedSources = new Set<string>();
        this.successfulLoads = new Set<string>();
        this.initialized = false;

        // ErrorHandler統合の設定
        this.globalErrorHandler = globalErrorHandler;
        this.errorIntegration = null;
        
        if(globalErrorHandler) {
        
            
        
        }
            this._setupErrorIntegration(); }
        }
    }'
    '';
    private async _setupErrorIntegration('')';
            const { FontErrorIntegration } = await import('./FontErrorIntegration.js');
            this.errorIntegration = new FontErrorIntegration(this.globalErrorHandler, this.errorHandler);
            
            if(this.errorIntegration.initialize() {
            ';
                '';
                if (this.config.development? .verboseLogging') {'
            
            }'
                    console.log('[FontLoadingManager] ErrorHandler integration initialized''); }
                }'
            } else {  ''
                console.warn('[FontLoadingManager] ErrorHandler integration failed to initialize'); }'
                this.errorIntegration = null;' }'
            } catch (error') { : undefined''
            console.warn('[FontLoadingManager] Failed to setup ErrorHandler integration:', error);
            this.errorIntegration = null; }
        }
    }'
'';
    private _mergeWithDefaults(config: Partial<FontLoadingConfig>'): FontLoadingConfig { return { ''
            enabledSources: ['system', 'google', 'local'],
            timeouts: {
                google: 3000,
                local: 1000, };
                system: 500 }
            },
            fallbackBehavior: { useSystemFonts: true,
                suppressErrors: true,
                maxRetries: 1 }
            },'
            logging: { ''
                level: 'warn',
                suppressRepeated: true,
                maxErrorsPerSource: 3 }
            },
            development: { disableExternalFonts: false,
                verboseLogging: false }
            },
            ...config;
        };
    }

    async initialize(): Promise<void> { if (this.initialized) {
            return; }
        }

        try { // Check source availability
            const availableSources = this.sourceManager.getAvailableSources();'
            '';
            if(this.config.development? .verboseLogging') {'
                : undefined';
            }'
                console.log('[FontLoadingManager] Available sources:', availableSources); }
            }'
'';
            if(availableSources.length === 0') {'
                ';
            }'
                console.warn('[FontLoadingManager] No font sources available'); }
            }

            this.initialized = true;'
'';
        } catch (error') { this.errorHandler.handleFontError(error as Error, {')'
                source: 'manager' as any,')';
                fontFamily: 'initialization'),' }'
            }');
            
            // Continue with fallback behavior
            this.initialized = true;
        }
    }'
'';
    async loadFont(fontFamily: string, language: string = 'default', options: FontLoadOptions = { ): Promise<FontLoadResult> {
        if(!this.initialized) {
            
        }
            await this.initialize(); }
        }

        const loadKey = `${fontFamily}:${language}`;'
        '';
        if (this.successfulLoads.has(loadKey)') { return { success: true,'
                fontFamily: fontFamily,'';
                source: 'cached',
                fallbackUsed: false,
                loadTime: 0, };
                cached: true }
            },
        }

        if(this.loadAttempts.has(loadKey) { return await this.loadAttempts.get(loadKey)!; }
        }

        const loadPromise = this._performFontLoad(fontFamily, language, options);
        this.loadAttempts.set(loadKey, loadPromise);

        try { const result = await loadPromise;
            if(result.success) {
                
            }
                this.successfulLoads.add(loadKey); }
            }
            return result;
        } finally { this.loadAttempts.delete(loadKey); }
        }
    }

    private async _performFontLoad(fontFamily: string, language: string, options: FontLoadOptions): Promise<FontLoadResult> { const startTime = Date.now();
        const availableSources = this.sourceManager.getAvailableSources();
        
        for (const sourceName of availableSources) { }
            if (this.failedSources.has(`${sourceName}:${fontFamily)`)}) { continue; }
            }

            try { const result = await this.sourceManager.loadFromSource(sourceName, fontFamily, options);
                
                return { success: true,
                    fontFamily: fontFamily,
                    source: sourceName,
                    fallbackUsed: false,
                    loadTime: Date.now() - startTime, };
                    error: null }
                },

            } catch (error) { const context = {
                    source: sourceName as any,
                    fontFamily: fontFamily; }
                };

                this.errorHandler.handleFontError(error as Error, context);
                this.failedSources.add(`${sourceName}:${ fontFamily)`);
                 }
                if (this.config.development? .verboseLogging}) { : undefined }
                    console.warn(`[FontLoadingManager] Failed to load ${fontFamily} from ${sourceName):`, (error as Error).message});
                }
            }
        }

        // All sources failed, apply fallback
        return this._applyFallbackStrategy(fontFamily, language, startTime);
    }
';
    private _applyFallbackStrategy(fontFamily: string, language: string, startTime: number): FontLoadResult { ''
        if(!this.config.fallbackBehavior.useSystemFonts') {
            return { success: false,'
                fontFamily: fontFamily,'';
                source: 'none',';
                fallbackUsed: false,';
        }'
                loadTime: Date.now('') };'
                error: new Error('All font sources failed and fallback disabled'); }
            };
        }
';
        try { ''
            const fallbackFont = this.fallbackHandler.getSystemFontForLanguage(language');
            
            return { success: true,'
                fontFamily: fallbackFont,'';
                source: 'fallback',
                fallbackUsed: true,
                loadTime: Date.now() - startTime,
                error: null, };
                originalFont: fontFamily }
            },'
'';
        } catch (error') { this.errorHandler.handleFontError(error as Error, {')'
                source: 'fallback' as any,)';
                fontFamily: fontFamily),' }'
            }');

            return { success: false,'
                fontFamily: fontFamily,'';
                source: 'fallback',
                fallbackUsed: false,
                loadTime: Date.now() - startTime, };
                error: error as Error }
            },
        }
    }

    getFallbackFont(fontFamily: string, language: string): string { return this.fallbackHandler.getSystemFontForLanguage(language); }
    }

    isSourceAvailable(sourceName: string): boolean { return this.sourceManager.isSourceAvailable(sourceName); }
    }

    async applyFontToElement(element: HTMLElement, fontFamily: string, language: string, options: FontLoadOptions = { ): Promise<boolean>,
        try {
            const result = await this.loadFont(fontFamily, language, options);
            
            if(result.success) {
            
                if (result.fallbackUsed) {
            
            }
                    this.fallbackHandler.applyFallback(element, language, fontFamily); }
                } else { element.style.fontFamily = fontFamily; }
                }
                
                return true;
            } else {  // Apply fallback even if loading failed
                this.fallbackHandler.applyFallback(element, language, fontFamily); }'
                return false;' }'
            } catch (error') { this.errorHandler.handleFontError(error as Error, {')'
                source: 'element' as any,);
                fontFamily: fontFamily); }
            });

            this.fallbackHandler.applyFallback(element, language, fontFamily);
            return false;
        }
    }

    async applyFontToElements(selector: string, fontFamily: string, language: string, options: FontLoadOptions = { ): Promise<ApplyElementResults>,
        const elements = document.querySelectorAll(selector);
        const promises = Array.from(elements).map(element => );
            this.applyFontToElement(element as HTMLElement, fontFamily, language, options);'
'';
        const results = await Promise.allSettled(promises');''
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

        return { total: elements.length,
            successful: successCount, };
            failed: elements.length - successCount }
        },
    }

    enableSource(sourceName: string): void { this.sourceManager.enableSource(sourceName);
        this.failedSources.clear(); }
    }

    disableSource(sourceName: string): void { this.sourceManager.disableSource(sourceName); }
    }

    clearCaches(): void { this.loadAttempts.clear();
        this.failedSources.clear();
        this.successfulLoads.clear();
        this.sourceManager.clearLoadHistory();
        this.fallbackHandler.clearFallbackHistory();
        this.errorHandler.clearErrorHistory(); }
    }

    getStats(): any { return { manager: {
                initialized: this.initialized,
                successfulLoads: this.successfulLoads.size,
                failedSources: this.failedSources.size, };
                activeAttempts: this.loadAttempts.size }
            },
            sources: this.sourceManager.getStats(),
            fallbacks: this.fallbackHandler.getStats(),
            errors: this.errorHandler.getErrorStats(),
            config: { enabledSources: this.config.enabledSources,
                timeouts: this.config.timeouts,
                fallbackBehavior: this.config.fallbackBehavior }
            }
        },
    }

    updateConfig(newConfig: Partial<FontLoadingConfig>): void { this.config = this._mergeWithDefaults({ ...this.config, ...newConfig );
        
        // Update child components
        this.sourceManager.enabledSources = this.config.enabledSources;
        this.sourceManager.timeouts = this.config.timeouts;'
'';
        if(this.config.development? .verboseLogging') {'
            : undefined';
        }'
            console.log('[FontLoadingManager] Configuration updated:', this.config'); }
        }
    }'
'';
    async preloadFonts(fontList: string[], language: string = 'default'): Promise<FontLoadResult[]> { const results = [];
        
        for(const fontFamily of fontList) {
        
            try {
                const result = await this.loadFont(fontFamily, language);
                results.push(result);
                
        
        }
                if (this.config.development? .verboseLogging) { : undefined }'
                    console.log(`[FontLoadingManager] Preloaded ${fontFamily}: ${result.success)`});''
                } catch (error') { results.push({
                    success: false,';
                    fontFamily: fontFamily,'';
                    source: 'error',);
                    fallbackUsed: false);
                    loadTime: 0,);
                    error: error as Error); }
                });
            }
        }

        return results;
    }

    dispose(): void { this.clearCaches();
        this.initialized = false;'
        '';
        if(this.config.development? .verboseLogging') {'
            ';
        }'
            console.log('[FontLoadingManager] Disposed''); }
        }'
    }''
} : undefined