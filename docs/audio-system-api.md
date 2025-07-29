# 音響システム API 仕様書

> Issue #23 で実装された包括的な音響システムの開発者向けAPI仕様書

## 目次

1. [概要](#概要)
2. [アーキテクチャ](#アーキテクチャ)
3. [主要クラス](#主要クラス)
4. [API リファレンス](#api-リファレンス)
5. [使用例](#使用例)
6. [ベストプラクティス](#ベストプラクティス)
7. [トラブルシューティング](#トラブルシューティング)

## 概要

本音響システムは、HTML5 Canvas を使用したゲーム「BubblePop (awaputi)」向けに設計された包括的な音響処理システムです。以下の機能を提供します：

### 主要機能

- **BGMシステム**: プロシージャル生成、ループ機能、トランジション
- **効果音システム**: 10種類以上の泡タイプ別破壊音、コンボ音
- **音響制御**: マスター/BGM/SFX独立音量制御、イコライザー
- **アクセシビリティ**: 視覚的通知、字幕、触覚フィードバック
- **パフォーマンス最適化**: 自動品質調整、メモリ管理
- **エラーハンドリング**: 包括的なフォールバック機能

### 技術仕様

- **Web Audio API**: モダンブラウザの高性能音響処理
- **HTML5 Audio**: Web Audio API未対応時のフォールバック
- **ES6+ Modules**: モジュラー設計による高い拡張性
- **非同期処理**: Promise/async-await パターン

## アーキテクチャ

```
AudioManager (中核)
├── BGMSystem
│   ├── BGMGenerator (プロシージャル生成)
│   ├── BGMPlayer (再生・ループ)
│   └── BGMTransitionManager (フェード・クロスフェード)
├── SoundEffectSystem
│   ├── 泡タイプ別音響生成
│   ├── コンボシステム連携
│   └── UI操作音・実績音
├── AudioController
│   ├── 音量制御 (Master/BGM/SFX)
│   ├── イコライザー (5バンド)
│   └── 音響品質動的調整
├── 高度機能
│   ├── PresetManager (音響プリセット)
│   ├── EnvironmentalAudioManager (環境音)
│   └── 最適化システム
├── アクセシビリティ
│   ├── AudioAccessibilitySupport (視覚・聴覚支援)
│   ├── AudioVisualizer (音響視覚化)
│   └── VibrationManager連携 (触覚フィードバック)
└── 管理・監視
    ├── AudioErrorHandler (エラー処理・フォールバック)
    ├── AudioPerformanceMonitor (性能監視)
    ├── AudioCacheManager (キャッシュ管理)
    └── AudioDataOptimizer (データ最適化)
```

## 主要クラス

### AudioManager

中核となる音響管理クラス。全ての音響機能へのエントリーポイントを提供。

```javascript
import { AudioManager } from './src/audio/AudioManager.js';

const audioManager = new AudioManager();
```

#### 主要メソッド

| メソッド | 説明 | 戻り値 |
|---------|------|--------|
| `playSound(soundId, options)` | 効果音を再生 | `Promise<boolean>` |
| `playBGM(trackId, options)` | BGMを再生 | `Promise<boolean>` |
| `setVolume(type, volume)` | 音量を設定 | `void` |
| `setAudioEffect(effect, enabled)` | 音響効果の有効/無効 | `void` |
| `getStatus()` | 現在の状態を取得 | `Object` |

### BGMSystem

BGM関連の機能を管理。プロシージャル生成とトランジション機能を提供。

```javascript
// BGMの再生
audioManager.playBGM('ambient-track', {
    loop: true,
    fadeIn: 1000,
    volume: 0.7
});

// クロスフェードでBGM切り替え
audioManager.crossfadeBGM('upbeat-track', {
    fadeOutDuration: 2000,
    fadeInDuration: 2000
});
```

### SoundEffectSystem

効果音システム。泡の種類別、コンボレベル別の音響生成を提供。

```javascript
// 泡破壊音の再生
audioManager.playSound('bubblePop', {
    bubbleType: 'normal',
    volume: 0.8,
    pitch: 1.0
});

// コンボ達成音
audioManager.playSound('comboAchieved', {
    comboLevel: 5,
    volume: 1.0
});
```

### AudioController

音量制御とイコライザー機能を提供。

```javascript
// 音量制御
audioManager.setVolume('master', 0.8);
audioManager.setVolume('bgm', 0.6);
audioManager.setVolume('sfx', 0.9);

// イコライザー設定
audioManager.setEqualizer({
    bass: 1.2,      // 低音 (+20%)
    midLow: 1.0,    // 中低音 (±0%)
    mid: 0.9,       // 中音 (-10%)
    midHigh: 1.1,   // 中高音 (+10%)
    treble: 0.8     // 高音 (-20%)
});
```

### AudioAccessibilitySupport

アクセシビリティ機能を提供。視覚的通知、字幕、触覚フィードバック。

```javascript
// アクセシビリティ設定
audioManager.setAccessibilitySettings({
    visualFeedback: true,
    captioning: true,
    hapticFeedback: true,
    vibrationIntensity: 0.8
});

// 音響イベントの通知
audioManager.triggerAccessibilityEvent('bubblePop', {
    bubbleType: 'rainbow',
    position: { x: 100, y: 200 }
});
```

## API リファレンス

### AudioManager API

#### コンストラクタ

```javascript
new AudioManager(options = {})
```

**パラメータ:**
- `options` (Object): 初期化オプション
  - `autoStart` (boolean): 自動開始 (デフォルト: true)
  - `webAudioEnabled` (boolean): Web Audio API使用 (デフォルト: true)
  - `fallbackEnabled` (boolean): フォールバック有効 (デフォルト: true)

#### 音響再生

##### playSound(soundId, options)

効果音を再生します。

**パラメータ:**
- `soundId` (string): サウンドID
- `options` (Object): 再生オプション
  - `volume` (number): 音量 (0.0-1.0)
  - `pitch` (number): ピッチ (0.5-2.0)
  - `loop` (boolean): ループ再生
  - `fade` (number): フェードイン時間 (ms)

**戻り値:** `Promise<boolean>` - 再生成功時true

**例:**
```javascript
// 基本的な再生
await audioManager.playSound('bubblePop');

// オプション付き再生
await audioManager.playSound('explosion', {
    volume: 0.8,
    pitch: 1.2,
    fade: 200
});
```

##### playBGM(trackId, options)

BGMを再生します。

**パラメータ:**
- `trackId` (string): BGMトラックID
- `options` (Object): 再生オプション
  - `loop` (boolean): ループ再生 (デフォルト: true)
  - `volume` (number): 音量 (0.0-1.0)
  - `fadeIn` (number): フェードイン時間 (ms)
  - `quality` (string): 音質 ('low', 'medium', 'high')

**戻り値:** `Promise<boolean>` - 再生成功時true

**例:**
```javascript
// BGM再生
await audioManager.playBGM('game-music', {
    loop: true,
    volume: 0.7,
    fadeIn: 2000
});
```

#### 音量制御

##### setVolume(type, volume)

指定タイプの音量を設定します。

**パラメータ:**
- `type` (string): 音量タイプ ('master', 'bgm', 'sfx')
- `volume` (number): 音量値 (0.0-1.0)

**例:**
```javascript
audioManager.setVolume('master', 0.8);
audioManager.setVolume('bgm', 0.6);
audioManager.setVolume('sfx', 0.9);
```

##### toggleMute()

ミュート状態を切り替えます。

**戻り値:** `boolean` - 新しいミュート状態

**例:**
```javascript
const isMuted = audioManager.toggleMute();
console.log('ミュート状態:', isMuted);
```

#### 音響効果

##### setAudioEffect(effect, value)

音響効果を設定します。

**パラメータ:**
- `effect` (string): エフェクト名 ('reverb', 'compression', 'equalizer')
- `value` (boolean|Object): エフェクト設定

**例:**
```javascript
// リバーブ有効化
audioManager.setAudioEffect('reverb', true);

// イコライザー設定
audioManager.setAudioEffect('equalizer', {
    bass: 1.2,
    treble: 0.8
});
```

#### 状態取得

##### getStatus()

現在の音響システム状態を取得します。

**戻り値:** `Object` - システム状態

```javascript
const status = audioManager.getStatus();
console.log('マスター音量:', status.masterVolume);
console.log('アクティブ音響数:', status.activeSounds);
console.log('BGM再生中:', status.bgmPlaying);
```

#### プリセット管理

##### loadPreset(presetName)

音響プリセットを読み込みます。

**パラメータ:**
- `presetName` (string): プリセット名 ('game', 'music', 'movie', 'custom')

**例:**
```javascript
// ゲーム用プリセット
await audioManager.loadPreset('game');

// 音楽用プリセット
await audioManager.loadPreset('music');
```

##### savePreset(presetName, settings)

カスタムプリセットを保存します。

**パラメータ:**
- `presetName` (string): プリセット名
- `settings` (Object): 設定内容

**例:**
```javascript
audioManager.savePreset('my-preset', {
    masterVolume: 0.8,
    bgmVolume: 0.6,
    sfxVolume: 0.9,
    equalizer: { bass: 1.2, treble: 0.8 },
    effects: { reverb: true, compression: false }
});
```

### BGMSystem API

#### generateBGM(config)

プロシージャルBGMを生成します。

**パラメータ:**
- `config` (Object): 生成設定
  - `style` (string): 音楽スタイル ('ambient', 'upbeat', 'dramatic')
  - `duration` (number): 長さ (秒)
  - `complexity` (string): 複雑さ ('simple', 'medium', 'complex')
  - `key` (string): 調 ('C', 'D', 'E', etc.)
  - `tempo` (number): テンポ (BPM)

**戻り値:** `Promise<string>` - 生成されたBGMのID

**例:**
```javascript
const bgmId = await audioManager.generateBGM({
    style: 'ambient',
    duration: 60,
    complexity: 'medium',
    key: 'C',
    tempo: 80
});

await audioManager.playBGM(bgmId);
```

#### crossfadeBGM(newTrackId, options)

BGMをクロスフェードで切り替えます。

**パラメータ:**
- `newTrackId` (string): 新しいBGMのID
- `options` (Object): トランジション設定
  - `fadeOutDuration` (number): フェードアウト時間 (ms)
  - `fadeInDuration` (number): フェードイン時間 (ms)
  - `curve` (string): フェードカーブ ('linear', 'exponential')

**例:**
```javascript
await audioManager.crossfadeBGM('new-track', {
    fadeOutDuration: 2000,
    fadeInDuration: 2000,
    curve: 'exponential'
});
```

### SoundEffectSystem API

#### 泡タイプ別音響

```javascript
// 通常泡
audioManager.playSound('bubblePop', { bubbleType: 'normal' });

// 特殊泡
audioManager.playSound('bubblePop', { bubbleType: 'rainbow' });
audioManager.playSound('bubblePop', { bubbleType: 'electric' });
audioManager.playSound('bubblePop', { bubbleType: 'boss' });
```

#### コンボシステム連携

```javascript
// コンボレベル別音響
audioManager.playSound('comboAchieved', {
    comboLevel: 1,  // Great
    comboCount: 3
});

audioManager.playSound('comboAchieved', {
    comboLevel: 3,  // Excellent
    comboCount: 10
});
```

### AudioAccessibilitySupport API

#### 設定管理

##### updateAccessibilitySettings(settings)

アクセシビリティ設定を更新します。

**パラメータ:**
- `settings` (Object): アクセシビリティ設定
  - `visualFeedback` (boolean): 視覚的フィードバック
  - `captioning` (boolean): 字幕表示
  - `hapticFeedback` (boolean): 触覚フィードバック
  - `vibrationIntensity` (number): 振動強度 (0.0-1.0)

**例:**
```javascript
audioManager.updateAccessibilitySettings({
    visualFeedback: true,
    captioning: true,
    hapticFeedback: true,
    vibrationIntensity: 0.8
});
```

#### イベント通知

##### triggerAccessibilityEvent(eventType, eventData)

アクセシビリティイベントをトリガーします。

**パラメータ:**
- `eventType` (string): イベントタイプ
- `eventData` (Object): イベントデータ

**例:**
```javascript
// 泡破壊イベント
audioManager.triggerAccessibilityEvent('bubblePop', {
    bubbleType: 'rainbow',
    position: { x: 100, y: 200 },
    comboLevel: 2
});

// 実績解除イベント
audioManager.triggerAccessibilityEvent('achievementUnlocked', {
    achievementName: 'バブルマスター',
    rarity: 'epic'
});
```

## 使用例

### 基本的な使用方法

```javascript
import { AudioManager } from './src/audio/AudioManager.js';

// AudioManagerを初期化
const audioManager = new AudioManager();

// BGMを開始
await audioManager.playBGM('menu-music', {
    loop: true,
    volume: 0.7,
    fadeIn: 2000
});

// 効果音を再生
audioManager.playSound('bubblePop', {
    volume: 0.8,
    pitch: 1.0
});

// 音量を調整
audioManager.setVolume('master', 0.8);
audioManager.setVolume('sfx', 0.9);
```

### ゲームシーン統合

```javascript
class GameScene {
    constructor() {
        this.audioManager = new AudioManager();
        this.setupAudio();
    }
    
    async setupAudio() {
        // ゲーム用BGMを開始
        await this.audioManager.playBGM('game-music', {
            loop: true,
            volume: 0.6
        });
        
        // アクセシビリティ機能を有効化
        this.audioManager.updateAccessibilitySettings({
            visualFeedback: true,
            hapticFeedback: true
        });
    }
    
    onBubblePopped(bubble) {
        // 泡の種類に応じた音響再生
        this.audioManager.playSound('bubblePop', {
            bubbleType: bubble.type,
            volume: 0.8
        });
        
        // アクセシビリティイベント
        this.audioManager.triggerAccessibilityEvent('bubblePop', {
            bubbleType: bubble.type,
            position: bubble.position
        });
    }
    
    onComboAchieved(comboData) {
        // コンボ音響
        this.audioManager.playSound('comboAchieved', {
            comboLevel: comboData.level,
            comboCount: comboData.count,
            volume: 0.9
        });
    }
    
    onSceneTransition(newScene) {
        // BGMをフェードで切り替え
        const bgmMap = {
            'menu': 'menu-music',
            'game': 'game-music',
            'shop': 'shop-music'
        };
        
        if (bgmMap[newScene]) {
            this.audioManager.crossfadeBGM(bgmMap[newScene], {
                fadeOutDuration: 1500,
                fadeInDuration: 1500
            });
        }
    }
}
```

### 設定画面統合

```javascript
class AudioSettingsUI {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.createUI();
    }
    
    createUI() {
        // マスター音量スライダー
        this.masterVolumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            this.audioManager.setVolume('master', volume);
        });
        
        // BGM音量スライダー
        this.bgmVolumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            this.audioManager.setVolume('bgm', volume);
        });
        
        // プリセット選択
        this.presetSelect.addEventListener('change', (e) => {
            this.audioManager.loadPreset(e.target.value);
        });
        
        // アクセシビリティ設定
        this.hapticCheckbox.addEventListener('change', (e) => {
            this.audioManager.updateAccessibilitySettings({
                hapticFeedback: e.target.checked
            });
        });
    }
    
    updateUI() {
        const status = this.audioManager.getStatus();
        this.masterVolumeSlider.value = status.masterVolume;
        this.bgmVolumeSlider.value = status.bgmVolume;
        this.sfxVolumeSlider.value = status.sfxVolume;
    }
}
```

### カスタム音響生成

```javascript
// カスタム効果音の作成
class CustomSoundGenerator {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.audioContext = audioManager.audioContext;
    }
    
    generateCustomBubbleSound(bubbleType, options = {}) {
        const {
            frequency = 440,
            duration = 0.2,
            envelope = 'bubble',
            filter = 'lowpass'
        } = options;
        
        // オシレーターを作成
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        // 泡タイプ別の周波数設定
        const bubbleFrequencies = {
            normal: 440,
            rainbow: 660,
            electric: 880,
            boss: 220
        };
        
        oscillator.frequency.value = bubbleFrequencies[bubbleType] || frequency;
        
        // エンベロープ設定
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        // 音色設定
        oscillator.type = bubbleType === 'electric' ? 'sawtooth' : 'sine';
        
        // フィルター設定
        filterNode.type = filter;
        filterNode.frequency.value = frequency * 2;
        
        // 接続
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 再生
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        return {
            oscillator,
            gainNode,
            filterNode
        };
    }
}
```

## ベストプラクティス

### 1. 初期化とリソース管理

```javascript
// ✅ 良い例: 適切な初期化
class Game {
    async initialize() {
        this.audioManager = new AudioManager({
            autoStart: false,
            webAudioEnabled: true
        });
        
        // ユーザーアクション後に開始
        await this.waitForUserInteraction();
        await this.audioManager.start();
    }
    
    dispose() {
        // リソースの解放
        if (this.audioManager) {
            this.audioManager.dispose();
        }
    }
}

// ❌ 悪い例: 不適切な初期化
const audioManager = new AudioManager();
audioManager.playBGM('music'); // ユーザーアクション前に実行
```

### 2. エラーハンドリング

```javascript
// ✅ 良い例: 適切なエラーハンドリング
async function playGameSound(soundId, options) {
    try {
        const success = await audioManager.playSound(soundId, options);
        if (!success) {
            console.warn(`Failed to play sound: ${soundId}`);
            // フォールバック処理
            audioManager.playSound('default-sound');
        }
    } catch (error) {
        console.error('Audio playback error:', error);
        // サイレントフォールバック
    }
}

// ❌ 悪い例: エラーハンドリングなし
audioManager.playSound('unknown-sound'); // エラーが発生する可能性
```

### 3. パフォーマンス最適化

```javascript
// ✅ 良い例: 音響リソースのプリロード
class GameLoader {
    async preloadAudio() {
        const soundIds = [
            'bubblePop', 'comboAchieved', 'achievementUnlocked',
            'explosion', 'freeze', 'electric'
        ];
        
        await audioManager.preloadSounds(soundIds);
    }
}

// ✅ 良い例: 同時再生数の制限
audioManager.setMaxConcurrentSounds(10);

// ❌ 悪い例: 無制限の同時再生
for (let i = 0; i < 100; i++) {
    audioManager.playSound('bubblePop'); // パフォーマンス問題
}
```

### 4. アクセシビリティ配慮

```javascript
// ✅ 良い例: アクセシビリティ機能の統合
class AccessibleGame {
    setupAccessibility() {
        // ユーザー設定に基づいて有効化
        const settings = this.userSettings.getAccessibilitySettings();
        
        audioManager.updateAccessibilitySettings({
            visualFeedback: settings.visualImpairment,
            captioning: settings.hearingImpairment,
            hapticFeedback: settings.enableVibration
        });
    }
    
    onGameEvent(eventType, eventData) {
        // 通常の音響再生
        audioManager.playSound(eventType);
        
        // アクセシビリティイベントも同時に発火
        audioManager.triggerAccessibilityEvent(eventType, eventData);
    }
}
```

### 5. モバイル対応

```javascript
// ✅ 良い例: モバイルデバイス対応
class MobileOptimizedAudio {
    initialize() {
        const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
        
        this.audioManager = new AudioManager({
            autoStart: false,
            webAudioEnabled: !isMobile, // モバイルでは無効化を検討
            maxConcurrentSounds: isMobile ? 5 : 20,
            qualityMode: isMobile ? 'medium' : 'high'
        });
    }
    
    async startWithUserInteraction() {
        // モバイルでは必ずユーザーアクション後に開始
        document.addEventListener('touchstart', async () => {
            await this.audioManager.start();
        }, { once: true });
    }
}
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. 音響が再生されない

**症状:** `playSound()` や `playBGM()` を呼んでも音が鳴らない

**原因と解決方法:**
- **ユーザーアクション前の再生**: モダンブラウザではユーザーアクション後にのみ音響再生が可能
  ```javascript
  // 解決方法: ユーザーアクション後に開始
  document.addEventListener('click', async () => {
      await audioManager.start();
      audioManager.playBGM('music');
  }, { once: true });
  ```

- **Web Audio API未対応**: 古いブラウザでは Web Audio API が未対応
  ```javascript
  // 解決方法: フォールバック設定
  const audioManager = new AudioManager({
      fallbackEnabled: true
  });
  ```

#### 2. パフォーマンス問題

**症状:** 大量の効果音再生時にゲームが重くなる

**解決方法:**
```javascript
// 同時再生数を制限
audioManager.setMaxConcurrentSounds(10);

// 音質を下げる
audioManager.setQualityMode('medium');

// 不要な音響効果を無効化
audioManager.setAudioEffect('reverb', false);
```

#### 3. メモリリーク

**症状:** 長時間プレイでメモリ使用量が増加し続ける

**解決方法:**
```javascript
// 定期的なガベージコレクション
setInterval(() => {
    audioManager.garbageCollect();
}, 60000); // 1分間隔

// 不要なキャッシュのクリア
audioManager.clearAudioCache();
```

#### 4. モバイルでの音響問題

**症状:** モバイルデバイスで音響が途切れる、遅延する

**解決方法:**
```javascript
// モバイル最適化設定
if (isMobileDevice()) {
    audioManager.setMobileOptimizations({
        reducedQuality: true,
        limitedPolyphony: true,
        touchOptimized: true
    });
}
```

### デバッグ方法

#### 1. 状態確認

```javascript
// 現在の音響システム状態を確認
const status = audioManager.getStatus();
console.log('Audio Status:', status);

// エラーレポートの生成
const errorReport = audioManager.generateErrorReport();
console.log('Error Report:', errorReport);
```

#### 2. パフォーマンス監視

```javascript
// パフォーマンスメトリクスの取得
const metrics = audioManager.getPerformanceMetrics();
console.log('Performance Metrics:', metrics);

if (metrics.cpuUsage > 0.8) {
    console.warn('High CPU usage detected');
    audioManager.setQualityMode('low');
}
```

#### 3. ログレベル設定

```javascript
// デバッグログを有効化
audioManager.setLogLevel('debug');

// 特定カテゴリのログを有効化
audioManager.enableLogging(['bgm', 'sfx', 'errors']);
```

### エラーコード一覧

| コード | 説明 | 対処方法 |
|--------|------|----------|
| `AUDIO_INIT_FAILED` | AudioManager初期化失敗 | ブラウザ対応確認、フォールバック有効化 |
| `WEBAUDIO_UNSUPPORTED` | Web Audio API未対応 | HTML5 Audioフォールバック使用 |
| `AUDIO_DECODE_ERROR` | 音響ファイルデコード失敗 | ファイル形式確認、代替ファイル使用 |
| `MEMORY_LIMIT_EXCEEDED` | メモリ制限超過 | キャッシュクリア、品質設定下げる |
| `CONCURRENT_LIMIT_EXCEEDED` | 同時再生数制限超過 | maxConcurrentSounds設定調整 |

---

## 補足情報

### ブラウザ対応状況

| ブラウザ | Web Audio API | HTML5 Audio | 振動API | 推奨度 |
|----------|---------------|-------------|---------|---------|
| Chrome 66+ | 完全対応 | 対応 | 対応 | ⭐⭐⭐ |
| Firefox 60+ | 完全対応 | 対応 | 対応 | ⭐⭐⭐ |
| Safari 14+ | 部分対応 | 対応 | 非対応 | ⭐⭐ |
| Edge 79+ | 完全対応 | 対応 | 対応 | ⭐⭐⭐ |

### パフォーマンス指標

| 項目 | 目標値 | 許容値 |
|------|--------|--------|
| 音響再生遅延 | < 20ms | < 50ms |
| BGM生成時間 | < 2秒 | < 5秒 |
| メモリ使用量 | < 50MB | < 100MB |
| CPU使用率 | < 30% | < 70% |
| 同時再生数 | 20音 | 10音（モバイル） |

---

*このドキュメントは Issue #23 の音響システム強化に基づいて作成されました。*
*最新の情報については、プロジェクトのリポジトリを参照してください。*