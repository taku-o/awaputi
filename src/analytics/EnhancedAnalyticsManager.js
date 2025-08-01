/**
 * Enhanced Analytics Manager
 * 既存のAnalyticsクラスを拡張し、ゲーム分析機能を統合
 */

import analytics from '../utils/Analytics.js';
import { PrivacyManager } from './PrivacyManager.js';
import { IndexedDBStorageManager } from './IndexedDBStorageManager.js';
import { DataCollector } from './DataCollector.js';
import { GameBalanceCollector } from './GameBalanceCollector.js';
import { AnalyticsPerformanceOptimizer } from './AnalyticsPerformanceOptimizer.js';

export class EnhancedAnalyticsManager {
    constructor(options = {}) {
        // 基本のAnalyticsインスタンスを保持
        this.analytics = analytics;
        
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
        this.performanceOptimizer = null;
        
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
            
            // パフォーマンス最適化の初期化
            this.performanceOptimizer = new AnalyticsPerformanceOptimizer(this, this.options.performanceOptimization);
            
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
        if (this.analytics && typeof this.analytics.trackError === 'function') {
            this.analytics.trackError(error, {
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
        if (this.analytics && typeof this.analytics.trackEvent === 'function') {
            this.analytics.trackEvent('game_session_start', {
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
        if (this.analytics && typeof this.analytics.trackEvent === 'function') {
            this.analytics.trackEvent('game_session_end', {
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
        if (this.analytics && typeof this.analytics.trackEvent === 'function') {
            this.analytics.trackEvent('bubble_interaction', {
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
        if (this.analytics && typeof this.analytics.trackEvent === 'function') {
            this.analytics.trackEvent('score_gained', {
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
     * ゲームバランス分析の追跡
     * @param {Object} balanceData - ゲームバランスデータ
     */
    trackGameBalance(balanceData) {
        // 基本のAnalytics
        if (this.analytics && typeof this.analytics.trackEvent === 'function') {
            this.analytics.trackEvent('game_balance', {
                balance_type: balanceData.type,
                stage_id: balanceData.stageId,
                difficulty: balanceData.difficulty
            });
        }
        
        // 拡張アナリティクス
        if (this.isGameAnalyticsEnabled && this.gameBalanceCollector) {
            // バブル出現頻度とスコア分布の分析
            this.gameBalanceCollector.collectGameBalanceData({
                type: balanceData.type,
                stageId: balanceData.stageId,
                difficulty: balanceData.difficulty,
                bubbleFrequency: balanceData.bubbleFrequency || {},
                scoreDistribution: balanceData.scoreDistribution || {},
                averagePlayTime: balanceData.averagePlayTime || 0,
                completionRate: balanceData.completionRate || 0,
                playerPerformance: balanceData.playerPerformance || {},
                difficultyMetrics: balanceData.difficultyMetrics || {},
                balanceWarnings: this.checkGameBalanceWarnings(balanceData)
            });
        }
    }
    
    /**
     * ゲームバランス警告のチェック
     * @param {Object} balanceData - バランスデータ
     * @returns {Array} 警告リスト
     */
    checkGameBalanceWarnings(balanceData) {
        const warnings = [];
        
        // スコア分布の異常チェック
        if (balanceData.scoreDistribution) {
            const scores = Object.values(balanceData.scoreDistribution);
            if (scores.length > 0) {
                const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
                const maxScore = Math.max(...scores);
                const minScore = Math.min(...scores);
                
                // スコア分布の偏りチェック
                if (maxScore > avgScore * 5) {
                    warnings.push({
                        type: 'score_distribution_anomaly',
                        severity: 'high',
                        message: 'Extreme score outliers detected',
                        data: { avgScore, maxScore, ratio: maxScore / avgScore }
                    });
                }
                
                // スコア範囲の異常チェック
                if (maxScore - minScore > avgScore * 10) {
                    warnings.push({
                        type: 'score_range_anomaly',
                        severity: 'medium',
                        message: 'Unusually wide score range detected',
                        data: { range: maxScore - minScore, avgScore }
                    });
                }
            }
        }
        
        // バブル出現頻度の異常チェック
        if (balanceData.bubbleFrequency) {
            const frequencies = Object.values(balanceData.bubbleFrequency);
            if (frequencies.length > 0) {
                const totalFreq = frequencies.reduce((sum, freq) => sum + freq, 0);
                const avgFreq = totalFreq / frequencies.length;
                
                Object.entries(balanceData.bubbleFrequency).forEach(([bubbleType, frequency]) => {
                    // 特定バブルタイプの出現頻度異常
                    if (frequency > avgFreq * 3) {
                        warnings.push({
                            type: 'bubble_frequency_anomaly',
                            severity: 'medium',
                            message: `High frequency detected for ${bubbleType}`,
                            data: { bubbleType, frequency, avgFreq, ratio: frequency / avgFreq }
                        });
                    }
                });
            }
        }
        
        // 完了率の異常チェック
        if (balanceData.completionRate !== undefined) {
            if (balanceData.completionRate < 0.1) {
                warnings.push({
                    type: 'low_completion_rate',
                    severity: 'high',
                    message: 'Very low stage completion rate',
                    data: { completionRate: balanceData.completionRate }
                });
            } else if (balanceData.completionRate > 0.95) {
                warnings.push({
                    type: 'high_completion_rate',
                    severity: 'medium',
                    message: 'Stage may be too easy',
                    data: { completionRate: balanceData.completionRate }
                });
            }
        }
        
        // プレイ時間の異常チェック
        if (balanceData.averagePlayTime) {
            const expectedPlayTime = 5 * 60 * 1000; // 5分想定
            const playTimeRatio = balanceData.averagePlayTime / expectedPlayTime;
            
            if (playTimeRatio < 0.2) {
                warnings.push({
                    type: 'short_play_time',
                    severity: 'medium',
                    message: 'Players finishing stages very quickly',
                    data: { averagePlayTime: balanceData.averagePlayTime, ratio: playTimeRatio }
                });
            } else if (playTimeRatio > 2.0) {
                warnings.push({
                    type: 'long_play_time',
                    severity: 'medium',
                    message: 'Players taking unusually long to complete stages',
                    data: { averagePlayTime: balanceData.averagePlayTime, ratio: playTimeRatio }
                });
            }
        }
        
        // 警告をログに出力
        warnings.forEach(warning => {
            console.warn(`[Game Balance Warning] ${warning.severity.toUpperCase()}: ${warning.message}`, warning.data);
            
            if (this.analytics && typeof this.analytics.trackEvent === 'function') {
                this.analytics.trackEvent('game_balance_warning', {
                    warning_type: warning.type,
                    severity: warning.severity,
                    stage_id: balanceData.stageId,
                    difficulty: balanceData.difficulty
                });
            }
        });
        
        return warnings;
    }

    /**
     * アイテム使用の追跡
     * @param {Object} itemData - アイテムデータ
     */
    trackItemUsage(itemData) {
        // 基本のAnalytics
        if (this.analytics && typeof this.analytics.trackEvent === 'function') {
            this.analytics.trackEvent('item_used', {
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
        if (this.analytics && typeof this.analytics.trackEvent === 'function') {
            this.analytics.trackEvent('stage_completed', {
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
        // 基本のAnalyticsのエラー追跡
        
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
            
            if (this.analytics && typeof this.analytics.trackEvent === 'function') {
                this.analytics.trackEvent('performance_warning', {
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
            initialSkillLevel: this.getPlayerSkillLevel(),
            previousBestScore: sessionInfo.previousBestScore || 0,
            sessionId: this.dataCollector.currentSessionId,
            playerSettings: {
                soundEnabled: sessionInfo.soundEnabled,
                effectsEnabled: sessionInfo.effectsEnabled
            }
        };
        
        this.playerBehavior.interactionPatterns = [];
        this.playerBehavior.sessionStats = {
            clickCount: 0,
            successfulClicks: 0,
            missedClicks: 0,
            averageReactionTime: 0,
            totalReactionTime: 0,
            validReactionTimes: 0,
            maxCombo: 0,
            currentCombo: 0,
            itemsUsed: 0,
            bubblesPopped: 0,
            bubblesMissed: 0,
            scoreProgression: [],
            exitEvents: []
        };
    }
    
    /**
     * プレイヤー行動分析の追跡
     * @param {Object} behaviorData - 行動データ
     */
    trackPlayerBehavior(behaviorData) {
        if (!this.isGameAnalyticsEnabled || !this.dataCollector) return;
        
        const timestamp = Date.now();
        const sessionDuration = this.playerBehavior.sessionData ? 
            timestamp - this.playerBehavior.sessionData.startTime : 0;
        
        // 長時間プレイの特別マーキング
        const isLongSession = sessionDuration > 30 * 60 * 1000; // 30分
        
        // 行動データの収集
        const trackingData = {
            type: 'playerBehavior',
            timestamp: timestamp,
            sessionId: this.playerBehavior.sessionData?.sessionId || 'unknown',
            sessionDuration: sessionDuration,
            isLongSession: isLongSession,
            behaviorType: behaviorData.type, // 'interaction', 'navigation', 'exit', 'achievement'
            data: behaviorData,
            sessionContext: {
                stageId: this.playerBehavior.sessionData?.stageId,
                difficulty: this.playerBehavior.sessionData?.difficulty,
                currentScore: behaviorData.currentScore || 0,
                stageProgress: behaviorData.stageProgress || 0,
                playerHP: behaviorData.playerHP || 0,
                timeRemaining: behaviorData.timeRemaining || 0
            },
            playerState: {
                skillLevel: this.getPlayerSkillLevel(),
                playStyle: this.getPlayStyleDistribution(),
                recentPerformance: this.getRecentPerformanceMetrics()
            }
        };
        
        // 離脱分析のための追跡
        if (behaviorData.type === 'exit' || behaviorData.type === 'pause') {
            this.trackExitBehavior(behaviorData, sessionDuration);
        }
        
        // セッション統計の更新
        this.updateSessionStats(behaviorData);
        
        // データコレクターに送信
        this.dataCollector.collectGameBalanceData(trackingData);
        
        // 長時間プレイの場合は特別ログ
        if (isLongSession && !this.playerBehavior.longSessionMarked) {
            this.playerBehavior.longSessionMarked = true;
            console.info(`[Analytics] Long session detected: ${Math.round(sessionDuration / 60000)} minutes`);
            
            this.dataCollector.collectGameBalanceData({
                type: 'longSessionMarker',
                timestamp: timestamp,
                sessionId: this.playerBehavior.sessionData?.sessionId,
                sessionDuration: sessionDuration,
                stageId: this.playerBehavior.sessionData?.stageId,
                playerPerformance: this.getSessionPerformanceSummary()
            });
        }
    }
    
    /**
     * 離脱行動の追跡
     * @param {Object} exitData - 離脱データ
     * @param {number} sessionDuration - セッション継続時間
     */
    trackExitBehavior(exitData, sessionDuration) {
        const exitInfo = {
            timestamp: Date.now(),
            sessionDuration: sessionDuration,
            exitReason: exitData.reason || 'unknown', // 'pause', 'quit', 'game_over', 'completed'
            exitPoint: {
                stageProgress: exitData.stageProgress || 0,
                timeRemaining: exitData.timeRemaining || 0,
                playerHP: exitData.playerHP || 0,
                currentScore: exitData.currentScore || 0
            },
            playerSituation: {
                isInCombat: exitData.isInCombat || false,
                recentFailures: exitData.recentFailures || 0,
                comboBroken: exitData.comboBroken || false,
                lowHP: (exitData.playerHP || 100) < 30
            },
            gameState: {
                activeBubbles: exitData.activeBubbles || 0,
                nextBubbleTypes: exitData.nextBubbleTypes || [],
                activeItems: exitData.activeItems || []
            }
        };
        
        // セッション統計に追加
        if (this.playerBehavior.sessionStats) {
            this.playerBehavior.sessionStats.exitEvents.push(exitInfo);
        }
        
        // 離脱パターン分析
        this.analyzeExitPattern(exitInfo);
    }
    
    /**
     * セッション統計の更新
     * @param {Object} behaviorData - 行動データ
     */
    updateSessionStats(behaviorData) {
        if (!this.playerBehavior.sessionStats) return;
        
        const stats = this.playerBehavior.sessionStats;
        
        switch (behaviorData.type) {
            case 'interaction':
                stats.clickCount++;
                if (behaviorData.action === 'popped') {
                    stats.successfulClicks++;
                    stats.bubblesPopped++;
                    
                    // コンボ追跡
                    stats.currentCombo = (behaviorData.comboCount || 0);
                    if (stats.currentCombo > stats.maxCombo) {
                        stats.maxCombo = stats.currentCombo;
                    }
                } else if (behaviorData.action === 'missed') {
                    stats.missedClicks++;
                    stats.bubblesMissed++;
                    stats.currentCombo = 0;
                }
                
                // 反応時間の追跡
                if (behaviorData.reactionTime && behaviorData.reactionTime > 0) {
                    stats.totalReactionTime += behaviorData.reactionTime;
                    stats.validReactionTimes++;
                    stats.averageReactionTime = stats.totalReactionTime / stats.validReactionTimes;
                }
                break;
                
            case 'item_usage':
                stats.itemsUsed++;
                break;
                
            case 'score_update':
                stats.scoreProgression.push({
                    timestamp: Date.now(),
                    score: behaviorData.currentScore || 0,
                    scoreGain: behaviorData.scoreGain || 0,
                    source: behaviorData.source || 'unknown'
                });
                break;
        }
    }
    
    /**
     * 離脱パターンの分析
     * @param {Object} exitInfo - 離脱情報
     */
    analyzeExitPattern(exitInfo) {
        // 離脱ポイント分析
        const exitPatterns = {
            earlyExit: exitInfo.sessionDuration < 60000, // 1分以内
            midGameExit: exitInfo.exitPoint.stageProgress > 0.3 && exitInfo.exitPoint.stageProgress < 0.7,
            lateGameExit: exitInfo.exitPoint.stageProgress > 0.7,
            lowHPExit: exitInfo.playerSituation.lowHP,
            comboBrokenExit: exitInfo.playerSituation.comboBroken,
            difficultySpike: exitInfo.playerSituation.recentFailures > 3
        };
        
        // パターンの分類
        const dominantPattern = Object.entries(exitPatterns)
            .filter(([_, value]) => value)
            .map(([key, _]) => key);
        
        if (dominantPattern.length > 0) {
            console.info(`[Player Behavior] Exit pattern detected: ${dominantPattern.join(', ')}`);
            
            // パターンデータの収集
            this.dataCollector.collectGameBalanceData({
                type: 'exitPattern',
                timestamp: Date.now(),
                patterns: dominantPattern,
                exitInfo: exitInfo,
                sessionId: this.playerBehavior.sessionData?.sessionId
            });
        }
    }
    
    /**
     * 最近のパフォーマンス指標取得
     * @returns {Object}
     */
    getRecentPerformanceMetrics() {
        const stats = this.playerBehavior.sessionStats;
        if (!stats) return {};
        
        return {
            accuracy: stats.clickCount > 0 ? stats.successfulClicks / stats.clickCount : 0,
            averageReactionTime: stats.averageReactionTime,
            maxCombo: stats.maxCombo,
            bubblesPopped: stats.bubblesPopped,
            itemsUsed: stats.itemsUsed
        };
    }
    
    /**
     * セッションパフォーマンス要約取得
     * @returns {Object}
     */
    getSessionPerformanceSummary() {
        const stats = this.playerBehavior.sessionStats;
        const sessionData = this.playerBehavior.sessionData;
        
        if (!stats || !sessionData) return {};
        
        const sessionDuration = Date.now() - sessionData.startTime;
        
        return {
            duration: sessionDuration,
            totalInteractions: stats.clickCount,
            accuracy: stats.clickCount > 0 ? stats.successfulClicks / stats.clickCount : 0,
            averageReactionTime: stats.averageReactionTime,
            maxCombo: stats.maxCombo,
            bubblesPopped: stats.bubblesPopped,
            itemsUsed: stats.itemsUsed,
            exitEvents: stats.exitEvents.length,
            skillImprovement: this.calculateSkillImprovement(),
            playStyle: this.getPlayStyleDistribution()
        };
    }
    
    /**
     * スキル向上の計算
     * @returns {Object}
     */
    calculateSkillImprovement() {
        const sessionStats = this.playerBehavior.sessionStats;
        const sessionData = this.playerBehavior.sessionData;
        
        if (!sessionStats || !sessionData) return { improved: false };
        
        const currentAccuracy = sessionStats.clickCount > 0 ? 
            sessionStats.successfulClicks / sessionStats.clickCount : 0;
        const currentReactionTime = sessionStats.averageReactionTime;
        
        // 過去の平均との比較
        const historicalAccuracy = this.getAverageAccuracy();
        const historicalReactionTime = this.getAverageReactionTime();
        
        const accuracyImprovement = currentAccuracy > historicalAccuracy + 0.05;
        const reactionTimeImprovement = currentReactionTime < historicalReactionTime - 50;
        
        return {
            improved: accuracyImprovement || reactionTimeImprovement,
            accuracyDelta: currentAccuracy - historicalAccuracy,
            reactionTimeDelta: historicalReactionTime - currentReactionTime,
            areas: {
                accuracy: accuracyImprovement ? 'improved' : (currentAccuracy < historicalAccuracy - 0.05 ? 'declined' : 'stable'),
                speed: reactionTimeImprovement ? 'improved' : (currentReactionTime > historicalReactionTime + 50 ? 'declined' : 'stable')
            }
        };
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
        
        // プレイヤー行動追跡にデータを送信
        this.trackPlayerBehavior({
            type: 'interaction',
            action: bubbleData.action,
            bubbleType: bubbleData.bubbleType,
            reactionTime: bubbleData.reactionTime,
            comboCount: bubbleData.comboCount,
            currentScore: bubbleData.currentScore,
            stageProgress: bubbleData.stageProgress,
            playerHP: bubbleData.playerHP,
            timeRemaining: bubbleData.timeRemaining
        });
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
        const sessionStats = this.playerBehavior.sessionStats;
        
        // 最終的な離脱行動の記録
        this.trackPlayerBehavior({
            type: 'exit',
            reason: endInfo.exitReason,
            stageProgress: this.calculateStageProgress(endInfo),
            timeRemaining: endInfo.timeRemaining || 0,
            playerHP: endInfo.hpRemaining || 0,
            currentScore: endInfo.finalScore || 0,
            completed: endInfo.completed,
            isInCombat: endInfo.bubblesRemaining > 0,
            recentFailures: endInfo.bubblesMissed || 0,
            comboBroken: endInfo.maxCombo < (sessionStats?.maxCombo || 0),
            activeBubbles: endInfo.bubblesRemaining || 0,
            activeItems: endInfo.activeItems || []
        });
        
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
            
            // 包括的セッション分析データの収集
            if (this.dataCollector) {
                const comprehensiveAnalysis = {
                    type: 'playerBehaviorAnalysis',
                    sessionId: this.playerBehavior.sessionData.sessionId,
                    sessionInfo: {
                        duration: sessionDuration,
                        stageId: this.playerBehavior.sessionData.stageId,
                        difficulty: this.playerBehavior.sessionData.difficulty,
                        completed: endInfo.completed,
                        exitReason: endInfo.exitReason
                    },
                    interactionStats: {
                        totalInteractions: totalInteractions,
                        accuracy: accuracy,
                        averageReactionTime: avgReactionTime,
                        clicksPerMinute: sessionDuration > 0 ? (totalInteractions / (sessionDuration / 60000)) : 0
                    },
                    performanceMetrics: {
                        finalScore: endInfo.finalScore || 0,
                        previousBestScore: this.playerBehavior.sessionData.previousBestScore,
                        scoreImprovement: (endInfo.finalScore || 0) - this.playerBehavior.sessionData.previousBestScore,
                        maxCombo: sessionStats?.maxCombo || 0,
                        bubblesPopped: sessionStats?.bubblesPopped || 0,
                        itemsUsed: sessionStats?.itemsUsed || 0,
                        exitEvents: sessionStats?.exitEvents?.length || 0
                    },
                    behaviorPatterns: {
                        playStyle: this.getPlayStyleDistribution(),
                        skillProgression: this.getSkillProgression(),
                        performanceImprovement: this.calculatePerformanceImprovement(),
                        learningCurve: this.analyzeLearningCurve(),
                        consistencyScore: this.calculateConsistencyScore(),
                        engagementLevel: this.calculateEngagementLevel(sessionDuration, totalInteractions)
                    },
                    sessionCharacteristics: {
                        isLongSession: sessionDuration > 30 * 60 * 1000,
                        sessionIntensity: this.calculateSessionIntensity(),
                        frustrationIndicators: this.detectFrustrationIndicators(),
                        flowStateIndicators: this.detectFlowStateIndicators()
                    }
                };
                
                this.dataCollector.collectGameBalanceData(comprehensiveAnalysis);
            }
        }
        
        // セッションデータのリセット
        this.playerBehavior.sessionData = null;
        this.playerBehavior.interactionPatterns = [];
        this.playerBehavior.sessionStats = null;
        this.playerBehavior.longSessionMarked = false;
    }
    
    /**
     * ステージ進行度の計算
     * @param {Object} endInfo - 終了情報
     * @returns {number}
     */
    calculateStageProgress(endInfo) {
        if (endInfo.completed) return 1.0;
        
        // 時間ベースの進行度計算
        const timeProgress = endInfo.timeRemaining ? 
            1 - (endInfo.timeRemaining / (5 * 60 * 1000)) : 0; // 5分ステージ想定
        
        // スコアベースの進行度計算（おおよその推定）
        const scoreProgress = (endInfo.finalScore || 0) / Math.max(this.playerBehavior.sessionData?.previousBestScore || 1000, 1000);
        
        // 組み合わせた進行度
        return Math.min(Math.max(timeProgress, scoreProgress * 0.8), 1.0);
    }
    
    /**
     * 学習曲線の分析
     * @returns {Object}
     */
    analyzeLearningCurve() {
        const patterns = this.playerBehavior.interactionPatterns;
        if (patterns.length < 10) return { trend: 'insufficient_data' };
        
        // セッション内でのパフォーマンス推移を分析
        const segmentSize = Math.max(Math.floor(patterns.length / 4), 5);
        const segments = [];
        
        for (let i = 0; i < patterns.length; i += segmentSize) {
            const segment = patterns.slice(i, i + segmentSize);
            const accuracy = segment.reduce((sum, p) => sum + p.accuracy, 0) / segment.length;
            const avgReactionTime = segment
                .filter(p => p.reactionTime)
                .reduce((sum, p, _, arr) => sum + p.reactionTime / arr.length, 0);
            
            segments.push({ accuracy, avgReactionTime });
        }
        
        // トレンドの計算
        const accuracyTrend = this.calculateTrend(segments.map(s => s.accuracy));
        const speedTrend = this.calculateTrend(segments.map(s => s.avgReactionTime), true); // 反転（速いほど良い）
        
        return {
            trend: accuracyTrend > 0.05 || speedTrend > 0.05 ? 'improving' : 
                   (accuracyTrend < -0.05 || speedTrend < -0.05 ? 'declining' : 'stable'),
            accuracyTrend: accuracyTrend,
            speedTrend: speedTrend,
            segments: segments.length
        };
    }
    
    /**
     * 一貫性スコアの計算
     * @returns {number}
     */
    calculateConsistencyScore() {
        const patterns = this.playerBehavior.interactionPatterns;
        if (patterns.length < 5) return 0.5;
        
        const reactionTimes = patterns
            .filter(p => p.reactionTime)
            .map(p => p.reactionTime);
        
        if (reactionTimes.length < 3) return 0.5;
        
        const mean = reactionTimes.reduce((sum, rt) => sum + rt, 0) / reactionTimes.length;
        const variance = reactionTimes.reduce((sum, rt) => sum + Math.pow(rt - mean, 2), 0) / reactionTimes.length;
        const coefficient = Math.sqrt(variance) / mean;
        
        // 変動係数が低いほど一貫性が高い（0-1スケール）
        return Math.max(0, 1 - coefficient);
    }
    
    /**
     * エンゲージメントレベルの計算
     * @param {number} sessionDuration - セッション継続時間
     * @param {number} totalInteractions - 総インタラクション数
     * @returns {string}
     */
    calculateEngagementLevel(sessionDuration, totalInteractions) {
        const interactionsPerMinute = sessionDuration > 0 ? 
            (totalInteractions / (sessionDuration / 60000)) : 0;
        
        // セッション長とインタラクション密度から判定
        if (sessionDuration > 15 * 60 * 1000 && interactionsPerMinute > 20) {
            return 'high';
        } else if (sessionDuration > 5 * 60 * 1000 && interactionsPerMinute > 10) {
            return 'medium';
        } else if (sessionDuration < 2 * 60 * 1000 || interactionsPerMinute < 5) {
            return 'low';
        }
        
        return 'medium';
    }
    
    /**
     * セッション強度の計算
     * @returns {number}
     */
    calculateSessionIntensity() {
        const stats = this.playerBehavior.sessionStats;
        const sessionData = this.playerBehavior.sessionData;
        if (!stats || !sessionData) return 0;
        
        const sessionDuration = Date.now() - sessionData.startTime;
        const actionDensity = stats.clickCount / Math.max(sessionDuration / 1000, 1); // per second
        const comboFactor = Math.min(stats.maxCombo / 10, 1);
        const accuracyFactor = stats.clickCount > 0 ? stats.successfulClicks / stats.clickCount : 0;
        
        return Math.min((actionDensity * 0.4 + comboFactor * 0.3 + accuracyFactor * 0.3), 1);
    }
    
    /**
     * フラストレーション指標の検出
     * @returns {Object}
     */
    detectFrustrationIndicators() {
        const stats = this.playerBehavior.sessionStats;
        const patterns = this.playerBehavior.interactionPatterns;
        
        if (!stats || patterns.length < 5) return { detected: false };
        
        const indicators = {
            lowAccuracy: stats.clickCount > 0 ? (stats.successfulClicks / stats.clickCount) < 0.5 : false,
            manyMisses: stats.bubblesMissed > stats.bubblesPopped * 0.3,
            comboBroken: stats.maxCombo > 5 && stats.currentCombo === 0,
            rapidClicking: this.detectRapidClickingPattern(patterns),
            earlyExit: stats.exitEvents.some(e => e.exitReason === 'quit' && e.sessionDuration < 2 * 60 * 1000)
        };
        
        const indicatorCount = Object.values(indicators).filter(Boolean).length;
        
        return {
            detected: indicatorCount >= 2,
            indicators: indicators,
            severity: indicatorCount >= 3 ? 'high' : (indicatorCount >= 2 ? 'medium' : 'low')
        };
    }
    
    /**
     * フロー状態指標の検出
     * @returns {Object}
     */
    detectFlowStateIndicators() {
        const stats = this.playerBehavior.sessionStats;
        const patterns = this.playerBehavior.interactionPatterns;
        
        if (!stats || patterns.length < 10) return { detected: false };
        
        const indicators = {
            highAccuracy: stats.clickCount > 0 ? (stats.successfulClicks / stats.clickCount) > 0.8 : false,
            consistentTiming: this.calculateConsistencyScore() > 0.7,
            sustainedCombo: stats.maxCombo > 10,
            longSession: (Date.now() - this.playerBehavior.sessionData?.startTime || 0) > 10 * 60 * 1000,
            improvedPerformance: this.calculateSkillImprovement().improved
        };
        
        const indicatorCount = Object.values(indicators).filter(Boolean).length;
        
        return {
            detected: indicatorCount >= 3,
            indicators: indicators,
            intensity: indicatorCount >= 4 ? 'high' : (indicatorCount >= 3 ? 'medium' : 'low')
        };
    }
    
    /**
     * 急速クリックパターンの検出
     * @param {Array} patterns - インタラクションパターン
     * @returns {boolean}
     */
    detectRapidClickingPattern(patterns) {
        if (patterns.length < 5) return false;
        
        // 直近10回のクリック間隔を確認
        const recentPatterns = patterns.slice(-10);
        let rapidSequences = 0;
        
        for (let i = 1; i < recentPatterns.length; i++) {
            const timeDiff = recentPatterns[i].timestamp - recentPatterns[i-1].timestamp;
            if (timeDiff < 200) { // 200ms以下の連続クリック
                rapidSequences++;
            }
        }
        
        return rapidSequences >= 3; // 3回以上の急速クリック
    }
    
    /**
     * トレンドの計算
     * @param {Array} values - 値の配列
     * @param {boolean} inverted - 反転（値が小さいほど良い場合）
     * @returns {number}
     */
    calculateTrend(values, inverted = false) {
        if (values.length < 2) return 0;
        
        const first = values[0];
        const last = values[values.length - 1];
        
        if (first === 0) return 0;
        
        const trend = (last - first) / first;
        return inverted ? -trend : trend;
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
     * パフォーマンス最適化統計取得
     * @returns {Object}
     */
    getPerformanceOptimizationStats() {
        if (!this.performanceOptimizer) {
            return { error: 'Performance optimizer not initialized' };
        }
        
        return this.performanceOptimizer.getOptimizationStats();
    }
    
    /**
     * パフォーマンス最適化レポート生成
     * @returns {Object}
     */
    generatePerformanceReport() {
        if (!this.performanceOptimizer) {
            return { error: 'Performance optimizer not initialized' };
        }
        
        return this.performanceOptimizer.generatePerformanceReport();
    }
    
    /**
     * パフォーマンス最適化設定動的調整
     * @param {Object} newConfig - 新しい設定
     */
    adjustPerformanceConfiguration(newConfig) {
        if (this.performanceOptimizer) {
            this.performanceOptimizer.adjustConfiguration(newConfig);
        }
    }
    
    /**
     * キャッシュからデータ取得
     * @param {string} key - キャッシュキー
     * @returns {any|null}
     */
    getCachedAnalyticsData(key) {
        if (!this.performanceOptimizer) return null;
        
        return this.performanceOptimizer.getCachedData(key);
    }
    
    /**
     * データをキャッシュに保存
     * @param {string} key - キャッシュキー
     * @param {any} data - データ
     */
    setCachedAnalyticsData(key, data) {
        if (this.performanceOptimizer) {
            this.performanceOptimizer.setCachedData(key, data);
        }
    }
    
    /**
     * 拡張統計取得（キャッシュ付き）
     * @returns {Object}
     */
    getExtendedAnalyticsStats() {
        const cacheKey = 'extended_analytics_stats';
        const cached = this.getCachedAnalyticsData(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        const stats = {
            ...this.getAnalyticsStats(),
            performanceOptimization: this.getPerformanceOptimizationStats(),
            timestamp: Date.now()
        };
        
        this.setCachedAnalyticsData(cacheKey, stats);
        
        return stats;
    }
    
    /**
     * Enhanced Analytics Managerの破棄
     */
    destroy() {
        if (this.performanceOptimizer) {
            this.performanceOptimizer.destroy();
        }
        
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