import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * リーダーボード管理システム
 * ローカルストレージベースのスコア保存・ランキング機能を提供
 */
export class LeaderboardManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // データ構造
        this.leaderboards = new Map();
        this.playerScores = new Map();
        
        // 設定
        this.config = {
            maxEntriesPerLeaderboard: 100,
            dataVersion: '1.0.0',
            storageKey: 'awaputi_leaderboards',
            validationEnabled: true,
            cacheTTL: 5 * 60 * 1000, // 5分
            backupEnabled: true
        };
        
        // パフォーマンス統計
        this.stats = {
            dataLoadTime: 0,
            saveCount: 0,
            validationErrors: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        
        // キャッシュシステム
        this.cache = new Map();
        this.lastUpdate = new Map();
        
        console.log('[LeaderboardManager] 初期化完了');
    }

    /**
     * システム初期化
     */
    async initialize() {
        try {
            console.log('[LeaderboardManager] 初期化開始');
            
            // データ読み込み
            await this.load();
            
            // 基本リーダーボードの作成
            this.initializeDefaultLeaderboards();
            
            // データ整合性チェック
            if (this.config.validationEnabled) {
                await this.performIntegrityCheck();
            }
            
            // 定期クリーンアップの設定
            this.setupPeriodicCleanup();
            
            // 高度なキャッシュ機能の設定 (Task 18.4)
            this.setupAdvancedCaching();
            
            console.log('[LeaderboardManager] 初期化完了');
            
        } catch (error) {
            getErrorHandler().handleError(error, 'LEADERBOARD_INIT_ERROR', {
                component: 'LeaderboardManager'
            });
            
            // フォールバック: 空のデータで初期化
            this.initializeEmptyData();
        }
    }

    /**
     * 定期クリーンアップの設定
     */
    setupPeriodicCleanup() {
        // 1時間ごとに期限切れエントリーをクリーンアップ
        setInterval(async () => {
            try {
                await this.cleanupExpiredPeriodEntries();
            } catch (error) {
                console.error('[LeaderboardManager] 定期クリーンアップエラー:', error);
            }
        }, 60 * 60 * 1000); // 1時間

        // 24時間ごとにランキングを再計算
        setInterval(async () => {
            try {
                await this.recalculatePeriodRankings();
            } catch (error) {
                console.error('[LeaderboardManager] ランキング再計算エラー:', error);
            }
        }, 24 * 60 * 60 * 1000); // 24時間
        
        console.log('[LeaderboardManager] 定期クリーンアップタスク設定完了');
    }

    /**
     * デフォルトリーダーボードの初期化
     */
    initializeDefaultLeaderboards() {
        const defaultLeaderboards = [
            { id: 'overall', name: '総合ランキング', description: '全ステージの総合スコア' },
            { id: 'daily', name: '日間ランキング', description: '過去24時間のベストスコア' },
            { id: 'weekly', name: '週間ランキング', description: '過去7日間のベストスコア' },
            { id: 'monthly', name: '月間ランキング', description: '過去30日間のベストスコア' }
        ];
        
        for (const leaderboard of defaultLeaderboards) {
            if (!this.leaderboards.has(leaderboard.id)) {
                this.leaderboards.set(leaderboard.id, {
                    id: leaderboard.id,
                    name: leaderboard.name,
                    description: leaderboard.description,
                    entries: [],
                    created: Date.now(),
                    lastUpdated: Date.now(),
                    type: 'score',
                    period: leaderboard.id === 'overall' ? 'all' : leaderboard.id
                });
            }
        }
        
        // ステージ別リーダーボード
        const stages = this.gameEngine.stageManager?.getAllStages() || [];
        for (const stage of stages) {
            const leaderboardId = `stage_${stage.id}`;
            if (!this.leaderboards.has(leaderboardId)) {
                this.leaderboards.set(leaderboardId, {
                    id: leaderboardId,
                    name: `${stage.name}ランキング`,
                    description: `${stage.name}のベストスコア`,
                    entries: [],
                    created: Date.now(),
                    lastUpdated: Date.now(),
                    type: 'score',
                    period: 'all',
                    stageId: stage.id
                });
            }
        }
    }

    /**
     * スコア記録
     */
    async recordScore(playerId, playerName, score, stageId, gameData = {}) {
        try {
            const startTime = performance.now();
            
            // データ検証
            if (!this.validateScoreData({ playerId, playerName, score, stageId, gameData })) {
                throw new Error('Invalid score data');
            }
            
            const timestamp = Date.now();
            const scoreEntry = {
                playerId,
                playerName,
                score,
                stageId,
                timestamp,
                gameData: {
                    combo: gameData.combo || 0,
                    accuracy: gameData.accuracy || 0,
                    duration: gameData.duration || 0,
                    bubbleTypes: gameData.bubbleTypes || {}
                },
                checksum: this.calculateScoreChecksum({ playerId, score, stageId, timestamp })
            };
            
            // 効率的なランキング更新を使用
            const updateResult = await this.updateRankingEfficiently(scoreEntry);
            
            // プレイヤースコア履歴に記録
            this.recordPlayerScore(scoreEntry);
            
            // データ保存
            await this.save();
            
            // キャッシュクリア
            this.clearRelevantCache(stageId);
            
            const processingTime = performance.now() - startTime;
            console.log(`[LeaderboardManager] スコア記録完了: ${score} (${processingTime.toFixed(2)}ms)`);
            
            return {
                success: true,
                rankings: await this.getPlayerRankings(playerId),
                processingTime
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'SCORE_RECORD_ERROR', {
                playerId, playerName, score, stageId
            });
            return { success: false, error: error.message };
        }
    }

    /**
     * リーダーボード更新
     */
    async updateLeaderboards(scoreEntry) {
        const { playerId, score, stageId, timestamp } = scoreEntry;
        
        // 総合ランキング更新
        await this.updateLeaderboard('overall', scoreEntry);
        
        // 期間別ランキング更新
        await this.updatePeriodLeaderboards(scoreEntry);
        
        // ステージ別ランキング更新
        if (stageId) {
            await this.updateLeaderboard(`stage_${stageId}`, scoreEntry);
        }
    }

    /**
     * 個別リーダーボード更新
     */
    async updateLeaderboard(leaderboardId, scoreEntry) {
        const leaderboard = this.leaderboards.get(leaderboardId);
        if (!leaderboard) {
            console.warn(`[LeaderboardManager] リーダーボードが見つかりません: ${leaderboardId}`);
            return;
        }
        
        const { playerId, score } = scoreEntry;
        
        // 既存エントリーを検索
        const existingIndex = leaderboard.entries.findIndex(entry => entry.playerId === playerId);
        
        if (existingIndex >= 0) {
            // 既存スコアより高い場合のみ更新
            if (score > leaderboard.entries[existingIndex].score) {
                leaderboard.entries[existingIndex] = { ...scoreEntry };
            }
        } else {
            // 新規エントリー追加
            leaderboard.entries.push({ ...scoreEntry });
        }
        
        // スコア順でソート（降順）
        leaderboard.entries.sort((a, b) => b.score - a.score);
        
        // 最大エントリー数を超えた場合は削除
        if (leaderboard.entries.length > this.config.maxEntriesPerLeaderboard) {
            leaderboard.entries = leaderboard.entries.slice(0, this.config.maxEntriesPerLeaderboard);
        }
        
        leaderboard.lastUpdated = Date.now();
    }

    /**
     * 期間別リーダーボード更新
     */
    async updatePeriodLeaderboards(scoreEntry) {
        const now = Date.now();
        const { timestamp } = scoreEntry;
        
        // 日間（24時間以内）
        if (now - timestamp <= 24 * 60 * 60 * 1000) {
            await this.updateLeaderboard('daily', scoreEntry);
        }
        
        // 週間（7日以内）
        if (now - timestamp <= 7 * 24 * 60 * 60 * 1000) {
            await this.updateLeaderboard('weekly', scoreEntry);
        }
        
        // 月間（30日以内）
        if (now - timestamp <= 30 * 24 * 60 * 60 * 1000) {
            await this.updateLeaderboard('monthly', scoreEntry);
        }
    }

    /**
     * 期間別ランキングのクリーンアップ
     */
    async cleanupExpiredPeriodEntries() {
        const now = Date.now();
        
        // 各期間の有効期限
        const periods = {
            daily: 24 * 60 * 60 * 1000,      // 24時間
            weekly: 7 * 24 * 60 * 60 * 1000,  // 7日
            monthly: 30 * 24 * 60 * 60 * 1000 // 30日
        };
        
        for (const [periodName, duration] of Object.entries(periods)) {
            const leaderboard = this.leaderboards.get(periodName);
            if (!leaderboard) continue;
            
            const beforeCount = leaderboard.entries.length;
            
            // 期限切れエントリーを削除
            leaderboard.entries = leaderboard.entries.filter(entry => {
                return (now - entry.timestamp) <= duration;
            });
            
            const afterCount = leaderboard.entries.length;
            
            if (beforeCount !== afterCount) {
                leaderboard.lastUpdated = now;
                console.log(`[LeaderboardManager] ${periodName}ランキング: ${beforeCount - afterCount}件の期限切れエントリーを削除`);
            }
        }
        
        // キャッシュクリア
        this.clearExpiredCache();
    }

    /**
     * 期間別ランキングの再計算
     */
    async recalculatePeriodRankings() {
        const now = Date.now();
        
        // 全プレイヤーのスコア履歴から期間別ランキングを再構築
        const periods = {
            daily: 24 * 60 * 60 * 1000,
            weekly: 7 * 24 * 60 * 60 * 1000,
            monthly: 30 * 24 * 60 * 60 * 1000
        };
        
        // 期間別リーダーボードをリセット
        for (const periodName of Object.keys(periods)) {
            const leaderboard = this.leaderboards.get(periodName);
            if (leaderboard) {
                leaderboard.entries = [];
            }
        }
        
        // 全プレイヤーのスコア履歴を参照して再構築
        for (const [playerId, scoreHistory] of this.playerScores) {
            for (const scoreEntry of scoreHistory) {
                // 各期間内のスコアのみを対象に
                for (const [periodName, duration] of Object.entries(periods)) {
                    if ((now - scoreEntry.timestamp) <= duration) {
                        await this.updateLeaderboard(periodName, scoreEntry);
                    }
                }
            }
        }
        
        console.log('[LeaderboardManager] 期間別ランキング再計算完了');
    }

    /**
     * 期間別統計の取得
     */
    getPeriodStats() {
        const stats = {};
        const now = Date.now();
        const periods = {
            daily: 24 * 60 * 60 * 1000,
            weekly: 7 * 24 * 60 * 60 * 1000,
            monthly: 30 * 24 * 60 * 60 * 1000
        };
        
        for (const [periodName, duration] of Object.entries(periods)) {
            const leaderboard = this.leaderboards.get(periodName);
            if (!leaderboard) continue;
            
            // 有効エントリー数
            const validEntries = leaderboard.entries.filter(entry => 
                (now - entry.timestamp) <= duration
            );
            
            stats[periodName] = {
                totalEntries: validEntries.length,
                topScore: validEntries.length > 0 ? validEntries[0].score : 0,
                averageScore: validEntries.length > 0 
                    ? Math.round(validEntries.reduce((sum, entry) => sum + entry.score, 0) / validEntries.length)
                    : 0,
                lastUpdated: leaderboard.lastUpdated,
                oldestEntry: validEntries.length > 0 
                    ? Math.min(...validEntries.map(entry => entry.timestamp))
                    : null
            };
        }
        
        return stats;
    }

    /**
     * 期間フィルタリング付きランキング取得
     */
    getPeriodRanking(period, options = {}) {
        const {
            limit = 10,
            offset = 0,
            includeExpired = false
        } = options;
        
        const leaderboard = this.leaderboards.get(period);
        if (!leaderboard) {
            return { error: `Period ${period} not found` };
        }
        
        let entries = leaderboard.entries;
        
        // 期限切れエントリーの除外
        if (!includeExpired) {
            const now = Date.now();
            const periods = {
                daily: 24 * 60 * 60 * 1000,
                weekly: 7 * 24 * 60 * 60 * 1000,
                monthly: 30 * 24 * 60 * 60 * 1000
            };
            
            const duration = periods[period];
            if (duration) {
                entries = entries.filter(entry => (now - entry.timestamp) <= duration);
            }
        }
        
        // ページネーション
        const paginatedEntries = entries
            .slice(offset, offset + limit)
            .map((entry, index) => ({
                rank: offset + index + 1,
                playerId: entry.playerId,
                playerName: entry.playerName,
                score: entry.score,
                timestamp: entry.timestamp,
                gameData: entry.gameData
            }));
        
        return {
            period,
            entries: paginatedEntries,
            total: entries.length,
            hasMore: (offset + limit) < entries.length,
            lastUpdated: leaderboard.lastUpdated
        };
    }

    /**
     * リーダーボード取得
     */
    getLeaderboard(leaderboardId, options = {}) {
        const {
            limit = 10,
            offset = 0,
            includePlayerData = true,
            useCache = true
        } = options;
        
        // キャッシュチェック
        if (useCache) {
            const cached = this.getCachedLeaderboard(leaderboardId, limit, offset);
            if (cached) {
                this.stats.cacheHits++;
                return cached;
            }
            this.stats.cacheMisses++;
        }
        
        const leaderboard = this.leaderboards.get(leaderboardId);
        if (!leaderboard) {
            return { error: 'Leaderboard not found' };
        }
        
        const entries = leaderboard.entries
            .slice(offset, offset + limit)
            .map((entry, index) => ({
                rank: offset + index + 1,
                playerId: entry.playerId,
                playerName: entry.playerName,
                score: entry.score,
                timestamp: entry.timestamp,
                gameData: includePlayerData ? entry.gameData : undefined
            }));
        
        const result = {
            id: leaderboard.id,
            name: leaderboard.name,
            description: leaderboard.description,
            entries,
            total: leaderboard.entries.length,
            lastUpdated: leaderboard.lastUpdated
        };
        
        // キャッシュに保存
        if (useCache) {
            this.cacheLeaderboard(leaderboardId, limit, offset, result);
        }
        
        return result;
    }

    /**
     * プレイヤーランキング取得
     */
    async getPlayerRankings(playerId) {
        const rankings = {};
        
        for (const [leaderboardId, leaderboard] of this.leaderboards) {
            const entryIndex = leaderboard.entries.findIndex(entry => entry.playerId === playerId);
            if (entryIndex >= 0) {
                rankings[leaderboardId] = {
                    rank: entryIndex + 1,
                    score: leaderboard.entries[entryIndex].score,
                    total: leaderboard.entries.length,
                    percentile: Math.round((1 - entryIndex / leaderboard.entries.length) * 100)
                };
            }
        }
        
        return rankings;
    }

    /**
     * プレイヤースコア履歴記録
     */
    recordPlayerScore(scoreEntry) {
        const { playerId } = scoreEntry;
        
        if (!this.playerScores.has(playerId)) {
            this.playerScores.set(playerId, []);
        }
        
        const playerHistory = this.playerScores.get(playerId);
        playerHistory.push(scoreEntry);
        
        // 履歴が長すぎる場合は古いものを削除
        if (playerHistory.length > 50) {
            playerHistory.splice(0, playerHistory.length - 50);
        }
    }

    /**
     * データ検証
     */
    validateScoreData(data) {
        const { playerId, playerName, score, stageId } = data;
        
        if (!playerId || typeof playerId !== 'string') {
            this.stats.validationErrors++;
            return false;
        }
        
        if (!playerName || typeof playerName !== 'string') {
            this.stats.validationErrors++;
            return false;
        }
        
        if (typeof score !== 'number' || score < 0 || !isFinite(score)) {
            this.stats.validationErrors++;
            return false;
        }
        
        if (stageId && typeof stageId !== 'string') {
            this.stats.validationErrors++;
            return false;
        }
        
        return true;
    }

    /**
     * スコアチェックサム計算
     */
    calculateScoreChecksum(data) {
        const { playerId, score, stageId, timestamp } = data;
        const str = `${playerId}:${score}:${stageId}:${timestamp}`;
        
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit整数に変換
        }
        
        return hash.toString(36);
    }

    /**
     * キャッシュ管理
     */
    getCachedLeaderboard(leaderboardId, limit, offset) {
        const cacheKey = `${leaderboardId}:${limit}:${offset}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
            return cached.data;
        }
        
        return null;
    }

    cacheLeaderboard(leaderboardId, limit, offset, data) {
        const cacheKey = `${leaderboardId}:${limit}:${offset}`;
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }

    clearRelevantCache(stageId) {
        const keysToDelete = [];
        
        for (const key of this.cache.keys()) {
            if (key.includes('overall') || key.includes('daily') || key.includes('weekly') || key.includes('monthly')) {
                keysToDelete.push(key);
            }
            
            if (stageId && key.includes(`stage_${stageId}`)) {
                keysToDelete.push(key);
            }
        }
        
        for (const key of keysToDelete) {
            this.cache.delete(key);
        }
    }

    /**
     * 期限切れキャッシュのクリア
     */
    clearExpiredCache() {
        const now = Date.now();
        const keysToDelete = [];
        
        for (const [key, cached] of this.cache) {
            if (now - cached.timestamp >= this.config.cacheTTL) {
                keysToDelete.push(key);
            }
        }
        
        for (const key of keysToDelete) {
            this.cache.delete(key);
        }
        
        if (keysToDelete.length > 0) {
            console.log(`[LeaderboardManager] ${keysToDelete.length}件の期限切れキャッシュを削除`);
        }
    }

    /**
     * ステージ別ランキング機能の強化
     */
    getStageRanking(stageId, options = {}) {
        const {
            limit = 10,
            offset = 0,
            includePlayerData = true,
            sortBy = 'score' // score, timestamp, combo, accuracy
        } = options;
        
        const leaderboardId = `stage_${stageId}`;
        const leaderboard = this.leaderboards.get(leaderboardId);
        
        if (!leaderboard) {
            return { error: `Stage leaderboard not found: ${stageId}` };
        }
        
        // ソート条件に応じてエントリーをソート
        let sortedEntries = [...leaderboard.entries];
        
        switch (sortBy) {
            case 'score':
                sortedEntries.sort((a, b) => b.score - a.score);
                break;
            case 'timestamp':
                sortedEntries.sort((a, b) => b.timestamp - a.timestamp);
                break;
            case 'combo':
                sortedEntries.sort((a, b) => (b.gameData?.combo || 0) - (a.gameData?.combo || 0));
                break;
            case 'accuracy':
                sortedEntries.sort((a, b) => (b.gameData?.accuracy || 0) - (a.gameData?.accuracy || 0));
                break;
            default:
                sortedEntries.sort((a, b) => b.score - a.score);
        }
        
        // ページネーション適用
        const paginatedEntries = sortedEntries
            .slice(offset, offset + limit)
            .map((entry, index) => ({
                rank: offset + index + 1,
                playerId: entry.playerId,
                playerName: entry.playerName,
                score: entry.score,
                timestamp: entry.timestamp,
                gameData: includePlayerData ? entry.gameData : undefined
            }));
        
        return {
            stageId,
            entries: paginatedEntries,
            total: sortedEntries.length,
            hasMore: (offset + limit) < sortedEntries.length,
            sortBy,
            lastUpdated: leaderboard.lastUpdated
        };
    }

    /**
     * 複合ランキング（総合＋ステージ別）表示機能
     */
    getCompositeRanking(options = {}) {
        const {
            limit = 5,
            includeStages = true,
            includePeriods = true
        } = options;
        
        const composite = {
            overall: this.getLeaderboard('overall', { limit }),
            stages: {},
            periods: {}
        };
        
        // ステージ別ランキング
        if (includeStages) {
            for (const [leaderboardId, leaderboard] of this.leaderboards) {
                if (leaderboardId.startsWith('stage_')) {
                    const stageId = leaderboardId.replace('stage_', '');
                    composite.stages[stageId] = this.getStageRanking(stageId, { limit });
                }
            }
        }
        
        // 期間別ランキング
        if (includePeriods) {
            const periods = ['daily', 'weekly', 'monthly'];
            for (const period of periods) {
                composite.periods[period] = this.getPeriodRanking(period, { limit });
            }
        }
        
        return composite;
    }

    /**
     * ステージ別統計の取得
     */
    getStageStats() {
        const stageStats = {};
        
        for (const [leaderboardId, leaderboard] of this.leaderboards) {
            if (!leaderboardId.startsWith('stage_')) continue;
            
            const stageId = leaderboardId.replace('stage_', '');
            const entries = leaderboard.entries;
            
            if (entries.length > 0) {
                stageStats[stageId] = {
                    totalPlayers: entries.length,
                    topScore: entries[0]?.score || 0,
                    averageScore: Math.round(
                        entries.reduce((sum, entry) => sum + entry.score, 0) / entries.length
                    ),
                    topCombo: Math.max(...entries.map(entry => entry.gameData?.combo || 0)),
                    averageAccuracy: Math.round(
                        entries.reduce((sum, entry) => sum + (entry.gameData?.accuracy || 0), 0) / entries.length
                    ),
                    lastPlayed: Math.max(...entries.map(entry => entry.timestamp)),
                    playCount: entries.length
                };
            } else {
                stageStats[stageId] = {
                    totalPlayers: 0,
                    topScore: 0,
                    averageScore: 0,
                    topCombo: 0,
                    averageAccuracy: 0,
                    lastPlayed: null,
                    playCount: 0
                };
            }
        }
        
        return stageStats;
    }

    /**
     * ランキングデータの効率的な更新
     */
    async updateRankingEfficiently(scoreEntry) {
        const startTime = performance.now();
        
        // バッチ更新用の配列
        const updates = [];
        
        // 総合ランキング
        updates.push({ leaderboardId: 'overall', scoreEntry });
        
        // 期間別ランキング（条件チェック済みのもののみ）
        const now = Date.now();
        const { timestamp } = scoreEntry;
        
        if (now - timestamp <= 24 * 60 * 60 * 1000) {
            updates.push({ leaderboardId: 'daily', scoreEntry });
        }
        if (now - timestamp <= 7 * 24 * 60 * 60 * 1000) {
            updates.push({ leaderboardId: 'weekly', scoreEntry });
        }
        if (now - timestamp <= 30 * 24 * 60 * 60 * 1000) {
            updates.push({ leaderboardId: 'monthly', scoreEntry });
        }
        
        // ステージ別ランキング
        if (scoreEntry.stageId) {
            updates.push({ leaderboardId: `stage_${scoreEntry.stageId}`, scoreEntry });
        }
        
        // バッチ更新実行
        for (const update of updates) {
            await this.updateLeaderboard(update.leaderboardId, update.scoreEntry);
        }
        
        // 関連キャッシュクリア
        this.clearRelevantCache(scoreEntry.stageId);
        
        const processingTime = performance.now() - startTime;
        this.stats.batchUpdateTime = processingTime;
        
        return {
            updatedLeaderboards: updates.length,
            processingTime
        };
    }

    /**
     * データ永続化
     */
    async save() {
        try {
            const startTime = performance.now();
            
            const saveData = {
                version: this.config.dataVersion,
                timestamp: Date.now(),
                leaderboards: Object.fromEntries(this.leaderboards),
                playerScores: Object.fromEntries(this.playerScores),
                stats: this.stats
            };
            
            // バックアップ作成
            if (this.config.backupEnabled) {
                await this.createBackup();
            }
            
            // メインデータ保存
            localStorage.setItem(this.config.storageKey, JSON.stringify(saveData));
            
            this.stats.saveCount++;
            const saveTime = performance.now() - startTime;
            
            console.log(`[LeaderboardManager] データ保存完了 (${saveTime.toFixed(2)}ms)`);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'LEADERBOARD_SAVE_ERROR');
            throw error;
        }
    }

    /**
     * データ読み込み
     */
    async load() {
        try {
            const startTime = performance.now();
            
            const savedData = localStorage.getItem(this.config.storageKey);
            if (!savedData) {
                console.log('[LeaderboardManager] 保存データが見つかりません。新規初期化します。');
                this.initializeEmptyData();
                return;
            }
            
            const parsedData = JSON.parse(savedData);
            
            // データバージョンチェック
            if (parsedData.version !== this.config.dataVersion) {
                console.log('[LeaderboardManager] データバージョンが異なります。マイグレーションを実行します。');
                await this.migrateData(parsedData);
                return;
            }
            
            // データ復元
            this.leaderboards = new Map(Object.entries(parsedData.leaderboards || {}));
            this.playerScores = new Map(Object.entries(parsedData.playerScores || {}));
            this.stats = { ...this.stats, ...parsedData.stats };
            
            this.stats.dataLoadTime = performance.now() - startTime;
            console.log(`[LeaderboardManager] データ読み込み完了 (${this.stats.dataLoadTime.toFixed(2)}ms)`);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'LEADERBOARD_LOAD_ERROR');
            
            // フォールバック: バックアップからの復元を試行
            await this.attemptBackupRestore();
        }
    }

    /**
     * データマイグレーション
     */
    async migrateData(oldData) {
        console.log('[LeaderboardManager] データマイグレーション開始');
        
        // 旧バージョンからの移行処理をここに実装
        // 現在は初期化のみ
        this.initializeEmptyData();
        
        console.log('[LeaderboardManager] データマイグレーション完了');
    }

    /**
     * 空データ初期化
     */
    initializeEmptyData() {
        this.leaderboards.clear();
        this.playerScores.clear();
        this.stats = {
            dataLoadTime: 0,
            saveCount: 0,
            validationErrors: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
    }

    /**
     * バックアップ作成
     */
    async createBackup() {
        try {
            const backupKey = `${this.config.storageKey}_backup`;
            const currentData = localStorage.getItem(this.config.storageKey);
            if (currentData) {
                localStorage.setItem(backupKey, currentData);
            }
        } catch (error) {
            console.warn('[LeaderboardManager] バックアップ作成に失敗:', error);
        }
    }

    /**
     * バックアップからの復元
     */
    async attemptBackupRestore() {
        try {
            const backupKey = `${this.config.storageKey}_backup`;
            const backupData = localStorage.getItem(backupKey);
            
            if (backupData) {
                const parsedData = JSON.parse(backupData);
                this.leaderboards = new Map(Object.entries(parsedData.leaderboards || {}));
                this.playerScores = new Map(Object.entries(parsedData.playerScores || {}));
                console.log('[LeaderboardManager] バックアップから復元しました');
            } else {
                this.initializeEmptyData();
            }
        } catch (error) {
            console.error('[LeaderboardManager] バックアップ復元に失敗:', error);
            this.initializeEmptyData();
        }
    }

    /**
     * データ整合性チェック
     */
    async performIntegrityCheck() {
        let issuesFound = 0;
        
        for (const [leaderboardId, leaderboard] of this.leaderboards) {
            // エントリーの検証
            for (let i = 0; i < leaderboard.entries.length; i++) {
                const entry = leaderboard.entries[i];
                
                // チェックサム検証
                const expectedChecksum = this.calculateScoreChecksum({
                    playerId: entry.playerId,
                    score: entry.score,
                    stageId: entry.stageId,
                    timestamp: entry.timestamp
                });
                
                if (entry.checksum !== expectedChecksum) {
                    console.warn(`[LeaderboardManager] チェックサムエラー: ${leaderboardId}[${i}]`);
                    issuesFound++;
                }
                
                // スコア順序の検証
                if (i > 0 && leaderboard.entries[i-1].score < entry.score) {
                    console.warn(`[LeaderboardManager] ソート順序エラー: ${leaderboardId}[${i}]`);
                    issuesFound++;
                }
            }
        }
        
        if (issuesFound > 0) {
            console.warn(`[LeaderboardManager] ${issuesFound}件の整合性問題が発見されました`);
        } else {
            console.log('[LeaderboardManager] データ整合性チェック完了 - 問題なし');
        }
        
        return issuesFound;
    }

    /**
     * 統計情報取得
     */
    getStats() {
        return {
            ...this.stats,
            totalLeaderboards: this.leaderboards.size,
            totalPlayers: this.playerScores.size,
            cacheSize: this.cache.size,
            uptime: Date.now() - (this.stats.initTime || Date.now())
        };
    }

    /**
     * リセット
     */
    async reset() {
        this.leaderboards.clear();
        this.playerScores.clear();
        this.cache.clear();
        this.initializeEmptyData();
        await this.save();
        console.log('[LeaderboardManager] リセット完了');
    }

    /**
     * ページ分けでランキングデータを遅延読み込み (Task 18.2)
     */
    async getLeaderboardPaginated(type, period = 'all', options = {}) {
        try {
            const {
                page = 1, 
                pageSize = 20, 
                sortBy = 'score',
                sortOrder = 'desc',
                includePlayerRank = false
            } = options;
            
            // キャッシュキーの生成
            const cacheKey = `paginated_${type}_${period}_${page}_${pageSize}_${sortBy}_${sortOrder}`;
            
            // キャッシュチェック
            if (this.cache.has(cacheKey)) {
                const cachedData = this.cache.get(cacheKey);
                const age = Date.now() - (this.lastUpdate.get(cacheKey) || 0);
                
                if (age < this.config.cacheTTL) {
                    this.stats.cacheHits++;
                    console.log(`[LeaderboardManager] キャッシュヒット: ${cacheKey}`);
                    return cachedData;
                }
            }
            
            this.stats.cacheMisses++;
            
            // ランキングデータの非同期取得
            const startTime = performance.now();
            const leaderboard = await this.loadLeaderboardAsync(type, period);
            
            if (!leaderboard || !leaderboard.entries) {
                return {
                    data: [],
                    pagination: {
                        page,
                        pageSize,
                        total: 0,
                        totalPages: 0,
                        hasNext: false,
                        hasPrev: false
                    },
                    playerRank: includePlayerRank ? null : undefined
                };
            }
            
            // ソート処理
            const sortedEntries = await this.sortEntriesAsync(leaderboard.entries, sortBy, sortOrder);
            
            // ページネーション処理
            const total = sortedEntries.length;
            const totalPages = Math.ceil(total / pageSize);
            const startIndex = (page - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, total);
            const pageData = sortedEntries.slice(startIndex, endIndex);
            
            // プレイヤーランク取得（要求された場合）
            let playerRank = null;
            if (includePlayerRank && this.gameEngine.playerData) {
                const playerId = this.gameEngine.playerData.getPlayerId();
                playerRank = await this.getPlayerRankAsync(sortedEntries, playerId);
            }
            
            const result = {
                data: pageData,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                },
                playerRank: includePlayerRank ? playerRank : undefined,
                loadTime: performance.now() - startTime
            };
            
            // キャッシュに保存
            this.cache.set(cacheKey, result);
            this.lastUpdate.set(cacheKey, Date.now());
            
            // キャッシュサイズ制限
            this.limitCacheSize();
            
            console.log(`[LeaderboardManager] ページ読み込み完了: ${cacheKey} (${Math.round(result.loadTime)}ms)`);
            return result;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'LEADERBOARD_PAGINATION_ERROR', {
                type, period, page: options.page
            });
            throw error;
        }
    }
    
    /**
     * リーダーボードデータの非同期読み込み
     */
    async loadLeaderboardAsync(type, period) {
        return new Promise((resolve) => {
            // Web Workers が利用可能な場合はWorkerで処理
            // そうでなければsetTimeoutで非同期化
            setTimeout(() => {
                const leaderboard = this.getLeaderboard(type, period);
                resolve(leaderboard);
            }, 0);
        });
    }
    
    /**
     * エントリーの非同期ソート
     */
    async sortEntriesAsync(entries, sortBy, sortOrder) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const sorted = [...entries].sort((a, b) => {
                    let comparison = 0;
                    
                    switch (sortBy) {
                        case 'score':
                            comparison = (b.score || 0) - (a.score || 0);
                            break;
                        case 'date':
                            comparison = (b.timestamp || 0) - (a.timestamp || 0);
                            break;
                        case 'name':
                            comparison = (a.playerName || '').localeCompare(b.playerName || '');
                            break;
                        default:
                            comparison = (b.score || 0) - (a.score || 0);
                    }
                    
                    return sortOrder === 'asc' ? -comparison : comparison;
                });
                
                resolve(sorted);
            }, 0);
        });
    }
    
    /**
     * プレイヤーランクの非同期取得
     */
    async getPlayerRankAsync(entries, playerId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const playerIndex = entries.findIndex(entry => entry.playerId === playerId);
                resolve(playerIndex >= 0 ? {
                    rank: playerIndex + 1,
                    entry: entries[playerIndex]
                } : null);
            }, 0);
        });
    }
    
    /**
     * キャッシュサイズ制限 (Task 18.3)
     */
    limitCacheSize() {
        const maxCacheSize = 50; // 最大50エントリー
        
        if (this.cache.size > maxCacheSize) {
            // LRU (Least Recently Used) 方式でキャッシュを削除
            const entries = Array.from(this.lastUpdate.entries())
                .sort((a, b) => a[1] - b[1]) // 更新時刻でソート
                .slice(0, this.cache.size - maxCacheSize); // 削除対象を選択
                
            for (const [key] of entries) {
                this.cache.delete(key);
                this.lastUpdate.delete(key);
            }
            
            console.log(`[LeaderboardManager] キャッシュクリーンアップ: ${entries.length}エントリー削除`);
        }
    }
    
    /**
     * メモリ使用量監視 (Task 18.3)  
     */
    getMemoryUsage() {
        try {
            // キャッシュサイズの推定
            let cacheSize = 0;
            for (const [key, value] of this.cache.entries()) {
                cacheSize += JSON.stringify({key, value}).length * 2; // 文字ごとに2バイト
            }
            
            // リーダーボードデータサイズの推定
            let leaderboardSize = 0;
            for (const [key, value] of this.leaderboards.entries()) {
                leaderboardSize += JSON.stringify({key, value}).length * 2;
            }
            
            return {
                cache: {
                    entries: this.cache.size,
                    estimatedSizeBytes: cacheSize,
                    estimatedSizeKB: Math.round(cacheSize / 1024)
                },
                leaderboards: {
                    entries: this.leaderboards.size,
                    estimatedSizeBytes: leaderboardSize,
                    estimatedSizeKB: Math.round(leaderboardSize / 1024)
                },
                total: {
                    estimatedSizeBytes: cacheSize + leaderboardSize,
                    estimatedSizeKB: Math.round((cacheSize + leaderboardSize) / 1024)
                }
            };
        } catch (error) {
            console.warn('[LeaderboardManager] メモリ使用量計算エラー:', error);
            return null;
        }
    }
    
    /**
     * 高度なキャッシュ機能 (Task 18.4)
     */
    setupAdvancedCaching() {
        // プリローディング機能
        this.preloadCommonQueries();
        
        // 定期的なキャッシュ最適化
        setInterval(() => {
            this.optimizeCache();
        }, 5 * 60 * 1000); // 5分ごと
    }
    
    /**
     * よく使われるクエリのプリローディング
     */
    async preloadCommonQueries() {
        const commonQueries = [
            { type: 'global', period: 'all', page: 1, pageSize: 10 },
            { type: 'daily', period: 'today', page: 1, pageSize: 10 },
            { type: 'weekly', period: 'thisWeek', page: 1, pageSize: 10 }
        ];
        
        for (const query of commonQueries) {
            try {
                await this.getLeaderboardPaginated(query.type, query.period, {
                    page: query.page,
                    pageSize: query.pageSize
                });
            } catch (error) {
                console.warn(`[LeaderboardManager] プリローディング失敗: ${query.type}/${query.period}`);
            }
        }
        
        console.log('[LeaderboardManager] 共通クエリのプリローディング完了');
    }
    
    /**
     * キャッシュ最適化
     */
    optimizeCache() {
        // 期限切れキャッシュの削除
        const now = Date.now();
        let expiredCount = 0;
        
        for (const [key, updateTime] of this.lastUpdate.entries()) {
            if (now - updateTime > this.config.cacheTTL) {
                this.cache.delete(key);
                this.lastUpdate.delete(key);
                expiredCount++;
            }
        }
        
        if (expiredCount > 0) {
            console.log(`[LeaderboardManager] 期限切れキャッシュを${expiredCount}件削除`);
        }
        
        // キャッシュサイズ制限
        this.limitCacheSize();
    }
    
    /**
     * 非同期バックグラウンド保存 (Task 18.1)
     */
    async saveAsync() {
        return new Promise((resolve, reject) => {
            // setTimeoutで非同期化してUIをブロックしない
            setTimeout(async () => {
                try {
                    await this.save();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }, 0);
        });
    }
    
    /**
     * パフォーマンス統計の拡張 (Task 18.3)
     */
    getPerformanceStats() {
        const memoryUsage = this.getMemoryUsage();
        
        return {
            ...this.stats,
            memory: memoryUsage,
            cache: {
                size: this.cache.size,
                hitRate: this.stats.cacheHits > 0 ? 
                    this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) : 0,
                hits: this.stats.cacheHits,
                misses: this.stats.cacheMisses
            },
            performance: {
                averageLoadTime: this.stats.dataLoadTime,
                totalSaves: this.stats.saveCount,
                validationErrors: this.stats.validationErrors
            }
        };
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.cache.clear();
        this.lastUpdate.clear();
        console.log('[LeaderboardManager] クリーンアップ完了');
    }
}