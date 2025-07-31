# AdvancedPerformanceMonitor

## 概要

ファイル: `debug/AdvancedPerformanceMonitor.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [AdvancedPerformanceMonitor](#advancedperformancemonitor)
- [MetricsCollector](#metricscollector)
- [PerformanceAnalyzer](#performanceanalyzer)
- [DetailedProfiler](#detailedprofiler)
## 定数
- [metrics](#metrics)
- [analysis](#analysis)
- [currentMetrics](#currentmetrics)
- [threshold](#threshold)
- [alertKey](#alertkey)
- [alert](#alert)
- [warningKey](#warningkey)
- [criticalKey](#criticalkey)
- [messages](#messages)
- [deviceType](#devicetype)
- [now](#now)
- [metrics](#metrics)
- [now](#now)
- [frameTime](#frametime)
- [used](#used)
- [total](#total)
- [now](#now)
- [timeDiff](#timediff)
- [frequency](#frequency)
- [recentMetrics](#recentmetrics)
- [analysis](#analysis)
- [issues](#issues)
- [avgFPS](#avgfps)
- [memoryTrend](#memorytrend)
- [avgDrawCalls](#avgdrawcalls)
- [suggestions](#suggestions)
- [avgParticles](#avgparticles)
- [avgRenderTime](#avgrendertime)
- [trends](#trends)
- [keys](#keys)
- [trend](#trend)
- [direction](#direction)
- [latest](#latest)
- [bottlenecks](#bottlenecks)
- [patterns](#patterns)
- [fpsValues](#fpsvalues)
- [periodicDrop](#periodicdrop)
- [values](#values)
- [values](#values)
- [n](#n)
- [sumX](#sumx)
- [sumY](#sumy)
- [sumXY](#sumxy)
- [sumX2](#sumx2)
- [slope](#slope)
- [avgY](#avgy)
- [stats](#stats)
- [keys](#keys)
- [values](#values)
- [results](#results)
- [originalRender](#originalrender)
- [start](#start)
- [end](#end)
- [sample](#sample)
- [operations](#operations)
- [op](#op)
- [timeline](#timeline)
- [bucketSize](#bucketsize)
- [bucket](#bucket)
- [results](#results)

---

## AdvancedPerformanceMonitor

### コンストラクタ

```javascript
new AdvancedPerformanceMonitor(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `performanceOptimizer` | 説明なし |
| `metrics` | メトリクス収集 |
| `analyzer` | 説明なし |
| `profiler` | 説明なし |
| `thresholds` | 閾値管理 |
| `alerts` | アラート管理 |
| `alertCallbacks` | 説明なし |
| `historySize` | 履歴管理 |
| `metricsHistory` | 説明なし |
| `charts` | ビジュアライゼーション |
| `chartUpdateInterval` | 説明なし |
| `isMonitoring` | 状態 |
| `isProfiling` | 説明なし |
| `updateTimer` | 説明なし |
| `isMonitoring` | 説明なし |
| `updateTimer` | 説明なし |
| `isMonitoring` | 説明なし |
| `updateTimer` | 説明なし |
| `metricsHistory` | 説明なし |

### メソッド

#### initialize

**シグネチャ**:
```javascript
 initialize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initialize();

// システムの初期化
await instance.initialize();
console.log('Initialization complete');
```

#### startMonitoring

**シグネチャ**:
```javascript
 startMonitoring()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startMonitoring();

// startMonitoringの実用的な使用例
const result = instance.startMonitoring(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stopMonitoring

**シグネチャ**:
```javascript
 stopMonitoring()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopMonitoring();

// stopMonitoringの実用的な使用例
const result = instance.stopMonitoring(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.updateTimer)
```

**パラメーター**:
- `this.updateTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.updateTimer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectMetrics

**シグネチャ**:
```javascript
 collectMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectMetrics();

// collectMetricsの実用的な使用例
const result = instance.collectMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.metricsHistory.length > this.historySize)
```

**パラメーター**:
- `this.metricsHistory.length > this.historySize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.metricsHistory.length > this.historySize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzePerformance

**シグネチャ**:
```javascript
 analyzePerformance()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzePerformance();

// analyzePerformanceの実用的な使用例
const result = instance.analyzePerformance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

問題のパターンを検出

**シグネチャ**:
```javascript
 if (analysis.issues.length > 0)
```

**パラメーター**:
- `analysis.issues.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(analysis.issues.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

改善提案を生成

**シグネチャ**:
```javascript
 if (analysis.suggestions.length > 0)
```

**パラメーター**:
- `analysis.suggestions.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(analysis.suggestions.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startProfiling

**シグネチャ**:
```javascript
 startProfiling(component, options = {})
```

**パラメーター**:
- `component`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startProfiling(component, options = {});

// startProfilingの実用的な使用例
const result = instance.startProfiling(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stopProfiling

**シグネチャ**:
```javascript
 stopProfiling()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopProfiling();

// stopProfilingの実用的な使用例
const result = instance.stopProfiling(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getProfilingResults

**シグネチャ**:
```javascript
 getProfilingResults()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getProfilingResults();

// getProfilingResultsの実用的な使用例
const result = instance.getProfilingResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkThresholds

**シグネチャ**:
```javascript
 checkThresholds()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkThresholds();

// checkThresholdsの実用的な使用例
const result = instance.checkThresholds(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value > threshold.critical)
```

**パラメーター**:
- `value > threshold.critical`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value > threshold.critical);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value > threshold.warning)
```

**パラメーター**:
- `value > threshold.warning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value > threshold.warning);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### triggerAlert

