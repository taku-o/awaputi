# Bubble

## 概要

ファイル: `bubbles/Bubble.js`  
最終更新: 2025/7/27 22:06:29

## 目次

## クラス
- [Bubble](#bubble)
## 定数
- [config](#config)
- [configManager](#configmanager)
- [health](#health)
- [size](#size)
- [maxAge](#maxage)
- [score](#score)
- [color](#color)
- [config](#config)
- [specialEffects](#specialeffects)
- [effects](#effects)
- [healAmount](#healamount)
- [damageAmount](#damageamount)
- [shakeIntensity](#shakeintensity)
- [disableDuration](#disableduration)
- [bonusTimeMs](#bonustimems)
- [timeStopMs](#timestopms)
- [bonusScore](#bonusscore)
- [chainRadius](#chainradius)
- [escapeSpeed](#escapespeed)
- [escapeRadius](#escaperadius)
- [configs](#configs)
- [config](#config)
- [dx](#dx)
- [dy](#dy)
- [distance](#distance)
- [normalizedX](#normalizedx)
- [normalizedY](#normalizedy)
- [margin](#margin)
- [canvasWidth](#canvaswidth)
- [canvasHeight](#canvasheight)
- [dampening](#dampening)
- [minVelocity](#minvelocity)
- [speed](#speed)
- [friction](#friction)
- [config](#config)
- [centerX](#centerx)
- [centerY](#centery)
- [ageRatio](#ageratio)
- [gradient](#gradient)
- [gradient](#gradient)
- [config](#config)
- [dx](#dx)
- [dy](#dy)
- [distance](#distance)
- [config](#config)
- [ageRatio](#ageratio)
- [dx](#dx)
- [dy](#dy)
- [distance](#distance)
- [escapeForce](#escapeforce)
- [effects](#effects)

---

## Bubble

### コンストラクタ

```javascript
new Bubble(type, position)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `type` | 説明なし |
| `position` | 説明なし |
| `velocity` | 説明なし |
| `size` | 説明なし |
| `health` | 説明なし |
| `maxHealth` | 説明なし |
| `age` | 説明なし |
| `maxAge` | 説明なし |
| `isAlive` | 10秒 |
| `effects` | 説明なし |
| `clickCount` | 説明なし |
| `health` | 説明なし |
| `maxHealth` | 説明なし |
| `size` | 説明なし |
| `maxAge` | 説明なし |
| `type` | 説明なし |
| `type` | 説明なし |
| `type` | 説明なし |
| `type` | 説明なし |
| `isAlive` | 説明なし |
| `isAlive` | 説明なし |
| `effects` | 説明なし |

### メソッド

#### applyTypeConfig

**シグネチャ**:
```javascript
 applyTypeConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyTypeConfig();

// applyTypeConfigの実用的な使用例
const result = instance.applyTypeConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTypeConfig

**シグネチャ**:
```javascript
 getTypeConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTypeConfig();

// getTypeConfigの実用的な使用例
const result = instance.getTypeConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

設定が見つかった場合はそれを使用

**シグネチャ**:
```javascript
 if (health !== null || size !== null || maxAge !== null || score !== null || color !== null)
```

**パラメーター**:
- `health !== null || size !== null || maxAge !== null || score !== null || color !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(health !== null || size !== null || maxAge !== null || score !== null || color !== null);

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

#### switch

**シグネチャ**:
```javascript
 switch (this.type)
```

**パラメーター**:
- `this.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(this.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### update

**シグネチャ**:
```javascript
 update(deltaTime, mousePosition = null)
```

**パラメーター**:
- `deltaTime`
- `mousePosition = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.update(deltaTime, mousePosition = null);

// フレーム更新処理
const deltaTime = 16.67; // 60FPS
instance.update(deltaTime);
```

#### if

逃げる泡の特殊行動

**シグネチャ**:
```javascript
 if (this.type === 'escaping' && mousePosition)
```

**パラメーター**:
- `this.type === 'escaping' && mousePosition`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.type === 'escaping' && mousePosition);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

年齢による危険度チェック

**シグネチャ**:
```javascript
 if (this.age >= this.maxAge)
```

**パラメーター**:
- `this.age >= this.maxAge`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.age >= this.maxAge);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleEscapingBehavior

**シグネチャ**:
```javascript
 handleEscapingBehavior(mousePosition, deltaTime)
```

**パラメーター**:
- `mousePosition`
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleEscapingBehavior(mousePosition, deltaTime);

// handleEscapingBehaviorの実用的な使用例
const result = instance.handleEscapingBehavior(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

マウスが近づいたら逃げる

**シグネチャ**:
```javascript
 if (distance < config.escapeRadius)
```

**パラメーター**:
- `distance < config.escapeRadius`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance < config.escapeRadius);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleBoundaryCollision

**シグネチャ**:
```javascript
 handleBoundaryCollision()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleBoundaryCollision();

// handleBoundaryCollisionの実用的な使用例
const result = instance.handleBoundaryCollision(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

左右の境界

**シグネチャ**:
```javascript
 if (this.position.x - margin <= 0)
```

**パラメーター**:
- `this.position.x - margin <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.position.x - margin <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.velocity.x < 0)
```

**パラメーター**:
- `this.velocity.x < 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.velocity.x < 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.position.x + margin >= canvasWidth)
```

**パラメーター**:
- `this.position.x + margin >= canvasWidth`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.position.x + margin >= canvasWidth);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.velocity.x > 0)
```

**パラメーター**:
- `this.velocity.x > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.velocity.x > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

上下の境界

**シグネチャ**:
```javascript
 if (this.position.y - margin <= 0)
```

**パラメーター**:
- `this.position.y - margin <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.position.y - margin <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.velocity.y < 0)
```

**パラメーター**:
- `this.velocity.y < 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.velocity.y < 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.position.y + margin >= canvasHeight)
```

**パラメーター**:
- `this.position.y + margin >= canvasHeight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.position.y + margin >= canvasHeight);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.velocity.y > 0)
```

**パラメーター**:
- `this.velocity.y > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.velocity.y > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

跳ね返り後の速度が小さすぎる場合は停止

**シグネチャ**:
```javascript
 if (bounced)
```

**パラメーター**:
- `bounced`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bounced);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (speed < minVelocity)
```

**パラメーター**:
- `speed < minVelocity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(speed < minVelocity);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

**シグネチャ**:
```javascript
 if (ageRatio > 0.7)
```

**パラメーター**:
- `ageRatio > 0.7`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ageRatio > 0.7);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

硬い泡の場合、耐久値を表示

**シグネチャ**:
```javascript
 if (this.type === 'stone' || this.type === 'iron' || this.type === 'diamond')
```

**パラメーター**:
- `this.type === 'stone' || this.type === 'iron' || this.type === 'diamond'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.type === 'stone' || this.type === 'iron' || this.type === 'diamond');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderSpecialIcon

**シグネチャ**:
```javascript
 renderSpecialIcon(context, centerX, centerY)
```

**パラメーター**:
- `context`
- `centerX`
- `centerY`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderSpecialIcon(context, centerX, centerY);

// renderSpecialIconの実用的な使用例
const result = instance.renderSpecialIcon(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (this.type)
```

**パラメーター**:
- `this.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(this.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### blendColors

**シグネチャ**:
```javascript
 blendColors(color1, color2, ratio)
```

**パラメーター**:
- `color1`
- `color2`
- `ratio`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.blendColors(color1, color2, ratio);

// blendColorsの実用的な使用例
const result = instance.blendColors(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### takeDamage

**シグネチャ**:
```javascript
 takeDamage(amount = 1)
```

**パラメーター**:
- `amount = 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.takeDamage(amount = 1);

// takeDamageの実用的な使用例
const result = instance.takeDamage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.health <= 0)
```

**パラメーター**:
- `this.health <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.health <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### destroy

**シグネチャ**:
```javascript
 destroy()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.destroy();

// リソースのクリーンアップ
instance.destroy();
console.log('Resources cleaned up');
```

#### burst

**シグネチャ**:
```javascript
 burst()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.burst();

// burstの実用的な使用例
const result = instance.burst(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### triggerSpecialEffect

**シグネチャ**:
```javascript
 triggerSpecialEffect()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.triggerSpecialEffect();

// triggerSpecialEffectの実用的な使用例
const result = instance.triggerSpecialEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (this.type)
```

**パラメーター**:
- `this.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(this.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### containsPoint

**シグネチャ**:
```javascript
 containsPoint(x, y)
```

**パラメーター**:
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.containsPoint(x, y);

// containsPointの実用的な使用例
const result = instance.containsPoint(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getScore

**シグネチャ**:
```javascript
 getScore()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getScore();

// getScoreの実用的な使用例
const result = instance.getScore(/* 適切なパラメータ */);
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

#### updateSpecialBehavior

**シグネチャ**:
```javascript
 updateSpecialBehavior(deltaTime, mousePosition)
```

**パラメーター**:
- `deltaTime`
- `mousePosition`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateSpecialBehavior(deltaTime, mousePosition);

// updateSpecialBehaviorの実用的な使用例
const result = instance.updateSpecialBehavior(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (this.type)
```

**パラメーター**:
- `this.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(this.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

逃げる泡：マウスから離れる動き

**シグネチャ**:
```javascript
 if (mousePosition)
```

**パラメーター**:
- `mousePosition`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(mousePosition);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance < 100 && distance > 0)
```

**パラメーター**:
- `distance < 100 && distance > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance < 100 && distance > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAndClearEffects

**シグネチャ**:
```javascript
 getAndClearEffects()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAndClearEffects();

// getAndClearEffectsの実用的な使用例
const result = instance.getAndClearEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `config` | 説明なし |
| `configManager` | 説明なし |
| `health` | 説明なし |
| `size` | 説明なし |
| `maxAge` | 説明なし |
| `score` | 説明なし |
| `color` | 説明なし |
| `config` | 説明なし |
| `specialEffects` | 説明なし |
| `effects` | 説明なし |
| `healAmount` | 説明なし |
| `damageAmount` | 説明なし |
| `shakeIntensity` | 説明なし |
| `disableDuration` | 説明なし |
| `bonusTimeMs` | 説明なし |
| `timeStopMs` | 説明なし |
| `bonusScore` | 説明なし |
| `chainRadius` | 説明なし |
| `escapeSpeed` | 説明なし |
| `escapeRadius` | 説明なし |
| `configs` | 説明なし |
| `config` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `distance` | 説明なし |
| `normalizedX` | 説明なし |
| `normalizedY` | 説明なし |
| `margin` | 説明なし |
| `canvasWidth` | 説明なし |
| `canvasHeight` | 説明なし |
| `dampening` | 説明なし |
| `minVelocity` | 説明なし |
| `speed` | 説明なし |
| `friction` | 説明なし |
| `config` | 説明なし |
| `centerX` | 説明なし |
| `centerY` | 説明なし |
| `ageRatio` | 説明なし |
| `gradient` | 説明なし |
| `gradient` | 説明なし |
| `config` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `distance` | 説明なし |
| `config` | 説明なし |
| `ageRatio` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `distance` | 説明なし |
| `escapeForce` | 説明なし |
| `effects` | 説明なし |

---

