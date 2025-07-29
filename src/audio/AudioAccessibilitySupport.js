import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { getLocalizationManager } from '../utils/LocalizationManager.js';

/**
 * 音響アクセシビリティ支援クラス - 聴覚障害者向け支援機能
 */
export class AudioAccessibilitySupport {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.configManager = getConfigurationManager();
        this.localizationManager = getLocalizationManager();
        this.errorHandler = getErrorHandler();
        
        // 視覚的通知システム
        this.visualNotifications = [];
        this.notificationContainer = null;
        this.maxNotifications = 5;
        
        // 音響イベント履歴
        this.eventHistory = [];
        this.maxHistorySize = 50;
        
        // 字幕システム
        this.captionContainer = null;
        this.captionQueue = [];
        this.captionDuration = 3000; // 3秒間表示
        
        // 音響強度の色彩表現
        this.colorIndicator = null;
        this.colorMappings = {
            low: { color: '#00ff00', label: '低音量' },
            medium: { color: '#ffff00', label: '中音量' },
            high: { color: '#ff8000', label: '高音量' },
            critical: { color: '#ff0000', label: '最大音量' }
        };
        
        // パターン認識
        this.patternRecognition = {
            enabled: false,
            patterns: new Map(),
            currentPattern: null,
            patternTimeout: null
        };
        
        // アクセシビリティ設定
        this.settings = {
            visualFeedback: false,
            captioning: false,
            colorIndication: false,
            patternRecognition: false,
            highContrast: false,
            largeFonts: false,
            reduceMotion: false
        };
        
        // 音響イベントリスナー
        this.audioEventListeners = new Map();
        
        // 初期化
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // DOM要素を作成
            this.createNotificationContainer();
            this.createCaptionContainer();
            this.createColorIndicator();
            
            // 設定を読み込み
            this.loadSettings();
            
            // 設定変更を監視
            this.setupConfigWatchers();
            
            // 音響イベントを監視
            this.setupAudioEventListeners();
            
            // 音響パターンを初期化
            this.initializePatterns();
            
