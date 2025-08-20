/**
 * FontLoadingConfig.ts
 * フォント読み込み設定管理クラス
 */

// 型定義
export interface FontLoadingConfigData {
    enabledSources: string[];
    timeouts: {
        google: number;
        local: number;
        system: number;
    };
    fallbackBehavior: {
        useSystemFonts: boolean;
        suppressErrors: boolean;
        maxRetries: number;
    };
    logging: {
        level: string;
        suppressRepeated: boolean;
        maxErrorsPerSource: number;
    };
    development: {
        disableExternalFonts: boolean;
        verboseLogging: boolean;
    };
    fontSources: {
        google: {
            baseUrl: string;
            weights: string[];
            display: string;
        };
        local: {
            fontDirectory: string;
            formats: string[];
        };
    };
    performance: {
        preloadCommonFonts: boolean;
        cacheFontResults: boolean;
        maxCacheSize: number;
    };
}

export type ConfigChangeListener = (config: FontLoadingConfigData) => void;

/**
 * フォント読み込み設定管理クラス
 */
export class FontLoadingConfig {
    private config: FontLoadingConfigData;
    private listeners: Set<ConfigChangeListener>;
    private validationRules: Map<string, (value as any) => boolean>;

    constructor(customConfig: Partial<FontLoadingConfigData> = {}) {
        this.config = this._mergeWithDefaults(customConfig);
        this.listeners = new Set<ConfigChangeListener>();
        this.validationRules = this._initializeValidationRules();
    }

    private _mergeWithDefaults(customConfig: Partial<FontLoadingConfigData>): FontLoadingConfigData {
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

    private _deepMerge(target: any, source: any): any {
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

    private _initializeValidationRules(): Map<string, any> {
        return new Map([
            ['enabledSources', {
                type: 'array',
                allowedValues: ['system', 'google', 'local'],
                required: true
            }],
            ['timeouts', {
                type: 'object',
                properties: {
                    google: { type: 'number', min: 1000, max: 10000 },
                    local: { type: 'number', min: 500, max: 5000 },
                    system: { type: 'number', min: 100, max: 2000 }
                }
            }],
            ['logging.level', {
                type: 'string',
                allowedValues: ['error', 'warn', 'info', 'debug']
            }],
            ['logging.maxErrorsPerSource', {
                type: 'number',
                min: 1,
                max: 10
            }]
        ]);
    }

    get(path: string): any {
        return this._getNestedValue(this.config, path);
    }

    set(path: string, value: any): boolean {
        const validation = this._validateValue(path, value);
        if (!validation.valid) {
            throw new Error(`Invalid configuration value for ${path}: ${validation.error}`);
        }

        const oldValue = this._getNestedValue(this.config, path);
        this._setNestedValue(this.config, path, value);
        
        this._notifyListeners(path, value, oldValue);
        return true;
    }

    update(updates: Record<string, any>): { success: boolean; results: Record<string, boolean>; errors: Record<string, string> } {
        const results: Record<string, boolean> = {};
        const errors: Record<string, string> = {};

        for (const [path, value] of Object.entries(updates)) {
            try {
                this.set(path, value);
                results[path] = true;
            } catch (error) {
                errors[path] = (error as Error).message;
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

    private _getNestedValue(obj: any, path: string): any {
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

    private _setNestedValue(obj: any, path: string, value: any): void {
        const keys = path.split('.');
        const lastKey = keys.pop()!;
        let current = obj;
        
        for (const key of keys) {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[lastKey] = value;
    }

    private _validateValue(path: string, value: any): { valid: boolean; error?: string } {
        const rule = this.validationRules.get(path);
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

    enableSource(sourceName: string): void {
        const enabledSources = this.get('enabledSources') || [];
        if (!enabledSources.includes(sourceName)) {
            this.set('enabledSources', [...enabledSources, sourceName]);
        }
    }

    disableSource(sourceName: string): void {
        const enabledSources = this.get('enabledSources') || [];
        const filtered = enabledSources.filter((source: string) => source !== sourceName);
        this.set('enabledSources', filtered);
    }

    enableDevelopmentMode(): void {
        this.update({
            'development.verboseLogging': true,
            'logging.level': 'debug',
            'development.disableExternalFonts': false
        });
    }

    enableProductionMode(): void {
        this.update({
            'development.verboseLogging': false,
            'logging.level': 'warn',
            'development.disableExternalFonts': false,
            'fallbackBehavior.suppressErrors': true
        });
    }

    enableOfflineMode(): void {
        this.update({
            'enabledSources': ['system', 'local'],
            'development.disableExternalFonts': true,
            'fallbackBehavior.useSystemFonts': true
        });
    }

    addConfigListener(listener: ConfigChangeListener): void {
        this.listeners.add(listener);
    }

    removeConfigListener(listener: ConfigChangeListener): void {
        this.listeners.delete(listener);
    }

    private _notifyListeners(path: string, newValue: any, oldValue: any): void {
        for (const listener of this.listeners) {
            try {
                listener(this.config);
            } catch (error) {
                console.error('[FontLoadingConfig] Listener error:', error);
            }
        }
    }

    export(): FontLoadingConfigData {
        return JSON.parse(JSON.stringify(this.config));
    }

    import(configData: string | FontLoadingConfigData): boolean {
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

    validate(): { valid: boolean; errors: Array<{ path: string; value: any; error: string }> } {
        const errors: Array<{ path: string; value: any; error: string }> = [];

        for (const [path, rule] of this.validationRules) {
            const value = this._getNestedValue(this.config, path);
            const validation = this._validateValue(path, value);
            
            if (!validation.valid) {
                errors.push({
                    path: path,
                    value: value,
                    error: validation.error!
                });
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    reset(): void {
        this.config = this._mergeWithDefaults({});
        this._notifyListeners('*', this.config, null);
    }

    getStats(): {
        enabledSources: number;
        totalTimeouts: number;
        developmentMode: boolean;
        offlineMode: boolean;
        configSize: number;
        listeners: number;
    } {
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