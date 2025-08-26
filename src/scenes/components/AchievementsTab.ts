/**
 * 実績タブコンポーネント
 * UserInfoSceneの実績表示機能を担当
 */
import { TabComponent } from './TabComponent';
import { GameEngine } from '../../core/GameEngine';
import { ComponentEventBus } from './ComponentEventBus';
import { SceneState } from './SceneState';

interface Achievement { 
    id: string;
    name: string;
    description: string;
    category: string;
    unlocked: boolean;
    icon?: string;
    reward?: {
        ap?: number;
    };
    progress?: { 
        current: number;
        target: number;
    };
    unlockedDate?: string;
}

interface TextSettings { 
    font: string;
    textColor: string;
    activeTextColor: string;
    backgroundColor: string;
    activeBackgroundColor: string;
    borderColor: string;
    activeBorderColor: string;
}

export class AchievementsTab extends TabComponent { 
    // サブコンポーネント
    private categoryFilter: AchievementCategoryFilter | null = null;
    private progressRenderer: AchievementProgressRenderer | null = null;
    private achievementsRenderer: AchievementsRenderer | null = null;
    
    // データ
    private achievementsData: Achievement[] | null = null;
    private filteredAchievements: Achievement[] | null = null;
    private unlockedAchievements: Achievement[] = [];
    private progressAchievements: Achievement[] = [];
    private lastDataUpdate: number = 0;
    
    // UI状態
    private scrollPosition: number = 0;
    private maxScrollPosition: number = 0;
    private currentCategory: string = 'all';
    
    // レイアウト設定
    private readonly contentPadding: number = 20;
    private readonly sectionSpacing: number = 20;
    private readonly achievementHeight: number = 80;
    private readonly achievementSpacing: number = 10;
    
    // フィルター設定
    private readonly categories: string[] = ['all', 'score', 'play', 'technique', 'collection', 'special'];
    private readonly categoryLabels: string[] = ['全て', 'スコア系', 'プレイ系', 'テクニック系', 'コレクション系', '特殊系'];
    
    constructor(gameEngine: GameEngine, eventBus: ComponentEventBus, state: SceneState) {
        super(gameEngine, eventBus, state);
    }
    
    /**
     * コンポーネントの初期化
     */
    initialize(): void { 
        super.initialize();
        
        // サブコンポーネントを初期化
        this.categoryFilter = new AchievementCategoryFilter(this.gameEngine, this.eventBus, this.state);
        this.progressRenderer = new AchievementProgressRenderer(this.gameEngine, this.eventBus, this.state);
        this.achievementsRenderer = new AchievementsRenderer(this.gameEngine, this.eventBus, this.state);
        
        this.categoryFilter.initialize();
        this.progressRenderer.initialize();
        this.achievementsRenderer.initialize();
        
        // イベントリスナーを設定
        this.setupEventListeners();
        
        // 初期データを読み込み
        this.loadAchievementsData();
    }
    
    /**
     * イベントリスナーを設定
     */
    private setupEventListeners(): void {
        this.eventBus.on('achievement-category-changed', (data: { category: string }) => { 
            this.currentCategory = data.category;
            this.scrollPosition = 0; // スクロール位置をリセット
            this.updateFilteredAchievements();
        });
        
        // 実績データ更新
        this.eventBus.on('achievements-data-updated', (data: { achievements: Achievement[] }) => {  
            this.achievementsData = data.achievements;
            this.updateFilteredAchievements();
        });
        
        // エラーハンドリング
        this.eventBus.on('component-error', (error: Error) => {
            console.error('AchievementsTab error:', error);
        });
    }
    
    /**
     * 実績データを読み込み
     */
    private loadAchievementsData(): void { 
        try {
            const achievementManager = (this.gameEngine as any).achievementManager;
            if (achievementManager) {
                this.achievementsData = achievementManager.getAchievements();
                this.updateFilteredAchievements();
            }
            
            this.lastDataUpdate = Date.now();
        } catch (error) {
            console.error('Failed to load achievements data:', error);
            this.achievementsData = [];
            this.filteredAchievements = [];
        }
    }
    
