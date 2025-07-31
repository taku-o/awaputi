# TimingAdjustmentManager

## 概要

ファイル: `core/TimingAdjustmentManager.js`  
最終更新: 2025/7/29 0:51:16

## 目次

## クラス
- [TimingAdjustmentManager](#timingadjustmentmanager)
## 定数
- [savedConfig](#savedconfig)
- [parsed](#parsed)
- [savedProfile](#savedprofile)
- [savedLearningData](#savedlearningdata)
- [prefersReducedMotion](#prefersreducedmotion)
- [prefersHighContrast](#prefershighcontrast)
- [accessibilityManager](#accessibilitymanager)
- [recommendedProfile](#recommendedprofile)
- [responseTime](#responsetime)
- [profile](#profile)
- [adjustment](#adjustment)
- [originalLifetime](#originallifetime)
- [profile](#profile)
- [profile](#profile)
- [profile](#profile)
- [warningThreshold](#warningthreshold)
- [timer](#timer)
- [profile](#profile)
- [remainingTime](#remainingtime)
- [timer](#timer)
- [profile](#profile)
- [warningElement](#warningelement)
- [styles](#styles)
- [styleSheet](#stylesheet)
- [extendBtn](#extendbtn)
- [dismissBtn](#dismissbtn)
- [timer](#timer)
- [profile](#profile)
- [extensionAmount](#extensionamount)
- [remaining](#remaining)
- [feedbackElement](#feedbackelement)
- [pauseTime](#pausetime)
- [resumeTime](#resumetime)
- [timer](#timer)
- [multiplier](#multiplier)
- [profile](#profile)
- [baseAdjustment](#baseadjustment)
- [finalAdjustment](#finaladjustment)
- [elapsed](#elapsed)
- [remaining](#remaining)
- [recentResponses](#recentresponses)
- [total](#total)
- [data](#data)
- [thresholds](#thresholds)
- [recentResponses](#recentresponses)
- [recentTimes](#recenttimes)
- [averageRecent](#averagerecent)
- [currentProfile](#currentprofile)
- [profile](#profile)
- [suggestionElement](#suggestionelement)
- [acceptBtn](#acceptbtn)
- [dismissBtn](#dismissbtn)
- [profile](#profile)
- [recommendedProfile](#recommendedprofile)
- [currentProfile](#currentprofile)
- [timer](#timer)
- [profile](#profile)
- [gracePeriod](#graceperiod)
- [remaining](#remaining)
- [customEvent](#customevent)
- [result](#result)
- [adjustedDuration](#adjustedduration)
- [timer](#timer)
- [elapsed](#elapsed)
- [remaining](#remaining)

---

## TimingAdjustmentManager

### コンストラクタ

```javascript
new TimingAdjustmentManager(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `isInitialized` | 説明なし |
| `config` | 設定とプロファイル |
| `state` | 状態管理 |
| `timers` | タイマー管理 |
| `adaptiveLearning` | 適応学習データ |
| `boundHandlers` | イベントリスナー |
| `isInitialized` | 説明なし |
| `config` | 深い結合を実行 |

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
 if (savedProfile)
```

**パラメーター**:
- `savedProfile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(savedProfile);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (savedLearningData)
```

**パラメーター**:
- `savedLearningData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(savedLearningData);

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

#### detectSystemPreferences

**シグネチャ**:
```javascript
 detectSystemPreferences()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectSystemPreferences();

// detectSystemPreferencesの実用的な使用例
const result = instance.detectSystemPreferences(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (prefersReducedMotion.matches)
```

**パラメーター**:
- `prefersReducedMotion.matches`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(prefersReducedMotion.matches);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (prefersHighContrast.matches)
```

**パラメーター**:
- `prefersHighContrast.matches`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(prefersHighContrast.matches);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (e.matches)
```

**パラメーター**:
- `e.matches`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(e.matches);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (recommendedProfile !== this.state.currentProfile)
```

**パラメーター**:
- `recommendedProfile !== this.state.currentProfile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(recommendedProfile !== this.state.currentProfile);

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

Tキーで時間延長リクエスト

**シグネチャ**:
```javascript
 if (event.code === 'KeyT' && !event.repeat)
```

**パラメーター**:
- `event.code === 'KeyT' && !event.repeat`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.code === 'KeyT' && !event.repeat);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Escキーで時間調整設定を開く

**シグネチャ**:
```javascript
 if (event.code === 'Escape' && event.ctrlKey)
```

**パラメーター**:
- `event.code === 'Escape' && event.ctrlKey`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.code === 'Escape' && event.ctrlKey);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleVisibilityChange

**シグネチャ**:
```javascript
 handleVisibilityChange()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleVisibilityChange();

// handleVisibilityChangeの実用的な使用例
const result = instance.handleVisibilityChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (document.hidden)
```

**パラメーター**:
- `document.hidden`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(document.hidden);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ページが隠れた場合、自動的に一時停止

**シグネチャ**:
```javascript
 if (this.config.autoAdjustment)
```

**パラメーター**:
- `this.config.autoAdjustment`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.autoAdjustment);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleFocusChange

**シグネチャ**:
```javascript
 handleFocusChange(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleFocusChange(event);

// handleFocusChangeの実用的な使用例
const result = instance.handleFocusChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event.type === 'blur' && this.config.autoAdjustment)
```

**パラメーター**:
- `event.type === 'blur' && this.config.autoAdjustment`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.type === 'blur' && this.config.autoAdjustment);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event.type === 'focus')
```

**パラメーター**:
- `event.type === 'focus'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.type === 'focus');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleGameStateChange

**シグネチャ**:
```javascript
 handleGameStateChange(state)
```

**パラメーター**:
- `state`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleGameStateChange(state);

// handleGameStateChangeの実用的な使用例
const result = instance.handleGameStateChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (state.paused)
```

**パラメーター**:
- `state.paused`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(state.paused);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (state.resumed)
```

**パラメーター**:
- `state.resumed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(state.resumed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### trackUserInteraction

**シグネチャ**:
```javascript
 trackUserInteraction(interaction)
```

**パラメーター**:
- `interaction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.trackUserInteraction(interaction);

// trackUserInteractionの実用的な使用例
const result = instance.trackUserInteraction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最新50件のみ保持

**シグネチャ**:
```javascript
 if (this.state.userInteractionData.recentResponses.length > 50)
```

**パラメーター**:
- `this.state.userInteractionData.recentResponses.length > 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.state.userInteractionData.recentResponses.length > 50);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

適応学習の実行

**シグネチャ**:
```javascript
 if (this.adaptiveLearning.enabled)
```

**パラメーター**:
- `this.adaptiveLearning.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.adaptiveLearning.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleBubbleCreated

**シグネチャ**:
```javascript
 handleBubbleCreated(bubble)
```

**パラメーター**:
- `bubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleBubbleCreated(bubble);

// handleBubbleCreatedの実用的な使用例
const result = instance.handleBubbleCreated(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (adjustment !== 1.0)
```

**パラメーター**:
- `adjustment !== 1.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(adjustment !== 1.0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyProfile

**シグネチャ**:
```javascript
 applyProfile(profileName)
```

**パラメーター**:
- `profileName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyProfile(profileName);

// applyProfileの実用的な使用例
const result = instance.applyProfile(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.config.profiles[profileName])
```

**パラメーター**:
- `!this.config.profiles[profileName]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.config.profiles[profileName]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentProfile

**シグネチャ**:
```javascript
 getCurrentProfile()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentProfile();

// getCurrentProfileの実用的な使用例
const result = instance.getCurrentProfile(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAdjustmentMultiplier

**シグネチャ**:
```javascript
 getAdjustmentMultiplier()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAdjustmentMultiplier();

// getAdjustmentMultiplierの実用的な使用例
const result = instance.getAdjustmentMultiplier(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### registerTimer

**シグネチャ**:
```javascript
 registerTimer(timerId, config)
```

**パラメーター**:
- `timerId`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerTimer(timerId, config);

// registerTimerの実用的な使用例
const result = instance.registerTimer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### unregisterTimer

**シグネチャ**:
```javascript
 unregisterTimer(timerId)
```

**パラメーター**:
- `timerId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.unregisterTimer(timerId);

// unregisterTimerの実用的な使用例
const result = instance.unregisterTimer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupWarningTimer

**シグネチャ**:
```javascript
 setupWarningTimer(timerId, config)
```

**パラメーター**:
- `timerId`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupWarningTimer(timerId, config);

// setupWarningTimerの実用的な使用例
const result = instance.setupWarningTimer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showTimeWarning

**シグネチャ**:
```javascript
 showTimeWarning(timerId)
```

**パラメーター**:
- `timerId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showTimeWarning(timerId);

// showTimeWarningの実用的な使用例
const result = instance.showTimeWarning(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

音響警告（オプション）

**シグネチャ**:
```javascript
 if (this.gameEngine.audioManager)
```

**パラメーター**:
- `this.gameEngine.audioManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.audioManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

自動延長の確認

**シグネチャ**:
```javascript
 if (profile.preferences.autoExtend)
```

**パラメーター**:
- `profile.preferences.autoExtend`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(profile.preferences.autoExtend);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showVisualWarning

**シグネチャ**:
```javascript
 showVisualWarning(timerId, remainingTime)
```

**パラメーター**:
- `timerId`
- `remainingTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showVisualWarning(timerId, remainingTime);

// showVisualWarningの実用的な使用例
const result = instance.showVisualWarning(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (warningElement.parentNode)
```

**パラメーター**:
- `warningElement.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(warningElement.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyWarningStyles

**シグネチャ**:
```javascript
 applyWarningStyles(element, profile)
```

**パラメーター**:
- `element`
- `profile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyWarningStyles(element, profile);

// applyWarningStylesの実用的な使用例
const result = instance.applyWarningStyles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupWarningButtons

**シグネチャ**:
```javascript
 setupWarningButtons(element, timerId)
```

**パラメーター**:
- `element`
- `timerId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupWarningButtons(element, timerId);

// setupWarningButtonsの実用的な使用例
const result = instance.setupWarningButtons(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (extendBtn)
```

**パラメーター**:
- `extendBtn`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(extendBtn);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (dismissBtn)
```

**パラメーター**:
- `dismissBtn`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(dismissBtn);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### extendTimer

**シグネチャ**:
```javascript
 extendTimer(timerId)
```

**パラメーター**:
- `timerId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.extendTimer(timerId);

// extendTimerの実用的な使用例
const result = instance.extendTimer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### requestTimeExtension

**シグネチャ**:
```javascript
 requestTimeExtension()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.requestTimeExtension();

// requestTimeExtensionの実用的な使用例
const result = instance.requestTimeExtension(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [timerId, timer] of this.timers.active)
```

**パラメーター**:
- `const [timerId`
- `timer] of this.timers.active`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [timerId, timer] of this.timers.active);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (remaining < shortestRemaining && remaining > 0)
```

**パラメーター**:
- `remaining < shortestRemaining && remaining > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(remaining < shortestRemaining && remaining > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (mostUrgentTimer)
```

**パラメーター**:
- `mostUrgentTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(mostUrgentTimer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showExtensionFeedback

**シグネチャ**:
```javascript
 showExtensionFeedback(timerId, remainingTime)
```

**パラメーター**:
- `timerId`
- `remainingTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showExtensionFeedback(timerId, remainingTime);

// showExtensionFeedbackの実用的な使用例
const result = instance.showExtensionFeedback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### toggleGlobalPause

**シグネチャ**:
```javascript
 toggleGlobalPause()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toggleGlobalPause();

// toggleGlobalPauseの実用的な使用例
const result = instance.toggleGlobalPause(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.state.isGlobalPaused)
```

**パラメーター**:
- `this.state.isGlobalPaused`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.state.isGlobalPaused);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### pauseAllTimers

**シグネチャ**:
```javascript
 pauseAllTimers(reason = 'manual')
```

**パラメーター**:
- `reason = 'manual'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.pauseAllTimers(reason = 'manual');

// pauseAllTimersの実用的な使用例
const result = instance.pauseAllTimers(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [timerId, timer] of this.timers.active)
```

**パラメーター**:
- `const [timerId`
- `timer] of this.timers.active`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [timerId, timer] of this.timers.active);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resumeAllTimers

**シグネチャ**:
```javascript
 resumeAllTimers(reason = 'manual')
```

**パラメーター**:
- `reason = 'manual'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resumeAllTimers(reason = 'manual');

// resumeAllTimersの実用的な使用例
const result = instance.resumeAllTimers(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [timerId, pauseInfo] of this.timers.paused)
```

**パラメーター**:
- `const [timerId`
- `pauseInfo] of this.timers.paused`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [timerId, pauseInfo] of this.timers.paused);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (pauseInfo.reason === reason || reason === 'user')
```

**パラメーター**:
- `pauseInfo.reason === reason || reason === 'user'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(pauseInfo.reason === reason || reason === 'user');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (timer)
```

**パラメーター**:
- `timer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(timer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyAdjustmentsToActiveTimers

**シグネチャ**:
```javascript
 applyAdjustmentsToActiveTimers()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyAdjustmentsToActiveTimers();

// applyAdjustmentsToActiveTimersの実用的な使用例
const result = instance.applyAdjustmentsToActiveTimers(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [timerId, timer] of this.timers.active)
```

**パラメーター**:
- `const [timerId`
- `timer] of this.timers.active`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [timerId, timer] of this.timers.active);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (profile.customTimeouts[timer.type])
```

**パラメーター**:
- `profile.customTimeouts[timer.type]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(profile.customTimeouts[timer.type]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (finalAdjustment !== 1.0)
```

**パラメーター**:
- `finalAdjustment !== 1.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(finalAdjustment !== 1.0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (remaining > 0)
```

**パラメーター**:
- `remaining > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(remaining > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateAverageResponseTime

**シグネチャ**:
```javascript
 updateAverageResponseTime()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateAverageResponseTime();

// updateAverageResponseTimeの実用的な使用例
const result = instance.updateAverageResponseTime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (recentResponses.length > 0)
```

**パラメーター**:
- `recentResponses.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(recentResponses.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performAdaptiveLearning

**シグネチャ**:
```javascript
 performAdaptiveLearning()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performAdaptiveLearning();

// performAdaptiveLearningの実用的な使用例
const result = instance.performAdaptiveLearning(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (recentResponses.length < thresholds.adaptationTrigger)
```

**パラメーター**:
- `recentResponses.length < thresholds.adaptationTrigger`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(recentResponses.length < thresholds.adaptationTrigger);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (averageRecent > thresholds.slowResponse)
```

**パラメーター**:
- `averageRecent > thresholds.slowResponse`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(averageRecent > thresholds.slowResponse);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (averageRecent < thresholds.fastResponse && 
                  data.extensionRequests === 0 && 
                  data.pauseFrequency === 0)
```

**パラメーター**:
- `averageRecent < thresholds.fastResponse && 
                  data.extensionRequests === 0 && 
                  data.pauseFrequency === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(averageRecent < thresholds.fastResponse && 
                  data.extensionRequests === 0 && 
                  data.pauseFrequency === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (adaptationNeeded)
```

**パラメーター**:
- `adaptationNeeded`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(adaptationNeeded);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### suggestAdaptation

**シグネチャ**:
```javascript
 suggestAdaptation(type, averageResponseTime)
```

**パラメーター**:
- `type`
- `averageResponseTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.suggestAdaptation(type, averageResponseTime);

// suggestAdaptationの実用的な使用例
const result = instance.suggestAdaptation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (type === 'increase')
```

**パラメーター**:
- `type === 'increase'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(type === 'increase');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

より時間を必要とする場合

**シグネチャ**:
```javascript
 if (this.state.currentProfile === 'standard')
```

**パラメーター**:
- `this.state.currentProfile === 'standard'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.state.currentProfile === 'standard');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.state.currentProfile === 'motor')
```

**パラメーター**:
- `this.state.currentProfile === 'motor'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.state.currentProfile === 'motor');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (type === 'decrease')
```

**パラメーター**:
- `type === 'decrease'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(type === 'decrease');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

時間を短縮できる場合

**シグネチャ**:
```javascript
 if (this.state.currentProfile === 'cognitive')
```

**パラメーター**:
- `this.state.currentProfile === 'cognitive'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.state.currentProfile === 'cognitive');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.state.currentProfile === 'motor')
```

**パラメーター**:
- `this.state.currentProfile === 'motor'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.state.currentProfile === 'motor');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (suggestedProfile && suggestedProfile !== this.state.currentProfile)
```

**パラメーター**:
- `suggestedProfile && suggestedProfile !== this.state.currentProfile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(suggestedProfile && suggestedProfile !== this.state.currentProfile);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showAdaptationSuggestion

**シグネチャ**:
```javascript
 showAdaptationSuggestion(suggestedProfile, averageResponseTime)
```

**パラメーター**:
- `suggestedProfile`
- `averageResponseTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showAdaptationSuggestion(suggestedProfile, averageResponseTime);

// showAdaptationSuggestionの実用的な使用例
const result = instance.showAdaptationSuggestion(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (suggestionElement.parentNode)
```

**パラメーター**:
- `suggestionElement.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(suggestionElement.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRecommendedProfile

**シグネチャ**:
```javascript
 getRecommendedProfile(accessibilitySettings)
```

**パラメーター**:
- `accessibilitySettings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRecommendedProfile(accessibilitySettings);

// getRecommendedProfileの実用的な使用例
const result = instance.getRecommendedProfile(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

アクセシビリティ設定に基づいてプロファイルを推奨

**シグネチャ**:
```javascript
 if (accessibilitySettings.motorImpairment || accessibilitySettings.reducedDexterity)
```

**パラメーター**:
- `accessibilitySettings.motorImpairment || accessibilitySettings.reducedDexterity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(accessibilitySettings.motorImpairment || accessibilitySettings.reducedDexterity);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (accessibilitySettings.cognitiveImpairment || accessibilitySettings.memoryIssues)
```

**パラメーター**:
- `accessibilitySettings.cognitiveImpairment || accessibilitySettings.memoryIssues`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(accessibilitySettings.cognitiveImpairment || accessibilitySettings.memoryIssues);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (accessibilitySettings.seniorFriendly)
```

**パラメーター**:
- `accessibilitySettings.seniorFriendly`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(accessibilitySettings.seniorFriendly);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### suggestProfileChange

**シグネチャ**:
```javascript
 suggestProfileChange(recommendedProfile)
```

**パラメーター**:
- `recommendedProfile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.suggestProfileChange(recommendedProfile);

// suggestProfileChangeの実用的な使用例
const result = instance.suggestProfileChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleAccessibilitySettingsChange

**シグネチャ**:
```javascript
 handleAccessibilitySettingsChange(settings)
```

**パラメーター**:
- `settings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleAccessibilitySettingsChange(settings);

// handleAccessibilitySettingsChangeの実用的な使用例
const result = instance.handleAccessibilitySettingsChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (recommendedProfile !== this.state.currentProfile)
```

**パラメーター**:
- `recommendedProfile !== this.state.currentProfile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(recommendedProfile !== this.state.currentProfile);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

自動適用するかユーザーに確認

**シグネチャ**:
```javascript
 if (this.config.autoAdjustment)
```

**パラメーター**:
- `this.config.autoAdjustment`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.autoAdjustment);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### adjustForReducedMotion

**シグネチャ**:
```javascript
 adjustForReducedMotion()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.adjustForReducedMotion();

// adjustForReducedMotionの実用的な使用例
const result = instance.adjustForReducedMotion(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### openTimingSettings

**シグネチャ**:
```javascript
 openTimingSettings()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.openTimingSettings();

// openTimingSettingsの実用的な使用例
const result = instance.openTimingSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### scheduleAutoExtension

**シグネチャ**:
```javascript
 scheduleAutoExtension(timerId)
```

**パラメーター**:
- `timerId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.scheduleAutoExtension(timerId);

// scheduleAutoExtensionの実用的な使用例
const result = instance.scheduleAutoExtension(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (remaining <= gracePeriod)
```

**パラメーター**:
- `remaining <= gracePeriod`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(remaining <= gracePeriod);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### deepMerge

**シグネチャ**:
```javascript
 deepMerge(target, source)
```

**パラメーター**:
- `target`
- `source`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.deepMerge(target, source);

// deepMergeの実用的な使用例
const result = instance.deepMerge(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const key in source)
```

**パラメーター**:
- `const key in source`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const key in source);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStatistics

**シグネチャ**:
```javascript
 getStatistics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStatistics();

// getStatisticsの実用的な使用例
const result = instance.getStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAvailableProfiles

**シグネチャ**:
```javascript
 getAvailableProfiles()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAvailableProfiles();

// getAvailableProfilesの実用的な使用例
const result = instance.getAvailableProfiles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createCustomTimer

**シグネチャ**:
```javascript
 createCustomTimer(id, duration, options = {})
```

**パラメーター**:
- `id`
- `duration`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createCustomTimer(id, duration, options = {});

// createCustomTimerの実用的な使用例
const result = instance.createCustomTimer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRemainingTime

**シグネチャ**:
```javascript
 getRemainingTime(timerId)
```

**パラメーター**:
- `timerId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRemainingTime(timerId);

// getRemainingTimeの実用的な使用例
const result = instance.getRemainingTime(/* 適切なパラメータ */);
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
| `savedConfig` | 説明なし |
| `parsed` | 説明なし |
| `savedProfile` | 説明なし |
| `savedLearningData` | 説明なし |
| `prefersReducedMotion` | 説明なし |
| `prefersHighContrast` | 説明なし |
| `accessibilityManager` | 説明なし |
| `recommendedProfile` | 説明なし |
| `responseTime` | 説明なし |
| `profile` | 説明なし |
| `adjustment` | 説明なし |
| `originalLifetime` | 説明なし |
| `profile` | 説明なし |
| `profile` | 説明なし |
| `profile` | 説明なし |
| `warningThreshold` | 説明なし |
| `timer` | 説明なし |
| `profile` | 説明なし |
| `remainingTime` | 説明なし |
| `timer` | 説明なし |
| `profile` | 説明なし |
| `warningElement` | 説明なし |
| `styles` | 説明なし |
| `styleSheet` | 説明なし |
| `extendBtn` | 説明なし |
| `dismissBtn` | 説明なし |
| `timer` | 説明なし |
| `profile` | 説明なし |
| `extensionAmount` | 説明なし |
| `remaining` | 説明なし |
| `feedbackElement` | 説明なし |
| `pauseTime` | 説明なし |
| `resumeTime` | 説明なし |
| `timer` | 説明なし |
| `multiplier` | 説明なし |
| `profile` | 説明なし |
| `baseAdjustment` | 説明なし |
| `finalAdjustment` | 説明なし |
| `elapsed` | 説明なし |
| `remaining` | 説明なし |
| `recentResponses` | 説明なし |
| `total` | 説明なし |
| `data` | 説明なし |
| `thresholds` | 説明なし |
| `recentResponses` | 説明なし |
| `recentTimes` | 説明なし |
| `averageRecent` | 説明なし |
| `currentProfile` | 説明なし |
| `profile` | 説明なし |
| `suggestionElement` | 説明なし |
| `acceptBtn` | 説明なし |
| `dismissBtn` | 説明なし |
| `profile` | 説明なし |
| `recommendedProfile` | 説明なし |
| `currentProfile` | 説明なし |
| `timer` | 説明なし |
| `profile` | 説明なし |
| `gracePeriod` | 説明なし |
| `remaining` | 説明なし |
| `customEvent` | 説明なし |
| `result` | 説明なし |
| `adjustedDuration` | 説明なし |
| `timer` | 説明なし |
| `elapsed` | 説明なし |
| `remaining` | 説明なし |

---

