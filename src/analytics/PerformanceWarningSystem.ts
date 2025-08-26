/**
 * パフォーマンス警告システム
 * パフォーマンス問題の検出、分類、通知を提供
 */

export class PerformanceWarningSystem {
    private _realtimeMonitor: any;
    private options: any;
    private activeWarnings: Map<string, any>;
    private warningHistory: any[];
    private warningCategories: Map<string, any>;
    private acknowledgements: Set<string>;
    private warningContainer: HTMLElement | null;
    private _eventListeners: any[];

    constructor(realtimeMonitor: any, options: any = {}) {
        this._realtimeMonitor = realtimeMonitor;
        this.options = {
            enableVisualWarnings: true,
            enableAudioWarnings: false,
            enableBrowserNotifications: true,
            warningDisplayDuration: 10000, // 10秒
            criticalWarningDuration: 15000, // 15秒
            maxVisibleWarnings: 5,
            autoAcknowledge: false,
            ...options
        };

        this.activeWarnings = new Map();
        this.warningHistory = [];
        this.warningCategories = new Map();
        this.acknowledgements = new Set();
        this.warningContainer = null;
        this._eventListeners = [];

        this.initialize();
    }

    /**
     * 初期化
     */
    initialize() {
        this.setupWarningCategories();
        this.createWarningContainer();
        this.setupEventListeners();
    }

    /**
     * 警告カテゴリの設定
     */
    setupWarningCategories() {
        this.warningCategories.set('performance', {
            name: 'パフォーマンス',
            color: '#ff9800',
            icon: '⚠️',
            priority: 2,
            actions: ['詳細表示', '最適化提案']
        });

        this.warningCategories.set('memory', {
            name: 'メモリ',
            color: '#f44336',
            icon: '🧠',
            priority: 3,
            actions: ['メモリクリア', '詳細表示']
        });

        this.warningCategories.set('fps', {
            name: 'フレームレート',
            color: '#ff5722',
            icon: '🎯',
            priority: 2,
            actions: ['品質調整', '詳細表示']
        });

        this.warningCategories.set('error', {
            name: 'エラー',
            color: '#d32f2f',
            icon: '❌',
            priority: 4,
            actions: ['エラー詳細', 'レポート送信']
        });

        this.warningCategories.set('network', {
            name: 'ネットワーク',
            color: '#2196f3',
            icon: '🌐',
            priority: 1,
            actions: ['再試行', '詳細表示']
        });
    }

    /**
     * 警告コンテナの作成
     */
    createWarningContainer() {
        this.warningContainer = document.createElement('div');
        this.warningContainer.id = 'performance-warning-container';
        this.warningContainer.className = 'warning-container';
        
        // スタイルを設定
        Object.assign(this.warningContainer.style, {
            position: 'fixed',
            top: '70px',
            right: '20px',
            width: '400px',
            maxWidth: '90vw',
            zIndex: '10001',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            pointerEvents: 'none'
        });

        document.body.appendChild(this.warningContainer);
        this.applyWarningStyles();
    }

