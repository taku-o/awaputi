/**
 * User Data Manager
 * ユーザーデータ管理 - データ処理、統計計算、永続化処理
 */
export class UserDataManager {
    constructor(gameEngine, eventBus, sceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        // データキャッシュ
        this.dataCache = {
            statistics: null,
            achievements: null,
            profile: null,
            lastUpdate: 0
        };
        
        // 更新間隔（5秒）
        this.CACHE_INTERVAL = 5000;
        
        // データアクセス用のマネージャー
        this.statisticsManager = gameEngine.statisticsManager;
        this.achievementManager = gameEngine.achievementManager;
        this.playerData = gameEngine.playerData;
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        console.log('[UserDataManager] ユーザーデータ管理システムを初期化しました');
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // データ更新イベント
        this.eventBus.on('dataUpdateRequired', () => {
            this.invalidateCache();
        });
        
        // プロフィール更新イベント
        this.eventBus.on('profileUpdated', () => {
            this.invalidateProfileCache();
        });
        
        // 統計更新イベント
        this.eventBus.on('statisticsUpdated', () => {
            this.invalidateStatisticsCache();
        });
        
        // 実績更新イベント
        this.eventBus.on('achievementsUpdated', () => {
            this.invalidateAchievementsCache();
        });
    }
    
    /**
     * ユーザープロフィール情報を取得
     */
    async getUserProfile() {
        if (this.isCacheValid('profile')) {
            return this.dataCache.profile;
        }
        
        try {
            const profile = {
                username: this.playerData ? this.playerData.username : 'プレイヤー',
                level: this.calculatePlayerLevel(),
                experience: this.calculateTotalExperience(),
                joinDate: this.playerData ? this.playerData.joinDate : new Date(),
                totalPlaytime: this.getTotalPlaytime(),
                gamesPlayed: this.getTotalGamesPlayed(),
                lastActive: new Date()
            };
            
            this.dataCache.profile = profile;
            this.updateCacheTime('profile');
            
            return profile;
            
        } catch (error) {
            console.error('[UserDataManager] プロフィール取得エラー:', error);
            return this.getDefaultProfile();
        }
    }
    
    /**
     * 統計情報を取得
     */
    async getUserStatistics() {
        if (this.isCacheValid('statistics')) {
            return this.dataCache.statistics;
        }
        
        try {
            const statistics = {
                basic: this.getBasicStatistics(),
                bubble: this.getBubbleStatistics(),
                combo: this.getComboStatistics(),
                stage: this.getStageStatistics(),
                performance: this.getPerformanceStatistics()
            };
            
            this.dataCache.statistics = statistics;
            this.updateCacheTime('statistics');
            
            return statistics;
            
        } catch (error) {
            console.error('[UserDataManager] 統計取得エラー:', error);
            return this.getDefaultStatistics();
        }
    }
    
    /**
     * 実績情報を取得
     */
    async getUserAchievements() {
        if (this.isCacheValid('achievements')) {
            return this.dataCache.achievements;
        }
        
        try {
            const achievements = {
                unlocked: this.getUnlockedAchievements(),
                total: this.getTotalAchievements(),
                progress: this.getAchievementProgress(),
                recent: this.getRecentAchievements(),
                categories: this.getAchievementsByCategory()
            };
            
            this.dataCache.achievements = achievements;
            this.updateCacheTime('achievements');
            
            return achievements;
            
        } catch (error) {
            console.error('[UserDataManager] 実績取得エラー:', error);
            return this.getDefaultAchievements();
        }
    }
    
    /**
     * 基本統計情報を取得
     */
    getBasicStatistics() {
        const stats = this.statisticsManager ? 
            this.statisticsManager.getStatistics() : 
            {};
        
        return {
            totalScore: stats.totalScore || 0,
            averageScore: stats.averageScore || 0,
            bestScore: stats.bestScore || 0,
            totalPlaytime: stats.totalPlaytime || 0,
            gamesPlayed: stats.gamesPlayed || 0
        };
    }
    
    /**
     * 泡統計情報を取得
     */
    getBubbleStatistics() {
        const stats = this.statisticsManager ? 
            this.statisticsManager.getBubbleStatistics() : 
            {};
        
        return {
            totalPopped: stats.totalBubblesPopped || 0,
            normalPopped: stats.normalBubblesPopped || 0,
            specialPopped: stats.specialBubblesPopped || 0,
            bossDefeated: stats.bossDefeated || 0,
            electricActivated: stats.electricActivated || 0,
            favoriteType: stats.favoriteType || 'normal'
        };
    }
    
