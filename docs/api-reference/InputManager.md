# InputManager

## 概要

ファイル: `core/InputManager.js`  
最終更新: 2025/7/19 13:27:49

## 目次

## クラス
- [InputManager](#inputmanager)
## 定数
- [deviceInfo](#deviceinfo)
- [browserInfo](#browserinfo)
- [deviceInfo](#deviceinfo)
- [features](#features)
- [touchOptions](#touchoptions)
- [position](#position)
- [position](#position)
- [distance](#distance)
- [position](#position)
- [holdTime](#holdtime)
- [dragVector](#dragvector)
- [rect](#rect)
- [touches](#touches)
- [touch](#touch)
- [dx](#dx)
- [dy](#dy)
- [magnitude](#magnitude)
- [distance](#distance)
- [maxForce](#maxforce)
- [forceMultiplier](#forcemultiplier)
- [position](#position)
- [position](#position)
- [touch](#touch)
- [touch](#touch)
- [position](#position)
- [firstTouch](#firsttouch)
- [touch](#touch)
- [position](#position)
- [firstTouch](#firsttouch)
- [touch](#touch)
- [touchData](#touchdata)
- [holdTime](#holdtime)
- [scaleDelta](#scaledelta)
- [touches](#touches)
- [distance](#distance)
- [touches](#touches)
- [currentDistance](#currentdistance)
- [scaleDelta](#scaledelta)
- [scale](#scale)
- [currentTime](#currenttime)
- [rect](#rect)
- [rect](#rect)

---

## InputManager

### コンストラクタ

```javascript
new InputManager(canvas)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `canvas` | 説明なし |
| `isDragging` | 説明なし |
| `dragStartPosition` | 説明なし |
| `dragCurrentPosition` | 説明なし |
| `draggedBubble` | 説明なし |
| `activeTouches` | マルチタッチ対応 |
| `maxTouches` | 説明なし |
| `gestureState` | ジェスチャー認識 |
| `eventQueue` | イベント処理の最適化 |
| `isProcessingEvents` | 説明なし |
| `dragThreshold` | 説明なし |
| `clickThreshold` | モバイルは少し大きく |
| `tapTimeout` | タッチデバイスは長めに |
| `dragThreshold` | 説明なし |
| `clickThreshold` | 説明なし |
| `tapTimeout` | 説明なし |
| `clickThreshold` | iOS Safari は特別な処理が必要 |
| `dragThreshold` | 説明なし |
| `isMouseDown` | 状態管理 |
| `mouseDownTime` | 説明なし |
| `lastTapTime` | 説明なし |
| `tapCount` | 説明なし |
| `isMouseDown` | 説明なし |
| `mouseDownTime` | 説明なし |
| `dragStartPosition` | 説明なし |
| `dragCurrentPosition` | 説明なし |
| `isDragging` | 説明なし |
| `draggedBubble` | 説明なし |
| `dragCurrentPosition` | 説明なし |
| `isMouseDown` | 説明なし |
| `isDragging` | 説明なし |
| `draggedBubble` | 説明なし |
| `isDragging` | 説明なし |
| `isDragging` | ドラッグ状態をリセット |
| `isMouseDown` | 説明なし |
| `tapCount` | 説明なし |
| `tapCount` | 説明なし |
| `tapCount` | 説明なし |
| `lastTapTime` | 説明なし |
| `tapCount` | 説明なし |
| `tapCount` | 説明なし |
| `isMouseDown` | 説明なし |
| `isDragging` | 説明なし |
| `draggedBubble` | 説明なし |

### メソッド

#### setupDeviceSpecificSettings

**シグネチャ**:
```javascript
 setupDeviceSpecificSettings()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupDeviceSpecificSettings();

// setupDeviceSpecificSettingsの実用的な使用例
const result = instance.setupDeviceSpecificSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

タッチデバイスの設定

**シグネチャ**:
```javascript
 if (deviceInfo.isTouchDevice)
```

**パラメーター**:
- `deviceInfo.isTouchDevice`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(deviceInfo.isTouchDevice);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ブラウザ固有の調整

**シグネチャ**:
```javascript
 if (browserInfo.name === 'safari' && deviceInfo.isMobile)
```

**パラメーター**:
- `browserInfo.name === 'safari' && deviceInfo.isMobile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(browserInfo.name === 'safari' && deviceInfo.isMobile);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

ポインターイベントが利用可能な場合は優先的に使用

**シグネチャ**:
```javascript
 if (features.pointerEvents)
```

**パラメーター**:
- `features.pointerEvents`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(features.pointerEvents);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

キーボードイベント（デスクトップ用）

**シグネチャ**:
```javascript
 if (deviceInfo.isDesktop)
```

**パラメーター**:
- `deviceInfo.isDesktop`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(deviceInfo.isDesktop);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ジェスチャーイベント（タッチデバイス用）

**シグネチャ**:
```javascript
 if (deviceInfo.isTouchDevice)
```

**パラメーター**:
- `deviceInfo.isTouchDevice`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(deviceInfo.isTouchDevice);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupPointerEvents

**シグネチャ**:
```javascript
 setupPointerEvents()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupPointerEvents();

// setupPointerEventsの実用的な使用例
const result = instance.setupPointerEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupMouseAndTouchEvents

**シグネチャ**:
```javascript
 setupMouseAndTouchEvents()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupMouseAndTouchEvents();

// setupMouseAndTouchEventsの実用的な使用例
const result = instance.setupMouseAndTouchEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupKeyboardEvents

**シグネチャ**:
```javascript
 setupKeyboardEvents()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupKeyboardEvents();

// setupKeyboardEventsの実用的な使用例
const result = instance.setupKeyboardEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupGestureEvents

**シグネチャ**:
```javascript
 setupGestureEvents()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupGestureEvents();

// setupGestureEventsの実用的な使用例
const result = instance.setupGestureEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handlePointerDown

**シグネチャ**:
```javascript
 handlePointerDown(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handlePointerDown(event);

// handlePointerDownの実用的な使用例
const result = instance.handlePointerDown(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handlePointerMove

**シグネチャ**:
```javascript
 handlePointerMove(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handlePointerMove(event);

// handlePointerMoveの実用的な使用例
const result = instance.handlePointerMove(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ドラッグ判定

**シグネチャ**:
```javascript
 if (this.isMouseDown && !this.isDragging)
```

**パラメーター**:
- `this.isMouseDown && !this.isDragging`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isMouseDown && !this.isDragging);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance > this.dragThreshold)
```

**パラメーター**:
- `distance > this.dragThreshold`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance > this.dragThreshold);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ドラッグ中の処理

**シグネチャ**:
```javascript
 if (this.isDragging)
```

**パラメーター**:
- `this.isDragging`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isDragging);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handlePointerUp

**シグネチャ**:
```javascript
 handlePointerUp(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handlePointerUp(event);

// handlePointerUpの実用的な使用例
const result = instance.handlePointerUp(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isDragging)
```

**パラメーター**:
- `this.isDragging`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isDragging);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (holdTime < this.clickThreshold)
```

**パラメーター**:
- `holdTime < this.clickThreshold`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(holdTime < this.clickThreshold);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startDrag

**シグネチャ**:
```javascript
 startDrag()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startDrag();

// startDragの実用的な使用例
const result = instance.startDrag(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### endDrag

**シグネチャ**:
```javascript
 endDrag(endPosition)
```

**パラメーター**:
- `endPosition`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.endDrag(endPosition);

// endDragの実用的な使用例
const result = instance.endDrag(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getPointerPosition

**シグネチャ**:
```javascript
 getPointerPosition(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getPointerPosition(event);

// getPointerPositionの実用的な使用例
const result = instance.getPointerPosition(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (touches.length > 0)
```

**パラメーター**:
- `touches.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(touches.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateDistance

**シグネチャ**:
```javascript
 calculateDistance(pos1, pos2)
```

**パラメーター**:
- `pos1`
- `pos2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateDistance(pos1, pos2);

// calculateDistanceの実用的な使用例
const result = instance.calculateDistance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### normalizeDragVector

**シグネチャ**:
```javascript
 normalizeDragVector(vector)
```

**パラメーター**:
- `vector`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.normalizeDragVector(vector);

// normalizeDragVectorの実用的な使用例
const result = instance.normalizeDragVector(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateDragForce

**シグネチャ**:
```javascript
 calculateDragForce(dragVector)
```

**パラメーター**:
- `dragVector`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateDragForce(dragVector);

// calculateDragForceの実用的な使用例
const result = instance.calculateDragForce(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifyPointerDown

イベント通知メソッド（オーバーライド用）

**シグネチャ**:
```javascript
 notifyPointerDown(position)
```

**パラメーター**:
- `position`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifyPointerDown(position);

// notifyPointerDownの実用的な使用例
const result = instance.notifyPointerDown(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifyPointerMove

**シグネチャ**:
```javascript
 notifyPointerMove(position)
```

**パラメーター**:
- `position`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifyPointerMove(position);

// notifyPointerMoveの実用的な使用例
const result = instance.notifyPointerMove(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifyClick

**シグネチャ**:
```javascript
 notifyClick(position)
```

**パラメーター**:
- `position`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifyClick(position);

// notifyClickの実用的な使用例
const result = instance.notifyClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifyDragStart

**シグネチャ**:
```javascript
 notifyDragStart(startPosition)
```

**パラメーター**:
- `startPosition`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifyDragStart(startPosition);

// notifyDragStartの実用的な使用例
const result = instance.notifyDragStart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifyDragMove

**シグネチャ**:
```javascript
 notifyDragMove(currentPosition)
```

**パラメーター**:
- `currentPosition`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifyDragMove(currentPosition);

// notifyDragMoveの実用的な使用例
const result = instance.notifyDragMove(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifyDragEnd

**シグネチャ**:
```javascript
 notifyDragEnd(startPosition, endPosition, dragVector)
```

**パラメーター**:
- `startPosition`
- `endPosition`
- `dragVector`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifyDragEnd(startPosition, endPosition, dragVector);

// notifyDragEndの実用的な使用例
const result = instance.notifyDragEnd(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleEnhancedPointerDown

**シグネチャ**:
```javascript
 handleEnhancedPointerDown(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleEnhancedPointerDown(event);

// handleEnhancedPointerDownの実用的な使用例
const result = instance.handleEnhancedPointerDown(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最初のタッチの場合は通常の処理

**シグネチャ**:
```javascript
 if (this.activeTouches.size === 1)
```

**パラメーター**:
- `this.activeTouches.size === 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeTouches.size === 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.activeTouches.size === 2)
```

**パラメーター**:
- `this.activeTouches.size === 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeTouches.size === 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleEnhancedPointerMove

**シグネチャ**:
```javascript
 handleEnhancedPointerMove(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleEnhancedPointerMove(event);

// handleEnhancedPointerMoveの実用的な使用例
const result = instance.handleEnhancedPointerMove(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.activeTouches.size === 1)
```

**パラメーター**:
- `this.activeTouches.size === 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeTouches.size === 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.activeTouches.size === 2)
```

**パラメーター**:
- `this.activeTouches.size === 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeTouches.size === 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleEnhancedPointerUp

**シグネチャ**:
```javascript
 handleEnhancedPointerUp(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleEnhancedPointerUp(event);

// handleEnhancedPointerUpの実用的な使用例
const result = instance.handleEnhancedPointerUp(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.activeTouches.size === 0)
```

**パラメーター**:
- `this.activeTouches.size === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeTouches.size === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.activeTouches.size === 1)
```

**パラメーター**:
- `this.activeTouches.size === 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeTouches.size === 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handlePointerCancel

**シグネチャ**:
```javascript
 handlePointerCancel(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handlePointerCancel(event);

// handlePointerCancelの実用的な使用例
const result = instance.handlePointerCancel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.activeTouches.size === 0)
```

**パラメーター**:
- `this.activeTouches.size === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeTouches.size === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleTouchStart

**シグネチャ**:
```javascript
 handleTouchStart(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleTouchStart(event);

// handleTouchStartの実用的な使用例
const result = instance.handleTouchStart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

マルチタッチ対応

**シグネチャ**:
```javascript
 for (let i = 0; i < event.touches.length && i < this.maxTouches; i++)
```

**パラメーター**:
- `let i = 0; i < event.touches.length && i < this.maxTouches; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < event.touches.length && i < this.maxTouches; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.activeTouches.size === 1)
```

**パラメーター**:
- `this.activeTouches.size === 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeTouches.size === 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.activeTouches.size === 2)
```

**パラメーター**:
- `this.activeTouches.size === 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeTouches.size === 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleTouchMove

**シグネチャ**:
```javascript
 handleTouchMove(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleTouchMove(event);

// handleTouchMoveの実用的な使用例
const result = instance.handleTouchMove(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

アクティブなタッチを更新

**シグネチャ**:
```javascript
 for (let i = 0; i < event.touches.length; i++)
```

**パラメーター**:
- `let i = 0; i < event.touches.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < event.touches.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.activeTouches.size === 1)
```

**パラメーター**:
- `this.activeTouches.size === 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeTouches.size === 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.activeTouches.size === 2)
```

**パラメーター**:
- `this.activeTouches.size === 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeTouches.size === 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleTouchEnd

**シグネチャ**:
```javascript
 handleTouchEnd(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleTouchEnd(event);

// handleTouchEndの実用的な使用例
const result = instance.handleTouchEnd(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

終了したタッチを削除

**シグネチャ**:
```javascript
 for (let i = 0; i < event.changedTouches.length; i++)
```

**パラメーター**:
- `let i = 0; i < event.changedTouches.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < event.changedTouches.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

タップ判定

**シグネチャ**:
```javascript
 if (this.activeTouches.size === 0)
```

**パラメーター**:
- `this.activeTouches.size === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeTouches.size === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (holdTime < this.clickThreshold && !this.isDragging)
```

**パラメーター**:
- `holdTime < this.clickThreshold && !this.isDragging`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(holdTime < this.clickThreshold && !this.isDragging);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.activeTouches.size === 0)
```

**パラメーター**:
- `this.activeTouches.size === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeTouches.size === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.activeTouches.size === 1)
```

**パラメーター**:
- `this.activeTouches.size === 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeTouches.size === 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleTouchCancel

**シグネチャ**:
```javascript
 handleTouchCancel(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleTouchCancel(event);

// handleTouchCancelの実用的な使用例
const result = instance.handleTouchCancel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleKeyDown

**シグネチャ**:
```javascript
 handleKeyDown(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleKeyDown(event);

// handleKeyDownの実用的な使用例
const result = instance.handleKeyDown(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

ゲーム固有のキーボードショートカット

**シグネチャ**:
```javascript
 switch (event.code)
```

**パラメーター**:
- `event.code`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(event.code);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleKeyUp

**シグネチャ**:
```javascript
 handleKeyUp(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleKeyUp(event);

// handleKeyUpの実用的な使用例
const result = instance.handleKeyUp(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleGestureStart

**シグネチャ**:
```javascript
 handleGestureStart(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleGestureStart(event);

// handleGestureStartの実用的な使用例
const result = instance.handleGestureStart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleGestureChange

**シグネチャ**:
```javascript
 handleGestureChange(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleGestureChange(event);

// handleGestureChangeの実用的な使用例
const result = instance.handleGestureChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gestureState.isPinching)
```

**パラメーター**:
- `this.gestureState.isPinching`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gestureState.isPinching);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleGestureEnd

**シグネチャ**:
```javascript
 handleGestureEnd(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleGestureEnd(event);

// handleGestureEndの実用的な使用例
const result = instance.handleGestureEnd(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startMultiTouchGesture

**シグネチャ**:
```javascript
 startMultiTouchGesture()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startMultiTouchGesture();

// startMultiTouchGestureの実用的な使用例
const result = instance.startMultiTouchGesture(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleMultiTouchMove

**シグネチャ**:
```javascript
 handleMultiTouchMove()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleMultiTouchMove();

// handleMultiTouchMoveの実用的な使用例
const result = instance.handleMultiTouchMove(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### endMultiTouchGesture

**シグネチャ**:
```javascript
 endMultiTouchGesture()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.endMultiTouchGesture();

// endMultiTouchGestureの実用的な使用例
const result = instance.endMultiTouchGesture(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleTap

**シグネチャ**:
```javascript
 handleTap(position, holdTime)
```

**パラメーター**:
- `position`
- `holdTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleTap(position, holdTime);

// handleTapの実用的な使用例
const result = instance.handleTap(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ダブルタップ判定

**シグネチャ**:
```javascript
 if (currentTime - this.lastTapTime < this.tapTimeout)
```

**パラメーター**:
- `currentTime - this.lastTapTime < this.tapTimeout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentTime - this.lastTapTime < this.tapTimeout);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.tapCount === 2)
```

**パラメーター**:
- `this.tapCount === 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.tapCount === 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.tapCount === 1)
```

**パラメーター**:
- `this.tapCount === 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.tapCount === 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEnhancedPointerPosition

**シグネチャ**:
```javascript
 getEnhancedPointerPosition(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEnhancedPointerPosition(event);

// getEnhancedPointerPositionの実用的な使用例
const result = instance.getEnhancedPointerPosition(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTouchPosition

**シグネチャ**:
```javascript
 getTouchPosition(touch)
```

**パラメーター**:
- `touch`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTouchPosition(touch);

// getTouchPositionの実用的な使用例
const result = instance.getTouchPosition(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetInputState

**シグネチャ**:
```javascript
 resetInputState()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetInputState();

// resetInputStateの実用的な使用例
const result = instance.resetInputState(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDeviceInfo

**シグネチャ**:
```javascript
 getDeviceInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDeviceInfo();

// getDeviceInfoの実用的な使用例
const result = instance.getDeviceInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifyDoubleTap

拡張通知メソッド

**シグネチャ**:
```javascript
 notifyDoubleTap(position)
```

**パラメーター**:
- `position`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifyDoubleTap(position);

// notifyDoubleTapの実用的な使用例
const result = instance.notifyDoubleTap(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifyPinchGesture

**シグネチャ**:
```javascript
 notifyPinchGesture(scale, scaleDelta)
```

**パラメーター**:
- `scale`
- `scaleDelta`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifyPinchGesture(scale, scaleDelta);

// notifyPinchGestureの実用的な使用例
const result = instance.notifyPinchGesture(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifyKeyAction

**シグネチャ**:
```javascript
 notifyKeyAction(action)
```

**パラメーター**:
- `action`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifyKeyAction(action);

// notifyKeyActionの実用的な使用例
const result = instance.notifyKeyAction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDragState

**シグネチャ**:
```javascript
 getDragState()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDragState();

// getDragStateの実用的な使用例
const result = instance.getDragState(/* 適切なパラメータ */);
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
| `deviceInfo` | 説明なし |
| `browserInfo` | 説明なし |
| `deviceInfo` | 説明なし |
| `features` | 説明なし |
| `touchOptions` | 説明なし |
| `position` | 説明なし |
| `position` | 説明なし |
| `distance` | 説明なし |
| `position` | 説明なし |
| `holdTime` | 説明なし |
| `dragVector` | 説明なし |
| `rect` | 説明なし |
| `touches` | 説明なし |
| `touch` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `magnitude` | 説明なし |
| `distance` | 説明なし |
| `maxForce` | 説明なし |
| `forceMultiplier` | 説明なし |
| `position` | 説明なし |
| `position` | 説明なし |
| `touch` | 説明なし |
| `touch` | 説明なし |
| `position` | 説明なし |
| `firstTouch` | 説明なし |
| `touch` | 説明なし |
| `position` | 説明なし |
| `firstTouch` | 説明なし |
| `touch` | 説明なし |
| `touchData` | 説明なし |
| `holdTime` | 説明なし |
| `scaleDelta` | 説明なし |
| `touches` | 説明なし |
| `distance` | 説明なし |
| `touches` | 説明なし |
| `currentDistance` | 説明なし |
| `scaleDelta` | 説明なし |
| `scale` | 説明なし |
| `currentTime` | 説明なし |
| `rect` | 説明なし |
| `rect` | 説明なし |

---

