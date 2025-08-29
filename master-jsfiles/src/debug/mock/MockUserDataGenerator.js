import { BaseComponent } from '../BaseComponent.js';

/**
 * MockUserDataGenerator - ユーザー・プレイヤー関連のモックデータ生成コンポーネント
 */
export class MockUserDataGenerator extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'MockUserDataGenerator');
        this.playerNames = [];
        this.achievementTypes = [];
        this.settingOptions = new Map();
    }

    async _doInitialize() {
        this.setupPlayerNames();
        this.setupAchievementTypes();
        this.setupSettingOptions();
    }

    setupPlayerNames() {
        this.playerNames = [
            'Player', 'Gamer', 'BubbleMaster', 'Champion', 'Hero',
            'Legend', 'Pro', 'Ace', 'Star', 'Elite', 'Wizard',
            'Ninja', 'Commander', 'Captain', 'Admiral', 'General'
        ];
    }

    setupAchievementTypes() {
        this.achievementTypes = [
            'first_bubble', 'combo_master', 'speed_demon', 'accuracy_expert',
            'bubble_destroyer', 'level_complete', 'perfect_game', 'marathon_player',
            'special_bubbles', 'boss_killer', 'time_attack', 'survivor',
            'collector', 'explorer', 'strategist', 'master'
        ];
    }

    setupSettingOptions() {
        this.settingOptions.set('audio', ['enabled', 'disabled']);
        this.settingOptions.set('music', ['enabled', 'disabled']);
        this.settingOptions.set('effects', ['enabled', 'disabled']);
        this.settingOptions.set('difficulty', ['easy', 'normal', 'hard', 'expert']);
        this.settingOptions.set('graphics', ['low', 'medium', 'high', 'ultra']);
        this.settingOptions.set('particles', ['off', 'low', 'medium', 'high']);
        this.settingOptions.set('language', ['en', 'ja', 'es', 'fr', 'de']);
    }

    /**
     * プレイヤーデータを生成
     * @param {Object} options - 生成オプション
     * @returns {Object} プレイヤーデータ
     */
    generatePlayerData(options = {}) {
        const playTime = this.mainController.randomInt(3600, 360000); // 1時間～100時間
        const gamesPlayed = this.mainController.randomInt(10, 1000);
        
        return {
            id: this.mainController.generateId(),
            name: options.name || this.generatePlayerName(),
            level: this.mainController.randomInt(1, 50),
            experience: this.mainController.randomInt(0, 100000),
            totalScore: this.mainController.randomInt(1000, 500000),
            highScore: this.mainController.randomInt(5000, 50000),
            gamesPlayed: gamesPlayed,
            gamesWon: this.mainController.randomInt(Math.floor(gamesPlayed * 0.3), Math.floor(gamesPlayed * 0.8)),
            playTime: playTime,
            accuracy: this.mainController.randomFloat(0.3, 0.95),
            averageScore: this.mainController.randomInt(1000, 5000),
            longestCombo: this.mainController.randomInt(5, 50),
            bubblesBurst: this.mainController.randomInt(1000, 50000),
            powerUpsUsed: this.mainController.randomInt(50, 500),
            achievements: this.generatePlayerAchievements(),
            settings: this.generatePlayerSettings(),
            inventory: this.generatePlayerInventory(),
            statistics: this.generateDetailedStatistics(),
            created: Date.now() - this.mainController.randomInt(86400000, 31536000000), // 1日～1年前
            lastPlayed: Date.now() - this.mainController.randomInt(0, 604800000) // 0～1週間前
        };
    }

    /**
     * プレイヤー名を生成
     * @returns {string} プレイヤー名
     */
    generatePlayerName() {
        const baseName = this.mainController.randomChoice(this.playerNames);
        const suffix = this.mainController.randomInt(1, 9999);
        return Math.random() > 0.7 ? `${baseName}${suffix}` : baseName;
    }

    /**
     * 詳細統計を生成
     * @returns {Object} 詳細統計データ
     */
    generateDetailedStatistics() {
        return {
            sessionsToday: this.mainController.randomInt(0, 10),
            averageSessionTime: this.mainController.randomInt(300, 3600),
            favoriteGameMode: this.mainController.randomChoice(['classic', 'time_attack', 'endless', 'puzzle']),
            bestStreak: this.mainController.randomInt(1, 20),
            totalCoins: this.mainController.randomInt(100, 10000),
            coinsSpent: this.mainController.randomInt(50, 5000),
            dailyGoals: {
                completed: this.mainController.randomInt(0, 5),
                total: 5,
                streak: this.mainController.randomInt(0, 30)
            },
            weeklyStats: this.generateWeeklyStats(),
            monthlyStats: this.generateMonthlyStats(),
            bubbleTypeStats: this.generateBubbleTypeStats()
        };
    }

    /**
     * 週間統計を生成
     * @returns {Object} 週間統計
     */
    generateWeeklyStats() {
        return {
            gamesPlayed: this.mainController.randomInt(5, 50),
            totalScore: this.mainController.randomInt(10000, 100000),
            playTime: this.mainController.randomInt(3600, 36000), // 1～10時間
            averageAccuracy: this.mainController.randomFloat(0.4, 0.9),
            bestDay: this.mainController.randomChoice(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
        };
    }

    /**
     * 月間統計を生成
     * @returns {Object} 月間統計
     */
    generateMonthlyStats() {
        return {
            gamesPlayed: this.mainController.randomInt(20, 200),
            totalScore: this.mainController.randomInt(50000, 500000),
            playTime: this.mainController.randomInt(18000, 180000), // 5～50時間
            rank: this.mainController.randomInt(1, 1000),
            improvement: this.mainController.randomFloat(-0.1, 0.3)
        };
    }

    /**
     * 泡タイプ統計を生成
     * @returns {Object} 泡タイプ統計
     */
    generateBubbleTypeStats() {
        const types = ['normal', 'special', 'power', 'boss', 'electric'];
        const stats = {};
        
        types.forEach(type => {
            stats[type] = {
                burst: this.mainController.randomInt(100, 2000),
                missed: this.mainController.randomInt(10, 200),
                accuracy: this.mainController.randomFloat(0.4, 0.9),
                avgScore: this.mainController.randomInt(20, 200)
            };
        });
        
        return stats;
    }

    /**
     * プレイヤー実績を生成
     * @returns {Array} 実績データ
     */
    generatePlayerAchievements() {
        const achievements = [];
        const earnedCount = this.mainController.randomInt(3, 12);
        const earned = this.mainController.shuffleArray([...this.achievementTypes]).slice(0, earnedCount);
        
        earned.forEach(type => {
            achievements.push({
                id: type,
                type: type,
                name: this.getAchievementName(type),
                description: this.getAchievementDescription(type),
                earned: true,
                earnedAt: Date.now() - this.mainController.randomInt(86400000, 2592000000), // 1日～30日前
                progress: 100,
                maxProgress: 100,
                rarity: this.getAchievementRarity(type),
                points: this.mainController.randomInt(10, 100)
            });
        });
        
        return achievements;
    }

    /**
     * 実績名を取得
     * @param {string} type - 実績タイプ
     * @returns {string} 実績名
     */
    getAchievementName(type) {
        const names = {
            'first_bubble': 'First Pop',
            'combo_master': 'Combo Master',
            'speed_demon': 'Speed Demon',
            'accuracy_expert': 'Accuracy Expert',
            'bubble_destroyer': 'Bubble Destroyer',
            'level_complete': 'Level Complete',
            'perfect_game': 'Perfect Game',
            'marathon_player': 'Marathon Player'
        };
        return names[type] || 'Unknown Achievement';
    }

    /**
     * 実績説明を取得
     * @param {string} type - 実績タイプ
     * @returns {string} 実績説明
     */
    getAchievementDescription(type) {
        const descriptions = {
            'first_bubble': 'Pop your first bubble',
            'combo_master': 'Achieve a 20+ combo',
            'speed_demon': 'Complete level in under 30 seconds',
            'accuracy_expert': 'Maintain 90%+ accuracy for 10 levels'
        };
        return descriptions[type] || 'Complete special challenge';
    }

    /**
     * 実績レア度を取得
     * @param {string} type - 実績タイプ
     * @returns {string} レア度
     */
    getAchievementRarity(type) {
        const commonAchievements = ['first_bubble', 'bubble_destroyer', 'level_complete'];
        const rareAchievements = ['perfect_game', 'marathon_player', 'master'];
        
        if (commonAchievements.includes(type)) return 'common';
        if (rareAchievements.includes(type)) return 'rare';
        return 'uncommon';
    }

    /**
     * プレイヤー設定を生成
     * @returns {Object} 設定データ
     */
    generatePlayerSettings() {
        const settings = {};
        
        for (const [key, options] of this.settingOptions) {
            settings[key] = this.mainController.randomChoice(options);
        }
        
        // 追加の数値設定
        settings.masterVolume = this.mainController.randomFloat(0.5, 1.0);
        settings.musicVolume = this.mainController.randomFloat(0.3, 0.8);
        settings.effectsVolume = this.mainController.randomFloat(0.4, 1.0);
        settings.screenShake = this.mainController.randomChoice([true, false]);
        settings.showFPS = this.mainController.randomChoice([true, false]);
        settings.autoSave = true;
        settings.notifications = this.mainController.randomChoice([true, false]);
        
        return settings;
    }

    /**
     * プレイヤーインベントリを生成
     * @returns {Object} インベントリデータ
     */
    generatePlayerInventory() {
        const items = [
            'extra_time', 'multi_shot', 'bomb', 'freeze', 'rainbow',
            'shield', 'magnet', 'double_points', 'accuracy_boost', 'speed_boost'
        ];
        
        const inventory = {};
        items.forEach(item => {
            inventory[item] = this.mainController.randomInt(0, 10);
        });
        
        inventory.coins = this.mainController.randomInt(100, 5000);
        inventory.gems = this.mainController.randomInt(0, 100);
        inventory.tokens = this.mainController.randomInt(0, 50);
        
        return inventory;
    }

    /**
     * 実績データを生成
     * @returns {Array} 実績リスト
     */
    generateAchievements() {
        return this.achievementTypes.map(type => {
            const isEarned = Math.random() > 0.6;
            const progress = isEarned ? 100 : this.mainController.randomInt(0, 99);
            
            return {
                id: type,
                type: type,
                name: this.getAchievementName(type),
                description: this.getAchievementDescription(type),
                earned: isEarned,
                earnedAt: isEarned ? Date.now() - this.mainController.randomInt(86400000, 2592000000) : null,
                progress: progress,
                maxProgress: 100,
                rarity: this.getAchievementRarity(type),
                points: this.mainController.randomInt(10, 100),
                category: this.getAchievementCategory(type)
            };
        });
    }

    /**
     * 実績カテゴリを取得
     * @param {string} type - 実績タイプ
     * @returns {string} カテゴリ
     */
    getAchievementCategory(type) {
        const categories = {
            'first_bubble': 'beginner',
            'combo_master': 'skill',
            'speed_demon': 'speed',
            'accuracy_expert': 'precision',
            'perfect_game': 'mastery',
            'marathon_player': 'endurance'
        };
        return categories[type] || 'general';
    }
}