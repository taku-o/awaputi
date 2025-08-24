/**
 * HelpTriggerManager
 * 
 * ヘルプトリガー管理システム機能を担当
 * Event-driven Trigger Management Patternの一部として設計
 * 
 * **Features**:
 * - Behavioral pattern monitoring and analysis
 * - Context-aware help trigger detection
 * - Multi-modal interaction tracking
 * - Adaptive trigger sensitivity adjustment
 * 
 * @module HelpTriggerManager
 * Created: Phase G.7 (Issue #103)
 */

// 型定義
export interface TriggerConfig {
    onHover: boolean;
    onFocus: boolean;
    onError: boolean;
    onStuck: boolean;
    onRequest: boolean;
    onFirstVisit: boolean;
    onInactivity: number;
    onMultipleErrors: number;
}

export interface UserBehaviorTracking {
    errorCount: number;
    inactivityTimer: number | null;
    lastActivity: number;
    visitCount: number;
    stuckDetection: StuckDetectionData;
    hoverTracking: HoverTrackingData;
}

export interface StuckDetectionData {
    sameElementClicks: number;
    lastClickedElement: HTMLElement | null;
    timeThreshold: number;
}

export interface HoverTrackingData {
    currentElement: HTMLElement | null;
    hoverStartTime: number | null;
    hoverThreshold: number;
}

export interface TriggerContext {
    targetElement?: HTMLElement;
    duration?: number;
    errorType?: string;
    errorCount?: number;
    immediate?: boolean;
    priority?: TriggerPriority;
    clickCount?: number;
    inactivityDuration?: number;
    persistent?: boolean;
    userRequested?: boolean;
    elementType?: string;
    triggerSource?: TriggerSource;
    sessionContext?: SessionContext;
}

export interface SessionContext {
    sessionId: string;
    startTime: number;
    totalInteractions: number;
    helpRequestCount: number;
    errorRate: number;
}

export interface TriggerRule {
    id: string;
    name: string;
    condition: TriggerCondition;
    action: TriggerAction;
    priority: TriggerPriority;
    enabled: boolean;
    cooldownPeriod: number;
    lastTriggered?: number;
}

export interface TriggerCondition {
    type: ConditionType;
    threshold?: number;
    timeWindow?: number;
    elementSelector?: string;
    errorTypes?: string[];
    userAttributes?: Record<string, any>;
}

export interface TriggerAction {
    type: ActionType;
    helpContent: string;
    delay?: number;
    position?: string;
    animation?: string;
    persistent?: boolean;
    dismissible?: boolean;
}

export interface TriggerEvent {
    id: string;
    timestamp: number;
    type: TriggerEventType;
    context: TriggerContext;
    rule: TriggerRule;
    outcome: TriggerOutcome;
}

export interface HelpTriggerCallback {
    (context: TriggerContext): void;
}

export interface ElementTracker {
    element: HTMLElement;
    listeners: Map<string, EventListener>;
    metadata: ElementMetadata;
}

export interface ElementMetadata {
    elementType: string;
    importance: number;
    userInteractions: number;
    lastInteraction: number;
    helpRequests: number;
}

export interface InteractionPattern {
    patternId: string;
    events: TriggerEvent[];
    frequency: number;
    confidence: number;
    lastDetected: number;
}

export interface TriggerMetrics {
    totalTriggers: number;
    successfulTriggers: number;
    ignoredTriggers: number;
    triggersByType: Record<TriggerEventType, number>;
    averageResponseTime: number;
    userSatisfactionScore: number;
}

// 列挙型
export type TriggerPriority = 'low' | 'normal' | 'high' | 'critical';
export type TriggerSource = 'hover' | 'focus' | 'error' | 'stuck' | 'request' | 'first_visit' | 'inactivity' | 'pattern';
export type ConditionType = 'element_hover' | 'element_focus' | 'error_threshold' | 'click_repetition' | 'time_inactivity' | 'first_visit' | 'error_type' | 'user_pattern';
export type ActionType = 'show_tooltip' | 'display_modal' | 'highlight_element' | 'show_walkthrough' | 'redirect_help';
export type TriggerEventType = 'hover' | 'focus' | 'error' | 'stuck' | 'request' | 'first_visit' | 'inactivity' | 'pattern_match';
export type TriggerOutcome = 'triggered' | 'ignored' | 'cooldown' | 'disabled';

