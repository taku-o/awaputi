/**
 * ChallengeUIRenderer
 * UI要素レンダリング、レイアウト管理、視覚スタイリング
 */
export class ChallengeUIRenderer {
    constructor(challengeUI) {
        this.challengeUI = challengeUI;
        this.config = challengeUI.config;
        this.state = challengeUI.state;
        this.elements = challengeUI.elements;
        
        console.log('[ChallengeUIRenderer] Component initialized');
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
    }
    
    /**
     * エラー表示
     */
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.style.display = 'block';
        
        // 3秒後に自動で隠す
        setTimeout(() => {
            this.elements.errorMessage.style.display = 'none';
        }, 3000);
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
}