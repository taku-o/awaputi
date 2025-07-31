# StageSelectScene

## 概要

ファイル: `scenes/StageSelectScene.js`  
最終更新: 2025/7/22 15:18:06

## 目次

## クラス
- [StageSelectScene](#stageselectscene)
## 定数
- [stageManager](#stagemanager)
- [canvas](#canvas)
- [canvas](#canvas)
- [playerData](#playerdata)
- [infoY](#infoy)
- [canvas](#canvas)
- [startY](#starty)
- [itemHeight](#itemheight)
- [itemWidth](#itemwidth)
- [itemX](#itemx)
- [isSelected](#isselected)
- [adjustedIndex](#adjustedindex)
- [isSelected](#isselected)
- [stageName](#stagename)
- [description](#description)
- [minutes](#minutes)
- [seconds](#seconds)
- [timeText](#timetext)
- [canvas](#canvas)
- [buttonWidth](#buttonwidth)
- [buttonHeight](#buttonheight)
- [buttonX](#buttonx)
- [buttonY](#buttony)
- [canvas](#canvas)
- [controlsY](#controlsy)
- [canvas](#canvas)
- [rect](#rect)
- [x](#x)
- [y](#y)
- [buttonWidth](#buttonwidth)
- [buttonHeight](#buttonheight)
- [buttonX](#buttonx)
- [buttonY](#buttony)
- [startY](#starty)
- [itemHeight](#itemheight)
- [itemSpacing](#itemspacing)
- [totalStages](#totalstages)
- [itemY](#itemy)
- [totalStages](#totalstages)
- [selectedStage](#selectedstage)
- [success](#success)

---

## StageSelectScene

**継承元**: `Scene`

### コンストラクタ

```javascript
new StageSelectScene(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `selectedStageIndex` | 説明なし |
| `unlockedStages` | 説明なし |
| `lockedStages` | 説明なし |
| `scrollOffset` | 説明なし |
| `maxVisibleStages` | 説明なし |
| `selectedStageIndex` | 説明なし |
| `scrollOffset` | 説明なし |
| `unlockedStages` | 説明なし |
| `lockedStages` | 説明なし |
| `selectedStageIndex` | 説明なし |
| `selectedStageIndex` | 説明なし |
| `selectedStageIndex` | 説明なし |
| `scrollOffset` | 説明なし |
| `scrollOffset` | 説明なし |

### メソッド

#### enter

**シグネチャ**:
```javascript
 enter()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enter();

// enterの実用的な使用例
const result = instance.enter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateStageList

**シグネチャ**:
```javascript
 updateStageList()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateStageList();

// updateStageListの実用的な使用例
const result = instance.updateStageList(/* 適切なパラメータ */);
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

#### renderPlayerInfo

**シグネチャ**:
```javascript
 renderPlayerInfo(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderPlayerInfo(context);

// renderPlayerInfoの実用的な使用例
const result = instance.renderPlayerInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderStageList

**シグネチャ**:
```javascript
 renderStageList(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderStageList(context);

// renderStageListの実用的な使用例
const result = instance.renderStageList(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderStageItem

**シグネチャ**:
```javascript
 renderStageItem(context, stage, x, y, width, height, isSelected, isLocked)
```

**パラメーター**:
- `context`
- `stage`
- `x`
- `y`
- `width`
- `height`
- `isSelected`
- `isLocked`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderStageItem(context, stage, x, y, width, height, isSelected, isLocked);

// renderStageItemの実用的な使用例
const result = instance.renderStageItem(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

背景

**シグネチャ**:
```javascript
 if (isSelected)
```

**パラメーター**:
- `isSelected`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isSelected);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

時間表示（開放済みのみ）

**シグネチャ**:
```javascript
 if (!isLocked && stage.duration)
```

**パラメーター**:
- `!isLocked && stage.duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!isLocked && stage.duration);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderShopButton

**シグネチャ**:
```javascript
 renderShopButton(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderShopButton(context);

// renderShopButtonの実用的な使用例
const result = instance.renderShopButton(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderControls

**シグネチャ**:
```javascript
 renderControls(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderControls(context);

// renderControlsの実用的な使用例
const result = instance.renderControls(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleInput

**シグネチャ**:
```javascript
 handleInput(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleInput(event);

// handleInputの実用的な使用例
const result = instance.handleInput(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event.type === 'keydown')
```

**パラメーター**:
- `event.type === 'keydown'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.type === 'keydown');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

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

#### if

**シグネチャ**:
```javascript
 if (event.type === 'click')
```

**パラメーター**:
- `event.type === 'click'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.type === 'click');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleClick

**シグネチャ**:
```javascript
 handleClick(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleClick(event);

// handleClickの実用的な使用例
const result = instance.handleClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight)
```

**パラメーター**:
- `x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (y >= itemY && y <= itemY + itemHeight)
```

**パラメーター**:
- `y >= itemY && y <= itemY + itemHeight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(y >= itemY && y <= itemY + itemHeight);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### moveSelection

**シグネチャ**:
```javascript
 moveSelection(direction)
```

**パラメーター**:
- `direction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.moveSelection(direction);

// moveSelectionの実用的な使用例
const result = instance.moveSelection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.selectedStageIndex < 0)
```

**パラメーター**:
- `this.selectedStageIndex < 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.selectedStageIndex < 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.selectedStageIndex >= totalStages)
```

**パラメーター**:
- `this.selectedStageIndex >= totalStages`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.selectedStageIndex >= totalStages);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スクロール調整

**シグネチャ**:
```javascript
 if (this.selectedStageIndex < this.scrollOffset)
```

**パラメーター**:
- `this.selectedStageIndex < this.scrollOffset`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.selectedStageIndex < this.scrollOffset);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.selectedStageIndex >= this.scrollOffset + this.maxVisibleStages)
```

**パラメーター**:
- `this.selectedStageIndex >= this.scrollOffset + this.maxVisibleStages`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.selectedStageIndex >= this.scrollOffset + this.maxVisibleStages);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### selectStage

**シグネチャ**:
```javascript
 selectStage()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.selectStage();

// selectStageの実用的な使用例
const result = instance.selectStage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.selectedStageIndex < this.unlockedStages.length)
```

**パラメーター**:
- `this.selectedStageIndex < this.unlockedStages.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.selectedStageIndex < this.unlockedStages.length);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

BubbleManagerの存在確認

**シグネチャ**:
```javascript
 if (!this.gameEngine.bubbleManager)
```

**パラメーター**:
- `!this.gameEngine.bubbleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.gameEngine.bubbleManager);

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


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `stageManager` | 説明なし |
| `canvas` | 説明なし |
| `canvas` | 説明なし |
| `playerData` | 説明なし |
| `infoY` | 説明なし |
| `canvas` | 説明なし |
| `startY` | 説明なし |
| `itemHeight` | 説明なし |
| `itemWidth` | 説明なし |
| `itemX` | 説明なし |
| `isSelected` | 説明なし |
| `adjustedIndex` | 説明なし |
| `isSelected` | 説明なし |
| `stageName` | 説明なし |
| `description` | 説明なし |
| `minutes` | 説明なし |
| `seconds` | 説明なし |
| `timeText` | 説明なし |
| `canvas` | 説明なし |
| `buttonWidth` | 説明なし |
| `buttonHeight` | 説明なし |
| `buttonX` | 説明なし |
| `buttonY` | 説明なし |
| `canvas` | 説明なし |
| `controlsY` | 説明なし |
| `canvas` | 説明なし |
| `rect` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `buttonWidth` | 説明なし |
| `buttonHeight` | 説明なし |
| `buttonX` | 説明なし |
| `buttonY` | 説明なし |
| `startY` | 説明なし |
| `itemHeight` | 説明なし |
| `itemSpacing` | 説明なし |
| `totalStages` | 説明なし |
| `itemY` | 説明なし |
| `totalStages` | 説明なし |
| `selectedStage` | 説明なし |
| `success` | 説明なし |

---