// 定数
export const DEFAULT_TRIGGER_CONFIG: TriggerConfig = {
    onHover: true,
    onFocus: true,
    onError: true,
    onStuck: true,
    onRequest: true,
    onFirstVisit: true,
    onInactivity: 30000, // 30秒
    onMultipleErrors: 3
} as const;

export const STUCK_DETECTION_THRESHOLD = 5; // 同じ要素への連続クリック回数
export const HOVER_THRESHOLD = 2000; // ホバー継続時間（ミリ秒）
export const INACTIVITY_CHECK_INTERVAL = 5000; // 非アクティブ状態チェック間隔
export const COOLDOWN_PERIODS = {
    low: 10000,    // 10秒
    normal: 30000, // 30秒
    high: 60000,   // 1分
    critical: 5000 // 5秒
} as const;

// ユーティリティ関数
export function generateTriggerId(): string {
    return `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getElementSelector(element: HTMLElement): string {
    if (element.id) {
        return `#${element.id}`;
    }
    
    if (element.className) {
        const classes = element.className.trim().split(/\s+/).slice(0, 2);
        return `.${classes.join('.')}`;
    }
    
    return element.tagName.toLowerCase();
}

export function calculateElementImportance(element: HTMLElement): number {
    let importance = 1;
    
    // タグタイプによる重み付け
    const tagWeights: Record<string, number> = {
        'button': 3,
        'input': 2.5,
        'select': 2.5,
        'textarea': 2,
        'a': 2,
        'form': 2,
        'div': 1
    };
    
    importance *= tagWeights[element.tagName.toLowerCase()] || 1;
    
    // クラス名による重み付け
    if (element.className.includes('important') || element.className.includes('primary')) {
        importance *= 1.5;
    }
    
    // ARIA属性による重み付け
    if (element.getAttribute('aria-label') || element.getAttribute('role')) {
        importance *= 1.2;
    }
    
    return importance;
}

export function isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 &&
           rect.top >= 0 && rect.left >= 0 &&
           rect.bottom <= window.innerHeight &&
           rect.right <= window.innerWidth;
}

export class HelpTriggerManager {
    private config: TriggerConfig;
    private behaviorTracking: UserBehaviorTracking;
    private triggerRules: Map<string, TriggerRule>;
    private activeListeners: Map<HTMLElement, ElementTracker>;
    private triggerCallbacks: Map<TriggerEventType, HelpTriggerCallback[]>;
    private triggerHistory: TriggerEvent[];
    private interactionPatterns: InteractionPattern[];
    private metrics: TriggerMetrics;
    private sessionContext: SessionContext;

    constructor() {
        this.config = { ...DEFAULT_TRIGGER_CONFIG };
        this.behaviorTracking = this.initializeBehaviorTracking();
        this.triggerRules = new Map();
        this.activeListeners = new Map();
        this.triggerCallbacks = new Map();
        this.triggerHistory = [];
        this.interactionPatterns = [];
        this.metrics = this.initializeMetrics();
        this.sessionContext = this.initializeSession();

        this.initializeDefaultRules();
        this.setupGlobalListeners();
        console.log('[HelpTriggerManager] Manager initialized');
    }

    /**
     * 行動追跡データを初期化
     */
    private initializeBehaviorTracking(): UserBehaviorTracking {
        return {
            errorCount: 0,
            inactivityTimer: null,
            lastActivity: Date.now(),
            visitCount: parseInt(localStorage.getItem('help_visit_count') || '0', 10) + 1,
            stuckDetection: {
                sameElementClicks: 0,
                lastClickedElement: null,
                timeThreshold: 2000
            },
            hoverTracking: {
                currentElement: null,
                hoverStartTime: null,
                hoverThreshold: HOVER_THRESHOLD
            }
        };
    }

