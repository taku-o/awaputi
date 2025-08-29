/**
 * LocalExecutionDetector - ローカルファイル実行環境の検出
 * 
 * ローカルファイル実行環境（file://プロトコル）を検出し、
 * 実行コンテキスト情報とブラウザ機能サポート状況を提供します。
 * 
 *, Requirements: 1.3, 5.1
 * 
 * @author Claude Code
 * @version 1.0.0
 */

// Type definitions
interface SupportedFeatures {
    canvas: boolean;
    indexedDB: boolean;
    localStorage: boolean;
    serviceWorker: boolean;
}

interface BrowserInfo {
    name: string;
    version: string;
    engine: string;
}

interface ExecutionContext {
    protocol: 'file:' | 'http:' | 'https:' | string;
    isLocal: boolean;
    canUseModules: boolean;
    supportedFeatures: SupportedFeatures;
    browserInfo: BrowserInfo;
}

interface DebugInfo {
    executionContext: ExecutionContext;
    isLocalExecution: boolean;
    shouldShowWarning: boolean;
    userAgent: string;
    location: {
        href: string;
        protocol: string;
        host: string;
        pathname: string;
    };
    timestamp: string;
}

class LocalExecutionDetector {
    /**
     * ローカルファイル実行かどうかを判定
     */
    static isLocalExecution(): boolean {
        try {
            return window.location.protocol === 'file:';
        } catch (error) {
            console.warn('LocalExecutionDetector: Protocol detection failed', error);
            return false;
        }
    }

    /**
     * 実行コンテキスト情報を取得
     */
    static getExecutionContext(): ExecutionContext {
        const protocol = this._getProtocol();
        const isLocal = protocol === 'file:';
        
        return {
            protocol,
            isLocal,
            canUseModules: this._canUseESModules(),
            supportedFeatures: this._detectSupportedFeatures(),
            browserInfo: this._getBrowserInfo()
        };
    }

    /**
     * 警告を表示すべきかどうかを判定
     */
    static shouldShowWarning(): boolean {
        if (!this.isLocalExecution()) {
            return false;
        }

        // localStorage で警告非表示設定をチェック
        try {
            const dismissed = localStorage.getItem('local-execution-warning-dismissed');
            return dismissed !== 'true';
        } catch (error) {
            // localStorage が使用できない場合は常に警告を表示
            return true;
        }
    }

    /**
     * 警告を非表示にする設定を保存
     */
    static dismissWarning(): void {
        try {
            localStorage.setItem('local-execution-warning-dismissed', 'true');
            localStorage.setItem('local-execution-warning-dismissed-at', new Date().toISOString());
        } catch (error) {
            console.warn('LocalExecutionDetector: Could not save warning dismissal', error);
        }
    }

    /**
     * 警告非表示設定をリセット
     */
    static resetWarningDismissal(): void {
        try {
            localStorage.removeItem('local-execution-warning-dismissed');
            localStorage.removeItem('local-execution-warning-dismissed-at');
        } catch (error) {
            console.warn('LocalExecutionDetector: Could not reset warning dismissal', error);
        }
    }

    /**
     * プロトコルを安全に取得
     */
    private static _getProtocol(): string {
        try {
            return window.location.protocol;
        } catch (error) {
            console.warn('LocalExecutionDetector: Could not get protocol', error);
            return 'unknown:';
        }
    }

    /**
     * ES6モジュールが使用可能かどうかを判定
     */
    private static _canUseESModules(): boolean {
        // file: プロトコルではES6モジュールは通常使用できない
        if (this.isLocalExecution()) {
            return false;
        }

        // ブラウザのES6モジュールサポートをチェック
        try {
            return typeof Symbol !== 'undefined' && 
                   'noModule' in HTMLScriptElement.prototype;
        } catch (error) {
            return false;
        }
    }

    /**
     * サポートされている機能を検出
     */
    private static _detectSupportedFeatures(): SupportedFeatures {
        return {
            canvas: this._supportsCanvas(),
            indexedDB: this._supportsIndexedDB(),
            localStorage: this._supportsLocalStorage(),
            serviceWorker: this._supportsServiceWorker()
        };
    }

    /**
     * Canvas API のサポートを確認
     */
    private static _supportsCanvas(): boolean {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (error) {
            return false;
        }
    }

    /**
     * IndexedDB のサポートを確認
     */
    private static _supportsIndexedDB(): boolean {
        try {
            return 'indexedDB' in window && window.indexedDB !== null;
        } catch (error) {
            return false;
        }
    }

    /**
     * localStorage のサポートを確認
     */
    private static _supportsLocalStorage(): boolean {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * ServiceWorker のサポートを確認
     */
    private static _supportsServiceWorker(): boolean {
        try {
            return 'serviceWorker' in navigator && !this.isLocalExecution();
        } catch (error) {
            return false;
        }
    }

    /**
     * ブラウザ情報を取得
     */
    private static _getBrowserInfo(): BrowserInfo {
        try {
            const userAgent = navigator.userAgent;
            const browserInfo = this._parseBrowserInfo(userAgent);
            return browserInfo;
        } catch (error) {
            return {
                name: 'unknown',
                version: 'unknown',
                engine: 'unknown'
            };
        }
    }

    /**
     * User Agent からブラウザ情報を解析
     */
    private static _parseBrowserInfo(userAgent: string): BrowserInfo {
        let name = 'unknown';
        let version = 'unknown';
        let engine = 'unknown';

        // Chrome
        if (userAgent.indexOf('Chrome') > -1) {
            name = 'Chrome';
            const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
            version = match ? match[1] : 'unknown';
            engine = 'Blink';
        }
        // Firefox
        else if (userAgent.indexOf('Firefox') > -1) {
            name = 'Firefox';
            const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
            version = match ? match[1] : 'unknown';
            engine = 'Gecko';
        }
        // Safari
        else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
            name = 'Safari';
            const match = userAgent.match(/Version\/(\d+\.\d+)/);
            version = match ? match[1] : 'unknown';
            engine = 'WebKit';
        }
        // Edge
        else if (userAgent.indexOf('Edg') > -1) {
            name = 'Edge';
            const match = userAgent.match(/Edg\/(\d+\.\d+)/);
            version = match ? match[1] : 'unknown';
            engine = 'Blink';
        }

        return { name, version, engine };
    }

    /**
     * デバッグ情報を取得
     */
    static getDebugInfo(): DebugInfo {
        const context = this.getExecutionContext();
        return {
            executionContext: context,
            isLocalExecution: this.isLocalExecution(),
            shouldShowWarning: this.shouldShowWarning(),
            userAgent: navigator.userAgent,
            location: {
                href: window.location.href,
                protocol: window.location.protocol,
                host: window.location.host,
                pathname: window.location.pathname
            },
            timestamp: new Date().toISOString()
        };
    }
}

// Export the class
export { LocalExecutionDetector };