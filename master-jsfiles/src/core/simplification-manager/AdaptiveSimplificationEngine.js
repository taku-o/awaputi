/**
 * AdaptiveSimplificationEngine - 適応的簡素化エンジン
 * 
 * ユーザー行動とコンテキストに基づいて動的に簡素化レベルを調整
 */

export class AdaptiveSimplificationEngine {
    constructor() {
        this.adaptationSettings = {
            enabled: true,
            sensitivity: 0.7,
            responsiveness: 'medium',
            learningRate: 0.1,
            stabilityThreshold: 0.3
        };
        
        this.userBehaviorMetrics = {
            errorRate: 0,
            taskCompletionTime: 0,
            interactionFrequency: 0,
            hesitationTime: 0,
            backtrackingRate: 0,
            helpRequestRate: 0
        };
        
        this.contextualFactors = {
            timeOfDay: 'day',
            sessionDuration: 0,
            deviceType: 'desktop',
            networkSpeed: 'fast',
            batteryLevel: 1.0,
            multitaskingLevel: 'low'
        };
        
        this.adaptationHistory = [];
        this.learningModel = this.initializeLearningModel();
        
        this.setupBehaviorTracking();
        this.setupContextMonitoring();
    }

    /**
     * 学習モデルを初期化
     */
    initializeLearningModel() {
        return {
            weights: {
                errorRate: 0.3,
                taskCompletionTime: 0.2,
                interactionFrequency: 0.15,
                hesitationTime: 0.15,
                backtrackingRate: 0.1,
                helpRequestRate: 0.1
            },
            biases: {
                timeOfDay: { morning: 0.1, afternoon: 0, evening: -0.1, night: -0.2 },
                deviceType: { desktop: 0, tablet: 0.1, mobile: 0.2 },
                sessionDuration: { short: 0, medium: 0.1, long: 0.2 }
            },
            thresholds: {
                adaptationTrigger: 0.6,
                significantChange: 0.3,
                stabilityRequired: 0.8
            }
        };
    }

    /**
     * 行動追跡を設定
     */
    setupBehaviorTracking() {
        this.behaviorTracker = {
            startTime: Date.now(),
            lastInteraction: Date.now(),
            errorCount: 0,
            interactionCount: 0,
            hesitationEvents: [],
            backtrackEvents: [],
            helpRequests: []
        };

        // インタラクション追跡
        document.addEventListener('click', (e) => {
            this.recordInteraction('click', e);
        });

        document.addEventListener('keydown', (e) => {
            this.recordInteraction('keydown', e);
        });

        // エラー追跡
        window.addEventListener('error', (e) => {
            this.recordError(e);
        });

        // ページ可視性変更の追跡
        document.addEventListener('visibilitychange', () => {
            this.updateContextualFactors();
        });
    }

    /**
     * コンテキスト監視を設定
     */
    setupContextMonitoring() {
        // 時間帯の監視
        this.updateTimeOfDay();
        setInterval(() => this.updateTimeOfDay(), 60000); // 1分ごと

        // デバイス情報の取得
        this.detectDeviceType();

        // ネットワーク速度の監視
        this.monitorNetworkSpeed();

        // バッテリー情報の監視（サポートされている場合）
        this.monitorBatteryLevel();

        // セッション時間の更新
        setInterval(() => this.updateSessionDuration(), 10000); // 10秒ごと
    }

    /**
     * インタラクションを記録
     */
    recordInteraction(type, event) {
        const now = Date.now();
        const timeSinceLastInteraction = now - this.behaviorTracker.lastInteraction;

        // 躊躇時間の検出（3秒以上の間隔）
        if (timeSinceLastInteraction > 3000) {
            this.behaviorTracker.hesitationEvents.push({
                duration: timeSinceLastInteraction,
                timestamp: now,
                context: this.getCurrentContext()
            });
        }

        this.behaviorTracker.lastInteraction = now;
        this.behaviorTracker.interactionCount++;

        // バックトラッキングの検出
        if (this.isBacktrackingBehavior(event)) {
            this.behaviorTracker.backtrackEvents.push({
                timestamp: now,
                type,
                context: this.getCurrentContext()
            });
        }

        this.updateBehaviorMetrics();
        this.evaluateAdaptationNeed();
    }

    /**
     * エラーを記録
     */
    recordError(error) {
        this.behaviorTracker.errorCount++;
        this.updateBehaviorMetrics();
        this.evaluateAdaptationNeed();
    }

    /**
     * ヘルプリクエストを記録
     */
    recordHelpRequest(context) {
        this.behaviorTracker.helpRequests.push({
            timestamp: Date.now(),
            context
        });
        this.updateBehaviorMetrics();
        this.evaluateAdaptationNeed();
    }

