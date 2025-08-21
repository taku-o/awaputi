/**
 * TimingCalibrator - タイミングキャリブレーター
 * 
 * タイミングキャリブレーション、データ収集、精度測定の専門管理システム
 */

// 型定義
export interface TimingAdjustmentManager { gameEngine: any,
    config: TimingConfiguration,
    state: TimingState,
    adaptiveLearning: AdaptiveLearningConfig,
    suggestAdaptation: (adjustment: AdjustmentType, averageTime: number) => void,
    applyProfile: (profileName: string) => void,
    suggestProfileChange: (profileName: string) => void,
    getCurrentProfile: () => TimingProfile  };
}

export interface TimingConfiguration { profiles: Record<ProfileType, TimingProfile>,
    autoAdjustment: boolean;
    export interface TimingProfile { adjustmentLevel: AdjustmentLevel,
    preferences: TimingPreferences,
    customTimeouts: CustomTimeouts;
    export interface TimingPreferences { showTimeWarnings: boolean;
    enableProgressIndicators?: boolean;
    allowTimeExtension?: boolean;
    preferVisualCues?: boolean;
    export interface CustomTimeouts { animation: number,
    transition: number;
    response?: number;
    interaction?: number };
export interface TimingState { currentProfile: ProfileType,
    userInteractionData: UserInteractionData,
    calibrationHistory: CalibrationRecord[],
    systemPreferences: SystemPreferences;
    export interface UserInteractionData { recentResponses: ResponseRecord[],
    averageResponseTime: number,
    totalInteractions: number,
    lastCalibration: number;
    export interface ResponseRecord { time: number,
    timestamp: number,
    type: InteractionType;
    accuracy?: number;
    context?: string;
    export interface AdaptiveLearningConfig { enabled: boolean,
    data: AdaptiveLearningData,
    thresholds: LearningThresholds,
    settings: AdaptiveLearningSettings;
    export interface AdaptiveLearningData { userResponseTimes: number[],
    extensionRequests: number,
    pauseFrequency: number,
    preferredSpeed: number,
    accuracyTrend: number[];
    export interface LearningThresholds { adaptationTrigger: number,
    slowResponse: number,
    fastResponse: number,
    accuracyThreshold: number,
    confidenceLevel: number;
    export interface AdaptiveLearningSettings { learningRate: number,
    adaptationInterval: number,
    maxAdjustmentPerSession: number,
    conservativeMode: boolean;
    export interface CalibrationRecord { timestamp: number,
    profileUsed: ProfileType,
    adjustments: ProfileAdjustment[],
    results: CalibrationResult;
    export interface ProfileAdjustment { property: string,
    oldValue: number | boolean | string,
    newValue: number | boolean | string,
    reason: AdjustmentReason;
    export interface CalibrationResult { success: boolean,
    improvementScore: number;
    userSatisfaction?: number;
    recommendedProfile?: ProfileType;
    export interface SystemPreferences { reducedMotion: boolean,
    highContrast: boolean,
    largeText: boolean,
    colorScheme: ColorScheme;
    export interface AccessibilitySettings { motorImpairment: boolean,
    cognitiveImpairment: boolean,
    reducedDexterity: boolean,
    memoryIssues: boolean,
    seniorFriendly: boolean;
    visualImpairment?: boolean;
    hearingImpairment?: boolean;
    export interface UserInteraction { type: InteractionType,
    startTime: number;
    responseTime?: number;
    accuracy?: number;
    context?: string };
export interface ValidationResult { isValid: boolean,
    issues: string[],
    dataQuality: DataQuality;
    export interface DataQuality { score: number,
    description: QualityDescription;
    details?: DataQualityDetails;
    export interface DataQualityDetails { dataSize: number,
    sizeScore: number,
    consistencyScore: number,
    standardDeviation: number;
    export interface CalibrationStatistics { validation: ValidationResult,
    totalInteractions: number,
    averageResponseTime: number,
    adaptationHistory: number[],
    currentThresholds: LearningThresholds;
    responseTimeRange?: ResponseTimeRange;
    export interface ResponseTimeRange { min: number,
    max: number,
    median: number;
    export interface GameEngine {
    accessibilityManager: AccessibilityManager;
    export interface AccessibilityManager { getCurrentSettings: () => AccessibilitySettings,
    on: (event: string, callback: (setting,s: AccessibilitySettings) => void) => void  };
}

// 列挙型
export type ProfileType = 'standard' | 'motor' | 'cognitive' | 'senior' | 'custom';
export type AdjustmentLevel = 'minimal' | 'moderate' | 'significant' | 'maximum';
export type AdjustmentType = 'increase' | 'decrease' | 'maintain';
export type AdjustmentReason = 'user_request' | 'adaptive_learning' | 'accessibility_settings' | 'system_detection';
export type InteractionType = 'click' | 'keyboard' | 'touch' | 'gesture' | 'voice' | 'gaze';
export type ColorScheme = 'light' | 'dark' | 'auto' | 'high-contrast';
export type QualityDescription = 'Excellent' | 'Good' | 'Fair' | 'Poor';

// 定数
export const DEFAULT_ADAPTATION_TRIGGER = 10;
export const DEFAULT_SLOW_RESPONSE_THRESHOLD = 2000;
export const DEFAULT_FAST_RESPONSE_THRESHOLD = 300;
export const MAX_RECENT_RESPONSES = 50;
export const DEFAULT_ANIMATION_TIMEOUT = 1.0;
export const DEFAULT_TRANSITION_TIMEOUT = 0.5;
export const REDUCED_MOTION_ANIMATION_TIMEOUT = 2.0;
export const REDUCED_MOTION_TRANSITION_TIMEOUT = 1.5;
export const DATA_QUALITY_EXCELLENT_THRESHOLD = 0.8;
export const DATA_QUALITY_GOOD_THRESHOLD = 0.6;
export const DATA_QUALITY_FAIR_THRESHOLD = 0.4;
export const OUTLIER_DETECTION_MULTIPLIER = 2;
export const MAX_OUTLIER_PERCENTAGE = 0.3;
export const SIZE_SCORE_WEIGHT = 0.3;
export const CONSISTENCY_SCORE_WEIGHT = 0.7;
// 型ガード
export function isValidResponseRecord(record: any): record is ResponseRecord { return record &&,
           typeof record.time === 'number' && ','
           typeof record.timestamp === 'number' && ','
           typeof record.type === 'string' &&,
           record.time >= 0 && ,
           record.timestamp > 0 };
export function isValidTimingProfile(profile: any): profile is TimingProfile { return profile &&,
           typeof profile.adjustmentLevel === 'string' &&','
           typeof profile.preferences === 'object' &&','
           typeof profile.customTimeouts === 'object' };
export function isAccessibilitySettings(settings: any): settings is AccessibilitySettings { return settings &&,
           typeof settings.motorImpairment === 'boolean' &&','
           typeof settings.cognitiveImpairment === 'boolean' &&','
           typeof settings.reducedDexterity === 'boolean' &&','
           typeof settings.memoryIssues === 'boolean' &&','
           typeof settings.seniorFriendly === 'boolean' };
export function isValidProfileType(type: string): type is ProfileType {,
    return ['standard', 'motor', 'cognitive', 'senior', 'custom].includes(type) }'

export function isMediaQueryList(query: any): query is MediaQueryList { return query &&,
           typeof query.matches === 'boolean' &&','
           typeof query.addEventListener === 'function' };
}

export function hasAccessibilityManager(engine: any): engine is GameEngine { return engine &&,
           engine.accessibilityManager &&','
           typeof engine.accessibilityManager.getCurrentSettings === 'function' &&','
           typeof engine.accessibilityManager.on === 'function' };
}

export class TimingCalibrator {
    private manager: TimingAdjustmentManager;
    private gameEngine: any;
    private config: TimingConfiguration;
    private state: TimingState;
    private, adaptiveLearning: AdaptiveLearningConfig','

