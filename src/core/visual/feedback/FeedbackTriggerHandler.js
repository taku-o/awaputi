import { getErrorHandler } from '../../../utils/ErrorHandler.js';

/**
 * フィードバックトリガーハンドラー
 * 視覚フィードバックのトリガー処理とイベント管理
 */
export class FeedbackTriggerHandler {
    /**
     * @param {VisualFeedbackManager} mainController - メインコントローラーインスタンス
     */
    constructor(mainController) {
        this.mainController = mainController;
        this.gameEngine = mainController.gameEngine;
        this.config = mainController.config;
        this.userPreferences = mainController.userPreferences;
        this.feedbackElements = mainController.feedbackElements;
        this.feedbackContainer = mainController.feedbackContainer;
        
        // トリガー統計
        this.triggerStats = {
            gameEventTriggers: 0,
            volumeTriggers: 0,
            edgeTriggers: 0,
            manualTriggers: 0
        };
        
        console.log('FeedbackTriggerHandler initialized');
    }
    
    /**
     * イベントリスナーの設定
     * ゲームイベントとオーディオフィードバックのトリガー設定
     */
    setupEventListeners() {
        try {
            // ゲームイベントの監視
            if (this.gameEngine) {
                // バブルポップ
                this.gameEngine.addEventListener?.('bubblePopped', (event) => {
                    this.triggerGameEventFeedback('bubblePop', event);
                });
                
                // コンボ
                this.gameEngine.addEventListener?.('comboAchieved', (event) => {
                    this.triggerGameEventFeedback('combo', event);
                });
                
                // ボーナス
                this.gameEngine.addEventListener?.('bonusTriggered', (event) => {
                    this.triggerGameEventFeedback('bonus', event);
                });
                
                // ダメージ
                this.gameEngine.addEventListener?.('playerDamaged', (event) => {
                    this.triggerGameEventFeedback('damage', event);
                });
                
                // パワーアップ
                this.gameEngine.addEventListener?.('powerUpCollected', (event) => {
                    this.triggerGameEventFeedback('powerUp', event);
                });
                
                // ゲームオーバー
                this.gameEngine.addEventListener?.('gameOver', (event) => {
                    this.triggerGameEventFeedback('gameOver', event);
                });
                
                // レベルアップ
                this.gameEngine.addEventListener?.('levelUp', (event) => {
                    this.triggerGameEventFeedback('levelUp', event);
                });
                
                // 警告
                this.gameEngine.addEventListener?.('warning', (event) => {
                    this.triggerGameEventFeedback('warning', event);
                });
                
                console.log('Game event listeners set up successfully');
            }
            
            // オーディオ視覚化の開始
            if (this.userPreferences.audioVisualization && this.mainController.startAudioVisualization) {
                this.mainController.startAudioVisualization();
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'TRIGGER_HANDLER_ERROR', {
                operation: 'setupEventListeners',
                hasGameEngine: !!this.gameEngine
            });
        }
    }
    
