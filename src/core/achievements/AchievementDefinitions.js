/**
 * AchievementDefinitions - Achievement system definitions
 * 実績システム定義 - 全実績の定義とカテゴリ管理
 * 
 * 実績カテゴリ:
 * - 基本プレイ実績（泡割り、ゲーム数など）
 * - スコア実績（単発・累計スコア）
 * - コンボ実績（コンボ数達成）
 * - 特殊泡実績（泡タイプ別）
 * - サバイバル実績（生存時間）
 * - ステージ実績（ステージクリア）
 * - テクニック実績（精度・スピード）
 * - コレクション実績（全種類達成）
 * - チャレンジ実績（特殊条件）
 */
export class AchievementDefinitions {
    constructor() {
        this.achievements = this.initializeAchievements();
        this.categories = this.initializeCategories();
    }

    /**
     * 全実績を初期化
     * @returns {object} 実績定義オブジェクト
     */
    initializeAchievements() {
        return {
            // 基本プレイ実績
            firstBubble: {
                id: 'firstBubble',
                name: '初めての泡',
                description: '初めて泡を割る',
                icon: '🎈',
                category: 'basic',
                type: 'single',
                condition: { type: 'bubblesPopped', value: 1 },
                reward: { ap: 10 }
            },
            bubbleHunter: {
                id: 'bubbleHunter',
                name: '泡ハンター',
                description: '100個の泡を割る',
                icon: '🏹',
                category: 'basic',
                type: 'cumulative',
                condition: { type: 'bubblesPopped', value: 100 },
                reward: { ap: 50 }
            },
            bubbleMaster: {
                id: 'bubbleMaster',
                name: '泡マスター',
                description: '1000個の泡を割る',
                icon: '👑',
                category: 'basic',
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
                category: 'score',
                type: 'single',
                condition: { type: 'singleGameScore', value: 1000 },
                reward: { ap: 25 }
            },
            scoreKing: {
                id: 'scoreKing',
                name: 'スコアキング',
                description: '1回のゲームで10000点を獲得',
                icon: '👑',
                category: 'score',
                type: 'single',
                condition: { type: 'singleGameScore', value: 10000 },
                reward: { ap: 100 }
            },
            megaScore: {
                id: 'megaScore',
                name: 'メガスコア',
                description: '1回のゲームで50000点を獲得',
                icon: '💫',
                category: 'score',
                type: 'single',
                condition: { type: 'singleGameScore', value: 50000 },
                reward: { ap: 250 }
            },
            scoreGod: {
                id: 'scoreGod',
                name: 'スコアゴッド',
                description: '1回のゲームで100000点を獲得',
                icon: '🌟',
                category: 'score',
                type: 'single',
                condition: { type: 'singleGameScore', value: 100000 },
                reward: { ap: 500 }
            },
            cumulativeScoreBronze: {
                id: 'cumulativeScoreBronze',
                name: '累計ブロンズ',
                description: '累計100000点を獲得',
                icon: '🥉',
                category: 'score',
                type: 'cumulative',
                condition: { type: 'cumulativeScore', value: 100000 },
                reward: { ap: 100 }
            },
            cumulativeScoreSilver: {
                id: 'cumulativeScoreSilver',
                name: '累計シルバー',
                description: '累計500000点を獲得',
                icon: '🥈',
                category: 'score',
                type: 'cumulative',
                condition: { type: 'cumulativeScore', value: 500000 },
                reward: { ap: 200 }
            },
            cumulativeScoreGold: {
                id: 'cumulativeScoreGold',
                name: '累計ゴールド',
                description: '累計1000000点を獲得',
                icon: '🥇',
                category: 'score',
                type: 'cumulative',
                condition: { type: 'cumulativeScore', value: 1000000 },
                reward: { ap: 500 }
            },
            
            // コンボ実績
            comboStarter: {
                id: 'comboStarter',
                name: 'コンボスターター',
                description: '10コンボを達成',
                icon: '🔥',
                category: 'combo',
                type: 'single',
                condition: { type: 'maxCombo', value: 10 },
                reward: { ap: 30 }
            },
            comboMaster: {
                id: 'comboMaster',
                name: 'コンボマスター',
                description: '50コンボを達成',
                icon: '💥',
                category: 'combo',
                type: 'single',
                condition: { type: 'maxCombo', value: 50 },
                reward: { ap: 150 }
            },
            comboLegend: {
                id: 'comboLegend',
                name: 'コンボレジェンド',
                description: '100コンボを達成',
                icon: '🔥',
                category: 'combo',
                type: 'single',
                condition: { type: 'maxCombo', value: 100 },
                reward: { ap: 300 }
            },
            comboGod: {
                id: 'comboGod',
                name: 'コンボゴッド',
                description: '200コンボを達成',
                icon: '🌪️',
                category: 'combo',
                type: 'single',
                condition: { type: 'maxCombo', value: 200 },
                reward: { ap: 500 }
            },
            
            // 特殊泡実績
            rainbowHunter: {
                id: 'rainbowHunter',
                name: '虹色ハンター',
                description: '虹色の泡を10個割る',
                icon: '🌈',
                category: 'bubbleType',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'rainbow', value: 10 },
                reward: { ap: 75 }
            },
            diamondBreaker: {
                id: 'diamondBreaker',
                name: 'ダイヤモンドブレイカー',
                description: 'ダイヤモンドの泡を5個割る',
                icon: '💎',
                category: 'bubbleType',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'diamond', value: 5 },
                reward: { ap: 100 }
            },
            bossSlayer: {
                id: 'bossSlayer',
                name: 'ボススレイヤー',
                description: 'ボス泡を3個割る',
                icon: '⚔️',
                category: 'bubbleType',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'boss', value: 3 },
                reward: { ap: 200 }
            },
            goldenTouch: {
                id: 'goldenTouch',
                name: '黄金の手',
                description: '黄金の泡を5個割る',
                icon: '✨',
                category: 'bubbleType',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'golden', value: 5 },
                reward: { ap: 80 }
            },
            phantomHunter: {
                id: 'phantomHunter',
                name: '幻影ハンター',
                description: '幻の泡を10個割る（すり抜けを含む）',
                icon: '👻',
                category: 'bubbleType',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'phantom', value: 10 },
                reward: { ap: 120 }
            },
            explosiveExpert: {
                id: 'explosiveExpert',
                name: '爆発エキスパート',
                description: '爆発泡を20個割る',
                icon: '💥',
                category: 'bubbleType',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'explosive', value: 20 },
                reward: { ap: 150 }
            },
            magneticMaster: {
                id: 'magneticMaster',
                name: '磁力マスター',
                description: '磁力泡を15個割る',
                icon: '🧲',
                category: 'bubbleType',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'magnetic', value: 15 },
                reward: { ap: 120 }
            },
            frozenBreaker: {
                id: 'frozenBreaker',
                name: 'アイスブレイカー',
                description: '氷結泡を25個割る',
                icon: '❄️',
                category: 'bubbleType',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'frozen', value: 25 },
                reward: { ap: 100 }
            },
            multiplierChaser: {
                id: 'multiplierChaser',
                name: '倍率ハンター',
                description: 'マルチプライヤー泡を10個割る',
                icon: '✖️',
                category: 'bubbleType',
                type: 'cumulative',
                condition: { type: 'bubbleTypePopped', bubbleType: 'multiplier', value: 10 },
                reward: { ap: 180 }
            },
            
            // サバイバル実績
            survivor: {
                id: 'survivor',
                name: 'サバイバー',
                description: '5分間生き残る',
                icon: '🛡️',
                category: 'survival',
                type: 'single',
                condition: { type: 'survivalTime', value: 300000 },
                reward: { ap: 100 }
            },
            ironWill: {
                id: 'ironWill',
                name: '鉄の意志',
                description: 'HP10以下で1分間生き残る',
                icon: '💪',
                category: 'survival',
                type: 'single',
                condition: { type: 'lowHpSurvival', hp: 10, time: 60000 },
                reward: { ap: 150 }
            },
            lowHpHero: {
                id: 'lowHpHero',
                name: '低HPヒーロー',
                description: 'HP5以下で3000点を獲得',
                icon: '🦸',
                category: 'survival',
                type: 'single',
                condition: { type: 'lowHpScore', hp: 5, score: 3000 },
                reward: { ap: 200 }
            },
            
            // ステージ実績
            stageExplorer: {
                id: 'stageExplorer',
                name: 'ステージ探検家',
                description: '5つのステージをクリア',
                icon: '🗺️',
                category: 'stage',
                type: 'cumulative',
                condition: { type: 'stagesCleared', value: 5 },
                reward: { ap: 100 }
            },
            allStagesClear: {
                id: 'allStagesClear',
                name: '全ステージ制覇',
                description: '全てのステージをクリア',
                icon: '🏆',
                category: 'stage',
                type: 'single',
                condition: { type: 'allStagesCleared', value: true },
                reward: { ap: 500 }
            },
            stageCompletionist: {
                id: 'stageCompletionist',
                name: 'ステージコンプリート',
                description: '各ステージを10回ずつクリア',
                icon: '📋',
                category: 'stage',
                type: 'single',
                condition: { type: 'allStagesMultiple', value: 10 },
                reward: { ap: 400 }
            },
            
            // テクニック実績
            perfectionist: {
                id: 'perfectionist',
                name: '完璧主義者',
                description: '1回のゲームで泡を一度も逃さない（50個以上）',
                icon: '🎯',
                category: 'technique',
                type: 'single',
                condition: { type: 'perfectGame', minBubbles: 50 },
                reward: { ap: 300 }
            },
            speedster: {
                id: 'speedster',
                name: 'スピードスター',
                description: '1分以内に100個の泡を割る',
                icon: '⚡',
                category: 'technique',
                type: 'single',
                condition: { type: 'speedChallenge', bubbles: 100, time: 60000 },
                reward: { ap: 200 }
            },
            accuracyExpert: {
                id: 'accuracyExpert',
                name: '精密射手',
                description: '95%以上の精度でゲームを完了',
                icon: '🎯',
                category: 'technique',
                type: 'single',
                condition: { type: 'accuracy', value: 95 },
                reward: { ap: 200 }
            },
            accuracyMaster: {
                id: 'accuracyMaster',
                name: '精密マスター',
                description: '99%以上の精度でゲームを完了',
                icon: '🏹',
                category: 'technique',
                type: 'single',
                condition: { type: 'accuracy', value: 99 },
                reward: { ap: 400 }
            },
            
            // プレイ継続実績
            consecutiveDays3: {
                id: 'consecutiveDays3',
                name: '3日連続',
                description: '3日連続でプレイ',
                icon: '📅',
                category: 'play',
                type: 'single',
                condition: { type: 'consecutiveDays', value: 3 },
                reward: { ap: 50 }
            },
            consecutiveDays7: {
                id: 'consecutiveDays7',
                name: 'ウィークプレイヤー',
                description: '7日連続でプレイ',
                icon: '🗓️',
                category: 'play',
                type: 'single',
                condition: { type: 'consecutiveDays', value: 7 },
                reward: { ap: 150 }
            },
            consecutiveDays30: {
                id: 'consecutiveDays30',
                name: 'マンスリープレイヤー',
                description: '30日連続でプレイ',
                icon: '🏅',
                category: 'play',
                type: 'single',
                condition: { type: 'consecutiveDays', value: 30 },
                reward: { ap: 500 }
            },
            totalPlayTime1h: {
                id: 'totalPlayTime1h',
                name: '1時間プレイ',
                description: '累計1時間プレイ',
                icon: '⏰',
                category: 'play',
                type: 'cumulative',
                condition: { type: 'totalPlayTime', value: 3600000 },
                reward: { ap: 75 }
            },
            totalPlayTime10h: {
                id: 'totalPlayTime10h',
                name: '10時間プレイ',
                description: '累計10時間プレイ',
                icon: '⏳',
                category: 'play',
                type: 'cumulative',
                condition: { type: 'totalPlayTime', value: 36000000 },
                reward: { ap: 200 }
            },
            gamesPlayed50: {
                id: 'gamesPlayed50',
                name: '50ゲーム達成',
                description: '50回ゲームをプレイ',
                icon: '🎮',
                category: 'play',
                type: 'cumulative',
                condition: { type: 'gamesPlayed', value: 50 },
                reward: { ap: 100 }
            },
            gamesPlayed500: {
                id: 'gamesPlayed500',
                name: '500ゲーム達成',
                description: '500回ゲームをプレイ',
                icon: '🎯',
                category: 'play',
                type: 'cumulative',
                condition: { type: 'gamesPlayed', value: 500 },
                reward: { ap: 300 }
            },
            
            // コレクション実績
            bubbleCollector: {
                id: 'bubbleCollector',
                name: '泡コレクター',
                description: '全種類の泡を少なくとも1個ずつ割る',
                icon: '🗂️',
                category: 'collection',
                type: 'single',
                condition: { type: 'allBubbleTypes', value: true },
                reward: { ap: 300 }
            },
            
            // チャレンジ実績
            noItemChallenge: {
                id: 'noItemChallenge',
                name: 'ピュアプレイヤー',
                description: 'アイテム使用なしで5000点を獲得',
                icon: '🚫',
                category: 'challenge',
                type: 'single',
                condition: { type: 'noItemScore', value: 5000 },
                reward: { ap: 250 }
            },
            earlyBirdSpecial: {
                id: 'earlyBirdSpecial',
                name: '早朝プレイヤー',
                description: 'AM6:00-AM8:00にプレイして1000点獲得',
                icon: '🌅',
                category: 'challenge',
                type: 'single',
                condition: { type: 'timeSpecificScore', startHour: 6, endHour: 8, score: 1000 },
                reward: { ap: 150 }
            },
            nightOwlSpecial: {
                id: 'nightOwlSpecial',
                name: '夜更かしプレイヤー',
                description: 'PM10:00-AM2:00にプレイして2000点獲得',
                icon: '🦉',
                category: 'challenge',
                type: 'single',
                condition: { type: 'timeSpecificScore', startHour: 22, endHour: 2, score: 2000 },
                reward: { ap: 200 }
            }
        };
    }

    /**
     * 実績カテゴリを初期化
     * @returns {object} カテゴリ定義オブジェクト
     */
    initializeCategories() {
        return {
            basic: {
                name: '基本プレイ',
                description: '基本的なゲームプレイ実績',
                icon: '🎮',
                color: '#4CAF50'
            },
            score: {
                name: 'スコア',
                description: 'スコア関連実績',
                icon: '🏆',
                color: '#FFC107'
            },
            combo: {
                name: 'コンボ',
                description: 'コンボ関連実績',
                icon: '🔥',
                color: '#FF5722'
            },
            bubbleType: {
                name: '特殊泡',
                description: '特殊泡破壊実績',
                icon: '🌈',
                color: '#9C27B0'
            },
            survival: {
                name: 'サバイバル',
                description: '生存・耐久実績',
                icon: '🛡️',
                color: '#607D8B'
            },
            stage: {
                name: 'ステージ',
                description: 'ステージクリア実績',
                icon: '🗺️',
                color: '#795548'
            },
            technique: {
                name: 'テクニック',
                description: '技術・精度実績',
                icon: '🎯',
                color: '#2196F3'
            },
            play: {
                name: 'プレイ継続',
                description: 'プレイ継続実績',
                icon: '📅',
                color: '#8BC34A'
            },
            collection: {
                name: 'コレクション',
                description: 'コレクション完成実績',
                icon: '🗂️',
                color: '#FF9800'
            },
            challenge: {
                name: 'チャレンジ',
                description: '特殊チャレンジ実績',
                icon: '🚀',
                color: '#E91E63'
            }
        };
    }

    /**
     * 実績を取得
     * @param {string} id - 実績ID
     * @returns {object|null} 実績オブジェクト
     */
    getAchievement(id) {
        return this.achievements[id] || null;
    }

    /**
     * 全実績を取得
     * @returns {object} 全実績オブジェクト
     */
    getAllAchievements() {
        return this.achievements;
    }

    /**
     * カテゴリ別実績を取得
     * @param {string} category - カテゴリ名
     * @returns {Array} カテゴリ内の実績配列
     */
    getAchievementsByCategory(category) {
        return Object.values(this.achievements).filter(
            achievement => achievement.category === category
        );
    }

    /**
     * カテゴリ情報を取得
     * @param {string} category - カテゴリ名
     * @returns {object|null} カテゴリ情報
     */
    getCategory(category) {
        return this.categories[category] || null;
    }

    /**
     * 全カテゴリを取得
     * @returns {object} 全カテゴリオブジェクト
     */
    getAllCategories() {
        return this.categories;
    }

    /**
     * 実績タイプ別で取得
     * @param {string} type - 実績タイプ ('single' or 'cumulative')
     * @returns {Array} 実績配列
     */
    getAchievementsByType(type) {
        return Object.values(this.achievements).filter(
            achievement => achievement.type === type
        );
    }

    /**
     * 条件タイプ別で実績を取得
     * @param {string} conditionType - 条件タイプ
     * @returns {Array} 実績配列
     */
    getAchievementsByConditionType(conditionType) {
        return Object.values(this.achievements).filter(
            achievement => achievement.condition.type === conditionType
        );
    }

    /**
     * 報酬別で実績を取得
     * @param {number} minAP - 最小AP
     * @param {number} maxAP - 最大AP  
     * @returns {Array} 実績配列
     */
    getAchievementsByReward(minAP = 0, maxAP = Infinity) {
        return Object.values(this.achievements).filter(
            achievement => achievement.reward.ap >= minAP && achievement.reward.ap <= maxAP
        );
    }

    /**
     * 実績統計を取得
     * @returns {object} 実績統計情報
     */
    getStatistics() {
        const achievements = Object.values(this.achievements);
        const categories = Object.keys(this.categories);
        
        const stats = {
            total: achievements.length,
            byCategory: {},
            byType: {
                single: 0,
                cumulative: 0
            },
            totalAP: 0,
            averageAP: 0
        };

        // カテゴリ別統計
        categories.forEach(category => {
            stats.byCategory[category] = this.getAchievementsByCategory(category).length;
        });

        // タイプ別統計
        achievements.forEach(achievement => {
            stats.byType[achievement.type]++;
            stats.totalAP += achievement.reward.ap;
        });

        stats.averageAP = Math.round(stats.totalAP / achievements.length);

        return stats;
    }
}