# BubbleManager

## 概要

ファイル: `managers/BubbleManager.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [BubbleManager](#bubblemanager)
## 定数
- [maxBubbles](#maxbubbles)
- [typeValidation](#typevalidation)
- [positionValidation](#positionvalidation)
- [bubble](#bubble)
- [healthMap](#healthmap)
- [bubble](#bubble)
- [types](#types)
- [canvas](#canvas)
- [margin](#margin)
- [adjustedDeltaTime](#adjusteddeltatime)
- [adjustedSpawnInterval](#adjustedspawninterval)
- [bubble](#bubble)
- [deltaSeconds](#deltaseconds)
- [speed](#speed)
- [canvas](#canvas)
- [radius](#radius)
- [dx](#dx)
- [dy](#dy)
- [distance](#distance)
- [escapeDistance](#escapedistance)
- [escapeForce](#escapeforce)
- [escapeDirection](#escapedirection)
- [maxEscapeSpeed](#maxescapespeed)
- [currentSpeed](#currentspeed)
- [margin](#margin)
- [bubblesWithPriority](#bubbleswithpriority)
- [targetCount](#targetcount)
- [toRemove](#toremove)
- [item](#item)
- [rareTypes](#raretypes)
- [distance](#distance)
- [canvas](#canvas)
- [margin](#margin)
- [isOffscreen](#isoffscreen)
- [timer](#timer)
- [disappearTypes](#disappeartypes)
- [damage](#damage)
- [baseDamage](#basedamage)
- [renderQuality](#renderquality)
- [step](#step)
- [bubble](#bubble)
- [config](#config)
- [score](#score)
- [gameScene](#gamescene)
- [healAmount](#healamount)
- [damage](#damage)
- [gameScene](#gamescene)
- [bubbles](#bubbles)
- [pathLength](#pathlength)
- [direction](#direction)
- [distance](#distance)
- [bubbles](#bubbles)
- [distance](#distance)
- [A](#a)
- [B](#b)
- [C](#c)
- [D](#d)
- [dot](#dot)
- [lenSq](#lensq)
- [dx](#dx)
- [dy](#dy)
- [gameScene](#gamescene)
- [gameScene](#gamescene)
- [affectedBubbles](#affectedbubbles)
- [dx](#dx)
- [dy](#dy)
- [distance](#distance)
- [bubble](#bubble)
- [recent](#recent)
- [previous](#previous)
- [timeDiff](#timediff)
- [dragDistance](#dragdistance)
- [velocityMagnitude](#velocitymagnitude)
- [distanceComponent](#distancecomponent)
- [velocityComponent](#velocitycomponent)
- [combinedVector](#combinedvector)
- [magnitude](#magnitude)
- [dragVector](#dragvector)
- [dragDistance](#dragdistance)
- [velocity](#velocity)
- [flickStrength](#flickstrength)
- [forceDirection](#forcedirection)
- [affectedBubbles](#affectedbubbles)
- [dx](#dx)
- [dy](#dy)
- [distance](#distance)
- [dx](#dx)
- [dy](#dy)
- [distance](#distance)
- [pullForce](#pullforce)
- [direction](#direction)
- [affectedBubbles](#affectedbubbles)
- [dx](#dx)
- [dy](#dy)
- [distance](#distance)
- [delay](#delay)
- [affectedBubbles](#affectedbubbles)
- [dx](#dx)
- [dy](#dy)
- [distance](#distance)
- [dx](#dx)
- [dy](#dy)
- [distance](#distance)
- [pullForce](#pullforce)
- [direction](#direction)
- [affectedBubbles](#affectedbubbles)
- [dx](#dx)
- [dy](#dy)
- [distance](#distance)
- [delay](#delay)
- [bubble](#bubble)

---

## BubbleManager

### コンストラクタ

```javascript
new BubbleManager(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `bubbles` | 説明なし |
| `spawnTimer` | 説明なし |
| `spawnInterval` | 説明なし |
| `maxBubbles` | 2秒間隔 |
| `mousePosition` | 説明なし |
| `stageConfig` | 説明なし |
| `baseSpawnRate` | ステージ設定 |
| `draggedBubble` | ドラッグ関連の拡張（両方のシステムを統合） |
| `isDragging` | 説明なし |
| `dragStartPosition` | 説明なし |
| `dragCurrentPosition` | 説明なし |
| `dragHistory` | 説明なし |
| `dragPhysics` | ドラッグ軌跡の履歴（速度計算用） |
| `lastCullTime` | パフォーマンス最適化 |
| `cullInterval` | 説明なし |
| `offscreenBubbles` | 画面外消滅処理用（統合版） |
| `offscreenTimer` | 画面外に出た泡を追跡 |
| `offscreenTimeout` | 画面外での滞在時間 |
| `offscreenTimeoutDuration` | 画面外タイムアウト管理（パフォーマンス最適化用） |
| `stageConfig` | 説明なし |
| `maxBubbles` | 説明なし |
| `baseSpawnRate` | 説明なし |
| `spawnInterval` | 生成間隔を調整 |
| `spawnTimer` | 説明なし |
| `lastCullTime` | 説明なし |
| `draggedBubble` | 説明なし |
| `isDragging` | 説明なし |
| `dragStartPosition` | 説明なし |
| `dragCurrentPosition` | 説明なし |
| `dragHistory` | 説明なし |
| `dragCurrentPosition` | 説明なし |
| `isDragging` | 説明なし |
| `draggedBubble` | 説明なし |
| `dragStartPosition` | 説明なし |
| `dragCurrentPosition` | 説明なし |
| `dragHistory` | 説明なし |
| `bubbles` | 説明なし |
| `specialSpawnRates` | 説明なし |
| `bubbles` | IDによる削除 |
| `bubbles` | 条件関数による削除 |
| `bubbles` | 説明なし |

### メソッド

#### spawnBubble

**シグネチャ**:
```javascript
 spawnBubble(type = null, position = null)
```

**パラメーター**:
- `type = null`
- `position = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.spawnBubble(type = null, position = null);

// spawnBubbleの実用的な使用例
const result = instance.spawnBubble(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.bubbles.length >= maxBubbles)
```

**パラメーター**:
- `this.bubbles.length >= maxBubbles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.bubbles.length >= maxBubbles);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

入力値を検証

**シグネチャ**:
```javascript
 if (type !== null)
```

**パラメーター**:
- `type !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(type !== null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!typeValidation.isValid)
```

**パラメーター**:
- `!typeValidation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!typeValidation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (position !== null)
```

**パラメーター**:
- `position !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(position !== null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!positionValidation.isValid)
```

**パラメーター**:
- `!positionValidation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!positionValidation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ランダムな種類を選択（指定がない場合）

**シグネチャ**:
```javascript
 if (!type)
```

**パラメーター**:
- `!type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!type);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ランダムな位置を選択（指定がない場合）

**シグネチャ**:
```javascript
 if (!position)
```

**パラメーター**:
- `!position`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!position);

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

#### getBubbleHealthByType

**シグネチャ**:
```javascript
 getBubbleHealthByType(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubbleHealthByType(type);

// getBubbleHealthByTypeの実用的な使用例
const result = instance.getBubbleHealthByType(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setStageConfig

**シグネチャ**:
```javascript
 setStageConfig(config)
```

**パラメーター**:
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setStageConfig(config);

// setStageConfigの実用的な使用例
const result = instance.setStageConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!config)
```

**パラメーター**:
- `!config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!config);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### spawnSpecificBubble

**シグネチャ**:
```javascript
 spawnSpecificBubble(type, position = null)
```

**パラメーター**:
- `type`
- `position = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.spawnSpecificBubble(type, position = null);

// spawnSpecificBubbleの実用的な使用例
const result = instance.spawnSpecificBubble(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!position)
```

**パラメーター**:
- `!position`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!position);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bubble)
```

**パラメーター**:
- `bubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRandomBubbleType

