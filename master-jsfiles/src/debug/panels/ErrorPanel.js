/**
 * Error Panel - エラーレポート表示パネル
 */
export class ErrorPanel {
    constructor(gameEngine, debugInterface) {
        this.gameEngine = gameEngine;
        this.debugInterface = debugInterface;
        this.element = null;
        this.errorReporter = gameEngine.errorReporter;
        this.errors = [];
    }

    /**
     * パネルを作成
     */
    create() {
        this.element = document.createElement('div');
        this.element.className = 'debug-error-panel';
        this.element.innerHTML = `
            <div class="error-section">
                <h4>エラー統計</h4>
                <div id="error-stats">
                    <div>総エラー数: <span id="total-errors">0</span></div>
                    <div>重大エラー: <span id="critical-errors">0</span></div>
                    <div>警告: <span id="warning-errors">0</span></div>
                    <div>情報: <span id="info-errors">0</span></div>
                </div>
            </div>
            
            <div class="error-section">
                <h4>最近のエラー</h4>
                <div class="error-controls">
                    <button id="clear-errors">エラーをクリア</button>
                    <button id="export-errors">エラーをエクスポート</button>
                    <select id="error-filter">
                        <option value="all">すべて</option>
                        <option value="error">エラーのみ</option>
                        <option value="warn">警告のみ</option>
                        <option value="info">情報のみ</option>
                    </select>
                </div>
                <div class="error-list" id="error-list"></div>
            </div>
            
            <div class="error-section">
                <h4>エラーパターン分析</h4>
                <div id="error-patterns">
                    <div class="pattern-info">パターン分析結果がここに表示されます</div>
                </div>
            </div>
        `;

        this.bindEvents();
        this.loadErrors();
        return this.element;
    }

    /**
     * イベントバインド
     */
    bindEvents() {
        // エラークリア
        this.element.querySelector('#clear-errors').addEventListener('click', () => {
            this.clearErrors();
        });

        // エラーエクスポート
        this.element.querySelector('#export-errors').addEventListener('click', () => {
            this.exportErrors();
        });

        // フィルター変更
        this.element.querySelector('#error-filter').addEventListener('change', (e) => {
            this.filterErrors(e.target.value);
        });
    }