    /**
     * バックトラッキング行動かチェック
     */
    isBacktrackingBehavior(event) {
        // 簡単な実装：戻るボタン、ESCキー、同じ要素への繰り返しクリック
        if (event.type === 'keydown' && event.key === 'Escape') {
            return true;
        }

        if (event.type === 'click' && event.target) {
            const recentClicks = this.behaviorTracker.recentClicks || [];
            const elementId = event.target.id || event.target.className;
            
            // 直近5秒以内に同じ要素をクリックしている
            const recentSameElement = recentClicks.filter(click => 
                click.elementId === elementId && 
                Date.now() - click.timestamp < 5000
            );

            if (recentSameElement.length > 2) {
                return true;
            }

            // 最近のクリックを記録
            recentClicks.push({
                elementId,
                timestamp: Date.now()
            });

            // 履歴サイズを制限
            this.behaviorTracker.recentClicks = recentClicks.slice(-10);
        }

        return false;
    }

    /**
     * 行動メトリクスを更新
     */
    updateBehaviorMetrics() {
        const sessionTime = Date.now() - this.behaviorTracker.startTime;
        const sessionMinutes = sessionTime / 60000;

        this.userBehaviorMetrics = {
            errorRate: this.behaviorTracker.errorCount / Math.max(sessionMinutes, 1),
            taskCompletionTime: this.calculateAverageTaskTime(),
            interactionFrequency: this.behaviorTracker.interactionCount / Math.max(sessionMinutes, 1),
            hesitationTime: this.calculateAverageHesitationTime(),
            backtrackingRate: this.behaviorTracker.backtrackEvents.length / Math.max(sessionMinutes, 1),
            helpRequestRate: this.behaviorTracker.helpRequests.length / Math.max(sessionMinutes, 1)
        };
    }

    /**
     * 平均タスク時間を計算
     */
    calculateAverageTaskTime() {
        // 簡素化：最近のインタラクション間隔の平均
        const recentInteractions = this.behaviorTracker.recentInteractionTimes || [];
        if (recentInteractions.length < 2) return 0;

        const intervals = [];
        for (let i = 1; i < recentInteractions.length; i++) {
            intervals.push(recentInteractions[i] - recentInteractions[i - 1]);
        }

        return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }

    /**
     * 平均躊躇時間を計算
     */
    calculateAverageHesitationTime() {
        const hesitations = this.behaviorTracker.hesitationEvents;
        if (hesitations.length === 0) return 0;

        const totalHesitation = hesitations.reduce((sum, h) => sum + h.duration, 0);
        return totalHesitation / hesitations.length;
    }

    /**
     * 適応の必要性を評価
     */
    evaluateAdaptationNeed() {
        if (!this.adaptationSettings.enabled) return;

        const complexityScore = this.calculateComplexityScore();
        const adaptationScore = this.calculateAdaptationScore(complexityScore);

        if (adaptationScore > this.learningModel.thresholds.adaptationTrigger) {
            const recommendation = this.generateAdaptationRecommendation(complexityScore);
            this.executeAdaptation(recommendation);
        }
    }

    /**
     * 複雑度スコアを計算
     */
    calculateComplexityScore() {
        const metrics = this.userBehaviorMetrics;
        const weights = this.learningModel.weights;

        // 正規化されたメトリクスを計算
        const normalizedMetrics = {
            errorRate: Math.min(metrics.errorRate / 10, 1), // 10エラー/分を最大とする
            taskCompletionTime: Math.min(metrics.taskCompletionTime / 30000, 1), // 30秒を最大とする
            interactionFrequency: Math.min(metrics.interactionFrequency / 100, 1), // 100インタラクション/分を最大とする
            hesitationTime: Math.min(metrics.hesitationTime / 10000, 1), // 10秒を最大とする
            backtrackingRate: Math.min(metrics.backtrackingRate / 5, 1), // 5回/分を最大とする
            helpRequestRate: Math.min(metrics.helpRequestRate / 2, 1) // 2回/分を最大とする
        };

        // 重み付きスコアを計算
        const score = Object.keys(normalizedMetrics).reduce((sum, key) => {
            return sum + normalizedMetrics[key] * weights[key];
        }, 0);

        return score;
    }

    /**
     * 適応スコアを計算
     */
    calculateAdaptationScore(complexityScore) {
        // コンテキスト要因を考慮
        const contextualBias = this.calculateContextualBias();
        
        // 学習履歴を考慮
        const historicalBias = this.calculateHistoricalBias();

        // 適応敏感度を適用
        const sensitizedScore = complexityScore * this.adaptationSettings.sensitivity;

        return sensitizedScore + contextualBias + historicalBias;
    }

