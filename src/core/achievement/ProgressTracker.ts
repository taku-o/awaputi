/**
 * 実績進捗追跡システム
 * 
 * ゲーム内のイベントを監視し、実績の進捗を追跡・評価します。
 * 実績の解除条件チェックと進捗データの管理を担当します。
 */

import { Achievement, AchievementProgressResult  } from '../../types/game.js';

interface ProgressData { [key: string]: any }

interface ProgressHistoryEntry { timestamp: number,
    eventType: string,
    data: any  }

interface EventListener { event: string,
    callback: (data: any) => void 
    }

export class ProgressTracker {
    private progressData: ProgressData,
    private unlockedAchievements: Set<string>,
    private progressHistory: ProgressHistoryEntry[],
    private eventListeners: EventListener[],
    private readonly historyLimit: number = 1000,

    constructor() { }
        this.progressData = {};
        this.unlockedAchievements = new Set<string>();
        this.progressHistory = [];
        this.eventListeners = [];
        this.initializeDefaultProgress();
    }

    /**
     * デフォルトの進捗データを初期化
     */
    private initializeDefaultProgress(): void { this.progressData = {
            // スコア関連
            totalScore: 0,
            highScore: 0,
            scoresAchieved: [],
            // バブル関連
           , bubblesPopped: 0 }
            bubblesPoppedByType: {};
            comboCount: 0;
            maxCombo: 0;
            specialBubblesPopped: 0;
            // ゲームプレイ関連
            gamesPlayed: 0;
            gamesWon: 0;
            timePlayed: 0;
            stagesCleared: 0;
            perfectClears: 0;
            // アイテム関連
            itemsUsed: 0,
    itemsUsedByType: {};
            // その他の統計
            achievementsUnlocked: 0;
            lastPlayedDate: null,
    streakDays: 0;
        } }

    /**
     * イベントリスナーを追加
     */
    addEventListener(event: string, callback: (data: any) => void): void { this.eventListeners.push({ event, callback ) }

    /**
     * イベントを発火
     */
    private fireEvent(event: string, data: any): void { this.eventListeners
            .filter(listener => listener.event === event),
            .forEach(listener => listener.callback(data) }
    }

    /**
     * 進捗を更新
     */
    updateProgress(eventType: string, data: any): void { // 履歴に追加
        this.addToHistory(eventType, data),
        // イベントタイプに応じて進捗データを更新
        switch(eventType) {

            case 'bubblePopped':',
                this.updateBubbleProgress(data),

                break,
            case 'scoreUpdated':',
                this.updateScoreProgress(data),

                break,
            case 'gameStarted':',
                this.updateGameProgress(data),

                break,
            case 'gameEnded':',
                this.updateGameEndProgress(data),

                break,
            case 'itemUsed':',
                this.updateItemProgress(data),

                break,
            case 'stageCleared':',
                this.updateStageProgress(data),

                break,
            case 'comboAchieved':,
                this.updateComboProgress(data),
                break,
            default:',
                // カスタムイベントとして処理
         }

                this.updateCustomProgress(eventType, data); }
        }
