/**
 * Enhanced Analytics Manager
 * 既存のAnalyticsクラスを拡張し、ゲーム分析機能を統合
 */

import { Analytics } from '../utils/Analytics.js';
import { PrivacyManager } from './PrivacyManager.js';
import { IndexedDBStorageManager } from './IndexedDBStorageManager.js';
import { DataCollector } from './DataCollector.js';
import { GameBalanceCollector } from './GameBalanceCollector.js';

export class EnhancedAnalyticsManager extends Analytics {
    constructor(options = {}) {
        super();
        
        // 設定
        this.options = {
            enableGameAnalytics: options.enableGameAnalytics !== false,
            enablePerformanceTracking: options.enablePerformanceTracking !== false,
            enableBehaviorAnalysis: options.enableBehaviorAnalysis !== false,
            autoInitialize: options.autoInitialize !== false,
            ...options
        };
        
        // コンポーネント
        this.privacyManager = null;
        this.storageManager = null;
        this.dataCollector = null;
        this.gameBalanceCollector = null;
        
        // 状態管理
        this.isInitialized = false;
        this.isGameAnalyticsEnabled = false;
        
        // パフォーマンス監視
        this.performanceMonitor = {
            fps: 0,
            memoryUsage: null,
            errorCount: 0,
            lastCheck: Date.now()
        };
        
        // プレイヤー行動分析
        this.playerBehavior = {
            sessionData: null,
            interactionPatterns: [],
            skillProgression: {
                accuracyHistory: [],
                reactionTimeHistory: [],
                comboHistory: []
            },
            playStyle: {
                aggressive: 0,
                defensive: 0,
                strategic: 0
            }
        };
        
        // 自動初期化
        if (this.options.autoInitialize) {
            this.initialize();
        }
    }
    
    /**
     * 拡張アナリティクスの初期化
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // プライバシーマネージャーの初期化
            this.privacyManager = new PrivacyManager();
            
            // 同意要求（必要に応じて）
            if (this.privacyManager.consentStatus === null) {
                await this.privacyManager.requestConsent();
            }
            
            if (!this.privacyManager.checkConsent()) {
                console.info('Analytics consent not given, game analytics disabled');
                return;
            }
            
            // ストレージマネージャーの初期化
            this.storageManager = new IndexedDBStorageManager();
            await this.storageManager.initialize();
            
            // データコレクターの初期化
            this.dataCollector = new DataCollector(this.privacyManager, this.storageManager);
            
            // ゲームバランスコレクターの初期化
            this.gameBalanceCollector = new GameBalanceCollector(this.dataCollector);
            
            // パフォーマンス監視の開始
            if (this.options.enablePerformanceTracking) {
                this.startPerformanceMonitoring();
            }
            
            this.isInitialized = true;
            this.isGameAnalyticsEnabled = true;
            
            console.info('Enhanced Analytics Manager initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Enhanced Analytics Manager:', error);
            this.handleInitializationError(error);
        }
    }
    
    /**
     * 初期化エラーの処理
     * @param {Error} error - エラー
     */
    handleInitializationError(error) {
        // フォールバック：基本のAnalyticsのみ使用
        console.warn('Falling back to basic analytics only');
        this.isGameAnalyticsEnabled = false;
        
        // エラーレポート（基本のAnalyticsを使用）
        if (typeof this.trackError === 'function') {
            this.trackError(error, {
                context: 'EnhancedAnalyticsManager.initialize',
                severity: 'high'
            });
        }
    }
    
    /**
     * ゲームセッション開始の追跡
     * @param {Object} sessionInfo - セッション情報
     */
    startGameSession(sessionInfo) {
        // 基本のAnalytics
        if (typeof this.trackEvent === 'function') {
            this.trackEvent('game_session_start', {
                stage_id: sessionInfo.stageId,
                difficulty: sessionInfo.difficulty,
                player_level: sessionInfo.playerLevel || 'unknown'
            });
        }
        
        // 拡張アナリティクス
        if (this.isGameAnalyticsEnabled && this.dataCollector) {
            this.dataCollector.startSession({
                stageId: sessionInfo.stageId,
                difficulty: sessionInfo.difficulty,
                soundEnabled: sessionInfo.soundEnabled,
                effectsEnabled: sessionInfo.effectsEnabled,
                playerLevel: sessionInfo.playerLevel,
                previousBestScore: sessionInfo.previousBestScore || 0
            });
            
            // プレイヤー行動分析の初期化
            this.initializePlayerBehaviorTracking(sessionInfo);
        }
    }
    
