/**
 * LeaderboardDataManager.ts
 * リーダーボードデータ管理システム
 * LeaderboardUIから分離されたデータ管理・キャッシュ機能
 */

import { getErrorHandler } from '../../../utils/ErrorHandler.js';
import type { ErrorHandler } from '../../../utils/ErrorHandler.js';

/**
 * Game engine interface
 */
interface GameEngine {
    leaderboardManager: LeaderboardManager;
}

/**
 * Leaderboard manager interface
 */
interface LeaderboardManager {
    getPeriodRanking(period: string, options: any): PeriodRankingData | null;
    getStageRanking(stageId: string, options: any): StageRankingData | null;
    getPlayerHistory(playerId: string, options: any): PlayerHistoryData | null;
    getChallengeRanking(options: any): ChallengeRankingData | null;
    getLeaderboard(type: string, options: any): LeaderboardData | null;
}

/**
 * Ranking entry interface
 */
interface RankingEntry {
    rank?: number;
    playerId: string;
    playerName: string;
    score: number;
    timestamp: string | Date;
    combo?: number;
    accuracy?: number;
    [key: string]: any;
}

/**
 * Data metadata interface
 */
interface DataMetadata {
    type?: string;
    period?: string;
    stageId?: string;
    stageName?: string;
    playerId?: string;
    playerName?: string;
    currentRank?: number | null;
    bestScore?: number;
    activeChallenges?: number;
    completedChallenges?: number;
    total: number;
    page?: number;
    hasMore?: boolean;
    lastUpdate: number;
}

/**
 * Ranking data interface
 */
interface RankingData {
    rankings: RankingEntry[];
    metadata: DataMetadata;
    error?: string;
}

/**
 * Period ranking data interface
 */
interface PeriodRankingData {
    rankings: RankingEntry[];
    total?: number;
}

/**
 * Stage ranking data interface
 */
interface StageRankingData {
    rankings: RankingEntry[];
    stageName?: string;
    total?: number;
}

/**
 * Player history data interface
 */
interface PlayerHistoryData {
    history: RankingEntry[];
    playerName?: string;
    currentRank?: number | null;
    bestScore?: number;
    total?: number;
}

/**
 * Challenge ranking data interface
 */
interface ChallengeRankingData {
    challenges: RankingEntry[];
    activeChallenges?: number;
    completedChallenges?: number;
    total?: number;
}

/**
 * Leaderboard data interface
 */
interface LeaderboardData {
    rankings: RankingEntry[];
    total?: number;
}

/**
 * Data config interface
 */
interface DataConfig {
    itemsPerPage: number;
    maxItemsPerRequest: number;
    sortOptions: string[];
    viewTypes: string[];
    cacheTimeout: number;
    retryAttempts: number;
    retryDelay: number;
}

/**
 * Filter config interface
 */
interface FilterConfig {
    minScore: number;
    maxResults: number;
    includeExpired: boolean;
    includePlayerData: boolean;
    includeChallenges: boolean;
}

/**
 * Statistics interface
 */
interface Statistics {
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
    errors: number;
    averageResponseTime: number;
}

/**
 * Fetch options interface
 */
interface FetchOptions {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeExpired?: boolean;
    includePlayerData?: boolean;
    stageId?: string;
    playerId?: string;
    filter?: FilterOptions;
}

/**
 * Filter options interface
 */
interface FilterOptions {
    minScore?: number;
    maxScore?: number;
    playerName?: string;
    dateFrom?: string | Date;
    dateTo?: string | Date;
}

/**
 * Update config interface
 */
interface UpdateConfigOptions {
    dataConfig?: Partial<DataConfig>;
    filterConfig?: Partial<FilterConfig>;
    refreshInterval?: number;
}

/**
 * Data watcher callback type
 */
type DataWatcherCallback = (viewType: string, data: RankingData) => void;

export class LeaderboardDataManager {
    private gameEngine: GameEngine;
    private leaderboardManager: LeaderboardManager;
    private errorHandler: ErrorHandler;
    
    // データキャッシュ
    private dataCache: Map<string, RankingData> = new Map();
    private lastUpdateTime: Map<string, number> = new Map();
    private refreshInterval: number = 30000; // 30秒
    private maxCacheSize: number = 50;
    
    // データ設定
    private dataConfig: DataConfig = {
        itemsPerPage: 10,
        maxItemsPerRequest: 50, // ページネーション用
        sortOptions: ['score', 'timestamp', 'combo', 'accuracy'],
        viewTypes: ['overall', 'daily', 'weekly', 'monthly', 'stage'],
        cacheTimeout: 300000, // 5分
        retryAttempts: 3,
        retryDelay: 1000
    };
    
    // フィルター設定
    private filterConfig: FilterConfig = {
        minScore: 0,
        maxResults: 1000,
        includeExpired: false,
        includePlayerData: true,
        includeChallenges: true
    };
    
