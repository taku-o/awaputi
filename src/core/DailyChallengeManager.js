import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * デイリーチャレンジ管理クラス
 * 日替わりチャレンジの生成・難易度調整・進捗管理を行う
 */
export class DailyChallengeManager {
    constructor(gameEngine, challengeSystem) {
        this.gameEngine = gameEngine;
        this.challengeSystem = challengeSystem;
        
        // 設定
        this.config = {
            maxDailyChallenges: 3,
            resetTime: 5, // 日本時間5:00 (UTC 20:00)
            difficultyAdjustmentPeriod: 7, // 7日間の実績で難易度調整
            storageKey: 'awaputi_daily_challenges',
            progressStorageKey: 'awaputi_daily_progress'
        };
        
        // チャレンジテンプレート定義
        this.challengeTemplates = {
            // スコア系チャレンジ
            highScore: {
                category: 'score',
                progressType: 'SCORE',
                titles: [
                    'ハイスコアチャレンジ',
                    'スコアマスター',
                    'ポイントハンター'
                ],
                descriptions: [
                    '{target}点以上のスコアを達成しよう',
                    '目標スコア{target}点を目指そう',
                    '{target}点の壁を超えよう'
                ],
                baseDifficulty: {
                    easy: 1000,
                    normal: 5000,
                    hard: 15000,
                    expert: 30000
                }
            },
            
            // プレイ回数系チャレンジ
            playCount: {
                category: 'play',
                progressType: 'PLAY_COUNT',
                titles: [
                    'プレイマスター',
                    '継続は力なり',
                    'ゲーム中毒者'
                ],
                descriptions: [
                    '{target}回ゲームをプレイしよう',
                    '今日は{target}回挑戦しよう',
                    '{target}ゲーム完走を目指そう'
                ],
                baseDifficulty: {
                    easy: 3,
                    normal: 5,
                    hard: 10,
                    expert: 15
                }
            },
            
            // 泡破壊系チャレンジ
            bubblePop: {
                category: 'action',
                progressType: 'BUBBLE_POP',
                titles: [
                    'バブルクラッシャー',
                    'ポップマスター',
                    '泡の破壊者'
                ],
                descriptions: [
                    '{target}個の泡を割ろう',
                    '泡を{target}個破壊しよう',
                    '{target}回のポップを達成しよう'
                ],
                baseDifficulty: {
                    easy: 50,
                    normal: 150,
                    hard: 300,
                    expert: 500
                }
            },
            
            // コンボ系チャレンジ
            maxCombo: {
                category: 'skill',
                progressType: 'COMBO',
                titles: [
                    'コンボマスター',
                    '連鎖の達人',
                    'コンボキング'
                ],
                descriptions: [
                    '{target}コンボを達成しよう',
                    '最大{target}連鎖を目指そう',
                    '{target}コンボの壁を突破しよう'
                ],
                baseDifficulty: {
                    easy: 10,
                    normal: 25,
                    hard: 50,
                    expert: 100
                }
            },
            
            // プレイ時間系チャレンジ
            playTime: {
                category: 'endurance',
                progressType: 'TIME_PLAYED',
                titles: [
                    '継続プレイヤー',
                    '時間の達人',
                    '長時間バトラー'
                ],
                descriptions: [
                    '{target}分間プレイしよう',
                    '合計{target}分の挑戦を続けよう',
                    '今日は{target}分間頑張ろう'
                ],
                baseDifficulty: {
                    easy: 15,
                    normal: 30,
                    hard: 60,
                    expert: 120
                }
            },
            
            // ステージクリア系チャレンジ
            stageClear: {
                category: 'progress',
                progressType: 'STAGE_CLEAR',
                titles: [
                    'ステージマスター',
                    'クリアの達人',
                    'ステージコンプリーター'
                ],
                descriptions: [
                    '{target}ステージクリアしよう',
                    '今日は{target}ステージ制覇だ',
                    '{target}ステージの完走を目指そう'
                ],
                baseDifficulty: {
                    easy: 2,
                    normal: 5,
                    hard: 10,
                    expert: 15
                }
            }
        };
        
        // 報酬テーブル
        this.rewardTables = {
            easy: [
                { type: 'ap', amount: 50, weight: 70 },
                { type: 'item', itemId: 'time_boost', amount: 1, weight: 20 },
                { type: 'item', itemId: 'score_boost', amount: 1, weight: 10 }
            ],
            normal: [
                { type: 'ap', amount: 100, weight: 60 },
                { type: 'item', itemId: 'time_boost', amount: 2, weight: 20 },
                { type: 'item', itemId: 'score_boost', amount: 2, weight: 15 },
                { type: 'item', itemId: 'bubble_slow', amount: 1, weight: 5 }
            ],
            hard: [
                { type: 'ap', amount: 200, weight: 50 },
                { type: 'item', itemId: 'time_boost', amount: 3, weight: 20 },
                { type: 'item', itemId: 'score_boost', amount: 3, weight: 15 },
                { type: 'item', itemId: 'bubble_slow', amount: 2, weight: 10 },
                { type: 'title', titleId: 'daily_achiever', weight: 5 }
            ],
            expert: [
                { type: 'ap', amount: 350, weight: 40 },
                { type: 'item', itemId: 'time_boost', amount: 5, weight: 20 },
                { type: 'item', itemId: 'score_boost', amount: 5, weight: 15 },
                { type: 'item', itemId: 'bubble_slow', amount: 3, weight: 15 },
                { type: 'title', titleId: 'daily_master', weight: 8 },
                { type: 'theme', themeId: 'daily_special', weight: 2 }
            ]
        };
        
        // 内部状態
        this.playerPerformance = {
            averageScore: 0,
            averagePlayCount: 0,
            averageCombo: 0,
            lastWeekCompleted: 0,
            difficultyPreference: 'normal'
        };
        
        this.lastGenerationDate = null;
        this.todaysChallenges = [];
        
        console.log('[DailyChallengeManager] 初期化完了');
    }

