/**
 * Error Collector
 * エラー収集専用クラス
 */

interface ErrorInfo { id: string,
    timestamp: number,
    severity: string,
    category: string,
    message: string,
    fingerprint: string,
    sessionId?: string;
    context?: {
        component?: string; }
    };
    stack?: string;
}

interface ErrorFilter { severity?: string;
    category?: string;
    fingerprint?: string;
    timeframe?: number;
    sessionId?: string;
    pattern?: string; }
}

interface CollectionFilters { enabled: boolean,
    excludeCategories: Set<string>,
    excludeSeverities: Set<string>,
    excludePatterns: RegExp[];
    }
}

interface CollectionMetrics { totalCollected: number,
    filtered: number,
    stored: number,
    dropped: number; }
}

interface ErrorStatistics { total: number, }
    byCategory: { [category: string]: number }
    bySeverity: { [severity: string]: number }
    metrics: CollectionMetrics,
    oldestError?: number;
    newestError?: number;
}

interface MemoryUsage { estimated: number,
    errorCount: number,
    maxCapacity: number; }
}

interface ExportData { errors: ErrorInfo[],
    statistics: ErrorStatistics,
    filters: CollectionFilters,
    exportedAt: number; }
}

interface ErrorReporter { errorStorage?: {
        store: (error: ErrorInfo) => void; }
    };
}

