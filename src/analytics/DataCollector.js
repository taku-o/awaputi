/**
 * Data Collector
 * ゲームイベントからデータを収集し、構造化して保存するシステム
 */
export class DataCollector {
    constructor(privacyManager, storageManager) {
        this.privacyManager = privacyManager;
        this.storageManager = storageManager;
        
        // イベントキューとバッチ処理設定
        this.eventQueue = [];
        this.batchSize = 50;
        this.batchTimeout = 5000; // 5秒
        this.batchTimer = null;
        
        // データ収集の有効/無効状態
        this.isEnabled = true;
        this.isPaused = false;
        
        // セッション管理
        this.currentSessionId = null;
        this.sessionStartTime = null;
        
        // イベント統計
        this.eventStats = {
            collected: 0,
            processed: 0,
            errors: 0,
            dropped: 0
        };
        
        // エラーハンドリング
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        // 自動バッチ処理の開始
        this.startBatchProcessing();
    }
    
    /**
     * 自動バッチ処理の開始
     */
    startBatchProcessing() {
        this.batchTimer = setInterval(() => {
            if (this.eventQueue.length > 0) {
                this.processBatch();
            }
        }, this.batchTimeout);
    }
    
    /**
     * 自動バッチ処理の停止
     */
    stopBatchProcessing() {
        if (this.batchTimer) {
            clearInterval(this.batchTimer);
            this.batchTimer = null;
        }
    }
    
    /**
     * セッション開始
     * @param {Object} sessionInfo - セッション情報
     */
    startSession(sessionInfo) {
        this.currentSessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();
        
        const sessionData = {
            sessionId: this.currentSessionId,
            startTime: this.sessionStartTime,
            endTime: null,
            duration: null,
            stageId: sessionInfo.stageId || 'unknown',
            finalScore: null,
            bubblesPopped: 0,
            bubblesMissed: 0,
            maxCombo: 0,
            completed: false,
            exitReason: null,
            playerSettings: {
                difficulty: sessionInfo.difficulty || 'normal',
                soundEnabled: sessionInfo.soundEnabled !== false,
                effectsEnabled: sessionInfo.effectsEnabled !== false
            }
        };
        
        this.collectSessionData(sessionData);
    }
    
    /**
     * セッション終了
     * @param {Object} endInfo - 終了情報
     */
    endSession(endInfo) {
        if (!this.currentSessionId) return;
        
        const endTime = Date.now();
        const sessionData = {
            sessionId: this.currentSessionId,
            endTime: endTime,
            duration: endTime - this.sessionStartTime,
            finalScore: endInfo.finalScore || 0,
            bubblesPopped: endInfo.bubblesPopped || 0,
            bubblesMissed: endInfo.bubblesMissed || 0,
            maxCombo: endInfo.maxCombo || 0,
            completed: endInfo.completed || false,
            exitReason: endInfo.exitReason || 'unknown'
        };
        
        this.collectSessionData(sessionData);
        
        // セッション情報をリセット
        this.currentSessionId = null;
        this.sessionStartTime = null;
    }
    
    /**
     * セッションデータ収集
     * @param {Object} sessionInfo - セッション情報
     */
    collectSessionData(sessionInfo) {
        if (!this.shouldCollectData('sessionTracking')) return;
        
        const event = {
            type: 'session',
            timestamp: Date.now(),
            data: sessionInfo
        };
        
        this.addToQueue(event);
    }
    
    /**
     * バブルインタラクション収集
     * @param {Object} bubbleData - バブルデータ
     */
    collectBubbleInteraction(bubbleData) {
        if (!this.shouldCollectData('behaviorAnalysis')) return;
        if (!this.currentSessionId) return;
        
        const interactionData = {
            sessionId: this.currentSessionId,
            timestamp: Date.now(),
            bubbleType: bubbleData.bubbleType,
            action: bubbleData.action, // 'popped', 'missed', 'expired'
            reactionTime: bubbleData.reactionTime || null,
            position: bubbleData.position ? {
                x: bubbleData.position.x,
                y: bubbleData.position.y
            } : null,
            scoreGained: bubbleData.scoreGained || 0,
            comboCount: bubbleData.comboCount || 0,
            contextInfo: {
                remainingBubbles: bubbleData.remainingBubbles || 0,
                currentHP: bubbleData.currentHP || 0,
                timeRemaining: bubbleData.timeRemaining || 0
            }
        };
        
        const event = {
            type: 'bubbleInteraction',
            timestamp: Date.now(),
            data: interactionData
        };
        
        this.addToQueue(event);
        this.eventStats.collected++;
    }
    
