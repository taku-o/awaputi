/**
 * ErrorRecoveryManager - エラー回復管理システム
 * 
 * ミステイクハンドリングとエラー回復機能を提供し、ユーザーのミスからの回復をサポートします。
 * WCAG 2.1 AAガイドラインに準拠した認知アクセシビリティ機能を実装します。
 */

export class ErrorRecoveryManager {
    /**
     * ErrorRecoveryManagerを初期化
     * @param {Object} gameEngine - ゲームエンジンインスタンス
     */
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.isInitialized = false;
        
        // 設定とエラー処理オプション
        this.config = {
            // 基本設定
            enabled: true,
            preventionEnabled: true,
            recoveryEnabled: true,
            undoRedoEnabled: true,
            warningEnabled: true,
            
            // エラー防止設定
            prevention: {
                confirmCriticalActions: true,
                preventAccidentalClicks: true,
                safetyDelays: {
                    criticalAction: 1000,
                    destructiveAction: 2000,
                    gameReset: 3000
                },
                warningThresholds: {
                    lowHP: 2,
                    lowScore: 50,
                    timeRunningOut: 10000 // 10秒
                },
                doubleClickPrevention: 500
            },
            
            // エラー回復設定
            recovery: {
                autoSave: true,
                saveInterval: 30000, // 30秒
                maxUndoSteps: 10,
                maxRedoSteps: 10,
                gracePeriod: 5000, // 5秒の猶予期間
                emergencyRestore: true
            },
            
            // エラーメッセージ設定
            messages: {
                showDetailed: true,
                showSuggestions: true,
                showPreventionTips: true,
                language: 'ja',
                verbosity: 'detailed' // concise, detailed, verbose
            },
            
            // UI設定
            ui: {
                position: 'center', // center, top, bottom
                animation: 'slide',
                duration: 5000,
                persistent: false,
                backgroundColor: '#f8f9fa',
                borderColor: '#dc3545'
            }
        };
        
        // エラータイプの定義
        this.errorTypes = {
            // ゲームプレイエラー
            gameplay: {
                missedBubble: {
                    name: 'バブルの取り逃し',
                    severity: 'medium',
                    recoverable: false,
                    preventable: true,
                    message: 'バブルを取り逃しました',
                    suggestion: 'もう少し早めにクリックしてみましょう',
                    prevention: 'バブルの色が変わったらすぐにクリック'
                },
                wrongBubble: {
                    name: '間違ったバブルをクリック',
                    severity: 'low',
                    recoverable: false,
                    preventable: true,
                    message: '意図しないバブルをクリックしました',
                    suggestion: '狙いを定めてからクリックしましょう',
                    prevention: 'マウスカーソルの位置を確認してからクリック'
                },
                poisonBubble: {
                    name: 'ポイズンバブルをクリック',
                    severity: 'high',
                    recoverable: false,
                    preventable: true,
                    message: '危険なポイズンバブルをクリックしました',
                    suggestion: 'ピンクバブルでHPを回復しましょう',
                    prevention: '緑色のバブルは避けるようにしましょう'
                },
                comboBreak: {
                    name: 'コンボが途切れた',
                    severity: 'medium',
                    recoverable: false,
                    preventable: true,
                    message: 'コンボが途切れました',
                    suggestion: '次は連続してバブルをクリックしてみましょう',
                    prevention: 'ミスをしないよう慎重にプレイ'
                }
            },
            
            // UI/UXエラー
            interface: {
                accidentalPause: {
                    name: '誤って一時停止',
                    severity: 'low',
                    recoverable: true,
                    preventable: true,
                    message: 'ゲームが一時停止されました',
                    suggestion: 'スペースキーまたは再生ボタンで再開',
                    prevention: 'ポーズボタンの位置を確認'
                },
                accidentalReset: {
                    name: '誤ってリセット',
                    severity: 'high',
                    recoverable: true,
                    preventable: true,
                    message: 'ゲームがリセットされました',
                    suggestion: '前回のセーブから復元できます',
                    prevention: 'リセット前に確認ダイアログを表示'
                },
                settingsChanged: {
                    name: '意図しない設定変更',
                    severity: 'medium',
                    recoverable: true,
                    preventable: true,
                    message: '設定が変更されました',
                    suggestion: '前の設定に戻すことができます',
                    prevention: '設定変更時の確認'
                },
                menuNavigation: {
                    name: 'メニューでの迷子',
                    severity: 'low',
                    recoverable: true,
                    preventable: true,
                    message: 'メニューで迷子になりました',
                    suggestion: 'ホームボタンでメインメニューに戻れます',
                    prevention: 'パンくずナビゲーションの表示'
                }
            },
            
            // 入力エラー
            input: {
                doubleClick: {
                    name: 'ダブルクリック',
                    severity: 'low',
                    recoverable: false,
                    preventable: true,
                    message: '同じバブルを二度クリックしました',
                    suggestion: '一度のクリックで十分です',
                    prevention: 'クリック後少し待ってから次の操作'
                },
                rapidClicks: {
                    name: '連打し過ぎ',
                    severity: 'medium',
                    recoverable: false,
                    preventable: true,
                    message: 'クリックが速すぎます',
                    suggestion: 'もう少しゆっくりクリックしてみましょう',
                    prevention: 'クリック間隔を空ける'
                },
                misclick: {
                    name: 'ミスクリック',
                    severity: 'low',
                    recoverable: false,
                    preventable: true,
                    message: '意図しない場所をクリックしました',
                    suggestion: '正確に狙ってクリックしましょう',
                    prevention: 'マウス感度を調整'
                }
            },
            
            // システムエラー
            system: {
                performanceDrop: {
                    name: 'パフォーマンス低下',
                    severity: 'medium',
                    recoverable: true,
                    preventable: true,
                    message: 'ゲームの動作が重くなっています',
                    suggestion: '他のアプリを閉じるかブラウザを再起動',
                    prevention: '定期的なブラウザメンテナンス'
                },
                connectionLoss: {
                    name: '接続の問題',
                    severity: 'high',
                    recoverable: true,
                    preventable: false,
                    message: 'インターネット接続に問題があります',
                    suggestion: '接続を確認してページを再読み込み',
                    prevention: '安定したネットワーク環境の確保'
                }
            }
        };
        
