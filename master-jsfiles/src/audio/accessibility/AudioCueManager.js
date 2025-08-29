/**
 * Audio Cue Manager
 * 
 * 音響キュー生成・パターン認識機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - Audio event handling and processing
 * - Pattern recognition for complex audio sequences
 * - Event history management
 * - Real-time audio level monitoring
 * 
 * @module AudioCueManager
 * Created: Phase G.2 (Issue #103)
 */

export class AudioCueManager {
    constructor(mainController) {
        this.mainController = mainController;
        this.audioManager = mainController.audioManager;
        this.errorHandler = mainController.errorHandler;
        
        // 音響イベント履歴
        this.eventHistory = [];
        this.maxHistorySize = 50;
        
        // パターン認識
        this.patternRecognition = {
            enabled: false,
            patterns: new Map(),
            currentPattern: null,
            patternTimeout: null
        };
        
        // 音響イベントリスナー
        this.audioEventListeners = new Map();
        
        // 初期化
        this.initializePatterns();
    }

    /**
     * 音響イベントリスナーを設定
     */
    setupAudioEventListeners() {
        // AudioManagerからのイベントを監視
        if (this.audioManager.audioVisualizer) {
            // 視覚化システムと連携してオーディオレベルを監視
            this.monitorAudioLevels();
        }
        
        // カスタム音響イベントリスナー
        this.addAudioEventListener('bubblePop', (event) => {
            this.handleBubblePopEvent(event);
        });
        
        this.addAudioEventListener('comboAchieved', (event) => {
            this.handleComboEvent(event);
        });
        
        this.addAudioEventListener('achievementUnlocked', (event) => {
            this.handleAchievementEvent(event);
        });
        
        this.addAudioEventListener('gameStateChange', (event) => {
            this.handleGameStateEvent(event);
        });
    }

    /**
     * 音響レベルを監視
     * @private
     */
    monitorAudioLevels() {
        const updateInterval = 100; // 100ms間隔
        
        const monitorLoop = () => {
            if (!this.mainController.settings.visualFeedback && !this.mainController.settings.colorIndication) {
                setTimeout(monitorLoop, updateInterval);
                return;
            }
            
            // AudioVisualizerから音響レベルを取得
            const stats = this.audioManager.getVisualizationStatistics();
            if (stats) {
                this.mainController.audioFeedbackManager.updateColorIndicator(stats.averageLevel || 0);
                
                // 音響レベルに基づく触覚フィードバック
                if (this.mainController.settings.hapticFeedback) {
                    this.mainController.audioFeedbackManager.triggerAudioLevelVibration(stats.averageLevel || 0, 'background');
                }
            }
            
            setTimeout(monitorLoop, updateInterval);
        };
        
        monitorLoop();
    }

    /**
     * 音響イベントリスナーを追加
     * @param {string} eventType - イベントタイプ
     * @param {Function} callback - コールバック関数
     */
    addAudioEventListener(eventType, callback) {
        if (!this.audioEventListeners.has(eventType)) {
            this.audioEventListeners.set(eventType, []);
        }
        this.audioEventListeners.get(eventType).push(callback);
    }

