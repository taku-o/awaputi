/**
 * FocusNavigation
 * タブオーダー管理、フォーカス移動ロジック、キーボードナビゲーション、フォーカス履歴追跡を担当
 */
export class FocusNavigation {
    constructor(focusManager) {
        this.focusManager = focusManager;
        this.gameEngine = focusManager.gameEngine;
        
        // フォーカス可能要素とナビゲーション状態
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.focusHistory = [];
        this.maxHistorySize = 10;
        
        // 2Dナビゲーション設定
        this.navigation2D = {
            enabled: false,
            grid: null,
            currentPosition: { x: 0, y: 0 }
        };
        
        // キーボードナビゲーション設定
        this.keyboardNavigation = {
            enabled: true,
            wrapAround: true,
            arrowKeysEnabled: true,
            homeEndEnabled: true
        };
        
        console.log('[FocusNavigation] Component initialized');
    }
    
    /**
     * フォーカス可能要素を更新
     * @param {HTMLElement} container コンテナ要素
     */
    updateFocusableElements(container = document) {
        try {
            const previousCount = this.focusableElements.length;
            
            // フォーカス可能要素のセレクタ
            const focusableSelectors = [
                'a[href]',
                'button:not([disabled])',
                'input:not([disabled]):not([type="hidden"])',
                'select:not([disabled])',
                'textarea:not([disabled])',
                '[tabindex]:not([tabindex="-1"])',
                '[contenteditable="true"]',
                'audio[controls]',
                'video[controls]',
                'summary',
                'iframe:not([tabindex="-1"])'
            ].join(', ');
            
            // 要素を取得してフィルタリング
            const elements = Array.from(container.querySelectorAll(focusableSelectors))
                .filter(element => this.isElementFocusable(element))
                .filter(element => this.isElementVisible(element));
            
            // タブオーダーでソート
            this.focusableElements = this.sortElementsByTabOrder(elements);
            
            // 現在のフォーカスインデックスを更新
            this.updateCurrentFocusIndex();
            
            console.log(`[FocusNavigation] Updated focusable elements: ${previousCount} -> ${this.focusableElements.length}`);
            
            // 変更をFocusManagerに通知
            this.focusManager.emit('focusableElementsUpdated', {
                count: this.focusableElements.length,
                previousCount
            });
            
        } catch (error) {
            console.error('[FocusNavigation] Error updating focusable elements:', error);
        }
    }
    
    /**
     * 要素がフォーカス可能かチェック
     * @param {HTMLElement} element チェックする要素
     * @returns {boolean} フォーカス可能かどうか
     */
    isElementFocusable(element) {
        if (!element || element.disabled) return false;
        
        // hidden属性のチェック
        if (element.hidden) return false;
        
        // aria-hiddenのチェック
        if (element.getAttribute('aria-hidden') === 'true') return false;
        
        // tabindexが-1の場合はプログラム的にのみフォーカス可能
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex === '-1') return false;
        
        // contenteditable要素のチェック
        if (element.contentEditable === 'true') return true;
        
        // フォーム要素のチェック
        if (element.matches('input, select, textarea, button')) {
            return !element.disabled && element.type !== 'hidden';
        }
        
        // リンクのチェック
        if (element.matches('a')) {
            return element.href && element.href.length > 0;
        }
        
        // その他のインタラクティブ要素
        if (element.matches('audio[controls], video[controls], summary, iframe')) {
            return true;
        }
        