            console.log('AudioAccessibilitySupport initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'ACCESSIBILITY_ERROR', {
                component: 'AudioAccessibilitySupport',
                operation: 'initialize'
            });
        }
    }
    
    /**
     * 通知コンテナを作成
     * @private
     */
    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'audio-accessibility-notifications';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 10000;
            pointer-events: none;
        `;
        this.notificationContainer.setAttribute('aria-live', 'polite');
        this.notificationContainer.setAttribute('aria-label', '音響通知エリア');
        
        document.body.appendChild(this.notificationContainer);
    }
    
    /**
     * 字幕コンテナを作成
     * @private
     */
    createCaptionContainer() {
        this.captionContainer = document.createElement('div');
        this.captionContainer.className = 'audio-accessibility-captions';
        this.captionContainer.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: #ffffff;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            text-align: center;
            z-index: 10000;
            display: none;
            max-width: 80%;
            word-wrap: break-word;
        `;
        this.captionContainer.setAttribute('role', 'status');
        this.captionContainer.setAttribute('aria-live', 'assertive');
        
        document.body.appendChild(this.captionContainer);
    }
    
    /**
     * 色彩インジケーターを作成
     * @private
     */
    createColorIndicator() {
        this.colorIndicator = document.createElement('div');
        this.colorIndicator.className = 'audio-accessibility-color-indicator';
        this.colorIndicator.style.cssText = `
            position: fixed;
            top: 50%;
            right: 10px;
            transform: translateY(-50%);
            width: 30px;
            height: 200px;
            background: linear-gradient(to top, #00ff00, #ffff00, #ff8000, #ff0000);
            border: 2px solid #ffffff;
            border-radius: 15px;
            z-index: 10000;
            display: none;
            transition: all 0.3s ease;
        `;
        this.colorIndicator.setAttribute('role', 'progressbar');
        this.colorIndicator.setAttribute('aria-label', '音響レベルインジケーター');
        
        // インジケーター内にレベル表示を追加
        const levelIndicator = document.createElement('div');
        levelIndicator.className = 'level-marker';
        levelIndicator.style.cssText = `
            position: absolute;
            left: -5px;
            width: 40px;
            height: 4px;
            background-color: #ffffff;
            border-radius: 2px;
            transition: bottom 0.1s ease;
            bottom: 0px;
        `;
        this.colorIndicator.appendChild(levelIndicator);
        
        document.body.appendChild(this.colorIndicator);
    }
    
    /**
     * 設定を読み込み
     * @private
     */
    loadSettings() {
        Object.keys(this.settings).forEach(key => {
            const value = this.configManager.get(`audio.accessibility.${key}`);
            if (value !== undefined) {
                this.settings[key] = value;
            }
        });
        
        this.applySettings();
    }
    
    /**
     * 設定を適用
     * @private
     */
    applySettings() {
        // 視覚的フィードバック
        if (this.settings.visualFeedback) {
            this.notificationContainer.style.display = 'block';
            this.colorIndicator.style.display = 'block';
        } else {
            this.notificationContainer.style.display = 'none';
            this.colorIndicator.style.display = 'none';
        }
        
        // 字幕
        if (this.settings.captioning) {
            // 字幕機能は個別に表示制御
        }
        
        // 高コントラスト
        if (this.settings.highContrast) {
            this.applyHighContrastMode();
        }
        
        // 大きなフォント
        if (this.settings.largeFonts) {
            this.applyLargeFonts();
        }
        
        // パターン認識
        this.patternRecognition.enabled = this.settings.patternRecognition;
    }
    
    /**
     * 高コントラストモードを適用
     * @private
     */
    applyHighContrastMode() {
        const style = document.createElement('style');
        style.id = 'audio-accessibility-high-contrast';
        style.textContent = `
            .audio-accessibility-notifications .notification {
                background-color: #000000 !important;
                color: #ffffff !important;
                border: 2px solid #ffffff !important;
            }
            .audio-accessibility-captions {
                background-color: #000000 !important;
                color: #ffffff !important;
                border: 2px solid #ffffff !important;
            }
        `;
        
        // 既存のスタイルを削除してから追加
        const existingStyle = document.getElementById('audio-accessibility-high-contrast');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        if (this.settings.highContrast) {
            document.head.appendChild(style);
        }
    }
    
    /**
     * 大きなフォントを適用
     * @private
     */
    applyLargeFonts() {
        const style = document.createElement('style');
        style.id = 'audio-accessibility-large-fonts';
        style.textContent = `
            .audio-accessibility-notifications .notification {
                font-size: 18px !important;
            }
            .audio-accessibility-captions {
                font-size: 22px !important;
            }
        `;
        
        // 既存のスタイルを削除してから追加
        const existingStyle = document.getElementById('audio-accessibility-large-fonts');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        if (this.settings.largeFonts) {
            document.head.appendChild(style);
        }
    }
    
    /**
     * 設定変更を監視
     * @private
     */
    setupConfigWatchers() {
        Object.keys(this.settings).forEach(key => {
            this.configManager.watch('audio', `accessibility.${key}`, (newValue) => {
                this.settings[key] = newValue;
                this.applySettings();
            });
        });
    }
    
    /**
     * 音響イベントリスナーを設定
     * @private
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
            if (!this.settings.visualFeedback && !this.settings.colorIndication) {
                setTimeout(monitorLoop, updateInterval);
                return;
            }
            
            // AudioVisualizerから音響レベルを取得
            const stats = this.audioManager.getVisualizationStatistics();
            if (stats) {
                this.updateColorIndicator(stats.averageLevel || 0);
            }
            
            setTimeout(monitorLoop, updateInterval);
        };
        
        monitorLoop();
    }
    
    /**
     * 色彩インジケーターを更新
     * @private
     * @param {number} level - 音響レベル (0-1)
     */
    updateColorIndicator(level) {
        if (!this.colorIndicator || !this.settings.colorIndication) return;
        
        const levelMarker = this.colorIndicator.querySelector('.level-marker');
        if (levelMarker) {
            const position = level * 196; // 200px - 4px (marker height)
            levelMarker.style.bottom = `${position}px`;
        }
        
        // アクセシビリティ属性を更新
        this.colorIndicator.setAttribute('aria-valuenow', Math.round(level * 100));
        this.colorIndicator.setAttribute('aria-valuetext', `音響レベル ${Math.round(level * 100)}%`);
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
                        component: 'AudioAccessibilitySupport',
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
     * @private
     * @param {Object} event - イベントデータ
     */
    handleBubblePopEvent(event) {
        const { bubbleType, comboLevel, position } = event;
        
        // 視覚的通知
        this.showVisualNotification({
            type: 'bubblePop',
            title: '泡破壊',
            message: `${bubbleType}泡を破壊`,
            icon: '🫧',
            color: this.getBubbleColor(bubbleType),
            position: position
        });
        
        // 字幕
        if (this.settings.captioning) {
            this.showCaption(`${bubbleType}泡を破壊しました`);
        }
    }
    
    /**
     * コンボイベントを処理
     * @private
     * @param {Object} event - イベントデータ
     */
    handleComboEvent(event) {
        const { comboLevel, comboCount } = event;
        
        // 視覚的通知
        this.showVisualNotification({
            type: 'combo',
            title: `${comboLevel}連鎖`,
            message: `${comboCount}コンボ達成！`,
            icon: '🔥',
            color: '#ff8000',
            duration: 2000
        });
        
        // 字幕
        if (this.settings.captioning) {
            this.showCaption(`${comboCount}コンボ達成！`);
        }
    }
    
    /**
     * 実績イベントを処理
     * @private
     * @param {Object} event - イベントデータ
     */
    handleAchievementEvent(event) {
        const { achievementName, rarity } = event;
        
        // 視覚的通知
        this.showVisualNotification({
            type: 'achievement',
            title: '実績解除',
            message: achievementName,
            icon: '🏆',
            color: this.getRarityColor(rarity),
            duration: 4000
        });
        
        // 字幕
        if (this.settings.captioning) {
            this.showCaption(`実績「${achievementName}」を解除しました！`);
        }
    }
    
    /**
     * ゲーム状態イベントを処理
     * @private
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
            this.showVisualNotification({
                type: 'gameState',
                title: stateInfo.title,
                message: details || '',
                icon: stateInfo.icon,
                color: stateInfo.color,
                duration: 3000
            });
            
            // 字幕
            if (this.settings.captioning) {
                this.showCaption(`${stateInfo.title}${details ? ': ' + details : ''}`);
            }
        }
    }
    
    /**
     * 視覚的通知を表示
     * @private
     * @param {Object} options - 通知オプション
     */
    showVisualNotification(options) {
        if (!this.settings.visualFeedback) return;
        
        const {
            type,
            title,
            message,
            icon = '🔊',
            color = '#00ffff',
            position = null,
            duration = 3000
        } = options;
        
        // 通知要素を作成
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background-color: rgba(0, 0, 0, 0.9);
            border: 2px solid ${color};
            border-radius: 8px;
            padding: 10px 15px;
            margin-bottom: 10px;
            color: ${color};
            font-size: 14px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            box-shadow: 0 0 10px ${color}33;
            animation: slideInLeft 0.3s ease-out;
            max-width: 300px;
        `;
        
        const content = document.createElement('div');
        content.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">${icon}</span>
                <div>
                    <div style="font-weight: bold;">${title}</div>
                    ${message ? `<div style="font-size: 12px; opacity: 0.8;">${message}</div>` : ''}
                </div>
            </div>
        `;
        notification.appendChild(content);
        
        // アクセシビリティ属性
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        
        // アニメーションスタイルを追加
        if (!document.querySelector('#audio-accessibility-animations')) {
            const style = document.createElement('style');
            style.id = 'audio-accessibility-animations';
            style.textContent = `
                @keyframes slideInLeft {
                    from {
                        transform: translateX(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutLeft {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(-100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // コンテナに追加
        this.notificationContainer.appendChild(notification);
        this.visualNotifications.push(notification);
        
        // 最大数を超えた場合は古い通知を削除
        while (this.visualNotifications.length > this.maxNotifications) {
            const oldNotification = this.visualNotifications.shift();
            if (oldNotification.parentNode) {
                this.removeNotification(oldNotification);
            }
        }
        
        // 自動削除
        setTimeout(() => {
            if (notification.parentNode) {
                this.removeNotification(notification);
            }
        }, duration);
    }
    
    /**
     * 通知を削除
     * @private
     * @param {HTMLElement} notification - 通知要素
     */
    removeNotification(notification) {
        notification.style.animation = 'slideOutLeft 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            const index = this.visualNotifications.indexOf(notification);
            if (index > -1) {
                this.visualNotifications.splice(index, 1);
            }
        }, 300);
    }
    
    /**
     * 字幕を表示
     * @private
     * @param {string} text - 字幕テキスト
     */
    showCaption(text) {
        if (!this.settings.captioning) return;
        
        // 字幕をキューに追加
        this.captionQueue.push(text);
        
        // 現在表示中でなければ表示開始
        if (this.captionContainer.style.display === 'none') {
            this.displayNextCaption();
        }
    }
    
    /**
     * 次の字幕を表示
     * @private
     */
    displayNextCaption() {
        if (this.captionQueue.length === 0) {
            this.captionContainer.style.display = 'none';
            return;
        }
        
        const text = this.captionQueue.shift();
        this.captionContainer.textContent = text;
        this.captionContainer.style.display = 'block';
        
        // アクセシビリティ属性を更新
        this.captionContainer.setAttribute('aria-label', `字幕: ${text}`);
        
        // 次の字幕表示までの時間
        setTimeout(() => {
            this.displayNextCaption();
        }, this.captionDuration);
    }
    
    /**
     * 泡の種類に応じた色を取得
     * @private
     * @param {string} bubbleType - 泡の種類
     * @returns {string} 色コード
     */
    getBubbleColor(bubbleType) {
        const colorMap = {
            normal: '#00ffff',
            stone: '#808080',
            iron: '#c0c0c0',
            diamond: '#b9f2ff',
            rainbow: '#ff00ff',
            pink: '#ff69b4',
            clock: '#ffd700',
            electric: '#ffff00',
            poison: '#800080',
            spiky: '#ff4500',
            boss: '#ff0000',
            golden: '#ffd700',
            frozen: '#87ceeb',
            magnetic: '#ff8c00',
            explosive: '#dc143c'
        };
        
        return colorMap[bubbleType] || '#00ffff';
    }
    
    /**
     * レアリティに応じた色を取得
     * @private
     * @param {string} rarity - レアリティ
     * @returns {string} 色コード
     */
    getRarityColor(rarity) {
        const colorMap = {
            common: '#ffffff',
            rare: '#0080ff',
            epic: '#8000ff',
            legendary: '#ff8000'
        };
        
        return colorMap[rarity] || '#ffffff';
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
            this.showVisualNotification({
                type: 'pattern',
                title: 'パターン認識',
                message: pattern.notification,
                icon: '🎯',
                color: '#ff00ff',
                duration: 4000
            });
            
            // 字幕
            if (this.settings.captioning) {
                this.showCaption(pattern.notification);
            }
            
            console.log(`Pattern recognized: ${patternName}`);
        }, 500);
    }
    
    /**
     * イベント履歴を取得
     * @returns {Array} イベント履歴
     */
    getEventHistory() {
        return this.eventHistory.slice(); // コピーを返す
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    getStatistics() {
        const eventCounts = {};
        this.eventHistory.forEach(event => {
            eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
        });
        
        return {
            settings: { ...this.settings },
            eventHistory: this.eventHistory.length,
            eventCounts: eventCounts,
            activeNotifications: this.visualNotifications.length,
            captionQueue: this.captionQueue.length,
            patternRecognition: {
                enabled: this.patternRecognition.enabled,
                patterns: this.patternRecognition.patterns.size,
                currentPatternLength: this.patternRecognition.currentPattern ? 
                    this.patternRecognition.currentPattern.length : 0
            }
        };
    }
    
    /**
     * リソースの解放
     */
    dispose() {
        // DOM要素を削除
        if (this.notificationContainer && this.notificationContainer.parentNode) {
            this.notificationContainer.parentNode.removeChild(this.notificationContainer);
        }
        
        if (this.captionContainer && this.captionContainer.parentNode) {
            this.captionContainer.parentNode.removeChild(this.captionContainer);
        }
        
        if (this.colorIndicator && this.colorIndicator.parentNode) {
            this.colorIndicator.parentNode.removeChild(this.colorIndicator);
        }
        
        // タイムアウトをクリア
        if (this.patternRecognition.patternTimeout) {
            clearTimeout(this.patternRecognition.patternTimeout);
        }
        
        // データをクリア
        this.visualNotifications = [];
        this.eventHistory = [];
        this.captionQueue = [];
        this.audioEventListeners.clear();
        this.patternRecognition.patterns.clear();
        
        console.log('AudioAccessibilitySupport disposed');
    }
}