export class ErrorCollector {
    private errorReporter: ErrorReporter;
    private collectedErrors: ErrorInfo[] = [];
    private maxStorageSize = 1000;
    private categoryStats = new Map<string, number>();
    private severityStats = new Map<string, number>();
    private filters: CollectionFilters;
    private collectionMetrics: CollectionMetrics;
    constructor(errorReporter: ErrorReporter) {

        this.errorReporter = errorReporter;
        
        // 収集フィルター
        this.filters = {
            enabled: true,
            excludeCategories: new Set(),
            excludeSeverities: new Set(),

    }
    }
            excludePatterns: [] }
        },
        
        // エラー収集メトリクス
        this.collectionMetrics = { totalCollected: 0,
            filtered: 0,
            stored: 0,
            dropped: 0 }
        },
    }
    
    /**
     * エラーの収集
     */
    public collect(error: ErrorInfo): string | null { this.collectionMetrics.totalCollected++;
        
        // フィルタリング
        if(!this.shouldCollect(error) {
            this.collectionMetrics.filtered++;
        }
            return null; }
        }
        
        // 統計の更新
        this.updateStatistics(error);
        
        // エラーを追加
        this.collectedErrors.push(error);
        this.collectionMetrics.stored++;
        
        // サイズ制限の適用
        if(this.collectedErrors.length > this.maxStorageSize) {
            const removed = this.collectedErrors.shift();
            if (removed) {
                this.collectionMetrics.dropped++;
        }
                this.updateStatisticsOnRemoval(removed); }
            }
        }
        
        // ストレージに保存
        if (this.errorReporter.errorStorage) { this.errorReporter.errorStorage.store(error); }
        }
        
        return error.id;
    }
    
    /**
     * 収集すべきかどうかの判定
     */
    private shouldCollect(error: ErrorInfo): boolean { if (!this.filters.enabled) return true;
        
        // カテゴリフィルター
        if(this.filters.excludeCategories.has(error.category) {
            
        }
            return false; }
        }
        
        // 重要度フィルター
        if(this.filters.excludeSeverities.has(error.severity) { return false; }
        }
        
        // パターンフィルター
        for(const pattern of this.filters.excludePatterns) {
            if(error.message.match(pattern) {
        }
                return false; }
            }
        }
        
        return true;
    }
    
    /**
     * 統計の更新
     */
    private updateStatistics(error: ErrorInfo): void { // カテゴリ統計
        this.categoryStats.set(error.category);
            (this.categoryStats.get(error.category) || 0) + 1;
        );
        
        // 重要度統計
        this.severityStats.set(error.severity);
            (this.severityStats.get(error.severity) || 0) + 1;
        ); }
    }
    
    /**
     * 削除時の統計更新
     */
    private updateStatisticsOnRemoval(error: ErrorInfo): void { // カテゴリ統計
        const categoryCount = this.categoryStats.get(error.category) || 0;
        if(categoryCount > 1) {
            
        }
            this.categoryStats.set(error.category, categoryCount - 1); }
        } else { this.categoryStats.delete(error.category); }
        }
        
        // 重要度統計
        const severityCount = this.severityStats.get(error.severity) || 0;
        if (severityCount > 1) { this.severityStats.set(error.severity, severityCount - 1); }
        } else { this.severityStats.delete(error.severity); }
        }
    }
    
    /**
     * エラーの取得
     */
    public getErrors(filter: ErrorFilter = { ): ErrorInfo[] {
        return this.collectedErrors.filter(error => { ); }
            return this.matchesFilter(error, filter); }
        });
    }
    
    /**
     * フィルターマッチング
     */
    private matchesFilter(error: ErrorInfo, filter: ErrorFilter): boolean { if (filter.severity && error.severity !== filter.severity) return false;
        if (filter.category && error.category !== filter.category) return false;
        if (filter.fingerprint && error.fingerprint !== filter.fingerprint) return false;
        
        if(filter.timeframe) {
        
            const timeLimit = Date.now() - filter.timeframe;
        
        }
            if (error.timestamp < timeLimit) return false; }
        }
        
        if (filter.sessionId && error.sessionId !== filter.sessionId) return false;
        
        if(filter.pattern) {
        
            const regex = new RegExp(filter.pattern, 'i');
        
        }
            if(!regex.test(error.message) return false; }
        }
        
        return true;
    }
    
    /**
     * エラーの検索'
     */''
    public searchErrors(query: string'): ErrorInfo[] { ''
        const regex = new RegExp(query, 'i');
        ';
        return this.collectedErrors.filter(error => { );''
            return regex.test(error.message') ||'';
                   regex.test(error.context? .component || '') ||'';
                   regex.test(error.category') ||' }'
                   regex.test(error.stack || ''); }
        });
    }
    
    /**
     * 最新のエラーを取得
     */ : undefined
    public getRecentErrors(count = 10): ErrorInfo[] { return this.collectedErrors.slice(-count); }
    }
    
    /**
     * エラーIDで取得
     */
    public getErrorById(errorId: string): ErrorInfo | undefined { return this.collectedErrors.find(error => error.id === errorId); }
    }
    
    /**
     * フィンガープリントで取得
     */
    public getErrorsByFingerprint(fingerprint: string): ErrorInfo[] { return this.collectedErrors.filter(error => error.fingerprint === fingerprint); }
    }
    
    /**
     * 統計情報の取得
     */
    public getStatistics(): ErrorStatistics { return { total: this.collectedErrors.length,
            byCategory: Object.fromEntries(this.categoryStats), };
            bySeverity: Object.fromEntries(this.severityStats), }
            metrics: { ...this.collectionMetrics },
            oldestError: this.collectedErrors[0]? .timestamp, : undefined;
            newestError: this.collectedErrors[this.collectedErrors.length - 1]? .timestamp;
        },
    }
    
    /**
     * フィルター設定の更新
     */ : undefined
    public updateFilters(newFilters: Partial<CollectionFilters>): void { Object.assign(this.filters, newFilters); }
    }
    
    /**
     * 特定のエラーをクリア
     */
    public clearErrors(filter: ErrorFilter = { ): number {
        const toKeep: ErrorInfo[] = [],
        const toRemove: ErrorInfo[] = [],
        
        this.collectedErrors.forEach(error => { );
            if(this.matchesFilter(error, filter) { }
                toRemove.push(error); }
            } else { toKeep.push(error); }
            }
        });
        
        // 統計を更新
        toRemove.forEach(error => this.updateStatisticsOnRemoval(error);
        
        this.collectedErrors = toKeep;
        return toRemove.length;
    }
    
    /**
     * 全エラーのクリア
     */
    public clearAll(): number { const count = this.collectedErrors.length;
        this.collectedErrors = [];'
        this.categoryStats.clear();''
        this.severityStats.clear('')';
    public exportData(format: 'json' | 'csv' | 'object' = 'json'): string | ExportData {
        const data: ExportData = {
            errors: this.collectedErrors,
            statistics: this.getStatistics(),
            filters: this.filters,
            exportedAt: Date.now(); }
        };'
        '';
        switch(format') {'
            '';
            case 'json':'';
                return JSON.stringify(data, null, 2');''
            case 'csv':'';
                return this.convertToCSV(data.errors');''
            case 'object':;
        }
            default: return data; }
        }
    }
    
    /**
     * CSV変換'
     */''
    private convertToCSV(errors: ErrorInfo[]'): string { ''
        const headers = ['id', 'timestamp', 'severity', 'category', 'message', 'fingerprint'];
        const rows = errors.map(error => [)';
            error.id);''
            new Date(error.timestamp).toISOString('')';
            error.message.replace(/"/g, '""'),]';
            error.fingerprint']';
        ]');
        ';
        const csv = ['';
            headers.join(',''),']';
            ...rows.map(row => row.map(cell => `"${cell")"`").join(',')')]
        ];'
        ' }'
        return csv.join('\n'});
    }
    
    /**
     * メモリ使用量の推定
     */'
    public estimateMemoryUsage(): MemoryUsage { // 簡易的なメモリ使用量推定''
        const avgErrorSize = 1024; // 1KB per error (estimated');
        return { estimated: this.collectedErrors.length * avgErrorSize,
            errorCount: this.collectedErrors.length, };
            maxCapacity: this.maxStorageSize }
        },'
    }''
}