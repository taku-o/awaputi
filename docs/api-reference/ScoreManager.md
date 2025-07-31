# ScoreManager

## 概要

ファイル: `managers/ScoreManager.js`  
最終更新: 2025/7/19 3:53:53

## 目次

## クラス
- [ScoreManager](#scoremanager)
## 定数
- [comboBoost](#comboboost)
- [baseScore](#basescore)
- [specialMultiplier](#specialmultiplier)
- [itemMultiplier](#itemmultiplier)
- [ageBonus](#agebonus)
- [baseScores](#basescores)
- [ageRatio](#ageratio)
- [gameScene](#gamescene)
- [bonusScore](#bonusscore)
- [gameScene](#gamescene)
- [gameScene](#gamescene)

---

## ScoreManager

### コンストラクタ

```javascript
new ScoreManager(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `combo` | 説明なし |
| `comboTimer` | 説明なし |
| `comboTimeout` | 説明なし |
| `scoreMultipliers` | 2秒でコンボリセット |
| `comboTimer` | 説明なし |
| `combo` | 説明なし |
| `comboTimer` | 説明なし |
| `scoreMultipliers` | 説明なし |

### メソッド

#### getComboTimeout

**シグネチャ**:
```javascript
 getComboTimeout()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getComboTimeout();

// getComboTimeoutの実用的な使用例
const result = instance.getComboTimeout(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

アイテム効果でコンボ継続時間を延長

**シグネチャ**:
```javascript
 if (this.gameEngine.itemManager)
```

**パラメーター**:
- `this.gameEngine.itemManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.itemManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (comboBoost > 1)
```

**パラメーター**:
- `comboBoost > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(comboBoost > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addScore

**シグネチャ**:
```javascript
 addScore(bubble, x, y)
```

**パラメーター**:
- `bubble`
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addScore(bubble, x, y);

// addScoreの実用的な使用例
const result = instance.addScore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.combo > 1)
```

**パラメーター**:
- `this.combo > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.combo > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (specialMultiplier > 1)
```

**パラメーター**:
- `specialMultiplier > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(specialMultiplier > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (itemMultiplier > 1)
```

**パラメーター**:
- `itemMultiplier > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(itemMultiplier > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (ageBonus > 1)
```

**パラメーター**:
- `ageBonus > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ageBonus > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateBaseScore

**シグネチャ**:
```javascript
 calculateBaseScore(bubble)
```

**パラメーター**:
- `bubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateBaseScore(bubble);

// calculateBaseScoreの実用的な使用例
const result = instance.calculateBaseScore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateAgeBonus

**シグネチャ**:
```javascript
 calculateAgeBonus(bubble)
```

**パラメーター**:
- `bubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateAgeBonus(bubble);

// calculateAgeBonusの実用的な使用例
const result = instance.calculateAgeBonus(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (ageRatio >= 0.9)
```

**パラメーター**:
- `ageRatio >= 0.9`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ageRatio >= 0.9);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (ageRatio >= 0.7)
```

**パラメーター**:
- `ageRatio >= 0.7`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ageRatio >= 0.7);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (ageRatio >= 0.5)
```

**パラメーター**:
- `ageRatio >= 0.5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ageRatio >= 0.5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getItemScoreMultiplier

**シグネチャ**:
```javascript
 getItemScoreMultiplier()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getItemScoreMultiplier();

// getItemScoreMultiplierの実用的な使用例
const result = instance.getItemScoreMultiplier(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addScoreMultiplier

**シグネチャ**:
```javascript
 addScoreMultiplier(multiplier)
```

**パラメーター**:
- `multiplier`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addScoreMultiplier(multiplier);

// addScoreMultiplierの実用的な使用例
const result = instance.addScoreMultiplier(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifyScoreGained

**シグネチャ**:
```javascript
 notifyScoreGained(score, x, y, multiplier)
```

**パラメーター**:
- `score`
- `x`
- `y`
- `multiplier`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifyScoreGained(score, x, y, multiplier);

// notifyScoreGainedの実用的な使用例
const result = instance.notifyScoreGained(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (gameScene && typeof gameScene.onScoreGained === 'function')
```

**パラメーター**:
- `gameScene && typeof gameScene.onScoreGained === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gameScene && typeof gameScene.onScoreGained === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateCombo

**シグネチャ**:
```javascript
 updateCombo(x, y)
```

**パラメーター**:
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateCombo(x, y);

// updateComboの実用的な使用例
const result = instance.updateCombo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

より頻繁なコンボボーナス（5コンボごと）

**シグネチャ**:
```javascript
 if (this.combo % 5 === 0)
```

**パラメーター**:
- `this.combo % 5 === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.combo % 5 === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (gameScene && typeof gameScene.onComboAchieved === 'function')
```

**パラメーター**:
- `gameScene && typeof gameScene.onComboAchieved === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gameScene && typeof gameScene.onComboAchieved === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifyComboBonus

**シグネチャ**:
```javascript
 notifyComboBonus(bonusScore, x, y, combo)
```

**パラメーター**:
- `bonusScore`
- `x`
- `y`
- `combo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifyComboBonus(bonusScore, x, y, combo);

// notifyComboBonusの実用的な使用例
const result = instance.notifyComboBonus(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (gameScene && gameScene.floatingTextManager)
```

**パラメーター**:
- `gameScene && gameScene.floatingTextManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gameScene && gameScene.floatingTextManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetCombo

**シグネチャ**:
```javascript
 resetCombo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetCombo();

// resetComboの実用的な使用例
const result = instance.resetCombo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.combo > 0)
```

**パラメーター**:
- `this.combo > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.combo > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### update

**シグネチャ**:
```javascript
 update(deltaTime)
```

**パラメーター**:
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.update(deltaTime);

// フレーム更新処理
const deltaTime = 16.67; // 60FPS
instance.update(deltaTime);
```

#### if

コンボタイマーの更新

**シグネチャ**:
```javascript
 if (this.combo > 0)
```

**パラメーター**:
- `this.combo > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.combo > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentCombo

**シグネチャ**:
```javascript
 getCurrentCombo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentCombo();

// getCurrentComboの実用的な使用例
const result = instance.getCurrentCombo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getComboMultiplier

**シグネチャ**:
```javascript
 getComboMultiplier()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getComboMultiplier();

// getComboMultiplierの実用的な使用例
const result = instance.getComboMultiplier(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTotalMultiplier

**シグネチャ**:
```javascript
 getTotalMultiplier()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTotalMultiplier();

// getTotalMultiplierの実用的な使用例
const result = instance.getTotalMultiplier(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetMultipliers

**シグネチャ**:
```javascript
 resetMultipliers()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetMultipliers();

// resetMultipliersの実用的な使用例
const result = instance.resetMultipliers(/* 適切なパラメータ */);
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

## 定数

| 定数名 | 説明 |
|--------|------|
| `comboBoost` | 説明なし |
| `baseScore` | 説明なし |
| `specialMultiplier` | 説明なし |
| `itemMultiplier` | 説明なし |
| `ageBonus` | 説明なし |
| `baseScores` | 説明なし |
| `ageRatio` | 説明なし |
| `gameScene` | 説明なし |
| `bonusScore` | 説明なし |
| `gameScene` | 説明なし |
| `gameScene` | 説明なし |

---

