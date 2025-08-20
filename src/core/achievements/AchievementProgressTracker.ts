/**
 * AchievementProgressTracker - Achievement progress tracking system
 * 実績進捗追跡システム - 実績条件の進捗監視と達成判定
 * 
 * 主要機能:
 * - 実績条件の進捗計算
 * - 達成判定とトリガー
 * - 進捗データの永続化
 * - 複雑条件の評価
 */

// 型定義
export interface ProgressData {
    bubblesPopped?: number;
    totalScore?: number;
    highestSingleScore?: number;
    maxCombo?: number;
    bestAccuracy?: number;
    longestSurvivalTime?: number;
    stagesCleared?: number;
    allStagesCleared?: boolean;
    gamesPlayed?: number;
    totalPlayTime?: number;
    consecutiveDaysPlayed?: number;
    highestNoItemScore?: number;
    bubbleTypesCounts?: Record<string, number>;
    perfectGames?: PerfectGameRecord[];
    speedChallengeRecords?: SpeedChallengeRecord[];
    lowHpSurvivalRecords?: LowHpSurvivalRecord[];
    lowHpScoreRecords?: LowHpScoreRecord[];
    timeSpecificScoreRecords?: TimeSpecificScoreRecord[];
    stageClearCounts?: Record<string, number>;
    availableStages?: string[];
    [key: string]: any;
}

export interface PerfectGameRecord {
    bubbles: number;
    missedBubbles: number;
    score: number;
    timestamp: number;
}

export interface SpeedChallengeRecord {
    bubbles: number;
    time: number;
    timestamp: number;
}

export interface LowHpSurvivalRecord {
    hp: number;
    time: number;
    timestamp: number;
}

export interface LowHpScoreRecord {
    hp: number;
    score: number;
    timestamp: number;
}

export interface TimeSpecificScoreRecord {
    score: number;
    timestamp: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    condition: AchievementCondition;
    rewards?: AchievementReward[];
    category?: string;
    difficulty?: DifficultyLevel;
    hidden?: boolean;
}

export interface AchievementCondition {
    type: ConditionType;
    value?: number;
    bubbleType?: string;
    hp?: number;
    time?: number;
    score?: number;
    minBubbles?: number;
    bubbles?: number;
    startHour?: number;
    endHour?: number;
    [key: string]: any;
}

export interface AchievementReward {
    type: RewardType;
    value: string | number;
    description?: string;
}

export interface ConditionEvaluationResult {
    current: number;
    target: number;
    progress: number;
    isComplete: boolean;
    error?: string;
    bubbleType?: string;
    hp?: number;
    minBubbles?: number;
    bubbles?: number;
    timeRange?: string;
    requiredCount?: number;
    completedTypes?: string[];
    requiredTypes?: string[];
    completedStages?: string[];
}

export interface ProgressHistoryEntry {
    eventType: EventType;
    data: any;
    timestamp: number;
}

export interface EventData {
    bubbleType?: string;
    score?: number;
    accuracy?: number;
    survivalTime?: number;
    bubblesPopped?: number;
    missedBubbles?: number;
    gameTime?: number;
    itemsUsed?: number;
    lowestHp?: number;
    combo?: number;
    stageName?: string;
    allStagesCompleted?: boolean;
    sessionTime?: number;
    consecutiveDays?: number;
    [key: string]: any;
}

export interface TrackerConfig {
    saveInterval: number;
    maxHistoryEntries: number;
    debugMode: boolean;
}

export interface SaveData {
    progressData: ProgressData;
    unlockedAchievements: string[];
    lastSaved: number;
}

export interface AchievementUnlockedEvent {
    achievementId: string;
    achievement: Achievement;
    timestamp: number;
}

// コールバック型
export type ConditionEvaluator = (progress: ProgressData, condition: AchievementCondition) => ConditionEvaluationResult;
export type EventHandler = (data: any) => void;

