import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { getLocalizationManager } from '../core/LocalizationManager.js';
import { AudioTestPanel } from './AudioTestPanel.js';

// サブコンポーネントのインポート
import { AudioSettingsTabManager } from './audio-settings/AudioSettingsTabManager.js';
import { AudioSettingsTabRenderers } from './audio-settings/AudioSettingsTabRenderers.js';
import { AudioSettingsUIComponentFactory } from './audio-settings/AudioSettingsUIComponentFactory.js';
import { AudioSettingsDataManager } from './audio-settings/AudioSettingsDataManager.js';

// Audio Settings UI types
export interface AudioSettingsUIState {
    isOpen: boolean;
    container: HTMLElement | null;
}

export interface AudioSettingsUIComponents {
    audioTestPanel: AudioTestPanel;
    tabManager: AudioSettingsTabManager;
    uiComponentFactory: AudioSettingsUIComponentFactory;
    tabRenderers: AudioSettingsTabRenderers;
    dataManager: AudioSettingsDataManager;
}

export interface NotificationColors {
    bg: string;
    border: string;
    text: string;
}

export interface NotificationColorsMap {
    success: NotificationColors;
    error: NotificationColors;
    info: NotificationColors;
}

/**
 * 音響設定UIクラス (Refactored)
 * 音響設定UI統合管理システム - サブコンポーネント化により責任を分離し、保守性を向上
 * 
 * サブコンポーネント化により責任を分離：
 * - AudioSettingsTabManager: タブナビゲーション、タブ切り替え処理
 * - AudioSettingsTabRenderers: 各タブのコンテンツ描画処理
 * - AudioSettingsUIComponentFactory: UI要素作成、イベント処理
 * - AudioSettingsDataManager: インポート・エクスポート、設定検証処理
 */
export class AudioSettingsUI implements AudioSettingsUIState {
    private audioManager: any;
    private configManager: any;
    private localizationManager: any;
    private errorHandler: any;
    
    // UI要素
    public container: HTMLElement | null;
    public isOpen: boolean;
    
    // Components
    public audioTestPanel: AudioTestPanel;
    public tabManager!: AudioSettingsTabManager;
    public uiComponentFactory!: AudioSettingsUIComponentFactory;
    public tabRenderers!: AudioSettingsTabRenderers;
    public dataManager!: AudioSettingsDataManager;
    
    // イベントリスナー
    private eventListeners: Map<string, EventListener>;
    
    // 設定変更の監視
    private configWatchers: Set<string>;
    
    // Escape key handler
    private escapeHandler: ((e: KeyboardEvent) => void) | null;

    constructor(audioManager: any) {
        this.audioManager = audioManager;
        this.configManager = getConfigurationManager();
        this.localizationManager = getLocalizationManager();
        this.errorHandler = getErrorHandler();
        
        // UI要素
        this.container = null;
        this.isOpen = false;
        
        // 音響テストパネル
        this.audioTestPanel = new AudioTestPanel(audioManager);
        
        // サブコンポーネントの初期化
        this._initializeSubComponents();
        
        // イベントリスナー
        this.eventListeners = new Map();
        
        // 設定変更の監視
        this.configWatchers = new Set();
        
        // Escape handler
        this.escapeHandler = null;
        
        // 初期化
        this.initialize();
    }
    
