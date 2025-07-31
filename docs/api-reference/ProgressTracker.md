# ProgressTracker

## 概要

ファイル: `core/i18n/management/ProgressTracker.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [ProgressTracker](#progresstracker)
## 関数
- [getProgressTracker()](#getprogresstracker)
## 定数
- [languageSets](#languagesets)
- [flattenedKeys](#flattenedkeys)
- [setData](#setdata)
- [languageSets](#languagesets)
- [setData](#setdata)
- [previousStatus](#previousstatus)
- [results](#results)
- [success](#success)
- [languageSets](#languagesets)
- [setData](#setdata)
- [progress](#progress)
- [status](#status)
- [quality](#quality)
- [hasValue](#hasvalue)
- [qualityWeight](#qualityweight)
- [completionRate](#completionrate)
- [qualityScore](#qualityscore)
- [translationRate](#translationrate)
- [languageSets](#languagesets)
- [overallProgress](#overallprogress)
- [setProgress](#setprogress)
- [languageSets](#languagesets)
- [categoryProgress](#categoryprogress)
- [setProgress](#setprogress)
- [languageProgress](#languageprogress)
- [report](#report)
- [languageSets](#languagesets)
- [categoryProgress](#categoryprogress)
- [incompleteItems](#incompleteitems)
- [languageSets](#languagesets)
- [translationStatus](#translationstatus)
- [languageMilestones](#languagemilestones)
- [languageMilestones](#languagemilestones)
- [goal](#goal)
- [progress](#progress)
- [history](#history)
- [recentHistory](#recenthistory)
- [oldestEntry](#oldestentry)
- [newestEntry](#newestentry)
- [daysElapsed](#dayselapsed)
- [progressChange](#progresschange)
- [dailyProgressRate](#dailyprogressrate)
- [remainingProgress](#remainingprogress)
- [estimatedDaysToGoal](#estimateddaystogoal)
- [estimatedCompletionDate](#estimatedcompletiondate)
- [targetDate](#targetdate)
- [isOnTrack](#isontrack)
- [flattened](#flattened)
- [fullKey](#fullkey)
- [history](#history)
- [history](#history)
- [cutoffDate](#cutoffdate)
- [languageMilestones](#languagemilestones)
- [languageSets](#languagesets)
- [setData](#setdata)
- [details](#details)
- [quality](#quality)
- [contributor](#contributor)
- [priorityOrder](#priorityorder)
- [aDate](#adate)
- [bDate](#bdate)
- [rows](#rows)

---

## ProgressTracker

### コンストラクタ

```javascript
new ProgressTracker()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `languageProgress` | 説明なし |
| `progressHistory` | 説明なし |
| `milestones` | 説明なし |
| `progressGoals` | 説明なし |
| `translationSets` | 説明なし |
| `categories` | 説明なし |
| `progressWeights` | 進捗計算設定 |
| `qualityLevels` | 品質レベル |

### メソッド

#### registerTranslationSet

**シグネチャ**:
```javascript
 registerTranslationSet(language, setName, translations, metadata = {})
```

**パラメーター**:
- `language`
- `setName`
- `translations`
- `metadata = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerTranslationSet(language, setName, translations, metadata = {});

// registerTranslationSetの実用的な使用例
const result = instance.registerTranslationSet(/* 適切なパラメータ */);
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

#### updateTranslationStatus

**シグネチャ**:
```javascript
 updateTranslationStatus(language, setName, key, status, value = '', metadata = {})
```

**パラメーター**:
- `language`
- `setName`
- `key`
- `status`
- `value = ''`
- `metadata = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateTranslationStatus(language, setName, key, status, value = '', metadata = {});

// updateTranslationStatusの実用的な使用例
const result = instance.updateTranslationStatus(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

キーの状態を更新

**シグネチャ**:
```javascript
 if (!setData.translations[key])
```

**パラメーター**:
- `!setData.translations[key]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!setData.translations[key]);

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

#### batchUpdateTranslationStatus

**シグネチャ**:
```javascript
 batchUpdateTranslationStatus(language, setName, updates)
```

**パラメーター**:
- `language`
- `setName`
- `updates`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.batchUpdateTranslationStatus(language, setName, updates);

// batchUpdateTranslationStatusの実用的な使用例
const result = instance.batchUpdateTranslationStatus(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const update of updates)
```

**パラメーター**:
- `const update of updates`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const update of updates);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (success)
```

**パラメーター**:
- `success`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(success);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateSetProgress

**シグネチャ**:
```javascript
 calculateSetProgress(language, setName)
