/**
 * TimingAdjustmentAlgorithms
 * 調整アルゴリズム実装、パフォーマンス最適化、適応的タイミング制御
 */
export class TimingAdjustmentAlgorithms {
    constructor(timingAdjustmentManager) {
        this.manager = timingAdjustmentManager;
        this.gameEngine = timingAdjustmentManager.gameEngine;
        this.config = timingAdjustmentManager.config;
        this.state = timingAdjustmentManager.state;
        this.timers = timingAdjustmentManager.timers;
        this.adaptiveLearning = timingAdjustmentManager.adaptiveLearning;
        
        console.log('[TimingAdjustmentAlgorithms] Component initialized');
    }
    
    /**
     * プロファイルを適用
     */
    applyProfile(profileName) {
        if (!this.config.profiles[profileName]) {
            console.warn(`TimingAdjustmentAlgorithms: 不明なプロファイル: ${profileName}`);
            return false;
        }
        
        this.state.currentProfile = profileName;
        const profile = this.config.profiles[profileName];
        
        // 現在のタイマーに調整を適用
        this.applyAdjustmentsToActiveTimers();
        
        // 設定を保存
        localStorage.setItem('timingAdjustmentProfile', profileName);
        
        // イベントを発火
        this.manager.emitEvent('profileChanged', { 
            profile: profileName, 
            settings: profile 
        });
        
        console.log(`TimingAdjustmentAlgorithms: プロファイル "${profile.name}" を適用`);
        return true;
    }
    
    /**
     * 現在のプロファイルを取得
     */
    getCurrentProfile() {
        return this.config.profiles[this.state.currentProfile];
    }
    
    /**
     * 調整倍率を取得
     */
    getAdjustmentMultiplier() {
        const profile = this.getCurrentProfile();
        return this.config.adjustmentLevels[profile.adjustmentLevel].multiplier;
    }
    
    /**
     * バブル作成時の処理
     */
    handleBubbleCreated(bubble) {
        // バブルの寿命を調整
        const profile = this.getCurrentProfile();
        const adjustment = profile.customTimeouts.bubbleLifetime || this.getAdjustmentMultiplier();
        
        if (adjustment !== 1.0) {
            const originalLifetime = bubble.maxAge;
            bubble.maxAge = originalLifetime * adjustment;
            
            // タイマーを登録
            this.registerTimer(`bubble_${bubble.id}`, {
                originalDuration: originalLifetime,
                adjustedDuration: bubble.maxAge,
                startTime: Date.now(),
                type: 'bubble',
                entity: bubble
            });
        }
    }
    
    /**
     * タイマーを登録
     */
    registerTimer(timerId, config) {
        this.timers.active.set(timerId, {
            ...config,
            id: timerId,
            registeredAt: Date.now(),
            pausedTime: 0,
            extensionCount: 0
        });
        
        // 警告タイマーの設定
        this.setupWarningTimer(timerId, config);
    }
    
    /**
     * タイマーを削除
     */
    unregisterTimer(timerId) {
        this.timers.active.delete(timerId);
        this.timers.paused.delete(timerId);
        this.timers.extensions.delete(timerId);
        this.timers.warnings.delete(timerId);
        this.state.warningStates.delete(timerId);
    }
    
    /**
     * 警告タイマーを設定
     */
    setupWarningTimer(timerId, config) {
        const profile = this.getCurrentProfile();
        if (!profile.preferences.showTimeWarnings) return;
        
        const warningThreshold = config.adjustedDuration * 0.8; // 80%で警告
        
        setTimeout(() => {
            if (this.timers.active.has(timerId)) {
                this.manager.showTimeWarning(timerId);
            }
        }, warningThreshold);
    }
    
