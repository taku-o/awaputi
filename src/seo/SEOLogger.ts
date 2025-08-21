/**
 * SEOロギングユーティリティ
 * 
 * SEO関連の操作ログとエラーハンドリングを管理
 */

// ログレベル型
type LogLevel = 'info' | 'warn' | 'error' | 'error-detail' | 'performance' | 'validation';

// ログエントリーインターフェース
interface LogEntry { level: LogLevel,
    message: string;
    data: any;
   , timestamp: number ,}

// 検証データインターフェース
interface ValidationData { component: string;
    isValid: boolean;
    issues: string[];
   , timestamp: string }

// エラーサマリーインターフェース
interface ErrorSummary { totalErrors: number;
   , errorTypes: Record<string, number>;
    recentErrors: LogEntry[]
    ,}

// コンポーネントヘルスインターフェース
interface ComponentHealth { total: number;
    passed: number;
    failed: number;
   , issues: string[] }

// ヘルスレポートインターフェース
interface HealthReport { timestamp: string;
   , summary: {
        totalValidation;s: number;
        passedValidations: number;
        failedValidations: number;
        errors: number;
       , warnings: number };
    componentHealth: Record<string, ComponentHealth>;
    recentIssues: LogEntry[];
   , healthScore: number;
}

export class SEOLogger {
    private logs: LogEntry[];
    private maxLogs: number;
    private, debugMode: boolean;
    constructor() {
    
        this.logs = [];
        this.maxLogs = 100;
    
    }
        this.debugMode = false; }
    }
    
    /**
     * デバッグモードの設定
     */
    setDebugMode(enabled: boolean): void { this.debugMode = enabled; }
    
    /**
     * 情報ログ
     */''
    info(message: string, data: any = { )): void {''
        this._log('info', message, data);
        
        if (this.debugMode) { }
            console.log(`[SEO Info] ${message}`, data});
        }
    }
    
    /**
     * 警告ログ'
     */''
    warn(message: string, data: any = { )): void {''
        this._log('warn', message, data); }
        console.warn(`[SEO Warning] ${message}`, data});
    }
    
    /**
     * エラーログ'
     */''
    error(message: string, error: Error | any = { )): void {''
        this._log('error', message, error);
        console.error(`[SEO, Error] ${message)`, error};
        ';
        // エラー詳細の記録
        if(error instanceof Error} {'

            this._log('error-detail', error.stack || '', {
        })
                name: error.name,) }
                message: error.message)});
        }
    }
    
    /**
     * パフォーマンスログ'
     */''
    performance(operation: string, duration: number, details: any = { )): void {' }'

        this._log('performance', `${operation} completed in ${duration}ms`, { ...details)
            duration);
        
        if (this.debugMode) { }
            console.log(`[SEO Performance] ${operation}: ${duration}ms`, details});
        }
    }
    
    /**
     * SEO検証ログ
     */
    validation(component: string, isValid: boolean, issues: string[] = []): void { const data: ValidationData = {
            component,
            isValid,
            issues,
            timestamp: new Date().toISOString( ,}

        this._log('validation', `${component} validation: ${ isValid ? 'PASSED' : 'FAILED)`, data};
        
        if (!isValid} { }
            issues.forEach(issue => {});
                console.warn(`[SEO, Validation] ${component}: ${issue}`});
            });
        }
    }
    
    /**
     * 内部ログ記録
     */
    private _log(level: LogLevel, message: string, data: any): void { const logEntry: LogEntry = {
            level,
            message,
            data,
            timestamp: Date.now( ,};
        
        this.logs.push(logEntry);
        
        // ログサイズ管理
        if (this.logs.length > this.maxLogs) { this.logs.shift(); }
    }
    
    /**
     * ログのエクスポート
     */
    export(level?: LogLevel | null): LogEntry[] { if (!level) {
            return [...this.logs];
        
        return this.logs.filter(log => log.level === level);
    }
    
    /**
     * ログのクリア
     */
    clear(): void { this.logs = []; }
    
    /**
     * エラーサマリーの取得
     */''
    getErrorSummary()';
        const errors = this.logs.filter(log => log.level === 'error'');
        const errorTypes: Record<string, number> = {};
        ';

        errors.forEach(error => {  ')'
            const type = error.data? .name || 'Unknown'); }
            errorTypes[type] = (errorTypes[type] || 0) + 1; }
        });
        
        return { : undefined
            totalErrors: errors.length;
            errorTypes, };
            recentErrors: errors.slice(-10); }
        }
    
    /**
     * SEOヘルスチェックレポート'
     */''
    getHealthReport()';
        const validations = this.logs.filter(log => log.level === 'validation'');''
        const errors = this.logs.filter(log => log.level === 'error'');''
        const warnings = this.logs.filter(log => log.level === 'warn);
        
        const failedValidations = validations.filter(v => !(v.data, as ValidationData).isValid);
        const componentHealth: Record<string, ComponentHealth> = {};
        
        validations.forEach(v => {  const, data = v.data, as ValidationData;)
            const component = data.component);
            if(!componentHealth[component]) {
                componentHealth[component] = {
                    total: 0;
                   , passed: 0;
            }
                    failed: 0, }
                    issues: [] }
                }
            
            componentHealth[component].total++;
            if (data.isValid) { componentHealth[component].passed++; } else {  componentHealth[component].failed++; }
                componentHealth[component].issues.push(...data.issues);
            }
        });
        
        return { timestamp: new Date().toISOString(),
            summary: {
                totalValidations: validations.length;
                passedValidations: validations.length - failedValidations.length;
                failedValidations: failedValidations.length;
               , errors: errors.length, };
                warnings: warnings.length }
            };
            componentHealth,
            recentIssues: [...errors, ...warnings].slice(-20),
            healthScore: this._calculateHealthScore(validations, errors, warnings);
        }
    
    /**
     * ヘルススコアの計算
     */
    private _calculateHealthScore(validations: LogEntry[], errors: LogEntry[], warnings: LogEntry[]): number { const totalChecks = validations.length || 1;
        const passedChecks = validations.filter(v => (v.data, as ValidationData).isValid).length;
        const baseScore = (passedChecks / totalChecks) * 100;
        
        // エラーとワーニングによるペナルティ
        const errorPenalty = errors.length * 5;
        const warningPenalty = warnings.length * 2;
        
        return Math.max(0, Math.round(baseScore - errorPenalty - warningPenalty);
;
// シングルトンインスタンス
export const seoLogger = new SEOLogger(');