    /**
     * フィルターされた実績データを更新
     */
    private updateFilteredAchievements(): void {
        if(!this.achievementsData || !Array.isArray(this.achievementsData)) {
            this.filteredAchievements = [];
            return;
        }

        if(this.currentCategory === 'all') { 
            this.filteredAchievements = [...this.achievementsData];
        } else {  
            this.filteredAchievements = this.achievementsData.filter(
                achievement => achievement.category === this.currentCategory
            );
        }
        
        // 解除済みと未解除で分類
        this.unlockedAchievements = this.filteredAchievements.filter(a => a.unlocked);
        this.progressAchievements = this.filteredAchievements.filter(a => !a.unlocked);
    }
    
    /**
     * レンダリング処理
     */
    render(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void { 
        try {
            if (!this.isActive) return;
            
            // 背景を描画
            this.renderBackground(context, x, y, width, height);
            
            // データを定期更新
            this.updateDataIfNeeded();
            let currentY = y;
            
            // カテゴリフィルターを描画
            const filterHeight = this.categoryFilter!.render(
                context,
                x,
                currentY,
                width,
                this.currentCategory,
                this.categories,
                this.categoryLabels
            );
            currentY += filterHeight + 10;
            
            // 実績コンテンツを描画
            const contentHeight = height - (currentY - y) - 20;
            this.renderAchievementsContent(context, x, currentY, width, contentHeight);
            
            // スクロールバーを描画
            this.renderScrollbar(context, x + width - 16, currentY, 16, contentHeight);
        } catch (error) { 
            this.renderErrorFallback(context, x, y, width, height, error as Error);
        }
    }
    
    /**
     * 背景を描画
     */
    private renderBackground(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#F8F9FA';
        context.fillRect(x, y, width, height);
        context.strokeStyle = this.accessibilitySettings.highContrast ? '#000000' : '#DEE2E6';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height);
    }
    
    /**
     * 実績コンテンツを描画
     */
    private renderAchievementsContent(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void { 
        const contentX = x + this.contentPadding;
        const contentWidth = width - this.contentPadding * 2 - 20; // スクロールバー分を除く
        let currentY = y + this.contentPadding - this.scrollPosition;
        
        // 実績データが存在しない場合
        if (!this.filteredAchievements || this.filteredAchievements.length === 0) {
            this.renderNoAchievementsMessage(context, contentX, currentY, contentWidth);
            return;
        }
        
        // 解除済み実績セクション
        if (this.unlockedAchievements && this.unlockedAchievements.length > 0) {
            const unlockedHeight = this.achievementsRenderer!.renderUnlockedSection(
                context,
                contentX,
                currentY,
                contentWidth,
                this.unlockedAchievements
            );
            currentY += unlockedHeight + this.sectionSpacing;
        }
        
        // 進行中実績セクション
        if (this.progressAchievements && this.progressAchievements.length > 0) {
            const progressHeight = this.achievementsRenderer!.renderProgressSection(
                context,
                contentX,
                currentY,
                contentWidth,
                this.progressAchievements
            );
            currentY += progressHeight;
        }
        
        // スクロール制限を更新
        this.updateScrollLimits(currentY + this.scrollPosition, y + height);
    }
    
    /**
     * 実績データなしメッセージを描画
     */
    private renderNoAchievementsMessage(context: CanvasRenderingContext2D, x: number, y: number, width: number): void {
        context.fillStyle = this.accessibilitySettings.highContrast ? '#000000' : '#6C757D';
        context.font = this.accessibilitySettings.largeText ? '18px sans-serif' : '16px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'top';

        const message = this.currentCategory === 'all' ? 
            '実績データがありません' : 
            `${this.categoryLabels[this.categories.indexOf(this.currentCategory)]}の実績がありません`;
            
        context.fillText(message, x + width / 2, y + 50);
    }
    
    /**
     * データの定期更新
     */
    private updateDataIfNeeded(): void { 
        const now = Date.now();
        if (now - this.lastDataUpdate > 10000) {
            // 10秒間隔
            this.loadAchievementsData();
        }
    }
    
    /**
     * スクロール制限を更新
     */
    private updateScrollLimits(contentHeight: number, viewHeight: number): void { 
        this.maxScrollPosition = Math.max(0, contentHeight - viewHeight + this.contentPadding);
        this.scrollPosition = Math.max(0, Math.min(this.maxScrollPosition, this.scrollPosition));
    }
    
    /**
     * スクロールバーを描画
     */
    private renderScrollbar(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        if(this.maxScrollPosition <= 0) return;
        
        // スクロールバー背景
        context.fillStyle = '#E9ECEF';
        context.fillRect(x, y, width, height);
        
        // スクロールバートラック
        const trackHeight = height * (height / (height + this.maxScrollPosition));
        const trackY = y + (this.scrollPosition / this.maxScrollPosition) * (height - trackHeight);

        context.fillStyle = '#6C757D';
        context.fillRect(x + 2, trackY, width - 4, trackHeight);
        
        // スクロールバー枠線
        context.strokeStyle = '#CED4DA';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height);
    }
    
