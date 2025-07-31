# ErrorScreenshotCapture

## 概要

ファイル: `debug/ErrorScreenshotCapture.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [ErrorScreenshotCapture](#errorscreenshotcapture)
## 定数
- [screenshot](#screenshot)
- [screenshot](#screenshot)
- [canvas](#canvas)
- [ctx](#ctx)
- [originalWidth](#originalwidth)
- [originalHeight](#originalheight)
- [needsResize](#needsresize)
- [tempCanvas](#tempcanvas)
- [tempCtx](#tempctx)
- [scale](#scale)
- [canvas](#canvas)
- [removed](#removed)
- [metadataOnly](#metadataonly)
- [stored](#stored)
- [data](#data)
- [oneHourAgo](#onehourago)
- [base64Data](#base64data)
- [index](#index)
- [removed](#removed)
- [totalSize](#totalsize)

---

## ErrorScreenshotCapture

### コンストラクタ

```javascript
new ErrorScreenshotCapture(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `isEnabled` | 説明なし |
| `compressionQuality` | 説明なし |
| `maxScreenshots` | 説明なし |
| `storedScreenshots` | 説明なし |
| `captureSettings` | スクリーンショット設定 |
| `storageKey` | ストレージ設定 |
| `maxStorageSize` | 説明なし |
| `storedScreenshots` | メタデータのみ復元（実際の画像データは除く） |
| `storedScreenshots` | 説明なし |
| `storedScreenshots` | 説明なし |
| `isEnabled` | 説明なし |
| `captureSettings` | 説明なし |
| `storedScreenshots` | 説明なし |

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

#### captureOnCriticalError

**シグネチャ**:
```javascript
async captureOnCriticalError(error, context = {})
```

**パラメーター**:
- `error`
- `context = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.captureOnCriticalError(error, context = {});

// captureOnCriticalErrorの実用的な使用例
const result = instance.captureOnCriticalError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (screenshot)
```

**パラメーター**:
- `screenshot`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(screenshot);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (captureError)
```

**パラメーター**:
- `captureError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(captureError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### captureScreenshot

**シグネチャ**:
```javascript
async captureScreenshot(metadata = {})
```

**パラメーター**:
- `metadata = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.captureScreenshot(metadata = {});

// captureScreenshotの実用的な使用例
const result = instance.captureScreenshot(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.captureSettings.includeCanvas && this.gameEngine?.canvas)
```

**パラメーター**:
- `this.captureSettings.includeCanvas && this.gameEngine?.canvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.captureSettings.includeCanvas && this.gameEngine?.canvas);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.captureSettings.includeDOM)
```

**パラメーター**:
- `this.captureSettings.includeDOM`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.captureSettings.includeDOM);

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

#### captureCanvasScreenshot

**シグネチャ**:
```javascript
async captureCanvasScreenshot()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.captureCanvasScreenshot();

// captureCanvasScreenshotの実用的な使用例
const result = instance.captureCanvasScreenshot(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.gameEngine?.canvas)
```

**パラメーター**:
- `!this.gameEngine?.canvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.gameEngine?.canvas);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (needsResize)
```

**パラメーター**:
- `needsResize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(needsResize);

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

#### captureDOMScreenshot

**シグネチャ**:
```javascript
async captureDOMScreenshot()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.captureDOMScreenshot();

// captureDOMScreenshotの実用的な使用例
const result = instance.captureDOMScreenshot(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

html2canvasライブラリが必要

**シグネチャ**:
```javascript
 if (typeof html2canvas === 'undefined')
```

**パラメーター**:
- `typeof html2canvas === 'undefined'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof html2canvas === 'undefined');

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

#### storeScreenshot

**シグネチャ**:
```javascript
 storeScreenshot(screenshot)
```

**パラメーター**:
- `screenshot`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.storeScreenshot(screenshot);

// storeScreenshotの実用的な使用例
const result = instance.storeScreenshot(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

サイズ制限チェック

**シグネチャ**:
```javascript
 if (screenshot.size > this.maxStorageSize)
```

**パラメーター**:
- `screenshot.size > this.maxStorageSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(screenshot.size > this.maxStorageSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

最大数制限の適用

**シグネチャ**:
```javascript
 while (this.storedScreenshots.length > this.maxScreenshots)
```

**パラメーター**:
- `this.storedScreenshots.length > this.maxScreenshots`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(this.storedScreenshots.length > this.maxScreenshots);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
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

#### enforceStorageSizeLimit

**シグネチャ**:
```javascript
 enforceStorageSizeLimit()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enforceStorageSizeLimit();

// enforceStorageSizeLimitの実用的な使用例
const result = instance.enforceStorageSizeLimit(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

**シグネチャ**:
```javascript
 while (totalSize > this.maxStorageSize && this.storedScreenshots.length > 0)
```

**パラメーター**:
- `totalSize > this.maxStorageSize && this.storedScreenshots.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(totalSize > this.maxStorageSize && this.storedScreenshots.length > 0);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### saveToLocalStorage

**シグネチャ**:
```javascript
 saveToLocalStorage()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveToLocalStorage();

// saveToLocalStorageの実用的な使用例
const result = instance.saveToLocalStorage(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (error.name === 'QuotaExceededError')
```

**パラメーター**:
- `error.name === 'QuotaExceededError'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(error.name === 'QuotaExceededError');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### loadStoredScreenshots

**シグネチャ**:
```javascript
 loadStoredScreenshots()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadStoredScreenshots();

// loadStoredScreenshotsの実用的な使用例
const result = instance.loadStoredScreenshots(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (stored)
```

**パラメーター**:
- `stored`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stored);

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

#### clearOldScreenshots

**シグネチャ**:
```javascript
 clearOldScreenshots()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearOldScreenshots();

// clearOldScreenshotsの実用的な使用例
const result = instance.clearOldScreenshots(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupStorageCleanup

**シグネチャ**:
```javascript
 setupStorageCleanup()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupStorageCleanup();

// setupStorageCleanupの実用的な使用例
const result = instance.setupStorageCleanup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### estimateDataSize

**シグネチャ**:
```javascript
 estimateDataSize(dataUrl)
```

**パラメーター**:
- `dataUrl`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateDataSize(dataUrl);

// estimateDataSizeの実用的な使用例
const result = instance.estimateDataSize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateScreenshotId

**シグネチャ**:
```javascript
 generateScreenshotId()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateScreenshotId();

// generateScreenshotIdの実用的な使用例
const result = instance.generateScreenshotId(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getScreenshots

**シグネチャ**:
```javascript
 getScreenshots(filter = {})
```

**パラメーター**:
- `filter = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getScreenshots(filter = {});

// getScreenshotsの実用的な使用例
const result = instance.getScreenshots(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getScreenshot

**シグネチャ**:
```javascript
 getScreenshot(id)
```

**パラメーター**:
- `id`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getScreenshot(id);

// getScreenshotの実用的な使用例
const result = instance.getScreenshot(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setEnabled

**シグネチャ**:
```javascript
 setEnabled(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setEnabled(enabled);

// setEnabledの実用的な使用例
const result = instance.setEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateSettings

**シグネチャ**:
```javascript
 updateSettings(newSettings)
```

**パラメーター**:
- `newSettings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateSettings(newSettings);

// updateSettingsの実用的な使用例
const result = instance.updateSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### deleteScreenshot

**シグネチャ**:
```javascript
 deleteScreenshot(id)
```

**パラメーター**:
- `id`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.deleteScreenshot(id);

// deleteScreenshotの実用的な使用例
const result = instance.deleteScreenshot(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (index !== -1)
```

**パラメーター**:
- `index !== -1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(index !== -1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearAllScreenshots

**シグネチャ**:
```javascript
 clearAllScreenshots()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearAllScreenshots();

// clearAllScreenshotsの実用的な使用例
const result = instance.clearAllScreenshots(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStorageInfo

**シグネチャ**:
```javascript
 getStorageInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStorageInfo();

// getStorageInfoの実用的な使用例
const result = instance.getStorageInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### destroy

**シグネチャ**:
```javascript
 destroy()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.destroy();

// リソースのクリーンアップ
instance.destroy();
console.log('Resources cleaned up');
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `screenshot` | 説明なし |
| `screenshot` | 説明なし |
| `canvas` | 説明なし |
| `ctx` | 説明なし |
| `originalWidth` | 説明なし |
| `originalHeight` | 説明なし |
| `needsResize` | 説明なし |
| `tempCanvas` | 説明なし |
| `tempCtx` | 説明なし |
| `scale` | 説明なし |
| `canvas` | 説明なし |
| `removed` | 説明なし |
| `metadataOnly` | 説明なし |
| `stored` | 説明なし |
| `data` | 説明なし |
| `oneHourAgo` | 説明なし |
| `base64Data` | 説明なし |
| `index` | 説明なし |
| `removed` | 説明なし |
| `totalSize` | 説明なし |

---