    /**
     * コンボ統計情報を取得
     */
    getComboStatistics() {
        const stats = this.statisticsManager ? 
            this.statisticsManager.getComboStatistics() : 
            {};
        
        return {
            maxCombo: stats.maxCombo || 0,
            averageCombo: stats.averageCombo || 0,
            totalCombos: stats.totalCombos || 0,
            perfectCombos: stats.perfectCombos || 0
        };
    }
    
    /**
     * ステージ統計情報を取得
     */
    getStageStatistics() {
        const stats = this.statisticsManager ? 
            this.statisticsManager.getStageStatistics() : 
            {};
        
        return {
            stagesCleared: stats.stagesCleared || 0,
            currentStage: stats.currentStage || 1,
            bestStageScore: stats.bestStageScore || {},
            stageCompletionTimes: stats.stageCompletionTimes || {}
        };
    }
    
    /**
     * パフォーマンス統計情報を取得
     */
    getPerformanceStatistics() {
        return {
            averageFPS: 60,
            averageResponseTime: 150,
            optimalSettings: 'high',
            recommendedQuality: 'high'
        };
    }
    
    /**
     * プレイヤーレベルを計算
     */
    calculatePlayerLevel() {
        const totalScore = this.statisticsManager ? 
            this.statisticsManager.getStatistics().totalScore || 0 : 
            0;
        
        return Math.floor(totalScore / 10000) + 1;
    }
    
    /**
     * 総経験値を計算
     */
    calculateTotalExperience() {
        const stats = this.statisticsManager ? 
            this.statisticsManager.getStatistics() : 
            {};
        
        return (stats.totalScore || 0) + (stats.gamesPlayed || 0) * 100;
    }
    
    /**
     * 総プレイ時間を取得
     */
    getTotalPlaytime() {
        const stats = this.statisticsManager ? 
            this.statisticsManager.getStatistics() : 
            {};
        
        return stats.totalPlaytime || 0;
    }
    
    /**
     * 総ゲームプレイ数を取得
     */
    getTotalGamesPlayed() {
        const stats = this.statisticsManager ? 
            this.statisticsManager.getStatistics() : 
            {};
        
        return stats.gamesPlayed || 0;
    }
    
    /**
     * 解除済み実績を取得
     */
    getUnlockedAchievements() {
        if (!this.achievementManager) return [];
        
        return this.achievementManager.getAchievements()
            .filter(achievement => achievement.unlocked)
            .map(achievement => ({
                id: achievement.id,
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                unlockedAt: achievement.unlockedAt
            }));
    }
    
    /**
     * 実績総数を取得
     */
    getTotalAchievements() {
        if (!this.achievementManager) return 0;
        
        return this.achievementManager.getAchievements().length;
    }
    
    /**
     * 実績進捗を取得
     */
    getAchievementProgress() {
        if (!this.achievementManager) return [];
        
        return this.achievementManager.getAchievements()
            .filter(achievement => !achievement.unlocked && achievement.progress)
            .map(achievement => ({
                id: achievement.id,
                name: achievement.name,
                progress: achievement.progress,
                maxProgress: achievement.maxProgress,
                percentage: Math.round((achievement.progress / achievement.maxProgress) * 100)
            }));
    }
    
    /**
     * 最近の実績を取得
     */
    getRecentAchievements() {
        if (!this.achievementManager) return [];
        
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        
        return this.achievementManager.getAchievements()
            .filter(achievement => 
                achievement.unlocked && 
                achievement.unlockedAt && 
                achievement.unlockedAt.getTime() > oneWeekAgo
            )
            .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
            .slice(0, 5);
    }
    
    /**
     * カテゴリ別実績を取得
     */
    getAchievementsByCategory() {
        if (!this.achievementManager) return {};
        
        const achievements = this.achievementManager.getAchievements();
        const categories = {};
        
        achievements.forEach(achievement => {
            const category = achievement.category || 'その他';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(achievement);
        });
        
        return categories;
    }
    