    /**
     * ゲームセッション終了の追跡
     * @param {Object} endInfo - 終了情報
     */
    endGameSession(endInfo) {
        // 基本のAnalytics
        if (typeof this.trackEvent === 'function') {
            this.trackEvent('game_session_end', {
                duration: endInfo.duration,
                final_score: endInfo.finalScore,
                completed: endInfo.completed,
                exit_reason: endInfo.exitReason
            });
        }
        
        // 拡張アナリティクス
        if (this.isGameAnalyticsEnabled && this.dataCollector) {
            this.dataCollector.endSession({
                finalScore: endInfo.finalScore,
                bubblesPopped: endInfo.bubblesPopped,
                bubblesMissed: endInfo.bubblesMissed,
                maxCombo: endInfo.maxCombo,
                completed: endInfo.completed,
                exitReason: endInfo.exitReason
            });
            
            // プレイヤー行動分析の更新
            this.updatePlayerBehaviorAnalysis(endInfo);
        }
    }
    
    /**
     * バブルインタラクションの追跡
     * @param {Object} bubbleData - バブルデータ
     */
    trackBubbleInteraction(bubbleData) {
        // 基本のAnalytics
        if (typeof this.trackEvent === 'function') {
            this.trackEvent('bubble_interaction', {
                bubble_type: bubbleData.bubbleType,
                action: bubbleData.action,
                reaction_time: bubbleData.reactionTime
            });
        }
        
        // 拡張アナリティクス
        if (this.isGameAnalyticsEnabled) {
            // データ収集
            if (this.dataCollector) {
                this.dataCollector.collectBubbleInteraction(bubbleData);
            }
            
            // ゲームバランス分析
            if (this.gameBalanceCollector && bubbleData.action === 'popped') {
                this.gameBalanceCollector.collectBubbleSpawn({
                    type: bubbleData.bubbleType,
                    position: bubbleData.position,
                    stageProgress: bubbleData.stageProgress || 0,
                    currentScore: bubbleData.currentScore || 0,
                    remainingTime: bubbleData.remainingTime || 0,
                    playerHP: bubbleData.playerHP || 0
                });
            }
            
            // プレイヤー行動パターンの記録
            this.recordPlayerInteractionPattern(bubbleData);
        }
    }
    
    /**
     * スコア獲得の追跡
     * @param {Object} scoreData - スコアデータ
     */
    trackScore(scoreData) {
        // 基本のAnalytics
        if (typeof this.trackEvent === 'function') {
            this.trackEvent('score_gained', {
                score_type: scoreData.type,
                amount: scoreData.amount,
                total_score: scoreData.totalScore
            });
        }
        
        // 拡張アナリティクス
        if (this.isGameAnalyticsEnabled) {
            // データ収集
            if (this.dataCollector) {
                this.dataCollector.collectScoreData(scoreData);
            }
            
            // ゲームバランス分析
            if (this.gameBalanceCollector) {
                this.gameBalanceCollector.collectScoreData({
                    type: scoreData.type,
                    amount: scoreData.amount,
                    multiplier: scoreData.multiplier || 1,
                    source: scoreData.source,
                    reactionTime: scoreData.reactionTime,
                    comboCount: scoreData.comboCount || 0,
                    timeInStage: scoreData.timeInStage || 0,
                    difficulty: scoreData.difficulty,
                    stageProgress: scoreData.stageProgress || 0,
                    totalScore: scoreData.totalScore,
                    playerSkillLevel: this.getPlayerSkillLevel()
                });
            }
        }
    }
    
