/**
 * UserAchievementDisplay.ts
 * ユーザー実績表示コンポーネント
 * UserInfoSceneから分離された実績表示機能を提供
 */

import { AchievementStatsUI  } from '../../../core/AchievementStatsUI';
import { AchievementHelpSystem  } from '../../../ui/AchievementHelpSystem';
import { GameEngine  } from '../../../types/gameEngine';
import { EventBus  } from '../../../types/eventBus';

// 実績データ型定義
interface Achievement { id: string,
    name: string;
    description: string;
    unlocked: boolean;
    progress: number;
    category: string;
    apReward: number;

// カテゴリ定義
interface AchievementCategory { id: string,
    name: string;

// シーン状態のインターフェース
interface SceneState { get(key: string): any,
    set(key: string, value: any): void;

// タブコンポーネントのインターフェース
interface AchievementsTabComponent { isActive: boolean,''
    render(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void;

export class UserAchievementDisplay {
    private gameEngine: GameEngine;
    private eventBus: EventBus | null;
    private sceneState: SceneState;
    // 実績データ
    private achievementsData: Achievement[] | null = null;
    private, achievementsByCategory: Record<string, Achievement[]> | null = null,
    private currentAchievementCategory: string = 'all';
    // 実績統計UI
    private achievementStatsUI: AchievementStatsUI | null = null;
    // 実績ヘルプシステム
    private achievementHelpSystem: AchievementHelpSystem | null = null;
    // レイアウト設定
    private readonly, contentPadding: number = 20,
    
    constructor(gameEngine: GameEngine, eventBus: EventBus | null, sceneState: SceneState) {
    
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        this.initialize()
}
        this.setupEventListeners(); }
    }
    
    /**
     * コンポーネントの初期化
     */
    private initialize(): void { this.loadAchievementData(),
        this.initializeAchievementSystems() }
    
    /**
     * イベントリスナーをセットアップ
     */
    private setupEventListeners(): void { ''
        if (this.eventBus) {', ' }

            this.eventBus.on('achievementDataReload', () => {  }

                this.loadAchievementData();' }'

            }');'

            this.eventBus.on('achievementCategoryChanged', (category: string) => { this.currentAchievementCategory = category,' 
    }');'

            this.eventBus.on('achievementUnlocked', (achievementId: string) => { this.handleAchievementUnlocked(achievementId) });
        }
    }
    
    /**
     * 実績システムの初期化
     */
    private initializeAchievementSystems(): void { try {
            if (this.gameEngine.achievementManager) {
                this.achievementStatsUI = new AchievementStatsUI(this.gameEngine.achievementManager) }

                this.achievementHelpSystem = new AchievementHelpSystem(this.gameEngine.achievementManager);' }'

            } catch (error) { console.error('Failed to initialize achievement systems:', error }
    }
    
    /**
     * 実績データの読み込み
     */
    private loadAchievementData(): void { try {
            if (this.gameEngine.achievementManager) {
                this.achievementsData = this.gameEngine.achievementManager.getAchievements();
                this.achievementsByCategory = this.gameEngine.achievementManager.getAchievementsByCategory();
                
                // 実績統計UIが未初期化の場合は初期化
                if (!this.achievementStatsUI) {
            }
                    this.achievementStatsUI = new AchievementStatsUI(this.gameEngine.achievementManager); }
                }
                ;
                // イベントバスに通知
                if (this.eventBus) {', ' }

                    this.eventBus.emit('achievementDataLoaded', this.achievementsData'; }'

                }'} catch (error) { console.error('UserAchievementDisplay: loadAchievementData, error:', error }'
    }
    
    /**
     * 実績コンポーネントでの描画
     */
    public renderAchievementsWithComponent(;
        context: CanvasRenderingContext2D;
        y: number );
        height: number,
    achievementsTabComponent: AchievementsTabComponent;
    ): void { const canvas = this.gameEngine.canvas,
        const contentWidth = canvas.width - this.contentPadding * 2,
        const contentX = this.contentPadding,
        
        if (achievementsTabComponent && achievementsTabComponent.isActive) {
        
            // 新しいAchievementsTabコンポーネントでレンダリング
        
        }
            achievementsTabComponent.render(context, contentX, y, contentWidth, height); }
        } else {  // フォールバック: 直接描画 }
            this.renderAchievements(context, y, height); }
}
    
