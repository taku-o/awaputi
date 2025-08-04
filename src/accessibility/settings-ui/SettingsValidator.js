/**
 * SettingsValidator - Settings validation and constraint enforcement
 * Handles setting value validation, type checking, and constraint enforcement
 */
export class SettingsValidator {
    constructor(config = {}) {
        this.config = {
            strictValidation: true,
            allowPartialValidation: false,
            validateOnChange: true,
            logValidationErrors: true,
            ...config
        };

        // Validation rules and constraints
        this.validationRules = this.createValidationRules();
        this.customValidators = new Map();
        this.validationErrors = [];
        this.validationWarnings = [];

        // Performance tracking
        this.validationMetrics = {
            totalValidations: 0,
            failedValidations: 0,
            averageValidationTime: 0,
            validationTimes: []
        };

        this.initialized = false;
    }

    /**
     * Initialize validator
     */
    initialize() {
        if (this.initialized) return true;

        console.log('SettingsValidator: Initializing...');
        
        try {
            this.setupDefaultValidators();
            this.initialized = true;
            console.log('SettingsValidator: Initialized successfully');
            return true;
        } catch (error) {
            console.error('SettingsValidator: Initialization error:', error);
            return false;
        }
    }

    /**
     * Create default validation rules for all settings
     */
    createValidationRules() {
        return {
            // Visual accessibility settings
            textScaling: {
                type: 'number',
                min: 0.5,
                max: 3.0,
                step: 0.1,
                required: true,
                description: 'Text scaling factor'
            },
            colorContrast: {
                type: 'string',
                enum: ['normal', 'enhanced', 'high', 'maximum'],
                required: true,
                description: 'Color contrast level'
            },
            colorBlindnessSupport: {
                type: 'string',
                enum: ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'patterns'],
                required: true,
                description: 'Color blindness support type'
            },
            motionReduction: {
                type: 'string',
                enum: ['none', 'minimal', 'reduced', 'significant', 'disabled'],
                required: true,
                description: 'Motion reduction level'
            },
            focusIndicators: {
                type: 'boolean',
                required: false,
                description: 'Enhanced focus indicators'
            },
            visualFeedback: {
                type: 'string',
                enum: ['minimal', 'standard', 'enhanced'],
                required: false,
                default: 'standard',
                description: 'Visual feedback level'
            },

            // Audio accessibility settings
            'soundSettings.masterVolume': {
                type: 'number',
                min: 0,
                max: 100,
                step: 1,
                required: true,
                description: 'Master volume level'
            },
            'soundSettings.soundEffects': {
                type: 'boolean',
                required: false,
                default: true,
                description: 'Sound effects enabled'
            },
            'soundSettings.backgroundMusic': {
                type: 'boolean',
                required: false,
                default: true,
                description: 'Background music enabled'
            },
            'captionSettings.showCaptions': {
                type: 'boolean',
                required: false,
                default: false,
                description: 'Captions enabled'
            },
            'captionSettings.captionSize': {
                type: 'number',
                min: 0.8,
                max: 2.0,
                step: 0.1,
                required: false,
                default: 1.0,
                description: 'Caption text size'
            },
            'captionSettings.captionPosition': {
                type: 'string',
                enum: ['bottom', 'top', 'center'],
                required: false,
                default: 'bottom',
                description: 'Caption position'
            },

            // Motor accessibility settings
            'keyboardSettings.keyboardNavigation': {
                type: 'boolean',
                required: false,
                default: true,
                description: 'Keyboard navigation enabled'
            },
            'keyboardSettings.stickyKeys': {
                type: 'boolean',
                required: false,
                default: false,
                description: 'Sticky keys enabled'
            },
            'keyboardSettings.keyRepeatDelay': {
                type: 'number',
                min: 100,
                max: 1000,
                step: 50,
                required: false,
                default: 500,
                description: 'Key repeat delay in milliseconds'
            },
            'alternativeInput.switchInput': {
                type: 'boolean',
                required: false,
                default: false,
                description: 'Switch input enabled'
            },
            'alternativeInput.eyeTracking': {
                type: 'boolean',
                required: false,
                default: false,
                description: 'Eye tracking enabled'
            },
            'alternativeInput.voiceControl': {
                type: 'boolean',
                required: false,
                default: false,
                description: 'Voice control enabled'
            },

            // Cognitive accessibility settings
            uiSimplification: {
                type: 'string',
                enum: ['none', 'minimal', 'essential', 'beginner'],
                required: false,
                default: 'none',
                description: 'UI simplification level'
            },
            contextualHelp: {
                type: 'boolean',
                required: false,
                default: true,
                description: 'Contextual help enabled'
            },
            errorRecovery: {
                type: 'string',
                enum: ['standard', 'enhanced', 'guided'],
                required: false,
                default: 'standard',
                description: 'Error recovery assistance level'
            },
            memoryAids: {
                type: 'boolean',
                required: false,
                default: false,
                description: 'Memory aids enabled'
            },
            focusManagement: {
                type: 'string',
                enum: ['automatic', 'manual', 'hybrid'],
                required: false,
                default: 'automatic',
                description: 'Focus management mode'
            }
        };
    }

    /**
     * Setup default custom validators
     */
    setupDefaultValidators() {
        // Volume level validator
        this.addCustomValidator('volumeRange', (value, rule) => {
            if (typeof value !== 'number') return { valid: false, error: 'Volume must be a number' };
            if (value < 0) return { valid: false, error: 'Volume cannot be negative' };
            if (value > 100) return { valid: false, error: 'Volume cannot exceed 100' };
            return { valid: true };
        });

        // Text scaling validator
        this.addCustomValidator('textScalingRange', (value, rule) => {
            if (typeof value !== 'number') return { valid: false, error: 'Text scaling must be a number' };
            if (value < 0.5) return { valid: false, error: 'Text scaling cannot be less than 0.5x' };
            if (value > 3.0) return { valid: false, error: 'Text scaling cannot exceed 3.0x' };
            if (value % 0.1 !== 0) return { valid: false, error: 'Text scaling must be in 0.1 increments' };
            return { valid: true };
        });

        // Accessibility combination validator
        this.addCustomValidator('accessibilityCombination', (settings) => {
            // Check for potentially conflicting settings
            if (settings.motionReduction === 'disabled' && settings.visualFeedback === 'enhanced') {
                return { 
                    valid: false, 
                    warning: 'Enhanced visual feedback with disabled motion may reduce effectiveness' 
                };
            }
            
            if (settings.uiSimplification === 'beginner' && settings.contextualHelp === false) {
                return { 
                    valid: false, 
                    warning: 'Beginner UI mode works best with contextual help enabled' 
                };
            }
            
            return { valid: true };
        });

        // Color accessibility validator
        this.addCustomValidator('colorAccessibility', (settings) => {
            if (settings.colorBlindnessSupport !== 'none' && settings.colorContrast === 'normal') {
                return { 
                    valid: true, 
                    warning: 'Consider using enhanced contrast with color blindness support' 
                };
            }
            return { valid: true };
        });
    }

    /**
     * Validate single setting value
     */
    validateSetting(settingId, value, options = {}) {
        const validationStartTime = performance.now();
        
        try {
            this.clearErrors();
            
            const rule = this.validationRules[settingId];
            if (!rule) {
                if (this.config.strictValidation) {
                    return this.createValidationResult(false, `No validation rule found for setting: ${settingId}`);
                }
                return this.createValidationResult(true, null, 'No validation rule - allowing value');
            }

            // Type validation
            const typeResult = this.validateType(value, rule);
            if (!typeResult.valid) {
                return typeResult;
            }

            // Range/constraint validation
            const constraintResult = this.validateConstraints(value, rule);
            if (!constraintResult.valid) {
                return constraintResult;
            }

            // Custom validation
            const customResult = this.runCustomValidation(settingId, value, rule);
            if (!customResult.valid) {
                return customResult;
            }

            // Record performance
            this.recordValidationMetrics(performance.now() - validationStartTime, true);

            return this.createValidationResult(true, null, 'Setting value is valid', customResult.warnings);

        } catch (error) {
            console.error('SettingsValidator: Validation error:', error);
            this.recordValidationMetrics(performance.now() - validationStartTime, false);
            return this.createValidationResult(false, `Validation failed: ${error.message}`);
        }
    }

    /**
     * Validate multiple settings at once
     */
    validateSettings(settings, options = {}) {
        const validationStartTime = performance.now();
        const results = {};
        let allValid = true;
        const warnings = [];

        try {
            this.clearErrors();

            // Validate individual settings
            for (const [settingId, value] of Object.entries(settings)) {
                const result = this.validateSetting(settingId, value, options);
                results[settingId] = result;
                
                if (!result.valid) {
                    allValid = false;
                }
                
                if (result.warnings) {
                    warnings.push(...result.warnings);
                }
            }

            // Run cross-setting validation
            const crossValidationResult = this.validateSettingCombinations(settings);
            if (crossValidationResult.warnings) {
                warnings.push(...crossValidationResult.warnings);
            }
            if (!crossValidationResult.valid) {
                allValid = false;
            }

            this.recordValidationMetrics(performance.now() - validationStartTime, allValid);

            return {
                valid: allValid,
                results,
                warnings,
                errors: this.validationErrors,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('SettingsValidator: Batch validation error:', error);
            this.recordValidationMetrics(performance.now() - validationStartTime, false);
            return {
                valid: false,
                results,
                error: `Batch validation failed: ${error.message}`,
                timestamp: Date.now()
            };
        }
    }

    /**
     * Validate setting type
     */
    validateType(value, rule) {
        switch (rule.type) {
            case 'string':
                if (typeof value !== 'string') {
                    return this.createValidationResult(false, `Expected string, got ${typeof value}`);
                }
                break;
                
            case 'number':
                if (typeof value !== 'number' || isNaN(value)) {
                    return this.createValidationResult(false, `Expected number, got ${typeof value}`);
                }
                break;
                
            case 'boolean':
                if (typeof value !== 'boolean') {
                    return this.createValidationResult(false, `Expected boolean, got ${typeof value}`);
                }
                break;
                
            case 'array':
                if (!Array.isArray(value)) {
                    return this.createValidationResult(false, `Expected array, got ${typeof value}`);
                }
                break;
                
            case 'object':
                if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                    return this.createValidationResult(false, `Expected object, got ${typeof value}`);
                }
                break;
        }
        
        return this.createValidationResult(true);
    }

    /**
     * Validate setting constraints
     */
    validateConstraints(value, rule) {
        // Required validation
        if (rule.required && (value === null || value === undefined || value === '')) {
            return this.createValidationResult(false, 'This setting is required');
        }

        // Enum validation
        if (rule.enum && !rule.enum.includes(value)) {
            return this.createValidationResult(false, `Value must be one of: ${rule.enum.join(', ')}`);
        }

        // Numeric constraints
        if (rule.type === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                return this.createValidationResult(false, `Value must be at least ${rule.min}`);
            }
            if (rule.max !== undefined && value > rule.max) {
                return this.createValidationResult(false, `Value must be at most ${rule.max}`);
            }
            if (rule.step !== undefined && (value % rule.step) !== 0) {
                return this.createValidationResult(false, `Value must be in increments of ${rule.step}`);
            }
        }

        // String constraints
        if (rule.type === 'string') {
            if (rule.minLength !== undefined && value.length < rule.minLength) {
                return this.createValidationResult(false, `Text must be at least ${rule.minLength} characters`);
            }
            if (rule.maxLength !== undefined && value.length > rule.maxLength) {
                return this.createValidationResult(false, `Text must be at most ${rule.maxLength} characters`);
            }
            if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
                return this.createValidationResult(false, 'Text format is invalid');
            }
        }

        // Array constraints
        if (rule.type === 'array') {
            if (rule.minItems !== undefined && value.length < rule.minItems) {
                return this.createValidationResult(false, `Must have at least ${rule.minItems} items`);
            }
            if (rule.maxItems !== undefined && value.length > rule.maxItems) {
                return this.createValidationResult(false, `Must have at most ${rule.maxItems} items`);
            }
        }

        return this.createValidationResult(true);
    }

    /**
     * Run custom validation for setting
     */
    runCustomValidation(settingId, value, rule) {
        const warnings = [];
        
        // Run setting-specific custom validators
        for (const [validatorName, validator] of this.customValidators) {
            if (settingId.includes('volume') && validatorName === 'volumeRange') {
                const result = validator(value, rule);
                if (!result.valid) {
                    return this.createValidationResult(false, result.error);
                }
                if (result.warning) {
                    warnings.push(result.warning);
                }
            }
            
            if (settingId === 'textScaling' && validatorName === 'textScalingRange') {
                const result = validator(value, rule);
                if (!result.valid) {
                    return this.createValidationResult(false, result.error);
                }
                if (result.warning) {
                    warnings.push(result.warning);
                }
            }
        }

        return this.createValidationResult(true, null, null, warnings);
    }

    /**
     * Validate setting combinations
     */
    validateSettingCombinations(settings) {
        const warnings = [];
        
        // Run combination validators
        for (const [validatorName, validator] of this.customValidators) {
            if (validatorName === 'accessibilityCombination' || validatorName === 'colorAccessibility') {
                const result = validator(settings);
                if (!result.valid) {
                    return this.createValidationResult(false, result.error);
                }
                if (result.warning) {
                    warnings.push(result.warning);
                }
            }
        }

        return this.createValidationResult(true, null, null, warnings);
    }

    /**
     * Add custom validator function
     */
    addCustomValidator(name, validatorFn) {
        if (typeof validatorFn !== 'function') {
            throw new Error('Validator must be a function');
        }
        
        this.customValidators.set(name, validatorFn);
        console.log(`SettingsValidator: Added custom validator: ${name}`);
    }

    /**
     * Remove custom validator
     */
    removeCustomValidator(name) {
        const removed = this.customValidators.delete(name);
        if (removed) {
            console.log(`SettingsValidator: Removed custom validator: ${name}`);
        }
        return removed;
    }

    /**
     * Get validation rule for setting
     */
    getValidationRule(settingId) {
        return this.validationRules[settingId] || null;
    }

    /**
     * Add or update validation rule
     */
    setValidationRule(settingId, rule) {
        this.validationRules[settingId] = rule;
        console.log(`SettingsValidator: Updated validation rule for: ${settingId}`);
    }

    /**
     * Create validation result object
     */
    createValidationResult(valid, error = null, message = null, warnings = []) {
        const result = {
            valid,
            timestamp: Date.now()
        };

        if (error) {
            result.error = error;
            this.validationErrors.push(error);
            if (this.config.logValidationErrors) {
                console.warn('SettingsValidator: Validation error:', error);
            }
        }

        if (message) {
            result.message = message;
        }

        if (warnings && warnings.length > 0) {
            result.warnings = warnings;
            this.validationWarnings.push(...warnings);
        }

        return result;
    }

    /**
     * Clear validation errors and warnings
     */
    clearErrors() {
        this.validationErrors = [];
        this.validationWarnings = [];
    }

    /**
     * Record validation performance metrics
     */
    recordValidationMetrics(validationTime, success) {
        this.validationMetrics.totalValidations++;
        if (!success) {
            this.validationMetrics.failedValidations++;
        }
        
        this.validationMetrics.validationTimes.push(validationTime);
        if (this.validationMetrics.validationTimes.length > 100) {
            this.validationMetrics.validationTimes = this.validationMetrics.validationTimes.slice(-50);
        }
        
        const times = this.validationMetrics.validationTimes;
        this.validationMetrics.averageValidationTime = 
            times.reduce((a, b) => a + b, 0) / times.length;
    }

    /**
     * Get validation statistics
     */
    getValidationStats() {
        return {
            ...this.validationMetrics,
            successRate: this.validationMetrics.totalValidations > 0
                ? ((this.validationMetrics.totalValidations - this.validationMetrics.failedValidations) 
                   / this.validationMetrics.totalValidations) * 100
                : 0,
            totalRules: Object.keys(this.validationRules).length,
            customValidators: this.customValidators.size,
            currentErrors: this.validationErrors.length,
            currentWarnings: this.validationWarnings.length
        };
    }

    /**
     * Reset validation metrics
     */
    resetMetrics() {
        this.validationMetrics = {
            totalValidations: 0,
            failedValidations: 0,
            averageValidationTime: 0,
            validationTimes: []
        };
        this.clearErrors();
        console.log('SettingsValidator: Metrics reset');
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
        console.log('SettingsValidator: Configuration updated');
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        console.log('SettingsValidator: Destroying...');
        
        this.customValidators.clear();
        this.clearErrors();
        this.validationRules = {};
        this.resetMetrics();
        
        this.initialized = false;
        console.log('SettingsValidator: Destroyed');
    }
}