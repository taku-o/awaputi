# RTLUIComponents

## 概要

ファイル: `core/i18n/rtl/RTLUIComponents.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [RTLUIComponents](#rtluicomponents)
## 関数
- [getRTLUIComponents()](#getrtluicomponents)
## 定数
- [factory](#factory)
- [component](#component)
- [componentId](#componentid)
- [input](#input)
- [direction](#direction)
- [hasRTL](#hasrtl)
- [textarea](#textarea)
- [select](#select)
- [opt](#opt)
- [menu](#menu)
- [li](#li)
- [submenu](#submenu)
- [nav](#nav)
- [ul](#ul)
- [li](#li)
- [a](#a)
- [icon](#icon)
- [text](#text)
- [breadcrumb](#breadcrumb)
- [ol](#ol)
- [reversedItems](#reverseditems)
- [li](#li)
- [a](#a)
- [sep](#sep)
- [pagination](#pagination)
- [ul](#ul)
- [lastLi](#lastli)
- [nextLi](#nextli)
- [startPage](#startpage)
- [endPage](#endpage)
- [li](#li)
- [prevLi](#prevli)
- [firstLi](#firstli)
- [dialog](#dialog)
- [header](#header)
- [titleEl](#titleel)
- [closeBtn](#closebtn)
- [contentEl](#contentel)
- [footer](#footer)
- [btn](#btn)
- [tooltip](#tooltip)
- [dropdown](#dropdown)
- [triggerEl](#triggerel)
- [menu](#menu)
- [itemEl](#itemel)
- [isVisible](#isvisible)
- [li](#li)
- [a](#a)
- [event](#event)
- [component](#component)

---

## RTLUIComponents

### コンストラクタ

```javascript
new RTLUIComponents()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `rtlDetector` | 説明なし |
| `layoutManager` | 説明なし |
| `componentFactories` | コンポーネントファクトリ |
| `defaultRTLStyles` | RTL対応のデフォルトスタイル |
| `registeredComponents` | 登録済みコンポーネント |

### メソッド

#### createRTLComponent

**シグネチャ**:
```javascript
 createRTLComponent(type, options = {})
```

**パラメーター**:
- `type`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRTLComponent(type, options = {});

// createRTLComponentの実用的な使用例
const result = instance.createRTLComponent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!factory)
```

**パラメーター**:
- `!factory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!factory);

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

#### createRTLInput

**シグネチャ**:
```javascript
 createRTLInput(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRTLInput(options = {});

// createRTLInputの実用的な使用例
const result = instance.createRTLInput(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

自動方向検出

**シグネチャ**:
```javascript
 if (autoDirection)
```

**パラメーター**:
- `autoDirection`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(autoDirection);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (direction.confidence > 0.7)
```

**パラメーター**:
- `direction.confidence > 0.7`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(direction.confidence > 0.7);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

RTL文字検証

**シグネチャ**:
```javascript
 if (validateRTL)
```

**パラメーター**:
- `validateRTL`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(validateRTL);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRTLTextArea

**シグネチャ**:
```javascript
 createRTLTextArea(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRTLTextArea(options = {});

// createRTLTextAreaの実用的な使用例
const result = instance.createRTLTextArea(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

自動リサイズ

**シグネチャ**:
```javascript
 if (autoResize)
