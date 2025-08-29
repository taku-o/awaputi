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
export class AchievementProgressTracker {
    constructor() {
        // 進捗データ
        this.progressData = {};
        this.unlockedAchievements = new Set();
        
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
     * @returns {object} 条件評価関数群
     */
    initializeConditionEvaluators() {
        return {
            // 基本的な数値条件
            bubblesPopped: (progress, condition) => {
                const current = progress.bubblesPopped || 0;
                return {
                    current,
                    target: condition.value,
                    progress: Math.min(current / condition.value, 1),
                    isComplete: current >= condition.value
                };
            },

            // 単発ゲームスコア
            singleGameScore: (progress, condition) => {
                const current = progress.highestSingleScore || 0;
                return {
                    current,
                    target: condition.value,
                    progress: Math.min(current / condition.value, 1),
                    isComplete: current >= condition.value
                };
            },

            // 累計スコア
            cumulativeScore: (progress, condition) => {
                const current = progress.totalScore || 0;
                return {
                    current,
                    target: condition.value,
                    progress: Math.min(current / condition.value, 1),
                    isComplete: current >= condition.value
                };
            },

            // 最大コンボ
            maxCombo: (progress, condition) => {
                const current = progress.maxCombo || 0;
                return {
                    current,
                    target: condition.value,
                    progress: Math.min(current / condition.value, 1),
                    isComplete: current >= condition.value
                };
            },

            // 特殊泡タイプ
            bubbleTypePopped: (progress, condition) => {
                const bubbleTypes = progress.bubbleTypesCounts || {};
                const current = bubbleTypes[condition.bubbleType] || 0;
                return {
                    current,
                    target: condition.value,
                    bubbleType: condition.bubbleType,
                    progress: Math.min(current / condition.value, 1),
                    isComplete: current >= condition.value
                };
            },

            // 生存時間
            survivalTime: (progress, condition) => {
                const current = progress.longestSurvivalTime || 0;
                return {
                    current,
                    target: condition.value,
                    progress: Math.min(current / condition.value, 1),
                    isComplete: current >= condition.value
                };
            },

            // 低HP生存
            lowHpSurvival: (progress, condition) => {
                const records = progress.lowHpSurvivalRecords || [];
                const qualifying = records.filter(record => 
                    record.hp <= condition.hp && record.time >= condition.time
                );
                return {
                    current: qualifying.length > 0 ? Math.max(...qualifying.map(r => r.time)) : 0,
                    target: condition.time,
                    hp: condition.hp,
                    progress: qualifying.length > 0 ? 1 : 0,
                    isComplete: qualifying.length > 0
                };
            },

            // 低HPスコア
            lowHpScore: (progress, condition) => {
                const records = progress.lowHpScoreRecords || [];
                const qualifying = records.filter(record => 
                    record.hp <= condition.hp && record.score >= condition.score
                );
                return {
                    current: qualifying.length > 0 ? Math.max(...qualifying.map(r => r.score)) : 0,
                    target: condition.score,
                    hp: condition.hp,
                    progress: qualifying.length > 0 ? 1 : 0,
                    isComplete: qualifying.length > 0
                };
            },

            // ステージクリア
            stagesCleared: (progress, condition) => {
                const current = progress.stagesCleared || 0;
                return {
                    current,
                    target: condition.value,
                    progress: Math.min(current / condition.value, 1),
                    isComplete: current >= condition.value
                };
            },

            // 全ステージクリア
            allStagesCleared: (progress, condition) => {
                const cleared = progress.allStagesCleared || false;
                return {
                    current: cleared ? 1 : 0,
                    target: 1,
                    progress: cleared ? 1 : 0,
                    isComplete: cleared
                };
            },

            // 完璧ゲーム
            perfectGame: (progress, condition) => {
                const records = progress.perfectGames || [];
                const qualifying = records.filter(record => 
                    record.bubbles >= condition.minBubbles && record.missedBubbles === 0
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
            speedChallenge: (progress, condition) => {
                const records = progress.speedChallengeRecords || [];
                const qualifying = records.filter(record => 
                    record.bubbles >= condition.bubbles && record.time <= condition.time
                );
                return {
                    current: qualifying.length > 0 ? Math.min(...qualifying.map(r => r.time)) : Infinity,
                    target: condition.time,
                    bubbles: condition.bubbles,
                    progress: qualifying.length > 0 ? 1 : 0,
                    isComplete: qualifying.length > 0
                };
            },

            // 精度
            accuracy: (progress, condition) => {
                const current = progress.bestAccuracy || 0;
                return {
                    current,
                    target: condition.value,
                    progress: Math.min(current / condition.value, 1),
                    isComplete: current >= condition.value
                };
            },

            // 連続日数
            consecutiveDays: (progress, condition) => {
                const current = progress.consecutiveDaysPlayed || 0;
                return {
                    current,
                    target: condition.value,
                    progress: Math.min(current / condition.value, 1),
                    isComplete: current >= condition.value
                };
            },

            // 総プレイ時間
            totalPlayTime: (progress, condition) => {
                const current = progress.totalPlayTime || 0;
                return {
                    current,
                    target: condition.value,
                    progress: Math.min(current / condition.value, 1),
                    isComplete: current >= condition.value
                };
            },

            // ゲームプレイ数
            gamesPlayed: (progress, condition) => {
                const current = progress.gamesPlayed || 0;
                return {
                    current,
                    target: condition.value,
                    progress: Math.min(current / condition.value, 1),
                    isComplete: current >= condition.value
                };
            },

            // 全泡タイプ
            allBubbleTypes: (progress, condition) => {
                const bubbleTypes = progress.bubbleTypesCounts || {};
                const requiredTypes = [
                    'normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 
                    'poison', 'spiky', 'electric', 'boss', 'golden', 'phantom',
                    'explosive', 'magnetic', 'frozen', 'multiplier'
                ];
                const completedTypes = requiredTypes.filter(type => bubbleTypes[type] > 0);
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
            allStagesMultiple: (progress, condition) => {
                const stageCounts = progress.stageClearCounts || {};
                const requiredStages = progress.availableStages || [];
                const completedStages = requiredStages.filter(stage => 
                    (stageCounts[stage] || 0) >= condition.value
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
            noItemScore: (progress, condition) => {
                const current = progress.highestNoItemScore || 0;
                return {
                    current,
                    target: condition.value,
                    progress: Math.min(current / condition.value, 1),
                    isComplete: current >= condition.value
                };
            },

            // 時間指定スコア
            timeSpecificScore: (progress, condition) => {
                const records = progress.timeSpecificScoreRecords || [];
                const qualifying = records.filter(record => {
                    const hour = new Date(record.timestamp).getHours();
                    const inTimeRange = condition.startHour <= condition.endHour ?
                        (hour >= condition.startHour && hour < condition.endHour) :
                        (hour >= condition.startHour || hour < condition.endHour);
                    return inTimeRange && record.score >= condition.score;
                });
                return {
                    current: qualifying.length > 0 ? Math.max(...qualifying.map(r => r.score)) : 0,
                    target: condition.score,
                    timeRange: `${condition.startHour}:00-${condition.endHour}:00`,
                    progress: qualifying.length > 0 ? 1 : 0,
                    isComplete: qualifying.length > 0
                };
            }
        };
    }

    /**
     * 進捗データを更新
     * @param {string} eventType - イベントタイプ
     * @param {object} data - イベントデータ
     */
    updateProgress(eventType, data) {
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
     * @param {object} data - 泡データ
     */
    updateBubbleProgress(data) {
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
     * @param {object} data - ゲームデータ
     */
    updateGameCompletionProgress(data) {
        // ゲーム数
        this.progressData.gamesPlayed = (this.progressData.gamesPlayed || 0) + 1;
        
        // スコア関連
        this.progressData.totalScore = (this.progressData.totalScore || 0) + data.score;
        this.progressData.highestSingleScore = Math.max(
            this.progressData.highestSingleScore || 0,
            data.score
        );
        
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
        if (data.missedBubbles === 0 && data.bubblesPopped > 0) {
            if (!this.progressData.perfectGames) {
                this.progressData.perfectGames = [];
            }
            this.progressData.perfectGames.push({
                bubbles: data.bubblesPopped,
                missedBubbles: data.missedBubbles,
                score: data.score,
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
        if (data.itemsUsed === 0) {
            this.progressData.highestNoItemScore = Math.max(
                this.progressData.highestNoItemScore || 0,
                data.score
            );
        }
        
        // 時間指定スコア
        if (!this.progressData.timeSpecificScoreRecords) {
            this.progressData.timeSpecificScoreRecords = [];
        }
        this.progressData.timeSpecificScoreRecords.push({
            score: data.score,
            timestamp: Date.now()
        });
        
        // 低HP記録
        if (data.lowestHp !== undefined) {
            this.updateLowHpRecords(data);
        }
    }

    /**
     * 低HP記録を更新
     * @param {object} data - ゲームデータ
     */
    updateLowHpRecords(data) {
        // 低HP生存記録
        if (!this.progressData.lowHpSurvivalRecords) {
            this.progressData.lowHpSurvivalRecords = [];
        }
        this.progressData.lowHpSurvivalRecords.push({
            hp: data.lowestHp,
            time: data.survivalTime || 0,
            timestamp: Date.now()
        });
        
        // 低HPスコア記録
        if (!this.progressData.lowHpScoreRecords) {
            this.progressData.lowHpScoreRecords = [];
        }
        this.progressData.lowHpScoreRecords.push({
            hp: data.lowestHp,
            score: data.score,
            timestamp: Date.now()
        });
    }

    /**
     * コンボ関連の進捗を更新
     * @param {object} data - コンボデータ
     */
    updateComboProgress(data) {
        this.progressData.maxCombo = Math.max(
            this.progressData.maxCombo || 0,
            data.combo
        );
    }

    /**
     * ステージ関連の進捗を更新
     * @param {object} data - ステージデータ
     */
    updateStageProgress(data) {
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
     * @param {object} data - セッションデータ
     */
    updatePlaySessionProgress(data) {
        // 総プレイ時間
        this.progressData.totalPlayTime = (this.progressData.totalPlayTime || 0) + data.sessionTime;
        
        // 連続プレイ日数
        if (data.consecutiveDays !== undefined) {
            this.progressData.consecutiveDaysPlayed = data.consecutiveDays;
        }
    }

    /**
     * 実績条件を評価
     * @param {object} achievement - 実績オブジェクト
     * @returns {object} 評価結果
     */
    evaluateAchievementCondition(achievement) {
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
                error: error.message
            };
        }
    }

    /**
     * 実績の解除状態を確認
     * @param {string} achievementId - 実績ID
     * @returns {boolean} 解除済みかどうか
     */
    isAchievementUnlocked(achievementId) {
        return this.unlockedAchievements.has(achievementId);
    }

    /**
     * 実績を解除
     * @param {string} achievementId - 実績ID
     * @param {object} achievement - 実績オブジェクト
     */
    unlockAchievement(achievementId, achievement) {
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
     * @param {string} eventType - イベントタイプ
     * @param {object} data - イベントデータ
     */
    addToProgressHistory(eventType, data) {
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
     * @param {string} eventName - イベント名
     * @param {object} data - イベントデータ
     */
    triggerEvent(eventName, data) {
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
     * @param {string} eventName - イベント名
     * @param {function} handler - ハンドラー関数
     */
    addEventListener(eventName, handler) {
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(handler);
    }

    /**
     * 進捗データを保存
     */
    saveProgressData() {
        try {
            const saveData = {
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
    loadProgressData() {
        try {
            const savedData = localStorage.getItem('achievementProgress');
            if (savedData) {
                const data = JSON.parse(savedData);
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
    startAutoSave() {
        setInterval(() => {
            this.saveProgressData();
        }, this.config.saveInterval);
    }

    /**
     * 進捗データを取得
     * @returns {object} 進捗データ
     */
    getProgressData() {
        return { ...this.progressData };
    }

    /**
     * 解除済み実績一覧を取得
     * @returns {Array} 解除済み実績ID配列
     */
    getUnlockedAchievements() {
        return Array.from(this.unlockedAchievements);
    }

    /**
     * 進捗履歴を取得
     * @param {number} limit - 取得件数制限
     * @returns {Array} 進捗履歴
     */
    getProgressHistory(limit = 50) {
        return this.progressHistory.slice(0, limit);
    }

    /**
     * 進捗データをリセット
     */
    resetProgress() {
        this.progressData = {};
        this.unlockedAchievements.clear();
        this.progressHistory = [];
        this.saveProgressData();
    }
}