    /**
     * コンテキスト的バイアスを計算
     */
    calculateContextualBias() {
        const biases = this.learningModel.biases;
        let bias = 0;

        // 時間帯バイアス
        bias += biases.timeOfDay[this.contextualFactors.timeOfDay] || 0;

        // デバイスタイプバイアス
        bias += biases.deviceType[this.contextualFactors.deviceType] || 0;

        // セッション時間バイアス
        const sessionDuration = this.getSessionDurationCategory();
        bias += biases.sessionDuration[sessionDuration] || 0;

        return bias;
    }

    /**
     * 履歴的バイアスを計算
     */
    calculateHistoricalBias() {
        const recentAdaptations = this.adaptationHistory.slice(-5);
        if (recentAdaptations.length === 0) return 0;

        // 最近の適応の成功率を考慮
        const successRate = recentAdaptations.filter(a => a.successful).length / recentAdaptations.length;
        
        // 成功率が低い場合は適応を控えめに
        return successRate < 0.5 ? -0.2 : 0.1;
    }

    /**
     * 適応推奨を生成
     */
    generateAdaptationRecommendation(complexityScore) {
        let recommendedLevel = 'none';

        if (complexityScore > 0.8) {
            recommendedLevel = 'extreme';
        } else if (complexityScore > 0.6) {
            recommendedLevel = 'significant';
        } else if (complexityScore > 0.4) {
            recommendedLevel = 'moderate';
        } else if (complexityScore > 0.2) {
            recommendedLevel = 'minimal';
        }

        return {
            level: recommendedLevel,
            score: complexityScore,
            reason: this.getAdaptationReason(complexityScore),
            confidence: this.calculateConfidence(complexityScore),
            options: this.getRecommendedOptions()
        };
    }

    /**
     * 適応理由を取得
     */
    getAdaptationReason(score) {
        const metrics = this.userBehaviorMetrics;
        const reasons = [];

        if (metrics.errorRate > 2) {
            reasons.push('エラー発生率が高い');
        }

        if (metrics.hesitationTime > 5000) {
            reasons.push('操作に迷いが見られる');
        }

        if (metrics.backtrackingRate > 1) {
            reasons.push('やり直し操作が多い');
        }

        if (metrics.helpRequestRate > 0.5) {
            reasons.push('ヘルプ要求が多い');
        }

        return reasons.length > 0 ? reasons.join(', ') : '総合的な複雑度スコアが高い';
    }

    /**
     * 信頼度を計算
     */
    calculateConfidence(score) {
        // データの安定性に基づく信頼度
        const sessionTime = Date.now() - this.behaviorTracker.startTime;
        const timeFactor = Math.min(sessionTime / 300000, 1); // 5分で最大

        const interactionFactor = Math.min(this.behaviorTracker.interactionCount / 50, 1); // 50インタラクションで最大

        return (timeFactor + interactionFactor) / 2;
    }

    /**
     * 推奨オプションを取得
     */
    getRecommendedOptions() {
        const options = {};

        // バッテリーレベルが低い場合
        if (this.contextualFactors.batteryLevel < 0.3) {
            options.reduceAnimations = true;
            options.reduceEffects = true;
        }

        // 低速ネットワークの場合
        if (this.contextualFactors.networkSpeed === 'slow') {
            options.reduceImages = true;
            options.simplifyLayout = true;
        }

        // モバイルデバイスの場合
        if (this.contextualFactors.deviceType === 'mobile') {
            options.largeText = true;
            options.simplifyNavigation = true;
        }

        return options;
    }

    /**
     * 適応を実行
     */
    executeAdaptation(recommendation) {
        const adaptationRecord = {
            timestamp: Date.now(),
            recommendation,
            context: { ...this.contextualFactors },
            metrics: { ...this.userBehaviorMetrics },
            executed: false,
            successful: false
        };

        try {
            // 適応実行のイベントを発火
            const event = new CustomEvent('simplificationAdaptation', {
                detail: recommendation
            });
            document.dispatchEvent(event);

            adaptationRecord.executed = true;
            adaptationRecord.successful = true;

        } catch (error) {
            console.error('Failed to execute adaptation:', error);
            adaptationRecord.error = error.message;
        }

        this.adaptationHistory.push(adaptationRecord);

        // 履歴サイズを制限
        if (this.adaptationHistory.length > 100) {
            this.adaptationHistory = this.adaptationHistory.slice(-50);
        }

        // 学習モデルを更新
        this.updateLearningModel(adaptationRecord);
    }

    /**
     * 学習モデルを更新
     */
    updateLearningModel(adaptationRecord) {
        if (!adaptationRecord.successful) return;

        const learningRate = this.adaptationSettings.learningRate;
        
        // 重みの調整（簡素化された実装）
        const targetScore = adaptationRecord.recommendation.score;
        const actualComplexity = this.calculateComplexityScore();
        
        const error = targetScore - actualComplexity;
        
        // 重みを小さく調整
        Object.keys(this.learningModel.weights).forEach(key => {
            this.learningModel.weights[key] += error * learningRate * 0.01;
        });
    }

