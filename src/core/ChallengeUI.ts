/**
 * ChallengeUI (Main, Controller)
 * チャレンジUI管理システムの軽量オーケストレーター
 * Main Controller Patternによる軽量化実装
 */

import { ErrorHandler  } from '../utils/ErrorHandler';
import { ChallengeUIRenderer  } from './challenge/ChallengeUIRenderer';
import { ChallengeInteractionHandler  } from './challenge/ChallengeInteractionHandler';
import { ChallengeDataController  } from './challenge/ChallengeDataController';
import { ChallengeSystem, Challenge  } from './ChallengeSystem';

/**
 * チャレンジUI設定インターフェース
 */
export interface ChallengeUIConfig { // 表示設定
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
/**
 * UI状態インターフェース
 */
interface UIState { visible: boolean,
    challenges: Challenge[];
    selectedChallenge: Challenge | null;
    focusedIndex: number;
    sortBy: 'priority' | 'difficulty' | 'progress' | 'deadline';
    filterBy: 'all' | 'daily' | 'weekly' | 'completed' | 'active';
    loading: boolean;
    error: string | null  }
/**
 * UI統計インターフェース
 */
interface UIStats { views: number,
    challengeViews: number;
    completions: number;
    filterChanges: number;
    sortChanges: number;
    keyboardInteractions: number;
    announcementsMade: number;
/**
 * DOM要素インターフェース
 */
interface UIElements { container: HTMLElement | null,
    header: HTMLElement | null;
    filterControls: HTMLElement | null;
    sortControls: HTMLElement | null;
    challengeList: HTMLElement | null;
    challengeItems: HTMLElement[];
    progressSection: HTMLElement | null;
    footer: HTMLElement | null;
    announcer: HTMLElement | null;
    loadingIndicator: HTMLElement | null;
    errorMessage: HTMLElement | null  }
export class ChallengeUI {
    private challengeSystem: ChallengeSystem;
    private, config: {
        maxVisibleChallenges: number,
        autoRefresh: boolean,
        refreshInterval: number,
        showProgress: boolean,
        showRewards: boolean,
        showDifficulty: boolean,
    animations: {
            enabled: boolean,
            duration: number,
    easing: string,;
        accessibility: { enabled: boolean,
            announcements: boolean,
            keyboardNavigation: boolean,
            highContrast: boolean,
            reducedMotion: boolean,
            progressAnnouncements: boolean,
            rewardAnnouncements: boolean,
    screenReaderOptimized: boolean,;
        styles: { backgroundColor: string,
            textColor: string,
            accentColor: string,
            borderRadius: string,
            fontSize: string,
    fontFamily: string,;
    
    private state: UIState,
    public, elements: UIElements,
    private stats: UIStats,
    // サブコンポーネント
    public, renderer: ChallengeUIRenderer,
    public interactionHandler: ChallengeInteractionHandler,
    public dataController: ChallengeDataController,

    constructor(challengeSystem: ChallengeSystem, options: ChallengeUIConfig = { )) {
        this.challengeSystem = challengeSystem;
        
        // 設定
        this.config = {
            // 表示設定
            maxVisibleChallenges: options.maxVisibleChallenges || 5;
            autoRefresh: options.autoRefresh !== false,
    refreshInterval: options.refreshInterval || 60000, // 1分;
            showProgress: options.showProgress !== false,
            showRewards: options.showRewards !== false,
            showDifficulty: options.showDifficulty !== false,
            // アニメーション設定
           , animations: {
                enabled: options.animations !== false,
    duration: options.animationDuration || 300,
                easing: options.animationEasing || 'ease-in-out'
            };
            // アクセシビリティ設定
            accessibility: { enabled: options.accessibility !== false,
                announcements: options.announcements !== false,
                keyboardNavigation: options.keyboardNavigation !== false,
                highContrast: options.highContrast === true,
                reducedMotion: options.reducedMotion === true,
                progressAnnouncements: options.progressAnnouncements !== false,
                rewardAnnouncements: options.rewardAnnouncements !== false,
    screenReaderOptimized: options.screenReaderOptimized !== false 
};
            // スタイル設定
            styles: { ''
                backgroundColor: options.backgroundColor || '#FFFFFF',
                textColor: options.textColor || '#333333',
                accentColor: options.accentColor || '#007AFF',
                borderRadius: options.borderRadius || '8px',
                fontSize: options.fontSize || '14px',
                fontFamily: options.fontFamily || 'system-ui, -apple-system, sans-serif' }
        };
        
        // 状态管理
        this.state = { visible: false,
            challenges: [],
            selectedChallenge: null,
    focusedIndex: 0,
            sortBy: 'priority',
            filterBy: 'all',
            loading: false,
    error: null,;
        // DOM要素
        this.elements = { container: null,
            header: null,
            filterControls: null,
            sortControls: null,
            challengeList: null,
            challengeItems: [],
            progressSection: null,
            footer: null,
            announcer: null,
            loadingIndicator: null,
    errorMessage: null,;
        // 統計
        this.stats = { views: 0,
            challengeViews: 0,
            completions: 0,
            filterChanges: 0,
            sortChanges: 0,
            keyboardInteractions: 0,
    announcementsMade: 0 
 };
        // サブコンポーネントの初期化（依存注入）
        this.renderer = new ChallengeUIRenderer(this);
        this.interactionHandler = new ChallengeInteractionHandler(this);
        this.dataController = new ChallengeDataController(this);

        console.log('[ChallengeUI] Main, Controller initialized, with sub-components');
        this.initialize()';'
        this.log('ChallengeUI初期化完了);'
    }
    
    /**
     * 初期化
     */
    private initialize(): void { try {
            // DOM要素の作成（レンダラーに委譲）
            this.renderer.createElements(),
            
            // スタイルの適用（レンダラーに委譲）
            this.renderer.applyStyles(),
            
            // イベントリスナーの設定（インタラクションハンドラーに委譲）
            this.interactionHandler.setupEventListeners(),
            
            // アクセシビリティの設定（インタラクションハンドラーに委譲）
            if (this.config.accessibility.enabled) {
    
}
                this.interactionHandler.setupAccessibility(); }
            // 自動更新の設定（データコントローラーに委譲）
            if (this.config.autoRefresh) { this.dataController.startAutoRefresh(),' }'

            } catch (error) {
            this.handleError('CHALLENGE_UI_INITIALIZATION_FAILED', error as Error) }
    }
    
    // ========== 公開API（サブコンポーネントに委譲） ==========
    
    /**
     * チャレンジの表示
     */
    async show(): Promise<void> { if (this.state.visible) return,
        
        try {
            this.state.visible = true,
            this.stats.views++,
            
            // チャレンジデータの読み込み（データコントローラーに委譲）
            await this.dataController.loadChallenges(),
            // コンテナの表示
            if (this.elements.container) {', ' }

                this.elements.container.style.display = 'flex'; }
            ';'
            // 初期フォーカスの設定（インタラクションハンドラーに委譲）
            this.interactionHandler.setInitialFocus()';'
            this.announce('チャレンジ一覧を表示しました');

            this.log('ChallengeUI表示);'

        } catch (error) {
            this.handleError('CHALLENGE_UI_SHOW_FAILED', error as Error) }
    }
    
    /**
     * チャレンジの非表示
     */
    hide(): void { if (!this.state.visible) return,
        ','

        this.state.visible = false,
        if (this.elements.container) {', ' }

            this.elements.container.style.display = 'none'; }
        }

        this.log('ChallengeUI非表示);'
    }
    
    /**
     * チャレンジデータの読み込み（データコントローラーに委譲）
     */
    async loadChallenges(): Promise<void> { return this.dataController.loadChallenges() }
    /**
     * チャレンジの進捗更新（データコントローラーに委譲）
     */
    updateChallengeProgress(challengeId: string, newProgress: number): void { return this.dataController.updateChallengeProgress(challengeId, newProgress) }
    /**
     * チャレンジの検索（データコントローラーに委譲）
     */
    searchChallenges(query: string): Challenge[] { return this.dataController.searchChallenges(query) }
    /**
     * チャレンジ統計の取得（データコントローラーに委譲）
     */
    getChallengeStatistics(): any { return this.dataController.getChallengeStatistics() }
    /**
     * チャレンジデータのエクスポート（データコントローラーに委譲）
     */
    exportChallengeData(): string { return this.dataController.exportChallengeData() }
    /**
     * チャレンジデータのインポート（データコントローラーに委譲）
     */'
    importChallengeData(jsonData: string): boolean {,
        return this.dataController.importChallengeData(jsonData) }
    // ========== アナウンス機能 ==========
    
    /**
     * アナウンス
     */''
    announce(message: string, priority: 'polite' | 'assertive' = 'polite': void { ''
        if(!this.config.accessibility.announcements || !this.elements.announcer) return,
        
        this.stats.announcementsMade++,
        ','
        // 一度クリアしてから新しいメッセージを設定
        this.elements.announcer.textContent = ','
        setTimeout(() => { 
            if (this.elements.announcer) { }
                this.elements.announcer.textContent = message; }

            }'}, 100');

        this.log('アナウンス', { message, priority }
    
    // ========== 設定管理 ==========
    
    /**
     * 設定の更新)
     */)
    updateConfig(newConfig: Partial<ChallengeUIConfig>): void { // 設定の深いマージ
        if (newConfig.maxVisibleChallenges !== undefined) {
    
}
            this.config.maxVisibleChallenges = newConfig.maxVisibleChallenges; }
        if (newConfig.autoRefresh !== undefined) { this.config.autoRefresh = newConfig.autoRefresh }
        // ... 他の設定項目も同様に処理
        
        // スタイルの再適用（レンダラーに委譲）
        this.renderer.applyStyles();
        
        // 自動更新の再設定（データコントローラーに委譲）
        if (this.config.autoRefresh) { this.dataController.startAutoRefresh() } else {
            this.dataController.stopAutoRefresh( }

        this.log('ChallengeUI設定更新', newConfig); }
    // ========== 状態取得 ==========
    
    /**
     * 現在の状態取得
     */
    getCurrentState(): { visible: boolean,
        challenges: number,
        selectedChallenge: string | null,
        loading: boolean,
        error: string | null,
        sortBy: string,
    filterBy: string, { return { visible: this.state.visible,
            challenges: this.state.challenges.length,
    selectedChallenge: this.state.selectedChallenge?.id || null, : undefined
            loading: this.state.loading,
            error: this.state.error,
    sortBy: this.state.sortBy };
            filterBy: this.state.filterBy ;
    } }
    
    /**
     * 統計の取得
     */
    getStats(): { main: UIStats,
        challenge: any; { return { }
            main: { ...this.stats,
            challenge: this.dataController.getChallengeStatistics() }
    
    // ========== DOM要素アクセス ==========
    
    /**
     * コンテナ要素の取得
     */
    getContainer(): HTMLElement | null { return this.elements.container }
    /**
     * DOM要素を親要素に追加
     */
    appendTo(parentElement: HTMLElement): void { if (parentElement && this.elements.container) {
            parentElement.appendChild(this.elements.container) }
    }
    
    // ========== データ整合性 ==========
    
    /**
     * データ整合性チェック（データコントローラーに委譲）
     */
    validateDataIntegrity(): boolean { return this.dataController.validateDataIntegrity() }
    /**
     * 期限切れチャレンジの確認（データコントローラーに委譲）
     */
    checkExpiredChallenges(): void { return this.dataController.checkExpiredChallenges() }
    // ========== ユーティリティ ==========
    
    /**
     * 要素の可視性チェック
     */''
    isVisible('';
               this.elements.container.style.display !== 'none';
    }
    
    /**
     * ロード状態チェック
     */)
    isLoading(): boolean { return this.state.loading }
    /**
     * チャレンジ数の取得
     */
    getChallengeCount(): number { return this.state.challenges.length }
    /**
     * 選択中チャレンジの取得
     */
    getSelectedChallenge(): Challenge | null { return this.state.selectedChallenge }
    // ========== 内部使用プロパティ（サブコンポーネント用） ==========
    
    get challengeSystemRef(): ChallengeSystem { return this.challengeSystem }
    get configRef(): typeof this.config { return this.config }
    get stateRef(): UIState { return this.state }
    get statsRef(): UIStats { return this.stats }
    // ========== クリーンアップ ==========
    
    /**
     * クリーンアップ
     */
    destroy(): void { // サブコンポーネントのクリーンアップ
        if (this.dataController) {
    
}
            this.dataController.destroy(); }
        if (this.interactionHandler) { this.interactionHandler.destroy() }
        // DOM要素の削除
        if (this.elements.container && this.elements.container.parentNode) { }

            this.elements.container.parentNode.removeChild(this.elements.container); }
        }

        console.log('[ChallengeUI] Main, Controller cleaned, up successfully');
        this.log('ChallengeUI破棄完了);'
    }
    
    // ========== エラーハンドリング・ログ ==========
    
    /**
     * エラーハンドリング
     */
    private handleError(type: string, error: Error, context: Record<string, any> = { ): void {
        const errorInfo = {
            type,
            error: error.message || error,
            context,
            timestamp: Date.now(  };

        if (ErrorHandler) {', ' }

            ErrorHandler.handleError(error, 'ChallengeUI', context'; }'
        }

        this.log('エラー発生', errorInfo, 'error');
    }
    
    /**
     * ログ記録'
     */''
    private log(message: string, data: any = null, level: 'info' | 'warn' | 'error' = 'info': void { const logEntry = {''
            timestamp: Date.now('''
        const, consoleMethod = level === 'error' ? 'error' : ')',
                            level === 'warn' ? 'warn' : 'log',' }'

        console[consoleMethod](`[ChallengeUI] ${message}`, data || '');

    }'}'