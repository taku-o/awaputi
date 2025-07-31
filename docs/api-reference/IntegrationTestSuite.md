# IntegrationTestSuite

## 概要

ファイル: `debug/IntegrationTestSuite.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [IntegrationTestSuite](#integrationtestsuite)
## 定数
- [endTime](#endtime)
- [duration](#duration)
- [summary](#summary)
- [category](#category)
- [debugInterface](#debuginterface)
- [bubbleManager](#bubblemanager)
- [debugInterface](#debuginterface)
- [overviewPanel](#overviewpanel)
- [bubbleCount](#bubblecount)
- [scoreManager](#scoremanager)
- [debugInterface](#debuginterface)
- [consolePanel](#consolepanel)
- [initialScore](#initialscore)
- [playerData](#playerdata)
- [debugInterface](#debuginterface)
- [testPanel](#testpanel)
- [category](#category)
- [errorHandler](#errorhandler)
- [debugInterface](#debuginterface)
- [performanceOptimizer](#performanceoptimizer)
- [debugInterface](#debuginterface)
- [debugPerfMonitor](#debugperfmonitor)
- [stats](#stats)
- [debugInterface](#debuginterface)
- [category](#category)
- [issues](#issues)
- [issues](#issues)
- [debugInterface](#debuginterface)
- [responsive](#responsive)
- [touchSupported](#touchsupported)
- [category](#category)
- [debugInterface](#debuginterface)
- [baselineStart](#baselinestart)
- [baselineEnd](#baselineend)
- [baselineTime](#baselinetime)
- [withDebugStart](#withdebugstart)
- [withDebugEnd](#withdebugend)
- [withDebugTime](#withdebugtime)
- [overhead](#overhead)
- [debugInterface](#debuginterface)
- [initialMemory](#initialmemory)
- [finalMemory](#finalmemory)
- [memoryIncrease](#memoryincrease)
- [category](#category)
- [debugInterface](#debuginterface)
- [debugInterface](#debuginterface)
- [themeManager](#thememanager)
- [result](#result)
- [debugInterface](#debuginterface)
- [accessibilityManager](#accessibilitymanager)
- [category](#category)
- [debugInterface](#debuginterface)
- [panels](#panels)
- [debugInterface](#debuginterface)
- [initialListenerCount](#initiallistenercount)
- [finalListenerCount](#finallistenercount)
- [startTime](#starttime)
- [testResult](#testresult)
- [endTime](#endtime)
- [duration](#duration)
- [endTime](#endtime)
- [duration](#duration)
- [endTime](#endtime)
- [total](#total)
- [passed](#passed)
- [failed](#failed)
- [categoryStats](#categorystats)
- [categoryTests](#categorytests)
- [summary](#summary)
- [blob](#blob)
- [url](#url)
- [a](#a)

---

## IntegrationTestSuite

### コンストラクタ

```javascript
new IntegrationTestSuite(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `testResults` | 説明なし |
| `testRunning` | 説明なし |
| `startTime` | 説明なし |
| `testCategories` | 説明なし |
| `testRunning` | 説明なし |
| `startTime` | 説明なし |
| `testResults` | 説明なし |
| `testRunning` | 説明なし |

### メソッド

#### runAllTests

**シグネチャ**:
```javascript
async runAllTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runAllTests();

// runAllTestsの実用的な使用例
const result = instance.runAllTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.testRunning)
```

**パラメーター**:
- `this.testRunning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.testRunning);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runGameSystemIntegrationTests

**シグネチャ**:
```javascript
async runGameSystemIntegrationTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runGameSystemIntegrationTests();

// runGameSystemIntegrationTestsの実用的な使用例
const result = instance.runGameSystemIntegrationTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!debugInterface)
```

**パラメーター**:
- `!debugInterface`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!debugInterface);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (debugInterface.debugPanel.style.display === 'none')
```

**パラメーター**:
- `debugInterface.debugPanel.style.display === 'none'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(debugInterface.debugPanel.style.display === 'none');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!bubbleManager)
```

**パラメーター**:
- `!bubbleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!bubbleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (overviewPanel)
```

**パラメーター**:
- `overviewPanel`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(overviewPanel);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!scoreManager)
```

**パラメーター**:
- `!scoreManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!scoreManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (consolePanel)
```

**パラメーター**:
- `consolePanel`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(consolePanel);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!playerData)
```

**パラメーター**:
- `!playerData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!playerData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (testPanel)
```

**パラメーター**:
- `testPanel`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(testPanel);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runExistingSystemCompatibilityTests

