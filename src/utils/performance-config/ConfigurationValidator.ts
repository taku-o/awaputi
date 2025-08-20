/**
 * ConfigurationValidator - Configuration validation and verification functionality
 * Part of the PerformanceConfigurationIntegration split implementation
 */

// Validation interfaces
interface ValidationRule { type: 'number' | 'boolean' | 'string',
    constraints?: ValidationConstraints
    }
}

interface ValidationConstraints { min?: number;
    max?: number;
    enum?: string[]; }
}

interface ValidationResult { valid: boolean,
    warnings?: string[];
    errors?: ValidationError[];
    }
}

interface ValidationError { key: string,
    error: string }
}

interface FileValidationResult { valid: boolean,
    file: string,
    timestamp: number,
    issues?: ValidationIssue[];
    error?: string; }
}

interface ValidationIssue { type: string,'
    message: string,'';
    severity?: 'error' | 'warning'; }
}

interface CategoryValidationResult { valid: boolean,
    category: string,
    issues: ValidationIssue[],
    warnings: string[],
    result?: SubValidationResult
    }
}

interface SubValidationResult { valid: boolean,
    issues: ValidationIssue[]
    }
}

interface ValidatorStatus { rulesCount: number,
    validatorsCount: number,
    strictMode: boolean,
    supportedTypes: string[] }
}

interface ValidatorConfig { strictMode?: boolean;
    customRules?: Record<string, ValidationRule>; }
}

interface MainController { [key: string]: any, }
}

// Validator function type
type ValidatorFunction = (value: any, constraints: ValidationConstraints) => void;

export class ConfigurationValidator {
    private mainController: MainController;
    private validators: Map<string, ValidatorFunction>;
    private rules: Map<string, ValidationRule>;
    private strictMode: boolean;
    constructor(mainController: MainController) {

        this.mainController = mainController;
        this.validators = new Map<string, ValidatorFunction>();''
        this.rules = new Map<string, ValidationRule>(');
        this.strictMode = false;'
        ';
    }'
    }'
        console.log('[ConfigurationValidator] Validator component initialized'); }
    }
    
    /**
     * Initialize validator components
     */'
    async initialize(): Promise<void> { this.setupValidators();''
        this.setupValidationRules()';
        console.log('[ConfigurationValidator] All validation components initialized'); }
    }
    
    /**
     * Setup basic validators'
     */''
    private setupValidators()';
        this.validators.set('number', (value: any, constraints: ValidationConstraints') => {  ''
            if (typeof value !== 'number'') throw new Error('Value must be a number'); }
            if (constraints.min !== undefined && value < constraints.min) { }
                throw new Error(`Value must be >= ${constraints.min}`);
            }
            if(constraints.max !== undefined && value > constraints.max) {
                
            }
                throw new Error(`Value must be <= ${constraints.max)`});'
            }''
        }');'
'';
        this.validators.set('boolean', (value: any, constraints: ValidationConstraints') => {  ' }'
            if (typeof value !== 'boolean'') throw new Error('Value must be a boolean');' }'
        }');'
