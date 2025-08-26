/**
 * Audio Description Manager
 * 
 * Phase G.2で分割されたAudioAccessibilitySupportのサブコンポーネント
 * 音声説明生成・管理機能を専門に担当します。
 * 
 * 主な責任：
 * - 音声イベントに対する視覚的通知の表示
 * - キューイング機能付きキャプションシステム
 * - WCAG 2.1 AA準拠のスクリーンリーダー対応
 * - カスタマイズ可能な表示時間とスタイリング
 * 
 * @class AudioDescriptionManager
 * @memberof AudioAccessibilitySupport
 * @since Phase G.2
 * @author Claude Code
 */

// Types for visual notifications
interface VisualNotificationOptions {
    type: "single" | "batch";
    title: string;
    message?: string;
    icon?: string;
    color?: string;
    position?: { x: number; y: number } | null;
    duration?: number;
}

// Types for announcements
interface AnnounceOptions {
    priority?: 'polite' | 'assertive';
    visualNotification?: boolean;
    caption?: boolean;
    icon?: string;
    color?: string;
    duration?: number;
}

// Types for audio descriptions
interface AudioDescription {
    category: string;
    type: "single" | "batch";
    params: Record<string, any>;
    priority: number;
    timestamp: number;
}

// Bubble types
type BubbleType = 'normal' | 'stone' | 'iron' | 'diamond' | 'rainbow' | 'pink' | 
                  'clock' | 'electric' | 'poison' | 'spiky' | 'boss' | 'golden' | 
                  'frozen' | 'magnetic' | 'explosive';

// Rarity types
type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

// Main controller interface
interface MainController {
    errorHandler: any;
    settings: {
        visualFeedback?: boolean;
        captioning?: boolean;
        audioDescriptions?: boolean;
    };
}

export class AudioDescriptionManager {
    private mainController: MainController;
    private errorHandler: any;
    private visualNotifications: HTMLElement[];
    private notificationContainer: HTMLElement | null;
    private maxNotifications: number;
    private captionContainer: HTMLElement | null;
    private captionQueue: string[];
    private captionDuration: number;
    private enabled: boolean;

    constructor(mainController: MainController) {
        this.mainController = mainController;
        this.errorHandler = mainController.errorHandler;
        
        // デフォルト設定を初期化
        if (!this.mainController.settings) {
            this.mainController.settings = {
                visualFeedback: true,
                captioning: true,
                audioDescriptions: true
            };
        }

        // 視覚的通知システム
        this.visualNotifications = [];
        this.notificationContainer = null;
        this.maxNotifications = 5;
        
        // 字幕システム
        this.captionContainer = null;
        this.captionQueue = [];
        this.captionDuration = 3000; // 3秒間表示
        
        this.enabled = false;
    }

