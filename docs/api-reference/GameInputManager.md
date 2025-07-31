# GameInputManager

## 概要

ファイル: `scenes/GameInputManager.js`  
最終更新: 2025/7/29 9:06:33

## 目次

## クラス
- [GameInputManager](#gameinputmanager)
## 定数
- [bubbleClicked](#bubbleclicked)
- [targetBubble](#targetbubble)
- [success](#success)
- [force](#force)
- [swipeForce](#swipeforce)
- [swipeVector](#swipevector)
- [bubbles](#bubbles)
- [radius](#radius)
- [bubbles](#bubbles)

---

## GameInputManager

**継承元**: `InputManager`

### コンストラクタ

```javascript
new GameInputManager(canvas, gameScene)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameScene` | 説明なし |
| `gameEngine` | 説明なし |
| `enhancedTouchManager` | 説明なし |

### メソッド

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

#### if

**シグネチャ**:
```javascript
 if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled)
```

**パラメーター**:
- `this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

クリック位置にフィードバック

**シグネチャ**:
```javascript
 if (bubbleClicked)
```

**パラメーター**:
- `bubbleClicked`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubbleClicked);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (this.gameScene.isPaused || this.gameEngine.isGameOver)
```

**パラメーター**:
- `this.gameScene.isPaused || this.gameEngine.isGameOver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameScene.isPaused || this.gameEngine.isGameOver);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled)
```

**パラメーター**:
- `this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled)
```

**パラメーター**:
- `this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled)
```

**パラメーター**:
- `this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (success)
```

**パラメーター**:
- `success`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(success);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupEnhancedTouch

**シグネチャ**:
```javascript
 setupEnhancedTouch()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupEnhancedTouch();

// setupEnhancedTouchの実用的な使用例
const result = instance.setupEnhancedTouch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleSwipeGesture

**シグネチャ**:
```javascript
 handleSwipeGesture(gestureData)
```

**パラメーター**:
- `gestureData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleSwipeGesture(gestureData);

// handleSwipeGestureの実用的な使用例
const result = instance.handleSwipeGesture(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handlePinchGesture

**シグネチャ**:
```javascript
 handlePinchGesture(gestureData)
```

**パラメーター**:
- `gestureData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handlePinchGesture(gestureData);

// handlePinchGestureの実用的な使用例
const result = instance.handlePinchGesture(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleDoubleTapGesture

**シグネチャ**:
```javascript
 handleDoubleTapGesture(gestureData)
```

**パラメーター**:
- `gestureData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleDoubleTapGesture(gestureData);

// handleDoubleTapGestureの実用的な使用例
const result = instance.handleDoubleTapGesture(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleLongPressGesture

**シグネチャ**:
```javascript
 handleLongPressGesture(gestureData)
```

**パラメーター**:
- `gestureData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleLongPressGesture(gestureData);

// handleLongPressGestureの実用的な使用例
const result = instance.handleLongPressGesture(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

長押しで特殊アクション（例：時間停止効果）

**シグネチャ**:
```javascript
 if (this.gameEngine.activateSpecialPower)
```

**パラメーター**:
- `this.gameEngine.activateSpecialPower`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.activateSpecialPower);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAngleFromDirection

**シグネチャ**:
```javascript
 getAngleFromDirection(direction)
```

**パラメーター**:
- `direction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAngleFromDirection(direction);

// getAngleFromDirectionの実用的な使用例
const result = instance.getAngleFromDirection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (direction)
```

**パラメーター**:
- `direction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(direction);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateTouchSettings

**シグネチャ**:
```javascript
 updateTouchSettings(settings)
```

**パラメーター**:
- `settings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateTouchSettings(settings);

// updateTouchSettingsの実用的な使用例
const result = instance.updateTouchSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.enhancedTouchManager)
```

**パラメーター**:
- `this.enhancedTouchManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.enhancedTouchManager);

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
 if (this.enhancedTouchManager)
```

**パラメーター**:
- `this.enhancedTouchManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.enhancedTouchManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `bubbleClicked` | 説明なし |
| `targetBubble` | 説明なし |
| `success` | 説明なし |
| `force` | 説明なし |
| `swipeForce` | 説明なし |
| `swipeVector` | 説明なし |
| `bubbles` | 説明なし |
| `radius` | 説明なし |
| `bubbles` | 説明なし |

---

