/**
 * ソーシャルリーダーボードUI (Task 23 - アクセシビリティ対応)
 * アクセシブルなリーダーボード表示コンポーネント
 */

// 型定義
interface LeaderboardManager {
    getLeaderboard: (type: string, options?: any) => Promise<LeaderboardEntry[]>;
    refreshData: () => Promise<void>;
    [key: string]: any;
}

interface LeaderboardEntry {
    rank: number;
    playerId: string;
    playerName: string;
    score: number;
    avatar?: string;
    timestamp: number;
    badges?: string[];
    achievements?: string[];
    metadata?: any;
}

interface LeaderboardConfig {
    container: HTMLElement;
    maxEntries: number;
    showPlayerRank: boolean;
    showPagination: boolean;
    itemsPerPage: number;
    theme: 'default' | 'minimal' | 'gaming' | 'elegant';
    responsive: boolean;
    animations: boolean;
    accessibility: AccessibilityConfig;
    localization: LocalizationConfig;
}

interface AccessibilityConfig {
    enabled: boolean;
    announcements: boolean;
    keyboardNavigation: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    screenReaderDescriptions: boolean;
}

interface LocalizationConfig {
    enabled: boolean;
    defaultLanguage: string;
    rtlSupport: boolean;
}

interface LeaderboardState {
    currentLeaderboard: string;
    currentPage: number;
    selectedEntry: LeaderboardEntry | null;
    focusedElement: HTMLElement | null;
    sortOrder: 'asc' | 'desc';
    filterPeriod: 'all' | 'daily' | 'weekly' | 'monthly';
    searchQuery: string;
    loading: boolean;
}

interface LeaderboardElements {
    container: HTMLElement | null;
    header: HTMLElement | null;
    controls: HTMLElement | null;
    content: HTMLElement | null;
    entries: HTMLElement[];
    pagination: HTMLElement | null;
    announcer: HTMLElement | null;
    loadingIndicator: HTMLElement | null;
}

interface LeaderboardHandlers {
    keydown: (event: KeyboardEvent) => void;
    click: (event: MouseEvent) => void;
    focus: (event: FocusEvent) => void;
    resize: (event: Event) => void;
    filterChange: (event: Event) => void;
    searchInput: (event: Event) => void;
}

interface LeaderboardStats {
    renders: number;
    interactions: number;
    keyboardNavigations: number;
    searches: number;
}

interface FilterOption {
    value: string;
    label: string;
}

export class SocialLeaderboardUI {
    private leaderboardManager: LeaderboardManager;
    private config: LeaderboardConfig;
    private state: LeaderboardState;
    private elements: LeaderboardElements;
    private handlers: LeaderboardHandlers;
    private cache: Map<string, LeaderboardEntry[]>;
    private lastUpdate: number;
    private stats: LeaderboardStats;

