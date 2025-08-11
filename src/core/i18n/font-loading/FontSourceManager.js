export class FontSourceManager {
    constructor(config = {}) {
        this.config = config;
        this.sources = this._initializeSources();
        this.enabledSources = config.enabledSources || ['system', 'google', 'local'];
        this.sourceAvailability = new Map();
        this.loadAttempts = new Map();
        this.timeouts = config.timeouts || {
            google: 3000,
            local: 1000,
            system: 500
        };
    }

    _initializeSources() {
        return {
            local: new LocalFontSource(this.config),
            google: new GoogleFontSource(this.config),
            system: new SystemFontSource(this.config)
        };
    }

    async loadFromSource(sourceName, fontFamily, options = {}) {
        if (!this.enabledSources.includes(sourceName)) {
            throw new Error(`Font source '${sourceName}' is disabled`);
        }

        const source = this.sources[sourceName];
        if (!source) {
            throw new Error(`Unknown font source: ${sourceName}`);
        }

        const attemptKey = `${sourceName}:${fontFamily}`;
        
        if (this.loadAttempts.has(attemptKey)) {
            const lastAttempt = this.loadAttempts.get(attemptKey);
            const cooldownTime = options.cooldown || 10000;
            
            if (Date.now() - lastAttempt.timestamp < cooldownTime && lastAttempt.failed) {
                throw new Error(`Font loading cooldown active for ${fontFamily} from ${sourceName}`);
            }
        }

        this.loadAttempts.set(attemptKey, {
            timestamp: Date.now(),
            failed: false
        });

        try {
            const result = await this._loadWithTimeout(source, fontFamily, sourceName, options);
            
            this.sourceAvailability.set(sourceName, true);
            return {
                success: true,
                fontFamily: fontFamily,
                source: sourceName,
                loadTime: Date.now() - this.loadAttempts.get(attemptKey).timestamp,
                result: result
            };

        } catch (error) {
            this.loadAttempts.set(attemptKey, {
                timestamp: Date.now(),
                failed: true,
                error: error.message
            });

            this.sourceAvailability.set(sourceName, false);
            
            throw new Error(`Failed to load ${fontFamily} from ${sourceName}: ${error.message}`);
        }
    }

    async _loadWithTimeout(source, fontFamily, sourceName, options) {
        const timeout = options.timeout || this.timeouts[sourceName] || 3000;

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Font loading timeout after ${timeout}ms`));
            }, timeout);

            source.load(fontFamily, options)
                .then(result => {
                    clearTimeout(timeoutId);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    reject(error);
                });
        });
    }

    getAvailableSources() {
        return this.enabledSources.filter(sourceName => {
            const source = this.sources[sourceName];
            return source && source.isAvailable();
        });
    }

    isSourceAvailable(sourceName) {
        if (!this.enabledSources.includes(sourceName)) {
            return false;
        }

        const source = this.sources[sourceName];
        if (!source) {
            return false;
        }

        const lastAvailability = this.sourceAvailability.get(sourceName);
        if (lastAvailability !== undefined) {
            return lastAvailability;
        }

        return source.isAvailable();
    }

    disableSource(sourceName) {
        const index = this.enabledSources.indexOf(sourceName);
        if (index > -1) {
            this.enabledSources.splice(index, 1);
            
            if (this.config.development?.verboseLogging) {
                console.log(`[FontSourceManager] Disabled source: ${sourceName}`);
            }
        }
    }

    enableSource(sourceName) {
        if (!this.enabledSources.includes(sourceName)) {
            this.enabledSources.push(sourceName);
            
            if (this.config.development?.verboseLogging) {
                console.log(`[FontSourceManager] Enabled source: ${sourceName}`);
            }
        }
    }

    getLoadAttemptHistory(sourceName, fontFamily = null) {
        if (fontFamily) {
            const attemptKey = `${sourceName}:${fontFamily}`;
            return this.loadAttempts.get(attemptKey) || null;
        }

        const history = {};
        for (const [key, attempt] of this.loadAttempts.entries()) {
            if (key.startsWith(`${sourceName}:`)) {
                const font = key.substring(sourceName.length + 1);
                history[font] = attempt;
            }
        }

        return history;
    }

    clearLoadHistory(sourceName = null) {
        if (sourceName) {
            const keysToDelete = [];
            for (const key of this.loadAttempts.keys()) {
                if (key.startsWith(`${sourceName}:`)) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(key => this.loadAttempts.delete(key));
        } else {
            this.loadAttempts.clear();
        }
    }

    getStats() {
        const stats = {
            enabledSources: [...this.enabledSources],
            availableSources: this.getAvailableSources(),
            loadAttempts: this.loadAttempts.size,
            sourceAvailability: Object.fromEntries(this.sourceAvailability),
            timeouts: { ...this.timeouts }
        };

        return stats;
    }
}

export class LocalFontSource {
    constructor(config = {}) {
        this.config = config;
        this.fontDirectory = config.fontDirectory || '/fonts';
        this.formats = config.formats || ['woff2', 'woff', 'ttf'];
    }

    async load(fontFamily, options = {}) {
        if (!document.fonts) {
            throw new Error('CSS Font Loading API not supported');
        }

        const fontPath = this._getFontPath(fontFamily, options.format);
        
        if (!await this._checkFontExists(fontPath)) {
            throw new Error(`Font file not found: ${fontPath}`);
        }

        const fontFace = new FontFace(fontFamily, `url('${fontPath}')`);
        
        try {
            await fontFace.load();
            document.fonts.add(fontFace);
            return { loaded: true, path: fontPath };
        } catch (error) {
            throw new Error(`Failed to load local font: ${error.message}`);
        }
    }

    _getFontPath(fontFamily, format = 'woff2') {
        const sanitizedName = fontFamily.replace(/\s+/g, '-').toLowerCase();
        return `${this.fontDirectory}/${sanitizedName}.${format}`;
    }

    async _checkFontExists(fontPath) {
        try {
            const response = await fetch(fontPath, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    isAvailable() {
        return !!document.fonts;
    }
}

export class GoogleFontSource {
    constructor(config = {}) {
        this.config = config;
        this.baseUrl = 'https://fonts.googleapis.com/css2';
        this.weights = config.weights || ['400', '500', '700'];
        this.display = config.display || 'swap';
        this.loadedFonts = new Set();
    }

    async load(fontFamily, options = {}) {
        if (this.loadedFonts.has(fontFamily)) {
            return { loaded: true, cached: true };
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = this._buildFontUrl(fontFamily, options);

        return new Promise((resolve, reject) => {
            link.onload = () => {
                this.loadedFonts.add(fontFamily);
                resolve({ loaded: true, url: link.href });
            };

            link.onerror = () => {
                reject(new Error(`Failed to load Google Font: ${fontFamily}`));
            };

            document.head.appendChild(link);
        });
    }

    _buildFontUrl(fontFamily, options = {}) {
        const family = encodeURIComponent(fontFamily);
        const weights = options.weights || this.weights;
        const display = options.display || this.display;
        
        const weightString = weights.join(';');
        return `${this.baseUrl}?family=${family}:wght@${weightString}&display=${display}`;
    }

    isAvailable() {
        return navigator.onLine !== false;
    }
}

export class SystemFontSource {
    constructor(config = {}) {
        this.config = config;
        this.systemFonts = new Map();
    }

    async load(fontFamily, options = {}) {
        if (!this._isFontAvailable(fontFamily)) {
            throw new Error(`System font not available: ${fontFamily}`);
        }

        this.systemFonts.set(fontFamily, true);
        return { loaded: true, system: true };
    }

    _isFontAvailable(fontName) {
        if (typeof document === 'undefined') {
            return false;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const text = 'abcdefghijklmnopqrstuvwxyz0123456789';
        
        context.font = '72px monospace';
        const baseline = context.measureText(text).width;
        
        context.font = `72px '${fontName}', monospace`;
        const variation = context.measureText(text).width;
        
        return baseline !== variation;
    }

    isAvailable() {
        return typeof document !== 'undefined';
    }
}