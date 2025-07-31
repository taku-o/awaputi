# HelpSectionSelector

## 概要

ファイル: `scenes/components/HelpSectionSelector.js`  
最終更新: 2025/7/29 14:46:52

## 目次

## クラス
- [HelpSectionSelector](#helpsectionselector)
## 定数
- [buttonCount](#buttoncount)
- [totalSpacing](#totalspacing)
- [buttonWidth](#buttonwidth)
- [buttonX](#buttonx)
- [buttonY](#buttony)
- [isActive](#isactive)
- [isHovered](#ishovered)
- [isFocused](#isfocused)
- [isAnimating](#isanimating)
- [elapsed](#elapsed)
- [gradient](#gradient)
- [relativeX](#relativex)
- [relativeY](#relativey)
- [selectorHeight](#selectorheight)
- [buttonIndex](#buttonindex)
- [relativeX](#relativex)
- [relativeY](#relativey)
- [number](#number)
- [buttonCount](#buttoncount)
- [totalSpacing](#totalspacing)
- [buttonWidth](#buttonwidth)
- [buttonX](#buttonx)
- [oldSection](#oldsection)
- [c1](#c1)
- [c2](#c2)
- [r](#r)
- [g](#g)
- [b](#b)
- [result](#result)
- [buttonIndex](#buttonindex)

---

## HelpSectionSelector

### コンストラクタ

```javascript
new HelpSectionSelector(gameEngine, eventBus, state)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `eventBus` | 説明なし |
| `state` | 説明なし |
| `sections` | セクション設定 |
| `sectionLabels` | 説明なし |
| `currentSection` | 説明なし |
| `buttonHeight` | UI設定 |
| `buttonSpacing` | 説明なし |
| `cornerRadius` | 説明なし |
| `animationDuration` | アニメーション設定 |
| `animationStartTime` | 説明なし |
| `animatingSection` | 説明なし |
| `hoveredButton` | ホバー状態 |
| `focusedButton` | 説明なし |
| `accessibilitySettings` | アクセシビリティ設定 |
| `currentSection` | 説明なし |
| `hoveredButton` | 説明なし |
| `focusedButton` | 説明なし |
| `animatingSection` | 説明なし |
| `animatingSection` | 説明なし |
| `animationStartTime` | 説明なし |
| `hoveredButton` | 説明なし |
| `hoveredButton` | 説明なし |
| `focusedButton` | 説明なし |
| `focusedButton` | 説明なし |
| `focusedButton` | 説明なし |
| `focusedButton` | 説明なし |
| `currentSection` | 説明なし |
| `focusedButton` | 説明なし |
| `animatingSection` | 説明なし |
| `animationStartTime` | 説明なし |
| `hoveredButton` | 説明なし |
| `focusedButton` | 説明なし |
| `animatingSection` | 説明なし |
| `animationStartTime` | 説明なし |

### メソッド

#### render

**シグネチャ**:
```javascript
 render(context, x, y, width)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `width`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render(context, x, y, width);

// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);
```

#### for

ボタンを描画

**シグネチャ**:
```javascript
 for (let i = 0; i < this.sections.length; i++)
```

**パラメーター**:
- `let i = 0; i < this.sections.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < this.sections.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderBackground

**シグネチャ**:
```javascript
 renderBackground(context, x, y, width, height)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `width`
- `height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderBackground(context, x, y, width, height);

// renderBackgroundの実用的な使用例
const result = instance.renderBackground(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderSectionButton

**シグネチャ**:
```javascript
 renderSectionButton(context, x, y, width, height, section, label, index)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `width`
- `height`
- `section`
- `label`
- `index`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderSectionButton(context, x, y, width, height, section, label, index);

// renderSectionButtonの実用的な使用例
const result = instance.renderSectionButton(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (isAnimating && this.animationStartTime > 0)
```

**パラメーター**:
- `isAnimating && this.animationStartTime > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isAnimating && this.animationStartTime > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (animationProgress >= 1)
```

**パラメーター**:
- `animationProgress >= 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(animationProgress >= 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (isActive)
```

**パラメーター**:
- `isActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isActive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (isHovered || isFocused)
```

**パラメーター**:
- `isHovered || isFocused`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isHovered || isFocused);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

高コントラストモードの調整

**シグネチャ**:
```javascript
 if (this.accessibilitySettings.highContrast)
```

**パラメーター**:
- `this.accessibilitySettings.highContrast`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.accessibilitySettings.highContrast);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フォーカス時の追加視覚効果

**シグネチャ**:
```javascript
 if (isFocused && !isActive)
```

**パラメーター**:
- `isFocused && !isActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isFocused && !isActive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

テキストのシャドウ効果（アクティブ時）

**シグネチャ**:
```javascript
 if (isActive && !this.accessibilitySettings.highContrast)
```

**パラメーター**:
- `isActive && !this.accessibilitySettings.highContrast`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isActive && !this.accessibilitySettings.highContrast);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

アクティブボタンのインジケーター

**シグネチャ**:
```javascript
 if (isActive)
```

**パラメーター**:
- `isActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isActive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderActiveIndicator

**シグネチャ**:
```javascript
 renderActiveIndicator(context, x, y, width, height)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `width`
- `height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderActiveIndicator(context, x, y, width, height);

// renderActiveIndicatorの実用的な使用例
const result = instance.renderActiveIndicator(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleClick

**シグネチャ**:
```javascript
 handleClick(x, y, containerX, containerY, containerWidth)
```

**パラメーター**:
- `x`
- `y`
- `containerX`
- `containerY`
- `containerWidth`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleClick(x, y, containerX, containerY, containerWidth);

// handleClickの実用的な使用例
const result = instance.handleClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (relativeY < 10 || relativeY > 10 + this.buttonHeight)
```

**パラメーター**:
- `relativeY < 10 || relativeY > 10 + this.buttonHeight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(relativeY < 10 || relativeY > 10 + this.buttonHeight);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (buttonIndex !== -1)
```

**パラメーター**:
- `buttonIndex !== -1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(buttonIndex !== -1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleHover

**シグネチャ**:
```javascript
 handleHover(x, y, containerX, containerY, containerWidth)
```

**パラメーター**:
- `x`
- `y`
- `containerX`
- `containerY`
- `containerWidth`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleHover(x, y, containerX, containerY, containerWidth);

// handleHoverの実用的な使用例
const result = instance.handleHover(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

セレクター範囲内かチェック

**シグネチャ**:
```javascript
 if (relativeY >= 10 && relativeY <= 10 + this.buttonHeight)
```

**パラメーター**:
- `relativeY >= 10 && relativeY <= 10 + this.buttonHeight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(relativeY >= 10 && relativeY <= 10 + this.buttonHeight);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleKeyboard

**シグネチャ**:
```javascript
 handleKeyboard(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleKeyboard(event);

// handleKeyboardの実用的な使用例
const result = instance.handleKeyboard(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (event.key)
```

**パラメーター**:
- `event.key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(event.key);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (number >= 1 && number <= this.sections.length)
```

**パラメーター**:
- `number >= 1 && number <= this.sections.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(number >= 1 && number <= this.sections.length);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getButtonIndex

**シグネチャ**:
```javascript
 getButtonIndex(x, containerWidth)
```

**パラメーター**:
- `x`
- `containerWidth`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getButtonIndex(x, containerWidth);

// getButtonIndexの実用的な使用例
const result = instance.getButtonIndex(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < buttonCount; i++)
```

**パラメーター**:
- `let i = 0; i < buttonCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < buttonCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (x >= buttonX && x <= buttonX + buttonWidth)
```

**パラメーター**:
- `x >= buttonX && x <= buttonX + buttonWidth`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(x >= buttonX && x <= buttonX + buttonWidth);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### selectSection

**シグネチャ**:
```javascript
 selectSection(section, buttonIndex)
```

**パラメーター**:
- `section`
- `buttonIndex`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.selectSection(section, buttonIndex);

// selectSectionの実用的な使用例
const result = instance.selectSection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentSection !== section)
```

**パラメーター**:
- `this.currentSection !== section`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentSection !== section);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startSectionAnimation

**シグネチャ**:
```javascript
 startSectionAnimation(section)
```

**パラメーター**:
- `section`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startSectionAnimation(section);

// startSectionAnimationの実用的な使用例
const result = instance.startSectionAnimation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.accessibilitySettings.reducedMotion)
```

**パラメーター**:
- `!this.accessibilitySettings.reducedMotion`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.accessibilitySettings.reducedMotion);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### interpolateColor

**シグネチャ**:
```javascript
 interpolateColor(color1, color2, progress)
```

**パラメーター**:
- `color1`
- `color2`
- `progress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.interpolateColor(color1, color2, progress);

// interpolateColorの実用的な使用例
const result = instance.interpolateColor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hexToRgb

**シグネチャ**:
```javascript
 hexToRgb(hex)
```

**パラメーター**:
- `hex`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hexToRgb(hex);

// hexToRgbの実用的な使用例
const result = instance.hexToRgb(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### roundRect

**シグネチャ**:
```javascript
 roundRect(context, x, y, width, height, radius)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `width`
- `height`
- `radius`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.roundRect(context, x, y, width, height, radius);

// roundRectの実用的な使用例
const result = instance.roundRect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setCurrentSection

**シグネチャ**:
```javascript
 setCurrentSection(section)
```

**パラメーター**:
- `section`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setCurrentSection(section);

// setCurrentSectionの実用的な使用例
const result = instance.setCurrentSection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentSection

**シグネチャ**:
```javascript
 getCurrentSection()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentSection();

// getCurrentSectionの実用的な使用例
const result = instance.getCurrentSection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAvailableSections

**シグネチャ**:
```javascript
 getAvailableSections()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAvailableSections();

// getAvailableSectionsの実用的な使用例
const result = instance.getAvailableSections(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanup

**シグネチャ**:
```javascript
 cleanup()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanup();

// cleanupの実用的な使用例
const result = instance.cleanup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `buttonCount` | 説明なし |
| `totalSpacing` | 説明なし |
| `buttonWidth` | 説明なし |
| `buttonX` | 説明なし |
| `buttonY` | 説明なし |
| `isActive` | 説明なし |
| `isHovered` | 説明なし |
| `isFocused` | 説明なし |
| `isAnimating` | 説明なし |
| `elapsed` | 説明なし |
| `gradient` | 説明なし |
| `relativeX` | 説明なし |
| `relativeY` | 説明なし |
| `selectorHeight` | 説明なし |
| `buttonIndex` | 説明なし |
| `relativeX` | 説明なし |
| `relativeY` | 説明なし |
| `number` | 説明なし |
| `buttonCount` | 説明なし |
| `totalSpacing` | 説明なし |
| `buttonWidth` | 説明なし |
| `buttonX` | 説明なし |
| `oldSection` | 説明なし |
| `c1` | 説明なし |
| `c2` | 説明なし |
| `r` | 説明なし |
| `g` | 説明なし |
| `b` | 説明なし |
| `result` | 説明なし |
| `buttonIndex` | 説明なし |

---

