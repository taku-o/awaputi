# TestResultVisualizer

## 概要

ファイル: `debug/TestResultVisualizer.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [TestResultVisualizer](#testresultvisualizer)
## 定数
- [latestResults](#latestresults)
- [testHistory](#testhistory)
- [successRate](#successrate)
- [qualityScore](#qualityscore)
- [successRate](#successrate)
- [performanceScore](#performancescore)
- [speedScore](#speedscore)
- [overallScore](#overallscore)
- [canvas](#canvas)
- [ctx](#ctx)
- [data](#data)
- [canvas](#canvas)
- [ctx](#ctx)
- [categories](#categories)
- [data](#data)
- [canvas](#canvas)
- [ctx](#ctx)
- [history](#history)
- [data](#data)
- [container](#container)
- [benchmarkHTML](#benchmarkhtml)
- [canvas](#canvas)
- [ctx](#ctx)
- [data](#data)
- [successRate](#successrate)
- [container](#container)
- [analysis](#analysis)
- [insightsHTML](#insightshtml)
- [recent](#recent)
- [older](#older)
- [recentSuccessRate](#recentsuccessrate)
- [olderSuccessRate](#oldersuccessrate)
- [recentExecutionTime](#recentexecutiontime)
- [olderExecutionTime](#olderexecutiontime)
- [successRateChange](#successratechange)
- [executionTimeChange](#executiontimechange)
- [successTrend](#successtrend)
- [performanceTrend](#performancetrend)
- [recommendations](#recommendations)
- [categoryFilter](#categoryfilter)
- [statusFilter](#statusfilter)
- [searchFilter](#searchfilter)
- [matchesCategory](#matchescategory)
- [matchesStatus](#matchesstatus)
- [matchesSearch](#matchessearch)
- [container](#container)
- [tableHTML](#tablehtml)
- [status](#status)
- [canvas](#canvas)
- [ctx](#ctx)
- [coverageData](#coveragedata)
- [container](#container)
- [coverageHTML](#coveragehtml)
- [history](#history)
- [centerX](#centerx)
- [centerY](#centery)
- [radius](#radius)
- [total](#total)
- [sliceAngle](#sliceangle)
- [labelAngle](#labelangle)
- [labelX](#labelx)
- [labelY](#labely)
- [margin](#margin)
- [chartWidth](#chartwidth)
- [chartHeight](#chartheight)
- [barWidth](#barwidth)
- [maxValue](#maxvalue)
- [x](#x)
- [total](#total)
- [failedHeight](#failedheight)
- [warningsHeight](#warningsheight)
- [passedHeight](#passedheight)
- [margin](#margin)
- [chartWidth](#chartwidth)
- [chartHeight](#chartheight)
- [minY](#miny)
- [maxY](#maxy)
- [rangeY](#rangey)
- [x](#x)
- [y](#y)
- [x](#x)
- [y](#y)
- [value](#value)
- [y](#y)
- [margin](#margin)
- [chartWidth](#chartwidth)
- [chartHeight](#chartheight)
- [barHeight](#barheight)
- [y](#y)
- [barWidth](#barwidth)
- [color](#color)
- [results](#results)
- [exportData](#exportdata)
- [dataStr](#datastr)
- [dataBlob](#datablob)
- [link](#link)

---

## TestResultVisualizer

### コンストラクタ

```javascript
new TestResultVisualizer(testSupportTools)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `testSupportTools` | 説明なし |
| `container` | 説明なし |
| `charts` | 説明なし |
| `isVisible` | 説明なし |
| `container` | 説明なし |
| `isVisible` | 説明なし |
| `isVisible` | 説明なし |
| `currentTestResults` | 説明なし |

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

#### createContainer

**シグネチャ**:
```javascript
 createContainer()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createContainer();

// createContainerの実用的な使用例
const result = instance.createContainer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createDashboardHTML

**シグネチャ**:
```javascript
 createDashboardHTML()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createDashboardHTML();

