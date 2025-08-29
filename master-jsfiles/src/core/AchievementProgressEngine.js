/**
 * 実績進捗計算エンジンクラス
 */
export class AchievementProgressEngine {
    constructor() {
        // 進捗計算機能
        this.calculators = new Map();
        this.milestoneTrackers = new Map();
        this.conditionEvaluators = new Map();
        
        // 進捗データ検証
        this.validators = new Map();
        
        // パフォーマンス統計
        this.performanceStats = {
            calculationCount: 0,
            totalCalculationTime: 0,
            averageCalculationTime: 0,
            errorCount: 0
        };
        
        this.initialize();
    }
    
    /**
     * エンジンを初期化
     */
    initialize() {
        this.registerDefaultCalculators();
        this.registerDefaultValidators();
        this.registerDefaultEvaluators();
        console.log('Achievement Progress Engine initialized');
    }
    
    /**
     * デフォルトの進捗計算機を登録
     */
    registerDefaultCalculators() {
        // 累積型進捗計算
        this.calculators.set('cumulative', {
            calculate: (current, increment, target) => {
                return Math.min(current + increment, target);
            },
            getPercentage: (current, target) => {
                return target > 0 ? (current / target) * 100 : 0;
            }
        });
        
        // 最大値型進捗計算
        this.calculators.set('maximum', {
            calculate: (current, newValue, target) => {
                return Math.max(current, newValue);
            },
            getPercentage: (current, target) => {
                return target > 0 ? (current / target) * 100 : 0;
            }
        });
        
        // 連続型進捗計算
        this.calculators.set('consecutive', {
            calculate: (current, newValue, target, context) => {
                if (context && context.isConsecutive) {
                    return Math.min(current + 1, target);
                } else {
                    return 0; // 連続が途切れた場合はリセット
                }
            },
            getPercentage: (current, target) => {
                return target > 0 ? (current / target) * 100 : 0;
            }
        });
        
        // 条件達成型進捗計算
        this.calculators.set('conditional', {
            calculate: (current, conditionsMet, target) => {
                return conditionsMet.length;
            },
            getPercentage: (current, target) => {
                return target > 0 ? (current / target) * 100 : 0;
            }
        });
        
        // 複合型進捗計算
        this.calculators.set('composite', {
            calculate: (current, data, target, context) => {
                if (!context || !context.subConditions) return current;
                
                let totalProgress = 0;
                for (const condition of context.subConditions) {
                    const subProgress = this.calculateSubConditionProgress(condition, data);
                    totalProgress += subProgress;
                }
                
                return Math.min(totalProgress, target);
            },
            getPercentage: (current, target) => {
                return target > 0 ? (current / target) * 100 : 0;
            }
        });
    }
    
    /**
     * デフォルトの条件評価器を登録
     */
    registerDefaultEvaluators() {
        // 単一値比較
        this.conditionEvaluators.set('equals', (value, condition) => {
            return value === condition.target;
        });
        
        this.conditionEvaluators.set('greater_than', (value, condition) => {
            return value > condition.target;
        });
        
        this.conditionEvaluators.set('greater_equal', (value, condition) => {
            return value >= condition.target;
        });
        
        this.conditionEvaluators.set('less_than', (value, condition) => {
            return value < condition.target;
        });
        
        this.conditionEvaluators.set('range', (value, condition) => {
            return value >= condition.min && value <= condition.max;
        });
        
        // 時間ベース条件
        this.conditionEvaluators.set('time_window', (value, condition) => {
            const now = Date.now();
            const timeWindow = condition.windowMs || 24 * 60 * 60 * 1000; // デフォルト24時間
            return (now - value) <= timeWindow;
        });
        
        this.conditionEvaluators.set('date_range', (value, condition) => {
            const date = new Date(value);
            const startDate = new Date(condition.startDate);
            const endDate = new Date(condition.endDate);
            return date >= startDate && date <= endDate;
        });
        
        // 複数条件組み合わせ
        this.conditionEvaluators.set('all_of', (values, condition) => {
            return condition.subConditions.every(subCondition => 
                this.evaluateCondition(values, subCondition)
            );
        });
        
        this.conditionEvaluators.set('any_of', (values, condition) => {
            return condition.subConditions.some(subCondition => 
                this.evaluateCondition(values, subCondition)
            );
        });
        
        this.conditionEvaluators.set('none_of', (values, condition) => {
            return !condition.subConditions.some(subCondition => 
                this.evaluateCondition(values, subCondition)
            );
        });
        
        // パターンマッチング
        this.conditionEvaluators.set('pattern', (value, condition) => {
            const pattern = new RegExp(condition.pattern);
            return pattern.test(String(value));
        });
        
        // 配列操作
        this.conditionEvaluators.set('array_contains', (array, condition) => {
            return Array.isArray(array) && array.includes(condition.target);
        });
        
        this.conditionEvaluators.set('array_length', (array, condition) => {
            if (!Array.isArray(array)) return false;
            return this.conditionEvaluators.get(condition.operator)(array.length, condition);
        });
        
        // セット操作
        this.conditionEvaluators.set('set_contains_all', (set, condition) => {
            if (!(set instanceof Set)) return false;
            return condition.targets.every(target => set.has(target));
        });
        
        this.conditionEvaluators.set('set_size', (set, condition) => {
            if (!(set instanceof Set)) return false;
            return this.conditionEvaluators.get(condition.operator)(set.size, condition);
        });
    }
    
