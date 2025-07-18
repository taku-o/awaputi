/**
 * イベントステージ管理クラス
 */
export class EventStageManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.eventStages = this.initializeEventStages();
        this.activeEvents = new Map();
        this.eventHistory = [];
    }
    
    /**
     * イベントステージを初期化
     */
    initializeEventStages() {
        return {
            // 期間限定イベント
            goldenRush: {
                id: 'goldenRush',
                name: '黄金ラッシュ',
                description: '黄金の泡が大量出現！スコア倍率2倍のチャンス',
                icon: '✨',
                type: 'limited_time',
                duration: 300000, // 5分
                bubbleTypes: ['normal', 'stone', 'golden', 'golden', 'golden', 'rainbow', 'pink'],
                spawnRate: 2.0,
                maxBubbles: 25,
                specialRules: {
                    goldenSpawnRate: 0.4, // 40%の確率で黄金の泡
                    globalScoreMultiplier: 2.0
                },
                rewards: {
                    completion: { ap: 200 },
                    highScore: { threshold: 15000, ap: 300 }
                },
                availability: {
                    startDate: null, // 動的に設定
                    endDate: null,
                    recurring: 'weekly' // 毎週開催
                }
            },
            
            phantomNight: {
                id: 'phantomNight',
                name: '幻影の夜',
                description: '幻の泡が多数出現。すり抜けに注意！',
                icon: '👻',
                type: 'limited_time',
                duration: 300000,
                bubbleTypes: ['normal', 'phantom', 'phantom', 'phantom', 'electric', 'poison'],
                spawnRate: 2.2,
                maxBubbles: 30,
                specialRules: {
                    phantomSpawnRate: 0.5,
                    reducedVisibility: true,
                    nightMode: true
                },
                rewards: {
                    completion: { ap: 250 },
                    survivalBonus: { ap: 100 }
                },
                availability: {
                    recurring: 'monthly'
                }
            },
            
            explosiveChaos: {
                id: 'explosiveChaos',
                name: '爆発カオス',
                description: '爆発の泡だらけ！連鎖爆発を狙え',
                icon: '💥',
                type: 'limited_time',
                duration: 240000, // 4分
                bubbleTypes: ['normal', 'explosive', 'explosive', 'spiky', 'boss'],
                spawnRate: 1.8,
                maxBubbles: 20,
                specialRules: {
                    explosiveSpawnRate: 0.6,
                    chainExplosionBonus: 3.0
                },
                rewards: {
                    completion: { ap: 180 },
                    chainMaster: { chains: 5, ap: 200 }
                },
                availability: {
                    recurring: 'biweekly'
                }
            },
            
            // チャレンジイベント
            speedChallenge: {
                id: 'speedChallenge',
                name: 'スピードチャレンジ',
                description: '2分以内に200個の泡を割れ！',
                icon: '⚡',
                type: 'challenge',
                duration: 120000, // 2分
                bubbleTypes: ['normal', 'stone', 'escaping'],
                spawnRate: 3.5,
                maxBubbles: 50,
                specialRules: {
                    targetBubbles: 200,
                    timeLimit: 120000,
                    fastSpawn: true
                },
                rewards: {
                    completion: { ap: 300 },
                    perfectSpeed: { ap: 500 }
                },
                availability: {
                    recurring: 'daily'
                }
            },
            
            survivalHell: {
                id: 'survivalHell',
                name: 'サバイバル地獄',
                description: 'HP50で開始。10分間生き残れ！',
                icon: '🔥',
                type: 'challenge',
                duration: 600000, // 10分
                bubbleTypes: ['normal', 'poison', 'electric', 'boss', 'explosive'],
                spawnRate: 2.5,
                maxBubbles: 35,
                specialRules: {
                    startingHP: 50,
                    noPinkBubbles: true,
                    increasingDifficulty: true
                },
                rewards: {
                    completion: { ap: 500 },
                    ironWill: { ap: 300 }
                },
                availability: {
                    recurring: 'weekly'
                }
            },
            
            // 特別イベント
            anniversary: {
                id: 'anniversary',
                name: 'アニバーサリー祭',
                description: '全ての泡が出現！特別報酬あり',
                icon: '🎉',
                type: 'special',
                duration: 300000,
                bubbleTypes: ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'score', 
                             'poison', 'spiky', 'electric', 'escaping', 'cracked', 'boss',
                             'golden', 'frozen', 'magnetic', 'explosive', 'phantom', 'multiplier'],
                spawnRate: 3.0,
                maxBubbles: 40,
                specialRules: {
                    allBubblesAvailable: true,
                    bonusRewards: true,
                    specialEffects: true
                },
                rewards: {
                    completion: { ap: 1000 },
                    anniversary: { ap: 500, special: 'anniversary_badge' }
                },
                availability: {
                    recurring: 'yearly'
                }
            }
        };
    }
    
    /**
     * 利用可能なイベントを取得
     */
    getAvailableEvents() {
        const now = Date.now();
        const availableEvents = [];
        
        Object.values(this.eventStages).forEach(event => {
            if (this.isEventAvailable(event, now)) {
                availableEvents.push({
                    ...event,
                    timeRemaining: this.getEventTimeRemaining(event, now),
                    isActive: this.activeEvents.has(event.id)
                });
            }
        });
        
        return availableEvents;
    }
    
    /**
     * イベントが利用可能かチェック
     */
    isEventAvailable(event, currentTime) {
        const availability = event.availability;
        
        // 特別イベントは手動で有効化
        if (event.type === 'special') {
            return this.activeEvents.has(event.id);
        }
        
        // 期間限定イベントの場合
        if (availability.startDate && availability.endDate) {
            return currentTime >= availability.startDate && currentTime <= availability.endDate;
        }
        
        // 定期イベントの場合
        if (availability.recurring) {
            return this.isRecurringEventActive(event, currentTime);
        }
        
        return false;
    }
    
    /**
     * 定期イベントがアクティブかチェック
     */
    isRecurringEventActive(event, currentTime) {
        const now = new Date(currentTime);
        const availability = event.availability;
        
        switch (availability.recurring) {
            case 'daily':
                return true; // 毎日利用可能
                
            case 'weekly':
                // 週末（土日）に利用可能
                const dayOfWeek = now.getDay();
                return dayOfWeek === 0 || dayOfWeek === 6;
                
            case 'biweekly':
                // 隔週で利用可能
                const weekNumber = Math.floor(now.getTime() / (1000 * 60 * 60 * 24 * 7));
                return weekNumber % 2 === 0;
                
            case 'monthly':
                // 月の最初の週に利用可能
                const dayOfMonth = now.getDate();
                return dayOfMonth <= 7;
                
            case 'yearly':
                // 特定の月に利用可能（例：12月）
                const month = now.getMonth();
                return month === 11; // 12月
                
            default:
                return false;
        }
    }
    
    /**
     * イベントの残り時間を取得
     */
    getEventTimeRemaining(event, currentTime) {
        if (event.availability.endDate) {
            return Math.max(0, event.availability.endDate - currentTime);
        }
        
        // 定期イベントの場合は次の期間まで
        return this.getTimeUntilNextRecurrence(event, currentTime);
    }
    
    /**
     * 次の定期イベントまでの時間を取得
     */
    getTimeUntilNextRecurrence(event, currentTime) {
        const now = new Date(currentTime);
        const availability = event.availability;
        
        switch (availability.recurring) {
            case 'daily':
                // 次の日まで
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                return tomorrow.getTime() - currentTime;
                
            case 'weekly':
                // 次の週末まで
                const daysUntilWeekend = (6 - now.getDay()) % 7;
                const nextWeekend = new Date(now);
                nextWeekend.setDate(nextWeekend.getDate() + daysUntilWeekend);
                return nextWeekend.getTime() - currentTime;
                
            default:
                return 0;
        }
    }
    
    /**
     * イベントステージを開始
     */
    startEventStage(eventId) {
        const event = this.eventStages[eventId];
        if (!event) {
            console.error(`Event stage ${eventId} not found`);
            return false;
        }
        
        if (!this.isEventAvailable(event, Date.now())) {
            console.error(`Event stage ${eventId} is not available`);
            return false;
        }
        
        // イベント固有の設定を適用
        this.applyEventSettings(event);
        
        // 通常のステージ開始処理
        this.gameEngine.timeRemaining = event.duration;
        this.gameEngine.bubbleManager.setStageConfig(event);
        
        // イベント開始を記録
        this.eventHistory.push({
            eventId: eventId,
            startTime: Date.now(),
            completed: false
        });
        
        console.log(`Event stage started: ${event.name}`);
        return true;
    }
    
    /**
     * イベント設定を適用
     */
    applyEventSettings(event) {
        const specialRules = event.specialRules || {};
        
        // グローバルスコア倍率
        if (specialRules.globalScoreMultiplier) {
            this.gameEngine.activateScoreMultiplier(specialRules.globalScoreMultiplier, event.duration);
        }
        
        // 開始HP設定
        if (specialRules.startingHP) {
            this.gameEngine.playerData.currentHP = specialRules.startingHP;
            this.gameEngine.playerData.maxHP = specialRules.startingHP;
        }
        
        // 視覚効果
        if (specialRules.nightMode) {
            this.gameEngine.activateNightMode();
        }
        
        if (specialRules.reducedVisibility) {
            this.gameEngine.activateReducedVisibility();
        }
        
        // 特殊生成ルール
        if (specialRules.goldenSpawnRate) {
            this.gameEngine.bubbleManager.setSpecialSpawnRate('golden', specialRules.goldenSpawnRate);
        }
        
        if (specialRules.phantomSpawnRate) {
            this.gameEngine.bubbleManager.setSpecialSpawnRate('phantom', specialRules.phantomSpawnRate);
        }
        
        if (specialRules.explosiveSpawnRate) {
            this.gameEngine.bubbleManager.setSpecialSpawnRate('explosive', specialRules.explosiveSpawnRate);
        }
    }
    
    /**
     * イベントステージ完了処理
     */
    completeEventStage(eventId, finalScore, stats) {
        const event = this.eventStages[eventId];
        if (!event) return;
        
        // 完了報酬を付与
        this.grantEventRewards(event, finalScore, stats);
        
        // 履歴を更新
        const historyEntry = this.eventHistory.find(entry => 
            entry.eventId === eventId && !entry.completed
        );
        if (historyEntry) {
            historyEntry.completed = true;
            historyEntry.endTime = Date.now();
            historyEntry.finalScore = finalScore;
            historyEntry.stats = stats;
        }
        
        console.log(`Event stage completed: ${event.name}, Score: ${finalScore}`);
    }
    
    /**
     * イベント報酬を付与
     */
    grantEventRewards(event, finalScore, stats) {
        const rewards = event.rewards;
        let totalAP = 0;
        
        // 完了報酬
        if (rewards.completion) {
            totalAP += rewards.completion.ap || 0;
        }
        
        // ハイスコア報酬
        if (rewards.highScore && finalScore >= rewards.highScore.threshold) {
            totalAP += rewards.highScore.ap || 0;
        }
        
        // 特殊条件報酬
        if (rewards.survivalBonus && stats.survived) {
            totalAP += rewards.survivalBonus.ap || 0;
        }
        
        if (rewards.chainMaster && stats.maxChain >= rewards.chainMaster.chains) {
            totalAP += rewards.chainMaster.ap || 0;
        }
        
        if (rewards.perfectSpeed && stats.targetReached && stats.timeRemaining > 0) {
            totalAP += rewards.perfectSpeed.ap || 0;
        }
        
        if (rewards.ironWill && stats.lowHpSurvival) {
            totalAP += rewards.ironWill.ap || 0;
        }
        
        // 特別報酬
        if (rewards.anniversary) {
            totalAP += rewards.anniversary.ap || 0;
            // 特別バッジなどの処理
        }
        
        // AP付与
        if (totalAP > 0) {
            this.gameEngine.playerData.ap += totalAP;
            this.gameEngine.playerData.tap += totalAP;
            console.log(`Event rewards granted: ${totalAP} AP`);
        }
    }
    
    /**
     * イベント履歴を取得
     */
    getEventHistory() {
        return this.eventHistory.map(entry => ({
            ...entry,
            eventName: this.eventStages[entry.eventId]?.name || 'Unknown Event',
            duration: entry.endTime ? entry.endTime - entry.startTime : null
        }));
    }
    
    /**
     * イベント統計を取得
     */
    getEventStatistics() {
        const stats = {
            totalEventsPlayed: this.eventHistory.length,
            totalEventsCompleted: this.eventHistory.filter(e => e.completed).length,
            favoriteEvent: null,
            totalEventScore: 0,
            eventCompletionRate: 0
        };
        
        // お気に入りイベントを計算
        const eventCounts = {};
        this.eventHistory.forEach(entry => {
            eventCounts[entry.eventId] = (eventCounts[entry.eventId] || 0) + 1;
            if (entry.finalScore) {
                stats.totalEventScore += entry.finalScore;
            }
        });
        
        let maxCount = 0;
        Object.entries(eventCounts).forEach(([eventId, count]) => {
            if (count > maxCount) {
                maxCount = count;
                stats.favoriteEvent = this.eventStages[eventId]?.name || eventId;
            }
        });
        
        stats.eventCompletionRate = stats.totalEventsPlayed > 0 ? 
            (stats.totalEventsCompleted / stats.totalEventsPlayed * 100).toFixed(1) : 0;
        
        return stats;
    }
    
    /**
     * 特別イベントを手動で有効化
     */
    activateSpecialEvent(eventId, duration) {
        const event = this.eventStages[eventId];
        if (!event || event.type !== 'special') {
            return false;
        }
        
        const endTime = Date.now() + duration;
        this.activeEvents.set(eventId, {
            startTime: Date.now(),
            endTime: endTime
        });
        
        console.log(`Special event activated: ${event.name}`);
        return true;
    }
    
    /**
     * データを保存
     */
    save() {
        try {
            const data = {
                eventHistory: this.eventHistory,
                activeEvents: Array.from(this.activeEvents.entries())
            };
            localStorage.setItem('bubblePop_events', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save event data:', error);
        }
    }
    
    /**
     * データを読み込み
     */
    load() {
        try {
            const savedData = localStorage.getItem('bubblePop_events');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.eventHistory = data.eventHistory || [];
                this.activeEvents = new Map(data.activeEvents || []);
            }
        } catch (error) {
            console.error('Failed to load event data:', error);
            this.eventHistory = [];
            this.activeEvents = new Map();
        }
    }
    
    /**
     * データをリセット
     */
    reset() {
        this.eventHistory = [];
        this.activeEvents.clear();
        this.save();
    }
}