    /**
     * エラーを読み込み
     */
    loadErrors() {
        // LocalStorageからエラーを読み込み
        try {
            const stored = localStorage.getItem('debug-errors');
            if (stored) {
                this.errors = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Error loading debug errors:', error);
        }

        // コンソールエラーをキャプチャ
        this.interceptConsoleErrors();
        
        this.updateErrorDisplay();
    }

    /**
     * コンソールエラーをキャプチャ
     */
    interceptConsoleErrors() {
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalLog = console.log;

        console.error = (...args) => {
            this.addError('error', args.join(' '));
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.addError('warn', args.join(' '));
            originalWarn.apply(console, args);
        };

        // window.onerror イベントもキャプチャ
        window.addEventListener('error', (event) => {
            this.addError('error', `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`);
        });

        // unhandledrejection イベントもキャプチャ
        window.addEventListener('unhandledrejection', (event) => {
            this.addError('error', `Unhandled Promise Rejection: ${event.reason}`);
        });
    }

    /**
     * エラーを追加
     */
    addError(level, message, context = {}) {
        const error = {
            id: Date.now() + Math.random(),
            timestamp: Date.now(),
            level: level,
            message: message,
            context: context,
            count: 1
        };

        // 重複エラーをチェック
        const existing = this.errors.find(e => e.message === message && e.level === level);
        if (existing) {
            existing.count++;
            existing.timestamp = Date.now();
        } else {
            this.errors.unshift(error);
            
            // 最大100件に制限
            if (this.errors.length > 100) {
                this.errors = this.errors.slice(0, 100);
            }
        }

        this.saveErrors();
        this.updateErrorDisplay();
    }

    /**
     * エラーを保存
     */
    saveErrors() {
        try {
            localStorage.setItem('debug-errors', JSON.stringify(this.errors));
        } catch (error) {
            console.warn('Error saving debug errors:', error);
        }
    }

    /**
     * エラー表示を更新
     */
    updateErrorDisplay() {
        this.updateErrorStats();
        this.updateErrorList();
        this.updateErrorPatterns();
    }

    /**
     * エラー統計を更新
     */
    updateErrorStats() {
        const stats = this.errors.reduce((acc, error) => {
            acc.total += error.count;
            acc[error.level] = (acc[error.level] || 0) + error.count;
            return acc;
        }, { total: 0, error: 0, warn: 0, info: 0 });

        this.setElementText('total-errors', stats.total);
        this.setElementText('critical-errors', stats.error || 0);
        this.setElementText('warning-errors', stats.warn || 0);
        this.setElementText('info-errors', stats.info || 0);
    }

    /**
     * エラーリストを更新
     */
    updateErrorList() {
        const list = this.element.querySelector('#error-list');
        if (!list) return;

        list.innerHTML = '';
        
        const filter = this.element.querySelector('#error-filter').value;
        const filteredErrors = filter === 'all' ? this.errors : this.errors.filter(e => e.level === filter);

        filteredErrors.slice(0, 20).forEach(error => {
            const div = document.createElement('div');
            div.className = `error-item error-${error.level}`;
            div.innerHTML = `
                <div class="error-header">
                    <span class="error-level">[${error.level.toUpperCase()}]</span>
                    <span class="error-time">${new Date(error.timestamp).toLocaleTimeString()}</span>
                    ${error.count > 1 ? `<span class="error-count">×${error.count}</span>` : ''}
                </div>
                <div class="error-message">${this.escapeHtml(error.message)}</div>
                ${Object.keys(error.context).length > 0 ? `<div class="error-context">${JSON.stringify(error.context)}</div>` : ''}
            `;
            list.appendChild(div);
        });
    }

    /**
     * エラーパターン分析を更新
     */
    updateErrorPatterns() {
        const patterns = this.element.querySelector('#error-patterns');
        if (!patterns) return;

        // 簡単なパターン分析
        const messagePatterns = {};
        this.errors.forEach(error => {
            const key = error.message.split(' ').slice(0, 3).join(' '); // 最初の3単語でパターン化
            messagePatterns[key] = (messagePatterns[key] || 0) + error.count;
        });

        const topPatterns = Object.entries(messagePatterns)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        if (topPatterns.length > 0) {
            patterns.innerHTML = `
                <h5>よく発生するエラーパターン:</h5>
                ${topPatterns.map(([pattern, count]) => 
                    `<div class="pattern-item">${this.escapeHtml(pattern)}: ${count}件</div>`
                ).join('')}
            `;
        } else {
            patterns.innerHTML = '<div class="pattern-info">パターン分析結果がここに表示されます</div>';
        }
    }

    /**
     * エラーをクリア
     */
    clearErrors() {
        this.errors = [];
        this.saveErrors();
        this.updateErrorDisplay();
    }

    /**
     * エラーをエクスポート
     */
    exportErrors() {
        const data = {
            exportTime: new Date().toISOString(),
            gameEngine: 'BubblePop',
            errors: this.errors
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug-errors-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * エラーをフィルター
     */
    filterErrors(filter) {
        this.updateErrorList();
    }

    /**
     * HTMLエスケープ
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 要素のテキストを設定
     */
    setElementText(id, text) {
        const element = this.element.querySelector(`#${id}`);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * パネルを表示
     */
    show() {
        if (this.element) {
            this.element.style.display = 'block';
            this.updateErrorDisplay();
        }
    }

    /**
     * パネルを非表示
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    /**
     * パネルサイズを更新（レスポンシブレイアウト用）
     */
    updateSize() {
        // パネルサイズ変更時の処理
        if (this.element) {
            // エラーリストの表示を更新
            this.updateErrorDisplay();
        }
    }

    /**
     * パネルを破棄
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}