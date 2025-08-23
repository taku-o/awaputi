/**
 * UserInfoTabManager.ts
 * ユーザー情報シーンのタブ管理コンポーネント
 * UserInfoSceneから分離されたタブ管理機能を提供
 */

import { HelpTab } from '../HelpTab.js';
import { HelpSectionSelector } from '../HelpSectionSelector.js';
import { ManagementTab } from '../ManagementTab.js';
import { AchievementsTab } from '../AchievementsTab.js';
import { StatisticsTab } from '../StatisticsTab.js';
import { LeaderboardTab } from '../LeaderboardTab.js';
import { ChallengesTab } from '../ChallengesTab.js';

// タブ情報のインターフェース
interface Tab {
    id: string;
    name: string;
    icon: string;
}

// タブコンポーネントのインターフェース
interface TabComponent {
    initialize(): void;
    render(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void;
    handleClick(x: number, y: number, contentX: number, contentY: number, contentWidth: number, contentHeight: number): boolean;
    onActivate?(): void;
    onDeactivate?(): void;
    dispose?(): void;
    lastAccessTime?: number;
}

// ゲームエンジンのインターフェース
interface GameEngine {
    canvas: HTMLCanvasElement;
    achievementManager?: any;
    statisticsManager?: any;
    playerData?: any;
    settingsManager?: any;
}

// イベントバスのインターフェース
interface EventBus {
    on(event: string, callback: (data?: any) => void): void;
    off(event: string, callback?: (data?: any) => void): void;
    emit(event: string, data?: any): void;
}

// シーン状態のインターフェース
interface SceneState {
    get(key: string): any;
    set(key: string, value: any): void;
    markDirty(keys: string[]): void;
}

export class UserInfoTabManager {
    private gameEngine: GameEngine;
    private eventBus: EventBus;
    private sceneState: SceneState;
    
    // タブ関連の状態
    private activeTab: string = 'statistics';
    private tabTransitioning: boolean = false;
    private lastTabSwitch: number = 0;
    
    // コンポーネント工場とキャッシュ
    private componentFactory: Map<string, () => TabComponent> = new Map();
    private componentCache: Map<string, TabComponent> = new Map();
    private tabComponents: Map<string, TabComponent> = new Map();

    // タブ定義
    private readonly tabs: Tab[] = [
        { id: 'statistics', name: '統計', icon: '📊' },
        { id: 'achievements', name: '実績', icon: '🏆' },
        { id: 'leaderboard', name: 'ランキング', icon: '👑' },
        { id: 'challenges', name: 'チャレンジ', icon: '🎯' },
        { id: 'help', name: 'ヘルプ', icon: '❓' },
        { id: 'management', name: '管理', icon: '⚙️' }
    ];

    constructor(gameEngine: GameEngine, eventBus: EventBus, sceneState: SceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        this.initializeTabComponents();
        this.setupEventListeners();
    }
    
    /**
     * タブコンポーネントを初期化（遅延読み込み対応）
     */
    private initializeTabComponents(): void {
        this.componentFactory.set('statistics', () => {
            if (!this.componentCache.has('statistics')) {
                const component = new StatisticsTab(this.gameEngine, this.eventBus, this.sceneState);
                component.initialize();
                this.componentCache.set('statistics', component);
                console.log('StatisticsTab lazy loaded and cached');
            }
            return this.componentCache.get('statistics')!;
        });

        this.componentFactory.set('help', () => {
            if (!this.componentCache.has('help')) {
                const component = new HelpTab(this.gameEngine, this.eventBus, this.sceneState);
                component.initialize();
                this.componentCache.set('help', component);
                console.log('HelpTab lazy loaded and cached');
            }
            return this.componentCache.get('help')!;
        });

        this.componentFactory.set('management', () => {
            if (!this.componentCache.has('management')) {
                const component = new ManagementTab(this.gameEngine, this.eventBus, this.sceneState);
                component.initialize();
                this.componentCache.set('management', component);
                console.log('ManagementTab lazy loaded and cached');
            }
            return this.componentCache.get('management')!;
        });

        this.componentFactory.set('achievements', () => {
            if (!this.componentCache.has('achievements')) {
                const component = new AchievementsTab(this.gameEngine, this.eventBus, this.sceneState);
                component.initialize();
                this.componentCache.set('achievements', component);
                console.log('AchievementsTab lazy loaded and cached');
            }
            return this.componentCache.get('achievements')!;
        });

        this.componentFactory.set('leaderboard', () => {
            if (!this.componentCache.has('leaderboard')) {
                const component = new LeaderboardTab(this.gameEngine, this.eventBus, this.sceneState);
                component.initialize();
                this.componentCache.set('leaderboard', component);
                console.log('LeaderboardTab lazy loaded and cached');
            }
            return this.componentCache.get('leaderboard')!;
        });

        this.componentFactory.set('challenges', () => {
            if (!this.componentCache.has('challenges')) {
                const component = new ChallengesTab(this.gameEngine, this.eventBus, this.sceneState);
                component.initialize();
                this.componentCache.set('challenges', component);
                console.log('ChallengesTab lazy loaded and cached');
            }
            return this.componentCache.get('challenges')!;
        });

        // 初期アクティブタブのロード
        this.loadTabComponent(this.activeTab);
    }
    
    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void {
        this.eventBus.on('tab-switch-requested', (data: { tabId: string }) => {
            this.switchTab(data.tabId);
        });

        this.eventBus.on('tab-refresh-requested', (data: { tabId?: string }) => {
            const tabId = data.tabId || this.activeTab;
            this.refreshTabComponent(tabId);
        });

        this.eventBus.on('user-data-updated', () => {
            // データが更新されたら関連タブをリフレッシュ
            ['statistics', 'achievements'].forEach(tabId => {
                if (this.componentCache.has(tabId)) {
                    this.refreshTabComponent(tabId);
                }
            });
        });
    }
    
