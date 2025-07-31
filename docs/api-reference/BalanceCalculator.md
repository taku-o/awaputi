# BalanceCalculator

## 概要

ファイル: `core/BalanceCalculator.js`  
最終更新: 2025/7/26 20:49:00

## 目次

## クラス
- [BalanceCalculator](#balancecalculator)
## 関数
- [getBalanceCalculator()](#getbalancecalculator)
## 定数
- [config](#config)
- [baseDifficulty](#basedifficulty)
- [levelAdjustment](#leveladjustment)
- [levelFactor](#levelfactor)
- [spawnRateMultiplier](#spawnratemultiplier)
- [maxBubblesMultiplier](#maxbubblesmultiplier)
- [config](#config)
- [baseCost](#basecost)
- [multiplier](#multiplier)
- [config](#config)
- [config](#config)
- [baseEffect](#baseeffect)
- [config](#config)
- [requirement](#requirement)
- [config](#config)
- [config](#config)
- [baseLifetime](#baselifetime)
- [config](#config)
- [baseHealth](#basehealth)
- [recommendations](#recommendations)
- [config](#config)
- [priorities](#priorities)
- [itemOrder](#itemorder)
- [currentLevel](#currentlevel)
- [maxLevel](#maxlevel)
- [cost](#cost)
- [config](#config)
- [allStages](#allstages)
- [totalStages](#totalstages)
- [unlockedCount](#unlockedcount)
- [maxTAP](#maxtap)
- [tapProgress](#tapprogress)
- [stageProgress](#stageprogress)
- [sortedStages](#sortedstages)
- [nextStageInfo](#nextstageinfo)
- [nextStage](#nextstage)
- [suggestions](#suggestions)

---

## BalanceCalculator

### コンストラクタ

```javascript
new BalanceCalculator(gameConfig = null)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameConfig` | 説明なし |
| `defaultBalanceConfig` | デフォルトのバランス設定（GameConfigが利用できない場合のフォールバック） |

### メソッド

#### getBalanceConfig

**シグネチャ**:
```javascript
 getBalanceConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBalanceConfig();

// getBalanceConfigの実用的な使用例
const result = instance.getBalanceConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameConfig && typeof this.gameConfig.getBalanceConfig === 'function')
```

**パラメーター**:
- `this.gameConfig && typeof this.gameConfig.getBalanceConfig === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameConfig && typeof this.gameConfig.getBalanceConfig === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateDifficulty

**シグネチャ**:
```javascript
 calculateDifficulty(stageId, playerLevel = 1)
```

**パラメーター**:
- `stageId`
- `playerLevel = 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateDifficulty(stageId, playerLevel = 1);

// calculateDifficultyの実用的な使用例
const result = instance.calculateDifficulty(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!baseDifficulty)
```

**パラメーター**:
- `!baseDifficulty`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!baseDifficulty);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateLevelAdjustment

**シグネチャ**:
```javascript
 calculateLevelAdjustment(playerLevel)
```

**パラメーター**:
- `playerLevel`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateLevelAdjustment(playerLevel);

// calculateLevelAdjustmentの実用的な使用例
const result = instance.calculateLevelAdjustment(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateItemCost

**シグネチャ**:
```javascript
 calculateItemCost(itemId, currentLevel = 0)
```

**パラメーター**:
- `itemId`
- `currentLevel = 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateItemCost(itemId, currentLevel = 0);

// calculateItemCostの実用的な使用例
const result = instance.calculateItemCost(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (baseCost === undefined)
```

**パラメーター**:
- `baseCost === undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(baseCost === undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### calculateItemEffect

**シグネチャ**:
```javascript
 calculateItemEffect(itemId, level = 1)
```

**パラメーター**:
- `itemId`
- `level = 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateItemEffect(itemId, level = 1);

// calculateItemEffectの実用的な使用例
const result = instance.calculateItemEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (baseEffect === undefined)
```

**パラメーター**:
- `baseEffect === undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(baseEffect === undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

アイテムタイプに応じた計算

**シグネチャ**:
```javascript
 switch (itemId)
```

**パラメーター**:
- `itemId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(itemId);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
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

#### if

要件が設定されていない場合は開放済み

**シグネチャ**:
```javascript
 if (requirement === undefined)
```

**パラメーター**:
- `requirement === undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(requirement === undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### calculateBubbleLifetime

**シグネチャ**:
```javascript
 calculateBubbleLifetime(bubbleType, modifiers = {})
```

**パラメーター**:
- `bubbleType`
- `modifiers = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateBubbleLifetime(bubbleType, modifiers = {});

// calculateBubbleLifetimeの実用的な使用例
const result = instance.calculateBubbleLifetime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (baseLifetime === undefined)
```

**パラメーター**:
- `baseLifetime === undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(baseLifetime === undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

修正値を適用

**シグネチャ**:
```javascript
 if (modifiers.timeMultiplier)
```

**パラメーター**:
- `modifiers.timeMultiplier`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(modifiers.timeMultiplier);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (modifiers.timeBonus)
```

**パラメーター**:
- `modifiers.timeBonus`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(modifiers.timeBonus);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateBubbleHealth

**シグネチャ**:
```javascript
 calculateBubbleHealth(bubbleType, modifiers = {})
```

**パラメーター**:
- `bubbleType`
- `modifiers = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateBubbleHealth(bubbleType, modifiers = {});

// calculateBubbleHealthの実用的な使用例
const result = instance.calculateBubbleHealth(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (baseHealth === undefined)
```

**パラメーター**:
- `baseHealth === undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(baseHealth === undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

修正値を適用

**シグネチャ**:
```javascript
 if (modifiers.healthMultiplier)
```

**パラメーター**:
- `modifiers.healthMultiplier`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(modifiers.healthMultiplier);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (modifiers.healthBonus)
```

**パラメーター**:
- `modifiers.healthBonus`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(modifiers.healthBonus);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateRecommendedItemOrder

**シグネチャ**:
```javascript
 calculateRecommendedItemOrder(playerState)
```

**パラメーター**:
- `playerState`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateRecommendedItemOrder(playerState);

// calculateRecommendedItemOrderの実用的な使用例
const result = instance.calculateRecommendedItemOrder(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const itemId of itemOrder)
```

**パラメーター**:
- `const itemId of itemOrder`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const itemId of itemOrder);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentLevel < maxLevel && currentTAP >= cost)
```

**パラメーター**:
- `currentLevel < maxLevel && currentTAP >= cost`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentLevel < maxLevel && currentTAP >= cost);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateGameProgress

**シグネチャ**:
```javascript
 calculateGameProgress(playerState)
```

**パラメーター**:
- `playerState`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateGameProgress(playerState);

// calculateGameProgressの実用的な使用例
const result = instance.calculateGameProgress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### suggestBalanceAdjustments

**シグネチャ**:
```javascript
 suggestBalanceAdjustments(gameData)
```

**パラメーター**:
- `gameData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.suggestBalanceAdjustments(gameData);

// suggestBalanceAdjustmentsの実用的な使用例
const result = instance.suggestBalanceAdjustments(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

平均プレイ時間が短すぎる場合

**シグネチャ**:
```javascript
 if (averagePlayTime < 60000)
```

**パラメーター**:
- `averagePlayTime < 60000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(averagePlayTime < 60000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

平均プレイ時間が長すぎる場合

**シグネチャ**:
```javascript
 if (averagePlayTime > 300000)
```

**パラメーター**:
- `averagePlayTime > 300000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(averagePlayTime > 300000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rate < 0.3)
```

**パラメーター**:
- `rate < 0.3`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rate < 0.3);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rate < 0.1)
```

**パラメーター**:
- `rate < 0.1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rate < 0.1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDebugInfo

**シグネチャ**:
```javascript
 getDebugInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDebugInfo();

// getDebugInfoの実用的な使用例
const result = instance.getDebugInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getBalanceCalculator

**シグネチャ**:
```javascript
getBalanceCalculator()
```

**使用例**:
```javascript
const result = getBalanceCalculator();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `config` | 説明なし |
| `baseDifficulty` | 説明なし |
| `levelAdjustment` | 説明なし |
| `levelFactor` | 説明なし |
| `spawnRateMultiplier` | 説明なし |
| `maxBubblesMultiplier` | 説明なし |
| `config` | 説明なし |
| `baseCost` | 説明なし |
| `multiplier` | 説明なし |
| `config` | 説明なし |
| `config` | 説明なし |
| `baseEffect` | 説明なし |
| `config` | 説明なし |
| `requirement` | 説明なし |
| `config` | 説明なし |
| `config` | 説明なし |
| `baseLifetime` | 説明なし |
| `config` | 説明なし |
| `baseHealth` | 説明なし |
| `recommendations` | 説明なし |
| `config` | 説明なし |
| `priorities` | 説明なし |
| `itemOrder` | 説明なし |
| `currentLevel` | 説明なし |
| `maxLevel` | 説明なし |
| `cost` | 説明なし |
| `config` | 説明なし |
| `allStages` | 説明なし |
| `totalStages` | 説明なし |
| `unlockedCount` | 説明なし |
| `maxTAP` | 説明なし |
| `tapProgress` | 説明なし |
| `stageProgress` | 説明なし |
| `sortedStages` | 説明なし |
| `nextStageInfo` | 説明なし |
| `nextStage` | 説明なし |
| `suggestions` | 説明なし |

---

