/**
 * ChallengeUIRenderer
 * 
 * チャレンジUI 描画システム機能を担当
 * UI Rendering Controller Patternの一部として設計
 * 
 * **Features**:
 * - Dynamic DOM element creation and management
 * - Responsive layout and styling system
 * - Accessibility-compliant rendering
 * - Real-time progress visualization
 * 
 * @module ChallengeUIRenderer
 * Created: Phase G.4 (Issue #103)
 */

// 型定義
export interface ChallengeUIElements { container: HTMLElement;
    header: HTMLElement;
    filterControls: HTMLElement;
    sortControls: HTMLElement;
    challengeList: HTMLElement;
    challengeItems: HTMLElement[];
    progressSection: HTMLElement;
    footer: HTMLElement;
    loadingIndicator: HTMLElement;
    errorMessage: HTMLElement;
    announcer?: HTMLElement;
    refreshButton?: HTMLElement;
     }

export interface UIRenderConfig { styles: UIStyleConfig;
    accessibility: AccessibilityRenderConfig;
    layout: LayoutConfig;
    animation: AnimationConfig;
    responsive: ResponsiveConfig;

export interface UIStyleConfig { backgroundColor: string;
    textColor: string;
    accentColor: string;
    borderRadius: string;
    fontSize: string;
    fontFamily: string;
    theme: UITheme;
    customCSS?: string;

export interface AccessibilityRenderConfig { enabled: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    screenReaderOptimized: boolean;
    focusVisible: boolean;
    announcements: boolean;

export interface LayoutConfig { maxHeight: string;
    padding: string;
    margin: string;
    gridColumns: number;
    itemSpacing: string;
    compactMode: boolean;

export interface AnimationConfig { enabled: boolean;
    duration: string;
    easing: string;
    progressAnimations: boolean;
    loadingAnimations: boolean;

export interface ResponsiveConfig { breakpoints: ResponsiveBreakpoints;
    mobileFirst: boolean;
    adaptiveText: boolean;
    flexibleLayout: boolean;

export interface ResponsiveBreakpoints { mobile: number;
    tablet: number;
    desktop: number;
    widescreen: number;

export interface Challenge { id: string;
    title: string;
    description: string;
    type: ChallengeType;
    difficulty: ChallengeDifficulty;
    progress: number;
    target: number;
    reward: ChallengeReward;
    deadline: Date;
    priority: number;
    metadata?: ChallengeMetadata;

export interface ChallengeReward { ap?: number,
    title?: string;
    items?: RewardItem[];
    badges?: string[];
    currency?: CurrencyReward[];

export interface RewardItem { type: string;
    id: string;
    quantity: number;
    name?: string;

export interface CurrencyReward { type: CurrencyType;
    amount: number;

export interface ChallengeMetadata { category?: string,
    tags?: string[];
    featured?: boolean;
    newBadge?: boolean;
    rarity?: ChallengeRarity;

export interface ChallengeUIState { challenges: Challenge[];
    loading: boolean;
    error?: string;
    selectedChallenge?: Challenge;
    filterBy: string;
    sortBy: string;
    lastUpdated?: Date;

export interface ChallengeUIReference { config: UIRenderConfig;
    state: ChallengeUIState;
    elements: ChallengeUIElements;

export interface ProgressVisualization { bar: HTMLElement;
    fill: HTMLElement;
    text: HTMLElement;
    percentage: number;
    animated: boolean;

export interface DifficultyConfig { label: string;
    color: string;
    icon?: string;
    className: string;

export interface FilterOption { value: string;
    text: string;
    count?: number;
    disabled?: boolean;

export interface SortOption { value: string;
    text: string;
    order: SortOrder;
    icon?: string;

export interface ChallengeItemElements { container: HTMLElement;
    header: HTMLElement;
    title: HTMLElement;
    difficulty: HTMLElement;
    description: HTMLElement;
    progress: ProgressVisualization;
    footer: HTMLElement;
    deadline: HTMLElement;
    reward: HTMLElement;
    badges?: HTMLElement[];

export interface RenderOptions { skipAnimations?: boolean,
    forceRerender?: boolean;
    preserveScroll?: boolean;
    updateOnly?: string[];

export interface StyleInjection { id: string;
    css: string;
    element: HTMLStyleElement;
    scope: StyleScope;

export interface MediaQueryState { mobile: boolean;
    tablet: boolean;
    desktop: boolean;
    highDPI: boolean;
    prefersDarkMode: boolean;
    prefersReducedMotion: boolean;
    prefersHighContrast: boolean;

// 列挙型
export type ChallengeType = 'daily' | 'weekly' | 'special' | 'event';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type ChallengeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type UITheme = 'light' | 'dark' | 'auto' | 'contrast';
export type SortOrder = 'asc' | 'desc';
export type CurrencyType = 'coins' | 'gems' | 'tokens' | 'points';
export type StyleScope = 'global' | 'component' | 'element';

// 定数
export const DEFAULT_UI_STYLES: UIStyleConfig = {;
    backgroundColor: '#FFFFFF';
    textColor: '#333333';
    accentColor: '#4A90E2';
    borderRadius: '8px';
    fontSize: '14px';
    fontFamily: 'Arial, sans-serif',
    theme: 'auto'
            } as const;
export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityRenderConfig = { enabled: true;
    highContrast: false;
    reducedMotion: false;
    screenReaderOptimized: true;
    focusVisible: true;
    announcements: true, as const;
';'

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {;
    maxHeight: '600px';
    padding: '16px';
    margin: '8px';
    gridColumns: 1;
    itemSpacing: '8px';
    compactMode: false, as const;
export const DEFAULT_RESPONSIVE_BREAKPOINTS: ResponsiveBreakpoints = { mobile: 768;
    tablet: 1024;
    desktop: 1440;
    widescreen: 1920  } as const;
';'

export const DIFFICULTY_CONFIG: Record<ChallengeDifficulty, DifficultyConfig> = { easy: {''
        label: '簡単';
        color: '#4CAF50';
        icon: '🟢';
        className: 'challenge-difficulty-easy'
            };
    medium: { ''
        label: '普通';
        color: '#FF9800';
        icon: '🟡';
        className: 'challenge-difficulty-medium'
            };
    hard: { ''
        label: '難しい';
        color: '#F44336';
        icon: '🔴';
        className: 'challenge-difficulty-hard'
            }
} as const;
';'

export const FILTER_OPTIONS: FilterOption[] = [','
    { value: 'all', text: 'すべて'
            },''
    { value: 'daily', text: 'デイリー'
            },''
    { value: 'weekly', text: 'ウィークリー'
            },''
    { value: 'special', text: 'スペシャル'
            },''
    { value: 'event', text: 'イベント'
            },''
    { value: 'active', text: '進行中'
            },]'
    { value: 'completed', text: '完了済み'
            }]
] as const;
';'

export const SORT_OPTIONS: SortOption[] = [','
    { value: 'priority', text: '優先度順', order: 'asc', icon: '⭐'
            },''
    { value: 'difficulty', text: '難易度順', order: 'asc', icon: '📊'
            },''
    { value: 'progress', text: '進捗順', order: 'desc', icon: '📈'
            },''
    { value: 'deadline', text: '期限順', order: 'asc', icon: '⏰'
            },''
    { value: 'title', text: 'タイトル順', order: 'asc', icon: '🔤'
            },]'
    { value: 'type', text: 'タイプ順', order: 'asc', icon: '📂'
            }]
] as const;

export const ACCESSIBILITY_STYLES = `;
    /* フォーカススタイル */
    .challenge-ui-container button: focus;
    .challenge-ui-container select: focus;
    .challenge-item:focus { outline: 3px solid var(--accent-color, #4A90E2) !important,
        outline-offset: 2px !important;
        box-shadow: 0 0 0 3px var(--accent-color-alpha, rgba(74, 144, 226, 0.25) !important }
    
    /* スクリーンリーダー専用クラス */
    .sr-only { position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important,
        white-space: nowrap !important;
        border: 0 !important  }
    
    /* スキップリンク */
    .skip-link { position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: white;
    padding: 8px;
        text-decoration: none;
        z-index: 9999 }
    
    .skip-link:focus { top: 6px }
` as const;

export const COMPONENT_BASE_STYLES = `;
    .challenge-ui-container { --accent-color: #4A90E2;
        --accent-color-alpha: rgba(74, 144, 226, 0.25);
        --text-color: #333333;
        --background-color: #FFFFFF;
        --border-color: #E0E0E0;
        --success-color: #4CAF50;
        --warning-color: #FF9800;
        --error-color: #F44336;
        
        display: flex;
        flex-direction: column;
        background-color: var(--background-color;
        color: var(--text-color;
    border: 1px solid var(--border-color);
        border-radius: 8px;
        overflow: hidden;
        font-family: Arial, sans-serif }
    
    .challenge-ui-header { display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid var(--border-color;
        background-color: var(--background-color) }
    
    .challenge-ui-title { margin: 0;
        font-size: 1.25rem;
        font-weight: bold;
        color: var(--text-color  }
    
    .challenge-ui-refresh { background: none;
    border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 8px 12px;
    cursor: pointer;
        font-size: 16px;
        transition: background-color 0.2s  }
    
    .challenge-ui-refresh:hover { background-color: var(--accent-color-alpha) }
    
    .challenge-item { border: 1px solid var(--border-color;
        border-radius: 6px;
        padding: 12px;
        margin: 8px;
        cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s }
    
    .challenge-item: hover { transform: translateY(-2px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1 }
    
    .challenge-item-completed { opacity: 0.75;
        background-color: var(--success-color-alpha, rgba(76, 175, 80, 0.1);
        border-color: var(--success-color) }
    
    .challenge-item-progress-bar { width: 100%;
        height: 8px;
        background-color: var(--border-color;
        border-radius: 4px;
        overflow: hidden;
    margin: 8px 0  }
    
    .challenge-item-progress-fill { height: 100% }
        background-color: var(--accent-color}
        transition: width 0.3s ease;
    );
` as const,

// ユーティリティ関数
export function formatDeadlineTime(deadline: Date): string { const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff < 0) { }