    /**
     * サブコンポーネント初期化
     */
    private _initializeSubComponents(): void {
        try {
            // タブマネージャー
            this.tabManager = new AudioSettingsTabManager(this.audioManager, this.configManager);
            
            // UIコンポーネントファクトリー
            this.uiComponentFactory = new AudioSettingsUIComponentFactory(this.audioManager, this.configManager);
            
            // タブレンダラー
            this.tabRenderers = new AudioSettingsTabRenderers(
                this.audioManager, 
                this.configManager, 
                this.uiComponentFactory, 
                this.audioTestPanel
            );
            
            // データマネージャー
            this.dataManager = new AudioSettingsDataManager(this.audioManager, this.configManager);
            
            // 相互連携の設定
            this.tabManager.setTabRenderers(this.tabRenderers);
            this.uiComponentFactory.setSettingsChangeCallback(() => this.showSaveStatus());
            this.dataManager.setNotificationCallback((message: string, type: string) => this.showNotification(message, type));
            
            console.log('[AudioSettingsUI] サブコンポーネントを初期化しました');
            
        } catch (error) {
            console.error('AudioSettingsUI サブコンポーネント初期化に失敗:', error);
            this.errorHandler.handleError(error, {
                context: 'AudioSettingsUI._initializeSubComponents'
            });
        }
    }
    
