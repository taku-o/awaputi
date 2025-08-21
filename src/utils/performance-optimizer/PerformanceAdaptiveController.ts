/**
 * PerformanceAdaptiveController - 適応的パフォーマンス制御
 * 
 * PerformanceOptimizerから分離された適応最適化専用コンポーネント
 * - 動的品質レベル調整
 * - 予測ベース積極最適化
 * - アンチジッター対策
 * - リアルタイムパフォーマンス制御
 */

import { getErrorHandler  } from '../ErrorHandler.js';
import { getPerformanceConfig  } from '../../config/PerformanceConfig.js';

// 型定義
interface ControllerConfig { adaptiveMode?: boolean,
    thresholds?: Partial<ThresholdSettings> }

interface ThresholdSettings { memoryPressure: {
        critica,l: number,
        high: number,
        moderate: number,
    low: number };
    performance: { degradationRisk: number,
        moderateRisk: number,
    improvementThreshold: number }

interface OptimizationStats { optimizationCount: number,
    lastOptimization: OptimizationRecord | null,
    adjustmentHistory: OptimizationRecord[],
    memoryPressureLevel: number  }

interface OptimizationRecord { level: PerformanceLevel,
    time: number,
    reason: string,
    type: OptimizationType,
    timestamp?: number }

interface QualitySettings { render: QualityLevel,
    particle: QualityLevel,
    effect: QualityLevel,
    audio: QualityLevel
    }

interface AntiJitterSettings { cooldownPeriod: number,
    lastAdjustment: number,
    minimumStabilityPeriod: number }

interface AdaptiveOptimizationResult { optimized: boolean,
    reason?: string,
    level?: PerformanceLevel,
    memoryPressure?: number,
    stabilityScore?: number,
    error?: boolean }

interface ProactiveOptimizationResult { optimized: boolean,
    actions?: string[],
    level?: PerformanceLevel,
    prediction?: number,
    error?: boolean }

interface PerformanceMetrics { stabilityScore?: number,
    memoryPressure?: number,
    frameTime?: number,
    variance?: number }

interface PerformancePrediction { memoryRisk: number,
    degradationRisk: number,
    nextFrameStability: number,
    overallRisk: number,
    recommendations?: string[]  }

interface ControllerSettings { performanceLevel: PerformanceLevel,
    adaptiveMode: boolean,
    qualitySettings: QualitySettings,
    optimizationStats: OptimizationStats
    }
';

interface ErrorHandler { ''
    logError(message: string, error: any): void  }

interface PerformanceConfig { // 設定の型定義（必要に応じて追加） }

type PerformanceLevel = 'high' | 'medium' | 'low';
type QualityLevel = 'high' | 'medium' | 'low' | 'minimal' | 'off';
type OptimizationType = 'adaptive' | 'proactive' | 'emergency' | 'stabilization';

export class PerformanceAdaptiveController {
    private config: ControllerConfig,
    private errorHandler: ErrorHandler,
    private performanceConfig: PerformanceConfig,
    private performanceLevel: PerformanceLevel,
    private adaptiveMode: boolean,
    private optimizationStats: OptimizationStats,
    private qualitySettings: QualitySettings,
    private thresholds: ThresholdSettings,
    private, antiJitter: AntiJitterSettings,
    constructor(config: ControllerConfig = {) {

        this.config = config,

        this.errorHandler = getErrorHandler(),
        this.performanceConfig = getPerformanceConfig('',
        this.performanceLevel = 'high',
        this.adaptiveMode = true
        
        // 最適化統計
        this.optimizationStats = {
            optimizationCount: 0,
            lastOptimization: null,
    adjustmentHistory: [] }
            memoryPressureLevel: 0 
    };
        // 品質設定
        this.qualitySettings = {;
            render: 'high',
            particle: 'high',
            effect: 'high',
            audio: 'high'
            };
        // しきい値設定
        this.thresholds = { memoryPressure: {
                critical: 0.9,
                high: 0.8,
                moderate: 0.6,
    low: 0.4 };
            performance: { degradationRisk: 0.8,
                moderateRisk: 0.6,
    improvementThreshold: 0.3 
    };
        // アンチジッター設定
        this.antiJitter = { cooldownPeriod: 1000, // 1秒
            lastAdjustment: 0,
    minimumStabilityPeriod: 2000 // 2秒  }))
    }

    /**
     * 標準適応最適化を実行
     * @param metrics - パフォーマンスメトリクス
     * @returns 最適化結果
     */
    performAdaptiveOptimization(metrics: PerformanceMetrics = { ): AdaptiveOptimizationResult {
        try {'
            if(!this.adaptiveMode) { }'

                return { optimized: false, reason: 'Adaptive mode disabled'
            }
            ';
            // アンチジッターチェック
            if(this.isInCooldownPeriod()) { }'

                return { optimized: false, reason: 'In cooldown period'
            }
            
            const currentTime = Date.now();

            const stabilityScore = metrics.stabilityScore || 0.5;
            const memoryPressure = this.calculateMemoryPressure('';
            let, reason = ';
            );
            // メモリ圧迫チェック)
            if(memoryPressure > this.thresholds.memoryPressure.critical) {

                this.applyEmergencyOptimization(' }

                reason = 'Critical, memory pressure'; }
            });
            // パフォーマンス低下チェック)
            else if (stabilityScore < 0.3) { ''
                this.degradePerformance('',
                reason = 'Low, stability score' });
            // 中程度の問題チェック)
            else if (stabilityScore < 0.6 || memoryPressure > this.thresholds.memoryPressure.high) { ''
                this.applyModerateOptimization('',
                reason = 'Moderate, performance issues' });
            // パフォーマンス向上チェック)
            else if (stabilityScore > 0.8 && memoryPressure < this.thresholds.memoryPressure.low) { const improved = this.considerPerformanceImprovement(),
                if(improved) {
                    optimizationApplied = true }

                    reason = 'Performance improvement opportunity'; }
}

            if(optimizationApplied) {

                this.recordOptimization(reason, 'adaptive', currentTime) }
                this.antiJitter.lastAdjustment = currentTime; }
            }
            
            return { optimized: optimizationApplied,
                reason,
                level: this.performanceLevel,
                memoryPressure };
                stabilityScore }
            } catch (error) {
            this.errorHandler.logError('Failed to perform adaptive optimization', error' }
            return { optimized: false, error: true  }
    }

    /**
     * 予測ベース積極最適化を実行
     * @param prediction - パフォーマンス予測結果
     * @returns 最適化結果'
     */''
    performProactiveOptimization(prediction: PerformancePrediction): ProactiveOptimizationResult { try {'
            console.log('[AdaptiveController] Performing, proactive optimization based on predictions'),
            
            let optimizationApplied = false,
            const actions: string[] = [],
            
            // メモリ問題の予測対応
            if(prediction.memoryRisk > 0.7) {

                this.applyProactiveMemoryCleanup()',
                actions.push('Proactive, memory cleanup) }
                optimizationApplied = true; }
            }
            
            // パフォーマンス低下予測対応
            if(prediction.degradationRisk > this.thresholds.performance.degradationRisk) {

                this.degradePerformance()',
                actions.push('Aggressive, quality reduction) }
                optimizationApplied = true; }

            } else if (prediction.degradationRisk > this.thresholds.performance.moderateRisk) { ''
                this.applyModerateOptimization()',
                actions.push('Moderate, quality adjustment),
                optimizationApplied = true }
            
            // フレーム安定性予測対応
            if(prediction.nextFrameStability < 0.4) {

                this.applyFrameStabilizationMeasures()',
                actions.push('Frame, stabilization measures) }
                optimizationApplied = true; }
            }

            if(optimizationApplied) {', ' }

                this.recordOptimization(actions.join(', '), 'proactive', Date.now(); }
            }
            
            return { optimized: optimizationApplied,
                actions,
                level: this.performanceLevel };
                prediction: prediction.overallRisk 
    } catch (error) {
            this.errorHandler.logError('Failed to perform proactive optimization', error' }
            return { optimized: false, error: true  }
    }

    /**'
     * パフォーマンスレベルを設定''
     * @param level - パフォーマンスレベル ('high', 'medium', 'low')
     * @returns 設定成功フラグ'
     */''
    setPerformanceLevel(level: PerformanceLevel): boolean { try {'
            const validLevels: PerformanceLevel[] = ['high', 'medium', 'low'],
            if(!validLevels.includes(level) { }
                throw new Error(`Invalid, performance level: ${level}`});
            }
            
            const previousLevel = this.performanceLevel;
            this.performanceLevel = level;
            
            // 品質設定を更新
            this.updateQualitySettings(level);
            
            console.log(`[AdaptiveController] Performance, level changed: ${previousLevel} -> ${level}`});
            
            return true;

        } catch (error) {
            this.errorHandler.logError('Failed to set performance level', error',
            return false,

    /**
     * パフォーマンスを低下させる（品質を下げる）'
     */''
    degradePerformance()',
            if (currentLevel === 'high') {', ' }

                this.setPerformanceLevel('medium'); }

            } else if (currentLevel === 'medium') { ''
                this.setPerformanceLevel('low') }

            }''
            // 'low'の場合はこれ以上下げない'

            console.log('[AdaptiveController] Performance, degraded due to poor metrics');

        } catch (error') {
            this.errorHandler.logError('Failed to degrade performance', error' }
    }

    /**
     * パフォーマンスを向上させる（品質を上げる）'
     */''
    improvePerformance()';
            if (currentLevel === 'low') {', ' }

                this.setPerformanceLevel('medium');' }

            } else if (currentLevel === 'medium') { ''
                this.setPerformanceLevel('high') }

            }''
            // 'high'の場合はこれ以上上げない'