        return '期限切れ'; else if (diff < 60 * 60 * 1000) { const minutes = Math.floor(diff / (60 * 1000) }
        return `あと${minutes}分`;
    } else if (diff < 24 * 60 * 60 * 1000) { const hours = Math.floor(diff / (60 * 60 * 1000) }
        return `あと${hours}時間`;
    } else { const days = Math.floor(diff / (24 * 60 * 60 * 1000) }
        return `あと${days}日`;

export function formatRewardText(reward: ChallengeReward): string { const parts: string[] = [];
    
    if (reward.ap) { }
        parts.push(`${reward.ap} AP`);
    }
    if (reward.title) {
    
}
        parts.push(`称号「${reward.title}」`);
    }
    if (reward.items && reward.items.length > 0) { const itemTexts = reward.items.map(item => ) }
            `${item.name || item.id}×${ item.quantity}`
        }
        parts.push(...itemTexts);

    }''
    if (reward.badges && reward.badges.length > 0) { }'

        parts.push(`バッジ: ${reward.badges.join(', '}`);
    }
    if (reward.currency && reward.currency.length > 0) { const currencyTexts = reward.currency.map(curr => ) }

            `${curr.amount} ${ curr.type}`};' }'

        parts.push(...currencyTexts);
    }

    return parts.length > 0 ? parts.join(', ') : '報酬なし';
}

export function calculateProgressPercentage(progress: number, target: number): number { return Math.min(Math.round((progress / target) * 100), 100) }

export function getDifficultyInfo(difficulty: ChallengeDifficulty): DifficultyConfig { return DIFFICULTY_CONFIG[difficulty] || {'
        label: difficulty,
        color: '#666666',
        className: 'challenge-difficulty-unknown'
            }

export function createAccessibleId(prefix: string, suffix?: string): string {
    const id = `${prefix}-${Date.now())-${Math.random().toString(36).substr(2, 9}`;
    return suffix ? `${id}-${suffix}` : id;
}

export function detectMediaQueryState()';'
        mobile: window.matchMedia('(max-width: 768px)').matches,
        tablet: window.matchMedia('(min-width: 769px) and(max-width: 1024px)').matches,
        desktop: window.matchMedia('(min-width: 1025px)').matches,
        highDPI: window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi')').matches,'
        prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefersHighContrast: window.matchMedia('(prefers-contrast: high)).matches;'
    } }

export class ChallengeUIRenderer {
    private challengeUI: ChallengeUIReference;
    private config: UIRenderConfig;
    private state: ChallengeUIState;
    private elements: ChallengeUIElements;
    private, injectedStyles: Map<string, StyleInjection>,
    private mediaQueryState: MediaQueryState;
    constructor(challengeUI: ChallengeUIReference) {

        this.challengeUI = challengeUI;
        this.config = challengeUI.config;
        this.state = challengeUI.state;
        this.elements = challengeUI.elements;
        
        this.injectedStyles = new Map();
        this.mediaQueryState = detectMediaQueryState();
        ','
        // メディアクエリの変更監視
        this.setupMediaQueryListeners()
}

