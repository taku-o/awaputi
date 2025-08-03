/**
 * LeaderboardRankingManager
 * リーダーボードのランキング計算、期間別ランキング管理を担当
 */
export class LeaderboardRankingManager {
    constructor(leaderboardManager) {
        this.leaderboardManager = leaderboardManager;
    }

    /**
     * リーダーボードの更新
     * @param {string} leaderboardKey リーダーボードキー
     * @param {Object} scoreEntry スコアエントリ
     */
    updateLeaderboards(leaderboardKey, scoreEntry) {
        const data = this.leaderboardManager.data;
        
        if (!data.leaderboards[leaderboardKey]) {
            data.leaderboards[leaderboardKey] = {
                entries: [],
                lastUpdated: Date.now()
            };
        }

        const leaderboard = data.leaderboards[leaderboardKey];
        
        // エントリを追加
        leaderboard.entries.push(scoreEntry);
        
        // ソート（スコア降順）
        this.sortLeaderboard(leaderboard);
        
        // 最大エントリ数の制限
        const maxEntries = this.leaderboardManager.config.maxEntries || 100;
        if (leaderboard.entries.length > maxEntries) {
            leaderboard.entries = leaderboard.entries.slice(0, maxEntries);
        }
        
        leaderboard.lastUpdated = Date.now();
        
        // キャッシュクリア
        this.leaderboardManager.clearRelevantCache(leaderboardKey);
    }

    /**
     * 期間別リーダーボードの更新
     * @param {Object} scoreEntry スコアエントリ
     */
    updatePeriodLeaderboards(scoreEntry) {
        const data = this.leaderboardManager.data;
        const now = new Date(scoreEntry.timestamp);

        // 各期間での更新
        this.updateDailyLeaderboard(data, scoreEntry, now);
        this.updateWeeklyLeaderboard(data, scoreEntry, now);
        this.updateMonthlyLeaderboard(data, scoreEntry, now);
    }

    /**
     * 日別リーダーボードの更新
     * @param {Object} data データオブジェクト
     * @param {Object} scoreEntry スコアエントリ
     * @param {Date} date 日付
     */
    updateDailyLeaderboard(data, scoreEntry, date) {
        const dateKey = this.formatDateKey(date, 'daily');
        this.updatePeriodBoard(data, 'daily', dateKey, scoreEntry);
    }

    /**
     * 週別リーダーボードの更新
     * @param {Object} data データオブジェクト
     * @param {Object} scoreEntry スコアエントリ
     * @param {Date} date 日付
     */
    updateWeeklyLeaderboard(data, scoreEntry, date) {
        const weekKey = this.formatDateKey(date, 'weekly');
        this.updatePeriodBoard(data, 'weekly', weekKey, scoreEntry);
    }

    /**
     * 月別リーダーボードの更新
     * @param {Object} data データオブジェクト
     * @param {Object} scoreEntry スコアエントリ
     * @param {Date} date 日付
     */
    updateMonthlyLeaderboard(data, scoreEntry, date) {
        const monthKey = this.formatDateKey(date, 'monthly');
        this.updatePeriodBoard(data, 'monthly', monthKey, scoreEntry);
    }

    /**
     * 期間別ボードの更新
     * @param {Object} data データオブジェクト
     * @param {string} period 期間タイプ
     * @param {string} key 期間キー
     * @param {Object} scoreEntry スコアエントリ
     */
    updatePeriodBoard(data, period, key, scoreEntry) {
        if (!data.periodLeaderboards) {
            data.periodLeaderboards = {};
        }

        if (!data.periodLeaderboards[period]) {
            data.periodLeaderboards[period] = {};
        }

        if (!data.periodLeaderboards[period][key]) {
            data.periodLeaderboards[period][key] = {
                entries: [],
                startDate: this.getPeriodStartDate(key, period),
                endDate: this.getPeriodEndDate(key, period)
            };
        }

        const periodBoard = data.periodLeaderboards[period][key];
        periodBoard.entries.push(scoreEntry);
        
        // ソート
        this.sortLeaderboard(periodBoard);
        
        // 制限
        const maxEntries = this.leaderboardManager.config.maxPeriodEntries || 50;
        if (periodBoard.entries.length > maxEntries) {
            periodBoard.entries = periodBoard.entries.slice(0, maxEntries);
        }
    }

    /**
     * 期間別ランキングの取得
     * @param {string} period 期間タイプ
     * @param {number} limit 取得数制限
     * @returns {Array} ランキングデータ
     */
    getPeriodRanking(period, limit = 10) {
        const data = this.leaderboardManager.data;
        
        if (!data.periodLeaderboards || !data.periodLeaderboards[period]) {
            return [];
        }

        const periodData = data.periodLeaderboards[period];
        const currentKey = this.getCurrentPeriodKey(period);
        
        if (!periodData[currentKey] || !periodData[currentKey].entries) {
            return [];
        }

        const entries = periodData[currentKey].entries.slice(0, limit);
        
        // ランキング情報の付加
        return entries.map((entry, index) => ({
            ...entry,
            rank: index + 1,
            period: period,
            periodKey: currentKey
        }));
    }

