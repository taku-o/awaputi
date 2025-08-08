/**
 * 設定管理システム - 中央設定管理クラス
 * 
 * 全ての設定値への統一されたアクセスポイントを提供し、
 * 設定の取得、設定、検証、監視機能を実装します。
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getCacheSystem } from './CacheSystem.js';

class ConfigurationManager {
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
    _initialize() {
        // デフォルト設定カテゴリを初期化
        this.configurations.set('game', new Map());
        this.configurations.set('audio', new Map());
        this.configurations.set('effects', new Map());
        this.configurations.set('performance', new Map());
        
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
        
        // ゲーム設定のデフォルト値を設定
        this.setDefaultValue('game', 'scoring.baseScores', {});
        this.setDefaultValue('game', 'bubbles.maxAge', 30000);
        this.setDefaultValue('game', 'difficulty', 'normal');
        
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
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {*} defaultValue - デフォルト値
     * @returns {*} 設定値
     */
    get(category, key, defaultValue = null) {
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
                const loader = this.lazyLoaders.get(fullKey);
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
            getErrorHandler().handleError(error, 'CONFIGURATION_ERROR', {
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
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {*} defaultValue - デフォルト値
     * @returns {*} 設定値
     * @private
     */
    _getDirectValue(category, key, defaultValue = null) {
        // カテゴリの存在確認
        if (!this.configurations.has(category)) {
            this._logWarning(`カテゴリが存在しません: ${category}`);
            return defaultValue;
        }
        
        const categoryConfig = this.configurations.get(category);
        
        // キーの存在確認
        if (!categoryConfig.has(key)) {
            // デフォルト値を確認
            const defaultKey = `${category}.${key}`;
            if (this.defaultValues.has(defaultKey)) {
                const value = this.defaultValues.get(defaultKey);
                this._logDebug(`デフォルト値を使用: ${category}.${key} = ${value}`);
                return value;
            }
            
            this._logWarning(`設定キーが存在しません: ${category}.${key}`);
            return defaultValue;
        }
        
        const value = categoryConfig.get(key);
        this._logDebug(`設定値取得: ${category}.${key} = ${value}`);
        return value;
    }
    
    /**
     * 設定値を設定（最適化版）
     * @param {string} category - 設定カテゴリまたはドット記法のキー
     * @param {string} key - 設定キーまたは設定値
     * @param {*} value - 設定値（オプション）
     * @returns {boolean} 設定成功フラグ
     */
    set(category, key, value) {
        try {
            // ドット記法のサポート（valueが未定義の場合）
            if (value === undefined && typeof category === 'string' && category.includes('.')) {
                const parts = category.split('.');
                const actualCategory = parts.slice(0, -1).join('.');
                const actualKey = parts[parts.length - 1];
                const actualValue = key; // この場合、keyが実際のvalueになる
                return this.set(actualCategory, actualKey, actualValue);
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
            
            const categoryConfig = this.configurations.get(category);
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
            getErrorHandler().handleError(error, 'CONFIGURATION_ERROR', {
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
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {*} value - 検証する値
     * @returns {boolean} 検証結果
     */
    validate(category, key, value) {
        try {
            const ruleKey = `${category}.${key}`;
            
            // 検証ルールが存在しない場合は通す
            if (!this.validationRules.has(ruleKey)) {
                return true;
            }
            
            const rule = this.validationRules.get(ruleKey);
            
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
            getErrorHandler().handleError(error, 'CONFIGURATION_ERROR', {
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
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {Function} callback - コールバック関数
     * @returns {string} 監視ID（解除用）
     */
    watch(category, key, callback) {
        try {
            const watchKey = `${category}.${key}`;
            const watchId = `${watchKey}_${Date.now()}_${Math.random()}`;
            
            if (!this.watchers.has(watchKey)) {
                this.watchers.set(watchKey, new Map());
            }
            
            this.watchers.get(watchKey).set(watchId, callback);
            
            this._logDebug(`監視を開始: ${watchKey} (ID: ${watchId})`);
            return watchId;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager.watch',
                category,
                key
            });
            return null;
        }
    }
    
    /**
     * 監視を解除
     * @param {string} watchId - 監視ID
     * @returns {boolean} 解除成功フラグ
     */
    unwatch(watchId) {
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
            getErrorHandler().handleError(error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager.unwatch',
                watchId
            });
            return false;
        }
    }
    
    /**
     * 設定をリセット
     * @param {string} category - リセットするカテゴリ（nullの場合は全て）
     * @returns {boolean} リセット成功フラグ
     */
    reset(category = null) {
        try {
            if (category) {
                // 特定カテゴリのリセット
                if (this.configurations.has(category)) {
                    this.configurations.get(category).clear();
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
            getErrorHandler().handleError(error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager.reset',
                category
            });
            return false;
        }
    }
    
    /**
     * 検証ルールを設定
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {Object} rule - 検証ルール
     */
    setValidationRule(category, key, rule) {
        const ruleKey = `${category}.${key}`;
        this.validationRules.set(ruleKey, rule);
        this._logDebug(`検証ルールを設定: ${ruleKey}`);
    }
    
    /**
     * デフォルト値を設定
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {*} value - デフォルト値
     */
    setDefaultValue(category, key, value) {
        const defaultKey = `${category}.${key}`;
        this.defaultValues.set(defaultKey, value);
        this._logDebug(`デフォルト値を設定: ${defaultKey} = ${value}`);
    }
    
    /**
     * 設定の存在確認
     * @param {string} category - 設定カテゴリまたはドット記法のキー
     * @param {string} key - 設定キー（オプション）
     * @returns {boolean} 存在フラグ
     */
    has(category, key) {
        // ドット記法のサポート（keyが未定義の場合）
        if (key === undefined && typeof category === 'string' && category.includes('.')) {
            const parts = category.split('.');
            const actualCategory = parts.slice(0, -1).join('.');
            const actualKey = parts[parts.length - 1];
            return this.configurations.has(actualCategory) && 
                   this.configurations.get(actualCategory).has(actualKey);
        }
        
        // 従来の形式
        return this.configurations.has(category) && 
               this.configurations.get(category).has(key);
    }
    
    /**
     * カテゴリ内の全設定を取得
     * @param {string} category - 設定カテゴリ
     * @returns {Object} 設定オブジェクト
     */
    getCategory(category) {
        if (!this.configurations.has(category)) {
            return {};
        }
        
        const categoryConfig = this.configurations.get(category);
        const result = {};
        
        for (const [key, value] of categoryConfig) {
            result[key] = value;
        }
        
        return result;
    }
    
    /**
     * 変更履歴を取得
     * @returns {Array} 変更履歴
     */
    getChangeHistory() {
        return [...this.changeHistory];
    }
    
    /**
     * 監視者に通知
     * @private
     */
    _notifyWatchers(category, key, newValue, oldValue) {
        const watchKey = `${category}.${key}`;
        
        if (this.watchers.has(watchKey)) {
            const callbacks = this.watchers.get(watchKey);
            
            for (const callback of callbacks.values()) {
                try {
                    callback(newValue, oldValue, category, key);
                } catch (error) {
                    getErrorHandler().handleError(error, 'CONFIGURATION_ERROR', {
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
    _recordChange(category, key, oldValue, newValue) {
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
    _isDebugMode() {
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
    _logDebug(message) {
        if (this._isDebugMode()) {
            console.log(`[ConfigurationManager] ${message}`);
        }
    }
    
    /**
     * 警告ログ出力
     * @private
     */
    _logWarning(message) {
        console.warn(`[ConfigurationManager] ${message}`);
    }
    
    /**
     * アクセス統計を更新
     * @param {string} fullKey - 完全なキー名
     * @private
     */
    _updateAccessStats(fullKey) {
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
     * @param {string} fullKey - 完全なキー名
     * @returns {boolean} キャッシュすべきかどうか
     * @private
     */
    _shouldCache(fullKey) {
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
     * @param {string} fullKey - 完全なキー名
     * @param {*} value - キャッシュする値
     * @private
     */
    _cacheValue(fullKey, value) {
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
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {Function} loader - 読み込み関数
     */
    registerLazyLoader(category, key, loader) {
        const fullKey = `${category}.${key}`;
        this.lazyLoaders.set(fullKey, loader);
        this._logDebug(`遅延読み込み関数を登録: ${fullKey}`);
    }
    
    /**
     * プリロードキーを追加
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     */
    addPreloadKey(category, key) {
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
    _optimizeCache() {
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
            getErrorHandler().handleError(error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager._optimizeCache'
            });
        }
    }
    
    /**
     * パフォーマンス統計を取得
     * @returns {Object} パフォーマンス統計
     */
    getPerformanceStats() {
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
    warmupCache() {
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
            getErrorHandler().handleError(error, 'CONFIGURATION_ERROR', {
                context: 'ConfigurationManager.warmupCache'
            });
        }
    }
    
    /**
     * キャッシュをクリア
     * @param {string} prefix - クリアするキーのプレフィックス
     */
    clearCache(prefix = null) {
        const clearedCount = this.cache.clear(prefix);
        this._logDebug(`キャッシュクリア: ${clearedCount}エントリを削除`);
        return clearedCount;
    }
    
    /**
     * 検証ルールを追加
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {Object} rule - 検証ルール
     */
    addValidationRule(category, key, rule) {
        try {
            const ruleKey = `${category}.${key}`;
            this.validationRules.set(ruleKey, rule);
            this._logDebug(`検証ルール追加: ${ruleKey}`);
        } catch (error) {
            getErrorHandler().handleError(error, 'CONFIGURATION_ERROR', {
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
    _setupValidationRules() {
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
        
        this._logDebug('検証ルール設定完了');
    }
    
}

// シングルトンインスタンス
let instance = null;

/**
 * ConfigurationManagerのシングルトンインスタンスを取得
 * @returns {ConfigurationManager} インスタンス
 */
function getConfigurationManager() {
    if (!instance) {
        instance = new ConfigurationManager();
    }
    return instance;
}

export {
    ConfigurationManager,
    getConfigurationManager
};
