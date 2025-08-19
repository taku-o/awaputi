/**
 * Session Manager
 * セッション管理と統計収集を担当
 */
// TypeScript interfaces and types
export interface AnalysisOptions {
    timeRange?: { start: Date; end: Date };
    filters?: Record<string, any>;
    metrics?: string[];
}

export interface AnalysisResult {
    success: boolean;
    data?: any;
    insights?: string[];
    recommendations?: string[];
    timestamp: number;
}

export class SessionManager {
    constructor() {
        this.currentSession = null;
        this.sessionHistory = [];
        this.maxSessionHistory = 50;
    }
    
    /**
     * ゲームセッション開始
     * @param {Object} sessionInfo - セッション情報
     * @returns {Object} セッション
     */
    startSession(sessionInfo) {
        // 既存セッションがあれば終了
        if (this.currentSession) {
            this.endSession({ exitReason: 'new_session_started' });
        }
        
        this.currentSession = {
            id: this.generateSessionId(),
            startTime: Date.now(),
            stageId: sessionInfo.stageId,
            difficulty: sessionInfo.difficulty,
            soundEnabled: sessionInfo.soundEnabled,
            effectsEnabled: sessionInfo.effectsEnabled,
            playerLevel: sessionInfo.playerLevel,
            previousBestScore: sessionInfo.previousBestScore || 0,
            
            // セッション統計
            stats: {
                duration: 0,
                bubblesPopped: 0,
                bubblesMissed: 0,
                maxCombo: 0,
                finalScore: 0,
                completed: false,
                exitReason: null,
                interactions: [],
                scoreProgression: [],
                itemsUsed: []
            }
        };
        
        console.info(`[SessionManager] Session started: ${this.currentSession.id}`);
        
        return this.currentSession;
    }
    
    /**
     * ゲームセッション終了
     * @param {Object} endInfo - 終了情報
     * @returns {Object} 終了したセッション
     */
    endSession(endInfo) {
        if (!this.currentSession) {
            console.warn('[SessionManager] No active session to end');
            return null;
        }
        
        // セッション統計の更新
        const duration = Date.now() - this.currentSession.startTime;
        
        this.currentSession.stats.duration = duration;
        this.currentSession.stats.finalScore = endInfo.finalScore || 0;
        this.currentSession.stats.bubblesPopped = endInfo.bubblesPopped || 0;
        this.currentSession.stats.bubblesMissed = endInfo.bubblesMissed || 0;
        this.currentSession.stats.maxCombo = endInfo.maxCombo || 0;
        this.currentSession.stats.completed = endInfo.completed || false;
        this.currentSession.stats.exitReason = endInfo.exitReason || 'unknown';
        
        // セッション履歴に追加
        this.addToHistory(this.currentSession);
        
        console.info(`[SessionManager] Session ended: ${this.currentSession.id} (duration: ${Math.round(duration / 1000)}s)`);
        
        const endedSession = this.currentSession;
        this.currentSession = null;
        
        return endedSession;
    }
    
    /**
     * バブルインタラクションの記録
     * @param {Object} interactionData - インタラクションデータ
     */
    recordInteraction(interactionData) {
        if (!this.currentSession) return;
        
        this.currentSession.stats.interactions.push({
            timestamp: Date.now(),
            bubbleType: interactionData.bubbleType,
            action: interactionData.action,
            reactionTime: interactionData.reactionTime,
            position: interactionData.position,
            score: interactionData.score
        });
        
        // バブル統計の更新
        if (interactionData.action === 'popped') {
            this.currentSession.stats.bubblesPopped++;
        } else if (interactionData.action === 'missed') {
            this.currentSession.stats.bubblesMissed++;
        }
    }
    
    /**
     * スコア進行の記録
     * @param {Object} scoreData - スコアデータ
     */
    recordScoreProgression(scoreData) {
        if (!this.currentSession) return;
        
        this.currentSession.stats.scoreProgression.push({
            timestamp: Date.now(),
            score: scoreData.totalScore,
            scoreGain: scoreData.amount,
            source: scoreData.type,
            multiplier: scoreData.multiplier,
            comboCount: scoreData.comboCount
        });
        
        // 最大コンボの更新
        if (scoreData.comboCount > this.currentSession.stats.maxCombo) {
            this.currentSession.stats.maxCombo = scoreData.comboCount;
        }
    }
    
    /**
     * アイテム使用の記録
     * @param {Object} itemData - アイテムデータ
     */
    recordItemUsage(itemData) {
        if (!this.currentSession) return;
        
        this.currentSession.stats.itemsUsed.push({
            timestamp: Date.now(),
            itemType: itemData.itemType,
            cost: itemData.cost,
            effectiveness: itemData.effectiveness,
            duration: itemData.duration
        });
    }
    
