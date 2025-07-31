# AudioVisualSynchronizer

## 概要

ファイル: `effects/AudioVisualSynchronizer.js`  
最終更新: 2025/7/30 0:29:15

## 目次

## クラス
- [AudioVisualSynchronizer](#audiovisualsynchronizer)
## 関数
- [getAudioVisualSynchronizer()](#getaudiovisualsynchronizer)
## 定数
- [mapping](#mapping)
- [delay](#delay)
- [effectId](#effectid)
- [resolvedParams](#resolvedparams)
- [resolved](#resolved)
- [average](#average)
- [midRange](#midrange)
- [average](#average)
- [bassRange](#bassrange)
- [average](#average)
- [trebleRange](#treblerange)
- [average](#average)
- [currentTime](#currenttime)
- [toRemove](#toremove)
- [elapsed](#elapsed)
- [currentTime](#currenttime)
- [toExecute](#toexecute)
- [scheduled](#scheduled)
- [executeTime](#executetime)

---

## AudioVisualSynchronizer

### コンストラクタ

```javascript
new AudioVisualSynchronizer()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `errorHandler` | 説明なし |
| `configManager` | 説明なし |
| `audioManager` | システム参照 |
| `particleManager` | 説明なし |
| `effectManager` | 説明なし |
| `seasonalManager` | 説明なし |
| `syncEnabled` | 同期設定 |
| `visualFeedbackEnabled` | 説明なし |
| `audioReactiveEffects` | 説明なし |
| `timingCompensation` | 説明なし |
| `audioAnalysisEnabled` | 音響解析 |
| `frequencyData` | 説明なし |
| `audioContext` | 説明なし |
| `analyserNode` | 説明なし |
| `effectMappings` | エフェクト同期マッピング |
| `activeAudioEffects` | 説明なし |
| `scheduledEffects` | 説明なし |
| `lastEffectTime` | タイミング管理 |
| `effectQueue` | 説明なし |
| `maxQueueSize` | 説明なし |
| `syncEnabled` | 設定の読み込み |
| `visualFeedbackEnabled` | 説明なし |
| `audioReactiveEffects` | 説明なし |
| `timingCompensation` | 説明なし |
| `audioContext` | 説明なし |
| `analyserNode` | 説明なし |
| `frequencyData` | 説明なし |
| `audioAnalysisEnabled` | 説明なし |
| `audioAnalysisEnabled` | 説明なし |
| `audioManager` | 説明なし |
| `particleManager` | 説明なし |
| `effectManager` | 説明なし |
| `seasonalManager` | 説明なし |
| `syncEnabled` | 説明なし |
| `visualFeedbackEnabled` | 説明なし |
| `scheduledEffects` | スケジュールされたエフェクトをクリア |
| `audioManager` | システム参照のクリア |
| `particleManager` | 説明なし |
| `effectManager` | 説明なし |
| `seasonalManager` | 説明なし |

### メソッド

#### if

Web Audio API の初期化（オプション）

**シグネチャ**:
```javascript
 if (this.audioReactiveEffects && typeof AudioContext !== 'undefined')
```

**パラメーター**:
- `this.audioReactiveEffects && typeof AudioContext !== 'undefined'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.audioReactiveEffects && typeof AudioContext !== 'undefined');

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

#### registerSystems

**シグネチャ**:
```javascript
 registerSystems(systems)
```

**パラメーター**:
- `systems`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerSystems(systems);

// registerSystemsの実用的な使用例
const result = instance.registerSystems(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (systems.audioManager)
```

**パラメーター**:
- `systems.audioManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(systems.audioManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (systems.particleManager)
```

**パラメーター**:
- `systems.particleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(systems.particleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (systems.effectManager)
```

**パラメーター**:
- `systems.effectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(systems.effectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (systems.seasonalManager)
```

**パラメーター**:
- `systems.seasonalManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(systems.seasonalManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

AudioManagerにオーディオ解析ノードを接続（可能な場合）

**シグネチャ**:
```javascript
 if (this.audioAnalysisEnabled && this.analyserNode)
```

**パラメーター**:
- `this.audioAnalysisEnabled && this.analyserNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.audioAnalysisEnabled && this.analyserNode);

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

#### createSyncedEffect

**シグネチャ**:
```javascript
 createSyncedEffect(effectType, x, y, parameters = {})
```

**パラメーター**:
- `effectType`
- `x`
- `y`
- `parameters = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSyncedEffect(effectType, x, y, parameters = {});

// createSyncedEffectの実用的な使用例
const result = instance.createSyncedEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!mapping)
```

**パラメーター**:
- `!mapping`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!mapping);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

視覚エフェクトの実行（タイミング調整あり）

**シグネチャ**:
```javascript
 if (this.visualFeedbackEnabled)
```

**パラメーター**:
- `this.visualFeedbackEnabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.visualFeedbackEnabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (delay > 0)
```

**パラメーター**:
- `delay > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(delay > 0);

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

#### switch

**シグネチャ**:
```javascript
 switch (audioEvent)
```

**パラメーター**:
- `audioEvent`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(audioEvent);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
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

#### for

**シグネチャ**:
```javascript
 for (const visualEffect of mapping.visualEffects)
```

**パラメーター**:
- `const visualEffect of mapping.visualEffects`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const visualEffect of mapping.visualEffects);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (effectType)
```

**パラメーター**:
- `effectType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(effectType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.particleManager)
```

**パラメーター**:
- `this.particleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.effectManager)
```

**パラメーター**:
- `this.effectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.effectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.particleManager)
```

**パラメーター**:
- `this.particleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.effectManager)
```

**パラメーター**:
- `this.effectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.effectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.particleManager)
```

**パラメーター**:
- `this.particleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.seasonalManager)
```

**パラメーター**:
- `this.seasonalManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.seasonalManager);

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

#### switch

**シグネチャ**:
```javascript
 switch (source)
```

**パラメーター**:
- `source`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(source);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.audioAnalysisEnabled && this.frequencyData)
```

**パラメーター**:
- `this.audioAnalysisEnabled && this.frequencyData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.audioAnalysisEnabled && this.frequencyData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.audioAnalysisEnabled && this.frequencyData)
```

**パラメーター**:
- `this.audioAnalysisEnabled && this.frequencyData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.audioAnalysisEnabled && this.frequencyData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.audioAnalysisEnabled && this.frequencyData)
```

**パラメーター**:
- `this.audioAnalysisEnabled && this.frequencyData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.audioAnalysisEnabled && this.frequencyData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.audioAnalysisEnabled && this.frequencyData)
```

**パラメーター**:
- `this.audioAnalysisEnabled && this.frequencyData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.audioAnalysisEnabled && this.frequencyData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### update

**シグネチャ**:
```javascript
 update(deltaTime)
```

**パラメーター**:
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.update(deltaTime);

// フレーム更新処理
const deltaTime = 16.67; // 60FPS
instance.update(deltaTime);
```

#### if

オーディオ解析データの更新

**シグネチャ**:
```javascript
 if (this.audioAnalysisEnabled)
```

**パラメーター**:
- `this.audioAnalysisEnabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.audioAnalysisEnabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [effectId, effect] of this.activeAudioEffects)
```

**パラメーター**:
- `const [effectId`
- `effect] of this.activeAudioEffects`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [effectId, effect] of this.activeAudioEffects);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (effect.duration > 0 && elapsed >= effect.duration)
```

**パラメーター**:
- `effect.duration > 0 && elapsed >= effect.duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(effect.duration > 0 && elapsed >= effect.duration);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = this.scheduledEffects.length - 1; i >= 0; i--)
```

**パラメーター**:
- `let i = this.scheduledEffects.length - 1; i >= 0; i--`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = this.scheduledEffects.length - 1; i >= 0; i--);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentTime >= scheduled.executeTime)
```

**パラメーター**:
- `currentTime >= scheduled.executeTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentTime >= scheduled.executeTime);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.analyserNode && this.frequencyData)
```

**パラメーター**:
- `this.analyserNode && this.frequencyData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.analyserNode && this.frequencyData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### scheduleEffect

**シグネチャ**:
```javascript
 scheduleEffect(effectType, x, y, delay, parameters = {})
```

**パラメーター**:
- `effectType`
- `x`
- `y`
- `delay`
- `parameters = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.scheduleEffect(effectType, x, y, delay, parameters = {});

// scheduleEffectの実用的な使用例
const result = instance.scheduleEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

キューサイズの制限

**シグネチャ**:
```javascript
 if (this.scheduledEffects.length > this.maxQueueSize)
```

**パラメーター**:
- `this.scheduledEffects.length > this.maxQueueSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.scheduledEffects.length > this.maxQueueSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setSyncEnabled

**シグネチャ**:
```javascript
 setSyncEnabled(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setSyncEnabled(enabled);

// setSyncEnabledの実用的な使用例
const result = instance.setSyncEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setVisualFeedbackEnabled

**シグネチャ**:
```javascript
 setVisualFeedbackEnabled(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setVisualFeedbackEnabled(enabled);

// setVisualFeedbackEnabledの実用的な使用例
const result = instance.setVisualFeedbackEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStats

**シグネチャ**:
```javascript
 getStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStats();

// getStatsの実用的な使用例
const result = instance.getStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### dispose

**シグネチャ**:
```javascript
 dispose()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.dispose();

// disposeの実用的な使用例
const result = instance.dispose(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

オーディオコンテキストのクリーンアップ

**シグネチャ**:
```javascript
 if (this.audioContext && this.audioContext.state !== 'closed')
```

**パラメーター**:
- `this.audioContext && this.audioContext.state !== 'closed'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.audioContext && this.audioContext.state !== 'closed');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getAudioVisualSynchronizer

**シグネチャ**:
```javascript
getAudioVisualSynchronizer()
```

**使用例**:
```javascript
const result = getAudioVisualSynchronizer();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `mapping` | 説明なし |
| `delay` | 説明なし |
| `effectId` | 説明なし |
| `resolvedParams` | 説明なし |
| `resolved` | 説明なし |
| `average` | 説明なし |
| `midRange` | 説明なし |
| `average` | 説明なし |
| `bassRange` | 説明なし |
| `average` | 説明なし |
| `trebleRange` | 説明なし |
| `average` | 説明なし |
| `currentTime` | 説明なし |
| `toRemove` | 説明なし |
| `elapsed` | 説明なし |
| `currentTime` | 説明なし |
| `toExecute` | 説明なし |
| `scheduled` | 説明なし |
| `executeTime` | 説明なし |

---

