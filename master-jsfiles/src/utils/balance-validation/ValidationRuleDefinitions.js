/**
 * ValidationRuleDefinitions - Rule definitions and rule configuration functionality
 * Part of the BalanceAdjustmentValidationRules split implementation
 */

export class ValidationRuleDefinitions {
    constructor(mainController) {
        this.mainController = mainController;
        
        // Rule storage
        this.rules = new Map();
        
        // Rule categories
        this.ruleCategories = {
            VALUE_RANGE: 'value_range',        // 値の範囲チェック
            BALANCE_IMPACT: 'balance_impact',  // ゲームバランスへの影響
            COMPATIBILITY: 'compatibility',    // 他設定との互換性
            PROGRESSION: 'progression',        // 進行性・一貫性
            SAFETY: 'safety',                 // 安全性・エラー防止
            PERFORMANCE: 'performance'         // パフォーマンス影響
        };
        
        console.log('[ValidationRuleDefinitions] Rule definitions component initialized');
    }
    
    /**
     * Initialize all rules
     */
    initializeRules() {
        this.addBubbleHealthRules();
        this.addScoreRules();
        this.addSizeRules();
        this.addTimeRules();
        this.addSpecialEffectRules();
        this.addSystemRules();
        
        console.log(`[ValidationRuleDefinitions] Initialized ${this.rules.size} rules`);
    }
    
    /**
     * Add bubble health rules
     */
    addBubbleHealthRules() {
        // Basic health value range
        this.addRule('bubble_health_range', {
            category: this.ruleCategories.VALUE_RANGE,
            description: 'バブル体力値の妥当な範囲をチェック',
            check: (oldValue, newValue, context) => {
                if (typeof newValue !== 'number') {
                    return { valid: false, message: '体力値は数値である必要があります' };
                }
                
                if (newValue <= 0) {
                    return { valid: false, message: '体力値は正の数である必要があります' };
                }
                
                const bubbleType = context.bubbleType;
                const limits = this.getBubbleHealthLimits(bubbleType);
                
                if (newValue < limits.min || newValue > limits.max) {
                    return { 
                        valid: false, 
                        message: `${bubbleType}バブルの体力値は${limits.min}〜${limits.max}の範囲で設定してください` 
                    };
                }
                
                return { valid: true };
            },
            severity: 'high',
            autoFix: false
        });
        
        // Gradual health change check
        this.addRule('bubble_health_gradual_change', {
            category: this.ruleCategories.BALANCE_IMPACT,
            description: '体力値の急激な変更を防止',
            check: (oldValue, newValue, context) => {
                if (typeof oldValue !== 'number' || typeof newValue !== 'number') {
                    return { valid: true }; // 数値以外は他のルールで処理
                }
                
                const changeRatio = Math.abs(newValue - oldValue) / oldValue;
                const threshold = this.getChangeThreshold(context.bubbleType, 'health');
                
                if (changeRatio > threshold) {
                    return { 
                        valid: false, 
                        message: `体力値の変更が大きすぎます（${(changeRatio * 100).toFixed(1)}% > ${(threshold * 100)}%）。段階的な調整を推奨します`,
                        suggestion: `段階的調整: ${oldValue} → ${Math.round(oldValue * (1 + Math.sign(newValue - oldValue) * threshold))} → ${newValue}`
                    };
                }
                
                return { valid: true };
            },
            severity: 'medium',
            autoFix: false
        });
        
        // Boss bubble special rules
        this.addRule('boss_bubble_health_special', {
            category: this.ruleCategories.BALANCE_IMPACT,
            description: 'Bossバブルの体力値特別チェック',
            check: (oldValue, newValue, context) => {
                if (context.bubbleType !== 'boss') {
                    return { valid: true };
                }
                
                if (typeof newValue !== 'number') {
                    return { valid: false, message: 'Bossバブルの体力値は数値である必要があります' };
                }
                
                // Relative relationship check with other bubble types
                const normalHealth = context.relatedValues?.normal?.health || 1;
                const healthRatio = newValue / normalHealth;
                
                if (healthRatio < 3) {
                    return { 
                        valid: false, 
                        message: `Bossバブルの体力は通常バブルの少なくとも3倍以上に設定してください（現在: ${healthRatio.toFixed(1)}倍）` 
                    };
                }
                
                if (healthRatio > 20) {
                    return { 
                        valid: false, 
                        message: `Bossバブルの体力が高すぎます（通常バブルの${healthRatio.toFixed(1)}倍）。ゲームプレイ性を損なう可能性があります` 
                    };
                }
                
                return { valid: true };
            },
            severity: 'high',
            autoFix: false
        });
    }
    
