import { getErrorHandler  } from '../utils/ErrorHandler.js';

/**
 * ウィークリーチャレンジ管理クラス
 * 週単位チャレンジの生成・長期目標管理・進捗追跡を行う
 */
export class WeeklyChallengeManager {
    constructor(gameEngine, challengeSystem) {
        this.gameEngine = gameEngine;
        this.challengeSystem = challengeSystem;
        
        // 設定
        this.config = {
            maxWeeklyChallenges: 2,
            resetTime: 1, // 月曜日 00:00(UTC),', progressStorageKey: 'awaputi_weekly_challenges','
            archiveStorageKey: 'awaputi_weekly_archive',
            maxArchiveWeeks: 12, // 過去12週間分を保持
    }

            storageKey: 'awaputi_weekly_challenge_data' 
    };
        // チャレンジテンプレート定義（長期目標）
        this.challengeTemplates = { // 総合スコア系チャレンジ
            totalScore: {''
                category: 'cumulative';
                progressType: 'SCORE_CUMULATIVE',
                titles: [','
                    'ウィークリースコアチャンピオン',
                    'スコアマスターウィーク',]','
                    '週間ポイントハンター'],
                ],
                descriptions: ['
            }', '週間で合計{target}点を獲得しよう',', '1週間で{target}点の壁を突破しよう',]', '今週の目標：合計{target}点']'
                ],
                baseDifficulty: { easy: 25000,
                    normal: 75000,
                    hard: 150000,
    expert: 300000 
    };
            // 総プレイ回数系チャレンジ
            totalPlayCount: { ''
                category: 'consistency',
                progressType: 'PLAY_COUNT_CUMULATIVE',
                titles: [','
                    'ウィークリープレイマスター',
                    '継続の達人',]','
                    '週間ゲーマー'],
                ],
                descriptions: ['
            }', '1週間で{target}回プレイしよう',', '今週は{target}ゲーム挑戦だ',]', '週間{target}プレイを達成しよう']'
                ],
                baseDifficulty: { easy: 15,
                    normal: 35,
                    hard: 70,
    expert: 140 
    };
            // 総泡破壊数系チャレンジ
            totalBubblePop: { ''
                category: 'action',
                progressType: 'BUBBLE_POP_CUMULATIVE',
                titles: [','
                    'ウィークリーバブルクラッシャー',
                    '泡の全滅者',]','
                    '週間ポップマスター'],
                ],
                descriptions: ['
            }', '1週間で{target}個の泡を割ろう',', '週間{target}ポップを達成しよう',]', '今週の目標：{target}個破壊']'
                ],
                baseDifficulty: { easy: 1000,
                    normal: 3500,
                    hard: 8000,
    expert: 15000 
    };
            // 最高コンボ系チャレンジ
            bestCombo: { ''
                category: 'skill',
                progressType: 'COMBO_BEST',
                titles: [','
                    'ウィークリーコンボキング',
                    '連鎖の帝王',]','
                    '週間コンボマスター'],
                ],
                descriptions: ['
            }', '今週中に{target}コンボを達成しよう',', '週間最大{target}連鎖を目指そう',]', '{target}コンボの記録更新を狙おう']'
                ],
                baseDifficulty: { easy: 30,
                    normal: 75,
                    hard: 150,
    expert: 300 
    };
            // 総プレイ時間系チャレンジ
            totalPlayTime: { ''
                category: 'endurance',
                progressType: 'TIME_PLAYED_CUMULATIVE',
                titles: [','
                    'ウィークリータイムマスター',
                    '時間の支配者',]','
                    '週間エンデュランス'],
                ],
                descriptions: ['
            }', '1週間で合計{target}分プレイしよう',', '今週は{target}分間の挑戦だ',]', '週間{target}分プレイを達成しよう']'
                ],
                baseDifficulty: { easy: 120,
                    normal: 300,
                    hard: 600,
    expert: 1200 
    };
            // 連続日数系チャレンジ
            consecutiveDays: { ''
                category: 'consistency',
                progressType: 'CONSECUTIVE_DAYS',
                titles: [','
                    'ウィークリー皆勤賞',
                    '7日間チャレンジャー',]','
                    '継続は力なり'],
                ],
                descriptions: ['
            }', '{target}日連続でプレイしよう',', '連続{target}日プレイを達成しよう',]', '{target}日間毎日挑戦しよう']'
                ],
                baseDifficulty: { easy: 4,
                    normal: 5,
                    hard: 6,
    expert: 7 
    };
        // 報酬テーブル（週間チャレンジは報酬が豪華）
        this.rewardTables = { easy: [' }'

                { type: 'ap', amount: 150, weight: 60  },''
                { type: 'item', itemId: 'time_boost', amount: 3, weight: 25  },]'
                { type: 'item', itemId: 'score_boost', amount: 3, weight: 15  }]
            ],
            normal: [','
                { type: 'ap', amount: 350, weight: 50  },''
                { type: 'item', itemId: 'time_boost', amount: 5, weight: 20  },''
                { type: 'item', itemId: 'score_boost', amount: 5, weight: 20  },]'
                { type: 'item', itemId: 'bubble_slow', amount: 3, weight: 10  }]
            ],
            hard: [','
                { type: 'ap', amount: 600, weight: 40  },''
                { type: 'item', itemId: 'time_boost', amount: 8, weight: 20  },''
                { type: 'item', itemId: 'score_boost', amount: 8, weight: 20  },''
                { type: 'item', itemId: 'bubble_slow', amount: 5, weight: 15  },]'
                { type: 'title', titleId: 'weekly_achiever', weight: 5  }]
            ],
            expert: [','
                { type: 'ap', amount: 1000, weight: 30  },''
                { type: 'item', itemId: 'time_boost', amount: 12, weight: 20  },''
                { type: 'item', itemId: 'score_boost', amount: 12, weight: 20  },''
                { type: 'item', itemId: 'bubble_slow', amount: 8, weight: 20  },''
                { type: 'title', titleId: 'weekly_master', weight: 8  },]'
                { type: 'theme', themeId: 'weekly_special', weight: 2  }]
            ];
        };
        
        // 内部状態
        this.playerPerformance = { weeklyAverageScore: 0,
            weeklyAveragePlayCount: 0,
            weeklyConsistency: 0,
            lastWeekCompletionRate: 0,
    longestStreak: 0  };
        this.currentWeek = null;
        this.lastGenerationWeek = null;
        this.thisWeeksChallenges = [];
        this.weeklyArchive = [];
        
        // 週間統計追跡
        this.weeklyStats = { currentWeekStart: null,''
            playDays: new Set()','
        console.log('[WeeklyChallengeManager] 初期化完了') }'

    /**
     * 初期化
     */
    async initialize() { try {
            // プレイヤー実績データを読み込み
            await this.loadPlayerPerformance(),
            
            // 週間データを読み込み
            await this.loadWeeklyData(),
            // 今週のチャレンジをチェック・生成
            await this.checkAndGenerateWeeksChallenges(),

            console.log('[WeeklyChallengeManager] 初期化完了' }

        } catch (error') { getErrorHandler().handleError(error, 'WEEKLY_CHALLENGE_INIT_ERROR', {''
                component: 'WeeklyChallengeManager'
            });
        }
    }

    /**
     * 今週のチャレンジをチェック・生成
     */
    async checkAndGenerateWeeksChallenges() { const currentWeek = this.getCurrentWeekString(),
        ','
        // 既に今週のチャレンジが生成済みかチェック
        if (this.lastGenerationWeek === currentWeek && this.thisWeeksChallenges.length > 0) {

            console.log('[WeeklyChallengeManager] 今週のチャレンジは既に生成済み) }'
            return; }
        }
        
        // 週が変わった場合は前週のデータをアーカイブ
        if (this.lastGenerationWeek && this.lastGenerationWeek !== currentWeek) { await this.archiveLastWeek() }
        
        // 新しいウィークリーチャレンジを生成
        await this.generateWeeksChallenges();
        
        this.lastGenerationWeek = currentWeek;
        this.currentWeek = currentWeek;
        
        // 週間統計をリセット
        this.resetWeeklyStats();
        
        await this.saveWeeklyData();
    }

    /**
     * 前週データをアーカイブ
     */
    async archiveLastWeek() { try {
            if (this.thisWeeksChallenges.length === 0) return,
            
            const archiveEntry = {
                week: this.lastGenerationWeek,
    challenges: this.thisWeeksChallenges.map(challenge => ({)
                    ...challenge),
                    progress: this.challengeSystem.playerProgress.get(challenge.id) completed: this.challengeSystem.completedChallenges.has(challenge.id) 
    });
                stats: { ...this.weeklyStats,
                archivedAt: Date.now() };
            
            this.weeklyArchive.unshift(archiveEntry);
            
            // 最大保持週数を超えた場合は古いデータを削除
            if (this.weeklyArchive.length > this.config.maxArchiveWeeks) { this.weeklyArchive = this.weeklyArchive.slice(0 this.config.maxArchiveWeeks') }'
            
            console.log(`[WeeklyChallengeManager] 前週データをアーカイブ: ${this.lastGenerationWeek}`}');'
            ';'

        } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_ARCHIVE_ERROR) }'
    }

    /**
     * 今週のチャレンジを生成
     */
    async generateWeeksChallenges() { try {
            this.thisWeeksChallenges = [];
            const templateKeys = Object.keys(this.challengeTemplates),
            
            // 難易度を決定（プレイヤーの実績に基づいて）
            const difficulty = this.calculateOptimalDifficulty(),
            
            // ランダムに2つのチャレンジテンプレートを選択
            const selectedTemplates = this.selectRandomTemplates(templateKeys, this.config.maxWeeklyChallenges),
            
            const weekStart = this.getWeekStartTime(),
            const weekEnd = this.getWeekEndTime(),
            
            for(let, i = 0, i < selectedTemplates.length, i++) {
            
                const template = this.challengeTemplates[selectedTemplates[i]],
                const challenge = await this.createChallengeFromTemplate(
                    template, ,
                    difficulty, ,
                    this.currentWeek ),
                    i,
                    weekStart),
                    weekEnd,
                
                if (challenge) {
    
}
                    this.thisWeeksChallenges.push(challenge); }
                    console.log(`[WeeklyChallengeManager] ウィークリーチャレンジ生成: ${challenge.title}`});
                }
            }
            
            console.log(`[WeeklyChallengeManager] ${this.thisWeeksChallenges.length}件のウィークリーチャレンジを生成`});
            ';'

        } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_CHALLENGE_GENERATION_ERROR) }'
    }

    /**
     * テンプレートからチャレンジを作成
     */
    async createChallengeFromTemplate(template, difficulty, week, index, weekStart, weekEnd) { try {
            const targetValue = this.calculateTargetValue(template, difficulty),
            const reward = this.selectReward(difficulty),
            
            const challengeData = { }

                id: `weekly_${week}_${index}`,''
                type: 'weekly',
                title: this.selectRandomFromArray(template.titles,
                description: this.selectRandomFromArray(template.descriptions).replace('{ target', targetValue'),'
                progressType: template.progressType,
                targetValue: targetValue,
                reward: reward,
                startTime: weekStart,
                endTime: weekEnd,
                isActive: true,
                category: template.category,
                difficulty: difficulty,
    metadata: {
                    week: week,
    template: template,
                    weeklyIndex: index,
                    isCumulative: template.progressType.includes('CUMULATIVE') || template.progressType.includes('BEST',
                    resetType: 'weekly'
            }
            };
            // チャレンジシステムに登録
            return this.challengeSystem.createChallenge(challengeData);
            ';'

        } catch (error) { }

            getErrorHandler().handleError(error, 'WEEKLY_CHALLENGE_TEMPLATE_CREATION_ERROR', { template, difficulty });
            return null;

    /**
     * 最適な難易度を計算
     */
    calculateOptimalDifficulty() {
        const performance = this.playerPerformance,
        ','
        // プレイヤーの過去の完了率と一貫性に基づいて難易度を調整
        if (performance.lastWeekCompletionRate >= 0.8 && performance.weeklyConsistency >= 0.7) {
    }

            return 'expert'; }

        } else if (performance.lastWeekCompletionRate >= 0.6 && performance.weeklyConsistency >= 0.5) { ''
            return 'hard',' }'

        } else if (performance.lastWeekCompletionRate >= 0.4) { ''
            return 'normal', else { }

            return 'easy';

    /**
     * 目標値を計算
     */
    calculateTargetValue(template, difficulty) {
        let baseValue = template.baseDifficulty[difficulty],
        
        // プレイヤーの実績に基づいて微調整
        let adjustmentFactor = 1.0,

        switch(template.progressType) {''
            case 'SCORE_CUMULATIVE':,
                if (this.playerPerformance.weeklyAverageScore > 0) {
                    adjustmentFactor = Math.max(0.7, Math.min(1.4, ') }'

                        this.playerPerformance.weeklyAverageScore / template.baseDifficulty.normal'); }'
                }
                break;

            case 'PLAY_COUNT_CUMULATIVE':
                if (this.playerPerformance.weeklyAveragePlayCount > 0) {
                    adjustmentFactor = Math.max(0.8, Math.min(1.3) }

                        this.playerPerformance.weeklyAveragePlayCount / template.baseDifficulty.normal)'); }'
                }
                break;

            case 'CONSECUTIVE_DAYS':
                // 連続日数は実績に基づかずベース値を使用
                adjustmentFactor = 1.0;
                break;
        }
        
        return Math.round(baseValue * adjustmentFactor);
    }

    /**
     * 報酬を選択
     */
    selectReward(difficulty) {
        const rewardTable = this.rewardTables[difficulty],
        const totalWeight = rewardTable.reduce((sum, reward) => sum + reward.weight, 0),
        const random = Math.random() * totalWeight,
        
        let currentWeight = 0,
        for (const reward of rewardTable) {
            currentWeight += reward.weight,
            if (random <= currentWeight) {
                return { type: reward.type,
                    amount: reward.amount,
    itemId: reward.itemId }
                    titleId: reward.titleId };
                    themeId: reward.themeId 
    }
        }
        
        // フォールバック
        return rewardTable[0];
    }

    /**
     * ランダムテンプレート選択
     */
    selectRandomTemplates(templates, count) {
        const shuffled = [...templates].sort(() => Math.random() - 0.5) }
        return shuffled.slice(0, count);

    /**
     * 配列からランダム選択
     */
    selectRandomFromArray(array) { return array[Math.floor(Math.random() * array.length)] }

    /**
     * 今週のチャレンジ取得
     */
    getWeeksChallenges() {
        return this.thisWeeksChallenges.map(challenge => { ),
            const progress = this.challengeSystem.playerProgress.get(challenge.id),
            return { ...challenge,
                progress: progress ? { : undefined
                    current: progress.currentValue,
    target: challenge.targetValue }
                    percentage: Math.min(100, (progress.currentValue / challenge.targetValue) * 100) }
                    completed: progress.completed };
                    rewardClaimed: progress.rewardClaimed 
    } : null;);
    }

    /**
     * 週間統計取得
     */
    getWeeklyStats() {
        const week = this.getCurrentWeekString() }
        const weeksProgress = this.thisWeeksChallenges.map(challenge => { ) }
            const progress = this.challengeSystem.playerProgress.get(challenge.id); }
            return progress || { currentValue: 0, completed: false;);
        
        return { week: week,
            totalChallenges: this.thisWeeksChallenges.length,
            completedChallenges: weeksProgress.filter(p => p.completed).length,
            totalProgress: weeksProgress.reduce((sum, p) => sum + p.currentValue, 0),
            averageProgress: weeksProgress.length > 0 ,
                ? weeksProgress.reduce((sum, p, i) => {  }
                    const target = this.thisWeeksChallenges[i]?.targetValue || 1; };
                    return sum + (p.currentValue / target);, 0) / weeksProgress.length : undefined
                : 0,
            difficulty: this.calculateOptimalDifficulty();
            playDays: this.weeklyStats.playDays.size,
    weekRemaining: this.getWeekEndTime() - Date.now();
        }

    /**
     * アーカイブ取得
     */
    getWeeklyArchive() {
        return this.weeklyArchive.map(entry = > ({)
            ...entry),
            completionRate: entry.challenges.filter(c => c.completed).length / entry.challenges.length }
            totalRewards: entry.challenges.filter(c => c.completed && c.progress?.rewardClaimed).length 
    });
    }

    /**
     * 週間進捗を更新
     */
    updateWeeklyProgress(progressType, value) {
        try {'
            const today = new Date().toISOString().split('T'[0],
            this.weeklyStats.playDays.add(today),
            ','
            // 累積系進捗の更新
            if(progressType.includes('CUMULATIVE)' {''
                const key = progressType.replace('_CUMULATIVE', '),'

                this.weeklyStats.cumulativeProgress[key] = ' }'

                    (this.weeklyStats.cumulativeProgress[key] || 0') + value; }'
            }
            ';'
            // ベスト記録の更新
            if(progressType.includes('BEST)' { ''
                const key = progressType.replace('_BEST', '),'

                this.weeklyStats.bestRecords[key] = ','
                    Math.max(this.weeklyStats.bestRecords[key] || 0, value) }
            ';'
            // 連続日数の更新
            if (progressType === 'CONSECUTIVE_DAYS) { this.updateConsecutiveDays() }'

            } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_PROGRESS_UPDATE_ERROR', {)
                progressType, value) });
        }
    }

    /**
     * 連続日数を更新
     */
    updateConsecutiveDays() {
        const sortedDays = Array.from(this.weeklyStats.playDays).sort(),
        let currentStreak = 1,
        let maxStreak = 1,
        
        for (let, i = 1, i < sortedDays.length, i++) {
            const prevDate = new Date(sortedDays[i - 1]),
            const currDate = new Date(sortedDays[i]),
            const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24),
            
            if (dayDiff === 1) {
                currentStreak++ }

                maxStreak = Math.max(maxStreak, currentStreak); }
            } else { currentStreak = 1 }
        }
        ';'
        // CONSECUTIVE_DAYSチャレンジの進捗を更新
        this.challengeSystem.updateProgress('CONSECUTIVE_DAYS', maxStreak);
    }

    /**
     * 週間統計をリセット
     */
    resetWeeklyStats() { this.weeklyStats = { : undefined
            currentWeekStart: this.getWeekStartTime( 
           , playDays: new, Set() }
            cumulativeProgress: {};
            bestRecords: {}

    /**
     * プレイヤー実績データ読み込み
     */
    async loadPlayerPerformance() { try {
            const data = localStorage.getItem(this.config.progressStorageKey),
            if (data) {
    
}
                const parsed = JSON.parse(data); }
                this.playerPerformance = { ...this.playerPerformance, ...parsed.performance }
            
            // 統計マネージャーから最新データを取得
            if (this.gameEngine.statisticsManager) {
                const stats = this.gameEngine.statisticsManager.getDetailedStatistics() }
                this.updatePerformanceFromStats(stats); }
            } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_PERFORMANCE_LOAD_ERROR) }'
    }

    /**
     * 統計から実績データを更新
     */
    updatePerformanceFromStats(stats) {
        if (stats.gameStats) {
            this.playerPerformance.weeklyAverageScore = stats.gameStats.averageScore * 7 || 0 }
            this.playerPerformance.weeklyAveragePlayCount = stats.gameStats.gamesPlayed || 0; }
        }
        
        // 過去の週間チャレンジ完了率を計算
        const completedWeekly = this.weeklyArchive.filter(entry => );
            entry.challenges.filter(c => c.completed).length === entry.challenges.length;
        ).length;
        
        this.playerPerformance.lastWeekCompletionRate = ;
            this.weeklyArchive.length > 0 ? completedWeekly / this.weeklyArchive.length: 0,
        
        // 一貫性の計算（連続してプレイした週の割合）
        this.playerPerformance.weeklyConsistency = ;
            this.weeklyArchive.length > 0 ? undefined : undefined
            this.weeklyArchive.filter(entry => entry.stats.playDays >= 4).length / this.weeklyArchive.length: 0 
    /**
     * 週間データ保存
     */
    async saveWeeklyData() { try {
            const data = {
                lastGenerationWeek: this.lastGenerationWeek,
                currentWeek: this.currentWeek,
                performance: this.playerPerformance,
    weeklyStats: {
                    ...this.weeklyStats,
                    playDays: Array.from(this.weeklyStats.playDays }
                timestamp: Date.now(),
            };
            
            localStorage.setItem(this.config.progressStorageKey, JSON.stringify(data);
            
            // アーカイブデータを保存
            const archiveData = { archive: this.weeklyArchive,
                timestamp: Date.now(  };
            
            localStorage.setItem(this.config.archiveStorageKey, JSON.stringify(archiveData);
            ';'

        } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_DATA_SAVE_ERROR) }'
    }

    /**
     * 週間データ読み込み
     */
    async loadWeeklyData() { try {
            // 週間データ読み込み
            const data = localStorage.getItem(this.config.progressStorageKey),
            if (data) {
                const parsed = JSON.parse(data),
                this.lastGenerationWeek = parsed.lastGenerationWeek }
                this.currentWeek = parsed.currentWeek; }
                this.playerPerformance = { ...this.playerPerformance, ...parsed.performance,
                
                if (parsed.weeklyStats) {
                
                    this.weeklyStats = {
                        ...parsed.weeklyStats
                        playDays: new Set(parsed.weeklyStats.playDays || []) }
                    }
            }
            
            // アーカイブデータ読み込み
            const archiveData = localStorage.getItem(this.config.archiveStorageKey);
            if (archiveData) {
                const parsed = JSON.parse(archiveData) }
                this.weeklyArchive = parsed.archive || []; }
            } catch (error) {
            getErrorHandler().handleError(error, 'WEEKLY_DATA_LOAD_ERROR) }'
    }

    /**
     * 日付ユーティリティ
     */
    getCurrentWeekString() {
        const now = new Date(),

        const weekStart = this.getWeekStart(now) }

        return weekStart.toISOString().split('T)[0];'

    getWeekStart(date) {

        const d = new Date(date),
        const day = d.getDay(),
        const diff = d.getDate() - day + (day === 0 ? -6 : 1), // 月曜日を週の開始に

    }
        return new Date(d.setDate(diff);

    getWeekStartTime() {

        const weekStart = this.getWeekStart(new, Date(),
        weekStart.setHours(0, 0, 0, 0) }
        return weekStart.getTime();

    getWeekEndTime() {

        const weekStart = this.getWeekStart(new, Date(),
        const weekEnd = new Date(weekStart),
        weekEnd.setDate(weekEnd.getDate() + 7),
        weekEnd.setHours(0, 0, 0, 0) }
        return weekEnd.getTime();

    /**
     * 手動チャレンジ再生成（デバッグ用）
     */
    async regenerateWeeksChallenges() { await this.archiveLastWeek(),
        this.lastGenerationWeek = null;
        this.thisWeeksChallenges = [];
        this.resetWeeklyStats(),
        await this.generateWeeksChallenges(),
        await this.saveWeeklyData() }

    /**
     * クリーンアップ
     */
    cleanup() {

        this.saveWeeklyData() }

        console.log('[WeeklyChallengeManager] クリーンアップ完了'); }

    }'}'