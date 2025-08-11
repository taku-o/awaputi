import { FontSourceManager } from './FontSourceManager.js';
import { FontFallbackHandler } from './FontFallbackHandler.js';
import { FontErrorHandler } from './FontErrorHandler.js';

export class FontLoadingManager {
    constructor(config = {}) {
        this.config = this._mergeWithDefaults(config);
        this.sourceManager = new FontSourceManager(this.config);
        this.fallbackHandler = new FontFallbackHandler(this.config);
        this.errorHandler = new FontErrorHandler(this.config);
        
        this.loadAttempts = new Map();
        this.failedSources = new Set();
        this.successfulLoads = new Set();
        this.initialized = false;
    }

    _mergeWithDefaults(config) {
        return {
            enabledSources: ['system', 'google', 'local'],
            timeouts: {
                google: 3000,
                local: 1000,
                system: 500
            },
            fallbackBehavior: {
                useSystemFonts: true,
                suppressErrors: true,
                maxRetries: 1
            },
            logging: {
                level: 'warn',
                suppressRepeated: true,
                maxErrorsPerSource: 3
            },
            development: {
                disableExternalFonts: false,
                verboseLogging: false
            },
            ...config
        };
    }

    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            // Check source availability
            const availableSources = this.sourceManager.getAvailableSources();
            
            if (this.config.development?.verboseLogging) {
                console.log('[FontLoadingManager] Available sources:', availableSources);
            }

            if (availableSources.length === 0) {
                console.warn('[FontLoadingManager] No font sources available');
            }

