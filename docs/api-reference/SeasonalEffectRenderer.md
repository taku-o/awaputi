# SeasonalEffectRenderer

## 概要

ファイル: `effects/renderers/SeasonalEffectRenderer.js`  
最終更新: 2025/7/30 0:29:15

## 目次

## クラス
- [SeasonalEffectRenderer](#seasonaleffectrenderer)
## 定数
- [season](#season)
- [event](#event)
- [seasonKey](#seasonkey)
- [petalCount](#petalcount)
- [particle](#particle)
- [angle](#angle)
- [distance](#distance)
- [rayCount](#raycount)
- [particle](#particle)
- [angle](#angle)
- [speed](#speed)
- [leafCount](#leafcount)
- [particle](#particle)
- [angle](#angle)
- [distance](#distance)
- [snowCount](#snowcount)
- [particle](#particle)
- [angle](#angle)
- [distance](#distance)
- [adjustedCount](#adjustedcount)
- [particle](#particle)
- [angle](#angle)
- [distance](#distance)
- [colors](#colors)
- [month](#month)
- [now](#now)
- [currentDate](#currentdate)
- [defaultCount](#defaultcount)
- [particle](#particle)
- [angle](#angle)
- [simpleCount](#simplecount)
- [particle](#particle)
- [angle](#angle)
- [activeEvent](#activeevent)
- [effects](#effects)

---

## SeasonalEffectRenderer

### コンストラクタ

```javascript
new SeasonalEffectRenderer(particleManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `particleManager` | 説明なし |
| `seasonalThemes` | 季節テーマの定義 |
| `eventThemes` | イベントテーマの定義 |
| `currentSeason` | 現在のテーマ状態 |
| `activeEvents` | 説明なし |
| `customTheme` | 説明なし |
| `customTheme` | 説明なし |

### メソッド

#### if

**シグネチャ**:
```javascript
 if (this.activeEvents.length > 0)
```

**パラメーター**:
- `this.activeEvents.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeEvents.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createSeasonalEffect

**シグネチャ**:
```javascript
 createSeasonalEffect(x, y, seasonType = null, eventType = null)
```

**パラメーター**:
- `x`
- `y`
- `seasonType = null`
- `eventType = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSeasonalEffect(x, y, seasonType = null, eventType = null);

// createSeasonalEffectの実用的な使用例
const result = instance.createSeasonalEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

イベントが優先、次に季節

**シグネチャ**:
```javascript
 if (event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (season && this.seasonalThemes[season])
```

**パラメーター**:
- `season && this.seasonalThemes[season]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(season && this.seasonalThemes[season]);

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

#### createSeasonEffect

**シグネチャ**:
```javascript
 createSeasonEffect(x, y, theme)
```

**パラメーター**:
- `x`
- `y`
- `theme`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSeasonEffect(x, y, theme);

// createSeasonEffectの実用的な使用例
const result = instance.createSeasonEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (seasonKey)
```

**パラメーター**:
- `seasonKey`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(seasonKey);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createSpringEffect

**シグネチャ**:
```javascript
 createSpringEffect(x, y, theme)
```

**パラメーター**:
- `x`
- `y`
- `theme`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSpringEffect(x, y, theme);

// createSpringEffectの実用的な使用例
const result = instance.createSpringEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < petalCount; i++)
```

**パラメーター**:
- `let i = 0; i < petalCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < petalCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createSummerEffect

**シグネチャ**:
```javascript
 createSummerEffect(x, y, theme)
```

**パラメーター**:
- `x`
- `y`
- `theme`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSummerEffect(x, y, theme);

// createSummerEffectの実用的な使用例
const result = instance.createSummerEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < rayCount; i++)
```

**パラメーター**:
- `let i = 0; i < rayCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < rayCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createAutumnEffect

**シグネチャ**:
```javascript
 createAutumnEffect(x, y, theme)
```

**パラメーター**:
- `x`
- `y`
- `theme`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createAutumnEffect(x, y, theme);

// createAutumnEffectの実用的な使用例
const result = instance.createAutumnEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < leafCount; i++)
```

**パラメーター**:
- `let i = 0; i < leafCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < leafCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createWinterEffect

**シグネチャ**:
```javascript
 createWinterEffect(x, y, theme)
```

**パラメーター**:
- `x`
- `y`
- `theme`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createWinterEffect(x, y, theme);

// createWinterEffectの実用的な使用例
const result = instance.createWinterEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < snowCount; i++)
```

**パラメーター**:
- `let i = 0; i < snowCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < snowCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createEventEffect

**シグネチャ**:
```javascript
 createEventEffect(x, y, event)
```

**パラメーター**:
- `x`
- `y`
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createEventEffect(x, y, event);

// createEventEffectの実用的な使用例
const result = instance.createEventEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createEventParticleEffect

**シグネチャ**:
```javascript
 createEventParticleEffect(x, y, effectName, config, event)
```

**パラメーター**:
- `x`
- `y`
- `effectName`
- `config`
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createEventParticleEffect(x, y, effectName, config, event);

// createEventParticleEffectの実用的な使用例
const result = instance.createEventParticleEffect(/* 適切なパラメータ */);
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

#### configureEventParticle

**シグネチャ**:
```javascript
 configureEventParticle(particle, effectName, event)
```

**パラメーター**:
- `particle`
- `effectName`
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.configureEventParticle(particle, effectName, event);

// configureEventParticleの実用的な使用例
const result = instance.configureEventParticle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (effectName)
```

**パラメーター**:
- `effectName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(effectName);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectCurrentSeason

**シグネチャ**:
```javascript
 detectCurrentSeason()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectCurrentSeason();

// detectCurrentSeasonの実用的な使用例
const result = instance.detectCurrentSeason(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectActiveEvents

**シグネチャ**:
```javascript
 detectActiveEvents()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectActiveEvents();

// detectActiveEventsの実用的な使用例
const result = instance.detectActiveEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getHighestPriorityEvent

**シグネチャ**:
```javascript
 getHighestPriorityEvent()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getHighestPriorityEvent();

// getHighestPriorityEventの実用的な使用例
const result = instance.getHighestPriorityEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createDefaultSeasonalEffect

**シグネチャ**:
```javascript
 createDefaultSeasonalEffect(x, y)
```

**パラメーター**:
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createDefaultSeasonalEffect(x, y);

// createDefaultSeasonalEffectの実用的な使用例
const result = instance.createDefaultSeasonalEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < defaultCount; i++)
```

**パラメーター**:
- `let i = 0; i < defaultCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < defaultCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createSimplifiedSeasonalEffect

**シグネチャ**:
```javascript
 createSimplifiedSeasonalEffect(x, y, theme)
```

**パラメーター**:
- `x`
- `y`
- `theme`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSimplifiedSeasonalEffect(x, y, theme);

// createSimplifiedSeasonalEffectの実用的な使用例
const result = instance.createSimplifiedSeasonalEffect(/* 適切なパラメータ */);
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

#### setCustomTheme

**シグネチャ**:
```javascript
 setCustomTheme(customTheme)
```

**パラメーター**:
- `customTheme`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setCustomTheme(customTheme);

// setCustomThemeの実用的な使用例
const result = instance.setCustomTheme(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentThemeInfo

**シグネチャ**:
```javascript
 getCurrentThemeInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentThemeInfo();

// getCurrentThemeInfoの実用的な使用例
const result = instance.getCurrentThemeInfo(/* 適切なパラメータ */);
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


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `season` | 説明なし |
| `event` | 説明なし |
| `seasonKey` | 説明なし |
| `petalCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `distance` | 説明なし |
| `rayCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `speed` | 説明なし |
| `leafCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `distance` | 説明なし |
| `snowCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `distance` | 説明なし |
| `adjustedCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `distance` | 説明なし |
| `colors` | 説明なし |
| `month` | 説明なし |
| `now` | 説明なし |
| `currentDate` | 説明なし |
| `defaultCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `simpleCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `activeEvent` | 説明なし |
| `effects` | 説明なし |

---

