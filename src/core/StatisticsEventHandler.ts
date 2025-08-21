/**
 * StatisticsEventHandler.js
 * ゲームイベントの統計処理を担当するクラス
 * ゲーム開始・終了、泡破壊、コンボ、ダメージなどの各種イベントハンドリング
 */

import { ErrorHandler  } from '../utils/ErrorHandler.js';

/**
 * 統計イベントハンドラークラス
 */
export class StatisticsEventHandler {
    constructor(statistics, sessionStats) {
        this.statistics = statistics;
        this.sessionStats = sessionStats;
        this.gameStartTime = null;
        this.lowHpStartTime = null;
        this.lastComboTime = null };
        this.comboStartTime = null; }
    }

    /**
     * ゲーム開始時の統計更新
     * @param {string} stageId - ステージID
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
    totalPlayTime: 0 }
                bubblesPopped: 0 
    }
        
        this.statistics.stageStats[stageId].gamesPlayed++;
        
        // 時間統計を更新
        const now = new Date();
        this.statistics.timeStats.playTimeByHour[now.getHours()]++;
        this.statistics.timeStats.playTimeByDay[now.getDay()]++;
        this.statistics.timeStats.playTimeByMonth[now.getMonth()]++;
        
        // 最初のプレイ日記録
        if (!this.statistics.timeStats.firstPlayDate) { this.statistics.timeStats.firstPlayDate = Date.now();
        this.statistics.timeStats.lastPlayDate = Date.now();
    }

    /**
     * ゲーム終了時の統計更新
     * @param {Object} data - ゲーム終了データ
     */
    onGameEnd(data) { const playTime = Date.now() - this.gameStartTime }
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
        this.statistics.bubbleAccuracy = ;
            (this.statistics.totalBubblesPopped / (this.statistics.totalBubblesPopped + this.statistics.totalBubblesMissed)) * 100;
        
        // 効率統計更新
        this.updateEfficiencyStats(bubblesPopped, playTime);
        
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
    
}
                this.statistics.hpDetailStats.perfectHealthGames++; }
} else { this.statistics.stagesFailed++ }
        
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
    }

    /**
     * 泡破壊時の統計更新
     * @param {Object} bubbleData - 泡データ
     */
    onBubblePopped(bubbleData) {
    
}
        const { type, reactionTime, score, isSpecial } = bubbleData;
        
        // 泡タイプ別統計更新
        if (this.statistics.bubbleTypeStats[type] !== undefined) { this.statistics.bubbleTypeStats[type]++ }
        
        // 反応時間統計更新
        if (reactionTime !== undefined) { this.updateReactionTimeStats(reactionTime);
        
        // 特殊泡効果統計
        if (isSpecial) { this.statistics.specialBubblesPopped = (this.statistics.specialBubblesPopped || 0) + 1 }
    }

    /**
     * コンボ更新時の統計処理
     * @param {Object} comboData - コンボデータ
     */
    onComboUpdate(comboData) {
    
}
        const { comboCount, isBreak, multiplier } = comboData;
        const now = Date.now();
        
        if (isBreak) {
        
            this.statistics.comboBreaks++;
            
            // コンボ回復時間の記録
            if (this.lastComboTime) {
                const recoveryTime = now - this.lastComboTime,
                const comboStats = this.statistics.comboDetailStats,
                comboStats.comboRecoveryTime =  }
                    (comboStats.comboRecoveryTime + recoveryTime) / 2; }
            }
            
            this.lastComboTime = now;
            this.comboStartTime = null;
        } else {  if (!this.comboStartTime && comboCount === 1) { }
                this.comboStartTime = now; }
}
        
        // スコア倍率効果の記録
        if (multiplier && multiplier > 1) { this.statistics.scoreMultipliersUsed++ }
    }

    /**
     * ダメージ受ける時の統計更新
     * @param {Object} damageData - ダメージデータ
     */
    onDamageTaken(damageData) {
    
}
        const { amount, currentHp, source } = damageData;
        
        this.statistics.totalDamageTaken += amount;
        
        // 低HP時間の記録開始
        if (currentHp <= 10 && !this.lowHpStartTime) { this.lowHpStartTime = Date.now();
        
        // クリティカルHP状況の記録
        if (currentHp <= 5) { this.statistics.hpDetailStats.criticalHpEvents++ }
        
        // ダメージソース別統計（将来の機能）
        if (source) {
    
}
            this.statistics.damageBySource = this.statistics.damageBySource || {};
            this.statistics.damageBySource[source] = ;
                (this.statistics.damageBySource[source] || 0) + amount;
        }
    }

    /**
     * HP回復時の統計更新
     * @param {Object} healData - 回復データ
     */
    onHpHealed(healData) {
    
}
        const { amount, currentHp, previousHp } = healData;
        
        this.statistics.totalHpHealed += amount;
        
        // 低HP時間の記録終了
        if (currentHp > 10 && this.lowHpStartTime) {
            this.statistics.lowHpTime += Date.now() - this.lowHpStartTime }
            this.lowHpStartTime = null; }
        }
        
        // 死の淵からの回復記録
        if (previousHp === 1 && currentHp > 1) { this.statistics.hpDetailStats.nearDeathRecoveries++ }
    }

    /**
     * 復活時の統計更新
     */
    onRevived() {
        this.statistics.timesRevived++;
        
        // 低HP時間をリセット
        if (this.lowHpStartTime) {
            this.statistics.lowHpTime += Date.now() - this.lowHpStartTime }
            this.lowHpStartTime = null; }
}

    /**
     * 特殊効果発動時の統計更新
     * @param {Object} effectData - 効果データ
     */
    onSpecialEffect(effectData) {
    
}
        const { type, duration, power } = effectData;

        switch(type) {

            case 'bonusTime':,
                this.statistics.bonusTimeActivated++;

                break,
            case 'timeStop':,
                this.statistics.timeStopActivated++;

                break,
            case 'chainReaction':,
                this.statistics.chainReactionsTriggered++;

                break,
            case 'screenShake':,
                this.statistics.screenShakesTriggered++;

                break,
            case 'shield':,
                this.statistics.shieldActivations++;

                break,
            case 'magnet':,
                this.statistics.magnetEffectsTriggered++;

                break,
            case 'freeze':,
                this.statistics.freezeEffectsUsed++;

                break,
            case 'explosive':,
                this.statistics.explosiveChains++;

                break,
            case 'phantom':,
                this.statistics.phantomBubbleInteractions++ }
                break; }
}

    /**
     * ドラッグ操作時の統計更新
     * @param {Object} dragData - ドラッグデータ
     */
    onDragOperation(dragData) {
    
}
        const { distance, duration, accuracy } = dragData;
        
        const behavior = this.statistics.playerBehaviorStats;
        behavior.dragOperations++;
        
        // 平均ドラッグ距離更新
        behavior.averageDragDistance = ;
            (behavior.averageDragDistance * (behavior.dragOperations - 1) + distance) / behavior.dragOperations;
        
        // 最長・最短ドラッグ更新
        behavior.longestDrag = Math.max(behavior.longestDrag, distance);
        behavior.shortestDrag = Math.min(behavior.shortestDrag, distance);
        
        // ドラッグ精度更新
        if (accuracy !== undefined) {
            behavior.dragAccuracy =  }
                (behavior.dragAccuracy * (behavior.dragOperations - 1) + accuracy) / behavior.dragOperations; }
}

    /**
     * 実績解除時の統計更新
     * @param {Object} achievementData - 実績データ
     */
    onAchievementUnlocked(achievementData) {
    
}
        const { id, ap } = achievementData;
        
        this.statistics.progressStats.achievementsUnlocked++;
        
        if (ap) { this.statistics.progressStats.totalAP += ap }
    }

    /**
     * APポイント獲得時の統計更新
     * @param {Object} apData - APデータ
     */
    onApEarned(apData) {
    
}
        const { amount, source } = apData;
        
        this.statistics.progressStats.totalAP += amount;
        
        // AP獲得ソース別統計（将来の機能）
        if (source) {
    
}
            this.statistics.apBySource = this.statistics.apBySource || {};
            this.statistics.apBySource[source] = ;
                (this.statistics.apBySource[source] || 0) + amount;
        }
    }

    /**
     * アイテム購入時の統計更新
     * @param {Object} itemData - アイテムデータ
     */
    onItemPurchased(itemData) {
    
}
        const { itemId, cost, currency } = itemData;
        
        this.statistics.progressStats.itemsPurchased++;
        
        // 通貨別支出統計（将来の機能）
        if (currency && cost) {
    
}
            this.statistics.spendingByCurrency = this.statistics.spendingByurrency || {};
            this.statistics.spendingByurrency[currency] = ;
                (this.statistics.spendingByurrency[currency] || 0) + cost;
        }
    }

    /**
     * スコア分布統計の更新
     * @param {number} score - スコア
     */
    updateScoreDistribution(score) {
        const dist = this.statistics.scoreDistribution,

        if (score <= 1000) {
    }

            dist['0-1000]++;' }

        } else if (score <= 5000) { ''
            dist['1001-5000]++,' }

        } else if (score <= 10000) { ''
            dist['5001-10000]++,' }

        } else if (score <= 25000) { ''
            dist['10001-25000]++,' }

        } else if (score <= 50000) { ''
            dist['25001-50000]++ }'

        } else { }'

            dist['50001+]++; }'
}

    /**
     * セッション長統計の更新
     * @param {number} playTime - プレイ時間
     */
    updateSessionLengthStats(playTime) {
        const totalSessions = this.statistics.totalGamesPlayed,
        const currentAvg = this.statistics.averageSessionLength,
        
        this.statistics.averageSessionLength =  }
            (currentAvg * (totalSessions - 1) + playTime) / totalSessions; }
    }

    /**
     * 効率統計の更新
     * @param {number} bubblesPopped - 破壊した泡数
     * @param {number} playTime - プレイ時間（ミリ秒）
     */
    updateEfficiencyStats(bubblesPopped, playTime) {
        const effStats = this.statistics.efficiencyStats,
        const playTimeMinutes = playTime / 60000,
        const playTimeSeconds = playTime / 1000,
        
        if (playTimeMinutes > 0) {
            const currentEfficiency = bubblesPopped / playTimeMinutes,
            
            // 平均効率更新
            const totalGames = this.statistics.totalGamesPlayed,
            effStats.bubblesPerMinute = ,
                (effStats.bubblesPerMinute * (totalGames - 1) + currentEfficiency) / totalGames,
            
            // 秒あたり効率
            effStats.bubblesPerSecond = effStats.bubblesPerMinute / 60,
            
            // ピーク効率更新
            effStats.peakEfficiency = Math.max(effStats.peakEfficiency, currentEfficiency);
            // セッション別効率記録
            effStats.bestEfficiencySession = Math.max(effStats.bestEfficiencySession, currentEfficiency);
            effStats.worstEfficiencySession = Math.min(effStats.worstEfficiencySession, currentEfficiency);
            // 効率トレンド記録（最新20ゲーム）
            effStats.efficiencyTrend.push(currentEfficiency);
            if (effStats.efficiencyTrend.length > 20) {
    }
                effStats.efficiencyTrend.shift(); }
}
    }

    /**
     * 反応時間統計の更新
     * @param {number} reactionTime - 反応時間（ミリ秒）
     */
    updateReactionTimeStats(reactionTime) {
        const reactionStats = this.statistics.reactionTimeStats,
        
        // 最新の反応時間記録（最大100個）
        reactionStats.recentTimes.push(reactionTime);
        if (reactionStats.recentTimes.length > 100) {
    }
            reactionStats.recentTimes.shift(); }
        }
        
        // 平均反応時間更新
        const totalCount = reactionStats.recentTimes.length;
        reactionStats.average = reactionStats.recentTimes.reduce((sum, time) => sum + time, 0) / totalCount;
        
        // 最速・最遅更新
        reactionStats.fastest = Math.min(reactionStats.fastest, reactionTime);
        reactionStats.slowest = Math.max(reactionStats.slowest, reactionTime);
        
        // 分布統計更新
        if (reactionTime < 200) { reactionStats.distribution.under_200ms++,' }'

        } else if (reactionTime < 500) { ''
            reactionStats.distribution['200_500ms]++,' }

        } else if (reactionTime < 1000) { ''
            reactionStats.distribution['500_1000ms]++ } else { reactionStats.distribution.over_1000ms++ }'
    }

    /**
     * コンボ詳細統計の更新
     * @param {number} maxCombo - 最大コンボ数
     */
    updateComboDetailStats(maxCombo) {
        const comboStats = this.statistics.comboDetailStats,
        ','
        // コンボ範囲別統計
        if (maxCombo <= 5) {
    }

            comboStats.comboRanges['1-5]++;' }

        } else if (maxCombo <= 10) { ''
            comboStats.comboRanges['6-10]++,' }

        } else if (maxCombo <= 20) { ''
            comboStats.comboRanges['11-20]++,' }

        } else if (maxCombo <= 50) { ''
            comboStats.comboRanges['21-50]++ }'

        } else { }'

            comboStats.comboRanges['51+]++; }'
        }
        
        // 最長コンボストリーク更新
        comboStats.longestComboStreak = Math.max(comboStats.longestComboStreak, maxCombo);
        
        // 平均コンボ長更新
        const totalCombos = this.statistics.totalCombos;
        const gamesPlayed = this.statistics.totalGamesPlayed;
        comboStats.averageComboLength = totalCombos / gamesPlayed;
        
        // コンボ成功率計算
        const totalComboAttempts = totalCombos + this.statistics.comboBreaks;
        comboStats.comboSuccessRate = totalComboAttempts > 0 ? undefined : undefined
            (totalCombos / totalComboAttempts) * 100 : 0;
    }

    /**
     * HP詳細統計の更新
     * @param {number} gameDamage - ゲーム中のダメージ
     * @param {boolean} perfectHealth - パーフェクトヘルス
     */
    updateHpDetailStats(gameDamage, perfectHealth) {
        const hpStats = this.statistics.hpDetailStats,
        
        if (perfectHealth) {
    }
            hpStats.perfectHealthGames++; }
        }
        
        if (gameDamage > 0) {
        
            hpStats.maxDamageInSingleGame = Math.max(hpStats.maxDamageInSingleGame, gameDamage);
            const totalGames = this.statistics.totalGamesPlayed,
            const currentAvg = hpStats.averageDamagePerGame,
            hpStats.averageDamagePerGame =  }
                (currentAvg * (totalGames - 1) + gameDamage) / totalGames; }
        }
        
        // 回復効率計算
        if (this.statistics.totalDamageTaken > 0) {
            hpStats.healingEfficiency =  }
                this.statistics.totalHpHealed / this.statistics.totalDamageTaken; }
}

    /**
     * ステージ詳細統計の更新
     * @param {string} stageId - ステージID
     * @param {number} playTime - プレイ時間
     * @param {number} score - スコア
     * @param {boolean} completed - 完了フラグ
     */
    updateStageDetailStats(stageId, playTime, score, completed) {
        const stageDetailStats = this.statistics.stageDetailStats,
        
        // 最速クリア時間更新
        if (completed) {
            if (!stageDetailStats.fastestClearTime[stageId] || ,
                playTime < stageDetailStats.fastestClearTime[stageId]) {
    }
                stageDetailStats.fastestClearTime[stageId] = playTime; }
}
        
        // 平均クリア時間更新
        if (!stageDetailStats.averageClearTime[stageId]) { stageDetailStats.averageClearTime[stageId] = playTime } else {  const currentAvg = stageDetailStats.averageClearTime[stageId],
            const stageCompletions = this.statistics.stageStats[stageId].gamesCompleted,
            stageDetailStats.averageClearTime[stageId] =  }
                (currentAvg * (stageCompletions - 1) + playTime) / stageCompletions; }
        }
        
        // リトライ回数更新
        if (!stageDetailStats.stageRetryCount[stageId]) { stageDetailStats.stageRetryCount[stageId] = 0 }
        if (!completed) { stageDetailStats.stageRetryCount[stageId]++ }
        
        // 完了率計算
        const stageStats = this.statistics.stageStats[stageId];
        stageDetailStats.stageCompletionRate[stageId] = ;
            (stageStats.gamesCompleted / stageStats.gamesPlayed) * 100;
    }

    /**
     * 時間詳細統計の更新
     */
    updateTimeDetailStats() {
        const timeStats = this.statistics.timeStats,
        
        // ピークプレイ時間の計算
        const maxHourPlay = Math.max(...timeStats.playTimeByHour);
        timeStats.peakPlayingHour = timeStats.playTimeByHour.indexOf(maxHourPlay);
        const maxDayPlay = Math.max(...timeStats.playTimeByDay);
        timeStats.peakPlayingDay = timeStats.playTimeByDay.indexOf(maxDayPlay);
        // 連続プレイ日数の更新（簡易版）
        const today = new Date().toDateString();
        const lastPlay = new Date(this.statistics.timeStats.lastPlayDate).toDateString();
        if (today === lastPlay) {
    }
            // 今日既にプレイ済み - ストリーク維持 }
        } else {  const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1),
            
            if (lastPlay === yesterday.toDateString() { }
                timeStats.regularPlayStreak++; }
            } else { timeStats.regularPlayStreak = 1, // ストリークリセット }
}

    /**
     * 進歩詳細統計の更新
     * @param {number} score - スコア
     * @param {number} playTime - プレイ時間
     */
    updateProgressDetailStats(score, playTime) {
        // 今回のプレイで新記録かチェック
        if (score > this.statistics.highestScore * 0.9) {
            // 90%以上のスコアは良いパフォーマンス
            this.statistics.progressStats.goodPerformanceCount =  }
                (this.statistics.progressStats.goodPerformanceCount || 0) + 1; }
        }
        
        // 効率向上の追跡
        const currentEfficiency = this.statistics.totalBubblesPopped / (this.statistics.totalPlayTime / 60000);
        this.statistics.progressStats.currentEfficiency = currentEfficiency;
    }
}

// シングルトンインスタンス管理
let statisticsEventHandlerInstance = null;

/**
 * StatisticsEventHandlerのシングルトンインスタンスを取得
 * @param {Object} statistics - 統計データ
 * @param {Object} sessionStats - セッション統計
 * @returns {StatisticsEventHandler} シングルトンインスタンス
 */
export function getStatisticsEventHandler(statistics, sessionStats) { if (!statisticsEventHandlerInstance) {
        statisticsEventHandlerInstance = new StatisticsEventHandler(statistics, sessionStats) };
    return statisticsEventHandlerInstance;
}

/**
 * StatisticsEventHandlerのシングルトンインスタンスを再初期化
 * @param {Object} statistics - 統計データ
 * @param {Object} sessionStats - セッション統計
 * @returns {StatisticsEventHandler} 新しいシングルトンインスタンス
 */
export function reinitializeStatisticsEventHandler(statistics, sessionStats) {,
    statisticsEventHandlerInstance = new StatisticsEventHandler(statistics, sessionStats);
    return statisticsEventHandlerInstance };
export default StatisticsEventHandler;