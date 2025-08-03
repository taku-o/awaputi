/**
 * SimplificationModeController - 簡素化モード制御システム
 * 
 * 異なる簡素化レベルとモードの管理、設定、切り替えを担当
 */

export class SimplificationModeController {
    constructor() {
        this.currentMode = 'standard';
        this.currentLevel = 'none';
        this.autoMode = false;
        
        this.simplificationLevels = this.initializeSimplificationLevels();
        this.modes = this.initializeModes();
        this.modeHistory = [];
        
        this.setupModeTransitions();
    }

    /**
     * 簡素化レベルを初期化
     */
    initializeSimplificationLevels() {
        return {
            none: {
                name: '標準',
                description: '通常の複雑さ',
                complexity: 1.0,
                features: {
                    allControls: true,
                    animations: true,
                    effects: true,
                    detailedInfo: true,
                    advancedOptions: true
                }
            },
            minimal: {
                name: '軽微簡素化',
                description: '装飾的要素を軽減',
                complexity: 0.8,
                features: {
                    allControls: true,
                    animations: 'reduced',
                    effects: 'reduced',
                    detailedInfo: true,
                    advancedOptions: true
                }
            },
            moderate: {
                name: '中程度簡素化',
                description: '重要な機能に集中',
                complexity: 0.6,
                features: {
                    allControls: 'essential',
                    animations: 'minimal',
                    effects: 'minimal',
                    detailedInfo: 'simplified',
                    advancedOptions: false
                }
            },
            significant: {
                name: '大幅簡素化',
                description: '最小限のインターフェース',
                complexity: 0.4,
                features: {
                    allControls: 'basic',
                    animations: false,
                    effects: false,
                    detailedInfo: 'basic',
                    advancedOptions: false
                }
            },
            extreme: {
                name: '極限簡素化',
                description: '必要最小限の要素のみ',
                complexity: 0.2,
                features: {
                    allControls: 'minimal',
                    animations: false,
                    effects: false,
                    detailedInfo: false,
                    advancedOptions: false
                }
            }
        };
    }

    /**
     * モードを初期化
     */
    initializeModes() {
        return {
            standard: {
                name: '標準',
                description: '通常のインターフェース',
                level: 'none',
                settings: {
                    progressiveDisclosure: false,
                    clutterReduction: false,
                    visualHierarchy: 'normal',
                    informationDensity: 'normal'
                }
            },
            focused: {
                name: '集中モード',
                description: 'ゲームプレイに集中',
                level: 'minimal',
                settings: {
                    progressiveDisclosure: true,
                    clutterReduction: true,
                    visualHierarchy: 'simplified',
                    informationDensity: 'reduced'
                }
            },
            accessible: {
                name: 'アクセシビリティモード',
                description: '認知アクセシビリティ重視',
                level: 'moderate',
                settings: {
                    progressiveDisclosure: true,
                    clutterReduction: true,
                    visualHierarchy: 'clear',
                    informationDensity: 'minimal'
                }
            },
            beginner: {
                name: '初心者モード',
                description: '初心者向けの簡素化',
                level: 'significant',
                settings: {
                    progressiveDisclosure: true,
                    clutterReduction: true,
                    visualHierarchy: 'guided',
                    informationDensity: 'tutorial'
                }
            },
            minimal: {
                name: 'ミニマルモード',
                description: '最小限のUI',
                level: 'extreme',
                settings: {
                    progressiveDisclosure: true,
                    clutterReduction: true,
                    visualHierarchy: 'minimal',
                    informationDensity: 'essential'
                }
            }
        };
    }

    /**
     * モード遷移を設定
     */
    setupModeTransitions() {
        this.transitionRules = {
            standard: ['focused', 'accessible', 'beginner'],
            focused: ['standard', 'accessible'],
            accessible: ['standard', 'focused', 'beginner'],
            beginner: ['standard', 'accessible', 'minimal'],
            minimal: ['beginner', 'accessible']
        };
    }