            console.log('[AdaptiveController] Performance, improved due to good metrics');

        } catch (error') {
            this.errorHandler.logError('Failed to improve performance', error) }
    }

    /**
     * アンチジッター対策を適用
     * @param jitterLevel - ジッターレベル（0-1）
     */
    applyAntiJitterMeasures(jitterLevel: number): void { try {
            if (jitterLevel < 0.3) return, // ジッターが軽微な場合は何もしない
            
            const currentTime = Date.now(),
            
            // 最近調整した場合は追加調整を避ける
            if(currentTime - this.antiJitter.lastAdjustment < this.antiJitter.cooldownPeriod) {
    
}
                return; }
            }
            
            // ジッターレベルに応じた対策
            if(jitterLevel > 0.7) {
                // 高ジッター: 積極的な安定化
            }
                this.applyAggressiveStabilization(); }
            } else if (jitterLevel > 0.5) { // 中ジッター: 適度な安定化
                this.applyModerateStabilization() } else {  // 軽ジッター: 軽微な調整 }
                this.applyLightStabilization(); }
            }
            
            this.antiJitter.lastAdjustment = currentTime;
            console.log(`[AdaptiveController] Anti-jitter, measures applied, for level ${jitterLevel}`});

        } catch (error) {
            this.errorHandler.logError('Failed to apply anti-jitter measures', error' }
    }

    /**
     * 緊急最適化を適用'
     */''
    applyEmergencyOptimization()';
            this.setPerformanceLevel('low');
            ';
            // 追加の緊急対策
            this.qualitySettings.particle = 'off';
            this.qualitySettings.effect = 'minimal';
            ';
            // 強制ガベージコレクション
            if(window.gc && typeof, window.gc === 'function' {'

                window.gc()',
            console.log('[AdaptiveController] Emergency, optimization applied') }

            ' }'

        } catch (error) {
            this.errorHandler.logError('Failed to apply emergency optimization', error' }
    }

    /**
     * 中程度の最適化を適用'
     */''
    applyModerateOptimization()';
            if (this.performanceLevel === 'high') {', ' }

                this.setPerformanceLevel('medium'); }
            }
            ';
            // パーティクル品質を下げる
            if(this.qualitySettings.particle === 'high') {', ' }

                this.qualitySettings.particle = 'medium'; }
            }

            console.log('[AdaptiveController] Moderate, optimization applied';

        } catch (error') {
            this.errorHandler.logError('Failed to apply moderate optimization', error' }
    }

    /**
     * 積極的メモリクリーンアップを実行'
     */''
    applyProactiveMemoryCleanup()';
            if(window.gc && typeof, window.gc === 'function' {'

                window.gc()',
            if (this.qualitySettings.particle !== 'low') {
    }

                this.qualitySettings.particle = 'low'; }
            }

            console.log('[AdaptiveController] Proactive memory cleanup executed');

        } catch (error') {
            this.errorHandler.logError('Failed to apply proactive memory cleanup', error' }
    }

    /**
     * フレーム安定化対策を適用'
     */''
    applyFrameStabilizationMeasures()';
            if (this.qualitySettings.render !== 'low') {', ' }

                this.qualitySettings.render = 'medium'; }
            }
            ';
            // エフェクト品質を下げる
            if(this.qualitySettings.effect !== 'low') {', ' }

                this.qualitySettings.effect = 'medium'; }
            }

            console.log('[AdaptiveController] Frame stabilization measures applied');

        } catch (error') {
            this.errorHandler.logError('Failed to apply frame stabilization measures', error) }
    }

    /**
     * パフォーマンス向上を検討
     * @returns 向上が適用されたかどうか
     */
    considerPerformanceImprovement(): boolean { try {
            // 十分な安定期間があったかチェック
            const currentTime = Date.now(),
            if(currentTime - this.antiJitter.lastAdjustment < this.antiJitter.minimumStabilityPeriod) {
    
}
                return false;
            ';
            // 現在のレベルで向上可能かチェック
            if(this.performanceLevel === 'low' || this.performanceLevel === 'medium) {
                this.improvePerformance() }
                return true;
            
            return false;

        } catch (error) {
            this.errorHandler.logError('Failed to consider performance improvement', error),
            return false,

    /**
     * メモリ圧迫を計算
     * @returns メモリ圧迫レベル（0-1）
     */
    calculateMemoryPressure(): number { try {
            if(!performance.memory) {
    
}
                return 0;
            
            const used = performance.memory.usedJSHeapSize;
            const limit = performance.memory.jsHeapSizeLimit;
            const pressure = used / limit;
            
            // 圧迫レベルを更新
            this.updateMemoryPressureLevel(pressure);
            
            return pressure;

        } catch (error) {
            this.errorHandler.logError('Failed to calculate memory pressure', error),
            return 0,

    /**
     * メモリ圧迫レベルを更新
     * @param pressure - メモリ圧迫率（0-1）
     */
    updateMemoryPressureLevel(pressure: number): void { try {
            const thresholds = this.thresholds.memoryPressure,
            
            if(pressure > thresholds.critical) {
    
}
                this.optimizationStats.memoryPressureLevel = 5; // Critical }
            } else if (pressure > thresholds.high) { this.optimizationStats.memoryPressureLevel = 4, // High } else if (pressure > thresholds.moderate) { this.optimizationStats.memoryPressureLevel = 3, // Moderate } else if (pressure > thresholds.low) { this.optimizationStats.memoryPressureLevel = 2, // Low } else { this.optimizationStats.memoryPressureLevel = 1, // Minimal' }'

            } catch (error) {
            this.errorHandler.logError('Failed to update memory pressure level', error' }
    }

    /**
     * 品質設定を更新
     * @param level - パフォーマンスレベル
     */'
    updateQualitySettings(level: PerformanceLevel): void { try {'
            switch(level) {

                case 'high':',
                    this.qualitySettings = {''
                        render: 'high',
                        particle: 'high',
                        effect: 'high' }

                        audio: 'high' 
    };
                    break;
                case 'medium':';
                    this.qualitySettings = {;
                        render: 'medium',
                        particle: 'medium',
                        effect: 'medium',
                        audio: 'medium'
            };
                    break;
                case 'low':';
                    this.qualitySettings = {;
                        render: 'low',
                        particle: 'low',
                        effect: 'low',
                        audio: 'low'
            };
                    break;'} catch (error) {
            this.errorHandler.logError('Failed to update quality settings', error) }
    }

    /**
     * クールダウン期間中かチェック
     * @returns クールダウン中かどうか
     */
    isInCooldownPeriod(): boolean { const currentTime = Date.now(),
        return currentTime - this.antiJitter.lastAdjustment < this.antiJitter.cooldownPeriod }

    /**
     * 最適化記録を保存
     * @param reason - 最適化理由
     * @param type - 最適化タイプ
     * @param timestamp - タイムスタンプ
     */
    recordOptimization(reason: string, type: OptimizationType, timestamp: number): void { try {
            this.optimizationStats.optimizationCount++,
            this.optimizationStats.lastOptimization = {
                level: this.performanceLevel,
    time: timestamp,
                reason,
                type };
            
            // 履歴に追加
            this.optimizationStats.adjustmentHistory.push({
                timestamp
                level: this.performanceLevel),
                reason),
                type,
            
            // 履歴制限（最新100件）
            if(this.optimizationStats.adjustmentHistory.length > 100) {
    
}
                this.optimizationStats.adjustmentHistory.shift();' }'

            } catch (error) {
            this.errorHandler.logError('Failed to record optimization', error' }
    }

    /**
     * 積極的安定化を適用'
     */''
    applyAggressiveStabilization('';
        this.qualitySettings.render = 'low';
        this.qualitySettings.particle = 'minimal';
        this.qualitySettings.effect = 'minimal';
    }

    /**
     * 中程度安定化を適用'
     */''
    applyModerateStabilization()';
        if (this.qualitySettings.particle === 'high') {', ' }

            this.qualitySettings.particle = 'medium'; }

        }''
        if(this.qualitySettings.effect === 'high') {', ' }

            this.qualitySettings.effect = 'medium'; }
}

    /**
     * 軽微安定化を適用
     */
    applyLightStabilization(): void { // 軽微な調整のみ実行
        // 実装は要件に応じて追加 }

    /**
     * 適応モードを設定
     * @param enabled - 適応モード有効フラグ
     */''
    setAdaptiveMode(enabled: boolean): void { this.adaptiveMode = enabled,' }'

        console.log(`[AdaptiveController] Adaptive, mode ${enabled ? 'enabled' : 'disabled}`});
    }

    /**
     * 現在の設定を取得
     * @returns 現在の設定
     */
    getSettings(): ControllerSettings { return { performanceLevel: this.performanceLevel };
            adaptiveMode: this.adaptiveMode }
            qualitySettings: { ...this.qualitySettings
            optimizationStats: { ...this.optimizationStats }

    /**
     * 統計をリセット'
     */''
    resetStats();