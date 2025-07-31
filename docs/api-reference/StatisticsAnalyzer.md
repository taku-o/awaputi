# StatisticsAnalyzer

## 概要

ファイル: `core/StatisticsAnalyzer.js`  
最終更新: 2025/7/28 16:45:38

## 目次

## クラス
- [StatisticsAnalyzer](#statisticsanalyzer)
## 定数
- [analysisOptions](#analysisoptions)
- [cacheKey](#cachekey)
- [cached](#cached)
- [analysisResult](#analysisresult)
- [trendResults](#trendresults)
- [categories](#categories)
- [timeSeriesData](#timeseriesdata)
- [trendAnalysis](#trendanalysis)
- [comparisonResults](#comparisonresults)
- [thisWeekData](#thisweekdata)
- [lastWeekData](#lastweekdata)
- [thisMonthData](#thismonthdata)
- [lastMonthData](#lastmonthdata)
- [currentPerformance](#currentperformance)
- [baselinePerformance](#baselineperformance)
- [insights](#insights)
- [integrated](#integrated)
- [stats](#stats)
- [accuracy](#accuracy)
- [efficiency](#efficiency)
- [trend](#trend)
- [trendScore](#trendscore)
- [findings](#findings)
- [highPriorityInsights](#highpriorityinsights)
- [areas](#areas)
- [stats](#stats)
- [plan](#plan)
- [priorityAreas](#priorityareas)
- [stats](#stats)
- [oldestKey](#oldestkey)
- [issues](#issues)
- [dataQuality](#dataquality)
- [componentsAvailable](#componentsavailable)

---

## StatisticsAnalyzer

### コンストラクタ

```javascript
new StatisticsAnalyzer(statisticsManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `statisticsManager` | 説明なし |
| `trendAnalyzer` | 分析コンポーネントの初期化 |
| `comparisonEngine` | 説明なし |
| `insightGenerator` | 説明なし |
| `analysisConfigs` | 分析設定 |
| `analysisCache` | 分析結果キャッシュ |
| `trendAnalyzer` | 説明なし |
| `comparisonEngine` | 説明なし |
| `insightGenerator` | 説明なし |

### メソッド

#### initialize

**シグネチャ**:
```javascript
async initialize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initialize();

// システムの初期化
await instance.initialize();
console.log('Initialization complete');
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

#### initializeAnalysisComponents

**シグネチャ**:
```javascript
async initializeAnalysisComponents()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeAnalysisComponents();

// initializeAnalysisComponentsの実用的な使用例
const result = instance.initializeAnalysisComponents(/* 適切なパラメータ */);
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

#### performComprehensiveAnalysis

**シグネチャ**:
```javascript
async performComprehensiveAnalysis(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performComprehensiveAnalysis(options = {});

// performComprehensiveAnalysisの実用的な使用例
const result = instance.performComprehensiveAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

2. トレンド分析

**シグネチャ**:
```javascript
 if (this.trendAnalyzer && analysisResult.basicStatistics.timeSeries.available)
```

**パラメーター**:
- `this.trendAnalyzer && analysisResult.basicStatistics.timeSeries.available`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.trendAnalyzer && analysisResult.basicStatistics.timeSeries.available);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

3. 比較分析

**シグネチャ**:
```javascript
 if (this.comparisonEngine)
```

**パラメーター**:
- `this.comparisonEngine`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.comparisonEngine);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

4. 洞察生成

**シグネチャ**:
```javascript
 if (this.insightGenerator)
```

**パラメーター**:
- `this.insightGenerator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.insightGenerator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

キャッシュに保存

**シグネチャ**:
```javascript
 if (this.analysisConfigs.cache.enabled)
```

**パラメーター**:
- `this.analysisConfigs.cache.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.analysisConfigs.cache.enabled);

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

#### performTrendAnalysis

**シグネチャ**:
```javascript
async performTrendAnalysis(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performTrendAnalysis(options = {});

// performTrendAnalysisの実用的な使用例
const result = instance.performTrendAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.trendAnalyzer)
```

**パラメーター**:
- `!this.trendAnalyzer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.trendAnalyzer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const category of categories)
```

**パラメーター**:
- `const category of categories`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const category of categories);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (timeSeriesData.length >= this.analysisConfigs.qualityThresholds.minDataPoints)
```

**パラメーター**:
- `timeSeriesData.length >= this.analysisConfigs.qualityThresholds.minDataPoints`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(timeSeriesData.length >= this.analysisConfigs.qualityThresholds.minDataPoints);

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

#### performComparisonAnalysis

**シグネチャ**:
```javascript
async performComparisonAnalysis(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performComparisonAnalysis(options = {});

// performComparisonAnalysisの実用的な使用例
const result = instance.performComparisonAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.comparisonEngine)
```

**パラメーター**:
- `!this.comparisonEngine`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.comparisonEngine);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (thisWeekData && lastWeekData)
```

**パラメーター**:
- `thisWeekData && lastWeekData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(thisWeekData && lastWeekData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (thisMonthData && lastMonthData)
```

**パラメーター**:
- `thisMonthData && lastMonthData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(thisMonthData && lastMonthData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentPerformance && baselinePerformance)
```

**パラメーター**:
- `currentPerformance && baselinePerformance`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentPerformance && baselinePerformance);

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

#### generateInsights

**シグネチャ**:
```javascript
async generateInsights(statisticsData, options = {})
```

**パラメーター**:
- `statisticsData`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateInsights(statisticsData, options = {});

// generateInsightsの実用的な使用例
const result = instance.generateInsights(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.insightGenerator)
```

**パラメーター**:
- `!this.insightGenerator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.insightGenerator);

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

#### performIntegratedAnalysis

**シグネチャ**:
```javascript
 performIntegratedAnalysis(analysisResult)
```

**パラメーター**:
- `analysisResult`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performIntegratedAnalysis(analysisResult);

// performIntegratedAnalysisの実用的な使用例
const result = instance.performIntegratedAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateOverallPerformanceScore

**シグネチャ**:
```javascript
 calculateOverallPerformanceScore(analysisResult)
```

**パラメーター**:
- `analysisResult`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateOverallPerformanceScore(analysisResult);

// calculateOverallPerformanceScoreの実用的な使用例
const result = instance.calculateOverallPerformanceScore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

精度スコア（30%）

**シグネチャ**:
```javascript
 if (stats.bubbles && stats.bubbles.accuracy)
```

**パラメーター**:
- `stats.bubbles && stats.bubbles.accuracy`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stats.bubbles && stats.bubbles.accuracy);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

効率スコア（25%）

**シグネチャ**:
```javascript
 if (stats.bubbles && stats.bubbles.efficiencyStats)
```

**パラメーター**:
- `stats.bubbles && stats.bubbles.efficiencyStats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stats.bubbles && stats.bubbles.efficiencyStats);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

完了率スコア（25%）

**シグネチャ**:
```javascript
 if (stats.basic && stats.basic.completionRate)
```

**パラメーター**:
- `stats.basic && stats.basic.completionRate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stats.basic && stats.basic.completionRate);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

成長トレンドスコア（20%）

**シグネチャ**:
```javascript
 if (analysisResult.trendAnalysis && analysisResult.trendAnalysis.categories.score)
```

**パラメーター**:
- `analysisResult.trendAnalysis && analysisResult.trendAnalysis.categories.score`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(analysisResult.trendAnalysis && analysisResult.trendAnalysis.categories.score);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### extractKeyFindings

**シグネチャ**:
```javascript
 extractKeyFindings(analysisResult)
```

**パラメーター**:
- `analysisResult`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.extractKeyFindings(analysisResult);

// extractKeyFindingsの実用的な使用例
const result = instance.extractKeyFindings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

トレンド分析からの発見

**シグネチャ**:
```javascript
 if (analysisResult.trendAnalysis)
```

**パラメーター**:
- `analysisResult.trendAnalysis`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(analysisResult.trendAnalysis);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

洞察からの発見

**シグネチャ**:
```javascript
 if (analysisResult.insights && analysisResult.insights.insights)
```

**パラメーター**:
- `analysisResult.insights && analysisResult.insights.insights`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(analysisResult.insights && analysisResult.insights.insights);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### identifyPriorityAreas

**シグネチャ**:
```javascript
 identifyPriorityAreas(analysisResult)
```

**パラメーター**:
- `analysisResult`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.identifyPriorityAreas(analysisResult);

// identifyPriorityAreasの実用的な使用例
const result = instance.identifyPriorityAreas(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (analysisResult.basicStatistics)
```

**パラメーター**:
- `analysisResult.basicStatistics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(analysisResult.basicStatistics);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

完了率が低い場合

**シグネチャ**:
```javascript
 if (stats.basic && stats.basic.completionRate < 50)
```

**パラメーター**:
- `stats.basic && stats.basic.completionRate < 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stats.basic && stats.basic.completionRate < 50);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コンボ性能が低い場合

**シグネチャ**:
```javascript
 if (stats.combos && stats.combos.highestCombo < 10)
```

**パラメーター**:
- `stats.combos && stats.combos.highestCombo < 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stats.combos && stats.combos.highestCombo < 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateActionPlan

**シグネチャ**:
```javascript
 generateActionPlan(analysisResult)
```

**パラメーター**:
- `analysisResult`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateActionPlan(analysisResult);

// generateActionPlanの実用的な使用例
const result = instance.generateActionPlan(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(area => {
            switch (area.area)
```

**パラメーター**:
- `area => {
            switch (area.area`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(area => {
            switch (area.area);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateProgressSummary

**シグネチャ**:
```javascript
 generateProgressSummary(analysisResult)
```

**パラメーター**:
- `analysisResult`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateProgressSummary(analysisResult);

// generateProgressSummaryの実用的な使用例
const result = instance.generateProgressSummary(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getComponentsStatus

**シグネチャ**:
```javascript
 getComponentsStatus()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getComponentsStatus();

// getComponentsStatusの実用的な使用例
const result = instance.getComponentsStatus(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateCacheKey

**シグネチャ**:
```javascript
 generateCacheKey(type, options)
```

**パラメーター**:
- `type`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateCacheKey(type, options);

// generateCacheKeyの実用的な使用例
const result = instance.generateCacheKey(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cacheAnalysisResult

**シグネチャ**:
```javascript
 cacheAnalysisResult(key, result)
```

**パラメーター**:
- `key`
- `result`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cacheAnalysisResult(key, result);

// cacheAnalysisResultの実用的な使用例
const result = instance.cacheAnalysisResult(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.analysisCache.size >= this.analysisConfigs.cache.maxSize)
```

**パラメーター**:
- `this.analysisCache.size >= this.analysisConfigs.cache.maxSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.analysisCache.size >= this.analysisConfigs.cache.maxSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateAnalysisId

**シグネチャ**:
```javascript
 generateAnalysisId()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateAnalysisId();

// generateAnalysisIdの実用的な使用例
const result = instance.generateAnalysisId(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### assessDataQuality

**シグネチャ**:
```javascript
 assessDataQuality(analysisResult)
```

**パラメーター**:
- `analysisResult`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.assessDataQuality(analysisResult);

// assessDataQualityの実用的な使用例
const result = instance.assessDataQuality(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!analysisResult.basicStatistics)
```

**パラメーター**:
- `!analysisResult.basicStatistics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!analysisResult.basicStatistics);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (analysisResult.basicStatistics && analysisResult.basicStatistics.basic.totalGamesPlayed < 10)
```

**パラメーター**:
- `analysisResult.basicStatistics && analysisResult.basicStatistics.basic.totalGamesPlayed < 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(analysisResult.basicStatistics && analysisResult.basicStatistics.basic.totalGamesPlayed < 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateAnalysisConfidence

**シグネチャ**:
```javascript
 calculateAnalysisConfidence(analysisResult)
```

**パラメーター**:
- `analysisResult`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateAnalysisConfidence(analysisResult);

// calculateAnalysisConfidenceの実用的な使用例
const result = instance.calculateAnalysisConfidence(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### summarizeTrendAnalysis

簡略化されたヘルパーメソッド

**シグネチャ**:
```javascript
 summarizeTrendAnalysis(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.summarizeTrendAnalysis(results);

// summarizeTrendAnalysisの実用的な使用例
const result = instance.summarizeTrendAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateTrendRecommendations

**シグネチャ**:
```javascript
 generateTrendRecommendations(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateTrendRecommendations(results);

// generateTrendRecommendationsの実用的な使用例
const result = instance.generateTrendRecommendations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### summarizeComparisonAnalysis

**シグネチャ**:
```javascript
 summarizeComparisonAnalysis(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.summarizeComparisonAnalysis(results);

// summarizeComparisonAnalysisの実用的な使用例
const result = instance.summarizeComparisonAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### identifySignificantChanges

**シグネチャ**:
```javascript
 identifySignificantChanges(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.identifySignificantChanges(results);

// identifySignificantChangesの実用的な使用例
const result = instance.identifySignificantChanges(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateContextualInsights

**シグネチャ**:
```javascript
 generateContextualInsights(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateContextualInsights(data);

// generateContextualInsightsの実用的な使用例
const result = instance.generateContextualInsights(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generatePredictiveInsights

**シグネチャ**:
```javascript
 generatePredictiveInsights(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generatePredictiveInsights(data);

// generatePredictiveInsightsの実用的な使用例
const result = instance.generatePredictiveInsights(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getWeeklyData

**シグネチャ**:
```javascript
 getWeeklyData(period)
```

**パラメーター**:
- `period`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getWeeklyData(period);

// getWeeklyDataの実用的な使用例
const result = instance.getWeeklyData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getMonthlyData

**シグネチャ**:
```javascript
 getMonthlyData(period)
```

**パラメーター**:
- `period`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMonthlyData(period);

// getMonthlyDataの実用的な使用例
const result = instance.getMonthlyData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentPerformanceData

**シグネチャ**:
```javascript
 getCurrentPerformanceData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentPerformanceData();

// getCurrentPerformanceDataの実用的な使用例
const result = instance.getCurrentPerformanceData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBaselinePerformanceData

**シグネチャ**:
```javascript
 getBaselinePerformanceData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBaselinePerformanceData();

// getBaselinePerformanceDataの実用的な使用例
const result = instance.getBaselinePerformanceData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculatePlayerLevel

**シグネチャ**:
```javascript
 calculatePlayerLevel(stats)
```

**パラメーター**:
- `stats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculatePlayerLevel(stats);

// calculatePlayerLevelの実用的な使用例
const result = instance.calculatePlayerLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRecentTrendSummary

**シグネチャ**:
```javascript
 getRecentTrendSummary(result)
```

**パラメーター**:
- `result`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRecentTrendSummary(result);

// getRecentTrendSummaryの実用的な使用例
const result = instance.getRecentTrendSummary(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getNextMilestone

**シグネチャ**:
```javascript
 getNextMilestone(stats)
```

**パラメーター**:
- `stats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getNextMilestone(stats);

// getNextMilestoneの実用的な使用例
const result = instance.getNextMilestone(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `analysisOptions` | 説明なし |
| `cacheKey` | 説明なし |
| `cached` | 説明なし |
| `analysisResult` | 説明なし |
| `trendResults` | 説明なし |
| `categories` | 説明なし |
| `timeSeriesData` | 説明なし |
| `trendAnalysis` | 説明なし |
| `comparisonResults` | 説明なし |
| `thisWeekData` | 説明なし |
| `lastWeekData` | 説明なし |
| `thisMonthData` | 説明なし |
| `lastMonthData` | 説明なし |
| `currentPerformance` | 説明なし |
| `baselinePerformance` | 説明なし |
| `insights` | 説明なし |
| `integrated` | 説明なし |
| `stats` | 説明なし |
| `accuracy` | 説明なし |
| `efficiency` | 説明なし |
| `trend` | 説明なし |
| `trendScore` | 説明なし |
| `findings` | 説明なし |
| `highPriorityInsights` | 説明なし |
| `areas` | 説明なし |
| `stats` | 説明なし |
| `plan` | 説明なし |
| `priorityAreas` | 説明なし |
| `stats` | 説明なし |
| `oldestKey` | 説明なし |
| `issues` | 説明なし |
| `dataQuality` | 説明なし |
| `componentsAvailable` | 説明なし |

---

