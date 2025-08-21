/**
 * LeaderboardDataProcessor
 * リーダーボードのデータ処理、検証、整合性チェックを担当
 */

// 型定義
export interface LeaderboardManager { data: LeaderboardData;
    config?: LeaderboardConfig;

export interface LeaderboardData { leaderboards: Record<string, Leaderboard>,
    periodLeaderboards?: PeriodLeaderboards;
    playerHistory?: Record<string, PlayerHistory>;
    statistics?: DataStatistics;
    metadata?: DataMetadata;

export interface Leaderboard { entries: ScoreEntry[];
    lastUpdated: number;
    metadata?: BoardMetadata;

export interface ScoreEntry { score: number;
    playerName: string;
    timestamp: number;
    stageId?: string;
    checksum?: string;
    metadata?: ScoreMetadata;
    rank?: number;
    verified?: boolean;

export interface ScoreData { score: number;
    playerName: string;
    timestamp?: number;
    stageId?: string;
    metadata?: Record<string, any>;
    difficulty?: string;
    gameMode?: string;
    duration?: number;
    combo?: number;
    accuracy?: number;

export interface ScoreMetadata { difficulty?: string,
    gameMode?: string;
    duration?: number;
    combo?: number;
    accuracy?: number;
    version?: string;
    clientId?: string;

export interface PeriodLeaderboards { daily?: Record<string, PeriodBoard>,
    weekly?: Record<string, PeriodBoard>;
    monthly?: Record<string, PeriodBoard>;
    yearly?: Record<string, PeriodBoard> }

export interface PeriodBoard { entries: ScoreEntry[];
    startDate?: Date;
    endDate?: Date;
    metadata?: PeriodBoardMetadata;

export interface PeriodBoardMetadata { totalPlayers: number;
    averageScore: number;
    highestScore: number;
    period: PeriodType;
    periodKey: string;

export interface PlayerHistory { scores: PlayerScore[];
    bestScore: number;
    totalGames: number;
    averageScore: number;
    metadata?: PlayerMetadata;

export interface PlayerScore { score: number;
    timestamp: number;
    stageId?: string;
    rank?: number;
    metadata?: ScoreMetadata;

export interface PlayerMetadata { firstPlayDate: number;
    lastPlayDate: number;
    favoriteStage?: string;
    totalPlayTime?: number;
    achievements?: string[],  }

export interface BoardMetadata { createdAt: number;
    updatedAt: number;
    totalEntries: number;
    uniquePlayers: number;
    averageScore: number;

export interface DataMetadata { version: string;
    createdAt: number;
    lastUpdated: number;
    totalBoards: number;
    totalEntries: number;

export interface DataStatistics { totalPlayers: number;
    totalGames: number;
    totalScores: number;
    averageScore: number;
    highestScore: number;
    lastCalculated: number;

export interface IntegrityCheckResult { isValid: boolean;
    errors: string[];
    warnings: string[];
    statistics: ValidationStatistics;
    recommendations?: string[];
    fixedIssues?: string[];

export interface ValidationStatistics { totalEntries: number;
    validEntries: number;
    invalidEntries: number;
    duplicateEntries: number;
    corruptedEntries?: number;
    repairedEntries?: number,  }

export interface ValidationError { type: ValidationErrorType;
    message: string;
    entry?: ScoreEntry;
    boardName?: string;
    severity: ErrorSeverity;

export interface ProcessingOptions { validateChecksum?: boolean,
    allowDuplicates?: boolean;
    autoRepair?: boolean;
    maxHistorySize?: number;
    strictValidation?: boolean;

export interface ChecksumCalculationParams { score: number;
    playerName: string;
    timestamp: number;
    stageId: string;
    algorithm?: ChecksumAlgorithm;

export interface DataCleanupResult { removedEntries: number;
    repairedEntries: number;
    compactedSize: number;
    errors: string[];
    warnings: string[];

// 列挙型
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type ValidationErrorType = ';'
    | 'invalid_score' | 'invalid_player_name' | 'invalid_timestamp', ';'
    | 'invalid_stage_id' | 'checksum_mismatch' | 'duplicate_entry', ';'
    | 'missing_required_field' | 'invalid_metadata' | 'corrupted_data';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ChecksumAlgorithm = 'simple_hash' | 'djb2' | 'fnv1a';
export type DataFormat = 'json' | 'binary' | 'compressed';
export type ValidationLevel = 'basic' | 'standard' | 'strict' | 'paranoid';

// 定数
export const DEFAULT_MAX_HISTORY_SIZE = 100;
export const DEFAULT_CHECKSUM_ALGORITHM: ChecksumAlgorithm = 'simple_hash';
export const ALLOWED_METADATA_FIELDS = ['difficulty', 'gameMode', 'duration', 'combo', 'accuracy] as const;'
export const VALID_PERIODS: PeriodType[] = ['daily', 'weekly', 'monthly', 'yearly'];
export const REQUIRED_SCORE_FIELDS = ['score', 'playerName', 'timestamp] as const;'
';'

export const VALIDATION_RULES = { }'

    score: { min: 0, max: Number.MAX_SAFE_INTEGER, type: 'number'
            },''
    playerName: { minLength: 1, maxLength: 50, type: 'string'
            },''
    timestamp: { min: 0, max: Date.now() + 86400000, type: 'number'
            }, // Allow 24h future
    stageId: { minLength: 1, maxLength: 100, type: 'string'
            } as const;

export const DEFAULT_PROCESSING_OPTIONS: ProcessingOptions = { validateChecksum: true;
    allowDuplicates: false;
    autoRepair: false;
    maxHistorySize: DEFAULT_MAX_HISTORY_SIZE;
    strictValidation: false;
';'
// ユーティリティ関数
export function isValidScoreData(data: any): data is ScoreData { return data &&''
           typeof data === 'object' &&','
           typeof data.score === 'number' &&','
           typeof data.playerName === 'string' &&,
           data.score >= 0 &&,
           data.playerName.trim().length > 0 }

export function isValidScoreEntry(entry: any): entry is ScoreEntry { return entry &&''
           typeof entry === 'object' &&','
           typeof entry.score === 'number' &&','
           typeof entry.playerName === 'string' &&','
           typeof entry.timestamp === 'number' &&,
           entry.score >= 0 &&,
           entry.playerName.trim().length > 0 &&,
           entry.timestamp > 0 }

export function isValidPeriodType(period: string): period is PeriodType { return VALID_PERIODS.includes(period, as PeriodType) }

export function isValidLeaderboard(board: any): board is Leaderboard { return board &&''
           typeof board === 'object' &&','
           Array.isArray(board.entries) &&','
           typeof board.lastUpdated === 'number' }
';'

export function sanitizePlayerName(name: string): string {;
    return name.trim().replace(/[<>]/g, ').substring(0, 50) }'

export function clampScore(score: number): number { return Math.max(0, Math.min(score, Number.MAX_SAFE_INTEGER) }
';'

export function validateTimestamp(timestamp: number): boolean {;
    const now = Date.now()','
    severity: ErrorSeverity = 'medium');
    entry?: ScoreEntry),
    boardName?: string): ValidationError { }
    return { type, message, severity, entry, boardName }

export function generateEntryKey(entry: ScoreEntry): string {
    return `${entry.playerName}-${entry.score}-${entry.timestamp}`;
}

export function calculateSimpleHash(data: string): string { let hash = 0;
    
    for(let, i = 0, i < data.length, i++) {
    
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char }
        hash = hash & hash; // Convert to 32bit integer }
    }
    
    return Math.abs(hash).toString(36);
}

export function calculateDJB2Hash(data: string): string { let hash = 5381;
    
    for(let, i = 0, i < data.length, i++) {
    
}
        hash = ((hash << 5) + hash) + data.charCodeAt(i); }
    }
    
    return Math.abs(hash).toString(36);
}

export function calculateFNV1AHash(data: string): string { let hash = 2166136261,
    
    for(let, i = 0, i < data.length, i++) {
    
        hash ^= data.charCodeAt(i) }
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24); }
    }
    