        console.log('[ChallengeUIRenderer] Component, initialized'); }'
    }
    
    /**
     * メディアクエリリスナーの設定'
     */''
    private setupMediaQueryListeners()';'
            { query: '(max-width: 768px')', property: 'mobile'
            },''
            { query: '(prefers-reduced-motion: reduce')', property: 'prefersReducedMotion'
            },''
            { query: '(prefers-color-scheme: dark')', property: 'prefersDarkMode'
            },''
            { query: '(prefers-contrast: high')', property: 'prefersHighContrast'
            }
        ];
';'

        mediaQueries.forEach(({ query, property ) => { ''
            const mediaQuery = window.matchMedia(query);
            mediaQuery.addEventListener('change', (e) => {
                (this.mediaQueryState, as any)[property] = e.matches }
                this.applyResponsiveStyles(); }
            };
        };
    }
    
    /**
     * DOM要素の作成
     */
    createElements(): void { try {
            // メインコンテナ
            this.elements.container = this.createContainer();
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
    
}
                this.elements.announcer = this.createAnnouncer(); }
            }
            
            // 要素の組み立て
            this.assembleElements();

        } catch (error) {
            console.error('[ChallengeUIRenderer] Failed to create elements:', error','
            throw error }
    }
    
    /**
     * メインコンテナの作成'
     */''
    private createContainer()';'
        const container = document.createElement('div');
        container.className = 'challenge-ui-container';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'チャレンジ一覧');
        container.id = createAccessibleId('challenge-ui', 'main';
        
        return container;
    }
    