    /**
     * アイテム使用の追跡
     * @param {Object} itemData - アイテムデータ
     */
    trackItemUsage(itemData) {
        // 基本のAnalytics
        if (typeof this.trackEvent === 'function') {
            this.trackEvent('item_used', {
                item_type: itemData.itemType,
                cost: itemData.cost,
                effectiveness: itemData.effectiveness
            });
        }
        
        // 拡張アナリティクス
        if (this.isGameAnalyticsEnabled) {
            // データ収集
            if (this.dataCollector) {
                this.dataCollector.collectItemUsageData(itemData);
            }
            
            // ゲームバランス分析
            if (this.gameBalanceCollector) {
                this.gameBalanceCollector.collectItemEffectData({
                    itemType: itemData.itemType,
                    action: itemData.action,
                    duration: itemData.duration,
                    cost: itemData.cost,
                    effectiveness: itemData.effectiveness,
                    activationTiming: itemData.activationTiming || 0,
                    stageProgress: itemData.stageProgress || 0,
                    playerSituation: itemData.playerSituation || 'normal',
                    scoreIncrease: itemData.scoreIncrease || 0,
                    survivalTime: itemData.survivalTime || 0,
                    bubblesPopped: itemData.bubblesPopped || 0,
                    stageCompleted: itemData.stageCompleted || false
                });
            }
        }
    }
    
    /**
     * ステージ完了の追跡
     * @param {Object} stageData - ステージデータ
     */
    trackStageCompletion(stageData) {
        // 基本のAnalytics
        if (typeof this.trackEvent === 'function') {
            this.trackEvent('stage_completed', {
                stage_id: stageData.stageId,
                completion_time: stageData.playTime,
                final_score: stageData.finalScore,
                accuracy: stageData.accuracy
            });
        }
        
        // 拡張アナリティクス
        if (this.isGameAnalyticsEnabled && this.gameBalanceCollector) {
            this.gameBalanceCollector.collectStageDifficultyData({
                stageId: stageData.stageId,
                difficulty: stageData.difficulty,
                playTime: stageData.playTime,
                completed: stageData.completed,
                finalScore: stageData.finalScore,
                totalSpawned: stageData.totalSpawned,
                popped: stageData.popped,
                missed: stageData.missed,
                expired: stageData.expired,
                accuracy: stageData.accuracy,
                averageReactionTime: stageData.averageReactionTime,
                maxCombo: stageData.maxCombo,
                itemsUsed: stageData.itemsUsed,
                exitReason: stageData.exitReason,
                timeRemaining: stageData.timeRemaining,
                hpRemaining: stageData.hpRemaining,
                progressPercent: stageData.progressPercent
            });
        }
    }
    
    /**
     * エラーの追跡（オーバーライド）
     * @param {Error} error - エラー
     * @param {Object} context - コンテキスト
     */
    trackError(error, context = {}) {
        // 基本のAnalytics
        super.trackError && super.trackError(error, context);
        
        // 拡張アナリティクス
        if (this.isGameAnalyticsEnabled && this.dataCollector) {
            this.dataCollector.collectPerformanceData({
                errors: [{
                    type: error.constructor.name,
                    message: error.message,
                    stack: error.stack,
                    context: context
                }]
            });
        }
        
        // パフォーマンス監視の更新
        this.performanceMonitor.errorCount++;
    }
    
    /**
     * パフォーマンス監視の開始
     */
    startPerformanceMonitoring() {
        // FPS監視
        this.startFPSMonitoring();
        
        // メモリ使用量監視
        this.startMemoryMonitoring();
        
        // 定期的なパフォーマンスデータ収集
        setInterval(() => {
            this.collectPerformanceMetrics();
        }, 30000); // 30秒間隔
    }
    
