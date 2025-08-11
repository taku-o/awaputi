import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { getLocalizationManager } from '../core/LocalizationManager.js';
import { AudioDescriptionManager } from './accessibility/AudioDescriptionManager.js';
import { AudioCueManager } from './accessibility/AudioCueManager.js';
import { AudioFeedbackManager } from './accessibility/AudioFeedbackManager.js';
import { AudioSettingsManager } from './accessibility/AudioSettingsManager.js';

/**
 * 音響アクセシビリティ支援クラス - 聴覚障害者向け支援機能
 * Main Controller Pattern実装 - サブコンポーネントを統制して包括的なアクセシビリティサポートを提供
 * 
 * **Architecture**: Main Controller Pattern
 * - **AudioDescriptionManager**: 音声説明生成・管理機能
 * - **AudioCueManager**: 音響キュー生成・パターン認識機能
 * - **AudioFeedbackManager**: 視覚通知・ユーザーフィードバック機能
 * - **AudioSettingsManager**: アクセシビリティ設定・永続化機能
 * 
 * **Accessibility Features**:
 * - Visual notifications for audio events
 * - Haptic feedback integration (vibration patterns)
 * - Color-coded audio level indicators  
 * - Caption system for audio descriptions
 * - Pattern recognition for complex audio sequences
 * 
 * **Usage Examples**:
 * ```javascript
 * const accessibilitySupport = new AudioAccessibilitySupport(audioManager);
 * await accessibilitySupport.initialize();
 * 
 * // Show visual notification for audio event
 * accessibilitySupport.showVisualNotification({
 *   type: 'bubble_pop', 
 *   data: { bubbleType: 'special', score: 100 }
 * });
 * 
 * // Trigger haptic feedback
 * accessibilitySupport.triggerHapticFeedback('bubble_pop', { intensity: 0.8 });
 * ```
 * 
 * **WCAG 2.1 AA Compliance**:
 * - Provides alternative audio representations
 * - Supports assistive technology integration
 * - Maintains keyboard navigation compatibility
 * - Ensures color contrast accessibility
 * 
 * @class AudioAccessibilitySupport  
 * @version 2.0.0 (Phase F.4 - Main Controller Pattern)
 * @since Original implementation - Enhanced with component architecture
 */
export class MainAudioAccessibilitySupport {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.configManager = getConfigurationManager();
        this.localizationManager = getLocalizationManager();
        this.errorHandler = getErrorHandler();
        
        // Main Controller Pattern: サブコンポーネント管理
        this.audioDescriptionManager = new AudioDescriptionManager(this);
        this.audioCueManager = new AudioCueManager(this);
        this.audioFeedbackManager = new AudioFeedbackManager(this);
        this.audioSettingsManager = new AudioSettingsManager(this);
        
        // 下位互換性のためのプロパティ（Component delegationで管理）
        this.settings = this.audioSettingsManager.settings;
        