    /**
     * タブの切り替え
     */
    public switchTab(tabId: string): boolean {
        if (!this.isValidTab(tabId)) {
            console.warn(`Invalid tab ID: ${tabId}`);
            return false;
        }

        if (this.activeTab === tabId) {
            return true; // 既にアクティブ
        }

        if (this.tabTransitioning) {
            console.log('Tab transition in progress, ignoring request');
            return false;
        }

        const now = Date.now();
        if (now - this.lastTabSwitch < 150) {
            console.log('Tab switching debounced');
            return false;
        }

        this.tabTransitioning = true;
        this.lastTabSwitch = now;

        try {
            // 旧タブの非アクティブ化
            const oldComponent = this.getActiveTabComponent();
            if (oldComponent && oldComponent.onDeactivate) {
                oldComponent.onDeactivate();
            }

            // 新タブの読み込みとアクティブ化
            const newComponent = this.loadTabComponent(tabId);
            if (newComponent && newComponent.onActivate) {
                newComponent.onActivate();
            }

            this.activeTab = tabId;
            this.sceneState.set('activeTab', tabId);
            
            // 最終アクセス時間の更新
            if (newComponent) {
                newComponent.lastAccessTime = now;
            }

            this.eventBus.emit('tab-switched', {
                previousTab: oldComponent ? this.getPreviousTabId() : null,
                currentTab: tabId,
                component: newComponent
            });

            console.log(`Switched to tab: ${tabId}`);
            return true;
        } catch (error) {
            console.error('Error switching tabs:', error);
            return false;
        } finally {
            this.tabTransitioning = false;
        }
    }
    
    /**
     * タブコンポーネントの読み込み
     */
    private loadTabComponent(tabId: string): TabComponent | null {
        try {
            const factory = this.componentFactory.get(tabId);
            if (!factory) {
                console.error(`No factory found for tab: ${tabId}`);
                return null;
            }

            const component = factory();
            this.tabComponents.set(tabId, component);
            return component;
        } catch (error) {
            console.error(`Error loading tab component ${tabId}:`, error);
            return null;
        }
    }
    
    /**
     * タブコンポーネントのリフレッシュ
     */
    private refreshTabComponent(tabId: string): void {
        if (this.componentCache.has(tabId)) {
            // キャッシュをクリアして再読み込み
            const component = this.componentCache.get(tabId);
            if (component && component.dispose) {
                component.dispose();
            }
            this.componentCache.delete(tabId);
            
            if (tabId === this.activeTab) {
                this.loadTabComponent(tabId);
            }
        }
    }
    
    /**
     * アクティブなタブコンポーネントの取得
     */
    public getActiveTabComponent(): TabComponent | null {
        return this.tabComponents.get(this.activeTab) || null;
    }
    
    /**
     * 指定されたタブコンポーネントの取得
     */
    public getTabComponent(tabId: string): TabComponent | null {
        if (!this.isValidTab(tabId)) {
            return null;
        }
        
        return this.tabComponents.get(tabId) || this.loadTabComponent(tabId);
    }
    
