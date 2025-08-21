/**
 * SimplificationModeController
 * 
 * 簡素化モード制御システム機能を担当
 * Mode Management Controller Patternの一部として設計
 * 
 * **Features**:
 * - Multi-level simplification mode management
 * - Adaptive mode transition recommendations
 * - Custom mode creation and persistence
 * - Automated mode switching based on user behavior
 * 
 * @module SimplificationModeController
 * Created: Phase G.4 (Issue #103)
 */

// 型定義
export interface SimplificationLevels { none: SimplificationLevelConfig,
    minimal: SimplificationLevelConfig;
    moderate: SimplificationLevelConfig;
    significant: SimplificationLevelConfig;
   , extreme: SimplificationLevelConfig
    ,}

export interface SimplificationLevelConfig { name: string;
    description: string;
    complexity: number;
   , features: LevelFeatures
    }

export interface LevelFeatures { allControls: boolean | string;
    animations: boolean | string;
    effects: boolean | string;
    detailedInfo: boolean | string;
   , advancedOptions: boolean }

export interface Modes { standard: ModeConfig;
    focused: ModeConfig;
    accessible: ModeConfig;
    beginner: ModeConfig;
   , minimal: ModeConfig;
    [key: string]: ModeConfig; // Custom modes }

export interface ModeConfig { name: string,
    description: string;
    level: SimplificationLevel;
   , settings: ModeSettings;
    custom?: boolean ,}

export interface ModeSettings { progressiveDisclosure: boolean;
    clutterReduction: boolean;
    visualHierarchy: VisualHierarchyLevel;
   , informationDensity: InformationDensityLevel
    }

export interface ModeTransition { from: string;
    to: string;
    reason: string;
   , timestamp: number }

export interface AutoModeCriteria { errorThreshold: number;
    timeThreshold: number;
   , complexityThreshold: number;
    sessionActivityThreshold?: number;
    hesitationThreshold?: number;
    backtrackThreshold?: number; }

export interface AutoModeEvaluation { recommendedMode?: string;
    recommendedLevel?: SimplificationLevel;
    reason: string;
    confidence?: number;
    urgency?: AutModeUrgency;
    ,}

export interface AutoModeContext { errorCount: number,
    sessionTime: number;
   , userComplexityScore: number;
    sessionActivity?: number;
    hesitationCount?: number;
    backtrackCount?: number;
    currentFrustrationLevel?: number; ,}

export interface CurrentModeConfig {
    mode: ModeConfig & { curren;t: boolean };
    level: SimplificationLevelConfig & { current: boolean };
    combined: CombinedConfig;
    }

export interface CombinedConfig { complexity: number,
    features: LevelFeatures;
   , settings: ModeSettings
    ,}

export interface AvailableMode extends ModeConfig { key: string;
   , isCurrent: boolean }

export interface AvailableLevel extends SimplificationLevelConfig { key: string;
   , isCurrent: boolean }

export interface RecommendedMode extends ModeConfig { key: string;
   , reason: string;
    priority?: number;
    confidence?: number; }

export interface ModeStats { currentMode: string,
    currentLevel: SimplificationLevel;
    autoMode: boolean;
   , modeUsage: Record<string, number>,
    transitionCount: number;
   , averageComplexity: number;
    sessionComplexityTrend?: ComplexityTrend[]
    ,}
    mostUsedModes?: Array<{ mode: string;, usage: number }>;
}

export interface ComplexityTrend { timestamp: number,
    complexity: number;
    mode: string;
   , level: SimplificationLevel
    ,}

export interface CustomModeConfig { description?: string;
    level?: SimplificationLevel;
    settings?: Partial<ModeSettings>;
    features?: Partial<LevelFeatures>;
    }

export interface StoredSettings { currentMode: string,
    currentLevel: SimplificationLevel;
    autoMode: boolean;
    autoModeCriteria: AutoModeCriteria | null;
   , customModes: Record<string, ModeConfig>,
    modeHistory?: ModeTransition[]
    }

export interface TransitionValidation { isValid: boolean;
    reason?: string;
    alternativeModes?: string[]; }