    /**
     * セッションIDの生成
     * @returns {string}
     */
    generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `session_${timestamp}_${random}`;
    }
    
    /**
     * セッション履歴への追加
     * @param {Object} session - セッション
     */
    addToHistory(session) {
        this.sessionHistory.unshift(session);
        
        // 履歴サイズの制限
        if (this.sessionHistory.length > this.maxSessionHistory) {
            this.sessionHistory.pop();
        }
    }
    
    /**
     * 現在のセッション取得
     * @returns {Object|null}
     */
    getCurrentSession() {
        return this.currentSession;
    }
    
    /**
     * セッション統計の取得
     * @param {string} sessionId - セッションID（省略時は現在のセッション）
     * @returns {Object|null}
     */
    getSessionStats(sessionId = null) {
        if (!sessionId && this.currentSession) {
            return this.currentSession.stats;
        }
        
        const session = this.sessionHistory.find(s => s.id === sessionId);
        return session ? session.stats : null;
    }
    
    /**
     * 最近のセッション取得
     * @param {number} count - 取得数
     * @returns {Array}
     */
    getRecentSessions(count = 10) {
        return this.sessionHistory.slice(0, count);
    }
    
    /**
     * セッション要約の生成
     * @returns {Object}
     */
    generateSessionSummary() {
        const recentSessions = this.getRecentSessions(20);
        
        if (recentSessions.length === 0) {
            return {
                totalSessions: 0,
                averageDuration: 0,
                averageScore: 0,
                completionRate: 0,
                averageAccuracy: 0
            };
        }
        
        const totalDuration = recentSessions.reduce((sum, s) => sum + s.stats.duration, 0);
        const totalScore = recentSessions.reduce((sum, s) => sum + s.stats.finalScore, 0);
        const completedSessions = recentSessions.filter(s => s.stats.completed).length;
        
        // 正確性の計算
        let totalPopped = 0;
        let totalMissed = 0;
        recentSessions.forEach(s => {
            totalPopped += s.stats.bubblesPopped;
            totalMissed += s.stats.bubblesMissed;
        });
        
        const totalBubbles = totalPopped + totalMissed;
        const averageAccuracy = totalBubbles > 0 ? totalPopped / totalBubbles : 0;
        
        return {
            totalSessions: recentSessions.length,
            averageDuration: totalDuration / recentSessions.length,
            averageScore: totalScore / recentSessions.length,
            completionRate: completedSessions / recentSessions.length,
            averageAccuracy: averageAccuracy,
            exitReasons: this.summarizeExitReasons(recentSessions)
        };
    }
    
    /**
     * 離脱理由の要約
     * @param {Array} sessions - セッション配列
     * @returns {Object}
     */
    summarizeExitReasons(sessions) {
        const reasons = {};
        
        sessions.forEach(session => {
            const reason = session.stats.exitReason;
            reasons[reason] = (reasons[reason] || 0) + 1;
        });
        
        return reasons;
    }
    
    /**
     * ステージ別統計の取得
     * @param {string} stageId - ステージID
     * @returns {Object}
     */
    getStageStats(stageId) {
        const stageSessions = this.sessionHistory.filter(s => s.stageId === stageId);
        
        if (stageSessions.length === 0) {
            return null;
        }
        
        const stats = {
            attempts: stageSessions.length,
            completions: stageSessions.filter(s => s.stats.completed).length,
            averageScore: 0,
            bestScore: 0,
            averageDuration: 0,
            averageAccuracy: 0
        };
        
        let totalScore = 0;
        let totalDuration = 0;
        let totalPopped = 0;
        let totalMissed = 0;
        
        stageSessions.forEach(session => {
            totalScore += session.stats.finalScore;
            totalDuration += session.stats.duration;
            totalPopped += session.stats.bubblesPopped;
            totalMissed += session.stats.bubblesMissed;
            
            if (session.stats.finalScore > stats.bestScore) {
                stats.bestScore = session.stats.finalScore;
            }
        });
        
        stats.averageScore = totalScore / stageSessions.length;
        stats.averageDuration = totalDuration / stageSessions.length;
        
        const totalBubbles = totalPopped + totalMissed;
        stats.averageAccuracy = totalBubbles > 0 ? totalPopped / totalBubbles : 0;
        
        return stats;
    }
    
    /**
     * 長時間セッションの検出
     * @param {number} threshold - 閾値（ミリ秒）
     * @returns {Array}
     */
    getLongSessions(threshold = 30 * 60 * 1000) {
        return this.sessionHistory.filter(s => s.stats.duration > threshold);
    }
    
    /**
     * 高スコアセッションの取得
     * @param {number} count - 取得数
     * @returns {Array}
     */
    getHighScoreSessions(count = 5) {
        return [...this.sessionHistory]
            .sort((a, b) => b.stats.finalScore - a.stats.finalScore)
            .slice(0, count);
    }
    
    /**
     * セッションデータのクリア
     */
    clearSessionData() {
        this.currentSession = null;
        this.sessionHistory = [];
    }
}