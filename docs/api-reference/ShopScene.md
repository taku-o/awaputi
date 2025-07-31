# ShopScene

## 概要

ファイル: `scenes/ShopScene.js`  
最終更新: 2025/7/19 12:25:36

## 目次

## クラス
- [ShopScene](#shopscene)
## 定数
- [canvas](#canvas)
- [canvas](#canvas)
- [playerData](#playerdata)
- [infoY](#infoy)
- [canvas](#canvas)
- [startY](#starty)
- [itemHeight](#itemheight)
- [itemWidth](#itemwidth)
- [itemX](#itemx)
- [item](#item)
- [isSelected](#isselected)
- [itemInfo](#iteminfo)
- [multiplier](#multiplier)
- [revivalCount](#revivalcount)
- [rareRate](#rarerate)
- [hpBoost](#hpboost)
- [timeExt](#timeext)
- [canvas](#canvas)
- [controlsY](#controlsy)
- [canvas](#canvas)
- [rect](#rect)
- [x](#x)
- [y](#y)
- [startY](#starty)
- [itemHeight](#itemheight)
- [itemSpacing](#itemspacing)
- [itemY](#itemy)
- [selectedItem](#selecteditem)

---

## ShopScene

**継承元**: `Scene`

### コンストラクタ

```javascript
new ShopScene(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `selectedItemIndex` | 説明なし |
| `scrollOffset` | 説明なし |
| `maxVisibleItems` | 説明なし |
| `availableItems` | 説明なし |
| `selectedItemIndex` | 説明なし |
| `scrollOffset` | 説明なし |
| `availableItems` | 説明なし |
| `selectedItemIndex` | 説明なし |
| `selectedItemIndex` | 説明なし |
| `selectedItemIndex` | 説明なし |
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

#### updateItemList

**シグネチャ**:
```javascript
 updateItemList()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateItemList();

// updateItemListの実用的な使用例
const result = instance.updateItemList(/* 適切なパラメータ */);
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

#### renderItemList

**シグネチャ**:
```javascript
 renderItemList(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderItemList(context);

// renderItemListの実用的な使用例
const result = instance.renderItemList(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderItemCard

**シグネチャ**:
```javascript
 renderItemCard(context, itemInfo, x, y, width, height, isSelected)
```

**パラメーター**:
- `context`
- `itemInfo`
- `x`
- `y`
- `width`
- `height`
- `isSelected`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderItemCard(context, itemInfo, x, y, width, height, isSelected);

// renderItemCardの実用的な使用例
const result = instance.renderItemCard(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

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

**シグネチャ**:
```javascript
 if (!itemInfo.canPurchase)
```

**パラメーター**:
- `!itemInfo.canPurchase`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!itemInfo.canPurchase);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (itemInfo.currentLevel > 0)
```

**パラメーター**:
- `itemInfo.currentLevel > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(itemInfo.currentLevel > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (itemInfo.isMaxLevel)
```

**パラメーター**:
- `itemInfo.isMaxLevel`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(itemInfo.isMaxLevel);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コスト表示

**シグネチャ**:
```javascript
 if (!itemInfo.isMaxLevel)
```

**パラメーター**:
- `!itemInfo.isMaxLevel`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!itemInfo.isMaxLevel);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最大レベル表示

**シグネチャ**:
```javascript
 if (itemInfo.maxLevel > 1)
```

**パラメーター**:
- `itemInfo.maxLevel > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(itemInfo.maxLevel > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

効果値表示（現在のレベルでの効果）

**シグネチャ**:
```javascript
 if (itemInfo.currentLevel > 0)
```

**パラメーター**:
- `itemInfo.currentLevel > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(itemInfo.currentLevel > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (itemInfo.effect.type)
```

**パラメーター**:
- `itemInfo.effect.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(itemInfo.effect.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (effectText)
```

**パラメーター**:
- `effectText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(effectText);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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
 if (this.selectedItemIndex < 0)
```

**パラメーター**:
- `this.selectedItemIndex < 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.selectedItemIndex < 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.selectedItemIndex >= this.availableItems.length)
```

**パラメーター**:
- `this.selectedItemIndex >= this.availableItems.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.selectedItemIndex >= this.availableItems.length);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スクロール調整

**シグネチャ**:
```javascript
 if (this.selectedItemIndex < this.scrollOffset)
```

**パラメーター**:
- `this.selectedItemIndex < this.scrollOffset`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.selectedItemIndex < this.scrollOffset);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.selectedItemIndex >= this.scrollOffset + this.maxVisibleItems)
```

**パラメーター**:
- `this.selectedItemIndex >= this.scrollOffset + this.maxVisibleItems`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.selectedItemIndex >= this.scrollOffset + this.maxVisibleItems);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### purchaseSelectedItem

**シグネチャ**:
```javascript
 purchaseSelectedItem()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.purchaseSelectedItem();

// purchaseSelectedItemの実用的な使用例
const result = instance.purchaseSelectedItem(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.selectedItemIndex >= 0 && this.selectedItemIndex < this.availableItems.length)
```

**パラメーター**:
- `this.selectedItemIndex >= 0 && this.selectedItemIndex < this.availableItems.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.selectedItemIndex >= 0 && this.selectedItemIndex < this.availableItems.length);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (selectedItem.id === 'reset')
```

**パラメーター**:
- `selectedItem.id === 'reset'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(selectedItem.id === 'reset');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `canvas` | 説明なし |
| `canvas` | 説明なし |
| `playerData` | 説明なし |
| `infoY` | 説明なし |
| `canvas` | 説明なし |
| `startY` | 説明なし |
| `itemHeight` | 説明なし |
| `itemWidth` | 説明なし |
| `itemX` | 説明なし |
| `item` | 説明なし |
| `isSelected` | 説明なし |
| `itemInfo` | 説明なし |
| `multiplier` | 説明なし |
| `revivalCount` | 説明なし |
| `rareRate` | 説明なし |
| `hpBoost` | 説明なし |
| `timeExt` | 説明なし |
| `canvas` | 説明なし |
| `controlsY` | 説明なし |
| `canvas` | 説明なし |
| `rect` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `startY` | 説明なし |
| `itemHeight` | 説明なし |
| `itemSpacing` | 説明なし |
| `itemY` | 説明なし |
| `selectedItem` | 説明なし |

---

