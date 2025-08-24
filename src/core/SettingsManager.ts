import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from './ConfigurationManager.js';
import { getSettingsNotificationSystem } from './SettingsNotificationSystem.js';
import { SettingsValidator } from './settings/SettingsValidator.js';
import { SettingsStorageManager } from './settings/SettingsStorageManager.js';
import { SettingsDataManager } from './settings/SettingsDataManager.js';
import { SettingsUIController } from './settings/SettingsUIController.js';
import { SettingsExportImport } from './settings/SettingsExportImport.js';

// 型定義
interface GameEngine {
    [key: string]: any;
}

interface SettingsListener {
    (category: string, key: string, value: any, oldValue?: any): void;
}

interface ConfigWatcher {
    (): void;
}

interface ListenerConfig {
    id: string;
    callback: SettingsListener;
    priority: string;
    once: boolean;
    addedAt: number;
}

/**
 * 設定管理クラス（Main Controller）
 * ゲーム設定の統合管理システム - 検証、保存、通知の統合制御
 * Main Controller Patternによる軽量オーケストレーター
 */
export class SettingsManager {
    private gameEngine: GameEngine;
    private configManager: any;
    private notificationSystem: any;
    private errorHandler: any;
    private listeners: Map<string, ListenerConfig[]>;
    private configWatchers: Map<string, string>;
    private validator: SettingsValidator;
    private storageManager: SettingsStorageManager;
    private dataManager: SettingsDataManager;
    private uiController: SettingsUIController;
    private exportImport: SettingsExportImport;
    
    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        this.configManager = getConfigurationManager();
        this.notificationSystem = getSettingsNotificationSystem();
        this.errorHandler = getErrorHandler();
        this.listeners = new Map();
        this.configWatchers = new Map();
        
        // サブコンポーネントの初期化（依存注入）
        this.validator = new SettingsValidator(this);
        this.storageManager = new SettingsStorageManager(this);
        this.dataManager = new SettingsDataManager(this);
        this.uiController = new SettingsUIController(this);
        this.exportImport = new SettingsExportImport(this);
        
        // ConfigurationManagerのセットアップ
        this._setupConfigurationManager();
        
        // 設定を読み込み
        this.load();
        
