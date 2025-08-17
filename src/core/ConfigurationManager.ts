/**
 * 設定管理システム - 中央設定管理クラス
 * 
 * 全ての設定値への統一されたアクセスポイントを提供し、
 * 設定の取得、設定、検証、監視機能を実装します。
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getCacheSystem } from './CacheSystem.js';

// Type definitions
type ConfigurationValue = string | number | boolean | object | null | undefined;

interface ValidationRule {
    validate: (value: ConfigurationValue) => boolean;
    errorMessage?: string;
    transform?: (value: ConfigurationValue) => ConfigurationValue;
    type?: string;
    pattern?: RegExp;
}

interface WatcherCallback {
    (key: string, newValue: ConfigurationValue, oldValue: ConfigurationValue): void;
}

interface AccessStats {
    totalAccesses: number;
    cacheHits: number;
    cacheMisses: number;
    frequentKeys: Map<string, number>;
    lastOptimization: number;
}

interface ChangeHistoryEntry {
    key: string;
    oldValue: ConfigurationValue;
    newValue: ConfigurationValue;
    timestamp: number;
    source?: string;
}

interface BubbleTypeConfig {
    name: string;
    baseScore: number;
    maxAge: number;
    speed: number;
    size: number;
}

type ConfigurationCategory = 'game' | 'audio' | 'effects' | 'performance' | 'ui' | 'accessibility' | 'controls';

class ConfigurationManager {
    private configurations: Map<string, Map<string, ConfigurationValue>>;
    private watchers: Map<string, Set<WatcherCallback>>;
    private validationRules: Map<string, ValidationRule>;
    private defaultValues: Map<string, Map<string, ConfigurationValue>>;
    private changeHistory: ChangeHistoryEntry[];
    private warningCache: Map<string, number>;
    private warningRateLimit: number;
    private cache: any; // CacheSystem type would be defined elsewhere
    private accessStats: AccessStats;
    // 将来の拡張機能用 - 現在は未使用
    // @ts-ignore - 将来の実装で使用予定
    private __lazyLoaders!: Map<string, () => ConfigurationValue>;
    // @ts-ignore - 将来の実装で使用予定
    private __preloadKeys!: Set<string>;
    private errorHandler: any;
    
    constructor() {
        // 設定データストレージ
        this.configurations = new Map<string, Map<string, ConfigurationValue>>();
        
        // 設定監視用のコールバック
        this.watchers = new Map<string, Set<WatcherCallback>>();
        
        // 検証ルール
        this.validationRules = new Map<string, ValidationRule>();
        
        // デフォルト値
        this.defaultValues = new Map<string, Map<string, ConfigurationValue>>();
        
        // 変更履歴（デバッグ用）
        this.changeHistory = [];
        
        // 警告ログレート制限（同じキーの警告は1秒以内は1回のみ）
        this.warningCache = new Map<string, number>();
        this.warningRateLimit = 1000; // 1秒
        
        // 高速アクセス用キャッシュシステム
        this.cache = getCacheSystem({
            maxSize: 500,
            ttl: 300000, // 5分間キャッシュ
            cleanupInterval: 60000 // 1分間隔でクリーンアップ
        });
        
        // アクセス統計（パフォーマンス監視用）
        this.accessStats = {
            totalAccesses: 0,
            cacheHits: 0,
            cacheMisses: 0,
            frequentKeys: new Map<string, number>(),
            lastOptimization: Date.now()
        };
        
        // 遅延読み込み用の設定ローダー（将来の拡張機能用）
        this.__lazyLoaders = new Map<string, () => ConfigurationValue>();
        
        // 頻繁にアクセスされるキーのプリロード設定（将来の拡張機能用）
        this.__preloadKeys = new Set([
            'game.scoring.baseScores',
            'game.bubbles.maxAge',
            'performance.optimization.maxBubbles',
            'effects.particles.maxCount',
            'audio.volumes.master'
        ]);
        
        // 初期化
        this._initialize();
    }
    
    /**
     * 初期化処理
     */
    private _initialize(): void {
        // デフォルト設定カテゴリを初期化
        const categories: ConfigurationCategory[] = [
            'game', 'audio', 'effects', 'performance', 'ui', 'accessibility', 'controls'
        ];
        
        categories.forEach(category => {
            this.configurations.set(category, new Map<string, ConfigurationValue>());
            this.defaultValues.set(category, new Map<string, ConfigurationValue>());
        });
        
        // 基本パフォーマンス設定のデフォルト値を設定
        this.setDefaultValue('performance', 'targetFPS', 60);
        this.setDefaultValue('performance', 'adaptiveMode', true);
        this.setDefaultValue('performance', 'performanceLevel', 'high');
        this.setDefaultValue('performance', 'maxBubbles', 20);
        this.setDefaultValue('performance', 'maxParticles', 500);
        
        // パフォーマンス最適化設定のデフォルト値を設定
        this.setDefaultValue('performance', 'optimization.targetFPS', 60);
        this.setDefaultValue('performance', 'optimization.adaptiveMode', true);
        this.setDefaultValue('performance', 'optimization.optimizationInterval', 1000);
        this.setDefaultValue('performance', 'optimization.maxHistorySize', 30);
        this.setDefaultValue('performance', 'optimization.performanceLevel', 'high');
        this.setDefaultValue('performance', 'optimization.maxBubbles', 20);
        this.setDefaultValue('performance', 'optimization.maxParticles', 500);
        this.setDefaultValue('performance', 'optimization.workloadDistribution', true);
        this.setDefaultValue('performance', 'optimization.maxTimePerFrame', 8);
        
        // エフェクト設定のデフォルト値を設定
        this.setDefaultValue('effects', 'quality.level', 'high');
        this.setDefaultValue('effects', 'quality.autoAdjust', true);
        this.setDefaultValue('effects', 'seasonal.enabled', true);
        this.setDefaultValue('effects', 'seasonal.autoDetection', true);
        this.setDefaultValue('effects', 'seasonal.currentSeason', 'spring');
        this.setDefaultValue('effects', 'audio.enabled', true);
        this.setDefaultValue('effects', 'audio.volumeSync', true);
        this.setDefaultValue('effects', 'particles.maxCount', 500);
        this.setDefaultValue('effects', 'particles.quality', 'high');
        
        // オーディオ設定のデフォルト値を設定
        this.setDefaultValue('audio', 'volumes.master', 0.8);
        this.setDefaultValue('audio', 'volumes.effects', 0.7);
        this.setDefaultValue('audio', 'volumes.music', 0.6);
        this.setDefaultValue('audio', 'enabled', true);
        
        // テスト互換性のため、SettingsManagerで使用される設定キーも設定
        this.setDefaultValue('audio', 'masterVolume', 0.7);
        this.setDefaultValue('audio', 'sfxVolume', 0.8);
        this.setDefaultValue('audio', 'bgmVolume', 0.5);
        
        // UI設定のデフォルト値を設定
        this.setDefaultValue('ui', 'language', 'en');
        this.setDefaultValue('ui', 'quality', 'auto');
        this.setDefaultValue('ui', 'theme', 'default');
        this.setDefaultValue('ui', 'reducedMotion', false);
        this.setDefaultValue('ui', 'highContrast', false);
        this.setDefaultValue('ui', 'showFPS', false);
        this.setDefaultValue('ui', 'showDebugInfo', false);
        this.setDefaultValue('ui', 'animationSpeed', 1.0);
        this.setDefaultValue('ui', 'uiScale', 1.0);
        
        // アクセシビリティ設定のデフォルト値を設定
        this.setDefaultValue('accessibility', 'highContrast', false);
        this.setDefaultValue('accessibility', 'reducedMotion', false);
        this.setDefaultValue('accessibility', 'largeText', false);
        this.setDefaultValue('accessibility', 'screenReader', false);
        this.setDefaultValue('accessibility', 'colorBlindSupport', false);
        
        // 操作設定のデフォルト値を設定
        this.setDefaultValue('controls', 'keyboardEnabled', true);
        this.setDefaultValue('controls', 'mouseEnabled', true);
        this.setDefaultValue('controls', 'touchEnabled', true);
        
        // ゲーム設定のデフォルト値を設定
        this.setDefaultValue('game', 'scoring.baseScores', {});
        this.setDefaultValue('game', 'bubbles.maxAge', 30000);
        this.setDefaultValue('game', 'difficulty', 'normal');
        
        // ゲームバブル詳細設定のデフォルト値を設定
        this._setupBubbleDefaults();
        
        // 検証ルールを設定
        this._setupValidationRules();
        
        // エラーハンドラを取得
        try {
            this.errorHandler = getErrorHandler();
        } catch (error) {
            console.warn('[ConfigurationManager] ErrorHandler not available:', error);
        }
        
        console.log('[ConfigurationManager] Configuration system initialized');
    }
    
    /**
     * バブル設定のデフォルト値を設定
     */
    private _setupBubbleDefaults(): void {
        const bubbleTypes: BubbleTypeConfig[] = [
            { name: 'normal', baseScore: 10, maxAge: 30000, speed: 1.0, size: 1.0 },
            { name: 'fast', baseScore: 15, maxAge: 20000, speed: 1.5, size: 0.8 },
            { name: 'large', baseScore: 20, maxAge: 40000, speed: 0.7, size: 1.5 },
            { name: 'bonus', baseScore: 50, maxAge: 15000, speed: 1.0, size: 1.0 }
        ];
        
        bubbleTypes.forEach(type => {
            this.setDefaultValue('game', `bubbles.types.${type.name}.baseScore`, type.baseScore);
            this.setDefaultValue('game', `bubbles.types.${type.name}.maxAge`, type.maxAge);
            this.setDefaultValue('game', `bubbles.types.${type.name}.speed`, type.speed);
            this.setDefaultValue('game', `bubbles.types.${type.name}.size`, type.size);
        });
    }
    
    /**
     * 検証ルールを設定
     */
    private _setupValidationRules(): void {
        // パフォーマンス関連の検証
        this.addValidationRule('performance.targetFPS', {
            validate: (value: ConfigurationValue) => 
                typeof value === 'number' && value >= 30 && value <= 120,
            errorMessage: 'Target FPS must be between 30 and 120'
        });
        
        // オーディオボリューム検証
        this.addValidationRule('audio.volumes.*', {
            validate: (value: ConfigurationValue) => 
                typeof value === 'number' && value >= 0 && value <= 1,
            errorMessage: 'Volume must be between 0 and 1'
        });
        
        // UI設定検証
        this.addValidationRule('ui.language', {
            validate: (value: ConfigurationValue) => 
                typeof value === 'string' && ['en', 'ja', 'ko', 'zh-CN', 'zh-TW'].includes(value),
            errorMessage: 'Language must be one of: en, ja, ko, zh-CN, zh-TW'
        });
    }
    
    /**
     * 設定値を取得
     */
    get<T = ConfigurationValue>(key: string): T | null;
    get<T = ConfigurationValue>(namespace: string, key: string): T | null;
    get<T = ConfigurationValue>(keyOrNamespace: string, key?: string): T | null {
        try {
            // 引数の処理
            const finalKey = key ? `${keyOrNamespace}.${key}` : keyOrNamespace;
            
            this.accessStats.totalAccesses++;
            this._trackKeyAccess(finalKey);
            
            // キャッシュから確認
            const cacheKey = `config:${finalKey}`;
            const cachedValue = this.cache.get(cacheKey);
            if (cachedValue !== undefined) {
                this.accessStats.cacheHits++;
                return cachedValue;
            }
            
            this.accessStats.cacheMisses++;
            
            // キーを解析
            const [category, ...pathParts] = finalKey.split('.');
            const path = pathParts.join('.');
            
            const categoryMap = this.configurations.get(category);
            if (!categoryMap) {
                return this._getDefaultValue<T>(category, path);
            }
            
            let value = categoryMap.get(path);
            if (value === undefined) {
                value = this._getDefaultValue<T>(category, path) as ConfigurationValue;
            }
            
            // キャッシュに保存
            this.cache.set(cacheKey, value as ConfigurationValue);
            
            return value as T;
            
        } catch (error) {
            const keyForError = key ? `${keyOrNamespace}.${key}` : keyOrNamespace;
            this._handleError(error, 'get', { key: keyForError });
            return null;
        }
    }
    
    /**
     * 設定値を設定
     */
    set<T extends ConfigurationValue = ConfigurationValue>(key: string, value: T): boolean;
    set<T extends ConfigurationValue = ConfigurationValue>(namespace: string, key: string, value: T): boolean;
    set<T extends ConfigurationValue = ConfigurationValue>(keyOrNamespace: string, keyOrValue: string | T, value?: T): boolean {
        try {
            // 引数の処理
            const finalKey = value !== undefined ? `${keyOrNamespace}.${keyOrValue}` : keyOrNamespace;
            const finalValue = value !== undefined ? value : keyOrValue as T;
            
            // 検証
            if (!this._validateValue(finalKey, finalValue)) {
                return false;
            }
            
            // キーを解析
            const [category, ...pathParts] = finalKey.split('.');
            const path = pathParts.join('.');
            
            // カテゴリマップを取得または作成
            let categoryMap = this.configurations.get(category);
            if (!categoryMap) {
                categoryMap = new Map<string, ConfigurationValue>();
                this.configurations.set(category, categoryMap);
            }
            
            // 古い値を取得
            const oldValue = categoryMap.get(path);
            
            // 値を設定
            categoryMap.set(path, finalValue as ConfigurationValue);
            
            // キャッシュを無効化
            const cacheKey = `config:${finalKey}`;
            this.cache.delete(cacheKey);
            
            // 変更履歴を記録
            this._recordChange(finalKey, oldValue, finalValue as ConfigurationValue);
            
            // ウォッチャーに通知
            this._notifyWatchers(finalKey, finalValue as ConfigurationValue, oldValue);
            
            return true;
            
        } catch (error) {
            const keyForError = value !== undefined ? `${keyOrNamespace}.${keyOrValue}` : keyOrNamespace;
            const valueForError = value !== undefined ? value : keyOrValue;
            this._handleError(error, 'set', { key: keyForError, value: valueForError });
            return false;
        }
    }
    
    /**
     * 設定キーが存在するかチェック
     */
    has(key: string): boolean {
        const [category, ...pathParts] = key.split('.');
        const path = pathParts.join('.');
        
        const categoryMap = this.configurations.get(category);
        if (!categoryMap) {
            return this._hasDefaultValue(category, path);
        }
        
        return categoryMap.has(path) || this._hasDefaultValue(category, path);
    }
    
    /**
     * 設定値を削除
     */
    remove(key: string): boolean {
        try {
            const [category, ...pathParts] = key.split('.');
            const path = pathParts.join('.');
            
            const categoryMap = this.configurations.get(category);
            if (!categoryMap) {
                return false;
            }
            
            const oldValue = categoryMap.get(path);
            const result = categoryMap.delete(path);
            
            if (result) {
                // キャッシュから削除
                const cacheKey = `config:${key}`;
                this.cache.delete(cacheKey);
                
                // 変更履歴を記録
                this._recordChange(key, oldValue, undefined);
                
                // ウォッチャーに通知
                this._notifyWatchers(key, undefined, oldValue);
            }
            
            return result;
            
        } catch (error) {
            this._handleError(error, 'remove', { key });
            return false;
        }
    }
    
    /**
     * すべての設定をクリア
     */
    clear(): void {
        this.configurations.clear();
        this.cache.clear();
        this.changeHistory = [];
        console.log('[ConfigurationManager] All configurations cleared');
    }
    
    /**
     * デフォルト値を設定
     */
    setDefaultValue(category: string, path: string, value: ConfigurationValue): void {
        let defaultMap = this.defaultValues.get(category);
        if (!defaultMap) {
            defaultMap = new Map<string, ConfigurationValue>();
            this.defaultValues.set(category, defaultMap);
        }
        
        defaultMap.set(path, value);
    }
    
    /**
     * ウォッチャーを追加
     */
    addWatcher(key: string, callback: WatcherCallback): void {
        let watchers = this.watchers.get(key);
        if (!watchers) {
            watchers = new Set<WatcherCallback>();
            this.watchers.set(key, watchers);
        }
        
        watchers.add(callback);
    }
    
    /**
     * ウォッチャーを削除
     */
    removeWatcher(key: string, callback: WatcherCallback): boolean {
        const watchers = this.watchers.get(key);
        if (!watchers) {
            return false;
        }
        
        return watchers.delete(callback);
    }
    
    /**
     * 検証ルールを追加
     */
    addValidationRule(key: string, rule: ValidationRule): void {
        this.validationRules.set(key, rule);
    }
    
    /**
     * アクセス統計を取得
     */
    getAccessStats(): AccessStats {
        return { ...this.accessStats };
    }
    
    // Private helper methods
    
    private _getDefaultValue<T>(category: string, path: string): T | null {
        const defaultMap = this.defaultValues.get(category);
        if (!defaultMap) {
            return null;
        }
        
        return (defaultMap.get(path) as T) || null;
    }
    
    private _hasDefaultValue(category: string, path: string): boolean {
        const defaultMap = this.defaultValues.get(category);
        return defaultMap ? defaultMap.has(path) : false;
    }
    
    private _validateValue(key: string, value: ConfigurationValue): boolean {
        for (const ruleEntry of Array.from(this.validationRules.entries())) {
            const [ruleKey, rule] = ruleEntry;
            if (this._matchesPattern(key, ruleKey)) {
                if (!rule.validate(value)) {
                    this._logWarning(`Validation failed for ${key}: ${rule.errorMessage || 'Invalid value'}`, key);
                    return false;
                }
                
                // Transform value if transformer exists
                if (rule.transform) {
                    value = rule.transform(value);
                }
            }
        }
        
        return true;
    }
    
    private _matchesPattern(key: string, pattern: string): boolean {
        // Simple pattern matching with wildcards
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(key);
    }
    
    private _recordChange(key: string, oldValue: ConfigurationValue, newValue: ConfigurationValue): void {
        const change: ChangeHistoryEntry = {
            key,
            oldValue,
            newValue,
            timestamp: Date.now()
        };
        
        this.changeHistory.push(change);
        
        // Keep only last 100 changes
        if (this.changeHistory.length > 100) {
            this.changeHistory.shift();
        }
    }
    
    private _notifyWatchers(key: string, newValue: ConfigurationValue, oldValue: ConfigurationValue): void {
        const watchers = this.watchers.get(key);
        if (!watchers) {
            return;
        }
        
        watchers.forEach(callback => {
            try {
                callback(newValue, oldValue, typeof key === 'string' ? key : String(key));
            } catch (error) {
                this._handleError(error, 'watcher', { key, callback });
            }
        });
    }
    
    private _trackKeyAccess(key: string): void {
        const count = this.accessStats.frequentKeys.get(key) || 0;
        this.accessStats.frequentKeys.set(key, count + 1);
    }
    
    private _logWarning(message: string, key: string): void {
        const now = Date.now();
        const lastWarning = this.warningCache.get(key);
        
        if (!lastWarning || now - lastWarning > this.warningRateLimit) {
            console.warn(`[ConfigurationManager] ${message}`);
            this.warningCache.set(key, now);
        }
    }
    
    private _handleError(error: any, operation: string, context: any): void {
        if (this.errorHandler && this.errorHandler.handleError) {
            this.errorHandler.handleError(error, 'CONFIGURATION_ERROR', {
                component: 'ConfigurationManager',
                operation,
                context
            });
        } else {
            console.error(`[ConfigurationManager] Error in ${operation}:`, error, context);
        }
    }
    
    /**
     * テスト用: configurationsプロパティへのアクセス
     */
    get _configurations(): Map<string, Map<string, ConfigurationValue>> {
        return this.configurations;
    }
    
    /**
     * バリデーション機能（テスト用）
     */
    validate(namespace: string, key: string, value: ConfigurationValue): boolean {
        const ruleKey = `${namespace}.${key}`;
        const rule = this.validationRules.get(ruleKey);
        
        if (!rule) return true;
        
        // 基本的なバリデーション
        if (rule.type && typeof value !== rule.type) {
            return false;
        }
        
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * バリデーションルールを設定（テスト用）
     */
    setValidationRule(key: string, rule: ValidationRule): void {
        this.validationRules.set(key, rule);
    }

    /**
     * カテゴリ別の設定値を取得
     * @param {string} category - カテゴリ名
     * @returns {Record<string, ConfigurationValue>} カテゴリの設定値
     */
    getCategory(category: string): Record<string, ConfigurationValue> {
        const result: Record<string, ConfigurationValue> = {};
        const prefix = category + '.';
        
        for (const [key, value] of this.configurations.entries()) {
            if (key.startsWith(prefix)) {
                const subKey = key.substring(prefix.length);
                result[subKey] = value;
            }
        }
        
        return result;
    }

    /**
     * 設定変更履歴を取得
     * @returns {Array} 変更履歴
     */
    getChangeHistory(): Array<{
        key: string;
        timestamp: number;
        oldValue: ConfigurationValue;
        newValue: ConfigurationValue;
    }> {
        return [...this.changeHistory];
    }

    /**
     * 設定値の変更を監視（エイリアス）
     * @param {string} pattern - 監視パターン
     * @param {function} callback - コールバック関数
     * @returns {function} 登録したコールバック関数
     */
    watch(pattern: string, callback: (key: string, newValue: ConfigurationValue, oldValue: ConfigurationValue) => void): WatcherCallback {
        this.addWatcher(pattern, callback);
        return callback;
    }

    /**
     * 監視を解除（エイリアス）
     * @param {string} key - 監視キー
     * @param {function} callback - コールバック関数
     */
    unwatch(key: string, callback: WatcherCallback): void {
        this.removeWatcher(key, callback);
    }

    /**
     * 設定をリセット（テスト用）
     */
    reset(): void {
        this.clear();
    }
}

// Singleton instance
let configurationManagerInstance: ConfigurationManager | null = null;

/**
 * Get ConfigurationManager singleton
 */
export function getConfigurationManager(): ConfigurationManager {
    if (!configurationManagerInstance) {
        configurationManagerInstance = new ConfigurationManager();
    }
    return configurationManagerInstance;
}

export { ConfigurationManager };
export default ConfigurationManager;