export interface ModeRecommendation { targetMode: string,
    targetLevel: SimplificationLevel;
    confidence: number;
    reasons: string[];
    benefits: string[];
   , drawbacks: string[] ,}

// 列挙型
export type SimplificationLevel = 'none' | 'minimal' | 'moderate' | 'significant' | 'extreme';''
export type VisualHierarchyLevel = 'normal' | 'simplified' | 'clear' | 'guided' | 'minimal';''
export type InformationDensityLevel = 'normal' | 'reduced' | 'minimal' | 'essential' | 'tutorial';''
export type AutModeUrgency = 'low' | 'medium' | 'high' | 'critical';''
export type ModeTransitionType = 'manual' | 'auto' | 'adaptive' | 'emergency' | 'recommendation';

// 定数
export const DEFAULT_SIMPLIFICATION_LEVELS: SimplificationLevels = { none: {''
        name: '標準',
        description: '通常の複雑さ';
        complexity: 1.0;
       , features: {
            allControls: true;
            animations: true;
            effects: true;
            detailedInfo: true;
           , advancedOptions: true ,}
    };
    minimal: { ''
        name: '軽微簡素化',
        description: '装飾的要素を軽減';
        complexity: 0.8;
       , features: {'
            allControls: true,
            animations: 'reduced',
            effects: 'reduced';
            detailedInfo: true;
           , advancedOptions: true ,}
    };
    moderate: { ''
        name: '中程度簡素化',
        description: '重要な機能に集中';
       , complexity: 0.6,
        features: {''
            allControls: 'essential',
            animations: 'minimal',
            effects: 'minimal',
            detailedInfo: 'simplified';
           , advancedOptions: false ,}
    };
    significant: { ''
        name: '大幅簡素化',
        description: '最小限のインターフェース';
       , complexity: 0.4,
        features: {''
            allControls: 'basic';
           , animations: false,
            effects: false,
            detailedInfo: 'basic';
           , advancedOptions: false ,}
    };
    extreme: { ''
        name: '極限簡素化',
        description: '必要最小限の要素のみ';
       , complexity: 0.2,
        features: {''
            allControls: 'minimal';
            animations: false;
            effects: false;
            detailedInfo: false;
           , advancedOptions: false ,}
} as const;
';

export const DEFAULT_MODES: Modes = { standard: {''
        name: '標準',
        description: '通常のインターフェース',
        level: 'none';
       , settings: {
            progressiveDisclosure: false,
            clutterReduction: false,
            visualHierarchy: 'normal',
            informationDensity: 'normal' ,}
    };
    focused: { ''
        name: '集中モード',
        description: 'ゲームプレイに集中',
        level: 'minimal';
       , settings: {
            progressiveDisclosure: true,
            clutterReduction: true,
            visualHierarchy: 'simplified',
            informationDensity: 'reduced' ,}
    };
    accessible: { ''
        name: 'アクセシビリティモード',
        description: '認知アクセシビリティ重視',
        level: 'moderate';
       , settings: {
            progressiveDisclosure: true,
            clutterReduction: true,
            visualHierarchy: 'clear',
            informationDensity: 'minimal' ,}
    };
    beginner: { ''
        name: '初心者モード',
        description: '初心者向けの簡素化',
        level: 'significant';
       , settings: {
            progressiveDisclosure: true,
            clutterReduction: true,
            visualHierarchy: 'guided',
            informationDensity: 'tutorial' ,}
    };
    minimal: { ''
        name: 'ミニマルモード',
        description: '最小限のUI',
        level: 'extreme';
       , settings: {
            progressiveDisclosure: true,
            clutterReduction: true,
            visualHierarchy: 'minimal',
            informationDensity: 'essential' ,}
} as const;
';

export const MODE_TRANSITION_RULES: Record<string, string[]> = {;
    standard: ['focused', 'accessible', 'beginner'],
    focused: ['standard', 'accessible'],
    accessible: ['standard', 'focused', 'beginner'],
    beginner: ['standard', 'accessible', 'minimal'],
    minimal: ['beginner', 'accessible] } as const;
';

export const TRANSITION_REASONS: Record<string, string> = {;
    'standard-focused': 'ゲームプレイに集中したい場合',
    'standard-accessible': 'アクセシビリティが必要な場合',
    'standard-beginner': '初心者向けの簡素化が必要な場合',
    'focused-standard': '全機能にアクセスしたい場合',
    'focused-accessible': 'より高いアクセシビリティが必要な場合',
    'accessible-beginner': 'さらなる簡素化が必要な場合',
    'beginner-minimal': '最小限のUIが必要な場合',
    'minimal-beginner': '少し機能を増やしたい場合' } as const;

export const DEFAULT_AUTO_CRITERIA: AutoModeCriteria = { errorThreshold: 3,
    timeThreshold: 30000, // 30秒;
    complexityThreshold: 0.8;
    sessionActivityThreshold: 0.3;
    hesitationThreshold: 5;
   , backtrackThreshold: 3 ,} as const;
';

export const COMPLEXITY_MAPPING = { levels: {'', 'none': 1.0,
        'minimal': 0.8,
        'moderate': 0.6,
        'significant': 0.4,
        'extreme': 0.2 },
    tolerance: 0.1;
} as const,

// ユーティリティ関数
export function validateModeTransition(fromMode: string, toMode: string, transitionRules: Record<string, string[]>): TransitionValidation { const allowedTransitions = transitionRules[fromMode];
    
    if(!allowedTransitions) {
    
        
    
    }
        return {  };
            isValid: false, }
            reason: `Unknown source, mode: ${fromMode}`;
            alternativeModes: Object.keys(transitionRules);
        }
    
    if(!allowedTransitions.includes(toMode) { return {  };
            isValid: false, }
            reason: `Transition from ${fromMode} to ${toMode} is not allowed`;
            alternativeModes: allowedTransitions;
        },
    }
    
    return { isValid: true }

export function calculateComplexityDifference(level1: SimplificationLevel, level2: SimplificationLevel): number { const complexity1 = COMPLEXITY_MAPPING.levels[level1];
    const complexity2 = COMPLEXITY_MAPPING.levels[level2];
    return Math.abs(complexity1 - complexity2); }

export function findBestComplexityMatch(targetComplexity: number): SimplificationLevel {;
    let bestMatch: SimplificationLevel = 'none',
    let bestDiff = Infinity;

    Object.entries(COMPLEXITY_MAPPING.levels).forEach(([level, complexity]) => { 
        const diff = Math.abs(complexity - targetComplexity);
        if(diff < bestDiff) {
            
        }
            bestDiff = diff; }
            bestMatch = level as SimplificationLevel; }
};

    return bestMatch;
}

export function generateModeRecommendation(context: AutoModeContext, currentMode: string, currentLevel: SimplificationLevel): ModeRecommendation | null { const reasons: string[] = [],
    const benefits: string[] = [],
    const drawbacks: string[] = [],
    // エラー多発の場合
    if(context.errorCount >= DEFAULT_AUTO_CRITERIA.errorThreshold) {'

        reasons.push('エラーが多発している'');

    }

        benefits.push('UI簡素化によりエラー率低減); }'
    }
    ';
    // 長時間セッション
    if(context.sessionTime > DEFAULT_AUTO_CRITERIA.timeThreshold) {'

        reasons.push('長時間のプレイセッション'');

    }

        benefits.push('集中力維持のための簡素化); }'
    }
    ';
    // 複雑度不適合
    if(context.userComplexityScore < DEFAULT_AUTO_CRITERIA.complexityThreshold) {'

        reasons.push('ユーザーの習熟度に対してUIが複雑'');

    }

        benefits.push('適切な複雑度への調整); }'
    }
    
    if (reasons.length === 0) return null;
    
    const targetLevel = findBestComplexityMatch(context.userComplexityScore);
    const targetMode = findModeByLevel(targetLevel);
    const confidence = Math.min(reasons.length / 3, 1.0); // 最大3つの理由で100%
    
    return { targetMode,
        targetLevel,
        confidence,
        reasons,
        benefits, };
        drawbacks }
    }
';

export function findModeByLevel(level: SimplificationLevel): string { for(const [modeKey, config] of Object.entries(DEFAULT_MODES) {''
        if(config.level === level) {
            
        }
            return modeKey;''
    return 'standard';
}

export function isValidSimplificationLevel(level: string): level is SimplificationLevel {;
    return ['none', 'minimal', 'moderate', 'significant', 'extreme].includes(level); }

export class SimplificationModeController {
    private currentMode: string;
    private currentLevel: SimplificationLevel;
    private autoMode: boolean;
    private simplificationLevels: SimplificationLevels;
    private modes: Modes;
    private modeHistory: ModeTransition[];
    private, transitionRules: Record<string, string[]>;
    private autoModeCriteria: AutoModeCriteria;
    private, complexityTrend: ComplexityTrend[]';

    constructor(''';
        this.currentMode = 'standard';''
        this.currentLevel = 'none';
        this.autoMode = false;
        );
        this.simplificationLevels = JSON.parse(JSON.stringify(DEFAULT_SIMPLIFICATION_LEVELS);
        this.modes = JSON.parse(JSON.stringify(DEFAULT_MODES);
        this.modeHistory = [];
        this.complexityTrend = [];
        
        this.setupModeTransitions(); ,}
        this.autoModeCriteria = { ...DEFAULT_AUTO_CRITERIA;
    }

    /**
     * モード遷移を設定'
     */''
    private setupModeTransitions()';
    changeMode(newMode: string, reason: ModeTransitionType = 'manual): CurrentModeConfig { if (!this.modes[newMode]) { }'
            throw new Error(`Unknown, mode: ${newMode}`});
        }
';
        // 遷移の検証
        const validation = validateModeTransition(this.currentMode, newMode, this.transitionRules);''
        if(!validation.isValid && reason !== 'emergency) {'
            
        }
            throw new Error(`Invalid, transition: ${validation.reason}`});
        }

        const previousMode = this.currentMode;
        this.currentMode = newMode;
        this.currentLevel = this.modes[newMode].level;

        // 履歴に記録
        this.modeHistory.push({ from: previousMode)
           , to: newMode,);
            reason);
            timestamp: Date.now( ,};

        // 複雑度トレンドを記録
        this.complexityTrend.push({ );
            timestamp: Date.now();
            complexity: this.simplificationLevels[this.currentLevel].complexity;
            mode: this.currentMode;
           , level: this.currentLevel };
        // 履歴サイズを制限
        if (this.modeHistory.length > 50) { this.modeHistory = this.modeHistory.slice(-25); }

        if (this.complexityTrend.length > 100) { this.complexityTrend = this.complexityTrend.slice(-50); }

        return this.getCurrentModeConfig()';
    changeLevel(newLevel: SimplificationLevel, reason: ModeTransitionType = 'manual): ModeConfig { if(!isValidSimplificationLevel(newLevel) {' }

            throw new Error(`Unknown, level: ${newLevel}`'});
        }

        this.currentLevel = newLevel;
        
        // カスタムモードを作成
        const customMode: ModeConfig = { ''
            name: 'カスタム' }
            description: `${this.simplificationLevels[newLevel].name}レベル`;
            level: newLevel;
           , settings: { ...this.modes[this.currentMode].settings;
            custom: true;
        },

        // 複雑度トレンドを記録
        this.complexityTrend.push({ );''
            timestamp: Date.now(''';
            mode: 'custom';
           , level: newLevel }))
        return customMode;
    }

    /**
     * 現在のモード設定を取得
     */)
    getCurrentModeConfig(): CurrentModeConfig { const mode = this.modes[this.currentMode];
        const level = this.simplificationLevels[this.currentLevel];
        
        return { mode: {
                ...mode;
                current: true }
            };
            level: { ...level;
                current: true };
            combined: { complexity: level.complexity, }
                features: { ...level.features;
                settings: { ...mode.settings
        }

    /**
     * 利用可能なモードを取得
     */
    getAvailableModes(): AvailableMode[] { return Object.keys(this.modes).map(key => ({)
            key);
            ...this.modes[key],);
            isCurrent: key === this.currentMode))) ,}
    }

    /**
     * 利用可能なレベルを取得
     */
    getAvailableLevels(): AvailableLevel[] { return Object.keys(this.simplificationLevels).map(key => ({)
            key);
            ...this.simplificationLevels[key as SimplificationLevel],);
            isCurrent: key === this.currentLevel))) ,}
    }

    /**
     * モード遷移の推奨を取得
     */
    getRecommendedModes(): RecommendedMode[] { const currentTransitions = this.transitionRules[this.currentMode] || [];
        return currentTransitions.map(mode => ({)
            key: mode,);
            ...this.modes[mode]);
            reason: this.getTransitionReason(this.currentMode, mode),
            priority: this.calculateTransitionPriority(this.currentMode, mode),
            confidence: this.calculateTransitionConfidence(this.currentMode, mode) }
        });
    }

    /**
     * 遷移理由を取得'
     */''
    private getTransitionReason(fromMode: string, toMode: string): string {'
        const key = `${fromMode}-${toMode}`;''
        return TRANSITION_REASONS[key] || '一般的な用途に適している';
    }

    /**
     * 遷移優先度を計算
     */
    private calculateTransitionPriority(fromMode: string, toMode: string): number { const fromComplexity = this.simplificationLevels[this.modes[fromMode].level].complexity;
        const toComplexity = this.simplificationLevels[this.modes[toMode].level].complexity;
        
        // 複雑度の差が大きいほど優先度は低い（大きな変化は慎重に）
        const complexityDiff = Math.abs(fromComplexity - toComplexity);
        return Math.max(1, 10 - (complexityDiff * 10); }

    /**
     * 遷移信頼度を計算
     */
    private calculateTransitionConfidence(fromMode: string, toMode: string): number { // 履歴から成功した遷移の回数を調べる
        const successfulTransitions = this.modeHistory.filter();
            h => h.from === fromMode && h.to === toMode).length;
        
        const totalTransitions = this.modeHistory.filter(h => h.from === fromMode).length;
        
        if (totalTransitions === 0) return 0.5; // デフォルト信頼度
        
        return Math.min(successfulTransitions / totalTransitions, 1.0);

    /**
     * 自動モード切り替えを有効/無効
     */
    setAutoMode(enabled: boolean, criteria: Partial<AutoModeCriteria> = { ): void {
        this.autoMode = enabled;
        this.autoModeCriteria = {
            ...DEFAULT_AUTO_CRITERIA,
            ...criteria;
    }

    /**
     * 自動モード評価
     */
    evaluateAutoMode(context: AutoModeContext): AutoModeEvaluation | null { if (!this.autoMode) return null;
';

        const recommendation = generateModeRecommendation(context, this.currentMode, this.currentLevel);''
        if(!recommendation) return null;
';
        // 緊急度の判定
        let urgency: AutModeUrgency = 'low',
        if(context.errorCount >= this.autoModeCriteria.errorThreshold * 2) {', ';

        }

            urgency = 'critical';' }

        } else if(context.errorCount >= this.autoModeCriteria.errorThreshold) { ''
            urgency = 'high';' }

        } else if(context.sessionTime > this.autoModeCriteria.timeThreshold * 2) { ''
            urgency = 'medium'; }

        return { recommendedMode: recommendation.targetMode,

            recommendedLevel: recommendation.targetLevel,
            reason: recommendation.reasons.join(', '),
            confidence: recommendation.confidence, };
            urgency }
        }

    /**
     * 複雑さスコアに対応するレベルを検索
     */
    findLevelByComplexity(targetComplexity: number): SimplificationLevel { return findBestComplexityMatch(targetComplexity); }

    /**
     * モード履歴を取得
     */
    getModeHistory(): ModeTransition[] { return this.modeHistory.slice(-10); // 最新10件 }

    /**
     * 複雑度トレンドを取得
     */
    getComplexityTrend(): ComplexityTrend[] { return this.complexityTrend.slice(-20); // 最新20件 }

    /**
     * 統計情報を取得
     */
    getStats(): ModeStats {
        const modeUsage: Record<string, number> = {};
        this.modeHistory.forEach(entry => {  ); }
            modeUsage[entry.to] = (modeUsage[entry.to] || 0) + 1; }
        };

        const mostUsedModes = Object.entries(modeUsage);
            .sort(([,a], [,b]) => b - a);
            .slice(0, 3);
            .map(([mode, usage]) => ({ mode, usage });

        return { currentMode: this.currentMode,
            currentLevel: this.currentLevel;
           , autoMode: this.autoMode;
            modeUsage,
            transitionCount: this.modeHistory.length;
            averageComplexity: this.simplificationLevels[this.currentLevel].complexity;
           , sessionComplexityTrend: this.complexityTrend.slice(-10), };
            mostUsedModes }
        }

    /**
     * 設定をリセット'
     */''
    reset(''';
        this.currentMode = 'standard';''
        this.currentLevel = 'none';
        this.autoMode = false;
        this.modeHistory = [];
        this.complexityTrend = [];
        this.autoModeCriteria = { ...DEFAULT_AUTO_CRITERIA;
        
        // カスタムモードを削除)
        Object.keys(this.modes).forEach(key => {  );
            if (this.modes[key].custom) { }
                delete this.modes[key]; }
}

    /**
     * カスタムモードを作成
     */
    createCustomMode(name: string, config: CustomModeConfig): string { ''
        const customKey = `custom_${Date.now('''
            description: config.description || 'カスタムモード',
            level: config.level || 'none';
           , settings: {
                ...DEFAULT_MODES.standard.settings;
                ...config.settings,
            custom: true,})
        return customKey;
    }

    /**
     * カスタムモードを削除
     */)
    removeCustomMode(modeKey: string): boolean { if (this.modes[modeKey] && this.modes[modeKey].custom) {'
            delete this.modes[modeKey];''
            if(this.currentMode === modeKey) {', ';

            }

                this.changeMode('standard', 'manual); }
            }
            return true;
        }
        return false;
    }

    /**
     * モードが存在するかチェック
     */
    hasModeKey(modeKey: string): boolean { return modeKey in this.modes; }

    /**
     * レベルが存在するかチェック
     */
    hasLevel(level: string): boolean { return isValidSimplificationLevel(level); }

    /**
     * カスタムレベルを追加
     */
    addCustomLevel(key: string, config: SimplificationLevelConfig): void { if (key, in this.simplificationLevels) { }
            throw new Error(`Level ${key} already, exists`});
        }
        
        this.simplificationLevels = { ...this.simplificationLevels,
            [key]: config } as SimplificationLevels;
    }

    /**
     * 遷移ルールを更新
     */
    updateTransitionRules(rules: Partial<Record<string, string[]>>): void { Object.assign(this.transitionRules, rules); }

    /**
     * 設定を保存
     */
    saveToStorage(): void { const data: StoredSettings = {
            currentMode: this.currentMode;
            currentLevel: this.currentLevel;
            autoMode: this.autoMode;
            autoModeCriteria: this.autoModeCriteria;
           , customModes: Object.fromEntries();
                Object.entries(this.modes).filter(([, mode]) => mode.custom)';
            ),
            modeHistory: this.modeHistory.slice(-10) ,}

        };''
        localStorage.setItem('bubblePop_simplificationSettings', JSON.stringify(data);
    }

    /**
     * 設定を読み込み'
     */''
    loadFromStorage()';
        const stored = localStorage.getItem('bubblePop_simplificationSettings);
        if(stored) {'
            try {'
                const data: StoredSettings = JSON.parse(stored),
                this.currentMode = data.currentMode || 'standard';
                
                if(isValidSimplificationLevel(data.currentLevel) {
        }
                    this.currentLevel = data.currentLevel; }
                }
                
                this.autoMode = data.autoMode || false;
                this.autoModeCriteria = { ...DEFAULT_AUTO_CRITERIA, ...data.autoModeCriteria;
                
                // カスタムモードを復元
                if (data.customModes) { Object.assign(this.modes, data.customModes); }
                
                // 履歴を復元
                if (data.modeHistory) { this.modeHistory = data.modeHistory;' }'

                } catch (error) {
                console.error('Failed to load simplification settings:', error);
                this.reset(); }
}

    /**
     * 現在のモードとレベルを取得
     */
    getCurrentState(): { mode: string;, level: SimplificationLevel } { return { mode: this.currentMode, };
            level: this.currentLevel }
        }

    /**
     * 自動モード設定を取得'
     */''
    getAutoModeSettings(');