# DialogManager

## 概要

ファイル: `scenes/components/DialogManager.js`  
最終更新: 2025/7/29 14:46:52

## 目次

## クラス
- [DialogManager](#dialogmanager)
## 定数
- [DialogClass](#dialogclass)
- [dialog](#dialog)
- [currentType](#currenttype)
- [previousDialog](#previousdialog)
- [type](#type)
- [currentDialog](#currentdialog)
- [layout](#layout)
- [canvasWidth](#canvaswidth)
- [canvasHeight](#canvasheight)
- [width](#width)
- [height](#height)
- [x](#x)
- [y](#y)
- [cornerRadius](#cornerradius)
- [backgroundColor](#backgroundcolor)
- [DialogClass](#dialogclass)
- [dialogInstance](#dialoginstance)
- [layout](#layout)
- [currentDialog](#currentdialog)
- [layout](#layout)
- [DialogClass](#dialogclass)
- [dialogInstance](#dialoginstance)
- [currentDialog](#currentdialog)
- [DialogClass](#dialogclass)
- [dialogInstance](#dialoginstance)
- [elapsed](#elapsed)
- [duration](#duration)
- [progress](#progress)
- [scale](#scale)
- [centerX](#centerx)
- [centerY](#centery)
- [checkComplete](#checkcomplete)

---

## DialogManager

### コンストラクタ

```javascript
new DialogManager(gameEngine, eventBus, state)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `eventBus` | 説明なし |
| `state` | 説明なし |
| `dialogs` | ダイアログレジストリ |
| `dialogStack` | ダイアログスタック（複数ダイアログ対応） |
| `layout` | 共通レイアウト設定 |
| `animation` | アニメーション設定 |
| `animationState` | 現在のアニメーション状態 |
| `animationState` | 説明なし |
| `dialogStack` | 説明なし |

### メソッド

#### registerDialog

**シグネチャ**:
```javascript
 registerDialog(type, DialogClass)
```

**パラメーター**:
- `type`
- `DialogClass`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerDialog(type, DialogClass);

// registerDialogの実用的な使用例
const result = instance.registerDialog(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showDialog

**シグネチャ**:
```javascript
async showDialog(type, options = {})
```

**パラメーター**:
- `type`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showDialog(type, options = {});

// showDialogの実用的な使用例
const result = instance.showDialog(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

現在のダイアログをスタックに追加

**シグネチャ**:
```javascript
 if (this.state.showingDialog)
```

**パラメーター**:
- `this.state.showingDialog`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.state.showingDialog);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

アニメーション開始

**シグネチャ**:
```javascript
 if (this.animation.enabled)
```

**パラメーター**:
- `this.animation.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.animation.enabled);

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

#### closeDialog

**シグネチャ**:
```javascript
async closeDialog()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.closeDialog();

// closeDialogの実用的な使用例
const result = instance.closeDialog(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.state.showingDialog)
```

**パラメーター**:
- `!this.state.showingDialog`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.state.showingDialog);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

アニメーション開始

**シグネチャ**:
```javascript
 if (this.animation.enabled)
```

**パラメーター**:
- `this.animation.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.animation.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スタックから前のダイアログを復元

**シグネチャ**:
```javascript
 if (this.dialogStack.length > 0)
```

**パラメーター**:
- `this.dialogStack.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dialogStack.length > 0);

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

#### getCurrentDialog

**シグネチャ**:
```javascript
 getCurrentDialog()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentDialog();

// getCurrentDialogの実用的な使用例
const result = instance.getCurrentDialog(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isDialogOpen

**シグネチャ**:
```javascript
 isDialogOpen()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isDialogOpen();

// isDialogOpenの実用的な使用例
const result = instance.isDialogOpen(/* 適切なパラメータ */);
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
 if (!currentDialog)
```

**パラメーター**:
- `!currentDialog`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!currentDialog);

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

#### calculateDialogLayout

**シグネチャ**:
```javascript
 calculateDialogLayout(canvas)
```

**パラメーター**:
- `canvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateDialogLayout(canvas);

// calculateDialogLayoutの実用的な使用例
const result = instance.calculateDialogLayout(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderOverlay

**シグネチャ**:
```javascript
 renderOverlay(context, layout)
```

**パラメーター**:
- `context`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderOverlay(context, layout);

// renderOverlayの実用的な使用例
const result = instance.renderOverlay(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderDialogContent

**シグネチャ**:
```javascript
 renderDialogContent(context, layout, dialogInfo)
```

**パラメーター**:
- `context`
- `layout`
- `dialogInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderDialogContent(context, layout, dialogInfo);

// renderDialogContentの実用的な使用例
const result = instance.renderDialogContent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderErrorDialog

**シグネチャ**:
```javascript
 renderErrorDialog(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderErrorDialog(context);

// renderErrorDialogの実用的な使用例
const result = instance.renderErrorDialog(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleClick

**シグネチャ**:
```javascript
 handleClick(x, y)
```

**パラメーター**:
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleClick(x, y);

// handleClickの実用的な使用例
const result = instance.handleClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!currentDialog)
```

**パラメーター**:
- `!currentDialog`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!currentDialog);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ダイアログ外をクリックした場合は閉じる

**シグネチャ**:
```javascript
 if (x < layout.x || x > layout.x + layout.width ||
                y < layout.y || y > layout.y + layout.height)
```

**パラメーター**:
- `x < layout.x || x > layout.x + layout.width ||
                y < layout.y || y > layout.y + layout.height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(x < layout.x || x > layout.x + layout.width ||
                y < layout.y || y > layout.y + layout.height);

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

#### if

Escapeキーでダイアログを閉じる

**シグネチャ**:
```javascript
 if (event.key === 'Escape')
```

**パラメーター**:
- `event.key === 'Escape'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.key === 'Escape');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!currentDialog)
```

**パラメーター**:
- `!currentDialog`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!currentDialog);

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

#### startAnimation

**シグネチャ**:
```javascript
 startAnimation(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startAnimation(type);

// startAnimationの実用的な使用例
const result = instance.startAnimation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.animation.enabled)
```

**パラメーター**:
- `!this.animation.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.animation.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateAnimation

**シグネチャ**:
```javascript
 updateAnimation(context, layout)
```

**パラメーター**:
- `context`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateAnimation(context, layout);

// updateAnimationの実用的な使用例
const result = instance.updateAnimation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.animationState.isAnimating)
```

**パラメーター**:
- `!this.animationState.isAnimating`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.animationState.isAnimating);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

アニメーション完了チェック

**シグネチャ**:
```javascript
 if (progress >= 1)
```

**パラメーター**:
- `progress >= 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(progress >= 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyAnimationEffect

**シグネチャ**:
```javascript
 applyAnimationEffect(context, layout, progress)
```

**パラメーター**:
- `context`
- `layout`
- `progress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyAnimationEffect(context, layout, progress);

// applyAnimationEffectの実用的な使用例
const result = instance.applyAnimationEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (type === 'fade-in')
```

**パラメーター**:
- `type === 'fade-in'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(type === 'fade-in');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (type === 'fade-out')
```

**パラメーター**:
- `type === 'fade-out'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(type === 'fade-out');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (type === 'scale-in')
```

**パラメーター**:
- `type === 'scale-in'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(type === 'scale-in');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### waitForAnimation

**シグネチャ**:
```javascript
 waitForAnimation()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.waitForAnimation();

// waitForAnimationの実用的な使用例
const result = instance.waitForAnimation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.animationState.isAnimating)
```

**パラメーター**:
- `!this.animationState.isAnimating`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.animationState.isAnimating);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.animationState.isAnimating)
```

**パラメーター**:
- `!this.animationState.isAnimating`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.animationState.isAnimating);

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

#### setupEventListeners

**シグネチャ**:
```javascript
 setupEventListeners()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupEventListeners();

// setupEventListenersの実用的な使用例
const result = instance.setupEventListeners(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (error.component === 'dialog')
```

**パラメーター**:
- `error.component === 'dialog'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(error.component === 'dialog');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleError

**シグネチャ**:
```javascript
 handleError(operation, error)
```

**パラメーター**:
- `operation`
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleError(operation, error);

// handleErrorの実用的な使用例
const result = instance.handleError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

重大なエラーの場合はダイアログを強制終了

**シグネチャ**:
```javascript
 if (operation === 'render' || operation === 'showDialog')
```

**パラメーター**:
- `operation === 'render' || operation === 'showDialog'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(operation === 'render' || operation === 'showDialog');

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
| `DialogClass` | 説明なし |
| `dialog` | 説明なし |
| `currentType` | 説明なし |
| `previousDialog` | 説明なし |
| `type` | 説明なし |
| `currentDialog` | 説明なし |
| `layout` | 説明なし |
| `canvasWidth` | 説明なし |
| `canvasHeight` | 説明なし |
| `width` | 説明なし |
| `height` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `cornerRadius` | 説明なし |
| `backgroundColor` | 説明なし |
| `DialogClass` | 説明なし |
| `dialogInstance` | 説明なし |
| `layout` | 説明なし |
| `currentDialog` | 説明なし |
| `layout` | 説明なし |
| `DialogClass` | 説明なし |
| `dialogInstance` | 説明なし |
| `currentDialog` | 説明なし |
| `DialogClass` | 説明なし |
| `dialogInstance` | 説明なし |
| `elapsed` | 説明なし |
| `duration` | 説明なし |
| `progress` | 説明なし |
| `scale` | 説明なし |
| `centerX` | 説明なし |
| `centerY` | 説明なし |
| `checkComplete` | 説明なし |

---

