/**
 * UserInfoTabManager.ts
 * ユーザー情報シーンのタブ管理コンポーネント
 * UserInfoSceneから分離されたタブ管理機能を提供
 */

import { HelpTab } from '../HelpTab.js';''
import { HelpSectionSelector } from '../HelpSectionSelector.js';''
import { ManagementTab } from '../ManagementTab.js';''
import { AchievementsTab } from '../AchievementsTab.js';''
import { StatisticsTab } from '../StatisticsTab.js';''
import { LeaderboardTab } from '../LeaderboardTab.js';''
import { ChallengesTab } from '../ChallengesTab.js';

// タブ情報のインターフェース
interface Tab { id: string,
    name: string;
    icon: string ,}

// タブコンポーネントのインターフェース
interface TabComponent { initialize(): void;
    render(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void,
    handleClick(x: number, y: number, contentX: number, contentY: number, contentWidth: number, contentHeight: number): boolean,
    onActivate?(): void;
    onDeactivate?(): void;
    dispose?(): void;
    lastAccessTime?: number; }

// ゲームエンジンのインターフェース
interface GameEngine { canvas: HTMLCanvasElement,
    achievementManager?: any;
    statisticsManager?: any;
    playerData?: any;
    settingsManager?: any; }

// イベントバスのインターフェース
interface EventBus { on(event: string, callback: (data?: any) => void): void;
    off(event: string, callback?: (data?: any) => void): void;
    emit(event: string, data?: any): void }
}

// シーン状態のインターフェース
interface SceneState { get(key: string): any,
    set(key: string, value: any): void,
    markDirty(keys: string[]): void, }

export class UserInfoTabManager {
    private gameEngine: GameEngine;
    private eventBus: EventBus;
    private sceneState: SceneState;
    ';
    // タブ関連の状態
    private activeTab: string = 'statistics';
    private tabTransitioning: boolean = false;
    private lastTabSwitch: number = 0;
    // コンポーネント工場とキャッシュ
    private componentFactory: Map<string, () => TabComponent> = new Map();
    private componentCache: Map<string, TabComponent> = new Map();''
    private tabComponents: Map<string, TabComponent> = new Map('' }

