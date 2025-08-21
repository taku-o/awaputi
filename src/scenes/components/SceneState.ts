// インターフェース定義
interface AccessibilitySettings { highContrast: boolean,
    largeText: boolean,
    reducedMotion: boolean;
    interface StatisticsDisplaySettings { showDashboard: boolean,
    showCharts: boolean,
    showDetailedStats: boolean,
    enableAnimations: boolean,
    compactMode: boolean;
    interface LayoutSettings { tabHeight: number,
    headerHeight: number,
    contentPadding: number,
    scrollbarWidth: number;
    interface UserPreferences { currentTab: string,
    statisticsViewMode: string,
    currentPeriodFilter: string,
    statisticsDisplaySettings: StatisticsDisplaySettings,
    currentAchievementCategory: string;
    interface StateChange { key: string,
    value: any,
    oldValue: any;
    interface SerializedState { currentTab: string,
    showingDialog: string | null,
    currentAchievementCategory: string,
    statisticsViewMode: string,
    currentPeriodFilter: string,
    statisticsDisplaySettings: StatisticsDisplaySettings,
    accessibilitySettings: AccessibilitySettings,
    scrollPosition: number,
    selectedItem: number,
    focusedElement: number;
    type DialogType = 'username' | 'export' | 'import' | null;
    type ViewMode = 'dashboard' | 'charts' | 'details';
    type CacheType = 'statistics' | 'achievements' | 'user';
    type ChangeListener = (value: any, oldValue: any, key: string) => void;
    type UnsubscribeFunction = () => void;

/**
 * UserInfoSceneの共有状態管理クラス
 * コンポーネント間で共有される状態を管理
 */
export class SceneState {
    public gameEngine: any;
    
    // タブ状態管理
    public currentTab: string;
    public tabs: string[];
    public tabLabels: string[];
    
    // ダイアログ状態管理
    public showingDialog: DialogType;
    public dialogData: Record<string, any>;
    
    // UI状態管理
    public scrollPosition: number;
    public selectedItem: number;
    public focusedElement: number;
    
    // 実績フィルター状態
    public achievementCategories: string[];
    public achievementCategoryLabels: string[];
    public currentAchievementCategory: string;
    
    // 統計表示設定
    public statisticsViewMode: ViewMode;
    public currentPeriodFilter: string;
    public statisticsDisplaySettings: StatisticsDisplaySettings;
    // データキャッシュ
    public statisticsData: any;
    public achievementsData: any;
    public userData: any;
    
    // アクセシビリティ設定
    public accessibilitySettings: AccessibilitySettings;
    // エラー状態管理
    public errorMessage: string | null;
    private errorTimeout: NodeJS.Timeout | null;
    // レイアウト設定
    public, layout: LayoutSettings;
    // 変更通知のためのイベントリスナー
    private changeListeners: Map<string, ChangeListener[]>;
    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        ','
        // タブ状態管理
        this.currentTab = 'statistics';
    this.tabs = ['statistics', 'achievements', 'leaderboard', 'challenges', 'management', 'help'],
        this.tabLabels = ['統計', '実績', 'ランキング', 'チャレンジ', '管理', 'ヘルプ],'
        
        // ダイアログ状態管理
    };
        this.showingDialog = null; }
        this.dialogData = {};
        
