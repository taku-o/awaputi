// TypeScript conversion - basic types
interface BasicConfig { [key: string]: any }
import { ErrorPreventionHandler  } from './error-recovery-manager/ErrorPreventionHandler.js';
import { UndoRedoSystem  } from './error-recovery-manager/UndoRedoSystem.js';
import { AutoSaveSystem  } from './error-recovery-manager/AutoSaveSystem.js';

/**
 * ErrorRecoveryManager - メインコントローラー
 * 
 * Main Controller Patternにより、専門化されたコンポーネントを統制します。
 * エラー防止、Undo/Redo、自動保存機能を統合して管理します。
 */
export class ErrorRecoveryManager {
    private config: BasicConfig,
    private, state: any,
    /**
     * ErrorRecoveryManagerを初期化 }
     * @param {Object} gameEngine - ゲームエンジンインスタンス'
     */''
    constructor(gameEngine: any) {
        this.gameEngine = gameEngine,
        this.isInitialized = false,
        
        // 設定とエラー処理オプション
        this.config = {
            // 基本設定
            enabled: true,
            preventionEnabled: true,
            recoveryEnabled: true,
            undoRedoEnabled: true,
            warningEnabled: true,
            // エラー防止設定
           , prevention: {
                confirmCriticalActions: true,
                preventAccidentalClicks: true,
    safetyDelays: {
                    criticalAction: 1000,
    destructiveAction: 2000 }
                    gameReset: 3000 
    };
                warningThresholds: { lowHP: 2,
                    lowScore: 50,
    timeRunningOut: 10000 // 10秒 };
                doubleClickPrevention: 500;
            },
            
            // エラー回復設定
            recovery: { autoSave: true,
    saveInterval: 30000, // 30秒,
                maxUndoSteps: 10,
                maxRedoSteps: 10,
                maxSavePoints: 5,
    gracePeriod: 5000, // 5秒の猶予期間,
                emergencyRestore: true  };
            // エラーメッセージ設定
            messages: { showDetailed: true,
                showSuggestions: true,
    showPreventionTips: true,
                language: 'ja',
                verbosity: 'detailed' // concise, detailed, verbose },
            
            // UI設定
            ui: { ''
                position: 'center', // center, top, bottom,
                animation: 'slide',
    duration: 5000,
                persistent: false,
                backgroundColor: '#f8f9fa',
                borderColor: '#dc3545'
            }
        };
        // エラータイプの定義
        this.errorTypes = { // ゲームプレイエラー
            gameplay: {
                missedBubble: {''
                    name: 'バブルの取り逃し',
                    severity: 'medium',
    recoverable: false,
                    preventable: true,
                    message: 'バブルを取り逃しました',
                    suggestion: 'もう少し早めにクリックしてみましょう',
                    prevention: 'バブルの色が変わったらすぐにクリック'
            };
                wrongBubble: { ''
                    name: '間違ったバブルをクリック',
                    severity: 'low',
    recoverable: false,
                    preventable: true,
                    message: '意図しないバブルをクリックしました',
                    suggestion: '狙いを定めてからクリックしましょう',
                    prevention: 'マウスカーソルの位置を確認してからクリック'
            };
                poisonBubble: { ''
                    name: 'ポイズンバブルをクリック',
                    severity: 'high',
    recoverable: false,
                    preventable: true,
                    message: '危険なポイズンバブルをクリックしました',
                    suggestion: 'ピンクバブルでHPを回復しましょう',
                    prevention: '緑色のバブルは避けるようにしましょう'
            };
                comboBreak: { ''
                    name: 'コンボが途切れた',
                    severity: 'medium',
    recoverable: false,
                    preventable: true,
                    message: 'コンボが途切れました',
                    suggestion: '次は連続してバブルをクリックしてみましょう',
                    prevention: 'ミスをしないよう慎重にプレイ'
            }
            };
            // UI/UXエラー
            interface: { accidentalPause: {''
                    name: '誤って一時停止',
                    severity: 'low',
    recoverable: true,
                    preventable: true,
                    message: 'ゲームが一時停止されました',
                    suggestion: 'スペースキーまたは再生ボタンで再開',
                    prevention: 'ポーズボタンの位置を確認'
            };
                accidentalReset: { ''
                    name: '誤ってリセット',
                    severity: 'high',
    recoverable: true,
                    preventable: true,
                    message: 'ゲームがリセットされました',
                    suggestion: '前回のセーブから復元できます',
                    prevention: 'リセット前に確認ダイアログを表示'
            };
                settingsChanged: { ''
                    name: '意図しない設定変更',
                    severity: 'medium',
    recoverable: true,
                    preventable: true,
                    message: '設定が変更されました',
                    suggestion: '前の設定に戻すことができます',
                    prevention: '設定変更時の確認'
            };
                menuNavigation: { ''
                    name: 'メニューでの迷子',
                    severity: 'low',
    recoverable: true,
                    preventable: true,
                    message: 'メニューで迷子になりました',
                    suggestion: 'ホームボタンでメインメニューに戻れます',
                    prevention: 'パンくずナビゲーションの表示'
            }
            };
            // 入力エラー
            input: { doubleClick: {''
                    name: 'ダブルクリック',
                    severity: 'low',
    recoverable: false,
                    preventable: true,
                    message: '同じバブルを二度クリックしました',
                    suggestion: '一度のクリックで十分です',
                    prevention: 'クリック後少し待ってから次の操作'
            };
                rapidClicks: { ''
                    name: '連打し過ぎ',
                    severity: 'medium',
    recoverable: false,
                    preventable: true,
                    message: 'クリックが速すぎます',
                    suggestion: 'もう少しゆっくりクリックしてみましょう',
                    prevention: 'クリック間隔を空ける'
            };
                misclick: { ''
                    name: 'ミスクリック',
                    severity: 'low',
    recoverable: false,
                    preventable: true,
                    message: '意図しない場所をクリックしました',
                    suggestion: '正確に狙ってクリックしましょう',
                    prevention: 'マウス感度を調整'
            }
            };
            // システムエラー
            system: { performanceDrop: {''
                    name: 'パフォーマンス低下',
                    severity: 'medium',
    recoverable: true,
                    preventable: true,
                    message: 'ゲームの動作が重くなっています',
                    suggestion: '他のアプリを閉じるかブラウザを再起動',
                    prevention: '定期的なブラウザメンテナンス'
            };
                connectionLoss: { ''
                    name: '接続の問題',
                    severity: 'high',
    recoverable: true,
                    preventable: false,
                    message: 'インターネット接続に問題があります',
                    suggestion: '接続を確認してページを再読み込み',
                    prevention: '安定したネットワーク環境の確保'
            }
};
        // 状態管理
        this.state = { errorHistory: [],
            currentError: null,
    errorCount: {
                total: 0,
                byType: new Map('',
    level: 'normal'
            };
            recoveryMode: { active: false,
                availableOptions: [],
    currentStep: 0 
    };
        // 警告システム)
        this.warningSystem = { enabled: true)
            activeWarnings: new Map(),
            warningHistory: [],
    thresholds: {
                errorFrequency: 3, // 3回以上で警告,
                timeWindow: 60000, // 1分間,
                criticalHP: 1,
    timeRemaining: 10000 // 10秒  }
        };
        // UI要素
        this.ui = { errorDialog: null,
            confirmDialog: null,
            warningBanner: null,
    recoveryPanel: null  };
        // 専門化されたコンポーネント
        this.preventionHandler = null;
        this.undoRedoSystem = null;
        this.autoSaveSystem = null;
        
        // イベントリスナー
        this.boundHandlers = { beforeUnload: this.handleBeforeUnload.bind(this,
            error: this.handleError.bind(this),
            keydown: this.handleKeydown.bind(this),
            click: this.handleClick.bind(this),
            gameAction: this.handleGameAction.bind(this,
    stateChange: this.handleStateChange.bind(this  };
        
        this.initialize();
    }
    
    /**
     * システムを初期化
     */''
    async initialize()';
            console.log('ErrorRecoveryManager: 初期化開始',
            
            // 設定の読み込み
            await this.loadConfiguration();
            
            // UI要素の作成
            this.createErrorRecoveryUI();
            
            // 専門化されたコンポーネントを初期化
            this.preventionHandler = new ErrorPreventionHandler(this.config, this.ui);
            this.undoRedoSystem = new UndoRedoSystem(this.config, this.gameEngine);
            this.autoSaveSystem = new AutoSaveSystem(this.config, this.gameEngine);
            
            // 防止処理のコールバック設定
            this.preventionHandler.onPreventionAction = this.handlePreventionAction.bind(this);
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // エラー監視の開始
            this.startErrorMonitoring();
            
            // アクセシビリティマネージャーとの統合
            if(this.gameEngine.accessibilityManager) { this.integrateWithAccessibilityManager()',
            console.log('ErrorRecoveryManager: 初期化完了 }', ' }'

        } catch (error) {
            console.error('ErrorRecoveryManager: 初期化エラー:', error',
            throw error }
    }
    
    /**
     * 設定を読み込み'
     */''
    async loadConfiguration()';
            const savedConfig = localStorage.getItem('errorRecoveryConfig);
            if(savedConfig) {
                const parsed = JSON.parse(savedConfig) }

                this.mergeConfig(parsed); }
            }
            ';
            // エラー履歴の読み込み
            const savedHistory = localStorage.getItem('errorRecoveryHistory);
            if(savedHistory) {
                const parsed = JSON.parse(savedHistory) }
                this.state.errorHistory = parsed.errorHistory || []; }
                this.state.errorCount = parsed.errorCount || { total: 0, byType: new Map(), recent: []  }
                // Mapオブジェクトの復元
                if (parsed.errorCount.byType) { this.state.errorCount.byType = new Map(parsed.errorCount.byType) }'} catch (error) { console.warn('ErrorRecoveryManager: 設定読み込みエラー:', error }
    }
    
    /**
     * エラー回復UIを作成
     */
    createErrorRecoveryUI() {
        // エラーダイアログを作成
        this.ui.errorDialog = this.createErrorDialog(),
        
        // 確認ダイアログを作成
        this.ui.confirmDialog = this.createConfirmDialog(),
        
        // 警告バナーを作成
        this.ui.warningBanner = this.createWarningBanner(),
        // 回復パネルを作成
        this.ui.recoveryPanel = this.createRecoveryPanel() }

        console.log('ErrorRecoveryManager: UI作成完了') }'
    }
    
    /**
     * エラーダイアログを作成'
     */''
    createErrorDialog()';
        const dialog = document.createElement('div');
        dialog.id = 'error-recovery-dialog';
        dialog.className = 'error-dialog hidden';
        dialog.setAttribute('role', 'alertdialog');
        dialog.setAttribute('aria-labelledby', 'error-title');
        dialog.setAttribute('aria-describedby', 'error-description');
        ';

        dialog.innerHTML = `';
            <div class="error-dialog-backdrop"></div>"";
            <div class="error-dialog-content">"";
                <div class="error-dialog-header">"";
                    <div class="error-icon">⚠️</div>"";
                    <h2 id="error-title" class="error-title"></h2>"";
                    <button class="error-close-btn" aria-label="閉じる">×</button>";
                </div>"";
                <div class="error-dialog-body">"";
                    <p id="error-description" class="error-description"></p>"";
                    <div class="error-suggestion">";
                        <h3>解決方法:</h3>"";
                        <p class="error-suggestion-text"></p>";
                    </div>"";
                    <div class="error-prevention">";
                        <h3>今後の防止策:</h3>"";
                        <p class="error-prevention-text"></p>";
                    </div>"";
                    <div class="error-actions">"";
                        <button class="error-action-btn primary" data-action="retry">再試行</button>"";
                        <button class="error-action-btn secondary" data-action="undo">元に戻す</button>"";
                        <button class="error-action-btn secondary" data-action="continue">続行</button>;
                    </div>;
                </div>;
            </div>;
        `;
        
        // スタイルを適用
        this.applyErrorDialogStyles(dialog);
        
        // イベントリスナーを設定
        this.setupErrorDialogEvents(dialog);
        
        document.body.appendChild(dialog);
        return dialog;
    }
    
    /**
     * エラーダイアログのスタイルを適用"
     */""
    applyErrorDialogStyles(dialog) {
        const styles = `,
            .error-dialog {
                position: fixed,
                top: 0,
                left: 0,
                width: 100%,
    height: 100%,
                z-index: 10000,
                display: flex,
                align-items: center,
                justify-content: center,"
    }"
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            }
            
            .error-dialog.hidden { display: none }
            
            .error-dialog-backdrop { position: absolute,
                top: 0,
                left: 0,
                width: 100%,
                height: 100%,
    background: rgba(0, 0, 0, 0.6),
                backdrop-filter: blur(3px) }
            
            .error-dialog-content { position: relative,
                background: white,
                border-radius: 12px,
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3),
                max-width: 500px,
                width: 90%,
                max-height: 80vh,
                overflow: hidden,
    animation: errorDialogSlideIn 0.3s ease-out  }
            
            .error-dialog-header { background: linear-gradient(135deg, #dc3545, #c82333),
                color: white,
                padding: 20px,
    display: flex,
                align-items: center,
                gap: 15px,
    position: relative  }
            
            .error-icon { font-size: 28px,
                flex-shrink: 0 }
            
            .error-title { flex: 1,
                margin: 0,
                font-size: 18px,
                font-weight: 600 }
            
            .error-close-btn { background: none,
                border: none,
    color: white,
                font-size: 24px,
                cursor: pointer,
                padding: 0,
                width: 32px,
    height: 32px,
                border-radius: 50%,
                display: flex,
                align-items: center,
                justify-content: center,
                transition: background-color 0.2s  }
            
            .error-close-btn:hover { background-color: rgba(255, 255, 255, 0.2 }
            
            .error-dialog-body { padding: 25px }
            
            .error-description { color: #2c3e50,
                margin: 0 0 20px 0,
                font-size: 16px,
                line-height: 1.5 }
            
            .error-suggestion,
            .error-prevention { margin-bottom: 20px,
                padding: 15px,
                border-radius: 8px,
                background: #f8f9fa,
                border-left: 4px solid #28a745 }
            
            .error-prevention { border-left-color: #17a2b8 }
            
            .error-suggestion h3,
            .error-prevention h3 { margin: 0 0 8px 0,
                font-size: 14px,
                font-weight: 600,
                color: #495057  }
            
            .error-suggestion-text;
            .error-prevention-text { margin: 0,
                font-size: 14px,
                color: #6c757d,
                line-height: 1.4 }
            
            .error-actions { display: flex,
                gap: 12px,
                justify-content: flex-end,
                margin-top: 25px }
            
            .error-action-btn { padding: 10px 20px,
                border: none,
                border-radius: 6px,
                cursor: pointer,
                font-size: 14px,
                font-weight: 500,
                transition: all 0.2s  }
            
            .error-action-btn.primary { background: #dc3545,
    color: white }
            
            .error-action-btn.primary: hover { background: #c82333,
    transform: translateY(-1px }
            
            .error-action-btn.secondary { background: #6c757d,
    color: white }
            
            .error-action-btn.secondary: hover { background: #545b62,
    transform: translateY(-1px }
            
            @keyframes errorDialogSlideIn { from {
                    opacity: 0,
    transform: scale(0.9) translateY(-20px }

                to { opacity: 1,''
                    transform: scale(1) translateY(0  }
            }
        `;

        if(!document.getElementById('error-dialog-styles)' { ''
            const styleSheet = document.createElement('style'),
            styleSheet.id = 'error-dialog-styles',
            styleSheet.textContent = styles,
            document.head.appendChild(styleSheet) }
    }
    
    /**
     * エラーダイアログのイベントを設定'
     */''
    setupErrorDialogEvents(dialog) {
        // 閉じるボタン
        dialog.querySelector('.error-close-btn').addEventListener('click', () => { ''
            this.hideErrorDialog()',
        dialog.querySelector('.error-dialog-backdrop').addEventListener('click', () => {''
            this.hideErrorDialog()',
        dialog.querySelectorAll('.error-action-btn).forEach(btn => {),
            btn.addEventListener('click', () => {
    }

                const action = btn.dataset.action;' }'

                this.handleErrorAction(action); }
            };
        ';
        // キーボードサポート
        dialog.addEventListener('keydown', (e) => {  ''
            if(e.key === 'Escape' { }'
                this.hideErrorDialog(); }
}
    
    /**
     * 確認ダイアログを作成'
     */''
    createConfirmDialog()';
        const dialog = document.createElement('div');
        dialog.id = 'confirm-dialog';
        dialog.className = 'confirm-dialog hidden';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-labelledby', 'confirm-title');
        dialog.setAttribute('aria-describedby', 'confirm-description');
        ';

        dialog.innerHTML = `';
            <div class="confirm-dialog-backdrop"></div>"";
            <div class="confirm-dialog-content">"";
                <div class="confirm-dialog-header">"";
                    <div class="confirm-icon">❓</div>"";
                    <h2 id="confirm-title" class="confirm-title"></h2>";
                </div>"";
                <div class="confirm-dialog-body">"";
                    <p id="confirm-description" class="confirm-description"></p>"";
                    <div class="confirm-warning">"";
                        <p class="confirm-warning-text"></p>;
                    </div>";
                </div>"";
                <div class="confirm-dialog-footer">"";
                    <button class="confirm-btn cancel">キャンセル</button>"";
                    <button class="confirm-btn proceed">実行</button>;
                </div>;
            </div>;
        `;
        
        document.body.appendChild(dialog);
        return dialog;
    }
    
    /**
     * 警告バナーを作成"
     */""
    createWarningBanner() {"

        const banner = document.createElement('div'),
        banner.id = 'warning-banner',
        banner.className = 'warning-banner hidden',
        banner.setAttribute('role', 'alert'),
        banner.setAttribute('aria-live', 'polite'),
        ',

        banner.innerHTML = `',
            <div class="warning-content">"",
                <div class="warning-icon">⚠️</div>"",
                <div class="warning-text">"",
                    <div class="warning-title"></div>"",
                    <div class="warning-message"></div>",
                </div>"",
                <div class="warning-actions">"",
                    <button class="warning-action-btn">対処する</button>"",
                    <button class="warning-dismiss-btn">×</button>,
                </div>,
            </div>,
        `,
        ",
        // イベントリスナー""
        banner.querySelector('.warning-dismiss-btn').addEventListener('click', () => { ''
            this.hideWarningBanner() }

        banner.querySelector('.warning-action-btn').addEventListener('click', () => { }
            this.handleWarningAction(); }
        };
        
        document.body.appendChild(banner);
        return banner;
    }
    
    /**
     * 回復パネルを作成'
     */''
    createRecoveryPanel()';
        const panel = document.createElement('div');
        panel.id = 'recovery-panel';
        panel.className = 'recovery-panel hidden';
        ';

        panel.innerHTML = `';
            <div class="recovery-header">";
                <h3>エラー回復オプション</h3>"";
                <button class="recovery-close-btn">×</button>";
            </div>"";
            <div class="recovery-content">"";
                <div class="recovery-options">;
                    <!-- 動的に生成される -->;
                </div>;
            </div>;
        `;
        ";
        // イベントリスナー""
        panel.querySelector('.recovery-close-btn').addEventListener('click', () => { this.hideRecoveryPanel() };
        
        document.body.appendChild(panel);
        return panel;
    }
    
    /**
     * イベントリスナーを設定'
     */''
    setupEventListeners()';
        window.addEventListener('beforeunload', this.boundHandlers.beforeUnload';
        ';
        // エラーイベント
        window.addEventListener('error', this.boundHandlers.error';
        window.addEventListener('unhandledrejection', this.boundHandlers.error';
        ';
        // キーボードショートカット
        document.addEventListener('keydown', this.boundHandlers.keydown';
        ';
        // クリックイベント
        document.addEventListener('click', this.boundHandlers.click';
        ';
        // ゲームエンジンイベント
        if(this.gameEngine.eventEmitter) {

            this.gameEngine.eventEmitter.on('gameAction', this.boundHandlers.gameAction',
            this.gameEngine.eventEmitter.on('stateChange', this.boundHandlers.stateChange',
            this.gameEngine.eventEmitter.on('error', this.handleGameError.bind(this)),
            this.gameEngine.eventEmitter.on('bubblePopped', this.handleBubblePopped.bind(this)) }

            this.gameEngine.eventEmitter.on('comboBreak', this.handleComboBreak.bind(this); }
}
    
    /**
     * エラー監視を開始
     */
    startErrorMonitoring() {
        // パフォーマンス監視
        if (this.gameEngine.performanceManager) {
    }
            setInterval(() => {  }
                this.checkPerformanceIssues(); }
            }, 10000); // 10秒間隔
        }
        
        // エラー頻度監視
        setInterval(() => { this.checkErrorFrequency(),' }'

        }, 5000'); // 5秒間隔'

        console.log('ErrorRecoveryManager: エラー監視開始 }
    
    /**
     * パフォーマンス問題をチェック
     */
    checkPerformanceIssues() {
        if (!this.gameEngine.performanceManager') return,
        
        const currentFPS = this.gameEngine.performanceManager.getCurrentFPS(),
        const memoryUsage = this.gameEngine.performanceManager.getMemoryUsage(),
        ',
        // FPSが低い場合
        if(currentFPS < 30) {
            this.handleError({''
                type: 'system',
                subtype: 'performanceDrop' }''
                severity: 'medium') }
                data: { fps: currentFPS }
            ';
        }
        ';
        // メモリ使用量が高い場合
        if(memoryUsage > 100 * 1024 * 1024) { // 100MB
            this.showWarning({''
                type: 'performance',',
                title: 'メモリ使用量警告',' }

                message: 'メモリ使用量が多くなっています。ページを再読み込みすることをお勧めします。'); 
    }
    
    /**
     * エラー頻度をチェック
     */
    checkErrorFrequency() {
        const now = Date.now(),
        const timeWindow = this.warningSystem.thresholds.timeWindow,
        
        // 最近のエラーをフィルタリング
        const recentErrors = this.state.errorCount.recent.filter(),
            errorTime => now - errorTime < timeWindow),
        // 閾値を超えた場合
        if(recentErrors.length >= this.warningSystem.thresholds.errorFrequency) {
            this.showWarning({''
                type: 'errorFrequency',',
                title: 'エラー頻発警告',')
    }

                message: 'エラーが頻発しています。操作を確認するか、ページを再読み込みしてください。'); 
    }
        
        // 古いエラー記録を削除
        this.state.errorCount.recent = recentErrors;
    }
    
    /**
     * イベントハンドラー
     */
    
    handlePreventionAction(actionInfo) { this.recordError(actionInfo) }
    
    handleBeforeUnload(event) {
    ,
        // 未保存の重要な変更がある場合
        if(this.hasUnsavedChanges()) {''
            const message = '未保存の変更があります。本当にページを離れますか？',
            event.returnValue = message }
            return message;
    
    hasUnsavedChanges() {
    
        // ゲーム進行中かチェック
        if (this.gameEngine.gameState?.playing) return true,
        
        // 未保存のスコアがあるかチェック
        if (this.gameEngine.gameState?.score > 0 && !this.gameEngine.gameState?.saved) return true }
        return false;
    
    handleError(event) {
    ',

        const errorInfo = this.analyzeError(event),
        this.recordError(errorInfo),

        if(this.config.enabled && errorInfo.severity !== 'low' { }
            this.showErrorDialog(errorInfo); }
}
    
    analyzeError(event) {
    ',

        let errorInfo = { : undefined''
            timestamp: Date.now('',
    type: 'unknown',
            subtype: 'generic',
            severity: 'medium',
            message: 'エラーが発生しました',
            source: 'system',
    recoverable: false }
            preventable: false }))
        // エラーの種類を判定)
        if (event.type) { // カスタムエラーオブジェクト }
            errorInfo = { ...errorInfo, ...event,'} else if(event.error) { // JavaScriptエラー
            errorInfo.type = 'javascript',
            errorInfo.message = event.error.message,

            errorInfo.source = event.filename,
            errorInfo.severity = 'high',' }

        } else if(event.reason) { // Promise rejection
            errorInfo.type = 'promise',
            errorInfo.message = event.reason.message || String(event.reason),
            errorInfo.severity = 'medium' }
        
        return errorInfo;
    }
    
    recordError(errorInfo) {
    
        // エラー履歴に追加
        this.state.errorHistory.push(errorInfo),
        
        // 最大履歴数を制限
        if (this.state.errorHistory.length > 100) {
    
}
            this.state.errorHistory.shift(); }
        }
        
        // エラーカウントを更新
        this.state.errorCount.total++;
        this.state.errorCount.recent.push(errorInfo.timestamp);
        
        const typeKey = `${errorInfo.type}_${errorInfo.subtype}`;
        const currentCount = this.state.errorCount.byType.get(typeKey) || 0;
        this.state.errorCount.byType.set(typeKey, currentCount + 1);
        // 履歴を保存
        this.saveErrorHistory()';
        console.log('ErrorRecoveryManager: エラー記録:', errorInfo);
    }

    handleKeydown(event) {
        // F9 で回復パネル表示
        if(event.key === 'F9' {'
            event.preventDefault() }
            this.showRecoveryPanel(); }
}
    
    handleClick(event) {
    
        // 防止処理に委譲
    
    }
        return this.preventionHandler.handleClickPrevention(event);
    
    handleGameAction(action) {
    
        // Undo/Redoシステムに委譲
    
    }
        // （既にUndoRedoSystemで処理されている） }
    }
    
    handleStateChange(stateChange) { // 必要に応じて処理 }
    
    handleGameError(error) { this.handleError(error) }
    handleBubblePopped(bubble) { /* 実装省略 */ }
    handleComboBreak() { /* 実装省略 */ }
    
    /**
     * UI操作メソッド
     */

    showErrorDialog(errorInfo) { const dialog = this.ui.errorDialog }
        const errorType = this.errorTypes[errorInfo.type]?.[errorInfo.subtype] || {};
        ';
        // コンテンツを設定
        dialog.querySelector('.error-title').textContent = errorType.name || errorInfo.message;
        dialog.querySelector('.error-description').textContent = ';

            errorType.message || errorInfo.message;
        dialog.querySelector('.error-suggestion-text').textContent = ';
            errorType.suggestion || '問題を確認してください';
        dialog.querySelector('.error-prevention-text').textContent = ';
            errorType.prevention || '注意深く操作してください';
        ';
        // アクションボタンの表示制御
        const retryBtn = dialog.querySelector('[data-action="retry"]');
        const undoBtn = dialog.querySelector('[data-action="undo"]');
        const continueBtn = dialog.querySelector('[data-action="continue"]');

         : undefined';
        retryBtn.style.display = errorType.recoverable ? 'inline-block' : 'none';
        undoBtn.style.display = this.undoRedoSystem.canUndo() ? 'inline-block' : 'none';
        continueBtn.style.display = 'inline-block';
        ';
        // ダイアログを表示
        dialog.classList.remove('hidden');
        dialog.setAttribute('aria-hidden', 'false');
        ';
        // フォーカスを設定
        const firstButton = dialog.querySelector('.error-action-btn: not([style*="display: none"]),
        if (firstButton) { firstButton.focus() }
        
        // 現在のエラーを記録
        this.state.currentError = errorInfo;
    }

    hideErrorDialog()';
        this.ui.errorDialog.classList.add('hidden');
        this.ui.errorDialog.setAttribute('aria-hidden', 'true);
        this.state.currentError = null;
    }

    showWarning(warning) {
        const banner = this.ui.warningBanner,
        banner.querySelector('.warning-title').textContent = warning.title,
        banner.querySelector('.warning-message').textContent = warning.message }

        banner.classList.remove('hidden'; }'
    }

    hideWarningBanner()';
        this.ui.warningBanner.classList.add('hidden);
    }
    
    handleWarningAction() { this.hideWarningBanner() }

    showRecoveryPanel()';
        this.ui.recoveryPanel.classList.remove('hidden);
    }

    hideRecoveryPanel()';
        this.ui.recoveryPanel.classList.add('hidden);
    }
    
    handleErrorAction(action) {
    ',

        switch(action) {''
            case 'retry':',
                this.retryLastAction('''
            case 'undo': ',
                this.undoRedoSystem.undo('',
            case 'continue':,
                // 何もしない
    
    }
                break; }))
        this.hideErrorDialog();
    }

    retryLastAction()';
        console.log('ErrorRecoveryManager: アクションを再試行'
            }
    
    /**
     * 公開API
     */
    
    // Undo/Redo操作
    undo() { return this.undoRedoSystem.undo() }'
    
    redo() { return this.undoRedoSystem.redo() }
    
    canUndo() { return this.undoRedoSystem.canUndo() }
    
    canRedo() { return this.undoRedoSystem.canRedo() }
    ;
    // 自動保存操作
    saveState()';
        return this.autoSaveSystem.performSave('manual);
    }
    
    restoreLatest() { return this.autoSaveSystem.restoreLatest() }
    
    getSavePoints() { return this.autoSaveSystem.getSavePoints() }
    
    restoreFromSavePoint(savePointId) { return this.autoSaveSystem.restoreFromSavePoint(savePointId) }
    
    // 設定管理
    updateConfig(newConfig) {
        this.mergeConfig(newConfig),
        
        // 各コンポーネントの設定更新
        this.preventionHandler.updateConfig(this.config),
        this.undoRedoSystem.updateSettings(this.config),
        this.autoSaveSystem.updateSettings(this.config) }
        this.saveConfiguration(); }
    }
    
    mergeConfig(newConfig) {
    
}
        this.config = { ...this.config, ...newConfig }

    saveConfiguration()';
            localStorage.setItem('errorRecoveryConfig', JSON.stringify(this.config);
            
            const historyData = { errorHistory: this.state.errorHistory,
                errorCount: {'
                    ...this.state.errorCount,
                    byType: Array.from(this.state.errorCount.byType.entries()  }

            };
            localStorage.setItem('errorRecoveryHistory', JSON.stringify(historyData);

        } catch (error) { console.warn('ErrorRecoveryManager: 設定保存エラー:', error }
    }
    
    saveErrorHistory() { this.saveConfiguration() }
    
    // 統計・デバッグ情報
    getStatistics() {
        return { enabled: this.config.enabled,
            errorCount: this.state.errorCount.total,
            recentErrors: this.state.errorCount.recent.length,
            errorTypes: Object.fromEntries(this.state.errorCount.byType,
    prevention: this.preventionHandler.getStatistics() }
            undoRedo: this.undoRedoSystem.getStatistics() };
            autoSave: this.autoSaveSystem.getStatistics(); 
    }

    getSystemHealth('''
            status: 'healthy',
    components: { preventionHandler: !!this.preventionHandler,
                undoRedoSystem: !!this.undoRedoSystem,
    autoSaveSystem: !!this.autoSaveSystem };
            capabilities: { errorPrevention: true,
                undoRedo: true,
                autoSave: true,
    errorRecovery: true }))
            statistics: this.getStatistics(
    timestamp: new Date().toISOString();
        }

    integrateWithAccessibilityManager()';
        console.log('ErrorRecoveryManager: アクセシビリティ統合完了 }
    
    /**
     * クリーンアップ
     */
    destroy() {
        // 各コンポーネントのクリーンアップ
        if (this.preventionHandler') {
    }
            this.preventionHandler.destroy(); }'
        }
        
        if (this.undoRedoSystem) { this.undoRedoSystem.destroy() }
        
        if(this.autoSaveSystem) {
        ',

            this.autoSaveSystem.destroy()',
        window.removeEventListener('beforeunload', this.boundHandlers.beforeUnload',
        window.removeEventListener('error', this.boundHandlers.error',
        document.removeEventListener('keydown', this.boundHandlers.keydown',
        document.removeEventListener('click', this.boundHandlers.click),
        
        // UI要素を削除
        Object.values(this.ui).forEach(element => { ) }
            if (element && element.parentNode) { }
                element.parentNode.removeChild(element); }
};
        // 設定を保存
        this.saveConfiguration()';
        console.log('ErrorRecoveryManager: クリーンアップ完了' }'}