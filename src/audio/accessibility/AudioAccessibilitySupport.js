/**
 * Audio Accessibility Support - Main Controller
 * 
 * 音響アクセシビリティ支援システム - Main Controller Pattern実装
 * 聴覚障害者向け支援機能の統合管理
 * 
 * Refactored: Phase F.4 - Main Controller Pattern
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { getConfigurationManager } from '../../core/ConfigurationManager.js';
import { getLocalizationManager } from '../../core/LocalizationManager.js';

// Import sub-components
import { AudioDescriptionManager } from './AudioDescriptionManager.js';
import { AudioCueManager } from './AudioCueManager.js';
import { AudioFeedbackManager } from './AudioFeedbackManager.js';
import { AudioSettingsManager } from './AudioSettingsManager.js';

/**
 * 音響アクセシビリティ支援クラス - Main Controller
 * Main Controller Patternを採用し、各専門コンポーネントを統制
 */
export class AudioAccessibilitySupport {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.configManager = getConfigurationManager();
        this.localizationManager = getLocalizationManager();
        this.errorHandler = getErrorHandler();
        
        // Initialize sub-components (dependency injection)
        this.descriptionManager = new AudioDescriptionManager(this);
        this.cueManager = new AudioCueManager(this);
        this.feedbackManager = new AudioFeedbackManager(this);
        this.settingsManager = new AudioSettingsManager(this);
        
        // Legacy compatibility properties
        this.vibrationManager = null; // Managed by feedbackManager
        this.visualNotifications = []; // Managed by feedbackManager
        this.eventHistory = [];
        this.maxHistorySize = 50;
        
        // Initialize legacy compatibility
        this.initializeLegacyCompatibility();
        
