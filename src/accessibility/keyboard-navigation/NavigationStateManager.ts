/**
 * NavigationStateManager
 * フォーカス状態管理とナビゲーション制御機能を提供
 * - フォーカス状態追跡
 * - タブ順序計算と検証
 * - フォーカス包含テスト
 * - フォーカス復元検証
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

// Interfaces for navigation state management
interface StateManagerConfig {
    enabled: boolean;
    trackFocusHistory: boolean;
    validateTabOrder: boolean;
    monitorContainment: boolean;
    maxHistoryLength: number;
}

interface FocusTracking {
    enabled: boolean;
    history: FocusEvent[];
    currentElement: Element | null;
    lastFocusTime: number;
    focusStack: Element[];
    trapAttempts: number;
}

interface FocusEvent {
    element: Element;
    type: "single" | "batch";
    timestamp: number;
    tagName: string;
    id: string | null;
    className: string | null;
    role: string | null;
}

interface TabOrderData {
    elements: TabElement[];
    issues: TabOrderIssue[];
    lastValidation: number | null;
}

interface TabElement {
    element: Element;
    position: number;
    tabIndex: string | null;
    computedTabIndex: number;
    isVisible: boolean;
    rect: DOMRect;
}

interface TabOrderIssue {
    element?: Element;
    type: "single" | "batch";
    severity: 'error' | 'warning';
    message: string;
    suggestion?: string;
    details?: any;
}

interface ContainmentState {
    activeContainers: Set<Element>;
    containerStack: Element[];
    escapeAttempts: number;
}

interface NavigationStats {
    totalFocusChanges: number;
    tabNavigations: number;
    focusRestorations: number;
    containmentViolations: number;
    sessionStart: number;
}

interface TabOrderValidationResult {
    passed: boolean;
    issues: TabOrderIssue[];
    tabOrder?: TabElement[];
    summary?: {
        totalElements: number;
        visibleElements: number;
        elementsWithTabIndex: number;
        positiveTabIndex: number;
    };
}

interface ContainmentResult {
    element: Element;
    passed: boolean;
    details: any;
    focusableElements: Element[];
}

interface ContainmentTestResults {
    passed: boolean;
    issues: TabOrderIssue[];
    warnings: TabOrderIssue[];
    containers: ContainmentResult[];
}

interface RestorationTestResult {
    element: Element;
    passed: boolean;
    restoredTo: Element | null;
    expectedElement: Element | null;
    details: string;
}

interface FocusTrack {
    focusin: ((event: Event) => void) | null;
    focusout: ((event: Event) => void) | null;
}

export class NavigationStateManager {
    private config: StateManagerConfig;
    private focusTracking: FocusTracking;
    private tabOrderData: TabOrderData;
    private containmentState: ContainmentState;
    private navigationStats: NavigationStats;
    private initialized: boolean;
    private focusListeners: FocusTrack;

    constructor(config: Partial<StateManagerConfig> = {}) {
        this.config = {
            enabled: true,
            trackFocusHistory: true,
            validateTabOrder: true,
            monitorContainment: true,
            maxHistoryLength: 100,
            ...config
        };

        // フォーカス追跡
        this.focusTracking = {
            enabled: true,
            history: [],
            currentElement: null,
            lastFocusTime: 0,
            focusStack: [],
            trapAttempts: 0
        };

        // タブ順序データ
        this.tabOrderData = {
            elements: [],
            issues: [],
            lastValidation: null
        };

        // 封じ込め状態
        this.containmentState = {
            activeContainers: new Set(),
            containerStack: [],
            escapeAttempts: 0
        };

        // ナビゲーション統計
        this.navigationStats = {
            totalFocusChanges: 0,
            tabNavigations: 0,
            focusRestorations: 0,
            containmentViolations: 0,
            sessionStart: Date.now()
        };

        this.initialized = false;
        this.focusListeners = {
            focusin: null,
            focusout: null
        };

        this.initialize();
    }

    /**
     * Initialize the navigation state manager
     */
    private initialize(): void {
        try {
            if (!this.config.enabled) {
                console.log('NavigationStateManager is disabled');
                return;
            }

            this.setupFocusTracking();
            this.initialized = true;
            
            console.log('NavigationStateManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'NAVIGATION_STATE_MANAGER_ERROR', {
                operation: 'initialize'
            });
        }
    }

    /**
     * Setup focus tracking listeners
     */
    private setupFocusTracking(): void {
        if (!this.config.trackFocusHistory) return;

        // Focus in listener
        this.focusListeners.focusin = (event: Event) => {
            const element = event.target as Element;
            this.handleFocusIn(element);
        };

        // Focus out listener
        this.focusListeners.focusout = (event: Event) => {
            const element = event.target as Element;
            this.handleFocusOut(element);
        };

        // Add listeners
        document.addEventListener('focusin', this.focusListeners.focusin, true);
        document.addEventListener('focusout', this.focusListeners.focusout, true);
    }

    /**
     * Handle focus in event
     */
    private handleFocusIn(element: Element): void {
        try {
            const focusEvent: FocusEvent = {
                element: element,
                type: "single",
                timestamp: Date.now(),
                tagName: element.tagName.toLowerCase(),
                id: element.id || null,
                className: element.className || null,
                role: element.getAttribute('role')
            };

            // Update tracking
            this.focusTracking.currentElement = element;
            this.focusTracking.lastFocusTime = focusEvent.timestamp;
            this.focusTracking.history.push(focusEvent);
            
            // Add to focus stack
            this.focusTracking.focusStack.push(element);

            // Maintain history size
            if (this.focusTracking.history.length > this.config.maxHistoryLength) {
                this.focusTracking.history = this.focusTracking.history.slice(-this.config.maxHistoryLength);
            }

            // Update stats
            this.navigationStats.totalFocusChanges++;

            // Check containment
            if (this.config.monitorContainment) {
                this.checkContainment(element);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'NAVIGATION_STATE_MANAGER_ERROR', {
                operation: 'handleFocusIn'
            });
        }
    }

    /**
     * Handle focus out event
     */
    private handleFocusOut(element: Element): void {
        try {
            // Remove from focus stack
            const index = this.focusTracking.focusStack.indexOf(element);
            if (index > -1) {
                this.focusTracking.focusStack.splice(index, 1);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'NAVIGATION_STATE_MANAGER_ERROR', {
                operation: 'handleFocusOut'
            });
        }
    }

    /**
     * Get current focus state
     */
    getCurrentFocusState(): {
        currentElement: Element | null;
        lastFocusTime: number;
        focusHistory: FocusEvent[];
        activeContainers: Element[];
    } {
        return {
            currentElement: this.focusTracking.currentElement,
            lastFocusTime: this.focusTracking.lastFocusTime,
            focusHistory: [...this.focusTracking.history],
            activeContainers: Array.from(this.containmentState.activeContainers)
        };
    }

    /**
     * Validate tab order
     */
    validateTabOrder(rootElement?: Element): TabOrderValidationResult {
        try {
            const root = rootElement || document.body;
            const focusableElements = this.getFocusableElements(root);
            const tabElements: TabElement[] = [];
            const issues: TabOrderIssue[] = [];

            // Analyze each focusable element
            focusableElements.forEach((element, index) => {
                const tabIndexStr = element.getAttribute('tabindex');
                const computedTabIndex = this.computeTabIndex(element);
                const rect = element.getBoundingClientRect();
                const isVisible = this.isElementVisible(element);

                const tabElement: TabElement = {
                    element: element,
                    position: index,
                    tabIndex: tabIndexStr,
                    computedTabIndex: computedTabIndex,
                    isVisible: isVisible,
                    rect: rect
                };

                tabElements.push(tabElement);

                // Check for issues
                if (computedTabIndex > 0) {
                    issues.push({
                        element: element,
                        type: "single",
                        severity: 'warning',
                        message: 'Positive tabindex found',
                        suggestion: 'Consider using tabindex="0" for natural document flow'
                    });
                }

                if (!isVisible && computedTabIndex >= 0) {
                    issues.push({
                        element: element,
                        type: "single",
                        severity: 'error',
                        message: 'Hidden element is focusable',
                        suggestion: 'Remove element from tab order or make it visible'
                    });
                }
            });

            // Check tab order logic
            const tabOrderIssues = this.analyzeTabOrder(tabElements);
            issues.push(...tabOrderIssues);

            // Store results
            this.tabOrderData = {
                elements: tabElements,
                issues: issues,
                lastValidation: Date.now()
            };

            return {
                passed: issues.filter(i => i.severity === 'error').length === 0,
                issues: issues,
                tabOrder: tabElements,
                summary: {
                    totalElements: tabElements.length,
                    visibleElements: tabElements.filter(e => e.isVisible).length,
                    elementsWithTabIndex: tabElements.filter(e => e.tabIndex !== null).length,
                    positiveTabIndex: tabElements.filter(e => e.computedTabIndex > 0).length
                }
            };
        } catch (error) {
            getErrorHandler().handleError(error, 'NAVIGATION_STATE_MANAGER_ERROR', {
                operation: 'validateTabOrder'
            });
            throw error;
        }
    }

    /**
     * Test focus containment
     */
    testFocusContainment(container: Element): ContainmentTestResults {
        try {
            const results: ContainmentTestResults = {
                passed: true,
                issues: [],
                warnings: [],
                containers: []
            };

            const focusableElements = this.getFocusableElements(container);
            
            const containmentResult: ContainmentResult = {
                element: container,
                passed: true,
                details: {},
                focusableElements: focusableElements
            };

            // Check if container has role dialog or modal
            const role = container.getAttribute('role');
            const ariaModal = container.getAttribute('aria-modal');

            if (role === 'dialog' || ariaModal === 'true') {
                // Check for proper focus trap
                if (focusableElements.length === 0) {
                    results.issues.push({
                        element: container,
                        type: "single",
                        severity: 'error',
                        message: 'Modal/dialog has no focusable elements',
                        suggestion: 'Add at least one focusable element inside the modal'
                    });
                    containmentResult.passed = false;
                }

                // Check for proper ARIA attributes
                if (!container.getAttribute('aria-label') && !container.getAttribute('aria-labelledby')) {
                    results.warnings.push({
                        element: container,
                        type: "single",
                        severity: 'warning',
                        message: 'Modal/dialog missing accessible label',
                        suggestion: 'Add aria-label or aria-labelledby attribute'
                    });
                }
            }

            results.containers.push(containmentResult);
            results.passed = results.issues.length === 0;

            return results;
        } catch (error) {
            getErrorHandler().handleError(error, 'NAVIGATION_STATE_MANAGER_ERROR', {
                operation: 'testFocusContainment'
            });
            throw error;
        }
    }

    /**
     * Test focus restoration
     */
    testFocusRestoration(originalElement: Element, currentElement: Element | null): RestorationTestResult {
        try {
            const result: RestorationTestResult = {
                element: originalElement,
                passed: false,
                restoredTo: currentElement,
                expectedElement: originalElement,
                details: ''
            };

            if (currentElement === originalElement) {
                result.passed = true;
                result.details = 'Focus correctly restored to original element';
            } else if (currentElement && originalElement.contains(currentElement)) {
                result.passed = true;
                result.details = 'Focus restored to child element of original';
            } else if (currentElement && currentElement.contains(originalElement)) {
                result.passed = true;
                result.details = 'Focus restored to parent element of original';
            } else {
                result.details = 'Focus not restored to expected element';
            }

            return result;
        } catch (error) {
            getErrorHandler().handleError(error, 'NAVIGATION_STATE_MANAGER_ERROR', {
                operation: 'testFocusRestoration'
            });
            throw error;
        }
    }

    /**
     * Get focusable elements
     */
    private getFocusableElements(root: Element): Element[] {
        const selector = [
            'a[href]',
            'area[href]',
            'input:not([disabled]):not([type="hidden"])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'button:not([disabled])',
            'iframe',
            'object',
            'embed',
            '[contenteditable]',
            '[tabindex]:not([tabindex="-1"])'
        ].join(',');

        return Array.from(root.querySelectorAll(selector));
    }

    /**
     * Compute effective tab index
     */
    private computeTabIndex(element: Element): number {
        const tabIndexStr = element.getAttribute('tabindex');
        
        if (tabIndexStr === null) {
            // Default focusable elements
            const tagName = element.tagName.toLowerCase();
            const focusableTags = ['a', 'button', 'input', 'select', 'textarea'];
            return focusableTags.includes(tagName) ? 0 : -1;
        }
        
        const tabIndex = parseInt(tabIndexStr, 10);
        return isNaN(tabIndex) ? 0 : tabIndex;
    }

    /**
     * Check if element is visible
     */
    private isElementVisible(element: Element): boolean {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0'
        );
    }

    /**
     * Analyze tab order for issues
     */
    private analyzeTabOrder(tabElements: TabElement[]): TabOrderIssue[] {
        const issues: TabOrderIssue[] = [];

        // Check for logical flow
        let lastPosition = { x: 0, y: 0 };
        let reversals = 0;

        tabElements.filter(e => e.isVisible && e.computedTabIndex >= 0)
            .forEach((element, index) => {
                const rect = element.rect;
                
                // Check for backwards navigation
                if (index > 0) {
                    if (rect.top < lastPosition.y || 
                        (rect.top === lastPosition.y && rect.left < lastPosition.x)) {
                        reversals++;
                    }
                }
                
                lastPosition = { x: rect.left, y: rect.top };
            });

        if (reversals > tabElements.length * 0.3) {
            issues.push({
                type: "batch",
                severity: 'warning',
                message: 'Tab order may not follow visual layout',
                suggestion: 'Consider reordering elements to match visual flow'
            });
        }

        return issues;
    }

    /**
     * Check focus containment
     */
    private checkContainment(element: Element): void {
        // Check if focus moved outside active containers
        for (const container of this.containmentState.activeContainers) {
            if (!container.contains(element)) {
                this.containmentState.escapeAttempts++;
                this.navigationStats.containmentViolations++;
                
                console.warn('Focus escaped container', {
                    container: container,
                    escapedTo: element,
                    attempts: this.containmentState.escapeAttempts
                });
            }
        }
    }

    /**
     * Set focus container
     */
    setFocusContainer(container: Element, trap: boolean = false): void {
        try {
            this.containmentState.activeContainers.add(container);
            this.containmentState.containerStack.push(container);
            
            if (trap) {
                this.trapFocus(container);
            }
            
            console.log('Focus container set', {
                container: container,
                trap: trap
            });
        } catch (error) {
            getErrorHandler().handleError(error, 'NAVIGATION_STATE_MANAGER_ERROR', {
                operation: 'setFocusContainer'
            });
        }
    }

    /**
     * Release focus container
     */
    releaseFocusContainer(container: Element): void {
        try {
            this.containmentState.activeContainers.delete(container);
            
            const index = this.containmentState.containerStack.indexOf(container);
            if (index > -1) {
                this.containmentState.containerStack.splice(index, 1);
            }
            
            console.log('Focus container released', container);
        } catch (error) {
            getErrorHandler().handleError(error, 'NAVIGATION_STATE_MANAGER_ERROR', {
                operation: 'releaseFocusContainer'
            });
        }
    }

    /**
     * Trap focus within container
     */
    private trapFocus(container: Element): void {
        const focusableElements = this.getFocusableElements(container);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        // Set initial focus
        firstElement.focus();

        // Handle tab key
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;

            if (event.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        
        // Store handler for cleanup
        (container as any).__focusTrapHandler = handleKeyDown;
    }

    /**
     * Get navigation statistics
     */
    getStatistics(): NavigationStats {
        return { ...this.navigationStats };
    }

    /**
     * Get focus history
     */
    getFocusHistory(limit?: number): FocusEvent[] {
        const history = this.focusTracking.history;
        return limit ? history.slice(-limit) : [...history];
    }

    /**
     * Clear focus history
     */
    clearHistory(): void {
        this.focusTracking.history = [];
        this.focusTracking.focusStack = [];
        console.log('Focus history cleared');
    }

    /**
     * Reset statistics
     */
    resetStatistics(): void {
        this.navigationStats = {
            totalFocusChanges: 0,
            tabNavigations: 0,
            focusRestorations: 0,
            containmentViolations: 0,
            sessionStart: Date.now()
        };
        console.log('Navigation statistics reset');
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<StateManagerConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        // Update tracking if needed
        if (!this.config.trackFocusHistory) {
            this.removeFocusListeners();
        } else if (!this.focusListeners.focusin) {
            this.setupFocusTracking();
        }
        
        console.log('NavigationStateManager configuration updated');
    }

    /**
     * Check if manager is ready
     */
    isReady(): boolean {
        return this.initialized;
    }

    /**
     * Remove focus listeners
     */
    private removeFocusListeners(): void {
        if (this.focusListeners.focusin) {
            document.removeEventListener('focusin', this.focusListeners.focusin, true);
            this.focusListeners.focusin = null;
        }
        
        if (this.focusListeners.focusout) {
            document.removeEventListener('focusout', this.focusListeners.focusout, true);
            this.focusListeners.focusout = null;
        }
    }

    /**
     * Destroy manager and cleanup resources
     */
    destroy(): void {
        this.removeFocusListeners();
        this.clearHistory();
        this.containmentState.activeContainers.clear();
        this.containmentState.containerStack = [];
        this.initialized = false;
        
        console.log('NavigationStateManager destroyed');
    }
}