# TestSupportTools

## 概要

ファイル: `debug/TestSupportTools.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [TestSupportTools](#testsupporttools)
- [TestRunner](#testrunner)
- [MockDataGenerator](#mockdatagenerator)
- [BenchmarkSuite](#benchmarksuite)
## 定数
- [startTime](#starttime)
- [suitesToRun](#suitestorun)
- [results](#results)
- [executionTime](#executiontime)
- [testSession](#testsession)
- [results](#results)
- [targetResults](#targetresults)
- [analysis](#analysis)
- [performanceTests](#performancetests)
- [recentSessions](#recentsessions)
- [successRates](#successrates)
- [executionTimes](#executiontimes)
- [recent](#recent)
- [older](#older)
- [recentAvg](#recentavg)
- [olderAvg](#olderavg)
- [change](#change)
- [recommendations](#recommendations)
- [successRate](#successrate)
- [engine](#engine)
- [bubbleManager](#bubblemanager)
- [initialCount](#initialcount)
- [mockBubbles](#mockbubbles)
- [newCount](#newcount)
- [scoreManager](#scoremanager)
- [initialScore](#initialscore)
- [newScore](#newscore)
- [startTime](#starttime)
- [endTime](#endtime)
- [duration](#duration)
- [fps](#fps)
- [beforeMemory](#beforememory)
- [mockData](#mockdata)
- [afterMemory](#aftermemory)
- [memoryIncrease](#memoryincrease)
- [measurements](#measurements)
- [measurementDuration](#measurementduration)
- [startTime](#starttime)
- [frameStart](#framestart)
- [frameEnd](#frameend)
- [frameTime](#frametime)
- [avgFPS](#avgfps)
- [variance](#variance)
- [stdDev](#stddev)
- [sceneManager](#scenemanager)
- [currentScene](#currentscene)
- [availableScenes](#availablescenes)
- [targetScene](#targetscene)
- [inputManager](#inputmanager)
- [mockEvent](#mockevent)
- [playerData](#playerdata)
- [testKey](#testkey)
- [testValue](#testvalue)
- [retrievedValue](#retrievedvalue)
- [results](#results)
- [startTime](#starttime)
- [suite](#suite)
- [suiteResults](#suiteresults)
- [results](#results)
- [testResult](#testresult)
- [testResult](#testresult)
- [startTime](#starttime)
- [result](#result)
- [generator](#generator)
- [results](#results)
- [types](#types)
- [bubbles](#bubbles)
- [options](#options)
- [count](#count)
- [history](#history)
- [targets](#targets)
- [results](#results)
- [benchmark](#benchmark)
- [iterations](#iterations)
- [times](#times)
- [start](#start)
- [avgTime](#avgtime)
- [minTime](#mintime)
- [maxTime](#maxtime)
- [bubbleManager](#bubblemanager)
- [mockGenerator](#mockgenerator)
- [testBubbles](#testbubbles)
- [start](#start)
- [totalTime](#totaltime)
- [particleManager](#particlemanager)
- [start](#start)
- [generationTime](#generationtime)
- [updateStart](#updatestart)
- [updateTime](#updatetime)
- [initialMemory](#initialmemory)
- [mockGenerator](#mockgenerator)
- [start](#start)
- [allocations](#allocations)
- [allocationTime](#allocationtime)
- [peakMemory](#peakmemory)
- [finalMemory](#finalmemory)
- [audioManager](#audiomanager)
- [start](#start)
- [effectName](#effectname)
- [processingTime](#processingtime)

---

## TestSupportTools

### コンストラクタ

```javascript
new TestSupportTools(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `testRunner` | 説明なし |
| `mockDataGenerator` | 説明なし |
| `benchmarkSuite` | 説明なし |
| `testResults` | 説明なし |
| `isRunning` | 説明なし |
| `testEnvironment` | テスト環境の初期化 |
| `isRunning` | 説明なし |
| `isRunning` | 説明なし |
| `isRunning` | 説明なし |
| `isRunning` | 説明なし |
| `isRunning` | 説明なし |
| `testEnvironment` | 説明なし |

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

#### registerDefaultTests

**シグネチャ**:
```javascript
 registerDefaultTests()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerDefaultTests();

// registerDefaultTestsの実用的な使用例
const result = instance.registerDefaultTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runTests

テスト実行メソッド

**シグネチャ**:
```javascript
async runTests(suiteNames = null)
```

**パラメーター**:
- `suiteNames = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runTests(suiteNames = null);

// runTestsの実用的な使用例
const result = instance.runTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isRunning)
```

**パラメーター**:
- `this.isRunning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isRunning);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runBenchmarks

