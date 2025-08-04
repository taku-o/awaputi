/**
 * ChallengeInteractionHandler
 * ユーザー入力処理、イベント管理、インタラクションフィードバック
 */
export class ChallengeInteractionHandler {
    constructor(challengeUI) {
        this.challengeUI = challengeUI;
        this.config = challengeUI.config;
        this.state = challengeUI.state;
        this.elements = challengeUI.elements;
        this.stats = challengeUI.stats;
        
        // イベントハンドラー
        this.handlers = {
            keydown: this.handleKeydown.bind(this),
            challengeClick: this.handleChallengeClick.bind(this),
            filterChange: this.handleFilterChange.bind(this),
            sortChange: this.handleSortChange.bind(this),
            refresh: this.handleRefresh.bind(this),
            resize: this.handleResize.bind(this)
        };
        
        // フォーカス管理
        this.focusableElements = [];
        this.focusHistory = [];
        
        console.log('[ChallengeInteractionHandler] Component initialized');
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // キーボードナビゲーション
        this.elements.container.addEventListener('keydown', this.handlers.keydown);
        
        // フィルター変更
        const filterSelect = this.elements.filterControls.querySelector('select');
        filterSelect.addEventListener('change', this.handlers.filterChange);
        
        // ソート変更
        const sortSelect = this.elements.sortControls.querySelector('select');
        sortSelect.addEventListener('change', this.handlers.sortChange);
        
        // 更新ボタン
        const refreshButton = this.elements.header.querySelector('.challenge-ui-refresh');
        refreshButton.addEventListener('click', this.handlers.refresh);
        
        // ウィンドウリサイズ
        window.addEventListener('resize', this.handlers.resize);
    }
    
    /**
     * フォーカス可能要素の更新
     */
    updateFocusableElements() {
        const selector = `
            button:not([disabled]),
            select:not([disabled]),
            .challenge-item[tabindex="0"]
        `;
        
        this.focusableElements = Array.from(
            this.elements.container.querySelectorAll(selector)
        );
    }
    
    /**
     * 初期フォーカスの設定
     */
    setInitialFocus() {
        if (this.focusableElements.length > 0) {
            this.focusableElements[0].focus();
            this.state.focusedIndex = 0;
        }
    }
    