    /**
     * 初期化
     */
    private initialize(): void {
        try {
            // コンテナ作成
            this.createContainer();
            
            // 設定変更の監視を設定
            this.setupConfigWatchers();
            
            console.log('AudioSettingsUI initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'UI_ERROR', {
                component: 'AudioSettingsUI',
                operation: 'initialize'
            });
        }
    }
    
    /**
     * UIコンテナを作成
     * @private
     */
    private createContainer(): void {
        // メインコンテナ
        this.container = document.createElement('div');
        this.container.className = 'audio-settings-ui';
        this.container.style.cssText = `
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            max-width: 90vw;
            max-height: 80vh;
            background-color: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ffff;
            border-radius: 15px;
            padding: 20px;
            z-index: 10000;
            overflow: hidden;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #ffffff;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
        `;
        
        // ヘッダー
        const header = this.createHeader();
        this.container.appendChild(header);
        
        // タブナビゲーション（サブコンポーネント使用）
        const tabNav = this.tabManager.createTabNavigation();
        this.tabManager.setContainer(this.container);
        this.container.appendChild(tabNav);
        
        // コンテンツエリア
        const content = document.createElement('div');
        content.className = 'audio-settings-content';
        content.style.cssText = `
            margin-top: 20px;
            max-height: calc(80vh - 180px);
            overflow-y: auto;
            padding-right: 10px;
        `;
        content.id = 'audio-settings-content';
        this.container.appendChild(content);
        
        // フッター
        const footer = this.createFooter();
        this.container.appendChild(footer);
        
        // ドキュメントに追加
        document.body.appendChild(this.container);
        
        // 初期タブを表示（サブコンポーネント使用）
        this.tabManager.showTab(this.tabManager.getActiveTab());
    }
    
    /**
     * ヘッダーを作成
     * @private
     * @returns {HTMLElement} ヘッダー要素
     */
    private createHeader(): HTMLElement {
        const header = document.createElement('div');
        header.className = 'audio-settings-header';
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #00ffff;
        `;
        
        // タイトル
        const title = document.createElement('h2');
        title.textContent = this.localizationManager.getText('audio.settings.title');
        title.style.cssText = `
            margin: 0;
            font-size: 24px;
            color: #00ffff;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        `;
        header.appendChild(title);
        
        // 閉じるボタン
        const closeButton = document.createElement('button');
        closeButton.className = 'audio-settings-close';
        closeButton.textContent = '✖';
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: #ffffff;
            font-size: 24px;
            cursor: pointer;
            padding: 5px 10px;
            transition: all 0.3s ease;
        `;
        closeButton.addEventListener('click', () => this.close());
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.color = '#ff0000';
            closeButton.style.textShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.color = '#ffffff';
            closeButton.style.textShadow = 'none';
        });
        header.appendChild(closeButton);
        
        return header;
    }
    
    // タブナビゲーション作成処理はサブコンポーネントに移行済み
    
    /**
     * フッターを作成
     * @private
     * @returns {HTMLElement} フッター要素
     */
    private createFooter(): HTMLElement {
        const footer = document.createElement('div');
        footer.className = 'audio-settings-footer';
        footer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px solid #333333;
        `;
        
        // リセットボタン
        const resetButton = document.createElement('button');
        resetButton.className = 'audio-settings-reset';
        resetButton.textContent = this.localizationManager.getText('audio.settings.reset');
        resetButton.style.cssText = `
            background-color: rgba(255, 0, 0, 0.2);
            border: 2px solid #ff0000;
            color: #ff0000;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        `;
        resetButton.addEventListener('click', () => this.dataManager.resetSettings().then(() => {
            this.tabManager.showTab(this.tabManager.getActiveTab());
        }));
        resetButton.addEventListener('mouseenter', () => {
            resetButton.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            resetButton.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        });
        resetButton.addEventListener('mouseleave', () => {
            resetButton.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
            resetButton.style.boxShadow = 'none';
        });
        footer.appendChild(resetButton);
        
        // 中央ボタングループ
        const middleGroup = document.createElement('div');
        middleGroup.style.cssText = `
            display: flex;
            gap: 10px;
        `;
        
        // インポートボタン
        const importButton = document.createElement('button');
        importButton.className = 'audio-settings-import';
        importButton.textContent = '📁 ' + this.localizationManager.getText('audio.settings.import');
        importButton.style.cssText = `
            background-color: rgba(0, 255, 0, 0.2);
            border: 2px solid #00ff00;
            color: #00ff00;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
        `;
        importButton.addEventListener('click', () => this.dataManager.importSettings().then(() => {
            this.tabManager.showTab(this.tabManager.getActiveTab());
        }));
        importButton.addEventListener('mouseenter', () => {
            importButton.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
            importButton.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
        });
        importButton.addEventListener('mouseleave', () => {
            importButton.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
            importButton.style.boxShadow = 'none';
        });
        middleGroup.appendChild(importButton);
        
        // エクスポートボタン
        const exportButton = document.createElement('button');
        exportButton.className = 'audio-settings-export';
        exportButton.textContent = '💾 ' + this.localizationManager.getText('audio.settings.export');
        exportButton.style.cssText = `
            background-color: rgba(0, 255, 255, 0.2);
            border: 2px solid #00ffff;
            color: #00ffff;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
        `;
        exportButton.addEventListener('click', () => this.dataManager.exportSettings());
        exportButton.addEventListener('mouseenter', () => {
            exportButton.style.backgroundColor = 'rgba(0, 255, 255, 0.3)';
            exportButton.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.5)';
        });
        exportButton.addEventListener('mouseleave', () => {
            exportButton.style.backgroundColor = 'rgba(0, 255, 255, 0.2)';
            exportButton.style.boxShadow = 'none';
        });
        middleGroup.appendChild(exportButton);
        
        footer.appendChild(middleGroup);
        
        // 保存状態表示
        const saveStatus = document.createElement('span');
        saveStatus.className = 'audio-settings-save-status';
        saveStatus.textContent = this.localizationManager.getText('audio.settings.saved');
        saveStatus.style.cssText = `
            color: #00ff00;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        saveStatus.id = 'audio-settings-save-status';
        footer.appendChild(saveStatus);
        
        return footer;
    }
    
    /**
     * タブを表示（サブコンポーネントに委譲）
     * @param {string} tabKey - タブキー
     */
    public showTab(tabKey: string): void {
        this.tabManager.showTab(tabKey);
    }
    
    // タブ描画処理はAudioSettingsTabRenderersに移行済み
    
    // 品質タブ描画処理はAudioSettingsTabRenderersに移行済み
    
    // エフェクトタブ描画処理はAudioSettingsTabRenderersに移行済み
    
    // アクセシビリティタブ描画処理はAudioSettingsTabRenderersに移行済み
    
    // テストタブ描画処理はAudioSettingsTabRenderersに移行済み
    
    // UIコンポーネント作成処理はAudioSettingsUIComponentFactoryに移行済み
    
    /**
     * 保存状態を表示
     * @private
     */
    private showSaveStatus(): void {
        const status = document.getElementById('audio-settings-save-status');
        if (status) {
            status.style.opacity = '1';
            setTimeout(() => {
                status.style.opacity = '0';
            }, 2000);
        }
    }
    
    /**
     * 通知を表示（データマネージャーからの委譲）
     * @private
     * @param {string} message - メッセージ
     * @param {string} type - タイプ ('success', 'error', 'info')
     */
    private showNotification(message: string, type: string = 'info'): void {
        // 既存の通知があれば削除
        const existingNotification = document.querySelector('.audio-settings-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'audio-settings-notification';
        notification.textContent = message;
        
        const colors: NotificationColorsMap = {
            success: { bg: 'rgba(0, 255, 0, 0.2)', border: '#00ff00', text: '#00ff00' },
            error: { bg: 'rgba(255, 0, 0, 0.2)', border: '#ff0000', text: '#ff0000' },
            info: { bg: 'rgba(0, 255, 255, 0.2)', border: '#00ffff', text: '#00ffff' }
        };
        
        const color = colors[type as keyof NotificationColorsMap] || colors.info;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${color.bg};
            border: 2px solid ${color.border};
            color: ${color.text};
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10001;
            font-size: 14px;
            box-shadow: 0 0 20px ${color.bg};
            animation: slideInFromRight 0.3s ease-out;
        `;
        
        // アニメーション定義
        if (!document.querySelector('#audio-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'audio-notification-styles';
            style.textContent = `
                @keyframes slideInFromRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutToRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // 3秒後に自動削除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutToRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
    
    /**
     * 設定変更の監視を設定
     * @private
     */
    private setupConfigWatchers(): void {
        // データマネージャーに委譲
        this.configWatchers = this.dataManager.setupConfigWatchers();
    }
    
    // データ管理（インポート・エクスポート・リセット）処理はAudioSettingsDataManagerに移行済み
    
    /**
     * 音響設定UIを開く
     */
    public open(): void {
        if (this.isOpen) return;
        
        if (!this.container) return;
        
        this.container.style.display = 'block';
        this.isOpen = true;
        
        // 開くアニメーション
        this.container.style.opacity = '0';
        this.container.style.transform = 'translate(-50%, -50%) scale(0.9)';
        
        requestAnimationFrame(() => {
            if (!this.container) return;
            this.container.style.transition = 'all 0.3s ease';
            this.container.style.opacity = '1';
            this.container.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        
        // UIサウンド
        this.audioManager.playUISound('open', { volume: 0.3 });
        
        // エスケープキーで閉じる
        this.escapeHandler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                this.close();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }
    
    /**
     * 音響設定UIを閉じる
     */
    public close(): void {
        if (!this.isOpen) return;
        
        if (!this.container) return;
        
        // 閉じるアニメーション
        this.container.style.opacity = '0';
        this.container.style.transform = 'translate(-50%, -50%) scale(0.9)';
        
        setTimeout(() => {
            if (this.container) {
                this.container.style.display = 'none';
            }
            this.isOpen = false;
        }, 300);
        
        // UIサウンド
        this.audioManager.playUISound('close', { volume: 0.3 });
        
        // イベントリスナーを削除
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }
    }
    
    /**
     * 音響設定UIの表示を切り替え
     */
    public toggle(): void {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    /**
     * リソースの解放
     */
    public dispose(): void {
        // サブコンポーネントのクリーンアップ
        if (this.uiComponentFactory) {
            this.uiComponentFactory.dispose();
        }
        
        // 設定監視を解除
        this.configWatchers.forEach(watchId => {
            this.configManager.unwatch(watchId);
        });
        this.configWatchers.clear();
        
        // イベントリスナーを削除
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
        }
        
        // DOM要素を削除
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        // 音響テストパネルを破棄
        if (this.audioTestPanel) {
            this.audioTestPanel.dispose();
        }
        
        this.container = null;
        this.eventListeners.clear();
    }
}