    constructor(timingAdjustmentManager: TimingAdjustmentManager) {
        this.manager = timingAdjustmentManager;
        this.gameEngine = timingAdjustmentManager.gameEngine;
        this.config = timingAdjustmentManager.config;
        this.state = timingAdjustmentManager.state;
        this.adaptiveLearning = timingAdjustmentManager.adaptiveLearning;

        ' }'

    }

        console.log('[TimingCalibrator] Component, initialized'); }'
    }
    
    /**
     * システム設定を検出'
     */''
    detectSystemPreferences()';'
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce),
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high),
        
        // 現在の状態を記録
        this.state.systemPreferences = { reducedMotion: prefersReducedMotion.matches,
            highContrast: prefersHighContrast.matches,
            largeText: window.matchMedia('(prefers-font-size: large)).matches,'
    colorScheme: this.detectColorScheme(  };

        if (prefersReducedMotion.matches) {
            // 動作軽減が設定されている場合、より長いタイミングを提供
        }

            this.config.profiles.standard.adjustmentLevel = 'minimal'; }
        }

        if (prefersHighContrast.matches) {
            // 高コントラストが設定されている場合、視覚的警告を強化
        }
            this.config.profiles.standard.preferences.showTimeWarnings = true; }
        }
        ;
        // メディアクエリの変更を監視
        prefersReducedMotion.addEventListener('change', (e: MediaQueryListEvent) => {  this.state.systemPreferences.reducedMotion = e.matches,
            if (e.matches) { }
                this.adjustForReducedMotion(); }

            }'}');