**シグネチャ**:
```javascript
async runBenchmarks(benchmarkNames = null)
```

**パラメーター**:
- `benchmarkNames = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runBenchmarks(benchmarkNames = null);

// runBenchmarksの実用的な使用例
const result = instance.runBenchmarks(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isRunning)
```

**パラメーター**:
- `this.isRunning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isRunning);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateTestData

モックデータ生成

**シグネチャ**:
```javascript
 generateTestData(type, count = 1, options = {})
```

**パラメーター**:
- `type`
- `count = 1`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateTestData(type, count = 1, options = {});

// generateTestDataの実用的な使用例
const result = instance.generateTestData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateMockGameState

**シグネチャ**:
```javascript
 generateMockGameState(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateMockGameState(options = {});

// generateMockGameStateの実用的な使用例
const result = instance.generateMockGameState(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateMockBubbles

**シグネチャ**:
```javascript
 generateMockBubbles(count = 10, types = null)
```

**パラメーター**:
- `count = 10`
- `types = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateMockBubbles(count = 10, types = null);

// generateMockBubblesの実用的な使用例
const result = instance.generateMockBubbles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeTestResults

結果分析

**シグネチャ**:
```javascript
 analyzeTestResults(results = null)
```

**パラメーター**:
- `results = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeTestResults(results = null);

// analyzeTestResultsの実用的な使用例
const result = instance.analyzeTestResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!targetResults)
```

**パラメーター**:
- `!targetResults`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!targetResults);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createTestSummary

**シグネチャ**:
```javascript
 createTestSummary(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createTestSummary(results);

// createTestSummaryの実用的な使用例
const result = instance.createTestSummary(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzePerformanceMetrics

**シグネチャ**:
```javascript
 analyzePerformanceMetrics(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzePerformanceMetrics(results);

// analyzePerformanceMetricsの実用的な使用例
const result = instance.analyzePerformanceMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeTestTrends

**シグネチャ**:
```javascript
 analyzeTestTrends()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeTestTrends();

// analyzeTestTrendsの実用的な使用例
const result = instance.analyzeTestTrends(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (recentSessions.length < 2)
```

**パラメーター**:
- `recentSessions.length < 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(recentSessions.length < 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateTrend

**シグネチャ**:
```javascript
 calculateTrend(values)
```

**パラメーター**:
- `values`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateTrend(values);

// calculateTrendの実用的な使用例
const result = instance.calculateTrend(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateRecommendations

**シグネチャ**:
```javascript
 generateRecommendations(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateRecommendations(results);

// generateRecommendationsの実用的な使用例
const result = instance.generateRecommendations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (results.failed > 0)
```

**パラメーター**:
- `results.failed > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(results.failed > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (results.executionTime > 30000)
```

**パラメーター**:
- `results.executionTime > 30000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(results.executionTime > 30000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (successRate < 0.9)
```

**パラメーター**:
- `successRate < 0.9`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(successRate < 0.9);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getLatestTestResults

ユーティリティメソッド

**シグネチャ**:
```javascript
 getLatestTestResults()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getLatestTestResults();

// getLatestTestResultsの実用的な使用例
const result = instance.getLatestTestResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTestHistory

**シグネチャ**:
```javascript
 getTestHistory(limit = 10)
```

**パラメーター**:
- `limit = 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTestHistory(limit = 10);

// getTestHistoryの実用的な使用例
const result = instance.getTestHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearTestHistory

**シグネチャ**:
```javascript
 clearTestHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearTestHistory();

// clearTestHistoryの実用的な使用例
const result = instance.clearTestHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createCoreTestSuite

デフォルトテストスイート作成

**シグネチャ**:
```javascript
 createCoreTestSuite()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createCoreTestSuite();

// createCoreTestSuiteの実用的な使用例
const result = instance.createCoreTestSuite(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createPerformanceTestSuite

**シグネチャ**:
```javascript
 createPerformanceTestSuite()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createPerformanceTestSuite();

// createPerformanceTestSuiteの実用的な使用例
const result = instance.createPerformanceTestSuite(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createIntegrationTestSuite

**シグネチャ**:
```javascript
 createIntegrationTestSuite()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createIntegrationTestSuite();

// createIntegrationTestSuiteの実用的な使用例
const result = instance.createIntegrationTestSuite(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testGameEngineInitialization

個別テストメソッド

**シグネチャ**:
```javascript
async testGameEngineInitialization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testGameEngineInitialization();

// testGameEngineInitializationの実用的な使用例
const result = instance.testGameEngineInitialization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!engine)
```

**パラメーター**:
- `!engine`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!engine);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!engine.canvas)
```

**パラメーター**:
- `!engine.canvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!engine.canvas);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!engine.sceneManager)
```

**パラメーター**:
- `!engine.sceneManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!engine.sceneManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testBubbleManager

**シグネチャ**:
```javascript
async testBubbleManager()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testBubbleManager();

// testBubbleManagerの実用的な使用例
const result = instance.testBubbleManager(/* 適切なパラメータ */);
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
 if (newCount !== initialCount + 5)
```

**パラメーター**:
- `newCount !== initialCount + 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newCount !== initialCount + 5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testScoreManager

**シグネチャ**:
```javascript
async testScoreManager()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testScoreManager();

// testScoreManagerの実用的な使用例
const result = instance.testScoreManager(/* 適切なパラメータ */);
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
 if (newScore !== initialScore + 100)
```

**パラメーター**:
- `newScore !== initialScore + 100`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newScore !== initialScore + 100);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testRenderingPerformance

**シグネチャ**:
```javascript
async testRenderingPerformance()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testRenderingPerformance();

// testRenderingPerformanceの実用的な使用例
const result = instance.testRenderingPerformance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

60フレーム分の描画をシミュレート

**シグネチャ**:
```javascript
 for (let i = 0; i < 60; i++)
```

**パラメーター**:
- `let i = 0; i < 60; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 60; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.render)
```

**パラメーター**:
- `this.gameEngine?.render`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.render);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (fps < 30)
```

**パラメーター**:
- `fps < 30`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fps < 30);

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

#### testFPSStability

**シグネチャ**:
```javascript
async testFPSStability()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testFPSStability();

// testFPSStabilityの実用的な使用例
const result = instance.testFPSStability(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (stdDev > 10)
```

**パラメーター**:
- `stdDev > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stdDev > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testSceneTransitions

**シグネチャ**:
```javascript
async testSceneTransitions()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testSceneTransitions();

// testSceneTransitionsの実用的な使用例
const result = instance.testSceneTransitions(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!sceneManager)
```

**パラメーター**:
- `!sceneManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!sceneManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (availableScenes.length < 2)
```

**パラメーター**:
- `availableScenes.length < 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(availableScenes.length < 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testInputHandling

**シグネチャ**:
```javascript
async testInputHandling()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testInputHandling();

// testInputHandlingの実用的な使用例
const result = instance.testInputHandling(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!inputManager)
```

**パラメーター**:
- `!inputManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!inputManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!eventHandled)
```

**パラメーター**:
- `!eventHandled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!eventHandled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testDataPersistence

**シグネチャ**:
```javascript
async testDataPersistence()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testDataPersistence();

// testDataPersistenceの実用的な使用例
const result = instance.testDataPersistence(/* 適切なパラメータ */);
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
 if (!retrievedValue || retrievedValue.test !== testValue.test)
```

**パラメーター**:
- `!retrievedValue || retrievedValue.test !== testValue.test`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!retrievedValue || retrievedValue.test !== testValue.test);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

## TestRunner

### コンストラクタ

```javascript
new TestRunner(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `testSuites` | 説明なし |
| `currentExecution` | 説明なし |
| `currentExecution` | 説明なし |

### メソッド

#### registerSuite

**シグネチャ**:
```javascript
 registerSuite(name, suite)
```

**パラメーター**:
- `name`
- `suite`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerSuite(name, suite);

// registerSuiteの実用的な使用例
const result = instance.registerSuite(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAllSuiteNames

**シグネチャ**:
```javascript
 getAllSuiteNames()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAllSuiteNames();

// getAllSuiteNamesの実用的な使用例
const result = instance.getAllSuiteNames(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runSuites

**シグネチャ**:
```javascript
async runSuites(suiteNames)
```

**パラメーター**:
- `suiteNames`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runSuites(suiteNames);

// runSuitesの実用的な使用例
const result = instance.runSuites(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const suiteName of suiteNames)
```

**パラメーター**:
- `const suiteName of suiteNames`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const suiteName of suiteNames);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!suite)
```

**パラメーター**:
- `!suite`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!suite);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runSuite

**シグネチャ**:
```javascript
async runSuite(suite)
```

**パラメーター**:
- `suite`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runSuite(suite);

// runSuiteの実用的な使用例
const result = instance.runSuite(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const test of suite.tests)
```

**パラメーター**:
- `const test of suite.tests`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const test of suite.tests);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (testResult.passed)
```

**パラメーター**:
- `testResult.passed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(testResult.passed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (testResult.failed)
```

**パラメーター**:
- `testResult.failed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(testResult.failed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runTest

**シグネチャ**:
```javascript
async runTest(test)
```

**パラメーター**:
- `test`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runTest(test);

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

## MockDataGenerator

### コンストラクタ

```javascript
new MockDataGenerator(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `generators` | 説明なし |

### メソッド

#### setupGenerators

**シグネチャ**:
```javascript
 setupGenerators()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupGenerators();

// setupGeneratorsの実用的な使用例
const result = instance.setupGenerators(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generate

**シグネチャ**:
```javascript
 generate(type, count = 1, options = {})
```

**パラメーター**:
- `type`
- `count = 1`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generate(type, count = 1, options = {});

// generateの実用的な使用例
const result = instance.generate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!generator)
```

**パラメーター**:
- `!generator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!generator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (count === 1)
```

**パラメーター**:
- `count === 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(count === 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < count; i++)
```

**パラメーター**:
- `let i = 0; i < count; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < count; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateBubble

**シグネチャ**:
```javascript
 generateBubble(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateBubble(options = {});

// generateBubbleの実用的な使用例
const result = instance.generateBubble(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateBubbles

**シグネチャ**:
```javascript
 generateBubbles(count = 10, types = null)
```

**パラメーター**:
- `count = 10`
- `types = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateBubbles(count = 10, types = null);

// generateBubblesの実用的な使用例
const result = instance.generateBubbles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < count; i++)
```

**パラメーター**:
- `let i = 0; i < count; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < count; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (types && types.length > 0)
```

**パラメーター**:
- `types && types.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(types && types.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateGameState

**シグネチャ**:
```javascript
 generateGameState(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateGameState(options = {});

// generateGameStateの実用的な使用例
const result = instance.generateGameState(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generatePlayerData

**シグネチャ**:
```javascript
 generatePlayerData(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generatePlayerData(options = {});

// generatePlayerDataの実用的な使用例
const result = instance.generatePlayerData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateLargeBubbleSet

**シグネチャ**:
```javascript
 generateLargeBubbleSet(count = 1000)
```

**パラメーター**:
- `count = 1000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateLargeBubbleSet(count = 1000);

// generateLargeBubbleSetの実用的な使用例
const result = instance.generateLargeBubbleSet(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateScoreHistory

**シグネチャ**:
```javascript
 generateScoreHistory(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateScoreHistory(options = {});

// generateScoreHistoryの実用的な使用例
const result = instance.generateScoreHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < count; i++)
```

**パラメーター**:
- `let i = 0; i < count; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < count; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

## BenchmarkSuite

### コンストラクタ

```javascript
new BenchmarkSuite(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `benchmarks` | 説明なし |

### メソッド

#### setupBenchmarks

**シグネチャ**:
```javascript
 setupBenchmarks()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupBenchmarks();

// setupBenchmarksの実用的な使用例
const result = instance.setupBenchmarks(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runBenchmarks

**シグネチャ**:
```javascript
async runBenchmarks(benchmarkNames = null)
```

**パラメーター**:
- `benchmarkNames = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runBenchmarks(benchmarkNames = null);

// runBenchmarksの実用的な使用例
const result = instance.runBenchmarks(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const name of targets)
```

**パラメーター**:
- `const name of targets`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const name of targets);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (benchmark)
```

**パラメーター**:
- `benchmark`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(benchmark);

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

#### benchmarkRendering

**シグネチャ**:
```javascript
async benchmarkRendering()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.benchmarkRendering();

// benchmarkRenderingの実用的な使用例
const result = instance.benchmarkRendering(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < iterations; i++)
```

**パラメーター**:
- `let i = 0; i < iterations; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < iterations; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.render)
```

**パラメーター**:
- `this.gameEngine?.render`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.render);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### benchmarkBubblePhysics

**シグネチャ**:
```javascript
async benchmarkBubblePhysics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.benchmarkBubblePhysics();

// benchmarkBubblePhysicsの実用的な使用例
const result = instance.benchmarkBubblePhysics(/* 適切なパラメータ */);
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

#### for

物理演算シミュレーション

**シグネチャ**:
```javascript
 for (let frame = 0; frame < 60; frame++)
```

**パラメーター**:
- `let frame = 0; frame < 60; frame++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let frame = 0; frame < 60; frame++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### benchmarkParticleEffects

**シグネチャ**:
```javascript
async benchmarkParticleEffects()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.benchmarkParticleEffects();

// benchmarkParticleEffectsの実用的な使用例
const result = instance.benchmarkParticleEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!particleManager)
```

**パラメーター**:
- `!particleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!particleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

パーティクルエフェクトを大量生成

**シグネチャ**:
```javascript
 for (let i = 0; i < 50; i++)
```

**パラメーター**:
- `let i = 0; i < 50; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 50; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (particleManager.createBubbleDestructionEffect)
```

**パラメーター**:
- `particleManager.createBubbleDestructionEffect`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particleManager.createBubbleDestructionEffect);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let frame = 0; frame < 60; frame++)
```

**パラメーター**:
- `let frame = 0; frame < 60; frame++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let frame = 0; frame < 60; frame++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (particleManager.update)
```

**パラメーター**:
- `particleManager.update`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particleManager.update);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### benchmarkMemoryAllocation

**シグネチャ**:
```javascript
async benchmarkMemoryAllocation()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.benchmarkMemoryAllocation();

// benchmarkMemoryAllocationの実用的な使用例
const result = instance.benchmarkMemoryAllocation(/* 適切なパラメータ */);
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
 for (let i = 0; i < 1000; i++)
```

**パラメーター**:
- `let i = 0; i < 1000; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 1000; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ガベージコレクションを促す

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

#### benchmarkAudioProcessing

**シグネチャ**:
```javascript
async benchmarkAudioProcessing()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.benchmarkAudioProcessing();

// benchmarkAudioProcessingの実用的な使用例
const result = instance.benchmarkAudioProcessing(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!audioManager)
```

**パラメーター**:
- `!audioManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!audioManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

音声処理のシミュレーション

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

音声エフェクトの処理をシミュレート

**シグネチャ**:
```javascript
 if (audioManager.playEffect)
```

**パラメーター**:
- `audioManager.playEffect`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(audioManager.playEffect);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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
| `startTime` | 説明なし |
| `suitesToRun` | 説明なし |
| `results` | 説明なし |
| `executionTime` | 説明なし |
| `testSession` | 説明なし |
| `results` | 説明なし |
| `targetResults` | 説明なし |
| `analysis` | 説明なし |
| `performanceTests` | 説明なし |
| `recentSessions` | 説明なし |
| `successRates` | 説明なし |
| `executionTimes` | 説明なし |
| `recent` | 説明なし |
| `older` | 説明なし |
| `recentAvg` | 説明なし |
| `olderAvg` | 説明なし |
| `change` | 説明なし |
| `recommendations` | 説明なし |
| `successRate` | 説明なし |
| `engine` | 説明なし |
| `bubbleManager` | 説明なし |
| `initialCount` | 説明なし |
| `mockBubbles` | 説明なし |
| `newCount` | 説明なし |
| `scoreManager` | 説明なし |
| `initialScore` | 説明なし |
| `newScore` | 説明なし |
| `startTime` | 説明なし |
| `endTime` | 説明なし |
| `duration` | 説明なし |
| `fps` | 説明なし |
| `beforeMemory` | 説明なし |
| `mockData` | 説明なし |
| `afterMemory` | 説明なし |
| `memoryIncrease` | 説明なし |
| `measurements` | 説明なし |
| `measurementDuration` | 説明なし |
| `startTime` | 説明なし |
| `frameStart` | 説明なし |
| `frameEnd` | 説明なし |
| `frameTime` | 説明なし |
| `avgFPS` | 説明なし |
| `variance` | 説明なし |
| `stdDev` | 説明なし |
| `sceneManager` | 説明なし |
| `currentScene` | 説明なし |
| `availableScenes` | 説明なし |
| `targetScene` | 説明なし |
| `inputManager` | 説明なし |
| `mockEvent` | 説明なし |
| `playerData` | 説明なし |
| `testKey` | 説明なし |
| `testValue` | 説明なし |
| `retrievedValue` | 説明なし |
| `results` | 説明なし |
| `startTime` | 説明なし |
| `suite` | 説明なし |
| `suiteResults` | 説明なし |
| `results` | 説明なし |
| `testResult` | 説明なし |
| `testResult` | 説明なし |
| `startTime` | 説明なし |
| `result` | 説明なし |
| `generator` | 説明なし |
| `results` | 説明なし |
| `types` | 説明なし |
| `bubbles` | 説明なし |
| `options` | 説明なし |
| `count` | 説明なし |
| `history` | 説明なし |
| `targets` | 説明なし |
| `results` | 説明なし |
| `benchmark` | 説明なし |
| `iterations` | 説明なし |
| `times` | 説明なし |
| `start` | 説明なし |
| `avgTime` | 説明なし |
| `minTime` | 説明なし |
| `maxTime` | 説明なし |
| `bubbleManager` | 説明なし |
| `mockGenerator` | 説明なし |
| `testBubbles` | 説明なし |
| `start` | 説明なし |
| `totalTime` | 説明なし |
| `particleManager` | 説明なし |
| `start` | 説明なし |
| `generationTime` | 説明なし |
| `updateStart` | 説明なし |
| `updateTime` | 説明なし |
| `initialMemory` | 説明なし |
| `mockGenerator` | 説明なし |
| `start` | 説明なし |
| `allocations` | 説明なし |
| `allocationTime` | 説明なし |
| `peakMemory` | 説明なし |
| `finalMemory` | 説明なし |
| `audioManager` | 説明なし |
| `start` | 説明なし |
| `effectName` | 説明なし |
| `processingTime` | 説明なし |

---

