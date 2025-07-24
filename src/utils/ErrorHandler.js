/**
 * エラーハンドリングクラス
 * グレースフルデグラデーション、入力値検証、異常状態からの復旧処理を提供
 */
class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.criticalErrors = new Set();
        this.recoveryAttempts = new Map();
        this.maxRecoveryAttempts = 3;
        this.fallbackModes = new Map();
        this.isInitialized = false;
        
        // エラー統計
        this.errorStats = {
            total: 0,
            byType: new Map(),
            byContext: new Map(),
            critical: 0,
            recovered: 0
        };
        
        // 復旧戦略
        this.recoveryStrategies = new Map();
        this.setupRecoveryStrategies();
        
        // フォールバック状態
        this.fallbackState = {
            audioDisabled: false,
            canvasDisabled: false,
            storageDisabled: false,
            reducedEffects: false,
            safeMode: false
        };
        
        this.initialize();
    }
    
    /**
     * エラーハンドラーを初期化
     */
    initialize() {
        if (this.isInitialized) return;
        
        try {
            this.setupGlobalErrorHandlers();
            this.setupPerformanceMonitoring();
            this.isInitialized = true;
            console.log('ErrorHandler initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ErrorHandler:', error);
            // 最小限の機能で動作
            this.enableSafeMode();
        }
    }
    
    /**
     * グローバルエラーハンドラーを設定
     */
    setupGlobalErrorHandlers() {
        // 未処理のJavaScriptエラー
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'GLOBAL_ERROR', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                message: event.message
            });
        });
        
        // 未処理のPromise拒否
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'PROMISE_REJECTION', {
                promise: event.promise
            });
            event.preventDefault(); // デフォルトのコンソール出力を防ぐ
        });
        
        // リソース読み込みエラー
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError(new Error(`Resource load failed: ${event.target.src || event.target.href}`), 'RESOURCE_ERROR', {
                    element: event.target.tagName,
                    source: event.target.src || event.target.href
                });
            }
        }, true);
    }
    
    /**
     * パフォーマンス監視を設定
     */
    setupPerformanceMonitoring() {
        // メモリ使用量の監視
        if (window.performance && window.performance.memory) {
            setInterval(() => {
                const memory = window.performance.memory;
                const usedMB = memory.usedJSHeapSize / 1024 / 1024;
                const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
                
                // メモリ使用量が80%を超えた場合
                if (usedMB / limitMB > 0.8) {
                    this.handleError(new Error(`High memory usage: ${Math.round(usedMB)}MB / ${Math.round(limitMB)}MB`), 'MEMORY_WARNING', {
                        usedMB: Math.round(usedMB),
                        limitMB: Math.round(limitMB),
                        percentage: Math.round((usedMB / limitMB) * 100)
                    });
                }
            }, 10000); // 10秒ごと
        }
        
        // フレームレート監視
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitorFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // FPSが30を下回った場合
                if (fps < 30) {
                    this.handleError(new Error(`Low FPS detected: ${fps}`), 'PERFORMANCE_WARNING', {
                        fps: fps,
                        timestamp: currentTime
                    });
                }
            }
            
            requestAnimationFrame(monitorFPS);
        };
        
        requestAnimationFrame(monitorFPS);
    }
    
    /**
     * 復旧戦略を設定
     */
    setupRecoveryStrategies() {
        // Canvas関連エラーの復旧
        this.recoveryStrategies.set('CANVAS_ERROR', {
            attempts: 0,
            maxAttempts: 2,
            strategy: (error, context) => {
                console.warn('Canvas error detected, attempting recovery:', error.message);
                
                // Canvas要素を再作成
                const canvas = document.getElementById('gameCanvas');
                if (canvas) {
                    const parent = canvas.parentNode;
                    const newCanvas = document.createElement('canvas');
                    newCanvas.id = 'gameCanvas';
                    newCanvas.width = canvas.width;
                    newCanvas.height = canvas.height;
                    newCanvas.className = canvas.className;
                    
                    parent.replaceChild(newCanvas, canvas);
                    
                    return { success: true, message: 'Canvas recreated' };
                }
                
                return { success: false, message: 'Canvas element not found' };
            },
            fallback: () => {
                this.showFallbackUI();
                this.fallbackState.canvasDisabled = true;
            }
        });
        
        // Audio関連エラーの復旧
        this.recoveryStrategies.set('AUDIO_ERROR', {
            attempts: 0,
            maxAttempts: 1,
            strategy: (error, context) => {
                console.warn('Audio error detected, disabling audio:', error.message);
                this.fallbackState.audioDisabled = true;
                return { success: true, message: 'Audio disabled' };
            },
            fallback: () => {
                this.fallbackState.audioDisabled = true;
            }
        });
        
        // Storage関連エラーの復旧
        this.recoveryStrategies.set('STORAGE_ERROR', {
            attempts: 0,
            maxAttempts: 1,
            strategy: (error, context) => {
                console.warn('Storage error detected, using memory storage:', error.message);
                this.useMemoryStorage();
                return { success: true, message: 'Switched to memory storage' };
            },
            fallback: () => {
                this.fallbackState.storageDisabled = true;
            }
        });
        
        // メモリ関連エラーの復旧
        this.recoveryStrategies.set('MEMORY_WARNING', {
            attempts: 0,
            maxAttempts: 1,
            strategy: (error, context) => {
                console.warn('Memory warning detected, reducing effects:', error.message);
                this.reduceEffects();
                this.performGarbageCollection();
                return { success: true, message: 'Effects reduced, garbage collection performed' };
            },
            fallback: () => {
                this.fallbackState.reducedEffects = true;
                this.enableSafeMode();
            }
        });
        
        // パフォーマンス関連エラーの復旧
        this.recoveryStrategies.set('PERFORMANCE_WARNING', {
            attempts: 0,
            maxAttempts: 2,
            strategy: (error, context) => {
                console.warn('Performance warning detected, optimizing:', error.message);
                this.optimizePerformance();
                return { success: true, message: 'Performance optimized' };
            },
            fallback: () => {
                this.fallbackState.reducedEffects = true;
            }
        });
    }
    
    /**
     * エラーを処理
     * @param {Error} error - エラーオブジェクト
     * @param {string} context - エラーが発生したコンテキスト
     * @param {Object} metadata - 追加のメタデータ
     */
    handleError(error, context = 'UNKNOWN', metadata = {}) {
        try {
            // エラー情報を正規化
            const errorInfo = this.normalizeError(error, context, metadata);
            
            // エラーログに追加
            this.addToErrorLog(errorInfo);
            
            // 統計を更新
            this.updateErrorStats(errorInfo);
            
            // 重要度を判定
            const severity = this.determineSeverity(errorInfo);
            
            // コンソールに出力
            this.logError(errorInfo, severity);
            
            // 復旧を試行
            if (severity !== 'LOW') {
                this.attemptRecovery(errorInfo);
            }
            
            // ユーザーに通知（重要なエラーの場合）
            if (severity === 'CRITICAL') {
                this.notifyUser(errorInfo);
            }
            
        } catch (handlerError) {
            // エラーハンドラー自体でエラーが発生した場合
            console.error('Error in error handler:', handlerError);
            console.error('Original error:', error);
            this.enableSafeMode();
        }
    }
    
    /**
     * エラーを正規化
     */
    normalizeError(error, context, metadata) {
        const timestamp = new Date().toISOString();
        const id = this.generateErrorId();
        
        // エラーオブジェクトを安全に処理
        let message = 'Unknown error';
        let stack = null;
        let name = 'Error';
        
        if (error instanceof Error) {
            message = error.message || 'Unknown error';
            stack = error.stack;
            name = error.name;
        } else if (typeof error === 'string') {
            message = error;
        } else if (error && typeof error === 'object') {
            message = error.message || error.toString() || 'Unknown error';
            stack = error.stack;
            name = error.name || 'Error';
        }
        
        return {
            id,
            timestamp,
            message,
            stack,
            name,
            context,
            metadata: { ...metadata },
            userAgent: navigator.userAgent,
            url: window.location.href,
            recovered: false
        };
    }
    
    /**
     * エラーIDを生成
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * エラーログに追加
     */
    addToErrorLog(errorInfo) {
        this.errorLog.push(errorInfo);
        
        // ログサイズを制限
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }
    }
    
    /**
     * エラー統計を更新
     */
    updateErrorStats(errorInfo) {
        this.errorStats.total++;
        
        // タイプ別統計
        const type = errorInfo.name;
        this.errorStats.byType.set(type, (this.errorStats.byType.get(type) || 0) + 1);
        
        // コンテキスト別統計
        const context = errorInfo.context;
        this.errorStats.byContext.set(context, (this.errorStats.byContext.get(context) || 0) + 1);
    }
    
    /**
     * エラーの重要度を判定
     */
    determineSeverity(errorInfo) {
        const { message, context, name } = errorInfo;
        
        // 重要なエラーパターン
        const criticalPatterns = [
            /canvas/i,
            /webgl/i,
            /out of memory/i,
            /script error/i,
            /network error/i
        ];
        
        const highPatterns = [
            /audio/i,
            /storage/i,
            /permission/i,
            /security/i
        ];
        
        // コンテキストベースの判定
        if (context === 'CANVAS_ERROR' || context === 'GLOBAL_ERROR') {
            return 'CRITICAL';
        }
        
        if (context === 'AUDIO_ERROR' || context === 'STORAGE_ERROR') {
            return 'HIGH';
        }
        
        if (context === 'MEMORY_WARNING' || context === 'PERFORMANCE_WARNING') {
            return 'MEDIUM';
        }
        
        // メッセージベースの判定
        if (criticalPatterns.some(pattern => pattern.test(message))) {
            return 'CRITICAL';
        }
        
        if (highPatterns.some(pattern => pattern.test(message))) {
            return 'HIGH';
        }
        
        return 'LOW';
    }
    
    /**
     * エラーをログに出力
     */
    logError(errorInfo, severity) {
        const logMethod = severity === 'CRITICAL' ? 'error' : 
                         severity === 'HIGH' ? 'warn' : 'log';
        
        console[logMethod](`[${severity}] ${errorInfo.context}: ${errorInfo.message}`, {
            id: errorInfo.id,
            timestamp: errorInfo.timestamp,
            metadata: errorInfo.metadata,
            stack: errorInfo.stack
        });
    }
    
    /**
     * 復旧を試行
     */
    attemptRecovery(errorInfo) {
        const strategy = this.recoveryStrategies.get(errorInfo.context);
        
        if (!strategy) {
            console.warn(`No recovery strategy for context: ${errorInfo.context}`);
            return false;
        }
        
        // 最大試行回数をチェック
        if (strategy.attempts >= strategy.maxAttempts) {
            console.warn(`Max recovery attempts reached for ${errorInfo.context}, using fallback`);
            strategy.fallback();
            return false;
        }
        
        try {
            strategy.attempts++;
            const result = strategy.strategy(errorInfo, errorInfo.context);
            
            if (result.success) {
                console.log(`Recovery successful for ${errorInfo.context}: ${result.message}`);
                errorInfo.recovered = true;
                this.errorStats.recovered++;
                return true;
            } else {
                console.warn(`Recovery failed for ${errorInfo.context}: ${result.message}`);
                
                // 最大試行回数に達した場合はフォールバック
                if (strategy.attempts >= strategy.maxAttempts) {
                    strategy.fallback();
                }
                return false;
            }
        } catch (recoveryError) {
            console.error(`Recovery strategy failed for ${errorInfo.context}:`, recoveryError);
            strategy.fallback();
            return false;
        }
    }
    
    /**
     * ユーザーに通知
     */
    notifyUser(errorInfo) {
        // 重要なエラーのみユーザーに表示
        if (this.shouldNotifyUser(errorInfo)) {
            this.showErrorNotification(errorInfo);
        }
    }
    
    /**
     * ユーザーに通知すべきかどうか
     */
    shouldNotifyUser(errorInfo) {
        const { context, message } = errorInfo;
        
        // Canvas関連の重要なエラー
        if (context === 'CANVAS_ERROR' && message.includes('Canvas')) {
            return true;
        }
        
        // ブラウザ互換性の問題
        if (message.includes('not supported') || message.includes('not available')) {
            return true;
        }
        
        // ネットワーク関連の問題
        if (message.includes('network') || message.includes('fetch')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * エラー通知を表示
     */
    showErrorNotification(errorInfo) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-notification-content">
                <h3>エラーが発生しました</h3>
                <p>${this.getUserFriendlyMessage(errorInfo)}</p>
                <div class="error-notification-actions">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()">閉じる</button>
                    <button onclick="location.reload()">再読み込み</button>
                </div>
            </div>
        `;
        
        // スタイルを適用
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            font-family: Arial, sans-serif;
        `;
        
        notification.querySelector('.error-notification-actions').style.cssText = `
            margin-top: 10px;
            display: flex;
            gap: 10px;
        `;
        
        notification.querySelectorAll('button').forEach(button => {
            button.style.cssText = `
                padding: 5px 10px;
                border: none;
                border-radius: 4px;
                background: white;
                color: red;
                cursor: pointer;
                font-size: 12px;
            `;
        });
        
        document.body.appendChild(notification);
        
        // 10秒後に自動で削除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
    
    /**
     * ユーザーフレンドリーなメッセージを生成
     */
    getUserFriendlyMessage(errorInfo) {
        const { context, message } = errorInfo;
        
        if (context === 'CANVAS_ERROR') {
            return 'グラフィック機能に問題が発生しました。ブラウザを更新してください。';
        }
        
        if (context === 'AUDIO_ERROR') {
            return '音声機能が利用できません。ゲームは音声なしで続行されます。';
        }
        
        if (context === 'STORAGE_ERROR') {
            return 'データの保存に問題が発生しました。進行状況が保存されない可能性があります。';
        }
        
        if (context === 'MEMORY_WARNING') {
            return 'メモリ使用量が多くなっています。パフォーマンスが低下する可能性があります。';
        }
        
        if (context === 'PERFORMANCE_WARNING') {
            return 'パフォーマンスが低下しています。設定を調整することをお勧めします。';
        }
        
        return '技術的な問題が発生しました。ページを再読み込みしてください。';
    }
    
    /**
     * フォールバックUIを表示
     */
    showFallbackUI() {
        const fallbackDiv = document.createElement('div');
        fallbackDiv.id = 'fallbackUI';
        fallbackDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 9999;
                font-family: Arial, sans-serif;
            ">
                <h2>互換性の問題が発生しました</h2>
                <p>お使いのブラウザではゲームを正常に実行できません。</p>
                <p>以下のブラウザでお試しください：</p>
                <ul style="text-align: left; margin: 20px 0;">
                    <li>Google Chrome (推奨)</li>
                    <li>Mozilla Firefox</li>
                    <li>Microsoft Edge</li>
                    <li>Safari (iOS/macOS)</li>
                </ul>
                <button onclick="location.reload()" style="
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                ">再試行</button>
            </div>
        `;
        
        document.body.appendChild(fallbackDiv);
    }
    
    /**
     * メモリストレージを使用
     */
    useMemoryStorage() {
        // LocalStorageの代替としてメモリストレージを実装
        window.memoryStorage = new Map();
        
        // LocalStorageのAPIを模倣
        const memoryStorageAPI = {
            getItem: (key) => window.memoryStorage.get(key) || null,
            setItem: (key, value) => window.memoryStorage.set(key, value),
            removeItem: (key) => window.memoryStorage.delete(key),
            clear: () => window.memoryStorage.clear(),
            get length() { return window.memoryStorage.size; },
            key: (index) => Array.from(window.memoryStorage.keys())[index] || null
        };
        
        // グローバルに公開
        window.fallbackStorage = memoryStorageAPI;
        
        console.log('Memory storage enabled as LocalStorage fallback');
    }
    
    /**
     * エフェクトを削減
     */
    reduceEffects() {
        // パフォーマンス最適化のためエフェクトを削減
        if (window.gameEngine) {
            // パーティクル数を削減
            if (window.gameEngine.particleManager) {
                window.gameEngine.particleManager.setMaxParticles(50);
            }
            
            // エフェクトの品質を下げる
            if (window.gameEngine.effectManager) {
                window.gameEngine.effectManager.setQuality('low');
            }
            
            // 音響エフェクトを削減
            if (window.gameEngine.audioManager) {
                window.gameEngine.audioManager.setMaxConcurrentSounds(5);
            }
        }
        
        console.log('Effects reduced for performance optimization');
    }
    
    /**
     * ガベージコレクションを実行
     */
    performGarbageCollection() {
        // 手動でのメモリクリーンアップ
        if (window.gameEngine) {
            // オブジェクトプールをクリア
            if (window.gameEngine.poolManager) {
                window.gameEngine.poolManager.clearUnused();
            }
            
            // 不要なリスナーを削除
            if (window.gameEngine.memoryManager) {
                window.gameEngine.memoryManager.performCleanup();
            }
        }
        
        // ブラウザのGCを促す（可能であれば）
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
        }
        
        console.log('Garbage collection performed');
    }
    
    /**
     * パフォーマンスを最適化
     */
    optimizePerformance() {
        if (window.gameEngine && window.gameEngine.performanceOptimizer) {
            // パフォーマンスレベルを下げる
            window.gameEngine.performanceOptimizer.setPerformanceLevel('low');
            
            // フレームレートを制限
            window.gameEngine.performanceOptimizer.setTargetFPS(30);
            
            // レンダリング品質を下げる
            window.gameEngine.performanceOptimizer.setRenderQuality('low');
        }
        
        this.reduceEffects();
        this.performGarbageCollection();
        
        console.log('Performance optimized');
    }
    
    /**
     * セーフモードを有効化
     */
    enableSafeMode() {
        this.fallbackState.safeMode = true;
        this.fallbackState.reducedEffects = true;
        
        // 最小限の機能で動作
        if (window.gameEngine) {
            // すべてのエフェクトを無効化
            if (window.gameEngine.effectManager) {
                window.gameEngine.effectManager.disable();
            }
            
            // パーティクルを無効化
            if (window.gameEngine.particleManager) {
                window.gameEngine.particleManager.disable();
            }
            
            // 音響を無効化
            if (window.gameEngine.audioManager) {
                window.gameEngine.audioManager.disable();
            }
        }
        
        console.warn('Safe mode enabled - running with minimal features');
    }
    
    /**
     * 入力値を検証
     * @param {*} value - 検証する値
     * @param {string} type - 期待する型
     * @param {Object} constraints - 制約条件
     * @returns {Object} 検証結果
     */
    validateInput(value, type, constraints = {}) {
        const result = {
            isValid: true,
            errors: [],
            sanitizedValue: value
        };
        
        try {
            // null/undefined チェック
            if (constraints.required && (value === null || value === undefined)) {
                result.isValid = false;
                result.errors.push('Value is required');
                return result;
            }
            
            if (value === null || value === undefined) {
                return result; // null/undefinedは許可されている場合はそのまま返す
            }
            
            // 型チェック
            switch (type) {
                case 'string':
                    result.sanitizedValue = this.validateString(value, constraints, result);
                    break;
                case 'number':
                    result.sanitizedValue = this.validateNumber(value, constraints, result);
                    break;
                case 'boolean':
                    result.sanitizedValue = this.validateBoolean(value, constraints, result);
                    break;
                case 'object':
                    result.sanitizedValue = this.validateObject(value, constraints, result);
                    break;
                case 'array':
                    result.sanitizedValue = this.validateArray(value, constraints, result);
                    break;
                case 'function':
                    result.sanitizedValue = this.validateFunction(value, constraints, result);
                    break;
                default:
                    result.errors.push(`Unknown type: ${type}`);
                    result.isValid = false;
            }
            
        } catch (error) {
            result.isValid = false;
            result.errors.push(`Validation error: ${error.message}`);
            this.handleError(error, 'VALIDATION_ERROR', { value, type, constraints });
        }
        
        return result;
    }
    
    /**
     * 文字列を検証
     */
    validateString(value, constraints, result) {
        if (typeof value !== 'string') {
            // 文字列に変換を試行
            try {
                value = String(value);
            } catch (error) {
                result.isValid = false;
                result.errors.push('Cannot convert to string');
                return value;
            }
        }
        
        // 長さチェック
        if (constraints.minLength && value.length < constraints.minLength) {
            result.isValid = false;
            result.errors.push(`String too short (min: ${constraints.minLength})`);
        }
        
        if (constraints.maxLength && value.length > constraints.maxLength) {
            result.isValid = false;
            result.errors.push(`String too long (max: ${constraints.maxLength})`);
            // 切り詰める
            value = value.substring(0, constraints.maxLength);
        }
        
        // パターンチェック
        if (constraints.pattern && !constraints.pattern.test(value)) {
            result.isValid = false;
            result.errors.push('String does not match required pattern');
        }
        
        // HTMLエスケープ
        if (constraints.escapeHtml) {
            value = value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');
        }
        
        return value;
    }
    
    /**
     * 数値を検証
     */
    validateNumber(value, constraints, result) {
        if (typeof value !== 'number') {
            // 数値に変換を試行
            const converted = Number(value);
            if (isNaN(converted)) {
                result.isValid = false;
                result.errors.push('Cannot convert to number');
                return value;
            }
            value = converted;
        }
        
        // NaN/Infinityチェック
        if (isNaN(value)) {
            result.isValid = false;
            result.errors.push('Value is NaN');
            return 0;
        }
        
        if (!isFinite(value)) {
            result.isValid = false;
            result.errors.push('Value is not finite');
            return constraints.max || constraints.min || 0;
        }
        
        // 範囲チェック
        if (constraints.min !== undefined && value < constraints.min) {
            result.isValid = false;
            result.errors.push(`Number too small (min: ${constraints.min})`);
            value = constraints.min;
        }
        
        if (constraints.max !== undefined && value > constraints.max) {
            result.isValid = false;
            result.errors.push(`Number too large (max: ${constraints.max})`);
            value = constraints.max;
        }
        
        // 整数チェック
        if (constraints.integer && !Number.isInteger(value)) {
            result.isValid = false;
            result.errors.push('Number must be integer');
            value = Math.round(value);
        }
        
        return value;
    }
    
    /**
     * ブール値を検証
     */
    validateBoolean(value, constraints, result) {
        if (typeof value !== 'boolean') {
            // ブール値に変換を試行
            if (value === 'true' || value === 1 || value === '1') {
                value = true;
            } else if (value === 'false' || value === 0 || value === '0') {
                value = false;
            } else {
                result.isValid = false;
                result.errors.push('Cannot convert to boolean');
                return false;
            }
        }
        
        return value;
    }
    
    /**
     * オブジェクトを検証
     */
    validateObject(value, constraints, result) {
        if (typeof value !== 'object' || value === null) {
            result.isValid = false;
            result.errors.push('Value is not an object');
            return {};
        }
        
        // プロパティの検証
        if (constraints.properties) {
            const validatedObject = {};
            
            for (const [key, propConstraints] of Object.entries(constraints.properties)) {
                const propResult = this.validateInput(value[key], propConstraints.type, propConstraints);
                
                if (!propResult.isValid) {
                    result.isValid = false;
                    result.errors.push(`Property '${key}': ${propResult.errors.join(', ')}`);
                }
                
                validatedObject[key] = propResult.sanitizedValue;
            }
            
            return validatedObject;
        }
        
        return value;
    }
    
    /**
     * 配列を検証
     */
    validateArray(value, constraints, result) {
        if (!Array.isArray(value)) {
            result.isValid = false;
            result.errors.push('Value is not an array');
            return [];
        }
        
        // 長さチェック
        if (constraints.minLength && value.length < constraints.minLength) {
            result.isValid = false;
            result.errors.push(`Array too short (min: ${constraints.minLength})`);
        }
        
        if (constraints.maxLength && value.length > constraints.maxLength) {
            result.isValid = false;
            result.errors.push(`Array too long (max: ${constraints.maxLength})`);
            value = value.slice(0, constraints.maxLength);
        }
        
        // 要素の検証
        if (constraints.itemType) {
            const validatedArray = [];
            
            for (let i = 0; i < value.length; i++) {
                const itemResult = this.validateInput(value[i], constraints.itemType, constraints.itemConstraints || {});
                
                if (!itemResult.isValid) {
                    result.isValid = false;
                    result.errors.push(`Item ${i}: ${itemResult.errors.join(', ')}`);
                }
                
                validatedArray.push(itemResult.sanitizedValue);
            }
            
            return validatedArray;
        }
        
        return value;
    }
    
    /**
     * 関数を検証
     */
    validateFunction(value, constraints, result) {
        if (typeof value !== 'function') {
            result.isValid = false;
            result.errors.push('Value is not a function');
            return () => {};
        }
        
        return value;
    }
    
    /**
     * エラー統計を取得
     */
    getErrorStats() {
        return {
            ...this.errorStats,
            byType: Object.fromEntries(this.errorStats.byType),
            byContext: Object.fromEntries(this.errorStats.byContext)
        };
    }
    
    /**
     * エラーログを取得
     */
    getErrorLog() {
        return [...this.errorLog];
    }
    
    /**
     * フォールバック状態を取得
     */
    getFallbackState() {
        return { ...this.fallbackState };
    }
    
    /**
     * エラーハンドラーをリセット
     */
    reset() {
        this.errorLog = [];
        this.errorStats = {
            total: 0,
            byType: new Map(),
            byContext: new Map(),
            critical: 0,
            recovered: 0
        };
        
        // 復旧試行回数をリセット
        for (const strategy of this.recoveryStrategies.values()) {
            strategy.attempts = 0;
        }
        
        console.log('ErrorHandler reset');
    }
    
    /**
     * エラーハンドラーを破棄
     */
    destroy() {
        // イベントリスナーを削除
        window.removeEventListener('error', this.handleError);
        window.removeEventListener('unhandledrejection', this.handleError);
        
        // リソースをクリア
        this.errorLog = [];
        this.recoveryStrategies.clear();
        this.fallbackModes.clear();
        
        this.isInitialized = false;
        console.log('ErrorHandler destroyed');
    }
}

// シングルトンインスタンス（遅延初期化）
let _errorHandler = null;

function getErrorHandler() {
    if (!_errorHandler) {
        _errorHandler = new ErrorHandler();
    }
    return _errorHandler;
}

// 後方互換性のため
const errorHandler = getErrorHandler;

// グローバルに公開（デバッグ用）
if (typeof window !== 'undefined') {
    window.errorHandler = errorHandler;
}

export { ErrorHandler, getErrorHandler, errorHandler };
