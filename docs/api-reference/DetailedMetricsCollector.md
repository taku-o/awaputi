# DetailedMetricsCollector

## 概要

ファイル: `debug/DetailedMetricsCollector.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [DetailedMetricsCollector](#detailedmetricscollector)
- [RenderingMetrics](#renderingmetrics)
- [MemoryMetrics](#memorymetrics)
- [GameMetrics](#gamemetrics)
- [AudioMetrics](#audiometrics)
- [NetworkMetrics](#networkmetrics)
- [SystemMetrics](#systemmetrics)
## 定数
- [startTime](#starttime)
- [renderMetrics](#rendermetrics)
- [canvas](#canvas)
- [gl](#gl)
- [ctx2d](#ctx2d)
- [memoryMetrics](#memorymetrics)
- [currentUsed](#currentused)
- [history](#history)
- [allocations](#allocations)
- [diff](#diff)
- [history](#history)
- [gcEvents](#gcevents)
- [currentUsed](#currentused)
- [previousUsed](#previousused)
- [timeDiff](#timediff)
- [gameMetrics](#gamemetrics)
- [bubbleManager](#bubblemanager)
- [particleManager](#particlemanager)
- [effectManager](#effectmanager)
- [audioMetrics](#audiometrics)
- [audioManager](#audiomanager)
- [networkMetrics](#networkmetrics)
- [systemMetrics](#systemmetrics)
- [canvas](#canvas)
- [gl](#gl)
- [audioManager](#audiomanager)
- [observer](#observer)
- [entries](#entries)
- [bubbleCount](#bubblecount)
- [particleCount](#particlecount)
- [effectCount](#effectcount)
- [bubbleCount](#bubblecount)
- [particleCount](#particlecount)
- [recent](#recent)
- [older](#older)
- [recentAvg](#recentavg)
- [olderAvg](#olderavg)
- [change](#change)
- [canvas](#canvas)
- [canvas](#canvas)
- [collectionTime](#collectiontime)

---

## DetailedMetricsCollector

### コンストラクタ

```javascript
new DetailedMetricsCollector(monitor)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `monitor` | 説明なし |
| `gameEngine` | 説明なし |
| `extendedMetrics` | 拡張メトリクス |
| `profilingData` | プロファイリングデータ |
| `statisticsTracking` | 統計追跡 |

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

#### collectDetailedMetrics

**シグネチャ**:
```javascript
 collectDetailedMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectDetailedMetrics();

// collectDetailedMetricsの実用的な使用例
const result = instance.collectDetailedMetrics(/* 適切なパラメータ */);
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

#### collectRenderingDetails

**シグネチャ**:
```javascript
 collectRenderingDetails()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectRenderingDetails();

// collectRenderingDetailsの実用的な使用例
const result = instance.collectRenderingDetails(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (gl)
```

**パラメーター**:
- `gl`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gl);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (ctx2d)
```

**パラメーター**:
- `ctx2d`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ctx2d);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectWebGLMetrics

**シグネチャ**:
```javascript
 collectWebGLMetrics(gl, renderMetrics)
```

**パラメーター**:
- `gl`
- `renderMetrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectWebGLMetrics(gl, renderMetrics);

// collectWebGLMetricsの実用的な使用例
const result = instance.collectWebGLMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectCanvas2DMetrics

**シグネチャ**:
```javascript
 collectCanvas2DMetrics(ctx, renderMetrics)
```

**パラメーター**:
- `ctx`
- `renderMetrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectCanvas2DMetrics(ctx, renderMetrics);

// collectCanvas2DMetricsの実用的な使用例
const result = instance.collectCanvas2DMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectMemoryDetails

**シグネチャ**:
```javascript
 collectMemoryDetails()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectMemoryDetails();

// collectMemoryDetailsの実用的な使用例
const result = instance.collectMemoryDetails(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

JavaScript ヒープメモリ

**シグネチャ**:
```javascript
 if (performance.memory)
