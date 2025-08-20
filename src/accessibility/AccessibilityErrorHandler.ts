/**
 * AccessibilityErrorHandler - アクセシビリティエラー処理システム
 * 回復戦略・グレースフルデグラデーション・エラーログ・レポーティング
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

// Interfaces for error handling
interface ErrorHandlerConfig { enabled: boolean,
    gracefulDegradation: boolean,
    autoRecovery: boolean,
    errorReporting: boolean,
    fallbackModes: boolean,
    debugMode: boolean,
    maxRetries: number,';
    retryDelay: number,'';
    logLevel: 'all' | 'warn' | 'error' | 'none'; }
}
';
interface ErrorCategory { ''
    severity: 'critical' | 'high' | 'medium' | 'low',
    autoRecover: boolean,
    fallback: string | null,
    reportImmediately: boolean; }
}

interface ErrorCategories { critical: ErrorCategory,
    functional: ErrorCategory,
    performance: ErrorCategory,
    warning: ErrorCategory;
    }
}

interface ErrorStats { totalErrors: number,
    errorsByCategory: Map<string, number>;
    errorsByComponent: Map<string, number>;
    recoveryAttempts: number,
    successfulRecoveries: number,
    failedRecoveries: number,
    fallbackActivations: number; }
}
';
interface RecoveryStrategy { ''
    [key: string]: (') => Promise<void> | void; }
}

interface RecoveryStrategies { screenReader: RecoveryStrategy,
    keyboard: RecoveryStrategy,
    visual: RecoveryStrategy,
    audio: RecoveryStrategy,
    motor: RecoveryStrategy,
    cognitive: RecoveryStrategy,
    [key: string]: RecoveryStrategy,
    }
}

interface FallbackMode { name: string,
    features: string[],
    disabled: string[]; }
}

interface FallbackModes { basicMode: FallbackMode,
    degradedMode: FallbackMode,
    optimizedMode: FallbackMode,
    [key: string]: FallbackMode,
    }
}

interface ErrorInfo { id: string,
    timestamp: number,
    error: Error | any,
    component: string,
    context: any,
    category: ErrorCategory,
    categoryName: string,
    message: string,';
    stack?: string;''
    severity: 'critical' | 'high' | 'medium' | 'low',
    fallbackMode?: string;
    activatedAt?: number; }
}

interface ErrorReport { timestamp: number,
    severity: string,
    component: string,
    message: string,
    userAgent: string,
    url: string,
    gameState: any; }
}

interface GlobalErrorContext { filename?: string;
    lineno?: number;
    colno?: number;
    promise?: Promise<any>;
    }
}

// AccessibilityManager interface (minimal definition);
interface AccessibilityManager { screenReaderSupport?: {
        reconnect: () => Promise<void>; }
    };
    gameEngine?: { getCurrentState?: () => any; }
    };
}

export class AccessibilityErrorHandler {
    private accessibilityManager: AccessibilityManager | null;
    private gameEngine: any;
    private config: ErrorHandlerConfig;
    private errorCategories: ErrorCategories;
    private errorStats: ErrorStats;
    private activeErrors: Map<string, ErrorInfo>;
    private recoveryStrategies: RecoveryStrategies;
    private fallbackModes: FallbackModes;
    private errorLog: ErrorInfo[];
    private maxLogSize: number';
'';
    constructor(accessibilityManager: AccessibilityManager | null') {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager? .gameEngine;
        
        // エラーハンドリング設定
        this.config = { : undefined
            enabled: true,
            gracefulDegradation: true,
            autoRecovery: true,
            errorReporting: true,
            fallbackModes: true,
            debugMode: false,
            maxRetries: 3,';
            retryDelay: 1000,';
    }
    }'
            logLevel: 'warn' }
        },
        
        // エラー分類
        this.errorCategories = { // 重大なエラー（即座に対処が必要）'
            critical: {''
                severity: 'critical',';
                autoRecover: true,'';
                fallback: 'basicMode',
                reportImmediately: true }
            },
            
            // 機能エラー（特定機能が動作しない）'
            functional: { ''
                severity: 'high',';
                autoRecover: true,'';
                fallback: 'degradedMode',
                reportImmediately: false }
            },
            
            // パフォーマンスエラー（動作は継続）'
            performance: { ''
                severity: 'medium',';
                autoRecover: false,'';
                fallback: 'optimizedMode',
                reportImmediately: false }
            },
            
            // 警告レベル（ユーザー体験に軽微な影響）'
            warning: { ''
                severity: 'low',
                autoRecover: false,
                fallback: null,
                reportImmediately: false }
            }
        },
        
        // エラー統計
        this.errorStats = { totalErrors: 0,
            errorsByCategory: new Map(),
            errorsByComponent: new Map(),
            recoveryAttempts: 0,
            successfulRecoveries: 0,
            failedRecoveries: 0,
            fallbackActivations: 0 }
        },
        
        // アクティブエラー
        this.activeErrors = new Map();
        
        // 回復戦略
        this.recoveryStrategies = { // スクリーンリーダー関連エラー
            screenReader: {
                retryConnection: () => this.retryScreenReaderConnection(),
                fallbackToTextOutput: () => this.enableTextOutput(),
                disableAdvancedFeatures: () => this.disableAdvancedScreenReaderFeatures(); }
            },
            
            // キーボードナビゲーションエラー
            keyboard: { resetFocusManagement: () => this.resetFocusManagement(),
                fallbackToBasicNavigation: () => this.enableBasicNavigation(),
                restoreTabOrder: () => this.restoreTabOrder(); }
            },
            
            // 視覚的アクセシビリティエラー
            visual: { resetContrastSettings: () => this.resetContrastSettings(),
                fallbackToHighContrast: () => this.enableHighContrastMode(),
                disableAnimations: () => this.disableAnimations(); }
            },
            
            // 音声アクセシビリティエラー
            audio: { fallbackToVisualFeedback: () => this.enableVisualFeedback(),
                disableAudioFeatures: () => this.disableAudioFeatures(),
                enableBasicCaptions: () => this.enableBasicCaptions(); }
            },
            
            // 運動機能アクセシビリティエラー
            motor: { fallbackToBasicInput: () => this.enableBasicInput(),
                adjustTimingSettings: () => this.adjustTimingSettings(),
                simplifyGestures: () => this.simplifyGestures(); }
            },
            
            // 認知支援エラー
            cognitive: { enableSimplifiedMode: () => this.enableSimplifiedMode(),'
                increaseHelp: () => this.increaseContextualHelp(),'';
                reduceComplexity: () => this.reduceUIComplexity(''';
                name: 'Basic Accessibility Mode','';
                features: ['keyboardNavigation', 'basicScreenReader', 'highContrast'],'';
                disabled: ['animations', 'advancedFeatures', 'complexInteractions'] }
            },
            ';
            degradedMode: { ''
                name: 'Degraded Accessibility Mode','';
                features: ['essentialFeatures', 'fallbackNavigation'],'';
                disabled: ['nonEssentialFeatures', 'performanceIntensive'] })
            })'
            optimizedMode: { ''
                name: 'Performance Optimized Mode','';
                features: ['coreAccessibility', 'optimizedRendering'],'';
                disabled: ['heavyAnimations', 'complexCalculations'] }
            }
        };
        
        // エラーログ
        this.errorLog = [];
        this.maxLogSize = 1000;'
        ')';
        console.log('AccessibilityErrorHandler initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    private initialize(): void { try {
            this.setupGlobalErrorHandling();'
            this.initializeRecoveryStrategies();''
            this.setupPerformanceMonitoring('')';
            console.log('AccessibilityErrorHandler initialized successfully');' }'
        } catch (error') { ''
            console.error('Failed to initialize AccessibilityErrorHandler:', error); }
        }
    }
    
    /**
     * グローバルエラーハンドリングの設定'
     */''
    private setupGlobalErrorHandling('')';
        window.addEventListener('error', (event: ErrorEvent') => {  ''
            this.handleGlobalError(event.error, 'globalError', {)
                filename: event.filename)';
                lineno: event.lineno,') }'
                colno: event.colno'); }
            };
        };
        ';
        // Promise rejectionのキャッチ''
        window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent') => {  ''
            this.handleGlobalError(event.reason, 'unhandledPromise', {) }
                promise: event.promise); }
            };
        };
    }
    
    /**
     * グローバルエラーの処理
     */
    private handleGlobalError(error: any, type: string, context: GlobalErrorContext): void { // アクセシビリティ関連エラーの場合のみ処理
        if(this.isAccessibilityRelatedError(error, context) {
            
        }
            this.handleAccessibilityError(error, type, context); }
        }
    }
    
    /**
     * アクセシビリティ関連エラーの判定
     */'
    private isAccessibilityRelatedError(error: any, context: GlobalErrorContext): boolean { ''
        const errorMessage = error? .message || error?.toString(') || '';''
        const filename = context?.filename || '';
        
        // エラーメッセージでの判定'
        const accessibilityKeywords = ['';
            'accessibility', 'aria', 'screenreader', 'keyboard', 'focus',']';
            'contrast', 'caption', 'speech', 'gesture', 'alternative'];
        ];
        ';
        if (accessibilityKeywords.some(keyword => );''
            errorMessage.toLowerCase().includes(keyword)') {
            return true; }
        }
        ';
        // ファイル名での判定''
        if (filename.includes('accessibility'') || '';
            filename.includes('a11y') { return true; }
        }
        
        return false;
    }
    
    /**
     * アクセシビリティエラーの処理
     */ : undefined
    handleAccessibilityError(error: any, component: string, context: any = { ): ErrorInfo {
        const errorInfo = this.categorizeError(error, component, context);
        
        // エラー統計の更新
        this.updateErrorStats(errorInfo);
        
        // エラーログ記録
        this.logError(errorInfo);
        
        // 自動回復の試行
        if(errorInfo.category.autoRecover) {
            
        }
            this.attemptRecovery(errorInfo); }
        }
        
        // フォールバック適用
        if (errorInfo.category.fallback) { this.activateFallbackMode(errorInfo.category.fallback, errorInfo); }
        }
        
        // 即座にレポート
        if (errorInfo.category.reportImmediately) { this.reportError(errorInfo); }
        }
        
        // ユーザー通知
        this.notifyUser(errorInfo);
        
        return errorInfo;
    }
    
    /**
     * エラーの分類
     */'
    private categorizeError(error: any, component: string, context: any): ErrorInfo { ''
        const errorMessage = error? .message || error?.toString(') || '';'
         : undefined'';
        let category: keyof ErrorCategories = 'warning'; // デフォルト
        ';
        // 重大度の判定''
        if (this.isCriticalError(error, component, context)') {''
            category = 'critical';' }'
        } else if (this.isFunctionalError(error, component, context)') { ''
            category = 'functional';' }'
        } else if (this.isPerformanceError(error, component, context)') { ''
            category = 'performance'; }
        }
        
        return { id: this.generateErrorId(),
            timestamp: Date.now(),
            error,
            component,
            context,
            category: this.errorCategories[category],
            categoryName: category,
            message: errorMessage,
            stack: error? .stack, : undefined };
            severity: this.errorCategories[category].severity }
        },
    }
    
    /**
     * 重大エラーの判定'
     */''
    private isCriticalError(error: any, component: string, context: any'): boolean { const criticalComponents = [''
            'AccessibilityManager','';
            'KeyboardAccessibilityManager',']';
            'ARIAManager'];
        ];'
        '';
        return criticalComponents.includes(component') && '';
               error? .message?.includes('initialization'); }
    }
    
    /**
     * 機能エラーの判定'
     */ : undefined''
    private isFunctionalError(error: any, component: string, context: any'): boolean { const functionalErrors = [''
            'focus management failed','';
            'screen reader connection lost','';
            'ARIA update failed',']';
            'keyboard navigation broken'];
        ];'
        '';
        const errorMessage = error? .message?.toLowerCase(') || '';
        return functionalErrors.some(msg => errorMessage.includes(msg); }
    }
    
    /**
     * パフォーマンスエラーの判定'
     */ : undefined''
    private isPerformanceError(error: any, component: string, context: any'): boolean { ''
        return error? .message?.includes('performance'') ||'';
               error?.message?.includes('timeout'') ||'';
               error?.message?.includes('slow'); }
    }
    
    /**
     * 回復の試行
     */ : undefined
    private async attemptRecovery(errorInfo: ErrorInfo): Promise<boolean> { const component = this.getComponentType(errorInfo.component);
        const strategies = this.recoveryStrategies[component];
        
        if (!strategies) { }
            console.warn(`No recovery strategies for component: ${component)`});
            return false;
        }
        
        this.errorStats.recoveryAttempts++;
        
        let retryCount = 0;
        while(retryCount < this.config.maxRetries) {
            try {
                // 各戦略を順番に試行
                for(const [strategyName, strategy] of Object.entries(strategies) {
                    console.log(`Attempting recovery strategy: ${strategyName)`),
                    await strategy();
                    
                    // 回復検証
                    if(await this.verifyRecovery(errorInfo) {;
                        this.errorStats.successfulRecoveries++;
                        this.activeErrors.delete(errorInfo.id);
        }
                         }
                        console.log(`Recovery successful with strategy: ${strategyName)`});
                        return true;
                    }
                }
                
                retryCount++;
                if (retryCount < this.config.maxRetries) { await this.delay(this.config.retryDelay * retryCount); }
                } catch (recoveryError) { console.warn(`Recovery attempt failed:`, recoveryError);
                retryCount++; }
            }
        }
        
        this.errorStats.failedRecoveries++;
        console.error(`Recovery failed after ${this.config.maxRetries) attempts`});
        return false;
    }
    
    /**
     * コンポーネントタイプの取得'
     */''
    private getComponentType(component: string'): string { const componentMap: Record<string, string> = {''
            'ScreenReaderSupport': 'screenReader','';
            'KeyboardAccessibilityManager': 'keyboard','';
            'ContrastManager': 'visual','';
            'VisualFeedbackManager': 'audio','';
            'AlternativeInputManager': 'motor','';
            'SimplificationManager': 'cognitive' }
        };'
        '';
        return componentMap[component] || 'unknown';
    }
    
    /**
     * 回復検証
     */
    private async verifyRecovery(errorInfo: ErrorInfo): Promise<boolean> { const component = errorInfo.component;
        ';
        // コンポーネント固有の検証''
        switch (this.getComponentType(component)') {''
            case 'screenReader':'';
                return this.verifyScreenReaderRecovery(''';
            case 'keyboard':'';
                return this.verifyKeyboardRecovery('')';
            case 'visual':);
                return this.verifyVisualRecovery();
            default: return this.verifyGenericRecovery(component); }
        }
    }
    
    /**
     * スクリーンリーダー回復検証'
     */''
    private verifyScreenReaderRecovery('')';
        const ariaElements = document.querySelectorAll('[aria-label], [aria-describedby], [role]');
        return ariaElements.length > 0;
    }
    
    /**
     * キーボード回復検証
     */'
    private verifyKeyboardRecovery(): boolean { // フォーカス可能要素の確認''
        const focusableElements = document.querySelectorAll('')';
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]")';
        );
        return focusableElements.length > 0 && ;
               document.activeElement !== null; }
    }
    
    /**
     * 視覚回復検証
     */'
    private verifyVisualRecovery(): boolean { // コントラスト設定の確認''
        const bodyStyle = window.getComputedStyle(document.body');''
        return bodyStyle.color !== '' && bodyStyle.backgroundColor !== ''; }
    }
    
    /**
     * 汎用回復検証
     */
    private verifyGenericRecovery(component: string): boolean { // 基本的な DOM 要素の存在確認
        return document.body !== null && document.head !== null; }
    }
    
    /**
     * フォールバックモードの有効化
     */
    private activateFallbackMode(modeName: string, errorInfo: ErrorInfo): boolean { const mode = this.fallbackModes[modeName];
        if (!mode) { }
            console.warn(`Unknown fallback mode: ${modeName)`});
            return false;
        }
        
        this.errorStats.fallbackActivations++;
        
        console.log(`Activating fallback mode: ${ mode.name)`),
        
        // 機能の無効化
        mode.disabled.forEach(feature => {); }
            this.disableFeature(feature});
        };
        
        // 必要な機能の有効化
        mode.features.forEach(feature => {  ); }
            this.enableFeature(feature); }
        };
        
        // フォールバック状態の記録
        this.activeErrors.set(errorInfo.id, { ...errorInfo,)
            fallbackMode: modeName),
            activatedAt: Date.now(); }
        };
        
        return true;
    }
    
    /**
     * 機能の無効化
     */'
    private disableFeature(feature: string): void { ''
        switch(feature') {'
            '';
            case 'animations':'';
                this.disableAnimations('')';
            case 'advancedFeatures':);
                this.disableAdvancedFeatures();
                break;
        }
            default: }
                console.log(`Disabling feature: ${feature)`}),
        }
    }
    
    /**
     * 機能の有効化
     */'
    private enableFeature(feature: string): void { ''
        switch(feature') {'
            '';
            case 'keyboardNavigation':'';
                this.enableBasicNavigation('')';
            case 'highContrast':);
                this.enableHighContrastMode();
                break;
        }
            default: }
                console.log(`Enabling feature: ${feature)`}),
        }
    }
    
    // 個別の回復戦略実装
    
    /**
     * スクリーンリーダー接続の再試行
     */
    private async retryScreenReaderConnection(): Promise<void> { if (this.accessibilityManager? .screenReaderSupport) {
            await this.accessibilityManager.screenReaderSupport.reconnect(); }
        }
    }
    
    /**
     * テキスト出力の有効化'
     */ : undefined''
    private enableTextOutput('')';
        const textOutput = document.createElement('div'');''
        textOutput.id = 'accessibility-text-output';
        textOutput.style.cssText = `;
            position: fixed,
            top: 0,
            left: 0,
            z-index: 9999,
            background: rgba(0,0,0,0.8),
            color: white,
            padding: 10px,
            max-width: 300px,
        `;
        document.body.appendChild(textOutput);
    }
    
    /**
     * 高度なスクリーンリーダー機能の無効化'
     */''
    private disableAdvancedScreenReaderFeatures('')';
        const complexAriaElements = document.querySelectorAll('[aria-expanded], [aria-controls]');''
        complexAriaElements.forEach(element => {  ');''
            element.removeAttribute('aria-expanded'');' }'
            element.removeAttribute('aria-controls'); }
        };
    }
    
    /**
     * フォーカス管理のリセット'
     */''
    private resetFocusManagement('')';
        const focusTraps = document.querySelectorAll('[data-focus-trap]');''
        focusTraps.forEach(trap => {  ');' }'
            trap.removeAttribute('data-focus-trap'); }
        };
        ';
        // 最初のフォーカス可能要素にフォーカス''
        const firstFocusable = document.querySelector('')';
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]')';
        ) as HTMLElement;
        if (firstFocusable) { firstFocusable.focus(); }
        }
    }
    
    /**
     * 基本ナビゲーションの有効化'
     */''
    private enableBasicNavigation('')';
        const interactiveElements = document.querySelectorAll('button, [href], input, select, textarea');''
        interactiveElements.forEach((element') => {  const htmlElement = element as HTMLElement;''
            if(!htmlElement.hasAttribute('tabindex') { }
                htmlElement.tabIndex = 0; }
            }
        };
    }
    
    /**
     * タブオーダーの復元'
     */''
    private restoreTabOrder('')';
        const elements = Array.from(document.querySelectorAll('[tabindex]') as HTMLElement[];
        elements.sort((a, b) => {  const aRect = a.getBoundingClientRect();
            const bRect = b.getBoundingClientRect();
            
            if (Math.abs(aRect.top - bRect.top) < 10) { }
                return aRect.left - bRect.left; }
            }
            return aRect.top - bRect.top;
        };
        
        elements.forEach((element, index) => { element.tabIndex = index + 1; }
        };
    }
    
    /**
     * コントラスト設定のリセット'
     */''
    private resetContrastSettings(''';
        document.body.style.filter = '';''
        document.documentElement.style.filter = '';
    }
    
    /**
     * 高コントラストモードの有効化'
     */''
    private enableHighContrastMode('')';
        document.documentElement.classList.add('high-contrast'');
        ';
        // CSS カスタムプロパティで高コントラスト色を設定''
        document.documentElement.style.setProperty('--text-color', '#000000'');''
        document.documentElement.style.setProperty('--background-color', '#ffffff'');''
        document.documentElement.style.setProperty('--border-color', '#000000');
    }
    
    /**
     * アニメーションの無効化'
     */''
    private disableAnimations('')';
        const style = document.createElement('style');
        style.textContent = `;
            *, *::before, *::after { animation-duration: 0.01ms !important,
                animation-iteration-count: 1 !important,
                transition-duration: 0.01ms !important, }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 視覚フィードバックの有効化'
     */''
    private enableVisualFeedback('')';
        const visualFeedback = document.createElement('div'');''
        visualFeedback.id = 'visual-audio-feedback';
        visualFeedback.style.cssText = `;
            position: fixed,
            top: 50%,
            left: 50%,
            transform: translate(-50%, -50%),
            z-index: 10000,
            pointer-events: none,
        `;
        document.body.appendChild(visualFeedback);
    }
    ';
    // Stub implementations for recovery strategies''
    private disableAdvancedFeatures('')';
        console.log('Disabling advanced features');
    }'
    '';
    private disableAudioFeatures('')';
        console.log('Disabling audio features');
    }'
    '';
    private enableBasicCaptions('')';
        console.log('Enabling basic captions');
    }'
    '';
    private enableBasicInput('')';
        console.log('Enabling basic input');
    }'
    '';
    private adjustTimingSettings('')';
        console.log('Adjusting timing settings');
    }'
    '';
    private simplifyGestures('')';
        console.log('Simplifying gestures');
    }'
    '';
    private enableSimplifiedMode('')';
        console.log('Enabling simplified mode');
    }'
    '';
    private increaseContextualHelp('')';
        console.log('Increasing contextual help');
    }'
    '';
    private reduceUIComplexity('')';
        console.log('Reducing UI complexity');
    }'
    '';
    private initializeRecoveryStrategies('')';
        console.log('Initializing recovery strategies');
    }'
    '';
    private setupPerformanceMonitoring('')';
        console.log('Setting up performance monitoring');
    }
    
    /**
     * エラー統計の更新
     */
    private updateErrorStats(errorInfo: ErrorInfo): void { this.errorStats.totalErrors++;
        
        // カテゴリ別統計
        const category = errorInfo.categoryName;
        this.errorStats.errorsByCategory.set();
            category);
            (this.errorStats.errorsByCategory.get(category) || 0) + 1;
        );
        
        // コンポーネント別統計
        const component = errorInfo.component;
        this.errorStats.errorsByComponent.set();
            component);
            (this.errorStats.errorsByComponent.get(component) || 0) + 1;
        ); }
    }
    
    /**
     * エラーログ記録
     */
    private logError(errorInfo: ErrorInfo): void { this.errorLog.push(errorInfo);
        
        // ログサイズ制限
        if(this.errorLog.length > this.maxLogSize) {'
            ';
        }'
            this.errorLog = this.errorLog.slice(-this.maxLogSize / 2'); }
        }
        ';
        // コンソール出力''
        if(this.config.logLevel === 'all' || ')';
            (this.config.logLevel === 'warn' && errorInfo.severity !== 'low') {
            
        }
            console.error(`Accessibility Error [${errorInfo.categoryName)]:`, errorInfo});
        }
    }
    
    /**
     * エラーレポート
     */
    private reportError(errorInfo: ErrorInfo): void { if (!this.config.errorReporting) return;
        
        // エラーレポートデータの作成
        const report: ErrorReport = {
            timestamp: errorInfo.timestamp,
            severity: errorInfo.severity,
            component: errorInfo.component,
            message: errorInfo.message,
            userAgent: navigator.userAgent,
            url: window.location.href,
            gameState: this.gameEngine? .getCurrentState?.() || null }
        },
        
        // レポートの送信（実装に応じて）
        this.sendErrorReport(report);
    }
    
    /**
     * エラーレポートの送信'
     */ : undefined''
    private async sendErrorReport(report: ErrorReport'): Promise<void> { try {'
            // ここで実際のレポート送信API を呼び出し''
            console.log('Error report prepared:', report');'
            '';
            // 例: fetch('/api/accessibility-errors', { ... );' }'
        } catch (error') { ''
            console.warn('Failed to send error report:', error); }
        }
    }
    
    /**
     * ユーザー通知'
     */''
    private notifyUser(errorInfo: ErrorInfo'): void { ''
        if(errorInfo.severity === 'critical' || errorInfo.severity === 'high') {
            
        }
            this.showErrorNotification(errorInfo); }
        }
    }
    
    /**
     * エラー通知の表示'
     */''
    private showErrorNotification(errorInfo: ErrorInfo'): void { ''
        const notification = document.createElement('div'');''
        notification.className = 'accessibility-error-notification';
        notification.style.cssText = `;
            position: fixed,
            top: 20px,
            right: 20px,
            background: #f44336,
            color: white,
            padding: 1rem,
            border-radius: 4px,
            z-index: 10001,';
            max-width: 300px,'';
            box-shadow: 0 2px 10px rgba(0,0,0,0.2');
        `;
        ';
        notification.innerHTML = `'';
            <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">""
                <span style="font-size: 1.2rem; margin-right: 0.5rem;">⚠️</span>
                <strong>アクセシビリティエラー</strong>";
            </div>"";
            <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">
                一部の機能が正常に動作しない可能性があります。";
            </p>"";
            <button onclick="this.parentElement.remove(")" "";
                    style="background: rgba(255,255,255,0.2"); border: none; color: white; padding: 0.3rem 0.8rem; border-radius: 2px; cursor: pointer;">
                閉じる;
            </button>;
        `;
        
        document.body.appendChild(notification);
        
        // 10秒後に自動削除
        setTimeout(() => { 
            if (notification.parentElement) { }
                notification.parentElement.removeChild(notification); }
            }
        }, 10000);
    }
    
    /**
     * ユーティリティメソッド
     */
    private generateErrorId(): string {
        return `error_${Date.now(})}_${Math.random().toString(36).substr(2, 9})}`;
    }
    
    private delay(ms: number): Promise<void> { return new Promise(resolve => setTimeout(resolve, ms); }
    }
    
    // パブリックAPI
    
    /**
     * エラー統計の取得
     */
    getErrorStats(): Record<string, any> { return { ...this.errorStats,
            errorsByCategory: Object.fromEntries(this.errorStats.errorsByCategory),
            errorsByComponent: Object.fromEntries(this.errorStats.errorsByComponent),
            recoveryRate: this.errorStats.recoveryAttempts > 0 ?   : undefined };
                (this.errorStats.successfulRecoveries / this.errorStats.recoveryAttempts) * 100 : 0 }
        },
    }
    
    /**
     * エラーログの取得
     */
    getErrorLog(limit: number = 50): ErrorInfo[] { return this.errorLog.slice(-limit); }
    }
    
    /**
     * アクティブエラーの取得
     */
    getActiveErrors(): ErrorInfo[] { return Array.from(this.activeErrors.values(); }
    }
    
    /**
     * エラーログのクリア"
     */""
    clearErrorLog("): void { this.errorLog = [];""
        console.log('Error log cleared'); }
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config: { errorHandler?: Partial<ErrorHandlerConfig> ): void {
        if(config.errorHandler) {'
            ';
        }'
            Object.assign(this.config, config.errorHandler'); }
        }'
        '';
        console.log('AccessibilityErrorHandler configuration applied');
    }
    
    /**
     * 有効状態の設定'
     */''
    setEnabled(enabled: boolean'): void { this.config.enabled = enabled;' }'
        console.log(`AccessibilityErrorHandler ${enabled ? 'enabled' : 'disabled')`});
    }
    
    /**
     * クリーンアップ '
     */''
    destroy('')';
        console.log('Destroying AccessibilityErrorHandler...');
        ';
        // アクティブエラーのクリア''
        this.activeErrors.clear('')';
        console.log('AccessibilityErrorHandler destroyed'');'
    }''
}