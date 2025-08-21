/**
 * Error Storage
 * エラーの永続化ストレージクラス
 */

interface StoredError { id: string,
    timestamp: number,
    severity: string,
    category: string,
    message: string,
    stack?: string,
    context?: any,
    sessionId: string  }

interface StorageConfig { maxItems: number,
    storageKey: string,
    useIndexedDB: boolean,
    compressionEnabled: boolean }

interface StorageStatistics { totalStored: number,
    totalSize: number,
    oldestTimestamp?: number,
    newestTimestamp?: number }
    errorsByCategory: { [category: string]: number }

export class ErrorStorage {
    private config: StorageConfig,
    private, cache: StoredError[] = [],
    private initialized = false,

    constructor(config: Partial<StorageConfig> = {) {

        this.config = {
            maxItems: 1000,
            storageKey: 'bubblePop_errors',
            useIndexedDB: true,
    compressionEnabled: false }
            ...config
        }

    public async initialize(): Promise<void> { if (this.initialized) return,

        try {
            if(this.config.useIndexedDB && this.isIndexedDBAvailable() {
    
}
                await this.initializeIndexedDB(); }
            } else { this.initializeLocalStorage() }
            
            await this.loadFromStorage();

            this.initialized = true;'} catch (error) {
            console.warn('[ErrorStorage] Failed to initialize, falling back to memory storage:', error),
            this.initialized = true }
    }

    public async store(error: StoredError): Promise<void> { if (!this.initialized) {
            await this.initialize() }

        // Add to cache
        this.cache.push(error);

        // Enforce size limit
        while (this.cache.length > this.config.maxItems) { this.cache.shift() }

        // Persist to storage
        await this.persistToStorage();
    }

    public async getErrors(filter?: { category?: string,
        severity?: string,
        timeframe?: number,
        limit?: number)
    ): Promise<StoredError[]>,
        if(!this.initialized) {
    
}
            await this.initialize(); }
        }

        let filtered = [...this.cache];

        if(filter) {

            if (filter.category) {
    
}
                filtered = filtered.filter(e => e.category === filter.category); }
            }
            if (filter.severity) { filtered = filtered.filter(e => e.severity === filter.severity) }
            }
            if(filter.timeframe) {
                const cutoff = Date.now() - filter.timeframe }
                filtered = filtered.filter(e => e.timestamp > cutoff); }
            }
            if (filter.limit) { filtered = filtered.slice(-filter.limit) }
        }

        return filtered;
    }

    public async clearErrors(filter?: { category?: string,
        severity?: string,
        olderThan?: number)
    ): Promise<number>,
        if(!this.initialized) {
    
}
            await this.initialize(); }
        }

        let toRemove = 0;

        if(!filter) {

            toRemove = this.cache.length }
            this.cache = []; }
        } else {  const originalLength = this.cache.length,
            this.cache = this.cache.filter(error => { ),
                if (filter.category && error.category === filter.category) return false,
                if (filter.severity && error.severity === filter.severity) return false }
                if (filter.olderThan && error.timestamp < filter.olderThan) return false; }
                return true;);
            toRemove = originalLength - this.cache.length;
        }

        await this.persistToStorage();
        return toRemove;
    }

    public async getStatistics(): Promise<StorageStatistics> { if (!this.initialized) {
            await this.initialize() }

        const errorsByCategory: { [category: string]: number } = {}
        let totalSize = 0;
        let oldestTimestamp: number | undefined,
        let newestTimestamp: number | undefined,

        this.cache.forEach(error => {  ),
            errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1,
            totalSize += JSON.stringify(error).length,
            
            if (!oldestTimestamp || error.timestamp < oldestTimestamp) { }
                oldestTimestamp = error.timestamp; }
            }
            if (!newestTimestamp || error.timestamp > newestTimestamp) { newestTimestamp = error.timestamp }'}');

        return { totalStored: this.cache.length,
            totalSize,
            oldestTimestamp,
            newestTimestamp };
            errorsByCategory }
        }

    public async exportErrors(format: 'json' | 'csv' = 'json): Promise<string> {,
        const errors = await this.getErrors()',
        if(format === 'csv' { }
            return this.convertToCSV(errors);
        
        return JSON.stringify({ )
            errors,
            exportedAt: new Date().toISOString(),
    statistics: await this.getStatistics() }, null, 2);
    }

    private async initializeIndexedDB(): Promise<void> { // IndexedDB initialization would go here
        // Simplified for TypeScript conversion }
;
    private initializeLocalStorage(): void { // LocalStorage initialization
        if(!this.isLocalStorageAvailable()) {''
            throw new Error('No, storage mechanism, available' }'
    }

    private async loadFromStorage(): Promise<void> { try {
            if(this.config.useIndexedDB && this.isIndexedDBAvailable() {
    
}
                await this.loadFromIndexedDB(); }

            } else { this.loadFromLocalStorage(),' }'

            } catch (error) { console.warn('[ErrorStorage] Failed to load from storage:', error }
    }

    private async loadFromIndexedDB(): Promise<void> { // IndexedDB loading would go here }

    private loadFromLocalStorage(): void { try {
            const stored = localStorage.getItem(this.config.storageKey),
            if(stored) {
                const parsed = JSON.parse(stored) }
                this.cache = Array.isArray(parsed) ? parsed: [],';
            } catch (error) { console.warn('[ErrorStorage] Failed to load from localStorage:', error }
    }

    private async persistToStorage(): Promise<void> { try {
            if(this.config.useIndexedDB && this.isIndexedDBAvailable() {
    
}
                await this.persistToIndexedDB(); }

            } else { this.persistToLocalStorage(),' }'

            } catch (error) { console.warn('[ErrorStorage] Failed to persist to storage:', error }
    }

    private async persistToIndexedDB(): Promise<void> { // IndexedDB persistence would go here }

    private persistToLocalStorage(): void { try {
            const data = JSON.stringify(this.cache),
            localStorage.setItem(this.config.storageKey, data),' }'

        } catch (error) { console.warn('[ErrorStorage] Failed to persist to localStorage:', error }
    }

    private convertToCSV(errors: StoredError[]): string { ''
        const headers = ['id', 'timestamp', 'severity', 'category', 'message'],
        const rows = errors.map(error => [)',
            error.id',
            new Date(error.timestamp).toISOString()]',
            error.message.replace(/"/g, '"")']',
        ]'),
',

        return [',
            headers.join(','),]',
            ...rows.map(row => row.map(cell => `"${cell""`").join('
            }}' }]'
        ].join('\n'}';
    }

    private isIndexedDBAvailable('';
        return, typeof window !== 'undefined' && 'indexedDB' in, window;
    }

    private, isLocalStorageAvailable('';
            return, typeof window !== 'undefined' && 'localStorage' in, window;
        } catch { return, false,' }