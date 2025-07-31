# ErrorRecoveryManager

## 概要

ファイル: `core/ErrorRecoveryManager.js`  
最終更新: 2025/7/29 0:51:16

## 目次

## クラス
- [ErrorRecoveryManager](#errorrecoverymanager)
## 定数
- [savedConfig](#savedconfig)
- [parsed](#parsed)
- [savedHistory](#savedhistory)
- [parsed](#parsed)
- [savedStates](#savedstates)
- [dialog](#dialog)
- [styles](#styles)
- [styleSheet](#stylesheet)
- [action](#action)
- [dialog](#dialog)
- [confirmStyles](#confirmstyles)
- [styleSheet](#stylesheet)
- [banner](#banner)
- [warningStyles](#warningstyles)
- [styleSheet](#stylesheet)
- [undoBtn](#undobtn)
- [redoBtn](#redobtn)
- [undoRedoStyles](#undoredostyles)
- [styleSheet](#stylesheet)
- [panel](#panel)
- [recoveryStyles](#recoverystyles)
- [styleSheet](#stylesheet)
- [gameState](#gamestate)
- [gameState](#gamestate)
- [currentFPS](#currentfps)
- [memoryUsage](#memoryusage)
- [now](#now)
- [timeWindow](#timewindow)
- [recentErrors](#recenterrors)
- [message](#message)
- [errorInfo](#errorinfo)
- [typeKey](#typekey)
- [currentCount](#currentcount)
- [element](#element)
- [now](#now)
- [criticalClasses](#criticalclasses)
- [currentAction](#currentaction)
- [action](#action)
- [action](#action)
- [dialog](#dialog)
- [errorType](#errortype)
- [retryBtn](#retrybtn)
- [undoBtn](#undobtn)
- [continueBtn](#continuebtn)
- [firstButton](#firstbutton)
- [dialog](#dialog)
- [actionName](#actionname)
- [warningText](#warningtext)
- [warningDiv](#warningdiv)
- [cancelBtn](#cancelbtn)
- [proceedBtn](#proceedbtn)
- [newCancelBtn](#newcancelbtn)
- [newProceedBtn](#newproceedbtn)
- [banner](#banner)
- [feedback](#feedback)
- [historyData](#historydata)

---

## ErrorRecoveryManager

### コンストラクタ

```javascript
new ErrorRecoveryManager(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `isInitialized` | 説明なし |
| `config` | 設定とエラー処理オプション |
| `errorTypes` | エラータイプの定義 |
| `state` | 状態管理 |
| `undoRedoSystem` | undo/redo システム |
| `autoSaveSystem` | 自動保存システム |
| `warningSystem` | 警告システム |
| `ui` | UI要素 |
| `boundHandlers` | イベントリスナー |
| `isInitialized` | 説明なし |
| `config` | 説明なし |

### メソッド

#### initialize

**シグネチャ**:
```javascript
async initialize()
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

自動保存システムの開始

**シグネチャ**:
```javascript
 if (this.config.recovery.autoSave)
```

**パラメーター**:
- `this.config.recovery.autoSave`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.recovery.autoSave);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

アクセシビリティマネージャーとの統合

**シグネチャ**:
```javascript
 if (this.gameEngine.accessibilityManager)
```

**パラメーター**:
- `this.gameEngine.accessibilityManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.accessibilityManager);

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

#### loadConfiguration

**シグネチャ**:
```javascript
async loadConfiguration()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadConfiguration();

// loadConfigurationの実用的な使用例
const result = instance.loadConfiguration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (savedConfig)
```

**パラメーター**:
- `savedConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(savedConfig);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (savedHistory)
```

**パラメーター**:
- `savedHistory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(savedHistory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Mapオブジェクトの復元

**シグネチャ**:
```javascript
 if (parsed.errorCount.byType)
```

**パラメーター**:
- `parsed.errorCount.byType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(parsed.errorCount.byType);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (savedStates)
```

**パラメーター**:
- `savedStates`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(savedStates);

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

#### createErrorRecoveryUI

**シグネチャ**:
```javascript
 createErrorRecoveryUI()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createErrorRecoveryUI();

// createErrorRecoveryUIの実用的な使用例
const result = instance.createErrorRecoveryUI(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createErrorDialog

**シグネチャ**:
```javascript
 createErrorDialog()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createErrorDialog();

// createErrorDialogの実用的な使用例
const result = instance.createErrorDialog(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyErrorDialogStyles

**シグネチャ**:
```javascript
 applyErrorDialogStyles(dialog)
```

**パラメーター**:
- `dialog`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyErrorDialogStyles(dialog);

// applyErrorDialogStylesの実用的な使用例
const result = instance.applyErrorDialogStyles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupErrorDialogEvents

**シグネチャ**:
```javascript
 setupErrorDialogEvents(dialog)
```

**パラメーター**:
- `dialog`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupErrorDialogEvents(dialog);

// setupErrorDialogEventsの実用的な使用例
const result = instance.setupErrorDialogEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (e.key === 'Escape')
```

**パラメーター**:
- `e.key === 'Escape'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(e.key === 'Escape');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createConfirmDialog

**シグネチャ**:
```javascript
 createConfirmDialog()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createConfirmDialog();

// createConfirmDialogの実用的な使用例
const result = instance.createConfirmDialog(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createWarningBanner

**シグネチャ**:
```javascript
 createWarningBanner()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createWarningBanner();

// createWarningBannerの実用的な使用例
const result = instance.createWarningBanner(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createUndoRedoButtons

**シグネチャ**:
```javascript
 createUndoRedoButtons()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createUndoRedoButtons();

// createUndoRedoButtonsの実用的な使用例
const result = instance.createUndoRedoButtons(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRecoveryPanel

**シグネチャ**:
```javascript
 createRecoveryPanel()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRecoveryPanel();

// createRecoveryPanelの実用的な使用例
const result = instance.createRecoveryPanel(/* 適切なパラメータ */);
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

#### if

ゲームエンジンイベント

**シグネチャ**:
```javascript
 if (this.gameEngine.eventEmitter)
```

**パラメーター**:
- `this.gameEngine.eventEmitter`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.eventEmitter);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startAutoSave

**シグネチャ**:
```javascript
 startAutoSave()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startAutoSave();

// startAutoSaveの実用的な使用例
const result = instance.startAutoSave(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.autoSaveSystem.timer)
```

**パラメーター**:
- `this.autoSaveSystem.timer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.autoSaveSystem.timer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performAutoSave

**シグネチャ**:
```javascript
 performAutoSave()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performAutoSave();

// performAutoSaveの実用的な使用例
const result = instance.performAutoSave(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最大保存数を超えた場合、古いものを削除

**シグネチャ**:
```javascript
 if (this.autoSaveSystem.savePoints.length > this.autoSaveSystem.maxSavePoints)
```

**パラメーター**:
- `this.autoSaveSystem.savePoints.length > this.autoSaveSystem.maxSavePoints`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.autoSaveSystem.savePoints.length > this.autoSaveSystem.maxSavePoints);

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

#### captureGameState

**シグネチャ**:
```javascript
 captureGameState()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.captureGameState();

// captureGameStateの実用的な使用例
const result = instance.captureGameState(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲームエンジンから状態を取得

**シグネチャ**:
```javascript
 if (this.gameEngine.gameState)
```

**パラメーター**:
- `this.gameEngine.gameState`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.gameState);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

プレイヤーデータ

**シグネチャ**:
```javascript
 if (this.gameEngine.playerData)
```

**パラメーター**:
- `this.gameEngine.playerData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.playerData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

シーン状態

**シグネチャ**:
```javascript
 if (this.gameEngine.sceneManager)
```

**パラメーター**:
- `this.gameEngine.sceneManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.sceneManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

設定

**シグネチャ**:
```javascript
 if (this.gameEngine.settingsManager)
```

**パラメーター**:
- `this.gameEngine.settingsManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.settingsManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### saveSavePoints

**シグネチャ**:
```javascript
 saveSavePoints()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveSavePoints();

// saveSavePointsの実用的な使用例
const result = instance.saveSavePoints(/* 適切なパラメータ */);
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

#### startErrorMonitoring

**シグネチャ**:
```javascript
 startErrorMonitoring()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startErrorMonitoring();

// startErrorMonitoringの実用的な使用例
const result = instance.startErrorMonitoring(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パフォーマンス監視

**シグネチャ**:
```javascript
 if (this.gameEngine.performanceManager)
```

**パラメーター**:
- `this.gameEngine.performanceManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.performanceManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkPerformanceIssues

**シグネチャ**:
```javascript
 checkPerformanceIssues()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkPerformanceIssues();

// checkPerformanceIssuesの実用的な使用例
const result = instance.checkPerformanceIssues(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

FPSが低い場合

**シグネチャ**:
```javascript
 if (currentFPS < 30)
```

**パラメーター**:
- `currentFPS < 30`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentFPS < 30);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メモリ使用量が高い場合

**シグネチャ**:
```javascript
 if (memoryUsage > 100 * 1024 * 1024)
```

**パラメーター**:
- `memoryUsage > 100 * 1024 * 1024`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(memoryUsage > 100 * 1024 * 1024);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkErrorFrequency

**シグネチャ**:
```javascript
 checkErrorFrequency()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkErrorFrequency();

// checkErrorFrequencyの実用的な使用例
const result = instance.checkErrorFrequency(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

閾値を超えた場合

**シグネチャ**:
```javascript
 if (recentErrors.length >= this.warningSystem.thresholds.errorFrequency)
```

**パラメーター**:
- `recentErrors.length >= this.warningSystem.thresholds.errorFrequency`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(recentErrors.length >= this.warningSystem.thresholds.errorFrequency);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleBeforeUnload

**シグネチャ**:
```javascript
 handleBeforeUnload(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleBeforeUnload(event);

// handleBeforeUnloadの実用的な使用例
const result = instance.handleBeforeUnload(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hasUnsavedChanges

**シグネチャ**:
```javascript
 hasUnsavedChanges()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hasUnsavedChanges();

// hasUnsavedChangesの実用的な使用例
const result = instance.hasUnsavedChanges(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲーム進行中かチェック

**シグネチャ**:
```javascript
 if (this.gameEngine.gameState?.playing)
```

**パラメーター**:
- `this.gameEngine.gameState?.playing`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.gameState?.playing);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

未保存のスコアがあるかチェック

**シグネチャ**:
```javascript
 if (this.gameEngine.gameState?.score > 0 && !this.gameEngine.gameState?.saved)
```

**パラメーター**:
- `this.gameEngine.gameState?.score > 0 && !this.gameEngine.gameState?.saved`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.gameState?.score > 0 && !this.gameEngine.gameState?.saved);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleError

**シグネチャ**:
```javascript
 handleError(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleError(event);

// handleErrorの実用的な使用例
const result = instance.handleError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.config.enabled && errorInfo.severity !== 'low')
```

**パラメーター**:
- `this.config.enabled && errorInfo.severity !== 'low'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.enabled && errorInfo.severity !== 'low');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeError

**シグネチャ**:
```javascript
 analyzeError(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeError(event);

// analyzeErrorの実用的な使用例
const result = instance.analyzeError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

エラーの種類を判定

**シグネチャ**:
```javascript
 if (event.type)
```

**パラメーター**:
- `event.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.type);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event.error)
```

**パラメーター**:
- `event.error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.error);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event.reason)
```

**パラメーター**:
- `event.reason`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.reason);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordError

**シグネチャ**:
```javascript
 recordError(errorInfo)
```

**パラメーター**:
- `errorInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordError(errorInfo);

// recordErrorの実用的な使用例
const result = instance.recordError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最大履歴数を制限

**シグネチャ**:
```javascript
 if (this.state.errorHistory.length > 100)
```

**パラメーター**:
- `this.state.errorHistory.length > 100`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.state.errorHistory.length > 100);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleKeydown

**シグネチャ**:
```javascript
 handleKeydown(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleKeydown(event);

// handleKeydownの実用的な使用例
const result = instance.handleKeydown(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Ctrl+Z で Undo

**シグネチャ**:
```javascript
 if (event.ctrlKey && event.key === 'z' && !event.shiftKey)
```

**パラメーター**:
- `event.ctrlKey && event.key === 'z' && !event.shiftKey`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.ctrlKey && event.key === 'z' && !event.shiftKey);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event.key === 'F9')
```

**パラメーター**:
- `event.key === 'F9'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.key === 'F9');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleClick

**シグネチャ**:
```javascript
 handleClick(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleClick(event);

// handleClickの実用的な使用例
const result = instance.handleClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ダブルクリック防止

**シグネチャ**:
```javascript
 if (this.config.prevention.doubleClickPrevention > 0)
```

**パラメーター**:
- `this.config.prevention.doubleClickPrevention > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.prevention.doubleClickPrevention > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (element._lastClickTime && 
                now - element._lastClickTime < this.config.prevention.doubleClickPrevention)
```

**パラメーター**:
- `element._lastClickTime && 
                now - element._lastClickTime < this.config.prevention.doubleClickPrevention`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(element._lastClickTime && 
                now - element._lastClickTime < this.config.prevention.doubleClickPrevention);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### shouldConfirmAction

**シグネチャ**:
```javascript
 shouldConfirmAction(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.shouldConfirmAction(element);

// shouldConfirmActionの実用的な使用例
const result = instance.shouldConfirmAction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleGameAction

**シグネチャ**:
```javascript
 handleGameAction(action)
```

**パラメーター**:
- `action`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleGameAction(action);

// handleGameActionの実用的な使用例
const result = instance.handleGameAction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!action.confirmed)
```

**パラメーター**:
- `!action.confirmed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!action.confirmed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordAction

**シグネチャ**:
```javascript
 recordAction(action)
```

**パラメーター**:
- `action`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordAction(action);

// recordActionの実用的な使用例
const result = instance.recordAction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

現在位置以降の履歴を削除（新しいブランチの開始）

**シグネチャ**:
```javascript
 if (this.undoRedoSystem.currentIndex < this.undoRedoSystem.actionHistory.length - 1)
```

**パラメーター**:
- `this.undoRedoSystem.currentIndex < this.undoRedoSystem.actionHistory.length - 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.undoRedoSystem.currentIndex < this.undoRedoSystem.actionHistory.length - 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最大履歴数を制限

**シグネチャ**:
```javascript
 if (this.undoRedoSystem.actionHistory.length > this.undoRedoSystem.maxHistory)
```

**パラメーター**:
- `this.undoRedoSystem.actionHistory.length > this.undoRedoSystem.maxHistory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.undoRedoSystem.actionHistory.length > this.undoRedoSystem.maxHistory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentAction)
```

**パラメーター**:
- `currentAction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentAction);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### undo

**シグネチャ**:
```javascript
 undo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.undo();

// undoの実用的な使用例
const result = instance.undo(/* 適切なパラメータ */);
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

#### redo

**シグネチャ**:
```javascript
 redo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.redo();

// redoの実用的な使用例
const result = instance.redo(/* 適切なパラメータ */);
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

#### canUndo

**シグネチャ**:
```javascript
 canUndo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.canUndo();

// canUndoの実用的な使用例
const result = instance.canUndo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### canRedo

**シグネチャ**:
```javascript
 canRedo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.canRedo();

// canRedoの実用的な使用例
const result = instance.canRedo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateUndoRedoButtons

**シグネチャ**:
```javascript
 updateUndoRedoButtons()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateUndoRedoButtons();

// updateUndoRedoButtonsの実用的な使用例
const result = instance.updateUndoRedoButtons(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.ui.undoButton)
```

**パラメーター**:
- `this.ui.undoButton`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.ui.undoButton);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.ui.redoButton)
```

**パラメーター**:
- `this.ui.redoButton`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.ui.redoButton);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### restoreGameState

**シグネチャ**:
```javascript
 restoreGameState(state)
```

**パラメーター**:
- `state`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.restoreGameState(state);

// restoreGameStateの実用的な使用例
const result = instance.restoreGameState(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲーム状態の復元

**シグネチャ**:
```javascript
 if (state.game && this.gameEngine.gameState)
```

**パラメーター**:
- `state.game && this.gameEngine.gameState`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(state.game && this.gameEngine.gameState);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

プレイヤーデータの復元

**シグネチャ**:
```javascript
 if (state.player && this.gameEngine.playerData)
```

**パラメーター**:
- `state.player && this.gameEngine.playerData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(state.player && this.gameEngine.playerData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

シーン状態の復元

**シグネチャ**:
```javascript
 if (state.scene && this.gameEngine.sceneManager)
```

**パラメーター**:
- `state.scene && this.gameEngine.sceneManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(state.scene && this.gameEngine.sceneManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

設定の復元

**シグネチャ**:
```javascript
 if (state.settings && this.gameEngine.settingsManager)
```

**パラメーター**:
- `state.settings && this.gameEngine.settingsManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(state.settings && this.gameEngine.settingsManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

UIを更新

**シグネチャ**:
```javascript
 if (this.gameEngine.render)
```

**パラメーター**:
- `this.gameEngine.render`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.render);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showErrorDialog

**シグネチャ**:
```javascript
 showErrorDialog(errorInfo)
```

**パラメーター**:
- `errorInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showErrorDialog(errorInfo);

// showErrorDialogの実用的な使用例
const result = instance.showErrorDialog(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (firstButton)
```

**パラメーター**:
- `firstButton`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(firstButton);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hideErrorDialog

**シグネチャ**:
```javascript
 hideErrorDialog()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hideErrorDialog();

// hideErrorDialogの実用的な使用例
const result = instance.hideErrorDialog(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showConfirmDialog

**シグネチャ**:
```javascript
 showConfirmDialog(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showConfirmDialog(element);

// showConfirmDialogの実用的な使用例
const result = instance.showConfirmDialog(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (warningText)
```

**パラメーター**:
- `warningText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(warningText);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hideConfirmDialog

**シグネチャ**:
```javascript
 hideConfirmDialog()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hideConfirmDialog();

// hideConfirmDialogの実用的な使用例
const result = instance.hideConfirmDialog(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getActionWarning

**シグネチャ**:
```javascript
 getActionWarning(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getActionWarning(element);

// getActionWarningの実用的な使用例
const result = instance.getActionWarning(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### executeConfirmedAction

**シグネチャ**:
```javascript
 executeConfirmedAction(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.executeConfirmedAction(element);

// executeConfirmedActionの実用的な使用例
const result = instance.executeConfirmedAction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showWarning

**シグネチャ**:
```javascript
 showWarning(warning)
```

**パラメーター**:
- `warning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showWarning(warning);

// showWarningの実用的な使用例
const result = instance.showWarning(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hideWarningBanner

**シグネチャ**:
```javascript
 hideWarningBanner()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hideWarningBanner();

// hideWarningBannerの実用的な使用例
const result = instance.hideWarningBanner(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleWarningAction

**シグネチャ**:
```javascript
 handleWarningAction()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleWarningAction();

// handleWarningActionの実用的な使用例
const result = instance.handleWarningAction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showRecoveryPanel

**シグネチャ**:
```javascript
 showRecoveryPanel()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showRecoveryPanel();

// showRecoveryPanelの実用的な使用例
const result = instance.showRecoveryPanel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hideRecoveryPanel

**シグネチャ**:
```javascript
 hideRecoveryPanel()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hideRecoveryPanel();

// hideRecoveryPanelの実用的な使用例
const result = instance.hideRecoveryPanel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleErrorAction

**シグネチャ**:
```javascript
 handleErrorAction(action)
```

**パラメーター**:
- `action`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleErrorAction(action);

// handleErrorActionの実用的な使用例
const result = instance.handleErrorAction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (action)
```

**パラメーター**:
- `action`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(action);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### retryLastAction

**シグネチャ**:
```javascript
 retryLastAction()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.retryLastAction();

// retryLastActionの実用的な使用例
const result = instance.retryLastAction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showUndoFeedback

**シグネチャ**:
```javascript
 showUndoFeedback(message)
```

**パラメーター**:
- `message`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showUndoFeedback(message);

// showUndoFeedbackの実用的な使用例
const result = instance.showUndoFeedback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleStateChange

他のメソッドは省略（基本的な機能のみ実装）

**シグネチャ**:
```javascript
 handleStateChange(state)
```

**パラメーター**:
- `state`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleStateChange(state);

// handleStateChangeの実用的な使用例
const result = instance.handleStateChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleGameError

**シグネチャ**:
```javascript
 handleGameError(error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleGameError(error);

// handleGameErrorの実用的な使用例
const result = instance.handleGameError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleBubblePopped

**シグネチャ**:
```javascript
 handleBubblePopped(bubble)
```

**パラメーター**:
- `bubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleBubblePopped(bubble);

// handleBubblePoppedの実用的な使用例
const result = instance.handleBubblePopped(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleComboBreak

**シグネチャ**:
```javascript
 handleComboBreak()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleComboBreak();

// handleComboBreakの実用的な使用例
const result = instance.handleComboBreak(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### requestActionConfirmation

**シグネチャ**:
```javascript
 requestActionConfirmation(action)
```

**パラメーター**:
- `action`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.requestActionConfirmation(action);

// requestActionConfirmationの実用的な使用例
const result = instance.requestActionConfirmation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### saveErrorHistory

**シグネチャ**:
```javascript
 saveErrorHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveErrorHistory();

// saveErrorHistoryの実用的な使用例
const result = instance.saveErrorHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### integrateWithAccessibilityManager

**シグネチャ**:
```javascript
 integrateWithAccessibilityManager()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.integrateWithAccessibilityManager();

// integrateWithAccessibilityManagerの実用的な使用例
const result = instance.integrateWithAccessibilityManager(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### emitEvent

**シグネチャ**:
```javascript
 emitEvent(eventName, data)
```

**パラメーター**:
- `eventName`
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.emitEvent(eventName, data);

// emitEventの実用的な使用例
const result = instance.emitEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.eventEmitter)
```

**パラメーター**:
- `this.gameEngine.eventEmitter`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.eventEmitter);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### mergeConfig

**シグネチャ**:
```javascript
 mergeConfig(newConfig)
```

**パラメーター**:
- `newConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.mergeConfig(newConfig);

// mergeConfigの実用的な使用例
const result = instance.mergeConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### saveConfiguration

**シグネチャ**:
```javascript
 saveConfiguration()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveConfiguration();

// saveConfigurationの実用的な使用例
const result = instance.saveConfiguration(/* 適切なパラメータ */);
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

#### if

タイマーをクリア

**シグネチャ**:
```javascript
 if (this.autoSaveSystem.timer)
```

**パラメーター**:
- `this.autoSaveSystem.timer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.autoSaveSystem.timer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(element => {
            if (element && element.parentNode)
```

**パラメーター**:
- `element => {
            if (element && element.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(element => {
            if (element && element.parentNode);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `savedConfig` | 説明なし |
| `parsed` | 説明なし |
| `savedHistory` | 説明なし |
| `parsed` | 説明なし |
| `savedStates` | 説明なし |
| `dialog` | 説明なし |
| `styles` | 説明なし |
| `styleSheet` | 説明なし |
| `action` | 説明なし |
| `dialog` | 説明なし |
| `confirmStyles` | 説明なし |
| `styleSheet` | 説明なし |
| `banner` | 説明なし |
| `warningStyles` | 説明なし |
| `styleSheet` | 説明なし |
| `undoBtn` | 説明なし |
| `redoBtn` | 説明なし |
| `undoRedoStyles` | 説明なし |
| `styleSheet` | 説明なし |
| `panel` | 説明なし |
| `recoveryStyles` | 説明なし |
| `styleSheet` | 説明なし |
| `gameState` | 説明なし |
| `gameState` | 説明なし |
| `currentFPS` | 説明なし |
| `memoryUsage` | 説明なし |
| `now` | 説明なし |
| `timeWindow` | 説明なし |
| `recentErrors` | 説明なし |
| `message` | 説明なし |
| `errorInfo` | 説明なし |
| `typeKey` | 説明なし |
| `currentCount` | 説明なし |
| `element` | 説明なし |
| `now` | 説明なし |
| `criticalClasses` | 説明なし |
| `currentAction` | 説明なし |
| `action` | 説明なし |
| `action` | 説明なし |
| `dialog` | 説明なし |
| `errorType` | 説明なし |
| `retryBtn` | 説明なし |
| `undoBtn` | 説明なし |
| `continueBtn` | 説明なし |
| `firstButton` | 説明なし |
| `dialog` | 説明なし |
| `actionName` | 説明なし |
| `warningText` | 説明なし |
| `warningDiv` | 説明なし |
| `cancelBtn` | 説明なし |
| `proceedBtn` | 説明なし |
| `newCancelBtn` | 説明なし |
| `newProceedBtn` | 説明なし |
| `banner` | 説明なし |
| `feedback` | 説明なし |
| `historyData` | 説明なし |

---

