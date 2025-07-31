# BalanceChange

## 概要

ファイル: `models/BalanceChange.js`  
最終更新: 2025/7/27 22:06:29

## 目次

## クラス
- [BalanceChange](#balancechange)
## 定数
- [timestamp](#timestamp)
- [random](#random)
- [errors](#errors)
- [warnings](#warnings)
- [changeRatio](#changeratio)
- [changePercent](#changepercent)
- [validStatuses](#validstatuses)
- [tagsToAdd](#tagstoadd)
- [impact](#impact)
- [absPercentage](#abspercentage)
- [data](#data)
- [impact](#impact)
- [timestamp](#timestamp)
- [validation](#validation)
- [impact](#impact)
- [validation](#validation)

---

## BalanceChange

### コンストラクタ

```javascript
new BalanceChange(changeData = {})
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `errorHandler` | 説明なし |
| `id` | 必須フィールド |
| `timestamp` | 説明なし |
| `configType` | 説明なし |
| `bubbleType` | 説明なし |
| `propertyType` | 説明なし |
| `oldValue` | 変更値 |
| `newValue` | 説明なし |
| `changeType` | 説明なし |
| `author` | メタデータ |
| `rationale` | 説明なし |
| `impactAssessment` | 説明なし |
| `reviewStatus` | 説明なし |
| `tags` | 説明なし |
| `validationResults` | 検証・承認情報 |
| `reviewedBy` | 説明なし |
| `reviewedAt` | 説明なし |
| `reviewComments` | 説明なし |
| `canRollback` | ロールバック情報 |
| `rolledBack` | 説明なし |
| `rollbackTimestamp` | 説明なし |
| `rollbackReason` | 説明なし |
| `relatedChanges` | 関連する変更 |
| `parentChangeId` | 説明なし |
| `childChanges` | 説明なし |
| `applied` | 実行状況 |
| `appliedAt` | 説明なし |
| `appliedBy` | 説明なし |
| `severity` | 変更の影響度 |
| `riskLevel` | 説明なし |
| `affectedSystems` | 説明なし |
| `oldValue` | 説明なし |
| `newValue` | 説明なし |
| `oldValue` | 説明なし |
| `newValue` | 説明なし |
| `severity` | 説明なし |
| `changeType` | 説明なし |
| `applied` | 説明なし |
| `appliedAt` | 説明なし |
| `appliedBy` | 説明なし |
| `rolledBack` | 説明なし |
| `rollbackTimestamp` | 説明なし |
| `rollbackReason` | 説明なし |
| `applied` | 説明なし |
| `reviewStatus` | 説明なし |
| `reviewedBy` | 説明なし |
| `reviewedAt` | 説明なし |
| `reviewComments` | 説明なし |
| `oldValue` | 説明なし |
| `newValue` | 説明なし |
| `oldValue` | 説明なし |
| `newValue` | 説明なし |
| `reviewStatus` | 説明なし |

### メソッド

#### if

**シグネチャ**:
```javascript
 if (oldValue === undefined || oldValue === null)
```

**パラメーター**:
- `oldValue === undefined || oldValue === null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(oldValue === undefined || oldValue === null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue === undefined || newValue === null)
```

**パラメーター**:
- `newValue === undefined || newValue === null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue === undefined || newValue === null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof oldValue === 'number' && typeof newValue === 'number')
```

**パラメーター**:
- `typeof oldValue === 'number' && typeof newValue === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof oldValue === 'number' && typeof newValue === 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue > oldValue)
```

**パラメーター**:
- `newValue > oldValue`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue > oldValue);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue < oldValue)
```

**パラメーター**:
- `newValue < oldValue`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue < oldValue);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (oldValue !== newValue)
```

**パラメーター**:
- `oldValue !== newValue`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(oldValue !== newValue);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### validate

**シグネチャ**:
```javascript
 validate()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validate();

// validateの実用的な使用例
const result = instance.validate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

必須フィールドの検証

**シグネチャ**:
```javascript
 if (!this.configType)
```

**パラメーター**:
- `!this.configType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.configType);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.bubbleType)
```

**パラメーター**:
- `!this.bubbleType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.bubbleType);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.propertyType)
```

**パラメーター**:
- `!this.propertyType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.propertyType);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.oldValue === undefined && this.newValue === undefined)
```

**パラメーター**:
- `this.oldValue === undefined && this.newValue === undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.oldValue === undefined && this.newValue === undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

値の妥当性検証

**シグネチャ**:
```javascript
 if (typeof this.oldValue === 'number' && typeof this.newValue === 'number')
```

**パラメーター**:
- `typeof this.oldValue === 'number' && typeof this.newValue === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof this.oldValue === 'number' && typeof this.newValue === 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (changeRatio > 2.0)
```

**パラメーター**:
- `changeRatio > 2.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(changeRatio > 2.0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.newValue <= 0 && this.oldValue > 0)
```

**パラメーター**:
- `this.newValue <= 0 && this.oldValue > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.newValue <= 0 && this.oldValue > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

影響度と値変更の整合性

**シグネチャ**:
```javascript
 if (this.severity === 'low' && this.changeType === 'increase')
```

**パラメーター**:
- `this.severity === 'low' && this.changeType === 'increase'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.severity === 'low' && this.changeType === 'increase');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (changePercent > 50)
```

**パラメーター**:
- `changePercent > 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(changePercent > 50);

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

#### markAsApplied

**シグネチャ**:
```javascript
 markAsApplied(appliedBy = 'system')
```

**パラメーター**:
- `appliedBy = 'system'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.markAsApplied(appliedBy = 'system');

// markAsAppliedの実用的な使用例
const result = instance.markAsApplied(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.applied)
```

**パラメーター**:
- `this.applied`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.applied);

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

#### rollback

**シグネチャ**:
```javascript
 rollback(reason = '', rolledBackBy = 'system')
```

**パラメーター**:
- `reason = ''`
- `rolledBackBy = 'system'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.rollback(reason = '', rolledBackBy = 'system');

// rollbackの実用的な使用例
const result = instance.rollback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.canRollback)
```

**パラメーター**:
- `!this.canRollback`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.canRollback);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.rolledBack)
```

**パラメーター**:
- `this.rolledBack`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.rolledBack);

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

#### updateReviewStatus

**シグネチャ**:
```javascript
 updateReviewStatus(status, reviewer = '', comments = '')
```

**パラメーター**:
- `status`
- `reviewer = ''`
- `comments = ''`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateReviewStatus(status, reviewer = '', comments = '');

// updateReviewStatusの実用的な使用例
const result = instance.updateReviewStatus(/* 適切なパラメータ */);
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

#### addRelatedChange

**シグネチャ**:
```javascript
 addRelatedChange(relatedChangeId, relationshipType = 'related')
```

**パラメーター**:
- `relatedChangeId`
- `relationshipType = 'related'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addRelatedChange(relatedChangeId, relationshipType = 'related');

// addRelatedChangeの実用的な使用例
const result = instance.addRelatedChange(/* 適切なパラメータ */);
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

#### addTags

**シグネチャ**:
```javascript
 addTags(tags)
```

**パラメーター**:
- `tags`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addTags(tags);

// addTagsの実用的な使用例
const result = instance.addTags(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const tag of tagsToAdd)
```

**パラメーター**:
- `const tag of tagsToAdd`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const tag of tagsToAdd);

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

#### calculateImpact

**シグネチャ**:
```javascript
 calculateImpact()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateImpact();

// calculateImpactの実用的な使用例
const result = instance.calculateImpact(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof this.oldValue === 'number' && typeof this.newValue === 'number')
```

**パラメーター**:
- `typeof this.oldValue === 'number' && typeof this.newValue === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof this.oldValue === 'number' && typeof this.newValue === 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (impact.numerical > 0)
```

**パラメーター**:
- `impact.numerical > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(impact.numerical > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (impact.numerical < 0)
```

**パラメーター**:
- `impact.numerical < 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(impact.numerical < 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (absPercentage >= 100)
```

**パラメーター**:
- `absPercentage >= 100`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(absPercentage >= 100);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (absPercentage >= 50)
```

**パラメーター**:
- `absPercentage >= 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(absPercentage >= 50);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (absPercentage >= 20)
```

**パラメーター**:
- `absPercentage >= 20`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(absPercentage >= 20);

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

#### toJSON

**シグネチャ**:
```javascript
 toJSON()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toJSON();

// toJSONの実用的な使用例
const result = instance.toJSON(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### fromJSON

**シグネチャ**:
```javascript
static fromJSON(jsonString)
```

**パラメーター**:
- `jsonString`

**使用例**:
```javascript
// 基本的な使用方法
const result = BalanceChange.fromJSON(jsonString);

// fromJSONの実用的な使用例
const result = BalanceChange.fromJSON(/* 適切なパラメータ */);
console.log('Result:', result);
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

#### getSummary

**シグネチャ**:
```javascript
 getSummary()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getSummary();

// getSummaryの実用的な使用例
const result = instance.getSummary(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof this.oldValue === 'number' && typeof this.newValue === 'number')
```

**パラメーター**:
- `typeof this.oldValue === 'number' && typeof this.newValue === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof this.oldValue === 'number' && typeof this.newValue === 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.author && this.author !== 'system')
```

**パラメーター**:
- `this.author && this.author !== 'system'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.author && this.author !== 'system');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.rationale)
```

**パラメーター**:
- `this.rationale`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.rationale);

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

#### isValid

**シグネチャ**:
```javascript
 isValid()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isValid();

// isValidの実用的な使用例
const result = instance.isValid(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### canApply

**シグネチャ**:
```javascript
 canApply()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.canApply();

// canApplyの実用的な使用例
const result = instance.canApply(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### debug

**シグネチャ**:
```javascript
 debug()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.debug();

// debugの実用的な使用例
const result = instance.debug(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (validation.errors.length > 0)
```

**パラメーター**:
- `validation.errors.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(validation.errors.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (validation.warnings.length > 0)
```

**パラメーター**:
- `validation.warnings.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(validation.warnings.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `timestamp` | 説明なし |
| `random` | 説明なし |
| `errors` | 説明なし |
| `warnings` | 説明なし |
| `changeRatio` | 説明なし |
| `changePercent` | 説明なし |
| `validStatuses` | 説明なし |
| `tagsToAdd` | 説明なし |
| `impact` | 説明なし |
| `absPercentage` | 説明なし |
| `data` | 説明なし |
| `impact` | 説明なし |
| `timestamp` | 説明なし |
| `validation` | 説明なし |
| `impact` | 説明なし |
| `validation` | 説明なし |

---