    /**
     * 実績の描画
     */
    public renderAchievements(context: CanvasRenderingContext2D, y: number, height: number): void { ''
        if(!this.achievementsData || !Array.isArray(this.achievementsData)) {''
            context.fillStyle = '#cccccc',
            context.font = '20px Arial',
            context.textAlign = 'center',
            context.fillText('実績データがありません),'
                this.gameEngine.canvas.width / 2, y + height / 2),
            return }
        
        // カテゴリフィルターを描画
        y = this.renderAchievementCategoryFilter(context, y);
        
        const contentWidth = this.gameEngine.canvas.width - this.contentPadding * 2;
        let currentY = y + 10;
        
        // フィルタリングされた実績を取得
        const filteredAchievements = this.getFilteredAchievements();
        
        // 解除済み実績と未解除実績に分離
        const unlockedAchievements = filteredAchievements.filter(a => a.unlocked);
        const lockedAchievements = filteredAchievements.filter(a => !a.unlocked);
        
        // 解除済み実績セクション
        if (unlockedAchievements.length > 0) { currentY = this.renderUnlockedAchievements(context, this.contentPadding, currentY, contentWidth, unlockedAchievements) }
        
        // 未解除実績セクション
        if (lockedAchievements.length > 0) { currentY = this.renderProgressAchievements(context, this.contentPadding, currentY + 20, contentWidth, lockedAchievements) }
    }
    
    /**
     * 解除済み実績を描画
     */
    private renderUnlockedAchievements(;
        context: CanvasRenderingContext2D,
    x: number, ;
        y: number );
        width: number,
    achievements: Achievement[]';'
    '): number { // セクションタイトル'
        context.fillStyle = '#00aa00',
        context.font = 'bold 20px Arial',
        context.textAlign = 'left',
        context.fillText('解除済み実績', x, y + 25),
        
        let currentY = y + 40,
        const spacing = 10,
        
