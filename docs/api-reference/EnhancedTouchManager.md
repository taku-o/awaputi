# EnhancedTouchManager

## 概要

ファイル: `core/EnhancedTouchManager.js`  
最終更新: 2025/7/29 9:06:33

## 目次

## クラス
- [EnhancedTouchManager](#enhancedtouchmanager)
## 定数
- [options](#options)
- [deviceInfo](#deviceinfo)
- [browserInfo](#browserinfo)
- [touches](#touches)
- [touch](#touch)
- [touchData](#touchdata)
- [position](#position)
- [touches](#touches)
- [touch](#touch)
- [touchData](#touchdata)
- [touches](#touches)
- [touch](#touch)
- [touchData](#touchdata)
- [touches](#touches)
- [touch](#touch)
- [touchData](#touchdata)
- [fakeTouch](#faketouch)
- [fakeTouch](#faketouch)
- [fakeTouch](#faketouch)
- [fakeTouch](#faketouch)
- [rect](#rect)
- [touch](#touch)
- [touch](#touch)
- [pos](#pos)
- [rect](#rect)
- [edge](#edge)
- [size](#size)
- [now](#now)
- [lastTouch](#lasttouch)
- [touchCount](#touchcount)
- [touchCount](#touchcount)
- [duration](#duration)
- [distance](#distance)
- [now](#now)
- [tapDistance](#tapdistance)
- [touches](#touches)
- [touch](#touch)
- [distance](#distance)
- [duration](#duration)
- [velocity](#velocity)
- [direction](#direction)
- [touches](#touches)
- [touch](#touch)
- [longPressTimer](#longpresstimer)
- [currentTouch](#currenttouch)
- [distance](#distance)
- [touches](#touches)
- [initialDistance](#initialdistance)
- [touches](#touches)
- [currentDistance](#currentdistance)
- [scale](#scale)
- [center](#center)
- [dx](#dx)
- [dy](#dy)
- [dx](#dx)
- [dy](#dy)
- [angle](#angle)
- [browserInfo](#browserinfo)
- [options](#options)

---

## EnhancedTouchManager

### コンストラクタ

```javascript
new EnhancedTouchManager(canvas, gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `canvas` | 説明なし |
| `gameEngine` | 説明なし |
| `configManager` | 説明なし |
| `errorHandler` | 説明なし |
| `touchSensitivity` | タッチ感度設定 |
| `multiTouchEnabled` | 説明なし |
| `gestureThresholds` | ジェスチャー閾値設定 |
| `touchState` | タッチ状態管理 |
| `touchPool` | パフォーマンス最適化 |
| `accidentalTouchPrevention` | 誤タッチ防止設定 |
| `callbacks` | コールバック登録 |
| `enable3DTouch` | 説明なし |
| `touchSensitivity` | 説明なし |
| `multiTouchEnabled` | 説明なし |

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

#### initializeTouchPool

**シグネチャ**:
```javascript
 initializeTouchPool()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeTouchPool();

// initializeTouchPoolの実用的な使用例
const result = instance.initializeTouchPool(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < 10; i++)
```

**パラメーター**:
- `let i = 0; i < 10; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 10; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

ポインターイベント（フォールバック）

**シグネチャ**:
```javascript
 if (window.PointerEvent)
```

**パラメーター**:
- `window.PointerEvent`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(window.PointerEvent);

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

iOS固有の最適化

**シグネチャ**:
```javascript
 if (deviceInfo.platform === 'ios')
```

**パラメーター**:
- `deviceInfo.platform === 'ios'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(deviceInfo.platform === 'ios');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

3D Touch / Force Touch対応

**シグネチャ**:
```javascript
 if ('ontouchforcechange' in document)
```

**パラメーター**:
- `'ontouchforcechange' in document`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if('ontouchforcechange' in document);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Android固有の最適化

**シグネチャ**:
```javascript
 if (deviceInfo.platform === 'android')
```

**パラメーター**:
- `deviceInfo.platform === 'android'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(deviceInfo.platform === 'android');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

小画面デバイスの調整

**シグネチャ**:
```javascript
 if (deviceInfo.screenInfo.width < 400)
```

**パラメーター**:
- `deviceInfo.screenInfo.width < 400`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(deviceInfo.screenInfo.width < 400);

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

**シグネチャ**:
```javascript
 for (let i = 0; i < touches.length; i++)
```

**パラメーター**:
- `let i = 0; i < touches.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < touches.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コールバック呼び出し

**シグネチャ**:
```javascript
 if (this.callbacks.onTouchStart)
```

**パラメーター**:
- `this.callbacks.onTouchStart`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.callbacks.onTouchStart);

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

**シグネチャ**:
```javascript
 for (let i = 0; i < touches.length; i++)
```

**パラメーター**:
- `let i = 0; i < touches.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < touches.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コールバック呼び出し

**シグネチャ**:
```javascript
 if (this.callbacks.onTouchMove)
```

**パラメーター**:
- `this.callbacks.onTouchMove`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.callbacks.onTouchMove);

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

**シグネチャ**:
```javascript
 for (let i = 0; i < touches.length; i++)
```

**パラメーター**:
- `let i = 0; i < touches.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < touches.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コールバック呼び出し

**シグネチャ**:
```javascript
 if (this.callbacks.onTouchEnd)
```

**パラメーター**:
- `this.callbacks.onTouchEnd`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.callbacks.onTouchEnd);

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

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < touches.length; i++)
```

**パラメーター**:
- `let i = 0; i < touches.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < touches.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (touchData)
```

**パラメーター**:
- `touchData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(touchData);

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

#### if

**シグネチャ**:
```javascript
 if (event.pointerType === 'touch')
```

**パラメーター**:
- `event.pointerType === 'touch'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.pointerType === 'touch');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### getTouchFromPool

**シグネチャ**:
```javascript
 getTouchFromPool()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTouchFromPool();

// getTouchFromPoolの実用的な使用例
const result = instance.getTouchFromPool(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.touchPool.pool.length > 0)
```

**パラメーター**:
- `this.touchPool.pool.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.touchPool.pool.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

プールが空の場合は新規作成

**シグネチャ**:
```javascript
 if (this.touchPool.active.size < this.touchPool.maxSize)
```

**パラメーター**:
- `this.touchPool.active.size < this.touchPool.maxSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.touchPool.active.size < this.touchPool.maxSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### returnTouchToPool

**シグネチャ**:
```javascript
 returnTouchToPool(touch)
```

**パラメーター**:
- `touch`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.returnTouchToPool(touch);

// returnTouchToPoolの実用的な使用例
const result = instance.returnTouchToPool(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isAccidentalTouch

**シグネチャ**:
```javascript
 isAccidentalTouch(touchData)
```

**パラメーター**:
- `touchData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isAccidentalTouch(touchData);

// isAccidentalTouchの実用的な使用例
const result = instance.isAccidentalTouch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

画面端チェック

**シグネチャ**:
```javascript
 if (pos.x < edge || pos.x > rect.width - edge ||
            pos.y < edge || pos.y > rect.height - edge)
```

**パラメーター**:
- `pos.x < edge || pos.x > rect.width - edge ||
            pos.y < edge || pos.y > rect.height - edge`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(pos.x < edge || pos.x > rect.width - edge ||
            pos.y < edge || pos.y > rect.height - edge);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (size < this.accidentalTouchPrevention.minTouchSize ||
            size > this.accidentalTouchPrevention.maxTouchSize)
```

**パラメーター**:
- `size < this.accidentalTouchPrevention.minTouchSize ||
            size > this.accidentalTouchPrevention.maxTouchSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(size < this.accidentalTouchPrevention.minTouchSize ||
            size > this.accidentalTouchPrevention.maxTouchSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (lastTouch && now - lastTouch.startTime < this.accidentalTouchPrevention.rapidTapThreshold)
```

**パラメーター**:
- `lastTouch && now - lastTouch.startTime < this.accidentalTouchPrevention.rapidTapThreshold`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(lastTouch && now - lastTouch.startTime < this.accidentalTouchPrevention.rapidTapThreshold);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processImmediateFeedback

**シグネチャ**:
```javascript
 processImmediateFeedback()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processImmediateFeedback();

// processImmediateFeedbackの実用的な使用例
const result = instance.processImmediateFeedback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

16ms以内に視覚的フィードバックを提供

**シグネチャ**:
```javascript
 if (this.gameEngine && this.gameEngine.provideTouchFeedback)
```

**パラメーター**:
- `this.gameEngine && this.gameEngine.provideTouchFeedback`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine && this.gameEngine.provideTouchFeedback);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startGestureDetection

**シグネチャ**:
```javascript
 startGestureDetection()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startGestureDetection();

// startGestureDetectionの実用的な使用例
const result = instance.startGestureDetection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (touchCount === 1)
```

**パラメーター**:
- `touchCount === 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(touchCount === 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (touchCount === 2)
```

**パラメーター**:
- `touchCount === 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(touchCount === 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateGestureDetection

**シグネチャ**:
```javascript
 updateGestureDetection()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateGestureDetection();

// updateGestureDetectionの実用的な使用例
const result = instance.updateGestureDetection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (touchCount === 1)
```

**パラメーター**:
- `touchCount === 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(touchCount === 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (touchCount === 2)
```

**パラメーター**:
- `touchCount === 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(touchCount === 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### endGestureDetection

**シグネチャ**:
```javascript
 endGestureDetection()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.endGestureDetection();

// endGestureDetectionの実用的な使用例
const result = instance.endGestureDetection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectTap

**シグネチャ**:
```javascript
 detectTap(touchData)
```

**パラメーター**:
- `touchData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectTap(touchData);

// detectTapの実用的な使用例
const result = instance.detectTap(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

タップ条件チェック

**シグネチャ**:
```javascript
 if (duration < this.gestureThresholds.longPress.duration &&
            distance < this.gestureThresholds.longPress.maxMovement)
```

**パラメーター**:
- `duration < this.gestureThresholds.longPress.duration &&
            distance < this.gestureThresholds.longPress.maxMovement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(duration < this.gestureThresholds.longPress.duration &&
            distance < this.gestureThresholds.longPress.maxMovement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ダブルタップ検出

**シグネチャ**:
```javascript
 if (now - this.touchState.lastTapTime < this.gestureThresholds.doubleTap.maxInterval)
```

**パラメーター**:
- `now - this.touchState.lastTapTime < this.gestureThresholds.doubleTap.maxInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(now - this.touchState.lastTapTime < this.gestureThresholds.doubleTap.maxInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (tapDistance < this.gestureThresholds.doubleTap.maxDistance)
```

**パラメーター**:
- `tapDistance < this.gestureThresholds.doubleTap.maxDistance`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(tapDistance < this.gestureThresholds.doubleTap.maxDistance);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.touchState.tapCount === 2)
```

**パラメーター**:
- `this.touchState.tapCount === 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.touchState.tapCount === 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ダブルタップ

**シグネチャ**:
```javascript
 if (this.callbacks.onDoubleTap)
```

**パラメーター**:
- `this.callbacks.onDoubleTap`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.callbacks.onDoubleTap);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectSwipe

**シグネチャ**:
```javascript
 detectSwipe()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectSwipe();

// detectSwipeの実用的な使用例
const result = instance.detectSwipe(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance > this.gestureThresholds.swipe.minDistance &&
            duration < this.gestureThresholds.swipe.maxTime &&
            velocity > this.gestureThresholds.swipe.minVelocity)
```

**パラメーター**:
- `distance > this.gestureThresholds.swipe.minDistance &&
            duration < this.gestureThresholds.swipe.maxTime &&
            velocity > this.gestureThresholds.swipe.minVelocity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance > this.gestureThresholds.swipe.minDistance &&
            duration < this.gestureThresholds.swipe.maxTime &&
            velocity > this.gestureThresholds.swipe.minVelocity);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.callbacks.onSwipe)
```

**パラメーター**:
- `this.callbacks.onSwipe`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.callbacks.onSwipe);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectLongPress

**シグネチャ**:
```javascript
 detectLongPress()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectLongPress();

// detectLongPressの実用的な使用例
const result = instance.detectLongPress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance < this.gestureThresholds.longPress.maxMovement)
```

**パラメーター**:
- `distance < this.gestureThresholds.longPress.maxMovement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance < this.gestureThresholds.longPress.maxMovement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.callbacks.onLongPress)
```

**パラメーター**:
- `this.callbacks.onLongPress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.callbacks.onLongPress);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectPinch

**シグネチャ**:
```javascript
 detectPinch()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectPinch();

// detectPinchの実用的な使用例
const result = instance.detectPinch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updatePinch

**シグネチャ**:
```javascript
 updatePinch()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updatePinch();

// updatePinchの実用的な使用例
const result = instance.updatePinch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.callbacks.onPinch)
```

**パラメーター**:
- `this.callbacks.onPinch`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.callbacks.onPinch);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### endGesture

**シグネチャ**:
```javascript
 endGesture(gestureName)
```

**パラメーター**:
- `gestureName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.endGesture(gestureName);

// endGestureの実用的な使用例
const result = instance.endGesture(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (gestureName === 'pinch')
```

**パラメーター**:
- `gestureName === 'pinch'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gestureName === 'pinch');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetGestures

**シグネチャ**:
```javascript
 resetGestures()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetGestures();

// resetGesturesの実用的な使用例
const result = instance.resetGestures(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(touch => {
            if (touch.longPressTimer)
```

**パラメーター**:
- `touch => {
            if (touch.longPressTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(touch => {
            if (touch.longPressTimer);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
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

#### calculateCenter

**シグネチャ**:
```javascript
 calculateCenter(pos1, pos2)
```

**パラメーター**:
- `pos1`
- `pos2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateCenter(pos1, pos2);

// calculateCenterの実用的な使用例
const result = instance.calculateCenter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateSwipeDirection

**シグネチャ**:
```javascript
 calculateSwipeDirection(startPos, endPos)
```

**パラメーター**:
- `startPos`
- `endPos`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateSwipeDirection(startPos, endPos);

// calculateSwipeDirectionの実用的な使用例
const result = instance.calculateSwipeDirection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addToGestureHistory

**シグネチャ**:
```javascript
 addToGestureHistory(type, data)
```

**パラメーター**:
- `type`
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addToGestureHistory(type, data);

// addToGestureHistoryの実用的な使用例
const result = instance.addToGestureHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴サイズ制限

**シグネチャ**:
```javascript
 if (this.touchState.gestureHistory.length > 50)
```

**パラメーター**:
- `this.touchState.gestureHistory.length > 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.touchState.gestureHistory.length > 50);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### adjustTouchSensitivity

**シグネチャ**:
```javascript
 adjustTouchSensitivity(level)
```

**パラメーター**:
- `level`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.adjustTouchSensitivity(level);

// adjustTouchSensitivityの実用的な使用例
const result = instance.adjustTouchSensitivity(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### configureTouchSettings

**シグネチャ**:
```javascript
 configureTouchSettings(settings)
```

**パラメーター**:
- `settings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.configureTouchSettings(settings);

// configureTouchSettingsの実用的な使用例
const result = instance.configureTouchSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.sensitivity !== undefined)
```

**パラメーター**:
- `settings.sensitivity !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.sensitivity !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.multiTouch !== undefined)
```

**パラメーター**:
- `settings.multiTouch !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.multiTouch !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.gestures)
```

**パラメーター**:
- `settings.gestures`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.gestures);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.accidentalTouchPrevention)
```

**パラメーター**:
- `settings.accidentalTouchPrevention`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.accidentalTouchPrevention);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTouchCapabilities

**シグネチャ**:
```javascript
 getTouchCapabilities()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTouchCapabilities();

// getTouchCapabilitiesの実用的な使用例
const result = instance.getTouchCapabilities(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### registerCallback

**シグネチャ**:
```javascript
 registerCallback(event, callback)
```

**パラメーター**:
- `event`
- `callback`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerCallback(event, callback);

// registerCallbackの実用的な使用例
const result = instance.registerCallback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTouchState

**シグネチャ**:
```javascript
 getTouchState()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTouchState();

// getTouchStateの実用的な使用例
const result = instance.getTouchState(/* 適切なパラメータ */);
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
 if (window.PointerEvent)
```

**パラメーター**:
- `window.PointerEvent`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(window.PointerEvent);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `options` | 説明なし |
| `deviceInfo` | 説明なし |
| `browserInfo` | 説明なし |
| `touches` | 説明なし |
| `touch` | 説明なし |
| `touchData` | 説明なし |
| `position` | 説明なし |
| `touches` | 説明なし |
| `touch` | 説明なし |
| `touchData` | 説明なし |
| `touches` | 説明なし |
| `touch` | 説明なし |
| `touchData` | 説明なし |
| `touches` | 説明なし |
| `touch` | 説明なし |
| `touchData` | 説明なし |
| `fakeTouch` | 説明なし |
| `fakeTouch` | 説明なし |
| `fakeTouch` | 説明なし |
| `fakeTouch` | 説明なし |
| `rect` | 説明なし |
| `touch` | 説明なし |
| `touch` | 説明なし |
| `pos` | 説明なし |
| `rect` | 説明なし |
| `edge` | 説明なし |
| `size` | 説明なし |
| `now` | 説明なし |
| `lastTouch` | 説明なし |
| `touchCount` | 説明なし |
| `touchCount` | 説明なし |
| `duration` | 説明なし |
| `distance` | 説明なし |
| `now` | 説明なし |
| `tapDistance` | 説明なし |
| `touches` | 説明なし |
| `touch` | 説明なし |
| `distance` | 説明なし |
| `duration` | 説明なし |
| `velocity` | 説明なし |
| `direction` | 説明なし |
| `touches` | 説明なし |
| `touch` | 説明なし |
| `longPressTimer` | 説明なし |
| `currentTouch` | 説明なし |
| `distance` | 説明なし |
| `touches` | 説明なし |
| `initialDistance` | 説明なし |
| `touches` | 説明なし |
| `currentDistance` | 説明なし |
| `scale` | 説明なし |
| `center` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `angle` | 説明なし |
| `browserInfo` | 説明なし |
| `options` | 説明なし |

---