        // 状態管理
        this.state = {
            errorHistory: [],
            undoStack: [],
            redoStack: [],
            gameStates: [],
            currentError: null,
            errorCount: {
                total: 0,
                byType: new Map(),
                recent: []
            },
            preventionMode: {
                active: false,
                triggeredBy: null,
                level: 'normal'
            },
            recoveryMode: {
                active: false,
                availableOptions: [],
                currentStep: 0
            }
        };
        
        // undo/redo システム
        this.undoRedoSystem = {
            enabled: true,
            maxHistory: 10,
            actionHistory: [],
            currentIndex: -1,
            ignoredActions: new Set(['move', 'hover', 'focus']),
            criticalActions: new Set(['reset', 'newGame', 'delete', 'clear'])
        };
        
        // 自動保存システム
        this.autoSaveSystem = {
            enabled: true,
            interval: 30000,
            savePoints: [],
            maxSavePoints: 5,
            currentSaveIndex: 0,
            timer: null
        };
        
        // 警告システム
        this.warningSystem = {
            enabled: true,
            activeWarnings: new Map(),
            warningHistory: [],
            thresholds: {
                errorFrequency: 3, // 3回以上で警告
                timeWindow: 60000, // 1分間
                criticalHP: 1,
                timeRemaining: 10000 // 10秒
            }
        };
        
        // UI要素
        this.ui = {
            errorDialog: null,
            confirmDialog: null,
            warningBanner: null,
            undoButton: null,
            redoButton: null,
            recoveryPanel: null
        };
        
        // イベントリスナー
        this.boundHandlers = {
            beforeUnload: this.handleBeforeUnload.bind(this),
            error: this.handleError.bind(this),
            keydown: this.handleKeydown.bind(this),
            click: this.handleClick.bind(this),
            gameAction: this.handleGameAction.bind(this),
            stateChange: this.handleStateChange.bind(this)
        };
        
