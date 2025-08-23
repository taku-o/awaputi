import { Scene } from '../core/Scene.js';
import { NavigationContextManager } from '../core/navigation/NavigationContextManager.js';
import { getLoggingSystem } from '../core/LoggingSystem.js';
import { AccessibilitySettingsManager, type ExtendedStatistics } from './settings-scene/AccessibilitySettingsManager.js';
import { VolumeControlComponent } from '../components/VolumeControlComponent.js';
// import { AccessibilityProfileComponent } from '../components/AccessibilityProfileComponent.js';
// import { SettingsImportExportComponent } from '../components/SettingsImportExportComponent.js';

// Settings Scene specific types
export interface SettingOption {
    value: string;
    label: string;
}

export interface SettingItem {
    key: string;
    label: string;
    type: 'toggle' | 'select' | 'slider' | 'text' | 'custom';
    description?: string | undefined;
    options?: SettingOption[] | undefined;
    component?: string | undefined;
    min?: number | undefined;
    max?: number | undefined;
    step?: number | undefined;
    default?: any;
    validator?: string | undefined;
}

export interface SettingsLayout {
    categoryWidth: number;
    settingsPadding: number;
    itemHeight: number;
    titleHeight: number;
}

export interface ConfirmDialogData {
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export interface ProfileDialogData {
    profiles: any[];
    selectedIndex: number;
}

export interface SettingsSceneState {
    currentCategory: string;
    selectedCategoryIndex: number;
    selectedSettingIndex: number;
    isEditingValue: boolean;
    tempValue: string | null;
    showingConfirmDialog: boolean;
    confirmDialogData: ConfirmDialogData | null;
    showingProfileDialog?: boolean;
    profileDialogData?: ProfileDialogData | null;
    hasContextualHelp?: boolean;
    contextualHelpTitle?: string;
    contextualHelpContent?: string;
    contextualHelpActions?: string[];
    currentContext?: any;
}

export interface ContextData {
    accessMethod?: string;
    fromHelp?: boolean;
    quickAccess?: boolean;
    targetSetting?: string;
    sourceScene?: string;
    preserveContext?: boolean;
    returnScene?: string;
}

/**
 * 設定画面シーン
 * ソーシャル共有設定、プライバシー設定、通知設定を管理
 */
export class SettingsScene extends Scene implements SettingsSceneState {
    // Component properties
    public loggingSystem: any;
    public navigationContext: NavigationContextManager;
    public accessibilitySettingsManager: AccessibilitySettingsManager;
    public volumeControlComponent: VolumeControlComponent;
    
    // Categories and UI state
    public categories: string[];
    public categoryLabels: string[];
    public currentCategory: string;
    public selectedCategoryIndex: number;
    public selectedSettingIndex: number;
    public settingItems: Record<string, SettingItem[]>;
    public isEditingValue: boolean;
    public tempValue: string | null;
    public showingConfirmDialog: boolean;
    public confirmDialogData: ConfirmDialogData | null;
    public showingProfileDialog?: boolean;
    public profileDialogData?: ProfileDialogData | null;
    public hasContextualHelp?: boolean;
    public contextualHelpTitle?: string;
    public contextualHelpContent?: string;
    public contextualHelpActions?: string[];
    public currentContext?: any;
    public layout: SettingsLayout;

    constructor(gameEngine: any) {
        super(gameEngine);
        
        // LoggingSystemとNavigationContextManagerの初期化
        this.loggingSystem = getLoggingSystem();
        this.navigationContext = new NavigationContextManager(gameEngine);
        
        // AccessibilitySettingsManagerの初期化
        this.accessibilitySettingsManager = new AccessibilitySettingsManager(gameEngine);
        // VolumeControlComponentの初期化
        this.volumeControlComponent = new VolumeControlComponent(gameEngine);
        
        // 設定カテゴリと現在選択中のカテゴリ
        this.categories = ['general', 'social', 'privacy', 'notifications', 'accessibility'];
        this.categoryLabels = ['一般', 'ソーシャル', 'プライバシー', '通知', 'アクセシビリティ'];
        this.currentCategory = 'social';
        this.selectedCategoryIndex = 1; // ソーシャルから開始
        
        // 現在選択中の設定項目
        this.selectedSettingIndex = 0;
        
        // 設定項目の定義
        this.settingItems = this.initializeSettingItems();
        
        // UI状態
        this.isEditingValue = false;
        this.tempValue = null;
        this.showingConfirmDialog = false;
        this.confirmDialogData = null;
        
        // レイアウト設定
        this.layout = {
            categoryWidth: 200,
            settingsPadding: 20,
            itemHeight: 60,
            titleHeight: 40
        };
    }
    
