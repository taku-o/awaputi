/**
 * イベントステージ管理クラス
 */
export class EventStageManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.eventStages = this.initializeEventStages();
        this.activeEvents = new Map();
        this.eventHistory = [];
        
        // 季節イベント用定数
        this.SEASONAL_PERIODS = {
            spring: { 
                months: [3, 4, 5], 
                events: ['spring-cherry-blossom', 'spring-festival'] 
            },
            summer: { 
                months: [6, 7, 8], 
                events: ['summer-fireworks', 'summer-festival'] 
            },
            autumn: { 
                months: [9, 10, 11], 
                events: ['autumn-leaves', 'harvest-festival'] 
            },
            winter: { 
                months: [12, 1, 2], 
                events: ['winter-snow', 'new-year'] 
            }
        };
        
        // 定期的に季節イベントをチェック
        this.seasonalCheckInterval = null;
        this.notificationCheckInterval = null;
        this.startSeasonalEventChecking();
        this.startNotificationChecking();
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
            },
            
            // 季節イベント
            'spring-cherry-blossom': {
                id: 'spring-cherry-blossom',
                name: '桜の舞うステージ',
                description: '美しい桜が舞い散る春限定ステージ',
                icon: '🌸',
                type: 'seasonal',
                season: 'spring',
                duration: 300000,
                bubbleTypes: ['normal', 'pink', 'pink', 'rainbow', 'stone', 'golden'],
                spawnRate: 1.8,
                maxBubbles: 25,
                specialRules: {
                    cherryBlossomEffect: true,
                    windEffect: true,
                    scoreMultiplier: 1.5,
                    pinkBubbleBonus: 2.0
                },
                rewards: {
                    completion: { ap: 200 },
                    highScore: { threshold: 20000, ap: 300 },
                    perfect: { ap: 500, special: 'sakura_master' }
                },
                availability: {
                    type: 'seasonal',
                    season: 'spring',
                    autoActivate: true
                },
                notifications: {
                    onStart: true,
                    onEnd: true,
                    reminderInterval: 24 * 60 * 60 * 1000, // 24時間
                    endWarning: 7 * 24 * 60 * 60 * 1000 // 7日前
                }
            },
            
            'summer-fireworks': {
                id: 'summer-fireworks',
                name: '花火大会ステージ',
                description: '夜空に輝く花火と共に楽しむ夏限定ステージ',
                icon: '🎆',
                type: 'seasonal',
                season: 'summer',
                duration: 300000,
                bubbleTypes: ['normal', 'explosive', 'explosive', 'rainbow', 'golden', 'multiplier'],
                spawnRate: 2.2,
                maxBubbles: 30,
                specialRules: {
                    fireworksEffect: true,
                    nightSky: true,
                    explosionChainBonus: 2.0,
                    heatWaveSpeed: 1.2
                },
                rewards: {
                    completion: { ap: 250 },
                    fireworksMaster: { explosions: 10, ap: 400 }
                },
                availability: {
                    type: 'seasonal',
                    season: 'summer',
                    autoActivate: true
                },
                notifications: {
                    onStart: true,
                    onEnd: true,
                    reminderInterval: 24 * 60 * 60 * 1000,
                    endWarning: 7 * 24 * 60 * 60 * 1000
                }
            },
            
            'autumn-leaves': {
                id: 'autumn-leaves',
                name: '紅葉狩りステージ',
                description: '色とりどりの葉が舞う秋限定ステージ',
                icon: '🍁',
                type: 'seasonal',
                season: 'autumn',
                duration: 300000,
                bubbleTypes: ['normal', 'stone', 'iron', 'golden', 'clock', 'score'],
                spawnRate: 2.0,
                maxBubbles: 28,
                specialRules: {
                    autumnLeavesEffect: true,
                    windyWeather: true,
                    goldBubbleRate: 0.3,
                    timeSlowEffect: 0.8
                },
                rewards: {
                    completion: { ap: 220 },
                    collector: { golden: 20, ap: 350 }
                },
                availability: {
                    type: 'seasonal',
                    season: 'autumn',
                    autoActivate: true
                },
                notifications: {
                    onStart: true,
                    onEnd: true,
                    reminderInterval: 24 * 60 * 60 * 1000,
                    endWarning: 7 * 24 * 60 * 60 * 1000
                }
            },
            
            'winter-snow': {
                id: 'winter-snow',
                name: '雪景色ステージ',
                description: '静かに雪が降る冬限定ステージ',
                icon: '❄️',
                type: 'seasonal',
                season: 'winter',
                duration: 300000,
                bubbleTypes: ['normal', 'frozen', 'frozen', 'diamond', 'clock', 'boss'],
                spawnRate: 1.6,
                maxBubbles: 22,
                specialRules: {
                    snowEffect: true,
                    frozenBubbles: true,
                    slowMotion: 0.7,
                    freezeChain: true
                },
                rewards: {
                    completion: { ap: 240 },
                    iceBreaker: { frozen: 30, ap: 380 }
                },
                availability: {
                    type: 'seasonal',
                    season: 'winter',
                    autoActivate: true
                },
                notifications: {
                    onStart: true,
                    onEnd: true,
                    reminderInterval: 24 * 60 * 60 * 1000,
                    endWarning: 7 * 24 * 60 * 60 * 1000
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
        
        // 季節イベントの場合
        if (event.type === 'seasonal') {
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
    
    /**
     * 季節イベントの自動チェックを開始
     */
    startSeasonalEventChecking() {
        // 初回チェック
        this.scheduleSeasonalEvents();
        
        // 24時間ごとにチェック
        this.seasonalCheckInterval = setInterval(() => {
            this.scheduleSeasonalEvents();
        }, 24 * 60 * 60 * 1000);
    }
    
    /**
     * 季節イベントをスケジュール
     */
    scheduleSeasonalEvents() {
        const currentDate = new Date();
        const currentSeason = this.getCurrentSeason(currentDate);
        
        if (!currentSeason) return;
        
        // 現在の季節に対応するイベントを有効化
        const seasonalEvents = this.SEASONAL_PERIODS[currentSeason].events;
        
        seasonalEvents.forEach(eventId => {
            const event = this.eventStages[eventId];
            if (event && event.availability.autoActivate) {
                // 既に有効化されていない場合のみ有効化
                if (!this.activeEvents.has(eventId)) {
                    this.activateSeasonalEvent(eventId, currentSeason);
                }
            }
        });
        
        // 他の季節のイベントを無効化
        Object.keys(this.SEASONAL_PERIODS).forEach(season => {
            if (season !== currentSeason) {
                this.SEASONAL_PERIODS[season].events.forEach(eventId => {
                    if (this.activeEvents.has(eventId)) {
                        this.deactivateSeasonalEvent(eventId);
                    }
                });
            }
        });
    }
    
    /**
     * 現在の季節を取得
     */
    getCurrentSeason(date) {
        const month = date.getMonth() + 1; // 0-based to 1-based
        
        for (const [season, config] of Object.entries(this.SEASONAL_PERIODS)) {
            if (config.months.includes(month)) {
                return season;
            }
        }
        
        return null;
    }
    
    /**
     * 季節イベントの有効化チェック
     */
    checkSeasonalEventActivation(currentDate = new Date()) {
        const currentSeason = this.getCurrentSeason(currentDate);
        
        // 各季節イベントの状態をチェック
        Object.values(this.eventStages).forEach(event => {
            if (event.type === 'seasonal' && event.availability.autoActivate) {
                const shouldBeActive = event.season === currentSeason;
                const isActive = this.activeEvents.has(event.id);
                
                if (shouldBeActive && !isActive) {
                    this.activateSeasonalEvent(event.id, currentSeason);
                } else if (!shouldBeActive && isActive) {
                    this.deactivateSeasonalEvent(event.id);
                }
            }
        });
    }
    
    /**
     * 季節イベントを有効化
     */
    activateSeasonalEvent(eventId, season) {
        const event = this.eventStages[eventId];
        if (!event || event.type !== 'seasonal') return false;
        
        // 季節の終了日を計算
        const endDate = this.getSeasonEndDate(season);
        
        this.activeEvents.set(eventId, {
            startTime: Date.now(),
            endTime: endDate.getTime(),
            season: season,
            type: 'seasonal'
        });
        
        console.log(`Seasonal event activated: ${event.name} (${season})`);
        
        // 通知を送信
        this.sendEventNotification(eventId, 'EVENT_STARTED');
        
        return true;
    }
    
    /**
     * 季節イベントを無効化
     */
    deactivateSeasonalEvent(eventId) {
        const event = this.eventStages[eventId];
        if (!event || event.type !== 'seasonal') return false;
        
        this.activeEvents.delete(eventId);
        
        console.log(`Seasonal event deactivated: ${event.name}`);
        
        // 通知を送信
        this.sendEventNotification(eventId, 'EVENT_ENDED');
        
        return true;
    }
    
    /**
     * 季節の終了日を取得
     */
    getSeasonEndDate(season) {
        const now = new Date();
        const year = now.getFullYear();
        const seasonConfig = this.SEASONAL_PERIODS[season];
        
        // 季節の最後の月の最終日を取得
        const lastMonth = Math.max(...seasonConfig.months);
        
        // 冬の場合、年をまたぐ可能性を考慮
        let targetYear = year;
        if (season === 'winter' && now.getMonth() < 2) {
            // 1月か2月の場合、2月末が終了日
            targetYear = year;
        } else if (season === 'winter' && now.getMonth() >= 11) {
            // 12月の場合、翌年の2月末が終了日
            targetYear = year + 1;
        }
        
        // 月末日を取得（月は0-based）
        const endDate = new Date(targetYear, lastMonth, 0);
        endDate.setHours(23, 59, 59, 999);
        
        return endDate;
    }
    
    /**
     * 季節イベントの設定を取得
     */
    getSeasonalEventConfig(season) {
        const seasonalEvents = this.SEASONAL_PERIODS[season]?.events || [];
        const configs = [];
        
        seasonalEvents.forEach(eventId => {
            const event = this.eventStages[eventId];
            if (event) {
                configs.push({
                    ...event,
                    isActive: this.activeEvents.has(eventId),
                    timeRemaining: this.getEventTimeRemaining(event, Date.now())
                });
            }
        });
        
        return configs;
    }
    
    /**
     * イベント通知を送信
     */
    sendEventNotification(eventId, notificationType) {
        const event = this.eventStages[eventId];
        if (!event || !this.gameEngine.achievementNotificationSystem) {
            return false;
        }
        
        try {
            const notification = this.createEventNotification(eventId, notificationType);
            this.gameEngine.achievementNotificationSystem.queueNotification(notification);
            console.log(`Event notification sent: ${notificationType} for ${event.name}`);
            return true;
        } catch (error) {
            console.warn('Event notification failed:', error);
            return false;
        }
    }
    
    /**
     * イベント通知オブジェクトを作成
     */
    createEventNotification(eventId, notificationType) {
        const event = this.eventStages[eventId];
        if (!event) throw new Error(`Event ${eventId} not found`);
        
        const baseNotification = {
            id: `event_${eventId}_${notificationType}_${Date.now()}`,
            type: 'event',
            subType: notificationType,
            eventId: eventId,
            timestamp: Date.now()
        };
        
        switch (notificationType) {
            case 'EVENT_STARTED':
                return {
                    ...baseNotification,
                    name: `${event.name}開始！`,
                    description: `${event.description}`,
                    icon: event.icon,
                    reward: null,
                    duration: 4000,
                    actions: ['参加する', '後で']
                };
                
            case 'EVENT_ENDED':
                return {
                    ...baseNotification,
                    name: `${event.name}終了`,
                    description: `${event.name}が終了しました`,
                    icon: '⏰',
                    reward: null,
                    duration: 3000
                };
                
            case 'EVENT_ENDING':
                const timeRemaining = this.getEventTimeRemaining(event, Date.now());
                const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));
                return {
                    ...baseNotification,
                    name: `${event.name}まもなく終了`,
                    description: `あと${hoursRemaining}時間で終了します`,
                    icon: '⚠️',
                    reward: null,
                    duration: 5000,
                    actions: ['今すぐ参加', '閉じる']
                };
                
            case 'EVENT_ELIGIBLE':
                return {
                    ...baseNotification,
                    name: `参加条件達成！`,
                    description: `${event.name}に参加できます`,
                    icon: '✅',
                    reward: null,
                    duration: 4000,
                    actions: ['参加する', '後で']
                };
                
            case 'EVENT_REMINDER':
                return {
                    ...baseNotification,
                    name: `イベント参加お忘れなく`,
                    description: `${event.name}がまだ利用可能です`,
                    icon: '🔔',
                    reward: null,
                    duration: 3000,
                    actions: ['参加する', '閉じる']
                };
                
            default:
                throw new Error(`Unknown notification type: ${notificationType}`);
        }
    }
    
    /**
     * イベント通知をチェック
     */
    checkEventNotifications() {
        const now = Date.now();
        
        // 終了予告通知をチェック
        this.activeEvents.forEach((eventData, eventId) => {
            const event = this.eventStages[eventId];
            if (!event || !event.notifications) return;
            
            const timeRemaining = eventData.endTime - now;
            const warningThreshold = event.notifications.endWarning || 24 * 60 * 60 * 1000; // デフォルト24時間前
            
            // 終了警告通知
            if (timeRemaining <= warningThreshold && timeRemaining > 0) {
                const lastWarning = eventData.lastWarningNotification || 0;
                const warningInterval = 12 * 60 * 60 * 1000; // 12時間ごと
                
                if (now - lastWarning >= warningInterval) {
                    this.sendEventNotification(eventId, 'EVENT_ENDING');
                    eventData.lastWarningNotification = now;
                }
            }
        });
        
        // リマインダー通知をチェック
        this.activeEvents.forEach((eventData, eventId) => {
            const event = this.eventStages[eventId];
            if (!event || !event.notifications) return;
            
            const reminderInterval = event.notifications.reminderInterval || 24 * 60 * 60 * 1000; // デフォルト24時間
            const lastReminder = eventData.lastReminderNotification || eventData.startTime;
            
            if (now - lastReminder >= reminderInterval) {
                // プレイヤーがまだ参加していない場合のみ
                const hasParticipated = this.eventHistory.some(entry => 
                    entry.eventId === eventId && 
                    entry.startTime >= eventData.startTime
                );
                
                if (!hasParticipated) {
                    this.sendEventNotification(eventId, 'EVENT_REMINDER');
                    eventData.lastReminderNotification = now;
                }
            }
        });
    }
    
    /**
     * 通知設定を更新
     */
    updateNotificationSettings(eventId, settings) {
        const event = this.eventStages[eventId];
        if (!event) return false;
        
        event.notifications = {
            ...event.notifications,
            ...settings
        };
        
        return true;
    }
    
    /**
     * 通知チェックを開始
     */
    startNotificationChecking() {
        // 初回チェック
        this.checkEventNotifications();
        
        // 1時間ごとに通知をチェック
        this.notificationCheckInterval = setInterval(() => {
            this.checkEventNotifications();
        }, 60 * 60 * 1000);
    }
    
    /**
     * クリーンアップ処理
     */
    cleanup() {
        if (this.seasonalCheckInterval) {
            clearInterval(this.seasonalCheckInterval);
            this.seasonalCheckInterval = null;
        }
        
        if (this.notificationCheckInterval) {
            clearInterval(this.notificationCheckInterval);
            this.notificationCheckInterval = null;
        }
    }
}