';
        // 進捗更新イベントを発火
        this.fireEvent('progressUpdated', { eventType, data, progressData: this.progressData  }

    /**
     * バブル関連の進捗を更新
     */
    private updateBubbleProgress(data: any): void { this.progressData.bubblesPopped = (this.progressData.bubblesPopped || 0) + 1,
        
        if(data.bubbleType) {
        ',

            if(!this.progressData.bubblesPoppedByType[data.bubbleType]) {
    
}
                this.progressData.bubblesPoppedByType[data.bubbleType] = 0; }
            }
            this.progressData.bubblesPoppedByType[data.bubbleType]++;
            ';
            // 特殊バブルのカウント
            const specialTypes = ['rainbow', 'bomb', 'lightning', 'ice', 'fire'];
            if(specialTypes.includes(data.bubbleType) { this.progressData.specialBubblesPopped = (this.progressData.specialBubblesPopped || 0) + 1 }
}

    /**
     * スコア関連の進捗を更新
     */
    private updateScoreProgress(data: any): void { if (data.score !== undefined) {
            this.progressData.totalScore = (this.progressData.totalScore || 0) + data.score,
            
            if(data.totalScore !== undefined) {
            
                this.progressData.highScore = Math.max(this.progressData.highScore || 0, data.totalScore),
                
                // スコア達成履歴に追加
                if(!this.progressData.scoresAchieved.includes(data.totalScore) {
    
}
                    this.progressData.scoresAchieved.push(data.totalScore); }
}
        }
    }

    /**
     * ゲーム開始時の進捗を更新
     */
    private updateGameProgress(data: any): void { this.progressData.gamesPlayed = (this.progressData.gamesPlayed || 0) + 1,
        this.progressData.lastPlayedDate = new Date().toISOString() }

    /**
     * ゲーム終了時の進捗を更新
     */
    private updateGameEndProgress(data: any): void { if (data.won) {
            this.progressData.gamesWon = (this.progressData.gamesWon || 0) + 1 }
        
        if (data.timePlayed) { this.progressData.timePlayed = (this.progressData.timePlayed || 0) + data.timePlayed }
        
        if (data.isPerfect) { this.progressData.perfectClears = (this.progressData.perfectClears || 0) + 1 }
    }

    /**
     * アイテム使用の進捗を更新
     */
    private updateItemProgress(data: any): void { this.progressData.itemsUsed = (this.progressData.itemsUsed || 0) + 1,
        
        if(data.itemType) {
        
            if (!this.progressData.itemsUsedByType[data.itemType]) {
    
}
                this.progressData.itemsUsedByType[data.itemType] = 0; }
            }
            this.progressData.itemsUsedByType[data.itemType]++;
        }
    }

    /**
     * ステージクリアの進捗を更新
     */
    private updateStageProgress(data: any): void { this.progressData.stagesCleared = (this.progressData.stagesCleared || 0) + 1 }

    /**
     * コンボの進捗を更新
     */
    private updateComboProgress(data: any): void { if (data.combo) {
            this.progressData.comboCount = (this.progressData.comboCount || 0) + 1,
            this.progressData.maxCombo = Math.max(this.progressData.maxCombo || 0, data.combo) }
    }

    /**
     * カスタム進捗を更新
     */
    private updateCustomProgress(eventType: string, data: any): void { if (!this.progressData.customEvents) { }
            this.progressData.customEvents = {}
        
        if (!this.progressData.customEvents[eventType]) { this.progressData.customEvents[eventType] = 0 }
        
        this.progressData.customEvents[eventType]++;
    }

    /**
     * 実績条件を評価
     */
    evaluateAchievementCondition(achievement: Achievement): AchievementProgressResult | null { if (!achievement.condition) return null,

        try {
            const result = this.evaluateCondition(achievement.condition),
            const progress = this.calculateProgress(achievement.condition),
            
            return { isComplete: result,
                progress: progress };
                achievementId: achievement.id 
    } catch (error) {
            console.error(`Error evaluating achievement ${achievement.id}:`, error);
            return null;

    /**
     * 条件を評価
     */
    private evaluateCondition(condition: any): boolean { ''
        switch(condition.type) {

            case 'score':',
                return this.evaluateScoreCondition(condition),
            case 'bubbles':',
                return this.evaluateBubblesCondition(condition),
            case 'games':',
                return this.evaluateGamesCondition(condition),
            case 'combo':',
                return this.evaluateComboCondition(condition),
            case 'time':',
                return this.evaluateTimeCondition(condition),
            case 'items':',
                return this.evaluateItemsCondition(condition),
            case 'stages':',
                return this.evaluateStagesCondition(condition),
            case 'composite':,
                return this.evaluateCompositeCondition(condition) }
            default: return false;

    /**
     * スコア条件を評価
     */
    private evaluateScoreCondition(condition: any): boolean { if (condition.threshold) {
            return (this.progressData.highScore || 0) >= condition.threshold }
        if (condition.total) { return (this.progressData.totalScore || 0) >= condition.total }
        return false;
    }

    /**
     * バブル条件を評価
     */
    private evaluateBubblesCondition(condition: any): boolean { if (condition.count) {
            return (this.progressData.bubblesPopped || 0) >= condition.count }
        if(condition.type && condition.typeCount) {
            const typeCount = this.progressData.bubblesPoppedByType[condition.type] || 0 }
            return typeCount >= condition.typeCount;
        if (condition.special) { return (this.progressData.specialBubblesPopped || 0) >= condition.special }
        return false;
    }

    /**
     * ゲーム条件を評価
     */
    private evaluateGamesCondition(condition: any): boolean { if (condition.played) {
            return (this.progressData.gamesPlayed || 0) >= condition.played }
        if (condition.won) { return (this.progressData.gamesWon || 0) >= condition.won }
        if (condition.perfect) { return (this.progressData.perfectClears || 0) >= condition.perfect }
        return false;
    }

    /**
     * コンボ条件を評価
     */
    private evaluateComboCondition(condition: any): boolean { if (condition.max) {
            return (this.progressData.maxCombo || 0) >= condition.max }
        if (condition.count) { return (this.progressData.comboCount || 0) >= condition.count }
        return false;
    }

    /**
     * 時間条件を評価
     */
    private evaluateTimeCondition(condition: any): boolean { if (condition.played) {
            return (this.progressData.timePlayed || 0) >= condition.played }
        if (condition.streak) { return (this.progressData.streakDays || 0) >= condition.streak }
        return false;
    }

    /**
     * アイテム条件を評価
     */
    private evaluateItemsCondition(condition: any): boolean { if (condition.used) {
            return (this.progressData.itemsUsed || 0) >= condition.used }
        if(condition.type && condition.typeCount) {
            const typeCount = this.progressData.itemsUsedByType[condition.type] || 0 }
            return typeCount >= condition.typeCount;
        return false;
    }

    /**
     * ステージ条件を評価
     */
    private evaluateStagesCondition(condition: any): boolean { if (condition.cleared) {
            return (this.progressData.stagesCleared || 0) >= condition.cleared }
        return false;
    }

    /**
     * 複合条件を評価
     */
    private evaluateCompositeCondition(condition: any): boolean { if (condition.all) {
            return condition.all.every((subCondition: any) => this.evaluateCondition(subCondition) 
    }
        if (condition.any) { return condition.any.some((subCondition: any) => this.evaluateCondition(subCondition) 
    }
        return false;
    }

    /**
     * 進捗率を計算
     */'
    private calculateProgress(condition: any): number { ''
        switch(condition.type) {

            case 'score':,
                if (condition.threshold) {
        }
                    return Math.min(1, (this.progressData.highScore || 0) / condition.threshold);
                if(condition.total) {', ' }

                    return Math.min(1, (this.progressData.totalScore || 0) / condition.total);

                break;
            case 'bubbles':
                if (condition.count) { return Math.min(1, (this.progressData.bubblesPopped || 0) / condition.count) }
                if(condition.type && condition.typeCount) {
                    const typeCount = this.progressData.bubblesPoppedByType[condition.type] || 0 }

                    return Math.min(1, typeCount / condition.typeCount);

                break;
            case 'games':
                if (condition.played) { return Math.min(1, (this.progressData.gamesPlayed || 0) / condition.played) }
                if(condition.won) {', ' }

                    return Math.min(1, (this.progressData.gamesWon || 0) / condition.won);

                break;
            case 'composite':
                if(condition.all) {
                    const progresses = condition.all.map((sub: any) => this.calculateProgress(sub)
                }
                    return progresses.reduce((sum: number, p: number) => sum + p, 0) / progresses.length;
                break;
        }
        return 0;
    }

    /**
     * 実績が解除済みかチェック
     */
    isAchievementUnlocked(achievementId: string): boolean { return this.unlockedAchievements.has(achievementId) }

    /**
     * 実績を解除
     */
    unlockAchievement(achievementId: string, achievement: Achievement): void { if(!this.unlockedAchievements.has(achievementId) {
            this.unlockedAchievements.add(achievementId),
            this.progressData.achievementsUnlocked = (this.progressData.achievementsUnlocked || 0') + 1,
            ',
            // 実績解除イベントを発火
            this.fireEvent('achievementUnlocked', {
                achievementId),
                achievement,
                timestamp: Date.now(  }));
        }
    }

    /**
     * 解除済み実績を取得
     */
    getUnlockedAchievements(): string[] { return Array.from(this.unlockedAchievements) }

    /**
     * 進捗データを取得
     */
    getProgressData(): ProgressData {
        return { ...this.progressData }

    /**
     * 進捗をロード
     */
    loadProgress(data: ProgressData): void {
        this.progressData = { ...data,
        if (data.unlockedAchievements) { this.unlockedAchievements = new Set(data.unlockedAchievements, as any) }
    }

    /**
     * 進捗をリセット
     */
    resetProgress(): void { this.initializeDefaultProgress(),
        this.unlockedAchievements.clear(),
        this.progressHistory = [],
        this.progressData.achievementsUnlocked = 0 }

    /**
     * 進捗履歴を取得
     */
    getProgressHistory(limit: number = 100): ProgressHistoryEntry[] { return this.progressHistory.slice(-limit) }

    /**
     * 履歴に追加
     */
    private addToHistory(eventType: string, data: any): void { this.progressHistory.push({),
            timestamp: Date.now(),
            eventType,
            data,

        // 履歴の上限を超えたら古いものを削除
        if(this.progressHistory.length > this.historyLimit) { }

            this.progressHistory = this.progressHistory.slice(-this.historyLimit); }
}'}