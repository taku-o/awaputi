/**
 * User Data Manager
 * ユーザーデータ管理 - データ処理、統計計算、永続化処理
 */

// Import types
import type { GameEngine } from '../../core/GameEngine';
import type { EventBus } from '../../core/EventBus';

// User profile interface
interface UserProfile { username: string,
    level: number,
    experience: number,
    joinDate: Date,
    totalPlaytime: number,
    gamesPlayed: number,
    lastActive: Date
     }

// Basic statistics interface
interface BasicStatistics { totalScore: number,
    averageScore: number,
    bestScore: number,
    totalPlaytime: number,
    gamesPlayed: number }

// Bubble statistics interface
interface BubbleStatistics { totalPopped: number,
    normalPopped: number,
    specialPopped: number,
    bossDefeated: number,
    electricActivated: number,
    favoriteType: string }

// Combo statistics interface
interface ComboStatistics { maxCombo: number,
    averageCombo: number,
    totalCombos: number,
    perfectCombos: number }

// Stage statistics interface
interface StageStatistics { stagesCleared: number,
    currentStage: number,
    bestStageScore: Record<string, number>,
    stageCompletionTimes: Record<string, number> }

// Performance statistics interface
interface PerformanceStatistics { averageFPS: number,
    averageResponseTime: number,
    optimalSettings: string,
    recommendedQuality: string  }

// Complete user statistics interface
interface UserStatistics { basic: BasicStatistics,
    bubble: BubbleStatistics,
    combo: ComboStatistics,
    stage: StageStatistics,
    performance: PerformanceStatistics
    }

// Achievement interfaces
interface Achievement { id: string,
    name: string,
    description: string,
    icon: string,
    unlocked: boolean,
    unlockedAt?: Date,
    progress?: number,
    maxProgress?: number,
    category?: string }

interface AchievementProgress { id: string,
    name: string,
    progress: number,
    maxProgress: number,
    percentage: number  }

interface UserAchievements { unlocked: Achievement[],
    total: number,
    progress: AchievementProgress[],
    recent: Achievement[],
    categories: Record<string, Achievement[]> }

// Data cache interface
interface DataCache { statistics: UserStatistics | null,
    achievements: UserAchievements | null,
    profile: UserProfile | null,
    lastUpdate: number  }

// Export data interface
interface ExportData { version: string,
    exportedAt: string,
    profile: UserProfile,
    statistics: UserStatistics,
    achievements: Achievement[],
    settings: Record<string, any> }

// Import data interface
interface ImportData { version: string }
    profile?: { username?: string };
    statistics?: Partial<UserStatistics>;
    achievements?: Achievement[];
    settings?: Record<string, any>;
}

// Statistics manager interface (minimal, definition for, type safety);
interface StatisticsManager { getStatistics(): Partial<{
        totalScore: number,
        averageScore: number,
        bestScore: number,
        totalPlaytime: number,
    gamesPlayed: number  }>;
    getBubbleStatistics(): Partial<BubbleStatistics>;
    getComboStatistics(): Partial<ComboStatistics>;
    getStageStatistics(): Partial<StageStatistics>;
    importStatistics?(statistics: Partial<UserStatistics>): void,

// Achievement manager interface (minimal, definition for, type safety);
interface AchievementManager { getAchievements(): Achievement[] }

// Player data interface (minimal, definition for, type safety);
interface PlayerData { username?: string,
    joinDate?: Date,
    setUsername?(username: string): void, 
// Scene state interface
interface SceneState { // Add scene state properties as needed
    [key: string]: any }

export class UserDataManager {
    private gameEngine: GameEngine,
    private eventBus: EventBus,
    private sceneState: SceneState,
    // データキャッシュ
    private dataCache: DataCache,
    // 更新間隔（5秒）
    private readonly, CACHE_INTERVAL: number = 5000,
    
