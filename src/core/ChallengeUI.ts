/**
 * ChallengeUI (Main Controller)
 * チャレンジUI管理システムの軽量オーケストレーター
 * Main Controller Patternによる軽量化実装
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

export class ChallengeUI {
    private challengeSystem: any;
    private config: any;
    private state: any;
    private elements: any;
    private stats: any;
    private autoRefreshTimer: NodeJS.Timeout | null;

    constructor(challengeSystem: any, options: any = {}) {
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
        
        // 状态管理
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
        
        this.autoRefreshTimer = null;
        
        console.log('[ChallengeUI] Main Controller initialized');
        this.initialize();
        this.log('ChallengeUI初期化完了');
    }
    
    /**
     * 初期化
     */
    initialize(): void {
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
        this.elements.container.style.display = 'none';

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
        this.elements.loadingIndicator.style.display = 'none';

        // エラーメッセージ
        this.elements.errorMessage = document.createElement('div');
        this.elements.errorMessage.className = 'challenge-ui-error';
        this.elements.errorMessage.setAttribute('role', 'alert');
        this.elements.errorMessage.style.display = 'none';

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
        if (this.challengeSystem.on) {
            this.challengeSystem.on('challengeCompleted', this.handleChallengeCompleted.bind(this));
            this.challengeSystem.on('challengeProgress', this.handleChallengeProgress.bind(this));
        }
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
        items.forEach((item: HTMLElement, index: number) => {
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
            this.elements.container.style.display = 'flex';
            
            // 初期フォーカスの設定
            this.setInitialFocus();
            
            // アナウンス
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
        this.elements.container.style.display = 'none';
        
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
            this.elements.loadingIndicator.style.display = 'block';
            
            // チャレンジシステムからデータを取得
            const challenges = this.challengeSystem.getActiveChallenges();
            this.state.challenges = challenges.slice(0, this.config.maxVisibleChallenges);
            
            // 表示の更新
            this.updateChallengeDisplay();
            
            this.state.loading = false;
            this.elements.loadingIndicator.style.display = 'none';
            
        } catch (error) {
            this.state.loading = false;
            this.state.error = (error as Error).message;
            this.elements.loadingIndicator.style.display = 'none';
            this.elements.errorMessage.style.display = 'block';
            this.elements.errorMessage.textContent = this.state.error;
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
        this.state.challenges.forEach((challenge: any, index: number) => {
            const item = this.createChallengeItem(challenge, index);
            this.elements.challengeItems.push(item);
            this.elements.challengeList.appendChild(item);
        });
    }

    /**
     * チャレンジ項目の作成
     */
    private createChallengeItem(challenge: any, index: number): HTMLElement {
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
        }, this.config.refreshInterval);
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
     * チャレンジの進捗更新
     */
    updateChallengeProgress(challengeId: string, newProgress: any): void {
        const challenge = this.state.challenges.find((c: any) => c.id === challengeId);
        if (challenge) {
            challenge.progress = newProgress;
            this.updateChallengeDisplay();
        }
    }
    
    /**
     * チャレンジの検索
     */
    searchChallenges(query: string): any[] {
        if (!query) return this.state.challenges;
        
        return this.state.challenges.filter((challenge: any) => 
            challenge.title.toLowerCase().includes(query.toLowerCase()) ||
            challenge.description.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    /**
     * チャレンジ統計の取得
     */
    getChallengeStatistics(): any {
        return this.challengeSystem.getChallengeStats();
    }
    
    /**
     * チャレンジデータのエクスポート
     */
    exportChallengeData(): any {
        return {
            challenges: this.state.challenges,
            stats: this.stats,
            timestamp: Date.now()
        };
    }
    
    /**
     * チャレンジデータのインポート
     */
    importChallengeData(jsonData: any): boolean {
        try {
            if (jsonData.challenges) {
                this.state.challenges = jsonData.challenges;
                this.updateChallengeDisplay();
                return true;
            }
            return false;
        } catch (error) {
            this.handleError('CHALLENGE_IMPORT_FAILED', error as Error);
            return false;
        }
    }
    
    // ========== アナウンス機能 ==========
    
    /**
     * アナウンス
     */
    announce(message: string, priority: string = 'polite'): void {
        if (!this.config.accessibility.announcements || !this.elements.announcer) return;
        
        this.stats.announcementsMade++;
        
        // 一度クリアしてから新しいメッセージを設定
        this.elements.announcer.textContent = '';
        setTimeout(() => {
            this.elements.announcer.textContent = message;
        }, 100);
        
        this.log('アナウンス', { message, priority });
    }
    
    // ========== 設定管理 ==========
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig: any): void {
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
    
    // ========== 状態取得 ==========
    
    /**
     * 現在の状態取得
     */
    getCurrentState(): any {
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
    getStats(): any {
        return {
            main: { ...this.stats },
            challenge: this.getChallengeStatistics()
        };
    }
    
    // ========== DOM要素アクセス ==========
    
    /**
     * コンテナ要素の取得
     */
    getContainer(): HTMLElement {
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
    
    // ========== データ整合性 ==========
    
    /**
     * データ整合性チェック
     */
    validateDataIntegrity(): boolean {
        try {
            // チャレンジデータの整合性確認
            for (const challenge of this.state.challenges) {
                if (!challenge.id || !challenge.title || !challenge.reward) {
                    return false;
                }
            }
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * 期限切れチャレンジの確認
     */
    checkExpiredChallenges(): any[] {
        const now = Date.now();
        return this.state.challenges.filter((challenge: any) => 
            challenge.endTime && now > challenge.endTime
        );
    }
    
    // ========== ユーティリティ ==========
    
    /**
     * 要素の可視性チェック
     */
    isVisible(): boolean {
        return this.state.visible && this.elements.container.style.display !== 'none';
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
    getSelectedChallenge(): any {
        return this.state.selectedChallenge;
    }
    
    // ========== クリーンアップ ==========
    
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
    
    // ========== エラーハンドリング・ログ ==========
    
    /**
     * エラーハンドリング
     */
    handleError(type: string, error: Error, context: any = {}): void {
        const errorInfo = {
            type,
            error: error.message || error,
            context,
            timestamp: Date.now()
        };
        
        getErrorHandler().handleError(error, 'ChallengeUI', context);
        
        this.log('エラー発生', errorInfo, 'error');
    }
    
    /**
     * ログ記録
     */
    log(message: string, data: any = null, level: string = 'info'): void {
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