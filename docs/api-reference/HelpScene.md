# HelpScene

## 概要

ファイル: `scenes/HelpScene.js`  
最終更新: 2025/7/31 8:20:08

## 目次

## クラス
- [HelpScene](#helpscene)
## 定数
- [topics](#topics)
- [category](#category)
- [firstTopic](#firsttopic)
- [handler](#handler)
- [rect](#rect)
- [x](#x)
- [y](#y)
- [relativeY](#relativey)
- [itemHeight](#itemheight)
- [category](#category)
- [topic](#topic)
- [category](#category)
- [category](#category)
- [currentIndex](#currentindex)
- [newIndex](#newindex)
- [currentIndex](#currentindex)
- [newIndex](#newindex)
- [result](#result)
- [t](#t)
- [t](#t)
- [searchBar](#searchbar)
- [text](#text)
- [t](#t)
- [sidebar](#sidebar)
- [isSelected](#isselected)
- [topic](#topic)
- [isTopicSelected](#istopicselected)
- [content](#content)
- [step](#step)
- [content](#content)
- [result](#result)
- [isSelected](#isselected)
- [t](#t)
- [button](#button)
- [words](#words)
- [testLine](#testline)
- [metrics](#metrics)
- [testWidth](#testwidth)

---

## HelpScene

**継承元**: `Scene`

### コンストラクタ

```javascript
new HelpScene(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `loggingSystem` | 説明なし |
| `helpManager` | ヘルプ管理 |
| `searchEngine` | 説明なし |
| `selectedCategory` | UI状態 |
| `selectedTopicIndex` | 説明なし |
| `currentContent` | 説明なし |
| `searchQuery` | 説明なし |
| `searchResults` | 説明なし |
| `isSearching` | 説明なし |
| `layout` | レイアウト設定 |
| `categories` | ヘルプカテゴリ |
| `keyboardHandlers` | キーボードショートカット |
| `helpManager` | 説明なし |
| `searchEngine` | 説明なし |
| `currentContent` | 説明なし |
| `selectedTopicIndex` | 最初のトピックを選択 |
| `currentContent` | 説明なし |
| `selectedCategory` | 説明なし |
| `selectedTopicIndex` | 説明なし |
| `searchQuery` | 説明なし |
| `searchResults` | 説明なし |
| `isSearching` | 説明なし |
| `boundKeyHandler` | 説明なし |
| `boundClickHandler` | 説明なし |
| `boundKeyHandler` | 説明なし |
| `boundClickHandler` | 説明なし |
| `isSearching` | 説明なし |
| `searchQuery` | 説明なし |
| `searchResults` | 説明なし |
| `isSearching` | 説明なし |
| `searchResults` | 説明なし |
| `searchResults` | 説明なし |
| `isSearching` | 説明なし |
| `selectedCategory` | 説明なし |
| `selectedCategory` | 説明なし |
| `selectedTopicIndex` | 説明なし |
| `searchResults` | 説明なし |
| `isSearching` | 説明なし |
| `selectedTopicIndex` | 説明なし |
| `currentContent` | 説明なし |
| `selectedTopicIndex` | 説明なし |
| `selectedTopicIndex` | 説明なし |
| `selectedTopicIndex` | 説明なし |
| `selectedTopicIndex` | 説明なし |
| `isSearching` | 説明なし |
| `searchResults` | 説明なし |
| `isSearching` | 説明なし |
| `searchResults` | 説明なし |
| `searchQuery` | 説明なし |
| `isSearching` | 検索バーフォーカス処理（実装は簡略化） |

### メソッド

#### initialize

**シグネチャ**:
```javascript
async initialize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initialize();

// システムの初期化
await instance.initialize();
console.log('Initialization complete');
```

#### if

ヘルプマネージャーとの統合

**シグネチャ**:
```javascript
 if (this.gameEngine.helpManager)
```

**パラメーター**:
- `this.gameEngine.helpManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.helpManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

検索インデックスの構築

**シグネチャ**:
```javascript
 if (this.searchEngine)
```

**パラメーター**:
- `this.searchEngine`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.searchEngine);

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

#### loadHelpContent

**シグネチャ**:
```javascript
async loadHelpContent()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadHelpContent();

// loadHelpContentの実用的な使用例
const result = instance.loadHelpContent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.helpManager)
```

**パラメーター**:
- `!this.helpManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.helpManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

カテゴリ別コンテンツの読み込み

**シグネチャ**:
```javascript
 for (const category of this.categories)
```

**パラメーター**:
- `const category of this.categories`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const category of this.categories);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

#### loadCategoryContent

**シグネチャ**:
```javascript
async loadCategoryContent(categoryId)
```

**パラメーター**:
- `categoryId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadCategoryContent(categoryId);

// loadCategoryContentの実用的な使用例
const result = instance.loadCategoryContent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!category || !category.topics.length)
```

**パラメーター**:
- `!category || !category.topics.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!category || !category.topics.length);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.helpManager)
```

**パラメーター**:
- `this.helpManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.helpManager);

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

#### exit

**シグネチャ**:
```javascript
 exit()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exit();

// exitの実用的な使用例
const result = instance.exit(/* 適切なパラメータ */);
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

#### removeEventListeners

**シグネチャ**:
```javascript
 removeEventListeners()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeEventListeners();

// removeEventListenersの実用的な使用例
const result = instance.removeEventListeners(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.boundKeyHandler)
```

**パラメーター**:
- `this.boundKeyHandler`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.boundKeyHandler);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.boundClickHandler)
```

**パラメーター**:
- `this.boundClickHandler`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.boundClickHandler);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleKeyPress

**シグネチャ**:
```javascript
 handleKeyPress(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleKeyPress(event);

// handleKeyPressの実用的な使用例
const result = instance.handleKeyPress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (handler)
```

**パラメーター**:
- `handler`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(handler);

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

#### handleSidebarClick

**シグネチャ**:
```javascript
 handleSidebarClick(x, y)
```

**パラメーター**:
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleSidebarClick(x, y);

// handleSidebarClickの実用的な使用例
const result = instance.handleSidebarClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < this.categories.length; i++)
```

**パラメーター**:
- `let i = 0; i < this.categories.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < this.categories.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (relativeY >= currentY && relativeY < currentY + itemHeight)
```

**パラメーター**:
- `relativeY >= currentY && relativeY < currentY + itemHeight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(relativeY >= currentY && relativeY < currentY + itemHeight);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

選択されたカテゴリのトピック表示

**シグネチャ**:
```javascript
 if (this.categories[i].id === this.selectedCategory)
```

**パラメーター**:
- `this.categories[i].id === this.selectedCategory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.categories[i].id === this.selectedCategory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let j = 0; j < this.categories[i].topics.length; j++)
```

**パラメーター**:
- `let j = 0; j < this.categories[i].topics.length; j++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let j = 0; j < this.categories[i].topics.length; j++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (relativeY >= currentY && relativeY < currentY + itemHeight - 5)
```

**パラメーター**:
- `relativeY >= currentY && relativeY < currentY + itemHeight - 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(relativeY >= currentY && relativeY < currentY + itemHeight - 5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performSearch

**シグネチャ**:
```javascript
async performSearch(query)
```

**パラメーター**:
- `query`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performSearch(query);

// performSearchの実用的な使用例
const result = instance.performSearch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.searchEngine)
```

**パラメーター**:
- `!this.searchEngine`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.searchEngine);

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

#### selectCategory

**シグネチャ**:
```javascript
async selectCategory(categoryId)
```

**パラメーター**:
- `categoryId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.selectCategory(categoryId);

// selectCategoryの実用的な使用例
const result = instance.selectCategory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.selectedCategory === categoryId)
```

**パラメーター**:
- `this.selectedCategory === categoryId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.selectedCategory === categoryId);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### selectTopic

**シグネチャ**:
```javascript
async selectTopic(index)
```

**パラメーター**:
- `index`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.selectTopic(index);

// selectTopicの実用的な使用例
const result = instance.selectTopic(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!category || index < 0 || index >= category.topics.length)
```

**パラメーター**:
- `!category || index < 0 || index >= category.topics.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!category || index < 0 || index >= category.topics.length);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.helpManager)
```

**パラメーター**:
- `this.helpManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.helpManager);

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

#### navigateUp

**シグネチャ**:
```javascript
 navigateUp()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.navigateUp();

// navigateUpの実用的な使用例
const result = instance.navigateUp(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isSearching && this.searchResults.length > 0)
```

**パラメーター**:
- `this.isSearching && this.searchResults.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isSearching && this.searchResults.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (category)
```

**パラメーター**:
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(category);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### navigateDown

**シグネチャ**:
```javascript
 navigateDown()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.navigateDown();

// navigateDownの実用的な使用例
const result = instance.navigateDown(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isSearching && this.searchResults.length > 0)
```

**パラメーター**:
- `this.isSearching && this.searchResults.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isSearching && this.searchResults.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (category)
```

**パラメーター**:
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(category);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### navigateLeft

**シグネチャ**:
```javascript
 navigateLeft()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.navigateLeft();

// navigateLeftの実用的な使用例
const result = instance.navigateLeft(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### navigateRight

**シグネチャ**:
```javascript
 navigateRight()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.navigateRight();

// navigateRightの実用的な使用例
const result = instance.navigateRight(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### selectCurrentItem

**シグネチャ**:
```javascript
 selectCurrentItem()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.selectCurrentItem();

// selectCurrentItemの実用的な使用例
const result = instance.selectCurrentItem(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isSearching && this.searchResults.length > 0)
```

**パラメーター**:
- `this.isSearching && this.searchResults.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isSearching && this.searchResults.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (result)
```

**パラメーター**:
- `result`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(result);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### goBack

**シグネチャ**:
```javascript
 goBack()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.goBack();

// goBackの実用的な使用例
const result = instance.goBack(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isSearching)
```

**パラメーター**:
- `this.isSearching`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isSearching);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### focusSearchBar

**シグネチャ**:
```javascript
 focusSearchBar()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.focusSearchBar();

// focusSearchBarの実用的な使用例
const result = instance.focusSearchBar(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleTabNavigation

**シグネチャ**:
```javascript
 handleTabNavigation(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleTabNavigation(event);

// handleTabNavigationの実用的な使用例
const result = instance.handleTabNavigation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event.shiftKey)
```

**パラメーター**:
- `event.shiftKey`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.shiftKey);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isPointInRect

**シグネチャ**:
```javascript
 isPointInRect(x, y, rect)
```

**パラメーター**:
- `x`
- `y`
- `rect`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isPointInRect(x, y, rect);

// isPointInRectの実用的な使用例
const result = instance.isPointInRect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### render

**シグネチャ**:
```javascript
 render(ctx)
```

**パラメーター**:
- `ctx`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render(ctx);

// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);
```

#### if

検索結果描画

**シグネチャ**:
```javascript
 if (this.isSearching && this.searchResults.length > 0)
```

**パラメーター**:
- `this.isSearching && this.searchResults.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isSearching && this.searchResults.length > 0);

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

#### renderTitle

**シグネチャ**:
```javascript
 renderTitle(ctx)
```

**パラメーター**:
- `ctx`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderTitle(ctx);

// renderTitleの実用的な使用例
const result = instance.renderTitle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderSearchBar

**シグネチャ**:
```javascript
 renderSearchBar(ctx)
```

**パラメーター**:
- `ctx`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderSearchBar(ctx);

// renderSearchBarの実用的な使用例
const result = instance.renderSearchBar(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderSidebar

**シグネチャ**:
```javascript
 renderSidebar(ctx)
```

**パラメーター**:
- `ctx`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderSidebar(ctx);

// renderSidebarの実用的な使用例
const result = instance.renderSidebar(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

カテゴリ描画

**シグネチャ**:
```javascript
 for (const category of this.categories)
```

**パラメーター**:
- `const category of this.categories`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const category of this.categories);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

カテゴリ項目背景

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

選択されたカテゴリのトピック表示

**シグネチャ**:
```javascript
 if (isSelected && category.topics.length > 0)
```

**パラメーター**:
- `isSelected && category.topics.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isSelected && category.topics.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < category.topics.length; i++)
```

**パラメーター**:
- `let i = 0; i < category.topics.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < category.topics.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

トピック項目背景

**シグネチャ**:
```javascript
 if (isTopicSelected)
```

**パラメーター**:
- `isTopicSelected`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isTopicSelected);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderContent

**シグネチャ**:
```javascript
 renderContent(ctx)
```

**パラメーター**:
- `ctx`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderContent(ctx);

// renderContentの実用的な使用例
const result = instance.renderContent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.currentContent)
```

**パラメーター**:
- `!this.currentContent`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.currentContent);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

タイトル

**シグネチャ**:
```javascript
 if (this.currentContent.title)
```

**パラメーター**:
- `this.currentContent.title`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentContent.title);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

説明文

**シグネチャ**:
```javascript
 if (this.currentContent.description)
```

**パラメーター**:
- `this.currentContent.description`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentContent.description);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < this.currentContent.steps.length; i++)
```

**パラメーター**:
- `let i = 0; i < this.currentContent.steps.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < this.currentContent.steps.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentY > content.y + content.height - 30)
```

**パラメーター**:
- `currentY > content.y + content.height - 30`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentY > content.y + content.height - 30);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderSearchResults

**シグネチャ**:
```javascript
 renderSearchResults(ctx)
```

**パラメーター**:
- `ctx`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderSearchResults(ctx);

// renderSearchResultsの実用的な使用例
const result = instance.renderSearchResults(/* 適切なパラメータ */);
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

#### renderBackButton

**シグネチャ**:
```javascript
 renderBackButton(ctx)
```

**パラメーター**:
- `ctx`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderBackButton(ctx);

// renderBackButtonの実用的な使用例
const result = instance.renderBackButton(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderWrappedText

**シグネチャ**:
```javascript
 renderWrappedText(ctx, text, x, y, maxWidth)
```

**パラメーター**:
- `ctx`
- `text`
- `x`
- `y`
- `maxWidth`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderWrappedText(ctx, text, x, y, maxWidth);

// renderWrappedTextの実用的な使用例
const result = instance.renderWrappedText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const word of words)
```

**パラメーター**:
- `const word of words`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const word of words);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (testWidth > maxWidth && line !== '')
```

**パラメーター**:
- `testWidth > maxWidth && line !== ''`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(testWidth > maxWidth && line !== '');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (line !== '')
```

**パラメーター**:
- `line !== ''`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(line !== '');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `topics` | 説明なし |
| `category` | 説明なし |
| `firstTopic` | 説明なし |
| `handler` | 説明なし |
| `rect` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `relativeY` | 説明なし |
| `itemHeight` | 説明なし |
| `category` | 説明なし |
| `topic` | 説明なし |
| `category` | 説明なし |
| `category` | 説明なし |
| `currentIndex` | 説明なし |
| `newIndex` | 説明なし |
| `currentIndex` | 説明なし |
| `newIndex` | 説明なし |
| `result` | 説明なし |
| `t` | 説明なし |
| `t` | 説明なし |
| `searchBar` | 説明なし |
| `text` | 説明なし |
| `t` | 説明なし |
| `sidebar` | 説明なし |
| `isSelected` | 説明なし |
| `topic` | 説明なし |
| `isTopicSelected` | 説明なし |
| `content` | 説明なし |
| `step` | 説明なし |
| `content` | 説明なし |
| `result` | 説明なし |
| `isSelected` | 説明なし |
| `t` | 説明なし |
| `button` | 説明なし |
| `words` | 説明なし |
| `testLine` | 説明なし |
| `metrics` | 説明なし |
| `testWidth` | 説明なし |

---

