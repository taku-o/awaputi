# BubbleEffectRenderer

## 概要

ファイル: `effects/renderers/BubbleEffectRenderer.js`  
最終更新: 2025/7/30 0:29:15

## 目次

## クラス
- [BubbleEffectRenderer](#bubbleeffectrenderer)
## 定数
- [config](#config)
- [baseCount](#basecount)
- [adjustedCount](#adjustedcount)
- [intensityMultiplier](#intensitymultiplier)
- [particle](#particle)
- [angle](#angle)
- [distance](#distance)
- [speed](#speed)
- [velocityAngle](#velocityangle)
- [sizeVariation](#sizevariation)
- [ratio](#ratio)
- [qualitySettings](#qualitysettings)
- [sparkleCount](#sparklecount)
- [particle](#particle)
- [angle](#angle)
- [distance](#distance)
- [rippleCount](#ripplecount)
- [particle](#particle)
- [debrisCount](#debriscount)
- [particle](#particle)
- [arcCount](#arccount)
- [particle](#particle)
- [angle](#angle)
- [distance](#distance)
- [explosionCount](#explosioncount)
- [particle](#particle)
- [angle](#angle)
- [speed](#speed)
- [distance](#distance)
- [refractionCount](#refractioncount)
- [particle](#particle)
- [angle](#angle)
- [spiralCount](#spiralcount)
- [colors](#colors)
- [particle](#particle)
- [angle](#angle)
- [radius](#radius)
- [config](#config)
- [simpleCount](#simplecount)
- [particle](#particle)
- [angle](#angle)
- [speed](#speed)

---

## BubbleEffectRenderer

### コンストラクタ

```javascript
new BubbleEffectRenderer(particleManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `particleManager` | 説明なし |
| `bubbleEffectConfigs` | バブルタイプ別の基本設定 |

### メソッド

#### createAdvancedBubbleEffect

**シグネチャ**:
```javascript
 createAdvancedBubbleEffect(x, y, bubbleType, bubbleSize, options = {})
```

**パラメーター**:
- `x`
- `y`
- `bubbleType`
- `bubbleSize`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createAdvancedBubbleEffect(x, y, bubbleType, bubbleSize, options = {});

// createAdvancedBubbleEffectの実用的な使用例
const result = instance.createAdvancedBubbleEffect(/* 適切なパラメータ */);
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

#### createMainBubbleParticles

**シグネチャ**:
```javascript
 createMainBubbleParticles(x, y, config, bubbleSize, options)
```

**パラメーター**:
- `x`
- `y`
- `config`
- `bubbleSize`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createMainBubbleParticles(x, y, config, bubbleSize, options);

// createMainBubbleParticlesの実用的な使用例
const result = instance.createMainBubbleParticles(/* 適切なパラメータ */);
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

#### selectParticleType

**シグネチャ**:
```javascript
 selectParticleType(config, index, totalCount)
```

**パラメーター**:
- `config`
- `index`
- `totalCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.selectParticleType(config, index, totalCount);

// selectParticleTypeの実用的な使用例
const result = instance.selectParticleType(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (qualitySettings.complexityLevel >= 3)
```

**パラメーター**:
- `qualitySettings.complexityLevel >= 3`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(qualitySettings.complexityLevel >= 3);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (qualitySettings.complexityLevel >= 2)
```

**パラメーター**:
- `qualitySettings.complexityLevel >= 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(qualitySettings.complexityLevel >= 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createSpecialBubbleEffect

**シグネチャ**:
```javascript
 createSpecialBubbleEffect(x, y, effectType, bubbleSize, config)
```

**パラメーター**:
- `x`
- `y`
- `effectType`
- `bubbleSize`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSpecialBubbleEffect(x, y, effectType, bubbleSize, config);

// createSpecialBubbleEffectの実用的な使用例
const result = instance.createSpecialBubbleEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

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

#### createSparkleEffect

**シグネチャ**:
```javascript
 createSparkleEffect(x, y, bubbleSize, config)
```

**パラメーター**:
- `x`
- `y`
- `bubbleSize`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSparkleEffect(x, y, bubbleSize, config);

// createSparkleEffectの実用的な使用例
const result = instance.createSparkleEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < sparkleCount; i++)
```

**パラメーター**:
- `let i = 0; i < sparkleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < sparkleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRippleEffect

**シグネチャ**:
```javascript
 createRippleEffect(x, y, bubbleSize, config)
```

**パラメーター**:
- `x`
- `y`
- `bubbleSize`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRippleEffect(x, y, bubbleSize, config);

// createRippleEffectの実用的な使用例
const result = instance.createRippleEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < rippleCount; i++)
```

**パラメーター**:
- `let i = 0; i < rippleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < rippleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createDebrisEffect

**シグネチャ**:
```javascript
 createDebrisEffect(x, y, bubbleSize, config)
```

**パラメーター**:
- `x`
- `y`
- `bubbleSize`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createDebrisEffect(x, y, bubbleSize, config);

// createDebrisEffectの実用的な使用例
const result = instance.createDebrisEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < debrisCount; i++)
```

**パラメーター**:
- `let i = 0; i < debrisCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < debrisCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createElectricArcsEffect

**シグネチャ**:
```javascript
 createElectricArcsEffect(x, y, bubbleSize, config)
```

**パラメーター**:
- `x`
- `y`
- `bubbleSize`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createElectricArcsEffect(x, y, bubbleSize, config);

// createElectricArcsEffectの実用的な使用例
const result = instance.createElectricArcsEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < arcCount; i++)
```

**パラメーター**:
- `let i = 0; i < arcCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < arcCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createMassiveExplosionEffect

**シグネチャ**:
```javascript
 createMassiveExplosionEffect(x, y, bubbleSize, config)
```

**パラメーター**:
- `x`
- `y`
- `bubbleSize`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createMassiveExplosionEffect(x, y, bubbleSize, config);

// createMassiveExplosionEffectの実用的な使用例
const result = instance.createMassiveExplosionEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < explosionCount; i++)
```

**パラメーター**:
- `let i = 0; i < explosionCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < explosionCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createTypeSpecificEffect

**シグネチャ**:
```javascript
 createTypeSpecificEffect(x, y, bubbleType, bubbleSize, options)
```

**パラメーター**:
- `x`
- `y`
- `bubbleType`
- `bubbleSize`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createTypeSpecificEffect(x, y, bubbleType, bubbleSize, options);

// createTypeSpecificEffectの実用的な使用例
const result = instance.createTypeSpecificEffect(/* 適切なパラメータ */);
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

#### createDiamondRefraction

**シグネチャ**:
```javascript
 createDiamondRefraction(x, y, bubbleSize)
```

**パラメーター**:
- `x`
- `y`
- `bubbleSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createDiamondRefraction(x, y, bubbleSize);

// createDiamondRefractionの実用的な使用例
const result = instance.createDiamondRefraction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < refractionCount; i++)
```

**パラメーター**:
- `let i = 0; i < refractionCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < refractionCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRainbowSpiral

**シグネチャ**:
```javascript
 createRainbowSpiral(x, y, bubbleSize)
```

**パラメーター**:
- `x`
- `y`
- `bubbleSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRainbowSpiral(x, y, bubbleSize);

// createRainbowSpiralの実用的な使用例
const result = instance.createRainbowSpiral(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < spiralCount; i++)
```

**パラメーター**:
- `let i = 0; i < spiralCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < spiralCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createSimplifiedBubbleEffect

**シグネチャ**:
```javascript
 createSimplifiedBubbleEffect(x, y, bubbleType, bubbleSize)
```

**パラメーター**:
- `x`
- `y`
- `bubbleType`
- `bubbleSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSimplifiedBubbleEffect(x, y, bubbleType, bubbleSize);

// createSimplifiedBubbleEffectの実用的な使用例
const result = instance.createSimplifiedBubbleEffect(/* 適切なパラメータ */);
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


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `config` | 説明なし |
| `baseCount` | 説明なし |
| `adjustedCount` | 説明なし |
| `intensityMultiplier` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `distance` | 説明なし |
| `speed` | 説明なし |
| `velocityAngle` | 説明なし |
| `sizeVariation` | 説明なし |
| `ratio` | 説明なし |
| `qualitySettings` | 説明なし |
| `sparkleCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `distance` | 説明なし |
| `rippleCount` | 説明なし |
| `particle` | 説明なし |
| `debrisCount` | 説明なし |
| `particle` | 説明なし |
| `arcCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `distance` | 説明なし |
| `explosionCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `speed` | 説明なし |
| `distance` | 説明なし |
| `refractionCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `spiralCount` | 説明なし |
| `colors` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `radius` | 説明なし |
| `config` | 説明なし |
| `simpleCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `speed` | 説明なし |

---

