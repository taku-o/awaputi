# SeasonalEffectManager

## 概要

ファイル: `effects/SeasonalEffectManager.js`  
最終更新: 2025/7/30 0:29:15

## 目次

## クラス
- [SeasonalEffectManager](#seasonaleffectmanager)
## 関数
- [getSeasonalEffectManager()](#getseasonaleffectmanager)
## 定数
- [activeEvent](#activeevent)
- [now](#now)
- [month](#month)
- [day](#day)
- [now](#now)
- [currentDate](#currentdate)
- [effect](#effect)
- [colors](#colors)
- [particleTypes](#particletypes)
- [priority](#priority)
- [effect](#effect)
- [colors](#colors)
- [particleTypes](#particletypes)
- [effectId](#effectid)
- [effect](#effect)
- [particleCount](#particlecount)
- [angle](#angle)
- [velocity](#velocity)
- [color](#color)
- [particleCount](#particlecount)
- [angle](#angle)
- [velocity](#velocity)
- [color](#color)
- [particleCount](#particlecount)
- [angle](#angle)
- [velocity](#velocity)
- [color](#color)
- [particleCount](#particlecount)
- [angle](#angle)
- [velocity](#velocity)
- [color](#color)
- [particleCount](#particlecount)
- [angle](#angle)
- [velocity](#velocity)
- [color](#color)
- [particleCount](#particlecount)
- [angle](#angle)
- [velocity](#velocity)
- [color](#color)
- [particleCount](#particlecount)
- [angle](#angle)
- [velocity](#velocity)
- [color](#color)
- [particleCount](#particlecount)
- [angle](#angle)
- [velocity](#velocity)
- [color](#color)
- [particleCount](#particlecount)
- [angle](#angle)
- [velocity](#velocity)
- [color](#color)
- [qualitySettings](#qualitysettings)
- [currentTime](#currenttime)
- [toRemove](#toremove)
- [particle](#particle)
- [size](#size)
- [angle](#angle)
- [x](#x)
- [y](#y)
- [angle](#angle)
- [pulseSize](#pulsesize)
- [angle](#angle)
- [radius](#radius)
- [x](#x)
- [y](#y)
- [themeId](#themeid)
- [customTheme](#customtheme)
- [theme](#theme)
- [theme](#theme)
- [exportData](#exportdata)
- [theme](#theme)
- [theme](#theme)
- [requiredProperties](#requiredproperties)
- [themesData](#themesdata)
- [savedThemes](#savedthemes)

---

## SeasonalEffectManager

### コンストラクタ

```javascript
new SeasonalEffectManager()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `configManager` | 説明なし |
| `errorHandler` | 説明なし |
| `qualityController` | 説明なし |
| `seasonalThemes` | 季節テーマ定義 |
| `eventThemes` | 特別イベントテーマ |
| `currentSeason` | 現在のテーマ状態 |
| `currentEvent` | 説明なし |
| `activeTheme` | 説明なし |
| `customTheme` | 説明なし |
| `lastSeasonCheck` | 説明なし |
| `seasonCheckInterval` | 説明なし |
| `activeSeasonalEffects` | エフェクト状態 |
| `seasonalParticles` | 説明なし |
| `backgroundEffectEnabled` | 説明なし |
| `seasonalEffectsEnabled` | 設定 |
| `autoSeasonDetection` | 説明なし |
| `eventEffectsEnabled` | 説明なし |
| `customThemesEnabled` | 説明なし |
| `customThemes` | カスタムテーマ管理 |
| `userThemes` | 説明なし |
| `themeHistory` | 説明なし |
| `seasonalEffectsEnabled` | 設定マネージャーから設定を読み込み |
| `autoSeasonDetection` | 説明なし |
| `eventEffectsEnabled` | 説明なし |
| `backgroundEffectEnabled` | 説明なし |
| `activeTheme` | 説明なし |
| `currentEvent` | 説明なし |
| `activeTheme` | 説明なし |
| `currentEvent` | 説明なし |
| `activeTheme` | 説明なし |
| `currentSeason` | 説明なし |
| `currentSeason` | 説明なし |
| `currentSeason` | 説明なし |
| `currentSeason` | 説明なし |
| `lastSeasonCheck` | 説明なし |
| `seasonalEffectsEnabled` | 説明なし |
| `autoSeasonDetection` | 説明なし |
| `currentSeason` | 説明なし |
| `autoSeasonDetection` | 説明なし |
| `customTheme` | 説明なし |
| `customTheme` | 説明なし |
| `customTheme` | 説明なし |
| `customTheme` | 説明なし |
| `customTheme` | 説明なし |
| `customThemesEnabled` | 説明なし |
| `customTheme` | 説明なし |
| `seasonalParticles` | 説明なし |
| `themeHistory` | 説明なし |

### メソッド

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

カスタムテーマが設定されている場合は優先

**シグネチャ**:
```javascript
 if (this.customTheme && this.customThemesEnabled)
```

**パラメーター**:
- `this.customTheme && this.customThemesEnabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.customTheme && this.customThemesEnabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.autoSeasonDetection)
```

**パラメーター**:
- `this.autoSeasonDetection`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.autoSeasonDetection);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (activeEvent && this.eventEffectsEnabled)
```

**パラメーター**:
- `activeEvent && this.eventEffectsEnabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(activeEvent && this.eventEffectsEnabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentDate >= event.duration.start && currentDate <= event.duration.end)
```

**パラメーター**:
- `currentDate >= event.duration.start && currentDate <= event.duration.end`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentDate >= event.duration.start && currentDate <= event.duration.end);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createSeasonalBubbleEffect

**シグネチャ**:
```javascript
 createSeasonalBubbleEffect(x, y, bubbleType, bubbleSize)
```

**パラメーター**:
- `x`
- `y`
- `bubbleType`
- `bubbleSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSeasonalBubbleEffect(x, y, bubbleType, bubbleSize);

// createSeasonalBubbleEffectの実用的な使用例
const result = instance.createSeasonalBubbleEffect(/* 適切なパラメータ */);
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

#### createSeasonalComboEffect

**シグネチャ**:
```javascript
 createSeasonalComboEffect(x, y, comboCount)
```

**パラメーター**:
- `x`
- `y`
- `comboCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSeasonalComboEffect(x, y, comboCount);

// createSeasonalComboEffectの実用的な使用例
const result = instance.createSeasonalComboEffect(/* 適切なパラメータ */);
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

エフェクトタイプに応じたパーティクル生成

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

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

季節チェック

**シグネチャ**:
```javascript
 if (currentTime - this.lastSeasonCheck > this.seasonCheckInterval)
```

**パラメーター**:
- `currentTime - this.lastSeasonCheck > this.seasonCheckInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentTime - this.lastSeasonCheck > this.seasonCheckInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

背景エフェクトの更新

**シグネチャ**:
```javascript
 if (this.backgroundEffectEnabled)
```

**パラメーター**:
- `this.backgroundEffectEnabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.backgroundEffectEnabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [id, effect] of this.activeSeasonalEffects)
```

**パラメーター**:
- `const [id`
- `effect] of this.activeSeasonalEffects`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [id, effect] of this.activeSeasonalEffects);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

パーティクルの更新

**シグネチャ**:
```javascript
 for (let i = effect.particles.length - 1; i >= 0; i--)
```

**パラメーター**:
- `let i = effect.particles.length - 1; i >= 0; i--`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = effect.particles.length - 1; i >= 0; i--);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

重力適用

**シグネチャ**:
```javascript
 if (particle.gravity)
```

**パラメーター**:
- `particle.gravity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.gravity);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

風の影響

**シグネチャ**:
```javascript
 if (particle.flutter)
```

**パラメーター**:
- `particle.flutter`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.flutter);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

回転更新

**シグネチャ**:
```javascript
 if (particle.rotationSpeed)
```

**パラメーター**:
- `particle.rotationSpeed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.rotationSpeed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パーティクルの削除判定

**シグネチャ**:
```javascript
 if (particle.life <= 0)
```

**パラメーター**:
- `particle.life <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.life <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

エフェクトの削除判定

**シグネチャ**:
```javascript
 if (effect.particles.length === 0)
```

**パラメーター**:
- `effect.particles.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(effect.particles.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### render

**シグネチャ**:
```javascript
 render(ctx)
```

**パラメーター**:
- `ctx`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render(ctx);

// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);
```

#### for

**シグネチャ**:
```javascript
 for (const particle of effect.particles)
```

**パラメーター**:
- `const particle of effect.particles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const particle of effect.particles);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (particle.rotation)
```

**パラメーター**:
- `particle.rotation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.rotation);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (particle.type)
```

**パラメーター**:
- `particle.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(particle.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

花びらの形状を描画

**シグネチャ**:
```javascript
 for (let i = 0; i < 5; i++)
```

**パラメーター**:
- `let i = 0; i < 5; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 5; i++);

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

#### if

**シグネチャ**:
```javascript
 if (type === 'bat')
```

**パラメーター**:
- `type === 'bat'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(type === 'bat');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < 5; i++)
```

**パラメーター**:
- `let i = 0; i < 5; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 5; i++);

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

#### setSeasonalEffectsEnabled

**シグネチャ**:
```javascript
 setSeasonalEffectsEnabled(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setSeasonalEffectsEnabled(enabled);

// setSeasonalEffectsEnabledの実用的な使用例
const result = instance.setSeasonalEffectsEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!enabled)
```

**パラメーター**:
- `!enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setAutoSeasonDetection

**シグネチャ**:
```javascript
 setAutoSeasonDetection(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setAutoSeasonDetection(enabled);

// setAutoSeasonDetectionの実用的な使用例
const result = instance.setAutoSeasonDetection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setSeason

**シグネチャ**:
```javascript
 setSeason(season)
```

**パラメーター**:
- `season`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setSeason(season);

// setSeasonの実用的な使用例
const result = instance.setSeason(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.seasonalThemes[season])
```

**パラメーター**:
- `this.seasonalThemes[season]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.seasonalThemes[season]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentTheme

**シグネチャ**:
```javascript
 getCurrentTheme()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentTheme();

// getCurrentThemeの実用的な使用例
const result = instance.getCurrentTheme(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentSeason

**シグネチャ**:
```javascript
 getCurrentSeason()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentSeason();

// getCurrentSeasonの実用的な使用例
const result = instance.getCurrentSeason(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentEvent

**シグネチャ**:
```javascript
 getCurrentEvent()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentEvent();

// getCurrentEventの実用的な使用例
const result = instance.getCurrentEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createCustomTheme

**シグネチャ**:
```javascript
 createCustomTheme(themeName, themeConfig)
```

**パラメーター**:
- `themeName`
- `themeConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createCustomTheme(themeName, themeConfig);

// createCustomThemeの実用的な使用例
const result = instance.createCustomTheme(/* 適切なパラメータ */);
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

#### loadCustomTheme

**シグネチャ**:
```javascript
 loadCustomTheme(themeData)
```

**パラメーター**:
- `themeData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadCustomTheme(themeData);

// loadCustomThemeの実用的な使用例
const result = instance.loadCustomTheme(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

テーマデータの検証

**シグネチャ**:
```javascript
 if (!themeData || typeof themeData !== 'object')
```

**パラメーター**:
- `!themeData || typeof themeData !== 'object'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!themeData || typeof themeData !== 'object');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

必須プロパティのチェック

**シグネチャ**:
```javascript
 if (!themeData.name || !themeData.colors || !themeData.particles || !themeData.effects)
```

**パラメーター**:
- `!themeData.name || !themeData.colors || !themeData.particles || !themeData.effects`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!themeData.name || !themeData.colors || !themeData.particles || !themeData.effects);

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

#### applyCustomTheme

**シグネチャ**:
```javascript
 applyCustomTheme(themeId)
```

**パラメーター**:
- `themeId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyCustomTheme(themeId);

// applyCustomThemeの実用的な使用例
const result = instance.applyCustomTheme(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!theme)
```

**パラメーター**:
- `!theme`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!theme);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴の制限

**シグネチャ**:
```javascript
 if (this.themeHistory.length > 10)
```

**パラメーター**:
- `this.themeHistory.length > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.themeHistory.length > 10);

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

#### removeCustomTheme

**シグネチャ**:
```javascript
 removeCustomTheme(themeId)
```

**パラメーター**:
- `themeId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeCustomTheme(themeId);

// removeCustomThemeの実用的な使用例
const result = instance.removeCustomTheme(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

現在適用中のテーマの場合はクリア

**シグネチャ**:
```javascript
 if (this.customTheme && this.customTheme.id === themeId)
```

**パラメーター**:
- `this.customTheme && this.customTheme.id === themeId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.customTheme && this.customTheme.id === themeId);

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

#### clearCustomTheme

**シグネチャ**:
```javascript
 clearCustomTheme()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearCustomTheme();

// clearCustomThemeの実用的な使用例
const result = instance.clearCustomTheme(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCustomThemes

**シグネチャ**:
```javascript
 getCustomThemes()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCustomThemes();

// getCustomThemesの実用的な使用例
const result = instance.getCustomThemes(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### exportTheme

**シグネチャ**:
```javascript
 exportTheme(themeId)
```

**パラメーター**:
- `themeId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exportTheme(themeId);

// exportThemeの実用的な使用例
const result = instance.exportTheme(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!theme)
```

**パラメーター**:
- `!theme`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!theme);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### customizeThemeColors

**シグネチャ**:
```javascript
 customizeThemeColors(themeId, colorModifications)
```

**パラメーター**:
- `themeId`
- `colorModifications`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.customizeThemeColors(themeId, colorModifications);

// customizeThemeColorsの実用的な使用例
const result = instance.customizeThemeColors(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!theme)
```

**パラメーター**:
- `!theme`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!theme);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

色の更新

**シグネチャ**:
```javascript
 if (colorModifications.primary)
```

**パラメーター**:
- `colorModifications.primary`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(colorModifications.primary);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (colorModifications.secondary)
```

**パラメーター**:
- `colorModifications.secondary`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(colorModifications.secondary);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (colorModifications.accent)
```

**パラメーター**:
- `colorModifications.accent`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(colorModifications.accent);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

現在適用中のテーマの場合は更新

**シグネチャ**:
```javascript
 if (this.customTheme && this.customTheme.id === themeId)
```

**パラメーター**:
- `this.customTheme && this.customTheme.id === themeId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.customTheme && this.customTheme.id === themeId);

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

#### customizeThemeParticles

**シグネチャ**:
```javascript
 customizeThemeParticles(themeId, particleModifications)
```

**パラメーター**:
- `themeId`
- `particleModifications`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.customizeThemeParticles(themeId, particleModifications);

// customizeThemeParticlesの実用的な使用例
const result = instance.customizeThemeParticles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!theme)
```

**パラメーター**:
- `!theme`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!theme);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パーティクル設定の更新

**シグネチャ**:
```javascript
 if (particleModifications.types)
```

**パラメーター**:
- `particleModifications.types`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particleModifications.types);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (particleModifications.density !== undefined)
```

**パラメーター**:
- `particleModifications.density !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particleModifications.density !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (particleModifications.movement)
```

**パラメーター**:
- `particleModifications.movement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particleModifications.movement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (particleModifications.spawnRate !== undefined)
```

**パラメーター**:
- `particleModifications.spawnRate !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particleModifications.spawnRate !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

現在適用中のテーマの場合は更新

**シグネチャ**:
```javascript
 if (this.customTheme && this.customTheme.id === themeId)
```

**パラメーター**:
- `this.customTheme && this.customTheme.id === themeId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.customTheme && this.customTheme.id === themeId);

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

**シグネチャ**:
```javascript
 if (!config || typeof config !== 'object')
```

**パラメーター**:
- `!config || typeof config !== 'object'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!config || typeof config !== 'object');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const prop of requiredProperties)
```

**パラメーター**:
- `const prop of requiredProperties`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const prop of requiredProperties);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!config[prop])
```

**パラメーター**:
- `!config[prop]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!config[prop]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

エフェクト設定の検証

**シグネチャ**:
```javascript
 if (!config.effects.bubbleDestruction || !config.effects.comboEffect)
```

**パラメーター**:
- `!config.effects.bubbleDestruction || !config.effects.comboEffect`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!config.effects.bubbleDestruction || !config.effects.comboEffect);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [id, theme] of this.customThemes)
```

**パラメーター**:
- `const [id`
- `theme] of this.customThemes`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [id, theme] of this.customThemes);

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

#### setCustomThemesEnabled

**シグネチャ**:
```javascript
 setCustomThemesEnabled(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setCustomThemesEnabled(enabled);

// setCustomThemesEnabledの実用的な使用例
const result = instance.setCustomThemesEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!enabled && this.customTheme)
```

**パラメーター**:
- `!enabled && this.customTheme`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!enabled && this.customTheme);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getThemeHistory

**シグネチャ**:
```javascript
 getThemeHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getThemeHistory();

// getThemeHistoryの実用的な使用例
const result = instance.getThemeHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentCustomTheme

**シグネチャ**:
```javascript
 getCurrentCustomTheme()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentCustomTheme();

// getCurrentCustomThemeの実用的な使用例
const result = instance.getCurrentCustomTheme(/* 適切なパラメータ */);
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

## getSeasonalEffectManager

**シグネチャ**:
```javascript
getSeasonalEffectManager()
```

**使用例**:
```javascript
const result = getSeasonalEffectManager();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `activeEvent` | 説明なし |
| `now` | 説明なし |
| `month` | 説明なし |
| `day` | 説明なし |
| `now` | 説明なし |
| `currentDate` | 説明なし |
| `effect` | 説明なし |
| `colors` | 説明なし |
| `particleTypes` | 説明なし |
| `priority` | 説明なし |
| `effect` | 説明なし |
| `colors` | 説明なし |
| `particleTypes` | 説明なし |
| `effectId` | 説明なし |
| `effect` | 説明なし |
| `particleCount` | 説明なし |
| `angle` | 説明なし |
| `velocity` | 説明なし |
| `color` | 説明なし |
| `particleCount` | 説明なし |
| `angle` | 説明なし |
| `velocity` | 説明なし |
| `color` | 説明なし |
| `particleCount` | 説明なし |
| `angle` | 説明なし |
| `velocity` | 説明なし |
| `color` | 説明なし |
| `particleCount` | 説明なし |
| `angle` | 説明なし |
| `velocity` | 説明なし |
| `color` | 説明なし |
| `particleCount` | 説明なし |
| `angle` | 説明なし |
| `velocity` | 説明なし |
| `color` | 説明なし |
| `particleCount` | 説明なし |
| `angle` | 説明なし |
| `velocity` | 説明なし |
| `color` | 説明なし |
| `particleCount` | 説明なし |
| `angle` | 説明なし |
| `velocity` | 説明なし |
| `color` | 説明なし |
| `particleCount` | 説明なし |
| `angle` | 説明なし |
| `velocity` | 説明なし |
| `color` | 説明なし |
| `particleCount` | 説明なし |
| `angle` | 説明なし |
| `velocity` | 説明なし |
| `color` | 説明なし |
| `qualitySettings` | 説明なし |
| `currentTime` | 説明なし |
| `toRemove` | 説明なし |
| `particle` | 説明なし |
| `size` | 説明なし |
| `angle` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `angle` | 説明なし |
| `pulseSize` | 説明なし |
| `angle` | 説明なし |
| `radius` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `themeId` | 説明なし |
| `customTheme` | 説明なし |
| `theme` | 説明なし |
| `theme` | 説明なし |
| `exportData` | 説明なし |
| `theme` | 説明なし |
| `theme` | 説明なし |
| `requiredProperties` | 説明なし |
| `themesData` | 説明なし |
| `savedThemes` | 説明なし |

---

