/**
 * HelpTriggerManager - ヘルプトリガー管理システム
 * 
 * ユーザーの行動パターンを監視し、適切なタイミングでヘルプを表示するトリガーを管理
 */

export class HelpTriggerManager {
    constructor() {
        this.triggers = {
            onHover: true,
            onFocus: true,
            onError: true,
            onStuck: true,
            onRequest: true,
            onFirstVisit: true,
            onInactivity: 5000,
            onMultipleErrors: 3
        };
        
        this.userBehavior = {
            errorCount: 0,
            inactivityTimer: null,
            lastActivity: Date.now(),
            visitCount: this.getVisitCount(),
            stuckDetection: {
                sameElementClicks: 0,
                lastClickedElement: null,
                timeThreshold: 10000
            },
            hoverTracking: {
                currentElement: null,
                hoverStartTime: null,
                hoverThreshold: 2000
            }
        };
        
        this.triggerCallbacks = new Map();
        this.activeListeners = new Map();
        
        this.initializeTriggers();
    }

    /**
     * トリガーを初期化
     */
    initializeTriggers() {
        this.setupHoverTriggers();
        this.setupFocusTriggers();
        this.setupErrorTriggers();
        this.setupStuckDetection();
        this.setupInactivityDetection();
        this.setupFirstVisitTrigger();
        this.setupKeyboardTriggers();
    }

    /**
     * ホバートリガーを設定
     */
    setupHoverTriggers() {
        if (!this.triggers.onHover) return;
        
        const hoverHandler = (e) => {
            this.userBehavior.hoverTracking.currentElement = e.target;
            this.userBehavior.hoverTracking.hoverStartTime = Date.now();
            
            setTimeout(() => {
                if (this.userBehavior.hoverTracking.currentElement === e.target) {
                    this.triggerHelp('hover', {
                        targetElement: e.target,
                        duration: Date.now() - this.userBehavior.hoverTracking.hoverStartTime
                    });
                }
            }, this.userBehavior.hoverTracking.hoverThreshold);
        };
        
        const hoverLeaveHandler = () => {
            this.userBehavior.hoverTracking.currentElement = null;
            this.userBehavior.hoverTracking.hoverStartTime = null;
        };
        
        document.addEventListener('mouseover', hoverHandler);
        document.addEventListener('mouseleave', hoverLeaveHandler);
        
        this.activeListeners.set('hover', { hoverHandler, hoverLeaveHandler });
    }

    /**
     * フォーカストリガーを設定
     */
    setupFocusTriggers() {
        if (!this.triggers.onFocus) return;
        
        const focusHandler = (e) => {
            // インタラクティブ要素のフォーカス時のみ
            if (this.isInteractiveElement(e.target)) {
                setTimeout(() => {
                    if (document.activeElement === e.target) {
                        this.triggerHelp('focus', {
                            targetElement: e.target,
                            elementType: e.target.tagName.toLowerCase()
                        });
                    }
                }, 1000); // 1秒後にヘルプ表示
            }
        };
        
        document.addEventListener('focusin', focusHandler);
        this.activeListeners.set('focus', { focusHandler });
    }

    /**
     * エラートリガーを設定
     */
    setupErrorTriggers() {
        if (!this.triggers.onError) return;
        
        // グローバルエラーハンドラ
        const errorHandler = (error) => {
            this.userBehavior.errorCount++;
            
            this.triggerHelp('error', {
                errorType: error.type || 'unknown',
                errorCount: this.userBehavior.errorCount,
                immediate: true
            });
            
            // 複数エラーチェック
            if (this.userBehavior.errorCount >= this.triggers.onMultipleErrors) {
                this.triggerHelp('multipleErrors', {
                    errorCount: this.userBehavior.errorCount,
                    priority: 'high'
                });
            }
        };
        
        window.addEventListener('error', errorHandler);
        window.addEventListener('unhandledrejection', errorHandler);
        
        this.activeListeners.set('error', { errorHandler });
    }

