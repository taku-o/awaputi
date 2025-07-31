# ItemSystem

## 概要

ファイル: `core/ItemSystem.js`  
最終更新: 2025/7/19 3:55:08

## 目次

## クラス
- [ItemManager](#itemmanager)
## 定数
- [ITEM_DEFINITIONS](#item_definitions)
- [playerData](#playerdata)
- [playerData](#playerdata)
- [itemDef](#itemdef)
- [currentLevel](#currentlevel)
- [cost](#cost)
- [itemDef](#itemdef)
- [level](#level)
- [effect](#effect)
- [currentMultiplier](#currentmultiplier)
- [newMultiplier](#newmultiplier)
- [currentRareRate](#currentrarerate)
- [newRareRate](#newrarerate)
- [hpBoost](#hpboost)
- [timeExtension](#timeextension)
- [currentComboBoost](#currentcomboboost)
- [newComboBoost](#newcomboboost)
- [itemDef](#itemdef)
- [currentLevel](#currentlevel)
- [itemDef](#itemdef)
- [currentLevel](#currentlevel)
- [cost](#cost)
- [revivalCount](#revivalcount)
- [itemDef](#itemdef)
- [currentLevel](#currentlevel)
- [cost](#cost)
- [canPurchase](#canpurchase)

---

## ItemManager

### コンストラクタ

```javascript
new ItemManager(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `ownedItems` | 説明なし |
| `activeEffects` | アイテムID -> レベル |

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

#### loadOwnedItems

**シグネチャ**:
```javascript
 loadOwnedItems()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadOwnedItems();

// loadOwnedItemsの実用的な使用例
const result = instance.loadOwnedItems(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (playerData.ownedItems)
```

**パラメーター**:
- `playerData.ownedItems`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(playerData.ownedItems);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### saveOwnedItems

**シグネチャ**:
```javascript
 saveOwnedItems()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveOwnedItems();

// saveOwnedItemsの実用的な使用例
const result = instance.saveOwnedItems(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### purchaseItem

**シグネチャ**:
```javascript
 purchaseItem(itemId)
```

**パラメーター**:
- `itemId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.purchaseItem(itemId);

// purchaseItemの実用的な使用例
const result = instance.purchaseItem(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!itemDef)
```

**パラメーター**:
- `!itemDef`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!itemDef);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最大レベルチェック

**シグネチャ**:
```javascript
 if (currentLevel >= itemDef.maxLevel)
```

**パラメーター**:
- `currentLevel >= itemDef.maxLevel`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentLevel >= itemDef.maxLevel);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

AP不足チェック

**シグネチャ**:
```javascript
 if (this.gameEngine.playerData.ap < cost)
```

**パラメーター**:
- `this.gameEngine.playerData.ap < cost`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.playerData.ap < cost);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetAllItems

**シグネチャ**:
```javascript
 resetAllItems()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetAllItems();

// resetAllItemsの実用的な使用例
const result = instance.resetAllItems(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyItemEffect

**シグネチャ**:
```javascript
 applyItemEffect(itemId)
```

**パラメーター**:
- `itemId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyItemEffect(itemId);

// applyItemEffectの実用的な使用例
const result = instance.applyItemEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (effect.type)
```

**パラメーター**:
- `effect.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(effect.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyAllEffects

**シグネチャ**:
```javascript
 applyAllEffects()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyAllEffects();

// applyAllEffectsの実用的な使用例
const result = instance.applyAllEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

各アイテムの効果を適用

**シグネチャ**:
```javascript
 for (const [itemId] of this.ownedItems)
```

**パラメーター**:
- `const [itemId] of this.ownedItems`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [itemId] of this.ownedItems);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEffectValue

**シグネチャ**:
```javascript
 getEffectValue(effectType)
```

**パラメーター**:
- `effectType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEffectValue(effectType);

// getEffectValueの実用的な使用例
const result = instance.getEffectValue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getItemLevel

**シグネチャ**:
```javascript
 getItemLevel(itemId)
```

**パラメーター**:
- `itemId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getItemLevel(itemId);

// getItemLevelの実用的な使用例
const result = instance.getItemLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getItemCost

**シグネチャ**:
```javascript
 getItemCost(itemId)
```

**パラメーター**:
- `itemId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getItemCost(itemId);

// getItemCostの実用的な使用例
const result = instance.getItemCost(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### canPurchaseItem

**シグネチャ**:
```javascript
 canPurchaseItem(itemId)
```

**パラメーター**:
- `itemId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.canPurchaseItem(itemId);

// canPurchaseItemの実用的な使用例
const result = instance.canPurchaseItem(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### useRevival

**シグネチャ**:
```javascript
 useRevival()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.useRevival();

// useRevivalの実用的な使用例
const result = instance.useRevival(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (revivalCount > 0)
```

**パラメーター**:
- `revivalCount > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(revivalCount > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAvailableItems

**シグネチャ**:
```javascript
 getAvailableItems()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAvailableItems();

// getAvailableItemsの実用的な使用例
const result = instance.getAvailableItems(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getItemInfo

**シグネチャ**:
```javascript
 getItemInfo(itemId)
```

**パラメーター**:
- `itemId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getItemInfo(itemId);

// getItemInfoの実用的な使用例
const result = instance.getItemInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `ITEM_DEFINITIONS` | 説明なし |
| `playerData` | 説明なし |
| `playerData` | 説明なし |
| `itemDef` | 説明なし |
| `currentLevel` | 説明なし |
| `cost` | 説明なし |
| `itemDef` | 説明なし |
| `level` | 説明なし |
| `effect` | 説明なし |
| `currentMultiplier` | 説明なし |
| `newMultiplier` | 説明なし |
| `currentRareRate` | 説明なし |
| `newRareRate` | 説明なし |
| `hpBoost` | 説明なし |
| `timeExtension` | 説明なし |
| `currentComboBoost` | 説明なし |
| `newComboBoost` | 説明なし |
| `itemDef` | 説明なし |
| `currentLevel` | 説明なし |
| `itemDef` | 説明なし |
| `currentLevel` | 説明なし |
| `cost` | 説明なし |
| `revivalCount` | 説明なし |
| `itemDef` | 説明なし |
| `currentLevel` | 説明なし |
| `cost` | 説明なし |
| `canPurchase` | 説明なし |

---

