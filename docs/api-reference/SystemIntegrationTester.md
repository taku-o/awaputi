# SystemIntegrationTester

## 概要

ファイル: `core/i18n/testing/SystemIntegrationTester.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [SystemIntegrationTester](#systemintegrationtester)
## 関数
- [getSystemIntegrationTester()](#getsystemintegrationtester)
## 定数
- [suiteResults](#suiteresults)
- [passed](#passed)
- [failed](#failed)
- [report](#report)
- [testFunction](#testfunction)
- [startTime](#starttime)
- [results](#results)
- [suiteResults](#suiteresults)
- [results](#results)
- [translation](#translation)
- [key](#key)
- [firstCall](#firstcall)
- [secondCall](#secondcall)
- [result](#result)
- [translation](#translation)
- [results](#results)
- [success](#success)
- [commonTrans](#commontrans)
- [gameTrans](#gametrans)
- [translation](#translation)
- [results](#results)
- [singular](#singular)
- [plural](#plural)
- [casual](#casual)
- [formal](#formal)
- [numberExpression](#numberexpression)
- [query](#query)
- [results](#results)
- [results](#results)
- [success](#success)
- [element](#element)
- [adapted](#adapted)
- [element](#element)
- [adapted](#adapted)
- [validation](#validation)
- [results](#results)
- [isRTL](#isrtl)
- [isLTR](#isltr)
- [arabicDirection](#arabicdirection)
- [englishDirection](#englishdirection)
- [hasRTL](#hasrtl)
- [controlChars](#controlchars)
- [results](#results)
- [languages](#languages)
- [success](#success)
- [currentLang](#currentlang)
- [switches](#switches)
- [lang](#lang)
- [results](#results)
- [successCount](#successcount)
- [englishTranslation](#englishtranslation)
- [japaneseTranslation](#japanesetranslation)
- [results](#results)
- [startTime](#starttime)
- [endTime](#endtime)
- [duration](#duration)
- [startTime](#starttime)
- [endTime](#endtime)
- [duration](#duration)
- [initialMemory](#initialmemory)
- [finalMemory](#finalmemory)
- [memoryIncrease](#memoryincrease)
- [results](#results)
- [translation](#translation)
- [result](#result)
- [results](#results)
- [initialStats](#initialstats)
- [clearedStats](#clearedstats)
- [results](#results)
- [promises](#promises)
- [results](#results)
- [allSame](#allsame)
- [languages](#languages)
- [promises](#promises)
- [results](#results)
- [successCount](#successcount)
- [container](#container)
- [container](#container)
- [startTime](#starttime)
- [duration](#duration)
- [successRate](#successrate)
- [report](#report)
- [passed](#passed)
- [failed](#failed)
- [avgDuration](#avgduration)
- [element](#element)

---

## SystemIntegrationTester

### コンストラクタ

```javascript
new SystemIntegrationTester()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `localizationManager` | 説明なし |
| `formatterEngine` | 説明なし |
| `culturalSystem` | 説明なし |
| `rtlDetector` | 説明なし |
| `testResults` | テスト結果 |
| `testStats` | 説明なし |
| `testSuites` | テストスイート定義 |
| `mockFactory` | モックファクトリ |

### メソッド

#### runAllTests

**シグネチャ**:
```javascript
async runAllTests(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runAllTests(options = {});

// runAllTestsの実用的な使用例
const result = instance.runAllTests(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

各テストスイートを実行

**シグネチャ**:
```javascript
 for (const suiteName of suites)
```

**パラメーター**:
- `const suiteName of suites`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const suiteName of suites);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (failFast && failed > 0)
```

**パラメーター**:
- `failFast && failed > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(failFast && failed > 0);

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

テスト後のクリーンアップ

**シグネチャ**:
```javascript
 if (cleanup)
```

**パラメーター**:
- `cleanup`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(cleanup);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

レポート生成

**シグネチャ**:
```javascript
 if (generateReport)
```

**パラメーター**:
- `generateReport`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(generateReport);

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

#### runTestSuite

**シグネチャ**:
```javascript
async runTestSuite(suiteName)
```

**パラメーター**:
- `suiteName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runTestSuite(suiteName);

// runTestSuiteの実用的な使用例
const result = instance.runTestSuite(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!testFunction)
```

**パラメーター**:
- `!testFunction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!testFunction);

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

#### testLocalizationCore

**シグネチャ**:
```javascript
async testLocalizationCore()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testLocalizationCore();

// testLocalizationCoreの実用的な使用例
const result = instance.testLocalizationCore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testTranslationLoading

**シグネチャ**:
```javascript
async testTranslationLoading()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testTranslationLoading();