```

**パラメーター**:
- `language`
- `setName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateSetProgress(language, setName);

// calculateSetProgressの実用的な使用例
const result = instance.calculateSetProgress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

状態別カウント

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

#### if

重み付き進捗計算

**シグネチャ**:
```javascript
 if (hasValue)
```

**パラメーター**:
- `hasValue`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hasValue);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### updateLanguageProgress

**シグネチャ**:
```javascript
 updateLanguageProgress(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateLanguageProgress(language);

// updateLanguageProgressの実用的な使用例
const result = instance.updateLanguageProgress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!languageSets)
```

**パラメーター**:
- `!languageSets`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!languageSets);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [setName, setData] of languageSets)
```

**パラメーター**:
- `const [setName`
- `setData] of languageSets`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [setName, setData] of languageSets);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

全体の進捗率を計算

**シグネチャ**:
```javascript
 if (overallProgress.totalKeys > 0)
```

**パラメーター**:
- `overallProgress.totalKeys > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(overallProgress.totalKeys > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCategoryProgress

**シグネチャ**:
```javascript
 getCategoryProgress(language, category)
```

**パラメーター**:
- `language`
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCategoryProgress(language, category);

// getCategoryProgressの実用的な使用例
const result = instance.getCategoryProgress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!languageSets)
```

**パラメーター**:
- `!languageSets`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!languageSets);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [setName, setData] of languageSets)
```

**パラメーター**:
- `const [setName`
- `setData] of languageSets`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [setName, setData] of languageSets);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (setData.metadata.category === category)
```

**パラメーター**:
- `setData.metadata.category === category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(setData.metadata.category === category);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

完成率を計算

**シグネチャ**:
```javascript
 if (categoryProgress.totalKeys > 0)
```

**パラメーター**:
- `categoryProgress.totalKeys > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(categoryProgress.totalKeys > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateProgressReport

**シグネチャ**:
```javascript
 generateProgressReport(language, options = {})
```

**パラメーター**:
- `language`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateProgressReport(language, options = {});

// generateProgressReportの実用的な使用例
const result = instance.generateProgressReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!languageProgress)
```

**パラメーター**:
- `!languageProgress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!languageProgress);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

セット別詳細

**シグネチャ**:
```javascript
 if (includeSets)
```

**パラメーター**:
- `includeSets`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(includeSets);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [setName, setData] of languageSets)
```

**パラメーター**:
- `const [setName`
- `setData] of languageSets`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [setName, setData] of languageSets);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (includeDetails)
```

**パラメーター**:
- `includeDetails`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(includeDetails);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

カテゴリ別進捗

**シグネチャ**:
```javascript
 if (includeCategories)
```

**パラメーター**:
- `includeCategories`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(includeCategories);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const category of this.categories)
```

**パラメーター**:
- `const category of this.categories`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const category of this.categories);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (categoryProgress && categoryProgress.totalKeys > 0)
```

**パラメーター**:
- `categoryProgress && categoryProgress.totalKeys > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(categoryProgress && categoryProgress.totalKeys > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

進捗履歴

**シグネチャ**:
```javascript
 if (includeHistory)
```

**パラメーター**:
- `includeHistory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(includeHistory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getIncompleteItems

**シグネチャ**:
```javascript
 getIncompleteItems(language, options = {})
```

**パラメーター**:
- `language`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getIncompleteItems(language, options = {});

// getIncompleteItemsの実用的な使用例
const result = instance.getIncompleteItems(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!languageSets)
```

**パラメーター**:
- `!languageSets`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!languageSets);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [currentSetName, setData] of languageSets)
```

**パラメーター**:
- `const [currentSetName`
- `setData] of languageSets`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [currentSetName, setData] of languageSets);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

セットフィルター

**シグネチャ**:
```javascript
 if (setName && currentSetName !== setName)
```

**パラメーター**:
- `setName && currentSetName !== setName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(setName && currentSetName !== setName);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

カテゴリフィルター

**シグネチャ**:
```javascript
 if (category && setData.metadata.category !== category)
```

**パラメーター**:
- `category && setData.metadata.category !== category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(category && setData.metadata.category !== category);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

制限適用

**シグネチャ**:
```javascript
 if (limit && limit > 0)
