/**
 * NavigationStateManager
 * フォーカス状態管理とナビゲーション制御機能を提供
 * - フォーカス状態追跡
 * - タブ順序計算と検証
 * - フォーカス包含テスト
 * - フォーカス復元検証
 */

import { getErrorHandler } from '../../core/ErrorHandler.js';

// Interfaces for navigation state management
interface StateManagerConfig { enabled: boolean,
    trackFocusHistory: boolean;
    validateTabOrder: boolean;
    monitorContainment: boolean;
    maxHistoryLength: number ,}

interface FocusTracking { enabled: boolean;
    history: FocusEvent[];
    currentElement: Element | null;
    lastFocusTime: number;
    focusStack: Element[];
    trapAttempts: number }

interface FocusEvent { element: Element;
    type: string;
    timestamp: number;
    tagName: string;
    id: string | null;
    className: string | null;
    role: string | null }

interface TabOrderData { elements: TabElement[];
    issues: TabOrderIssue[];
    lastValidation: number | null }

interface TabElement { element: Element;
    position: number;
    tabIndex: string | null;
    computedTabIndex: number;
    isVisible: boolean;
    rect: DOMRect
    }

interface TabOrderIssue { element?: Element;
    type: string,
    severity: 'error' | 'warning';
    message: string;
    suggestion?: string;
    details?: any; ,}

interface ContainmentState { activeContainers: Set<Element>,
    containerStack: Element[];
    escapeAttempts: number ,}

interface NavigationStats { totalFocusChanges: number;
    tabNavigations: number;
    focusRestorations: number;
    containmentViolations: number;
    sessionStart: number }

