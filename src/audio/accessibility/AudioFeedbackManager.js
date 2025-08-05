/**
 * Audio Feedback Manager Component
 * 
 * 視覚通知・ユーザーフィードバックシステムを担当
 * AudioAccessibilitySupport のサブコンポーネント
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

export class AudioFeedbackManager {
    constructor(mainController) {
        this.mainController = mainController;
        this.errorHandler = getErrorHandler();
        
        // 視覚的通知システム
        this.visualNotifications = [];
        this.notificationContainer = null;
        this.maxNotifications = 5;
        
        // 字幕システム
        this.captionContainer = null;
        this.captionQueue = [];
        this.captionDuration = 3000; // 3秒間表示
        this.currentCaption = null;
        
        // 色彩インジケーター
        this.colorIndicator = null;
        this.colorMappings = {
            low: { color: '#00ff00', label: '低音量', intensity: 0.3 },
            medium: { color: '#ffff00', label: '中音量', intensity: 0.6 },
            high: { color: '#ff8000', label: '高音量', intensity: 0.8 },
            critical: { color: '#ff0000', label: '最大音量', intensity: 1.0 }
        };
        
        // 振動マネージャーとの統合
        this.vibrationManager = null;
        this.vibrationPatterns = {
            notification: [200, 100, 200],
            warning: [500, 200, 500, 200, 500],
            success: [100, 50, 100, 50, 300],
            error: [1000],
            heartbeat: [100, 100, 100, 100, 100, 900] // 心拍パターン
        };
        
        // フィードバック設定
        this.feedbackSettings = {
            visualEnabled: false,
            captionEnabled: false,
            colorIndicatorEnabled: false,
            vibrationEnabled: false,
            highContrast: false,
            largeFonts: false,
            reduceMotion: false,
            notificationTimeout: 5000,
            captionFontSize: 16,
            captionPosition: 'bottom'
        };
        
        // DOM要素キャッシュ
        this.domElements = {
            notificationContainer: null,
            captionContainer: null,
            colorIndicator: null
        };
        
        this.initializeFeedbackSystems();
    }

    /**
     * フィードバックシステムの初期化
     */
    initializeFeedbackSystems() {
        if (typeof document !== 'undefined') {
            this.createNotificationContainer();
            this.createCaptionContainer();
            this.createColorIndicator();
            this.setupEventListeners();
        }
        
        this.initializeVibrationManager();
    }

    /**
     * 通知コンテナーの作成
     */
    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'audio-accessibility-notifications';
        this.notificationContainer.className = 'accessibility-notifications';
        
        // スタイル設定
        Object.assign(this.notificationContainer.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '10000',
            maxWidth: '300px',
            pointerEvents: 'none'
        });
        
        document.body.appendChild(this.notificationContainer);
        this.domElements.notificationContainer = this.notificationContainer;
    }

    /**
     * 字幕コンテナーの作成
     */
    createCaptionContainer() {
        this.captionContainer = document.createElement('div');
        this.captionContainer.id = 'audio-accessibility-captions';
        this.captionContainer.className = 'accessibility-captions';
        
        // スタイル設定
        Object.assign(this.captionContainer.style, {
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: '9999',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            fontSize: `${this.feedbackSettings.captionFontSize}px`,
            maxWidth: '80%',
            textAlign: 'center',
            display: 'none',
            pointerEvents: 'none'
        });
        
        document.body.appendChild(this.captionContainer);
        this.domElements.captionContainer = this.captionContainer;
    }

    /**
     * 色彩インジケーターの作成
     */
    createColorIndicator() {
        this.colorIndicator = document.createElement('div');
        this.colorIndicator.id = 'audio-accessibility-color-indicator';
        this.colorIndicator.className = 'accessibility-color-indicator';
        
        // スタイル設定
        Object.assign(this.colorIndicator.style, {
            position: 'fixed',
            top: '10px',
            left: '10px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            zIndex: '9998',
            border: '3px solid white',
            display: 'none',
            transition: 'all 0.3s ease',
            pointerEvents: 'none'
        });
        
        document.body.appendChild(this.colorIndicator);
        this.domElements.colorIndicator = this.colorIndicator;
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // 画面サイズ変更時の調整
        window.addEventListener('resize', () => {
            this.adjustLayoutForScreenSize();
        });
        
        // アクセシビリティ設定変更の監視
        if (this.mainController.settingsManager) {
            this.mainController.settingsManager.on('settingsChanged', (settings) => {
                this.updateFeedbackSettings(settings);
            });
        }
    }

    /**
     * 振動マネージャーの初期化
     */
    initializeVibrationManager() {
        // Vibration API のサポート確認
        if ('vibrate' in navigator) {
            this.vibrationManager = {
                isSupported: true,
                vibrate: (pattern) => navigator.vibrate(pattern),
                stop: () => navigator.vibrate(0)
            };
        } else {
            this.vibrationManager = {
                isSupported: false,
                vibrate: () => console.log('Vibration not supported'),
                stop: () => {}
            };
        }
    }

    /**
     * 視覚的通知の表示
     * @param {string} message - 通知メッセージ
     * @param {string} type - 通知タイプ (info, warning, error, success)
     * @param {Object} options - 表示オプション
     */
    showVisualNotification(message, type = 'info', options = {}) {
        if (!this.feedbackSettings.visualEnabled || !this.notificationContainer) {
            return;
        }

        const notification = this.createNotificationElement(message, type, options);
        
        // 通知数の制限
        if (this.visualNotifications.length >= this.maxNotifications) {
            const oldestNotification = this.visualNotifications.shift();
            if (oldestNotification.element && oldestNotification.element.parentNode) {
                oldestNotification.element.parentNode.removeChild(oldestNotification.element);
            }
        }
        
        // 通知を追加
        this.visualNotifications.push({
            id: this.generateNotificationId(),
            element: notification,
            timestamp: Date.now(),
            type: type,
            message: message
        });
        
        this.notificationContainer.appendChild(notification);
        
        // アニメーション
        this.animateNotificationIn(notification);
        
        // 自動削除のスケジュール
        const timeout = options.timeout || this.feedbackSettings.notificationTimeout;
        setTimeout(() => {
            this.removeVisualNotification(notification);
        }, timeout);
        
        // 触覚フィードバックの併用
        if (this.feedbackSettings.vibrationEnabled) {
            this.triggerVibration(type);
        }
    }

    /**
     * 通知要素の作成
     * @param {string} message - メッセージ
     * @param {string} type - タイプ
     * @param {Object} options - オプション
     * @returns {HTMLElement} 通知要素
     */
    createNotificationElement(message, type, options) {
        const notification = document.createElement('div');
        notification.className = `accessibility-notification notification-${type}`;
        
        // 基本スタイル
        Object.assign(notification.style, {
            backgroundColor: this.getNotificationColor(type),
            color: this.feedbackSettings.highContrast ? '#000' : '#fff',
            padding: '12px 16px',
            margin: '5px 0',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            fontSize: this.feedbackSettings.largeFonts ? '18px' : '14px',
            fontWeight: this.feedbackSettings.highContrast ? 'bold' : 'normal',
            border: this.feedbackSettings.highContrast ? '2px solid #000' : 'none',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        // アイコンとメッセージ
        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 8px; font-size: 16px;">${icon}</span>
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;
        
        return notification;
    }

    /**
     * 字幕の表示
     * @param {string} text - 字幕テキスト
     * @param {Object} options - 表示オプション
     */
    showCaption(text, options = {}) {
        if (!this.feedbackSettings.captionEnabled || !this.captionContainer) {
            return;
        }
        
        const caption = {
            id: this.generateCaptionId(),
            text: text,
            duration: options.duration || this.captionDuration,
            timestamp: Date.now(),
            options: options
        };
        
        this.captionQueue.push(caption);
        
        if (!this.currentCaption) {
            this.processNextCaption();
        }
    }

    /**
     * 次の字幕を処理
     */
    processNextCaption() {
        if (this.captionQueue.length === 0) {
            this.currentCaption = null;
            return;
        }
        
        const caption = this.captionQueue.shift();
        this.currentCaption = caption;
        
        // 字幕を表示
        this.captionContainer.textContent = caption.text;
        this.captionContainer.style.display = 'block';
        
        // アニメーション
        this.animateCaptionIn();
        
        // 自動削除
        setTimeout(() => {
            this.hideCaptionElement();
            setTimeout(() => {
                this.processNextCaption();
            }, 300); // フェードアウト時間
        }, caption.duration);
    }

    /**
     * 色彩インジケーターの更新
     * @param {string} level - 音量レベル (low, medium, high, critical)
     * @param {Object} options - 表示オプション
     */
    updateColorIndicator(level, options = {}) {
        if (!this.feedbackSettings.colorIndicatorEnabled || !this.colorIndicator) {
            return;
        }
        
        const mapping = this.colorMappings[level];
        if (!mapping) {
            return;
        }
        
        // 色と透明度の設定
        this.colorIndicator.style.backgroundColor = mapping.color;
        this.colorIndicator.style.opacity = mapping.intensity.toString();
        this.colorIndicator.style.display = 'block';
        
        // パルス効果（ハイコントラストモードでは無効）
        if (!this.feedbackSettings.highContrast && !this.feedbackSettings.reduceMotion) {
            this.colorIndicator.style.animation = `pulse-${level} 1s ease-in-out`;
        }
        
        // アクセシビリティラベル
        this.colorIndicator.setAttribute('aria-label', mapping.label);
        this.colorIndicator.title = mapping.label;
    }

    /**
     * 触覚フィードバックの適用
     * @param {Object} cue - キューオブジェクト
     */
    applyTactileFeedback(cue) {
        if (!this.feedbackSettings.vibrationEnabled || !this.vibrationManager.isSupported) {
            return;
        }
        
        let vibrationPattern;
        
        if (cue.pattern && this.vibrationPatterns[cue.pattern]) {
            vibrationPattern = this.vibrationPatterns[cue.pattern];
        } else {
            // カスタムパターンの生成
            vibrationPattern = this.generateVibrationPattern(cue);
        }
        
        // 振動の実行
        this.vibrationManager.vibrate(vibrationPattern);
    }

    /**
     * 触覚フィードバックのトリガー
     * @param {string} type - フィードバックタイプ
     */
    triggerVibration(type) {
        if (!this.feedbackSettings.vibrationEnabled) {
            return;
        }
        
        const pattern = this.vibrationPatterns[type] || this.vibrationPatterns.notification;
        this.vibrationManager.vibrate(pattern);
    }

    /**
     * 設定の更新
     * @param {Object} newSettings - 新しい設定
     */
    updateFeedbackSettings(newSettings) {
        Object.assign(this.feedbackSettings, newSettings);
        
        // UI要素の更新
        this.updateUIElements();
        
        // 動的スタイル調整
        if (newSettings.highContrast !== undefined) {
            this.applyHighContrastMode(newSettings.highContrast);
        }
        
        if (newSettings.largeFonts !== undefined) {
            this.applyLargeFonts(newSettings.largeFonts);
        }
    }

    /**
     * ハイコントラストモードの適用
     * @param {boolean} enabled - 有効かどうか
     */
    applyHighContrastMode(enabled) {
        const elements = [
            this.notificationContainer,
            this.captionContainer,
            this.colorIndicator
        ];
        
        elements.forEach(element => {
            if (element) {
                if (enabled) {
                    element.classList.add('high-contrast');
                } else {
                    element.classList.remove('high-contrast');
                }
            }
        });
    }

    /**
     * 状態の取得
     * @returns {Object} 現在の状態
     */
    getStatus() {
        return {
            visualEnabled: this.feedbackSettings.visualEnabled,
            captionEnabled: this.feedbackSettings.captionEnabled,
            vibrationEnabled: this.feedbackSettings.vibrationEnabled,
            activeNotifications: this.visualNotifications.length,
            captionQueueLength: this.captionQueue.length,
            currentCaption: this.currentCaption,
            vibrationSupported: this.vibrationManager?.isSupported || false,
            settings: { ...this.feedbackSettings }
        };
    }

    // ========================================
    // Helper Methods
    // ========================================
    
    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateCaptionId() {
        return `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getNotificationColor(type) {
        const colors = {
            info: '#2196F3',
            warning: '#FF9800',
            error: '#F44336',
            success: '#4CAF50'
        };
        return colors[type] || colors.info;
    }
    
    getNotificationIcon(type) {
        const icons = {
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌',
            success: '✅'
        };
        return icons[type] || icons.info;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    animateNotificationIn(element) {
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        });
    }
    
    animateCaptionIn() {
        this.captionContainer.style.opacity = '0';
        this.captionContainer.style.transform = 'translateX(-50%) translateY(20px)';
        
        requestAnimationFrame(() => {
            this.captionContainer.style.opacity = '1';
            this.captionContainer.style.transform = 'translateX(-50%) translateY(0)';
        });
    }
    
    hideCaptionElement() {
        this.captionContainer.style.opacity = '0';
        this.captionContainer.style.transform = 'translateX(-50%) translateY(-20px)';
        
        setTimeout(() => {
            this.captionContainer.style.display = 'none';
        }, 300);
    }
    
    removeVisualNotification(element) {
        if (element && element.parentNode) {
            element.style.opacity = '0';
            element.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }
        
        // 配列からも削除
        this.visualNotifications = this.visualNotifications.filter(n => n.element !== element);
    }
    
    generateVibrationPattern(cue) {
        const baseDuration = Math.min(Math.max(cue.duration || 200, 50), 1000);
        const intensity = Math.min(Math.max(cue.intensity || 0.5, 0.1), 1.0);
        const duration = Math.round(baseDuration * intensity);
        
        return [duration];
    }
    
    adjustLayoutForScreenSize() {
        const screenWidth = window.innerWidth;
        
        if (screenWidth < 768) {
            // モバイル調整
            if (this.notificationContainer) {
                this.notificationContainer.style.right = '10px';
                this.notificationContainer.style.maxWidth = '280px';
            }
        }
    }
    
    updateUIElements() {
        // フォントサイズ調整
        if (this.captionContainer) {
            this.captionContainer.style.fontSize = `${this.feedbackSettings.captionFontSize}px`;
        }
    }
    
    applyLargeFonts(enabled) {
        const multiplier = enabled ? 1.2 : 1.0;
        
        if (this.captionContainer) {
            const baseSize = this.feedbackSettings.captionFontSize;
            this.captionContainer.style.fontSize = `${baseSize * multiplier}px`;
        }
    }

    /**
     * クリーンアップ
     */
    destroy() {
        // DOM要素の削除
        Object.values(this.domElements).forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        // 配列とキューのクリア
        this.visualNotifications = [];
        this.captionQueue = [];
        this.currentCaption = null;
        
        // 振動の停止
        if (this.vibrationManager) {
            this.vibrationManager.stop();
        }
    }
}