    /**
     * ヘッダーの作成'
     */''
    createHeader()';'
        const header = document.createElement('div');
        header.className = 'challenge-ui-header';
        ';'
        // タイトル
        const title = document.createElement('h2');
        title.className = 'challenge-ui-title';
        title.textContent = 'チャレンジ';
        title.id = createAccessibleId('challenge-ui', 'title');
        ';'
        // 更新ボタン
        const refreshButton = document.createElement('button');
        refreshButton.className = 'challenge-ui-refresh';
        refreshButton.innerHTML = '🔄';
        refreshButton.setAttribute('aria-label', 'チャレンジを更新');
        refreshButton.setAttribute('type', 'button');
        refreshButton.title = 'チャレンジを更新';
        refreshButton.id = createAccessibleId('challenge-ui', 'refresh);'
        
        this.elements.refreshButton = refreshButton;
        
        header.appendChild(title);
        header.appendChild(refreshButton);
        
        return header;
    }
    
    /**
     * フィルターコントロールの作成'
     */''
    createFilterControls()';'
        const container = document.createElement('div');
        container.className = 'challenge-ui-filters';
        container.setAttribute('role', 'group');
        container.setAttribute('aria-label', 'チャレンジフィルター');

        const labelId = createAccessibleId('challenge-filter', 'label');
        const selectId = createAccessibleId('challenge-filter', 'select');

        const label = document.createElement('label');
        label.className = 'challenge-ui-filter-label';
        label.textContent = 'フィルター:';
        label.setAttribute('for', selectId';'
        label.id = labelId;

        const select = document.createElement('select');

        select.id = selectId;
        select.className = 'challenge-ui-filter-select';
        select.setAttribute('aria-label', 'チャレンジの種類でフィルター');
        select.setAttribute('aria-describedby', labelId';'

        FILTER_OPTIONS.forEach(option => {  '),'
            const optionElement = document.createElement('option),'
            optionElement.value = option.value,
            optionElement.textContent = option.text,
            if (option.disabled) { }
                optionElement.disabled = true; }
            }
            select.appendChild(optionElement);
        };
        
        container.appendChild(label);
        container.appendChild(select);
        
        return container;
    }
    
    /**
     * ソートコントロールの作成'
     */''
    createSortControls()';'
        const container = document.createElement('div');
        container.className = 'challenge-ui-sorts';
        container.setAttribute('role', 'group');
        container.setAttribute('aria-label', 'チャレンジソート');

        const labelId = createAccessibleId('challenge-sort', 'label');
        const selectId = createAccessibleId('challenge-sort', 'select');

        const label = document.createElement('label');
        label.className = 'challenge-ui-sort-label';
        label.textContent = '並び順:';
        label.setAttribute('for', selectId';'
        label.id = labelId;

        const select = document.createElement('select');

        select.id = selectId;
        select.className = 'challenge-ui-sort-select';
        select.setAttribute('aria-label', 'チャレンジの並び順');
        select.setAttribute('aria-describedby', labelId';'

        SORT_OPTIONS.forEach(option => {  '),'
            const optionElement = document.createElement('option' }'
            optionElement.value = option.value; }
            optionElement.textContent = option.icon ? `${option.icon} ${option.text}` : option.text;
            select.appendChild(optionElement);
        };
        
        container.appendChild(label);
        container.appendChild(select);
        
        return container;
    }
    
    /**
     * チャレンジリストの作成'
     */''
    createChallengeList()';'
        const list = document.createElement('div');
        list.className = 'challenge-ui-list';
        list.setAttribute('role', 'list');
        list.setAttribute('aria-label', 'チャレンジアイテム');
        list.id = createAccessibleId('challenge-list', 'container';
        
        return list;
    }
    
    /**
     * 進捗セクションの作成'
     */''
    createProgressSection()';'
        const section = document.createElement('div');
        section.className = 'challenge-ui-progress';
        section.setAttribute('role', 'region');
        section.setAttribute('aria-label', '全体進捗');

        const titleId = createAccessibleId('challenge-progress', 'title');

        const title = document.createElement('h3');
        title.className = 'challenge-ui-progress-title';
        title.textContent = '全体進捗';
        title.id = titleId;

        const progressContainer = document.createElement('div');
        progressContainer.className = 'challenge-ui-progress-container';
        progressContainer.setAttribute('aria-labelledby', titleId);
        
        section.appendChild(title);
        section.appendChild(progressContainer);
        
        return section;
    }
    
    /**
     * フッターの作成'
     */''
    createFooter()';'
        const footer = document.createElement('div');
        footer.className = 'challenge-ui-footer';
        footer.setAttribute('role', 'contentinfo');

        const info = document.createElement('div');
        info.className = 'challenge-ui-info';
        info.textContent = '最終更新: 未取得';
        info.setAttribute('aria-live', 'polite);'
        
        footer.appendChild(info);
        
        return footer;
    }
    
    /**
     * ローディングインジケーターの作成'
     */''
    createLoadingIndicator()';'
        const loader = document.createElement('div');
        loader.className = 'challenge-ui-loading';
        loader.style.display = 'none';
        loader.setAttribute('role', 'status');
        loader.setAttribute('aria-label', 'チャレンジを読み込み中');

        const spinner = document.createElement('div');
        spinner.className = 'challenge-ui-spinner';
        spinner.setAttribute('aria-hidden', 'true');

        const text = document.createElement('span');
        text.className = 'challenge-ui-loading-text';
        text.textContent = '読み込み中...';
        
        loader.appendChild(spinner);
        loader.appendChild(text);
        
        return loader;
    }
    