    /**
     * メトリクスを初期化
     */
    private initializeMetrics(): TriggerMetrics {
        return {
            totalTriggers: 0,
            successfulTriggers: 0,
            ignoredTriggers: 0,
            triggersByType: {} as Record<TriggerEventType, number>,
            averageResponseTime: 0,
            userSatisfactionScore: 0
        };
    }

    /**
     * セッションを初期化
     */
    private initializeSession(): SessionContext {
        return {
            sessionId: generateTriggerId(),
            startTime: Date.now(),
            totalInteractions: 0,
            helpRequestCount: 0,
            errorRate: 0
        };
    }

    /**
     * デフォルトトリガールールを初期化
     */
    private initializeDefaultRules(): void {
        // ホバートリガー
        this.triggerRules.set('hover_help', {
            id: 'hover_help',
            name: 'Hover Help Trigger',
            condition: {
                type: 'element_hover',
                threshold: HOVER_THRESHOLD
            },
            action: {
                type: 'show_tooltip',
                helpContent: 'contextual_hover',
                delay: 500,
                dismissible: true
            },
            priority: 'low',
            enabled: true,
            cooldownPeriod: COOLDOWN_PERIODS.low
        });

        // エラートリガー
        this.triggerRules.set('error_help', {
            id: 'error_help',
            name: 'Error Help Trigger',
            condition: {
                type: 'error_threshold',
                threshold: this.config.onMultipleErrors
            },
            action: {
                type: 'display_modal',
                helpContent: 'error_recovery',
                persistent: true,
                dismissible: true
            },
            priority: 'high',
            enabled: true,
            cooldownPeriod: COOLDOWN_PERIODS.high
        });

        // スタック検出トリガー
        this.triggerRules.set('stuck_help', {
            id: 'stuck_help',
            name: 'Stuck Detection Trigger',
            condition: {
                type: 'click_repetition',
                threshold: STUCK_DETECTION_THRESHOLD,
                timeWindow: 10000
            },
            action: {
                type: 'show_walkthrough',
                helpContent: 'stuck_assistance',
                delay: 1000
            },
            priority: 'high',
            enabled: true,
            cooldownPeriod: COOLDOWN_PERIODS.normal
        });

        // 初回訪問トリガー
        this.triggerRules.set('first_visit_help', {
            id: 'first_visit_help',
            name: 'First Visit Help',
            condition: {
                type: 'first_visit'
            },
            action: {
                type: 'show_walkthrough',
                helpContent: 'welcome_guide',
                delay: 2000
            },
            priority: 'normal',
            enabled: true,
            cooldownPeriod: 0 // 一度だけ
        });
    }

    /**
     * グローバルイベントリスナーを設定
     */
    private setupGlobalListeners(): void {
        // 非アクティブ状態の監視
        document.addEventListener('mousemove', this.updateLastActivity.bind(this));
        document.addEventListener('keydown', this.updateLastActivity.bind(this));
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        document.addEventListener('error', this.handleGlobalError.bind(this), true);

        // 非アクティブ状態チェック
        setInterval(this.checkInactivity.bind(this), INACTIVITY_CHECK_INTERVAL);

        // 初回訪問チェック
        if (this.behaviorTracking.visitCount === 1) {
            this.triggerHelp('first_visit', {
                triggerSource: 'first_visit',
                userRequested: false
            });
        }

        // 訪問回数を保存
        localStorage.setItem('help_visit_count', this.behaviorTracking.visitCount.toString());
    }

