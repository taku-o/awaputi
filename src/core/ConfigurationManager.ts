/**
 * 設定管理システム - 中央設定管理クラス
 * 
 * 全ての設定値への統一されたアクセスポイントを提供し、
 * 設定の取得、設定、検証、監視機能を実装します。
 */

import { getErrorHandler } from '../utils/ErrorHandler';
import { getCacheSystem, CacheSystem } from './CacheSystem';

interface WatchCallback {
    (newValue: any, oldValue: any, category: string, key: string): void;
}

interface ValidationRule {
    type?: string;
    min?: number;
    max?: number;
    allowedValues?: string[];
    validator?: (value: any) => boolean;
}

interface AccessStats {
    totalAccesses: number;
    cacheHits: number;
    cacheMisses: number;
    frequentKeys: Map<string, number>;
    lastOptimization: number;
}

interface ChangeRecord {
    timestamp: number;
    category: string;
    key: string;
    oldValue: any;
    newValue: any;
}

interface PerformanceStats {
    totalAccesses: number;
    cacheHits: number;
    cacheMisses: number;
    hitRate: string;
    cachedKeys: number;
    preloadKeys: number;
    lazyLoaders: number;
    topAccessedKeys: Array<{ key: string; count: number }>;
    cacheStats: any;
}

export class ConfigurationManager {
    private configurations: Map<string, Map<string, any>>;
    private watchers: Map<string, Map<string, WatchCallback>>;
    private validationRules: Map<string, ValidationRule>;
    private defaultValues: Map<string, any>;
    private changeHistory: ChangeRecord[];
    private warningCache: Map<string, number>;
    private warningRateLimit: number;
    private cache: CacheSystem;
    private accessStats: AccessStats;
    private lazyLoaders: Map<string, () => any>;
    private preloadKeys: Set<string>;

    constructor() {
        // 設定データストレージ
        this.configurations = new Map();
        
        // 設定監視用のコールバック
        this.watchers = new Map();
        
        // 検証ルール
        this.validationRules = new Map();
        
        // デフォルト値
        this.defaultValues = new Map();
        
        // 変更履歴（デバッグ用）
        this.changeHistory = [];
        
        // 警告ログレート制限（同じキーの警告は1秒以内は1回のみ）
        this.warningCache = new Map();
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
            frequentKeys: new Map(), // キー別アクセス回数
            lastOptimization: Date.now()
        };
        
        // 遅延読み込み用の設定ローダー
        this.lazyLoaders = new Map();
        
        // 頻繁にアクセスされるキーのプリロード設定
        this.preloadKeys = new Set([
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
     * @private
     */
    private _initialize(): void {
        // デフォルト設定カテゴリを初期化
        this.configurations.set('game', new Map());
        this.configurations.set('audio', new Map());
        this.configurations.set('effects', new Map());
        this.configurations.set('performance', new Map());
        this.configurations.set('ui', new Map());
        this.configurations.set('accessibility', new Map());
        this.configurations.set('controls', new Map());
        
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
        
        // 非同期でキャッシュウォームアップを実行
        setTimeout(() => {
            this.warmupCache();
        }, 100);
        
        // デバッグログ
        if (this._isDebugMode()) {
            console.log('[ConfigurationManager] 初期化完了');
        }
    }
    
    /**
     * 設定値を取得（最適化版）
     */
    public get(category: string, key: string, defaultValue: any = null): any {
        try {
            // 引数の検証：undefinedキーを防ぐ
            if (!category || category === 'undefined' || typeof category !== 'string') {
                this._logWarning(`無効なカテゴリ: ${category}`);
                return defaultValue;
            }
            if (key === undefined || key === 'undefined' || typeof key !== 'string') {
                this._logWarning(`無効なキー: ${key} (カテゴリ: ${category})`);
                return defaultValue;
            }
            
            const fullKey = `${category}.${key}`;
            
            // アクセス統計を更新
            this._updateAccessStats(fullKey);
            
            // キャッシュから取得を試行
            const cachedValue = this.cache.get(fullKey);
            if (cachedValue !== null) {
                this.accessStats.cacheHits++;
                this._logDebug(`キャッシュから取得: ${fullKey} = ${cachedValue}`);
                return cachedValue;
            }
            
            this.accessStats.cacheMisses++;
            
            // 遅延読み込みの確認
            if (this.lazyLoaders.has(fullKey)) {
                const loader = this.lazyLoaders.get(fullKey)!;
                const value = loader();
                
                // 読み込んだ値をキャッシュに保存
                this._cacheValue(fullKey, value);
                this._logDebug(`遅延読み込み: ${fullKey} = ${value}`);
                return value;
            }
            
            // 通常の設定値取得
            const value = this._getDirectValue(category, key, defaultValue);
            
            // 頻繁にアクセスされるキーはキャッシュに保存
            if (this._shouldCache(fullKey)) {
                this._cacheValue(fullKey, value);
            }
            
            return value;
            
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager.get',
                category,
                key,
                defaultValue
            });
            return defaultValue;
        }
    }
    