    /**
     * モードを変更
     */
    changeMode(newMode, reason = 'manual') {
        if (!this.modes[newMode]) {
            throw new Error(`Unknown mode: ${newMode}`);
        }

        const previousMode = this.currentMode;
        this.currentMode = newMode;
        this.currentLevel = this.modes[newMode].level;

        // 履歴に記録
        this.modeHistory.push({
            from: previousMode,
            to: newMode,
            reason,
            timestamp: Date.now()
        });

        // 履歴サイズを制限
        if (this.modeHistory.length > 50) {
            this.modeHistory = this.modeHistory.slice(-25);
        }

        return this.getCurrentModeConfig();
    }

    /**
     * 簡素化レベルを変更
     */
    changeLevel(newLevel, reason = 'manual') {
        if (!this.simplificationLevels[newLevel]) {
            throw new Error(`Unknown level: ${newLevel}`);
        }

        this.currentLevel = newLevel;
        
        // カスタムモードを作成
        const customMode = {
            name: 'カスタム',
            description: `${this.simplificationLevels[newLevel].name}レベル`,
            level: newLevel,
            settings: this.modes[this.currentMode].settings
        };

        return customMode;
    }

    /**
     * 現在のモード設定を取得
     */
    getCurrentModeConfig() {
        const mode = this.modes[this.currentMode];
        const level = this.simplificationLevels[this.currentLevel];
        
        return {
            mode: {
                ...mode,
                current: true
            },
            level: {
                ...level,
                current: true
            },
            combined: {
                complexity: level.complexity,
                features: { ...level.features },
                settings: { ...mode.settings }
            }
        };
    }

    /**
     * 利用可能なモードを取得
     */
    getAvailableModes() {
        return Object.keys(this.modes).map(key => ({
            key,
            ...this.modes[key],
            isCurrent: key === this.currentMode
        }));
    }

    /**
     * 利用可能なレベルを取得
     */
    getAvailableLevels() {
        return Object.keys(this.simplificationLevels).map(key => ({
            key,
            ...this.simplificationLevels[key],
            isCurrent: key === this.currentLevel
        }));
    }

    /**
     * モード遷移の推奨を取得
     */
    getRecommendedModes() {
        const currentTransitions = this.transitionRules[this.currentMode] || [];
        return currentTransitions.map(mode => ({
            key: mode,
            ...this.modes[mode],
            reason: this.getTransitionReason(this.currentMode, mode)
        }));
    }

    /**
     * 遷移理由を取得
     */
    getTransitionReason(fromMode, toMode) {
        const reasons = {
            'standard-focused': 'ゲームプレイに集中したい場合',
            'standard-accessible': 'アクセシビリティが必要な場合',
            'standard-beginner': '初心者向けの簡素化が必要な場合',
            'focused-standard': '全機能にアクセスしたい場合',
            'focused-accessible': 'より高いアクセシビリティが必要な場合',
            'accessible-beginner': 'さらなる簡素化が必要な場合',
            'beginner-minimal': '最小限のUIが必要な場合',
            'minimal-beginner': '少し機能を増やしたい場合'
        };
        
        return reasons[`${fromMode}-${toMode}`] || '一般的な用途に適している';
    }

    /**
     * 自動モード切り替えを有効/無効
     */
    setAutoMode(enabled, criteria = {}) {
        this.autoMode = enabled;
        this.autoModeCriteria = {
            errorThreshold: criteria.errorThreshold || 3,
            timeThreshold: criteria.timeThreshold || 30000,
            complexityThreshold: criteria.complexityThreshold || 0.8,
            ...criteria
        };
    }

