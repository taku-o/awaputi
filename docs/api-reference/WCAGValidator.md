# WCAGValidator

## 概要

ファイル: `accessibility/WCAGValidator.js`  
最終更新: 2025/7/29 0:51:16

## 目次

## クラス
- [WCAGValidator](#wcagvalidator)
## 定数
- [startTime](#starttime)
- [categoryResults](#categoryresults)
- [endTime](#endtime)
- [validationTime](#validationtime)
- [categoryResults](#categoryresults)
- [guidelineResults](#guidelineresults)
- [totalTests](#totaltests)
- [results](#results)
- [testResult](#testresult)
- [testMethods](#testmethods)
- [testMethod](#testmethod)
- [issues](#issues)
- [warnings](#warnings)
- [images](#images)
- [alt](#alt)
- [src](#src)
- [canvases](#canvases)
- [hasLabel](#haslabel)
- [issues](#issues)
- [warnings](#warnings)
- [textElements](#textelements)
- [styles](#styles)
- [textContent](#textcontent)
- [color](#color)
- [backgroundColor](#backgroundcolor)
- [fontSize](#fontsize)
- [fontWeight](#fontweight)
- [contrast](#contrast)
- [isLargeText](#islargetext)
- [requiredContrast](#requiredcontrast)
- [issues](#issues)
- [warnings](#warnings)
- [focusableElements](#focusableelements)
- [tabIndex](#tabindex)
- [hasClickHandler](#hasclickhandler)
- [hasKeyHandler](#haskeyhandler)
- [customControls](#customcontrols)
- [issues](#issues)
- [warnings](#warnings)
- [formControls](#formcontrols)
- [id](#id)
- [ariaLabel](#arialabel)
- [ariaLabelledBy](#arialabelledby)
- [label](#label)
- [ariaElements](#ariaelements)
- [role](#role)
- [ariaRequired](#ariarequired)
- [rgb1](#rgb1)
- [rgb2](#rgb2)
- [l1](#l1)
- [l2](#l2)
- [lighter](#lighter)
- [darker](#darker)
- [rgbMatch](#rgbmatch)
- [hexMatch](#hexmatch)
- [hex](#hex)
- [rsRGB](#rsrgb)
- [gsRGB](#gsrgb)
- [bsRGB](#bsrgb)
- [rLinear](#rlinear)
- [gLinear](#glinear)
- [bLinear](#blinear)
- [requiredProps](#requiredprops)
- [levels](#levels)
- [configLevel](#configlevel)
- [guidelineLevel](#guidelinelevel)
- [categories](#categories)
- [totalScore](#totalscore)
- [quickTests](#quicktests)
- [results](#results)
- [testResult](#testresult)
- [now](#now)
- [score](#score)
- [thirtyDaysAgo](#thirtydaysago)
- [current](#current)
- [previous](#previous)
- [scoreDiff](#scorediff)
- [trend](#trend)
- [historyEntry](#historyentry)
- [saved](#saved)
- [data](#data)
- [cutoff](#cutoff)
- [element](#element)
- [text](#text)

---

## WCAGValidator

### コンストラクタ

```javascript
new WCAGValidator(accessibilityManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `accessibilityManager` | 説明なし |
| `gameEngine` | 説明なし |
| `config` | WCAG検証設定 |
| `guidelines` | WCAG 2.1ガイドライン定義 |
| `results` | テスト結果とスコア |
| `monitoring` | リアルタイム監視 |
| `stats` | 統計情報 |

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

#### if

初回検証の実行

**シグネチャ**:
```javascript
 if (this.config.enabled)
```

**パラメーター**:
- `this.config.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.enabled);

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

#### runFullValidation

**シグネチャ**:
```javascript
async runFullValidation()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runFullValidation();

// runFullValidationの実用的な使用例
const result = instance.runFullValidation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

レポート生成

**シグネチャ**:
```javascript
 if (this.config.reportGeneration)
```

**パラメーター**:
- `this.config.reportGeneration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.reportGeneration);

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

#### validateCategory

**シグネチャ**:
```javascript
async validateCategory(category, guidelines)
```

**パラメーター**:
- `category`
- `guidelines`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateCategory(category, guidelines);

// validateCategoryの実用的な使用例
const result = instance.validateCategory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### validateGuideline

**シグネチャ**:
```javascript
async validateGuideline(category, guidelineId, guideline)
```

**パラメーター**:
- `category`
- `guidelineId`
- `guideline`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateGuideline(category, guidelineId, guideline);

// validateGuidelineの実用的な使用例
const result = instance.validateGuideline(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const testName of guideline.tests)
```

**パラメーター**:
- `const testName of guideline.tests`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const testName of guideline.tests);

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
 if (testResult.warnings)
```

**パラメーター**:
- `testResult.warnings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(testResult.warnings);

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

#### runTest

**シグネチャ**:
```javascript
async runTest(testName, level)
```

**パラメーター**:
- `testName`
- `level`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runTest(testName, level);

// runTestの実用的な使用例
const result = instance.runTest(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!testMethod)
```

**パラメーター**:
- `!testMethod`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!testMethod);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testAltText

**シグネチャ**:
```javascript
 testAltText()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testAltText();

// testAltTextの実用的な使用例
const result = instance.testAltText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Alt属性の存在チェック

**シグネチャ**:
```javascript
 if (alt === null)
```

**パラメーター**:
- `alt === null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(alt === null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (alt && alt.length > 125)
```

**パラメーター**:
- `alt && alt.length > 125`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(alt && alt.length > 125);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!hasLabel)
```

**パラメーター**:
- `!hasLabel`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!hasLabel);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testColorContrast

**シグネチャ**:
```javascript
 testColorContrast()
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

#### if

**シグネチャ**:
```javascript
 if (color && backgroundColor)
```

**パラメーター**:
- `color && backgroundColor`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(color && backgroundColor);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

AA レベル

**シグネチャ**:
```javascript
 if (contrast < requiredContrast)
```

**パラメーター**:
- `contrast < requiredContrast`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(contrast < requiredContrast);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (contrast < requiredContrast * 1.2)
```

**パラメーター**:
- `contrast < requiredContrast * 1.2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(contrast < requiredContrast * 1.2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testKeyboardNavigation

**シグネチャ**:
```javascript
 testKeyboardNavigation()
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

#### testNameRoleValue

**シグネチャ**:
```javascript
 testNameRoleValue()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testNameRoleValue();

// testNameRoleValueの実用的な使用例
const result = instance.testNameRoleValue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!ariaLabel && !ariaLabelledBy && !label)
```

**パラメーター**:
- `!ariaLabel && !ariaLabelledBy && !label`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!ariaLabel && !ariaLabelledBy && !label);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateContrastRatio

**シグネチャ**:
```javascript
 calculateContrastRatio(color1, color2)
```

**パラメーター**:
- `color1`
- `color2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateContrastRatio(color1, color2);

// calculateContrastRatioの実用的な使用例
const result = instance.calculateContrastRatio(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### parseColor

**シグネチャ**:
```javascript
 parseColor(colorStr)
```

**パラメーター**:
- `colorStr`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.parseColor(colorStr);

// parseColorの実用的な使用例
const result = instance.parseColor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rgbMatch)
```

**パラメーター**:
- `rgbMatch`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rgbMatch);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (hexMatch)
```

**パラメーター**:
- `hexMatch`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hexMatch);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (hex.length === 3)
```

**パラメーター**:
- `hex.length === 3`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hex.length === 3);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRelativeLuminance

**シグネチャ**:
```javascript
 getRelativeLuminance(rgb)
```

**パラメーター**:
- `rgb`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRelativeLuminance(rgb);

// getRelativeLuminanceの実用的な使用例
const result = instance.getRelativeLuminance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRequiredAriaProperties

**シグネチャ**:
```javascript
 getRequiredAriaProperties(role)
```

**パラメーター**:
- `role`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRequiredAriaProperties(role);

// getRequiredAriaPropertiesの実用的な使用例
const result = instance.getRequiredAriaProperties(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### shouldRunGuideline

**シグネチャ**:
```javascript
 shouldRunGuideline(level)
```

**パラメーター**:
- `level`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.shouldRunGuideline(level);

// shouldRunGuidelineの実用的な使用例
const result = instance.shouldRunGuideline(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateOverallScore

**シグネチャ**:
```javascript
 calculateOverallScore(categoryResults)
```

**パラメーター**:
- `categoryResults`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateOverallScore(categoryResults);

// calculateOverallScoreの実用的な使用例
const result = instance.calculateOverallScore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (categories.length === 0)
```

**パラメーター**:
- `categories.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(categories.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupRealTimeMonitoring

**シグネチャ**:
```javascript
 setupRealTimeMonitoring()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupRealTimeMonitoring();

// setupRealTimeMonitoringの実用的な使用例
const result = instance.setupRealTimeMonitoring(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (shouldRevalidate)
```

**パラメーター**:
- `shouldRevalidate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(shouldRevalidate);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### scheduleRevalidation

**シグネチャ**:
```javascript
 scheduleRevalidation()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.scheduleRevalidation();

// scheduleRevalidationの実用的な使用例
const result = instance.scheduleRevalidation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.monitoring.revalidationTimeout)
```

**パラメーター**:
- `this.monitoring.revalidationTimeout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.monitoring.revalidationTimeout);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runQuickValidation

**シグネチャ**:
```javascript
async runQuickValidation()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runQuickValidation();

// runQuickValidationの実用的な使用例
const result = instance.runQuickValidation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const testName of quickTests)
```

**パラメーター**:
- `const testName of quickTests`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const testName of quickTests);

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
 if (testResult.warnings)
```

**パラメーター**:
- `testResult.warnings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(testResult.warnings);

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

新しい問題が見つかった場合のみ通知

**シグネチャ**:
```javascript
 if (results.issues.length > 0)
```

**パラメーター**:
- `results.issues.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(results.issues.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateTrends

**シグネチャ**:
```javascript
 updateTrends()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateTrends();

// updateTrendsの実用的な使用例
const result = instance.updateTrends(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

改善/悪化の検出

**シグネチャ**:
```javascript
 if (this.results.trends.weekly.length >= 2)
```

**パラメーター**:
- `this.results.trends.weekly.length >= 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.results.trends.weekly.length >= 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (scoreDiff > 0)
```

**パラメーター**:
- `scoreDiff > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scoreDiff > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### saveValidationResults

**シグネチャ**:
```javascript
 saveValidationResults()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveValidationResults();

// saveValidationResultsの実用的な使用例
const result = instance.saveValidationResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴を最新50件に制限

**シグネチャ**:
```javascript
 if (this.results.history.length > 50)
```

**パラメーター**:
- `this.results.history.length > 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.results.history.length > 50);

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

#### loadValidationHistory

**シグネチャ**:
```javascript
 loadValidationHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadValidationHistory();

// loadValidationHistoryの実用的な使用例
const result = instance.loadValidationHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (saved)
```

**パラメーター**:
- `saved`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(saved);

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

#### bindEvents

**シグネチャ**:
```javascript
 bindEvents()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.bindEvents();

// bindEventsの実用的な使用例
const result = instance.bindEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ページ読み込み完了後の検証

**シグネチャ**:
```javascript
 if (document.readyState === 'loading')
```

**パラメーター**:
- `document.readyState === 'loading'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(document.readyState === 'loading');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲームイベントでの検証

**シグネチャ**:
```javascript
 if (this.gameEngine)
```

**パラメーター**:
- `this.gameEngine`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setValidationLevel

**シグネチャ**:
```javascript
 setValidationLevel(level)
```

**パラメーター**:
- `level`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setValidationLevel(level);

// setValidationLevelの実用的な使用例
const result = instance.setValidationLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### toggleRealTimeValidation

**シグネチャ**:
```javascript
 toggleRealTimeValidation(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toggleRealTimeValidation(enabled);

// toggleRealTimeValidationの実用的な使用例
const result = instance.toggleRealTimeValidation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (enabled && !this.monitoring.enabled)
```

**パラメーター**:
- `enabled && !this.monitoring.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(enabled && !this.monitoring.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!enabled && this.monitoring.enabled)
```

**パラメーター**:
- `!enabled && this.monitoring.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!enabled && this.monitoring.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getValidationResults

**シグネチャ**:
```javascript
 getValidationResults()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getValidationResults();

// getValidationResultsの実用的な使用例
const result = instance.getValidationResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getScoreHistory

**シグネチャ**:
```javascript
 getScoreHistory(days = 30)
```

**パラメーター**:
- `days = 30`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getScoreHistory(days = 30);

// getScoreHistoryの実用的な使用例
const result = instance.getScoreHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### autoFixIssues

**シグネチャ**:
```javascript
async autoFixIssues()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.autoFixIssues();

// autoFixIssuesの実用的な使用例
const result = instance.autoFixIssues(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.config.autoFix)
```

**パラメーター**:
- `!this.config.autoFix`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.config.autoFix);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const failedTest of this.results.failedTests)
```

**パラメーター**:
- `const failedTest of this.results.failedTests`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const failedTest of this.results.failedTests);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const issue of failedTest.issues)
```

**パラメーター**:
- `const issue of failedTest.issues`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const issue of failedTest.issues);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (fixedCount > 0)
```

**パラメーター**:
- `fixedCount > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fixedCount > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### tryAutoFix

**シグネチャ**:
```javascript
async tryAutoFix(issue)
```

**パラメーター**:
- `issue`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.tryAutoFix(issue);

// tryAutoFixの実用的な使用例
const result = instance.tryAutoFix(/* 適切なパラメータ */);
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

#### applyConfig

**シグネチャ**:
```javascript
 applyConfig(config)
```

**パラメーター**:
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyConfig(config);

// applyConfigの実用的な使用例
const result = instance.applyConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.wcag)
```

**パラメーター**:
- `config.wcag`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.wcag);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.wcag.realTimeValidation !== undefined)
```

**パラメーター**:
- `config.wcag.realTimeValidation !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.wcag.realTimeValidation !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(enabled);

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

#### if

監視の停止

**シグネチャ**:
```javascript
 if (this.monitoring.mutationObserver)
```

**パラメーター**:
- `this.monitoring.mutationObserver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.monitoring.mutationObserver);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.monitoring.revalidationTimeout)
```

**パラメーター**:
- `this.monitoring.revalidationTimeout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.monitoring.revalidationTimeout);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `startTime` | 説明なし |
| `categoryResults` | 説明なし |
| `endTime` | 説明なし |
| `validationTime` | 説明なし |
| `categoryResults` | 説明なし |
| `guidelineResults` | 説明なし |
| `totalTests` | 説明なし |
| `results` | 説明なし |
| `testResult` | 説明なし |
| `testMethods` | 説明なし |
| `testMethod` | 説明なし |
| `issues` | 説明なし |
| `warnings` | 説明なし |
| `images` | 説明なし |
| `alt` | 説明なし |
| `src` | 説明なし |
| `canvases` | 説明なし |
| `hasLabel` | 説明なし |
| `issues` | 説明なし |
| `warnings` | 説明なし |
| `textElements` | 説明なし |
| `styles` | 説明なし |
| `textContent` | 説明なし |
| `color` | 説明なし |
| `backgroundColor` | 説明なし |
| `fontSize` | 説明なし |
| `fontWeight` | 説明なし |
| `contrast` | 説明なし |
| `isLargeText` | 説明なし |
| `requiredContrast` | 説明なし |
| `issues` | 説明なし |
| `warnings` | 説明なし |
| `focusableElements` | 説明なし |
| `tabIndex` | 説明なし |
| `hasClickHandler` | 説明なし |
| `hasKeyHandler` | 説明なし |
| `customControls` | 説明なし |
| `issues` | 説明なし |
| `warnings` | 説明なし |
| `formControls` | 説明なし |
| `id` | 説明なし |
| `ariaLabel` | 説明なし |
| `ariaLabelledBy` | 説明なし |
| `label` | 説明なし |
| `ariaElements` | 説明なし |
| `role` | 説明なし |
| `ariaRequired` | 説明なし |
| `rgb1` | 説明なし |
| `rgb2` | 説明なし |
| `l1` | 説明なし |
| `l2` | 説明なし |
| `lighter` | 説明なし |
| `darker` | 説明なし |
| `rgbMatch` | 説明なし |
| `hexMatch` | 説明なし |
| `hex` | 説明なし |
| `rsRGB` | 説明なし |
| `gsRGB` | 説明なし |
| `bsRGB` | 説明なし |
| `rLinear` | 説明なし |
| `gLinear` | 説明なし |
| `bLinear` | 説明なし |
| `requiredProps` | 説明なし |
| `levels` | 説明なし |
| `configLevel` | 説明なし |
| `guidelineLevel` | 説明なし |
| `categories` | 説明なし |
| `totalScore` | 説明なし |
| `quickTests` | 説明なし |
| `results` | 説明なし |
| `testResult` | 説明なし |
| `now` | 説明なし |
| `score` | 説明なし |
| `thirtyDaysAgo` | 説明なし |
| `current` | 説明なし |
| `previous` | 説明なし |
| `scoreDiff` | 説明なし |
| `trend` | 説明なし |
| `historyEntry` | 説明なし |
| `saved` | 説明なし |
| `data` | 説明なし |
| `cutoff` | 説明なし |
| `element` | 説明なし |
| `text` | 説明なし |

---

