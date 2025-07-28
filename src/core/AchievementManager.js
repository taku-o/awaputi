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
            },
            
            // 追加スコア実績
            megaScore: {
                id: 'megaScore',
                name: 'メガスコア',
                description: '1回のゲームで50000点を獲得',
                icon: '💫',
                type: 'single',
                condition: { type: 'singleGameScore', value: 50000 },
                reward: { ap: 250 }
            },
            scoreGod: {
                id: 'scoreGod',
                name: 'スコアゴッド',
                description: '1回のゲームで100000点を獲得',
                icon: '🌟',
                type: 'single',
                condition: { type: 'singleGameScore', value: 100000 },
                reward: { ap: 500 }
            },
            cumulativeScoreBronze: {
                id: 'cumulativeScoreBronze',
                name: '累計ブロンズ',
                description: '累計100000点を獲得',
                icon: '🥉',
                type: 'cumulative',
                condition: { type: 'cumulativeScore', value: 100000 },
                reward: { ap: 100 }
            },
            cumulativeScoreSilver: {
                id: 'cumulativeScoreSilver',
                name: '累計シルバー',
                description: '累計500000点を獲得',
                icon: '🥈',
                type: 'cumulative',
                condition: { type: 'cumulativeScore', value: 500000 },
                reward: { ap: 200 }
            },
            cumulativeScoreGold: {
                id: 'cumulativeScoreGold',
                name: '累計ゴールド',
                description: '累計1000000点を獲得',
                icon: '🥇',
                type: 'cumulative',
                condition: { type: 'cumulativeScore', value: 1000000 },
                reward: { ap: 500 }
            },
            
            // 追加プレイ実績
            consecutiveDays3: {
                id: 'consecutiveDays3',
                name: '3日連続',
                description: '3日連続でプレイ',
                icon: '📅',
                type: 'single',
                condition: { type: 'consecutiveDays', value: 3 },
                reward: { ap: 50 }
            },
            consecutiveDays7: {
                id: 'consecutiveDays7',
                name: 'ウィークプレイヤー',
                description: '7日連続でプレイ',
                icon: '🗓️',
                type: 'single',
                condition: { type: 'consecutiveDays', value: 7 },
                reward: { ap: 150 }
            },
            consecutiveDays30: {
                id: 'consecutiveDays30',
                name: 'マンスリープレイヤー',
                description: '30日連続でプレイ',
                icon: '🏅',
                type: 'single',
                condition: { type: 'consecutiveDays', value: 30 },
                reward: { ap: 500 }
            },
            totalPlayTime1h: {
                id: 'totalPlayTime1h',
                name: '1時間プレイ',
                description: '累計1時間プレイ',
                icon: '⏰',
                type: 'cumulative',
                condition: { type: 'totalPlayTime', value: 3600000 },
                reward: { ap: 75 }
            },
            totalPlayTime10h: {
                id: 'totalPlayTime10h',
                name: '10時間プレイ',
                description: '累計10時間プレイ',
                icon: '⏳',
                type: 'cumulative',
                condition: { type: 'totalPlayTime', value: 36000000 },
                reward: { ap: 200 }
            },
            gamesPlayed50: {
                id: 'gamesPlayed50',
                name: '50ゲーム達成',
                description: '50回ゲームをプレイ',
                icon: '🎮',
                type: 'cumulative',
                condition: { type: 'gamesPlayed', value: 50 },
                reward: { ap: 100 }
            },
            gamesPlayed500: {
                id: 'gamesPlayed500',
                name: '500ゲーム達成',
                description: '500回ゲームをプレイ',
                icon: '🎯',
                type: 'cumulative',
                condition: { type: 'gamesPlayed', value: 500 },
                reward: { ap: 300 }
            },
            
            // 追加テクニック実績
            comboLegend: {
                id: 'comboLegend',
                name: 'コンボレジェンド',
                description: '100コンボを達成',
                icon: '🔥',
                type: 'single',
                condition: { type: 'maxCombo', value: 100 },
                reward: { ap: 300 }
            },
            comboGod: {
                id: 'comboGod',
                name: 'コンボゴッド',
                description: '200コンボを達成',
                icon: '🌪️',
                type: 'single',
                condition: { type: 'maxCombo', value: 200 },
                reward: { ap: 500 }
            },
            accuracyExpert: {
                id: 'accuracyExpert',
                name: '精密射手',
                description: '95%以上の精度でゲームを完了',
                icon: '🎯',
                type: 'single',
                condition: { type: 'accuracy', value: 95 },
                reward: { ap: 200 }
            },
            accuracyMaster: {
                id: 'accuracyMaster',
                name: '精密マスター',
                description: '99%以上の精度でゲームを完了',
                icon: '🏹',
                type: 'single',
                condition: { type: 'accuracy', value: 99 },
                reward: { ap: 400 }
            },
            
            // 特殊泡実績拡張
            explosiveExpert: {
                id: 'explosiveExpert',
                name: '爆発エキスパート',
                description: '爆発泡を20個割る',
                icon: '💥',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'explosive', value: 20 },
                reward: { ap: 150 }
            },
            magneticMaster: {
                id: 'magneticMaster',
                name: '磁力マスター',
                description: '磁力泡を15個割る',
                icon: '🧲',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'magnetic', value: 15 },
                reward: { ap: 120 }
            },
            frozenBreaker: {
                id: 'frozenBreaker',
                name: 'アイスブレイカー',
                description: '氷結泡を25個割る',
                icon: '❄️',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'frozen', value: 25 },
                reward: { ap: 100 }
            },
            multiplierChaser: {
                id: 'multiplierChaser',
                name: '倍率ハンター',
                description: 'マルチプライヤー泡を10個割る',
                icon: '✖️',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'multiplier', value: 10 },
                reward: { ap: 180 }
            },
            
            // コレクション実績
            bubbleCollector: {
                id: 'bubbleCollector',
                name: '泡コレクター',
                description: '全種類の泡を少なくとも1個ずつ割る',
                icon: '🗂️',
                type: 'single',
                condition: { type: 'allBubbleTypes', value: true },
                reward: { ap: 300 }
            },
            stageCompletionist: {
                id: 'stageCompletionist',
                name: 'ステージコンプリート',
                description: '各ステージを10回ずつクリア',
                icon: '📋',
                type: 'single',
                condition: { type: 'allStagesMultiple', value: 10 },
                reward: { ap: 400 }
            },
            
            // 特殊チャレンジ実績
            noItemChallenge: {
                id: 'noItemChallenge',
                name: 'ピュアプレイヤー',
                description: 'アイテム使用なしで5000点を獲得',
                icon: '🚫',
                type: 'single',
                condition: { type: 'noItemScore', value: 5000 },
                reward: { ap: 250 }
            },
            lowHpHero: {
                id: 'lowHpHero',
                name: 'ローHPヒーロー',
                description: 'HP5以下で2分間生き残る',
                icon: '❤️',
                type: 'single',
                condition: { type: 'lowHpSurvival', hp: 5, time: 120000 },
                reward: { ap: 200 }
            },
            nightOwl: {
                id: 'nightOwl',
                name: 'ナイトオウル',
                description: '夜中（23:00-5:00）にプレイして1000点獲得',
                icon: '🦉',
                type: 'single',
                condition: { type: 'nightTimeScore', value: 1000 },
                reward: { ap: 100 }
            },
            marathonPlayer: {
                id: 'marathonPlayer',
                name: 'マラソンプレイヤー',
                description: '1回のセッションで1時間プレイ',
                icon: '🏃',
                type: 'single',
                condition: { type: 'sessionPlayTime', value: 3600000 },
                reward: { ap: 250 }
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
                
            case 'cumulativeScore':
                if (eventType === 'gameEnd') {
                    this.progressData.totalScore = (this.progressData.totalScore || 0) + data.finalScore;
                    return this.progressData.totalScore >= condition.value;
                }
                break;
                
            case 'consecutiveDays':
                if (eventType === 'dayPlayed') {
                    this.updateConsecutiveDays(data.date);
                    return this.progressData.consecutiveDays >= condition.value;
                }
                break;
                
            case 'totalPlayTime':
                if (eventType === 'gameEnd') {
                    this.progressData.totalPlayTime = (this.progressData.totalPlayTime || 0) + data.playTime;
                    return this.progressData.totalPlayTime >= condition.value;
                }
                break;
                
            case 'gamesPlayed':
                if (eventType === 'gameEnd') {
                    this.progressData.gamesPlayed = (this.progressData.gamesPlayed || 0) + 1;
                    return this.progressData.gamesPlayed >= condition.value;
                }
                break;
                
            case 'accuracy':
                if (eventType === 'gameEnd') {
                    const accuracy = (data.bubblesPopped / (data.bubblesPopped + data.bubblesMissed)) * 100;
                    return accuracy >= condition.value;
                }
                break;
                
            case 'allBubbleTypes':
                if (eventType === 'bubblePopped') {
                    this.progressData.bubbleTypesPopped = this.progressData.bubbleTypesPopped || new Set();
                    this.progressData.bubbleTypesPopped.add(data.bubbleType);
                    // 全バブルタイプ数（18個の基本タイプ + 新タイプ）
                    const totalBubbleTypes = 18; // 必要に応じて調整
                    return this.progressData.bubbleTypesPopped.size >= totalBubbleTypes;
                }
                break;
                
            case 'allStagesMultiple':
                if (eventType === 'stageCleared') {
                    const stageKey = `stage_${data.stageId}_cleared`;
                    this.progressData[stageKey] = (this.progressData[stageKey] || 0) + 1;
                    
                    // 全ステージが指定回数クリアされているかチェック
                    const totalStages = Object.keys(this.gameEngine.stageManager.stageConfigs).length;
                    let allStagesCleared = true;
                    for (let i = 0; i < totalStages; i++) {
                        const key = `stage_${i}_cleared`;
                        if ((this.progressData[key] || 0) < condition.value) {
                            allStagesCleared = false;
                            break;
                        }
                    }
                    return allStagesCleared;
                }
                break;
                
            case 'noItemScore':
                if (eventType === 'gameEnd') {
                    return data.finalScore >= condition.value && !data.itemsUsed;
                }
                break;
                
            case 'nightTimeScore':
                if (eventType === 'gameEnd') {
                    const hour = new Date().getHours();
                    const isNightTime = hour >= 23 || hour < 5;
                    return isNightTime && data.finalScore >= condition.value;
                }
                break;
                
            case 'sessionPlayTime':
                if (eventType === 'sessionEnd') {
                    return data.sessionDuration >= condition.value;
                }
                break;
        }
        
        return false;
    }
    
    /**
     * 連続日数を更新
     */
    updateConsecutiveDays(currentDate) {
        const today = new Date(currentDate).toDateString();
        const lastPlayDate = this.progressData.lastPlayDate;
        
        if (!lastPlayDate) {
            this.progressData.consecutiveDays = 1;
        } else {
            const lastDate = new Date(lastPlayDate);
            const todayDate = new Date(today);
            const dayDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === 1) {
                // 連続している
                this.progressData.consecutiveDays = (this.progressData.consecutiveDays || 0) + 1;
            } else if (dayDiff === 0) {
                // 同じ日（更新しない）
                return;
            } else {
                // 連続が途切れた
                this.progressData.consecutiveDays = 1;
            }
        }
        
        this.progressData.lastPlayDate = today;
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
            progress: this.getAchievementProgress(achievement),
            category: this.getAchievementCategory(achievement)
        }));
    }
    
    /**
     * カテゴリ別実績を取得
     */
    getAchievementsByCategory() {
        const achievements = this.getAchievements();
        const categories = {
            score: { name: 'スコア系', achievements: [] },
            play: { name: 'プレイ系', achievements: [] },
            technique: { name: 'テクニック系', achievements: [] },
            collection: { name: 'コレクション系', achievements: [] },
            special: { name: '特殊', achievements: [] }
        };
        
        achievements.forEach(achievement => {
            const category = achievement.category;
            if (categories[category]) {
                categories[category].achievements.push(achievement);
            } else {
                categories.special.achievements.push(achievement);
            }
        });
        
        return categories;
    }
    
    /**
     * 実績のカテゴリを取得
     */
    getAchievementCategory(achievement) {
        const condition = achievement.condition;
        
        if (['singleGameScore', 'cumulativeScore'].includes(condition.type)) {
            return 'score';
        }
        if (['consecutiveDays', 'totalPlayTime', 'gamesPlayed'].includes(condition.type)) {
            return 'play';
        }
        if (['maxCombo', 'accuracy', 'speedChallenge', 'perfectGame'].includes(condition.type)) {
            return 'technique';
        }
        if (['allBubbleTypes', 'allStagesCleared', 'allStagesMultiple', 'stagesCleared'].includes(condition.type)) {
            return 'collection';
        }
        
        return 'special';
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
                
            case 'cumulativeScore':
                return {
                    current: this.progressData.totalScore || 0,
                    target: condition.value
                };
                
            case 'consecutiveDays':
                return {
                    current: this.progressData.consecutiveDays || 0,
                    target: condition.value
                };
                
            case 'totalPlayTime':
                return {
                    current: this.progressData.totalPlayTime || 0,
                    target: condition.value
                };
                
            case 'gamesPlayed':
                return {
                    current: this.progressData.gamesPlayed || 0,
                    target: condition.value
                };
                
            case 'allBubbleTypes':
                const bubbleTypesPopped = this.progressData.bubbleTypesPopped ? 
                    this.progressData.bubbleTypesPopped.size : 0;
                return {
                    current: bubbleTypesPopped,
                    target: 18 // 全バブルタイプ数
                };
                
            case 'allStagesMultiple':
                const totalStages = this.gameEngine ? 
                    Object.keys(this.gameEngine.stageManager.stageConfigs).length : 10;
                let completedStages = 0;
                for (let i = 0; i < totalStages; i++) {
                    const key = `stage_${i}_cleared`;
                    if ((this.progressData[key] || 0) >= condition.value) {
                        completedStages++;
                    }
                }
                return {
                    current: completedStages,
                    target: totalStages
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
            // Setオブジェクトを配列に変換して保存
            const progressDataForSave = { ...this.progressData };
            if (this.progressData.bubbleTypesPopped instanceof Set) {
                progressDataForSave.bubbleTypesPopped = Array.from(this.progressData.bubbleTypesPopped);
            }
            
            const data = {
                unlockedAchievements: Array.from(this.unlockedAchievements),
                progressData: progressDataForSave
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
                
                // 配列からSetオブジェクトに復元
                if (Array.isArray(this.progressData.bubbleTypesPopped)) {
                    this.progressData.bubbleTypesPopped = new Set(this.progressData.bubbleTypesPopped);
                }
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