    /**
     * エラーメッセージの作成'
     */''
    createErrorMessage()';'
        const error = document.createElement('div');
        error.className = 'challenge-ui-error';
        error.style.display = 'none';
        error.setAttribute('role', 'alert');
        error.setAttribute('aria-live', 'assertive';
        
        return error;
    }
    
    /**
     * アナウンサーの作成'
     */''
    createAnnouncer()';'
        const announcer = document.createElement('div');
        announcer.className = 'challenge-ui-announcer sr-only';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true);'
        
        return announcer;
    }
    
    /**
     * 要素の組み立て
     */
    private assembleElements(): void { const { container, header, filterControls, sortControls, loadingIndicator }
                errorMessage, challengeList, progressSection, footer, announcer } = this.elements;
        
        container.appendChild(header);
        container.appendChild(filterControls);
        container.appendChild(sortControls);
        container.appendChild(loadingIndicator);
        container.appendChild(errorMessage);
        container.appendChild(challengeList);
        container.appendChild(progressSection);
        container.appendChild(footer);
        
        if (announcer) { container.appendChild(announcer) }
    }
    
    /**
     * チャレンジのレンダリング
     */
    renderChallenges(options: RenderOptions = { ): void {
        try {
            const list = this.elements.challengeList,

            if (!options.updateOnly || options.forceRerender) {

                list.innerHTML = ' }'
                this.elements.challengeItems = []; }
            }
            
            this.state.challenges.forEach((challenge, index) => {  const item = this.createChallengeItem(challenge, index);
                this.elements.challengeItems.push(item) }
                list.appendChild(item); }
            };
            
            // リストが空の場合のメッセージ
            if (this.state.challenges.length === 0) { this.renderEmptyState(),' }'

            } catch (error) {
            console.error('[ChallengeUIRenderer] Failed to render challenges:', error','
            this.showError('チャレンジの表示に失敗しました' }'
    }
    
    /**
     * チャレンジアイテムの作成'
     */''
    createChallengeItem(challenge: Challenge, index: number): HTMLElement { ''
        const item = document.createElement('div') }

        item.className = `challenge-item challenge-item-${challenge.difficulty}`;
        item.setAttribute('role', 'listitem');
        item.setAttribute('tabindex', '0');
        item.setAttribute('data-challenge-id', challenge.id';'
        item.setAttribute('data-index', index.toString();
        
        // 進捗計算
        const progressPercent = calculateProgressPercentage(challenge.progress, challenge.target);
        const isCompleted = challenge.progress >= challenge.target;
        const difficultyInfo = getDifficultyInfo(challenge.difficulty);
        const deadlineText = formatDeadlineTime(challenge.deadline);
        ';'
        // アクセシビリティ属性
        item.setAttribute('aria-label';
            `チャレンジ: ${challenge.title}. ${challenge.description}. ` +')'
            `進捗: ${progressPercent}パーセント. 難易度: ${difficultyInfo.label}. ` +')'
            `期限: ${deadlineText}. ${ isCompleted ? '完了済み' : '進行中')`
        };
        ';'
        // メタデータの処理
        if(challenge.metadata?.newBadge} {', ' }

            item.classList.add('challenge-item-new');' }'

            item.setAttribute('aria-label', item.getAttribute('aria-label') + '. 新着'};
        }

        if (challenge.metadata?.featured) {

            item.classList.add('challenge-item-featured') }

            item.setAttribute('aria-label', item.getAttribute('aria-label') + '. おすすめ'); }
        }
        
        // コンテンツの作成
        const elements = this.createChallengeItemElements(challenge, progressPercent, isCompleted);
        
        // 要素の組み立て
        item.appendChild(elements.header);
        item.appendChild(elements.description);
        item.appendChild(elements.progress.bar);
        item.appendChild(elements.footer);
        // バッジの追加
        if (elements.badges && elements.badges.length > 0) {

            const badgeContainer = document.createElement('div');
            badgeContainer.className = 'challenge-item-badges',
            elements.badges.forEach(badge => badgeContainer.appendChild(badge) }
            item.appendChild(badgeContainer); }
        }
        ';'
        // 完了済みの場合
        if (isCompleted) {', ' }