    constructor(leaderboardManager: LeaderboardManager, options: any = {}) {
        this.leaderboardManager = leaderboardManager;
        
        // 設定
        this.config = {
            // 表示設定
            container: options.container || document.body,
            maxEntries: options.maxEntries || 10,
            showPlayerRank: options.showPlayerRank !== false,
            showPagination: options.showPagination === true,
            itemsPerPage: options.itemsPerPage || 10,
            // スタイル設定
            theme: options.theme || 'default',
            responsive: options.responsive !== false,
            animations: options.animations !== false,
            // アクセシビリティ設定
            accessibility: {
                enabled: options.accessibility !== false,
                announcements: options.announcements !== false,
                keyboardNavigation: options.keyboardNavigation !== false,
                highContrast: options.highContrast === true,
                reducedMotion: options.reducedMotion === true,
                screenReaderDescriptions: options.screenReaderDescriptions !== false
            },
            // 多言語設定
            localization: {
                enabled: options.localization !== false,
                defaultLanguage: options.defaultLanguage || 'ja',
                rtlSupport: options.rtlSupport === true
            }
        };

        // 状態管理
        this.state = {
            currentLeaderboard: 'overall',
            currentPage: 1,
            selectedEntry: null,
            focusedElement: null,
            sortOrder: 'desc',
            filterPeriod: 'all',
            searchQuery: '',
            loading: false
        };

        // DOM要素
        this.elements = {
            container: null,
            header: null,
            controls: null,
            content: null,
            entries: [],
            pagination: null,
            announcer: null,
            loadingIndicator: null
        };

        // イベントハンドラー
        this.handlers = {
            keydown: this.handleKeydown.bind(this),
            click: this.handleClick.bind(this),
            focus: this.handleFocus.bind(this),
            resize: this.handleResize.bind(this),
            filterChange: this.handleFilterChange.bind(this),
            searchInput: this.handleSearchInput.bind(this)
        };
        
        // データキャッシュ
        this.cache = new Map();
        this.lastUpdate = 0;
        
        // 統計
        this.stats = {
            renders: 0,
            interactions: 0,
            keyboardNavigations: 0,
            searches: 0
        };

        this.initialize();
    }
    