        // tabindex属性があるかチェック
        return tabIndex !== null && tabIndex !== '-1';
    }
    
    /**
     * 要素が表示されているかチェック
     * @param {HTMLElement} element チェックする要素
     * @returns {boolean} 表示されているかどうか
     */
    isElementVisible(element) {
        if (!element) return false;
        
        // display: noneやvisibility: hiddenのチェック
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
            return false;
        }
        
        // 親要素も含めて透明度をチェック
        if (style.opacity === '0') return false;
        
        // 要素のサイズをチェック
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return false;
        
        return true;
    }
    
    /**
     * 要素をタブオーダーでソート
     * @param {HTMLElement[]} elements ソートする要素配列
     * @returns {HTMLElement[]} ソートされた要素配列
     */
    sortElementsByTabOrder(elements) {
        return elements.sort((a, b) => {
            const aTabIndex = parseInt(a.getAttribute('tabindex')) || 0;
            const bTabIndex = parseInt(b.getAttribute('tabindex')) || 0;
            
            // tabindex > 0 の要素が最初
            if (aTabIndex > 0 && bTabIndex > 0) {
                return aTabIndex - bTabIndex;
            } else if (aTabIndex > 0) {
                return -1;
            } else if (bTabIndex > 0) {
                return 1;
            }
            
            // tabindex = 0 の要素はDOM順序
            const position = a.compareDocumentPosition(b);
            if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
                return -1;
            } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
                return 1;
            }
            
            return 0;
        });
    }
    
    /**
     * 現在のフォーカスインデックスを更新
     */
    updateCurrentFocusIndex() {
        const activeElement = document.activeElement;
        if (activeElement) {
            this.currentFocusIndex = this.focusableElements.indexOf(activeElement);
        } else {
            this.currentFocusIndex = -1;
        }
    }
    
    /**
     * 次のフォーカス可能要素に移動
     * @param {boolean} reverse 逆方向に移動するか
     * @returns {HTMLElement|null} フォーカスした要素
     */
    moveToNext(reverse = false) {
        if (this.focusableElements.length === 0) return null;
        
        try {
            let newIndex;
            
            if (this.currentFocusIndex === -1) {
                // フォーカスがない場合は最初または最後の要素
                newIndex = reverse ? this.focusableElements.length - 1 : 0;
            } else {
                // 次または前の要素を計算
                if (reverse) {
                    newIndex = this.currentFocusIndex - 1;
                    if (newIndex < 0) {
                        newIndex = this.keyboardNavigation.wrapAround ? 
                                  this.focusableElements.length - 1 : 0;
                    }
                } else {
                    newIndex = this.currentFocusIndex + 1;
                    if (newIndex >= this.focusableElements.length) {
                        newIndex = this.keyboardNavigation.wrapAround ? 0 : 
                                  this.focusableElements.length - 1;
                    }
                }
            }
            
            const targetElement = this.focusableElements[newIndex];
            if (targetElement) {
                this.setFocus(targetElement);
                return targetElement;
            }
            
        } catch (error) {
            console.error('[FocusNavigation] Error moving to next element:', error);
        }
        
        return null;
    }
    
    /**
     * 前のフォーカス可能要素に移動
     * @returns {HTMLElement|null} フォーカスした要素
     */
    moveToPrevious() {
        return this.moveToNext(true);
    }
    
    /**
     * 最初のフォーカス可能要素に移動
     * @returns {HTMLElement|null} フォーカスした要素
     */
    moveToFirst() {
        if (this.focusableElements.length === 0) return null;
        
        const firstElement = this.focusableElements[0];
        this.setFocus(firstElement);
        return firstElement;
    }
    
    /**
     * 最後のフォーカス可能要素に移動
     * @returns {HTMLElement|null} フォーカスした要素
     */
    moveToLast() {
        if (this.focusableElements.length === 0) return null;
        
        const lastElement = this.focusableElements[this.focusableElements.length - 1];
        this.setFocus(lastElement);
        return lastElement;
    }
    
    /**
     * 指定された要素にフォーカスを設定
     * @param {HTMLElement} element フォーカスする要素
     */
    setFocus(element) {
        if (!element || !this.isElementFocusable(element)) return;
        
        try {
            // フォーカス履歴に追加
            this.addToFocusHistory(element);
            
            // フォーカスを設定
            element.focus();
            
            // インデックスを更新
            this.currentFocusIndex = this.focusableElements.indexOf(element);
            
            console.log(`[FocusNavigation] Focus set to element:`, element.tagName, element.id || element.className);
            
        } catch (error) {
            console.error('[FocusNavigation] Error setting focus:', error);
        }
    }
    
    /**
     * フォーカス履歴に要素を追加
     * @param {HTMLElement} element 追加する要素
     */
    addToFocusHistory(element) {
        if (!element) return;
        
        // 既存の履歴から削除
        const existingIndex = this.focusHistory.indexOf(element);
        if (existingIndex !== -1) {
            this.focusHistory.splice(existingIndex, 1);
        }
        
        // 最新として先頭に追加
        this.focusHistory.unshift(element);
        
        // 履歴サイズを制限
        if (this.focusHistory.length > this.maxHistorySize) {
            this.focusHistory = this.focusHistory.slice(0, this.maxHistorySize);
        }
    }
    
    /**
     * キーボードナビゲーションを処理
     * @param {KeyboardEvent} event キーボードイベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    handleKeyboardNavigation(event) {
        if (!this.keyboardNavigation.enabled) return false;
        
        const { key, shiftKey, ctrlKey, altKey, metaKey } = event;
        
        // 修飾キーが押されている場合はスキップ（Shiftは例外）
        if (ctrlKey || altKey || metaKey) return false;
        
        try {
            switch (key) {
                case 'Tab':
                    return this.handleTabNavigation(event);
                    
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    return this.handleArrowNavigation(event);
                    
                case 'Home':
                    if (this.keyboardNavigation.homeEndEnabled) {
                        event.preventDefault();
                        this.moveToFirst();
                        return true;
                    }
                    break;
                    
                case 'End':
                    if (this.keyboardNavigation.homeEndEnabled) {
                        event.preventDefault();
                        this.moveToLast();
                        return true;
                    }
                    break;
                    
                case 'PageUp':
                case 'PageDown':
                    return this.handlePageNavigation(event);
            }
            
        } catch (error) {
            console.error('[FocusNavigation] Error handling keyboard navigation:', error);
        }
        
        return false;
    }
    
    /**
     * Tabナビゲーションを処理
     * @param {KeyboardEvent} event キーボードイベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    handleTabNavigation(event) {
        event.preventDefault();
        
        if (event.shiftKey) {
            this.moveToPrevious();
        } else {
            this.moveToNext();
        }
        
        return true;
    }
    
    /**
     * 矢印キーナビゲーションを処理
     * @param {KeyboardEvent} event キーボードイベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    handleArrowNavigation(event) {
        if (!this.keyboardNavigation.arrowKeysEnabled) return false;
        
        // 2Dナビゲーションが有効な場合
        if (this.navigation2D.enabled) {
            return this.handle2DNavigation(event);
        }
        
        // 1Dナビゲーション（通常のTab順序）
        const { key } = event;
        
        if (key === 'ArrowDown' || key === 'ArrowRight') {
            event.preventDefault();
            this.moveToNext();
            return true;
        } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
            event.preventDefault();
            this.moveToPrevious();
            return true;
        }
        
        return false;
    }
    
    /**
     * 2Dナビゲーションを処理
     * @param {KeyboardEvent} event キーボードイベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    handle2DNavigation(event) {
        const { key } = event;
        let direction = null;
        
        switch (key) {
            case 'ArrowUp':
                direction = 'up';
                break;
            case 'ArrowDown':
                direction = 'down';
                break;
            case 'ArrowLeft':
                direction = 'left';
                break;
            case 'ArrowRight':
                direction = 'right';
                break;
            default:
                return false;
        }
        
        event.preventDefault();
        
        const target = this.find2DNavigationTarget(direction);
        if (target) {
            this.setFocus(target);
            return true;
        }
        
        return false;
    }
    
    /**
     * 2Dナビゲーションのターゲットを検索
     * @param {string} direction 方向 ('up', 'down', 'left', 'right')
     * @returns {HTMLElement|null} ターゲット要素
     */
    find2DNavigationTarget(direction) {
        const currentElement = document.activeElement;
        if (!currentElement) return null;
        
        const currentRect = currentElement.getBoundingClientRect();
        const candidates = this.focusableElements.filter(el => el !== currentElement);
        
        let bestCandidate = null;
        let bestScore = Infinity;
        
        for (const candidate of candidates) {
            const score = this.calculate2DNavigationScore(currentRect, candidate.getBoundingClientRect(), direction);
            if (score < bestScore) {
                bestScore = score;
                bestCandidate = candidate;
            }
        }
        
        return bestCandidate;
    }
    
    /**
     * 2Dナビゲーションスコアを計算
     * @param {DOMRect} fromRect 現在の要素の位置
     * @param {DOMRect} toRect 候補要素の位置
     * @param {string} direction 方向
     * @returns {number} スコア（小さいほど良い）
     */
    calculate2DNavigationScore(fromRect, toRect, direction) {
        const fromCenter = {
            x: fromRect.left + fromRect.width / 2,
            y: fromRect.top + fromRect.height / 2
        };
        
        const toCenter = {
            x: toRect.left + toRect.width / 2,
            y: toRect.top + toRect.height / 2
        };
        
        const dx = toCenter.x - fromCenter.x;
        const dy = toCenter.y - fromCenter.y;
        
        // 方向のチェック
        switch (direction) {
            case 'up':
                if (dy >= 0) return Infinity; // 上方向でないため除外
                break;
            case 'down':
                if (dy <= 0) return Infinity; // 下方向でないため除外
                break;
            case 'left':
                if (dx >= 0) return Infinity; // 左方向でないため除外
                break;
            case 'right':
                if (dx <= 0) return Infinity; // 右方向でないため除外
                break;
        }
        
        // 距離とアライメントを考慮したスコア計算
        const distance = Math.sqrt(dx * dx + dy * dy);
        const alignment = this.calculateAlignment(fromRect, toRect, direction);
        
        return distance + (alignment * 100); // アライメントを重視
    }
    
    /**
     * 要素間のアライメントを計算
     * @param {DOMRect} fromRect 現在の要素の位置
     * @param {DOMRect} toRect 候補要素の位置
     * @param {string} direction 方向
     * @returns {number} アライメントスコア
     */
    calculateAlignment(fromRect, toRect, direction) {
        if (direction === 'up' || direction === 'down') {
            // 垂直方向の移動では水平方向のアライメントを重視
            const fromCenterX = fromRect.left + fromRect.width / 2;
            const toCenterX = toRect.left + toRect.width / 2;
            return Math.abs(fromCenterX - toCenterX);
        } else {
            // 水平方向の移動では垂直方向のアライメントを重視
            const fromCenterY = fromRect.top + fromRect.height / 2;
            const toCenterY = toRect.top + toRect.height / 2;
            return Math.abs(fromCenterY - toCenterY);
        }
    }
    
    /**
     * ページナビゲーションを処理
     * @param {KeyboardEvent} event キーボードイベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    handlePageNavigation(event) {
        const { key } = event;
        
        // 現在のビューポート内の要素を取得
        const viewportElements = this.getElementsInViewport();
        if (viewportElements.length === 0) return false;
        
        event.preventDefault();
        
        if (key === 'PageDown') {
            // ビューポート内の最後の要素にフォーカス
            const lastElement = viewportElements[viewportElements.length - 1];
            this.setFocus(lastElement);
        } else if (key === 'PageUp') {
            // ビューポート内の最初の要素にフォーカス
            const firstElement = viewportElements[0];
            this.setFocus(firstElement);
        }
        
        return true;
    }
    
    /**
     * ビューポート内のフォーカス可能要素を取得
     * @returns {HTMLElement[]} ビューポート内の要素配列
     */
    getElementsInViewport() {
        const viewportHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;
        
        return this.focusableElements.filter(element => {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrollTop;
            const elementBottom = elementTop + rect.height;
            
            return elementBottom >= scrollTop && elementTop <= scrollTop + viewportHeight;
        });
    }
    
    /**
     * 2Dナビゲーションを有効/無効化
     * @param {boolean} enabled 有効にするかどうか
     */
    set2DNavigationEnabled(enabled) {
        this.navigation2D.enabled = enabled;
        console.log(`[FocusNavigation] 2D navigation ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * キーボードナビゲーション設定を更新
     * @param {Object} config 設定オブジェクト
     */
    updateKeyboardConfig(config) {
        Object.assign(this.keyboardNavigation, config);
        console.log('[FocusNavigation] Keyboard navigation config updated');
    }
    
    /**
     * フォーカス可能要素のリストを取得
     * @returns {HTMLElement[]} フォーカス可能要素配列
     */
    getFocusableElements() {
        return [...this.focusableElements];
    }
    
    /**
     * 現在のフォーカス要素を取得
     * @returns {HTMLElement|null} 現在フォーカスされている要素
     */
    getCurrentFocusedElement() {
        if (this.currentFocusIndex >= 0 && this.currentFocusIndex < this.focusableElements.length) {
            return this.focusableElements[this.currentFocusIndex];
        }
        return null;
    }
    
    /**
     * フォーカス履歴を取得
     * @param {number} limit 取得する履歴の最大数
     * @returns {HTMLElement[]} フォーカス履歴配列
     */
    getFocusHistory(limit = this.maxHistorySize) {
        return this.focusHistory.slice(0, limit);
    }
    
    /**
     * フォーカス履歴をクリア
     */
    clearFocusHistory() {
        this.focusHistory = [];
        console.log('[FocusNavigation] Focus history cleared');
    }
    
    /**
     * ナビゲーション統計を取得
     * @returns {Object} ナビゲーション統計
     */
    getNavigationStats() {
        return {
            focusableElementsCount: this.focusableElements.length,
            currentFocusIndex: this.currentFocusIndex,
            focusHistoryLength: this.focusHistory.length,
            navigation2DEnabled: this.navigation2D.enabled,
            keyboardNavigationEnabled: this.keyboardNavigation.enabled,
            wrapAroundEnabled: this.keyboardNavigation.wrapAround
        };
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy() {
        this.focusableElements = [];
        this.focusHistory = [];
        this.currentFocusIndex = -1;
        this.navigation2D.grid = null;
        
        console.log('[FocusNavigation] Component destroyed');
    }
}