**シグネチャ**:
```javascript
async runExistingSystemCompatibilityTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runExistingSystemCompatibilityTests();

// runExistingSystemCompatibilityTestsの実用的な使用例
const result = instance.runExistingSystemCompatibilityTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!errorHandler)
```

**パラメーター**:
- `!errorHandler`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!errorHandler);

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

#### if

**シグネチャ**:
```javascript
 if (!performanceOptimizer)
```

**パラメーター**:
- `!performanceOptimizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!performanceOptimizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (debugPerfMonitor)
```

**パラメーター**:
- `debugPerfMonitor`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(debugPerfMonitor);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

既存メソッドが利用可能かテスト

**シグネチャ**:
```javascript
 if (typeof debugInterface.show !== 'function' || 
                typeof debugInterface.hide !== 'function')
```

**パラメーター**:
- `typeof debugInterface.show !== 'function' || 
                typeof debugInterface.hide !== 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof debugInterface.show !== 'function' || 
                typeof debugInterface.hide !== 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runCrossBrowserCompatibilityTests

**シグネチャ**:
```javascript
async runCrossBrowserCompatibilityTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runCrossBrowserCompatibilityTests();

// runCrossBrowserCompatibilityTestsの実用的な使用例
const result = instance.runCrossBrowserCompatibilityTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

必要なブラウザAPIの存在チェック

**シグネチャ**:
```javascript
 if (!window.performance)
```

**パラメーター**:
- `!window.performance`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!window.performance);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!window.localStorage)
```

**パラメーター**:
- `!window.localStorage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!window.localStorage);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!window.requestAnimationFrame)
```

**パラメーター**:
- `!window.requestAnimationFrame`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!window.requestAnimationFrame);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!window.ResizeObserver)
```

**パラメーター**:
- `!window.ResizeObserver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!window.ResizeObserver);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!window.IntersectionObserver)
```

**パラメーター**:
- `!window.IntersectionObserver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!window.IntersectionObserver);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (issues.length > 0)
```

**パラメーター**:
- `issues.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(issues.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (issues.length > 0)
```

**パラメーター**:
- `issues.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(issues.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!responsive)
```

**パラメーター**:
- `!responsive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!responsive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (touchSupported && responsive.touchDevice)
```

**パラメーター**:
- `touchSupported && responsive.touchDevice`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(touchSupported && responsive.touchDevice);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!touchSupported && !responsive.touchDevice)
```

**パラメーター**:
- `!touchSupported && !responsive.touchDevice`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!touchSupported && !responsive.touchDevice);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runPerformanceIntegrationTests

**シグネチャ**:
```javascript
async runPerformanceIntegrationTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runPerformanceIntegrationTests();

// runPerformanceIntegrationTestsの実用的な使用例
const result = instance.runPerformanceIntegrationTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (overhead > 5)
```

**パラメーター**:
- `overhead > 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(overhead > 5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!performance.memory)
```

**パラメーター**:
- `!performance.memory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!performance.memory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < 5; i++)
```

**パラメーター**:
- `let i = 0; i < 5; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 5; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

MB

**シグネチャ**:
```javascript
 if (memoryIncrease > 10)
```

**パラメーター**:
- `memoryIncrease > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(memoryIncrease > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runErrorHandlingTests

**シグネチャ**:
```javascript
async runErrorHandlingTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runErrorHandlingTests();

// runErrorHandlingTestsの実用的な使用例
const result = instance.runErrorHandlingTests(/* 適切なパラメータ */);
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
 if (!themeManager)
```

**パラメーター**:
- `!themeManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!themeManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (result === true)
```

**パラメーター**:
- `result === true`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(result === true);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!accessibilityManager)
```

**パラメーター**:
- `!accessibilityManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!accessibilityManager);

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

#### runMemoryManagementTests

**シグネチャ**:
```javascript
async runMemoryManagementTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runMemoryManagementTests();

// runMemoryManagementTestsの実用的な使用例
const result = instance.runMemoryManagementTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const panel of panels)
```

**パラメーター**:
- `const panel of panels`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const panel of panels);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

LazyLoadManagerによる未使用コンポーネントの解放をテスト

**シグネチャ**:
```javascript
 if (debugInterface.lazyLoadManager)
