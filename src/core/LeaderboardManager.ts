import { getErrorHandler } from '../utils/ErrorHandler.js';''
import { LeaderboardDataProcessor } from './leaderboard/LeaderboardDataProcessor.js';''
import { LeaderboardRankingManager } from './leaderboard/LeaderboardRankingManager.js';''
import { LeaderboardStorageManager } from './leaderboard/LeaderboardStorageManager.js';

export interface LeaderboardConfig { maxEntries: number,
    maxPeriodEntries: number,
    maxCacheSize: number,
    cacheMaxAge: number,
    dataVersion: string,
    validationEnabled: boolean,
    backupEnabled: boolean; }
}

export interface LeaderboardEntry { id: string,
    score: number,
    timestamp: number,
    playerName?: string;
    gameData?: any; }
}

/**
 * リーダーボード管理システム（Main Controller）
 * 各サブコンポーネントを統制し、公開APIを提供
 */
export class LeaderboardManager {'
    '';
    constructor(gameEngine') {
        this.gameEngine = gameEngine;
        
        // 基本設定
        this.config = {
            maxEntries: 100,
            maxPeriodEntries: 50,
            maxCacheSize: 100,';
            cacheMaxAge: 300000, // 5分'';
            dataVersion: '1.0.0',
            validationEnabled: true,
    }
    }
            backupEnabled: true }
        },'