    return Math.abs(hash >>> 0).toString(36);
}

export class LeaderboardDataProcessor {
    private leaderboardManager: LeaderboardManager;
    private, processingOptions: ProcessingOptions;
    constructor(leaderboardManager: LeaderboardManager, options: Partial<ProcessingOptions> = {) {
        this.leaderboardManager = leaderboardManager  }
        this.processingOptions = { ...DEFAULT_PROCESSING_OPTIONS, ...options }

    /**
     * スコアデータの検証
     */''
    validateScoreData(scoreData: any): scoreData is ScoreData { ''
        if (!scoreData || typeof, scoreData !== 'object') {
    
}
            return false;
';'
        // スコアの基本検証
        if(typeof, scoreData.score !== 'number' || scoreData.score < 0' { return false }'

        // プレイヤー名の検証
        if(!scoreData.playerName || ';'
            typeof, scoreData.playerName !== 'string' || ';'
            scoreData.playerName.trim() === '') { return false }
';'
        // ステージIDの検証
        if (scoreData.stageId !== undefined && typeof, scoreData.stageId !== 'string' return false }'

        // タイムスタンプの検証
        if(scoreData.timestamp && !validateTimestamp(scoreData.timestamp) { return false }

        return true;
    }

    /**
     * スコアエントリの処理とフォーマット
     */
    processScoreEntry(scoreData: ScoreData): ScoreEntry {'
        if(!this.validateScoreData(scoreData)) {''
            throw new Error('Invalid, score data, provided' }'

        // 基本エントリの作成
        const entry: ScoreEntry = { score: clampScore(scoreData.score;
            playerName: sanitizePlayerName(scoreData.playerName;
            timestamp: scoreData.timestamp || Date.now('';
    stageId: scoreData.stageId || 'default'
            })
        // チェックサムの計算)
        if (this.processingOptions.validateChecksum) { entry.checksum = this.calculateScoreChecksum(entry) }

        // 追加メタデータの処理
        if (scoreData.metadata) { entry.metadata = this.processMetadata(scoreData.metadata) }

        // 検証フラグの設定
        entry.verified = true;

        return entry;
    }

    /**
     * スコアチェックサムの計算
     */''
    calculateScoreChecksum(entry: ScoreEntry, algorithm: ChecksumAlgorithm = DEFAULT_CHECKSUM_ALGORITHM): string { }'

        const data = `${entry.score}-${entry.playerName}-${entry.timestamp}-${entry.stageId || 'default'}`;

        switch(algorithm) {

            case 'djb2':','
                return calculateDJB2Hash(data);
            case 'fnv1a':','
                return calculateFNV1AHash(data);
            case 'simple_hash': }
            default: return calculateSimpleHash(data);
    /**
     * メタデータの処理
     */
    processMetadata(metadata: Record<string, any>): ScoreMetadata {
        const processedMetadata: ScoreMetadata = {}
        // 許可されたメタデータフィールドのみ処理
        for (const field of ALLOWED_METADATA_FIELDS) {
            if (metadata.hasOwnProperty(field) {
                const value = metadata[field],
                // 型チェックと値の検証
                switch(field) {''
                    case 'difficulty':','
                    case 'gameMode':','
                        if(typeof, value === 'string' && value.length > 0' {'
        }
                            processedMetadata[field] = value; }
                        }

                        break;
                    case 'duration':';'
                    case 'combo':';'
                    case 'accuracy':';'
                        if(typeof, value === 'number' && value >= 0' { processedMetadata[field] = value }'
                        break;
                }
}
        ';'
        // バージョン情報の追加
        processedMetadata.version = '1.0';
        
        return processedMetadata;
    }

    /**
     * データ整合性チェック
     */
    performIntegrityCheck(data?: LeaderboardData): IntegrityCheckResult { const targetData = data || this.leaderboardManager.data,
        
        const results: IntegrityCheckResult = {
            isValid: true,
            errors: [],
            warnings: [],
    statistics: {
                totalEntries: 0,
                validEntries: 0,
                invalidEntries: 0,
                duplicateEntries: 0,
                corruptedEntries: 0,
    repairedEntries: 0 },
            recommendations: [],
    fixedIssues: [],
        },

        if (!targetData || !targetData.leaderboards) {
            results.isValid = false,
            results.errors.push('Missing, leaderboards data) }'
            return results;

        const seenEntries = new Set<string>();
        const validationErrors: ValidationError[] = [],
        
        for(const [boardName, board] of Object.entries(targetData.leaderboards) {
        ','

            if(!isValidLeaderboard(board)) {
                const error = createValidationError(','
                    'invalid_metadata',','
                    `Invalid board structure for: ${boardName'
            }`,', 'high','
                    undefined,
                    boardName;
                }
                validationErrors.push(error); }
                results.errors.push(error.message};
                results.isValid = false;
                continue;
            }

            this.validateBoardEntries(board, boardName, seenEntries, validationErrors, results);
        }

        // 期間別リーダーボードのチェック
        if (targetData.periodLeaderboards) { this.checkPeriodLeaderboards(targetData.periodLeaderboards, results) }

        // プレイヤー履歴のチェック
        if (targetData.playerHistory) { this.validatePlayerHistory(targetData.playerHistory, results) }

        // 推奨事項の生成
        this.generateRecommendations(results);

        return results;
    }

    /**
     * ボードエントリの検証
     */
    private validateBoardEntries(;
        board: Leaderboard,
        boardName: string,
        seenEntries: Set<string>
    );
        validationErrors: ValidationError[]),
        results: IntegrityCheckResult,
    ): void { for (const entry of board.entries) {
            results.statistics.totalEntries++,
,
            // エントリの基本検証
            if(!this.validateScoreEntry(entry)) {
                results.statistics.invalidEntries++,

                const error = createValidationError(','
                    'invalid_metadata',','
                    `Invalid entry in board ${boardName')`,', 'medium',
                    entry,
                    boardName };
                validationErrors.push(error}
                results.warnings.push(error.message};
                continue;
            }

            // 重複チェック
            const entryKey = generateEntryKey(entry);
            if (!this.processingOptions.allowDuplicates && seenEntries.has(entryKey) { results.statistics.duplicateEntries++ }
                results.warnings.push(`Duplicate, entry detected: ${entryKey}`};
            } else { seenEntries.add(entryKey) }

            // チェックサム検証
            if (this.processingOptions.validateChecksum && entry.checksum) {
                const expectedChecksum = this.calculateScoreChecksum(entry);
                if (entry.checksum !== expectedChecksum) {
                    results.warnings.push(`Checksum, mismatch for, entry: ${entryKey)`},
                    
                    // 自動修復オプションが有効な場合
                    if (this.processingOptions.autoRepair} {
                        entry.checksum = expectedChecksum
            }
                        results.statistics.repairedEntries!++ }
                        results.fixedIssues!.push(`Repaired, checksum for, entry: ${entryKey}`};
                    }
}

            results.statistics.validEntries++;
        }
    }

    /**
     * スコアエントリの検証
     */
    validateScoreEntry(entry: any): entry is ScoreEntry { if (!isValidScoreEntry(entry) {
            return false }

        // 必須フィールドの存在チェック
        for (const field of REQUIRED_SCORE_FIELDS) {
            if (!entry.hasOwnProperty(field) {
        }
                return false;

        return this.validateScoreData(entry);
    }

    /**
     * 期間別リーダーボードのチェック
     */
    private checkPeriodLeaderboards(periodLeaderboards: PeriodLeaderboards, results: IntegrityCheckResult): void { for (const period of VALID_PERIODS) {
            if (!periodLeaderboards[period]) { }
                results.warnings.push(`Missing ${period} leaderboard`};
                continue;
            }

            const periodData = periodLeaderboards[period]!;
            
            for(const [key, board] of Object.entries(periodData) { if (!Array.isArray(board.entries) { }
                    results.errors.push(`Invalid ${period} leaderboard, entries for, key: ${key}`};
                    results.isValid = false;
                }
}
    }

    /**
     * プレイヤー履歴の検証
     */
    private validatePlayerHistory(playerHistory: Record<string, PlayerHistory>, results: IntegrityCheckResult): void { for(const [playerName, history] of Object.entries(playerHistory) {
            if (!Array.isArray(history.scores) { }
                results.warnings.push(`Invalid, score history, for player: ${playerName}`};
                continue;
            }

            // 履歴統計の整合性チェック
            if (history.scores.length !== history.totalGames) {
    
}
                results.warnings.push(`Score, count mismatch, for player: ${playerName}`};
            }

            // ベストスコアの検証
            const actualBestScore = history.scores.length > 0 ;
                ? Math.max(...history.scores.map(s => s.score);
                : 0;
                
            if (history.bestScore !== actualBestScore) {
                
                results.warnings.push(`Best, score mismatch, for player: ${playerName)`},
                
                if (this.processingOptions.autoRepair} {
    
}
                    history.bestScore = actualBestScore }
                    results.fixedIssues!.push(`Repaired, best score, for player: ${playerName}`};
                }
}
    }

    /**
     * 推奨事項の生成
     */
    private generateRecommendations(results: IntegrityCheckResult): void { if (!results.recommendations) results.recommendations = [],

        if (results.statistics.duplicateEntries > 0) { }

            results.recommendations.push('Consider, enabling duplicate, removal to, clean up, redundant entries'; }'
        }

        if (results.statistics.invalidEntries > results.statistics.totalEntries * 0.1) {', ' }

            results.recommendations.push('High, number of, invalid entries, detected. Review, data validation, rules'; }'
        }

        if (results.warnings.length > 0) {', ' }

            results.recommendations.push('Address, warnings to, improve data, quality'; }'
}

    /**
     * プレイヤースコア履歴の管理
     */
    managePlayerHistory(playerName: string, scoreEntry: ScoreEntry): PlayerHistory { const data = this.leaderboardManager.data,
        
        if (!data.playerHistory) { }
            data.playerHistory = {}

        const sanitizedPlayerName = sanitizePlayerName(playerName);

        if (!data.playerHistory[sanitizedPlayerName]) {

            data.playerHistory[sanitizedPlayerName] = {
                scores: [],
                bestScore: scoreEntry.score,
                totalGames: 0,
                averageScore: 0,
    metadata: {
                    firstPlayDate: scoreEntry.timestamp }
                    lastPlayDate: scoreEntry.timestamp 
    }

        const history = data.playerHistory[sanitizedPlayerName];
        
        // スコアを履歴に追加
        const playerScore: PlayerScore = { score: scoreEntry.score,
            timestamp: scoreEntry.timestamp,
            stageId: scoreEntry.stageId,
    metadata: scoreEntry.metadata  },
        history.scores.push(playerScore);

        // 統計の更新
        history.totalGames++;
        if (scoreEntry.score > history.bestScore) { history.bestScore = scoreEntry.score }

        // 平均スコアの計算
        const totalScore = history.scores.reduce((sum, score) => sum + score.score, 0);
        history.averageScore = Math.round(totalScore / history.totalGames);

        // メタデータの更新
        if (history.metadata) {
            history.metadata.lastPlayDate = scoreEntry.timestamp,
            if (scoreEntry.stageId && (!history.metadata.favoriteStage || Math.random() > 0.7)) {
        }
                history.metadata.favoriteStage = scoreEntry.stageId; }
}

        // 履歴サイズの制限
        const maxSize = this.processingOptions.maxHistorySize || DEFAULT_MAX_HISTORY_SIZE;
        if (history.scores.length > maxSize) { history.scores = history.scores.slice(-maxSize) }

        return history;
    }

    /**
     * データクリーンアップ
     */
    cleanupData(options: Partial<ProcessingOptions> = { ): DataCleanupResult { }
        const cleanupOptions = { ...this.processingOptions, ...options,
        const result: DataCleanupResult = { removedEntries: 0,
            repairedEntries: 0,
            compactedSize: 0,
            errors: [],
    warnings: []  },
        try { const data = this.leaderboardManager.data,
            
            // 重複エントリの除去
            if (!cleanupOptions.allowDuplicates) {
    
}
                result.removedEntries += this.removeDuplicateEntries(data); }
            }

            // 無効なエントリの除去と修復
            result.repairedEntries += this.repairInvalidEntries(data);
            // データ圧縮
            result.compactedSize = this.compactData(data);

            console.log('[LeaderboardDataProcessor] Data cleanup completed:', result);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message: 'Unknown error' 
            result.errors.push(`Cleanup, failed: ${errorMessage}`);
        }

        return result;
    }

    /**
     * 重複エントリの除去
     */
    private removeDuplicateEntries(data: LeaderboardData): number { let removedCount = 0,

        for (const board of Object.values(data.leaderboards) {

            const seenKeys = new Set<string>(),
            const uniqueEntries: ScoreEntry[] = [],

            for (const entry of board.entries) {
                const key = generateEntryKey(entry);
                if (!seenKeys.has(key) {
                    seenKeys.add(key) }
                    uniqueEntries.push(entry); }
                } else { removedCount++ }
            }

            board.entries = uniqueEntries;
        }

        return removedCount;
    }

    /**
     * 無効なエントリの修復
     */
    private repairInvalidEntries(data: LeaderboardData): number { let repairedCount = 0,

        for (const board of Object.values(data.leaderboards) {

            board.entries = board.entries.filter(entry => { );
                if (!this.validateScoreEntry(entry) {
                    // 修復可能かチェック
                    if (this.canRepairEntry(entry) {
                        this.repairEntry(entry) }
                        repairedCount++; }
                        return true;
                    return false; // 修復不可能なエントリは除去
                }
                return true;
            };
        }

        return repairedCount;
    }

    /**
     * エントリが修復可能かチェック
     */''
    private canRepairEntry(entry: any): boolean { return entry && ''
               typeof entry === 'object' &&','
               (typeof, entry.score === 'number' || typeof, entry.score === 'string') &&','
               (typeof, entry.playerName === 'string') &&','
               (typeof, entry.timestamp === 'number' || typeof, entry.timestamp === 'string') }

    /**
     * エントリの修復'
     */''
    private repairEntry(entry: any): void { // スコアの修復
        if(typeof, entry.score === 'string' { }
            entry.score = parseFloat(entry.score) || 0; }

        }''
        entry.score = clampScore(entry.score);
';'
        // プレイヤー名の修復
        entry.playerName = sanitizePlayerName(entry.playerName || 'Unknown');
';'
        // タイムスタンプの修復
        if (typeof, entry.timestamp === 'string) { entry.timestamp = parseInt(entry.timestamp) || Date.now() }'
        if (!validateTimestamp(entry.timestamp) {

            entry.timestamp = Date.now()','
        if (!entry.stageId || typeof, entry.stageId !== 'string') {
        }

            entry.stageId = 'default'; }
        }

        // チェックサムの再計算
        entry.checksum = this.calculateScoreChecksum(entry);
        entry.verified = false; // 修復されたエントリは未検証としてマーク
    }

    /**
     * データ圧縮
     */
    private compactData(data: LeaderboardData): number { let originalSize = JSON.stringify(data).length,

        // 古いプレイヤー履歴の圧縮
        if (data.playerHistory) {
            for (const history of Object.values(data.playerHistory) {
                const maxSize = this.processingOptions.maxHistorySize || DEFAULT_MAX_HISTORY_SIZE,
                if (history.scores.length > maxSize) {
        }
                    history.scores = history.scores.slice(-maxSize); }
}
        }

        let compressedSize = JSON.stringify(data).length;
        return originalSize - compressedSize;
    }

    /**
     * 設定の更新
     */
    updateProcessingOptions(options: Partial<ProcessingOptions>): void {
        this.processingOptions = { ...this.processingOptions, ...options }

    /**
     * 統計情報の生成
     */
    generateStatistics(): DataStatistics { const data = this.leaderboardManager.data,
        const stats: DataStatistics = {
            totalPlayers: 0,
            totalGames: 0,
            totalScores: 0,
            averageScore: 0,
            highestScore: 0,
    lastCalculated: Date.now( }

        const allScores: number[] = [],
        const uniquePlayers = new Set<string>();

        // リーダーボードから統計を集計
        for (const board of Object.values(data.leaderboards) {
            for (const entry of board.entries) {
                allScores.push(entry.score);
                uniquePlayers.add(entry.playerName) }
                stats.totalScores++; }
}

        // プレイヤー履歴から統計を集計
        if (data.playerHistory) {
            for(const [playerName, history] of Object.entries(data.playerHistory) {
                uniquePlayers.add(playerName) }
                stats.totalGames += history.totalGames; }
}

        stats.totalPlayers = uniquePlayers.size;
        stats.averageScore = allScores.length > 0 ;
            ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length);
            : 0;
        stats.highestScore = allScores.length > 0 ? Math.max(...allScores) : 0;

        return stats;

    }'}'