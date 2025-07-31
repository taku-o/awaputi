# AnimationManager

## 概要

ファイル: `effects/AnimationManager.js`  
最終更新: 2025/7/30 0:29:15

## 目次

## クラス
- [AnimationManager](#animationmanager)
## 定数
- [animationConfig](#animationconfig)
- [animation](#animation)
- [animation](#animation)
- [animation](#animation)
- [baseValues](#basevalues)
- [baseValues](#basevalues)
- [animation](#animation)
- [scoreDiff](#scorediff)
- [animation](#animation)
- [baseValues](#basevalues)
- [slideDistance](#slidedistance)
- [baseValues](#basevalues)
- [slideDistance](#slidedistance)
- [animations](#animations)
- [exitAnimation](#exitanimation)
- [enterAnimation](#enteranimation)
- [direction](#direction)
- [direction](#direction)
- [centerX](#centerx)
- [centerY](#centery)
- [animation](#animation)
- [chainId](#chainid)
- [animations](#animations)
- [animation](#animation)
- [parallelId](#parallelid)
- [animations](#animations)
- [animation](#animation)
- [c1](#c1)
- [c3](#c3)
- [c1_2](#c1_2)
- [c3_2](#c3_2)
- [n1](#n1)
- [d1](#d1)
- [c4](#c4)
- [c4_2](#c4_2)
- [startTime](#starttime)
- [adjustedDeltaTime](#adjusteddeltatime)
- [progress](#progress)
- [easedProgress](#easedprogress)
- [start](#start)
- [end](#end)
- [target](#target)
- [spiralProgress](#spiralprogress)
- [start](#start)
- [end](#end)
- [target](#target)
- [start](#start)
- [end](#end)
- [target](#target)
- [midX](#midx)
- [midY](#midy)
- [t1](#t1)
- [t2](#t2)
- [start](#start)
- [end](#end)
- [target](#target)
- [pulse](#pulse)
- [shakeIntensity](#shakeintensity)
- [start](#start)
- [end](#end)
- [target](#target)
- [currentScore](#currentscore)
- [start](#start)
- [end](#end)
- [target](#target)
- [frameTime](#frametime)
- [activeCount](#activecount)
- [event](#event)
- [pos](#pos)
- [size](#size)
- [options](#options)
- [segments](#segments)
- [angle](#angle)
- [alpha](#alpha)
- [startRadius](#startradius)
- [endRadius](#endradius)
- [dotCount](#dotcount)
- [spacing](#spacing)
- [startX](#startx)
- [dotX](#dotx)
- [phase](#phase)
- [scale](#scale)
- [radius](#radius)
- [scale](#scale)
- [radius](#radius)
- [waveWidth](#wavewidth)
- [waveHeight](#waveheight)
- [segments](#segments)
- [x](#x)
- [y](#y)
- [animation](#animation)
- [animation](#animation)
- [baseId](#baseid)
- [hoverAnimation](#hoveranimation)
- [clickAnimation](#clickanimation)
- [focusAnimation](#focusanimation)
- [rippleAnimation](#rippleanimation)
- [sequenceId](#sequenceid)
- [animationIds](#animationids)
- [animationId](#animationid)
- [presets](#presets)
- [preset](#preset)
- [index](#index)
- [animation](#animation)
- [stoppedAnimations](#stoppedanimations)

---

## AnimationManager

### コンストラクタ

```javascript
new AnimationManager(canvas)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `canvas` | 説明なし |
| `animations` | 説明なし |
| `animationId` | 説明なし |
| `effectsConfig` | 設定システムとの連携 |
| `settings` | アニメーション設定 |
| `typeSettings` | アニメーションタイプ別設定 |
| `animationQueue` | キューイングシステム |
| `maxConcurrentAnimations` | 説明なし |
| `performanceMetrics` | パフォーマンス監視 |
| `animations` | アクティブなアニメーションを更新 |
| `animations` | 説明なし |
| `animations` | 説明なし |
| `animationQueue` | 説明なし |

### メソッド

#### if

**シグネチャ**:
```javascript
 if (animationConfig)
```

**パラメーター**:
- `animationConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(animationConfig);

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

#### animateBubbleSpawn

**シグネチャ**:
```javascript
 animateBubbleSpawn(bubble, spawnType = 'scale', options = {})
```

**パラメーター**:
- `bubble`
- `spawnType = 'scale'`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.animateBubbleSpawn(bubble, spawnType = 'scale', options = {});

// animateBubbleSpawnの実用的な使用例
const result = instance.animateBubbleSpawn(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.settings.enabled || !this.typeSettings.bubble.enabled)
```

**パラメーター**:
- `!this.settings.enabled || !this.typeSettings.bubble.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.settings.enabled || !this.typeSettings.bubble.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

遅延がある場合は遅延付きで開始

**シグネチャ**:
```javascript
 if (animation.options.delay > 0)
```

**パラメーター**:
- `animation.options.delay > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(animation.options.delay > 0);

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

#### animateBubbleDestroy

**シグネチャ**:
```javascript
 animateBubbleDestroy(bubble, destroyType = 'shrink', options = {})
```

**パラメーター**:
- `bubble`
- `destroyType = 'shrink'`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.animateBubbleDestroy(bubble, destroyType = 'shrink', options = {});

// animateBubbleDestroyの実用的な使用例
const result = instance.animateBubbleDestroy(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.settings.enabled || !this.typeSettings.bubble.enabled)
```

**パラメーター**:
- `!this.settings.enabled || !this.typeSettings.bubble.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.settings.enabled || !this.typeSettings.bubble.enabled);

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

#### animateBubbleMovement

**シグネチャ**:
```javascript
 animateBubbleMovement(bubble, targetPosition, duration = 1000, options = {})
```

**パラメーター**:
- `bubble`
- `targetPosition`
- `duration = 1000`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.animateBubbleMovement(bubble, targetPosition, duration = 1000, options = {});

// animateBubbleMovementの実用的な使用例
const result = instance.animateBubbleMovement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.settings.enabled || !this.typeSettings.bubble.enabled)
```

**パラメーター**:
- `!this.settings.enabled || !this.typeSettings.bubble.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.settings.enabled || !this.typeSettings.bubble.enabled);

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
 switch (animationType)
```

**パラメーター**:
- `animationType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(animationType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (destroyType)
```

**パラメーター**:
- `destroyType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(destroyType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### animateUIElement

**シグネチャ**:
```javascript
 animateUIElement(element, animationType, duration = 500, options = {})
```

**パラメーター**:
- `element`
- `animationType`
- `duration = 500`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.animateUIElement(element, animationType, duration = 500, options = {});

// animateUIElementの実用的な使用例
const result = instance.animateUIElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.settings.enabled || !this.typeSettings.ui.enabled)
```

**パラメーター**:
- `!this.settings.enabled || !this.typeSettings.ui.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.settings.enabled || !this.typeSettings.ui.enabled);

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

#### animateScoreChange

**シグネチャ**:
```javascript
 animateScoreChange(oldScore, newScore, element, duration = 1000, options = {})
```

**パラメーター**:
- `oldScore`
- `newScore`
- `element`
- `duration = 1000`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.animateScoreChange(oldScore, newScore, element, duration = 1000, options = {});

// animateScoreChangeの実用的な使用例
const result = instance.animateScoreChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.settings.enabled || !this.typeSettings.score.enabled)
```

**パラメーター**:
- `!this.settings.enabled || !this.typeSettings.score.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.settings.enabled || !this.typeSettings.score.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スコア増加時のスケールアニメーション

**シグネチャ**:
```javascript
 if (animation.options.animateScale && scoreDiff > 0)
```

**パラメーター**:
- `animation.options.animateScale && scoreDiff > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(animation.options.animateScale && scoreDiff > 0);

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
 switch (animationType)
```

**パラメーター**:
- `animationType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(animationType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (options.direction)
```

**パラメーター**:
- `options.direction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(options.direction);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (animationType)
```

**パラメーター**:
- `animationType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(animationType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (options.direction)
```

**パラメーター**:
- `options.direction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(options.direction);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### animateMenuTransition

**シグネチャ**:
```javascript
 animateMenuTransition(fromMenu, toMenu, transitionType = 'slide', options = {})
```

**パラメーター**:
- `fromMenu`
- `toMenu`
- `transitionType = 'slide'`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.animateMenuTransition(fromMenu, toMenu, transitionType = 'slide', options = {});

// animateMenuTransitionの実用的な使用例
const result = instance.animateMenuTransition(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.settings.enabled || !this.typeSettings.menu.enabled)
```

**パラメーター**:
- `!this.settings.enabled || !this.typeSettings.menu.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.settings.enabled || !this.typeSettings.menu.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

退出アニメーション

**シグネチャ**:
```javascript
 if (fromMenu)
```

**パラメーター**:
- `fromMenu`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fromMenu);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

入場アニメーション（遅延付き）

**シグネチャ**:
```javascript
 if (toMenu)
```

**パラメーター**:
- `toMenu`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(toMenu);

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
 switch (transitionType)
```

**パラメーター**:
- `transitionType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(transitionType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (direction)
```

**パラメーター**:
- `direction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(direction);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (transitionType)
```

**パラメーター**:
- `transitionType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(transitionType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (direction)
```

**パラメーター**:
- `direction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(direction);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createLoadingAnimation

**シグネチャ**:
```javascript
 createLoadingAnimation(type = 'spinner', position = null, size = 50, options = {})
```

**パラメーター**:
- `type = 'spinner'`
- `position = null`
- `size = 50`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createLoadingAnimation(type = 'spinner', position = null, size = 50, options = {});

// createLoadingAnimationの実用的な使用例
const result = instance.createLoadingAnimation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.settings.enabled || !this.typeSettings.loading.enabled)
```

**パラメーター**:
- `!this.settings.enabled || !this.typeSettings.loading.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.settings.enabled || !this.typeSettings.loading.enabled);

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

#### chainAnimations

**シグネチャ**:
```javascript
 chainAnimations(animationChain)
```

**パラメーター**:
- `animationChain`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.chainAnimations(animationChain);

// chainAnimationsの実用的な使用例
const result = instance.chainAnimations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(animation => {
            if (animation.options.delay > 0)
```

**パラメーター**:
- `animation => {
            if (animation.options.delay > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(animation => {
            if (animation.options.delay > 0);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runParallelAnimations

**シグネチャ**:
```javascript
 runParallelAnimations(animationList)
```

**パラメーター**:
- `animationList`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runParallelAnimations(animationList);

// runParallelAnimationsの実用的な使用例
const result = instance.runParallelAnimations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### ease

**シグネチャ**:
```javascript
 ease(t, type)
```

**パラメーター**:
- `t`
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.ease(t, type);

// easeの実用的な使用例
const result = instance.ease(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (t < 1 / d1)
```

**パラメーター**:
- `t < 1 / d1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(t < 1 / d1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (t < 2 / d1)
```

**パラメーター**:
- `t < 2 / d1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(t < 2 / d1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (t < 2.5 / d1)
```

**パラメーター**:
- `t < 2.5 / d1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(t < 2.5 / d1);

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
 if (!this.settings.enabled)
```

**パラメーター**:
- `!this.settings.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.settings.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### filter

**シグネチャ**:
```javascript
 filter(animation => {
            animation.elapsed += adjustedDeltaTime;
            
            if (animation.elapsed >= animation.duration && animation.duration !== Number.MAX_SAFE_INTEGER)
```

**パラメーター**:
- `animation => {
            animation.elapsed += adjustedDeltaTime;
            
            if (animation.elapsed >= animation.duration && animation.duration !== Number.MAX_SAFE_INTEGER`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.filter(animation => {
            animation.elapsed += adjustedDeltaTime;
            
            if (animation.elapsed >= animation.duration && animation.duration !== Number.MAX_SAFE_INTEGER);

// filterの実用的な使用例
const result = instance.filter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

アニメーションタイプ別更新

**シグネチャ**:
```javascript
 switch (animation.type)
```

**パラメーター**:
- `animation.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(animation.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

スポーンタイプ別の特殊処理

**シグネチャ**:
```javascript
 switch (animation.spawnType)
```

**パラメーター**:
- `animation.spawnType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(animation.spawnType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (progress < 0.5)
```

**パラメーター**:
- `progress < 0.5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(progress < 0.5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

破壊タイプ別の特殊処理

**シグネチャ**:
```javascript
 switch (animation.destroyType)
```

**パラメーター**:
- `animation.destroyType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(animation.destroyType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (animation.options.path)
```

**パラメーター**:
- `animation.options.path`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(animation.options.path);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

回転効果

**シグネチャ**:
```javascript
 if (animation.options.rotation)
```

**パラメーター**:
- `animation.options.rotation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(animation.options.rotation);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

アニメーションタイプ別の特殊処理

**シグネチャ**:
```javascript
 switch (animation.animationType)
```

**パラメーター**:
- `animation.animationType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(animation.animationType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (target.textContent !== undefined)
```

**パラメーター**:
- `target.textContent !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(target.textContent !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (target.score !== undefined)
```

**パラメーター**:
- `target.score !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(target.score !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

差分表示

**シグネチャ**:
```javascript
 if (animation.options.showDifference && animation.scoreDiff !== 0)
```

**パラメーター**:
- `animation.options.showDifference && animation.scoreDiff !== 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(animation.options.showDifference && animation.scoreDiff !== 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

ローディングタイプ別の状態更新

**シグネチャ**:
```javascript
 switch (animation.loadingType)
```

**パラメーター**:
- `animation.loadingType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(animation.loadingType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < animation.options.elements; i++)
```

**パラメーター**:
- `let i = 0; i < animation.options.elements; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < animation.options.elements; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最終値を確実に設定

**シグネチャ**:
```javascript
 if (animation.endValues && animation.target)
```

**パラメーター**:
- `animation.endValues && animation.target`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(animation.endValues && animation.target);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コールバック実行

**シグネチャ**:
```javascript
 if (animation.options && animation.options.onComplete)
```

**パラメーター**:
- `animation.options && animation.options.onComplete`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(animation.options && animation.options.onComplete);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フレーム時間が長すぎる場合は品質を下げる

**シグネチャ**:
```javascript
 if (frameTime > 16.67 && activeCount > 20)
```

**パラメーター**:
- `frameTime > 16.67 && activeCount > 20`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(frameTime > 16.67 && activeCount > 20);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

60FPS基準

**シグネチャ**:
```javascript
 if (this.settings.quality === 'ultra')
```

**パラメーター**:
- `this.settings.quality === 'ultra'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.settings.quality === 'ultra');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.settings.quality === 'high')
```

**パラメーター**:
- `this.settings.quality === 'high'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.settings.quality === 'high');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.settings.quality === 'medium')
```

**パラメーター**:
- `this.settings.quality === 'medium'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.settings.quality === 'medium');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パフォーマンスが良い場合は品質を上げる

**シグネチャ**:
```javascript
 if (frameTime < 8 && activeCount < 10)
```

**パラメーター**:
- `frameTime < 8 && activeCount < 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(frameTime < 8 && activeCount < 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.settings.quality === 'low')
```

**パラメーター**:
- `this.settings.quality === 'low'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.settings.quality === 'low');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.settings.quality === 'medium')
```

**パラメーター**:
- `this.settings.quality === 'medium'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.settings.quality === 'medium');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.settings.quality === 'high')
```

**パラメーター**:
- `this.settings.quality === 'high'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.settings.quality === 'high');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

カスタムイベントの実装

**シグネチャ**:
```javascript
 if (typeof window !== 'undefined' && window.dispatchEvent)
```

**パラメーター**:
- `typeof window !== 'undefined' && window.dispatchEvent`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof window !== 'undefined' && window.dispatchEvent);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderLoadingAnimation

**シグネチャ**:
```javascript
 renderLoadingAnimation(context, animation)
```

**パラメーター**:
- `context`
- `animation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderLoadingAnimation(context, animation);

// renderLoadingAnimationの実用的な使用例
const result = instance.renderLoadingAnimation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (animation.loadingType)
```

**パラメーター**:
- `animation.loadingType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(animation.loadingType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < segments; i++)
```

**パラメーター**:
- `let i = 0; i < segments; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < segments; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < dotCount; i++)
```

**パラメーター**:
- `let i = 0; i < dotCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < dotCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i <= segments; i++)
```

**パラメーター**:
- `let i = 0; i <= segments; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i <= segments; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (i === 0)
```

**パラメーター**:
- `i === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(i === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createProgressLoadingAnimation

**シグネチャ**:
```javascript
 createProgressLoadingAnimation(position, size, options = {})
```

**パラメーター**:
- `position`
- `size`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createProgressLoadingAnimation(position, size, options = {});

// createProgressLoadingAnimationの実用的な使用例
const result = instance.createProgressLoadingAnimation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateLoadingProgress

**シグネチャ**:
```javascript
 updateLoadingProgress(animationId, progress)
```

**パラメーター**:
- `animationId`
- `progress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateLoadingProgress(animationId, progress);

// updateLoadingProgressの実用的な使用例
const result = instance.updateLoadingProgress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (animation && animation.loadingType === 'progress')
```

**パラメーター**:
- `animation && animation.loadingType === 'progress'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(animation && animation.loadingType === 'progress');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

100%完了時の特別アニメーション

**シグネチャ**:
```javascript
 if (animation.options.progress >= 1 && !animation.completionTriggered)
```

**パラメーター**:
- `animation.options.progress >= 1 && !animation.completionTriggered`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(animation.options.progress >= 1 && !animation.completionTriggered);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addInteractiveAnimation

**シグネチャ**:
```javascript
 addInteractiveAnimation(element, interactionType, options = {})
```

**パラメーター**:
- `element`
- `interactionType`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addInteractiveAnimation(element, interactionType, options = {});

// addInteractiveAnimationの実用的な使用例
const result = instance.addInteractiveAnimation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (interactionType)
```

**パラメーター**:
- `interactionType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(interactionType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!hoverAnimation.isActive)
```

**パラメーター**:
- `!hoverAnimation.isActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!hoverAnimation.isActive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (hoverAnimation.isActive)
```

**パラメーター**:
- `hoverAnimation.isActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hoverAnimation.isActive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

リップル効果

**シグネチャ**:
```javascript
 if (clickAnimation.options.rippleEffect && clickPosition)
```

**パラメーター**:
- `clickAnimation.options.rippleEffect && clickPosition`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(clickAnimation.options.rippleEffect && clickPosition);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!focusAnimation.isActive)
```

**パラメーター**:
- `!focusAnimation.isActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!focusAnimation.isActive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (focusAnimation.options.focusGlow)
```

**パラメーター**:
- `focusAnimation.options.focusGlow`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(focusAnimation.options.focusGlow);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (focusAnimation.isActive)
```

**パラメーター**:
- `focusAnimation.isActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(focusAnimation.isActive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (element.focusGlow)
```

**パラメーター**:
- `element.focusGlow`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(element.focusGlow);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createAnimationSequence

**シグネチャ**:
```javascript
 createAnimationSequence(sequenceConfig)
```

**パラメーター**:
- `sequenceConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createAnimationSequence(sequenceConfig);

// createAnimationSequenceの実用的な使用例
const result = instance.createAnimationSequence(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyAnimationPreset

**シグネチャ**:
```javascript
 applyAnimationPreset(target, presetName, options = {})
```

**パラメーター**:
- `target`
- `presetName`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyAnimationPreset(target, presetName, options = {});

// applyAnimationPresetの実用的な使用例
const result = instance.applyAnimationPreset(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!preset)
```

**パラメーター**:
- `!preset`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!preset);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stopAnimation

**シグネチャ**:
```javascript
 stopAnimation(animationId)
```

**パラメーター**:
- `animationId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopAnimation(animationId);

// stopAnimationの実用的な使用例
const result = instance.stopAnimation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (index !== -1)
```

**パラメーター**:
- `index !== -1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(index !== -1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stopAllAnimations

**シグネチャ**:
```javascript
 stopAllAnimations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopAllAnimations();

// stopAllAnimationsの実用的な使用例
const result = instance.stopAllAnimations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stopAnimationsByType

**シグネチャ**:
```javascript
 stopAnimationsByType(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopAnimationsByType(type);

// stopAnimationsByTypeの実用的な使用例
const result = instance.stopAnimationsByType(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateSettings

**シグネチャ**:
```javascript
 updateSettings(newSettings)
```

**パラメーター**:
- `newSettings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateSettings(newSettings);

// updateSettingsの実用的な使用例
const result = instance.updateSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateTypeSettings

**シグネチャ**:
```javascript
 updateTypeSettings(type, settings)
```

**パラメーター**:
- `type`
- `settings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateTypeSettings(type, settings);

// updateTypeSettingsの実用的な使用例
const result = instance.updateTypeSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.typeSettings[type])
```

**パラメーター**:
- `this.typeSettings[type]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.typeSettings[type]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getPerformanceMetrics

**シグネチャ**:
```javascript
 getPerformanceMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getPerformanceMetrics();

// getPerformanceMetricsの実用的な使用例
const result = instance.getPerformanceMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getActiveAnimationCount

**シグネチャ**:
```javascript
 getActiveAnimationCount()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getActiveAnimationCount();

// getActiveAnimationCountの実用的な使用例
const result = instance.getActiveAnimationCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAnimationCountByType

**シグネチャ**:
```javascript
 getAnimationCountByType(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAnimationCountByType(type);

// getAnimationCountByTypeの実用的な使用例
const result = instance.getAnimationCountByType(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### dispose

**シグネチャ**:
```javascript
 dispose()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.dispose();

// disposeの実用的な使用例
const result = instance.dispose(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `animationConfig` | 説明なし |
| `animation` | 説明なし |
| `animation` | 説明なし |
| `animation` | 説明なし |
| `baseValues` | 説明なし |
| `baseValues` | 説明なし |
| `animation` | 説明なし |
| `scoreDiff` | 説明なし |
| `animation` | 説明なし |
| `baseValues` | 説明なし |
| `slideDistance` | 説明なし |
| `baseValues` | 説明なし |
| `slideDistance` | 説明なし |
| `animations` | 説明なし |
| `exitAnimation` | 説明なし |
| `enterAnimation` | 説明なし |
| `direction` | 説明なし |
| `direction` | 説明なし |
| `centerX` | 説明なし |
| `centerY` | 説明なし |
| `animation` | 説明なし |
| `chainId` | 説明なし |
| `animations` | 説明なし |
| `animation` | 説明なし |
| `parallelId` | 説明なし |
| `animations` | 説明なし |
| `animation` | 説明なし |
| `c1` | 説明なし |
| `c3` | 説明なし |
| `c1_2` | 説明なし |
| `c3_2` | 説明なし |
| `n1` | 説明なし |
| `d1` | 説明なし |
| `c4` | 説明なし |
| `c4_2` | 説明なし |
| `startTime` | 説明なし |
| `adjustedDeltaTime` | 説明なし |
| `progress` | 説明なし |
| `easedProgress` | 説明なし |
| `start` | 説明なし |
| `end` | 説明なし |
| `target` | 説明なし |
| `spiralProgress` | 説明なし |
| `start` | 説明なし |
| `end` | 説明なし |
| `target` | 説明なし |
| `start` | 説明なし |
| `end` | 説明なし |
| `target` | 説明なし |
| `midX` | 説明なし |
| `midY` | 説明なし |
| `t1` | 説明なし |
| `t2` | 説明なし |
| `start` | 説明なし |
| `end` | 説明なし |
| `target` | 説明なし |
| `pulse` | 説明なし |
| `shakeIntensity` | 説明なし |
| `start` | 説明なし |
| `end` | 説明なし |
| `target` | 説明なし |
| `currentScore` | 説明なし |
| `start` | 説明なし |
| `end` | 説明なし |
| `target` | 説明なし |
| `frameTime` | 説明なし |
| `activeCount` | 説明なし |
| `event` | 説明なし |
| `pos` | 説明なし |
| `size` | 説明なし |
| `options` | 説明なし |
| `segments` | 説明なし |
| `angle` | 説明なし |
| `alpha` | 説明なし |
| `startRadius` | 説明なし |
| `endRadius` | 説明なし |
| `dotCount` | 説明なし |
| `spacing` | 説明なし |
| `startX` | 説明なし |
| `dotX` | 説明なし |
| `phase` | 説明なし |
| `scale` | 説明なし |
| `radius` | 説明なし |
| `scale` | 説明なし |
| `radius` | 説明なし |
| `waveWidth` | 説明なし |
| `waveHeight` | 説明なし |
| `segments` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `animation` | 説明なし |
| `animation` | 説明なし |
| `baseId` | 説明なし |
| `hoverAnimation` | 説明なし |
| `clickAnimation` | 説明なし |
| `focusAnimation` | 説明なし |
| `rippleAnimation` | 説明なし |
| `sequenceId` | 説明なし |
| `animationIds` | 説明なし |
| `animationId` | 説明なし |
| `presets` | 説明なし |
| `preset` | 説明なし |
| `index` | 説明なし |
| `animation` | 説明なし |
| `stoppedAnimations` | 説明なし |

---