    /**
     * アクティブタブのレンダリング
     */
    public renderActiveTab(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        const component = this.getActiveTabComponent();
        if (component) {
            try {
                component.render(ctx, x, y, width, height);
            } catch (error) {
                console.error(`Error rendering active tab ${this.activeTab}:`, error);
                this.renderErrorMessage(ctx, x, y, width, height, 'タブの表示中にエラーが発生しました');
            }
        } else {
            this.renderErrorMessage(ctx, x, y, width, height, 'タブが読み込まれていません');
        }
    }
    
    /**
     * タブヘッダーの描画
     */
    public renderTabHeaders(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        const tabWidth = width / this.tabs.length;
        
        for (let i = 0; i < this.tabs.length; i++) {
            const tab = this.tabs[i];
            const tabX = x + i * tabWidth;
            const isActive = tab.id === this.activeTab;
            
            this.renderTabHeader(ctx, tab, tabX, y, tabWidth, height, isActive);
        }
    }
    
    /**
     * 個別タブヘッダーの描画
     */
    private renderTabHeader(ctx: CanvasRenderingContext2D, tab: Tab, x: number, y: number, width: number, height: number, isActive: boolean): void {
        // タブ背景
        ctx.fillStyle = isActive ? '#4a4a6a' : '#2a2a4a';
        ctx.fillRect(x, y, width, height);
        
        // タブ枠線
        ctx.strokeStyle = isActive ? '#6a6a8a' : '#4a4a6a';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // アイコン
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isActive ? '#ffffff' : '#cccccc';
        ctx.fillText(tab.icon, x + width / 2, y + height / 2 - 8);
        
        // タブ名
        ctx.font = '12px Arial';
        ctx.fillText(tab.name, x + width / 2, y + height / 2 + 8);
    }
    
    /**
     * タブコンテンツのクリック処理
     */
    public handleTabContentClick(x: number, y: number, contentX: number, contentY: number, contentWidth: number, contentHeight: number): boolean {
        const component = this.getActiveTabComponent();
        if (component) {
            try {
                return component.handleClick(x, y, contentX, contentY, contentWidth, contentHeight);
            } catch (error) {
                console.error(`Error handling click in tab ${this.activeTab}:`, error);
                return false;
            }
        }
        return false;
    }
    
    /**
     * タブヘッダーのクリック処理
     */
    public handleTabHeaderClick(x: number, y: number, headerX: number, headerY: number, headerWidth: number, headerHeight: number): boolean {
        if (y < headerY || y > headerY + headerHeight) {
            return false;
        }
        
        const tabWidth = headerWidth / this.tabs.length;
        const clickedTabIndex = Math.floor((x - headerX) / tabWidth);
        
        if (clickedTabIndex >= 0 && clickedTabIndex < this.tabs.length) {
            const clickedTab = this.tabs[clickedTabIndex];
            return this.switchTab(clickedTab.id);
        }
        
        return false;
    }
    
    /**
     * エラーメッセージの描画
     */
    private renderErrorMessage(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, message: string): void {
        ctx.fillStyle = '#ff6666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, x + width / 2, y + height / 2);
    }
    
    /**
     * 有効なタブIDかチェック
     */
    private isValidTab(tabId: string): boolean {
        return this.tabs.some(tab => tab.id === tabId);
    }
    
    /**
     * 前のタブIDを取得（履歴管理用）
     */
    private getPreviousTabId(): string | null {
        // 簡単な実装：シーン状態から取得
        return this.sceneState.get('previousTab') || null;
    }
    
    /**
     * 利用可能なタブの一覧を取得
     */
    public getAvailableTabs(): Tab[] {
        return [...this.tabs];
    }
    
    /**
     * 現在アクティブなタブIDを取得
     */
    public getActiveTabId(): string {
        return this.activeTab;
    }
    
    /**
     * タブの使用統計を取得
     */
    public getTabUsageStats(): { [tabId: string]: { accessCount: number; lastAccessTime: number } } {
        const stats: { [tabId: string]: { accessCount: number; lastAccessTime: number } } = {};
        
        this.componentCache.forEach((component, tabId) => {
            stats[tabId] = {
                accessCount: this.sceneState.get(`tabAccessCount_${tabId}`) || 0,
                lastAccessTime: component.lastAccessTime || 0
            };
        });
        
        return stats;
    }
    
    /**
     * リソースの解放
     */
    public dispose(): void {
        // 全コンポーネントの解放
        this.componentCache.forEach((component, tabId) => {
            if (component.dispose) {
                try {
                    component.dispose();
                } catch (error) {
                    console.error(`Error disposing tab component ${tabId}:`, error);
                }
            }
        });
        
        // キャッシュのクリア
        this.componentCache.clear();
        this.componentFactory.clear();
        this.tabComponents.clear();
        
        console.log('UserInfoTabManager disposed');
    }
}