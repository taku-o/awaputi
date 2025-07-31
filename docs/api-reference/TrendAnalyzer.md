# TrendAnalyzer

## 概要

ファイル: `core/TrendAnalyzer.js`  
最終更新: 2025/7/28 16:45:38

## 目次

## クラス
- [TrendAnalyzer](#trendanalyzer)
## 定数
- [config](#config)
- [processedData](#processeddata)
- [shortTermTrend](#shorttermtrend)
- [mediumTermTrend](#mediumtermtrend)
- [longTermTrend](#longtermtrend)
- [overallTrend](#overalltrend)
- [seasonality](#seasonality)
- [volatility](#volatility)
- [forecast](#forecast)
- [trendStrength](#trendstrength)
- [windowData](#windowdata)
- [regression](#regression)
- [percentChange](#percentchange)
- [trendType](#trendtype)
- [consistency](#consistency)
- [regression](#regression)
- [percentChange](#percentchange)
- [turningPoints](#turningpoints)
- [acceleration](#acceleration)
- [n](#n)
- [xValues](#xvalues)
- [yValues](#yvalues)
- [sumX](#sumx)
- [sumY](#sumy)
- [sumXY](#sumxy)
- [sumXX](#sumxx)
- [sumYY](#sumyy)
- [slope](#slope)
- [intercept](#intercept)
- [yMean](#ymean)
- [ssRes](#ssres)
- [predicted](#predicted)
- [ssTot](#sstot)
- [rSquared](#rsquared)
- [absChange](#abschange)
- [thresholds](#thresholds)
- [changes](#changes)
- [change](#change)
- [positiveChanges](#positivechanges)
- [negativeChanges](#negativechanges)
- [noChanges](#nochanges)
- [totalChanges](#totalchanges)
- [maxConsistency](#maxconsistency)
- [cycleLengths](#cyclelengths)
- [seasonalityResults](#seasonalityresults)
- [correlation](#correlation)
- [hasSeasonality](#hasseasonality)
- [values](#values)
- [n](#n)
- [x](#x)
- [y](#y)
- [numerator](#numerator)
- [denominator](#denominator)
- [values](#values)
- [mean](#mean)
- [standardDeviation](#standarddeviation)
- [coefficientOfVariation](#coefficientofvariation)
- [regression](#regression)
- [lastIndex](#lastindex)
- [forecast](#forecast)
- [predictedValue](#predictedvalue)
- [regression](#regression)
- [percentChange](#percentchange)
- [rSquaredWeight](#rsquaredweight)
- [percentChangeWeight](#percentchangeweight)
- [consistencyWeight](#consistencyweight)
- [strength](#strength)
- [values](#values)
- [values](#values)
- [mid](#mid)
- [mean](#mean)
- [values](#values)
- [variance](#variance)
- [mean](#mean)
- [values](#values)
- [values](#values)
- [mean](#mean)
- [values](#values)
- [values](#values)
- [q1](#q1)
- [q3](#q3)
- [iqr](#iqr)
- [lowerBound](#lowerbound)
- [upperBound](#upperbound)
- [sorted](#sorted)
- [index](#index)
- [lower](#lower)
- [upper](#upper)
- [significant](#significant)
- [baseConfidence](#baseconfidence)
- [timeDecay](#timedecay)

---

## TrendAnalyzer

### コンストラクタ

```javascript
new TrendAnalyzer()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `analysisConfigs` | 説明なし |
| `trendTypes` | 説明なし |

### メソッド

#### analyze

**シグネチャ**:
```javascript
 analyze(timeSeriesData, category = null, options = {})
```

**パラメーター**:
- `timeSeriesData`
- `category = null`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyze(timeSeriesData, category = null, options = {});

// analyzeの実用的な使用例
const result = instance.analyze(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!timeSeriesData || timeSeriesData.length === 0)
```

**パラメーター**:
- `!timeSeriesData || timeSeriesData.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!timeSeriesData || timeSeriesData.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (processedData.length < 3)
```

**パラメーター**:
- `processedData.length < 3`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(processedData.length < 3);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### preprocessData

**シグネチャ**:
```javascript
 preprocessData(timeSeriesData, category)
```

**パラメーター**:
- `timeSeriesData`
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.preprocessData(timeSeriesData, category);

// preprocessDataの実用的な使用例
const result = instance.preprocessData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

カテゴリ指定がある場合はフィルター

**シグネチャ**:
```javascript
 if (category)
```

**パラメーター**:
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(category);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

異常値検出・除去（オプション）

**シグネチャ**:
```javascript
 if (this.analysisConfigs.outlierDetection.enabled)
```

**パラメーター**:
- `this.analysisConfigs.outlierDetection.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.analysisConfigs.outlierDetection.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeWindow

**シグネチャ**:
```javascript
 analyzeWindow(data, windowSize)
```

**パラメーター**:
- `data`
- `windowSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeWindow(data, windowSize);

// analyzeWindowの実用的な使用例
const result = instance.analyzeWindow(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data.length < windowSize)
```

**パラメーター**:
- `data.length < windowSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.length < windowSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeOverallTrend

**シグネチャ**:
```javascript
 analyzeOverallTrend(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeOverallTrend(data);

// analyzeOverallTrendの実用的な使用例
const result = instance.analyzeOverallTrend(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateLinearRegression

**シグネチャ**:
```javascript
 calculateLinearRegression(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateLinearRegression(data);

// calculateLinearRegressionの実用的な使用例
const result = instance.calculateLinearRegression(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculatePercentChange

**シグネチャ**:
```javascript
 calculatePercentChange(startValue, endValue)
```

**パラメーター**:
- `startValue`
- `endValue`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculatePercentChange(startValue, endValue);

// calculatePercentChangeの実用的な使用例
const result = instance.calculatePercentChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (startValue === 0)
```

**パラメーター**:
- `startValue === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(startValue === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### determineTrendType

**シグネチャ**:
```javascript
 determineTrendType(percentChange)
```

**パラメーター**:
- `percentChange`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.determineTrendType(percentChange);

// determineTrendTypeの実用的な使用例
const result = instance.determineTrendType(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (absChange >= thresholds.strong)
```

**パラメーター**:
- `absChange >= thresholds.strong`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(absChange >= thresholds.strong);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (absChange >= thresholds.moderate)
```

**パラメーター**:
- `absChange >= thresholds.moderate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(absChange >= thresholds.moderate);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (absChange >= thresholds.weak)
```

**パラメーター**:
- `absChange >= thresholds.weak`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(absChange >= thresholds.weak);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### evaluateTrendConsistency

**シグネチャ**:
```javascript
 evaluateTrendConsistency(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.evaluateTrendConsistency(data);

// evaluateTrendConsistencyの実用的な使用例
const result = instance.evaluateTrendConsistency(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 1; i < data.length; i++)
```

**パラメーター**:
- `let i = 1; i < data.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 1; i < data.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeSeasonality

**シグネチャ**:
```javascript
 analyzeSeasonality(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeSeasonality(data);

// analyzeSeasonalityの実用的な使用例
const result = instance.analyzeSeasonality(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data.length < 12)
```

**パラメーター**:
- `data.length < 12`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.length < 12);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(cycleLength => {
            if (data.length >= cycleLength * 2)
```

**パラメーター**:
- `cycleLength => {
            if (data.length >= cycleLength * 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(cycleLength => {
            if (data.length >= cycleLength * 2);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateAutocorrelation

**シグネチャ**:
```javascript
 calculateAutocorrelation(data, lag)
```

**パラメーター**:
- `data`
- `lag`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateAutocorrelation(data, lag);

// calculateAutocorrelationの実用的な使用例
const result = instance.calculateAutocorrelation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < n; i++)
```

**パラメーター**:
- `let i = 0; i < n; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < n; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeVolatility

**シグネチャ**:
```javascript
 analyzeVolatility(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeVolatility(data);

// analyzeVolatilityの実用的な使用例
const result = instance.analyzeVolatility(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (coefficientOfVariation < 10)
```

**パラメーター**:
- `coefficientOfVariation < 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(coefficientOfVariation < 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (coefficientOfVariation < 25)
```

**パラメーター**:
- `coefficientOfVariation < 25`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(coefficientOfVariation < 25);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateForecast

**シグネチャ**:
```javascript
 generateForecast(data, periods)
```

**パラメーター**:
- `data`
- `periods`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateForecast(data, periods);

// generateForecastの実用的な使用例
const result = instance.generateForecast(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 1; i <= periods; i++)
```

**パラメーター**:
- `let i = 1; i <= periods; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 1; i <= periods; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateTrendStrength

**シグネチャ**:
```javascript
 calculateTrendStrength(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateTrendStrength(data);

// calculateTrendStrengthの実用的な使用例
const result = instance.calculateTrendStrength(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateMean

**シグネチャ**:
```javascript
 calculateMean(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateMean(data);

// calculateMeanの実用的な使用例
const result = instance.calculateMean(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateMedian

**シグネチャ**:
```javascript
 calculateMedian(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateMedian(data);

// calculateMedianの実用的な使用例
const result = instance.calculateMedian(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateStandardDeviation

**シグネチャ**:
```javascript
 calculateStandardDeviation(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateStandardDeviation(data);

// calculateStandardDeviationの実用的な使用例
const result = instance.calculateStandardDeviation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateVariance

**シグネチャ**:
```javascript
 calculateVariance(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateVariance(data);

// calculateVarianceの実用的な使用例
const result = instance.calculateVariance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateRange

**シグネチャ**:
```javascript
 calculateRange(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateRange(data);

// calculateRangeの実用的な使用例
const result = instance.calculateRange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateAverageAbsoluteDeviation

**シグネチャ**:
```javascript
 calculateAverageAbsoluteDeviation(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateAverageAbsoluteDeviation(data);

// calculateAverageAbsoluteDeviationの実用的な使用例
const result = instance.calculateAverageAbsoluteDeviation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### removeOutliers

**シグネチャ**:
```javascript
 removeOutliers(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeOutliers(data);

// removeOutliersの実用的な使用例
const result = instance.removeOutliers(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculatePercentile

**シグネチャ**:
```javascript
 calculatePercentile(values, percentile)
```

**パラメーター**:
- `values`
- `percentile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculatePercentile(values, percentile);

// calculatePercentileの実用的な使用例
const result = instance.calculatePercentile(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (lower === upper)
```

**パラメーター**:
- `lower === upper`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(lower === upper);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectTurningPoints

**シグネチャ**:
```javascript
 detectTurningPoints(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectTurningPoints(data);

// detectTurningPointsの実用的な使用例
const result = instance.detectTurningPoints(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeAcceleration

**シグネチャ**:
```javascript
 analyzeAcceleration(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeAcceleration(data);

// analyzeAccelerationの実用的な使用例
const result = instance.analyzeAcceleration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateTrendDuration

**シグネチャ**:
```javascript
 calculateTrendDuration(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateTrendDuration(data);

// calculateTrendDurationの実用的な使用例
const result = instance.calculateTrendDuration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### findDominantCycle

**シグネチャ**:
```javascript
 findDominantCycle(seasonalityResults)
```

**パラメーター**:
- `seasonalityResults`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.findDominantCycle(seasonalityResults);

// findDominantCycleの実用的な使用例
const result = instance.findDominantCycle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateSignificance

**シグネチャ**:
```javascript
 calculateSignificance(regression, sampleSize)
```

**パラメーター**:
- `regression`
- `sampleSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateSignificance(regression, sampleSize);

// calculateSignificanceの実用的な使用例
const result = instance.calculateSignificance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateForecastConfidence

**シグネチャ**:
```javascript
 calculateForecastConfidence(regression, period)
```

**パラメーター**:
- `regression`
- `period`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateForecastConfidence(regression, period);

// calculateForecastConfidenceの実用的な使用例
const result = instance.calculateForecastConfidence(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### interpretTrendStrength

**シグネチャ**:
```javascript
 interpretTrendStrength(strength)
```

**パラメーター**:
- `strength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.interpretTrendStrength(strength);

// interpretTrendStrengthの実用的な使用例
const result = instance.interpretTrendStrength(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### assessDataQuality

**シグネチャ**:
```javascript
 assessDataQuality(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.assessDataQuality(data);

// assessDataQualityの実用的な使用例
const result = instance.assessDataQuality(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateConfidence

**シグネチャ**:
```javascript
 calculateConfidence(data, trend)
```

**パラメーター**:
- `data`
- `trend`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateConfidence(data, trend);

// calculateConfidenceの実用的な使用例
const result = instance.calculateConfidence(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createEmptyAnalysis

**シグネチャ**:
```javascript
 createEmptyAnalysis()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createEmptyAnalysis();

// createEmptyAnalysisの実用的な使用例
const result = instance.createEmptyAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createInsufficientDataAnalysis

**シグネチャ**:
```javascript
 createInsufficientDataAnalysis(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createInsufficientDataAnalysis(data);

// createInsufficientDataAnalysisの実用的な使用例
const result = instance.createInsufficientDataAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `config` | 説明なし |
| `processedData` | 説明なし |
| `shortTermTrend` | 説明なし |
| `mediumTermTrend` | 説明なし |
| `longTermTrend` | 説明なし |
| `overallTrend` | 説明なし |
| `seasonality` | 説明なし |
| `volatility` | 説明なし |
| `forecast` | 説明なし |
| `trendStrength` | 説明なし |
| `windowData` | 説明なし |
| `regression` | 説明なし |
| `percentChange` | 説明なし |
| `trendType` | 説明なし |
| `consistency` | 説明なし |
| `regression` | 説明なし |
| `percentChange` | 説明なし |
| `turningPoints` | 説明なし |
| `acceleration` | 説明なし |
| `n` | 説明なし |
| `xValues` | 説明なし |
| `yValues` | 説明なし |
| `sumX` | 説明なし |
| `sumY` | 説明なし |
| `sumXY` | 説明なし |
| `sumXX` | 説明なし |
| `sumYY` | 説明なし |
| `slope` | 説明なし |
| `intercept` | 説明なし |
| `yMean` | 説明なし |
| `ssRes` | 説明なし |
| `predicted` | 説明なし |
| `ssTot` | 説明なし |
| `rSquared` | 説明なし |
| `absChange` | 説明なし |
| `thresholds` | 説明なし |
| `changes` | 説明なし |
| `change` | 説明なし |
| `positiveChanges` | 説明なし |
| `negativeChanges` | 説明なし |
| `noChanges` | 説明なし |
| `totalChanges` | 説明なし |
| `maxConsistency` | 説明なし |
| `cycleLengths` | 説明なし |
| `seasonalityResults` | 説明なし |
| `correlation` | 説明なし |
| `hasSeasonality` | 説明なし |
| `values` | 説明なし |
| `n` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `numerator` | 説明なし |
| `denominator` | 説明なし |
| `values` | 説明なし |
| `mean` | 説明なし |
| `standardDeviation` | 説明なし |
| `coefficientOfVariation` | 説明なし |
| `regression` | 説明なし |
| `lastIndex` | 説明なし |
| `forecast` | 説明なし |
| `predictedValue` | 説明なし |
| `regression` | 説明なし |
| `percentChange` | 説明なし |
| `rSquaredWeight` | 説明なし |
| `percentChangeWeight` | 説明なし |
| `consistencyWeight` | 説明なし |
| `strength` | 説明なし |
| `values` | 説明なし |
| `values` | 説明なし |
| `mid` | 説明なし |
| `mean` | 説明なし |
| `values` | 説明なし |
| `variance` | 説明なし |
| `mean` | 説明なし |
| `values` | 説明なし |
| `values` | 説明なし |
| `mean` | 説明なし |
| `values` | 説明なし |
| `values` | 説明なし |
| `q1` | 説明なし |
| `q3` | 説明なし |
| `iqr` | 説明なし |
| `lowerBound` | 説明なし |
| `upperBound` | 説明なし |
| `sorted` | 説明なし |
| `index` | 説明なし |
| `lower` | 説明なし |
| `upper` | 説明なし |
| `significant` | 説明なし |
| `baseConfidence` | 説明なし |
| `timeDecay` | 説明なし |

---

