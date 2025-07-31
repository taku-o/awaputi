# ResponsiveCanvasManager

## 概要

ファイル: `utils/ResponsiveCanvasManager.js`  
最終更新: 2025/7/19 9:22:54

## 目次

## クラス
- [ResponsiveCanvasManager](#responsivecanvasmanager)
## 定数
- [optimalSize](#optimalsize)
- [pixelRatio](#pixelratio)
- [scale](#scale)
- [container](#container)
- [rect](#rect)
- [scaleX](#scalex)
- [scaleY](#scaley)
- [rect](#rect)
- [scaleX](#scalex)
- [scaleY](#scaley)
- [orientation](#orientation)
- [isLandscape](#islandscape)
- [messageDiv](#messagediv)
- [pixelRatio](#pixelratio)
- [deviceInfo](#deviceinfo)

---

## ResponsiveCanvasManager

### コンストラクタ

```javascript
new ResponsiveCanvasManager(canvas, gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `canvas` | 説明なし |
| `gameEngine` | 説明なし |
| `context` | 説明なし |
| `baseWidth` | 説明なし |
| `baseHeight` | 説明なし |
| `aspectRatio` | 説明なし |
| `currentSize` | 説明なし |
| `resizeTimeout` | 説明なし |
| `isInitialized` | 説明なし |
| `isInitialized` | 説明なし |
| `currentSize` | 説明なし |
| `resizeTimeout` | 説明なし |
| `resizeTimeout` | 説明なし |

### メソッド

#### setupResponsiveCanvas

**シグネチャ**:
```javascript
 setupResponsiveCanvas()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupResponsiveCanvas();

// setupResponsiveCanvasの実用的な使用例
const result = instance.setupResponsiveCanvas(/* 適切なパラメータ */);
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

画面の向き変更

**シグネチャ**:
```javascript
 if (screen.orientation)
```

**パラメーター**:
- `screen.orientation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(screen.orientation);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateCanvasSize

**シグネチャ**:
```javascript
 updateCanvasSize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateCanvasSize();

// updateCanvasSizeの実用的な使用例
const result = instance.updateCanvasSize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (pixelRatio > 1)
```

**パラメーター**:
- `pixelRatio > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(pixelRatio > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲームエンジンに変更を通知

**シグネチャ**:
```javascript
 if (this.isInitialized && this.gameEngine)
```

**パラメーター**:
- `this.isInitialized && this.gameEngine`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isInitialized && this.gameEngine);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### centerCanvas

**シグネチャ**:
```javascript
 centerCanvas()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.centerCanvas();

// centerCanvasの実用的な使用例
const result = instance.centerCanvas(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleResize

**シグネチャ**:
```javascript
 handleResize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleResize();

// handleResizeの実用的な使用例
const result = instance.handleResize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

デバウンス処理

**シグネチャ**:
```javascript
 if (this.resizeTimeout)
```

**パラメーター**:
- `this.resizeTimeout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.resizeTimeout);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleOrientationChange

**シグネチャ**:
```javascript
 handleOrientationChange()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleOrientationChange();

// handleOrientationChangeの実用的な使用例
const result = instance.handleOrientationChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleViewportChange

**シグネチャ**:
```javascript
 handleViewportChange()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleViewportChange();

// handleViewportChangeの実用的な使用例
const result = instance.handleViewportChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleFullscreenChange

**シグネチャ**:
```javascript
 handleFullscreenChange()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleFullscreenChange();

// handleFullscreenChangeの実用的な使用例
const result = instance.handleFullscreenChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### screenToCanvas

**シグネチャ**:
```javascript
 screenToCanvas(screenX, screenY)
```

**パラメーター**:
- `screenX`
- `screenY`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.screenToCanvas(screenX, screenY);

// screenToCanvasの実用的な使用例
const result = instance.screenToCanvas(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### canvasToScreen

**シグネチャ**:
```javascript
 canvasToScreen(canvasX, canvasY)
```

**パラメーター**:
- `canvasX`
- `canvasY`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.canvasToScreen(canvasX, canvasY);

// canvasToScreenの実用的な使用例
const result = instance.canvasToScreen(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getScaledCoordinates

**シグネチャ**:
```javascript
 getScaledCoordinates(x, y)
```

**パラメーター**:
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getScaledCoordinates(x, y);

// getScaledCoordinatesの実用的な使用例
const result = instance.getScaledCoordinates(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getScaledSize

**シグネチャ**:
```javascript
 getScaledSize(width, height)
```

**パラメーター**:
- `width`
- `height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getScaledSize(width, height);

// getScaledSizeの実用的な使用例
const result = instance.getScaledSize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCanvasInfo

**シグネチャ**:
```javascript
 getCanvasInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCanvasInfo();

// getCanvasInfoの実用的な使用例
const result = instance.getCanvasInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showOrientationMessage

**シグネチャ**:
```javascript
 showOrientationMessage()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showOrientationMessage();

// showOrientationMessageの実用的な使用例
const result = instance.showOrientationMessage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

縦向きの場合は横向きを推奨

**シグネチャ**:
```javascript
 if (!isLandscape && this.currentSize.displayWidth < 500)
```

**パラメーター**:
- `!isLandscape && this.currentSize.displayWidth < 500`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!isLandscape && this.currentSize.displayWidth < 500);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showTemporaryMessage

**シグネチャ**:
```javascript
 showTemporaryMessage(message, duration = 2000)
```

**パラメーター**:
- `message`
- `duration = 2000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showTemporaryMessage(message, duration = 2000);

// showTemporaryMessageの実用的な使用例
const result = instance.showTemporaryMessage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (messageDiv.parentNode)
```

**パラメーター**:
- `messageDiv.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(messageDiv.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### toggleFullscreen

**シグネチャ**:
```javascript
 toggleFullscreen()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toggleFullscreen();

// toggleFullscreenの実用的な使用例
const result = instance.toggleFullscreen(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!document.fullscreenElement)
```

**パラメーター**:
- `!document.fullscreenElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!document.fullscreenElement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.canvas.requestFullscreen)
```

**パラメーター**:
- `this.canvas.requestFullscreen`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.canvas.requestFullscreen);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.canvas.webkitRequestFullscreen)
```

**パラメーター**:
- `this.canvas.webkitRequestFullscreen`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.canvas.webkitRequestFullscreen);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.canvas.msRequestFullscreen)
```

**パラメーター**:
- `this.canvas.msRequestFullscreen`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.canvas.msRequestFullscreen);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (document.exitFullscreen)
```

**パラメーター**:
- `document.exitFullscreen`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(document.exitFullscreen);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (document.webkitExitFullscreen)
```

**パラメーター**:
- `document.webkitExitFullscreen`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(document.webkitExitFullscreen);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (document.msExitFullscreen)
```

**パラメーター**:
- `document.msExitFullscreen`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(document.msExitFullscreen);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getHighDPIContext

**シグネチャ**:
```javascript
 getHighDPIContext()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getHighDPIContext();

// getHighDPIContextの実用的な使用例
const result = instance.getHighDPIContext(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (pixelRatio > 1)
```

**パラメーター**:
- `pixelRatio > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(pixelRatio > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyDeviceOptimizations

**シグネチャ**:
```javascript
 applyDeviceOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyDeviceOptimizations();

// applyDeviceOptimizationsの実用的な使用例
const result = instance.applyDeviceOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

低解像度デバイスでの最適化

**シグネチャ**:
```javascript
 if (deviceInfo.screenInfo.pixelRatio < 1.5)
```

**パラメーター**:
- `deviceInfo.screenInfo.pixelRatio < 1.5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(deviceInfo.screenInfo.pixelRatio < 1.5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

高解像度デバイスでの最適化

**シグネチャ**:
```javascript
 if (deviceInfo.screenInfo.pixelRatio > 2)
```

**パラメーター**:
- `deviceInfo.screenInfo.pixelRatio > 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(deviceInfo.screenInfo.pixelRatio > 2);

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

#### if

**シグネチャ**:
```javascript
 if (this.resizeTimeout)
```

**パラメーター**:
- `this.resizeTimeout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.resizeTimeout);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (screen.orientation)
```

**パラメーター**:
- `screen.orientation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(screen.orientation);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `optimalSize` | 説明なし |
| `pixelRatio` | 説明なし |
| `scale` | 説明なし |
| `container` | 説明なし |
| `rect` | 説明なし |
| `scaleX` | 説明なし |
| `scaleY` | 説明なし |
| `rect` | 説明なし |
| `scaleX` | 説明なし |
| `scaleY` | 説明なし |
| `orientation` | 説明なし |
| `isLandscape` | 説明なし |
| `messageDiv` | 説明なし |
| `pixelRatio` | 説明なし |
| `deviceInfo` | 説明なし |

---