    /**
     * 直接的な設定値取得（キャッシュなし）
     * @private
     */
    private _getDirectValue(category: string, key: string, defaultValue: any = null): any {
        // まずデフォルト値を確認（バブル設定などで使用）
        const defaultKey = `${category}.${key}`;
        if (this.defaultValues.has(defaultKey)) {
            const value = this.defaultValues.get(defaultKey);
            this._logDebug(`デフォルト値を使用: ${category}.${key} = ${value}`);
            return value;
        }
        
        // カテゴリの存在確認
        if (!this.configurations.has(category)) {
            this._logWarning(`カテゴリが存在しません: ${category}`);
            return defaultValue;
        }
        
        const categoryConfig = this.configurations.get(category)!;
        
        // 設定されたカスタム値を確認
        if (categoryConfig.has(key)) {
            const value = categoryConfig.get(key);
            this._logDebug(`設定値取得: ${category}.${key} = ${value}`);
            return value;
        }
        
        // どちらにも存在しない場合は警告
        if (category === 'game' && key.startsWith('bubbles.')) {
            const bubbleType = key.split('.')[1];
            this._logWarning(`バブル設定が見つかりません: ${category}.${key} (バブル種類: ${bubbleType})`);
        } else {
            this._logWarning(`設定キーが存在しません: ${category}.${key}`);
        }
        return defaultValue;
    }
    
