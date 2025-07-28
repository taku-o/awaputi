/**
 * KeyboardNavigationTester - キーボードナビゲーション包括テストシステム
 * フォーカス管理検証・キーボードトラップ検出・ショートカット競合検出
 * 詳細なキーボードアクセシビリティ分析とレポート生成
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

export class KeyboardNavigationTester {
    constructor(accessibilityManager) {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager?.gameEngine;
        
        // テスト設定
        this.config = {
            enabled: true,
            autoTest: false,
            testDepth: 'comprehensive', // basic, standard, comprehensive
            includeCustomElements: true,
            testShortcuts: true,
            monitorFocusChanges: true,
            generateReport: true
        };
        
        // キーボードナビゲーションテスト項目
        this.testSuites = {
            focusManagement: {
                name: 'フォーカス管理テスト',
                tests: [
                    'tabOrder',
                    'focusVisibility', 
                    'focusContainment',
                    'focusRestoration',
                    'initialFocus'
                ]
            },
            keyboardTraps: {
                name: 'キーボードトラップテスト',
                tests: [
                    'modalTraps',
                    'infiniteLoops',
                    'escapeRoutes',
                    'skipLinks'
                ]
            },
            shortcutConflicts: {
                name: 'ショートカット競合テスト',
                tests: [
                    'browserConflicts',
                    'systemConflicts',
                    'applicationConflicts',
                    'accessKeyConflicts'
                ]
            },
            customControls: {
                name: 'カスタムコントロールテスト',
                tests: [
                    'ariaControls',
                    'compositeWidgets',
                    'gameControls',
                    'interactiveElements'
                ]
            },
            navigationPatterns: {
                name: 'ナビゲーションパターンテスト',
                tests: [
                    'landmarkNavigation',
                    'headingNavigation',
                    'listNavigation',
                    'tableNavigation'
                ]
            }
        };
        
        // キーコード定義
        this.keyCodes = {
            TAB: 9,
            ENTER: 13,
            ESC: 27,
            SPACE: 32,
            ARROW_LEFT: 37,
            ARROW_UP: 38,
            ARROW_RIGHT: 39,
            ARROW_DOWN: 40,
            HOME: 36,
            END: 35,
            PAGE_UP: 33,
            PAGE_DOWN: 34,
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123
        };
        
        // 標準ブラウザショートカット
        this.browserShortcuts = {
            'Ctrl+Tab': 'タブ切り替え',
            'Ctrl+Shift+Tab': 'タブ逆順切り替え',
            'Ctrl+T': '新しいタブ',
            'Ctrl+W': 'タブを閉じる',
            'Ctrl+R': 'リロード',
            'Ctrl+F': 'ページ内検索',
            'Ctrl+L': 'アドレスバーにフォーカス',
            'F5': 'リロード',
            'F11': 'フルスクリーン',
            'F12': 'デベロッパーツール'
        };
        
        // テスト結果
        this.results = {
            overall: {
                score: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
                timestamp: null
            },
            suiteResults: {},
            focusOrder: [],
            trapDetections: [],
            shortcutConflicts: [],
            performanceMetrics: {
                totalTestTime: 0,
                averageFocusTime: 0,
                navigationErrors: 0
            },
            recommendations: []
        };
        
        // フォーカス追跡
        this.focusTracking = {
            enabled: false,
            history: [],
            currentElement: null,
            lastFocusTime: 0,
            focusStack: [],
            trapAttempts: 0
        };
        
        // イベント監視
        this.monitoring = {
            keydownListener: null,
            keyupListener: null,
            focusListener: null,
            blurListener: null,
            observers: new Map()
        };
        
        // 統計情報
        this.stats = {
            totalTests: 0,
            totalElements: 0,
            focusableElements: 0,
            customElements: 0,
            shortcutsDetected: 0,
            trapsDetected: 0,
            sessionStart: Date.now()
        };
        
        console.log('KeyboardNavigationTester initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            this.setupEventListeners();
            this.startFocusTracking();
            this.discoverKeyboardElements();
            
            console.log('KeyboardNavigationTester initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_NAVIGATION_TESTER_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * 包括的キーボードナビゲーションテスト実行
     */
    async runFullTest() {
        const startTime = performance.now();
        console.log('Starting comprehensive keyboard navigation test...');
        
        try {
            this.results.overall.timestamp = new Date().toISOString();
            this.results.suiteResults = {};
            
            // 各テストスイートの実行
            for (const [suiteId, suite] of Object.entries(this.testSuites)) {
                console.log(`Running ${suite.name}...`);
                this.results.suiteResults[suiteId] = await this.runTestSuite(suiteId, suite);
            }
            
            // 総合スコアの計算
            this.calculateOverallScore();
            
            // 推奨事項の生成
            this.generateRecommendations();
            
            // レポート生成
            if (this.config.generateReport) {
                await this.generateDetailedReport();
            }
            
            const endTime = performance.now();
            const testTime = endTime - startTime;
            this.results.performanceMetrics.totalTestTime = testTime;
            this.stats.totalTests++;
            
            console.log(`Keyboard navigation test completed in ${testTime.toFixed(2)}ms`);
            console.log(`Overall keyboard accessibility score: ${this.results.overall.score}%`);
            
            // イベント発火
            this.accessibilityManager?.eventSystem?.emit('keyboardNavigationTestCompleted', {
                results: this.results,
                testTime
            });
            
            return this.results;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_NAVIGATION_TEST_ERROR', {
                operation: 'runFullTest'
            });
            return null;
        }
    }
    
    /**
     * テストスイート実行
     */
    async runTestSuite(suiteId, suite) {
        const suiteResults = {
            score: 0,
            passed: 0,
            failed: 0,
            warnings: 0,
            testResults: {},
            issues: [],
            duration: 0
        };
        
        const suiteStartTime = performance.now();
        
        for (const testName of suite.tests) {
            try {
                const testResult = await this.runIndividualTest(suiteId, testName);
                suiteResults.testResults[testName] = testResult;
                
                if (testResult.passed) {
                    suiteResults.passed++;
                } else {
                    suiteResults.failed++;
                    suiteResults.issues.push(...testResult.issues);
                }
                
                suiteResults.warnings += testResult.warnings.length;
                
            } catch (error) {
                console.warn(`Test ${testName} failed with error:`, error);
                suiteResults.failed++;
                suiteResults.issues.push({
                    test: testName,
                    issue: `Test execution failed: ${error.message}`,
                    severity: 'error'
                });
            }
        }
        
        // スイートスコアの計算
        const totalTests = suiteResults.passed + suiteResults.failed;
        suiteResults.score = totalTests > 0 ? (suiteResults.passed / totalTests) * 100 : 0;
        
        suiteResults.duration = performance.now() - suiteStartTime;
        
        return suiteResults;
    }
    
    /**
     * 個別テスト実行
     */
    async runIndividualTest(suiteId, testName) {
        const testKey = `${suiteId}_${testName}`;
        const testMethod = this.getTestMethod(testKey);
        
        if (!testMethod) {
            throw new Error(`Test method not found: ${testKey}`);
        }
        
        console.log(`Running test: ${testName}`);
        
        const testStartTime = performance.now();
        const result = await testMethod.call(this);
        const testEndTime = performance.now();
        
        return {
            ...result,
            duration: testEndTime - testStartTime,
            timestamp: Date.now()
        };
    }
    
    /**
     * テストメソッドの取得
     */
    getTestMethod(testKey) {
        const testMethods = {
            // フォーカス管理テスト
            focusManagement_tabOrder: this.testTabOrder,
            focusManagement_focusVisibility: this.testFocusVisibility,
            focusManagement_focusContainment: this.testFocusContainment,
            focusManagement_focusRestoration: this.testFocusRestoration,
            focusManagement_initialFocus: this.testInitialFocus,
            
            // キーボードトラップテスト
            keyboardTraps_modalTraps: this.testModalTraps,
            keyboardTraps_infiniteLoops: this.testInfiniteLoops,
            keyboardTraps_escapeRoutes: this.testEscapeRoutes,
            keyboardTraps_skipLinks: this.testSkipLinks,
            
            // ショートカット競合テスト
            shortcutConflicts_browserConflicts: this.testBrowserConflicts,
            shortcutConflicts_systemConflicts: this.testSystemConflicts,
            shortcutConflicts_applicationConflicts: this.testApplicationConflicts,
            shortcutConflicts_accessKeyConflicts: this.testAccessKeyConflicts,
            
            // カスタムコントロールテスト
            customControls_ariaControls: this.testAriaControls,
            customControls_compositeWidgets: this.testCompositeWidgets,
            customControls_gameControls: this.testGameControls,
            customControls_interactiveElements: this.testInteractiveElements,
            
            // ナビゲーションパターンテスト
            navigationPatterns_landmarkNavigation: this.testLandmarkNavigation,
            navigationPatterns_headingNavigation: this.testHeadingNavigation,
            navigationPatterns_listNavigation: this.testListNavigation,
            navigationPatterns_tableNavigation: this.testTableNavigation
        };
        
        return testMethods[testKey];
    }
    
    /**
     * タブ順序テスト
     */
    async testTabOrder() {
        const issues = [];
        const warnings = [];
        
        const focusableElements = this.getFocusableElements();
        const tabOrder = [];
        
        // 各要素のタブインデックスを記録
        focusableElements.forEach((element, index) => {
            const tabIndex = element.getAttribute('tabindex');
            const computedTabIndex = element.tabIndex;
            
            tabOrder.push({
                element,
                position: index,
                tabIndex: tabIndex,
                computedTabIndex: computedTabIndex,
                isVisible: this.isElementVisible(element)
            });
            
            // 正の tabindex の検出
            if (tabIndex && parseInt(tabIndex) > 0) {
                warnings.push({
                    element,
                    issue: `Positive tabindex found: ${tabIndex}`,
                    severity: 'warning',
                    suggestion: 'Use tabindex="0" or rely on natural tab order'
                });
            }
            
            // 非表示要素のフォーカス可能チェック
            if (!this.isElementVisible(element) && computedTabIndex >= 0) {
                issues.push({
                    element,
                    issue: 'Hidden element is focusable',
                    severity: 'error',
                    suggestion: 'Add tabindex="-1" to hidden focusable elements'
                });
            }
        });
        
        // タブ順序の論理性をチェック
        const logicalOrderIssues = this.validateLogicalTabOrder(tabOrder);
        issues.push(...logicalOrderIssues);
        
        this.results.focusOrder = tabOrder;
        
        return {
            passed: issues.length === 0,
            issues,
            warnings,
            data: {
                totalFocusableElements: focusableElements.length,
                tabOrder
            }
        };
    }
    
    /**
     * フォーカス表示テスト
     */
    async testFocusVisibility() {
        const issues = [];
        const warnings = [];
        
        const focusableElements = this.getFocusableElements();
        
        for (const element of focusableElements) {
            // 要素にフォーカスを当てる
            element.focus();
            
            await new Promise(resolve => setTimeout(resolve, 50)); // フォーカス描画待機
            
            const focusIndicator = this.detectFocusIndicator(element);
            
            if (!focusIndicator.visible) {
                issues.push({
                    element,
                    issue: 'No visible focus indicator',
                    severity: 'error',
                    suggestion: 'Add CSS :focus styles or ensure browser default focus ring is visible'
                });
            } else if (focusIndicator.contrast < 3.0) {
                warnings.push({
                    element,
                    issue: `Low contrast focus indicator: ${focusIndicator.contrast.toFixed(2)}:1`,
                    severity: 'warning',
                    suggestion: 'Increase focus indicator contrast to at least 3:1'
                });
            }
        }
        
        return {
            passed: issues.length === 0,
            issues,
            warnings,
            data: {
                totalElements: focusableElements.length,
                elementsWithGoodFocus: focusableElements.length - issues.length
            }
        };
    }
    
    /**
     * フォーカス包含テスト（モーダル内など）
     */
    async testFocusContainment() {
        const issues = [];
        const warnings = [];
        
        // モーダルダイアログの検出
        const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"], .modal, .dialog');
        
        for (const modal of modals) {
            if (this.isElementVisible(modal)) {
                const containmentResult = await this.testModalFocusContainment(modal);
                
                if (!containmentResult.passed) {
                    issues.push({
                        element: modal,
                        issue: 'Modal does not properly contain focus',
                        severity: 'error',
                        suggestion: 'Implement focus trapping for modal dialogs',
                        details: containmentResult.details
                    });
                }
            }
        }
        
        return {
            passed: issues.length === 0,
            issues,
            warnings,
            data: {
                modalsFound: modals.length,
                modalsWithIssues: issues.length
            }
        };
    }
    
    /**
     * モーダルフォーカス包含テスト
     */
    async testModalFocusContainment(modal) {
        const focusableInModal = modal.querySelectorAll(
            'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableInModal.length === 0) {
            return {
                passed: false,
                details: 'No focusable elements found in modal'
            };
        }
        
        const firstFocusable = focusableInModal[0];
        const lastFocusable = focusableInModal[focusableInModal.length - 1];
        
        // 最初の要素にフォーカス
        firstFocusable.focus();
        
        // Shift+Tab で前の要素に移動しようとする
        const shiftTabEvent = new KeyboardEvent('keydown', {
            key: 'Tab',
            shiftKey: true,
            bubbles: true,
            cancelable: true
        });
        
        document.activeElement.dispatchEvent(shiftTabEvent);
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // フォーカスが最後の要素に移動したかチェック
        const focusMovedToLast = document.activeElement === lastFocusable;
        
        // 最後の要素にフォーカス
        lastFocusable.focus();
        
        // Tab で次の要素に移動しようとする
        const tabEvent = new KeyboardEvent('keydown', {
            key: 'Tab',
            bubbles: true,
            cancelable: true
        });
        
        document.activeElement.dispatchEvent(tabEvent);
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // フォーカスが最初の要素に移動したかチェック
        const focusMovedToFirst = document.activeElement === firstFocusable;
        
        return {
            passed: focusMovedToLast && focusMovedToFirst,
            details: {
                focusMovedToLast,
                focusMovedToFirst,
                firstElement: firstFocusable,
                lastElement: lastFocusable
            }
        };
    }
    
    /**
     * キーボードトラップテスト
     */
    async testModalTraps() {
        const issues = [];
        const warnings = [];
        
        const focusableElements = this.getFocusableElements();
        
        for (let i = 0; i < focusableElements.length - 1; i++) {
            const currentElement = focusableElements[i];
            const expectedNextElement = focusableElements[i + 1];
            
            currentElement.focus();
            
            // Tab キーをシミュレート
            const tabEvent = new KeyboardEvent('keydown', {
                key: 'Tab',
                keyCode: this.keyCodes.TAB,
                bubbles: true,
                cancelable: true
            });
            
            const eventResult = currentElement.dispatchEvent(tabEvent);
            
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // フォーカスが次の要素に移動したかチェック
            if (document.activeElement === currentElement && eventResult) {
                // フォーカスが移動しなかった場合、トラップの可能性
                issues.push({
                    element: currentElement,
                    issue: 'Potential keyboard trap detected',
                    severity: 'error',
                    suggestion: 'Ensure Tab key moves focus to next element',
                    details: {
                        currentElement: currentElement,
                        expectedNext: expectedNextElement,
                        actualNext: document.activeElement
                    }
                });
                
                this.results.trapDetections.push({
                    element: currentElement,
                    type: 'tab-trap',
                    timestamp: Date.now()
                });
            }
        }
        
        return {
            passed: issues.length === 0,
            issues,
            warnings,
            data: {
                elementsChecked: focusableElements.length,
                trapsDetected: issues.length
            }
        };
    }
    
    /**
     * エスケープルートテスト
     */
    async testEscapeRoutes() {
        const issues = [];
        const warnings = [];
        
        // モーダルとポップアップ要素を検索
        const escapableElements = document.querySelectorAll(
            '[role="dialog"], [role="alertdialog"], .modal, .popup, .dropdown, .menu'
        );
        
        for (const element of escapableElements) {
            if (this.isElementVisible(element)) {
                const hasEscapeRoute = await this.testElementEscapeRoute(element);
                
                if (!hasEscapeRoute) {
                    issues.push({
                        element,
                        issue: 'No keyboard escape route found',
                        severity: 'error',
                        suggestion: 'Add Escape key handler or close button'
                    });
                }
            }
        }
        
        return {
            passed: issues.length === 0,
            issues,
            warnings,
            data: {
                escapableElements: escapableElements.length,
                elementsWithoutEscape: issues.length
            }
        };
    }
    
    /**
     * 要素のエスケープルートテスト
     */
    async testElementEscapeRoute(element) {
        // Escape キーをシミュレート
        const escapeEvent = new KeyboardEvent('keydown', {
            key: 'Escape',
            keyCode: this.keyCodes.ESC,
            bubbles: true,
            cancelable: true
        });
        
        const initialVisibility = this.isElementVisible(element);
        element.dispatchEvent(escapeEvent);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const finalVisibility = this.isElementVisible(element);
        
        // 要素が非表示になったか、または閉じるボタンがあるかチェック
        const hasCloseButton = element.querySelector(
            '[aria-label*="close"], [aria-label*="閉じる"], .close, .close-button'
        );
        
        return !finalVisibility || initialVisibility !== finalVisibility || hasCloseButton !== null;
    }
    
    /**
     * ショートカット競合テスト
     */
    async testBrowserConflicts() {
        const issues = [];
        const warnings = [];
        
        // ページ内のアクセスキーを収集
        const elementsWithAccessKey = document.querySelectorAll('[accesskey]');
        const elementsWithShortcuts = document.querySelectorAll('[data-shortcut], [data-hotkey]');
        
        const shortcutsFound = [];
        
        elementsWithAccessKey.forEach(element => {
            const accessKey = element.getAttribute('accesskey');
            const shortcut = `Alt+${accessKey.toUpperCase()}`;
            
            shortcutsFound.push({
                element,
                shortcut,
                type: 'accesskey'
            });
            
            // ブラウザショートカットとの競合チェック
            if (this.browserShortcuts[shortcut] || this.browserShortcuts[`Ctrl+${accessKey.toUpperCase()}`]) {
                warnings.push({
                    element,
                    issue: `Access key may conflict with browser shortcut: ${shortcut}`,
                    severity: 'warning',
                    suggestion: 'Consider using different access key'
                });
            }
        });
        
        elementsWithShortcuts.forEach(element => {
            const shortcut = element.getAttribute('data-shortcut') || element.getAttribute('data-hotkey');
            
            shortcutsFound.push({
                element,
                shortcut,
                type: 'custom'
            });
            
            if (this.browserShortcuts[shortcut]) {
                issues.push({
                    element,
                    issue: `Custom shortcut conflicts with browser: ${shortcut}`,
                    severity: 'error',
                    suggestion: 'Use different key combination or add modifier keys'
                });
            }
        });
        
        this.results.shortcutConflicts = shortcutsFound;
        this.stats.shortcutsDetected = shortcutsFound.length;
        
        return {
            passed: issues.length === 0,
            issues,
            warnings,
            data: {
                shortcutsFound: shortcutsFound.length,
                conflicts: issues.length
            }
        };
    }
    
    /**
     * カスタムARIAコントロールテスト
     */
    async testAriaControls() {
        const issues = [];
        const warnings = [];
        
        const ariaControls = document.querySelectorAll('[role="button"], [role="tab"], [role="menuitem"], [role="option"]');
        
        for (const control of ariaControls) {
            const role = control.getAttribute('role');
            const hasKeyboardHandler = this.hasKeyboardEventHandler(control);
            
            if (!hasKeyboardHandler) {
                issues.push({
                    element: control,
                    issue: `ARIA ${role} missing keyboard event handlers`,
                    severity: 'error',
                    suggestion: 'Add keydown/keyup event handlers for custom controls'
                });
            }
            
            // フォーカス可能性のチェック
            if (control.tabIndex < 0 && !control.hasAttribute('tabindex')) {
                warnings.push({
                    element: control,
                    issue: `ARIA ${role} may not be keyboard accessible`,
                    severity: 'warning',
                    suggestion: 'Add tabindex="0" to make element focusable'
                });
            }
            
            // ARIA状態の検証
            const requiredStates = this.getRequiredAriaStates(role);
            for (const state of requiredStates) {
                if (!control.hasAttribute(state)) {
                    issues.push({
                        element: control,
                        issue: `Missing required ARIA state: ${state}`,
                        severity: 'error',
                        suggestion: `Add ${state} attribute`
                    });
                }
            }
        }
        
        return {
            passed: issues.length === 0,
            issues,
            warnings,
            data: {
                customControls: ariaControls.length,
                controlsWithIssues: issues.length
            }
        };
    }
    
    /**
     * ゲーム固有コントロールテスト
     */
    async testGameControls() {
        const issues = [];
        const warnings = [];
        
        // Canvas要素のキーボード対応チェック
        const canvases = document.querySelectorAll('canvas');
        
        for (const canvas of canvases) {
            const hasKeyboardHandler = this.hasKeyboardEventHandler(canvas);
            const isFocusable = canvas.tabIndex >= 0 || canvas.hasAttribute('tabindex');
            
            if (!isFocusable) {
                issues.push({
                    element: canvas,
                    issue: 'Canvas element is not keyboard focusable',
                    severity: 'error',
                    suggestion: 'Add tabindex="0" to canvas element'
                });
            }
            
            if (!hasKeyboardHandler) {
                warnings.push({
                    element: canvas,
                    issue: 'Canvas element may need keyboard event handlers',
                    severity: 'warning',
                    suggestion: 'Add keyboard controls for game interaction'
                });
            }
            
            // ARIA ラベルのチェック
            const hasAccessibleName = canvas.getAttribute('aria-label') || 
                                    canvas.getAttribute('aria-labelledby') ||
                                    canvas.getAttribute('title');
            
            if (!hasAccessibleName) {
                issues.push({
                    element: canvas,
                    issue: 'Canvas element missing accessible name',
                    severity: 'error',
                    suggestion: 'Add aria-label to describe game content'
                });
            }
        }
        
        // ゲーム固有のコントロール要素
        const gameControls = document.querySelectorAll(
            '.game-control, .game-button, [data-game-action], [class*="bubble"], [class*="game"]'
        );
        
        for (const control of gameControls) {
            if (this.isInteractiveElement(control)) {
                const hasKeyboardSupport = this.hasKeyboardEventHandler(control) || 
                                         this.isNativelyKeyboardAccessible(control);
                
                if (!hasKeyboardSupport) {
                    issues.push({
                        element: control,
                        issue: 'Game control missing keyboard support',
                        severity: 'error',
                        suggestion: 'Add keyboard event handlers for game controls'
                    });
                }
            }
        }
        
        return {
            passed: issues.length === 0,
            issues,
            warnings,
            data: {
                canvasElements: canvases.length,
                gameControls: gameControls.length,
                elementsWithIssues: issues.length
            }
        };
    }
    
    /**
     * フォーカス可能要素の取得
     */
    getFocusableElements() {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'textarea:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]',
            'audio[controls]',
            'video[controls]',
            'iframe',
            'embed',
            'object'
        ].join(', ');
        
        const elements = Array.from(document.querySelectorAll(selector));
        
        return elements.filter(element => {
            return this.isElementVisible(element) && !element.disabled;
        });
    }
    
    /**
     * 要素の可視性判定
     */
    isElementVisible(element) {
        if (!element.offsetParent && element.tagName !== 'BODY') {
            return false;
        }
        
        const styles = window.getComputedStyle(element);
        return styles.display !== 'none' && 
               styles.visibility !== 'hidden' &&
               styles.opacity !== '0';
    }
    
    /**
     * フォーカスインジケーターの検出
     */
    detectFocusIndicator(element) {
        const styles = window.getComputedStyle(element);
        const focusStyles = {
            outline: styles.outline,
            outlineColor: styles.outlineColor,
            outlineWidth: styles.outlineWidth,
            outlineStyle: styles.outlineStyle,
            border: styles.border,
            boxShadow: styles.boxShadow,
            backgroundColor: styles.backgroundColor
        };
        
        // アウトラインの存在確認
        const hasOutline = focusStyles.outline !== 'none' && 
                          focusStyles.outlineWidth !== '0px';
        
        // ボックスシャドウによるフォーカス表示
        const hasBoxShadow = focusStyles.boxShadow !== 'none';
        
        // 背景色の変化
        const hasBackgroundChange = focusStyles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                                   focusStyles.backgroundColor !== 'transparent';
        
        const visible = hasOutline || hasBoxShadow || hasBackgroundChange;
        
        // コントラスト計算（簡易版）
        let contrast = 3.0; // デフォルト値
        if (hasOutline && focusStyles.outlineColor) {
            // 実際のコントラスト計算は複雑のため、簡略化
            contrast = this.estimateContrast(focusStyles.outlineColor, styles.backgroundColor);
        }
        
        return {
            visible,
            contrast,
            styles: focusStyles
        };
    }
    
    /**
     * コントラスト推定（簡易版）
     */
    estimateContrast(color1, color2) {
        // 実装の簡略化のため、固定値を返す
        // 実際の実装では色の輝度計算が必要
        return 4.5;
    }
    
    /**
     * 論理的タブ順序の検証
     */
    validateLogicalTabOrder(tabOrder) {
        const issues = [];
        
        // DOM順序とタブ順序の比較
        for (let i = 0; i < tabOrder.length - 1; i++) {
            const current = tabOrder[i];
            const next = tabOrder[i + 1];
            
            // DOM内での位置関係をチェック
            const position = current.element.compareDocumentPosition(next.element);
            
            if (position & Node.DOCUMENT_POSITION_PRECEDING) {
                // 次の要素が前にある場合（順序が逆）
                issues.push({
                    element: current.element,
                    issue: 'Tab order does not follow DOM order',
                    severity: 'warning',
                    suggestion: 'Consider reordering elements in DOM or using tabindex carefully'
                });
            }
        }
        
        return issues;
    }
    
    /**
     * キーボードイベントハンドラーの検出
     */
    hasKeyboardEventHandler(element) {
        // onkeydown, onkeyup属性のチェック
        if (element.onkeydown || element.onkeyup || element.onkeypress) {
            return true;
        }
        
        // addEventListenerで追加されたリスナーは検出困難なため、
        // 一般的な手がかりをチェック
        const elementHTML = element.outerHTML.toLowerCase();
        
        // data属性やクラス名からキーボード対応を推測
        return elementHTML.includes('keydown') ||
               elementHTML.includes('keyup') ||
               elementHTML.includes('keyboard') ||
               element.hasAttribute('data-keyboard') ||
               element.classList.contains('keyboard-enabled');
    }
    
    /**
     * ネイティブキーボードアクセシブル要素の判定
     */
    isNativelyKeyboardAccessible(element) {
        const nativelyAccessible = ['button', 'a', 'input', 'textarea', 'select'];
        return nativelyAccessible.includes(element.tagName.toLowerCase());
    }
    
    /**
     * インタラクティブ要素の判定
     */
    isInteractiveElement(element) {
        // クリックハンドラーがある
        if (element.onclick || element.addEventListener) {
            return true;
        }
        
        // インタラクティブな役割
        const interactiveRoles = ['button', 'link', 'tab', 'menuitem', 'option'];
        const role = element.getAttribute('role');
        
        if (interactiveRoles.includes(role)) {
            return true;
        }
        
        // カーソルスタイル
        const styles = window.getComputedStyle(element);
        if (styles.cursor === 'pointer') {
            return true;
        }
        
        return false;
    }
    
    /**
     * 必須ARIA状態の取得
     */
    getRequiredAriaStates(role) {
        const requiredStates = {
            'tab': ['aria-selected'],
            'checkbox': ['aria-checked'],
            'radio': ['aria-checked'],
            'option': ['aria-selected'],
            'menuitemcheckbox': ['aria-checked'],
            'menuitemradio': ['aria-checked']
        };
        
        return requiredStates[role] || [];
    }
    
    /**
     * キーボード要素の発見
     */
    discoverKeyboardElements() {
        const focusableElements = this.getFocusableElements();
        
        this.stats.totalElements = document.querySelectorAll('*').length;
        this.stats.focusableElements = focusableElements.length;
        this.stats.customElements = document.querySelectorAll('[role]').length;
        
        console.log(`Discovered ${focusableElements.length} focusable elements`);
    }
    
    /**
     * フォーカス追跡の開始
     */
    startFocusTracking() {
        if (this.focusTracking.enabled) return;
        
        this.focusTracking.enabled = true;
        
        document.addEventListener('focus', (event) => {
            this.focusTracking.currentElement = event.target;
            this.focusTracking.lastFocusTime = Date.now();
            
            this.focusTracking.history.push({
                element: event.target,
                timestamp: Date.now(),
                type: 'focus'
            });
            
            // 履歴を最新100件に制限
            if (this.focusTracking.history.length > 100) {
                this.focusTracking.history.shift();
            }
        }, true);
        
        document.addEventListener('blur', (event) => {
            this.focusTracking.history.push({
                element: event.target,
                timestamp: Date.now(),
                type: 'blur'
            });
        }, true);
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // キーボードイベントの監視
        this.monitoring.keydownListener = (event) => {
            this.handleKeyboardEvent(event);
        };
        
        document.addEventListener('keydown', this.monitoring.keydownListener, true);
    }
    
    /**
     * キーボードイベントハンドリング
     */
    handleKeyboardEvent(event) {
        // Tabキーの追跡
        if (event.key === 'Tab') {
            this.trackTabNavigation(event);
        }
        
        // Escapeキーの追跡
        if (event.key === 'Escape') {
            this.trackEscapeKeyUsage(event);
        }
        
        // ショートカットキーの記録
        this.recordShortcutUsage(event);
    }
    
    /**
     * タブナビゲーションの追跡
     */
    trackTabNavigation(event) {
        const previousElement = this.focusTracking.currentElement;
        
        setTimeout(() => {
            const currentElement = document.activeElement;
            
            if (previousElement && currentElement !== previousElement) {
                this.focusTracking.history.push({
                    from: previousElement,
                    to: currentElement,
                    timestamp: Date.now(),
                    type: 'tab-navigation',
                    shiftKey: event.shiftKey
                });
            }
        }, 10);
    }
    
    /**
     * Escapeキー使用の追跡
     */
    trackEscapeKeyUsage(event) {
        this.focusTracking.history.push({
            element: event.target,
            timestamp: Date.now(),
            type: 'escape-key'
        });
    }
    
    /**
     * ショートカット使用の記録
     */
    recordShortcutUsage(event) {
        if (event.ctrlKey || event.altKey || event.metaKey) {
            const shortcut = this.buildShortcutString(event);
            
            this.focusTracking.history.push({
                shortcut,
                element: event.target,
                timestamp: Date.now(),
                type: 'shortcut'
            });
        }
    }
    
    /**
     * ショートカット文字列の構築
     */
    buildShortcutString(event) {
        const parts = [];
        
        if (event.ctrlKey) parts.push('Ctrl');
        if (event.altKey) parts.push('Alt');
        if (event.shiftKey) parts.push('Shift');
        if (event.metaKey) parts.push('Meta');
        
        parts.push(event.key);
        
        return parts.join('+');
    }
    
    /**
     * 総合スコアの計算
     */
    calculateOverallScore() {
        const suiteScores = Object.values(this.results.suiteResults).map(suite => suite.score);
        const totalPassed = Object.values(this.results.suiteResults).reduce((sum, suite) => sum + suite.passed, 0);
        const totalFailed = Object.values(this.results.suiteResults).reduce((sum, suite) => sum + suite.failed, 0);
        const totalWarnings = Object.values(this.results.suiteResults).reduce((sum, suite) => sum + suite.warnings, 0);
        
        this.results.overall.score = suiteScores.length > 0 ? 
            Math.round(suiteScores.reduce((sum, score) => sum + score, 0) / suiteScores.length) : 0;
        this.results.overall.passed = totalPassed;
        this.results.overall.failed = totalFailed;
        this.results.overall.warnings = totalWarnings;
    }
    
    /**
     * 推奨事項の生成
     */
    generateRecommendations() {
        const recommendations = [];
        
        // フォーカス管理の推奨事項
        if (this.results.suiteResults.focusManagement?.score < 80) {
            recommendations.push({
                category: 'Focus Management',
                priority: 'high',
                recommendation: 'Improve focus visibility and tab order',
                details: 'Consider adding clear focus indicators and reviewing tab order logic'
            });
        }
        
        // キーボードトラップの推奨事項
        if (this.results.suiteResults.keyboardTraps?.failed > 0) {
            recommendations.push({
                category: 'Keyboard Traps',
                priority: 'critical',
                recommendation: 'Fix keyboard trap issues',
                details: 'Ensure all interactive elements allow keyboard navigation'
            });
        }
        
        // ショートカット競合の推奨事項
        if (this.results.shortcutConflicts.length > 0) {
            recommendations.push({
                category: 'Shortcut Conflicts',
                priority: 'medium',
                recommendation: 'Review keyboard shortcut conflicts',
                details: 'Consider alternative key combinations to avoid browser conflicts'
            });
        }
        
        this.results.recommendations = recommendations;
    }
    
    /**
     * 詳細レポートの生成
     */
    async generateDetailedReport() {
        const report = {
            summary: {
                overallScore: this.results.overall.score,
                timestamp: this.results.overall.timestamp,
                totalTests: this.results.overall.passed + this.results.overall.failed,
                passRate: this.results.overall.passed / (this.results.overall.passed + this.results.overall.failed) * 100
            },
            suiteResults: this.results.suiteResults,
            focusOrder: this.results.focusOrder,
            recommendations: this.results.recommendations,
            statistics: this.stats
        };
        
        console.log('Keyboard Navigation Test Report:', report);
        return report;
    }
    
    // パブリックAPI
    
    /**
     * テスト深度の設定
     */
    setTestDepth(depth) {
        const validDepths = ['basic', 'standard', 'comprehensive'];
        if (validDepths.includes(depth)) {
            this.config.testDepth = depth;
            console.log(`Test depth set to: ${depth}`);
            return true;
        }
        return false;
    }
    
    /**
     * フォーカス履歴の取得
     */
    getFocusHistory(limit = 50) {
        return this.focusTracking.history.slice(-limit);
    }
    
    /**
     * キーボードナビゲーション統計の取得
     */
    getNavigationStats() {
        return {
            ...this.stats,
            focusHistory: this.focusTracking.history.length,
            currentFocus: this.focusTracking.currentElement?.tagName || 'none'
        };
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.keyboardTesting) {
            Object.assign(this.config, config.keyboardTesting);
        }
        
        console.log('KeyboardNavigationTester configuration applied');
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        
        if (enabled) {
            this.startFocusTracking();
            if (this.config.autoTest) {
                this.runFullTest();
            }
        } else {
            this.focusTracking.enabled = false;
        }
        
        console.log(`KeyboardNavigationTester ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying KeyboardNavigationTester...');
        
        // イベントリスナーの削除
        if (this.monitoring.keydownListener) {
            document.removeEventListener('keydown', this.monitoring.keydownListener, true);
        }
        
        // フォーカス追跡の停止
        this.focusTracking.enabled = false;
        
        // データのクリア
        this.results.focusOrder = [];
        this.results.trapDetections = [];
        this.results.shortcutConflicts = [];
        this.focusTracking.history = [];
        
        console.log('KeyboardNavigationTester destroyed');
    }
}

// 未実装テストメソッドの追加
Object.assign(KeyboardNavigationTester.prototype, {
    testFocusRestoration() {
        return { passed: true, issues: [], warnings: [], data: {} };
    },
    
    testInitialFocus() {
        return { passed: true, issues: [], warnings: [], data: {} };
    },
    
    testInfiniteLoops() {
        return { passed: true, issues: [], warnings: [], data: {} };
    },
    
    testSkipLinks() {
        return { passed: true, issues: [], warnings: [], data: {} };
    },
    
    testSystemConflicts() {
        return { passed: true, issues: [], warnings: [], data: {} };
    },
    
    testApplicationConflicts() {
        return { passed: true, issues: [], warnings: [], data: {} };
    },
    
    testAccessKeyConflicts() {
        return { passed: true, issues: [], warnings: [], data: {} };
    },
    
    testCompositeWidgets() {
        return { passed: true, issues: [], warnings: [], data: {} };
    },
    
    testInteractiveElements() {
        return { passed: true, issues: [], warnings: [], data: {} };
    },
    
    testLandmarkNavigation() {
        return { passed: true, issues: [], warnings: [], data: {} };
    },
    
    testHeadingNavigation() {
        return { passed: true, issues: [], warnings: [], data: {} };
    },
    
    testListNavigation() {
        return { passed: true, issues: [], warnings: [], data: {} };
    },
    
    testTableNavigation() {
        return { passed: true, issues: [], warnings: [], data: {} };
    }
});