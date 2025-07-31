# EffectManager

## 概要

ファイル: `effects/EffectManager.js`  
最終更新: 2025/7/26 20:49:00

## 目次

## クラス
- [EffectManager](#effectmanager)
## 定数
- [configManager](#configmanager)
- [shakeWatcher](#shakewatcher)
- [flashWatcher](#flashwatcher)
- [zoomWatcher](#zoomwatcher)
- [enabledWatcher](#enabledwatcher)
- [screenConfig](#screenconfig)
- [params](#params)
- [adjustedIntensity](#adjustedintensity)
- [configDuration](#configduration)
- [effect](#effect)
- [params](#params)
- [adjustedIntensity](#adjustedintensity)
- [configDuration](#configduration)
- [effect](#effect)
- [params](#params)
- [adjustedIntensity](#adjustedintensity)
- [configDuration](#configduration)
- [effect](#effect)
- [params](#params)
- [adjustedZoom](#adjustedzoom)
- [clampedZoom](#clampedzoom)
- [effect](#effect)
- [effect](#effect)
- [effect](#effect)
- [hex](#hex)
- [progress](#progress)
- [easedProgress](#easedprogress)
- [intensity](#intensity)
- [time](#time)
- [alpha](#alpha)
- [zoom](#zoom)
- [rotation](#rotation)
- [blur](#blur)
- [totalAlpha](#totalalpha)
- [centerX](#centerx)
- [centerY](#centery)
- [canvas](#canvas)
- [params](#params)

---

## EffectManager

### コンストラクタ

```javascript
new EffectManager(canvas)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `canvas` | 説明なし |
| `effects` | 説明なし |
| `effectId` | 説明なし |
| `effectsConfig` | 設定システムとの連携 |
| `configWatchers` | 説明なし |
| `currentTransform` | 現在の変換状態 |
| `transforms` | 効果の積算用 |
| `effects` | 効果を更新 |
| `effects` | 説明なし |
| `effects` | 説明なし |
| `currentTransform` | 説明なし |

### メソッド

#### if

**シグネチャ**:
```javascript
 if (!newValue)
```

**パラメーター**:
- `!newValue`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!newValue);

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

effectsConfigが無効な場合はnullを返す

**シグネチャ**:
```javascript
 if (!this.effectsConfig)
```

**パラメーター**:
- `!this.effectsConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.effectsConfig);

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

#### addScreenShake

**シグネチャ**:
```javascript
 addScreenShake(intensity, duration, type = 'random')
```

**パラメーター**:
- `intensity`
- `duration`
- `type = 'random'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addScreenShake(intensity, duration, type = 'random');

// addScreenShakeの実用的な使用例
const result = instance.addScreenShake(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

設定が取得できない場合は何もしない

**シグネチャ**:
```javascript
 if (!params)
```

**パラメーター**:
- `!params`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!params);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

画面効果が無効な場合は何もしない

**シグネチャ**:
```javascript
 if (!params.enabled)
```

**パラメーター**:
- `!params.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!params.enabled);

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

#### addFlash

**シグネチャ**:
```javascript
 addFlash(color, intensity, duration, fadeType = 'out')
```

**パラメーター**:
- `color`
- `intensity`
- `duration`
- `fadeType = 'out'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addFlash(color, intensity, duration, fadeType = 'out');

// addFlashの実用的な使用例
const result = instance.addFlash(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

設定が取得できない場合は何もしない

**シグネチャ**:
```javascript
 if (!params)
```

**パラメーター**:
- `!params`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!params);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

画面効果が無効な場合は何もしない

**シグネチャ**:
```javascript
 if (!params.enabled)
```

**パラメーター**:
- `!params.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!params.enabled);

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

#### addTint

**シグネチャ**:
```javascript
 addTint(color, intensity, duration, easing = 'linear')
```

**パラメーター**:
- `color`
- `intensity`
- `duration`
- `easing = 'linear'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addTint(color, intensity, duration, easing = 'linear');

// addTintの実用的な使用例
const result = instance.addTint(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

設定が取得できない場合は何もしない

**シグネチャ**:
```javascript
 if (!params)
```

**パラメーター**:
- `!params`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!params);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

画面効果が無効な場合は何もしない

**シグネチャ**:
```javascript
 if (!params.enabled)
```

**パラメーター**:
- `!params.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!params.enabled);

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

#### addZoom

**シグネチャ**:
```javascript
 addZoom(targetZoom, duration, easing = 'easeOut')
```

**パラメーター**:
- `targetZoom`
- `duration`
- `easing = 'easeOut'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addZoom(targetZoom, duration, easing = 'easeOut');

// addZoomの実用的な使用例
const result = instance.addZoom(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

設定が取得できない場合は何もしない

**シグネチャ**:
```javascript
 if (!params)
```

**パラメーター**:
- `!params`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!params);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

画面効果が無効な場合は何もしない

**シグネチャ**:
```javascript
 if (!params.enabled)
```

**パラメーター**:
- `!params.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!params.enabled);

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

#### addRotation

**シグネチャ**:
```javascript
 addRotation(angle, duration, easing = 'linear')
```

**パラメーター**:
- `angle`
- `duration`
- `easing = 'linear'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addRotation(angle, duration, easing = 'linear');

// addRotationの実用的な使用例
const result = instance.addRotation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addBlur

**シグネチャ**:
```javascript
 addBlur(intensity, duration, easing = 'easeInOut')
```

**パラメーター**:
- `intensity`
- `duration`
- `easing = 'easeInOut'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addBlur(intensity, duration, easing = 'easeInOut');

// addBlurの実用的な使用例
const result = instance.addBlur(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addTimeStopEffect

**シグネチャ**:
```javascript
 addTimeStopEffect(duration)
```

**パラメーター**:
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addTimeStopEffect(duration);

// addTimeStopEffectの実用的な使用例
const result = instance.addTimeStopEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addBonusTimeEffect

**シグネチャ**:
```javascript
 addBonusTimeEffect(duration)
```

**パラメーター**:
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addBonusTimeEffect(duration);

// addBonusTimeEffectの実用的な使用例
const result = instance.addBonusTimeEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

パルスズーム

**シグネチャ**:
```javascript
 for (let i = 0; i < duration / 1000; i++)
```

**パラメーター**:
- `let i = 0; i < duration / 1000; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < duration / 1000; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addExplosionEffect

**シグネチャ**:
```javascript
 addExplosionEffect(x, y, intensity = 1)
```

**パラメーター**:
- `x`
- `y`
- `intensity = 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addExplosionEffect(x, y, intensity = 1);

// addExplosionEffectの実用的な使用例
const result = instance.addExplosionEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addDamageEffect

**シグネチャ**:
```javascript
 addDamageEffect()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addDamageEffect();

// addDamageEffectの実用的な使用例
const result = instance.addDamageEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addHealEffect

**シグネチャ**:
```javascript
 addHealEffect()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addHealEffect();

// addHealEffectの実用的な使用例
const result = instance.addHealEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addElectricEffect

**シグネチャ**:
```javascript
 addElectricEffect()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addElectricEffect();

// addElectricEffectの実用的な使用例
const result = instance.addElectricEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

黄色いフラッシュ（点滅）

**シグネチャ**:
```javascript
 for (let i = 0; i < 4; i++)
```

**パラメーター**:
- `let i = 0; i < 4; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 4; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### parseColor

**シグネチャ**:
```javascript
 parseColor(color)
```

**パラメーター**:
- `color`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.parseColor(color);

// parseColorの実用的な使用例
const result = instance.parseColor(/* 適切なパラメータ */);
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
 if (t < 1 / 2.75)
```

**パラメーター**:
- `t < 1 / 2.75`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(t < 1 / 2.75);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (t < 2 / 2.75)
```

**パラメーター**:
- `t < 2 / 2.75`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(t < 2 / 2.75);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (t < 2.5 / 2.75)
```

**パラメーター**:
- `t < 2.5 / 2.75`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(t < 2.5 / 2.75);

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

#### for

各変換配列をクリア

**シグネチャ**:
```javascript
 for (const key in this.transforms)
```

**パラメーター**:
- `const key in this.transforms`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const key in this.transforms);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### filter

**シグネチャ**:
```javascript
 filter(effect => {
            effect.elapsed += deltaTime;
            
            if (effect.elapsed >= effect.duration)
```

**パラメーター**:
- `effect => {
            effect.elapsed += deltaTime;
            
            if (effect.elapsed >= effect.duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.filter(effect => {
            effect.elapsed += deltaTime;
            
            if (effect.elapsed >= effect.duration);

// filterの実用的な使用例
const result = instance.filter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateEffect

**シグネチャ**:
```javascript
 updateEffect(effect, progress)
```

**パラメーター**:
- `effect`
- `progress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateEffect(effect, progress);

// updateEffectの実用的な使用例
const result = instance.updateEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (effect.type)
```

**パラメーター**:
- `effect.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(effect.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateShakeEffect

**シグネチャ**:
```javascript
 updateShakeEffect(effect, progress)
```

**パラメーター**:
- `effect`
- `progress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateShakeEffect(effect, progress);

// updateShakeEffectの実用的な使用例
const result = instance.updateShakeEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (effect.shakeType)
```

**パラメーター**:
- `effect.shakeType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(effect.shakeType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateFlashEffect

**シグネチャ**:
```javascript
 updateFlashEffect(effect, progress)
```

**パラメーター**:
- `effect`
- `progress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateFlashEffect(effect, progress);

// updateFlashEffectの実用的な使用例
const result = instance.updateFlashEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (effect.fadeType)
```

**パラメーター**:
- `effect.fadeType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(effect.fadeType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateTintEffect

**シグネチャ**:
```javascript
 updateTintEffect(effect, progress)
```

**パラメーター**:
- `effect`
- `progress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateTintEffect(effect, progress);

// updateTintEffectの実用的な使用例
const result = instance.updateTintEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateZoomEffect

**シグネチャ**:
```javascript
 updateZoomEffect(effect, progress)
```

**パラメーター**:
- `effect`
- `progress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateZoomEffect(effect, progress);

// updateZoomEffectの実用的な使用例
const result = instance.updateZoomEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateRotationEffect

**シグネチャ**:
```javascript
 updateRotationEffect(effect, progress)
```

**パラメーター**:
- `effect`
- `progress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateRotationEffect(effect, progress);

// updateRotationEffectの実用的な使用例
const result = instance.updateRotationEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateBlurEffect

**シグネチャ**:
```javascript
 updateBlurEffect(effect, progress)
```

**パラメーター**:
- `effect`
- `progress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateBlurEffect(effect, progress);

// updateBlurEffectの実用的な使用例
const result = instance.updateBlurEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateFinalTransform

**シグネチャ**:
```javascript
 calculateFinalTransform()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateFinalTransform();

// calculateFinalTransformの実用的な使用例
const result = instance.calculateFinalTransform(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyTransform

**シグネチャ**:
```javascript
 applyTransform(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyTransform(context);

// applyTransformの実用的な使用例
const result = instance.applyTransform(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ぼかし効果

**シグネチャ**:
```javascript
 if (this.currentTransform.blur > 0)
```

**パラメーター**:
- `this.currentTransform.blur > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentTransform.blur > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderOverlays

**シグネチャ**:
```javascript
 renderOverlays(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderOverlays(context);

// renderOverlaysの実用的な使用例
const result = instance.renderOverlays(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

色調オーバーレイ

**シグネチャ**:
```javascript
 if (this.currentTransform.tint.a > 0)
```

**パラメーター**:
- `this.currentTransform.tint.a > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentTransform.tint.a > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フラッシュオーバーレイ

**シグネチャ**:
```javascript
 if (this.currentTransform.flash.a > 0)
```

**パラメーター**:
- `this.currentTransform.flash.a > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentTransform.flash.a > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetTransform

**シグネチャ**:
```javascript
 resetTransform(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetTransform(context);

// resetTransformの実用的な使用例
const result = instance.resetTransform(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### removeEffect

**シグネチャ**:
```javascript
 removeEffect(effectId)
```

**パラメーター**:
- `effectId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeEffect(effectId);

// removeEffectの実用的な使用例
const result = instance.removeEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearEffects

**シグネチャ**:
```javascript
 clearEffects()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearEffects();

// clearEffectsの実用的な使用例
const result = instance.clearEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentTransform

**シグネチャ**:
```javascript
 getCurrentTransform()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentTransform();

// getCurrentTransformの実用的な使用例
const result = instance.getCurrentTransform(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getActiveEffectCount

**シグネチャ**:
```javascript
 getActiveEffectCount()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getActiveEffectCount();

// getActiveEffectCountの実用的な使用例
const result = instance.getActiveEffectCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderPreEffects

**シグネチャ**:
```javascript
 renderPreEffects(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderPreEffects(context);

// renderPreEffectsの実用的な使用例
const result = instance.renderPreEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderPostEffects

**シグネチャ**:
```javascript
 renderPostEffects(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderPostEffects(context);

// renderPostEffectsの実用的な使用例
const result = instance.renderPostEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearAllEffects

**シグネチャ**:
```javascript
 clearAllEffects()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearAllEffects();

// clearAllEffectsの実用的な使用例
const result = instance.clearAllEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateConfiguration

**シグネチャ**:
```javascript
 updateConfiguration()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateConfiguration();

// updateConfigurationの実用的な使用例
const result = instance.updateConfiguration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

画面効果が無効になった場合、全ての効果をクリア

**シグネチャ**:
```javascript
 if (!params.enabled)
```

**パラメーター**:
- `!params.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!params.enabled);

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

#### setConfigValue

**シグネチャ**:
```javascript
 setConfigValue(key, value)
```

**パラメーター**:
- `key`
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setConfigValue(key, value);

// setConfigValueの実用的な使用例
const result = instance.setConfigValue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (key)
```

**パラメーター**:
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(key);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
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

#### getConfigValue

**シグネチャ**:
```javascript
 getConfigValue(key)
```

**パラメーター**:
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getConfigValue(key);

// getConfigValueの実用的な使用例
const result = instance.getConfigValue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (key)
```

**パラメーター**:
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(key);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
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

#### applyConfiguration

**シグネチャ**:
```javascript
 applyConfiguration()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyConfiguration();

// applyConfigurationの実用的な使用例
const result = instance.applyConfiguration(/* 適切なパラメータ */);
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

#### for

設定監視の解除

**シグネチャ**:
```javascript
 for (const [key, watcher] of this.configWatchers)
```

**パラメーター**:
- `const [key`
- `watcher] of this.configWatchers`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [key, watcher] of this.configWatchers);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (watcher && typeof watcher.unwatch === 'function')
```

**パラメーター**:
- `watcher && typeof watcher.unwatch === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(watcher && typeof watcher.unwatch === 'function');

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

#### addScreenFlash

**シグネチャ**:
```javascript
 addScreenFlash(intensity, duration, color = '#FFFFFF')
```

**パラメーター**:
- `intensity`
- `duration`
- `color = '#FFFFFF'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addScreenFlash(intensity, duration, color = '#FFFFFF');

// addScreenFlashの実用的な使用例
const result = instance.addScreenFlash(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addScreenTint

**シグネチャ**:
```javascript
 addScreenTint(intensity, duration, color = '#FFFFFF')
```

**パラメーター**:
- `intensity`
- `duration`
- `color = '#FFFFFF'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addScreenTint(intensity, duration, color = '#FFFFFF');

// addScreenTintの実用的な使用例
const result = instance.addScreenTint(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addVignette

**シグネチャ**:
```javascript
 addVignette(intensity, duration)
```

**パラメーター**:
- `intensity`
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addVignette(intensity, duration);

// addVignetteの実用的な使用例
const result = instance.addVignette(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `configManager` | 説明なし |
| `shakeWatcher` | 説明なし |
| `flashWatcher` | 説明なし |
| `zoomWatcher` | 説明なし |
| `enabledWatcher` | 説明なし |
| `screenConfig` | 説明なし |
| `params` | 説明なし |
| `adjustedIntensity` | 説明なし |
| `configDuration` | 説明なし |
| `effect` | 説明なし |
| `params` | 説明なし |
| `adjustedIntensity` | 説明なし |
| `configDuration` | 説明なし |
| `effect` | 説明なし |
| `params` | 説明なし |
| `adjustedIntensity` | 説明なし |
| `configDuration` | 説明なし |
| `effect` | 説明なし |
| `params` | 説明なし |
| `adjustedZoom` | 説明なし |
| `clampedZoom` | 説明なし |
| `effect` | 説明なし |
| `effect` | 説明なし |
| `effect` | 説明なし |
| `hex` | 説明なし |
| `progress` | 説明なし |
| `easedProgress` | 説明なし |
| `intensity` | 説明なし |
| `time` | 説明なし |
| `alpha` | 説明なし |
| `zoom` | 説明なし |
| `rotation` | 説明なし |
| `blur` | 説明なし |
| `totalAlpha` | 説明なし |
| `centerX` | 説明なし |
| `centerY` | 説明なし |
| `canvas` | 説明なし |
| `params` | 説明なし |

---