    /**
     * 現在のコンテキストを取得
     */
    getCurrentContext() {
        return {
            ...this.contextualFactors,
            activeElement: document.activeElement?.tagName || 'unknown',
            scrollPosition: window.scrollY,
            viewportSize: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }

    /**
     * 時間帯を更新
     */
    updateTimeOfDay() {
        const hour = new Date().getHours();
        
        if (hour >= 6 && hour < 12) {
            this.contextualFactors.timeOfDay = 'morning';
        } else if (hour >= 12 && hour < 18) {
            this.contextualFactors.timeOfDay = 'afternoon';
        } else if (hour >= 18 && hour < 22) {
            this.contextualFactors.timeOfDay = 'evening';
        } else {
            this.contextualFactors.timeOfDay = 'night';
        }
    }

    /**
     * デバイスタイプを検出
     */
    detectDeviceType() {
        const userAgent = navigator.userAgent;
        
        if (/tablet|ipad/i.test(userAgent)) {
            this.contextualFactors.deviceType = 'tablet';
        } else if (/mobile|phone/i.test(userAgent)) {
            this.contextualFactors.deviceType = 'mobile';
        } else {
            this.contextualFactors.deviceType = 'desktop';
        }
    }

    /**
     * ネットワーク速度を監視
     */
    monitorNetworkSpeed() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            const updateNetworkSpeed = () => {
                if (connection.effectiveType) {
                    switch (connection.effectiveType) {
                        case 'slow-2g':
                        case '2g':
                            this.contextualFactors.networkSpeed = 'slow';
                            break;
                        case '3g':
                            this.contextualFactors.networkSpeed = 'medium';
                            break;
                        case '4g':
                        default:
                            this.contextualFactors.networkSpeed = 'fast';
                            break;
                    }
                }
            };

            updateNetworkSpeed();
            connection.addEventListener('change', updateNetworkSpeed);
        }
    }

    /**
     * バッテリーレベルを監視
     */
    async monitorBatteryLevel() {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                
                const updateBatteryLevel = () => {
                    this.contextualFactors.batteryLevel = battery.level;
                };

                updateBatteryLevel();
                battery.addEventListener('levelchange', updateBatteryLevel);
            } catch (error) {
                // バッテリーAPI が利用できない場合
                this.contextualFactors.batteryLevel = 1.0;
            }
        }
    }

    /**
     * セッション時間を更新
     */
    updateSessionDuration() {
        this.contextualFactors.sessionDuration = Date.now() - this.behaviorTracker.startTime;
    }

    /**
     * セッション時間カテゴリを取得
     */
    getSessionDurationCategory() {
        const duration = this.contextualFactors.sessionDuration;
        
        if (duration < 300000) return 'short'; // 5分未満
        if (duration < 1800000) return 'medium'; // 30分未満
        return 'long'; // 30分以上
    }

    /**
     * 適応設定を更新
     */
    updateAdaptationSettings(newSettings) {
        Object.assign(this.adaptationSettings, newSettings);
    }

    /**
     * 統計情報を取得
     */
    getStats() {
        return {
            userBehaviorMetrics: { ...this.userBehaviorMetrics },
            contextualFactors: { ...this.contextualFactors },
            adaptationHistory: this.adaptationHistory.slice(-10),
            learningModel: {
                weights: { ...this.learningModel.weights },
                thresholds: { ...this.learningModel.thresholds }
            },
            sessionStats: {
                sessionDuration: this.contextualFactors.sessionDuration,
                totalInteractions: this.behaviorTracker.interactionCount,
                totalErrors: this.behaviorTracker.errorCount,
                totalAdaptations: this.adaptationHistory.length
            }
        };
    }

    /**
     * リセット
     */
    reset() {
        this.behaviorTracker = {
            startTime: Date.now(),
            lastInteraction: Date.now(),
            errorCount: 0,
            interactionCount: 0,
            hesitationEvents: [],
            backtrackEvents: [],
            helpRequests: []
        };

        this.userBehaviorMetrics = {
            errorRate: 0,
            taskCompletionTime: 0,
            interactionFrequency: 0,
            hesitationTime: 0,
            backtrackingRate: 0,
            helpRequestRate: 0
        };

        this.adaptationHistory = [];
    }

    /**
     * クリーンアップ
     */
    destroy() {
        // イベントリスナーの削除は困難なため、設定を無効にするのみ
        this.adaptationSettings.enabled = false;
        this.reset();
    }
}