/**
 * Player Behavior Analyzer
 * プレイヤー行動の分析と追跡を担当
 */
// TypeScript interfaces and types
export interface AnalysisOptions {
    timeRange?: { start: Date, end: Date;
    filters?: Record<string, any>;
    metrics?: string[];
};
export interface AnalysisResult { success: boolean;
    data?: any;
    insights?: string[];
    recommendations?: string[];
    timestamp: number;
};
export class PlayerBehaviorAnalyzer {
    constructor() {
        // プレイヤー行動分析
        this.playerBehavior = {
            sessionData: null,
            interactionPatterns: [],
    skillProgression: { accuracyHistory: []  ,
    reactionTimeHistory: []
}
                comboHistory: [] ;
    },
            playStyle: { aggressive: 0,
                defensive: 0  ,
    strategic: 0 
    ,
        
        this.sessionStats = null;
        this.longSessionMarked = false;
    }
    
    /**
     * プレイヤー行動追跡の初期化
     * @param {Object} sessionInfo - セッション情報
     * @param {string} sessionId - セッションID
     */
    initializePlayerBehaviorTracking(sessionInfo, sessionId) {
        this.playerBehavior.sessionData = {
            startTime: Date.now(),
            stageId: sessionInfo.stageId,
            difficulty: sessionInfo.difficulty,
            initialSkillLevel: this.getPlayerSkillLevel(),
            previousBestScore: sessionInfo.previousBestScore || 0,
            sessionId: sessionId,
    playerSettings: {
                soundEnabled: sessionInfo.soundEnabled
}
                effectsEnabled: sessionInfo.effectsEnabled ;
    },
        
        this.playerBehavior.interactionPatterns = [];
        this.sessionStats = { clickCount: 0,
            successfulClicks: 0,
            missedClicks: 0,
            averageReactionTime: 0,
            totalReactionTime: 0,
            validReactionTimes: 0,
            maxCombo: 0,
            currentCombo: 0,
            itemsUsed: 0,
            bubblesPopped: 0,
            bubblesMissed: 0,
            scoreProgression: [],
    exitEvents: [] 
 }
    
    /**
     * プレイヤーインタラクションパターンの記録
     * @param {Object} bubbleData - バブルデータ
     */
    recordPlayerInteractionPattern(bubbleData) {
        const pattern = {
            timestamp: Date.now(),
            bubbleType: bubbleData.bubbleType,
            action: bubbleData.action,
            reactionTime: bubbleData.reactionTime || null,
            accuracy: bubbleData.action === 'popped' ? 1 : 0
            accuracy: bubbleData.action === 'popped' ? 1 : 0
        };
            position: bubbleData.position || null  };
        
        this.playerBehavior.interactionPatterns.push(pattern);
        
        // プレイスタイルの分析
        this.analyzePlayStyle(pattern);
        
        // スキル進行の記録
        if (pattern.reactionTime) {
            this.playerBehavior.skillProgression.reactionTimeHistory.push(pattern.reactionTime);
            this.playerBehavior.skillProgression.accuracyHistory.push(pattern.accuracy); }
    }
    
    /**
     * プレイスタイルの分析
     * @param {Object} pattern - インタラクションパターン
     */
    analyzePlayStyle(pattern) {
        // 攻撃的プレイスタイル：素早い反応時間
        if (pattern.reactionTime && pattern.reactionTime < 300) {
    }
            this.playerBehavior.playStyle.aggressive += 1; }
        ;
        // 守備的プレイスタイル：慎重な操作
        if (pattern.reactionTime && pattern.reactionTime > 800) { this.playerBehavior.playStyle.defensive += 1 }
        ';'
        // 戦略的プレイスタイル：特殊バブルを優先
        if (['rainbow', 'clock', 'electric].includes(pattern.bubbleType) { this.playerBehavior.playStyle.strategic += 1 }'
    }
    
    /**
     * セッション統計の更新
     * @param {Object} behaviorData - 行動データ
     */
    updateSessionStats(behaviorData) {
        if (!this.sessionStats) return,
        
        const stats = this.sessionStats,

        switch(behaviorData.type) {''
            case 'interaction':','
                stats.clickCount++;
                if(behaviorData.action === 'popped' {'
                    stats.successfulClicks++;
                    stats.bubblesPopped++;
                    
                    // コンボ追跡
                    stats.currentCombo = (behaviorData.comboCount || 0);
                    if (stats.currentCombo > stats.maxCombo) {
    }
                        stats.maxCombo = stats.currentCombo; }

                    }'} else if (behaviorData.action === 'missed' stats.missedClicks++,'
                    stats.bubblesMissed++;
                    stats.currentCombo = 0 }
                ';'
                // 反応時間の追跡
                if(behaviorData.reactionTime && behaviorData.reactionTime > 0) {
                    stats.totalReactionTime += behaviorData.reactionTime,
                    stats.validReactionTimes++ }
                    stats.averageReactionTime = stats.totalReactionTime / stats.validReactionTimes; }
                break;

            case 'item_usage':
                stats.itemsUsed++;
                break;

            case 'score_update':';'
                stats.scoreProgression.push({ );
                    timestamp: Date.now()','
    source: behaviorData.source || 'unknown' ,
                break;
        }
    /**
     * 離脱行動の追跡
     * @param {Object} exitData - 離脱データ
     * @param {number} sessionDuration - セッション継続時間
     */
    trackExitBehavior(exitData, sessionDuration) {
        const exitInfo = {''
            timestamp: Date.now('''
            exitReason: exitData.reason || 'unknown,
    exitPoint: {
                stageProgress: exitData.stageProgress || 0 ,
                timeRemaining: exitData.timeRemaining || 0,
    playerHP: exitData.playerHP || 0
}
                currentScore: exitData.currentScore || 0  ,
            playerSituation: { isInCombat: exitData.isInCombat || false)
                recentFailures: exitData.recentFailures || 0 ,
    comboBroken: exitData.comboBroken || false),
                lowHP: (exitData.playerHP || 100) < 30 
 };
            gameState: { activeBubbles: exitData.activeBubbles || 0,
                nextBubbleTypes: exitData.nextBubbleTypes || [] ,
    activeItems: exitData.activeItems || [] 
    ,
        
        // セッション統計に追加
        if (this.sessionStats) { this.sessionStats.exitEvents.push(exitInfo);
        // 離脱パターン分析
        return this.analyzeExitPattern(exitInfo);
    }
    
    /**
     * 離脱パターンの分析
     * @param {Object} exitInfo - 離脱情報
     * @returns {Object} 離脱パターン分析結果
     */
    analyzeExitPattern(exitInfo) {
        // 離脱ポイント分析
        const exitPatterns = {
            earlyExit: exitInfo.sessionDuration < 60000,
            midGameExit: exitInfo.exitPoint.stageProgress > 0.3 && exitInfo.exitPoint.stageProgress < 0.7,
            lateGameExit: exitInfo.exitPoint.stageProgress > 0.7,
            lowHPExit: exitInfo.playerSituation.lowHP,
            comboBrokenExit: exitInfo.playerSituation.comboBroken
}
            difficultySpike: exitInfo.playerSituation.recentFailures > 3  ,
        
        // パターンの分類
        const dominantPattern = Object.entries(exitPatterns);
            .filter(([_, value]) => value);
            .map(([key, _]) => key);

        if (dominantPattern.length > 0) { }'

            console.info(`[Player Behavior] Exit pattern detected: ${dominantPattern.join(', '}`);
        }
        
        return { patterns: dominantPattern,
            exitInfo: exitInfo  } }
    
    /**
     * プレイヤースキルレベルの取得
     * @returns {string}
     */
    getPlayerSkillLevel() {
        const accuracy = this.getAverageAccuracy();
        const reactionTime = this.getAverageReactionTime();
        if(accuracy > 0.9 && reactionTime < 400) return 'expert,
        if(accuracy > 0.8 && reactionTime < 500) return 'advanced,
        if(accuracy > 0.7 && reactionTime < 600) return 'intermediate,
        if(accuracy > 0.5 && reactionTime < 800) return 'beginner,

        ' }'

        return 'novice';
    /**
     * 平均正確性の取得
     * @returns {number}
     */
    getAverageAccuracy() {
        const recent = this.playerBehavior.skillProgression.accuracyHistory.slice(-10);
        return recent.length > 0 ? }
            recent.reduce((sum, acc) => sum + acc, 0) / recent.length: 0.5 }
    /**
     * 平均反応時間の取得
     * @returns {number}
     */
    getAverageReactionTime() {
        const recent = this.playerBehavior.skillProgression.reactionTimeHistory.slice(-10);
        return recent.length > 0 ? }
            recent.reduce((sum, rt) => sum + rt, 0) / recent.length: 600 }
    /**
     * プレイスタイル分布の取得
     * @returns {Object}
     */
    getPlayStyleDistribution() {
        const total = Object.values(this.playerBehavior.playStyle);
            .reduce((sum, count) => sum + count, 0);
        if (total === 0) return { aggressive: 0, defensive: 0, strategic: 0  }
        return { aggressive: this.playerBehavior.playStyle.aggressive / total,
            defensive: this.playerBehavior.playStyle.defensive / total ,
            strategic: this.playerBehavior.playStyle.strategic / total  } }
    
    /**
     * 最近のパフォーマンス指標取得
     * @returns {Object}
     */
    getRecentPerformanceMetrics() { const stats = this.sessionStats }
        if (!stats) return {};
        
        return { accuracy: stats.clickCount > 0 ? stats.successfulClicks / stats.clickCount : 0,
            averageReactionTime: stats.averageReactionTime,
            maxCombo: stats.maxCombo,
    bubblesPopped: stats.bubblesPopped ,
            itemsUsed: stats.itemsUsed  } }
    
    /**
     * セッションパフォーマンス要約取得
     * @returns {Object}
     */
    getSessionPerformanceSummary() {
        const stats = this.sessionStats,
        const sessionData = this.playerBehavior.sessionData }
        if (!stats || !sessionData) return {};
        
        const sessionDuration = Date.now() - sessionData.startTime;
        
        return { duration: sessionDuration,
            totalInteractions: stats.clickCount,
            accuracy: stats.clickCount > 0 ? stats.successfulClicks / stats.clickCount : 0,
            averageReactionTime: stats.averageReactionTime,
            maxCombo: stats.maxCombo,
            bubblesPopped: stats.bubblesPopped,
            itemsUsed: stats.itemsUsed,
            exitEvents: stats.exitEvents.length,
            skillImprovement: this.calculateSkillImprovement() ,
            playStyle: this.getPlayStyleDistribution(); 
    }
    
    /**
     * スキル向上の計算
     * @returns {Object}
     */
    calculateSkillImprovement() {
        const sessionStats = this.sessionStats,
        const sessionData = this.playerBehavior.sessionData }
        if (!sessionStats || !sessionData) return { improved: false,
        const currentAccuracy = sessionStats.clickCount > 0 ? undefined : undefined
            sessionStats.successfulClicks / sessionStats.clickCount: 0,
        const currentReactionTime = sessionStats.averageReactionTime;
        
        // 過去の平均との比較
        const historicalAccuracy = this.getAverageAccuracy();
        const historicalReactionTime = this.getAverageReactionTime()';'
                accuracy: accuracyImprovement ? 'improved' : (currentAccuracy < historicalAccuracy - 0.05 ? 'declined' : 'stable,
                speed: reactionTimeImprovement ? 'improved' : (currentReactionTime > historicalReactionTime + 50 ? 'declined' : 'stable');
    
    /**
     * 学習曲線の分析
     * @returns {Object}
     */'
    analyzeLearningCurve() { const patterns = this.playerBehavior.interactionPatterns,' }'

        if(patterns.length < 10) return { trend: 'insufficient_data' }
        // セッション内でのパフォーマンス推移を分析
        const segmentSize = Math.max(Math.floor(patterns.length / 4), 5);
        const segments = [];
        
        for(let, i = 0; i < patterns.length; i += segmentSize) {
        
            const segment = patterns.slice(i, i + segmentSize);
            const accuracy = segment.reduce((sum, p) => sum + p.accuracy, 0) / segment.length,
            const avgReactionTime = segment,
                .filter(p => p.reactionTime);
                .reduce((sum, p, _, arr) => sum + p.reactionTime / arr.length, 0);
            segments.push({ accuracy, avgReactionTime );
        // トレンドの計算
        const accuracyTrend = this.calculateTrend(segments.map(s => s.accuracy);
        const speedTrend = this.calculateTrend(segments.map(s => s.avgReactionTime), true');'
        ';'

        return { ''
            trend: accuracyTrend > 0.05 || speedTrend > 0.05 ? 'improving' : ','
                   (accuracyTrend < -0.05 || speedTrend < -0.05 ? 'declining' : 'stable,
            accuracyTrend: accuracyTrend,
    speedTrend: speedTrend,
            segments: segments.length  } }
    
    /**
     * 一貫性スコアの計算
     * @returns {number}
     */
    calculateConsistencyScore() {
        const patterns = this.playerBehavior.interactionPatterns,
        if (patterns.length < 5) return 0.5,
        
        const reactionTimes = patterns,
            .filter(p => p.reactionTime);
            .map(p => p.reactionTime);
        if (reactionTimes.length < 3) return 0.5,
        
        const mean = reactionTimes.reduce((sum, rt) => sum + rt, 0) / reactionTimes.length,
        const variance = reactionTimes.reduce((sum, rt) => sum + Math.pow(rt - mean, 2), 0) / reactionTimes.length,
        const coefficient = Math.sqrt(variance) / mean,
        
        // 変動係数が低いほど一貫性が高い（0-1スケール）
    }
        return Math.max(0, 1 - coefficient);
    /**
     * エンゲージメントレベルの計算
     * @param {number} sessionDuration - セッション継続時間
     * @param {number} totalInteractions - 総インタラクション数
     * @returns {string}
     */
    calculateEngagementLevel(sessionDuration, totalInteractions) {
        const interactionsPerMinute = sessionDuration > 0 ? undefined : undefined
            (totalInteractions / (sessionDuration / 60000)) : 0,
        // セッション長とインタラクション密度から判定
        if (sessionDuration > 15 * 60 * 1000 && interactionsPerMinute > 20) {
    }

            return 'high'; }

        } else if (sessionDuration > 5 * 60 * 1000 && interactionsPerMinute > 10) { ''
            return 'medium',' }'

        } else if (sessionDuration < 2 * 60 * 1000 || interactionsPerMinute < 5) { ''
            return 'low' }

        return 'medium';
    }
    
    /**
     * セッション強度の計算
     * @returns {number}
     */
    calculateSessionIntensity() {
        const stats = this.sessionStats,
        const sessionData = this.playerBehavior.sessionData,
        if (!stats || !sessionData) return 0,
        
        const sessionDuration = Date.now() - sessionData.startTime,
        const actionDensity = stats.clickCount / Math.max(sessionDuration / 1000, 1);
        const comboFactor = Math.min(stats.maxCombo / 10, 1);
        const accuracyFactor = stats.clickCount > 0 ? stats.successfulClicks / stats.clickCount: 0 
        return Math.min((actionDensity * 0.4 + comboFactor * 0.3 + accuracyFactor * 0.3), 1),
    /**
     * フラストレーション指標の検出
     * @returns {Object}
     */
    detectFrustrationIndicators() {
        const stats = this.sessionStats,
        const patterns = this.playerBehavior.interactionPatterns }
        if (!stats || patterns.length < 5) return { detected: false,
        const indicators = { lowAccuracy: stats.clickCount > 0 ? (stats.successfulClicks / stats.clickCount) < 0.5 : false,
            manyMisses: stats.bubblesMissed > stats.bubblesPopped * 0.3,
            comboBroken: stats.maxCombo > 5 && stats.currentCombo === 0,
            rapidClicking: this.detectRapidClickingPattern(patterns,
            earlyExit: stats.exitEvents.some(e => e.exitReason === 'quit' && e.sessionDuration < 2 * 60 * 1000);
        };

        const indicatorCount = Object.values(indicators).filter(Boolean).length;
        
        return { detected: indicatorCount >= 2,

            indicators: indicators,' };'

            severity: indicatorCount >= 3 ? 'high' : (indicatorCount >= 2 ? 'medium' : 'low'); 
    }
    
    /**
     * フロー状態指標の検出
     * @returns {Object}
     */
    detectFlowStateIndicators() {
        const stats = this.sessionStats,
        const patterns = this.playerBehavior.interactionPatterns }
        if (!stats || patterns.length < 10) return { detected: false,
        const indicators = { highAccuracy: stats.clickCount > 0 ? (stats.successfulClicks / stats.clickCount) > 0.8 : false,
            consistentTiming: this.calculateConsistencyScore() > 0.7,
            sustainedCombo: stats.maxCombo > 10,
            longSession: (Date.now() - this.playerBehavior.sessionData?.startTime || 0) > 10 * 60 * 1000, : undefined
            improvedPerformance: this.calculateSkillImprovement().improved 
 };
        const indicatorCount = Object.values(indicators).filter(Boolean).length;
        
        return { detected: indicatorCount >= 3,

            indicators: indicators,' };'

            intensity: indicatorCount >= 4 ? 'high' : (indicatorCount >= 3 ? 'medium' : 'low');
    
    /**
     * 急速クリックパターンの検出
     * @param {Array} patterns - インタラクションパターン
     * @returns {boolean}
     */
    detectRapidClickingPattern(patterns) {
        if (patterns.length < 5) return false,
        
        // 直近10回のクリック間隔を確認
        const recentPatterns = patterns.slice(-10);
        let rapidSequences = 0,
        
        for (let, i = 1, i < recentPatterns.length, i++) {
            const timeDiff = recentPatterns[i].timestamp - recentPatterns[i-1].timestamp,
            if (timeDiff < 200) {
    }
                rapidSequences++; }
        }
        
        return rapidSequences >= 3;
    }
    
    /**
     * トレンドの計算
     * @param {Array} values - 値の配列
     * @param {boolean} inverted - 反転（値が小さいほど良い場合）
     * @returns {number}
     */
    calculateTrend(values, inverted = false) {
        if (values.length < 2) return 0,
        
        const first = values[0],
        const last = values[values.length - 1],
        
        if (first === 0) return 0,
        
        const trend = (last - first) / first }
        return inverted ? -trend: trend,
    /**
     * ステージ進行度の計算
     * @param {Object} endInfo - 終了情報
     * @returns {number}
     */
    calculateStageProgress(endInfo) {
        if (endInfo.completed) return 1.0,
        
        // 時間ベースの進行度計算
        const timeProgress = endInfo.timeRemaining ? undefined : undefined
            1 - (endInfo.timeRemaining / (5 * 60 * 1000)) : 0,
        
        // スコアベースの進行度計算（おおよその推定）
        const scoreProgress = (endInfo.finalScore || 0) / ,
            Math.max(this.playerBehavior.sessionData?.previousBestScore || 1000, 1000);
        // 組み合わせた進行度
    }
        return Math.min(Math.max(timeProgress, scoreProgress * 0.8), 1.0);
    /**
     * セッションデータのリセット
     */''
    resetSessionData();