```

**パラメーター**:
- `debugInterface.lazyLoadManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(debugInterface.lazyLoadManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

イベントリスナーが適切にクリーンアップされているかチェック

**シグネチャ**:
```javascript
 if (finalListenerCount > initialListenerCount + 5)
```

**パラメーター**:
- `finalListenerCount > initialListenerCount + 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(finalListenerCount > initialListenerCount + 5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runTest

**シグネチャ**:
```javascript
async runTest(category, testName, testFunction)
```

**パラメーター**:
- `category`
- `testName`
- `testFunction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runTest(category, testName, testFunction);

// runTestの実用的な使用例
const result = instance.runTest(/* 適切なパラメータ */);
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

#### simulateGameLoop

**シグネチャ**:
```javascript
async simulateGameLoop(duration)
```

**パラメーター**:
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.simulateGameLoop(duration);

// simulateGameLoopの実用的な使用例
const result = instance.simulateGameLoop(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### wait

**シグネチャ**:
```javascript
async wait(ms)
```

**パラメーター**:
- `ms`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.wait(ms);

// waitの実用的な使用例
const result = instance.wait(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEventListenerCount

**シグネチャ**:
```javascript
 getEventListenerCount()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEventListenerCount();

// getEventListenerCountの実用的な使用例
const result = instance.getEventListenerCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateTestSummary

**シグネチャ**:
```javascript
 generateTestSummary(duration)
```

**パラメーター**:
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateTestSummary(duration);

// generateTestSummaryの実用的な使用例
const result = instance.generateTestSummary(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### exportResults

**シグネチャ**:
```javascript
 exportResults()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exportResults();

// exportResultsの実用的な使用例
const result = instance.exportResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runCategoryTests

**シグネチャ**:
```javascript
async runCategoryTests(category)
```

**パラメーター**:
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runCategoryTests(category);

// runCategoryTestsの実用的な使用例
const result = instance.runCategoryTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (category)
```

**パラメーター**:
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(category);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTestStatus

**シグネチャ**:
```javascript
 getTestStatus()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTestStatus();

// getTestStatusの実用的な使用例
const result = instance.getTestStatus(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `endTime` | 説明なし |
| `duration` | 説明なし |
| `summary` | 説明なし |
| `category` | 説明なし |
| `debugInterface` | 説明なし |
| `bubbleManager` | 説明なし |
| `debugInterface` | 説明なし |
| `overviewPanel` | 説明なし |
| `bubbleCount` | 説明なし |
| `scoreManager` | 説明なし |
| `debugInterface` | 説明なし |
| `consolePanel` | 説明なし |
| `initialScore` | 説明なし |
| `playerData` | 説明なし |
| `debugInterface` | 説明なし |
| `testPanel` | 説明なし |
| `category` | 説明なし |
| `errorHandler` | 説明なし |
| `debugInterface` | 説明なし |
| `performanceOptimizer` | 説明なし |
| `debugInterface` | 説明なし |
| `debugPerfMonitor` | 説明なし |
| `stats` | 説明なし |
| `debugInterface` | 説明なし |
| `category` | 説明なし |
| `issues` | 説明なし |
| `issues` | 説明なし |
| `debugInterface` | 説明なし |
| `responsive` | 説明なし |
| `touchSupported` | 説明なし |
| `category` | 説明なし |
| `debugInterface` | 説明なし |
| `baselineStart` | 説明なし |
| `baselineEnd` | 説明なし |
| `baselineTime` | 説明なし |
| `withDebugStart` | 説明なし |
| `withDebugEnd` | 説明なし |
| `withDebugTime` | 説明なし |
| `overhead` | 説明なし |
| `debugInterface` | 説明なし |
| `initialMemory` | 説明なし |
| `finalMemory` | 説明なし |
| `memoryIncrease` | 説明なし |
| `category` | 説明なし |
| `debugInterface` | 説明なし |
| `debugInterface` | 説明なし |
| `themeManager` | 説明なし |
| `result` | 説明なし |
| `debugInterface` | 説明なし |
| `accessibilityManager` | 説明なし |
| `category` | 説明なし |
| `debugInterface` | 説明なし |
| `panels` | 説明なし |
| `debugInterface` | 説明なし |
| `initialListenerCount` | 説明なし |
| `finalListenerCount` | 説明なし |
| `startTime` | 説明なし |
| `testResult` | 説明なし |
| `endTime` | 説明なし |
| `duration` | 説明なし |
| `endTime` | 説明なし |
| `duration` | 説明なし |
| `endTime` | 説明なし |
| `total` | 説明なし |
| `passed` | 説明なし |
| `failed` | 説明なし |
| `categoryStats` | 説明なし |
| `categoryTests` | 説明なし |
| `summary` | 説明なし |
| `blob` | 説明なし |
| `url` | 説明なし |
| `a` | 説明なし |

---