    /**
     * 要素の追跡を開始
     */
    trackElement(element: HTMLElement, helpContent?: string): void {
        if (this.activeListeners.has(element)) {
            return; // 既に追跡中
        }

        const tracker: ElementTracker = {
            element,
            listeners: new Map(),
            metadata: {
                elementType: element.tagName.toLowerCase(),
                importance: calculateElementImportance(element),
                userInteractions: 0,
                lastInteraction: 0,
                helpRequests: 0
            }
        };

        // ホバーイベント
        if (this.config.onHover) {
            const hoverListener = this.createHoverListener(element, helpContent);
            const leaveListener = this.createLeaveListener(element);
            
            element.addEventListener('mouseenter', hoverListener);
            element.addEventListener('mouseleave', leaveListener);
            
            tracker.listeners.set('mouseenter', hoverListener);
            tracker.listeners.set('mouseleave', leaveListener);
        }

        // フォーカスイベント
        if (this.config.onFocus) {
            const focusListener = this.createFocusListener(element, helpContent);
            element.addEventListener('focus', focusListener);
            tracker.listeners.set('focus', focusListener);
        }

        // クリックイベント
        const clickListener = this.createClickListener(element);
        element.addEventListener('click', clickListener);
        tracker.listeners.set('click', clickListener);

        this.activeListeners.set(element, tracker);
    }

    /**
     * 要素の追跡を停止
     */
    untrackElement(element: HTMLElement): void {
        const tracker = this.activeListeners.get(element);
        if (!tracker) return;

        // イベントリスナーを削除
        tracker.listeners.forEach((listener, eventType) => {
            element.removeEventListener(eventType, listener);
        });

        this.activeListeners.delete(element);
    }

    /**
     * ホバーリスナーを作成
     */
    private createHoverListener(element: HTMLElement, helpContent?: string): EventListener {
        return (event: Event) => {
            this.behaviorTracking.hoverTracking.currentElement = element;
            this.behaviorTracking.hoverTracking.hoverStartTime = Date.now();

            setTimeout(() => {
                if (this.behaviorTracking.hoverTracking.currentElement === element) {
                    this.triggerHelp('hover', {
                        targetElement: element,
                        duration: Date.now() - (this.behaviorTracking.hoverTracking.hoverStartTime || 0),
                        triggerSource: 'hover',
                        elementType: element.tagName.toLowerCase()
                    });
                }
            }, this.behaviorTracking.hoverTracking.hoverThreshold);
        };
    }

    /**
     * リーブリスナーを作成
     */
    private createLeaveListener(element: HTMLElement): EventListener {
        return (event: Event) => {
            if (this.behaviorTracking.hoverTracking.currentElement === element) {
                this.behaviorTracking.hoverTracking.currentElement = null;
                this.behaviorTracking.hoverTracking.hoverStartTime = null;
            }
        };
    }

    /**
     * フォーカスリスナーを作成
     */
    private createFocusListener(element: HTMLElement, helpContent?: string): EventListener {
        return (event: Event) => {
            this.triggerHelp('focus', {
                targetElement: element,
                triggerSource: 'focus',
                elementType: element.tagName.toLowerCase()
            });
        };
    }

    /**
     * クリックリスナーを作成
     */
    private createClickListener(element: HTMLElement): EventListener {
        return (event: Event) => {
            const tracker = this.activeListeners.get(element);
            if (tracker) {
                tracker.metadata.userInteractions++;
                tracker.metadata.lastInteraction = Date.now();
            }

            // スタック検出
            if (this.behaviorTracking.stuckDetection.lastClickedElement === element) {
                this.behaviorTracking.stuckDetection.sameElementClicks++;
            } else {
                this.behaviorTracking.stuckDetection.sameElementClicks = 1;
                this.behaviorTracking.stuckDetection.lastClickedElement = element;
            }

            // スタック状態の判定
            if (this.behaviorTracking.stuckDetection.sameElementClicks >= STUCK_DETECTION_THRESHOLD) {
                this.triggerHelp('stuck', {
                    targetElement: element,
                    clickCount: this.behaviorTracking.stuckDetection.sameElementClicks,
                    triggerSource: 'stuck',
                    priority: 'high'
                });
            }

            this.sessionContext.totalInteractions++;
        };
    }

    /**
     * グローバルクリックハンドラー
     */
    private handleGlobalClick(event: Event): void {
        this.updateLastActivity();
        
        // スタック検出のリセット（異なる要素がクリックされた場合）
        const target = event.target as HTMLElement;
        if (target !== this.behaviorTracking.stuckDetection.lastClickedElement) {
            this.behaviorTracking.stuckDetection.sameElementClicks = 0;
        }
    }