```

**パラメーター**:
- `performance.memory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(performance.memory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeMemoryAllocationPatterns

**シグネチャ**:
```javascript
 analyzeMemoryAllocationPatterns(memoryMetrics)
```

**パラメーター**:
- `memoryMetrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeMemoryAllocationPatterns(memoryMetrics);

// analyzeMemoryAllocationPatternsの実用的な使用例
const result = instance.analyzeMemoryAllocationPatterns(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (history.length >= 3)
```

**パラメーター**:
- `history.length >= 3`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(history.length >= 3);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 1; i < history.length; i++)
```

**パラメーター**:
- `let i = 1; i < history.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 1; i < history.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (diff > 0)
```

**パラメーター**:
- `diff > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(diff > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeGCPatterns

**シグネチャ**:
```javascript
 analyzeGCPatterns(memoryMetrics)
```

**パラメーター**:
- `memoryMetrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeGCPatterns(memoryMetrics);

// analyzeGCPatternsの実用的な使用例
const result = instance.analyzeGCPatterns(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 1; i < history.length; i++)
```

**パラメーター**:
- `let i = 1; i < history.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 1; i < history.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

大きなメモリ減少をGCイベントと判定

**シグネチャ**:
```javascript
 if (previousUsed - currentUsed > 5 * 1024 * 1024)
```

**パラメーター**:
- `previousUsed - currentUsed > 5 * 1024 * 1024`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(previousUsed - currentUsed > 5 * 1024 * 1024);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectGameDetails

**シグネチャ**:
```javascript
 collectGameDetails()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectGameDetails();

// collectGameDetailsの実用的な使用例
const result = instance.collectGameDetails(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectEntityMetrics

**シグネチャ**:
```javascript
 collectEntityMetrics(gameMetrics)
```

**パラメーター**:
- `gameMetrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectEntityMetrics(gameMetrics);

// collectEntityMetricsの実用的な使用例
const result = instance.collectEntityMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectPhysicsMetrics

**シグネチャ**:
```javascript
 collectPhysicsMetrics(gameMetrics)
```

**パラメーター**:
- `gameMetrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectPhysicsMetrics(gameMetrics);

// collectPhysicsMetricsの実用的な使用例
const result = instance.collectPhysicsMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectAudioDetails

**シグネチャ**:
```javascript
 collectAudioDetails()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectAudioDetails();

// collectAudioDetailsの実用的な使用例
const result = instance.collectAudioDetails(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectNetworkDetails

**シグネチャ**:
```javascript
 collectNetworkDetails()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectNetworkDetails();

// collectNetworkDetailsの実用的な使用例
const result = instance.collectNetworkDetails(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

接続情報

**シグネチャ**:
```javascript
 if (navigator.connection)
```

**パラメーター**:
- `navigator.connection`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(navigator.connection);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectSystemDetails

**シグネチャ**:
```javascript
 collectSystemDetails()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectSystemDetails();

// collectSystemDetailsの実用的な使用例
const result = instance.collectSystemDetails(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupWebGLProfiler

WebGL プロファイラー設定

**シグネチャ**:
```javascript
 setupWebGLProfiler()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupWebGLProfiler();

// setupWebGLProfilerの実用的な使用例
const result = instance.setupWebGLProfiler(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

WebGL呼び出しのプロキシを設定（開発モードのみ）

**シグネチャ**:
```javascript
 if (process.env.NODE_ENV === 'development')
```

**パラメーター**:
- `process.env.NODE_ENV === 'development'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(process.env.NODE_ENV === 'development');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupMemoryTracker

メモリ追跡設定

**シグネチャ**:
```javascript
 setupMemoryTracker()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupMemoryTracker();

// setupMemoryTrackerの実用的な使用例
const result = instance.setupMemoryTracker(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メモリ割り当て追跡（開発モードのみ）

**シグネチャ**:
```javascript
 if (process.env.NODE_ENV === 'development')
```

**パラメーター**:
- `process.env.NODE_ENV === 'development'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(process.env.NODE_ENV === 'development');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupGameLoopProfiler

ゲームループプロファイラー設定

**シグネチャ**:
```javascript
 setupGameLoopProfiler()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupGameLoopProfiler();

// setupGameLoopProfilerの実用的な使用例
const result = instance.setupGameLoopProfiler(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupAudioProfiler

オーディオプロファイラー設定

**シグネチャ**:
```javascript
 setupAudioProfiler()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupAudioProfiler();

// setupAudioProfilerの実用的な使用例
const result = instance.setupAudioProfiler(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupNetworkMonitor

ネットワーク監視設定

**シグネチャ**:
```javascript
 setupNetworkMonitor()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupNetworkMonitor();

// setupNetworkMonitorの実用的な使用例
const result = instance.setupNetworkMonitor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Resource Timing API の監視

**シグネチャ**:
```javascript
 if (typeof PerformanceObserver !== 'undefined')
```

**パラメーター**:
- `typeof PerformanceObserver !== 'undefined'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof PerformanceObserver !== 'undefined');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(entry => {
                        if (entry.entryType === 'resource')
```

**パラメーター**:
- `entry => {
                        if (entry.entryType === 'resource'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(entry => {
                        if (entry.entryType === 'resource');

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
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

#### estimateDrawCalls

ヘルパーメソッド（推定・計算系）

**シグネチャ**:
```javascript
 estimateDrawCalls()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateDrawCalls();

// estimateDrawCallsの実用的な使用例
const result = instance.estimateDrawCalls(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### estimateTriangleCount

**シグネチャ**:
```javascript
 estimateTriangleCount()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateTriangleCount();

// estimateTriangleCountの実用的な使用例
const result = instance.estimateTriangleCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### estimateVertexCount

**シグネチャ**:
```javascript
 estimateVertexCount()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateVertexCount();

// estimateVertexCountの実用的な使用例
const result = instance.estimateVertexCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateMemoryTrend

**シグネチャ**:
```javascript
 calculateMemoryTrend(history)
```

**パラメーター**:
- `history`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateMemoryTrend(history);

// calculateMemoryTrendの実用的な使用例
const result = instance.calculateMemoryTrend(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectWebGLSupport

プラットフォーム検出メソッド

**シグネチャ**:
```javascript
 detectWebGLSupport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectWebGLSupport();

// detectWebGLSupportの実用的な使用例
const result = instance.detectWebGLSupport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (e)
```

**パラメーター**:
- `e`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(e);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectWebGL2Support

**シグネチャ**:
```javascript
 detectWebGL2Support()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectWebGL2Support();

// detectWebGL2Supportの実用的な使用例
const result = instance.detectWebGL2Support(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (e)
```

**パラメーター**:
- `e`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(e);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectWebAssemblySupport

**シグネチャ**:
```javascript
 detectWebAssemblySupport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectWebAssemblySupport();

// detectWebAssemblySupportの実用的な使用例
const result = instance.detectWebAssemblySupport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateStatistics

統計更新

**シグネチャ**:
```javascript
 updateStatistics(startTime)
```

**パラメーター**:
- `startTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateStatistics(startTime);

// updateStatisticsの実用的な使用例
const result = instance.updateStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getExtendedMetrics

パブリックAPI

**シグネチャ**:
```javascript
 getExtendedMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getExtendedMetrics();

// getExtendedMetricsの実用的な使用例
const result = instance.getExtendedMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getProfilingData

**シグネチャ**:
```javascript
 getProfilingData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getProfilingData();

// getProfilingDataの実用的な使用例
const result = instance.getProfilingData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCollectionStatistics

**シグネチャ**:
```javascript
 getCollectionStatistics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCollectionStatistics();

// getCollectionStatisticsの実用的な使用例
const result = instance.getCollectionStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### destroy

クリーンアップ

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

#### getBubbleCountByType

プレースホルダーメソッド（実装は各ゲーム固有システムに依存）

**シグネチャ**:
```javascript
 getBubbleCountByType()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubbleCountByType();

// getBubbleCountByTypeの実用的な使用例
const result = instance.getBubbleCountByType(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBubblesSpawnedThisFrame

**シグネチャ**:
```javascript
 getBubblesSpawnedThisFrame()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubblesSpawnedThisFrame();

// getBubblesSpawnedThisFrameの実用的な使用例
const result = instance.getBubblesSpawnedThisFrame(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBubblesDestroyedThisFrame

**シグネチャ**:
```javascript
 getBubblesDestroyedThisFrame()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubblesDestroyedThisFrame();

// getBubblesDestroyedThisFrameの実用的な使用例
const result = instance.getBubblesDestroyedThisFrame(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAverageBubbleLifetime

**シグネチャ**:
```javascript
 getAverageBubbleLifetime()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAverageBubbleLifetime();

// getAverageBubbleLifetimeの実用的な使用例
const result = instance.getAverageBubbleLifetime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getParticleCountBySystem

**シグネチャ**:
```javascript
 getParticleCountBySystem()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getParticleCountBySystem();

// getParticleCountBySystemの実用的な使用例
const result = instance.getParticleCountBySystem(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getParticlesSpawnedThisFrame

**シグネチャ**:
```javascript
 getParticlesSpawnedThisFrame()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getParticlesSpawnedThisFrame();

// getParticlesSpawnedThisFrameの実用的な使用例
const result = instance.getParticlesSpawnedThisFrame(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getParticlesDestroyedThisFrame

**シグネチャ**:
```javascript
 getParticlesDestroyedThisFrame()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getParticlesDestroyedThisFrame();

// getParticlesDestroyedThisFrameの実用的な使用例
const result = instance.getParticlesDestroyedThisFrame(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getParticlePoolUtilization

**シグネチャ**:
```javascript
 getParticlePoolUtilization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getParticlePoolUtilization();

// getParticlePoolUtilizationの実用的な使用例
const result = instance.getParticlePoolUtilization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEffectCountByType

**シグネチャ**:
```javascript
 getEffectCountByType()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEffectCountByType();

// getEffectCountByTypeの実用的な使用例
const result = instance.getEffectCountByType(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getActiveEffects

**シグネチャ**:
```javascript
 getActiveEffects()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getActiveEffects();

// getActiveEffectsの実用的な使用例
const result = instance.getActiveEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getQueuedEffects

**シグネチャ**:
```javascript
 getQueuedEffects()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getQueuedEffects();

// getQueuedEffectsの実用的な使用例
const result = instance.getQueuedEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCollisionChecksPerFrame

**シグネチャ**:
```javascript
 getCollisionChecksPerFrame()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCollisionChecksPerFrame();

// getCollisionChecksPerFrameの実用的な使用例
const result = instance.getCollisionChecksPerFrame(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCollisionHitsPerFrame

**シグネチャ**:
```javascript
 getCollisionHitsPerFrame()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCollisionHitsPerFrame();

// getCollisionHitsPerFrameの実用的な使用例
const result = instance.getCollisionHitsPerFrame(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBouncesPerFrame

**シグネチャ**:
```javascript
 getBouncesPerFrame()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBouncesPerFrame();

// getBouncesPerFrameの実用的な使用例
const result = instance.getBouncesPerFrame(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getPhysicsStepsPerFrame

**シグネチャ**:
```javascript
 getPhysicsStepsPerFrame()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getPhysicsStepsPerFrame();

// getPhysicsStepsPerFrameの実用的な使用例
const result = instance.getPhysicsStepsPerFrame(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAveragePhysicsStepTime

**シグネチャ**:
```javascript
 getAveragePhysicsStepTime()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAveragePhysicsStepTime();

// getAveragePhysicsStepTimeの実用的な使用例
const result = instance.getAveragePhysicsStepTime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getSpatialOptimizationStats

**シグネチャ**:
```javascript
 getSpatialOptimizationStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getSpatialOptimizationStats();

// getSpatialOptimizationStatsの実用的な使用例
const result = instance.getSpatialOptimizationStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectAudioContextMetrics

**シグネチャ**:
```javascript
 collectAudioContextMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectAudioContextMetrics();

// collectAudioContextMetricsの実用的な使用例
const result = instance.collectAudioContextMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectSoundPlaybackMetrics

**シグネチャ**:
```javascript
 collectSoundPlaybackMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectSoundPlaybackMetrics();

// collectSoundPlaybackMetricsの実用的な使用例
const result = instance.collectSoundPlaybackMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectAudioProcessingMetrics

**シグネチャ**:
```javascript
 collectAudioProcessingMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectAudioProcessingMetrics();

// collectAudioProcessingMetricsの実用的な使用例
const result = instance.collectAudioProcessingMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectResourceLoadingMetrics

**シグネチャ**:
```javascript
 collectResourceLoadingMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectResourceLoadingMetrics();

// collectResourceLoadingMetricsの実用的な使用例
const result = instance.collectResourceLoadingMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectCacheMetrics

**シグネチャ**:
```javascript
 collectCacheMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectCacheMetrics();

// collectCacheMetricsの実用的な使用例
const result = instance.collectCacheMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectObjectPoolMetrics

**シグネチャ**:
```javascript
 collectObjectPoolMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectObjectPoolMetrics();

// collectObjectPoolMetricsの実用的な使用例
const result = instance.collectObjectPoolMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### estimateGPUMemoryUsage

**シグネチャ**:
```javascript
 estimateGPUMemoryUsage()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateGPUMemoryUsage();

// estimateGPUMemoryUsageの実用的な使用例
const result = instance.estimateGPUMemoryUsage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectMemoryLeaks

**シグネチャ**:
```javascript
 detectMemoryLeaks()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectMemoryLeaks();

// detectMemoryLeaksの実用的な使用例
const result = instance.detectMemoryLeaks(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeRenderPipeline

**シグネチャ**:
```javascript
 analyzeRenderPipeline()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeRenderPipeline();

// analyzeRenderPipelineの実用的な使用例
const result = instance.analyzeRenderPipeline(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectFramebufferMetrics

**シグネチャ**:
```javascript
 collectFramebufferMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectFramebufferMetrics();

// collectFramebufferMetricsの実用的な使用例
const result = instance.collectFramebufferMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### countTextureBindings

**シグネチャ**:
```javascript
 countTextureBindings()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.countTextureBindings();

// countTextureBindingsの実用的な使用例
const result = instance.countTextureBindings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### estimateTextureMemory

**シグネチャ**:
```javascript
 estimateTextureMemory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateTextureMemory();

// estimateTextureMemoryの実用的な使用例
const result = instance.estimateTextureMemory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### countTextureUploads

**シグネチャ**:
```javascript
 countTextureUploads()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.countTextureUploads();

// countTextureUploadsの実用的な使用例
const result = instance.countTextureUploads(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### countShaderSwitches

**シグネチャ**:
```javascript
 countShaderSwitches()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.countShaderSwitches();

// countShaderSwitchesの実用的な使用例
const result = instance.countShaderSwitches(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### countUniformUpdates

**シグネチャ**:
```javascript
 countUniformUpdates()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.countUniformUpdates();

// countUniformUpdatesの実用的な使用例
const result = instance.countUniformUpdates(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### countStateChanges

**シグネチャ**:
```javascript
 countStateChanges()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.countStateChanges();

// countStateChangesの実用的な使用例
const result = instance.countStateChanges(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### countBlendModeChanges

**シグネチャ**:
```javascript
 countBlendModeChanges()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.countBlendModeChanges();

// countBlendModeChangesの実用的な使用例
const result = instance.countBlendModeChanges(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### countBufferUploads

**シグネチャ**:
```javascript
 countBufferUploads()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.countBufferUploads();

// countBufferUploadsの実用的な使用例
const result = instance.countBufferUploads(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### estimateBufferMemory

**シグネチャ**:
```javascript
 estimateBufferMemory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateBufferMemory();

// estimateBufferMemoryの実用的な使用例
const result = instance.estimateBufferMemory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### estimateGPUUtilization

**シグネチャ**:
```javascript
 estimateGPUUtilization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateGPUUtilization();

// estimateGPUUtilizationの実用的な使用例
const result = instance.estimateGPUUtilization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### estimateFillRateUtilization

**シグネチャ**:
```javascript
 estimateFillRateUtilization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateFillRateUtilization();

// estimateFillRateUtilizationの実用的な使用例
const result = instance.estimateFillRateUtilization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### count2DOperations

**シグネチャ**:
```javascript
 count2DOperations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.count2DOperations();

// count2DOperationsの実用的な使用例
const result = instance.count2DOperations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### countImageDraws

**シグネチャ**:
```javascript
 countImageDraws()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.countImageDraws();

// countImageDrawsの実用的な使用例
const result = instance.countImageDraws(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### countPathOperations

**シグネチャ**:
```javascript
 countPathOperations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.countPathOperations();

// countPathOperationsの実用的な使用例
const result = instance.countPathOperations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### countTextOperations

**シグネチャ**:
```javascript
 countTextOperations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.countTextOperations();

// countTextOperationsの実用的な使用例
const result = instance.countTextOperations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### countTransformations

**シグネチャ**:
```javascript
 countTransformations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.countTransformations();

// countTransformationsの実用的な使用例
const result = instance.countTransformations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### countCompositeOperations

**シグネチャ**:
```javascript
 countCompositeOperations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.countCompositeOperations();

// countCompositeOperationsの実用的な使用例
const result = instance.countCompositeOperations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeGameLoop

**シグネチャ**:
```javascript
 analyzeGameLoop()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeGameLoop();

// analyzeGameLoopの実用的な使用例
const result = instance.analyzeGameLoop(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectScoringMetrics

**シグネチャ**:
```javascript
 collectScoringMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectScoringMetrics();

// collectScoringMetricsの実用的な使用例
const result = instance.collectScoringMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectEventSystemMetrics

**シグネチャ**:
```javascript
 collectEventSystemMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectEventSystemMetrics();

// collectEventSystemMetricsの実用的な使用例
const result = instance.collectEventSystemMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### proxyWebGLCalls

**シグネチャ**:
```javascript
 proxyWebGLCalls()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.proxyWebGLCalls();

// proxyWebGLCallsの実用的な使用例
const result = instance.proxyWebGLCalls(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupMemoryAllocationTracking

**シグネチャ**:
```javascript
 setupMemoryAllocationTracking()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupMemoryAllocationTracking();

// setupMemoryAllocationTrackingの実用的な使用例
const result = instance.setupMemoryAllocationTracking(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### profileGameLoopStages

**シグネチャ**:
```javascript
 profileGameLoopStages()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.profileGameLoopStages();

// profileGameLoopStagesの実用的な使用例
const result = instance.profileGameLoopStages(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### profileAudioProcessing

**シグネチャ**:
```javascript
 profileAudioProcessing()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.profileAudioProcessing();

// profileAudioProcessingの実用的な使用例
const result = instance.profileAudioProcessing(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processResourceTiming

**シグネチャ**:
```javascript
 processResourceTiming()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processResourceTiming();

// processResourceTimingの実用的な使用例
const result = instance.processResourceTiming(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## RenderingMetrics

### コンストラクタ

```javascript
new RenderingMetrics()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `drawCalls` | 説明なし |
| `triangles` | 説明なし |
| `vertices` | 説明なし |
| `textureBindings` | 説明なし |
| `textureMemory` | 説明なし |
| `textureUploads` | 説明なし |
| `shaderSwitches` | 説明なし |
| `uniformUpdates` | 説明なし |
| `stateChanges` | 説明なし |
| `blendModeChanges` | 説明なし |
| `bufferUploads` | 説明なし |
| `bufferMemory` | 説明なし |
| `gpuUtilization` | 説明なし |
| `fillRateUtilization` | 説明なし |
| `canvas2D` | 説明なし |
| `timestamp` | 説明なし |

### メソッド

#### toJSON

**シグネチャ**:
```javascript
 toJSON()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toJSON();

// toJSONの実用的な使用例
const result = instance.toJSON(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## MemoryMetrics

### コンストラクタ

```javascript
new MemoryMetrics()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `heap` | 説明なし |
| `allocationPattern` | 説明なし |
| `garbageCollection` | 説明なし |
| `objectPools` | 説明なし |
| `gpuMemory` | 説明なし |
| `leaks` | 説明なし |
| `timestamp` | 説明なし |

### メソッド

#### toJSON

**シグネチャ**:
```javascript
 toJSON()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toJSON();

// toJSONの実用的な使用例
const result = instance.toJSON(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## GameMetrics

### コンストラクタ

```javascript
new GameMetrics()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `entities` | 説明なし |
| `physics` | 説明なし |
| `events` | 説明なし |
| `gameLoop` | 説明なし |
| `scoring` | 説明なし |
| `timestamp` | 説明なし |

### メソッド

#### toJSON

**シグネチャ**:
```javascript
 toJSON()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toJSON();

// toJSONの実用的な使用例
const result = instance.toJSON(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## AudioMetrics

### コンストラクタ

```javascript
new AudioMetrics()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `context` | 説明なし |
| `playback` | 説明なし |
| `processing` | 説明なし |
| `timestamp` | 説明なし |

### メソッド

#### toJSON

**シグネチャ**:
```javascript
 toJSON()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toJSON();

// toJSONの実用的な使用例
const result = instance.toJSON(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## NetworkMetrics

### コンストラクタ

```javascript
new NetworkMetrics()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `connection` | 説明なし |
| `resources` | 説明なし |
| `cache` | 説明なし |
| `timestamp` | 説明なし |

### メソッド

#### toJSON

**シグネチャ**:
```javascript
 toJSON()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toJSON();

// toJSONの実用的な使用例
const result = instance.toJSON(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## SystemMetrics

### コンストラクタ

```javascript
new SystemMetrics()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `device` | 説明なし |
| `capabilities` | 説明なし |
| `performanceAPI` | 説明なし |
| `timestamp` | 説明なし |

### メソッド

#### toJSON

**シグネチャ**:
```javascript
 toJSON()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toJSON();

// toJSONの実用的な使用例
const result = instance.toJSON(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `startTime` | 説明なし |
| `renderMetrics` | 説明なし |
| `canvas` | 説明なし |
| `gl` | 説明なし |
| `ctx2d` | 説明なし |
| `memoryMetrics` | 説明なし |
| `currentUsed` | 説明なし |
| `history` | 説明なし |
| `allocations` | 説明なし |
| `diff` | 説明なし |
| `history` | 説明なし |
| `gcEvents` | 説明なし |
| `currentUsed` | 説明なし |
| `previousUsed` | 説明なし |
| `timeDiff` | 説明なし |
| `gameMetrics` | 説明なし |
| `bubbleManager` | 説明なし |
| `particleManager` | 説明なし |
| `effectManager` | 説明なし |
| `audioMetrics` | 説明なし |
| `audioManager` | 説明なし |
| `networkMetrics` | 説明なし |
| `systemMetrics` | 説明なし |
| `canvas` | 説明なし |
| `gl` | 説明なし |
| `audioManager` | 説明なし |
| `observer` | 説明なし |
| `entries` | 説明なし |
| `bubbleCount` | 説明なし |
| `particleCount` | 説明なし |
| `effectCount` | 説明なし |
| `bubbleCount` | 説明なし |
| `particleCount` | 説明なし |
| `recent` | 説明なし |
| `older` | 説明なし |
| `recentAvg` | 説明なし |
| `olderAvg` | 説明なし |
| `change` | 説明なし |
| `canvas` | 説明なし |
| `canvas` | 説明なし |
| `collectionTime` | 説明なし |

---

