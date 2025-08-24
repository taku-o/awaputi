/**
 * ChallengeUI (Main, Controller)
 * チャレンジUI管理システムの軽量オーケストレーター
 * Main Controller Patternによる軽量化実装
 */

import { getErrorHandler } from '../utils/ErrorHandler';
import { ChallengeSystem, Challenge } from './ChallengeSystem';

/**
 * チャレンジUI設定インターフェース
 */
export interface ChallengeUIConfig {
    // 表示設定
    maxVisibleChallenges?: number;
    autoRefresh?: boolean;
    refreshInterval?: number;
    showProgress?: boolean;
    showRewards?: boolean;
    showDifficulty?: boolean;
    
    // アニメーション設定
    animations?: boolean;
    animationDuration?: number;
    animationEasing?: string;
    
    // アクセシビリティ設定
    accessibility?: boolean;
    announcements?: boolean;
    keyboardNavigation?: boolean;
    highContrast?: boolean;
    reducedMotion?: boolean;
    progressAnnouncements?: boolean;
    rewardAnnouncements?: boolean;
    screenReaderOptimized?: boolean;
    
    // スタイル設定
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    borderRadius?: string;
    fontSize?: string;
    fontFamily?: string;
}

/**
 * UI状態インターフェース
 */
interface UIState {
    visible: boolean;
    challenges: Challenge[];
    selectedChallenge: Challenge | null;
    focusedIndex: number;
    sortBy: 'priority' | 'difficulty' | 'progress' | 'deadline';
    filterBy: 'all' | 'daily' | 'weekly' | 'completed' | 'active';
    loading: boolean;
    error: string | null;
}

/**
 * UI統計インターフェース
 */
interface UIStats {
    views: number;
    challengeViews: number;
    completions: number;
    filterChanges: number;
    sortChanges: number;
    keyboardInteractions: number;
    announcementsMade: number;
}

/**
 * DOM要素インターフェース
 */
interface UIElements {
    container: HTMLElement | null;
    header: HTMLElement | null;
    filterControls: HTMLElement | null;
    sortControls: HTMLElement | null;
    challengeList: HTMLElement | null;
    challengeItems: HTMLElement[];
    progressSection: HTMLElement | null;
    footer: HTMLElement | null;
    announcer: HTMLElement | null;
    loadingIndicator: HTMLElement | null;
    errorMessage: HTMLElement | null;
}

/**
 * チャレンジ表示設定
 */
interface DisplayConfig {
    maxVisibleChallenges: number;
    autoRefresh: boolean;
    refreshInterval: number;
    showProgress: boolean;
    showRewards: boolean;
    showDifficulty: boolean;
}

/**
 * アニメーション設定
 */
interface AnimationConfig {
    enabled: boolean;
    duration: number;
    easing: string;
}

/**
 * アクセシビリティ設定
 */
interface AccessibilityConfig {
    enabled: boolean;
    announcements: boolean;
    keyboardNavigation: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    progressAnnouncements: boolean;
    rewardAnnouncements: boolean;
    screenReaderOptimized: boolean;
}

/**
 * スタイル設定
 */
interface StyleConfig {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    borderRadius: string;
    fontSize: string;
    fontFamily: string;
}

export class ChallengeUI {
    private challengeSystem: ChallengeSystem;
    private config: {
        display: DisplayConfig;
        animations: AnimationConfig;
        accessibility: AccessibilityConfig;
        styles: StyleConfig;
    };
    private state: UIState;
    private elements: UIElements;
    private stats: UIStats;
    private autoRefreshTimer: NodeJS.Timeout | null = null;

