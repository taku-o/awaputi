/**
 * FaviconCacheManager - Faviconキャッシュ管理専用クラス
 * localStorageを使用したキャッシュ機能を提供
 * 
 * @author Claude Code
 * @version 1.0.0
 */

export default class FaviconCacheManager {
    /**
     * キャッシュキーのプレフィックス
     */
    static CACHE_PREFIX = 'awaputi_favicon_';
    
    /**
     * キャッシュの有効期限（ミリ秒）
     */
    static CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 1週間
    
    /**
     * キャッシュから取得
     * @param {number} size - ファビコンサイズ
     * @param {string} configHash - 設定のハッシュ値
     * @returns {string|null} キャッシュされたData URL、またはnull
     */
    static get(size, configHash) {
        if (!this._isLocalStorageAvailable()) {
            return null;
        }
        
        try {
            const key = this._generateCacheKey(size, configHash);
            const cached = localStorage.getItem(key);
            
            if (!cached) {
                return null;
            }
            
            const data = JSON.parse(cached);
            
            // 期限切れチェック
            if (this._isExpired(data.timestamp)) {
                localStorage.removeItem(key);
                return null;
            }
            
            return data.dataURL;
        } catch (error) {
            console.warn('Error reading favicon from cache:', error);
            return null;
        }
    }
    
    /**
     * キャッシュに保存
     * @param {number} size - ファビコンサイズ
     * @param {string} configHash - 設定のハッシュ値
     * @param {string} dataURL - Data URL
     */
    static set(size, configHash, dataURL) {
        if (!this._isLocalStorageAvailable()) {
            return;
        }
        
        try {
            const key = this._generateCacheKey(size, configHash);
            const data = {
                dataURL,
                timestamp: Date.now(),
                size,
                configHash
            };
            
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn('Error saving favicon to cache:', error);
            // キャッシュ容量が満杯の場合、古いエントリを削除
            this._cleanupOldEntries();
        }
    }
    
    /**
     * 設定のハッシュ値を生成
     * @param {Object} config - 設定オブジェクト
     * @returns {string} ハッシュ値
     */
    static generateConfigHash(config) {
        const configStr = JSON.stringify({
            backgroundColor: config.backgroundColor,
            textColor: config.textColor,
            text: config.text,
            fontFamily: config.fontFamily
        });
        
        return this._simpleHash(configStr);
    }
    
    /**
     * キャッシュをクリア
     * @param {number|null} size - 特定サイズのみクリアする場合はサイズを指定
     */
    static clear(size = null) {
        if (!this._isLocalStorageAvailable()) {
            return;
        }
        
        try {
            if (size === null) {
                // 全ファビコンキャッシュを削除
                const keys = Object.keys(localStorage).filter(key => 
                    key.startsWith(this.CACHE_PREFIX)
                );
                keys.forEach(key => localStorage.removeItem(key));
            } else {
                // 特定サイズのみ削除
                const keys = Object.keys(localStorage).filter(key => 
                    key.startsWith(this.CACHE_PREFIX) && key.includes(`_${size}_`)
                );
                keys.forEach(key => localStorage.removeItem(key));
            }
        } catch (error) {
            console.warn('Error clearing favicon cache:', error);
        }
    }
    
    /**
     * キャッシュ統計情報を取得
     * @returns {Object} キャッシュ統計
     */
    static getStats() {
        if (!this._isLocalStorageAvailable()) {
            return { totalEntries: 0, totalSize: 0, available: false };
        }
        
        try {
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith(this.CACHE_PREFIX)
            );
            
            let totalSize = 0;
            let expiredCount = 0;
            
            keys.forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    totalSize += item.length;
                    try {
                        const data = JSON.parse(item);
                        if (this._isExpired(data.timestamp)) {
                            expiredCount++;
                        }
                    } catch (e) {
                        expiredCount++;
                    }
                }
            });
            
            return {
                totalEntries: keys.length,
                totalSize,
                expiredCount,
                available: true
            };
        } catch (error) {
            return { totalEntries: 0, totalSize: 0, available: false, error: error.message };
        }
    }
    
    /**
     * キャッシュキー生成
     * @private
     * @param {number} size - サイズ
     * @param {string} configHash - 設定ハッシュ
     * @returns {string} キャッシュキー
     */
    static _generateCacheKey(size, configHash) {
        return `${this.CACHE_PREFIX}${size}_${configHash}`;
    }
    
    /**
     * 期限切れかチェック
     * @private
     * @param {number} timestamp - タイムスタンプ
     * @returns {boolean} 期限切れかどうか
     */
    static _isExpired(timestamp) {
        return Date.now() - timestamp > this.CACHE_EXPIRY;
    }
    
    /**
     * localStorageが利用可能かチェック
     * @private
     * @returns {boolean} 利用可能かどうか
     */
    static _isLocalStorageAvailable() {
        try {
            return typeof localStorage !== 'undefined' && localStorage !== null;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * 古いキャッシュエントリを削除
     * @private
     */
    static _cleanupOldEntries() {
        if (!this._isLocalStorageAvailable()) {
            return;
        }
        
        try {
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith(this.CACHE_PREFIX)
            );
            
            // 期限切れのエントリを削除
            keys.forEach(key => {
                try {
                    const item = localStorage.getItem(key);
                    if (item) {
                        const data = JSON.parse(item);
                        if (this._isExpired(data.timestamp)) {
                            localStorage.removeItem(key);
                        }
                    }
                } catch (e) {
                    // 壊れたエントリも削除
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.warn('Error cleaning up favicon cache:', error);
        }
    }
    
    /**
     * 簡易ハッシュ関数
     * @private
     * @param {string} str - ハッシュ化する文字列
     * @returns {string} ハッシュ値
     */
    static _simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit整数に変換
        }
        
        return Math.abs(hash).toString(36);
    }
}