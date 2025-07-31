# BGMGenerator

## 概要

ファイル: `audio/BGMGenerator.js`  
最終更新: 2025/7/29 22:45:39

## 目次

## クラス
- [BGMGenerator](#bgmgenerator)
## 定数
- [sampleRate](#samplerate)
- [buffer](#buffer)
- [leftChannel](#leftchannel)
- [rightChannel](#rightchannel)
- [sampleRate](#samplerate)
- [progression](#progression)
- [scale](#scale)
- [rootFreq](#rootfreq)
- [t](#t)
- [progress](#progress)
- [chordIndex](#chordindex)
- [chord](#chord)
- [amplitude](#amplitude)
- [modulation](#modulation)
- [delay](#delay)
- [noise](#noise)
- [leftChannel](#leftchannel)
- [rightChannel](#rightchannel)
- [sampleRate](#samplerate)
- [tempo](#tempo)
- [beatDuration](#beatduration)
- [progression](#progression)
- [scale](#scale)
- [rootFreq](#rootfreq)
- [bassRootFreq](#bassrootfreq)
- [t](#t)
- [beatPosition](#beatposition)
- [currentBeat](#currentbeat)
- [chordIndex](#chordindex)
- [chord](#chord)
- [bassFreq](#bassfreq)
- [bassAmp](#bassamp)
- [bassEnvelope](#bassenvelope)
- [arpeggioSpeed](#arpeggiospeed)
- [arpeggioIndex](#arpeggioindex)
- [arpeggioFreq](#arpeggiofreq)
- [arpeggioEnvelope](#arpeggioenvelope)
- [padAmp](#padamp)
- [hihat](#hihat)
- [leftChannel](#leftchannel)
- [rightChannel](#rightchannel)
- [sampleRate](#samplerate)
- [tempo](#tempo)
- [beatDuration](#beatduration)
- [progression](#progression)
- [scale](#scale)
- [rootFreq](#rootfreq)
- [bassRootFreq](#bassrootfreq)
- [t](#t)
- [beatPosition](#beatposition)
- [measureProgress](#measureprogress)
- [chordIndex](#chordindex)
- [chord](#chord)
- [bassFreq](#bassfreq)
- [syncopatedPattern](#syncopatedpattern)
- [patternIndex](#patternindex)
- [bassEnv](#bassenv)
- [arpeggioSpeed](#arpeggiospeed)
- [arpeggioIndex](#arpeggioindex)
- [arpeggioFreq](#arpeggiofreq)
- [arpeggioEnv](#arpeggioenv)
- [kick](#kick)
- [panPosition](#panposition)
- [leftChannel](#leftchannel)
- [rightChannel](#rightchannel)
- [sampleRate](#samplerate)
- [duration](#duration)
- [progression](#progression)
- [scale](#scale)
- [rootFreq](#rootfreq)
- [t](#t)
- [progress](#progress)
- [intensity](#intensity)
- [chordIndex](#chordindex)
- [chord](#chord)
- [harmonicFreq](#harmonicfreq)
- [amplitude](#amplitude)
- [noteLength](#notelength)
- [noteProgress](#noteprogress)
- [envelope](#envelope)
- [melodyScale](#melodyscale)
- [melodyIndex](#melodyindex)
- [melodyFreq](#melodyfreq)
- [melodyAmp](#melodyamp)
- [timpani](#timpani)
- [reverbDelay](#reverbdelay)
- [reverbSample](#reverbsample)
- [noteMap](#notemap)
- [baseNote](#basenote)
- [semitones](#semitones)
- [semitonesFromA4](#semitonesfroma4)
- [romanToNumber](#romantonumber)
- [degree](#degree)
- [chordTones](#chordtones)
- [melody](#melody)
- [noteCount](#notecount)
- [previousNote](#previousnote)
- [scaleIndex](#scaleindex)
- [frequency](#frequency)
- [weights](#weights)
- [distance](#distance)
- [totalWeight](#totalweight)
- [harmony](#harmony)
- [chordIndex](#chordindex)
- [currentChord](#currentchord)
- [harmonyNote](#harmonynote)
- [harmonyOptions](#harmonyoptions)
- [chordTones](#chordtones)
- [validOptions](#validoptions)
- [romanToNumber](#romantonumber)
- [degree](#degree)

---

## BGMGenerator

### コンストラクタ

```javascript
new BGMGenerator(audioContext)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `audioContext` | 説明なし |
| `scales` | 音楽理論定義 |
| `chordProgressions` | 説明なし |
| `rhythmPatterns` | 説明なし |
| `baseFrequency` | 基音周波数 (A4 = 440Hz) |

### メソッド

#### generateTrack

**シグネチャ**:
```javascript
 generateTrack(trackConfig)
```

**パラメーター**:
- `trackConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateTrack(trackConfig);

// generateTrackの実用的な使用例
const result = instance.generateTrack(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

スタイルに応じた生成

**シグネチャ**:
```javascript
 switch (style)
```

**パラメーター**:
- `style`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(style);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
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

#### generateAmbientTrack

**シグネチャ**:
```javascript
 generateAmbientTrack(buffer, config)
```

**パラメーター**:
- `buffer`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateAmbientTrack(buffer, config);

// generateAmbientTrackの実用的な使用例
const result = instance.generateAmbientTrack(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

低いオクターブ

**シグネチャ**:
```javascript
 for (let i = 0; i < buffer.length; i++)
```

**パラメーター**:
- `let i = 0; i < buffer.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < buffer.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateEnergeticTrack

**シグネチャ**:
```javascript
 generateEnergeticTrack(buffer, config)
```

**パラメーター**:
- `buffer`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateEnergeticTrack(buffer, config);

// generateEnergeticTrackの実用的な使用例
const result = instance.generateEnergeticTrack(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < buffer.length; i++)
```

**パラメーター**:
- `let i = 0; i < buffer.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < buffer.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ハイハット風効果

**シグネチャ**:
```javascript
 if (beatPosition < 0.05)
```

**パラメーター**:
- `beatPosition < 0.05`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(beatPosition < 0.05);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateExcitingTrack

**シグネチャ**:
```javascript
 generateExcitingTrack(buffer, config)
```

**パラメーター**:
- `buffer`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateExcitingTrack(buffer, config);

// generateExcitingTrackの実用的な使用例
const result = instance.generateExcitingTrack(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < buffer.length; i++)
```

**パラメーター**:
- `let i = 0; i < buffer.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < buffer.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (syncopatedPattern[patternIndex])
```

**パラメーター**:
- `syncopatedPattern[patternIndex]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(syncopatedPattern[patternIndex]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ドラム風キック

**シグネチャ**:
```javascript
 if (beatPosition < 0.1)
```

**パラメーター**:
- `beatPosition < 0.1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(beatPosition < 0.1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateDramaticTrack

**シグネチャ**:
```javascript
 generateDramaticTrack(buffer, config)
```

**パラメーター**:
- `buffer`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateDramaticTrack(buffer, config);

// generateDramaticTrackの実用的な使用例
const result = instance.generateDramaticTrack(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < buffer.length; i++)
```

**パラメーター**:
- `let i = 0; i < buffer.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < buffer.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ブラス風のメロディ（最高潮部分）

**シグネチャ**:
```javascript
 if (intensity > 0.7)
```

**パラメーター**:
- `intensity > 0.7`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(intensity > 0.7);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (i > reverbDelay)
```

**パラメーター**:
- `i > reverbDelay`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(i > reverbDelay);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getFrequencyFromNote

**シグネチャ**:
```javascript
 getFrequencyFromNote(note, octave = 4)
```

**パラメーター**:
- `note`
- `octave = 4`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getFrequencyFromNote(note, octave = 4);

// getFrequencyFromNoteの実用的な使用例
const result = instance.getFrequencyFromNote(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (semitones === undefined)
```

**パラメーター**:
- `semitones === undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(semitones === undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getChordFrequencies

**シグネチャ**:
```javascript
 getChordFrequencies(chordSymbol, rootFreq, scale)
```

**パラメーター**:
- `chordSymbol`
- `rootFreq`
- `scale`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getChordFrequencies(chordSymbol, rootFreq, scale);

// getChordFrequenciesの実用的な使用例
const result = instance.getChordFrequencies(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (degree === undefined)
```

**パラメーター**:
- `degree === undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(degree === undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateMelody

**シグネチャ**:
```javascript
 generateMelody(scale, rhythm, rootFreq)
```

**パラメーター**:
- `scale`
- `rhythm`
- `rootFreq`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateMelody(scale, rhythm, rootFreq);

// generateMelodyの実用的な使用例
const result = instance.generateMelody(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < noteCount; i++)
```

**パラメーター**:
- `let i = 0; i < noteCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < noteCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rhythm[i])
```

**パラメーター**:
- `rhythm[i]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rhythm[i]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### selectNextNote

**シグネチャ**:
```javascript
 selectNextNote(currentNote, scaleLength)
```

**パラメーター**:
- `currentNote`
- `scaleLength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.selectNextNote(currentNote, scaleLength);

// selectNextNoteの実用的な使用例
const result = instance.selectNextNote(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < scaleLength; i++)
```

**パラメーター**:
- `let i = 0; i < scaleLength; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < scaleLength; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < weights.length; i++)
```

**パラメーター**:
- `let i = 0; i < weights.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < weights.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (random <= 0)
```

**パラメーター**:
- `random <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(random <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateHarmony

**シグネチャ**:
```javascript
 generateHarmony(melody, chordProgression, scale)
```

**パラメーター**:
- `melody`
- `chordProgression`
- `scale`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateHarmony(melody, chordProgression, scale);

// generateHarmonyの実用的な使用例
const result = instance.generateHarmony(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (note)
```

**パラメーター**:
- `note`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(note);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### findHarmonyNote

**シグネチャ**:
```javascript
 findHarmonyNote(melodyNote, chord, scale)
```

**パラメーター**:
- `melodyNote`
- `chord`
- `scale`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.findHarmonyNote(melodyNote, chord, scale);

// findHarmonyNoteの実用的な使用例
const result = instance.findHarmonyNote(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (validOptions.length > 0)
```

**パラメーター**:
- `validOptions.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(validOptions.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getChordTones

**シグネチャ**:
```javascript
 getChordTones(chord, scale)
```

**パラメーター**:
- `chord`
- `scale`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getChordTones(chord, scale);

// getChordTonesの実用的な使用例
const result = instance.getChordTones(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `sampleRate` | 説明なし |
| `buffer` | 説明なし |
| `leftChannel` | 説明なし |
| `rightChannel` | 説明なし |
| `sampleRate` | 説明なし |
| `progression` | 説明なし |
| `scale` | 説明なし |
| `rootFreq` | 説明なし |
| `t` | 説明なし |
| `progress` | 説明なし |
| `chordIndex` | 説明なし |
| `chord` | 説明なし |
| `amplitude` | 説明なし |
| `modulation` | 説明なし |
| `delay` | 説明なし |
| `noise` | 説明なし |
| `leftChannel` | 説明なし |
| `rightChannel` | 説明なし |
| `sampleRate` | 説明なし |
| `tempo` | 説明なし |
| `beatDuration` | 説明なし |
| `progression` | 説明なし |
| `scale` | 説明なし |
| `rootFreq` | 説明なし |
| `bassRootFreq` | 説明なし |
| `t` | 説明なし |
| `beatPosition` | 説明なし |
| `currentBeat` | 説明なし |
| `chordIndex` | 説明なし |
| `chord` | 説明なし |
| `bassFreq` | 説明なし |
| `bassAmp` | 説明なし |
| `bassEnvelope` | 説明なし |
| `arpeggioSpeed` | 説明なし |
| `arpeggioIndex` | 説明なし |
| `arpeggioFreq` | 説明なし |
| `arpeggioEnvelope` | 説明なし |
| `padAmp` | 説明なし |
| `hihat` | 説明なし |
| `leftChannel` | 説明なし |
| `rightChannel` | 説明なし |
| `sampleRate` | 説明なし |
| `tempo` | 説明なし |
| `beatDuration` | 説明なし |
| `progression` | 説明なし |
| `scale` | 説明なし |
| `rootFreq` | 説明なし |
| `bassRootFreq` | 説明なし |
| `t` | 説明なし |
| `beatPosition` | 説明なし |
| `measureProgress` | 説明なし |
| `chordIndex` | 説明なし |
| `chord` | 説明なし |
| `bassFreq` | 説明なし |
| `syncopatedPattern` | 説明なし |
| `patternIndex` | 説明なし |
| `bassEnv` | 説明なし |
| `arpeggioSpeed` | 説明なし |
| `arpeggioIndex` | 説明なし |
| `arpeggioFreq` | 説明なし |
| `arpeggioEnv` | 説明なし |
| `kick` | 説明なし |
| `panPosition` | 説明なし |
| `leftChannel` | 説明なし |
| `rightChannel` | 説明なし |
| `sampleRate` | 説明なし |
| `duration` | 説明なし |
| `progression` | 説明なし |
| `scale` | 説明なし |
| `rootFreq` | 説明なし |
| `t` | 説明なし |
| `progress` | 説明なし |
| `intensity` | 説明なし |
| `chordIndex` | 説明なし |
| `chord` | 説明なし |
| `harmonicFreq` | 説明なし |
| `amplitude` | 説明なし |
| `noteLength` | 説明なし |
| `noteProgress` | 説明なし |
| `envelope` | 説明なし |
| `melodyScale` | 説明なし |
| `melodyIndex` | 説明なし |
| `melodyFreq` | 説明なし |
| `melodyAmp` | 説明なし |
| `timpani` | 説明なし |
| `reverbDelay` | 説明なし |
| `reverbSample` | 説明なし |
| `noteMap` | 説明なし |
| `baseNote` | 説明なし |
| `semitones` | 説明なし |
| `semitonesFromA4` | 説明なし |
| `romanToNumber` | 説明なし |
| `degree` | 説明なし |
| `chordTones` | 説明なし |
| `melody` | 説明なし |
| `noteCount` | 説明なし |
| `previousNote` | 説明なし |
| `scaleIndex` | 説明なし |
| `frequency` | 説明なし |
| `weights` | 説明なし |
| `distance` | 説明なし |
| `totalWeight` | 説明なし |
| `harmony` | 説明なし |
| `chordIndex` | 説明なし |
| `currentChord` | 説明なし |
| `harmonyNote` | 説明なし |
| `harmonyOptions` | 説明なし |
| `chordTones` | 説明なし |
| `validOptions` | 説明なし |
| `romanToNumber` | 説明なし |
| `degree` | 説明なし |

---

