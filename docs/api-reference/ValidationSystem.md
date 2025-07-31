# ValidationSystem

## 概要

ファイル: `core/ValidationSystem.js`  
最終更新: 2025/7/26 20:49:00

## 目次

## クラス
- [ValidationSystem](#validationsystem)
## 関数
- [getValidationSystem()](#getvalidationsystem)
## 定数
- [ruleKey](#rulekey)
- [defaultKey](#defaultkey)
- [ruleKey](#rulekey)
- [rule](#rule)
- [defaultValue](#defaultvalue)
- [message](#message)
- [message](#message)
- [message](#message)
- [message](#message)
- [message](#message)
- [message](#message)
- [message](#message)
- [message](#message)
- [message](#message)
- [validatorResult](#validatorresult)
- [message](#message)
- [message](#message)
- [result](#result)
- [defaultKey](#defaultkey)
- [rule](#rule)

---

## ValidationSystem

### コンストラクタ

```javascript
new ValidationSystem()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `rules` | 検証ルール |
| `defaultValues` | デフォルト値 |
| `validationErrors` | エラー履歴 |
| `maxErrorHistorySize` | 最大エラー履歴サイズ |
| `validationErrors` | 説明なし |

### メソッド

#### setRule

**シグネチャ**:
```javascript
 setRule(category, key, rule)
```

**パラメーター**:
- `category`
- `key`
- `rule`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setRule(category, key, rule);

// setRuleの実用的な使用例
const result = instance.setRule(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setRules

**シグネチャ**:
```javascript
 setRules(category, rulesObject)
```

**パラメーター**:
- `category`
- `rulesObject`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setRules(category, rulesObject);

// setRulesの実用的な使用例
const result = instance.setRules(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setDefaultValue

**シグネチャ**:
```javascript
 setDefaultValue(category, key, defaultValue)
```

**パラメーター**:
- `category`
- `key`
- `defaultValue`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setDefaultValue(category, key, defaultValue);

// setDefaultValueの実用的な使用例
const result = instance.setDefaultValue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setDefaultValues

**シグネチャ**:
```javascript
 setDefaultValues(category, defaultsObject)
```

**パラメーター**:
- `category`
- `defaultsObject`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setDefaultValues(category, defaultsObject);

// setDefaultValuesの実用的な使用例
const result = instance.setDefaultValues(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### validate

**シグネチャ**:
```javascript
 validate(category, key, value)
```

**パラメーター**:
- `category`
- `key`
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validate(category, key, value);

// validateの実用的な使用例
const result = instance.validate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ルールが存在しない場合は検証成功とする

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

#### if

型チェック

**シグネチャ**:
```javascript
 if (rule.type && typeof value !== rule.type)
```

**パラメーター**:
- `rule.type && typeof value !== rule.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule.type && typeof value !== rule.type);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

数値の範囲チェック

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
 if (rule.min !== undefined && value < rule.min)
```

**パラメーター**:
- `rule.min !== undefined && value < rule.min`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule.min !== undefined && value < rule.min);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rule.max !== undefined && value > rule.max)
```

**パラメーター**:
- `rule.max !== undefined && value > rule.max`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule.max !== undefined && value > rule.max);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

文字列の長さチェック

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

#### if

**シグネチャ**:
```javascript
 if (rule.minLength !== undefined && value.length < rule.minLength)
```

**パラメーター**:
- `rule.minLength !== undefined && value.length < rule.minLength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule.minLength !== undefined && value.length < rule.minLength);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rule.maxLength !== undefined && value.length > rule.maxLength)
```

**パラメーター**:
- `rule.maxLength !== undefined && value.length > rule.maxLength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule.maxLength !== undefined && value.length > rule.maxLength);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rule.minLength !== undefined && value.length < rule.minLength)
```

**パラメーター**:
- `rule.minLength !== undefined && value.length < rule.minLength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule.minLength !== undefined && value.length < rule.minLength);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rule.maxLength !== undefined && value.length > rule.maxLength)
```

**パラメーター**:
- `rule.maxLength !== undefined && value.length > rule.maxLength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule.maxLength !== undefined && value.length > rule.maxLength);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

カスタム検証関数

**シグネチャ**:
```javascript
 if (rule.validator && typeof rule.validator === 'function')
```

**パラメーター**:
- `rule.validator && typeof rule.validator === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule.validator && typeof rule.validator === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (validatorResult !== true)
```

**パラメーター**:
- `validatorResult !== true`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(validatorResult !== true);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (validatorError)
```

**パラメーター**:
- `validatorError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(validatorError);

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

#### validateAndAdjust

**シグネチャ**:
```javascript
 validateAndAdjust(category, key, value)
```

**パラメーター**:
- `category`
- `key`
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateAndAdjust(category, key, value);

// validateAndAdjustの実用的な使用例
const result = instance.validateAndAdjust(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!result.isValid && result.message)
```

**パラメーター**:
- `!result.isValid && result.message`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!result.isValid && result.message);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getValidationErrors

**シグネチャ**:
```javascript
 getValidationErrors()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getValidationErrors();

// getValidationErrorsの実用的な使用例
const result = instance.getValidationErrors(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearValidationErrors

**シグネチャ**:
```javascript
 clearValidationErrors()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearValidationErrors();

// clearValidationErrorsの実用的な使用例
const result = instance.clearValidationErrors(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rule && rule.type)
```

**パラメーター**:
- `rule && rule.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule && rule.type);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (rule.type)
```

**パラメーター**:
- `rule.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(rule.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴が長くなりすぎないよう制限

**シグネチャ**:
```javascript
 if (this.validationErrors.length > this.maxErrorHistorySize)
```

**パラメーター**:
- `this.validationErrors.length > this.maxErrorHistorySize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.validationErrors.length > this.maxErrorHistorySize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getValidationSystem

**シグネチャ**:
```javascript
getValidationSystem()
```

**使用例**:
```javascript
const result = getValidationSystem();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `ruleKey` | 説明なし |
| `defaultKey` | 説明なし |
| `ruleKey` | 説明なし |
| `rule` | 説明なし |
| `defaultValue` | 説明なし |
| `message` | 説明なし |
| `message` | 説明なし |
| `message` | 説明なし |
| `message` | 説明なし |
| `message` | 説明なし |
| `message` | 説明なし |
| `message` | 説明なし |
| `message` | 説明なし |
| `message` | 説明なし |
| `validatorResult` | 説明なし |
| `message` | 説明なし |
| `message` | 説明なし |
| `result` | 説明なし |
| `defaultKey` | 説明なし |
| `rule` | 説明なし |

---