**シグネチャ**:
```javascript
 getRandomBubbleType()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRandomBubbleType();

// getRandomBubbleTypeの実用的な使用例
const result = instance.getRandomBubbleType(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.stageConfig || !this.stageConfig.bubbleTypes)
```

**パラメーター**:
- `!this.stageConfig || !this.stageConfig.bubbleTypes`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.stageConfig || !this.stageConfig.bubbleTypes);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRandomPosition

**シグネチャ**:
```javascript
 getRandomPosition()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRandomPosition();

// getRandomPositionの実用的な使用例
const result = instance.getRandomPosition(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (this.spawnTimer >= adjustedSpawnInterval)
```

**パラメーター**:
- `this.spawnTimer >= adjustedSpawnInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.spawnTimer >= adjustedSpawnInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

削除予定の泡を除去とプール返却

**シグネチャ**:
```javascript
 for (let i = this.bubbles.length - 1; i >= 0; i--)
```

**パラメーター**:
- `let i = this.bubbles.length - 1; i >= 0; i--`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = this.bubbles.length - 1; i >= 0; i--);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!bubble.isAlive)
```

**パラメーター**:
- `!bubble.isAlive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!bubble.isAlive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

破裂した泡はダメージを与える

**シグネチャ**:
```javascript
 if (bubble.age >= bubble.maxAge)
