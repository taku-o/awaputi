# EffectPerformanceMonitor

## 概要

ファイル: `effects/EffectPerformanceMonitor.js`  
最終更新: 2025/7/30 0:29:15

## 目次

## クラス
- [EffectPerformanceMonitor](#effectperformancemonitor)
## 関数
- [getEffectPerformanceMonitor()](#geteffectperformancemonitor)
## 定数
- [entries](#entries)
- [now](#now)
- [timeDiff](#timediff)
- [frameRate](#framerate)
- [stats](#stats)
- [activeParticles](#activeparticles)
- [currentQuality](#currentquality)
- [memoryUsage](#memoryusage)
- [culledEffects](#culledeffects)
- [cullDistance](#culldistance)
- [inViewport](#inviewport)
- [now](#now)
- [effectId](#effectid)
- [effect](#effect)
- [effects](#effects)
- [decorativeEffects](#decorativeeffects)
- [toRemove](#toremove)

---

## EffectPerformanceMonitor

### コンストラクタ

```javascript
new EffectPerformanceMonitor()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `errorHandler` | 説明なし |
| `qualityController` | 説明なし |
| `monitoringEnabled` | パフォーマンス監視設定 |
| `monitoringInterval` | 説明なし |
| `lastMonitoringTime` | 0.5秒間隔 |
| `frameTimestamps` | フレームレート測定 |
| `frameRateBuffer` | 説明なし |
| `frameRateBufferSize` | 説明なし |
| `currentFrameRate` | 説明なし |
| `memoryCheckInterval` | メモリ使用量監視 |
| `lastMemoryCheck` | 2秒間隔 |
| `memoryUsageHistory` | 説明なし |
| `memoryThreshold` | 説明なし |
| `renderStats` | レンダリング統計 |
| `cullingStats` | カリング統計 |
| `warningThresholds` | パフォーマンス警告 |
| `optimizationSettings` | 最適化設定 |
| `activeEffects` | エフェクト管理 |
| `effectPools` | 説明なし |
| `cleanupQueue` | 説明なし |
| `performanceObserver` | 説明なし |
| `currentFrameRate` | 平均フレームレートの計算 |
| `lastMonitoringTime` | 説明なし |
| `lastMemoryCheck` | 説明なし |
| `monitoringEnabled` | 説明なし |
| `frameTimestamps` | 説明なし |
| `frameRateBuffer` | 説明なし |
| `memoryUsageHistory` | 説明なし |
| `cleanupQueue` | 説明なし |

### メソッド

#### if

Performance Observerの設定（利用可能な場合）

**シグネチャ**:
```javascript
 if (typeof PerformanceObserver !== 'undefined')
```

**パラメーター**:
- `typeof PerformanceObserver !== 'undefined'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof PerformanceObserver !== 'undefined');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const entry of entries)
```

**パラメーター**:
- `const entry of entries`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const entry of entries);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

#### startFrame

**シグネチャ**:
```javascript
 startFrame()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startFrame();

// startFrameの実用的な使用例
const result = instance.startFrame(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フレームレートの計算

**シグネチャ**:
```javascript
 if (this.frameTimestamps.length > 1)
```

**パラメーター**:
- `this.frameTimestamps.length > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.frameTimestamps.length > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.frameRateBuffer.length > this.frameRateBufferSize)
```

**パラメーター**:
- `this.frameRateBuffer.length > this.frameRateBufferSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.frameRateBuffer.length > this.frameRateBufferSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

古いタイムスタンプの削除

**シグネチャ**:
```javascript
 if (this.frameTimestamps.length > this.frameRateBufferSize)
```

**パラメーター**:
- `this.frameTimestamps.length > this.frameRateBufferSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.frameTimestamps.length > this.frameRateBufferSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

レンダリング統計のリセット

**シグネチャ**:
```javascript
 if (now - this.renderStats.lastResetTime > 1000)
```

**パラメーター**:
- `now - this.renderStats.lastResetTime > 1000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(now - this.renderStats.lastResetTime > 1000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### update

**シグネチャ**:
```javascript
 update(currentTime)
```

**パラメーター**:
- `currentTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.update(currentTime);

// フレーム更新処理
const deltaTime = 16.67; // 60FPS
instance.update(deltaTime);
```

#### if

定期監視

**シグネチャ**:
```javascript
 if (currentTime - this.lastMonitoringTime > this.monitoringInterval)
```

**パラメーター**:
- `currentTime - this.lastMonitoringTime > this.monitoringInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentTime - this.lastMonitoringTime > this.monitoringInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メモリチェック

**シグネチャ**:
```javascript
 if (currentTime - this.lastMemoryCheck > this.memoryCheckInterval)
```

**パラメーター**:
- `currentTime - this.lastMemoryCheck > this.memoryCheckInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentTime - this.lastMemoryCheck > this.memoryCheckInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フレームレート警告

**シグネチャ**:
```javascript
 if (stats.frameRate < this.warningThresholds.lowFrameRate)
```

**パラメーター**:
- `stats.frameRate < this.warningThresholds.lowFrameRate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stats.frameRate < this.warningThresholds.lowFrameRate);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ドローコール警告

**シグネチャ**:
```javascript
 if (this.renderStats.drawCalls > this.warningThresholds.maxDrawCalls)
```

**パラメーター**:
- `this.renderStats.drawCalls > this.warningThresholds.maxDrawCalls`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.renderStats.drawCalls > this.warningThresholds.maxDrawCalls);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (activeParticles > this.warningThresholds.maxActiveParticles)
```

**パラメーター**:
- `activeParticles > this.warningThresholds.maxActiveParticles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(activeParticles > this.warningThresholds.maxActiveParticles);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

品質低下の提案

**シグネチャ**:
```javascript
 if (frameRate < this.optimizationSettings.reduceQualityThreshold)
```

**パラメーター**:
- `frameRate < this.optimizationSettings.reduceQualityThreshold`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(frameRate < this.optimizationSettings.reduceQualityThreshold);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentQuality !== 'low')
```

**パラメーター**:
- `currentQuality !== 'low'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentQuality !== 'low');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴の制限

**シグネチャ**:
```javascript
 if (this.memoryUsageHistory.length > 60)
```

**パラメーター**:
- `this.memoryUsageHistory.length > 60`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.memoryUsageHistory.length > 60);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メモリ警告

**シグネチャ**:
```javascript
 if (memoryUsage > this.warningThresholds.highMemoryUsage)
```

**パラメーター**:
- `memoryUsage > this.warningThresholds.highMemoryUsage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(memoryUsage > this.warningThresholds.highMemoryUsage);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentFrameRate < this.optimizationSettings.emergencyCleanupThreshold)
```

**パラメーター**:
- `this.currentFrameRate < this.optimizationSettings.emergencyCleanupThreshold`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentFrameRate < this.optimizationSettings.emergencyCleanupThreshold);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (effect.priority === 'decorative')
```

**パラメーター**:
- `effect.priority === 'decorative'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(effect.priority === 'decorative');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ガベージコレクションを促進

**シグネチャ**:
```javascript
 if (window.gc)
```

**パラメーター**:
- `window.gc`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(window.gc);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cullEffects

**シグネチャ**:
```javascript
 cullEffects(effects, viewport)
```

**パラメーター**:
- `effects`
- `viewport`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cullEffects(effects, viewport);

// cullEffectsの実用的な使用例
const result = instance.cullEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.optimizationSettings.cullOffScreen)
```

**パラメーター**:
- `!this.optimizationSettings.cullOffScreen`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.optimizationSettings.cullOffScreen);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const effect of effects)
```

**パラメーター**:
- `const effect of effects`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const effect of effects);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (inViewport)
```

**パラメーター**:
- `inViewport`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(inViewport);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (performance.memory)
```

**パラメーター**:
- `performance.memory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(performance.memory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordRenderStats

**シグネチャ**:
```javascript
 recordRenderStats(type, count = 1)
```

**パラメーター**:
- `type`
- `count = 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordRenderStats(type, count = 1);

// recordRenderStatsの実用的な使用例
const result = instance.recordRenderStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (effectId)
```

**パラメーター**:
- `effectId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(effectId);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (now - effect.createdTime > 10000)
```

**パラメーター**:
- `now - effect.createdTime > 10000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(now - effect.createdTime > 10000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

**シグネチャ**:
```javascript
 while (this.cleanupQueue.length > 0)
```

**パラメーター**:
- `this.cleanupQueue.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(this.cleanupQueue.length > 0);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < toRemove; i++)
```

**パラメーター**:
- `let i = 0; i < toRemove; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < toRemove; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getPerformanceStats

**シグネチャ**:
```javascript
 getPerformanceStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getPerformanceStats();

// getPerformanceStatsの実用的な使用例
const result = instance.getPerformanceStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パフォーマンス測定結果の記録

**シグネチャ**:
```javascript
 if (entry.duration > 16.67)
```

**パラメーター**:
- `entry.duration > 16.67`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(entry.duration > 16.67);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setMonitoringEnabled

**シグネチャ**:
```javascript
 setMonitoringEnabled(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setMonitoringEnabled(enabled);

// setMonitoringEnabledの実用的な使用例
const result = instance.setMonitoringEnabled(/* 適切なパラメータ */);
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

**シグネチャ**:
```javascript
 if (this.performanceObserver)
```

**パラメーター**:
- `this.performanceObserver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.performanceObserver);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getEffectPerformanceMonitor

**シグネチャ**:
```javascript
getEffectPerformanceMonitor()
```

**使用例**:
```javascript
const result = getEffectPerformanceMonitor();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `entries` | 説明なし |
| `now` | 説明なし |
| `timeDiff` | 説明なし |
| `frameRate` | 説明なし |
| `stats` | 説明なし |
| `activeParticles` | 説明なし |
| `currentQuality` | 説明なし |
| `memoryUsage` | 説明なし |
| `culledEffects` | 説明なし |
| `cullDistance` | 説明なし |
| `inViewport` | 説明なし |
| `now` | 説明なし |
| `effectId` | 説明なし |
| `effect` | 説明なし |
| `effects` | 説明なし |
| `decorativeEffects` | 説明なし |
| `toRemove` | 説明なし |

---

