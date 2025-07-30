/**
 * Enhanced History Manager
 * 高度なコマンド履歴管理、検索、分析機能を提供
 */

export class EnhancedHistoryManager {
    constructor(console) {
        this.console = console;
        
        // 履歴データ
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 1000;
        this.maxSearchResults = 50;
        
        // 検索機能
        this.searchIndex = new Map();
        this.searchCache = new Map();
        this.searchFilters = new Map();
        
        // 分析データ
        this.statistics = {
            totalCommands: 0,
            commandFrequency: new Map(),
            sessionCommands: 0,
            averageCommandLength: 0,
            mostUsedCommands: [],
            commandPatterns: new Map(),
            timeSpentByCommand: new Map(),
            errorCommands: new Set()
        };
        
        // 設定
        this.enableAnalysis = true;
        this.enableSearch = true;
        this.enableAutoSave = true;
        this.saveInterval = 30000; // 30秒
        
        // セッションデータ
        this.sessionStartTime = Date.now();
        this.currentSession = {
            id: this.generateSessionId(),
            startTime: this.sessionStartTime,
            commands: [],
            totalTime: 0
        };
        
        this.initialize();
    }

    initialize() {
        this.loadHistory();
        this.buildSearchIndex();
        this.startAutoSave();
    }

    /**
     * コマンドを履歴に追加
     */
    addCommand(command, metadata = {}) {
        const timestamp = Date.now();
        const historyEntry = {
            id: this.generateEntryId(),
            command: command.trim(),
            timestamp,
            sessionId: this.currentSession.id,
            metadata: {
                success: metadata.success !== false,
                executionTime: metadata.executionTime || 0,
                errorMessage: metadata.errorMessage || null,
                resultType: metadata.resultType || 'unknown',
                ...metadata
            }
        };
        
        // 重複する直前のコマンドは追加しない（設定によるが、メタデータが異なる場合は追加）
        if (!this.isDuplicateCommand(historyEntry)) {
            this.history.push(historyEntry);
            this.updateSearchIndex(historyEntry);
            this.updateStatistics(historyEntry);
            this.currentSession.commands.push(historyEntry);
        }
        
        // 履歴サイズの制限
        this.trimHistory();
        
        // インデックスを更新
        this.historyIndex = this.history.length;
        
        return historyEntry;
    }

    /**
     * 履歴ナビゲーション
     */
    navigate(direction, filter = null) {
        if (this.history.length === 0) return null;
        
        const filteredHistory = filter ? this.getFilteredHistory(filter) : this.history;
        
        if (filteredHistory.length === 0) return null;
        
        switch (direction) {
            case 'up':
            case 'previous':
                this.historyIndex = Math.max(0, this.historyIndex - 1);
                break;
            case 'down':
            case 'next':
                this.historyIndex = Math.min(filteredHistory.length, this.historyIndex + 1);
                break;
            case 'first':
                this.historyIndex = 0;
                break;
            case 'last':
                this.historyIndex = filteredHistory.length - 1;
                break;
        }
        
        if (this.historyIndex >= filteredHistory.length) {
            return null;
        }
        
        return filteredHistory[this.historyIndex];
    }

    /**
     * 履歴検索
     */
    search(query, options = {}) {
        if (!this.enableSearch || !query.trim()) {
            return [];
        }
        
        const cacheKey = `${query}:${JSON.stringify(options)}`;
        if (this.searchCache.has(cacheKey)) {
            return this.searchCache.get(cacheKey);
        }
        
        const results = this.performSearch(query, options);
        
        // キャッシュに保存（制限付き）
        if (this.searchCache.size > 100) {
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }
        this.searchCache.set(cacheKey, results);
        
        return results;
    }

