/**
 * SettingsValidator
 * 設定値の検証、制約チェック、データ型チェック、範囲検証を担当
 */

// 型定義
export interface SettingsManager { getDefaultSettings(): any;
    getDefaultValue(key: string): any, }
}

export interface ValidationRule { type?: string;
    min?: number;
    max?: number;
    maxLength?: number;
    enum?: any[];
    validator?: (value: any) => boolean;
    properties?: Record<string, ValidationRule>; }
}

export interface ValidationRules { [key: string]: ValidationRule,
    }
}

export interface ValidationResult { isValid: boolean,
    errors?: string[];
    sanitizedValue: any,
    warning?: string | null; }
}

export interface MultipleValidationResult { isValid: boolean,
    errors: string[],
    results: Record<string, ValidationResult>,
    sanitizedSettings: Record<string, any>, }
}

export interface SettingsObjectValidationResult { isValid: boolean,
    errors: string[],
    sanitizedSettings: Record<string, any>, }
}

export interface KeyParseResult { isValid: boolean,
    error?: string;
    key?: string;
    parts?: string[];
    topLevel?: string;
    hasValidationRule?: boolean;
    isNested?: boolean; }
}

export interface AccessibilityValidationResult { isValid: boolean,
    sanitizedValue: AccessibilitySettings,
    error?: string;
    errors?: string[]; }
}

export interface AccessibilitySettings { highContrast: boolean,
    reducedMotion: boolean,
    largeText: boolean,
    screenReader: boolean,
    colorBlindSupport: boolean; }
}

export interface ValidationStats { totalRules: number,
    nestedRules: number,
    supportedTypes: string[],
    supportedLanguages: string[],
    supportedQualities: string[],
    validationFeatures: string[]; }
}

// 列挙型
export type ExpectedType = 'string' | 'number' | 'boolean' | 'object' | 'array';''
export type QualityLevel = 'low' | 'medium' | 'high' | 'auto';''
export type SupportedLanguage = 'ja' | 'en';''
export type SocialPlatform = 'auto' | 'twitter' | 'facebook' | 'native';''
export type ScreenshotQuality = 'low' | 'medium' | 'high';''
export type PrivacyLevel = 'public' | 'friends' | 'private';

