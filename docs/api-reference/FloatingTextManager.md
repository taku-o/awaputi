# FloatingTextManager

## 概要

ファイル: `ui/FloatingTextManager.js`  
最終更新: 2025/7/18 14:50:47

## 目次

## クラス
- [FloatingTextManager](#floatingtextmanager)
## 定数
- [floatingText](#floatingtext)
- [color](#color)
- [text](#text)
- [colors](#colors)
- [colorIndex](#colorindex)
- [configs](#configs)
- [config](#config)
- [animations](#animations)
- [config](#config)
- [progress](#progress)
- [time](#time)
- [pulse](#pulse)
- [hue](#hue)

---

## FloatingTextManager

### コンストラクタ

```javascript
new FloatingTextManager()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `texts` | 説明なし |
| `textId` | 説明なし |
| `texts` | 説明なし |
| `texts` | 説明なし |
| `texts` | 説明なし |

### メソッド

#### addText

**シグネチャ**:
```javascript
 addText(x, y, text, options = {})
```

**パラメーター**:
- `x`
- `y`
- `text`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addText(x, y, text, options = {});

// addTextの実用的な使用例
const result = instance.addText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addScoreText

**シグネチャ**:
```javascript
 addScoreText(x, y, score, multiplier = 1)
```

**パラメーター**:
- `x`
- `y`
- `score`
- `multiplier = 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addScoreText(x, y, score, multiplier = 1);

// addScoreTextの実用的な使用例
const result = instance.addScoreText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addDamageText

**シグネチャ**:
```javascript
 addDamageText(x, y, damage)
```

**パラメーター**:
- `x`
- `y`
- `damage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addDamageText(x, y, damage);

// addDamageTextの実用的な使用例
const result = instance.addDamageText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addHealText

**シグネチャ**:
```javascript
 addHealText(x, y, heal)
```

**パラメーター**:
- `x`
- `y`
- `heal`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addHealText(x, y, heal);

// addHealTextの実用的な使用例
const result = instance.addHealText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addComboText

**シグネチャ**:
```javascript
 addComboText(x, y, combo)
```

**パラメーター**:
- `x`
- `y`
- `combo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addComboText(x, y, combo);

// addComboTextの実用的な使用例
const result = instance.addComboText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addEffectText

**シグネチャ**:
```javascript
 addEffectText(x, y, effect, type = 'normal')
```

**パラメーター**:
- `x`
- `y`
- `effect`
- `type = 'normal'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addEffectText(x, y, effect, type = 'normal');

// addEffectTextの実用的な使用例
const result = instance.addEffectText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addAnimatedText

**シグネチャ**:
```javascript
 addAnimatedText(x, y, text, animationType)
```

**パラメーター**:
- `x`
- `y`
- `text`
- `animationType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addAnimatedText(x, y, text, animationType);

// addAnimatedTextの実用的な使用例
const result = instance.addAnimatedText(/* 適切なパラメータ */);
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

#### filter

**シグネチャ**:
```javascript
 filter(text => {
            text.life -= deltaTime;
            
            if (text.life <= 0)
```

**パラメーター**:
- `text => {
            text.life -= deltaTime;
            
            if (text.life <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.filter(text => {
            text.life -= deltaTime;
            
            if (text.life <= 0);

// filterの実用的な使用例
const result = instance.filter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

重力適用

**シグネチャ**:
```javascript
 if (text.gravity)
```

**パラメーター**:
- `text.gravity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(text.gravity);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

回転更新

**シグネチャ**:
```javascript
 if (text.rotationSpeed)
```

**パラメーター**:
- `text.rotationSpeed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(text.rotationSpeed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

アルファ値計算

**シグネチャ**:
```javascript
 if (text.fadeOut)
```

**パラメーター**:
- `text.fadeOut`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(text.fadeOut);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateAnimations

**シグネチャ**:
```javascript
 updateAnimations(text, deltaTime)
```

**パラメーター**:
- `text`
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateAnimations(text, deltaTime);

// updateAnimationsの実用的な使用例
const result = instance.updateAnimations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スケールアニメーション

**シグネチャ**:
```javascript
 if (text.scaleAnimation)
```

**パラメーター**:
- `text.scaleAnimation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(text.scaleAnimation);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (progress < 0.2)
```

**パラメーター**:
- `progress < 0.2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(progress < 0.2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バウンスアニメーション

**シグネチャ**:
```javascript
 if (text.bounceAnimation)
```

**パラメーター**:
- `text.bounceAnimation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(text.bounceAnimation);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パルスアニメーション

**シグネチャ**:
```javascript
 if (text.pulseAnimation)
```

**パラメーター**:
- `text.pulseAnimation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(text.pulseAnimation);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

虹色アニメーション（特殊）

**シグネチャ**:
```javascript
 if (text.color === '#FF0000' && text.pulseAnimation)
```

**パラメーター**:
- `text.color === '#FF0000' && text.pulseAnimation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(text.color === '#FF0000' && text.pulseAnimation);

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

**シグネチャ**:
```javascript
 if (text.scale !== 1)
```

**パラメーター**:
- `text.scale !== 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(text.scale !== 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (text.rotation !== 0)
```

**パラメーター**:
- `text.rotation !== 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(text.rotation !== 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

影を描画

**シグネチャ**:
```javascript
 if (text.shadow)
```

**パラメーター**:
- `text.shadow`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(text.shadow);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

アウトラインを描画

**シグネチャ**:
```javascript
 if (text.outline)
```

**パラメーター**:
- `text.outline`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(text.outline);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### removeText

**シグネチャ**:
```javascript
 removeText(id)
```

**パラメーター**:
- `id`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeText(id);

// removeTextの実用的な使用例
const result = instance.removeText(/* 適切なパラメータ */);
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

#### getTextCount

**シグネチャ**:
```javascript
 getTextCount()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTextCount();

// getTextCountの実用的な使用例
const result = instance.getTextCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTextsInArea

**シグネチャ**:
```javascript
 getTextsInArea(x, y, width, height)
```

**パラメーター**:
- `x`
- `y`
- `width`
- `height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTextsInArea(x, y, width, height);

// getTextsInAreaの実用的な使用例
const result = instance.getTextsInArea(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `floatingText` | 説明なし |
| `color` | 説明なし |
| `text` | 説明なし |
| `colors` | 説明なし |
| `colorIndex` | 説明なし |
| `configs` | 説明なし |
| `config` | 説明なし |
| `animations` | 説明なし |
| `config` | 説明なし |
| `progress` | 説明なし |
| `time` | 説明なし |
| `pulse` | 説明なし |
| `hue` | 説明なし |

---

