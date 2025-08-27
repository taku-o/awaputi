/**
 * LeaderboardEventHandler.js
 * リーダーボードイベント処理システム
 * LeaderboardUIから分離されたイベント処理・ユーザーインタラクション機能
 */

import { getErrorHandler } from '../../../utils/ErrorHandler.js';

export class LeaderboardEventHandler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
        
        // イベント設定
        this.eventConfig = {
            clickThreshold: 300, // ms
            doubleClickThreshold: 500, // ms
            hoverDelay: 100, // ms
            touchThreshold: 10, // px
            keyboardRepeatDelay: 150, // ms
            wheelSensitivity: 1.0,
            gestureMinDistance: 50 // px
        };
        
        // イベント状態
        this.eventState = {
            lastClickTime: 0,
            lastClickTarget: null,
            clickCount: 0,
            lastHoverTarget: null,
            hoverTimer: null,
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            lastKeyTime: 0,
            lastKeyCode: null,
            touches: new Map()
        };
        
        // コールバック管理
        this.callbacks = {
            onClick: new Set(),
            onDoubleClick: new Set(),
            onHover: new Set(),
            onHoverEnd: new Set(),
            onScroll: new Set(),
            onKeyDown: new Set(),
            onViewChange: new Set(),
            onSortChange: new Set(),
            onEntrySelect: new Set(),
            onDetailsToggle: new Set(),
            onRefresh: new Set()
        };
        
        // キーボードショートカット
        this.shortcuts = {
            'ArrowUp': 'selectPrevious',
            'ArrowDown': 'selectNext',
            'Enter': 'openDetails',
            'Escape': 'closeDetails',
            'r': 'refresh',
            'f': 'filter',
            'PageUp': 'pageUp',
            'PageDown': 'pageDown',
            'Home': 'goToTop',
            'End': 'goToBottom'
        };
        
        // タッチジェスチャー
        this.gestures = {
            swipeUp: { distance: 50, direction: 'vertical', velocity: 0.5 },
            swipeDown: { distance: 50, direction: 'vertical', velocity: 0.5 },
            swipeLeft: { distance: 50, direction: 'horizontal', velocity: 0.5 },
            swipeRight: { distance: 50, direction: 'horizontal', velocity: 0.5 },
            pinchZoom: { threshold: 1.2 },
            longPress: { duration: 500 }
        };
        
        // UI要素の座標情報
        this.uiElements = {
            tabs: [],
            sortOptions: [],
            entries: [],
            buttons: [],
            scrollbar: null
        };
        
        // 現在の選択状態
        this.selectionState = {
            selectedView: 'overall',
            selectedSort: 'score',
            selectedEntry: null,
            selectedEntryIndex: -1,
            showingDetails: false
        };
        
        this.initialize();
    }
    
    /**
     * イベントハンドラーを初期化
     */
    initialize() {
        try {
            console.log('[LeaderboardEventHandler] Event handler initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardEventHandler.initialize');
        }
    }
    
    /**
     * クリックイベントを処理
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} options - オプション
     */
    handleClick(x, y, options = {}) {
        try {
            const currentTime = Date.now();
            const target = this.getTargetAt(x, y);
            
            // ダブルクリック検出
            const isDoubleClick = 
                currentTime - this.eventState.lastClickTime < this.eventConfig.doubleClickThreshold &&
                this.eventState.lastClickTarget === target;
            
            if (isDoubleClick) {
                this.handleDoubleClick(x, y, target, options);
                this.eventState.clickCount = 0;
            } else {
                this.handleSingleClick(x, y, target, options);
                this.eventState.clickCount = 1;
            }
            
            this.eventState.lastClickTime = currentTime;
            this.eventState.lastClickTarget = target;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardEventHandler.handleClick');
        }
    }
    
    /**
     * シングルクリックを処理
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} target - ターゲット
     * @param {Object} options - オプション
     */
    handleSingleClick(x, y, target, options) {
        if (!target) return;
        
        switch (target.type) {
            case 'tab':
                this.handleTabClick(target);
                break;
                
            case 'sortOption':
                this.handleSortClick(target);
                break;
                
            case 'entry':
                this.handleEntryClick(target);
                break;
                
            case 'button':
                this.handleButtonClick(target);
                break;
                
            case 'scrollbar':
                this.handleScrollbarClick(x, y, target);
                break;
                
            default:
                // 背景クリック - 詳細を閉じる
                if (this.selectionState.showingDetails) {
                    this.closeDetails();
                }
        }
        
        // コールバック実行
        this.executeCallbacks('onClick', { x, y, target, options });
    }
    
    /**
     * ダブルクリックを処理
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} target - ターゲット
     * @param {Object} options - オプション
     */
    handleDoubleClick(x, y, target, options) {
        if (target && target.type === 'entry') {
            // エントリーダブルクリック - 詳細表示
            this.toggleDetails(target.data);
        }
        
        // コールバック実行
        this.executeCallbacks('onDoubleClick', { x, y, target, options });
    }
    
    /**
     * ホバーイベントを処理
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} options - オプション
     */
    handleHover(x, y, options = {}) {
        try {
            const target = this.getTargetAt(x, y);
            
            // 前回と同じターゲットの場合はスキップ
            if (this.eventState.lastHoverTarget === target) {
                return;
            }
            
            // 前のホバーを終了
            if (this.eventState.lastHoverTarget) {
                this.handleHoverEnd(this.eventState.lastHoverTarget);
            }
            
            // 新しいホバーを開始
            if (target) {
                this.startHover(target, options);
            }
            
            this.eventState.lastHoverTarget = target;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardEventHandler.handleHover');
        }
    }
    
    /**
     * ホバー開始
     * @param {Object} target - ターゲット
     * @param {Object} options - オプション
     */
    startHover(target, options) {
        // ホバー遅延
        if (this.eventState.hoverTimer) {
            clearTimeout(this.eventState.hoverTimer);
        }
        
        this.eventState.hoverTimer = setTimeout(() => {
            // コールバック実行
            this.executeCallbacks('onHover', { target, options });
        }, this.eventConfig.hoverDelay);
    }
    
    /**
     * ホバー終了を処理
     * @param {Object} target - ターゲット
     */
    handleHoverEnd(target) {
        if (this.eventState.hoverTimer) {
            clearTimeout(this.eventState.hoverTimer);
            this.eventState.hoverTimer = null;
        }
        
        // コールバック実行
        this.executeCallbacks('onHoverEnd', { target });
    }
    
    /**
     * スクロールイベントを処理
     * @param {number} deltaX - X方向スクロール量
     * @param {number} deltaY - Y方向スクロール量
     * @param {Object} options - オプション
     */
    handleScroll(deltaX, deltaY, options = {}) {
        try {
            const scrollAmount = deltaY * this.eventConfig.wheelSensitivity;
            
            // コールバック実行
            this.executeCallbacks('onScroll', { 
                deltaX, 
                deltaY: scrollAmount, 
                options 
            });
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardEventHandler.handleScroll');
        }
    }
    
    /**
     * キーボードイベントを処理
     * @param {string} keyCode - キーコード
     * @param {Object} options - オプション
     */
    handleKeyDown(keyCode, options = {}) {
        try {
            const currentTime = Date.now();
            
            // キーボードリピート制御
            if (this.eventState.lastKeyCode === keyCode &&
                currentTime - this.eventState.lastKeyTime < this.eventConfig.keyboardRepeatDelay) {
                return;
            }
            
            this.eventState.lastKeyCode = keyCode;
            this.eventState.lastKeyTime = currentTime;
            
            // ショートカット処理
            const action = this.shortcuts[keyCode];
            if (action) {
                this.executeShortcut(action, options);
            }
            
            // コールバック実行
            this.executeCallbacks('onKeyDown', { keyCode, action, options });
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardEventHandler.handleKeyDown');
        }
    }
    
    /**
     * タッチ開始イベントを処理
     * @param {Array} touches - タッチポイント配列
     * @param {Object} options - オプション
     */
    handleTouchStart(touches, options = {}) {
        try {
            touches.forEach(touch => {
                this.eventState.touches.set(touch.identifier, {
                    startX: touch.clientX,
                    startY: touch.clientY,
                    currentX: touch.clientX,
                    currentY: touch.clientY,
                    startTime: Date.now(),
                    moved: false
                });
            });
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardEventHandler.handleTouchStart');
        }
    }
    
    /**
     * タッチ移動イベントを処理
     * @param {Array} touches - タッチポイント配列
     * @param {Object} options - オプション
     */
    handleTouchMove(touches, options = {}) {
        try {
            touches.forEach(touch => {
                const touchData = this.eventState.touches.get(touch.identifier);
                if (!touchData) return;
                
                const deltaX = touch.clientX - touchData.currentX;
                const deltaY = touch.clientY - touchData.currentY;
                
                touchData.currentX = touch.clientX;
                touchData.currentY = touch.clientY;
                
                const totalDeltaX = touch.clientX - touchData.startX;
                const totalDeltaY = touch.clientY - touchData.startY;
                
                // 移動閾値チェック
                if (Math.abs(totalDeltaX) > this.eventConfig.touchThreshold ||
                    Math.abs(totalDeltaY) > this.eventConfig.touchThreshold) {
                    touchData.moved = true;
                }
                
                // スクロール処理（単一タッチ）
                if (this.eventState.touches.size === 1) {
                    this.handleScroll(deltaX, deltaY, { isTouchEvent: true });
                }
            });
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardEventHandler.handleTouchMove');
        }
    }
    
    /**
     * タッチ終了イベントを処理
     * @param {Array} touches - タッチポイント配列
     * @param {Object} options - オプション
     */
    handleTouchEnd(touches, options = {}) {
        try {
            touches.forEach(touch => {
                const touchData = this.eventState.touches.get(touch.identifier);
                if (!touchData) return;
                
                const duration = Date.now() - touchData.startTime;
                const totalDeltaX = touch.clientX - touchData.startX;
                const totalDeltaY = touch.clientY - touchData.startY;
                
                // タップ判定
                if (!touchData.moved && duration < this.eventConfig.clickThreshold) {
                    this.handleClick(touch.clientX, touch.clientY, { isTouchEvent: true });
                }
                
                // ジェスチャー判定
                else if (touchData.moved) {
                    this.detectGesture(totalDeltaX, totalDeltaY, duration);
                }
                
                this.eventState.touches.delete(touch.identifier);
            });
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardEventHandler.handleTouchEnd');
        }
    }
    
    /**
     * ジェスチャーを検出
     * @param {number} deltaX - X方向移動量
     * @param {number} deltaY - Y方向移動量
     * @param {number} duration - 時間
     */
    detectGesture(deltaX, deltaY, duration) {
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const velocity = distance / duration;
        
        // スワイプジェスチャー
        if (distance > this.eventConfig.gestureMinDistance && velocity > 0.3) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 横方向スワイプ
                const gesture = deltaX > 0 ? 'swipeRight' : 'swipeLeft';
                this.handleGesture(gesture, { deltaX, deltaY, velocity });
            } else {
                // 縦方向スワイプ
                const gesture = deltaY > 0 ? 'swipeDown' : 'swipeUp';
                this.handleGesture(gesture, { deltaX, deltaY, velocity });
            }
        }
    }
    
    /**
     * ジェスチャーを処理
     * @param {string} gestureType - ジェスチャータイプ
     * @param {Object} data - ジェスチャーデータ
     */
    handleGesture(gestureType, data) {
        switch (gestureType) {
            case 'swipeUp':
                this.handleScroll(0, -50, { isGesture: true });
                break;
                
            case 'swipeDown':
                this.handleScroll(0, 50, { isGesture: true });
                break;
                
            case 'swipeLeft':
                this.switchToNextView();
                break;
                
            case 'swipeRight':
                this.switchToPreviousView();
                break;
        }
    }
    
    /**
     * タブクリックを処理
     * @param {Object} target - ターゲット
     */
    handleTabClick(target) {
        if (target.view !== this.selectionState.selectedView) {
            this.selectionState.selectedView = target.view;
            this.executeCallbacks('onViewChange', { view: target.view });
        }
    }
    
    /**
     * ソートクリックを処理
     * @param {Object} target - ターゲット
     */
    handleSortClick(target) {
        if (target.sortBy !== this.selectionState.selectedSort) {
            this.selectionState.selectedSort = target.sortBy;
            this.executeCallbacks('onSortChange', { sortBy: target.sortBy });
        }
    }
    
    /**
     * エントリークリックを処理
     * @param {Object} target - ターゲット
     */
    handleEntryClick(target) {
        this.selectionState.selectedEntry = target.data;
        this.selectionState.selectedEntryIndex = target.index;
        this.executeCallbacks('onEntrySelect', { entry: target.data, index: target.index });
    }
    
    /**
     * ボタンクリックを処理
     * @param {Object} target - ターゲット
     */
    handleButtonClick(target) {
        switch (target.action) {
            case 'refresh':
                this.executeCallbacks('onRefresh', {});
                break;
                
            case 'closeDetails':
                this.closeDetails();
                break;
                
            case 'filter':
                // フィルター機能（将来実装）
                break;
                
            case 'export':
                // エクスポート機能（将来実装）
                break;
        }
    }
    
    /**
     * スクロールバークリックを処理
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} target - ターゲット
     */
    handleScrollbarClick(x, y, target) {
        // スクロールバーの位置計算
        const relativeY = y - target.bounds.y;
        const scrollRatio = relativeY / target.bounds.height;
        
        this.executeCallbacks('onScroll', { 
            scrollRatio, 
            isScrollbarClick: true 
        });
    }
    
    /**
     * ショートカットを実行
     * @param {string} action - アクション
     * @param {Object} options - オプション
     */
    executeShortcut(action, options) {
        switch (action) {
            case 'selectPrevious':
                this.selectPreviousEntry();
                break;
                
            case 'selectNext':
                this.selectNextEntry();
                break;
                
            case 'openDetails':
                if (this.selectionState.selectedEntry) {
                    this.openDetails(this.selectionState.selectedEntry);
                }
                break;
                
            case 'closeDetails':
                this.closeDetails();
                break;
                
            case 'refresh':
                this.executeCallbacks('onRefresh', {});
                break;
                
            case 'pageUp':
                this.handleScroll(0, -200);
                break;
                
            case 'pageDown':
                this.handleScroll(0, 200);
                break;
                
            case 'goToTop':
                this.executeCallbacks('onScroll', { scrollTo: 'top' });
                break;
                
            case 'goToBottom':
                this.executeCallbacks('onScroll', { scrollTo: 'bottom' });
                break;
        }
    }
    
    /**
     * 前のエントリーを選択
     */
    selectPreviousEntry() {
        const newIndex = Math.max(0, this.selectionState.selectedEntryIndex - 1);
        if (newIndex !== this.selectionState.selectedEntryIndex) {
            this.selectionState.selectedEntryIndex = newIndex;
            // エントリーデータは外部から提供される必要がある
            this.executeCallbacks('onEntrySelect', { index: newIndex });
        }
    }
    
    /**
     * 次のエントリーを選択
     */
    selectNextEntry() {
        // 最大インデックスは外部から提供される必要がある
        const maxIndex = this.uiElements.entries.length - 1;
        const newIndex = Math.min(maxIndex, this.selectionState.selectedEntryIndex + 1);
        
        if (newIndex !== this.selectionState.selectedEntryIndex) {
            this.selectionState.selectedEntryIndex = newIndex;
            this.executeCallbacks('onEntrySelect', { index: newIndex });
        }
    }
    
    /**
     * 次のビューに切り替え
     */
    switchToNextView() {
        const views = ['overall', 'daily', 'weekly', 'monthly', 'stage'];
        const currentIndex = views.indexOf(this.selectionState.selectedView);
        const nextIndex = (currentIndex + 1) % views.length;
        
        this.selectionState.selectedView = views[nextIndex];
        this.executeCallbacks('onViewChange', { view: views[nextIndex] });
    }
    
    /**
     * 前のビューに切り替え
     */
    switchToPreviousView() {
        const views = ['overall', 'daily', 'weekly', 'monthly', 'stage'];
        const currentIndex = views.indexOf(this.selectionState.selectedView);
        const prevIndex = (currentIndex - 1 + views.length) % views.length;
        
        this.selectionState.selectedView = views[prevIndex];
        this.executeCallbacks('onViewChange', { view: views[prevIndex] });
    }
    
    /**
     * 詳細を開く
     * @param {Object} entry - エントリーデータ
     */
    openDetails(entry) {
        this.selectionState.showingDetails = true;
        this.executeCallbacks('onDetailsToggle', { entry, show: true });
    }
    
    /**
     * 詳細を閉じる
     */
    closeDetails() {
        this.selectionState.showingDetails = false;
        this.executeCallbacks('onDetailsToggle', { show: false });
    }
    
    /**
     * 詳細表示をトグル
     * @param {Object} entry - エントリーデータ
     */
    toggleDetails(entry) {
        if (this.selectionState.showingDetails) {
            this.closeDetails();
        } else {
            this.openDetails(entry);
        }
    }
    
    /**
     * 座標からターゲットを取得
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {Object|null} ターゲット
     */
    getTargetAt(x, y) {
        // タブチェック
        for (const tab of this.uiElements.tabs) {
            if (this.isPointInBounds(x, y, tab.bounds)) {
                return { type: 'tab', ...tab };
            }
        }
        
        // ソートオプションチェック
        for (const option of this.uiElements.sortOptions) {
            if (this.isPointInBounds(x, y, option.bounds)) {
                return { type: 'sortOption', ...option };
            }
        }
        
        // エントリーチェック
        for (const entry of this.uiElements.entries) {
            if (this.isPointInBounds(x, y, entry.bounds)) {
                return { type: 'entry', ...entry };
            }
        }
        
        // ボタンチェック
        for (const button of this.uiElements.buttons) {
            if (this.isPointInBounds(x, y, button.bounds)) {
                return { type: 'button', ...button };
            }
        }
        
        // スクロールバーチェック
        if (this.uiElements.scrollbar && 
            this.isPointInBounds(x, y, this.uiElements.scrollbar.bounds)) {
            return { type: 'scrollbar', ...this.uiElements.scrollbar };
        }
        
        return null;
    }
    
    /**
     * 点が境界内にあるかチェック
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} bounds - 境界
     * @returns {boolean} 境界内かどうか
     */
    isPointInBounds(x, y, bounds) {
        return x >= bounds.x && 
               x <= bounds.x + bounds.width &&
               y >= bounds.y && 
               y <= bounds.y + bounds.height;
    }
    
    /**
     * UI要素の座標を更新
     * @param {Object} elements - UI要素の座標情報
     */
    updateUIElements(elements) {
        Object.assign(this.uiElements, elements);
    }
    
    /**
     * コールバックを追加
     * @param {string} eventType - イベントタイプ
     * @param {Function} callback - コールバック関数
     */
    addCallback(eventType, callback) {
        if (this.callbacks[eventType]) {
            this.callbacks[eventType].add(callback);
        }
    }
    
    /**
     * コールバックを削除
     * @param {string} eventType - イベントタイプ
     * @param {Function} callback - コールバック関数
     */
    removeCallback(eventType, callback) {
        if (this.callbacks[eventType]) {
            this.callbacks[eventType].delete(callback);
        }
    }
    
    /**
     * コールバックを実行
     * @param {string} eventType - イベントタイプ
     * @param {Object} data - イベントデータ
     */
    executeCallbacks(eventType, data) {
        if (this.callbacks[eventType]) {
            this.callbacks[eventType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.warn('[LeaderboardEventHandler] Callback error:', error);
                }
            });
        }
    }
    
    /**
     * 選択状態を取得
     * @returns {Object} 選択状態
     */
    getSelectionState() {
        return { ...this.selectionState };
    }
    
    /**
     * 選択状態を設定
     * @param {Object} newState - 新しい状態
     */
    setSelectionState(newState) {
        Object.assign(this.selectionState, newState);
    }
    
    /**
     * イベント設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        if (newConfig.eventConfig) {
            Object.assign(this.eventConfig, newConfig.eventConfig);
        }
        if (newConfig.shortcuts) {
            Object.assign(this.shortcuts, newConfig.shortcuts);
        }
        if (newConfig.gestures) {
            Object.assign(this.gestures, newConfig.gestures);
        }
        
        console.log('[LeaderboardEventHandler] Configuration updated');
    }
    
    /**
     * 全イベント状態をリセット
     */
    reset() {
        this.eventState.lastClickTime = 0;
        this.eventState.lastClickTarget = null;
        this.eventState.clickCount = 0;
        this.eventState.lastHoverTarget = null;
        this.eventState.isDragging = false;
        this.eventState.touches.clear();
        
        if (this.eventState.hoverTimer) {
            clearTimeout(this.eventState.hoverTimer);
            this.eventState.hoverTimer = null;
        }
        
        this.selectionState = {
            selectedView: 'overall',
            selectedSort: 'score',
            selectedEntry: null,
            selectedEntryIndex: -1,
            showingDetails: false
        };
        
        console.log('[LeaderboardEventHandler] Event state reset');
    }
    
    /**
     * イベントハンドラーを破棄
     */
    dispose() {
        this.reset();
        
        // 全コールバックをクリア
        Object.values(this.callbacks).forEach(callbackSet => {
            callbackSet.clear();
        });
        
        console.log('[LeaderboardEventHandler] Event handler disposed');
    }
}