    /**
     * デフォルトのバリデーターを登録
     */
    registerDefaultValidators() {
        // 基本型検証
        this.validators.set('number', (value) => {
            return typeof value === 'number' && !isNaN(value) && isFinite(value);
        });
        
        this.validators.set('positive_number', (value) => {
            return this.validators.get('number')(value) && value >= 0;
        });
        
        this.validators.set('integer', (value) => {
            return this.validators.get('number')(value) && Number.isInteger(value);
        });
        
        this.validators.set('positive_integer', (value) => {
            return this.validators.get('integer')(value) && value >= 0;
        });
        
        // 範囲検証
        this.validators.set('range', (value, min, max) => {
            return this.validators.get('number')(value) && value >= min && value <= max;
        });
        
        // 日時検証
        this.validators.set('date', (value) => {
            const date = new Date(value);
            return !isNaN(date.getTime());
        });
        
        // 配列検証
        this.validators.set('array', (value) => {
            return Array.isArray(value);
        });
        
        this.validators.set('non_empty_array', (value) => {
            return Array.isArray(value) && value.length > 0;
        });
        
        // セット検証
        this.validators.set('set', (value) => {
            return value instanceof Set;
        });
        
        // オブジェクト検証
        this.validators.set('object', (value) => {
            return value !== null && typeof value === 'object' && !Array.isArray(value);
        });
    }
    
    /**
     * 進捗を計算
     */
    calculateProgress(achievementType, currentProgress, newData, targetValue, context = {}) {
        const startTime = performance.now();
        
        try {
            this.performanceStats.calculationCount++;
            
            const calculator = this.calculators.get(achievementType);
            if (!calculator) {
                throw new Error(`Unknown achievement type: ${achievementType}`);
            }
            
            // 進捗データを検証
            this.validateProgressData(currentProgress, newData, targetValue, context);
            
            // 進捗を計算
            const newProgress = calculator.calculate(currentProgress, newData, targetValue, context);
            
            // 結果を検証
            this.validateProgressResult(newProgress, targetValue);
            
            // 中間マイルストーンをチェック
            const milestones = this.checkMilestones(achievementType, newProgress, targetValue, context);
            
            const endTime = performance.now();
            this.updatePerformanceStats(endTime - startTime);
            
            return {
                progress: newProgress,
                percentage: calculator.getPercentage(newProgress, targetValue),
                milestones: milestones,
                isComplete: newProgress >= targetValue
            };
            
        } catch (error) {
            this.performanceStats.errorCount++;
            console.error('Progress calculation error:', error);
            throw error;
        }
    }
    
    /**
     * 条件を評価
     */
    evaluateCondition(data, condition) {
        try {
            const evaluator = this.conditionEvaluators.get(condition.type);
            if (!evaluator) {
                console.warn(`Unknown condition type: ${condition.type}`);
                return false;
            }
            
            // データから対象値を取得
            const value = this.extractValueFromData(data, condition.field);
            
            return evaluator(value, condition);
            
        } catch (error) {
            console.error('Condition evaluation error:', error);
            return false;
        }
    }
    
    /**
     * 複雑な実績解除条件を評価
     */
    evaluateComplexConditions(data, conditionSet) {
        try {
            if (!conditionSet || !conditionSet.conditions) {
                return false;
            }
            
            const results = conditionSet.conditions.map(condition => 
                this.evaluateCondition(data, condition)
            );
            
            // 論理演算子に基づいて結果を結合
            switch (conditionSet.operator) {
                case 'AND':
                    return results.every(result => result === true);
                case 'OR':
                    return results.some(result => result === true);
                case 'XOR':
                    return results.filter(result => result === true).length === 1;
                case 'NOT':
                    return !results[0];
                default:
                    return results.every(result => result === true); // デフォルトはAND
            }
            
        } catch (error) {
            console.error('Complex condition evaluation error:', error);
            return false;
        }
    }
    
    /**
     * 中間マイルストーンをチェック
     */
    checkMilestones(achievementType, currentProgress, targetValue, context) {
        const milestones = [];
        
        if (context.milestones && Array.isArray(context.milestones)) {
            for (const milestone of context.milestones) {
                const milestoneTarget = (milestone.percentage / 100) * targetValue;
                
                if (currentProgress >= milestoneTarget && !milestone.achieved) {
                    milestones.push({
                        id: milestone.id,
                        name: milestone.name,
                        percentage: milestone.percentage,
                        reward: milestone.reward || null
                    });
                    milestone.achieved = true;
                }
            }
        }
        
        return milestones;
    }
    