```

**パラメーター**:
- `bubble.age >= bubble.maxAge`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble.age >= bubble.maxAge);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateBubble

**シグネチャ**:
```javascript
 updateBubble(bubble, deltaTime)
```

**パラメーター**:
- `bubble`
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateBubble(bubble, deltaTime);

// updateBubbleの実用的な使用例
const result = instance.updateBubble(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

逃げる泡の特殊処理

**シグネチャ**:
```javascript
 if (bubble.type === 'escaping')
```

**パラメーター**:
- `bubble.type === 'escaping'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble.type === 'escaping');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyPhysics

**シグネチャ**:
```javascript
 applyPhysics(bubble, deltaSeconds)
```

**パラメーター**:
- `bubble`
- `deltaSeconds`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyPhysics(bubble, deltaSeconds);

// applyPhysicsの実用的な使用例
const result = instance.applyPhysics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

重力の適用（上向きの速度がある場合のみ）

**シグネチャ**:
```javascript
 if (bubble.velocity.y < 0)
```

**パラメーター**:
- `bubble.velocity.y < 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble.velocity.y < 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (speed < this.dragPhysics.minVelocity)
```

**パラメーター**:
- `speed < this.dragPhysics.minVelocity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(speed < this.dragPhysics.minVelocity);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleBoundaryCollision

**シグネチャ**:
```javascript
 handleBoundaryCollision(bubble)
```

**パラメーター**:
- `bubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleBoundaryCollision(bubble);

// handleBoundaryCollisionの実用的な使用例
const result = instance.handleBoundaryCollision(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

左右の境界

**シグネチャ**:
```javascript
 if (bubble.position.x - radius < 0)
```

**パラメーター**:
- `bubble.position.x - radius < 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble.position.x - radius < 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bubble.position.x + radius > canvas.width)
```

**パラメーター**:
- `bubble.position.x + radius > canvas.width`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble.position.x + radius > canvas.width);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

上下の境界

**シグネチャ**:
```javascript
 if (bubble.position.y - radius < 0)
```

**パラメーター**:
- `bubble.position.y - radius < 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble.position.y - radius < 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bubble.position.y + radius > canvas.height)
```

**パラメーター**:
- `bubble.position.y + radius > canvas.height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble.position.y + radius > canvas.height);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateEscapingBubble

**シグネチャ**:
```javascript
 updateEscapingBubble(bubble, deltaSeconds)
```

**パラメーター**:
- `bubble`
- `deltaSeconds`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateEscapingBubble(bubble, deltaSeconds);

// updateEscapingBubbleの実用的な使用例
const result = instance.updateEscapingBubble(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance < escapeDistance && distance > 0)
```

**パラメーター**:
- `distance < escapeDistance && distance > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance < escapeDistance && distance > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentSpeed > maxEscapeSpeed)
```

**パラメーター**:
- `currentSpeed > maxEscapeSpeed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentSpeed > maxEscapeSpeed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isBubbleVisible

**シグネチャ**:
```javascript
 isBubbleVisible(bubble)
```

**パラメーター**:
- `bubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isBubbleVisible(bubble);

