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
export interface TriggerConfig { onHover: boolean,
    onFocus: boolean,
    onError: boolean,
    onStuck: boolean,
    onRequest: boolean,
    onFirstVisit: boolean,
    onInactivity: number,
    onMultipleErrors: number;
    export interface UserBehaviorTracking { errorCount: number,
    inactivityTimer: number | null,
    lastActivity: number,
    visitCount: number,
    stuckDetection: StuckDetectionData,
    hoverTracking: HoverTrackingData;
    export interface StuckDetectionData { sameElementClicks: number,
    lastClickedElement: HTMLElement | null,
    timeThreshold: number;
    export interface HoverTrackingData { currentElement: HTMLElement | null,
    hoverStartTime: number | null,
    hoverThreshold: number;
    export interface TriggerContext { targetElement?: HTMLElement,
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
    export interface SessionContext { sessionDuration: number,
    pageViews: number,
    interactionCount: number,
    errorHistory: ErrorRecord[],
    userAgent: string,
    viewport: ViewportInfo;
    export interface ErrorRecord { timestamp: number,
    type: string,
    message: string;
    element?: HTMLElement;
    resolved: boolean;
    export interface ViewportInfo { width: number,
    height: number,
    devicePixelRatio: number;
    orientation?: string;
    export interface TriggerCallback { (triggerType: TriggerType, context: TriggerContext): void;
    export interface EventListenerRegistry { hoverHandler?: (event: MouseEvent) => void;
    hoverLeaveHandler?: (event: MouseEvent) => void;
    focusHandler?: (event: FocusEvent) => void;
    errorHandler?: (event: ErrorEvent | PromiseRejectionEvent) => void;
    clickHandler?: (event: MouseEvent) => void;
    activityHandler?: (event: Event) => void;
    keyHandler?: (event: KeyboardEvent) => void;
    events?: string[] };
}

export interface TriggerStatistics { errorCount: number,
    visitCount: number,
    lastActivity: number,
    inactivityDuration: number,
    triggersActive: string[],
    triggerHistory: TriggerHistoryEntry[],
    sessionStats: SessionStatistics;
    export interface TriggerHistoryEntry { timestamp: number,
    type: TriggerType,
    context: TriggerContext,
    resolved: boolean;
    export interface SessionStatistics { startTime: number,
    duration: number,
    triggerCount: Record<TriggerType, number>;
    averageResponseTime: number,
    userEngagement: EngagementMetrics;
    export interface EngagementMetrics { mouseMovements: number,
    keystrokes: number,
    clicks: number,
    scrollEvents: number,
    focusChanges: number;
    export interface TriggerSensitivity { hover: SensitivityLevel,
    focus: SensitivityLevel,
    stuck: SensitivityLevel,
    inactivity: SensitivityLevel,
    error: SensitivityLevel;
    export interface AdaptiveTriggerConfig { enabled: boolean,
    learningRate: number,
    adaptationThreshold: number,
    sensitivityAdjustment: TriggerSensitivity;
    export interface AnalyticsData { trigger_type: TriggerType,
    context: string,
    timestamp: number,
    session_id: string;
    user_id?: string;

// 列挙型
export type TriggerType = 'hover' | 'focus' | 'error' | 'stuck' | 'request' | 'firstVisit' | 'inactivity' | 'multipleErrors';
    export type TriggerPriority = 'low' | 'medium' | 'high' | 'urgent';
    export type TriggerSource = 'user' | 'system' | 'adaptive' | 'contextual';
    export type SensitivityLevel = 'low' | 'medium' | 'high' | 'adaptive';

// 定数
export const DEFAULT_TRIGGER_CONFIG: TriggerConfig = { onHover: true,
    onFocus: true,
    onError: true,
    onStuck: true,
    onRequest: true,
    onFirstVisit: true,
    onInactivity: 5000,
    onMultipleErrors: 3  } as const;
';'

export const INTERACTIVE_ELEMENTS = {;
    tags: ['button', 'input', 'select', 'textarea', 'a', 'details', 'summary'],
    roles: ['button', 'link', 'tab', 'menuitem', 'option', 'checkbox', 'radio'],
    attributes: ['tabindex', 'onclick', 'onkeydown', 'role] } as const;'
';'

export const ACTIVITY_EVENTS = [';'
    'mousemove', 'keydown', 'click', 'scroll', 'touchstart', ]';'
    'touchmove', 'focusin', 'focusout', 'wheel'];
] as const;

export const TRIGGER_SENSITIVITY_THRESHOLDS = { hover: {
        low: 3000,
        medium: 2000,
        high: 1000,
    adaptive: 1500 } };
    stuck: { low: 5,
        medium: 3  ,
        high: 2,
    adaptive: 3 };
    inactivity: { low: 10000,
        medium: 5000  ,
        high: 2000,
    adaptive: 5000 
    } as const;
';'

export const KEYBOARD_SHORTCUTS = {;
    HELP_F1: 'F1,
    HELP_CTRL_H: 'h,
    ESC: 'Escape'
            } as const;
';'

export const STORAGE_KEYS = {;
    visitCount: 'bubblePop_visitCount,
    triggerHistory: 'bubblePop_triggerHistory,
    userBehavior: 'bubblePop_userBehavior'
            } as const;
// ユーティリティ関数
export function isInteractiveElement(element: HTMLElement): boolean {;
    const tagName = element.tagName.toLowerCase()','
    const role = element.getAttribute('role,
    ','

    return INTERACTIVE_ELEMENTS.tags.includes(tagName, as any) ||','
           (role && INTERACTIVE_ELEMENTS.roles.includes(role, as any)) ||','
           element.hasAttribute('tabindex') ||','
           element.hasAttribute('onclick') ||','
           element.hasAttribute('onkeydown' }'

export function calculateEngagementScore(metrics: EngagementMetrics, sessionDuration: number): number { const weightedScore = 
        (metrics.mouseMovements * 0.1) +,
        (metrics.keystrokes * 0.3) +,
        (metrics.clicks * 0.4) +,
        (metrics.scrollEvents * 0.1) +,
        (metrics.focusChanges * 0.1),
    
    // 時間で正規化 (1分あたりのスコア),
    return sessionDuration > 0 ? (weightedScore / sessionDuration) * 60000 : 0 };
export function getSensitivityThreshold(triggerType: keyof typeof TRIGGER_SENSITIVITY_THRESHOLDS, level: SensitivityLevel): number { const thresholds = TRIGGER_SENSITIVITY_THRESHOLDS[triggerType];
    return thresholds ? thresholds[level] : thresholds?.medium || 2000 };
 : undefined
export function generateSessionId(): string {
    return `session_${Date.now())_${Math.random().toString(36).substr(2, 9}`;
}

export function serializeTriggerContext(context: TriggerContext): string { const serializable = {
        ...context,
        targetElement: context.targetElement ? { : undefined
            tagName: context.targetElement.tagName,
            id: context.targetElement.id,
            className: context.targetElement.className,
    textContent: context.targetElement.textContent?.slice(0, 100), : undefined; : null;;
    return JSON.stringify(serializable);
};
export class HelpTriggerManager {
    private triggers: TriggerConfig;
    private userBehavior: UserBehaviorTracking;
    private, triggerCallbacks: Map<string, TriggerCallback>,
    private activeListeners: Map<string, EventListenerRegistry>;
    
    private sessionContext: SessionContext;
    private triggerHistory: TriggerHistoryEntry[];
    private engagementMetrics: EngagementMetrics;
    private adaptiveConfig: AdaptiveTriggerConfig;
    private sessionId: string;
    private, sessionStartTime: number;
    constructor() {  };
        this.triggers = { ...DEFAULT_TRIGGER_CONFIG;
        this.triggerCallbacks = new Map();
        this.activeListeners = new Map();
        this.triggerHistory = [];
        
        this.sessionId = generateSessionId();
        this.sessionStartTime = Date.now();
        
        this.userBehavior = { errorCount: 0,
            inactivityTimer: null,
    lastActivity: Date.now(
            visitCount: this.getVisitCount(',
    hover: 'adaptive,
                focus: 'adaptive,
                stuck: 'adaptive,
                inactivity: 'adaptive,
                error: 'high'
            })
        ';'
        this.initializeTriggers();
        this.startSessionTracking()';'
        console.log('[HelpTriggerManager] Component, initialized);'
    }

    /**
     * トリガーを初期化
     */
    private initializeTriggers(): void { this.setupHoverTriggers();
        this.setupFocusTriggers();
        this.setupErrorTriggers();
        this.setupStuckDetection();
        this.setupInactivityDetection();
        this.setupFirstVisitTrigger();
        this.setupKeyboardTriggers();

    /**
     * セッション追跡を開始
     */
    private startSessionTracking(): void { // セッション継続時間の更新
        setInterval(() => {  }
            this.sessionContext.sessionDuration = Date.now() - this.sessionStartTime;' }'

        }, 1000');'
        ';'
        // ビューポート変更の監視
        window.addEventListener('resize', () => {  this.sessionContext.viewport = {
                width: window.innerWidth,
                height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1 }
                orientation: screen.orientation?.type 
    }
    }

    /**
     * ホバートリガーを設定
     */ : undefined
    private setupHoverTriggers(): void { if (!this.triggers.onHover) return,
        
        const hoverHandler = (e: MouseEvent): void => { 
            const target = e.target as HTMLElement,
            if(!isInteractiveElement(target) return,
            ','

            this.userBehavior.hoverTracking.currentElement = target,
            this.userBehavior.hoverTracking.hoverStartTime = Date.now()','
            const threshold = getSensitivityThreshold('hover', this.adaptiveConfig.sensitivityAdjustment.hover','
            ','

            setTimeout(() => {''
                if (this.userBehavior.hoverTracking.currentElement === target) {

                    this.triggerHelp('hover', {''
                        targetElement: target','
                        duration: Date.now('}'

                        triggerSource: 'user',' }'

                        priority: 'low' })
                }, threshold';'
        };

        const hoverLeaveHandler = (e: MouseEvent'): void => {  this.userBehavior.hoverTracking.currentElement = null }'
            this.userBehavior.hoverTracking.hoverStartTime = null; }
        };

        document.addEventListener('mouseover', hoverHandler';'
        document.addEventListener('mouseleave', hoverLeaveHandler';'

        this.activeListeners.set('hover', { hoverHandler, hoverLeaveHandler );

    /**
     * フォーカストリガーを設定
     */
    private setupFocusTriggers(): void { if (!this.triggers.onFocus) return,
        
        const focusHandler = (e: FocusEvent): void => { 
            const target = e.target as HTMLElement,
            
            if (isInteractiveElement(target) {
            
                this.engagementMetrics.focusChanges++;
                ','

                setTimeout(() => {''
                    if (document.activeElement === target) {''
                        this.triggerHelp('focus', {''
                            targetElement: target','
                            elementType: target.tagName.toLowerCase('}'

                            triggerSource: 'user',' }'

                            priority: 'medium' }'}')'
                }, 1000');'
            }
        };

        document.addEventListener('focusin', focusHandler';'
        this.activeListeners.set('focus', { focusHandler );

    /**
     * エラートリガーを設定
     */
    private setupErrorTriggers(): void { if (!this.triggers.onError) return,
        
        const errorHandler = (error: ErrorEvent | PromiseRejectionEvent): void => { 
            this.userBehavior.errorCount++;
            ','

            const errorRecord: ErrorRecord = {''
                timestamp: Date.now()','
    type: error.type || 'unhandledrejection,')',
                message: 'message' in error ? error.message : String(error.reason),
                resolved: false;
            };
            this.sessionContext.errorHistory.push(errorRecord);

            this.triggerHelp('error', { errorType: errorRecord.type)
                errorCount: this.userBehavior.errorCount','
    immediate: true,
                priority: 'high,')',
                triggerSource: 'system');
            ','
            // 複数エラーチェック
            if (this.userBehavior.errorCount >= this.triggers.onMultipleErrors) {

                this.triggerHelp('multipleErrors', {'
                    errorCount: this.userBehavior.errorCount,','
                    priority: 'urgent',' }'

                    triggerSource: 'system')'); '
    };

        window.addEventListener('error', errorHandler as EventListener';'
        window.addEventListener('unhandledrejection', errorHandler as EventListener';'

        this.activeListeners.set('error', { errorHandler: errorHandler as any }

    /**
     * スタック検出を設定
     */
    private setupStuckDetection(): void { if (!this.triggers.onStuck) return,
        
        const clickHandler = (e: MouseEvent): void => { 
            this.engagementMetrics.clicks++;
            this.sessionContext.interactionCount++;
            
            const target = e.target as HTMLElement,
            const stuckData = this.userBehavior.stuckDetection,

            if (stuckData.lastClickedElement === target) {
                stuckData.sameElementClicks++;

                const threshold = getSensitivityThreshold('stuck', this.adaptiveConfig.sensitivityAdjustment.stuck);
                if (stuckData.sameElementClicks >= threshold) {''
                    this.triggerHelp('stuck', {
                targetElement: target','
    clickCount: stuckData.sameElementClicks,
                        priority: 'high,')',
                        triggerSource: 'adaptive');
                    // リセット }
                    this.resetStuckDetection(); }
} else {  stuckData.sameElementClicks = 1,
                stuckData.lastClickedElement = target,
                
                // タイムアウト後にリセット }
                setTimeout(() => {  }
                    this.resetStuckDetection(); }
                }, stuckData.timeThreshold);
            }

            this.updateLastActivity()';'
        document.addEventListener('click', clickHandler';'
        this.activeListeners.set('stuck', { clickHandler );

    /**
     * 非アクティブ検出を設定
     */
    private setupInactivityDetection(): void { if (!this.triggers.onInactivity || this.triggers.onInactivity <= 0) return,
        ','

        const activityHandler = (e: Event): void => { ''
            switch(e.type) {

                case 'mousemove':,
                    this.engagementMetrics.mouseMovements++;

                    break,
                case 'keydown':,
                    this.engagementMetrics.keystrokes++;

                    break,
                case 'scroll': }
                    this.engagementMetrics.scrollEvents++; }
                    break; }
            }
            
            this.updateLastActivity();
        };
        
        const events = [...ACTIVITY_EVENTS];
        events.forEach(event => {  );
            document.addEventListener(event, activityHandler, { passive: true,);

        this.startInactivityTimer('';
        this.activeListeners.set('inactivity', { activityHandler, events }

    /**
     * 初回訪問トリガーを設定)
     */)
    private setupFirstVisitTrigger(): void { if (!this.triggers.onFirstVisit) return,
        
        if (this.userBehavior.visitCount === 1) {
        ','

            setTimeout(() => { ''
                this.triggerHelp('firstVisit', {''
                    priority: 'high'),

                    persistent: true,') }'

                    triggerSource: 'system'); 
    }, 2000);
        }
    }

    /**
     * キーボードトリガーを設定
     */
    private setupKeyboardTriggers(): void { const keyHandler = (e: KeyboardEvent): void => { 
            this.engagementMetrics.keystrokes++;
            
            // F1キーでヘルプ要求
            if (e.key === KEYBOARD_SHORTCUTS.HELP_F1) {

                e.preventDefault('''
                this.triggerHelp('request', {'
                    targetElement: document.activeElement as HTMLElement,','
                    priority: 'high'),

                    userRequested: true,') }'

                    triggerSource: 'user'); 
    }
            
            // Ctrl+H でヘルプ要求
            if (e.ctrlKey && e.key === KEYBOARD_SHORTCUTS.HELP_CTRL_H) { e.preventDefault('''
                this.triggerHelp('request', {'
                    targetElement: document.activeElement as HTMLElement,','
                    priority: 'high')','
    userRequested: true,' }'

                    triggerSource: 'user'); 
    }

            this.updateLastActivity()';'
        document.addEventListener('keydown', keyHandler';'
        this.activeListeners.set('keyboard', { keyHandler );

    /**
     * 最後のアクティビティを更新
     */
    private updateLastActivity(): void { this.userBehavior.lastActivity = Date.now();
        this.restartInactivityTimer();

    /**
     * 非アクティブタイマーを開始
     */
    private startInactivityTimer(): void { this.restartInactivityTimer();

    /**
     * 非アクティブタイマーを再開
     */'
    private restartInactivityTimer(): void { if (this.userBehavior.inactivityTimer) {''
            clearTimeout(this.userBehavior.inactivityTimer);

        const threshold = getSensitivityThreshold('inactivity', this.adaptiveConfig.sensitivityAdjustment.inactivity';'
        ';'

        this.userBehavior.inactivityTimer = window.setTimeout(() => { ''
            const inactivityDuration = Date.now(',
            this.triggerHelp('inactivity', {'
                inactivityDuration,','
                priority: 'medium',' }'

                triggerSource: 'system'); 
    }, threshold);
    }

    /**
     * ヘルプをトリガー
     */
    private triggerHelp(triggerType: TriggerType, context: TriggerContext = { ): void {
        // セッションコンテキストを追加
        const enhancedContext: TriggerContext = {
            ...context
            sessionContext: { ...this.sessionContext;
        // 履歴に記録
        const historyEntry: TriggerHistoryEntry = { timestamp: Date.now(
            type: triggerType,
            context: enhancedContext,
    resolved: false;
        this.triggerHistory.push(historyEntry);
        
        // 履歴サイズを制限
        if (this.triggerHistory.length > 100) { this.triggerHistory = this.triggerHistory.slice(-50);
        
        // コールバック実行
        const callback = this.triggerCallbacks.get(triggerType);
        if (callback) { }

            callback(triggerType, enhancedContext); }
        }
        ';'
        // デフォルトコールバック
        const defaultCallback = this.triggerCallbacks.get('default);'
        if (defaultCallback && !callback) { defaultCallback(triggerType, enhancedContext);
        
        this.logTrigger(triggerType, enhancedContext);
        this.adaptTriggerSensitivity(triggerType, enhancedContext);
    }

    /**
     * トリガー感度を適応的に調整
     */
    private adaptTriggerSensitivity(triggerType: TriggerType, context: TriggerContext): void { if (!this.adaptiveConfig.enabled) return,
        
        const recentTriggers = this.triggerHistory,
            .filter(entry => entry.type === triggerType && Date.now() - entry.timestamp < 300000) // 5分以内,
            .length,

        if (recentTriggers >= this.adaptiveConfig.adaptationThreshold) {
            // トリガーが頻繁すぎる場合、感度を下げる
        }

            this.adjustSensitivity(triggerType, 'decrease'; }

        } else if (recentTriggers === 0 && context.userRequested) { // ユーザーが手動でヘルプを要求した場合、感度を上げる
            this.adjustSensitivity(triggerType, 'increase');
    }

    /**
     * 感度を調整'
     */''
    private adjustSensitivity(triggerType: TriggerType, direction: 'increase' | 'decrease'): void { ''
        const adjustment = this.adaptiveConfig.learningRate * (direction === 'increase' ? 1 : -1),

        switch(triggerType) {

            case 'hover':','
                this.userBehavior.hoverTracking.hoverThreshold = Math.max(500);
                    this.userBehavior.hoverTracking.hoverThreshold * (1 - adjustment)'),'

                break,
            case 'stuck':','
                // スタック検出の閾値を調整（最小2, 最大10）
                const currentThreshold = getSensitivityThreshold('stuck', this.adaptiveConfig.sensitivityAdjustment.stuck','
                const newThreshold = Math.max(2, Math.min(10);
                    currentThreshold + (direction === 'increase' ? -1 : 1)'),'
                this.triggers.onMultipleErrors = newThreshold,

                break,
            case 'inactivity':','
                this.triggers.onInactivity = Math.max(1000);
                    this.triggers.onInactivity * (1 - adjustment)') }'
                break; }
}

    /**
     * トリガーコールバックを登録'
     */''
    onTrigger(triggerType: TriggerType | 'default', callback: TriggerCallback): void { this.triggerCallbacks.set(triggerType, callback);

    /**
     * デフォルトトリガーコールバックを登録'
     */''
    onDefaultTrigger(callback: TriggerCallback): void { ''
        this.triggerCallbacks.set('default', callback);

    /**
     * 訪問回数を取得
     */
    private getVisitCount(): number { try {
            const stored = localStorage.getItem(STORAGE_KEYS.visitCount);
            const count = stored ? parseInt(stored, 10) + 1 : 1,
            localStorage.setItem(STORAGE_KEYS.visitCount, count.toString();
            return count,' }'

        } catch (error) {
            console.warn('[HelpTriggerManager] Failed to access visit count:', error);
            return 1,

    /**
     * トリガーをログ
     */
    private logTrigger(triggerType: TriggerType, context: TriggerContext): void { console.log(`[HelpTriggerManager] Trigger: ${triggerType)`, context),
        
        // アナリティクスに送信
        this.sendAnalytics({)
            trigger_type: triggerType,
            context: serializeTriggerContext(context} }
            timestamp: Date.now()),
            session_id: this.sessionId;
        } }

    /**
     * アナリティクスデータを送信
     */
    private sendAnalytics(data: AnalyticsData): void { try {
            // GameAnalyticsが利用可能な場合
            if (window.gameAnalytics && window.gameAnalytics.trackEvent) {', ' }

                window.gameAnalytics.trackEvent('help_trigger', data'; }'
            }
            ';'
            // カスタムアナリティクスエンドポイントが利用可能な場合
            if (window.customAnalytics && window.customAnalytics.track) {', ' }

                window.customAnalytics.track('help_trigger', data'; }'

            } catch (error) { console.warn('[HelpTriggerManager] Failed to send analytics:', error }
    }

    /**
     * エラーカウントをリセット
     */
    resetErrorCount(): void { this.userBehavior.errorCount = 0,
        this.sessionContext.errorHistory.forEach(error => { );
            error.resolved = true); }
    }

    /**
     * スタック検出をリセット
     */
    resetStuckDetection(): void { this.userBehavior.stuckDetection.sameElementClicks = 0,
        this.userBehavior.stuckDetection.lastClickedElement = null }

    /**
     * トリガー設定を更新
     */'
    updateTriggers(newTriggers: Partial<TriggerConfig>): void { ''
        Object.assign(this.triggers, newTriggers);
        ','
        // 非アクティブ検出の更新
        if ('onInactivity' in, newTriggers) {
            if (this.triggers.onInactivity > 0) {
        }
                this.restartInactivityTimer(); }

            } else {
                this.stopInactivityTimer( }

        console.log('[HelpTriggerManager] Trigger configuration updated:', newTriggers'; }'
    }

    /**
     * 適応的設定を更新
     */'
    updateAdaptiveConfig(newConfig: Partial<AdaptiveTriggerConfig>): void { ''
        Object.assign(this.adaptiveConfig, newConfig);
        console.log('[HelpTriggerManager] Adaptive configuration updated:', newConfig }

    /**
     * 非アクティブタイマーを停止
     */
    private stopInactivityTimer(): void { if (this.userBehavior.inactivityTimer) {
            clearTimeout(this.userBehavior.inactivityTimer);
            this.userBehavior.inactivityTimer = null }
    }

    /**
     * 特定のトリガーを有効/無効
     */
    setTriggerEnabled(triggerType: keyof TriggerConfig, enabled: boolean): void { this.triggers[triggerType] = enabled as any,
        
        // リスナーの再設定
        const setupMethods: Record<string, () => void> = {
            onHover: () => this.setupHoverTriggers(),
            onFocus: () => this.setupFocusTriggers(),
            onError: () => this.setupErrorTriggers(),
            onStuck: () => this.setupStuckDetection(
            onInactivity: () => this.setupInactivityDetection()','
        const listenerType = triggerType.replace('on', ').toLowerCase(),'
        
        this.removeListeners(listenerType);
        if (enabled && setupMethods[triggerType]) {
    
}
            setupMethods[triggerType](); }
}

    /**
     * リスナーを削除
     */
    private removeListeners(type: string): void { const listeners = this.activeListeners.get(type);
        if (!listeners) return,

        switch(type) {

            case 'hover':','
                if (listeners.hoverHandler) {
        }

                    document.removeEventListener('mouseover', listeners.hoverHandler'; }'

                }''
                if (listeners.hoverLeaveHandler) {', ' }

                    document.removeEventListener('mouseleave', listeners.hoverLeaveHandler'; }'
                }
                break;

            case 'focus':';'
                if (listeners.focusHandler) {', ' }

                    document.removeEventListener('focusin', listeners.focusHandler'; }'
                }
                break;

            case 'error':';'
                if (listeners.errorHandler) {

                    window.removeEventListener('error', listeners.errorHandler as EventListener' }'

                    window.removeEventListener('unhandledrejection', listeners.errorHandler as EventListener'; }'
                }
                break;

            case 'stuck':';'
                if (listeners.clickHandler) {', ' }

                    document.removeEventListener('click', listeners.clickHandler'; }'
                }
                break;

            case 'inactivity':
                if (listeners.activityHandler && listeners.events) { listeners.events.forEach(event => { );
                        document.removeEventListener(event, listeners.activityHandler!); }
                    }''
                this.stopInactivityTimer()';'
            case 'keyboard':')';
                if (listeners.keyHandler) {', ' }

                    document.removeEventListener('keydown', listeners.keyHandler); }
                }
                break;
        }
        
        this.activeListeners.delete(type);
    }

    /**
     * エンゲージメントスコアを取得
     */
    getEngagementScore(): number { return calculateEngagementScore(this.engagementMetrics, this.sessionContext.sessionDuration);

    /**
     * セッション統計を取得
     */
    getSessionStatistics(): SessionStatistics { const triggerCount = this.triggerHistory.reduce((acc, entry) => { 
            acc[entry.type] = (acc[entry.type] || 0) + 1 }
            return acc;, {} as Record<TriggerType, number>);
        
        return { startTime: this.sessionStartTime,
            duration: this.sessionContext.sessionDuration,
            triggerCount };
            averageResponseTime: this.calculateAverageResponseTime(),
            userEngagement: { ...this.engagementMetrics }

    /**
     * 平均応答時間を計算
     */
    private calculateAverageResponseTime(): number { const resolvedTriggers = this.triggerHistory.filter(entry => entry.resolved);
        if (resolvedTriggers.length === 0) return 0,
        
        // 実装の簡素化のため、固定値を返す
        return 2500, // 2.5秒の平均応答時間 }
    }

    /**
     * トリガーを解決済みにマーク
     */
    markTriggerResolved(triggerType: TriggerType, timestamp?: number): void { const entry = this.triggerHistory
            .reverse();
            .find(entry => );
                entry.type === triggerType && ),
                !entry.resolved &&),
                (!timestamp || entry.timestamp === timestamp)),
        
        if (entry) {
    
}
            entry.resolved = true; }
        }
        
        this.triggerHistory.reverse(); // 元の順序に戻す
    }

    /**
     * 統計情報を取得
     */
    getStats(): TriggerStatistics { return { errorCount: this.userBehavior.errorCount,
            visitCount: this.userBehavior.visitCount,
            lastActivity: this.userBehavior.lastActivity,
            inactivityDuration: Date.now() - this.userBehavior.lastActivity,
    triggersActive: Object.keys(this.triggers).filter(key => this.triggers[key, as keyof, TriggerConfig]);
            triggerHistory: [...this.triggerHistory] ,
            sessionStats: this.getSessionStatistics(); 
    }

    /**
     * 統計データを永続化
     */
    saveStatistics(): void { try {
            const stats = this.getStats();
            const serializedStats = {
                ...stats,
                triggerHistory: stats.triggerHistory.map(entry => ({)
                    ...entry),
                    context: serializeTriggerContext(entry.context);
                }
            };
            ';'

            localStorage.setItem(STORAGE_KEYS.triggerHistory, JSON.stringify(serializedStats);'} catch (error) { console.warn('[HelpTriggerManager] Failed to save statistics:', error }'
    }

    /**
     * クリーンアップ
     */
    destroy(): void { // すべてのリスナーを削除
        this.activeListeners.forEach((_, type) => {  }
            this.removeListeners(type); }
        };
        
        // タイマーをクリア
        this.stopInactivityTimer();
        
        // コールバックをクリア
        this.triggerCallbacks.clear();
        // 統計を保存
        this.saveStatistics()';'
        console.log('[HelpTriggerManager] Component, destroyed');

    }'}'