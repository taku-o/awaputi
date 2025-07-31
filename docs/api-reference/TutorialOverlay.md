# TutorialOverlay

## 概要

ファイル: `core/help/TutorialOverlay.js`  
最終更新: 2025/7/31 8:13:42

## 目次

## クラス
- [TutorialOverlay](#tutorialoverlay)
## 関数
- [getTutorialOverlay()](#gettutorialoverlay)
- [reinitializeTutorialOverlay()](#reinitializetutorialoverlay)
## 定数
- [step](#step)
- [step](#step)
- [prevButton](#prevbutton)
- [skipButton](#skipbutton)
- [nextButton](#nextbutton)
- [helpButton](#helpbutton)
- [button](#button)
- [baseStyle](#basestyle)
- [primaryColor](#primarycolor)
- [progressFill](#progressfill)
- [progressFill](#progressfill)
- [progress](#progress)
- [targetElement](#targetelement)
- [rect](#rect)
- [step](#step)
- [errorPanel](#errorpanel)
- [retryButton](#retrybutton)
- [skipButton](#skipbutton)
- [timeoutPanel](#timeoutpanel)
- [retryButton](#retrybutton)
- [continueButton](#continuebutton)
- [windowWidth](#windowwidth)
- [windowHeight](#windowheight)
- [panelWidth](#panelwidth)
- [targetElement](#targetelement)
- [rect](#rect)
- [focusableElements](#focusableelements)
- [firstElement](#firstelement)
- [lastElement](#lastelement)
- [styles](#styles)
- [styles](#styles)
- [styleElement](#styleelement)

---

## TutorialOverlay

**継承元**: `BaseDialog`

### コンストラクタ

```javascript
new TutorialOverlay(gameEngine, eventBus, state)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `loggingSystem` | 説明なし |
| `currentTutorial` | チュートリアル固有プロパティ |
| `currentStep` | 説明なし |
| `stepIndex` | 説明なし |
| `totalSteps` | 説明なし |
| `overlay` | UI要素 |
| `instructionPanel` | 説明なし |
| `navigationPanel` | 説明なし |
| `progressBar` | 説明なし |
| `highlightElement` | 説明なし |
| `spotlight` | 説明なし |
| `animationConfig` | アニメーション設定 |
| `layout` | レイアウト設定 |
| `styles` | スタイル設定 |
| `boundHandlers` | イベントハンドラー |
| `currentTutorial` | 説明なし |
| `currentStep` | 説明なし |
| `stepIndex` | 説明なし |
| `totalSteps` | 説明なし |
| `currentStep` | 説明なし |
| `stepIndex` | 説明なし |
| `overlay` | 説明なし |
| `instructionPanel` | 説明なし |

### メソッド

#### initialize

**シグネチャ**:
```javascript
async initialize(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initialize(options = {});

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

#### showTutorial

**シグネチャ**:
```javascript
async showTutorial(tutorial, step, stepIndex)
```

**パラメーター**:
- `tutorial`
- `step`
- `stepIndex`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showTutorial(tutorial, step, stepIndex);

// showTutorialの実用的な使用例
const result = instance.showTutorial(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

要素のハイライト

**シグネチャ**:
```javascript
 if (step.targetElement)
```

**パラメーター**:
- `step.targetElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(step.targetElement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スポットライト効果

**シグネチャ**:
```javascript
 if (step.spotlight)
```

**パラメーター**:
- `step.spotlight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(step.spotlight);

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

#### hideTutorial

**シグネチャ**:
```javascript
 hideTutorial()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hideTutorial();

// hideTutorialの実用的な使用例
const result = instance.hideTutorial(/* 適切なパラメータ */);
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

#### updateStep

**シグネチャ**:
```javascript
 updateStep(step, stepIndex)
```

**パラメーター**:
- `step`
- `stepIndex`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateStep(step, stepIndex);

// updateStepの実用的な使用例
const result = instance.updateStep(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (step.targetElement)
```

**パラメーター**:
- `step.targetElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(step.targetElement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (step.spotlight)
```

**パラメーター**:
- `step.spotlight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(step.spotlight);

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

#### createOverlay

**シグネチャ**:
```javascript
 createOverlay()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createOverlay();

// createOverlayの実用的な使用例
const result = instance.createOverlay(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createInstructionPanel

**シグネチャ**:
```javascript
 createInstructionPanel()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createInstructionPanel();

// createInstructionPanelの実用的な使用例
const result = instance.createInstructionPanel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getTutorialOverlay

**シグネチャ**:
```javascript
getTutorialOverlay(gameEngine, eventBus, state)
```

**パラメーター**:
- `gameEngine`
- `eventBus`
- `state`

**使用例**:
```javascript
const result = getTutorialOverlay(gameEngine, eventBus, state);
```

---

## reinitializeTutorialOverlay

**シグネチャ**:
```javascript
reinitializeTutorialOverlay(gameEngine, eventBus, state)
```

**パラメーター**:
- `gameEngine`
- `eventBus`
- `state`

**使用例**:
```javascript
const result = reinitializeTutorialOverlay(gameEngine, eventBus, state);
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `step` | 説明なし |
| `step` | 説明なし |
| `prevButton` | 説明なし |
| `skipButton` | 説明なし |
| `nextButton` | 説明なし |
| `helpButton` | 説明なし |
| `button` | 説明なし |
| `baseStyle` | 説明なし |
| `primaryColor` | 説明なし |
| `progressFill` | 説明なし |
| `progressFill` | 説明なし |
| `progress` | 説明なし |
| `targetElement` | 説明なし |
| `rect` | 説明なし |
| `step` | 説明なし |
| `errorPanel` | 説明なし |
| `retryButton` | 説明なし |
| `skipButton` | 説明なし |
| `timeoutPanel` | 説明なし |
| `retryButton` | 説明なし |
| `continueButton` | 説明なし |
| `windowWidth` | 説明なし |
| `windowHeight` | 説明なし |
| `panelWidth` | 説明なし |
| `targetElement` | 説明なし |
| `rect` | 説明なし |
| `focusableElements` | 説明なし |
| `firstElement` | 説明なし |
| `lastElement` | 説明なし |
| `styles` | 説明なし |
| `styles` | 説明なし |
| `styleElement` | 説明なし |

---