```

**パラメーター**:
- `autoResize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(autoResize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRTLSelect

**シグネチャ**:
```javascript
 createRTLSelect(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRTLSelect(options = {});

// createRTLSelectの実用的な使用例
const result = instance.createRTLSelect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (option.value === value)
```

**パラメーター**:
- `option.value === value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(option.value === value);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRTLMenu

**シグネチャ**:
```javascript
 createRTLMenu(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRTLMenu(options = {});

// createRTLMenuの実用的な使用例
const result = instance.createRTLMenu(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof item === 'string')
```

**パラメーター**:
- `typeof item === 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof item === 'string');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (item.onClick)
```

**パラメーター**:
- `item.onClick`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(item.onClick);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (item.submenu)
```

**パラメーター**:
- `item.submenu`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(item.submenu);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRTLNavigation

**シグネチャ**:
```javascript
 createRTLNavigation(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRTLNavigation(options = {});

// createRTLNavigationの実用的な使用例
const result = instance.createRTLNavigation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (showIcons && link.icon)
```

**パラメーター**:
- `showIcons && link.icon`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(showIcons && link.icon);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRTLBreadcrumb

**シグネチャ**:
```javascript
 createRTLBreadcrumb(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRTLBreadcrumb(options = {});

// createRTLBreadcrumbの実用的な使用例
const result = instance.createRTLBreadcrumb(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (index === reversedItems.length - 1)
```

**パラメーター**:
- `index === reversedItems.length - 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(index === reversedItems.length - 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRTLPagination

**シグネチャ**:
```javascript
 createRTLPagination(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRTLPagination(options = {});

// createRTLPaginationの実用的な使用例
const result = instance.createRTLPagination(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最初のページ（RTLでは最後に表示）

**シグネチャ**:
```javascript
 if (showFirstLast && currentPage > 1)
```

**パラメーター**:
- `showFirstLast && currentPage > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(showFirstLast && currentPage > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

次のページ（RTLでは前に表示）

**シグネチャ**:
```javascript
 if (showPrevNext && currentPage < totalPages)
```

**パラメーター**:
- `showPrevNext && currentPage < totalPages`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(showPrevNext && currentPage < totalPages);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = endPage; i >= startPage; i--)
```

**パラメーター**:
- `let i = endPage; i >= startPage; i--`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = endPage; i >= startPage; i--);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

前のページ（RTLでは後に表示）

**シグネチャ**:
```javascript
 if (showPrevNext && currentPage > 1)
```

**パラメーター**:
- `showPrevNext && currentPage > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(showPrevNext && currentPage > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最後のページ（RTLでは最初に表示）

**シグネチャ**:
```javascript
 if (showFirstLast && currentPage < totalPages)
```

**パラメーター**:
- `showFirstLast && currentPage < totalPages`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(showFirstLast && currentPage < totalPages);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRTLDialog

**シグネチャ**:
```javascript
 createRTLDialog(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRTLDialog(options = {});

// createRTLDialogの実用的な使用例
const result = instance.createRTLDialog(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ダイアログヘッダー

**シグネチャ**:
```javascript
 if (title)
```

**パラメーター**:
- `title`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(title);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ダイアログコンテンツ

**シグネチャ**:
```javascript
 if (content)
```

**パラメーター**:
- `content`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(content);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ダイアログフッター

**シグネチャ**:
```javascript
 if (buttons.length > 0)
```

**パラメーター**:
- `buttons.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(buttons.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (button.onClick)
```

**パラメーター**:
- `button.onClick`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(button.onClick);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRTLTooltip

**シグネチャ**:
```javascript
 createRTLTooltip(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRTLTooltip(options = {});

// createRTLTooltipの実用的な使用例
const result = instance.createRTLTooltip(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRTLDropdown

**シグネチャ**:
```javascript
 createRTLDropdown(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRTLDropdown(options = {});

// createRTLDropdownの実用的な使用例
const result = instance.createRTLDropdown(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (item.onClick)
```

**パラメーター**:
- `item.onClick`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(item.onClick);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createPaginationItem

**シグネチャ**:
```javascript
 createPaginationItem(text, page, type)
```

**パラメーター**:
- `text`
- `page`
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createPaginationItem(text, page, type);

// createPaginationItemの実用的な使用例
const result = instance.createPaginationItem(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (type === 'current')
```

**パラメーター**:
- `type === 'current'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(type === 'current');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateComponentId

**シグネチャ**:
```javascript
 generateComponentId(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateComponentId(type);

// generateComponentIdの実用的な使用例
const result = instance.generateComponentId(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRegisteredComponent

**シグネチャ**:
```javascript
 getRegisteredComponent(componentId)
```

**パラメーター**:
- `componentId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRegisteredComponent(componentId);

// getRegisteredComponentの実用的な使用例
const result = instance.getRegisteredComponent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### destroyComponent

**シグネチャ**:
```javascript
 destroyComponent(componentId)
```

**パラメーター**:
- `componentId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.destroyComponent(componentId);

// destroyComponentの実用的な使用例
const result = instance.destroyComponent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (component)
```

**パラメーター**:
- `component`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(component);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

要素を削除

**シグネチャ**:
```javascript
 if (component.element.parentNode)
```

**パラメーター**:
- `component.element.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(component.element.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAllComponents

**シグネチャ**:
```javascript
 getAllComponents()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAllComponents();

// getAllComponentsの実用的な使用例
const result = instance.getAllComponents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addComponentFactory

**シグネチャ**:
```javascript
 addComponentFactory(type, factory)
```

**パラメーター**:
- `type`
- `factory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addComponentFactory(type, factory);

// addComponentFactoryの実用的な使用例
const result = instance.addComponentFactory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStats

**シグネチャ**:
```javascript
 getStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStats();

// getStatsの実用的な使用例
const result = instance.getStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getRTLUIComponents

**シグネチャ**:
```javascript
getRTLUIComponents()
```

**使用例**:
```javascript
const result = getRTLUIComponents();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `factory` | 説明なし |
| `component` | 説明なし |
| `componentId` | 説明なし |
| `input` | 説明なし |
| `direction` | 説明なし |
| `hasRTL` | 説明なし |
| `textarea` | 説明なし |
| `select` | 説明なし |
| `opt` | 説明なし |
| `menu` | 説明なし |
| `li` | 説明なし |
| `submenu` | 説明なし |
| `nav` | 説明なし |
| `ul` | 説明なし |
| `li` | 説明なし |
| `a` | 説明なし |
| `icon` | 説明なし |
| `text` | 説明なし |
| `breadcrumb` | 説明なし |
| `ol` | 説明なし |
| `reversedItems` | 説明なし |
| `li` | 説明なし |
| `a` | 説明なし |
| `sep` | 説明なし |
| `pagination` | 説明なし |
| `ul` | 説明なし |
| `lastLi` | 説明なし |
| `nextLi` | 説明なし |
| `startPage` | 説明なし |
| `endPage` | 説明なし |
| `li` | 説明なし |
| `prevLi` | 説明なし |
| `firstLi` | 説明なし |
| `dialog` | 説明なし |
| `header` | 説明なし |
| `titleEl` | 説明なし |
| `closeBtn` | 説明なし |
| `contentEl` | 説明なし |
| `footer` | 説明なし |
| `btn` | 説明なし |
| `tooltip` | 説明なし |
| `dropdown` | 説明なし |
| `triggerEl` | 説明なし |
| `menu` | 説明なし |
| `itemEl` | 説明なし |
| `isVisible` | 説明なし |
| `li` | 説明なし |
| `a` | 説明なし |
| `event` | 説明なし |
| `component` | 説明なし |

---

