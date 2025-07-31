# SpecialEffectRenderer

## 概要

ファイル: `effects/renderers/SpecialEffectRenderer.js`  
最終更新: 2025/7/30 0:29:15

## 目次

## クラス
- [SpecialEffectRenderer](#specialeffectrenderer)
## 定数
- [effectConfig](#effectconfig)
- [adjustedCount](#adjustedcount)
- [intensityMultiplier](#intensitymultiplier)
- [particle](#particle)
- [angle](#angle)
- [speed](#speed)
- [distance](#distance)
- [adjustedCount](#adjustedcount)
- [particle](#particle)
- [angle](#angle)
- [startRadius](#startradius)
- [speed](#speed)
- [adjustedCount](#adjustedcount)
- [particle](#particle)
- [angle](#angle)
- [radius](#radius)
- [spiralSpeed](#spiralspeed)
- [adjustedCount](#adjustedcount)
- [particle](#particle)
- [angle](#angle)
- [speed](#speed)
- [adjustedCount](#adjustedcount)
- [ringRadius](#ringradius)
- [ringParticles](#ringparticles)
- [particle](#particle)
- [angle](#angle)
- [radius](#radius)
- [particle](#particle)
- [particle](#particle)
- [particle](#particle)
- [angle](#angle)
- [distance](#distance)
- [adjustedCount](#adjustedcount)
- [particle](#particle)
- [angle](#angle)
- [speed](#speed)
- [config](#config)
- [simpleCount](#simplecount)
- [particle](#particle)
- [angle](#angle)
- [speed](#speed)

---

## SpecialEffectRenderer

### コンストラクタ

```javascript
new SpecialEffectRenderer(particleManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `particleManager` | 説明なし |
| `specialEffects` | 特殊効果の定義 |

### メソッド

#### createSpecialEffect

**シグネチャ**:
```javascript
 createSpecialEffect(x, y, effectType, intensity = 1.0)
```

**パラメーター**:
- `x`
- `y`
- `effectType`
- `intensity = 1.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSpecialEffect(x, y, effectType, intensity = 1.0);

// createSpecialEffectの実用的な使用例
const result = instance.createSpecialEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!effectConfig)
```

**パラメーター**:
- `!effectConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!effectConfig);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

効果タイプ別の処理

**シグネチャ**:
```javascript
 switch (effectType)
```

**パラメーター**:
- `effectType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(effectType);

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

#### createExplosionEffect

**シグネチャ**:
```javascript
 createExplosionEffect(x, y, intensity, config)
```

**パラメーター**:
- `x`
- `y`
- `intensity`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createExplosionEffect(x, y, intensity, config);

// createExplosionEffectの実用的な使用例
const result = instance.createExplosionEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < adjustedCount; i++)
```

**パラメーター**:
- `let i = 0; i < adjustedCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < adjustedCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createImplosionEffect

**シグネチャ**:
```javascript
 createImplosionEffect(x, y, intensity, config)
```

**パラメーター**:
- `x`
- `y`
- `intensity`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createImplosionEffect(x, y, intensity, config);

// createImplosionEffectの実用的な使用例
const result = instance.createImplosionEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

第一段階: 外側から内側へ収束

**シグネチャ**:
```javascript
 for (let i = 0; i < adjustedCount; i++)
```

**パラメーター**:
- `let i = 0; i < adjustedCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < adjustedCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createVortexEffect

**シグネチャ**:
```javascript
 createVortexEffect(x, y, intensity, config)
```

**パラメーター**:
- `x`
- `y`
- `intensity`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createVortexEffect(x, y, intensity, config);

// createVortexEffectの実用的な使用例
const result = instance.createVortexEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < adjustedCount; i++)
```

**パラメーター**:
- `let i = 0; i < adjustedCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < adjustedCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createEnergyDischargeEffect

**シグネチャ**:
```javascript
 createEnergyDischargeEffect(x, y, intensity, config)
```

**パラメーター**:
- `x`
- `y`
- `intensity`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createEnergyDischargeEffect(x, y, intensity, config);

// createEnergyDischargeEffectの実用的な使用例
const result = instance.createEnergyDischargeEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

ランダムな方向へのエネルギー放射

**シグネチャ**:
```javascript
 for (let i = 0; i < adjustedCount; i++)
```

**パラメーター**:
- `let i = 0; i < adjustedCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < adjustedCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createMagicCircleEffect

**シグネチャ**:
```javascript
 createMagicCircleEffect(x, y, intensity, config)
```

**パラメーター**:
- `x`
- `y`
- `intensity`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createMagicCircleEffect(x, y, intensity, config);

// createMagicCircleEffectの実用的な使用例
const result = instance.createMagicCircleEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

複数の同心円を作成

**シグネチャ**:
```javascript
 for (let ring = 0; ring < 3; ring++)
```

**パラメーター**:
- `let ring = 0; ring < 3; ring++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let ring = 0; ring < 3; ring++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < ringParticles; i++)
```

**パラメーター**:
- `let i = 0; i < ringParticles; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < ringParticles; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createCenterFlash

**シグネチャ**:
```javascript
 createCenterFlash(x, y, intensity)
```

**パラメーター**:
- `x`
- `y`
- `intensity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createCenterFlash(x, y, intensity);

// createCenterFlashの実用的な使用例
const result = instance.createCenterFlash(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createEnergyCore

**シグネチャ**:
```javascript
 createEnergyCore(x, y, intensity, color)
```

**パラメーター**:
- `x`
- `y`
- `intensity`
- `color`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createEnergyCore(x, y, intensity, color);

// createEnergyCoreの実用的な使用例
const result = instance.createEnergyCore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < 3; i++)
```

**パラメーター**:
- `let i = 0; i < 3; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 3; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createMagicSymbols

**シグネチャ**:
```javascript
 createMagicSymbols(x, y, intensity, colors)
```

**パラメーター**:
- `x`
- `y`
- `intensity`
- `colors`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createMagicSymbols(x, y, intensity, colors);

// createMagicSymbolsの実用的な使用例
const result = instance.createMagicSymbols(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < 6; i++)
```

**パラメーター**:
- `let i = 0; i < 6; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 6; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createGenericSpecialEffect

**シグネチャ**:
```javascript
 createGenericSpecialEffect(x, y, effectType, intensity, config)
```

**パラメーター**:
- `x`
- `y`
- `effectType`
- `intensity`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createGenericSpecialEffect(x, y, effectType, intensity, config);

// createGenericSpecialEffectの実用的な使用例
const result = instance.createGenericSpecialEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < adjustedCount; i++)
```

**パラメーター**:
- `let i = 0; i < adjustedCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < adjustedCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createSimplifiedSpecialEffect

**シグネチャ**:
```javascript
 createSimplifiedSpecialEffect(x, y, effectType, intensity)
```

**パラメーター**:
- `x`
- `y`
- `effectType`
- `intensity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSimplifiedSpecialEffect(x, y, effectType, intensity);

// createSimplifiedSpecialEffectの実用的な使用例
const result = instance.createSimplifiedSpecialEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < simpleCount; i++)
```

**パラメーター**:
- `let i = 0; i < simpleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < simpleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAvailableEffects

**シグネチャ**:
```javascript
 getAvailableEffects()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAvailableEffects();

// getAvailableEffectsの実用的な使用例
const result = instance.getAvailableEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEffectInfo

**シグネチャ**:
```javascript
 getEffectInfo(effectType)
```

**パラメーター**:
- `effectType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEffectInfo(effectType);

// getEffectInfoの実用的な使用例
const result = instance.getEffectInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `effectConfig` | 説明なし |
| `adjustedCount` | 説明なし |
| `intensityMultiplier` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `speed` | 説明なし |
| `distance` | 説明なし |
| `adjustedCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `startRadius` | 説明なし |
| `speed` | 説明なし |
| `adjustedCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `radius` | 説明なし |
| `spiralSpeed` | 説明なし |
| `adjustedCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `speed` | 説明なし |
| `adjustedCount` | 説明なし |
| `ringRadius` | 説明なし |
| `ringParticles` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `radius` | 説明なし |
| `particle` | 説明なし |
| `particle` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `distance` | 説明なし |
| `adjustedCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `speed` | 説明なし |
| `config` | 説明なし |
| `simpleCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `speed` | 説明なし |

---