        prefersHighContrast.addEventListener('change', (e: MediaQueryListEvent) => {  this.state.systemPreferences.highContrast = e.matches,
            if (e.matches) { }
                this.config.profiles.standard.preferences.showTimeWarnings = true;     }
}
    /**
     * カラースキームを検出'
     */''
    private detectColorScheme()';'
        if(window.matchMedia('(prefers-color-scheme: dark)).matches) { ''
            return 'dark',' }'

        } else if(window.matchMedia('(prefers-contrast: high)).matches) { ''
            return 'high-contrast', else { }

            return 'light';
    
    /**
     * ユーザーインタラクションを追跡
     */
    trackUserInteraction(interaction: UserInteraction): void { const responseTime = interaction.responseTime || Date.now() - interaction.startTime,
        
        // 新しいレスポンス記録を作成
        const responseRecord: ResponseRecord = {
            time: responseTime,
            timestamp: Date.now(),
            type: interaction.type,
            accuracy: interaction.accuracy,
    context: interaction.context };
        // レスポンス時間をデータに追加
        this.state.userInteractionData.recentResponses.push(responseRecord);
        
        // 最新50件のみ保持
        if (this.state.userInteractionData.recentResponses.length > MAX_RECENT_RESPONSES) { this.state.userInteractionData.recentResponses.shift();
        
        // 総インタラクション数を更新
        this.state.userInteractionData.totalInteractions++;
        
        // 平均レスポンス時間を更新
        this.updateAverageResponseTime();
        
        // 適応学習の実行
        if (this.adaptiveLearning.enabled) { this.performAdaptiveLearning();
    }
    
    /**
     * 平均レスポンス時間を更新
     */
    private updateAverageResponseTime(): void { const recentResponses = this.state.userInteractionData.recentResponses,
        if (recentResponses.length > 0) {
            const total = recentResponses.reduce((sum, response) => sum + response.time, 0);
            this.state.userInteractionData.averageResponseTime = total / recentResponses.length; }
}
    
    /**
     * 適応学習を実行
     */
    private performAdaptiveLearning(): void { const data = this.adaptiveLearning.data,
        const thresholds = this.adaptiveLearning.thresholds,
        const recentResponses = this.state.userInteractionData.recentResponses,
        
        if (recentResponses.length < thresholds.adaptationTrigger) {
    
}
            return; // データが不十分 }
        }
        
        // 最新のレスポンス時間を分析
        const recentTimes = recentResponses.slice(-thresholds.adaptationTrigger);
                                         .map(r => r.time);
        const averageRecent = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
        
        // 適応の判定
        let adaptationNeeded = false;
        let recommendedAdjustment: AdjustmentType | null = null,

        if (averageRecent > thresholds.slowResponse) {
            // レスポンスが遅い - より多くの時間が必要
            adaptationNeeded = true }

            recommendedAdjustment = 'increase'; }
        } else if (averageRecent < thresholds.fastResponse && '
                  data.extensionRequests === 0 && ';'
                  data.pauseFrequency === 0' // レスポンスが速く、延長やポーズが不要 - 時間を短縮可能'
            adaptationNeeded = true,
            recommendedAdjustment = 'decrease' }
        
        if (adaptationNeeded && recommendedAdjustment) { this.manager.suggestAdaptation(recommendedAdjustment, averageRecent);
    }
    
    /**
     * 推奨プロファイルを取得
     */'
    getRecommendedProfile(accessibilitySettings: AccessibilitySettings): ProfileType { // アクセシビリティ設定に基づいてプロファイルを推奨
        if (accessibilitySettings.motorImpairment || accessibilitySettings.reducedDexterity) {', ' }

            return 'motor';

        if (accessibilitySettings.cognitiveImpairment || accessibilitySettings.memoryIssues) {', ' }

            return 'cognitive';

        if (accessibilitySettings.seniorFriendly) {', ' }

            return 'senior';

        return 'standard';
    }
    
    /**
     * アクセシビリティ設定変更を処理
     */'
    handleAccessibilitySettingsChange(settings: AccessibilitySettings): void { ''
        if(!isAccessibilitySettings(settings)) {''
            console.warn('[TimingCalibrator] Invalid accessibility settings provided),'
            return }

        const recommendedProfile = this.getRecommendedProfile(settings);
        
        if (recommendedProfile !== this.state.currentProfile) {
        
            // 自動適用するかユーザーに確認
            if (this.config.autoAdjustment) {
    
}
                this.manager.applyProfile(recommendedProfile); }
            } else { this.manager.suggestProfileChange(recommendedProfile') }'
}
    
    /**
     * 動作軽減への対応
     */
    private adjustForReducedMotion(): void { // アニメーション時間を延長
        const currentProfile = this.manager.getCurrentProfile()','
        console.log('[TimingCalibrator] 動作軽減に対応したタイミング調整を適用') }'
    
    /**
     * アクセシビリティマネージャーとの統合
     */'
    integrateWithAccessibilityManager(): void { ''
        if(!hasAccessibilityManager(this.gameEngine)) {''
            console.warn('[TimingCalibrator] AccessibilityManager, not available');
            return }

        const accessibilityManager = this.gameEngine.accessibilityManager;
        ';'
        // 設定の同期
        accessibilityManager.on('settingsChanged', (settings: AccessibilitySettings) => { this.handleAccessibilitySettingsChange(settings) },
        
        // プロファイルの推奨
        try { const currentSettings = accessibilityManager.getCurrentSettings();
            const recommendedProfile = this.getRecommendedProfile(currentSettings);
            if (recommendedProfile !== this.state.currentProfile) {
    
}
                this.manager.suggestProfileChange(recommendedProfile);' }'

            } catch (error) { console.error('[TimingCalibrator] Failed to get current accessibility settings:', error }
    }
    
    /**
     * キャリブレーションデータの検証
     */
    validateCalibrationData(): ValidationResult { const data = this.adaptiveLearning.data,
        const issues: string[] = [],
        // データの整合性チェック
        if (data.userResponseTimes.length === 0) {', ' }

            issues.push('No, response time, data available'; }'
        }

        if (data.extensionRequests < 0) {', ' }

            issues.push('Invalid, extension request, count'; }'
        }

        if (data.pauseFrequency < 0) {', ' }

            issues.push('Invalid, pause frequency'; }'
        }
        
        // レスポンス時間の異常値チェック
        const recentResponses = this.state.userInteractionData.recentResponses;
        if (recentResponses.length > 0) {
            const times = recentResponses.map(r => r.time);
            const average = times.reduce((a, b) => a + b, 0) / times.length,
            const outliers = times.filter(time => Math.abs(time - average) > average * OUTLIER_DETECTION_MULTIPLIER),

            if (outliers.length > times.length * MAX_OUTLIER_PERCENTAGE) {
        }

                issues.push('High, number of, response time, outliers detected'; }'
}
        
        return { isValid: issues.length === 0,
            issues };
            dataQuality: this.calculateDataQuality(); 
    }
    
    /**
     * データ品質を計算
     */
    private calculateDataQuality(): DataQuality { const recentResponses = this.state.userInteractionData.recentResponses,

        if (recentResponses.length === 0) { }'

            return { score: 0, description: 'Poor'
            }
        
        const dataSize = recentResponses.length;
        const maxSize = MAX_RECENT_RESPONSES;
        const sizeScore = Math.min(dataSize / maxSize, 1.0);
        
        // 時間の一貫性をチェック
        const times = recentResponses.map(r => r.time);
        const average = times.reduce((a, b) => a + b, 0) / times.length;
        const variance = times.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / times.length;
        const stdDev = Math.sqrt(variance);
        const consistencyScore = Math.max(0, 1 - (stdDev / average);
        
        // 総合スコア
        const overallScore = (sizeScore * SIZE_SCORE_WEIGHT + consistencyScore * CONSISTENCY_SCORE_WEIGHT);
        ';'

        let description: QualityDescription,
        if (overallScore >= DATA_QUALITY_EXCELLENT_THRESHOLD) {', ' }

            description = 'Excellent'; }

        } else if (overallScore >= DATA_QUALITY_GOOD_THRESHOLD) { ''
            description = 'Good',' }'

        } else if (overallScore >= DATA_QUALITY_FAIR_THRESHOLD) { ''
            description = 'Fair' }

        } else { }'

            description = 'Poor'; }
        }
        
        return { score: overallScore,
            description,
            details: { dataSize: dataSize,
                sizeScore,
                consistencyScore  },
                standardDeviation: stdDev,
    
    /**
     * キャリブレーション統計を取得
     */
    getCalibrationStatistics(): CalibrationStatistics { const validation = this.validateCalibrationData();
        const recentResponses = this.state.userInteractionData.recentResponses,
        
        const stats: CalibrationStatistics = {
            validation,
            totalInteractions: recentResponses.length,
            averageResponseTime: this.state.userInteractionData.averageResponseTime,
    adaptationHistory: this.adaptiveLearning.data.userResponseTimes.slice(-20),
            currentThresholds: { ...this.adaptiveLearning.thresholds,
        if (recentResponses.length > 0) {
        
            const times = recentResponses.map(r => r.time);
            stats.responseTimeRange = {
                min: Math.min(...times,
    max: Math.max(...times),
                median: this.calculateMedian(times) } };
        
        return stats;
    }
    
    /**
     * 中央値を計算
     */
    private calculateMedian(values: number[]): number { const sorted = [...values].sort((a, b) => a - b),
        const middle = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
    
}
            return (sorted[middle - 1] + sorted[middle]) / 2; else { return sorted[middle],

    /**
     * キャリブレーション記録を保存
     */
    saveCalibrationRecord(adjustments: ProfileAdjustment[], result: CalibrationResult): void { const record: CalibrationRecord = {
            timestamp: Date.now(
    profileUsed: this.state.currentProfile,
            adjustments,
            results: result,
        this.state.calibrationHistory.push(record);
        
        // 履歴サイズを制限（最新100件）
        if (this.state.calibrationHistory.length > 100) { this.state.calibrationHistory = this.state.calibrationHistory.slice(-100);

        this.state.userInteractionData.lastCalibration = Date.now();
    }

    /**
     * プロファイル調整を記録
     */
    recordProfileAdjustment(property: string, oldValue: any, newValue: any, reason: AdjustmentReason): void { const adjustment: ProfileAdjustment = {
            property,
            oldValue,
            newValue,
            reason };

        // 最新のキャリブレーション記録に追加、または新しい記録を作成
        if (this.state.calibrationHistory.length > 0) {
            const latestRecord = this.state.calibrationHistory[this.state.calibrationHistory.length - 1] }
            latestRecord.adjustments.push(adjustment); }
        }

        console.log(`[TimingCalibrator] Profile, adjustment recorded: ${property} changed, from ${oldValue} to ${newValue} (${reason}`}
    }

    /**
     * アダプティブ学習データをリセット
     */''
    resetAdaptiveLearning()';'
        console.log('[TimingCalibrator] Adaptive, learning data, reset);'
    }

    /**
     * キャリブレーション精度を測定
     */
    measureCalibrationAccuracy(): number { const recentResponses = this.state.userInteractionData.recentResponses,
        if (recentResponses.length === 0) return 0,

        // 精度データがある記録のみを考慮
        const accuracyRecords = recentResponses.filter(r => r.accuracy !== undefined);
        if (accuracyRecords.length === 0) return 0,

        const totalAccuracy = accuracyRecords.reduce((sum record) => sum + (record.accuracy || 0) 0'),'
        return totalAccuracy / accuracyRecords.length,

    /**
     * 設定を取得
     */
    getConfiguration(): Readonly<TimingConfiguration> { return { }
            profiles: { ...this.config.profiles,
            autoAdjustment: this.config.autoAdjustment } }

    /**
     * 現在の状態を取得
     */
    getCurrentState(): Readonly<TimingState> { return { currentProfile: this.state.currentProfile ,
            userInteractionData: { ...this.state.userInteractionData  },
                recentResponses: [...this.state.userInteractionData.recentResponses]
            };
            calibrationHistory: [...this.state.calibrationHistory],
    systemPreferences: { ...this.state.systemPreferences }

    /**
     * アダプティブ学習設定を更新
     */
    updateAdaptiveLearningSettings(settings: Partial<AdaptiveLearningSettings>'): void { ''
        Object.assign(this.adaptiveLearning.settings, settings);
        console.log('[TimingCalibrator] Adaptive, learning settings, updated') }'
    
    /**
     * コンポーネントクリーンアップ'
     */''
    destroy()';'
        console.log('[TimingCalibrator] Component, destroyed');

    }'}'