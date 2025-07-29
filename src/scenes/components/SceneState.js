/**
 * UserInfoSceneの共有状態管理クラス
 * コンポーネント間で共有される状態を管理
 */
export class SceneState {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // タブ状態管理
        this.currentTab = 'statistics';
        this.tabs = ['statistics', 'achievements', 'management', 'help'];
        this.tabLabels = ['統計', '実績', '管理', 'ヘルプ'];
        
        // ダイアログ状態管理
        this.showingDialog = null; // null, 'username', 'export', 'import'
        this.dialogData = {};
        
        // UI状態管理
        this.scrollPosition = 0;
        this.selectedItem = -1;
        this.focusedElement = 0; // キーボードナビゲーション用
        
        // 実績フィルター状態
        this.achievementCategories = ['all', 'score', 'play', 'technique', 'collection', 'special'];
        this.achievementCategoryLabels = ['全て', 'スコア系', 'プレイ系', 'テクニック系', 'コレクション系', '特殊'];
        this.currentAchievementCategory = 'all';
        
        // 統計表示設定
        this.statisticsViewMode = 'dashboard'; // 'dashboard', 'charts', 'details'
        this.currentPeriodFilter = 'last7days';
        this.statisticsDisplaySettings = {
            showDashboard: true,
            showCharts: true,
            showDetailedStats: true,
            enableAnimations: true,
            compactMode: false
        };
        
        // データキャッシュ
        this.statisticsData = null;
        this.achievementsData = null;
        this.userData = null;
        
        // アクセシビリティ設定
        this.accessibilitySettings = {
            highContrast: false,
            largeText: false,
            reducedMotion: false
        };
        
        // エラー状態管理
        this.errorMessage = null;
        this.errorTimeout = null;
        
        // レイアウト設定
        this.layout = {
            tabHeight: 60,
            headerHeight: 120,
            contentPadding: 20,
            scrollbarWidth: 16
        };
        
        // 変更通知のためのイベントリスナー
        this.changeListeners = new Map();
        
