/**
 * UserInfoTabManager.js
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

export class UserInfoTabManager {
    constructor(gameEngine, eventBus, sceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        // タブ関連の状態
        this.activeTab = 'statistics';
        this.tabTransitioning = false;
        this.lastTabSwitch = 0;
        
        // コンポーネント工場とキャッシュ
        this.componentFactory = new Map();
        this.componentCache = new Map();
        this.tabComponents = new Map();
        
        this.initializeTabComponents();
        this.setupEventListeners();
    }
    
    /**
     * タブコンポーネントを初期化（遅延読み込み対応）
     */
    initializeTabComponents() {
        // コンポーネント工場を登録（遅延読み込み用）
        this.componentFactory.set('statistics', () => {
            if (!this.componentCache.has('statistics')) {
                const component = new StatisticsTab(this.gameEngine, this.eventBus, this.sceneState);
                component.initialize();
                this.componentCache.set('statistics', component);
                console.log('StatisticsTab lazy loaded and cached');
            }
            return this.componentCache.get('statistics');
        });
        
        this.componentFactory.set('help', () => {
            if (!this.componentCache.has('help')) {
                const component = new HelpTab(this.gameEngine, this.eventBus, this.sceneState);
                component.initialize();
                this.componentCache.set('help', component);
                console.log('HelpTab lazy loaded and cached');
            }
            return this.componentCache.get('help');
        });
        
        this.componentFactory.set('management', () => {
            if (!this.componentCache.has('management')) {
                const component = new ManagementTab(this.gameEngine, this.eventBus, this.sceneState);
                component.initialize();
                this.componentCache.set('management', component);
                console.log('ManagementTab lazy loaded and cached');
            }
            return this.componentCache.get('management');
        });
        
        this.componentFactory.set('achievements', () => {
            if (!this.componentCache.has('achievements')) {
                const component = new AchievementsTab(this.gameEngine, this.eventBus, this.sceneState);
                component.initialize();
                this.componentCache.set('achievements', component);
                console.log('AchievementsTab lazy loaded and cached');
            }
            return this.componentCache.get('achievements');
        });
        
        this.componentFactory.set('leaderboard', () => {
            if (!this.componentCache.has('leaderboard')) {
                const component = new LeaderboardTab(this.gameEngine, this.eventBus, this.sceneState);
                component.initialize();
                this.componentCache.set('leaderboard', component);
                console.log('LeaderboardTab lazy loaded and cached');
            }
            return this.componentCache.get('leaderboard');
        });
        
        this.componentFactory.set('challenges', () => {
            if (!this.componentCache.has('challenges')) {
                const component = new ChallengesTab(this.gameEngine, this.eventBus, this.sceneState);
                component.initialize();
                this.componentCache.set('challenges', component);
                console.log('ChallengesTab lazy loaded and cached');
            }
            return this.componentCache.get('challenges');
        });
        
        // タブのメタデータ
        this.tabs = [
            { id: 'statistics', name: '統計', icon: '📊' },
            { id: 'achievements', name: '実績', icon: '🏆' },
            { id: 'leaderboard', name: 'ランキング', icon: '👑' },
            { id: 'challenges', name: 'チャレンジ', icon: '🎯' },
            { id: 'help', name: 'ヘルプ', icon: '❓' },
            { id: 'management', name: '管理', icon: '⚙️' }
        ];
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        this.eventBus.on('switchTab', (tabId) => {
            this.switchTab(tabId);
        });
        
        this.eventBus.on('tabsUpdated', () => {
            this.sceneState.markDirty(['tabs']);
        });
    }
    
    /**
     * タブを切り替え
     */
    switchTab(tabId) {
        if (this.activeTab === tabId || this.tabTransitioning) {
            return;
        }
        
        const now = Date.now();
        if (now - this.lastTabSwitch < 200) { // デバウンス
            return;
        }
        
        this.tabTransitioning = true;
        this.lastTabSwitch = now;
        
        // 前のタブのクリーンアップ
        if (this.componentCache.has(this.activeTab)) {
            const oldComponent = this.componentCache.get(this.activeTab);
            if (oldComponent && typeof oldComponent.onDeactivate === 'function') {
                oldComponent.onDeactivate();
            }
        }
        
        this.activeTab = tabId;
        
        // アクティブタブコンポーネントを遅延読み込み
        this.getActiveTabComponent();
        
        this.tabTransitioning = false;
        this.sceneState.markDirty(['activeTab', 'tabs']);
        
        console.log(`Tab switched to: ${tabId}`);
    }
    
    /**
     * 現在のアクティブなタブコンポーネントを取得
     */
    getActiveTabComponent() {
        if (!this.componentFactory.has(this.activeTab)) {
            console.warn(`No factory found for tab: ${this.activeTab}`);
            return null;
        }
        
        const component = this.componentFactory.get(this.activeTab)();
        
        // アクティブ化
        if (component && typeof component.onActivate === 'function') {
            component.onActivate();
        }
        
        return component;
    }
    
    /**
     * すべてのタブのリストを取得
     */
    getTabs() {
        return this.tabs;
    }
    
    /**
     * アクティブなタブIDを取得
     */
    getActiveTab() {
        return this.activeTab;
    }
    
    /**
     * タブが遷移中かどうか
     */
    isTransitioning() {
        return this.tabTransitioning;
    }
    
    /**
     * タブコンテンツをレンダリング
     */
    renderTabContent(ctx, contentX, contentY, contentWidth, contentHeight) {
        const activeComponent = this.getActiveTabComponent();
        if (!activeComponent) {
            this.renderNoContent(ctx, contentX, contentY, contentWidth, contentHeight);
            return;
        }
        
        // コンポーネントのレンダリング
        if (typeof activeComponent.render === 'function') {
            activeComponent.render(ctx, contentX, contentY, contentWidth, contentHeight);
        } else {
            this.renderNoContent(ctx, contentX, contentY, contentWidth, contentHeight);
        }
    }
    
    /**
     * タブヘッダーをレンダリング
     */
    renderTabHeaders(ctx, headerX, headerY, headerWidth, headerHeight) {
        const tabWidth = headerWidth / this.tabs.length;
        
        this.tabs.forEach((tab, index) => {
            const tabX = headerX + index * tabWidth;
            const isActive = tab.id === this.activeTab;
            
            // タブ背景
            ctx.fillStyle = isActive ? '#4A90E2' : '#2A2A2A';
            ctx.fillRect(tabX, headerY, tabWidth, headerHeight);
            
            // タブ境界線
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 1;
            ctx.strokeRect(tabX, headerY, tabWidth, headerHeight);
            
            // タブテキスト
            ctx.fillStyle = isActive ? '#FFFFFF' : '#CCCCCC';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const textX = tabX + tabWidth / 2;
            const textY = headerY + headerHeight / 2;
            
            ctx.fillText(`${tab.icon} ${tab.name}`, textX, textY);
        });
    }
    
    /**
     * コンテンツがない場合のレンダリング
     */
    renderNoContent(ctx, x, y, width, height) {
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, width, height);
        
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('コンテンツが利用できません', x + width / 2, y + height / 2);
    }
    
    /**
     * タブヘッダーのクリック処理
     */
    handleTabHeaderClick(x, y, headerX, headerY, headerWidth, headerHeight) {
        if (y < headerY || y > headerY + headerHeight) {
            return false;
        }
        
        const tabWidth = headerWidth / this.tabs.length;
        const clickedTabIndex = Math.floor((x - headerX) / tabWidth);
        
        if (clickedTabIndex >= 0 && clickedTabIndex < this.tabs.length) {
            const clickedTab = this.tabs[clickedTabIndex];
            this.switchTab(clickedTab.id);
            return true;
        }
        
        return false;
    }
    
    /**
     * タブコンテンツのクリック処理
     */
    handleTabContentClick(x, y, contentX, contentY, contentWidth, contentHeight) {
        const activeComponent = this.getActiveTabComponent();
        if (activeComponent && typeof activeComponent.handleClick === 'function') {
            return activeComponent.handleClick(x, y, contentX, contentY, contentWidth, contentHeight);
        }
        return false;
    }
    
    /**
     * リソースのクリーンアップ
     */
    dispose() {
        // キャッシュされたコンポーネントのクリーンアップ
        this.componentCache.forEach((component) => {
            if (component && typeof component.dispose === 'function') {
                component.dispose();
            }
        });
        
        this.componentCache.clear();
        this.componentFactory.clear();
        this.tabComponents.clear();
        
        console.log('UserInfoTabManager disposed');
    }
}