    /**
     * 設定値を設定（最適化版）
     */
    public set(category: string, key: string | any, value?: any): boolean {
        try {
            // ドット記法のサポート（valueが未定義の場合）
            if (value === undefined && typeof category === 'string' && category.includes('.')) {
                const parts = category.split('.');
                const actualCategory = parts.slice(0, -1).join('.');
                const actualKey = parts[parts.length - 1];
                const actualValue = key; // この場合、keyが実際のvalueになる
                return this.set(actualCategory, actualKey, actualValue);
            }
            
            // 型チェック
            if (typeof key !== 'string') {
                this._logWarning(`無効なキー型: ${typeof key}`);
                return false;
            }
            
            // 検証実行
            if (!this.validate(category, key, value)) {
                this._logWarning(`設定値の検証に失敗: ${category}.${key} = ${value}`);
                return false;
            }
            
            // カテゴリが存在しない場合は作成
            if (!this.configurations.has(category)) {
                this.configurations.set(category, new Map());
                this._logDebug(`新しいカテゴリを作成: ${category}`);
            }
            
            const categoryConfig = this.configurations.get(category)!;
            const oldValue = categoryConfig.get(key);
            
            // 値を設定
            categoryConfig.set(key, value);
            
            // キャッシュを無効化
            const fullKey = `${category}.${key}`;
            this.cache.delete(fullKey);
            
            // 新しい値をキャッシュに保存（頻繁にアクセスされる場合）
            if (this._shouldCache(fullKey)) {
                this._cacheValue(fullKey, value);
            }
            
            // 変更履歴を記録
            this._recordChange(category, key, oldValue, value);
            
            // 監視者に通知
            this._notifyWatchers(category, key, value, oldValue);
            
            this._logDebug(`設定値更新: ${category}.${key} = ${value}`);
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager.set',
                category,
                key,
                value
            });
            return false;
        }
    }
    
    /**
     * 設定値を検証
     */
    public validate(category: string, key: string, value: any): boolean {
        try {
            const ruleKey = `${category}.${key}`;
            
            // 検証ルールが存在しない場合は通す
            if (!this.validationRules.has(ruleKey)) {
                return true;
            }
            
            const rule = this.validationRules.get(ruleKey)!;
            
            // 型チェック
            if (rule.type && typeof value !== rule.type) {
                this._logWarning(`型が不正: ${ruleKey} - 期待値: ${rule.type}, 実際: ${typeof value}`);
                return false;
            }
            
            // 範囲チェック（数値の場合）
            if (typeof value === 'number') {
                if (rule.min !== undefined && value < rule.min) {
                    this._logWarning(`値が最小値を下回る: ${ruleKey} - 最小値: ${rule.min}, 実際: ${value}`);
                    return false;
                }
                if (rule.max !== undefined && value > rule.max) {
                    this._logWarning(`値が最大値を上回る: ${ruleKey} - 最大値: ${rule.max}, 実際: ${value}`);
                    return false;
                }
            }
            
            // 選択肢制限チェック（文字列の場合）
            if (rule.allowedValues && Array.isArray(rule.allowedValues)) {
                if (!rule.allowedValues.includes(value)) {
                    this._logWarning(`許可されていない値: ${ruleKey} - 許可値: [${rule.allowedValues.join(', ')}], 実際: ${value}`);
                    return false;
                }
            }
            
            // カスタム検証関数
            if (rule.validator && typeof rule.validator === 'function') {
                if (!rule.validator(value)) {
                    this._logWarning(`カスタム検証に失敗: ${ruleKey}`);
                    return false;
                }
            }
            
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager.validate',
                category,
                key,
                value
            });
            return false;
        }
    }
    
    /**
     * 設定変更を監視
     */
    public watch(category: string, key: string, callback: WatchCallback): string {
        try {
            const watchKey = `${category}.${key}`;
            const watchId = `${watchKey}_${Date.now()}_${Math.random()}`;
            
            if (!this.watchers.has(watchKey)) {
                this.watchers.set(watchKey, new Map());
            }
            
            this.watchers.get(watchKey)!.set(watchId, callback);
            
            this._logDebug(`監視を開始: ${watchKey} (ID: ${watchId})`);
            return watchId;
            
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager.watch',
                category,
                key
            });
            return '';
        }
    }
    
    /**
     * 監視を解除
     */
    public unwatch(watchId: string): boolean {
        try {
            for (const [watchKey, callbacks] of this.watchers) {
                if (callbacks.has(watchId)) {
                    callbacks.delete(watchId);
                    this._logDebug(`監視を解除: ${watchKey} (ID: ${watchId})`);
                    
                    // コールバックが空になったら削除
                    if (callbacks.size === 0) {
                        this.watchers.delete(watchKey);
                    }
                    
                    return true;
                }
            }
            
            this._logWarning(`監視IDが見つかりません: ${watchId}`);
            return false;
            
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager.unwatch',
                watchId
            });
            return false;
        }
    }
    
    /**
     * 設定をリセット
     */
    public reset(category: string | null = null): boolean {
        try {
            if (category) {
                // 特定カテゴリのリセット
                if (this.configurations.has(category)) {
                    this.configurations.get(category)!.clear();
                    this._logDebug(`カテゴリをリセット: ${category}`);
                }
            } else {
                // 全カテゴリのリセット
                for (const categoryConfig of this.configurations.values()) {
                    categoryConfig.clear();
                }
                this._logDebug('全設定をリセット');
            }
            
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager.reset',
                category
            });
            return false;
        }
    }
    
    /**
     * 検証ルールを設定
     */
    public setValidationRule(category: string, key: string, rule: ValidationRule): void {
        const ruleKey = `${category}.${key}`;
        this.validationRules.set(ruleKey, rule);
        this._logDebug(`検証ルールを設定: ${ruleKey}`);
    }
    
    /**
     * デフォルト値を設定
     */
    public setDefaultValue(category: string, key: string, value: any): void {
        const defaultKey = `${category}.${key}`;
        this.defaultValues.set(defaultKey, value);
        this._logDebug(`デフォルト値を設定: ${defaultKey} = ${value}`);
    }
    
    /**
     * 設定の存在確認
     */
    public has(category: string, key?: string): boolean {
        // ドット記法のサポート（keyが未定義の場合）
        if (key === undefined && typeof category === 'string' && category.includes('.')) {
            const parts = category.split('.');
            const actualCategory = parts.slice(0, -1).join('.');
            const actualKey = parts[parts.length - 1];
            return this.configurations.has(actualCategory) && 
                   this.configurations.get(actualCategory)!.has(actualKey);
        }
        
        // 従来の形式
        return this.configurations.has(category) && 
               key !== undefined &&
               this.configurations.get(category)!.has(key);
    }
    
    /**
     * カテゴリ内の全設定を取得
     */
    public getCategory(category: string): Record<string, any> {
        if (!this.configurations.has(category)) {
            return {};
        }
        
        const categoryConfig = this.configurations.get(category)!;
        const result: Record<string, any> = {};
        
        for (const [key, value] of categoryConfig) {
            result[key] = value;
        }
        
        return result;
    }
    
    /**
     * 全ての設定データをエクスポート
     */
    public exportConfig(): Record<string, Record<string, any>> {
        try {
            const result: Record<string, Record<string, any>> = {};
            
            // 全カテゴリの設定をエクスポート
            for (const [category, categoryConfig] of this.configurations) {
                result[category] = {};
                for (const [key, value] of categoryConfig) {
                    result[category][key] = value;
                }
            }
            
            // デフォルト値も含める（設定されていないキーの場合）
            for (const [defaultKey, defaultValue] of this.defaultValues) {
                const [category, key] = defaultKey.split('.');
                
                // カテゴリが存在しない場合は作成
                if (!result[category]) {
                    result[category] = {};
                }
                
                // 設定されていない場合のみデフォルト値を追加
                if (result[category][key] === undefined) {
                    result[category][key] = defaultValue;
                }
            }
            
            this._logDebug(`設定データをエクスポート: ${Object.keys(result).length}カテゴリ`);
            return result;
            
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager.exportConfig'
            });
            return {};
        }
    }
    
    /**
     * 変更履歴を取得
     */
    public getChangeHistory(): ChangeRecord[] {
        return [...this.changeHistory];
    }
    
    /**
     * 監視者に通知
     * @private
     */
    private _notifyWatchers(category: string, key: string, newValue: any, oldValue: any): void {
        const watchKey = `${category}.${key}`;
        
        if (this.watchers.has(watchKey)) {
            const callbacks = this.watchers.get(watchKey)!;
            
            for (const callback of callbacks.values()) {
                try {
                    callback(newValue, oldValue, category, key);
                } catch (error) {
                    getErrorHandler().handleError(error as Error, 'CONFIGURATION_ERROR', {
                        context: 'ConfigurationManager._notifyWatchers',
                        watchKey
                    });
                }
            }
        }
    }
    
    /**
     * 変更履歴を記録
     * @private
     */
    private _recordChange(category: string, key: string, oldValue: any, newValue: any): void {
        this.changeHistory.push({
            timestamp: Date.now(),
            category,
            key,
            oldValue,
            newValue
        });
        
        // 履歴が長くなりすぎないよう制限
        if (this.changeHistory.length > 1000) {
            this.changeHistory.splice(0, 100);
        }
    }
    
    /**
     * デバッグモード判定
     * @private
     */
    private _isDebugMode(): boolean {
        try {
            if (typeof window !== 'undefined' && window.location) {
                return new URLSearchParams(window.location.search).has('debug') ||
                       (typeof localStorage !== 'undefined' && localStorage.getItem('debugMode') === 'true');
            }
            return false;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * デバッグログ出力
     * @private
     */
    private _logDebug(message: string): void {
        if (this._isDebugMode()) {
            console.log(`[ConfigurationManager] ${message}`);
        }
    }
    
    /**
     * 警告ログ出力（レート制限付き）
     * @private
     */
    private _logWarning(message: string): void {
        // 毎フレームの大量ログを防ぐため、同じメッセージの警告は制限
        const now = Date.now();
        const lastWarningTime = this.warningCache.get(message);
        
        if (!lastWarningTime || (now - lastWarningTime) >= this.warningRateLimit) {
            console.warn(`[ConfigurationManager] ${message}`);
            this.warningCache.set(message, now);
            
            // キャッシュサイズ制限（メモリリーク防止）
            if (this.warningCache.size > 100) {
                // 古い警告記録を削除
                const sortedEntries = Array.from(this.warningCache.entries())
                    .sort((a, b) => b[1] - a[1]) // 時刻で降順ソート
                    .slice(0, 50); // 最新50件のみ保持
                
                this.warningCache.clear();
                sortedEntries.forEach(([msg, time]) => {
                    this.warningCache.set(msg, time);
                });
            }
        }
    }
    
    /**
     * アクセス統計を更新
     * @private
     */
    private _updateAccessStats(fullKey: string): void {
        this.accessStats.totalAccesses++;
        
        // キー別アクセス回数を更新
        const currentCount = this.accessStats.frequentKeys.get(fullKey) || 0;
        this.accessStats.frequentKeys.set(fullKey, currentCount + 1);
        
        // 定期的に最適化を実行
        const now = Date.now();
        if (now - this.accessStats.lastOptimization > 60000) { // 1分間隔
            this._optimizeCache();
            this.accessStats.lastOptimization = now;
        }
    }
    
    /**
     * キャッシュすべきかどうかを判定
     * @private
     */
    private _shouldCache(fullKey: string): boolean {
        // プリロードキーは常にキャッシュ
        if (this.preloadKeys.has(fullKey)) {
            return true;
        }
        
        // アクセス回数が閾値を超えた場合はキャッシュ
        const accessCount = this.accessStats.frequentKeys.get(fullKey) || 0;
        return accessCount >= 3; // 3回以上アクセスされたらキャッシュ
    }
    
    /**
     * 値をキャッシュに保存
     * @private
     */
    private _cacheValue(fullKey: string, value: any): void {
        // 頻繁にアクセスされるキーは長時間キャッシュ
        const accessCount = this.accessStats.frequentKeys.get(fullKey) || 0;
        const ttl = this.preloadKeys.has(fullKey) ? 600000 : // プリロードキー: 10分
                   accessCount >= 10 ? 300000 : // 頻繁アクセス: 5分
                   60000; // 通常: 1分
        
        const priority = this.preloadKeys.has(fullKey) ? 100 : // プリロードキー: 最高優先度
                        accessCount >= 10 ? 50 : // 頻繁アクセス: 高優先度
                        10; // 通常: 低優先度
        
        this.cache.set(fullKey, value, { ttl, priority });
    }
    
    /**
     * 遅延読み込み関数を登録
     */
    public registerLazyLoader(category: string, key: string, loader: () => any): void {
        const fullKey = `${category}.${key}`;
        this.lazyLoaders.set(fullKey, loader);
        this._logDebug(`遅延読み込み関数を登録: ${fullKey}`);
    }
    
    /**
     * プリロードキーを追加
     */
    public addPreloadKey(category: string, key: string): void {
        const fullKey = `${category}.${key}`;
        this.preloadKeys.add(fullKey);
        
        // 既に値が存在する場合はプリロード
        if (this.has(category, key)) {
            const value = this._getDirectValue(category, key);
            this._cacheValue(fullKey, value);
        }
        
        this._logDebug(`プリロードキーを追加: ${fullKey}`);
    }
    
    /**
     * キャッシュを最適化
     * @private
     */
    private _optimizeCache(): void {
        try {
            // 頻繁にアクセスされるキーを特定
            const sortedKeys = Array.from(this.accessStats.frequentKeys.entries())
                .sort((a, b) => b[1] - a[1]) // アクセス回数の降順
                .slice(0, 20); // 上位20キー
            
            // 頻繁にアクセスされるキーをプリロード
            for (const [fullKey, count] of sortedKeys) {
                if (count >= 5 && !this.cache.has(fullKey)) {
                    const [category, key] = fullKey.split('.');
                    if (this.has(category, key)) {
                        const value = this._getDirectValue(category, key);
                        this._cacheValue(fullKey, value);
                    }
                }
            }
            
            // 古いアクセス統計をクリーンアップ
            if (this.accessStats.frequentKeys.size > 100) {
                // アクセス回数の少ないキーを削除
                const keysToDelete = Array.from(this.accessStats.frequentKeys.entries())
                    .filter(([, count]) => count < 2)
                    .map(([key]) => key);
                
                for (const key of keysToDelete) {
                    this.accessStats.frequentKeys.delete(key);
                }
            }
            
            this._logDebug(`キャッシュ最適化完了: ${sortedKeys.length}キーを処理`);
            
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager._optimizeCache'
            });
        }
    }
    
    /**
     * パフォーマンス統計を取得
     */
    public getPerformanceStats(): PerformanceStats {
        const hitRate = this.accessStats.totalAccesses > 0 
            ? (this.accessStats.cacheHits / this.accessStats.totalAccesses) * 100 
            : 0;
        
        const topKeys = Array.from(this.accessStats.frequentKeys.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([key, count]) => ({ key, count }));
        
        return {
            totalAccesses: this.accessStats.totalAccesses,
            cacheHits: this.accessStats.cacheHits,
            cacheMisses: this.accessStats.cacheMisses,
            hitRate: `${hitRate.toFixed(2)}%`,
            cachedKeys: this.cache.getStats().size,
            preloadKeys: this.preloadKeys.size,
            lazyLoaders: this.lazyLoaders.size,
            topAccessedKeys: topKeys,
            cacheStats: this.cache.getStats()
        };
    }
    
    /**
     * キャッシュをウォームアップ（プリロード）
     */
    public warmupCache(): void {
        try {
            let warmedCount = 0;
            
            // プリロードキーをキャッシュに読み込み
            for (const fullKey of this.preloadKeys) {
                const [category, key] = fullKey.split('.');
                if (this.has(category, key)) {
                    const value = this._getDirectValue(category, key);
                    this._cacheValue(fullKey, value);
                    warmedCount++;
                }
            }
            
            this._logDebug(`キャッシュウォームアップ完了: ${warmedCount}キーを読み込み`);
            
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager.warmupCache'
            });
        }
    }
    
    /**
     * キャッシュをクリア
     */
    public clearCache(prefix: string | null = null): number {
        const clearedCount = this.cache.clear(prefix);
        this._logDebug(`キャッシュクリア: ${clearedCount}エントリを削除`);
        return clearedCount;
    }
    
    /**
     * バブルのデフォルト値を設定
     * @private
     */
    private _setupBubbleDefaults(): void {
        // Bubble.jsの_getHardcodedConfig()と同じ設定値を使用
        const bubbleConfigs: Record<string, Record<string, any>> = {
            normal: {
                health: 1,
                size: 50,
                maxAge: 12000,
                color: '#87CEEB',
                score: 15
            },
            stone: {
                health: 2,
                size: 55,
                maxAge: 16000,
                color: '#696969',
                score: 25
            },
            iron: {
                health: 3,
                size: 60,
                maxAge: 20000,
                color: '#708090',
                score: 40
            },
            diamond: {
                health: 4,
                size: 65,
                maxAge: 22000,
                color: '#B0E0E6',
                score: 60
            },
            pink: {
                health: 1,
                size: 45,
                maxAge: 10000,
                color: '#FFB6C1',
                score: 20,
                healAmount: 25
            },
            poison: {
                health: 1,
                size: 48,
                maxAge: 14000,
                color: '#9370DB',
                score: 30,
                damageAmount: 8
            },
            spiky: {
                health: 1,
                size: 52,
                maxAge: 13000,
                color: '#FF6347',
                score: 35,
                chainRadius: 120
            },
            rainbow: {
                health: 1,
                size: 55,
                maxAge: 16000,
                color: '#FF69B4',
                score: 400,
                bonusTimeMs: 8000
            },
            clock: {
                health: 1,
                size: 50,
                maxAge: 20000,
                color: '#FFD700',
                score: 180,
                timeStopMs: 2500
            },
            score: {
                health: 1,
                size: 48,
                maxAge: 9000,
                color: '#32CD32',
                score: 250,
                bonusScore: 80
            },
            electric: {
                health: 1,
                size: 50,
                maxAge: 13000,
                color: '#FFFF00',
                score: 20,
                shakeIntensity: 15,
                disableDuration: 1500
            },
            escaping: {
                health: 1,
                size: 45,
                maxAge: 16000,
                color: '#FF8C00',
                score: 50,
                escapeSpeed: 180,
                escapeRadius: 90
            },
            cracked: {
                health: 1,
                size: 52,
                maxAge: 6000,
                color: '#8B4513',
                score: 30
            },
            boss: {
                health: 8,
                size: 90,
                maxAge: 35000,
                color: '#8B0000',
                score: 100
            },
            golden: {
                health: 1,
                size: 55,
                maxAge: 8000,
                color: '#FFD700',
                score: 500,
                multiplier: 2.0
            },
            frozen: {
                health: 2,
                size: 50,
                maxAge: 25000,
                color: '#87CEEB',
                score: 100,
                slowEffect: 0.5
            },
            magnetic: {
                health: 1,
                size: 48,
                maxAge: 15000,
                color: '#FF1493',
                score: 150,
                magnetRadius: 100
            },
            explosive: {
                health: 1,
                size: 52,
                maxAge: 10000,
                color: '#FF4500',
                score: 200,
                explosionRadius: 150
            },
            phantom: {
                health: 1,
                size: 45,
                maxAge: 12000,
                color: '#9370DB',
                score: 300,
                phaseChance: 0.3
            },
            multiplier: {
                health: 1,
                size: 50,
                maxAge: 18000,
                color: '#32CD32',
                score: 100,
                scoreMultiplier: 3.0
            }
        };

        // 全バブル種類のデフォルト値を設定
        for (const [bubbleType, config] of Object.entries(bubbleConfigs)) {
            for (const [property, value] of Object.entries(config)) {
                this.setDefaultValue('game', `bubbles.${bubbleType}.${property}`, value);
            }
        }
        
        this._logDebug(`バブルデフォルト値設定完了: ${Object.keys(bubbleConfigs).length}種類`);
    }

    /**
     * 検証ルールを追加
     */
    public addValidationRule(category: string, key: string, rule: ValidationRule): void {
        try {
            const ruleKey = `${category}.${key}`;
            this.validationRules.set(ruleKey, rule);
            this._logDebug(`検証ルール追加: ${ruleKey}`);
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager.addValidationRule',
                category,
                key,
                rule
            });
        }
    }
    
    /**
     * 検証ルールを設定
     * @private
     */
    private _setupValidationRules(): void {
        // boolean型の設定項目
        this.addValidationRule('effects', 'quality.autoAdjust', { type: 'boolean' });
        this.addValidationRule('effects', 'seasonal.enabled', { type: 'boolean' });
        this.addValidationRule('effects', 'seasonal.autoDetection', { type: 'boolean' });
        this.addValidationRule('effects', 'audio.enabled', { type: 'boolean' });
        this.addValidationRule('effects', 'audio.volumeSync', { type: 'boolean' });
        this.addValidationRule('performance', 'adaptiveMode', { type: 'boolean' });
        this.addValidationRule('performance', 'optimization.adaptiveMode', { type: 'boolean' });
        this.addValidationRule('performance', 'optimization.workloadDistribution', { type: 'boolean' });
        this.addValidationRule('audio', 'enabled', { type: 'boolean' });
        
        // number型の設定項目（範囲チェック付き）
        this.addValidationRule('performance', 'targetFPS', { type: 'number', min: 15, max: 144 });
        this.addValidationRule('performance', 'optimization.targetFPS', { type: 'number', min: 15, max: 144 });
        this.addValidationRule('performance', 'optimization.optimizationInterval', { type: 'number', min: 100, max: 10000 });
        this.addValidationRule('performance', 'optimization.maxHistorySize', { type: 'number', min: 10, max: 1000 });
        this.addValidationRule('performance', 'optimization.maxBubbles', { type: 'number', min: 1, max: 100 });
        this.addValidationRule('performance', 'optimization.maxParticles', { type: 'number', min: 10, max: 10000 });
        this.addValidationRule('performance', 'optimization.maxTimePerFrame', { type: 'number', min: 1, max: 50 });
        this.addValidationRule('effects', 'particles.maxCount', { type: 'number', min: 10, max: 10000 });
        this.addValidationRule('audio', 'volumes.master', { type: 'number', min: 0, max: 1 });
        this.addValidationRule('audio', 'volumes.effects', { type: 'number', min: 0, max: 1 });
        this.addValidationRule('audio', 'volumes.music', { type: 'number', min: 0, max: 1 });
        this.addValidationRule('game', 'bubbles.maxAge', { type: 'number', min: 1000, max: 300000 });
        
        // string型の設定項目（選択肢制限付き）
        this.addValidationRule('effects', 'quality.level', { 
            type: 'string', 
            allowedValues: ['low', 'medium', 'high', 'ultra'] 
        });
        this.addValidationRule('effects', 'seasonal.currentSeason', { 
            type: 'string', 
            allowedValues: ['spring', 'summer', 'autumn', 'winter'] 
        });
        this.addValidationRule('effects', 'particles.quality', { 
            type: 'string', 
            allowedValues: ['low', 'medium', 'high'] 
        });
        this.addValidationRule('performance', 'performanceLevel', { 
            type: 'string', 
            allowedValues: ['low', 'medium', 'high'] 
        });
        this.addValidationRule('performance', 'optimization.performanceLevel', { 
            type: 'string', 
            allowedValues: ['low', 'medium', 'high'] 
        });
        this.addValidationRule('game', 'difficulty', { 
            type: 'string', 
            allowedValues: ['easy', 'normal', 'hard'] 
        });
        
        // SettingsManager互換性のためのオーディオ設定検証ルール
        this.addValidationRule('audio', 'masterVolume', { type: 'number', min: 0, max: 1 });
        this.addValidationRule('audio', 'sfxVolume', { type: 'number', min: 0, max: 1 });
        this.addValidationRule('audio', 'bgmVolume', { type: 'number', min: 0, max: 1 });
        
        // UI設定の検証ルール
        this.addValidationRule('ui', 'language', { 
            type: 'string', 
            allowedValues: ['en', 'ja', 'es', 'fr', 'de', 'zh', 'ko'] 
        });
        this.addValidationRule('ui', 'quality', { 
            type: 'string', 
            allowedValues: ['low', 'medium', 'high', 'auto'] 
        });
        this.addValidationRule('ui', 'theme', { 
            type: 'string', 
            allowedValues: ['default', 'dark', 'light', 'high-contrast'] 
        });
        this.addValidationRule('ui', 'reducedMotion', { type: 'boolean' });
        this.addValidationRule('ui', 'highContrast', { type: 'boolean' });
        this.addValidationRule('ui', 'showFPS', { type: 'boolean' });
        this.addValidationRule('ui', 'showDebugInfo', { type: 'boolean' });
        this.addValidationRule('ui', 'animationSpeed', { type: 'number', min: 0.1, max: 3.0 });
        this.addValidationRule('ui', 'uiScale', { type: 'number', min: 0.5, max: 2.0 });
        
        // アクセシビリティ設定の検証ルール
        this.addValidationRule('accessibility', 'highContrast', { type: 'boolean' });
        this.addValidationRule('accessibility', 'reducedMotion', { type: 'boolean' });
        this.addValidationRule('accessibility', 'largeText', { type: 'boolean' });
        this.addValidationRule('accessibility', 'screenReader', { type: 'boolean' });
        this.addValidationRule('accessibility', 'colorBlindSupport', { type: 'boolean' });
        
        // 操作設定の検証ルール
        this.addValidationRule('controls', 'keyboardEnabled', { type: 'boolean' });
        this.addValidationRule('controls', 'mouseEnabled', { type: 'boolean' });
        this.addValidationRule('controls', 'touchEnabled', { type: 'boolean' });
        
        this._logDebug('検証ルール設定完了');
    }
}

// シングルトンインスタンス
let instance: ConfigurationManager | null = null;

/**
 * ConfigurationManagerのシングルトンインスタンスを取得
 */
export function getConfigurationManager(): ConfigurationManager {
    if (!instance) {
        instance = new ConfigurationManager();
    }
    return instance;
}