    /**
     * パフォーマンスデータ収集
     * @param {Object} performanceMetrics - パフォーマンス指標
     */
    collectPerformanceData(performanceMetrics) {
        if (!this.shouldCollectData('performanceTracking')) return;
        
        const performanceData = {
            sessionId: this.currentSessionId,
            timestamp: Date.now(),
            fps: performanceMetrics.fps || null,
            memoryUsage: performanceMetrics.memoryUsage ? {
                used: performanceMetrics.memoryUsage.used,
                total: performanceMetrics.memoryUsage.total,
                limit: performanceMetrics.memoryUsage.limit
            } : null,
            loadTimes: performanceMetrics.loadTimes ? {
                assets: performanceMetrics.loadTimes.assets,
                scripts: performanceMetrics.loadTimes.scripts,
                total: performanceMetrics.loadTimes.total
            } : null,
            errors: performanceMetrics.errors || []
        };
        
        const event = {
            type: 'performance',
            timestamp: Date.now(),
            data: performanceData
        };
        
        this.addToQueue(event);
    }
    
    /**
     * ゲームバランス関連データ収集
     * @param {Object} balanceData - バランスデータ
     */
    collectGameBalanceData(balanceData) {
        if (!this.shouldCollectData('behaviorAnalysis')) return;
        if (!this.currentSessionId) return;
        
        const event = {
            type: 'gameBalance',
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
            data: balanceData
        };
        
        this.addToQueue(event);
    }
    
    /**
     * スコア関連データ収集
     * @param {Object} scoreData - スコアデータ
     */
    collectScoreData(scoreData) {
        if (!this.shouldCollectData('behaviorAnalysis')) return;
        if (!this.currentSessionId) return;
        
        const scoreEvent = {
            sessionId: this.currentSessionId,
            timestamp: Date.now(),
            scoreType: scoreData.type, // 'bubble', 'combo', 'bonus', 'penalty'
            amount: scoreData.amount,
            totalScore: scoreData.totalScore,
            multiplier: scoreData.multiplier || 1,
            source: scoreData.source, // バブルタイプやボーナス種類
            contextInfo: {
                comboCount: scoreData.comboCount || 0,
                timeRemaining: scoreData.timeRemaining || 0,
                activeItems: scoreData.activeItems || []
            }
        };
        
        const event = {
            type: 'score',
            timestamp: Date.now(),
            data: scoreEvent
        };
        
        this.addToQueue(event);
    }
    
    /**
     * アイテム使用データ収集
     * @param {Object} itemData - アイテムデータ
     */
    collectItemUsageData(itemData) {
        if (!this.shouldCollectData('behaviorAnalysis')) return;
        if (!this.currentSessionId) return;
        
        const itemEvent = {
            sessionId: this.currentSessionId,
            timestamp: Date.now(),
            itemType: itemData.itemType,
            action: itemData.action, // 'purchased', 'used', 'expired'
            cost: itemData.cost || 0,
            duration: itemData.duration || null,
            effectiveness: itemData.effectiveness || null,
            contextInfo: {
                playerAP: itemData.playerAP || 0,
                stageProgress: itemData.stageProgress || 0,
                currentScore: itemData.currentScore || 0
            }
        };
        
        const event = {
            type: 'itemUsage',
            timestamp: Date.now(),
            data: itemEvent
        };
        
        this.addToQueue(event);
    }
    
    /**
     * データ収集可否チェック
     * @param {string} feature - 機能名
     * @returns {boolean}
     */
    shouldCollectData(feature) {
        if (!this.isEnabled || this.isPaused) return false;
        if (!this.privacyManager.checkConsent()) return false;
        if (this.privacyManager.isOptedOut(feature)) return false;
        return true;
    }
    
    /**
     * イベントキューに追加
     * @param {Object} event - イベントデータ
     */
    addToQueue(event) {
        try {
            // プライバシー保護：データ匿名化
            const anonymizedEvent = this.privacyManager.anonymizeData(event);
            
            this.eventQueue.push(anonymizedEvent);
            
            // バッチサイズに達したら即座に処理
            if (this.eventQueue.length >= this.batchSize) {
                this.processBatch();
            }
        } catch (error) {
            console.error('Failed to add event to queue:', error);
            this.eventStats.errors++;
        }
    }
    
