import { BaseComponent } from '../BaseComponent.js';

/**
 * CommandHistoryManager - コマンド履歴管理・ログ追跡コンポーネント
 */
export class CommandHistoryManager extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'CommandHistoryManager');
        this.executionState = {
            lastCommand: null,
            commandHistory: [],
            maxHistorySize: 100
        };
    }

    /**
     * コマンド実行記録
     * @param {string} command - コマンド名
     * @param {Object} params - パラメータ
     */
    logCommand(command, params) {
        const log = {
            timestamp: Date.now(),
            command: command,
            params: params,
            sessionId: this.getSessionId()
        };
        
        this.executionState.commandHistory.push(log);
        this.executionState.lastCommand = command;
        
        // 履歴サイズ制限
        if (this.executionState.commandHistory.length > this.executionState.maxHistorySize) {
            this.executionState.commandHistory.shift();
        }
        
        const safetyValidator = this.mainController.getSafetyValidator();
        const shouldLog = safetyValidator ? safetyValidator.getSafetySettings().logAllChanges : true;
        
        if (shouldLog) {
            console.log('[GameStateCommands] Command executed:', log);
        }
    }

    /**
     * コマンド履歴を取得
     * @param {number} limit - 取得件数制限
     * @returns {Array} コマンド履歴
     */
    getCommandHistory(limit = null) {
        if (limit) {
            return this.executionState.commandHistory.slice(-limit);
        }
        return [...this.executionState.commandHistory];
    }

    /**
     * 特定コマンドの履歴を取得
     * @param {string} command - コマンド名
     * @returns {Array} 指定コマンドの履歴
     */
    getCommandHistoryByName(command) {
        return this.executionState.commandHistory.filter(entry => entry.command === command);
    }

    /**
     * 時間範囲内のコマンド履歴を取得
     * @param {number} startTime - 開始時間（タイムスタンプ）
     * @param {number} endTime - 終了時間（タイムスタンプ）
     * @returns {Array} 時間範囲内の履歴
     */
    getCommandHistoryByTimeRange(startTime, endTime) {
        return this.executionState.commandHistory.filter(entry => 
            entry.timestamp >= startTime && entry.timestamp <= endTime
        );
    }

    /**
     * 実行統計を取得
     * @returns {Object} 統計情報
     */
    getExecutionStatistics() {
        const history = this.executionState.commandHistory;
        const stats = {
            totalCommands: history.length,
            lastCommand: this.executionState.lastCommand,
            lastExecutionTime: history.length > 0 ? history[history.length - 1].timestamp : null,
            commandFrequency: {},
            categoryFrequency: {},
            recentActivity: this.getRecentActivityStats(),
            sessionStats: this.getSessionStats()
        };

        // コマンド頻度統計
        history.forEach(entry => {
            stats.commandFrequency[entry.command] = 
                (stats.commandFrequency[entry.command] || 0) + 1;
        });

        // カテゴリ頻度統計（コマンド名から推測）
        history.forEach(entry => {
            const category = this.inferCommandCategory(entry.command);
            stats.categoryFrequency[category] = 
                (stats.categoryFrequency[category] || 0) + 1;
        });

        return stats;
    }

    /**
     * 最近のアクティビティ統計
     * @private
     */
    getRecentActivityStats() {
        const now = Date.now();
        const hourAgo = now - (60 * 60 * 1000);
        const dayAgo = now - (24 * 60 * 60 * 1000);

        const recentHour = this.getCommandHistoryByTimeRange(hourAgo, now);
        const recentDay = this.getCommandHistoryByTimeRange(dayAgo, now);

        return {
            lastHour: recentHour.length,
            lastDay: recentDay.length,
            averagePerHour: recentDay.length / 24,
            mostActiveHour: this.getMostActiveHour(recentDay)
        };
    }

    /**
     * セッション統計
     * @private
     */
    getSessionStats() {
        const currentSession = this.getSessionId();
        const sessionCommands = this.executionState.commandHistory.filter(
            entry => entry.sessionId === currentSession
        );

        return {
            currentSession: currentSession,
            commandsThisSession: sessionCommands.length,
            sessionStartTime: sessionCommands.length > 0 ? sessionCommands[0].timestamp : null,
            sessionDuration: sessionCommands.length > 0 ? 
                Date.now() - sessionCommands[0].timestamp : 0
        };
    }

    /**
     * 最もアクティブな時間を取得
     * @private
     */
    getMostActiveHour(commands) {
        const hourCounts = {};
        
        commands.forEach(entry => {
            const hour = new Date(entry.timestamp).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        let maxHour = 0;
        let maxCount = 0;
        Object.entries(hourCounts).forEach(([hour, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxHour = parseInt(hour);
            }
        });

        return { hour: maxHour, count: maxCount };
    }

    /**
     * コマンドカテゴリを推測
     * @private
     */
    inferCommandCategory(command) {
        const categoryMap = {
            'pause': 'game-control',
            'resume': 'game-control',
            'reset': 'game-control',
            'stop': 'game-control',
            'status': 'game-control',
            'set-score': 'score',
            'add-score': 'score',
            'reset-combo': 'score',
            'high-score': 'score',
            'spawn-bubble': 'bubbles',
            'clear-bubbles': 'bubbles',
            'bubble-info': 'bubbles',
            'set-ap': 'player',
            'set-level': 'player',
            'player-info': 'player',
            'reset-player': 'player',
            'goto-stage': 'level',
            'list-stages': 'level',
            'set-difficulty': 'level',
            'run-test': 'debug',
            'dump-state': 'debug',
            'undo': 'debug'
        };

        return categoryMap[command] || 'unknown';
    }

    /**
     * コマンド実行パターン分析
     * @returns {Object} パターン分析結果
     */
    analyzeExecutionPatterns() {
        const history = this.executionState.commandHistory;
        if (history.length < 2) {
            return { patterns: [], analysis: 'Insufficient data for pattern analysis' };
        }

        const patterns = [];
        
        // 連続実行パターン
        const sequences = this.findCommandSequences();
        if (sequences.length > 0) {
            patterns.push({
                type: 'sequence',
                description: 'Common command sequences detected',
                data: sequences
            });
        }

        // 時間パターン
        const timePatterns = this.analyzeTimePatterns();
        if (timePatterns.length > 0) {
            patterns.push({
                type: 'temporal',
                description: 'Time-based usage patterns',
                data: timePatterns
            });
        }

        // 繰り返しパターン
        const repetitions = this.findRepetitiveCommands();
        if (repetitions.length > 0) {
            patterns.push({
                type: 'repetitive',
                description: 'Frequently repeated commands',
                data: repetitions
            });
        }

        return {
            patterns: patterns,
            analysis: this.generatePatternAnalysis(patterns)
        };
    }

    /**
     * コマンドシーケンス検出
     * @private
     */
    findCommandSequences() {
        const sequences = new Map();
        const history = this.executionState.commandHistory;

        for (let i = 0; i < history.length - 1; i++) {
            const sequence = `${history[i].command} -> ${history[i + 1].command}`;
            sequences.set(sequence, (sequences.get(sequence) || 0) + 1);
        }

        return Array.from(sequences.entries())
            .filter(([, count]) => count > 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }

    /**
     * 時間パターン分析
     * @private
     */
    analyzeTimePatterns() {
        const history = this.executionState.commandHistory;
        const intervals = [];

        for (let i = 1; i < history.length; i++) {
            const interval = history[i].timestamp - history[i - 1].timestamp;
            intervals.push(interval);
        }

        if (intervals.length === 0) return [];

        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const quickCommands = intervals.filter(interval => interval < 5000).length;
        const burstSessions = this.detectBurstSessions(intervals);

        return [
            { metric: 'average_interval', value: Math.round(avgInterval), unit: 'ms' },
            { metric: 'quick_commands', value: quickCommands, percentage: (quickCommands / intervals.length) * 100 },
            { metric: 'burst_sessions', value: burstSessions }
        ];
    }

    /**
     * バーストセッション検出
     * @private
     */
    detectBurstSessions(intervals) {
        let burstCount = 0;
        let currentBurst = 0;

        intervals.forEach(interval => {
            if (interval < 2000) { // 2秒以内は連続実行とみなす
                currentBurst++;
            } else {
                if (currentBurst >= 3) { // 3回以上連続実行をバーストとする
                    burstCount++;
                }
                currentBurst = 0;
            }
        });

        return burstCount;
    }

    /**
     * 繰り返しコマンド検出
     * @private
     */
    findRepetitiveCommands() {
        const stats = this.getExecutionStatistics();
        return Object.entries(stats.commandFrequency)
            .filter(([, count]) => count > 5)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([command, count]) => ({ command, count }));
    }

    /**
     * パターン分析結果を生成
     * @private
     */
    generatePatternAnalysis(patterns) {
        if (patterns.length === 0) {
            return 'No significant patterns detected in command usage.';
        }

        const insights = [];
        
        patterns.forEach(pattern => {
            switch (pattern.type) {
                case 'sequence':
                    insights.push(`Common command sequences suggest workflow patterns.`);
                    break;
                case 'temporal':
                    insights.push(`Time patterns indicate usage behavior characteristics.`);
                    break;
                case 'repetitive':
                    insights.push(`Repetitive commands may indicate automation opportunities.`);
                    break;
            }
        });

        return insights.join(' ');
    }

    /**
     * セッションIDを取得
     * @private
     */
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        }
        return this.sessionId;
    }

    /**
     * 履歴をエクスポート
     * @param {string} format - エクスポート形式 (json, csv)
     * @returns {string} エクスポートデータ
     */
    exportHistory(format = 'json') {
        const history = this.executionState.commandHistory;

        switch (format) {
            case 'json':
                return JSON.stringify({
                    exportDate: new Date().toISOString(),
                    totalCommands: history.length,
                    history: history
                }, null, 2);

            case 'csv':
                const csvHeaders = 'Timestamp,Command,Parameters,Session ID';
                const csvRows = history.map(entry => 
                    `${new Date(entry.timestamp).toISOString()},${entry.command},"${JSON.stringify(entry.params)}",${entry.sessionId}`
                );
                return [csvHeaders, ...csvRows].join('\n');

            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * 履歴をクリア
     * @param {boolean} confirm - 確認フラグ
     */
    clearHistory(confirm = false) {
        if (!confirm) {
            throw new Error('History clearing requires confirmation');
        }

        const clearedCount = this.executionState.commandHistory.length;
        this.executionState.commandHistory = [];
        this.executionState.lastCommand = null;

        console.log(`[CommandHistoryManager] Cleared ${clearedCount} command history entries`);
        return clearedCount;
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.executionState.commandHistory = [];
        this.executionState.lastCommand = null;
        super.cleanup();
    }
}