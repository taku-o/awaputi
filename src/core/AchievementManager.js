/**
 * 実績管理クラス
 */
export class AchievementManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.achievements = this.initializeAchievements();
        this.unlockedAchievements = new Set();
        this.progressData = {};
        this.notifications = [];
    }
    
    /**
     * 実績を初期化
     */
    initializeAchievements() {
        return {
            // 基本プレイ実績
            firstBubble: {
                id: 'firstBubble',
                name: '初めての泡',
                description: '初めて泡を割る',
                icon: '🎈',
                type: 'single',
                condition: { type: 'bubblesPopped', value: 1 },
                reward: { ap: 10 }
            },
            bubbleHunter: {
                id: 'bubbleHunter',
                name: '泡ハンター',
                description: '100個の泡を割る',
                icon: '🏹',
                type: 'cumulative',
                condition: { type: 'bubblesPopped', value: 100 },
                reward: { ap: 50 }
            },
            bubbleMaster: {
                id: 'bubbleMaster',
                name: '泡マスター',
                description: '1000個の泡を割る',
                icon: '👑',
                type: 'cumulative',
                condition: { type: 'bubblesPopped', value: 1000 },
                reward: { ap: 200 }
            },
            
            // スコア実績
            firstThousand: {
                id: 'firstThousand',
                name: '千点突破',
                description: '1回のゲームで1000点を獲得',
                icon: '⭐',
                type: 'single',
                condition: { type: 'singleGameScore', value: 1000 },
                reward: { ap: 25 }
            },
            scoreKing: {
                id: 'scoreKing',
                name: 'スコアキング',
                description: '1回のゲームで10000点を獲得',
                icon: '👑',
                type: 'single',
                condition: { type: 'singleGameScore', value: 10000 },
                reward: { ap: 100 }
            },
            
            // コンボ実績
            comboStarter: {
                id: 'comboStarter',
                name: 'コンボスターター',
                description: '10コンボを達成',
                icon: '🔥',
                type: 'single',
                condition: { type: 'maxCombo', value: 10 },
                reward: { ap: 30 }
            },
            comboMaster: {
                id: 'comboMaster',
                name: 'コンボマスター',
                description: '50コンボを達成',
                icon: '💥',
                type: 'single',
                condition: { type: 'maxCombo', value: 50 },
                reward: { ap: 150 }
            },
            
            // 特殊泡実績
            rainbowHunter: {
                id: 'rainbowHunter',
                name: '虹色ハンター',
                description: '虹色の泡を10個割る',
                icon: '🌈',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'rainbow', value: 10 },
                reward: { ap: 75 }
            },
            diamondBreaker: {
                id: 'diamondBreaker',
                name: 'ダイヤモンドブレイカー',
                description: 'ダイヤモンドの泡を5個割る',
                icon: '💎',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'diamond', value: 5 },
                reward: { ap: 100 }
            },
            bossSlayer: {
                id: 'bossSlayer',
                name: 'ボススレイヤー',
                description: 'ボス泡を3個割る',
                icon: '⚔️',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'boss', value: 3 },
                reward: { ap: 200 }
            },
            
            // 新しい泡タイプ実績
            goldenTouch: {
                id: 'goldenTouch',
                name: '黄金の手',
                description: '黄金の泡を5個割る',
                icon: '✨',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'golden', value: 5 },
                reward: { ap: 80 }
            },
            phantomHunter: {
                id: 'phantomHunter',
                name: '幻影ハンター',
                description: '幻の泡を10個割る（すり抜けを含む）',
                icon: '👻',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'phantom', value: 10 },
                reward: { ap: 120 }
            },
            
            // サバイバル実績
            survivor: {
                id: 'survivor',
                name: 'サバイバー',
                description: '5分間生き残る',
                icon: '🛡️',
                type: 'single',
                condition: { type: 'survivalTime', value: 300000 },
                reward: { ap: 100 }
            },
            ironWill: {
                id: 'ironWill',
                name: '鉄の意志',
                description: 'HP10以下で1分間生き残る',
                icon: '💪',
                type: 'single',
                condition: { type: 'lowHpSurvival', hp: 10, time: 60000 },
                reward: { ap: 150 }
            },
            
            // ステージ実績
            stageExplorer: {
                id: 'stageExplorer',
                name: 'ステージ探検家',
                description: '5つのステージをクリア',
                icon: '🗺️',
                type: 'cumulative',
                condition: { type: 'stagesCleared', value: 5 },
                reward: { ap: 100 }
            },
            allStagesClear: {
                id: 'allStagesClear',
                name: '全ステージ制覇',
                description: '全てのステージをクリア',
                icon: '🏆',
                type: 'single',
                condition: { type: 'allStagesCleared', value: true },
                reward: { ap: 500 }
            },
            
            // 特殊実績
            perfectionist: {
                id: 'perfectionist',
                name: '完璧主義者',
                description: '1回のゲームで泡を一度も逃さない（50個以上）',
                icon: '🎯',
                type: 'single',
                condition: { type: 'perfectGame', minBubbles: 50 },
                reward: { ap: 300 }
            },
            speedster: {
                id: 'speedster',
                name: 'スピードスター',
                description: '1分以内に100個の泡を割る',
                icon: '⚡',
                type: 'single',
                condition: { type: 'speedChallenge', bubbles: 100, time: 60000 },
                reward: { ap: 200 }
            }
        };
    }
    
    /**
     * 実績の進捗を更新
     */
    updateProgress(eventType, data) {
        Object.values(this.achievements).forEach(achievement => {
            if (this.unlockedAchievements.has(achievement.id)) {
                return; // 既に解除済み
            }
            
            if (this.checkAchievementCondition(achievement, eventType, data)) {
                this.unlockAchievement(achievement);
            }
        });
    }
    
    /**
     * 実績条件をチェック
     */
    checkAchievementCondition(achievement, eventType, data) {
        const condition = achievement.condition;
        
        switch (condition.type) {
            case 'bubblesPopped':
                if (eventType === 'bubblePopped') {
                    this.progressData.totalBubblesPopped = (this.progressData.totalBubblesPopped || 0) + 1;
                    return this.progressData.totalBubblesPopped >= condition.value;
                }
                break;
                
            case 'singleGameScore':
                if (eventType === 'gameEnd') {
                    return data.finalScore >= condition.value;
                }
                break;
                
            case 'maxCombo':
                if (eventType === 'comboUpdate') {
                    this.progressData.maxCombo = Math.max(this.progressData.maxCombo || 0, data.combo);
                    return this.progressData.maxCombo >= condition.value;
                }
                break;
                
            case 'bubbleTypePopped':
                if (eventType === 'bubblePopped' && data.bubbleType === condition.bubbleType) {
                    const key = `${condition.bubbleType}Popped`;
                    this.progressData[key] = (this.progressData[key] || 0) + 1;
                    return this.progressData[key] >= condition.value;
                }
                break;
                
            case 'survivalTime':
                if (eventType === 'gameEnd') {
                    return data.playTime >= condition.value;
                }
                break;
                
            case 'lowHpSurvival':
                if (eventType === 'lowHpSurvival') {
                    return data.hp <= condition.hp && data.survivalTime >= condition.time;
                }
                break;
                
            case 'stagesCleared':
                if (eventType === 'stageCleared') {
                    this.progressData.stagesCleared = (this.progressData.stagesCleared || 0) + 1;
                    return this.progressData.stagesCleared >= condition.value;
                }
                break;
                
            case 'allStagesCleared':
                if (eventType === 'stageCleared') {
                    const totalStages = Object.keys(this.gameEngine.stageManager.stageConfigs).length;
                    const clearedStages = this.progressData.stagesCleared || 0;
                    return clearedStages >= totalStages;
                }
                break;
                
            case 'perfectGame':
                if (eventType === 'gameEnd') {
                    return data.bubblesPopped >= condition.minBubbles && data.bubblesMissed === 0;
                }
                break;
                
            case 'speedChallenge':
                if (eventType === 'speedCheck') {
                    return data.bubblesPopped >= condition.bubbles && data.timeElapsed <= condition.time;
                }
                break;
        }
        
        return false;
    }
    
    /**
     * 実績を解除
     */
    unlockAchievement(achievement) {
        this.unlockedAchievements.add(achievement.id);
        
        // 報酬を付与
        if (achievement.reward.ap) {
            this.gameEngine.playerData.ap += achievement.reward.ap;
            this.gameEngine.playerData.tap += achievement.reward.ap;
        }
        
        // 通知を追加
        this.notifications.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            reward: achievement.reward,
            timestamp: Date.now()
        });
        
        console.log(`Achievement unlocked: ${achievement.name}`);
        
        // データを保存
        this.save();
    }
    
    /**
     * 実績通知を取得
     */
    getNotifications() {
        const notifications = [...this.notifications];
        this.notifications = []; // 通知をクリア
        return notifications;
    }
    
    /**
     * 実績一覧を取得
     */
    getAchievements() {
        return Object.values(this.achievements).map(achievement => ({
            ...achievement,
            unlocked: this.unlockedAchievements.has(achievement.id),
            progress: this.getAchievementProgress(achievement)
        }));
    }
    
    /**
     * 実績の進捗を取得
     */
    getAchievementProgress(achievement) {
        const condition = achievement.condition;
        
        switch (condition.type) {
            case 'bubblesPopped':
                return {
                    current: this.progressData.totalBubblesPopped || 0,
                    target: condition.value
                };
                
            case 'bubbleTypePopped':
                const key = `${condition.bubbleType}Popped`;
                return {
                    current: this.progressData[key] || 0,
                    target: condition.value
                };
                
            case 'maxCombo':
                return {
                    current: this.progressData.maxCombo || 0,
                    target: condition.value
                };
                
            case 'stagesCleared':
                return {
                    current: this.progressData.stagesCleared || 0,
                    target: condition.value
                };
                
            default:
                return { current: 0, target: 1 };
        }
    }
    
    /**
     * 統計情報を取得
     */
    getStatistics() {
        return {
            totalAchievements: Object.keys(this.achievements).length,
            unlockedAchievements: this.unlockedAchievements.size,
            completionRate: (this.unlockedAchievements.size / Object.keys(this.achievements).length * 100).toFixed(1),
            totalRewardsEarned: this.calculateTotalRewards(),
            progressData: { ...this.progressData }
        };
    }
    
    /**
     * 獲得した報酬の合計を計算
     */
    calculateTotalRewards() {
        let totalAP = 0;
        
        this.unlockedAchievements.forEach(achievementId => {
            const achievement = this.achievements[achievementId];
            if (achievement && achievement.reward.ap) {
                totalAP += achievement.reward.ap;
            }
        });
        
        return { ap: totalAP };
    }
    
    /**
     * データを保存
     */
    save() {
        try {
            const data = {
                unlockedAchievements: Array.from(this.unlockedAchievements),
                progressData: this.progressData
            };
            
            localStorage.setItem('bubblePop_achievements', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save achievement data:', error);
        }
    }
    
    /**
     * データを読み込み
     */
    load() {
        try {
            const savedData = localStorage.getItem('bubblePop_achievements');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.unlockedAchievements = new Set(data.unlockedAchievements || []);
                this.progressData = data.progressData || {};
            }
        } catch (error) {
            console.error('Failed to load achievement data:', error);
            this.unlockedAchievements = new Set();
            this.progressData = {};
        }
    }
    
    /**
     * データをリセット
     */
    reset() {
        this.unlockedAchievements.clear();
        this.progressData = {};
        this.notifications = [];
        this.save();
    }
}