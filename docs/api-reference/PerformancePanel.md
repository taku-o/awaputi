# PerformancePanel

## 概要

ファイル: `debug/panels/PerformancePanel.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [PerformancePanel](#performancepanel)
## 定数
- [panelElement](#panelelement)
- [style](#style)
- [canvas](#canvas)
- [chart](#chart)
- [startBtn](#startbtn)
- [stopBtn](#stopbtn)
- [componentSelect](#componentselect)
- [component](#component)
- [results](#results)
- [metrics](#metrics)
- [stats](#stats)
- [fpsElement](#fpselement)
- [frameTimeElement](#frametimeelement)
- [memoryElement](#memoryelement)
- [drawCallsElement](#drawcallselement)
- [particlesElement](#particleselement)
- [effectsElement](#effectselement)
- [thresholds](#thresholds)
- [alerts](#alerts)
- [fpsWarning](#fpswarning)
- [fpsCritical](#fpscritical)
- [memoryWarning](#memorywarning)
- [memoryCritical](#memorycritical)
- [button](#button)
- [style](#style)

---

## PerformancePanel

### コンストラクタ

```javascript
new PerformancePanel(gameEngine, debugInterface, options = {})
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `debugInterface` | 説明なし |
| `options` | 説明なし |
| `monitor` | パフォーマンスモニター |
| `charts` | チャート管理 |
| `chartConfig` | 説明なし |
| `container` | UI要素 |
| `statsContainer` | 説明なし |
| `chartsContainer` | 説明なし |
| `alertsContainer` | 説明なし |
| `profilingContainer` | 説明なし |
| `isActive` | 状態 |
| `updateInterval` | 説明なし |
| `container` | コンテナの参照を保存 |
| `statsContainer` | 説明なし |
| `chartsContainer` | 説明なし |
| `alertsContainer` | 説明なし |
| `profilingContainer` | 説明なし |
| `isActive` | 説明なし |
| `isActive` | 説明なし |
| `updateInterval` | 説明なし |
| `updateInterval` | 説明なし |

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

#### createUI

**シグネチャ**:
```javascript
 createUI()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createUI();

// createUIの実用的な使用例
const result = instance.createUI(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addStyles

**シグネチャ**:
```javascript
 addStyles()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addStyles();

// addStylesの実用的な使用例
const result = instance.addStyles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### not

**シグネチャ**:
```javascript
 not(:disabled)
```

**パラメーター**:
- `:disabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.not(:disabled);

// notの実用的な使用例
const result = instance.not(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupCharts

**シグネチャ**:
```javascript
 setupCharts()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupCharts();

