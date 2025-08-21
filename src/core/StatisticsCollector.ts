/**
 * 統計データ収集クラス
 * イベントキューとバッチ処理による効率的なデータ収集を実装
 */
export class StatisticsCollector {
    constructor(statisticsManager) {
        this.statisticsManager = statisticsManager;
        
        // イベントキュー
        this.eventQueue = [];
        this.batchSize = 100;
        this.flushInterval = 1000; // 1秒
        
        // パフォーマンス最適化
        this.isProcessing = false;
        this.lastFlushTime = Date.now();
        this.eventBuffer = new Map(); // イベントタイプ別バッファ
        
        // 統計収集カテゴリ
        this.eventCategories = {
            BUBBLE: 'bubble',
            COMBO: 'combo',
            DAMAGE: 'damage',
            HEAL: 'heal',
            SPECIAL_EFFECT: 'special_effect',
            GAME_STATE: 'game_state',
            USER_ACTION: 'user_action';
    ,}

            PERFORMANCE: 'performance' 
    };
        this.setupEventListeners();
        this.startBatchProcessing();
    }
    
    /**
     * イベント収集メソッド
     */
    collectEvent(eventType, data, category = this.eventCategories.GAME_STATE) {
        const event = {
            type: eventType;
            category: category;
            data: data,
    timestamp: Date.now();
    }
            sessionId: this.generateSessionId(); 
    };
        
        // イベントバッファに追加
        this.addToBuffer(event);
        
        // キューに追加
        this.eventQueue.push(event);
        
        // バッチサイズに達した場合、即座にフラッシュ
        if (this.eventQueue.length >= this.batchSize) { this.flushEvents(); }
    }
    
    /**
     * バブル関連イベントの収集
     */
    collectBubbleEvent(eventType, bubbleData) { this.collectEvent(eventType, {
            bubbleType: bubbleData.type;
            position: bubbleData.position);
            reactionTime: bubbleData.reactionTime),
    comboMultiplier: bubbleData.comboMultiplier, }
            scoreEarned: bubbleData.scoreEarned), this.eventCategories.BUBBLE); }
    }
    
    /**
     * コンボ関連イベントの収集
     */
    collectComboEvent(eventType, comboData) { this.collectEvent(eventType, {
            comboCount: comboData.count);
            comboMultiplier: comboData.multiplier),
    comboBroken: comboData.broken, }
            totalScore: comboData.totalScore), this.eventCategories.COMBO); }
    }
    
    /**
     * ダメージ関連イベントの収集
     */
    collectDamageEvent(eventType, damageData) { this.collectEvent(eventType, {
            damageAmount: damageData.amount);
            damageSource: damageData.source),
    currentHP: damageData.currentHP, }
            maxHP: damageData.maxHP), this.eventCategories.DAMAGE); }
    }
    
    /**
     * 回復関連イベントの収集
     */
    collectHealEvent(eventType, healData) { this.collectEvent(eventType, {
            healAmount: healData.amount);
            healSource: healData.source),
    currentHP: healData.currentHP, }
            maxHP: healData.maxHP), this.eventCategories.HEAL); }
    }
    
    /**
     * 特殊効果関連イベントの収集
     */
    collectSpecialEffectEvent(eventType, effectData) { this.collectEvent(eventType, {
            effectType: effectData.type);
            duration: effectData.duration),
    intensity: effectData.intensity, }
            triggeredBy: effectData.triggeredBy), this.eventCategories.SPECIAL_EFFECT); }
    }
    
    /**
     * ユーザー操作関連イベントの収集
     */
    collectUserActionEvent(eventType, actionData) { this.collectEvent(eventType, {
            actionType: actionData.type);
            position: actionData.position),
    timestamp: actionData.timestamp, }
            inputDevice: actionData.inputDevice), this.eventCategories.USER_ACTION); }
    }
    
    /**
     * パフォーマンス関連イベントの収集
     */
    collectPerformanceEvent(eventType, performanceData) { this.collectEvent(eventType, {
            frameRate: performanceData.frameRate);
            memoryUsage: performanceData.memoryUsage),
    processingTime: performanceData.processingTime, }
            renderTime: performanceData.renderTime), this.eventCategories.PERFORMANCE); }
    }
    
    /**
     * イベントバッファへの追加
     */
    addToBuffer(event) {
        
    }
        const key = `${event.category}_${event.type}`;
        
        if(!this.eventBuffer.has(key) { this.eventBuffer.set(key, []); }
        
        this.eventBuffer.get(key).push(event);
        
        // バッファサイズ制限
        const buffer = this.eventBuffer.get(key);
        if (buffer.length > 50) { buffer.shift(); // 古いイベントを削除 }
    }
    
    /**
     * イベントリスナーの設定
     */''
    setupEventListeners()';
        window.addEventListener('beforeunload', () => { this.flushEvents(true); });
        
        // 定期的なフラッシュ
        this.flushTimer = setInterval(() => {  const now = Date.now();
            if (now - this.lastFlushTime >= this.flushInterval) { }
                this.flushEvents(); }
            }''
        }, this.flushInterval';
        ';
        // フォーカス喪失時のフラッシュ
        window.addEventListener('blur', () => { this.flushEvents(); });
    }
    
    /**
     * バッチ処理の開始
     */
    startBatchProcessing() {
        this.batchProcessor = setInterval(() => { 
    }
            if (!this.isProcessing && this.eventQueue.length > 0) { }
                this.processEventBatch(); }
}, 100); // 100ms間隔でバッチ処理
    }
    
    /**
     * イベントキューのフラッシュ
     */
    flushEvents(immediate = false) {
        if (this.eventQueue.length === 0) return;
        
        if (immediate || this.eventQueue.length >= this.batchSize) {
    }
            this.processEventBatch(); }
        }
        
        this.lastFlushTime = Date.now();
    }
    
    /**
     * イベントバッチの処理
     */
    async processEventBatch() { if (this.isProcessing) return;
        
        this.isProcessing = true;
        const startTime = performance.now();
        
        try {
            const eventsToProcess = this.eventQueue.splice(0, this.batchSize);
            
            if(eventsToProcess.length === 0) {
            
                this.isProcessing = false;
            
            }
                return; }
            }
            
            // カテゴリ別にイベントをグループ化
            const categorizedEvents = this.categorizeEvents(eventsToProcess);
            
            // 非同期でカテゴリ別処理
            await Promise.all([);]
                this.processBubbleEvents(categorizedEvents.bubble || []),
                this.processComboEvents(categorizedEvents.combo || []),
                this.processDamageEvents(categorizedEvents.damage || []),
                this.processHealEvents(categorizedEvents.heal || []),
                this.processSpecialEffectEvents(categorizedEvents.special_effect || []),
                this.processGameStateEvents(categorizedEvents.game_state || []),
                this.processUserActionEvents(categorizedEvents.user_action || []),
                this.processPerformanceEvents(categorizedEvents.performance || []);
            ]);
            
            // 処理時間の記録
            const processingTime = performance.now() - startTime;
            this.recordProcessingMetrics(processingTime, eventsToProcess.length);

        } catch (error) {
            console.error('Error processing event batch:', error);
            this.handleProcessingError(error); } finally { this.isProcessing = false; }
    }
    
    /**
     * イベントのカテゴリ別分類
     */
    categorizeEvents(events) {
        
    }
        const categorized = {};
        
        events.forEach(event => {  )
            const category = event.category);
            if (!categorized[category]) { }
                categorized[category] = []; }
            }
            categorized[category].push(event);
        });
        
        return categorized;
    }
    
    /**
     * バブル関連イベントの処理
     */'
    async processBubbleEvents(events) { for (const, event of, events) {''
            switch(event.type) {'

                case 'bubble_popped':;
                    this.statisticsManager.onBubblePopped(;
                        event.data.bubbleType)';
                        event.data.reactionTime''';
                    ');

                    break;''
                case 'bubble_missed':;
                    this.statisticsManager.statistics.totalBubblesMissed++;

                    break;''
                case 'bubble_spawned':;
                    // バブル生成統計の更新
            }
                    break; }
}
    }
    
    /**
     * コンボ関連イベントの処理
     */
    async processComboEvents(events) { for (const, event of, events) {''
            switch(event.type) {'

                case 'combo_updated':;
                    this.statisticsManager.onComboUpdate(;
                        event.data.comboCount)';
                        event.data.comboBroken''';
                    ');

                    break;''
                case 'combo_broken':;
                    this.statisticsManager.onComboUpdate(0, true);
            }
                    break; }
}
    }
    
    /**
     * ダメージ関連イベントの処理
     */'
    async processDamageEvents(events) { for (const, event of, events) {''
            switch(event.type) {'

                case 'damage_taken':;
                    this.statisticsManager.onDamageTaken(event.data.damageAmount);
            }
                    break; }
}
    }
    
    /**
     * 回復関連イベントの処理
     */'
    async processHealEvents(events) { for (const, event of, events) {''
            switch(event.type) {'

                case 'hp_healed':;
                    this.statisticsManager.onHpHealed(event.data.healAmount);
            }
                    break; }
}
    }
    
    /**
     * 特殊効果関連イベントの処理
     */'
    async processSpecialEffectEvents(events) { for (const, event of, events) {''
            switch(event.type) {'

                case 'special_effect_activated':;
                    this.statisticsManager.onSpecialEffect(event.data.effectType);
            }
                    break; }
}
    }
    
    /**
     * ゲーム状態関連イベントの処理
     */'
    async processGameStateEvents(events) { for (const, event of, events) {''
            switch(event.type) {'

                case 'game_started':'';
                    this.statisticsManager.onGameStart(event.data.stageId);

                    break;''
                case 'game_ended':;
                    this.statisticsManager.onGameEnd(event.data);
            }
                    break; }
}
    }
    
    /**
     * ユーザー操作関連イベントの処理
     */'
    async processUserActionEvents(events) { for (const, event of, events) {''
            switch(event.type) {'

                case 'drag_operation':'';
                    this.statisticsManager.onDragOperation('''
                case 'click_action': ;
                    // クリック統計の更新
            }
                    break; }
}
    }
    
    /**
     * パフォーマンス関連イベントの処理)
     */)
    async processPerformanceEvents(events) { // パフォーマンス統計の更新
        // 将来的にパフォーマンス最適化で使用 }
    
    /**
     * 処理メトリクスの記録
     */
    recordProcessingMetrics(processingTime, eventCount) {
        // 処理時間の統計
        if (!this.processingMetrics) {
            this.processingMetrics = {
                totalProcessingTime: 0;
                totalEventsProcessed: 0,
    averageProcessingTime: 0;
    }
                maxProcessingTime: 0 
    }
        
        this.processingMetrics.totalProcessingTime += processingTime;
        this.processingMetrics.totalEventsProcessed += eventCount;
        this.processingMetrics.averageProcessingTime = ;
            this.processingMetrics.totalProcessingTime / this.processingMetrics.totalEventsProcessed;
        this.processingMetrics.maxProcessingTime = ;
            Math.max(this.processingMetrics.maxProcessingTime, processingTime);
    }
    
    /**
     * 処理エラーのハンドリング
     */''
    handleProcessingError(error) {'

        console.error('StatisticsCollector processing error:', error);
        
        // エラー統計の更新
        if (!this.errorMetrics) {
            this.errorMetrics = {
                totalErrors: 0,
                errorTypes: new Map()';
        const errorType = error.name || 'UnknownError');
        this.errorMetrics.errorTypes.set();
            errorType);
            (this.errorMetrics.errorTypes.get(errorType) || 0) + 1;
    ,}
        ); }
    }
    
    /**
     * セッションIDの生成
     */
    generateSessionId() { if (!this.sessionId) { }
            this.sessionId = `session_${Date.now())_${Math.random().toString(36).substr(2, 9})`;
        }
        return this.sessionId;
    }
    
    /**
     * 統計概要の取得
     */
    getCollectorStatistics() {
        return { queueSize: this.eventQueue.length,
            bufferSize: Array.from(this.eventBuffer.values().reduce((sum, buffer) => sum + buffer.length, 0),
            processingMetrics: this.processingMetrics,
    errorMetrics: this.errorMetrics;
    ,}
            sessionId: this.sessionId, };
            isProcessing: this.isProcessing 
    }
    
    /**
     * バッファのクリア
     */
    clearBuffer() {
        this.eventBuffer.clear();
    }
        this.eventQueue.length = 0; }
    }
    
    /**
     * バッチ処理メソッド（後方互換性のため）
     * processEventBatch への alias
     */
    async processBatch() { return this.processEventBatch(); }
    
    /**
     * リソースのクリーンアップ
     */
    destroy() {
        // タイマーのクリア
        if (this.flushTimer) {
    }
            clearInterval(this.flushTimer); }
        }
        if (this.batchProcessor) { clearInterval(this.batchProcessor); }
        
        // 最後のフラッシュ
        this.flushEvents(true);
        // バッファのクリア
        this.clearBuffer()';
        window.removeEventListener('beforeunload', this.flushEvents';''
        window.removeEventListener('blur', this.flushEvents';

    }''
}