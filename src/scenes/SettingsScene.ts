import { Scene } from '../core/Scene.js';
import { NavigationContextManager } from '../core/navigation/NavigationContextManager.js';
import { getLoggingSystem } from '../core/LoggingSystem.js';
import { AccessibilitySettingsManager } from './settings-scene/AccessibilitySettingsManager.js';
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
    description?: string;
    options?: SettingOption[];
    component?: string;
    min?: number;
    max?: number;
    step?: number;
    default?: any;
    validator?: string;
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
                { key: 'ui.language', label: '言語', type: 'select', options: [
                    { value: 'ja', label: '日本語' },
                    { value: 'en', label: 'English' }
                ]},
                { key: 'ui.quality', label: '画質', type: 'select', options: [
                    { value: 'low', label: '低' },
                    { value: 'medium', label: '中' },
                    { value: 'high', label: '高' },
                    { value: 'auto', label: '自動' }
                ]},
                { key: 'audio.muted', label: '音声ミュート', type: 'toggle', description: 'すべての音声をミュートにします' },
                { key: 'audio.masterVolume', label: 'マスター音量', type: 'custom', component: 'VolumeControlComponent', description: '音量を調整します' },
                { key: 'audio.sfxVolume', label: '効果音音量', type: 'slider', min: 0, max: 1, step: 0.1 },
                { key: 'audio.bgmVolume', label: 'BGM音量', type: 'slider', min: 0, max: 1, step: 0.1 }
            ],
            social: [
                { key: 'social.enableSharing', label: 'ソーシャル共有を有効化', type: 'toggle', description: 'スコアや実績の共有機能を有効にします' },
                { key: 'social.autoPromptHighScore', label: 'ハイスコア時の自動プロンプト', type: 'toggle', description: 'ハイスコアを達成した時に自動的に共有画面を表示します' },
                { key: 'social.autoPromptAchievements', label: '実績解除時の自動プロンプト', type: 'toggle', description: '実績を解除した時に自動的に共有画面を表示します' },
                { key: 'social.defaultPlatform', label: 'デフォルト共有先', type: 'select', options: [
                    { value: 'auto', label: '自動選択' },
                    { value: 'twitter', label: 'Twitter/X' },
                    { value: 'facebook', label: 'Facebook' },
                    { value: 'native', label: 'システム標準' }
                ]},
                { key: 'social.includeScreenshot', label: 'スクリーンショットを含む', type: 'toggle', description: '共有時にゲーム画面のスクリーンショットを含めます' },
                { key: 'social.screenshotQuality', label: 'スクリーンショット画質', type: 'select', options: [
                    { value: 'low', label: '低（軽量）' },
                    { value: 'medium', label: '中（標準）' },
                    { value: 'high', label: '高（高品質）' }
                ]},
                { key: 'social.showWatermark', label: 'ウォーターマークを表示', type: 'toggle', description: 'スクリーンショットにゲーム名を表示します' },
                { key: 'social.customMessage', label: 'カスタムメッセージ', type: 'text', description: '共有時のデフォルトメッセージをカスタマイズできます' }
            ],
            privacy: [
                { key: 'social.privacyLevel', label: '共有レベル', type: 'select', options: [
                    { value: 'public', label: '公開（すべてのユーザー）' },
                    { value: 'friends', label: 'フレンドのみ' },
                    { value: 'private', label: 'プライベート（共有しない）' }
                ], description: 'どの範囲まで情報を共有するかを設定します' },
                { key: 'privacy.dataCollection', label: 'データ収集を許可', type: 'toggle', description: 'ゲーム改善のための匿名データ収集を許可します' },
                { key: 'privacy.analytics', label: '使用状況分析を許可', type: 'toggle', description: 'プレイ統計の分析を許可します' },
                { key: 'privacy.crashReports', label: 'クラッシュレポートの送信', type: 'toggle', description: 'エラー発生時の情報を開発者に送信します' }
            ],
            notifications: [
                { key: 'notifications.challenges.enabled', label: 'チャレンジ通知', type: 'toggle', description: 'チャレンジ関連の通知を受け取ります' },
                { key: 'notifications.challenges.newChallenge', label: '新しいチャレンジ', type: 'toggle', description: '新しいチャレンジが追加された時に通知します' },
                { key: 'notifications.challenges.challengeComplete', label: 'チャレンジ完了', type: 'toggle', description: 'チャレンジを完了した時に通知します' },
                { key: 'notifications.challenges.dailyReminder', label: 'デイリーリマインダー', type: 'toggle', description: '毎日決まった時間にチャレンジを促します' },
                { key: 'notifications.achievements.enabled', label: '実績通知', type: 'toggle', description: '実績関連の通知を受け取ります' },
                { key: 'notifications.achievements.unlocked', label: '実績解除通知', type: 'toggle', description: '実績を解除した時に通知します' },
                { key: 'notifications.achievements.progress', label: '進捗通知', type: 'toggle', description: '実績の進捗状況を定期的に通知します' },
                { key: 'notifications.leaderboard.enabled', label: 'ランキング通知', type: 'toggle', description: 'ランキング関連の通知を受け取ります' },
                { key: 'notifications.leaderboard.newRecord', label: '新記録通知', type: 'toggle', description: '自己ベストを更新した時に通知します' }
            ],
            accessibility: this.getAccessibilitySettingsItems()
        };
    }
    
    /**
     * アクセシビリティ設定項目の取得
     */
    getAccessibilitySettingsItems(): SettingItem[] {
        // 基本設定項目を取得
        let accessibilityItems = [];
        
        if (this.accessibilitySettingsManager) {
            accessibilityItems = this.accessibilitySettingsManager.getExtendedAccessibilitySettings();
        } else {
            // フォールバック設定項目
            accessibilityItems = [
                { key: 'accessibility.highContrast', label: 'ハイコントラスト', type: 'toggle', description: 'より見やすい高コントラスト表示にします', validator: 'toggle' },
                { key: 'accessibility.reducedMotion', label: 'アニメーション削減', type: 'toggle', description: 'アニメーションや動きを削減します', validator: 'toggle' },
                { key: 'accessibility.largeText', label: '大きな文字', type: 'toggle', description: 'UI の文字サイズを大きくします', validator: 'toggle' },
                { key: 'accessibility.screenReader', label: 'スクリーンリーダー対応', type: 'toggle', description: 'スクリーンリーダーでの読み上げに対応します', validator: 'toggle' },
                { key: 'accessibility.colorBlindSupport', label: '色覚サポート', type: 'toggle', description: '色覚に配慮した表示にします', validator: 'toggle' }
            ] as SettingItem[];
        }
        
        // 不足している基本アクセシビリティ設定の確認・追加
        const requiredBasicSettings: SettingItem[] = [
            { key: 'accessibility.highContrast', label: 'ハイコントラスト', type: 'toggle', description: 'より見やすい高コントラスト表示にします', validator: 'toggle' },
            { key: 'accessibility.largeText', label: '大きな文字', type: 'toggle', description: 'UI の文字サイズを大きくします', validator: 'toggle' },
            { key: 'accessibility.reducedMotion', label: 'アニメーション削減', type: 'toggle', description: 'アニメーションや動きを削減します', validator: 'toggle' }
        ];
        
        for (const requiredSetting of requiredBasicSettings) {
            const exists = accessibilityItems.some(item => item.key === requiredSetting.key);
            if (!exists) {
                accessibilityItems.push(requiredSetting);
            }
        }
        
        // AccessibilityProfileComponentの追加
        accessibilityItems.push({
            key: 'accessibility.profiles',
            label: 'アクセシビリティプロファイル',
            type: 'custom',
            component: 'AccessibilityProfileComponent',
            description: 'プリセットされたアクセシビリティ設定プロファイルを適用します',
            validator: 'profile'
        } as SettingItem);
        
        // SettingsImportExportComponentの追加
        accessibilityItems.push({
            key: 'accessibility.importExport',
            label: '設定のインポート・エクスポート',
            type: 'custom',
            component: 'SettingsImportExportComponent',
            description: 'アクセシビリティ設定をファイルとして保存・読み込みします',
            validator: 'importExport'
        } as SettingItem);
        
        // 項目の有効性を検証
        const validItems = accessibilityItems.filter(item => {
            if (!item || !item.key || !item.label) {
                console.warn('[SettingsScene] Invalid accessibility item filtered out:', item);
                return false;
            }
            return true;
        });
        
        return validItems as SettingItem[];
    }
    
    /**
     * シーン開始時の処理
     */
    enter(contextData: ContextData = {}): void {
        this.currentCategory = 'social';
        this.selectedCategoryIndex = 1;
        this.selectedSettingIndex = 0;
        this.isEditingValue = false;
        this.showingConfirmDialog = false;
        
        // コンテキストデータの処理
        this.processEntryContext(contextData);
        
        console.log('[SettingsScene] 設定画面に入りました', {
            contextData,
            accessMethod: contextData.accessMethod
        });
        
        this.loggingSystem.info('SettingsScene', 'Settings scene entered', {
            contextData,
            accessMethod: contextData.accessMethod
        });
    }
    
    /**
     * エントリコンテキストの処理
     * @param contextData - コンテキストデータ
     */
    processEntryContext(contextData: ContextData): void {
        try {
            // アクセス方法に応じた初期設定
            if (contextData.accessMethod) {
                if (contextData.accessMethod.includes('help')) {
                    // ヘルプから設定に来た場合はアクセシビリティカテゴリを開く
                    this.setAccessibilityFocusMode();
                } else if (contextData.fromHelp) {
                    // ヘルプ経由でのアクセス
                    this.setHelpIntegratedMode();
                } else if (contextData.quickAccess) {
                    // クイックアクセスモード
                    this.setQuickAccessMode(contextData.targetSetting);
                }
            }
            
            // ソースシーンに基づくカテゴリ設定
            if (contextData.sourceScene) {
                this.adjustCategoryForSourceScene(contextData.sourceScene);
            }
            
            this.loggingSystem.debug('SettingsScene', 'Entry context processed', contextData);
        } catch (error) {
            this.loggingSystem.error('SettingsScene', 'Error processing entry context', error);
        }
    }
    
    /**
     * アクセシビリティフォーカスモードの設定
     */
    setAccessibilityFocusMode(): void {
        this.currentCategory = 'accessibility';
        this.selectedCategoryIndex = this.categories.indexOf('accessibility');
        this.selectedSettingIndex = 0;
        this.loggingSystem.info('SettingsScene', 'Accessibility focus mode activated');
    }
    
    /**
     * ヘルプ統合モードの設定
     */
    setHelpIntegratedMode() {
        // ヘルプからのアクセスの場合、一般設定から開始
        this.currentCategory = 'general';
        this.selectedCategoryIndex = 0;
        this.loggingSystem.info('SettingsScene', 'Help integrated mode activated');
    }
    
    /**
     * クイックアクセスモードの設定
     * @param {string} targetSetting - 対象設定項目
     */
    setQuickAccessMode(targetSetting: any) {
        if (targetSetting) {
            // 特定の設定項目に直接移動
            this.navigateToSetting(targetSetting);
        }
        this.loggingSystem.info('SettingsScene', `Quick access mode for: ${targetSetting}`);
    }
    
    /**
     * ソースシーンに基づくカテゴリ調整
     * @param {string} sourceScene - ソースシーン
     */
    adjustCategoryForSourceScene(sourceScene: any) {
        switch (sourceScene) {
            case 'game':
                this.currentCategory = 'general';
                this.selectedCategoryIndex = 0;
                break;
            case 'social':
                this.currentCategory = 'social';
                this.selectedCategoryIndex = 1;
                break;
            default:
                // デフォルトはsocialのまま
                break;
        }
    }
    
    /**
     * 特定設定項目への直接ナビゲーション
     * @param {string} settingKey - 設定キー
     */
    navigateToSetting(settingKey: any) {
        // 設定キーからカテゴリを特定
        for (const [categoryName, items] of Object.entries(this.settingItems)) {
            const itemIndex = items.findIndex(item => item.key === settingKey);
            if (itemIndex !== -1) {
                this.currentCategory = categoryName;
                this.selectedCategoryIndex = this.categories.indexOf(categoryName);
                this.selectedSettingIndex = itemIndex;
                return true;
            }
        }
        return false;
    }

    /**
     * シーン終了時の処理
     */
    exit() {
        // 変更を保存
        this.saveSettings();
        console.log('[SettingsScene] 設定画面を終了します');
        
        this.loggingSystem.info('SettingsScene', 'Settings scene exited');
    }
    
    /**
     * 更新処理
     */
    update(__deltaTime: number): void {
        // 必要に応じて動的な処理を追加
    }
    
    /**
     * 描画処理
     */
    render(context: CanvasRenderingContext2D): void {
        const canvas = context.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        // 背景
        context.fillStyle = '#f8f9fa';
        context.fillRect(0, 0, width, height);
        
        // タイトル
        this.renderTitle(context, width);
        
        // カテゴリ一覧（左側）
        this.renderCategories(context, height);
        
        // 設定項目（右側）
        this.renderSettings(context, width, height);
        
        // 確認ダイアログ
        if (this.showingConfirmDialog) {
            this.renderConfirmDialog(context, width, height);
        }
        
        // 操作説明
        this.renderHelp(context, width, height);
    }
    
    /**
     * タイトル描画
     */
    renderTitle(context: any, width: number) {
        // Transform行列のスケールを考慮した中央位置
        const transform = context.getTransform();
        const centerX = (width / 2) / transform.a;
        
        context.fillStyle = '#2c3e50';
        context.font = 'bold 24px Arial, sans-serif';
        context.textAlign = 'center';
        context.fillText('設定', centerX, 40);
        
        // 区切り線
        context.strokeStyle = '#bdc3c7';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(50, 60);
        context.lineTo(width - 50, 60);
        context.stroke();
    }
    
    /**
     * カテゴリ一覧描画
     */
    renderCategories(context, __height) {
        const startY = 80;
        const categoryHeight = 50;
        
        for (let i = 0; i < this.categories.length; i++) {
            const y = startY + i * categoryHeight;
            const isSelected = i === this.selectedCategoryIndex;
            
            // 背景
            if (isSelected) {
                context.fillStyle = '#3498db';
            } else {
                context.fillStyle = '#ecf0f1';
            }
            
            context.fillRect(10, y, this.layout.categoryWidth, categoryHeight - 5);
            
            // テキスト
            context.fillStyle = isSelected ? '#ffffff' : '#2c3e50';
            context.font = '16px Arial, sans-serif';
            context.textAlign = 'left';
            context.fillText(this.categoryLabels[i], 20, y + categoryHeight / 2 + 5);
        }
    }
    
    /**
     * 設定項目描画
     */
    renderSettings(context, width, __height) {
        const startX = this.layout.categoryWidth + 30;
        const startY = 80;
        const settingsWidth = width - startX - 20;
        
        
        const currentItems = this.settingItems[this.currentCategory] || [];
        
        // カテゴリタイトル
        context.fillStyle = '#2c3e50';
        context.font = 'bold 20px Arial, sans-serif';
        context.textAlign = 'left';
        context.fillText(this.categoryLabels[this.selectedCategoryIndex], startX, startY + 25);
        
        // 設定項目
        const itemStartY = startY + 50;
        for (let i = 0; i < currentItems.length; i++) {
            const item = currentItems[i];
            
            if (!item || !item.key) {
                continue;
            }
            
            const y = itemStartY + i * this.layout.itemHeight;
            const isSelected = i === this.selectedSettingIndex && !this.showingConfirmDialog;
            
            this.renderSettingItem(context, item, startX, y, settingsWidth, isSelected);
        }
    }
    
    /**
     * 個別設定項目描画
     */
    renderSettingItem(context, item, x, y, width, isSelected) {
        const itemHeight = this.layout.itemHeight - 10;
        
        // 背景
        if (isSelected) {
            context.fillStyle = '#e8f4fd';
            context.fillRect(x, y, width, itemHeight);
        }
        
        // ラベル
        context.fillStyle = '#2c3e50';
        context.font = '16px Arial, sans-serif';
        context.textAlign = 'left';
        context.fillText(item.label, x + 10, y + 25);
        
        // 説明（ある場合）
        if (item.description) {
            context.fillStyle = '#7f8c8d';
            context.font = '12px Arial, sans-serif';
            context.fillText(item.description, x + 10, y + 42);
        }
        
        // 現在の値を取得
        if (!item || !item.key) {
            return;
        }

        let currentValue;
        if (item.key === 'audio.muted') {
            // ミュート状態をAudioManagerから取得
            currentValue = this.gameEngine.audioManager ? this.gameEngine.audioManager.isMuted() : false;
        } else {
            try {
                currentValue = this.gameEngine.settingsManager.get(item.key);
            } catch (error) {
                console.warn('[SettingsScene] Failed to get setting value for key:', item.key, error);
                currentValue = item.default || false;
            }
        }
        
        // 値の表示
        this.renderSettingValue(context, item, currentValue, x + width - 200, y, 180, isSelected);
    }
    
    /**
     * 設定値の描画
     */
    renderSettingValue(context, item, value, x, y, width, isSelected) {
        const __height = 30;
        const centerY = y + 20;
        
        switch (item.type) {
            case 'toggle':
                this.renderToggle(context, value, x + width - 60, centerY, isSelected);
                break;
                
            case 'select':
                this.renderSelect(context, item, value, x, centerY, width, isSelected);
                break;
                
            case 'slider':
                this.renderSlider(context, item, value, x, centerY, width, isSelected);
                break;
                
            case 'text':
                this.renderTextInput(context, value, x, centerY, width, isSelected);
                break;
                
            case 'custom':
                this.renderCustomControl(context, item, value, x, centerY, width, isSelected);
                break;
        }
    }
    
    /**
     * トグルスイッチ描画
     */
    renderToggle(context, value, x, y, isSelected) {
        const width = 50;
        const height = 24;
        const toggleX = x - width / 2;
        const toggleY = y - height / 2;
        
        // 背景
        context.fillStyle = value ? '#2ecc71' : '#bdc3c7';
        context.fillRect(toggleX, toggleY, width, height);
        
        // つまみ
        const knobX = value ? toggleX + width - 22 : toggleX + 2;
        context.fillStyle = '#ffffff';
        context.fillRect(knobX, toggleY + 2, 20, height - 4);
        
        // 選択時の枠線
        if (isSelected) {
            context.strokeStyle = '#3498db';
            context.lineWidth = 2;
            context.strokeRect(toggleX - 2, toggleY - 2, width + 4, height + 4);
        }
    }
    
    /**
     * セレクトボックス描画
     */
    renderSelect(context, item, value, x, y, width, isSelected) {
        const height = 30;
        const selectY = y - height / 2;
        
        // 背景
        context.fillStyle = '#ffffff';
        context.fillRect(x, selectY, width, height);
        
        // 枠線
        context.strokeStyle = isSelected ? '#3498db' : '#bdc3c7';
        context.lineWidth = isSelected ? 2 : 1;
        context.strokeRect(x, selectY, width, height);
        
        // 現在の値のラベル
        const selectedOption = item.options.find(opt => opt.value === value);
        const displayText = selectedOption ? selectedOption.label : value;
        
        context.fillStyle = '#2c3e50';
        context.font = '14px Arial, sans-serif';
        context.textAlign = 'left';
        context.fillText(displayText, x + 10, y + 5);
        
        // ドロップダウン矢印
        context.fillStyle = '#7f8c8d';
        context.fillText('▼', x + width - 20, y + 5);
    }
    
    /**
     * スライダー描画
     */
    renderSlider(context, item, value, x, y, width, isSelected) {
        const sliderWidth = width - 60;
        const sliderHeight = 6;
        const sliderY = y - sliderHeight / 2;
        
        // スライダーの背景
        context.fillStyle = '#bdc3c7';
        context.fillRect(x, sliderY, sliderWidth, sliderHeight);
        
        // スライダーの進行部分
        const progress = (value - (item.min || 0)) / ((item.max || 1) - (item.min || 0));
        context.fillStyle = '#3498db';
        context.fillRect(x, sliderY, sliderWidth * progress, sliderHeight);
        
        // つまみ
        const knobX = x + sliderWidth * progress - 8;
        const knobY = y - 8;
        context.fillStyle = isSelected ? '#2980b9' : '#3498db';
        context.fillRect(knobX, knobY, 16, 16);
        
        // 値の表示
        context.fillStyle = '#2c3e50';
        context.font = '14px Arial, sans-serif';
        context.textAlign = 'right';
        context.fillText(Math.round(value * 100) / 100, x + width, y + 5);
    }
    
    /**
     * カスタムコントロール描画
     */
    renderCustomControl(context, item, value, x, y, width, isSelected) {
        switch (item.component) {
            case 'VolumeControlComponent':
                this.renderVolumeControl(context, value, x, y, width, isSelected);
                break;
                
            case 'AccessibilityProfileComponent':
                this.renderAccessibilityProfileControl(context, value, x, y, width, isSelected);
                break;
                
            case 'SettingsImportExportComponent':
                this.renderSettingsImportExportControl(context, value, x, y, width, isSelected);
                break;
                
            default:
                // フォールバック：不明なカスタムコンポーネントの場合はテキスト表示
                context.fillStyle = '#7f8c8d';
                context.font = '14px Arial, sans-serif';
                context.textAlign = 'center';
                context.fillText('カスタムコンポーネント', x + width / 2, y + 5);
                break;
        }
    }
    
    /**
     * ボリュームコントロール描画
     */
    renderVolumeControl(context, value, x, y, width, isSelected) {
        const controlWidth = width - 20;
        const controlHeight = 30;
        const controlY = y - controlHeight / 2;
        
        // 背景
        context.fillStyle = isSelected ? '#e8f4fd' : '#f8f9fa';
        context.fillRect(x, controlY, controlWidth, controlHeight);
        
        // 枠線
        context.strokeStyle = isSelected ? '#3498db' : '#bdc3c7';
        context.lineWidth = isSelected ? 2 : 1;
        context.strokeRect(x, controlY, controlWidth, controlHeight);
        
        // ボタン部分のレイアウト
        const buttonWidth = 30;
        const buttonHeight = 24;
        const buttonY = controlY + 3;
        const progressBarWidth = controlWidth - (buttonWidth * 2) - 40;
        const progressBarX = x + buttonWidth + 10;
        const progressBarY = y - 4;
        const progressBarHeight = 8;
        
        // 音量ダウンボタン
        context.fillStyle = (value > 0) ? '#3498db' : '#95a5a6';
        context.fillRect(x + 5, buttonY, buttonWidth, buttonHeight);
        context.fillStyle = '#ffffff';
        context.font = '14px Arial, sans-serif';
        context.textAlign = 'center';
        context.fillText('🔉', x + 5 + buttonWidth / 2, buttonY + 16);
        
        // プログレスバー背景
        context.fillStyle = '#bdc3c7';
        context.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
        
        // プログレスバー進行部分
        const progress = value || 0;
        context.fillStyle = '#3498db';
        context.fillRect(progressBarX, progressBarY, progressBarWidth * progress, progressBarHeight);
        
        // 音量アップボタン
        context.fillStyle = (value < 1) ? '#3498db' : '#95a5a6';
        context.fillRect(x + controlWidth - buttonWidth - 5, buttonY, buttonWidth, buttonHeight);
        context.fillStyle = '#ffffff';
        context.fillText('🔊', x + controlWidth - buttonWidth / 2 - 5, buttonY + 16);
        
        // 音量パーセンテージ表示
        context.fillStyle = '#2c3e50';
        context.font = '12px Arial, sans-serif';
        context.textAlign = 'right';
        context.fillText(`${Math.round((value || 0) * 100)}%`, x + controlWidth - 5, y + 15);
        
        // 選択時の追加表示
        if (isSelected) {
            context.fillStyle = '#3498db';
            context.font = '10px Arial, sans-serif';
            context.textAlign = 'center';
            context.fillText('Enter: 音量アップ', x + controlWidth / 2, controlY + controlHeight + 12);
        }
    }
    
    /**
     * アクセシビリティプロファイルコントロール描画
     */
    renderAccessibilityProfileControl(context, __value, x, y, width, isSelected) {
        const controlWidth = width - 20;
        const controlHeight = 30;
        const controlY = y - controlHeight / 2;
        
        // 背景
        context.fillStyle = isSelected ? '#e8f4fd' : '#f8f9fa';
        context.fillRect(x, controlY, controlWidth, controlHeight);
        
        // 枠線
        context.strokeStyle = isSelected ? '#3498db' : '#bdc3c7';
        context.lineWidth = isSelected ? 2 : 1;
        context.strokeRect(x, controlY, controlWidth, controlHeight);
        
        // プロファイル情報
        const currentProfile = this.accessibilitySettingsManager ? 
            this.accessibilitySettingsManager.getCurrentProfile() : null;
        const profileName = currentProfile ? currentProfile.name : '標準';
        
        // プロファイル名表示
        context.fillStyle = '#2c3e50';
        context.font = '14px Arial, sans-serif';
        context.textAlign = 'left';
        context.fillText(`現在: ${profileName}`, x + 10, y + 5);
        
        // プロファイル切り替えボタン
        const buttonWidth = 60;
        const buttonHeight = 24;
        const buttonY = controlY + 3;
        const buttonX = x + controlWidth - buttonWidth - 5;
        
        context.fillStyle = isSelected ? '#3498db' : '#95a5a6';
        context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        context.fillStyle = '#ffffff';
        context.font = '12px Arial, sans-serif';
        context.textAlign = 'center';
        context.fillText('変更', buttonX + buttonWidth / 2, buttonY + 16);
        
        // 選択時の操作説明
        if (isSelected) {
            context.fillStyle = '#3498db';
            context.font = '10px Arial, sans-serif';
            context.textAlign = 'center';
            context.fillText('Enter: プロファイル選択', x + controlWidth / 2, controlY + controlHeight + 12);
        }
    }
    
    /**
     * 設定インポート・エクスポートコントロール描画
     */
    renderSettingsImportExportControl(context, __value, x, y, width, isSelected) {
        const controlWidth = width - 20;
        const controlHeight = 30;
        const controlY = y - controlHeight / 2;
        
        // 背景
        context.fillStyle = isSelected ? '#e8f4fd' : '#f8f9fa';
        context.fillRect(x, controlY, controlWidth, controlHeight);
        
        // 枠線
        context.strokeStyle = isSelected ? '#3498db' : '#bdc3c7';
        context.lineWidth = isSelected ? 2 : 1;
        context.strokeRect(x, controlY, controlWidth, controlHeight);
        
        // ボタンレイアウト
        const buttonWidth = 50;
        const buttonHeight = 24;
        const buttonY = controlY + 3;
        const spacing = 10;
        
        // エクスポートボタン
        const exportButtonX = x + 10;
        context.fillStyle = '#2ecc71';
        context.fillRect(exportButtonX, buttonY, buttonWidth, buttonHeight);
        context.fillStyle = '#ffffff';
        context.font = '12px Arial, sans-serif';
        context.textAlign = 'center';
        context.fillText('保存', exportButtonX + buttonWidth / 2, buttonY + 16);
        
        // インポートボタン
        const importButtonX = exportButtonX + buttonWidth + spacing;
        context.fillStyle = '#e74c3c';
        context.fillRect(importButtonX, buttonY, buttonWidth, buttonHeight);
        context.fillStyle = '#ffffff';
        context.fillText('読込', importButtonX + buttonWidth / 2, buttonY + 16);
        
        // 選択時の操作説明
        if (isSelected) {
            context.fillStyle = '#3498db';
            context.font = '10px Arial, sans-serif';
            context.textAlign = 'center';
            context.fillText('Enter: インポート/エクスポート選択', x + controlWidth / 2, controlY + controlHeight + 12);
        }
    }
    
    /**
     * テキスト入力描画
     */
    renderTextInput(context, value, x, y, width, isSelected) {
        const height = 30;
        const inputY = y - height / 2;
        
        // 背景
        context.fillStyle = '#ffffff';
        context.fillRect(x, inputY, width, height);
        
        // 枠線
        context.strokeStyle = isSelected ? '#3498db' : '#bdc3c7';
        context.lineWidth = isSelected ? 2 : 1;
        context.strokeRect(x, inputY, width, height);
        
        // テキスト
        context.fillStyle = '#2c3e50';
        context.font = '14px Arial, sans-serif';
        context.textAlign = 'left';
        
        const displayText = this.isEditingValue ? (this.tempValue || '') : (value || '未設定');
        const maxWidth = width - 20;
        
        // テキストが長すぎる場合は省略
        let truncatedText = displayText;
        if (context.measureText(displayText).width > maxWidth) {
            truncatedText = displayText.substring(0, 20) + '...';
        }
        
        context.fillText(truncatedText, x + 10, y + 5);
        
        // 編集中のカーソル
        if (isSelected && this.isEditingValue) {
            const textWidth = context.measureText(this.tempValue || '').width;
            context.strokeStyle = '#2c3e50';
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(x + 10 + textWidth, y - 10);
            context.lineTo(x + 10 + textWidth, y + 10);
            context.stroke();
        }
    }
    
    /**
     * 確認ダイアログ描画
     */
    renderConfirmDialog(context, width, height) {
        // オーバーレイ
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, width, height);
        
        // ダイアログ
        const dialogWidth = 400;
        const dialogHeight = 200;
        const dialogX = (width - dialogWidth) / 2;
        const dialogY = (height - dialogHeight) / 2;
        
        context.fillStyle = '#ffffff';
        context.fillRect(dialogX, dialogY, dialogWidth, dialogHeight);
        
        context.strokeStyle = '#bdc3c7';
        context.lineWidth = 1;
        context.strokeRect(dialogX, dialogY, dialogWidth, dialogHeight);
        
        // メッセージ
        context.fillStyle = '#2c3e50';
        context.font = '16px Arial, sans-serif';
        context.textAlign = 'center';
        context.fillText(
            this.confirmDialogData?.message || '設定を変更しますか？',
            dialogX + dialogWidth / 2,
            dialogY + 80
        );
        
        // ボタン
        const buttonWidth = 80;
        const buttonHeight = 35;
        const buttonY = dialogY + dialogHeight - 60;
        
        // キャンセルボタン
        context.fillStyle = '#95a5a6';
        context.fillRect(dialogX + 80, buttonY, buttonWidth, buttonHeight);
        context.fillStyle = '#ffffff';
        context.fillText('キャンセル', dialogX + 80 + buttonWidth / 2, buttonY + 22);
        
        // OKボタン
        context.fillStyle = '#3498db';
        context.fillRect(dialogX + dialogWidth - 160, buttonY, buttonWidth, buttonHeight);
        context.fillStyle = '#ffffff';
        context.fillText('OK', dialogX + dialogWidth - 160 + buttonWidth / 2, buttonY + 22);
    }
    
    /**
     * 操作説明描画
     */
    renderHelp(context, width, height) {
        const helpY = height - 40;
        
        context.fillStyle = '#7f8c8d';
        context.font = '12px Arial, sans-serif';
        context.textAlign = 'center';
        context.fillText(
            '↑↓: 項目選択  ←→: カテゴリ切り替え  Enter: 設定変更  Esc: 戻る',
            width / 2,
            helpY
        );
    }
    
    /**
     * 入力処理
     */
    handleInput(event: Event): boolean | void {
        if (event.type === 'keydown') {
            this.handleKeyInput(event as KeyboardEvent);
        } else if (event.type === 'click' || event.type === 'touchstart') {
            this.handleMouseInput(event);
        }
    }
    
    /**
     * キーボード入力処理
     */
    handleKeyInput(event: KeyboardEvent): void {
        if (this.showingConfirmDialog) {
            this.handleConfirmDialogInput(event);
            return;
        }
        
        if (this.isEditingValue) {
            this.handleEditingInput(event);
            return;
        }
        
        switch (event.key) {
            case 'ArrowUp':
                this.selectedSettingIndex = Math.max(0, this.selectedSettingIndex - 1);
                break;
                
            case 'ArrowDown':
                const maxIndex = (this.settingItems[this.currentCategory] || []).length - 1;
                this.selectedSettingIndex = Math.min(maxIndex, this.selectedSettingIndex + 1);
                break;
                
            case 'ArrowLeft':
                this.selectedCategoryIndex = Math.max(0, this.selectedCategoryIndex - 1);
                this.switchCategory();
                break;
                
            case 'ArrowRight':
                this.selectedCategoryIndex = Math.min(this.categories.length - 1, this.selectedCategoryIndex + 1);
                this.switchCategory();
                break;
                
            case 'Enter':
                this.activateCurrentSetting();
                break;
                
            case 'Escape':
                this.goBack();
                break;
                
            // アクセシビリティ設定の拡張機能
            case 'p':
            case 'P':
                if (event.ctrlKey && this.currentCategory === 'accessibility') {
                    this.showAccessibilityProfiles();
                }
                break;
                
            case 'e':
            case 'E':
                if (event.ctrlKey && this.currentCategory === 'accessibility') {
                    this.exportAccessibilitySettings();
                }
                break;
                
            case 'i':
            case 'I':
                if (event.ctrlKey && this.currentCategory === 'accessibility') {
                    this.importAccessibilitySettings();
                }
                break;
        }
    }
    
    /**
     * マウス入力処理
     */
    handleMouseInput(event) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // カテゴリクリック判定
        if (x < this.layout.categoryWidth + 10) {
            const categoryIndex = Math.floor((y - 80) / 50);
            if (categoryIndex >= 0 && categoryIndex < this.categories.length) {
                this.selectedCategoryIndex = categoryIndex;
                this.switchCategory();
            }
        }
        
        // 設定項目クリック判定
        else if (x > this.layout.categoryWidth + 30) {
            const itemStartY = 130;
            const itemIndex = Math.floor((y - itemStartY) / this.layout.itemHeight);
            const maxIndex = (this.settingItems[this.currentCategory] || []).length - 1;
            
            if (itemIndex >= 0 && itemIndex <= maxIndex) {
                this.selectedSettingIndex = itemIndex;
                this.activateCurrentSetting();
            }
        }
    }
    
    /**
     * カテゴリ切り替え
     */
    switchCategory() {
        this.currentCategory = this.categories[this.selectedCategoryIndex];
        this.selectedSettingIndex = 0;
    }
    
    /**
     * 現在の設定項目を有効化
     */
    activateCurrentSetting() {
        const currentItems = this.settingItems[this.currentCategory] || [];
        const item = currentItems[this.selectedSettingIndex];
        
        if (!item) return;
        
        const currentValue = this.gameEngine.settingsManager.get(item.key);
        
        // アクセシビリティ設定の場合は専用マネージャーを使用
        if (item.key.startsWith('accessibility.') && this.accessibilitySettingsManager) {
            switch (item.type) {
                case 'toggle':
                    this.accessibilitySettingsManager.setSetting(item.key, !currentValue);
                    break;
                    
                case 'select':
                    const nextSelectValue = this.getNextSelectValue(item, currentValue);
                    this.accessibilitySettingsManager.setSetting(item.key, nextSelectValue);
                    break;
                    
                case 'slider':
                    const nextSliderValue = this.getNextSliderValue(item, currentValue);
                    this.accessibilitySettingsManager.setSetting(item.key, nextSliderValue);
                    break;
                    
                case 'text':
                    this.startTextEditing(currentValue);
                    break;
            }
        } else {
            // 通常の設定処理
            switch (item.type) {
                case 'toggle':
                    // 特別な処理が必要な設定項目
                    if (item.key === 'audio.muted') {
                        this.handleAudioMuteToggle();
                    } else {
                        this.gameEngine.settingsManager.set(item.key, !currentValue);
                    }
                    break;
                    
                case 'select':
                    this.cycleSelectValue(item, currentValue);
                    break;
                    
                case 'slider':
                    this.adjustSliderValue(item, currentValue);
                    break;
                    
                case 'text':
                    this.startTextEditing(currentValue);
                    break;
                    
                case 'custom':
                    // カスタムコンポーネントの処理
                    this.handleCustomComponent(item);
                    break;
            }
        }
    }
    
    /**
     * 次のセレクト値を取得
     */
    getNextSelectValue(item, currentValue) {
        const currentIndex = item.options.findIndex(opt => opt.value === currentValue);
        const nextIndex = (currentIndex + 1) % item.options.length;
        return item.options[nextIndex].value;
    }
    
    /**
     * セレクト値のサイクル
     */
    cycleSelectValue(item, currentValue) {
        const newValue = this.getNextSelectValue(item, currentValue);
        this.gameEngine.settingsManager.set(item.key, newValue);
    }
    
    /**
     * 次のスライダー値を取得
     */
    getNextSliderValue(item, currentValue) {
        const step = item.step || 0.1;
        const min = item.min || 0;
        const max = item.max || 1;
        let newValue = currentValue + step;
        
        // 最大値を超えた場合は最小値に戻る
        if (newValue > max) {
            newValue = min;
        }
        
        return Math.round(newValue * 100) / 100; // 小数点以下2桁で丸める
    }
    
    /**
     * スライダー値の調整
     */
    adjustSliderValue(item, currentValue) {
        const newValue = this.getNextSliderValue(item, currentValue);
        this.gameEngine.settingsManager.set(item.key, newValue);
    }
    
    /**
     * テキスト編集開始
     */
    startTextEditing(currentValue) {
        this.isEditingValue = true;
        this.tempValue = currentValue || '';
    }
    
    /**
     * 編集中の入力処理
     */
    handleEditingInput(event) {
        switch (event.key) {
            case 'Enter':
                this.finishTextEditing();
                break;
                
            case 'Escape':
                this.cancelTextEditing();
                break;
                
            case 'Backspace':
                this.tempValue = this.tempValue.slice(0, -1);
                break;
                
            default:
                if (event.key.length === 1) {
                    this.tempValue += event.key;
                }
                break;
        }
    }
    
    /**
     * テキスト編集完了
     */
    finishTextEditing() {
        const currentItems = this.settingItems[this.currentCategory] || [];
        const item = currentItems[this.selectedSettingIndex];
        
        if (item) {
            // アクセシビリティ設定の場合は専用マネージャーを使用
            if (item.key.startsWith('accessibility.') && this.accessibilitySettingsManager) {
                this.accessibilitySettingsManager.setSetting(item.key, this.tempValue);
            } else {
                this.gameEngine.settingsManager.set(item.key, this.tempValue);
            }
        }
        
        this.isEditingValue = false;
        this.tempValue = null;
    }
    
    /**
     * テキスト編集キャンセル
     */
    cancelTextEditing() {
        this.isEditingValue = false;
        this.tempValue = null;
    }
    
    /**
     * 確認ダイアログ入力処理
     */
    handleConfirmDialogInput(event) {
        switch (event.key) {
            case 'Enter':
                this.confirmDialogData?.onConfirm?.();
                this.closeConfirmDialog();
                break;
                
            case 'Escape':
                this.confirmDialogData?.onCancel?.();
                this.closeConfirmDialog();
                break;
        }
    }
    
    /**
     * 確認ダイアログを閉じる
     */
    closeConfirmDialog() {
        this.showingConfirmDialog = false;
        this.confirmDialogData = null;
    }
    
    /**
     * 設定保存
     */
    saveSettings() {
        try {
            this.gameEngine.settingsManager.save();
            console.log('[SettingsScene] 設定を保存しました');
        } catch (error) {
            console.error('[SettingsScene] 設定保存エラー:', error);
        }
    }
    
    /**
     * 音声ミュート切り替え処理
     */
    handleAudioMuteToggle() {
        try {
            if (this.gameEngine.audioManager) {
                const newMutedState = this.gameEngine.audioManager.toggleMute();
                
                // ミュート状態を設定に保存
                this.gameEngine.settingsManager.set('audio.muted', newMutedState);
                
                console.log(`[SettingsScene] Audio mute toggled: ${newMutedState}`);
                this.loggingSystem.info('SettingsScene', `Audio mute toggled: ${newMutedState}`);
            }
        } catch (error) {
            console.error('[SettingsScene] Error toggling audio mute:', error);
            this.loggingSystem.error('SettingsScene', 'Audio mute toggle error', error);
        }
    }
    
    /**
     * カスタムコンポーネント処理の統一ハンドラー
     */
    handleCustomComponent(item) {
        switch (item.component) {
            case 'VolumeControlComponent':
                this.handleVolumeControl();
                break;
                
            case 'AccessibilityProfileComponent':
                this.handleAccessibilityProfileComponent();
                break;
                
            case 'SettingsImportExportComponent':
                this.handleSettingsImportExportComponent();
                break;
                
            default:
                console.warn('[SettingsScene] Unknown custom component:', item.component);
                this.loggingSystem.warn('SettingsScene', `Unknown custom component: ${item.component}`);
                break;
        }
    }
    
    /**
     * ボリュームコントロール処理
     */
    handleVolumeControl() {
        try {
            // VolumeControlComponentを使用した音量調整
            // このメソッドは現在選択されているときに音量アップを実行
            if (this.volumeControlComponent) {
                this.volumeControlComponent.handleVolumeUp();
                
                console.log('[SettingsScene] Volume control activated');
                this.loggingSystem.info('SettingsScene', 'Volume control activated');
            }
        } catch (error) {
            console.error('[SettingsScene] Error handling volume control:', error);
            this.loggingSystem.error('SettingsScene', 'Volume control error', error);
        }
    }
    
    /**
     * アクセシビリティプロファイルコンポーネント処理
     */
    handleAccessibilityProfileComponent() {
        if (!this.accessibilitySettingsManager) {
            console.warn('[SettingsScene] AccessibilitySettingsManager not available');
            return;
        }
        
        try {
            // プロファイル選択ダイアログを表示
            this.showAccessibilityProfileDialog();
            this.loggingSystem.info('SettingsScene', 'Accessibility profile component activated');
        } catch (error) {
            console.error('[SettingsScene] Error handling accessibility profile component:', error);
            this.loggingSystem.error('SettingsScene', 'Accessibility profile component error', error);
        }
    }
    
    /**
     * アクセシビリティプロファイル選択ダイアログ表示
     */
    showAccessibilityProfileDialog() {
        const profiles = this.accessibilitySettingsManager.getAvailableProfiles();
        const currentProfile = this.accessibilitySettingsManager.getCurrentProfile();
        
        console.log('[SettingsScene] Available Accessibility Profiles:', profiles);
        console.log('[SettingsScene] Current Profile:', currentProfile);
        
        // 簡易プロファイル選択（実際の実装では専用UIを作成）
        const __profileNames = profiles.map(p => p.name);
        const currentIndex = profiles.findIndex(p => p.id === (currentProfile ? currentProfile.id : null));
        const nextIndex = (currentIndex + 1) % profiles.length;
        const nextProfile = profiles[nextIndex];
        
        // 次のプロファイルに切り替え
        this.accessibilitySettingsManager.applyProfile(nextProfile.id);
        
        console.log(`[SettingsScene] Switched to profile: ${nextProfile.name}`);
        this.loggingSystem.info('SettingsScene', `Profile switched to: ${nextProfile.name}`);
        
        // 設定項目を更新
        this.settingItems.accessibility = this.getAccessibilitySettingsItems();
    }
    
    /**
     * 設定インポート・エクスポートコンポーネント処理
     */
    handleSettingsImportExportComponent() {
        try {
            // エクスポート/インポート選択ダイアログを表示
            this.showImportExportDialog();
            this.loggingSystem.info('SettingsScene', 'Settings import/export component activated');
        } catch (error) {
            console.error('[SettingsScene] Error handling settings import/export component:', error);
            this.loggingSystem.error('SettingsScene', 'Settings import/export component error', error);
        }
    }
    
    /**
     * インポート・エクスポートダイアログ表示
     */
    showImportExportDialog() {
        // 簡易選択（実際の実装では専用UIを作成）
        // デフォルトでエクスポートを実行
        this.exportAccessibilitySettings();
        
        console.log('[SettingsScene] Import/Export dialog activated (Export executed)');
        this.loggingSystem.info('SettingsScene', 'Import/Export dialog activated');
    }
    
    /**
     * 戻る処理
     */
    goBack() {
        if (this.isEditingValue) {
            this.cancelTextEditing();
        } else if (this.showingConfirmDialog) {
            this.closeConfirmDialog();
        } else {
            // NavigationContextManagerを使用して適切な戻り先を決定
            try {
                if (!this.gameEngine.sceneManager) {
                    console.error('SceneManager not available');
                    return;
                }
                
                // NavigationContextManagerから戻り先を取得
                const returnScene = this.navigationContext.getReturnDestination();
                this.navigationContext.popContext();
                
                const targetScene = returnScene || 'menu'; // フォールバックとして'menu'を使用
                const success = this.gameEngine.sceneManager.switchScene(targetScene);
                
                if (!success) {
                    console.error(`Failed to navigate to ${targetScene} from settings screen`);
                    // フォールバック: menuシーンに戻る試行
                    if (targetScene !== 'menu') {
                        const fallbackSuccess = this.gameEngine.sceneManager.switchScene('menu');
                        if (!fallbackSuccess) {
                            console.error('Failed to navigate to fallback menu scene');
                        }
                    }
                }
                
                this.loggingSystem.info('SettingsScene', `Navigated back to: ${targetScene}, success: ${success}`);
            } catch (error) {
                console.error('Error navigating back from settings screen:', error);
                this.loggingSystem.error('SettingsScene', 'Navigation error', error);
            }
        }
    }
    
    /**
     * アクセシビリティプロファイル表示
     */
    showAccessibilityProfiles() {
        if (!this.accessibilitySettingsManager) return;
        
        const profiles = this.accessibilitySettingsManager.getAvailableProfiles();
        console.log('[SettingsScene] Available Accessibility Profiles:', profiles);
        
        // 簡易的なプロファイル表示（実際の実装では専用UIを作成）
        this.showingProfileDialog = true;
        this.profileDialogData = {
            profiles,
            selectedIndex: 0
        };
        
        this.loggingSystem.info('SettingsScene', 'Accessibility profiles dialog opened');
    }
    
    /**
     * アクセシビリティ設定のエクスポート
     */
    exportAccessibilitySettings() {
        if (!this.accessibilitySettingsManager) return;
        
        try {
            this.accessibilitySettingsManager.exportSettings('json', true);
            this.loggingSystem.info('SettingsScene', 'Accessibility settings export initiated');
        } catch (error) {
            console.error('[SettingsScene] Export failed:', error);
            this.loggingSystem.error('SettingsScene', 'Export failed', error);
        }
    }
    
    /**
     * アクセシビリティ設定のインポート
     */
    importAccessibilitySettings() {
        if (!this.accessibilitySettingsManager) return;
        
        try {
            // ファイル選択ダイアログを作成
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.style.display = 'none';
            
            input.addEventListener('change', async (event) => {
                const target = event.target as HTMLInputElement;
                const file = target.files?.[0];
                if (file) {
                    try {
                        await this.accessibilitySettingsManager.importSettings(file);
                        
                        // 設定項目リストを更新
                        this.settingItems.accessibility = this.accessibilitySettingsManager.getExtendedAccessibilitySettings();
                        
                        this.loggingSystem.info('SettingsScene', 'Accessibility settings imported successfully');
                    } catch (error) {
                        console.error('[SettingsScene] Import failed:', error);
                        this.loggingSystem.error('SettingsScene', 'Import failed', error);
                    }
                }
                
                // 一時的な input 要素を削除
                document.body.removeChild(input);
            });
            
            document.body.appendChild(input);
            input.click();
            
        } catch (error) {
            console.error('[SettingsScene] Import setup failed:', error);
            this.loggingSystem.error('SettingsScene', 'Import setup failed', error);
        }
    }
    
    /**
     * アクセシビリティ機能の統合状態取得
     */
    getAccessibilityIntegrationStatus() {
        if (!this.accessibilitySettingsManager) {
            return { integrated: false, reason: 'AccessibilitySettingsManager not initialized' };
        }
        
        return {
            integrated: true,
            stats: this.accessibilitySettingsManager.getStats(),
            profileCount: this.accessibilitySettingsManager.getAvailableProfiles().length,
            extendedSettings: this.accessibilitySettingsManager.getExtendedAccessibilitySettings().length
        };
    }
    
    /**
     * クリーンアップ処理
     */
    destroy() {
        try {
            // NavigationContextManagerのクリーンアップ
            if (this.navigationContext) {
                this.navigationContext.cleanup();
            }
            
            // AccessibilitySettingsManagerのクリーンアップ
            if (this.accessibilitySettingsManager) {
                this.accessibilitySettingsManager.cleanup();
            }
            
            // VolumeControlComponentのクリーンアップ
            if (this.volumeControlComponent) {
                this.volumeControlComponent.dispose();
            }
            
            // 設定の保存
            this.saveSettings();
            
            console.log('[SettingsScene] SettingsScene destroyed');
            this.loggingSystem.info('SettingsScene', 'Settings scene destroyed');
            
        } catch (error) {
            console.error('Error during SettingsScene destruction:', error);
            this.loggingSystem.error('SettingsScene', 'Destruction error', error);
        }
    }
}