    /**
     * 進捗データを検証
     */
    validateProgressData(currentProgress, newData, targetValue, context) {
        // 現在進捗の検証
        if (!this.validators.get('positive_number')(currentProgress)) {
            throw new Error('Invalid current progress value');
        }
        
        // 目標値の検証
        if (!this.validators.get('positive_number')(targetValue) || targetValue <= 0) {
            throw new Error('Invalid target value');
        }
        
        // 新データの検証（型に応じて）
        if (newData !== null && newData !== undefined) {
            const dataType = context.dataType || 'number';
            const validator = this.validators.get(dataType);
            
            if (validator && !validator(newData)) {
                throw new Error(`Invalid new data for type: ${dataType}`);
            }
        }
    }
    
    /**
     * 進捗結果を検証
     */
    validateProgressResult(result, targetValue) {
        if (!this.validators.get('positive_number')(result)) {
            throw new Error('Invalid progress calculation result');
        }
        
        if (result > targetValue * 1.1) { // 10%のマージンを許可
            console.warn(`Progress result ${result} exceeds target ${targetValue}`);
        }
    }
    
    /**
     * データから値を抽出
     */
    extractValueFromData(data, fieldPath) {
        if (!fieldPath) return data;
        
        const fields = fieldPath.split('.');
        let value = data;
        
        for (const field of fields) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = value[field];
        }
        
        return value;
    }
    
    /**
     * サブ条件の進捗を計算
     */
    calculateSubConditionProgress(condition, data) {
        try {
            const isConditionMet = this.evaluateCondition(data, condition);
            return isConditionMet ? condition.weight || 1 : 0;
            
        } catch (error) {
            console.error('Sub-condition progress calculation error:', error);
            return 0;
        }
    }
    
    /**
     * カスタム計算機を登録
     */
    registerCalculator(type, calculator) {
        if (!calculator.calculate || !calculator.getPercentage) {
            throw new Error('Calculator must have calculate and getPercentage methods');
        }
        
        this.calculators.set(type, calculator);
    }
    
    /**
     * カスタム条件評価器を登録
     */
    registerConditionEvaluator(type, evaluator) {
        if (typeof evaluator !== 'function') {
            throw new Error('Condition evaluator must be a function');
        }
        
        this.conditionEvaluators.set(type, evaluator);
    }
    
    /**
     * カスタムバリデーターを登録
     */
    registerValidator(type, validator) {
        if (typeof validator !== 'function') {
            throw new Error('Validator must be a function');
        }
        
        this.validators.set(type, validator);
    }
    
    /**
     * パフォーマンス統計を更新
     */
    updatePerformanceStats(executionTime) {
        this.performanceStats.totalCalculationTime += executionTime;
        this.performanceStats.averageCalculationTime = 
            this.performanceStats.totalCalculationTime / this.performanceStats.calculationCount;
    }
    
    /**
     * パフォーマンス統計を取得
     */
    getPerformanceStats() {
        return {
            ...this.performanceStats,
            registeredCalculators: this.calculators.size,
            registeredEvaluators: this.conditionEvaluators.size,
            registeredValidators: this.validators.size
        };
    }
    
    /**
     * 進捗データを修正
     */
    repairProgressData(progressData, achievementDefinition) {
        const repaired = { ...progressData };
        
        try {
            // 基本構造の修正
            if (!repaired.current) repaired.current = 0;
            if (!repaired.target) repaired.target = achievementDefinition.target || 1;
            
            // 型の修正
            if (typeof repaired.current !== 'number') {
                repaired.current = parseFloat(repaired.current) || 0;
            }
            
            if (typeof repaired.target !== 'number') {
                repaired.target = parseFloat(repaired.target) || 1;
            }
            
            // 値の範囲修正
            repaired.current = Math.max(0, repaired.current);
            repaired.target = Math.max(1, repaired.target);
            
            // 進捗が目標を超えている場合の修正
            if (repaired.current > repaired.target) {
                repaired.current = repaired.target;
            }
            
            // マイルストーンデータの修正
            if (repaired.milestones && !Array.isArray(repaired.milestones)) {
                repaired.milestones = [];
            }
            
            return repaired;
            
        } catch (error) {
            console.error('Progress data repair error:', error);
            return {
                current: 0,
                target: achievementDefinition.target || 1,
                milestones: []
            };
        }
    }
    
    /**
     * エンジンの診断情報を取得
     */
    getDiagnostics() {
        return {
            performance: this.getPerformanceStats(),
            registrations: {
                calculators: Array.from(this.calculators.keys()),
                evaluators: Array.from(this.conditionEvaluators.keys()),
                validators: Array.from(this.validators.keys())
            },
            memoryUsage: {
                calculators: this.calculators.size,
                evaluators: this.conditionEvaluators.size,
                validators: this.validators.size,
                milestoneTrackers: this.milestoneTrackers.size
            }
        };
    }
    
    /**
     * エンジンをリセット
     */
    reset() {
        this.performanceStats = {
            calculationCount: 0,
            totalCalculationTime: 0,
            averageCalculationTime: 0,
            errorCount: 0
        };
        
        this.milestoneTrackers.clear();
    }
}