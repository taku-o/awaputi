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
            
            // 各リーダーボードに記録
            await this.updateLeaderboards(scoreEntry);
            
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
     * クリーンアップ
     */
    cleanup() {
        this.cache.clear();
        console.log('[LeaderboardManager] クリーンアップ完了');
    }
}