'';
        this.validators.set('string', (value: any, constraints: ValidationConstraints') => {  ''
            if (typeof value !== 'string'') throw new Error('Value must be a string');' }'
            if (constraints.enum && !constraints.enum.includes(value)') {' }'
                throw new Error(`Value must be one of: ${constraints.enum.join(', '})}`);
            }
        });
    }
    
    /**'
     * Setup validation rules for different configuration categories'
     */''
    private setupValidationRules(''';
        this.rules.set('frameStabilization.targetFPS', { ')'
            type: 'number',') }'
            constraints: { min: 10, max: 120 })');'
'';
        this.rules.set('frameStabilization.minFPS', { ')'
            type: 'number',') }'
            constraints: { min: 1, max: 60 })');'
'';
        this.rules.set('frameStabilization.enabled', { ')'
            type: 'boolean')'),';
'';
        this.rules.set('frameStabilization.adaptiveTargeting', {')'
            type: 'boolean')'),';
'';
        this.rules.set('frameStabilization.stabilityThreshold', {')'
            type: 'number',') }'
            constraints: { min: 1, max: 20 })');
';
        // メモリ管理設定の検証ルール
        this.rules.set('memoryManagement.maxUsage', { ')'
            type: 'number',') }'
            constraints: { min: 10 * 1024 * 1024, max: 1024 * 1024 * 1024 } // 10MB-1GB)');'
'';
        this.rules.set('memoryManagement.gcInterval', { ')'
            type: 'number',') }'
            constraints: { min: 1000, max: 300000 } // 1秒-5分)');'
'';
        this.rules.set('memoryManagement.enabled', { ')'
            type: 'boolean')'),';
'';
        this.rules.set('memoryManagement.aggressiveCleanup', {')'
            type: 'boolean')'),';
'';
        this.rules.set('memoryManagement.leakDetection', {')'
            type: 'boolean')'),
';
        // 品質制御設定の検証ルール
        this.rules.set('qualityControl.qualityLevel', {')'
            type: 'string',') }'
            constraints: { enum: ['low', 'medium', 'high', 'ultra'] })');'
'';
        this.rules.set('qualityControl.adjustmentSpeed', { ')'
            type: 'string',') }'
            constraints: { enum: ['slow', 'medium', 'fast'] })');'
'';
        this.rules.set('qualityControl.enabled', { ')'
            type: 'boolean')'),';
'';
        this.rules.set('qualityControl.autoAdjust', {')'
            type: 'boolean')'),';
'';
        this.rules.set('qualityControl.minQuality', {')'
            type: 'string',') }'
            constraints: { enum: ['low', 'medium', 'high'] })');
';
        // レンダリング最適化設定の検証ルール
        this.rules.set('rendering.enableOptimization', { ')'
            type: 'boolean')'),';
'';
        this.rules.set('rendering.dirtyRegions', {')'
            type: 'boolean')'),';
'';
        this.rules.set('rendering.viewportCulling', {')'
            type: 'boolean')'),';
'';
        this.rules.set('rendering.batchRendering', {')'
            type: 'boolean')'),';
'';
        this.rules.set('rendering.layerCaching', {')'
            type: 'boolean')'),
';
        // モバイル最適化設定の検証ルール
        this.rules.set('mobile.enableOptimization', {')'
            type: 'boolean')'),';
'';
        this.rules.set('mobile.deviceDetection', {')'
            type: 'boolean')'),';
'';
        this.rules.set('mobile.batteryOptimization', {')'
            type: 'boolean')'),';
'';
        this.rules.set('mobile.thermalManagement', {')'
            type: 'boolean')'),';
'';
        this.rules.set('mobile.touchOptimization', {')'
            type: 'boolean') }
    }
    
    /**
     * Validate a single configuration change
     * @param key - Configuration key
     * @param value - New value
     * @returns Validation result
     */
    async validateConfigChange(key: string, value: any): Promise<ValidationResult> { const rule = this.rules.get(key);
        if(!rule) {
            
        }
            // ルールが定義されていない場合は警告のみ }
            console.warn(`No validation rule for config key: ${key)`});
            return { valid: true, warnings: [`No validation rule defined for ${key}`] }
        }

        try { const validator = this.validators.get(rule.type);
            if(validator) {
                
            }
                validator(value, rule.constraints || {); }
            }
            
            return { valid: true }
        } catch (error) {
            throw new Error(`Validation failed for ${key}: ${error instanceof Error ? error.message : String(error})}`);
        }
    }
    
    /**
     * Validate multiple configuration changes
     * @param changes - Configuration changes object
     * @returns Validation results
     */
    async validateConfigChanges(changes: Record<string, any>): Promise<ValidationResult> { const results: ValidationResult = {
            valid: true,
            errors: [],
            warnings: [] }
        },

        for(const [key, value] of Object.entries(changes) {

            try {
                const result = await this.validateConfigChange(key, value);
                if (result.warnings) {

        }
                    results.warnings!.push(...result.warnings); }
                } catch (error) { results.valid = false;
                results.errors!.push({)
                    key);
                    error: error instanceof Error ? error.message : String(error) }
                });
            }
        }

        return results;
    }
    
    /**
     * Validate configuration file
     * @param file - Configuration file path/name
     * @returns File validation result
     */
    async validateConfigFile(file: string): Promise<FileValidationResult> { ' }'
        console.log(`Validating config file: ${file)`'});
        
        try { // ファイル存在確認（ブラウザ環境では制限）
            const validation: FileValidationResult = {
                valid: true,
                file,
                timestamp: Date.now(,
                issues: [] })
            })
            // 基本的な検証')'
            if(!file || typeof file !== 'string'') {
                validation.valid = false;'
                validation.issues!.push({')'
                    type: 'invalid_file_path',')
            }'
                    message: 'Invalid file path provided'); }
            }
';
            // ファイル拡張子チェック
            if (file && !file.match(/\.(json|js|yaml|yml)$/i)') { validation.issues!.push({''
                    type: 'unsupported_format',')';
                    message: 'File format may not be supported',')';
                    severity: 'warning') }
            }

            return validation;
            
        } catch (error) { return { valid: false,
                file,
                error: error instanceof Error ? error.message : String(error, };)
                timestamp: Date.now(); }
            };
        }
    }
    
    /**
     * Validate configuration category consistency
     * @param category - Configuration category
     * @param config - Category configuration
     * @returns Category validation result
     */
    async validateConfigCategory(category: string, config: Record<string, any>): Promise<CategoryValidationResult> { const validation: CategoryValidationResult = {
            valid: true,
            category,
            issues: [],
            warnings: [] }
        },
';
        // カテゴリ特有の検証ロジック
        switch(category') {'
            '';
            case 'frameStabilization':'';
                validation.result = await this.validateFrameStabilizationConfig(config');
                break;'
                '';
            case 'memoryManagement':'';
                validation.result = await this.validateMemoryManagementConfig(config');
                break;'
                '';
            case 'qualityControl':'';
                validation.result = await this.validateQualityControlConfig(config');
                break;'
                '';
            case 'rendering':'';
                validation.result = await this.validateRenderingConfig(config');
                break;'
                '';
            case 'mobile':;
                validation.result = await this.validateMobileConfig(config);
                break;
                
        }
            default: }
                validation.warnings.push(`Unknown category: ${category)`}),
        }

        return validation;
    }
    
    /**
     * Validate frame stabilization configuration
     * @param config - Frame stabilization config
     * @returns Validation result
     */
    private async validateFrameStabilizationConfig(config: Record<string, any>): Promise<SubValidationResult> { const issues: ValidationIssue[] = [],
';
        // targetFPS vs minFPS consistency check
        if(config.targetFPS && config.minFPS && config.targetFPS <= config.minFPS') {'
            issues.push({''
                type: 'consistency_error',')';
                message: 'targetFPS must be greater than minFPS',')
        }'
                severity: 'error'); }
        }

        // Stability threshold reasonableness
        if(config.stabilityThreshold && config.targetFPS) {
            '';
            if (config.stabilityThreshold > config.targetFPS * 0.5') {'
                issues.push({''
                    type: 'configuration_warning',')';
                    message: 'stabilityThreshold seems too high relative to targetFPS',')
        }'
                    severity: 'warning')'); }
            }
        }
';'
        return { ''
            valid: issues.filter(i = > i.severity === 'error').length === 0 };
    issues }
        };
    }
    
    /**
     * Validate memory management configuration
     * @param config - Memory management config
     * @returns Validation result
     */
    private async validateMemoryManagementConfig(config: Record<string, any>): Promise<SubValidationResult> { const issues: ValidationIssue[] = [],
';
        // GC interval vs aggressive cleanup consistency
        if(config.aggressiveCleanup && config.gcInterval > 60000') {'
            issues.push({''
                type: 'consistency_warning',')';
                message: 'Long GC interval with aggressive cleanup may be ineffective',')
        }'
                severity: 'warning'); }
        }
';
        // Memory limit reasonableness
        if(config.maxUsage && config.maxUsage < 50 * 1024 * 1024') {'
            issues.push({''
                type: 'configuration_warning',')';
                message: 'Very low memory limit may cause performance issues',')
        }'
                severity: 'warning')'); }
        }
';'
        return { ''
            valid: issues.filter(i = > i.severity === 'error').length === 0 };
    issues }
        };
    }
    
    /**
     * Validate quality control configuration
     * @param config - Quality control config
     * @returns Validation result'
     */''
    private async validateQualityControlConfig(config: Record<string, any>'): Promise<SubValidationResult> { const issues: ValidationIssue[] = [],
';
        // Quality level vs min quality consistency
        const qualityLevels = ['low', 'medium', 'high', 'ultra'];
        if(config.qualityLevel && config.minQuality) {
            const currentIndex = qualityLevels.indexOf(config.qualityLevel);
            const minIndex = qualityLevels.indexOf(config.minQuality);'
            '';
            if (currentIndex < minIndex') {'
                issues.push({''
                    type: 'consistency_error',')';
                    message: 'qualityLevel cannot be lower than minQuality',')
        }'
                    severity: 'error')'); }
            }
        }
';'
        return { ''
            valid: issues.filter(i = > i.severity === 'error').length === 0 };
    issues }
        };
    }
    
    /**
     * Validate rendering configuration
     * @param config - Rendering config
     * @returns Validation result
     */
    private async validateRenderingConfig(config: Record<string, any>): Promise<SubValidationResult> { const issues: ValidationIssue[] = [],
';
        // Check for conflicting optimization settings
        if(config.enableOptimization === false') {'
            '';
            const optimizationOptions = ['dirtyRegions', 'viewportCulling', 'batchRendering', 'layerCaching'];
            const enabledOptions = optimizationOptions.filter(opt => config[opt] === true);'
            '';
            if (enabledOptions.length > 0') {'
                issues.push({')
        }'
                    type: 'consistency_warning''),' }'
                    message: `Optimization disabled but ${enabledOptions.join(', ''})} are enabled`,''
                    severity: 'warning''';
                }'),
            }
        }
