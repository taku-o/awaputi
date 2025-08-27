import { BaseComponent } from '../BaseComponent.js';

/**
 * SafetyValidator - コマンド安全性検証・破壊的操作チェックコンポーネント
 */
export class SafetyValidator extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'SafetyValidator');
        this.safetyChecks = {
            confirmDestructive: true,
            preventDataLoss: true,
            validateInputs: true,
            logAllChanges: true
        };
    }

    /**
     * 破壊的操作の検証
     * @param {string} operation - 操作名
     * @param {Array} args - コマンド引数
     * @returns {boolean} 操作が安全かどうか
     */
    validateDestructiveOperation(operation, args) {
        if (!this.safetyChecks.confirmDestructive) {
            return true;
        }

        const destructiveOperations = [
            'reset', 'stop', 'clear-bubbles', 'reset-player', 'reset-combo'
        ];

        if (destructiveOperations.includes(operation)) {
            return args.includes('--confirm');
        }

        return true;
    }

    /**
     * 入力値の検証
     * @param {string} command - コマンド名
     * @param {Array} args - 引数
     * @returns {Object} 検証結果
     */
    validateInputs(command, args) {
        if (!this.safetyChecks.validateInputs) {
            return { valid: true };
        }

        const validators = {
            'set-score': (args) => {
                if (args.length === 0) return { valid: false, message: 'Score value required' };
                const score = parseInt(args[0]);
                if (isNaN(score)) return { valid: false, message: 'Score must be a number' };
                if (score < 0) return { valid: false, message: 'Score cannot be negative' };
                if (score > 999999999) return { valid: false, message: 'Score too large' };
                return { valid: true };
            },

            'add-score': (args) => {
                if (args.length === 0) return { valid: false, message: 'Score addition value required' };
                const addition = parseInt(args[0]);
                if (isNaN(addition)) return { valid: false, message: 'Addition must be a number' };
                if (Math.abs(addition) > 999999) return { valid: false, message: 'Addition value too large' };
                return { valid: true };
            },

            'set-ap': (args) => {
                if (args.length === 0) return { valid: false, message: 'AP value required' };
                const ap = parseInt(args[0]);
                if (isNaN(ap)) return { valid: false, message: 'AP must be a number' };
                if (ap < 0) return { valid: false, message: 'AP cannot be negative' };
                if (ap > 999999) return { valid: false, message: 'AP value too large' };
                return { valid: true };
            },

            'set-level': (args) => {
                if (args.length === 0) return { valid: false, message: 'Level value required' };
                const level = parseInt(args[0]);
                if (isNaN(level)) return { valid: false, message: 'Level must be a number' };
                if (level < 1 || level > 100) return { valid: false, message: 'Level must be between 1 and 100' };
                return { valid: true };
            },

            'spawn-bubble': (args) => {
                if (args.length > 1) {
                    const count = parseInt(args[1]);
                    if (!isNaN(count) && (count < 1 || count > 50)) {
                        return { valid: false, message: 'Bubble count must be between 1 and 50' };
                    }
                }
                if (args.length > 2) {
                    const x = parseFloat(args[2]);
                    const y = parseFloat(args[3]);
                    if (!isNaN(x) && (x < 0 || x > 1920)) {
                        return { valid: false, message: 'X coordinate out of bounds' };
                    }
                    if (!isNaN(y) && (y < 0 || y > 1080)) {
                        return { valid: false, message: 'Y coordinate out of bounds' };
                    }
                }
                return { valid: true };
            },

            'goto-stage': (args) => {
                if (args.length === 0) return { valid: false, message: 'Stage name required' };
                const stageName = args[0];
                const validStages = ['tutorial', 'normal', 'hard', 'expert', 'boss', 'endless'];
                if (!validStages.includes(stageName)) {
                    return { 
                        valid: false, 
                        message: `Invalid stage. Valid options: ${validStages.join(', ')}` 
                    };
                }
                return { valid: true };
            },

            'set-difficulty': (args) => {
                if (args.length === 0) return { valid: false, message: 'Difficulty level required' };
                const difficulty = args[0].toLowerCase();
                const validDifficulties = ['easy', 'normal', 'hard', 'expert'];
                if (!validDifficulties.includes(difficulty)) {
                    return { 
                        valid: false, 
                        message: `Invalid difficulty. Valid options: ${validDifficulties.join(', ')}` 
                    };
                }
                return { valid: true };
            }
        };

        const validator = validators[command];
        if (validator) {
            return validator(args);
        }

        return { valid: true };
    }

    /**
     * データ損失防止チェック
     * @param {string} operation - 操作名
     * @returns {boolean} データ損失の可能性
     */
    checkDataLossPrevention(operation) {
        if (!this.safetyChecks.preventDataLoss) {
            return false;
        }

        const dataLossOperations = [
            'reset', 'stop', 'reset-player', 'clear-bubbles'
        ];

        return dataLossOperations.includes(operation);
    }

    /**
     * 操作の安全性レベルを評価
     * @param {string} command - コマンド名
     * @param {Array} args - 引数
     * @returns {Object} 安全性評価
     */
    assessOperationSafety(command, args) {
        const safety = {
            level: 'safe',
            warnings: [],
            recommendations: []
        };

        // 破壊的操作チェック
        if (!this.validateDestructiveOperation(command, args)) {
            safety.level = 'dangerous';
            safety.warnings.push('This is a destructive operation that requires confirmation');
            safety.recommendations.push('Add --confirm flag to proceed');
        }

        // 入力検証
        const inputValidation = this.validateInputs(command, args);
        if (!inputValidation.valid) {
            safety.level = 'unsafe';
            safety.warnings.push(`Invalid input: ${inputValidation.message}`);
        }

        // データ損失チェック
        if (this.checkDataLossPrevention(command)) {
            if (safety.level === 'safe') safety.level = 'risky';
            safety.warnings.push('This operation may cause data loss');
            safety.recommendations.push('Consider creating a backup first');
        }

        // 高リスク操作の特別チェック
        if (['reset-player', 'reset'].includes(command)) {
            safety.level = 'critical';
            safety.warnings.push('This will permanently reset data');
            safety.recommendations.push('Use --backup flag to create a backup');
        }

        return safety;
    }

    /**
     * コマンド実行前の安全性検証
     * @param {string} command - コマンド名
     * @param {Array} args - 引数
     * @returns {Object} 検証結果と推奨事項
     */
    validateCommandExecution(command, args) {
        const safety = this.assessOperationSafety(command, args);
        const inputValidation = this.validateInputs(command, args);

        const result = {
            canExecute: inputValidation.valid && 
                       (safety.level !== 'dangerous' || this.validateDestructiveOperation(command, args)),
            safety: safety,
            inputValidation: inputValidation,
            recommendations: []
        };

        // 推奨事項の統合
        result.recommendations = [
            ...safety.recommendations,
            ...(inputValidation.recommendations || [])
        ];

        // 実行可能だが注意が必要な場合
        if (result.canExecute && (safety.level === 'risky' || safety.level === 'critical')) {
            result.recommendations.push('Proceed with caution');
        }

        return result;
    }

    /**
     * 安全性設定の更新
     * @param {Object} settings - 新しい設定
     */
    updateSafetySettings(settings) {
        Object.assign(this.safetyChecks, settings);
        console.log('[SafetyValidator] Safety settings updated');
    }

    /**
     * 現在の安全性設定を取得
     * @returns {Object} 安全性設定
     */
    getSafetySettings() {
        return { ...this.safetyChecks };
    }

    /**
     * 安全性統計を取得
     * @returns {Object} 統計情報
     */
    getSafetyStatistics() {
        // 実際の統計はCommandHistoryManagerから取得する必要がある
        return {
            destructiveOperationsBlocked: 0,
            invalidInputsDetected: 0,
            safetyWarningsIssued: 0,
            currentSafetyLevel: this.getCurrentSafetyLevel()
        };
    }

    /**
     * 現在の全体的な安全性レベルを取得
     * @private
     */
    getCurrentSafetyLevel() {
        const settings = this.safetyChecks;
        let level = 0;

        if (settings.confirmDestructive) level += 25;
        if (settings.preventDataLoss) level += 25;
        if (settings.validateInputs) level += 25;
        if (settings.logAllChanges) level += 25;

        if (level >= 75) return 'high';
        if (level >= 50) return 'medium';
        if (level >= 25) return 'low';
        return 'minimal';
    }

    /**
     * 緊急安全モードの有効化
     */
    enableEmergencyMode() {
        this.safetyChecks = {
            confirmDestructive: true,
            preventDataLoss: true,
            validateInputs: true,
            logAllChanges: true
        };
        console.warn('[SafetyValidator] Emergency safety mode enabled - all protections active');
    }

    /**
     * 開発モードの有効化（安全性チェックを緩和）
     */
    enableDevelopmentMode() {
        this.safetyChecks = {
            confirmDestructive: false,
            preventDataLoss: false,
            validateInputs: true,
            logAllChanges: true
        };
        console.warn('[SafetyValidator] Development mode enabled - reduced safety checks');
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        super.cleanup();
    }
}