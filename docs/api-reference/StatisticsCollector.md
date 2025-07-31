# StatisticsCollector

## 概要

ファイル: `core/StatisticsCollector.js`  
最終更新: 2025/7/28 16:45:38

## 目次

## クラス
- [StatisticsCollector](#statisticscollector)
## 定数
- [event](#event)
- [key](#key)
- [buffer](#buffer)
- [now](#now)
- [startTime](#starttime)
- [eventsToProcess](#eventstoprocess)
- [categorizedEvents](#categorizedevents)
- [processingTime](#processingtime)
- [categorized](#categorized)
- [category](#category)
- [errorType](#errortype)

---

## StatisticsCollector

### コンストラクタ

```javascript
new StatisticsCollector(statisticsManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `statisticsManager` | 説明なし |
| `eventQueue` | イベントキュー |
| `batchSize` | 説明なし |
| `flushInterval` | 説明なし |
| `isProcessing` | パフォーマンス最適化 |
| `lastFlushTime` | 説明なし |
| `eventBuffer` | 説明なし |
| `eventCategories` | 統計収集カテゴリ |
| `flushTimer` | 定期的なフラッシュ |
| `batchProcessor` | 説明なし |
| `lastFlushTime` | 説明なし |
| `isProcessing` | 説明なし |
| `isProcessing` | 説明なし |
| `isProcessing` | 説明なし |
| `processingMetrics` | 説明なし |
| `errorMetrics` | 説明なし |
| `sessionId` | 説明なし |

### メソッド

#### collectEvent

**シグネチャ**:
```javascript
 collectEvent(eventType, data, category = this.eventCategories.GAME_STATE)
```

**パラメーター**:
- `eventType`
- `data`
- `category = this.eventCategories.GAME_STATE`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectEvent(eventType, data, category = this.eventCategories.GAME_STATE);

// collectEventの実用的な使用例
const result = instance.collectEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バッチサイズに達した場合、即座にフラッシュ

**シグネチャ**:
```javascript
 if (this.eventQueue.length >= this.batchSize)
```

**パラメーター**:
- `this.eventQueue.length >= this.batchSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.eventQueue.length >= this.batchSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectBubbleEvent

**シグネチャ**:
```javascript
 collectBubbleEvent(eventType, bubbleData)
```

**パラメーター**:
- `eventType`
- `bubbleData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectBubbleEvent(eventType, bubbleData);

// collectBubbleEventの実用的な使用例
const result = instance.collectBubbleEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectComboEvent

**シグネチャ**:
```javascript
 collectComboEvent(eventType, comboData)
```

**パラメーター**:
- `eventType`
- `comboData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectComboEvent(eventType, comboData);

// collectComboEventの実用的な使用例
const result = instance.collectComboEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectDamageEvent

**シグネチャ**:
```javascript
 collectDamageEvent(eventType, damageData)
```

**パラメーター**:
- `eventType`
- `damageData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectDamageEvent(eventType, damageData);

// collectDamageEventの実用的な使用例
const result = instance.collectDamageEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectHealEvent

**シグネチャ**:
```javascript
 collectHealEvent(eventType, healData)
```

**パラメーター**:
- `eventType`
- `healData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectHealEvent(eventType, healData);

// collectHealEventの実用的な使用例
const result = instance.collectHealEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectSpecialEffectEvent

**シグネチャ**:
```javascript
 collectSpecialEffectEvent(eventType, effectData)
```

**パラメーター**:
- `eventType`
- `effectData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectSpecialEffectEvent(eventType, effectData);

// collectSpecialEffectEventの実用的な使用例
const result = instance.collectSpecialEffectEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectUserActionEvent

**シグネチャ**:
```javascript
 collectUserActionEvent(eventType, actionData)
```

**パラメーター**:
- `eventType`
- `actionData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectUserActionEvent(eventType, actionData);

// collectUserActionEventの実用的な使用例
const result = instance.collectUserActionEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectPerformanceEvent

**シグネチャ**:
```javascript
 collectPerformanceEvent(eventType, performanceData)
```

**パラメーター**:
- `eventType`
- `performanceData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectPerformanceEvent(eventType, performanceData);

// collectPerformanceEventの実用的な使用例
const result = instance.collectPerformanceEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addToBuffer

**シグネチャ**:
```javascript
 addToBuffer(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addToBuffer(event);

// addToBufferの実用的な使用例
const result = instance.addToBuffer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (buffer.length > 50)
```

**パラメーター**:
- `buffer.length > 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(buffer.length > 50);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupEventListeners

**シグネチャ**:
```javascript
 setupEventListeners()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupEventListeners();

// setupEventListenersの実用的な使用例
const result = instance.setupEventListeners(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (now - this.lastFlushTime >= this.flushInterval)
```

**パラメーター**:
- `now - this.lastFlushTime >= this.flushInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(now - this.lastFlushTime >= this.flushInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startBatchProcessing

**シグネチャ**:
```javascript
 startBatchProcessing()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startBatchProcessing();

// startBatchProcessingの実用的な使用例
const result = instance.startBatchProcessing(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.isProcessing && this.eventQueue.length > 0)
```

**パラメーター**:
- `!this.isProcessing && this.eventQueue.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.isProcessing && this.eventQueue.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### flushEvents

**シグネチャ**:
```javascript
 flushEvents(immediate = false)
```

**パラメーター**:
- `immediate = false`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.flushEvents(immediate = false);

// flushEventsの実用的な使用例
const result = instance.flushEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (immediate || this.eventQueue.length >= this.batchSize)
```

**パラメーター**:
- `immediate || this.eventQueue.length >= this.batchSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(immediate || this.eventQueue.length >= this.batchSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processEventBatch

**シグネチャ**:
```javascript
async processEventBatch()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processEventBatch();

// processEventBatchの実用的な使用例
const result = instance.processEventBatch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (eventsToProcess.length === 0)
```

**パラメーター**:
- `eventsToProcess.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(eventsToProcess.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### categorizeEvents

**シグネチャ**:
```javascript
 categorizeEvents(events)
```

**パラメーター**:
- `events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.categorizeEvents(events);

// categorizeEventsの実用的な使用例
const result = instance.categorizeEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(event => {
            const category = event.category;
            if (!categorized[category])
```

**パラメーター**:
- `event => {
            const category = event.category;
            if (!categorized[category]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(event => {
            const category = event.category;
            if (!categorized[category]);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processBubbleEvents

**シグネチャ**:
```javascript
async processBubbleEvents(events)
```

**パラメーター**:
- `events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processBubbleEvents(events);

// processBubbleEventsの実用的な使用例
const result = instance.processBubbleEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const event of events)
```

**パラメーター**:
- `const event of events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const event of events);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (event.type)
```

**パラメーター**:
- `event.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(event.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processComboEvents

**シグネチャ**:
```javascript
async processComboEvents(events)
```

**パラメーター**:
- `events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processComboEvents(events);

// processComboEventsの実用的な使用例
const result = instance.processComboEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const event of events)
```

**パラメーター**:
- `const event of events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const event of events);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (event.type)
```

**パラメーター**:
- `event.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(event.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processDamageEvents

**シグネチャ**:
```javascript
async processDamageEvents(events)
```

**パラメーター**:
- `events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processDamageEvents(events);

// processDamageEventsの実用的な使用例
const result = instance.processDamageEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const event of events)
```

**パラメーター**:
- `const event of events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const event of events);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (event.type)
```

**パラメーター**:
- `event.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(event.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processHealEvents

**シグネチャ**:
```javascript
async processHealEvents(events)
```

**パラメーター**:
- `events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processHealEvents(events);

// processHealEventsの実用的な使用例
const result = instance.processHealEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const event of events)
```

**パラメーター**:
- `const event of events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const event of events);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (event.type)
```

**パラメーター**:
- `event.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(event.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processSpecialEffectEvents

**シグネチャ**:
```javascript
async processSpecialEffectEvents(events)
```

**パラメーター**:
- `events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processSpecialEffectEvents(events);

// processSpecialEffectEventsの実用的な使用例
const result = instance.processSpecialEffectEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const event of events)
```

**パラメーター**:
- `const event of events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const event of events);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (event.type)
```

**パラメーター**:
- `event.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(event.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processGameStateEvents

**シグネチャ**:
```javascript
async processGameStateEvents(events)
```

**パラメーター**:
- `events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processGameStateEvents(events);

// processGameStateEventsの実用的な使用例
const result = instance.processGameStateEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const event of events)
```

**パラメーター**:
- `const event of events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const event of events);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (event.type)
```

**パラメーター**:
- `event.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(event.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processUserActionEvents

**シグネチャ**:
```javascript
async processUserActionEvents(events)
```

**パラメーター**:
- `events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processUserActionEvents(events);

// processUserActionEventsの実用的な使用例
const result = instance.processUserActionEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const event of events)
```

**パラメーター**:
- `const event of events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const event of events);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (event.type)
```

**パラメーター**:
- `event.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(event.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processPerformanceEvents

**シグネチャ**:
```javascript
async processPerformanceEvents(events)
```

**パラメーター**:
- `events`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processPerformanceEvents(events);

// processPerformanceEventsの実用的な使用例
const result = instance.processPerformanceEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordProcessingMetrics

**シグネチャ**:
```javascript
 recordProcessingMetrics(processingTime, eventCount)
```

**パラメーター**:
- `processingTime`
- `eventCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordProcessingMetrics(processingTime, eventCount);

// recordProcessingMetricsの実用的な使用例
const result = instance.recordProcessingMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

処理時間の統計

**シグネチャ**:
```javascript
 if (!this.processingMetrics)
```

**パラメーター**:
- `!this.processingMetrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.processingMetrics);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleProcessingError

**シグネチャ**:
```javascript
 handleProcessingError(error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleProcessingError(error);

// handleProcessingErrorの実用的な使用例
const result = instance.handleProcessingError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

エラー統計の更新

**シグネチャ**:
```javascript
 if (!this.errorMetrics)
```

**パラメーター**:
- `!this.errorMetrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.errorMetrics);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateSessionId

**シグネチャ**:
```javascript
 generateSessionId()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateSessionId();

// generateSessionIdの実用的な使用例
const result = instance.generateSessionId(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.sessionId)
```

**パラメーター**:
- `!this.sessionId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.sessionId);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCollectorStatistics

**シグネチャ**:
```javascript
 getCollectorStatistics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCollectorStatistics();

// getCollectorStatisticsの実用的な使用例
const result = instance.getCollectorStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearBuffer

**シグネチャ**:
```javascript
 clearBuffer()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearBuffer();

// clearBufferの実用的な使用例
const result = instance.clearBuffer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### destroy

**シグネチャ**:
```javascript
 destroy()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.destroy();

// リソースのクリーンアップ
instance.destroy();
console.log('Resources cleaned up');
```

#### if

タイマーのクリア

**シグネチャ**:
```javascript
 if (this.flushTimer)
```

**パラメーター**:
- `this.flushTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.flushTimer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.batchProcessor)
```

**パラメーター**:
- `this.batchProcessor`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.batchProcessor);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `event` | 説明なし |
| `key` | 説明なし |
| `buffer` | 説明なし |
| `now` | 説明なし |
| `startTime` | 説明なし |
| `eventsToProcess` | 説明なし |
| `categorizedEvents` | 説明なし |
| `processingTime` | 説明なし |
| `categorized` | 説明なし |
| `category` | 説明なし |
| `errorType` | 説明なし |

---

