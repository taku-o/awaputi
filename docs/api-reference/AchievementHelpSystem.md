# AchievementHelpSystem

## 概要

ファイル: `ui/AchievementHelpSystem.js`  
最終更新: 2025/7/28 13:03:17

## 目次

## クラス
- [AchievementHelpSystem](#achievementhelpsystem)
## 定数
- [panelWidth](#panelwidth)
- [panelHeight](#panelheight)
- [panelX](#panelx)
- [panelY](#panely)
- [navHeight](#navheight)
- [buttonWidth](#buttonwidth)
- [buttonX](#buttonx)
- [isActive](#isactive)
- [content](#content)
- [content](#content)
- [padding](#padding)
- [textX](#textx)
- [step](#step)
- [h](#h)
- [pulseAlpha](#pulsealpha)
- [panelWidth](#panelwidth)
- [panelHeight](#panelheight)
- [panelX](#panelx)
- [panelY](#panely)
- [buttonY](#buttony)
- [buttonWidth](#buttonwidth)
- [buttonHeight](#buttonheight)
- [buttonSize](#buttonsize)
- [words](#words)
- [testLine](#testline)
- [metrics](#metrics)
- [testWidth](#testwidth)
- [panelWidth](#panelwidth)
- [panelHeight](#panelheight)
- [panelX](#panelx)
- [panelY](#panely)
- [closeX](#closex)
- [closeY](#closey)
- [navHeight](#navheight)
- [buttonWidth](#buttonwidth)
- [buttonIndex](#buttonindex)
- [sections](#sections)
- [panelWidth](#panelwidth)
- [panelHeight](#panelheight)
- [panelX](#panelx)
- [panelY](#panely)
- [buttonY](#buttony)
- [nextX](#nextx)
- [skipX](#skipx)
- [achievement](#achievement)
- [category](#category)
- [sectionMap](#sectionmap)

---

## AchievementHelpSystem

### コンストラクタ

```javascript
new AchievementHelpSystem(achievementManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `achievementManager` | 説明なし |
| `isHelpVisible` | ヘルプ表示状態 |
| `currentHelpSection` | 説明なし |
| `tutorialProgress` | 説明なし |
| `padding` | UI設定 |
| `lineHeight` | 説明なし |
| `sectionSpacing` | 説明なし |
| `colors` | 色設定 |
| `helpContent` | ヘルプコンテンツ |
| `tutorialSteps` | チュートリアルステップ |
| `isHelpVisible` | 説明なし |
| `currentHelpSection` | 説明なし |
| `isHelpVisible` | 説明なし |
| `tutorialProgress` | 説明なし |
| `tutorialProgress` | 説明なし |
| `currentHelpSection` | 説明なし |
| `currentHelpSection` | 説明なし |
| `currentHelpSection` | 説明なし |

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

#### initializeHelpContent

**シグネチャ**:
```javascript
 initializeHelpContent()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeHelpContent();

// initializeHelpContentの実用的な使用例
const result = instance.initializeHelpContent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### initializeTutorialSteps

**シグネチャ**:
```javascript
 initializeTutorialSteps()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeTutorialSteps();

// initializeTutorialStepsの実用的な使用例
const result = instance.initializeTutorialSteps(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showHelp

**シグネチャ**:
```javascript
 showHelp(section = 'overview')
```

**パラメーター**:
- `section = 'overview'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showHelp(section = 'overview');

// showHelpの実用的な使用例
const result = instance.showHelp(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hideHelp

**シグネチャ**:
```javascript
 hideHelp()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hideHelp();

// hideHelpの実用的な使用例
const result = instance.hideHelp(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startTutorial

**シグネチャ**:
```javascript
 startTutorial()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startTutorial();

// startTutorialの実用的な使用例
const result = instance.startTutorial(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### nextTutorialStep

**シグネチャ**:
```javascript
 nextTutorialStep()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.nextTutorialStep();

// nextTutorialStepの実用的な使用例
const result = instance.nextTutorialStep(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.tutorialProgress >= this.tutorialSteps.length)
```

**パラメーター**:
- `this.tutorialProgress >= this.tutorialSteps.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.tutorialProgress >= this.tutorialSteps.length);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### completeTutorial

**シグネチャ**:
```javascript
 completeTutorial()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.completeTutorial();

// completeTutorialの実用的な使用例
const result = instance.completeTutorial(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

チュートリアル完了実績をトリガー

**シグネチャ**:
```javascript
 if (this.achievementManager)
```

**パラメーター**:
- `this.achievementManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.achievementManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### changeHelpSection

**シグネチャ**:
```javascript
 changeHelpSection(section)
```

**パラメーター**:
- `section`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.changeHelpSection(section);

// changeHelpSectionの実用的な使用例
const result = instance.changeHelpSection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.helpContent[section])
```

**パラメーター**:
- `this.helpContent[section]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.helpContent[section]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### render

**シグネチャ**:
```javascript
 render(context, canvas)
```

**パラメーター**:
- `context`
- `canvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render(context, canvas);

// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentHelpSection === 'tutorial')
```

**パラメーター**:
- `this.currentHelpSection === 'tutorial'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentHelpSection === 'tutorial');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderHelpContent

**シグネチャ**:
```javascript
 renderHelpContent(context, canvas)
```

**パラメーター**:
- `context`
- `canvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderHelpContent(context, canvas);

// renderHelpContentの実用的な使用例
const result = instance.renderHelpContent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderHelpNavigation

**シグネチャ**:
```javascript
 renderHelpNavigation(context, x, y, width)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `width`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderHelpNavigation(context, x, y, width);

// renderHelpNavigationの実用的な使用例
const result = instance.renderHelpNavigation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderHelpText

**シグネチャ**:
```javascript
 renderHelpText(context, x, y, width, height)
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
const result = instance.renderHelpText(context, x, y, width, height);

// renderHelpTextの実用的な使用例
const result = instance.renderHelpText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (line === '')
```

**パラメーター**:
- `line === ''`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(line === '');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderTutorial

**シグネチャ**:
```javascript
 renderTutorial(context, canvas)
```

**パラメーター**:
- `context`
- `canvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderTutorial(context, canvas);

// renderTutorialの実用的な使用例
const result = instance.renderTutorial(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ハイライト領域

**シグネチャ**:
```javascript
 if (step.highlight)
```

**パラメーター**:
- `step.highlight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(step.highlight);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderTutorialButton

**シグネチャ**:
```javascript
 renderTutorialButton(context, x, y, text)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderTutorialButton(context, x, y, text);

// renderTutorialButtonの実用的な使用例
const result = instance.renderTutorialButton(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderCloseButton

**シグネチャ**:
```javascript
 renderCloseButton(context, x, y)
```

**パラメーター**:
- `context`
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderCloseButton(context, x, y);

// renderCloseButtonの実用的な使用例
const result = instance.renderCloseButton(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderWrappedText

**シグネチャ**:
```javascript
 renderWrappedText(context, text, x, y, maxWidth)
```

**パラメーター**:
- `context`
- `text`
- `x`
- `y`
- `maxWidth`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderWrappedText(context, text, x, y, maxWidth);

// renderWrappedTextの実用的な使用例
const result = instance.renderWrappedText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let n = 0; n < words.length; n++)
```

**パラメーター**:
- `let n = 0; n < words.length; n++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let n = 0; n < words.length; n++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (testWidth > maxWidth && n > 0)
```

**パラメーター**:
- `testWidth > maxWidth && n > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(testWidth > maxWidth && n > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleClick

**シグネチャ**:
```javascript
 handleClick(x, y, canvas)
```

**パラメーター**:
- `x`
- `y`
- `canvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleClick(x, y, canvas);

// handleClickの実用的な使用例
const result = instance.handleClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentHelpSection === 'tutorial')
```

**パラメーター**:
- `this.currentHelpSection === 'tutorial'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentHelpSection === 'tutorial');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleHelpClick

**シグネチャ**:
```javascript
 handleHelpClick(x, y, canvas)
```

**パラメーター**:
- `x`
- `y`
- `canvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleHelpClick(x, y, canvas);

// handleHelpClickの実用的な使用例
const result = instance.handleHelpClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (x >= closeX && x <= closeX + 20 && y >= closeY && y <= closeY + 20)
```

**パラメーター**:
- `x >= closeX && x <= closeX + 20 && y >= closeY && y <= closeY + 20`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(x >= closeX && x <= closeX + 20 && y >= closeY && y <= closeY + 20);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (y >= panelY && y <= panelY + navHeight)
```

**パラメーター**:
- `y >= panelY && y <= panelY + navHeight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(y >= panelY && y <= panelY + navHeight);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (buttonIndex >= 0 && buttonIndex < sections.length)
```

**パラメーター**:
- `buttonIndex >= 0 && buttonIndex < sections.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(buttonIndex >= 0 && buttonIndex < sections.length);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleTutorialClick

**シグネチャ**:
```javascript
 handleTutorialClick(x, y, canvas)
```

**パラメーター**:
- `x`
- `y`
- `canvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleTutorialClick(x, y, canvas);

// handleTutorialClickの実用的な使用例
const result = instance.handleTutorialClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (x >= nextX && x <= nextX + 60 && y >= buttonY && y <= buttonY + 25)
```

**パラメーター**:
- `x >= nextX && x <= nextX + 60 && y >= buttonY && y <= buttonY + 25`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(x >= nextX && x <= nextX + 60 && y >= buttonY && y <= buttonY + 25);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (x >= skipX && x <= skipX + 60 && y >= buttonY && y <= buttonY + 25)
```

**パラメーター**:
- `x >= skipX && x <= skipX + 60 && y >= buttonY && y <= buttonY + 25`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(x >= skipX && x <= skipX + 60 && y >= buttonY && y <= buttonY + 25);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getHelpState

**シグネチャ**:
```javascript
 getHelpState()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getHelpState();

// getHelpStateの実用的な使用例
const result = instance.getHelpState(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showContextHelp

**シグネチャ**:
```javascript
 showContextHelp(achievementId)
```

**パラメーター**:
- `achievementId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showContextHelp(achievementId);

// showContextHelpの実用的な使用例
const result = instance.showContextHelp(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `panelWidth` | 説明なし |
| `panelHeight` | 説明なし |
| `panelX` | 説明なし |
| `panelY` | 説明なし |
| `navHeight` | 説明なし |
| `buttonWidth` | 説明なし |
| `buttonX` | 説明なし |
| `isActive` | 説明なし |
| `content` | 説明なし |
| `content` | 説明なし |
| `padding` | 説明なし |
| `textX` | 説明なし |
| `step` | 説明なし |
| `h` | 説明なし |
| `pulseAlpha` | 説明なし |
| `panelWidth` | 説明なし |
| `panelHeight` | 説明なし |
| `panelX` | 説明なし |
| `panelY` | 説明なし |
| `buttonY` | 説明なし |
| `buttonWidth` | 説明なし |
| `buttonHeight` | 説明なし |
| `buttonSize` | 説明なし |
| `words` | 説明なし |
| `testLine` | 説明なし |
| `metrics` | 説明なし |
| `testWidth` | 説明なし |
| `panelWidth` | 説明なし |
| `panelHeight` | 説明なし |
| `panelX` | 説明なし |
| `panelY` | 説明なし |
| `closeX` | 説明なし |
| `closeY` | 説明なし |
| `navHeight` | 説明なし |
| `buttonWidth` | 説明なし |
| `buttonIndex` | 説明なし |
| `sections` | 説明なし |
| `panelWidth` | 説明なし |
| `panelHeight` | 説明なし |
| `panelX` | 説明なし |
| `panelY` | 説明なし |
| `buttonY` | 説明なし |
| `nextX` | 説明なし |
| `skipX` | 説明なし |
| `achievement` | 説明なし |
| `category` | 説明なし |
| `sectionMap` | 説明なし |

---

