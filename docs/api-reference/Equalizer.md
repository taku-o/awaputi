# Equalizer

## 概要

ファイル: `audio/Equalizer.js`  
最終更新: 2025/7/29 22:45:39

## 目次

## クラス
- [Equalizer](#equalizer)
## 定数
- [filter](#filter)
- [eqSettings](#eqsettings)
- [savedGain](#savedgain)
- [enabledWatcher](#enabledwatcher)
- [gainWatcher](#gainwatcher)
- [filter](#filter)
- [bandName](#bandname)
- [zeroGains](#zerogains)
- [presets](#presets)
- [preset](#preset)
- [displayNames](#displaynames)
- [frequencies](#frequencies)
- [magResponse](#magresponse)
- [phaseResponse](#phaseresponse)
- [minFreq](#minfreq)
- [maxFreq](#maxfreq)
- [logMinFreq](#logminfreq)
- [logMaxFreq](#logmaxfreq)
- [logFreq](#logfreq)

---

## Equalizer

### コンストラクタ

```javascript
new Equalizer(audioContext, inputNode, outputNode)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `audioContext` | 説明なし |
| `inputNode` | 説明なし |
| `outputNode` | 説明なし |
| `configManager` | 設定管理 |
| `bands` | 5バンドイコライザーの周波数設定 |
| `filters` | BiquadFilterNodeの配列 |
| `isEnabled` | イコライザーの有効状態 |
| `bypassGain` | バイパス用ゲインノード |
| `eqGain` | 説明なし |
| `configWatchers` | 設定監視用 |
| `bypassGain` | バイパス制御用のゲインノード |
| `eqGain` | 説明なし |
| `filters` | 各周波数帯域のフィルターを作成 |
| `isEnabled` | 有効状態を読み込み |
| `isEnabled` | 説明なし |
| `filters` | 説明なし |
| `bypassGain` | 説明なし |
| `eqGain` | 説明なし |

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

#### connectFilters

**シグネチャ**:
```javascript
 connectFilters()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.connectFilters();

// connectFiltersの実用的な使用例
const result = instance.connectFilters(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

入力 -> 最初のフィルター

**シグネチャ**:
```javascript
 if (this.filters.length > 0)
```

**パラメーター**:
- `this.filters.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.filters.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

フィルター間の接続

**シグネチャ**:
```javascript
 for (let i = 0; i < this.filters.length - 1; i++)
```

**パラメーター**:
- `let i = 0; i < this.filters.length - 1; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < this.filters.length - 1; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

#### loadEqualizerSettings

**シグネチャ**:
```javascript
 loadEqualizerSettings()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadEqualizerSettings();

// loadEqualizerSettingsの実用的な使用例
const result = instance.loadEqualizerSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

各バンドのゲイン値を読み込み

**シグネチャ**:
```javascript
 if (eqSettings.bands)
```

**パラメーター**:
- `eqSettings.bands`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(eqSettings.bands);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof savedGain === 'number')
```

**パラメーター**:
- `typeof savedGain === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof savedGain === 'number');

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

#### setupConfigWatchers

**シグネチャ**:
```javascript
 setupConfigWatchers()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupConfigWatchers();

// setupConfigWatchersの実用的な使用例
const result = instance.setupConfigWatchers(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof newValue === 'number')
```

**パラメーター**:
- `typeof newValue === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof newValue === 'number');

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

#### setEnabled

**シグネチャ**:
```javascript
 setEnabled(enabled, saveToConfig = true)
```

**パラメーター**:
- `enabled`
- `saveToConfig = true`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setEnabled(enabled, saveToConfig = true);

// setEnabledの実用的な使用例
const result = instance.setEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof enabled !== 'boolean')
```

**パラメーター**:
- `typeof enabled !== 'boolean'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof enabled !== 'boolean');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (saveToConfig)
```

**パラメーター**:
- `saveToConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(saveToConfig);

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

#### updateBypassState

**シグネチャ**:
```javascript
 updateBypassState()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateBypassState();

// updateBypassStateの実用的な使用例
const result = instance.updateBypassState(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isEnabled)
```

**パラメーター**:
- `this.isEnabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isEnabled);

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

#### setBandGain

**シグネチャ**:
```javascript
 setBandGain(bandIndex, gain, saveToConfig = true)
```

**パラメーター**:
- `bandIndex`
- `gain`
- `saveToConfig = true`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setBandGain(bandIndex, gain, saveToConfig = true);

// setBandGainの実用的な使用例
const result = instance.setBandGain(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bandIndex < 0 || bandIndex >= this.filters.length)
```

**パラメーター**:
- `bandIndex < 0 || bandIndex >= this.filters.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bandIndex < 0 || bandIndex >= this.filters.length);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (saveToConfig)
```

**パラメーター**:
- `saveToConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(saveToConfig);

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

#### getBandGain

**シグネチャ**:
```javascript
 getBandGain(bandIndex)
```

**パラメーター**:
- `bandIndex`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBandGain(bandIndex);

// getBandGainの実用的な使用例
const result = instance.getBandGain(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bandIndex < 0 || bandIndex >= this.filters.length)
```

**パラメーター**:
- `bandIndex < 0 || bandIndex >= this.filters.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bandIndex < 0 || bandIndex >= this.filters.length);

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

#### setAllBandGains

**シグネチャ**:
```javascript
 setAllBandGains(gains, saveToConfig = true)
```

**パラメーター**:
- `gains`
- `saveToConfig = true`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setAllBandGains(gains, saveToConfig = true);

// setAllBandGainsの実用的な使用例
const result = instance.setAllBandGains(/* 適切なパラメータ */);
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

#### getAllBandGains

**シグネチャ**:
```javascript
 getAllBandGains()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAllBandGains();

// getAllBandGainsの実用的な使用例
const result = instance.getAllBandGains(/* 適切なパラメータ */);
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

#### reset

**シグネチャ**:
```javascript
 reset(saveToConfig = true)
```

**パラメーター**:
- `saveToConfig = true`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.reset(saveToConfig = true);

// resetの実用的な使用例
const result = instance.reset(/* 適切なパラメータ */);
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

#### applyPreset

**シグネチャ**:
```javascript
 applyPreset(presetName, saveToConfig = true)
```

**パラメーター**:
- `presetName`
- `saveToConfig = true`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyPreset(presetName, saveToConfig = true);

// applyPresetの実用的な使用例
const result = instance.applyPreset(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!preset)
```

**パラメーター**:
- `!preset`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!preset);

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

#### getPresets

**シグネチャ**:
```javascript
 getPresets()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getPresets();

// getPresetsの実用的な使用例
const result = instance.getPresets(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBandInfo

**シグネチャ**:
```javascript
 getBandInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBandInfo();

// getBandInfoの実用的な使用例
const result = instance.getBandInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBandDisplayName

**シグネチャ**:
```javascript
 getBandDisplayName(bandName)
```

**パラメーター**:
- `bandName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBandDisplayName(bandName);

// getBandDisplayNameの実用的な使用例
const result = instance.getBandDisplayName(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getFrequencyResponse

**シグネチャ**:
```javascript
 getFrequencyResponse(samplePoints = 256)
```

**パラメーター**:
- `samplePoints = 256`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getFrequencyResponse(samplePoints = 256);

// getFrequencyResponseの実用的な使用例
const result = instance.getFrequencyResponse(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < samplePoints; i++)
```

**パラメーター**:
- `let i = 0; i < samplePoints; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < samplePoints; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < samplePoints; i++)
```

**パラメーター**:
- `let i = 0; i < samplePoints; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < samplePoints; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (totalMagResponse[i] === 0)
```

**パラメーター**:
- `totalMagResponse[i] === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(totalMagResponse[i] === 0);

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

#### getStatus

**シグネチャ**:
```javascript
 getStatus()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStatus();

// getStatusの実用的な使用例
const result = instance.getStatus(/* 適切なパラメータ */);
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

#### if

設定監視の解除

**シグネチャ**:
```javascript
 if (this.configWatchers)
```

**パラメーター**:
- `this.configWatchers`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.configWatchers);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲインノードを切断

**シグネチャ**:
```javascript
 if (this.bypassGain)
```

**パラメーター**:
- `this.bypassGain`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.bypassGain);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.eqGain)
```

**パラメーター**:
- `this.eqGain`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.eqGain);

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


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `filter` | 説明なし |
| `eqSettings` | 説明なし |
| `savedGain` | 説明なし |
| `enabledWatcher` | 説明なし |
| `gainWatcher` | 説明なし |
| `filter` | 説明なし |
| `bandName` | 説明なし |
| `zeroGains` | 説明なし |
| `presets` | 説明なし |
| `preset` | 説明なし |
| `displayNames` | 説明なし |
| `frequencies` | 説明なし |
| `magResponse` | 説明なし |
| `phaseResponse` | 説明なし |
| `minFreq` | 説明なし |
| `maxFreq` | 説明なし |
| `logMinFreq` | 説明なし |
| `logMaxFreq` | 説明なし |
| `logFreq` | 説明なし |

---

