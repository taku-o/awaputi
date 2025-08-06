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
import { AudioEventManager } from './AudioEventManager.js';
import { AudioLegacyAdapter } from './AudioLegacyAdapter.js';

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
        this.eventManager = new AudioEventManager(this);
        this.legacyAdapter = new AudioLegacyAdapter(this);
        
        // Legacy compatibility properties
        this.vibrationManager = this.legacyAdapter.getVibrationManager();
        this.visualNotifications = []; // Managed by feedbackManager
        
        console.log('AudioAccessibilitySupport initialized with Main Controller Pattern');
    }

    /**
     * 初期化（従来のAPIとの互換性維持）
     */
    async initialize() {
        try {
            // Settings initialization
            await this.settingsManager.initializeSettings();
            
            // Setup event listeners
            this.setupEventListeners();
            
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
     * 初期化後の設定
     */
    setupEventListeners() {
        // 設定変更の監視
        this.settingsManager.addChangeListener((event) => {
            this.legacyAdapter.handleSettingsChange(event);
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
        this.eventManager.recordEvent('visual_notification', { message, type, options });
    }

    /**
     * 字幕の表示（FeedbackManagerに委譲）
     * @param {string} text - 字幕テキスト
     * @param {Object} options - 表示オプション
     */
    showCaption(text, options = {}) {
        this.feedbackManager.showCaption(text, options);
        this.eventManager.recordEvent('caption', { text, options });
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
        this.eventManager.recordEvent('audio_description', { category, type, params, priority });
    }

    /**
     * 音響イベントの処理（CueManagerに委譲）
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     * @param {Object} audioData - 音響データ
     */
    processAudioEvent(eventType, eventData = {}, audioData = {}) {
        this.cueManager.processAudioEvent(eventType, eventData, audioData);
        this.eventManager.recordEvent('audio_event', { eventType, eventData, audioData });
    }

    /**
     * 色彩インジケーターの更新（FeedbackManagerに委譲）
     * @param {string} level - 音量レベル
     * @param {Object} options - 表示オプション
     */
    updateColorIndicator(level, options = {}) {
        this.feedbackManager.updateColorIndicator(level, options);
        this.eventManager.recordEvent('color_indicator', { level, options });
    }

    /**
     * 触覚フィードバックのトリガー（FeedbackManagerに委譲）
     * @param {string} type - フィードバックタイプ
     */
    triggerHapticFeedback(type) {
        this.feedbackManager.triggerVibration(type);
        this.eventManager.recordEvent('haptic_feedback', { type });
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
    // Legacy Compatibility Methods (delegated)
    // ========================================

    /**
     * 振動の実行（レガシー互換性）
     * @param {Array|number} pattern - 振動パターン
     */
    vibrate(pattern) {
        this.legacyAdapter.vibrate(pattern);
    }

    /**
     * 音響強度の設定（レガシー互換性）
     * @param {number} intensity - 強度 (0-1)
     */
    setAudioIntensity(intensity) {
        this.legacyAdapter.setAudioIntensity(intensity);
    }

    /**
     * パターン認識の有効化（レガシー互換性）
     * @param {boolean} enabled - 有効化フラグ
     */
    enablePatternRecognition(enabled) {
        this.legacyAdapter.enablePatternRecognition(enabled);
    }

    /**
     * アクセシビリティ機能の一括有効化
     * @param {boolean} enabled - 有効化フラグ
     */
    async enableAccessibilityFeatures(enabled) {
        await this.legacyAdapter.enableAccessibilityFeatures(enabled);
    }

    // ========================================
    // Event Management (delegated)
    // ========================================

    /**
     * イベント履歴の取得
     * @param {number} limit - 取得件数制限
     * @returns {Array} イベント履歴
     */
    getEventHistory(limit = null) {
        return this.eventManager.getEventHistory(limit);
    }

    /**
     * イベント履歴のクリア
     */
    clearEventHistory() {
        this.eventManager.clearEventHistory();
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
                settingsManager: this.settingsManager.getStatus(),
                eventManager: this.eventManager.getStatus(),
                legacyAdapter: this.legacyAdapter.getStatus()
            },
            eventHistorySize: this.eventManager.getEventHistory().length,
            capabilities: this.getCapabilities(),
            settings: this.getSettings()
        };
    }

    /**
     * デバイス機能の取得
     * @returns {Object} デバイス機能情報
     */
    getCapabilities() {
        return this.legacyAdapter.getCapabilities();
    }

    /**
     * 統計情報の取得
     * @returns {Object} 使用統計
     */
    getStatistics() {
        const eventStats = this.eventManager.getStatistics();
        
        return {
            ...eventStats,
            componentsActive: 6,
            settingsConfigured: Object.keys(this.getSettings()).length
        };
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
        
        if (this.eventManager) {
            this.eventManager.destroy();
        }
        
        if (this.legacyAdapter) {
            this.legacyAdapter.destroy();
        }
        
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