    /**
     * 初期化
     */
    private initialize(): void {
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
            // 初期データの読み込み
            this.loadInitialData();
            this.log('SocialLeaderboardUI初期化完了');

        } catch (error) {
            this.handleError('LEADERBOARD_UI_INIT_FAILED', error);
        }
    }
    
    /**
     * DOM要素の作成
     */
    private createElements(): void {
        this.elements.container = document.createElement('div');
        this.elements.container.className = 'social-leaderboard-ui';
        this.elements.container.setAttribute('role', 'region');
        this.elements.container.setAttribute('aria-label', 'リーダーボード');
        
        // ヘッダー
        this.elements.header = this.createHeader();
        // コントロール
        this.elements.controls = this.createControls();
        // コンテンツ
        this.elements.content = document.createElement('div');
        this.elements.content.className = 'leaderboard-content';
        this.elements.content.setAttribute('role', 'main');
        this.elements.content.setAttribute('aria-live', 'polite');
        this.elements.content.setAttribute('aria-busy', 'false');
        
        // ページネーション
        if (this.config.showPagination) {
            this.elements.pagination = this.createPagination();
        }
        
        // ローディングインジケーター
        this.elements.loadingIndicator = this.createLoadingIndicator();

        // スクリーンリーダー用アナウンサー
        if (this.config.accessibility.enabled) {
            this.elements.announcer = document.createElement('div');
            this.elements.announcer.className = 'leaderboard-announcer sr-only';
            this.elements.announcer.setAttribute('aria-live', 'polite');
            this.elements.announcer.setAttribute('aria-atomic', 'true');
            this.elements.announcer.style.cssText = `
                position: absolute !important;
                left: -10000px !important;
                width: 1px !important;
                height: 1px !important;
                overflow: hidden !important;
            `;
        }
        
        // 要素の組み立て
        this.elements.container.appendChild(this.elements.header);
        this.elements.container.appendChild(this.elements.controls);
        this.elements.container.appendChild(this.elements.content);
        
        if (this.elements.pagination) {
            this.elements.container.appendChild(this.elements.pagination);
        }
        
        this.elements.container.appendChild(this.elements.loadingIndicator);
        
        if (this.elements.announcer) {
            this.elements.container.appendChild(this.elements.announcer);
        }
        
        // 指定されたコンテナに追加
        this.config.container.appendChild(this.elements.container);
    }
    
    /**
     * ヘッダーの作成
     */
    private createHeader(): HTMLElement {
        const header = document.createElement('div');
        header.className = 'leaderboard-header';

        const title = document.createElement('h2');
        title.className = 'leaderboard-title';
        title.id = 'leaderboard-title';
        title.textContent = 'リーダーボード';

        const subtitle = document.createElement('div');
        subtitle.className = 'leaderboard-subtitle';
        subtitle.id = 'leaderboard-subtitle';
        subtitle.textContent = '上位プレイヤーのスコア';
        
        header.appendChild(title);
        header.appendChild(subtitle);
        
        return header;
    }
    
    /**
     * コントロールの作成
     */
    private createControls(): HTMLElement {
        const controls = document.createElement('div');
        controls.className = 'leaderboard-controls';
        controls.setAttribute('role', 'toolbar');
        controls.setAttribute('aria-label', 'リーダーボード制御');
        
        // フィルター選択
        const filterGroup = document.createElement('div');
        filterGroup.className = 'control-group filter-group';

        const filterLabel = document.createElement('label');
        filterLabel.htmlFor = 'leaderboard-filter';
        filterLabel.textContent = '期間:';

        const filterSelect = document.createElement('select');
        filterSelect.id = 'leaderboard-filter';
        filterSelect.className = 'leaderboard-filter';
        filterSelect.setAttribute('aria-label', '表示期間を選択');

        const filterOptions: FilterOption[] = [
            { value: 'all', label: '全期間' },
            { value: 'daily', label: '今日' },
            { value: 'weekly', label: '今週' },
            { value: 'monthly', label: '今月' }
        ];

        filterOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            filterSelect.appendChild(optionElement);
        });

        filterGroup.appendChild(filterLabel);
        filterGroup.appendChild(filterSelect);
        
        // 検索ボックス
        const searchGroup = document.createElement('div');
        searchGroup.className = 'control-group search-group';

        const searchLabel = document.createElement('label');
        searchLabel.htmlFor = 'leaderboard-search';
        searchLabel.textContent = '検索:';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'leaderboard-search';
        searchInput.className = 'leaderboard-search';
        searchInput.placeholder = 'プレイヤー名で検索';
        searchInput.setAttribute('aria-label', 'プレイヤー名で検索');

        const searchButton = document.createElement('button');
        searchButton.type = 'button';
        searchButton.className = 'search-button';
        searchButton.setAttribute('aria-label', '検索実行');
        searchButton.innerHTML = '🔍';
        
        searchGroup.appendChild(searchLabel);
        searchGroup.appendChild(searchInput);
        searchGroup.appendChild(searchButton);
        
        // 更新ボタン
        const refreshButton = document.createElement('button');
        refreshButton.type = 'button';
        refreshButton.className = 'refresh-button';
        refreshButton.setAttribute('aria-label', 'リーダーボードを更新');
        refreshButton.innerHTML = '🔄 更新';
        
        controls.appendChild(filterGroup);
        controls.appendChild(searchGroup);
        controls.appendChild(refreshButton);
        
        return controls;
    }
    
    /**
     * ページネーションの作成
     */
    private createPagination(): HTMLElement {
        const pagination = document.createElement('nav');
        pagination.className = 'leaderboard-pagination';
        pagination.setAttribute('role', 'navigation');
        pagination.setAttribute('aria-label', 'リーダーボードページネーション');

        const prevButton = document.createElement('button');
        prevButton.className = 'pagination-button prev-button';
        prevButton.setAttribute('aria-label', '前のページ');
        prevButton.innerHTML = '← 前へ';
        prevButton.disabled = true;

        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.setAttribute('aria-live', 'polite');
        pageInfo.textContent = 'ページ 1 / 1';

        const nextButton = document.createElement('button');
        nextButton.className = 'pagination-button next-button';
        nextButton.setAttribute('aria-label', '次のページ');
        nextButton.innerHTML = '次へ →';
        nextButton.disabled = true;
        
        pagination.appendChild(prevButton);
        pagination.appendChild(pageInfo);
        pagination.appendChild(nextButton);
        
        return pagination;
    }
    
    /**
     * ローディングインジケーターの作成
     */
    private createLoadingIndicator(): HTMLElement {
        const indicator = document.createElement('div');
        indicator.className = 'leaderboard-loading';
        indicator.setAttribute('aria-hidden', 'true');
        indicator.style.display = 'none';

        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        
        const text = document.createElement('div');
        text.className = 'loading-text';
        text.textContent = '読み込み中...';

        indicator.appendChild(spinner);
        indicator.appendChild(text);
        
        return indicator;
    }

    /**
     * スタイルの適用
     */
    private applyStyles(): void {
        // テーマに応じたスタイルクラスを追加
        if (this.elements.container) {
            this.elements.container.classList.add(`theme-${this.config.theme}`);
            
            if (this.config.accessibility.highContrast) {
                this.elements.container.classList.add('high-contrast');
            }
            
            if (this.config.accessibility.reducedMotion) {
                this.elements.container.classList.add('reduced-motion');
            }
            
            if (this.config.responsive) {
                this.elements.container.classList.add('responsive');
            }
        }
    }

    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void {
        if (!this.elements.container) return;

        // キーボードナビゲーション
        if (this.config.accessibility.keyboardNavigation) {
            this.elements.container.addEventListener('keydown', this.handlers.keydown);
        }

        // クリックイベント
        this.elements.container.addEventListener('click', this.handlers.click);
        
        // フォーカスイベント
        this.elements.container.addEventListener('focus', this.handlers.focus, true);
        
        // リサイズイベント
        if (this.config.responsive) {
            window.addEventListener('resize', this.handlers.resize);
        }

        // フィルターとサーチ
        const filterSelect = this.elements.container.querySelector('.leaderboard-filter') as HTMLSelectElement;
        if (filterSelect) {
            filterSelect.addEventListener('change', this.handlers.filterChange);
        }

        const searchInput = this.elements.container.querySelector('.leaderboard-search') as HTMLInputElement;
        if (searchInput) {
            searchInput.addEventListener('input', this.handlers.searchInput);
        }
    }

    /**
     * アクセシビリティの設定
     */
    private setupAccessibility(): void {
        if (!this.elements.container) return;

        // WAI-ARIA属性の設定
        this.elements.container.setAttribute('tabindex', '0');
        
        // スクリーンリーダー用の説明
        if (this.config.accessibility.screenReaderDescriptions) {
            const description = document.createElement('div');
            description.id = 'leaderboard-description';
            description.className = 'sr-only';
            description.textContent = 'プレイヤーランキングを表示しています。矢印キーで項目を移動できます。';
            this.elements.container.appendChild(description);
            this.elements.container.setAttribute('aria-describedby', 'leaderboard-description');
        }
    }

    /**
     * 初期データの読み込み
     */
    private async loadInitialData(): Promise<void> {
        try {
            this.showLoading();
            await this.loadLeaderboardData();
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            this.handleError('LEADERBOARD_DATA_LOAD_FAILED', error);
        }
    }

    /**
     * リーダーボードデータの読み込み
     */
    private async loadLeaderboardData(): Promise<void> {
        const cacheKey = `${this.state.currentLeaderboard}-${this.state.filterPeriod}`;
        
        // キャッシュチェック
        if (this.cache.has(cacheKey) && (Date.now() - this.lastUpdate) < 60000) {
            const cachedData = this.cache.get(cacheKey)!;
            this.renderLeaderboard(cachedData);
            return;
        }

        // データの取得
        const entries = await this.leaderboardManager.getLeaderboard(
            this.state.currentLeaderboard,
            {
                period: this.state.filterPeriod,
                limit: this.config.maxEntries
            }
        );

        // キャッシュに保存
        this.cache.set(cacheKey, entries);
        this.lastUpdate = Date.now();

        // 検索フィルター適用
        const filteredEntries = this.applySearchFilter(entries);
        
        // 描画
        this.renderLeaderboard(filteredEntries);
    }

    /**
     * 検索フィルターの適用
     */
    private applySearchFilter(entries: LeaderboardEntry[]): LeaderboardEntry[] {
        if (!this.state.searchQuery.trim()) {
            return entries;
        }

        const query = this.state.searchQuery.toLowerCase();
        return entries.filter(entry => 
            entry.playerName.toLowerCase().includes(query)
        );
    }

    /**
     * リーダーボードの描画
     */
    private renderLeaderboard(entries: LeaderboardEntry[]): void {
        if (!this.elements.content) return;

        this.stats.renders++;
        this.elements.entries = [];

        // コンテンツクリア
        this.elements.content.innerHTML = '';

        if (entries.length === 0) {
            this.renderEmptyState();
            return;
        }

        // エントリーの描画
        const startIndex = (this.state.currentPage - 1) * this.config.itemsPerPage;
        const endIndex = startIndex + this.config.itemsPerPage;
        const pageEntries = entries.slice(startIndex, endIndex);

        pageEntries.forEach((entry, index) => {
            const entryElement = this.createLeaderboardEntry(entry, startIndex + index);
            this.elements.content.appendChild(entryElement);
            this.elements.entries.push(entryElement);
        });

        // ページネーション更新
        if (this.config.showPagination) {
            this.updatePagination(entries.length);
        }

        // スクリーンリーダー通知
        this.announceUpdate(`リーダーボードが更新されました。${entries.length}件のエントリーが表示されています。`);
    }

    /**
     * リーダーボードエントリーの作成
     */
    private createLeaderboardEntry(entry: LeaderboardEntry, visualIndex: number): HTMLElement {
        const entryElement = document.createElement('div');
        entryElement.className = 'leaderboard-entry';
        entryElement.setAttribute('role', 'listitem');
        entryElement.setAttribute('tabindex', '0');
        entryElement.setAttribute('aria-label', 
            `${entry.rank}位 ${entry.playerName} スコア ${entry.score.toLocaleString()}`);

        // ランク
        const rankElement = document.createElement('div');
        rankElement.className = 'entry-rank';
        rankElement.textContent = entry.rank.toString();
        
        // プレイヤー情報
        const playerElement = document.createElement('div');
        playerElement.className = 'entry-player';
        
        if (entry.avatar) {
            const avatarElement = document.createElement('img');
            avatarElement.className = 'player-avatar';
            avatarElement.src = entry.avatar;
            avatarElement.alt = `${entry.playerName}のアバター`;
            playerElement.appendChild(avatarElement);
        }

        const nameElement = document.createElement('div');
        nameElement.className = 'player-name';
        nameElement.textContent = entry.playerName;
        playerElement.appendChild(nameElement);

        // スコア
        const scoreElement = document.createElement('div');
        scoreElement.className = 'entry-score';
        scoreElement.textContent = entry.score.toLocaleString();

        // バッジ
        if (entry.badges && entry.badges.length > 0) {
            const badgesElement = document.createElement('div');
            badgesElement.className = 'entry-badges';
            entry.badges.forEach(badge => {
                const badgeElement = document.createElement('span');
                badgeElement.className = 'badge';
                badgeElement.textContent = badge;
                badgesElement.appendChild(badgeElement);
            });
            playerElement.appendChild(badgesElement);
        }

        entryElement.appendChild(rankElement);
        entryElement.appendChild(playerElement);
        entryElement.appendChild(scoreElement);

        return entryElement;
    }

    /**
     * 空の状態の描画
     */
    private renderEmptyState(): void {
        if (!this.elements.content) return;

        const emptyElement = document.createElement('div');
        emptyElement.className = 'leaderboard-empty';
        emptyElement.setAttribute('role', 'status');
        emptyElement.setAttribute('aria-live', 'polite');

        const messageElement = document.createElement('div');
        messageElement.className = 'empty-message';
        messageElement.textContent = this.state.searchQuery ? 
            '検索条件に一致するプレイヤーが見つかりません。' : 
            'リーダーボードにデータがありません。';

        emptyElement.appendChild(messageElement);
        this.elements.content.appendChild(emptyElement);
    }

    /**
     * ページネーションの更新
     */
    private updatePagination(totalEntries: number): void {
        if (!this.elements.pagination) return;

        const totalPages = Math.ceil(totalEntries / this.config.itemsPerPage);
        const prevButton = this.elements.pagination.querySelector('.prev-button') as HTMLButtonElement;
        const nextButton = this.elements.pagination.querySelector('.next-button') as HTMLButtonElement;
        const pageInfo = this.elements.pagination.querySelector('.page-info') as HTMLSpanElement;

        if (prevButton) {
            prevButton.disabled = this.state.currentPage <= 1;
        }

        if (nextButton) {
            nextButton.disabled = this.state.currentPage >= totalPages;
        }

        if (pageInfo) {
            pageInfo.textContent = `ページ ${this.state.currentPage} / ${totalPages}`;
        }
    }

    /**
     * ローディング表示
     */
    private showLoading(): void {
        this.state.loading = true;
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'block';
        }
        if (this.elements.content) {
            this.elements.content.setAttribute('aria-busy', 'true');
        }
    }

    /**
     * ローディング非表示
     */
    private hideLoading(): void {
        this.state.loading = false;
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'none';
        }
        if (this.elements.content) {
            this.elements.content.setAttribute('aria-busy', 'false');
        }
    }

    /**
     * スクリーンリーダー通知
     */
    private announceUpdate(message: string): void {
        if (!this.config.accessibility.announcements || !this.elements.announcer) {
            return;
        }

        this.elements.announcer.textContent = message;
        
        // すぐにクリアして再度読み上げ可能にする
        setTimeout(() => {
            if (this.elements.announcer) {
                this.elements.announcer.textContent = '';
            }
        }, 1000);
    }

    /**
     * キーボードイベントハンドラー
     */
    private handleKeydown(event: KeyboardEvent): void {
        this.stats.keyboardNavigations++;
        
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.navigateEntries('up');
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.navigateEntries('down');
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
                this.selectCurrentEntry();
                break;
        }
    }

    /**
     * エントリー間のナビゲーション
     */
    private navigateEntries(direction: 'up' | 'down'): void {
        if (this.elements.entries.length === 0) return;

        const currentIndex = this.elements.entries.indexOf(this.state.focusedElement as HTMLElement);
        let newIndex: number;

        if (direction === 'up') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : this.elements.entries.length - 1;
        } else {
            newIndex = currentIndex < this.elements.entries.length - 1 ? currentIndex + 1 : 0;
        }

        this.focusEntry(this.elements.entries[newIndex]);
    }

    /**
     * 最初のエントリーにナビゲート
     */
    private navigateToFirst(): void {
        if (this.elements.entries.length > 0) {
            this.focusEntry(this.elements.entries[0]);
        }
    }

    /**
     * 最後のエントリーにナビゲート
     */
    private navigateToLast(): void {
        if (this.elements.entries.length > 0) {
            this.focusEntry(this.elements.entries[this.elements.entries.length - 1]);
        }
    }

    /**
     * エントリーにフォーカス
     */
    private focusEntry(entryElement: HTMLElement): void {
        this.state.focusedElement = entryElement;
        entryElement.focus();
    }

    /**
     * 現在のエントリーを選択
     */
    private selectCurrentEntry(): void {
        if (this.state.focusedElement) {
            // エントリー選択のロジック（実装依存）
            this.stats.interactions++;
        }
    }

    /**
     * クリックイベントハンドラー
     */
    private handleClick(event: MouseEvent): void {
        this.stats.interactions++;
        
        const target = event.target as HTMLElement;
        
        // 更新ボタン
        if (target.classList.contains('refresh-button')) {
            this.refreshData();
            return;
        }

        // 検索ボタン
        if (target.classList.contains('search-button')) {
            this.executeSearch();
            return;
        }

        // ページネーション
        if (target.classList.contains('prev-button')) {
            this.previousPage();
            return;
        }

        if (target.classList.contains('next-button')) {
            this.nextPage();
            return;
        }
    }

    /**
     * フォーカスイベントハンドラー
     */
    private handleFocus(event: FocusEvent): void {
        const target = event.target as HTMLElement;
        if (target.classList.contains('leaderboard-entry')) {
            this.state.focusedElement = target;
        }
    }

    /**
     * リサイズイベントハンドラー
     */
    private handleResize(event: Event): void {
        // レスポンシブレイアウトの調整
        this.adjustResponsiveLayout();
    }

    /**
     * フィルター変更ハンドラー
     */
    private handleFilterChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        this.state.filterPeriod = select.value as any;
        this.state.currentPage = 1;
        this.loadLeaderboardData();
    }

    /**
     * 検索入力ハンドラー
     */
    private handleSearchInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.state.searchQuery = input.value;
        
        // デバウンス処理
        clearTimeout((this as any).searchTimeout);
        (this as any).searchTimeout = setTimeout(() => {
            this.executeSearch();
        }, 300);
    }

    /**
     * データ更新
     */
    async refreshData(): Promise<void> {
        try {
            this.cache.clear();
            await this.loadLeaderboardData();
            this.announceUpdate('リーダーボードが更新されました。');
        } catch (error) {
            this.handleError('LEADERBOARD_REFRESH_FAILED', error);
        }
    }

    /**
     * 検索実行
     */
    private executeSearch(): void {
        this.stats.searches++;
        this.state.currentPage = 1;
        this.loadLeaderboardData();
    }

    /**
     * 前のページ
     */
    private previousPage(): void {
        if (this.state.currentPage > 1) {
            this.state.currentPage--;
            this.loadLeaderboardData();
        }
    }

    /**
     * 次のページ
     */
    private nextPage(): void {
        this.state.currentPage++;
        this.loadLeaderboardData();
    }

    /**
     * レスポンシブレイアウト調整
     */
    private adjustResponsiveLayout(): void {
        if (!this.config.responsive || !this.elements.container) return;

        const containerWidth = this.elements.container.offsetWidth;
        
        if (containerWidth < 768) {
            this.elements.container.classList.add('mobile');
        } else {
            this.elements.container.classList.remove('mobile');
        }
    }

    /**
     * エラーハンドリング
     */
    private handleError(errorType: string, error: any): void {
        console.error(`[SocialLeaderboardUI] ${errorType}:`, error);
        
        // エラー表示
        if (this.elements.content) {
            const errorElement = document.createElement('div');
            errorElement.className = 'leaderboard-error';
            errorElement.setAttribute('role', 'alert');
            errorElement.textContent = 'リーダーボードの読み込みに失敗しました。';
            
            this.elements.content.innerHTML = '';
            this.elements.content.appendChild(errorElement);
        }
    }

    /**
     * ログ出力
     */
    private log(message: string, data?: any): void {
        console.log(`[SocialLeaderboardUI] ${message}`, data || '');
    }

    /**
     * 統計情報の取得
     */
    getStats(): LeaderboardStats {
        return { ...this.stats };
    }

    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<LeaderboardConfig>): void {
        Object.assign(this.config, newConfig);
        this.applyStyles();
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        // イベントリスナーの削除
        if (this.elements.container) {
            this.elements.container.removeEventListener('keydown', this.handlers.keydown);
            this.elements.container.removeEventListener('click', this.handlers.click);
            this.elements.container.removeEventListener('focus', this.handlers.focus, true);
        }

        if (this.config.responsive) {
            window.removeEventListener('resize', this.handlers.resize);
        }

        // DOM要素の削除
        if (this.elements.container && this.elements.container.parentNode) {
            this.elements.container.parentNode.removeChild(this.elements.container);
        }

        // 参照のクリア
        this.cache.clear();
        this.elements.entries = [];
    }
}