    /**
     * 設定項目の初期化
     */
    initializeSettingItems(): Record<string, SettingItem[]> {
        return {
            general: [
                {
                    key: 'ui.language',
                    label: '言語',
                    type: 'select',
                    options: [
                        { value: 'ja', label: '日本語' },
                        { value: 'en', label: 'English' }
                    ]
                },
                {
                    key: 'ui.quality',
                    label: '画質',
                    type: 'select',
                    options: [
                        { value: 'low', label: '低' },
                        { value: 'medium', label: '中' },
                        { value: 'high', label: '高' },
                        { value: 'auto', label: '自動' }
                    ]
                },
                {
                    key: 'audio.muted',
                    label: '音声ミュート',
                    type: 'toggle',
                    description: 'すべての音声をミュートにします'
                },
                {
                    key: 'audio.masterVolume',
                    label: 'マスター音量',
                    type: 'custom',
                    component: 'VolumeControlComponent',
                    description: '音量を調整します'
                },
                {
                    key: 'audio.sfxVolume',
                    label: '効果音音量',
                    type: 'slider',
                    min: 0,
                    max: 1,
                    step: 0.1
                },
                {
                    key: 'audio.bgmVolume',
                    label: 'BGM音量',
                    type: 'slider',
                    min: 0,
                    max: 1,
                    step: 0.1
                }
            ],
            social: [
                {
                    key: 'social.enableSharing',
                    label: 'ソーシャル共有を有効化',
                    type: 'toggle',
                    description: 'スコアや実績の共有機能を有効にします'
                },
                {
                    key: 'social.autoPromptHighScore',
                    label: 'ハイスコア時の自動プロンプト',
                    type: 'toggle',
                    description: 'ハイスコアを達成した時に自動的に共有画面を表示します'
                },
                {
                    key: 'social.autoPromptAchievements',
                    label: '実績解除時の自動プロンプト',
                    type: 'toggle',
                    description: '実績を解除した時に自動的に共有画面を表示します'
                },
                {
                    key: 'social.defaultPlatform',
                    label: 'デフォルト共有先',
                    type: 'select',
                    options: [
                        { value: 'auto', label: '自動選択' },
                        { value: 'twitter', label: 'Twitter/X' },
                        { value: 'facebook', label: 'Facebook' },
                        { value: 'native', label: 'システム標準' }
                    ]
                },
                {
                    key: 'social.includeScreenshot',
                    label: 'スクリーンショットを含む',
                    type: 'toggle',
                    description: '共有時にゲーム画面のスクリーンショットを含めます'
                },
                {
                    key: 'social.screenshotQuality',
                    label: 'スクリーンショット画質',
                    type: 'select',
                    options: [
                        { value: 'low', label: '低（軽量）' },
                        { value: 'medium', label: '中（標準）' },
                        { value: 'high', label: '高（高品質）' }
                    ]
                },
                {
                    key: 'social.showWatermark',
                    label: 'ウォーターマークを表示',
                    type: 'toggle',
                    description: 'スクリーンショットにゲーム名を表示します'
                },
                {
                    key: 'social.customMessage',
                    label: 'カスタムメッセージ',
                    type: 'text',
                    description: '共有時のデフォルトメッセージをカスタマイズできます'
                }
            ],
            privacy: [
                {
                    key: 'social.privacyLevel',
                    label: '共有レベル',
                    type: 'select',
                    description: 'どの範囲まで情報を共有するかを設定します',
                    options: [
                        { value: 'public', label: '公開（すべてのユーザー）' },
                        { value: 'friends', label: 'フレンドのみ' },
                        { value: 'private', label: 'プライベート（共有しない）' }
                    ]
                },
                {
                    key: 'privacy.dataCollection',
                    label: 'データ収集を許可',
                    type: 'toggle',
                    description: 'ゲーム改善のための匿名データ収集を許可します'
                },
                {
                    key: 'privacy.analytics',
                    label: '統計データの送信',
                    type: 'toggle',
                    description: '匿名の統計データを開発者に送信します'
                },
                {
                    key: 'privacy.crashReports',
                    label: 'クラッシュレポート',
                    type: 'toggle',
                    description: 'エラー情報を自動で報告します'
                }
            ],
            notifications: [
                {
                    key: 'notifications.enabled',
                    label: '通知を有効化',
                    type: 'toggle',
                    description: 'ブラウザ通知を有効にします'
                },
                {
                    key: 'notifications.achievements',
                    label: '実績通知',
                    type: 'toggle',
                    description: '実績解除時に通知を表示します'
                },
                {
                    key: 'notifications.highScore',
                    label: 'ハイスコア通知',
                    type: 'toggle',
                    description: 'ハイスコア達成時に通知を表示します'
                },
                {
                    key: 'notifications.updates',
                    label: 'アップデート通知',
                    type: 'toggle',
                    description: 'ゲームアップデート情報を通知します'
                }
            ],
            accessibility: [
                {
                    key: 'accessibility.highContrast',
                    label: 'ハイコントラスト',
                    type: 'toggle',
                    description: '高コントラスト表示でゲームを見やすくします'
                },
                {
                    key: 'accessibility.largeText',
                    label: '大きな文字',
                    type: 'toggle',
                    description: 'テキストを大きく表示します'
                },
                {
                    key: 'accessibility.reducedMotion',
                    label: 'モーション軽減',
                    type: 'toggle',
                    description: 'アニメーションを減らして疲労を軽減します'
                },
                {
                    key: 'accessibility.screenReader',
                    label: 'スクリーンリーダー対応',
                    type: 'toggle',
                    description: 'スクリーンリーダー用の追加情報を提供します'
                }
            ]
        };
    }
    
