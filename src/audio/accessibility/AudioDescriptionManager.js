/**
 * Audio Description Manager
 * 
 * 音声説明生成・管理機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - Visual notifications for audio events
 * - Caption system with queue management
 * - WCAG 2.1 AA compliant screen reader support
 * - Customizable display duration and styling
 * 
 * @module AudioDescriptionManager
 * Created: Phase G.2 (Issue #103)
 */

export class AudioDescriptionManager {
    constructor(mainController) {
        this.mainController = mainController;
        this.errorHandler = mainController.errorHandler;
        
        // 視覚的通知システム
        this.visualNotifications = [];
        this.notificationContainer = null;
        this.maxNotifications = 5;
        
        // 字幕システム
        this.captionContainer = null;
        this.captionQueue = [];
        this.captionDuration = 3000; // 3秒間表示
    }

    /**
     * 通知コンテナを作成
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
     * 視覚的通知を表示
     * @param {Object} options - 通知オプション
     */
    showVisualNotification(options) {
        if (!this.mainController.settings.visualFeedback) return;
        
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
        this.ensureAnimationStyles();
        
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
     * アニメーションスタイルを確保
     * @private
     */
    ensureAnimationStyles() {
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
     * @param {string} text - 字幕テキスト
     */
    showCaption(text) {
        if (!this.mainController.settings.captioning) return;
        
        // 字幕をキューに追加
        this.captionQueue.push(text);
        
        // 現在表示中でなければ表示開始
        if (this.captionContainer.style.display === 'none') {
            this.displayNextCaption();
        }
    }

    /**
     * 次の字幕を表示
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
        
        // データをクリア
        this.visualNotifications = [];
        this.captionQueue = [];
    }
}