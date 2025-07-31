# BGMPlayer

## 概要

ファイル: `audio/BGMPlayer.js`  
最終更新: 2025/7/29 22:45:39

## 目次

## クラス
- [BGMPlayer](#bgmplayer)
## 定数
- [crossfadeStartTime](#crossfadestarttime)
- [newSource](#newsource)
- [newFadeGainNode](#newfadegainnode)
- [crossfadeTime](#crossfadetime)
- [currentTime](#currenttime)
- [targetVolume](#targetvolume)
- [elapsed](#elapsed)

---

## BGMPlayer

### コンストラクタ

```javascript
new BGMPlayer(audioContext, bgmGainNode)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `audioContext` | 説明なし |
| `bgmGainNode` | 説明なし |
| `currentSource` | 再生状態 |
| `currentTrack` | 説明なし |
| `isPlaying` | 説明なし |
| `isPaused` | 説明なし |
| `startTime` | 説明なし |
| `pauseTime` | 説明なし |
| `fadeGainNode` | ゲインノード（フェード制御用） |
| `loopEnabled` | ループ制御 |
| `loopStartTime` | 説明なし |
| `loopEndTime` | 説明なし |
| `crossfadeTime` | 説明なし |
| `nextTrack` | 予約システム（次のトラック） |
| `nextTrackOptions` | 説明なし |
| `playbackStats` | 統計情報 |
| `currentSource` | AudioBufferSourceNodeを作成 |
| `fadeGainNode` | フェード用GainNodeを作成 |
| `currentTrack` | トラック情報を保存 |
| `loopEnabled` | 説明なし |
| `startTime` | 説明なし |
| `pauseTime` | 説明なし |
| `isPlaying` | 状態更新 |
| `isPaused` | 説明なし |
| `currentSource` | 新しいソースに切り替え |
| `fadeGainNode` | 説明なし |
| `nextTrack` | 説明なし |
| `nextTrackOptions` | 説明なし |
| `isPlaying` | 再生終了 |
| `currentSource` | 説明なし |
| `currentTrack` | 説明なし |
| `fadeGainNode` | 説明なし |
| `isPlaying` | 状態リセット |
| `isPaused` | 説明なし |
| `currentSource` | 説明なし |
| `currentTrack` | 説明なし |
| `fadeGainNode` | 説明なし |
| `startTime` | 説明なし |
| `pauseTime` | 説明なし |
| `nextTrack` | 予約されたトラックをクリア |
| `nextTrackOptions` | 説明なし |
| `pauseTime` | 説明なし |
| `isPaused` | 説明なし |
| `isPaused` | 説明なし |
| `pauseTime` | 説明なし |
| `nextTrack` | 説明なし |
| `nextTrackOptions` | 説明なし |
| `loopEnabled` | 説明なし |
| `crossfadeTime` | 説明なし |
| `playbackStats` | 説明なし |

### メソッド

#### play

**シグネチャ**:
```javascript
async play(track, options = {})
```

**パラメーター**:
- `track`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.play(track, options = {});

// playの実用的な使用例
const result = instance.play(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!track || !track.buffer)
```

**パラメーター**:
- `!track || !track.buffer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!track || !track.buffer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

現在の再生を停止

**シグネチャ**:
```javascript
 if (this.isPlaying)
```

**パラメーター**:
- `this.isPlaying`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isPlaying);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フェードイン

**シグネチャ**:
```javascript
 if (fadeInDuration > 0)
```

**パラメーター**:
- `fadeInDuration > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fadeInDuration > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ループタイマーの設定（手動ループ制御）

**シグネチャ**:
```javascript
 if (this.loopEnabled)
```

**パラメーター**:
- `this.loopEnabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.loopEnabled);

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

**シグネチャ**:
```javascript
 if (!this.loopEnabled || !this.currentTrack)
```

**パラメーター**:
- `!this.loopEnabled || !this.currentTrack`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.loopEnabled || !this.currentTrack);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isPlaying && this.loopEnabled && this.currentTrack)
```

**パラメーター**:
- `this.isPlaying && this.loopEnabled && this.currentTrack`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isPlaying && this.loopEnabled && this.currentTrack);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.currentTrack || !this.isPlaying)
```

**パラメーター**:
- `!this.currentTrack || !this.isPlaying`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.currentTrack || !this.isPlaying);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentSource)
```

**パラメーター**:
- `this.currentSource`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentSource);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (e)
```

**パラメーター**:
- `e`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(e);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
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

**シグネチャ**:
```javascript
 if (this.nextTrack)
```

**パラメーター**:
- `this.nextTrack`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.nextTrack);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stop

**シグネチャ**:
```javascript
async stop(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stop(options = {});

// stopの実用的な使用例
const result = instance.stop(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.isPlaying || !this.currentSource)
```

**パラメーター**:
- `!this.isPlaying || !this.currentSource`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.isPlaying || !this.currentSource);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (fadeOut && fadeOutDuration > 0 && this.fadeGainNode)
```

**パラメーター**:
- `fadeOut && fadeOutDuration > 0 && this.fadeGainNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fadeOut && fadeOutDuration > 0 && this.fadeGainNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

統計更新

**シグネチャ**:
```javascript
 if (this.startTime > 0)
```

**パラメーター**:
- `this.startTime > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.startTime > 0);

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

**シグネチャ**:
```javascript
 if (this.currentSource)
```

**パラメーター**:
- `this.currentSource`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentSource);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (e)
```

**パラメーター**:
- `e`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(e);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### pause

**シグネチャ**:
```javascript
 pause()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.pause();

// pauseの実用的な使用例
const result = instance.pause(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.isPlaying || this.isPaused)
```

**パラメーター**:
- `!this.isPlaying || this.isPaused`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.isPlaying || this.isPaused);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.fadeGainNode)
```

**パラメーター**:
- `this.fadeGainNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.fadeGainNode);

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

#### resume

**シグネチャ**:
```javascript
 resume()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resume();

// resumeの実用的な使用例
const result = instance.resume(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.isPlaying || !this.isPaused)
```

**パラメーター**:
- `!this.isPlaying || !this.isPaused`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.isPlaying || !this.isPaused);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.fadeGainNode)
```

**パラメーター**:
- `this.fadeGainNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.fadeGainNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

統計更新（一時停止時間を除外）

**シグネチャ**:
```javascript
 if (this.pauseTime > 0)
```

**パラメーター**:
- `this.pauseTime > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.pauseTime > 0);

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

#### setVolume

**シグネチャ**:
```javascript
 setVolume(volume, fadeTime = 0)
```

**パラメーター**:
- `volume`
- `fadeTime = 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setVolume(volume, fadeTime = 0);

// setVolumeの実用的な使用例
const result = instance.setVolume(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.fadeGainNode)
```

**パラメーター**:
- `!this.fadeGainNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.fadeGainNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (fadeTime > 0)
```

**パラメーター**:
- `fadeTime > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fadeTime > 0);

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

#### setPlaybackRate

**シグネチャ**:
```javascript
 setPlaybackRate(rate)
```

**パラメーター**:
- `rate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setPlaybackRate(rate);

// setPlaybackRateの実用的な使用例
const result = instance.setPlaybackRate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.currentSource)
```

**パラメーター**:
- `!this.currentSource`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.currentSource);

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

#### queueNext

**シグネチャ**:
```javascript
 queueNext(track, options = {})
```

**パラメーター**:
- `track`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.queueNext(track, options = {});

// queueNextの実用的な使用例
const result = instance.queueNext(/* 適切なパラメータ */);
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

#### setLoop

**シグネチャ**:
```javascript
 setLoop(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setLoop(enabled);

// setLoopの実用的な使用例
const result = instance.setLoop(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setCrossfadeTime

**シグネチャ**:
```javascript
 setCrossfadeTime(time)
```

**パラメーター**:
- `time`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setCrossfadeTime(time);

// setCrossfadeTimeの実用的な使用例
const result = instance.setCrossfadeTime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentTime

**シグネチャ**:
```javascript
 getCurrentTime()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentTime();

// getCurrentTimeの実用的な使用例
const result = instance.getCurrentTime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.isPlaying || !this.currentTrack)
```

**パラメーター**:
- `!this.isPlaying || !this.currentTrack`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.isPlaying || !this.currentTrack);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### resetStats

**シグネチャ**:
```javascript
 resetStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetStats();

// resetStatsの実用的な使用例
const result = instance.resetStats(/* 適切なパラメータ */);
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

再生を停止

**シグネチャ**:
```javascript
 if (this.isPlaying)
```

**パラメーター**:
- `this.isPlaying`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isPlaying);

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
| `crossfadeStartTime` | 説明なし |
| `newSource` | 説明なし |
| `newFadeGainNode` | 説明なし |
| `crossfadeTime` | 説明なし |
| `currentTime` | 説明なし |
| `targetVolume` | 説明なし |
| `elapsed` | 説明なし |

---

