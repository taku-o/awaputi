# BalanceAdjustmentValidationRules

## 概要

ファイル: `utils/BalanceAdjustmentValidationRules.js`  
最終更新: 2025/7/27 22:06:29

## 目次

## クラス
- [BalanceAdjustmentValidationRules](#balanceadjustmentvalidationrules)
## 関数
- [getBalanceAdjustmentValidationRules()](#getbalanceadjustmentvalidationrules)
## 定数
- [bubbleType](#bubbletype)
- [limits](#limits)
- [changeRatio](#changeratio)
- [threshold](#threshold)
- [normalHealth](#normalhealth)
- [healthRatio](#healthratio)
- [bubbleType](#bubbletype)
- [limits](#limits)
- [limits](#limits)
- [normalScore](#normalscore)
- [scoreRatio](#scoreratio)
- [expectedRatios](#expectedratios)
- [expectedRatio](#expectedratio)
- [canvasSize](#canvassize)
- [maxAllowedSize](#maxallowedsize)
- [minSize](#minsize)
- [canvasSize](#canvassize)
- [maxSize](#maxsize)
- [minSize](#minsize)
- [sizeHierarchy](#sizehierarchy)
- [currentIndex](#currentindex)
- [smallerType](#smallertype)
- [smallerSize](#smallersize)
- [largerType](#largertype)
- [largerSize](#largersize)
- [maxTime](#maxtime)
- [minTime](#mintime)
- [maxTime](#maxtime)
- [minTime](#mintime)
- [stageTime](#stagetime)
- [lifetimeRatio](#lifetimeratio)
- [minDuration](#minduration)
- [maxDuration](#maxduration)
- [score](#score)
- [healthScoreRatio](#healthscoreratio)
- [ruleDefinition](#ruledefinition)
- [deleted](#deleted)
- [results](#results)
- [applicableRules](#applicablerules)
- [ruleResult](#ruleresult)
- [issue](#issue)
- [fixedValue](#fixedvalue)
- [applicableRules](#applicablerules)
- [limits](#limits)
- [limits](#limits)
- [strictTypes](#stricttypes)
- [baseThreshold](#basethreshold)
- [propertyModifiers](#propertymodifiers)
- [modifier](#modifier)
- [stats](#stats)
- [rule](#rule)

---

## BalanceAdjustmentValidationRules

### コンストラクタ

```javascript
new BalanceAdjustmentValidationRules()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `errorHandler` | 説明なし |
| `ruleCategories` | ルールカテゴリ |
| `rules` | 検証ルール定義 |

### メソッド

#### if

**シグネチャ**:
```javascript
 if (typeof newValue !== 'number')
```

**パラメーター**:
- `typeof newValue !== 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof newValue !== 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue <= 0)
```

**パラメーター**:
- `newValue <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue < limits.min || newValue > limits.max)
```

**パラメーター**:
- `newValue < limits.min || newValue > limits.max`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue < limits.min || newValue > limits.max);

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

**シグネチャ**:
```javascript
 if (changeRatio > threshold)
```

**パラメーター**:
- `changeRatio > threshold`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(changeRatio > threshold);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (context.bubbleType !== 'boss')
```

**パラメーター**:
- `context.bubbleType !== 'boss'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(context.bubbleType !== 'boss');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof newValue !== 'number')
```

**パラメーター**:
- `typeof newValue !== 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof newValue !== 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (healthRatio < 3)
```

**パラメーター**:
- `healthRatio < 3`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(healthRatio < 3);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (healthRatio > 20)
```

**パラメーター**:
- `healthRatio > 20`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(healthRatio > 20);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof newValue !== 'number')
```

**パラメーター**:
- `typeof newValue !== 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof newValue !== 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue < 0)
```

**パラメーター**:
- `newValue < 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue < 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue > limits.max)
```

**パラメーター**:
- `newValue > limits.max`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue > limits.max);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof newValue !== 'number' || !context.relatedValues)
```

**パラメーター**:
- `typeof newValue !== 'number' || !context.relatedValues`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof newValue !== 'number' || !context.relatedValues);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof newValue !== 'number')
```

**パラメーター**:
- `typeof newValue !== 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof newValue !== 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue <= 0)
```

**パラメーター**:
- `newValue <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue > maxAllowedSize)
```

**パラメーター**:
- `newValue > maxAllowedSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue > maxAllowedSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue < minSize)
```

**パラメーター**:
- `newValue < minSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue < minSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof newValue !== 'number' || !context.relatedValues)
```

**パラメーター**:
- `typeof newValue !== 'number' || !context.relatedValues`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof newValue !== 'number' || !context.relatedValues);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

前後のバブルタイプとのサイズ比較

**シグネチャ**:
```javascript
 for (let i = 0; i < currentIndex; i++)
```

**パラメーター**:
- `let i = 0; i < currentIndex; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < currentIndex; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (smallerSize && newValue <= smallerSize)
```

**パラメーター**:
- `smallerSize && newValue <= smallerSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(smallerSize && newValue <= smallerSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = currentIndex + 1; i < sizeHierarchy.length; i++)
```

**パラメーター**:
- `let i = currentIndex + 1; i < sizeHierarchy.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = currentIndex + 1; i < sizeHierarchy.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (largerSize && newValue >= largerSize)
```

**パラメーター**:
- `largerSize && newValue >= largerSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(largerSize && newValue >= largerSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof newValue !== 'number')
```

**パラメーター**:
- `typeof newValue !== 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof newValue !== 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue <= 0)
```

**パラメーター**:
- `newValue <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue > maxTime)
```

**パラメーター**:
- `newValue > maxTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue > maxTime);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue < minTime)
```

**パラメーター**:
- `newValue < minTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue < minTime);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (context.propertyType !== 'maxAge')
```

**パラメーター**:
- `context.propertyType !== 'maxAge'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(context.propertyType !== 'maxAge');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof newValue !== 'number')
```

**パラメーター**:
- `typeof newValue !== 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof newValue !== 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (lifetimeRatio > 0.8)
```

**パラメーター**:
- `lifetimeRatio > 0.8`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(lifetimeRatio > 0.8);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (lifetimeRatio < 0.01)
```

**パラメーター**:
- `lifetimeRatio < 0.01`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(lifetimeRatio < 0.01);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (context.bubbleType !== 'electric' || context.propertyType !== 'intensity')
```

**パラメーター**:
- `context.bubbleType !== 'electric' || context.propertyType !== 'intensity'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(context.bubbleType !== 'electric' || context.propertyType !== 'intensity');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof newValue !== 'number')
```

**パラメーター**:
- `typeof newValue !== 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof newValue !== 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue < 1 || newValue > 50)
```

**パラメーター**:
- `newValue < 1 || newValue > 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue < 1 || newValue > 50);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

高強度の警告

**シグネチャ**:
```javascript
 if (newValue > 30)
```

**パラメーター**:
- `newValue > 30`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue > 30);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (context.bubbleType !== 'rainbow' || context.propertyType !== 'duration')
```

**パラメーター**:
- `context.bubbleType !== 'rainbow' || context.propertyType !== 'duration'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(context.bubbleType !== 'rainbow' || context.propertyType !== 'duration');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof newValue !== 'number')
```

**パラメーター**:
- `typeof newValue !== 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof newValue !== 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue < minDuration)
```

**パラメーター**:
- `newValue < minDuration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue < minDuration);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newValue > maxDuration)
```

**パラメーター**:
- `newValue > maxDuration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newValue > maxDuration);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パーティクル数の制限

**シグネチャ**:
```javascript
 if (context.propertyType === 'particleCount')
```

**パラメーター**:
- `context.propertyType === 'particleCount'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(context.propertyType === 'particleCount');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof newValue === 'number' && newValue > 100)
```

**パラメーター**:
- `typeof newValue === 'number' && newValue > 100`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof newValue === 'number' && newValue > 100);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

アニメーション頻度の制限

**シグネチャ**:
```javascript
 if (context.propertyType === 'animationFrequency')
```

**パラメーター**:
- `context.propertyType === 'animationFrequency'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(context.propertyType === 'animationFrequency');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof newValue === 'number' && newValue > 60)
```

**パラメーター**:
- `typeof newValue === 'number' && newValue > 60`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof newValue === 'number' && newValue > 60);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (context.propertyType === 'particleCount')
```

**パラメーター**:
- `context.propertyType === 'particleCount'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(context.propertyType === 'particleCount');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (context.propertyType === 'animationFrequency')
```

**パラメーター**:
- `context.propertyType === 'animationFrequency'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(context.propertyType === 'animationFrequency');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

体力とスコアの関係性チェック

**シグネチャ**:
```javascript
 if (context.propertyType === 'health')
```

**パラメーター**:
- `context.propertyType === 'health'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(context.propertyType === 'health');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (healthScoreRatio < 0.5)
```

**パラメーター**:
- `healthScoreRatio < 0.5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(healthScoreRatio < 0.5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (healthScoreRatio > 10)
```

**パラメーター**:
- `healthScoreRatio > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(healthScoreRatio > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addRule

**シグネチャ**:
```javascript
 addRule(name, rule)
```

**パラメーター**:
- `name`
- `rule`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addRule(name, rule);

// addRuleの実用的な使用例
const result = instance.addRule(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!name || typeof name !== 'string')
```

**パラメーター**:
- `!name || typeof name !== 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!name || typeof name !== 'string');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!rule || typeof rule.check !== 'function')
```

**パラメーター**:
- `!rule || typeof rule.check !== 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!rule || typeof rule.check !== 'function');

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

#### removeRule

**シグネチャ**:
```javascript
 removeRule(name)
```

**パラメーター**:
- `name`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeRule(name);

// removeRuleの実用的な使用例
const result = instance.removeRule(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (deleted)
```

**パラメーター**:
- `deleted`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(deleted);

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

#### validate

**シグネチャ**:
```javascript
 validate(oldValue, newValue, context = {})
```

**パラメーター**:
- `oldValue`
- `newValue`
- `context = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validate(oldValue, newValue, context = {});

// validateの実用的な使用例
const result = instance.validate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const rule of applicableRules)
```

**パラメーター**:
- `const rule of applicableRules`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const rule of applicableRules);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!ruleResult.valid)
```

**パラメーター**:
- `!ruleResult.valid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!ruleResult.valid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (issue.severity === 'warning')
```

**パラメーター**:
- `issue.severity === 'warning'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(issue.severity === 'warning');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (ruleResult.suggestion)
```

**パラメーター**:
- `ruleResult.suggestion`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ruleResult.suggestion);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

自動修正が可能な場合

**シグネチャ**:
```javascript
 if (rule.autoFix && rule.autoFixFn && issue.severity !== 'high')
```

**パラメーター**:
- `rule.autoFix && rule.autoFixFn && issue.severity !== 'high'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule.autoFix && rule.autoFixFn && issue.severity !== 'high');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (fixedValue !== newValue)
```

**パラメーター**:
- `fixedValue !== newValue`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fixedValue !== newValue);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (fixError)
```

**パラメーター**:
- `fixError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(fixError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (ruleError)
```

**パラメーター**:
- `ruleError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(ruleError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
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

#### getRuleStatistics

**シグネチャ**:
```javascript
 getRuleStatistics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRuleStatistics();

// getRuleStatisticsの実用的な使用例
const result = instance.getRuleStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rule.enabled)
```

**パラメーター**:
- `rule.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rule.autoFix)
```

**パラメーター**:
- `rule.autoFix`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule.autoFix);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setRuleEnabled

**シグネチャ**:
```javascript
 setRuleEnabled(ruleName, enabled)
```

**パラメーター**:
- `ruleName`
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setRuleEnabled(ruleName, enabled);

// setRuleEnabledの実用的な使用例
const result = instance.setRuleEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!rule)
```

**パラメーター**:
- `!rule`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!rule);

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

#### setCategoryEnabled

**シグネチャ**:
```javascript
 setCategoryEnabled(category, enabled)
```

**パラメーター**:
- `category`
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setCategoryEnabled(category, enabled);

// setCategoryEnabledの実用的な使用例
const result = instance.setCategoryEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rule.category === category)
```

**パラメーター**:
- `rule.category === category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule.category === category);

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

#### getRules

**シグネチャ**:
```javascript
 getRules(filters = {})
```

**パラメーター**:
- `filters = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRules(filters = {});

// getRulesの実用的な使用例
const result = instance.getRules(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (filters.category)
```

**パラメーター**:
- `filters.category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(filters.category);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (filters.severity)
```

**パラメーター**:
- `filters.severity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(filters.severity);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (filters.enabled !== undefined)
```

**パラメーター**:
- `filters.enabled !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(filters.enabled !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (filters.autoFix !== undefined)
```

**パラメーター**:
- `filters.autoFix !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(filters.autoFix !== undefined);

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


---

## getBalanceAdjustmentValidationRules

**シグネチャ**:
```javascript
getBalanceAdjustmentValidationRules()
```

**使用例**:
```javascript
const result = getBalanceAdjustmentValidationRules();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `bubbleType` | 説明なし |
| `limits` | 説明なし |
| `changeRatio` | 説明なし |
| `threshold` | 説明なし |
| `normalHealth` | 説明なし |
| `healthRatio` | 説明なし |
| `bubbleType` | 説明なし |
| `limits` | 説明なし |
| `limits` | 説明なし |
| `normalScore` | 説明なし |
| `scoreRatio` | 説明なし |
| `expectedRatios` | 説明なし |
| `expectedRatio` | 説明なし |
| `canvasSize` | 説明なし |
| `maxAllowedSize` | 説明なし |
| `minSize` | 説明なし |
| `canvasSize` | 説明なし |
| `maxSize` | 説明なし |
| `minSize` | 説明なし |
| `sizeHierarchy` | 説明なし |
| `currentIndex` | 説明なし |
| `smallerType` | 説明なし |
| `smallerSize` | 説明なし |
| `largerType` | 説明なし |
| `largerSize` | 説明なし |
| `maxTime` | 説明なし |
| `minTime` | 説明なし |
| `maxTime` | 説明なし |
| `minTime` | 説明なし |
| `stageTime` | 説明なし |
| `lifetimeRatio` | 説明なし |
| `minDuration` | 説明なし |
| `maxDuration` | 説明なし |
| `score` | 説明なし |
| `healthScoreRatio` | 説明なし |
| `ruleDefinition` | 説明なし |
| `deleted` | 説明なし |
| `results` | 説明なし |
| `applicableRules` | 説明なし |
| `ruleResult` | 説明なし |
| `issue` | 説明なし |
| `fixedValue` | 説明なし |
| `applicableRules` | 説明なし |
| `limits` | 説明なし |
| `limits` | 説明なし |
| `strictTypes` | 説明なし |
| `baseThreshold` | 説明なし |
| `propertyModifiers` | 説明なし |
| `modifier` | 説明なし |
| `stats` | 説明なし |
| `rule` | 説明なし |

---

