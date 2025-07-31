# BGMTransitionManager

## 概要

ファイル: `audio/BGMTransitionManager.js`  
最終更新: 2025/7/29 22:45:39

## 目次

## クラス
- [BGMTransitionManager](#bgmtransitionmanager)
## 定数
- [nextTransition](#nexttransition)
- [currentBGMInfo](#currentbgminfo)
- [currentVolume](#currentvolume)
- [fromTrackInfo](#fromtrackinfo)
- [toTrackInfo](#totrackinfo)
- [harmonyScore](#harmonyscore)
- [tempoDiff](#tempodiff)
- [tempoScore](#temposcore)
- [styleCompatibility](#stylecompatibility)
- [keyCompatibility](#keycompatibility)
- [compatibilityMatrix](#compatibilitymatrix)
- [keyMap](#keymap)
- [interval](#interval)
- [circleInterval](#circleinterval)
- [harmonyWeights](#harmonyweights)
- [steps](#steps)
- [stepDuration](#stepduration)
- [progress](#progress)
- [easedProgress](#easedprogress)
- [currentVolume](#currentvolume)
- [newVolume](#newvolume)
- [currentInfo](#currentinfo)
- [startVolume](#startvolume)
- [steps](#steps)
- [stepDuration](#stepduration)
- [progress](#progress)
- [easedProgress](#easedprogress)
- [volume](#volume)
- [steps](#steps)
- [stepDuration](#stepduration)
- [progress](#progress)
- [easedProgress](#easedprogress)
- [volume](#volume)

---

## BGMTransitionManager

### コンストラクタ

```javascript
new BGMTransitionManager(audioContext, bgmSystem)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `audioContext` | 説明なし |
| `bgmSystem` | 説明なし |
| `isTransitioning` | トランジション状態 |
| `currentTransition` | 説明なし |
| `transitionQueue` | 説明なし |
| `defaultFadeInDuration` | フェード設定 |
| `defaultFadeOutDuration` | 説明なし |
| `defaultCrossfadeDuration` | 説明なし |
| `transitionTypes` | トランジションタイプ |
| `curveTypes` | 音量カーブタイプ |
| `isTransitioning` | 説明なし |
| `currentTransition` | 説明なし |
| `isTransitioning` | 説明なし |
| `currentTransition` | 説明なし |
| `isTransitioning` | 説明なし |
| `currentTransition` | 説明なし |
| `isTransitioning` | 説明なし |
| `currentTransition` | 説明なし |
| `transitionQueue` | 説明なし |
| `defaultFadeInDuration` | 説明なし |
| `defaultFadeOutDuration` | 説明なし |
| `defaultCrossfadeDuration` | 説明なし |

### メソッド

#### transitionTo

**シグネチャ**:
```javascript
async transitionTo(fromTrack, toTrack, options = {})
```

**パラメーター**:
- `fromTrack`
- `toTrack`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.transitionTo(fromTrack, toTrack, options = {});

// transitionToの実用的な使用例
const result = instance.transitionTo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isTransitioning)
```

**パラメーター**:
- `this.isTransitioning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isTransitioning);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

遅延がある場合は待機

**シグネチャ**:
```javascript
 if (delay > 0)
```

**パラメーター**:
- `delay > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(delay > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

トランジションタイプに応じて実行

**シグネチャ**:
```javascript
 switch (type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

キューに次の遷移がある場合は実行

**シグネチャ**:
```javascript
 if (this.transitionQueue.length > 0)
```

**パラメーター**:
- `this.transitionQueue.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.transitionQueue.length > 0);

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

現在のBGMをフェードアウト

**シグネチャ**:
```javascript
 if (this.bgmSystem.isPlaying)
```

**パラメーター**:
- `this.bgmSystem.isPlaying`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.bgmSystem.isPlaying);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

現在のBGMを即座に停止

**シグネチャ**:
```javascript
 if (this.bgmSystem.isPlaying)
```

**パラメーター**:
- `this.bgmSystem.isPlaying`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.bgmSystem.isPlaying);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!fromTrackInfo || !toTrackInfo)
```

**パラメーター**:
- `!fromTrackInfo || !toTrackInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!fromTrackInfo || !toTrackInfo);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (harmonyScore > 0.8)
```

**パラメーター**:
- `harmonyScore > 0.8`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(harmonyScore > 0.8);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (harmonyScore < 0.3)
```

**パラメーター**:
- `harmonyScore < 0.3`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(harmonyScore < 0.3);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i <= steps; i++)
```

**パラメーター**:
- `let i = 0; i <= steps; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i <= steps; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (i < steps)
```

**パラメーター**:
- `i < steps`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(i < steps);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (curveType)
```

**パラメーター**:
- `curveType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(curveType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### fadeOut

**シグネチャ**:
```javascript
async fadeOut(duration = this.defaultFadeOutDuration, curve = this.curveTypes.SMOOTH)
```

**パラメーター**:
- `duration = this.defaultFadeOutDuration`
- `curve = this.curveTypes.SMOOTH`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.fadeOut(duration = this.defaultFadeOutDuration, curve = this.curveTypes.SMOOTH);

// fadeOutの実用的な使用例
const result = instance.fadeOut(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!currentInfo || !currentInfo.isPlaying)
```

**パラメーター**:
- `!currentInfo || !currentInfo.isPlaying`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!currentInfo || !currentInfo.isPlaying);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i <= steps; i++)
```

**パラメーター**:
- `let i = 0; i <= steps; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i <= steps; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (i < steps)
```

**パラメーター**:
- `i < steps`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(i < steps);

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

#### fadeIn

**シグネチャ**:
```javascript
async fadeIn(trackName, duration = this.defaultFadeInDuration, curve = this.curveTypes.SMOOTH, targetVolume = 1.0)
```

**パラメーター**:
- `trackName`
- `duration = this.defaultFadeInDuration`
- `curve = this.curveTypes.SMOOTH`
- `targetVolume = 1.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.fadeIn(trackName, duration = this.defaultFadeInDuration, curve = this.curveTypes.SMOOTH, targetVolume = 1.0);

// fadeInの実用的な使用例
const result = instance.fadeIn(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i <= steps; i++)
```

**パラメーター**:
- `let i = 0; i <= steps; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i <= steps; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (i < steps)
```

**パラメーター**:
- `i < steps`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(i < steps);

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

#### stopTransition

**シグネチャ**:
```javascript
 stopTransition()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopTransition();

// stopTransitionの実用的な使用例
const result = instance.stopTransition(/* 適切なパラメータ */);
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

#### updateSettings

**シグネチャ**:
```javascript
 updateSettings(settings)
```

**パラメーター**:
- `settings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateSettings(settings);

// updateSettingsの実用的な使用例
const result = instance.updateSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.defaultFadeInDuration !== undefined)
```

**パラメーター**:
- `settings.defaultFadeInDuration !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.defaultFadeInDuration !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.defaultFadeOutDuration !== undefined)
```

**パラメーター**:
- `settings.defaultFadeOutDuration !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.defaultFadeOutDuration !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.defaultCrossfadeDuration !== undefined)
```

**パラメーター**:
- `settings.defaultCrossfadeDuration !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.defaultCrossfadeDuration !== undefined);

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

#### getTransitionState

**シグネチャ**:
```javascript
 getTransitionState()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTransitionState();

// getTransitionStateの実用的な使用例
const result = instance.getTransitionState(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### dispose

**シグネチャ**:
```javascript
 dispose()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.dispose();

// disposeの実用的な使用例
const result = instance.dispose(/* 適切なパラメータ */);
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


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `nextTransition` | 説明なし |
| `currentBGMInfo` | 説明なし |
| `currentVolume` | 説明なし |
| `fromTrackInfo` | 説明なし |
| `toTrackInfo` | 説明なし |
| `harmonyScore` | 説明なし |
| `tempoDiff` | 説明なし |
| `tempoScore` | 説明なし |
| `styleCompatibility` | 説明なし |
| `keyCompatibility` | 説明なし |
| `compatibilityMatrix` | 説明なし |
| `keyMap` | 説明なし |
| `interval` | 説明なし |
| `circleInterval` | 説明なし |
| `harmonyWeights` | 説明なし |
| `steps` | 説明なし |
| `stepDuration` | 説明なし |
| `progress` | 説明なし |
| `easedProgress` | 説明なし |
| `currentVolume` | 説明なし |
| `newVolume` | 説明なし |
| `currentInfo` | 説明なし |
| `startVolume` | 説明なし |
| `steps` | 説明なし |
| `stepDuration` | 説明なし |
| `progress` | 説明なし |
| `easedProgress` | 説明なし |
| `volume` | 説明なし |
| `steps` | 説明なし |
| `stepDuration` | 説明なし |
| `progress` | 説明なし |
| `easedProgress` | 説明なし |
| `volume` | 説明なし |

---

