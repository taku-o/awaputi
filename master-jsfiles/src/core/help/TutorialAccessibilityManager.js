/**
 * TutorialAccessibilityManager.js
 * チュートリアルシステムのアクセシビリティ機能管理クラス
 * アクセシビリティ設定、簡素化モード、スクリーンリーダー対応を担当
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { LoggingSystem } from '../LoggingSystem.js';

/**
 * チュートリアルアクセシビリティ管理クラス
 */
export class TutorialAccessibilityManager {
    constructor(accessibilityManager, loggingSystem) {
        this.accessibilityManager = accessibilityManager;
        this.loggingSystem = loggingSystem || LoggingSystem.getInstance();
        
        // アクセシビリティ設定
        this.config = {
            enabled: false,
            highContrast: false,
            largeText: false,
            screenReaderMode: false,
            cognitiveAssistance: false,
            alternativeInput: false,
            voiceInstructions: false,
            extendedTimeouts: false,
            simplifiedMode: false,
            keyboardNavigation: true,
            focusIndicators: true,
            reducedMotion: false,
            audioDescriptions: false
        };
        
        this.initialize();
    }
    
    /**
     * アクセシビリティマネージャーを初期化
     */
    initialize() {
        try {
            // AccessibilityManagerから設定を取得
            if (this.accessibilityManager) {
                const systemPrefs = this.accessibilityManager.getConfiguration();
                
                // システム設定に基づいてデフォルト値を更新
                if (systemPrefs) {
                    this.config.highContrast = systemPrefs.highContrast || false;
                    this.config.largeText = systemPrefs.largeText || false;
                    this.config.screenReaderMode = systemPrefs.screenReader || false;
                    this.config.reducedMotion = systemPrefs.reducedMotion || false;
                }
                
                // AccessibilityManagerのイベントリスナーを設定
                this.accessibilityManager.addEventListener('settingsChanged', (event) => {
                    this.handleAccessibilitySettingsChange(event.detail);
                });
            }
            
            this.loggingSystem.log('アクセシビリティ機能が初期化されました', 'info', 'TutorialAccessibilityManager');
        } catch (error) {
            this.loggingSystem.log(`アクセシビリティ初期化エラー: ${error.message}`, 'error', 'TutorialAccessibilityManager');
        }
    }
    
    /**
     * アクセシビリティ設定を更新
     * @param {Object} accessibilityConfig - 新しいアクセシビリティ設定
     */
    updateConfig(accessibilityConfig) {
        try {
            this.config = { ...this.config, ...accessibilityConfig };
            
            // AccessibilityManagerと連携
            if (this.accessibilityManager) {
                this.accessibilityManager.emit('tutorialAccessibilityUpdated', {
                    config: this.config,
                    source: 'TutorialAccessibilityManager'
                });
            }
            
            this.loggingSystem.log('アクセシビリティ設定が更新されました', 'info', 'TutorialAccessibilityManager');
            
            return this.config;
        } catch (error) {
            this.loggingSystem.log(`アクセシビリティ設定更新エラー: ${error.message}`, 'error', 'TutorialAccessibilityManager');
            throw error;
        }
    }
    
    /**
     * チュートリアルにアクセシビリティ設定を適用
     * @param {Object} tutorialOverlay - チュートリアルオーバーレイ
     * @param {Object} tutorialConfig - チュートリアル設定
     */
    applyToTutorial(tutorialOverlay, tutorialConfig) {
        if (!tutorialOverlay || !this.config.enabled) {
            return tutorialConfig;
        }

        try {
            // TutorialOverlayにアクセシビリティ設定を渡す
            tutorialOverlay.updateAccessibilitySettings({
                highContrast: this.config.highContrast,
                largeText: this.config.largeText,
                screenReaderMode: this.config.screenReaderMode,
                reducedMotion: this.config.reducedMotion,
                keyboardNavigation: this.config.keyboardNavigation,
                focusIndicators: this.config.focusIndicators
            });
            
            // 拡張タイムアウトの適用
            const updatedConfig = { ...tutorialConfig };
            if (this.config.extendedTimeouts) {
                updatedConfig.defaultTimeout = (tutorialConfig.defaultTimeout || 30000) * 2;
                updatedConfig.autoAdvanceDelay = (tutorialConfig.autoAdvanceDelay || 1000) * 1.5;
            }
            
            // 簡素化モードの場合、自動進行を無効化
            if (this.config.simplifiedMode) {
                updatedConfig.autoAdvance = false;
            }
            
            return updatedConfig;
            
        } catch (error) {
            this.loggingSystem.log(`アクセシビリティ適用エラー: ${error.message}`, 'error', 'TutorialAccessibilityManager');
            return tutorialConfig;
        }
    }
    
    /**
     * チュートリアルステップを簡素化
     * @param {Object} tutorial - チュートリアルオブジェクト
     * @returns {Object} 簡素化されたチュートリアル
     */
    applySimplifiedMode(tutorial) {
        if (!tutorial || !this.config.simplifiedMode) {
            return tutorial;
        }

        try {
            // ステップの内容を簡素化
            const simplifiedTutorial = {
                ...tutorial,
                steps: tutorial.steps.map(step => ({
                    ...step,
                    content: this.simplifyStepContent(step.content),
                    // 複雑な検証を簡略化
                    validation: step.validation ? this.simplifyValidation(step.validation) : null,
                    // より長いタイムアウト
                    timeout: (step.timeout || 30000) * 1.5
                }))
            };
            
            this.loggingSystem.log('簡素化モードが適用されました', 'info', 'TutorialAccessibilityManager');
            return simplifiedTutorial;
        } catch (error) {
            this.loggingSystem.log(`簡素化モード適用エラー: ${error.message}`, 'error', 'TutorialAccessibilityManager');
            return tutorial;
        }
    }
    