    /**
     * シーン開始時の処理
     */
    enter(contextData?: ContextData): void {
        super.enter();
        
        // コンテキストデータの処理
        if (contextData) {
            this.currentContext = contextData;
            
            // 特定の設定へのダイレクトアクセス
            if (contextData.targetSetting) {
                this.navigateToSetting(contextData.targetSetting);
            }
            
            // コンテキストヘルプの設定
            if (contextData.fromHelp) {
                this.setupContextualHelp(contextData);
            }
        }
        
        this.loggingSystem.info('SettingsScene', 'Settings scene entered');
    }
    
    /**
     * シーン終了時の処理
     */
    exit(): void {
        super.exit();
        this.loggingSystem.info('SettingsScene', 'Settings scene exited');
    }
    
    /**
     * 更新処理
     */
    update(deltaTime: number): void {
        // 設定画面は静的なので特別な更新処理は不要
    }
    
    /**
     * 描画処理
     */
    render(context: CanvasRenderingContext2D): void {
        // 背景をクリア
        context.fillStyle = '#1a1a2e';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        
        // カテゴリリストを描画
        this.renderCategoryList(context);
        
        // 設定項目を描画
        this.renderSettingsItems(context);
        
        // ダイアログを描画
        if (this.showingConfirmDialog && this.confirmDialogData) {
            this.renderConfirmDialog(context, this.confirmDialogData);
        }
        
        if (this.showingProfileDialog && this.profileDialogData) {
            this.renderProfileDialog(context, this.profileDialogData);
        }
        
        // コンテキストヘルプを描画
        if (this.hasContextualHelp) {
            this.renderContextualHelp(context);
        }
    }
    
    /**
     * カテゴリリストの描画
     */
    private renderCategoryList(context: CanvasRenderingContext2D): void {
        const x = this.layout.settingsPadding;
        const y = this.layout.settingsPadding;
        const width = this.layout.categoryWidth;
        
        this.categories.forEach((category, index) => {
            const itemY = y + (index * this.layout.itemHeight);
            const isSelected = index === this.selectedCategoryIndex;
            
            // 背景色
            context.fillStyle = isSelected ? '#4a90e2' : '#2a2a3e';
            context.fillRect(x, itemY, width, this.layout.itemHeight - 5);
            
            // テキスト
            context.fillStyle = isSelected ? '#ffffff' : '#cccccc';
            context.font = '16px Arial, sans-serif';
            context.textAlign = 'left';
            context.textBaseline = 'middle';
            context.fillText(
                this.categoryLabels[index],
                x + 15,
                itemY + (this.layout.itemHeight / 2)
            );
        });
    }
    