    /**
     * 初期化
     */
    async initialize() {
        try {
            // プレイヤー実績データを読み込み
            await this.loadPlayerPerformance();
            
            // 今日のチャレンジをチェック・生成
            await this.checkAndGenerateTodaysChallenges();
            
            console.log('[DailyChallengeManager] 初期化完了');
            
        } catch (error) {
            getErrorHandler().handleError(error, 'DAILY_CHALLENGE_INIT_ERROR', {
                component: 'DailyChallengeManager'
            });
        }
    }

    /**
     * 今日のチャレンジをチェック・生成
     */
    async checkAndGenerateTodaysChallenges() {
        const today = this.getTodayString();
        
        // 既に今日のチャレンジが生成済みかチェック
        if (this.lastGenerationDate === today && this.todaysChallenges.length > 0) {
            console.log('[DailyChallengeManager] 今日のチャレンジは既に生成済み');
            return;
        }
        
        // 昨日のチャレンジをクリーンアップ
        await this.cleanupExpiredChallenges();
        
        // 新しいデイリーチャレンジを生成
        await this.generateTodaysChallenges();
        
        this.lastGenerationDate = today;
        await this.saveGenerationData();
    }

    /**
     * 期限切れのチャレンジをクリーンアップ
     */
    async cleanupExpiredChallenges() {
        const yesterday = this.getYesterdayString();
        const expiredChallenges = Array.from(this.challengeSystem.challenges.entries())
            .filter(([id, challenge]) => 
                challenge.type === 'daily' && 
                challenge.metadata?.date === yesterday
            );
        
        for (const [challengeId] of expiredChallenges) {
            this.challengeSystem.challenges.delete(challengeId);
            this.challengeSystem.playerProgress.delete(challengeId);
            this.challengeSystem.completedChallenges.delete(challengeId);
        }
        
        if (expiredChallenges.length > 0) {
            console.log(`[DailyChallengeManager] ${expiredChallenges.length}件の期限切れチャレンジを削除`);
        }
    }

