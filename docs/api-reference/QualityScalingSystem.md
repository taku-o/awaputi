# QualityScalingSystem

## 概要

ファイル: `effects/QualityScalingSystem.js`  
最終更新: 2025/7/30 0:29:15

## 目次

## クラス
- [QualityScalingSystem](#qualityscalingsystem)
## 定数
- [oldQuality](#oldquality)
- [settings](#settings)
- [excessCount](#excesscount)
- [sortedParticles](#sortedparticles)
- [priorityA](#prioritya)
- [priorityB](#priorityb)
- [particle](#particle)
- [typePriorities](#typepriorities)
- [typePriority](#typepriority)
- [agePriority](#agepriority)
- [sizePriority](#sizepriority)
- [now](#now)
- [currentSettings](#currentsettings)
- [qualityOrder](#qualityorder)
- [currentIndex](#currentindex)
- [newQuality](#newquality)
- [settings](#settings)
- [currentSettings](#currentsettings)
- [canvas](#canvas)
- [gl](#gl)
- [debugInfo](#debuginfo)
- [renderer](#renderer)

---

## QualityScalingSystem

### コンストラクタ

```javascript
new QualityScalingSystem(particleManager, performanceMonitor)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `particleManager` | 説明なし |
| `performanceMonitor` | 説明なし |
| `qualityLevels` | 品質レベル定義 |
| `currentQuality` | 現在の品質レベル |
| `autoAdjustEnabled` | 自動調整設定 |
| `performanceThresholds` | 説明なし |
| `adjustmentHistory` | 調整履歴 |
| `lastAdjustmentTime` | 説明なし |
| `adjustmentCooldown` | 説明なし |
| `fallbackEffects` | フォールバック効果定義 |
| `currentQuality` | 説明なし |
| `lastAdjustmentTime` | 説明なし |
| `autoAdjustEnabled` | 説明なし |

### メソッド

#### setQualityLevel

**シグネチャ**:
```javascript
 setQualityLevel(quality, force = false)
```

**パラメーター**:
- `quality`
- `force = false`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setQualityLevel(quality, force = false);

// setQualityLevelの実用的な使用例
const result = instance.setQualityLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.qualityLevels[quality])
```

**パラメーター**:
- `!this.qualityLevels[quality]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.qualityLevels[quality]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パーティクルマネージャーに品質設定を適用

**シグネチャ**:
```javascript
 if (this.particleManager)
```

**パラメーター**:
- `this.particleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyQualitySettings

**シグネチャ**:
```javascript
 applyQualitySettings()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyQualitySettings();

// applyQualitySettingsの実用的な使用例
const result = instance.applyQualitySettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パーティクル数制限

**シグネチャ**:
```javascript
 if (this.particleManager.maxParticles !== settings.maxParticles)
```

**パラメーター**:
- `this.particleManager.maxParticles !== settings.maxParticles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particleManager.maxParticles !== settings.maxParticles);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

現在のパーティクル数が制限を超えている場合は削減

**シグネチャ**:
```javascript
 if (this.particleManager.particles.length > settings.maxParticles)
```

**パラメーター**:
- `this.particleManager.particles.length > settings.maxParticles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particleManager.particles.length > settings.maxParticles);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### removeExcessParticles

**シグネチャ**:
```javascript
 removeExcessParticles(count)
```

**パラメーター**:
- `count`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeExcessParticles(count);

// removeExcessParticlesの実用的な使用例
const result = instance.removeExcessParticles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < count && sortedParticles.length > 0; i++)
```

**パラメーター**:
- `let i = 0; i < count && sortedParticles.length > 0; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < count && sortedParticles.length > 0; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getParticlePriority

**シグネチャ**:
```javascript
 getParticlePriority(particle)
```

**パラメーター**:
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getParticlePriority(particle);

// getParticlePriorityの実用的な使用例
const result = instance.getParticlePriority(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### autoAdjustQuality

**シグネチャ**:
```javascript
 autoAdjustQuality(performanceData)
```

**パラメーター**:
- `performanceData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.autoAdjustQuality(performanceData);

// autoAdjustQualityの実用的な使用例
const result = instance.autoAdjustQuality(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

FPS評価

**シグネチャ**:
```javascript
 if (fps < this.performanceThresholds.criticalFPS)
```

**パラメーター**:
- `fps < this.performanceThresholds.criticalFPS`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fps < this.performanceThresholds.criticalFPS);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (fps < this.performanceThresholds.minFPS)
```

**パラメーター**:
- `fps < this.performanceThresholds.minFPS`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fps < this.performanceThresholds.minFPS);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (fps > this.performanceThresholds.targetFPS + 10)
```

**パラメーター**:
- `fps > this.performanceThresholds.targetFPS + 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fps > this.performanceThresholds.targetFPS + 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メモリ使用量評価

**シグネチャ**:
```javascript
 if (memoryUsage > this.performanceThresholds.memoryThreshold)
```

**パラメーター**:
- `memoryUsage > this.performanceThresholds.memoryThreshold`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(memoryUsage > this.performanceThresholds.memoryThreshold);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パーティクル数評価

**シグネチャ**:
```javascript
 if (particleCount > this.performanceThresholds.particleCountThreshold)
```

**パラメーター**:
- `particleCount > this.performanceThresholds.particleCountThreshold`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particleCount > this.performanceThresholds.particleCountThreshold);

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

#### adjustQualityLevel

**シグネチャ**:
```javascript
 adjustQualityLevel(direction)
```

**パラメーター**:
- `direction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.adjustQualityLevel(direction);

// adjustQualityLevelの実用的な使用例
const result = instance.adjustQualityLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newIndex !== currentIndex)
```

**パラメーター**:
- `newIndex !== currentIndex`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newIndex !== currentIndex);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isEffectSupported

**シグネチャ**:
```javascript
 isEffectSupported(effectType)
```

**パラメーター**:
- `effectType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isEffectSupported(effectType);

// isEffectSupportedの実用的な使用例
const result = instance.isEffectSupported(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getFallbackEffect

**シグネチャ**:
```javascript
 getFallbackEffect(originalType)
```

**パラメーター**:
- `originalType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getFallbackEffect(originalType);

// getFallbackEffectの実用的な使用例
const result = instance.getFallbackEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordAdjustment

**シグネチャ**:
```javascript
 recordAdjustment(from, to, reason)
```

**パラメーター**:
- `from`
- `to`
- `reason`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordAdjustment(from, to, reason);

// recordAdjustmentの実用的な使用例
const result = instance.recordAdjustment(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴サイズ制限

**シグネチャ**:
```javascript
 if (this.adjustmentHistory.length > 50)
```

**パラメーター**:
- `this.adjustmentHistory.length > 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.adjustmentHistory.length > 50);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentQualitySettings

**シグネチャ**:
```javascript
 getCurrentQualitySettings()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentQualitySettings();

// getCurrentQualitySettingsの実用的な使用例
const result = instance.getCurrentQualitySettings(/* 適切なパラメータ */);
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

#### getRecommendedQuality

**シグネチャ**:
```javascript
 getRecommendedQuality()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRecommendedQuality();

// getRecommendedQualityの実用的な使用例
const result = instance.getRecommendedQuality(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

WebGLサポート

**シグネチャ**:
```javascript
 if (gl)
```

**パラメーター**:
- `gl`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gl);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (debugInfo)
```

**パラメーター**:
- `debugInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(debugInfo);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メモリ情報

**シグネチャ**:
```javascript
 if (navigator.deviceMemory)
```

**パラメーター**:
- `navigator.deviceMemory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(navigator.deviceMemory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

CPUコア数

**シグネチャ**:
```javascript
 if (navigator.hardwareConcurrency)
```

**パラメーター**:
- `navigator.hardwareConcurrency`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(navigator.hardwareConcurrency);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setAutoAdjustEnabled

**シグネチャ**:
```javascript
 setAutoAdjustEnabled(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setAutoAdjustEnabled(enabled);

// setAutoAdjustEnabledの実用的な使用例
const result = instance.setAutoAdjustEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### debugInfo

**シグネチャ**:
```javascript
 debugInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.debugInfo();

// debugInfoの実用的な使用例
const result = instance.debugInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `oldQuality` | 説明なし |
| `settings` | 説明なし |
| `excessCount` | 説明なし |
| `sortedParticles` | 説明なし |
| `priorityA` | 説明なし |
| `priorityB` | 説明なし |
| `particle` | 説明なし |
| `typePriorities` | 説明なし |
| `typePriority` | 説明なし |
| `agePriority` | 説明なし |
| `sizePriority` | 説明なし |
| `now` | 説明なし |
| `currentSettings` | 説明なし |
| `qualityOrder` | 説明なし |
| `currentIndex` | 説明なし |
| `newQuality` | 説明なし |
| `settings` | 説明なし |
| `currentSettings` | 説明なし |
| `canvas` | 説明なし |
| `gl` | 説明なし |
| `debugInfo` | 説明なし |
| `renderer` | 説明なし |

---