```

**パラメーター**:
- `limit && limit > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(limit && limit > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setMilestone

**シグネチャ**:
```javascript
 setMilestone(language, name, targetPercentage, description = '')
```

**パラメーター**:
- `language`
- `name`
- `targetPercentage`
- `description = ''`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setMilestone(language, name, targetPercentage, description = '');

// setMilestoneの実用的な使用例
const result = instance.setMilestone(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkMilestones

**シグネチャ**:
```javascript
 checkMilestones(language, progress)
```

**パラメーター**:
- `language`
- `progress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkMilestones(language, progress);

// checkMilestonesの実用的な使用例
const result = instance.checkMilestones(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!languageMilestones)
```

**パラメーター**:
- `!languageMilestones`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!languageMilestones);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [name, milestone] of languageMilestones)
```

**パラメーター**:
- `const [name`
- `milestone] of languageMilestones`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [name, milestone] of languageMilestones);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!milestone.achieved && progress.completionRate >= milestone.targetPercentage)
```

**パラメーター**:
- `!milestone.achieved && progress.completionRate >= milestone.targetPercentage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!milestone.achieved && progress.completionRate >= milestone.targetPercentage);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setProgressGoal

**シグネチャ**:
```javascript
 setProgressGoal(language, targetDate, targetPercentage, description = '')