    /**
     * 警告スタイルの適用
     */
    applyWarningStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .warning-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .warning-item {
                background: rgba(0, 0, 0, 0.9);
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                border-left: 4px solid;
                pointer-events: auto;
                transform: translateX(100%);
                animation: slideInWarning 0.3s ease-out forwards;
                transition: all 0.3s ease;
            }
            .warning-item.critical {
                animation: pulseWarning 1s infinite alternate;
            }
            .warning-item.dismissing {
                animation: slideOutWarning 0.3s ease-in forwards;
            }
            .warning-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }
            .warning-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: bold;
                color: white;
            }
            .warning-icon {
                font-size: 16px;
            }
            .warning-severity {
                font-size: 12px;
                padding: 2px 6px;
                border-radius: 4px;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                text-transform: uppercase;
            }
            .warning-message {
                color: #e0e0e0;
                margin-bottom: 12px;
                line-height: 1.4;
            }
            .warning-details {
                background: rgba(255, 255, 255, 0.1);
                padding: 8px;
                border-radius: 4px;
                font-size: 12px;
                color: #ccc;
                margin-bottom: 12px;
                font-family: monospace;
            }
            .warning-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            .warning-action {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.2s;
            }
            .warning-action:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            .warning-action.primary {
                background: rgba(33, 150, 243, 0.8);
            }
            .warning-close {
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                font-size: 18px;
                padding: 0;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .warning-close:hover {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }
            .warning-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.5);
                transition: width 0.1s linear;
            }
            .warning-timestamp {
                font-size: 11px;
                color: #999;
                margin-top: 4px;
            }
            @keyframes slideInWarning {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutWarning {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            @keyframes pulseWarning {
                from {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
                to {
                    box-shadow: 0 4px 20px rgba(255, 0, 0, 0.4);
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        window.addEventListener('realtime-alert', (event: any) => {
            this.processAlert(event.detail);
        });

        // パフォーマンス警告イベントリスナー
        window.addEventListener('performance-warning', (event: any) => {
            this.processPerformanceWarning(event.detail);
        });

        // ウィンドウフォーカスイベント
        window.addEventListener('focus', () => {
            this.onWindowFocus();
        });

        window.addEventListener('blur', () => {
            this.onWindowBlur();
        });
    }

    /**
     * アラートの処理
     */
    processAlert(alertData: any) {
        const warningData = {
            id: alertData.id || this.generateWarningId(),
            type: alertData.type || 'performance',
            severity: this.determineSeverity(alertData),
            title: this.generateTitle(alertData),
            message: alertData.message,
            details: alertData.details,
            timestamp: alertData.timestamp || Date.now(),
            source: alertData.source || 'unknown',
            category: this.determineCategory(alertData),
            autoAcknowledge: this.shouldAutoAcknowledge(alertData)
        };

        this.showWarning(warningData);
    }

    /**
     * パフォーマンス警告の処理
     */
    processPerformanceWarning(warningData: any) {
        const processedWarning = {
            id: this.generateWarningId(),
            type: 'performance',
            severity: warningData.severity || 'warning',
            title: '⚠️ パフォーマンス警告',
            message: warningData.message || 'パフォーマンスの問題が検出されました',
            details: warningData.details,
            timestamp: Date.now(),
            source: 'performance_monitor',
            category: 'performance'
        };

        this.showWarning(processedWarning);
    }

    /**
     * 警告の表示
     */
    showWarning(warningData: any) {
        // 重複チェック
        if (this.isDuplicateWarning(warningData)) {
            return;
        }

        // 警告履歴に追加
        this.warningHistory.push(warningData);
        this.trimWarningHistory();

        // アクティブ警告に追加
        this.activeWarnings.set(warningData.id, warningData);

        // 視覚的警告の表示
        if (this.options.enableVisualWarnings) {
            this.displayVisualWarning(warningData);
        }

        // 音声警告
        if (this.options.enableAudioWarnings) {
            this.playWarningSound(warningData.severity);
        }

        // ブラウザ通知
        if (this.options.enableBrowserNotifications) {
            this.showBrowserNotification(warningData);
        }

        // 自動確認
        if (warningData.autoAcknowledge || this.options.autoAcknowledge) {
            this.scheduleAutoAcknowledge(warningData.id);
        }

        // カスタムイベント発火
        this.dispatchWarningEvent(warningData);
    }

    /**
     * 視覚的警告の表示
     */
    displayVisualWarning(warningData: any) {
        // コンテナが存在しない場合は警告を表示しない
        if (!this.warningContainer) {
            return;
        }

        const category = this.warningCategories.get(warningData.category) || this.warningCategories.get('performance');

        const warningElement = document.createElement('div');
        warningElement.className = `warning-item ${warningData.severity}`;
        warningElement.dataset.warningId = warningData.id;
        warningElement.style.borderLeftColor = category.color;

        const duration = warningData.severity === 'critical' ? 
            this.options.criticalWarningDuration : this.options.warningDisplayDuration;

        warningElement.innerHTML = `
            <div class="warning-progress" style="width: 100%"></div>
            <div class="warning-header">
                <div class="warning-title">
                    <span class="warning-icon">${category.icon}</span>
                    <span>${warningData.title}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="warning-severity">${warningData.severity}</span>
                    <button class="warning-close" onclick="window.performanceWarningSystem?.dismissWarning('${warningData.id}')">&times;</button>
                </div>
            </div>
            <div class="warning-message">${warningData.message}</div>
            ${warningData.details ? `
                <div class="warning-details">
                    ${this.formatWarningDetails(warningData.details)}
                </div>
            ` : ''}
            <div class="warning-actions">
                ${category.actions.map((action: string) => `
                    <button class="warning-action" onclick="window.performanceWarningSystem?.handleWarningAction('${warningData.id}', '${action}')">
                        ${action}
                    </button>
                `).join('')}
                <button class="warning-action primary" onclick="window.performanceWarningSystem?.acknowledgeWarning('${warningData.id}')">
                    確認
                </button>
            </div>
            <div class="warning-timestamp">
                ${new Date(warningData.timestamp).toLocaleTimeString()}
            </div>
        `;

        // 進行状況バーのアニメーション
        const progressBar = warningElement.querySelector('.warning-progress') as HTMLElement;
        let startTime = Date.now();
        
        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.max(0, 100 - (elapsed / duration) * 100);
            progressBar.style.width = `${progress}%`;
            
            if (progress > 0 && this.activeWarnings.has(warningData.id)) {
                requestAnimationFrame(updateProgress);
            }
        };
        requestAnimationFrame(updateProgress);

        this.warningContainer.appendChild(warningElement);

        // 最大表示数の制限
        this.limitVisibleWarnings();

        // 自動削除
        setTimeout(() => {
            if (this.activeWarnings.has(warningData.id)) {
                this.dismissWarning(warningData.id);
            }
        }, duration);
    }

    /**
     * 警告詳細のフォーマット
     */
    formatWarningDetails(details: any): string {
        if (typeof details === 'string') {
            return details;
        }

        if (typeof details === 'object') {
            return Object.entries(details)
                .map(([key, value]) => `${key}: ${value}`)
                .join('<br>');
        }
        
        return JSON.stringify(details);
    }

    /**
     * 音声警告の再生
     */
    playWarningSound(severity: string) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        try {
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // 警告レベルに応じた音程と長さ
            const frequencies: any = {
                'info': 440,
                'warning': 660,
                'error': 880,
                'critical': 1100
            };

            oscillator.frequency.setValueAtTime(frequencies[severity] || 440, ctx.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
        } catch (error) {
            console.warn('Failed to play warning sound:', error);
        }
    }

    /**
     * ブラウザ通知の表示
     */
    async showBrowserNotification(warningData: any) {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            const notification = new Notification(`${warningData.title}`, {
                body: warningData.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `warning-${warningData.category}`,
                requireInteraction: warningData.severity === 'critical'
            });

            notification.onclick = () => {
                window.focus();
                this.highlightWarning(warningData.id);
                notification.close();
            };

            // 自動で閉じる
            setTimeout(() => {
                notification.close();
            }, 5000);
        } else if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.showBrowserNotification(warningData);
            }
        }
    }

    /**
     * 警告の重複チェック
     */
    isDuplicateWarning(warningData: any): boolean {
        const recentWarnings = this.warningHistory.slice(-10);
        return recentWarnings.some(warning => 
            warning.type === warningData.type &&
            warning.message === warningData.message &&
            (Date.now() - warning.timestamp) < 30000 // 30秒以内
        );
    }

    /**
     * 重要度の決定
     */
    determineSeverity(alertData: any): string {
        if (alertData.severity) return alertData.severity;

        if (alertData.type === 'error') return 'error';
        if (alertData.details?.currentFPS && alertData.details.currentFPS < 15) return 'critical';
        if (alertData.details?.usagePercent && alertData.details.usagePercent > 90) return 'critical';

        return 'warning';
    }

    /**
     * タイトルの生成
     */
    generateTitle(alertData: any): string {
        const category = this.warningCategories.get(alertData.type);
        const icon = category?.icon || '⚠️';
        const name = category?.name || 'システム';
        return `${icon} ${name}警告`;
    }

    /**
     * カテゴリの決定
     */
    determineCategory(alertData: any): string {
        if (this.warningCategories.has(alertData.type)) {
            return alertData.type;
        }

        if (alertData.message?.includes('FPS') || alertData.message?.includes('フレーム')) {
            return 'fps';
        }
        if (alertData.message?.includes('メモリ') || alertData.message?.includes('memory')) {
            return 'memory';
        }
        if (alertData.message?.includes('エラー') || alertData.message?.includes('error')) {
            return 'error';
        }

        return 'performance';
    }

    /**
     * 自動確認の判定
     */
    shouldAutoAcknowledge(alertData: any): boolean {
        return alertData.severity === 'info' || alertData.type === 'network';
    }

    /**
     * 警告の削除
     */
    dismissWarning(warningId: string) {
        const warningElement = document.querySelector(`[data-warning-id="${warningId}"]`) as HTMLElement;
        if (warningElement) {
            warningElement.classList.add('dismissing');
            setTimeout(() => {
                if (warningElement.parentNode) {
                    warningElement.parentNode.removeChild(warningElement);
                }
            }, 300);
        }
        
        this.activeWarnings.delete(warningId);
    }

    /**
     * 警告の確認
     */
    acknowledgeWarning(warningId: string) {
        this.acknowledgements.add(warningId);
        this.dismissWarning(warningId);
    }

    /**
     * 警告アクションの処理
     */
    handleWarningAction(warningId: string, action: string) {
        const warningData = this.activeWarnings.get(warningId);
        if (!warningData) return;

        switch(action) {
            case '詳細表示':
                this.showWarningDetails(warningData);
                break;
            case '最適化提案':
                this.showOptimizationSuggestions(warningData);
                break;
            case 'メモリクリア':
                this.triggerMemoryCleanup();
                break;
            case '品質調整':
                this.suggestQualityAdjustment(warningData);
                break;
            case 'エラー詳細':
                this.showErrorDetails(warningData);
                break;
            case 'レポート送信':
                this.sendErrorReport(warningData);
                break;
            case '再試行':
                this.retryOperation(warningData);
                break;
        }
    }

    /**
     * 警告詳細の表示
     */
    showWarningDetails(warningData: any) {
        alert(`警告詳細:\n\nタイプ: ${warningData.type}\n重要度: ${warningData.severity}\nメッセージ: ${warningData.message}\n時刻: ${new Date(warningData.timestamp).toLocaleString()}\n\n詳細: ${JSON.stringify(warningData.details, null, 2)}`);
    }

    /**
     * 最適化提案の表示
     */
    showOptimizationSuggestions(warningData: any) {
        const suggestions = this.generateOptimizationSuggestions(warningData);
        alert(`最適化提案:\n\n${suggestions.join('\n')}`);
    }

    /**
     * 最適化提案の生成
     */
    generateOptimizationSuggestions(warningData: any): string[] {
        const suggestions = [];

        if (warningData.type === 'performance' || warningData.category === 'fps') {
            suggestions.push('• エフェクトの品質を下げてください');
            suggestions.push('• 他のアプリケーションを閉じてください');
            suggestions.push('• ブラウザのタブ数を減らしてください');
        }

        if (warningData.category === 'memory') {
            suggestions.push('• ブラウザを再起動してください');
            suggestions.push('• 不要なタブを閉じてください');
            suggestions.push('• ゲームを一度終了して再開してください');
        }

        return suggestions.length > 0 ? suggestions : ['• 現在利用可能な提案はありません'];
    }

    /**
     * 表示する警告数の制限
     */
    limitVisibleWarnings() {
        if (!this.warningContainer) return;

        const warningElements = this.warningContainer.querySelectorAll('.warning-item');
        if (warningElements.length > this.options.maxVisibleWarnings) {
            const oldestElement = warningElements[0] as HTMLElement;
            const warningId = oldestElement.dataset.warningId!;
            this.dismissWarning(warningId);
        }
    }

    /**
     * 警告履歴のトリミング
     */
    trimWarningHistory() {
        if (this.warningHistory.length > 100) {
            this.warningHistory = this.warningHistory.slice(-100);
        }
    }

    /**
     * 警告ID生成
     */
    generateWarningId(): string {
        return `warning_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    /**
     * カスタムイベント発火
     */
    dispatchWarningEvent(warningData: any) {
        const event = new CustomEvent('performance-warning-displayed', {
            detail: warningData
        });
        window.dispatchEvent(event);
    }

    /**
     * ウィンドウフォーカス時の処理
     */
    onWindowFocus() {
        // フォーカス時に未確認の重要な警告をハイライト
        this.activeWarnings.forEach((warning, id) => {
            if (warning.severity === 'critical' && !this.acknowledgements.has(id)) {
                this.highlightWarning(id);
            }
        });
    }

    /**
     * ウィンドウブラー時の処理
     */
    onWindowBlur() {
        // ブラー時は特に何もしない
    }

    /**
     * 警告のハイライト
     */
    highlightWarning(warningId: string) {
        const warningElement = document.querySelector(`[data-warning-id="${warningId}"]`) as HTMLElement;
        if (warningElement) {
            warningElement.style.animation = 'pulseWarning 0.5s ease-in-out 3';
        }
    }

    /**
     * 統計情報の取得
     */
    getWarningStatistics() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const recentWarnings = this.warningHistory.filter(w => w.timestamp > oneHourAgo);
        
        const statistics: any = {
            totalWarnings: this.warningHistory.length,
            recentWarnings: recentWarnings.length,
            activeWarnings: this.activeWarnings.size,
            acknowledgedWarnings: this.acknowledgements.size,
            warningsByType: {},
            warningsBySeverity: {}
        };

        recentWarnings.forEach(warning => {
            statistics.warningsByType[warning.type] = (statistics.warningsByType[warning.type] || 0) + 1;
            statistics.warningsBySeverity[warning.severity] = (statistics.warningsBySeverity[warning.severity] || 0) + 1;
        });
        
        return statistics;
    }

    /**
     * すべての警告をクリア
     */
    clearAllWarnings() {
        this.activeWarnings.forEach((_, id) => {
            this.dismissWarning(id);
        });
        this.activeWarnings.clear();
    }

    /**
     * 設定の更新
     */
    updateOptions(newOptions: any) {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * 自動確認のスケジュール
     */
    private scheduleAutoAcknowledge(_warningId: string) {
        // 実装が必要な場合はここに追加
    }

    /**
     * メモリクリーンアップのトリガー
     */
    private triggerMemoryCleanup() {
        // 実装が必要な場合はここに追加
        console.log('Memory cleanup triggered');
    }

    /**
     * 品質調整の提案
     */
    private suggestQualityAdjustment(warningData: any) {
        // 実装が必要な場合はここに追加
        console.log('Quality adjustment suggested', warningData);
    }

    /**
     * エラー詳細の表示
     */
    private showErrorDetails(warningData: any) {
        // 実装が必要な場合はここに追加
        console.log('Error details', warningData);
    }

    /**
     * エラーレポートの送信
     */
    private sendErrorReport(warningData: any) {
        // 実装が必要な場合はここに追加
        console.log('Error report sent', warningData);
    }

    /**
     * 操作の再試行
     */
    private retryOperation(warningData: any) {
        // 実装が必要な場合はここに追加
        console.log('Retrying operation', warningData);
    }

    /**
     * リソースの解放
     */
    destroy() {
        this.clearAllWarnings();
        if (this.warningContainer) {
            this.warningContainer.remove();
            this.warningContainer = null;
        }
        
        // グローバル参照を削除
        if ((window as any).performanceWarningSystem === this) {
            delete (window as any).performanceWarningSystem;
        }

        console.log('PerformanceWarningSystem destroyed');
    }
}

// グローバルアクセス用
(window as any).performanceWarningSystem = null;