    // 統計データ
    private statistics: Statistics = {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errors: 0,
        averageResponseTime: 0
    };
    
    // データ監視
    private dataWatchers: Set<DataWatcherCallback> = new Set();
    private autoRefreshEnabled: boolean = true;
    private autoRefreshInterval: number | null = null;

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        this.leaderboardManager = gameEngine.leaderboardManager;
        this.errorHandler = getErrorHandler();
        
        this.initialize();
    }
    
    /**
     * データマネージャーを初期化
     */
    async initialize(): Promise<void> {
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
    async getData(viewType: string, options: FetchOptions = {}): Promise<RankingData> {
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
            return { error: 'データの取得に失敗しました', rankings: [], metadata: { total: 0, lastUpdate: Date.now() } };
        }
    }
    
    /**
     * データを強制更新
     * @param {string} viewType - ビューの種類
     * @param {Object} options - オプション
     * @returns {Promise<Object>} データ
     */
    async refreshData(viewType: string, options: FetchOptions = {}): Promise<RankingData> {
        try {
            const cacheKey = this.generateCacheKey(viewType, options);
            
            // キャッシュを削除
            this.dataCache.delete(cacheKey);
            this.lastUpdateTime.delete(cacheKey);
            
            // データを再取得
            return await this.getData(viewType, options);
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardDataManager.refreshData');
            return { error: 'データの更新に失敗しました', rankings: [], metadata: { total: 0, lastUpdate: Date.now() } };
        }
    }
    
    /**
     * 実際のデータ取得
     * @param {string} viewType - ビューの種類
     * @param {Object} options - オプション
     * @returns {Promise<Object>} データ
     */
    async fetchData(viewType: string, options: FetchOptions = {}): Promise<RankingData> {
        const mergedOptions = {
            limit: this.dataConfig.itemsPerPage * 5,
            offset: 0,
            sortBy: 'score',
            includeExpired: this.filterConfig.includeExpired,
            includePlayerData: this.filterConfig.includePlayerData,
            ...options
        };
        
        let data: RankingData;
        
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
                        data = { error: 'ステージIDが指定されていません', rankings: [], metadata: { total: 0, lastUpdate: Date.now() } };
                    }
                    break;
                    
                case 'player':
                    if (mergedOptions.playerId) {
                        data = await this.fetchPlayerRanking(mergedOptions.playerId, mergedOptions);
                    } else {
                        data = { error: 'プレイヤーIDが指定されていません', rankings: [], metadata: { total: 0, lastUpdate: Date.now() } };
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
            return { error: 'データの取得でエラーが発生しました', rankings: [], metadata: { total: 0, lastUpdate: Date.now() } };
        }
    }
    
    /**
     * 期間別ランキングを取得
     * @param {string} period - 期間
     * @param {Object} options - オプション
     * @returns {Promise<Object>} データ
     */
    async fetchPeriodRanking(period: string, options: FetchOptions): Promise<RankingData> {
        try {
            const data = this.leaderboardManager.getPeriodRanking(period, options);
            
            // データ検証
            if (!data || !Array.isArray(data.rankings)) {
                return { error: '無効なデータ形式', rankings: [], metadata: { total: 0, lastUpdate: Date.now() } };
            }
            
            return {
                rankings: data.rankings,
                metadata: {
                    period: period,
                    total: data.total || data.rankings.length,
                    page: Math.floor((options.offset || 0) / (options.limit || 1)),
                    hasMore: data.rankings.length >= (options.limit || 0),
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
    async fetchStageRanking(stageId: string, options: FetchOptions): Promise<RankingData> {
        try {
            const data = this.leaderboardManager.getStageRanking(stageId, options);
            
            if (!data || !Array.isArray(data.rankings)) {
                return { error: 'ステージデータが見つかりません', rankings: [], metadata: { total: 0, lastUpdate: Date.now() } };
            }
            
            return {
                rankings: data.rankings,
                metadata: {
                    stageId: stageId,
                    stageName: data.stageName || `ステージ ${stageId}`,
                    total: data.total || data.rankings.length,
                    page: Math.floor((options.offset || 0) / (options.limit || 1)),
                    hasMore: data.rankings.length >= (options.limit || 0),
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
    async fetchPlayerRanking(playerId: string, options: FetchOptions): Promise<RankingData> {
        try {
            const data = this.leaderboardManager.getPlayerHistory(playerId, options);
            
            if (!data || !Array.isArray(data.history)) {
                return { error: 'プレイヤーデータが見つかりません', rankings: [], metadata: { total: 0, lastUpdate: Date.now() } };
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
    async fetchChallengeRanking(options: FetchOptions): Promise<RankingData> {
        try {
            const data = this.leaderboardManager.getChallengeRanking(options);
            
            if (!data || !Array.isArray(data.challenges)) {
                return { error: 'チャレンジデータが見つかりません', rankings: [], metadata: { total: 0, lastUpdate: Date.now() } };
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
    async fetchDefaultRanking(options: FetchOptions): Promise<RankingData> {
        try {
            const data = this.leaderboardManager.getLeaderboard('overall', options);
            
            if (!data || !Array.isArray(data.rankings)) {
                return { error: 'デフォルトデータの取得に失敗しました', rankings: [], metadata: { total: 0, lastUpdate: Date.now() } };
            }
            
            return {
                rankings: data.rankings,
                metadata: {
                    type: 'default',
                    total: data.total || data.rankings.length,
                    page: Math.floor((options.offset || 0) / (options.limit || 1)),
                    hasMore: data.rankings.length >= (options.limit || 0),
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
    processData(data: RankingData, options: FetchOptions): RankingData {
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
    sortData(rankings: RankingEntry[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): RankingEntry[] {
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
    filterData(rankings: RankingEntry[], filter: FilterOptions): RankingEntry[] {
        return rankings.filter(entry => {
            // スコア範囲フィルター
            if (filter.minScore !== undefined && entry.score < filter.minScore) {
                return false;
            }
            if (filter.maxScore !== undefined && entry.score > filter.maxScore) {
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
    addRankings(rankings: RankingEntry[]): RankingEntry[] {
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
    generateCacheKey(viewType: string, options: FetchOptions): string {
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
    getCachedData(cacheKey: string): RankingData | null {
        const now = Date.now();
        const lastUpdate = this.lastUpdateTime.get(cacheKey);
        
        if (!lastUpdate || (now - lastUpdate) > this.refreshInterval) {
            return null;
        }
        
        return this.dataCache.get(cacheKey) || null;
    }
    
    /**
     * データをキャッシュに保存
     * @param {string} cacheKey - キャッシュキー
     * @param {Object} data - データ
     */
    setCachedData(cacheKey: string, data: RankingData): void {
        // キャッシュサイズ制限
        if (this.dataCache.size >= this.maxCacheSize) {
            const oldestKey = this.dataCache.keys().next().value;
            if (oldestKey) {
                this.dataCache.delete(oldestKey);
                this.lastUpdateTime.delete(oldestKey);
            }
        }
        
        this.dataCache.set(cacheKey, data);
        this.lastUpdateTime.set(cacheKey, Date.now());
    }
    
    /**
     * キャッシュをクリア
     * @param {string} pattern - クリアするパターン（オプション）
     */
    clearCache(pattern: string | null = null): void {
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
    updateStatistics(startTime: number): void {
        const responseTime = Date.now() - startTime;
        this.statistics.averageResponseTime = 
            (this.statistics.averageResponseTime + responseTime) / 2;
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    getStatistics(): Statistics & { cacheHitRate: number; cacheSize: number; lastUpdate: number } {
        const lastUpdateTimes = Array.from(this.lastUpdateTime.values());
        return {
            ...this.statistics,
            cacheHitRate: this.statistics.totalRequests > 0 ? 
                (this.statistics.cacheHits / this.statistics.totalRequests) * 100 : 0,
            cacheSize: this.dataCache.size,
            lastUpdate: lastUpdateTimes.length > 0 ? Math.max(...lastUpdateTimes) : 0
        };
    }
    
    /**
     * 自動更新を開始
     */
    startAutoRefresh(): void {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        if (this.autoRefreshEnabled) {
            this.autoRefreshInterval = window.setInterval(() => {
                this.performAutoRefresh();
            }, this.refreshInterval);
        }
    }
    
    /**
     * 自動更新を停止
     */
    stopAutoRefresh(): void {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }
    
    /**
     * 自動更新を実行
     */
    async performAutoRefresh(): Promise<void> {
        try {
            // アクティブなキャッシュキーの更新
            const now = Date.now();
            const keysToRefresh: string[] = [];
            
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
    parseOptionsFromKey(optionParts: string[]): FetchOptions {
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
    addDataWatcher(callback: DataWatcherCallback): void {
        this.dataWatchers.add(callback);
    }
    
    /**
     * データ監視を削除
     * @param {Function} callback - コールバック関数
     */
    removeDataWatcher(callback: DataWatcherCallback): void {
        this.dataWatchers.delete(callback);
    }
    
    /**
     * データ変更を通知
     * @param {string} viewType - ビューの種類
     * @param {Object} data - データ
     */
    notifyDataChange(viewType: string, data: RankingData): void {
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
    updateConfig(newConfig: UpdateConfigOptions): void {
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
    dispose(): void {
        this.stopAutoRefresh();
        this.clearCache();
        this.dataWatchers.clear();
        
        console.log('[LeaderboardDataManager] Data manager disposed');
    }
}