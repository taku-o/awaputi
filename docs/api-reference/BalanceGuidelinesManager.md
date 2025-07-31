# BalanceGuidelinesManager

## 概要

ファイル: `utils/BalanceGuidelinesManager.js`  
最終更新: 2025/7/27 22:06:29

## 目次

## クラス
- [BalanceGuidelinesManager](#balanceguidelinesmanager)
## 関数
- [getBalanceGuidelinesManager()](#getbalanceguidelinesmanager)
## 定数
- [guideline](#guideline)
- [validationId](#validationid)
- [guideline](#guideline)
- [issues](#issues)
- [recommendations](#recommendations)
- [rangeCheck](#rangecheck)
- [stepCheck](#stepcheck)
- [consistencyCheck](#consistencycheck)
- [impactAnalysis](#impactanalysis)
- [issues](#issues)
- [recommendations](#recommendations)
- [issues](#issues)
- [recommendations](#recommendations)
- [changeAmount](#changeamount)
- [changeRatio](#changeratio)
- [step](#step)
- [issues](#issues)
- [recommendations](#recommendations)
- [hardBubbleOrder](#hardbubbleorder)
- [expectedMin](#expectedmin)
- [changeRecord](#changerecord)
- [report](#report)
- [impactRule](#impactrule)
- [impact](#impact)
- [impact](#impact)
- [result](#result)
- [totalChanges](#totalchanges)
- [recentChanges](#recentchanges)
- [changesByType](#changesbytype)
- [type](#type)

---

## BalanceGuidelinesManager

### コンストラクタ

```javascript
new BalanceGuidelinesManager()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `configManager` | 説明なし |
| `validator` | 説明なし |
| `errorHandler` | 説明なし |
| `guidelines` | バランス調整ガイドライン |
| `changeHistory` | 変更履歴 |
| `impactRules` | 影響分析ルール |

### メソッド

#### getAdjustmentGuidelines

**シグネチャ**:
```javascript
 getAdjustmentGuidelines(configType)
```

**パラメーター**:
- `configType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAdjustmentGuidelines(configType);

// getAdjustmentGuidelinesの実用的な使用例
const result = instance.getAdjustmentGuidelines(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!guideline)
```

**パラメーター**:
- `!guideline`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!guideline);

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

#### validateAdjustment

**シグネチャ**:
```javascript
 validateAdjustment(oldValue, newValue, context)
```

**パラメーター**:
- `oldValue`
- `newValue`
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateAdjustment(oldValue, newValue, context);

// validateAdjustmentの実用的な使用例
const result = instance.validateAdjustment(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!guideline)
```

**パラメーター**:
- `!guideline`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!guideline);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!rangeCheck.isValid)
```

**パラメーター**:
- `!rangeCheck.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!rangeCheck.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!stepCheck.isValid)
```

**パラメーター**:
- `!stepCheck.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!stepCheck.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!consistencyCheck.isValid)
```

**パラメーター**:
- `!consistencyCheck.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!consistencyCheck.isValid);

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

#### if

**シグネチャ**:
```javascript
 if (!guideline.recommendedRanges)
```

**パラメーター**:
- `!guideline.recommendedRanges`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!guideline.recommendedRanges);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!range && bubbleType !== 'normal')
```

**パラメーター**:
- `!range && bubbleType !== 'normal'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!range && bubbleType !== 'normal');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!range)
```

**パラメーター**:
- `!range`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!range);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof value === 'number')
```

**パラメーター**:
- `typeof value === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof value === 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value < range.min)
```

**パラメーター**:
- `value < range.min`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value < range.min);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value > range.max)
```

**パラメーター**:
- `value > range.max`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value > range.max);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof oldValue !== 'number' || typeof newValue !== 'number')
```

**パラメーター**:
- `typeof oldValue !== 'number' || typeof newValue !== 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof oldValue !== 'number' || typeof newValue !== 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

大きすぎる変更の警告

**シグネチャ**:
```javascript
 if (changeRatio > 0.5)
```

**パラメーター**:
- `changeRatio > 0.5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(changeRatio > 0.5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

推奨ステップサイズの確認

**シグネチャ**:
```javascript
 if (guideline.adjustmentSteps && changeAmount > 0)
```

**パラメーター**:
- `guideline.adjustmentSteps && changeAmount > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(guideline.adjustmentSteps && changeAmount > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (changeAmount % step !== 0)
```

**パラメーター**:
- `changeAmount % step !== 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(changeAmount % step !== 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ボス泡の特別チェック

**シグネチャ**:
```javascript
 if (bubbleType === 'boss')
```

**パラメーター**:
- `bubbleType === 'boss'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubbleType === 'boss');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (propertyType === 'health' && value <= 4)
```

**パラメーター**:
- `propertyType === 'health' && value <= 4`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(propertyType === 'health' && value <= 4);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (propertyType === 'score' && value <= 200)
```

**パラメーター**:
- `propertyType === 'score' && value <= 200`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(propertyType === 'score' && value <= 200);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bubbleType in hardBubbleOrder && propertyType === 'health')
```

**パラメーター**:
- `bubbleType in hardBubbleOrder && propertyType === 'health'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubbleType in hardBubbleOrder && propertyType === 'health');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value < expectedMin)
```

**パラメーター**:
- `value < expectedMin`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value < expectedMin);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### documentChange

**シグネチャ**:
```javascript
 documentChange(change, rationale)
```

**パラメーター**:
- `change`
- `rationale`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.documentChange(change, rationale);

// documentChangeの実用的な使用例
const result = instance.documentChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴が長くなりすぎないよう制限

**シグネチャ**:
```javascript
 if (this.changeHistory.length > 1000)
```

**パラメーター**:
- `this.changeHistory.length > 1000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.changeHistory.length > 1000);

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

#### generateImpactReport

**シグネチャ**:
```javascript
 generateImpactReport(changes)
```

**パラメーター**:
- `changes`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateImpactReport(changes);

// generateImpactReportの実用的な使用例
const result = instance.generateImpactReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (impactRule)
```

**パラメーター**:
- `impactRule`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(impactRule);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const system of impactRule.affectedSystems)
```

**パラメーター**:
- `const system of impactRule.affectedSystems`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const system of impactRule.affectedSystems);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (report.riskLevel === 'major')
```

**パラメーター**:
- `report.riskLevel === 'major'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(report.riskLevel === 'major');

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

#### if

**シグネチャ**:
```javascript
 if (impactRule.calculations)
```

**パラメーター**:
- `impactRule.calculations`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(impactRule.calculations);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof result === 'number')
```

**パラメーター**:
- `typeof result === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof result === 'number');

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

#### for

**シグネチャ**:
```javascript
 for (const impact of impacts)
```

**パラメーター**:
- `const impact of impacts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const impact of impacts);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (impact.magnitude > maxMagnitude)
```

**パラメーター**:
- `impact.magnitude > maxMagnitude`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(impact.magnitude > maxMagnitude);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (maxMagnitude >= thresholds.major)
```

**パラメーター**:
- `maxMagnitude >= thresholds.major`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(maxMagnitude >= thresholds.major);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (maxMagnitude >= thresholds.moderate)
```

**パラメーター**:
- `maxMagnitude >= thresholds.moderate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(maxMagnitude >= thresholds.moderate);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (maxMagnitude >= thresholds.minor)
```

**パラメーター**:
- `maxMagnitude >= thresholds.minor`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(maxMagnitude >= thresholds.minor);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getChangeHistory

**シグネチャ**:
```javascript
 getChangeHistory(filters = {})
```

**パラメーター**:
- `filters = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getChangeHistory(filters = {});

// getChangeHistoryの実用的な使用例
const result = instance.getChangeHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フィルター適用

**シグネチャ**:
```javascript
 if (filters.bubbleType)
```

**パラメーター**:
- `filters.bubbleType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(filters.bubbleType);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (filters.propertyType)
```

**パラメーター**:
- `filters.propertyType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(filters.propertyType);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (filters.dateFrom)
```

**パラメーター**:
- `filters.dateFrom`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(filters.dateFrom);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (filters.dateTo)
```

**パラメーター**:
- `filters.dateTo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(filters.dateTo);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAvailableGuidelines

**シグネチャ**:
```javascript
 getAvailableGuidelines()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAvailableGuidelines();

// getAvailableGuidelinesの実用的な使用例
const result = instance.getAvailableGuidelines(/* 適切なパラメータ */);
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


---

## getBalanceGuidelinesManager

**シグネチャ**:
```javascript
getBalanceGuidelinesManager()
```

**使用例**:
```javascript
const result = getBalanceGuidelinesManager();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `guideline` | 説明なし |
| `validationId` | 説明なし |
| `guideline` | 説明なし |
| `issues` | 説明なし |
| `recommendations` | 説明なし |
| `rangeCheck` | 説明なし |
| `stepCheck` | 説明なし |
| `consistencyCheck` | 説明なし |
| `impactAnalysis` | 説明なし |
| `issues` | 説明なし |
| `recommendations` | 説明なし |
| `issues` | 説明なし |
| `recommendations` | 説明なし |
| `changeAmount` | 説明なし |
| `changeRatio` | 説明なし |
| `step` | 説明なし |
| `issues` | 説明なし |
| `recommendations` | 説明なし |
| `hardBubbleOrder` | 説明なし |
| `expectedMin` | 説明なし |
| `changeRecord` | 説明なし |
| `report` | 説明なし |
| `impactRule` | 説明なし |
| `impact` | 説明なし |
| `impact` | 説明なし |
| `result` | 説明なし |
| `totalChanges` | 説明なし |
| `recentChanges` | 説明なし |
| `changesByType` | 説明なし |
| `type` | 説明なし |

---