    /**
     * ユーザー名を更新
     */
    async updateUsername(newUsername) {
        try {
            if (this.playerData && this.playerData.setUsername) {
                this.playerData.setUsername(newUsername);
            }
            
            this.invalidateProfileCache();
            this.eventBus.emit('usernameUpdated', newUsername);
            
            console.log(`[UserDataManager] ユーザー名を更新: ${newUsername}`);
            return true;
            
        } catch (error) {
            console.error('[UserDataManager] ユーザー名更新エラー:', error);
            return false;
        }
    }
    
    /**
     * データをエクスポート
     */
    async exportUserData() {
        try {
            const [profile, statistics, achievements] = await Promise.all([
                this.getUserProfile(),
                this.getUserStatistics(),
                this.getUserAchievements()
            ]);
            
            const exportData = {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                profile,
                statistics,
                achievements: achievements.unlocked,
                settings: this.gameEngine.settings || {}
            };
            
            console.log('[UserDataManager] データエクスポート完了');
            return exportData;
            
        } catch (error) {
            console.error('[UserDataManager] データエクスポートエラー:', error);
            throw error;
        }
    }
    
    /**
     * データをインポート
     */
    async importUserData(importData) {
        try {
            // データの検証
            if (!importData || !importData.version) {
                throw new Error('無効なインポートデータです');
            }
            
            // プロフィールの復元
            if (importData.profile && importData.profile.username) {
                await this.updateUsername(importData.profile.username);
            }
            
            // 統計の復元（可能な場合）
            if (importData.statistics && this.statisticsManager) {
                // 統計マネージャーにインポート機能があれば使用
                if (this.statisticsManager.importStatistics) {
                    this.statisticsManager.importStatistics(importData.statistics);
                }
            }
            
            // すべてのキャッシュを無効化
            this.invalidateCache();
            
            console.log('[UserDataManager] データインポート完了');
            return true;
            
        } catch (error) {
            console.error('[UserDataManager] データインポートエラー:', error);
            throw error;
        }
    }
    
    /**
     * キャッシュの有効性をチェック
     */
    isCacheValid(type) {
        if (!this.dataCache[type]) return false;
        
        const now = Date.now();
        const lastUpdate = this.dataCache.lastUpdate || 0;
        
        return (now - lastUpdate) < this.CACHE_INTERVAL;
    }
    
    /**
     * キャッシュを無効化
     */
    invalidateCache() {
        this.dataCache = {
            statistics: null,
            achievements: null,
            profile: null,
            lastUpdate: 0
        };
    }
    
    invalidateProfileCache() {
        this.dataCache.profile = null;
    }
    
    invalidateStatisticsCache() {
        this.dataCache.statistics = null;
    }
    
    invalidateAchievementsCache() {
        this.dataCache.achievements = null;
    }
    
    /**
     * キャッシュ時間を更新
     */
    updateCacheTime(type) {
        this.dataCache.lastUpdate = Date.now();
    }
    
    /**
     * デフォルトプロフィールを取得
     */
    getDefaultProfile() {
        return {
            username: 'プレイヤー',
            level: 1,
            experience: 0,
            joinDate: new Date(),
            totalPlaytime: 0,
            gamesPlayed: 0,
            lastActive: new Date()
        };
    }
    
    /**
     * デフォルト統計を取得
     */
    getDefaultStatistics() {
        return {
            basic: { totalScore: 0, averageScore: 0, bestScore: 0, totalPlaytime: 0, gamesPlayed: 0 },
            bubble: { totalPopped: 0, normalPopped: 0, specialPopped: 0, bossDefeated: 0, electricActivated: 0, favoriteType: 'normal' },
            combo: { maxCombo: 0, averageCombo: 0, totalCombos: 0, perfectCombos: 0 },
            stage: { stagesCleared: 0, currentStage: 1, bestStageScore: {}, stageCompletionTimes: {} },
            performance: { averageFPS: 60, averageResponseTime: 150, optimalSettings: 'high', recommendedQuality: 'high' }
        };
    }
    
    /**
     * デフォルト実績を取得
     */
    getDefaultAchievements() {
        return {
            unlocked: [],
            total: 0,
            progress: [],
            recent: [],
            categories: {}
        };
    }
    
    /**
     * クリーンアップ処理
     */
    cleanup() {
        // イベントリスナーの削除
        this.eventBus.off('dataUpdateRequired');
        this.eventBus.off('profileUpdated');
        this.eventBus.off('statisticsUpdated');
        this.eventBus.off('achievementsUpdated');
        
        // キャッシュクリア
        this.invalidateCache();
        
        console.log('[UserDataManager] クリーンアップ完了');
    }
}