```

**パラメーター**:
- `language`
- `targetDate`
- `targetPercentage`
- `description = ''`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setProgressGoal(language, targetDate, targetPercentage, description = '');

// setProgressGoalの実用的な使用例
const result = instance.setProgressGoal(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### predictGoalAchievement

**シグネチャ**:
```javascript
 predictGoalAchievement(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.predictGoalAchievement(language);

// predictGoalAchievementの実用的な使用例
const result = instance.predictGoalAchievement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

30日間の履歴

**シグネチャ**:
```javascript
 if (!goal || !progress || history.length < 2)
```

**パラメーター**:
- `!goal || !progress || history.length < 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!goal || !progress || history.length < 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

過去7日

**シグネチャ**:
```javascript
 if (recentHistory.length < 2)
```

**パラメーター**:
- `recentHistory.length < 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(recentHistory.length < 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (daysElapsed <= 0)
```

**パラメーター**:
- `daysElapsed <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(daysElapsed <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### flattenTranslations

**シグネチャ**:
```javascript
 flattenTranslations(translations, prefix = '')
```

**パラメーター**:
- `translations`
- `prefix = ''`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.flattenTranslations(translations, prefix = '');

// flattenTranslationsの実用的な使用例
const result = instance.flattenTranslations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof value === 'string')
```

**パラメーター**:
- `typeof value === 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof value === 'string');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateProgressStatistics

**シグネチャ**:
```javascript
 updateProgressStatistics(setData, previousStatus, newStatus)
```

**パラメーター**:
- `setData`
- `previousStatus`
- `newStatus`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateProgressStatistics(setData, previousStatus, newStatus);

// updateProgressStatisticsの実用的な使用例
const result = instance.updateProgressStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

前の状態のカウントを減らす

**シグネチャ**:
```javascript
 if (previousStatus && setData.progress[previousStatus] > 0)
```

**パラメーター**:
- `previousStatus && setData.progress[previousStatus] > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(previousStatus && setData.progress[previousStatus] > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordProgressHistory

**シグネチャ**:
```javascript
 recordProgressHistory(language, setName, key, previousStatus, newStatus)
```

**パラメーター**:
- `language`
- `setName`
- `key`
- `previousStatus`
- `newStatus`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordProgressHistory(language, setName, key, previousStatus, newStatus);

// recordProgressHistoryの実用的な使用例
const result = instance.recordProgressHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴を最新1000件に制限

**シグネチャ**:
```javascript
 if (history.length > 1000)
```

**パラメーター**:
- `history.length > 1000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(history.length > 1000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getProgressHistory

**シグネチャ**:
```javascript
 getProgressHistory(language, days = 30)
```

**パラメーター**:
- `language`
- `days = 30`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getProgressHistory(language, days = 30);

// getProgressHistoryの実用的な使用例
const result = instance.getProgressHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getMilestones

**シグネチャ**:
```javascript
 getMilestones(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMilestones(language);

// getMilestonesの実用的な使用例
const result = instance.getMilestones(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!languageMilestones)
```

**パラメーター**:
- `!languageMilestones`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!languageMilestones);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getSetDetails

**シグネチャ**:
```javascript
 getSetDetails(language, setName)
```

**パラメーター**:
- `language`
- `setName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getSetDetails(language, setName);

// getSetDetailsの実用的な使用例
const result = instance.getSetDetails(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (translation.updatedAt)
```

**パラメーター**:
- `translation.updatedAt`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(translation.updatedAt);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### sortIncompleteItems

**シグネチャ**:
```javascript
 sortIncompleteItems(items, sortBy)
```

**パラメーター**:
- `items`
- `sortBy`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.sortIncompleteItems(items, sortBy);

// sortIncompleteItemsの実用的な使用例
const result = instance.sortIncompleteItems(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (sortBy)
```

**パラメーター**:
- `sortBy`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(sortBy);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### formatProgressReport

**シグネチャ**:
```javascript
 formatProgressReport(report, format)
```

**パラメーター**:
- `report`
- `format`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.formatProgressReport(report, format);

// formatProgressReportの実用的な使用例
const result = instance.formatProgressReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (format)
```

**パラメーター**:
- `format`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(format);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateCSVReport

**シグネチャ**:
```javascript
 generateCSVReport(report)
```

**パラメーター**:
- `report`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateCSVReport(report);

// generateCSVReportの実用的な使用例
const result = instance.generateCSVReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (report.sets)
```

**パラメーター**:
- `report.sets`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(report.sets);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### getLanguageProgress

**シグネチャ**:
```javascript
 getLanguageProgress(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getLanguageProgress(language);

// getLanguageProgressの実用的な使用例
const result = instance.getLanguageProgress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAllLanguageProgress

**シグネチャ**:
```javascript
 getAllLanguageProgress()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAllLanguageProgress();

// getAllLanguageProgressの実用的な使用例
const result = instance.getAllLanguageProgress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getProgressTracker

**シグネチャ**:
```javascript
getProgressTracker()
```

**使用例**:
```javascript
const result = getProgressTracker();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `languageSets` | 説明なし |
| `flattenedKeys` | 説明なし |
| `setData` | 説明なし |
| `languageSets` | 説明なし |
| `setData` | 説明なし |
| `previousStatus` | 説明なし |
| `results` | 説明なし |
| `success` | 説明なし |
| `languageSets` | 説明なし |
| `setData` | 説明なし |
| `progress` | 説明なし |
| `status` | 説明なし |
| `quality` | 説明なし |
| `hasValue` | 説明なし |
| `qualityWeight` | 説明なし |
| `completionRate` | 説明なし |
| `qualityScore` | 説明なし |
| `translationRate` | 説明なし |
| `languageSets` | 説明なし |
| `overallProgress` | 説明なし |
| `setProgress` | 説明なし |
| `languageSets` | 説明なし |
| `categoryProgress` | 説明なし |
| `setProgress` | 説明なし |
| `languageProgress` | 説明なし |
| `report` | 説明なし |
| `languageSets` | 説明なし |
| `categoryProgress` | 説明なし |
| `incompleteItems` | 説明なし |
| `languageSets` | 説明なし |
| `translationStatus` | 説明なし |
| `languageMilestones` | 説明なし |
| `languageMilestones` | 説明なし |
| `goal` | 説明なし |
| `progress` | 説明なし |
| `history` | 説明なし |
| `recentHistory` | 説明なし |
| `oldestEntry` | 説明なし |
| `newestEntry` | 説明なし |
| `daysElapsed` | 説明なし |
| `progressChange` | 説明なし |
| `dailyProgressRate` | 説明なし |
| `remainingProgress` | 説明なし |
| `estimatedDaysToGoal` | 説明なし |
| `estimatedCompletionDate` | 説明なし |
| `targetDate` | 説明なし |
| `isOnTrack` | 説明なし |
| `flattened` | 説明なし |
| `fullKey` | 説明なし |
| `history` | 説明なし |
| `history` | 説明なし |
| `cutoffDate` | 説明なし |
| `languageMilestones` | 説明なし |
| `languageSets` | 説明なし |
| `setData` | 説明なし |
| `details` | 説明なし |
| `quality` | 説明なし |
| `contributor` | 説明なし |
| `priorityOrder` | 説明なし |
| `aDate` | 説明なし |
| `bDate` | 説明なし |
| `rows` | 説明なし |

---

