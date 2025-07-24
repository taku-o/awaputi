/**
 * 設定管理システム - 中央設定管理クラス
 * 
 * 全ての設定値への統一されたアクセスポイントを提供し、
 * 設定の取得、設定、検証、監視機能を実装します。
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

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
        
        // デバッグログ
        if (this._isDebugMode()) {
            console.log('[ConfigurationManager] 初期化完了');
        }
    }
    
    /**
     * 設定値を取得
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {*} defaultValue - デフォルト値
     * @returns {*} 設定値
     */
    get(category, key, defaultValue = null) {
        try {
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
            
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'ConfigurationManager.get',
                category,
                key,
                defaultValue
            });
            return defaultValue;
        }
    }
    
    /**
     * 設定値を設定
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {*} value - 設定値
     * @returns {boolean} 設定成功フラグ
     */
    set(category, key, value) {
        try {
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
            
            // 変更履歴を記録
            this._recordChange(category, key, oldValue, value);
            
            // 監視者に通知
            this._notifyWatchers(category, key, value, oldValue);
            
            this._logDebug(`設定値更新: ${category}.${key} = ${value}`);
            return true;
            
        } catch (error) {
            ErrorHandler.handleError(error, {
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
            
            // カスタム検証関数
            if (rule.validator && typeof rule.validator === 'function') {
                if (!rule.validator(value)) {
                    this._logWarning(`カスタム検証に失敗: ${ruleKey}`);
                    return false;
                }
            }
            
            return true;
            
        } catch (error) {
            ErrorHandler.handleError(error, {
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
            ErrorHandler.handleError(error, {
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
            ErrorHandler.handleError(error, {
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
            ErrorHandler.handleError(error, {
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
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @returns {boolean} 存在フラグ
     */
    has(category, key) {
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
                    ErrorHandler.handleError(error, {
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
