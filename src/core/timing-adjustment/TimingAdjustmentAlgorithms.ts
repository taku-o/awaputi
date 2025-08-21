/**
 * TimingAdjustmentAlgorithms - タイミング調整アルゴリズム
 * 
 * 調整アルゴリズム実装、パフォーマンス最適化、適応的タイミング制御の専門管理システム
 */

// TimingCalibrator.ts からの共通型をインポート
import type { TimingAdjustmentManager, 
    TimingConfiguration,
    TimingState,
    AdaptiveLearningConfig,
    TimingProfile,
    ProfileType  } from './TimingCalibrator.js';

// TimingFeedbackSystem.ts からの型をインポート
import type { TimerManager,
    ActiveTimer,
    PausedTimer,
    TimerType,
    TimerPriority' }'

} from './TimingFeedbackSystem.js';

// 型定義
export interface AlgorithmTimingAdjustmentManager extends TimingAdjustmentManager { timers: ExtendedTimerManager,
    emitEvent: (eventName: string, data: any) => void,
    showTimeWarning: (timerId: string) => void,
    showExtensionFeedback: (timerId: string, remainingTime: number') => void  }'
}

export interface ExtendedTimerManager extends TimerManager { extensions: Map<string, ExtensionInfo>,
    warnings: Map<string, WarningInfo> };
export interface ExtensionInfo { count: number,
    totalExtension: number,
    lastExtension: number;
    requestedBy?: ExtensionRequestor;
    export interface WarningInfo { triggeredAt: number,
    acknowledged: boolean;
    dismissed?: boolean;
    dismissedAt?: number;
    export interface RegisteredTimer extends ActiveTimer { registeredAt: number,
    extensionCount: number;
    entity?: GameEntity;
    warnings?: WarningInfo[];
     };
export interface TimerConfig { originalDuration: number,
    adjustedDuration: number,
    startTime: number,
    type: TimerType;
    priority?: TimerPriority;
    entity?: GameEntity;
    autoExtend?: boolean;
    maxExtensions?: number };
export interface CustomTimerOptions { type?: TimerType,
    priority?: TimerPriority;
    autoExtend?: boolean;
    maxExtensions?: number;
    warningThreshold?: number;
    entity?: GameEntity;
    metadata?: Record<string, any> };
export interface GameEntity { id: string,
    type: EntityType;
    maxAge?: number;
    [key: string]: any;
    export interface TimerResult { id: string,
    originalDuration: number,
    adjustedDuration: number,
    created: boolean;
    export interface RemainingTimeInfo { remaining: number,
    total: number,
    percentage: number;
    isPaused?: boolean;
    extensionsUsed?: number;
    export interface PauseInfo { pausedAt: number,
    reason: PauseReason;
    triggeredBy?: string;
    export interface AlgorithmStatistics { activeTimers: number,
    pausedTimers: number,
    totalExtensions: number,
    pauseFrequency: number,
    currentProfile: ProfileType,
    adjustmentMultiplier: number,
    timerTypes: Record<string, number>;
    averageExtensionCount: number;
    optimization?: OptimizationStats;
    export interface OptimizationStats { lastOptimization: number,
    timersRemoved: number,
    timersOptimized: number,
    performanceGain: number;
    export interface TimerExtensionEvent { timerId: string,
    extensionAmount: number,
    newDuration: number,
    requestedBy: ExtensionRequestor;
    export interface ProfileChangeEvent { profile: ProfileType,
    settings: TimingProfile;
    previousProfile?: ProfileType;
    export interface AdjustmentLevel { multiplier: number,
    name: string;
    description?: string;
';'
// 列挙型
export type EntityType = 'bubble' | 'powerup' | 'obstacle' | 'particle' | 'ui';
    export type PauseReason = 'manual' | 'auto' | 'game_pause' | 'window_blur' | 'performance' | 'user';
    export type ExtensionRequestor = 'user' | 'auto' | 'system' | 'accessibility' | 'emergency';
    export type OptimizationResult = 'success' | 'partial' | 'failed' | 'skipped';

// 定数
export const DEFAULT_WARNING_THRESHOLD = 0.8; // 80%で警告
export const DEFAULT_EXTENSION_PERCENTAGE = 0.5; // 50%延長
export const DEFAULT_GRACE_PERIOD = 5000; // 5秒のグレース期間
export const AUTO_PAUSE_CLEANUP_TIME = 3600000; // 1時間 = 3600000ms
export const MAX_EXTENSION_COUNT = 5;
    export const TIMER_OPTIMIZATION_INTERVAL = 60000; // 1分間隔で最適化
export const PERFORMANCE_CHECK_INTERVAL = 30000; // 30秒間隔で性能チェック
;
// 型ガード
export function isValidTimerConfig(config: any): config is TimerConfig { return config &&''
           typeof config.originalDuration === 'number' &&','
           typeof config.adjustedDuration === 'number' &&','
           typeof config.startTime === 'number' &&','
           typeof config.type === 'string' &&,
           config.originalDuration > 0 &&,
           config.adjustedDuration > 0 &&,
           config.startTime > 0 };
export function isRegisteredTimer(timer: any): timer is RegisteredTimer { return timer &&''
           typeof timer.id === 'string' &&','
           typeof timer.startTime === 'number' &&','
           typeof timer.adjustedDuration === 'number' &&','
           typeof timer.pausedTime === 'number' &&','
           typeof timer.registeredAt === 'number' &&','
           typeof timer.extensionCount === 'number' };
export function isGameEntity(entity: any): entity is GameEntity { return entity &&''
           typeof entity.id === 'string' &&','
           typeof entity.type === 'string' };
export function isValidExtensionInfo(info: any): info is ExtensionInfo { return info &&''
           typeof info.count === 'number' &&','
           typeof info.totalExtension === 'number' &&','
           typeof info.lastExtension === 'number' &&,
           info.count >= 0 &&,
           info.totalExtension >= 0 &&,
           info.lastExtension > 0 };
export function isPauseReason(reason: string): reason is PauseReason {;
    return ['manual', 'auto', 'game_pause', 'window_blur', 'performance', 'user].includes(reason) }'

export function isEntityType(type: string): type is EntityType {;
    return ['bubble', 'powerup', 'obstacle', 'particle', 'ui].includes(type) }'

export function hasTimerExtensions(manager: ExtendedTimerManager): boolean { return manager.extensions instanceof Map };
export class TimingAdjustmentAlgorithms {
    private manager: AlgorithmTimingAdjustmentManager;
    private gameEngine: any;
    private config: TimingConfiguration;
    private state: TimingState;
    private timers: ExtendedTimerManager;
    private adaptiveLearning: AdaptiveLearningConfig;
    // 最適化関連
    private lastOptimization: number = 0;
    private, optimizationStats: OptimizationStats = {
        lastOptimization: 0,
        timersRemoved: 0,
        timersOptimized: 0,
    performanceGain: 0 };
    constructor(timingAdjustmentManager: AlgorithmTimingAdjustmentManager) {
        this.manager = timingAdjustmentManager;
        this.gameEngine = timingAdjustmentManager.gameEngine;
        this.config = timingAdjustmentManager.config;
        this.state = timingAdjustmentManager.state;
        this.timers = timingAdjustmentManager.timers;
        this.adaptiveLearning = timingAdjustmentManager.adaptiveLearning;

        ' }'

    }

        console.log('[TimingAdjustmentAlgorithms] Component, initialized'); }'
    }
    
    /**
     * プロファイルを適用
     */
    applyProfile(profileName: string): boolean { if (!this.config.profiles[profileName]) { }
            console.warn(`[TimingAdjustmentAlgorithms] 不明なプロファイル: ${profileName}`};
            return false;
        }
        
        const previousProfile = this.state.currentProfile;
        this.state.currentProfile = profileName as ProfileType;
        const profile = this.config.profiles[profileName];
        ';'
        // 現在のタイマーに調整を適用
        this.applyAdjustmentsToActiveTimers()';'
            localStorage.setItem('timingAdjustmentProfile', profileName';} catch (error) { console.warn('[TimingAdjustmentAlgorithms] Failed to save profile to localStorage:', error }'
        
        // イベントを発火
        const eventData: ProfileChangeEvent = { profile: profileName as ProfileType,
            settings: profile;
            previousProfile  };
        this.manager.emitEvent('profileChanged', eventData';'

        const profileName2 = (profile, as any').name || profileName;'
        console.log(`[TimingAdjustmentAlgorithms] プロファイル "${profileName2"}" を適用`};"
        return true;
    }
    
    /**
     * 現在のプロファイルを取得
     */
    getCurrentProfile(): TimingProfile { return this.config.profiles[this.state.currentProfile] }
    
    /**
     * 調整倍率を取得
     */
    getAdjustmentMultiplier(): number { const profile = this.getCurrentProfile();
        const adjustmentLevels = (this.config, as any).adjustmentLevels,
        
        if (adjustmentLevels && adjustmentLevels[profile.adjustmentLevel]) {
    
}
            return adjustmentLevels[profile.adjustmentLevel].multiplier;
        ";"
        // フォールバック値""
        switch(profile.adjustmentLevel) {"

            case 'minimal': return 1.2,
            case 'moderate': return 1.5,
            case 'significant': return 2.0,
            case 'maximum': return 3.0 }
            default: return 1.0;
    
    /**
     * バブル作成時の処理
     */'
    handleBubbleCreated(bubble: GameEntity): void { ''
        if(!isGameEntity(bubble)) {''
            console.warn('[TimingAdjustmentAlgorithms] Invalid, bubble entity provided),'
            return }

        // バブルの寿命を調整
        const profile = this.getCurrentProfile();
        const customTimeout = (profile.customTimeouts as any)?.bubbleLifetime;
        const adjustment = customTimeout || this.getAdjustmentMultiplier();
        
        if (adjustment !== 1.0 && bubble.maxAge) {
        
            const originalLifetime = bubble.maxAge,
            bubble.maxAge = originalLifetime * adjustment,
            
            // タイマーを登録
            this.registerTimer(`bubble_${bubble.id')`, { : undefined, originalDuration: originalLifetime,'
    adjustedDuration: bubble.maxAge,
                startTime: Date.now( }'
                type: 'bubble'
    }
                entity: bubble);
        }
    }
    
    /**
     * タイマーを登録
     */
    registerTimer(timerId: string, config: TimerConfig): boolean { if (!isValidTimerConfig(config) { }
            console.warn(`[TimingAdjustmentAlgorithms] Invalid, timer config, for ${timerId}`};
            return false;
        }

        const registeredTimer: RegisteredTimer = { ...config,
            id: timerId,
            registeredAt: Date.now(),
            pausedTime: 0,
    extensionCount: 0  };
        this.timers.active.set(timerId, registeredTimer);
        
        // 警告タイマーの設定
        this.setupWarningTimer(timerId, config);
        
        return true;
    }
    
    /**
     * タイマーを削除
     */
    unregisterTimer(timerId: string): boolean { const wasActive = this.timers.active.has(timerId);
        this.timers.active.delete(timerId);
        this.timers.paused.delete(timerId);
        if (hasTimerExtensions(this.timers) {
        
            this.timers.extensions.delete(timerId);
            this.timers.warnings.delete(timerId); }
        }
        
        this.state.warningStates.delete(timerId);
        
        return wasActive;
    }
    
    /**
     * 警告タイマーを設定
     */
    private setupWarningTimer(timerId: string, config: TimerConfig): void { const profile = this.getCurrentProfile();
        if (!profile.preferences.showTimeWarnings) return,
        
        const warningThreshold = config.adjustedDuration * DEFAULT_WARNING_THRESHOLD,
        
        const warningTimeout = window.setTimeout(() => { 
            if (this.timers.active.has(timerId) {
                this.manager.showTimeWarning(timerId);
                // 警告情報を記録
                if (hasTimerExtensions(this.timers) {
                    this.timers.warnings.set(timerId, {);
                        triggeredAt: Date.now(),
                        acknowledged: false;);
                }
}, warningThreshold);

        // 警告タイマーのIDを保存（必要に応じてクリーンアップできるように）
        const timer = this.timers.active.get(timerId) as RegisteredTimer;
        if (timer) {
            timer.warnings = timer.warnings || [],
            timer.warnings.push({);
                triggeredAt: Date.now() + warningThreshold }
                acknowledged: false' }'

            }');'
        }
    }
    
    /**
     * タイマーを延長'
     */''
    extendTimer(timerId: string, requestedBy: ExtensionRequestor = 'user): boolean { const timer = this.timers.active.get(timerId) as RegisteredTimer,'
        if (!timer) { }
            console.warn(`[TimingAdjustmentAlgorithms] Timer, not found: ${timerId}`};
            return false;
        }
        
        // 最大延長回数チェック
        if (timer.extensionCount >= MAX_EXTENSION_COUNT) {
    
}
            console.warn(`[TimingAdjustmentAlgorithms] Maximum, extensions reached, for timer: ${timerId}`};
            return false;
        }

        const profile = this.getCurrentProfile();
        const extensionAmount = timer.originalDuration * DEFAULT_EXTENSION_PERCENTAGE;
        
        // 延長を適用
        timer.adjustedDuration += extensionAmount;
        timer.extensionCount++;
        
        // 延長記録を保存
        if (hasTimerExtensions(this.timers) {
            this.timers.extensions.set(timerId, {
                count: timer.extensionCount),
                totalExtension: timer.extensionCount * extensionAmount,
    lastExtension: Date.now();
                requestedBy' }'

            }');'
        }
        
        // 統計を更新
        this.adaptiveLearning.data.extensionRequests++;
        
        // イベントを発火
        const eventData: TimerExtensionEvent = { timerId,
            extensionAmount,
            newDuration: timer.adjustedDuration,
            requestedBy  };
        this.manager.emitEvent('timerExtended', eventData);
        
        console.log(`[TimingAdjustmentAlgorithms] タイマー ${timerId} を ${extensionAmount}ms 延長`};
        return true;
    }
    
    /**
     * 時間延長をリクエスト
     */
    requestTimeExtension(): string | null { // 現在アクティブなタイマーから最も緊急なものを選択
        let mostUrgentTimer: string | null = null,
        let shortestRemaining = Infinity,
        
        for(const [timerId, timer] of this.timers.active) {
        
            const remaining = timer.adjustedDuration - (Date.now() - timer.startTime - timer.pausedTime),
            if (remaining < shortestRemaining && remaining > 0) {
                shortestRemaining = remaining }
                mostUrgentTimer = timerId; }
}

        if (mostUrgentTimer) {

            const success = this.extendTimer(mostUrgentTimer, 'user),'
            if (success) {
                // フィードバックを表示
                this.manager.showExtensionFeedback(mostUrgentTimer, shortestRemaining);
                return mostUrgentTimer;

        return null;
    }
    
    /**
     * すべてのタイマーを一時停止'
     */''
    pauseAllTimers(reason: PauseReason = 'manual): number { if (!isPauseReason(reason) { }'

            console.warn(`[TimingAdjustmentAlgorithms] Invalid, pause reason: ${reason}`}';'
            reason = 'manual';
        }

        const pauseTime = Date.now();
        let pausedCount = 0;
        
        for(const [timerId, timer] of this.timers.active) {
        
            if (!this.timers.paused.has(timerId) {
                const pauseInfo: PauseInfo = {
                    pausedAt: pauseTime,
                    reason: reason,
                this.timers.paused.set(timerId, pauseInfo);
                pausedCount++;
            }
        }
        
        // 統計を更新
        if (pausedCount > 0) { this.adaptiveLearning.data.pauseFrequency++ }

        console.log(`[TimingAdjustmentAlgorithms] ${pausedCount}個のタイマーを一時停止 (理由: ${reason}`}';'
        return pausedCount;
    }
    
    /**
     * すべてのタイマーを再開'
     */''
    resumeAllTimers(reason: PauseReason | 'user' = 'manual): number { const resumeTime = Date.now(),'
        let resumedCount = 0,

        for(const [timerId, pauseInfo] of this.timers.paused) {

            if(pauseInfo.reason === reason || reason === 'user' {'
                const timer = this.timers.active.get(timerId) as RegisteredTimer,
                if (timer) {
        }
                    timer.pausedTime += resumeTime - pauseInfo.pausedAt; }
                }
                this.timers.paused.delete(timerId);
                resumedCount++;
            }
        }
        
        console.log(`[TimingAdjustmentAlgorithms] ${resumedCount}個のタイマーを再開 (理由: ${reason}`};
        return resumedCount;
    }
    
    /**
     * アクティブなタイマーに調整を適用
     */
    private applyAdjustmentsToActiveTimers(): void { const multiplier = this.getAdjustmentMultiplier();
        const profile = this.getCurrentProfile();
        let adjustedCount = 0,
        
        for(const [timerId, timer] of this.timers.active) {
        
            // 基本調整の適用
            const baseAdjustment = multiplier !== 1.0 ? multiplier: 1.0,
            
            // カスタム調整の適用
            let customAdjustment = 1.0,
            const customTimeouts = profile.customTimeouts as any,
            if (customTimeouts && customTimeouts[timer.type]) {
    
}
                customAdjustment = customTimeouts[timer.type]; }
            }
            
            // 最終調整値を計算
            const finalAdjustment = baseAdjustment * customAdjustment;
            
            if (finalAdjustment !== 1.0) {
            
                const elapsed = Date.now() - timer.startTime - timer.pausedTime,
                const remaining = timer.adjustedDuration - elapsed,
                
                if (remaining > 0) {
                    timer.adjustedDuration = elapsed + (remaining * finalAdjustment);
                    adjustedCount++;     }
}
        console.log(`[TimingAdjustmentAlgorithms] ${adjustedCount}個のタイマーに調整を適用`}
    }
    
    /**
     * 自動延長をスケジュール
     */
    scheduleAutoExtension(timerId: string): boolean { const timer = this.timers.active.get(timerId) as RegisteredTimer,
        const profile = this.getCurrentProfile();
        if (!timer || !profile.preferences.autoExtend) {
    
}
            return false;
        
        const gracePeriod = profile.preferences.gracePeriod || DEFAULT_GRACE_PERIOD;
        const remaining = timer.adjustedDuration - (Date.now() - timer.startTime - timer.pausedTime);
        
        if (remaining <= gracePeriod) {
        
            // グレース期間内の場合、自動延長を実行
            const scheduleTime = Math.max(0, remaining - 1000), // 1秒前に延長
            ','

            setTimeout(() => { ', '
        }

                if(this.timers.active.has(timerId)) { }'

                    this.extendTimer(timerId, 'auto'; }'
}, scheduleTime);
            
            return true;
        }

        return false;
    }
    
    /**
     * パブリックAPI: カスタムタイマーを作成
     */
    createCustomTimer(id: string, duration: number, options: CustomTimerOptions = { ): TimerResult {
        if (duration <= 0) { }
            console.warn(`[TimingAdjustmentAlgorithms] Invalid, duration for, timer ${id}: ${duration}`};
            return { id,
                originalDuration: duration,
    adjustedDuration: duration,
                created: false,

        const adjustedDuration = duration * this.getAdjustmentMultiplier();
        
        const config: TimerConfig = { originalDuration: duration,

            adjustedDuration: adjustedDuration,
            startTime: Date.now(',
    type: options.type || 'game,
            priority: options.priority || 'normal,
            entity: options.entity,
            autoExtend: options.autoExtend,
    maxExtensions: options.maxExtensions  })
);
        const created = this.registerTimer(id, config);
        
        return { id,
            originalDuration: duration,
    adjustedDuration: adjustedDuration,
            created }
        }
    
    /**
     * パブリックAPI: タイマーの残り時間を取得
     */
    getRemainingTime(timerId: string): RemainingTimeInfo | null { const timer = this.timers.active.get(timerId) as RegisteredTimer,
        if (!timer) return null,
        
        const elapsed = Date.now() - timer.startTime - timer.pausedTime,
        const remaining = Math.max(0, timer.adjustedDuration - elapsed);
        return { remaining,
            total: timer.adjustedDuration,
            percentage: (elapsed / timer.adjustedDuration) * 100,
    isPaused: this.timers.paused.has(timerId) ,
            extensionsUsed: timer.extensionCount 
    }
    
    /**
     * タイマー最適化アルゴリズムの実行
     */
    optimizeTimers(): number { const currentTime = Date.now();
        let optimizedCount = 0,
        const removedTimers: string[] = [],
        
        // 非アクティブなタイマーのクリーンアップ
        for(const [timerId, timer] of this.timers.active) {
            const elapsed = currentTime - timer.startTime - timer.pausedTime,
            
            // 既に期限切れのタイマーを削除
            if (elapsed >= timer.adjustedDuration) {
                this.unregisterTimer(timerId);
                removedTimers.push(timerId);
                optimizedCount++ }
                continue; }
            }
            
            // 長時間停止しているタイマーの最適化
            if (this.timers.paused.has(timerId) {

                const pauseInfo = this.timers.paused.get(timerId) as PauseInfo,
                const pauseDuration = currentTime - pauseInfo.pausedAt,
                ','
                // 1時間以上停止している自動停止タイマーを削除
                if(pauseDuration > AUTO_PAUSE_CLEANUP_TIME && pauseInfo.reason !== 'user' {'
                    this.unregisterTimer(timerId);
                    removedTimers.push(timerId);
                    optimizedCount++ }
                    continue;     }
}
        // 最適化統計を更新
        this.optimizationStats = { lastOptimization: currentTime,
            timersRemoved: removedTimers.length,
            timersOptimized: optimizedCount,
    performanceGain: this.calculatePerformanceGain(optimizedCount  ,
        
        this.lastOptimization = currentTime;
        
        console.log(`[TimingAdjustmentAlgorithms] タイマー最適化完了 (${optimizedCount}件処理}`};
        return optimizedCount;
    }

    /**
     * パフォーマンス向上度を計算
     */
    private calculatePerformanceGain(optimizedCount: number): number { // 簡単な計算式：削除されたタイマー数に基づく
        return Math.min(optimizedCount * 0.1, 1.0), // 最大100%の向上 }
    
    /**
     * アルゴリズム性能統計を取得
     */
    getAlgorithmStatistics(): AlgorithmStatistics { return { activeTimers: this.timers.active.size,
            pausedTimers: this.timers.paused.size,
            totalExtensions: this.adaptiveLearning.data.extensionRequests,
            pauseFrequency: this.adaptiveLearning.data.pauseFrequency,
            currentProfile: this.state.currentProfile,
            adjustmentMultiplier: this.getAdjustmentMultiplier(
    timerTypes: this.getTimerTypeDistribution() ,
            averageExtensionCount: this.calculateAverageExtensions(),
            optimization: { ...this.optimizationStats }
    
    /**
     * タイマータイプの分布を取得
     */
    private getTimerTypeDistribution(): Record<string, number> {
        const distribution: Record<string, number> = {};
        
        for (const [timerId, timer] of this.timers.active) { distribution[timer.type] = (distribution[timer.type] || 0) + 1 }
        
        return distribution;
    }
    
    /**
     * 平均延長回数を計算
     */
    private calculateAverageExtensions(): number { if (!hasTimerExtensions(this.timers) || this.timers.extensions.size === 0) {
            return 0 }
        
        let totalExtensions = 0;
        for (const [timerId, extensionInfo] of this.timers.extensions) { totalExtensions += extensionInfo.count }
        
        return totalExtensions / this.timers.extensions.size;
    }

    /**
     * 特定のタイマータイプの統計を取得
     */
    getTimerTypeStatistics(type: TimerType): { count: number, averageRemaining: number, extensions: number; { let count = 0,
        let totalRemaining = 0,
        let totalExtensions = 0,
        const currentTime = Date.now();
        for(const [timerId, timer] of this.timers.active) {

            if (timer.type === type) {
                count++;
                
                const elapsed = currentTime - timer.startTime - timer.pausedTime,
                const remaining = Math.max(0, timer.adjustedDuration - elapsed);
                totalRemaining += remaining,
                
                if (hasTimerExtensions(this.timers) {
                    const extensionInfo = this.timers.extensions.get(timerId);
                    if (extensionInfo) {
    
}
                        totalExtensions += extensionInfo.count;     }
}
        } };

        return { count,
            averageRemaining: count > 0 ? totalRemaining / count : 0 ,
            extensions: totalExtensions,

    /**
     * 緊急度の高いタイマーを取得
     */
    getUrgentTimers(threshold: number = 5000): Array<{ id: string, remaining: number, priority: TimerPriority;> {
        const urgentTimers: Array<{ id: string, remaining: number, priority: TimerPriority;> = [];
        const currentTime = Date.now();

        for(const [timerId, timer] of this.timers.active) {

            const elapsed = currentTime - timer.startTime - timer.pausedTime,
            const remaining = Math.max(0, timer.adjustedDuration - elapsed);
            if (remaining <= threshold && remaining > 0) {
                urgentTimers.push({)
                    id: timerId)','
                    remaining,') }'

                    priority: timer.priority || 'normal') }
';'
        // 優先度と残り時間でソート
        return urgentTimers.sort((a, b) => { }'

            const priorityOrder = { 'critical': 4, 'high': 3, 'normal': 2, 'low': 1 };
            const aPriority = priorityOrder[a.priority] || 2;
            const bPriority = priorityOrder[b.priority] || 2;
            
            if (aPriority !== bPriority) { return bPriority - aPriority, // 高い優先度から }
            ;
            return a.remaining - b.remaining; // 残り時間の短い順
        }');'
    }

    /**
     * タイマーの一括操作'
     */''
    bulkTimerOperation(timerIds: string[], operation: 'pause' | 'resume' | 'extend' | 'remove): { success: string[], failed: string[]; {'
        const result = { success: [] as string[], failed: [] as string[]  }
        for (const timerId of timerIds) {
            try {
                let success = false,

                switch(operation) {''
                    case 'pause': }

                        if (this.timers.active.has(timerId) && !this.timers.paused.has(timerId) { }'

                            this.timers.paused.set(timerId, { pausedAt: Date.now(), reason: 'manual'
            }');'
                            success = true;
                        }

                        break;
                    case 'resume':
                        if (this.timers.paused.has(timerId) {
                            const pauseInfo = this.timers.paused.get(timerId) as PauseInfo,
                            const timer = this.timers.active.get(timerId) as RegisteredTimer,
                            if (timer) {
                                timer.pausedTime += Date.now() - pauseInfo.pausedAt,
                                this.timers.paused.delete(timerId);
                                success = true; }
}

                        break;
                    case 'extend':';'
                        success = this.extendTimer(timerId, 'system');

                        break;
                    case 'remove':
                        success = this.unregisterTimer(timerId);
                        break;
                } };

                if (success) { result.success.push(timerId) } else { result.failed.push(timerId) } catch (error) {
                console.error(`[TimingAdjustmentAlgorithms] Bulk operation failed for timer ${timerId}:`, error);
                result.failed.push(timerId);
            }
        }

        return result;
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy(): void { // タイマーをクリア
        this.timers.active.clear();
        this.timers.paused.clear();
        if (hasTimerExtensions(this.timers) {
        ','

            this.timers.extensions.clear();
            this.timers.warnings.clear();

        console.log('[TimingAdjustmentAlgorithms] Component, destroyed'); }

    }'}'