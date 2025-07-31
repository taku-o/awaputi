# ExportDialog

## 概要

ファイル: `scenes/components/ExportDialog.js`  
最終更新: 2025/7/29 14:46:52

## 目次

## クラス
- [ExportDialog](#exportdialog)
## 定数
- [contentY](#contenty)
- [barWidth](#barwidth)
- [barHeight](#barheight)
- [barX](#barx)
- [barY](#bary)
- [progress](#progress)
- [exportInfo](#exportinfo)
- [format](#format)
- [radioX](#radiox)
- [radioY](#radioy)
- [isSelected](#isselected)
- [options](#options)
- [option](#option)
- [checkX](#checkx)
- [checkY](#checky)
- [isChecked](#ischecked)
- [previewHeight](#previewheight)
- [lines](#lines)
- [line](#line)
- [truncatedLine](#truncatedline)
- [radius](#radius)
- [size](#size)
- [playerData](#playerdata)
- [data](#data)
- [statisticsManager](#statisticsmanager)
- [data](#data)
- [info](#info)
- [sizeKB](#sizekb)
- [optionCount](#optioncount)
- [format](#format)
- [filename](#filename)
- [blob](#blob)
- [url](#url)
- [a](#a)
- [contentY](#contenty)
- [formatY](#formaty)
- [radioY](#radioy)
- [optionY](#optiony)
- [options](#options)
- [checkY](#checky)

---

## ExportDialog

**継承元**: `BaseDialog`

### コンストラクタ

```javascript
new ExportDialog(gameEngine, eventBus, state)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `title` | 説明なし |
| `exportFormats` | 説明なし |
| `selectedFormat` | 説明なし |
| `exportInProgress` | 説明なし |
| `selectedFormat` | 'playerData' or 'statistics' |
| `buttons` | 説明なし |
| `selectedFormat` | 説明なし |
| `exportInProgress` | 説明なし |
| `exportInProgress` | 説明なし |
| `exportInProgress` | 説明なし |
| `selectedFormat` | 説明なし |

### メソッド

#### initialize

**シグネチャ**:
```javascript
async initialize(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initialize(options = {});

// システムの初期化
await instance.initialize();
console.log('Initialization complete');
```

#### setupButtons

**シグネチャ**:
```javascript
 setupButtons()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupButtons();

// setupButtonsの実用的な使用例
const result = instance.setupButtons(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### disabled

**シグネチャ**:
```javascript
 disabled()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.disabled();

// disabledの実用的な使用例
const result = instance.disabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### disabled

**シグネチャ**:
```javascript
 disabled()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.disabled();

// disabledの実用的な使用例
const result = instance.disabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderContent

**シグネチャ**:
```javascript
 renderContent(context, layout)
```

**パラメーター**:
- `context`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderContent(context, layout);

// renderContentの実用的な使用例
const result = instance.renderContent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.exportInProgress)
```

**パラメーター**:
- `this.exportInProgress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.exportInProgress);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.data.exportData)
```

**パラメーター**:
- `this.data.exportData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.data.exportData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderProgress

**シグネチャ**:
```javascript
 renderProgress(context, layout, y)
```

**パラメーター**:
- `context`
- `layout`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderProgress(context, layout, y);

// renderProgressの実用的な使用例
const result = instance.renderProgress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderExportResult

**シグネチャ**:
```javascript
 renderExportResult(context, layout, y)
```

**パラメーター**:
- `context`
- `layout`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderExportResult(context, layout, y);

// renderExportResultの実用的な使用例
const result = instance.renderExportResult(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const info of exportInfo)
```

**パラメーター**:
- `const info of exportInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const info of exportInfo);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderExportOptions

**シグネチャ**:
```javascript
 renderExportOptions(context, layout, y)
```

**パラメーター**:
- `context`
- `layout`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderExportOptions(context, layout, y);

// renderExportOptionsの実用的な使用例
const result = instance.renderExportOptions(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderFormatSelection

**シグネチャ**:
```javascript
 renderFormatSelection(context, layout, y)
```

**パラメーター**:
- `context`
- `layout`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderFormatSelection(context, layout, y);

// renderFormatSelectionの実用的な使用例
const result = instance.renderFormatSelection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < this.exportFormats.length; i++)
```

**パラメーター**:
- `let i = 0; i < this.exportFormats.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < this.exportFormats.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderOptionCheckboxes

**シグネチャ**:
```javascript
 renderOptionCheckboxes(context, layout, y)
```

**パラメーター**:
- `context`
- `layout`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderOptionCheckboxes(context, layout, y);

// renderOptionCheckboxesの実用的な使用例
const result = instance.renderOptionCheckboxes(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < options.length; i++)
```

**パラメーター**:
- `let i = 0; i < options.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < options.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderDataPreview

**シグネチャ**:
```javascript
 renderDataPreview(context, layout, y)
```

**パラメーター**:
- `context`
- `layout`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderDataPreview(context, layout, y);

// renderDataPreviewの実用的な使用例
const result = instance.renderDataPreview(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < lines.length; i++)
```

**パラメーター**:
- `let i = 0; i < lines.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < lines.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderRadioButton

**シグネチャ**:
```javascript
 renderRadioButton(context, x, y, selected)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `selected`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderRadioButton(context, x, y, selected);

// renderRadioButtonの実用的な使用例
const result = instance.renderRadioButton(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

内円（選択時）

**シグネチャ**:
```javascript
 if (selected)
```

**パラメーター**:
- `selected`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(selected);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderCheckbox

**シグネチャ**:
```javascript
 renderCheckbox(context, x, y, checked)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `checked`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderCheckbox(context, x, y, checked);

// renderCheckboxの実用的な使用例
const result = instance.renderCheckbox(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

チェックマーク

**シグネチャ**:
```javascript
 if (checked)
```

**パラメーター**:
- `checked`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(checked);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performExport

**シグネチャ**:
```javascript
async performExport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performExport();

// performExportの実用的な使用例
const result = instance.performExport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.data.exportType === 'statistics')
```

**パラメーター**:
- `this.data.exportType === 'statistics'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.data.exportType === 'statistics');

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

#### exportPlayerData

**シグネチャ**:
```javascript
async exportPlayerData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exportPlayerData();

// exportPlayerDataの実用的な使用例
const result = instance.exportPlayerData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.data.options.includeStatistics && this.gameEngine.statisticsManager)
```

**パラメーター**:
- `this.data.options.includeStatistics && this.gameEngine.statisticsManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.data.options.includeStatistics && this.gameEngine.statisticsManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.data.options.includeAchievements && this.gameEngine.achievementManager)
```

**パラメーター**:
- `this.data.options.includeAchievements && this.gameEngine.achievementManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.data.options.includeAchievements && this.gameEngine.achievementManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.data.options.includeMetadata)
```

**パラメーター**:
- `this.data.options.includeMetadata`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.data.options.includeMetadata);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### exportStatisticsData

**シグネチャ**:
```javascript
async exportStatisticsData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exportStatisticsData();

// exportStatisticsDataの実用的な使用例
const result = instance.exportStatisticsData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!statisticsManager)
```

**パラメーター**:
- `!statisticsManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!statisticsManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.data.options.includeMetadata)
```

**パラメーター**:
- `this.data.options.includeMetadata`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.data.options.includeMetadata);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### formatExportData

**シグネチャ**:
```javascript
 formatExportData(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.formatExportData(data);

// formatExportDataの実用的な使用例
const result = instance.formatExportData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (this.selectedFormat)
```

**パラメーター**:
- `this.selectedFormat`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(this.selectedFormat);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### convertToTextFormat

**シグネチャ**:
```javascript
 convertToTextFormat(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.convertToTextFormat(data);

// convertToTextFormatの実用的な使用例
const result = instance.convertToTextFormat(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data.playerData)
```

**パラメーター**:
- `data.playerData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.playerData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data.statistics)
```

**パラメーター**:
- `data.statistics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.statistics);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data.achievements)
```

**パラメーター**:
- `data.achievements`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.achievements);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getExportInfo

**シグネチャ**:
```javascript
 getExportInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getExportInfo();

// getExportInfoの実用的な使用例
const result = instance.getExportInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.data.exportData)
```

**パラメーター**:
- `this.data.exportData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.data.exportData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleDownload

**シグネチャ**:
```javascript
 handleDownload()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleDownload();

// handleDownloadの実用的な使用例
const result = instance.handleDownload(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.data.exportData)
```

**パラメーター**:
- `!this.data.exportData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.data.exportData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.onResult)
```

**パラメーター**:
- `this.onResult`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.onResult);

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

#### handleCopy

**シグネチャ**:
```javascript
async handleCopy()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleCopy();

// handleCopyの実用的な使用例
const result = instance.handleCopy(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.data.exportData)
```

**パラメーター**:
- `!this.data.exportData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.data.exportData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.onResult)
```

**パラメーター**:
- `this.onResult`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.onResult);

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

#### handleContentClick

**シグネチャ**:
```javascript
 handleContentClick(x, y, layout)
```

**パラメーター**:
- `x`
- `y`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleContentClick(x, y, layout);

// handleContentClickの実用的な使用例
const result = instance.handleContentClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.exportInProgress || this.data.exportData)
```

**パラメーター**:
- `this.exportInProgress || this.data.exportData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.exportInProgress || this.data.exportData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < this.exportFormats.length; i++)
```

**パラメーター**:
- `let i = 0; i < this.exportFormats.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < this.exportFormats.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (y >= radioY - 10 && y <= radioY + 10)
```

**パラメーター**:
- `y >= radioY - 10 && y <= radioY + 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(y >= radioY - 10 && y <= radioY + 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < options.length; i++)
```

**パラメーター**:
- `let i = 0; i < options.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < options.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (y >= checkY - 10 && y <= checkY + 10)
```

**パラメーター**:
- `y >= checkY - 10 && y <= checkY + 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(y >= checkY - 10 && y <= checkY + 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `contentY` | 説明なし |
| `barWidth` | 説明なし |
| `barHeight` | 説明なし |
| `barX` | 説明なし |
| `barY` | 説明なし |
| `progress` | 説明なし |
| `exportInfo` | 説明なし |
| `format` | 説明なし |
| `radioX` | 説明なし |
| `radioY` | 説明なし |
| `isSelected` | 説明なし |
| `options` | 説明なし |
| `option` | 説明なし |
| `checkX` | 説明なし |
| `checkY` | 説明なし |
| `isChecked` | 説明なし |
| `previewHeight` | 説明なし |
| `lines` | 説明なし |
| `line` | 説明なし |
| `truncatedLine` | 説明なし |
| `radius` | 説明なし |
| `size` | 説明なし |
| `playerData` | 説明なし |
| `data` | 説明なし |
| `statisticsManager` | 説明なし |
| `data` | 説明なし |
| `info` | 説明なし |
| `sizeKB` | 説明なし |
| `optionCount` | 説明なし |
| `format` | 説明なし |
| `filename` | 説明なし |
| `blob` | 説明なし |
| `url` | 説明なし |
| `a` | 説明なし |
| `contentY` | 説明なし |
| `formatY` | 説明なし |
| `radioY` | 説明なし |
| `optionY` | 説明なし |
| `options` | 説明なし |
| `checkY` | 説明なし |

---

