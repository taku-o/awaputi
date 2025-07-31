# EnhancedParticleManager

## 概要

ファイル: `effects/EnhancedParticleManager.js`  
最終更新: 2025/7/30 0:29:15

## 目次

## クラス
- [EnhancedParticleManager](#enhancedparticlemanager)
## 定数
- [settings](#settings)
- [settings](#settings)
- [priority](#priority)
- [priority](#priority)
- [particleCount](#particlecount)
- [canvas](#canvas)
- [particleCount](#particlecount)
- [adjustedCount](#adjustedcount)
- [particle](#particle)
- [themeColors](#themecolors)
- [colors](#colors)
- [canvas](#canvas)
- [deltaSeconds](#deltaseconds)
- [pulse](#pulse)
- [settings](#settings)
- [typeInfo](#typeinfo)
- [gradient](#gradient)
- [glowGradient](#glowgradient)
- [alpha](#alpha)
- [curr](#curr)
- [prev](#prev)
- [sides](#sides)
- [radius](#radius)
- [angle](#angle)
- [x](#x)
- [y](#y)
- [size](#size)
- [size](#size)
- [thickness](#thickness)
- [time](#time)
- [pulseIntensity](#pulseintensity)
- [currentSize](#currentsize)
- [outerGradient](#outergradient)
- [middleGradient](#middlegradient)
- [time](#time)
- [twinkle](#twinkle)
- [sparkleGradient](#sparklegradient)
- [rayLength](#raylength)
- [time](#time)
- [chaos](#chaos)
- [segments](#segments)
- [baseRadius](#baseradius)
- [angle](#angle)
- [radiusVariation](#radiusvariation)
- [radius](#radius)
- [x](#x)
- [y](#y)
- [coreGradient](#coregradient)
- [settings](#settings)
- [settings](#settings)
- [maxAllowedParticles](#maxallowedparticles)
- [excessCount](#excesscount)
- [particle](#particle)
- [baseStats](#basestats)
- [settings](#settings)

---

## EnhancedParticleManager

**継承元**: `ParticleManager`

### コンストラクタ

```javascript
new EnhancedParticleManager()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `qualityController` | 品質コントローラーとパフォーマンス監視の取得 |
| `performanceMonitor` | 説明なし |
| `qualitySettings` | 拡張パーティクル設定（品質コントローラーに移行） |
| `currentQualityLevel` | 現在の品質レベル（品質コントローラーから取得） |
| `backgroundParticles` | 背景パーティクル |
| `backgroundEnabled` | 説明なし |
| `backgroundDensity` | 説明なし |
| `backgroundTheme` | 説明なし |
| `bubbleRenderer` | エフェクトレンダラーの初期化 |
| `comboRenderer` | 説明なし |
| `specialRenderer` | 説明なし |
| `seasonalRenderer` | 説明なし |
| `extendedParticleTypes` | 拡張パーティクルタイプの定義 |
| `currentQualityLevel` | 説明なし |
| `quality` | 説明なし |
| `currentQualityLevel` | 品質コントローラーから最新の設定を取得 |
| `backgroundDensity` | 説明なし |
| `backgroundTheme` | 説明なし |
| `backgroundEnabled` | 説明なし |
| `backgroundParticles` | 説明なし |
| `backgroundParticles` | 説明なし |
| `currentQualityLevel` | 品質レベルの同期 |
| `backgroundParticles` | 説明なし |
| `backgroundParticles` | 説明なし |

### メソッド

#### setQualityLevel

**シグネチャ**:
```javascript
 setQualityLevel(level)
```

**パラメーター**:
- `level`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setQualityLevel(level);

// setQualityLevelの実用的な使用例
const result = instance.setQualityLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.qualitySettings[level])
```

**パラメーター**:
- `this.qualitySettings[level]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.qualitySettings[level]);

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

#### adjustParticleCount

**シグネチャ**:
```javascript
 adjustParticleCount(baseCount)
```

**パラメーター**:
- `baseCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.adjustParticleCount(baseCount);

// adjustParticleCountの実用的な使用例
const result = instance.adjustParticleCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

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

#### createSpecialBubbleEffect

**シグネチャ**:
```javascript
 createSpecialBubbleEffect(x, y, effectType, intensity = 1.0)
```

**パラメーター**:
- `x`
- `y`
- `effectType`
- `intensity = 1.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSpecialBubbleEffect(x, y, effectType, intensity = 1.0);

// createSpecialBubbleEffectの実用的な使用例
const result = instance.createSpecialBubbleEffect(/* 適切なパラメータ */);
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

#### createSeasonalEffect

**シグネチャ**:
```javascript
 createSeasonalEffect(x, y, seasonType, eventType = null)
```

**パラメーター**:
- `x`
- `y`
- `seasonType`
- `eventType = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSeasonalEffect(x, y, seasonType, eventType = null);

// createSeasonalEffectの実用的な使用例
const result = instance.createSeasonalEffect(/* 適切なパラメータ */);
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

#### createBackgroundParticles

**シグネチャ**:
```javascript
 createBackgroundParticles(density = 0.1, theme = 'default')
```

**パラメーター**:
- `density = 0.1`
- `theme = 'default'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createBackgroundParticles(density = 0.1, theme = 'default');

// createBackgroundParticlesの実用的な使用例
const result = instance.createBackgroundParticles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.backgroundEnabled)
```

**パラメーター**:
- `!this.backgroundEnabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.backgroundEnabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### getBackgroundParticleColor

**シグネチャ**:
```javascript
 getBackgroundParticleColor(theme)
```

**パラメーター**:
- `theme`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBackgroundParticleColor(theme);

// getBackgroundParticleColorの実用的な使用例
const result = instance.getBackgroundParticleColor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateBackgroundParticles

**シグネチャ**:
```javascript
 updateBackgroundParticles(deltaTime)
```

**パラメーター**:
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateBackgroundParticles(deltaTime);

// updateBackgroundParticlesの実用的な使用例
const result = instance.updateBackgroundParticles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(particle => {
            // 位置更新
            particle.x += particle.vx * deltaSeconds;
            particle.y += particle.vy * deltaSeconds;
            
            // 境界での折り返し
            if (particle.x < 0 || particle.x > canvas.width)
```

**パラメーター**:
- `particle => {
            // 位置更新
            particle.x += particle.vx * deltaSeconds;
            particle.y += particle.vy * deltaSeconds;
            
            // 境界での折り返し
            if (particle.x < 0 || particle.x > canvas.width`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(particle => {
            // 位置更新
            particle.x += particle.vx * deltaSeconds;
            particle.y += particle.vy * deltaSeconds;
            
            // 境界での折り返し
            if (particle.x < 0 || particle.x > canvas.width);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (particle.y < 0 || particle.y > canvas.height)
```

**パラメーター**:
- `particle.y < 0 || particle.y > canvas.height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.y < 0 || particle.y > canvas.height);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パルス効果

**シグネチャ**:
```javascript
 if (particle.pulseSpeed > 0)
```

**パラメーター**:
- `particle.pulseSpeed > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.pulseSpeed > 0);

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

#### renderAdvancedParticle

**シグネチャ**:
```javascript
 renderAdvancedParticle(context, particle)
```

**パラメーター**:
- `context`
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderAdvancedParticle(context, particle);

// renderAdvancedParticleの実用的な使用例
const result = instance.renderAdvancedParticle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

品質レベルに応じてレンダリング方法を選択

**シグネチャ**:
```javascript
 if (settings.complexityLevel >= 3 && this.extendedParticleTypes[particle.type])
```

**パラメーター**:
- `settings.complexityLevel >= 3 && this.extendedParticleTypes[particle.type]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.complexityLevel >= 3 && this.extendedParticleTypes[particle.type]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コストに応じて品質調整

**シグネチャ**:
```javascript
 if (typeInfo.cost === 'high' && settings.complexityLevel < 4)
```

**パラメーター**:
- `typeInfo.cost === 'high' && settings.complexityLevel < 4`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeInfo.cost === 'high' && settings.complexityLevel < 4);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

指定されたレンダリングメソッドを実行

**シグネチャ**:
```javascript
 if (this[typeInfo.renderMethod])
```

**パラメーター**:
- `this[typeInfo.renderMethod]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this[typeInfo.renderMethod]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderSimplifiedParticle

**シグネチャ**:
```javascript
 renderSimplifiedParticle(context, particle)
```

**パラメーター**:
- `context`
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderSimplifiedParticle(context, particle);

// renderSimplifiedParticleの実用的な使用例
const result = instance.renderSimplifiedParticle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderAdvancedCircle

**シグネチャ**:
```javascript
 renderAdvancedCircle(context, particle)
```

**パラメーター**:
- `context`
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderAdvancedCircle(context, particle);

// renderAdvancedCircleの実用的な使用例
const result = instance.renderAdvancedCircle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderGlowCircle

**シグネチャ**:
```javascript
 renderGlowCircle(context, particle)
```

**パラメーター**:
- `context`
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderGlowCircle(context, particle);

// renderGlowCircleの実用的な使用例
const result = instance.renderGlowCircle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderTrailParticle

**シグネチャ**:
```javascript
 renderTrailParticle(context, particle)
```

**パラメーター**:
- `context`
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderTrailParticle(context, particle);

// renderTrailParticleの実用的な使用例
const result = instance.renderTrailParticle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

トレイルの描画

**シグネチャ**:
```javascript
 if (particle.trail && particle.trail.length > 1)
```

**パラメーター**:
- `particle.trail && particle.trail.length > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.trail && particle.trail.length > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 1; i < particle.trail.length; i++)
```

**パラメーター**:
- `let i = 1; i < particle.trail.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 1; i < particle.trail.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderHexagon

**シグネチャ**:
```javascript
 renderHexagon(context, particle)
```

**パラメーター**:
- `context`
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderHexagon(context, particle);

// renderHexagonの実用的な使用例
const result = instance.renderHexagon(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < sides; i++)
```

**パラメーター**:
- `let i = 0; i < sides; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < sides; i++);

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

#### renderTriangle

**シグネチャ**:
```javascript
 renderTriangle(context, particle)
```

**パラメーター**:
- `context`
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderTriangle(context, particle);

// renderTriangleの実用的な使用例
const result = instance.renderTriangle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderCross

**シグネチャ**:
```javascript
 renderCross(context, particle)
```

**パラメーター**:
- `context`
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderCross(context, particle);

// renderCrossの実用的な使用例
const result = instance.renderCross(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderEnergyOrb

**シグネチャ**:
```javascript
 renderEnergyOrb(context, particle)
```

**パラメーター**:
- `context`
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderEnergyOrb(context, particle);

// renderEnergyOrbの実用的な使用例
const result = instance.renderEnergyOrb(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderMagicSparkle

**シグネチャ**:
```javascript
 renderMagicSparkle(context, particle)
```

**パラメーター**:
- `context`
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderMagicSparkle(context, particle);

// renderMagicSparkleの実用的な使用例
const result = instance.renderMagicSparkle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderPlasmaBurst

**シグネチャ**:
```javascript
 renderPlasmaBurst(context, particle)
```

**パラメーター**:
- `context`
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderPlasmaBurst(context, particle);

// renderPlasmaBurstの実用的な使用例
const result = instance.renderPlasmaBurst(/* 適切なパラメータ */);
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

背景パーティクルの描画

**シグネチャ**:
```javascript
 if (this.backgroundEnabled && this.backgroundParticles.length > 0)
```

**パラメーター**:
- `this.backgroundEnabled && this.backgroundParticles.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.backgroundEnabled && this.backgroundParticles.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (particle.scale !== 1)
```

**パラメーター**:
- `particle.scale !== 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.scale !== 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### shouldRenderEffect

**シグネチャ**:
```javascript
 shouldRenderEffect(effectType, priority = 5)
```

**パラメーター**:
- `effectType`
- `priority = 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.shouldRenderEffect(effectType, priority = 5);

// shouldRenderEffectの実用的な使用例
const result = instance.shouldRenderEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

品質レベルに応じて表示判定

**シグネチャ**:
```javascript
 if (settings.complexityLevel === 1)
```

**パラメーター**:
- `settings.complexityLevel === 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.complexityLevel === 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.complexityLevel === 2)
```

**パラメーター**:
- `settings.complexityLevel === 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.complexityLevel === 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getParticleCountMultiplier

**シグネチャ**:
```javascript
 getParticleCountMultiplier()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getParticleCountMultiplier();

// getParticleCountMultiplierの実用的な使用例
const result = instance.getParticleCountMultiplier(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEffectIntensityMultiplier

**シグネチャ**:
```javascript
 getEffectIntensityMultiplier()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEffectIntensityMultiplier();

// getEffectIntensityMultiplierの実用的な使用例
const result = instance.getEffectIntensityMultiplier(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanupUnusedResources

**シグネチャ**:
```javascript
 cleanupUnusedResources()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanupUnusedResources();

// cleanupUnusedResourcesの実用的な使用例
const result = instance.cleanupUnusedResources(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

背景パーティクルのクリーンアップ

**シグネチャ**:
```javascript
 if (!this.backgroundEnabled)
```

**パラメーター**:
- `!this.backgroundEnabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.backgroundEnabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### optimizeMemoryUsage

**シグネチャ**:
```javascript
 optimizeMemoryUsage()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.optimizeMemoryUsage();

// optimizeMemoryUsageの実用的な使用例
const result = instance.optimizeMemoryUsage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.particles.length > maxAllowedParticles)
```

**パラメーター**:
- `this.particles.length > maxAllowedParticles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particles.length > maxAllowedParticles);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < excessCount; i++)
```

**パラメーター**:
- `let i = 0; i < excessCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < excessCount; i++);

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

#### clear

**シグネチャ**:
```javascript
 clear()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clear();

// clearの実用的な使用例
const result = instance.clear(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `settings` | 説明なし |
| `settings` | 説明なし |
| `priority` | 説明なし |
| `priority` | 説明なし |
| `particleCount` | 説明なし |
| `canvas` | 説明なし |
| `particleCount` | 説明なし |
| `adjustedCount` | 説明なし |
| `particle` | 説明なし |
| `themeColors` | 説明なし |
| `colors` | 説明なし |
| `canvas` | 説明なし |
| `deltaSeconds` | 説明なし |
| `pulse` | 説明なし |
| `settings` | 説明なし |
| `typeInfo` | 説明なし |
| `gradient` | 説明なし |
| `glowGradient` | 説明なし |
| `alpha` | 説明なし |
| `curr` | 説明なし |
| `prev` | 説明なし |
| `sides` | 説明なし |
| `radius` | 説明なし |
| `angle` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `size` | 説明なし |
| `size` | 説明なし |
| `thickness` | 説明なし |
| `time` | 説明なし |
| `pulseIntensity` | 説明なし |
| `currentSize` | 説明なし |
| `outerGradient` | 説明なし |
| `middleGradient` | 説明なし |
| `time` | 説明なし |
| `twinkle` | 説明なし |
| `sparkleGradient` | 説明なし |
| `rayLength` | 説明なし |
| `time` | 説明なし |
| `chaos` | 説明なし |
| `segments` | 説明なし |
| `baseRadius` | 説明なし |
| `angle` | 説明なし |
| `radiusVariation` | 説明なし |
| `radius` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `coreGradient` | 説明なし |
| `settings` | 説明なし |
| `settings` | 説明なし |
| `maxAllowedParticles` | 説明なし |
| `excessCount` | 説明なし |
| `particle` | 説明なし |
| `baseStats` | 説明なし |
| `settings` | 説明なし |

---