    /**
     * Add score rules
     */
    addScoreRules() {
        // Basic score range
        this.addRule('score_range', {
            category: this.ruleCategories.VALUE_RANGE,
            description: 'スコア値の妥当な範囲をチェック',
            check: (oldValue, newValue, context) => {
                if (typeof newValue !== 'number') {
                    return { valid: false, message: 'スコア値は数値である必要があります' };
                }
                
                if (newValue < 0) {
                    return { valid: false, message: 'スコア値は0以上である必要があります' };
                }
                
                const bubbleType = context.bubbleType;
                const limits = this.getScoreLimits(bubbleType);
                
                if (newValue > limits.max) {
                    return { 
                        valid: false, 
                        message: `${bubbleType}バブルのスコアが上限（${limits.max}）を超えています` 
                    };
                }
                
                return { valid: true };
            },
            severity: 'medium',
            autoFix: true,
            autoFixFn: (oldValue, newValue, context) => {
                const limits = this.getScoreLimits(context.bubbleType);
                return Math.max(0, Math.min(newValue, limits.max));
            }
        });
        
        // Score balance ratio
        this.addRule('score_balance_ratio', {
            category: this.ruleCategories.BALANCE_IMPACT,
            description: 'バブルタイプ間のスコア比率バランスをチェック',
            check: (oldValue, newValue, context) => {
                if (typeof newValue !== 'number' || !context.relatedValues) {
                    return { valid: true };
                }
                
                const normalScore = context.relatedValues.normal?.score || 10;
                const scoreRatio = newValue / normalScore;
                
                const expectedRatios = {
                    normal: { min: 0.8, max: 1.2 },
                    stone: { min: 1.2, max: 2.0 },
                    iron: { min: 1.8, max: 3.0 },
                    diamond: { min: 2.5, max: 4.0 },
                    rainbow: { min: 3.0, max: 6.0 },
                    boss: { min: 8.0, max: 15.0 },
                    golden: { min: 5.0, max: 10.0 },
                    explosive: { min: 2.0, max: 4.0 }
                };
                
                const expectedRatio = expectedRatios[context.bubbleType];
                if (expectedRatio && (scoreRatio < expectedRatio.min || scoreRatio > expectedRatio.max)) {
                    return { 
                        valid: false, 
                        message: `${context.bubbleType}バブルのスコア比率が推奨範囲外です（${scoreRatio.toFixed(1)}倍、推奨: ${expectedRatio.min}〜${expectedRatio.max}倍）` 
                    };
                }
                
                return { valid: true };
            },
            severity: 'medium',
            autoFix: false
        });
    }
    