    /**
     * タイマーを延長
     */
    extendTimer(timerId) {
        const timer = this.timers.active.get(timerId);
        if (!timer) return false;
        
        const profile = this.getCurrentProfile();
        const extensionAmount = timer.originalDuration * 0.5; // 50%延長
        
        // 延長を適用
        timer.adjustedDuration += extensionAmount;
        timer.extensionCount++;
        
        // 延長記録を保存
        this.timers.extensions.set(timerId, {
            count: timer.extensionCount,
            totalExtension: timer.extensionCount * extensionAmount,
            lastExtension: Date.now()
        });
        
        // 統計を更新
        this.adaptiveLearning.data.extensionRequests++;
        
        // イベントを発火
        this.manager.emitEvent('timerExtended', {
            timerId,
            extensionAmount,
            newDuration: timer.adjustedDuration
        });
        
        console.log(`TimingAdjustmentAlgorithms: タイマー ${timerId} を ${extensionAmount}ms 延長`);
        return true;
    }
    
    /**
     * 時間延長をリクエスト
     */
    requestTimeExtension() {
        // 現在アクティブなタイマーから最も緊急なものを選択
        let mostUrgentTimer = null;
        let shortestRemaining = Infinity;
        
        for (const [timerId, timer] of this.timers.active) {
            const remaining = timer.adjustedDuration - (Date.now() - timer.startTime - timer.pausedTime);
            if (remaining < shortestRemaining && remaining > 0) {
                shortestRemaining = remaining;
                mostUrgentTimer = timerId;
            }
        }
        
        if (mostUrgentTimer) {
            this.extendTimer(mostUrgentTimer);
            
            // フィードバックを表示
            this.manager.showExtensionFeedback(mostUrgentTimer, shortestRemaining);
        }
    }
    
    /**
     * すべてのタイマーを一時停止
     */
    pauseAllTimers(reason = 'manual') {
        const pauseTime = Date.now();
        
        for (const [timerId, timer] of this.timers.active) {
            if (!this.timers.paused.has(timerId)) {
                this.timers.paused.set(timerId, {
                    pausedAt: pauseTime,
                    reason: reason
                });
            }
        }
        
        // 統計を更新
        this.adaptiveLearning.data.pauseFrequency++;
        
        console.log(`TimingAdjustmentAlgorithms: すべてのタイマーを一時停止 (理由: ${reason})`);
    }
    
    /**
     * すべてのタイマーを再開
     */
    resumeAllTimers(reason = 'manual') {
        const resumeTime = Date.now();
        
        for (const [timerId, pauseInfo] of this.timers.paused) {
            if (pauseInfo.reason === reason || reason === 'user') {
                const timer = this.timers.active.get(timerId);
                if (timer) {
                    timer.pausedTime += resumeTime - pauseInfo.pausedAt;
                }
                this.timers.paused.delete(timerId);
            }
        }
        
        console.log(`TimingAdjustmentAlgorithms: タイマーを再開 (理由: ${reason})`);
    }
    
    /**
     * アクティブなタイマーに調整を適用
     */
    applyAdjustmentsToActiveTimers() {
        const multiplier = this.getAdjustmentMultiplier();
        const profile = this.getCurrentProfile();
        
        for (const [timerId, timer] of this.timers.active) {
            // 基本調整の適用
            const baseAdjustment = multiplier !== 1.0 ? multiplier : 1.0;
            
            // カスタム調整の適用
            let customAdjustment = 1.0;
            if (profile.customTimeouts[timer.type]) {
                customAdjustment = profile.customTimeouts[timer.type];
            }
            
            // 最終調整値を計算
            const finalAdjustment = baseAdjustment * customAdjustment;
            
            if (finalAdjustment !== 1.0) {
                const elapsed = Date.now() - timer.startTime - timer.pausedTime;
                const remaining = timer.adjustedDuration - elapsed;
                
                if (remaining > 0) {
                    timer.adjustedDuration = elapsed + (remaining * finalAdjustment);
                }
            }
        }
    }
    
    /**
     * 自動延長をスケジュール
     */
    scheduleAutoExtension(timerId) {
        const timer = this.timers.active.get(timerId);
        const profile = this.getCurrentProfile();
        
        if (!timer || !profile.preferences.autoExtend) return;
        
        const gracePeriod = profile.preferences.gracePeriod;
        const remaining = timer.adjustedDuration - (Date.now() - timer.startTime - timer.pausedTime);
        
        if (remaining <= gracePeriod) {
            // グレース期間内の場合、自動延長を実行
            setTimeout(() => {
                if (this.timers.active.has(timerId)) {
                    this.extendTimer(timerId);
                }
            }, Math.max(0, remaining - 1000)); // 1秒前に延長
        }
    }
    
