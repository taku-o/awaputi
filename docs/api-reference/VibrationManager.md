# VibrationManager

## 概要

ファイル: `core/VibrationManager.js`  
最終更新: 2025/7/29 0:51:16

## 目次

## クラス
- [VibrationManager](#vibrationmanager)
## 定数
- [userAgent](#useragent)
- [memory](#memory)
- [cores](#cores)
- [isMobile](#ismobile)
- [testPattern](#testpattern)
- [result](#result)
- [saved](#saved)
- [preferences](#preferences)
- [preferences](#preferences)
- [hasVibration](#hasvibration)
- [gamepads](#gamepads)
- [gamepad](#gamepad)
- [reduction](#reduction)
- [customIntensity](#customintensity)
- [intensity](#intensity)
- [interactiveElements](#interactiveelements)
- [tagName](#tagname)
- [hasClickHandler](#hasclickhandler)
- [currentTime](#currenttime)
- [pattern](#pattern)
- [finalIntensity](#finalintensity)
- [adjustedPattern](#adjustedpattern)
- [customPattern](#custompattern)
- [vibrationPromises](#vibrationpromises)
- [vibrationId](#vibrationid)
- [vibrationData](#vibrationdata)
- [success](#success)
- [totalDuration](#totalduration)
- [promises](#promises)
- [gamepad](#gamepad)
- [intensity](#intensity)
- [duration](#duration)
- [actuator](#actuator)
- [intensity](#intensity)
- [duration](#duration)
- [index](#index)
- [vibrationData](#vibrationdata)
- [duration](#duration)
- [alternatives](#alternatives)
- [count](#count)
- [duration](#duration)
- [count](#count)
- [totalDuration](#totalduration)
- [gamepad](#gamepad)
- [validPattern](#validpattern)
- [normalizedIntensity](#normalizedintensity)
- [sessionDuration](#sessionduration)

---

## VibrationManager

### コンストラクタ

```javascript
new VibrationManager(audioAccessibilityManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `audioAccessibilityManager` | 説明なし |
| `accessibilityManager` | 説明なし |
| `gameEngine` | 説明なし |
| `config` | 振動設定 |
| `deviceInfo` | デバイス情報 |
| `isVibrating` | 振動状態管理 |
| `vibrationQueue` | 説明なし |
| `activePattern` | 説明なし |
| `lastVibrationTime` | 説明なし |
| `vibrationController` | 説明なし |
| `gamepads` | ゲームパッド対応 |
| `gamepadVibrationSupport` | 説明なし |
| `stats` | 統計情報 |
| `userPreferences` | ユーザー設定 |
| `fallbackStrategies` | フォールバック戦略 |
| `gamepadCheckInterval` | 定期的なゲームパッド状態確認 |
| `simplifiedPatterns` | 複雑なパターンを簡単なものに置き換え |
| `lastVibrationTime` | 説明なし |
| `activePattern` | 説明なし |
| `activePattern` | 説明なし |
| `isVibrating` | 説明なし |
| `activePattern` | 説明なし |
| `isVibrating` | 説明なし |

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

#### detectVibrationCapabilities

**シグネチャ**:
```javascript
 detectVibrationCapabilities()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectVibrationCapabilities();

// detectVibrationCapabilitiesの実用的な使用例
const result = instance.detectVibrationCapabilities(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Navigator Vibration API の検出

**シグネチャ**:
```javascript
 if ('vibrate' in navigator)
```

**パラメーター**:
- `'vibrate' in navigator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if('vibrate' in navigator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲームパッドの検出

**シグネチャ**:
```javascript
 if ('getGamepads' in navigator)
```

**パラメーター**:
- `'getGamepads' in navigator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if('getGamepads' in navigator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

振動テストの実行

**シグネチャ**:
```javascript
 if (this.config.deviceDetection)
```

**パラメーター**:
- `this.config.deviceDetection`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.deviceDetection);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### estimateDevicePerformance

**シグネチャ**:
```javascript
 estimateDevicePerformance()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateDevicePerformance();

// estimateDevicePerformanceの実用的な使用例
const result = instance.estimateDevicePerformance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (isMobile)
```

**パラメーター**:
- `isMobile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isMobile);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (memory <= 2 || cores <= 4)
```

**パラメーター**:
- `memory <= 2 || cores <= 4`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(memory <= 2 || cores <= 4);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (memory <= 4 || cores <= 6)
```

**パラメーター**:
- `memory <= 4 || cores <= 6`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(memory <= 4 || cores <= 6);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performVibrationTest

**シグネチャ**:
```javascript
 performVibrationTest()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performVibrationTest();

// performVibrationTestの実用的な使用例
const result = instance.performVibrationTest(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (result)
```

**パラメーター**:
- `result`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(result);

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
 if (preferences.customPatterns)
```

**パラメーター**:
- `preferences.customPatterns`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(preferences.customPatterns);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (preferences.intensityByEvent)
```

**パラメーター**:
- `preferences.intensityByEvent`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(preferences.intensityByEvent);

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

#### startGamepadMonitoring

**シグネチャ**:
```javascript
 startGamepadMonitoring()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startGamepadMonitoring();

// startGamepadMonitoringの実用的な使用例
const result = instance.startGamepadMonitoring(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleGamepadConnected

**シグネチャ**:
```javascript
 handleGamepadConnected(gamepad)
```

**パラメーター**:
- `gamepad`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleGamepadConnected(gamepad);

// handleGamepadConnectedの実用的な使用例
const result = instance.handleGamepadConnected(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (hasVibration)
```

**パラメーター**:
- `hasVibration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hasVibration);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleGamepadDisconnected

**シグネチャ**:
```javascript
 handleGamepadDisconnected(gamepad)
```

**パラメーター**:
- `gamepad`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleGamepadDisconnected(gamepad);

// handleGamepadDisconnectedの実用的な使用例
const result = instance.handleGamepadDisconnected(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkGamepadStatus

**シグネチャ**:
```javascript
 checkGamepadStatus()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkGamepadStatus();

// checkGamepadStatusの実用的な使用例
const result = instance.checkGamepadStatus(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < gamepads.length; i++)
```

**パラメーター**:
- `let i = 0; i < gamepads.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < gamepads.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupBatteryMonitoring

**シグネチャ**:
```javascript
 setupBatteryMonitoring()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupBatteryMonitoring();

// setupBatteryMonitoringの実用的な使用例
const result = instance.setupBatteryMonitoring(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if ('getBattery' in navigator)
```

**パラメーター**:
- `'getBattery' in navigator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if('getBattery' in navigator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleBatteryLevelChange

**シグネチャ**:
```javascript
 handleBatteryLevelChange(level)
```

**パラメーター**:
- `level`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleBatteryLevelChange(level);

// handleBatteryLevelChangeの実用的な使用例
const result = instance.handleBatteryLevelChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.userPreferences.batteryAware)
```

**パラメーター**:
- `this.userPreferences.batteryAware`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.userPreferences.batteryAware);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (level < 0.2)
```

**パラメーター**:
- `level < 0.2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(level < 0.2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (level > 0.5)
```

**パラメーター**:
- `level > 0.5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(level > 0.5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyLowBatteryMode

**シグネチャ**:
```javascript
 applyLowBatteryMode()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyLowBatteryMode();

// applyLowBatteryModeの実用的な使用例
const result = instance.applyLowBatteryMode(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パターンの簡略化

**シグネチャ**:
```javascript
 if (this.fallbackStrategies.lowBattery.patternSimplification)
```

**パラメーター**:
- `this.fallbackStrategies.lowBattery.patternSimplification`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.fallbackStrategies.lowBattery.patternSimplification);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### disableLowBatteryMode

**シグネチャ**:
```javascript
 disableLowBatteryMode()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.disableLowBatteryMode();

// disableLowBatteryModeの実用的な使用例
const result = instance.disableLowBatteryMode(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### simplifyVibrationPatterns

**シグネチャ**:
```javascript
 simplifyVibrationPatterns()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.simplifyVibrationPatterns();

// simplifyVibrationPatternsの実用的な使用例
const result = instance.simplifyVibrationPatterns(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (pattern.length > 3)
```

**パラメーター**:
- `pattern.length > 3`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(pattern.length > 3);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### restoreOriginalPatterns

**シグネチャ**:
```javascript
 restoreOriginalPatterns()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.restoreOriginalPatterns();

// restoreOriginalPatternsの実用的な使用例
const result = instance.restoreOriginalPatterns(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.simplifiedPatterns)
```

**パラメーター**:
- `this.simplifiedPatterns`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.simplifiedPatterns);

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

#### if

ゲームイベントの監視

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

#### triggerGameEventVibration

**シグネチャ**:
```javascript
 triggerGameEventVibration(eventType, eventData)
```

**パラメーター**:
- `eventType`
- `eventData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.triggerGameEventVibration(eventType, eventData);

// triggerGameEventVibrationの実用的な使用例
const result = instance.triggerGameEventVibration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### shouldTriggerUIVibration

**シグネチャ**:
```javascript
 shouldTriggerUIVibration(action, target)
```

**パラメーター**:
- `action`
- `target`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.shouldTriggerUIVibration(action, target);

// shouldTriggerUIVibrationの実用的な使用例
const result = instance.shouldTriggerUIVibration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### shouldTriggerVibration

**シグネチャ**:
```javascript
 shouldTriggerVibration(category, eventType)
```

**パラメーター**:
- `category`
- `eventType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.shouldTriggerVibration(category, eventType);

// shouldTriggerVibrationの実用的な使用例
const result = instance.shouldTriggerVibration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

カテゴリフィルタリング

**シグネチャ**:
```javascript
 if (!this.userPreferences.enabledCategories[category])
```

**パラメーター**:
- `!this.userPreferences.enabledCategories[category]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.userPreferences.enabledCategories[category]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentTime - this.lastVibrationTime < this.config.cooldownPeriod)
```

**パラメーター**:
- `currentTime - this.lastVibrationTime < this.config.cooldownPeriod`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentTime - this.lastVibrationTime < this.config.cooldownPeriod);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

同時振動数の制限

**シグネチャ**:
```javascript
 if (this.vibrationQueue.length >= this.userPreferences.maxConcurrentVibrations)
```

**パラメーター**:
- `this.vibrationQueue.length >= this.userPreferences.maxConcurrentVibrations`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.vibrationQueue.length >= this.userPreferences.maxConcurrentVibrations);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hasVibrationCapability

**シグネチャ**:
```javascript
 hasVibrationCapability()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hasVibrationCapability();

// hasVibrationCapabilityの実用的な使用例
const result = instance.hasVibrationCapability(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### triggerVibration

**シグネチャ**:
```javascript
 triggerVibration(patternName, options = {})
```

**パラメーター**:
- `patternName`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.triggerVibration(patternName, options = {});

// triggerVibrationの実用的な使用例
const result = instance.triggerVibration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!pattern)
```

**パラメーター**:
- `!pattern`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!pattern);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getVibrationPattern

**シグネチャ**:
```javascript
 getVibrationPattern(patternName)
```

**パラメーター**:
- `patternName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getVibrationPattern(patternName);

// getVibrationPatternの実用的な使用例
const result = instance.getVibrationPattern(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (customPattern)
```

**パラメーター**:
- `customPattern`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(customPattern);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### adjustPatternIntensity

**シグネチャ**:
```javascript
 adjustPatternIntensity(pattern, intensity)
```

**パラメーター**:
- `pattern`
- `intensity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.adjustPatternIntensity(pattern, intensity);

// adjustPatternIntensityの実用的な使用例
const result = instance.adjustPatternIntensity(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (intensity >= 1.0)
```

**パラメーター**:
- `intensity >= 1.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(intensity >= 1.0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### executeVibration

**シグネチャ**:
```javascript
 executeVibration(pattern, options)
```

**パラメーター**:
- `pattern`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.executeVibration(pattern, options);

// executeVibrationの実用的な使用例
const result = instance.executeVibration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

デバイス振動

**シグネチャ**:
```javascript
 if (this.deviceInfo.hasVibration)
```

**パラメーター**:
- `this.deviceInfo.hasVibration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.deviceInfo.hasVibration);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲームパッド振動

**シグネチャ**:
```javascript
 if (this.userPreferences.gamepadVibration)
```

**パラメーター**:
- `this.userPreferences.gamepadVibration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.userPreferences.gamepadVibration);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### executeDeviceVibration

**シグネチャ**:
```javascript
 executeDeviceVibration(pattern, options)
```

**パラメーター**:
- `pattern`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.executeDeviceVibration(pattern, options);

// executeDeviceVibrationの実用的な使用例
const result = instance.executeDeviceVibration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (success)
```

**パラメーター**:
- `success`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(success);

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

#### executeGamepadVibration

**シグネチャ**:
```javascript
 executeGamepadVibration(pattern, options)
```

**パラメーター**:
- `pattern`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.executeGamepadVibration(pattern, options);

// executeGamepadVibrationの実用的な使用例
const result = instance.executeGamepadVibration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [index, hasVibration] of this.gamepadVibrationSupport)
```

**パラメーター**:
- `const [index`
- `hasVibration] of this.gamepadVibrationSupport`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [index, hasVibration] of this.gamepadVibrationSupport);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### executeSingleGamepadVibration

**シグネチャ**:
```javascript
 executeSingleGamepadVibration(gamepad, pattern, options)
```

**パラメーター**:
- `gamepad`
- `pattern`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.executeSingleGamepadVibration(gamepad, pattern, options);

// executeSingleGamepadVibrationの実用的な使用例
const result = instance.executeSingleGamepadVibration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (gamepad.vibrationActuator)
```

**パラメーター**:
- `gamepad.vibrationActuator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gamepad.vibrationActuator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (gamepad.hapticActuators && gamepad.hapticActuators.length > 0)
```

**パラメーター**:
- `gamepad.hapticActuators && gamepad.hapticActuators.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gamepad.hapticActuators && gamepad.hapticActuators.length > 0);

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

#### handleVibrationComplete

**シグネチャ**:
```javascript
 handleVibrationComplete(vibrationId)
```

**パラメーター**:
- `vibrationId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleVibrationComplete(vibrationId);

// handleVibrationCompleteの実用的な使用例
const result = instance.handleVibrationComplete(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (this.activePattern && this.activePattern.id === vibrationId)
```

**パラメーター**:
- `this.activePattern && this.activePattern.id === vibrationId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.activePattern && this.activePattern.id === vibrationId);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processVibrationQueue

**シグネチャ**:
```javascript
 processVibrationQueue()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processVibrationQueue();

// processVibrationQueueの実用的な使用例
const result = instance.processVibrationQueue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.vibrationQueue.length > 0 && !this.isVibrating)
```

**パラメーター**:
- `this.vibrationQueue.length > 0 && !this.isVibrating`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.vibrationQueue.length > 0 && !this.isVibrating);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleVibrationFallback

**シグネチャ**:
```javascript
 handleVibrationFallback(patternName, options)
```

**パラメーター**:
- `patternName`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleVibrationFallback(patternName, options);

// handleVibrationFallbackの実用的な使用例
const result = instance.handleVibrationFallback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.fallbackStrategies.noVibration.enabled)
```

**パラメーター**:
- `!this.fallbackStrategies.noVibration.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.fallbackStrategies.noVibration.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### triggerVisualFallback

**シグネチャ**:
```javascript
 triggerVisualFallback(patternName, options)
```

**パラメーター**:
- `patternName`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.triggerVisualFallback(patternName, options);

// triggerVisualFallbackの実用的な使用例
const result = instance.triggerVisualFallback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

VisualFeedbackManager との連携

**シグネチャ**:
```javascript
 if (this.audioAccessibilityManager?.visualFeedbackManager)
```

**パラメーター**:
- `this.audioAccessibilityManager?.visualFeedbackManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.audioAccessibilityManager?.visualFeedbackManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### triggerAudioFallback

**シグネチャ**:
```javascript
 triggerAudioFallback(patternName, options)
```

**パラメーター**:
- `patternName`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.triggerAudioFallback(patternName, options);

// triggerAudioFallbackの実用的な使用例
const result = instance.triggerAudioFallback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

簡単な音響効果でフィードバック

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

#### generateVibrationId

**シグネチャ**:
```javascript
 generateVibrationId()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateVibrationId();

// generateVibrationIdの実用的な使用例
const result = instance.generateVibrationId(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateVibrationStats

**シグネチャ**:
```javascript
 updateVibrationStats(patternName, pattern)
```

**パラメーター**:
- `patternName`
- `pattern`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateVibrationStats(patternName, pattern);

// updateVibrationStatsの実用的な使用例
const result = instance.updateVibrationStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateEventStats

**シグネチャ**:
```javascript
 updateEventStats(eventType)
```

**パラメーター**:
- `eventType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateEventStats(eventType);

// updateEventStatsの実用的な使用例
const result = instance.updateEventStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateDurationStats

**シグネチャ**:
```javascript
 updateDurationStats(actualDuration)
```

**パラメーター**:
- `actualDuration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateDurationStats(actualDuration);

// updateDurationStatsの実用的な使用例
const result = instance.updateDurationStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### estimateBatteryImpact

**シグネチャ**:
```javascript
 estimateBatteryImpact(pattern)
```

**パラメーター**:
- `pattern`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateBatteryImpact(pattern);

// estimateBatteryImpactの実用的な使用例
const result = instance.estimateBatteryImpact(/* 適切なパラメータ */);
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

#### stopAllVibrations

**シグネチャ**:
```javascript
 stopAllVibrations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopAllVibrations();

// stopAllVibrationsの実用的な使用例
const result = instance.stopAllVibrations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

デバイス振動の停止

**シグネチャ**:
```javascript
 if (this.deviceInfo.hasVibration)
```

**パラメーター**:
- `this.deviceInfo.hasVibration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.deviceInfo.hasVibration);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

ゲームパッド振動の停止

**シグネチャ**:
```javascript
 for (const [index, hasVibration] of this.gamepadVibrationSupport)
```

**パラメーター**:
- `const [index`
- `hasVibration] of this.gamepadVibrationSupport`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [index, hasVibration] of this.gamepadVibrationSupport);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (gamepad && gamepad.vibrationActuator)
```

**パラメーター**:
- `gamepad && gamepad.vibrationActuator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gamepad && gamepad.vibrationActuator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### pauseAllVibrations

**シグネチャ**:
```javascript
 pauseAllVibrations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.pauseAllVibrations();

// pauseAllVibrationsの実用的な使用例
const result = instance.pauseAllVibrations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resumeVibrations

**シグネチャ**:
```javascript
 resumeVibrations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resumeVibrations();

// resumeVibrationsの実用的な使用例
const result = instance.resumeVibrations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setGlobalIntensity

**シグネチャ**:
```javascript
 setGlobalIntensity(intensity)
```

**パラメーター**:
- `intensity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setGlobalIntensity(intensity);

// setGlobalIntensityの実用的な使用例
const result = instance.setGlobalIntensity(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setCategoryEnabled

**シグネチャ**:
```javascript
 setCategoryEnabled(category, enabled)
```

**パラメーター**:
- `category`
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setCategoryEnabled(category, enabled);

// setCategoryEnabledの実用的な使用例
const result = instance.setCategoryEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addCustomPattern

**シグネチャ**:
```javascript
 addCustomPattern(patternName, pattern)
```

**パラメーター**:
- `patternName`
- `pattern`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addCustomPattern(patternName, pattern);

// addCustomPatternの実用的な使用例
const result = instance.addCustomPattern(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validPattern)
```

**パラメーター**:
- `!validPattern`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validPattern);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setEventIntensity

**シグネチャ**:
```javascript
 setEventIntensity(eventType, intensity)
```

**パラメーター**:
- `eventType`
- `intensity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setEventIntensity(eventType, intensity);

// setEventIntensityの実用的な使用例
const result = instance.setEventIntensity(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### triggerManualVibration

**シグネチャ**:
```javascript
 triggerManualVibration(pattern, options = {})
```

**パラメーター**:
- `pattern`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.triggerManualVibration(pattern, options = {});

// triggerManualVibrationの実用的な使用例
const result = instance.triggerManualVibration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof pattern === 'string')
```

**パラメーター**:
- `typeof pattern === 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof pattern === 'string');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDeviceInfo

**シグネチャ**:
```javascript
 getDeviceInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDeviceInfo();

// getDeviceInfoの実用的な使用例
const result = instance.getDeviceInfo(/* 適切なパラメータ */);
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
 if (config.audio?.vibration)
```

**パラメーター**:
- `config.audio?.vibration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.audio?.vibration);

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

ゲームパッド監視の停止

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

#### if

**シグネチャ**:
```javascript
 if (this.simplifiedPatterns)
```

**パラメーター**:
- `this.simplifiedPatterns`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.simplifiedPatterns);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `userAgent` | 説明なし |
| `memory` | 説明なし |
| `cores` | 説明なし |
| `isMobile` | 説明なし |
| `testPattern` | 説明なし |
| `result` | 説明なし |
| `saved` | 説明なし |
| `preferences` | 説明なし |
| `preferences` | 説明なし |
| `hasVibration` | 説明なし |
| `gamepads` | 説明なし |
| `gamepad` | 説明なし |
| `reduction` | 説明なし |
| `customIntensity` | 説明なし |
| `intensity` | 説明なし |
| `interactiveElements` | 説明なし |
| `tagName` | 説明なし |
| `hasClickHandler` | 説明なし |
| `currentTime` | 説明なし |
| `pattern` | 説明なし |
| `finalIntensity` | 説明なし |
| `adjustedPattern` | 説明なし |
| `customPattern` | 説明なし |
| `vibrationPromises` | 説明なし |
| `vibrationId` | 説明なし |
| `vibrationData` | 説明なし |
| `success` | 説明なし |
| `totalDuration` | 説明なし |
| `promises` | 説明なし |
| `gamepad` | 説明なし |
| `intensity` | 説明なし |
| `duration` | 説明なし |
| `actuator` | 説明なし |
| `intensity` | 説明なし |
| `duration` | 説明なし |
| `index` | 説明なし |
| `vibrationData` | 説明なし |
| `duration` | 説明なし |
| `alternatives` | 説明なし |
| `count` | 説明なし |
| `duration` | 説明なし |
| `count` | 説明なし |
| `totalDuration` | 説明なし |
| `gamepad` | 説明なし |
| `validPattern` | 説明なし |
| `normalizedIntensity` | 説明なし |
| `sessionDuration` | 説明なし |

---

