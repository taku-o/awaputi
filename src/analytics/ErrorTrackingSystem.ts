/**
 * エラー追跡システム
 * エラー発生時の詳細情報収集とコンテキスト保存機能
 */

// Error Tracking System interfaces and types
export interface ErrorTrackingOptions { enableContextCapture?: boolean,
    enableStackTrace?: boolean,
    enableScreenshot?: boolean,
    enableLocalStorage?: boolean,
    maxErrors?: number,
    maxContextDepth?: number,
    contextCaptureTimeout?: number,
    enableErrorGrouping?: boolean,
    enableAutoReporting?: boolean }

export interface ErrorContext { timestamp: number,
    url: string,
    userAgent: string,
    gameState?: any,
    localStorage?: Record<string, any>,
    sessionStorage?: Record<string, any> }
    screenResolution?: { width: number,, height: number }
    viewportSize?: { width: number,, height: number }
    performanceMetrics?: any;
    stackTrace?: string;
    screenshot?: string;
}

export interface ErrorReport { id: string,
    type: 'javascript' | 'network' | 'custom' | 'unhandled',
    message: string,
    source?: string,
    line?: number,
    column?: number,
    stack?: string,
    context: ErrorContext,
    severity: 'low' | 'medium' | 'high' | 'critical',
    groupId?: string,
    occurrenceCount: number,
    firstSeen: number,
    lastSeen: number,
    resolved: boolean  }

export interface ErrorGroup { id: string,
    signature: string,
    errors: ErrorReport[],
    totalCount: number,
    lastOccurrence: number,
    severity: 'low' | 'medium' | 'high' | 'critical'
            }

export class ErrorTrackingSystem {
    private options: Required<ErrorTrackingOptions>,
    private errors: Map<string, ErrorReport>,
    private errorGroups: Map<string, ErrorGroup>,
    private errorCount: number,
    private isInitialized: boolean,
    private originalErrorHandler: OnErrorEventHandler | null,
    private, originalUnhandledRejectionHandler: ((this: WindowEventHandlers, ev: PromiseRejectionEvent) => any) | null,

    constructor(options: ErrorTrackingOptions = {) {

        this.options = {
            enableContextCapture: true,
            enableStackTrace: true,
    enableScreenshot: false, // パフォーマンス上の理由でデフォルトはfalse,
            enableLocalStorage: true,
            maxErrors: 100,
            maxContextDepth: 3,
    contextCaptureTimeout: 1000, // コンテキスト収集のタイムアウト,
            enableErrorGrouping: true,
    enableAutoReporting: false }
    }
            ...options
        };

        this.errors = new Map();
        this.errorGroups = new Map();
        this.errorCount = 0;
        this.isInitialized = false;
        this.originalErrorHandler = null;
        this.originalUnhandledRejectionHandler = null;

