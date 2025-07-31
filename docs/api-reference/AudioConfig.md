# AudioConfig

## 概要

ファイル: `config/AudioConfig.js`  
最終更新: 2025/7/29 22:45:39

## 目次

## クラス
- [AudioConfig](#audioconfig)
## 関数
- [getAudioConfig()](#getaudioconfig)
## 定数
- [bandValidation](#bandvalidation)
- [currentState](#currentstate)
- [volumeConfig](#volumeconfig)
- [status](#status)

---

## AudioConfig

### コンストラクタ

```javascript
new AudioConfig()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `configManager` | 説明なし |

### メソッド

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

#### getVolumeConfig

**シグネチャ**:
```javascript
 getVolumeConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getVolumeConfig();

// getVolumeConfigの実用的な使用例
const result = instance.getVolumeConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getMasterVolume

**シグネチャ**:
```javascript
 getMasterVolume()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMasterVolume();

// getMasterVolumeの実用的な使用例
const result = instance.getMasterVolume(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getSfxVolume

**シグネチャ**:
```javascript
 getSfxVolume()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getSfxVolume();

// getSfxVolumeの実用的な使用例
const result = instance.getSfxVolume(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBgmVolume

**シグネチャ**:
```javascript
 getBgmVolume()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBgmVolume();

// getBgmVolumeの実用的な使用例
const result = instance.getBgmVolume(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isMuted

**シグネチャ**:
```javascript
 isMuted()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isMuted();

// isMutedの実用的な使用例
const result = instance.isMuted(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setMasterVolume

**シグネチャ**:
```javascript
 setMasterVolume(volume)
```

**パラメーター**:
- `volume`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setMasterVolume(volume);

// setMasterVolumeの実用的な使用例
const result = instance.setMasterVolume(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setSfxVolume

**シグネチャ**:
```javascript
 setSfxVolume(volume)
```

**パラメーター**:
- `volume`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setSfxVolume(volume);

// setSfxVolumeの実用的な使用例
const result = instance.setSfxVolume(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setBgmVolume

**シグネチャ**:
```javascript
 setBgmVolume(volume)
```

**パラメーター**:
- `volume`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setBgmVolume(volume);

// setBgmVolumeの実用的な使用例
const result = instance.setBgmVolume(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setMuted

**シグネチャ**:
```javascript
 setMuted(muted)
```

**パラメーター**:
- `muted`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setMuted(muted);

// setMutedの実用的な使用例
const result = instance.setMuted(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### toggleMute

**シグネチャ**:
```javascript
 toggleMute()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toggleMute();

// toggleMuteの実用的な使用例
const result = instance.toggleMute(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getQualityConfig

**シグネチャ**:
```javascript
 getQualityConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getQualityConfig();

// getQualityConfigの実用的な使用例
const result = instance.getQualityConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getSampleRate

**シグネチャ**:
```javascript
 getSampleRate()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getSampleRate();

// getSampleRateの実用的な使用例
const result = instance.getSampleRate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBufferSize

**シグネチャ**:
```javascript
 getBufferSize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBufferSize();

// getBufferSizeの実用的な使用例
const result = instance.getBufferSize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setSampleRate

**シグネチャ**:
```javascript
 setSampleRate(sampleRate)
```

**パラメーター**:
- `sampleRate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setSampleRate(sampleRate);

// setSampleRateの実用的な使用例
const result = instance.setSampleRate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setBufferSize

**シグネチャ**:
```javascript
 setBufferSize(bufferSize)
```

**パラメーター**:
- `bufferSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setBufferSize(bufferSize);

// setBufferSizeの実用的な使用例
const result = instance.setBufferSize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEffectConfig

**シグネチャ**:
```javascript
 getEffectConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEffectConfig();

// getEffectConfigの実用的な使用例
const result = instance.getEffectConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isReverbEnabled

**シグネチャ**:
```javascript
 isReverbEnabled()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isReverbEnabled();

// isReverbEnabledの実用的な使用例
const result = instance.isReverbEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isCompressionEnabled

**シグネチャ**:
```javascript
 isCompressionEnabled()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isCompressionEnabled();

// isCompressionEnabledの実用的な使用例
const result = instance.isCompressionEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setReverbEnabled

**シグネチャ**:
```javascript
 setReverbEnabled(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setReverbEnabled(enabled);

// setReverbEnabledの実用的な使用例
const result = instance.setReverbEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setCompressionEnabled

**シグネチャ**:
```javascript
 setCompressionEnabled(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setCompressionEnabled(enabled);

// setCompressionEnabledの実用的な使用例
const result = instance.setCompressionEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCompressorConfig

**シグネチャ**:
```javascript
 getCompressorConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCompressorConfig();

// getCompressorConfigの実用的な使用例
const result = instance.getCompressorConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getReverbConfig

**シグネチャ**:
```javascript
 getReverbConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getReverbConfig();

// getReverbConfigの実用的な使用例
const result = instance.getReverbConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyToAudioManager

**シグネチャ**:
```javascript
 applyToAudioManager(audioManager)
```

**パラメーター**:
- `audioManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyToAudioManager(audioManager);

// applyToAudioManagerの実用的な使用例
const result = instance.applyToAudioManager(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!audioManager)
```

**パラメーター**:
- `!audioManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!audioManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ミュート状態の適用

**シグネチャ**:
```javascript
 if (volumeConfig.muted !== audioManager.isMuted)
```

**パラメーター**:
- `volumeConfig.muted !== audioManager.isMuted`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(volumeConfig.muted !== audioManager.isMuted);

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

#### syncFromAudioManager

**シグネチャ**:
```javascript
 syncFromAudioManager(audioManager)
```

**パラメーター**:
- `audioManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.syncFromAudioManager(audioManager);

// syncFromAudioManagerの実用的な使用例
const result = instance.syncFromAudioManager(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!audioManager)
```

**パラメーター**:
- `!audioManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!audioManager);

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

## getAudioConfig

**シグネチャ**:
```javascript
getAudioConfig()
```

**使用例**:
```javascript
const result = getAudioConfig();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `bandValidation` | 説明なし |
| `currentState` | 説明なし |
| `volumeConfig` | 説明なし |
| `status` | 説明なし |

---