// 列挙型
export type ConditionType = 
    | 'bubblesPopped'
    | 'singleGameScore'
    | 'cumulativeScore'
    | 'maxCombo'
    | 'bubbleTypePopped'
    | 'survivalTime'
    | 'lowHpSurvival'
    | 'lowHpScore'
    | 'stagesCleared'
    | 'allStagesCleared'
    | 'perfectGame'
    | 'speedChallenge'
    | 'accuracy'
    | 'consecutiveDays'
    | 'totalPlayTime'
    | 'gamesPlayed'
    | 'allBubbleTypes'
    | 'allStagesMultiple'
    | 'noItemScore'
    | 'timeSpecificScore';

export type EventType = 
    | 'bubblePopped'
    | 'gameCompleted'
    | 'comboAchieved'
    | 'stageCleared'
    | 'playSession';

export type RewardType = 'points' | 'item' | 'cosmetic' | 'title' | 'unlock';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert' | 'legendary';

export class AchievementProgressTracker {
    private progressData: ProgressData;
    private unlockedAchievements: Set<string>;
    private conditionEvaluators: Record<ConditionType, ConditionEvaluator>;
    private config: TrackerConfig;
    private progressHistory: ProgressHistoryEntry[];
    private eventHandlers: Record<string, EventHandler[]>;
    private autoSaveInterval?: number;

    constructor() {
        // 進捗データ
        this.progressData = {};
        this.unlockedAchievements = new Set<string>();
        
        // 条件評価エンジン
        this.conditionEvaluators = this.initializeConditionEvaluators();
        
        // 進捗計算設定
        this.config = {
            saveInterval: 5000, // 5秒毎に保存
            maxHistoryEntries: 100,
            debugMode: false
        };
        
        // 進捗履歴
        this.progressHistory = [];
        
        // イベントハンドラー
        this.eventHandlers = {
            achievementUnlocked: [],
            progressUpdated: []
        };
        
        this.loadProgressData();
        this.startAutoSave();
    }

    /**
     * 条件評価エンジンを初期化
     * @returns 条件評価関数群
     */
    private initializeConditionEvaluators(): Record<ConditionType, ConditionEvaluator> {
        return {
            // 基本的な数値条件
            bubblesPopped: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const current = progress.bubblesPopped || 0;
                const target = condition.value || 0;
                return {
                    current,
                    target,
                    progress: Math.min(current / target, 1),
                    isComplete: current >= target
                };
            },

            // 単発ゲームスコア
            singleGameScore: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const current = progress.highestSingleScore || 0;
                const target = condition.value || 0;
                return {
                    current,
                    target,
                    progress: Math.min(current / target, 1),
                    isComplete: current >= target
                };
            },