    /**
     * クリック処理
     */
    handleClick(x: number, y: number): boolean { 
        if (!this.isActive) return false;
        
        // カテゴリフィルターのクリック処理
        if (y <= 50) {
            // フィルターエリア
            return this.categoryFilter!.handleClick(x, y, this.categories, this.categoryLabels);
        }
        
        // 実績アイテムのクリック処理（将来の拡張用）
        
        return false;
    }
    
    /**
     * 入力処理
     */
    handleInput(event: Event): boolean {
        if(!this.isActive) return false;

        if (event.type === 'keydown') {
            const keyEvent = event as KeyboardEvent;
            switch(keyEvent.key) {
                case 'ArrowUp':
                    keyEvent.preventDefault();
                    this.scroll(-30);
                    return true;

                case 'ArrowDown':
                    keyEvent.preventDefault();
                    this.scroll(30);
                    return true;

                case 'PageUp':
                    keyEvent.preventDefault();
                    this.scroll(-200);
                    return true;

                case 'PageDown':
                    keyEvent.preventDefault();
                    this.scroll(200);
                    return true;

                case 'Home':
                    keyEvent.preventDefault();
                    this.scrollPosition = 0;
                    return true;

                case 'End': 
                    keyEvent.preventDefault();
                    this.scrollPosition = this.maxScrollPosition;
                    return true;
            }
        } else if (event.type === 'wheel') { 
            const wheelEvent = event as WheelEvent;
            wheelEvent.preventDefault();
            this.scroll(wheelEvent.deltaY);
            return true;
        }
        
        return false;
    }
    
    /**
     * スクロール処理
     */
    private scroll(delta: number): void { 
        this.scrollPosition = Math.max(0, Math.min(this.maxScrollPosition, this.scrollPosition + delta));
    }
    
