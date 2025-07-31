# QualityReporter

## 概要

ファイル: `core/i18n/quality/QualityReporter.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [QualityReporter](#qualityreporter)
## 関数
- [getQualityReporter()](#getqualityreporter)
## 定数
- [reportId](#reportid)
- [templateType](#templatetype)
- [template](#template)
- [reportData](#reportdata)
- [report](#report)
- [analysis](#analysis)
- [statistics](#statistics)
- [rule](#rule)
- [ruleStats](#rulestats)
- [category](#category)
- [categoryStats](#categorystats)
- [categories](#categories)
- [recommendations](#recommendations)
- [summary](#summary)
- [language](#language)
- [trends](#trends)
- [latest](#latest)
- [previous](#previous)
- [scoreChange](#scorechange)
- [errorChange](#errorchange)
- [warningChange](#warningchange)
- [recent](#recent)
- [scores](#scores)
- [language](#language)
- [trends](#trends)
- [sections](#sections)
- [qualityColor](#qualitycolor)
- [rows](#rows)
- [grades](#grades)
- [names](#names)
- [priorities](#priorities)
- [directions](#directions)
- [trends](#trends)

---

## QualityReporter

### コンストラクタ

```javascript
new QualityReporter()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `reportTemplates` | 説明なし |
| `reportHistory` | 説明なし |
| `qualityTrends` | 説明なし |

### メソッド

#### initializeReportTemplates

**シグネチャ**:
```javascript
 initializeReportTemplates()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeReportTemplates();

// initializeReportTemplatesの実用的な使用例
const result = instance.initializeReportTemplates(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateComprehensiveReport

**シグネチャ**:
```javascript
 generateComprehensiveReport(validationResults, options = {})
```

**パラメーター**:
- `validationResults`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateComprehensiveReport(validationResults, options = {});

// generateComprehensiveReportの実用的な使用例
const result = instance.generateComprehensiveReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!template)
```

**パラメーター**:
- `!template`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!template);

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

#### analyzeValidationResults

