# BalanceConfigurationValidator

## 概要

ファイル: `utils/BalanceConfigurationValidator.js`  
最終更新: 2025/7/27 22:06:29

## 目次

## クラス
- [BalanceConfigurationValidator](#balanceconfigurationvalidator)
## 関数
- [getBalanceConfigurationValidator()](#getbalanceconfigurationvalidator)
## 定数
- [validationId](#validationid)
- [startTime](#starttime)
- [errors](#errors)
- [warnings](#warnings)
- [healthValidation](#healthvalidation)
- [sizeValidation](#sizevalidation)
- [maxAgeValidation](#maxagevalidation)
- [scoreValidation](#scorevalidation)
- [specialEffectErrors](#specialeffecterrors)
- [logicalValidation](#logicalvalidation)
- [result](#result)
- [validationId](#validationid)
- [startTime](#starttime)
- [errors](#errors)
- [warnings](#warnings)
- [validation](#validation)
- [validation](#validation)
- [validation](#validation)
- [logicalValidation](#logicalvalidation)
- [result](#result)
- [validationId](#validationid)
- [startTime](#starttime)
- [errors](#errors)
- [warnings](#warnings)
- [validation](#validation)
- [validation](#validation)
- [validation](#validation)
- [result](#result)
- [validationId](#validationid)
- [startTime](#starttime)
- [errors](#errors)
- [warnings](#warnings)
- [validation](#validation)
- [validation](#validation)
- [validation](#validation)
- [result](#result)
- [rule](#rule)
- [errors](#errors)
- [validation](#validation)
- [validation](#validation)
- [validation](#validation)
- [validation](#validation)
- [validation](#validation)
- [errors](#errors)
- [warnings](#warnings)
- [hardBubbleHealthOrder](#hardbubblehealthorder)
- [expectedMinHealth](#expectedminhealth)
- [errors](#errors)
- [warnings](#warnings)
- [scores](#scores)
- [maxRegularScore](#maxregularscore)
- [currentCount](#currentcount)
- [errorType](#errortype)
- [currentCount](#currentcount)
- [successRate](#successrate)

---

## BalanceConfigurationValidator

### コンストラクタ

```javascript
new BalanceConfigurationValidator()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `errorHandler` | 説明なし |
| `validationRules` | 検証ルール定義 |
| `validationHistory` | 検証履歴 |
| `errorStats` | エラー統計 |

### メソッド

#### validateBubbleConfig

**シグネチャ**:
```javascript
 validateBubbleConfig(bubbleType, config)
```

**パラメーター**:
- `bubbleType`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateBubbleConfig(bubbleType, config);

// validateBubbleConfigの実用的な使用例
const result = instance.validateBubbleConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

基本プロパティの検証

**シグネチャ**:
```javascript
 if (config.health !== undefined)
```

**パラメーター**:
- `config.health !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.health !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!healthValidation.isValid)
```

**パラメーター**:
- `!healthValidation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!healthValidation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.size !== undefined)
```

**パラメーター**:
- `config.size !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.size !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!sizeValidation.isValid)
```

**パラメーター**:
- `!sizeValidation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!sizeValidation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.maxAge !== undefined)
```

**パラメーター**:
- `config.maxAge !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.maxAge !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!maxAgeValidation.isValid)
```

**パラメーター**:
- `!maxAgeValidation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!maxAgeValidation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.score !== undefined)
```

**パラメーター**:
- `config.score !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.score !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!scoreValidation.isValid)
```

**パラメーター**:
- `!scoreValidation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!scoreValidation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

統計を更新

**シグネチャ**:
```javascript
 if (!result.isValid)
```

**パラメーター**:
- `!result.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!result.isValid);

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

#### validateScoreConfig

**シグネチャ**:
```javascript
 validateScoreConfig(scoreConfig)
```

**パラメーター**:
- `scoreConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateScoreConfig(scoreConfig);

// validateScoreConfigの実用的な使用例
const result = instance.validateScoreConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

基本スコアの検証

**シグネチャ**:
```javascript
 if (scoreConfig.baseScores)
```

**パラメーター**:
- `scoreConfig.baseScores`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scoreConfig.baseScores);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コンボ設定の検証

**シグネチャ**:
```javascript
 if (scoreConfig.combo)
```

**パラメーター**:
- `scoreConfig.combo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scoreConfig.combo);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (scoreConfig.combo.maxMultiplier !== undefined)
```

**パラメーター**:
- `scoreConfig.combo.maxMultiplier !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scoreConfig.combo.maxMultiplier !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

年齢ボーナスの検証

**シグネチャ**:
```javascript
 if (scoreConfig.ageBonus)
```

**パラメーター**:
- `scoreConfig.ageBonus`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scoreConfig.ageBonus);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!result.isValid)
```

**パラメーター**:
- `!result.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!result.isValid);

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

#### validateStageConfig

**シグネチャ**:
```javascript
 validateStageConfig(stageConfig)
```

**パラメーター**:
- `stageConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateStageConfig(stageConfig);

// validateStageConfigの実用的な使用例
const result = instance.validateStageConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スポーン率の検証

**シグネチャ**:
```javascript
 if (stageConfig.spawnRate !== undefined)
```

**パラメーター**:
- `stageConfig.spawnRate !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stageConfig.spawnRate !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最大泡数の検証

**シグネチャ**:
```javascript
 if (stageConfig.maxBubbles !== undefined)
```

**パラメーター**:
- `stageConfig.maxBubbles !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stageConfig.maxBubbles !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

開放条件の検証

**シグネチャ**:
```javascript
 if (stageConfig.unlockRequirement !== undefined)
```

**パラメーター**:
- `stageConfig.unlockRequirement !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stageConfig.unlockRequirement !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!result.isValid)
```

**パラメーター**:
- `!result.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!result.isValid);

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

#### validateItemConfig

**シグネチャ**:
```javascript
 validateItemConfig(itemConfig)
```

**パラメーター**:
- `itemConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateItemConfig(itemConfig);

// validateItemConfigの実用的な使用例
const result = instance.validateItemConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

基本コストの検証

**シグネチャ**:
```javascript
 if (itemConfig.baseCost !== undefined)
```

**パラメーター**:
- `itemConfig.baseCost !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(itemConfig.baseCost !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コスト倍率の検証

**シグネチャ**:
```javascript
 if (itemConfig.costMultiplier !== undefined)
```

**パラメーター**:
- `itemConfig.costMultiplier !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(itemConfig.costMultiplier !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最大レベルの検証

**シグネチャ**:
```javascript
 if (itemConfig.maxLevel !== undefined)
```

**パラメーター**:
- `itemConfig.maxLevel !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(itemConfig.maxLevel !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!result.isValid)
```

**パラメーター**:
- `!result.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!result.isValid);

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

数値範囲チェック

**シグネチャ**:
```javascript
 if (rule.type === 'number')
```

**パラメーター**:
- `rule.type === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule.type === 'number');

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

#### switch

**シグネチャ**:
```javascript
 switch (bubbleType)
```

**パラメーター**:
- `bubbleType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(bubbleType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.healAmount !== undefined)
```

**パラメーター**:
- `config.healAmount !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.healAmount !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.damageAmount !== undefined)
```

**パラメーター**:
- `config.damageAmount !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.damageAmount !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.shakeIntensity !== undefined)
```

**パラメーター**:
- `config.shakeIntensity !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.shakeIntensity !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.disableDuration !== undefined)
```

**パラメーター**:
- `config.disableDuration !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.disableDuration !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.bonusTimeMs !== undefined)
```

**パラメーター**:
- `config.bonusTimeMs !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.bonusTimeMs !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ボス泡は通常の泡より強くあるべき

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
 if (config.health !== undefined && config.health <= 1)
```

**パラメーター**:
- `config.health !== undefined && config.health <= 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.health !== undefined && config.health <= 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.score !== undefined && config.score <= 15)
```

**パラメーター**:
- `config.score !== undefined && config.score <= 15`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.score !== undefined && config.score <= 15);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bubbleType in hardBubbleHealthOrder)
```

**パラメーター**:
- `bubbleType in hardBubbleHealthOrder`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubbleType in hardBubbleHealthOrder);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.health !== undefined && config.health < expectedMinHealth)
```

**パラメーター**:
- `config.health !== undefined && config.health < expectedMinHealth`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.health !== undefined && config.health < expectedMinHealth);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

特殊効果泡の効果値が適切な範囲内か

**シグネチャ**:
```javascript
 if (bubbleType === 'pink' && config.healAmount !== undefined)
```

**パラメーター**:
- `bubbleType === 'pink' && config.healAmount !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubbleType === 'pink' && config.healAmount !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.healAmount > 50)
```

**パラメーター**:
- `config.healAmount > 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.healAmount > 50);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bubbleType === 'poison' && config.damageAmount !== undefined)
```

**パラメーター**:
- `bubbleType === 'poison' && config.damageAmount !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubbleType === 'poison' && config.damageAmount !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.damageAmount > 25)
```

**パラメーター**:
- `config.damageAmount > 25`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.damageAmount > 25);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

基本スコアの順序性チェック

**シグネチャ**:
```javascript
 if (scoreConfig.baseScores)
```

**パラメーター**:
- `scoreConfig.baseScores`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scoreConfig.baseScores);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

硬い泡は通常の泡よりスコアが高いべき

**シグネチャ**:
```javascript
 if (scores.normal && scores.stone && scores.stone <= scores.normal)
```

**パラメーター**:
- `scores.normal && scores.stone && scores.stone <= scores.normal`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scores.normal && scores.stone && scores.stone <= scores.normal);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (scores.stone && scores.iron && scores.iron <= scores.stone)
```

**パラメーター**:
- `scores.stone && scores.iron && scores.iron <= scores.stone`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scores.stone && scores.iron && scores.iron <= scores.stone);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (scores.iron && scores.diamond && scores.diamond <= scores.iron)
```

**パラメーター**:
- `scores.iron && scores.diamond && scores.diamond <= scores.iron`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scores.iron && scores.diamond && scores.diamond <= scores.iron);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ボス泡は最高スコアであるべき

**シグネチャ**:
```javascript
 if (scores.boss)
```

**パラメーター**:
- `scores.boss`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scores.boss);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (scores.boss <= maxRegularScore * 5)
```

**パラメーター**:
- `scores.boss <= maxRegularScore * 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scores.boss <= maxRegularScore * 5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

エラータイプ別統計

**シグネチャ**:
```javascript
 for (const error of errors)
```

**パラメーター**:
- `const error of errors`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const error of errors);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.validationHistory.length > 1000)
```

**パラメーター**:
- `this.validationHistory.length > 1000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.validationHistory.length > 1000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getValidationStats

**シグネチャ**:
```javascript
 getValidationStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getValidationStats();

// getValidationStatsの実用的な使用例
const result = instance.getValidationStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getValidationHistory

**シグネチャ**:
```javascript
 getValidationHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getValidationHistory();

// getValidationHistoryの実用的な使用例
const result = instance.getValidationHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addValidationRule

**シグネチャ**:
```javascript
 addValidationRule(ruleKey, rule)
```

**パラメーター**:
- `ruleKey`
- `rule`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addValidationRule(ruleKey, rule);

// addValidationRuleの実用的な使用例
const result = instance.addValidationRule(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getValidationRule

**シグネチャ**:
```javascript
 getValidationRule(ruleKey)
```

**パラメーター**:
- `ruleKey`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getValidationRule(ruleKey);

// getValidationRuleの実用的な使用例
const result = instance.getValidationRule(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAllValidationRules

**シグネチャ**:
```javascript
 getAllValidationRules()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAllValidationRules();

// getAllValidationRulesの実用的な使用例
const result = instance.getAllValidationRules(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getBalanceConfigurationValidator

**シグネチャ**:
```javascript
getBalanceConfigurationValidator()
```

**使用例**:
```javascript
const result = getBalanceConfigurationValidator();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `validationId` | 説明なし |
| `startTime` | 説明なし |
| `errors` | 説明なし |
| `warnings` | 説明なし |
| `healthValidation` | 説明なし |
| `sizeValidation` | 説明なし |
| `maxAgeValidation` | 説明なし |
| `scoreValidation` | 説明なし |
| `specialEffectErrors` | 説明なし |
| `logicalValidation` | 説明なし |
| `result` | 説明なし |
| `validationId` | 説明なし |
| `startTime` | 説明なし |
| `errors` | 説明なし |
| `warnings` | 説明なし |
| `validation` | 説明なし |
| `validation` | 説明なし |
| `validation` | 説明なし |
| `logicalValidation` | 説明なし |
| `result` | 説明なし |
| `validationId` | 説明なし |
| `startTime` | 説明なし |
| `errors` | 説明なし |
| `warnings` | 説明なし |
| `validation` | 説明なし |
| `validation` | 説明なし |
| `validation` | 説明なし |
| `result` | 説明なし |
| `validationId` | 説明なし |
| `startTime` | 説明なし |
| `errors` | 説明なし |
| `warnings` | 説明なし |
| `validation` | 説明なし |
| `validation` | 説明なし |
| `validation` | 説明なし |
| `result` | 説明なし |
| `rule` | 説明なし |
| `errors` | 説明なし |
| `validation` | 説明なし |
| `validation` | 説明なし |
| `validation` | 説明なし |
| `validation` | 説明なし |
| `validation` | 説明なし |
| `errors` | 説明なし |
| `warnings` | 説明なし |
| `hardBubbleHealthOrder` | 説明なし |
| `expectedMinHealth` | 説明なし |
| `errors` | 説明なし |
| `warnings` | 説明なし |
| `scores` | 説明なし |
| `maxRegularScore` | 説明なし |
| `currentCount` | 説明なし |
| `errorType` | 説明なし |
| `currentCount` | 説明なし |
| `successRate` | 説明なし |

---