    /**
     * 音響イベントを発火
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     */
    triggerAudioEvent(eventType, eventData) {
        // イベント履歴に追加
        this.addToEventHistory(eventType, eventData);
        
        // 登録されたリスナーを実行
        const listeners = this.audioEventListeners.get(eventType);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(eventData);
                } catch (error) {
                    this.errorHandler.handleError(error, 'ACCESSIBILITY_ERROR', {
                        component: 'AudioCueManager',
                        operation: 'triggerAudioEvent',
                        eventType: eventType
                    });
                }
            });
        }
        
        // パターン認識
        if (this.patternRecognition.enabled) {
            this.processEventPattern(eventType, eventData);
        }
    }

    /**
     * 泡ポップイベントを処理
     * @param {Object} event - イベントデータ
     */
    handleBubblePopEvent(event) {
        const { bubbleType, comboLevel, position } = event;
        
        // 視覚的通知
        this.mainController.audioDescriptionManager.showVisualNotification({
            type: 'bubblePop',
            title: '泡破壊',
            message: `${bubbleType}泡を破壊`,
            icon: '🫧',
            color: this.mainController.audioDescriptionManager.getBubbleColor(bubbleType),
            position: position
        });
        
        // 字幕
        if (this.mainController.settings.captioning) {
            this.mainController.audioDescriptionManager.showCaption(`${bubbleType}泡を破壊しました`);
        }
        
        // 触覚フィードバック
        if (this.mainController.settings.hapticFeedback && this.mainController.audioFeedbackManager.vibrationManager) {
            this.mainController.audioFeedbackManager.triggerHapticFeedback('bubblePop', event);
        }
    }

    /**
     * コンボイベントを処理
     * @param {Object} event - イベントデータ
     */
    handleComboEvent(event) {
        const { comboLevel, comboCount } = event;
        
        // 視覚的通知
        this.mainController.audioDescriptionManager.showVisualNotification({
            type: 'combo',
            title: `${comboLevel}連鎖`,
            message: `${comboCount}コンボ達成！`,
            icon: '🔥',
            color: '#ff8000',
            duration: 2000
        });
        
        // 字幕
        if (this.mainController.settings.captioning) {
            this.mainController.audioDescriptionManager.showCaption(`${comboCount}コンボ達成！`);
        }
        
        // 触覚フィードバック
        if (this.mainController.settings.hapticFeedback && this.mainController.audioFeedbackManager.vibrationManager) {
            this.mainController.audioFeedbackManager.triggerHapticFeedback('comboAchieved', event);
        }
    }

    /**
     * 実績イベントを処理
     * @param {Object} event - イベントデータ
     */
    handleAchievementEvent(event) {
        const { achievementName, rarity } = event;
        
        // 視覚的通知
        this.mainController.audioDescriptionManager.showVisualNotification({
            type: 'achievement',
            title: '実績解除',
            message: achievementName,
            icon: '🏆',
            color: this.mainController.audioDescriptionManager.getRarityColor(rarity),
            duration: 4000
        });
        
        // 字幕
        if (this.mainController.settings.captioning) {
            this.mainController.audioDescriptionManager.showCaption(`実績「${achievementName}」を解除しました！`);
        }
        
        // 触覚フィードバック
        if (this.mainController.settings.hapticFeedback && this.mainController.audioFeedbackManager.vibrationManager) {
            this.mainController.audioFeedbackManager.triggerHapticFeedback('achievementUnlocked', event);
        }
    }

    /**
     * ゲーム状態イベントを処理
     * @param {Object} event - イベントデータ
     */
    handleGameStateEvent(event) {
        const { state, details } = event;
        
        const stateMessages = {
            gameStart: { title: 'ゲーム開始', icon: '🎮', color: '#00ff00' },
            gameOver: { title: 'ゲームオーバー', icon: '💀', color: '#ff0000' },
            levelUp: { title: 'レベルアップ', icon: '⭐', color: '#ffff00' },
            warning: { title: '警告', icon: '⚠️', color: '#ff8000' },
            bonusStart: { title: 'ボーナス開始', icon: '🌟', color: '#ff00ff' }
        };
        
        const stateInfo = stateMessages[state];
        if (stateInfo) {
            // 視覚的通知
            this.mainController.audioDescriptionManager.showVisualNotification({
                type: 'gameState',
                title: stateInfo.title,
                message: details || '',
                icon: stateInfo.icon,
                color: stateInfo.color,
                duration: 3000
            });
            
            // 字幕
            if (this.mainController.settings.captioning) {
                this.mainController.audioDescriptionManager.showCaption(`${stateInfo.title}${details ? ': ' + details : ''}`);
            }
            
            // 触覚フィードバック
            if (this.mainController.settings.hapticFeedback && this.mainController.audioFeedbackManager.vibrationManager) {
                this.mainController.audioFeedbackManager.triggerHapticFeedback('gameStateChange', { state, ...event });
            }
        }
    }

    /**
     * イベント履歴に追加
     * @private
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     */
    addToEventHistory(eventType, eventData) {
        const historyEntry = {
            timestamp: Date.now(),
            type: eventType,
            data: eventData
        };
        
        this.eventHistory.push(historyEntry);
        
        // 履歴サイズを制限
        while (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    /**
     * 音響パターンを初期化
     * @private
     */
    initializePatterns() {
        // よくある音響パターンを定義
        this.patternRecognition.patterns.set('rapidPops', {
            name: '連続泡破壊',
            description: '短時間で多くの泡を破壊',
            pattern: ['bubblePop', 'bubblePop', 'bubblePop'],
            timeWindow: 1000, // 1秒以内
            notification: '連続破壊中！'
        });
        
        this.patternRecognition.patterns.set('comboChain', {
            name: 'コンボ連鎖',
            description: '連続してコンボを達成',
            pattern: ['comboAchieved', 'comboAchieved'],
            timeWindow: 2000, // 2秒以内
            notification: 'コンボ連鎖発生！'
        });
        
        this.patternRecognition.patterns.set('achievementBurst', {
            name: '実績連続解除',
            description: '短時間で複数の実績を解除',
            pattern: ['achievementUnlocked', 'achievementUnlocked'],
            timeWindow: 5000, // 5秒以内
            notification: '実績ラッシュ！'
        });
    }

    /**
     * イベントパターンを処理
     * @private
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     */
    processEventPattern(eventType, eventData) {
        // 現在のパターンを更新
        if (!this.patternRecognition.currentPattern) {
            this.patternRecognition.currentPattern = [];
        }
        
        this.patternRecognition.currentPattern.push({
            type: eventType,
            timestamp: Date.now(),
            data: eventData
        });
        
        // 古いイベントを削除（5秒より古い）
        const now = Date.now();
        this.patternRecognition.currentPattern = this.patternRecognition.currentPattern.filter(
            event => now - event.timestamp < 5000
        );
        
        // パターンマッチングを実行
        this.checkPatternMatches();
    }

    /**
     * パターンマッチングをチェック
     * @private
     */
    checkPatternMatches() {
        this.patternRecognition.patterns.forEach((pattern, patternName) => {
            if (this.matchesPattern(pattern)) {
                this.handlePatternMatch(patternName, pattern);
            }
        });
    }

    /**
     * パターンが一致するかチェック
     * @private
     * @param {Object} pattern - パターン定義
     * @returns {boolean} 一致するかどうか
     */
    matchesPattern(pattern) {
        const events = this.patternRecognition.currentPattern;
        const patternTypes = pattern.pattern;
        
        if (events.length < patternTypes.length) {
            return false;
        }
        
        // 最新のイベントから逆順でチェック
        const recentEvents = events.slice(-patternTypes.length);
        const timeSpan = recentEvents[recentEvents.length - 1].timestamp - recentEvents[0].timestamp;
        
        if (timeSpan > pattern.timeWindow) {
            return false;
        }
        
        // パターンタイプが一致するかチェック
        return recentEvents.every((event, index) => 
            event.type === patternTypes[index]
        );
    }

    /**
     * パターンマッチを処理
     * @private
     * @param {string} patternName - パターン名
     * @param {Object} pattern - パターン定義
     */
    handlePatternMatch(patternName, pattern) {
        // 重複通知を防ぐため、少し待機
        if (this.patternRecognition.patternTimeout) {
            clearTimeout(this.patternRecognition.patternTimeout);
        }
        
        this.patternRecognition.patternTimeout = setTimeout(() => {
            // パターン認識通知
            this.mainController.audioDescriptionManager.showVisualNotification({
                type: 'pattern',
                title: 'パターン認識',
                message: pattern.notification,
                icon: '🎯',
                color: '#ff00ff',
                duration: 4000
            });
            
            // 字幕
            if (this.mainController.settings.captioning) {
                this.mainController.audioDescriptionManager.showCaption(pattern.notification);
            }
            
            console.log(`Pattern recognized: ${patternName}`);
        }, 500);
    }

    /**
     * イベント履歴を取得
     * @returns {Array} イベント履歴
     */
    getEventHistory() {
        return [...this.eventHistory];
    }

    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    getStatistics() {
        const stats = {
            totalEvents: this.eventHistory.length,
            eventTypes: {},
            recentActivity: this.eventHistory.slice(-10)
        };
        
        this.eventHistory.forEach(event => {
            stats.eventTypes[event.type] = (stats.eventTypes[event.type] || 0) + 1;
        });
        
        return stats;
    }

    /**
     * 音響キューの再生
     * @param {string} cueType - キューの種類
     * @param {Object} options - 再生オプション
     */
    playCue(cueType, options = {}) {
        console.log(`AudioCueManager: Playing cue ${cueType}`, options);
        
        // 適切な音響キューをトリガー
        this.triggerAudioEvent(cueType, {
            type: cueType,
            ...options
        });
    }

    /**
     * ステータス取得
     * @returns {Object} ステータス情報
     */
    getStatus() {
        return {
            initialized: true,
            activeListeners: this.eventHistory ? this.eventHistory.length : 0,
            patternsActive: Object.keys(this.recognitionPatterns || {}).length
        };
    }

    /**
     * リソースの解放
     */
    dispose() {
        // タイムアウトをクリア
        if (this.patternRecognition.patternTimeout) {
            clearTimeout(this.patternRecognition.patternTimeout);
        }
        
        // データをクリア
        this.eventHistory = [];
        this.audioEventListeners.clear();
        this.patternRecognition.patterns.clear();
    }
}