    /**
     * Add size rules
     */
    addSizeRules() {
        // Basic size range
        this.addRule('size_range', {
            category: this.ruleCategories.VALUE_RANGE,
            description: 'バブルサイズの妥当な範囲をチェック',
            check: (oldValue, newValue, context) => {
                if (typeof newValue !== 'number') {
                    return { valid: false, message: 'サイズ値は数値である必要があります' };
                }
                
                if (newValue <= 0) {
                    return { valid: false, message: 'サイズ値は正の数である必要があります' };
                }
                
                // Canvas size relationship check
                const canvasSize = context.canvasSize || { width: 800, height: 600 };
                const maxAllowedSize = Math.min(canvasSize.width, canvasSize.height) * 0.3;
                
                if (newValue > maxAllowedSize) {
                    return { 
                        valid: false, 
                        message: `サイズが大きすぎます（${newValue} > ${maxAllowedSize}）。画面サイズとの比率を考慮してください` 
                    };
                }
                
                const minSize = 10;
                if (newValue < minSize) {
                    return { 
                        valid: false, 
                        message: `サイズが小さすぎます（${newValue} < ${minSize}）。クリック可能性を考慮してください` 
                    };
                }
                
                return { valid: true };
            },
            severity: 'high',
            autoFix: true,
            autoFixFn: (oldValue, newValue, context) => {
                const canvasSize = context.canvasSize || { width: 800, height: 600 };
                const maxSize = Math.min(canvasSize.width, canvasSize.height) * 0.3;
                const minSize = 10;
                return Math.max(minSize, Math.min(newValue, maxSize));
            }
        });
        
        // Size hierarchy check
        this.addRule('size_hierarchy', {
            category: this.ruleCategories.PROGRESSION,
            description: 'バブルタイプ間のサイズ階層をチェック',
            check: (oldValue, newValue, context) => {
                if (typeof newValue !== 'number' || !context.relatedValues) {
                    return { valid: true };
                }
                
                const sizeHierarchy = [
                    'normal', 'stone', 'iron', 'diamond', 'rainbow', 
                    'golden', 'explosive', 'boss'
                ];
                
                const currentIndex = sizeHierarchy.indexOf(context.bubbleType);
                if (currentIndex === -1) return { valid: true };
                
                // Compare sizes with preceding and following bubble types
                for (let i = 0; i < currentIndex; i++) {
                    const smallerType = sizeHierarchy[i];
                    const smallerSize = context.relatedValues[smallerType]?.size;
                    
                    if (smallerSize && newValue <= smallerSize) {
                        return { 
                            valid: false, 
                            message: `${context.bubbleType}バブルのサイズは${smallerType}バブル（${smallerSize}）より大きくする必要があります` 
                        };
                    }
                }
                
                for (let i = currentIndex + 1; i < sizeHierarchy.length; i++) {
                    const largerType = sizeHierarchy[i];
                    const largerSize = context.relatedValues[largerType]?.size;
                    
                    if (largerSize && newValue >= largerSize) {
                        return { 
                            valid: false, 
                            message: `${context.bubbleType}バブルのサイズは${largerType}バブル（${largerSize}）より小さくする必要があります` 
                        };
                    }
                }
                
                return { valid: true };
            },
            severity: 'medium',
            autoFix: false
        });
    }
    
    /**
     * Add time-related rules
     */
    addTimeRules() {
        // Basic time range
        this.addRule('time_range', {
            category: this.ruleCategories.VALUE_RANGE,
            description: '時間値の妥当な範囲をチェック',
            check: (oldValue, newValue, context) => {
                if (context.propertyType !== 'maxAge' && 
                    context.propertyType !== 'duration' && 
                    !context.propertyType.includes('Time')) {
                    return { valid: true };
                }
                
                if (typeof newValue !== 'number') {
                    return { valid: false, message: '時間値は数値である必要があります' };
                }
                
                if (newValue <= 0) {
                    return { valid: false, message: '時間値は正の数である必要があります' };
                }
                
                // Maximum time limit (10 minutes = 600,000ms)
                const maxTime = 600000;
                if (newValue > maxTime) {
                    return { 
                        valid: false, 
                        message: `時間値が長すぎます（${newValue}ms > ${maxTime}ms）` 
                    };
                }
                
                // Minimum time limit (100ms)
                const minTime = 100;
                if (newValue < minTime) {
                    return { 
                        valid: false, 
                        message: `時間値が短すぎます（${newValue}ms < ${minTime}ms）` 
                    };
                }
                
                return { valid: true };
            },
            severity: 'medium',
            autoFix: true,
            autoFixFn: (oldValue, newValue, context) => {
                const maxTime = 600000;
                const minTime = 100;
                return Math.max(minTime, Math.min(newValue, maxTime));
            }
        });
        
        // Bubble lifetime balance
        this.addRule('bubble_lifetime_balance', {
            category: this.ruleCategories.BALANCE_IMPACT,
            description: 'バブル寿命のゲームバランスをチェック',
            check: (oldValue, newValue, context) => {
                if (context.propertyType !== 'maxAge') {
                    return { valid: true };
                }
                
                if (typeof newValue !== 'number') {
                    return { valid: true }; // 他のルールで処理
                }
                
                // Relationship with stage time (5 minutes = 300,000ms)
                const stageTime = 300000;
                const lifetimeRatio = newValue / stageTime;
                
                if (lifetimeRatio > 0.8) {
                    return { 
                        valid: false, 
                        message: `バブル寿命がステージ時間の${(lifetimeRatio * 100).toFixed(1)}%です。ゲームの緊張感を損なう可能性があります` 
                    };
                }
                
                if (lifetimeRatio < 0.01) {
                    return { 
                        valid: false, 
                        message: `バブル寿命が短すぎます（ステージ時間の${(lifetimeRatio * 100).toFixed(1)}%）。プレイヤーが対応できない可能性があります` 
                    };
                }
                
                return { valid: true };
            },
            severity: 'medium',
            autoFix: false
        });
    }
    