    /**
     * 検索実行
     */
    performSearch(query, options) {
        const {
            type = 'fuzzy', // 'exact', 'contains', 'fuzzy', 'regex'
            limit = this.maxSearchResults,
            sortBy = 'relevance', // 'relevance', 'timestamp', 'frequency'
            timeRange = null, // { start, end }
            includeMetadata = false,
            commandFilter = null
        } = options;
        
        let results = [];
        
        switch (type) {
            case 'exact':
                results = this.exactSearch(query);
                break;
            case 'contains':
                results = this.containsSearch(query);
                break;
            case 'fuzzy':
                results = this.fuzzySearch(query);
                break;
            case 'regex':
                results = this.regexSearch(query);
                break;
            default:
                results = this.fuzzySearch(query);
        }
        
        // フィルタリング
        if (timeRange) {
            results = results.filter(entry => 
                entry.timestamp >= timeRange.start && 
                entry.timestamp <= timeRange.end
            );
        }
        
        if (commandFilter) {
            results = results.filter(entry => 
                this.matchesCommandFilter(entry, commandFilter)
            );
        }
        
        // ソート
        results = this.sortResults(results, sortBy, query);
        
        // 制限
        results = results.slice(0, limit);
        
        // メタデータの除去（オプション）
        if (!includeMetadata) {
            results = results.map(entry => ({
                id: entry.id,
                command: entry.command,
                timestamp: entry.timestamp
            }));
        }
        
        return results;
    }

    /**
     * 完全一致検索
     */
    exactSearch(query) {
        return this.history.filter(entry => 
            entry.command === query
        );
    }

    /**
     * 部分一致検索
     */
    containsSearch(query) {
        const queryLower = query.toLowerCase();
        return this.history.filter(entry => 
            entry.command.toLowerCase().includes(queryLower)
        );
    }

    /**
     * ファジー検索
     */
    fuzzySearch(query) {
        const queryLower = query.toLowerCase();
        const results = [];
        
        for (const entry of this.history) {
            const score = this.calculateFuzzyScore(entry.command.toLowerCase(), queryLower);
            if (score > 0.3) { // 閾値
                results.push({
                    ...entry,
                    relevanceScore: score
                });
            }
        }
        
        return results;
    }

    /**
     * 正規表現検索
     */
    regexSearch(query) {
        try {
            const regex = new RegExp(query, 'i');
            return this.history.filter(entry => 
                regex.test(entry.command)
            );
        } catch (error) {
            console.warn('Invalid regex pattern:', query);
            return [];
        }
    }

    /**
     * ファジースコア計算
     */
    calculateFuzzyScore(text, query) {
        if (text.includes(query)) {
            return 1.0; // 完全部分一致
        }
        
        let matches = 0;
        let queryIndex = 0;
        
        for (let i = 0; i < text.length && queryIndex < query.length; i++) {
            if (text[i] === query[queryIndex]) {
                matches++;
                queryIndex++;
            }
        }
        
        return matches / query.length;
    }

    /**
     * 結果のソート
     */
    sortResults(results, sortBy, query) {
        switch (sortBy) {
            case 'timestamp':
                return results.sort((a, b) => b.timestamp - a.timestamp);
            case 'frequency':
                return results.sort((a, b) => {
                    const freqA = this.statistics.commandFrequency.get(a.command) || 0;
                    const freqB = this.statistics.commandFrequency.get(b.command) || 0;
                    return freqB - freqA;
                });
            case 'relevance':
            default:
                return results.sort((a, b) => {
                    const scoreA = a.relevanceScore || this.calculateRelevanceScore(a, query);
                    const scoreB = b.relevanceScore || this.calculateRelevanceScore(b, query);
                    return scoreB - scoreA;
                });
        }
    }

    /**
     * 関連度スコア計算
     */
    calculateRelevanceScore(entry, query) {
        let score = 0;
        
        // 完全一致
        if (entry.command === query) {
            score += 100;
        }
        
        // 前方一致
        if (entry.command.startsWith(query)) {
            score += 50;
        }
        
        // 部分一致
        if (entry.command.includes(query)) {
            score += 25;
        }
        
        // 頻度ボーナス
        const frequency = this.statistics.commandFrequency.get(entry.command) || 0;
        score += Math.min(frequency, 20);
        
        // 最近の実行ボーナス
        const age = Date.now() - entry.timestamp;
        const dayMs = 24 * 60 * 60 * 1000;
        if (age < dayMs) {
            score += 10;
        }
        
        // 成功実行ボーナス
        if (entry.metadata.success) {
            score += 5;
        }
        
        return score;
    }

    /**
     * フィルタ済み履歴の取得
     */
    getFilteredHistory(filter) {
        if (typeof filter === 'string') {
            // 簡単な文字列フィルタ
            return this.history.filter(entry => 
                entry.command.includes(filter)
            );
        }
        
        if (typeof filter === 'function') {
            // カスタムフィルタ関数
            return this.history.filter(filter);
        }
        
        if (typeof filter === 'object') {
            // オブジェクトフィルタ
            return this.history.filter(entry => {
                for (const [key, value] of Object.entries(filter)) {
                    if (entry[key] !== value) {
                        return false;
                    }
                }
                return true;
            });
        }
        
        return this.history;
    }