    /**
     * 設定項目の描画
     */
    private renderSettingsItems(context: CanvasRenderingContext2D): void {
        const x = this.layout.settingsPadding + this.layout.categoryWidth + this.layout.settingsPadding;
        const y = this.layout.settingsPadding;
        const width = context.canvas.width - x - this.layout.settingsPadding;
        
        const items = this.settingItems[this.currentCategory] || [];
        
        items.forEach((item, index) => {
            const itemY = y + (index * this.layout.itemHeight);
            const isSelected = index === this.selectedSettingIndex;
            
            // 背景色
            context.fillStyle = isSelected ? '#3a3a4e' : '#2a2a3e';
            context.fillRect(x, itemY, width, this.layout.itemHeight - 5);
            
            // ラベル
            context.fillStyle = '#ffffff';
            context.font = '16px Arial, sans-serif';
            context.textAlign = 'left';
            context.textBaseline = 'top';
            context.fillText(item.label, x + 15, itemY + 10);
            
            // 説明
            if (item.description) {
                context.fillStyle = '#999999';
                context.font = '12px Arial, sans-serif';
                context.fillText(item.description, x + 15, itemY + 30);
            }
            
            // 値または制御要素を描画
            this.renderSettingValue(context, item, x + width - 150, itemY + 15, 140);
        });
    }
    
    /**
     * 設定値の描画
     */
    private renderSettingValue(context: CanvasRenderingContext2D, item: SettingItem, x: number, y: number, width: number): void {
        const currentValue = this.getCurrentSettingValue(item.key);
        
        switch (item.type) {
            case 'toggle':
                this.renderToggle(context, currentValue as boolean, x, y, width);
                break;
            case 'select':
                this.renderSelect(context, item, currentValue, x, y, width);
                break;
            case 'slider':
                this.renderSlider(context, item, currentValue as number, x, y, width);
                break;
            case 'text':
                this.renderTextInput(context, currentValue as string, x, y, width);
                break;
            case 'custom':
                this.renderCustomComponent(context, item, x, y, width);
                break;
        }
    }
    
    /**
     * トグルの描画
     */
    private renderToggle(context: CanvasRenderingContext2D, value: boolean, x: number, y: number, width: number): void {
        const toggleX = x + width - 60;
        const toggleY = y;
        
        // 背景
        context.fillStyle = value ? '#4a90e2' : '#666666';
        context.fillRect(toggleX, toggleY, 50, 20);
        
        // つまみ
        context.fillStyle = '#ffffff';
        const knobX = value ? toggleX + 30 : toggleX + 5;
        context.fillRect(knobX, toggleY + 2, 16, 16);
    }
    
    /**
     * セレクトの描画
     */
    private renderSelect(context: CanvasRenderingContext2D, item: SettingItem, value: any, x: number, y: number, width: number): void {
        const option = item.options?.find(opt => opt.value === value);
        const displayText = option?.label || String(value);
        
        context.fillStyle = '#444444';
        context.fillRect(x, y, width, 25);
        
        context.fillStyle = '#ffffff';
        context.font = '14px Arial, sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText(displayText, x + 10, y + 12);
    }
    
    /**
     * スライダーの描画
     */
    private renderSlider(context: CanvasRenderingContext2D, item: SettingItem, value: number, x: number, y: number, width: number): void {
        const sliderY = y + 10;
        const min = item.min || 0;
        const max = item.max || 1;
        const normalizedValue = (value - min) / (max - min);
        
        // トラック
        context.fillStyle = '#666666';
        context.fillRect(x, sliderY, width - 40, 5);
        
        // つまみ
        const knobX = x + (normalizedValue * (width - 40));
        context.fillStyle = '#4a90e2';
        context.fillRect(knobX - 5, sliderY - 5, 10, 15);
        
        // 値を表示
        context.fillStyle = '#ffffff';
        context.font = '12px Arial, sans-serif';
        context.textAlign = 'right';
        context.textBaseline = 'middle';
        context.fillText(value.toFixed(1), x + width, sliderY + 2);
    }
    