// createDashboardHTMLの実用的な使用例
const result = instance.createDashboardHTML(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupEventHandlers

**シグネチャ**:
```javascript
 setupEventHandlers()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupEventHandlers();

// setupEventHandlersの実用的な使用例
const result = instance.setupEventHandlers(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### show

**シグネチャ**:
```javascript
 show()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.show();

// showの実用的な使用例
const result = instance.show(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hide

**シグネチャ**:
```javascript
 hide()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hide();

// hideの実用的な使用例
const result = instance.hide(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### toggle

**シグネチャ**:
```javascript
 toggle()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toggle();

// toggleの実用的な使用例
const result = instance.toggle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isVisible)
```

**パラメーター**:
- `this.isVisible`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isVisible);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switchTab

**シグネチャ**:
```javascript
 switchTab(tabName)
```

**パラメーター**:
- `tabName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switchTab(tabName);

// switchTabの実用的な使用例
const result = instance.switchTab(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### refreshData

**シグネチャ**:
```javascript
 refreshData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.refreshData();

// refreshDataの実用的な使用例
const result = instance.refreshData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!latestResults)
```

**パラメーター**:
- `!latestResults`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!latestResults);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateSummaryTab

**シグネチャ**:
```javascript
 updateSummaryTab(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateSummaryTab(results);

// updateSummaryTabの実用的な使用例
const result = instance.updateSummaryTab(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateQualityScore

**シグネチャ**:
```javascript
 calculateQualityScore(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateQualityScore(results);

// calculateQualityScoreの実用的な使用例
const result = instance.calculateQualityScore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getQualityScoreColor

**シグネチャ**:
```javascript
 getQualityScoreColor(score)
```

**パラメーター**:
- `score`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getQualityScoreColor(score);

// getQualityScoreColorの実用的な使用例
const result = instance.getQualityScoreColor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawResultsPieChart

**シグネチャ**:
```javascript
 drawResultsPieChart(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawResultsPieChart(results);

// drawResultsPieChartの実用的な使用例
const result = instance.drawResultsPieChart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawCategoryBarChart

**シグネチャ**:
```javascript
 drawCategoryBarChart(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawCategoryBarChart(results);

// drawCategoryBarChartの実用的な使用例
const result = instance.drawCategoryBarChart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updatePerformanceTab

**シグネチャ**:
```javascript
 updatePerformanceTab(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updatePerformanceTab(results);

// updatePerformanceTabの実用的な使用例
const result = instance.updatePerformanceTab(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawPerformanceLineChart

**シグネチャ**:
```javascript
 drawPerformanceLineChart()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawPerformanceLineChart();

// drawPerformanceLineChartの実用的な使用例
const result = instance.drawPerformanceLineChart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateBenchmarkResults

**シグネチャ**:
```javascript
 updateBenchmarkResults(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateBenchmarkResults(results);

// updateBenchmarkResultsの実用的な使用例
const result = instance.updateBenchmarkResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!results.benchmarks)
```

**パラメーター**:
- `!results.benchmarks`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!results.benchmarks);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBenchmarkStatusColor

**シグネチャ**:
```javascript
 getBenchmarkStatusColor(benchmark)
```

**パラメーター**:
- `benchmark`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBenchmarkStatusColor(benchmark);

// getBenchmarkStatusColorの実用的な使用例
const result = instance.getBenchmarkStatusColor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getComparisonColor

**シグネチャ**:
```javascript
 getComparisonColor(score)
```

**パラメーター**:
- `score`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getComparisonColor(score);

// getComparisonColorの実用的な使用例
const result = instance.getComparisonColor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### formatMetricValue

**シグネチャ**:
```javascript
 formatMetricValue(key, value)
```

**パラメーター**:
- `key`
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.formatMetricValue(key, value);

// formatMetricValueの実用的な使用例
const result = instance.formatMetricValue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateTrendsTab

**シグネチャ**:
```javascript
 updateTrendsTab(history)
```

**パラメーター**:
- `history`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateTrendsTab(history);

// updateTrendsTabの実用的な使用例
const result = instance.updateTrendsTab(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawTrendsLineChart

**シグネチャ**:
```javascript
 drawTrendsLineChart(history)
```

**パラメーター**:
- `history`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawTrendsLineChart(history);

// drawTrendsLineChartの実用的な使用例
const result = instance.drawTrendsLineChart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateTrendsInsights

**シグネチャ**:
```javascript
 updateTrendsInsights(history)
```

**パラメーター**:
- `history`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateTrendsInsights(history);

// updateTrendsInsightsの実用的な使用例
const result = instance.updateTrendsInsights(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (history.length < 2)
```

**パラメーター**:
- `history.length < 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(history.length < 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeTrends

**シグネチャ**:
```javascript
 analyzeTrends(history)
```

**パラメーター**:
- `history`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeTrends(history);

// analyzeTrendsの実用的な使用例
const result = instance.analyzeTrends(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (successTrend === 'declining')
```

**パラメーター**:
- `successTrend === 'declining'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(successTrend === 'declining');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (performanceTrend === 'declining')
```

**パラメーター**:
- `performanceTrend === 'declining'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(performanceTrend === 'declining');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (recentSuccessRate < 80)
```

**パラメーター**:
- `recentSuccessRate < 80`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(recentSuccessRate < 80);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (recommendations.length === 0)
```

**パラメーター**:
- `recommendations.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(recommendations.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTrendIcon

**シグネチャ**:
```javascript
 getTrendIcon(trend)
```

**パラメーター**:
- `trend`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTrendIcon(trend);

// getTrendIconの実用的な使用例
const result = instance.getTrendIcon(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (trend)
```

**パラメーター**:
- `trend`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(trend);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTrendColor

**シグネチャ**:
```javascript
 getTrendColor(trend)
```

**パラメーター**:
- `trend`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTrendColor(trend);

// getTrendColorの実用的な使用例
const result = instance.getTrendColor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (trend)
```

**パラメーター**:
- `trend`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(trend);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateDetailsTab

**シグネチャ**:
```javascript
 updateDetailsTab(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateDetailsTab(results);

// updateDetailsTabの実用的な使用例
const result = instance.updateDetailsTab(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyFilters

**シグネチャ**:
```javascript
 applyFilters()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyFilters();

// applyFiltersの実用的な使用例
const result = instance.applyFilters(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTestStatus

**シグネチャ**:
```javascript
 getTestStatus(test)
```

**パラメーター**:
- `test`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTestStatus(test);

// getTestStatusの実用的な使用例
const result = instance.getTestStatus(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderTestResultsTable

**シグネチャ**:
```javascript
 renderTestResultsTable(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderTestResultsTable(results);

// renderTestResultsTableの実用的な使用例
const result = instance.renderTestResultsTable(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (results.length === 0)
```

**パラメーター**:
- `results.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(results.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStatusIcon

**シグネチャ**:
```javascript
 getStatusIcon(test)
```

**パラメーター**:
- `test`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStatusIcon(test);

// getStatusIconの実用的な使用例
const result = instance.getStatusIcon(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (status)
```

**パラメーター**:
- `status`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(status);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateCoverageTab

**シグネチャ**:
```javascript
 updateCoverageTab(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateCoverageTab(results);

// updateCoverageTabの実用的な使用例
const result = instance.updateCoverageTab(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawCoverageBarChart

**シグネチャ**:
```javascript
 drawCoverageBarChart()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawCoverageBarChart();

// drawCoverageBarChartの実用的な使用例
const result = instance.drawCoverageBarChart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateCoverageDetails

**シグネチャ**:
```javascript
 updateCoverageDetails(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateCoverageDetails(results);

// updateCoverageDetailsの実用的な使用例
const result = instance.updateCoverageDetails(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateTabContent

**シグネチャ**:
```javascript
 updateTabContent(tabName)
```

**パラメーター**:
- `tabName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateTabContent(tabName);

// updateTabContentの実用的な使用例
const result = instance.updateTabContent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

タブ固有の更新処理

**シグネチャ**:
```javascript
 switch (tabName)
```

**パラメーター**:
- `tabName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(tabName);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawPieChart

チャート描画ユーティリティ

**シグネチャ**:
```javascript
 drawPieChart(ctx, data, width, height)
```

**パラメーター**:
- `ctx`
- `data`
- `width`
- `height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawPieChart(ctx, data, width, height);

// drawPieChartの実用的な使用例
const result = instance.drawPieChart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawStackedBarChart

**シグネチャ**:
```javascript
 drawStackedBarChart(ctx, data, width, height)
```

**パラメーター**:
- `ctx`
- `data`
- `width`
- `height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawStackedBarChart(ctx, data, width, height);

// drawStackedBarChartの実用的な使用例
const result = instance.drawStackedBarChart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Failed (bottom)

**シグネチャ**:
```javascript
 Failed (bottom)
```

**パラメーター**:
- `bottom`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bottom);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Warnings (middle)

**シグネチャ**:
```javascript
 Warnings (middle)
```

**パラメーター**:
- `middle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(middle);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Passed (top)

**シグネチャ**:
```javascript
 Passed (top)
```

**パラメーター**:
- `top`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(top);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawLineChart

**シグネチャ**:
```javascript
 drawLineChart(ctx, data, width, height, options = {})
```

**パラメーター**:
- `ctx`
- `data`
- `width`
- `height`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawLineChart(ctx, data, width, height, options = {});

// drawLineChartの実用的な使用例
const result = instance.drawLineChart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (index === 0)
```

**パラメーター**:
- `index === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(index === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i <= 5; i++)
```

**パラメーター**:
- `let i = 0; i <= 5; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i <= 5; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawHorizontalBarChart

**シグネチャ**:
```javascript
 drawHorizontalBarChart(ctx, data, width, height)
```

**パラメーター**:
- `ctx`
- `data`
- `width`
- `height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawHorizontalBarChart(ctx, data, width, height);

// drawHorizontalBarChartの実用的な使用例
const result = instance.drawHorizontalBarChart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### exportResults

エクスポート機能

**シグネチャ**:
```javascript
 exportResults()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exportResults();

// exportResultsの実用的な使用例
const result = instance.exportResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!results)
```

**パラメーター**:
- `!results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!results);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearHistory

**シグネチャ**:
```javascript
 clearHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearHistory();

// clearHistoryの実用的な使用例
const result = instance.clearHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showNoDataMessage

**シグネチャ**:
```javascript
 showNoDataMessage()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showNoDataMessage();

// showNoDataMessageの実用的な使用例
const result = instance.showNoDataMessage(/* 適切なパラメータ */);
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

**シグネチャ**:
```javascript
 if (this.container && this.container.parentNode)
```

**パラメーター**:
- `this.container && this.container.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.container && this.container.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `latestResults` | 説明なし |
| `testHistory` | 説明なし |
| `successRate` | 説明なし |
| `qualityScore` | 説明なし |
| `successRate` | 説明なし |
| `performanceScore` | 説明なし |
| `speedScore` | 説明なし |
| `overallScore` | 説明なし |
| `canvas` | 説明なし |
| `ctx` | 説明なし |
| `data` | 説明なし |
| `canvas` | 説明なし |
| `ctx` | 説明なし |
| `categories` | 説明なし |
| `data` | 説明なし |
| `canvas` | 説明なし |
| `ctx` | 説明なし |
| `history` | 説明なし |
| `data` | 説明なし |
| `container` | 説明なし |
| `benchmarkHTML` | 説明なし |
| `canvas` | 説明なし |
| `ctx` | 説明なし |
| `data` | 説明なし |
| `successRate` | 説明なし |
| `container` | 説明なし |
| `analysis` | 説明なし |
| `insightsHTML` | 説明なし |
| `recent` | 説明なし |
| `older` | 説明なし |
| `recentSuccessRate` | 説明なし |
| `olderSuccessRate` | 説明なし |
| `recentExecutionTime` | 説明なし |
| `olderExecutionTime` | 説明なし |
| `successRateChange` | 説明なし |
| `executionTimeChange` | 説明なし |
| `successTrend` | 説明なし |
| `performanceTrend` | 説明なし |
| `recommendations` | 説明なし |
| `categoryFilter` | 説明なし |
| `statusFilter` | 説明なし |
| `searchFilter` | 説明なし |
| `matchesCategory` | 説明なし |
| `matchesStatus` | 説明なし |
| `matchesSearch` | 説明なし |
| `container` | 説明なし |
| `tableHTML` | 説明なし |
| `status` | 説明なし |
| `canvas` | 説明なし |
| `ctx` | 説明なし |
| `coverageData` | 説明なし |
| `container` | 説明なし |
| `coverageHTML` | 説明なし |
| `history` | 説明なし |
| `centerX` | 説明なし |
| `centerY` | 説明なし |
| `radius` | 説明なし |
| `total` | 説明なし |
| `sliceAngle` | 説明なし |
| `labelAngle` | 説明なし |
| `labelX` | 説明なし |
| `labelY` | 説明なし |
| `margin` | 説明なし |
| `chartWidth` | 説明なし |
| `chartHeight` | 説明なし |
| `barWidth` | 説明なし |
| `maxValue` | 説明なし |
| `x` | 説明なし |
| `total` | 説明なし |
| `failedHeight` | 説明なし |
| `warningsHeight` | 説明なし |
| `passedHeight` | 説明なし |
| `margin` | 説明なし |
| `chartWidth` | 説明なし |
| `chartHeight` | 説明なし |
| `minY` | 説明なし |
| `maxY` | 説明なし |
| `rangeY` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `value` | 説明なし |
| `y` | 説明なし |
| `margin` | 説明なし |
| `chartWidth` | 説明なし |
| `chartHeight` | 説明なし |
| `barHeight` | 説明なし |
| `y` | 説明なし |
| `barWidth` | 説明なし |
| `color` | 説明なし |
| `results` | 説明なし |
| `exportData` | 説明なし |
| `dataStr` | 説明なし |
| `dataBlob` | 説明なし |
| `link` | 説明なし |

---