    /**
     * グローバルエラーハンドラー
     */
    private handleGlobalError(event: ErrorEvent): void {
        this.behaviorTracking.errorCount++;
        this.sessionContext.errorRate = this.behaviorTracking.errorCount / this.sessionContext.totalInteractions;

        if (this.config.onError && this.behaviorTracking.errorCount >= this.config.onMultipleErrors) {
            this.triggerHelp('error', {
                errorType: event.error?.name || 'Unknown',
                errorCount: this.behaviorTracking.errorCount,
                triggerSource: 'error',
                priority: 'high',
                immediate: true
            });
        }
    }

    /**
     * 最終活動時間を更新
     */
    private updateLastActivity(): void {
        this.behaviorTracking.lastActivity = Date.now();
        
        if (this.behaviorTracking.inactivityTimer) {
            clearTimeout(this.behaviorTracking.inactivityTimer);
            this.behaviorTracking.inactivityTimer = null;
        }
    }

    /**
     * 非アクティブ状態をチェック
     */
    private checkInactivity(): void {
        const inactivityDuration = Date.now() - this.behaviorTracking.lastActivity;
        
        if (inactivityDuration >= this.config.onInactivity && !this.behaviorTracking.inactivityTimer) {
            this.behaviorTracking.inactivityTimer = window.setTimeout(() => {
                this.triggerHelp('inactivity', {
                    inactivityDuration,
                    triggerSource: 'inactivity',
                    priority: 'normal'
                });
            }, 1000);
        }
    }

    /**
     * ヘルプトリガーのコールバックを登録
     */
    onTrigger(eventType: TriggerEventType, callback: HelpTriggerCallback): void {
        if (!this.triggerCallbacks.has(eventType)) {
            this.triggerCallbacks.set(eventType, []);
        }
        this.triggerCallbacks.get(eventType)!.push(callback);
    }