    /**
     * ゲームイベントフィードバックのトリガー
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     */
    triggerGameEventFeedback(eventType, eventData) {
        try {
            if (!this.config.enabled || !this.userPreferences.gameEventFeedback) {
                return;
            }
            
            const mapping = this.config.audioMapping.gameEvents.get(eventType);
            if (!mapping) {
                console.warn(`No feedback mapping for event: ${eventType}`);
                return;
            }
            
            // カスタムマッピングの確認
            const customMapping = this.userPreferences.customMappings.get(eventType);
            const finalMapping = customMapping || mapping;
            
            // フィードバックオプションの構築
            const feedbackOptions = {
                type: finalMapping.pattern,
                color: finalMapping.color,
                intensity: finalMapping.intensity * this.config.globalIntensity,
                duration: this.config.feedbackTypes[finalMapping.pattern]?.duration || 500,
                target: this.selectFeedbackTarget(eventType, eventData),
                eventData
            };
            
            // メインコントローラーのフィードバック実行
            if (this.mainController.triggerVisualFeedback) {
                this.mainController.triggerVisualFeedback(feedbackOptions);
            }
            
            // 統計更新
            this.triggerStats.gameEventTriggers++;
            this.mainController.updateEventStats?.(eventType);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'GAME_EVENT_FEEDBACK_ERROR', {
                eventType,
                eventData: eventData ? { type: typeof eventData } : null
            });
        }
    }
    
    /**
     * フィードバックターゲットの選択
     * イベントタイプに基づく適切な表示ターゲットの決定
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     * @returns {HTMLElement} 選択されたターゲット要素
     */
    selectFeedbackTarget(eventType, eventData) {
        try {
            // イベントタイプに基づいてターゲットを決定
            switch (eventType) {
                case 'bubblePop':
                    return eventData?.bubble || this.feedbackElements.get('game-area');
                    
                case 'damage':
                    return this.feedbackElements.get('edge-top') || this.feedbackContainer;
                    
                case 'combo':
                case 'bonus':
                    return this.feedbackElements.get('game-area') || this.feedbackContainer;
                    
                case 'gameOver':
                    return this.feedbackContainer;
                    
                case 'powerUp':
                    return this.feedbackElements.get('game-area') || this.feedbackContainer;
                    
                case 'levelUp':
                    return this.feedbackElements.get('game-area') || this.feedbackContainer;
                    
                case 'warning':
                    return this.feedbackElements.get('edge-top') || 
                           this.feedbackElements.get('game-area') || 
                           this.feedbackContainer;
                    
                default:
                    return this.feedbackElements.get('game-area') || this.feedbackContainer;
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'TARGET_SELECTION_ERROR', {
                eventType,
                availableElements: Array.from(this.feedbackElements?.keys() || [])
            });
            
            // フォールバック
            return this.feedbackContainer;
        }
    }
    
    /**
     * 音量ベースフィードバックのトリガー
     * オーディオレベルに基づく視覚フィードバック
     * @param {number} volume - 音量レベル（0-1）
     */
    triggerVolumeBasedFeedback(volume) {
        try {
            if (!this.config.enabled || !this.userPreferences.audioVisualization) {
                return;
            }
            
            const volumeMapping = this.config.audioMapping.volume;
            let volumeLevel = 'quiet';
            
            // 音量レベルの判定
            for (const [level, config] of Object.entries(volumeMapping)) {
                if (volume >= config.range[0] && volume <= config.range[1]) {
                    volumeLevel = level;
                    break;
                }
            }
            
            // 高音量時のエッジフィードバック
            if (volumeLevel === 'loud' && Math.random() < 0.1) { // 10%の確率
                this.triggerEdgeFeedback('#ff6b6b', volume);
            }
            
            // 統計更新
            this.triggerStats.volumeTriggers++;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'VOLUME_FEEDBACK_ERROR', {
                volume,
                enabled: this.config.enabled,
                audioVisualization: this.userPreferences.audioVisualization
            });
        }
    }
    
    /**
     * エッジフィードバックのトリガー
     * 画面端での視覚フィードバック
     * @param {string} color - エフェクト色
     * @param {number} intensity - エフェクト強度（0-1）
     */
    triggerEdgeFeedback(color, intensity) {
        try {
            if (!this.config.enabled || !this.config.positioning.screenEdges) {
                return;
            }
            
            const edges = ['top', 'bottom', 'left', 'right'];
            const randomEdge = edges[Math.floor(Math.random() * edges.length)];
            const edgeElement = this.feedbackElements.get(`edge-${randomEdge}`);
            
            if (edgeElement && this.mainController.triggerVisualFeedback) {
                const feedbackOptions = {
                    type: 'flash',
                    color: color,
                    intensity: intensity * 0.5, // エッジフィードバックは少し弱く
                    duration: 200,
                    target: edgeElement
                };
                
                this.mainController.triggerVisualFeedback(feedbackOptions);
                
                // 統計更新
                this.triggerStats.edgeTriggers++;
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'EDGE_FEEDBACK_ERROR', {
                color,
                intensity,
                enabledEdges: this.config.positioning.screenEdges,
                availableElements: Array.from(this.feedbackElements?.keys() || [])
            });
        }
    }
    
    /**
     * 手動フィードバックトリガー
     * プログラムから直接実行する視覚フィードバック
     * @param {string} type - エフェクトタイプ
     * @param {Object} options - オプション設定
     */
    triggerManualFeedback(type, options = {}) {
        try {
            if (!this.config.enabled) {
                console.warn('Visual feedback is disabled');
                return;
            }
            
            const feedbackOptions = {
                type,
                color: options.color || '#ffffff',
                intensity: options.intensity || 1.0,
                duration: options.duration || 300,
                target: options.target || this.feedbackContainer,
                eventData: options.eventData || null
            };
            
            if (this.mainController.triggerVisualFeedback) {
                this.mainController.triggerVisualFeedback(feedbackOptions);
            }
            
            // 統計更新
            this.triggerStats.manualTriggers++;
            
            console.log(`Manual feedback triggered: ${type}`, options);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'MANUAL_FEEDBACK_ERROR', {
                type,
                options
            });
        }
    }
    
    /**
     * イベントリスナーの削除
     * クリーンアップ時に使用
     */
    removeEventListeners() {
        try {
            if (this.gameEngine && this.gameEngine.removeEventListener) {
                // 各イベントリスナーを削除
                const events = [
                    'bubblePopped', 'comboAchieved', 'bonusTriggered',
                    'playerDamaged', 'powerUpCollected', 'gameOver',
                    'levelUp', 'warning'
                ];
                
                events.forEach(eventType => {
                    this.gameEngine.removeEventListener?.(eventType);
                });
                
                console.log('Event listeners removed');
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'REMOVE_LISTENERS_ERROR');
        }
    }
    
    /**
     * トリガー統計の取得
     * @returns {Object} トリガー統計情報
     */
    getTriggerStats() {
        return {
            ...this.triggerStats,
            total: Object.values(this.triggerStats).reduce((a, b) => a + b, 0)
        };
    }
    
    /**
     * トリガー統計のリセット
     */
    resetTriggerStats() {
        this.triggerStats = {
            gameEventTriggers: 0,
            volumeTriggers: 0,
            edgeTriggers: 0,
            manualTriggers: 0
        };
        
        console.log('Trigger stats reset');
    }
    
    /**
     * 設定の更新
     * メインコントローラーから設定変更を反映
     */
    updateConfig() {
        this.config = this.mainController.config;
        this.userPreferences = this.mainController.userPreferences;
        
        console.log('FeedbackTriggerHandler config updated');
    }
    
    /**
     * クリーンアップ
     * リソースの解放とイベントリスナーの削除
     */
    destroy() {
        console.log('Destroying FeedbackTriggerHandler...');
        
        // イベントリスナーの削除
        this.removeEventListeners();
        
        // 参照のクリア
        this.mainController = null;
        this.gameEngine = null;
        this.config = null;
        this.userPreferences = null;
        this.feedbackElements = null;
        this.feedbackContainer = null;
        
        console.log('FeedbackTriggerHandler destroyed');
    }
}