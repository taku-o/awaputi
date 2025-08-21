import { getConfigurationManager  } from '../core/ConfigurationManager.js';
import { getErrorHandler  } from '../utils/ErrorHandler.js';

// Type definitions for quality control system
interface ConfigurationManager { get<T = any>(key: string, defaultValue?: T): T;
    set<T = any>(key: string, value: T): void,
    watch<T = any>(key: string, callback: (newValue: T) => void): ConfigWatchListener
    ,}
}

interface ErrorHandler { handleError(error: Error, context: string): void ,}

type ConfigWatchListener = (newValue: any') => void;

type QualityLevelType = 'low' | 'medium' | 'high' | 'ultra';
type EffectTypeType = 'particle' | 'effect' | 'screenEffect' | 'backgroundParticle';
type EffectPriorityType = 'critical' | 'important' | 'normal' | 'decorative';

interface QualitySettings { particleCountMultiplier: number,
    particleSizeMultiplier: number;
    particleComplexity: number;
    effectDistance: number;
    animationDetail: number;
    shadowEnabled: boolean;
    reflectionEnabled: boolean;
    blurEnabled: boolean;
    backgroundParticles: boolean,
    frameRateTarget: number ,}

interface EffectPriorities { critical: number;    // ゲームプレイに必須
    important: number;   // ユーザー体験に重要
    normal: number;      // 標準エフェクト
   , decorative: number;  // 装飾的エフェクト }

interface EffectLimits { maxActiveParticles: number,
    maxActiveEffects: number;
    maxScreenEffects: number,
    maxBackgroundParticles: number ,}

interface ActiveEffectCounts { particles: number;
    effects: number;
    screenEffects: number,
    backgroundParticles: number }

interface PerformanceStats { averageFrameRate: number;
    averageMemoryUsage: number;
    currentQuality: QualityLevelType;
    autoAdjustEnabled: boolean;
    effectCounts: ActiveEffectCounts,
    effectLimits: EffectLimits
    }

interface DebugInfo { currentQuality: QualityLevelType;
    qualitySettings: QualitySettings;
    frameRateHistory: number[];
    memoryUsageHistory: number[];
    activeEffectCounts: ActiveEffectCounts;
    effectLimits: EffectLimits;
    autoAdjustEnabled: boolean,
    lastAdjustTime: number }

/**
 * エフェクト品質制御クラス
 * 
 * パフォーマンスに基づいた動的品質調整と、
 * エフェクトの優先度制御を行います。
 */
export class EffectQualityController {
    private configManager: ConfigurationManager;
    private errorHandler: ErrorHandler;
    // 品質レベル定義
    private readonly, qualityLevels: Record<QualityLevelType, QualitySettings> = {
        low: {
            particleCountMultiplier: 0.25;
            particleSizeMultiplier: 0.8;
            particleComplexity: 1;
            effectDistance: 0.5;
            animationDetail: 1;
            shadowEnabled: false;
            reflectionEnabled: false;
            blurEnabled: false;
            backgroundParticles: false,
    frameRateTarget: 30 ,};
        medium: { particleCountMultiplier: 0.5;
            particleSizeMultiplier: 0.9;
            particleComplexity: 2;
            effectDistance: 0.75;
            animationDetail: 2;
            shadowEnabled: false;
            reflectionEnabled: false;
            blurEnabled: true;
            backgroundParticles: true,
    frameRateTarget: 45 };
        high: { particleCountMultiplier: 1.0;
            particleSizeMultiplier: 1.0;
            particleComplexity: 3;
            effectDistance: 1.0;
            animationDetail: 3;
            shadowEnabled: true;
            reflectionEnabled: true;
            blurEnabled: true;
            backgroundParticles: true,
    frameRateTarget: 60 };
        ultra: { particleCountMultiplier: 1.5;
            particleSizeMultiplier: 1.2;
            particleComplexity: 4;
            effectDistance: 1.25;
            animationDetail: 4;
            shadowEnabled: true;
            reflectionEnabled: true;
            blurEnabled: true;
            backgroundParticles: true,
    frameRateTarget: 60 
    };
    ;
    // 現在の品質設定
    private currentQuality: QualityLevelType = 'high';
    private autoAdjustEnabled: boolean = true;
    private lastAdjustTime: number = 0;
    private readonly adjustmentCooldown: number = 2000; // 2秒のクールダウン
    
    // パフォーマンス監視
    private frameRateHistory: number[] = [];
    private memoryUsageHistory: number[] = [];
    private readonly performanceCheckInterval: number = 1000; // 1秒間隔
    private lastPerformanceCheck: number = 0;
    // エフェクト優先度システム
    private readonly, effectPriorities: EffectPriorities = { critical: 3,    // ゲームプレイに必須
        important: 2,   // ユーザー体験に重要;
        normal: 1,      // 標準エフェクト;
        decorative: 0   // 装飾的エフェクト ,};
    // エフェクト制限
    private effectLimits: EffectLimits = { maxActiveParticles: 500
        maxActiveEffects: 20;
        maxScreenEffects: 5,
    maxBackgroundParticles: 50 };
    // 現在のエフェクトカウント
    private activeEffectCounts: ActiveEffectCounts = { particles: 0
        effects: 0;
        screenEffects: 0,
    backgroundParticles: 0 };
    constructor() {

        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        

    }
        this._initializeQualitySettings(); }
    }
    
    /**
     * 品質設定の初期化
     * @private
     */''
    private _initializeQualitySettings()';
            const savedQuality = this.configManager.get<QualityLevelType>('effects.quality.level', 'high'');''
            const autoAdjust = this.configManager.get<boolean>('effects.quality.autoAdjust', true';
            ';

            this.setQualityLevel(savedQuality);''
            this.setAutoAdjustment(autoAdjust);
            ';
            // 品質変更の監視
            this.configManager.watch<QualityLevelType>('effects.quality.level', (newValue) => { this.setQualityLevel(newValue);' }

            }');

            this.configManager.watch<boolean>('effects.quality.autoAdjust', (newValue) => { this.setAutoAdjustment(newValue); });

        } catch (error) {
            this.errorHandler.handleError(error as Error, 'EffectQualityController._initializeQualitySettings'; }'
    }
    
    /**
     * 品質レベルの設定
     * @param level - 品質レベル (low, medium, high, ultra)
     */'
    public setQualityLevel(level: QualityLevelType | null): void { // null または undefined の場合はデフォルト値を使用
        if(level == null) {'

            level = 'high';

        }

            console.log('[EffectQualityController] Quality level was null, using default: high'); }'
        }
        
        if(!this.qualityLevels[level]) {
        ';

            this.errorHandler.handleError();''
                new Error(`Invalid quality level: ${level}`'},

        }

                'EffectQualityController.setQualityLevel' }
            }';
            return;
        }
        
        const previousQuality = this.currentQuality;
        this.currentQuality = level;
        ';
        // エフェクト制限の調整
        this._adjustEffectLimits(level);
        ';
        // 設定の保存
        this.configManager.set('effects.quality.level', level);
        
        console.log(`Quality, level changed, from ${previousQuality} to ${level}`});
    }
    
    /**
     * 自動品質調整の有効/無効設定
     * @param enabled - 自動調整を有効にするか'
     */''
    public setAutoAdjustment(enabled: boolean): void { this.autoAdjustEnabled = enabled;''
        this.configManager.set('effects.quality.autoAdjust', enabled); }
    
    /**
     * エフェクト制限の調整
     * @param qualityLevel - 品質レベル
     * @private
     */
    private _adjustEffectLimits(qualityLevel: QualityLevelType): void { const quality = this.qualityLevels[qualityLevel];
        
        this.effectLimits.maxActiveParticles = Math.floor(500 * quality.particleCountMultiplier);
        this.effectLimits.maxActiveEffects = Math.floor(20 * quality.animationDetail / 4);
        this.effectLimits.maxScreenEffects = Math.floor(5 * quality.animationDetail / 4);

        this.effectLimits.maxBackgroundParticles = quality.backgroundParticles ? undefined : undefined'';
            Math.floor(50 * quality.particleCountMultiplier) : 0; }
    
    /**
     * エフェクトの実行可否をチェック
     * @param effectType - エフェクトタイプ
     * @param priority - エフェクト優先度
     * @returns エフェクトを実行可能か'
     */''
    public canExecuteEffect(effectType: EffectTypeType, priority: EffectPriorityType = 'normal): boolean { const priorityLevel = this.effectPriorities[priority] || 1;
        
        // 優先度が高い場合は制限を緩和
        if(priorityLevel >= 2) {
            
        }
            return true;
        ;
        // エフェクトタイプ別の制限チェック
        switch(effectType) {'

            case 'particle':';
                return this.activeEffectCounts.particles < this.effectLimits.maxActiveParticles;''
            case 'effect':';
                return this.activeEffectCounts.effects < this.effectLimits.maxActiveEffects;''
            case 'screenEffect':';
                return this.activeEffectCounts.screenEffects < this.effectLimits.maxScreenEffects;''
            case 'backgroundParticle':;
                return this.activeEffectCounts.backgroundParticles < this.effectLimits.maxBackgroundParticles;
        }
            default: return true;
    
    /**
     * エフェクトカウントの更新
     * @param effectType - エフェクトタイプ
     * @param delta - 変更量
     */
    public updateEffectCount(effectType: string, delta: number): void { if(this.activeEffectCounts.hasOwnProperty(effectType) {
            const typedEffectType = effectType as keyof ActiveEffectCounts;
            this.activeEffectCounts[typedEffectType] = Math.max(0);
                this.activeEffectCounts[typedEffectType] + delta); }
    }
    
    /**
     * パフォーマンス監視の更新
     * @param currentTime - 現在時刻
     * @param frameRate - 現在のフレームレート
     * @param memoryUsage - メモリ使用量
     */
    public updatePerformanceMetrics(currentTime: number, frameRate: number, memoryUsage?: number): void { if (currentTime - this.lastPerformanceCheck < this.performanceCheckInterval) {
            return; }
        
        this.lastPerformanceCheck = currentTime;
        
        // フレームレート履歴の更新
        this.frameRateHistory.push(frameRate);
        if (this.frameRateHistory.length > 10) { this.frameRateHistory.shift(); }
        
        // メモリ使用量履歴の更新
        if(memoryUsage !== undefined) {
            this.memoryUsageHistory.push(memoryUsage);
            if (this.memoryUsageHistory.length > 10) {
        }
                this.memoryUsageHistory.shift(); }
}
        
        // 自動品質調整
        if (this.autoAdjustEnabled) { this._performAutoAdjustment(currentTime, frameRate, memoryUsage); }
    }
    
    /**
     * 自動品質調整の実行
     * @param currentTime - 現在時刻
     * @param frameRate - 現在のフレームレート
     * @param memoryUsage - メモリ使用量
     * @private
     */
    private _performAutoAdjustment(currentTime: number, frameRate: number, memoryUsage?: number): void { if (currentTime - this.lastAdjustTime < this.adjustmentCooldown) {
            return; }
        
        const currentQualitySettings = this.qualityLevels[this.currentQuality];
        const targetFrameRate = currentQualitySettings.frameRateTarget;
        
        // 平均フレームレートの計算
        const avgFrameRate = this.frameRateHistory.length > 0 ?;
            this.frameRateHistory.reduce((sum, rate) => sum + rate, 0) / this.frameRateHistory.length: frameRate,
        
        let shouldAdjust = false;
        let newQuality: QualityLevelType = this.currentQuality,
        ;
        // フレームレートが目標を大幅に下回る場合、品質を下げる
        if(avgFrameRate < targetFrameRate * 0.8) {'

            if (this.currentQuality === 'ultra'') {''
                newQuality = 'high';
        }

                shouldAdjust = true;' }'

            } else if (this.currentQuality === 'high'') {;
                newQuality = 'medium';

                shouldAdjust = true;' }'

            } else if (this.currentQuality === 'medium'') {;
                newQuality = 'low';
                shouldAdjust = true; }
        }
        // フレームレートが安定している場合、品質を上げる
        else if (avgFrameRate > targetFrameRate * 1.1 && this.frameRateHistory.length >= 5) { const stableFrameRate = this.frameRateHistory.every(rate => );
                rate > targetFrameRate * 1.05);

            if(stableFrameRate) {'

                if (this.currentQuality === 'low'') {''
                    newQuality = 'medium';
            }

                    shouldAdjust = true;' }'

                } else if (this.currentQuality === 'medium'') {;
                    newQuality = 'high';

                    shouldAdjust = true;' }'

                } else if (this.currentQuality === 'high'') {;
                    newQuality = 'ultra';
                    shouldAdjust = true; }
}
        
        if(shouldAdjust) {
        
            
        
        }
            console.log(`Auto-adjusting, quality from ${this.currentQuality} to ${newQuality} (FPS: ${avgFrameRate.toFixed(1}))`);
            this.setQualityLevel(newQuality);
            this.lastAdjustTime = currentTime;
        }
    }
    
    /**
     * 現在の品質設定を取得
     * @returns 品質設定オブジェクト
     */
    public getCurrentQualitySettings(): QualitySettings {
        return { ...this.qualityLevels[this.currentQuality];
    }
    
    /**
     * 品質レベルを取得
     * @returns 現在の品質レベル
     */
    public getCurrentQualityLevel(): QualityLevelType { return this.currentQuality; }
    
    /**
     * エフェクト制限を取得
     * @returns エフェクト制限オブジェクト
     */
    public getEffectLimits(): EffectLimits {
        return { ...this.effectLimits;
    }
    
    /**
     * 現在のエフェクトカウントを取得
     * @returns エフェクトカウントオブジェクト
     */
    public getActiveEffectCounts(): ActiveEffectCounts {
        return { ...this.activeEffectCounts;
    }
    
    /**
     * パフォーマンス統計を取得
     * @returns パフォーマンス統計
     */
    public getPerformanceStats(): PerformanceStats { const avgFrameRate = this.frameRateHistory.length > 0 ?
            this.frameRateHistory.reduce((sum, rate) => sum + rate, 0) / this.frameRateHistory.length: 0,
        
        const avgMemoryUsage = this.memoryUsageHistory.length > 0 ?;
            this.memoryUsageHistory.reduce((sum, usage) => sum + usage, 0) / this.memoryUsageHistory.length: 0,
        
        return { averageFrameRate: avgFrameRate,
            averageMemoryUsage: avgMemoryUsage,
    currentQuality: this.currentQuality, };
            autoAdjustEnabled: this.autoAdjustEnabled, }
            effectCounts: { ...this.activeEffectCounts;
            effectLimits: { ...this.effectLimits;
    }
    
    /**
     * デバッグ情報の取得
     * @returns デバッグ情報
     */
    public getDebugInfo(): DebugInfo { return { currentQuality: this.currentQuality,
            qualitySettings: this.getCurrentQualitySettings(),
    frameRateHistory: [...this.frameRateHistory], };
            memoryUsageHistory: [...this.memoryUsageHistory], }
            activeEffectCounts: { ...this.activeEffectCounts;
            effectLimits: { ...this.effectLimits;
            autoAdjustEnabled: this.autoAdjustEnabled,
    lastAdjustTime: this.lastAdjustTime;
        },
    }
    
    /**
     * リソースのクリーンアップ
     */
    public dispose(): void { this.frameRateHistory = [];
        this.memoryUsageHistory = [];
        this.activeEffectCounts = {
            particles: 0;
            effects: 0;
            screenEffects: 0,
    backgroundParticles: 0 
    }

// シングルトンインスタンスの作成と管理
let effectQualityControllerInstance: EffectQualityController | null = null,

/**
 * EffectQualityControllerのシングルトンインスタンスを取得
 * @returns シングルトンインスタンス
 */
export function getEffectQualityController(): EffectQualityController { if (!effectQualityControllerInstance) {''
        effectQualityControllerInstance = new EffectQualityController(' }''