    /**
     * パブリックAPI: カスタムタイマーを作成
     */
    createCustomTimer(id, duration, options = {}) {
        const adjustedDuration = duration * this.getAdjustmentMultiplier();
        
        this.registerTimer(id, {
            originalDuration: duration,
            adjustedDuration: adjustedDuration,
            startTime: Date.now(),
            type: options.type || 'custom',
            ...options
        });
        
        return {
            id,
            originalDuration: duration,
            adjustedDuration: adjustedDuration
        };
    }
    
    /**
     * パブリックAPI: タイマーの残り時間を取得
     */
    getRemainingTime(timerId) {
        const timer = this.timers.active.get(timerId);
        if (!timer) return null;
        
        const elapsed = Date.now() - timer.startTime - timer.pausedTime;
        const remaining = Math.max(0, timer.adjustedDuration - elapsed);
        
        return {
            remaining,
            total: timer.adjustedDuration,
            percentage: (elapsed / timer.adjustedDuration) * 100
        };
    }
    
    /**
     * タイマー最適化アルゴリズムの実行
     */
    optimizeTimers() {
        const currentTime = Date.now();
        const optimizedCount = 0;
        
        // 非アクティブなタイマーのクリーンアップ
        for (const [timerId, timer] of this.timers.active) {
            const elapsed = currentTime - timer.startTime - timer.pausedTime;
            
            // 既に期限切れのタイマーを削除
            if (elapsed >= timer.adjustedDuration) {
                this.unregisterTimer(timerId);
                continue;
            }
            
            // 長時間停止しているタイマーの最適化
            if (this.timers.paused.has(timerId)) {
                const pauseInfo = this.timers.paused.get(timerId);
                const pauseDuration = currentTime - pauseInfo.pausedAt;
                
                // 1時間以上停止している自動停止タイマーを削除
                if (pauseDuration > 3600000 && pauseInfo.reason !== 'user') {
                    this.unregisterTimer(timerId);
                    continue;
                }
            }
        }
        
        console.log(`TimingAdjustmentAlgorithms: タイマー最適化完了 (${optimizedCount}件処理)`);
        return optimizedCount;
    }
    
    /**
     * アルゴリズム性能統計を取得
     */
    getAlgorithmStatistics() {
        return {
            activeTimers: this.timers.active.size,
            pausedTimers: this.timers.paused.size,
            totalExtensions: this.adaptiveLearning.data.extensionRequests,
            pauseFrequency: this.adaptiveLearning.data.pauseFrequency,
            currentProfile: this.state.currentProfile,
            adjustmentMultiplier: this.getAdjustmentMultiplier(),
            timerTypes: this.getTimerTypeDistribution(),
            averageExtensionCount: this.calculateAverageExtensions()
        };
    }
    
    /**
     * タイマータイプの分布を取得
     */
    getTimerTypeDistribution() {
        const distribution = {};
        
        for (const [timerId, timer] of this.timers.active) {
            distribution[timer.type] = (distribution[timer.type] || 0) + 1;
        }
        
        return distribution;
    }
    
    /**
     * 平均延長回数を計算
     */
    calculateAverageExtensions() {
        if (this.timers.extensions.size === 0) return 0;
        
        let totalExtensions = 0;
        for (const [timerId, extensionInfo] of this.timers.extensions) {
            totalExtensions += extensionInfo.count;
        }
        
        return totalExtensions / this.timers.extensions.size;
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy() {
        // タイマーをクリア
        this.timers.active.clear();
        this.timers.paused.clear();
        this.timers.extensions.clear();
        this.timers.warnings.clear();
        
        console.log('[TimingAdjustmentAlgorithms] Component destroyed');
    }
}