        console.log('[SettingsManager] Main Controller initialized with sub-components');
    }
    
    /**
     * ConfigurationManagerのセットアップ
     * @private
     */
    private _setupConfigurationManager(): void {
        const defaultSettings = this.dataManager.getDefaultSettings();
        
        this.dataManager.setupSettingsCategory('audio', {
            masterVolume: defaultSettings.masterVolume,
            sfxVolume: defaultSettings.sfxVolume,
            bgmVolume: defaultSettings.bgmVolume,
            isMuted: defaultSettings.isMuted
        }, {
            masterVolume: this.validator.validationRules.masterVolume,
            sfxVolume: this.validator.validationRules.sfxVolume,
            bgmVolume: this.validator.validationRules.bgmVolume,
            isMuted: { type: 'boolean' }
        });
        
        // UI設定
        this.dataManager.setupSettingsCategory('ui', {
            language: defaultSettings.language,
            quality: defaultSettings.quality,
            ...defaultSettings.ui
        }, {
            language: {
                type: 'string',
                validator: (value: string) => ['ja', 'en'].includes(value)
            },
            quality: {
                type: 'string',
                validator: (value: string) => ['low', 'medium', 'high', 'auto'].includes(value)
            },
            showFPS: { type: 'boolean' },
            showDebugInfo: { type: 'boolean' },
            animationSpeed: { type: 'number', min: 0.1, max: 3.0 },
            uiScale: { type: 'number', min: 0.5, max: 2.0 }
        });
        
        // その他の設定カテゴリもセットアップ
        this.dataManager.setupSettingsCategory('accessibility', defaultSettings.accessibility, {
            highContrast: { type: 'boolean' },
            reducedMotion: { type: 'boolean' },
            largeText: { type: 'boolean' },
            screenReader: { type: 'boolean' },
            colorBlindSupport: { type: 'boolean' }
        });
        
        this.dataManager.setupSettingsCategory('controls', defaultSettings.controls, {
            keyboardEnabled: { type: 'boolean' },
            mouseEnabled: { type: 'boolean' },
            touchEnabled: { type: 'boolean' }
        });
        
        this.dataManager.setupSettingsCategory('keyboard', defaultSettings.keyboardShortcuts, {});
        this.dataManager.setupSettingsCategory('social', defaultSettings.social, {});
        this.dataManager.setupSettingsCategory('notifications', defaultSettings.notifications, {});
        this.dataManager.setupSettingsCategory('privacy', defaultSettings.privacy, {});
    }
    
    // ========== 公開API（後方互換性維持） ==========
    
    /**
     * デフォルト設定を取得
     */
    getDefaultSettings(): any {
        return this.dataManager.getDefaultSettings();
    }
    
    /**
     * システム言語を検出
     */
    detectSystemLanguage(): string {
        return this.dataManager.detectSystemLanguage();
    }
    
    /**
     * 設定値を取得
     * @param {string} key 設定キー
     * @returns {*} 設定値
     */
    get(key: string): any {
        try {
            const parsed = this.dataManager.parseSettingKey(key);
            if (parsed.isLegacy) {
                return this.dataManager.getLegacyValue(key);
            }
            
            return this.configManager.get(parsed.category, parsed.settingName);
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_GET_ERROR', { key });
            return this.dataManager.getDefaultValue(key);
        }
    }
    
    /**
     * 設定値を設定
     * @param {string} key 設定キー
     * @param {*} value 設定値
     * @returns {boolean} 設定成功可否
     */
    set(key: string, value: any): boolean {
        try {
            // 検証
            if (!this.validator.validateSetting(key, value)) {
                console.warn(`[SettingsManager] Invalid value for ${key}: ${value}`);
                return false;
            }
            
            const oldValue = this.get(key);
            const parsed = this.dataManager.parseSettingKey(key);
            
            // ConfigurationManagerに設定
            if (parsed.isLegacy) {
                // レガシーキーの場合は特別処理が必要かもしれない
                this.configManager.set('legacy', parsed.settingName, value);
            } else {
                this.configManager.set(parsed.category, parsed.settingName, value);
            }
            
            // 変更通知
            this.notifyChange(key, value, oldValue);
            
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_SET_ERROR', { key, value });
            return false;
        }
    }
    
    /**
     * 設定を検証
     * @param {string} key 設定キー
     * @param {*} value 設定値
     * @returns {boolean} 検証結果
     */
    validateSetting(key: string, value: any): boolean {
        return this.validator.validateSetting(key, value);
    }
    
    /**
     * 複数の設定を一度に設定
     * @param {Object} settings 設定オブジェクト
     * @returns {boolean} 設定成功可否
     */
    setMultiple(settings: Record<string, any>): boolean {
        const results: boolean[] = [];
        
        for (const [key, value] of Object.entries(settings)) {
            results.push(this.set(key, value));
        }
        
        return results.every(result => result === true);
    }
    
    /**
     * 設定をリセット
     * @param {string} key リセットする設定キー（nullで全設定）
     */
    reset(key: string | null = null): void {
        try {
            if (key === null) {
                // 全設定をリセット
                const defaultSettings = this.dataManager.getDefaultSettings();
                for (const [settingKey, defaultValue] of Object.entries(defaultSettings)) {
                    this.set(settingKey, defaultValue);
                }
                console.log('[SettingsManager] All settings reset to defaults');
            } else {
                // 特定の設定をリセット
                const defaultValue = this.dataManager.getDefaultValue(key);
                this.set(key, defaultValue);
                console.log(`[SettingsManager] Setting '${key}' reset to default`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_RESET_ERROR', { key });
        }
    }
    
    /**
     * デフォルト値を取得
     * @param {string} key 設定キー
     * @returns {*} デフォルト値
     */
    getDefaultValue(key: string): any {
        return this.dataManager.getDefaultValue(key);
    }
    
    // ========== リスナー管理 ==========
    
    /**
     * 設定変更リスナーを追加
     * @param {string} key 監視する設定キー
     * @param {Function} callback コールバック関数
     * @param {Object} options オプション
     * @returns {string} リスナーID
     */
    addListener(key: string, callback: SettingsListener, options: any = {}): string {
        const listenerId = options.id || `listener_${Date.now()}_${Math.random()}`;
        const priority = options.priority || 'normal';
        
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        
        this.listeners.get(key)!.push({
            id: listenerId,
            callback,
            priority,
            once: options.once || false,
            addedAt: Date.now()
        });
        
        // 優先度でソート
        this.listeners.get(key)!.sort((a, b) => {
            const priorities: Record<string, number> = { high: 3, normal: 2, low: 1 };
            return priorities[b.priority] - priorities[a.priority];
        });
        
        return listenerId;
    }
    
    /**
     * 設定変更リスナーを削除
     * @param {string} key 設定キー
     * @param {Function} callback コールバック関数
     */
    removeListener(key: string, callback: SettingsListener): void {
        if (this.listeners.has(key)) {
            const listeners = this.listeners.get(key)!;
            const index = listeners.findIndex(listener => listener.callback === callback);
            if (index !== -1) {
                listeners.splice(index, 1);
                if (listeners.length === 0) {
                    this.listeners.delete(key);
                }
            }
        }
    }
    
    /**
     * リスナーIDで削除
     * @param {string} listenerId リスナーID
     */
    removeListenerById(listenerId: string): void {
        for (const [key, listeners] of this.listeners.entries()) {
            const index = listeners.findIndex(listener => listener.id === listenerId);
            if (index !== -1) {
                listeners.splice(index, 1);
                if (listeners.length === 0) {
                    this.listeners.delete(key);
                }
                break;
            }
        }
    }
    
    /**
     * 設定変更を通知
     * @param {string} key 設定キー
     * @param {*} newValue 新しい値
     * @param {*} oldValue 古い値
     */
    notifyChange(key: string, newValue: any, oldValue: any): void {
        try {
            // 通知システムに通知
            this.notificationSystem.notifyChange(key, newValue, oldValue);
            
            // リスナーに通知
            if (this.listeners.has(key)) {
                const listeners = [...this.listeners.get(key)!];
                for (const listener of listeners) {
                    try {
                        listener.callback(key, key, newValue, oldValue);
                        
                        // onceオプションの処理
                        if (listener.once) {
                            this.removeListenerById(listener.id);
                        }
                    } catch (error) {
                        console.error('[SettingsManager] Listener error:', error);
                    }
                }
            }
            
            // UI設定の適用
            this.uiController.applySettingChange(key, newValue, oldValue);

        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_NOTIFY_ERROR', { key, newValue, oldValue });
        }
    }
    
    // ========== 設定適用 ==========
    
    /**
     * 全ての設定を適用
     */
    applyAllSettings(): void {
        try {
            console.log('[SettingsManager] Applying all settings');
            
            // UI設定の適用
            this.uiController.applyAllUISettings();
            
            console.log('[SettingsManager] All settings applied successfully');
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_APPLY_ALL_ERROR');
        }
    }
    
    // ========== 保存・読み込み ==========
    
    /**
     * 設定を保存
     * @returns {boolean} 保存成功可否
     */
    save(): boolean {
        try {
            const configData = this.configManager.exportConfig();
            return this.storageManager.saveSettings(configData);
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_SAVE_ERROR');
            return false;
        }
    }
    
    /**
     * 設定を読み込み
     * @returns {boolean} 読み込み成功可否
     */
    load(): boolean {
        try {
            const loadedSettings = this.storageManager.loadSettings();
            if (loadedSettings) {
                // デフォルト設定とマージ
                const defaultSettings = this.dataManager.getDefaultSettings();
                const mergedSettings = this.dataManager.mergeSettings(defaultSettings, loadedSettings);
                
                // ConfigurationManagerに設定
                for (const [key, value] of Object.entries(mergedSettings)) {
                    this.configManager.set(key, value);
                }
                
                // 設定を適用
                this.applyAllSettings();
                
                console.log('[SettingsManager] Settings loaded and applied successfully');
                return true;
            }
            
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_LOAD_ERROR');
            return false;
        }
    }
    
    // ========== エクスポート・インポート ==========
    
    /**
     * 設定をエクスポート
     * @param {Object} options エクスポートオプション
     * @returns {string} JSON形式の設定データ
     */
    export(options: any = {}): string {
        return this.exportImport.export(options);
    }
    
    /**
     * 設定をインポート
     * @param {string} settingsJson JSON形式の設定データ
     * @param {Object} options インポートオプション
     * @returns {Promise<Object>} インポート結果
     */
    async import(settingsJson: string, options: any = {}): Promise<any>
        return await this.exportImport.import(settingsJson, options);
    }
    
    // ========== 統計・状態取得 ==========
    
    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    getStats(): any {
        return {
            dataManager: this.dataManager.getStats(),
            uiController: this.uiController.getUIStats(),
            exportImport: this.exportImport.getStats(),
            validator: this.validator.getValidationStats(),
            storageManager: this.storageManager.getSyncStats(),
            listeners: this.getActiveListeners(),
            watchers: this.getActiveWatchers()
        };
    }
    
    /**
     * アクティブなリスナーを取得
     * @returns {Object} アクティブリスナー情報
     */
    getActiveListeners(): Record<string, number> {
        const listenerStats: Record<string, number> = {};
        for (const [key, listeners] of this.listeners.entries()) {
            listenerStats[key] = listeners.length;
        }
        return listenerStats;
    }
    
    /**
     * アクティブなウォッチャーを取得
     * @returns {Object} アクティブウォッチャー情報
     */
    getActiveWatchers(): Record<string, string> {
        return Object.fromEntries(this.configWatchers.entries());
    }
    
    /**
     * 統合ステータスを取得
     * @returns {Object} 統合ステータス
     */
    getIntegrationStatus(): any {
        return {
            configManager: !!this.configManager,
            notificationSystem: !!this.notificationSystem,
            validator: !!this.validator,
            storageManager: !!this.storageManager,
            dataManager: !!this.dataManager,
            uiController: !!this.uiController,
            exportImport: !!this.exportImport,
            gameEngine: !!this.gameEngine
        };
    }
    
    // ========== コンポーネント管理 ==========
    
    /**
     * コンポーネントウォッチャーを追加
     * @param {string} componentName コンポーネント名
     * @param {Object} component コンポーネントオブジェクト
     * @param {Array} watchedSettings 監視する設定のリスト
     * @returns {string} ウォッチャーID
     */
    addComponentWatcher(componentName: string, component: any, watchedSettings: string[]): string {
        return this.uiController.addComponentWatcher(componentName, component, watchedSettings);
    }
    
    /**
     * コンポーネントウォッチャーを削除
     * @param {string} watcherId ウォッチャーID
     */
    removeComponentWatcher(watcherId: string): void {
        this.uiController.removeComponentWatcher(watcherId);
    }
    
    // ========== バックアップ・復元 ==========
    
    /**
     * バックアップを作成
     * @returns {Promise<Object>} バックアップ情報
     */
    async createBackup(): Promise<any> {
        return await this.exportImport.createBackup();
    }
    
    /**
     * バックアップから復元
     * @param {number} backupIndex バックアップインデックス
     * @returns {Promise<Object>} 復元結果
     */
    async restoreFromBackup(backupIndex: number = -1): Promise<any> {
        return await this.exportImport.restoreFromBackup(backupIndex);
    }
    
    /**
     * バックアップ履歴を取得
     * @returns {Array} バックアップ履歴
     */
    getBackupHistory(): any[] {
        return this.exportImport.getBackupHistory();
    }
    
    // ========== 通知システム連携 ==========
    
    /**
     * 通知統計を取得
     * @returns {Object} 通知統計
     */
    getNotificationStats(): any {
        return this.notificationSystem.getStats();
    }
    
    /**
     * 通知履歴を取得
     * @param {number} limit 取得件数制限
     * @returns {Array} 通知履歴
     */
    getNotificationHistory(limit: number = 50): any[] {
        return this.notificationSystem.getNotificationHistory(limit);
    }
    
    // ========== ストレージ健全性 ==========
    
    /**
     * ストレージの健全性をチェック
     * @returns {Object} 健全性レポート
     */
    checkStorageHealth(): any {
        return this.storageManager.checkStorageHealth();
    }
    
    // ========== クリーンアップ ==========
    
    /**
     * クリーンアップ
     */
    cleanup(): void {
        // サブコンポーネントのクリーンアップ
        if (this.storageManager) {
            this.storageManager.cleanup();
        }
        
        if (this.uiController) {
            this.uiController.reset();
        }
        
        if (this.exportImport) {
            this.exportImport.resetStats();
        }
        
        // リスナーをクリア
        this.listeners.clear();
        
        // ConfigurationManagerの監視をクリア
        if (this.configWatchers) {
            for (const watchId of this.configWatchers.values()) {
                this.configManager.unwatch(watchId);
            }
            this.configWatchers.clear();
        }
        
        // 通知システムをクリーンアップ
        if (this.notificationSystem) {
            this.notificationSystem.cleanup();
        }
        
        console.log('[SettingsManager] Main Controller cleanup completed');
    }
}

// シングルトンインスタンス
let settingsManagerInstance: SettingsManager | null = null;

/**
 * SettingsManagerシングルトンインスタンスの取得
 */
export function getSettingsManager(gameEngine?: GameEngine): SettingsManager | null {
    if (!settingsManagerInstance && gameEngine) {
        settingsManagerInstance = new SettingsManager(gameEngine);
    }
    return settingsManagerInstance;
}