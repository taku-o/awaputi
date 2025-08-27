/**
 * TutorialActions.js
 * チュートリアル用アクション検出・統合システム
 * ゲームエンジンとチュートリアルシステム間のブリッジ機能を提供
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { LoggingSystem } from '../LoggingSystem.js';

/**
 * チュートリアルアクション検出クラス
 */
export class TutorialActions {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // アクションリスナー管理
        this.activeListeners = new Map();
        this.actionCallbacks = new Map();
        
        // ゲーム状態監視
        this.gameStateWatchers = new Map();
        this.lastKnownStates = new Map();
        
        // アクション統計
        this.actionStats = {
            totalActions: 0,
            actionsByType: new Map(),
            averageResponseTime: new Map(),
            lastActionTime: 0
        };
        
        this.initialize();
    }

    /**
     * システムの初期化
     */
    initialize() {
        try {
            // ゲームエンジンイベントの監視設定
            this.setupGameEngineIntegration();
            
            // DOM イベントの監視設定
            this.setupDOMEventListeners();
            
            // 状態監視の開始
            this.startStateMonitoring();
            
            this.loggingSystem.info('TutorialActions', 'Tutorial action system initialized');
        } catch (error) {
            this.loggingSystem.error('TutorialActions', 'Failed to initialize tutorial actions', error);
            ErrorHandler.handle(error, 'TutorialActions.initialize');
        }
    }

    /**
     * アクションリスナーの登録
     * @param {string} actionType - アクションタイプ
     * @param {Function} callback - コールバック関数
     * @param {Object} options - オプション設定
     */
    registerActionListener(actionType, callback, options = {}) {
        try {
            const listenerInfo = {
                callback,
                options,
                registeredAt: Date.now(),
                triggerCount: 0
            };
            
            this.actionCallbacks.set(actionType, listenerInfo);
            
            // アクションタイプ別の監視設定
            this.setupActionSpecificListeners(actionType, options);
            
            this.loggingSystem.debug('TutorialActions', `Action listener registered: ${actionType}`);
        } catch (error) {
            this.loggingSystem.error('TutorialActions', `Failed to register action listener: ${actionType}`, error);
        }
    }

    /**
     * アクションリスナーの解除
     * @param {string} actionType - アクションタイプ
     */
    unregisterActionListener(actionType) {
        try {
            if (this.actionCallbacks.has(actionType)) {
                this.actionCallbacks.delete(actionType);
                this.cleanupActionListeners(actionType);
                this.loggingSystem.debug('TutorialActions', `Action listener unregistered: ${actionType}`);
            }
        } catch (error) {
            this.loggingSystem.error('TutorialActions', `Failed to unregister action listener: ${actionType}`, error);
        }
    }

    /**
     * アクションの発火
     * @param {string} actionType - アクションタイプ
     * @param {Object} eventData - イベントデータ
     */
    triggerAction(actionType, eventData = {}) {
        try {
            const listenerInfo = this.actionCallbacks.get(actionType);
            if (!listenerInfo) {
                return;
            }

            const actionData = this.buildActionData(actionType, eventData);
            
            // 統計の更新
            this.updateActionStats(actionType, actionData);
            
            // コールバックの実行
            listenerInfo.callback(actionData);
            listenerInfo.triggerCount++;
            
            this.loggingSystem.debug('TutorialActions', `Action triggered: ${actionType}`, actionData);
        } catch (error) {
            this.loggingSystem.error('TutorialActions', `Failed to trigger action: ${actionType}`, error);
        }
    }

    /**
     * アクションデータの構築
     * @param {string} actionType - アクションタイプ
     * @param {Object} eventData - イベントデータ
     * @returns {Object} 構築されたアクションデータ
     */
    buildActionData(actionType, eventData) {
        const baseData = {
            actionType,
            timestamp: Date.now(),
            gameState: this.getCurrentGameState(),
            ...eventData
        };

        // アクションタイプ別の追加データ
        switch (actionType) {
            case 'bubble_pop':
                return {
                    ...baseData,
                    bubbleId: eventData.bubbleId,
                    bubbleType: eventData.bubbleType || 'normal',
                    position: eventData.position || { x: 0, y: 0 },
                    score: eventData.score || 0,
                    comboMultiplier: this.getCurrentComboMultiplier()
                };

            case 'bubble_drag':
                return {
                    ...baseData,
                    bubbleId: eventData.bubbleId,
                    startPosition: eventData.startPosition || { x: 0, y: 0 },
                    endPosition: eventData.endPosition || { x: 0, y: 0 },
                    dragDistance: eventData.dragDistance || 0,
                    dragDirection: eventData.dragDirection || 0
                };

            case 'special_bubble_pop':
                return {
                    ...baseData,
                    bubbleId: eventData.bubbleId,
                    bubbleType: eventData.bubbleType,
                    specialEffect: eventData.specialEffect,
                    affectedBubbles: eventData.affectedBubbles || [],
                    effectDuration: eventData.effectDuration || 0
                };

            case 'combo_achieved':
                return {
                    ...baseData,
                    comboCount: eventData.comboCount || 0,
                    comboScore: eventData.comboScore || 0,
                    comboMultiplier: eventData.comboMultiplier || 1,
                    comboDuration: eventData.comboDuration || 0
                };

            case 'score_reached':
                return {
                    ...baseData,
                    score: eventData.score || 0,
                    milestone: eventData.milestone || 0,
                    previousScore: eventData.previousScore || 0,
                    scoreIncrease: eventData.scoreIncrease || 0
                };

            case 'hp_changed':
                return {
                    ...baseData,
                    currentHP: eventData.currentHP || 0,
                    previousHP: eventData.previousHP || 0,
                    hpChange: eventData.hpChange || 0,
                    changeReason: eventData.changeReason || 'unknown'
                };

            default:
                return baseData;
        }
    }

    /**
     * ゲームエンジン統合の設定
     */
    setupGameEngineIntegration() {
        if (!this.gameEngine || !this.gameEngine.eventBus) {
            return;
        }

        const eventBus = this.gameEngine.eventBus;

        // バブル関連イベント
        eventBus.on('bubble_popped', (data) => {
            this.triggerAction('bubble_pop', data);
        });

        eventBus.on('bubble_dragged', (data) => {
            this.triggerAction('bubble_drag', data);
        });

        eventBus.on('special_bubble_popped', (data) => {
            this.triggerAction('special_bubble_pop', data);
        });

        // スコア・コンボ関連イベント
        eventBus.on('combo_achieved', (data) => {
            this.triggerAction('combo_achieved', data);
        });

        eventBus.on('score_updated', (data) => {
            const milestone = this.checkScoreMilestone(data.score);
            if (milestone) {
                this.triggerAction('score_reached', {
                    ...data,
                    milestone
                });
            }
        });

        // HP関連イベント
        eventBus.on('hp_changed', (data) => {
            this.triggerAction('hp_changed', data);
        });

        // ゲーム状態イベント
        eventBus.on('game_state_changed', (data) => {
            this.updateGameState(data);
        });
    }

    /**
     * DOM イベントリスナーの設定
     */
    setupDOMEventListeners() {
        // キーボードイベント
        document.addEventListener('keydown', (event) => {
            this.triggerAction('key_pressed', {
                key: event.key,
                code: event.code,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey
            });
        });

        // マウス・タッチイベント
        document.addEventListener('click', (event) => {
            this.triggerAction('click', {
                position: { x: event.clientX, y: event.clientY },
                target: event.target.className,
                button: event.button
            });
        });

        document.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            this.triggerAction('touch_start', {
                position: { x: touch.clientX, y: touch.clientY },
                touchCount: event.touches.length
            });
        });
    }

    /**
     * アクション固有リスナーの設定
     * @param {string} actionType - アクションタイプ
     * @param {Object} options - オプション設定
     */
    setupActionSpecificListeners(actionType, options) {
        switch (actionType) {
            case 'bubble_pop':
                this.setupBubblePopListener(options);
                break;
                
            case 'bubble_drag':
                this.setupBubbleDragListener(options);
                break;
                
            case 'combo_achieved':
                this.setupComboListener(options);
                break;
                
            case 'score_reached':
                this.setupScoreListener(options);
                break;
        }
    }

    /**
     * バブルポップリスナーの設定
     * @param {Object} options - オプション設定
     */
    setupBubblePopListener(options) {
        // バブルマネージャーとの統合
        if (this.gameEngine.bubbleManager) {
            const originalPop = this.gameEngine.bubbleManager.popBubble;
            this.gameEngine.bubbleManager.popBubble = (bubble) => {
                const result = originalPop.call(this.gameEngine.bubbleManager, bubble);
                
                if (result) {
                    this.triggerAction('bubble_pop', {
                        bubbleId: bubble.id,
                        bubbleType: bubble.type,
                        position: { x: bubble.x, y: bubble.y },
                        score: bubble.score || 0
                    });
                }
                
                return result;
            };
        }
    }

    /**
     * バブルドラッグリスナーの設定
     * @param {Object} options - オプション設定
     */
    setupBubbleDragListener(options) {
        // 入力マネージャーとの統合
        if (this.gameEngine.inputManager) {
            const inputManager = this.gameEngine.inputManager;
            
            inputManager.on('drag_end', (data) => {
                if (data.targetType === 'bubble') {
                    const dragDistance = Math.sqrt(
                        Math.pow(data.endX - data.startX, 2) + 
                        Math.pow(data.endY - data.startY, 2)
                    );
                    
                    this.triggerAction('bubble_drag', {
                        bubbleId: data.targetId,
                        startPosition: { x: data.startX, y: data.startY },
                        endPosition: { x: data.endX, y: data.endY },
                        dragDistance: dragDistance,
                        dragDirection: Math.atan2(data.endY - data.startY, data.endX - data.startX)
                    });
                }
            });
        }
    }

    /**
     * コンボリスナーの設定
     * @param {Object} options - オプション設定
     */
    setupComboListener(options) {
        if (this.gameEngine.scoreManager) {
            const scoreManager = this.gameEngine.scoreManager;
            let lastComboCount = 0;
            
            // スコア更新時にコンボをチェック
            this.gameStateWatchers.set('combo_watcher', () => {
                const currentCombo = scoreManager.getCurrentCombo();
                if (currentCombo > lastComboCount && currentCombo >= (options.requiredCombo || 1)) {
                    this.triggerAction('combo_achieved', {
                        comboCount: currentCombo,
                        comboScore: scoreManager.getComboScore(),
                        comboMultiplier: scoreManager.getComboMultiplier()
                    });
                }
                lastComboCount = currentCombo;
            });
        }
    }

    /**
     * スコアリスナーの設定
     * @param {Object} options - オプション設定
     */
    setupScoreListener(options) {
        if (this.gameEngine.scoreManager) {
            const scoreManager = this.gameEngine.scoreManager;
            let lastScore = 0;
            
            this.gameStateWatchers.set('score_watcher', () => {
                const currentScore = scoreManager.getCurrentScore();
                if (currentScore > lastScore) {
                    const milestone = options.requiredScore || 100;
                    if (currentScore >= milestone && lastScore < milestone) {
                        this.triggerAction('score_reached', {
                            score: currentScore,
                            milestone: milestone,
                            previousScore: lastScore,
                            scoreIncrease: currentScore - lastScore
                        });
                    }
                }
                lastScore = currentScore;
            });
        }
    }

    /**
     * 状態監視の開始
     */
    startStateMonitoring() {
        // 定期的な状態チェック（100ms間隔）
        this.stateMonitoringInterval = setInterval(() => {
            for (const [name, watcher] of this.gameStateWatchers) {
                try {
                    watcher();
                } catch (error) {
                    this.loggingSystem.error('TutorialActions', `State watcher error: ${name}`, error);
                }
            }
        }, 100);
    }

    /**
     * 現在のゲーム状態を取得
     * @returns {Object} ゲーム状態
     */
    getCurrentGameState() {
        if (!this.gameEngine) {
            return {};
        }

        return {
            currentScene: this.gameEngine.currentScene?.constructor.name || 'unknown',
            score: this.gameEngine.scoreManager?.getCurrentScore() || 0,
            combo: this.gameEngine.scoreManager?.getCurrentCombo() || 0,
            hp: this.gameEngine.playerData?.getCurrentHP() || 0,
            activeBubbles: this.gameEngine.bubbleManager?.getActiveBubbleCount() || 0,
            gameTime: this.gameEngine.gameTime || 0
        };
    }

    /**
     * 現在のコンボ倍率を取得
     * @returns {number} コンボ倍率
     */
    getCurrentComboMultiplier() {
        return this.gameEngine.scoreManager?.getComboMultiplier() || 1;
    }

    /**
     * スコアマイルストーンのチェック
     * @param {number} score - 現在のスコア
     * @returns {number|null} マイルストーン値
     */
    checkScoreMilestone(score) {
        const milestones = [50, 100, 200, 500, 1000, 2000, 5000];
        const lastScore = this.lastKnownStates.get('score') || 0;
        
        for (const milestone of milestones) {
            if (score >= milestone && lastScore < milestone) {
                return milestone;
            }
        }
        
        return null;
    }

    /**
     * アクション統計の更新
     * @param {string} actionType - アクションタイプ
     * @param {Object} actionData - アクションデータ
     */
    updateActionStats(actionType, actionData) {
        this.actionStats.totalActions++;
        
        const typeCount = this.actionStats.actionsByType.get(actionType) || 0;
        this.actionStats.actionsByType.set(actionType, typeCount + 1);
        
        // レスポンス時間の計算（前回のアクションからの時間）
        if (this.actionStats.lastActionTime > 0) {
            const responseTime = actionData.timestamp - this.actionStats.lastActionTime;
            const avgResponseTime = this.actionStats.averageResponseTime.get(actionType) || 0;
            const newAvg = avgResponseTime > 0 ? (avgResponseTime + responseTime) / 2 : responseTime;
            this.actionStats.averageResponseTime.set(actionType, newAvg);
        }
        
        this.actionStats.lastActionTime = actionData.timestamp;
        this.lastKnownStates.set('score', actionData.gameState.score);
    }

    /**
     * ゲーム状態の更新
     * @param {Object} stateData - 状態データ
     */
    updateGameState(stateData) {
        for (const [key, value] of Object.entries(stateData)) {
            this.lastKnownStates.set(key, value);
        }
    }

    /**
     * アクションリスナーのクリーンアップ
     * @param {string} actionType - アクションタイプ
     */
    cleanupActionListeners(actionType) {
        // アクション固有のクリーンアップ
        if (this.activeListeners.has(actionType)) {
            const listeners = this.activeListeners.get(actionType);
            listeners.forEach(listener => {
                if (listener.remove) {
                    listener.remove();
                }
            });
            this.activeListeners.delete(actionType);
        }
    }

    /**
     * 統計情報の取得
     * @returns {Object} 統計情報
     */
    getActionStats() {
        return {
            ...this.actionStats,
            actionsByType: Object.fromEntries(this.actionStats.actionsByType),
            averageResponseTime: Object.fromEntries(this.actionStats.averageResponseTime),
            activeListeners: this.actionCallbacks.size,
            stateWatchers: this.gameStateWatchers.size
        };
    }

    /**
     * リソースのクリーンアップ
     */
    cleanup() {
        try {
            // 状態監視の停止
            if (this.stateMonitoringInterval) {
                clearInterval(this.stateMonitoringInterval);
                this.stateMonitoringInterval = null;
            }
            
            // すべてのリスナーをクリーンアップ
            for (const actionType of this.actionCallbacks.keys()) {
                this.cleanupActionListeners(actionType);
            }
            
            // データのクリア
            this.actionCallbacks.clear();
            this.gameStateWatchers.clear();
            this.lastKnownStates.clear();
            
            this.loggingSystem.info('TutorialActions', 'Tutorial action system cleaned up');
        } catch (error) {
            this.loggingSystem.error('TutorialActions', 'Failed to cleanup tutorial actions', error);
        }
    }

    /**
     * システムの破棄
     */
    destroy() {
        this.cleanup();
        this.loggingSystem.info('TutorialActions', 'Tutorial action system destroyed');
    }
}

// シングルトンインスタンス管理
let tutorialActionsInstance = null;

/**
 * TutorialActionsのシングルトンインスタンスを取得
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {TutorialActions} TutorialActionsインスタンス
 */
export function getTutorialActions(gameEngine) {
    if (!tutorialActionsInstance) {
        tutorialActionsInstance = new TutorialActions(gameEngine);
    }
    return tutorialActionsInstance;
}

/**
 * TutorialActionsインスタンスを再初期化
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {TutorialActions} 新しいTutorialActionsインスタンス
 */
export function reinitializeTutorialActions(gameEngine) {
    if (tutorialActionsInstance) {
        tutorialActionsInstance.destroy();
    }
    tutorialActionsInstance = new TutorialActions(gameEngine);
    return tutorialActionsInstance;
}