        // UI状態管理
        this.scrollPosition = 0;
        this.selectedItem = -1;
        this.focusedElement = 0;
        // 実績フィルター状態
        this.achievementCategories = ['all', 'score', 'play', 'technique', 'collection', 'special'];
        this.achievementCategoryLabels = ['全て', 'スコア系', 'プレイ系', 'テクニック系', 'コレクション系', '特殊];'
        this.currentAchievementCategory = 'all';
        ';'
        // 統計表示設定
        this.statisticsViewMode = 'dashboard';
        this.currentPeriodFilter = 'last7days';
        this.statisticsDisplaySettings = { showDashboard: true,
            showCharts: true,
            showDetailedStats: true,
            enableAnimations: true,
    compactMode: false;
        // データキャッシュ
        this.statisticsData = null;
        this.achievementsData = null;
        this.userData = null;
        
        // アクセシビリティ設定
        this.accessibilitySettings = { highContrast: false,
            largeText: false,
    reducedMotion: false;
        // エラー状態管理
        this.errorMessage = null;
        this.errorTimeout = null;
        
        // レイアウト設定
        this.layout = { tabHeight: 60,
            headerHeight: 120,
            contentPadding: 20,
    scrollbarWidth: 16  };
        // 変更通知のためのイベントリスナー
        this.changeListeners = new Map();
        
        // 初期化
        this.initialize();
    }
    
    /**
     * 状態の初期化
     */
    initialize(): void { this.loadAccessibilitySettings();
        this.loadUserPreferences();
    
    /**
     * アクセシビリティ設定を読み込み
     */''
    loadAccessibilitySettings()';'
            const saved = localStorage.getItem('awaputi_accessibility_settings);'
            if (saved) { const settings = JSON.parse(saved);

                this.accessibilitySettings = { ...this.accessibilitySettings, ...settings,'} catch (error) { console.warn('Failed to load accessibility settings:', error }'
    }
    
    /**
     * ユーザー設定を読み込み'
     */''
    loadUserPreferences()';'
            const saved = localStorage.getItem('awaputi_userinfo_preferences);'
            if (saved) {
                const preferences = JSON.parse(saved);
                // 安全に設定を復元
                if (preferences.currentTab && this.tabs.includes(preferences.currentTab) {
            }
                    this.currentTab = preferences.currentTab; }
                }
                
                if (preferences.statisticsViewMode) { this.statisticsViewMode = preferences.statisticsViewMode }
                
                if (preferences.currentPeriodFilter) { this.currentPeriodFilter = preferences.currentPeriodFilter }
                
                if (preferences.statisticsDisplaySettings) {
                
                    this.statisticsDisplaySettings = { 
                        ...this.statisticsDisplaySettings }
                        ...preferences.statisticsDisplaySettings
                    }
                
                if(preferences.currentAchievementCategory && );
                    this.achievementCategories.includes(preferences.currentAchievementCategory) { this.currentAchievementCategory = preferences.currentAchievementCategory }'} catch (error) { console.warn('Failed to load user preferences:', error }'
    }
    
    /**
     * ユーザー設定を保存'
     */''
    saveUserPreferences()';'
            localStorage.setItem('awaputi_userinfo_preferences', JSON.stringify(preferences);'} catch (error) { console.warn('Failed to save user preferences:', error }'
    }
    
    /**
     * 状態値を取得
     * @param key - 取得するキー
     * @returns 状態値'
     */''
    get(key: string): any { ''
        if(key.includes('.' { }
            return this.getNestedValue(key);
        return (this, as any)[key];
    }
    
    /**
     * 状態値を設定
     * @param key - 設定するキー
     * @param value - 設定する値
     * @param notify - 変更通知を行うかどうか
     */'
    set(key: string, value: any, notify: boolean = true): void { ''
        const oldValue = this.get(key);
        if(key.includes('.' { }
            this.setNestedValue(key, value); }
        } else { (this, as any)[key] = value }
        
        if (notify && oldValue !== value) { this.notifyChange(key, value, oldValue);
        
        // 特定の設定変更時に自動保存
        if (this.shouldAutoSave(key) { this.saveUserPreferences();
    }
    
    /**
     * 複数の状態値を一度に更新
     * @param updates - 更新する値のオブジェクト
     * @param notify - 変更通知を行うかどうか
     */
    update(updates: Record<string, any>, notify: boolean = true): void { const changes: StateChange[] = [],
        
        for(const [key, value] of Object.entries(updates) {
        
            const oldValue = this.get(key);
            this.set(key, value, false);
            if (oldValue !== value) {
    
}
                changes.push({ key, value, oldValue );
        }
        
        if (notify && changes.length > 0) { this.notifyBatchChange(changes);
        
        // バッチ更新後に自動保存チェック
        if(changes.some(change => this.shouldAutoSave(change.key)) { this.saveUserPreferences();
    }
    
    /**
     * 変更リスナーを登録
     * @param key - 監視するキー
     * @param listener - 変更時のリスナー
     * @returns リスナー削除用の関数
     */
    onChange(key: string, listener: ChangeListener): UnsubscribeFunction { if (!this.changeListeners.has(key) {
            this.changeListeners.set(key, []);
        
        this.changeListeners.get(key)!.push(listener);
        
        // リスナー削除用の関数を返す
        return () => {  const listeners = this.changeListeners.get(key);
            if (listeners) {
                const index = listeners.indexOf(listener);
                if (index !== -1) { }
                    listeners.splice(index, 1);     }
}
    /**
     * エラー状態を設定
     * @param message - エラーメッセージ
     * @param duration - 表示時間（ミリ秒）
     */
    setError(message: string, duration: number = 5000): void { this.errorMessage = message,
        
        if (this.errorTimeout) {
    
}
            clearTimeout(this.errorTimeout); }
        }

        this.errorTimeout = setTimeout(() => {  this.errorMessage = null,' }'

            this.notifyChange('errorMessage', null, message'; }'

        }, duration');'

        this.notifyChange('errorMessage', message, null);
    }
    
    /**
     * エラー状態をクリア
     */
    clearError(): void { if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
            this.errorTimeout = null }
        
        const oldMessage = this.errorMessage;
        this.errorMessage = null;

        if (oldMessage) {', ' }

            this.notifyChange('errorMessage', null, oldMessage'; }'
}
    
    /**
     * ネストした値を取得
     * @param path - ドット記法のパス
     * @returns 値'
     */''
    private getNestedValue(path: string): any { ''
        return path.split('.).reduce((obj: any, key) => obj && obj[key], this) }'
    }
    
    /**
     * ネストした値を設定
     * @param path - ドット記法のパス
     * @param value - 設定する値'
     */''
    private setNestedValue(path: string, value: any): void { ''
        const keys = path.split('.),'

        const lastKey = keys.pop()!,
        const target = keys.reduce((obj: any, key) => { }'

            if(!obj[key] || typeof, obj[key] !== 'object' { }'
                obj[key] = {}
            return obj[key];
        }, this);
        
        target[lastKey] = value;
    }
    
    /**
     * 変更通知を送信
     * @param key - 変更されたキー
     * @param value - 新しい値
     * @param oldValue - 古い値
     */
    private notifyChange(key: string, value: any, oldValue: any): void { const listeners = this.changeListeners.get(key);
        if (listeners) {
            for (const listener of listeners) {
                try {
        }

                    listener(value, oldValue, key);' }'

                } catch (error) { console.error('Error in state change listener:', error     }
}
    /**
     * バッチ変更通知を送信
     * @param changes - 変更の配列
     */
    private notifyBatchChange(changes: StateChange[]): void { for (const change of changes) {
            this.notifyChange(change.key, change.value, change.oldValue);
    }
    
    /**
     * 自動保存が必要かどうかを判定
     * @param key - チェックするキー
     * @returns 自動保存が必要な場合true'
     */''
    private shouldAutoSave(key: string): boolean { const autoSaveKeys = [', 'currentTab','
            'statisticsViewMode,
            'currentPeriodFilter,
            'statisticsDisplaySettings',]','
            'currentAchievementCategory'],
        ],

        return autoSaveKeys.some(autoKey => key === autoKey || key.startsWith(autoKey + '.,
    
    /**
     * データキャッシュをクリア
     * @param type - クリアするデータタイプ（省略時は全て）'
     */''
    clearCache(type?: CacheType): void { ''
        if (!type || type === 'statistics') {
    
}
            this.statisticsData = null; }

        }''
        if (!type || type === 'achievements') { this.achievementsData = null }

        }''
        if (!type || type === 'user') { this.userData = null }

        this.notifyChange('cache_cleared', type, null';'
    }
    
    /**
     * 状態のリセット
     * @param preservePreferences - ユーザー設定を保持するかどうか
     */'
    reset(preservePreferences: boolean = true): void { ''
        if (!preservePreferences) {

            this.currentTab = 'statistics';
            this.statisticsViewMode = 'dashboard';
            this.currentPeriodFilter = 'last7days' }

            this.currentAchievementCategory = 'all'; }
        }
        
        this.showingDialog = null;
        this.dialogData = {};
        this.scrollPosition = 0;
        this.selectedItem = -1;
        this.focusedElement = 0;
        ';'

        this.clearCache();
        this.clearError()';'
        this.notifyChange('state_reset', preservePreferences, null);
    }
    
    /**
     * 現在の状態をJSON形式で取得
     * @returns シリアライズされた状態
     */
    serialize(): SerializedState { return { currentTab: this.currentTab,
            showingDialog: this.showingDialog,
            currentAchievementCategory: this.currentAchievementCategory,
            statisticsViewMode: this.statisticsViewMode,
            currentPeriodFilter: this.currentPeriodFilter,
            statisticsDisplaySettings: this.statisticsDisplaySettings,
            accessibilitySettings: this.accessibilitySettings,
            scrollPosition: this.scrollPosition,
    selectedItem: this.selectedItem ,
            focusedElement: this.focusedElement 
    }
    
    /**
     * 状態のクリーンアップ
     */
    cleanup(): void { this.clearError();
        this.changeListeners.clear();
        this.clearCache(' }''