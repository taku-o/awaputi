# GameBalanceCompatibility

## 概要

ファイル: `core/GameBalanceCompatibility.js`  
最終更新: 2025/7/26 20:49:00

## 目次

## クラス
- [BalanceHelperCompatibility](#balancehelpercompatibility)
## 関数
- [_showDeprecationWarning()](#_showdeprecationwarning)
- [_getCallerInfo()](#_getcallerinfo)
## 定数
- [SHOW_DEPRECATION_WARNINGS](#show_deprecation_warnings)
- [WARNING_INTERVAL](#warning_interval)
- [lastWarningTime](#lastwarningtime)
- [now](#now)
- [key](#key)
- [loggingSystem](#loggingsystem)
- [err](#err)
- [stack](#stack)
- [callerLine](#callerline)
- [match](#match)
- [BALANCE_CONFIG_PROXY](#balance_config_proxy)
- [gameConfig](#gameconfig)
- [configManager](#configmanager)
- [caller](#caller)
- [configManager](#configmanager)
- [caller](#caller)
- [gameConfig](#gameconfig)
- [caller](#caller)
- [gameConfig](#gameconfig)
- [caller](#caller)
- [gameConfig](#gameconfig)
- [caller](#caller)
- [gameConfig](#gameconfig)
- [caller](#caller)
- [BALANCE_CONFIG](#balance_config)
- [BalanceHelper](#balancehelper)

---

## BalanceHelperCompatibility

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
const result = BalanceHelperCompatibility.calculateScore(bubbleType, ageRatio = 0);

// calculateScoreの実用的な使用例
const result = BalanceHelperCompatibility.calculateScore(/* 適切なパラメータ */);
console.log('Result:', result);
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
const result = BalanceHelperCompatibility.calculateComboMultiplier(comboCount);

// calculateComboMultiplierの実用的な使用例
const result = BalanceHelperCompatibility.calculateComboMultiplier(/* 適切なパラメータ */);
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
const result = BalanceHelperCompatibility.calculateItemCost(itemId, currentLevel);

// calculateItemCostの実用的な使用例
const result = BalanceHelperCompatibility.calculateItemCost(/* 適切なパラメータ */);
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
const result = BalanceHelperCompatibility.isStageUnlocked(stageId, playerTAP);

// isStageUnlockedの実用的な使用例
const result = BalanceHelperCompatibility.isStageUnlocked(/* 適切なパラメータ */);
console.log('Result:', result);
```


---

## _showDeprecationWarning

**シグネチャ**:
```javascript
_showDeprecationWarning(message, caller)
```

**パラメーター**:
- `message`
- `caller`

**使用例**:
```javascript
const result = _showDeprecationWarning(message, caller);
```

---

## _getCallerInfo

**シグネチャ**:
```javascript
_getCallerInfo()
```

**使用例**:
```javascript
const result = _getCallerInfo();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `SHOW_DEPRECATION_WARNINGS` | 警告表示の制御 |
| `WARNING_INTERVAL` | 説明なし |
| `lastWarningTime` | 同じ警告は1分に1回だけ表示 |
| `now` | 説明なし |
| `key` | 説明なし |
| `loggingSystem` | 説明なし |
| `err` | 説明なし |
| `stack` | 説明なし |
| `callerLine` | 説明なし |
| `match` | 説明なし |
| `BALANCE_CONFIG_PROXY` | 説明なし |
| `gameConfig` | 説明なし |
| `configManager` | 説明なし |
| `caller` | 説明なし |
| `configManager` | 説明なし |
| `caller` | 説明なし |
| `gameConfig` | 説明なし |
| `caller` | 説明なし |
| `gameConfig` | 説明なし |
| `caller` | 説明なし |
| `gameConfig` | 説明なし |
| `caller` | 説明なし |
| `gameConfig` | 説明なし |
| `caller` | 説明なし |
| `BALANCE_CONFIG` | 既存のBALANCE_CONFIGとBalanceHelperをエクスポート |
| `BalanceHelper` | 説明なし |

---