    constructor(challengeSystem: ChallengeSystem, options: ChallengeUIConfig = {}) {
        this.challengeSystem = challengeSystem;
        
        // 設定の初期化
        this.config = {
            display: {
                maxVisibleChallenges: options.maxVisibleChallenges || 5,
                autoRefresh: options.autoRefresh !== false,
                refreshInterval: options.refreshInterval || 60000, // 1分
                showProgress: options.showProgress !== false,
                showRewards: options.showRewards !== false,
                showDifficulty: options.showDifficulty !== false
            },
            animations: {
                enabled: options.animations !== false,
                duration: options.animationDuration || 300,
                easing: options.animationEasing || 'ease-in-out'
            },
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
            styles: {
                backgroundColor: options.backgroundColor || '#FFFFFF',
                textColor: options.textColor || '#333333',
                accentColor: options.accentColor || '#007AFF',
                borderRadius: options.borderRadius || '8px',
                fontSize: options.fontSize || '14px',
                fontFamily: options.fontFamily || 'system-ui, -apple-system, sans-serif'
            }
        };
        
        // 状態の初期化
        this.state = {
            visible: false,
            challenges: [],
            selectedChallenge: null,
            focusedIndex: 0,
            sortBy: 'priority',
            filterBy: 'all',
            loading: false,
            error: null
        };

        // DOM要素の初期化
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

        // 統計の初期化
        this.stats = {
            views: 0,
            challengeViews: 0,
            completions: 0,
            filterChanges: 0,
            sortChanges: 0,
            keyboardInteractions: 0,
            announcementsMade: 0
        };

        console.log('[ChallengeUI] Main Controller initialized');
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
            
            // 自動更新の設定
            if (this.config.display.autoRefresh) {
                this.startAutoRefresh();
            }
            
            this.log('ChallengeUI初期化完了');
        } catch (error) {
            this.handleError('CHALLENGE_UI_INITIALIZATION_FAILED', error as Error);
        }
    }

    /**
     * DOM要素の作成
     */
    private createElements(): void {
        // メインコンテナの作成
        this.elements.container = document.createElement('div');
        this.elements.container.className = 'challenge-ui-container';
        this.elements.container.setAttribute('role', 'region');
        this.elements.container.setAttribute('aria-label', 'チャレンジ一覧');

        // ヘッダー
        this.elements.header = document.createElement('header');
        this.elements.header.className = 'challenge-ui-header';
        this.elements.header.innerHTML = '<h2>チャレンジ</h2>';

        // フィルターコントロール
        this.elements.filterControls = document.createElement('div');
        this.elements.filterControls.className = 'challenge-ui-filters';
        
        // ソートコントロール
        this.elements.sortControls = document.createElement('div');
        this.elements.sortControls.className = 'challenge-ui-sort';

        // チャレンジリスト
        this.elements.challengeList = document.createElement('div');
        this.elements.challengeList.className = 'challenge-ui-list';
        this.elements.challengeList.setAttribute('role', 'list');

        // プログレスセクション
        this.elements.progressSection = document.createElement('div');
        this.elements.progressSection.className = 'challenge-ui-progress';

        // フッター
        this.elements.footer = document.createElement('footer');
        this.elements.footer.className = 'challenge-ui-footer';

        // アナウンサー（スクリーンリーダー用）
        if (this.config.accessibility.enabled) {
            this.elements.announcer = document.createElement('div');
            this.elements.announcer.className = 'sr-only';
            this.elements.announcer.setAttribute('role', 'status');
            this.elements.announcer.setAttribute('aria-live', 'polite');
        }

        // ローディングインジケーター
        this.elements.loadingIndicator = document.createElement('div');
        this.elements.loadingIndicator.className = 'challenge-ui-loading';
        this.elements.loadingIndicator.innerHTML = '<span>読み込み中...</span>';

        // エラーメッセージ
        this.elements.errorMessage = document.createElement('div');
        this.elements.errorMessage.className = 'challenge-ui-error';
        this.elements.errorMessage.setAttribute('role', 'alert');

        // 要素の組み立て
        this.elements.container.appendChild(this.elements.header);
        this.elements.container.appendChild(this.elements.filterControls);
        this.elements.container.appendChild(this.elements.sortControls);
        this.elements.container.appendChild(this.elements.challengeList);
        this.elements.container.appendChild(this.elements.progressSection);
        this.elements.container.appendChild(this.elements.footer);
        this.elements.container.appendChild(this.elements.loadingIndicator);
        this.elements.container.appendChild(this.elements.errorMessage);

        if (this.elements.announcer) {
            this.elements.container.appendChild(this.elements.announcer);
        }
    }

    /**
     * スタイルの適用
     */
    private applyStyles(): void {
        if (!this.elements.container) return;

        const { styles } = this.config;
        
        // CSS変数の設定
        this.elements.container.style.setProperty('--challenge-bg-color', styles.backgroundColor);
        this.elements.container.style.setProperty('--challenge-text-color', styles.textColor);
        this.elements.container.style.setProperty('--challenge-accent-color', styles.accentColor);
        this.elements.container.style.setProperty('--challenge-border-radius', styles.borderRadius);
        this.elements.container.style.setProperty('--challenge-font-size', styles.fontSize);
        this.elements.container.style.setProperty('--challenge-font-family', styles.fontFamily);
    }

    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void {
        // キーボードナビゲーション
        if (this.config.accessibility.keyboardNavigation && this.elements.container) {
            this.elements.container.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
        }

        // チャレンジシステムのイベント
        this.challengeSystem.on?.('challengeCompleted', this.handleChallengeCompleted.bind(this));
        this.challengeSystem.on?.('challengeProgress', this.handleChallengeProgress.bind(this));
    }

    /**
     * アクセシビリティの設定
     */
    private setupAccessibility(): void {
        if (!this.elements.container) return;

        // 高コントラストモード
        if (this.config.accessibility.highContrast) {
            this.elements.container.classList.add('high-contrast');
        }

        // アニメーション削減
        if (this.config.accessibility.reducedMotion) {
            this.elements.container.classList.add('reduced-motion');
        }

        // スクリーンリーダー最適化
        if (this.config.accessibility.screenReaderOptimized) {
            this.elements.container.classList.add('screen-reader-optimized');
        }
    }

    /**
     * キーボードナビゲーション処理
     */
    private handleKeyboardNavigation(event: KeyboardEvent): void {
        this.stats.keyboardInteractions++;

        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.focusPrevious();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.focusNext();
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.selectCurrentChallenge();
                break;
            case 'Escape':
                event.preventDefault();
                this.hide();
                break;
        }
    }

    /**
     * フォーカスを前の項目に移動
     */
    private focusPrevious(): void {
        if (this.state.focusedIndex > 0) {
            this.state.focusedIndex--;
            this.updateFocus();
        }
    }

    /**
     * フォーカスを次の項目に移動
     */
    private focusNext(): void {
        if (this.state.focusedIndex < this.state.challenges.length - 1) {
            this.state.focusedIndex++;
            this.updateFocus();
        }
    }

    /**
     * フォーカスの更新
     */
    private updateFocus(): void {
        const items = this.elements.challengeItems;
        items.forEach((item, index) => {
            if (index === this.state.focusedIndex) {
                item.setAttribute('tabindex', '0');
                item.focus();
            } else {
                item.setAttribute('tabindex', '-1');
            }
        });
    }

    /**
     * 現在のチャレンジを選択
     */
    private selectCurrentChallenge(): void {
        const challenge = this.state.challenges[this.state.focusedIndex];
        if (challenge) {
            this.state.selectedChallenge = challenge;
            this.announce(`チャレンジ「${challenge.title}」を選択しました`);
        }
    }

    /**
     * チャレンジ完了イベントの処理
     */
    private handleChallengeCompleted(data: any): void {
        this.stats.completions++;
        
        if (this.config.accessibility.rewardAnnouncements) {
            this.announce(`チャレンジ「${data.challenge.title}」が完了しました！`);
        }
        
        this.loadChallenges();
    }

    /**
     * チャレンジ進捗イベントの処理
     */
    private handleChallengeProgress(data: any): void {
        if (this.config.accessibility.progressAnnouncements) {
            const percentage = Math.round(data.progress * 100);
            this.announce(`チャレンジの進捗: ${percentage}%`);
        }
        
        this.updateChallengeDisplay();
    }

    /**
     * チャレンジの表示
     */
    async show(): Promise<void> {
        if (this.state.visible) return;
        
        try {
            this.state.visible = true;
            this.stats.views++;
            
            // チャレンジデータの読み込み
            await this.loadChallenges();
            
            // コンテナの表示
            if (this.elements.container) {
                this.elements.container.style.display = 'flex';
            }
            
            // 初期フォーカスの設定
            this.setInitialFocus();
            
            this.announce('チャレンジ一覧を表示しました');
            this.log('ChallengeUI表示');
        } catch (error) {
            this.handleError('CHALLENGE_UI_SHOW_FAILED', error as Error);
        }
    }
    
    /**
     * チャレンジの非表示
     */
    hide(): void {
        if (!this.state.visible) return;
        
        this.state.visible = false;
        
        if (this.elements.container) {
            this.elements.container.style.display = 'none';
        }
        
        this.log('ChallengeUI非表示');
    }

    /**
     * 初期フォーカスの設定
     */
    private setInitialFocus(): void {
        if (this.elements.challengeItems.length > 0) {
            this.state.focusedIndex = 0;
            this.updateFocus();
        }
    }
    
    /**
     * チャレンジデータの読み込み
     */
    async loadChallenges(): Promise<void> {
        try {
            this.state.loading = true;
            this.state.error = null;
            
            // チャレンジシステムからデータを取得
            const challenges = this.challengeSystem.getActiveChallenges();
            this.state.challenges = challenges.slice(0, this.config.display.maxVisibleChallenges);
            
            // 表示の更新
            this.updateChallengeDisplay();
            
            this.state.loading = false;
        } catch (error) {
            this.state.loading = false;
            this.state.error = (error as Error).message;
            this.handleError('CHALLENGE_LOAD_FAILED', error as Error);
        }
    }

    /**
     * チャレンジ表示の更新
     */
    private updateChallengeDisplay(): void {
        if (!this.elements.challengeList) return;

        // 既存の項目をクリア
        this.elements.challengeList.innerHTML = '';
        this.elements.challengeItems = [];

        // チャレンジ項目の作成
        this.state.challenges.forEach((challenge, index) => {
            const item = this.createChallengeItem(challenge, index);
            this.elements.challengeItems.push(item);
            this.elements.challengeList!.appendChild(item);
        });
    }

    /**
     * チャレンジ項目の作成
     */
    private createChallengeItem(challenge: Challenge, index: number): HTMLElement {
        const item = document.createElement('div');
        item.className = 'challenge-item';
        item.setAttribute('role', 'listitem');
        item.setAttribute('tabindex', index === 0 ? '0' : '-1');

        const progress = challenge.progress || { current: 0, target: 1, percentage: 0 };
        
        item.innerHTML = `
            <div class="challenge-header">
                <h3>${challenge.title}</h3>
                <span class="challenge-difficulty">${challenge.difficulty}</span>
            </div>
            <div class="challenge-description">${challenge.description}</div>
            <div class="challenge-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                </div>
                <span class="progress-text">${progress.current}/${progress.target}</span>
            </div>
            <div class="challenge-reward">
                報酬: ${challenge.reward.type} ${challenge.reward.amount || ''}
            </div>
        `;

        return item;
    }

    /**
     * 自動更新の開始
     */
    private startAutoRefresh(): void {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
        }
        
        this.autoRefreshTimer = setInterval(() => {
            this.loadChallenges();
        }, this.config.display.refreshInterval);
    }

    /**
     * 自動更新の停止
     */
    private stopAutoRefresh(): void {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
            this.autoRefreshTimer = null;
        }
    }

    /**
     * アナウンス
     */
    private announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
        if (!this.config.accessibility.announcements || !this.elements.announcer) return;
        
        this.stats.announcementsMade++;
        
        // aria-live属性を更新
        this.elements.announcer.setAttribute('aria-live', priority);
        
        // 一度クリアしてから新しいメッセージを設定
        this.elements.announcer.textContent = '';
        setTimeout(() => {
            if (this.elements.announcer) {
                this.elements.announcer.textContent = message;
            }
        }, 100);
        
        this.log('アナウンス', { message, priority });
    }

    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<ChallengeUIConfig>): void {
        // 設定の更新
        if (newConfig.maxVisibleChallenges !== undefined) {
            this.config.display.maxVisibleChallenges = newConfig.maxVisibleChallenges;
        }
        if (newConfig.autoRefresh !== undefined) {
            this.config.display.autoRefresh = newConfig.autoRefresh;
        }
        
        // スタイルの再適用
        this.applyStyles();
        
        // 自動更新の再設定
        if (this.config.display.autoRefresh) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }
        
        this.log('ChallengeUI設定更新', newConfig);
    }

    /**
     * 現在の状態取得
     */
    getCurrentState(): {
        visible: boolean;
        challenges: number;
        selectedChallenge: string | null;
        loading: boolean;
        error: string | null;
        sortBy: string;
        filterBy: string;
    } {
        return {
            visible: this.state.visible,
            challenges: this.state.challenges.length,
            selectedChallenge: this.state.selectedChallenge?.id || null,
            loading: this.state.loading,
            error: this.state.error,
            sortBy: this.state.sortBy,
            filterBy: this.state.filterBy
        };
    }

    /**
     * 統計の取得
     */
    getStats(): { main: UIStats } {
        return {
            main: { ...this.stats }
        };
    }

    /**
     * コンテナ要素の取得
     */
    getContainer(): HTMLElement | null {
        return this.elements.container;
    }

    /**
     * DOM要素を親要素に追加
     */
    appendTo(parentElement: HTMLElement): void {
        if (parentElement && this.elements.container) {
            parentElement.appendChild(this.elements.container);
        }
    }

    /**
     * 要素の可視性チェック
     */
    isVisible(): boolean {
        return this.state.visible && 
               this.elements.container !== null && 
               this.elements.container.style.display !== 'none';
    }

    /**
     * ロード状態チェック
     */
    isLoading(): boolean {
        return this.state.loading;
    }

    /**
     * チャレンジ数の取得
     */
    getChallengeCount(): number {
        return this.state.challenges.length;
    }

    /**
     * 選択中チャレンジの取得
     */
    getSelectedChallenge(): Challenge | null {
        return this.state.selectedChallenge;
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        // 自動更新の停止
        this.stopAutoRefresh();
        
        // DOM要素の削除
        if (this.elements.container && this.elements.container.parentNode) {
            this.elements.container.parentNode.removeChild(this.elements.container);
        }
        
        console.log('[ChallengeUI] Main Controller cleaned up successfully');
        this.log('ChallengeUI破棄完了');
    }

    /**
     * エラーハンドリング
     */
    private handleError(type: string, error: Error, context: Record<string, any> = {}): void {
        const errorInfo = {
            type,
            error: error.message || error,
            context,
            timestamp: Date.now()
        };
        
        getErrorHandler().handleError(error, {
            context: 'ChallengeUI',
            type,
            ...context
        });
        
        this.log('エラー発生', errorInfo, 'error');
    }

    /**
     * ログ記録
     */
    private log(message: string, data: any = null, level: 'info' | 'warn' | 'error' = 'info'): void {
        const consoleMethod = level === 'error' ? 'error' : 
                            level === 'warn' ? 'warn' : 'log';
        
        console[consoleMethod](`[ChallengeUI] ${message}`, data || '');
    }
}