    /**
     * テキスト入力の描画
     */
    private renderTextInput(context: CanvasRenderingContext2D, value: string, x: number, y: number, width: number): void {
        context.fillStyle = '#444444';
        context.fillRect(x, y, width, 25);
        
        context.fillStyle = '#ffffff';
        context.font = '14px Arial, sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText(value || '', x + 10, y + 12);
        
        // カーソル表示（編集中の場合）
        if (this.isEditingValue) {
            const textWidth = context.measureText(this.tempValue || '').width;
            context.strokeStyle = '#ffffff';
            context.beginPath();
            context.moveTo(x + 10 + textWidth, y + 5);
            context.lineTo(x + 10 + textWidth, y + 20);
            context.stroke();
        }
    }
    
    /**
     * カスタムコンポーネントの描画
     */
    private renderCustomComponent(context: CanvasRenderingContext2D, item: SettingItem, x: number, y: number, width: number): void {
        if (item.component === 'VolumeControlComponent') {
            this.volumeControlComponent.render(context, x, y, width, 25);
        }
    }
    
    /**
     * 確認ダイアログの描画
     */
    private renderConfirmDialog(context: CanvasRenderingContext2D, dialogData: ConfirmDialogData): void {
        const dialogWidth = 400;
        const dialogHeight = 150;
        const dialogX = (context.canvas.width - dialogWidth) / 2;
        const dialogY = (context.canvas.height - dialogHeight) / 2;
        
        // 背景オーバーレイ
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        
        // ダイアログ背景
        context.fillStyle = '#2a2a3e';
        context.fillRect(dialogX, dialogY, dialogWidth, dialogHeight);
        
        // メッセージ
        context.fillStyle = '#ffffff';
        context.font = '16px Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(dialogData.message, dialogX + dialogWidth / 2, dialogY + dialogHeight / 2 - 20);
        
        // ボタン
        const buttonY = dialogY + dialogHeight - 40;
        context.fillStyle = '#4a90e2';
        context.fillRect(dialogX + 50, buttonY, 100, 30);
        context.fillRect(dialogX + dialogWidth - 150, buttonY, 100, 30);
        
        context.fillStyle = '#ffffff';
        context.font = '14px Arial, sans-serif';
        context.textAlign = 'center';
        context.fillText('OK', dialogX + 100, buttonY + 15);
        context.fillText('キャンセル', dialogX + dialogWidth - 100, buttonY + 15);
    }
    
    /**
     * プロファイルダイアログの描画
     */
    private renderProfileDialog(context: CanvasRenderingContext2D, dialogData: ProfileDialogData): void {
        // プロファイル選択ダイアログの実装（省略）
    }
    
    /**
     * コンテキストヘルプの描画
     */
    private renderContextualHelp(context: CanvasRenderingContext2D): void {
        if (!this.hasContextualHelp) return;
        
        const helpX = context.canvas.width - 300;
        const helpY = 50;
        const helpWidth = 250;
        const helpHeight = 200;
        
        // ヘルプパネル背景
        context.fillStyle = 'rgba(74, 144, 226, 0.9)';
        context.fillRect(helpX, helpY, helpWidth, helpHeight);
        
        // タイトル
        context.fillStyle = '#ffffff';
        context.font = 'bold 16px Arial, sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText(this.contextualHelpTitle || '', helpX + 10, helpY + 10);
        
        // コンテンツ
        if (this.contextualHelpContent) {
            context.font = '12px Arial, sans-serif';
            const lines = this.wrapText(context, this.contextualHelpContent, helpWidth - 20);
            lines.forEach((line, index) => {
                context.fillText(line, helpX + 10, helpY + 40 + (index * 15));
            });
        }
    }
    
    /**
     * テキストの折り返し処理
     */
    private wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = context.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
    
    /**
     * 設定値の取得
     */
    private getCurrentSettingValue(key: string): any {
        // ゲームエンジンから設定値を取得
        const keys = key.split('.');
        let value = this.gameEngine.settings || {};
        
        for (const k of keys) {
            value = value[k];
            if (value === undefined) break;
        }
        
        return value;
    }
    
    /**
     * 設定値の保存
     */
    private saveSettingValue(key: string, value: any): void {
        const keys = key.split('.');
        let target = this.gameEngine.settings || {};
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
        }
        
        target[keys[keys.length - 1]] = value;
        
        // ローカルストレージに保存
        try {
            localStorage.setItem('bubblePop_settings', JSON.stringify(this.gameEngine.settings));
        } catch (error) {
            this.loggingSystem.error('SettingsScene', 'Failed to save settings to localStorage', error);
        }
    }
    
