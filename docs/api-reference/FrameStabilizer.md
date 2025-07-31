# FrameStabilizer

## 概要

ファイル: `utils/FrameStabilizer.js`  
最終更新: 2025/7/28 12:01:10

## 目次

## クラス
- [FrameStabilizer](#framestabilizer)
## 関数
- [getFrameStabilizer()](#getframestabilizer)
- [reinitializeFrameStabilizer()](#reinitializeframestabilizer)
## 定数
- [cutoffTime](#cutofftime)
- [buffer](#buffer)
- [dataSize](#datasize)
- [data](#data)
- [squaredDiffs](#squareddiffs)
- [sortedData](#sorteddata)
- [mid](#mid)
- [index](#index)
- [lower](#lower)
- [upper](#upper)
- [weight](#weight)
- [variance](#variance)
- [standardDeviation](#standarddeviation)
- [maxAcceptableVariance](#maxacceptablevariance)
- [targetDeviation](#targetdeviation)
- [errorRatio](#errorratio)
- [recentFrames](#recentframes)
- [weights](#weights)
- [frame](#frame)
- [predictions](#predictions)
- [accuracies](#accuracies)
- [prediction](#prediction)
- [actual](#actual)
- [error](#error)
- [accuracy](#accuracy)
- [recentFrames](#recentframes)
- [frameTimes](#frametimes)
- [commonIntervals](#commonintervals)
- [standardRates](#standardrates)
- [expectedInterval](#expectedinterval)
- [intervals](#intervals)
- [rounded](#rounded)
- [threshold](#threshold)
- [refreshInterval](#refreshinterval)
- [frameDrift](#framedrift)
- [now](#now)
- [stabilityScore](#stabilityscore)
- [currentFPS](#currentfps)
- [newTargetFPS](#newtargetfps)
- [fpsRatio](#fpsratio)
- [zone](#zone)
- [baseFPS](#basefps)
- [adjustment](#adjustment)
- [zone](#zone)
- [currentLevel](#currentlevel)
- [levels](#levels)
- [currentIndex](#currentindex)
- [threshold](#threshold)
- [recommendations](#recommendations)
- [analysis](#analysis)
- [zone](#zone)
- [frameStabilizer](#framestabilizer)

---

## FrameStabilizer

### コンストラクタ

```javascript
new FrameStabilizer(targetFPS = 60)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `errorHandler` | 説明なし |
| `targetFPS` | 説明なし |
| `targetFrameTime` | 説明なし |
| `frameTimingAnalysis` | Frame timing analysis |
| `adaptiveTargeting` | Adaptive frame rate targeting |
| `framePacing` | Frame pacing optimization |
| `qualityAdjustment` | Quality adjustment algorithms |
| `stabilizationThresholds` | Performance thresholds |
| `targetFPS` | 説明なし |
| `targetFrameTime` | 説明なし |
| `targetFPS` | 説明なし |
| `targetFrameTime` | 説明なし |

### メソッド

#### processFrameTiming

**シグネチャ**:
```javascript
 processFrameTiming(frameTime, timestamp)
```

**パラメーター**:
- `frameTime`
- `timestamp`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processFrameTiming(frameTime, timestamp);

// processFrameTimingの実用的な使用例
const result = instance.processFrameTiming(/* 適切なパラメータ */);
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

#### updateFrameTimeBuffer

**シグネチャ**:
```javascript
 updateFrameTimeBuffer(frameTime)
```

**パラメーター**:
- `frameTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateFrameTimeBuffer(frameTime);

// updateFrameTimeBufferの実用的な使用例
const result = instance.updateFrameTimeBuffer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.frameTimingAnalysis.bufferIndex === 0)
```

**パラメーター**:
- `this.frameTimingAnalysis.bufferIndex === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.frameTimingAnalysis.bufferIndex === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateStatisticalAnalysis

**シグネチャ**:
```javascript
 updateStatisticalAnalysis()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateStatisticalAnalysis();

// updateStatisticalAnalysisの実用的な使用例
const result = instance.updateStatisticalAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculatePercentile

**シグネチャ**:
```javascript
 calculatePercentile(sortedData, percentile)
```

**パラメーター**:
- `sortedData`
- `percentile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculatePercentile(sortedData, percentile);

// calculatePercentileの実用的な使用例
const result = instance.calculatePercentile(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateStabilityMetrics

**シグネチャ**:
```javascript
 updateStabilityMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateStabilityMetrics();

// updateStabilityMetricsの実用的な使用例
const result = instance.updateStabilityMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Determine consistency rating

**シグネチャ**:
```javascript
 if (variance < this.stabilizationThresholds.excellentStability)
```

**パラメーター**:
- `variance < this.stabilizationThresholds.excellentStability`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(variance < this.stabilizationThresholds.excellentStability);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (variance < this.stabilizationThresholds.goodStability)
```

**パラメーター**:
- `variance < this.stabilizationThresholds.goodStability`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(variance < this.stabilizationThresholds.goodStability);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (variance < this.stabilizationThresholds.acceptableStability)
```

**パラメーター**:
- `variance < this.stabilizationThresholds.acceptableStability`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(variance < this.stabilizationThresholds.acceptableStability);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (variance < this.stabilizationThresholds.poorStability)
```

**パラメーター**:
- `variance < this.stabilizationThresholds.poorStability`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(variance < this.stabilizationThresholds.poorStability);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateFramePacing

**シグネチャ**:
```javascript
 updateFramePacing(frameTime, timestamp)
```

**パラメーター**:
- `frameTime`
- `timestamp`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateFramePacing(frameTime, timestamp);

// updateFramePacingの実用的な使用例
const result = instance.updateFramePacing(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### predictNextFrameTime

**シグネチャ**:
```javascript
 predictNextFrameTime()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.predictNextFrameTime();

// predictNextFrameTimeの実用的な使用例
const result = instance.predictNextFrameTime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (recentFrames.length < 5)
```

**パラメーター**:
- `recentFrames.length < 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(recentFrames.length < 5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Keep only recent predictions

**シグネチャ**:
```javascript
 if (this.framePacing.predictionHistory.length > 20)
```

**パラメーター**:
- `this.framePacing.predictionHistory.length > 20`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.framePacing.predictionHistory.length > 20);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updatePredictionAccuracy

**シグネチャ**:
```javascript
 updatePredictionAccuracy()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updatePredictionAccuracy();

// updatePredictionAccuracyの実用的な使用例
const result = instance.updatePredictionAccuracy(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 1; i < predictions.length; i++)
```

**パラメーター**:
- `let i = 1; i < predictions.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 1; i < predictions.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

20ms tolerance

**シグネチャ**:
```javascript
 if (actual)
```

**パラメーター**:
- `actual`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(actual);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (accuracies.length > 0)
```

**パラメーター**:
- `accuracies.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(accuracies.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectDisplaySynchronization

**シグネチャ**:
```javascript
 detectDisplaySynchronization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectDisplaySynchronization();

// detectDisplaySynchronizationの実用的な使用例
const result = instance.detectDisplaySynchronization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

default

**シグネチャ**:
```javascript
 for (const rate of standardRates)
```

**パラメーター**:
- `const rate of standardRates`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const rate of standardRates);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectCommonIntervals

**シグネチャ**:
```javascript
 detectCommonIntervals(frameTimes)
```

**パラメーター**:
- `frameTimes`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectCommonIntervals(frameTimes);

// detectCommonIntervalsの実用的な使用例
const result = instance.detectCommonIntervals(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const time of frameTimes)
```

**パラメーター**:
- `const time of frameTimes`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const time of frameTimes);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateTearingRisk

**シグネチャ**:
```javascript
 calculateTearingRisk()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateTearingRisk();

// calculateTearingRiskの実用的な使用例
const result = instance.calculateTearingRisk(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.framePacing.vsyncDetected)
```

**パラメーター**:
- `!this.framePacing.vsyncDetected`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.framePacing.vsyncDetected);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateAdaptiveTargeting

**シグネチャ**:
```javascript
 updateAdaptiveTargeting()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateAdaptiveTargeting();

// updateAdaptiveTargetingの実用的な使用例
const result = instance.updateAdaptiveTargeting(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (now - this.adaptiveTargeting.lastAdjustmentTime < this.adaptiveTargeting.adjustmentCooldown)
```

**パラメーター**:
- `now - this.adaptiveTargeting.lastAdjustmentTime < this.adaptiveTargeting.adjustmentCooldown`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(now - this.adaptiveTargeting.lastAdjustmentTime < this.adaptiveTargeting.adjustmentCooldown);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updatePerformanceZone

**シグネチャ**:
```javascript
 updatePerformanceZone(stabilityScore, currentFPS)
```

**パラメーター**:
- `stabilityScore`
- `currentFPS`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updatePerformanceZone(stabilityScore, currentFPS);

// updatePerformanceZoneの実用的な使用例
const result = instance.updatePerformanceZone(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (stabilityScore > 0.9 && fpsRatio > 0.95)
```

**パラメーター**:
- `stabilityScore > 0.9 && fpsRatio > 0.95`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stabilityScore > 0.9 && fpsRatio > 0.95);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (stabilityScore > 0.7 && fpsRatio > 0.85)
```

**パラメーター**:
- `stabilityScore > 0.7 && fpsRatio > 0.85`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stabilityScore > 0.7 && fpsRatio > 0.85);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (stabilityScore > 0.5 && fpsRatio > 0.70)
```

**パラメーター**:
- `stabilityScore > 0.5 && fpsRatio > 0.70`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stabilityScore > 0.5 && fpsRatio > 0.70);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (stabilityScore > 0.3 && fpsRatio > 0.50)
```

**パラメーター**:
- `stabilityScore > 0.3 && fpsRatio > 0.50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stabilityScore > 0.3 && fpsRatio > 0.50);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateAdaptiveTarget

**シグネチャ**:
```javascript
 calculateAdaptiveTarget()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateAdaptiveTarget();

// calculateAdaptiveTargetの実用的な使用例
const result = instance.calculateAdaptiveTarget(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (zone)
```

**パラメーター**:
- `zone`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(zone);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### adjustTargetFPS

**シグネチャ**:
```javascript
 adjustTargetFPS(newTargetFPS)
```

**パラメーター**:
- `newTargetFPS`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.adjustTargetFPS(newTargetFPS);

// adjustTargetFPSの実用的な使用例
const result = instance.adjustTargetFPS(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Keep adjustment history manageable

**シグネチャ**:
```javascript
 if (this.adaptiveTargeting.adjustmentHistory.length > 20)
```

**パラメーター**:
- `this.adaptiveTargeting.adjustmentHistory.length > 20`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.adaptiveTargeting.adjustmentHistory.length > 20);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### evaluateQualityAdjustments

**シグネチャ**:
```javascript
 evaluateQualityAdjustments()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.evaluateQualityAdjustments();

// evaluateQualityAdjustmentsの実用的な使用例
const result = instance.evaluateQualityAdjustments(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

Determine recommended quality level based on performance zone

**シグネチャ**:
```javascript
 switch (zone)
```

**パラメーター**:
- `zone`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(zone);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Apply hysteresis to prevent oscillation

**シグネチャ**:
```javascript
 if (recommendedLevel !== this.qualityAdjustment.targetLevel)
```

**パラメーター**:
- `recommendedLevel !== this.qualityAdjustment.targetLevel`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(recommendedLevel !== this.qualityAdjustment.targetLevel);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStabilizationRecommendations

**シグネチャ**:
```javascript
 getStabilizationRecommendations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStabilizationRecommendations();

// getStabilizationRecommendationsの実用的な使用例
const result = instance.getStabilizationRecommendations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Immediate actions

**シグネチャ**:
```javascript
 if (zone === 'critical')
```

**パラメーター**:
- `zone === 'critical'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(zone === 'critical');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (zone === 'poor')
```

**パラメーター**:
- `zone === 'poor'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(zone === 'poor');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Short-term improvements

**シグネチャ**:
```javascript
 if (analysis.jitterLevel > 5)
```

**パラメーター**:
- `analysis.jitterLevel > 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(analysis.jitterLevel > 5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (analysis.consistencyRating === 'poor' || analysis.consistencyRating === 'critical')
```

**パラメーター**:
- `analysis.consistencyRating === 'poor' || analysis.consistencyRating === 'critical'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(analysis.consistencyRating === 'poor' || analysis.consistencyRating === 'critical');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Long-term optimizations

**シグネチャ**:
```javascript
 if (this.framePacing.tearingRisk > 0.3)
```

**パラメーター**:
- `this.framePacing.tearingRisk > 0.3`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.framePacing.tearingRisk > 0.3);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (analysis.variance > this.stabilizationThresholds.goodStability)
```

**パラメーター**:
- `analysis.variance > this.stabilizationThresholds.goodStability`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(analysis.variance > this.stabilizationThresholds.goodStability);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStabilizationStatus

**シグネチャ**:
```javascript
 getStabilizationStatus()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStabilizationStatus();

// getStabilizationStatusの実用的な使用例
const result = instance.getStabilizationStatus(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forceStabilization

**シグネチャ**:
```javascript
 forceStabilization(targetFPS, mode = 'balanced')
```

**パラメーター**:
- `targetFPS`
- `mode = 'balanced'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forceStabilization(targetFPS, mode = 'balanced');

// forceStabilizationの実用的な使用例
const result = instance.forceStabilization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

Configure mode-specific settings

**シグネチャ**:
```javascript
 switch (mode)
```

**パラメーター**:
- `mode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(mode);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetAnalysisData

**シグネチャ**:
```javascript
 resetAnalysisData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetAnalysisData();

// resetAnalysisDataの実用的な使用例
const result = instance.resetAnalysisData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getFrameStabilizer

**シグネチャ**:
```javascript
getFrameStabilizer(targetFPS = 60)
```

**パラメーター**:
- `targetFPS = 60`

**使用例**:
```javascript
const result = getFrameStabilizer(targetFPS = 60);
```

---

## reinitializeFrameStabilizer

**シグネチャ**:
```javascript
reinitializeFrameStabilizer(targetFPS = 60)
```

**パラメーター**:
- `targetFPS = 60`

**使用例**:
```javascript
const result = reinitializeFrameStabilizer(targetFPS = 60);
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `cutoffTime` | 説明なし |
| `buffer` | 説明なし |
| `dataSize` | 説明なし |
| `data` | 説明なし |
| `squaredDiffs` | 説明なし |
| `sortedData` | 説明なし |
| `mid` | 説明なし |
| `index` | 説明なし |
| `lower` | 説明なし |
| `upper` | 説明なし |
| `weight` | 説明なし |
| `variance` | 説明なし |
| `standardDeviation` | 説明なし |
| `maxAcceptableVariance` | 説明なし |
| `targetDeviation` | 説明なし |
| `errorRatio` | 説明なし |
| `recentFrames` | 説明なし |
| `weights` | 説明なし |
| `frame` | 説明なし |
| `predictions` | 説明なし |
| `accuracies` | 説明なし |
| `prediction` | 説明なし |
| `actual` | 説明なし |
| `error` | 説明なし |
| `accuracy` | 説明なし |
| `recentFrames` | 説明なし |
| `frameTimes` | 説明なし |
| `commonIntervals` | 説明なし |
| `standardRates` | 説明なし |
| `expectedInterval` | 説明なし |
| `intervals` | 説明なし |
| `rounded` | 説明なし |
| `threshold` | 説明なし |
| `refreshInterval` | 説明なし |
| `frameDrift` | 説明なし |
| `now` | 説明なし |
| `stabilityScore` | 説明なし |
| `currentFPS` | 説明なし |
| `newTargetFPS` | 説明なし |
| `fpsRatio` | 説明なし |
| `zone` | 説明なし |
| `baseFPS` | 説明なし |
| `adjustment` | 説明なし |
| `zone` | 説明なし |
| `currentLevel` | 説明なし |
| `levels` | 説明なし |
| `currentIndex` | 説明なし |
| `threshold` | 説明なし |
| `recommendations` | 説明なし |
| `analysis` | 説明なし |
| `zone` | 説明なし |
| `frameStabilizer` | 後方互換性のため |

---