            this.initialized = true;

        } catch (error) {
            this.errorHandler.handleFontError(error, {
                source: 'manager',
                fontFamily: 'initialization',
                operation: 'initialize'
            });
            
            // Continue with fallback behavior
            this.initialized = true;
        }
    }

    async loadFont(fontFamily, language = 'default', options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const loadKey = `${fontFamily}:${language}`;
        
        if (this.successfulLoads.has(loadKey)) {
            return {
                success: true,
                fontFamily: fontFamily,
                source: 'cached',
                fallbackUsed: false,
                loadTime: 0,
                cached: true
            };
        }

        if (this.loadAttempts.has(loadKey)) {
            return await this.loadAttempts.get(loadKey);
        }

        const loadPromise = this._performFontLoad(fontFamily, language, options);
        this.loadAttempts.set(loadKey, loadPromise);

        try {
            const result = await loadPromise;
            if (result.success) {
                this.successfulLoads.add(loadKey);
            }
            return result;
        } finally {
            this.loadAttempts.delete(loadKey);
        }
    }

    async _performFontLoad(fontFamily, language, options) {
        const startTime = Date.now();
        const availableSources = this.sourceManager.getAvailableSources();
        
        for (const sourceName of availableSources) {
            if (this.failedSources.has(`${sourceName}:${fontFamily}`)) {
                continue;
            }

            try {
                const result = await this.sourceManager.loadFromSource(sourceName, fontFamily, options);
                
                return {
                    success: true,
                    fontFamily: fontFamily,
                    source: sourceName,
                    fallbackUsed: false,
                    loadTime: Date.now() - startTime,
                    error: null
                };

            } catch (error) {
                const context = {
                    source: sourceName,
                    fontFamily: fontFamily,
                    language: language
                };

                this.errorHandler.handleFontError(error, context);
                this.failedSources.add(`${sourceName}:${fontFamily}`);
                
                if (this.config.development?.verboseLogging) {
                    console.warn(`[FontLoadingManager] Failed to load ${fontFamily} from ${sourceName}:`, error.message);
                }
            }
        }

        // All sources failed, apply fallback
        return this._applyFallbackStrategy(fontFamily, language, startTime);
    }

    _applyFallbackStrategy(fontFamily, language, startTime) {
        if (!this.config.fallbackBehavior.useSystemFonts) {
            return {
                success: false,
                fontFamily: fontFamily,
                source: 'none',
                fallbackUsed: false,
                loadTime: Date.now() - startTime,
                error: new Error('All font sources failed and fallback disabled')
            };
        }

        try {
            const fallbackFont = this.fallbackHandler.getSystemFontForLanguage(language);
            
            return {
                success: true,
                fontFamily: fallbackFont,
                source: 'fallback',
                fallbackUsed: true,
                loadTime: Date.now() - startTime,
                error: null,
                originalFont: fontFamily
            };

        } catch (error) {
            this.errorHandler.handleFontError(error, {
                source: 'fallback',
                fontFamily: fontFamily,
                language: language
            });

            return {
                success: false,
                fontFamily: fontFamily,
                source: 'fallback',
                fallbackUsed: false,
                loadTime: Date.now() - startTime,
                error: error
            };
        }
    }

    getFallbackFont(fontFamily, language) {
        return this.fallbackHandler.getSystemFontForLanguage(language);
    }

    isSourceAvailable(sourceName) {
        return this.sourceManager.isSourceAvailable(sourceName);
    }

    async applyFontToElement(element, fontFamily, language, options = {}) {
        try {
            const result = await this.loadFont(fontFamily, language, options);
            
            if (result.success) {
                if (result.fallbackUsed) {
                    this.fallbackHandler.applyFallback(element, language, fontFamily);
                } else {
                    element.style.fontFamily = fontFamily;
                }
                
                return true;
            } else {
                // Apply fallback even if loading failed
                this.fallbackHandler.applyFallback(element, language, fontFamily);
                return false;
            }

        } catch (error) {
            this.errorHandler.handleFontError(error, {
                source: 'element',
                fontFamily: fontFamily,
                language: language
            });

            this.fallbackHandler.applyFallback(element, language, fontFamily);
            return false;
        }
    }

    async applyFontToElements(selector, fontFamily, language, options = {}) {
        const elements = document.querySelectorAll(selector);
        const promises = Array.from(elements).map(element => 
            this.applyFontToElement(element, fontFamily, language, options)
        );

        const results = await Promise.allSettled(promises);
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

        return {
            total: elements.length,
            successful: successCount,
            failed: elements.length - successCount
        };
    }

    enableSource(sourceName) {
        this.sourceManager.enableSource(sourceName);
        this.failedSources.clear();
    }

    disableSource(sourceName) {
        this.sourceManager.disableSource(sourceName);
    }

    clearCaches() {
        this.loadAttempts.clear();
        this.failedSources.clear();
        this.successfulLoads.clear();
        this.sourceManager.clearLoadHistory();
        this.fallbackHandler.clearFallbackHistory();
        this.errorHandler.clearErrorHistory();
    }

    getStats() {
        return {
            manager: {
                initialized: this.initialized,
                successfulLoads: this.successfulLoads.size,
                failedSources: this.failedSources.size,
                activeAttempts: this.loadAttempts.size
            },
            sources: this.sourceManager.getStats(),
            fallbacks: this.fallbackHandler.getStats(),
            errors: this.errorHandler.getErrorStats(),
            config: {
                enabledSources: this.config.enabledSources,
                timeouts: this.config.timeouts,
                fallbackBehavior: this.config.fallbackBehavior
            }
        };
    }

    updateConfig(newConfig) {
        this.config = this._mergeWithDefaults({ ...this.config, ...newConfig });
        
        // Update child components
        this.sourceManager.enabledSources = this.config.enabledSources;
        this.sourceManager.timeouts = this.config.timeouts;

        if (this.config.development?.verboseLogging) {
            console.log('[FontLoadingManager] Configuration updated:', this.config);
        }
    }

    async preloadFonts(fontList, language = 'default') {
        const results = [];
        
        for (const fontFamily of fontList) {
            try {
                const result = await this.loadFont(fontFamily, language);
                results.push(result);
                
                if (this.config.development?.verboseLogging) {
                    console.log(`[FontLoadingManager] Preloaded ${fontFamily}: ${result.success}`);
                }
            } catch (error) {
                results.push({
                    success: false,
                    fontFamily: fontFamily,
                    error: error
                });
            }
        }

        return results;
    }

    dispose() {
        this.clearCaches();
        this.initialized = false;
        
        if (this.config.development?.verboseLogging) {
            console.log('[FontLoadingManager] Disposed');
        }
    }
}