// testTranslationLoadingの実用的な使用例
const result = instance.testTranslationLoading(/* 適切なパラメータ */);
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

#### testFormattingIntegration

**シグネチャ**:
```javascript
async testFormattingIntegration()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testFormattingIntegration();

// testFormattingIntegrationの実用的な使用例
const result = instance.testFormattingIntegration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testCulturalAdaptation

**シグネチャ**:
```javascript
async testCulturalAdaptation()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testCulturalAdaptation();

// testCulturalAdaptationの実用的な使用例
const result = instance.testCulturalAdaptation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testRTLIntegration

**シグネチャ**:
```javascript
async testRTLIntegration()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testRTLIntegration();

// testRTLIntegrationの実用的な使用例
const result = instance.testRTLIntegration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testLanguageSwitching

**シグネチャ**:
```javascript
async testLanguageSwitching()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testLanguageSwitching();

// testLanguageSwitchingの実用的な使用例
const result = instance.testLanguageSwitching(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const lang of languages)
```

**パラメーター**:
- `const lang of languages`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const lang of languages);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

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

#### testPerformanceIntegration

**シグネチャ**:
```javascript
async testPerformanceIntegration()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testPerformanceIntegration();

// testPerformanceIntegrationの実用的な使用例
const result = instance.testPerformanceIntegration(/* 適切なパラメータ */);
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

#### for

複数言語の読み込み

**シグネチャ**:
```javascript
 for (const lang of ['ja', 'en', 'zh-CN', 'ko'])
```

**パラメーター**:
- `const lang of ['ja'`
- `'en'`
- `'zh-CN'`
- `'ko']`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const lang of ['ja', 'en', 'zh-CN', 'ko']);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testErrorHandling

**シグネチャ**:
```javascript
async testErrorHandling()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testErrorHandling();

// testErrorHandlingの実用的な使用例
const result = instance.testErrorHandling(/* 適切なパラメータ */);
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

#### testMemoryManagement

**シグネチャ**:
```javascript
async testMemoryManagement()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testMemoryManagement();

// testMemoryManagementの実用的な使用例
const result = instance.testMemoryManagement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

キャッシュを満杯にする

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

メモリクリーンアップを実行

**シグネチャ**:
```javascript
 if (typeof this.localizationManager.clearCache === 'function')
```

**パラメーター**:
- `typeof this.localizationManager.clearCache === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof this.localizationManager.clearCache === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testConcurrentOperations

**シグネチャ**:
```javascript
async testConcurrentOperations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testConcurrentOperations();

// testConcurrentOperationsの実用的な使用例
const result = instance.testConcurrentOperations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

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

#### setupTestEnvironment

**シグネチャ**:
```javascript
async setupTestEnvironment()
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

#### cleanupTestEnvironment

**シグネチャ**:
```javascript
async cleanupTestEnvironment()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanupTestEnvironment();

// cleanupTestEnvironmentの実用的な使用例
const result = instance.cleanupTestEnvironment(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

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

#### if

キャッシュクリア

**シグネチャ**:
```javascript
 if (typeof this.localizationManager.clearCache === 'function')
```

**パラメーター**:
- `typeof this.localizationManager.clearCache === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof this.localizationManager.clearCache === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runSingleTest

**シグネチャ**:
```javascript
async runSingleTest(name, testFunction)
```

**パラメーター**:
- `name`
- `testFunction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runSingleTest(name, testFunction);

// runSingleTestの実用的な使用例
const result = instance.runSingleTest(/* 適切なパラメータ */);
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

#### assert

**シグネチャ**:
```javascript
 assert(condition, message)
```

**パラメーター**:
- `condition`
- `message`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.assert(condition, message);

// assertの実用的な使用例
const result = instance.assert(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!condition)
```

**パラメーター**:
- `!condition`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!condition);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getMemoryUsage

**シグネチャ**:
```javascript
 getMemoryUsage()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMemoryUsage();

// getMemoryUsageの実用的な使用例
const result = instance.getMemoryUsage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

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

#### for

各スイートの結果を追加

**シグネチャ**:
```javascript
 for (const [suiteName, results] of this.testResults)
```

**パラメーター**:
- `const [suiteName`
- `results] of this.testResults`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [suiteName, results] of this.testResults);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

推奨事項を生成

**シグネチャ**:
```javascript
 if (this.testStats.failedTests > 0)
```

**パラメーター**:
- `this.testStats.failedTests > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.testStats.failedTests > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.testStats.passedTests / this.testStats.totalTests < 0.95)
```

