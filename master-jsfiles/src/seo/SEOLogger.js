/**
 * SEOロギングユーティリティ
 * 
 * SEO関連の操作ログとエラーハンドリングを管理
 */
export class SEOLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
        this.debugMode = false;
    }
    
    /**
     * デバッグモードの設定
     * @param {boolean} enabled 
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
    
    /**
     * 情報ログ
     * @param {string} message 
     * @param {Object} data 
     */
    info(message, data = {}) {
        this._log('info', message, data);
        
        if (this.debugMode) {
            console.log(`[SEO Info] ${message}`, data);
        }
    }
    
    /**
     * 警告ログ
     * @param {string} message 
     * @param {Object} data 
     */
    warn(message, data = {}) {
        this._log('warn', message, data);
        console.warn(`[SEO Warning] ${message}`, data);
    }
    
    /**
     * エラーログ
     * @param {string} message 
     * @param {Error|Object} error 
     */
    error(message, error = {}) {
        this._log('error', message, error);
        console.error(`[SEO Error] ${message}`, error);
        
        // エラー詳細の記録
        if (error instanceof Error) {
            this._log('error-detail', error.stack, {
                name: error.name,
                message: error.message
            });
        }
    }
    
    /**
     * パフォーマンスログ
     * @param {string} operation 
     * @param {number} duration 
     * @param {Object} details 
     */
    performance(operation, duration, details = {}) {
        this._log('performance', `${operation} completed in ${duration}ms`, {
            ...details,
            duration
        });
        
        if (this.debugMode) {
            console.log(`[SEO Performance] ${operation}: ${duration}ms`, details);
        }
    }
    
    /**
     * SEO検証ログ
     * @param {string} component 
     * @param {boolean} isValid 
     * @param {Array} issues 
     */
    validation(component, isValid, issues = []) {
        const data = {
            component,
            isValid,
            issues,
            timestamp: new Date().toISOString()
        };
        
        this._log('validation', `${component} validation: ${isValid ? 'PASSED' : 'FAILED'}`, data);
        
        if (!isValid) {
            issues.forEach(issue => {
                console.warn(`[SEO Validation] ${component}: ${issue}`);
            });
        }
    }
    
    /**
     * 内部ログ記録
     * @private
     */
    _log(level, message, data) {
        const logEntry = {
            level,
            message,
            data,
            timestamp: Date.now()
        };
        
        this.logs.push(logEntry);
        
        // ログサイズ管理
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
    }
    
    /**
     * ログのエクスポート
     * @param {string} level 
     * @returns {Array}
     */
    export(level = null) {
        if (!level) {
            return [...this.logs];
        }
        
        return this.logs.filter(log => log.level === level);
    }
    
    /**
     * ログのクリア
     */
    clear() {
        this.logs = [];
    }
    
    /**
     * エラーサマリーの取得
     * @returns {Object}
     */
    getErrorSummary() {
        const errors = this.logs.filter(log => log.level === 'error');
        const errorTypes = {};
        
        errors.forEach(error => {
            const type = error.data.name || 'Unknown';
            errorTypes[type] = (errorTypes[type] || 0) + 1;
        });
        
        return {
            totalErrors: errors.length,
            errorTypes,
            recentErrors: errors.slice(-10)
        };
    }
    
    /**
     * SEOヘルスチェックレポート
     * @returns {Object}
     */
    getHealthReport() {
        const validations = this.logs.filter(log => log.level === 'validation');
        const errors = this.logs.filter(log => log.level === 'error');
        const warnings = this.logs.filter(log => log.level === 'warn');
        
        const failedValidations = validations.filter(v => !v.data.isValid);
        const componentHealth = {};
        
        validations.forEach(v => {
            const component = v.data.component;
            if (!componentHealth[component]) {
                componentHealth[component] = {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    issues: []
                };
            }
            
            componentHealth[component].total++;
            if (v.data.isValid) {
                componentHealth[component].passed++;
            } else {
                componentHealth[component].failed++;
                componentHealth[component].issues.push(...v.data.issues);
            }
        });
        
        return {
            timestamp: new Date().toISOString(),
            summary: {
                totalValidations: validations.length,
                passedValidations: validations.length - failedValidations.length,
                failedValidations: failedValidations.length,
                errors: errors.length,
                warnings: warnings.length
            },
            componentHealth,
            recentIssues: [...errors, ...warnings].slice(-20),
            healthScore: this._calculateHealthScore(validations, errors, warnings)
        };
    }
    
    /**
     * ヘルススコアの計算
     * @private
     */
    _calculateHealthScore(validations, errors, warnings) {
        const totalChecks = validations.length || 1;
        const passedChecks = validations.filter(v => v.data.isValid).length;
        const baseScore = (passedChecks / totalChecks) * 100;
        
        // エラーとワーニングによるペナルティ
        const errorPenalty = errors.length * 5;
        const warningPenalty = warnings.length * 2;
        
        return Math.max(0, Math.round(baseScore - errorPenalty - warningPenalty));
    }
}

// シングルトンインスタンス
export const seoLogger = new SEOLogger();