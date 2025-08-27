/**
 * LeaderboardStorageManager
 * リーダーボードのデータ永続化、キャッシュ管理、バックアップ・復旧を担当
 */
export class LeaderboardStorageManager {
    constructor(leaderboardManager) {
        this.leaderboardManager = leaderboardManager;
        this.cache = new Map();
        this.lastCacheCleanup = Date.now();
    }

    /**
     * データのロード
     * @returns {Promise<boolean>} ロード成功可否
     */
    async load() {
        try {
            const savedData = localStorage.getItem(this.leaderboardManager.storageKey);
            
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // データマイグレーション
                const migratedData = this.migrateData(data);
                
                // 整合性チェック
                const integrityResult = this.leaderboardManager.dataProcessor.performIntegrityCheck(migratedData);
                
                if (!integrityResult.isValid) {
                    console.warn('Leaderboard data integrity issues found:', integrityResult.errors);
                    
                    // バックアップからの復旧を試行
                    const restored = await this.attemptBackupRestore();
                    if (restored) {
                        return true;
                    }
                    
                    // 復旧失敗時は空データで初期化
                    this.initializeEmptyData();
                    return false;
                }
                
                this.leaderboardManager.data = migratedData;
                console.log('Leaderboard data loaded successfully');
                return true;
            } else {
                this.initializeEmptyData();
                console.log('No saved leaderboard data found, initialized empty data');
                return true;
            }
        } catch (error) {
            console.error('Error loading leaderboard data:', error);
            
            // エラー時はバックアップからの復旧を試行
            const restored = await this.attemptBackupRestore();
            if (!restored) {
                this.initializeEmptyData();
            }
            
            return false;
        }
    }

    /**
     * データの保存
     * @returns {Promise<boolean>} 保存成功可否
     */
    async save() {
        try {
            // バックアップの作成
            await this.createBackup();
            
            const dataToSave = JSON.stringify(this.leaderboardManager.data);
            localStorage.setItem(this.leaderboardManager.storageKey, dataToSave);
            
            console.log('Leaderboard data saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving leaderboard data:', error);
            return false;
        }
    }

    /**
     * 非同期保存
     * @returns {Promise<boolean>} 保存成功可否
     */
    async saveAsync() {
        return new Promise((resolve) => {
            // ブラウザの次のイベントループで実行
            setTimeout(async () => {
                const result = await this.save();
                resolve(result);
            }, 0);
        });
    }

    /**
     * バックアップの作成
     * @returns {Promise<boolean>} バックアップ成功可否
     */
    async createBackup() {
        try {
            const backupKey = `${this.leaderboardManager.storageKey}_backup`;
            const timestamp = Date.now();
            
            const backupData = {
                data: this.leaderboardManager.data,
                timestamp: timestamp,
                version: this.leaderboardManager.version || '1.0.0'
            };
            
            localStorage.setItem(backupKey, JSON.stringify(backupData));
            console.log('Backup created successfully');
            return true;
        } catch (error) {
            console.error('Error creating backup:', error);
            return false;
        }
    }

    /**
     * バックアップからの復旧
     * @returns {Promise<boolean>} 復旧成功可否
     */
    async attemptBackupRestore() {
        try {
            const backupKey = `${this.leaderboardManager.storageKey}_backup`;
            const backupData = localStorage.getItem(backupKey);
            
            if (!backupData) {
                console.log('No backup data found');
                return false;
            }
            
            const backup = JSON.parse(backupData);
            
            // バックアップデータの検証
            if (!backup.data || !backup.timestamp) {
                console.warn('Invalid backup data structure');
                return false;
            }
            
            // 整合性チェック
            const integrityResult = this.leaderboardManager.dataProcessor.performIntegrityCheck(backup.data);
            
            if (!integrityResult.isValid) {
                console.warn('Backup data also has integrity issues');
                return false;
            }
            
            this.leaderboardManager.data = backup.data;
            console.log('Data restored from backup successfully');
            return true;
        } catch (error) {
            console.error('Error restoring from backup:', error);
            return false;
        }
    }

    /**
     * 空データの初期化
     */
    initializeEmptyData() {
        this.leaderboardManager.data = {
            leaderboards: {},
            periodLeaderboards: {},
            playerHistory: {},
            lastUpdated: Date.now(),
            version: this.leaderboardManager.version || '1.0.0'
        };
        
        // デフォルトリーダーボードの初期化
        this.leaderboardManager.initializeDefaultLeaderboards();
    }

    /**
     * データマイグレーション
     * @param {Object} data 既存データ
     * @returns {Object} マイグレーション済みデータ
     */
    migrateData(data) {
        // バージョン情報がない場合は古いバージョンとして扱う
        if (!data.version) {
            data.version = '1.0.0';
        }

        // 必要な構造が存在しない場合は追加
        if (!data.leaderboards) {
            data.leaderboards = {};
        }

        if (!data.periodLeaderboards) {
            data.periodLeaderboards = {};
        }

        if (!data.playerHistory) {
            data.playerHistory = {};
        }

        data.lastUpdated = data.lastUpdated || Date.now();

        return data;
    }

    /**
     * 期限切れ期間エントリのクリーンアップ
     */
    cleanupExpiredPeriodEntries() {
        const data = this.leaderboardManager.data;
        
        if (!data.periodLeaderboards) {
            return;
        }

        const now = Date.now();
        const retentionPeriods = {
            daily: 30 * 24 * 60 * 60 * 1000,    // 30日
            weekly: 12 * 7 * 24 * 60 * 60 * 1000, // 12週
            monthly: 12 * 30 * 24 * 60 * 60 * 1000 // 12ヶ月
        };

        for (const [period, boards] of Object.entries(data.periodLeaderboards)) {
            const retentionTime = retentionPeriods[period] || retentionPeriods.daily;
            
            for (const [key, board] of Object.entries(boards)) {
                if (board.endDate && (now - board.endDate) > retentionTime) {
                    delete boards[key];
                    console.log(`Cleaned up expired ${period} leaderboard: ${key}`);
                }
            }
        }
    }

    /**
     * キャッシュにリーダーボードを保存
     * @param {string} key キャッシュキー
     * @param {Object} data データ
     */
    cacheLeaderboard(key, data) {
        this.cache.set(key, {
            data: JSON.parse(JSON.stringify(data)), // ディープコピー
            timestamp: Date.now()
        });
    }

    /**
     * キャッシュからリーダーボードを取得
     * @param {string} key キャッシュキー
     * @returns {Object|null} キャッシュされたデータ
     */
    getCachedLeaderboard(key) {
        const cached = this.cache.get(key);
        
        if (!cached) {
            return null;
        }

        const maxAge = this.leaderboardManager.config.cacheMaxAge || 300000; // 5分
        
        if (Date.now() - cached.timestamp > maxAge) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * 関連キャッシュのクリア
     * @param {string} leaderboardKey リーダーボードキー
     */
    clearRelevantCache(leaderboardKey) {
        const keysToDelete = [];
        
        for (const [key] of this.cache.entries()) {
            if (key.includes(leaderboardKey)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => this.cache.delete(key));
    }

    /**
     * 期限切れキャッシュのクリア
     */
    clearExpiredCache() {
        const now = Date.now();
        const maxAge = this.leaderboardManager.config.cacheMaxAge || 300000;
        const keysToDelete = [];

        for (const [key, cached] of this.cache.entries()) {
            if (now - cached.timestamp > maxAge) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
        
        if (keysToDelete.length > 0) {
            console.log(`Cleared ${keysToDelete.length} expired cache entries`);
        }
        
        this.lastCacheCleanup = now;
    }

    /**
     * キャッシュサイズの制限
     */
    limitCacheSize() {
        const maxCacheSize = this.leaderboardManager.config.maxCacheSize || 100;
        
        if (this.cache.size <= maxCacheSize) {
            return;
        }

        // 古いエントリから削除
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        const toDelete = entries.slice(0, this.cache.size - maxCacheSize);
        toDelete.forEach(([key]) => this.cache.delete(key));
        
        console.log(`Limited cache size: removed ${toDelete.length} oldest entries`);
    }

    /**
     * メモリ使用量の取得
     * @returns {Object} メモリ使用量情報
     */
    getMemoryUsage() {
        const dataSize = JSON.stringify(this.leaderboardManager.data).length;
        const cacheSize = JSON.stringify(Array.from(this.cache.entries())).length;
        
        return {
            totalSize: dataSize + cacheSize,
            dataSize: dataSize,
            cacheSize: cacheSize,
            cacheEntries: this.cache.size,
            lastCacheCleanup: this.lastCacheCleanup
        };
    }

    /**
     * 高度なキャッシュ設定
     */
    setupAdvancedCaching() {
        // 定期的なキャッシュクリーンアップ
        setInterval(() => {
            this.clearExpiredCache();
            this.limitCacheSize();
        }, 60000); // 1分ごと
    }

    /**
     * 一般的なクエリの事前ロード
     */
    async preloadCommonQueries() {
        try {
            // よく使用されるリーダーボードの事前キャッシュ
            const commonKeys = ['global', 'daily', 'weekly', 'monthly'];
            
            for (const key of commonKeys) {
                if (this.leaderboardManager.data.leaderboards[key]) {
                    const data = this.leaderboardManager.getLeaderboard(key, 10);
                    this.cacheLeaderboard(`leaderboard_${key}_10`, data);
                }
            }
            
            console.log('Common queries preloaded');
        } catch (error) {
            console.error('Error preloading common queries:', error);
        }
    }

    /**
     * キャッシュの最適化
     */
    optimizeCache() {
        // 期限切れエントリのクリア
        this.clearExpiredCache();
        
        // サイズ制限の適用
        this.limitCacheSize();
        
        // 使用頻度の低いエントリの削除
        const now = Date.now();
        const unusedThreshold = 600000; // 10分
        
        const keysToDelete = [];
        for (const [key, cached] of this.cache.entries()) {
            if (now - cached.timestamp > unusedThreshold) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => this.cache.delete(key));
        
        console.log(`Cache optimized: removed ${keysToDelete.length} unused entries`);
    }
}