        for (const achievement of achievements) {
        
            currentY = this.renderAchievementItem(context, x, currentY, width, achievement, true) }
            currentY += spacing; }
        }
        
        return currentY;
    }
    
    /**
     * 未解除実績の進捗を描画
     */
    private renderProgressAchievements(;
        context: CanvasRenderingContext2D,
    x: number, ;
        y: number );
        width: number)','
    achievements: Achievement[]';'
    '): number { // セクションタイトル'
        context.fillStyle = '#cc6600',
        context.font = 'bold 20px Arial',
        context.textAlign = 'left',
        context.fillText('進行中の実績', x, y + 25),
        
        let currentY = y + 40,
        const spacing = 10,
        
        for (const achievement of achievements) {
        
            currentY = this.renderAchievementItem(context, x, currentY, width, achievement, false) }
            currentY += spacing; }
        }
        
        return currentY;
    }
    
    /**
     * 実績アイテムの描画
     */
    private renderAchievementItem(;
        context: CanvasRenderingContext2D,
    x: number, ;
        y: number, ;
        width: number );
        achievement: Achievement)','
    isUnlocked: boolean';'
    '): number { const itemHeight = 70,'
        // 背景
        context.fillStyle = isUnlocked ? '#1a2e1a' : '#1a1a2e',
        context.fillRect(x, y, width, itemHeight),
        ','
        // 枠線
        context.strokeStyle = isUnlocked ? '#00aa00' : '#333',

        context.lineWidth = 1,
        context.strokeRect(x, y, width, itemHeight),
        
        // アイコン（簡単な円）
        const iconSize = 40,
        const iconX = x + 15,
        const iconY = y + 15,

        context.fillStyle = isUnlocked ? '#00ff00' : '#666',
        context.beginPath(),

        context.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, Math.PI * 2),
        context.fill('''
        context.fillStyle = isUnlocked ? '#00ff00' : '#ffffff',
        context.font = 'bold, 16px Arial',
        context.textAlign = 'left',')'
        context.fillText(achievement.name || '実績名', iconX + iconSize + 15, y + 25','
        ','
        // 実績説明
        context.fillStyle = '#cccccc',
        context.font = '14px Arial',
        context.fillText(achievement.description || '実績の説明', iconX + iconSize + 15, y + 45','
        ','
        // 進捗バーまたは報酬情報
        if (isUnlocked) {
            // 報酬AP表示
            context.fillStyle = '#ffaa00',
            context.font = '12px Arial' }

            context.textAlign = 'right'; }
            context.fillText(`+${achievement.apReward || 0} AP`, x + width - 15, y + 25});
        } else {  // 進捗バー
            const progressBarX = iconX + iconSize + 15,
            const progressBarY = y + 50,
            const progressBarWidth = width - (progressBarX - x) - 100,
            const progressBarHeight = 8,

            this.renderEnhancedProgressBar(context, progressBarX, progressBarY, progressBarWidth, achievement.progress || 0),
            ','
            // 進捗テキスト
            context.fillStyle = '#cccccc',
            context.font = '12px Arial',' }'

            context.textAlign = 'right'; }
            context.fillText(`${Math.round((achievement.progress || 0} * 100})%`, x + width - 15, y + 58);
        }
        
        return y + itemHeight;
    }
    
    /**
     * 実績カテゴリフィルターを描画'
     */''
    private renderAchievementCategoryFilter(context: CanvasRenderingContext2D, y: number): number { const categories: AchievementCategory[] = [' }'

            { id: 'all', name: 'すべて'
            },''
            { id: 'score', name: 'スコア'
            },''
            { id: 'play', name: 'プレイ'
            },''
            { id: 'skill', name: 'スキル'
            },''
            { id: 'collection', name: 'コレクション'
            },]'
            { id: 'special', name: '特別'
            }]
        ];
        
        const buttonWidth = 80;
        const buttonHeight = 30;
        const buttonSpacing = 10;
        const startX = this.contentPadding;
        
        let currentX = startX;

        for (const category of categories) {
            const isSelected = this.currentAchievementCategory === category.id;
            ','
            // ボタン背景
            context.fillStyle = isSelected ? '#4a4a6a' : '#2a2a4a',
            context.fillRect(currentX, y, buttonWidth, buttonHeight),
            ','
            // ボタン枠線
            context.strokeStyle = isSelected ? '#6a6a8a' : '#4a4a6a',

            context.lineWidth = 1,
            context.strokeRect(currentX, y, buttonWidth, buttonHeight),
            ','
            // ボタンテキスト
            context.fillStyle = isSelected ? '#ffffff' : '#cccccc',
            context.font = '12px Arial',
            context.textAlign = 'center',
            context.fillText(category.name, currentX + buttonWidth/2, y + buttonHeight/2 + 4) }
            currentX += buttonWidth + buttonSpacing; }
        }
        
        return y + buttonHeight + 20;
    }
    
    /**
     * フィルタリングされた実績を取得
     */'
    private getFilteredAchievements(): Achievement[] { ''
        if(!this.achievementsData) return [],

        if(this.currentAchievementCategory === 'all' { }
            return this.achievementsData;
        
        return this.achievementsData.filter(achievement => );
            achievement.category === this.currentAchievementCategory);
    }
    
    /**
     * 強化された進捗バーの描画
     */
    private renderEnhancedProgressBar(;
        context: CanvasRenderingContext2D,
    x: number, ;
        y: number );
        width: number)','
    progress: number';'
    '): void { const height = 8,'
        const radius = 4,

        ','
        // 背景
        context.fillStyle = '#333333',
        this.drawRoundedRect(context, x, y, width, height, radius),
        context.fill(),
        
        // 進捗
        if (progress > 0) {
            const progressWidth = width * Math.min(progress, 1),
            // グラデーション効果
            const gradient = context.createLinearGradient(x, y, x + progressWidth, y),
            gradient.addColorStop(0, '#4CAF50'),
            gradient.addColorStop(1, '#8BC34A),'
            
            context.fillStyle = gradient,
            this.drawRoundedRect(context, x, y, progressWidth, height, radius) }
            context.fill(); }
}
    
    /**
     * 角丸四角形を描画
     */
    private drawRoundedRect(;
        context: CanvasRenderingContext2D,
    x: number, ;
        y: number, ;
        width: number );
        height: number,
    radius: number;
    ): void { context.beginPath(
        context.moveTo(x + radius, y),
        context.lineTo(x + width - radius, y),
        context.quadraticCurveTo(x + width, y, x + width, y + radius),
        context.lineTo(x + width, y + height - radius),
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height),
        context.lineTo(x + radius, y + height),
        context.quadraticCurveTo(x, y + height, x, y + height - radius),
        context.lineTo(x, y + radius),
        context.quadraticCurveTo(x, y, x + radius, y),
        context.closePath() }
    
    /**
     * 実績統計セクションを描画
     */
    public renderAchievementStatsSection(;
        context: CanvasRenderingContext2D;
        x: number );
        y: number,
    width: number';'
    ': number { ''
        if(!this.achievementStatsUI) return y,
        
        const sectionHeight = 300,
        let currentY = y,
        ','
        // セクションタイトル
        context.fillStyle = '#4CAF50',
        context.font = 'bold 20px Arial',
        context.textAlign = 'left',
        context.fillText('実績統計', x, currentY + 25),
        currentY += 40,
        
        try {
            // 実績統計UIを使用して描画
            this.achievementStatsUI.render(context, x, currentY, width, sectionHeight - 40),
            currentY += sectionHeight - 40,' }'

        } catch (error) {
            console.error('Achievement stats rendering failed:', error),
            
            // フォールバック: 基本統計表示
            this.renderBasicAchievementStats(context, x, currentY, width),
            currentY += 100 }
        
        return currentY;
    }
    
    /**
     * 基本実績統計の描画（フォールバック）
     */
    private renderBasicAchievementStats(;
        context: CanvasRenderingContext2D;
        x: number );
        y: number,
    width: number;
    ): void { if (!this.achievementsData) return,
        
        const unlockedCount = this.achievementsData.filter(a => a.unlocked).length,
        const totalCount = this.achievementsData.length,
        const completionRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100') : 0,'
        ','
        // 背景
        context.fillStyle = '#1a1a2e',
        context.fillRect(x, y, width, 80),
        ','
        // 枠線
        context.strokeStyle = '#4a4a6a',

        context.lineWidth = 1,
        context.strokeRect(x, y, width, 80),
        ','
        // 統計情報
        context.fillStyle = '#ffffff',
        context.font = '16px Arial',
        context.textAlign = 'left' }
        context.fillText(`解除済み実績: ${unlockedCount} / ${ totalCount}`, x + 15, y + 30}
        context.fillText(`達成率: ${completionRate}%`, x + 15, y + 55});
    }
    
    /**
     * 実績カテゴリボタンのクリック処理'
     */''
    public handleAchievementCategoryClick(x: number, y: number): boolean { ''
        const categories = ['all', 'score', 'play', 'skill', 'collection', 'special'],
        const buttonWidth = 80,
        const buttonHeight = 30,
        const buttonSpacing = 10,
        const startX = this.contentPadding,
        const filterY = 150, // フィルターのY位置（概算）
        
        if (y >= filterY && y <= filterY + buttonHeight) {
        
            let currentX = startX,
            
            for (let, i = 0, i < categories.length, i++) {
                if (x >= currentX && x <= currentX + buttonWidth) {
                    this.currentAchievementCategory = categories[i];
                    // イベントバスに通知
                    if (this.eventBus) {
    
}

                        this.eventBus.emit('achievementCategoryChanged', categories[i]); }
                    }
                    
                    return true;
                }
                currentX += buttonWidth + buttonSpacing;
            }
        }
        
        return false;
    }
    
    /**
     * 実績解除時の処理
     */
    private handleAchievementUnlocked(achievementId: string): void { // データを再読み込みして最新状態を反映
        this.loadAchievementData(),
        
        // 統計UIも更新
        if (this.achievementStatsUI) {
    
}
            this.achievementStatsUI.updateData(); }
}
    
    /**
     * 実績の詳細情報を取得
     */
    public getAchievementDetails(achievementId: string): Achievement | null { if (!this.achievementsData) return null,
        
        return this.achievementsData.find(achievement => achievement.id === achievementId) || null,
    
    /**
     * 実績の完了率を取得
     */
    public getCompletionRate(): number { if (!this.achievementsData || this.achievementsData.length === 0) return 0,
        
        const unlockedCount = this.achievementsData.filter(a => a.unlocked).length,
        return Math.round((unlockedCount / this.achievementsData.length) * 100),
    
    /**
     * カテゴリ別実績統計を取得
     */
    public getCategoryStats(): Record<string, { unlocked: number, total: number,, rate: number;> {
        if (!this.achievementsByCategory) return {};
        
        const stats: Record<string, { unlocked: number, total: number,, rate: number,> = {}
        for(const [category, achievements] of Object.entries(this.achievementsByCategory) {
            const unlocked = achievements.filter(a => a.unlocked).length,
            const total = achievements.length,
            
            stats[category] = {
                unlocked,
                total }
                rate: total > 0 ? Math.round((unlocked / total) * 100) : 0 
            }
        
        return stats;
    }
    
    /**
     * 総タブ数を取得
     */''
    private getTotalTabCount()';'
        return this.sceneState.get('tabs'?.length || 5;
    }
    
    /**
     * コンポーネントのクリーンアップ
     */ : undefined'
    public cleanup(): void { ''
        if (this.eventBus) {

            this.eventBus.off('achievementDataReload'),
            this.eventBus.off('achievementCategoryChanged') }

            this.eventBus.off('achievementUnlocked'); }
        }
        
        // リソースのクリーンアップ
        this.achievementsData = null;
        this.achievementsByCategory = null;
        this.achievementStatsUI = null;
        this.achievementHelpSystem = null;
    }'}'