    /**
     * フレーム更新処理
     */
    update(deltaTime: number): void { 
        super.update(deltaTime);
        if (this.isActive) {
            // サブコンポーネントの更新
            if (this.categoryFilter) {
                this.categoryFilter.update(deltaTime);
            }
            
            if (this.progressRenderer) { 
                this.progressRenderer.update(deltaTime);
            }
            
            if (this.achievementsRenderer) { 
                this.achievementsRenderer.update(deltaTime);
            }
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void { 
        super.cleanup();
        if (this.categoryFilter) {
            this.categoryFilter.cleanup();
        }
        
        if (this.progressRenderer) { 
            this.progressRenderer.cleanup();
        }
        
        if (this.achievementsRenderer) {
            this.achievementsRenderer.cleanup();
        }
    }
}

/**
 * カテゴリフィルターコンポーネント
 * 実績カテゴリの選択フィルタリング機能を担当
 */
class AchievementCategoryFilter { 
    // private gameEngine: GameEngine;
    private eventBus: ComponentEventBus;
    private state: SceneState;
    
    // UI状態
    private hoveredButton: number = -1;
    
    // レイアウト設定
    private readonly buttonHeight: number = 30;
    private readonly buttonSpacing: number = 5;
    
    // テキスト設定
    private textSettings: TextSettings = {
        font: '12px sans-serif',
        textColor: '#495057',
        activeTextColor: '#FFFFFF',
        backgroundColor: '#F8F9FA',
        activeBackgroundColor: '#007BFF',
        borderColor: '#DEE2E6',
        activeBorderColor: '#0056B3'
    };
    // private isInitialized: boolean = false;
    
    constructor(gameEngine: GameEngine, eventBus: ComponentEventBus, state: SceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
    }
    
    /**
     * 初期化
     */
    initialize(): void { 
        this.applyAccessibilitySettings();
        this.isInitialized = true;
    }
    
    /**
     * アクセシビリティ設定を適用
     */
    private applyAccessibilitySettings(): void {
        const settings = this.state.accessibilitySettings || {};

        if (settings.largeText) {
            this.textSettings.font = '14px sans-serif';
        }

        if (settings.highContrast) {
            this.textSettings.textColor = '#000000';
            this.textSettings.activeTextColor = '#FFFFFF';
            this.textSettings.backgroundColor = '#FFFFFF';
            this.textSettings.activeBackgroundColor = '#000000';
            this.textSettings.borderColor = '#000000';
            this.textSettings.activeBorderColor = '#000000';
        }
    }
    
    /**
     * カテゴリフィルターを描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param currentCategory - 現在のカテゴリ
     * @param categories - カテゴリ一覧
     * @param categoryLabels - カテゴリラベル一覧
     * @returns 描画した高さ
     */
    render(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        currentCategory: string,
        categories: string[],
        categoryLabels: string[]
    ): number { 
        const filterHeight = 40;
        const buttonWidth = 120;
        
        // フィルターの背景
        context.fillStyle = this.textSettings.backgroundColor;
        context.fillRect(x, y, width, filterHeight);
        
        // 境界線
        context.strokeStyle = this.textSettings.borderColor;
        context.lineWidth = 1;
        context.strokeRect(x, y, width, filterHeight);
        
        // フィルターボタンを描画
        let currentX = x + 10;
        const buttonY = y + 5;
        
        for(let i = 0; i < categories.length; i++) {
            const category = categories[i];
            const label = categoryLabels[i];
            const isActive = currentCategory === category;
            const isHovered = this.hoveredButton === i;
            
            this.renderFilterButton(
                context,
                currentX,
                buttonY,
                buttonWidth,
                this.buttonHeight,
                label,
                isActive,
                isHovered
            );
            
            currentX += buttonWidth + this.buttonSpacing;
            
            // 行を超える場合は改行（将来の拡張）
            if (currentX + buttonWidth > x + width - 10) {
                break; // 現在は1行のみ対応
            }
        }
        
        return filterHeight;
    }
    
    /**
     * フィルターボタンを描画
     */
    private renderFilterButton(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        label: string,
        isActive: boolean,
        isHovered: boolean
    ): void { 
        // ボタン背景色を決定
        let backgroundColor = this.textSettings.backgroundColor;
        let textColor = this.textSettings.textColor;
        let borderColor = this.textSettings.borderColor;
        
        if (isActive) {
            backgroundColor = this.textSettings.activeBackgroundColor;
            textColor = this.textSettings.activeTextColor;
            borderColor = this.textSettings.activeBorderColor;
        } else if (isHovered) {
            backgroundColor = '#E9ECEF';
        }
        
        // ボタン背景
        context.fillStyle = backgroundColor;
        context.fillRect(x, y, width, height);
        
        // ボタン枠線
        context.strokeStyle = borderColor;
        context.lineWidth = isActive ? 2 : 1;
        context.strokeRect(x, y, width, height);
        
        // ボタンテキスト
        context.fillStyle = textColor;
        context.font = this.textSettings.font;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(label, x + width / 2, y + height / 2);
    }
    
    /**
     * クリック処理
     * @param x - クリックX座標
     * @param y - クリックY座標
     * @param categories - カテゴリ一覧
     * @param categoryLabels - カテゴリラベル一覧
     * @returns クリックが処理された場合true
     */
    handleClick(x: number, y: number, categories: string[], categoryLabels: string[]): boolean { 
        const buttonWidth = 120;
        const buttonY = 5;
        
        if (y >= buttonY && y <= buttonY + this.buttonHeight) {
            let currentX = 10;
            
            for (let i = 0; i < categories.length; i++) {
                if (x >= currentX && x <= currentX + buttonWidth) {
                    this.eventBus.emit('achievement-category-changed', {
                        category: categories[i],
                        label: categoryLabels[i],
                        index: i
                    });
                    return true;
                }
                
                currentX += buttonWidth + this.buttonSpacing;
            }
        }
        
        return false;
    }
    
    /**
     * ホバー処理
     * @param x - マウスX座標
     * @param y - マウスY座標
     * @param categories - カテゴリ一覧
     */
    handleHover(x: number, y: number, categories: string[]): void { 
        const buttonWidth = 120;
        const buttonY = 5;
        
        this.hoveredButton = -1;
        
        if (y >= buttonY && y <= buttonY + this.buttonHeight) {
            let currentX = 10;
            
            for (let i = 0; i < categories.length; i++) {
                if (x >= currentX && x <= currentX + buttonWidth) {
                    this.hoveredButton = i;
                    break;
                }
                
                currentX += buttonWidth + this.buttonSpacing;
            }
        }
    }
    
    /**
     * フレーム更新処理
     */
    update(deltaTime: number): void { 
        // 現在は特に処理なし
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void { 
        this.hoveredButton = -1;
        this.isInitialized = false;
    }
}

/**
 * 実績進捗レンダラーコンポーネント
 * 進捗バーの描画を専門に担当
 */
class AchievementProgressRenderer { 
    // private gameEngine: GameEngine;
    // private eventBus: ComponentEventBus;
    // private state: SceneState;
    // private isInitialized: boolean = false;
    
    constructor(gameEngine: GameEngine, eventBus: ComponentEventBus, state: SceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
    }
    
    /**
     * 初期化
     */
    initialize(): void { 
        this.isInitialized = true;
    }
    
    /**
     * 拡張進捗バーを描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param progress - 進捗データ
     */
    renderEnhancedProgressBar(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        progress: { current: number; target: number }
    ): void {
        const barHeight = 8;
        const current = progress.current || 0;
        const target = progress.target || 1;
        const percentage = Math.min(100, (current / target) * 100);
        
        // 背景（グラデーション）
        const bgGradient = context.createLinearGradient(x, y, x, y + barHeight);
        bgGradient.addColorStop(0, '#2a2a2a');
        bgGradient.addColorStop(1, '#1a1a1a');

        context.fillStyle = bgGradient;
        context.fillRect(x, y, width, barHeight);
        
        // 枠線
        context.strokeStyle = '#555';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, barHeight);
        
        // 進捗（グラデーション）
        const fillWidth = (percentage / 100) * width;
        if (fillWidth > 0) {
            const progressGradient = context.createLinearGradient(x, y, x, y + barHeight);
            if (percentage >= 100) {
                progressGradient.addColorStop(0, '#4CAF50');
                progressGradient.addColorStop(1, '#2E7D32');
            } else {
                progressGradient.addColorStop(0, '#64B5F6');
                progressGradient.addColorStop(1, '#1976D2');
            }

            context.fillStyle = progressGradient;
            context.fillRect(x, y, fillWidth, barHeight);
        }
        
        // 進捗テキスト
        context.fillStyle = '#ffffff';
        context.font = '11px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText(`${current}/${target} (${percentage.toFixed(0)}%)`, x + width / 2, y + barHeight + 2);
    }
    
    /**
     * 基本進捗バーを描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param progress - 進捗データ
     */
    renderProgressBar(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        progress: { current: number; target: number }
    ): void {
        const barHeight = 6;
        const current = progress.current || 0;
        const target = progress.target || 1;
        const percentage = Math.min(100, (current / target) * 100);
        
        // 背景
        context.fillStyle = '#333';
        context.fillRect(x, y, width, barHeight);
        
        // 進捗
        const fillWidth = (percentage / 100) * width;
        context.fillStyle = percentage >= 100 ? '#00aa00' : '#4a90e2';
        context.fillRect(x, y, fillWidth, barHeight);
        
        // 進捗テキスト
        context.fillStyle = '#ffffff';
        context.font = '11px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText(`${current}/${target} (${percentage.toFixed(0)}%)`, x + width / 2, y + barHeight + 2);
    }
    
    /**
     * フレーム更新処理
     */
    update(deltaTime: number): void { 
        // アニメーション処理（将来の拡張）
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void { 
        this.isInitialized = false;
    }
}

/**
 * 実績レンダラーコンポーネント
 * 実績アイテムの描画を専門に担当
 */
class AchievementsRenderer { 
    private gameEngine: GameEngine;
    private eventBus: ComponentEventBus;
    private state: SceneState;
    private progressRenderer: AchievementProgressRenderer | null = null;
    
    // レイアウト設定
    private readonly itemHeight: number = 80;
    private readonly itemSpacing: number = 10;
    
    // テキスト設定
    private textSettings = {
        sectionTitleFont: '20px bold sans-serif',
        achievementNameFont: '16px bold sans-serif',
        achievementDescFont: '14px sans-serif',
        rewardFont: '12px sans-serif',
        dateFont: '12px sans-serif',
        unlockedColor: '#4CAF50',
        progressColor: '#FF9800',
        textColor: '#FFFFFF',
        subTextColor: '#CCCCCC',
        disabledColor: '#999999'
    };
    // private isInitialized: boolean = false;
    
    constructor(gameEngine: GameEngine, eventBus: ComponentEventBus, state: SceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
    }
    
    /**
     * 初期化
     */
    initialize(): void { 
        this.progressRenderer = new AchievementProgressRenderer(this.gameEngine, this.eventBus, this.state);
        this.progressRenderer.initialize();
        this.applyAccessibilitySettings();
        this.isInitialized = true;
    }
    
    /**
     * アクセシビリティ設定を適用
     */
    private applyAccessibilitySettings(): void {
        const settings = this.state.accessibilitySettings || {};

        if (settings.largeText) {
            this.textSettings.sectionTitleFont = '24px bold sans-serif';
            this.textSettings.achievementNameFont = '18px bold sans-serif';
            this.textSettings.achievementDescFont = '16px sans-serif';
            this.textSettings.rewardFont = '14px sans-serif';
            this.textSettings.dateFont = '14px sans-serif';
        }

        if (settings.highContrast) {
            this.textSettings.unlockedColor = '#000000';
            this.textSettings.progressColor = '#000000';
            this.textSettings.textColor = '#000000';
            this.textSettings.subTextColor = '#000000';
            this.textSettings.disabledColor = '#000000';
        }
    }
    
    /**
     * 解除済み実績セクションを描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param achievements - 実績データ
     * @returns 描画した高さ
     */
    renderUnlockedSection(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        achievements: Achievement[]
    ): number { 
        let currentY = y;
        
        // セクションタイトル
        context.fillStyle = this.textSettings.unlockedColor;
        context.font = this.textSettings.sectionTitleFont;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('解除済み実績', x, currentY);
        currentY += 35;
        
        // 実績アイテムを描画
        for (const achievement of achievements) {
            currentY = this.renderAchievementItem(context, x, currentY, width, achievement, true);
            currentY += this.itemSpacing;
        }
        
        return currentY - y;
    }
    
    /**
     * 進行中実績セクションを描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param achievements - 実績データ
     * @returns 描画した高さ
     */
    renderProgressSection(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        achievements: Achievement[]
    ): number { 
        let currentY = y;
        
        // セクションタイトル
        context.fillStyle = this.textSettings.progressColor;
        context.font = this.textSettings.sectionTitleFont;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('進行中の実績', x, currentY);
        currentY += 35;
        
        // 実績アイテムを描画
        for (const achievement of achievements) {
            currentY = this.renderAchievementItem(context, x, currentY, width, achievement, false);
            currentY += this.itemSpacing;
        }
        
        return currentY - y;
    }
    
    /**
     * 実績アイテムを描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param achievement - 実績データ
     * @param isUnlocked - 解除済みかどうか
     * @returns 次のY座標
     */
    private renderAchievementItem(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        achievement: Achievement,
        isUnlocked: boolean
    ): number { 
        // 背景
        context.fillStyle = isUnlocked ? '#2E7D32' : '#1976D2';
        if (this.state.accessibilitySettings.highContrast) {
            context.fillStyle = isUnlocked ? '#000000' : '#FFFFFF';
        }
        context.fillRect(x, y, width, this.itemHeight);
        
        // 枠線
        context.strokeStyle = isUnlocked ? this.textSettings.unlockedColor: this.textSettings.progressColor;
        if (this.state.accessibilitySettings.highContrast) {
            context.strokeStyle = '#000000';
        }

        context.lineWidth = 2;
        context.strokeRect(x, y, width, this.itemHeight);
        
        // アイコン
        context.fillStyle = this.textSettings.textColor;
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(achievement.icon || '🏆', x + 30, y + this.itemHeight / 2);
        
        // 実績名
        context.fillStyle = this.textSettings.textColor;
        context.font = this.textSettings.achievementNameFont;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText(achievement.name, x + 60, y + 15);
        
        // 実績説明
        context.fillStyle = this.textSettings.subTextColor;
        context.font = this.textSettings.achievementDescFont;
        context.fillText(achievement.description, x + 60, y + 35);
        
        // 報酬AP
        if (achievement.reward && achievement.reward.ap) {
            context.fillStyle = '#FFD700';
            if (this.state.accessibilitySettings.highContrast) {
                context.fillStyle = '#000000';
            }

            context.font = this.textSettings.rewardFont;
            context.textAlign = 'right';
            context.fillText(`${achievement.reward.ap} AP`, x + width - 10, y + 15);
        }
        
        // 進捗バー（未解除実績のみ）
        if (!isUnlocked && achievement.progress) {
            this.progressRenderer!.renderEnhancedProgressBar(
                context,
                x + 60,
                y + 55,
                width - 150,
                achievement.progress
            );
        }
        
        // 獲得日時（解除済み実績のみ）
        if (isUnlocked && achievement.unlockedDate) {
            context.fillStyle = this.textSettings.subTextColor;
            context.font = this.textSettings.dateFont;
            context.textAlign = 'right';
            context.textBaseline = 'top';
            const date = new Date(achievement.unlockedDate).toLocaleDateString('ja-JP');
            context.fillText(date, x + width - 10, y + 35);
        }
        
        return y + this.itemHeight;
    }
    
    /**
     * フレーム更新処理
     */
    update(deltaTime: number): void { 
        if (this.progressRenderer) {
            this.progressRenderer.update(deltaTime);
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void { 
        if (this.progressRenderer) {
            this.progressRenderer.cleanup();
        }
        this.isInitialized = false;
    }
}