# AlternativeInputManager

## 概要

ファイル: `core/AlternativeInputManager.js`  
最終更新: 2025/7/29 0:51:16

## 目次

## クラス
- [AlternativeInputManager](#alternativeinputmanager)
## 定数
- [saved](#saved)
- [preferences](#preferences)
- [preferences](#preferences)
- [prefs](#prefs)
- [knownDevices](#knowndevices)
- [voiceDisplay](#voicedisplay)
- [indicator](#indicator)
- [switchAction](#switchaction)
- [switchAction](#switchaction)
- [focusableSelectors](#focusableselectors)
- [elements](#elements)
- [rect](#rect)
- [style](#style)
- [interactiveTags](#interactivetags)
- [interactiveRoles](#interactiveroles)
- [groups](#groups)
- [groups](#groups)
- [centerX](#centerx)
- [centerY](#centery)
- [rect](#rect)
- [elementCenterX](#elementcenterx)
- [elementCenterY](#elementcentery)
- [index](#index)
- [index](#index)
- [state](#state)
- [state](#state)
- [pressDuration](#pressduration)
- [element](#element)
- [element](#element)
- [rect](#rect)
- [highlightColor](#highlightcolor)
- [soundMap](#soundmap)
- [elementData](#elementdata)
- [soundId](#soundid)
- [SpeechRecognition](#speechrecognition)
- [recognition](#recognition)
- [results](#results)
- [transcript](#transcript)
- [confidence](#confidence)
- [command](#command)
- [errorMessages](#errormessages)
- [message](#message)
- [lowerTranscript](#lowertranscript)
- [display](#display)
- [display](#display)
- [stream](#stream)
- [mouseEvent](#mouseevent)
- [state](#state)
- [smoothedGaze](#smoothedgaze)
- [history](#history)
- [factor](#factor)
- [avgX](#avgx)
- [avgY](#avgy)
- [tolerance](#tolerance)
- [element](#element)
- [state](#state)
- [state](#state)
- [rect](#rect)
- [state](#state)
- [currentTime](#currenttime)
- [actions](#actions)
- [currentAction](#currentaction)
- [state](#state)
- [indicator](#indicator)
- [actionLabels](#actionlabels)
- [element](#element)
- [elementData](#elementdata)
- [clickEvent](#clickevent)
- [bubble](#bubble)
- [element](#element)
- [centerX](#centerx)
- [centerY](#centery)
- [rect](#rect)
- [elementCenterX](#elementcenterx)
- [elementCenterY](#elementcentery)
- [distance](#distance)
- [currentElement](#currentelement)
- [currentRect](#currentrect)
- [candidates](#candidates)
- [rect](#rect)
- [nearest](#nearest)
- [index](#index)
- [currentCenterX](#currentcenterx)
- [currentCenterY](#currentcentery)
- [rect](#rect)
- [centerX](#centerx)
- [centerY](#centery)
- [distance](#distance)
- [soundMap](#soundmap)
- [index](#index)
- [indicator](#indicator)
- [methodCount](#methodcount)
- [settings](#settings)
- [sessionDuration](#sessionduration)

---

## AlternativeInputManager

### コンストラクタ

```javascript
new AlternativeInputManager(motorAccessibilityManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `motorAccessibilityManager` | 説明なし |
| `accessibilityManager` | 説明なし |
| `gameEngine` | 説明なし |
| `config` | 代替入力設定 |
| `activeMethod` | 入力状態管理 |
| `inputState` | 説明なし |
| `interactiveElements` | 要素管理 |
| `focusableElements` | 説明なし |
| `scanningGroups` | 説明なし |
| `currentFocusIndex` | 説明なし |
| `feedbackElements` | 視覚フィードバック要素 |
| `scanHighlight` | 説明なし |
| `gazePointer` | 説明なし |
| `externalDevices` | 外部デバイス連携 |
| `deviceAPIs` | 説明なし |
| `stats` | 統計情報 |
| `userPreferences` | ユーザー設定 |
| `scanHighlight` | スキャンハイライト |
| `gazePointer` | 視線ポインター |
| `focusableElements` | 説明なし |
| `scanningGroups` | 説明なし |
| `scanningGroups` | 説明なし |
| `scanningGroups` | 線形スキャン用の単一グループ |
| `currentFocusIndex` | 説明なし |
| `currentFocusIndex` | 説明なし |
| `voiceFeedbackTimer` | 説明なし |
| `currentFocusIndex` | 説明なし |
| `currentFocusIndex` | 説明なし |
| `currentFocusIndex` | 説明なし |
| `activeMethod` | 説明なし |
| `activeMethod` | 説明なし |
| `activeMethod` | 説明なし |
| `focusableElements` | 説明なし |
| `scanningGroups` | 説明なし |

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

#### loadUserPreferences

**シグネチャ**:
```javascript
 loadUserPreferences()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadUserPreferences();

// loadUserPreferencesの実用的な使用例
const result = instance.loadUserPreferences(/* 適切なパラメータ */);
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

#### if

Map の復元

**シグネチャ**:
```javascript
 if (preferences.voiceSettings?.customCommands)
```

**パラメーター**:
- `preferences.voiceSettings?.customCommands`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(preferences.voiceSettings?.customCommands);

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

#### saveUserPreferences

**シグネチャ**:
```javascript
 saveUserPreferences()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveUserPreferences();

// saveUserPreferencesの実用的な使用例
const result = instance.saveUserPreferences(/* 適切なパラメータ */);
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

#### applyUserPreferences

**シグネチャ**:
```javascript
 applyUserPreferences()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyUserPreferences();

// applyUserPreferencesの実用的な使用例
const result = instance.applyUserPreferences(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

音声コマンド統合

**シグネチャ**:
```javascript
 if (prefs.voiceSettings.customCommands.size > 0)
```

**パラメーター**:
- `prefs.voiceSettings.customCommands.size > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(prefs.voiceSettings.customCommands.size > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [phrase, action] of prefs.voiceSettings.customCommands)
```

**パラメーター**:
- `const [phrase`
- `action] of prefs.voiceSettings.customCommands`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [phrase, action] of prefs.voiceSettings.customCommands);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

頭部追跡設定

**シグネチャ**:
```javascript
 if (prefs.headTrackingSettings.invertX || prefs.headTrackingSettings.invertY)
```

**パラメーター**:
- `prefs.headTrackingSettings.invertX || prefs.headTrackingSettings.invertY`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(prefs.headTrackingSettings.invertX || prefs.headTrackingSettings.invertY);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectAvailableInputMethods

**シグネチャ**:
```javascript
 detectAvailableInputMethods()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectAvailableInputMethods();

// detectAvailableInputMethodsの実用的な使用例
const result = instance.detectAvailableInputMethods(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

音声認識API

**シグネチャ**:
```javascript
 if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
```

**パラメーター**:
- `'webkitSpeechRecognition' in window || 'SpeechRecognition' in window`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

カメラアクセス（視線・頭部追跡用）

**シグネチャ**:
```javascript
 if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
```

**パラメーター**:
- `navigator.mediaDevices && navigator.mediaDevices.getUserMedia`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectExternalDevices

**シグネチャ**:
```javascript
 detectExternalDevices()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectExternalDevices();

// detectExternalDevicesの実用的な使用例
const result = instance.detectExternalDevices(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

WebUSB API での検出（対応デバイス用）

**シグネチャ**:
```javascript
 if ('usb' in navigator)
```

**パラメーター**:
- `'usb' in navigator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if('usb' in navigator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

WebHID API での検出

**シグネチャ**:
```javascript
 if ('hid' in navigator)
```

**パラメーター**:
- `'hid' in navigator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if('hid' in navigator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkDeviceCompatibility

**シグネチャ**:
```javascript
 checkDeviceCompatibility(device)
```

**パラメーター**:
- `device`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkDeviceCompatibility(device);

// checkDeviceCompatibilityの実用的な使用例
const result = instance.checkDeviceCompatibility(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (knownDevices[device.vendorId])
```

**パラメーター**:
- `knownDevices[device.vendorId]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(knownDevices[device.vendorId]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkHIDDeviceCompatibility

**シグネチャ**:
```javascript
 checkHIDDeviceCompatibility(device)
```

**パラメーター**:
- `device`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkHIDDeviceCompatibility(device);

// checkHIDDeviceCompatibilityの実用的な使用例
const result = instance.checkHIDDeviceCompatibility(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createFeedbackElements

**シグネチャ**:
```javascript
 createFeedbackElements()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createFeedbackElements();

// createFeedbackElementsの実用的な使用例
const result = instance.createFeedbackElements(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createVoiceFeedbackDisplay

**シグネチャ**:
```javascript
 createVoiceFeedbackDisplay()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createVoiceFeedbackDisplay();

// createVoiceFeedbackDisplayの実用的な使用例
const result = instance.createVoiceFeedbackDisplay(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createActionIndicator

**シグネチャ**:
```javascript
 createActionIndicator()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createActionIndicator();

// createActionIndicatorの実用的な使用例
const result = instance.createActionIndicator(/* 適切なパラメータ */);
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

#### setupSwitchInputListeners

**シグネチャ**:
```javascript
 setupSwitchInputListeners()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupSwitchInputListeners();

// setupSwitchInputListenersの実用的な使用例
const result = instance.setupSwitchInputListeners(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (switchAction)
```

**パラメーター**:
- `switchAction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(switchAction);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (switchAction)
```

**パラメーター**:
- `switchAction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(switchAction);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupSingleKeyListeners

**シグネチャ**:
```javascript
 setupSingleKeyListeners()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupSingleKeyListeners();

// setupSingleKeyListenersの実用的な使用例
const result = instance.setupSingleKeyListeners(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupGameEventListeners

**シグネチャ**:
```javascript
 setupGameEventListeners()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupGameEventListeners();

// setupGameEventListenersの実用的な使用例
const result = instance.setupGameEventListeners(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event.element)
```

**パラメーター**:
- `event.element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.element);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectInteractiveElements

**シグネチャ**:
```javascript
 collectInteractiveElements()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectInteractiveElements();

// collectInteractiveElementsの実用的な使用例
const result = instance.collectInteractiveElements(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スキャニンググループの作成

**シグネチャ**:
```javascript
 if (this.config.scanning.enabled)
```

**パラメーター**:
- `this.config.scanning.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.scanning.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isVisible

**シグネチャ**:
```javascript
 isVisible(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isVisible(element);

// isVisibleの実用的な使用例
const result = instance.isVisible(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isInteractive

**シグネチャ**:
```javascript
 isInteractive(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isInteractive(element);

// isInteractiveの実用的な使用例
const result = instance.isInteractive(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getElementType

**シグネチャ**:
```javascript
 getElementType(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getElementType(element);

// getElementTypeの実用的な使用例
const result = instance.getElementType(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getElementAction

**シグネチャ**:
```javascript
 getElementAction(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getElementAction(element);

// getElementActionの実用的な使用例
const result = instance.getElementAction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createScanningGroups

**シグネチャ**:
```javascript
 createScanningGroups()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createScanningGroups();

// createScanningGroupsの実用的な使用例
const result = instance.createScanningGroups(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.config.scanning.scanPattern === 'group')
```

**パラメーター**:
- `this.config.scanning.scanPattern === 'group'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.scanning.scanPattern === 'group');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### divideIntoGroups

**シグネチャ**:
```javascript
 divideIntoGroups(elements)
```

**パラメーター**:
- `elements`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.divideIntoGroups(elements);

// divideIntoGroupsの実用的な使用例
const result = instance.divideIntoGroups(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addInteractiveElement

**シグネチャ**:
```javascript
 addInteractiveElement(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addInteractiveElement(element);

// addInteractiveElementの実用的な使用例
const result = instance.addInteractiveElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スキャニンググループの更新

**シグネチャ**:
```javascript
 if (this.config.scanning.enabled)
```

**パラメーター**:
- `this.config.scanning.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.scanning.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### removeInteractiveElement

**シグネチャ**:
```javascript
 removeInteractiveElement(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeInteractiveElement(element);

// removeInteractiveElementの実用的な使用例
const result = instance.removeInteractiveElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (index > -1)
```

**パラメーター**:
- `index > -1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(index > -1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スキャニンググループの更新

**シグネチャ**:
```javascript
 if (this.config.scanning.enabled)
```

**パラメーター**:
- `this.config.scanning.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.scanning.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateElementPositions

**シグネチャ**:
```javascript
 updateElementPositions()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateElementPositions();

// updateElementPositionsの実用的な使用例
const result = instance.updateElementPositions(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [element, data] of this.interactiveElements)
```

**パラメーター**:
- `const [element`
- `data] of this.interactiveElements`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [element, data] of this.interactiveElements);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleSwitchPress

**シグネチャ**:
```javascript
 handleSwitchPress(action, event)
```

**パラメーター**:
- `action`
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleSwitchPress(action, event);

// handleSwitchPressの実用的な使用例
const result = instance.handleSwitchPress(/* 適切なパラメータ */);
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

#### handleSwitchRelease

**シグネチャ**:
```javascript
 handleSwitchRelease(action, event)
```

**パラメーター**:
- `action`
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleSwitchRelease(action, event);

// handleSwitchReleaseの実用的な使用例
const result = instance.handleSwitchRelease(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

長押し判定

**シグネチャ**:
```javascript
 if (pressDuration > 1000)
```

**パラメーター**:
- `pressDuration > 1000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(pressDuration > 1000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handlePrimarySwitchAction

**シグネチャ**:
```javascript
 handlePrimarySwitchAction()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handlePrimarySwitchAction();

// handlePrimarySwitchActionの実用的な使用例
const result = instance.handlePrimarySwitchAction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.config.scanning.enabled)
```

**パラメーター**:
- `this.config.scanning.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.scanning.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.inputState.scanning.isScanning)
```

**パラメーター**:
- `this.inputState.scanning.isScanning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.inputState.scanning.isScanning);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleSecondarySwitchAction

**シグネチャ**:
```javascript
 handleSecondarySwitchAction()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleSecondarySwitchAction();

// handleSecondarySwitchActionの実用的な使用例
const result = instance.handleSecondarySwitchAction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.config.scanning.enabled)
```

**パラメーター**:
- `this.config.scanning.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.scanning.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleCancelAction

**シグネチャ**:
```javascript
 handleCancelAction()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleCancelAction();

// handleCancelActionの実用的な使用例
const result = instance.handleCancelAction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.inputState.scanning.isScanning)
```

**パラメーター**:
- `this.inputState.scanning.isScanning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.inputState.scanning.isScanning);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleLongPress

**シグネチャ**:
```javascript
 handleLongPress(action)
```

**パラメーター**:
- `action`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleLongPress(action);

// handleLongPressの実用的な使用例
const result = instance.handleLongPress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startScanning

**シグネチャ**:
```javascript
 startScanning()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startScanning();

// startScanningの実用的な使用例
const result = instance.startScanning(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

自動スキャンの開始

**シグネチャ**:
```javascript
 if (this.config.scanning.autoStart)
```

**パラメーター**:
- `this.config.scanning.autoStart`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.scanning.autoStart);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stopScanning

**シグネチャ**:
```javascript
 stopScanning()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopScanning();

// stopScanningの実用的な使用例
const result = instance.stopScanning(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.inputState.scanning.scanTimer)
```

**パラメーター**:
- `this.inputState.scanning.scanTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.inputState.scanning.scanTimer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performScan

**シグネチャ**:
```javascript
 performScan()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performScan();

// performScanの実用的な使用例
const result = instance.performScan(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentFocusIndex >= this.focusableElements.length)
```

**パラメーター**:
- `this.currentFocusIndex >= this.focusableElements.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentFocusIndex >= this.focusableElements.length);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(element);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

音声フィードバック

**シグネチャ**:
```javascript
 if (this.config.scanning.audioFeedback)
```

**パラメーター**:
- `this.config.scanning.audioFeedback`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.scanning.audioFeedback);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### reverseScanDirection

**シグネチャ**:
```javascript
 reverseScanDirection()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.reverseScanDirection();

// reverseScanDirectionの実用的な使用例
const result = instance.reverseScanDirection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### selectCurrentElement

**シグネチャ**:
```javascript
 selectCurrentElement()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.selectCurrentElement();

// selectCurrentElementの実用的な使用例
const result = instance.selectCurrentElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.config.scanning.autoStart)
```

**パラメーター**:
- `this.config.scanning.autoStart`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.scanning.autoStart);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### highlightElement

**シグネチャ**:
```javascript
 highlightElement(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.highlightElement(element);

// highlightElementの実用的な使用例
const result = instance.highlightElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearScanHighlight

**シグネチャ**:
```javascript
 clearScanHighlight()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearScanHighlight();

// clearScanHighlightの実用的な使用例
const result = instance.clearScanHighlight(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### provideScanAudioFeedback

**シグネチャ**:
```javascript
 provideScanAudioFeedback(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.provideScanAudioFeedback(element);

// provideScanAudioFeedbackの実用的な使用例
const result = instance.provideScanAudioFeedback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

要素タイプに基づく音声フィードバック

**シグネチャ**:
```javascript
 if (this.gameEngine?.audioManager)
```

**パラメーター**:
- `this.gameEngine?.audioManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.audioManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### initializeVoiceControl

**シグネチャ**:
```javascript
 initializeVoiceControl()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeVoiceControl();

// initializeVoiceControlの実用的な使用例
const result = instance.initializeVoiceControl(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.config.voiceControl.continuousListening && this.config.voiceControl.enabled)
```

**パラメーター**:
- `this.config.voiceControl.continuousListening && this.config.voiceControl.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.voiceControl.continuousListening && this.config.voiceControl.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startVoiceListening

**シグネチャ**:
```javascript
 startVoiceListening()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startVoiceListening();

// startVoiceListeningの実用的な使用例
const result = instance.startVoiceListening(/* 適切なパラメータ */);
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

#### stopVoiceListening

**シグネチャ**:
```javascript
 stopVoiceListening()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopVoiceListening();

// stopVoiceListeningの実用的な使用例
const result = instance.stopVoiceListening(/* 適切なパラメータ */);
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

#### handleVoiceResult

**シグネチャ**:
```javascript
 handleVoiceResult(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleVoiceResult(event);

// handleVoiceResultの実用的な使用例
const result = instance.handleVoiceResult(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (confidence < this.config.voiceControl.confidence)
```

**パラメーター**:
- `confidence < this.config.voiceControl.confidence`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(confidence < this.config.voiceControl.confidence);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (command)
```

**パラメーター**:
- `command`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(command);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleVoiceError

**シグネチャ**:
```javascript
 handleVoiceError(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleVoiceError(event);

// handleVoiceErrorの実用的な使用例
const result = instance.handleVoiceError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### findMatchingCommand

**シグネチャ**:
```javascript
 findMatchingCommand(transcript)
```

**パラメーター**:
- `transcript`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.findMatchingCommand(transcript);

// findMatchingCommandの実用的な使用例
const result = instance.findMatchingCommand(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

完全一致

**シグネチャ**:
```javascript
 for (const [phrase, command] of this.config.voiceControl.commands)
```

**パラメーター**:
- `const [phrase`
- `command] of this.config.voiceControl.commands`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [phrase, command] of this.config.voiceControl.commands);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

部分一致

**シグネチャ**:
```javascript
 for (const [phrase, command] of this.config.voiceControl.commands)
```

**パラメーター**:
- `const [phrase`
- `command] of this.config.voiceControl.commands`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [phrase, command] of this.config.voiceControl.commands);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### executeVoiceCommand

**シグネチャ**:
```javascript
 executeVoiceCommand(command, transcript)
```

**パラメーター**:
- `command`
- `transcript`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.executeVoiceCommand(command, transcript);

// executeVoiceCommandの実用的な使用例
const result = instance.executeVoiceCommand(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (command)
```

**パラメーター**:
- `command`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(command);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showVoiceFeedback

**シグネチャ**:
```javascript
 showVoiceFeedback(message)
```

**パラメーター**:
- `message`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showVoiceFeedback(message);

// showVoiceFeedbackの実用的な使用例
const result = instance.showVoiceFeedback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hideVoiceFeedback

**シグネチャ**:
```javascript
 hideVoiceFeedback()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hideVoiceFeedback();

// hideVoiceFeedbackの実用的な使用例
const result = instance.hideVoiceFeedback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (display)
```

**パラメーター**:
- `display`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(display);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startEyeTracking

**シグネチャ**:
```javascript
async startEyeTracking()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startEyeTracking();

// startEyeTrackingの実用的な使用例
const result = instance.startEyeTracking(/* 適切なパラメータ */);
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

#### initializeEyeTracker

**シグネチャ**:
```javascript
async initializeEyeTracker(stream)
```

**パラメーター**:
- `stream`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeEyeTracker(stream);

// initializeEyeTrackerの実用的な使用例
const result = instance.initializeEyeTracker(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### simulateGazeData

**シグネチャ**:
```javascript
 simulateGazeData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.simulateGazeData();

// simulateGazeDataの実用的な使用例
const result = instance.simulateGazeData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (mouseEvent)
```

**パラメーター**:
- `mouseEvent`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(mouseEvent);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startEyeCalibration

**シグネチャ**:
```javascript
 startEyeCalibration()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startEyeCalibration();

// startEyeCalibrationの実用的な使用例
const result = instance.startEyeCalibration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleGazeUpdate

**シグネチャ**:
```javascript
 handleGazeUpdate(gazeData)
```

**パラメーター**:
- `gazeData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleGazeUpdate(gazeData);

// handleGazeUpdateの実用的な使用例
const result = instance.handleGazeUpdate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (state.gazeHistory.length > 10)
```

**パラメーター**:
- `state.gazeHistory.length > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(state.gazeHistory.length > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### smoothGazeData

**シグネチャ**:
```javascript
 smoothGazeData(currentGaze)
```

**パラメーター**:
- `currentGaze`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.smoothGazeData(currentGaze);

// smoothGazeDataの実用的な使用例
const result = instance.smoothGazeData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateGazePointer

**シグネチャ**:
```javascript
 updateGazePointer(gaze)
```

**パラメーター**:
- `gaze`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateGazePointer(gaze);

// updateGazePointerの実用的な使用例
const result = instance.updateGazePointer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkDwellActivation

**シグネチャ**:
```javascript
 checkDwellActivation(gaze)
```

**パラメーター**:
- `gaze`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkDwellActivation(gaze);

// checkDwellActivationの実用的な使用例
const result = instance.checkDwellActivation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

新しい要素の場合

**シグネチャ**:
```javascript
 if (state.dwellTarget !== element)
```

**パラメーター**:
- `state.dwellTarget !== element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(state.dwellTarget !== element);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearDwellTimer

**シグネチャ**:
```javascript
 clearDwellTimer()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearDwellTimer();

// clearDwellTimerの実用的な使用例
const result = instance.clearDwellTimer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (state.dwellTimer)
```

**パラメーター**:
- `state.dwellTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(state.dwellTimer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showDwellProgress

**シグネチャ**:
```javascript
 showDwellProgress(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showDwellProgress(element);

// showDwellProgressの実用的な使用例
const result = instance.showDwellProgress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hideDwellProgress

**シグネチャ**:
```javascript
 hideDwellProgress()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hideDwellProgress();

// hideDwellProgressの実用的な使用例
const result = instance.hideDwellProgress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleSingleKeyPress

**シグネチャ**:
```javascript
 handleSingleKeyPress()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleSingleKeyPress();

// handleSingleKeyPressの実用的な使用例
const result = instance.handleSingleKeyPress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ダブルクリック検出

**シグネチャ**:
```javascript
 if (currentTime - state.lastKeyTime < 300)
```

**パラメーター**:
- `currentTime - state.lastKeyTime < 300`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentTime - state.lastKeyTime < 300);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ビジュアルインジケーター更新

**シグネチャ**:
```javascript
 if (this.config.singleKey.visualIndicator)
```

**パラメーター**:
- `this.config.singleKey.visualIndicator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.singleKey.visualIndicator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleDoubleKeyPress

**シグネチャ**:
```javascript
 handleDoubleKeyPress()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleDoubleKeyPress();

// handleDoubleKeyPressの実用的な使用例
const result = instance.handleDoubleKeyPress(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetCycleTimer

**シグネチャ**:
```javascript
 resetCycleTimer()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetCycleTimer();

// resetCycleTimerの実用的な使用例
const result = instance.resetCycleTimer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (state.cycleTimer)
```

**パラメーター**:
- `state.cycleTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(state.cycleTimer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateActionIndicator

**シグネチャ**:
```javascript
 updateActionIndicator(nextAction)
```

**パラメーター**:
- `nextAction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateActionIndicator(nextAction);

// updateActionIndicatorの実用的な使用例
const result = instance.updateActionIndicator(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### executeAction

**シグネチャ**:
```javascript
 executeAction(action)
```

**パラメーター**:
- `action`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.executeAction(action);

// executeActionの実用的な使用例
const result = instance.executeAction(/* 適切なパラメータ */);
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

#### activateCurrentElement

**シグネチャ**:
```javascript
 activateCurrentElement()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.activateCurrentElement();

// activateCurrentElementの実用的な使用例
const result = instance.activateCurrentElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(element);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### activateElement

**シグネチャ**:
```javascript
 activateElement(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.activateElement(element);

// activateElementの実用的な使用例
const result = instance.activateElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

アクション実行

**シグネチャ**:
```javascript
 switch (elementData.type)
```

**パラメーター**:
- `elementData.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(elementData.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (element.href)
```

**パラメーター**:
- `element.href`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(element.href);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### popBubble

**シグネチャ**:
```javascript
 popBubble(bubbleElement)
```

**パラメーター**:
- `bubbleElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.popBubble(bubbleElement);

// popBubbleの実用的な使用例
const result = instance.popBubble(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.bubbleManager)
```

**パラメーター**:
- `this.gameEngine?.bubbleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.bubbleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bubble)
```

**パラメーター**:
- `bubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bubble);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### focusNextElement

**シグネチャ**:
```javascript
 focusNextElement()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.focusNextElement();

// focusNextElementの実用的な使用例
const result = instance.focusNextElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentFocusIndex >= this.focusableElements.length)
```

**パラメーター**:
- `this.currentFocusIndex >= this.focusableElements.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentFocusIndex >= this.focusableElements.length);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(element);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### activateNearestElement

**シグネチャ**:
```javascript
 activateNearestElement()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.activateNearestElement();

// activateNearestElementの実用的な使用例
const result = instance.activateNearestElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [element, data] of this.interactiveElements)
```

**パラメーター**:
- `const [element`
- `data] of this.interactiveElements`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [element, data] of this.interactiveElements);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance < minDistance)
```

**パラメーター**:
- `distance < minDistance`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance < minDistance);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (nearestElement)
```

**パラメーター**:
- `nearestElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(nearestElement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### navigateDirection

**シグネチャ**:
```javascript
 navigateDirection(direction)
```

**パラメーター**:
- `direction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.navigateDirection(direction);

// navigateDirectionの実用的な使用例
const result = instance.navigateDirection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

方向に基づいて候補を絞り込み

**シグネチャ**:
```javascript
 for (const [element, data] of this.interactiveElements)
```

**パラメーター**:
- `const [element`
- `data] of this.interactiveElements`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [element, data] of this.interactiveElements);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (direction)
```

**パラメーター**:
- `direction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(direction);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (isCandidate)
```

**パラメーター**:
- `isCandidate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isCandidate);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最も近い候補を選択

**シグネチャ**:
```javascript
 if (candidates.length > 0)
```

**パラメーター**:
- `candidates.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(candidates.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (nearest)
```

**パラメーター**:
- `nearest`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(nearest);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (index !== -1)
```

**パラメーター**:
- `index !== -1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(index !== -1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### findNearestCandidate

**シグネチャ**:
```javascript
 findNearestCandidate(currentRect, candidates)
```

**パラメーター**:
- `currentRect`
- `candidates`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.findNearestCandidate(currentRect, candidates);

// findNearestCandidateの実用的な使用例
const result = instance.findNearestCandidate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const candidate of candidates)
```

**パラメーター**:
- `const candidate of candidates`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const candidate of candidates);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance < minDistance)
```

**パラメーター**:
- `distance < minDistance`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance < minDistance);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### provideActivationFeedback

**シグネチャ**:
```javascript
 provideActivationFeedback(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.provideActivationFeedback(element);

// provideActivationFeedbackの実用的な使用例
const result = instance.provideActivationFeedback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

音声フィードバック

**シグネチャ**:
```javascript
 if (this.userPreferences.generalSettings.audioFeedback)
```

**パラメーター**:
- `this.userPreferences.generalSettings.audioFeedback`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.userPreferences.generalSettings.audioFeedback);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

触覚フィードバック

**シグネチャ**:
```javascript
 if (this.userPreferences.generalSettings.hapticFeedback)
```

**パラメーター**:
- `this.userPreferences.generalSettings.hapticFeedback`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.userPreferences.generalSettings.hapticFeedback);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### playFeedbackSound

**シグネチャ**:
```javascript
 playFeedbackSound(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.playFeedbackSound(type);

// playFeedbackSoundの実用的な使用例
const result = instance.playFeedbackSound(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.audioManager)
```

**パラメーター**:
- `this.gameEngine?.audioManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.audioManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### triggerHapticFeedback

**シグネチャ**:
```javascript
 triggerHapticFeedback(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.triggerHapticFeedback(type);

// triggerHapticFeedbackの実用的な使用例
const result = instance.triggerHapticFeedback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.motorAccessibilityManager?.vibrationManager)
```

**パラメーター**:
- `this.motorAccessibilityManager?.vibrationManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.motorAccessibilityManager?.vibrationManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleFocusChange

**シグネチャ**:
```javascript
 handleFocusChange(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleFocusChange(element);

// handleFocusChangeの実用的な使用例
const result = instance.handleFocusChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (index !== -1)
```

**パラメーター**:
- `index !== -1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(index !== -1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### navigateBack

**シグネチャ**:
```javascript
 navigateBack()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.navigateBack();

// navigateBackの実用的な使用例
const result = instance.navigateBack(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.sceneManager)
```

**パラメーター**:
- `this.gameEngine?.sceneManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.sceneManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### openMenu

**シグネチャ**:
```javascript
 openMenu()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.openMenu();

// openMenuの実用的な使用例
const result = instance.openMenu(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine?.uiManager)
```

**パラメーター**:
- `this.gameEngine?.uiManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.uiManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### pauseGame

**シグネチャ**:
```javascript
 pauseGame()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.pauseGame();

// pauseGameの実用的な使用例
const result = instance.pauseGame(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

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

#### resumeGame

**シグネチャ**:
```javascript
 resumeGame()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resumeGame();

// resumeGameの実用的な使用例
const result = instance.resumeGame(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

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

#### executeCustomCommand

**シグネチャ**:
```javascript
 executeCustomCommand(command, transcript)
```

**パラメーター**:
- `command`
- `transcript`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.executeCustomCommand(command, transcript);

// executeCustomCommandの実用的な使用例
const result = instance.executeCustomCommand(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showCalibrationUI

**シグネチャ**:
```javascript
 showCalibrationUI()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showCalibrationUI();

// showCalibrationUIの実用的な使用例
const result = instance.showCalibrationUI(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hideCalibrationUI

**シグネチャ**:
```javascript
 hideCalibrationUI()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hideCalibrationUI();

// hideCalibrationUIの実用的な使用例
const result = instance.hideCalibrationUI(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showQuickSettings

**シグネチャ**:
```javascript
 showQuickSettings()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showQuickSettings();

// showQuickSettingsの実用的な使用例
const result = instance.showQuickSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearAllFeedback

**シグネチャ**:
```javascript
 clearAllFeedback()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearAllFeedback();

// clearAllFeedbackの実用的な使用例
const result = instance.clearAllFeedback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (indicator)
```

**パラメーター**:
- `indicator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(indicator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateInputStats

**シグネチャ**:
```javascript
 updateInputStats(method, action)
```

**パラメーター**:
- `method`
- `action`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateInputStats(method, action);

// updateInputStatsの実用的な使用例
const result = instance.updateInputStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### enable

**シグネチャ**:
```javascript
 enable()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enable();

// enableの実用的な使用例
const result = instance.enable(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### disable

**シグネチャ**:
```javascript
 disable()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.disable();

// disableの実用的な使用例
const result = instance.disable(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stopAllInputMethods

**シグネチャ**:
```javascript
 stopAllInputMethods()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopAllInputMethods();

// stopAllInputMethodsの実用的な使用例
const result = instance.stopAllInputMethods(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### enableInputMethod

**シグネチャ**:
```javascript
 enableInputMethod(method)
```

**パラメーター**:
- `method`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enableInputMethod(method);

// enableInputMethodの実用的な使用例
const result = instance.enableInputMethod(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (method)
```

**パラメーター**:
- `method`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(method);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### disableInputMethod

**シグネチャ**:
```javascript
 disableInputMethod(method)
```

**パラメーター**:
- `method`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.disableInputMethod(method);

// disableInputMethodの実用的な使用例
const result = instance.disableInputMethod(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (method)
```

**パラメーター**:
- `method`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(method);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.activeMethod === method)
```

**パラメーター**:
- `this.activeMethod === method`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activeMethod === method);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setSwitchMapping

**シグネチャ**:
```javascript
 setSwitchMapping(key, action)
```

**パラメーター**:
- `key`
- `action`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setSwitchMapping(key, action);

// setSwitchMappingの実用的な使用例
const result = instance.setSwitchMapping(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setScanSpeed

**シグネチャ**:
```javascript
 setScanSpeed(speed)
```

**パラメーター**:
- `speed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setScanSpeed(speed);

// setScanSpeedの実用的な使用例
const result = instance.setScanSpeed(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setDwellTime

**シグネチャ**:
```javascript
 setDwellTime(time)
```

**パラメーター**:
- `time`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setDwellTime(time);

// setDwellTimeの実用的な使用例
const result = instance.setDwellTime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addVoiceCommand

**シグネチャ**:
```javascript
 addVoiceCommand(phrase, action)
```

**パラメーター**:
- `phrase`
- `action`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addVoiceCommand(phrase, action);

// addVoiceCommandの実用的な使用例
const result = instance.addVoiceCommand(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateHeadTrackingInversion

**シグネチャ**:
```javascript
 updateHeadTrackingInversion()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateHeadTrackingInversion();

// updateHeadTrackingInversionの実用的な使用例
const result = instance.updateHeadTrackingInversion(/* 適切なパラメータ */);
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
 if (config.motor?.alternativeInput)
```

**パラメーター**:
- `config.motor?.alternativeInput`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.motor?.alternativeInput);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateReport

**シグネチャ**:
```javascript
 generateReport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateReport();

// generateReportの実用的な使用例
const result = instance.generateReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getMostUsedMethod

**シグネチャ**:
```javascript
 getMostUsedMethod()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMostUsedMethod();

// getMostUsedMethodの実用的な使用例
const result = instance.getMostUsedMethod(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [method, count] of this.stats.inputsByMethod)
```

**パラメーター**:
- `const [method`
- `count] of this.stats.inputsByMethod`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [method, count] of this.stats.inputsByMethod);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (count > maxCount)
```

**パラメーター**:
- `count > maxCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(count > maxCount);

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

フィードバック要素の削除

**シグネチャ**:
```javascript
 if (this.scanHighlight && this.scanHighlight.parentNode)
```

**パラメーター**:
- `this.scanHighlight && this.scanHighlight.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.scanHighlight && this.scanHighlight.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gazePointer && this.gazePointer.parentNode)
```

**パラメーター**:
- `this.gazePointer && this.gazePointer.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gazePointer && this.gazePointer.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (element && element.parentNode)
```

**パラメーター**:
- `element && element.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(element && element.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

タイマーのクリア

**シグネチャ**:
```javascript
 if (this.inputState.scanning.scanTimer)
```

**パラメーター**:
- `this.inputState.scanning.scanTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.inputState.scanning.scanTimer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.inputState.singleKey.cycleTimer)
```

**パラメーター**:
- `this.inputState.singleKey.cycleTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.inputState.singleKey.cycleTimer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gamepadCheckInterval)
```

**パラメーター**:
- `this.gamepadCheckInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gamepadCheckInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `saved` | 説明なし |
| `preferences` | 説明なし |
| `preferences` | 説明なし |
| `prefs` | 説明なし |
| `knownDevices` | 説明なし |
| `voiceDisplay` | 説明なし |
| `indicator` | 説明なし |
| `switchAction` | 説明なし |
| `switchAction` | 説明なし |
| `focusableSelectors` | 説明なし |
| `elements` | 説明なし |
| `rect` | 説明なし |
| `style` | 説明なし |
| `interactiveTags` | 説明なし |
| `interactiveRoles` | 説明なし |
| `groups` | 説明なし |
| `groups` | 説明なし |
| `centerX` | 説明なし |
| `centerY` | 説明なし |
| `rect` | 説明なし |
| `elementCenterX` | 説明なし |
| `elementCenterY` | 説明なし |
| `index` | 説明なし |
| `index` | 説明なし |
| `state` | 説明なし |
| `state` | 説明なし |
| `pressDuration` | 説明なし |
| `element` | 説明なし |
| `element` | 説明なし |
| `rect` | 説明なし |
| `highlightColor` | 説明なし |
| `soundMap` | 説明なし |
| `elementData` | 説明なし |
| `soundId` | 説明なし |
| `SpeechRecognition` | 説明なし |
| `recognition` | 説明なし |
| `results` | 説明なし |
| `transcript` | 説明なし |
| `confidence` | 説明なし |
| `command` | 説明なし |
| `errorMessages` | 説明なし |
| `message` | 説明なし |
| `lowerTranscript` | 説明なし |
| `display` | 説明なし |
| `display` | 説明なし |
| `stream` | 説明なし |
| `mouseEvent` | 説明なし |
| `state` | 説明なし |
| `smoothedGaze` | 説明なし |
| `history` | 説明なし |
| `factor` | 説明なし |
| `avgX` | 説明なし |
| `avgY` | 説明なし |
| `tolerance` | 説明なし |
| `element` | 説明なし |
| `state` | 説明なし |
| `state` | 説明なし |
| `rect` | 説明なし |
| `state` | 説明なし |
| `currentTime` | 説明なし |
| `actions` | 説明なし |
| `currentAction` | 説明なし |
| `state` | 説明なし |
| `indicator` | 説明なし |
| `actionLabels` | 説明なし |
| `element` | 説明なし |
| `elementData` | 説明なし |
| `clickEvent` | 説明なし |
| `bubble` | 説明なし |
| `element` | 説明なし |
| `centerX` | 説明なし |
| `centerY` | 説明なし |
| `rect` | 説明なし |
| `elementCenterX` | 説明なし |
| `elementCenterY` | 説明なし |
| `distance` | 説明なし |
| `currentElement` | 説明なし |
| `currentRect` | 説明なし |
| `candidates` | 説明なし |
| `rect` | 説明なし |
| `nearest` | 説明なし |
| `index` | 説明なし |
| `currentCenterX` | 説明なし |
| `currentCenterY` | 説明なし |
| `rect` | 説明なし |
| `centerX` | 説明なし |
| `centerY` | 説明なし |
| `distance` | 説明なし |
| `soundMap` | 説明なし |
| `index` | 説明なし |
| `indicator` | 説明なし |
| `methodCount` | 説明なし |
| `settings` | 説明なし |
| `sessionDuration` | 説明なし |

---