    /**
     * Add special effect rules
     */
    addSpecialEffectRules() {
        // Electric effect intensity
        this.addRule('electric_effect_intensity', {
            category: this.ruleCategories.BALANCE_IMPACT,
            description: '電気効果の強度をチェック',
            check: (oldValue, newValue, context) => {
                if (context.bubbleType !== 'electric' || context.propertyType !== 'intensity') {
                    return { valid: true };
                }
                
                if (typeof newValue !== 'number') {
                    return { valid: false, message: '電気効果の強度は数値である必要があります' };
                }
                
                if (newValue < 1 || newValue > 50) {
                    return { 
                        valid: false, 
                        message: `電気効果の強度は1〜50の範囲で設定してください（現在: ${newValue}）` 
                    };
                }
                
                // High intensity warning
                if (newValue > 30) {
                    return { 
                        valid: false, 
                        message: `電気効果の強度が高すぎます（${newValue}）。プレイヤーの操作性に深刻な影響を与える可能性があります`,
                        severity: 'warning'
                    };
                }
                
                return { valid: true };
            },
            severity: 'medium',
            autoFix: true,
            autoFixFn: (oldValue, newValue, context) => {
                return Math.max(1, Math.min(newValue, 50));
            }
        });
        
        // Rainbow effect duration balance
        this.addRule('rainbow_duration_balance', {
            category: this.ruleCategories.BALANCE_IMPACT,
            description: 'Rainbow効果の持続時間バランスをチェック',
            check: (oldValue, newValue, context) => {
                if (context.bubbleType !== 'rainbow' || context.propertyType !== 'duration') {
                    return { valid: true };
                }
                
                if (typeof newValue !== 'number') {
                    return { valid: true }; // 他のルールで処理
                }
                
                // Recommended range: 3-15 seconds
                const minDuration = 3000;
                const maxDuration = 15000;
                
                if (newValue < minDuration) {
                    return { 
                        valid: false, 
                        message: `Rainbow効果の持続時間が短すぎます（${newValue}ms）。最低${minDuration}ms推奨` 
                    };
                }
                
                if (newValue > maxDuration) {
                    return { 
                        valid: false, 
                        message: `Rainbow効果の持続時間が長すぎます（${newValue}ms）。ゲームバランスを崩す可能性があります` 
                    };
                }
                
                return { valid: true };
            },
            severity: 'medium',
            autoFix: false
        });
    }
    