            // 累計スコア
            cumulativeScore: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const current = progress.totalScore || 0;
                const target = condition.value || 0;
                return {
                    current,
                    target,
                    progress: Math.min(current / target, 1),
                    isComplete: current >= target
                };
            },

            // 最大コンボ
            maxCombo: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const current = progress.maxCombo || 0;
                const target = condition.value || 0;
                return {
                    current,
                    target,
                    progress: Math.min(current / target, 1),
                    isComplete: current >= target
                };
            },

            // 特殊泡タイプ
            bubbleTypePopped: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const bubbleTypes = progress.bubbleTypesCounts || {};
                const current = bubbleTypes[condition.bubbleType || ''] || 0;
                const target = condition.value || 0;
                return {
                    current,
                    target,
                    bubbleType: condition.bubbleType,
                    progress: Math.min(current / target, 1),
                    isComplete: current >= target
                };
            },

            // 生存時間
            survivalTime: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const current = progress.longestSurvivalTime || 0;
                const target = condition.value || 0;
                return {
                    current,
                    target,
                    progress: Math.min(current / target, 1),
                    isComplete: current >= target
                };
            },

            // 低HP生存
            lowHpSurvival: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const records = progress.lowHpSurvivalRecords || [];
                const qualifying = records.filter(record => 
                    record.hp <= (condition.hp || 0) && record.time >= (condition.time || 0)
                );
                return {
                    current: qualifying.length > 0 ? Math.max(...qualifying.map(r => r.time)) : 0,
                    target: condition.time || 0,
                    hp: condition.hp,
                    progress: qualifying.length > 0 ? 1 : 0,
                    isComplete: qualifying.length > 0
                };
            },

            // 低HPスコア
            lowHpScore: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const records = progress.lowHpScoreRecords || [];
                const qualifying = records.filter(record => 
                    record.hp <= (condition.hp || 0) && record.score >= (condition.score || 0)
                );
                return {
                    current: qualifying.length > 0 ? Math.max(...qualifying.map(r => r.score)) : 0,
                    target: condition.score || 0,
                    hp: condition.hp,
                    progress: qualifying.length > 0 ? 1 : 0,
                    isComplete: qualifying.length > 0
                };
            },

            // ステージクリア
            stagesCleared: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const current = progress.stagesCleared || 0;
                const target = condition.value || 0;
                return {
                    current,
                    target,
                    progress: Math.min(current / target, 1),
                    isComplete: current >= target
                };
            },

            // 全ステージクリア
            allStagesCleared: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const cleared = progress.allStagesCleared || false;
                return {
                    current: cleared ? 1 : 0,
                    target: 1,
                    progress: cleared ? 1 : 0,
                    isComplete: cleared
                };
            },

            // 完璧ゲーム
            perfectGame: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const records = progress.perfectGames || [];
                const qualifying = records.filter(record => 
                    record.bubbles >= (condition.minBubbles || 0) && record.missedBubbles === 0
                );
                return {
                    current: qualifying.length,
                    target: 1,
                    minBubbles: condition.minBubbles,
                    progress: qualifying.length > 0 ? 1 : 0,
                    isComplete: qualifying.length > 0
                };
            },

            // スピードチャレンジ
            speedChallenge: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const records = progress.speedChallengeRecords || [];
                const qualifying = records.filter(record => 
                    record.bubbles >= (condition.bubbles || 0) && record.time <= (condition.time || 0)
                );
                return {
                    current: qualifying.length > 0 ? Math.min(...qualifying.map(r => r.time)) : Infinity,
                    target: condition.time || 0,
                    bubbles: condition.bubbles,
                    progress: qualifying.length > 0 ? 1 : 0,
                    isComplete: qualifying.length > 0
                };
            },

            // 精度
            accuracy: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const current = progress.bestAccuracy || 0;
                const target = condition.value || 0;
                return {
                    current,
                    target,
                    progress: Math.min(current / target, 1),
                    isComplete: current >= target
                };
            },

            // 連続日数
            consecutiveDays: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const current = progress.consecutiveDaysPlayed || 0;
                const target = condition.value || 0;
                return {
                    current,
                    target,
                    progress: Math.min(current / target, 1),
                    isComplete: current >= target
                };
            },

            // 総プレイ時間
            totalPlayTime: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const current = progress.totalPlayTime || 0;
                const target = condition.value || 0;
                return {
                    current,
                    target,
                    progress: Math.min(current / target, 1),
                    isComplete: current >= target
                };
            },

            // ゲームプレイ数
            gamesPlayed: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const current = progress.gamesPlayed || 0;
                const target = condition.value || 0;
                return {
                    current,
                    target,
                    progress: Math.min(current / target, 1),
                    isComplete: current >= target
                };
            },

            // 全泡タイプ
            allBubbleTypes: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const bubbleTypes = progress.bubbleTypesCounts || {};
                const requiredTypes = [
                    'normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 
                    'poison', 'spiky', 'electric', 'boss', 'golden', 'phantom',
                    'explosive', 'magnetic', 'frozen', 'multiplier'
                ];
                const completedTypes = requiredTypes.filter(type => (bubbleTypes[type] || 0) > 0);
                return {
                    current: completedTypes.length,
                    target: requiredTypes.length,
                    completedTypes,
                    requiredTypes,
                    progress: completedTypes.length / requiredTypes.length,
                    isComplete: completedTypes.length === requiredTypes.length
                };
            },

            // 全ステージ複数回
            allStagesMultiple: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const stageCounts = progress.stageClearCounts || {};
                const requiredStages = progress.availableStages || [];
                const completedStages = requiredStages.filter(stage => 
                    (stageCounts[stage] || 0) >= (condition.value || 0)
                );
                return {
                    current: completedStages.length,
                    target: requiredStages.length,
                    requiredCount: condition.value,
                    completedStages,
                    progress: requiredStages.length > 0 ? completedStages.length / requiredStages.length : 0,
                    isComplete: completedStages.length === requiredStages.length
                };
            },

            // アイテム使用なしスコア
            noItemScore: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const current = progress.highestNoItemScore || 0;
                const target = condition.value || 0;
                return {
                    current,
                    target,
                    progress: Math.min(current / target, 1),
                    isComplete: current >= target
                };
            },

            // 時間指定スコア
            timeSpecificScore: (progress: ProgressData, condition: AchievementCondition): ConditionEvaluationResult => {
                const records = progress.timeSpecificScoreRecords || [];
                const qualifying = records.filter(record => {
                    const hour = new Date(record.timestamp).getHours();
                    const startHour = condition.startHour || 0;
                    const endHour = condition.endHour || 24;
                    const inTimeRange = startHour <= endHour ?
                        (hour >= startHour && hour < endHour) :
                        (hour >= startHour || hour < endHour);
                    return inTimeRange && record.score >= (condition.score || 0);
                });
                return {
                    current: qualifying.length > 0 ? Math.max(...qualifying.map(r => r.score)) : 0,
                    target: condition.score || 0,
                    timeRange: `${condition.startHour || 0}:00-${condition.endHour || 24}:00`,
                    progress: qualifying.length > 0 ? 1 : 0,
                    isComplete: qualifying.length > 0
                };
            }
        };
    }

    /**
     * 進捗データを更新
     * @param eventType イベントタイプ
     * @param data イベントデータ
     */
    updateProgress(eventType: EventType, data: EventData): void {
        // イベントタイプに基づいて進捗データを更新
        switch (eventType) {
            case 'bubblePopped':
                this.updateBubbleProgress(data);
                break;
            case 'gameCompleted':
                this.updateGameCompletionProgress(data);
                break;
            case 'comboAchieved':
                this.updateComboProgress(data);
                break;
            case 'stageCleared':
                this.updateStageProgress(data);
                break;
            case 'playSession':
                this.updatePlaySessionProgress(data);
                break;
            default:
                if (this.config.debugMode) {
                    console.warn(`Unknown event type: ${eventType}`);
                }
        }

        // 進捗履歴に記録
        this.addToProgressHistory(eventType, data);
    }

    /**
     * 泡関連の進捗を更新
     * @param data 泡データ
     */
    private updateBubbleProgress(data: EventData): void {
        // 総泡数
        this.progressData.bubblesPopped = (this.progressData.bubblesPopped || 0) + 1;
        
        // 泡タイプ別カウント
        if (!this.progressData.bubbleTypesCounts) {
            this.progressData.bubbleTypesCounts = {};
        }
        const bubbleType = data.bubbleType || 'normal';
        this.progressData.bubbleTypesCounts[bubbleType] = 
            (this.progressData.bubbleTypesCounts[bubbleType] || 0) + 1;
    }

    /**
     * ゲーム完了関連の進捗を更新
     * @param data ゲームデータ
     */
    private updateGameCompletionProgress(data: EventData): void {
        // ゲーム数
        this.progressData.gamesPlayed = (this.progressData.gamesPlayed || 0) + 1;
        
        // スコア関連
        if (data.score !== undefined) {
            this.progressData.totalScore = (this.progressData.totalScore || 0) + data.score;
            this.progressData.highestSingleScore = Math.max(
                this.progressData.highestSingleScore || 0,
                data.score
            );
        }
        
        // 精度
        if (data.accuracy !== undefined) {
            this.progressData.bestAccuracy = Math.max(
                this.progressData.bestAccuracy || 0,
                data.accuracy
            );
        }
        
        // 生存時間
        if (data.survivalTime !== undefined) {
            this.progressData.longestSurvivalTime = Math.max(
                this.progressData.longestSurvivalTime || 0,
                data.survivalTime
            );
        }
        
        // 完璧ゲーム
        if (data.missedBubbles === 0 && (data.bubblesPopped || 0) > 0) {
            if (!this.progressData.perfectGames) {
                this.progressData.perfectGames = [];
            }
            this.progressData.perfectGames.push({
                bubbles: data.bubblesPopped || 0,
                missedBubbles: data.missedBubbles || 0,
                score: data.score || 0,
                timestamp: Date.now()
            });
        }
        
        // スピードチャレンジ
        if (data.gameTime && data.bubblesPopped) {
            if (!this.progressData.speedChallengeRecords) {
                this.progressData.speedChallengeRecords = [];
            }
            this.progressData.speedChallengeRecords.push({
                bubbles: data.bubblesPopped,
                time: data.gameTime,
                timestamp: Date.now()
            });
        }
        
        // アイテム未使用スコア
        if ((data.itemsUsed || 0) === 0 && data.score) {
            this.progressData.highestNoItemScore = Math.max(
                this.progressData.highestNoItemScore || 0,
                data.score
            );
        }
        
        // 時間指定スコア
        if (data.score) {
            if (!this.progressData.timeSpecificScoreRecords) {
                this.progressData.timeSpecificScoreRecords = [];
            }
            this.progressData.timeSpecificScoreRecords.push({
                score: data.score,
                timestamp: Date.now()
            });
        }
        
        // 低HP記録
        if (data.lowestHp !== undefined) {
            this.updateLowHpRecords(data);
        }
    }

    /**
     * 低HP記録を更新
     * @param data ゲームデータ
     */
    private updateLowHpRecords(data: EventData): void {
        // 低HP生存記録
        if (!this.progressData.lowHpSurvivalRecords) {
            this.progressData.lowHpSurvivalRecords = [];
        }
        this.progressData.lowHpSurvivalRecords.push({
            hp: data.lowestHp || 0,
            time: data.survivalTime || 0,
            timestamp: Date.now()
        });
        
        // 低HPスコア記録
        if (!this.progressData.lowHpScoreRecords) {
            this.progressData.lowHpScoreRecords = [];
        }
        this.progressData.lowHpScoreRecords.push({
            hp: data.lowestHp || 0,
            score: data.score || 0,
            timestamp: Date.now()
        });
    }

    /**
     * コンボ関連の進捗を更新
     * @param data コンボデータ
     */
    private updateComboProgress(data: EventData): void {
        if (data.combo !== undefined) {
            this.progressData.maxCombo = Math.max(
                this.progressData.maxCombo || 0,
                data.combo
            );
        }
    }

    /**
     * ステージ関連の進捗を更新
     * @param data ステージデータ
     */
    private updateStageProgress(data: EventData): void {
        // ステージクリア数
        this.progressData.stagesCleared = (this.progressData.stagesCleared || 0) + 1;
        
        // ステージ別クリア数
        if (!this.progressData.stageClearCounts) {
            this.progressData.stageClearCounts = {};
        }
        const stageName = data.stageName || 'unknown';
        this.progressData.stageClearCounts[stageName] = 
            (this.progressData.stageClearCounts[stageName] || 0) + 1;
        
        // 全ステージクリア判定
        if (data.allStagesCompleted) {
            this.progressData.allStagesCleared = true;
        }
    }

    /**
     * プレイセッション関連の進捗を更新
     * @param data セッションデータ
     */
    private updatePlaySessionProgress(data: EventData): void {
        // 総プレイ時間
        if (data.sessionTime !== undefined) {
            this.progressData.totalPlayTime = (this.progressData.totalPlayTime || 0) + data.sessionTime;
        }
        
        // 連続プレイ日数
        if (data.consecutiveDays !== undefined) {
            this.progressData.consecutiveDaysPlayed = data.consecutiveDays;
        }
    }

    /**
     * 実績条件を評価
     * @param achievement 実績オブジェクト
     * @returns 評価結果
     */
    evaluateAchievementCondition(achievement: Achievement): ConditionEvaluationResult {
        const condition = achievement.condition;
        const evaluator = this.conditionEvaluators[condition.type];
        
        if (!evaluator) {
            console.warn(`No evaluator found for condition type: ${condition.type}`);
            return {
                current: 0,
                target: 1,
                progress: 0,
                isComplete: false,
                error: `Unknown condition type: ${condition.type}`
            };
        }
        
        try {
            return evaluator(this.progressData, condition);
        } catch (error) {
            console.error(`Error evaluating achievement ${achievement.id}:`, error);
            return {
                current: 0,
                target: 1,
                progress: 0,
                isComplete: false,
                error: (error as Error).message
            };
        }
    }

    /**
     * 実績の解除状態を確認
     * @param achievementId 実績ID
     * @returns 解除済みかどうか
     */
    isAchievementUnlocked(achievementId: string): boolean {
        return this.unlockedAchievements.has(achievementId);
    }

    /**
     * 実績を解除
     * @param achievementId 実績ID
     * @param achievement 実績オブジェクト
     */
    unlockAchievement(achievementId: string, achievement: Achievement): void {
        if (this.unlockedAchievements.has(achievementId)) {
            return; // 既に解除済み
        }
        
        this.unlockedAchievements.add(achievementId);
        
        // イベント発火
        this.triggerEvent('achievementUnlocked', {
            achievementId,
            achievement,
            timestamp: Date.now()
        });
    }

    /**
     * 進捗履歴に追加
     * @param eventType イベントタイプ
     * @param data イベントデータ
     */
    private addToProgressHistory(eventType: EventType, data: EventData): void {
        this.progressHistory.unshift({
            eventType,
            data,
            timestamp: Date.now()
        });
        
        // 履歴サイズ制限
        if (this.progressHistory.length > this.config.maxHistoryEntries) {
            this.progressHistory = this.progressHistory.slice(0, this.config.maxHistoryEntries);
        }
    }

    /**
     * イベントを発火
     * @param eventName イベント名
     * @param data イベントデータ
     */
    private triggerEvent(eventName: string, data: any): void {
        const handlers = this.eventHandlers[eventName] || [];
        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in event handler for ${eventName}:`, error);
            }
        });
    }

    /**
     * イベントリスナーを追加
     * @param eventName イベント名
     * @param handler ハンドラー関数
     */
    addEventListener(eventName: string, handler: EventHandler): void {
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(handler);
    }

    /**
     * 進捗データを保存
     */
    saveProgressData(): void {
        try {
            const saveData: SaveData = {
                progressData: this.progressData,
                unlockedAchievements: Array.from(this.unlockedAchievements),
                lastSaved: Date.now()
            };
            localStorage.setItem('achievementProgress', JSON.stringify(saveData));
        } catch (error) {
            console.error('Failed to save achievement progress:', error);
        }
    }

    /**
     * 進捗データを読み込み
     */
    private loadProgressData(): void {
        try {
            const savedData = localStorage.getItem('achievementProgress');
            if (savedData) {
                const data: SaveData = JSON.parse(savedData);
                this.progressData = data.progressData || {};
                this.unlockedAchievements = new Set(data.unlockedAchievements || []);
            }
        } catch (error) {
            console.error('Failed to load achievement progress:', error);
            this.progressData = {};
            this.unlockedAchievements = new Set();
        }
    }

    /**
     * 自動保存を開始
     */
    private startAutoSave(): void {
        this.autoSaveInterval = window.setInterval(() => {
            this.saveProgressData();
        }, this.config.saveInterval);
    }

    /**
     * 進捗データを取得
     * @returns 進捗データ
     */
    getProgressData(): ProgressData {
        return { ...this.progressData };
    }

    /**
     * 解除済み実績一覧を取得
     * @returns 解除済み実績ID配列
     */
    getUnlockedAchievements(): string[] {
        return Array.from(this.unlockedAchievements);
    }

    /**
     * 進捗履歴を取得
     * @param limit 取得件数制限
     * @returns 進捗履歴
     */
    getProgressHistory(limit: number = 50): ProgressHistoryEntry[] {
        return this.progressHistory.slice(0, limit);
    }

    /**
     * 進捗データをリセット
     */
    resetProgress(): void {
        this.progressData = {};
        this.unlockedAchievements.clear();
        this.progressHistory = [];
        this.saveProgressData();
    }

    /**
     * クリーンアップ
     */
    cleanup(): void {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = undefined;
        }
    }
}