';'
        return { ''
            valid: issues.filter(i = > i.severity === 'error').length === 0 };
    issues }
        };
    }
    
    /**
     * Validate mobile configuration
     * @param config - Mobile config
     * @returns Validation result
     */
    private async validateMobileConfig(config: Record<string, any>): Promise<SubValidationResult> { const issues: ValidationIssue[] = [],
';
        // Battery optimization with thermal management
        if(config.batteryOptimization && !config.thermalManagement') {'
            issues.push({''
                type: 'consistency_warning',')';
                message: 'Battery optimization works better with thermal management enabled',')
        }'
                severity: 'warning')'); }
        }
';'
        return { ''
            valid: issues.filter(i = > i.severity === 'error').length === 0 };
    issues }
        };
    }
    
    /**
     * Add custom validation rule
     * @param key - Configuration key
     * @param rule - Validation rule
     */
    addValidationRule(key: string, rule: ValidationRule): void { this.rules.set(key, rule); }
        console.log(`[ConfigurationValidator] Added validation rule for ${key)`});
    }
    
    /**
     * Remove validation rule
     * @param key - Configuration key
     */
    removeValidationRule(key: string): boolean { const removed = this.rules.delete(key);
        if (removed) { }
            console.log(`[ConfigurationValidator] Removed validation rule for ${key)`});
        }
        return removed;
    }
    
    /**
     * Get all validation rules
     * @returns All validation rules
     */
    getValidationRules(): Record<string, ValidationRule> { return Object.fromEntries(this.rules); }
    }
    
    /**
     * Configure validator settings
     * @param config - Validator configuration
     */
    configure(config: ValidatorConfig): void { if (config.strictMode !== undefined) {
            this.strictMode = config.strictMode; }
            console.log(`[ConfigurationValidator] Strict mode: ${this.strictMode)`});
        }
        
        if(config.customRules) {
        
            for(const [key, rule] of Object.entries(config.customRules) {
        
        }
                this.addValidationRule(key, rule); }
            }
        }
    }
    
    /**
     * Get validator status
     * @returns Validator status
     */
    getValidatorStatus(): ValidatorStatus { return { rulesCount: this.rules.size,
            validatorsCount: this.validators.size,
            strictMode: this.strictMode, };
            supportedTypes: Array.from(this.validators.keys(); }
        };
    }
    
    /**
     * Cleanup validator resources
     */'
    destroy(): void { this.validators.clear();''
        this.rules.clear()';
        console.log('[ConfigurationValidator] Validator destroyed''); }'
    }''
}