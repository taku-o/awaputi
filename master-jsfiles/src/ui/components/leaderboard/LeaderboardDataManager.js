/**
 * LeaderboardDataManager.js
 * リーダーボードデータ管理システム
 * LeaderboardUIから分離されたデータ管理・キャッシュ機能
 */

import { getErrorHandler } from '../../../utils/ErrorHandler.js';

export class LeaderboardDataManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.leaderboardManager = gameEngine.leaderboardManager;
        this.errorHandler = getErrorHandler();
        
        // データキャッシュ
        this.dataCache = new Map();
        this.lastUpdateTime = new Map();
        this.refreshInterval = 30000; // 30秒
        this.maxCacheSize = 50;
        
        // データ設定
        this.dataConfig = {
            itemsPerPage: 10,
            maxItemsPerRequest: 50, // ページネーション用
            sortOptions: ['score', 'timestamp', 'combo', 'accuracy'],
            viewTypes: ['overall', 'daily', 'weekly', 'monthly', 'stage'],
            cacheTimeout: 300000, // 5分
            retryAttempts: 3,
            retryDelay: 1000
        };
        
        // フィルター設定
        this.filterConfig = {
            minScore: 0,
            maxResults: 1000,
            includeExpired: false,
            includePlayerData: true,
            includeChallenges: true
        };
        
        // 統計データ
        this.statistics = {
            totalRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            averageResponseTime: 0
        };
        
        // データ監視
        this.dataWatchers = new Set();
        this.autoRefreshEnabled = true;
        this.autoRefreshInterval = null;
        
        this.initialize();
    }
    
    /**
     * データマネージャーを初期化
     */
    async initialize() {
        try {
            // 自動更新を開始
            this.startAutoRefresh();
            
            console.log('[LeaderboardDataManager] Data manager initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardDataManager.initialize');
        }
    }
    
    /**
     * データを取得（キャッシュ考慮）
     * @param {string} viewType - ビューの種類
     * @param {Object} options - オプション
     * @returns {Promise<Object>} データ
     */
    async getData(viewType, options = {}) {
        try {
            const startTime = Date.now();
            this.statistics.totalRequests++;
            
            const cacheKey = this.generateCacheKey(viewType, options);
            
            // キャッシュチェック
            const cachedData = this.getCachedData(cacheKey);
            if (cachedData) {
                this.statistics.cacheHits++;
                this.updateStatistics(startTime);
                return cachedData;
            }
            
            this.statistics.cacheMisses++;
            
            // データを取得
            const data = await this.fetchData(viewType, options);
            
            // キャッシュに保存
            if (data && !data.error) {
                this.setCachedData(cacheKey, data);
            }
            
            this.updateStatistics(startTime);
            return data;
            
        } catch (error) {
            this.statistics.errors++;
            this.errorHandler.handleError(error, 'LeaderboardDataManager.getData');
            return { error: 'データの取得に失敗しました' };
        }
    }
    
    /**
     * データを強制更新
     * @param {string} viewType - ビューの種類
     * @param {Object} options - オプション
     * @returns {Promise<Object>} データ
     */
    async refreshData(viewType, options = {}) {
        try {
            const cacheKey = this.generateCacheKey(viewType, options);
            
            // キャッシュを削除
            this.dataCache.delete(cacheKey);
            this.lastUpdateTime.delete(cacheKey);
            
            // データを再取得
            return await this.getData(viewType, options);
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardDataManager.refreshData');
            return { error: 'データの更新に失敗しました' };
        }
    }
    
    /**
     * 実際のデータ取得
     * @param {string} viewType - ビューの種類
     * @param {Object} options - オプション
     * @returns {Promise<Object>} データ
     */
    async fetchData(viewType, options = {}) {
        const mergedOptions = {
            limit: this.dataConfig.itemsPerPage * 5,
            offset: 0,
            sortBy: 'score',
            includeExpired: this.filterConfig.includeExpired,
            includePlayerData: this.filterConfig.includePlayerData,
            ...options
        };
        
        let data;
        
        try {
            switch (viewType) {
                case 'overall':
                case 'daily':
                case 'weekly':
                case 'monthly':
                    data = await this.fetchPeriodRanking(viewType, mergedOptions);
                    break;
                    
                case 'stage':
                    if (mergedOptions.stageId) {
                        data = await this.fetchStageRanking(mergedOptions.stageId, mergedOptions);
                    } else {
                        data = { error: 'ステージIDが指定されていません' };
                    }
                    break;
                    
                case 'player':
                    if (mergedOptions.playerId) {
                        data = await this.fetchPlayerRanking(mergedOptions.playerId, mergedOptions);
                    } else {
                        data = { error: 'プレイヤーIDが指定されていません' };
                    }
                    break;
                    
                case 'challenge':
                    data = await this.fetchChallengeRanking(mergedOptions);
                    break;
                    
                default:
                    data = await this.fetchDefaultRanking(mergedOptions);
            }
            
            // データ後処理
            if (data && !data.error) {
                data = this.processData(data, mergedOptions);
            }
            
            return data;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardDataManager.fetchData');
            return { error: 'データの取得でエラーが発生しました' };
        }
    }
    
    /**
     * 期間別ランキングを取得
     * @param {string} period - 期間
     * @param {Object} options - オプション
     * @returns {Promise<Object>} データ
     */
    async fetchPeriodRanking(period, options) {
        try {
            const data = this.leaderboardManager.getPeriodRanking(period, options);
            
            // データ検証
            if (!data || !Array.isArray(data.rankings)) {
                return { error: '無効なデータ形式' };
            }
            
            return {
                rankings: data.rankings,
                metadata: {
                    period: period,
                    total: data.total || data.rankings.length,
                    page: Math.floor(options.offset / options.limit),
                    hasMore: data.rankings.length >= options.limit,
                    lastUpdate: Date.now()
                }
            };
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardDataManager.fetchPeriodRanking');
            throw error;
        }
    }
    
    /**
     * ステージ別ランキングを取得
     * @param {string} stageId - ステージID
     * @param {Object} options - オプション
     * @returns {Promise<Object>} データ
     */
    async fetchStageRanking(stageId, options) {
        try {
            const data = this.leaderboardManager.getStageRanking(stageId, options);
            
            if (!data || !Array.isArray(data.rankings)) {
                return { error: 'ステージデータが見つかりません' };
            }
            
            return {
                rankings: data.rankings,
                metadata: {
                    stageId: stageId,
                    stageName: data.stageName || `ステージ ${stageId}`,
                    total: data.total || data.rankings.length,
                    page: Math.floor(options.offset / options.limit),
                    hasMore: data.rankings.length >= options.limit,
                    lastUpdate: Date.now()
                }
            };
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardDataManager.fetchStageRanking');
            throw error;
        }
    }
    
    /**
     * プレイヤー別ランキングを取得
     * @param {string} playerId - プレイヤーID
     * @param {Object} options - オプション
     * @returns {Promise<Object>} データ
     */
    async fetchPlayerRanking(playerId, options) {
        try {
            const data = this.leaderboardManager.getPlayerHistory(playerId, options);
            
            if (!data || !Array.isArray(data.history)) {
                return { error: 'プレイヤーデータが見つかりません' };
            }
            
            return {
                rankings: data.history,
                metadata: {
                    playerId: playerId,
                    playerName: data.playerName || 'Unknown Player',
                    currentRank: data.currentRank || null,
                    bestScore: data.bestScore || 0,
                    total: data.total || data.history.length,
                    lastUpdate: Date.now()
                }
            };
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardDataManager.fetchPlayerRanking');
            throw error;
        }
    }
    
    /**
     * チャレンジランキングを取得
     * @param {Object} options - オプション
     * @returns {Promise<Object>} データ
     */
    async fetchChallengeRanking(options) {
        try {
            const data = this.leaderboardManager.getChallengeRanking(options);
            
            if (!data || !Array.isArray(data.challenges)) {
                return { error: 'チャレンジデータが見つかりません' };
            }
            
            return {
                rankings: data.challenges,
                metadata: {
                    type: 'challenge',
                    activeChallenges: data.activeChallenges || 0,
                    completedChallenges: data.completedChallenges || 0,
                    total: data.total || data.challenges.length,
                    lastUpdate: Date.now()
                }
            };
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardDataManager.fetchChallengeRanking');
            throw error;
        }
    }
    
    /**
     * デフォルトランキングを取得
     * @param {Object} options - オプション
     * @returns {Promise<Object>} データ
     */
    async fetchDefaultRanking(options) {
        try {
            const data = this.leaderboardManager.getLeaderboard('overall', options);
            
            if (!data || !Array.isArray(data.rankings)) {
                return { error: 'デフォルトデータの取得に失敗しました' };
            }
            
            return {
                rankings: data.rankings,
                metadata: {
                    type: 'default',
                    total: data.total || data.rankings.length,
                    page: Math.floor(options.offset / options.limit),
                    hasMore: data.rankings.length >= options.limit,
                    lastUpdate: Date.now()
                }
            };
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardDataManager.fetchDefaultRanking');
            throw error;
        }
    }
    
    /**
     * データを後処理
     * @param {Object} data - データ
     * @param {Object} options - オプション
     * @returns {Object} 処理されたデータ
     */
    processData(data, options) {
        try {
            // ソート処理
            if (data.rankings && options.sortBy) {
                data.rankings = this.sortData(data.rankings, options.sortBy, options.sortOrder);
            }
            
            // フィルター処理
            if (data.rankings && options.filter) {
                data.rankings = this.filterData(data.rankings, options.filter);
            }
            
            // ページネーション処理
            if (data.rankings && options.limit) {
                const startIndex = options.offset || 0;
                const endIndex = startIndex + options.limit;
                data.rankings = data.rankings.slice(startIndex, endIndex);
            }
            
            // 順位付け
            data.rankings = this.addRankings(data.rankings);
            
            return data;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardDataManager.processData');
            return data;
        }
    }
    
    /**
     * データをソート
     * @param {Array} rankings - ランキングデータ
     * @param {string} sortBy - ソート基準
     * @param {string} sortOrder - ソート順序
     * @returns {Array} ソートされたデータ
     */
    sortData(rankings, sortBy, sortOrder = 'desc') {
        return rankings.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            // 数値の場合
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
            }
            
            // 文字列の場合
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'desc' ? 
                    bValue.localeCompare(aValue) : 
                    aValue.localeCompare(bValue);
            }
            
            // 日付の場合
            if (sortBy === 'timestamp') {
                const aTime = new Date(aValue).getTime();
                const bTime = new Date(bValue).getTime();
                return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
            }
            
            return 0;
        });
    }
    
    /**
     * データをフィルター
     * @param {Array} rankings - ランキングデータ
     * @param {Object} filter - フィルター条件
     * @returns {Array} フィルターされたデータ
     */
    filterData(rankings, filter) {
        return rankings.filter(entry => {
            // スコア範囲フィルター
            if (filter.minScore && entry.score < filter.minScore) {
                return false;
            }
            if (filter.maxScore && entry.score > filter.maxScore) {
                return false;
            }
            
            // プレイヤー名フィルター
            if (filter.playerName && !entry.playerName.toLowerCase().includes(filter.playerName.toLowerCase())) {
                return false;
            }
            
            // 日付範囲フィルター
            if (filter.dateFrom && new Date(entry.timestamp) < new Date(filter.dateFrom)) {
                return false;
            }
            if (filter.dateTo && new Date(entry.timestamp) > new Date(filter.dateTo)) {
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * 順位を追加
     * @param {Array} rankings - ランキングデータ
     * @returns {Array} 順位付きデータ
     */
    addRankings(rankings) {
        return rankings.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));
    }
    
    /**
     * キャッシュキーを生成
     * @param {string} viewType - ビューの種類
     * @param {Object} options - オプション
     * @returns {string} キャッシュキー
     */
    generateCacheKey(viewType, options) {
        const keyParts = [
            viewType,
            options.stageId || '',
            options.playerId || '',
            options.sortBy || 'score',
            options.limit || this.dataConfig.itemsPerPage,
            options.offset || 0
        ];
        
        return keyParts.join('|');
    }
    
    /**
     * キャッシュからデータを取得
     * @param {string} cacheKey - キャッシュキー
     * @returns {Object|null} キャッシュされたデータ
     */
    getCachedData(cacheKey) {
        const now = Date.now();
        const lastUpdate = this.lastUpdateTime.get(cacheKey);
        
        if (!lastUpdate || (now - lastUpdate) > this.refreshInterval) {
            return null;
        }
        
        return this.dataCache.get(cacheKey);
    }
    
    /**
     * データをキャッシュに保存
     * @param {string} cacheKey - キャッシュキー
     * @param {Object} data - データ
     */
    setCachedData(cacheKey, data) {
        // キャッシュサイズ制限
        if (this.dataCache.size >= this.maxCacheSize) {
            const oldestKey = this.dataCache.keys().next().value;
            this.dataCache.delete(oldestKey);
            this.lastUpdateTime.delete(oldestKey);
        }
        
        this.dataCache.set(cacheKey, data);
        this.lastUpdateTime.set(cacheKey, Date.now());
    }
    
    /**
     * キャッシュをクリア
     * @param {string} pattern - クリアするパターン（オプション）
     */
    clearCache(pattern = null) {
        if (pattern) {
            // パターンマッチングでクリア
            for (const key of this.dataCache.keys()) {
                if (key.includes(pattern)) {
                    this.dataCache.delete(key);
                    this.lastUpdateTime.delete(key);
                }
            }
        } else {
            // 全クリア
            this.dataCache.clear();
            this.lastUpdateTime.clear();
        }
        
        console.log('[LeaderboardDataManager] Cache cleared:', pattern || 'all');
    }
    
    /**
     * 統計を更新
     * @param {number} startTime - 開始時間
     */
    updateStatistics(startTime) {
        const responseTime = Date.now() - startTime;
        this.statistics.averageResponseTime = 
            (this.statistics.averageResponseTime + responseTime) / 2;
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    getStatistics() {
        return {
            ...this.statistics,
            cacheHitRate: this.statistics.totalRequests > 0 ? 
                (this.statistics.cacheHits / this.statistics.totalRequests) * 100 : 0,
            cacheSize: this.dataCache.size,
            lastUpdate: Math.max(...this.lastUpdateTime.values(), 0)
        };
    }
    
    /**
     * 自動更新を開始
     */
    startAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        if (this.autoRefreshEnabled) {
            this.autoRefreshInterval = setInterval(() => {
                this.performAutoRefresh();
            }, this.refreshInterval);
        }
    }
    
    /**
     * 自動更新を停止
     */
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }
    
    /**
     * 自動更新を実行
     */
    async performAutoRefresh() {
        try {
            // アクティブなキャッシュキーの更新
            const now = Date.now();
            const keysToRefresh = [];
            
            for (const [key, lastUpdate] of this.lastUpdateTime.entries()) {
                if (now - lastUpdate > this.refreshInterval * 0.8) { // 80%で更新
                    keysToRefresh.push(key);
                }
            }
            
            // 最大3つまで同時更新
            const limitedKeys = keysToRefresh.slice(0, 3);
            
            for (const key of limitedKeys) {
                const [viewType, ...optionParts] = key.split('|');
                const options = this.parseOptionsFromKey(optionParts);
                
                // バックグラウンドで更新
                this.refreshData(viewType, options).catch(error => {
                    console.warn('[LeaderboardDataManager] Auto refresh failed:', error);
                });
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardDataManager.performAutoRefresh');
        }
    }
    
    /**
     * キーからオプションを復元
     * @param {Array} optionParts - オプション部分
     * @returns {Object} オプション
     */
    parseOptionsFromKey(optionParts) {
        return {
            stageId: optionParts[0] || undefined,
            playerId: optionParts[1] || undefined,
            sortBy: optionParts[2] || 'score',
            limit: parseInt(optionParts[3]) || this.dataConfig.itemsPerPage,
            offset: parseInt(optionParts[4]) || 0
        };
    }
    
    /**
     * データ監視を追加
     * @param {Function} callback - コールバック関数
     */
    addDataWatcher(callback) {
        this.dataWatchers.add(callback);
    }
    
    /**
     * データ監視を削除
     * @param {Function} callback - コールバック関数
     */
    removeDataWatcher(callback) {
        this.dataWatchers.delete(callback);
    }
    
    /**
     * データ変更を通知
     * @param {string} viewType - ビューの種類
     * @param {Object} data - データ
     */
    notifyDataChange(viewType, data) {
        this.dataWatchers.forEach(callback => {
            try {
                callback(viewType, data);
            } catch (error) {
                console.warn('[LeaderboardDataManager] Data watcher error:', error);
            }
        });
    }
    
    /**
     * 設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        if (newConfig.dataConfig) {
            Object.assign(this.dataConfig, newConfig.dataConfig);
        }
        if (newConfig.filterConfig) {
            Object.assign(this.filterConfig, newConfig.filterConfig);
        }
        if (newConfig.refreshInterval) {
            this.refreshInterval = newConfig.refreshInterval;
            this.startAutoRefresh(); // 再開
        }
        
        console.log('[LeaderboardDataManager] Configuration updated');
    }
    
    /**
     * データマネージャーを破棄
     */
    dispose() {
        this.stopAutoRefresh();
        this.clearCache();
        this.dataWatchers.clear();
        
        console.log('[LeaderboardDataManager] Data manager disposed');
    }
}