// isBubbleVisibleの実用的な使用例
const result = instance.isBubbleVisible(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performCulling

**シグネチャ**:
```javascript
 performCulling()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performCulling();

// performCullingの実用的な使用例
const result = instance.performCulling(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < toRemove; i++)
```

**パラメーター**:
- `let i = 0; i < toRemove; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < toRemove; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateBubblePriority

**シグネチャ**:
```javascript
 calculateBubblePriority(bubble)
```

**パラメーター**:
- `bubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateBubblePriority(bubble);

// calculateBubblePriorityの実用的な使用例
const result = instance.calculateBubblePriority(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleOffscreenBubble

**シグネチャ**:
```javascript
 handleOffscreenBubble(bubble, deltaTime)
```

**パラメーター**:
- `bubble`
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleOffscreenBubble(bubble, deltaTime);

// handleOffscreenBubbleの実用的な使用例
const result = instance.handleOffscreenBubble(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (isOffscreen)
```

**パラメーター**:
- `isOffscreen`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isOffscreen);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (timer >= this.offscreenTimeoutDuration)
```

**パラメーター**:
- `timer >= this.offscreenTimeoutDuration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(timer >= this.offscreenTimeoutDuration);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### shouldDisappearOffscreen

**シグネチャ**:
```javascript
 shouldDisappearOffscreen(bubbleType)
```

**パラメーター**:
- `bubbleType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.shouldDisappearOffscreen(bubbleType);

// shouldDisappearOffscreenの実用的な使用例
const result = instance.shouldDisappearOffscreen(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanupOffscreenTimers

**シグネチャ**:
```javascript
 cleanupOffscreenTimers()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanupOffscreenTimers();

// cleanupOffscreenTimersの実用的な使用例
const result = instance.cleanupOffscreenTimers(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!bubble.isAlive)
```

**パラメーター**:
- `!bubble.isAlive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!bubble.isAlive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkAutoBurst

**シグネチャ**:
```javascript
 checkAutoBurst(bubble)
```

**パラメーター**:
- `bubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkAutoBurst(bubble);

// checkAutoBurstの実用的な使用例
const result = instance.checkAutoBurst(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ひび割れ泡は早期破裂

**シグネチャ**:
```javascript
 if (bubble.type === 'cracked' && bubble.age > bubble.maxAge * 0.5)
```

**パラメーター**:
- `bubble.type === 'cracked' && bubble.age > bubble.maxAge * 0.5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble.type === 'cracked' && bubble.age > bubble.maxAge * 0.5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

通常の自動破裂

**シグネチャ**:
```javascript
 if (bubble.age >= bubble.maxAge)
```

**パラメーター**:
- `bubble.age >= bubble.maxAge`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble.age >= bubble.maxAge);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### burstBubble

**シグネチャ**:
```javascript
 burstBubble(bubble)
```

**パラメーター**:
- `bubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.burstBubble(bubble);

// burstBubbleの実用的な使用例
const result = instance.burstBubble(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

新しいエフェクトシステムで爆発エフェクトを作成

**シグネチャ**:
```javascript
 if (this.gameEngine.createExplosion)
```

**パラメーター**:
- `this.gameEngine.createExplosion`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.createExplosion);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateBurstDamage

**シグネチャ**:
```javascript
 calculateBurstDamage(bubble)
```

**パラメーター**:
- `bubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateBurstDamage(bubble);

// calculateBurstDamageの実用的な使用例
const result = instance.calculateBurstDamage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateMousePosition

**シグネチャ**:
```javascript
 updateMousePosition(x, y)
```

**パラメーター**:
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateMousePosition(x, y);

// updateMousePositionの実用的な使用例
const result = instance.updateMousePosition(/* 適切なパラメータ */);
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

低品質モードでは一部の泡のみレンダリング

**シグネチャ**:
```javascript
 if (renderQuality < 0.8)
```

**パラメーター**:
- `renderQuality < 0.8`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(renderQuality < 0.8);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ドラッグ軌跡の描画（デバッグ用、高品質モードのみ）

**シグネチャ**:
```javascript
 if (renderQuality > 0.8 && this.isDragging && this.dragHistory.length > 1)
```

**パラメーター**:
- `renderQuality > 0.8 && this.isDragging && this.dragHistory.length > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(renderQuality > 0.8 && this.isDragging && this.dragHistory.length > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 1; i < this.dragHistory.length; i++)
```

**パラメーター**:
- `let i = 1; i < this.dragHistory.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 1; i < this.dragHistory.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

#### for

最前面の泡を検索

**シグネチャ**:
```javascript
 for (let i = this.bubbles.length - 1; i >= 0; i--)
```

**パラメーター**:
- `let i = this.bubbles.length - 1; i >= 0; i--`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = this.bubbles.length - 1; i >= 0; i--);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### popBubble

**シグネチャ**:
```javascript
 popBubble(bubble, x, y)
```

**パラメーター**:
- `bubble`
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.popBubble(bubble, x, y);

// popBubbleの実用的な使用例
const result = instance.popBubble(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

幻の泡のすり抜け判定

**シグネチャ**:
```javascript
 if (bubble.type === 'phantom')
```

**パラメーター**:
- `bubble.type === 'phantom'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble.type === 'phantom');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

新しいエフェクトシステムで爆発エフェクトを作成

**シグネチャ**:
```javascript
 if (this.gameEngine.createExplosion)
```

**パラメーター**:
- `this.gameEngine.createExplosion`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.createExplosion);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processBubbleEffect

**シグネチャ**:
```javascript
 processBubbleEffect(bubble, x, y)
```

**パラメーター**:
- `bubble`
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processBubbleEffect(bubble, x, y);

// processBubbleEffectの実用的な使用例
const result = instance.processBubbleEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (bubble.type)
```

**パラメーター**:
- `bubble.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(bubble.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifySpecialEffect

**シグネチャ**:
```javascript
 notifySpecialEffect(effectType, x, y)
```

**パラメーター**:
- `effectType`
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifySpecialEffect(effectType, x, y);

// notifySpecialEffectの実用的な使用例
const result = instance.notifySpecialEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (gameScene && typeof gameScene.onSpecialEffect === 'function')
```

**パラメーター**:
- `gameScene && typeof gameScene.onSpecialEffect === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gameScene && typeof gameScene.onSpecialEffect === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBubblesAlongPath

**シグネチャ**:
```javascript
 getBubblesAlongPath(startPos, endPos)
```

**パラメーター**:
- `startPos`
- `endPos`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubblesAlongPath(startPos, endPos);

// getBubblesAlongPathの実用的な使用例
const result = instance.getBubblesAlongPath(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バブルの半径内にパスが通っている場合

**シグネチャ**:
```javascript
 if (distance < bubble.size)
```

**パラメーター**:
- `distance < bubble.size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance < bubble.size);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBubblesInRadius

**シグネチャ**:
```javascript
 getBubblesInRadius(x, y, radius)
```

**パラメーター**:
- `x`
- `y`
- `radius`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubblesInRadius(x, y, radius);

// getBubblesInRadiusの実用的な使用例
const result = instance.getBubblesInRadius(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance < radius + bubble.size)
```

**パラメーター**:
- `distance < radius + bubble.size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance < radius + bubble.size);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### pointToLineDistance

**シグネチャ**:
```javascript
 pointToLineDistance(point, lineStart, lineEnd)
```

**パラメーター**:
- `point`
- `lineStart`
- `lineEnd`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.pointToLineDistance(point, lineStart, lineEnd);

// pointToLineDistanceの実用的な使用例
const result = instance.pointToLineDistance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (lenSq !== 0)
```

**パラメーター**:
- `lenSq !== 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(lenSq !== 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (param < 0)
```

**パラメーター**:
- `param < 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(param < 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (param > 1)
```

**パラメーター**:
- `param > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(param > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifyDamage

**シグネチャ**:
```javascript
 notifyDamage(damage, source)
```

**パラメーター**:
- `damage`
- `source`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifyDamage(damage, source);

// notifyDamageの実用的な使用例
const result = instance.notifyDamage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (gameScene && typeof gameScene.onDamageTaken === 'function')
```

**パラメーター**:
- `gameScene && typeof gameScene.onDamageTaken === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gameScene && typeof gameScene.onDamageTaken === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### notifyHeal

**シグネチャ**:
```javascript
 notifyHeal(healAmount)
```

**パラメーター**:
- `healAmount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.notifyHeal(healAmount);

// notifyHealの実用的な使用例
const result = instance.notifyHeal(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (gameScene && typeof gameScene.onHealed === 'function')
```

**パラメーター**:
- `gameScene && typeof gameScene.onHealed === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gameScene && typeof gameScene.onHealed === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### chainReaction

**シグネチャ**:
```javascript
 chainReaction(centerX, centerY, radius)
```

**パラメーター**:
- `centerX`
- `centerY`
- `radius`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.chainReaction(centerX, centerY, radius);

// chainReactionの実用的な使用例
const result = instance.chainReaction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance <= radius && bubble.isAlive)
```

**パラメーター**:
- `distance <= radius && bubble.isAlive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance <= radius && bubble.isAlive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bubble.isAlive)
```

**パラメーター**:
- `bubble.isAlive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble.isAlive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleDragStart

**シグネチャ**:
```javascript
 handleDragStart(x, y)
```

**パラメーター**:
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleDragStart(x, y);

// handleDragStartの実用的な使用例
const result = instance.handleDragStart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

ドラッグ対象の泡を検索（最前面から）

**シグネチャ**:
```javascript
 for (let i = this.bubbles.length - 1; i >= 0; i--)
```

**パラメーター**:
- `let i = this.bubbles.length - 1; i >= 0; i--`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = this.bubbles.length - 1; i >= 0; i--);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleDragMove

**シグネチャ**:
```javascript
 handleDragMove(x, y)
```

**パラメーター**:
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleDragMove(x, y);

// handleDragMoveの実用的な使用例
const result = instance.handleDragMove(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.isDragging || !this.draggedBubble)
```

**パラメーター**:
- `!this.isDragging || !this.draggedBubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.isDragging || !this.draggedBubble);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.dragHistory.length > 10)
```

**パラメーター**:
- `this.dragHistory.length > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dragHistory.length > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateVelocityFromHistory

**シグネチャ**:
```javascript
 calculateVelocityFromHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateVelocityFromHistory();

// calculateVelocityFromHistoryの実用的な使用例
const result = instance.calculateVelocityFromHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.dragHistory.length < 2)
```

**パラメーター**:
- `this.dragHistory.length < 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dragHistory.length < 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateFlickStrength

**シグネチャ**:
```javascript
 calculateFlickStrength(dragVector, velocity)
```

**パラメーター**:
- `dragVector`
- `velocity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateFlickStrength(dragVector, velocity);

// calculateFlickStrengthの実用的な使用例
const result = instance.calculateFlickStrength(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateForceDirection

**シグネチャ**:
```javascript
 calculateForceDirection(dragVector, velocity)
```

**パラメーター**:
- `dragVector`
- `velocity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateForceDirection(dragVector, velocity);

// calculateForceDirectionの実用的な使用例
const result = instance.calculateForceDirection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (magnitude === 0)
```

**パラメーター**:
- `magnitude === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(magnitude === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyForceToBubble

**シグネチャ**:
```javascript
 applyForceToBubble(bubble, direction, strength)
```

**パラメーター**:
- `bubble`
- `direction`
- `strength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyForceToBubble(bubble, direction, strength);

// applyForceToBubbleの実用的な使用例
const result = instance.applyForceToBubble(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

泡のタイプによる調整

**シグネチャ**:
```javascript
 switch (bubble.type)
```

**パラメーター**:
- `bubble.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(bubble.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleDragEnd

**シグネチャ**:
```javascript
 handleDragEnd(startX, startY, endX, endY)
```

**パラメーター**:
- `startX`
- `startY`
- `endX`
- `endY`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleDragEnd(startX, startY, endX, endY);

// handleDragEndの実用的な使用例
const result = instance.handleDragEnd(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.isDragging || !this.draggedBubble)
```

**パラメーター**:
- `!this.isDragging || !this.draggedBubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.isDragging || !this.draggedBubble);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最小ドラッグ距離をチェック

**シグネチャ**:
```javascript
 if (dragDistance < 15)
```

**パラメーター**:
- `dragDistance < 15`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(dragDistance < 15);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetDrag

**シグネチャ**:
```javascript
 resetDrag()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetDrag();

// resetDragの実用的な使用例
const result = instance.resetDrag(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applySlowEffect

**シグネチャ**:
```javascript
 applySlowEffect(centerX, centerY, radius, slowFactor, duration)
```

**パラメーター**:
- `centerX`
- `centerY`
- `radius`
- `slowFactor`
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applySlowEffect(centerX, centerY, radius, slowFactor, duration);

// applySlowEffectの実用的な使用例
const result = instance.applySlowEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance <= radius && bubble.isAlive)
```

**パラメーター**:
- `distance <= radius && bubble.isAlive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance <= radius && bubble.isAlive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyMagneticPull

**シグネチャ**:
```javascript
 applyMagneticPull(centerX, centerY, radius, strength)
```

**パラメーター**:
- `centerX`
- `centerY`
- `radius`
- `strength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyMagneticPull(centerX, centerY, radius, strength);

// applyMagneticPullの実用的な使用例
const result = instance.applyMagneticPull(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance <= radius && distance > 0 && bubble.isAlive)
```

**パラメーター**:
- `distance <= radius && distance > 0 && bubble.isAlive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance <= radius && distance > 0 && bubble.isAlive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### bigExplosion

**シグネチャ**:
```javascript
 bigExplosion(centerX, centerY, radius, damage)
```

**パラメーター**:
- `centerX`
- `centerY`
- `radius`
- `damage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.bigExplosion(centerX, centerY, radius, damage);

// bigExplosionの実用的な使用例
const result = instance.bigExplosion(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance <= radius && bubble.isAlive)
```

**パラメーター**:
- `distance <= radius && bubble.isAlive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance <= radius && bubble.isAlive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bubble.isAlive)
```

**パラメーター**:
- `bubble.isAlive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble.isAlive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearAllBubbles

**シグネチャ**:
```javascript
 clearAllBubbles()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearAllBubbles();

// clearAllBubblesの実用的な使用例
const result = instance.clearAllBubbles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBubbleCount

**シグネチャ**:
```javascript
 getBubbleCount()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubbleCount();

// getBubbleCountの実用的な使用例
const result = instance.getBubbleCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getActiveBubbles

**シグネチャ**:
```javascript
 getActiveBubbles()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getActiveBubbles();

// getActiveBubblesの実用的な使用例
const result = instance.getActiveBubbles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applySlowEffect

**シグネチャ**:
```javascript
 applySlowEffect(centerX, centerY, radius, slowFactor, duration)
```

**パラメーター**:
- `centerX`
- `centerY`
- `radius`
- `slowFactor`
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applySlowEffect(centerX, centerY, radius, slowFactor, duration);

// applySlowEffectの実用的な使用例
const result = instance.applySlowEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance <= radius && bubble.isAlive)
```

**パラメーター**:
- `distance <= radius && bubble.isAlive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance <= radius && bubble.isAlive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyMagneticPull

**シグネチャ**:
```javascript
 applyMagneticPull(centerX, centerY, radius, strength)
```

**パラメーター**:
- `centerX`
- `centerY`
- `radius`
- `strength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyMagneticPull(centerX, centerY, radius, strength);

// applyMagneticPullの実用的な使用例
const result = instance.applyMagneticPull(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance <= radius && distance > 0 && bubble.isAlive)
```

**パラメーター**:
- `distance <= radius && distance > 0 && bubble.isAlive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance <= radius && distance > 0 && bubble.isAlive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### bigExplosion

**シグネチャ**:
```javascript
 bigExplosion(centerX, centerY, radius, damage)
```

**パラメーター**:
- `centerX`
- `centerY`
- `radius`
- `damage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.bigExplosion(centerX, centerY, radius, damage);

// bigExplosionの実用的な使用例
const result = instance.bigExplosion(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance <= radius && bubble.isAlive)
```

**パラメーター**:
- `distance <= radius && bubble.isAlive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance <= radius && bubble.isAlive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bubble.isAlive)
```

**パラメーター**:
- `bubble.isAlive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble.isAlive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setSpecialSpawnRate

**シグネチャ**:
```javascript
 setSpecialSpawnRate(bubbleType, rate)
```

**パラメーター**:
- `bubbleType`
- `rate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setSpecialSpawnRate(bubbleType, rate);

// setSpecialSpawnRateの実用的な使用例
const result = instance.setSpecialSpawnRate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.specialSpawnRates)
```

**パラメーター**:
- `!this.specialSpawnRates`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.specialSpawnRates);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRandomBubbleTypeWithSpecialRates

**シグネチャ**:
```javascript
 getRandomBubbleTypeWithSpecialRates()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRandomBubbleTypeWithSpecialRates();

// getRandomBubbleTypeWithSpecialRatesの実用的な使用例
const result = instance.getRandomBubbleTypeWithSpecialRates(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.specialSpawnRates)
```

**パラメーター**:
- `!this.specialSpawnRates`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.specialSpawnRates);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addTestBubble

**シグネチャ**:
```javascript
 addTestBubble(bubbleData)
```

**パラメーター**:
- `bubbleData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addTestBubble(bubbleData);

// addTestBubbleの実用的な使用例
const result = instance.addTestBubble(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バブルデータの検証

**シグネチャ**:
```javascript
 if (!bubbleData || !bubbleData.type)
```

**パラメーター**:
- `!bubbleData || !bubbleData.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!bubbleData || !bubbleData.type);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

カスタムプロパティの設定

**シグネチャ**:
```javascript
 if (bubbleData.size)
```

**パラメーター**:
- `bubbleData.size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubbleData.size);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bubbleData.health !== undefined)
```

**パラメーター**:
- `bubbleData.health !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubbleData.health !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bubbleData.velocity)
```

**パラメーター**:
- `bubbleData.velocity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubbleData.velocity);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bubbleData.spawnTime)
```

**パラメーター**:
- `bubbleData.spawnTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubbleData.spawnTime);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bubbleData.properties)
```

**パラメーター**:
- `bubbleData.properties`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubbleData.properties);

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