    /**
     * 通知コンテナを作成
     */
    public createNotificationContainer(): void {
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
    public createCaptionContainer(): void {
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
     * @param options - 通知オプション
     */
    public showVisualNotification(options: VisualNotificationOptions): void {
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
        if (this.notificationContainer) {
            this.notificationContainer.appendChild(notification);
            this.visualNotifications.push(notification);

            // 最大数を超えた場合は古い通知を削除
            while (this.visualNotifications.length > this.maxNotifications) {
                const oldNotification = this.visualNotifications.shift();
                if (oldNotification && oldNotification.parentNode) {
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
    }

    /**
     * アニメーションスタイルを確保
     * @private
     */
    private ensureAnimationStyles(): void {
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
     * @param notification - 通知要素
     */
    private removeNotification(notification: HTMLElement): void {
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
     * @param text - 字幕テキスト
     */
    public showCaption(text: string): void {
        if (!this.mainController.settings.captioning) return;
        
        // 字幕をキューに追加
        this.captionQueue.push(text);
        
        // 現在表示中でなければ表示開始
        if (this.captionContainer && this.captionContainer.style.display === 'none') {
            this.displayNextCaption();
        }
    }

    /**
     * 次の字幕を表示
     */
    private displayNextCaption(): void {
        if (!this.captionContainer) return;

        if (this.captionQueue.length === 0) {
            this.captionContainer.style.display = 'none';
            return;
        }

        const text = this.captionQueue.shift();
        if (text) {
            this.captionContainer.textContent = text;
            this.captionContainer.style.display = 'block';
            
            // アクセシビリティ属性を更新
            this.captionContainer.setAttribute('aria-label', `字幕: ${text}`);
        }
        
        // 次の字幕表示までの時間
        setTimeout(() => {
            this.displayNextCaption();
        }, this.captionDuration);
    }

    /**
     * 泡の種類に応じた色を取得
     * @param bubbleType - 泡の種類
     * @returns 色コード
     */
    public getBubbleColor(bubbleType: string): string {
        const colorMap: Record<BubbleType, string> = {
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
        return colorMap[bubbleType as BubbleType] || '#00ffff';
    }

    /**
     * レアリティに応じた色を取得
     * @param rarity - レアリティ
     * @returns 色コード
     */
    public getRarityColor(rarity: string): string {
        const colorMap: Record<RarityType, string> = {
            common: '#ffffff',
            rare: '#0080ff',
            epic: '#8000ff',
            legendary: '#ff8000'
        };
        return colorMap[rarity as RarityType] || '#ffffff';
    }

    /**
     * 音声説明の有効/無効を設定
     * @param enabled - 有効化フラグ
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        console.log(`AudioDescriptionManager: ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * テキストのアナウンス（スクリーンリーダー向け）
     * @param text - アナウンスするテキスト
     * @param options - アナウンスオプション
     */
    public announce(text: string, options: AnnounceOptions = {}): void {
        const { 
            priority = 'polite',
            visualNotification = true,
            caption = false
        } = options;
        
        // ARIAライブリージョンでのアナウンス
        if (this.notificationContainer) {
            this.notificationContainer.setAttribute('aria-live', priority);
            const announceElement = document.createElement('div');
            announceElement.className = 'sr-only';
            announceElement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
            announceElement.textContent = text;
            this.notificationContainer.appendChild(announceElement);

            // 短時間後に削除（スクリーンリーダーが読み取った後）
            setTimeout(() => {
                if (announceElement.parentNode) {
                    announceElement.remove();
                }
            }, 1000);
        }
        
        // 視覚的通知も表示する場合
        if (visualNotification) {
            this.showVisualNotification({
                type: 'announcement',
                title: 'アナウンス',
                message: text,
                icon: '📢',
                ...options
            });
        }
        
        // 字幕表示する場合
        if (caption) {
            this.showCaption(text);
        }

        console.log('AudioDescriptionManager: Announced text:', text);
    }

    /**
     * 音声説明を追加
     * @param category - カテゴリ
     * @param type - タイプ
     * @param params - パラメータ
     * @param priority - 優先度
     */
    public addDescription(category: string, type: "single" | "batch", params: Record<string, any> = {}, priority: number = 3): void {
        if (!this.enabled) return;
        
        const description: AudioDescription = {
            category,
            type,
            params,
            priority,
            timestamp: Date.now()
        };

        console.log('AudioDescriptionManager: Added description:', description);
        
        // 視覚的な説明を表示
        if (description.category === 'game' && description.type === 'bubblePop') {
            this.showVisualNotification({
                type: 'info',
                title: '泡破壊',
                message: `${params.bubbleType}泡が弾けました`
            });
        }
    }

    /**
     * ステータス取得
     * @returns ステータス情報
     */
    public getStatus(): { enabled: boolean; activeDescriptions: number; initialized: boolean } {
        return {
            enabled: this.enabled || false,
            activeDescriptions: 0,
            initialized: true
        };
    }

    /**
     * リソースの解放
     */
    public dispose(): void {
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