            item.classList.add('challenge-item-completed'; }'
        }
        
        return item;
    }
    
    /**
     * チャレンジアイテム要素の作成
     */
    private createChallengeItemElements( : undefined, challenge: Challenge
    );
        progressPercent: number,
    isCompleted: boolean';'
    ': ChallengeItemElements { ''
        const difficultyInfo = getDifficultyInfo(challenge.difficulty);
        // ヘッダー
        const header = document.createElement('div');
        header.className = 'challenge-item-header',

        const title = document.createElement('h4');
        title.className = 'challenge-item-title',
        title.textContent = challenge.title,

        const difficulty = document.createElement('span') }
        difficulty.className = `challenge-item-difficulty ${difficultyInfo.className}`;
        difficulty.textContent = difficultyInfo.icon ? undefined : undefined';'
            `${difficultyInfo.icon} ${difficultyInfo.label}` : difficultyInfo.label;
        difficulty.setAttribute('data-difficulty', challenge.difficulty';'
        difficulty.style.color = difficultyInfo.color;
        ';'

        header.appendChild(title);
        header.appendChild(difficulty);
        ';'
        // 説明
        const description = document.createElement('p');
        description.className = 'challenge-item-description';
        description.textContent = challenge.description;
        ';'
        // 進捗バー
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'challenge-item-progress';
        progressBarContainer.setAttribute('data-progress', progressPercent.toString());

        const progressBarId = createAccessibleId('challenge-progress', challenge.id';'

        const progressBar = document.createElement('div');
        progressBar.className = 'challenge-item-progress-bar';
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-valuenow', challenge.progress.toString());
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', challenge.target.toString());
        progressBar.setAttribute('aria-label', `進捗: ${challenge.progress}/${ challenge.target}`};
        progressBar.id = progressBarId;

        ' }'

        const progressFill = document.createElement('div'}';'
        progressFill.className = 'challenge-item-progress-fill';
        progressFill.style.width = `${progressPercent}%`;

        if (this.config.animation.progressAnimations && !this.mediaQueryState.prefersReducedMotion) {
    
}
            progressFill.style.transition = `width ${this.config.animation.duration} ${this.config.animation.easing}`;
        }

        const progressText = document.createElement('span');
        progressText.className = 'challenge-item-progress-text';
        progressText.textContent = `${challenge.progress}/${challenge.target} (${progressPercent}%')`;'
        progressText.setAttribute('aria-describedby', progressBarId);
        
        progressBar.appendChild(progressFill);

        progressBarContainer.appendChild(progressBar);
        progressBarContainer.appendChild(progressText);
        ';'
        // フッター
        const footer = document.createElement('div');
        footer.className = 'challenge-item-footer';

        const deadline = document.createElement('span');
        deadline.className = 'challenge-item-deadline';
        deadline.textContent = `期限: ${formatDeadlineTime(challenge.deadline'}'`;

        const reward = document.createElement('span');
        reward.className = 'challenge-item-reward';
        reward.textContent = `報酬: ${formatRewardText(challenge.reward}`;
        
        footer.appendChild(deadline);
        footer.appendChild(reward);
        
        // バッジの作成
        const badges: HTMLElement[] = [],
        if (challenge.metadata?.tags) {

            challenge.metadata.tags.forEach(tag => { '),'
                const badge = document.createElement('span') }

                badge.className = 'challenge-item-badge'; }

                badge.textContent = tag; : undefined', '
                badge.setAttribute('aria-label', `タグ: ${tag}`);

                badges.push(badge);'}');
        }
        ';'

        return { ''
            container: document.createElement('div', // プレースホルダー,
            header,
            title,
            difficulty,
            description,
            progress: {
                bar: progressBarContainer,
                fill: progressFill,
                text: progressText,
    percentage: progressPercent,
                animated: this.config.animation.progressAnimations 
    };
            footer,
            deadline,
            reward,
            badges: badges.length > 0 ? badges : undefined,
    
    /**
     * 空の状態の描画
     */''
    private renderEmptyState()';'
        const emptyState = document.createElement('div');
        emptyState.className = 'challenge-ui-empty-state';
        emptyState.setAttribute('role', 'status');

        const icon = document.createElement('div');
        icon.className = 'challenge-ui-empty-icon';
        icon.textContent = '📋';
        icon.setAttribute('aria-hidden', 'true');

        const message = document.createElement('p');
        message.className = 'challenge-ui-empty-message';
        message.textContent = '表示するチャレンジがありません';
        
        emptyState.appendChild(icon);
        emptyState.appendChild(message);
        
        this.elements.challengeList.appendChild(emptyState);
    }
    
    /**
     * 進捗セクションの更新'
     */''
    updateProgressSection()';'
        const container = this.elements.progressSection.querySelector('.challenge-ui-progress-container' as HTMLElement;
        if(!container) return;

        container.innerHTML = ';'
        
        const total = this.state.challenges.length;

        const completed = this.state.challenges.filter(c => c.progress >= c.target).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100') : 0;'

        const progressBarId = createAccessibleId('overall-progress', 'bar');

        const progressBar = document.createElement('div');
        progressBar.className = 'challenge-ui-overall-progress';
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-valuenow', completed.toString());
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', total.toString());
        progressBar.setAttribute('aria-label', `全体進捗: ${completed}/${ total}完了`};
        progressBar.id = progressBarId;

        ' }'

        const fill = document.createElement('div'}';'
        fill.className = 'challenge-ui-overall-progress-fill';
        fill.style.width = `${completionRate}%`;

        if (this.config.animation.progressAnimations && !this.mediaQueryState.prefersReducedMotion) {
    
}
            fill.style.transition = `width ${this.config.animation.duration} ${this.config.animation.easing}`;
        }

        const text = document.createElement('span');
        text.className = 'challenge-ui-overall-progress-text';
        text.textContent = `${completed}/${total} 完了 (${completionRate}%')`;'
        text.setAttribute('aria-describedby', progressBarId);
        
        progressBar.appendChild(fill);
        container.appendChild(progressBar);
        container.appendChild(text);
    }
    
    /**
     * フッターの更新'
     */''
    updateFooter()';'
        const info = this.elements.footer.querySelector('.challenge-ui-info) as HTMLElement;'
        if (!info) return;

        const updateTime = this.state.lastUpdated || new Date()';'
        info.textContent = `最終更新: ${updateTime.toLocaleTimeString('ja-JP'}'`;'
    }
    
    /**
     * ローディング表示の制御'
     */''
    showLoading(show: boolean): void { ''
        this.elements.loadingIndicator.style.display = show ? 'block' : 'none',
        this.elements.challengeList.style.display = show ? 'none' : 'block',
        this.elements.container.setAttribute('aria-busy', show ? 'true' : 'false' }
    
    /**
     * エラー表示'
     */''
    showError(message: string): void { this.elements.errorMessage.textContent = message,
        this.elements.errorMessage.style.display = 'block',
        ','
        // 5秒後に自動で隠す
        setTimeout(() => { }'

            this.elements.errorMessage.style.display = 'none'; }
        }, 5000';'
    }
    
    /**
     * スタイルの適用'
     */''
    applyStyles()';'
            this.injectStyle('base', COMPONENT_BASE_STYLES, 'component);'
            
            // アクセシビリティスタイル
            if (this.config.accessibility.enabled) { this.applyAccessibilityStyles() }
            
            // レスポンシブスタイル
            this.applyResponsiveStyles();
            
            // テーマスタイル
            this.applyThemeStyles();
            // カスタムCSS
            if (this.config.styles.customCSS) {', ' }

                this.injectStyle('custom', this.config.styles.customCSS, 'component'; }

            } catch (error) { console.error('[ChallengeUIRenderer] Failed to apply styles:', error }
    }
    
    /**
     * アクセシビリティスタイルの適用
     */
    applyAccessibilityStyles(): void { let accessibilityCSS = ACCESSIBILITY_STYLES,
        
        // 高コントラストモード
        if (this.config.accessibility.highContrast || this.mediaQueryState.prefersHighContrast) {
            accessibilityCSS += `,
                .challenge-ui-container {
                    --background-color: #000000 !important,
                    --text-color: #FFFFFF !important,
                    --border-color: #FFFFFF !important }
                    border: 3px solid var(--border-color) !important; 
    }
                
                .challenge-item { background-color: #111111 !important,
                    color: #FFFFFF !important,
    border: 2px solid #FFFFFF !important  }
            `;
        }
        
        // 動きの軽減
        if (this.config.accessibility.reducedMotion || this.mediaQueryState.prefersReducedMotion) {
            accessibilityCSS += `,
                .challenge-ui-container *,
                .challenge-item * {
                    animation-duration: 0.01ms !important,
                    animation-iteration-count: 1 !important }
                    transition-duration: 0.01ms !important }
                }
            `;
        }
        ;
        // スクリーンリーダー最適化
        if (this.config.accessibility.screenReaderOptimized) {
            accessibilityCSS += `,
                .challenge-item-progress::after {''
                    content: "進捗 " attr(data-progress) " パーセント",
    position: absolute,
                    left: -10000px; 
    }
                ";"
                .challenge-item-difficulty::after { }"
                    content: "難易度 " attr(data-difficulty}
                    position: absolute,
    left: -10000px);
                }"
            `"";
        ")";
        this.injectStyle('accessibility', accessibilityCSS, 'component';
    }
    
    /**
     * レスポンシブスタイルの適用'
     */''
    applyResponsiveStyles('';
        let, responsiveCSS = ';'
        );
        if (mobile) {
        responsiveCSS += `,
                .challenge-ui-container {
                    padding: 12px }
                    font-size: 12px }
                }
                
                .challenge-ui-header { padding: 12px }
                
                .challenge-item { margin: 6px,
                    padding: 10px  }
                
                .challenge-ui-filters;
                .challenge-ui-sorts { flex-direction: column,
                    gap: 8px  }
            `;
        } else if (tablet) { responsiveCSS += `
                .challenge-ui-container {
                    padding: 14px,
                    font-size: 13px }
            `;
        }

        if (responsiveCSS) {', ' }

            this.injectStyle('responsive', responsiveCSS, 'component'; }
}
    
    /**
     * テーマスタイルの適用'
     */''
    private applyThemeStyles('';
        let, themeCSS = ';'

        const, isDark = theme === 'dark' || ')';
                      (theme === 'auto' && this.mediaQueryState.prefersDarkMode);
        
        if (isDark) {
        
            themeCSS = `,
                .challenge-ui-container {
                    --background-color: #1a1a1a,
                    --text-color: #ffffff,
                    --border-color: #333333 }
                    --accent-color: #60a5fa }
                }
                
                .challenge-item { background-color: #2d2d2d,
                    border-color: #404040 }
                
                .challenge-item:hover { background-color: #353535 }
            `;
        }

        if (themeCSS) {', ' }

            this.injectStyle('theme', themeCSS, 'component); }'
}
    
    /**
     * スタイルの注入
     */
    private injectStyle(id: string, css: string, scope: StyleScope): void {
        const fullId = `challenge-ui-${id}`;
        
        // 既存のスタイルを削除
        if (this.injectedStyles.has(fullId) {
            const existing = this.injectedStyles.get(fullId);
            existing?.element.remove()','
        const style = document.createElement('style),'
        style.id = fullId,
        style.textContent = css,
        
        // CSS変数の設定
        const cssVariables = ` : undefined
        
            :root { }
                --challenge-accent-color: ${this.config.styles.accentColor}
                --challenge-background-color: ${this.config.styles.backgroundColor}
                --challenge-text-color: ${this.config.styles.textColor}
        `;
        style.textContent = cssVariables + css;
        
        document.head.appendChild(style);
        
        // 記録
        this.injectedStyles.set(fullId, { id: fullId)
            css,
           , element: style),
            scope }
    
    /**
     * 注入されたスタイルの取得
     */
    getInjectedStyles(): StyleInjection[] { return Array.from(this.injectedStyles.values() }
    
    /**
     * メディアクエリ状態の取得
     */
    getMediaQueryState(): MediaQueryState {
        return { ...this.mediaQueryState }
    
    /**
     * レンダリング設定の更新
     */
    updateRenderConfig(newConfig: Partial<UIRenderConfig>): void { Object.assign(this.config, newConfig);
        this.applyStyles() }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy(): void { // 注入されたスタイルを削除
        this.injectedStyles.forEach(style => { ) }
            style.element.remove(); }
        };
        this.injectedStyles.clear()';'
        console.log('[ChallengeUIRenderer] Component, destroyed');

    }'}'