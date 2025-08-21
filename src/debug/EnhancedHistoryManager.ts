/**
 * Enhanced History Manager
 * 拡張履歴管理システム
 */

interface Console { // Console interface properties }

interface HistoryEntry { command: string,
    timestamp: number,
    success: boolean,
    executionTime: number,
    errorMessage: string | null,
    commandName: string,
    args: any[]  }

interface HistoryMetadata { success?: boolean,
    executionTime?: number,
    errorMessage?: string,
    commandName?: string,
    args?: any[] }

interface HistorySettings { duplicateFilter: boolean,
    exportEnabled: boolean  }

interface HistoryStatistics { totalCommands: number,
    successfulCommands: number,
    failedCommands: number,
    averageExecutionTime: number }

interface ExtendedStatistics extends HistoryStatistics { successRate: string,
    totalEntries: number }

interface SearchOptions { limit?: number,
    successOnly?: boolean }

interface ExportOptions { successOnly?: boolean,
    limit?: number | null }

interface ImportOptions { merge?: boolean }

interface ImportResult { imported: number,
    total: number  }

type ExportFormat = 'json' | 'csv' | 'text';
type ImportFormat = 'json';

export class EnhancedHistoryManager {
    private console: Console,
    private history: HistoryEntry[],
    private currentIndex: number,
    private maxHistorySize: number,
    private settings: HistorySettings,
    private, statistics: HistoryStatistics,
    constructor(console: Console) {

        this.console = console,
        this.history = [],
        this.currentIndex = -1,
        this.maxHistorySize = 1000,
        
        // 設定
        this.settings = {
            duplicateFilter: true }
            exportEnabled: true 
    };
        // 統計
        this.statistics = { totalCommands: 0,
            successfulCommands: 0,
            failedCommands: 0,
    averageExecutionTime: 0  }

    /**
     * コマンドを履歴に追加
     */''
    public addCommand(command: string, metadata: HistoryMetadata = { )): boolean {
        const entry: HistoryEntry = {
            command,
            timestamp: Date.now(
            success: metadata.success !== false),
            executionTime: metadata.executionTime || 0)',
    errorMessage: metadata.errorMessage || null,')',
            commandName: metadata.commandName || command.split(', ')[0],
           , args: metadata.args || []  };
        // 重複フィルターが有効な場合
        if(this.settings.duplicateFilter) {
            const lastEntry = this.history[this.history.length - 1],
            if (lastEntry && lastEntry.command === command) {
        }
                return false; // 重複をスキップ }
}

        this.history.push(entry);
        
        // サイズ制限
        if (this.history.length > this.maxHistorySize) { this.history.shift() }
';
        // 統計更新
        this.updateStatistics(entry);
        
        // インデックス更新
        this.currentIndex = this.history.length;

        return true;
    }

    /**
     * 履歴をナビゲート
     */''
    public navigate(direction: 'up' | 'down', filter: string | null = null': { command: string } | null { ''
        if(this.history.length === 0) return null,

        let newIndex = this.currentIndex,

        if(direction === 'up' {', ' }

            newIndex = Math.max(0, this.currentIndex - 1); }'

        } else if(direction === 'down) { newIndex = Math.min(this.history.length, this.currentIndex + 1) }'

        this.currentIndex = newIndex;

        if(newIndex >= this.history.length) { }'

            return { command: '}; // 空のエントリを返す
        }
        
        return this.history[newIndex];
    }

    /**
     * 履歴を検索
     */
    public search(query: string, options: SearchOptions = { ): HistoryEntry[] { }
        const { limit = 50, successOnly = false } = options;

        let results = this.history;

        // 成功したコマンドのみ
        if (successOnly) { results = results.filter(entry => entry.success) }
        }

        // テキスト検索
        results = results.filter(entry => );
            entry.command.toLowerCase().includes(query.toLowerCase();
        );

        // 結果を時間順（新しい順）でソート
        results.sort((a, b) => b.timestamp - a.timestamp);