**シグネチャ**:
```javascript
 analyzeValidationResults(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeValidationResults(results);

// analyzeValidationResultsの実用的な使用例
const result = instance.analyzeValidationResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateSummary

**シグネチャ**:
```javascript
 generateSummary(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateSummary(results);

// generateSummaryの実用的な使用例
const result = instance.generateSummary(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateStatistics

**シグネチャ**:
```javascript
 generateStatistics(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateStatistics(results);

// generateStatisticsの実用的な使用例
const result = instance.generateStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(item => {
            if (item.key)
```

**パラメーター**:
- `item => {
            if (item.key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(item => {
            if (item.key);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### categorizeIssues

**シグネチャ**:
```javascript
 categorizeIssues(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.categorizeIssues(results);

// categorizeIssuesの実用的な使用例
const result = instance.categorizeIssues(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(error => {
            if (error.rule === 'parameterConsistency' || error.rule === 'formatValidation')
```

**パラメーター**:
- `error => {
            if (error.rule === 'parameterConsistency' || error.rule === 'formatValidation'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(error => {
            if (error.rule === 'parameterConsistency' || error.rule === 'formatValidation');

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (error.rule === 'completenessCheck')
```

**パラメーター**:
- `error.rule === 'completenessCheck'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(error.rule === 'completenessCheck');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(warning => {
            if (warning.rule === 'culturalAppropriateness')
```

**パラメーター**:
- `warning => {
            if (warning.rule === 'culturalAppropriateness'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(warning => {
            if (warning.rule === 'culturalAppropriateness');

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (warning.rule === 'lengthValidation' || warning.rule === 'consistencyCheck')
```

**パラメーター**:
- `warning.rule === 'lengthValidation' || warning.rule === 'consistencyCheck'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(warning.rule === 'lengthValidation' || warning.rule === 'consistencyCheck');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateRecommendations

**シグネチャ**:
```javascript
 generateRecommendations(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateRecommendations(results);

// generateRecommendationsの実用的な使用例
const result = instance.generateRecommendations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

品質スコアベースの推奨事項

**シグネチャ**:
```javascript
 if (summary.qualityScore < 60)
```

**パラメーター**:
- `summary.qualityScore < 60`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(summary.qualityScore < 60);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (summary.qualityScore < 80)
```

**パラメーター**:
- `summary.qualityScore < 80`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(summary.qualityScore < 80);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

エラー数ベースの推奨事項

**シグネチャ**:
```javascript
 if (summary.errorCount > 0)
```

**パラメーター**:
- `summary.errorCount > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(summary.errorCount > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

警告数ベースの推奨事項

**シグネチャ**:
```javascript
 if (summary.warningCount > 10)
```

**パラメーター**:
- `summary.warningCount > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(summary.warningCount > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

成功率ベースの推奨事項

**シグネチャ**:
```javascript
 if (summary.successRate < 70)
```

**パラメーター**:
- `summary.successRate < 70`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(summary.successRate < 70);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeTrends

**シグネチャ**:
```javascript
 analyzeTrends(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeTrends(results);

// analyzeTrendsの実用的な使用例
const result = instance.analyzeTrends(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (trends.length < 2)
```

**パラメーター**:
- `trends.length < 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(trends.length < 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateOverallTrend

**シグネチャ**:
```javascript
 calculateOverallTrend(trends)
```

**パラメーター**:
- `trends`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateOverallTrend(trends);

// calculateOverallTrendの実用的な使用例
const result = instance.calculateOverallTrend(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 1; i < scores.length; i++)
```

**パラメーター**:
- `let i = 1; i < scores.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 1; i < scores.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateQualityTrends

**シグネチャ**:
```javascript
 updateQualityTrends(reportData)
```

**パラメーター**:
- `reportData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateQualityTrends(reportData);

// updateQualityTrendsの実用的な使用例
const result = instance.updateQualityTrends(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最新50件のトレンドのみ保持

**シグネチャ**:
```javascript
 if (trends.length > 50)
```

**パラメーター**:
- `trends.length > 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(trends.length > 50);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderReport

**シグネチャ**:
```javascript
 renderReport(reportData, template)
```

**パラメーター**:
- `reportData`
- `template`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderReport(reportData, template);

// renderReportの実用的な使用例
const result = instance.renderReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (template.format)
```

**パラメーター**:
- `template.format`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(template.format);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderHtmlReport

**シグネチャ**:
```javascript
 renderHtmlReport(reportData, template)
```

**パラメーター**:
- `reportData`
- `template`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderHtmlReport(reportData, template);

// renderHtmlReportの実用的な使用例
const result = instance.renderHtmlReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderSummarySection

**シグネチャ**:
```javascript
 renderSummarySection(summary)
```

**パラメーター**:
- `summary`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderSummarySection(summary);

// renderSummarySectionの実用的な使用例
const result = instance.renderSummarySection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderStatisticsSection

**シグネチャ**:
```javascript
 renderStatisticsSection(statistics)
```

**パラメーター**:
- `statistics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderStatisticsSection(statistics);

// renderStatisticsSectionの実用的な使用例
const result = instance.renderStatisticsSection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderIssuesSection

**シグネチャ**:
```javascript
 renderIssuesSection(issues)
```

**パラメーター**:
- `issues`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderIssuesSection(issues);

// renderIssuesSectionの実用的な使用例
const result = instance.renderIssuesSection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderIssueItem

**シグネチャ**:
```javascript
 renderIssueItem(issue, severity)
```

**パラメーター**:
- `issue`
- `severity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderIssueItem(issue, severity);

// renderIssueItemの実用的な使用例
const result = instance.renderIssueItem(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderRecommendationsSection

**シグネチャ**:
```javascript
 renderRecommendationsSection(recommendations)
```

**パラメーター**:
- `recommendations`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderRecommendationsSection(recommendations);

// renderRecommendationsSectionの実用的な使用例
const result = instance.renderRecommendationsSection(/* 適切なパラメータ */);
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

#### renderTrendsSection

**シグネチャ**:
```javascript
 renderTrendsSection(trends)
```

**パラメーター**:
- `trends`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderTrendsSection(trends);

// renderTrendsSectionの実用的な使用例
const result = instance.renderTrendsSection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!trends.data)
```

**パラメーター**:
- `!trends.data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!trends.data);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderCsvReport

**シグネチャ**:
```javascript
 renderCsvReport(reportData)
```

**パラメーター**:
- `reportData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderCsvReport(reportData);

// renderCsvReportの実用的な使用例
const result = instance.renderCsvReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderJsonReport

**シグネチャ**:
```javascript
 renderJsonReport(reportData)
```

**パラメーター**:
- `reportData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderJsonReport(reportData);

// renderJsonReportの実用的な使用例
const result = instance.renderJsonReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getReportCSS

**シグネチャ**:
```javascript
 getReportCSS()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getReportCSS();

// getReportCSSの実用的な使用例
const result = instance.getReportCSS(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateReportId

**シグネチャ**:
```javascript
 generateReportId()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateReportId();

// generateReportIdの実用的な使用例
const result = instance.generateReportId(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getQualityColor

**シグネチャ**:
```javascript
 getQualityColor(score)
```

**パラメーター**:
- `score`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getQualityColor(score);

// getQualityColorの実用的な使用例
const result = instance.getQualityColor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getQualityGradeText

**シグネチャ**:
```javascript
 getQualityGradeText(grade)
```

**パラメーター**:
- `grade`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getQualityGradeText(grade);

// getQualityGradeTextの実用的な使用例
const result = instance.getQualityGradeText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRuleDisplayName

**シグネチャ**:
```javascript
 getRuleDisplayName(rule)
```

**パラメーター**:
- `rule`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRuleDisplayName(rule);

// getRuleDisplayNameの実用的な使用例
const result = instance.getRuleDisplayName(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getPriorityText

**シグネチャ**:
```javascript
 getPriorityText(priority)
```

**パラメーター**:
- `priority`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getPriorityText(priority);

// getPriorityTextの実用的な使用例
const result = instance.getPriorityText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTrendDirectionText

**シグネチャ**:
```javascript
 getTrendDirectionText(direction)
```

**パラメーター**:
- `direction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTrendDirectionText(direction);

// getTrendDirectionTextの実用的な使用例
const result = instance.getTrendDirectionText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getOverallTrendText

**シグネチャ**:
```javascript
 getOverallTrendText(trend)
```

**パラメーター**:
- `trend`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getOverallTrendText(trend);

// getOverallTrendTextの実用的な使用例
const result = instance.getOverallTrendText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getReportHistory

**シグネチャ**:
```javascript
 getReportHistory(language = null, limit = 10)
```

**パラメーター**:
- `language = null`
- `limit = 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getReportHistory(language = null, limit = 10);

// getReportHistoryの実用的な使用例
const result = instance.getReportHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(language);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getQualityTrends

**シグネチャ**:
```javascript
 getQualityTrends(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getQualityTrends(language);

// getQualityTrendsの実用的な使用例
const result = instance.getQualityTrends(/* 適切なパラメータ */);
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


---

## getQualityReporter

**シグネチャ**:
```javascript
getQualityReporter()
```

**使用例**:
```javascript
const result = getQualityReporter();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `reportId` | 説明なし |
| `templateType` | 説明なし |
| `template` | 説明なし |
| `reportData` | 説明なし |
| `report` | 説明なし |
| `analysis` | 説明なし |
| `statistics` | 説明なし |
| `rule` | 説明なし |
| `ruleStats` | 説明なし |
| `category` | 説明なし |
| `categoryStats` | 説明なし |
| `categories` | 説明なし |
| `recommendations` | 説明なし |
| `summary` | 説明なし |
| `language` | 説明なし |
| `trends` | 説明なし |
| `latest` | 説明なし |
| `previous` | 説明なし |
| `scoreChange` | 説明なし |
| `errorChange` | 説明なし |
| `warningChange` | 説明なし |
| `recent` | 説明なし |
| `scores` | 説明なし |
| `language` | 説明なし |
| `trends` | 説明なし |
| `sections` | 説明なし |
| `qualityColor` | 説明なし |
| `rows` | 説明なし |
| `grades` | 説明なし |
| `names` | 説明なし |
| `priorities` | 説明なし |
| `directions` | 説明なし |
| `trends` | 説明なし |

---

