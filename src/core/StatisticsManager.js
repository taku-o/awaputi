/**
 * 統計管理クラス
 */
export class StatisticsManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.statistics = this.initializeStatistics();
        this.sessionStats = this.initializeSessionStats();
        this.gameStartTime = null;
        this.lowHpStartTime = null;
        
        // StatisticsCollectorの統合（遅延読み込み）
        this.collector = null;
        this.initializeCollector();
    }
    
    /**
     * StatisticsCollectorの初期化
     */
    async initializeCollector() {
        try {
            const { StatisticsCollector } = await import('./StatisticsCollector.js');
            this.collector = new StatisticsCollector(this);
        } catch (error) {
            console.warn('StatisticsCollector not available, using fallback mode:', error);
        }
    }
    
    /**
     * 統計データを初期化
     */
    initializeStatistics() {
        return {
            // 基本統計
            totalGamesPlayed: 0,
            totalPlayTime: 0,
            totalScore: 0,
            highestScore: 0,
            averageScore: 0,
            longestSession: 0,
            shortestSession: Infinity,
            averageSessionLength: 0,
            sessionsToday: 0,
            
            // スコア分布統計（新規追加）
            scoreDistribution: {
                '0-1000': 0,
                '1001-5000': 0,
                '5001-10000': 0,
                '10001-25000': 0,
                '25001-50000': 0,
                '50001+': 0
            },
            
            // 泡統計
            totalBubblesPopped: 0,
            totalBubblesMissed: 0,
            bubbleAccuracy: 0,
            bubbleTypeStats: {
                normal: 0,
                stone: 0,
                iron: 0,
                diamond: 0,
                pink: 0,
                poison: 0,
                spiky: 0,
                rainbow: 0,
                clock: 0,
                score: 0,
                electric: 0,
                escaping: 0,
                cracked: 0,
                boss: 0,
                // 新しい泡タイプ
                golden: 0,
                frozen: 0,
                magnetic: 0,
                explosive: 0,
                phantom: 0,
                multiplier: 0
            },
            
            // 効率統計（新規追加）
            efficiencyStats: {
                bubblesPerMinute: 0,
                bubblesPerSecond: 0,
                peakEfficiency: 0,
                efficiencyTrend: [],
                bestEfficiencySession: 0,
                worstEfficiencySession: Infinity
            },
            
            // 反応時間統計（新規追加）
            reactionTimeStats: {
                average: 0,
                fastest: Infinity,
                slowest: 0,
                distribution: {
                    'under_200ms': 0,
                    '200_500ms': 0,
                    '500_1000ms': 0,
                    'over_1000ms': 0
                },
                recentTimes: [] // 最新100回の反応時間
            },
            
            // コンボ統計
            totalCombos: 0,
            highestCombo: 0,
            averageCombo: 0,
            comboBreaks: 0,
            
            // コンボ詳細統計（新規追加）
            comboDetailStats: {
                comboRanges: {
                    '1-5': 0,
                    '6-10': 0,
                    '11-20': 0,
                    '21-50': 0,
                    '51+': 0
                },
                comboSuccessRate: 0,
                averageComboLength: 0,
                longestComboStreak: 0,
                comboRecoveryTime: 0 // コンボが切れてから次のコンボまでの時間
            },
            
            // HP統計
            totalDamageTaken: 0,
            totalHpHealed: 0,
            timesRevived: 0,
            lowHpTime: 0, // HP10以下の時間
            
            // HP詳細統計（新規追加）
            hpDetailStats: {
                criticalHpEvents: 0, // HP5以下になった回数
                nearDeathRecoveries: 0, // HP1から回復した回数
                perfectHealthGames: 0, // ダメージを受けなかったゲーム数
                averageDamagePerGame: 0,
                maxDamageInSingleGame: 0,
                healingEfficiency: 0 // 回復量/ダメージ量
            },
            
            // ステージ統計
            stageStats: {},
            stagesCompleted: 0,
            stagesFailed: 0,
            
            // ステージ詳細統計（新規追加）
            stageDetailStats: {
                favoriteStage: null,
                mostDifficultStage: null,
                fastestClearTime: {},
                averageClearTime: {},
                stageRetryCount: {},
                stageCompletionRate: {},
                stagePerfectionRate: {} // ステージ別パーフェクト達成率
            },
            
            // 特殊効果統計
            bonusTimeActivated: 0,
            timeStopActivated: 0,
            chainReactionsTriggered: 0,
            screenShakesTriggered: 0,
            
            // 新しい効果統計
            scoreMultipliersUsed: 0,
            magneticPullsTriggered: 0,
            bigExplosionsTriggered: 0,
            phantomPhases: 0,
            
            // 特殊効果詳細統計（新規追加）
            specialEffectDetailStats: {
                effectUsageRates: {}, // 効果別使用率
                effectSuccessRates: {}, // 効果別成功率
                mostEffectiveEffect: null,
                totalEffectDuration: 0,
                effectChainCombos: 0 // 効果を連続で発動した回数
            },
            
            // プレイスタイル統計
            clicksPerMinute: 0,
            averageReactionTime: 0,
            dragOperations: 0,
            perfectGames: 0,
            
            // プレイスタイル詳細統計（新規追加）
            playStyleDetailStats: {
                clickPattern: {
                    clicksPerMinute: 0,
                    burstClicking: 0, // 短時間で多数クリック
                    steadyClicking: 0, // 安定したクリック
                    pauseFrequency: 0 // 一時停止の頻度
                },
                strategyAnalysis: {
                    priorityTargeting: 0, // 特殊泡を優先する傾向
                    comboFocus: 0, // コンボを重視する傾向
                    survivalFocus: 0 // 生存を重視する傾向
                },
                adaptability: {
                    difficultyAdjustment: 0,
                    learningCurve: 0,
                    consistencyScore: 0
                },
                mouseMovementStats: {
                    totalDistance: 0,
                    averageSpeed: 0,
                    accuracyRatio: 0
                }
            },
            
            // 時間統計
            playTimeByHour: new Array(24).fill(0),
            playTimeByDay: new Array(7).fill(0),
            
            // 時間詳細統計（新規追加）
            timeDetailStats: {
                playTimeByMonth: {},
                playTimeByYear: {},
                peakHour: 0,
                peakDay: 0,
                playingStreaks: {
                    currentStreak: 0,
                    longestStreak: 0,
                    streakHistory: []
                },
                sessionGaps: {
                    averageGap: 0,
                    longestGap: 0,
                    shortestGap: Infinity
                }
            },
            
            // 進歩統計
            apEarned: 0,
            apSpent: 0,
            itemsPurchased: 0,
            achievementsUnlocked: 0,
            
            // 進歩詳細統計（新規追加）
            progressDetailStats: {
                apEarningRate: 0, // 時間あたりのAP獲得率
                spendingEfficiency: 0, // AP支出効率
                itemUsageStats: {},
                achievementProgress: {},
                milestones: [], // 達成したマイルストーン
                growthTrends: {
                    scoreImprovement: {
                        daily: 0,
                        weekly: 0,
                        monthly: 0,
                        trend: 'stable' // 'improving', 'stable', 'declining'
                    },
                    skillImprovement: {
                        accuracyImprovement: 0,
                        speedImprovement: 0,
                        consistencyImprovement: 0
                    }
                }
            },
            
            // エラー・デバッグ統計（新規追加）
            errorStats: {
                gameErrors: 0,
                performanceIssues: 0,
                connectionIssues: 0,
                recoverySuccessRate: 0
            },
            
            // ソーシャル統計（新規追加、将来の機能用）
            socialStats: {
                shareCount: 0,
                challengesCompleted: 0,
                communityRank: 0,
                friendsConnected: 0
            }
        };
    }
    
    /**
     * セッション統計を初期化
     */
    initializeSessionStats() {
        return {
            gamesThisSession: 0,
            scoreThisSession: 0,
            bubblesThisSession: 0,
            playTimeThisSession: 0,
            sessionStartTime: Date.now()
        };
    }
    
    /**
     * ゲーム開始時の統計更新
     */
    onGameStart(stageId) {
        this.gameStartTime = Date.now();
        this.statistics.totalGamesPlayed++;
        this.sessionStats.gamesThisSession++;
        
        // ステージ統計を初期化
        if (!this.statistics.stageStats[stageId]) {
            this.statistics.stageStats[stageId] = {
                gamesPlayed: 0,
                gamesCompleted: 0,
                totalScore: 0,
                highScore: 0,
                totalPlayTime: 0,
                bubblesPopped: 0
            };
        }
        
        this.statistics.stageStats[stageId].gamesPlayed++;
        
        // 時間統計を更新
        const now = new Date();
        this.statistics.playTimeByHour[now.getHours()]++;
        this.statistics.playTimeByDay[now.getDay()]++;
    }
    
    /**
     * ゲーム終了時の統計更新
     */
    onGameEnd(data) {
        const playTime = Date.now() - this.gameStartTime;
        const { finalScore, stageId, bubblesPopped, bubblesMissed, maxCombo, completed, damage } = data;
        
        // 基本統計更新
        this.statistics.totalPlayTime += playTime;
        this.statistics.totalScore += finalScore;
        this.statistics.highestScore = Math.max(this.statistics.highestScore, finalScore);
        this.statistics.averageScore = this.statistics.totalScore / this.statistics.totalGamesPlayed;
        
        // スコア分布統計更新
        this.updateScoreDistribution(finalScore);
        
        // セッション長統計更新
        this.updateSessionLengthStats(playTime);
        
        // 泡統計更新
        this.statistics.totalBubblesPopped += bubblesPopped;
        this.statistics.totalBubblesMissed += bubblesMissed;
        this.statistics.bubbleAccuracy = 
            (this.statistics.totalBubblesPopped / (this.statistics.totalBubblesPopped + this.statistics.totalBubblesMissed)) * 100;
        
        // コンボ統計更新
        this.statistics.highestCombo = Math.max(this.statistics.highestCombo, maxCombo);
        this.statistics.totalCombos += maxCombo;
        this.statistics.averageCombo = this.statistics.totalCombos / this.statistics.totalGamesPlayed;
        
        // コンボ詳細統計更新
        this.updateComboDetailStats(maxCombo);
        
        // HP詳細統計更新
        this.updateHpDetailStats(damage || 0, bubblesMissed === 0);
        
        // ステージ統計更新
        const stageStats = this.statistics.stageStats[stageId];
        stageStats.totalScore += finalScore;
        stageStats.highScore = Math.max(stageStats.highScore, finalScore);
        stageStats.totalPlayTime += playTime;
        stageStats.bubblesPopped += bubblesPopped;
        
        // ステージ詳細統計更新
        this.updateStageDetailStats(stageId, playTime, finalScore, completed);
        
        if (completed) {
            stageStats.gamesCompleted++;
            this.statistics.stagesCompleted++;
            
            // パーフェクトゲーム判定
            if (bubblesMissed === 0 && bubblesPopped >= 50) {
                this.statistics.perfectGames++;
                this.statistics.hpDetailStats.perfectHealthGames++;
            }
        } else {
            this.statistics.stagesFailed++;
        }
        
        // セッション統計更新
        this.sessionStats.scoreThisSession += finalScore;
        this.sessionStats.bubblesThisSession += bubblesPopped;
        this.sessionStats.playTimeThisSession += playTime;
        
        // セッション時間統計
        this.statistics.longestSession = Math.max(this.statistics.longestSession, playTime);
        this.statistics.shortestSession = Math.min(this.statistics.shortestSession, playTime);
        
        // 時間詳細統計更新
        this.updateTimeDetailStats();
        
        // 進歩詳細統計更新
        this.updateProgressDetailStats(finalScore, playTime);
        
        // StatisticsCollectorでのイベント収集
        if (this.collector) {
            this.collector.collectEvent('game_ended', data);
        }
        
        this.save();
    }
    
    /**
     * スコア分布統計の更新
     */
    updateScoreDistribution(score) {
        const dist = this.statistics.scoreDistribution;
        
        if (score <= 1000) {
            dist['0-1000']++;
        } else if (score <= 5000) {
            dist['1001-5000']++;
        } else if (score <= 10000) {
            dist['5001-10000']++;
        } else if (score <= 25000) {
            dist['10001-25000']++;
        } else if (score <= 50000) {
            dist['25001-50000']++;
        } else {
            dist['50001+']++;
        }
    }
    
    /**
     * セッション長統計の更新
     */
    updateSessionLengthStats(playTime) {
        const totalSessions = this.statistics.totalGamesPlayed;
        const currentAvg = this.statistics.averageSessionLength;
        
        this.statistics.averageSessionLength = 
            (currentAvg * (totalSessions - 1) + playTime) / totalSessions;
    }
    
    /**
     * コンボ詳細統計の更新
     */
    updateComboDetailStats(maxCombo) {
        const comboStats = this.statistics.comboDetailStats;
        
        // コンボ範囲別統計
        if (maxCombo <= 5) {
            comboStats.comboRanges['1-5']++;
        } else if (maxCombo <= 10) {
            comboStats.comboRanges['6-10']++;
        } else if (maxCombo <= 20) {
            comboStats.comboRanges['11-20']++;
        } else if (maxCombo <= 50) {
            comboStats.comboRanges['21-50']++;
        } else {
            comboStats.comboRanges['51+']++;
        }
        
        // 最長コンボストリーク更新
        comboStats.longestComboStreak = Math.max(comboStats.longestComboStreak, maxCombo);
        
        // 平均コンボ長更新
        const totalCombos = this.statistics.totalCombos;
        const gamesPlayed = this.statistics.totalGamesPlayed;
        comboStats.averageComboLength = totalCombos / gamesPlayed;
        
        // コンボ成功率計算
        const totalComboAttempts = totalCombos + this.statistics.comboBreaks;
        comboStats.comboSuccessRate = totalComboAttempts > 0 ? 
            (totalCombos / totalComboAttempts) * 100 : 0;
    }
    
    /**
     * HP詳細統計の更新
     */
    updateHpDetailStats(gameDamage, perfectHealth) {
        const hpStats = this.statistics.hpDetailStats;
        
        if (perfectHealth) {
            hpStats.perfectHealthGames++;
        }
        
        if (gameDamage > 0) {
            hpStats.maxDamageInSingleGame = Math.max(hpStats.maxDamageInSingleGame, gameDamage);
            
            const totalGames = this.statistics.totalGamesPlayed;
            const currentAvg = hpStats.averageDamagePerGame;
            hpStats.averageDamagePerGame = 
                (currentAvg * (totalGames - 1) + gameDamage) / totalGames;
        }
        
        // 回復効率計算
        if (this.statistics.totalDamageTaken > 0) {
            hpStats.healingEfficiency = 
                this.statistics.totalHpHealed / this.statistics.totalDamageTaken;
        }
    }
    
    /**
     * ステージ詳細統計の更新
     */
    updateStageDetailStats(stageId, playTime, score, completed) {
        const stageDetailStats = this.statistics.stageDetailStats;
        
        // 最速クリア時間更新
        if (completed) {
            if (!stageDetailStats.fastestClearTime[stageId] || 
                playTime < stageDetailStats.fastestClearTime[stageId]) {
                stageDetailStats.fastestClearTime[stageId] = playTime;
            }
        }
        
        // 平均クリア時間更新
        if (!stageDetailStats.averageClearTime[stageId]) {
            stageDetailStats.averageClearTime[stageId] = playTime;
        } else {
            const currentAvg = stageDetailStats.averageClearTime[stageId];
            const stageCompletions = this.statistics.stageStats[stageId].gamesCompleted;
            stageDetailStats.averageClearTime[stageId] = 
                (currentAvg * (stageCompletions - 1) + playTime) / stageCompletions;
        }
        
        // ステージ完了率更新
        const stageStats = this.statistics.stageStats[stageId];
        stageDetailStats.stageCompletionRate[stageId] = 
            (stageStats.gamesCompleted / stageStats.gamesPlayed) * 100;
    }
    
    /**
     * 時間詳細統計の更新
     */
    updateTimeDetailStats() {
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
        const yearKey = now.getFullYear().toString();
        
        const timeStats = this.statistics.timeDetailStats;
        
        // 月別・年別プレイ時間更新
        if (!timeStats.playTimeByMonth[monthKey]) {
            timeStats.playTimeByMonth[monthKey] = 0;
        }
        if (!timeStats.playTimeByYear[yearKey]) {
            timeStats.playTimeByYear[yearKey] = 0;
        }
        
        const sessionTime = Date.now() - this.sessionStats.sessionStartTime;
        timeStats.playTimeByMonth[monthKey] += sessionTime;
        timeStats.playTimeByYear[yearKey] += sessionTime;
        
        // ピーク時間・曜日更新
        timeStats.peakHour = this.statistics.playTimeByHour.indexOf(
            Math.max(...this.statistics.playTimeByHour)
        );
        timeStats.peakDay = this.statistics.playTimeByDay.indexOf(
            Math.max(...this.statistics.playTimeByDay)
        );
    }
    
    /**
     * 進歩詳細統計の更新
     */
    updateProgressDetailStats(score, playTime) {
        const progressStats = this.statistics.progressDetailStats;
        
        // AP獲得率更新
        if (this.statistics.totalPlayTime > 0) {
            progressStats.apEarningRate = 
                this.statistics.apEarned / (this.statistics.totalPlayTime / 3600000); // 時間あたり
        }
        
        // 支出効率更新
        if (this.statistics.apSpent > 0) {
            progressStats.spendingEfficiency = 
                this.statistics.totalScore / this.statistics.apSpent;
        }
        
        // スコア向上トレンド更新（簡易版）
        if (this.statistics.totalGamesPlayed > 1) {
            const currentAvg = this.statistics.averageScore;
            const previousAvg = (this.statistics.totalScore - score) / (this.statistics.totalGamesPlayed - 1);
            
            if (currentAvg > previousAvg * 1.1) {
                progressStats.growthTrends.scoreImprovement.trend = 'improving';
            } else if (currentAvg < previousAvg * 0.9) {
                progressStats.growthTrends.scoreImprovement.trend = 'declining';
            } else {
                progressStats.growthTrends.scoreImprovement.trend = 'stable';
            }
        }
    }
    
    /**
     * 泡が割れた時の統計更新
     */
    onBubblePopped(bubbleType, reactionTime) {
        this.statistics.bubbleTypeStats[bubbleType]++;
        
        // 反応時間統計の更新
        if (reactionTime) {
            this.updateReactionTimeStats(reactionTime);
        }
        
        // 効率統計の更新
        this.updateEfficiencyStats();
        
        // StatisticsCollectorでのイベント収集
        if (this.collector) {
            this.collector.collectBubbleEvent('bubble_popped', {
                type: bubbleType,
                reactionTime: reactionTime,
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * 反応時間統計の更新
     */
    updateReactionTimeStats(reactionTime) {
        const rtStats = this.statistics.reactionTimeStats;
        
        // 基本統計更新
        const currentAvg = this.statistics.averageReactionTime;
        const totalBubbles = this.statistics.totalBubblesPopped;
        this.statistics.averageReactionTime = 
            (currentAvg * (totalBubbles - 1) + reactionTime) / totalBubbles;
        
        // 詳細統計更新
        rtStats.average = this.statistics.averageReactionTime;
        rtStats.fastest = Math.min(rtStats.fastest, reactionTime);
        rtStats.slowest = Math.max(rtStats.slowest, reactionTime);
        
        // 分布統計更新
        if (reactionTime < 200) {
            rtStats.distribution.under_200ms++;
        } else if (reactionTime < 500) {
            rtStats.distribution['200_500ms']++;
        } else if (reactionTime < 1000) {
            rtStats.distribution['500_1000ms']++;
        } else {
            rtStats.distribution.over_1000ms++;
        }
        
        // 最新の反応時間履歴更新
        rtStats.recentTimes.push(reactionTime);
        if (rtStats.recentTimes.length > 100) {
            rtStats.recentTimes.shift();
        }
    }
    
    /**
     * 効率統計の更新
     */
    updateEfficiencyStats() {
        const effStats = this.statistics.efficiencyStats;
        const playTimeMinutes = this.statistics.totalPlayTime / 60000;
        
        if (playTimeMinutes > 0) {
            effStats.bubblesPerMinute = this.statistics.totalBubblesPopped / playTimeMinutes;
            effStats.bubblesPerSecond = this.statistics.totalBubblesPopped / (this.statistics.totalPlayTime / 1000);
            effStats.peakEfficiency = Math.max(effStats.peakEfficiency, effStats.bubblesPerMinute);
        }
        
        // セッション効率の記録
        if (this.gameStartTime) {
            const sessionTime = Date.now() - this.gameStartTime;
            const sessionBubbles = this.sessionStats.bubblesThisSession;
            if (sessionTime > 0) {
                const sessionEfficiency = (sessionBubbles / (sessionTime / 60000));
                effStats.bestEfficiencySession = Math.max(effStats.bestEfficiencySession, sessionEfficiency);
                effStats.worstEfficiencySession = Math.min(effStats.worstEfficiencySession, sessionEfficiency);
            }
        }
    }
    
    /**
     * コンボ更新時の統計更新
     */
    onComboUpdate(combo, broken = false) {
        if (broken) {
            this.statistics.comboBreaks++;
        }
    }
    
    /**
     * ダメージを受けた時の統計更新
     */
    onDamageTaken(damage) {
        this.statistics.totalDamageTaken += damage;
        
        // 低HP状態の追跡開始
        if (this.gameEngine.playerData.currentHP <= 10 && !this.lowHpStartTime) {
            this.lowHpStartTime = Date.now();
        }
    }
    
    /**
     * HP回復時の統計更新
     */
    onHpHealed(healAmount) {
        this.statistics.totalHpHealed += healAmount;
        
        // 低HP状態の追跡終了
        if (this.gameEngine.playerData.currentHP > 10 && this.lowHpStartTime) {
            this.statistics.lowHpTime += Date.now() - this.lowHpStartTime;
            this.lowHpStartTime = null;
        }
    }
    
    /**
     * 復活時の統計更新
     */
    onRevived() {
        this.statistics.timesRevived++;
    }
    
    /**
     * 特殊効果発動時の統計更新
     */
    onSpecialEffect(effectType) {
        switch (effectType) {
            case 'rainbow':
                this.statistics.bonusTimeActivated++;
                break;
            case 'clock':
                this.statistics.timeStopActivated++;
                break;
            case 'spiky':
                this.statistics.chainReactionsTriggered++;
                break;
            case 'electric':
                this.statistics.screenShakesTriggered++;
                break;
            case 'golden':
                this.statistics.scoreMultipliersUsed++;
                break;
            case 'magnetic':
                this.statistics.magneticPullsTriggered++;
                break;
            case 'explosive':
                this.statistics.bigExplosionsTriggered++;
                break;
            case 'phantom':
                this.statistics.phantomPhases++;
                break;
        }
    }
    
    /**
     * ドラッグ操作時の統計更新
     */
    onDragOperation() {
        this.statistics.dragOperations++;
    }
    
    /**
     * アイテム購入時の統計更新
     */
    onItemPurchased(cost) {
        this.statistics.itemsPurchased++;
        this.statistics.apSpent += cost;
    }
    
    /**
     * AP獲得時の統計更新
     */
    onApEarned(amount) {
        this.statistics.apEarned += amount;
    }
    
    /**
     * 実績解除時の統計更新
     */
    onAchievementUnlocked() {
        this.statistics.achievementsUnlocked++;
    }
    
    /**
     * 詳細統計を取得
     */
    getDetailedStatistics() {
        const sessionTime = Date.now() - this.sessionStats.sessionStartTime;
        
        return {
            // 基本統計
            basic: {
                totalGamesPlayed: this.statistics.totalGamesPlayed,
                totalPlayTime: this.formatTime(this.statistics.totalPlayTime),
                totalScore: this.statistics.totalScore,
                highestScore: this.statistics.highestScore,
                averageScore: Math.round(this.statistics.averageScore),
                completionRate: this.statistics.stagesCompleted / (this.statistics.stagesCompleted + this.statistics.stagesFailed) * 100,
                longestSession: this.formatTime(this.statistics.longestSession),
                shortestSession: this.formatTime(this.statistics.shortestSession),
                averageSessionLength: this.formatTime(this.statistics.averageSessionLength),
                scoreDistribution: this.statistics.scoreDistribution
            },
            
            // 泡統計
            bubbles: {
                totalPopped: this.statistics.totalBubblesPopped,
                totalMissed: this.statistics.totalBubblesMissed,
                accuracy: this.statistics.bubbleAccuracy.toFixed(1) + '%',
                typeBreakdown: this.statistics.bubbleTypeStats,
                favoriteType: this.getFavoriteBubbleType(),
                averageReactionTime: this.statistics.averageReactionTime.toFixed(0) + 'ms',
                efficiencyStats: this.statistics.efficiencyStats,
                reactionTimeStats: this.statistics.reactionTimeStats
            },
            
            // コンボ統計
            combos: {
                highestCombo: this.statistics.highestCombo,
                averageCombo: this.statistics.averageCombo.toFixed(1),
                totalCombos: this.statistics.totalCombos,
                comboBreaks: this.statistics.comboBreaks,
                comboSuccessRate: ((this.statistics.totalCombos - this.statistics.comboBreaks) / this.statistics.totalCombos * 100).toFixed(1) + '%',
                comboDetailStats: this.statistics.comboDetailStats
            },
            
            // HP統計
            health: {
                totalDamageTaken: this.statistics.totalDamageTaken,
                totalHpHealed: this.statistics.totalHpHealed,
                timesRevived: this.statistics.timesRevived,
                lowHpTime: this.formatTime(this.statistics.lowHpTime),
                survivalRate: (this.statistics.stagesCompleted / this.statistics.totalGamesPlayed * 100).toFixed(1) + '%',
                hpDetailStats: this.statistics.hpDetailStats
            },
            
            // ステージ統計
            stages: {
                completed: this.statistics.stagesCompleted,
                failed: this.statistics.stagesFailed,
                stageBreakdown: this.statistics.stageStats,
                favoriteStage: this.getFavoriteStage(),
                stageDetailStats: this.statistics.stageDetailStats
            },
            
            // 特殊効果統計
            effects: {
                bonusTimeActivated: this.statistics.bonusTimeActivated,
                timeStopActivated: this.statistics.timeStopActivated,
                chainReactions: this.statistics.chainReactionsTriggered,
                screenShakes: this.statistics.screenShakesTriggered,
                scoreMultipliers: this.statistics.scoreMultipliersUsed,
                magneticPulls: this.statistics.magneticPullsTriggered,
                bigExplosions: this.statistics.bigExplosionsTriggered,
                phantomPhases: this.statistics.phantomPhases,
                specialEffectDetailStats: this.statistics.specialEffectDetailStats
            },
            
            // プレイスタイル統計
            playstyle: {
                clicksPerMinute: this.calculateClicksPerMinute(),
                dragOperations: this.statistics.dragOperations,
                perfectGames: this.statistics.perfectGames,
                playTimeDistribution: this.getPlayTimeDistribution(),
                playStyleDetailStats: this.statistics.playStyleDetailStats
            },
            
            // 時間統計
            timeStats: {
                playTimeByHour: this.statistics.playTimeByHour,
                playTimeByDay: this.statistics.playTimeByDay,
                timeDetailStats: this.statistics.timeDetailStats,
                peakPlayingTimes: this.getPeakPlayingTimes()
            },
            
            // セッション統計
            session: {
                gamesThisSession: this.sessionStats.gamesThisSession,
                scoreThisSession: this.sessionStats.scoreThisSession,
                bubblesThisSession: this.sessionStats.bubblesThisSession,
                sessionTime: this.formatTime(sessionTime),
                averageScoreThisSession: this.sessionStats.gamesThisSession > 0 ? 
                    Math.round(this.sessionStats.scoreThisSession / this.sessionStats.gamesThisSession) : 0
            },
            
            // 進歩統計
            progress: {
                apEarned: this.statistics.apEarned,
                apSpent: this.statistics.apSpent,
                itemsPurchased: this.statistics.itemsPurchased,
                achievementsUnlocked: this.statistics.achievementsUnlocked,
                efficiency: this.statistics.apEarned > 0 ? 
                    (this.statistics.totalScore / this.statistics.apEarned).toFixed(2) : 0,
                progressDetailStats: this.statistics.progressDetailStats
            },
            
            // エラー・システム統計
            system: {
                errorStats: this.statistics.errorStats,
                collectorStats: this.collector ? this.collector.getCollectorStatistics() : null
            },
            
            // ソーシャル統計（将来の機能用）
            social: {
                socialStats: this.statistics.socialStats
            }
        };
    }
    
    /**
     * ピークプレイング時間の取得
     */
    getPeakPlayingTimes() {
        const hourNames = [
            '0時', '1時', '2時', '3時', '4時', '5時', '6時', '7時', '8時', '9時', '10時', '11時',
            '12時', '13時', '14時', '15時', '16時', '17時', '18時', '19時', '20時', '21時', '22時', '23時'
        ];
        
        const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
        
        return {
            peakHour: {
                hour: this.statistics.timeDetailStats.peakHour,
                name: hourNames[this.statistics.timeDetailStats.peakHour],
                playTime: this.statistics.playTimeByHour[this.statistics.timeDetailStats.peakHour]
            },
            peakDay: {
                day: this.statistics.timeDetailStats.peakDay,
                name: dayNames[this.statistics.timeDetailStats.peakDay],
                playTime: this.statistics.playTimeByDay[this.statistics.timeDetailStats.peakDay]
            }
        };
    }
    
    /**
     * お気に入りの泡タイプを取得
     */
    getFavoriteBubbleType() {
        let maxCount = 0;
        let favoriteType = 'normal';
        
        Object.entries(this.statistics.bubbleTypeStats).forEach(([type, count]) => {
            if (count > maxCount) {
                maxCount = count;
                favoriteType = type;
            }
        });
        
        return { type: favoriteType, count: maxCount };
    }
    
    /**
     * お気に入りのステージを取得
     */
    getFavoriteStage() {
        let maxGames = 0;
        let favoriteStage = null;
        
        Object.entries(this.statistics.stageStats).forEach(([stageId, stats]) => {
            if (stats.gamesPlayed > maxGames) {
                maxGames = stats.gamesPlayed;
                favoriteStage = stageId;
            }
        });
        
        return { stage: favoriteStage, games: maxGames };
    }
    
    /**
     * 1分あたりのクリック数を計算
     */
    calculateClicksPerMinute() {
        if (this.statistics.totalPlayTime === 0) return 0;
        return Math.round(this.statistics.totalBubblesPopped / (this.statistics.totalPlayTime / 60000));
    }
    
    /**
     * プレイ時間分布を取得
     */
    getPlayTimeDistribution() {
        return {
            byHour: this.statistics.playTimeByHour,
            byDay: this.statistics.playTimeByDay,
            peakHour: this.statistics.playTimeByHour.indexOf(Math.max(...this.statistics.playTimeByHour)),
            peakDay: this.statistics.playTimeByDay.indexOf(Math.max(...this.statistics.playTimeByDay))
        };
    }
    
    /**
     * 時間をフォーマット
     */
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}時間${minutes % 60}分`;
        } else if (minutes > 0) {
            return `${minutes}分${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }
    
    /**
     * ランキング情報を取得
     */
    getRankings() {
        // 簡単なランキングシステム（将来的にはサーバーサイドで実装）
        const rankings = {
            score: this.statistics.highestScore,
            bubbles: this.statistics.totalBubblesPopped,
            combo: this.statistics.highestCombo,
            playtime: this.statistics.totalPlayTime,
            achievements: this.statistics.achievementsUnlocked
        };
        
        return rankings;
    }
    
    /**
     * データを保存
     */
    save() {
        try {
            localStorage.setItem('bubblePop_statistics', JSON.stringify(this.statistics));
        } catch (error) {
            console.error('Failed to save statistics:', error);
        }
    }
    
    /**
     * データを読み込み
     */
    load() {
        try {
            const savedData = localStorage.getItem('bubblePop_statistics');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.statistics = { ...this.initializeStatistics(), ...data };
                
                // データ整合性チェック
                this.validateStatistics();
            }
        } catch (error) {
            console.error('Failed to load statistics:', error);
            this.statistics = this.initializeStatistics();
        }
    }
    
    /**
     * 統計データの整合性チェック
     */
    validateStatistics() {
        try {
            // 基本統計の検証
            if (this.statistics.totalGamesPlayed < 0) {
                this.statistics.totalGamesPlayed = 0;
            }
            
            if (this.statistics.totalPlayTime < 0) {
                this.statistics.totalPlayTime = 0;
            }
            
            if (this.statistics.totalScore < 0) {
                this.statistics.totalScore = 0;
            }
            
            // 泡統計の検証
            if (this.statistics.totalBubblesPopped < 0) {
                this.statistics.totalBubblesPopped = 0;
            }
            
            if (this.statistics.totalBubblesMissed < 0) {
                this.statistics.totalBubblesMissed = 0;
            }
            
            // バブル精度の再計算
            const totalBubbles = this.statistics.totalBubblesPopped + this.statistics.totalBubblesMissed;
            if (totalBubbles > 0) {
                this.statistics.bubbleAccuracy = (this.statistics.totalBubblesPopped / totalBubbles) * 100;
            } else {
                this.statistics.bubbleAccuracy = 0;
            }
            
            // 平均スコアの再計算
            if (this.statistics.totalGamesPlayed > 0) {
                this.statistics.averageScore = this.statistics.totalScore / this.statistics.totalGamesPlayed;
            } else {
                this.statistics.averageScore = 0;
            }
            
            // 新規統計項目の初期化チェック
            if (!this.statistics.scoreDistribution) {
                this.statistics.scoreDistribution = {
                    '0-1000': 0,
                    '1001-5000': 0,
                    '5001-10000': 0,
                    '10001-25000': 0,
                    '25001-50000': 0,
                    '50001+': 0
                };
            }
            
            if (!this.statistics.efficiencyStats) {
                this.statistics.efficiencyStats = {
                    bubblesPerMinute: 0,
                    bubblesPerSecond: 0,
                    peakEfficiency: 0,
                    efficiencyTrend: [],
                    bestEfficiencySession: 0,
                    worstEfficiencySession: Infinity
                };
            }
            
            if (!this.statistics.reactionTimeStats) {
                this.statistics.reactionTimeStats = {
                    average: 0,
                    fastest: Infinity,
                    slowest: 0,
                    distribution: {
                        'under_200ms': 0,
                        '200_500ms': 0,
                        '500_1000ms': 0,
                        'over_1000ms': 0
                    },
                    recentTimes: []
                };
            }
            
            if (!this.statistics.comboDetailStats) {
                this.statistics.comboDetailStats = {
                    comboRanges: {
                        '1-5': 0,
                        '6-10': 0,
                        '11-20': 0,
                        '21-50': 0,
                        '51+': 0
                    },
                    comboSuccessRate: 0,
                    averageComboLength: 0,
                    longestComboStreak: 0,
                    comboRecoveryTime: 0
                };
            }
            
            if (!this.statistics.hpDetailStats) {
                this.statistics.hpDetailStats = {
                    criticalHpEvents: 0,
                    nearDeathRecoveries: 0,
                    perfectHealthGames: 0,
                    averageDamagePerGame: 0,
                    maxDamageInSingleGame: 0,
                    healingEfficiency: 0
                };
            }
            
            if (!this.statistics.stageDetailStats) {
                this.statistics.stageDetailStats = {
                    favoriteStage: null,
                    mostDifficultStage: null,
                    fastestClearTime: {},
                    averageClearTime: {},
                    stageRetryCount: {},
                    stageCompletionRate: {},
                    stagePerfectionRate: {}
                };
            }
            
            if (!this.statistics.playStyleDetailStats) {
                this.statistics.playStyleDetailStats = {
                    clickPattern: {
                        clicksPerMinute: 0,
                        burstClicking: 0,
                        steadyClicking: 0,
                        pauseFrequency: 0
                    },
                    strategyAnalysis: {
                        priorityTargeting: 0,
                        comboFocus: 0,
                        survivalFocus: 0
                    },
                    adaptability: {
                        difficultyAdjustment: 0,
                        learningCurve: 0,
                        consistencyScore: 0
                    },
                    mouseMovementStats: {
                        totalDistance: 0,
                        averageSpeed: 0,
                        accuracyRatio: 0
                    }
                };
            }
            
            if (!this.statistics.timeDetailStats) {
                this.statistics.timeDetailStats = {
                    playTimeByMonth: {},
                    playTimeByYear: {},
                    peakHour: 0,
                    peakDay: 0,
                    playingStreaks: {
                        currentStreak: 0,
                        longestStreak: 0,
                        streakHistory: []
                    },
                    sessionGaps: {
                        averageGap: 0,
                        longestGap: 0,
                        shortestGap: Infinity
                    }
                };
            }
            
            if (!this.statistics.progressDetailStats) {
                this.statistics.progressDetailStats = {
                    apEarningRate: 0,
                    spendingEfficiency: 0,
                    itemUsageStats: {},
                    achievementProgress: {},
                    milestones: [],
                    growthTrends: {
                        scoreImprovement: {
                            daily: 0,
                            weekly: 0,
                            monthly: 0,
                            trend: 'stable'
                        },
                        skillImprovement: {
                            accuracyImprovement: 0,
                            speedImprovement: 0,
                            consistencyImprovement: 0
                        }
                    }
                };
            }
            
            if (!this.statistics.errorStats) {
                this.statistics.errorStats = {
                    gameErrors: 0,
                    performanceIssues: 0,
                    connectionIssues: 0,
                    recoverySuccessRate: 0
                };
            }
            
            if (!this.statistics.socialStats) {
                this.statistics.socialStats = {
                    shareCount: 0,
                    challengesCompleted: 0,
                    communityRank: 0,
                    friendsConnected: 0
                };
            }
            
        } catch (error) {
            console.error('Statistics validation failed:', error);
            // 検証失敗時は統計を初期化
            this.statistics = this.initializeStatistics();
        }
    }
    
    /**
     * データをリセット
     */
    reset() {
        this.statistics = this.initializeStatistics();
        this.sessionStats = this.initializeSessionStats();
        this.save();
    }
}