    /**
     * 今日のチャレンジを生成
     */
    async generateTodaysChallenges() {
        try {
            this.todaysChallenges = [];
            const today = this.getTodayString();
            const templateKeys = Object.keys(this.challengeTemplates);
            
            // 難易度を決定（プレイヤーの実績に基づいて）
            const difficulty = this.calculateOptimalDifficulty();
            
            // ランダムに3つのチャレンジテンプレートを選択
            const selectedTemplates = this.selectRandomTemplates(templateKeys, this.config.maxDailyChallenges);
            
            for (let i = 0; i < selectedTemplates.length; i++) {
                const template = this.challengeTemplates[selectedTemplates[i]];
                const challenge = await this.createChallengeFromTemplate(template, difficulty, today, i);
                
                if (challenge) {
                    this.todaysChallenges.push(challenge);
                    console.log(`[DailyChallengeManager] デイリーチャレンジ生成: ${challenge.title}`);
                }
            }
            
            console.log(`[DailyChallengeManager] ${this.todaysChallenges.length}件のデイリーチャレンジを生成`);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'DAILY_CHALLENGE_GENERATION_ERROR');
        }
    }

    /**
     * テンプレートからチャレンジを作成
     */
    async createChallengeFromTemplate(template, difficulty, date, index) {
        try {
            const targetValue = this.calculateTargetValue(template, difficulty);
            const reward = this.selectReward(difficulty);
            
            const challengeData = {
                id: `daily_${date}_${index}`,
                type: 'daily',
                title: this.selectRandomFromArray(template.titles),
                description: this.selectRandomFromArray(template.descriptions).replace('{target}', targetValue),
                progressType: template.progressType,
                targetValue: targetValue,
                reward: reward,
                startTime: this.getTodayStartTime(),
                endTime: this.getTomorrowStartTime(),
                isActive: true,
                category: template.category,
                difficulty: difficulty,
                metadata: {
                    date: date,
                    template: template,
                    dailyIndex: index
                }
            };
            
            // チャレンジシステムに登録
            return this.challengeSystem.createChallenge(challengeData);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'CHALLENGE_TEMPLATE_CREATION_ERROR', { template, difficulty });
            return null;
        }
    }

    /**
     * 最適な難易度を計算
     */
    calculateOptimalDifficulty() {
        const performance = this.playerPerformance;
        
        // プレイヤーの過去1週間の完了率に基づいて難易度を調整
        if (performance.lastWeekCompleted >= 0.8) {
            return 'hard';
        } else if (performance.lastWeekCompleted >= 0.6) {
            return 'normal';
        } else if (performance.lastWeekCompleted >= 0.3) {
            return 'easy';
        } else {
            return 'easy'; // 初心者向け
        }
    }

    /**
     * 目標値を計算
     */
    calculateTargetValue(template, difficulty) {
        const baseValue = template.baseDifficulty[difficulty];
        
        // プレイヤーの実績に基づいて微調整
        let adjustmentFactor = 1.0;
        
        switch (template.progressType) {
            case 'SCORE':
                if (this.playerPerformance.averageScore > 0) {
                    adjustmentFactor = Math.max(0.5, Math.min(1.5, 
                        this.playerPerformance.averageScore / template.baseDifficulty.normal
                    ));
                }
                break;
                
            case 'COMBO':
                if (this.playerPerformance.averageCombo > 0) {
                    adjustmentFactor = Math.max(0.5, Math.min(1.5,
                        this.playerPerformance.averageCombo / template.baseDifficulty.normal
                    ));
                }
                break;
                
            case 'PLAY_COUNT':
                if (this.playerPerformance.averagePlayCount > 0) {
                    adjustmentFactor = Math.max(0.7, Math.min(1.3,
                        this.playerPerformance.averagePlayCount / template.baseDifficulty.normal
                    ));
                }
                break;
        }
        
        return Math.round(baseValue * adjustmentFactor);
    }

    /**
     * 報酬を選択
     */
    selectReward(difficulty) {
        const rewardTable = this.rewardTables[difficulty];
        const totalWeight = rewardTable.reduce((sum, reward) => sum + reward.weight, 0);
        const random = Math.random() * totalWeight;
        
        let currentWeight = 0;
        for (const reward of rewardTable) {
            currentWeight += reward.weight;
            if (random <= currentWeight) {
                return {
                    type: reward.type,
                    amount: reward.amount,
                    itemId: reward.itemId,
                    titleId: reward.titleId,
                    themeId: reward.themeId
                };
            }
        }
        
        // フォールバック
        return rewardTable[0];
    }

    /**
     * ランダムテンプレート選択
     */
    selectRandomTemplates(templates, count) {
        const shuffled = [...templates].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * 配列からランダム選択
     */
    selectRandomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * 今日のチャレンジ取得
     */
    getTodaysChallenges() {
        return this.todaysChallenges.map(challenge => {
            const progress = this.challengeSystem.playerProgress.get(challenge.id);
            return {
                ...challenge,
                progress: progress ? {
                    current: progress.currentValue,
                    target: challenge.targetValue,
                    percentage: Math.min(100, (progress.currentValue / challenge.targetValue) * 100),
                    completed: progress.completed,
                    rewardClaimed: progress.rewardClaimed
                } : null
            };
        });
    }

    /**
     * チャレンジ統計取得
     */
    getDailyStats() {
        const today = this.getTodayString();
        const todaysProgress = this.todaysChallenges.map(challenge => {
            const progress = this.challengeSystem.playerProgress.get(challenge.id);
            return progress || { currentValue: 0, completed: false };
        });
        
        return {
            date: today,
            totalChallenges: this.todaysChallenges.length,
            completedChallenges: todaysProgress.filter(p => p.completed).length,
            totalProgress: todaysProgress.reduce((sum, p) => sum + p.currentValue, 0),
            averageProgress: todaysProgress.length > 0 
                ? todaysProgress.reduce((sum, p, i) => {
                    const target = this.todaysChallenges[i]?.targetValue || 1;
                    return sum + (p.currentValue / target);
                }, 0) / todaysProgress.length
                : 0,
            difficulty: this.calculateOptimalDifficulty()
        };
    }

    /**
     * プレイヤー実績データ読み込み
     */
    async loadPlayerPerformance() {
        try {
            const data = localStorage.getItem(this.config.progressStorageKey);
            if (data) {
                const parsed = JSON.parse(data);
                this.playerPerformance = { ...this.playerPerformance, ...parsed.performance };
                this.lastGenerationDate = parsed.lastGenerationDate;
            }
            
            // 統計マネージャーから最新データを取得
            if (this.gameEngine.statisticsManager) {
                const stats = this.gameEngine.statisticsManager.getDetailedStatistics();
                this.updatePerformanceFromStats(stats);
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'DAILY_PERFORMANCE_LOAD_ERROR');
        }
    }

    /**
     * 統計から実績データを更新
     */
    updatePerformanceFromStats(stats) {
        if (stats.gameStats) {
            this.playerPerformance.averageScore = stats.gameStats.averageScore || 0;
            this.playerPerformance.averagePlayCount = stats.gameStats.gamesPlayed / 7 || 0; // 週平均
            this.playerPerformance.averageCombo = stats.gameStats.averageCombo || 0;
        }
        
        // 過去1週間のチャレンジ完了率を計算
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentChallenges = Array.from(this.challengeSystem.completedChallenges)
            .filter(challengeId => {
                const challenge = this.challengeSystem.challenges.get(challengeId);
                return challenge && challenge.type === 'daily' && challenge.startTime >= weekAgo;
            });
        
        this.playerPerformance.lastWeekCompleted = recentChallenges.length / 21; // 7日 × 3チャレンジ
    }

    /**
     * 生成データ保存
     */
    async saveGenerationData() {
        try {
            const data = {
                lastGenerationDate: this.lastGenerationDate,
                performance: this.playerPerformance,
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.config.progressStorageKey, JSON.stringify(data));
            
        } catch (error) {
            getErrorHandler().handleError(error, 'DAILY_GENERATION_SAVE_ERROR');
        }
    }

    /**
     * 日付ユーティリティ
     */
    getTodayString() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    getYesterdayString() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }

    getTodayStartTime() {
        const today = new Date();
        today.setHours(this.config.resetTime, 0, 0, 0);
        return today.getTime();
    }

    getTomorrowStartTime() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(this.config.resetTime, 0, 0, 0);
        return tomorrow.getTime();
    }

    /**
     * 手動チャレンジ再生成（デバッグ用）
     */
    async regenerateTodaysChallenges() {
        await this.cleanupExpiredChallenges();
        this.lastGenerationDate = null;
        this.todaysChallenges = [];
        await this.generateTodaysChallenges();
        await this.saveGenerationData();
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.saveGenerationData();
        console.log('[DailyChallengeManager] クリーンアップ完了');
    }
}