    /**
     * FPS監視の開始
     */
    startFPSMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                this.performanceMonitor.fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }
    
    /**
     * メモリ使用量監視の開始
     */
    startMemoryMonitoring() {
        if (performance.memory) {
            setInterval(() => {
                this.performanceMonitor.memoryUsage = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                };
            }, 10000); // 10秒間隔
        }
    }
    
    /**
     * パフォーマンス指標の収集
     */
    collectPerformanceMetrics() {
        if (!this.isGameAnalyticsEnabled || !this.dataCollector) return;
        
        const metrics = {
            fps: this.performanceMonitor.fps,
            memoryUsage: this.performanceMonitor.memoryUsage,
            errorCount: this.performanceMonitor.errorCount,
            timestamp: Date.now()
        };
        
        this.dataCollector.collectPerformanceData(metrics);
        
        // パフォーマンス警告の生成
        this.checkPerformanceWarnings(metrics);
    }
    
    /**
     * パフォーマンス警告のチェック
     * @param {Object} metrics - パフォーマンス指標
     */
    checkPerformanceWarnings(metrics) {
        const warnings = [];
        
        // FPS警告
        if (metrics.fps < 30) {
            warnings.push({
                type: 'low_fps',
                severity: 'high',
                message: `Low FPS detected: ${metrics.fps}`,
                value: metrics.fps
            });
        }
        
        // メモリ使用量警告
        if (metrics.memoryUsage && metrics.memoryUsage.used > metrics.memoryUsage.limit * 0.8) {
            warnings.push({
                type: 'high_memory_usage',
                severity: 'medium',
                message: `High memory usage: ${(metrics.memoryUsage.used / metrics.memoryUsage.limit * 100).toFixed(1)}%`,
                value: metrics.memoryUsage.used / metrics.memoryUsage.limit
            });
        }
        
        // 警告の報告
        warnings.forEach(warning => {
            console.warn(`[Performance Warning] ${warning.severity.toUpperCase()}: ${warning.message}`);
            
            if (typeof this.trackEvent === 'function') {
                this.trackEvent('performance_warning', {
                    warning_type: warning.type,
                    severity: warning.severity,
                    value: warning.value
                });
            }
        });
    }
    
    /**
     * プレイヤー行動追跡の初期化
     * @param {Object} sessionInfo - セッション情報
     */
    initializePlayerBehaviorTracking(sessionInfo) {
        this.playerBehavior.sessionData = {
            startTime: Date.now(),
            stageId: sessionInfo.stageId,
            difficulty: sessionInfo.difficulty,
            initialSkillLevel: this.getPlayerSkillLevel()
        };
        
        this.playerBehavior.interactionPatterns = [];
    }
    
    /**
     * プレイヤーインタラクションパターンの記録
     * @param {Object} bubbleData - バブルデータ
     */
    recordPlayerInteractionPattern(bubbleData) {
        const pattern = {
            timestamp: Date.now(),
            bubbleType: bubbleData.bubbleType,
            action: bubbleData.action,
            reactionTime: bubbleData.reactionTime || null,
            accuracy: bubbleData.action === 'popped' ? 1 : 0,
            position: bubbleData.position || null
        };
        
        this.playerBehavior.interactionPatterns.push(pattern);
        
        // プレイスタイルの分析
        this.analyzePlayStyle(pattern);
        
        // スキル進行の記録
        if (pattern.reactionTime) {
            this.playerBehavior.skillProgression.reactionTimeHistory.push(pattern.reactionTime);
            this.playerBehavior.skillProgression.accuracyHistory.push(pattern.accuracy);
        }
    }
    
    /**
     * プレイスタイルの分析
     * @param {Object} pattern - インタラクションパターン
     */
    analyzePlayStyle(pattern) {
        // 攻撃的プレイスタイル：素早い反応時間
        if (pattern.reactionTime && pattern.reactionTime < 300) {
            this.playerBehavior.playStyle.aggressive += 1;
        }
        
        // 守備的プレイスタイル：慎重な操作
        if (pattern.reactionTime && pattern.reactionTime > 800) {
            this.playerBehavior.playStyle.defensive += 1;
        }
        
        // 戦略的プレイスタイル：特殊バブルを優先
        if (['rainbow', 'clock', 'electric'].includes(pattern.bubbleType)) {
            this.playerBehavior.playStyle.strategic += 1;
        }
    }
    
    /**
     * プレイヤー行動分析の更新
     * @param {Object} endInfo - 終了情報
     */
    updatePlayerBehaviorAnalysis(endInfo) {
        if (!this.playerBehavior.sessionData) return;
        
        const sessionDuration = Date.now() - this.playerBehavior.sessionData.startTime;
        const totalInteractions = this.playerBehavior.interactionPatterns.length;
        
        if (totalInteractions > 0) {
            // 正確性の計算
            const accuracy = this.playerBehavior.interactionPatterns
                .reduce((sum, p) => sum + p.accuracy, 0) / totalInteractions;
            
            // 平均反応時間の計算
            const reactionTimes = this.playerBehavior.interactionPatterns
                .filter(p => p.reactionTime)
                .map(p => p.reactionTime);
            const avgReactionTime = reactionTimes.length > 0 ?
                reactionTimes.reduce((sum, rt) => sum + rt, 0) / reactionTimes.length : 0;
            
            // スキル進行データの更新
            this.playerBehavior.skillProgression.accuracyHistory.push(accuracy);
            this.playerBehavior.skillProgression.reactionTimeHistory.push(avgReactionTime);
            
            // 行動分析データの収集
            if (this.dataCollector) {
                this.dataCollector.collectGameBalanceData({
                    type: 'playerBehaviorAnalysis',
                    sessionDuration: sessionDuration,
                    totalInteractions: totalInteractions,
                    accuracy: accuracy,
                    averageReactionTime: avgReactionTime,
                    playStyle: this.getPlayStyleDistribution(),
                    skillProgression: this.getSkillProgression(),
                    performanceImprovement: this.calculatePerformanceImprovement()
                });
            }
        }
        
        // セッションデータのリセット
        this.playerBehavior.sessionData = null;
        this.playerBehavior.interactionPatterns = [];
    }
    
    /**
     * プレイスタイル分布の取得
     * @returns {Object}
     */
    getPlayStyleDistribution() {
        const total = Object.values(this.playerBehavior.playStyle)
            .reduce((sum, count) => sum + count, 0);
        
        if (total === 0) return { aggressive: 0, defensive: 0, strategic: 0 };
        
        return {
            aggressive: this.playerBehavior.playStyle.aggressive / total,
            defensive: this.playerBehavior.playStyle.defensive / total,
            strategic: this.playerBehavior.playStyle.strategic / total
        };
    }
    
    /**
     * スキル進行の取得
     * @returns {Object}
     */
    getSkillProgression() {
        const recentAccuracy = this.playerBehavior.skillProgression.accuracyHistory.slice(-10);
        const recentReactionTime = this.playerBehavior.skillProgression.reactionTimeHistory.slice(-10);
        
        return {
            currentAccuracy: recentAccuracy.length > 0 ?
                recentAccuracy.reduce((sum, acc) => sum + acc, 0) / recentAccuracy.length : 0,
            currentReactionTime: recentReactionTime.length > 0 ?
                recentReactionTime.reduce((sum, rt) => sum + rt, 0) / recentReactionTime.length : 0,
            improvementTrend: this.calculateImprovementTrend()
        };
    }
    
    /**
     * 改善トレンドの計算
     * @returns {Object}
     */
    calculateImprovementTrend() {
        const accuracyHistory = this.playerBehavior.skillProgression.accuracyHistory;
        const reactionTimeHistory = this.playerBehavior.skillProgression.reactionTimeHistory;
        
        const trend = {
            accuracy: 'stable',
            reactionTime: 'stable'
        };
        
        if (accuracyHistory.length >= 5) {
            const recent = accuracyHistory.slice(-3);
            const earlier = accuracyHistory.slice(-6, -3);
            
            if (recent.length === 3 && earlier.length === 3) {
                const recentAvg = recent.reduce((sum, acc) => sum + acc, 0) / 3;
                const earlierAvg = earlier.reduce((sum, acc) => sum + acc, 0) / 3;
                
                if (recentAvg > earlierAvg + 0.05) trend.accuracy = 'improving';
                else if (recentAvg < earlierAvg - 0.05) trend.accuracy = 'declining';
            }
        }
        
        if (reactionTimeHistory.length >= 5) {
            const recent = reactionTimeHistory.slice(-3);
            const earlier = reactionTimeHistory.slice(-6, -3);
            
            if (recent.length === 3 && earlier.length === 3) {
                const recentAvg = recent.reduce((sum, rt) => sum + rt, 0) / 3;
                const earlierAvg = earlier.reduce((sum, rt) => sum + rt, 0) / 3;
                
                if (recentAvg < earlierAvg - 50) trend.reactionTime = 'improving';
                else if (recentAvg > earlierAvg + 50) trend.reactionTime = 'declining';
            }
        }
        
        return trend;
    }
    
    /**
     * パフォーマンス改善の計算
     * @returns {Object}
     */
    calculatePerformanceImprovement() {
        // 簡易実装：実際にはより複雑な分析が必要
        const trend = this.calculateImprovementTrend();
        
        return {
            accuracyImprovement: trend.accuracy === 'improving',
            speedImprovement: trend.reactionTime === 'improving',
            overallImprovement: trend.accuracy === 'improving' && trend.reactionTime === 'improving'
        };
    }
    
    /**
     * プレイヤースキルレベルの取得
     * @returns {string}
     */
    getPlayerSkillLevel() {
        const accuracy = this.getAverageAccuracy();
        const reactionTime = this.getAverageReactionTime();
        
        if (accuracy > 0.9 && reactionTime < 400) return 'expert';
        if (accuracy > 0.8 && reactionTime < 500) return 'advanced';
        if (accuracy > 0.7 && reactionTime < 600) return 'intermediate';
        if (accuracy > 0.5 && reactionTime < 800) return 'beginner';
        
        return 'novice';
    }
    
    /**
     * 平均正確性の取得
     * @returns {number}
     */
    getAverageAccuracy() {
        const recent = this.playerBehavior.skillProgression.accuracyHistory.slice(-10);
        return recent.length > 0 ?
            recent.reduce((sum, acc) => sum + acc, 0) / recent.length : 0.5;
    }
    
    /**
     * 平均反応時間の取得
     * @returns {number}
     */
    getAverageReactionTime() {
        const recent = this.playerBehavior.skillProgression.reactionTimeHistory.slice(-10);
        return recent.length > 0 ?
            recent.reduce((sum, rt) => sum + rt, 0) / recent.length : 600;
    }
    
    /**
     * アナリティクスの設定変更
     * @param {Object} settings - 設定
     */
    updateSettings(settings) {
        if (settings.enableGameAnalytics !== undefined) {
            this.options.enableGameAnalytics = settings.enableGameAnalytics;
            this.isGameAnalyticsEnabled = settings.enableGameAnalytics && this.isInitialized;
        }
        
        if (settings.enablePerformanceTracking !== undefined) {
            this.options.enablePerformanceTracking = settings.enablePerformanceTracking;
        }
        
        if (settings.enableBehaviorAnalysis !== undefined) {
            this.options.enableBehaviorAnalysis = settings.enableBehaviorAnalysis;
        }
        
        // プライバシー設定の更新
        if (this.privacyManager && settings.privacySettings) {
            Object.entries(settings.privacySettings).forEach(([feature, optOut]) => {
                this.privacyManager.setOptOut(feature, optOut);
            });
        }
    }
    
    /**
     * 統計の取得
     * @returns {Object}
     */
    getAnalyticsStats() {
        const stats = {
            isInitialized: this.isInitialized,
            isGameAnalyticsEnabled: this.isGameAnalyticsEnabled,
            performanceMonitor: { ...this.performanceMonitor },
            playerSkillLevel: this.getPlayerSkillLevel(),
            playStyleDistribution: this.getPlayStyleDistribution()
        };
        
        if (this.dataCollector) {
            stats.dataCollector = this.dataCollector.getEventStats();
        }
        
        if (this.storageManager) {
            stats.storageInfo = {
                // ストレージ情報は非同期で取得する必要があるため、別途メソッドを提供
                available: true
            };
        }
        
        return stats;
    }
    
    /**
     * データのエクスポート
     * @returns {Promise<Object>}
     */
    async exportData() {
        if (!this.privacyManager) {
            throw new Error('Privacy manager not initialized');
        }
        
        return await this.privacyManager.exportUserData(async () => {
            const data = {};
            
            if (this.storageManager) {
                data.sessions = await this.storageManager.getData('sessions');
                data.bubbleInteractions = await this.storageManager.getData('bubbleInteractions');
                data.performance = await this.storageManager.getData('performance');
            }
            
            return data;
        });
    }
    
    /**
     * データの削除
     * @returns {Promise<void>}
     */
    async deleteData() {
        if (!this.privacyManager) {
            throw new Error('Privacy manager not initialized');
        }
        
        await this.privacyManager.deleteUserData(async () => {
            if (this.storageManager) {
                // データベースを完全にクリア
                await this.storageManager.deleteData('sessions', {});
                await this.storageManager.deleteData('bubbleInteractions', {});
                await this.storageManager.deleteData('performance', {});
                await this.storageManager.deleteData('aggregatedData', {});
            }
        });
    }
    
    /**
     * Enhanced Analytics Managerの破棄
     */
    destroy() {
        if (this.dataCollector) {
            this.dataCollector.destroy();
        }
        
        if (this.storageManager) {
            this.storageManager.close();
        }
        
        // パフォーマンス監視の停止
        // （setIntervalのIDを保存していない簡易実装のため、自動的にGCされる）
        
        this.isInitialized = false;
        this.isGameAnalyticsEnabled = false;
    }
}