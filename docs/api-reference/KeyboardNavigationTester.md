# KeyboardNavigationTester

## 概要

ファイル: `accessibility/KeyboardNavigationTester.js`  
最終更新: 2025/7/29 0:51:16

## 目次

## クラス
- [KeyboardNavigationTester](#keyboardnavigationtester)
## 定数
- [startTime](#starttime)
- [endTime](#endtime)
- [testTime](#testtime)
- [suiteResults](#suiteresults)
- [suiteStartTime](#suitestarttime)
- [testResult](#testresult)
- [totalTests](#totaltests)
- [testKey](#testkey)
- [testMethod](#testmethod)
- [testStartTime](#teststarttime)
- [result](#result)
- [testEndTime](#testendtime)
- [testMethods](#testmethods)
- [issues](#issues)
- [warnings](#warnings)
- [focusableElements](#focusableelements)
- [tabOrder](#taborder)
- [tabIndex](#tabindex)
- [computedTabIndex](#computedtabindex)
- [logicalOrderIssues](#logicalorderissues)
- [issues](#issues)
- [warnings](#warnings)
- [focusableElements](#focusableelements)
- [focusIndicator](#focusindicator)
- [issues](#issues)
- [warnings](#warnings)
- [modals](#modals)
- [containmentResult](#containmentresult)
- [focusableInModal](#focusableinmodal)
- [firstFocusable](#firstfocusable)
- [lastFocusable](#lastfocusable)
- [shiftTabEvent](#shifttabevent)
- [focusMovedToLast](#focusmovedtolast)
- [tabEvent](#tabevent)
- [focusMovedToFirst](#focusmovedtofirst)
- [issues](#issues)
- [warnings](#warnings)
- [focusableElements](#focusableelements)
- [currentElement](#currentelement)
- [expectedNextElement](#expectednextelement)
- [tabEvent](#tabevent)
- [eventResult](#eventresult)
- [issues](#issues)
- [warnings](#warnings)
- [escapableElements](#escapableelements)
- [hasEscapeRoute](#hasescaperoute)
- [escapeEvent](#escapeevent)
- [initialVisibility](#initialvisibility)
- [finalVisibility](#finalvisibility)
- [hasCloseButton](#hasclosebutton)
- [issues](#issues)
- [warnings](#warnings)
- [elementsWithAccessKey](#elementswithaccesskey)
- [elementsWithShortcuts](#elementswithshortcuts)
- [shortcutsFound](#shortcutsfound)
- [accessKey](#accesskey)
- [shortcut](#shortcut)
- [shortcut](#shortcut)
- [issues](#issues)
- [warnings](#warnings)
- [ariaControls](#ariacontrols)
- [role](#role)
- [hasKeyboardHandler](#haskeyboardhandler)
- [requiredStates](#requiredstates)
- [issues](#issues)
- [warnings](#warnings)
- [canvases](#canvases)
- [hasKeyboardHandler](#haskeyboardhandler)
- [isFocusable](#isfocusable)
- [hasAccessibleName](#hasaccessiblename)
- [gameControls](#gamecontrols)
- [hasKeyboardSupport](#haskeyboardsupport)
- [selector](#selector)
- [elements](#elements)
- [styles](#styles)
- [styles](#styles)
- [focusStyles](#focusstyles)
- [hasOutline](#hasoutline)
- [hasBoxShadow](#hasboxshadow)
- [hasBackgroundChange](#hasbackgroundchange)
- [visible](#visible)
- [issues](#issues)
- [current](#current)
- [next](#next)
- [position](#position)
- [elementHTML](#elementhtml)
- [nativelyAccessible](#nativelyaccessible)
- [interactiveRoles](#interactiveroles)
- [role](#role)
- [styles](#styles)
- [requiredStates](#requiredstates)
- [focusableElements](#focusableelements)
- [previousElement](#previouselement)
- [currentElement](#currentelement)
- [shortcut](#shortcut)
- [parts](#parts)
- [suiteScores](#suitescores)
- [totalPassed](#totalpassed)
- [totalFailed](#totalfailed)
- [totalWarnings](#totalwarnings)
- [recommendations](#recommendations)
- [report](#report)
- [validDepths](#validdepths)

---

## KeyboardNavigationTester

### コンストラクタ

```javascript
new KeyboardNavigationTester(accessibilityManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `accessibilityManager` | 説明なし |
| `gameEngine` | 説明なし |
| `config` | テスト設定 |
| `testSuites` | キーボードナビゲーションテスト項目 |
| `keyCodes` | キーコード定義 |
| `browserShortcuts` | 標準ブラウザショートカット |
| `results` | テスト結果 |
| `focusTracking` | フォーカス追跡 |
| `monitoring` | イベント監視 |
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

#### runFullTest

**シグネチャ**:
```javascript
async runFullTest()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runFullTest();

// runFullTestの実用的な使用例
const result = instance.runFullTest(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

レポート生成

**シグネチャ**:
```javascript
 if (this.config.generateReport)
```

**パラメーター**:
- `this.config.generateReport`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.generateReport);

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
async runTestSuite(suiteId, suite)
```

**パラメーター**:
- `suiteId`
- `suite`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runTestSuite(suiteId, suite);

// runTestSuiteの実用的な使用例
const result = instance.runTestSuite(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const testName of suite.tests)
```

**パラメーター**:
- `const testName of suite.tests`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const testName of suite.tests);

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

#### runIndividualTest

**シグネチャ**:
```javascript
async runIndividualTest(suiteId, testName)
```

**パラメーター**:
- `suiteId`
- `testName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runIndividualTest(suiteId, testName);

// runIndividualTestの実用的な使用例
const result = instance.runIndividualTest(/* 適切なパラメータ */);
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

#### getTestMethod

**シグネチャ**:
```javascript
 getTestMethod(testKey)
```

**パラメーター**:
- `testKey`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTestMethod(testKey);

// getTestMethodの実用的な使用例
const result = instance.getTestMethod(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testTabOrder

**シグネチャ**:
```javascript
async testTabOrder()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testTabOrder();

// testTabOrderの実用的な使用例
const result = instance.testTabOrder(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testFocusVisibility

**シグネチャ**:
```javascript
async testFocusVisibility()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testFocusVisibility();

// testFocusVisibilityの実用的な使用例
const result = instance.testFocusVisibility(/* 適切なパラメータ */);
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
 if (!focusIndicator.visible)
```

**パラメーター**:
- `!focusIndicator.visible`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!focusIndicator.visible);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (focusIndicator.contrast < 3.0)
```

**パラメーター**:
- `focusIndicator.contrast < 3.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(focusIndicator.contrast < 3.0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testFocusContainment

**シグネチャ**:
```javascript
async testFocusContainment()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testFocusContainment();

// testFocusContainmentの実用的な使用例
const result = instance.testFocusContainment(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const modal of modals)
```

**パラメーター**:
- `const modal of modals`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const modal of modals);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!containmentResult.passed)
```

**パラメーター**:
- `!containmentResult.passed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!containmentResult.passed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testModalFocusContainment

**シグネチャ**:
```javascript
async testModalFocusContainment(modal)
```

**パラメーター**:
- `modal`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testModalFocusContainment(modal);

// testModalFocusContainmentの実用的な使用例
const result = instance.testModalFocusContainment(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (focusableInModal.length === 0)
```

**パラメーター**:
- `focusableInModal.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(focusableInModal.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testModalTraps

**シグネチャ**:
```javascript
async testModalTraps()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testModalTraps();

// testModalTrapsの実用的な使用例
const result = instance.testModalTraps(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < focusableElements.length - 1; i++)
```

**パラメーター**:
- `let i = 0; i < focusableElements.length - 1; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < focusableElements.length - 1; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フォーカスが次の要素に移動したかチェック

**シグネチャ**:
```javascript
 if (document.activeElement === currentElement && eventResult)
```

**パラメーター**:
- `document.activeElement === currentElement && eventResult`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(document.activeElement === currentElement && eventResult);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testEscapeRoutes

**シグネチャ**:
```javascript
async testEscapeRoutes()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testEscapeRoutes();

// testEscapeRoutesの実用的な使用例
const result = instance.testEscapeRoutes(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const element of escapableElements)
```

**パラメーター**:
- `const element of escapableElements`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const element of escapableElements);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!hasEscapeRoute)
```

**パラメーター**:
- `!hasEscapeRoute`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!hasEscapeRoute);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testElementEscapeRoute

**シグネチャ**:
```javascript
async testElementEscapeRoute(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testElementEscapeRoute(element);

// testElementEscapeRouteの実用的な使用例
const result = instance.testElementEscapeRoute(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testBrowserConflicts

**シグネチャ**:
```javascript
async testBrowserConflicts()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testBrowserConflicts();

// testBrowserConflictsの実用的な使用例
const result = instance.testBrowserConflicts(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.browserShortcuts[shortcut])
```

**パラメーター**:
- `this.browserShortcuts[shortcut]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.browserShortcuts[shortcut]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testAriaControls

**シグネチャ**:
```javascript
async testAriaControls()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testAriaControls();

// testAriaControlsの実用的な使用例
const result = instance.testAriaControls(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const control of ariaControls)
```

**パラメーター**:
- `const control of ariaControls`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const control of ariaControls);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!hasKeyboardHandler)
```

**パラメーター**:
- `!hasKeyboardHandler`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!hasKeyboardHandler);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const state of requiredStates)
```

**パラメーター**:
- `const state of requiredStates`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const state of requiredStates);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### testGameControls

**シグネチャ**:
```javascript
async testGameControls()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.testGameControls();

// testGameControlsの実用的な使用例
const result = instance.testGameControls(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const canvas of canvases)
```

**パラメーター**:
- `const canvas of canvases`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const canvas of canvases);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!isFocusable)
```

**パラメーター**:
- `!isFocusable`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!isFocusable);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!hasKeyboardHandler)
```

**パラメーター**:
- `!hasKeyboardHandler`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!hasKeyboardHandler);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!hasAccessibleName)
```

**パラメーター**:
- `!hasAccessibleName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!hasAccessibleName);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const control of gameControls)
```

**パラメーター**:
- `const control of gameControls`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const control of gameControls);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!hasKeyboardSupport)
```

**パラメーター**:
- `!hasKeyboardSupport`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!hasKeyboardSupport);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getFocusableElements

**シグネチャ**:
```javascript
 getFocusableElements()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getFocusableElements();

// getFocusableElementsの実用的な使用例
const result = instance.getFocusableElements(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isElementVisible

**シグネチャ**:
```javascript
 isElementVisible(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isElementVisible(element);

// isElementVisibleの実用的な使用例
const result = instance.isElementVisible(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!element.offsetParent && element.tagName !== 'BODY')
```

**パラメーター**:
- `!element.offsetParent && element.tagName !== 'BODY'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!element.offsetParent && element.tagName !== 'BODY');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectFocusIndicator

**シグネチャ**:
```javascript
 detectFocusIndicator(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectFocusIndicator(element);

// detectFocusIndicatorの実用的な使用例
const result = instance.detectFocusIndicator(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

デフォルト値

**シグネチャ**:
```javascript
 if (hasOutline && focusStyles.outlineColor)
```

**パラメーター**:
- `hasOutline && focusStyles.outlineColor`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hasOutline && focusStyles.outlineColor);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### estimateContrast

**シグネチャ**:
```javascript
 estimateContrast(color1, color2)
```

**パラメーター**:
- `color1`
- `color2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateContrast(color1, color2);

// estimateContrastの実用的な使用例
const result = instance.estimateContrast(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### validateLogicalTabOrder

**シグネチャ**:
```javascript
 validateLogicalTabOrder(tabOrder)
```

**パラメーター**:
- `tabOrder`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateLogicalTabOrder(tabOrder);

// validateLogicalTabOrderの実用的な使用例
const result = instance.validateLogicalTabOrder(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

DOM順序とタブ順序の比較

**シグネチャ**:
```javascript
 for (let i = 0; i < tabOrder.length - 1; i++)
```

**パラメーター**:
- `let i = 0; i < tabOrder.length - 1; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < tabOrder.length - 1; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (position & Node.DOCUMENT_POSITION_PRECEDING)
```

**パラメーター**:
- `position & Node.DOCUMENT_POSITION_PRECEDING`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(position & Node.DOCUMENT_POSITION_PRECEDING);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hasKeyboardEventHandler

**シグネチャ**:
```javascript
 hasKeyboardEventHandler(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hasKeyboardEventHandler(element);

// hasKeyboardEventHandlerの実用的な使用例
const result = instance.hasKeyboardEventHandler(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

onkeydown, onkeyup属性のチェック

**シグネチャ**:
```javascript
 if (element.onkeydown || element.onkeyup || element.onkeypress)
```

**パラメーター**:
- `element.onkeydown || element.onkeyup || element.onkeypress`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(element.onkeydown || element.onkeyup || element.onkeypress);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isNativelyKeyboardAccessible

**シグネチャ**:
```javascript
 isNativelyKeyboardAccessible(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isNativelyKeyboardAccessible(element);

// isNativelyKeyboardAccessibleの実用的な使用例
const result = instance.isNativelyKeyboardAccessible(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isInteractiveElement

**シグネチャ**:
```javascript
 isInteractiveElement(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isInteractiveElement(element);

// isInteractiveElementの実用的な使用例
const result = instance.isInteractiveElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

クリックハンドラーがある

**シグネチャ**:
```javascript
 if (element.onclick || element.addEventListener)
```

**パラメーター**:
- `element.onclick || element.addEventListener`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(element.onclick || element.addEventListener);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (styles.cursor === 'pointer')
```

**パラメーター**:
- `styles.cursor === 'pointer'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(styles.cursor === 'pointer');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRequiredAriaStates

**シグネチャ**:
```javascript
 getRequiredAriaStates(role)
```

**パラメーター**:
- `role`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRequiredAriaStates(role);

// getRequiredAriaStatesの実用的な使用例
const result = instance.getRequiredAriaStates(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### discoverKeyboardElements

**シグネチャ**:
```javascript
 discoverKeyboardElements()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.discoverKeyboardElements();

// discoverKeyboardElementsの実用的な使用例
const result = instance.discoverKeyboardElements(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startFocusTracking

**シグネチャ**:
```javascript
 startFocusTracking()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startFocusTracking();

// startFocusTrackingの実用的な使用例
const result = instance.startFocusTracking(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴を最新100件に制限

**シグネチャ**:
```javascript
 if (this.focusTracking.history.length > 100)
```

**パラメーター**:
- `this.focusTracking.history.length > 100`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.focusTracking.history.length > 100);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### handleKeyboardEvent

**シグネチャ**:
```javascript
 handleKeyboardEvent(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleKeyboardEvent(event);

// handleKeyboardEventの実用的な使用例
const result = instance.handleKeyboardEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Tabキーの追跡

**シグネチャ**:
```javascript
 if (event.key === 'Tab')
```

**パラメーター**:
- `event.key === 'Tab'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.key === 'Tab');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Escapeキーの追跡

**シグネチャ**:
```javascript
 if (event.key === 'Escape')
```

**パラメーター**:
- `event.key === 'Escape'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.key === 'Escape');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### trackTabNavigation

**シグネチャ**:
```javascript
 trackTabNavigation(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.trackTabNavigation(event);

// trackTabNavigationの実用的な使用例
const result = instance.trackTabNavigation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (previousElement && currentElement !== previousElement)
```

**パラメーター**:
- `previousElement && currentElement !== previousElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(previousElement && currentElement !== previousElement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### trackEscapeKeyUsage

**シグネチャ**:
```javascript
 trackEscapeKeyUsage(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.trackEscapeKeyUsage(event);

// trackEscapeKeyUsageの実用的な使用例
const result = instance.trackEscapeKeyUsage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordShortcutUsage

**シグネチャ**:
```javascript
 recordShortcutUsage(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordShortcutUsage(event);

// recordShortcutUsageの実用的な使用例
const result = instance.recordShortcutUsage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event.ctrlKey || event.altKey || event.metaKey)
```

**パラメーター**:
- `event.ctrlKey || event.altKey || event.metaKey`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.ctrlKey || event.altKey || event.metaKey);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### buildShortcutString

**シグネチャ**:
```javascript
 buildShortcutString(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.buildShortcutString(event);

// buildShortcutStringの実用的な使用例
const result = instance.buildShortcutString(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateOverallScore

**シグネチャ**:
```javascript
 calculateOverallScore()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateOverallScore();

// calculateOverallScoreの実用的な使用例
const result = instance.calculateOverallScore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateRecommendations

**シグネチャ**:
```javascript
 generateRecommendations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateRecommendations();

// generateRecommendationsの実用的な使用例
const result = instance.generateRecommendations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フォーカス管理の推奨事項

**シグネチャ**:
```javascript
 if (this.results.suiteResults.focusManagement?.score < 80)
```

**パラメーター**:
- `this.results.suiteResults.focusManagement?.score < 80`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.results.suiteResults.focusManagement?.score < 80);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

キーボードトラップの推奨事項

**シグネチャ**:
```javascript
 if (this.results.suiteResults.keyboardTraps?.failed > 0)
```

**パラメーター**:
- `this.results.suiteResults.keyboardTraps?.failed > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.results.suiteResults.keyboardTraps?.failed > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ショートカット競合の推奨事項

**シグネチャ**:
```javascript
 if (this.results.shortcutConflicts.length > 0)
```

**パラメーター**:
- `this.results.shortcutConflicts.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.results.shortcutConflicts.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateDetailedReport

**シグネチャ**:
```javascript
async generateDetailedReport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateDetailedReport();

// generateDetailedReportの実用的な使用例
const result = instance.generateDetailedReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setTestDepth

**シグネチャ**:
```javascript
 setTestDepth(depth)
```

**パラメーター**:
- `depth`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setTestDepth(depth);

// setTestDepthの実用的な使用例
const result = instance.setTestDepth(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getFocusHistory

**シグネチャ**:
```javascript
 getFocusHistory(limit = 50)
```

**パラメーター**:
- `limit = 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getFocusHistory(limit = 50);

// getFocusHistoryの実用的な使用例
const result = instance.getFocusHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getNavigationStats

**シグネチャ**:
```javascript
 getNavigationStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getNavigationStats();

// getNavigationStatsの実用的な使用例
const result = instance.getNavigationStats(/* 適切なパラメータ */);
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
 if (config.keyboardTesting)
```

**パラメーター**:
- `config.keyboardTesting`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.keyboardTesting);

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

#### if

**シグネチャ**:
```javascript
 if (this.config.autoTest)
```

**パラメーター**:
- `this.config.autoTest`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.autoTest);

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

イベントリスナーの削除

**シグネチャ**:
```javascript
 if (this.monitoring.keydownListener)
```

**パラメーター**:
- `this.monitoring.keydownListener`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.monitoring.keydownListener);

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
| `endTime` | 説明なし |
| `testTime` | 説明なし |
| `suiteResults` | 説明なし |
| `suiteStartTime` | 説明なし |
| `testResult` | 説明なし |
| `totalTests` | 説明なし |
| `testKey` | 説明なし |
| `testMethod` | 説明なし |
| `testStartTime` | 説明なし |
| `result` | 説明なし |
| `testEndTime` | 説明なし |
| `testMethods` | 説明なし |
| `issues` | 説明なし |
| `warnings` | 説明なし |
| `focusableElements` | 説明なし |
| `tabOrder` | 説明なし |
| `tabIndex` | 説明なし |
| `computedTabIndex` | 説明なし |
| `logicalOrderIssues` | 説明なし |
| `issues` | 説明なし |
| `warnings` | 説明なし |
| `focusableElements` | 説明なし |
| `focusIndicator` | 説明なし |
| `issues` | 説明なし |
| `warnings` | 説明なし |
| `modals` | 説明なし |
| `containmentResult` | 説明なし |
| `focusableInModal` | 説明なし |
| `firstFocusable` | 説明なし |
| `lastFocusable` | 説明なし |
| `shiftTabEvent` | 説明なし |
| `focusMovedToLast` | 説明なし |
| `tabEvent` | 説明なし |
| `focusMovedToFirst` | 説明なし |
| `issues` | 説明なし |
| `warnings` | 説明なし |
| `focusableElements` | 説明なし |
| `currentElement` | 説明なし |
| `expectedNextElement` | 説明なし |
| `tabEvent` | 説明なし |
| `eventResult` | 説明なし |
| `issues` | 説明なし |
| `warnings` | 説明なし |
| `escapableElements` | 説明なし |
| `hasEscapeRoute` | 説明なし |
| `escapeEvent` | 説明なし |
| `initialVisibility` | 説明なし |
| `finalVisibility` | 説明なし |
| `hasCloseButton` | 説明なし |
| `issues` | 説明なし |
| `warnings` | 説明なし |
| `elementsWithAccessKey` | 説明なし |
| `elementsWithShortcuts` | 説明なし |
| `shortcutsFound` | 説明なし |
| `accessKey` | 説明なし |
| `shortcut` | 説明なし |
| `shortcut` | 説明なし |
| `issues` | 説明なし |
| `warnings` | 説明なし |
| `ariaControls` | 説明なし |
| `role` | 説明なし |
| `hasKeyboardHandler` | 説明なし |
| `requiredStates` | 説明なし |
| `issues` | 説明なし |
| `warnings` | 説明なし |
| `canvases` | 説明なし |
| `hasKeyboardHandler` | 説明なし |
| `isFocusable` | 説明なし |
| `hasAccessibleName` | 説明なし |
| `gameControls` | 説明なし |
| `hasKeyboardSupport` | 説明なし |
| `selector` | 説明なし |
| `elements` | 説明なし |
| `styles` | 説明なし |
| `styles` | 説明なし |
| `focusStyles` | 説明なし |
| `hasOutline` | 説明なし |
| `hasBoxShadow` | 説明なし |
| `hasBackgroundChange` | 説明なし |
| `visible` | 説明なし |
| `issues` | 説明なし |
| `current` | 説明なし |
| `next` | 説明なし |
| `position` | 説明なし |
| `elementHTML` | 説明なし |
| `nativelyAccessible` | 説明なし |
| `interactiveRoles` | 説明なし |
| `role` | 説明なし |
| `styles` | 説明なし |
| `requiredStates` | 説明なし |
| `focusableElements` | 説明なし |
| `previousElement` | 説明なし |
| `currentElement` | 説明なし |
| `shortcut` | 説明なし |
| `parts` | 説明なし |
| `suiteScores` | 説明なし |
| `totalPassed` | 説明なし |
| `totalFailed` | 説明なし |
| `totalWarnings` | 説明なし |
| `recommendations` | 説明なし |
| `report` | 説明なし |
| `validDepths` | 説明なし |

---

