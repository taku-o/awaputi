/**
 * Enhanced Analytics Manager (Refactored)
 * 既存のAnalyticsクラスを拡張し、ゲーム分析機能を統合
 * Main Controller Pattern により、サブコンポーネントに責任を分離
 * 
 * サブコンポーネント化により責任を分離：
 * - PlayerBehaviorAnalyzer: プレイヤー行動分析とパターン検出
 * - GameBalanceAnalyzer: ゲームバランス分析と警告生成
 * - PerformanceMonitor: パフォーマンス監視とメトリクス収集
 * - SessionManager: セッション管理と統計収集
 */

import analytics from '../utils/Analytics.js';
import { PrivacyManager } from './PrivacyManager.js';
import { IndexedDBStorageManager } from './IndexedDBStorageManager.js';
import { DataCollector } from './DataCollector.js';
import { GameBalanceCollector } from './GameBalanceCollector.js';
import { AnalyticsPerformanceOptimizer } from './AnalyticsPerformanceOptimizer.js';

// サブコンポーネントのインポート
import { PlayerBehaviorAnalyzer } from './enhanced-analytics-manager/PlayerBehaviorAnalyzer.js';
import { GameBalanceAnalyzer } from './enhanced-analytics-manager/GameBalanceAnalyzer.js';
import { PerformanceMonitor } from './enhanced-analytics-manager/PerformanceMonitor.js';
import { SessionManager } from './enhanced-analytics-manager/SessionManager.js';

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
        
        // サブコンポーネントの初期化
        this._initializeSubComponents();
        
        // 自動初期化
        if (this.options.autoInitialize) {
            this.initialize();
        }
    }
    
    /**
     * サブコンポーネントの初期化
     */
    _initializeSubComponents() {
        try {
            this.playerBehaviorAnalyzer = new PlayerBehaviorAnalyzer();
            this.gameBalanceAnalyzer = new GameBalanceAnalyzer();
            this.performanceMonitor = new PerformanceMonitor();
            this.sessionManager = new SessionManager();
            
            console.log('[EnhancedAnalyticsManager] サブコンポーネントを初期化しました');
        } catch (error) {
            console.error('Failed to initialize sub-components:', error);
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
                this.performanceMonitor.startPerformanceMonitoring();
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
            const session = this.sessionManager.startSession({
                stageId: sessionInfo.stageId,
                difficulty: sessionInfo.difficulty,
                soundEnabled: sessionInfo.soundEnabled,
                effectsEnabled: sessionInfo.effectsEnabled,
                playerLevel: sessionInfo.playerLevel,
                previousBestScore: sessionInfo.previousBestScore || 0
            });
            
            this.dataCollector.startSession(session);
            
            // プレイヤー行動分析の初期化（SessionManagerから現在のセッションIDを取得）
            this.playerBehaviorAnalyzer.initializePlayerBehaviorTracking(sessionInfo, session.id);
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
            const endedSession = this.sessionManager.endSession({
                finalScore: endInfo.finalScore,
                bubblesPopped: endInfo.bubblesPopped,
                bubblesMissed: endInfo.bubblesMissed,
                maxCombo: endInfo.maxCombo,
                completed: endInfo.completed,
                exitReason: endInfo.exitReason
            });
            
            if (endedSession) {
                this.dataCollector.endSession(endedSession.stats);
            }
            
            // プレイヤー行動分析の更新（PlayerBehaviorAnalyzerに委譲）
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
            
            // プレイヤー行動パターンの記録（PlayerBehaviorAnalyzerに委譲）
            this.playerBehaviorAnalyzer.recordPlayerInteractionPattern(bubbleData);
            
            // セッションマネージャーへの記録
            this.sessionManager.recordInteraction(bubbleData);
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
                    playerSkillLevel: this.playerBehaviorAnalyzer.getPlayerSkillLevel()
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
                balanceWarnings: this.gameBalanceAnalyzer.checkGameBalanceWarnings(balanceData)
            });
        }
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
        this.performanceMonitor.incrementErrorCount();
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
        // PlayerBehaviorAnalyzerに委譲してセッション分析を実行
        const sessionSummary = this.playerBehaviorAnalyzer.getSessionPerformanceSummary();
        
        if (this.dataCollector && sessionSummary) {
            // 包括的な分析データの収集
            const comprehensiveAnalysis = {
                type: 'playerBehaviorAnalysis',
                timestamp: Date.now(),
                sessionInfo: sessionSummary,
                endInfo: endInfo
            };
            
            this.dataCollector.collectGameBalanceData(comprehensiveAnalysis);
        }
        
        // セッションデータのリセット
        this.playerBehaviorAnalyzer.resetSessionData();
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
            performance: this.performanceMonitor.getCurrentMetrics(),
            playerSkillLevel: this.playerBehaviorAnalyzer.getPlayerSkillLevel(),
            playStyleDistribution: this.playerBehaviorAnalyzer.getPlayStyleDistribution(),
            sessionStats: this.sessionManager.generateSessionSummary()
        };
        
        if (this.dataCollector) {
            stats.dataCollector = this.dataCollector.getEventStats();
        }
        
        if (this.storageManager) {
            stats.storageInfo = {
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
        // サブコンポーネントの停止
        if (this.performanceMonitor) {
            this.performanceMonitor.stopMonitoring();
        }
        
        if (this.sessionManager) {
            this.sessionManager.clearSessionData();
        }
        
        if (this.performanceOptimizer) {
            this.performanceOptimizer.destroy();
        }
        
        if (this.dataCollector) {
            this.dataCollector.destroy();
        }
        
        if (this.storageManager) {
            this.storageManager.close();
        }
        
        this.isInitialized = false;
        this.isGameAnalyticsEnabled = false;
    }
}