    /**
     * 履歴統計の取得
     */
    getStatistics() {
        this.updateSessionStatistics();
        
        const topCommands = Array.from(this.statistics.commandFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        return {
            ...this.statistics,
            topCommands,
            currentSession: this.currentSession,
            historySize: this.history.length
        };
    }

    /**
     * 履歴のエクスポート
     */
    exportHistory(format = 'json', options = {}) {
        const {
            includeMetadata = true,
            timeRange = null,
            commandFilter = null
        } = options;
        
        let exportData = this.history;
        
        // フィルタリング
        if (timeRange) {
            exportData = exportData.filter(entry => 
                entry.timestamp >= timeRange.start && 
                entry.timestamp <= timeRange.end
            );
        }
        
        if (commandFilter) {
            exportData = exportData.filter(entry => 
                this.matchesCommandFilter(entry, commandFilter)
            );
        }
        
        // メタデータの処理
        if (!includeMetadata) {
            exportData = exportData.map(entry => ({
                command: entry.command,
                timestamp: entry.timestamp
            }));
        }
        
        switch (format) {
            case 'json':
                return JSON.stringify(exportData, null, 2);
            case 'csv':
                return this.exportToCsv(exportData);
            case 'text':
                return this.exportToText(exportData);
            default:
                return JSON.stringify(exportData, null, 2);
        }
    }

    /**
     * 履歴のインポート
     */
    importHistory(data, format = 'json', options = {}) {
        const { merge = true, validate = true } = options;
        
        let importedEntries = [];
        
        try {
            switch (format) {
                case 'json':
                    importedEntries = JSON.parse(data);
                    break;
                case 'csv':
                    importedEntries = this.importFromCsv(data);
                    break;
                case 'text':
                    importedEntries = this.importFromText(data);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
            
            // バリデーション
            if (validate) {
                importedEntries = this.validateImportedEntries(importedEntries);
            }
            
            // マージまたは置換
            if (merge) {
                // 重複を避けてマージ
                for (const entry of importedEntries) {
                    if (!this.history.some(h => h.id === entry.id)) {
                        this.history.push(entry);
                    }
                }
            } else {
                // 完全置換
                this.history = importedEntries;
            }
            
            // インデックスの再構築
            this.buildSearchIndex();
            this.updateStatistics();
            
            return {
                success: true,
                imported: importedEntries.length,
                message: `Successfully imported ${importedEntries.length} entries`
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: `Failed to import history: ${error.message}`
            };
        }
    }

    // ヘルパーメソッド

    /**
     * 重複コマンドの検出
     */
    isDuplicateCommand(newEntry) {
        if (this.history.length === 0) return false;
        
        const lastEntry = this.history[this.history.length - 1];
        return lastEntry.command === newEntry.command && 
               (newEntry.timestamp - lastEntry.timestamp) < 1000; // 1秒以内の重複
    }

    /**
     * 検索インデックスの構築
     */
    buildSearchIndex() {
        this.searchIndex.clear();
        
        for (const entry of this.history) {
            this.updateSearchIndex(entry);
        }
    }

    /**
     * 検索インデックスの更新
     */
    updateSearchIndex(entry) {
        const words = entry.command.toLowerCase().split(/\s+/);
        for (const word of words) {
            if (!this.searchIndex.has(word)) {
                this.searchIndex.set(word, new Set());
            }
            this.searchIndex.get(word).add(entry.id);
        }
    }

    /**
     * 統計の更新
     */
    updateStatistics(entry = null) {
        if (entry) {
            // 個別エントリの統計更新
            this.statistics.totalCommands++;
            this.statistics.sessionCommands++;
            
            const command = entry.command.split(' ')[0]; // 最初の単語のみ
            const currentCount = this.statistics.commandFrequency.get(command) || 0;
            this.statistics.commandFrequency.set(command, currentCount + 1);
            
            if (!entry.metadata.success) {
                this.statistics.errorCommands.add(command);
            }
        } else {
            // 全体統計の再計算
            this.statistics.totalCommands = this.history.length;
            this.statistics.commandFrequency.clear();
            this.statistics.errorCommands.clear();
            
            let totalLength = 0;
            for (const entry of this.history) {
                const command = entry.command.split(' ')[0];
                const currentCount = this.statistics.commandFrequency.get(command) || 0;
                this.statistics.commandFrequency.set(command, currentCount + 1);
                
                totalLength += entry.command.length;
                
                if (!entry.metadata.success) {
                    this.statistics.errorCommands.add(command);
                }
            }
            
            this.statistics.averageCommandLength = this.history.length > 0 ? 
                totalLength / this.history.length : 0;
        }
        
        // 最も使用されたコマンドの更新
        this.statistics.mostUsedCommands = Array.from(this.statistics.commandFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }

    /**
     * セッション統計の更新
     */
    updateSessionStatistics() {
        this.currentSession.totalTime = Date.now() - this.currentSession.startTime;
    }

    /**
     * 履歴のトリミング
     */
    trimHistory() {
        if (this.history.length > this.maxHistorySize) {
            const removeCount = this.history.length - this.maxHistorySize;
            this.history.splice(0, removeCount);
            this.buildSearchIndex(); // インデックスの再構築が必要
        }
    }

    /**
     * コマンドフィルタのマッチング
     */
    matchesCommandFilter(entry, filter) {
        if (typeof filter === 'string') {
            return entry.command.includes(filter);
        }
        if (typeof filter === 'function') {
            return filter(entry);
        }
        return true;
    }

    /**
     * CSV エクスポート
     */
    exportToCsv(data) {
        const headers = ['Command', 'Timestamp', 'Session ID', 'Success', 'Execution Time'];
        const rows = [headers.join(',')];
        
        for (const entry of data) {
            const row = [
                `"${entry.command.replace(/"/g, '""')}"`,
                entry.timestamp,
                entry.sessionId,
                entry.metadata.success,
                entry.metadata.executionTime
            ];
            rows.push(row.join(','));
        }
        
        return rows.join('\n');
    }

    /**
     * テキストエクスポート
     */
    exportToText(data) {
        return data.map(entry => {
            const date = new Date(entry.timestamp).toISOString();
            return `[${date}] ${entry.command}`;
        }).join('\n');
    }

    /**
     * インポートデータの検証
     */
    validateImportedEntries(entries) {
        return entries.filter(entry => {
            return entry.command && 
                   typeof entry.command === 'string' &&
                   entry.timestamp &&
                   typeof entry.timestamp === 'number';
        }).map(entry => ({
            id: entry.id || this.generateEntryId(),
            command: entry.command,
            timestamp: entry.timestamp,
            sessionId: entry.sessionId || 'imported',
            metadata: entry.metadata || { success: true, executionTime: 0 }
        }));
    }

    /**
     * 自動保存の開始
     */
    startAutoSave() {
        if (this.enableAutoSave) {
            setInterval(() => {
                this.saveHistory();
            }, this.saveInterval);
        }
    }

    /**
     * 履歴の保存
     */
    saveHistory() {
        try {
            const saveData = {
                history: this.history.slice(-this.maxHistorySize), // 最新分のみ保存
                statistics: {
                    ...this.statistics,
                    commandFrequency: Array.from(this.statistics.commandFrequency.entries()),
                    errorCommands: Array.from(this.statistics.errorCommands)
                },
                currentSession: this.currentSession
            };
            
            localStorage.setItem('debug-console-history-enhanced', JSON.stringify(saveData));
        } catch (error) {
            console.warn('Failed to save enhanced history:', error);
        }
    }

    /**
     * 履歴の読み込み
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('debug-console-history-enhanced');
            if (saved) {
                const saveData = JSON.parse(saved);
                
                this.history = saveData.history || [];
                
                if (saveData.statistics) {
                    this.statistics = {
                        ...this.statistics,
                        ...saveData.statistics,
                        commandFrequency: new Map(saveData.statistics.commandFrequency || []),
                        errorCommands: new Set(saveData.statistics.errorCommands || [])
                    };
                }
                
                if (saveData.currentSession) {
                    // 前回のセッションデータは参考程度に保持
                    this.previousSession = saveData.currentSession;
                }
                
                this.historyIndex = this.history.length;
            }
        } catch (error) {
            console.warn('Failed to load enhanced history:', error);
        }
    }

    /**
     * ID生成
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateEntryId() {
        return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.saveHistory();
        this.searchIndex.clear();
        this.searchCache.clear();
        this.searchFilters.clear();
        this.history = [];
    }
}

export default EnhancedHistoryManager;