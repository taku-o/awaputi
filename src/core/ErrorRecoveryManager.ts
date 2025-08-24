// TypeScript conversion - Error Recovery Manager
interface BasicConfig {
    [key: string]: any;
}

interface ErrorType {
    name: string;
    severity: 'low' | 'medium' | 'high';
    recoverable: boolean;
    preventable: boolean;
    message: string;
    suggestion: string;
    prevention: string;
}

interface ErrorTypes {
    gameplay: {
        missedBubble: ErrorType;
        wrongBubble: ErrorType;
        poisonBubble: ErrorType;
        comboBreak: ErrorType;
    };
    interface: {
        accidentalPause: ErrorType;
        accidentalReset: ErrorType;
        settingsChanged: ErrorType;
        menuNavigation: ErrorType;
    };
    input: {
        doubleClick: ErrorType;
        rapidClicks: ErrorType;
        misclick: ErrorType;
    };
    system: {
        saveFailure: ErrorType;
        loadFailure: ErrorType;
        networkError: ErrorType;
        performanceIssue: ErrorType;
    };
}

interface Statistics {
    totalErrors: number;
    errorsByType: { [key: string]: number };
    errorsByCategory: { [key: string]: number };
    preventedErrors: number;
    recoveredErrors: number;
    undoOperations: number;
    redoOperations: number;
    autoSaves: number;
    manualSaves: number;
    sessionStartTime: number;
    lastErrorTime: number;
}

import { ErrorPreventionHandler } from './error-recovery-manager/ErrorPreventionHandler.js';
import { UndoRedoSystem } from './error-recovery-manager/UndoRedoSystem.js';
import { AutoSaveSystem } from './error-recovery-manager/AutoSaveSystem.js';

/**
 * ErrorRecoveryManager - メインコントローラー
 * 
 * Main Controller Patternにより、専門化されたコンポーネントを統制します。
 * エラー防止、Undo/Redo、自動保存機能を統合して管理します。
 */
export class ErrorRecoveryManager {
    private config: BasicConfig;
    private gameEngine: any;
    private isInitialized: boolean;
    private errorTypes: ErrorTypes;
    private statistics: Statistics;
    private history: any[];
    private preventionHandler?: ErrorPreventionHandler;
    private undoRedoSystem?: UndoRedoSystem;
    private autoSaveSystem?: AutoSaveSystem;
    private warningElement?: HTMLElement;