        // 初期化
        this.initialize();
    }
    
    /**
     * 状態の初期化
     */
    initialize() {
        this.loadAccessibilitySettings();
        this.loadUserPreferences();
    }
    
    /**
     * アクセシビリティ設定を読み込み
     */
    loadAccessibilitySettings() {
        try {
            const saved = localStorage.getItem('awaputi_accessibility_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.accessibilitySettings = { ...this.accessibilitySettings, ...settings };
            }
        } catch (error) {
            console.warn('Failed to load accessibility settings:', error);
        }
    }
    
    /**
     * ユーザー設定を読み込み
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('awaputi_userinfo_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                
                // 安全に設定を復元
                if (preferences.currentTab && this.tabs.includes(preferences.currentTab)) {
                    this.currentTab = preferences.currentTab;
                }
                
                if (preferences.statisticsViewMode) {
                    this.statisticsViewMode = preferences.statisticsViewMode;
                }
                
                if (preferences.currentPeriodFilter) {
                    this.currentPeriodFilter = preferences.currentPeriodFilter;
                }
                
                if (preferences.statisticsDisplaySettings) {
                    this.statisticsDisplaySettings = { 
                        ...this.statisticsDisplaySettings, 
                        ...preferences.statisticsDisplaySettings 
                    };
                }
                
                if (preferences.currentAchievementCategory && 
                    this.achievementCategories.includes(preferences.currentAchievementCategory)) {
                    this.currentAchievementCategory = preferences.currentAchievementCategory;
                }
            }
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    }
    
    /**
     * ユーザー設定を保存
     */
    saveUserPreferences() {
        try {
            const preferences = {
                currentTab: this.currentTab,
                statisticsViewMode: this.statisticsViewMode,
                currentPeriodFilter: this.currentPeriodFilter,
                statisticsDisplaySettings: this.statisticsDisplaySettings,
                currentAchievementCategory: this.currentAchievementCategory
            };
            
            localStorage.setItem('awaputi_userinfo_preferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save user preferences:', error);
        }
    }
    
    /**
     * 状態値を取得
     * @param {string} key - 取得するキー
     * @returns {*} - 状態値
     */
    get(key) {
        if (key.includes('.')) {
            return this.getNestedValue(key);
        }
        return this[key];
    }
    
    /**
     * 状態値を設定
     * @param {string} key - 設定するキー
     * @param {*} value - 設定する値
     * @param {boolean} notify - 変更通知を行うかどうか
     */
    set(key, value, notify = true) {
        const oldValue = this.get(key);
        
        if (key.includes('.')) {
            this.setNestedValue(key, value);
        } else {
            this[key] = value;
        }
        
        if (notify && oldValue !== value) {
            this.notifyChange(key, value, oldValue);
        }
        
        // 特定の設定変更時に自動保存
        if (this.shouldAutoSave(key)) {
            this.saveUserPreferences();
        }
    }
    
    /**
     * 複数の状態値を一度に更新
     * @param {Object} updates - 更新する値のオブジェクト
     * @param {boolean} notify - 変更通知を行うかどうか
     */
    update(updates, notify = true) {
        const changes = [];
        
        for (const [key, value] of Object.entries(updates)) {
            const oldValue = this.get(key);
            this.set(key, value, false);
            
            if (oldValue !== value) {
                changes.push({ key, value, oldValue });
            }
        }
        
        if (notify && changes.length > 0) {
            this.notifyBatchChange(changes);
        }
        
        // バッチ更新後に自動保存チェック
        if (changes.some(change => this.shouldAutoSave(change.key))) {
            this.saveUserPreferences();
        }
    }
    
    /**
     * 変更リスナーを登録
     * @param {string} key - 監視するキー
     * @param {Function} listener - 変更時のリスナー
     * @returns {Function} - リスナー削除用の関数
     */
    onChange(key, listener) {
        if (!this.changeListeners.has(key)) {
            this.changeListeners.set(key, []);
        }
        
        this.changeListeners.get(key).push(listener);
        
        // リスナー削除用の関数を返す
        return () => {
            const listeners = this.changeListeners.get(key);
            if (listeners) {
                const index = listeners.indexOf(listener);
                if (index !== -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }
    
    /**
     * エラー状態を設定
     * @param {string} message - エラーメッセージ
     * @param {number} duration - 表示時間（ミリ秒）
     */
    setError(message, duration = 5000) {
        this.errorMessage = message;
        
        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
        }
        
        this.errorTimeout = setTimeout(() => {
            this.errorMessage = null;
            this.notifyChange('errorMessage', null, message);
        }, duration);
        
        this.notifyChange('errorMessage', message, null);
    }
    
    /**
     * エラー状態をクリア
     */
    clearError() {
        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
            this.errorTimeout = null;
        }
        
        const oldMessage = this.errorMessage;
        this.errorMessage = null;
        
        if (oldMessage) {
            this.notifyChange('errorMessage', null, oldMessage);
        }
    }
    
    /**
     * ネストした値を取得
     * @param {string} path - ドット記法のパス
     * @returns {*} - 値
     */
    getNestedValue(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this);
    }
    
    /**
     * ネストした値を設定
     * @param {string} path - ドット記法のパス
     * @param {*} value - 設定する値
     */
    setNestedValue(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key] || typeof obj[key] !== 'object') {
                obj[key] = {};
            }
            return obj[key];
        }, this);
        
        target[lastKey] = value;
    }
    
    /**
     * 変更通知を送信
     * @param {string} key - 変更されたキー
     * @param {*} value - 新しい値
     * @param {*} oldValue - 古い値
     */
    notifyChange(key, value, oldValue) {
        const listeners = this.changeListeners.get(key);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    listener(value, oldValue, key);
                } catch (error) {
                    console.error('Error in state change listener:', error);
                }
            }
        }
    }
    
    /**
     * バッチ変更通知を送信
     * @param {Array} changes - 変更の配列
     */
    notifyBatchChange(changes) {
        for (const change of changes) {
            this.notifyChange(change.key, change.value, change.oldValue);
        }
    }
    
    /**
     * 自動保存が必要かどうかを判定
     * @param {string} key - チェックするキー
     * @returns {boolean} - 自動保存が必要な場合true
     */
    shouldAutoSave(key) {
        const autoSaveKeys = [
            'currentTab',
            'statisticsViewMode',
            'currentPeriodFilter',
            'statisticsDisplaySettings',
            'currentAchievementCategory'
        ];
        
        return autoSaveKeys.some(autoKey => key === autoKey || key.startsWith(autoKey + '.'));
    }
    
    /**
     * データキャッシュをクリア
     * @param {string} type - クリアするデータタイプ（省略時は全て）
     */
    clearCache(type) {
        if (!type || type === 'statistics') {
            this.statisticsData = null;
        }
        if (!type || type === 'achievements') {
            this.achievementsData = null;
        }
        if (!type || type === 'user') {
            this.userData = null;
        }
        
        this.notifyChange('cache_cleared', type);
    }
    
    /**
     * 状態のリセット
     * @param {boolean} preservePreferences - ユーザー設定を保持するかどうか
     */
    reset(preservePreferences = true) {
        if (!preservePreferences) {
            this.currentTab = 'statistics';
            this.statisticsViewMode = 'dashboard';
            this.currentPeriodFilter = 'last7days';
            this.currentAchievementCategory = 'all';
        }
        
        this.showingDialog = null;
        this.dialogData = {};
        this.scrollPosition = 0;
        this.selectedItem = -1;
        this.focusedElement = 0;
        
        this.clearCache();
        this.clearError();
        
        this.notifyChange('state_reset', preservePreferences);
    }
    
    /**
     * 現在の状態をJSON形式で取得
     * @returns {Object} - シリアライズされた状態
     */
    serialize() {
        return {
            currentTab: this.currentTab,
            showingDialog: this.showingDialog,
            currentAchievementCategory: this.currentAchievementCategory,
            statisticsViewMode: this.statisticsViewMode,
            currentPeriodFilter: this.currentPeriodFilter,
            statisticsDisplaySettings: this.statisticsDisplaySettings,
            accessibilitySettings: this.accessibilitySettings,
            scrollPosition: this.scrollPosition,
            selectedItem: this.selectedItem,
            focusedElement: this.focusedElement
        };
    }
    
    /**
     * 状態のクリーンアップ
     */
    cleanup() {
        this.clearError();
        this.changeListeners.clear();
        this.clearCache();
    }
}