# ComparisonEngine

## 概要

ファイル: `core/ComparisonEngine.js`  
最終更新: 2025/7/28 16:45:38

## 目次

## クラス
- [ComparisonEngine](#comparisonengine)
## 定数
- [config](#config)
- [processedData1](#processeddata1)
- [processedData2](#processeddata2)
- [basicStats1](#basicstats1)
- [basicStats2](#basicstats2)
- [distribution1](#distribution1)
- [distribution2](#distribution2)
- [significanceTest](#significancetest)
- [effectSize](#effectsize)
- [changeAnalysis](#changeanalysis)
- [trendComparison](#trendcomparison)
- [quantileComparison](#quantilecomparison)
- [outlierAnalysis](#outlieranalysis)
- [correlationAnalysis](#correlationanalysis)
- [overallAssessment](#overallassessment)
- [comparison](#comparison)
- [comparison](#comparison)
- [values](#values)
- [n](#n)
- [sum](#sum)
- [mean](#mean)
- [sortedValues](#sortedvalues)
- [q1](#q1)
- [median](#median)
- [q3](#q3)
- [variance](#variance)
- [standardDeviation](#standarddeviation)
- [skewness](#skewness)
- [kurtosis](#kurtosis)
- [values1](#values1)
- [values2](#values2)
- [normalityTest1](#normalitytest1)
- [normalityTest2](#normalitytest2)
- [values1](#values1)
- [values2](#values2)
- [mean1](#mean1)
- [mean2](#mean2)
- [variance1](#variance1)
- [variance2](#variance2)
- [pooledStandardDeviation](#pooledstandarddeviation)
- [cohensD](#cohensd)
- [absD](#absd)
- [meanChange](#meanchange)
- [meanChangePercent](#meanchangepercent)
- [medianChange](#medianchange)
- [medianChangePercent](#medianchangepercent)
- [variabilityChange](#variabilitychange)
- [variabilityChangePercent](#variabilitychangepercent)
- [n1](#n1)
- [n2](#n2)
- [mean1](#mean1)
- [mean2](#mean2)
- [variance1](#variance1)
- [variance2](#variance2)
- [standardError](#standarderror)
- [tStatistic](#tstatistic)
- [degreesOfFreedom](#degreesoffreedom)
- [pValue](#pvalue)
- [combined](#combined)
- [ranks](#ranks)
- [sumRanks1](#sumranks1)
- [n1](#n1)
- [n2](#n2)
- [u1](#u1)
- [u2](#u2)
- [u](#u)
- [meanU](#meanu)
- [standardErrorU](#standarderroru)
- [zScore](#zscore)
- [pValue](#pvalue)
- [index](#index)
- [lower](#lower)
- [upper](#upper)
- [n](#n)
- [skewness](#skewness)
- [n](#n)
- [kurtosis](#kurtosis)
- [mean](#mean)
- [standardDeviation](#standarddeviation)
- [skewness](#skewness)
- [kurtosis](#kurtosis)
- [isNormal](#isnormal)
- [criticalValues](#criticalvalues)
- [dfIndex](#dfindex)
- [a1](#a1)
- [a2](#a2)
- [a3](#a3)
- [a4](#a4)
- [a5](#a5)
- [p](#p)
- [sign](#sign)
- [t](#t)
- [y](#y)

---

## ComparisonEngine

### コンストラクタ

```javascript
new ComparisonEngine()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `comparisonTypes` | 説明なし |
| `significanceTests` | 説明なし |
| `comparisonConfigs` | 説明なし |

### メソッド

#### compare

**シグネチャ**:
```javascript
 compare(dataset1, dataset2, options = {})
```

**パラメーター**:
- `dataset1`
- `dataset2`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.compare(dataset1, dataset2, options = {});

// compareの実用的な使用例
const result = instance.compare(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### compareTimePeriods

**シグネチャ**:
```javascript
 compareTimePeriods(period1Data, period2Data, category, options = {})
```

**パラメーター**:
- `period1Data`
- `period2Data`
- `category`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.compareTimePeriods(period1Data, period2Data, category, options = {});

// compareTimePeriodsの実用的な使用例
const result = instance.compareTimePeriods(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### compareAgainstBaseline

**シグネチャ**:
```javascript
 compareAgainstBaseline(currentData, baselineData, options = {})
```

**パラメーター**:
- `currentData`
- `baselineData`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.compareAgainstBaseline(currentData, baselineData, options = {});

// compareAgainstBaselineの実用的な使用例
const result = instance.compareAgainstBaseline(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### preprocessComparisonData

**シグネチャ**:
```javascript
 preprocessComparisonData(dataset, label)
```

**パラメーター**:
- `dataset`
- `label`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.preprocessComparisonData(dataset, label);

// preprocessComparisonDataの実用的な使用例
const result = instance.preprocessComparisonData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!dataset || !dataset.data)
```

**パラメーター**:
- `!dataset || !dataset.data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!dataset || !dataset.data);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### map

**シグネチャ**:
```javascript
 map(item => {
            if (typeof item === 'number')
```

**パラメーター**:
- `item => {
            if (typeof item === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.map(item => {
            if (typeof item === 'number');

// mapの実用的な使用例
const result = instance.map(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (item && typeof item.value === 'number')
```

**パラメーター**:
- `item && typeof item.value === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(item && typeof item.value === 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (item && typeof item.total === 'number')
```

**パラメーター**:
- `item && typeof item.total === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(item && typeof item.total === 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (item && typeof item.average === 'number')
```

**パラメーター**:
- `item && typeof item.average === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(item && typeof item.average === 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateBasicStatistics

**シグネチャ**:
```javascript
 calculateBasicStatistics(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateBasicStatistics(data);

// calculateBasicStatisticsの実用的な使用例
const result = instance.calculateBasicStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data.length === 0)
```

**パラメーター**:
- `data.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performSignificanceTest

**シグネチャ**:
```javascript
 performSignificanceTest(data1, data2, config)
```

**パラメーター**:
- `data1`
- `data2`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performSignificanceTest(data1, data2, config);

// performSignificanceTestの実用的な使用例
const result = instance.performSignificanceTest(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data1.length < config.significance.minSampleSize || 
            data2.length < config.significance.minSampleSize)
```

**パラメーター**:
- `data1.length < config.significance.minSampleSize || 
            data2.length < config.significance.minSampleSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data1.length < config.significance.minSampleSize || 
            data2.length < config.significance.minSampleSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (normalityTest1.isNormal && normalityTest2.isNormal)
```

**パラメーター**:
- `normalityTest1.isNormal && normalityTest2.isNormal`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(normalityTest1.isNormal && normalityTest2.isNormal);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateEffectSize

**シグネチャ**:
```javascript
 calculateEffectSize(data1, data2)
```

**パラメーター**:
- `data1`
- `data2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateEffectSize(data1, data2);

// calculateEffectSizeの実用的な使用例
const result = instance.calculateEffectSize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (absD < 0.2)
```

**パラメーター**:
- `absD < 0.2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(absD < 0.2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (absD < 0.5)
```

**パラメーター**:
- `absD < 0.5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(absD < 0.5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (absD < 0.8)
```

**パラメーター**:
- `absD < 0.8`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(absD < 0.8);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeChange

**シグネチャ**:
```javascript
 analyzeChange(stats1, stats2)
```

**パラメーター**:
- `stats1`
- `stats2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeChange(stats1, stats2);

// analyzeChangeの実用的な使用例
const result = instance.analyzeChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performTTest

**シグネチャ**:
```javascript
 performTTest(values1, values2)
```

**パラメーター**:
- `values1`
- `values2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performTTest(values1, values2);

// performTTestの実用的な使用例
const result = instance.performTTest(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performMannWhitneyU

**シグネチャ**:
```javascript
 performMannWhitneyU(values1, values2)
```

**パラメーター**:
- `values1`
- `values2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performMannWhitneyU(values1, values2);

// performMannWhitneyUの実用的な使用例
const result = instance.performMannWhitneyU(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (index > 0 && item.value !== combined[index - 1].value)
```

**パラメーター**:
- `index > 0 && item.value !== combined[index - 1].value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(index > 0 && item.value !== combined[index - 1].value);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateQuantile

**シグネチャ**:
```javascript
 calculateQuantile(sortedValues, q)
```

**パラメーター**:
- `sortedValues`
- `q`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateQuantile(sortedValues, q);

// calculateQuantileの実用的な使用例
const result = instance.calculateQuantile(/* 適切なパラメータ */);
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

#### calculateSkewness

**シグネチャ**:
```javascript
 calculateSkewness(values, mean, standardDeviation)
```

**パラメーター**:
- `values`
- `mean`
- `standardDeviation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateSkewness(values, mean, standardDeviation);

// calculateSkewnessの実用的な使用例
const result = instance.calculateSkewness(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateKurtosis

**シグネチャ**:
```javascript
 calculateKurtosis(values, mean, standardDeviation)
```

**パラメーター**:
- `values`
- `mean`
- `standardDeviation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateKurtosis(values, mean, standardDeviation);

// calculateKurtosisの実用的な使用例
const result = instance.calculateKurtosis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testNormality

**シグネチャ**:
```javascript
 testNormality(values)
```

**パラメーター**:
- `values`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testNormality(values);

// testNormalityの実用的な使用例
const result = instance.testNormality(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

簡易的な正規性検定（Shapiro-Wilk検定の代替）

**シグネチャ**:
```javascript
 if (values.length < 8)
```

**パラメーター**:
- `values.length < 8`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(values.length < 8);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (standardDeviation === 0)
```

**パラメーター**:
- `standardDeviation === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(standardDeviation === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### approximateTTestPValue

**シグネチャ**:
```javascript
 approximateTTestPValue(tStat, df)
```

**パラメーター**:
- `tStat`
- `df`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.approximateTTestPValue(tStat, df);

// approximateTTestPValueの実用的な使用例
const result = instance.approximateTTestPValue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

正規分布近似（大標本の場合）

**シグネチャ**:
```javascript
 if (df >= 30)
```

**パラメーター**:
- `df >= 30`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(df >= 30);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (dfIndex >= 0 && tStat > criticalValues[dfIndex])
```

**パラメーター**:
- `dfIndex >= 0 && tStat > criticalValues[dfIndex]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(dfIndex >= 0 && tStat > criticalValues[dfIndex]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (tStat > 2.0)
```

**パラメーター**:
- `tStat > 2.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(tStat > 2.0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### standardNormalCDF

**シグネチャ**:
```javascript
 standardNormalCDF(x)
```

**パラメーター**:
- `x`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.standardNormalCDF(x);

// standardNormalCDFの実用的な使用例
const result = instance.standardNormalCDF(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### erf

**シグネチャ**:
```javascript
 erf(x)
```

**パラメーター**:
- `x`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.erf(x);

// erfの実用的な使用例
const result = instance.erf(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### determineChangeDirection

**シグネチャ**:
```javascript
 determineChangeDirection(change)
```

**パラメーター**:
- `change`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.determineChangeDirection(change);

// determineChangeDirectionの実用的な使用例
const result = instance.determineChangeDirection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### interpretVariabilityChange

**シグネチャ**:
```javascript
 interpretVariabilityChange(change)
```

**パラメーター**:
- `change`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.interpretVariabilityChange(change);

// interpretVariabilityChangeの実用的な使用例
const result = instance.interpretVariabilityChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### validateComparisonData

**シグネチャ**:
```javascript
 validateComparisonData(data1, data2)
```

**パラメーター**:
- `data1`
- `data2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateComparisonData(data1, data2);

// validateComparisonDataの実用的な使用例
const result = instance.validateComparisonData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createEmptyStatistics

**シグネチャ**:
```javascript
 createEmptyStatistics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createEmptyStatistics();

// createEmptyStatisticsの実用的な使用例
const result = instance.createEmptyStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createInvalidComparisonResult

**シグネチャ**:
```javascript
 createInvalidComparisonResult(data1, data2)
```

**パラメーター**:
- `data1`
- `data2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createInvalidComparisonResult(data1, data2);

// createInvalidComparisonResultの実用的な使用例
const result = instance.createInvalidComparisonResult(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateComparisonId

**シグネチャ**:
```javascript
 generateComparisonId()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateComparisonId();

// generateComparisonIdの実用的な使用例
const result = instance.generateComparisonId(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeDistribution

簡略化された実装のプレースホルダ

**シグネチャ**:
```javascript
 analyzeDistribution(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeDistribution(data);

// analyzeDistributionの実用的な使用例
const result = instance.analyzeDistribution(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### compareTrends

**シグネチャ**:
```javascript
 compareTrends(data1, data2)
```

**パラメーター**:
- `data1`
- `data2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.compareTrends(data1, data2);

// compareTrendsの実用的な使用例
const result = instance.compareTrends(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### compareQuantiles

**シグネチャ**:
```javascript
 compareQuantiles(data1, data2, config)
```

**パラメーター**:
- `data1`
- `data2`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.compareQuantiles(data1, data2, config);

// compareQuantilesの実用的な使用例
const result = instance.compareQuantiles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### compareOutliers

**シグネチャ**:
```javascript
 compareOutliers(data1, data2)
```

**パラメーター**:
- `data1`
- `data2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.compareOutliers(data1, data2);

// compareOutliersの実用的な使用例
const result = instance.compareOutliers(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeCorrelation

**シグネチャ**:
```javascript
 analyzeCorrelation(data1, data2)
```

**パラメーター**:
- `data1`
- `data2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeCorrelation(data1, data2);

// analyzeCorrelationの実用的な使用例
const result = instance.analyzeCorrelation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### assessOverallComparison

**シグネチャ**:
```javascript
 assessOverallComparison(change, significance, effectSize, trends)
```

**パラメーター**:
- `change`
- `significance`
- `effectSize`
- `trends`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.assessOverallComparison(change, significance, effectSize, trends);

// assessOverallComparisonの実用的な使用例
const result = instance.assessOverallComparison(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateRecommendations

**シグネチャ**:
```javascript
 generateRecommendations(assessment, change)
```

**パラメーター**:
- `assessment`
- `change`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateRecommendations(assessment, change);

// generateRecommendationsの実用的な使用例
const result = instance.generateRecommendations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculatePeriodLength

**シグネチャ**:
```javascript
 calculatePeriodLength(period)
```

**パラメーター**:
- `period`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculatePeriodLength(period);

// calculatePeriodLengthの実用的な使用例
const result = instance.calculatePeriodLength(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeSeasonalityImpact

**シグネチャ**:
```javascript
 analyzeSeasonalityImpact(period1, period2)
```

**パラメーター**:
- `period1`
- `period2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeSeasonalityImpact(period1, period2);

// analyzeSeasonalityImpactの実用的な使用例
const result = instance.analyzeSeasonalityImpact(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeWeekdayWeekendSplit

**シグネチャ**:
```javascript
 analyzeWeekdayWeekendSplit(period1, period2)
```

**パラメーター**:
- `period1`
- `period2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeWeekdayWeekendSplit(period1, period2);

// analyzeWeekdayWeekendSplitの実用的な使用例
const result = instance.analyzeWeekdayWeekendSplit(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateGrowthRate

**シグネチャ**:
```javascript
 calculateGrowthRate(data1, data2)
```

**パラメーター**:
- `data1`
- `data2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateGrowthRate(data1, data2);

// calculateGrowthRateの実用的な使用例
const result = instance.calculateGrowthRate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateBaselineDeviation

**シグネチャ**:
```javascript
 calculateBaselineDeviation(current, baseline)
```

**パラメーター**:
- `current`
- `baseline`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateBaselineDeviation(current, baseline);

// calculateBaselineDeviationの実用的な使用例
const result = instance.calculateBaselineDeviation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculatePerformanceIndex

**シグネチャ**:
```javascript
 calculatePerformanceIndex(current, baseline)
```

**パラメーター**:
- `current`
- `baseline`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculatePerformanceIndex(current, baseline);

// calculatePerformanceIndexの実用的な使用例
const result = instance.calculatePerformanceIndex(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateConfidenceInterval

**シグネチャ**:
```javascript
 calculateConfidenceInterval(current, baseline)
```

**パラメーター**:
- `current`
- `baseline`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateConfidenceInterval(current, baseline);

// calculateConfidenceIntervalの実用的な使用例
const result = instance.calculateConfidenceInterval(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### determineAlertLevel

**シグネチャ**:
```javascript
 determineAlertLevel(change, significance)
```

**パラメーター**:
- `change`
- `significance`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.determineAlertLevel(change, significance);

// determineAlertLevelの実用的な使用例
const result = instance.determineAlertLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `config` | 説明なし |
| `processedData1` | 説明なし |
| `processedData2` | 説明なし |
| `basicStats1` | 説明なし |
| `basicStats2` | 説明なし |
| `distribution1` | 説明なし |
| `distribution2` | 説明なし |
| `significanceTest` | 説明なし |
| `effectSize` | 説明なし |
| `changeAnalysis` | 説明なし |
| `trendComparison` | 説明なし |
| `quantileComparison` | 説明なし |
| `outlierAnalysis` | 説明なし |
| `correlationAnalysis` | 説明なし |
| `overallAssessment` | 説明なし |
| `comparison` | 説明なし |
| `comparison` | 説明なし |
| `values` | 説明なし |
| `n` | 説明なし |
| `sum` | 説明なし |
| `mean` | 説明なし |
| `sortedValues` | 説明なし |
| `q1` | 説明なし |
| `median` | 説明なし |
| `q3` | 説明なし |
| `variance` | 説明なし |
| `standardDeviation` | 説明なし |
| `skewness` | 説明なし |
| `kurtosis` | 説明なし |
| `values1` | 説明なし |
| `values2` | 説明なし |
| `normalityTest1` | 説明なし |
| `normalityTest2` | 説明なし |
| `values1` | 説明なし |
| `values2` | 説明なし |
| `mean1` | 説明なし |
| `mean2` | 説明なし |
| `variance1` | 説明なし |
| `variance2` | 説明なし |
| `pooledStandardDeviation` | 説明なし |
| `cohensD` | 説明なし |
| `absD` | 説明なし |
| `meanChange` | 説明なし |
| `meanChangePercent` | 説明なし |
| `medianChange` | 説明なし |
| `medianChangePercent` | 説明なし |
| `variabilityChange` | 説明なし |
| `variabilityChangePercent` | 説明なし |
| `n1` | 説明なし |
| `n2` | 説明なし |
| `mean1` | 説明なし |
| `mean2` | 説明なし |
| `variance1` | 説明なし |
| `variance2` | 説明なし |
| `standardError` | 説明なし |
| `tStatistic` | 説明なし |
| `degreesOfFreedom` | 説明なし |
| `pValue` | 説明なし |
| `combined` | 説明なし |
| `ranks` | 説明なし |
| `sumRanks1` | 説明なし |
| `n1` | 説明なし |
| `n2` | 説明なし |
| `u1` | 説明なし |
| `u2` | 説明なし |
| `u` | 説明なし |
| `meanU` | 説明なし |
| `standardErrorU` | 説明なし |
| `zScore` | 説明なし |
| `pValue` | 説明なし |
| `index` | 説明なし |
| `lower` | 説明なし |
| `upper` | 説明なし |
| `n` | 説明なし |
| `skewness` | 説明なし |
| `n` | 説明なし |
| `kurtosis` | 説明なし |
| `mean` | 説明なし |
| `standardDeviation` | 説明なし |
| `skewness` | 説明なし |
| `kurtosis` | 説明なし |
| `isNormal` | 説明なし |
| `criticalValues` | 説明なし |
| `dfIndex` | 説明なし |
| `a1` | 説明なし |
| `a2` | 説明なし |
| `a3` | 説明なし |
| `a4` | 説明なし |
| `a5` | 説明なし |
| `p` | 説明なし |
| `sign` | 説明なし |
| `t` | 説明なし |
| `y` | 説明なし |

---

