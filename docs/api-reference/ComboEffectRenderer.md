# ComboEffectRenderer

## 概要

ファイル: `effects/renderers/ComboEffectRenderer.js`  
最終更新: 2025/7/30 0:29:15

## 目次

## クラス
- [ComboEffectRenderer](#comboeffectrenderer)
## 定数
- [tier](#tier)
- [adjustedCount](#adjustedcount)
- [intensityMultiplier](#intensitymultiplier)
- [particle](#particle)
- [angle](#angle)
- [radius](#radius)
- [spiralOffset](#spiraloffset)
- [convergencePhase](#convergencephase)
- [speed](#speed)
- [baseLifetime](#baselifetime)
- [qualitySettings](#qualitysettings)
- [ratio](#ratio)
- [goldenCount](#goldencount)
- [particle](#particle)
- [angle](#angle)
- [distance](#distance)
- [rainbowCount](#rainbowcount)
- [colors](#colors)
- [particle](#particle)
- [angle](#angle)
- [speed](#speed)
- [explosionCount](#explosioncount)
- [waveCount](#wavecount)
- [particle](#particle)
- [angle](#angle)
- [speed](#speed)
- [digitCount](#digitcount)
- [particle](#particle)
- [particle](#particle)
- [angle](#angle)
- [radius](#radius)
- [breakCount](#breakcount)
- [particle](#particle)
- [angle](#angle)
- [distance](#distance)
- [simpleCount](#simplecount)
- [color](#color)
- [particle](#particle)
- [angle](#angle)
- [progress](#progress)
- [progressParticles](#progressparticles)
- [particle](#particle)
- [angle](#angle)
- [radius](#radius)

---

## ComboEffectRenderer

### コンストラクタ

```javascript
new ComboEffectRenderer(particleManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `particleManager` | 説明なし |
| `comboTiers` | コンボ段階の定義 |
| `effectQueue` | コンボ演出のキューイング |
| `isProcessingQueue` | 説明なし |
| `comboBreakEffect` | コンボブレイク時の演出 |

### メソッド

#### createEnhancedComboEffect

**シグネチャ**:
```javascript
 createEnhancedComboEffect(x, y, comboCount, comboType = 'normal')
```

**パラメーター**:
- `x`
- `y`
- `comboCount`
- `comboType = 'normal'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createEnhancedComboEffect(x, y, comboCount, comboType = 'normal');

// createEnhancedComboEffectの実用的な使用例
const result = instance.createEnhancedComboEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

画面効果（必要に応じて）

**シグネチャ**:
```javascript
 if (tier.screenEffects.length > 0)
```

**パラメーター**:
- `tier.screenEffects.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(tier.screenEffects.length > 0);

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

#### getComboTier

**シグネチャ**:
```javascript
 getComboTier(comboCount)
```

**パラメーター**:
- `comboCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getComboTier(comboCount);

// getComboTierの実用的な使用例
const result = instance.getComboTier(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (comboCount >= tier.minCombo && comboCount <= tier.maxCombo)
```

**パラメーター**:
- `comboCount >= tier.minCombo && comboCount <= tier.maxCombo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(comboCount >= tier.minCombo && comboCount <= tier.maxCombo);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createMainComboParticles

**シグネチャ**:
```javascript
 createMainComboParticles(x, y, comboCount, tier)
```

**パラメーター**:
- `x`
- `y`
- `comboCount`
- `tier`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createMainComboParticles(x, y, comboCount, tier);

// createMainComboParticlesの実用的な使用例
const result = instance.createMainComboParticles(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (convergencePhase < 1)
```

**パラメーター**:
- `convergencePhase < 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(convergencePhase < 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

トレイル効果（高段階のみ）

**シグネチャ**:
```javascript
 if (tier.key === 'spectacular')
```

**パラメーター**:
- `tier.key === 'spectacular'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(tier.key === 'spectacular');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### selectComboParticleType

**シグネチャ**:
```javascript
 selectComboParticleType(tier, index, totalCount)
```

**パラメーター**:
- `tier`
- `index`
- `totalCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.selectComboParticleType(tier, index, totalCount);

// selectComboParticleTypeの実用的な使用例
const result = instance.selectComboParticleType(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (tier.key)
```

**パラメーター**:
- `tier.key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(tier.key);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
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

#### createComboSpecialEffect

**シグネチャ**:
```javascript
 createComboSpecialEffect(x, y, effectType, comboCount, tier)
```

**パラメーター**:
- `x`
- `y`
- `effectType`
- `comboCount`
- `tier`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createComboSpecialEffect(x, y, effectType, comboCount, tier);

// createComboSpecialEffectの実用的な使用例
const result = instance.createComboSpecialEffect(/* 適切なパラメータ */);
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

#### createGoldenParticles

**シグネチャ**:
```javascript
 createGoldenParticles(x, y, comboCount)
```

**パラメーター**:
- `x`
- `y`
- `comboCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createGoldenParticles(x, y, comboCount);

// createGoldenParticlesの実用的な使用例
const result = instance.createGoldenParticles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < goldenCount; i++)
```

**パラメーター**:
- `let i = 0; i < goldenCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < goldenCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRainbowBurst

**シグネチャ**:
```javascript
 createRainbowBurst(x, y, comboCount)
```

**パラメーター**:
- `x`
- `y`
- `comboCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRainbowBurst(x, y, comboCount);

// createRainbowBurstの実用的な使用例
const result = instance.createRainbowBurst(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < rainbowCount; i++)
```

**パラメーター**:
- `let i = 0; i < rainbowCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < rainbowCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createMagicalExplosion

**シグネチャ**:
```javascript
 createMagicalExplosion(x, y, comboCount)
```

**パラメーター**:
- `x`
- `y`
- `comboCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createMagicalExplosion(x, y, comboCount);

// createMagicalExplosionの実用的な使用例
const result = instance.createMagicalExplosion(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

内側から外側への波状展開

**シグネチャ**:
```javascript
 for (let wave = 0; wave < 3; wave++)
```

**パラメーター**:
- `let wave = 0; wave < 3; wave++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let wave = 0; wave < 3; wave++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < waveCount; i++)
```

**パラメーター**:
- `let i = 0; i < waveCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < waveCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createComboMultiplierIndicator

**シグネチャ**:
```javascript
 createComboMultiplierIndicator(x, y, comboCount, tier)
```

**パラメーター**:
- `x`
- `y`
- `comboCount`
- `tier`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createComboMultiplierIndicator(x, y, comboCount, tier);

// createComboMultiplierIndicatorの実用的な使用例
const result = instance.createComboMultiplierIndicator(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < digitCount; i++)
```

**パラメーター**:
- `let i = 0; i < digitCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < digitCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

マルチプライヤー強調リング

**シグネチャ**:
```javascript
 if (tier.key === 'spectacular')
```

**パラメーター**:
- `tier.key === 'spectacular'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(tier.key === 'spectacular');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < 8; i++)
```

**パラメーター**:
- `let i = 0; i < 8; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 8; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### triggerScreenEffects

**シグネチャ**:
```javascript
 triggerScreenEffects(effects, comboCount)
```

**パラメーター**:
- `effects`
- `comboCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.triggerScreenEffects(effects, comboCount);

// triggerScreenEffectsの実用的な使用例
const result = instance.triggerScreenEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createComboBreakEffect

**シグネチャ**:
```javascript
 createComboBreakEffect(x, y, lastComboCount)
```

**パラメーター**:
- `x`
- `y`
- `lastComboCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createComboBreakEffect(x, y, lastComboCount);

// createComboBreakEffectの実用的な使用例
const result = instance.createComboBreakEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < breakCount; i++)
```

**パラメーター**:
- `let i = 0; i < breakCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < breakCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

#### createSimplifiedComboEffect

**シグネチャ**:
```javascript
 createSimplifiedComboEffect(x, y, comboCount)
```

**パラメーター**:
- `x`
- `y`
- `comboCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSimplifiedComboEffect(x, y, comboCount);

// createSimplifiedComboEffectの実用的な使用例
const result = instance.createSimplifiedComboEffect(/* 適切なパラメータ */);
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

#### createComboProgressEffect

**シグネチャ**:
```javascript
 createComboProgressEffect(x, y, currentCombo, nextTierThreshold)
```

**パラメーター**:
- `x`
- `y`
- `currentCombo`
- `nextTierThreshold`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createComboProgressEffect(x, y, currentCombo, nextTierThreshold);

// createComboProgressEffectの実用的な使用例
const result = instance.createComboProgressEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < progressParticles; i++)
```

**パラメーター**:
- `let i = 0; i < progressParticles; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < progressParticles; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getPerformanceStats

**シグネチャ**:
```javascript
 getPerformanceStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getPerformanceStats();

// getPerformanceStatsの実用的な使用例
const result = instance.getPerformanceStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `tier` | 説明なし |
| `adjustedCount` | 説明なし |
| `intensityMultiplier` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `radius` | 説明なし |
| `spiralOffset` | 説明なし |
| `convergencePhase` | 説明なし |
| `speed` | 説明なし |
| `baseLifetime` | 説明なし |
| `qualitySettings` | 説明なし |
| `ratio` | 説明なし |
| `goldenCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `distance` | 説明なし |
| `rainbowCount` | 説明なし |
| `colors` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `speed` | 説明なし |
| `explosionCount` | 説明なし |
| `waveCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `speed` | 説明なし |
| `digitCount` | 説明なし |
| `particle` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `radius` | 説明なし |
| `breakCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `distance` | 説明なし |
| `simpleCount` | 説明なし |
| `color` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `progress` | 説明なし |
| `progressParticles` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `radius` | 説明なし |

---

