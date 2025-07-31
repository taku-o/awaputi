# EffectDebugInterface

## 概要

ファイル: `effects/EffectDebugInterface.js`  
最終更新: 2025/7/30 0:29:15

## 目次

## クラス
- [EffectDebugInterface](#effectdebuginterface)
## 定数
- [particleMultiplier](#particlemultiplier)
- [value](#value)
- [effectIntensity](#effectintensity)
- [value](#value)
- [effectType](#effecttype)
- [qualityController](#qualitycontroller)
- [currentQuality](#currentquality)
- [canvas](#canvas)
- [x](#x)
- [y](#y)
- [comboValue](#combovalue)
- [benchmarkResults](#benchmarkresults)
- [startTime](#starttime)
- [measureFrames](#measureframes)
- [startTime](#starttime)
- [startTime](#starttime)

---

## EffectDebugInterface

### コンストラクタ

```javascript
new EffectDebugInterface(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `isVisible` | 説明なし |
| `debugPanel` | 説明なし |
| `updateInterval` | 説明なし |
| `metrics` | 説明なし |
| `debugPanel` | デバッグパネルのHTML構造を作成 |
| `isVisible` | 説明なし |
| `isVisible` | 説明なし |
| `updateInterval` | 説明なし |
| `updateInterval` | 説明なし |

### メソッド

#### initialize

**シグネチャ**:
```javascript
 initialize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initialize();

// システムの初期化
await instance.initialize();
console.log('Initialization complete');
```

#### createDebugPanel

**シグネチャ**:
```javascript
 createDebugPanel()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createDebugPanel();

// createDebugPanelの実用的な使用例
const result = instance.createDebugPanel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### bindEvents

**シグネチャ**:
```javascript
 bindEvents()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.bindEvents();

// bindEventsの実用的な使用例
const result = instance.bindEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (e.ctrlKey && e.shiftKey && e.key === 'E')
```

**パラメーター**:
- `e.ctrlKey && e.shiftKey && e.key === 'E'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(e.ctrlKey && e.shiftKey && e.key === 'E');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### show

**シグネチャ**:
```javascript
 show()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.show();

// showの実用的な使用例
const result = instance.show(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hide

**シグネチャ**:
```javascript
 hide()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hide();

// hideの実用的な使用例
const result = instance.hide(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### toggle

**シグネチャ**:
```javascript
 toggle()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toggle();

// toggleの実用的な使用例
const result = instance.toggle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isVisible)
```

**パラメーター**:
- `this.isVisible`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isVisible);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startMetricsUpdate

**シグネチャ**:
```javascript
 startMetricsUpdate()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startMetricsUpdate();

// startMetricsUpdateの実用的な使用例
const result = instance.startMetricsUpdate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stopMetricsUpdate

**シグネチャ**:
```javascript
 stopMetricsUpdate()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopMetricsUpdate();

// stopMetricsUpdateの実用的な使用例
const result = instance.stopMetricsUpdate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.updateInterval)
```

**パラメーター**:
- `this.updateInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.updateInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateMetrics

**シグネチャ**:
```javascript
 updateMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateMetrics();

// updateMetricsの実用的な使用例
const result = instance.updateMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateMetricsDisplay

**シグネチャ**:
```javascript
 updateMetricsDisplay()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateMetricsDisplay();

// updateMetricsDisplayの実用的な使用例
const result = instance.updateMetricsDisplay(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateFPS

**シグネチャ**:
```javascript
 calculateFPS()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateFPS();

// calculateFPSの実用的な使用例
const result = instance.calculateFPS(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

GameEngineからFPS情報を取得

**シグネチャ**:
```javascript
 if (this.gameEngine && this.gameEngine.performanceOptimizer)
```

**パラメーター**:
- `this.gameEngine && this.gameEngine.performanceOptimizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine && this.gameEngine.performanceOptimizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getParticleCount

**シグネチャ**:
```javascript
 getParticleCount()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getParticleCount();

// getParticleCountの実用的な使用例
const result = instance.getParticleCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine && this.gameEngine.enhancedParticleManager)
```

**パラメーター**:
- `this.gameEngine && this.gameEngine.enhancedParticleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine && this.gameEngine.enhancedParticleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEffectCount

**シグネチャ**:
```javascript
 getEffectCount()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEffectCount();

// getEffectCountの実用的な使用例
const result = instance.getEffectCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine && this.gameEngine.enhancedEffectManager)
```

**パラメーター**:
- `this.gameEngine && this.gameEngine.enhancedEffectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine && this.gameEngine.enhancedEffectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getMemoryUsage

**シグネチャ**:
```javascript
 getMemoryUsage()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMemoryUsage();

// getMemoryUsageの実用的な使用例
const result = instance.getMemoryUsage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ブラウザのメモリAPI使用（利用可能な場合）

**シグネチャ**:
```javascript
 if (performance.memory)
```

**パラメーター**:
- `performance.memory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(performance.memory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRenderTime

**シグネチャ**:
```javascript
 getRenderTime()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRenderTime();

// getRenderTimeの実用的な使用例
const result = instance.getRenderTime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パフォーマンス測定から取得

**シグネチャ**:
```javascript
 if (this.gameEngine && this.gameEngine.performanceOptimizer)
```

**パラメーター**:
- `this.gameEngine && this.gameEngine.performanceOptimizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine && this.gameEngine.performanceOptimizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### loadCurrentSettings

**シグネチャ**:
```javascript
 loadCurrentSettings()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadCurrentSettings();

// loadCurrentSettingsの実用的な使用例
const result = instance.loadCurrentSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (qualityController)
```

**パラメーター**:
- `qualityController`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(qualityController);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateQualityLevel

**シグネチャ**:
```javascript
 updateQualityLevel(level)
```

**パラメーター**:
- `level`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateQualityLevel(level);

// updateQualityLevelの実用的な使用例
const result = instance.updateQualityLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.effectQualityController)
```

**パラメーター**:
- `this.gameEngine?.effectQualityController`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.effectQualityController);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateParticleMultiplier

**シグネチャ**:
```javascript
 updateParticleMultiplier(multiplier)
```

**パラメーター**:
- `multiplier`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateParticleMultiplier(multiplier);

// updateParticleMultiplierの実用的な使用例
const result = instance.updateParticleMultiplier(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.enhancedParticleManager)
```

**パラメーター**:
- `this.gameEngine?.enhancedParticleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.enhancedParticleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateEffectIntensity

**シグネチャ**:
```javascript
 updateEffectIntensity(intensity)
```

**パラメーター**:
- `intensity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateEffectIntensity(intensity);

// updateEffectIntensityの実用的な使用例
const result = instance.updateEffectIntensity(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.enhancedEffectManager)
```

**パラメーター**:
- `this.gameEngine?.enhancedEffectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.enhancedEffectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### triggerPreviewEffect

**シグネチャ**:
```javascript
 triggerPreviewEffect(effectType)
```

**パラメーター**:
- `effectType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.triggerPreviewEffect(effectType);

// triggerPreviewEffectの実用的な使用例
const result = instance.triggerPreviewEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (category)
```

**パラメーター**:
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(category);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### triggerBubbleEffect

**シグネチャ**:
```javascript
 triggerBubbleEffect(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.triggerBubbleEffect(type);

// triggerBubbleEffectの実用的な使用例
const result = instance.triggerBubbleEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.enhancedParticleManager)
```

**パラメーター**:
- `this.gameEngine?.enhancedParticleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.enhancedParticleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### triggerComboEffect

**シグネチャ**:
```javascript
 triggerComboEffect(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.triggerComboEffect(type);

// triggerComboEffectの実用的な使用例
const result = instance.triggerComboEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.enhancedParticleManager)
```

**パラメーター**:
- `this.gameEngine?.enhancedParticleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.enhancedParticleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### triggerScreenEffect

**シグネチャ**:
```javascript
 triggerScreenEffect(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.triggerScreenEffect(type);

// triggerScreenEffectの実用的な使用例
const result = instance.triggerScreenEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.enhancedEffectManager)
```

**パラメーター**:
- `this.gameEngine?.enhancedEffectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.enhancedEffectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (type === 'flash')
```

**パラメーター**:
- `type === 'flash'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(type === 'flash');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (type === 'shake')
```

**パラメーター**:
- `type === 'shake'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(type === 'shake');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### toggleEffectType

**シグネチャ**:
```javascript
 toggleEffectType(effectType, enabled)
```

**パラメーター**:
- `effectType`
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toggleEffectType(effectType, enabled);

// toggleEffectTypeの実用的な使用例
const result = instance.toggleEffectType(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.enhancedParticleManager)
```

**パラメーター**:
- `this.gameEngine?.enhancedParticleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.enhancedParticleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.enhancedEffectManager)
```

**パラメーター**:
- `this.gameEngine?.enhancedEffectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.enhancedEffectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.animationManager)
```

**パラメーター**:
- `this.gameEngine?.animationManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.animationManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.seasonalEffectManager)
```

**パラメーター**:
- `this.gameEngine?.seasonalEffectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.seasonalEffectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.enhancedParticleManager)
```

**パラメーター**:
- `this.gameEngine?.enhancedParticleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.enhancedParticleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.enhancedEffectManager)
```

**パラメーター**:
- `this.gameEngine?.enhancedEffectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.enhancedEffectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.animationManager)
```

**パラメーター**:
- `this.gameEngine?.animationManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.animationManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runBenchmark

**シグネチャ**:
```javascript
 runBenchmark()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runBenchmark();

// runBenchmarkの実用的な使用例
const result = instance.runBenchmark(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### benchmarkParticles

**シグネチャ**:
```javascript
 benchmarkParticles()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.benchmarkParticles();

// benchmarkParticlesの実用的な使用例
const result = instance.benchmarkParticles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

大量のパーティクル生成

**シグネチャ**:
```javascript
 for (let i = 0; i < 100; i++)
```

**パラメーター**:
- `let i = 0; i < 100; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 100; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### benchmarkEffects

**シグネチャ**:
```javascript
 benchmarkEffects()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.benchmarkEffects();

// benchmarkEffectsの実用的な使用例
const result = instance.benchmarkEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### benchmarkAnimations

**シグネチャ**:
```javascript
 benchmarkAnimations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.benchmarkAnimations();

// benchmarkAnimationsの実用的な使用例
const result = instance.benchmarkAnimations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

複数のアニメーションを同時実行

**シグネチャ**:
```javascript
 for (let i = 0; i < 20; i++)
```

**パラメーター**:
- `let i = 0; i < 20; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 20; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (this.debugPanel && this.debugPanel.parentNode)
```

**パラメーター**:
- `this.debugPanel && this.debugPanel.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.debugPanel && this.debugPanel.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `particleMultiplier` | 説明なし |
| `value` | 説明なし |
| `effectIntensity` | 説明なし |
| `value` | 説明なし |
| `effectType` | 説明なし |
| `qualityController` | 説明なし |
| `currentQuality` | 説明なし |
| `canvas` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `comboValue` | 説明なし |
| `benchmarkResults` | 説明なし |
| `startTime` | 説明なし |
| `measureFrames` | 説明なし |
| `startTime` | 説明なし |
| `startTime` | 説明なし |

---

