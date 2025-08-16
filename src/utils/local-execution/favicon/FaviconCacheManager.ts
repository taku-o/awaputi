/**
 * FaviconCacheManager - Faviconキャッシュ管理専用クラス
 * localStorageを使用したキャッシュ機能を提供
 * 
 * @author Claude Code
 * @version 1.0.0
 */

// Type definitions
interface CacheData {
    dataURL: string;
    timestamp: number;
    size: number;
    configHash: string;
}

interface CacheStats {
    totalEntries: number;
    totalSize: number;
    expiredCount?: number;
    available: boolean;
    error?: string;
}

interface FaviconConfig {
    backgroundColor?: string;
    textColor?: string;
    text?: string;
    fontFamily?: string;
}

interface HashableConfig {
    backgroundColor?: string;
    textColor?: string;
    text?: string;
    fontFamily?: string;
}

export default class FaviconCacheManager {
    /**
     * キャッシュキーのプレフィックス
     */
    static readonly CACHE_PREFIX: string = 'awaputi_favicon_';
    
    /**
     * キャッシュの有効期限（ミリ秒）
     */
    static readonly CACHE_EXPIRY: number = 7 * 24 * 60 * 60 * 1000; // 1週間
    
    /**
     * キャッシュから取得
     * @param size - ファビコンサイズ
     * @param configHash - 設定のハッシュ値
     * @returns キャッシュされたData URL、またはnull
     */
    static get(size: number, configHash: string): string | null {
        if (!this._isLocalStorageAvailable()) {
            return null;
        }
        
        try {
            const key = this._generateCacheKey(size, configHash);
            const cached = localStorage.getItem(key);
            
            if (!cached) {
                return null;
            }
            
            const data: CacheData = JSON.parse(cached);
            
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
     * @param size - ファビコンサイズ
     * @param configHash - 設定のハッシュ値
     * @param dataURL - Data URL
     */
    static set(size: number, configHash: string, dataURL: string): void {
        if (!this._isLocalStorageAvailable()) {
            return;
        }
        
        try {
            const key = this._generateCacheKey(size, configHash);
            const data: CacheData = {
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
     * @param config - 設定オブジェクト
     * @returns ハッシュ値
     */
    static generateConfigHash(config: FaviconConfig): string {
        const hashableConfig: HashableConfig = {
            backgroundColor: config.backgroundColor,
            textColor: config.textColor,
            text: config.text,
            fontFamily: config.fontFamily
        };
        
        const configStr = JSON.stringify(hashableConfig);
        return this._simpleHash(configStr);
    }
    
    /**
     * キャッシュをクリア
     * @param size - 特定サイズのみクリアする場合はサイズを指定
     */
    static clear(size: number | null = null): void {
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
     * @returns キャッシュ統計
     */
    static getStats(): CacheStats {
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
                        const data: CacheData = JSON.parse(item);
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
            return { 
                totalEntries: 0, 
                totalSize: 0, 
                available: false, 
                error: (error as Error).message 
            };
        }
    }
    
    /**
     * キャッシュキー生成
     * @private
     * @param size - サイズ
     * @param configHash - 設定ハッシュ
     * @returns キャッシュキー
     */
    private static _generateCacheKey(size: number, configHash: string): string {
        return `${this.CACHE_PREFIX}${size}_${configHash}`;
    }
    
    /**
     * 期限切れかチェック
     * @private
     * @param timestamp - タイムスタンプ
     * @returns 期限切れかどうか
     */
    private static _isExpired(timestamp: number): boolean {
        return Date.now() - timestamp > this.CACHE_EXPIRY;
    }
    
    /**
     * localStorageが利用可能かチェック
     * @private
     * @returns 利用可能かどうか
     */
    private static _isLocalStorageAvailable(): boolean {
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
    private static _cleanupOldEntries(): void {
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
                        const data: CacheData = JSON.parse(item);
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
     * @param str - ハッシュ化する文字列
     * @returns ハッシュ値
     */
    private static _simpleHash(str: string): string {
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