'';
        this.storageKey = 'awaputi_leaderboards';''
        this.version = '1.0.0';
        
        // データ構造
        this.data = {
            leaderboards: {},
            periodLeaderboards: {},
            playerHistory: {},
            lastUpdated: Date.now(),
            version: this.version;
        },
        
        // パフォーマンス統計
        this.stats = { dataLoadTime: 0,
            saveCount: 0,
            validationErrors: 0,
            operationCount: 0,
            lastReset: Date.now(); }
        };
        
        // サブコンポーネントの初期化
        this.dataProcessor = new LeaderboardDataProcessor(this);'
        this.rankingManager = new LeaderboardRankingManager(this);''
        this.storageManager = new LeaderboardStorageManager(this');'
        '';
        console.log('[LeaderboardManager] Main Controller initialized');
    }

    /**
     * システム初期化'
     */''
    async initialize('')';
            console.log('[LeaderboardManager] Initializing...');
            const startTime = performance.now();
            
            // データの読み込み
            const loadSuccess = await this.storageManager.load();
            
            // 高度なキャッシュ設定
            this.storageManager.setupAdvancedCaching();
            
            // 定期クリーンアップの設定
            this.setupPeriodicCleanup();
            
            // 共通クエリの事前ロード
            await this.storageManager.preloadCommonQueries();
            
            this.stats.dataLoadTime = performance.now() - startTime;
            
            console.log(`[LeaderboardManager] Initialized successfully in ${this.stats.dataLoadTime.toFixed(2})}ms`);'
            return loadSuccess;''
        } catch (error') { ''
            this.handleError(error, 'INITIALIZATION_ERROR');
            return false; }
        }
    }

    /**
     * スコアの記録
     * @param {Object} scoreData スコアデータ
     * @returns {Promise<boolean>} 記録成功可否
     */
    async recordScore(scoreData) { try {
            this.stats.operationCount++;
            
            // データ処理と検証
            const processedEntry = this.dataProcessor.processScoreEntry(scoreData);
            ';
            // プレイヤー履歴の管理''
            this.dataProcessor.managePlayerHistory(processedEntry.playerName, processedEntry');
            ';
            // ランキングの更新''
            const leaderboardKey = scoreData.leaderboardType || 'global';
            this.rankingManager.updateLeaderboards(leaderboardKey, processedEntry);
            
            // 期間別ランキングの更新
            this.rankingManager.updatePeriodLeaderboards(processedEntry);
            
            // データの保存
            await this.storageManager.saveAsync();
             }
            console.log(`[LeaderboardManager] Score recorded: ${processedEntry.score} for ${processedEntry.playerName)`});'
            return true;''
        } catch (error') { ' }'
            this.handleError(error, 'RECORD_SCORE_ERROR', { scoreData });
            return false;
        }
    }

    /**
     * スコアの追加（既存API互換性）
     * @param {string} leaderboardType リーダーボードタイプ
     * @param {Object} scoreData スコアデータ
     * @returns {Promise<boolean>} 追加成功可否
     */
    async addScore(leaderboardType, scoreData) { const enhancedScoreData = {
            ...scoreData,
            leaderboardType: leaderboardType }
        },'
        '';
        return await this.recordScore(enhancedScoreData');
    }

    /**
     * リーダーボードの取得
     * @param {string} leaderboardType リーダーボードタイプ
     * @param {number} limit 取得数制限
     * @returns {Array} リーダーボードデータ'
     */''
    getLeaderboard(leaderboardType = 'global', limit = 10) {
        try {
            this.stats.operationCount++;
            
    }
            // キャッシュ確認 }
            const cacheKey = `leaderboard_${leaderboardType}_${limit}`;
            const cached = this.storageManager.getCachedLeaderboard(cacheKey);
            
            if (cached) { return cached; }
            }
            
            const leaderboard = this.data.leaderboards[leaderboardType];
            
            if (!leaderboard || !leaderboard.entries) { return []; }
            }
            
            const result = leaderboard.entries.slice(0, limit).map((entry, index) => ({ ...entry)
                rank: index + 1 }
            }),
            
            // 結果をキャッシュ
            this.storageManager.cacheLeaderboard(cacheKey, result);
            ';
            return result;''
        } catch (error') { ' }'
            this.handleError(error, 'GET_LEADERBOARD_ERROR', { leaderboardType, limit });
            return [];
        }
    }

    /**
     * プレイヤーランキングの取得
     * @param {string} playerName プレイヤー名
     * @returns {Object} プレイヤーランキング情報
     */
    getPlayerRankings(playerName) { try { }
            const rankings = {};
            
            for(const [boardType, board] of Object.entries(this.data.leaderboards) {
            
                if (board.entries) {
                    const playerIndex = board.entries.findIndex(entry => entry.playerName === playerName);
            
            }
                    rankings[boardType] = playerIndex >= 0 ? playerIndex + 1 : null; }
                }
            }
            ';
            return rankings;''
        } catch (error') { ' }'
            this.handleError(error, 'GET_PLAYER_RANKINGS_ERROR', { playerName });
            return {};
        }
    }

    /**
     * プレイヤースコアの記録
     * @param {string} playerName プレイヤー名
     * @param {Object} scoreData スコアデータ
     * @returns {Promise<boolean>} 記録成功可否
     */
    async recordPlayerScore(playerName, scoreData) { const enhancedScoreData = {
            ...scoreData,
            playerName: playerName }
        },
        
        return await this.recordScore(enhancedScoreData);
    }

    /**
     * 期間別ランキングの取得
     * @param {string} period 期間タイプ
     * @param {number} limit 取得数制限
     * @returns {Array} 期間別ランキング
     */
    getPeriodRanking(period, limit = 10) {
        try {
    }'
            return this.rankingManager.getPeriodRanking(period, limit);' }'
        } catch (error') { ' }'
            this.handleError(error, 'GET_PERIOD_RANKING_ERROR', { period, limit });
            return [];
        }
    }

    /**
     * 期間統計の取得
     * @param {string} period 期間タイプ
     * @returns {Object} 統計データ
     */
    getPeriodStats(period) {
        try {
    }'
            return this.rankingManager.getPeriodStats(period);' }'
        } catch (error') { ' }'
            this.handleError(error, 'GET_PERIOD_STATS_ERROR', { period });
            return { totalPlayers: 0, totalScores: 0, averageScore: 0, highestScore: 0, period };
        }
    }

    /**
     * データの保存
     * @returns {Promise<boolean>} 保存成功可否
     */
    async save() { try {
            this.stats.saveCount++;'
            return await this.storageManager.save();' }'
        } catch (error') { ''
            this.handleError(error, 'SAVE_ERROR');
            return false; }
        }
    }

    /**
     * データのロード
     * @returns {Promise<boolean>} ロード成功可否
     */
    async load() { try {'
            return await this.storageManager.load();' }'
        } catch (error') { ''
            this.handleError(error, 'LOAD_ERROR');
            return false; }
        }
    }

    /**
     * 整合性チェックの実行
     * @returns {Object} チェック結果
     */
    performIntegrityCheck() {
        try {
    }'
            return this.dataProcessor.performIntegrityCheck(this.data);' }'
        } catch (error') { ''
            this.handleError(error, 'INTEGRITY_CHECK_ERROR'');' }'
            return { isValid: false, errors: ['Integrity check failed'], warnings: [], statistics: {} }
        }
    }

    /**
     * 統計情報の取得
     * @returns {Object} 統計情報
     */
    getStats() {
        return { ...this.stats,
            memoryUsage: this.storageManager.getMemoryUsage(),
    }
            dataSize: Object.keys(this.data.leaderboards).length, };
            totalEntries: Object.values(this.data.leaderboards).reduce((sum, board) => sum + (board.entries? .length || 0), 0); }
        };
    }

    /**
     * システムのリセット
     * @returns {Promise<boolean>} リセット成功可否
     */
    async reset() { try {
            this.storageManager.initializeEmptyData();'
            await this.storageManager.save();''
            this.resetStats('')';
            console.log('[LeaderboardManager] System reset completed');'
            return true;' }'
        } catch (error') { ''
            this.handleError(error, 'RESET_ERROR');
            return false; }
        }
    }

    /**
     * デフォルトリーダーボードの初期化'
     */''
    initializeDefaultLeaderboards(''';
        const defaultBoards = ['global', 'daily', 'weekly', 'monthly'];
        );
        for (const boardType of defaultBoards) {
        if (!this.data.leaderboards[boardType]) {
                this.data.leaderboards[boardType] = { : undefined'
                    entries: [],'';
                    lastUpdated: Date.now('');
    }'
        console.log('[LeaderboardManager] Default leaderboards initialized'), }
    }

    /**
     * 定期クリーンアップの設定
     */
    setupPeriodicCleanup() {
        setInterval(() => { 
    }
            this.storageManager.cleanupExpiredPeriodEntries(); }
            this.storageManager.optimizeCache(); }
        }, 3600000); // 1時間ごと
    }

    /**
     * 関連キャッシュのクリア
     * @param {string} leaderboardKey リーダーボードキー
     */
    clearRelevantCache(leaderboardKey) { this.storageManager.clearRelevantCache(leaderboardKey); }
    }

    /**
     * 統計のリセット
     */
    resetStats() {
        this.stats = {
            dataLoadTime: 0,
            saveCount: 0,
            validationErrors: 0,
            operationCount: 0,
    }
            lastReset: Date.now(); }
        };
    }

    /**
     * パフォーマンス統計の取得
     * @returns {Object} パフォーマンス統計
     */
    getPerformanceStats() {
        const uptime = Date.now() - this.stats.lastReset;
        return { ...this.stats,
            uptime: uptime,
    }
            operationsPerMinute: this.stats.operationCount / (uptime / 60000), };
            averageOperationTime: this.stats.dataLoadTime / Math.max(this.stats.operationCount, 1); }
        };
    }

    /**
     * クリーンアップ
     */
    cleanup() {'
        '';
        this.storageManager.optimizeCache('');
    }'
        console.log('[LeaderboardManager] Cleanup completed'); }
    }

    /**
     * エラーハンドリング
     * @param {Error} error エラーオブジェクト
     * @param {string} context エラーコンテキスト
     * @param {Object} data 関連データ
     */
    handleError(error, context, data = { ) {
        this.stats.validationErrors++;
        ';
        const errorHandler = getErrorHandler();''
        if (errorHandler') {'
            errorHandler.handleError(error, context, {')'
                component: 'LeaderboardManager',);
    }
                ...data); }
        } else {  }
            console.error(`[LeaderboardManager] ${context):`, error, data});
        }
    }
}

// シングルトンインスタンス
let leaderboardManagerInstance = null;

/**
 * LeaderboardManagerシングルトンインスタンスの取得
 */'
export function getLeaderboardManager() { if (!leaderboardManagerInstance) {''
        leaderboardManagerInstance = new LeaderboardManager(' })