    /**
     * スタック検出を設定
     */
    setupStuckDetection() {
        if (!this.triggers.onStuck) return;
        
        const clickHandler = (e) => {
            const currentElement = e.target;
            const stuckData = this.userBehavior.stuckDetection;
            
            if (stuckData.lastClickedElement === currentElement) {
                stuckData.sameElementClicks++;
                
                // 同じ要素を短時間で複数回クリック
                if (stuckData.sameElementClicks >= 3) {
                    this.triggerHelp('stuck', {
                        targetElement: currentElement,
                        clickCount: stuckData.sameElementClicks,
                        priority: 'high'
                    });
                    
                    // リセット
                    stuckData.sameElementClicks = 0;
                    stuckData.lastClickedElement = null;
                }
            } else {
                stuckData.sameElementClicks = 1;
                stuckData.lastClickedElement = currentElement;
                
                // タイムアウト後にリセット
                setTimeout(() => {
                    stuckData.sameElementClicks = 0;
                    stuckData.lastClickedElement = null;
                }, stuckData.timeThreshold);
            }
            
            this.updateLastActivity();
        };
        
        document.addEventListener('click', clickHandler);
        this.activeListeners.set('stuck', { clickHandler });
    }

    /**
     * 非アクティブ検出を設定
     */
    setupInactivityDetection() {
        if (!this.triggers.onInactivity || this.triggers.onInactivity <= 0) return;
        
        const activityHandler = () => {
            this.updateLastActivity();
        };
        
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, activityHandler, { passive: true });
        });
        
        this.startInactivityTimer();
        this.activeListeners.set('inactivity', { activityHandler, events });
    }

    /**
     * 初回訪問トリガーを設定
     */
    setupFirstVisitTrigger() {
        if (!this.triggers.onFirstVisit) return;
        
        if (this.userBehavior.visitCount === 1) {
            setTimeout(() => {
                this.triggerHelp('firstVisit', {
                    priority: 'high',
                    persistent: true
                });
            }, 2000); // 2秒後に表示
        }
    }

    /**
     * キーボードトリガーを設定
     */
    setupKeyboardTriggers() {
        const keyHandler = (e) => {
            // F1キーでヘルプ要求
            if (e.key === 'F1') {
                e.preventDefault();
                this.triggerHelp('request', {
                    targetElement: document.activeElement,
                    priority: 'high',
                    userRequested: true
                });
            }
            
            // Ctrl+H でヘルプ要求
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                this.triggerHelp('request', {
                    targetElement: document.activeElement,
                    priority: 'high',
                    userRequested: true
                });
            }
            
            this.updateLastActivity();
        };
        
        document.addEventListener('keydown', keyHandler);
        this.activeListeners.set('keyboard', { keyHandler });
    }

    /**
     * 最後のアクティビティを更新
     */
    updateLastActivity() {
        this.userBehavior.lastActivity = Date.now();
        this.restartInactivityTimer();
    }

    /**
     * 非アクティブタイマーを開始
     */
    startInactivityTimer() {
        this.restartInactivityTimer();
    }

    /**
     * 非アクティブタイマーを再開
     */
    restartInactivityTimer() {
        if (this.userBehavior.inactivityTimer) {
            clearTimeout(this.userBehavior.inactivityTimer);
        }
        
        this.userBehavior.inactivityTimer = setTimeout(() => {
            this.triggerHelp('inactivity', {
                inactivityDuration: Date.now() - this.userBehavior.lastActivity,
                priority: 'medium'
            });
        }, this.triggers.onInactivity);
    }

    /**
     * ヘルプをトリガー
     */
    triggerHelp(triggerType, context = {}) {
        const callback = this.triggerCallbacks.get(triggerType);
        if (callback) {
            callback(triggerType, context);
        }
        
        // デフォルトコールバック
        const defaultCallback = this.triggerCallbacks.get('default');
        if (defaultCallback && !callback) {
            defaultCallback(triggerType, context);
        }
        
        this.logTrigger(triggerType, context);
    }

    /**
     * トリガーコールバックを登録
     */
    onTrigger(triggerType, callback) {
        this.triggerCallbacks.set(triggerType, callback);
    }

    /**
     * デフォルトトリガーコールバックを登録
     */
    onDefaultTrigger(callback) {
        this.triggerCallbacks.set('default', callback);
    }

    /**
     * インタラクティブ要素かチェック
     */
    isInteractiveElement(element) {
        const interactiveTags = ['button', 'input', 'select', 'textarea', 'a'];
        const interactiveRoles = ['button', 'link', 'tab', 'menuitem'];
        
        return interactiveTags.includes(element.tagName.toLowerCase()) ||
               interactiveRoles.includes(element.getAttribute('role')) ||
               element.hasAttribute('tabindex') ||
               element.hasAttribute('onclick');
    }

    /**
     * 訪問回数を取得
     */
    getVisitCount() {
        const stored = localStorage.getItem('bubblePop_visitCount');
        const count = stored ? parseInt(stored, 10) + 1 : 1;
        localStorage.setItem('bubblePop_visitCount', count.toString());
        return count;
    }

    /**
     * トリガーをログ
     */
    logTrigger(triggerType, context) {
        if (console && console.log) {
            console.log(`[ContextualHelp] Trigger: ${triggerType}`, context);
        }
        
        // アナリティクスに送信（実装されている場合）
        if (window.gameAnalytics && window.gameAnalytics.trackEvent) {
            window.gameAnalytics.trackEvent('help_trigger', {
                trigger_type: triggerType,
                context: JSON.stringify(context)
            });
        }
    }

    /**
     * エラーカウントをリセット
     */
    resetErrorCount() {
        this.userBehavior.errorCount = 0;
    }

    /**
     * スタック検出をリセット
     */
    resetStuckDetection() {
        this.userBehavior.stuckDetection.sameElementClicks = 0;
        this.userBehavior.stuckDetection.lastClickedElement = null;
    }

    /**
     * トリガー設定を更新
     */
    updateTriggers(newTriggers) {
        Object.assign(this.triggers, newTriggers);
        
        // 非アクティブ検出の更新
        if ('onInactivity' in newTriggers) {
            if (this.triggers.onInactivity > 0) {
                this.restartInactivityTimer();
            } else {
                this.stopInactivityTimer();
            }
        }
    }

    /**
     * 非アクティブタイマーを停止
     */
    stopInactivityTimer() {
        if (this.userBehavior.inactivityTimer) {
            clearTimeout(this.userBehavior.inactivityTimer);
            this.userBehavior.inactivityTimer = null;
        }
    }

    /**
     * 特定のトリガーを有効/無効
     */
    setTriggerEnabled(triggerType, enabled) {
        this.triggers[triggerType] = enabled;
        
        // リスナーの再設定が必要な場合
        if (triggerType === 'onHover') {
            this.removeListeners('hover');
            if (enabled) this.setupHoverTriggers();
        } else if (triggerType === 'onFocus') {
            this.removeListeners('focus');
            if (enabled) this.setupFocusTriggers();
        } else if (triggerType === 'onError') {
            this.removeListeners('error');
            if (enabled) this.setupErrorTriggers();
        } else if (triggerType === 'onStuck') {
            this.removeListeners('stuck');
            if (enabled) this.setupStuckDetection();
        } else if (triggerType === 'onInactivity') {
            this.removeListeners('inactivity');
            if (enabled) this.setupInactivityDetection();
        }
    }

    /**
     * リスナーを削除
     */
    removeListeners(type) {
        const listeners = this.activeListeners.get(type);
        if (!listeners) return;
        
        switch (type) {
            case 'hover':
                document.removeEventListener('mouseover', listeners.hoverHandler);
                document.removeEventListener('mouseleave', listeners.hoverLeaveHandler);
                break;
            case 'focus':
                document.removeEventListener('focusin', listeners.focusHandler);
                break;
            case 'error':
                window.removeEventListener('error', listeners.errorHandler);
                window.removeEventListener('unhandledrejection', listeners.errorHandler);
                break;
            case 'stuck':
                document.removeEventListener('click', listeners.clickHandler);
                break;
            case 'inactivity':
                listeners.events.forEach(event => {
                    document.removeEventListener(event, listeners.activityHandler);
                });
                this.stopInactivityTimer();
                break;
            case 'keyboard':
                document.removeEventListener('keydown', listeners.keyHandler);
                break;
        }
        
        this.activeListeners.delete(type);
    }

    /**
     * 統計情報を取得
     */
    getStats() {
        return {
            errorCount: this.userBehavior.errorCount,
            visitCount: this.userBehavior.visitCount,
            lastActivity: this.userBehavior.lastActivity,
            inactivityDuration: Date.now() - this.userBehavior.lastActivity,
            triggersActive: Object.keys(this.triggers).filter(key => this.triggers[key])
        };
    }

    /**
     * クリーンアップ
     */
    destroy() {
        // すべてのリスナーを削除
        this.activeListeners.forEach((_, type) => {
            this.removeListeners(type);
        });
        
        // タイマーをクリア
        this.stopInactivityTimer();
        
        // コールバックをクリア
        this.triggerCallbacks.clear();
    }
}