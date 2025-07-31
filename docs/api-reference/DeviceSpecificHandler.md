# DeviceSpecificHandler

## 概要

ファイル: `core/DeviceSpecificHandler.js`  
最終更新: 2025/7/29 9:06:33

## 目次

## クラス
- [DeviceSpecificHandler](#devicespecifichandler)
## 関数
- [getDeviceSpecificHandler()](#getdevicespecifichandler)
## 定数
- [userAgent](#useragent)
- [platform](#platform)
- [userAgent](#useragent)
- [testElement](#testelement)
- [hasNotch](#hasnotch)
- [canvas](#canvas)
- [container](#container)
- [touchEndTime](#touchendtime)
- [duration](#duration)
- [touchEndPos](#touchendpos)
- [distance](#distance)
- [clickEvent](#clickevent)
- [metaTags](#metatags)
- [updateViewportHeight](#updateviewportheight)
- [vh](#vh)
- [now](#now)
- [canvas](#canvas)
- [ctx](#ctx)
- [memoryRatio](#memoryratio)
- [canvas](#canvas)
- [canvas](#canvas)
- [passiveOptions](#passiveoptions)
- [now](#now)
- [canvas](#canvas)
- [rect](#rect)
- [x](#x)
- [y](#y)
- [delta](#delta)
- [canvas](#canvas)
- [ctx](#ctx)
- [dpr](#dpr)
- [rect](#rect)
- [checkDPRChange](#checkdprchange)
- [newDPR](#newdpr)
- [observer](#observer)
- [canvas](#canvas)
- [ctx](#ctx)
- [CLEANUP_INTERVAL](#cleanup_interval)
- [originalRender](#originalrender)
- [audioContext](#audiocontext)
- [resumeAudio](#resumeaudio)
- [canvas](#canvas)
- [optimizeFunction](#optimizefunction)
- [canvas](#canvas)
- [canvas](#canvas)

---

## DeviceSpecificHandler

### コンストラクタ

```javascript
new DeviceSpecificHandler(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `errorHandler` | 説明なし |
| `platform` | プラットフォーム検出結果 |
| `iosConfig` | iOS固有設定 |
| `androidConfig` | Android固有設定 |
| `highDPIConfig` | 高DPI対応設定 |

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

#### detectPlatform

**シグネチャ**:
```javascript
 detectPlatform()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectPlatform();

// detectPlatformの実用的な使用例
const result = instance.detectPlatform(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectBrowserVersion

**シグネチャ**:
```javascript
 detectBrowserVersion()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectBrowserVersion();

// detectBrowserVersionの実用的な使用例
const result = instance.detectBrowserVersion(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.platform.browser === 'safari')
```

**パラメーター**:
- `this.platform.browser === 'safari'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.platform.browser === 'safari');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.platform.browser === 'chrome')
```

**パラメーター**:
- `this.platform.browser === 'chrome'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.platform.browser === 'chrome');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.platform.browser === 'firefox')
```

**パラメーター**:
- `this.platform.browser === 'firefox'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.platform.browser === 'firefox');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.platform.browser === 'edge')
```

**パラメーター**:
- `this.platform.browser === 'edge'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.platform.browser === 'edge');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectNotch

**シグネチャ**:
```javascript
 detectNotch()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectNotch();

// detectNotchの実用的な使用例
const result = instance.detectNotch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectSafeAreaSupport

**シグネチャ**:
```javascript
 detectSafeAreaSupport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectSafeAreaSupport();

// detectSafeAreaSupportの実用的な使用例
const result = instance.detectSafeAreaSupport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyPlatformOptimizations

**シグネチャ**:
```javascript
 applyPlatformOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyPlatformOptimizations();

// applyPlatformOptimizationsの実用的な使用例
const result = instance.applyPlatformOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.platform.isIOS)
```

**パラメーター**:
- `this.platform.isIOS`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.platform.isIOS);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.platform.isAndroid)
```

**パラメーター**:
- `this.platform.isAndroid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.platform.isAndroid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.platform.isDesktop)
```

**パラメーター**:
- `this.platform.isDesktop`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.platform.isDesktop);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyIOSOptimizations

**シグネチャ**:
```javascript
 applyIOSOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyIOSOptimizations();

// applyIOSOptimizationsの実用的な使用例
const result = instance.applyIOSOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyWebKitOptimizations

**シグネチャ**:
```javascript
 applyWebKitOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyWebKitOptimizations();

// applyWebKitOptimizationsの実用的な使用例
const result = instance.applyWebKitOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コンテナ最適化

**シグネチャ**:
```javascript
 if (container)
```

**パラメーター**:
- `container`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(container);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyIOSTouchDelayFix

**シグネチャ**:
```javascript
 applyIOSTouchDelayFix()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyIOSTouchDelayFix();

// applyIOSTouchDelayFixの実用的な使用例
const result = instance.applyIOSTouchDelayFix(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

FastClick代替実装

**シグネチャ**:
```javascript
 if (this.iosConfig.touchDelayFix.fastClickEnabled)
```

**パラメーター**:
- `this.iosConfig.touchDelayFix.fastClickEnabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.iosConfig.touchDelayFix.fastClickEnabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

タッチコールアウト無効化

**シグネチャ**:
```javascript
 if (this.iosConfig.touchDelayFix.touchCalloutDisabled)
```

**パラメーター**:
- `this.iosConfig.touchDelayFix.touchCalloutDisabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.iosConfig.touchDelayFix.touchCalloutDisabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

CSS touch-action設定

**シグネチャ**:
```javascript
 if (this.iosConfig.touchDelayFix.touchDelayReduced)
```

**パラメーター**:
- `this.iosConfig.touchDelayFix.touchDelayReduced`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.iosConfig.touchDelayFix.touchDelayReduced);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupFastClick

**シグネチャ**:
```javascript
 setupFastClick()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupFastClick();

// setupFastClickの実用的な使用例
const result = instance.setupFastClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (e.touches.length > 0)
```

**パラメーター**:
- `e.touches.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(e.touches.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (duration < 200 && e.changedTouches.length > 0)
```

**パラメーター**:
- `duration < 200 && e.changedTouches.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(duration < 200 && e.changedTouches.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance < 10)
```

**パラメーター**:
- `distance < 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance < 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyIOSMetaTags

**シグネチャ**:
```javascript
 applyIOSMetaTags()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyIOSMetaTags();

// applyIOSMetaTagsの実用的な使用例
const result = instance.applyIOSMetaTags(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!meta)
```

**パラメーター**:
- `!meta`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!meta);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### fixIOSSafariIssues

**シグネチャ**:
```javascript
 fixIOSSafariIssues()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.fixIOSSafariIssues();

// fixIOSSafariIssuesの実用的な使用例
const result = instance.fixIOSSafariIssues(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (now - lastTouchEnd <= 300)
```

**パラメーター**:
- `now - lastTouchEnd <= 300`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(now - lastTouchEnd <= 300);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyAndroidOptimizations

**シグネチャ**:
```javascript
 applyAndroidOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyAndroidOptimizations();

// applyAndroidOptimizationsの実用的な使用例
const result = instance.applyAndroidOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyBlinkOptimizations

**シグネチャ**:
```javascript
 applyBlinkOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyBlinkOptimizations();

// applyBlinkOptimizationsの実用的な使用例
const result = instance.applyBlinkOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コンポジター最適化

**シグネチャ**:
```javascript
 if (this.androidConfig.blinkOptimizations.compositorThreaded)
```

**パラメーター**:
- `this.androidConfig.blinkOptimizations.compositorThreaded`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.androidConfig.blinkOptimizations.compositorThreaded);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Canvas2D加速有効化

**シグネチャ**:
```javascript
 if (this.androidConfig.blinkOptimizations.acceleratedCanvas)
```

**パラメーター**:
- `this.androidConfig.blinkOptimizations.acceleratedCanvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.androidConfig.blinkOptimizations.acceleratedCanvas);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (ctx.willReadFrequently !== undefined)
```

**パラメーター**:
- `ctx.willReadFrequently !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ctx.willReadFrequently !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

GPU ラスタライゼーション

**シグネチャ**:
```javascript
 if (this.androidConfig.blinkOptimizations.gpuRasterization)
```

**パラメーター**:
- `this.androidConfig.blinkOptimizations.gpuRasterization`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.androidConfig.blinkOptimizations.gpuRasterization);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyAndroidPerformanceOptimizations

**シグネチャ**:
```javascript
 applyAndroidPerformanceOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyAndroidPerformanceOptimizations();

// applyAndroidPerformanceOptimizationsの実用的な使用例
const result = instance.applyAndroidPerformanceOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

低メモリモード検出

**シグネチャ**:
```javascript
 if ('memory' in performance && performance.memory)
```

**パラメーター**:
- `'memory' in performance && performance.memory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if('memory' in performance && performance.memory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (memoryRatio > 0.8)
```

**パラメーター**:
- `memoryRatio > 0.8`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(memoryRatio > 0.8);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バッテリー状態監視

**シグネチャ**:
```javascript
 if ('getBattery' in navigator)
```

**パラメーター**:
- `'getBattery' in navigator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if('getBattery' in navigator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (battery.charging === false && battery.level < 0.2)
```

**パラメーター**:
- `battery.charging === false && battery.level < 0.2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(battery.charging === false && battery.level < 0.2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### enableLowMemoryMode

**シグネチャ**:
```javascript
 enableLowMemoryMode()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enableLowMemoryMode();

// enableLowMemoryModeの実用的な使用例
const result = instance.enableLowMemoryMode(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ガベージコレクション強制実行

**シグネチャ**:
```javascript
 if (window.gc)
```

**パラメーター**:
- `window.gc`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(window.gc);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パフォーマンス設定調整

**シグネチャ**:
```javascript
 if (this.gameEngine.performanceOptimizer)
```

**パラメーター**:
- `this.gameEngine.performanceOptimizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.performanceOptimizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### enablePowerSaveMode

**シグネチャ**:
```javascript
 enablePowerSaveMode()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enablePowerSaveMode();

// enablePowerSaveModeの実用的な使用例
const result = instance.enablePowerSaveMode(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フレームレート削減

**シグネチャ**:
```javascript
 if (this.gameEngine.performanceOptimizer)
```

**パラメーター**:
- `this.gameEngine.performanceOptimizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.performanceOptimizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

エフェクト削減

**シグネチャ**:
```javascript
 if (this.gameEngine.effectsManager)
```

**パラメーター**:
- `this.gameEngine.effectsManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.effectsManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyAndroidTouchOptimizations

**シグネチャ**:
```javascript
 applyAndroidTouchOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyAndroidTouchOptimizations();

// applyAndroidTouchOptimizationsの実用的な使用例
const result = instance.applyAndroidTouchOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パッシブリスナー使用

**シグネチャ**:
```javascript
 if (this.androidConfig.touchOptimizations.passiveListeners)
```

**パラメーター**:
- `this.androidConfig.touchOptimizations.passiveListeners`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.androidConfig.touchOptimizations.passiveListeners);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ズーム防止

**シグネチャ**:
```javascript
 if (this.androidConfig.touchOptimizations.preventZoom)
```

**パラメーター**:
- `this.androidConfig.touchOptimizations.preventZoom`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.androidConfig.touchOptimizations.preventZoom);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupPassiveTouchListeners

**シグネチャ**:
```javascript
 setupPassiveTouchListeners()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupPassiveTouchListeners();

// setupPassiveTouchListenersの実用的な使用例
const result = instance.setupPassiveTouchListeners(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### preventZoom

**シグネチャ**:
```javascript
 preventZoom()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.preventZoom();

// preventZoomの実用的な使用例
const result = instance.preventZoom(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (now - lastTouchEnd <= 300)
```

**パラメーター**:
- `now - lastTouchEnd <= 300`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(now - lastTouchEnd <= 300);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyDesktopOptimizations

**シグネチャ**:
```javascript
 applyDesktopOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyDesktopOptimizations();

// applyDesktopOptimizationsの実用的な使用例
const result = instance.applyDesktopOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupDesktopMouseOptimizations

**シグネチャ**:
```javascript
 setupDesktopMouseOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupDesktopMouseOptimizations();

// setupDesktopMouseOptimizationsの実用的な使用例
const result = instance.setupDesktopMouseOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (e.pointerType === 'mouse')
```

**パラメーター**:
- `e.pointerType === 'mouse'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(e.pointerType === 'mouse');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleHighPrecisionMouse

**シグネチャ**:
```javascript
 handleHighPrecisionMouse(e)
```

**パラメーター**:
- `e`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleHighPrecisionMouse(e);

// handleHighPrecisionMouseの実用的な使用例
const result = instance.handleHighPrecisionMouse(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲームエンジンに高精度座標を渡す

**シグネチャ**:
```javascript
 if (this.gameEngine.inputManager)
```

**パラメーター**:
- `this.gameEngine.inputManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.inputManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleSmoothWheel

**シグネチャ**:
```javascript
 handleSmoothWheel(e)
```

**パラメーター**:
- `e`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleSmoothWheel(e);

// handleSmoothWheelの実用的な使用例
const result = instance.handleSmoothWheel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.inputManager)
```

**パラメーター**:
- `this.gameEngine.inputManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.inputManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupDesktopKeyboardOptimizations

**シグネチャ**:
```javascript
 setupDesktopKeyboardOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupDesktopKeyboardOptimizations();

// setupDesktopKeyboardOptimizationsの実用的な使用例
const result = instance.setupDesktopKeyboardOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleGameKeyboard

**シグネチャ**:
```javascript
 handleGameKeyboard(e)
```

**パラメーター**:
- `e`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleGameKeyboard(e);

// handleGameKeyboardの実用的な使用例
const result = instance.handleGameKeyboard(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フルスクリーン切り替え (F11)

**シグネチャ**:
```javascript
 if (e.key === 'F11')
```

**パラメーター**:
- `F11`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(F11);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パフォーマンス情報表示 (Ctrl+Shift+P)

**シグネチャ**:
```javascript
 if (e.ctrlKey && e.shiftKey && e.key === 'P')
```

**パラメーター**:
- `Ctrl+Shift+P`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(Ctrl+Shift+P);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupHighDPISupport

**シグネチャ**:
```javascript
 setupHighDPISupport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupHighDPISupport();

// setupHighDPISupportの実用的な使用例
const result = instance.setupHighDPISupport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### optimizeCanvasForHighDPI

**シグネチャ**:
```javascript
 optimizeCanvasForHighDPI()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.optimizeCanvasForHighDPI();

// optimizeCanvasForHighDPIの実用的な使用例
const result = instance.optimizeCanvasForHighDPI(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.highDPIConfig.scaling.autoScale)
```

**パラメーター**:
- `this.highDPIConfig.scaling.autoScale`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.highDPIConfig.scaling.autoScale);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Canvas最適化プロパティ設定

**シグネチャ**:
```javascript
 if (this.highDPIConfig.rendering.sharpText)
```

**パラメーター**:
- `this.highDPIConfig.rendering.sharpText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.highDPIConfig.rendering.sharpText);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupDPIChangeDetection

**シグネチャ**:
```javascript
 setupDPIChangeDetection()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupDPIChangeDetection();

// setupDPIChangeDetectionの実用的な使用例
const result = instance.setupDPIChangeDetection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newDPR !== currentDPR)
```

**パラメーター**:
- `newDPR !== currentDPR`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newDPR !== currentDPR);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ResizeObserver使用

**シグネチャ**:
```javascript
 if (window.ResizeObserver)
```

**パラメーター**:
- `window.ResizeObserver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(window.ResizeObserver);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyHighDPIStyles

**シグネチャ**:
```javascript
 applyHighDPIStyles()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyHighDPIStyles();

// applyHighDPIStylesの実用的な使用例
const result = instance.applyHighDPIStyles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

高DPI環境でのレンダリング最適化

**シグネチャ**:
```javascript
 if (this.platform.devicePixelRatio > 1)
```

**パラメーター**:
- `this.platform.devicePixelRatio > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.platform.devicePixelRatio > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.highDPIConfig.rendering.crispEdges)
```

**パラメーター**:
- `this.highDPIConfig.rendering.crispEdges`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.highDPIConfig.rendering.crispEdges);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (ctx.imageSmoothingQuality)
```

**パラメーター**:
- `ctx.imageSmoothingQuality`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ctx.imageSmoothingQuality);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupBrowserSpecificFixes

**シグネチャ**:
```javascript
 setupBrowserSpecificFixes()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupBrowserSpecificFixes();

// setupBrowserSpecificFixesの実用的な使用例
const result = instance.setupBrowserSpecificFixes(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (this.platform.browser)
```

**パラメーター**:
- `this.platform.browser`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(this.platform.browser);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applySafariFixes

**シグネチャ**:
```javascript
 applySafariFixes()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applySafariFixes();

// applySafariFixesの実用的な使用例
const result = instance.applySafariFixes(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupSafariMemoryLeakFix

**シグネチャ**:
```javascript
 setupSafariMemoryLeakFix()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupSafariMemoryLeakFix();

// setupSafariMemoryLeakFixの実用的な使用例
const result = instance.setupSafariMemoryLeakFix(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (frameCount % CLEANUP_INTERVAL === 0)
```

**パラメーター**:
- `frameCount % CLEANUP_INTERVAL === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(frameCount % CLEANUP_INTERVAL === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

強制ガベージコレクション

**シグネチャ**:
```javascript
 if (window.gc)
```

**パラメーター**:
- `window.gc`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(window.gc);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupSafariAudioFix

**シグネチャ**:
```javascript
 setupSafariAudioFix()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupSafariAudioFix();

// setupSafariAudioFixの実用的な使用例
const result = instance.setupSafariAudioFix(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

AudioContextの自動再開

**シグネチャ**:
```javascript
 if (this.gameEngine.audioManager && this.gameEngine.audioManager.audioContext)
```

**パラメーター**:
- `this.gameEngine.audioManager && this.gameEngine.audioManager.audioContext`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.audioManager && this.gameEngine.audioManager.audioContext);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (audioContext.state === 'suspended')
```

**パラメーター**:
- `audioContext.state === 'suspended'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(audioContext.state === 'suspended');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyChromeFixes

**シグネチャ**:
```javascript
 applyChromeFixes()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyChromeFixes();

// applyChromeFixesの実用的な使用例
const result = instance.applyChromeFixes(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupChromeOptimizations

**シグネチャ**:
```javascript
 setupChromeOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupChromeOptimizations();

// setupChromeOptimizationsの実用的な使用例
const result = instance.setupChromeOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupV8Optimizations

**シグネチャ**:
```javascript
 setupV8Optimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupV8Optimizations();

// setupV8Optimizationsの実用的な使用例
const result = instance.setupV8Optimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

関数を事前に実行して最適化を促進

**シグネチャ**:
```javascript
 for (let i = 0; i < 100; i++)
```

**パラメーター**:
- `let i = 0; i < 100; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 100; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

重要な関数を最適化

**シグネチャ**:
```javascript
 if (this.gameEngine.update)
```

**パラメーター**:
- `this.gameEngine.update`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.update);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyFirefoxFixes

**シグネチャ**:
```javascript
 applyFirefoxFixes()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyFirefoxFixes();

// applyFirefoxFixesの実用的な使用例
const result = instance.applyFirefoxFixes(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupFirefoxOptimizations

**シグネチャ**:
```javascript
 setupFirefoxOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupFirefoxOptimizations();

// setupFirefoxOptimizationsの実用的な使用例
const result = instance.setupFirefoxOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyEdgeFixes

**シグネチャ**:
```javascript
 applyEdgeFixes()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyEdgeFixes();

// applyEdgeFixesの実用的な使用例
const result = instance.applyEdgeFixes(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupEdgeOptimizations

**シグネチャ**:
```javascript
 setupEdgeOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupEdgeOptimizations();

// setupEdgeOptimizationsの実用的な使用例
const result = instance.setupEdgeOptimizations(/* 適切なパラメータ */);
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

#### handleOrientationChange

**シグネチャ**:
```javascript
 handleOrientationChange()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleOrientationChange();

// handleOrientationChangeの実用的な使用例
const result = instance.handleOrientationChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲームエンジンに通知

**シグネチャ**:
```javascript
 if (this.gameEngine.handleOrientationChange)
```

**パラメーター**:
- `this.gameEngine.handleOrientationChange`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.handleOrientationChange);

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

#### handleResize

**シグネチャ**:
```javascript
 handleResize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleResize();

// handleResizeの実用的な使用例
const result = instance.handleResize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲームエンジンに通知

**シグネチャ**:
```javascript
 if (this.gameEngine.handleResize)
```

**パラメーター**:
- `this.gameEngine.handleResize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.handleResize);

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

#### handleVisibilityChange

**シグネチャ**:
```javascript
 handleVisibilityChange()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleVisibilityChange();

// handleVisibilityChangeの実用的な使用例
const result = instance.handleVisibilityChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (document.hidden)
```

**パラメーター**:
- `document.hidden`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(document.hidden);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleBackgroundTransition

**シグネチャ**:
```javascript
 handleBackgroundTransition()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleBackgroundTransition();

// handleBackgroundTransitionの実用的な使用例
const result = instance.handleBackgroundTransition(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パフォーマンス最適化

**シグネチャ**:
```javascript
 if (this.gameEngine.performanceOptimizer)
```

**パラメーター**:
- `this.gameEngine.performanceOptimizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.performanceOptimizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleForegroundTransition

**シグネチャ**:
```javascript
 handleForegroundTransition()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleForegroundTransition();

// handleForegroundTransitionの実用的な使用例
const result = instance.handleForegroundTransition(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パフォーマンス復元

**シグネチャ**:
```javascript
 if (this.gameEngine.performanceOptimizer)
```

**パラメーター**:
- `this.gameEngine.performanceOptimizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.performanceOptimizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### toggleFullscreen

**シグネチャ**:
```javascript
 toggleFullscreen()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toggleFullscreen();

// toggleFullscreenの実用的な使用例
const result = instance.toggleFullscreen(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!document.fullscreenElement)
```

**パラメーター**:
- `!document.fullscreenElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!document.fullscreenElement);

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

#### togglePerformanceInfo

**シグネチャ**:
```javascript
 togglePerformanceInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.togglePerformanceInfo();

// togglePerformanceInfoの実用的な使用例
const result = instance.togglePerformanceInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.performanceOptimizer)
```

**パラメーター**:
- `this.gameEngine.performanceOptimizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.performanceOptimizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getPlatformInfo

**シグネチャ**:
```javascript
 getPlatformInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getPlatformInfo();

// getPlatformInfoの実用的な使用例
const result = instance.getPlatformInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generatePerformanceReport

**シグネチャ**:
```javascript
 generatePerformanceReport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generatePerformanceReport();

// generatePerformanceReportの実用的な使用例
const result = instance.generatePerformanceReport(/* 適切なパラメータ */);
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


---

## getDeviceSpecificHandler

**シグネチャ**:
```javascript
getDeviceSpecificHandler(gameEngine = null)
```

**パラメーター**:
- `gameEngine = null`

**使用例**:
```javascript
const result = getDeviceSpecificHandler(gameEngine = null);
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `userAgent` | 説明なし |
| `platform` | 説明なし |
| `userAgent` | 説明なし |
| `testElement` | 説明なし |
| `hasNotch` | 説明なし |
| `canvas` | 説明なし |
| `container` | 説明なし |
| `touchEndTime` | 説明なし |
| `duration` | 説明なし |
| `touchEndPos` | 説明なし |
| `distance` | 説明なし |
| `clickEvent` | 説明なし |
| `metaTags` | 説明なし |
| `updateViewportHeight` | 説明なし |
| `vh` | 説明なし |
| `now` | 説明なし |
| `canvas` | 説明なし |
| `ctx` | 説明なし |
| `memoryRatio` | 説明なし |
| `canvas` | 説明なし |
| `canvas` | 説明なし |
| `passiveOptions` | 説明なし |
| `now` | 説明なし |
| `canvas` | 説明なし |
| `rect` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `delta` | 説明なし |
| `canvas` | 説明なし |
| `ctx` | 説明なし |
| `dpr` | 説明なし |
| `rect` | 説明なし |
| `checkDPRChange` | 説明なし |
| `newDPR` | 説明なし |
| `observer` | 説明なし |
| `canvas` | 説明なし |
| `ctx` | 説明なし |
| `CLEANUP_INTERVAL` | 説明なし |
| `originalRender` | 説明なし |
| `audioContext` | 説明なし |
| `resumeAudio` | 説明なし |
| `canvas` | 説明なし |
| `optimizeFunction` | 説明なし |
| `canvas` | 説明なし |
| `canvas` | 説明なし |

---

