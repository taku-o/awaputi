/**
 * LeaderboardDataProcessor
 * リーダーボードのデータ処理、検証、整合性チェックを担当
 */
export class LeaderboardDataProcessor {
    constructor(leaderboardManager) {
        this.leaderboardManager = leaderboardManager;
    }

    /**
     * スコアデータの検証
     * @param {Object} scoreData スコアデータ
     * @returns {boolean} 検証結果
     */
    validateScoreData(scoreData) {
        if (!scoreData || typeof scoreData !== 'object') {
            return false;
        }

        // スコアの基本検証
        if (typeof scoreData.score !== 'number' || scoreData.score < 0) {
            return false;
        }

        // プレイヤー名の検証
        if (!scoreData.playerName || typeof scoreData.playerName !== 'string' || scoreData.playerName.trim() === '') {
            return false;
        }

        // ステージIDの検証
        if (scoreData.stageId !== undefined && typeof scoreData.stageId !== 'string') {
            return false;
        }

        // タイムスタンプの検証
        if (scoreData.timestamp && (typeof scoreData.timestamp !== 'number' || scoreData.timestamp > Date.now())) {
            return false;
        }

        return true;
    }

    /**
     * スコアエントリの処理とフォーマット
     * @param {Object} scoreData スコアデータ
     * @returns {Object} 処理済みエントリ
     */
    processScoreEntry(scoreData) {
        if (!this.validateScoreData(scoreData)) {
            throw new Error('Invalid score data provided');
        }

        // 基本エントリの作成
        const entry = {
            score: scoreData.score,
            playerName: scoreData.playerName.trim(),
            timestamp: scoreData.timestamp || Date.now(),
            stageId: scoreData.stageId || 'default'
        };

        // チェックサムの計算
        entry.checksum = this.calculateScoreChecksum(entry);

        // 追加メタデータの処理
        if (scoreData.metadata) {
            entry.metadata = this.processMetadata(scoreData.metadata);
        }

        return entry;
    }

    /**
     * スコアチェックサムの計算
     * @param {Object} entry スコアエントリ
     * @returns {string} チェックサム
     */
    calculateScoreChecksum(entry) {
        const data = `${entry.score}-${entry.playerName}-${entry.timestamp}-${entry.stageId}`;
        let hash = 0;
        
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit整数に変換
        }
        
        return Math.abs(hash).toString(36);
    }

    /**
     * メタデータの処理
     * @param {Object} metadata メタデータ
     * @returns {Object} 処理済みメタデータ
     */
    processMetadata(metadata) {
        const processedMetadata = {};
        
        // 許可されたメタデータフィールドのみ処理
        const allowedFields = ['difficulty', 'gameMode', 'duration', 'combo', 'accuracy'];
        
        for (const field of allowedFields) {
            if (metadata.hasOwnProperty(field)) {
                processedMetadata[field] = metadata[field];
            }
        }
        
        return processedMetadata;
    }

    /**
     * データ整合性チェック
     * @param {Object} data リーダーボードデータ
     * @returns {Object} チェック結果
     */
    performIntegrityCheck(data) {
        const results = {
            isValid: true,
            errors: [],
            warnings: [],
            statistics: {
                totalEntries: 0,
                validEntries: 0,
                invalidEntries: 0,
                duplicateEntries: 0
            }
        };

        if (!data || !data.leaderboards) {
            results.isValid = false;
            results.errors.push('Missing leaderboards data');
            return results;
        }

        const seenEntries = new Set();
        
        for (const [boardName, board] of Object.entries(data.leaderboards)) {
            if (!Array.isArray(board.entries)) {
                results.errors.push(`Invalid entries array for board: ${boardName}`);
                results.isValid = false;
                continue;
            }

            for (const entry of board.entries) {
                results.statistics.totalEntries++;

                // エントリの検証
                if (!this.validateScoreEntry(entry)) {
                    results.statistics.invalidEntries++;
                    results.warnings.push(`Invalid entry in board ${boardName}: ${JSON.stringify(entry)}`);
                    continue;
                }

                // 重複チェック
                const entryKey = `${entry.playerName}-${entry.score}-${entry.timestamp}`;
                if (seenEntries.has(entryKey)) {
                    results.statistics.duplicateEntries++;
                    results.warnings.push(`Duplicate entry detected: ${entryKey}`);
                } else {
                    seenEntries.add(entryKey);
                }

                // チェックサム検証
                if (entry.checksum) {
                    const expectedChecksum = this.calculateScoreChecksum(entry);
                    if (entry.checksum !== expectedChecksum) {
                        results.warnings.push(`Checksum mismatch for entry: ${entryKey}`);
                    }
                }

                results.statistics.validEntries++;
            }
        }

        // 期間別リーダーボードのチェック
        if (data.periodLeaderboards) {
            this.checkPeriodLeaderboards(data.periodLeaderboards, results);
        }

        return results;
    }

    /**
     * スコアエントリの検証
     * @param {Object} entry スコアエントリ
     * @returns {boolean} 検証結果
     */
    validateScoreEntry(entry) {
        if (!entry || typeof entry !== 'object') {
            return false;
        }

        const requiredFields = ['score', 'playerName', 'timestamp'];
        for (const field of requiredFields) {
            if (!entry.hasOwnProperty(field)) {
                return false;
            }
        }

        return this.validateScoreData(entry);
    }

    /**
     * 期間別リーダーボードのチェック
     * @param {Object} periodLeaderboards 期間別リーダーボード
     * @param {Object} results チェック結果
     */
    checkPeriodLeaderboards(periodLeaderboards, results) {
        const validPeriods = ['daily', 'weekly', 'monthly'];
        
        for (const period of validPeriods) {
            if (!periodLeaderboards[period]) {
                results.warnings.push(`Missing ${period} leaderboard`);
                continue;
            }

            const periodData = periodLeaderboards[period];
            if (!Array.isArray(periodData.entries)) {
                results.errors.push(`Invalid ${period} leaderboard entries`);
                results.isValid = false;
            }
        }
    }

    /**
     * プレイヤースコア履歴の管理
     * @param {string} playerName プレイヤー名
     * @param {Object} scoreEntry スコアエントリ
     * @returns {Object} 更新された履歴
     */
    managePlayerHistory(playerName, scoreEntry) {
        const data = this.leaderboardManager.data;
        
        if (!data.playerHistory) {
            data.playerHistory = {};
        }

        if (!data.playerHistory[playerName]) {
            data.playerHistory[playerName] = {
                scores: [],
                bestScore: scoreEntry.score,
                totalGames: 0,
                averageScore: 0
            };
        }

        const history = data.playerHistory[playerName];
        
        // スコアを履歴に追加
        history.scores.push({
            score: scoreEntry.score,
            timestamp: scoreEntry.timestamp,
            stageId: scoreEntry.stageId
        });

        // 統計の更新
        history.totalGames++;
        if (scoreEntry.score > history.bestScore) {
            history.bestScore = scoreEntry.score;
        }

        // 平均スコアの計算
        const totalScore = history.scores.reduce((sum, score) => sum + score.score, 0);
        history.averageScore = Math.round(totalScore / history.totalGames);

        // 履歴サイズの制限（最新100件）
        if (history.scores.length > 100) {
            history.scores = history.scores.slice(-100);
        }

        return history;
    }
}