        this.initialize();
    }
    
    /**
     * システムを初期化
     */
    async initialize() {
        try {
            console.log('ErrorRecoveryManager: 初期化開始');
            
            // 設定の読み込み
            await this.loadConfiguration();
            
            // UI要素の作成
            this.createErrorRecoveryUI();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // 自動保存システムの開始
            if (this.config.recovery.autoSave) {
                this.startAutoSave();
            }
            
            // エラー監視の開始
            this.startErrorMonitoring();
            
            // アクセシビリティマネージャーとの統合
            if (this.gameEngine.accessibilityManager) {
                this.integrateWithAccessibilityManager();
            }
            
            this.isInitialized = true;
            console.log('ErrorRecoveryManager: 初期化完了');
            
        } catch (error) {
            console.error('ErrorRecoveryManager: 初期化エラー:', error);
            throw error;
        }
    }
    
    /**
     * 設定を読み込み
     */
    async loadConfiguration() {
        try {
            // LocalStorageから設定を読み込み
            const savedConfig = localStorage.getItem('errorRecoveryConfig');
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                this.mergeConfig(parsed);
            }
            
            // エラー履歴の読み込み
            const savedHistory = localStorage.getItem('errorRecoveryHistory');
            if (savedHistory) {
                const parsed = JSON.parse(savedHistory);
                this.state.errorHistory = parsed.errorHistory || [];
                this.state.errorCount = parsed.errorCount || { total: 0, byType: new Map(), recent: [] };
                
                // Mapオブジェクトの復元
                if (parsed.errorCount.byType) {
                    this.state.errorCount.byType = new Map(parsed.errorCount.byType);
                }
            }
            
            // 保存データの読み込み
            const savedStates = localStorage.getItem('errorRecoverySaveStates');
            if (savedStates) {
                this.autoSaveSystem.savePoints = JSON.parse(savedStates);
            }
            
        } catch (error) {
            console.warn('ErrorRecoveryManager: 設定読み込みエラー:', error);
        }
    }
    
    /**
     * エラー回復UIを作成
     */
    createErrorRecoveryUI() {
        // エラーダイアログを作成
        this.ui.errorDialog = this.createErrorDialog();
        
        // 確認ダイアログを作成
        this.ui.confirmDialog = this.createConfirmDialog();
        
        // 警告バナーを作成
        this.ui.warningBanner = this.createWarningBanner();
        
        // Undo/Redoボタンを作成
        this.createUndoRedoButtons();
        
        // 回復パネルを作成
        this.ui.recoveryPanel = this.createRecoveryPanel();
        
        console.log('ErrorRecoveryManager: UI作成完了');
    }
    
    /**
     * エラーダイアログを作成
     */
    createErrorDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'error-recovery-dialog';
        dialog.className = 'error-dialog hidden';
        dialog.setAttribute('role', 'alertdialog');
        dialog.setAttribute('aria-labelledby', 'error-title');
        dialog.setAttribute('aria-describedby', 'error-description');
        
        dialog.innerHTML = `
            <div class="error-dialog-backdrop"></div>
            <div class="error-dialog-content">
                <div class="error-dialog-header">
                    <div class="error-icon">⚠️</div>
                    <h2 id="error-title" class="error-title"></h2>
                    <button class="error-close-btn" aria-label="閉じる">×</button>
                </div>
                <div class="error-dialog-body">
                    <p id="error-description" class="error-description"></p>
                    <div class="error-suggestion">
                        <h3>解決方法:</h3>
                        <p class="error-suggestion-text"></p>
                    </div>
                    <div class="error-prevention">
                        <h3>今後の防止策:</h3>
                        <p class="error-prevention-text"></p>
                    </div>
                    <div class="error-actions">
                        <button class="error-action-btn primary" data-action="retry">再試行</button>
                        <button class="error-action-btn secondary" data-action="undo">元に戻す</button>
                        <button class="error-action-btn secondary" data-action="continue">続行</button>
                    </div>
                </div>
            </div>
        `;
        
        // スタイルを適用
        this.applyErrorDialogStyles(dialog);
        
        // イベントリスナーを設定
        this.setupErrorDialogEvents(dialog);
        
        document.body.appendChild(dialog);
        return dialog;
    }
    
    /**
     * エラーダイアログのスタイルを適用
     */
    applyErrorDialogStyles(dialog) {
        const styles = `
            .error-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .error-dialog.hidden {
                display: none;
            }
            
            .error-dialog-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(3px);
            }
            
            .error-dialog-content {
                position: relative;
                background: white;
                border-radius: 12px;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow: hidden;
                animation: errorDialogSlideIn 0.3s ease-out;
            }
            
            .error-dialog-header {
                background: linear-gradient(135deg, #dc3545, #c82333);
                color: white;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                position: relative;
            }
            
            .error-icon {
                font-size: 28px;
                flex-shrink: 0;
            }
            
            .error-title {
                flex: 1;
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }
            
            .error-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            }
            
            .error-close-btn:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }
            
            .error-dialog-body {
                padding: 25px;
            }
            
            .error-description {
                color: #2c3e50;
                margin: 0 0 20px 0;
                font-size: 16px;
                line-height: 1.5;
            }
            
            .error-suggestion,
            .error-prevention {
                margin-bottom: 20px;
                padding: 15px;
                border-radius: 8px;
                background: #f8f9fa;
                border-left: 4px solid #28a745;
            }
            
            .error-prevention {
                border-left-color: #17a2b8;
            }
            
            .error-suggestion h3,
            .error-prevention h3 {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
                color: #495057;
            }
            
            .error-suggestion-text,
            .error-prevention-text {
                margin: 0;
                font-size: 14px;
                color: #6c757d;
                line-height: 1.4;
            }
            
            .error-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                margin-top: 25px;
            }
            
            .error-action-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .error-action-btn.primary {
                background: #dc3545;
                color: white;
            }
            
            .error-action-btn.primary:hover {
                background: #c82333;
                transform: translateY(-1px);
            }
            
            .error-action-btn.secondary {
                background: #6c757d;
                color: white;
            }
            
            .error-action-btn.secondary:hover {
                background: #545b62;
                transform: translateY(-1px);
            }
            
            @keyframes errorDialogSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
        `;
        
        if (!document.getElementById('error-dialog-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'error-dialog-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
    }
    
    /**
     * エラーダイアログのイベントを設定
     */
    setupErrorDialogEvents(dialog) {
        // 閉じるボタン
        dialog.querySelector('.error-close-btn').addEventListener('click', () => {
            this.hideErrorDialog();
        });
        
        // 背景クリックで閉じる
        dialog.querySelector('.error-dialog-backdrop').addEventListener('click', () => {
            this.hideErrorDialog();
        });
        
        // アクションボタン
        dialog.querySelectorAll('.error-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleErrorAction(action);
            });
        });
        
        // キーボードサポート
        dialog.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideErrorDialog();
            }
        });
    }
    
    /**
     * 確認ダイアログを作成
     */
    createConfirmDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'confirm-dialog';
        dialog.className = 'confirm-dialog hidden';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-labelledby', 'confirm-title');
        dialog.setAttribute('aria-describedby', 'confirm-description');
        
        dialog.innerHTML = `
            <div class="confirm-dialog-backdrop"></div>
            <div class="confirm-dialog-content">
                <div class="confirm-dialog-header">
                    <div class="confirm-icon">❓</div>
                    <h2 id="confirm-title" class="confirm-title"></h2>
                </div>
                <div class="confirm-dialog-body">
                    <p id="confirm-description" class="confirm-description"></p>
                    <div class="confirm-warning">
                        <p class="confirm-warning-text"></p>
                    </div>
                </div>
                <div class="confirm-dialog-footer">
                    <button class="confirm-btn cancel">キャンセル</button>
                    <button class="confirm-btn proceed">実行</button>
                </div>
            </div>
        `;
        
        // 確認ダイアログのスタイル
        const confirmStyles = `
            .confirm-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: inherit;
            }
            
            .confirm-dialog.hidden {
                display: none;
            }
            
            .confirm-dialog-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
            }
            
            .confirm-dialog-content {
                position: relative;
                background: white;
                border-radius: 10px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
                animation: confirmDialogZoomIn 0.2s ease-out;
            }
            
            .confirm-dialog-header {
                padding: 20px 20px 0 20px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .confirm-icon {
                font-size: 24px;
            }
            
            .confirm-title {
                margin: 0;
                font-size: 16px;
                color: #2c3e50;
            }
            
            .confirm-dialog-body {
                padding: 15px 20px 20px 20px;
            }
            
            .confirm-description {
                margin: 0 0 15px 0;
                color: #34495e;
                line-height: 1.4;
            }
            
            .confirm-warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 15px;
            }
            
            .confirm-warning-text {
                margin: 0;
                color: #856404;
                font-size: 14px;
            }
            
            .confirm-dialog-footer {
                padding: 0 20px 20px 20px;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            
            .confirm-btn {
                padding: 8px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .confirm-btn.cancel {
                background: #6c757d;
                color: white;
            }
            
            .confirm-btn.cancel:hover {
                background: #545b62;
            }
            
            .confirm-btn.proceed {
                background: #dc3545;
                color: white;
            }
            
            .confirm-btn.proceed:hover {
                background: #c82333;
            }
            
            @keyframes confirmDialogZoomIn {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `;
        
        if (!document.getElementById('confirm-dialog-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'confirm-dialog-styles';
            styleSheet.textContent = confirmStyles;
            document.head.appendChild(styleSheet);
        }
        
        document.body.appendChild(dialog);
        return dialog;
    }
    
    /**
     * 警告バナーを作成
     */
    createWarningBanner() {
        const banner = document.createElement('div');
        banner.id = 'warning-banner';
        banner.className = 'warning-banner hidden';
        banner.setAttribute('role', 'alert');
        banner.setAttribute('aria-live', 'polite');
        
        banner.innerHTML = `
            <div class="warning-content">
                <div class="warning-icon">⚠️</div>
                <div class="warning-text">
                    <div class="warning-title"></div>
                    <div class="warning-message"></div>
                </div>
                <div class="warning-actions">
                    <button class="warning-action-btn">対処する</button>
                    <button class="warning-dismiss-btn">×</button>
                </div>
            </div>
        `;
        
        // 警告バナーのスタイル
        const warningStyles = `
            .warning-banner {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #ffc107, #fd7e14);
                color: #212529;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4);
                z-index: 9999;
                max-width: 500px;
                width: 90%;
                animation: warningSlideDown 0.3s ease-out;
            }
            
            .warning-banner.hidden {
                display: none;
            }
            
            .warning-content {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .warning-icon {
                font-size: 20px;
                flex-shrink: 0;
            }
            
            .warning-text {
                flex: 1;
            }
            
            .warning-title {
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 2px;
            }
            
            .warning-message {
                font-size: 13px;
                opacity: 0.9;
            }
            
            .warning-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .warning-action-btn {
                background: rgba(33, 37, 41, 0.1);
                border: 1px solid rgba(33, 37, 41, 0.2);
                color: #212529;
                padding: 6px 12px;
                border-radius: 5px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .warning-action-btn:hover {
                background: rgba(33, 37, 41, 0.2);
            }
            
            .warning-dismiss-btn {
                background: none;
                border: none;
                color: #212529;
                font-size: 18px;
                cursor: pointer;
                padding: 4px;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .warning-dismiss-btn:hover {
                opacity: 1;
                background: rgba(33, 37, 41, 0.1);
            }
            
            @keyframes warningSlideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        
        if (!document.getElementById('warning-banner-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'warning-banner-styles';
            styleSheet.textContent = warningStyles;
            document.head.appendChild(styleSheet);
        }
        
        // イベントリスナー
        banner.querySelector('.warning-dismiss-btn').addEventListener('click', () => {
            this.hideWarningBanner();
        });
        
        banner.querySelector('.warning-action-btn').addEventListener('click', () => {
            this.handleWarningAction();
        });
        
        document.body.appendChild(banner);
        return banner;
    }
    
    /**
     * Undo/Redoボタンを作成
     */
    createUndoRedoButtons() {
        // Undoボタン
        const undoBtn = document.createElement('button');
        undoBtn.id = 'undo-btn';
        undoBtn.className = 'undo-redo-btn undo-btn';
        undoBtn.innerHTML = '↶';
        undoBtn.title = '元に戻す (Ctrl+Z)';
        undoBtn.setAttribute('aria-label', '元に戻す');
        undoBtn.disabled = true;
        
        // Redoボタン
        const redoBtn = document.createElement('button');
        redoBtn.id = 'redo-btn';
        redoBtn.className = 'undo-redo-btn redo-btn';
        redoBtn.innerHTML = '↷';
        redoBtn.title = 'やり直し (Ctrl+Y)';
        redoBtn.setAttribute('aria-label', 'やり直し');
        redoBtn.disabled = true;
        
        // スタイル
        const undoRedoStyles = `
            .undo-redo-btn {
                position: fixed;
                width: 45px;
                height: 45px;
                border-radius: 50%;
                border: 2px solid #6c757d;
                background: white;
                color: #6c757d;
                font-size: 20px;
                cursor: pointer;
                z-index: 9997;
                transition: all 0.2s;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }
            
            .undo-btn {
                bottom: 80px;
                right: 20px;
            }
            
            .redo-btn {
                bottom: 135px;
                right: 20px;
            }
            
            .undo-redo-btn:not(:disabled):hover {
                background: #6c757d;
                color: white;
                transform: scale(1.1);
            }
            
            .undo-redo-btn:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }
        `;
        
        if (!document.getElementById('undo-redo-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'undo-redo-styles';
            styleSheet.textContent = undoRedoStyles;
            document.head.appendChild(styleSheet);
        }
        
        // イベントリスナー
        undoBtn.addEventListener('click', () => this.undo());
        redoBtn.addEventListener('click', () => this.redo());
        
        document.body.appendChild(undoBtn);
        document.body.appendChild(redoBtn);
        
        this.ui.undoButton = undoBtn;
        this.ui.redoButton = redoBtn;
    }
    
    /**
     * 回復パネルを作成
     */
    createRecoveryPanel() {
        const panel = document.createElement('div');
        panel.id = 'recovery-panel';
        panel.className = 'recovery-panel hidden';
        
        panel.innerHTML = `
            <div class="recovery-header">
                <h3>エラー回復オプション</h3>
                <button class="recovery-close-btn">×</button>
            </div>
            <div class="recovery-content">
                <div class="recovery-options">
                    <!-- 動的に生成される -->
                </div>
            </div>
        `;
        
        // 回復パネルのスタイル
        const recoveryStyles = `
            .recovery-panel {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                border: 2px solid #28a745;
                width: 300px;
                z-index: 9998;
                animation: recoverySlideIn 0.3s ease-out;
            }
            
            .recovery-panel.hidden {
                display: none;
            }
            
            .recovery-header {
                background: #28a745;
                color: white;
                padding: 12px 16px;
                border-radius: 8px 8px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .recovery-header h3 {
                margin: 0;
                font-size: 14px;
            }
            
            .recovery-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .recovery-content {
                padding: 16px;
            }
            
            @keyframes recoverySlideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        
        if (!document.getElementById('recovery-panel-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'recovery-panel-styles';
            styleSheet.textContent = recoveryStyles;
            document.head.appendChild(styleSheet);
        }
        
        // イベントリスナー
        panel.querySelector('.recovery-close-btn').addEventListener('click', () => {
            this.hideRecoveryPanel();
        });
        
        document.body.appendChild(panel);
        return panel;
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // ページ離脱前の確認
        window.addEventListener('beforeunload', this.boundHandlers.beforeUnload);
        
        // エラーイベント
        window.addEventListener('error', this.boundHandlers.error);
        window.addEventListener('unhandledrejection', this.boundHandlers.error);
        
        // キーボードショートカット
        document.addEventListener('keydown', this.boundHandlers.keydown);
        
        // クリックイベント
        document.addEventListener('click', this.boundHandlers.click);
        
        // ゲームエンジンイベント
        if (this.gameEngine.eventEmitter) {
            this.gameEngine.eventEmitter.on('gameAction', this.boundHandlers.gameAction);
            this.gameEngine.eventEmitter.on('stateChange', this.boundHandlers.stateChange);
            this.gameEngine.eventEmitter.on('error', this.handleGameError.bind(this));
            this.gameEngine.eventEmitter.on('bubblePopped', this.handleBubblePopped.bind(this));
            this.gameEngine.eventEmitter.on('comboBreak', this.handleComboBreak.bind(this));
        }
    }
    
    /**
     * 自動保存を開始
     */
    startAutoSave() {
        if (this.autoSaveSystem.timer) {
            clearInterval(this.autoSaveSystem.timer);
        }
        
        this.autoSaveSystem.timer = setInterval(() => {
            this.performAutoSave();
        }, this.config.recovery.saveInterval);
        
        // 初回保存
        this.performAutoSave();
        
        console.log('ErrorRecoveryManager: 自動保存開始');
    }
    
    /**
     * 自動保存を実行
     */
    performAutoSave() {
        try {
            const gameState = this.captureGameState();
            
            // 保存点を追加
            this.autoSaveSystem.savePoints.push({
                timestamp: Date.now(),
                state: gameState,
                id: `auto_${Date.now()}`
            });
            
            // 最大保存数を超えた場合、古いものを削除
            if (this.autoSaveSystem.savePoints.length > this.autoSaveSystem.maxSavePoints) {
                this.autoSaveSystem.savePoints.shift();
            }
            
            // LocalStorageに保存
            this.saveSavePoints();
            
            console.log('ErrorRecoveryManager: 自動保存完了');
            
        } catch (error) {
            console.warn('ErrorRecoveryManager: 自動保存エラー:', error);
        }
    }
    
    /**
     * ゲーム状態をキャプチャ
     */
    captureGameState() {
        const gameState = {};
        
        // ゲームエンジンから状態を取得
        if (this.gameEngine.gameState) {
            gameState.game = { ...this.gameEngine.gameState };
        }
        
        // プレイヤーデータ
        if (this.gameEngine.playerData) {
            gameState.player = this.gameEngine.playerData.exportData();
        }
        
        // シーン状態
        if (this.gameEngine.sceneManager) {
            gameState.scene = {
                current: this.gameEngine.sceneManager.getCurrentScene(),
                data: this.gameEngine.sceneManager.getSceneData()
            };
        }
        
        // 設定
        if (this.gameEngine.settingsManager) {
            gameState.settings = this.gameEngine.settingsManager.getAllSettings();
        }
        
        return gameState;
    }
    
    /**
     * 保存点をLocalStorageに保存
     */
    saveSavePoints() {
        try {
            localStorage.setItem('errorRecoverySaveStates', JSON.stringify(this.autoSaveSystem.savePoints));
        } catch (error) {
            console.warn('ErrorRecoveryManager: 保存点保存エラー:', error);
        }
    }
    
    /**
     * エラー監視を開始
     */
    startErrorMonitoring() {
        // パフォーマンス監視
        if (this.gameEngine.performanceManager) {
            setInterval(() => {
                this.checkPerformanceIssues();
            }, 10000); // 10秒間隔
        }
        
        // エラー頻度監視
        setInterval(() => {
            this.checkErrorFrequency();
        }, 5000); // 5秒間隔
        
        console.log('ErrorRecoveryManager: エラー監視開始');
    }
    
    /**
     * パフォーマンス問題をチェック
     */
    checkPerformanceIssues() {
        if (!this.gameEngine.performanceManager) return;
        
        const currentFPS = this.gameEngine.performanceManager.getCurrentFPS();
        const memoryUsage = this.gameEngine.performanceManager.getMemoryUsage();
        
        // FPSが低い場合
        if (currentFPS < 30) {
            this.handleError({
                type: 'system',
                subtype: 'performanceDrop',
                severity: 'medium',
                data: { fps: currentFPS }
            });
        }
        
        // メモリ使用量が高い場合
        if (memoryUsage > 100 * 1024 * 1024) { // 100MB
            this.showWarning({
                type: 'performance',
                title: 'メモリ使用量警告',
                message: 'メモリ使用量が多くなっています。ページを再読み込みすることをお勧めします。'
            });
        }
    }
    
    /**
     * エラー頻度をチェック
     */
    checkErrorFrequency() {
        const now = Date.now();
        const timeWindow = this.warningSystem.thresholds.timeWindow;
        
        // 最近のエラーをフィルタリング
        const recentErrors = this.state.errorCount.recent.filter(
            errorTime => now - errorTime < timeWindow
        );
        
        // 閾値を超えた場合
        if (recentErrors.length >= this.warningSystem.thresholds.errorFrequency) {
            this.showWarning({
                type: 'errorFrequency',
                title: 'エラー頻発警告',
                message: 'エラーが頻発しています。操作を確認するか、ページを再読み込みしてください。'
            });
        }
        
        // 古いエラー記録を削除
        this.state.errorCount.recent = recentErrors;
    }
    
    /**
     * ページ離脱前の処理
     */
    handleBeforeUnload(event) {
        // 未保存の重要な変更がある場合
        if (this.hasUnsavedChanges()) {
            const message = '未保存の変更があります。本当にページを離れますか？';
            event.returnValue = message;
            return message;
        }
    }
    
    /**
     * 未保存の変更があるかチェック
     */
    hasUnsavedChanges() {
        // ゲーム進行中かチェック
        if (this.gameEngine.gameState?.playing) {
            return true;
        }
        
        // 未保存のスコアがあるかチェック
        if (this.gameEngine.gameState?.score > 0 && !this.gameEngine.gameState?.saved) {
            return true;
        }
        
        return false;
    }
    
    /**
     * エラーイベントを処理
     */
    handleError(event) {
        const errorInfo = this.analyzeError(event);
        this.recordError(errorInfo);
        
        if (this.config.enabled && errorInfo.severity !== 'low') {
            this.showErrorDialog(errorInfo);
        }
    }
    
    /**
     * エラーを分析
     */
    analyzeError(event) {
        let errorInfo = {
            timestamp: Date.now(),
            type: 'unknown',
            subtype: 'generic',
            severity: 'medium',
            message: 'エラーが発生しました',
            source: 'system',
            recoverable: false,
            preventable: false
        };
        
        // エラーの種類を判定
        if (event.type) {
            // カスタムエラーオブジェクト
            errorInfo = { ...errorInfo, ...event };
        } else if (event.error) {
            // JavaScriptエラー
            errorInfo.type = 'javascript';
            errorInfo.message = event.error.message;
            errorInfo.source = event.filename;
            errorInfo.severity = 'high';
        } else if (event.reason) {
            // Promise rejection
            errorInfo.type = 'promise';
            errorInfo.message = event.reason.message || String(event.reason);
            errorInfo.severity = 'medium';
        }
        
        return errorInfo;
    }
    
    /**
     * エラーを記録
     */
    recordError(errorInfo) {
        // エラー履歴に追加
        this.state.errorHistory.push(errorInfo);
        
        // 最大履歴数を制限
        if (this.state.errorHistory.length > 100) {
            this.state.errorHistory.shift();
        }
        
        // エラーカウントを更新
        this.state.errorCount.total++;
        this.state.errorCount.recent.push(errorInfo.timestamp);
        
        const typeKey = `${errorInfo.type}_${errorInfo.subtype}`;
        const currentCount = this.state.errorCount.byType.get(typeKey) || 0;
        this.state.errorCount.byType.set(typeKey, currentCount + 1);
        
        // 履歴を保存
        this.saveErrorHistory();
        
        console.log('ErrorRecoveryManager: エラー記録:', errorInfo);
    }
    
    /**
     * キーボードイベントを処理
     */
    handleKeydown(event) {
        // Ctrl+Z で Undo
        if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            this.undo();
        }
        
        // Ctrl+Y または Ctrl+Shift+Z で Redo
        else if ((event.ctrlKey && event.key === 'y') || 
                 (event.ctrlKey && event.shiftKey && event.key === 'z')) {
            event.preventDefault();
            this.redo();
        }
        
        // F9 で回復パネル表示
        else if (event.key === 'F9') {
            event.preventDefault();
            this.showRecoveryPanel();
        }
    }
    
    /**
     * クリックイベントを処理
     */
    handleClick(event) {
        const element = event.target;
        const now = Date.now();
        
        // ダブルクリック防止
        if (this.config.prevention.doubleClickPrevention > 0) {
            if (element._lastClickTime && 
                now - element._lastClickTime < this.config.prevention.doubleClickPrevention) {
                
                event.preventDefault();
                event.stopPropagation();
                
                this.handleError({
                    type: 'input',
                    subtype: 'doubleClick',
                    severity: 'low',
                    element: element,
                    message: '同じ要素を短時間で複数回クリックしました'
                });
                
                return;
            }
            element._lastClickTime = now;
        }
        
        // 重要なアクションの確認
        if (this.shouldConfirmAction(element)) {
            event.preventDefault();
            event.stopPropagation();
            this.showConfirmDialog(element);
        }
    }
    
    /**
     * アクションの確認が必要かチェック
     */
    shouldConfirmAction(element) {
        if (!this.config.prevention.confirmCriticalActions) return false;
        
        // データ属性でチェック
        if (element.dataset.confirmAction === 'true') return true;
        
        // クラス名でチェック
        const criticalClasses = ['reset-btn', 'delete-btn', 'clear-btn', 'new-game-btn'];
        return criticalClasses.some(cls => element.classList.contains(cls));
    }
    
    /**
     * ゲームアクションを処理
     */
    handleGameAction(action) {
        // アクションを記録（Undo/Redo用）
        if (this.undoRedoSystem.enabled && !this.undoRedoSystem.ignoredActions.has(action.type)) {
            this.recordAction(action);
        }
        
        // 重要なアクションの場合、確認
        if (this.undoRedoSystem.criticalActions.has(action.type)) {
            if (!action.confirmed) {
                this.requestActionConfirmation(action);
            }
        }
    }
    
    /**
     * アクションを記録
     */
    recordAction(action) {
        // 現在位置以降の履歴を削除（新しいブランチの開始）
        if (this.undoRedoSystem.currentIndex < this.undoRedoSystem.actionHistory.length - 1) {
            this.undoRedoSystem.actionHistory = this.undoRedoSystem.actionHistory.slice(
                0, this.undoRedoSystem.currentIndex + 1
            );
        }
        
        // 新しいアクションを追加
        this.undoRedoSystem.actionHistory.push({
            ...action,
            timestamp: Date.now(),
            stateBefore: this.captureGameState(),
            stateAfter: null // 後で設定
        });
        
        this.undoRedoSystem.currentIndex++;
        
        // 最大履歴数を制限
        if (this.undoRedoSystem.actionHistory.length > this.undoRedoSystem.maxHistory) {
            this.undoRedoSystem.actionHistory.shift();
            this.undoRedoSystem.currentIndex--;
        }
        
        // 状態後を記録
        setTimeout(() => {
            const currentAction = this.undoRedoSystem.actionHistory[this.undoRedoSystem.currentIndex];
            if (currentAction) {
                currentAction.stateAfter = this.captureGameState();
            }
        }, 100);
        
        // UI更新
        this.updateUndoRedoButtons();
    }
    
    /**
     * Undo操作
     */
    undo() {
        if (!this.canUndo()) return false;
        
        const action = this.undoRedoSystem.actionHistory[this.undoRedoSystem.currentIndex];
        
        try {
            // 状態を復元
            this.restoreGameState(action.stateBefore);
            
            this.undoRedoSystem.currentIndex--;
            this.updateUndoRedoButtons();
            
            // イベントを発火
            this.emitEvent('actionUndone', action);
            
            this.showUndoFeedback('元に戻しました');
            return true;
            
        } catch (error) {
            console.error('ErrorRecoveryManager: Undo エラー:', error);
            this.showErrorDialog({
                type: 'system',
                subtype: 'undoFailed',
                severity: 'medium',
                message: 'Undo操作に失敗しました'
            });
            return false;
        }
    }
    
    /**
     * Redo操作
     */
    redo() {
        if (!this.canRedo()) return false;
        
        this.undoRedoSystem.currentIndex++;
        const action = this.undoRedoSystem.actionHistory[this.undoRedoSystem.currentIndex];
        
        try {
            // 状態を復元
            this.restoreGameState(action.stateAfter);
            
            this.updateUndoRedoButtons();
            
            // イベントを発火
            this.emitEvent('actionRedone', action);
            
            this.showUndoFeedback('やり直しました');
            return true;
            
        } catch (error) {
            console.error('ErrorRecoveryManager: Redo エラー:', error);
            this.showErrorDialog({
                type: 'system',
                subtype: 'redoFailed',
                severity: 'medium',
                message: 'Redo操作に失敗しました'
            });
            return false;
        }
    }
    
    /**
     * Undoが可能かチェック
     */
    canUndo() {
        return this.undoRedoSystem.enabled && 
               this.undoRedoSystem.currentIndex >= 0 &&
               this.undoRedoSystem.actionHistory.length > 0;
    }
    
    /**
     * Redoが可能かチェック
     */
    canRedo() {
        return this.undoRedoSystem.enabled && 
               this.undoRedoSystem.currentIndex < this.undoRedoSystem.actionHistory.length - 1;
    }
    
    /**
     * Undo/Redoボタンを更新
     */
    updateUndoRedoButtons() {
        if (this.ui.undoButton) {
            this.ui.undoButton.disabled = !this.canUndo();
        }
        
        if (this.ui.redoButton) {
            this.ui.redoButton.disabled = !this.canRedo();
        }
    }
    
    /**
     * ゲーム状態を復元
     */
    restoreGameState(state) {
        if (!state) throw new Error('復元する状態がありません');
        
        // ゲーム状態の復元
        if (state.game && this.gameEngine.gameState) {
            Object.assign(this.gameEngine.gameState, state.game);
        }
        
        // プレイヤーデータの復元
        if (state.player && this.gameEngine.playerData) {
            this.gameEngine.playerData.importData(state.player);
        }
        
        // シーン状態の復元
        if (state.scene && this.gameEngine.sceneManager) {
            this.gameEngine.sceneManager.restoreScene(state.scene);
        }
        
        // 設定の復元
        if (state.settings && this.gameEngine.settingsManager) {
            this.gameEngine.settingsManager.restoreSettings(state.settings);
        }
        
        // UIを更新
        if (this.gameEngine.render) {
            this.gameEngine.render();
        }
    }
    
    /**
     * エラーダイアログを表示
     */
    showErrorDialog(errorInfo) {
        const dialog = this.ui.errorDialog;
        const errorType = this.errorTypes[errorInfo.type]?.[errorInfo.subtype] || {};
        
        // コンテンツを設定
        dialog.querySelector('.error-title').textContent = errorType.name || errorInfo.message;
        dialog.querySelector('.error-description').textContent = 
            errorType.message || errorInfo.message;
        dialog.querySelector('.error-suggestion-text').textContent = 
            errorType.suggestion || '問題を確認してください';
        dialog.querySelector('.error-prevention-text').textContent = 
            errorType.prevention || '注意深く操作してください';
        
        // アクションボタンの表示制御
        const retryBtn = dialog.querySelector('[data-action="retry"]');
        const undoBtn = dialog.querySelector('[data-action="undo"]');
        const continueBtn = dialog.querySelector('[data-action="continue"]');
        
        retryBtn.style.display = errorType.recoverable ? 'inline-block' : 'none';
        undoBtn.style.display = this.canUndo() ? 'inline-block' : 'none';
        continueBtn.style.display = 'inline-block';
        
        // ダイアログを表示
        dialog.classList.remove('hidden');
        dialog.setAttribute('aria-hidden', 'false');
        
        // フォーカスを設定
        const firstButton = dialog.querySelector('.error-action-btn:not([style*="display: none"])');
        if (firstButton) {
            firstButton.focus();
        }
        
        // 現在のエラーを記録
        this.state.currentError = errorInfo;
    }
    
    /**
     * エラーダイアログを非表示
     */
    hideErrorDialog() {
        this.ui.errorDialog.classList.add('hidden');
        this.ui.errorDialog.setAttribute('aria-hidden', 'true');
        this.state.currentError = null;
    }
    
    /**
     * 確認ダイアログを表示
     */
    showConfirmDialog(element) {
        const dialog = this.ui.confirmDialog;
        
        // コンテンツを設定
        const actionName = element.textContent || element.getAttribute('aria-label') || '操作';
        dialog.querySelector('.confirm-title').textContent = `${actionName}の確認`;
        dialog.querySelector('.confirm-description').textContent = 
            `「${actionName}」を実行してもよろしいですか？`;
        
        // 警告メッセージ
        const warningText = this.getActionWarning(element);
        const warningDiv = dialog.querySelector('.confirm-warning');
        if (warningText) {
            warningDiv.style.display = 'block';
            warningDiv.querySelector('.confirm-warning-text').textContent = warningText;
        } else {
            warningDiv.style.display = 'none';
        }
        
        // ボタンイベント
        const cancelBtn = dialog.querySelector('.confirm-btn.cancel');
        const proceedBtn = dialog.querySelector('.confirm-btn.proceed');
        
        // 既存のイベントリスナーを削除
        const newCancelBtn = cancelBtn.cloneNode(true);
        const newProceedBtn = proceedBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        proceedBtn.parentNode.replaceChild(newProceedBtn, proceedBtn);
        
        newCancelBtn.addEventListener('click', () => {
            this.hideConfirmDialog();
        });
        
        newProceedBtn.addEventListener('click', () => {
            this.hideConfirmDialog();
            this.executeConfirmedAction(element);
        });
        
        // ダイアログを表示
        dialog.classList.remove('hidden');
        newCancelBtn.focus();
    }
    
    /**
     * 確認ダイアログを非表示
     */
    hideConfirmDialog() {
        this.ui.confirmDialog.classList.add('hidden');
    }
    
    /**
     * 簡単なメソッド（実装は省略）
     */
    getActionWarning(element) {
        if (element.classList.contains('reset-btn')) {
            return 'この操作により、現在の進行状況が失われます。';
        }
        return null;
    }
    
    executeConfirmedAction(element) {
        element.click();
    }
    
    showWarning(warning) {
        const banner = this.ui.warningBanner;
        banner.querySelector('.warning-title').textContent = warning.title;
        banner.querySelector('.warning-message').textContent = warning.message;
        banner.classList.remove('hidden');
    }
    
    hideWarningBanner() {
        this.ui.warningBanner.classList.add('hidden');
    }
    
    handleWarningAction() {
        this.hideWarningBanner();
    }
    
    showRecoveryPanel() {
        this.ui.recoveryPanel.classList.remove('hidden');
    }
    
    hideRecoveryPanel() {
        this.ui.recoveryPanel.classList.add('hidden');
    }
    
    handleErrorAction(action) {
        switch (action) {
            case 'retry':
                this.retryLastAction();
                break;
            case 'undo':
                this.undo();
                break;
            case 'continue':
                // 何もしない
                break;
        }
        this.hideErrorDialog();
    }
    
    retryLastAction() {
        // 最後のアクションを再実行
        console.log('ErrorRecoveryManager: アクションを再試行');
    }
    
    showUndoFeedback(message) {
        // 簡単なフィードバック表示
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            z-index: 10003;
            font-size: 14px;
        `;
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 2000);
    }
    
    // 他のメソッドは省略（基本的な機能のみ実装）
    handleStateChange(state) { /* 実装省略 */ }
    handleGameError(error) { this.handleError(error); }
    handleBubblePopped(bubble) { /* 実装省略 */ }
    handleComboBreak() { /* 実装省略 */ }
    requestActionConfirmation(action) { /* 実装省略 */ }
    saveErrorHistory() { this.saveConfiguration(); }
    integrateWithAccessibilityManager() { /* 実装省略 */ }
    emitEvent(eventName, data) {
        if (this.gameEngine.eventEmitter) {
            this.gameEngine.eventEmitter.emit(`errorRecovery:${eventName}`, data);
        }
    }
    
    /**
     * 設定をマージ
     */
    mergeConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * 設定を保存
     */
    saveConfiguration() {
        try {
            localStorage.setItem('errorRecoveryConfig', JSON.stringify(this.config));
            
            const historyData = {
                errorHistory: this.state.errorHistory,
                errorCount: {
                    ...this.state.errorCount,
                    byType: Array.from(this.state.errorCount.byType.entries())
                }
            };
            localStorage.setItem('errorRecoveryHistory', JSON.stringify(historyData));
            
        } catch (error) {
            console.warn('ErrorRecoveryManager: 設定保存エラー:', error);
        }
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        // タイマーをクリア
        if (this.autoSaveSystem.timer) {
            clearInterval(this.autoSaveSystem.timer);
        }
        
        // イベントリスナーを削除
        window.removeEventListener('beforeunload', this.boundHandlers.beforeUnload);
        window.removeEventListener('error', this.boundHandlers.error);
        document.removeEventListener('keydown', this.boundHandlers.keydown);
        document.removeEventListener('click', this.boundHandlers.click);
        
        // UI要素を削除
        Object.values(this.ui).forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        // 設定を保存
        this.saveConfiguration();
        
        console.log('ErrorRecoveryManager: クリーンアップ完了');
    }
}