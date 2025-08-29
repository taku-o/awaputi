/**
 * Audio Legacy Adapter Component
 * 
 * レガシーAPI互換性とヘルパーメソッドを提供
 * Main Controller Patternの一部として設計
 */

// インターフェース定義
interface VibrationManager {
    vibrate(pattern: number | number[]): void;
    isSupported(): boolean;
}

interface MainController {
    feedbackManager: {
        applyTactileFeedback(cue: { pattern: string; vibrationPattern: number | number[] }): void;
    };
    updateColorIndicator(level: string): void;
    updateSetting(key: string, value: any): void;
    updateSettings(settings: object): Promise<void>;
    eventManager: {
        recordEvent(type: string, event: any): void;
    };
    triggerHapticFeedback(type: string): void;
}

interface DeviceCapabilities {
    vibrationSupported: boolean;
    speechSynthesisSupported: boolean;
    visualFeedbackSupported: boolean;
    highContrastSupported: boolean;
    reducedMotionSupported: boolean;
}

interface ComponentStatus {
    vibrationManagerAvailable: boolean;
    capabilities: DeviceCapabilities;
}

interface SettingsChangeEvent {
    type: string;
    key?: string;
    value?: any;
}

export class AudioLegacyAdapter {
    private mainController: MainController;
    private vibrationManager: VibrationManager | null;

    constructor(mainController: MainController) {
        this.mainController = mainController;
        this.vibrationManager = null;
        
        this.initializeVibrationManager();
    }

    /**
     * VibrationManagerの互換性設定
     */
    private initializeVibrationManager(): void {
        this.vibrationManager = {
            vibrate: (pattern: number | number[]) => {
                const cue = { pattern: 'custom', vibrationPattern: pattern };
                this.mainController.feedbackManager.applyTactileFeedback(cue);
            },
            isSupported: () => 'vibrate' in navigator
        };
    }

    /**
     * 振動の実行（レガシー互換性）
     * @param pattern - 振動パターン
     */
    vibrate(pattern: number | number[]): void {
        if (this.vibrationManager) {
            this.vibrationManager.vibrate(pattern);
        }
    }

    /**
     * 音響強度の設定（レガシー互換性）
     * @param intensity - 強度 (0-1)
     */
    setAudioIntensity(intensity: number): void {
        const level = this.mapIntensityToLevel(intensity);
        this.mainController.updateColorIndicator(level);
    }

    /**
     * パターン認識の有効化（レガシー互換性）
     * @param enabled - 有効化フラグ
     */
    enablePatternRecognition(enabled: boolean): void {
        this.mainController.updateSetting('patternRecognition', enabled);
    }

    /**
     * アクセシビリティ機能の一括有効化
     * @param enabled - 有効化フラグ
     */
    async enableAccessibilityFeatures(enabled: boolean): Promise<void> {
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
     * @param intensity - 強度 (0-1)
     * @returns レベル
     */
    private mapIntensityToLevel(intensity: number): string {
        if (intensity >= 0.9) return 'critical';
        if (intensity >= 0.7) return 'high';
        if (intensity >= 0.4) return 'medium';
        return 'low';
    }

    /**
     * デバイス機能の取得
     * @returns デバイス機能情報
     */
    getCapabilities(): DeviceCapabilities {
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
     * @param event - 設定変更イベント
     */
    handleSettingsChange(event: SettingsChangeEvent): void {
        this.mainController.eventManager.recordEvent('settings_change', event);
        
        // 必要に応じて追加の処理
        if (event.type === 'single' && event.key === 'vibrationIntensity') {
            // 振動強度変更時の即座テスト
            this.mainController.triggerHapticFeedback('notification');
        }
    }

    /**
     * VibrationManagerの取得
     * @returns VibrationManager
     */
    getVibrationManager(): VibrationManager | null {
        return this.vibrationManager;
    }

    /**
     * ステータス取得
     * @returns コンポーネントステータス
     */
    getStatus(): ComponentStatus {
        return {
            vibrationManagerAvailable: this.vibrationManager !== null,
            capabilities: this.getCapabilities()
        };
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        this.vibrationManager = null;
    }
}