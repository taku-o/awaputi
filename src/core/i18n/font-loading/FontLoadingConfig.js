export class FontLoadingConfig {
    constructor(customConfig = {}) {
        this.config = this._mergeWithDefaults(customConfig);
        this.listeners = new Set();
        this.validationRules = this._initializeValidationRules();
    }

    _mergeWithDefaults(customConfig) {
        const defaultConfig = {
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
            fontSources: {
                google: {
                    baseUrl: 'https://fonts.googleapis.com/css2',
                    weights: ['400', '500', '700'],
                    display: 'swap'
                },
                local: {
                    fontDirectory: '/fonts',
                    formats: ['woff2', 'woff', 'ttf']
                }
            },
            performance: {
                preloadCommonFonts: true,
                cacheFontResults: true,
                maxCacheSize: 50
            }
        };

        return this._deepMerge(defaultConfig, customConfig);
    }

    _deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    result[key] = this._deepMerge(target[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }

    _initializeValidationRules() {
        return {
            enabledSources: {
                type: 'array',
                allowedValues: ['system', 'google', 'local'],
                required: true
            },
            timeouts: {
                type: 'object',
                properties: {
                    google: { type: 'number', min: 1000, max: 10000 },
                    local: { type: 'number', min: 500, max: 5000 },
                    system: { type: 'number', min: 100, max: 2000 }
                }
            },
            'logging.level': {
                type: 'string',
                allowedValues: ['error', 'warn', 'info', 'debug']
            },
            'logging.maxErrorsPerSource': {
                type: 'number',
                min: 1,
                max: 10
            }
        };
    }

    get(path) {
        return this._getNestedValue(this.config, path);
    }

    set(path, value) {
        const validation = this._validateValue(path, value);
        if (!validation.valid) {
            throw new Error(`Invalid configuration value for ${path}: ${validation.error}`);
        }

        const oldValue = this._getNestedValue(this.config, path);
        this._setNestedValue(this.config, path, value);
        
        this._notifyListeners(path, value, oldValue);
        return true;
    }

    update(updates) {
        const results = {};
        const errors = {};

        for (const [path, value] of Object.entries(updates)) {
            try {
                this.set(path, value);
                results[path] = true;
            } catch (error) {
                errors[path] = error.message;
                results[path] = false;
            }
        }

        if (Object.keys(errors).length > 0) {
            console.warn('[FontLoadingConfig] Some updates failed:', errors);
        }

        return {
            success: Object.values(results).every(r => r),
            results: results,
            errors: errors
        };
    }

    _getNestedValue(obj, path) {
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[key];
        }
        
        return current;
    }

    _setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = obj;
        
        for (const key of keys) {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[lastKey] = value;
    }

    _validateValue(path, value) {
        const rule = this.validationRules[path];
        if (!rule) {
            return { valid: true };
        }

        if (rule.required && (value === null || value === undefined)) {
            return { valid: false, error: 'Value is required' };
        }

        if (rule.type && typeof value !== rule.type) {
            return { valid: false, error: `Expected ${rule.type}, got ${typeof value}` };
        }

        if (rule.allowedValues && !rule.allowedValues.includes(value)) {
            return { valid: false, error: `Value must be one of: ${rule.allowedValues.join(', ')}` };
        }

        if (rule.min !== undefined && value < rule.min) {
            return { valid: false, error: `Value must be at least ${rule.min}` };
        }

        if (rule.max !== undefined && value > rule.max) {
            return { valid: false, error: `Value must be at most ${rule.max}` };
        }

        if (rule.type === 'array' && rule.allowedValues) {
            for (const item of value) {
                if (!rule.allowedValues.includes(item)) {
                    return { valid: false, error: `Array contains invalid value: ${item}` };
                }
            }
        }

        return { valid: true };
    }

    enableSource(sourceName) {
        const enabledSources = this.get('enabledSources') || [];
        if (!enabledSources.includes(sourceName)) {
            this.set('enabledSources', [...enabledSources, sourceName]);
        }
    }

    disableSource(sourceName) {
        const enabledSources = this.get('enabledSources') || [];
        const filtered = enabledSources.filter(source => source !== sourceName);
        this.set('enabledSources', filtered);
    }

    enableDevelopmentMode() {
        this.update({
            'development.verboseLogging': true,
            'logging.level': 'debug',
            'development.disableExternalFonts': false
        });
    }

    enableProductionMode() {
        this.update({
            'development.verboseLogging': false,
            'logging.level': 'warn',
            'development.disableExternalFonts': false,
            'fallbackBehavior.suppressErrors': true
        });
    }

    enableOfflineMode() {
        this.update({
            'enabledSources': ['system', 'local'],
            'development.disableExternalFonts': true,
            'fallbackBehavior.useSystemFonts': true
        });
    }

    addConfigListener(listener) {
        this.listeners.add(listener);
    }

    removeConfigListener(listener) {
        this.listeners.delete(listener);
    }

    _notifyListeners(path, newValue, oldValue) {
        for (const listener of this.listeners) {
            try {
                listener(path, newValue, oldValue);
            } catch (error) {
                console.error('[FontLoadingConfig] Listener error:', error);
            }
        }
    }

    export() {
        return JSON.parse(JSON.stringify(this.config));
    }

    import(configData) {
        try {
            const parsedConfig = typeof configData === 'string' ? JSON.parse(configData) : configData;
            this.config = this._mergeWithDefaults(parsedConfig);
            this._notifyListeners('*', this.config, null);
            return true;
        } catch (error) {
            console.error('[FontLoadingConfig] Import failed:', error);
            return false;
        }
    }

    validate() {
        const errors = [];

        for (const [path, rule] of Object.entries(this.validationRules)) {
            const value = this._getNestedValue(this.config, path);
            const validation = this._validateValue(path, value);
            
            if (!validation.valid) {
                errors.push({
                    path: path,
                    value: value,
                    error: validation.error
                });
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    reset() {
        this.config = this._mergeWithDefaults({});
        this._notifyListeners('*', this.config, null);
    }

    getStats() {
        return {
            enabledSources: this.get('enabledSources').length,
            totalTimeouts: Object.keys(this.get('timeouts')).length,
            developmentMode: this.get('development.verboseLogging'),
            offlineMode: !this.get('enabledSources').includes('google'),
            configSize: JSON.stringify(this.config).length,
            listeners: this.listeners.size
        };
    }
}

// デフォルト設定インスタンス
export const defaultFontLoadingConfig = new FontLoadingConfig();