    /**
     * ヘルプトリガーのコールバックを削除
     */
    offTrigger(eventType: TriggerEventType, callback: HelpTriggerCallback): void {
        const callbacks = this.triggerCallbacks.get(eventType);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * ヘルプをトリガー
     */
    triggerHelp(eventType: TriggerEventType, context: TriggerContext = {}): boolean {
        const rule = this.findApplicableRule(eventType, context);
        if (!rule) {
            return false;
        }

        // クールダウンチェック
        if (rule.lastTriggered && (Date.now() - rule.lastTriggered) < rule.cooldownPeriod) {
            this.recordTriggerEvent(eventType, context, rule, 'cooldown');
            return false;
        }

        // ルールが無効な場合
        if (!rule.enabled) {
            this.recordTriggerEvent(eventType, context, rule, 'disabled');
            return false;
        }

        // コールバックを実行
        const callbacks = this.triggerCallbacks.get(eventType);
        if (callbacks && callbacks.length > 0) {
            callbacks.forEach(callback => {
                try {
                    callback(context);
                } catch (error) {
                    console.error('[HelpTriggerManager] Callback error:', error);
                }
            });

            rule.lastTriggered = Date.now();
            this.recordTriggerEvent(eventType, context, rule, 'triggered');
            this.updateMetrics(eventType, true);
            return true;
        }

        this.recordTriggerEvent(eventType, context, rule, 'ignored');
        this.updateMetrics(eventType, false);
        return false;
    }

    /**
     * 適用可能なルールを検索
     */
    private findApplicableRule(eventType: TriggerEventType, context: TriggerContext): TriggerRule | null {
        for (const rule of this.triggerRules.values()) {
            if (this.matchesCondition(rule.condition, eventType, context)) {
                return rule;
            }
        }
        return null;
    }

    /**
     * 条件に一致するかチェック
     */
    private matchesCondition(condition: TriggerCondition, eventType: TriggerEventType, context: TriggerContext): boolean {
        switch (condition.type) {
            case 'element_hover':
                return eventType === 'hover' && (context.duration || 0) >= (condition.threshold || HOVER_THRESHOLD);
            
            case 'element_focus':
                return eventType === 'focus';
            
            case 'error_threshold':
                return eventType === 'error' && (context.errorCount || 0) >= (condition.threshold || 1);
            
            case 'click_repetition':
                return eventType === 'stuck' && (context.clickCount || 0) >= (condition.threshold || STUCK_DETECTION_THRESHOLD);
            
            case 'time_inactivity':
                return eventType === 'inactivity' && (context.inactivityDuration || 0) >= (condition.threshold || this.config.onInactivity);
            
            case 'first_visit':
                return eventType === 'first_visit' && this.behaviorTracking.visitCount === 1;
            
            default:
                return false;
        }
    }

    /**
     * トリガーイベントを記録
     */
    private recordTriggerEvent(eventType: TriggerEventType, context: TriggerContext, rule: TriggerRule, outcome: TriggerOutcome): void {
        const event: TriggerEvent = {
            id: generateTriggerId(),
            timestamp: Date.now(),
            type: eventType,
            context,
            rule,
            outcome
        };

        this.triggerHistory.push(event);

        // 履歴のサイズ制限
        if (this.triggerHistory.length > 1000) {
            this.triggerHistory = this.triggerHistory.slice(-500);
        }
    }

    /**
     * メトリクスを更新
     */
    private updateMetrics(eventType: TriggerEventType, successful: boolean): void {
        this.metrics.totalTriggers++;
        
        if (successful) {
            this.metrics.successfulTriggers++;
        } else {
            this.metrics.ignoredTriggers++;
        }

        if (!this.metrics.triggersByType[eventType]) {
            this.metrics.triggersByType[eventType] = 0;
        }
        this.metrics.triggersByType[eventType]++;
    }

    /**
     * 手動でヘルプをリクエスト
     */
    requestHelp(targetElement?: HTMLElement, helpContent?: string): void {
        this.sessionContext.helpRequestCount++;
        
        this.triggerHelp('request', {
            targetElement,
            userRequested: true,
            triggerSource: 'request',
            immediate: true,
            priority: 'high'
        });
    }

    /**
     * 設定を更新
     */
    updateConfig(newConfig: Partial<TriggerConfig>): void {
        Object.assign(this.config, newConfig);
    }

    /**
     * トリガールールを追加
     */
    addRule(rule: TriggerRule): void {
        this.triggerRules.set(rule.id, rule);
    }

    /**
     * トリガールールを削除
     */
    removeRule(ruleId: string): boolean {
        return this.triggerRules.delete(ruleId);
    }

    /**
     * トリガールールを更新
     */
    updateRule(ruleId: string, updates: Partial<TriggerRule>): boolean {
        const rule = this.triggerRules.get(ruleId);
        if (rule) {
            Object.assign(rule, updates);
            return true;
        }
        return false;
    }

    /**
     * メトリクスを取得
     */
    getMetrics(): TriggerMetrics {
        return { ...this.metrics };
    }

    /**
     * トリガー履歴を取得
     */
    getTriggerHistory(limit?: number): TriggerEvent[] {
        const history = [...this.triggerHistory];
        return limit ? history.slice(-limit) : history;
    }

    /**
     * セッション情報を取得
     */
    getSessionContext(): SessionContext {
        return { ...this.sessionContext };
    }

    /**
     * 追跡中の要素一覧を取得
     */
    getTrackedElements(): HTMLElement[] {
        return Array.from(this.activeListeners.keys());
    }

    /**
     * 全ての追跡を停止
     */
    stopAllTracking(): void {
        const elements = Array.from(this.activeListeners.keys());
        elements.forEach(element => this.untrackElement(element));
    }

    /**
     * マネージャーを破棄
     */
    destroy(): void {
        this.stopAllTracking();
        
        // タイマーをクリア
        if (this.behaviorTracking.inactivityTimer) {
            clearTimeout(this.behaviorTracking.inactivityTimer);
        }

        // グローバルリスナーを削除（実際の実装では参照を保存して削除）
        this.triggerCallbacks.clear();
        this.triggerRules.clear();
        this.triggerHistory = [];
        
        console.log('[HelpTriggerManager] Manager destroyed');
    }
}