    /**
     * ステップ内容を簡素化
     * @param {string} content - 元の内容
     * @returns {string} 簡素化された内容
     */
    simplifyStepContent(content) {
        if (!content || typeof content !== 'string') return content;
        
        try {
            // 長い文章を短縮
            const sentences = content.split('。').filter(s => s.trim());
            if (sentences.length <= 2) return content;
            
            // 最初の1-2文のみ使用
            const simplified = sentences.slice(0, 2).join('。') + '。';
            return simplified;
        } catch (error) {
            return content; // エラー時は元の内容を返す
        }
    }
    
    /**
     * 検証を簡略化
     * @param {Function|Object} validation - 元の検証
     * @returns {Function|Object} 簡略化された検証
     */
    simplifyValidation(validation) {
        // 複雑な検証を簡単な検証に置き換え
        if (typeof validation === 'function') {
            return () => true; // 常に成功とする
        }
        
        if (validation && typeof validation === 'object') {
            return { ...validation, strict: false, tolerance: 'high' };
        }
        
        return validation;
    }
    
    /**
     * アクセシビリティ設定変更の処理
     * @param {Object} newSettings - 新しい設定
     */
    handleAccessibilitySettingsChange(newSettings) {
        try {
            this.updateConfig(newSettings);
            
            // 音声アナウンス（スクリーンリーダー対応）
            if (this.config.screenReaderMode) {
                this.announceSettingsChange(newSettings);
            }
            
        } catch (error) {
            this.loggingSystem.log(`設定変更処理エラー: ${error.message}`, 'error', 'TutorialAccessibilityManager');
        }
    }
    
    /**
     * 設定変更を音声でアナウンス
     * @param {Object} settings - 変更された設定
     */
    announceSettingsChange(settings) {
        try {
            const changes = [];
            
            if (settings.highContrast !== undefined) {
                changes.push(settings.highContrast ? '高コントラストモードが有効になりました' : '高コントラストモードが無効になりました');
            }
            
            if (settings.largeText !== undefined) {
                changes.push(settings.largeText ? '大きな文字表示が有効になりました' : '大きな文字表示が無効になりました');
            }
            
            if (settings.simplifiedMode !== undefined) {
                changes.push(settings.simplifiedMode ? '簡素化モードが有効になりました' : '簡素化モードが無効になりました');
            }
            
            if (changes.length > 0 && this.accessibilityManager) {
                const announcement = changes.join('。');
                this.accessibilityManager.emit('announceToScreenReader', { message: announcement });
            }
            
        } catch (error) {
            this.loggingSystem.log(`音声アナウンスエラー: ${error.message}`, 'error', 'TutorialAccessibilityManager');
        }
    }
    
    /**
     * アクセシビリティが有効かどうかを確認
     * @returns {boolean} アクセシビリティの有効状態
     */
    isEnabled() {
        return this.config.enabled;
    }
    
    /**
     * アクセシビリティ設定を取得
     * @returns {Object} 現在のアクセシビリティ設定
     */
    getConfig() {
        return { ...this.config };
    }
    
    /**
     * リソースをクリーンアップ
     */
    destroy() {
        try {
            // イベントリスナーの削除
            if (this.accessibilityManager) {
                this.accessibilityManager.removeEventListener('settingsChanged', this.handleAccessibilitySettingsChange);
            }
            
            this.loggingSystem.log('TutorialAccessibilityManagerがクリーンアップされました', 'info', 'TutorialAccessibilityManager');
        } catch (error) {
            this.loggingSystem.log(`クリーンアップエラー: ${error.message}`, 'error', 'TutorialAccessibilityManager');
        }
    }
}

// シングルトンインスタンス管理
let tutorialAccessibilityManagerInstance = null;

/**
 * TutorialAccessibilityManagerのシングルトンインスタンスを取得
 * @param {Object} accessibilityManager - アクセシビリティマネージャー
 * @param {Object} loggingSystem - ロギングシステム
 * @returns {TutorialAccessibilityManager} シングルトンインスタンス
 */
export function getTutorialAccessibilityManager(accessibilityManager, loggingSystem) {
    if (!tutorialAccessibilityManagerInstance) {
        tutorialAccessibilityManagerInstance = new TutorialAccessibilityManager(accessibilityManager, loggingSystem);
    }
    return tutorialAccessibilityManagerInstance;
}

/**
 * TutorialAccessibilityManagerのシングルトンインスタンスを再初期化
 * @param {Object} accessibilityManager - アクセシビリティマネージャー
 * @param {Object} loggingSystem - ロギングシステム
 * @returns {TutorialAccessibilityManager} 新しいシングルトンインスタンス
 */
export function reinitializeTutorialAccessibilityManager(accessibilityManager, loggingSystem) {
    if (tutorialAccessibilityManagerInstance) {
        tutorialAccessibilityManagerInstance.destroy();
    }
    tutorialAccessibilityManagerInstance = new TutorialAccessibilityManager(accessibilityManager, loggingSystem);
    return tutorialAccessibilityManagerInstance;
}

export default TutorialAccessibilityManager;