    /**
     * ErrorRecoveryManagerを初期化
     * @param gameEngine - ゲームエンジンインスタンス
     */
    constructor(gameEngine: any) {
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
                    timeRunningOut: 10000, // 10秒
                    doubleClickPrevention: 500
                }
            },
            
            // エラー回復設定
            recovery: {
                autoSave: true,
                saveInterval: 30000, // 30秒
                maxUndoSteps: 10,
                maxRedoSteps: 10,
                maxSavePoints: 5,
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
                saveFailure: {
                    name: 'セーブ失敗',
                    severity: 'high',
                    recoverable: true,
                    preventable: false,
                    message: 'ゲームの保存に失敗しました',
                    suggestion: '再度保存を試してください',
                    prevention: '定期的な自動保存を有効化'
                },
                loadFailure: {
                    name: 'ロード失敗',
                    severity: 'high',
                    recoverable: false,
                    preventable: false,
                    message: 'セーブデータの読み込みに失敗しました',
                    suggestion: '他のセーブファイルを試してください',
                    prevention: '複数のセーブスロットを使用'
                },
                networkError: {
                    name: 'ネットワークエラー',
                    severity: 'medium',
                    recoverable: true,
                    preventable: false,
                    message: 'ネットワーク接続に問題があります',
                    suggestion: 'インターネット接続を確認してください',
                    prevention: 'オフラインモードの利用'
                },
                performanceIssue: {
                    name: 'パフォーマンス問題',
                    severity: 'medium',
                    recoverable: true,
                    preventable: true,
                    message: 'ゲームの動作が重くなっています',
                    suggestion: 'グラフィック設定を下げてください',
                    prevention: 'システム要件の確認'
                }
            }
        };

        // 統計の初期化
        this.statistics = {
            totalErrors: 0,
            errorsByType: {},
            errorsByCategory: {},
            preventedErrors: 0,
            recoveredErrors: 0,
            undoOperations: 0,
            redoOperations: 0,
            autoSaves: 0,
            manualSaves: 0,
            sessionStartTime: Date.now(),
            lastErrorTime: 0
        };

        // 履歴の初期化
        this.history = [];

        this.initialize();
    }

    /**
     * エラー回復システムの初期化
     */
    private async initialize(): Promise<void> {
        if (this.isInitialized || !this.config.enabled) {
            return;
        }

        try {
            // コンポーネントの初期化
            if (this.config.preventionEnabled) {
                this.preventionHandler = new ErrorPreventionHandler(this.gameEngine, this.config.prevention);
            }

            if (this.config.undoRedoEnabled) {
                this.undoRedoSystem = new UndoRedoSystem(this.gameEngine, this.config.recovery);
            }

            if (this.config.recovery.autoSave) {
                this.autoSaveSystem = new AutoSaveSystem(this.gameEngine, this.config.recovery);
            }

            // UI要素の作成
            this.createWarningUI();

            // イベントリスナーの設定
            this.setupEventListeners();

            this.isInitialized = true;
            console.log('ErrorRecoveryManager initialized successfully');

        } catch (error) {
            console.error('Failed to initialize ErrorRecoveryManager:', error);
            throw error;
        }
    }

    /**
     * 警告UI要素の作成
     */
    private createWarningUI(): void {
        if (!this.config.warningEnabled) {
            return;
        }

        this.warningElement = document.createElement('div');
        this.warningElement.className = 'error-recovery-warning';
        this.warningElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background-color: ${this.config.ui.backgroundColor};
            border: 2px solid ${this.config.ui.borderColor};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: none;
            max-width: 350px;
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            line-height: 1.4;
        `;

        document.body.appendChild(this.warningElement);
    }

    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void {
        // ゲームエンジンのイベントを監視
        if (this.gameEngine && this.gameEngine.on) {
            this.gameEngine.on('error', this.handleError.bind(this));
            this.gameEngine.on('warning', this.handleWarning.bind(this));
            this.gameEngine.on('action', this.recordAction.bind(this));
        }

        // ウィンドウイベントの監視
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handleUnhandledPromise.bind(this));
    }

    /**
     * エラーハンドリング
     */
    public handleError(errorType: string, errorData: any = {}): void {
        this.statistics.totalErrors++;
        this.statistics.lastErrorTime = Date.now();

        // エラータイプ別統計
        this.statistics.errorsByType[errorType] = (this.statistics.errorsByType[errorType] || 0) + 1;

        // カテゴリ別統計
        const category = this.getErrorCategory(errorType);
        this.statistics.errorsByCategory[category] = (this.statistics.errorsByCategory[category] || 0) + 1;

        // エラー情報の取得
        const errorInfo = this.getErrorInfo(errorType);
        
        if (errorInfo) {
            // エラー表示
            this.showError(errorInfo, errorData);

            // 回復可能なエラーの場合
            if (errorInfo.recoverable && this.config.recoveryEnabled) {
                this.attemptRecovery(errorType, errorData);
            }
        }

        console.warn(`Error handled: ${errorType}`, errorData);
    }

    /**
     * 警告ハンドリング
     */
    public handleWarning(warningType: string, warningData: any = {}): void {
        if (!this.config.warningEnabled) {
            return;
        }

        const warningInfo = this.getErrorInfo(warningType);
        
        if (warningInfo && warningInfo.preventable) {
            this.showWarning(warningInfo, warningData);
            this.statistics.preventedErrors++;
        }
    }

    /**
     * アクション記録
     */
    public recordAction(action: any): void {
        if (!this.config.undoRedoEnabled || !this.undoRedoSystem) {
            return;
        }

        this.undoRedoSystem.recordAction(action);
        this.history.push({
            timestamp: Date.now(),
            action: action
        });
    }

    /**
     * エラー情報の取得
     */
    private getErrorInfo(errorType: string): ErrorType | null {
        const parts = errorType.split('.');
        if (parts.length === 2) {
            const [category, type] = parts;
            return this.errorTypes[category as keyof ErrorTypes]?.[type as any] || null;
        }
        return null;
    }

    /**
     * エラーカテゴリの取得
     */
    private getErrorCategory(errorType: string): string {
        const parts = errorType.split('.');
        return parts.length > 0 ? parts[0] : 'unknown';
    }

    /**
     * エラー表示
     */
    private showError(errorInfo: ErrorType, errorData: any): void {
        if (!this.warningElement) {
            return;
        }

        const messageHtml = this.formatErrorMessage(errorInfo, errorData);
        this.warningElement.innerHTML = messageHtml;
        this.warningElement.style.display = 'block';

        // 自動非表示
        if (!this.config.ui.persistent) {
            setTimeout(() => {
                if (this.warningElement) {
                    this.warningElement.style.display = 'none';
                }
            }, this.config.ui.duration);
        }
    }

    /**
     * 警告表示
     */
    private showWarning(warningInfo: ErrorType, warningData: any): void {
        if (!this.warningElement) {
            return;
        }

        const messageHtml = this.formatWarningMessage(warningInfo, warningData);
        this.warningElement.innerHTML = messageHtml;
        this.warningElement.style.display = 'block';
        this.warningElement.style.borderColor = '#ffc107'; // Warning color

        // 自動非表示
        setTimeout(() => {
            if (this.warningElement) {
                this.warningElement.style.display = 'none';
                this.warningElement.style.borderColor = this.config.ui.borderColor;
            }
        }, this.config.ui.duration / 2);
    }

    /**
     * エラーメッセージのフォーマット
     */
    private formatErrorMessage(errorInfo: ErrorType, errorData: any): string {
        let html = `<div class="error-title">${errorInfo.name}</div>`;
        html += `<div class="error-message">${errorInfo.message}</div>`;
        
        if (this.config.messages.showSuggestions) {
            html += `<div class="error-suggestion">💡 ${errorInfo.suggestion}</div>`;
        }
        
        if (this.config.messages.showPreventionTips) {
            html += `<div class="error-prevention">🔒 ${errorInfo.prevention}</div>`;
        }

        return html;
    }

    /**
     * 警告メッセージのフォーマット
     */
    private formatWarningMessage(warningInfo: ErrorType, warningData: any): string {
        let html = `<div class="warning-title">⚠️ ${warningInfo.name}</div>`;
        html += `<div class="warning-prevention">${warningInfo.prevention}</div>`;
        return html;
    }

    /**
     * エラー回復の試行
     */
    private attemptRecovery(errorType: string, errorData: any): void {
        try {
            switch (errorType) {
                case 'interface.accidentalReset':
                    this.recoverFromAccidentalReset();
                    break;
                case 'interface.settingsChanged':
                    this.recoverFromSettingsChange();
                    break;
                case 'system.saveFailure':
                    this.recoverFromSaveFailure();
                    break;
                default:
                    console.log(`No specific recovery for ${errorType}`);
            }
            this.statistics.recoveredErrors++;
        } catch (recoveryError) {
            console.error(`Failed to recover from ${errorType}:`, recoveryError);
        }
    }

    /**
     * 誤リセットからの回復
     */
    private recoverFromAccidentalReset(): void {
        if (this.autoSaveSystem) {
            this.autoSaveSystem.restoreLastSave();
        }
    }

    /**
     * 設定変更からの回復
     */
    private recoverFromSettingsChange(): void {
        if (this.undoRedoSystem) {
            this.undoRedoSystem.undo();
        }
    }

    /**
     * セーブ失敗からの回復
     */
    private recoverFromSaveFailure(): void {
        if (this.autoSaveSystem) {
            this.autoSaveSystem.forceSave();
        }
    }

    /**
     * Undo操作
     */
    public undo(): boolean {
        if (!this.undoRedoSystem) {
            return false;
        }

        const result = this.undoRedoSystem.undo();
        if (result) {
            this.statistics.undoOperations++;
        }
        return result;
    }

    /**
     * Redo操作
     */
    public redo(): boolean {
        if (!this.undoRedoSystem) {
            return false;
        }

        const result = this.undoRedoSystem.redo();
        if (result) {
            this.statistics.redoOperations++;
        }
        return result;
    }

    /**
     * 手動セーブ
     */
    public save(): boolean {
        if (!this.autoSaveSystem) {
            return false;
        }

        const result = this.autoSaveSystem.save();
        if (result) {
            this.statistics.manualSaves++;
        }
        return result;
    }

    /**
     * 統計情報の取得
     */
    public getStatistics(): Statistics {
        return { ...this.statistics };
    }

    /**
     * 設定の更新
     */
    public updateConfig(newConfig: Partial<BasicConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        // コンポーネントの設定更新
        if (this.preventionHandler) {
            this.preventionHandler.updateConfig(this.config.prevention);
        }
        
        if (this.undoRedoSystem) {
            this.undoRedoSystem.updateConfig(this.config.recovery);
        }
        
        if (this.autoSaveSystem) {
            this.autoSaveSystem.updateConfig(this.config.recovery);
        }
    }

    /**
     * グローバルエラーハンドラ
     */
    private handleGlobalError(event: ErrorEvent): void {
        this.handleError('system.globalError', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    }

    /**
     * 未処理Promise拒否ハンドラ
     */
    private handleUnhandledPromise(event: PromiseRejectionEvent): void {
        this.handleError('system.promiseRejection', {
            reason: event.reason
        });
    }

    /**
     * ページ終了前の処理
     */
    private handleBeforeUnload(event: BeforeUnloadEvent): void {
        if (this.autoSaveSystem) {
            this.autoSaveSystem.save();
        }
    }

    /**
     * クリーンアップ
     */
    public dispose(): void {
        // イベントリスナーの削除
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener('unhandledrejection', this.handleUnhandledPromise);

        // UI要素の削除
        if (this.warningElement && this.warningElement.parentNode) {
            this.warningElement.parentNode.removeChild(this.warningElement);
        }

        // コンポーネントの破棄
        if (this.preventionHandler) {
            this.preventionHandler.dispose();
        }
        
        if (this.undoRedoSystem) {
            this.undoRedoSystem.dispose();
        }
        
        if (this.autoSaveSystem) {
            this.autoSaveSystem.dispose();
        }

        this.isInitialized = false;
        console.log('ErrorRecoveryManager disposed');
    }
}