        // コンポーネント初期化
        this.initialize();
    }
    
    /**
     * 初期化（Main Controller Pattern）
     */
    initialize() {
        try {
            // コンポーネント初期化
            this.audioDescriptionManager.createNotificationContainer();
            this.audioDescriptionManager.createCaptionContainer();
            this.audioFeedbackManager.createColorIndicator();
            this.audioFeedbackManager.initializeVibrationManager();
            
            // 設定管理コンポーネント初期化
            this.audioSettingsManager.loadSettings();
            this.audioSettingsManager.setupConfigWatchers();
            
            // オーディオキュー管理初期化
            this.audioCueManager.setupAudioEventListeners();
            
            console.log('AudioAccessibilitySupport initialized with component architecture');
        } catch (error) {
            this.errorHandler.handleError(error, 'ACCESSIBILITY_ERROR', {
                component: 'AudioAccessibilitySupport',
                operation: 'initialize'
            });
        }
    }
    
    // DOM Creation methods delegated to components
    // createNotificationContainer, createCaptionContainer, createColorIndicator are now handled by respective components
    
    // Settings methods delegated to AudioSettingsManager component
    // loadSettings, applySettings, setupConfigWatchers are now handled by AudioSettingsManager
    
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
                
                // 音響レベルに基づく触覚フィードバック
                if (this.settings.hapticFeedback) {
                    this.triggerAudioLevelVibration(stats.averageLevel || 0, 'background');
                }
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
        
        // 触覚フィードバック
        if (this.settings.hapticFeedback && this.vibrationManager) {
            this.triggerHapticFeedback('bubblePop', event);
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
        
        // 触覚フィードバック
        if (this.settings.hapticFeedback && this.vibrationManager) {
            this.triggerHapticFeedback('comboAchieved', event);
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
        
        // 触覚フィードバック
        if (this.settings.hapticFeedback && this.vibrationManager) {
            this.triggerHapticFeedback('achievementUnlocked', event);
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
            
            // 触覚フィードバック
            if (this.settings.hapticFeedback && this.vibrationManager) {
                this.triggerHapticFeedback('gameStateChange', { state, ...event });
            }
        }
    }
    
    /**
     * 視覚的通知を表示（AudioDescriptionManagerへ委託）
     * @param {Object} options - 通知オプション
     */
    showVisualNotification(options) {
        return this.audioDescriptionManager.showVisualNotification(options);
    }
    
    /**
     * 字幕を表示（AudioDescriptionManagerへ委託）
     * @param {string} text - 字幕テキスト
     */
    showCaption(text) {
        return this.audioDescriptionManager.showCaption(text);
    }
    
    // Color indicator methods delegated to AudioDescriptionManager
    getBubbleColor(bubbleType) { return this.audioDescriptionManager.getBubbleColor(bubbleType); }
    getRarityColor(rarity) { return this.audioDescriptionManager.getRarityColor(rarity); }
    
    /**
     * 触覚フィードバックをトリガー（AudioFeedbackManagerへ委託）
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     */
    triggerHapticFeedback(eventType, eventData) {
        return this.audioFeedbackManager.triggerHapticFeedback(eventType, eventData);
    }
    
    /**
     * 音響レベルに基づく触覚フィードバック（AudioFeedbackManagerへ委託）
     * @param {number} audioLevel - 音響レベル (0-1)
     * @param {string} audioType - 音響タイプ
     */
    triggerAudioLevelVibration(audioLevel, audioType = 'general') {
        return this.audioFeedbackManager.triggerAudioLevelVibration(audioLevel, audioType);
    }
    
    // Additional delegation methods for component integration
    synchronizeWithBGMRhythm(rhythmData) { return this.audioFeedbackManager.synchronizeWithBGMRhythm(rhythmData); }
    triggerSpecialEffectVibration(effectType, effectData) { return this.audioFeedbackManager.triggerSpecialEffectVibration(effectType, effectData); }
    updateHapticSettings(settings) { return this.audioFeedbackManager.updateHapticSettings(settings); }
    getEventHistory() { return this.audioCueManager.getEventHistory(); }
    getStatistics() { return this.audioCueManager.getStatistics(); }
    
    // Settings Management - Delegated to AudioSettingsManager
    updateSetting(key, value) { return this.audioSettingsManager.updateSetting(key, value); }
    getSetting(key) { return this.audioSettingsManager.getSetting(key); }
    getAllSettings() { return this.audioSettingsManager.getAllSettings(); }
    resetSettings() { return this.audioSettingsManager.resetSettings(); }
    exportSettings() { return this.audioSettingsManager.exportSettings(); }
    importSettings(settingsData) { return this.audioSettingsManager.importSettings(settingsData); }
    validateSettings(settings) { return this.audioSettingsManager.validateSettings(settings); }
    
    /**
     * リソースの解放（Main Controller Pattern）
     */
    dispose() {
        // コンポーネントの解放
        if (this.audioDescriptionManager) {
            this.audioDescriptionManager.dispose();
        }
        
        if (this.audioCueManager) {
            this.audioCueManager.dispose();
        }
        
        if (this.audioFeedbackManager) {
            this.audioFeedbackManager.dispose();
        }
        
        if (this.audioSettingsManager) {
            this.audioSettingsManager.dispose();
        }
        
        console.log('AudioAccessibilitySupport disposed with component architecture');
    }
}