    /**
     * 特定の設定にナビゲート
     */
    private navigateToSetting(settingKey: string): void {
        for (let i = 0; i < this.categories.length; i++) {
            const categoryItems = this.settingItems[this.categories[i]] || [];
            const settingIndex = categoryItems.findIndex(item => item.key === settingKey);
            
            if (settingIndex !== -1) {
                this.selectedCategoryIndex = i;
                this.currentCategory = this.categories[i];
                this.selectedSettingIndex = settingIndex;
                break;
            }
        }
    }
    
    /**
     * コンテキストヘルプの設定
     */
    private setupContextualHelp(contextData: ContextData): void {
        this.hasContextualHelp = true;
        this.contextualHelpTitle = 'ヘルプ';
        this.contextualHelpContent = 'ここでゲームの各種設定を変更できます。';
        this.contextualHelpActions = ['OK'];
    }
    
    /**
     * メインメニューに戻る
     */
    goBack(): void {
        if (this.currentContext?.returnScene) {
            this.gameEngine.sceneManager.switchScene(this.currentContext.returnScene);
        } else {
            this.gameEngine.sceneManager.switchScene('menu');
        }
    }
    
    /**
     * キーボード入力処理
     */
    handleKeyboard(event: KeyboardEvent): void {
        switch (event.key) {
            case 'Escape':
                if (this.showingConfirmDialog) {
                    this.showingConfirmDialog = false;
                    this.confirmDialogData = null;
                } else if (this.showingProfileDialog) {
                    this.showingProfileDialog = false;
                    this.profileDialogData = null;
                } else {
                    this.goBack();
                }
                break;
            case 'ArrowUp':
                if (this.selectedSettingIndex > 0) {
                    this.selectedSettingIndex--;
                }
                break;
            case 'ArrowDown':
                const items = this.settingItems[this.currentCategory] || [];
                if (this.selectedSettingIndex < items.length - 1) {
                    this.selectedSettingIndex++;
                }
                break;
            case 'ArrowLeft':
                if (this.selectedCategoryIndex > 0) {
                    this.selectedCategoryIndex--;
                    this.currentCategory = this.categories[this.selectedCategoryIndex];
                    this.selectedSettingIndex = 0;
                }
                break;
            case 'ArrowRight':
                if (this.selectedCategoryIndex < this.categories.length - 1) {
                    this.selectedCategoryIndex++;
                    this.currentCategory = this.categories[this.selectedCategoryIndex];
                    this.selectedSettingIndex = 0;
                }
                break;
            case 'Enter':
                this.handleSettingActivation();
                break;
        }
    }
    
    /**
     * 設定項目の活性化処理
     */
    private handleSettingActivation(): void {
        const items = this.settingItems[this.currentCategory] || [];
        const item = items[this.selectedSettingIndex];
        
        if (!item) return;
        
        switch (item.type) {
            case 'toggle':
                const currentValue = this.getCurrentSettingValue(item.key);
                this.saveSettingValue(item.key, !currentValue);
                break;
            case 'select':
                // セレクトボックスの展開処理
                break;
            case 'text':
                this.isEditingValue = true;
                this.tempValue = this.getCurrentSettingValue(item.key) || '';
                break;
        }
    }
    
    /**
     * クリック処理
     */
    handleClick(x: number, y: number): void {
        // カテゴリクリック判定
        if (x < this.layout.categoryWidth + this.layout.settingsPadding) {
            const categoryIndex = Math.floor((y - this.layout.settingsPadding) / this.layout.itemHeight);
            if (categoryIndex >= 0 && categoryIndex < this.categories.length) {
                this.selectedCategoryIndex = categoryIndex;
                this.currentCategory = this.categories[categoryIndex];
                this.selectedSettingIndex = 0;
            }
            return;
        }
        
        // 設定項目クリック判定
        const settingsX = this.layout.settingsPadding + this.layout.categoryWidth + this.layout.settingsPadding;
        if (x >= settingsX) {
            const settingIndex = Math.floor((y - this.layout.settingsPadding) / this.layout.itemHeight);
            const items = this.settingItems[this.currentCategory] || [];
            
            if (settingIndex >= 0 && settingIndex < items.length) {
                this.selectedSettingIndex = settingIndex;
                this.handleSettingActivation();
            }
        }
    }
}