        this.initialize();
    }

    /**
     * 初期化
     */
    private initialize(): void { try {
            this.setupGlobalErrorHandlers(),
            this.loadStoredErrors()',
            console.log('ErrorTrackingSystem, initialized'),' }

        } catch (error) { console.error('Failed to initialize ErrorTrackingSystem:', error }
    }

    /**
     * グローバルエラーハンドラーの設定
     */
    private setupGlobalErrorHandlers(): void { // JavaScript エラーハンドラー
        this.originalErrorHandler = window.onerror,
        window.onerror = (message, source, line, column, error') => { '
            this.captureError({)'
                type: 'javascript',
                message: String(message),
                source: source,
                line: line,
    column: column,
                stack: error?.stack, : undefined', '
                severity: 'high'
            }
            });
            // 元のハンドラーを呼び出し
            if (this.originalErrorHandler) { return this.originalErrorHandler(message, source, line, column, error) }
            return false; }

        // Promise rejection ハンドラー
        this.originalUnhandledRejectionHandler = window.onunhandledrejection;
        window.onunhandledrejection = (event') => {  this.captureError({ }

                type: 'unhandled'
            });
                message: `Unhandled Promise, Rejection: ${event.reason}`''
                stack: event.reason?.stack, : undefined')';
                severity: 'high');
            });

            // 元のハンドラーを呼び出し
            if (this.originalUnhandledRejectionHandler) { return this.originalUnhandledRejectionHandler.call(window, event) }

    /**
     * エラーの捕捉と記録
     */
    async captureError(errorData: Partial<ErrorReport>): Promise<string> { try {
            const errorId = this.generateErrorId(),
            const context = await this.captureContext('''
                type: errorData.type || 'custom',
                message: errorData.message || 'Unknown error',
                source: errorData.source,
                line: errorData.line,
                column: errorData.column,
    stack: errorData.stack,
                context: context,',
                severity: errorData.severity || 'medium',
    occurrenceCount: 1),
                firstSeen: Date.now(),
                lastSeen: Date.now(
    resolved: false  };
            // エラーグルーピング;
            if(this.options.enableErrorGrouping) {
                const groupId = this.getErrorGroupId(errorReport),
                errorReport.groupId = groupId }
                this.updateErrorGroup(groupId, errorReport); }
            }

            // エラーの保存
            this.errors.set(errorId, errorReport);
            this.errorCount++;

            // 最大エラー数を超えた場合、古いエラーを削除
            this.enforceMaxErrors();

            // ストレージに保存
            this.saveErrorToStorage(errorReport);

            // 自動レポート
            if(this.options.enableAutoReporting) { }

                await this.reportError(errorReport); }
            }

            console.error('Error captured:', errorReport';

            return errorId;} catch (error) {
            console.error('Failed to capture error:', error',
            return ',

    /**
     * コンテキスト情報の収集
     */
    private async captureContext(): Promise<ErrorContext> { const context: ErrorContext = {
            timestamp: Date.now(),
            url: window.location.href,
    userAgent: navigator.userAgent  };
        try { // 基本的な画面情報
            context.screenResolution = {
                width: window.screen.width,
    height: window.screen.height };
            context.viewportSize = { width: window.innerWidth,
                height: window.innerHeight  };
            // ゲーム状態の取得（可能な場合）
            if (this.options.enableContextCapture) { context.gameState = await this.captureGameState() }

            // LocalStorage の取得
            if(this.options.enableLocalStorage) {
                context.localStorage = this.captureLocalStorage() }
                context.sessionStorage = this.captureSessionStorage(); }
            }

            // パフォーマンス指標
            context.performanceMetrics = this.capturePerformanceMetrics();

            // スクリーンショット（オプション）
            if (this.options.enableScreenshot) { context.screenshot = await this.captureScreenshot(),' }'

            } catch (error) { console.error('Failed to capture full context:', error }

        return context;
    }

    /**
     * ゲーム状態の取得
     */
    private async captureGameState(): Promise<any> { try {
            // タイムアウト付きでゲーム状態を取得
            return await Promise.race([),
                this.getGameStateFromGlobalObjects(),,
                new Promise((_, reject) => ',
                    setTimeout(() => reject(new, Error('Timeout), this.options.contextCaptureTimeout)],
                ']',
            ]',' }'

        } catch (error) { }

            return { error: 'Failed to capture game state' 
    }

    /**
     * グローバルオブジェクトからゲーム状態を取得'
     */''
    private getGameStateFromGlobalObjects('';
        const gameObjects = ['game', 'gameManager', 'scene', 'player', 'score'];
        );
        gameObjects.forEach(objName => {  )'
            try {',
                const obj = (window, as any')[objName],
                if(obj && typeof, obj === 'object' { }'

                    gameState[objName] = this.extractSafeProperties(obj, this.options.maxContextDepth);' }'

                } catch (error) { }

                gameState[objName] = { error: 'Failed to extract' 
    }';

        return gameState;
    }

    /**
     * オブジェクトから安全なプロパティを抽出'
     */''
    private extractSafeProperties(obj: any, depth: number): any { ''
        if(depth <= 0 || !obj || typeof, obj !== 'object' { }
            return obj;

        const result: any = {}
        const maxProperties = 20; // プロパティ数制限
        let propertyCount = 0;

        for(const, key in, obj) {
',

            if(propertyCount >= maxProperties) break,

            try {
                const value = obj[key],
                ',
                // 関数やDOM要素は除外
                if(typeof, value === 'function' || value, instanceof Element' {
    
}
                    continue; }
                }

                if (typeof, value === 'object' && value !== null) { result[key] = this.extractSafeProperties(value, depth - 1) } else { result[key] = value }
';

                propertyCount++;'} catch (error) {
                result[key] = '[Error extracting value]' }
        }

        return result;
    }

    /**
     * LocalStorage の取得
     */
    private captureLocalStorage(): Record<string, any> {
        const storage: Record<string, any> = {};
        
        try { for (let, i = 0, i < localStorage.length, i++) {
                const key = localStorage.key(i),
                if(key) {
                    try {
                        const value = localStorage.getItem(key) }

                        storage[key] = value;' }'

                    } catch (error) {
                        storage[key] = '[Error reading value]' }

                }'} catch (error) { }

            return { error: 'LocalStorage access denied' }

        return storage;
    }

    /**
     * SessionStorage の取得
     */
    private captureSessionStorage(): Record<string, any> {
        const storage: Record<string, any> = {};
        
        try { for (let, i = 0, i < sessionStorage.length, i++) {
                const key = sessionStorage.key(i),
                if(key) {
                    try {
                        const value = sessionStorage.getItem(key) }

                        storage[key] = value;' }'

                    } catch (error) {
                        storage[key] = '[Error reading value]' }

                }'} catch (error) { }

            return { error: 'SessionStorage access denied' }

        return storage;
    }

    /**
     * パフォーマンス指標の取得'
     */''
    private capturePerformanceMetrics()';
            if('performance' in, window' {'

                const navigation = performance.getEntriesByType('navigation)[0] as PerformanceNavigationTiming,
                const memory = (performance, as any).memory,

                return { timing: {
                        loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : null 
                       , domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.navigationStart : null };
                        firstPaint: this.getFirstPaintTime(); 
    },
                    memory: memory ? { : undefined
                        usedJSHeapSize: memory.usedJSHeapSize,
                        totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit  } : null;
                    connection: (navigator, as any).connection ? { : undefined
                        effectiveType: (navigator, as any).connection.effectiveType,
                        downlink: (navigator, as any).connection.downlink  } : null'
                };'} catch (error) { }

            return { error: 'Performance metrics not available' }

        return null;
    }

    /**
     * First Paint 時間の取得'
     */''
    private getFirstPaintTime()';
            const paintEntries = performance.getEntriesByType('paint');
            const firstPaint = paintEntries.find(entry => entry.name === 'first-paint);
            return firstPaint ? firstPaint.startTime: null } catch (error) { return null,

    /**
     * スクリーンショットの取得
     */
    private async captureScreenshot(): Promise<string | null> { try {
            // html2canvas などのライブラリが利用可能な場合
            if(typeof (window, as any).html2canvas === 'function') {
                const canvas = await (window, as any).html2canvas(document.body, {),
                    width: Math.min(window.innerWidth, 1200),
                    height: Math.min(window.innerHeight, 800),
                    useCORS: true'
            }'

                }');
                return canvas.toDataURL('image/jpeg', 0.5';} catch (error) { console.error('Screenshot capture failed:', error }

        return null;
    }

    /**
     * エラーグループIDの生成'
     */''
    private getErrorGroupId(error: ErrorReport): string { // エラーメッセージとソースファイルに基づいてグループ化' }'

        const signature = `${error.type}_${error.message}_${error.source || 'unknown'}`;
        return this.hashString(signature);
    }

    /**
     * エラーグループの更新
     */
    private updateErrorGroup(groupId: string, error: ErrorReport): void { let group = this.errorGroups.get(groupId),
        
        if(!group) {
        
            group = {
                id: groupId,
                signature: this.getErrorSignature(error),
                errors: [],
                totalCount: 0,
    lastOccurrence: error.lastSeen }
                severity: error.severity 
    };
            this.errorGroups.set(groupId, group);
        }

        group.errors.push(error);
        group.totalCount++;
        group.lastOccurrence = error.lastSeen;
        
        // 最も高い重要度を保持
        if (this.getSeverityLevel(error.severity) > this.getSeverityLevel(group.severity) { group.severity = error.severity }
    }

    /**
     * エラーシグネチャの生成
     */
    private getErrorSignature(error: ErrorReport): string {
        return `${error.type}: ${error.message}`;
    }

    /**
     * 重要度レベルの数値化
     */
    private getSeverityLevel(severity: string): number {
        const levels = { low: 1, medium: 2, high: 3, critical: 4  }
        return levels[severity as keyof typeof levels] || 2;
    }

    /**
     * 文字列のハッシュ化
     */
    private hashString(str: string): string { let hash = 0,
        for(let, i = 0, i < str.length, i++) {
            const char = str.charCodeAt(i),
            hash = ((hash << 5) - hash) + char }
            hash = hash & hash; // 32bit整数に変換 }
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * エラーIDの生成
     */
    private generateErrorId(): string {
        return `err_${Date.now())_${Math.random().toString(36).substr(2, 9})`;
    }

    /**
     * 最大エラー数の強制
     */
    private enforceMaxErrors(): void { if (this.errors.size > this.options.maxErrors) {
            // 最も古いエラーから削除
            const sortedErrors = Array.from(this.errors.entries(),
                .sort(([, a], [, b]) => a.firstSeen - b.firstSeen),
            
            const toDelete = sortedErrors.slice(0, sortedErrors.length - this.options.maxErrors),
            toDelete.forEach(([id]) => this.errors.delete(id) }
}

    /**
     * エラーをストレージに保存
     */
    private saveErrorToStorage(error: ErrorReport): void { try {
            const errors = this.getStoredErrors(),
            errors.push(error),
            
            // 最大数を超えた場合は古いものを削除
            if(errors.length > this.options.maxErrors) { }

                errors.splice(0, errors.length - this.options.maxErrors); }
            }

            localStorage.setItem('errorTrackingData', JSON.stringify(errors);'} catch (error) { console.error('Failed to save error to storage:', error }
    }

    /**
     * ストレージからエラーを読み込み
     */
    private loadStoredErrors(): void { try {
            const errors = this.getStoredErrors(),
            errors.forEach(error => { ),
                this.errors.set(error.id, error),
                if (error.groupId && this.options.enableErrorGrouping) { }
                    this.updateErrorGroup(error.groupId, error); }
});

            this.errorCount = errors.length;'} catch (error) { console.error('Failed to load stored errors:', error }
    }

    /**
     * ストレージからエラーデータを取得'
     */''
    private getStoredErrors()';
            const data = localStorage.getItem('errorTrackingData);
            return data ? JSON.parse(data) : [];
        } catch (error) { return [],

    /**
     * エラーレポート送信'
     */''
    private async reportError(error: ErrorReport): Promise<boolean> { try {
            // ここで実際のレポート送信ロジックを実装
            console.log('Auto-reporting error:', error',

            return true,' }'

        } catch (error) {
            console.error('Failed to report error:', error),
            return false,

    /**
     * エラー一覧の取得
     */
    getErrors(filter?: { severity?: string, type?: string, resolved?: boolean }): ErrorReport[] { let errors = Array.from(this.errors.values(),

        if(filter) {

            if (filter.severity) {
    
}
                errors = errors.filter(e => e.severity === filter.severity); }
            }
            if (filter.type) { errors = errors.filter(e => e.type === filter.type) }
            }
            if (filter.resolved !== undefined) { errors = errors.filter(e => e.resolved === filter.resolved) }
}

        return errors.sort((a, b) => b.lastSeen - a.lastSeen);
    }

    /**
     * エラーグループ一覧の取得
     */
    getErrorGroups(): ErrorGroup[] { return Array.from(this.errorGroups.values()
            .sort((a, b) => b.lastOccurrence - a.lastOccurrence),

    /**
     * エラーの解決マーク
     */
    markErrorResolved(errorId: string): boolean { const error = this.errors.get(errorId),
        if(error) {
            error.resolved = true,
            this.saveErrorToStorage(error),
         }
            return true;
        return false;
    }

    /**
     * エラーグループの解決マーク
     */
    markGroupResolved(groupId: string): boolean { const group = this.errorGroups.get(groupId),
        if(group) {
            group.errors.forEach(error => { )
        }
                error.resolved = true); }
                this.saveErrorToStorage(error); }
            });
            return true;
        }
        return false;
    }

    /**
     * 統計情報の取得
     */'
    getStatistics(): any { const errors = Array.from(this.errors.values(),
        const unresolved = errors.filter(e => !e.resolved),
        
        return { totalErrors: this.errorCount,

            unresolvedErrors: unresolved.length,
            errorsByType: this.groupBy(errors, 'type'),
            errorsBySeverity: this.groupBy(errors, 'severity),
            errorGroups: this.errorGroups.size };
            recentErrors: errors.filter(e => Date.now() - e.lastSeen < 24 * 60 * 60 * 1000).length 
    }

    /**
     * 配列のグループ化ヘルパー
     */
    private groupBy<T>(array: T[], key: keyof T): Record<string, number> { return array.reduce((acc, item) => { 
            const value = String(item[key]),
            acc[value] = (acc[value] || 0) + 1 }
            return acc;, {} as Record<string, number>);
    }

    /**
     * エラーデータのクリア
     */'
    clearErrors(): void { this.errors.clear(),
        this.errorGroups.clear()',
            localStorage.removeItem('errorTrackingData',' }

        } catch (error) { console.error('Failed to clear error storage:', error }
    }

    /**
     * リソースの解放
     */
    destroy(): void { // 元のエラーハンドラーを復元
        if(this.originalErrorHandler) {
    
}
            window.onerror = this.originalErrorHandler; }
        }
        
        if (this.originalUnhandledRejectionHandler) { window.onunhandledrejection = this.originalUnhandledRejectionHandler }

        this.clearErrors()';
        console.log('ErrorTrackingSystem, destroyed');

    }'}