interface TabOrderValidationResult { passed: boolean;
    issues: TabOrderIssue[];
    tabOrder?: TabElement[];
    summary?: {
        totalElements: number;
        visibleElements: number;
        elementsWithTabIndex: number;
        positiveTabIndex: number }

interface ContainmentResult { element: Element,
    passed: boolean;
    details: any;
    focusableElements: Element[]
    ,}

interface ContainmentTestResults { passed: boolean;
    issues: TabOrderIssue[];
    warnings: TabOrderIssue[];
    containers: ContainmentResult[]
    }

interface RestorationTestResult { element: Element;
    passed: boolean;
    details: any }

interface RestorationTestResults { passed: boolean;
    issues: TabOrderIssue[];
    restorationTests: RestorationTestResult[]
    }

interface FocusInfo { element: Element | null;
    lastFocusTime: number;
    activeElement: Element | null }

interface TabOrderInfo { elements: TabElement[];
    issues: TabOrderIssue[];
    lastValidation: number | null;
    isValid: boolean }

interface NavigationStatsInfo { totalFocusChanges: number;
    tabNavigations: number;
    focusRestorations: number;
    containmentViolations: number;
    sessionStart: number;
    focusHistoryLength: number;
    currentFocus: string;
    activeContainers: number }

interface SimulationResult { success: boolean;
    activeElement?: Element | null }

export class NavigationStateManager {
    private config: StateManagerConfig;
    private focusTracking: FocusTracking;
    private tabOrderData: TabOrderData;
    private containmentState: ContainmentState;
    private stats: NavigationStats;
    constructor(config: Partial<StateManagerConfig> = {) {

        this.config = {
            enabled: true;
            trackFocusHistory: true;
            validateTabOrder: true;
            monitorContainment: true;
            maxHistoryLength: 100;
    }
            ...config
        };
        
        // フォーカス追跡
        this.focusTracking = { enabled: false,
            history: [];
            currentElement: null;
            lastFocusTime: 0;
            focusStack: [];
            trapAttempts: 0 ,};
        // タブ順序管理
        this.tabOrderData = { elements: [],
            issues: [];
            lastValidation: null ,};
        // フォーカス包含状態
        this.containmentState = { activeContainers: new Set(),
            containerStack: [];
            escapeAttempts: 0 ,};
        // ナビゲーション統計
        this.stats = { totalFocusChanges: 0,
            tabNavigations: 0;
            focusRestorations: 0;
            containmentViolations: 0,
            sessionStart: Date.now()';
        console.log('NavigationStateManager, initialized'), }'
    
    /**
     * フォーカス追跡の開始
     */'
    startFocusTracking(): void { ''
        if(this.focusTracking.enabled || !this.config.enabled) return;
        
        try {
            this.focusTracking.enabled = true;
            ';
            // フォーカスイベントリスナー
            document.addEventListener('focus', (event) => { ''
                if(event.target) {' }'

                    this.handleFocusChange(event.target as Element, 'focus); }'

                }''
            }, true');

            document.addEventListener('blur', (event) => {  ''
                if(event.target) {' }'

                    this.handleFocusChange(event.target as Element, 'blur); }'

                }''
            }, true');

            console.log('Focus, tracking started');
            ';

        } catch (error) { getErrorHandler(').handleError(error, 'FOCUS_TRACKING_START_ERROR', {)'
                component: 'NavigationStateManager' ,});
        }
    }
    
    /**
     * フォーカス変更の処理
     */
    private handleFocusChange(element: Element, type: string): void { if (!this.config.trackFocusHistory) return;
        ';

        try {'
            const now = Date.now()';
            if(type === 'focus'') {
                this.focusTracking.currentElement = element;
                this.focusTracking.lastFocusTime = now;
            }
                this.stats.totalFocusChanges++; }
            }
            
            // フォーカス履歴の記録
            const focusEvent: FocusEvent = { element,
                type,
                timestamp: now;
                tagName: element.tagName;
                id: element.id || null;
                className: element.className || null,
                role: element.getAttribute('role) || null ,};
            this.focusTracking.history.push(focusEvent);
            
            // 履歴長制限
            if(this.focusTracking.history.length > this.config.maxHistoryLength) {

                this.focusTracking.history.shift()';
            if(type === 'focus) {'
            }
                this.checkFocusContainment(element); }

            } catch (error) { getErrorHandler(').handleError(error, 'FOCUS_CHANGE_HANDLING_ERROR', {)'
                component: 'NavigationStateManager');
                type,);
                element: element.tagName ,});
        }
    }
    
    /**
     * タブ順序の計算と検証
     */
    validateTabOrder(): TabOrderValidationResult {
        if (!this.config.validateTabOrder) return { passed: true, issues: [] ,}
        try { const focusableElements = this.getFocusableElements();
            const tabOrderIssues: TabOrderIssue[] = [],
            const tabOrder: TabElement[] = [],
            // 各要素のタブインデックスを記録
            focusableElements.forEach((element, index) => { ''
                const tabIndex = element.getAttribute('tabindex);
                const computedTabIndex = (element, as HTMLElement).tabIndex;
                const isVisible = this.isElementVisible(element);
                
                const tabData: TabElement = {
                    element,
                    position: index;
                    tabIndex: tabIndex;
                    computedTabIndex: computedTabIndex;
                    isVisible, }
                    rect: element.getBoundingClientRect(); }
                };
                
                tabOrder.push(tabData);
                ';
                // 正のtabindexの検出
                if (tabIndex && parseInt(tabIndex) > 0') { tabOrderIssues.push({'
                        element,
                        type: 'positive-tabindex',
                        severity: 'warning', })'
                        message: `Positive tabindex found: ${tabIndex}`,')'
                        suggestion: 'Use tabindex = "0" or rely on natural tab order') }
                ';
                // 非表示要素のフォーカス可能チェック
                if(!isVisible && computedTabIndex >= 0) { tabOrderIssues.push({'
                        element,
                        type: 'hidden-focusable',
                        severity: 'error',)';
                        message: 'Hidden element is focusable',' }

                        suggestion: 'Add tabindex="-1" to hidden focusable elements'); }
});
            
            // 論理的タブ順序の検証
            const logicalOrderIssues = this.validateLogicalTabOrder(tabOrder);
            tabOrderIssues.push(...logicalOrderIssues);
            
