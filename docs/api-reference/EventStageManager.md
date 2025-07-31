# EventStageManager

## 概要

ファイル: `core/EventStageManager.js`  
最終更新: 2025/7/19 4:20:43

## 目次

## クラス
- [EventStageManager](#eventstagemanager)
## 定数
- [now](#now)
- [availableEvents](#availableevents)
- [availability](#availability)
- [now](#now)
- [availability](#availability)
- [dayOfWeek](#dayofweek)
- [weekNumber](#weeknumber)
- [dayOfMonth](#dayofmonth)
- [month](#month)
- [now](#now)
- [availability](#availability)
- [tomorrow](#tomorrow)
- [daysUntilWeekend](#daysuntilweekend)
- [nextWeekend](#nextweekend)
- [event](#event)
- [specialRules](#specialrules)
- [event](#event)
- [historyEntry](#historyentry)
- [rewards](#rewards)
- [stats](#stats)
- [eventCounts](#eventcounts)
- [event](#event)
- [endTime](#endtime)
- [data](#data)
- [savedData](#saveddata)
- [data](#data)

---

## EventStageManager

### コンストラクタ

```javascript
new EventStageManager(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `eventStages` | 説明なし |
| `activeEvents` | 説明なし |
| `eventHistory` | 説明なし |
| `eventHistory` | 説明なし |
| `activeEvents` | 説明なし |
| `eventHistory` | 説明なし |
| `activeEvents` | 説明なし |
| `eventHistory` | 説明なし |

### メソッド

#### initializeEventStages

**シグネチャ**:
```javascript
 initializeEventStages()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeEventStages();

// initializeEventStagesの実用的な使用例
const result = instance.initializeEventStages(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAvailableEvents

**シグネチャ**:
```javascript
 getAvailableEvents()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAvailableEvents();

// getAvailableEventsの実用的な使用例
const result = instance.getAvailableEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isEventAvailable

**シグネチャ**:
```javascript
 isEventAvailable(event, currentTime)
```

**パラメーター**:
- `event`
- `currentTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isEventAvailable(event, currentTime);

// isEventAvailableの実用的な使用例
const result = instance.isEventAvailable(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

特別イベントは手動で有効化

**シグネチャ**:
```javascript
 if (event.type === 'special')
```

**パラメーター**:
- `event.type === 'special'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.type === 'special');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

期間限定イベントの場合

**シグネチャ**:
```javascript
 if (availability.startDate && availability.endDate)
```

**パラメーター**:
- `availability.startDate && availability.endDate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(availability.startDate && availability.endDate);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

定期イベントの場合

**シグネチャ**:
```javascript
 if (availability.recurring)
```

**パラメーター**:
- `availability.recurring`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(availability.recurring);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isRecurringEventActive

**シグネチャ**:
```javascript
 isRecurringEventActive(event, currentTime)
```

**パラメーター**:
- `event`
- `currentTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isRecurringEventActive(event, currentTime);

// isRecurringEventActiveの実用的な使用例
const result = instance.isRecurringEventActive(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (availability.recurring)
```

**パラメーター**:
- `availability.recurring`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(availability.recurring);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEventTimeRemaining

**シグネチャ**:
```javascript
 getEventTimeRemaining(event, currentTime)
```

**パラメーター**:
- `event`
- `currentTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEventTimeRemaining(event, currentTime);

// getEventTimeRemainingの実用的な使用例
const result = instance.getEventTimeRemaining(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event.availability.endDate)
```

**パラメーター**:
- `event.availability.endDate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.availability.endDate);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTimeUntilNextRecurrence

**シグネチャ**:
```javascript
 getTimeUntilNextRecurrence(event, currentTime)
```

**パラメーター**:
- `event`
- `currentTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTimeUntilNextRecurrence(event, currentTime);

// getTimeUntilNextRecurrenceの実用的な使用例
const result = instance.getTimeUntilNextRecurrence(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (availability.recurring)
```

**パラメーター**:
- `availability.recurring`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(availability.recurring);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startEventStage

**シグネチャ**:
```javascript
 startEventStage(eventId)
```

**パラメーター**:
- `eventId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startEventStage(eventId);

// startEventStageの実用的な使用例
const result = instance.startEventStage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!event)
```

**パラメーター**:
- `!event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!event);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyEventSettings

**シグネチャ**:
```javascript
 applyEventSettings(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyEventSettings(event);

// applyEventSettingsの実用的な使用例
const result = instance.applyEventSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

グローバルスコア倍率

**シグネチャ**:
```javascript
 if (specialRules.globalScoreMultiplier)
```

**パラメーター**:
- `specialRules.globalScoreMultiplier`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(specialRules.globalScoreMultiplier);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

開始HP設定

**シグネチャ**:
```javascript
 if (specialRules.startingHP)
```

**パラメーター**:
- `specialRules.startingHP`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(specialRules.startingHP);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

視覚効果

**シグネチャ**:
```javascript
 if (specialRules.nightMode)
```

**パラメーター**:
- `specialRules.nightMode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(specialRules.nightMode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (specialRules.reducedVisibility)
```

**パラメーター**:
- `specialRules.reducedVisibility`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(specialRules.reducedVisibility);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

特殊生成ルール

**シグネチャ**:
```javascript
 if (specialRules.goldenSpawnRate)
```

**パラメーター**:
- `specialRules.goldenSpawnRate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(specialRules.goldenSpawnRate);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (specialRules.phantomSpawnRate)
```

**パラメーター**:
- `specialRules.phantomSpawnRate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(specialRules.phantomSpawnRate);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (specialRules.explosiveSpawnRate)
```

**パラメーター**:
- `specialRules.explosiveSpawnRate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(specialRules.explosiveSpawnRate);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### completeEventStage

**シグネチャ**:
```javascript
 completeEventStage(eventId, finalScore, stats)
```

**パラメーター**:
- `eventId`
- `finalScore`
- `stats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.completeEventStage(eventId, finalScore, stats);

// completeEventStageの実用的な使用例
const result = instance.completeEventStage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (historyEntry)
```

**パラメーター**:
- `historyEntry`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(historyEntry);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### grantEventRewards

**シグネチャ**:
```javascript
 grantEventRewards(event, finalScore, stats)
```

**パラメーター**:
- `event`
- `finalScore`
- `stats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.grantEventRewards(event, finalScore, stats);

// grantEventRewardsの実用的な使用例
const result = instance.grantEventRewards(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

完了報酬

**シグネチャ**:
```javascript
 if (rewards.completion)
```

**パラメーター**:
- `rewards.completion`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rewards.completion);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ハイスコア報酬

**シグネチャ**:
```javascript
 if (rewards.highScore && finalScore >= rewards.highScore.threshold)
```

**パラメーター**:
- `rewards.highScore && finalScore >= rewards.highScore.threshold`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rewards.highScore && finalScore >= rewards.highScore.threshold);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

特殊条件報酬

**シグネチャ**:
```javascript
 if (rewards.survivalBonus && stats.survived)
```

**パラメーター**:
- `rewards.survivalBonus && stats.survived`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rewards.survivalBonus && stats.survived);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rewards.chainMaster && stats.maxChain >= rewards.chainMaster.chains)
```

**パラメーター**:
- `rewards.chainMaster && stats.maxChain >= rewards.chainMaster.chains`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rewards.chainMaster && stats.maxChain >= rewards.chainMaster.chains);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rewards.perfectSpeed && stats.targetReached && stats.timeRemaining > 0)
```

**パラメーター**:
- `rewards.perfectSpeed && stats.targetReached && stats.timeRemaining > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rewards.perfectSpeed && stats.targetReached && stats.timeRemaining > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rewards.ironWill && stats.lowHpSurvival)
```

**パラメーター**:
- `rewards.ironWill && stats.lowHpSurvival`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rewards.ironWill && stats.lowHpSurvival);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

特別報酬

**シグネチャ**:
```javascript
 if (rewards.anniversary)
```

**パラメーター**:
- `rewards.anniversary`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rewards.anniversary);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

AP付与

**シグネチャ**:
```javascript
 if (totalAP > 0)
```

**パラメーター**:
- `totalAP > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(totalAP > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEventHistory

**シグネチャ**:
```javascript
 getEventHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEventHistory();

// getEventHistoryの実用的な使用例
const result = instance.getEventHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEventStatistics

**シグネチャ**:
```javascript
 getEventStatistics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEventStatistics();

// getEventStatisticsの実用的な使用例
const result = instance.getEventStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (entry.finalScore)
```

**パラメーター**:
- `entry.finalScore`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(entry.finalScore);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (count > maxCount)
```

**パラメーター**:
- `count > maxCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(count > maxCount);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### activateSpecialEvent

**シグネチャ**:
```javascript
 activateSpecialEvent(eventId, duration)
```

**パラメーター**:
- `eventId`
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.activateSpecialEvent(eventId, duration);

// activateSpecialEventの実用的な使用例
const result = instance.activateSpecialEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!event || event.type !== 'special')
```

**パラメーター**:
- `!event || event.type !== 'special'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!event || event.type !== 'special');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### save

**シグネチャ**:
```javascript
 save()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.save();

// saveの実用的な使用例
const result = instance.save(/* 適切なパラメータ */);
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

#### load

**シグネチャ**:
```javascript
 load()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.load();

// loadの実用的な使用例
const result = instance.load(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (savedData)
```

**パラメーター**:
- `savedData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(savedData);

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

#### reset

**シグネチャ**:
```javascript
 reset()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.reset();

// resetの実用的な使用例
const result = instance.reset(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `now` | 説明なし |
| `availableEvents` | 説明なし |
| `availability` | 説明なし |
| `now` | 説明なし |
| `availability` | 説明なし |
| `dayOfWeek` | 説明なし |
| `weekNumber` | 説明なし |
| `dayOfMonth` | 説明なし |
| `month` | 説明なし |
| `now` | 説明なし |
| `availability` | 説明なし |
| `tomorrow` | 説明なし |
| `daysUntilWeekend` | 説明なし |
| `nextWeekend` | 説明なし |
| `event` | 説明なし |
| `specialRules` | 説明なし |
| `event` | 説明なし |
| `historyEntry` | 説明なし |
| `rewards` | 説明なし |
| `stats` | 説明なし |
| `eventCounts` | 説明なし |
| `event` | 説明なし |
| `endTime` | 説明なし |
| `data` | 説明なし |
| `savedData` | 説明なし |
| `data` | 説明なし |

---