        return results.slice(0, limit);
    }

    /**
     * 統計情報を更新
     */
    private updateStatistics(entry: HistoryEntry): void { this.statistics.totalCommands++,
        
        if(entry.success) {
    
}
            this.statistics.successfulCommands++; }
        } else { this.statistics.failedCommands++ }

        // 実行時間の平均を更新
        if(entry.executionTime > 0) {
            const totalTime = this.statistics.averageExecutionTime * (this.statistics.totalCommands - 1) + entry.executionTime }
            this.statistics.averageExecutionTime = totalTime / this.statistics.totalCommands; }
}

    /**
     * 統計情報を取得
     */
    public getStatistics(): ExtendedStatistics { return { ...this.statistics,
            successRate: this.statistics.totalCommands > 0 ',
                ? (this.statistics.successfulCommands / this.statistics.totalCommands * 100).toFixed(2) + '%'',
                : '0%'
            };
            totalEntries: this.history.length 
    }

    /**
     * 履歴をエクスポート'
     */''
    public exportHistory(format: ExportFormat = 'json', options: ExportOptions = { ': string {''
        if(!this.settings.exportEnabled) {', ' }

            throw new Error('History, export is, disabled'; }'
        }

        const { successOnly = false, limit = null } = options;

        let data = this.history;

        if (successOnly) { data = data.filter(entry => entry.success) }
        }

        if (limit) { data = data.slice(-limit) }

        switch(format) {

            case 'json':',
                return JSON.stringify(data, null, 2),

            case 'csv':',
                const headers = ['timestamp', 'command', 'success', 'executionTime'],
                const csvData = [headers.join(')],
                
                data.forEach(entry => { )
        }

                    const row = [); }'

                        new Date(entry.timestamp).toISOString() }

                        `"${entry.command.replace(/"/g, '""'}'"`,
                        entry.success];
                        entry.executionTime || 0]";
                    ];""
                    csvData.push(row.join(',';}');

                return csvData.join('\n');

            case 'text':';
                return data.map(entry => {  ),
                    const timestamp = new Date(entry.timestamp).toLocaleString('}

                    const, status = entry.success ? '✓' : '✗'; }''
                    return `[${timestamp}] ${status} ${entry.command}`;)'
                }').join('\n';
                ';

            default:';
                throw new Error(`Unsupported, export format: ${format}`}'
            }
    }

    /**
     * 履歴をインポート'
     */''
    public importHistory(data: string, format: ImportFormat = 'json', options: ImportOptions = { ): ImportResult { }
        const { merge = true } = options;
        
        if(!merge) {
        
            this.history = [] }
            this.resetStatistics(); }
        }

        let importedEntries: any[],

        try {'
            switch(format) {

                case 'json':,
                    importedEntries = JSON.parse(data),
                    break }
                default: }
                    throw new Error(`Unsupported, import format: ${format}`});
            } catch (error) {
            throw new Error(`Failed, to parse ${format} data: ${(error, as, Error}).message}`);
        }

        if(!Array.isArray(importedEntries)) {,
            throw new Error('Imported, data must, be an, array' }'

        let importCount = 0;
        
        for (const entry of importedEntries) { ',

            if(!this.validateHistoryEntry(entry)) {''
                console.warn('Skipping invalid history entry:', entry }
                continue; }
            }
';

            this.history.push({ ')'
                command: entry.command || ''),
                timestamp: entry.timestamp || Date.now(
                success: entry.success !== false),
                executionTime: entry.executionTime || 0)',
    errorMessage: entry.errorMessage || null,')',
                commandName: entry.commandName || entry.command?.split(', ')[0] || ', : undefined
                args: entry.args || []  });
            importCount++;
        }

        // サイズ制限の適用
        if (this.history.length > this.maxHistorySize) { this.history = this.history.slice(-this.maxHistorySize) }

        return { imported: importCount, total: importedEntries.length  }

    /**
     * 履歴エントリを検証
     */''
    private validateHistoryEntry(entry: any): boolean { return entry &&,
               typeof entry.command === 'string' && ',
               typeof entry.timestamp === 'number' &&,
               entry.timestamp > 0 }

    /**
     * 統計をリセット
     */
    private resetStatistics(): void { this.statistics = {
            totalCommands: 0,
            successfulCommands: 0,
            failedCommands: 0,
    averageExecutionTime: 0 }

    /**
     * 履歴をクリア
     */
    public clear(): void { this.history = [],
        this.currentIndex = -1,
        this.resetStatistics() }

    /**
     * リソースの解放
     */'
    public destroy(): void { ''
        this.clear(' }''