    // データアクセス用のマネージャー
    private statisticsManager: StatisticsManager | null,
    private achievementManager: AchievementManager | null,
    private, playerData: PlayerData | null,
    constructor(gameEngine: GameEngine, eventBus: EventBus, sceneState: SceneState) {
    
        this.gameEngine = gameEngine,
        this.eventBus = eventBus,
        this.sceneState = sceneState,
        
        // データキャッシュ
        this.dataCache = {
            statistics: null,
            achievements: null,
    profile: null }
            lastUpdate: 0 
    };
        // データアクセス用のマネージャー
        this.statisticsManager = gameEngine.statisticsManager || null;
        this.achievementManager = gameEngine.achievementManager || null;
        this.playerData = gameEngine.playerData || null;
        // イベントリスナーの設定
        this.setupEventListeners()';
        console.log('[UserDataManager] ユーザーデータ管理システムを初期化しました');
    }
    
    /**
     * イベントリスナーの設定'
     */''
    private setupEventListeners()';
        this.eventBus.on('dataUpdateRequired', () => { this.invalidateCache(),' }

        }');
        ';
        // プロフィール更新イベント
        this.eventBus.on('profileUpdated', () => { this.invalidateProfileCache(),' }

        }');
        ';
        // 統計更新イベント
        this.eventBus.on('statisticsUpdated', () => { this.invalidateStatisticsCache(),' }

        }');
        ';
        // 実績更新イベント
        this.eventBus.on('achievementsUpdated', () => { this.invalidateAchievementsCache() });
    }
    
    /**
     * ユーザープロフィール情報を取得'
     */''
    public async getUserProfile()';
        if(this.isCacheValid('profile)' { return this.dataCache.profile! }', ';

        try { const profile: UserProfile = {''
                username: this.playerData?.username || 'プレイヤー', : undefined
                level: this.calculatePlayerLevel(),
                experience: this.calculateTotalExperience(
    joinDate: this.playerData?.joinDate || new Date(), : undefined
                totalPlaytime: this.getTotalPlaytime(
                gamesPlayed: this.getTotalGamesPlayed(
                lastActive: new Date()',
            this.updateCacheTime('profile',
            
            return profile,

            ' }'

        } catch (error) {
            console.error('[UserDataManager] プロフィール取得エラー:', error),
            return this.getDefaultProfile(),
    
    /**
     * 統計情報を取得'
     */''
    public async getUserStatistics()',
        if(this.isCacheValid('statistics' { return this.dataCache.statistics! }'
        
        try { const statistics: UserStatistics = {
                basic: this.getBasicStatistics(),
                bubble: this.getBubbleStatistics(
    combo: this.getComboStatistics(
                stage: this.getStageStatistics(
                performance: this.getPerformanceStatistics()',
            this.updateCacheTime('statistics',
            
            return statistics,

            ' }'

        } catch (error) {
            console.error('[UserDataManager] 統計取得エラー:', error),
            return this.getDefaultStatistics(),
    
    /**
     * 実績情報を取得'
     */''
    public async getUserAchievements()',
        if(this.isCacheValid('achievements' { return this.dataCache.achievements! }'
        
        try { const achievements: UserAchievements = {
                unlocked: this.getUnlockedAchievements(),
                total: this.getTotalAchievements(
    progress: this.getAchievementProgress(
                recent: this.getRecentAchievements(
                categories: this.getAchievementsByCategory()',
            this.updateCacheTime('achievements',
            
            return achievements,

            ' }'

        } catch (error) {
            console.error('[UserDataManager] 実績取得エラー:', error),
            return this.getDefaultAchievements(),
    
    /**
     * 基本統計情報を取得
     */
    private getBasicStatistics(): BasicStatistics { const stats = this.statisticsManager ? undefined : undefined
            this.statisticsManager.getStatistics() :  
            {};
        
        return { totalScore: stats.totalScore || 0,
            averageScore: stats.averageScore || 0,
            bestScore: stats.bestScore || 0,
    totalPlaytime: stats.totalPlaytime || 0 };
            gamesPlayed: stats.gamesPlayed || 0 
    }
    
    /**
     * 泡統計情報を取得
     */'
    private getBubbleStatistics(): BubbleStatistics { const stats = this.statisticsManager ? undefined : undefined''
            this.statisticsManager.getBubbleStatistics('''
            favoriteType: stats.favoriteType || 'normal'
            }))
    }
    
    /**
     * コンボ統計情報を取得
     */)
    private getComboStatistics(): ComboStatistics { const stats = this.statisticsManager ? undefined : undefined
            this.statisticsManager.getComboStatistics() :  
            {};
        
        return { maxCombo: stats.maxCombo || 0,
            averageCombo: stats.averageCombo || 0,
    totalCombos: stats.totalCombos || 0 };
            perfectCombos: stats.perfectCombos || 0 
    }
    
    /**
     * ステージ統計情報を取得
     */
    private getStageStatistics(): StageStatistics { const stats = this.statisticsManager ? undefined : undefined
            this.statisticsManager.getStageStatistics() :  
            {};
        
        return { stagesCleared: stats.stagesCleared || 0 };
            currentStage: stats.currentStage || 1 }
            bestStageScore: stats.bestStageScore || {};
            stageCompletionTimes: stats.stageCompletionTimes || {}
    
    /**
     * パフォーマンス統計情報を取得'
     */''
    private getPerformanceStatistics('''
            optimalSettings: 'high',
            recommendedQuality: 'high);
            });
    /**
     * プレイヤーレベルを計算
     */
    private calculatePlayerLevel(): number { const totalScore = this.statisticsManager ? undefined : undefined
            this.statisticsManager.getStatistics().totalScore || 0 : ,
            0,
        
        return Math.floor(totalScore / 10000) + 1 }
    
    /**
     * 総経験値を計算
     */
    private calculateTotalExperience(): number { const stats = this.statisticsManager ? undefined : undefined
            this.statisticsManager.getStatistics() :  
            {};
        
        return (stats.totalScore || 0) + (stats.gamesPlayed || 0) * 100;
    }
    
    /**
     * 総プレイ時間を取得
     */
    private getTotalPlaytime(): number { const stats = this.statisticsManager ? undefined : undefined
            this.statisticsManager.getStatistics() :  
            {};
        
        return stats.totalPlaytime || 0;
    }
    
    /**
     * 総ゲームプレイ数を取得
     */
    private getTotalGamesPlayed(): number { const stats = this.statisticsManager ? undefined : undefined
            this.statisticsManager.getStatistics() :  
            {};
        
        return stats.gamesPlayed || 0;
    }
    
    /**
     * 解除済み実績を取得
     */
    private getUnlockedAchievements(): Achievement[] { if (!this.achievementManager) return [],
        
        return this.achievementManager.getAchievements(),
            .filter(achievement => achievement.unlocked),
            .map(achievement => ({
                id: achievement.id,
                name: achievement.name,
                description: achievement.description),
                icon: achievement.icon,
    unlocked: achievement.unlocked),
                unlockedAt: achievement.unlockedAt))  }
    }
    
    /**
     * 実績総数を取得
     */
    private getTotalAchievements(): number { if (!this.achievementManager) return 0,
        
        return this.achievementManager.getAchievements().length }
    
    /**
     * 実績進捗を取得
     */
    private getAchievementProgress(): AchievementProgress[] { if (!this.achievementManager) return [],
        
        return this.achievementManager.getAchievements(),
            .filter(achievement => !achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress !== undefined),
            .map(achievement => ({
                id: achievement.id),
                name: achievement.name,
    progress: achievement.progress!),
                maxProgress: achievement.maxProgress!,
    percentage: Math.round((achievement.progress! / achievement.maxProgress!) * 100)  }
            });
    }
    
    /**
     * 最近の実績を取得
     */
    private getRecentAchievements(): Achievement[] { if (!this.achievementManager) return [],
        
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000,
        
        return this.achievementManager.getAchievements(),
            .filter(achievement => ),
                achievement.unlocked && ),
                achievement.unlockedAt && ),
                achievement.unlockedAt.getTime() > oneWeekAgo),
            .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0)),
            .slice(0, 5) }
    }
    
    /**
     * カテゴリ別実績を取得
     */ : undefined
    private getAchievementsByCategory(): Record<string, Achievement[]> {
        if (!this.achievementManager) return {};

        const achievements = this.achievementManager.getAchievements()';
            const category = achievement.category || 'その他');
            if (!categories[category]) { categories[category] = [] }
            categories[category].push(achievement);
        });
        
        return categories;
    }
    
    /**
     * ユーザー名を更新
     */
    public async updateUsername(newUsername: string): Promise<boolean> { try {
            if(this.playerData && this.playerData.setUsername) {
    
}
                this.playerData.setUsername(newUsername); }
            }

            this.invalidateProfileCache()';
            this.eventBus.emit('usernameUpdated', newUsername);
            
            console.log(`[UserDataManager] ユーザー名を更新: ${newUsername}`});
            return true;

        } catch (error) {
            console.error('[UserDataManager] ユーザー名更新エラー:', error),
            return false,
    
    /**
     * データをエクスポート
     */
    public async exportUserData(): Promise<ExportData> { try {
            const [profile, statistics, achievements] = await Promise.all([),
                this.getUserProfile(),
                this.getUserStatistics()]',
                this.getUserAchievements()']',
            ]'),
            ',

            const exportData: ExportData = {''
                version: '1.0',
                exportedAt: new Date().toISOString()',
            console.log('[UserDataManager] データエクスポート完了'),
            return exportData,

            ' }'

        } catch (error) {
            console.error('[UserDataManager] データエクスポートエラー:', error),
            throw error }
    }
    
    /**
     * データをインポート
     */
    public async importUserData(importData: ImportData): Promise<boolean> { try {
            // データの検証
            if(!importData || !importData.version) { }

                throw new Error('無効なインポートデータです'; }'
            }
            
            // プロフィールの復元
            if (importData.profile && importData.profile.username) { await this.updateUsername(importData.profile.username) }
            
            // 統計の復元（可能な場合）
            if(importData.statistics && this.statisticsManager) {
                // 統計マネージャーにインポート機能があれば使用
                if (this.statisticsManager.importStatistics) {
            }
                    this.statisticsManager.importStatistics(importData.statistics); }
}
            ;
            // すべてのキャッシュを無効化
            this.invalidateCache()';
            console.log('[UserDataManager] データインポート完了';
            return true;

        } catch (error') {
            console.error('[UserDataManager] データインポートエラー:', error),
            throw error }
    }
    
    /**
     * キャッシュの有効性をチェック
     */
    private isCacheValid(type: keyof, DataCache): boolean { if (!this.dataCache[type]) return false,
        
        const now = Date.now(),
        const lastUpdate = this.dataCache.lastUpdate || 0,
        
        return (now - lastUpdate) < this.CACHE_INTERVAL }
    
    /**
     * キャッシュを無効化
     */
    private invalidateCache(): void { this.dataCache = {
            statistics: null,
            achievements: null,
            profile: null,
    lastUpdate: 0 }
    
    private invalidateProfileCache(): void { this.dataCache.profile = null }
    
    private invalidateStatisticsCache(): void { this.dataCache.statistics = null }
    
    private invalidateAchievementsCache(): void { this.dataCache.achievements = null }
    
    /**
     * キャッシュ時間を更新
     */
    private updateCacheTime(type: keyof, DataCache): void { this.dataCache.lastUpdate = Date.now() }
    
    /**
     * デフォルトプロフィールを取得'
     */''
    private getDefaultProfile('''
            username: 'プレイヤー';
            level: 1);
            experience: 0);
            joinDate: new Date();
            totalPlaytime: 0;
            gamesPlayed: 0,
    lastActive: new Date();
        }
    
    /**
     * デフォルト統計を取得'
     */''
    private getDefaultStatistics('''
            bubble: { totalPopped: 0, normalPopped: 0, specialPopped: 0, bossDefeated: 0, electricActivated: 0, favoriteType: 'normal'
            });
            combo: { maxCombo: 0, averageCombo: 0, totalCombos: 0, perfectCombos: 0  }''
            stage: { stagesCleared: 0, currentStage: 1, bestStageScore: { }, stageCompletionTimes: {},''
            performance: { averageFPS: 60, averageResponseTime: 150, optimalSettings: 'high', recommendedQuality: 'high'
            }
    
    /**
     * デフォルト実績を取得
     */
    private getDefaultAchievements(): UserAchievements { return { unlocked: [],
            total: 0,
    progress: [] };
            recent: [] }
            categories: {}
    
    /**
     * クリーンアップ処理'
     */''
    public cleanup()';
        this.eventBus.off('dataUpdateRequired');
        this.eventBus.off('profileUpdated');
        this.eventBus.off('statisticsUpdated');
        this.eventBus.off('achievementsUpdated';
        ';
        // キャッシュクリア
        this.invalidateCache()';
        console.log('[UserDataManager] クリーンアップ完了');

    }'}