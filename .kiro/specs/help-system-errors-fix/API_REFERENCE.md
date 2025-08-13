# ヘルプシステムAPI リファレンス

**Issue #162 対応** - ヘルプシステム修正で追加・変更されたAPIの詳細リファレンス

## 目次

1. [CoreAccessibilityManager](#coreaccessibilitymanager)
2. [LocalizationManager](#localizationmanager)
3. [HelpAccessibilityManager](#helpaccessibilitymanager)
4. [HelpLazyLoader](#helplazyloader)
5. [HelpMemoryOptimizer](#helpmemoryoptimizer)
6. [HelpRenderOptimizer](#helprenderoptimizer)
7. [HelpPerformanceIntegrator](#helpperformanceintegrator)
8. [HelpErrorBoundary](#helperrorboundary)

---

## CoreAccessibilityManager

アクセシビリティ機能の中核を提供するクラス。

### 新規追加メソッド

#### `enableHighContrast()`
高コントラストモードを有効化します。

**シグネチャ**:
```javascript
enableHighContrast()
```

**戻り値**: なし

**例**:
```javascript
accessibilityManager.enableHighContrast();
```

#### `disableHighContrast()`
高コントラストモードを無効化します。

**シグネチャ**:
```javascript
disableHighContrast()
```

**戻り値**: なし

#### `enableLargeText()`
大きなテキストモードを有効化します。

**シグネチャ**:
```javascript
enableLargeText()
```

**戻り値**: なし

#### `disableLargeText()`
大きなテキストモードを無効化します。

**シグネチャ**:
```javascript
disableLargeText()
```

**戻り値**: なし

#### `enableAudioCues()`
音声キューを有効化します。

**シグネチャ**:
```javascript
enableAudioCues()
```

**戻り値**: なし

#### `disableAudioCues()`
音声キューを無効化します。

**シグネチャ**:
```javascript
disableAudioCues()
```

**戻り値**: なし

#### `enableKeyboardNavigation()`
キーボードナビゲーションを有効化します。

**シグネチャ**:
```javascript
enableKeyboardNavigation()
```

**戻り値**: なし

#### `enableScreenReaderSupport()`
スクリーンリーダーサポートを有効化します。

**シグネチャ**:
```javascript
enableScreenReaderSupport()
```

**戻り値**: なし

#### `announce(message)`
重要な情報をスクリーンリーダーユーザーにアナウンスします。

**シグネチャ**:
```javascript
announce(message)
```

**パラメータ**:
- `message` (string): アナウンスするメッセージ

**戻り値**: なし

**例**:
```javascript
accessibilityManager.announce('ヘルプページが読み込まれました');
```

---

## LocalizationManager

多言語対応とフォールバック機能を提供する強化されたクラス。

### 強化されたメソッド

#### `t(key, params, options)`
翻訳キーから対応する翻訳テキストを取得します（フォールバック機能付き）。

**シグネチャ**:
```javascript
t(key, params = {}, options = {})
```

**パラメータ**:
- `key` (string): 翻訳キー
- `params` (Object): 翻訳パラメータ
- `options` (Object): オプション
  - `enableFallback` (boolean): フォールバック有効フラグ（デフォルト: true）
  - `logMissing` (boolean): 欠落ログ有効フラグ（デフォルト: true）

**戻り値**: string - 翻訳されたテキスト

**例**:
```javascript
// 基本的な使用
const text = localizationManager.t('help.categories.gameplay');

// パラメータ付き
const message = localizationManager.t('help.loading', { count: 3 });

// フォールバック無効
const exact = localizationManager.t('help.title', {}, { enableFallback: false });
```

### 新規メソッド

#### `addFallbackText(key, text)`
フォールバック用のデフォルトテキストを追加します。

**シグネチャ**:
```javascript
addFallbackText(key, text)
```

**パラメータ**:
- `key` (string): 翻訳キー
- `text` (string): フォールバックテキスト

**戻り値**: なし

**例**:
```javascript
localizationManager.addFallbackText('help.categories.new', '新機能');
```

#### `getMissingKeys()`
欠落している翻訳キーのリストを取得します。

**シグネチャ**:
```javascript
getMissingKeys()
```

**戻り値**: Array<string> - 欠落キーのリスト

---

## HelpAccessibilityManager

ヘルプシステム専用のアクセシビリティ管理クラス。

### 新規メソッド

#### `safeCall(methodName, ...args)`
アクセシビリティメソッドを安全に呼び出します。

**シグネチャ**:
```javascript
safeCall(methodName, ...args)
```

**パラメータ**:
- `methodName` (string): 呼び出すメソッド名
- `...args`: メソッドの引数

**戻り値**: any - メソッドの戻り値（エラー時はnull）

**例**:
```javascript
// 安全な高コントラストモード有効化
helpAccessibilityManager.safeCall('enableHighContrast');

// 安全なアナウンス
helpAccessibilityManager.safeCall('announce', 'ページが更新されました');
```

#### `isMethodAvailable(methodName)`
指定されたメソッドが利用可能かチェックします。

**シグネチャ**:
```javascript
isMethodAvailable(methodName)
```

**パラメータ**:
- `methodName` (string): チェックするメソッド名

**戻り値**: boolean - メソッドが利用可能かどうか

---

## HelpLazyLoader

ヘルプコンテンツの遅延読み込みとキャッシュ管理を提供するクラス。

### 主要メソッド

#### `loadContent(contentId, priority, loader)`
コンテンツを遅延読み込みします。

**シグネチャ**:
```javascript
async loadContent(contentId, priority = 'medium', loader)
```

**パラメータ**:
- `contentId` (string): コンテンツID
- `priority` (string): 優先度（'immediate', 'high', 'medium', 'low'）
- `loader` (Function): 読み込み関数

**戻り値**: Promise<any> - 読み込まれたコンテンツ

**例**:
```javascript
const content = await lazyLoader.loadContent(
    'help-gameplay',
    'high',
    () => fetch('/api/help/gameplay').then(r => r.json())
);
```

#### `loadBatch(contentRequests)`
複数のコンテンツをバッチ読み込みします。

**シグネチャ**:
```javascript
async loadBatch(contentRequests)
```

**パラメータ**:
- `contentRequests` (Array): 読み込み要求の配列
  - `contentId` (string): コンテンツID
  - `priority` (string): 優先度
  - `loader` (Function): 読み込み関数

**戻り値**: Promise<Map> - 読み込み結果のMap

#### `isLoaded(contentId)`
コンテンツが読み込み済みかチェックします。

**シグネチャ**:
```javascript
isLoaded(contentId)
```

**パラメータ**:
- `contentId` (string): コンテンツID

**戻り値**: boolean - 読み込み済みフラグ

#### `unloadContent(contentId)`
指定されたコンテンツをアンロードします。

**シグネチャ**:
```javascript
unloadContent(contentId)
```

**パラメータ**:
- `contentId` (string): コンテンツID

**戻り値**: boolean - アンロード成功フラグ

#### `getStats()`
読み込み統計を取得します。

**シグネチャ**:
```javascript
getStats()
```

**戻り値**: Object - 統計情報
```javascript
{
    totalLoads: number,
    cacheHits: number,
    cacheMisses: number,
    cacheHitRate: number,
    averageLoadTime: number,
    memoryUsage: number
}
```

---

## HelpMemoryOptimizer

メモリ使用量の最適化とリーク防止を提供するクラス。

### 主要メソッド

#### `trackObject(objectId, object, metadata)`
オブジェクトの追跡を開始します。

**シグネチャ**:
```javascript
trackObject(objectId, object, metadata = {})
```

**パラメータ**:
- `objectId` (string): オブジェクトID
- `object` (any): 追跡するオブジェクト
- `metadata` (Object): メタデータ
  - `type` (string): オブジェクトタイプ
  - `canForceCleanup` (boolean): 強制クリーンアップ可能フラグ

**戻り値**: なし

**例**:
```javascript
memoryOptimizer.trackObject('help-content-1', contentObject, {
    type: 'content',
    canForceCleanup: true
});
```

#### `untrackObject(objectId)`
オブジェクトの追跡を停止します。

**シグネチャ**:
```javascript
untrackObject(objectId)
```

**パラメータ**:
- `objectId` (string): オブジェクトID

**戻り値**: boolean - 成功フラグ

#### `trackEventListener(target, event, listener)`
イベントリスナーを追跡します。

**シグネチャ**:
```javascript
trackEventListener(target, event, listener)
```

**パラメータ**:
- `target` (EventTarget): イベントターゲット
- `event` (string): イベント名
- `listener` (Function): リスナー関数

**戻り値**: なし

#### `cleanupOldObjects()`
古いオブジェクトをクリーンアップします。

**シグネチャ**:
```javascript
cleanupOldObjects()
```

**戻り値**: number - クリーンアップしたオブジェクト数

#### `detectMemoryLeaks()`
メモリリークを検出します。

**シグネチャ**:
```javascript
detectMemoryLeaks()
```

**戻り値**: Array<Object> - リーク候補のリスト

#### `suggestGC()`
ガベージコレクションを提案します。

**シグネチャ**:
```javascript
suggestGC()
```

**戻り値**: なし

#### `getMemoryInfo()`
メモリ情報を取得します。

**シグネチャ**:
```javascript
getMemoryInfo()
```

**戻り値**: Object - メモリ情報
```javascript
{
    usedJSHeapSize: number,
    totalJSHeapSize: number,
    jsHeapSizeLimit: number,
    usagePercentage: number
}
```

---

## HelpRenderOptimizer

描画パフォーマンスの最適化を提供するクラス。

### 主要メソッド

#### `optimizedRender(renderFunction, options)`
最適化された描画を実行します。

**シグネチャ**:
```javascript
optimizedRender(renderFunction, options = {})
```

**パラメータ**:
- `renderFunction` (Function): 描画関数
- `options` (Object): 描画オプション

**戻り値**: なし

**例**:
```javascript
renderOptimizer.optimizedRender((ctx, region) => {
    // 描画処理
    ctx.fillText('Hello', 10, 10);
});
```

#### `addDirtyRegion(x, y, width, height)`
ダーティ領域を追加します。

**シグネチャ**:
```javascript
addDirtyRegion(x, y, width, height)
```

**パラメータ**:
- `x` (number): X座標
- `y` (number): Y座標
- `width` (number): 幅
- `height` (number): 高さ

**戻り値**: なし

#### `drawCachedText(ctx, text, x, y, style)`
キャッシュ付きテキスト描画を実行します。

**シグネチャ**:
```javascript
drawCachedText(ctx, text, x, y, style = {})
```

**パラメータ**:
- `ctx` (CanvasRenderingContext2D): コンテキスト
- `text` (string): テキスト
- `x` (number): X座標
- `y` (number): Y座標
- `style` (Object): スタイル設定

**戻り値**: なし

#### `clearAllCaches()`
すべてのキャッシュをクリアします。

**シグネチャ**:
```javascript
clearAllCaches()
```

**戻り値**: なし

#### `getStats()`
描画統計を取得します。

**シグネチャ**:
```javascript
getStats()
```

**戻り値**: Object - 統計情報
```javascript
{
    totalFrames: number,
    skippedFrames: number,
    cacheHits: number,
    cacheMisses: number,
    averageFPS: number,
    averageFrameTime: number,
    peakFrameTime: number
}
```

---

## HelpPerformanceIntegrator

パフォーマンス最適化の統合管理を提供するクラス。

### 主要メソッド

#### `updatePerformanceMetrics()`
パフォーマンスメトリクスを更新します。

**シグネチャ**:
```javascript
updatePerformanceMetrics()
```

**戻り値**: なし

#### `detectPerformanceIssues()`
パフォーマンス問題を検出します。

**シグネチャ**:
```javascript
detectPerformanceIssues()
```

**戻り値**: Array<Object> - 問題のリスト
```javascript
[
    {
        type: string,          // 'low_fps', 'high_memory', etc.
        severity: string,      // 'info', 'warning', 'critical'
        value: number,         // 現在値
        threshold: number      // 閾値
    }
]
```

#### `handlePerformanceIssues(issues)`
パフォーマンス問題を処理します。

**シグネチャ**:
```javascript
handlePerformanceIssues(issues)
```

**パラメータ**:
- `issues` (Array): 問題のリスト

**戻り値**: なし

#### `generateOptimizationReport()`
最適化レポートを生成します。

**シグネチャ**:
```javascript
generateOptimizationReport()
```

**戻り値**: Object - 最適化レポート
```javascript
{
    timestamp: number,
    monitoring: Object,
    stats: Object,
    components: Object,
    recommendations: Array
}
```

#### `updateConfig(newConfig)`
設定を更新します。

**シグネチャ**:
```javascript
updateConfig(newConfig)
```

**パラメータ**:
- `newConfig` (Object): 新しい設定

**戻り値**: なし

---

## HelpErrorBoundary

エラー境界とエラー回復機能を提供するクラス。

### 主要メソッド

#### `wrapComponent(component, componentName)`
コンポーネントをエラー境界でラップします。

**シグネチャ**:
```javascript
wrapComponent(component, componentName)
```

**パラメータ**:
- `component` (Object): ラップするコンポーネント
- `componentName` (string): コンポーネント名

**戻り値**: Object - ラップされたコンポーネント

#### `handleError(error, context)`
エラーを処理します。

**シグネチャ**:
```javascript
handleError(error, context = 'unknown')
```

**パラメータ**:
- `error` (Error): エラーオブジェクト
- `context` (string): エラーコンテキスト

**戻り値**: boolean - 回復可能フラグ

#### `enterSafeMode()`
安全モードに入ります。

**シグネチャ**:
```javascript
enterSafeMode()
```

**戻り値**: なし

#### `exitSafeMode()`
安全モードを終了します。

**シグネチャ**:
```javascript
exitSafeMode()
```

**戻り値**: boolean - 終了成功フラグ

#### `getStats()`
エラー統計を取得します。

**シグネチャ**:
```javascript
getStats()
```

**戻り値**: Object - 統計情報
```javascript
{
    totalErrors: number,
    recoveredErrors: number,
    safeModeActivations: number,
    lastError: Object,
    errorRate: number
}
```

#### `getErrorHistory()`
エラー履歴を取得します。

**シグネチャ**:
```javascript
getErrorHistory()
```

**戻り値**: Array<Object> - エラー履歴

---

## 使用例

### 基本的な統合例

```javascript
// ヘルプシステムの初期化
const helpScene = new HelpScene(gameEngine);

// パフォーマンス監視の開始
const performanceIntegrator = helpScene.helpPerformanceIntegrator;
performanceIntegrator.updateConfig({
    autoOptimization: true,
    performanceThresholds: {
        lowFPS: 30,
        lowMemory: 0.8
    }
});

// コンテンツの遅延読み込み
const lazyLoader = helpScene.helpLazyLoader;
const content = await lazyLoader.loadContent(
    'help-tutorial',
    'high',
    () => fetch('/api/help/tutorial').then(r => r.json())
);

// アクセシビリティ機能の有効化
const accessibilityManager = helpScene.helpAccessibilityManager;
accessibilityManager.safeCall('enableHighContrast');
accessibilityManager.safeCall('announce', 'ヘルプページが読み込まれました');

// エラー監視の設定
const errorBoundary = helpScene.helpErrorBoundary;
const stats = errorBoundary.getStats();
console.log('Error Stats:', stats);
```

### 高度な最適化例

```javascript
// カスタムパフォーマンス設定
const optimizationConfig = {
    performanceThresholds: {
        lowMemory: 0.7,
        criticalMemory: 0.85,
        lowFPS: 45,
        criticalFPS: 20
    },
    optimizationStrategies: {
        aggressive: true,
        adaptive: true
    }
};

performanceIntegrator.updateConfig(optimizationConfig);

// メモリ最適化の詳細制御
const memoryOptimizer = helpScene.helpMemoryOptimizer;
memoryOptimizer.updateConfig({
    maxObjectAge: 120000,  // 2分
    gcInterval: 15000,     // 15秒
    maxEventListeners: 75
});

// 描画最適化の詳細制御
const renderOptimizer = helpScene.helpRenderOptimizer;
renderOptimizer.updateConfig({
    targetFPS: 60,
    dirtyRectEnabled: true,
    textCaching: true,
    maxCachedTexts: 150
});
```