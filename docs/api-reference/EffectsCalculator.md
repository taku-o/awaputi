# EffectsCalculator

## 概要

ファイル: `core/EffectsCalculator.js`  
最終更新: 2025/7/26 20:49:00

## 目次

## クラス
- [EffectsCalculator](#effectscalculator)
## 関数
- [getEffectsCalculator()](#geteffectscalculator)
## 定数
- [config](#config)
- [baseParticleCounts](#baseparticlecounts)
- [baseCount](#basecount)
- [maxCount](#maxcount)
- [config](#config)
- [baseDurations](#basedurations)
- [baseDuration](#baseduration)
- [config](#config)
- [shakeSettings](#shakesettings)
- [baseSetting](#basesetting)
- [amplitude](#amplitude)
- [frequency](#frequency)
- [duration](#duration)
- [trajectory](#trajectory)
- [angle](#angle)
- [distance](#distance)
- [t](#t)
- [angle](#angle)
- [radius](#radius)
- [explosionAngle](#explosionangle)
- [explosionDistance](#explosiondistance)
- [t](#t)
- [easeT](#easet)
- [easeOutT](#easeoutt)
- [basePriorities](#basepriorities)
- [optimization](#optimization)

---

## EffectsCalculator

### コンストラクタ

```javascript
new EffectsCalculator(effectsConfig = null)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `effectsConfig` | 説明なし |
| `defaultEffectsConfig` | デフォルトのエフェクト設定（EffectsConfigが利用できない場合のフォールバック） |

### メソッド

#### getEffectsConfig

**シグネチャ**:
```javascript
 getEffectsConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEffectsConfig();

// getEffectsConfigの実用的な使用例
const result = instance.getEffectsConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.effectsConfig && typeof this.effectsConfig.getEffectsConfig === 'function')
```

**パラメーター**:
- `this.effectsConfig && typeof this.effectsConfig.getEffectsConfig === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.effectsConfig && typeof this.effectsConfig.getEffectsConfig === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateParticleCount

**シグネチャ**:
```javascript
 calculateParticleCount(effectType, intensity = 1.0, modifiers = {})
```

**パラメーター**:
- `effectType`
- `intensity = 1.0`
- `modifiers = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateParticleCount(effectType, intensity = 1.0, modifiers = {});

// calculateParticleCountの実用的な使用例
const result = instance.calculateParticleCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

修正値を適用

**シグネチャ**:
```javascript
 if (modifiers.countMultiplier)
```

**パラメーター**:
- `modifiers.countMultiplier`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(modifiers.countMultiplier);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (modifiers.countBonus)
```

**パラメーター**:
- `modifiers.countBonus`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(modifiers.countBonus);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateAnimationDuration

**シグネチャ**:
```javascript
 calculateAnimationDuration(effectType, complexity = 1.0, modifiers = {})
```

**パラメーター**:
- `effectType`
- `complexity = 1.0`
- `modifiers = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateAnimationDuration(effectType, complexity = 1.0, modifiers = {});

// calculateAnimationDurationの実用的な使用例
const result = instance.calculateAnimationDuration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

修正値を適用

**シグネチャ**:
```javascript
 if (modifiers.durationMultiplier)
```

**パラメーター**:
- `modifiers.durationMultiplier`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(modifiers.durationMultiplier);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (modifiers.durationBonus)
```

**パラメーター**:
- `modifiers.durationBonus`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(modifiers.durationBonus);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateEffectIntensity

**シグネチャ**:
```javascript
 calculateEffectIntensity(baseIntensity, modifiers = [])
```

**パラメーター**:
- `baseIntensity`
- `modifiers = []`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateEffectIntensity(baseIntensity, modifiers = []);

// calculateEffectIntensityの実用的な使用例
const result = instance.calculateEffectIntensity(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

修正値を順次適用

**シグネチャ**:
```javascript
 for (const modifier of modifiers)
```

**パラメーター**:
- `const modifier of modifiers`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const modifier of modifiers);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (modifier.type)
```

**パラメーター**:
- `modifier.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(modifier.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateScreenShake

**シグネチャ**:
```javascript
 calculateScreenShake(shakeType, intensity = 1.0, options = {})
```

**パラメーター**:
- `shakeType`
- `intensity = 1.0`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateScreenShake(shakeType, intensity = 1.0, options = {});

// calculateScreenShakeの実用的な使用例
const result = instance.calculateScreenShake(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateParticleTrajectory

**シグネチャ**:
```javascript
 calculateParticleTrajectory(startPos, endPos = null, trajectoryType = 'linear', options = {})
```

**パラメーター**:
- `startPos`
- `endPos = null`
- `trajectoryType = 'linear'`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateParticleTrajectory(startPos, endPos = null, trajectoryType = 'linear', options = {});

// calculateParticleTrajectoryの実用的な使用例
const result = instance.calculateParticleTrajectory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

終了位置が指定されていない場合はランダムに設定

**シグネチャ**:
```javascript
 if (!endPos)
```

**パラメーター**:
- `!endPos`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!endPos);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i <= steps; i++)
```

**パラメーター**:
- `let i = 0; i <= steps; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i <= steps; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (trajectoryType)
```

**パラメーター**:
- `trajectoryType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(trajectoryType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ランダム性

**シグネチャ**:
```javascript
 if (randomness > 0)
```

**パラメーター**:
- `randomness > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(randomness > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateColorTransition

**シグネチャ**:
```javascript
 calculateColorTransition(startColor, endColor, progress, blendMode = 'linear')
```

**パラメーター**:
- `startColor`
- `endColor`
- `progress`
- `blendMode = 'linear'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateColorTransition(startColor, endColor, progress, blendMode = 'linear');

// calculateColorTransitionの実用的な使用例
const result = instance.calculateColorTransition(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (blendMode)
```

**パラメーター**:
- `blendMode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(blendMode);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateEffectPriority

**シグネチャ**:
```javascript
 calculateEffectPriority(effectType, context = {})
```

**パラメーター**:
- `effectType`
- `context = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateEffectPriority(effectType, context = {});

// calculateEffectPriorityの実用的な使用例
const result = instance.calculateEffectPriority(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コンテキストによる調整

**シグネチャ**:
```javascript
 if (context.isCombo && context.comboCount > 5)
```

**パラメーター**:
- `context.isCombo && context.comboCount > 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(context.isCombo && context.comboCount > 5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (context.isBossStage)
```

**パラメーター**:
- `context.isBossStage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(context.isBossStage);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (context.remainingTime < 10000)
```

**パラメーター**:
- `context.remainingTime < 10000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(context.remainingTime < 10000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculatePerformanceOptimization

**シグネチャ**:
```javascript
 calculatePerformanceOptimization(performanceState)
```

**パラメーター**:
- `performanceState`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculatePerformanceOptimization(performanceState);

// calculatePerformanceOptimizationの実用的な使用例
const result = instance.calculatePerformanceOptimization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

FPSが低い場合の最適化

**シグネチャ**:
```javascript
 if (fps < 30)
```

**パラメーター**:
- `fps < 30`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fps < 30);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (fps < 45)
```

**パラメーター**:
- `fps < 45`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fps < 45);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メモリ使用量が高い場合の最適化

**シグネチャ**:
```javascript
 if (memoryUsage > 0.8)
```

**パラメーター**:
- `memoryUsage > 0.8`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(memoryUsage > 0.8);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

CPU使用量が高い場合の最適化

**シグネチャ**:
```javascript
 if (cpuUsage > 0.8)
```

**パラメーター**:
- `cpuUsage > 0.8`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(cpuUsage > 0.8);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

極端に重い場合はエフェクトを無効化

**シグネチャ**:
```javascript
 if (fps < 15 || memoryUsage > 0.9 || cpuUsage > 0.9)
```

**パラメーター**:
- `fps < 15 || memoryUsage > 0.9 || cpuUsage > 0.9`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fps < 15 || memoryUsage > 0.9 || cpuUsage > 0.9);

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

## getEffectsCalculator

**シグネチャ**:
```javascript
getEffectsCalculator()
```

**使用例**:
```javascript
const result = getEffectsCalculator();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `config` | 説明なし |
| `baseParticleCounts` | 説明なし |
| `baseCount` | 説明なし |
| `maxCount` | 説明なし |
| `config` | 説明なし |
| `baseDurations` | 説明なし |
| `baseDuration` | 説明なし |
| `config` | 説明なし |
| `shakeSettings` | 説明なし |
| `baseSetting` | 説明なし |
| `amplitude` | 説明なし |
| `frequency` | 説明なし |
| `duration` | 説明なし |
| `trajectory` | 説明なし |
| `angle` | 説明なし |
| `distance` | 説明なし |
| `t` | 説明なし |
| `angle` | 説明なし |
| `radius` | 説明なし |
| `explosionAngle` | 説明なし |
| `explosionDistance` | 説明なし |
| `t` | 説明なし |
| `easeT` | 説明なし |
| `easeOutT` | 説明なし |
| `basePriorities` | 説明なし |
| `optimization` | 説明なし |

---