export class SettingsValidator {
    private settingsManager: SettingsManager;
    private validationRules: ValidationRules';
'';
    constructor(settingsManager: SettingsManager') {
        this.settingsManager = settingsManager;
        
        // 検証ルール
    }
    }'
        this.validationRules = {' }'
            masterVolume: { type: 'number', min: 0, max: 1 },''
            sfxVolume: { type: 'number', min: 0, max: 1 },''
            bgmVolume: { type: 'number', min: 0, max: 1 },''
            language: { type: 'string', enum: ['ja', 'en'] },''
            quality: { type: 'string', enum: ['low', 'medium', 'high', 'auto'] },'
            accessibility: { ''
                type: 'object',';
                properties: {' }'
                    highContrast: { type: 'boolean' },''
                    reducedMotion: { type: 'boolean' },''
                    largeText: { type: 'boolean' },''
                    screenReader: { type: 'boolean' },''
                    colorBlindSupport: { type: 'boolean' }
                }
            },'
            controls: { ''
                type: 'object',';
                properties: {' }'
                    keyboardEnabled: { type: 'boolean' },''
                    mouseEnabled: { type: 'boolean' },''
                    touchEnabled: { type: 'boolean' }
                }
            },'
            ui: { ''
                type: 'object',';
                properties: {' }'
                    showFPS: { type: 'boolean' },''
                    showDebugInfo: { type: 'boolean' },''
                    animationSpeed: { type: 'number', min: 0.1, max: 3.0 },''
                    uiScale: { type: 'number', min: 0.5, max: 2.0 }
                }
            },'
            social: { ''
                type: 'object',';
                properties: {' }'
                    enableSharing: { type: 'boolean' },''
                    autoPromptHighScore: { type: 'boolean' },''
                    autoPromptAchievements: { type: 'boolean' },''
                    defaultPlatform: { type: 'string', enum: ['auto', 'twitter', 'facebook', 'native'] },''
                    includeScreenshot: { type: 'boolean' },''
                    screenshotQuality: { type: 'string', enum: ['low', 'medium', 'high'] },''
                    privacyLevel: { type: 'string', enum: ['public', 'friends', 'private'] },''
                    customMessage: { type: 'string', maxLength: 280 },''
                    showWatermark: { type: 'boolean' }
                }
            }
        },
    }

    /**
     * 設定値の検証
     * @param key 設定キー
     * @param value 設定値
     * @returns 検証結果'
     */''
    validateSetting(key: string, value: any'): ValidationResult { try {''
            const topLevelKey = key.split('.')[0];
            const rule = this.validationRules[topLevelKey];
            
            if (!rule) { }
                return { isValid: true, sanitizedValue: value }
            }

            return this._validateByRule(value, rule, key);
        } catch (error) { return {  };
                isValid: false, }
                errors: [`Validation error: ${(error as Error}).message}`],
                sanitizedValue: null;
            },
        }
    }

    /**
     * ルールに基づく検証
     * @private
     * @param value 値
     * @param rule ルール
     * @param key キー
     * @returns 検証結果
     */
    private _validateByRule(value: any, rule: ValidationRule, key: string): ValidationResult { const errors: string[] = [],
        let sanitizedValue = value;

        // 型チェック
        if(rule.type && !this._checkType(value, rule.type as ExpectedType) { }'
            errors.push(`Expected ${rule.type}, got ${ typeof value)`);' }'
            sanitizedValue = this._getDefaultForType(rule.type as ExpectedType'});
        }
';
        // 数値の範囲チェック''
        if (rule.type === 'number' && typeof value === 'number') { if (rule.min !== undefined && value < rule.min) { }
                errors.push(`Value ${value} is below minimum ${rule.min)`});
                sanitizedValue = rule.min;
            }'
            if (rule.max !== undefined && value > rule.max) { ' }'
                errors.push(`Value ${value} is above maximum ${rule.max)`'});
                sanitizedValue = rule.max;
            }
        }
';
        // 文字列の長さチェック''
        if (rule.type === 'string' && typeof value === 'string') { if (rule.maxLength !== undefined && value.length > rule.maxLength) { }
                errors.push(`String length ${value.length} exceeds maximum ${ rule.maxLength)`); }
                sanitizedValue = value.substring(0, rule.maxLength});
            }
        }

        // 列挙値チェック'
        if(rule.enum && !rule.enum.includes(value) { ' }'
            errors.push(`Value ${value') is not in allowed values: ${rule.enum.join(', '})}`');
            sanitizedValue = rule.enum[0];
        }
';
        // カスタムバリデーター''
        if(rule.validator && typeof rule.validator === 'function') {
            try {
        }
                if(!rule.validator(value) { }
                    errors.push(`Custom validation failed for value: ${value}`);
                    sanitizedValue = this._getDefaultForType(rule.type as ExpectedType);
                } catch (error) {'
                errors.push(`Custom validator error: ${(error as Error}).message}`);''
                sanitizedValue = this._getDefaultForType(rule.type as ExpectedType');
            }
        }
';
        // オブジェクトのプロパティ検証''
        if(rule.type === 'object' && rule.properties && typeof value === 'object' && value !== null) {
            
        }
            const sanitizedObject = { ...value };
            for(const [propKey, propRule] of Object.entries(rule.properties) { if (propKey in value) { }
                    const propResult = this._validateByRule(value[propKey], propRule, `${key}.${ propKey)`);
                    if (!propResult.isValid) { }
                        errors.push(...(propResult.errors || []}).map(e => `${propKey}: ${e)`)});
                    }
                    sanitizedObject[propKey] = propResult.sanitizedValue;
                }
            }
            sanitizedValue = sanitizedObject;
        }

        return { isValid: errors.length === 0,
            errors, };
            sanitizedValue }
        };
    }

    /**
     * 型チェック
     * @private
     * @param value 値
     * @param expectedType 期待する型
     * @returns 型が正しいか
     */'
    private _checkType(value: any, expectedType: ExpectedType): boolean { ''
        switch(expectedType') {'
            '';
            case 'string':'';
                return typeof value === 'string';''
            case 'number':'';
                return typeof value === 'number' && !isNaN(value');''
            case 'boolean':'';
                return typeof value === 'boolean';''
            case 'object':'';
                return typeof value === 'object' && value !== null && !Array.isArray(value');''
            case 'array':;
                return Array.isArray(value);
        }
            default: return true; }
        }
    }

    /**
     * 型のデフォルト値を取得
     * @private
     * @param type 型
     * @returns デフォルト値
     */'
    private _getDefaultForType(type: ExpectedType): any { ''
        switch(type') {'
            '';
            case 'string':'';
                return '';''
            case 'number':';
                return 0;''
            case 'boolean':';
                return false;'
        }'
            case 'object': }'
                return {};''
            case 'array':;
                return [];
            default: return null;
        }
    }

    /**
     * 複数設定の一括検証
     * @param settings 設定オブジェクト
     * @returns 検証結果
     */
    validateMultiple(settings: Record<string, any>): MultipleValidationResult {
        const results: Record<string, ValidationResult> = {};
        const errors: string[] = [],
        const sanitized: Record<string, any> = {};

        for(const [key, value] of Object.entries(settings) {

            const result = this.validateSetting(key, value);
            results[key] = result;

        }
            if (!result.isValid) { }
                errors.push(...(result.errors || []).map(e => `${key}: ${e)`)});
            }
            sanitized[key] = result.sanitizedValue;
        }

        return { isValid: errors.length === 0,
            errors,
            results, };
            sanitizedSettings: sanitized }
        },
    }

    /**
     * 設定オブジェクト全体の検証
     * @param settingsObject 設定オブジェクト
     * @returns 検証結果'
     */''
    validateSettingsObject(settingsObject: any'): SettingsObjectValidationResult { ''
        if(!settingsObject || typeof settingsObject !== 'object'') {'
            return { isValid: false,''
                errors: ['Settings object must be a valid object'],'';
                sanitizedSettings: this.settingsManager.getDefaultSettings('')';
        const requiredFields = ['masterVolume', 'sfxVolume', 'bgmVolume', 'language'];)
        for (const field of requiredFields) {
        }
            if(!(field in settingsObject) { };
                errors.push(`Required field missing: ${field)`), }
                sanitized[field] = this.settingsManager.getDefaultValue(field});
            }
        }

        // 各設定項目の検証
        for(const [key, value] of Object.entries(settingsObject) {
            const result = this.validateSetting(key, value);
        }
            if (!result.isValid) { }
                errors.push(...(result.errors || []).map(e => `${key}: ${e)`)});
            }
            sanitized[key] = result.sanitizedValue;
        }

        return { isValid: errors.length = == 0 };
            errors, }
            sanitizedSettings: { ...this.settingsManager.getDefaultSettings(), ...sanitized }
        };
    }

    /**
     * ConfigurationManager用の検証ルールを取得
     * @param category カテゴリ
     * @returns 検証ルール'
     */''
    getValidationRulesForCategory(category: string'): Record<string, ValidationRule> { const categoryMappings: Record<string, Record<string, ValidationRule>> = {
            audio: {
                masterVolume: this.validationRules.masterVolume,
                sfxVolume: this.validationRules.sfxVolume,';
                bgmVolume: this.validationRules.bgmVolume,' }'
                isMuted: { type: 'boolean' }
            },'
            ui: { language: { ''
                    type: 'string', '';
                    validator: (value: any') => ['ja', 'en'].includes(value'); }
                },'
                quality: { ''
                    type: 'string', '';
                    validator: (value: any') => ['low', 'medium', 'high', 'auto'].includes(value'); }'
                },''
                showFPS: { type: 'boolean' },''
                showDebugInfo: { type: 'boolean' },''
                animationSpeed: { type: 'number', min: 0.1, max: 3.0 },''
                uiScale: { type: 'number', min: 0.5, max: 2.0 }
            },
            accessibility: this.validationRules.accessibility.properties || {},
            controls: this.validationRules.controls.properties || {},
            social: this.validationRules.social.properties || {}
        },

        return categoryMappings[category] || {};
    }

    /**
     * 設定キーのパースと検証
     * @param key 設定キー
     * @returns パース結果'
     */''
    parseAndValidateKey(key: string'): KeyParseResult { ''
        if (typeof key !== 'string' || !key.trim()') {'
            return { isValid: false,' };'
                error: 'Setting key must be a non-empty string' }
            },
        }'
