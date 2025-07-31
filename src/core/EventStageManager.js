/**
 * イベントステージ管理クラス
 */
import { EventRankingManager } from './EventRankingManager.js';

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
        
        // ランキングシステムを初期化
        this.eventRankingManager = null; // 遅延初期化
        
        // 定期的に季節イベントをチェック
        this.seasonalCheckInterval = null;
        this.notificationCheckInterval = null;
        this.startSeasonalEventChecking();
        this.startNotificationChecking();
    }
    /**
     * EventRankingManagerを遅延初期化
     */
    initializeRankingManager() {
        if (!this.eventRankingManager) {
            this.eventRankingManager = new EventRankingManager(this.gameEngine);
        }
        return this.eventRankingManager;
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
                    fastSpawn: true,
                    timeAttack: true,
                    timeBonusMultiplier: 2.5,
                    spawnRateMultiplier: 2.0
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
                    increasingDifficulty: true,
                    survivalMode: true,
                    difficultyIncreaseRate: 0.08,
                    damageOverTime: false
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
                    specialEffects: true,
                    anniversaryBonus: 2.5,
                    specialRewards: {
                        multiplier: 3.0,
                        bonusItems: ['anniversary_badge', 'golden_crown'],
                        rarityBoost: 2.0
                    }
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
                    timeSlowEffect: 0.8,
                    harvestBonus: 1.8
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
                    frozenBubblesEffect: true,
                    slowMotion: 0.7,
                    freezeChain: true,
                    crystalBonus: 2.0,
                    coldEffect: true
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
        
        // 季節イベント特別ルール
        this.applySeasonalEffects(event, specialRules);
        
        // 特別イベント特別ルール
        this.applySpecialEventEffects(event, specialRules);
    }

    /**
     * 季節イベントの特別効果を適用
     */
    applySeasonalEffects(event, specialRules) {
        if (event.type !== 'seasonal') return;
        
        switch (event.season) {
            case 'spring':
                this.applySpringEffects(specialRules);
                break;
            case 'summer':
                this.applySummerEffects(specialRules);
                break;
            case 'autumn':
                this.applyAutumnEffects(specialRules);
                break;
            case 'winter':
                this.applyWinterEffects(specialRules);
                break;
        }
    }
    
    /**
     * 春の特別効果を適用（桜エフェクト、風エフェクト）
     */
    applySpringEffects(specialRules) {
        // 桜エフェクト
        if (specialRules.cherryBlossomEffect) {
            // パーティクルエフェクトマネージャーに桜の花びらエフェクトを追加
            if (this.gameEngine.particleManager) {
                this.gameEngine.particleManager.addSeasonalEffect('cherryBlossom', {
                    particleCount: 20,
                    fallSpeed: 1.5,
                    color: '#FFB6C1',
                    size: 8,
                    opacity: 0.7,
                    windEffect: true
                });
            }
            
            // 背景色を春らしい色調に変更
            if (this.gameEngine.renderer) {
                this.gameEngine.renderer.setSeasonalBackground('spring', {
                    primaryColor: '#E6F3FF',
                    secondaryColor: '#FFE4E6',
                    gradientDirection: 'vertical'
                });
            }
        }
        
        // 風エフェクト
        if (specialRules.windEffect) {
            // 泡の動きに風の影響を追加
            if (this.gameEngine.bubbleManager) {
                this.gameEngine.bubbleManager.enableWindEffect({
                    strength: 0.8,
                    direction: Math.PI / 6, // 30度
                    variability: 0.3
                });
            }
        }
        
        // ピンク泡ボーナス
        if (specialRules.pinkBubbleBonus) {
            if (this.gameEngine.scoreManager) {
                this.gameEngine.scoreManager.setSpecialBubbleMultiplier('pink', specialRules.pinkBubbleBonus);
            }
        }
    }
    
    /**
     * 夏の特別効果を適用（花火エフェクト、熱波）
     */
    applySummerEffects(specialRules) {
        // 花火エフェクト
        if (specialRules.fireworksEffect) {
            // 花火パーティクルエフェクト
            if (this.gameEngine.particleManager) {
                this.gameEngine.particleManager.addSeasonalEffect('fireworks', {
                    frequency: 3000, // 3秒ごと
                    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
                    explosionSize: 50,
                    sparkleCount: 15,
                    duration: 2000
                });
            }
            
            // 夜空背景
            if (this.gameEngine.renderer) {
                this.gameEngine.renderer.setSeasonalBackground('summer', {
                    primaryColor: '#0F0F23',
                    secondaryColor: '#1A1A3A',
                    stars: true,
                    gradientDirection: 'radial'
                });
            }
        }
        
        // 熱波効果（スピード上昇）
        if (specialRules.heatWaveSpeed) {
            if (this.gameEngine.bubbleManager) {
                this.gameEngine.bubbleManager.setGlobalSpeedMultiplier(specialRules.heatWaveSpeed);
            }
        }
        
        // 爆発連鎖ボーナス
        if (specialRules.explosionChainBonus) {
            if (this.gameEngine.scoreManager) {
                this.gameEngine.scoreManager.setChainExplosionMultiplier(specialRules.explosionChainBonus);
            }
        }
    }
    
    /**
     * 秋の特別効果を適用（紅葉エフェクト、風の天候）
     */
    applyAutumnEffects(specialRules) {
        // 紅葉エフェクト
        if (specialRules.autumnLeavesEffect) {
            // 落ち葉パーティクルエフェクト
            if (this.gameEngine.particleManager) {
                this.gameEngine.particleManager.addSeasonalEffect('autumnLeaves', {
                    particleCount: 25,
                    fallSpeed: 2.0,
                    colors: ['#D2691E', '#CD853F', '#B22222', '#FF8C00', '#DAA520'],
                    size: 12,
                    rotation: true,
                    windEffect: true
                });
            }
            
            // 秋の背景色
            if (this.gameEngine.renderer) {
                this.gameEngine.renderer.setSeasonalBackground('autumn', {
                    primaryColor: '#FFF8DC',
                    secondaryColor: '#F4A460',
                    gradientDirection: 'diagonal'
                });
            }
        }
        
        // 風の強い天候
        if (specialRules.windyWeather) {
            if (this.gameEngine.bubbleManager) {
                this.gameEngine.bubbleManager.enableWindEffect({
                    strength: 1.5, // 春より強い風
                    direction: Math.PI / 4, // 45度
                    variability: 0.6,
                    gusty: true // 突風効果
                });
            }
        }
        
        // 収穫ボーナス（ゴールデン泡追加スコア）
        if (specialRules.harvestBonus) {
            if (this.gameEngine.scoreManager) {
                this.gameEngine.scoreManager.setSpecialBubbleMultiplier('golden', specialRules.harvestBonus);
            }
        }
    }
    
    /**
     * 冬の特別効果を適用（雪エフェクト、凍結泡）
     */
    applyWinterEffects(specialRules) {
        // 雪エフェクト
        if (specialRules.snowEffect) {
            // 雪のパーティクルエフェクト
            if (this.gameEngine.particleManager) {
                this.gameEngine.particleManager.addSeasonalEffect('snow', {
                    particleCount: 30,
                    fallSpeed: 1.0,
                    color: '#FFFFFF',
                    size: 6,
                    opacity: 0.8,
                    swayEffect: true
                });
            }
            
            // 冬の背景色
            if (this.gameEngine.renderer) {
                this.gameEngine.renderer.setSeasonalBackground('winter', {
                    primaryColor: '#F0F8FF',
                    secondaryColor: '#E0EEEE',
                    frost: true,
                    gradientDirection: 'vertical'
                });
            }
        }
        
        // 凍結泡効果
        if (specialRules.frozenBubblesEffect) {
            if (this.gameEngine.bubbleManager) {
                this.gameEngine.bubbleManager.setSpecialSpawnRate('frozen', 0.3);
                this.gameEngine.bubbleManager.enableFrozenBubbleSlowdown(0.7); // 30%スピードダウン
            }
        }
        
        // 氷の結晶ボーナス
        if (specialRules.crystalBonus) {
            if (this.gameEngine.scoreManager) {
                this.gameEngine.scoreManager.setSpecialBubbleMultiplier('frozen', specialRules.crystalBonus);
            }
        }
        
        // 寒さ効果（全体的な動作の軽微な遅延）
        if (specialRules.coldEffect) {
            if (this.gameEngine.bubbleManager) {
                this.gameEngine.bubbleManager.setGlobalSpeedMultiplier(0.9); // 10%スピードダウン
            }
        }
    }

    /**
     * 特別イベントの特別効果を適用
     */
    applySpecialEventEffects(event, specialRules) {
        switch (event.type) {
            case 'special':
                this.applySpecialEventRules(event, specialRules);
                break;
            case 'challenge':
                this.applyChallengeEventRules(event, specialRules);
                break;
            case 'collaboration':
                this.applyCollaborationEventRules(event, specialRules);
                break;
            case 'community':
                this.applyCommunityEventRules(event, specialRules);
                break;
        }
    }
    
    /**
     * 記念日・特別イベントのルールを適用
     */
    applySpecialEventRules(event, specialRules) {
        // アニバーサリーボーナス
        if (specialRules.anniversaryBonus) {
            // 全ての泡にボーナススコア適用
            if (this.gameEngine.scoreManager) {
                this.gameEngine.scoreManager.setGlobalScoreMultiplier(specialRules.anniversaryBonus);
            }
            
            // 特別な視覚効果
            if (this.gameEngine.particleManager) {
                this.gameEngine.particleManager.addSeasonalEffect('celebration', {
                    particleCount: 35,
                    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
                    sparkleEffect: true,
                    confettiMode: true,
                    duration: event.duration
                });
            }
        }
        
        // 特別報酬
        if (specialRules.specialRewards) {
            // アニバーサリーイベントなどで特別な報酬を設定
            this.activateSpecialRewardMode(event.id, specialRules.specialRewards);
        }
        
        // 全泡種類利用可能
        if (specialRules.allBubblesAvailable) {
            if (this.gameEngine.bubbleManager) {
                this.gameEngine.bubbleManager.enableAllBubbleTypes();
            }
        }
        
        // 特別エフェクト
        if (specialRules.specialEffects) {
            this.enableSpecialVisualEffects(event);
        }
        
        // ボーナス報酬モード
        if (specialRules.bonusRewards) {
            this.activateBonusRewardMode(event.id);
        }
    }
    
    /**
     * チャレンジイベントのルールを適用
     */
    applyChallengeEventRules(event, specialRules) {
        // タイムアタック
        if (specialRules.timeAttack) {
            // 厳格な時間制限を設定
            if (this.gameEngine.gameScene) {
                this.gameEngine.gameScene.setStrictTimeLimit(specialRules.timeLimit || event.duration);
                this.gameEngine.gameScene.enableTimeAttackMode();
            }
            
            // 時間に応じたスコアボーナス
            if (this.gameEngine.scoreManager) {
                this.gameEngine.scoreManager.enableTimeBonus(specialRules.timeBonusMultiplier || 2.0);
            }
        }
        
        // サバイバルモード
        if (specialRules.survivalMode) {
            // 継続的なダメージまたは難易度増加
            if (this.gameEngine.bubbleManager) {
                this.gameEngine.bubbleManager.enableSurvivalMode({
                    difficultyIncreaseRate: specialRules.difficultyIncreaseRate || 0.1,
                    damageOverTime: specialRules.damageOverTime || false
                });
            }
            
            // サバイバル専用UI
            if (this.gameEngine.uiManager) {
                this.gameEngine.uiManager.enableSurvivalUI();
            }
        }
        
        // 高速スポーン
        if (specialRules.fastSpawn) {
            if (this.gameEngine.bubbleManager) {
                this.gameEngine.bubbleManager.setGlobalSpawnRateMultiplier(
                    specialRules.spawnRateMultiplier || 2.0
                );
            }
        }
        
        // 目標泡数
        if (specialRules.targetBubbles) {
            if (this.gameEngine.gameScene) {
                this.gameEngine.gameScene.setTargetBubbleCount(specialRules.targetBubbles);
            }
        }
        
        // 難易度増加
        if (specialRules.increasingDifficulty) {
            this.activateIncreasingSurvivalDifficulty(event.id);
        }
    }
    
    /**
     * コラボレーションイベントのルールを適用
     */
    applyCollaborationEventRules(event, specialRules) {
        // コラボテーマ
        if (specialRules.collaborationTheme) {
            // 特別なテーマ背景と音楽
            if (this.gameEngine.renderer) {
                this.gameEngine.renderer.setCollaborationTheme(specialRules.collaborationTheme);
            }
            
            if (this.gameEngine.audioManager) {
                this.gameEngine.audioManager.setCollaborationMusic(specialRules.collaborationTheme);
            }
        }
        
        // 限定コンテンツ
        if (specialRules.exclusiveContent) {
            // 限定泡タイプや特別アイテム
            if (this.gameEngine.bubbleManager) {
                this.gameEngine.bubbleManager.enableExclusiveContent(specialRules.exclusiveContent);
            }
            
            // 限定UI要素
            if (this.gameEngine.uiManager) {
                this.gameEngine.uiManager.enableCollaborationUI(specialRules.exclusiveContent);
            }
        }
        
        // 特別キャラクター
        if (specialRules.specialCharacters) {
            this.activateSpecialCharacters(specialRules.specialCharacters);
        }
        
        // コラボ限定エフェクト
        if (specialRules.collaborationEffects) {
            if (this.gameEngine.particleManager) {
                this.gameEngine.particleManager.addCollaborationEffects(
                    specialRules.collaborationEffects
                );
            }
        }
    }
    
    /**
     * コミュニティイベントのルールを適用
     */
    applyCommunityEventRules(event, specialRules) {
        // コミュニティ目標
        if (specialRules.communityGoals) {
            // グローバル進捗追跡
            this.initializeCommunityGoals(event.id, specialRules.communityGoals);
            
            // 進捗表示UI
            if (this.gameEngine.uiManager) {
                this.gameEngine.uiManager.enableCommunityProgressUI(specialRules.communityGoals);
            }
        }
        
        // 共有報酬
        if (specialRules.sharedRewards) {
            // 参加者全員への報酬システム
            this.initializeSharedRewardSystem(event.id, specialRules.sharedRewards);
        }
        
        // 協力モード
        if (specialRules.cooperativeMode) {
            this.enableCooperativeMode(event.id, specialRules.cooperativeMode);
        }
        
        // リアルタイム統計
        if (specialRules.realTimeStats) {
            this.enableRealTimeStatistics(event.id);
        }
        
        // コミュニティチャット（将来実装）
        if (specialRules.communityChat) {
            // プレースホルダー：将来のチャット機能
            console.log('Community chat feature will be implemented in future versions');
        }
    }

    /**
     * 特別報酬モードを有効化
     */
    activateSpecialRewardMode(eventId, rewardConfig) {
        this.specialRewardModes = this.specialRewardModes || {};
        this.specialRewardModes[eventId] = {
            multiplier: rewardConfig.multiplier || 2.0,
            bonusItems: rewardConfig.bonusItems || [],
            rarityBoost: rewardConfig.rarityBoost || 1.5,
            startTime: Date.now()
        };
    }
    
    /**
     * 特別視覚効果を有効化
     */
    enableSpecialVisualEffects(event) {
        if (this.gameEngine.particleManager) {
            this.gameEngine.particleManager.addSeasonalEffect('special', {
                particleCount: 25,
                colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1'],
                glowEffect: true,
                rotationSpeed: 2.0,
                duration: event.duration
            });
        }
        
        if (this.gameEngine.renderer) {
            this.gameEngine.renderer.enableSpecialEffects(event.id);
        }
    }
    
    /**
     * ボーナス報酬モードを有効化
     */
    activateBonusRewardMode(eventId) {
        this.bonusRewardModes = this.bonusRewardModes || {};
        this.bonusRewardModes[eventId] = {
            apMultiplier: 1.5,
            itemDropRate: 2.0,
            rareItemChance: 0.25,
            startTime: Date.now()
        };
    }
    
    /**
     * 増加するサバイバル難易度を有効化
     */
    activateIncreasingSurvivalDifficulty(eventId) {
        this.survivalDifficultyModes = this.survivalDifficultyModes || {};
        this.survivalDifficultyModes[eventId] = {
            initialDifficulty: 1.0,
            increaseRate: 0.05, // 5%ずつ増加
            maxDifficulty: 3.0,
            intervalMs: 30000, // 30秒ごと
            startTime: Date.now()
        };
        
        // 難易度増加タイマーを開始
        const difficultyTimer = setInterval(() => {
            const mode = this.survivalDifficultyModes[eventId];
            if (!mode) {
                clearInterval(difficultyTimer);
                return;
            }
            
            mode.initialDifficulty = Math.min(
                mode.initialDifficulty + mode.increaseRate,
                mode.maxDifficulty
            );
            
            // バブルマネージャーに難易度を適用
            if (this.gameEngine.bubbleManager) {
                this.gameEngine.bubbleManager.setDifficultyMultiplier(mode.initialDifficulty);
            }
        }, this.survivalDifficultyModes[eventId].intervalMs);
    }
    
    /**
     * 特別キャラクターを有効化
     */
    activateSpecialCharacters(characters) {
        if (this.gameEngine.characterManager) {
            characters.forEach(character => {
                this.gameEngine.characterManager.activateSpecialCharacter(character);
            });
        }
    }
    
    /**
     * コミュニティ目標を初期化
     */
    initializeCommunityGoals(eventId, goals) {
        this.communityGoals = this.communityGoals || {};
        this.communityGoals[eventId] = {
            goals: goals.map(goal => ({
                ...goal,
                currentProgress: 0,
                completed: false
            })),
            totalParticipants: 0,
            startTime: Date.now()
        };
    }
    
    /**
     * 共有報酬システムを初期化
     */
    initializeSharedRewardSystem(eventId, rewardConfig) {
        this.sharedRewardSystems = this.sharedRewardSystems || {};
        this.sharedRewardSystems[eventId] = {
            baseReward: rewardConfig.baseReward || { ap: 100 },
            participationBonus: rewardConfig.participationBonus || { ap: 50 },
            milestoneRewards: rewardConfig.milestoneRewards || [],
            distributionSchedule: rewardConfig.distributionSchedule || 'immediate'
        };
    }
    
    /**
     * 協力モードを有効化
     */
    enableCooperativeMode(eventId, config) {
        this.cooperativeModes = this.cooperativeModes || {};
        this.cooperativeModes[eventId] = {
            maxPlayers: config.maxPlayers || 10,
            sharedScore: config.sharedScore || false,
            teamBuffs: config.teamBuffs || [],
            communicationEnabled: config.communicationEnabled || false
        };
    }
    
    /**
     * リアルタイム統計を有効化
     */
    enableRealTimeStatistics(eventId) {
        this.realTimeStats = this.realTimeStats || {};
        this.realTimeStats[eventId] = {
            participantCount: 0,
            averageScore: 0,
            topScores: [],
            completionRate: 0,
            updateInterval: 5000 // 5秒ごと更新
        };
        
        // 統計更新タイマーを開始
        const statsTimer = setInterval(() => {
            this.updateRealTimeStatistics(eventId);
        }, this.realTimeStats[eventId].updateInterval);
        
        // イベント終了時にタイマーをクリア
        setTimeout(() => {
            clearInterval(statsTimer);
        }, this.eventStages[eventId]?.duration || 300000);
    }
    
    /**
     * リアルタイム統計を更新
     */
    updateRealTimeStatistics(eventId) {
        if (!this.realTimeStats[eventId]) return;
        
        const eventStats = this.getDetailedEventStatistics().events[eventId];
        if (eventStats) {
            this.realTimeStats[eventId].participantCount = eventStats.totalParticipations;
            this.realTimeStats[eventId].averageScore = eventStats.averageScore;
            this.realTimeStats[eventId].completionRate = eventStats.completionRate;
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
        
        // ランキングを更新
        const rankingManager = this.initializeRankingManager();
        const playerId = this.gameEngine.playerData.getPlayerId();
        rankingManager.updateEventRanking(eventId, playerId, finalScore, stats);
        
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
     * イベントランキングを取得
     */
    getEventRanking(eventId, limit = 10, offset = 0) {
        const rankingManager = this.initializeRankingManager();
        return rankingManager.getEventLeaderboard(eventId, limit, offset);
    }
    
    /**
     * プレイヤーのイベントランキング情報を取得
     */
    getPlayerEventRanking(eventId, playerId = null) {
        const rankingManager = this.initializeRankingManager();
        const actualPlayerId = playerId || this.gameEngine.playerData.getPlayerId();
        return rankingManager.getPlayerEventRanking(actualPlayerId, eventId);
    }
    
    /**
     * イベント終了時にランキング報酬を配布
     */
    distributeEventRankingRewards(eventId) {
        const rankingManager = this.initializeRankingManager();
        return rankingManager.distributeRankingRewards(eventId);
    }
    
    /**
     * 全アクティブイベントのランキング報酬を配布
     */
    distributeAllRankingRewards() {
        const rankingManager = this.initializeRankingManager();
        let distributedCount = 0;
        
        Object.keys(this.eventStages).forEach(eventId => {
            if (!this.isEventAvailable(eventId)) {
                // 終了したイベントの報酬配布
                if (rankingManager.distributeRankingRewards(eventId)) {
                    distributedCount++;
                }
            }
        });
        
        console.log(`Ranking rewards distributed for ${distributedCount} events`);
        return distributedCount;
    }
    
    /**
     * イベント報酬を付与
     */
    grantEventRewards(event, finalScore, stats) {
        const rewards = event.rewards || {};
        const eventBonus = this.calculateEventBonus(event, finalScore, stats);
        let totalAP = 0;
        let grantedItems = [];
        let specialRewards = [];
        
        // 基本参加報酬
        if (rewards.participation) {
            totalAP += rewards.participation.ap || 0;
            if (rewards.participation.items) {
                grantedItems.push(...rewards.participation.items);
            }
        }
        
        // 完了報酬
        if (rewards.completion && stats.completed) {
            const completionAP = rewards.completion.ap || 0;
            totalAP += Math.floor(completionAP * eventBonus.completionMultiplier);
            
            if (rewards.completion.items) {
                grantedItems.push(...rewards.completion.items);
            }
        }
        
        // ハイスコア報酬
        if (rewards.highScore && finalScore >= rewards.highScore.threshold) {
            const highScoreAP = rewards.highScore.ap || 0;
            totalAP += Math.floor(highScoreAP * eventBonus.scoreMultiplier);
            
            if (rewards.highScore.items) {
                grantedItems.push(...rewards.highScore.items);
            }
        }
        
        // パフォーマンス依存報酬
        this.grantPerformanceRewards(rewards, stats, eventBonus, (ap, items) => {
            totalAP += ap;
            if (items) grantedItems.push(...items);
        });
        
        // 季節・特別イベント限定報酬
        this.grantSeasonalSpecialRewards(event, eventBonus, (ap, items, special) => {
            totalAP += ap;
            if (items) grantedItems.push(...items);
            if (special) specialRewards.push(...special);
        });
        
        // イベント固有の実績報酬
        const achievementRewards = this.trackEventAchievements(event.id, finalScore, stats);
        totalAP += achievementRewards.ap;
        grantedItems.push(...achievementRewards.items);
        specialRewards.push(...achievementRewards.special);
        
        // 特別報酬モードのボーナス
        if (this.specialRewardModes && this.specialRewardModes[event.id]) {
            const mode = this.specialRewardModes[event.id];
            totalAP = Math.floor(totalAP * mode.multiplier);
            grantedItems.push(...(mode.bonusItems || []));
        }
        
        // ボーナス報酬モードのボーナス
        if (this.bonusRewardModes && this.bonusRewardModes[event.id]) {
            const mode = this.bonusRewardModes[event.id];
            totalAP = Math.floor(totalAP * mode.apMultiplier);
            
            // レアアイテム抽選
            if (Math.random() < mode.rareItemChance) {
                const rareItems = this.getRareEventItems(event.type, event.season);
                grantedItems.push(...rareItems);
            }
        }
        
        // 報酬を実際に付与
        this.applyRewards(totalAP, grantedItems, specialRewards, event);
        
        // 報酬付与の記録
        this.recordRewardGrant(event.id, {
            ap: totalAP,
            items: grantedItems,
            special: specialRewards,
            timestamp: Date.now(),
            finalScore,
            stats
        });
        
        return {
            ap: totalAP,
            items: grantedItems,
            special: specialRewards,
            bonus: eventBonus
        };
    }

    /**
     * イベント固有のボーナス計算
     */
    calculateEventBonus(event, finalScore, stats) {
        const bonus = {
            completionMultiplier: 1.0,
            scoreMultiplier: 1.0,
            timeMultiplier: 1.0,
            performanceMultiplier: 1.0,
            seasonalMultiplier: 1.0,
            rarityMultiplier: 1.0
        };
        
        // イベントタイプ別ボーナス
        switch (event.type) {
            case 'seasonal':
                bonus.seasonalMultiplier = this.calculateSeasonalBonus(event.season);
                break;
            case 'special':
                bonus.rarityMultiplier = 1.5; // 特別イベントは希少性ボーナス
                break;
            case 'challenge':
                bonus.performanceMultiplier = this.calculateChallengeBonus(event, stats);
                break;
            case 'limited_time':
                bonus.timeMultiplier = this.calculateTimeLimitedBonus(event);
                break;
        }
        
        // スコア依存ボーナス
        if (event.rewards?.highScore) {
            const threshold = event.rewards.highScore.threshold;
            if (finalScore > threshold * 1.5) {
                bonus.scoreMultiplier = 2.0; // 期待値の150%超で2倍
            } else if (finalScore > threshold * 1.2) {
                bonus.scoreMultiplier = 1.5; // 期待値の120%超で1.5倍
            }
        }
        
        // 完了時間によるボーナス
        if (stats.timeRemaining && event.duration) {
            const remainingRatio = stats.timeRemaining / event.duration;
            if (remainingRatio > 0.5) {
                bonus.timeMultiplier = 1.3; // 時間の半分以上残してクリア
            } else if (remainingRatio > 0.2) {
                bonus.timeMultiplier = 1.1; // 時間の20%以上残してクリア
            }
        }
        
        // 特殊パフォーマンスボーナス
        if (stats.perfectRun) bonus.performanceMultiplier *= 1.5;
        if (stats.noHitRun) bonus.performanceMultiplier *= 1.3;
        if (stats.maxChain > 10) bonus.performanceMultiplier *= (1 + (stats.maxChain - 10) * 0.1);
        
        return bonus;
    }
    
    /**
     * 季節ボーナスを計算
     */
    calculateSeasonalBonus(season) {
        const currentSeason = this.getCurrentSeason();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        
        // 実際の季節と一致している場合にボーナス
        if (season === currentSeason) {
            return 1.4; // 季節一致ボーナス
        }
        
        // 特別な期間のボーナス
        if (season === 'winter' && (currentMonth === 12 || currentMonth === 1)) {
            return 1.6; // 年末年始ボーナス
        }
        
        if (season === 'spring' && currentMonth === 4) {
            return 1.5; // 桜シーズンボーナス
        }
        
        return 1.2; // 季節イベント基本ボーナス
    }
    
    /**
     * チャレンジボーナスを計算
     */
    calculateChallengeBonus(event, stats) {
        let multiplier = 1.0;
        
        // チャレンジ固有の条件達成ボーナス
        const specialRules = event.specialRules || {};
        
        if (specialRules.targetBubbles && stats.bubblesPopped >= specialRules.targetBubbles) {
            multiplier *= 1.5; // 目標達成ボーナス
        }
        
        if (specialRules.survivalMode && stats.survived) {
            multiplier *= 2.0; // サバイバル成功ボーナス
        }
        
        if (specialRules.timeAttack && stats.timeRemaining > 0) {
            const efficiency = stats.timeRemaining / event.duration;
            multiplier *= (1 + efficiency); // 時間効率ボーナス
        }
        
        // 難易度に応じたボーナス
        if (stats.difficulty > 1.0) {
            multiplier *= stats.difficulty;
        }
        
        return multiplier;
    }
    
    /**
     * 期間限定ボーナスを計算
     */
    calculateTimeLimitedBonus(event) {
        const now = Date.now();
        const startTime = event.availability?.activatedAt || now;
        const duration = event.availability?.duration || (7 * 24 * 60 * 60 * 1000); // デフォルト1週間
        
        const elapsed = now - startTime;
        const remaining = duration - elapsed;
        
        if (remaining < 24 * 60 * 60 * 1000) { // 残り24時間未満
            return 1.8; // ラストチャンスボーナス
        } else if (remaining < 3 * 24 * 60 * 60 * 1000) { // 残り3日未満
            return 1.4; // 終了間近ボーナス
        } else if (elapsed < 24 * 60 * 60 * 1000) { // 開始24時間以内
            return 1.3; // 早期参加ボーナス
        }
        
        return 1.1; // 基本期間限定ボーナス
    }

    /**
     * イベント実績の追跡
     */
    trackEventAchievements(eventId, finalScore, stats) {
        const rewards = {
            ap: 0,
            items: [],
            special: []
        };
        
        // イベント実績定義
        const eventAchievements = this.getEventAchievements(eventId);
        const completedAchievements = [];
        
        eventAchievements.forEach(achievement => {
            if (this.checkEventAchievementCompleted(achievement, finalScore, stats)) {
                completedAchievements.push(achievement);
                rewards.ap += achievement.reward.ap || 0;
                
                if (achievement.reward.items) {
                    rewards.items.push(...achievement.reward.items);
                }
                
                if (achievement.reward.special) {
                    rewards.special.push(achievement.reward.special);
                }
                
                // 通知システムに実績解除を通知
                if (this.gameEngine.achievementNotificationSystem) {
                    this.gameEngine.achievementNotificationSystem.queueNotification({
                        type: 'achievement',
                        title: '実績解除！',
                        message: achievement.name,
                        icon: achievement.icon || '🏆',
                        duration: 4000
                    });
                }
            }
        });
        
        // 実績データを永続化
        if (completedAchievements.length > 0) {
            this.saveEventAchievements(eventId, completedAchievements);
        }
        
        return rewards;
    }
    
    /**
     * イベント固有の実績定義を取得
     */
    getEventAchievements(eventId) {
        const event = this.eventStages[eventId];
        if (!event) return [];
        
        const achievements = [];
        
        // イベントタイプ別実績
        switch (event.type) {
            case 'seasonal':
                achievements.push(...this.getSeasonalAchievements(event.season));
                break;
            case 'challenge':
                achievements.push(...this.getChallengeAchievements(eventId));
                break;
            case 'special':
                achievements.push(...this.getSpecialEventAchievements(eventId));
                break;
            case 'limited_time':
                achievements.push(...this.getLimitedTimeAchievements(eventId));
                break;
        }
        
        // 共通イベント実績
        achievements.push(
            {
                id: `${eventId}_first_clear`,
                name: `${event.name}初回クリア`,
                description: `${event.name}を初めてクリアしました`,
                icon: '🎉',
                condition: 'first_completion',
                reward: { ap: 100, items: [`${eventId}_first_clear_badge`] }
            },
            {
                id: `${eventId}_perfect_score`,
                name: `${event.name}完璧な成績`,
                description: `${event.name}で期待スコアの200%を達成`,
                icon: '💎',
                condition: 'score_ratio_200',
                reward: { ap: 300, special: `${eventId}_perfect_trophy` }
            },
            {
                id: `${eventId}_speed_clear`,
                name: `${event.name}高速クリア`,
                description: `${event.name}を時間の70%以上残してクリア`,
                icon: '⚡',
                condition: 'fast_completion',
                reward: { ap: 200, items: [`${eventId}_speed_badge`] }
            }
        );
        
        return achievements;
    }
    
    /**
     * 季節イベント実績を取得
     */
    getSeasonalAchievements(season) {
        const achievements = [];
        
        switch (season) {
            case 'spring':
                achievements.push(
                    {
                        id: 'spring_cherry_master',
                        name: '桜の達人',
                        description: '春イベントでピンク泡を50個破壊',
                        icon: '🌸',
                        condition: 'pink_bubbles_50',
                        reward: { ap: 150, items: ['cherry_crown'] }
                    }
                );
                break;
            case 'summer':
                achievements.push(
                    {
                        id: 'summer_fireworks_master',
                        name: '花火の芸術家',
                        description: '夏イベントで爆発連鎖を10回達成',
                        icon: '🎆',
                        condition: 'explosion_chains_10',
                        reward: { ap: 200, items: ['fireworks_master_badge'] }
                    }
                );
                break;
            case 'autumn':
                achievements.push(
                    {
                        id: 'autumn_harvest_master',
                        name: '収穫の達人',
                        description: '秋イベントでゴールデン泡を30個破壊',
                        icon: '🍂',
                        condition: 'golden_bubbles_30',
                        reward: { ap: 175, items: ['harvest_trophy'] }
                    }
                );
                break;
            case 'winter':
                achievements.push(
                    {
                        id: 'winter_ice_master',
                        name: '氷の支配者',
                        description: '冬イベントで凍結泡を40個破壊',
                        icon: '❄️',
                        condition: 'frozen_bubbles_40',
                        reward: { ap: 180, items: ['ice_crown'] }
                    }
                );
                break;
        }
        
        return achievements;
    }
    
    /**
     * チャレンジイベント実績を取得
     */
    getChallengeAchievements(eventId) {
        const achievements = [];
        
        if (eventId === 'speedChallenge') {
            achievements.push(
                {
                    id: 'speed_demon',
                    name: 'スピードデーモン',
                    description: 'スピードチャレンジを90秒以内でクリア',
                    icon: '👹',
                    condition: 'time_under_90',
                    reward: { ap: 400, special: 'speed_demon_title' }
                }
            );
        }
        
        if (eventId === 'survivalHell') {
            achievements.push(
                {
                    id: 'survivor',
                    name: '究極のサバイバー',
                    description: 'サバイバル地獄でHP10以下で生存',
                    icon: '💀',
                    condition: 'low_hp_survival',
                    reward: { ap: 500, special: 'survivor_legend_title' }
                }
            );
        }
        
        return achievements;
    }
    
    /**
     * 特別イベント実績を取得
     */
    getSpecialEventAchievements(eventId) {
        const achievements = [];
        
        if (eventId === 'anniversary') {
            achievements.push(
                {
                    id: 'anniversary_legend',
                    name: 'アニバーサリーレジェンド',
                    description: 'アニバーサリーイベントで全泡種類を破壊',
                    icon: '👑',
                    condition: 'all_bubble_types',
                    reward: { ap: 1000, special: 'anniversary_legend_crown' }
                }
            );
        }
        
        return achievements;
    }
    
    /**
     * 期間限定イベント実績を取得
     */
    getLimitedTimeAchievements(eventId) {
        const achievements = [];
        
        // 期間限定イベント共通実績
        achievements.push(
            {
                id: `${eventId}_early_bird`,
                name: 'アーリーバード',
                description: 'イベント開始24時間以内に参加',
                icon: '🐦',
                condition: 'early_participation',
                reward: { ap: 150, items: ['early_bird_badge'] }
            }
        );
        
        return achievements;
    }
    
    /**
     * 実績達成条件をチェック
     */
    checkEventAchievementCompleted(achievement, finalScore, stats) {
        switch (achievement.condition) {
            case 'first_completion':
                return !this.hasCompletedEvent(achievement.id);
            case 'score_ratio_200':
                return this.getScoreRatio(finalScore, achievement.eventId) >= 2.0;
            case 'fast_completion':
                return stats.timeRemainingRatio >= 0.7;
            case 'pink_bubbles_50':
                return stats.pinkBubblesPopped >= 50;
            case 'explosion_chains_10':
                return stats.explosionChains >= 10;
            case 'golden_bubbles_30':
                return stats.goldenBubblesPopped >= 30;
            case 'frozen_bubbles_40':
                return stats.frozenBubblesPopped >= 40;
            case 'time_under_90':
                return stats.completionTime <= 90000;
            case 'low_hp_survival':
                return stats.minHP <= 10 && stats.survived;
            case 'all_bubble_types':
                return stats.uniqueBubbleTypes >= 20;
            case 'early_participation':
                return this.isEarlyParticipation(achievement.eventId);
            default:
                return false;
        }
    }

    /**
     * パフォーマンス依存報酬を付与
     */
    grantPerformanceRewards(rewards, stats, eventBonus, callback) {
        let totalAP = 0;
        let items = [];
        
        // 各種パフォーマンス報酬
        const performanceRewards = [
            { key: 'survivalBonus', condition: () => stats.survived },
            { key: 'chainMaster', condition: () => stats.maxChain >= (rewards.chainMaster?.chains || 5) },
            { key: 'perfectSpeed', condition: () => stats.targetReached && stats.timeRemaining > 0 },
            { key: 'ironWill', condition: () => stats.lowHpSurvival },
            { key: 'noHit', condition: () => stats.damagesTaken === 0 },
            { key: 'comboMaster', condition: () => stats.maxCombo >= 20 }
        ];
        
        performanceRewards.forEach(reward => {
            if (rewards[reward.key] && reward.condition()) {
                const ap = Math.floor((rewards[reward.key].ap || 0) * eventBonus.performanceMultiplier);
                totalAP += ap;
                
                if (rewards[reward.key].items) {
                    items.push(...rewards[reward.key].items);
                }
            }
        });
        
        callback(totalAP, items);
    }
    
    /**
     * 季節・特別イベント限定報酬を付与
     */
    grantSeasonalSpecialRewards(event, eventBonus, callback) {
        let totalAP = 0;
        let items = [];
        let special = [];
        
        if (event.type === 'seasonal') {
            const seasonalAP = this.getSeasonalBonusAP(event.season);
            totalAP += Math.floor(seasonalAP * eventBonus.seasonalMultiplier);
            
            const seasonalItems = this.getSeasonalItems(event.season);
            items.push(...seasonalItems);
        }
        
        if (event.type === 'special') {
            if (event.rewards?.anniversary) {
                totalAP += Math.floor((event.rewards.anniversary.ap || 0) * eventBonus.rarityMultiplier);
                
                if (event.rewards.anniversary.special) {
                    special.push(event.rewards.anniversary.special);
                }
            }
        }
        
        callback(totalAP, items, special);
    }
    
    /**
     * レアイベントアイテムを取得
     */
    getRareEventItems(eventType, season) {
        const rareItems = [];
        
        if (eventType === 'seasonal' && season) {
            const seasonalRares = {
                spring: ['rare_cherry_essence', 'spring_wind_charm'],
                summer: ['rare_firework_core', 'summer_night_star'],
                autumn: ['rare_golden_leaf', 'autumn_harvest_gem'],
                winter: ['rare_ice_crystal', 'winter_frost_jewel']
            };
            rareItems.push(...(seasonalRares[season] || []));
        }
        
        if (eventType === 'challenge') {
            rareItems.push('challenger_medal', 'rare_trophy_fragment');
        }
        
        if (eventType === 'special') {
            rareItems.push('legendary_essence', 'special_commemorative_item');
        }
        
        return rareItems;
    }
    
    /**
     * 報酬を実際に適用
     */
    applyRewards(totalAP, items, specialRewards, event) {
        // AP付与
        if (totalAP > 0) {
            this.gameEngine.playerData.ap += totalAP;
            this.gameEngine.playerData.tap += totalAP;
        }
        
        // アイテム付与
        items.forEach(item => {
            this.gameEngine.playerData.addItem(item);
        });
        
        // 特別報酬付与
        specialRewards.forEach(reward => {
            this.gameEngine.playerData.addSpecialReward(reward);
        });
        
        // 報酬通知
        if (this.gameEngine.achievementNotificationSystem) {
            let message = '';
            if (totalAP > 0) message += `${totalAP} AP獲得`;
            if (items.length > 0) message += `${message ? '、' : ''}${items.length}個のアイテム獲得`;
            if (specialRewards.length > 0) message += `${message ? '、' : ''}特別報酬獲得`;
            
            if (message) {
                this.gameEngine.achievementNotificationSystem.queueNotification({
                    type: 'reward',
                    title: 'イベント報酬獲得！',
                    message: message,
                    icon: '🎁',
                    duration: 5000
                });
            }
        }
        
        console.log(`Event rewards applied: ${totalAP} AP, ${items.length} items, ${specialRewards.length} special rewards`);
    }
    
    /**
     * 報酬付与を記録
     */
    recordRewardGrant(eventId, rewardData) {
        this.rewardHistory = this.rewardHistory || {};
        this.rewardHistory[eventId] = this.rewardHistory[eventId] || [];
        this.rewardHistory[eventId].push(rewardData);
        
        // 永続化
        this.save();
    }
    
    /**
     * 季節ボーナスAPを取得
     */
    getSeasonalBonusAP(season) {
        const bonusAP = {
            spring: 150,
            summer: 175,
            autumn: 160,
            winter: 180
        };
        return bonusAP[season] || 100;
    }
    
    /**
     * 季節アイテムを取得
     */
    getSeasonalItems(season) {
        const seasonalItems = {
            spring: ['cherry_petal', 'spring_breeze_charm'],
            summer: ['firework_spark', 'summer_night_badge'],
            autumn: ['golden_leaf', 'harvest_moon_gem'],
            winter: ['snowflake_crystal', 'winter_star_charm']
        };
        return seasonalItems[season] || [];
    }
    
    /**
     * イベント完了履歴をチェック
     */
    hasCompletedEvent(achievementId) {
        this.eventAchievements = this.eventAchievements || {};
        return this.eventAchievements[achievementId] !== undefined;
    }
    
    /**
     * スコア比率を取得
     */
    getScoreRatio(finalScore, eventId) {
        const event = this.eventStages[eventId];
        const expectedScore = event?.rewards?.highScore?.threshold || 10000;
        return finalScore / expectedScore;
    }
    
    /**
     * 早期参加かをチェック
     */
    isEarlyParticipation(eventId) {
        const event = this.eventStages[eventId];
        if (!event?.availability?.activatedAt) return false;
        
        const elapsed = Date.now() - event.availability.activatedAt;
        return elapsed < 24 * 60 * 60 * 1000; // 24時間以内
    }
    
    /**
     * イベント実績を保存
     */
    saveEventAchievements(eventId, achievements) {
        this.eventAchievements = this.eventAchievements || {};
        achievements.forEach(achievement => {
            this.eventAchievements[achievement.id] = {
                eventId,
                achievementId: achievement.id,
                unlockedAt: Date.now(),
                reward: achievement.reward
            };
        });
        
        this.save();
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
     * イベント参加を記録
     */
    recordEventParticipation(eventId, playerId, participationData) {
        const event = this.eventStages[eventId];
        if (!event) {
            console.error(`Event ${eventId} not found for participation recording`);
            return false;
        }
        
        try {
            const participationRecord = {
                id: `participation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                eventId: eventId,
                playerId: playerId || 'default_player',
                startTime: participationData.startTime || Date.now(),
                endTime: participationData.endTime || null,
                completed: participationData.completed || false,
                score: participationData.score || 0,
                stats: {
                    bubblesPopped: participationData.bubblesPopped || 0,
                    specialBubblesPopped: participationData.specialBubblesPopped || 0,
                    maxChain: participationData.maxChain || 0,
                    timeRemaining: participationData.timeRemaining || 0,
                    specialAchievements: participationData.specialAchievements || [],
                    performanceRating: this.calculatePerformanceRating(participationData)
                },
                rewards: participationData.rewards || {},
                sessionData: {
                    userAgent: navigator.userAgent,
                    timestamp: Date.now(),
                    eventVersion: event.version || '1.0'
                }
            };
            
            // 詳細統計データを保存
            this.saveParticipationRecord(participationRecord);
            
            // 既存の履歴も更新
            const historyEntry = this.eventHistory.find(entry => 
                entry.eventId === eventId && 
                !entry.completed &&
                Math.abs(entry.startTime - participationRecord.startTime) < 60000 // 1分以内
            );
            
            if (historyEntry) {
                Object.assign(historyEntry, {
                    completed: participationRecord.completed,
                    endTime: participationRecord.endTime,
                    finalScore: participationRecord.score,
                    stats: participationRecord.stats
                });
            } else {
                // 新しい履歴エントリを作成
                this.eventHistory.push({
                    eventId: eventId,
                    startTime: participationRecord.startTime,
                    endTime: participationRecord.endTime,
                    completed: participationRecord.completed,
                    finalScore: participationRecord.score,
                    stats: participationRecord.stats
                });
            }
            
            console.log(`Event participation recorded: ${event.name}`);
            return participationRecord.id;
            
        } catch (error) {
            console.error('Failed to record event participation:', error);
            return false;
        }
    }
    
    /**
     * パフォーマンス評価を計算
     */
    calculatePerformanceRating(data) {
        let rating = 0;
        let factors = 0;
        
        // スコア評価（0-40点）
        if (data.score) {
            rating += Math.min(40, data.score / 500); // 20000点で満点
            factors++;
        }
        
        // 完了評価（0-20点）
        if (data.completed) {
            rating += 20;
        }
        factors++;
        
        // チェーン評価（0-20点）
        if (data.maxChain) {
            rating += Math.min(20, data.maxChain * 2); // 10チェーンで満点
            factors++;
        }
        
        // 時間評価（0-20点）
        if (data.timeRemaining && data.timeRemaining > 0) {
            rating += Math.min(20, data.timeRemaining / 15000); // 5分残りで満点
            factors++;
        }
        
        return factors > 0 ? Math.round(rating / factors * 100) / 100 : 0;
    }
    
    /**
     * 参加記録を保存
     */
    saveParticipationRecord(record) {
        try {
            const key = 'bubblePop_eventParticipations';
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(record);
            
            // 最大500件の参加記録を保持
            if (existing.length > 500) {
                existing.splice(0, existing.length - 500);
            }
            
            localStorage.setItem(key, JSON.stringify(existing));
        } catch (error) {
            console.error('Failed to save participation record:', error);
        }
    }
    
    /**
     * 詳細イベント統計を取得
     */
    getDetailedEventStatistics() {
        const basicStats = this.getEventStatistics();
        
        // 詳細参加記録を取得
        const participationRecords = this.getParticipationRecords();
        
        const detailedStats = {
            ...basicStats,
            
            // 基本統計
            totalParticipations: participationRecords.length,
            uniqueEventsPlayed: new Set(participationRecords.map(r => r.eventId)).size,
            averageScore: 0,
            averagePerformanceRating: 0,
            
            // イベント別統計
            eventBreakdown: {},
            
            // 時間別統計
            playTimeAnalysis: {
                totalPlayTime: 0,
                averageSessionTime: 0,
                longestSession: 0,
                shortestSession: Number.MAX_SAFE_INTEGER
            },
            
            // パフォーマンス統計
            performanceAnalysis: {
                bestPerformance: 0,
                worstPerformance: 100,
                consistencyScore: 0,
                improvementTrend: 0
            },
            
            // 実績統計
            achievementAnalysis: {
                totalSpecialAchievements: 0,
                uniqueAchievements: new Set(),
                achievementRate: 0
            },
            
            // 期間別統計
            periodAnalysis: {
                last7Days: { participations: 0, completions: 0, totalScore: 0 },
                last30Days: { participations: 0, completions: 0, totalScore: 0 },
                allTime: { participations: 0, completions: 0, totalScore: 0 }
            }
        };
        
        if (participationRecords.length === 0) {
            return detailedStats;
        }
        
        // 詳細統計を計算
        this.calculateDetailedStatistics(participationRecords, detailedStats);
        
        return detailedStats;
    }
    
    /**
     * 詳細統計を計算
     */
    calculateDetailedStatistics(records, stats) {
        let totalScore = 0;
        let totalRating = 0;
        let totalPlayTime = 0;
        let validSessions = 0;
        
        const now = Date.now();
        const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        
        records.forEach(record => {
            // 基本統計
            totalScore += record.score || 0;
            totalRating += record.stats.performanceRating || 0;
            
            // セッション時間
            if (record.endTime && record.startTime) {
                const sessionTime = record.endTime - record.startTime;
                totalPlayTime += sessionTime;
                validSessions++;
                
                stats.playTimeAnalysis.longestSession = Math.max(
                    stats.playTimeAnalysis.longestSession, 
                    sessionTime
                );
                stats.playTimeAnalysis.shortestSession = Math.min(
                    stats.playTimeAnalysis.shortestSession, 
                    sessionTime
                );
            }
            
            // イベント別統計
            if (!stats.eventBreakdown[record.eventId]) {
                const event = this.eventStages[record.eventId];
                stats.eventBreakdown[record.eventId] = {
                    name: event?.name || record.eventId,
                    participations: 0,
                    completions: 0,
                    totalScore: 0,
                    averageScore: 0,
                    bestScore: 0,
                    averageRating: 0
                };
            }
            
            const eventStats = stats.eventBreakdown[record.eventId];
            eventStats.participations++;
            eventStats.totalScore += record.score || 0;
            eventStats.bestScore = Math.max(eventStats.bestScore, record.score || 0);
            
            if (record.completed) {
                eventStats.completions++;
            }
            
            // パフォーマンス統計
            const rating = record.stats.performanceRating || 0;
            stats.performanceAnalysis.bestPerformance = Math.max(
                stats.performanceAnalysis.bestPerformance, 
                rating
            );
            stats.performanceAnalysis.worstPerformance = Math.min(
                stats.performanceAnalysis.worstPerformance, 
                rating
            );
            
            // 実績統計
            if (record.stats.specialAchievements) {
                stats.achievementAnalysis.totalSpecialAchievements += record.stats.specialAchievements.length;
                record.stats.specialAchievements.forEach(achievement => {
                    stats.achievementAnalysis.uniqueAchievements.add(achievement);
                });
            }
            
            // 期間別統計
            const recordTime = record.startTime;
            stats.periodAnalysis.allTime.participations++;
            stats.periodAnalysis.allTime.totalScore += record.score || 0;
            if (record.completed) stats.periodAnalysis.allTime.completions++;
            
            if (recordTime >= sevenDaysAgo) {
                stats.periodAnalysis.last7Days.participations++;
                stats.periodAnalysis.last7Days.totalScore += record.score || 0;
                if (record.completed) stats.periodAnalysis.last7Days.completions++;
            }
            
            if (recordTime >= thirtyDaysAgo) {
                stats.periodAnalysis.last30Days.participations++;
                stats.periodAnalysis.last30Days.totalScore += record.score || 0;
                if (record.completed) stats.periodAnalysis.last30Days.completions++;
            }
        });
        
        // 平均値計算
        if (records.length > 0) {
            stats.averageScore = Math.round(totalScore / records.length);
            stats.averagePerformanceRating = Math.round(totalRating / records.length * 100) / 100;
        }
        
        if (validSessions > 0) {
            stats.playTimeAnalysis.totalPlayTime = totalPlayTime;
            stats.playTimeAnalysis.averageSessionTime = Math.round(totalPlayTime / validSessions);
        }
        
        // イベント別平均値計算
        Object.values(stats.eventBreakdown).forEach(eventStats => {
            if (eventStats.participations > 0) {
                eventStats.averageScore = Math.round(eventStats.totalScore / eventStats.participations);
            }
        });
        
        // 実績統計の最終計算
        stats.achievementAnalysis.uniqueAchievements = stats.achievementAnalysis.uniqueAchievements.size;
        if (records.length > 0) {
            stats.achievementAnalysis.achievementRate = Math.round(
                (stats.achievementAnalysis.totalSpecialAchievements / records.length) * 100
            ) / 100;
        }
    }
    
    /**
     * 参加記録を取得
     */
    getParticipationRecords(limit = null) {
        try {
            const key = 'bubblePop_eventParticipations';
            const records = JSON.parse(localStorage.getItem(key) || '[]');
            
            if (limit) {
                return records.slice(-limit);
            }
            
            return records;
        } catch (error) {
            console.error('Failed to get participation records:', error);
            return [];
        }
    }
    
    /**
     * イベントデータをエクスポート
     */
    exportEventData() {
        try {
            const exportData = {
                timestamp: Date.now(),
                version: '1.0',
                eventStages: this.eventStages,
                eventHistory: this.eventHistory,
                activeEvents: Array.from(this.activeEvents.entries()),
                participationRecords: this.getParticipationRecords(),
                adminLogs: this.getAdminLogs(),
                systemInfo: {
                    userAgent: navigator.userAgent,
                    sessionId: this.getSessionId(),
                    lastSeasonalCheck: this.lastSeasonalCheck,
                    lastNotificationCheck: this.lastNotificationCheck
                }
            };
            
            // JSON文字列に変換
            const jsonString = JSON.stringify(exportData, null, 2);
            
            // Blobを作成してダウンロード用URLを生成
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // ダウンロードリンクを作成
            const link = document.createElement('a');
            link.href = url;
            link.download = `bubble-pop-event-data-${new Date().toISOString().split('T')[0]}.json`;
            
            // ダウンロードを実行
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // URLを解放
            URL.revokeObjectURL(url);
            
            console.log('Event data exported successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to export event data:', error);
            return false;
        }
    }
    
    /**
     * イベント統計を取得（レガシー互換性）
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
        
        this.lastSeasonalCheck = Date.now();
        
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
        this.lastNotificationCheck = now;
        
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
     * 管理者向けイベント有効化
     */
    adminActivateEvent(eventId, duration, options = {}) {
        const event = this.eventStages[eventId];
        if (!event) {
            console.error(`Event ${eventId} not found`);
            return false;
        }
        
        try {
            const now = Date.now();
            const eventDuration = duration || event.duration || 24 * 60 * 60 * 1000; // デフォルト24時間
            
            // イベントデータを作成
            const eventData = {
                startTime: now,
                endTime: now + eventDuration,
                type: 'admin_activated',
                adminOptions: {
                    ...options,
                    activatedBy: 'admin',
                    activatedAt: now
                }
            };
            
            // カスタム設定を適用
            if (options.customSettings) {
                eventData.customSettings = options.customSettings;
            }
            
            this.activeEvents.set(eventId, eventData);
            
            console.log(`Admin activated event: ${event.name} for ${Math.round(eventDuration / (60 * 60 * 1000))} hours`);
            
            // 通知を送信
            if (options.notifyPlayers !== false) {
                this.sendEventNotification(eventId, 'EVENT_STARTED');
            }
            
            // 管理者ログを記録
            this.logAdminAction('activate', eventId, {
                duration: eventDuration,
                options: options
            });
            
            return true;
            
        } catch (error) {
            console.error('Failed to activate event:', error);
            return false;
        }
    }
    
    /**
     * 管理者向けイベント無効化
     */
    adminDeactivateEvent(eventId, options = {}) {
        const event = this.eventStages[eventId];
        if (!event) {
            console.error(`Event ${eventId} not found`);
            return false;
        }
        
        if (!this.activeEvents.has(eventId)) {
            console.warn(`Event ${eventId} is not currently active`);
            return false;
        }
        
        try {
            this.activeEvents.delete(eventId);
            
            console.log(`Admin deactivated event: ${event.name}`);
            
            // 通知を送信
            if (options.notifyPlayers !== false) {
                this.sendEventNotification(eventId, 'EVENT_ENDED');
            }
            
            // 管理者ログを記録
            this.logAdminAction('deactivate', eventId, options);
            
            return true;
            
        } catch (error) {
            console.error('Failed to deactivate event:', error);
            return false;
        }
    }
    
    /**
     * イベント管理状態を取得
     */
    getEventManagementStatus() {
        const status = {
            totalEvents: Object.keys(this.eventStages).length,
            activeEvents: this.activeEvents.size,
            seasonalEvents: 0,
            specialEvents: 0,
            adminEvents: 0,
            eventDetails: [],
            systemStatus: {
                seasonalCheckActive: this.seasonalCheckInterval !== null,
                notificationCheckActive: this.notificationCheckInterval !== null,
                lastSeasonalCheck: this.lastSeasonalCheck || null,
                lastNotificationCheck: this.lastNotificationCheck || null
            }
        };
        
        // イベント詳細を収集
        Object.values(this.eventStages).forEach(event => {
            const isActive = this.activeEvents.has(event.id);
            const eventData = this.activeEvents.get(event.id);
            
            const detail = {
                id: event.id,
                name: event.name,
                type: event.type,
                isActive: isActive,
                description: event.description,
                icon: event.icon
            };
            
            if (isActive && eventData) {
                detail.activeData = {
                    startTime: eventData.startTime,
                    endTime: eventData.endTime,
                    activationType: eventData.type,
                    timeRemaining: Math.max(0, eventData.endTime - Date.now()),
                    adminOptions: eventData.adminOptions || null
                };
            }
            
            // タイプ別カウント
            switch (event.type) {
                case 'seasonal':
                    status.seasonalEvents++;
                    break;
                case 'special':
                    status.specialEvents++;
                    break;
                default:
                    if (eventData && eventData.type === 'admin_activated') {
                        status.adminEvents++;
                    }
                    break;
            }
            
            status.eventDetails.push(detail);
        });
        
        return status;
    }
    
    /**
     * 管理者アクションをログに記録
     */
    logAdminAction(action, eventId, options = {}) {
        const logEntry = {
            timestamp: Date.now(),
            action: action,
            eventId: eventId,
            eventName: this.eventStages[eventId]?.name || 'Unknown Event',
            options: options,
            userAgent: navigator.userAgent,
            sessionId: this.getSessionId()
        };
        
        // ローカルストレージに管理者ログを保存
        try {
            const existingLogs = JSON.parse(localStorage.getItem('bubblePop_adminLogs') || '[]');
            existingLogs.push(logEntry);
            
            // 最大100件のログを保持
            if (existingLogs.length > 100) {
                existingLogs.splice(0, existingLogs.length - 100);
            }
            
            localStorage.setItem('bubblePop_adminLogs', JSON.stringify(existingLogs));
            
        } catch (error) {
            console.error('Failed to log admin action:', error);
        }
        
        console.log('Admin action logged:', logEntry);
    }
    
    /**
     * セッションIDを取得
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('bubblePop_sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('bubblePop_sessionId', sessionId);
        }
        return sessionId;
    }
    
    /**
     * 管理者ログを取得
     */
    getAdminLogs(limit = 50) {
        try {
            const logs = JSON.parse(localStorage.getItem('bubblePop_adminLogs') || '[]');
            return logs.slice(-limit).reverse(); // 最新のlimit件を新しい順で返す
        } catch (error) {
            console.error('Failed to get admin logs:', error);
            return [];
        }
    }
    
    /**
     * 複数イベントの一括制御
     */
    adminBulkEventControl(eventIds, action, options = {}) {
        const results = {
            success: [],
            failed: [],
            skipped: []
        };
        
        eventIds.forEach(eventId => {
            try {
                let result = false;
                
                switch (action) {
                    case 'activate':
                        result = this.adminActivateEvent(eventId, options.duration, {
                            ...options,
                            notifyPlayers: false // 一括処理では個別通知を無効化
                        });
                        break;
                        
                    case 'deactivate':
                        result = this.adminDeactivateEvent(eventId, {
                            ...options,
                            notifyPlayers: false
                        });
                        break;
                        
                    default:
                        results.skipped.push({ eventId, reason: 'Unknown action' });
                        return;
                }
                
                if (result) {
                    results.success.push(eventId);
                } else {
                    results.failed.push({ eventId, reason: 'Action failed' });
                }
                
            } catch (error) {
                results.failed.push({ eventId, reason: error.message });
            }
        });
        
        // 一括処理完了通知
        if (options.notifyPlayers !== false && results.success.length > 0) {
            // 最初の成功したイベントで代表通知を送信
            const firstEventId = results.success[0];
            const notificationType = action === 'activate' ? 'EVENT_STARTED' : 'EVENT_ENDED';
            this.sendEventNotification(firstEventId, notificationType);
        }
        
        this.logAdminAction(`bulk_${action}`, 'multiple', {
            eventIds: eventIds,
            results: results,
            options: options
        });
        
        return results;
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