    /**
     * バッチ処理
     */
    async processBatch() {
        if (this.eventQueue.length === 0) return;
        
        const batch = this.eventQueue.splice(0, this.batchSize);
        
        try {
            await this.saveBatchToStorage(batch);
            this.eventStats.processed += batch.length;
        } catch (error) {
            console.error('Failed to process batch:', error);
            this.eventStats.errors += batch.length;
            
            // 失敗したバッチを再キューイング（最大リトライ回数まで）
            await this.retryBatch(batch);
        }
    }
    
    /**
     * バッチをストレージに保存
     * @param {Array} batch - バッチデータ
     */
    async saveBatchToStorage(batch) {
        // イベントタイプ別にグループ化
        const groupedEvents = this.groupEventsByType(batch);
        
        for (const [type, events] of Object.entries(groupedEvents)) {
            const storeName = this.getStoreNameForEventType(type);
            if (storeName) {
                const data = events.map(event => event.data);
                await this.storageManager.saveData(storeName, data);
            }
        }
    }
    
    /**
     * イベントタイプ別グループ化
     * @param {Array} events - イベント配列
     * @returns {Object}
     */
    groupEventsByType(events) {
        const grouped = {};
        
        events.forEach(event => {
            if (!grouped[event.type]) {
                grouped[event.type] = [];
            }
            grouped[event.type].push(event);
        });
        
        return grouped;
    }
    
    /**
     * イベントタイプに対応するストア名を取得
     * @param {string} eventType - イベントタイプ
     * @returns {string|null}
     */
    getStoreNameForEventType(eventType) {
        const storeMap = {
            'session': 'sessions',
            'bubbleInteraction': 'bubbleInteractions',
            'performance': 'performance',
            'gameBalance': 'bubbleInteractions', // バブルインタラクションと統合
            'score': 'bubbleInteractions', // スコアイベントも統合
            'itemUsage': 'bubbleInteractions' // アイテム使用も統合
        };
        
        return storeMap[eventType] || null;
    }
    
    /**
     * バッチリトライ処理
     * @param {Array} batch - 失敗したバッチ
     * @param {number} retryCount - リトライ回数
     */
    async retryBatch(batch, retryCount = 0) {
        if (retryCount >= this.maxRetries) {
            console.error('Max retries reached, dropping batch');
            this.eventStats.dropped += batch.length;
            return;
        }
        
        // 指数バックオフでリトライ
        const delay = this.retryDelay * Math.pow(2, retryCount);
        
        setTimeout(async () => {
            try {
                await this.saveBatchToStorage(batch);
                this.eventStats.processed += batch.length;
            } catch (error) {
                console.error(`Retry ${retryCount + 1} failed:`, error);
                await this.retryBatch(batch, retryCount + 1);
            }
        }, delay);
    }
    
    /**
     * セッションID生成
     * @returns {string}
     */
    generateSessionId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `session_${timestamp}_${random}`;
    }
    
    /**
     * データ収集の有効/無効切り替え
     * @param {boolean} enabled - 有効状態
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        
        if (enabled) {
            this.startBatchProcessing();
        } else {
            this.stopBatchProcessing();
            // 残りのキューを処理
            if (this.eventQueue.length > 0) {
                this.processBatch();
            }
        }
    }
    
    /**
     * データ収集の一時停止/再開
     * @param {boolean} paused - 一時停止状態
     */
    setPaused(paused) {
        this.isPaused = paused;
        
        if (!paused && this.eventQueue.length > 0) {
            // 再開時に残りのキューを処理
            this.processBatch();
        }
    }
    
    /**
     * イベント統計の取得
     * @returns {Object}
     */
    getEventStats() {
        return {
            ...this.eventStats,
            queueSize: this.eventQueue.length,
            currentSessionId: this.currentSessionId,
            isEnabled: this.isEnabled,
            isPaused: this.isPaused
        };
    }
    
    /**
     * キューのクリア
     */
    clearQueue() {
        const droppedCount = this.eventQueue.length;
        this.eventQueue = [];
        this.eventStats.dropped += droppedCount;
    }
    
    /**
     * 強制バッチ処理（即座に全キューを処理）
     */
    async flushQueue() {
        while (this.eventQueue.length > 0) {
            await this.processBatch();
        }
    }
    
    /**
     * データコレクターの破棄
     */
    destroy() {
        this.stopBatchProcessing();
        this.flushQueue(); // 残りのデータを保存
        this.eventQueue = [];
        this.currentSessionId = null;
        this.sessionStartTime = null;
    }
}