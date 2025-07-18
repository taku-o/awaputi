/**
 * ステージ管理クラス
 */
export class StageManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentStage = null;
        this.stageConfigs = this.initializeStageConfigs();
    }
    
    /**
     * ステージ設定を初期化
     */
    initializeStageConfigs() {
        return {
            tutorial: {
                name: '1分ステージ',
                description: 'チュートリアル用の短いステージ',
                duration: 60000, // 1分
                bubbleTypes: ['normal'],
                spawnRate: 1.0,
                maxBubbles: 10,
                unlockCondition: null, // 最初から開放
                unlockMessage: ''
            },
            normal: {
                name: '普通のアワアワ',
                description: '基本的な泡が出現するステージ',
                duration: 300000, // 5分
                bubbleTypes: ['normal', 'stone', 'rainbow', 'pink', 'clock', 'score'],
                spawnRate: 1.5,
                maxBubbles: 20,
                unlockCondition: null, // 最初から開放
                unlockMessage: ''
            },
            hard: {
                name: 'ちょっと硬いアワアワ',
                description: '硬い泡が多く出現するステージ',
                duration: 300000,
                bubbleTypes: ['normal', 'stone', 'iron', 'rainbow', 'pink', 'clock', 'score', 'poison'],
                spawnRate: 1.6, // 1.8 -> 1.6 (少し緩和)
                maxBubbles: 22, // 25 -> 22 (少し緩和)
                unlockCondition: { type: 'tap', value: 500 }, // 1000 -> 500 (大幅緩和)
                unlockMessage: 'TAP 500以上で開放'
            },
            veryHard: {
                name: 'かなり硬いアワアワ',
                description: 'より硬い泡が出現するステージ',
                duration: 300000,
                bubbleTypes: ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'score', 'poison', 'spike'],
                spawnRate: 1.8, // 2.0 -> 1.8 (少し緩和)
                maxBubbles: 28, // 30 -> 28 (少し緩和)
                unlockCondition: { type: 'tap', value: 2000 }, // 5000 -> 2000 (大幅緩和)
                unlockMessage: 'TAP 2000以上で開放'
            },
            special: {
                name: '特殊なアワアワ',
                description: '特殊効果を持つ泡が多く出現',
                duration: 300000,
                bubbleTypes: ['normal', 'stone', 'rainbow', 'pink', 'clock', 'score', 'poison', 'spike', 'electric', 'escape'],
                spawnRate: 2.0, // 2.2 -> 2.0 (少し緩和)
                maxBubbles: 32, // 35 -> 32 (少し緩和)
                unlockCondition: { type: 'tap', value: 5000 }, // 10000 -> 5000 (大幅緩和)
                unlockMessage: 'TAP 5000以上で開放'
            },
            nightmare: {
                name: '悪夢のアワアワ',
                description: '危険な泡が多数出現する高難易度ステージ',
                duration: 300000,
                bubbleTypes: ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'score', 'poison', 'spike', 'electric', 'escape', 'crack'],
                spawnRate: 2.3, // 2.5 -> 2.3 (少し緩和)
                maxBubbles: 38, // 40 -> 38 (少し緩和)
                unlockCondition: { type: 'tap', value: 12000 }, // 25000 -> 12000 (大幅緩和)
                unlockMessage: 'TAP 12000以上で開放'
            },
            chaos: {
                name: 'カオスなアワアワ',
                description: 'あらゆる種類の泡が出現する混沌ステージ',
                duration: 300000,
                bubbleTypes: ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'score', 'poison', 'spike', 'electric', 'escape', 'crack', 'boss'],
                spawnRate: 2.7, // 3.0 -> 2.7 (少し緩和)
                maxBubbles: 42, // 45 -> 42 (少し緩和)
                unlockCondition: { type: 'tap', value: 25000 }, // 50000 -> 25000 (大幅緩和)
                unlockMessage: 'TAP 25000以上で開放'
            },
            ultimate: {
                name: '究極のアワアワ',
                description: '最高難易度の究極ステージ',
                duration: 300000,
                bubbleTypes: ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'score', 'poison', 'spike', 'electric', 'escape', 'crack', 'boss'],
                spawnRate: 3.2, // 3.5 -> 3.2 (少し緩和)
                maxBubbles: 48, // 50 -> 48 (少し緩和)
                unlockCondition: { type: 'tap', value: 50000 }, // 100000 -> 50000 (大幅緩和)
                unlockMessage: 'TAP 50000以上で開放'
            },
            allIn: {
                name: '全部入りアワアワ',
                description: '全ての要素が詰まった最終ステージ',
                duration: 300000,
                bubbleTypes: ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'score', 'poison', 'spike', 'electric', 'escape', 'crack', 'boss'],
                spawnRate: 3.6, // 4.0 -> 3.6 (少し緩和)
                maxBubbles: 55, // 60 -> 55 (少し緩和)
                unlockCondition: { type: 'tap', value: 100000 }, // 200000 -> 100000 (大幅緩和)
                unlockMessage: 'TAP 100000以上で開放'
            },
            boss: {
                name: 'ボスアワアワ',
                description: '中盤と最後にボス泡が出現する特別ステージ',
                duration: 300000,
                bubbleTypes: ['normal', 'stone', 'iron', 'rainbow', 'pink', 'clock', 'score', 'boss'],
                spawnRate: 1.8, // 2.0 -> 1.8 (少し緩和)
                maxBubbles: 28, // 30 -> 28 (少し緩和)
                bossEvents: [
                    { time: 150000, type: 'boss', count: 1 }, // 中盤
                    { time: 30000, type: 'boss', count: 2 }   // 最後
                ],
                unlockCondition: { type: 'tap', value: 35000 }, // 75000 -> 35000 (大幅緩和)
                unlockMessage: 'TAP 35000以上で開放'
            }
        };
    }
    
    /**
     * ステージを開始
     */
    startStage(stageId) {
        const config = this.stageConfigs[stageId];
        if (!config) {
            console.error(`Stage ${stageId} not found`);
            return false;
        }
        
        if (!this.isStageUnlocked(stageId)) {
            console.error(`Stage ${stageId} is locked`);
            return false;
        }
        
        this.currentStage = {
            id: stageId,
            config: config,
            startTime: Date.now(),
            bossEventsTriggered: []
        };
        
        // ゲームエンジンにステージ情報を設定
        this.gameEngine.timeRemaining = config.duration;
        this.gameEngine.bubbleManager.setStageConfig(config);
        
        console.log(`Stage started: ${config.name}`);
        return true;
    }
    
    /**
     * ステージが開放されているかチェック
     */
    isStageUnlocked(stageId) {
        const config = this.stageConfigs[stageId];
        if (!config || !config.unlockCondition) {
            return true; // 開放条件がない場合は開放済み
        }
        
        const playerData = this.gameEngine.playerData;
        const condition = config.unlockCondition;
        
        switch (condition.type) {
            case 'tap':
                return playerData.tap >= condition.value;
            case 'highScore':
                return (playerData.highScores[condition.stage] || 0) >= condition.value;
            case 'stageComplete':
                return playerData.unlockedStages.includes(condition.stage);
            default:
                return false;
        }
    }
    
    /**
     * 開放済みステージ一覧を取得
     */
    getUnlockedStages() {
        const unlockedStages = [];
        
        for (const [stageId, config] of Object.entries(this.stageConfigs)) {
            if (this.isStageUnlocked(stageId)) {
                unlockedStages.push({
                    id: stageId,
                    name: config.name,
                    description: config.description,
                    duration: config.duration
                });
            }
        }
        
        return unlockedStages;
    }
    
    /**
     * ロック済みステージ一覧を取得
     */
    getLockedStages() {
        const lockedStages = [];
        
        for (const [stageId, config] of Object.entries(this.stageConfigs)) {
            if (!this.isStageUnlocked(stageId)) {
                lockedStages.push({
                    id: stageId,
                    name: config.name,
                    description: config.description,
                    unlockMessage: config.unlockMessage
                });
            }
        }
        
        return lockedStages;
    }
    
    /**
     * 現在のステージ設定を取得
     */
    getCurrentStageConfig() {
        return this.currentStage ? this.currentStage.config : null;
    }
    
    /**
     * 現在のステージIDを取得
     */
    getCurrentStageId() {
        return this.currentStage ? this.currentStage.id : null;
    }
    
    /**
     * ボスイベントをチェック
     */
    checkBossEvents(timeRemaining) {
        if (!this.currentStage || !this.currentStage.config.bossEvents) {
            return;
        }
        
        const config = this.currentStage.config;
        const elapsedTime = config.duration - timeRemaining;
        
        config.bossEvents.forEach((event, index) => {
            if (elapsedTime >= event.time && !this.currentStage.bossEventsTriggered.includes(index)) {
                this.triggerBossEvent(event);
                this.currentStage.bossEventsTriggered.push(index);
            }
        });
    }
    
    /**
     * ボスイベントを発動
     */
    triggerBossEvent(event) {
        console.log(`Boss event triggered: ${event.type}, count: ${event.count}`);
        
        // ボス泡を強制生成
        for (let i = 0; i < event.count; i++) {
            this.gameEngine.bubbleManager.spawnSpecificBubble('boss');
        }
    }
    
    /**
     * ステージ完了処理
     */
    completeStage(finalScore) {
        if (!this.currentStage) return;
        
        const stageId = this.currentStage.id;
        const playerData = this.gameEngine.playerData;
        
        // ハイスコア更新
        if (!playerData.highScores[stageId] || finalScore > playerData.highScores[stageId]) {
            playerData.highScores[stageId] = finalScore;
            console.log(`New high score for ${stageId}: ${finalScore}`);
        }
        
        // AP/TAP更新
        const apGain = Math.floor(finalScore / 100);
        playerData.ap += apGain;
        playerData.tap += apGain;
        
        // データ保存
        playerData.save();
        
        console.log(`Stage completed: ${this.currentStage.config.name}, Score: ${finalScore}, AP gained: ${apGain}`);
        
        this.currentStage = null;
    }
}