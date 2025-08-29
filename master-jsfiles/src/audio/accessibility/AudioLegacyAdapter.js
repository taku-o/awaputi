/**
 * Audio Legacy Adapter Component
 * 
 * レガシーAPI互換性とヘルパーメソッドを提供
 * Main Controller Patternの一部として設計
 */

export class AudioLegacyAdapter {
    constructor(mainController) {
        this.mainController = mainController;
        this.vibrationManager = null;
        
        this.initializeVibrationManager();
    }

    /**
     * VibrationManagerの互換性設定
     */
    initializeVibrationManager() {
        this.vibrationManager = {
            vibrate: (pattern) => {
                const cue = { pattern: 'custom', vibrationPattern: pattern };
                this.mainController.feedbackManager.applyTactileFeedback(cue);
            },
            isSupported: () => 'vibrate' in navigator
        };
    }

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
        this.mainController.updateColorIndicator(level);
    }

    /**
     * パターン認識の有効化（レガシー互換性）
     * @param {boolean} enabled - 有効化フラグ
     */
    enablePatternRecognition(enabled) {
        this.mainController.updateSetting('patternRecognition', enabled);
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
        
        await this.mainController.updateSettings(settings);
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
     * 設定変更の処理
     * @param {Object} event - 設定変更イベント
     */
    handleSettingsChange(event) {
        this.mainController.eventManager.recordEvent('settings_change', event);
        
        // 必要に応じて追加の処理
        if (event.type === 'single' && event.key === 'vibrationIntensity') {
            // 振動強度変更時の即座テスト
            this.mainController.triggerHapticFeedback('notification');
        }
    }

    /**
     * VibrationManagerの取得
     * @returns {Object} VibrationManager
     */
    getVibrationManager() {
        return this.vibrationManager;
    }

    /**
     * ステータス取得
     * @returns {Object} コンポーネントステータス
     */
    getStatus() {
        return {
            vibrationManagerAvailable: this.vibrationManager !== null,
            capabilities: this.getCapabilities()
        };
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.vibrationManager = null;
    }
}