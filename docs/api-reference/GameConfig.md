# GameConfig

## 概要

ファイル: `config/GameConfig.js`  
最終更新: 2025/7/26 20:49:00

## 目次

## クラス
- [GameConfig](#gameconfig)
## 関数
- [getGameConfig()](#getgameconfig)
## 定数
- [scoring](#scoring)
- [stages](#stages)
- [items](#items)
- [bubbles](#bubbles)
- [result](#result)
- [allSettings](#allsettings)
- [subKey](#subkey)
- [parts](#parts)
- [baseScore](#basescore)
- [ageBonus](#agebonus)
- [comboConfig](#comboconfig)
- [baseCost](#basecost)
- [multiplier](#multiplier)
- [requirement](#requirement)

---

## GameConfig

### コンストラクタ

```javascript
new GameConfig()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `configManager` | 説明なし |

### メソッド

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

#### getScoreConfig

**シグネチャ**:
```javascript
 getScoreConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getScoreConfig();

// getScoreConfigの実用的な使用例
const result = instance.getScoreConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBubbleBaseScore

**シグネチャ**:
```javascript
 getBubbleBaseScore(bubbleType)
```

**パラメーター**:
- `bubbleType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubbleBaseScore(bubbleType);

// getBubbleBaseScoreの実用的な使用例
const result = instance.getBubbleBaseScore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getComboConfig

**シグネチャ**:
```javascript
 getComboConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getComboConfig();

// getComboConfigの実用的な使用例
const result = instance.getComboConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAgeBonusConfig

**シグネチャ**:
```javascript
 getAgeBonusConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAgeBonusConfig();

// getAgeBonusConfigの実用的な使用例
const result = instance.getAgeBonusConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStageConfig

**シグネチャ**:
```javascript
 getStageConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStageConfig();

// getStageConfigの実用的な使用例
const result = instance.getStageConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStageDifficulty

**シグネチャ**:
```javascript
 getStageDifficulty(stageId)
```

**パラメーター**:
- `stageId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStageDifficulty(stageId);

// getStageDifficultyの実用的な使用例
const result = instance.getStageDifficulty(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStageUnlockRequirement

**シグネチャ**:
```javascript
 getStageUnlockRequirement(stageId)
```

**パラメーター**:
- `stageId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStageUnlockRequirement(stageId);

// getStageUnlockRequirementの実用的な使用例
const result = instance.getStageUnlockRequirement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getItemConfig

**シグネチャ**:
```javascript
 getItemConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getItemConfig();

// getItemConfigの実用的な使用例
const result = instance.getItemConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getItemBaseCost

**シグネチャ**:
```javascript
 getItemBaseCost(itemId)
```

**パラメーター**:
- `itemId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getItemBaseCost(itemId);

// getItemBaseCostの実用的な使用例
const result = instance.getItemBaseCost(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getItemEffect

**シグネチャ**:
```javascript
 getItemEffect(itemId)
```

**パラメーター**:
- `itemId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getItemEffect(itemId);

// getItemEffectの実用的な使用例
const result = instance.getItemEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getItemMaxLevel

**シグネチャ**:
```javascript
 getItemMaxLevel(itemId)
```

**パラメーター**:
- `itemId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getItemMaxLevel(itemId);

// getItemMaxLevelの実用的な使用例
const result = instance.getItemMaxLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBubbleConfig

**シグネチャ**:
```javascript
 getBubbleConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubbleConfig();

// getBubbleConfigの実用的な使用例
const result = instance.getBubbleConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBubbleMaxAge

**シグネチャ**:
```javascript
 getBubbleMaxAge(bubbleType)
```

**パラメーター**:
- `bubbleType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubbleMaxAge(bubbleType);

// getBubbleMaxAgeの実用的な使用例
const result = instance.getBubbleMaxAge(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBubbleHealth

**シグネチャ**:
```javascript
 getBubbleHealth(bubbleType)
```

**パラメーター**:
- `bubbleType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubbleHealth(bubbleType);

// getBubbleHealthの実用的な使用例
const result = instance.getBubbleHealth(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBubbleSpecialEffects

**シグネチャ**:
```javascript
 getBubbleSpecialEffects(bubbleType)
```

**パラメーター**:
- `bubbleType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubbleSpecialEffects(bubbleType);

// getBubbleSpecialEffectsの実用的な使用例
const result = instance.getBubbleSpecialEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < parts.length - 1; i++)
```

**パラメーター**:
- `let i = 0; i < parts.length - 1; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < parts.length - 1; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!current[parts[i]])
```

**パラメーター**:
- `!current[parts[i]]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!current[parts[i]]);

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

#### calculateScore

**シグネチャ**:
```javascript
 calculateScore(bubbleType, ageRatio = 0)
```

**パラメーター**:
- `bubbleType`
- `ageRatio = 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateScore(bubbleType, ageRatio = 0);

// calculateScoreの実用的な使用例
const result = instance.calculateScore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (ageRatio < 0.1)
```

**パラメーター**:
- `ageRatio < 0.1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ageRatio < 0.1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (ageRatio > 0.9)
```

**パラメーター**:
- `ageRatio > 0.9`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ageRatio > 0.9);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (ageRatio >= 0.5 && ageRatio <= 0.7)
```

**パラメーター**:
- `ageRatio >= 0.5 && ageRatio <= 0.7`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ageRatio >= 0.5 && ageRatio <= 0.7);

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

#### calculateComboMultiplier

**シグネチャ**:
```javascript
 calculateComboMultiplier(comboCount)
```

**パラメーター**:
- `comboCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateComboMultiplier(comboCount);

// calculateComboMultiplierの実用的な使用例
const result = instance.calculateComboMultiplier(/* 適切なパラメータ */);
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

#### calculateItemCost

**シグネチャ**:
```javascript
 calculateItemCost(itemId, currentLevel)
```

**パラメーター**:
- `itemId`
- `currentLevel`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateItemCost(itemId, currentLevel);

// calculateItemCostの実用的な使用例
const result = instance.calculateItemCost(/* 適切なパラメータ */);
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

#### isStageUnlocked

**シグネチャ**:
```javascript
 isStageUnlocked(stageId, playerTAP)
```

**パラメーター**:
- `stageId`
- `playerTAP`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isStageUnlocked(stageId, playerTAP);

// isStageUnlockedの実用的な使用例
const result = instance.isStageUnlocked(/* 適切なパラメータ */);
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

## getGameConfig

**シグネチャ**:
```javascript
getGameConfig()
```

**使用例**:
```javascript
const result = getGameConfig();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `scoring` | 説明なし |
| `stages` | 説明なし |
| `items` | 説明なし |
| `bubbles` | 説明なし |
| `result` | 説明なし |
| `allSettings` | 説明なし |
| `subKey` | 説明なし |
| `parts` | 説明なし |
| `baseScore` | 説明なし |
| `ageBonus` | 説明なし |
| `comboConfig` | 説明なし |
| `baseCost` | 説明なし |
| `multiplier` | 説明なし |
| `requirement` | 説明なし |

---