        console.log('AudioAccessibilitySupport initialized with Main Controller Pattern');
    }

    /**
     * 初期化（従来のAPIとの互換性維持）
     */
    async initialize() {
        try {
            // Settings initialization
            await this.settingsManager.initializeSettings();
            
            // Sub-components are already initialized in constructor
            console.log('Audio accessibility support fully initialized');
            
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'AudioAccessibilitySupport.initialize',
                severity: 'high'
            });
            return false;
        }
    }

    /**
     * レガシー互換性の初期化
     */
    initializeLegacyCompatibility() {
        // VibrationManagerの互換性設定
        this.vibrationManager = {
            vibrate: (pattern) => {
                const cue = { pattern: 'custom', vibrationPattern: pattern };
                this.feedbackManager.applyTactileFeedback(cue);
            },
            isSupported: () => 'vibrate' in navigator
        };
        
        // 設定変更の監視
        this.settingsManager.addChangeListener((event) => {
            this.handleSettingsChange(event);
        });
    }

    // ========================================
    // Public API Methods (delegation to sub-components)
    // ========================================

    /**
     * 視覚的通知の表示（FeedbackManagerに委譲）
     * @param {string} message - 通知メッセージ
     * @param {string} type - 通知タイプ
     * @param {Object} options - 表示オプション
     */
    showVisualNotification(message, type = 'info', options = {}) {
        this.feedbackManager.showVisualNotification(message, type, options);
        
        // イベント履歴に記録
        this.recordEvent('visual_notification', { message, type, options });
    }

    /**
     * 字幕の表示（FeedbackManagerに委譲）
     * @param {string} text - 字幕テキスト
     * @param {Object} options - 表示オプション
     */
    showCaption(text, options = {}) {
        this.feedbackManager.showCaption(text, options);
        this.recordEvent('caption', { text, options });
    }

    /**
     * 音声説明の追加（DescriptionManagerに委譲）
     * @param {string} category - 説明カテゴリ
     * @param {string} type - 説明タイプ
     * @param {Object} params - パラメータ
     * @param {number} priority - 優先度
     */
    addAudioDescription(category, type, params = {}, priority = 3) {
        this.descriptionManager.addDescription(category, type, params, priority);
        this.recordEvent('audio_description', { category, type, params, priority });
    }

    /**
     * 音響イベントの処理（CueManagerに委譲）
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     * @param {Object} audioData - 音響データ
     */
    processAudioEvent(eventType, eventData = {}, audioData = {}) {
        this.cueManager.processAudioEvent(eventType, eventData, audioData);
        this.recordEvent('audio_event', { eventType, eventData, audioData });
    }

    /**
     * 色彩インジケーターの更新（FeedbackManagerに委譲）
     * @param {string} level - 音量レベル
     * @param {Object} options - 表示オプション
     */
    updateColorIndicator(level, options = {}) {
        this.feedbackManager.updateColorIndicator(level, options);
        this.recordEvent('color_indicator', { level, options });
    }

    /**
     * 触覚フィードバックのトリガー（FeedbackManagerに委譲）
     * @param {string} type - フィードバックタイプ
     */
    triggerHapticFeedback(type) {
        this.feedbackManager.triggerVibration(type);
        this.recordEvent('haptic_feedback', { type });
    }

    // ========================================
    // Settings Management (delegation to SettingsManager)
    // ========================================

    /**
     * 設定の取得（SettingsManagerに委譲）
     * @returns {Object} 現在の設定
     */
    getSettings() {
        return this.settingsManager.getSettings();
    }

    /**
     * 設定の更新（SettingsManagerに委譲）
     * @param {Object} newSettings - 新しい設定
     */
    async updateSettings(newSettings) {
        await this.settingsManager.updateSettings(newSettings);
    }

    /**
     * 単一設定の更新（SettingsManagerに委譲）
     * @param {string} key - 設定キー
     * @param {*} value - 設定値
     */
    async updateSetting(key, value) {
        await this.settingsManager.updateSetting(key, value);
    }

    /**
     * 設定のリセット（SettingsManagerに委譲）
     * @param {Array<string>} keys - リセットするキー
     */
    async resetSettings(keys = null) {
        await this.settingsManager.resetSettings(keys);
    }

    // ========================================
    // Legacy Compatibility Methods
    // ========================================

    /**
     * 振動の実行（レガシー互換性）
     * @param {Array|number} pattern - 振動パターン
     */
    vibrate(pattern) {
        if (this.vibrationManager) {
            this.vibrationManager.vibrate(pattern);
        }
    }

    /**
     * 音響強度の設定（レガシー互換性）
     * @param {number} intensity - 強度 (0-1)
     */
    setAudioIntensity(intensity) {
        const level = this.mapIntensityToLevel(intensity);
        this.updateColorIndicator(level);
    }

    /**
     * パターン認識の有効化（レガシー互換性）
     * @param {boolean} enabled - 有効化フラグ
     */
    enablePatternRecognition(enabled) {
        this.updateSetting('patternRecognition', enabled);
    }

    /**
     * アクセシビリティ機能の一括有効化
     * @param {boolean} enabled - 有効化フラグ
     */
    async enableAccessibilityFeatures(enabled) {
        const settings = {
            visualFeedback: enabled,
            captioning: enabled,
            colorIndication: enabled,
            hapticFeedback: enabled && 'vibrate' in navigator,
            descriptionEnabled: enabled && 'speechSynthesis' in window
        };
        
        await this.updateSettings(settings);
    }

    // ========================================
    // Event and History Management
    // ========================================

    /**
     * イベントの記録
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     */
    recordEvent(eventType, eventData) {
        const event = {
            id: this.generateEventId(),
            type: eventType,
            data: eventData,
            timestamp: Date.now()
        };
        
        this.eventHistory.push(event);
        
        // 履歴サイズの制限
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    /**
     * イベント履歴の取得
     * @param {number} limit - 取得件数制限
     * @returns {Array} イベント履歴
     */
    getEventHistory(limit = null) {
        const history = [...this.eventHistory];
        return limit ? history.slice(-limit) : history;
    }

    /**
     * イベント履歴のクリア
     */
    clearEventHistory() {
        this.eventHistory = [];
    }

    // ========================================
    // Status and Information Methods
    // ========================================

    /**
     * 全体の状態取得
     * @returns {Object} システム全体の状態
     */
    getStatus() {
        return {
            initialized: true,
            components: {
                descriptionManager: this.descriptionManager.getStatus(),
                cueManager: this.cueManager.getStatus(),
                feedbackManager: this.feedbackManager.getStatus(),
                settingsManager: this.settingsManager.getStatus()
            },
            eventHistorySize: this.eventHistory.length,
            capabilities: this.getCapabilities(),
            settings: this.getSettings()
        };
    }

    /**
     * デバイス機能の取得
     * @returns {Object} デバイス機能情報
     */
    getCapabilities() {
        return {
            vibrationSupported: 'vibrate' in navigator,
            speechSynthesisSupported: 'speechSynthesis' in window,
            visualFeedbackSupported: typeof document !== 'undefined',
            highContrastSupported: window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches,
            reducedMotionSupported: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        };
    }

    /**
     * 統計情報の取得
     * @returns {Object} 使用統計
     */
    getStatistics() {
        const eventsByType = {};
        this.eventHistory.forEach(event => {
            eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
        });
        
        return {
            totalEvents: this.eventHistory.length,
            eventsByType: eventsByType,
            uptime: Date.now() - this.initializationTime,
            componentsActive: 4,
            settingsConfigured: Object.keys(this.getSettings()).length
        };
    }

    // ========================================
    // Private Helper Methods
    // ========================================

    /**
     * 設定変更の処理
     * @param {Object} event - 設定変更イベント
     */
    handleSettingsChange(event) {
        this.recordEvent('settings_change', event);
        
        // 必要に応じて追加の処理
        if (event.type === 'single' && event.key === 'vibrationIntensity') {
            // 振動強度変更時の即座テスト
            this.triggerHapticFeedback('notification');
        }
    }

    /**
     * 強度からレベルへのマッピング
     * @param {number} intensity - 強度 (0-1)
     * @returns {string} レベル
     */
    mapIntensityToLevel(intensity) {
        if (intensity >= 0.9) return 'critical';
        if (intensity >= 0.7) return 'high';
        if (intensity >= 0.4) return 'medium';
        return 'low';
    }

    /**
     * イベントIDの生成
     * @returns {string} ユニークなイベントID
     */
    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ========================================
    // Lifecycle Management
    // ========================================

    /**
     * クリーンアップ
     */
    destroy() {
        // Sub-components cleanup
        if (this.descriptionManager) {
            this.descriptionManager.destroy();
        }
        
        if (this.cueManager) {
            this.cueManager.destroy();
        }
        
        if (this.feedbackManager) {
            this.feedbackManager.destroy();
        }
        
        if (this.settingsManager) {
            this.settingsManager.destroy();
        }
        
        // Clear event history
        this.eventHistory = [];
        
        console.log('AudioAccessibilitySupport destroyed');
    }

    /**
     * 再初期化
     */
    async reinitialize() {
        this.destroy();
        await this.initialize();
    }
}