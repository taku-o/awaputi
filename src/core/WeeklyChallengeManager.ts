import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * ウィークリーチャレンジ管理クラス
 * 週単位チャレンジの生成・長期目標管理・進捗追跡を行う
 */
export class WeeklyChallengeManager {
    private gameEngine: any;
    private challengeSystem: any;
    private config: any;
    private challengeTemplates: any;
    private currentChallenges: any[];
    private weeklyProgress: Map<string, any>;
    private challengeHistory: any[];
    private weekStartDate: Date;
    private nextResetTime: number;
    private stats: any;
    private isInitialized: boolean;

    constructor(gameEngine: any, challengeSystem: any) {
        this.gameEngine = gameEngine;
        this.challengeSystem = challengeSystem;
        
        // 設定
        this.config = {
            maxWeeklyChallenges: 2,
            resetTime: 1, // 月曜日 00:00(UTC)
            progressStorageKey: 'awaputi_weekly_challenges',
            archiveStorageKey: 'awaputi_weekly_archive',
            maxArchiveWeeks: 12, // 過去12週間分を保持
            storageKey: 'awaputi_weekly_challenge_data'
        };
        
        // チャレンジテンプレート定義（長期目標）
        this.challengeTemplates = {
            // 総合スコア系チャレンジ
            totalScore: {
                category: 'cumulative',
                progressType: 'SCORE_CUMULATIVE',
                titles: [
                    'ウィークリースコアチャンピオン',
                    'スコアマスターウィーク',
                    '週間ポイントハンター'
                ],
                descriptions: [
                    '週間で合計{target}点を獲得しよう',
                    '1週間で{target}点の壁を突破しよう',
                    '今週の目標：合計{target}点'
                ],
                baseDifficulty: {
                    easy: 25000,
                    normal: 75000,
                    hard: 150000,
                    expert: 300000
                }
            },
            // 総プレイ回数系チャレンジ
            totalPlayCount: {
                category: 'consistency',
                progressType: 'PLAY_COUNT_CUMULATIVE',
                titles: [
                    'ウィークリープレイマスター',
                    '継続の達人',
                    '週間ゲーマー'
                ],
                descriptions: [
                    '1週間で{target}回プレイしよう',
                    '今週は{target}ゲーム挑戦だ',
                    '週間{target}プレイを達成しよう'
                ],
                baseDifficulty: {
                    easy: 15,
                    normal: 35,
                    hard: 70,
                    expert: 140
                }
            },
            // 総泡破壊数系チャレンジ
            totalBubblePop: {
                category: 'action',
                progressType: 'BUBBLE_POP_CUMULATIVE',
                titles: [
                    'ウィークリーバブルクラッシャー',
                    '泡の全滅者',
                    '週間ポップマスター'
                ],
                descriptions: [
                    '1週間で{target}個の泡を割ろう',
                    '週間{target}ポップを達成しよう',
                    '今週の目標：{target}個破壊'
                ],
                baseDifficulty: {
                    easy: 1000,
                    normal: 3500,
                    hard: 8000,
                    expert: 15000
                }
            },
            // 最高コンボ系チャレンジ
            bestCombo: {
                category: 'skill',
                progressType: 'COMBO_BEST',
                titles: [
                    'ウィークリーコンボキング',
                    '連鎖の帝王',
                    '週間コンボマスター'
                ],
                descriptions: [
                    '今週中に{target}コンボを達成しよう',
                    '週間最大{target}連鎖を目指そう',
                    '{target}コンボの記録更新を狙おう'
                ],
                baseDifficulty: {
                    easy: 30,
                    normal: 75,
                    hard: 150,
                    expert: 300
                }
            },
            // 総プレイ時間系チャレンジ
            totalPlayTime: {
                category: 'endurance',
                progressType: 'TIME_PLAYED_CUMULATIVE',
                titles: [
                    'ウィークリータイムマスター',
                    '時間の支配者',
                    '週間エンデュランス'
                ],
                descriptions: [
                    '1週間で合計{target}分プレイしよう',
                    '今週は{target}分間の挑戦だ',
                    '週間{target}分プレイを達成しよう'
                ],
                baseDifficulty: {
                    easy: 60,
                    normal: 180,
                    hard: 420,
                    expert: 840
                }
            },
            // パーフェクトゲーム系チャレンジ
            perfectGames: {
                category: 'mastery',
                progressType: 'PERFECT_GAME_COUNT',
                titles: [
                    'ウィークリーパーフェクショニスト',
                    '完璧主義者',
                    '週間マスター'
                ],
                descriptions: [
                    '今週{target}回パーフェクトクリアを達成しよう',
                    '週間{target}回の完璧なプレイを目指そう',
                    '{target}回のノーミスプレイに挑戦'
                ],
                baseDifficulty: {
                    easy: 3,
                    normal: 8,
                    hard: 20,
                    expert: 50
                }
            },
            // 高速クリア系チャレンジ
            speedClear: {
                category: 'speed',
                progressType: 'FAST_CLEAR_COUNT',
                titles: [
                    'ウィークリースピードスター',
                    '稲妻の如く',
                    '週間スピードマスター'
                ],
                descriptions: [
                    '今週{target}回の高速クリアを達成しよう',
                    '週間{target}回のスピードクリアに挑戦',
                    '{target}回のクイッククリアを目指そう'
                ],
                baseDifficulty: {
                    easy: 5,
                    normal: 15,
                    hard: 35,
                    expert: 75
                }
            }
        };
        
        // 初期状態
        this.currentChallenges = [];
        this.weeklyProgress = new Map();
        this.challengeHistory = [];
        this.weekStartDate = this.calculateWeekStartDate();
        this.nextResetTime = this.calculateNextResetTime();
        this.isInitialized = false;
        
        // 統計情報
        this.stats = {
            totalWeeklyChallenges: 0,
            completedWeeklyChallenges: 0,
            weeklyCompletionRate: 0,
            averageWeeklyProgress: 0,
            bestWeeklyPerformance: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalWeeksParticipated: 0
        };
        
        console.log('WeeklyChallengeManager initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize(): void {
        try {
            // データの読み込み
            this.loadWeeklyChallengeData();
            
            // 週の更新チェック
            this.checkWeeklyReset();
            
            // 現在のチャレンジがなければ生成
            if (this.currentChallenges.length === 0) {
                this.generateWeeklyChallenges();
            }
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // 自動リセットタイマーの設定
            this.setupAutoReset();
            
            this.isInitialized = true;
            console.log('WeeklyChallengeManager: 初期化完了');
        } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_CHALLENGE_INIT_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * 週の開始日を計算
     */
    calculateWeekStartDate(): Date {
        const now = new Date();
        const dayOfWeek = now.getUTCDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 月曜日を週の開始とする
        
        const weekStart = new Date(now);
        weekStart.setUTCDate(now.getUTCDate() - daysToSubtract);
        weekStart.setUTCHours(0, 0, 0, 0);
        
        return weekStart;
    }
    
    /**
     * 次のリセット時刻を計算
     */
    calculateNextResetTime(): number {
        const weekStart = this.calculateWeekStartDate();
        weekStart.setUTCDate(weekStart.getUTCDate() + 7); // 来週の月曜日
        return weekStart.getTime();
    }
    
    /**
     * 週のリセットチェック
     */
    checkWeeklyReset(): boolean {
        const now = Date.now();
        if (now >= this.nextResetTime) {
            this.performWeeklyReset();
            return true;
        }
        return false;
    }
    
    /**
     * 週のリセット実行
     */
    performWeeklyReset(): void {
        try {
            console.log('WeeklyChallengeManager: 週のリセット開始');
            
            // 前週のチャレンジをアーカイブ
            this.archivePreviousWeekChallenges();
            
            // 新しい週のチャレンジ生成
            this.generateWeeklyChallenges();
            
            // 日付の更新
            this.weekStartDate = this.calculateWeekStartDate();
            this.nextResetTime = this.calculateNextResetTime();
            
            // 統計の更新
            this.updateWeeklyStats();
            
            // データの保存
            this.saveWeeklyChallengeData();
            
            console.log('WeeklyChallengeManager: 週のリセット完了');
        } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_RESET_ERROR', {
                operation: 'performWeeklyReset'
            });
        }
    }
    
    /**
     * ウィークリーチャレンジの生成
     */
    generateWeeklyChallenges(): void {
        try {
            this.currentChallenges = [];
            this.weeklyProgress.clear();
            
            // プレイヤーのスキルレベルを基に難易度を決定
            const playerLevel = this.assessPlayerLevel();
            const challengeTypes = this.selectChallengeTypes(playerLevel);
            
            for (let i = 0; i < Math.min(challengeTypes.length, this.config.maxWeeklyChallenges); i++) {
                const challengeType = challengeTypes[i];
                const challenge = this.createWeeklyChallenge(challengeType, playerLevel);
                
                if (challenge) {
                    this.currentChallenges.push(challenge);
                    this.weeklyProgress.set(challenge.id, {
                        currentValue: 0,
                        isCompleted: false,
                        completedAt: null,
                        progressHistory: []
                    });
                }
            }
            
            console.log(`WeeklyChallengeManager: ${this.currentChallenges.length}個のチャレンジを生成`);
        } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_CHALLENGE_GENERATION_ERROR', {
                operation: 'generateWeeklyChallenges'
            });
        }
    }
    
    /**
     * プレイヤーレベルの評価
     */
    assessPlayerLevel(): string {
        try {
            const playerStats = this.gameEngine.getPlayerStatistics();
            
            // 複数の指標を基にレベルを判定
            let score = 0;
            
            // 総合スコア基準
            if (playerStats.totalScore > 1000000) score += 3;
            else if (playerStats.totalScore > 500000) score += 2;
            else if (playerStats.totalScore > 100000) score += 1;
            
            // プレイ回数基準
            if (playerStats.totalGames > 500) score += 3;
            else if (playerStats.totalGames > 200) score += 2;
            else if (playerStats.totalGames > 50) score += 1;
            
            // 最高コンボ基準
            if (playerStats.maxCombo > 200) score += 3;
            else if (playerStats.maxCombo > 100) score += 2;
            else if (playerStats.maxCombo > 50) score += 1;
            
            // レベル判定
            if (score >= 7) return 'expert';
            if (score >= 5) return 'hard';
            if (score >= 3) return 'normal';
            return 'easy';
        } catch (error) {
            console.warn('プレイヤーレベル評価でエラー:', error);
            return 'normal'; // デフォルト
        }
    }
    
    /**
     * チャレンジタイプの選択
     */
    selectChallengeTypes(playerLevel: string): string[] {
        const availableTypes = Object.keys(this.challengeTemplates);
        const selectedTypes = [];
        
        // プレイヤーレベルに応じてバランス良く選択
        const weights = {
            easy: { cumulative: 3, consistency: 2, action: 2, skill: 1, endurance: 1, mastery: 0, speed: 1 },
            normal: { cumulative: 2, consistency: 2, action: 3, skill: 2, endurance: 2, mastery: 1, speed: 2 },
            hard: { cumulative: 2, consistency: 1, action: 2, skill: 3, endurance: 2, mastery: 2, speed: 3 },
            expert: { cumulative: 1, consistency: 1, action: 2, skill: 3, endurance: 1, mastery: 3, speed: 3 }
        };
        
        const categoryWeights = weights[playerLevel] || weights.normal;
        const weightedTypes = [];
        
        // 重み付きでタイプを選択
        for (const type of availableTypes) {
            const template = this.challengeTemplates[type];
            const weight = categoryWeights[template.category] || 1;
            for (let i = 0; i < weight; i++) {
                weightedTypes.push(type);
            }
        }
        
        // ランダム選択（重複なし）
        const shuffled = this.shuffleArray(weightedTypes);
        for (const type of shuffled) {
            if (!selectedTypes.includes(type) && selectedTypes.length < this.config.maxWeeklyChallenges) {
                selectedTypes.push(type);
            }
        }
        
        return selectedTypes;
    }
    
    /**
     * 配列のシャッフル
     */
    shuffleArray(array: any[]): any[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    /**
     * ウィークリーチャレンジの作成
     */
    createWeeklyChallenge(challengeType: string, playerLevel: string): any | null {
        try {
            const template = this.challengeTemplates[challengeType];
            if (!template) return null;
            
            // タイトルと説明をランダム選択
            const titleIndex = Math.floor(Math.random() * template.titles.length);
            const descriptionIndex = Math.floor(Math.random() * template.descriptions.length);
            
            // 目標値の計算
            const baseTarget = template.baseDifficulty[playerLevel];
            const variationFactor = 0.8 + Math.random() * 0.4; // 80%-120%の変動
            const target = Math.floor(baseTarget * variationFactor);
            
            const challenge = {
                id: `weekly_${challengeType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'weekly',
                challengeType: challengeType,
                title: template.titles[titleIndex],
                description: template.descriptions[descriptionIndex].replace('{target}', target.toLocaleString()),
                category: template.category,
                progressType: template.progressType,
                target: target,
                difficulty: playerLevel,
                startDate: this.weekStartDate.getTime(),
                endDate: this.nextResetTime,
                rewards: this.calculateChallengeRewards(challengeType, playerLevel, target),
                isActive: true,
                metadata: {
                    weekStartDate: this.weekStartDate.toISOString(),
                    playerLevelAtCreation: playerLevel,
                    templateUsed: challengeType
                }
            };
            
            console.log('WeeklyChallengeManager: チャレンジ作成', challenge);
            return challenge;
        } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_CHALLENGE_CREATE_ERROR', {
                operation: 'createWeeklyChallenge',
                challengeType,
                playerLevel
            });
            return null;
        }
    }
    
    /**
     * チャレンジ報酬の計算
     */
    calculateChallengeRewards(challengeType: string, difficulty: string, target: number): any {
        const baseRewards = {
            easy: { ap: 500, coins: 100, experience: 200 },
            normal: { ap: 1000, coins: 250, experience: 500 },
            hard: { ap: 2000, coins: 500, experience: 1000 },
            expert: { ap: 4000, coins: 1000, experience: 2000 }
        };
        
        const base = baseRewards[difficulty] || baseRewards.normal;
        
        // チャレンジタイプによる報酬倍率
        const typeMultipliers = {
            totalScore: 1.2,
            totalPlayCount: 1.0,
            totalBubblePop: 1.1,
            bestCombo: 1.3,
            totalPlayTime: 1.0,
            perfectGames: 1.5,
            speedClear: 1.4
        };
        
        const multiplier = typeMultipliers[challengeType] || 1.0;
        
        return {
            ap: Math.floor(base.ap * multiplier),
            coins: Math.floor(base.coins * multiplier),
            experience: Math.floor(base.experience * multiplier),
            specialItems: difficulty === 'expert' ? ['weekly_master_badge'] : []
        };
    }
    
    /**
     * 進捗の更新
     */
    updateProgress(progressType: string, value: number, gameData: any = {}): void {
        try {
            for (const challenge of this.currentChallenges) {
                if (challenge.progressType === progressType && challenge.isActive) {
                    const progress = this.weeklyProgress.get(challenge.id);
                    if (progress && !progress.isCompleted) {
                        const oldValue = progress.currentValue;
                        
                        // 進捗タイプに応じた更新
                        switch (progressType) {
                            case 'COMBO_BEST':
                                progress.currentValue = Math.max(progress.currentValue, value);
                                break;
                            default:
                                progress.currentValue += value;
                                break;
                        }
                        
                        // 履歴の記録
                        progress.progressHistory.push({
                            timestamp: Date.now(),
                            oldValue: oldValue,
                            newValue: progress.currentValue,
                            delta: value,
                            gameData: gameData
                        });
                        
                        // 完了チェック
                        if (progress.currentValue >= challenge.target) {
                            this.completeChallenge(challenge.id);
                        }
                        
                        console.log(`WeeklyChallengeManager: 進捗更新 ${challenge.title}: ${progress.currentValue}/${challenge.target}`);
                    }
                }
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_PROGRESS_UPDATE_ERROR', {
                operation: 'updateProgress',
                progressType,
                value
            });
        }
    }
    
    /**
     * チャレンジの完了
     */
    completeChallenge(challengeId: string): void {
        try {
            const challenge = this.currentChallenges.find(c => c.id === challengeId);
            const progress = this.weeklyProgress.get(challengeId);
            
            if (challenge && progress && !progress.isCompleted) {
                progress.isCompleted = true;
                progress.completedAt = Date.now();
                
                // 報酬の付与
                this.grantRewards(challenge.rewards);
                
                // 統計の更新
                this.stats.completedWeeklyChallenges++;
                this.updateCompletionRate();
                
                // イベントの発火
                this.emitChallengeCompleteEvent(challenge);
                
                console.log(`WeeklyChallengeManager: チャレンジ完了 - ${challenge.title}`);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_CHALLENGE_COMPLETE_ERROR', {
                operation: 'completeChallenge',
                challengeId
            });
        }
    }
    
    /**
     * 報酬の付与
     */
    grantRewards(rewards: any): void {
        try {
            if (this.gameEngine.rewardSystem) {
                this.gameEngine.rewardSystem.grantRewards(rewards);
            } else {
                console.warn('RewardSystem not available');
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_REWARD_GRANT_ERROR', {
                operation: 'grantRewards',
                rewards
            });
        }
    }
    
    /**
     * 完了率の更新
     */
    updateCompletionRate(): void {
        const totalChallenges = this.stats.totalWeeklyChallenges;
        this.stats.weeklyCompletionRate = totalChallenges > 0 
            ? (this.stats.completedWeeklyChallenges / totalChallenges) * 100 
            : 0;
    }
    
    /**
     * チャレンジ完了イベントの発火
     */
    emitChallengeCompleteEvent(challenge: any): void {
        if (this.gameEngine.eventEmitter) {
            this.gameEngine.eventEmitter.emit('weeklyChallengeCompleted', {
                challenge,
                rewards: challenge.rewards,
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners(): void {
        if (this.gameEngine.eventEmitter) {
            // ゲーム終了イベント
            this.gameEngine.eventEmitter.on('gameEnded', (data: any) => {
                this.updateProgress('SCORE_CUMULATIVE', data.score || 0, data);
                this.updateProgress('PLAY_COUNT_CUMULATIVE', 1, data);
                this.updateProgress('BUBBLE_POP_CUMULATIVE', data.bubblesPopped || 0, data);
                this.updateProgress('COMBO_BEST', data.maxCombo || 0, data);
                this.updateProgress('TIME_PLAYED_CUMULATIVE', data.playTime || 0, data);
                
                if (data.isPerfect) {
                    this.updateProgress('PERFECT_GAME_COUNT', 1, data);
                }
                
                if (data.isFastClear) {
                    this.updateProgress('FAST_CLEAR_COUNT', 1, data);
                }
            });
        }
    }
    
    /**
     * 自動リセットタイマーの設定
     */
    setupAutoReset(): void {
        const checkInterval = 60000; // 1分ごとにチェック
        
        setInterval(() => {
            this.checkWeeklyReset();
        }, checkInterval);
    }
    
    /**
     * 前週チャレンジのアーカイブ
     */
    archivePreviousWeekChallenges(): void {
        try {
            if (this.currentChallenges.length > 0) {
                const archiveEntry = {
                    weekStartDate: this.weekStartDate.toISOString(),
                    weekEndDate: new Date(this.nextResetTime).toISOString(),
                    challenges: this.currentChallenges.map(challenge => ({
                        ...challenge,
                        progress: this.weeklyProgress.get(challenge.id)
                    })),
                    completionRate: this.calculateWeekCompletionRate(),
                    timestamp: Date.now()
                };
                
                this.challengeHistory.unshift(archiveEntry);
                
                // アーカイブサイズ制限
                if (this.challengeHistory.length > this.config.maxArchiveWeeks) {
                    this.challengeHistory = this.challengeHistory.slice(0, this.config.maxArchiveWeeks);
                }
                
                console.log('WeeklyChallengeManager: 前週チャレンジをアーカイブしました');
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_ARCHIVE_ERROR', {
                operation: 'archivePreviousWeekChallenges'
            });
        }
    }
    
    /**
     * 週完了率の計算
     */
    calculateWeekCompletionRate(): number {
        const totalChallenges = this.currentChallenges.length;
        if (totalChallenges === 0) return 0;
        
        const completedChallenges = this.currentChallenges.filter(challenge => {
            const progress = this.weeklyProgress.get(challenge.id);
            return progress?.isCompleted || false;
        }).length;
        
        return (completedChallenges / totalChallenges) * 100;
    }
    
    /**
     * 週間統計の更新
     */
    updateWeeklyStats(): void {
        this.stats.totalWeeksParticipated++;
        
        // 今週の完了率を計算
        const thisWeekCompletion = this.calculateWeekCompletionRate();
        
        // 最高週間パフォーマンスの更新
        if (thisWeekCompletion > this.stats.bestWeeklyPerformance) {
            this.stats.bestWeeklyPerformance = thisWeekCompletion;
        }
        
        // ストリークの計算
        if (thisWeekCompletion === 100) {
            this.stats.currentStreak++;
            if (this.stats.currentStreak > this.stats.longestStreak) {
                this.stats.longestStreak = this.stats.currentStreak;
            }
        } else {
            this.stats.currentStreak = 0;
        }
        
        // 平均完了率の計算
        if (this.challengeHistory.length > 0) {
            const totalCompletion = this.challengeHistory.reduce((sum, week) => sum + week.completionRate, 0);
            this.stats.averageWeeklyProgress = totalCompletion / this.challengeHistory.length;
        }
    }
    
    /**
     * データの保存
     */
    saveWeeklyChallengeData(): void {
        try {
            const data = {
                currentChallenges: this.currentChallenges,
                weeklyProgress: Array.from(this.weeklyProgress.entries()),
                challengeHistory: this.challengeHistory,
                weekStartDate: this.weekStartDate.toISOString(),
                nextResetTime: this.nextResetTime,
                stats: this.stats,
                lastSaved: Date.now()
            };
            
            localStorage.setItem(this.config.storageKey, JSON.stringify(data));
        } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_SAVE_ERROR', {
                operation: 'saveWeeklyChallengeData'
            });
        }
    }
    
    /**
     * データの読み込み
     */
    loadWeeklyChallengeData(): void {
        try {
            const saved = localStorage.getItem(this.config.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                
                this.currentChallenges = data.currentChallenges || [];
                this.weeklyProgress = new Map(data.weeklyProgress || []);
                this.challengeHistory = data.challengeHistory || [];
                
                if (data.weekStartDate) {
                    this.weekStartDate = new Date(data.weekStartDate);
                }
                
                if (data.nextResetTime) {
                    this.nextResetTime = data.nextResetTime;
                }
                
                this.stats = { ...this.stats, ...data.stats };
                
                console.log('WeeklyChallengeManager: データ読み込み完了');
            }
        } catch (error) {
            console.warn('WeeklyChallengeManager: データ読み込みエラー', error);
        }
    }
    
    // パブリックAPI
    
    /**
     * 現在のウィークリーチャレンジ取得
     */
    getCurrentChallenges(): any[] {
        return this.currentChallenges.map(challenge => ({
            ...challenge,
            progress: this.weeklyProgress.get(challenge.id)
        }));
    }
    
    /**
     * チャレンジ履歴取得
     */
    getChallengeHistory(): any[] {
        return [...this.challengeHistory];
    }
    
    /**
     * 統計情報取得
     */
    getStatistics(): any {
        return { ...this.stats };
    }
    
    /**
     * 次のリセット時刻取得
     */
    getNextResetTime(): number {
        return this.nextResetTime;
    }
    
    /**
     * 残り時間取得
     */
    getTimeUntilReset(): number {
        return Math.max(0, this.nextResetTime - Date.now());
    }
    
    /**
     * 手動リセット（開発/テスト用）
     */
    forceReset(): void {
        this.performWeeklyReset();
    }
    
    /**
     * クリーンアップ
     */
    destroy(): void {
        try {
            // データの保存
            this.saveWeeklyChallengeData();
            
            console.log('WeeklyChallengeManager: クリーンアップ完了');
        } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_DESTROY_ERROR', {
                operation: 'destroy'
            });
        }
    }
}