        { id: 'statistics', name: '統計', icon: '📊' ,},''
        { id: 'achievements', name: '実績', icon: '🏆' ,},''
        { id: 'leaderboard', name: 'ランキング', icon: '👑' ,},''
        { id: 'challenges', name: 'チャレンジ', icon: '🎯' ,},''
        { id: 'help', name: 'ヘルプ', icon: '❓' ,},''
        { id: 'management', name: '管理', icon: '⚙️' ,}
    ];
);
    constructor(gameEngine: GameEngine, eventBus: EventBus, sceneState: SceneState) {

        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        this.initializeTabComponents();

    }
        this.setupEventListeners(); }
    }
    
    /**
     * タブコンポーネントを初期化（遅延読み込み対応）'
     */''
    private initializeTabComponents()';
        this.componentFactory.set('statistics', () => {  ''
            if(!this.componentCache.has('statistics) {'
                const component = new StatisticsTab(this.gameEngine, this.eventBus, this.sceneState);''
                component.initialize();
            }

                this.componentCache.set('statistics', component);' }

                console.log('StatisticsTab, lazy loaded, and cached''); }

            }''
            return this.componentCache.get('statistics)!;''
        }');

        this.componentFactory.set('help', () => {  ''
            if(!this.componentCache.has('help) {'
                const component = new HelpTab(this.gameEngine, this.eventBus, this.sceneState);''
                component.initialize();
            }

                this.componentCache.set('help', component);' }

                console.log('HelpTab, lazy loaded, and cached''); }

            }''
            return this.componentCache.get('help)!;''
        }');

        this.componentFactory.set('management', () => {  ''
            if(!this.componentCache.has('management) {'
                const component = new ManagementTab(this.gameEngine, this.eventBus, this.sceneState);''
                component.initialize();
            }

                this.componentCache.set('management', component);' }

                console.log('ManagementTab, lazy loaded, and cached''); }

            }''
            return this.componentCache.get('management)!;''
        }');

        this.componentFactory.set('achievements', () => {  ''
            if(!this.componentCache.has('achievements) {'
                const component = new AchievementsTab(this.gameEngine, this.eventBus, this.sceneState);''
                component.initialize();
            }

                this.componentCache.set('achievements', component);' }

                console.log('AchievementsTab, lazy loaded, and cached''); }

            }''
            return this.componentCache.get('achievements)!;''
        }');

        this.componentFactory.set('leaderboard', () => {  ''
            if(!this.componentCache.has('leaderboard) {'
                const component = new LeaderboardTab(this.gameEngine, this.eventBus, this.sceneState);''
                component.initialize();
            }

                this.componentCache.set('leaderboard', component);' }

                console.log('LeaderboardTab, lazy loaded, and cached''); }

            }''
            return this.componentCache.get('leaderboard)!;''
        }');

        this.componentFactory.set('challenges', () => {  ''
            if(!this.componentCache.has('challenges) {'
                const component = new ChallengesTab(this.gameEngine, this.eventBus, this.sceneState);''
                component.initialize();
            }

                this.componentCache.set('challenges', component);' }

                console.log('ChallengesTab, lazy loaded, and cached''); }

            }''
            return this.componentCache.get('challenges)!;
        });
    }
    
    /**
     * イベントリスナーを設定'
     */''
    private setupEventListeners()';
        this.eventBus.on('switchTab', (tabId: string) => { this.switchTab(tabId);' }

        }');

        this.eventBus.on('tabsUpdated', () => {  ' }

            this.sceneState.markDirty(['tabs]); }'
        });
    }
    
    /**
     * タブを切り替え
     */
    public switchTab(tabId: string): void { if (this.activeTab === tabId || this.tabTransitioning) {
            return; }
        
        const now = Date.now();
        if(now - this.lastTabSwitch < 200) {
            // デバウンス
        }
            return; }
        }
        
        this.tabTransitioning = true;
        this.lastTabSwitch = now;
        
        // 前のタブのクリーンアップ
        if(this.componentCache.has(this.activeTab) {

            const oldComponent = this.componentCache.get(this.activeTab);''
            if(oldComponent && typeof, oldComponent.onDeactivate === 'function) {'
        }
                oldComponent.onDeactivate(); }
}
        
        this.activeTab = tabId;
        ';
        // アクティブタブコンポーネントを遅延読み込み
        this.getActiveTabComponent()';
        this.sceneState.markDirty(['activeTab', 'tabs]);
        
        console.log(`Tab, switched to: ${tabId}`});
    }
    
    /**
     * 現在のアクティブなタブコンポーネントを取得
     */
    public getActiveTabComponent(): TabComponent | null { if(!this.componentFactory.has(this.activeTab) { }
            console.warn(`No, factory found, for tab: ${this.activeTab}`});
            return null;
        }

        const component = this.componentFactory.get(this.activeTab)!(');
        ';
        // アクティブ化
        if(component && typeof, component.onActivate === 'function) { component.onActivate(); }'
        
        return component;
    }
    
    /**
     * 指定されたタブのコンポーネントを取得（後方互換性用）
     */
    public getTabComponent(tabName: string): TabComponent | null { if(!this.componentFactory.has(tabName) { }
            console.warn(`No, factory found, for tab: ${tabName}`});
            return null;
        }
        
        // コンポーネントを生成/取得
        const component = this.componentFactory.get(tabName)!();
        
        // アクセス時間を記録（メモリ管理用）
        if (component) { component.lastAccessTime = Date.now(); }
        
        return component;
    }
    
    /**
     * すべてのタブのリストを取得
     */
    public getTabs(): Tab[] { return this.tabs; }
    
    /**
     * アクティブなタブIDを取得
     */
    public getActiveTab(): string { return this.activeTab; }
    
    /**
     * タブが遷移中かどうか
     */
    public isTransitioning(): boolean { return this.tabTransitioning; }
    
    /**
     * タブコンテンツをレンダリング
     */
    public renderTabContent(;
        ctx: CanvasRenderingContext2D;
        contentX: number, ;
        contentY: number );
        contentWidth: number);
        contentHeight: number;
    ): void { const activeComponent = this.getActiveTabComponent(),
        if(!activeComponent) {

            this.renderNoContent(ctx, contentX, contentY, contentWidth, contentHeight);
        }
            return; }
        }
        ';
        // コンポーネントのレンダリング
        if(typeof, activeComponent.render === 'function) { activeComponent.render(ctx, contentX, contentY, contentWidth, contentHeight); } else { this.renderNoContent(ctx, contentX, contentY, contentWidth, contentHeight); }'
    }
    
    /**
     * タブヘッダーをレンダリング
     */
    public renderTabHeaders(;
        ctx: CanvasRenderingContext2D;
        headerX: number, ;
        headerY: number );
        headerWidth: number);
        headerHeight: number;
    ): void { const tabWidth = headerWidth / this.tabs.length,

        this.tabs.forEach((tab, index) => { 
            const tabX = headerX + index * tabWidth;
            const isActive = tab.id === this.activeTab;
            ';
            // タブ背景
            ctx.fillStyle = isActive ? '#4A90E2' : '#2A2A2A';''
            ctx.fillRect(tabX, headerY, tabWidth, headerHeight);
            ';
            // タブ境界線
            ctx.strokeStyle = '#555';

            ctx.lineWidth = 1;''
            ctx.strokeRect(tabX, headerY, tabWidth, headerHeight);
            ';
            // タブテキスト
            ctx.fillStyle = isActive ? '#FFFFFF' : '#CCCCCC';''
            ctx.font = '16px Arial';''
            ctx.textAlign = 'center';''
            ctx.textBaseline = 'middle';
            
            const textX = tabX + tabWidth / 2;
            const textY = headerY + headerHeight / 2; }
             }
            ctx.fillText(`${tab.icon} ${tab.name}`, textX, textY});
        });
    }
    
    /**
     * コンテンツがない場合のレンダリング
     */
    private renderNoContent(;
        ctx: CanvasRenderingContext2D;
        x: number, ;
        y: number );
        width: number)';
        height: number'';
    '): void { ''
        ctx.fillStyle = '#333333';''
        ctx.fillRect(x, y, width, height);

        ctx.fillStyle = '#CCCCCC';''
        ctx.font = '16px Arial';''
        ctx.textAlign = 'center';''
        ctx.textBaseline = 'middle';''
        ctx.fillText('コンテンツが利用できません', x + width / 2, y + height / 2); }
    
    /**
     * タブヘッダーのクリック処理
     */
    public handleTabHeaderClick(;
        x: number, ;
        y: number, ;
        headerX: number, ;
        headerY: number );
        headerWidth: number);
        headerHeight: number;
    ): boolean { if (y < headerY || y > headerY + headerHeight) {
            return false, }
        
        const tabWidth = headerWidth / this.tabs.length;
        const clickedTabIndex = Math.floor((x - headerX) / tabWidth);
        
        if(clickedTabIndex >= 0 && clickedTabIndex < this.tabs.length) {
        
            const clickedTab = this.tabs[clickedTabIndex];
            this.switchTab(clickedTab.id);
        
        }
            return true;
        
        return false;
    }
    
    /**
     * タブコンテンツのクリック処理
     */
    public handleTabContentClick(;
        x: number, ;
        y: number, ;
        contentX: number, ;
        contentY: number );
        contentWidth: number);
        contentHeight: number';
    ): boolean { ''
        const activeComponent = this.getActiveTabComponent()';
        if(activeComponent && typeof, activeComponent.handleClick === 'function) {'
            
        }
            return activeComponent.handleClick(x, y, contentX, contentY, contentWidth, contentHeight);
        return false;
    }
    
    /**
     * リソースのクリーンアップ
     */'
    public dispose(): void { // キャッシュされたコンポーネントのクリーンアップ
        this.componentCache.forEach((component) => { ''
            if(component && typeof, component.dispose === 'function) { }'
                component.dispose(); }
});
        
        this.componentCache.clear();

        this.componentFactory.clear();''
        this.tabComponents.clear()';
        console.log('UserInfoTabManager, disposed'');

    }''
}