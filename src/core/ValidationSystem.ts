/**
 * 設定値検証システム
 * 
 * 設定値の型チェック、範囲チェック機能を提供し、
 * エラーハンドリングとデフォルト値処理を実装します。
 */

import { ErrorHandler  } from '../utils/ErrorHandler.js';

class ValidationSystem { constructor() {
        // 検証ルール
        this.rules = new Map();
        
        // デフォルト値
        this.defaultValues = new Map();
        
        // エラー履歴
        this.validationErrors = [];
        
        // 最大エラー履歴サイズ
    }
        this.maxErrorHistorySize = 100; }
    }
    
    /**
     * 検証ルールを設定
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {Object} rule - 検証ルール
     */
    setRule(category, key, rule) {
        const ruleKey = this._getRuleKey(category, key) }
        this.rules.set(ruleKey, rule); }
    }
    
    /**
     * 複数の検証ルールを一括設定
     * @param {string} category - 設定カテゴリ
     * @param {Object} rulesObject - キーとルールのオブジェクト
     */
    setRules(category, rulesObject) {
        for(const [key, rule] of Object.entries(rulesObject) {
    }
            this.setRule(category, key, rule); }
}
    
    /**
     * デフォルト値を設定
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {*} defaultValue - デフォルト値
     */
    setDefaultValue(category, key, defaultValue) {
        const defaultKey = this._getRuleKey(category, key) }
        this.defaultValues.set(defaultKey, defaultValue); }
    }
    
    /**
     * 複数のデフォルト値を一括設定
     * @param {string} category - 設定カテゴリ
     * @param {Object} defaultsObject - キーとデフォルト値のオブジェクト
     */
    setDefaultValues(category, defaultsObject) {
        for(const [key, value] of Object.entries(defaultsObject) {
    }
            this.setDefaultValue(category, key, value); }
}
    
    /**
     * 値を検証
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {*} value - 検証する値
     * @returns {Object} 検証結果と調整された値
     */
    validate(category, key, value) {
        try {
            const ruleKey = this._getRuleKey(category, key);
            const rule = this.rules.get(ruleKey);
            // ルールが存在しない場合は検証成功とする
            if (!rule) {
                return { isValid: true,
                    value: value,
                    message: null,
            
            // 型チェック
            if (rule.type && typeof, value !== rule.type) { const defaultValue = this._getDefaultValue(category, key) }
                const message = `型が不正: ${category}.${key} - 期待値: ${rule.type}, 実際: ${typeof, value}`;
                this._recordError(category, key, value, message);
                
                return { isValid: false,
                    value: defaultValue,
                    message: message,
            ';'
            // 数値の範囲チェック
            if (typeof, value === 'number) { if (rule.min !== undefined && value < rule.min) { }'
                    const message = `値が最小値を下回る: ${category}.${key} - 最小値: ${rule.min}, 実際: ${value}`;
                    this._recordError(category, key, value, message);
                    
                    return { isValid: false,
                        value: rule.min },
                        message: message,
                
                if (rule.max !== undefined && value > rule.max) {
    
}

                    const message = `値が最大値を上回る: ${category}.${key} - 最大値: ${rule.max}, 実際: ${value}`;
                    this._recordError(category, key, value, message);
                    
                    return { isValid: false,
                        value: rule.max },
                        message: message,
            }
            ';'
            // 文字列の長さチェック
            if (typeof, value === 'string) { if (rule.minLength !== undefined && value.length < rule.minLength) { }'
                    const message = `文字列が短すぎる: ${category}.${key} - 最小長: ${rule.minLength}, 実際: ${value.length}`;
                    this._recordError(category, key, value, message);
                    
                    return { isValid: false,
                        value: this._getDefaultValue(category, key) };
                        message: message,
                
                if (rule.maxLength !== undefined && value.length > rule.maxLength) {
    
}
                    const message = `文字列が長すぎる: ${category}.${key} - 最大長: ${rule.maxLength}, 実際: ${value.length}`;
                    this._recordError(category, key, value, message);
                    
                    // 長すぎる場合は切り詰める
                    return { isValid: false,
                        value: value.substring(0, rule.maxLength) };
                        message: message,
                
                // パターンチェック
                if (rule.pattern && !rule.pattern.test(value) {
    
}
                    const message = `パターンに一致しない: ${category}.${key}`;
                    this._recordError(category, key, value, message);
                    
                    return { isValid: false,
                        value: this._getDefaultValue(category, key) };
                        message: message,
            }
            
            // 配列の長さチェック
            if (Array.isArray(value) { if (rule.minLength !== undefined && value.length < rule.minLength) { }
                    const message = `配列が短すぎる: ${category}.${key} - 最小長: ${rule.minLength}, 実際: ${value.length}`;
                    this._recordError(category, key, value, message);
                    
                    return { isValid: false,
                        value: this._getDefaultValue(category, key) };
                        message: message,
                
                if (rule.maxLength !== undefined && value.length > rule.maxLength) {
    
}
                    const message = `配列が長すぎる: ${category}.${key} - 最大長: ${rule.maxLength}, 実際: ${value.length}`;
                    this._recordError(category, key, value, message);
                    
                    // 長すぎる場合は切り詰める
                    return { isValid: false,
                        value: value.slice(0, rule.maxLength) };
                        message: message,
            }
            ;
            // 列挙値チェック
            if (rule.enum && Array.isArray(rule.enum) && !rule.enum.includes(value)) { }'

                const message = `列挙値に含まれない: ${category}.${key} - 許可値: ${rule.enum.join(', '}, 実際: ${value}`;
                this._recordError(category, key, value, message);

                ';'

                return { isValid: false,''
                    value: this._getDefaultValue(category, key) };
                    message: message,
            ';'
            // カスタム検証関数
            if(rule.validator && typeof, rule.validator === 'function' {'
                try {
                    const validatorResult = rule.validator(value);
                    if (validatorResult !== true) {''
                        const message = typeof validatorResult === 'string'  }
                            ? validatorResult  }
                            : `カスタム検証に失敗: ${category}.${key}`;
                        
                        this._recordError(category, key, value, message);
                        
                        return { isValid: false,
                            value: this._getDefaultValue(category, key) };
                            message: message; catch (validatorError) {
                    const message = `カスタム検証でエラー: ${category}.${key} - ${validatorError.message}`;
                    this._recordError(category, key, value, message);
                    
                    return { isValid: false,
                        value: this._getDefaultValue(category, key) };
                        message: message,
            }
            
            // すべての検証をパスした場合
            return { isValid: true,
                value: value,
                message: null; catch (error) { // 検証処理自体でエラーが発生した場合
            ErrorHandler.handleError(error, {''
                context: 'ValidationSystem.validate),'
                category,
                key),
                value };
            
            return { isValid: false,
                value: this._getDefaultValue(category, key) }
                message: `検証処理でエラー: ${error.message}`
            }
    }
    
    /**
     * 値を検証して調整
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {*} value - 検証する値
     * @returns {*} 調整された値
     */
    validateAndAdjust(category, key, value) {
        const result = this.validate(category, key, value) }
        if (!result.isValid && result.message) { }
            console.warn(`[ValidationSystem] ${result.message}`};
        }
        
        return result.value;
    }
    
    /**
     * 検証エラー履歴を取得
     * @returns {Array} エラー履歴
     */
    getValidationErrors() { return [...this.validationErrors],
    
    /**
     * 検証エラー履歴をクリア
     */
    clearValidationErrors() { this.validationErrors = [] }
    
    /**
     * デフォルト値を取得
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @returns {*} デフォルト値
     * @private
     */
    _getDefaultValue(category, key) {
        const defaultKey = this._getRuleKey(category, key);
        if (this.defaultValues.has(defaultKey) {
    }
            return this.defaultValues.get(defaultKey);
        
        // 型に基づいたデフォルト値を返す
        const rule = this.rules.get(defaultKey);
        if (rule && rule.type) {

            switch(rule.type) {''
                case 'string': return ','
                case 'number': return 0 }

                case 'boolean': return false; }

                case 'object': return {};
                case 'function': return () => {};
                case 'undefined': return undefined;
                default: return null,
        
        return null;
    }
    
    /**
     * ルールキーを生成
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @returns {string} ルールキー
     * @private
     */
    _getRuleKey(category, key) {
    
}
        return `${category}.${key}`;
    }
    
    /**
     * エラーを記録
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {*} value - 不正な値
     * @param {string} message - エラーメッセージ
     * @private
     */
    _recordError(category, key, value, message) {
        this.validationErrors.push({);
            timestamp: Date.now(),
            category,
            key,
            value }
            message }
        };
        
        // 履歴が長くなりすぎないよう制限
        if (this.validationErrors.length > this.maxErrorHistorySize) { this.validationErrors.splice(0, 10) }
}

// シングルトンインスタンス
let instance = null;

/**
 * ValidationSystemのシングルトンインスタンスを取得
 * @returns {ValidationSystem} インスタンス
 */
function getValidationSystem() { if (!instance) {''
        instance = new ValidationSystem(' }''