'';
        const cleanKey = key.trim('')';
        const parts = cleanKey.split('.');'
        '';
        if (parts.length === 0 || parts.some(part => !part)') { return { isValid: false,' };'
                error: 'Invalid setting key format' }
            },
        }

        const topLevel = parts[0];
        const hasRule = this.validationRules.hasOwnProperty(topLevel);

        return { isValid: true,
            key: cleanKey,
            parts,
            topLevel,
            hasValidationRule: hasRule, };
            isNested: parts.length > 1 }
        },
    }

    /**
     * システム言語の検証
     * @param language 言語コード
     * @returns 検証結果'
     */''
    validateSystemLanguage(language: string'): ValidationResult { ''
        const supportedLanguages: SupportedLanguage[] = ['ja', 'en'];''
        const defaultLanguage: SupportedLanguage = 'en',';
'';
        if(!language || typeof language !== 'string'') {
            return { isValid: false,
        }'
                sanitizedValue: defaultLanguage,' };'
                errors: ['Language must be a string'] }
            },
        }

        const normalizedLang = language.toLowerCase().substring(0, 2) as SupportedLanguage;'
        '';
        if (supportedLanguages.includes(normalizedLang)') { return { isValid: true, };
                sanitizedValue: normalizedLang }
            },
        }

        return { isValid: false, };'
            sanitizedValue: defaultLanguage,' }'
            errors: [`Unsupported language: ${language}. Supported: ${supportedLanguages.join(', '})}`]
        };
    }

    /**
     * 品質設定の検証
     * @param quality 品質設定
     * @returns 検証結果'
     */''
    validateQuality(quality: string'): ValidationResult { ''
        const supportedQualities: QualityLevel[] = ['low', 'medium', 'high', 'auto'];''
        const defaultQuality: QualityLevel = 'auto',';
'';
        if(!quality || typeof quality !== 'string'') {
            return { isValid: false,
        }'
                sanitizedValue: defaultQuality,' };'
                errors: ['Quality must be a string'] }
            },
        }

        const normalizedQuality = quality.toLowerCase() as QualityLevel;'
        '';
        if (supportedQualities.includes(normalizedQuality)') { return { isValid: true };
                sanitizedValue: normalizedQuality }
            },
        }

        return { isValid: false, };'
            sanitizedValue: defaultQuality,' }'
            errors: [`Invalid quality: ${quality}. Supported: ${supportedQualities.join(', '})}`]
        };
    }

    /**
     * アクセシビリティ設定の検証
     * @param accessibility アクセシビリティ設定
     * @returns 検証結果'
     */''
    validateAccessibility(accessibility: any'): AccessibilityValidationResult { ''
        if(!accessibility || typeof accessibility !== 'object'') {
            return { isValid: false,
                sanitizedValue: {
                    highContrast: false,
                    reducedMotion: false,
                    largeText: false,
        }
                    screenReader: false, };
                    colorBlindSupport: false }'
                },''
                error: 'Accessibility settings must be an object';
            },
        }

        const sanitized: AccessibilitySettings = { highContrast: false,
            reducedMotion: false,
            largeText: false,
            screenReader: false,
            colorBlindSupport: false }
        },'
        const errors: string[] = [],'';
        const booleanFields: (keyof AccessibilitySettings')[] = ['highContrast', 'reducedMotion', 'largeText', 'screenReader', 'colorBlindSupport'];

        for(const field of booleanFields) {
';
            '';
            if (field in accessibility') {''
                if (typeof accessibility[field] === 'boolean') {

        }
                    sanitized[field] = accessibility[field]; }'
                } else { sanitized[field] = false;' }'
                    errors.push(`${field} must be boolean, got ${typeof accessibility[field])`'});
                }
            } else { sanitized[field] = false; }
            }
        }

        return { isValid: errors.length === 0,
            sanitizedValue: sanitized, };
            errors }
        };
    }

    /**
     * ボリューム値の検証
     * @param volume ボリューム値
     * @param type ボリュームタイプ
     * @returns 検証結果'
     */''
    validateVolume(volume: number, type: string = 'volume''): ValidationResult { ''
        if(typeof volume !== 'number' || isNaN(volume) {
            
        }
            return { isValid: false, };
                sanitizedValue: 0.7, }
                errors: [`${type} must be a number`]
            },
        }

        const clampedVolume = Math.max(0, Math.min(1, volume);
        
        return { isValid: volume = == clampedVolume };
            sanitizedValue: clampedVolume, }
            warning: volume !== clampedVolume ? `${type} clamped to valid range [0, 1]` : null
        };
    }

    /**
     * 検証統計情報の取得
     * @returns 検証統計
     */'
    getValidationStats(): ValidationStats { return { totalRules: Object.keys(this.validationRules).length,''
            nestedRules: Object.values(this.validationRules')'';
                .filter(rule => rule.type === 'object' && rule.properties)'';
                .reduce((sum, rule) => sum + Object.keys(rule.properties || {).length, 0'),''
            supportedTypes: ['string', 'number', 'boolean', 'object', 'array'],'';
            supportedLanguages: ['ja', 'en'],'';
            supportedQualities: ['low', 'medium', 'high', 'auto'],';
            validationFeatures: ['';
                'Type checking','';
                'Range validation','';
                'Enum validation', '';
                'Custom validators','';
                'Object property validation','';
                'String length limits',']';
                'Required field checking'] };
            ] }
        };'
    }''
}