// setupChartsの実用的な使用例
const result = instance.setupCharts(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (canvas)
```

**パラメーター**:
- `canvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(canvas);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

**シグネチャ**:
```javascript
 if (results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(results);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupAlertCallbacks

**シグネチャ**:
```javascript
 setupAlertCallbacks()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupAlertCallbacks();

// setupAlertCallbacksの実用的な使用例
const result = instance.setupAlertCallbacks(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### show

**シグネチャ**:
```javascript
 show()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.show();

// showの実用的な使用例
const result = instance.show(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hide

**シグネチャ**:
```javascript
 hide()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hide();

// hideの実用的な使用例
const result = instance.hide(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### activate

**シグネチャ**:
```javascript
 activate()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.activate();

// activateの実用的な使用例
const result = instance.activate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### deactivate

**シグネチャ**:
```javascript
 deactivate()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.deactivate();

// deactivateの実用的な使用例
const result = instance.deactivate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startUpdating

**シグネチャ**:
```javascript
 startUpdating()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startUpdating();

// startUpdatingの実用的な使用例
const result = instance.startUpdating(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stopUpdating

**シグネチャ**:
```javascript
 stopUpdating()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopUpdating();

// stopUpdatingの実用的な使用例
const result = instance.stopUpdating(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.updateInterval)
```

**パラメーター**:
- `this.updateInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.updateInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateStats

**シグネチャ**:
```javascript
 updateStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateStats();

// updateStatsの実用的な使用例
const result = instance.updateStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (fpsElement)
```

**パラメーター**:
- `fpsElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fpsElement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (frameTimeElement)
```

**パラメーター**:
- `frameTimeElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(frameTimeElement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (memoryElement)
```

**パラメーター**:
- `memoryElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(memoryElement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (drawCallsElement)
```

**パラメーター**:
- `drawCallsElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(drawCallsElement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (particlesElement)
```

**パラメーター**:
- `particlesElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particlesElement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (effectsElement)
```

**パラメーター**:
- `effectsElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(effectsElement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateStatClass

**シグネチャ**:
```javascript
 updateStatClass(element, metric, value)
```

**パラメーター**:
- `element`
- `metric`
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateStatClass(element, metric, value);

// updateStatClassの実用的な使用例
const result = instance.updateStatClass(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (metric === 'fps')
```

**パラメーター**:
- `metric === 'fps'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(metric === 'fps');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

FPSは低い値が問題

**シグネチャ**:
```javascript
 if (value < thresholds.critical)
```

**パラメーター**:
- `value < thresholds.critical`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value < thresholds.critical);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value < thresholds.warning)
```

**パラメーター**:
- `value < thresholds.warning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value < thresholds.warning);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

その他は高い値が問題

**シグネチャ**:
```javascript
 if (value > thresholds.critical)
```

**パラメーター**:
- `value > thresholds.critical`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value > thresholds.critical);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value > thresholds.warning)
```

**パラメーター**:
- `value > thresholds.warning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value > thresholds.warning);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateAlerts

**シグネチャ**:
```javascript
 updateAlerts()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateAlerts();

// updateAlertsの実用的な使用例
const result = instance.updateAlerts(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (alerts.length === 0)
```

**パラメーター**:
- `alerts.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(alerts.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### displayAlert

**シグネチャ**:
```javascript
 displayAlert(alert)
```

**パラメーター**:
- `alert`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.displayAlert(alert);

// displayAlertの実用的な使用例
const result = instance.displayAlert(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### displayProfilingResults

**シグネチャ**:
```javascript
 displayProfilingResults(results)
```

**パラメーター**:
- `results`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.displayProfilingResults(results);

// displayProfilingResultsの実用的な使用例
const result = instance.displayProfilingResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyThresholds

**シグネチャ**:
```javascript
 applyThresholds()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyThresholds();

// applyThresholdsの実用的な使用例
const result = instance.applyThresholds(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getState

**シグネチャ**:
```javascript
 getState()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getState();

// getStateの実用的な使用例
const result = instance.getState(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setState

**シグネチャ**:
```javascript
 setState(state)
```

**パラメーター**:
- `state`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setState(state);

// setStateの実用的な使用例
const result = instance.setState(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (state.thresholds)
```

**パラメーター**:
- `state.thresholds`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(state.thresholds);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (state.thresholds.fps)
```

**パラメーター**:
- `state.thresholds.fps`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(state.thresholds.fps);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (state.thresholds.memory)
```

**パラメーター**:
- `state.thresholds.memory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(state.thresholds.memory);

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

**シグネチャ**:
```javascript
 if (chart.destroy)
```

**パラメーター**:
- `chart.destroy`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(chart.destroy);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

モニターのクリーンアップ

**シグネチャ**:
```javascript
 if (this.monitor)
```

**パラメーター**:
- `this.monitor`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.monitor);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (style)
```

**パラメーター**:
- `style`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(style);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `panelElement` | 説明なし |
| `style` | 説明なし |
| `canvas` | 説明なし |
| `chart` | 説明なし |
| `startBtn` | 説明なし |
| `stopBtn` | 説明なし |
| `componentSelect` | 説明なし |
| `component` | 説明なし |
| `results` | 説明なし |
| `metrics` | 説明なし |
| `stats` | 説明なし |
| `fpsElement` | 説明なし |
| `frameTimeElement` | 説明なし |
| `memoryElement` | 説明なし |
| `drawCallsElement` | 説明なし |
| `particlesElement` | 説明なし |
| `effectsElement` | 説明なし |
| `thresholds` | 説明なし |
| `alerts` | 説明なし |
| `fpsWarning` | 説明なし |
| `fpsCritical` | 説明なし |
| `memoryWarning` | 説明なし |
| `memoryCritical` | 説明なし |
| `button` | 説明なし |
| `style` | 説明なし |

---

