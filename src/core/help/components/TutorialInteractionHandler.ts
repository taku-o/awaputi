/**
 * TutorialInteractionHandler.ts
 * チュートリアルインタラクション処理システム
 * TutorialOverlayから分離されたユーザー操作処理機能
 */

import { getErrorHandler  } from '../../../utils/ErrorHandler.js';
import { LoggingSystem  } from '../../LoggingSystem.js';

// 型定義
export interface Position { x: number,
    y: number  }

export interface InteractionState { isListening: boolean,
    isDragging: boolean,
    isScrolling: boolean,
    lastTouchPosition: Position,
    touchStartTime: number,
    gestureRecognition: {
        enable,d: boolean,
        threshold: number,
    timeWindow: number }

export interface KeyboardNavigation { enabled: boolean,
    currentFocusIndex: number,
    focusableElements: HTMLElement[],
    shortcuts: {
        nex,t: string[],
        previous: string[],
        skip: string[],
        complete: string[],
    help: string[]  }

export interface AccessibilityConfig { enabled: boolean,
    highContrast: boolean,
    largeText: boolean,
    screenReaderMode: boolean,
    reducedMotion: boolean,
    keyboardNavigation: boolean,
    focusIndicators: boolean,
    announcements: boolean,
    textSizeMultiplier: number  }

export interface GestureConfig { callback: (() => void) | null,
    enabled: boolean,
    duration?: number 
    }

export interface Gestures { swipeLeft: GestureConfig,
    swipeRight: GestureConfig,
    swipeUp: GestureConfig,
    swipeDown: GestureConfig,
    tap: GestureConfig,
    doubleTap: GestureConfig,
    longPress: GestureConfig
    }

export interface PointerState { isDown: boolean,
    startPosition: Position,
    currentPosition: Position,
    startTime: number,
    lastTapTime: number,
    tapCount: number }

export interface InteractionCallbacks { onNext: (() => void) | null,
    onPrevious: (() => void) | null,
    onSkip: (() => void) | null,
    onComplete: (() => void) | null,
    onClose: (() => void) | null,
    onHelp: (() => void) | null,
    onResize: (() => void) | null,
    onInteraction: ((data: any) => void) | null 
    }

export type BoundHandlers = { [K in keyof DocumentEventMap]?: (event: DocumentEventMap[K]) => void  }
};

export class TutorialInteractionHandler {
    private errorHandler: any,
    private loggingSystem: LoggingSystem,
    private boundHandlers: BoundHandlers,
    private interactionState: InteractionState,
    private keyboardNavigation: KeyboardNavigation,
    private accessibility: AccessibilityConfig,
    private gestures: Gestures,
    private pointerState: PointerState,
    private, callbacks: InteractionCallbacks,
    constructor() {

        this.errorHandler = getErrorHandler(),
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem(),
        
        // イベントハンドラー
        this.boundHandlers = {
            keydown: this.handleKeydown.bind(this),
            resize: this.handleResize.bind(this),
            click: this.handleOverlayClick.bind(this),
            touchstart: this.handleTouchStart.bind(this),
            touchmove: this.handleTouchMove.bind(this),
            touchend: this.handleTouchEnd.bind(this,
    wheel: this.handleWheel.bind(this) }

            contextmenu: this.handleContextMenu.bind(this); 
    };
        
        // インタラクション状態
        this.interactionState = { isListening: false,
            isDragging: false,
    isScrolling: false }
            lastTouchPosition: { x: 0, y: 0  },
            touchStartTime: 0,
    gestureRecognition: { enabled: false,
                threshold: 50,
    timeWindow: 500 
    };
        // キーボードナビゲーション
        this.keyboardNavigation = { enabled: true,
            currentFocusIndex: 0,
            focusableElements: [],
    shortcuts: {''
                next: ['ArrowRight', 'Space', 'Tab'],
                previous: ['ArrowLeft', 'Shift+Tab],
                skip: ['Escape', 's'],
                complete: ['Enter'],
                help: ['F1', 'h] }
        };
        
        // アクセシビリティ設定
        this.accessibility = { enabled: false,
            highContrast: false,
            largeText: false,
            screenReaderMode: false,
            reducedMotion: false,
            keyboardNavigation: true,
            focusIndicators: true,
            announcements: true,
    textSizeMultiplier: 1.0  };
        // タッチジェスチャー
        this.gestures = {
            swipeLeft: { callback: null, enabled: true  },
            swipeRight: { callback: null, enabled: true  },
            swipeUp: { callback: null, enabled: true  },
            swipeDown: { callback: null, enabled: true  },
            tap: { callback: null, enabled: true  },
            doubleTap: { callback: null, enabled: true  },
            longPress: { callback: null, enabled: true, duration: 500  };
        
        // マウス・タッチ状態
        this.pointerState = { isDown: false }
            startPosition: { x: 0, y: 0  },
            currentPosition: { x: 0, y: 0  },
            startTime: 0;
            lastTapTime: 0,
    tapCount: 0;
        },
        
        // コールバック
        this.callbacks = { onNext: null,
            onPrevious: null,
            onSkip: null,
            onComplete: null,
            onClose: null,
            onHelp: null,
            onResize: null,
    onInteraction: null  };
        this.initialize();
    }
    
    /**
     * インタラクションハンドラーを初期化
     */
    initialize(): void { try {'
            this.setupAccessibility()',
            this.loggingSystem.debug('TutorialInteractionHandler', 'Interaction handler initialized',' }

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.initialize' }'
    }
    
    /**
     * イベントリスナーを開始
     */'
    startListening(): void { try {'
            if(this.interactionState.isListening) return,

            document.addEventListener('keydown', this.boundHandlers.keydown!',
            window.addEventListener('resize', this.boundHandlers.resize!',
            document.addEventListener('click', this.boundHandlers.click!',
            document.addEventListener('touchstart', this.boundHandlers.touchstart!, { passive: false )',''
            document.addEventListener('touchmove', this.boundHandlers.touchmove!, { passive: false )',''
            document.addEventListener('touchend', this.boundHandlers.touchend!',
            document.addEventListener('wheel', this.boundHandlers.wheel!, { passive: false )',''
            document.addEventListener('contextmenu', this.boundHandlers.contextmenu!',
            ',

            this.interactionState.isListening = true,
            this.loggingSystem.debug('TutorialInteractionHandler', 'Event listeners started',' }

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.startListening' }'
    }
    
    /**
     * イベントリスナーを停止
     */'
    stopListening(): void { try {'
            if(!this.interactionState.isListening) return,

            document.removeEventListener('keydown', this.boundHandlers.keydown',
            window.removeEventListener('resize', this.boundHandlers.resize',
            document.removeEventListener('click', this.boundHandlers.click',
            document.removeEventListener('touchstart', this.boundHandlers.touchstart',
            document.removeEventListener('touchmove', this.boundHandlers.touchmove',
            document.removeEventListener('touchend', this.boundHandlers.touchend',
            document.removeEventListener('wheel', this.boundHandlers.wheel',
            document.removeEventListener('contextmenu', this.boundHandlers.contextmenu',
            ',

            this.interactionState.isListening = false,
            this.loggingSystem.debug('TutorialInteractionHandler', 'Event listeners stopped',' }

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.stopListening' }'
    }
    
    /**
     * キーボードイベントを処理
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleKeydown(event) {
        try {
            if (!this.keyboardNavigation.enabled) return,
            
            const key = event.key,
            const keyCombo = this.getKeyCombo(event),
            
            // ショートカット処理
            if(this.isShortcutMatch(keyCombo, this.keyboardNavigation.shortcuts.next) {
                event.preventDefault() }
                this.triggerNext(); }
            } else if(this.isShortcutMatch(keyCombo, this.keyboardNavigation.shortcuts.previous) { event.preventDefault(),
                this.triggerPrevious() } else if(this.isShortcutMatch(keyCombo, this.keyboardNavigation.shortcuts.skip) { event.preventDefault(),
                this.triggerSkip() } else if(this.isShortcutMatch(keyCombo, this.keyboardNavigation.shortcuts.complete) { event.preventDefault(),
                this.triggerComplete() } else if(this.isShortcutMatch(keyCombo, this.keyboardNavigation.shortcuts.help) { event.preventDefault(),
                this.triggerHelp()',
            if(key === 'Tab' && !event.shiftKey' {', ' }

                this.handleTabNavigation(event, 1);' }'

            } else if (key === 'Tab' && event.shiftKey) { this.handleTabNavigation(event, -1) }
            
            // アクセシビリティアナウンス
            if (this.accessibility.announcements) { this.announceKeyAction(keyCombo),' }'

            } catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.handleKeydown' }'
    }
    
    /**
     * タッチ開始イベントを処理
     * @param {TouchEvent} event - タッチイベント
     */
    handleTouchStart(event) {
        try {
            const touch = event.touches[0],
            
            this.pointerState = {
    }
                isDown: true }
                startPosition: { x: touch.clientX, y: touch.clientY  },
                currentPosition: { x: touch.clientX, y: touch.clientY  },
                startTime: Date.now();
                lastTapTime: this.pointerState.lastTapTime,
    tapCount: this.pointerState.tapCount;
            },
            
            this.interactionState.lastTouchPosition = { x: touch.clientX, y: touch.clientY  }
            this.interactionState.touchStartTime = Date.now();
            
            // ロングプレス検出開始
            if (this.gestures.longPress.enabled) { this.startLongPressDetection(),' }'

            } catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.handleTouchStart' }'
    }
    
    /**
     * タッチ移動イベントを処理
     * @param {TouchEvent} event - タッチイベント
     */
    handleTouchMove(event) {
        try {
            if (!this.pointerState.isDown) return }
            const touch = event.touches[0]; }
            this.pointerState.currentPosition = { x: touch.clientX, y: touch.clientY  }
            // スワイプ検出のためドラッグ状態を更新
            const deltaX = Math.abs(touch.clientX - this.pointerState.startPosition.x);
            const deltaY = Math.abs(touch.clientY - this.pointerState.startPosition.y);
            
            if(deltaX > 10 || deltaY > 10) {
            
                this.interactionState.isDragging = true }
                this.cancelLongPressDetection();' }'

            } catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.handleTouchMove' }'
    }
    
    /**
     * タッチ終了イベントを処理
     * @param {TouchEvent} event - タッチイベント
     */
    handleTouchEnd(event) {
        try {
            if (!this.pointerState.isDown) return,
            
            const duration = Date.now() - this.pointerState.startTime,
            const deltaX = this.pointerState.currentPosition.x - this.pointerState.startPosition.x,
            const deltaY = this.pointerState.currentPosition.y - this.pointerState.startPosition.y,
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
            
            this.cancelLongPressDetection(),
            
            // ジェスチャー判定
            if (!this.interactionState.isDragging && distance < 10) {
    }
                this.handleTapGesture(duration); }
            } else if (this.interactionState.isDragging) { this.handleSwipeGesture(deltaX, deltaY, duration) }
            
            // 状態リセット
            this.pointerState.isDown = false;
            this.interactionState.isDragging = false;

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.handleTouchEnd' }'
    }
    
    /**
     * タップジェスチャーを処理
     * @param {number} duration - タップ継続時間
     */
    handleTapGesture(duration) {
        const currentTime = Date.now(),
        const timeSinceLastTap = currentTime - this.pointerState.lastTapTime,
        
        if (timeSinceLastTap < 300) {
            // ダブルタップ
            this.pointerState.tapCount++,
            if(this.pointerState.tapCount === 2 && this.gestures.doubleTap.enabled) {''
                this.triggerGesture('doubleTap) }
                this.pointerState.tapCount = 0; }
} else {  // シングルタップ
            this.pointerState.tapCount = 1,
            setTimeout(() => { }'

                if(this.pointerState.tapCount === 1 && this.gestures.tap.enabled) { }'

                    this.triggerGesture('tap'; }'
                }
                this.pointerState.tapCount = 0;
            }, 300);
        }
        
        this.pointerState.lastTapTime = currentTime;
    }
    
    /**
     * スワイプジェスチャーを処理
     * @param {number} deltaX - X軸移動量
     * @param {number} deltaY - Y軸移動量
     * @param {number} duration - スワイプ継続時間
     */
    handleSwipeGesture(deltaX, deltaY, duration) {
        const threshold = this.interactionState.gestureRecognition.threshold,
        const timeWindow = this.interactionState.gestureRecognition.timeWindow,
        
        if (duration > timeWindow) return,
        
        const absX = Math.abs(deltaX),
        const absY = Math.abs(deltaY),
        
        if (absX > threshold && absX > absY) {
            // 水平スワイプ
            if(deltaX > 0 && this.gestures.swipeRight.enabled) {
    }

                this.triggerGesture('swipeRight'; }

            } else if(deltaX < 0 && this.gestures.swipeLeft.enabled) { ''
                this.triggerGesture('swipeLeft' }'

        } else if (absY > threshold && absY > absX) { // 垂直スワイプ
            if(deltaY > 0 && this.gestures.swipeDown.enabled) {', ' }

                this.triggerGesture('swipeDown'; }

            } else if(deltaY < 0 && this.gestures.swipeUp.enabled) { ''
                this.triggerGesture('swipeUp' }'
}
    
    /**
     * オーバーレイクリックを処理
     * @param {MouseEvent} event - マウスイベント'
     */''
    handleOverlayClick(event) {
        try {
            // チュートリアル外をクリックした場合の処理
            if(event.target.classList.contains('tutorial-overlay-background' {''
                this.triggerNext() }

            this.triggerCallback('onInteraction', { type: 'click', event ',' }

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.handleOverlayClick' }'
    }
    
    /**
     * リサイズイベントを処理
     * @param {Event} event - リサイズイベント'
     */''
    handleResize(event) {
        try {'
            this.triggerCallback('onResize', { event )' }

            this.loggingSystem.debug('TutorialInteractionHandler', 'Window resized'; }

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.handleResize' }'
    }
    
    /**
     * ホイールイベントを処理
     * @param {WheelEvent} event - ホイールイベント
     */
    handleWheel(event) {
        try {
            // チュートリアル中のスクロールを防止
            event.preventDefault(),
            this.interactionState.isScrolling = true }
            setTimeout(() => {  }
                this.interactionState.isScrolling = false; }
            }, 100);

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.handleWheel' }'
    }
    
    /**
     * コンテキストメニューを処理
     * @param {Event} event - コンテキストメニューイベント
     */
    handleContextMenu(event) {
        try {
            // チュートリアル中はコンテキストメニューを無効化
    }
            event.preventDefault();' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.handleContextMenu' }'
    }
    
    /**
     * ロングプレス検出を開始
     */
    startLongPressDetection() {
        this.longPressTimer = setTimeout(() => { }

            if(this.pointerState.isDown && !this.interactionState.isDragging) { }'

                this.triggerGesture('longPress'; }'
}, this.gestures.longPress.duration);
    }
    
    /**
     * ロングプレス検出をキャンセル
     */
    cancelLongPressDetection() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer) }
            this.longPressTimer = null; }
}
    
    /**
     * ジェスチャーをトリガー
     * @param {string} gestureType - ジェスチャータイプ
     */
    triggerGesture(gestureType) {
        const gesture = this.gestures[gestureType],

        if (gesture && gesture.enabled && gesture.callback) {
    }

            gesture.callback(gestureType); }
        }

        this.loggingSystem.debug('TutorialInteractionHandler', `Gesture triggered: ${gestureType}`}';
    }
    
    /**
     * アクション系メソッド'
     */''
    triggerNext()';
        this.triggerCallback('onNext);
    }

    triggerPrevious()';
        this.triggerCallback('onPrevious);
    }

    triggerSkip()';
        this.triggerCallback('onSkip);
    }

    triggerComplete()';
        this.triggerCallback('onComplete);
    }

    triggerClose()';
        this.triggerCallback('onClose);
    }

    triggerHelp()';
        this.triggerCallback('onHelp';
    }
    
    /**
     * コールバックをトリガー
     * @param {string} callbackName - コールバック名
     * @param {*} data - 追加データ'
     */''
    triggerCallback(callbackName, data = null) {
        try {
            const callback = this.callbacks[callbackName],
            if(callback && typeof, callback === 'function' { }

                callback(data);' }'

            } catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.triggerCallback' }'
    }
    
    /**
     * コールバックを設定
     * @param callbackName - コールバック名
     * @param callback - コールバック関数
     */
    setCallback(callbackName: keyof InteractionCallbacks, callback: (() => void) | ((data: any) => void) | null): void { if (this.callbacks.hasOwnProperty(callbackName) {
            this.callbacks[callbackName] = callback as any }
    }
    
    /**
     * ジェスチャーコールバックを設定
     * @param gestureType - ジェスチャータイプ
     * @param callback - コールバック関数
     */
    setGestureCallback(gestureType: keyof Gestures, callback: (() => void) | null): void { if (this.gestures[gestureType]) {
            this.gestures[gestureType].callback = callback }
    }
    
    /**
     * キーコンボを取得
     * @param event - キーボードイベント
     * @returns キーコンボ文字列
     */'
    getKeyCombo(event: KeyboardEvent): string { const parts: string[] = [],''
        if(event.ctrlKey) parts.push('Ctrl',
        if(event.altKey) parts.push('Alt',
        if(event.shiftKey) parts.push('Shift',
        if(event.metaKey) parts.push('Meta',
        parts.push(event.key),
        return parts.join('+' }'
    
    /**
     * ショートカットマッチングを確認
     * @param keyCombo - キーコンボ
     * @param shortcuts - ショートカット配列
     * @returns マッチするかどうか
     */'
    isShortcutMatch(keyCombo: string, shortcuts: string[]): boolean { ''
        return shortcuts.includes(keyCombo) || shortcuts.includes(keyCombo.split('+'.pop() || ') }
    
    /**
     * タブナビゲーションを処理
     * @param {KeyboardEvent} event - キーボードイベント
     * @param {number} direction - 方向（1: 次, -1: 前）
     */
    handleTabNavigation(event, direction) {
        try {
            event.preventDefault(),
            
            const focusableElements = this.getFocusableElements(),
            if (focusableElements.length === 0) return,
            
            let newIndex = this.keyboardNavigation.currentFocusIndex + direction,
            
            if (newIndex >= focusableElements.length) {
    }
                newIndex = 0; }
            } else if (newIndex < 0) { newIndex = focusableElements.length - 1 }
            
            this.keyboardNavigation.currentFocusIndex = newIndex;
            focusableElements[newIndex].focus();

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.handleTabNavigation' }'
    }
    
    /**
     * フォーカス可能な要素を取得
     * @returns {Array} フォーカス可能な要素配列'
     */''
    getFocusableElements()';
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"]";
        ];

        return Array.from(document.querySelectorAll(selectors.join(', '));

            .filter(element => {  )'
                return element.offsetParent !== null && ',' }'

                       getComputedStyle(element).visibility !== 'hidden'; }
            }';
    }
    
    /**
     * アクセシビリティを設定'
     */''
    setupAccessibility()';
            this.accessibility.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            this.accessibility.highContrast = window.matchMedia('(prefers-contrast: high)').matches,
            // スクリーンリーダー検出（簡易版）
            this.accessibility.screenReaderMode = navigator.userAgent.includes('NVDA') || ';
                                                  navigator.userAgent.includes('JAWS') ||;
                                                  window.speechSynthesis !== undefined;

            this.loggingSystem.debug('TutorialInteractionHandler', 'Accessibility settings configured', this.accessibility';} catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.setupAccessibility' }'
    }
    
    /**
     * キーアクションをアナウンス
     * @param {string} keyCombo - キーコンボ
     */
    announceKeyAction(keyCombo) {

        if(!this.accessibility.announcements || !this.accessibility.screenReaderMode) return,
        ',

        try {'
            let message = ',

            if(this.isShortcutMatch(keyCombo, this.keyboardNavigation.shortcuts.next)) {
    }

                message = '次のステップに進みます'; }

            } else if(this.isShortcutMatch(keyCombo, this.keyboardNavigation.shortcuts.previous)) { ''
                message = '前のステップに戻ります',' }

            } else if(this.isShortcutMatch(keyCombo, this.keyboardNavigation.shortcuts.skip)) { ''
                message = 'このステップをスキップします',' }

            } else if(this.isShortcutMatch(keyCombo, this.keyboardNavigation.shortcuts.help)) { ''
                message = 'ヘルプを表示します' }
            
            if(message && window.speechSynthesis) {
            
                const utterance = new SpeechSynthesisUtterance(message),
                utterance.rate = 0.8,
                utterance.volume = 0.7 }

                window.speechSynthesis.speak(utterance);' }'

            } catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.announceKeyAction' }'
    }
    
    /**
     * アクセシビリティ設定を更新
     * @param {Object} settings - 新しい設定
     */
    updateAccessibilitySettings(settings) {

        Object.assign(this.accessibility, settings) }

        this.loggingSystem.debug('TutorialInteractionHandler', 'Accessibility settings updated', settings); }
    }
    
    /**
     * ジェスチャー設定を更新
     * @param {Object} gestureSettings - ジェスチャー設定
     */
    updateGestureSettings(gestureSettings) {

        Object.assign(this.gestures, gestureSettings) }

        this.loggingSystem.debug('TutorialInteractionHandler', 'Gesture settings updated', gestureSettings); }
    }
    
    /**
     * リソースをクリーンアップ
     */
    dispose() {
        try {
            this.stopListening(),
            this.cancelLongPressDetection(),
            
            // コールバックをクリア
            Object.keys(this.callbacks).forEach(key => { )
                this.callbacks[key] = null),
            
            // ジェスチャーコールバックをクリア
    }
            Object.keys(this.gestures).forEach(key => {) }
                this.gestures[key].callback = null);' }'

            }');

            this.loggingSystem.debug('TutorialInteractionHandler', 'Interaction handler disposed';} catch (error) {
            this.errorHandler.handleError(error, 'TutorialInteractionHandler.dispose') }

    }'}