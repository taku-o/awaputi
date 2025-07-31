# ScoreCalculator

## 概要

ファイル: `core/ScoreCalculator.js`  
最終更新: 2025/7/26 20:49:00

## 目次

## クラス
- [ScoreCalculator](#scorecalculator)
## 関数
- [getScoreCalculator()](#getscorecalculator)
## 定数
- [config](#config)
- [baseScore](#basescore)
- [ageMultiplier](#agemultiplier)
- [config](#config)
- [config](#config)
- [multiplier](#multiplier)
- [config](#config)
- [baseScore](#basescore)
- [comboMultiplier](#combomultiplier)
- [totalMultiplier](#totalmultiplier)
- [finalScore](#finalscore)
- [comboBonus](#combobonus)
- [config](#config)
- [chainCount](#chaincount)
- [healthRatio](#healthratio)
- [total](#total)
- [average](#average)
- [highest](#highest)
- [lowest](#lowest)
- [comboCount](#combocount)
- [bonusCount](#bonuscount)
- [strategy](#strategy)
- [bubbleValues](#bubblevalues)

---

## ScoreCalculator

### コンストラクタ

```javascript
new ScoreCalculator(gameConfig = null)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameConfig` | 説明なし |
| `defaultScoreConfig` | デフォルトのスコア設定（GameConfigが利用できない場合のフォールバック） |

### メソッド

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

#### if

**シグネチャ**:
```javascript
 if (this.gameConfig && typeof this.gameConfig.getScoreConfig === 'function')
```

**パラメーター**:
- `this.gameConfig && typeof this.gameConfig.getScoreConfig === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameConfig && typeof this.gameConfig.getScoreConfig === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateBaseScore

**シグネチャ**:
```javascript
 calculateBaseScore(bubbleType, ageRatio = 0)
```

**パラメーター**:
- `bubbleType`
- `ageRatio = 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateBaseScore(bubbleType, ageRatio = 0);

// calculateBaseScoreの実用的な使用例
const result = instance.calculateBaseScore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateAgeBonus

**シグネチャ**:
```javascript
 calculateAgeBonus(ageRatio)
```

**パラメーター**:
- `ageRatio`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateAgeBonus(ageRatio);

// calculateAgeBonusの実用的な使用例
const result = instance.calculateAgeBonus(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (ageRatio < 0 || ageRatio > 1)
```

**パラメーター**:
- `ageRatio < 0 || ageRatio > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ageRatio < 0 || ageRatio > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ageRatio が 0 の場合は通常倍率（ボーナスなし）

**シグネチャ**:
```javascript
 if (ageRatio === 0)
```

**パラメーター**:
- `ageRatio === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ageRatio === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (comboCount <= 1)
```

**パラメーター**:
- `comboCount <= 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(comboCount <= 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateComboBonus

**シグネチャ**:
```javascript
 calculateComboBonus(comboCount)
```

**パラメーター**:
- `comboCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateComboBonus(comboCount);

// calculateComboBonusの実用的な使用例
const result = instance.calculateComboBonus(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (comboCount % config.combo.bonusInterval === 0 && comboCount > 0)
```

**パラメーター**:
- `comboCount % config.combo.bonusInterval === 0 && comboCount > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(comboCount % config.combo.bonusInterval === 0 && comboCount > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateTotalScore

**シグネチャ**:
```javascript
 calculateTotalScore(params)
```

**パラメーター**:
- `params`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateTotalScore(params);

// calculateTotalScoreの実用的な使用例
const result = instance.calculateTotalScore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateSpecialBubbleBonus

**シグネチャ**:
```javascript
 calculateSpecialBubbleBonus(bubbleType, effectParams = {})
```

**パラメーター**:
- `bubbleType`
- `effectParams = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateSpecialBubbleBonus(bubbleType, effectParams = {});

// calculateSpecialBubbleBonusの実用的な使用例
const result = instance.calculateSpecialBubbleBonus(/* 適切なパラメータ */);
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

#### calculateScoreStatistics

**シグネチャ**:
```javascript
 calculateScoreStatistics(scoreHistory)
```

**パラメーター**:
- `scoreHistory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateScoreStatistics(scoreHistory);

// calculateScoreStatisticsの実用的な使用例
const result = instance.calculateScoreStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateScoreEfficiency

**シグネチャ**:
```javascript
 calculateScoreEfficiency(totalScore, timeElapsed)
```

**パラメーター**:
- `totalScore`
- `timeElapsed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateScoreEfficiency(totalScore, timeElapsed);

// calculateScoreEfficiencyの実用的な使用例
const result = instance.calculateScoreEfficiency(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (timeElapsed <= 0)
```

**パラメーター**:
- `timeElapsed <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(timeElapsed <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateRecommendedStrategy

**シグネチャ**:
```javascript
 calculateRecommendedStrategy(gameState)
```

**パラメーター**:
- `gameState`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateRecommendedStrategy(gameState);

// calculateRecommendedStrategyの実用的な使用例
const result = instance.calculateRecommendedStrategy(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コンボが高い場合は継続を優先

**シグネチャ**:
```javascript
 if (currentCombo >= 3)
```

**パラメーター**:
- `currentCombo >= 3`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentCombo >= 3);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

時間が少ない場合は高得点泡を優先

**シグネチャ**:
```javascript
 if (timeRemaining < 30000)
```

**パラメーター**:
- `timeRemaining < 30000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(timeRemaining < 30000);

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

## getScoreCalculator

**シグネチャ**:
```javascript
getScoreCalculator()
```

**使用例**:
```javascript
const result = getScoreCalculator();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `config` | 説明なし |
| `baseScore` | 説明なし |
| `ageMultiplier` | 説明なし |
| `config` | 説明なし |
| `config` | 説明なし |
| `multiplier` | 説明なし |
| `config` | 説明なし |
| `baseScore` | 説明なし |
| `comboMultiplier` | 説明なし |
| `totalMultiplier` | 説明なし |
| `finalScore` | 説明なし |
| `comboBonus` | 説明なし |
| `config` | 説明なし |
| `chainCount` | 説明なし |
| `healthRatio` | 説明なし |
| `total` | 説明なし |
| `average` | 説明なし |
| `highest` | 説明なし |
| `lowest` | 説明なし |
| `comboCount` | 説明なし |
| `bonusCount` | 説明なし |
| `strategy` | 説明なし |
| `bubbleValues` | 説明なし |

---