    /**
     * Add system-wide rules
     */
    addSystemRules() {
        // Performance impact check
        this.addRule('performance_impact', {
            category: this.ruleCategories.PERFORMANCE,
            description: 'パフォーマンスへの影響をチェック',
            check: (oldValue, newValue, context) => {
                // Particle count limitation
                if (context.propertyType === 'particleCount') {
                    if (typeof newValue === 'number' && newValue > 100) {
                        return { 
                            valid: false, 
                            message: `パーティクル数が多すぎます（${newValue}）。パフォーマンスに影響する可能性があります` 
                        };
                    }
                }
                
                // Animation frequency limitation
                if (context.propertyType === 'animationFrequency') {
                    if (typeof newValue === 'number' && newValue > 60) {
                        return { 
                            valid: false, 
                            message: `アニメーション頻度が高すぎます（${newValue}fps）。60fps以下を推奨` 
                        };
                    }
                }
                
                return { valid: true };
            },
            severity: 'low',
            autoFix: true,
            autoFixFn: (oldValue, newValue, context) => {
                if (context.propertyType === 'particleCount') {
                    return Math.min(newValue, 100);
                }
                if (context.propertyType === 'animationFrequency') {
                    return Math.min(newValue, 60);
                }
                return newValue;
            }
        });
        
        // Configuration consistency check
        this.addRule('configuration_consistency', {
            category: this.ruleCategories.COMPATIBILITY,
            description: '設定値間の整合性をチェック',
            check: (oldValue, newValue, context) => {
                if (!context.relatedValues) return { valid: true };
                
                // Health and score relationship check
                if (context.propertyType === 'health') {
                    const score = context.relatedValues[context.bubbleType]?.score || newValue;
                    const healthScoreRatio = score / newValue;
                    
                    if (healthScoreRatio < 0.5) {
                        return { 
                            valid: false, 
                            message: `体力に対してスコアが低すぎます（比率: ${healthScoreRatio.toFixed(2)}）。バランス調整を推奨` 
                        };
                    }
                    
                    if (healthScoreRatio > 10) {
                        return { 
                            valid: false, 
                            message: `体力に対してスコアが高すぎます（比率: ${healthScoreRatio.toFixed(2)}）。バランス調整を推奨` 
                        };
                    }
                }
                
                return { valid: true };
            },
            severity: 'medium',
            autoFix: false
        });
    }
    
    /**
     * Add validation rule
     * @param {string} name - Rule name
     * @param {Object} rule - Rule definition
     */
    addRule(name, rule) {
        if (!name || typeof name !== 'string') {
            throw new Error('Rule name must be a non-empty string');
        }
        
        if (!rule || typeof rule.check !== 'function') {
            throw new Error('Rule must have a check function');
        }
        
        const ruleDefinition = {
            name,
            category: rule.category || 'general',
            description: rule.description || '',
            check: rule.check,
            severity: rule.severity || 'medium',
            autoFix: rule.autoFix || false,
            autoFixFn: rule.autoFixFn || null,
            enabled: rule.enabled !== false,
            priority: rule.priority || 1
        };
        
        this.rules.set(name, ruleDefinition);
        console.log(`[ValidationRuleDefinitions] Rule added: ${name}`);
    }
    
    /**
     * Remove validation rule
     * @param {string} name - Rule name
     * @returns {boolean} Success flag
     */
    removeRule(name) {
        const deleted = this.rules.delete(name);
        if (deleted) {
            console.log(`[ValidationRuleDefinitions] Rule removed: ${name}`);
        }
        return deleted;
    }
    
    /**
     * Get rule by name
     * @param {string} name - Rule name
     * @returns {Object|null} Rule definition
     */
    getRule(name) {
        return this.rules.get(name) || null;
    }
    
    /**
     * Get all rules
     * @param {Object} filters - Optional filters
     * @returns {Array} Array of rules
     */
    getRules(filters = {}) {
        let rules = Array.from(this.rules.values());
        
        if (filters.category) {
            rules = rules.filter(rule => rule.category === filters.category);
        }
        
        if (filters.severity) {
            rules = rules.filter(rule => rule.severity === filters.severity);
        }
        
        if (filters.enabled !== undefined) {
            rules = rules.filter(rule => rule.enabled === filters.enabled);
        }
        
        if (filters.autoFix !== undefined) {
            rules = rules.filter(rule => rule.autoFix === filters.autoFix);
        }
        
        return rules;
    }
    
    /**
     * Get bubble health limits
     * @param {string} bubbleType - Bubble type
     * @returns {Object} Limits
     */
    getBubbleHealthLimits(bubbleType) {
        const limits = {
            normal: { min: 1, max: 5 },
            stone: { min: 1, max: 8 },
            iron: { min: 2, max: 12 },
            diamond: { min: 3, max: 20 },
            rainbow: { min: 1, max: 3 },
            pink: { min: 1, max: 3 },
            clock: { min: 1, max: 3 },
            electric: { min: 1, max: 5 },
            poison: { min: 1, max: 5 },
            spiky: { min: 1, max: 8 },
            escaping: { min: 1, max: 5 },
            boss: { min: 5, max: 50 },
            golden: { min: 1, max: 10 },
            frozen: { min: 2, max: 15 },
            magnetic: { min: 1, max: 8 },
            explosive: { min: 1, max: 6 },
            phantom: { min: 1, max: 4 },
            multiplier: { min: 1, max: 3 }
        };
        
        return limits[bubbleType] || { min: 1, max: 10 };
    }
    
