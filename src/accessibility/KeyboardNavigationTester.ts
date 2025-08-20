/**
 * KeyboardNavigationTester - キーボードナビゲーション包括テストシステム
 * Main Controller Pattern実装でサブコンポーネントを統制
 * - KeyboardEventHandler: イベント処理とシミュレーション
 * - NavigationStateManager: フォーカス状態管理とナビゲーション制御
 * - KeyboardAccessibilityReporter: テスト結果報告と分析
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';''
import { KeyboardEventHandler } from './keyboard-navigation/KeyboardEventHandler.js';''
import { NavigationStateManager } from './keyboard-navigation/NavigationStateManager.js';''
import { KeyboardAccessibilityReporter } from './keyboard-navigation/KeyboardAccessibilityReporter.js';

// Interfaces for keyboard navigation testing
interface TestConfig { enabled: boolean,
    autoTest: boolean,'';
    testDepth: 'basic' | 'standard' | 'comprehensive',
    includeCustomElements: boolean,
    testShortcuts: boolean,
    monitorFocusChanges: boolean,
    generateReport: boolean };
}
interface TestSuite { name: string,
    tests: string[] };
}
interface TestSuites { focusManagement: TestSuite,
    keyboardTraps: TestSuite,
    shortcutConflicts: TestSuite,
    customControls: TestSuite,
    navigationPatterns: TestSuite
    };
}
interface TestResult { testName: string,
    passed: boolean,
    message: string,';
    details?: any;''
    severity?: 'error' | 'warning' | 'info'; };
}
interface SuiteResult { suiteName: string,
    tests: TestResult[],
    score: number,
    passed: number,
    failed: number,
    warnings: number };
}
interface OverallResult { score: number,
    passed: number,
    failed: number,
    warnings: number,
    timestamp: number | null };
}
interface PerformanceMetrics { totalTestTime: number,
    averageFocusTime: number,
    navigationErrors: number };
}
interface TestResults { overall: OverallResult,
    suiteResults: Record<string, SuiteResult>;
    focusOrder: FocusOrderItem[],
    trapDetections: TrapDetection[],
    shortcutConflicts: ShortcutConflict[],
    performanceMetrics: PerformanceMetrics,
    recommendations: string[] };
}
interface FocusOrderItem { element: HTMLElement,
    selector: string,
    tabIndex: number,
    ariaLabel?: string;
    role?: string;
    isAccessible: boolean };
}
';'
interface TrapDetection { ''
    type: 'modal' | 'infinite' | 'dead-end',
    location: string,';
    elements: HTMLElement[],'';
    severity: 'critical' | 'warning',
    suggestion: string };
}
interface ShortcutConflict { key: string,'
    modifiers: string[],'';
    conflictType: 'browser' | 'system' | 'application',';
    description: string,'';
    severity: 'high' | 'medium' | 'low' };
}
interface NavigationState { isActive: boolean,
    currentElement: HTMLElement | null,
    focusHistory: HTMLElement[],
    shortcuts: Map<string, Function> };
}
interface TestOptions { skipVisualTests?: boolean;
    interactiveMode?: boolean;
    customShortcuts?: Map<string, string>; };
}
// AccessibilityManager interface (minimal definition);
interface AccessibilityManager { gameEngine?: any; };
}
export class KeyboardNavigationTester {
    private accessibilityManager: AccessibilityManager | null;
    private gameEngine: any;
    private config: TestConfig;
    private eventHandler: KeyboardEventHandler;
    private stateManager: NavigationStateManager;
    private reporter: KeyboardAccessibilityReporter;
    private testSuites: TestSuites;
    private results: TestResults;
    private navigationState: NavigationState;
    private isTestRunning: boolean;
    private originalFocus: HTMLElement | null;
    private observers: {
        focus: MutationObserver | null,
        dom: MutationObserver | null }
    };
'';
    constructor(accessibilityManager: AccessibilityManager | null') {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager? .gameEngine;
        
        // テスト設定
        this.config = { : undefined
            enabled: true,
            autoTest: false,'';
            testDepth: 'comprehensive',
            includeCustomElements: true,
            testShortcuts: true,
            monitorFocusChanges: true
};
}
            generateReport: true ;
}
        },
        ';
        // サブコンポーネントの初期化
        this.initializeSubComponents(''';
                name: 'フォーカス管理テスト',';
                tests: ['';
                    'tabOrder','';
                    'focusVisibility', '';
                    'focusContainment','';
                    'focusRestoration',']';
                    'initialFocus'];
                ];
            },'
            keyboardTraps: { ''
                name: 'キーボードトラップテスト',';
                tests: ['';
                    'modalTraps','';
                    'infiniteLoops','';
                    'escapeRoutes',']';
                    'skipLinks'];
                ] }
            },'
            shortcutConflicts: { ''
                name: 'ショートカット競合テスト',';
                tests: ['';
                    'browserConflicts','';
                    'systemConflicts','';
                    'applicationConflicts',']';
                    'accessKeyConflicts'];
                ] }
            },'
            customControls: { ''
                name: 'カスタムコントロールテスト',';
                tests: ['';
                    'ariaControls','';
                    'compositeWidgets','';
                    'gameControls',']';
                    'interactiveElements'];
                ] }
            },'
            navigationPatterns: { ''
                name: 'ナビゲーションパターンテスト',';
                tests: ['';
                    'landmarkNavigation','';
                    'headingNavigation','';
                    'listNavigation',']';
                    'tableNavigation'];
                ] };
}
        };
        
        // テスト結果（統合用）
        this.results = { overall: {
                score: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
                timestamp: null 
}
            },
            suiteResults: {},
            focusOrder: [],
            trapDetections: [],
            shortcutConflicts: [],
            performanceMetrics: { totalTestTime: 0,
                averageFocusTime: 0,
                navigationErrors: 0 
}
            },
            recommendations: [];
        },
        
        // ナビゲーション状態
        this.navigationState = { isActive: false)
            currentElement: null);
            focusHistory: [],'';
            shortcuts: new Map()';
        console.log('KeyboardNavigationTester initialized'),
        this.initialize(); };
}
    /**
     * サブコンポーネントの初期化
     */
    private initializeSubComponents(): void { // EventHandlerの初期化
        this.eventHandler = new KeyboardEventHandler({
            enableEventCapture: true,
            preventDefaultConflicts: true);
            simulateRealEvents: true);
            captureEventTiming: true;
        ),
        
        // StateManagerの初期化
        this.stateManager = new NavigationStateManager({
            trackFocusHistory: true,
            manageFocusTraps: true);
            maintainFocusContext: true);
            enableRoleBasedNavigation: true'';
        )'),
        
        // Reporterの初期化
        this.reporter = new KeyboardAccessibilityReporter({
            detailedAnalysis: true);
            includeVisualReport: true);
            generateRecommendations: true,'';
            exportFormats: ['json', 'html', 'csv'];
        ); };
}
    /**
     * 初期化処理
     */
    private initialize(): void { try {
            // サブコンポーネントの初期化
            this.eventHandler.initialize();
            this.stateManager.initialize();
            this.reporter.initialize();
            
            // イベントハンドラーのセットアップ
            this.setupEventHandlers();
            
            // オブザーバーのセットアップ
            if(this.config.monitorFocusChanges) {
                
            }
                this.setupObservers(); };
}
            // 初期ショートカットの登録
            this.registerDefaultShortcuts();
            
            // 自動テストの開始
            if(this.config.autoTest) {
                ';'
            }'
                setTimeout(() => this.runFullTest(), 1000'); }
            }'
            '';
            console.log('KeyboardNavigationTester initialization completed');''
        } catch (error) { ''
            console.error('Failed to initialize KeyboardNavigationTester:', error);''
            getErrorHandler(')? .logError('KeyboardNavigationTester initialization failed', error); };
}
    }
    
    /**
     * 完全なテストスイートの実行
     */ : undefined'
    async runFullTest(options: TestOptions = { ): Promise<TestResults> {''
        if(this.isTestRunning') {'
            '';
            console.warn('Test already in progress');
        }
            return this.results; };
}
        ';'
        this.isTestRunning = true;''
        const startTime = performance.now()';
            console.log('Starting comprehensive keyboard navigation test...');
            
            // 元のフォーカスを保存
            this.originalFocus = document.activeElement as HTMLElement;
            
            // 結果のリセット
            this.resetResults();
            
            // 各テストスイートを実行
            for(const [suiteName, suite] of Object.entries(this.testSuites) {
                const suiteResult = await this.runTestSuite(suiteName, suite, options);
                this.results.suiteResults[suiteName] = suiteResult;
                
                // 全体結果の更新
                this.results.overall.passed += suiteResult.passed;
                this.results.overall.failed += suiteResult.failed;
            }
                this.results.overall.warnings += suiteResult.warnings; };
}
            // スコアの計算
            this.calculateOverallScore();
            
            // パフォーマンスメトリクスの更新
            this.results.performanceMetrics.totalTestTime = performance.now() - startTime;
            
            // 推奨事項の生成
            this.generateRecommendations();
            
            // タイムスタンプの記録
            this.results.overall.timestamp = Date.now();
            
            // レポートの生成
            if(this.config.generateReport) {
                '';
                await this.generateReport();'
            console.log('Keyboard navigation test completed');
            return this.results;
            }'
            ' }'
        } catch (error) { ''
            console.error('Test execution failed:', error);
            throw error; }
        } finally { this.isTestRunning = false;
            
            // フォーカスの復元
            if(this.originalFocus && this.originalFocus.focus) {
                
            }
                this.originalFocus.focus(); };
}
        };
}
    /**
     * 個別テストスイートの実行
     */
    private async runTestSuite(suiteName: string, suite: TestSuite, options: TestOptions): Promise<SuiteResult> {
        console.log(`Running test suite: ${suite.name)`});
        
        const suiteResult: SuiteResult = { suiteName: suite.name,
            tests: [],
            score: 0,
            passed: 0,
            failed: 0,
            warnings: 0 
}
        },
        ';'
        for (const testName of suite.tests) { ' }'
            const testMethod = (this as any')[`test_${testName}`];''
            if(typeof testMethod === 'function') {
                try {
                    const result = await testMethod.call(this, options);
                    suiteResult.tests.push(result);'
                    '';
                    if (result.passed') {
            }'
                        suiteResult.passed++;' }'
                    } else if (result.severity === 'warning') { suiteResult.warnings++; }
                    } else { suiteResult.failed++; }
                    } catch (error) {
                    console.error(`Test failed: ${testName}`, error);
                    suiteResult.tests.push({ testName)'
                        passed: false),' }'
                        message: `Test execution error: ${(error as Error'}).message}`,''
                        severity: 'error';
                    }),
                    suiteResult.failed++;
                };
}
        }
        
        // スイートスコアの計算
        const total = suiteResult.passed + suiteResult.failed;
        suiteResult.score = total > 0 ? (suiteResult.passed / total) * 100 : 0;
        
        return suiteResult;
    }
    
    // 個別テストメソッド実装
    
    /**
     * タブ順序テスト
     */
    private async test_tabOrder(options: TestOptions): Promise<TestResult> { const focusableElements = this.stateManager.getFocusableElements();
        const issues: string[] = [],
        
        // タブ順序の検証
        let previousTabIndex = -1;''
        focusableElements.forEach((element, index') => { 
            const tabIndex = element.tabIndex;
            ';'
            // 負のtabIndexの検出' }'
            if(tabIndex < 0 && !element.hasAttribute('aria-hidden') { }
                issues.push(`Element ${this.getElementSelector(element})} has negative tabindex but is not hidden`);
            }
            
            // 非論理的なタブ順序
            if(tabIndex > 0 && tabIndex < previousTabIndex) {
                
            }
                issues.push(`Non-logical tab order detected at ${this.getElementSelector(element})}`);
            }
            
            previousTabIndex = Math.max(previousTabIndex, tabIndex);
            
            // フォーカス順序の記録
            this.results.focusOrder.push({ )
                element);''
                selector: this.getElementSelector(element'),';
                tabIndex,'';
                ariaLabel: element.getAttribute('aria-label'') || undefined,'';
                role: element.getAttribute('role') || undefined,
                isAccessible: this.isAccessibleElement(element) }'
            });''
        }');
        ';'
        return { ''
            testName: 'tabOrder', };'
            passed: issues.length === 0,' }'
            message: issues.length === 0 ? 'Tab order is logical and consistent' : `Found ${issues.length} tab order issues`,'
            details: { issues, elementCount: focusableElements.length },''
            severity: issues.length > 5 ? 'error' : 'warning';
        },
    }
    
    /**
     * フォーカス可視性テスト
     */'
    private async test_focusVisibility(options: TestOptions): Promise<TestResult> { ''
        if(options.skipVisualTests') {'
            return { ''
                testName: 'focusVisibility',';
                passed: true,'
        }'
                message: 'Visual test skipped',' };'
                severity: 'info' ;
}
            },
        }
        
        const issues: string[] = [],
        const focusableElements = this.stateManager.getFocusableElements();
        
        for(const element of focusableElements.slice(0, 10) {
        
            // サンプルテスト
            element.focus();
            await this.delay(50);
            '';
            const focusStyles = window.getComputedStyle(element');'
            const hasFocusIndicator = '';
                focusStyles.outline !== 'none' ||'';
                focusStyles.boxShadow !== 'none' ||'';
                element.classList.toString(').includes('focus');
            
        
        }'
            if (!hasFocusIndicator) {' }'
                issues.push(`No focus indicator for ${this.getElementSelector(element})}`');
            };
}
        ';'
        return { ''
            testName: 'focusVisibility', };'
            passed: issues.length === 0,' }'
            message: issues.length === 0 ? 'All tested elements have visible focus indicators' : `${issues.length} elements lack focus indicators`,'
            details: { issues },''
            severity: issues.length > 0 ? 'error' : undefined;
        },
    }
    
    /**
     * モーダルトラップテスト'
     */''
    private async test_modalTraps(options: TestOptions'): Promise<TestResult> { ''
        const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"], .modal');
        const traps: TrapDetection[] = [],
        
        modals.forEach(modal => { );
            if(this.isVisible(modal as HTMLElement) {
                const focusableInModal = this.stateManager.getFocusableElements(modal as HTMLElement);
                const hasEscapeRoute = this.checkEscapeRoute(modal as HTMLElement);'
                '';
                if (focusableInModal.length > 0 && !hasEscapeRoute') {'
                    traps.push({')'
                        type: 'modal'),'';
                        location: this.getElementSelector(modal as HTMLElement'),';
                        elements: focusableInModal,'
            }'
                        severity: 'critical',' }'
                        suggestion: 'Add escape key handler or close button' ;
}
                    }),
                };
}
        });'
        '';
        this.results.trapDetections.push(...traps');
        ';'
        return { ''
            testName: 'modalTraps', };'
            passed: traps.length === 0,' }'
            message: traps.length === 0 ? 'No modal keyboard traps detected' : `Found ${traps.length} potential keyboard traps`,'
            details: { traps },''
            severity: traps.length > 0 ? 'error' : undefined;
        },
    }
    
    /**
     * ブラウザショートカット競合テスト'
     */''
    private async test_browserConflicts(options: TestOptions'): Promise<TestResult> { const browserShortcuts = [' }]'
            { key: 'f', modifiers: ['ctrl'], description: 'Find' },''
            { key: 'p', modifiers: ['ctrl'], description: 'Print' },''
            { key: 's', modifiers: ['ctrl'], description: 'Save' },''
            { key: 'tab', modifiers: ['ctrl'], description: 'Switch tabs' },''
            { key: 'w', modifiers: ['ctrl'], description: 'Close tab' }
        ];
        
        const conflicts: ShortcutConflict[] = [],
        const registeredShortcuts = this.eventHandler.getRegisteredShortcuts();
        
        browserShortcuts.forEach(browserShortcut => {  const conflictingShortcut = registeredShortcuts.find(s => )
                s.key === browserShortcut.key &&);
                s.modifiers.every(m => browserShortcut.modifiers.includes(m);
            );'
            '';
            if(conflictingShortcut') {
                conflicts.push({)
                    key: browserShortcut.key)
            }'
                    modifiers: browserShortcut.modifiers,' }'
                    conflictType: 'browser', }'
                    description: `Conflicts with browser ${browserShortcut.description} function`,')'
                    severity: 'high');
            }
        });'
        '';
        this.results.shortcutConflicts.push(...conflicts');
        ';'
        return { ''
            testName: 'browserConflicts', };'
            passed: conflicts.length === 0,' }'
            message: conflicts.length === 0 ? 'No browser shortcut conflicts' : `Found ${conflicts.length} browser shortcut conflicts`,'
            details: { conflicts },''
            severity: conflicts.length > 0 ? 'error' : undefined;
        },
    }
    
    /**
     * ARIAコントロールテスト'
     */''
    private async test_ariaControls(options: TestOptions'): Promise<TestResult> { ''
        const ariaElements = document.querySelectorAll('[role]');
        const issues: string[] = [],';
        '';
        ariaElements.forEach(element => { ');''
            const role = element.getAttribute('role');
            const required = this.getRequiredAriaAttributes(role!);
            
            required.forEach(attr => {); }'
                if(!element.hasAttribute(attr) {' }'
                    issues.push(`${this.getElementSelector(element as HTMLElement'})} with role="${role}" missing required ${attr}`);
                }
            });
            
            // インタラクティブロールのキーボードサポート確認
            if(this.isInteractiveRole(role!) {
                const tabIndex = (element as HTMLElement).tabIndex;
            }"
                if (tabIndex < 0) {" }"
                    issues.push(`${this.getElementSelector(element as HTMLElement"})} with interactive role="${role}" is not keyboard accessible`);
                }"
            }""
        }");
        ";
        return { ""
            testName: 'ariaControls', };'
            passed: issues.length === 0,' }'
            message: issues.length === 0 ? 'All ARIA controls properly implemented' : `Found ${issues.length} ARIA implementation issues`,'
            details: { issues },''
            severity: issues.length > 0 ? 'error' : undefined;
        },
    }
    
    // ヘルパーメソッド
    
    /**
     * 要素セレクターの取得
     */
    private getElementSelector(element: HTMLElement): string { if (element.id) { }
            return `#${element.id}`;
        }''
        if (element.className') { ' }'
            return `.${element.className.split(' '').join('.'})}`;
        }
        return element.tagName.toLowerCase();
    }
    
    /**
     * アクセシブル要素かどうかの判定'
     */''
    private isAccessibleElement(element: HTMLElement'): boolean { ''
        const hasAriaLabel = element.hasAttribute('aria-label'') || element.hasAttribute('aria-labelledby');''
        const hasText = element.textContent? .trim()';
        const isLabeledInput = element.tagName === 'INPUT' && ') }'
            (element.hasAttribute('aria-label'') || document.querySelector(`label[for="${element.id")"]`)});
        
        return hasAriaLabel || hasText || isLabeledInput;
    }
    
    /**
     * 要素が表示されているかの確認
     */ : undefined"
    private isVisible(element: HTMLElement): boolean { ""
        const styles = window.getComputedStyle(element");""
        return styles.display !== 'none' && '';
               styles.visibility !== 'hidden' && '';
               styles.opacity !== '0'; };
}
    /**
     * エスケープルートの確認'
     */''
    private checkEscapeRoute(modal: HTMLElement'): boolean { // Escapeキーハンドラーの存在確認
        const hasEscapeHandler = this.eventHandler.hasShortcut('Escape'');
        ';
        // 閉じるボタンの存在確認
        const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="閉じる"], .close, .modal-close');
        
        return hasEscapeHandler || closeButton !== null; };
}
    /**
     * 必須ARIA属性の取得'
     */''
    private getRequiredAriaAttributes(role: string'): string[] { const requiredAttributes: Record<string, string[]> = {''
            'checkbox': ['aria-checked'],'';
            'combobox': ['aria-expanded'],'';
            'grid': ['aria-rowcount', 'aria-colcount'],'';
            'gridcell': ['aria-colindex'],'';
            'listbox': ['aria-multiselectable'],'';
            'menu': ['aria-orientation'],'';
            'menuitem': [],'';
            'menuitemcheckbox': ['aria-checked'],'';
            'menuitemradio': ['aria-checked'],'';
            'option': ['aria-selected'],'';
            'progressbar': ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],'';
            'radio': ['aria-checked'],'';
            'row': ['aria-rowindex'],'';
            'scrollbar': ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-orientation'],'';
            'separator': ['aria-orientation'],'';
            'slider': ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],'';
            'spinbutton': ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],'';
            'switch': ['aria-checked'],'';
            'tab': ['aria-selected'],'';
            'tabpanel': [],'';
            'textbox': ['aria-multiline'],'';
            'tree': ['aria-multiselectable'],'';
            'treeitem': ['aria-expanded'] }
        };
        
        return requiredAttributes[role] || [];
    }
    
    /**
     * インタラクティブロールかどうかの判定'
     */''
    private isInteractiveRole(role: string'): boolean { const interactiveRoles = [''
            'button', 'checkbox', 'combobox', 'grid', 'gridcell', 'link','';
            'listbox', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox','';
            'menuitemradio', 'option', 'progressbar', 'radio', 'scrollbar','';
            'searchbox', 'separator', 'slider', 'spinbutton', 'switch',']';
            'tab', 'tabpanel', 'textbox', 'tree', 'treeitem'];
        ];
        
        return interactiveRoles.includes(role); };
}
    /**
     * 遅延処理
     */
    private delay(ms: number): Promise<void>,
        return new Promise(resolve => setTimeout(resolve, ms);
    }
    
    /**
     * 結果のリセット
     */
    private resetResults(): void { this.results = {
            overall: {
                score: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
                timestamp: null 
}
            },
            suiteResults: {},
            focusOrder: [],
            trapDetections: [],
            shortcutConflicts: [],
            performanceMetrics: { totalTestTime: 0,
                averageFocusTime: 0,
                navigationErrors: 0 
}
            },
            recommendations: [];
        },
    }
    
    /**
     * 全体スコアの計算
     */
    private calculateOverallScore(): void { const total = this.results.overall.passed + this.results.overall.failed;
        this.results.overall.score = total > 0 ?   : undefined;
            (this.results.overall.passed / total) * 100 : 0; };
}
    /**
     * 推奨事項の生成
     */
    private generateRecommendations(): void { const recommendations: string[] = [],
        ';
        // フォーカストラップに関する推奨
        if(this.results.trapDetections.length > 0') {'
            ';'
        }'
            recommendations.push('キーボードトラップが検出されました。すべてのモーダルやポップアップにエスケープ機能を実装してください。'); };
}
        ';
        // ショートカット競合に関する推奨
        if(this.results.shortcutConflicts.length > 0') {'
            ';'
        }'
            recommendations.push('ブラウザやシステムのショートカットと競合するキーバインドが検出されました。代替のキーバインドを検討してください。'); };
}
        // フォーカス順序に関する推奨
        const nonLogicalOrder = this.results.focusOrder.filter(item => item.tabIndex > 0);''
        if(nonLogicalOrder.length > 0') {'
            ';'
        }'
            recommendations.push('明示的なtabIndexの使用は避け、DOM順序に従った自然なフォーカス順序を維持してください。'); };
}
        // アクセシビリティラベルに関する推奨
        const unlabeledElements = this.results.focusOrder.filter(item => !item.isAccessible);
        if(unlabeledElements.length > 0) {
            
        }
            recommendations.push(`${unlabeledElements.length)個の要素にアクセシビリティラベルがありません。aria-labelまたはaria-labelledbyを追加してください。`});
        }
        
        this.results.recommendations = recommendations;
    }
    
    /**
     * レポートの生成
     */
    private async generateReport(): Promise<void>;
        const report = await this.reporter.generateReport({ results: this.results)
            config: this.config),
            timestamp: Date.now(),' };'
        }');'
        '';
        console.log('Keyboard navigation test report generated:', report.summary);
    }
    
    /**
     * イベントハンドラーのセットアップ'
     */''
    private setupEventHandlers()';
        this.eventHandler.on('keydown', (event: KeyboardEvent) => { this.handleKeyboardEvent(event);' }'
        }');
        ';
        // フォーカスイベントの委譲
        this.stateManager.on('focusChange', (element: HTMLElement) => { this.handleFocusChange(element); }
        });
    }
    
    /**
     * オブザーバーのセットアップ
     */
    private setupObservers(): void { // フォーカス変更の監視
        this.observers.focus = new MutationObserver((mutations) => { ''
            mutations.forEach(mutation => {');''
                if (mutation.type === 'attributes' && mutation.attributeName === 'tabindex') { }
                    this.stateManager.updateFocusableElements(); }
                }'
            });''
        }');
        ';'
        this.observers.focus.observe(document.body, { attributes: true,')'
            attributeFilter: ['tabindex'],);
            subtree: true),
        
        // DOM変更の監視
        this.observers.dom = new MutationObserver((mutations) => { ''
            mutations.forEach(mutation => {');''
                if (mutation.type === 'childList') { }
                    this.stateManager.updateFocusableElements(); };
}
            });
        });
        
        this.observers.dom.observe(document.body, { childList: true)
            subtree: true) }
        });
    }
    
    /**
     * デフォルトショートカットの登録'
     */''
    private registerDefaultShortcuts()';
            key: 'F7')';
            modifiers: []),'';
            handler: () => this.runFullTest()';
            description: 'Run keyboard navigation test'')';
        }'),
        
        // ナビゲーション支援ショートカット
        this.eventHandler.registerShortcut({ ')'
            key: 'F6',)';
            modifiers: []),'';
            handler: () => this.cycleLandmarks()';
            description: 'Cycle through landmarks') 
}
        }),
    }
    
    /**
     * キーボードイベントの処理
     */
    private handleKeyboardEvent(event: KeyboardEvent): void { if (!this.navigationState.isActive) return;
        
        // パフォーマンス計測
        const startTime = performance.now();
        
        // イベント処理（サブコンポーネントに委譲）
        const handled = this.eventHandler.handleEvent(event);
        
        // フォーカス時間の更新
        const focusTime = performance.now() - startTime;
        this.updateAverageFocusTime(focusTime); };
}
    /**
     * フォーカス変更の処理
     */
    private handleFocusChange(element: HTMLElement): void { this.navigationState.currentElement = element;
        this.navigationState.focusHistory.push(element);
        
        // 履歴の制限
        if(this.navigationState.focusHistory.length > 100) {
            
        }
            this.navigationState.focusHistory.shift(); };
}
    }
    
    /**
     * ランドマーク間の循環
     */
    private cycleLandmarks(): void { const landmarks = this.stateManager.getLandmarks();
        if (landmarks.length === 0) return;
        
        const currentIndex = landmarks.findIndex(l => l === document.activeElement);
        const nextIndex = (currentIndex + 1) % landmarks.length;
        
        landmarks[nextIndex].focus(); };
}
    /**
     * 平均フォーカス時間の更新
     */
    private updateAverageFocusTime(time: number): void { const metrics = this.results.performanceMetrics;
        const count = this.navigationState.focusHistory.length;
        
        metrics.averageFocusTime = ;
            (metrics.averageFocusTime * (count - 1) + time) / count; };
}
    // パブリックAPI
    
    /**
     * キーボードナビゲーションの有効化
     */
    enableNavigation(): void { this.navigationState.isActive = true;''
        this.stateManager.enable()';
        console.log('Keyboard navigation enabled'); };
}
    /**
     * キーボードナビゲーションの無効化
     */'
    disableNavigation(): void { this.navigationState.isActive = false;''
        this.stateManager.disable()';
        console.log('Keyboard navigation disabled'); };
}
    /**
     * 特定のテストスイートの実行
     */
    async runTestSuite(suiteName: keyof TestSuites, options: TestOptions = { ): Promise<SuiteResult> {
        const suite = this.testSuites[suiteName];
        if (!suite) { }
            throw new Error(`Test suite not found: ${suiteName)`});
        }
        
        return this.runTestSuite(suiteName, suite, options);
    }
    
    /**
     * ショートカットの登録
     */
    registerShortcut(key: string, modifiers: string[], handler: Function, description?: string): void { this.eventHandler.registerShortcut({
            key);
            modifiers)';
            handler,')';
            description)');'
        ' }'
        this.navigationState.shortcuts.set(`${modifiers.join('+'})}+${key}`, handler);
    }
    
    /**
     * ショートカットの削除
     */'
    unregisterShortcut(key: string, modifiers: string[]): void { ''
        this.eventHandler.unregisterShortcut(key, modifiers');' }'
        this.navigationState.shortcuts.delete(`${modifiers.join('+'})}+${key}`);
    }
    
    /**
     * フォーカス可能要素の取得
     */
    getFocusableElements(): HTMLElement[] { return this.stateManager.getFocusableElements(); };
}
    /**
     * 現在のフォーカス要素の取得
     */
    getCurrentFocus(): HTMLElement | null { return this.navigationState.currentElement; };
}
    /**
     * フォーカス履歴の取得
     */
    getFocusHistory(): HTMLElement[] { return [...this.navigationState.focusHistory]; };
}
    /**
     * テスト結果の取得
     */
    getResults(): TestResults {
        return { ...this.results };
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config: { keyboardNavigation?: Partial<TestConfig> ): void {
        if(config.keyboardNavigation) {
            Object.assign(this.config, config.keyboardNavigation);
            
            // サブコンポーネントへの設定伝播
            this.eventHandler.updateConfig({);
            this.stateManager.updateConfig({);'
        }'
            this.reporter.updateConfig({)'); }
        }'
        '';
        console.log('KeyboardNavigationTester configuration applied');
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled: boolean): void { this.config.enabled = enabled;
        
        if(enabled) {
        
            
        
        }
            this.enableNavigation(); }'
        } else {  ' }'
            this.disableNavigation() }'
        console.log(`KeyboardNavigationTester ${enabled ? 'enabled' : 'disabled')`});
    }
    
    /**
     * クリーンアップ'
     */''
    destroy()';
        console.log('Destroying KeyboardNavigationTester...');
        
        // ナビゲーションの無効化
        this.disableNavigation();
        
        // オブザーバーの停止
        if (this.observers.focus) { this.observers.focus.disconnect(); };
}
        if (this.observers.dom) { this.observers.dom.disconnect(); };
}
        // サブコンポーネントのクリーンアップ
        this.eventHandler.destroy();
        this.stateManager.destroy();''
        this.reporter.destroy()';
        console.log('KeyboardNavigationTester destroyed'');'
    }''
}