    /**
     * キーボードハンドラー
     */
    handleKeydown(event) {
        if (!this.config.accessibility.keyboardNavigation) return;
        
        this.stats.keyboardInteractions++;
        
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.navigateUp();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.navigateDown();
                break;
            case 'Home':
                event.preventDefault();
                this.navigateToFirst();
                break;
            case 'End':
                event.preventDefault();
                this.navigateToLast();
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.activateCurrentItem();
                break;
            case 'r':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.handleRefresh();
                }
                break;
        }
    }
    
    /**
     * 上方向ナビゲーション
     */
    navigateUp() {
        if (this.state.focusedIndex > 0) {
            this.state.focusedIndex--;
            this.focusableElements[this.state.focusedIndex].focus();
        }
    }
    
    /**
     * 下方向ナビゲーション
     */
    navigateDown() {
        if (this.state.focusedIndex < this.focusableElements.length - 1) {
            this.state.focusedIndex++;
            this.focusableElements[this.state.focusedIndex].focus();
        }
    }
    
    /**
     * 最初の要素にナビゲーション
     */
    navigateToFirst() {
        if (this.focusableElements.length > 0) {
            this.state.focusedIndex = 0;
            this.focusableElements[0].focus();
        }
    }
    
    /**
     * 最後の要素にナビゲーション
     */
    navigateToLast() {
        if (this.focusableElements.length > 0) {
            this.state.focusedIndex = this.focusableElements.length - 1;
            this.focusableElements[this.state.focusedIndex].focus();
        }
    }
    
    /**
     * 現在のアイテムの有効化
     */
    activateCurrentItem() {
        const focusedElement = this.focusableElements[this.state.focusedIndex];
        if (focusedElement) {
            if (focusedElement.classList.contains('challenge-item')) {
                this.handleChallengeClick({ currentTarget: focusedElement });
            } else {
                focusedElement.click();
            }
        }
    }
    
    /**
     * チャレンジクリックハンドラー
     */
    handleChallengeClick(event) {
        const item = event.currentTarget;
        const challengeId = item.getAttribute('data-challenge-id');
        const challenge = this.state.challenges.find(c => c.id === challengeId);
        
        if (challenge) {
            this.state.selectedChallenge = challenge;
            this.stats.challengeViews++;
            
            // 詳細情報のアナウンス
            this.announceChallenge(challenge);
            
            // ログ出力
            this.challengeUI.log('チャレンジ選択', { challengeId });
        }
    }
    
    /**
     * フィルター変更ハンドラー
     */
    async handleFilterChange(event) {
        const newFilter = event.target.value;
        if (newFilter !== this.state.filterBy) {
            this.state.filterBy = newFilter;
            this.stats.filterChanges++;
            
            await this.challengeUI.loadChallenges();
            
            this.challengeUI.announce(`フィルターを「${event.target.selectedOptions[0].text}」に変更しました`);
        }
    }
    
    /**
     * ソート変更ハンドラー
     */
    async handleSortChange(event) {
        const newSort = event.target.value;
        if (newSort !== this.state.sortBy) {
            this.state.sortBy = newSort;
            this.stats.sortChanges++;
            
            await this.challengeUI.loadChallenges();
            
            this.challengeUI.announce(`並び順を「${event.target.selectedOptions[0].text}」に変更しました`);
        }
    }
    
    /**
     * 更新ハンドラー
     */
    async handleRefresh() {
        await this.challengeUI.loadChallenges();
        this.challengeUI.announce('チャレンジを更新しました');
    }
    
    /**
     * リサイズハンドラー
     */
    handleResize() {
        this.challengeUI.renderer.applyResponsiveStyles();
    }
    
    /**
     * チャレンジの詳細アナウンス
     */
    announceChallenge(challenge) {
        const progressPercent = Math.round((challenge.progress / challenge.target) * 100);
        const message = `選択中: ${challenge.title}. 進捗 ${progressPercent}パーセント. ` +
                       `難易度 ${this.getDifficultyLabel(challenge.difficulty)}. ` +
                       `期限 ${this.formatDeadline(challenge.deadline)}`;
        
        this.challengeUI.announce(message);
    }
    
    /**
     * 進捗更新のアナウンス
     */
    announceProgressUpdate(challengeId, progress) {
        if (!this.config.accessibility.progressAnnouncements) return;
        
        const challenge = this.state.challenges.find(c => c.id === challengeId);
        if (challenge) {
            const progressPercent = Math.round((progress / challenge.target) * 100);
            const message = `「${challenge.title}」の進捗が ${progressPercent}パーセント になりました`;
            
            this.challengeUI.announce(message, 'assertive');
        }
    }
    
    /**
     * フォーカス状態の管理
     */
    manageFocusState() {
        // 現在のフォーカス要素を記録
        const activeElement = document.activeElement;
        if (activeElement && this.elements.container.contains(activeElement)) {
            this.focusHistory.push(activeElement);
            
            // 履歴の制限（最大10件）
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }
        }
    }
    
    /**
     * フォーカス履歴から復元
     */
    restoreFocus() {
        if (this.focusHistory.length > 0) {
            const lastFocused = this.focusHistory.pop();
            if (lastFocused && document.contains(lastFocused)) {
                lastFocused.focus();
                return true;
            }
        }
        return false;
    }
    
    /**
     * チャレンジアイテムのクリックイベントを設定
     */
    setupChallengeItemEvents() {
        this.elements.challengeItems.forEach(item => {
            item.addEventListener('click', this.handlers.challengeClick);
            item.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.handlers.challengeClick(event);
                }
            });
        });
    }
    
    /**
     * タッチイベントのサポート
     */
    setupTouchEvents() {
        let touchStartY = 0;
        let touchEndY = 0;
        
        this.elements.container.addEventListener('touchstart', (event) => {
            touchStartY = event.changedTouches[0].screenY;
        });
        
        this.elements.container.addEventListener('touchend', (event) => {
            touchEndY = event.changedTouches[0].screenY;
            this.handleTouchGesture(touchStartY, touchEndY);
        });
    }
    
    /**
     * タッチジェスチャーの処理
     */
    handleTouchGesture(startY, endY) {
        const minSwipeDistance = 50;
        const swipeDistance = Math.abs(endY - startY);
        
        if (swipeDistance > minSwipeDistance) {
            if (startY > endY) {
                // 上にスワイプ - 次のアイテムへ
                this.navigateDown();
            } else {
                // 下にスワイプ - 前のアイテムへ
                this.navigateUp();
            }
        }
    }
    
    /**
     * ダブルクリック防止
     */
    preventDoubleClick(handler, delay = 300) {
        let lastClickTime = 0;
        
        return function(event) {
            const now = Date.now();
            if (now - lastClickTime < delay) {
                event.preventDefault();
                return;
            }
            lastClickTime = now;
            handler.call(this, event);
        };
    }
    
    /**
     * アクセシビリティ設定
     */
    setupAccessibility() {
        // フォーカス可能要素の更新
        this.updateFocusableElements();
        
        // キーボードナビゲーションの設定
        if (this.config.accessibility.keyboardNavigation) {
            this.setupKeyboardNavigation();
        }
        
        // 進捗アナウンスの設定
        if (this.config.accessibility.progressAnnouncements) {
            this.setupProgressAnnouncements();
        }
        
        // タッチイベントの設定（モバイルアクセシビリティ向上）
        this.setupTouchEvents();
    }
    
    /**
     * キーボードナビゲーションの設定
     */
    setupKeyboardNavigation() {
        // 追加の設定は handleKeydown で実装済み
        // ARIA属性の動的更新
        this.updateAriaAttributes();
    }
    
    /**
     * 進捗アナウンスの設定
     */
    setupProgressAnnouncements() {
        // チャレンジ進捗の監視
        if (this.challengeUI.challengeSystem && typeof this.challengeUI.challengeSystem.onProgressUpdate === 'function') {
            this.challengeUI.challengeSystem.onProgressUpdate((challengeId, progress) => {
                this.announceProgressUpdate(challengeId, progress);
            });
        }
    }
    
    /**
     * ARIA属性の更新
     */
    updateAriaAttributes() {
        // コンテナのARIA属性
        this.elements.container.setAttribute('aria-busy', this.state.loading ? 'true' : 'false');
        
        // チャレンジアイテムのARIA属性更新
        this.elements.challengeItems.forEach((item, index) => {
            item.setAttribute('aria-setsize', this.elements.challengeItems.length);
            item.setAttribute('aria-posinset', index + 1);
        });
    }
    
    /**
     * 難易度ラベルの取得
     */
    getDifficultyLabel(difficulty) {
        const labels = {
            easy: '簡単',
            medium: '普通',
            hard: '難しい'
        };
        return labels[difficulty] || difficulty;
    }
    
    /**
     * 期限のフォーマット
     */
    formatDeadline(deadline) {
        const now = new Date();
        const diff = deadline - now;
        
        if (diff < 0) {
            return '期限切れ';
        } else if (diff < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(diff / (60 * 60 * 1000));
            return `あと${hours}時間`;
        } else {
            const days = Math.floor(diff / (24 * 60 * 60 * 1000));
            return `あと${days}日`;
        }
    }
    
    /**
     * イベントリスナーの削除
     */
    removeEventListeners() {
        // ウィンドウイベントリスナーの削除
        window.removeEventListener('resize', this.handlers.resize);
        
        // チャレンジアイテムのイベントリスナー削除
        this.elements.challengeItems.forEach(item => {
            item.removeEventListener('click', this.handlers.challengeClick);
        });
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy() {
        this.removeEventListeners();
        this.focusableElements = [];
        this.focusHistory = [];
        
        console.log('[ChallengeInteractionHandler] Component destroyed');
    }
}