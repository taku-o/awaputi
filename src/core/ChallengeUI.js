/**
 * チャレンジUI - アクセシビリティ対応 (Task 23)
 * WCAG 2.1 AA準拠のチャレンジ表示・管理機能
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

export class ChallengeUI {
    constructor(challengeSystem, options = {}) {
        this.challengeSystem = challengeSystem;
        
        // 設定
        this.config = {
            // 表示設定
            maxVisibleChallenges: options.maxVisibleChallenges || 5,
            autoRefresh: options.autoRefresh !== false,
            refreshInterval: options.refreshInterval || 60000, // 1分
            showProgress: options.showProgress !== false,
            showRewards: options.showRewards !== false,
            showDifficulty: options.showDifficulty !== false,
            
            // アニメーション設定
            animations: {
                enabled: options.animations !== false,
                duration: options.animationDuration || 300,
                easing: options.animationEasing || 'ease-in-out'
            },
            
            // アクセシビリティ設定
            accessibility: {
                enabled: options.accessibility !== false,
                announcements: options.announcements !== false,
                keyboardNavigation: options.keyboardNavigation !== false,
                highContrast: options.highContrast === true,
                reducedMotion: options.reducedMotion === true,
                progressAnnouncements: options.progressAnnouncements !== false,
                rewardAnnouncements: options.rewardAnnouncements !== false,
                screenReaderOptimized: options.screenReaderOptimized !== false
            },
            
            // スタイル設定
            styles: {
                backgroundColor: options.backgroundColor || '#FFFFFF',
                textColor: options.textColor || '#333333',
                accentColor: options.accentColor || '#007AFF',
                borderRadius: options.borderRadius || '8px',
                fontSize: options.fontSize || '14px',
                fontFamily: options.fontFamily || 'system-ui, -apple-system, sans-serif'
            }
        };
        
        // 状態管理
        this.state = {
            visible: false,
            challenges: [],
            selectedChallenge: null,
            focusedIndex: 0,
            sortBy: 'priority', // priority, difficulty, progress, deadline
            filterBy: 'all', // all, daily, weekly, completed, active
            loading: false,
            error: null
        };
        
        // DOM要素
        this.elements = {
            container: null,
            header: null,
            filterControls: null,
            sortControls: null,
            challengeList: null,
            challengeItems: [],
            progressSection: null,
            footer: null,
            announcer: null,
            loadingIndicator: null,
            errorMessage: null
        };
        
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
        
        // タイマー
        this.refreshTimer = null;
        
        // 統計
        this.stats = {
            views: 0,
            challengeViews: 0,
            completions: 0,
            filterChanges: 0,
            sortChanges: 0,
            keyboardInteractions: 0,
            announcementsMade: 0
        };
        
        this.initialize();
        this.log('ChallengeUI初期化完了');
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // DOM要素の作成
            this.createElements();
            
            // スタイルの適用
            this.applyStyles();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // アクセシビリティの設定
            if (this.config.accessibility.enabled) {
                this.setupAccessibility();
            }
            
            // 自動更新の設定
            if (this.config.autoRefresh) {
                this.startAutoRefresh();
            }
            
        } catch (error) {
            this.handleError('CHALLENGE_UI_INITIALIZATION_FAILED', error);
        }
    }
    
    /**
     * DOM要素の作成
     */
    createElements() {
        // メインコンテナ
        this.elements.container = document.createElement('div');
        this.elements.container.className = 'challenge-ui-container';
        this.elements.container.setAttribute('role', 'region');
        this.elements.container.setAttribute('aria-label', 'チャレンジ一覧');
        this.elements.container.id = 'challenge-ui-main';
        
        // ヘッダー
        this.elements.header = this.createHeader();
        
        // フィルター・ソートコントロール
        this.elements.filterControls = this.createFilterControls();
        this.elements.sortControls = this.createSortControls();
        
        // チャレンジリスト
        this.elements.challengeList = this.createChallengeList();
        
        // 進捗セクション
        this.elements.progressSection = this.createProgressSection();
        
        // フッター
        this.elements.footer = this.createFooter();
        
        // ローディングインジケーター
        this.elements.loadingIndicator = this.createLoadingIndicator();
        
        // エラーメッセージ
        this.elements.errorMessage = this.createErrorMessage();
        
        // アクセシビリティ要素
        if (this.config.accessibility.enabled) {
            this.elements.announcer = this.createAnnouncer();
        }
        
        // 要素の組み立て
        this.elements.container.appendChild(this.elements.header);
        this.elements.container.appendChild(this.elements.filterControls);
        this.elements.container.appendChild(this.elements.sortControls);
        this.elements.container.appendChild(this.elements.loadingIndicator);
        this.elements.container.appendChild(this.elements.errorMessage);
        this.elements.container.appendChild(this.elements.challengeList);
        this.elements.container.appendChild(this.elements.progressSection);
        this.elements.container.appendChild(this.elements.footer);
        
        if (this.elements.announcer) {
            this.elements.container.appendChild(this.elements.announcer);
        }
    }
    
    /**
     * ヘッダーの作成
     */
    createHeader() {
        const header = document.createElement('div');
        header.className = 'challenge-ui-header';
        
        // タイトル
        const title = document.createElement('h2');
        title.className = 'challenge-ui-title';
        title.textContent = 'チャレンジ';
        title.id = 'challenge-ui-title';
        
        // 更新ボタン
        const refreshButton = document.createElement('button');
        refreshButton.className = 'challenge-ui-refresh';
        refreshButton.innerHTML = '🔄';
        refreshButton.setAttribute('aria-label', 'チャレンジを更新');
        refreshButton.setAttribute('type', 'button');
        refreshButton.title = 'チャレンジを更新';
        
        header.appendChild(title);
        header.appendChild(refreshButton);
        
        return header;
    }
    
    /**
     * フィルターコントロールの作成
     */
    createFilterControls() {
        const container = document.createElement('div');
        container.className = 'challenge-ui-filters';
        container.setAttribute('role', 'group');
        container.setAttribute('aria-label', 'チャレンジフィルター');
        
        const label = document.createElement('label');
        label.className = 'challenge-ui-filter-label';
        label.textContent = 'フィルター:';
        label.setAttribute('for', 'challenge-filter-select');
        
        const select = document.createElement('select');
        select.id = 'challenge-filter-select';
        select.className = 'challenge-ui-filter-select';
        select.setAttribute('aria-label', 'チャレンジの種類でフィルター');
        
        const options = [
            { value: 'all', text: 'すべて' },
            { value: 'daily', text: 'デイリー' },
            { value: 'weekly', text: 'ウィークリー' },
            { value: 'active', text: '進行中' },
            { value: 'completed', text: '完了済み' }
        ];
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            select.appendChild(optionElement);
        });
        
        container.appendChild(label);
        container.appendChild(select);
        
        return container;
    }
    
    /**
     * ソートコントロールの作成
     */
    createSortControls() {
        const container = document.createElement('div');
        container.className = 'challenge-ui-sorts';
        container.setAttribute('role', 'group');
        container.setAttribute('aria-label', 'チャレンジソート');
        
        const label = document.createElement('label');
        label.className = 'challenge-ui-sort-label';
        label.textContent = '並び順:';
        label.setAttribute('for', 'challenge-sort-select');
        
        const select = document.createElement('select');
        select.id = 'challenge-sort-select';
        select.className = 'challenge-ui-sort-select';
        select.setAttribute('aria-label', 'チャレンジの並び順');
        
        const options = [
            { value: 'priority', text: '優先度順' },
            { value: 'difficulty', text: '難易度順' },
            { value: 'progress', text: '進捗順' },
            { value: 'deadline', text: '期限順' }
        ];
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            select.appendChild(optionElement);
        });
        
        container.appendChild(label);
        container.appendChild(select);
        
        return container;
    }
    
    /**
     * チャレンジリストの作成
     */
    createChallengeList() {
        const list = document.createElement('div');
        list.className = 'challenge-ui-list';
        list.setAttribute('role', 'list');
        list.setAttribute('aria-label', 'チャレンジアイテム');
        list.id = 'challenge-list-container';
        
        return list;
    }
    
    /**
     * 進捗セクションの作成
     */
    createProgressSection() {
        const section = document.createElement('div');
        section.className = 'challenge-ui-progress';
        section.setAttribute('role', 'region');
        section.setAttribute('aria-label', '全体進捗');
        
        const title = document.createElement('h3');
        title.className = 'challenge-ui-progress-title';
        title.textContent = '全体進捗';
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'challenge-ui-progress-container';
        
        section.appendChild(title);
        section.appendChild(progressContainer);
        
        return section;
    }
    
    /**
     * フッターの作成
     */
    createFooter() {
        const footer = document.createElement('div');
        footer.className = 'challenge-ui-footer';
        
        const info = document.createElement('div');
        info.className = 'challenge-ui-info';
        info.textContent = '最終更新: 未取得';
        
        footer.appendChild(info);
        
        return footer;
    }
    
    /**
     * ローディングインジケーターの作成
     */
    createLoadingIndicator() {
        const loader = document.createElement('div');
        loader.className = 'challenge-ui-loading';
        loader.style.display = 'none';
        loader.setAttribute('role', 'status');
        loader.setAttribute('aria-label', 'チャレンジを読み込み中');
        
        const spinner = document.createElement('div');
        spinner.className = 'challenge-ui-spinner';
        
        const text = document.createElement('span');
        text.className = 'challenge-ui-loading-text';
        text.textContent = '読み込み中...';
        
        loader.appendChild(spinner);
        loader.appendChild(text);
        
        return loader;
    }
    
    /**
     * エラーメッセージの作成
     */
    createErrorMessage() {
        const error = document.createElement('div');
        error.className = 'challenge-ui-error';
        error.style.display = 'none';
        error.setAttribute('role', 'alert');
        error.setAttribute('aria-live', 'assertive');
        
        return error;
    }
    
    /**
     * アナウンサーの作成
     */
    createAnnouncer() {
        const announcer = document.createElement('div');
        announcer.className = 'challenge-ui-announcer sr-only';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = `
            position: absolute !important;
            left: -10000px !important;
            width: 1px !important;
            height: 1px !important;
            overflow: hidden !important;
            clip: rect(1px, 1px, 1px, 1px) !important;
            clip-path: inset(50%) !important;
        `;
        
        return announcer;
    }
    
    /**
     * スタイルの適用
     */
    applyStyles() {
        const container = this.elements.container;
        const styles = this.config.styles;
        
        // メインコンテナのスタイル
        Object.assign(container.style, {
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            borderRadius: styles.borderRadius,
            fontSize: styles.fontSize,
            fontFamily: styles.fontFamily,
            padding: '16px',
            border: '1px solid #E0E0E0',
            maxHeight: '600px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        });
        
        // アクセシビリティスタイル
        if (this.config.accessibility.enabled) {
            this.applyAccessibilityStyles();
        }
        
        // レスポンシブスタイル
        this.applyResponsiveStyles();
    }
    
    /**
     * アクセシビリティスタイルの適用
     */
    applyAccessibilityStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* フォーカススタイル */
            .challenge-ui-container button:focus,
            .challenge-ui-container select:focus,
            .challenge-item:focus {
                outline: 3px solid ${this.config.styles.accentColor} !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 3px ${this.config.styles.accentColor}40 !important;
            }
            
            /* 高コントラストモード */
            ${this.config.accessibility.highContrast ? `
                .challenge-ui-container {
                    background-color: #000000 !important;
                    color: #FFFFFF !important;
                    border: 3px solid #FFFFFF !important;
                }
                
                .challenge-item {
                    background-color: #111111 !important;
                    color: #FFFFFF !important;
                    border: 2px solid #FFFFFF !important;
                }
            ` : ''}
            
            /* 動きの軽減 */
            ${this.config.accessibility.reducedMotion ? `
                .challenge-ui-container *,
                .challenge-item * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            ` : ''}
            
            /* スクリーンリーダー最適化 */
            ${this.config.accessibility.screenReaderOptimized ? `
                .challenge-item-progress::after {
                    content: "進捗 " attr(data-progress) " パーセント";
                    position: absolute;
                    left: -10000px;
                }
                
                .challenge-item-difficulty::after {
                    content: "難易度 " attr(data-difficulty);
                    position: absolute;
                    left: -10000px;
                }
            ` : ''}
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * レスポンシブスタイルの適用
     */
    applyResponsiveStyles() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        if (mediaQuery.matches) {
            Object.assign(this.elements.container.style, {
                padding: '12px',
                fontSize: '12px'
            });
        }
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
     * アクセシビリティの設定
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
     * キーボードナビゲーションの設定
     */
    setupKeyboardNavigation() {
        // 追加の設定は handleKeydown で実装
    }
    
    /**
     * 進捗アナウンスの設定
     */
    setupProgressAnnouncements() {
        // チャレンジ進捗の監視
        if (this.challengeSystem && typeof this.challengeSystem.onProgressUpdate === 'function') {
            this.challengeSystem.onProgressUpdate((challengeId, progress) => {
                this.announceProgressUpdate(challengeId, progress);
            });
        }
    }
    
    /**
     * チャレンジの表示
     */
    async show() {
        if (this.state.visible) return;
        
        try {
            this.state.visible = true;
            this.stats.views++;
            
            // チャレンジデータの読み込み
            await this.loadChallenges();
            
            // コンテナの表示
            this.elements.container.style.display = 'flex';
            
            // 初期フォーカスの設定
            this.setInitialFocus();
            
            // アナウンス
            this.announce('チャレンジ一覧を表示しました');
            
            this.log('ChallengeUI表示');
            
        } catch (error) {
            this.handleError('CHALLENGE_UI_SHOW_FAILED', error);
        }
    }
    
    /**
     * チャレンジの非表示
     */
    hide() {
        if (!this.state.visible) return;
        
        this.state.visible = false;
        this.elements.container.style.display = 'none';
        
        this.log('ChallengeUI非表示');
    }
    
    /**
     * チャレンジデータの読み込み
     */
    async loadChallenges() {
        try {
            this.showLoading(true);
            this.state.loading = true;
            
            // チャレンジシステムからデータを取得
            let challenges = [];
            if (this.challengeSystem && typeof this.challengeSystem.getChallenges === 'function') {
                challenges = await this.challengeSystem.getChallenges();
            } else {
                // デモデータ
                challenges = this.generateDemoChallenges();
            }
            
            // フィルター・ソートの適用
            challenges = this.filterChallenges(challenges);
            challenges = this.sortChallenges(challenges);
            
            this.state.challenges = challenges;
            
            // UI の更新
            this.renderChallenges();
            this.updateProgressSection();
            this.updateFooter();
            
            this.state.loading = false;
            this.showLoading(false);
            
            // アナウンス
            this.announce(`${challenges.length}件のチャレンジを読み込みました`);
            
        } catch (error) {
            this.state.loading = false;
            this.showLoading(false);
            this.showError('チャレンジの読み込みに失敗しました');
            this.handleError('CHALLENGE_LOAD_FAILED', error);
        }
    }
    
    /**
     * デモチャレンジの生成
     */
    generateDemoChallenges() {
        return [
            {
                id: 'daily-1',
                title: '10個のバブルをポップ',
                description: '今日中に10個のバブルをポップしよう',
                type: 'daily',
                difficulty: 'easy',
                progress: 7,
                target: 10,
                reward: { ap: 50 },
                deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
                priority: 1
            },
            {
                id: 'weekly-1',
                title: '500ポイント獲得',
                description: '今週中に500ポイントを獲得しよう',
                type: 'weekly',
                difficulty: 'medium',
                progress: 250,
                target: 500,
                reward: { ap: 200 },
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                priority: 2
            },
            {
                id: 'special-1',
                title: 'コンボ10回達成',
                description: '1回のゲームで10回コンボを達成しよう',
                type: 'special',
                difficulty: 'hard',
                progress: 0,
                target: 1,
                reward: { ap: 300, title: 'コンボマスター' },
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                priority: 3
            }
        ];
    }
    
    /**
     * チャレンジのフィルタリング
     */
    filterChallenges(challenges) {
        const filter = this.state.filterBy;
        
        switch (filter) {
            case 'daily':
                return challenges.filter(c => c.type === 'daily');
            case 'weekly':
                return challenges.filter(c => c.type === 'weekly');
            case 'active':
                return challenges.filter(c => c.progress < c.target);
            case 'completed':
                return challenges.filter(c => c.progress >= c.target);
            default:
                return challenges;
        }
    }
    
    /**
     * チャレンジのソート
     */
    sortChallenges(challenges) {
        const sortBy = this.state.sortBy;
        
        return challenges.sort((a, b) => {
            switch (sortBy) {
                case 'priority':
                    return a.priority - b.priority;
                case 'difficulty':
                    const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
                    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
                case 'progress':
                    const aProgress = a.progress / a.target;
                    const bProgress = b.progress / b.target;
                    return bProgress - aProgress;
                case 'deadline':
                    return new Date(a.deadline) - new Date(b.deadline);
                default:
                    return 0;
            }
        });
    }
    
    /**
     * チャレンジのレンダリング
     */
    renderChallenges() {
        const list = this.elements.challengeList;
        list.innerHTML = '';
        this.elements.challengeItems = [];
        
        this.state.challenges.forEach((challenge, index) => {
            const item = this.createChallengeItem(challenge, index);
            this.elements.challengeItems.push(item);
            list.appendChild(item);
        });
        
        // フォーカス可能要素の更新
        this.updateFocusableElements();
    }
    
    /**
     * チャレンジアイテムの作成
     */
    createChallengeItem(challenge, index) {
        const item = document.createElement('div');
        item.className = `challenge-item challenge-item-${challenge.difficulty}`;
        item.setAttribute('role', 'listitem');
        item.setAttribute('tabindex', '0');
        item.setAttribute('data-challenge-id', challenge.id);
        item.setAttribute('data-index', index);
        
        // アクセシビリティ属性
        const progressPercent = Math.round((challenge.progress / challenge.target) * 100);
        const isCompleted = challenge.progress >= challenge.target;
        
        item.setAttribute('aria-label', 
            `チャレンジ: ${challenge.title}. ${challenge.description}. ` +
            `進捗: ${progressPercent}パーセント. 難易度: ${challenge.difficulty}. ` +
            `期限: ${this.formatDeadline(challenge.deadline)}. ` +
            `${isCompleted ? '完了済み' : '進行中'}`
        );
        
        // コンテンツの作成
        const header = document.createElement('div');
        header.className = 'challenge-item-header';
        
        const title = document.createElement('h4');
        title.className = 'challenge-item-title';
        title.textContent = challenge.title;
        
        const difficulty = document.createElement('span');
        difficulty.className = `challenge-item-difficulty challenge-item-difficulty-${challenge.difficulty}`;
        difficulty.textContent = this.getDifficultyLabel(challenge.difficulty);
        difficulty.setAttribute('data-difficulty', challenge.difficulty);
        
        header.appendChild(title);
        header.appendChild(difficulty);
        
        const description = document.createElement('p');
        description.className = 'challenge-item-description';
        description.textContent = challenge.description;
        
        const progress = document.createElement('div');
        progress.className = 'challenge-item-progress';
        progress.setAttribute('data-progress', progressPercent);
        
        const progressBar = document.createElement('div');
        progressBar.className = 'challenge-item-progress-bar';
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-valuenow', challenge.progress);
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', challenge.target);
        progressBar.setAttribute('aria-label', `進捗: ${challenge.progress}/${challenge.target}`);
        
        const progressFill = document.createElement('div');
        progressFill.className = 'challenge-item-progress-fill';
        progressFill.style.width = `${progressPercent}%`;
        
        const progressText = document.createElement('span');
        progressText.className = 'challenge-item-progress-text';
        progressText.textContent = `${challenge.progress}/${challenge.target} (${progressPercent}%)`;
        
        progressBar.appendChild(progressFill);
        progress.appendChild(progressBar);
        progress.appendChild(progressText);
        
        const footer = document.createElement('div');
        footer.className = 'challenge-item-footer';
        
        const deadline = document.createElement('span');
        deadline.className = 'challenge-item-deadline';
        deadline.textContent = `期限: ${this.formatDeadline(challenge.deadline)}`;
        
        const reward = document.createElement('span');
        reward.className = 'challenge-item-reward';
        reward.textContent = `報酬: ${this.formatReward(challenge.reward)}`;
        
        footer.appendChild(deadline);
        footer.appendChild(reward);
        
        // 要素の組み立て
        item.appendChild(header);
        item.appendChild(description);
        item.appendChild(progress);
        item.appendChild(footer);
        
        // 完了済みの場合
        if (isCompleted) {
            item.classList.add('challenge-item-completed');
            item.setAttribute('aria-label', item.getAttribute('aria-label') + '. 完了済み');
        }
        
        return item;
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
     * 報酬のフォーマット
     */
    formatReward(reward) {
        const parts = [];
        if (reward.ap) {
            parts.push(`${reward.ap} AP`);
        }
        if (reward.title) {
            parts.push(`称号「${reward.title}」`);
        }
        return parts.join(', ');
    }
    
    /**
     * 進捗セクションの更新
     */
    updateProgressSection() {
        const container = this.elements.progressSection.querySelector('.challenge-ui-progress-container');
        container.innerHTML = '';
        
        const total = this.state.challenges.length;
        const completed = this.state.challenges.filter(c => c.progress >= c.target).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'challenge-ui-overall-progress';
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-valuenow', completed);
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', total);
        progressBar.setAttribute('aria-label', `全体進捗: ${completed}/${total}完了`);
        
        const fill = document.createElement('div');
        fill.className = 'challenge-ui-overall-progress-fill';
        fill.style.width = `${completionRate}%`;
        
        const text = document.createElement('span');
        text.className = 'challenge-ui-overall-progress-text';
        text.textContent = `${completed}/${total} 完了 (${completionRate}%)`;
        
        progressBar.appendChild(fill);
        container.appendChild(progressBar);
        container.appendChild(text);
    }
    
    /**
     * フッターの更新
     */
    updateFooter() {
        const info = this.elements.footer.querySelector('.challenge-ui-info');
        info.textContent = `最終更新: ${new Date().toLocaleTimeString('ja-JP')}`;
    }
    
    /**
     * ローディング表示の制御
     */
    showLoading(show) {
        this.elements.loadingIndicator.style.display = show ? 'block' : 'none';
        this.elements.challengeList.style.display = show ? 'none' : 'block';
        
        if (show && this.config.accessibility.announcements) {
            this.announce('チャレンジを読み込んでいます');
        }
    }
    
    /**
     * エラー表示
     */
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.style.display = 'block';
        this.state.error = message;
        
        if (this.config.accessibility.announcements) {
            this.announce(`エラー: ${message}`, 'assertive');
        }
        
        // 3秒後に自動で隠す
        setTimeout(() => {
            this.elements.errorMessage.style.display = 'none';
            this.state.error = null;
        }, 3000);
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
     * 自動更新の開始
     */
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.refreshTimer = setInterval(() => {
            if (this.state.visible && !this.state.loading) {
                this.loadChallenges();
            }
        }, this.config.refreshInterval);
    }
    
    /**
     * 自動更新の停止
     */
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
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
            
            this.log('チャレンジ選択', { challengeId });
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
            
            await this.loadChallenges();
            
            this.announce(`フィルターを「${event.target.selectedOptions[0].text}」に変更しました`);
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
            
            await this.loadChallenges();
            
            this.announce(`並び順を「${event.target.selectedOptions[0].text}」に変更しました`);
        }
    }
    
    /**
     * 更新ハンドラー
     */
    async handleRefresh() {
        await this.loadChallenges();
        this.announce('チャレンジを更新しました');
    }
    
    /**
     * リサイズハンドラー
     */
    handleResize() {
        this.applyResponsiveStyles();
    }
    
    /**
     * アナウンス
     */
    announce(message, priority = 'polite') {
        if (!this.config.accessibility.announcements || !this.elements.announcer) return;
        
        this.stats.announcementsMade++;
        
        // 一度クリアしてから新しいメッセージを設定
        this.elements.announcer.textContent = '';
        setTimeout(() => {
            this.elements.announcer.textContent = message;
        }, 100);
        
        this.log('アナウンス', { message, priority });
    }
    
    /**
     * チャレンジの詳細アナウンス
     */
    announceChallenge(challenge) {
        const progressPercent = Math.round((challenge.progress / challenge.target) * 100);
        const message = `選択中: ${challenge.title}. 進捗 ${progressPercent}パーセント. ` +
                       `難易度 ${this.getDifficultyLabel(challenge.difficulty)}. ` +
                       `期限 ${this.formatDeadline(challenge.deadline)}`;
        
        this.announce(message);
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
            
            this.announce(message, 'assertive');
        }
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // スタイルの再適用
        this.applyStyles();
        
        // 自動更新の再設定
        if (this.config.autoRefresh) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }
        
        this.log('ChallengeUI設定更新', newConfig);
    }
    
    /**
     * 統計の取得
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        // 自動更新の停止
        this.stopAutoRefresh();
        
        // イベントリスナーの削除
        window.removeEventListener('resize', this.handlers.resize);
        
        // DOM要素の削除
        if (this.elements.container && this.elements.container.parentNode) {
            this.elements.container.parentNode.removeChild(this.elements.container);
        }
        
        this.log('ChallengeUI破棄完了');
    }
    
    /**
     * エラーハンドリング
     */
    handleError(type, error, context = {}) {
        const errorInfo = {
            type,
            error: error.message || error,
            context,
            timestamp: Date.now()
        };
        
        if (ErrorHandler) {
            ErrorHandler.handleError(error, 'ChallengeUI', context);
        }
        
        this.log('エラー発生', errorInfo, 'error');
    }
    
    /**
     * ログ記録
     */
    log(message, data = null, level = 'info') {
        const logEntry = {
            timestamp: Date.now(),
            level,
            message,
            data
        };
        
        const consoleMethod = level === 'error' ? 'error' : 
                            level === 'warn' ? 'warn' : 'log';
        console[consoleMethod](`[ChallengeUI] ${message}`, data || '');
    }
}