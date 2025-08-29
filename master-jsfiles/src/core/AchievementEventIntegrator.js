/**
 * 実績システムとゲームイベントの統合クラス
 */
export class AchievementEventIntegrator {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.achievementManager = gameEngine.achievementManager;
        this.sessionStartTime = Date.now();
        this.isIntegrated = false;
        
        this.initialize();
    }
    
    /**
     * 統合システムを初期化
     */
    initialize() {
        if (this.isIntegrated) {
            return;
        }
        
        this.integrateBubbleManager();
        this.integrateScoreManager();
        this.integrateGameScene();
        this.integrateStatisticsManager();
        this.setupSessionTracking();
        
        this.isIntegrated = true;
        console.log('Achievement Event Integrator initialized');
    }
    
    /**
     * BubbleManagerとの統合
     */
    integrateBubbleManager() {
        const bubbleManager = this.gameEngine.bubbleManager;
        if (!bubbleManager) {
            console.warn('BubbleManager not found during integration');
            return;
        }
        
        // popBubbleメソッドの存在確認
        if (typeof bubbleManager.popBubble !== 'function') {
            console.warn('BubbleManager.popBubble method not found');
            return;
        }
        
        // 元のpopBubbleメソッドを保存
        const originalPopBubble = bubbleManager.popBubble.bind(bubbleManager);
        
        // popBubbleメソッドを拡張
        bubbleManager.popBubble = (bubble, ...args) => {
            const result = originalPopBubble(bubble, ...args);
            
            // 実績システムにイベントを送信
            this.handleBubblePopped(bubble.type, {
                bubbleType: bubble.type,
                position: { x: bubble.x, y: bubble.y },
                reactionTime: Date.now() - bubble.spawnTime
            });
            
            return result;
        };
        
        console.log('BubbleManager integration completed');
    }
    
    /**
     * ScoreManagerとの統合
     */
    integrateScoreManager() {
        const scoreManager = this.gameEngine.scoreManager;
        if (!scoreManager) {
            console.warn('ScoreManager not found during integration');
            return;
        }
        
        // addScoreメソッドの存在確認
        if (typeof scoreManager.addScore !== 'function') {
            console.warn('ScoreManager.addScore method not found');
            return;
        }
        
        // 元のaddScoreメソッドを保存
        const originalAddScore = scoreManager.addScore.bind(scoreManager);
        
        // addScoreメソッドを拡張
        scoreManager.addScore = (points, ...args) => {
            const result = originalAddScore(points, ...args);
            
            // コンボ更新イベントを送信
            if (scoreManager.combo > 0) {
                this.handleComboUpdate(scoreManager.combo, false);
            }
            
            return result;
        };
        
        // breakComboメソッドの存在確認と拡張
        if (typeof scoreManager.resetCombo === 'function') {
            // 元のresetComboメソッドを保存（正しいメソッド名を使用）
            const originalResetCombo = scoreManager.resetCombo.bind(scoreManager);
            
            // resetComboメソッドを拡張
            scoreManager.resetCombo = (...args) => {
                const lastCombo = scoreManager.combo;
                const result = originalResetCombo(...args);
                
                // コンボ破綻イベントを送信
                this.handleComboUpdate(lastCombo, true);
                
                return result;
            };
        } else {
            console.warn('ScoreManager.resetCombo method not found');
        }
        
        console.log('ScoreManager integration completed');
    }
    
    /**
     * GameSceneとの統合
     */
    integrateGameScene() {
        const gameScene = this.gameEngine.sceneManager?.scenes?.game;
        if (!gameScene) {
            console.debug('GameScene not found during integration - will retry later');
            // 遅延統合：1秒後に再試行
            setTimeout(() => {
                this.integrateGameScene();
            }, 1000);
            return;
        }
        
        // gameOverメソッドの存在確認と拡張
        if (typeof gameScene.gameOver === 'function') {
            // 元のgameOverメソッドを保存
            const originalGameOver = gameScene.gameOver.bind(gameScene);
            
            // gameOverメソッドを拡張
            gameScene.gameOver = (...args) => {
                const gameData = this.collectGameEndData();
                
                // ゲーム終了イベントを送信
                this.handleGameEnd(gameData);
                
                const result = originalGameOver(...args);
                return result;
            };
        } else {
            console.warn('GameScene.gameOver method not found');
        }
        
        // ステージクリア統合
        if (typeof gameScene.completeStage === 'function') {
            const originalCompleteStage = gameScene.completeStage.bind(gameScene);
            
            gameScene.completeStage = (stageId, ...args) => {
                const result = originalCompleteStage(stageId, ...args);
                
                // ステージクリアイベントを送信
                this.handleStageCleared(stageId, {
                    stageId: stageId,
                    clearTime: Date.now() - this.sessionStartTime,
                    score: this.gameEngine.scoreManager?.score || 0
                });
                
                return result;
            };
        }
        
        console.log('GameScene integration completed');
    }
    
    /**
     * StatisticsManagerとの統合
     */
    integrateStatisticsManager() {
        const statisticsManager = this.gameEngine.statisticsManager;
        if (!statisticsManager) {
            console.warn('StatisticsManager not found during integration');
            return;
        }
        
        // StatisticsManagerのイベントを監視して実績チェック
        // (StatisticsManagerが独自のイベントシステムを持つ場合)
        console.log('StatisticsManager integration completed');
    }
    
    /**
     * セッション追跡設定
     */
    setupSessionTracking() {
        // 1日1回のプレイイベント送信
        const today = new Date().toDateString();
        this.handleDayPlayed(today);
        
        // セッション終了時のイベント設定
        window.addEventListener('beforeunload', () => {
            this.handleSessionEnd({
                sessionDuration: Date.now() - this.sessionStartTime
            });
        });
        
        // 定期的なスピードチェック（1分毎）
        this.speedCheckInterval = setInterval(() => {
            this.checkSpeedChallenge();
        }, 60000);
        
        console.log('Session tracking setup completed');
    }
    
    /**
     * 泡が割れた時のイベント処理
     */
    handleBubblePopped(bubbleType, data) {
        if (this.achievementManager && typeof this.achievementManager.updateProgress === 'function') {
            this.achievementManager.updateProgress('bubblePopped', data);
        }
        
        // 特殊効果発動チェック
        if (['rainbow', 'electric', 'explosive', 'magnetic'].includes(bubbleType)) {
            this.handleSpecialEffect(bubbleType);
        }
    }
    
    /**
     * ゲーム終了時のイベント処理
     */
    handleGameEnd(gameData) {
        if (this.achievementManager && typeof this.achievementManager.updateProgress === 'function') {
            this.achievementManager.updateProgress('gameEnd', gameData);
        }
        
        // 精度チェック
        if (gameData.bubblesPopped > 0) {
            this.checkAccuracyAchievements(gameData);
        }
        
        // パーフェクトゲームチェック
        if (gameData.bubblesMissed === 0 && gameData.bubblesPopped >= 50) {
            if (this.achievementManager && typeof this.achievementManager.updateProgress === 'function') {
                this.achievementManager.updateProgress('perfectGame', gameData);
            }
        }
        
        // 夜間プレイチェック
        this.checkNightTimePlay(gameData);
    }
    
    /**
     * コンボ更新時のイベント処理
     */
    handleComboUpdate(combo, broken) {
        if (this.achievementManager && typeof this.achievementManager.updateProgress === 'function') {
            this.achievementManager.updateProgress('comboUpdate', { combo, broken });
        }
    }
    
    /**
     * 特殊効果発動時のイベント処理
     */
    handleSpecialEffect(effectType) {
        if (this.achievementManager && typeof this.achievementManager.updateProgress === 'function') {
            this.achievementManager.updateProgress('specialEffect', { effectType });
        }
    }
    
    /**
     * ステージクリア時のイベント処理
     */
    handleStageCleared(stageId, data) {
        if (this.achievementManager && typeof this.achievementManager.updateProgress === 'function') {
            this.achievementManager.updateProgress('stageCleared', data);
        }
    }
    
    /**
     * 日次プレイイベント処理
     */
    handleDayPlayed(date) {
        if (this.achievementManager && typeof this.achievementManager.updateProgress === 'function') {
            this.achievementManager.updateProgress('dayPlayed', { date });
        }
    }
    
    /**
     * セッション終了時のイベント処理
     */
    handleSessionEnd(data) {
        if (this.achievementManager && typeof this.achievementManager.updateProgress === 'function') {
            this.achievementManager.updateProgress('sessionEnd', data);
        }
        
        if (this.speedCheckInterval) {
            clearInterval(this.speedCheckInterval);
        }
    }
    
    /**
     * ゲーム終了時のデータ収集
     */
    collectGameEndData() {
        const scoreManager = this.gameEngine.scoreManager;
        const bubbleManager = this.gameEngine.bubbleManager;
        const playerData = this.gameEngine.playerData;
        
        const playTime = Date.now() - this.sessionStartTime;
        const bubblesPopped = scoreManager?.bubblesPopped || 0;
        const bubblesMissed = bubbleManager?.bubblesMissed || 0;
        
        return {
            finalScore: scoreManager?.score || 0,
            maxCombo: scoreManager?.maxCombo || 0,
            bubblesPopped: bubblesPopped,
            bubblesMissed: bubblesMissed,
            playTime: playTime,
            accuracy: bubblesPopped > 0 ? (bubblesPopped / (bubblesPopped + bubblesMissed)) * 100 : 0,
            itemsUsed: this.checkItemsUsed(),
            hp: playerData?.hp || 100
        };
    }
    
    /**
     * アイテム使用状況をチェック
     */
    checkItemsUsed() {
        // ItemSystemからアイテム使用状況を取得
        const itemSystem = this.gameEngine.itemSystem;
        return itemSystem && typeof itemSystem.getUsedItemsInSession === 'function' 
            ? itemSystem.getUsedItemsInSession().length > 0 
            : false;
    }
    
    /**
     * 精度実績をチェック
     */
    checkAccuracyAchievements(gameData) {
        // 95%と99%の精度実績をチェック
        if (gameData.accuracy >= 95) {
            if (this.achievementManager && typeof this.achievementManager.updateProgress === 'function') {
                this.achievementManager.updateProgress('accuracy', { accuracy: gameData.accuracy });
            }
        }
    }
    
    /**
     * 夜間プレイをチェック
     */
    checkNightTimePlay(gameData) {
        const hour = new Date().getHours();
        if ((hour >= 23 || hour < 5) && gameData.finalScore >= 1000) {
            if (this.achievementManager && typeof this.achievementManager.updateProgress === 'function') {
                this.achievementManager.updateProgress('nightTimeScore', gameData);
            }
        }
    }
    
    /**
     * スピードチャレンジをチェック
     */
    checkSpeedChallenge() {
        const scoreManager = this.gameEngine.scoreManager;
        const timeElapsed = Date.now() - this.sessionStartTime;
        const bubblesPopped = scoreManager?.bubblesPopped || 0;
        
        // 1分以内に100個の泡を割る実績
        if (timeElapsed <= 60000 && bubblesPopped >= 100) {
            if (this.achievementManager && typeof this.achievementManager.updateProgress === 'function') {
                this.achievementManager.updateProgress('speedCheck', {
                    bubblesPopped: bubblesPopped,
                    timeElapsed: timeElapsed
                });
            }
        }
    }
    
    /**
     * 低HPサバイバルチェック
     */
    checkLowHpSurvival() {
        const playerData = this.gameEngine.playerData;
        const currentTime = Date.now();
        
        if (playerData && playerData.hp <= 10) {
            if (!this.lowHpStartTime) {
                this.lowHpStartTime = currentTime;
            }
            
            const survivalTime = currentTime - this.lowHpStartTime;
            
            // 1分間（60秒）または2分間（120秒）の低HP生存チェック
            if (survivalTime >= 60000) {
                if (this.achievementManager && typeof this.achievementManager.updateProgress === 'function') {
                    this.achievementManager.updateProgress('lowHpSurvival', {
                        hp: playerData.hp,
                        survivalTime: survivalTime
                    });
                }
            }
        } else {
            this.lowHpStartTime = null;
        }
    }
    
    /**
     * 定期更新処理
     */
    update(deltaTime) {
        // 低HPサバイバルチェック
        this.checkLowHpSurvival();
        
        // その他の定期チェック処理
    }
    
    /**
     * 統合を解除
     */
    dispose() {
        if (this.speedCheckInterval) {
            clearInterval(this.speedCheckInterval);
        }
        
        this.isIntegrated = false;
        console.log('Achievement Event Integrator disposed');
    }
}