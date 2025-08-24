/**
 * ロギングシステム
 * 
 * 設定変更履歴の記録機能を提供し、
 * デバッグモードでの詳細ログ出力を実装します。
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

export interface LogEntry {
    level: string;
    message: string;
    data?: any;
    timestamp?: Date;
    source?: string;
}

export interface LoggingConfig {
    maxLogSize?: number;
    logLevel?: string;
    enableConsole?: boolean;
    enableTimestamp?: boolean;
    enableSource?: boolean;
    filterCategories?: string[] | null;
}

export interface LogStats {
    total: number;
    byLevel: {
        debug: number;
        info: number;
        warn: number;
        error: number;
    };
    byCategory: { [key: string]: number };
}

export interface LogOptions {
    level?: string;
    category?: string;
    limit?: number;
    newest?: boolean;
}

export class LoggingSystem {
    private logs: LogEntry[];
    private config: Required<LoggingConfig>;
    private logLevels: { [key: string]: number };
    private stats: LogStats;

    constructor(options: LoggingConfig = {}) {
        // ログストレージ
        this.logs = [];
        
        // 設定
        this.config = {
            maxLogSize: options.maxLogSize || 1000,
            logLevel: options.logLevel || 'info', // 'debug', 'info', 'warn', 'error'
            enableConsole: options.enableConsole !== undefined ? options.enableConsole : true,
            enableTimestamp: options.enableTimestamp !== undefined ? options.enableTimestamp : true,
            enableSource: options.enableSource !== undefined ? options.enableSource : true,
            filterCategories: options.filterCategories || null
        };

        // ログレベル定義
        this.logLevels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };

        // 統計情報
        this.stats = {
            total: 0,
            byLevel: {
                debug: 0,
                info: 0,
                warn: 0,
                error: 0
            },
            byCategory: {}
        };
    }
    
    /**
     * デバッグレベルのログを記録
     * @param message - ログメッセージ
     * @param data - 追加データ
     * @param source - ログソース
     */
    debug(message: string, data: any = null, source: string | null = null): void {
        this._log('debug', message, data, source);
    }
    
    /**
     * 情報レベルのログを記録
     * @param message - ログメッセージ
     * @param data - 追加データ
     * @param source - ログソース
     */
    info(message: string, data: any = null, source: string | null = null): void {
        this._log('info', message, data, source);
    }
    
    /**
     * 警告レベルのログを記録
     * @param message - ログメッセージ
     * @param data - 追加データ
     * @param source - ログソース
     */
    warn(message: string, data: any = null, source: string | null = null): void {
        this._log('warn', message, data, source);
    }
    
    /**
     * エラーレベルのログを記録
     * @param message - ログメッセージ
     * @param data - 追加データ
     * @param source - ログソース
     */
    error(message: string, data: any = null, source: string | null = null): void {
        this._log('error', message, data, source);
    }
    
    /**
     * 設定変更を記録
     * @param category - 設定カテゴリ
     * @param key - 設定キー
     * @param oldValue - 古い値
     * @param newValue - 新しい値
     * @param source - 変更ソース
     */
    logConfigChange(category: string, key: string, oldValue: any, newValue: any, source: string | null = null): void {
        const data = {
            category,
            key,
            oldValue,
            newValue,
            changeType: oldValue === undefined ? 'create' : 
                        newValue === undefined ? 'delete' : 'update'
        };
        this._log('info', `設定変更: ${category}.${key}`, data, source);
    }
    
    /**
     * 設定競合を記録
     * @param category - 設定カテゴリ
     * @param key - 設定キー
     * @param value1 - 値1
     * @param value2 - 値2
     * @param resolvedValue - 解決された値
     * @param source - 競合ソース
     */
    logConfigConflict(category: string, key: string, value1: any, value2: any, resolvedValue: any, source: string | null = null): void {
        const data = {
            category,
            key,
            value1,
            value2,
            resolvedValue
        };

        this._log('warn', `設定競合: ${category}.${key}`, data, source);
    }
    
    /**
     * 設定アクセスを記録（デバッグモードのみ）
     * @param category - 設定カテゴリ
     * @param key - 設定キー
     * @param value - アクセスされた値
     * @param source - アクセスソース
     */
    logConfigAccess(category: string, key: string, value: any, source: string | null = null): void {
        if (this._isDebugMode()) {
            const data = {
                category,
                key,
                value
            };

            this._log('debug', `設定アクセス: ${category}.${key}`, data, source);
        }
    }

    /**
     * ログを取得
     * @param options - 取得オプション
     * @returns ログエントリの配列
     */
    getLogs(options: LogOptions = {}): LogEntry[] {
        try {
            let result = [...this.logs];
            
            // レベルでフィルタ
            if (options.level) {
                const minLevel = this.logLevels[options.level];
                if (minLevel !== undefined) {
                    result = result.filter(log => this.logLevels[log.level] >= minLevel);
                }
            }
            
            // カテゴリでフィルタ
            if (options.category && options.category !== 'all') {
                result = result.filter(log => {
                    if (log.data && log.data.category) {
                        return log.data.category === options.category;
                    }
                    return false;
                });
            }
            
            // ソート（最新順）
            if (options.newest) {
                result.reverse();
            }
            
            // 件数制限
            if (options.limit && options.limit > 0) {
                result = result.slice(0, options.limit);
            }

            return result;
        } catch (error) {
            ErrorHandler.handle(error as Error, 'LoggingSystem.getLogs');
            return [];
        }
    }
    
    /**
     * 設定変更履歴を取得
     * @param category - 設定カテゴリ（nullの場合は全て）
     * @param key - 設定キー（nullの場合は全て）
     * @param limit - 取得件数制限
     * @returns 設定変更履歴
     */
    getConfigHistory(category: string | null = null, key: string | null = null, limit: number = 100): LogEntry[] {
        try {
            let result = this.logs.filter(log => {
                if (!log.data || !log.data.category) {
                    return false;
                }
                
                if (category && log.data.category !== category) {
                    return false;
                }
                
                if (key && log.data.key !== key) {
                    return false;
                }
                
                return true;
            });
            
            // 最新順にソート
            result.reverse();
            
            // 件数制限
            if (limit && limit > 0) {
                result = result.slice(0, limit);
            }

            return result;
        } catch (error) {
            ErrorHandler.handle(error as Error, 'LoggingSystem.getConfigHistory');
            return [];
        }
    }
    
    /**
     * ログをクリア
     */
    clearLogs(): void {
        this.logs = [];
        this._resetStats();
    }
    
    /**
     * 統計情報を取得
     * @returns 統計情報
     */
    getStats(): LogStats {
        return { ...this.stats };
    }
    
    /**
     * ログ設定を更新
     * @param newConfig - 新しい設定
     */
    updateConfig(newConfig: Partial<LoggingConfig>): void {
        Object.assign(this.config, newConfig);
    }
    
    /**
     * ログをエクスポート
     * @param format - エクスポート形式（'json', 'csv'）
     * @returns エクスポートされたログ
     */
    exportLogs(format: string = 'json'): string {
        try {
            if (format === 'json') {
                return JSON.stringify(this.logs, null, 2);
            } else if (format === 'csv') {
                return this._exportToCsv();
            } else {
                console.warn(`未対応のエクスポート形式: ${format}`);
                return '';
            }
        } catch (error) {
            console.error('ログエクスポートエラー:', error);
            return '';
        }
    }
    
    /**
     * ログを記録
     * @param level - ログレベル
     * @param message - ログメッセージ
     * @param data - 追加データ
     * @param source - ログソース
     * @private
     */
    private _log(level: string, message: string, data: any = null, source: string | null = null): void {
        try {
            // ログレベルチェック
            if (this.logLevels[level] < this.logLevels[this.config.logLevel]) {
                return;
            }
            
            // カテゴリフィルタチェック
            if (this.config.filterCategories && data && data.category) {
                if (!this.config.filterCategories.includes(data.category)) {
                    return;
                }
            }
            
            // タイムスタンプ
            const timestamp = this.config.enableTimestamp ? new Date() : undefined;
            
            // ログエントリを作成
            const logEntry: LogEntry = {
                level,
                message,
                data,
                timestamp,
                source: this.config.enableSource ? source : undefined
            };

            // ログに追加
            this.logs.push(logEntry);
            
            // ログサイズ制限
            if (this.logs.length > this.config.maxLogSize) {
                this.logs.splice(0, Math.floor(this.config.maxLogSize * 0.2)); // 20%削除
            }
            
            // 統計更新
            this._updateStats(logEntry);
            
            // コンソール出力
            if (this.config.enableConsole) {
                this._logToConsole(logEntry);
            }
        } catch (error) {
            ErrorHandler.handle(error as Error, 'LoggingSystem._log');
        }
    }

    /**
     * コンソールにログ出力
     * @param logEntry - ログエントリ
     * @private
     */
    private _logToConsole(logEntry: LogEntry): void {
        try {
            const { level, message, data, timestamp, source } = logEntry;

            let consoleMethod: (...args: any[]) => void;
            switch (level) {
                case 'debug': consoleMethod = console.debug; break;
                case 'info': consoleMethod = console.info; break;
                case 'warn': consoleMethod = console.warn; break;
                case 'error': consoleMethod = console.error; break;
                default: consoleMethod = console.log;
            }

            let logMessage = '';
            
            // タイムスタンプ
            if (timestamp) {
                logMessage += `[${timestamp.toISOString()}] `;
            }
            
            // レベル
            logMessage += `[${level.toUpperCase()}] `;
            
            // ソース
            if (source) {
                logMessage += `[${source}] `;
            }
            
            // メッセージ
            logMessage += message;
            
            // 出力
            if (data) {
                consoleMethod(logMessage, data);
            } else {
                consoleMethod(logMessage);
            }
        } catch (error) {
            console.error('ログ出力エラー:', error);
        }
    }
    
    /**
     * 統計情報を更新
     * @param logEntry - ログエントリ
     * @private
     */
    private _updateStats(logEntry: LogEntry): void {
        // 総数
        this.stats.total++;
        
        // レベル別
        this.stats.byLevel[logEntry.level as keyof typeof this.stats.byLevel]++;
        
        // カテゴリ別
        if (logEntry.data && logEntry.data.category) {
            const category = logEntry.data.category;
            if (!this.stats.byCategory[category]) {
                this.stats.byCategory[category] = 0;
            }
            this.stats.byCategory[category]++;
        }
    }
    
    /**
     * 統計情報をリセット
     * @private
     */
    private _resetStats(): void {
        this.stats = {
            total: 0,
            byLevel: {
                debug: 0,
                info: 0,
                warn: 0,
                error: 0
            },
            byCategory: {}
        };
    }
    
    /**
     * CSVとしてエクスポート
     * @returns CSV形式のログ
     * @private
     */
    private _exportToCsv(): string {
        const header = ['timestamp', 'level', 'source', 'message', 'data'];
        const rows = [header];
        
        for (const log of this.logs) {
            const row = [
                log.timestamp ? log.timestamp.toISOString() : '',
                log.level,
                log.source || '',
                log.message,
                log.data ? JSON.stringify(log.data) : ''
            ];
            rows.push(row);
        }

        return rows.map(row => row.map(cell => {
            // CSVエスケープ処理
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(',')).join('\n');
    }
    
    /**
     * デバッグモード判定
     * @returns デバッグモードフラグ
     * @private
     */
    private _isDebugMode(): boolean {
        try {
            if (typeof window !== 'undefined' && window.location) {
                return new URLSearchParams(window.location.search).has('debug') ||
                       (typeof localStorage !== 'undefined' && localStorage.getItem('debugMode') === 'true');
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * シングルトンインスタンスを取得
     * @returns LoggingSystemインスタンス
     */
    static getInstance(): LoggingSystem {
        if (!LoggingSystem.instance) {
            LoggingSystem.instance = new LoggingSystem();
        }
        return LoggingSystem.instance;
    }

    private static instance: LoggingSystem | null = null;
}

/**
 * LoggingSystemのシングルトンインスタンスを取得
 * @param options - 設定オプション
 * @returns インスタンス
 */
export function getLoggingSystem(options: LoggingConfig = {}): LoggingSystem {
    const instance = LoggingSystem.getInstance();
    if (Object.keys(options).length > 0) {
        // 既存インスタンスの設定を更新
        instance.updateConfig(options);
    }
    return instance;
}

export { LoggingSystem as default };