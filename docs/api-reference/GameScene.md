# GameScene

## 概要

ファイル: `scenes/GameScene.js`  
最終更新: 2025/7/29 9:06:33

## 目次

## クラス
- [GameScene](#gamescene)
## 定数
- [canvas](#canvas)
- [itemManager](#itemmanager)
- [item](#item)
- [canvas](#canvas)
- [now](#now)
- [timeRemaining](#timeremaining)
- [canvas](#canvas)
- [canvas](#canvas)
- [currentScore](#currentscore)
- [combo](#combo)
- [canvas](#canvas)
- [playerData](#playerdata)
- [canvas](#canvas)
- [effectMessages](#effectmessages)
- [message](#message)
- [type](#type)
- [canvas](#canvas)
- [canvas](#canvas)
- [timeRatio](#timeratio)
- [topColor](#topcolor)
- [bottomColor](#bottomcolor)
- [gradient](#gradient)
- [alpha](#alpha)
- [canvas](#canvas)
- [playerData](#playerdata)
- [scoreScale](#scorescale)
- [minutes](#minutes)
- [seconds](#seconds)
- [timeColor](#timecolor)
- [flash](#flash)
- [hpRatio](#hpratio)
- [hpFlash](#hpflash)
- [hpColor](#hpcolor)
- [hpBarX](#hpbarx)
- [hpBarY](#hpbary)
- [hpBarWidth](#hpbarwidth)
- [hpBarHeight](#hpbarheight)
- [hpGradient](#hpgradient)
- [combo](#combo)
- [comboFlash](#comboflash)
- [comboScale](#comboscale)
- [comboAlpha](#comboalpha)
- [comboGradient](#combogradient)
- [bonusSeconds](#bonusseconds)
- [stopSeconds](#stopseconds)
- [canvas](#canvas)
- [buttonX](#buttonx)
- [buttonY](#buttony)
- [buttonWidth](#buttonwidth)
- [buttonHeight](#buttonheight)
- [buttonGradient](#buttongradient)
- [canvas](#canvas)
- [buttonX](#buttonx)
- [buttonY](#buttony)
- [buttonSize](#buttonsize)
- [canvas](#canvas)
- [panelX](#panelx)
- [panelY](#panely)
- [panelWidth](#panelwidth)
- [panelHeight](#panelheight)
- [lineHeight](#lineheight)
- [bubbleCount](#bubblecount)
- [stageConfig](#stageconfig)
- [stageName](#stagename)
- [canvas](#canvas)
- [start](#start)
- [current](#current)
- [dx](#dx)
- [dy](#dy)
- [distance](#distance)
- [forceRatio](#forceratio)
- [red](#red)
- [green](#green)
- [angle](#angle)
- [arrowLength](#arrowlength)
- [arrowAngle](#arrowangle)
- [bubble](#bubble)
- [particleCount](#particlecount)
- [particleCount](#particlecount)
- [pathLength](#pathlength)
- [t](#t)
- [x](#x)
- [y](#y)
- [particleCount](#particlecount)
- [angleStep](#anglestep)
- [angle](#angle)
- [radius](#radius)
- [x](#x)
- [y](#y)
- [particleCount](#particlecount)
- [angleStep](#anglestep)
- [angle](#angle)
- [speed](#speed)
- [rings](#rings)
- [delay](#delay)
- [particleCount](#particlecount)
- [angleStep](#anglestep)
- [radius](#radius)
- [angle](#angle)
- [x](#x)
- [y](#y)
- [canvas](#canvas)
- [gameOverGradient](#gameovergradient)
- [earnedAP](#earnedap)
- [canvas](#canvas)
- [canvas](#canvas)
- [rect](#rect)
- [x](#x)
- [y](#y)
- [giveUpButtonX](#giveupbuttonx)
- [giveUpButtonY](#giveupbuttony)
- [giveUpButtonWidth](#giveupbuttonwidth)
- [giveUpButtonHeight](#giveupbuttonheight)
- [infoButtonX](#infobuttonx)
- [infoButtonY](#infobuttony)
- [infoButtonSize](#infobuttonsize)
- [distToInfo](#disttoinfo)
- [finalScore](#finalscore)
- [earnedAP](#earnedap)
- [currentStage](#currentstage)
- [stageId](#stageid)
- [currentHighScore](#currenthighscore)

---

## GameScene

**継承元**: `Scene`

### コンストラクタ

```javascript
new GameScene(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `isPaused` | 説明なし |
| `inputManager` | 説明なし |
| `floatingTextManager` | 説明なし |
| `dragVisualization` | ビジュアルフィードバック用 |
| `uiState` | UI状態管理 |
| `performanceMetrics` | パフォーマンス表示用 |
| `isPaused` | 説明なし |
| `uiState` | UI状態をリセット |
| `isPaused` | 説明なし |

### メソッド

#### enter

**シグネチャ**:
```javascript
 enter()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enter();

// enterの実用的な使用例
const result = instance.enter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### exit

**シグネチャ**:
```javascript
 exit()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exit();

// exitの実用的な使用例
const result = instance.exit(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyItemEffects

**シグネチャ**:
```javascript
 applyItemEffects()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyItemEffects();

// applyItemEffectsの実用的な使用例
const result = instance.applyItemEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (item && item.effect.type === 'scoreMultiplier')
```

**パラメーター**:
- `item && item.effect.type === 'scoreMultiplier'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(item && item.effect.type === 'scoreMultiplier');

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

**シグネチャ**:
```javascript
 if (this.isPaused || this.gameEngine.isGameOver)
```

**パラメーター**:
- `this.isPaused || this.gameEngine.isGameOver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isPaused || this.gameEngine.isGameOver);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.timeRemaining <= 0)
```

**パラメーター**:
- `this.gameEngine.timeRemaining <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.timeRemaining <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲームオーバー判定

**シグネチャ**:
```javascript
 if (this.gameEngine.playerData.currentHP <= 0)
```

**パラメーター**:
- `this.gameEngine.playerData.currentHP <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.playerData.currentHP <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updatePerformanceMetrics

**シグネチャ**:
```javascript
 updatePerformanceMetrics(deltaTime)
```

**パラメーター**:
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updatePerformanceMetrics(deltaTime);

// updatePerformanceMetricsの実用的な使用例
const result = instance.updatePerformanceMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (now - this.performanceMetrics.lastFpsUpdate >= 1000)
```

**パラメーター**:
- `now - this.performanceMetrics.lastFpsUpdate >= 1000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(now - this.performanceMetrics.lastFpsUpdate >= 1000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateUIState

**シグネチャ**:
```javascript
 updateUIState(deltaTime)
```

**パラメーター**:
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateUIState(deltaTime);

// updateUIStateの実用的な使用例
const result = instance.updateUIState(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コンボフラッシュタイマー

**シグネチャ**:
```javascript
 if (this.uiState.comboFlashTimer > 0)
```

**パラメーター**:
- `this.uiState.comboFlashTimer > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.uiState.comboFlashTimer > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

HPフラッシュタイマー

**シグネチャ**:
```javascript
 if (this.uiState.hpFlashTimer > 0)
```

**パラメーター**:
- `this.uiState.hpFlashTimer > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.uiState.hpFlashTimer > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スコアアニメーションタイマー

**シグネチャ**:
```javascript
 if (this.uiState.scoreAnimationTimer > 0)
```

**パラメーター**:
- `this.uiState.scoreAnimationTimer > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.uiState.scoreAnimationTimer > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkTimeWarning

**シグネチャ**:
```javascript
 checkTimeWarning()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkTimeWarning();

// checkTimeWarningの実用的な使用例
const result = instance.checkTimeWarning(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

30秒以下で警告

**シグネチャ**:
```javascript
 if (timeRemaining <= 30000 && !this.uiState.timeWarningActive)
```

**パラメーター**:
- `timeRemaining <= 30000 && !this.uiState.timeWarningActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(timeRemaining <= 30000 && !this.uiState.timeWarningActive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

10秒以下で緊急警告

**シグネチャ**:
```javascript
 if (timeRemaining <= 10000 && timeRemaining > 9000)
```

**パラメーター**:
- `timeRemaining <= 10000 && timeRemaining > 9000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(timeRemaining <= 10000 && timeRemaining > 9000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkScoreChange

**シグネチャ**:
```javascript
 checkScoreChange()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkScoreChange();

// checkScoreChangeの実用的な使用例
const result = instance.checkScoreChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentScore !== this.uiState.lastScore)
```

**パラメーター**:
- `currentScore !== this.uiState.lastScore`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentScore !== this.uiState.lastScore);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### onScoreGained

**シグネチャ**:
```javascript
 onScoreGained(score, x, y, multiplier = 1)
```

**パラメーター**:
- `score`
- `x`
- `y`
- `multiplier = 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.onScoreGained(score, x, y, multiplier = 1);

// onScoreGainedの実用的な使用例
const result = instance.onScoreGained(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (combo > 1)
```

**パラメーター**:
- `combo > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(combo > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### onComboAchieved

**シグネチャ**:
```javascript
 onComboAchieved(combo, x, y)
```

**パラメーター**:
- `combo`
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.onComboAchieved(combo, x, y);

// onComboAchievedの実用的な使用例
const result = instance.onComboAchieved(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### onDamageTaken

**シグネチャ**:
```javascript
 onDamageTaken(damage, source = 'unknown')
```

**パラメーター**:
- `damage`
- `source = 'unknown'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.onDamageTaken(damage, source = 'unknown');

// onDamageTakenの実用的な使用例
const result = instance.onDamageTaken(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

低HP警告

**シグネチャ**:
```javascript
 if (playerData.currentHP <= playerData.maxHP * 0.25)
```

**パラメーター**:
- `playerData.currentHP <= playerData.maxHP * 0.25`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(playerData.currentHP <= playerData.maxHP * 0.25);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### onHealed

**シグネチャ**:
```javascript
 onHealed(heal)
```

**パラメーター**:
- `heal`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.onHealed(heal);

// onHealedの実用的な使用例
const result = instance.onHealed(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### onSpecialEffect

**シグネチャ**:
```javascript
 onSpecialEffect(effectType, x, y)
```

**パラメーター**:
- `effectType`
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.onSpecialEffect(effectType, x, y);

// onSpecialEffectの実用的な使用例
const result = instance.onSpecialEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### render

**シグネチャ**:
```javascript
 render(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render(context);

// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);
```

#### if

パフォーマンス情報（デバッグ用）

**シグネチャ**:
```javascript
 if (this.performanceMetrics.showMetrics)
```

**パラメーター**:
- `this.performanceMetrics.showMetrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.performanceMetrics.showMetrics);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲームオーバー画面

**シグネチャ**:
```javascript
 if (this.gameEngine.isGameOver)
```

**パラメーター**:
- `this.gameEngine.isGameOver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.isGameOver);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ポーズ画面

**シグネチャ**:
```javascript
 if (this.isPaused)
```

**パラメーター**:
- `this.isPaused`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isPaused);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderBackground

**シグネチャ**:
```javascript
 renderBackground(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderBackground(context);

// renderBackgroundの実用的な使用例
const result = instance.renderBackground(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ボーナスタイム時のオーバーレイ

**シグネチャ**:
```javascript
 if (this.gameEngine.bonusTimeRemaining > 0)
```

**パラメーター**:
- `this.gameEngine.bonusTimeRemaining > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.bonusTimeRemaining > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

時間停止時のオーバーレイ

**シグネチャ**:
```javascript
 if (this.gameEngine.timeStopRemaining > 0)
```

**パラメーター**:
- `this.gameEngine.timeStopRemaining > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.timeStopRemaining > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderEnhancedUI

**シグネチャ**:
```javascript
 renderEnhancedUI(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderEnhancedUI(context);

// renderEnhancedUIの実用的な使用例
const result = instance.renderEnhancedUI(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.timeRemaining <= 10000)
```

**パラメーター**:
- `this.gameEngine.timeRemaining <= 10000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.timeRemaining <= 10000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (flash)
```

**パラメーター**:
- `flash`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(flash);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (hpRatio > 0.5)
```

**パラメーター**:
- `hpRatio > 0.5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hpRatio > 0.5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (hpRatio > 0.25)
```

**パラメーター**:
- `hpRatio > 0.25`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hpRatio > 0.25);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (combo > 1)
```

**パラメーター**:
- `combo > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(combo > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ボーナス情報

**シグネチャ**:
```javascript
 if (this.gameEngine.bonusTimeRemaining > 0)
```

**パラメーター**:
- `this.gameEngine.bonusTimeRemaining > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.bonusTimeRemaining > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

時間停止情報

**シグネチャ**:
```javascript
 if (this.gameEngine.timeStopRemaining > 0)
```

**パラメーター**:
- `this.gameEngine.timeStopRemaining > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.timeStopRemaining > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

詳細情報パネル

**シグネチャ**:
```javascript
 if (this.uiState.showingDetailedInfo)
```

**パラメーター**:
- `this.uiState.showingDetailedInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.uiState.showingDetailedInfo);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderGiveUpButton

**シグネチャ**:
```javascript
 renderGiveUpButton(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderGiveUpButton(context);

// renderGiveUpButtonの実用的な使用例
const result = instance.renderGiveUpButton(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderInfoButton

**シグネチャ**:
```javascript
 renderInfoButton(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderInfoButton(context);

// renderInfoButtonの実用的な使用例
const result = instance.renderInfoButton(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderDetailedInfoPanel

**シグネチャ**:
```javascript
 renderDetailedInfoPanel(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderDetailedInfoPanel(context);

// renderDetailedInfoPanelの実用的な使用例
const result = instance.renderDetailedInfoPanel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.performanceMetrics.showMetrics)
```

**パラメーター**:
- `this.performanceMetrics.showMetrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.performanceMetrics.showMetrics);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderPerformanceMetrics

**シグネチャ**:
```javascript
 renderPerformanceMetrics(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderPerformanceMetrics(context);

// renderPerformanceMetricsの実用的な使用例
const result = instance.renderPerformanceMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderDragVisualization

**シグネチャ**:
```javascript
 renderDragVisualization(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderDragVisualization(context);

// renderDragVisualizationの実用的な使用例
const result = instance.renderDragVisualization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance > 10)
```

**パラメーター**:
- `distance > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ターゲット泡のハイライト

**シグネチャ**:
```javascript
 if (this.dragVisualization.targetBubble)
```

**パラメーター**:
- `this.dragVisualization.targetBubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dragVisualization.targetBubble);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createDragParticles

**シグネチャ**:
```javascript
 createDragParticles(x, y, force)
```

**パラメーター**:
- `x`
- `y`
- `force`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createDragParticles(x, y, force);

// createDragParticlesの実用的な使用例
const result = instance.createDragParticles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetDragVisualization

**シグネチャ**:
```javascript
 resetDragVisualization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetDragVisualization();

// resetDragVisualizationの実用的な使用例
const result = instance.resetDragVisualization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startDragVisualization

**シグネチャ**:
```javascript
 startDragVisualization(startPos, targetBubble)
```

**パラメーター**:
- `startPos`
- `targetBubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startDragVisualization(startPos, targetBubble);

// startDragVisualizationの実用的な使用例
const result = instance.startDragVisualization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createSwipeEffect

**シグネチャ**:
```javascript
 createSwipeEffect(startPos, endPos, direction)
```

**パラメーター**:
- `startPos`
- `endPos`
- `direction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSwipeEffect(startPos, endPos, direction);

// createSwipeEffectの実用的な使用例
const result = instance.createSwipeEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createPinchEffect

**シグネチャ**:
```javascript
 createPinchEffect(center, scale)
```

**パラメーター**:
- `center`
- `scale`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createPinchEffect(center, scale);

// createPinchEffectの実用的な使用例
const result = instance.createPinchEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRadialBurstEffect

**シグネチャ**:
```javascript
 createRadialBurstEffect(position, radius)
```

**パラメーター**:
- `position`
- `radius`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRadialBurstEffect(position, radius);

// createRadialBurstEffectの実用的な使用例
const result = instance.createRadialBurstEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createLongPressEffect

**シグネチャ**:
```javascript
 createLongPressEffect(position)
```

**パラメーター**:
- `position`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createLongPressEffect(position);

// createLongPressEffectの実用的な使用例
const result = instance.createLongPressEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let ring = 0; ring < rings; ring++)
```

**パラメーター**:
- `let ring = 0; ring < rings; ring++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let ring = 0; ring < rings; ring++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateDragVisualization

**シグネチャ**:
```javascript
 updateDragVisualization(deltaTime)
```

**パラメーター**:
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateDragVisualization(deltaTime);

// updateDragVisualizationの実用的な使用例
const result = instance.updateDragVisualization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.dragVisualization.isActive)
```

**パラメーター**:
- `!this.dragVisualization.isActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.dragVisualization.isActive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

長時間ドラッグしている場合の視覚的なフィードバック

**シグネチャ**:
```javascript
 if (this.dragVisualization.duration > 2000)
```

**パラメーター**:
- `this.dragVisualization.duration > 2000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dragVisualization.duration > 2000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateDragVisualizationPosition

**シグネチャ**:
```javascript
 updateDragVisualizationPosition(currentPos)
```

**パラメーター**:
- `currentPos`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateDragVisualizationPosition(currentPos);

// updateDragVisualizationPositionの実用的な使用例
const result = instance.updateDragVisualizationPosition(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.dragVisualization.isActive)
```

**パラメーター**:
- `this.dragVisualization.isActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dragVisualization.isActive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderGameOver

**シグネチャ**:
```javascript
 renderGameOver(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderGameOver(context);

// renderGameOverの実用的な使用例
const result = instance.renderGameOver(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderPause

**シグネチャ**:
```javascript
 renderPause(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderPause(context);

// renderPauseの実用的な使用例
const result = instance.renderPause(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleInput

**シグネチャ**:
```javascript
 handleInput(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleInput(event);

// handleInputの実用的な使用例
const result = instance.handleInput(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.isGameOver)
```

**パラメーター**:
- `this.gameEngine.isGameOver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.isGameOver);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event.type === 'keydown')
```

**パラメーター**:
- `event.type === 'keydown'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.type === 'keydown');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (event.code)
```

**パラメーター**:
- `event.code`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(event.code);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event.type === 'click')
```

**パラメーター**:
- `event.type === 'click'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.type === 'click');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleUIClick

**シグネチャ**:
```javascript
 handleUIClick(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleUIClick(event);

// handleUIClickの実用的な使用例
const result = instance.handleUIClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (x >= giveUpButtonX && x <= giveUpButtonX + giveUpButtonWidth && 
            y >= giveUpButtonY && y <= giveUpButtonY + giveUpButtonHeight)
```

**パラメーター**:
- `x >= giveUpButtonX && x <= giveUpButtonX + giveUpButtonWidth && 
            y >= giveUpButtonY && y <= giveUpButtonY + giveUpButtonHeight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(x >= giveUpButtonX && x <= giveUpButtonX + giveUpButtonWidth && 
            y >= giveUpButtonY && y <= giveUpButtonY + giveUpButtonHeight);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distToInfo <= infoButtonSize / 2)
```

**パラメーター**:
- `distToInfo <= infoButtonSize / 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distToInfo <= infoButtonSize / 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### toggleDetailedInfo

**シグネチャ**:
```javascript
 toggleDetailedInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toggleDetailedInfo();

// toggleDetailedInfoの実用的な使用例
const result = instance.toggleDetailedInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### togglePerformanceMetrics

**シグネチャ**:
```javascript
 togglePerformanceMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.togglePerformanceMetrics();

// togglePerformanceMetricsの実用的な使用例
const result = instance.togglePerformanceMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### togglePause

**シグネチャ**:
```javascript
 togglePause()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.togglePause();

// togglePauseの実用的な使用例
const result = instance.togglePause(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.gameEngine.isGameOver)
```

**パラメーター**:
- `!this.gameEngine.isGameOver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.gameEngine.isGameOver);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### gameOver

**シグネチャ**:
```javascript
 gameOver()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.gameOver();

// gameOverの実用的な使用例
const result = instance.gameOver(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentStage)
```

**パラメーター**:
- `currentStage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentStage);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!currentHighScore || finalScore > currentHighScore)
```

**パラメーター**:
- `!currentHighScore || finalScore > currentHighScore`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!currentHighScore || finalScore > currentHighScore);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `canvas` | 説明なし |
| `itemManager` | 説明なし |
| `item` | 説明なし |
| `canvas` | 説明なし |
| `now` | 説明なし |
| `timeRemaining` | 説明なし |
| `canvas` | 説明なし |
| `canvas` | 説明なし |
| `currentScore` | 説明なし |
| `combo` | 説明なし |
| `canvas` | 説明なし |
| `playerData` | 説明なし |
| `canvas` | 説明なし |
| `effectMessages` | 説明なし |
| `message` | 説明なし |
| `type` | 説明なし |
| `canvas` | 説明なし |
| `canvas` | 説明なし |
| `timeRatio` | 説明なし |
| `topColor` | 説明なし |
| `bottomColor` | 説明なし |
| `gradient` | 説明なし |
| `alpha` | 説明なし |
| `canvas` | 説明なし |
| `playerData` | 説明なし |
| `scoreScale` | 説明なし |
| `minutes` | 説明なし |
| `seconds` | 説明なし |
| `timeColor` | 説明なし |
| `flash` | 説明なし |
| `hpRatio` | 説明なし |
| `hpFlash` | 説明なし |
| `hpColor` | 説明なし |
| `hpBarX` | 説明なし |
| `hpBarY` | 説明なし |
| `hpBarWidth` | 説明なし |
| `hpBarHeight` | 説明なし |
| `hpGradient` | 説明なし |
| `combo` | 説明なし |
| `comboFlash` | 説明なし |
| `comboScale` | 説明なし |
| `comboAlpha` | 説明なし |
| `comboGradient` | 説明なし |
| `bonusSeconds` | 説明なし |
| `stopSeconds` | 説明なし |
| `canvas` | 説明なし |
| `buttonX` | 説明なし |
| `buttonY` | 説明なし |
| `buttonWidth` | 説明なし |
| `buttonHeight` | 説明なし |
| `buttonGradient` | 説明なし |
| `canvas` | 説明なし |
| `buttonX` | 説明なし |
| `buttonY` | 説明なし |
| `buttonSize` | 説明なし |
| `canvas` | 説明なし |
| `panelX` | 説明なし |
| `panelY` | 説明なし |
| `panelWidth` | 説明なし |
| `panelHeight` | 説明なし |
| `lineHeight` | 説明なし |
| `bubbleCount` | 説明なし |
| `stageConfig` | 説明なし |
| `stageName` | 説明なし |
| `canvas` | 説明なし |
| `start` | 説明なし |
| `current` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `distance` | 説明なし |
| `forceRatio` | 説明なし |
| `red` | 説明なし |
| `green` | 説明なし |
| `angle` | 説明なし |
| `arrowLength` | 説明なし |
| `arrowAngle` | 説明なし |
| `bubble` | 説明なし |
| `particleCount` | 説明なし |
| `particleCount` | 説明なし |
| `pathLength` | 説明なし |
| `t` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `particleCount` | 説明なし |
| `angleStep` | 説明なし |
| `angle` | 説明なし |
| `radius` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `particleCount` | 説明なし |
| `angleStep` | 説明なし |
| `angle` | 説明なし |
| `speed` | 説明なし |
| `rings` | 説明なし |
| `delay` | 説明なし |
| `particleCount` | 説明なし |
| `angleStep` | 説明なし |
| `radius` | 説明なし |
| `angle` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `canvas` | 説明なし |
| `gameOverGradient` | 説明なし |
| `earnedAP` | 説明なし |
| `canvas` | 説明なし |
| `canvas` | 説明なし |
| `rect` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `giveUpButtonX` | 説明なし |
| `giveUpButtonY` | 説明なし |
| `giveUpButtonWidth` | 説明なし |
| `giveUpButtonHeight` | 説明なし |
| `infoButtonX` | 説明なし |
| `infoButtonY` | 説明なし |
| `infoButtonSize` | 説明なし |
| `distToInfo` | 説明なし |
| `finalScore` | 説明なし |
| `earnedAP` | 説明なし |
| `currentStage` | 説明なし |
| `stageId` | 説明なし |
| `currentHighScore` | 説明なし |

---