**パラメーター**:
- `this.testStats.passedTests / this.testStats.totalTests < 0.95`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.testStats.passedTests / this.testStats.totalTests < 0.95);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTestSummary

**シグネチャ**:
```javascript
 getTestSummary()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTestSummary();

// getTestSummaryの実用的な使用例
const result = instance.getTestSummary(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createGameEngineMock

モック作成ヘルパー

**シグネチャ**:
```javascript
 createGameEngineMock()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createGameEngineMock();

// createGameEngineMockの実用的な使用例
const result = instance.createGameEngineMock(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createSettingsManagerMock

**シグネチャ**:
```javascript
 createSettingsManagerMock()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSettingsManagerMock();

// createSettingsManagerMockの実用的な使用例
const result = instance.createSettingsManagerMock(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createDOMElementMock

**シグネチャ**:
```javascript
 createDOMElementMock()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createDOMElementMock();

// createDOMElementMockの実用的な使用例
const result = instance.createDOMElementMock(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runSpecificSuite

**シグネチャ**:
```javascript
async runSpecificSuite(suiteName, options = {})
```

**パラメーター**:
- `suiteName`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runSpecificSuite(suiteName, options = {});

// runSpecificSuiteの実用的な使用例
const result = instance.runSpecificSuite(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTestResults

**シグネチャ**:
```javascript
 getTestResults()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTestResults();

// getTestResultsの実用的な使用例
const result = instance.getTestResults(/* 適切なパラメータ */);
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

## getSystemIntegrationTester

**シグネチャ**:
```javascript
getSystemIntegrationTester()
```

**使用例**:
```javascript
const result = getSystemIntegrationTester();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `suiteResults` | 説明なし |
| `passed` | 説明なし |
| `failed` | 説明なし |
| `report` | 説明なし |
| `testFunction` | 説明なし |
| `startTime` | 説明なし |
| `results` | 説明なし |
| `suiteResults` | 説明なし |
| `results` | 説明なし |
| `translation` | 説明なし |
| `key` | 説明なし |
| `firstCall` | 説明なし |
| `secondCall` | 説明なし |
| `result` | 説明なし |
| `translation` | 説明なし |
| `results` | 説明なし |
| `success` | 説明なし |
| `commonTrans` | 説明なし |
| `gameTrans` | 説明なし |
| `translation` | 説明なし |
| `results` | 説明なし |
| `singular` | 説明なし |
| `plural` | 説明なし |
| `casual` | 説明なし |
| `formal` | 説明なし |
| `numberExpression` | 説明なし |
| `query` | 説明なし |
| `results` | 説明なし |
| `results` | 説明なし |
| `success` | 説明なし |
| `element` | 説明なし |
| `adapted` | 説明なし |
| `element` | 説明なし |
| `adapted` | 説明なし |
| `validation` | 説明なし |
| `results` | 説明なし |
| `isRTL` | 説明なし |
| `isLTR` | 説明なし |
| `arabicDirection` | 説明なし |
| `englishDirection` | 説明なし |
| `hasRTL` | 説明なし |
| `controlChars` | 説明なし |
| `results` | 説明なし |
| `languages` | 説明なし |
| `success` | 説明なし |
| `currentLang` | 説明なし |
| `switches` | 説明なし |
| `lang` | 説明なし |
| `results` | 説明なし |
| `successCount` | 説明なし |
| `englishTranslation` | 説明なし |
| `japaneseTranslation` | 説明なし |
| `results` | 説明なし |
| `startTime` | 説明なし |
| `endTime` | 説明なし |
| `duration` | 説明なし |
| `startTime` | 説明なし |
| `endTime` | 説明なし |
| `duration` | 説明なし |
| `initialMemory` | 説明なし |
| `finalMemory` | 説明なし |
| `memoryIncrease` | 説明なし |
| `results` | 説明なし |
| `translation` | 説明なし |
| `result` | 説明なし |
| `results` | 説明なし |
| `initialStats` | 説明なし |
| `clearedStats` | 説明なし |
| `results` | 説明なし |
| `promises` | 説明なし |
| `results` | 説明なし |
| `allSame` | 説明なし |
| `languages` | 説明なし |
| `promises` | 説明なし |
| `results` | 説明なし |
| `successCount` | 説明なし |
| `container` | 説明なし |
| `container` | 説明なし |
| `startTime` | 説明なし |
| `duration` | 説明なし |
| `successRate` | 説明なし |
| `report` | 説明なし |
| `passed` | 説明なし |
| `failed` | 説明なし |
| `avgDuration` | 説明なし |
| `element` | 説明なし |

---

