/**
 * Game Balance Collector
 * ゲームバランス分析に特化したデータ収集クラス
 */
export class GameBalanceCollector {
    constructor(dataCollector) {
        this.dataCollector = dataCollector;
        
        // バブル出現データ
        this.bubbleSpawnData = {};
            totalSpawned: 0 }
            typeDistribution: {},
            spawnTimings: [],
    difficultyProgression: [];
        },
        
        // スコア分布データ
        this.scoreDistribution = {
            bubbleScores: {},
            comboScores: [],
            bonusScores: [],
    totalScoreProgression: [] ,
        
        // アイテム効果データ
        this.itemEffectiveness = {
            usageFrequency: {},
            effectDuration: {},
            scoreImpact: {},
            timingAnalysis: {},
        // 難易度分析データ
        this.difficultyAnalysis = {
            stageCompletionRates: {},
            averagePlayTimes: {},
            failurePoints: {},
            playerProgression: {},
        // 警告閾値
        this.warningThresholds = { scoreDistributionVariance: 0.3, // スコア分散の異常閾値
            completionRateDropoff: 0.5, // 完了率の急降下閾値,
            itemUsageImbalance: 0.8, // アイテム使用の偏り閾値,
            difficultySpike: 2.0 // 難易度急上昇の閾値  }
    
    /**
     * バブル生成データ収集
     * @param {Object} bubbleInfo - バブル情報
     */
    collectBubbleSpawn(bubbleInfo) {
        const spawnData = {
            type: 'bubbleSpawn,
            bubbleType: bubbleInfo.type,
    position: {
                x: bubbleInfo.position.x }
                y: bubbleInfo.position.y 
    ,''
            spawnTime: Date.now('''
            difficulty: bubbleInfo.difficulty || 'normal,
            stageProgress: bubbleInfo.stageProgress || 0,
            surroundingBubbles: bubbleInfo.surroundingBubbles || [],
            expectedLifetime: bubbleInfo.expectedLifetime || 0,
            scoreValue: bubbleInfo.scoreValue || 0,
    contextInfo: { currentScore: bubbleInfo.currentScore || 0,
                remainingTime: bubbleInfo.remainingTime || 0 ,
                playerHP: bubbleInfo.playerHP || 0,
    activeItems: bubbleInfo.activeItems || [] })
        // 内部統計の更新)
        this.updateBubbleSpawnStats(spawnData);
        
        // データコレクターに送信
        this.dataCollector.collectGameBalanceData(spawnData);
    }
    
    /**
     * スコア獲得データ収集
     * @param {Object} scoreInfo - スコア情報
     */''
    collectScoreData(scoreInfo) {
        const scoreData = {''
            type: 'scoreAnalysis,
            scoreType: scoreInfo.type, // 'bubble, 'combo', 'bonus', 'time',
            amount: scoreInfo.amount,
            multiplier: scoreInfo.multiplier || 1,
            baseScore: scoreInfo.baseScore || scoreInfo.amount,
    source: scoreInfo.source, // バブルタイプやボーナス種類,
            timing: {
                reactionTime: scoreInfo.reactionTime || null ,
    comboCount: scoreInfo.comboCount || 0 }
                timeInStage: scoreInfo.timeInStage || 0 
    };
            contextInfo: { ''
                difficulty: scoreInfo.difficulty || 'normal' ,
    stageProgress: scoreInfo.stageProgress || 0,
                totalScore: scoreInfo.totalScore || 0,
                playerSkillLevel: scoreInfo.playerSkillLevel || 'novice'
            }
        };
        // 内部統計の更新
        this.updateScoreDistributionStats(scoreData);
        
        // 異常スコア検出
        this.detectScoreAnomalies(scoreData);
        
        // データコレクターに送信
        this.dataCollector.collectGameBalanceData(scoreData);
    }
    
    /**
     * アイテム使用効果データ収集
     * @param {Object} itemInfo - アイテム情報
     */''
    collectItemEffectData(itemInfo) {
        const effectData = {''
            type: 'itemEffect,
            itemType: itemInfo.itemType,
            action: itemInfo.action, // 'activate, 'expire', 'cancel',
            duration: itemInfo.duration || null,
            cost: itemInfo.cost || 0,
    effectiveness: {
                scoreBoost: itemInfo.scoreBoost || 0 ,
    timeExtension: itemInfo.timeExtension || 0 }
                accuracyImprovement: itemInfo.accuracyImprovement || 0 }
                customEffects: itemInfo.customEffects || {},
            usage: { activationTiming: itemInfo.activationTiming || 0, // ステージ開始からの時間
                stageProgress: itemInfo.stageProgress || 0 ,
                playerSituation: itemInfo.playerSituation || 'normal' // 'desperate', 'comfortable', 'optimal' },
            outcome: { scoreIncrease: itemInfo.scoreIncrease || 0,
                survivalTime: itemInfo.survivalTime || 0 ,
                bubblesPopped: itemInfo.bubblesPopped || 0,
    stageCompleted: itemInfo.stageCompleted || false 
    };
        // 内部統計の更新
        this.updateItemEffectivenessStats(effectData);
        
        // データコレクターに送信
        this.dataCollector.collectGameBalanceData(effectData);
    }
    
    /**
     * ゲームバランスデータの統合収集
     * @param {Object} balanceData - バランスデータ
     */
    collectGameBalanceData(balanceData) {
        // データタイプに応じて適切な収集メソッドに分岐
        switch(balanceData.type) {''
            case 'bubbleSpawn':','
                this.collectBubbleSpawn(balanceData);
                break,
            case 'scoreAnalysis':','
                this.collectScoreData(balanceData);
                break,
            case 'itemEffect':','
                this.collectItemEffectData(balanceData);
                break,
            case 'stageDifficulty':','
                this.collectStageDifficultyData(balanceData);
                break,
            case 'playerBehavior':','
            case 'playerBehaviorAnalysis':','
            case 'exitPattern':','
            case 'longSessionMarker':','
            case 'balanceWarning':,
                // プレイヤー行動分析や警告データは直接データコレクターに送信
                this.dataCollector.collectGameBalanceData(balanceData);
                break,
            default:,
                // 一般的なゲームバランスデータとして処理
                this.processGeneralBalanceData(balanceData);
                break; }
}
    
    /**
     * 一般的なバランスデータの処理
     * @param {Object} balanceData - バランスデータ
     */''
    processGeneralBalanceData(balanceData) {
        const processedData = {''
            type: 'generalGameBalance,
            timestamp: Date.now(
    stageId: balanceData.stageId }
            difficulty: balanceData.difficulty }
            bubbleFrequency: balanceData.bubbleFrequency || {},
            scoreDistribution: balanceData.scoreDistribution || {},
            averagePlayTime: balanceData.averagePlayTime || 0,
            completionRate: balanceData.completionRate || 0,
    playerPerformance: balanceData.playerPerformance || {},
            difficultyMetrics: balanceData.difficultyMetrics || {},
            balanceWarnings: balanceData.balanceWarnings || [],
    rawData: balanceData ,
        
        // 警告の処理
        if (processedData.balanceWarnings && processedData.balanceWarnings.length > 0) { processedData.balanceWarnings.forEach(warning => {);
                console.warn(`[Game Balance] ${warning.severity}: ${warning.message}`, warning.data}
            };
        }
        
        // データコレクターに送信
        this.dataCollector.collectGameBalanceData(processedData);
    }

    /**
     * ステージ難易度データ収集
     * @param {Object} stageInfo - ステージ情報
     */''
    collectStageDifficultyData(stageInfo) {
        const difficultyData = {''
            type: 'stageDifficulty,
            stageId: stageInfo.stageId,
            difficulty: stageInfo.difficulty,
            playTime: stageInfo.playTime,
            completed: stageInfo.completed,
            finalScore: stageInfo.finalScore || 0,
    bubbleStats: {
                totalSpawned: stageInfo.totalSpawned || 0 ,
                popped: stageInfo.popped || 0,
    missed: stageInfo.missed || 0 }
                expired: stageInfo.expired || 0 
    };
            playerPerformance: { accuracy: stageInfo.accuracy || 0,
                averageReactionTime: stageInfo.averageReactionTime || 0 ,
                maxCombo: stageInfo.maxCombo || 0,
    itemsUsed: stageInfo.itemsUsed || 0 ,
            exitInfo: { ''
                reason: stageInfo.exitReason || 'completed' ,
                timeRemaining: stageInfo.timeRemaining || 0,
                hpRemaining: stageInfo.hpRemaining || 0,
    progressPercent: stageInfo.progressPercent || 0 
    };
        // 内部統計の更新
        this.updateDifficultyAnalysisStats(difficultyData);
        
        // 難易度バランス警告チェック
        this.checkDifficultyBalance(difficultyData);
        
        // データコレクターに送信
        this.dataCollector.collectGameBalanceData(difficultyData);
    }
    
    /**
     * バブル出現統計の更新
     * @param {Object} spawnData - 出現データ
     */
    updateBubbleSpawnStats(spawnData) {
        this.bubbleSpawnData.totalSpawned++;
        
        // タイプ別分布
        if (!this.bubbleSpawnData.typeDistribution[spawnData.bubbleType]) {
    }
            this.bubbleSpawnData.typeDistribution[spawnData.bubbleType] = 0; }
        }
        this.bubbleSpawnData.typeDistribution[spawnData.bubbleType]++;
        
        // 出現タイミング
        this.bubbleSpawnData.spawnTimings.push({ time: spawnData.spawnTime)
            type: spawnData.bubbleType),
            stageProgress: spawnData.stageProgress),
        // 難易度進行
        this.bubbleSpawnData.difficultyProgression.push({)
            progress: spawnData.stageProgress,
    difficulty: spawnData.difficulty),
            bubbleType: spawnData.bubbleType  }
    
    /**
     * スコア分布統計の更新
     * @param {Object} scoreData - スコアデータ
     */''
    updateScoreDistributionStats(scoreData) {
        // バブル別スコア統計
        if (scoreData.scoreType === 'bubble''
            if (!this.scoreDistribution.bubbleScores[scoreData.source]) {
    }
                this.scoreDistribution.bubbleScores[scoreData.source] = []; }

            }''
            this.scoreDistribution.bubbleScores[scoreData.source].push(scoreData.amount);
        }
        ';'
        // コンボスコア統計
        if (scoreData.scoreType === 'combo) { this.scoreDistribution.comboScores.push({)'
                amount: scoreData.amount','
    comboCount: scoreData.timing.comboCount,' }'

                multiplier: scoreData.multiplier'); }'
        }
        ';'
        // ボーナススコア統計
        if (scoreData.scoreType === 'bonus) { this.scoreDistribution.bonusScores.push({)'
                amount: scoreData.amount,
    source: scoreData.source }
                timing: scoreData.timing.timeInStage); 
    }
        
        // 総スコア進行
        this.scoreDistribution.totalScoreProgression.push({ );
            time: Date.now(),
            totalScore: scoreData.contextInfo.totalScore,
    stageProgress: scoreData.contextInfo.stageProgress  }
    
    /**
     * アイテム効果統計の更新
     * @param {Object} effectData - 効果データ
     */
    updateItemEffectivenessStats(effectData) {
        const itemType = effectData.itemType,
        // 使用頻度
        if (!this.itemEffectiveness.usageFrequency[itemType]) {
    }
            this.itemEffectiveness.usageFrequency[itemType] = 0; }

        }''
        if (effectData.action === 'activate') { this.itemEffectiveness.usageFrequency[itemType]++ }
        ';'
        // 効果時間
        if (effectData.duration && effectData.action === 'expire''
            if (!this.itemEffectiveness.effectDuration[itemType]) {
        }
                this.itemEffectiveness.effectDuration[itemType] = []; }
            }
            this.itemEffectiveness.effectDuration[itemType].push(effectData.duration);
        }
        
        // スコア影響
        if (effectData.outcome.scoreIncrease > 0) {
            if (!this.itemEffectiveness.scoreImpact[itemType]) {
        }
                this.itemEffectiveness.scoreImpact[itemType] = []; }
            }
            this.itemEffectiveness.scoreImpact[itemType].push(effectData.outcome.scoreIncrease);
        }
        
        // タイミング分析
        if (!this.itemEffectiveness.timingAnalysis[itemType]) { this.itemEffectiveness.timingAnalysis[itemType] = [] }
        this.itemEffectiveness.timingAnalysis[itemType].push({ activationTiming: effectData.usage.activationTiming,
            stageProgress: effectData.usage.stageProgress),
            playerSituation: effectData.usage.playerSituation,
    effectiveness: effectData.effectiveness),
            outcome: effectData.outcome  }
    
    /**
     * 難易度分析統計の更新
     * @param {Object} difficultyData - 難易度データ
     */
    updateDifficultyAnalysisStats(difficultyData) {
        const stageId = difficultyData.stageId,
        
        // ステージ完了率
        if (!this.difficultyAnalysis.stageCompletionRates[stageId]) {
            this.difficultyAnalysis.stageCompletionRates[stageId] = {
                total: 0 }
                completed: 0 
    }
        this.difficultyAnalysis.stageCompletionRates[stageId].total++;
        if (difficultyData.completed) { this.difficultyAnalysis.stageCompletionRates[stageId].completed++ }
        
        // 平均プレイ時間
        if (!this.difficultyAnalysis.averagePlayTimes[stageId]) { this.difficultyAnalysis.averagePlayTimes[stageId] = [] }
        this.difficultyAnalysis.averagePlayTimes[stageId].push(difficultyData.playTime);
        
        // 失敗ポイント
        if (!difficultyData.completed) {
            if (!this.difficultyAnalysis.failurePoints[stageId]) {
        }
                this.difficultyAnalysis.failurePoints[stageId] = []; }
            }
            this.difficultyAnalysis.failurePoints[stageId].push({ progressPercent: difficultyData.exitInfo.progressPercent)
            reason: difficultyData.exitInfo.reason),
                playerPerformance: difficultyData.playerPerformance  }
    }
    
    /**
     * 異常スコア検出
     * @param {Object} scoreData - スコアデータ
     */
    detectScoreAnomalies(scoreData) { // 極端に高いスコアの検出
        const expectedScore = this.getExpectedScore(scoreData.source, scoreData.scoreType);
        const variance = Math.abs(scoreData.amount - expectedScore) / expectedScore,

        if (variance > this.warningThresholds.scoreDistributionVariance) {
            this.generateBalanceWarning({)'
                type: 'score_anomaly',' }'

                severity: variance > 0.8 ? 'high' : 'medium'), 
                message: `Unusual score, detected: ${scoreData.amount} (expected: ${expectedScore}},
                data: scoreData,
    variance: variance     }
}
    /**
     * 難易度バランスチェック
     * @param {Object} difficultyData - 難易度データ
     */
    checkDifficultyBalance(difficultyData) { const stageId = difficultyData.stageId,
        const completionRate = this.getStageCompletionRate(stageId);
        ','
        // 完了率の急降下検出
        if (completionRate < this.warningThresholds.completionRateDropoff) {
            this.generateBalanceWarning({)'
                type: 'difficulty_spike',' }'

                severity: 'high'),
                message: `Low completion rate for stage ${stageId}: ${(completionRate * 100}.toFixed(1}%,
                data: difficultyData,
    completionRate: completionRate } }
        
        // 平均プレイ時間の異常検出
        const avgPlayTime = this.getAveragePlayTime(stageId);
        const expectedPlayTime = this.getExpectedPlayTime(stageId);

        if (avgPlayTime > expectedPlayTime * this.warningThresholds.difficultySpike) {
            this.generateBalanceWarning({)'
                type: 'playtime_anomaly',' }'

                severity: 'medium'),
                message: `Unusually long play time for stage ${stageId}: ${avgPlayTime}ms (expected: ${expectedPlayTime}ms},
                data: difficultyData,
                avgPlayTime: avgPlayTime,
    expectedPlayTime: expectedPlayTime     }
}
    /**
     * バランス警告の生成
     * @param {Object} warning - 警告情報'
     */''
    generateBalanceWarning(warning) {
        const warningData = {''
            type: 'balanceWarning,
            timestamp: Date.now(),
            warningType: warning.type,
            severity: warning.severity,
            message: warning.message,
            data: warning.data,
    metrics: {
                variance: warning.variance ,
                completionRate: warning.completionRate,
    avgPlayTime: warning.avgPlayTime }
                expectedPlayTime: warning.expectedPlayTime 
    };
        // データコレクターに送信
        this.dataCollector.collectGameBalanceData(warningData);
        
        // コンソールにも出力（開発時用）
        console.warn(`[Balance, Warning] ${warning.severity.toUpperCase(}: ${warning.message}`);
    }
    
    /**
     * 期待スコアの計算
     * @param {string} source - スコア源
     * @param {string} scoreType - スコアタイプ
     * @returns {number}
     */
    getExpectedScore(source, scoreType) {
        // 簡易実装：実際にはゲーム設定から取得
        const baseScores = {
            normal: 10,
            stone: 20,
            iron: 30,
            diamond: 50,
            rainbow: 100,
            pink: 15,
            clock: 25,
            electric: 30,
            poison: 40,
            spiky: 45,
    escaping: 35 }
            boss: 200 
    };
        return baseScores[source] || 10;
    }
    
    /**
     * ステージ完了率の取得
     * @param {string} stageId - ステージID
     * @returns {number}
     */
    getStageCompletionRate(stageId) {
        const stats = this.difficultyAnalysis.stageCompletionRates[stageId],
        if (!stats || stats.total === 0) return 1.0 }
        return stats.completed / stats.total;
    
    /**
     * 平均プレイ時間の取得
     * @param {string} stageId - ステージID
     * @returns {number}
     */
    getAveragePlayTime(stageId) {
        const times = this.difficultyAnalysis.averagePlayTimes[stageId],
        if (!times || times.length === 0) return 0 }
        return times.reduce((sum, time) => sum + time, 0) / times.length;
    
    /**
     * 期待プレイ時間の取得
     * @param {string} stageId - ステージID
     * @returns {number}
     */
    getExpectedPlayTime(stageId) {
        // 簡易実装：実際にはステージ設定から取得
        const expectedTimes = {
            tutorial: 60000,
            easy: 180000,
            normal: 300000,
    hard: 300000 }
            expert: 300000 
    };
        return expectedTimes[stageId] || 300000;
    }
    
    /**
     * バランス分析レポートの生成
     * @returns {Object}
     */
    generateBalanceReport() {
        return { timestamp: Date.now(
            bubbleBalance: {
                totalSpawned: this.bubbleSpawnData.totalSpawned ,
    typeDistribution: this.calculateDistributionPercentages(this.bubbleSpawnData.typeDistribution),
                spawnRate: this.calculateSpawnRate() ,
                balanceScore: this.calculateBubbleBalanceScore(); 
    },
            scoreBalance: { averageScoresByType: this.calculateAverageScoresByType(),
                scoreVariance: this.calculateScoreVariance() ,
                comboEffectiveness: this.calculateComboEffectiveness(
    balanceScore: this.calculateScoreBalanceScore( }
            itemBalance: { usageDistribution: this.calculateItemUsageDistribution(),
                effectivenessRatings: this.calculateItemEffectivenessRatings() ,
                costBenefitAnalysis: this.calculateCostBenefitAnalysis(
    balanceScore: this.calculateItemBalanceScore( }
            difficultyBalance: { completionRates: this.calculateCompletionRates(),
                playTimeAnalysis: this.calculatePlayTimeAnalysis() ,
                failureAnalysis: this.calculateFailureAnalysis(
    balanceScore: this.calculateDifficultyBalanceScore( }
            overallBalance: { score: this.calculateOverallBalanceScore(
    recommendations: this.generateBalanceRecommendations( 
    }
    
    /**
     * 分布パーセンテージの計算
     * @param {Object} distribution - 分布データ
     * @returns {Object}
     */
    calculateDistributionPercentages(distribution) { const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        const percentages = {};
        
        for(const [key, count] of Object.entries(distribution) { percentages[key] = total > 0 ? (count / total * 100).toFixed(2) : 0 }
        
        return percentages;
    }
    
    /**
     * 出現率の計算
     * @returns {number}
     */
    calculateSpawnRate() {
        const timings = this.bubbleSpawnData.spawnTimings,
        if (timings.length < 2) return 0,
        
        const timeSpan = timings[timings.length - 1].time - timings[0].time }
        return timeSpan > 0 ? (timings.length / timeSpan * 1000).toFixed(2) : 0; // per second 
    }
    
    /**
     * バブルバランススコアの計算
     * @returns {number}
     */
    calculateBubbleBalanceScore() {
        // 簡易実装：分布の均等性を評価
        const distribution = this.bubbleSpawnData.typeDistribution,
        const values = Object.values(distribution);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length,
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length,
        const coefficient = variance > 0 ? Math.sqrt(variance) / mean: 0,
        
        // 変動係数が小さいほど良いバランス（100点満点）
    
        return Math.max(0, 100 - coefficient * 100).toFixed(1);
    /**
     * タイプ別平均スコアの計算
     * @returns {Object}
     */
    calculateAverageScoresByType() {
    
}
        const averages = {};
        
        for(const [type, scores] of Object.entries(this.scoreDistribution.bubbleScores) {
        
            if (scores.length > 0) {
    
}
                averages[type] = (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2); }
}
        
        return averages;
    }
    
    /**
     * スコア分散の計算
     * @returns {Object}
     */
    calculateScoreVariance() {
    
}
        const variances = {};
        
        for(const [type, scores] of Object.entries(this.scoreDistribution.bubbleScores) {
        
            if (scores.length > 1) {
                const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length,
                const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length }
                variances[type] = variance.toFixed(2); }
}
        
        return variances;
    }
    
    /**
     * コンボ効果の計算
     * @returns {Object}
     */
    calculateComboEffectiveness() { const combos = this.scoreDistribution.comboScores }
        if (combos.length === 0) return { average: 0, maxCombo: 0, efficiency: 0  }
        const averageScore = combos.reduce((sum, combo) => sum + combo.amount, 0) / combos.length;
        const maxCombo = Math.max(...combos.map(c => c.comboCount);
        const efficiency = combos.reduce((sum, combo) => sum + combo.amount / combo.comboCount, 0) / combos.length;
        
        return { averageScore: averageScore.toFixed(2,
            maxCombo: maxCombo,
            efficiency: efficiency.toFixed(2);
    }
    
    /**
     * スコアバランススコアの計算
     * @returns {number}
     */
    calculateScoreBalanceScore() {
        // スコア分散の均等性を評価
        const variances = this.calculateScoreVariance();
        const varianceValues = Object.values(variances).map(v => parseFloat(v);
        if (varianceValues.length === 0) return 100,
        
        const avgVariance = varianceValues.reduce((sum, v) => sum + v, 0) / varianceValues.length,
        const normalizedVariance = Math.min(avgVariance / 100, 1), // 正規化
        
    }
        return Math.max(0, 100 - normalizedVariance * 100).toFixed(1);
    
    /**
     * アイテム使用分布の計算
     * @returns {Object}
     */
    calculateItemUsageDistribution() { return this.calculateDistributionPercentages(this.itemEffectiveness.usageFrequency);
    
    /**
     * アイテム効果評価の計算
     * @returns {Object}
     */
    calculateItemEffectivenessRatings() {
    
}
        const ratings = {};
        
        for(const [itemType, impacts] of Object.entries(this.itemEffectiveness.scoreImpact) {
        
            if (impacts.length > 0) {
                const averageImpact = impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length,
                const usage = this.itemEffectiveness.usageFrequency[itemType] || 0,
                
                // 効果と使用頻度を組み合わせた評価
                ratings[itemType] = {
                    averageImpact: averageImpact.toFixed(2,
    usage: usage,
                    rating: (averageImpact * Math.log(usage + 1).toFixed(2);
        }
        
        return ratings;
    }
    
    /**
     * コストベネフィット分析の計算
     * @returns {Object}
     */''
    calculateCostBenefitAnalysis('''
            mostEfficient: 'timeExtender,
            leastEfficient: 'scoreBooster,
            averageROI: '2.3x);'
            };
    /**
     * アイテムバランススコアの計算
     * @returns {number}
     */
    calculateItemBalanceScore() {
        const distribution = this.itemEffectiveness.usageFrequency,
        const values = Object.values(distribution);
        if (values.length === 0) return 100,
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length,
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length,
        const coefficient = variance > 0 && mean > 0 ? Math.sqrt(variance) / mean: 0 
        return Math.max(0, 100 - coefficient * 50).toFixed(1);
    /**
     * 完了率の計算
     * @returns {Object}
     */
    calculateCompletionRates() {
    
}
        const rates = {};
        
        for(const [stageId, stats] of Object.entries(this.difficultyAnalysis.stageCompletionRates) { rates[stageId] = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0 }
        
        return rates;
    }
    
    /**
     * プレイ時間分析の計算
     * @returns {Object}
     */
    calculatePlayTimeAnalysis() {
    
}
        const analysis = {};
        
        for(const [stageId, times] of Object.entries(this.difficultyAnalysis.averagePlayTimes) {
        
            if (times.length > 0) {
                const average = times.reduce((sum, time) => sum + time, 0) / times.length,
                const min = Math.min(...times);
                const max = Math.max(...times);
                ','

                analysis[stageId] = {''
                    average: (average / 1000).toFixed(1) + 's,
                    min: (min / 1000).toFixed(1) + 's,
                    max: (max / 1000).toFixed(1) + 's' }
                    samples: times.length; 
    }
        }
        
        return analysis;
    }
    
    /**
     * 失敗分析の計算
     * @returns {Object}
     */
    calculateFailureAnalysis() {
    
}
        const analysis = {};
        
        for(const [stageId, failures] of Object.entries(this.difficultyAnalysis.failurePoints) {
        
            if (failures.length > 0) {
    
}
                const avgProgress = failures.reduce((sum, f) => sum + f.progressPercent, 0) / failures.length; }
                const commonReasons = {};
                
                failures.forEach(f => {  );
                    commonReasons[f.reason] = (commonReasons[f.reason] || 0) + 1; }
                };
                
                const mostCommonReason = Object.entries(commonReasons);
                    .sort(([,a], [,b]) => b - a)[0];
                ';'

                analysis[stageId] = { ''
                    averageFailurePoint: avgProgress.toFixed(1) + '%,
                    mostCommonReason: mostCommonReason ? mostCommonReason[0] : 'unknown,
    totalFailures: failures.length  }
        }
        
        return analysis;
    }
    
    /**
     * 難易度バランススコアの計算
     * @returns {number}
     */
    calculateDifficultyBalanceScore() {
        const completionRates = this.calculateCompletionRates();
        const rates = Object.values(completionRates).map(r => parseFloat(r);
        if (rates.length === 0) return 100,
        
        // 完了率が50-80%の範囲にあることが理想
        const idealRange = [50, 80],
        const score = rates.reduce((sum, rate) => { 
    }
            if (rate >= idealRange[0] && rate <= idealRange[1]) { }
                return sum + 100; else if (rate < idealRange[0]) { return sum + (rate / idealRange[0]) * 100 } else { return sum + (100 - (rate - idealRange[1]) * 2), 0) / rates.length,
        
        return Math.max(0, score).toFixed(1);
    
    /**
     * 総合バランススコアの計算
     * @returns {number}
     */
    calculateOverallBalanceScore() {
        const bubbleScore = parseFloat(this.calculateBubbleBalanceScore();
        const scoreScore = parseFloat(this.calculateScoreBalanceScore();
        const itemScore = parseFloat(this.calculateItemBalanceScore();
        const difficultyScore = parseFloat(this.calculateDifficultyBalanceScore();
        const weights = {
            bubble: 0.25,
            score: 0.30,
    item: 0.20 }
            difficulty: 0.25 
    };
        const overall = (;
            bubbleScore * weights.bubble +;
            scoreScore * weights.score +;
            itemScore * weights.item +;
            difficultyScore * weights.difficulty;
        );
        
        return overall.toFixed(1);
    }
    
    /**
     * バランス改善推奨事項の生成
     * @returns {Array}
     */
    generateBalanceRecommendations() { const recommendations = [],
        const overallScore = parseFloat(this.calculateOverallBalanceScore();
        if (overallScore < 70) {
            recommendations.push({''
                priority: 'high',','
                category: 'overall',' }'

                message: 'ゲーム全体のバランスに大きな改善の余地があります。'); 
    }
        ';'

        const bubbleScore = parseFloat(this.calculateBubbleBalanceScore();
        if (bubbleScore < 75) {
            recommendations.push({''
                priority: 'medium',','
                category: 'bubble',' }'

                message: 'バブルタイプの出現バランスを調整することを推奨します。'); 
    }
        
        const completionRates = this.calculateCompletionRates();
        const lowCompletionStages = Object.entries(completionRates);
            .filter(([, rate]) => parseFloat(rate) < 40);
            .map(([stage]) => stage);

        if (lowCompletionStages.length > 0) {
            recommendations.push({)'
                priority: 'high',' }'

                category: 'difficulty'),' }'

                message: `以下のステージの難易度調整が必要です: ${lowCompletionStages.join(', '}`
            }';'
        }
        
        return recommendations;
    }
    
    /**'
     * 統計データのリセット'
     */''
    resetStats();