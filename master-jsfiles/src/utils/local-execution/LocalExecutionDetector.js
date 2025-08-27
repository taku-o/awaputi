/**
 * LocalExecutionDetector - ローカルファイル実行環境の検出
 * 
 * ローカルファイル実行環境（file://プロトコル）を検出し、
 * 実行コンテキスト情報とブラウザ機能サポート状況を提供します。
 * 
 * Requirements: 1.3, 5.1
 * 
 * @author Claude Code
 * @version 1.0.0
 */

/**
 * 実行コンテキスト情報を表すインターフェース
 * @typedef {Object} ExecutionContext
 * @property {'file:' | 'http:' | 'https:'} protocol - プロトコル種別
 * @property {boolean} isLocal - ローカル実行かどうか
 * @property {boolean} canUseModules - ES6モジュールが使用可能かどうか
 * @property {Object} supportedFeatures - サポートされている機能
 * @property {boolean} supportedFeatures.canvas - Canvas API対応
 * @property {boolean} supportedFeatures.indexedDB - IndexedDB対応
 * @property {boolean} supportedFeatures.localStorage - localStorage対応
 * @property {boolean} supportedFeatures.serviceWorker - ServiceWorker対応
 * @property {Object} browserInfo - ブラウザ情報
 * @property {string} browserInfo.name - ブラウザ名
 * @property {string} browserInfo.version - ブラウザバージョン
 * @property {string} browserInfo.engine - レンダリングエンジン
 */

class LocalExecutionDetector {
    /**
     * ローカルファイル実行かどうかを判定
     * @returns {boolean} ローカル実行の場合 true
     */
    static isLocalExecution() {
        try {
            return window.location.protocol === 'file:';
        } catch (error) {
            console.warn('LocalExecutionDetector: Protocol detection failed', error);
            return false;
        }
    }

    /**
     * 実行コンテキスト情報を取得
     * @returns {ExecutionContext} 実行コンテキスト情報
     */
    static getExecutionContext() {
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
     * @returns {boolean} 警告表示が必要な場合 true
     */
    static shouldShowWarning() {
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
    static dismissWarning() {
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
    static resetWarningDismissal() {
        try {
            localStorage.removeItem('local-execution-warning-dismissed');
            localStorage.removeItem('local-execution-warning-dismissed-at');
        } catch (error) {
            console.warn('LocalExecutionDetector: Could not reset warning dismissal', error);
        }
    }

    /**
     * プロトコルを安全に取得
     * @returns {string} プロトコル文字列
     * @private
     */
    static _getProtocol() {
        try {
            return window.location.protocol;
        } catch (error) {
            console.warn('LocalExecutionDetector: Could not get protocol', error);
            return 'unknown:';
        }
    }

    /**
     * ES6モジュールが使用可能かどうかを判定
     * @returns {boolean} ES6モジュールが使用可能な場合 true
     * @private
     */
    static _canUseESModules() {
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
     * @returns {Object} サポート機能のオブジェクト
     * @private
     */
    static _detectSupportedFeatures() {
        return {
            canvas: this._supportsCanvas(),
            indexedDB: this._supportsIndexedDB(),
            localStorage: this._supportsLocalStorage(),
            serviceWorker: this._supportsServiceWorker()
        };
    }

    /**
     * Canvas API のサポートを確認
     * @returns {boolean} サポートされている場合 true
     * @private
     */
    static _supportsCanvas() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (error) {
            return false;
        }
    }

    /**
     * IndexedDB のサポートを確認
     * @returns {boolean} サポートされている場合 true
     * @private
     */
    static _supportsIndexedDB() {
        try {
            return 'indexedDB' in window && window.indexedDB !== null;
        } catch (error) {
            return false;
        }
    }

    /**
     * localStorage のサポートを確認
     * @returns {boolean} サポートされている場合 true
     * @private
     */
    static _supportsLocalStorage() {
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
     * @returns {boolean} サポートされている場合 true
     * @private
     */
    static _supportsServiceWorker() {
        try {
            return 'serviceWorker' in navigator && !this.isLocalExecution();
        } catch (error) {
            return false;
        }
    }

    /**
     * ブラウザ情報を取得
     * @returns {Object} ブラウザ情報
     * @private
     */
    static _getBrowserInfo() {
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
     * @param {string} userAgent - User Agent 文字列
     * @returns {Object} ブラウザ情報
     * @private
     */
    static _parseBrowserInfo(userAgent) {
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
     * @returns {Object} デバッグ情報
     */
    static getDebugInfo() {
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

export default LocalExecutionDetector;