**シグネチャ**:
```javascript
 triggerAlert(metric, level, value)
```

**パラメーター**:
- `metric`
- `level`
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.triggerAlert(metric, level, value);

// triggerAlertの実用的な使用例
const result = instance.triggerAlert(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearAlert

**シグネチャ**:
```javascript
 clearAlert(metric)
```

**パラメーター**:
- `metric`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearAlert(metric);

// clearAlertの実用的な使用例
const result = instance.clearAlert(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentMetrics

**シグネチャ**:
```javascript
 getCurrentMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentMetrics();

// getCurrentMetricsの実用的な使用例
const result = instance.getCurrentMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.metricsHistory.length === 0)
```

**パラメーター**:
- `this.metricsHistory.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.metricsHistory.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateCharts

**シグネチャ**:
```javascript
 updateCharts(metrics)
```

**パラメーター**:
- `metrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateCharts(metrics);

// updateChartsの実用的な使用例
const result = instance.updateCharts(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [name, chart] of this.charts)
```

**パラメーター**:
- `const [name`
- `chart] of this.charts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [name, chart] of this.charts);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (chart.update)
```

**パラメーター**:
- `chart.update`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(chart.update);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handlePerformanceIssues

**シグネチャ**:
```javascript
 handlePerformanceIssues(issues)
```

**パラメーター**:
- `issues`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handlePerformanceIssues(issues);

// handlePerformanceIssuesの実用的な使用例
const result = instance.handlePerformanceIssues(/* 適切なパラメータ */);
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

#### if

自動修正が可能な場合

**シグネチャ**:
```javascript
 if (issue.autoFix && this.performanceOptimizer)
```

**パラメーター**:
- `issue.autoFix && this.performanceOptimizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(issue.autoFix && this.performanceOptimizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateSuggestions

**シグネチャ**:
```javascript
 generateSuggestions(suggestions)
```

**パラメーター**:
- `suggestions`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateSuggestions(suggestions);

// generateSuggestionsの実用的な使用例
const result = instance.generateSuggestions(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const suggestion of suggestions)
```

**パラメーター**:
- `const suggestion of suggestions`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const suggestion of suggestions);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateAlertMessage

**シグネチャ**:
```javascript
 generateAlertMessage(metric, level, value)
```

**パラメーター**:
- `metric`
- `level`
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateAlertMessage(metric, level, value);

// generateAlertMessageの実用的な使用例
const result = instance.generateAlertMessage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifyAlertCallbacks

**シグネチャ**:
```javascript
 notifyAlertCallbacks(alert)
```

**パラメーター**:
- `alert`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifyAlertCallbacks(alert);

// notifyAlertCallbacksの実用的な使用例
const result = instance.notifyAlertCallbacks(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const callback of this.alertCallbacks)
```

**パラメーター**:
- `const callback of this.alertCallbacks`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const callback of this.alertCallbacks);

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

#### setupDefaultThresholds

**シグネチャ**:
```javascript
 setupDefaultThresholds()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupDefaultThresholds();

// setupDefaultThresholdsの実用的な使用例
const result = instance.setupDefaultThresholds(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

デバイスによって動的に調整

**シグネチャ**:
```javascript
 if (this.gameEngine.deviceDetector)
```

**パラメーター**:
- `this.gameEngine.deviceDetector`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.deviceDetector);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (deviceType === 'mobile')
```

**パラメーター**:
- `deviceType === 'mobile'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(deviceType === 'mobile');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setThreshold

**シグネチャ**:
```javascript
 setThreshold(metric, warning, critical)
```

**パラメーター**:
- `metric`
- `warning`
- `critical`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setThreshold(metric, warning, critical);

// setThresholdの実用的な使用例
const result = instance.setThreshold(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addAlertCallback

**シグネチャ**:
```javascript
 addAlertCallback(callback)
```

**パラメーター**:
- `callback`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addAlertCallback(callback);

// addAlertCallbackの実用的な使用例
const result = instance.addAlertCallback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### removeAlertCallback

**シグネチャ**:
```javascript
 removeAlertCallback(callback)
```

**パラメーター**:
- `callback`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeAlertCallback(callback);

// removeAlertCallbackの実用的な使用例
const result = instance.removeAlertCallback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getMetricsHistory

**シグネチャ**:
```javascript
 getMetricsHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMetricsHistory();

// getMetricsHistoryの実用的な使用例
const result = instance.getMetricsHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentAlerts

**シグネチャ**:
```javascript
 getCurrentAlerts()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentAlerts();

// getCurrentAlertsの実用的な使用例
const result = instance.getCurrentAlerts(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### registerChart

**シグネチャ**:
```javascript
 registerChart(name, chart)
```

**パラメーター**:
- `name`
- `chart`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerChart(name, chart);

// registerChartの実用的な使用例
const result = instance.registerChart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### unregisterChart

**シグネチャ**:
```javascript
 unregisterChart(name)
```

**パラメーター**:
- `name`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.unregisterChart(name);

// unregisterChartの実用的な使用例
const result = instance.unregisterChart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStatistics

**シグネチャ**:
```javascript
 getStatistics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStatistics();

// getStatisticsの実用的な使用例
const result = instance.getStatistics(/* 適切なパラメータ */);
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


---

## MetricsCollector

### コンストラクタ

```javascript
new MetricsCollector(monitor)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `monitor` | 説明なし |
| `gameEngine` | 説明なし |
| `lastFrameTime` | パフォーマンス測定 |
| `frameCount` | 説明なし |
| `gcCount` | 説明なし |
| `lastGCCheck` | 説明なし |
| `lastFrameTime` | 説明なし |
| `lastGCCheck` | 説明なし |
| `gcCount` | 説明なし |

### メソッド

#### collect

**シグネチャ**:
```javascript
 collect()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collect();

// collectの実用的な使用例
const result = instance.collect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateFPS

**シグネチャ**:
```javascript
 calculateFPS()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateFPS();

// calculateFPSの実用的な使用例
const result = instance.calculateFPS(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.performanceOptimizer)
```

**パラメーター**:
- `this.gameEngine.performanceOptimizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.performanceOptimizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateFrameTime

**シグネチャ**:
```javascript
 calculateFrameTime()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateFrameTime();

// calculateFrameTimeの実用的な使用例
const result = instance.calculateFrameTime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getMemoryUsage

**シグネチャ**:
```javascript
 getMemoryUsage()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMemoryUsage();

// getMemoryUsageの実用的な使用例
const result = instance.getMemoryUsage(/* 適切なパラメータ */);
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

#### calculateGCFrequency

**シグネチャ**:
```javascript
 calculateGCFrequency()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateGCFrequency();

// calculateGCFrequencyの実用的な使用例
const result = instance.calculateGCFrequency(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

分単位

**シグネチャ**:
```javascript
 if (timeDiff > 0)
```

**パラメーター**:
- `timeDiff > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(timeDiff > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDrawCalls

**シグネチャ**:
```javascript
 getDrawCalls()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDrawCalls();

// getDrawCallsの実用的な使用例
const result = instance.getDrawCalls(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.renderOptimizer)
```

**パラメーター**:
- `this.gameEngine.renderOptimizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.renderOptimizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getUpdateTime

**シグネチャ**:
```javascript
 getUpdateTime()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getUpdateTime();

// getUpdateTimeの実用的な使用例
const result = instance.getUpdateTime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.performanceOptimizer)
```

**パラメーター**:
- `this.gameEngine.performanceOptimizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.performanceOptimizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRenderTime

**シグネチャ**:
```javascript
 getRenderTime()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRenderTime();

// getRenderTimeの実用的な使用例
const result = instance.getRenderTime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.performanceOptimizer)
```

**パラメーター**:
- `this.gameEngine.performanceOptimizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.performanceOptimizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getParticleCount

**シグネチャ**:
```javascript
 getParticleCount()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getParticleCount();

// getParticleCountの実用的な使用例
const result = instance.getParticleCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

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

#### getEffectCount

**シグネチャ**:
```javascript
 getEffectCount()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEffectCount();

// getEffectCountの実用的な使用例
const result = instance.getEffectCount(/* 適切なパラメータ */);
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

#### getEntityCount

**シグネチャ**:
```javascript
 getEntityCount()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEntityCount();

// getEntityCountの実用的な使用例
const result = instance.getEntityCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.bubbleManager)
```

**パラメーター**:
- `this.gameEngine.bubbleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.bubbleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTextureMemory

**シグネチャ**:
```javascript
 getTextureMemory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTextureMemory();

// getTextureMemoryの実用的な使用例
const result = instance.getTextureMemory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAudioNodeCount

**シグネチャ**:
```javascript
 getAudioNodeCount()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAudioNodeCount();

// getAudioNodeCountの実用的な使用例
const result = instance.getAudioNodeCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.audioManager)
```

**パラメーター**:
- `this.gameEngine.audioManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.audioManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## PerformanceAnalyzer

### コンストラクタ

```javascript
new PerformanceAnalyzer(monitor)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `monitor` | 説明なし |
| `analysisWindow` | 分析設定 |
| `trendThreshold` | 最新N個のメトリクスを分析 |

### メソッド

#### analyze

**シグネチャ**:
```javascript
 analyze(metricsHistory)
```

**パラメーター**:
- `metricsHistory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyze(metricsHistory);

// analyzeの実用的な使用例
const result = instance.analyze(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (metricsHistory.length < 2)
```

**パラメーター**:
- `metricsHistory.length < 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(metricsHistory.length < 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectIssues

**シグネチャ**:
```javascript
 detectIssues(metrics)
```

**パラメーター**:
- `metrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectIssues(metrics);

// detectIssuesの実用的な使用例
const result = instance.detectIssues(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (avgFPS < 30)
```

**パラメーター**:
- `avgFPS < 30`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(avgFPS < 30);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (memoryTrend > 0.1)
```

**パラメーター**:
- `memoryTrend > 0.1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(memoryTrend > 0.1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (avgDrawCalls > 100)
```

**パラメーター**:
- `avgDrawCalls > 100`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(avgDrawCalls > 100);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateSuggestions

**シグネチャ**:
```javascript
 generateSuggestions(metrics)
```

**パラメーター**:
- `metrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateSuggestions(metrics);

// generateSuggestionsの実用的な使用例
const result = instance.generateSuggestions(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (avgParticles > 1000)
```

**パラメーター**:
- `avgParticles > 1000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(avgParticles > 1000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (avgRenderTime > 10)
```

**パラメーター**:
- `avgRenderTime > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(avgRenderTime > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeTrends

**シグネチャ**:
```javascript
 analyzeTrends(metrics)
```

**パラメーター**:
- `metrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeTrends(metrics);

// analyzeTrendsの実用的な使用例
const result = instance.analyzeTrends(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const key of keys)
```

**パラメーター**:
- `const key of keys`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const key of keys);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### identifyBottlenecks

**シグネチャ**:
```javascript
 identifyBottlenecks(metrics)
```

**パラメーター**:
- `metrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.identifyBottlenecks(metrics);

// identifyBottlenecksの実用的な使用例
const result = instance.identifyBottlenecks(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

レンダリング vs アップデート

**シグネチャ**:
```javascript
 if (latest.renderTime > latest.updateTime * 2)
```

**パラメーター**:
- `latest.renderTime > latest.updateTime * 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(latest.renderTime > latest.updateTime * 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (latest.updateTime > latest.renderTime * 2)
```

**パラメーター**:
- `latest.updateTime > latest.renderTime * 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(latest.updateTime > latest.renderTime * 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectPatterns

**シグネチャ**:
```javascript
 detectPatterns(metrics)
```

**パラメーター**:
- `metrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectPatterns(metrics);

// detectPatternsの実用的な使用例
const result = instance.detectPatterns(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (periodicDrop)
```

**パラメーター**:
- `periodicDrop`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(periodicDrop);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateAverage

**シグネチャ**:
```javascript
 calculateAverage(metrics, key)
```

**パラメーター**:
- `metrics`
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateAverage(metrics, key);

// calculateAverageの実用的な使用例
const result = instance.calculateAverage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateTrend

**シグネチャ**:
```javascript
 calculateTrend(metrics, key)
```

**パラメーター**:
- `metrics`
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateTrend(metrics, key);

// calculateTrendの実用的な使用例
const result = instance.calculateTrend(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectPeriodicPattern

**シグネチャ**:
```javascript
 detectPeriodicPattern(values)
```

**パラメーター**:
- `values`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectPeriodicPattern(values);

// detectPeriodicPatternの実用的な使用例
const result = instance.detectPeriodicPattern(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStatistics

**シグネチャ**:
```javascript
 getStatistics(metricsHistory)
```

**パラメーター**:
- `metricsHistory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStatistics(metricsHistory);

// getStatisticsの実用的な使用例
const result = instance.getStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (metricsHistory.length === 0)
```

**パラメーター**:
- `metricsHistory.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(metricsHistory.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const key of keys)
```

**パラメーター**:
- `const key of keys`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const key of keys);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (values.length > 0)
```

**パラメーター**:
- `values.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(values.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## DetailedProfiler

### コンストラクタ

```javascript
new DetailedProfiler(monitor)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `monitor` | 説明なし |
| `gameEngine` | 説明なし |
| `isRunning` | プロファイリング状態 |
| `currentProfile` | 説明なし |
| `profiles` | 説明なし |
| `sampleRate` | 測定設定 |
| `maxSamples` | 全フレーム測定 |
| `isRunning` | 説明なし |
| `currentProfile` | 説明なし |
| `isRunning` | 説明なし |
| `currentProfile` | 説明なし |

### メソッド

#### start

**シグネチャ**:
```javascript
 start(component, options = {})
```

**パラメーター**:
- `component`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.start(component, options = {});

// startの実用的な使用例
const result = instance.start(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isRunning)
```

**パラメーター**:
- `this.isRunning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isRunning);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stop

**シグネチャ**:
```javascript
 stop()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stop();

// stopの実用的な使用例
const result = instance.stop(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.isRunning)
```

**パラメーター**:
- `!this.isRunning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.isRunning);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentProfile)
```

**パラメーター**:
- `this.currentProfile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentProfile);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupProfilingHooks

**シグネチャ**:
```javascript
 setupProfilingHooks(component)
```

**パラメーター**:
- `component`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupProfilingHooks(component);

// setupProfilingHooksの実用的な使用例
const result = instance.setupProfilingHooks(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

コンポーネントに応じたフックを設定

**シグネチャ**:
```javascript
 switch (component)
```

**パラメーター**:
- `component`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(component);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### removeProfilingHooks

**シグネチャ**:
```javascript
 removeProfilingHooks(component)
```

**パラメーター**:
- `component`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeProfilingHooks(component);

// removeProfilingHooksの実用的な使用例
const result = instance.removeProfilingHooks(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hookRenderingFunctions

**シグネチャ**:
```javascript
 hookRenderingFunctions()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hookRenderingFunctions();

// hookRenderingFunctionsの実用的な使用例
const result = instance.hookRenderingFunctions(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordSample

**シグネチャ**:
```javascript
 recordSample(operation, duration)
```

**パラメーター**:
- `operation`
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordSample(operation, duration);

// recordSampleの実用的な使用例
const result = instance.recordSample(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

サンプル数の制限

**シグネチャ**:
```javascript
 if (this.currentProfile.samples.length > this.currentProfile.options.maxSamples)
```

**パラメーター**:
- `this.currentProfile.samples.length > this.currentProfile.options.maxSamples`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentProfile.samples.length > this.currentProfile.options.maxSamples);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeProfile

**シグネチャ**:
```javascript
 analyzeProfile(profile)
```

**パラメーター**:
- `profile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeProfile(profile);

// analyzeProfileの実用的な使用例
const result = instance.analyzeProfile(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

操作ごとに集計

**シグネチャ**:
```javascript
 for (const sample of profile.samples)
```

**パラメーター**:
- `const sample of profile.samples`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const sample of profile.samples);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!operations[sample.operation])
```

**パラメーター**:
- `!operations[sample.operation]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!operations[sample.operation]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateTimeline

**シグネチャ**:
```javascript
 generateTimeline(profile)
```

**パラメーター**:
- `profile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateTimeline(profile);

// generateTimelineの実用的な使用例
const result = instance.generateTimeline(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

100ms毎のバケット

**シグネチャ**:
```javascript
 for (let i = 0; i < profile.duration; i += bucketSize)
```

**パラメーター**:
- `let i = 0; i < profile.duration; i += bucketSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < profile.duration; i += bucketSize);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bucket.samples.length > 0)
```

**パラメーター**:
- `bucket.samples.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bucket.samples.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getResults

**シグネチャ**:
```javascript
 getResults()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getResults();

// getResultsの実用的な使用例
const result = instance.getResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isRunning && this.currentProfile)
```

**パラメーター**:
- `this.isRunning && this.currentProfile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isRunning && this.currentProfile);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [component, profile] of this.profiles)
```

**パラメーター**:
- `const [component`
- `profile] of this.profiles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [component, profile] of this.profiles);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearProfiles

**シグネチャ**:
```javascript
 clearProfiles()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearProfiles();

// clearProfilesの実用的な使用例
const result = instance.clearProfiles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `metrics` | 説明なし |
| `analysis` | 説明なし |
| `currentMetrics` | 説明なし |
| `threshold` | 説明なし |
| `alertKey` | 説明なし |
| `alert` | 説明なし |
| `warningKey` | 説明なし |
| `criticalKey` | 説明なし |
| `messages` | 説明なし |
| `deviceType` | 説明なし |
| `now` | 説明なし |
| `metrics` | 説明なし |
| `now` | 説明なし |
| `frameTime` | 説明なし |
| `used` | 説明なし |
| `total` | 説明なし |
| `now` | 説明なし |
| `timeDiff` | 説明なし |
| `frequency` | 説明なし |
| `recentMetrics` | 説明なし |
| `analysis` | 説明なし |
| `issues` | 説明なし |
| `avgFPS` | 説明なし |
| `memoryTrend` | 説明なし |
| `avgDrawCalls` | 説明なし |
| `suggestions` | 説明なし |
| `avgParticles` | 説明なし |
| `avgRenderTime` | 説明なし |
| `trends` | 説明なし |
| `keys` | 説明なし |
| `trend` | 説明なし |
| `direction` | 説明なし |
| `latest` | 説明なし |
| `bottlenecks` | 説明なし |
| `patterns` | 説明なし |
| `fpsValues` | 説明なし |
| `periodicDrop` | 説明なし |
| `values` | 説明なし |
| `values` | 説明なし |
| `n` | 説明なし |
| `sumX` | 説明なし |
| `sumY` | 説明なし |
| `sumXY` | 説明なし |
| `sumX2` | 説明なし |
| `slope` | 説明なし |
| `avgY` | 説明なし |
| `stats` | 説明なし |
| `keys` | 説明なし |
| `values` | 説明なし |
| `results` | 説明なし |
| `originalRender` | 説明なし |
| `start` | 説明なし |
| `end` | 説明なし |
| `sample` | 説明なし |
| `operations` | 説明なし |
| `op` | 説明なし |
| `timeline` | 説明なし |
| `bucketSize` | 説明なし |
| `bucket` | 説明なし |
| `results` | 説明なし |

---

