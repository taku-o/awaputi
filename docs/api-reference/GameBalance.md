# GameBalance

## 概要

ファイル: `config/GameBalance.js`  
最終更新: 2025/7/26 20:49:00

## 目次

## クラス
- [OriginalBalanceHelper](#originalbalancehelper)
## 定数
- [ORIGINAL_BALANCE_CONFIG](#original_balance_config)
- [baseScore](#basescore)
- [config](#config)
- [baseCost](#basecost)
- [multiplier](#multiplier)
- [requirement](#requirement)

---

## OriginalBalanceHelper

### メソッド

#### calculateScore

**シグネチャ**:
```javascript
static calculateScore(bubbleType, ageRatio = 0)
```

**パラメーター**:
- `bubbleType`
- `ageRatio = 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = OriginalBalanceHelper.calculateScore(bubbleType, ageRatio = 0);

// calculateScoreの実用的な使用例
const result = OriginalBalanceHelper.calculateScore(/* 適切なパラメータ */);
console.log('Result:', result);
```

#### if

年齢ボーナス適用

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

#### calculateComboMultiplier

**シグネチャ**:
```javascript
static calculateComboMultiplier(comboCount)
```

**パラメーター**:
- `comboCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = OriginalBalanceHelper.calculateComboMultiplier(comboCount);

// calculateComboMultiplierの実用的な使用例
const result = OriginalBalanceHelper.calculateComboMultiplier(/* 適切なパラメータ */);
console.log('Result:', result);
```

#### calculateItemCost

**シグネチャ**:
```javascript
static calculateItemCost(itemId, currentLevel)
```

**パラメーター**:
- `itemId`
- `currentLevel`

**使用例**:
```javascript
// 基本的な使用方法
const result = OriginalBalanceHelper.calculateItemCost(itemId, currentLevel);

// calculateItemCostの実用的な使用例
const result = OriginalBalanceHelper.calculateItemCost(/* 適切なパラメータ */);
console.log('Result:', result);
```

#### isStageUnlocked

**シグネチャ**:
```javascript
static isStageUnlocked(stageId, playerTAP)
```

**パラメーター**:
- `stageId`
- `playerTAP`

**使用例**:
```javascript
// 基本的な使用方法
const result = OriginalBalanceHelper.isStageUnlocked(stageId, playerTAP);

// isStageUnlockedの実用的な使用例
const result = OriginalBalanceHelper.isStageUnlocked(/* 適切なパラメータ */);
console.log('Result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `ORIGINAL_BALANCE_CONFIG` | 説明なし |
| `baseScore` | 説明なし |
| `config` | 説明なし |
| `baseCost` | 説明なし |
| `multiplier` | 説明なし |
| `requirement` | 説明なし |

---

