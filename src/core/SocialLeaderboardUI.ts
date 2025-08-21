/**
 * ソーシャルリーダーボードUI (Task, 23 - アクセシビリティ対応)
 * アクセシブルなリーダーボード表示コンポーネント
 */

export class SocialLeaderboardUI {
    constructor(leaderboardManager, options = {) {
        this.leaderboardManager = leaderboardManager;
        
        // 設定
        this.config = {
            // 表示設定
            container: options.container || document.body;
            maxEntries: options.maxEntries || 10;
            showPlayerRank: options.showPlayerRank !== false;
            showPagination: options.showPagination === true;
            itemsPerPage: options.itemsPerPage || 10;
            // スタイル設定
           , theme: options.theme || 'default', // default, minimal, gaming, elegant;
            responsive: options.responsive !== false;
            animations: options.animations !== false;
            // アクセシビリティ設定
           , accessibility: {
                enabled: options.accessibility !== false;
                announcements: options.announcements !== false;
                keyboardNavigation: options.keyboardNavigation !== false;
                highContrast: options.highContrast === true,
    reducedMotion: options.reducedMotion = == true ,}
                screenReaderDescriptions: options.screenReaderDescriptions !== false 
    };
            // 多言語設定
            localization: { enabled: options.localization !== false,''
                defaultLanguage: options.defaultLanguage || 'ja',
    rtlSupport: options.rtlSupport === true ,}
        };
        // 状態管理
        this.state = {;
            currentLeaderboard: 'overall';
            currentPage: 1,
    selectedEntry: null,
            focusedElement: null,
            sortOrder: 'desc',
            filterPeriod: 'all',
            searchQuery: '',
    loading: false ,};
        // DOM要素
        this.elements = { container: null,
            header: null;
            controls: null;
            content: null;
            entries: [];
            pagination: null;
            announcer: null,
    loadingIndicator: null ,};
        // イベントハンドラー
        this.handlers = { keydown: this.handleKeydown.bind(this),
            click: this.handleClick.bind(this);
            focus: this.handleFocus.bind(this);
            resize: this.handleResize.bind(this);
            filterChange: this.handleFilterChange.bind(this),
    searchInput: this.handleSearchInput.bind(this ,};
        
        // データキャッシュ
        this.cache = new Map();
        this.lastUpdate = 0;
        
        // 統計
        this.stats = { renders: 0,
            interactions: 0;
            keyboardNavigations: 0,
    searches: 0 ,};
        this.initialize();
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
    }
                this.setupAccessibility(); }
            }
            ;
            // 初期データの読み込み
            this.loadInitialData()';
            this.log('SocialLeaderboardUI初期化完了);

        } catch (error) {
            this.handleError('LEADERBOARD_UI_INIT_FAILED', error'; }
    }
    
    /**
     * DOM要素の作成'
     */''
    createElements()';
        this.elements.container = document.createElement('div'');''
        this.elements.container.className = 'social-leaderboard-ui';
        this.elements.container.setAttribute('role', 'region'');''
        this.elements.container.setAttribute('aria-label', 'リーダーボード);
        
        // ヘッダー
        this.elements.header = this.createHeader();
        // コントロール
        this.elements.controls = this.createControls()';
        this.elements.content = document.createElement('div'');''
        this.elements.content.className = 'leaderboard-content';
        this.elements.content.setAttribute('role', 'main'');''
        this.elements.content.setAttribute('aria-live', 'polite'');''
        this.elements.content.setAttribute('aria-busy', 'false);
        
        // ページネーション
        if (this.config.showPagination) { this.elements.pagination = this.createPagination(); }
        
        // ローディングインジケーター
        this.elements.loadingIndicator = this.createLoadingIndicator();
        // スクリーンリーダー用アナウンサー
        if(this.config.accessibility.enabled) {'

            this.elements.announcer = document.createElement('div'');''
            this.elements.announcer.className = 'leaderboard-announcer sr-only';
            this.elements.announcer.setAttribute('aria-live', 'polite'');''
            this.elements.announcer.setAttribute('aria-atomic', 'true);
            this.elements.announcer.style.cssText = `;
                position: absolute !important;
                left: -10000px !important;
                width: 1px !important;
                height: 1px !important,
    overflow: hidden !important;
        ,}
            `; }
        }
        
        // 要素の組み立て
        this.elements.container.appendChild(this.elements.header);
        this.elements.container.appendChild(this.elements.controls);
        this.elements.container.appendChild(this.elements.content);
        
        if (this.elements.pagination) { this.elements.container.appendChild(this.elements.pagination); }
        
        this.elements.container.appendChild(this.elements.loadingIndicator);
        
        if (this.elements.announcer) { this.elements.container.appendChild(this.elements.announcer); }
        
        // 指定されたコンテナに追加
        this.config.container.appendChild(this.elements.container);
    }
    
    /**
     * ヘッダーの作成
     */''
    createHeader()';
        const header = document.createElement('div'');''
        header.className = 'leaderboard-header';

        const title = document.createElement('h2'');''
        title.className = 'leaderboard-title';
        title.id = 'leaderboard-title';
        title.textContent = 'リーダーボード';

        const subtitle = document.createElement('div'');''
        subtitle.className = 'leaderboard-subtitle';
        subtitle.id = 'leaderboard-subtitle';
        subtitle.textContent = '上位プレイヤーのスコア';
        
        header.appendChild(title);
        header.appendChild(subtitle);
        
        return header;
    }
    
    /**
     * コントロールの作成'
     */''
    createControls()';
        const controls = document.createElement('div'');''
        controls.className = 'leaderboard-controls';
        controls.setAttribute('role', 'toolbar'');''
        controls.setAttribute('aria-label', 'リーダーボード制御'');
        ';
        // フィルター選択
        const filterGroup = document.createElement('div'');''
        filterGroup.className = 'control-group filter-group';

        const filterLabel = document.createElement('label'');''
        filterLabel.htmlFor = 'leaderboard-filter';
        filterLabel.textContent = '期間:';

        const filterSelect = document.createElement('select'');''
        filterSelect.id = 'leaderboard-filter';
        filterSelect.className = 'leaderboard-filter';
        filterSelect.setAttribute('aria-label', '表示期間を選択'');
        ';

        const filterOptions = ['';
            { value: 'all', label: '全期間' ,},''
            { value: 'daily', label: '今日' ,},''
            { value: 'weekly', label: '今週' ,},]'
            { value: 'monthly', label: '今月' ,}]
        ];

        filterOptions.forEach(option => {  ');''
            const optionElement = document.createElement('option);
            optionElement.value = option.value;
            optionElement.textContent = option.label; }
            filterSelect.appendChild(optionElement); }
        });
        ';

        filterGroup.appendChild(filterLabel);''
        filterGroup.appendChild(filterSelect);
        ';
        // 検索ボックス
        const searchGroup = document.createElement('div'');''
        searchGroup.className = 'control-group search-group';

        const searchLabel = document.createElement('label'');''
        searchLabel.htmlFor = 'leaderboard-search';
        searchLabel.textContent = '検索:';

        const searchInput = document.createElement('input'');''
        searchInput.type = 'text';
        searchInput.id = 'leaderboard-search';
        searchInput.className = 'leaderboard-search';
        searchInput.placeholder = 'プレイヤー名で検索';
        searchInput.setAttribute('aria-label', 'プレイヤー名で検索'');

        const searchButton = document.createElement('button'');''
        searchButton.type = 'button';
        searchButton.className = 'search-button';
        searchButton.setAttribute('aria-label', '検索実行'');''
        searchButton.innerHTML = '🔍';
        
        searchGroup.appendChild(searchLabel);

        searchGroup.appendChild(searchInput);''
        searchGroup.appendChild(searchButton);
        ';
        // 更新ボタン
        const refreshButton = document.createElement('button'');''
        refreshButton.type = 'button';
        refreshButton.className = 'refresh-button';
        refreshButton.setAttribute('aria-label', 'リーダーボードを更新'');''
        refreshButton.innerHTML = '🔄 更新';
        
        controls.appendChild(filterGroup);
        controls.appendChild(searchGroup);
        controls.appendChild(refreshButton);
        
        return controls;
    }
    
    /**
     * ページネーションの作成'
     */''
    createPagination()';
        const pagination = document.createElement('nav'');''
        pagination.className = 'leaderboard-pagination';
        pagination.setAttribute('role', 'navigation'');''
        pagination.setAttribute('aria-label', 'リーダーボードページネーション'');

        const prevButton = document.createElement('button'');''
        prevButton.className = 'pagination-button prev-button';
        prevButton.setAttribute('aria-label', '前のページ'');''
        prevButton.innerHTML = '← 前へ';
        prevButton.disabled = true;

        const pageInfo = document.createElement('span'');''
        pageInfo.className = 'page-info';
        pageInfo.setAttribute('aria-live', 'polite'');''
        pageInfo.textContent = 'ページ 1 / 1';

        const nextButton = document.createElement('button'');''
        nextButton.className = 'pagination-button next-button';
        nextButton.setAttribute('aria-label', '次のページ'');''
        nextButton.innerHTML = '次へ →';
        nextButton.disabled = true;
        
        pagination.appendChild(prevButton);
        pagination.appendChild(pageInfo);
        pagination.appendChild(nextButton);
        
        return pagination;
    }
    
    /**
     * ローディングインジケーターの作成'
     */''
    createLoadingIndicator()';
        const indicator = document.createElement('div'');''
        indicator.className = 'loading-indicator';
        indicator.style.display = 'none';
        indicator.setAttribute('aria-hidden', 'true'');

        const spinner = document.createElement('div'');''
        spinner.className = 'loading-spinner';
        spinner.setAttribute('role', 'progressbar'');''
        spinner.setAttribute('aria-label', '読み込み中'');

        const message = document.createElement('div'');''
        message.className = 'loading-message';
        message.textContent = 'リーダーボードを読み込み中...';
        
        indicator.appendChild(spinner);
        indicator.appendChild(message);
        
        return indicator;
    }
    
    /**
     * スタイルの適用'
     */''
    applyStyles()';
        const style = document.createElement('style);
        style.textContent = this.generateCSS();
        document.head.appendChild(style);
    }
    
    /**
     * CSSの生成
     */
    generateCSS() {
        return `;
            .social-leaderboard-ui {
                background: #ffffff;
                border-radius: 8px,
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                padding: 24px,
    margin: 16px 0;
    ,}
                font-family: system-ui, -apple-system, sans-serif; }
            }
            
            .leaderboard-header { text-align: center,
                margin-bottom: 24px, }
            
            .leaderboard-title { font-size: 24px,
                font-weight: 600,
                color: #333,
    margin: 0 0 8px 0 ,}
            
            .leaderboard-subtitle { font-size: 14px;
                color: #666,
    margin: 0 }
            
            .leaderboard-controls { display: flex,
    gap: 16px;
                margin-bottom: 24px,
                flex-wrap: wrap,
                align-items: center, }
            
            .control-group { display: flex,
                align-items: center,
                gap: 8px ,}
            
            .control-group label { font-size: 14px;
                font-weight: 500,
                color: #555 ,}
            
            .leaderboard-filter;
            .leaderboard-search { padding: 8px 12px,
                border: 1px solid #ddd;
                border-radius: 4px,
                font-size: 14px, }
            
            .leaderboard-filter:focus,
            .leaderboard-search:focus { outline: 3px solid #007AFF,
                outline-offset: 2px, }
            
            .search-button,
            .refresh-button { padding: 8px 16px,
                background: #007AFF;
                color: white,
    border: none;
                border-radius: 4px,
                font-size: 14px,
                cursor: pointer,
    transition: background-color 0.2s ,}
            
            .search-button:hover;
            .refresh-button:hover { background: #0056b3 }
            
            .search-button:focus,
            .refresh-button:focus { outline: 3px solid #007AFF,
                outline-offset: 2px, }
            
            .leaderboard-content { min-height: 200px, }
            
            .leaderboard-entry { display: flex,
                align-items: center,
                padding: 12px 16px,
    border: 1px solid #eee;
                border-radius: 6px,
                margin-bottom: 8px,
                background: #fafafa;
                transition: all 0.2s ease;
                cursor: pointer,
    position: relative ,}
            
            .leaderboard-entry:hover { background: #f0f8ff;
                border-color: #007AFF, }
            
            .leaderboard-entry:focus { outline: 3px solid #007AFF,
                outline-offset: 2px,
                background: #f0f8ff ,}
            
            .leaderboard-entry.current-player { background: #fff3cd;
                border-color: #ffc107, }
            
            .entry-rank { font-size: 18px,
                font-weight: bold,
                color: #333;
                min-width: 40px,
                text-align: center, }
            
            .entry-rank.top-3 { color: #ffd700 }
            
            .entry-name { flex: 1,
                font-size: 16px,
                font-weight: 500,
                color: #333,
    margin: 0 16px ,}
            
            .entry-score { font-size: 16px;
                font-weight: 600,
                color: #007AFF ,}
            
            .entry-metadata { font-size: 12px,
    color: #666;
                margin-top: 4px, }
            
            .leaderboard-pagination { display: flex,
                justify-content: center,
                align-items: center,
                gap: 16px;
                margin-top: 24px, }
            
            .pagination-button { padding: 8px 16px,
                background: #f8f9fa,
    border: 1px solid #ddd;
                border-radius: 4px,
                font-size: 14px,
                cursor: pointer,
    transition: background-color 0.2s ,}
            
            .pagination-button:hover:not(:disabled) { background: #e9ecef }
            
            .pagination-button:focus { outline: 3px solid #007AFF;
                outline-offset: 2px, }
            
            .pagination-button:disabled { opacity: 0.5,
                cursor: not-allowed ,}
            
            .page-info { font-size: 14px,
    color: #666 }
            
            .loading-indicator { text-align: center,
    padding: 40px }
            
            .loading-spinner { width: 40px;
                height: 40px,
    border: 4px solid #f3f3f3;
                border-top: 4px solid #007AFF,
                border-radius: 50%,
                animation: spin 1s linear infinite,
    margin: 0 auto 16px ,}
            
            @keyframes spin {
                0% { transform: rotate(0deg), }
                100% { transform: rotate(360deg }
            
            .loading-message { font-size: 16px,
                color: #666 ,}
            
            .sr-only { position: absolute !important;
                left: -10000px !important;
                width: 1px !important;
                height: 1px !important;
                overflow: hidden !important,
    clip: rect(1px, 1px, 1px, 1px) !important,
                clip-path: inset(50%) !important, }
            
            /* 高コントラストモード */
            .high-contrast-mode .social-leaderboard-ui { background: #000000 !important,
                color: #ffffff !important,
    border: 2px solid #ffffff !important ,}
            
            .high-contrast-mode .leaderboard-entry { background: #333333 !important;
                border-color: #ffffff !important,
                color: #ffffff !important ,}
            
            .high-contrast-mode .leaderboard-entry:hover;
            .high-contrast-mode .leaderboard-entry:focus { background: #555555 !important }
            
            /* 動きの軽減モード */
            .reduced-motion-mode * { animation-duration: 0.01ms !important,
                animation-iteration-count: 1 !important,
                transition-duration: 0.01ms !important, }
            ';

            /* レスポンシブ対応 */''
            @media(max-width: 768px) { .social-leaderboard-ui {
                    padding: 16px,
    margin: 8px 0 }
                
                .leaderboard-controls { flex-direction: column;
                    align-items: stretch,
                    gap: 12px ,}
                
                .control-group { flex-direction: column;
                    align-items: stretch,
                    gap: 4px ,}
                
                .leaderboard-entry { flex-direction: column;
                    align-items: stretch,
                    text-align: center,
                    gap: 8px ,}
                
                .entry-rank { min-width: auto, }
                
                .leaderboard-pagination { flex-direction: column,
                    gap: 12px ,}
            }
            ';

            /* RTL言語サポート */''
            [dir="rtl"] .leaderboard-entry { direction: rtl }"

            [dir = "rtl"] .entry-rank { text-align: center }
        `;
    }
    
    /**
     * イベントリスナーの設定"
     */""
    setupEventListeners() {"
        // キーボードナビゲーション""
        this.elements.container.addEventListener('keydown', this.handlers.keydown';
        ';
        // フォーカス管理
        this.elements.container.addEventListener('focusin', this.handlers.focus';
        ';
        // フィルター変更
        const filterSelect = this.elements.controls.querySelector('.leaderboard-filter';''
        if(filterSelect) {'
    }

            filterSelect.addEventListener('change', this.handlers.filterChange'; }
        }
        ';
        // 検索
        const searchInput = this.elements.controls.querySelector('.leaderboard-search'');''
        const searchButton = this.elements.controls.querySelector('.search-button';''
        if(searchInput) {'

            searchInput.addEventListener('input', this.handlers.searchInput';''
            searchInput.addEventListener('keydown', (event) => { '
        }

                if(event.key === 'Enter' { }'
                    this.executeSearch(); }
});

        }''
        if(searchButton) {', ';

        }

            searchButton.addEventListener('click', this.executeSearch.bind(this)); }
        }
        ';
        // 更新ボタン
        const refreshButton = this.elements.controls.querySelector('.refresh-button';''
        if(refreshButton) {', ';

        }

            refreshButton.addEventListener('click', this.refresh.bind(this); }
        }
        ';
        // ページネーション
        if(this.elements.pagination) {'

            const prevButton = this.elements.pagination.querySelector('.prev-button'');''
            const nextButton = this.elements.pagination.querySelector('.next-button);

            if(prevButton) {'
        }

                prevButton.addEventListener('click', () => this.goToPage(this.state.currentPage - 1); }

            }''
            if(nextButton) {', ';

            }

                nextButton.addEventListener('click', () => this.goToPage(this.state.currentPage + 1)); }
}
        ';
        // ウィンドウリサイズ
        window.addEventListener('resize', this.handlers.resize';
    }
    
    /**
     * アクセシビリティの設定'
     */''
    setupAccessibility()';
        this.elements.container.setAttribute('tabindex', '0);
        
        // ARIA属性の設定
        this.updateAriaAttributes();
        
        // スクリーンリーダー用の説明
        if (this.config.accessibility.screenReaderDescriptions) { this.addScreenReaderDescriptions(); }
    }
    
    /**
     * ARIA属性の更新
     */''
    updateAriaAttributes()';
        this.elements.content.setAttribute('aria-label', `${ entriesCount)件のリーダーボードエントリー`';
        ';
        // エントリーにARIA属性を設定
        this.elements.entries.forEach((entry, index) => { ''
            entry.setAttribute('role', 'button''};''
            entry.setAttribute('tabindex', '0''};' }

            entry.setAttribute('aria-posinset', (index + 1).toString());' }

            entry.setAttribute('aria-setsize', entriesCount.toString()});
        });
    }
    
    /**
     * スクリーンリーダー用説明の追加'
     */''
    addScreenReaderDescriptions()';
        const description = document.createElement('div'');''
        description.id = 'leaderboard-description';
        description.className = 'sr-only';
        description.textContent = `;
            リーダーボードでは上位プレイヤーのスコアを確認できます。;
            矢印キーでエントリー間を移動し、Enterキーで詳細を表示できます。;
            フィルターと検索機能を使用してランキングを絞り込むことができます。;
        `;

        this.elements.container.appendChild(description);''
        this.elements.container.setAttribute('aria-describedby', 'leaderboard-description);
    }
    
    /**
     * 初期データの読み込み
     */
    async loadInitialData() { try {
            this.showLoading(true);
            await this.loadLeaderboardData();

            this.render();' }'

        } catch (error) {
            this.handleError('INITIAL_DATA_LOAD_FAILED', error); } finally { this.showLoading(false); }
    }
    
    /**
     * リーダーボードデータの読み込み
     */
    async loadLeaderboardData() {
        const cacheKey = `${this.state.currentLeaderboard}_${this.state.filterPeriod}_${this.state.searchQuery}`;
        
        // キャッシュチェック
        if (this.cache.has(cacheKey) && Date.now() - this.lastUpdate < 60000) { return this.cache.get(cacheKey); }
        
        try { let data;
            
            if(this.leaderboardManager) {
            
                data = await this.leaderboardManager.getRanking(;
                    this.state.filterPeriod);
                    this.state.currentLeaderboard);
                    {
                        limit: this.config.maxEntries,);
                        search: this.state.searchQuery ,}
                ), }
            } else {  // フォールバックデータ; }
                data = this.generateMockData(); }
            }
            
            // キャッシュに保存
            this.cache.set(cacheKey, data);
            this.lastUpdate = Date.now();
            
            return data;

        } catch (error) {
            this.handleError('LEADERBOARD_DATA_LOAD_FAILED', error);
            return this.generateMockData();
    
    /**
     * モックデータの生成'
     */''
    generateMockData(''';
        const names = ['プレイヤー1', 'プレイヤー2', 'プレイヤー3', 'プレイヤー4', 'プレイヤー5];
        );
        for (let i = 0; i < Math.min(this.config.maxEntries, 5); i++) { mockEntries.push({)
                rank: i + 1),
    playerName: names[i] || `プレイヤー${i + 1)`;
                score: (1000 - i * 100) + Math.floor(Math.random(,} * 100}, }
                timestamp: Date.now() - (i * 3600000});
                isCurrentPlayer: i === 2 // 3位を現在のプレイヤーとする;
            }),
        }
        
        return { entries: mockEntries,
            total: mockEntries.length, };
            hasMore: false 
    }
    
    /**
     * リーダーボードのレンダリング
     */
    async render() { try {
            this.stats.renders++;
            
            const data = await this.loadLeaderboardData();
            this.renderEntries(data.entries);
            this.updatePagination(data);
            this.updateAriaAttributes();
            
            // アクセシビリティアナウンス
            if (this.config.accessibility.announcements && this.elements.announcer) {' }'

                this.announce(`リーダーボードが更新されました。${data.entries.length}件のエントリーが表示されています。`'}';
            }

            this.log('リーダーボードレンダリング完了', { entriesCount: data.entries.length ',

            ' }'

        } catch (error) {
            this.handleError('LEADERBOARD_RENDER_FAILED', error'; }
    }
    
    /**
     * エントリーのレンダリング'
     */''
    renderEntries(entries) {'
        // 既存のエントリーをクリア
        this.elements.content.innerHTML = '';
        this.elements.entries = [];
        
        if (entries.length === 0) {
            this.renderEmptyState();
    }
            return; }
        }
        
        entries.forEach((entry, index) => {  const entryElement = this.createEntryElement(entry, index);
            this.elements.entries.push(entryElement); }
            this.elements.content.appendChild(entryElement); }
        });
    }
    
    /**
     * エントリー要素の作成'
     */''
    createEntryElement(entry, index) {'

        const element = document.createElement('div'');''
        element.className = 'leaderboard-entry';
        element.setAttribute('data-entry-id', entry.id || index';''
        element.setAttribute('role', 'button'');''
        element.setAttribute('tabindex', '0);

        if(entry.isCurrentPlayer) {'
    }

            element.classList.add('current-player''); }
        }
        ';
        // ランク
        const rank = document.createElement('div'');''
        rank.className = 'entry-rank';
        if(entry.rank <= 3) {', ';

        }

            rank.classList.add('top-3''); }
        }
        rank.textContent = entry.rank;
        ';
        // 名前
        const name = document.createElement('div'');''
        name.className = 'entry-name';
        name.textContent = entry.playerName;
        ';
        // スコア
        const score = document.createElement('div'');''
        score.className = 'entry-score';
        score.textContent = entry.score.toLocaleString()';
        const metadata = document.createElement('div'');''
        metadata.className = 'entry-metadata';
        metadata.textContent = this.formatTimestamp(entry.timestamp);
        
        element.appendChild(rank);
        element.appendChild(name);

        element.appendChild(score);''
        element.appendChild(metadata);
        ';
        // ARIA属性
        element.setAttribute('aria-label''';
            `${entry.rank}位: ${entry.playerName}, スコア: ${entry.score.toLocaleString(})点`');
        ';
        // イベントリスナー
        element.addEventListener('click', () => this.selectEntry(entry, element));''
        element.addEventListener('keydown', (event) => {  ''
            if(event.key === 'Enter' || event.key === ', ') {
                
            }
                event.preventDefault(); }
                this.selectEntry(entry, element); }
});
        
        return element;
    }
    
    /**'
     * 空の状態のレンダリング'
     */''
    renderEmptyState()';
        const emptyState = document.createElement('div'');''
        emptyState.className = 'empty-state';
        emptyState.style.cssText = `;
            text-align: center,
            padding: 40px,
    color: #666;
        `;
        ';

        emptyState.innerHTML = `'';
            <div style="font-size: 48px; margin-bottom: 16px;">📊</div>""
            <div style="font-size: 18px; margin-bottom: 8px;">データがありません</div>""
            <div style="font-size: 14px;">条件を変更してお試しください</div>
        `;
        
        this.elements.content.appendChild(emptyState);
    }
    
    /**
     * ページネーションの更新
     */
    updatePagination(data) {
        if (!this.elements.pagination) return;"

        const totalPages = Math.ceil(data.total / this.config.itemsPerPage);""
        const prevButton = this.elements.pagination.querySelector('.prev-button'');''
        const nextButton = this.elements.pagination.querySelector('.next-button'');''
        const pageInfo = this.elements.pagination.querySelector('.page-info';
        
        prevButton.disabled = this.state.currentPage <= 1;
    }
        nextButton.disabled = this.state.currentPage >= totalPages; }
        pageInfo.textContent = `ページ ${this.state.currentPage} / ${totalPages}`;
    }
    
    /**
     * エントリーの選択'
     */''
    selectEntry(entry, element) {
        this.stats.interactions++;
        ';
        // 既存の選択をクリア
        this.elements.entries.forEach(el => el.classList.remove('selected)';
        ';
        // 新しい選択を設定
        element.classList.add('selected);
        this.state.selectedEntry = entry;
        
        // アクセシビリティアナウンス
    }
        if (this.config.accessibility.announcements && this.elements.announcer) {' }'

            this.announce(`${entry.playerName}のエントリーが選択されました。${entry.rank}位、${entry.score.toLocaleString(})点。`');
        }
        ';
        // イベントの発火
        this.dispatchEvent('entrySelected', { entry, element )';

        this.log('エントリー選択', entry); }
    
    /**
     * タイムスタンプのフォーマット
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        ';

    }

        if(diffMins < 1) return 'たった今'; }
        if (diffMins < 60) return `${diffMins}分前`;
        if (diffHours < 24) return `${diffHours}時間前`;
        if (diffDays < 7) return `${diffDays}日前`;
        
        return date.toLocaleDateString();
    }
    
    /**
     * キーボードイベントハンドラー
     */
    handleKeydown(event) {
        this.stats.keyboardNavigations++;

        switch(event.key) {''
            case 'ArrowDown':';
                event.preventDefault();''
                this.focusNext()';
            case 'ArrowUp':'';
                event.preventDefault();''
                this.focusPrevious()';
            case 'Home':'';
                event.preventDefault();''
                this.focusFirst()';
            case 'End':'';
                event.preventDefault();''
                this.focusLast(''';
            case 'Enter':'';
            case ', ':')';
                if(event.target.classList.contains('leaderboard-entry' {'
                    event.preventDefault();
    }
                    event.target.click(); }
                }
                break;
        }
    }
    
    /**
     * 次の要素にフォーカス
     */
    focusNext() {
        const current = document.activeElement;
        const entries = this.elements.entries;
        const currentIndex = entries.indexOf(current);
        
        if (currentIndex >= 0 && currentIndex < entries.length - 1) {
    }
            entries[currentIndex + 1].focus(); }
        } else if (entries.length > 0) { entries[0].focus(); }
    }
    
    /**
     * 前の要素にフォーカス
     */
    focusPrevious() {
        const current = document.activeElement;
        const entries = this.elements.entries;
        const currentIndex = entries.indexOf(current);
        
        if (currentIndex > 0) {
    }
            entries[currentIndex - 1].focus(); }
        } else if (entries.length > 0) { entries[entries.length - 1].focus(); }
    }
    
    /**
     * 最初の要素にフォーカス
     */
    focusFirst() {
        if (this.elements.entries.length > 0) {
    }
            this.elements.entries[0].focus(); }
}
    
    /**
     * 最後の要素にフォーカス
     */
    focusLast() {
        if (this.elements.entries.length > 0) {
    }
            this.elements.entries[this.elements.entries.length - 1].focus(); }
}
    
    /**
     * フォーカスハンドラー
     */
    handleFocus(event) { this.state.focusedElement = event.target; }
    
    /**
     * フィルター変更ハンドラー
     */
    handleFilterChange(event) {
        this.state.filterPeriod = event.target.value;
        this.state.currentPage = 1;
        this.refresh();
        
        // アクセシビリティアナウンス
    }
        if (this.config.accessibility.announcements && this.elements.announcer) { }
            this.announce(`フィルターが${event.target.selectedOptions[0].textContent}に変更されました。`});
        }
    }
    
    /**
     * 検索入力ハンドラー
     */
    handleSearchInput(event) {
        this.state.searchQuery = event.target.value;
        
        // デバウンス処理
        clearTimeout(this.searchTimeout);
    }
        this.searchTimeout = setTimeout(() => {  }
            this.executeSearch(); }
        }, 500);
    }
    
    /**
     * 検索実行
     */
    async executeSearch() { this.stats.searches++;
        this.state.currentPage = 1;
        await this.refresh();
        
        // アクセシビリティアナウンス
        if(this.config.accessibility.announcements && this.elements.announcer) {
            const query = this.state.searchQuery.trim();

        }

            if(query) {' }'

                this.announce(`"${query"}"で検索しました。`"}";"
            } else { }"
                this.announce('検索をクリアしました。'; }'
}
    }
    
    /**
     * ページ移動
     */
    async goToPage(page) { if (page < 1) return;
        
        this.state.currentPage = page;
        await this.refresh();
        
        // アクセシビリティアナウンス
        if (this.config.accessibility.announcements && this.elements.announcer) { }
            this.announce(`ページ${page}に移動しました。`});
        }
    }
    
    /**
     * リサイズハンドラー
     */
    handleResize() {
        // レスポンシブ調整のロジック
    }
        this.updateResponsiveLayout(); }
    }
    
    /**
     * レスポンシブレイアウトの更新
     */
    updateResponsiveLayout() {
        const isMobile = window.innerWidth < 768;

        if(isMobile) {'
    }

            this.elements.container.classList.add('mobile-layout''); }

        } else { }'

            this.elements.container.classList.remove('mobile-layout'; }'
}
    
    /**
     * ローディング状態の表示/非表示
     */
    showLoading(show) {
        this.state.loading = show;

        if(this.elements.loadingIndicator) {''
            this.elements.loadingIndicator.style.display = show ? 'block' : 'none';

    }

            this.elements.loadingIndicator.setAttribute('aria-hidden', show ? 'false' : 'true); 
    }

        if(this.elements.content) {', ';

        }

            this.elements.content.setAttribute('aria-busy', show ? 'true' : 'false); 
    }
    
    /**
     * リフレッシュ
     */
    async refresh() { try {
            this.showLoading(true);
            
            // キャッシュをクリア
            this.cache.clear();
            
            await this.render();
            ' }'

        } catch (error) {
            this.handleError('REFRESH_FAILED', error); } finally { this.showLoading(false); }
    }
    
    /**
     * アナウンス
     */
    announce(message) {'

        if(this.elements.announcer) {''
            this.elements.announcer.textContent = '';
    }
            setTimeout(() => {  }
                this.elements.announcer.textContent = message; }
            }, 100);
        }
    }
    
    /**
     * イベントのディスパッチ
     */
    dispatchEvent(type, data) {
        
    }
        const event = new CustomEvent(`leaderboard-${type}`, { detail: data)
           , bubbles: true });
        this.elements.container.dispatchEvent(event);
    }
    
    /**
     * 統計情報の取得
     */
    getStats() {
        
    }
        return { ...this.stats;
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig) {
        
    }

        this.config = { ...this.config, ...newConfig;''
        this.applyStyles()';
        this.log('設定更新', newConfig';
    }
    
    /**
     * クリーンアップ'
     */''
    destroy()';
        this.elements.container.removeEventListener('keydown', this.handlers.keydown';''
        window.removeEventListener('resize', this.handlers.resize);
        
        // タイマーのクリア
        if (this.searchTimeout) { clearTimeout(this.searchTimeout); }
        
        // DOM要素の削除
        if(this.elements.container && this.elements.container.parentNode) {
            ';

        }

            this.elements.container.parentNode.removeChild(this.elements.container); }
        }

        this.log('SocialLeaderboardUI破棄完了);
    }
    
    /**
     * エラーハンドリング
     */
    handleError(type, error, context = { ) { }
        console.error(`[SocialLeaderboardUI] ${type}:`, error, context});
    }
    
    /**
     * ログ記録
     */'
    log(message, data = null) { ' }'

        console.log(`[SocialLeaderboardUI] ${message}`, data || '''}';

    }''
}