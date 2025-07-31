# EffectQualityController

## 概要

ファイル: `effects/EffectQualityController.js`  
最終更新: 2025/7/30 0:29:15

## 目次

## クラス
- [EffectQualityController](#effectqualitycontroller)
## 関数
- [getEffectQualityController()](#geteffectqualitycontroller)
## 定数
- [savedQuality](#savedquality)
- [autoAdjust](#autoadjust)
- [previousQuality](#previousquality)
- [quality](#quality)
- [priorityLevel](#prioritylevel)
- [currentQualitySettings](#currentqualitysettings)
- [targetFrameRate](#targetframerate)
- [avgFrameRate](#avgframerate)
- [stableFrameRate](#stableframerate)
- [avgFrameRate](#avgframerate)
- [avgMemoryUsage](#avgmemoryusage)

---

## EffectQualityController

### コンストラクタ

```javascript
new EffectQualityController()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `configManager` | 説明なし |
| `errorHandler` | 説明なし |
| `qualityLevels` | 品質レベル定義 |
| `currentQuality` | 現在の品質設定 |
| `autoAdjustEnabled` | 説明なし |
| `lastAdjustTime` | 説明なし |
| `adjustmentCooldown` | 説明なし |
| `frameRateHistory` | パフォーマンス監視 |
| `memoryUsageHistory` | 説明なし |
| `performanceCheckInterval` | 説明なし |
| `lastPerformanceCheck` | 1秒間隔 |
| `effectPriorities` | エフェクト優先度システム |
| `effectLimits` | エフェクト制限 |
| `activeEffectCounts` | 現在のエフェクトカウント |
| `currentQuality` | 説明なし |
| `autoAdjustEnabled` | 説明なし |
| `lastPerformanceCheck` | 説明なし |
| `currentQuality` | 説明なし |
| `currentQuality` | 説明なし |
| `currentQuality` | 説明なし |
| `currentQuality` | 説明なし |
| `currentQuality` | 説明なし |
| `currentQuality` | 説明なし |
| `lastAdjustTime` | 説明なし |
| `frameRateHistory` | 説明なし |
| `memoryUsageHistory` | 説明なし |
| `activeEffectCounts` | 説明なし |

### メソッド

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

#### setQualityLevel

**シグネチャ**:
```javascript
 setQualityLevel(level)
```

**パラメーター**:
- `level`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setQualityLevel(level);

// setQualityLevelの実用的な使用例
const result = instance.setQualityLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.qualityLevels[level])
```

**パラメーター**:
- `!this.qualityLevels[level]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.qualityLevels[level]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setAutoAdjustment

**シグネチャ**:
```javascript
 setAutoAdjustment(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setAutoAdjustment(enabled);

// setAutoAdjustmentの実用的な使用例
const result = instance.setAutoAdjustment(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### canExecuteEffect

**シグネチャ**:
```javascript
 canExecuteEffect(effectType, priority = 'normal')
```

**パラメーター**:
- `effectType`
- `priority = 'normal'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.canExecuteEffect(effectType, priority = 'normal');

// canExecuteEffectの実用的な使用例
const result = instance.canExecuteEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

優先度が高い場合は制限を緩和

**シグネチャ**:
```javascript
 if (priorityLevel >= 2)
```

**パラメーター**:
- `priorityLevel >= 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(priorityLevel >= 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

エフェクトタイプ別の制限チェック

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

#### updateEffectCount

**シグネチャ**:
```javascript
 updateEffectCount(effectType, delta)
```

**パラメーター**:
- `effectType`
- `delta`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateEffectCount(effectType, delta);

// updateEffectCountの実用的な使用例
const result = instance.updateEffectCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updatePerformanceMetrics

**シグネチャ**:
```javascript
 updatePerformanceMetrics(currentTime, frameRate, memoryUsage)
```

**パラメーター**:
- `currentTime`
- `frameRate`
- `memoryUsage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updatePerformanceMetrics(currentTime, frameRate, memoryUsage);

// updatePerformanceMetricsの実用的な使用例
const result = instance.updatePerformanceMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentTime - this.lastPerformanceCheck < this.performanceCheckInterval)
```

**パラメーター**:
- `currentTime - this.lastPerformanceCheck < this.performanceCheckInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentTime - this.lastPerformanceCheck < this.performanceCheckInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.frameRateHistory.length > 10)
```

**パラメーター**:
- `this.frameRateHistory.length > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.frameRateHistory.length > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メモリ使用量履歴の更新

**シグネチャ**:
```javascript
 if (memoryUsage)
```

**パラメーター**:
- `memoryUsage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(memoryUsage);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.memoryUsageHistory.length > 10)
```

**パラメーター**:
- `this.memoryUsageHistory.length > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.memoryUsageHistory.length > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

自動品質調整

**シグネチャ**:
```javascript
 if (this.autoAdjustEnabled)
```

**パラメーター**:
- `this.autoAdjustEnabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.autoAdjustEnabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentTime - this.lastAdjustTime < this.adjustmentCooldown)
```

**パラメーター**:
- `currentTime - this.lastAdjustTime < this.adjustmentCooldown`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentTime - this.lastAdjustTime < this.adjustmentCooldown);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フレームレートが目標を大幅に下回る場合、品質を下げる

**シグネチャ**:
```javascript
 if (avgFrameRate < targetFrameRate * 0.8)
```

**パラメーター**:
- `avgFrameRate < targetFrameRate * 0.8`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(avgFrameRate < targetFrameRate * 0.8);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentQuality === 'ultra')
```

**パラメーター**:
- `this.currentQuality === 'ultra'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentQuality === 'ultra');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentQuality === 'high')
```

**パラメーター**:
- `this.currentQuality === 'high'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentQuality === 'high');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentQuality === 'medium')
```

**パラメーター**:
- `this.currentQuality === 'medium'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentQuality === 'medium');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (avgFrameRate > targetFrameRate * 1.1 && this.frameRateHistory.length >= 5)
```

**パラメーター**:
- `avgFrameRate > targetFrameRate * 1.1 && this.frameRateHistory.length >= 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(avgFrameRate > targetFrameRate * 1.1 && this.frameRateHistory.length >= 5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (stableFrameRate)
```

**パラメーター**:
- `stableFrameRate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stableFrameRate);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentQuality === 'low')
```

**パラメーター**:
- `this.currentQuality === 'low'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentQuality === 'low');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentQuality === 'medium')
```

**パラメーター**:
- `this.currentQuality === 'medium'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentQuality === 'medium');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentQuality === 'high')
```

**パラメーター**:
- `this.currentQuality === 'high'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentQuality === 'high');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (shouldAdjust)
```

**パラメーター**:
- `shouldAdjust`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(shouldAdjust);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentQualitySettings

**シグネチャ**:
```javascript
 getCurrentQualitySettings()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentQualitySettings();

// getCurrentQualitySettingsの実用的な使用例
const result = instance.getCurrentQualitySettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentQualityLevel

**シグネチャ**:
```javascript
 getCurrentQualityLevel()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentQualityLevel();

// getCurrentQualityLevelの実用的な使用例
const result = instance.getCurrentQualityLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEffectLimits

**シグネチャ**:
```javascript
 getEffectLimits()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEffectLimits();

// getEffectLimitsの実用的な使用例
const result = instance.getEffectLimits(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getActiveEffectCounts

**シグネチャ**:
```javascript
 getActiveEffectCounts()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getActiveEffectCounts();

// getActiveEffectCountsの実用的な使用例
const result = instance.getActiveEffectCounts(/* 適切なパラメータ */);
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

#### getDebugInfo

**シグネチャ**:
```javascript
 getDebugInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDebugInfo();

// getDebugInfoの実用的な使用例
const result = instance.getDebugInfo(/* 適切なパラメータ */);
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


---

## getEffectQualityController

**シグネチャ**:
```javascript
getEffectQualityController()
```

**使用例**:
```javascript
const result = getEffectQualityController();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `savedQuality` | 説明なし |
| `autoAdjust` | 説明なし |
| `previousQuality` | 説明なし |
| `quality` | 説明なし |
| `priorityLevel` | 説明なし |
| `currentQualitySettings` | 説明なし |
| `targetFrameRate` | 説明なし |
| `avgFrameRate` | 説明なし |
| `stableFrameRate` | 説明なし |
| `avgFrameRate` | 説明なし |
| `avgMemoryUsage` | 説明なし |

---