    /**
     * Get score limits
     * @param {string} bubbleType - Bubble type
     * @returns {Object} Limits
     */
    getScoreLimits(bubbleType) {
        const limits = {
            normal: { max: 50 },
            stone: { max: 100 },
            iron: { max: 150 },
            diamond: { max: 200 },
            rainbow: { max: 300 },
            pink: { max: 80 },
            clock: { max: 100 },
            electric: { max: 120 },
            poison: { max: 60 },
            spiky: { max: 100 },
            escaping: { max: 80 },
            boss: { max: 500 },
            golden: { max: 400 },
            frozen: { max: 120 },
            magnetic: { max: 100 },
            explosive: { max: 180 },
            phantom: { max: 150 },
            multiplier: { max: 250 }
        };
        
        return limits[bubbleType] || { max: 100 };
    }
    
    /**
     * Get change threshold
     * @param {string} bubbleType - Bubble type
     * @param {string} propertyType - Property type
     * @returns {number} Threshold ratio
     */
    getChangeThreshold(bubbleType, propertyType) {
        // Special bubble types have stricter change thresholds
        const strictTypes = ['boss', 'rainbow', 'electric'];
        const baseThreshold = strictTypes.includes(bubbleType) ? 0.3 : 0.5;
        
        // Property type modifiers
        const propertyModifiers = {
            health: 1.0,
            score: 0.8,
            size: 0.6,
            maxAge: 1.2,
            duration: 1.0,
            intensity: 0.4
        };
        
        const modifier = propertyModifiers[propertyType] || 1.0;
        return baseThreshold * modifier;
    }
    
    /**
     * Enable/disable rule
     * @param {string} ruleName - Rule name
     * @param {boolean} enabled - Enable flag
     * @returns {boolean} Success flag
     */
    setRuleEnabled(ruleName, enabled) {
        const rule = this.rules.get(ruleName);
        if (!rule) {
            console.warn(`[ValidationRuleDefinitions] Rule not found: ${ruleName}`);
            return false;
        }
        
        rule.enabled = enabled;
        console.log(`[ValidationRuleDefinitions] Rule ${enabled ? 'enabled' : 'disabled'}: ${ruleName}`);
        return true;
    }
    
    /**
     * Enable/disable rules by category
     * @param {string} category - Category
     * @param {boolean} enabled - Enable flag
     * @returns {number} Number of changed rules
     */
    setCategoryEnabled(category, enabled) {
        let changedCount = 0;
        
        for (const rule of this.rules.values()) {
            if (rule.category === category) {
                rule.enabled = enabled;
                changedCount++;
            }
        }
        
        console.log(`[ValidationRuleDefinitions] Category ${enabled ? 'enabled' : 'disabled'}: ${category} (${changedCount} rules)`);
        return changedCount;
    }
    
    /**
     * Get rule statistics
     * @returns {Object} Rule statistics
     */
    getStatistics() {
        const stats = {
            totalRules: this.rules.size,
            enabledRules: 0,
            disabledRules: 0,
            byCategory: {},
            bySeverity: {},
            autoFixableRules: 0
        };
        
        for (const rule of this.rules.values()) {
            if (rule.enabled) {
                stats.enabledRules++;
            } else {
                stats.disabledRules++;
            }
            
            stats.byCategory[rule.category] = (stats.byCategory[rule.category] || 0) + 1;
            stats.bySeverity[rule.severity] = (stats.bySeverity[rule.severity] || 0) + 1;
            
            if (rule.autoFix) {
                stats.autoFixableRules++;
            }
        }
        
        return stats;
    }
    
    /**
     * Cleanup rule definitions
     */
    destroy() {
        this.rules.clear();
        console.log('[ValidationRuleDefinitions] Rule definitions destroyed');
    }
}