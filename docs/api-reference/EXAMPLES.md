# 使用例集

このドキュメントは、主要なAPIクラスの実用的な使用例を提供します。

## 目次

- [AudioManager](#audiomanager)
- [AchievementManager](#achievementmanager)
- [ConfigurationManager](#configurationmanager)
- [GameEngine](#gameengine)
- [LocalizationManager](#localizationmanager)
- [StatisticsManager](#statisticsmanager)
- [BubbleManager](#bubblemanager)
- [ScoreManager](#scoremanager)

---

## AudioManager

**ファイル**: `audio/AudioManager.js`

### 基本的な使用方法

```javascript
// AudioManagerの基本的な使用例
const instance = new AudioManager();
instance.initialize();
```

### 高度な使用方法

```javascript
// AudioManagerの高度な使用例
const instance = new AudioManager();
// 高度な設定やカスタマイズ
instance.configure(advancedOptions);
```

### よくある使用パターン

**シングルトンパターン**: インスタンスの共有が必要な場合
**ファクトリーパターン**: 複数の種類のオブジェクト生成が必要な場合
**オブザーバーパターン**: 状態変更の通知が必要な場合

詳細な実装例については、プロジェクトのソースコードを参照してください。

---

## AchievementManager

**ファイル**: `core/AchievementManager.js`

### 基本的な使用方法

```javascript
// AchievementManagerの基本的な使用例
const instance = new AchievementManager();
instance.initialize();
```

### 高度な使用方法

```javascript
// AchievementManagerの高度な使用例
const instance = new AchievementManager();
// 高度な設定やカスタマイズ
instance.configure(advancedOptions);
```

### よくある使用パターン

**シングルトンパターン**: インスタンスの共有が必要な場合
**ファクトリーパターン**: 複数の種類のオブジェクト生成が必要な場合
**オブザーバーパターン**: 状態変更の通知が必要な場合

詳細な実装例については、プロジェクトのソースコードを参照してください。

---

## ConfigurationManager

**ファイル**: `core/ConfigurationManager.js`

### 基本的な使用方法

```javascript
// 設定管理システムの使用
import { getConfigurationManager } from './core/ConfigurationManager.js';

const configManager = getConfigurationManager();

// 設定値の取得
const masterVolume = configManager.get('audio', 'volumes.master', 0.7);

// 設定値の更新
configManager.set('audio', 'volumes.master', 0.8);

// 設定変更の監視
const watchId = configManager.watch('audio', 'volumes.master', (newValue, oldValue) => {
    console.log(`音量が ${oldValue} から ${newValue} に変更されました`);
});
```

### 高度な使用方法

```javascript
// 設定管理の高度な機能
const configManager = getConfigurationManager();

// バルク設定の適用
const gameSettings = {
    'game.difficulty': 'hard',
    'audio.volumes.master': 0.8,
    'effects.particles.maxCount': 300
};

Object.entries(gameSettings).forEach(([key, value]) => {
    const [category, ...keyParts] = key.split('.');
    configManager.set(category, keyParts.join('.'), value);
});

// 設定のバリデーション
const isValid = configManager.validate('audio', 'volumes.master', 1.5);
if (!isValid) {
    console.warn('Invalid volume setting');
}

// キャッシュのクリア
configManager.clearCache();
```

### よくある使用パターン

**シングルトンパターン**: インスタンスの共有が必要な場合
**ファクトリーパターン**: 複数の種類のオブジェクト生成が必要な場合
**オブザーバーパターン**: 状態変更の通知が必要な場合

詳細な実装例については、プロジェクトのソースコードを参照してください。

---

## GameEngine

**ファイル**: `core/GameEngine.js`

### 基本的な使用方法

```javascript
// ゲームエンジンの初期化と開始
const canvas = document.getElementById('gameCanvas');
const gameEngine = new GameEngine(canvas);

// 初期化
await gameEngine.initialize();

// ゲーム開始
gameEngine.start();

// ゲーム終了時のクリーンアップ
window.addEventListener('beforeunload', () => {
    gameEngine.destroy();
});
```

### 高度な使用方法

```javascript
// ゲームエンジンの高度な設定
const gameEngine = new GameEngine(canvas);

// パフォーマンス監視の有効化
gameEngine.enablePerformanceMonitoring(true);

// エラーハンドリングの設定
gameEngine.setErrorHandler((error, context) => {
    console.error('Game Error:', error, context);
    // エラー分析やレポート送信
});

// カスタムシーンの登録
gameEngine.registerScene('customScene', new CustomScene());

// ゲームループのカスタマイズ
gameEngine.setUpdateCallback((deltaTime) => {
    // カスタム更新処理
});
```

### よくある使用パターン

**シングルトンパターン**: インスタンスの共有が必要な場合
**ファクトリーパターン**: 複数の種類のオブジェクト生成が必要な場合
**オブザーバーパターン**: 状態変更の通知が必要な場合

詳細な実装例については、プロジェクトのソースコードを参照してください。

---

## LocalizationManager

**ファイル**: `core/LocalizationManager.js`

### 基本的な使用方法

```javascript
// LocalizationManagerの基本的な使用例
const instance = new LocalizationManager();
instance.initialize();
```

### 高度な使用方法

```javascript
// LocalizationManagerの高度な使用例
const instance = new LocalizationManager();
// 高度な設定やカスタマイズ
instance.configure(advancedOptions);
```

### よくある使用パターン

**シングルトンパターン**: インスタンスの共有が必要な場合
**ファクトリーパターン**: 複数の種類のオブジェクト生成が必要な場合
**オブザーバーパターン**: 状態変更の通知が必要な場合

詳細な実装例については、プロジェクトのソースコードを参照してください。

---

## StatisticsManager

**ファイル**: `core/StatisticsManager.js`

### 基本的な使用方法

```javascript
// StatisticsManagerの基本的な使用例
const instance = new StatisticsManager();
instance.initialize();
```

### 高度な使用方法

```javascript
// StatisticsManagerの高度な使用例
const instance = new StatisticsManager();
// 高度な設定やカスタマイズ
instance.configure(advancedOptions);
```

### よくある使用パターン

**シングルトンパターン**: インスタンスの共有が必要な場合
**ファクトリーパターン**: 複数の種類のオブジェクト生成が必要な場合
**オブザーバーパターン**: 状態変更の通知が必要な場合

詳細な実装例については、プロジェクトのソースコードを参照してください。

---

## BubbleManager

**ファイル**: `managers/BubbleManager.js`

### 基本的な使用方法

```javascript
// バブル管理システムの基本使用
const gameEngine = getGameEngine();
const bubbleManager = new BubbleManager(gameEngine);

// バブルのスポーン
bubbleManager.spawnBubble('normal', { x: 100, y: 100 });

// フレーム更新
const deltaTime = 16.67; // 60FPS
bubbleManager.update(deltaTime);

// 描画
const ctx = canvas.getContext('2d');
bubbleManager.render(ctx);
```

### 高度な使用方法

```javascript
// BubbleManagerの高度な使用例
const instance = new BubbleManager();
// 高度な設定やカスタマイズ
instance.configure(advancedOptions);
```

### よくある使用パターン

**シングルトンパターン**: インスタンスの共有が必要な場合
**ファクトリーパターン**: 複数の種類のオブジェクト生成が必要な場合
**オブザーバーパターン**: 状態変更の通知が必要な場合

詳細な実装例については、プロジェクトのソースコードを参照してください。

---

## ScoreManager

**ファイル**: `managers/ScoreManager.js`

### 基本的な使用方法

```javascript
// ScoreManagerの基本的な使用例
const instance = new ScoreManager();
instance.initialize();
```

### 高度な使用方法

```javascript
// ScoreManagerの高度な使用例
const instance = new ScoreManager();
// 高度な設定やカスタマイズ
instance.configure(advancedOptions);
```

### よくある使用パターン

**シングルトンパターン**: インスタンスの共有が必要な場合
**ファクトリーパターン**: 複数の種類のオブジェクト生成が必要な場合
**オブザーバーパターン**: 状態変更の通知が必要な場合

詳細な実装例については、プロジェクトのソースコードを参照してください。

---

## 統合使用例

### 基本的なゲーム初期化

```javascript
// 完全なゲーム初期化の例
async function initializeGame() {
    // 1. Canvas要素の取得
    const canvas = document.getElementById('gameCanvas');
    
    // 2. ゲームエンジンの初期化
    const gameEngine = new GameEngine(canvas);
    
    // 3. 設定管理システムの設定
    const configManager = getConfigurationManager();
    configManager.set('performance', 'optimization.targetFPS', 60);
    
    // 4. 音響システムの初期化
    const audioManager = new AudioManager();
    await audioManager.initialize();
    
    // 5. ゲーム開始
    await gameEngine.initialize();
    gameEngine.start();
    
    return gameEngine;
}

// 使用方法
initializeGame().then(gameEngine => {
    console.log('ゲームが正常に初期化されました');
}).catch(error => {
    console.error('初期化エラー:', error);
});
```

### 設定とパフォーマンスの最適化

```javascript
// パフォーマンス重視の設定例
function optimizeForPerformance() {
    const configManager = getConfigurationManager();
    
    // パフォーマンス設定
    configManager.set('performance', 'optimization.maxBubbles', 15);
    configManager.set('effects', 'particles.maxCount', 200);
    configManager.set('effects', 'particles.quality', 0.8);
    
    // 音響品質の調整
    configManager.set('audio', 'quality.sampleRate', 22050);
    
    console.log('パフォーマンス最適化設定を適用しました');
}
```

### エラーハンドリングとデバッグ

```javascript
// 包括的なエラーハンドリング例
function setupErrorHandling(gameEngine) {
    // ゲームエンジンのエラーハンドリング
    gameEngine.setErrorHandler((error, context) => {
        console.error('Game Engine Error:', error);
        // エラーレポートの送信やユーザー通知
    });
    
    // グローバルエラーハンドリング
    window.addEventListener('error', (event) => {
        console.error('Global Error:', event.error);
    });
    
    // Promise のエラーハンドリング
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason);
    });
}
```

---

*これらの例は実際のプロジェクトから抜粋したものです。最新の使用方法については、各クラスのドキュメントを参照してください。*