    /**
     * 自動モード評価
     */
    evaluateAutoMode(context) {
        if (!this.autoMode) return null;

        const { errorCount, sessionTime, userComplexityScore } = context;
        const criteria = this.autoModeCriteria;

        // エラー多発時の簡素化
        if (errorCount >= criteria.errorThreshold) {
            if (this.currentMode === 'standard') {
                return { recommendedMode: 'focused', reason: 'エラー多発のため' };
            } else if (this.currentMode === 'focused') {
                return { recommendedMode: 'accessible', reason: 'エラー継続のため' };
            }
        }

        // 長時間プレイ時の簡素化
        if (sessionTime > criteria.timeThreshold) {
            if (this.currentMode === 'standard') {
                return { recommendedMode: 'focused', reason: '長時間プレイのため' };
            }
        }

        // 複雑さスコアによる調整
        if (userComplexityScore < criteria.complexityThreshold) {
            const currentComplexity = this.simplificationLevels[this.currentLevel].complexity;
            if (currentComplexity > userComplexityScore) {
                return { 
                    recommendedLevel: this.findLevelByComplexity(userComplexityScore),
                    reason: 'ユーザー能力に合わせた調整'
                };
            }
        }

        return null;
    }

    /**
     * 複雑さスコアに対応するレベルを検索
     */
    findLevelByComplexity(targetComplexity) {
        let bestMatch = 'none';
        let bestDiff = Infinity;

        Object.entries(this.simplificationLevels).forEach(([key, level]) => {
            const diff = Math.abs(level.complexity - targetComplexity);
            if (diff < bestDiff) {
                bestDiff = diff;
                bestMatch = key;
            }
        });

        return bestMatch;
    }

    /**
     * モード履歴を取得
     */
    getModeHistory() {
        return this.modeHistory.slice(-10); // 最新10件
    }

    /**
     * 統計情報を取得
     */
    getStats() {
        const modeUsage = {};
        this.modeHistory.forEach(entry => {
            modeUsage[entry.to] = (modeUsage[entry.to] || 0) + 1;
        });

        return {
            currentMode: this.currentMode,
            currentLevel: this.currentLevel,
            autoMode: this.autoMode,
            modeUsage,
            transitionCount: this.modeHistory.length,
            averageComplexity: this.simplificationLevels[this.currentLevel].complexity
        };
    }

    /**
     * 設定をリセット
     */
    reset() {
        this.currentMode = 'standard';
        this.currentLevel = 'none';
        this.autoMode = false;
        this.modeHistory = [];
        this.autoModeCriteria = null;
    }

    /**
     * カスタムモードを作成
     */
    createCustomMode(name, config) {
        const customKey = `custom_${Date.now()}`;
        this.modes[customKey] = {
            name,
            description: config.description || 'カスタムモード',
            level: config.level || 'none',
            settings: config.settings || {},
            custom: true
        };
        return customKey;
    }

    /**
     * カスタムモードを削除
     */
    removeCustomMode(modeKey) {
        if (this.modes[modeKey] && this.modes[modeKey].custom) {
            delete this.modes[modeKey];
            if (this.currentMode === modeKey) {
                this.changeMode('standard', 'custom_mode_removed');
            }
            return true;
        }
        return false;
    }

    /**
     * 設定を保存
     */
    saveToStorage() {
        const data = {
            currentMode: this.currentMode,
            currentLevel: this.currentLevel,
            autoMode: this.autoMode,
            autoModeCriteria: this.autoModeCriteria,
            customModes: Object.fromEntries(
                Object.entries(this.modes).filter(([key, mode]) => mode.custom)
            )
        };
        localStorage.setItem('bubblePop_simplificationSettings', JSON.stringify(data));
    }

    /**
     * 設定を読み込み
     */
    loadFromStorage() {
        const stored = localStorage.getItem('bubblePop_simplificationSettings');
        if (stored) {
            const data = JSON.parse(stored);
            this.currentMode = data.currentMode || 'standard';
            this.currentLevel = data.currentLevel || 'none';
            this.autoMode = data.autoMode || false;
            this.autoModeCriteria = data.autoModeCriteria || null;
            
            // カスタムモードを復元
            if (data.customModes) {
                Object.assign(this.modes, data.customModes);
            }
        }
    }
}