    /**
     * 期間統計の取得
     * @param {string} period 期間タイプ
     * @returns {Object} 統計データ
     */
    getPeriodStats(period) {
        const data = this.leaderboardManager.data;
        
        if (!data.periodLeaderboards || !data.periodLeaderboards[period]) {
            return {
                totalPlayers: 0,
                totalScores: 0,
                averageScore: 0,
                highestScore: 0,
                period: period
            };
        }

        const periodData = data.periodLeaderboards[period];
        const currentKey = this.getCurrentPeriodKey(period);
        
        if (!periodData[currentKey] || !periodData[currentKey].entries) {
            return {
                totalPlayers: 0,
                totalScores: 0,
                averageScore: 0,
                highestScore: 0,
                period: period
            };
        }

        const entries = periodData[currentKey].entries;
        const uniquePlayers = new Set(entries.map(entry => entry.playerName));
        const scores = entries.map(entry => entry.score);
        const totalScore = scores.reduce((sum, score) => sum + score, 0);

        return {
            totalPlayers: uniquePlayers.size,
            totalScores: entries.length,
            averageScore: entries.length > 0 ? Math.round(totalScore / entries.length) : 0,
            highestScore: entries.length > 0 ? Math.max(...scores) : 0,
            period: period,
            periodKey: currentKey
        };
    }

    /**
     * 期間別ランキングの再計算
     */
    recalculatePeriodRankings() {
        const data = this.leaderboardManager.data;
        
        if (!data.periodLeaderboards) {
            return;
        }

        const periods = ['daily', 'weekly', 'monthly'];
        
        for (const period of periods) {
            if (data.periodLeaderboards[period]) {
                for (const [key, board] of Object.entries(data.periodLeaderboards[period])) {
                    if (board.entries) {
                        this.sortLeaderboard(board);
                    }
                }
            }
        }
    }

    /**
     * リーダーボードのソート
     * @param {Object} leaderboard リーダーボードオブジェクト
     */
    sortLeaderboard(leaderboard) {
        if (!leaderboard.entries || !Array.isArray(leaderboard.entries)) {
            return;
        }

        leaderboard.entries.sort((a, b) => {
            // スコア降順
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            // スコアが同じ場合、タイムスタンプ昇順（早い方が上位）
            return a.timestamp - b.timestamp;
        });
    }

    /**
     * 日付キーのフォーマット
     * @param {Date} date 日付
     * @param {string} period 期間タイプ
     * @returns {string} フォーマット済みキー
     */
    formatDateKey(date, period) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        switch (period) {
            case 'daily':
                return `${year}-${month}-${day}`;
            case 'weekly':
                const weekStart = this.getWeekStart(date);
                const weekMonth = String(weekStart.getMonth() + 1).padStart(2, '0');
                const weekDay = String(weekStart.getDate()).padStart(2, '0');
                return `${weekStart.getFullYear()}-W${weekMonth}-${weekDay}`;
            case 'monthly':
                return `${year}-${month}`;
            default:
                return `${year}-${month}-${day}`;
        }
    }

    /**
     * 現在の期間キーの取得
     * @param {string} period 期間タイプ
     * @returns {string} 期間キー
     */
    getCurrentPeriodKey(period) {
        const now = new Date();
        return this.formatDateKey(now, period);
    }

    /**
     * 週の開始日を取得
     * @param {Date} date 基準日
     * @returns {Date} 週の開始日
     */
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day; // 日曜日を週の開始とする
        return new Date(d.setDate(diff));
    }

    /**
     * 期間の開始日を取得
     * @param {string} key 期間キー
     * @param {string} period 期間タイプ
     * @returns {Date} 開始日
     */
    getPeriodStartDate(key, period) {
        const parts = key.split('-');
        
        switch (period) {
            case 'daily':
                return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            case 'weekly':
                // 簡単な実装：キーの日付をそのまま使用
                return new Date(parseInt(parts[0]), parseInt(parts[1].slice(1)) - 1, parseInt(parts[2]));
            case 'monthly':
                return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
            default:
                return new Date();
        }
    }

    /**
     * 期間の終了日を取得
     * @param {string} key 期間キー
     * @param {string} period 期間タイプ
     * @returns {Date} 終了日
     */
    getPeriodEndDate(key, period) {
        const startDate = this.getPeriodStartDate(key, period);
        
        switch (period) {
            case 'daily':
                const endOfDay = new Date(startDate);
                endOfDay.setHours(23, 59, 59, 999);
                return endOfDay;
            case 'weekly':
                const endOfWeek = new Date(startDate);
                endOfWeek.setDate(endOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                return endOfWeek;
            case 'monthly':
                const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
                endOfMonth.setHours(23, 59, 59, 999);
                return endOfMonth;
            default:
                return new Date();
        }
    }

    /**
     * 効率的なランキング更新
     * @param {string} leaderboardKey リーダーボードキー
     * @param {Object} newEntry 新しいエントリ
     */
    updateRankingEfficiently(leaderboardKey, newEntry) {
        const data = this.leaderboardManager.data;
        const leaderboard = data.leaderboards[leaderboardKey];
        
        if (!leaderboard || !leaderboard.entries) {
            return;
        }

        const entries = leaderboard.entries;
        let insertIndex = entries.length;

        // 挿入位置を効率的に見つける（バイナリサーチ）
        let left = 0;
        let right = entries.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const midEntry = entries[mid];

            if (midEntry.score < newEntry.score || 
                (midEntry.score === newEntry.score && midEntry.timestamp > newEntry.timestamp)) {
                insertIndex = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }

        // 指定位置に挿入
        entries.splice(insertIndex, 0, newEntry);

        // 最大エントリ数の制限
        const maxEntries = this.leaderboardManager.config.maxEntries || 100;
        if (entries.length > maxEntries) {
            entries.splice(maxEntries);
        }

        leaderboard.lastUpdated = Date.now();
    }
}