#### addTestBubbles

**シグネチャ**:
```javascript
 addTestBubbles(bubblesData)
```

**パラメーター**:
- `bubblesData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addTestBubbles(bubblesData);

// addTestBubblesの実用的な使用例
const result = instance.addTestBubbles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const bubbleData of bubblesData)
```

**パラメーター**:
- `const bubbleData of bubblesData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const bubbleData of bubblesData);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### removeTestBubbles

**シグネチャ**:
```javascript
 removeTestBubbles(condition)
```

**パラメーター**:
- `condition`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeTestBubbles(condition);

// removeTestBubblesの実用的な使用例
const result = instance.removeTestBubbles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof condition === 'string')
```

**パラメーター**:
- `typeof condition === 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof condition === 'string');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### filter

**シグネチャ**:
```javascript
 filter(bubble => {
                if (bubble.id === condition)
```

**パラメーター**:
- `bubble => {
                if (bubble.id === condition`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.filter(bubble => {
                if (bubble.id === condition);

// filterの実用的な使用例
const result = instance.filter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof condition === 'function')
```

**パラメーター**:
- `typeof condition === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof condition === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (condition === 'all')
```

**パラメーター**:
- `condition === 'all'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(condition === 'all');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTestBubbleInfo

**シグネチャ**:
```javascript
 getTestBubbleInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTestBubbleInfo();

// getTestBubbleInfoの実用的な使用例
const result = instance.getTestBubbleInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `maxBubbles` | 説明なし |
| `typeValidation` | 説明なし |
| `positionValidation` | 説明なし |
| `bubble` | 説明なし |
| `healthMap` | 説明なし |
| `bubble` | 説明なし |
| `types` | 説明なし |
| `canvas` | 説明なし |
| `margin` | 説明なし |
| `adjustedDeltaTime` | 説明なし |
| `adjustedSpawnInterval` | 説明なし |
| `bubble` | 説明なし |
| `deltaSeconds` | 説明なし |
| `speed` | 説明なし |
| `canvas` | 説明なし |
| `radius` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `distance` | 説明なし |
| `escapeDistance` | 説明なし |
| `escapeForce` | 説明なし |
| `escapeDirection` | 説明なし |
| `maxEscapeSpeed` | 説明なし |
| `currentSpeed` | 説明なし |
| `margin` | 説明なし |
| `bubblesWithPriority` | 説明なし |
| `targetCount` | 説明なし |
| `toRemove` | 説明なし |
| `item` | 説明なし |
| `rareTypes` | 説明なし |
| `distance` | 説明なし |
| `canvas` | 説明なし |
| `margin` | 説明なし |
| `isOffscreen` | 説明なし |
| `timer` | 説明なし |
| `disappearTypes` | 説明なし |
| `damage` | 説明なし |
| `baseDamage` | 説明なし |
| `renderQuality` | 説明なし |
| `step` | 説明なし |
| `bubble` | 説明なし |
| `config` | 説明なし |
| `score` | 説明なし |
| `gameScene` | 説明なし |
| `healAmount` | 説明なし |
| `damage` | 説明なし |
| `gameScene` | 説明なし |
| `bubbles` | 説明なし |
| `pathLength` | 説明なし |
| `direction` | 説明なし |
| `distance` | 説明なし |
| `bubbles` | 説明なし |
| `distance` | 説明なし |
| `A` | 説明なし |
| `B` | 説明なし |
| `C` | 説明なし |
| `D` | 説明なし |
| `dot` | 説明なし |
| `lenSq` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `gameScene` | 説明なし |
| `gameScene` | 説明なし |
| `affectedBubbles` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `distance` | 説明なし |
| `bubble` | 説明なし |
| `recent` | 説明なし |
| `previous` | 説明なし |
| `timeDiff` | 説明なし |
| `dragDistance` | 説明なし |
| `velocityMagnitude` | 説明なし |
| `distanceComponent` | 説明なし |
| `velocityComponent` | 説明なし |
| `combinedVector` | 説明なし |
| `magnitude` | 説明なし |
| `dragVector` | 説明なし |
| `dragDistance` | 説明なし |
| `velocity` | 説明なし |
| `flickStrength` | 説明なし |
| `forceDirection` | 説明なし |
| `affectedBubbles` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `distance` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `distance` | 説明なし |
| `pullForce` | 説明なし |
| `direction` | 説明なし |
| `affectedBubbles` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `distance` | 説明なし |
| `delay` | 説明なし |
| `affectedBubbles` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `distance` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `distance` | 説明なし |
| `pullForce` | 説明なし |
| `direction` | 説明なし |
| `affectedBubbles` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `distance` | 説明なし |
| `delay` | 説明なし |
| `bubble` | 説明なし |

---