            // 結果の保存
            this.tabOrderData = { elements: tabOrder,
                issues: tabOrderIssues,
                lastValidation: Date.now()';
                passed: tabOrderIssues.filter(issue => issue.severity === 'error).length === 0;
                issues: tabOrderIssues;
                tabOrder,
                summary: {
                    totalElements: focusableElements.length;
                    visibleElements: tabOrder.filter(t => t.isVisible).length;
                    elementsWithTabIndex: tabOrder.filter(t => t.tabIndex !== null).length;
                    positiveTabIndex: tabOrder.filter(t => t.tabIndex && parseInt(t.tabIndex) > 0).length ,}
};
            ';

        } catch (error) {
            getErrorHandler(').handleError(error, 'TAB_ORDER_VALIDATION_ERROR', {)'
                component: 'NavigationStateManager'),' }

            }');
            
            return { passed: false,

                issues: [{''
                    type: 'validation-error',' };

                    severity: 'error', }]
                    message: `Tab order validation failed: ${(error, as Error}).message}`]
                }]
            }
    }
    
    /**
     * 論理的タブ順序の検証
     */
    private validateLogicalTabOrder(tabOrder: TabElement[]): TabOrderIssue[] { const issues: TabOrderIssue[] = [],
        
        try {
            for(let, i = 0; i < tabOrder.length - 1; i++) {
                const current = tabOrder[i];
                const next = tabOrder[i + 1];
                
                // DOM内での位置関係をチェック
                const position = current.element.compareDocumentPosition(next.element);

                if(position & Node.DOCUMENT_POSITION_PRECEDING) {
                    // 次の要素が前にある場合（順序が逆）
                    issues.push({
                        element: current.element,
                        type: 'tab-order-mismatch',
                        severity: 'warning',
                        message: 'Tab order does not follow DOM order',
                        suggestion: 'Consider reordering elements in DOM or using tabindex carefully';
                        details: {)
                            currentElement: current.element.tagName ,}
                            nextElement: next.element.tagName) }
                        });
                }
                
                // 視覚的な位置関係のチェック（左から右、上から下）
                if(current.isVisible && next.isVisible) {
                    const visualOrderIssue = this.checkVisualTabOrder(current, next);
                    if (visualOrderIssue) {
                }
                        issues.push(visualOrderIssue); }
}''
            } catch (error) { issues.push({)'
                type: 'logical-order-check-error',')';
                severity: 'warning'), }
                message: `Logical tab order check failed: ${(error, as Error}).message}`
            });
        }
        
        return issues;
    }
    
    /**
     * 視覚的タブ順序のチェック
     */
    private checkVisualTabOrder(current: TabElement, next: TabElement): TabOrderIssue | null { try {
            const currentRect = current.rect;
            const nextRect = next.rect;
            
            // 大幅に異なる垂直位置（新しい行）
            const verticalThreshold = 20;
            const isNewRow = Math.abs(currentRect.top - nextRect.top) > verticalThreshold;
            
            if(!isNewRow) {
            ;
                // 同じ行で右から左に移動している場合
                if(currentRect.left > nextRect.left + 10) {'
                    return { element: current.element,''
                        type: 'visual-tab-order-issue',
                        severity: 'warning';
            ,}

                        message: 'Tab order may not follow visual layout(right, to left)',' };

                        suggestion: 'Review tab order to match visual layout' }
                    }

            } else {  // 新しい行で上から下ではない場合
                if(currentRect.top > nextRect.top + verticalThreshold) {'
                    return { element: current.element,''
                        type: 'visual-tab-order-issue';
                ,}

                        severity: 'warning',' }

                        message: 'Tab order may not follow visual layout(bottom, to top)',' };

                        suggestion: 'Review tab order to match visual layout' }
                    }
            } catch (error) { // 視覚的チェックのエラーは無視（測定できない場合がある） }
        
        return null;
    }
    
    /**
     * フォーカス包含テスト
     */''
    async testFocusContainment()';
            const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"], .modal, .dialog);
            
            for(const, modal of, modals) { if(this.isElementVisible(modal) {
                    const containmentResult = await this.testModalFocusContainment(modal);
                    results.containers.push(containmentResult);

                    if(!containmentResult.passed) {
                        results.passed = false;
                        results.issues.push({'
                            element: modal,
                            type: 'focus-containment-failure',
                            severity: 'error',
                            message: 'Modal does not properly contain focus',)';
                            suggestion: 'Implement focus trapping for modal dialogs',' }

                            details: containmentResult.details)'); }'
}
            }
            ';
            // その他のフォーカス包含要素
            const containers = document.querySelectorAll('[data-focus-trap], [aria-modal="true"]);
            for(const, container of, containers) { if(this.isElementVisible(container) {
                    const containmentResult = await this.testContainerFocusContainment(container);
                    results.containers.push(containmentResult);

                    if(!containmentResult.passed) {
                        results.passed = false;
                        results.issues.push({'
                            element: container,
                            type: 'focus-containment-failure',
                            severity: 'error',)';
                            message: 'Container does not properly contain focus',' }

                            suggestion: 'Implement proper focus management for container'); }
}''
            } catch (error) { results.passed = false;

            results.issues.push({)'
                type: 'containment-test-error',')';
                severity: 'error'), }
                message: `Focus containment test failed: ${(error, as Error}).message}`
            });
        }
        
        return results;
    }
    
    /**
     * モーダルフォーカス包含テスト
     */
    private async testModalFocusContainment(modal: Element): Promise<ContainmentResult> { const result: ContainmentResult = {
            element: modal;
            passed: true, }
            details: {};
            focusableElements: [];
        },

        try {'
            const focusableInModal = modal.querySelectorAll()';
                'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
            );
            
            result.focusableElements = Array.from(focusableInModal);

            if(focusableInModal.length === 0) {'
                result.passed = false;''
                result.details.issue = 'No focusable elements found in modal';
            }
                return result;
            
            const firstFocusable = focusableInModal[0] as HTMLElement;
            const lastFocusable = focusableInModal[focusableInModal.length - 1] as HTMLElement;
            
            // 最初の要素にフォーカス
            firstFocusable.focus();
            
            // Shift+Tabで前の要素に移動しようとする
            const shiftTabResult = await this.simulateShiftTab(firstFocusable);
            
            // フォーカスが最後の要素に移動したかチェック
            const focusMovedToLast = document.activeElement === lastFocusable;
            
            // 最後の要素にフォーカス
            lastFocusable.focus();
            
            // Tabで次の要素に移動しようとする
            const tabResult = await this.simulateTab(lastFocusable);
            
            // フォーカスが最初の要素に移動したかチェック
            const focusMovedToFirst = document.activeElement === firstFocusable;
            
            result.passed = focusMovedToLast && focusMovedToFirst;
            result.details = { focusMovedToLast,
                focusMovedToFirst,
                firstElement: firstFocusable.tagName;
                lastElement: lastFocusable.tagName;
                totalFocusableElements: focusableInModal.length ,} catch (error) { result.passed = false;
            result.details.error = (error, as Error).message; }
        
        return result;
    }
    
    /**
     * コンテナフォーカス包含テスト
     */
    private async testContainerFocusContainment(container: Element): Promise<ContainmentResult> { return await this.testModalFocusContainment(container); }
    
    /**
     * フォーカス復元テスト
     */''
    async testFocusRestoration()';
            const triggers = document.querySelectorAll('[data-toggle], [aria-haspopup="true"]);
            
            for(const, trigger of, triggers) { if(this.isElementVisible(trigger) {
                    const restorationTest = await this.testElementFocusRestoration(trigger, initialFocus);
                    results.restorationTests.push(restorationTest);

                    if(!restorationTest.passed) {
                        results.passed = false;
                        results.issues.push({'
                            element: trigger,
                            type: 'focus-restoration-failure',
                            severity: 'error',)';
                            message: 'Focus not properly restored after interaction',' }

                            suggestion: 'Store and restore focus when closing modal/popup'); }
}''
            } catch (error) { results.passed = false;

            results.issues.push({)'
                type: 'restoration-test-error',')';
                severity: 'error'), }
                message: `Focus restoration test failed: ${(error, as Error}).message}`
            });
        }
        
        return results;
    }
    
    /**
     * 要素のフォーカス復元テスト
     */
    private async testElementFocusRestoration(trigger: Element, initialFocus: Element | null): Promise<RestorationTestResult> { const result: RestorationTestResult = {
            element: trigger;
            passed: true, }
            details: {};
        try { // トリガー要素にフォーカス
            (trigger, as HTMLElement).focus();
            const focusBeforeInteraction = document.activeElement;
            
            // Enter/Spaceキーでトリガーを活性化
            const activationResult = await this.simulateActivation(trigger);
            
            await new Promise(resolve => setTimeout(resolve, 100);
            
            // ESCキーでモーダル/ポップアップを閉じる
            const escapeResult = await this.simulateEscape();
            
            await new Promise(resolve => setTimeout(resolve, 100);
            
            // フォーカスが復元されたかチェック
            const focusAfterInteraction = document.activeElement;
            const focusRestored = focusAfterInteraction === focusBeforeInteraction;
            
            result.passed = focusRestored;
            result.details = {
                focusBeforeInteraction: focusBeforeInteraction? .tagName, : undefined
                focusAfterInteraction: focusAfterInteraction? .tagName;
                focusRestored ,}
            } catch (error) { result.passed = false;
            result.details.error = (error, as Error).message; }
        
        return result;
    }
    
    /**
     * フォーカス包含のチェック
     */ : undefined
    private checkFocusContainment(element: Element): void { try {
            // アクティブなフォーカス包含コンテナを確認
            for(const, container of, this.containmentState.activeContainers) {

                if(!container.contains(element)) {
                    // フォーカスが包含コンテナの外に出た
                    this.stats.containmentViolations++;
                    this.containmentState.escapeAttempts++;

                    console.warn('Focus escaped from containment container:', {)
                        container: container.tagName, }
                        element: element.tagName); }
} catch (error) { getErrorHandler(').handleError(error, 'FOCUS_CONTAINMENT_CHECK_ERROR', {)'
                component: 'NavigationStateManager',);
                element: element.tagName ,});
        }
    }
    
    // ユーティリティメソッド
    
    /**
     * フォーカス可能要素の取得
     */''
    private getFocusableElements(''';
            'a[href]',)';
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
            'object''';
        ].join(', ');
        
        const elements = Array.from(document.querySelectorAll(selector);
        
        return elements.filter(element => {  ); }
            return this.isElementVisible(element) && !(element, as HTMLInputElement).disabled;);
    }
    
    /**'
     * 要素の可視性判定'
     */''
    private isElementVisible(element: Element): boolean { const htmlElement = element as HTMLElement;''
        if(!htmlElement.offsetParent && element.tagName !== 'BODY) {'
            
        }
            return false;

        const styles = window.getComputedStyle(element);''
        return styles.display !== 'none' && '';
               styles.visibility !== 'hidden' &&'';
               styles.opacity !== '0';
    }
    
    /**
     * Tabキーシミュレーション'
     */''
    private async simulateTab(element: Element): Promise<SimulationResult> { ''
        const tabEvent = new KeyboardEvent('keydown', {''
            key: 'Tab';
            keyCode: 9);
            bubbles: true);
            cancelable: true;
        ),
        
        element.dispatchEvent(tabEvent);
        await new Promise(resolve => setTimeout(resolve, 50);
         }
        return { success: true, activeElement: document.activeElement ,}
    
    /**
     * Shift+Tabキーシミュレーション'
     */''
    private async simulateShiftTab(element: Element): Promise<SimulationResult> { ''
        const shiftTabEvent = new KeyboardEvent('keydown', {''
            key: 'Tab';
            keyCode: 9;
            shiftKey: true);
            bubbles: true);
            cancelable: true;
        ),
        
        element.dispatchEvent(shiftTabEvent);
        await new Promise(resolve => setTimeout(resolve, 50);
         }
        return { success: true, activeElement: document.activeElement ,}
    
    /**
     * 要素の活性化シミュレーション'
     */''
    private async simulateActivation(element: Element): Promise<SimulationResult> { ''
        const enterEvent = new KeyboardEvent('keydown', {''
            key: 'Enter';
            keyCode: 13);
            bubbles: true);
            cancelable: true;
        ),
        
        element.dispatchEvent(enterEvent);
        await new Promise(resolve => setTimeout(resolve, 50);
         }
        return { success: true }
    
    /**
     * Escapeキーシミュレーション'
     */''
    private async simulateEscape(''';
        const escapeEvent = new KeyboardEvent('keydown', { ''
            key: 'Escape';
            keyCode: 27);
            bubbles: true);
            cancelable: true;
        ),
        
        document.dispatchEvent(escapeEvent);
        await new Promise(resolve => setTimeout(resolve, 50);
         }
        return { success: true }
    
    // パブリックAPI
    
    /**
     * フォーカス履歴の取得
     */
    getFocusHistory(limit: number = 50): FocusEvent[] { return this.focusTracking.history.slice(-limit); }
    
    /**
     * 現在のフォーカス要素の取得
     */
    getCurrentFocus(): FocusInfo { return { element: this.focusTracking.currentElement,
            lastFocusTime: this.focusTracking.lastFocusTime, };
            activeElement: document.activeElement }
        }
    
    /**
     * タブ順序データの取得
     */
    getTabOrderData(): TabOrderInfo { return { ...this.tabOrderData,
            isValid: this.tabOrderData.lastValidation !== null &&  ,};
                    (Date.now() - this.tabOrderData.lastValidation) < 60000 // 1分間有効 }
        },
    }
    
    /**
     * ナビゲーション統計の取得
     */''
    getNavigationStats(''';
            currentFocus: this.focusTracking.currentElement? .tagName || 'none', : undefined
            activeContainers: this.containmentState.activeContainers.size);
        })
    
    /**
     * フォーカス包含コンテナの追加
     */'
    addFocusContainer(container: Element): void { this.containmentState.activeContainers.add(container);''
        this.containmentState.containerStack.push(container);''
        console.log('Focus container added:', container.tagName }
    
    /**
     * フォーカス包含コンテナの削除
     */
    removeFocusContainer(container: Element): void { this.containmentState.activeContainers.delete(container);
        const index = this.containmentState.containerStack.indexOf(container);
        if(index > -1) {'
            ';

        }

            this.containmentState.containerStack.splice(index, 1); }

        }''
        console.log('Focus container removed:', container.tagName);
    }
    
    /**
     * 設定の更新'
     */''
    updateConfig(newConfig: Partial<StateManagerConfig>): void {
        this.config = { ...this.config, ...newConfig;

        if(newConfig.hasOwnProperty('enabled) {'
            if (newConfig.enabled && !this.focusTracking.enabled) {
        }

                this.startFocusTracking();' }'

            } else if(!newConfig.enabled) { this.focusTracking.enabled = false; }
        }

        console.log('NavigationStateManager, configuration updated);
    }
    
    /**
     * 状態のリセット
     */
    reset(): void { this.focusTracking.history = [];
        this.focusTracking.currentElement = null;
        this.focusTracking.trapAttempts = 0;
        
        this.tabOrderData.elements = [];
        this.tabOrderData.issues = [];
        this.tabOrderData.lastValidation = null;
        
        this.containmentState.activeContainers.clear();
        this.containmentState.containerStack = [];
        this.containmentState.escapeAttempts = 0;
        
        this.stats = {
            totalFocusChanges: 0;
            tabNavigations: 0;
            focusRestorations: 0,
            containmentViolations: 0,
            sessionStart: Date.now(')';
        console.log('NavigationStateManager, state reset'), }'
    
    /**
     * クリーンアップ'
     */''
    destroy()';
        console.log('Destroying, NavigationStateManager...');
        ';

        this.focusTracking.enabled = false;''
        this.reset()';
        console.log('NavigationStateManager, destroyed'');

    }''
}