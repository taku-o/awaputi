# MobileTestSuite

## 概要

ファイル: `tests/mobile/MobileTestSuite.js`  
最終更新: 2025/7/29 9:06:33

## 目次

## クラス
- [MobileTestSuite](#mobiletestsuite)
- [TouchTestSuite](#touchtestsuite)
- [GestureTestSuite](#gesturetestsuite)
- [ResponsiveTestSuite](#responsivetestsuite)
- [PerformanceTestSuite](#performancetestsuite)
- [PWATestSuite](#pwatestsuite)
- [AccessibilityTestSuite](#accessibilitytestsuite)
- [CompatibilityTestSuite](#compatibilitytestsuite)
## 関数
- [getMobileTestSuite()](#getmobiletestsuite)
## 定数
- [event](#event)
- [start](#start)
- [end](#end)
- [userAgents](#useragents)
- [screens](#screens)
- [report](#report)
- [tests](#tests)
- [result](#result)
- [key](#key)
- [total](#total)
- [successRate](#successrate)
- [report](#report)
- [headers](#headers)
- [rows](#rows)
- [csv](#csv)
- [startTime](#starttime)
- [touch](#touch)
- [touchStartEvent](#touchstartevent)
- [touchEndEvent](#touchendevent)
- [duration](#duration)
- [startTime](#starttime)
- [touches](#touches)
- [touchStartEvent](#touchstartevent)
- [touchEndEvent](#touchendevent)
- [duration](#duration)
- [startTime](#starttime)
- [results](#results)
- [touchStart](#touchstart)
- [touch](#touch)
- [touchEvent](#touchevent)
- [touchDuration](#touchduration)
- [avgResponseTime](#avgresponsetime)
- [totalDuration](#totalduration)
- [startTime](#starttime)
- [startTouch](#starttouch)
- [endTouch](#endtouch)
- [touchStart](#touchstart)
- [moveTouch](#movetouch)
- [touchMove](#touchmove)
- [touchEnd](#touchend)
- [duration](#duration)
- [startTime](#starttime)
- [touch1Start](#touch1start)
- [touch2Start](#touch2start)
- [touchStart](#touchstart)
- [touch1](#touch1)
- [touch2](#touch2)
- [touchMove](#touchmove)
- [touch1End](#touch1end)
- [touch2End](#touch2end)
- [touchEnd](#touchend)
- [duration](#duration)
- [startTime](#starttime)
- [touch](#touch)
- [touchStart](#touchstart)
- [touchEnd](#touchend)
- [duration](#duration)
- [startTime](#starttime)
- [results](#results)
- [screen](#screen)
- [isAdapted](#isadapted)
- [duration](#duration)
- [allAdapted](#alladapted)
- [container](#container)
- [rect](#rect)
- [startTime](#starttime)
- [duration](#duration)
- [startTime](#starttime)
- [hasSafeAreaSupport](#hassafeareasupport)
- [duration](#duration)
- [startTime](#starttime)
- [frameCount](#framecount)
- [renderFrame](#renderframe)
- [duration](#duration)
- [actualFPS](#actualfps)
- [startTime](#starttime)
- [initialMemory](#initialmemory)
- [objects](#objects)
- [peakMemory](#peakmemory)
- [finalMemory](#finalmemory)
- [memoryLeak](#memoryleak)
- [duration](#duration)
- [passed](#passed)
- [startTime](#starttime)
- [battery](#battery)
- [initialLevel](#initiallevel)
- [complexCalculation](#complexcalculation)
- [finalLevel](#finallevel)
- [batteryDrop](#batterydrop)
- [duration](#duration)
- [startTime](#starttime)
- [registration](#registration)
- [duration](#duration)
- [duration](#duration)
- [startTime](#starttime)
- [response](#response)
- [manifest](#manifest)
- [requiredProps](#requiredprops)
- [hasAllProps](#hasallprops)
- [duration](#duration)
- [duration](#duration)
- [startTime](#starttime)
- [duration](#duration)
- [startTime](#starttime)
- [elementsWithAria](#elementswitharia)
- [liveRegions](#liveregions)
- [duration](#duration)
- [startTime](#starttime)
- [focusableElements](#focusableelements)
- [duration](#duration)
- [startTime](#starttime)
- [textElements](#textelements)
- [contrast](#contrast)
- [duration](#duration)
- [startTime](#starttime)
- [results](#results)
- [compatibility](#compatibility)
- [duration](#duration)
- [allCompatible](#allcompatible)
- [features](#features)
- [supportedCount](#supportedcount)
- [totalCount](#totalcount)
- [score](#score)
- [startTime](#starttime)
- [results](#results)
- [deviceInfo](#deviceinfo)
- [compatibility](#compatibility)
- [duration](#duration)
- [allCompatible](#allcompatible)
- [capabilities](#capabilities)
- [supportedCount](#supportedcount)
- [totalCount](#totalcount)
- [score](#score)
- [startTime](#starttime)
- [apis](#apis)
- [supportedAPIs](#supportedapis)
- [totalAPIs](#totalapis)
- [compatibilityScore](#compatibilityscore)
- [duration](#duration)

---

## MobileTestSuite

### コンストラクタ

```javascript
new MobileTestSuite()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `errorHandler` | 説明なし |
| `testConfig` | テスト設定 |
| `testResults` | テスト結果 |
| `testSuites` | テストスイート |
| `testContainer` | 説明なし |
| `mocks` | 説明なし |
| `utils` | 説明なし |
| `testResults` | 説明なし |

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

#### setupTestEnvironment

**シグネチャ**:
```javascript
 setupTestEnvironment()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupTestEnvironment();

// setupTestEnvironmentの実用的な使用例
const result = instance.setupTestEnvironment(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createTestContainer

**シグネチャ**:
```javascript
 createTestContainer()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createTestContainer();

// createTestContainerの実用的な使用例
const result = instance.createTestContainer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupMocks

**シグネチャ**:
```javascript
 setupMocks()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupMocks();

// setupMocksの実用的な使用例
const result = instance.setupMocks(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupTestUtilities

**シグネチャ**:
```javascript
 setupTestUtilities()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupTestUtilities();

// setupTestUtilitiesの実用的な使用例
const result = instance.setupTestUtilities(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDeviceUserAgent

**シグネチャ**:
```javascript
 getDeviceUserAgent(device)
```

**パラメーター**:
- `device`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDeviceUserAgent(device);

// getDeviceUserAgentの実用的な使用例
const result = instance.getDeviceUserAgent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDeviceScreen

**シグネチャ**:
```javascript
 getDeviceScreen(device)
```

**パラメーター**:
- `device`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDeviceScreen(device);

// getDeviceScreenの実用的な使用例
const result = instance.getDeviceScreen(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDevicePixelRatio

**シグネチャ**:
```javascript
 getDevicePixelRatio(device)
```

**パラメーター**:
- `device`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDevicePixelRatio(device);

// getDevicePixelRatioの実用的な使用例
const result = instance.getDevicePixelRatio(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### registerTestSuites

**シグネチャ**:
```javascript
 registerTestSuites()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerTestSuites();

// registerTestSuitesの実用的な使用例
const result = instance.registerTestSuites(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

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

#### for

**シグネチャ**:
```javascript
 for (const [suiteName, suite] of this.testSuites)
```

**パラメーター**:
- `const [suiteName`
- `suite] of this.testSuites`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [suiteName, suite] of this.testSuites);

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

#### runTestSuite

**シグネチャ**:
```javascript
async runTestSuite(suiteName, suite)
```

**パラメーター**:
- `suiteName`
- `suite`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runTestSuite(suiteName, suite);

// runTestSuiteの実用的な使用例
const result = instance.runTestSuite(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const test of tests)
```

**パラメーター**:
- `const test of tests`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const test of tests);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runSingleTest

**シグネチャ**:
```javascript
async runSingleTest(suiteName, test)
```

**パラメーター**:
- `suiteName`
- `test`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runSingleTest(suiteName, test);

// runSingleTestの実用的な使用例
const result = instance.runSingleTest(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

**シグネチャ**:
```javascript
 while (retries > 0)
```

**パラメーター**:
- `retries > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(retries > 0);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (result.passed)
```

**パラメーター**:
- `result.passed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(result.passed);

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
 if (retries === 0)
```

**パラメーター**:
- `retries === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(retries === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createTimeoutPromise

**シグネチャ**:
```javascript
 createTimeoutPromise()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createTimeoutPromise();

// createTimeoutPromiseの実用的な使用例
const result = instance.createTimeoutPromise(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetTestResults

**シグネチャ**:
```javascript
 resetTestResults()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetTestResults();

// resetTestResultsの実用的な使用例
const result = instance.resetTestResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordTestError

**シグネチャ**:
```javascript
 recordTestError(suiteName, testName, error)
```

**パラメーター**:
- `suiteName`
- `testName`
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordTestError(suiteName, testName, error);

// recordTestErrorの実用的な使用例
const result = instance.recordTestError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordTestFailure

**シグネチャ**:
```javascript
 recordTestFailure(suiteName, testName, error)
```

**パラメーター**:
- `suiteName`
- `testName`
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordTestFailure(suiteName, testName, error);

// recordTestFailureの実用的な使用例
const result = instance.recordTestFailure(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordPerformanceResult

**シグネチャ**:
```javascript
 recordPerformanceResult(testName, duration, metrics = {})
```

**パラメーター**:
- `testName`
- `duration`
- `metrics = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordPerformanceResult(testName, duration, metrics = {});

// recordPerformanceResultの実用的な使用例
const result = instance.recordPerformanceResult(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordCompatibilityResult

**シグネチャ**:
```javascript
 recordCompatibilityResult(device, browser, results)
```

**パラメーター**:
- `device`
- `browser`
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordCompatibilityResult(device, browser, results);

// recordCompatibilityResultの実用的な使用例
const result = instance.recordCompatibilityResult(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateTestReport

**シグネチャ**:
```javascript
 generateTestReport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateTestReport();

// generateTestReportの実用的な使用例
const result = instance.generateTestReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### exportReport

**シグネチャ**:
```javascript
 exportReport(format = 'json')
```

**パラメーター**:
- `format = 'json'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exportReport(format = 'json');

// exportReportの実用的な使用例
const result = instance.exportReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (format)
```

**パラメーター**:
- `format`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(format);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateHTMLReport

**シグネチャ**:
```javascript
 generateHTMLReport(report)
```

**パラメーター**:
- `report`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateHTMLReport(report);

// generateHTMLReportの実用的な使用例
const result = instance.generateHTMLReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateCSVReport

**シグネチャ**:
```javascript
 generateCSVReport(report)
```

**パラメーター**:
- `report`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateCSVReport(report);

// generateCSVReportの実用的な使用例
const result = instance.generateCSVReport(/* 適切なパラメータ */);
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

#### if

テストコンテナ削除

**シグネチャ**:
```javascript
 if (this.testContainer && this.testContainer.parentNode)
```

**パラメーター**:
- `this.testContainer && this.testContainer.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.testContainer && this.testContainer.parentNode);

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


---

## TouchTestSuite

### コンストラクタ

```javascript
new TouchTestSuite(parent)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `parent` | 説明なし |

### メソッド

#### getTests

**シグネチャ**:
```javascript
 getTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTests();

// getTestsの実用的な使用例
const result = instance.getTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testSingleTouch

**シグネチャ**:
```javascript
async testSingleTouch()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testSingleTouch();

// testSingleTouchの実用的な使用例
const result = instance.testSingleTouch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testMultiTouch

**シグネチャ**:
```javascript
async testMultiTouch()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testMultiTouch();

// testMultiTouchの実用的な使用例
const result = instance.testMultiTouch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testTouchResponsiveness

**シグネチャ**:
```javascript
async testTouchResponsiveness()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testTouchResponsiveness();

// testTouchResponsivenessの実用的な使用例
const result = instance.testTouchResponsiveness(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

連続タッチテスト

**シグネチャ**:
```javascript
 for (let i = 0; i < 10; i++)
```

**パラメーター**:
- `let i = 0; i < 10; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 10; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## GestureTestSuite

### コンストラクタ

```javascript
new GestureTestSuite(parent)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `parent` | 説明なし |

### メソッド

#### getTests

**シグネチャ**:
```javascript
 getTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTests();

// getTestsの実用的な使用例
const result = instance.getTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testSwipeGesture

**シグネチャ**:
```javascript
async testSwipeGesture()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testSwipeGesture();

// testSwipeGestureの実用的な使用例
const result = instance.testSwipeGesture(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

移動

**シグネチャ**:
```javascript
 for (let x = 100; x <= 300; x += 20)
```

**パラメーター**:
- `let x = 100; x <= 300; x += 20`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let x = 100; x <= 300; x += 20);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testPinchGesture

**シグネチャ**:
```javascript
async testPinchGesture()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testPinchGesture();

// testPinchGestureの実用的な使用例
const result = instance.testPinchGesture(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

指を広げる動作

**シグネチャ**:
```javascript
 for (let offset = 0; offset <= 100; offset += 10)
```

**パラメーター**:
- `let offset = 0; offset <= 100; offset += 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let offset = 0; offset <= 100; offset += 10);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testTapGesture

**シグネチャ**:
```javascript
async testTapGesture()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testTapGesture();

// testTapGestureの実用的な使用例
const result = instance.testTapGesture(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## ResponsiveTestSuite

### コンストラクタ

```javascript
new ResponsiveTestSuite(parent)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `parent` | 説明なし |

### メソッド

#### getTests

**シグネチャ**:
```javascript
 getTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTests();

// getTestsの実用的な使用例
const result = instance.getTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testViewportAdaptation

**シグネチャ**:
```javascript
async testViewportAdaptation()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testViewportAdaptation();

// testViewportAdaptationの実用的な使用例
const result = instance.testViewportAdaptation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

各デバイスサイズでテスト

**シグネチャ**:
```javascript
 for (const device of this.parent.testConfig.devices)
```

**パラメーター**:
- `const device of this.parent.testConfig.devices`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const device of this.parent.testConfig.devices);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### verifyLayoutAdaptation

**シグネチャ**:
```javascript
 verifyLayoutAdaptation(screen)
```

**パラメーター**:
- `screen`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.verifyLayoutAdaptation(screen);

// verifyLayoutAdaptationの実用的な使用例
const result = instance.verifyLayoutAdaptation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testOrientationChange

**シグネチャ**:
```javascript
async testOrientationChange()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testOrientationChange();

// testOrientationChangeの実用的な使用例
const result = instance.testOrientationChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testSafeArea

**シグネチャ**:
```javascript
async testSafeArea()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testSafeArea();

// testSafeAreaの実用的な使用例
const result = instance.testSafeArea(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## PerformanceTestSuite

### コンストラクタ

```javascript
new PerformanceTestSuite(parent)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `parent` | 説明なし |

### メソッド

#### getTests

**シグネチャ**:
```javascript
 getTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTests();

// getTestsの実用的な使用例
const result = instance.getTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testFPS

**シグネチャ**:
```javascript
async testFPS()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testFPS();

// testFPSの実用的な使用例
const result = instance.testFPS(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (renderedFrames < frameCount)
```

**パラメーター**:
- `renderedFrames < frameCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(renderedFrames < frameCount);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testMemoryUsage

**シグネチャ**:
```javascript
async testMemoryUsage()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testMemoryUsage();

// testMemoryUsageの実用的な使用例
const result = instance.testMemoryUsage(/* 適切なパラメータ */);
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
 for (let i = 0; i < 10000; i++)
```

**パラメーター**:
- `let i = 0; i < 10000; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 10000; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testBatteryImpact

**シグネチャ**:
```javascript
async testBatteryImpact()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testBatteryImpact();

// testBatteryImpactの実用的な使用例
const result = instance.testBatteryImpact(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バッテリーAPI利用可能性チェック

**シグネチャ**:
```javascript
 if (!navigator.getBattery)
```

**パラメーター**:
- `!navigator.getBattery`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!navigator.getBattery);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < 100000; i++)
```

**パラメーター**:
- `let i = 0; i < 100000; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 100000; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

短時間の集約処理

**シグネチャ**:
```javascript
 for (let i = 0; i < 10; i++)
```

**パラメーター**:
- `let i = 0; i < 10; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 10; i++);

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


---

## PWATestSuite

### コンストラクタ

```javascript
new PWATestSuite(parent)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `parent` | 説明なし |

### メソッド

#### getTests

**シグネチャ**:
```javascript
 getTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTests();

// getTestsの実用的な使用例
const result = instance.getTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testServiceWorker

**シグネチャ**:
```javascript
async testServiceWorker()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testServiceWorker();

// testServiceWorkerの実用的な使用例
const result = instance.testServiceWorker(/* 適切なパラメータ */);
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

#### testManifest

**シグネチャ**:
```javascript
async testManifest()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testManifest();

// testManifestの実用的な使用例
const result = instance.testManifest(/* 適切なパラメータ */);
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

#### testOfflineFunctionality

**シグネチャ**:
```javascript
async testOfflineFunctionality()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testOfflineFunctionality();

// testOfflineFunctionalityの実用的な使用例
const result = instance.testOfflineFunctionality(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## AccessibilityTestSuite

### コンストラクタ

```javascript
new AccessibilityTestSuite(parent)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `parent` | 説明なし |

### メソッド

#### getTests

**シグネチャ**:
```javascript
 getTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTests();

// getTestsの実用的な使用例
const result = instance.getTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testScreenReaderSupport

**シグネチャ**:
```javascript
async testScreenReaderSupport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testScreenReaderSupport();

// testScreenReaderSupportの実用的な使用例
const result = instance.testScreenReaderSupport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testKeyboardNavigation

**シグネチャ**:
```javascript
async testKeyboardNavigation()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testKeyboardNavigation();

// testKeyboardNavigationの実用的な使用例
const result = instance.testKeyboardNavigation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const element of focusableElements)
```

**パラメーター**:
- `const element of focusableElements`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const element of focusableElements);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (element.offsetParent !== null)
```

**パラメーター**:
- `element.offsetParent !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(element.offsetParent !== null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (document.activeElement === element)
```

**パラメーター**:
- `document.activeElement === element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(document.activeElement === element);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testColorContrast

**シグネチャ**:
```javascript
async testColorContrast()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testColorContrast();

// testColorContrastの実用的な使用例
const result = instance.testColorContrast(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const element of textElements)
```

**パラメーター**:
- `const element of textElements`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const element of textElements);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (contrast >= 4.5)
```

**パラメーター**:
- `contrast >= 4.5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(contrast >= 4.5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateElementContrast

**シグネチャ**:
```javascript
 calculateElementContrast(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateElementContrast(element);

// calculateElementContrastの実用的な使用例
const result = instance.calculateElementContrast(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## CompatibilityTestSuite

### コンストラクタ

```javascript
new CompatibilityTestSuite(parent)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `parent` | 説明なし |

### メソッド

#### getTests

**シグネチャ**:
```javascript
 getTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTests();

// getTestsの実用的な使用例
const result = instance.getTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testBrowserCompatibility

**シグネチャ**:
```javascript
async testBrowserCompatibility()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testBrowserCompatibility();

// testBrowserCompatibilityの実用的な使用例
const result = instance.testBrowserCompatibility(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const browser of this.parent.testConfig.browsers)
```

**パラメーター**:
- `const browser of this.parent.testConfig.browsers`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const browser of this.parent.testConfig.browsers);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkBrowserFeatures

**シグネチャ**:
```javascript
 checkBrowserFeatures(browser)
```

**パラメーター**:
- `browser`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkBrowserFeatures(browser);

// checkBrowserFeaturesの実用的な使用例
const result = instance.checkBrowserFeatures(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testDeviceCompatibility

**シグネチャ**:
```javascript
async testDeviceCompatibility()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testDeviceCompatibility();

// testDeviceCompatibilityの実用的な使用例
const result = instance.testDeviceCompatibility(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const device of this.parent.testConfig.devices)
```

**パラメーター**:
- `const device of this.parent.testConfig.devices`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const device of this.parent.testConfig.devices);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkDeviceCapabilities

**シグネチャ**:
```javascript
 checkDeviceCapabilities(device, deviceInfo)
```

**パラメーター**:
- `device`
- `deviceInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkDeviceCapabilities(device, deviceInfo);

// checkDeviceCapabilitiesの実用的な使用例
const result = instance.checkDeviceCapabilities(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testAPICompatibility

**シグネチャ**:
```javascript
async testAPICompatibility()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testAPICompatibility();

// testAPICompatibilityの実用的な使用例
const result = instance.testAPICompatibility(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getMobileTestSuite

**シグネチャ**:
```javascript
getMobileTestSuite()
```

**使用例**:
```javascript
const result = getMobileTestSuite();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `event` | 説明なし |
| `start` | 説明なし |
| `end` | 説明なし |
| `userAgents` | 説明なし |
| `screens` | 説明なし |
| `report` | 説明なし |
| `tests` | 説明なし |
| `result` | 説明なし |
| `key` | 説明なし |
| `total` | 説明なし |
| `successRate` | 説明なし |
| `report` | 説明なし |
| `headers` | 説明なし |
| `rows` | 説明なし |
| `csv` | 説明なし |
| `startTime` | 説明なし |
| `touch` | 説明なし |
| `touchStartEvent` | 説明なし |
| `touchEndEvent` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `touches` | 説明なし |
| `touchStartEvent` | 説明なし |
| `touchEndEvent` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `results` | 説明なし |
| `touchStart` | 説明なし |
| `touch` | 説明なし |
| `touchEvent` | 説明なし |
| `touchDuration` | 説明なし |
| `avgResponseTime` | 説明なし |
| `totalDuration` | 説明なし |
| `startTime` | 説明なし |
| `startTouch` | 説明なし |
| `endTouch` | 説明なし |
| `touchStart` | 説明なし |
| `moveTouch` | 説明なし |
| `touchMove` | 説明なし |
| `touchEnd` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `touch1Start` | 説明なし |
| `touch2Start` | 説明なし |
| `touchStart` | 説明なし |
| `touch1` | 説明なし |
| `touch2` | 説明なし |
| `touchMove` | 説明なし |
| `touch1End` | 説明なし |
| `touch2End` | 説明なし |
| `touchEnd` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `touch` | 説明なし |
| `touchStart` | 説明なし |
| `touchEnd` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `results` | 説明なし |
| `screen` | 説明なし |
| `isAdapted` | 説明なし |
| `duration` | 説明なし |
| `allAdapted` | 説明なし |
| `container` | 説明なし |
| `rect` | 説明なし |
| `startTime` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `hasSafeAreaSupport` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `frameCount` | 説明なし |
| `renderFrame` | 説明なし |
| `duration` | 説明なし |
| `actualFPS` | 説明なし |
| `startTime` | 説明なし |
| `initialMemory` | 説明なし |
| `objects` | 説明なし |
| `peakMemory` | 説明なし |
| `finalMemory` | 説明なし |
| `memoryLeak` | 説明なし |
| `duration` | 説明なし |
| `passed` | 説明なし |
| `startTime` | 説明なし |
| `battery` | 説明なし |
| `initialLevel` | 説明なし |
| `complexCalculation` | 説明なし |
| `finalLevel` | 説明なし |
| `batteryDrop` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `registration` | 説明なし |
| `duration` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `response` | 説明なし |
| `manifest` | 説明なし |
| `requiredProps` | 説明なし |
| `hasAllProps` | 説明なし |
| `duration` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `elementsWithAria` | 説明なし |
| `liveRegions` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `focusableElements` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `textElements` | 説明なし |
| `contrast` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `results` | 説明なし |
| `compatibility` | 説明なし |
| `duration` | 説明なし |
| `allCompatible` | 説明なし |
| `features` | 説明なし |
| `supportedCount` | 説明なし |
| `totalCount` | 説明なし |
| `score` | 説明なし |
| `startTime` | 説明なし |
| `results` | 説明なし |
| `deviceInfo` | 説明なし |
| `compatibility` | 説明なし |
| `duration` | 説明なし |
| `allCompatible` | 説明なし |
| `capabilities` | 説明なし |
| `supportedCount` | 説明なし |
| `totalCount` | 説明なし |
| `score` | 説明なし |
| `startTime` | 説明なし |
| `apis` | 説明なし |
| `supportedAPIs` | 説明なし |
| `totalAPIs` | 説明なし |
| `compatibilityScore` | 説明なし |
| `duration` | 説明なし |

---

