# BaseDialog

## 概要

ファイル: `scenes/components/BaseDialog.js`  
最終更新: 2025/7/29 14:46:52

## 目次

## クラス
- [BaseDialog](#basedialog)
## 定数
- [titleY](#titley)
- [errorY](#errory)
- [buttonCount](#buttoncount)
- [totalButtonWidth](#totalbuttonwidth)
- [startX](#startx)
- [button](#button)
- [buttonX](#buttonx)
- [buttonY](#buttony)
- [cornerRadius](#cornerradius)
- [buttonIndex](#buttonindex)
- [button](#button)
- [buttonCount](#buttoncount)
- [totalButtonWidth](#totalbuttonwidth)
- [startX](#startx)
- [buttonX](#buttonx)
- [buttonY](#buttony)
- [words](#words)
- [testLine](#testline)
- [metrics](#metrics)
- [testWidth](#testwidth)
- [usePound](#usepound)
- [col](#col)
- [num](#num)
- [settings](#settings)

---

## BaseDialog

### コンストラクタ

```javascript
new BaseDialog(gameEngine, eventBus, state)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `eventBus` | 説明なし |
| `state` | 説明なし |
| `title` | ダイアログの基本プロパティ |
| `isInitialized` | 説明なし |
| `data` | 説明なし |
| `onResult` | コールバック関数 |
| `onError` | 説明なし |
| `textSettings` | レンダリング設定 |
| `buttons` | ボタン設定 |
| `focusedButton` | 説明なし |
| `data` | 説明なし |
| `isInitialized` | 説明なし |
| `focusedButton` | 説明なし |
| `focusedButton` | 説明なし |
| `focusedButton` | 説明なし |
| `buttons` | 説明なし |
| `onResult` | 説明なし |
| `onError` | 説明なし |
| `data` | 説明なし |

### メソッド

#### initialize

**シグネチャ**:
```javascript
async initialize(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initialize(options = {});

// システムの初期化
await instance.initialize();
console.log('Initialization complete');
```

#### getData

**シグネチャ**:
```javascript
 getData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getData();

// getDataの実用的な使用例
const result = instance.getData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setData

**シグネチャ**:
```javascript
 setData(key, value)
```

**パラメーター**:
- `key`
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setData(key, value);

// setDataの実用的な使用例
const result = instance.setData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### render

**シグネチャ**:
```javascript
 render(context, layout)
```

**パラメーター**:
- `context`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render(context, layout);

// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);
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

#### renderTitle

**シグネチャ**:
```javascript
 renderTitle(context, layout)
```

**パラメーター**:
- `context`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderTitle(context, layout);

// renderTitleの実用的な使用例
const result = instance.renderTitle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderContent

**シグネチャ**:
```javascript
 renderContent(context, layout)
```

**パラメーター**:
- `context`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderContent(context, layout);

// renderContentの実用的な使用例
const result = instance.renderContent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderError

**シグネチャ**:
```javascript
 renderError(context, layout)
```

**パラメーター**:
- `context`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderError(context, layout);

// renderErrorの実用的な使用例
const result = instance.renderError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderButtons

**シグネチャ**:
```javascript
 renderButtons(context, layout)
```

**パラメーター**:
- `context`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderButtons(context, layout);

// renderButtonsの実用的な使用例
const result = instance.renderButtons(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < this.buttons.length; i++)
```

**パラメーター**:
- `let i = 0; i < this.buttons.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < this.buttons.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderButton

**シグネチャ**:
```javascript
 renderButton(context, button, x, y, width, height, focused)
```

**パラメーター**:
- `context`
- `button`
- `x`
- `y`
- `width`
- `height`
- `focused`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderButton(context, button, x, y, width, height, focused);

// renderButtonの実用的な使用例
const result = instance.renderButton(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (button.disabled)
```

**パラメーター**:
- `button.disabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(button.disabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (focused)
```

**パラメーター**:
- `focused`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(focused);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フォーカス時の境界線

**シグネチャ**:
```javascript
 if (focused)
```

**パラメーター**:
- `focused`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(focused);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleClick

**シグネチャ**:
```javascript
 handleClick(x, y, layout)
```

**パラメーター**:
- `x`
- `y`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleClick(x, y, layout);

// handleClickの実用的な使用例
const result = instance.handleClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (buttonIndex !== -1 && !this.buttons[buttonIndex].disabled)
```

**パラメーター**:
- `buttonIndex !== -1 && !this.buttons[buttonIndex].disabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(buttonIndex !== -1 && !this.buttons[buttonIndex].disabled);

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
 if (this.buttons.length > 0 && !this.buttons[this.focusedButton].disabled)
```

**パラメーター**:
- `this.buttons.length > 0 && !this.buttons[this.focusedButton].disabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.buttons.length > 0 && !this.buttons[this.focusedButton].disabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleButtonClick

**シグネチャ**:
```javascript
 handleButtonClick(buttonIndex)
```

**パラメーター**:
- `buttonIndex`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleButtonClick(buttonIndex);

// handleButtonClickの実用的な使用例
const result = instance.handleButtonClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (button.action)
```

**パラメーター**:
- `button.action`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(button.action);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleContentClick

**シグネチャ**:
```javascript
 handleContentClick(x, y, layout)
```

**パラメーター**:
- `x`
- `y`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleContentClick(x, y, layout);

// handleContentClickの実用的な使用例
const result = instance.handleContentClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleContentKeyboard

**シグネチャ**:
```javascript
 handleContentKeyboard(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleContentKeyboard(event);

// handleContentKeyboardの実用的な使用例
const result = instance.handleContentKeyboard(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupButtons

**シグネチャ**:
```javascript
 setupButtons()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupButtons();

// setupButtonsの実用的な使用例
const result = instance.setupButtons(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleOK

**シグネチャ**:
```javascript
 handleOK()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleOK();

// handleOKの実用的な使用例
const result = instance.handleOK(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.onResult)
```

**パラメーター**:
- `this.onResult`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.onResult);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleCancel

**シグネチャ**:
```javascript
 handleCancel()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleCancel();

// handleCancelの実用的な使用例
const result = instance.handleCancel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.onResult)
```

**パラメーター**:
- `this.onResult`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.onResult);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getClickedButtonIndex

**シグネチャ**:
```javascript
 getClickedButtonIndex(x, y, layout)
```

**パラメーター**:
- `x`
- `y`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getClickedButtonIndex(x, y, layout);

// getClickedButtonIndexの実用的な使用例
const result = instance.getClickedButtonIndex(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < this.buttons.length; i++)
```

**パラメーター**:
- `let i = 0; i < this.buttons.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < this.buttons.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (x >= buttonX && x <= buttonX + layout.buttonWidth &&
                y >= buttonY && y <= buttonY + layout.buttonHeight)
```

**パラメーター**:
- `x >= buttonX && x <= buttonX + layout.buttonWidth &&
                y >= buttonY && y <= buttonY + layout.buttonHeight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(x >= buttonX && x <= buttonX + layout.buttonWidth &&
                y >= buttonY && y <= buttonY + layout.buttonHeight);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### wrapText

**シグネチャ**:
```javascript
 wrapText(context, text, x, y, maxWidth)
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
const result = instance.wrapText(context, text, x, y, maxWidth);

// wrapTextの実用的な使用例
const result = instance.wrapText(/* 適切なパラメータ */);
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

#### lightenColor

**シグネチャ**:
```javascript
 lightenColor(color, amount)
```

**パラメーター**:
- `color`
- `amount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.lightenColor(color, amount);

// lightenColorの実用的な使用例
const result = instance.lightenColor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyAccessibilitySettings

**シグネチャ**:
```javascript
 applyAccessibilitySettings()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyAccessibilitySettings();

// applyAccessibilitySettingsの実用的な使用例
const result = instance.applyAccessibilitySettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.highContrast)
```

**パラメーター**:
- `settings.highContrast`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.highContrast);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.largeText)
```

**パラメーター**:
- `settings.largeText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.largeText);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleRenderError

**シグネチャ**:
```javascript
 handleRenderError(error, context, layout)
```

**パラメーター**:
- `error`
- `context`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleRenderError(error, context, layout);

// handleRenderErrorの実用的な使用例
const result = instance.handleRenderError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.onError)
```

**パラメーター**:
- `this.onError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.onError);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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
| `titleY` | 説明なし |
| `errorY` | 説明なし |
| `buttonCount` | 説明なし |
| `totalButtonWidth` | 説明なし |
| `startX` | 説明なし |
| `button` | 説明なし |
| `buttonX` | 説明なし |
| `buttonY` | 説明なし |
| `cornerRadius` | 説明なし |
| `buttonIndex` | 説明なし |
| `button` | 説明なし |
| `buttonCount` | 説明なし |
| `totalButtonWidth` | 説明なし |
| `startX` | 説明なし |
| `buttonX` | 説明なし |
| `buttonY` | 説明なし |
| `words` | 説明なし |
| `testLine` | 説明なし |
| `metrics` | 説明なし |
| `testWidth` | 説明なし |
| `usePound` | 説明なし |
| `col` | 説明なし |
| `num` | 説明なし |
| `settings` | 説明なし |

---

