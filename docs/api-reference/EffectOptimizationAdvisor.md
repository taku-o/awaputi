# EffectOptimizationAdvisor

## 概要

ファイル: `effects/EffectOptimizationAdvisor.js`  
最終更新: 2025/7/30 0:29:15

## 目次

## クラス
- [EffectOptimizationAdvisor](#effectoptimizationadvisor)
## 定数
- [analysis](#analysis)
- [recommendations](#recommendations)
- [issues](#issues)
- [recommendations](#recommendations)
- [strategies](#strategies)
- [uniqueRecommendations](#uniquerecommendations)
- [strategies](#strategies)
- [strategy](#strategy)
- [unique](#unique)
- [key](#key)
- [severityOrder](#severityorder)
- [severityDiff](#severitydiff)
- [applied](#applied)
- [strategy](#strategy)
- [result](#result)
- [reduction](#reduction)
- [currentMultiplier](#currentmultiplier)
- [newMultiplier](#newmultiplier)
- [qualityLevels](#qualitylevels)
- [currentQuality](#currentquality)
- [currentIndex](#currentindex)
- [stepsDown](#stepsdown)
- [newIndex](#newindex)
- [newQuality](#newquality)
- [effects](#effects)
- [skipFrames](#skipframes)
- [cullingMargin](#cullingmargin)
- [cleaned](#cleaned)
- [cleaned](#cleaned)
- [baseImpacts](#baseimpacts)
- [severityMultiplier](#severitymultiplier)
- [autoApplicable](#autoapplicable)
- [logEntry](#logentry)
- [lastOptimization](#lastoptimization)

---

## EffectOptimizationAdvisor

### コンストラクタ

```javascript
new EffectOptimizationAdvisor(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `optimizationHistory` | 説明なし |
| `performanceBaseline` | 説明なし |
| `optimizationStrategies` | 説明なし |

### メソッド

#### initializeStrategies

**シグネチャ**:
```javascript
 initializeStrategies()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeStrategies();

// initializeStrategiesの実用的な使用例
const result = instance.initializeStrategies(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeAndOptimize

**シグネチャ**:
```javascript
 analyzeAndOptimize(profilingData)
```

**パラメーター**:
- `profilingData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeAndOptimize(profilingData);

// analyzeAndOptimizeの実用的な使用例
const result = instance.analyzeAndOptimize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzePerformanceIssues

**シグネチャ**:
```javascript
 analyzePerformanceIssues(profilingData)
```

**パラメーター**:
- `profilingData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzePerformanceIssues(profilingData);

// analyzePerformanceIssuesの実用的な使用例
const result = instance.analyzePerformanceIssues(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

FPS問題の分析

**シグネチャ**:
```javascript
 if (frame && frame.averageFPS < 30)
```

**パラメーター**:
- `frame && frame.averageFPS < 30`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(frame && frame.averageFPS < 30);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メモリ問題の分析

**シグネチャ**:
```javascript
 if (memory && memory.averageMemory > 200)
```

**パラメーター**:
- `memory && memory.averageMemory > 200`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(memory && memory.averageMemory > 200);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

レンダリング時間の分析

**シグネチャ**:
```javascript
 if (frame && frame.averageRenderTime > 33)
```

**パラメーター**:
- `frame && frame.averageRenderTime > 33`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(frame && frame.averageRenderTime > 33);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パーティクル性能の分析

**シグネチャ**:
```javascript
 if (particles)
```

**パラメーター**:
- `particles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particles);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (metrics.rating === 'poor')
```

**パラメーター**:
- `metrics.rating === 'poor'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(metrics.rating === 'poor');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メモリリークの検出

**シグネチャ**:
```javascript
 if (memory && memory.hasMemoryLeak)
```

**パラメーター**:
- `memory && memory.hasMemoryLeak`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(memory && memory.hasMemoryLeak);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateOptimizationPlan

**シグネチャ**:
```javascript
 generateOptimizationPlan(analysis)
```

**パラメーター**:
- `analysis`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateOptimizationPlan(analysis);

// generateOptimizationPlanの実用的な使用例
const result = instance.generateOptimizationPlan(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const issue of analysis.issues)
```

**パラメーター**:
- `const issue of analysis.issues`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const issue of analysis.issues);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStrategiesForIssue

**シグネチャ**:
```javascript
 getStrategiesForIssue(issue)
```

**パラメーター**:
- `issue`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStrategiesForIssue(issue);

// getStrategiesForIssueの実用的な使用例
const result = instance.getStrategiesForIssue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (issue.type)
```

**パラメーター**:
- `issue.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(issue.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (issue.severity === 'critical')
```

**パラメーター**:
- `issue.severity === 'critical'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(issue.severity === 'critical');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRecommendation

**シグネチャ**:
```javascript
 createRecommendation(strategyId, severity, context = {})
```

**パラメーター**:
- `strategyId`
- `severity`
- `context = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRecommendation(strategyId, severity, context = {});

// createRecommendationの実用的な使用例
const result = instance.createRecommendation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### deduplicateRecommendations

**シグネチャ**:
```javascript
 deduplicateRecommendations(recommendations)
```

**パラメーター**:
- `recommendations`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.deduplicateRecommendations(recommendations);

// deduplicateRecommendationsの実用的な使用例
const result = instance.deduplicateRecommendations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const rec of recommendations)
```

**パラメーター**:
- `const rec of recommendations`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const rec of recommendations);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### prioritizeRecommendations

**シグネチャ**:
```javascript
 prioritizeRecommendations(recommendations)
```

**パラメーター**:
- `recommendations`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.prioritizeRecommendations(recommendations);

// prioritizeRecommendationsの実用的な使用例
const result = instance.prioritizeRecommendations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### autoApplyOptimizations

**シグネチャ**:
```javascript
 autoApplyOptimizations(recommendations)
```

**パラメーター**:
- `recommendations`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.autoApplyOptimizations(recommendations);

// autoApplyOptimizationsの実用的な使用例
const result = instance.autoApplyOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const rec of recommendations)
```

**パラメーター**:
- `const rec of recommendations`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const rec of recommendations);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rec.canAutoApply && rec.severity !== 'critical')
```

**パラメーター**:
- `rec.canAutoApply && rec.severity !== 'critical'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rec.canAutoApply && rec.severity !== 'critical');

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

#### reduceParticleCount

最適化戦略の実装

**シグネチャ**:
```javascript
 reduceParticleCount(intensity)
```

**パラメーター**:
- `intensity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.reduceParticleCount(intensity);

// reduceParticleCountの実用的な使用例
const result = instance.reduceParticleCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

10%-40%削減

**シグネチャ**:
```javascript
 if (this.gameEngine.enhancedParticleManager)
```

**パラメーター**:
- `this.gameEngine.enhancedParticleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.enhancedParticleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### lowerQualitySettings

**シグネチャ**:
```javascript
 lowerQualitySettings(intensity)
```

**パラメーター**:
- `intensity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.lowerQualitySettings(intensity);

// lowerQualitySettingsの実用的な使用例
const result = instance.lowerQualitySettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.effectQualityController && newQuality !== currentQuality)
```

**パラメーター**:
- `this.gameEngine.effectQualityController && newQuality !== currentQuality`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.effectQualityController && newQuality !== currentQuality);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### disableComplexEffects

**シグネチャ**:
```javascript
 disableComplexEffects(intensity)
```

**パラメーター**:
- `intensity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.disableComplexEffects(intensity);

// disableComplexEffectsの実用的な使用例
const result = instance.disableComplexEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (intensity > 0.5 && this.gameEngine.seasonalEffectManager)
```

**パラメーター**:
- `intensity > 0.5 && this.gameEngine.seasonalEffectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(intensity > 0.5 && this.gameEngine.seasonalEffectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (intensity > 0.7 && this.gameEngine.enhancedEffectManager)
```

**パラメーター**:
- `intensity > 0.7 && this.gameEngine.enhancedEffectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(intensity > 0.7 && this.gameEngine.enhancedEffectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### optimizeRenderFrequency

**シグネチャ**:
```javascript
 optimizeRenderFrequency(intensity)
```

**パラメーター**:
- `intensity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.optimizeRenderFrequency(intensity);

// optimizeRenderFrequencyの実用的な使用例
const result = instance.optimizeRenderFrequency(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

0-3フレームスキップ

**シグネチャ**:
```javascript
 if (this.gameEngine.enhancedParticleManager)
```

**パラメーター**:
- `this.gameEngine.enhancedParticleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.enhancedParticleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### enableAggressiveCulling

**シグネチャ**:
```javascript
 enableAggressiveCulling(intensity)
```

**パラメーター**:
- `intensity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enableAggressiveCulling(intensity);

// enableAggressiveCullingの実用的な使用例
const result = instance.enableAggressiveCulling(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

より厳しいカリング

**シグネチャ**:
```javascript
 if (this.gameEngine.enhancedParticleManager)
```

**パラメーター**:
- `this.gameEngine.enhancedParticleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.enhancedParticleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.enhancedEffectManager)
```

**パラメーター**:
- `this.gameEngine.enhancedEffectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.enhancedEffectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanupMemory

**シグネチャ**:
```javascript
 cleanupMemory(intensity)
```

**パラメーター**:
- `intensity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanupMemory(intensity);

// cleanupMemoryの実用的な使用例
const result = instance.cleanupMemory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パーティクルクリーンアップ

**シグネチャ**:
```javascript
 if (this.gameEngine.enhancedParticleManager)
```

**パラメーター**:
- `this.gameEngine.enhancedParticleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.enhancedParticleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

エフェクトクリーンアップ

**シグネチャ**:
```javascript
 if (this.gameEngine.enhancedEffectManager)
```

**パラメーター**:
- `this.gameEngine.enhancedEffectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.enhancedEffectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ガベージコレクション要求

**シグネチャ**:
```javascript
 if (intensity > 0.7 && window.gc)
```

**パラメーター**:
- `intensity > 0.7 && window.gc`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(intensity > 0.7 && window.gc);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateIntensity

ユーティリティメソッド

**シグネチャ**:
```javascript
 calculateIntensity(severity)
```

**パラメーター**:
- `severity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateIntensity(severity);

// calculateIntensityの実用的な使用例
const result = instance.calculateIntensity(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (severity)
```

**パラメーター**:
- `severity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(severity);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### estimateImpact

**シグネチャ**:
```javascript
 estimateImpact(strategyId, severity)
```

**パラメーター**:
- `strategyId`
- `severity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateImpact(strategyId, severity);

// estimateImpactの実用的な使用例
const result = instance.estimateImpact(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### canAutoApply

**シグネチャ**:
```javascript
 canAutoApply(strategyId, severity)
```

**パラメーター**:
- `strategyId`
- `severity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.canAutoApply(strategyId, severity);

// canAutoApplyの実用的な使用例
const result = instance.canAutoApply(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateOverallScore

**シグネチャ**:
```javascript
 calculateOverallScore(issues)
```

**パラメーター**:
- `issues`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateOverallScore(issues);

// calculateOverallScoreの実用的な使用例
const result = instance.calculateOverallScore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const issue of issues)
```

**パラメーター**:
- `const issue of issues`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const issue of issues);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (issue.severity)
```

**パラメーター**:
- `issue.severity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(issue.severity);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### categorizePerformance

**シグネチャ**:
```javascript
 categorizePerformance(fps)
```

**パラメーター**:
- `fps`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.categorizePerformance(fps);

// categorizePerformanceの実用的な使用例
const result = instance.categorizePerformance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### logOptimization

**シグネチャ**:
```javascript
 logOptimization(recommendation, result)
```

**パラメーター**:
- `recommendation`
- `result`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.logOptimization(recommendation, result);

// logOptimizationの実用的な使用例
const result = instance.logOptimization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴サイズ制限

**シグネチャ**:
```javascript
 if (this.optimizationHistory.length > 100)
```

**パラメーター**:
- `this.optimizationHistory.length > 100`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.optimizationHistory.length > 100);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getOptimizationHistory

**シグネチャ**:
```javascript
 getOptimizationHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getOptimizationHistory();

// getOptimizationHistoryの実用的な使用例
const result = instance.getOptimizationHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### revertLastOptimization

**シグネチャ**:
```javascript
 revertLastOptimization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.revertLastOptimization();

// revertLastOptimizationの実用的な使用例
const result = instance.revertLastOptimization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.optimizationHistory.length === 0)
```

**パラメーター**:
- `this.optimizationHistory.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.optimizationHistory.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `analysis` | 説明なし |
| `recommendations` | 説明なし |
| `issues` | 説明なし |
| `recommendations` | 説明なし |
| `strategies` | 説明なし |
| `uniqueRecommendations` | 説明なし |
| `strategies` | 説明なし |
| `strategy` | 説明なし |
| `unique` | 説明なし |
| `key` | 説明なし |
| `severityOrder` | 説明なし |
| `severityDiff` | 説明なし |
| `applied` | 説明なし |
| `strategy` | 説明なし |
| `result` | 説明なし |
| `reduction` | 説明なし |
| `currentMultiplier` | 説明なし |
| `newMultiplier` | 説明なし |
| `qualityLevels` | 説明なし |
| `currentQuality` | 説明なし |
| `currentIndex` | 説明なし |
| `stepsDown` | 説明なし |
| `newIndex` | 説明なし |
| `newQuality` | 説明なし |
| `effects` | 説明なし |
| `skipFrames` | 説明なし |
| `cullingMargin` | 説明なし |
| `cleaned` | 説明なし |
| `cleaned` | 説明なし |
| `baseImpacts` | 説明なし |
| `severityMultiplier` | 説明なし |
| `autoApplicable` | 説明なし |
| `logEntry` | 説明なし |
| `lastOptimization` | 説明なし |

---

