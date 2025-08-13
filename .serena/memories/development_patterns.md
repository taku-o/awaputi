# 開発パターンとベストプラクティス

## アーキテクチャパターン

### シングルトンパターン
多くのマネージャークラスで使用
```javascript
class ConfigurationManager {
  static instance = null;
  
  static getInstance() {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }
}
```

### イベント駆動パターン
カスタムイベントでコンポーネント間通信
```javascript
// イベント発火
window.dispatchEvent(new CustomEvent('gameStateChanged', { 
  detail: { state: 'playing' } 
}));

// イベントリスナー
window.addEventListener('gameStateChanged', (event) => {
  // 処理
});
```

### モジュールパターン
ES6モジュールでコード分離
```javascript
// 必ず.js拡張子を付ける
import { GameEngine } from './core/GameEngine.js';
export class BubbleManager { }
```

## エラーハンドリング

### 中央集権的エラー処理
```javascript
import { ErrorHandler } from '../utils/ErrorHandler.js';

try {
  // 処理
} catch (error) {
  ErrorHandler.log(error, 'ComponentName');
}
```

### 非同期エラー処理
```javascript
async function loadResource() {
  try {
    const data = await fetch(url);
    return await data.json();
  } catch (error) {
    ErrorHandler.log(error, 'ResourceLoader');
    return null; // フォールバック
  }
}
```

## パフォーマンス最適化

### Canvas描画最適化
- requestAnimationFrame使用
- 必要な部分のみ再描画
- オフスクリーンCanvas活用

### メモリ管理
- 不要なオブジェクトの適切な破棄
- イベントリスナーのクリーンアップ
- 大きな配列の効率的な管理

## i18n実装パターン

### 翻訳キー使用
```javascript
import { i18n } from '../locales/i18n.js';

// テキスト取得
const text = i18n.t('menu.startGame');

// 動的値の挿入
const message = i18n.t('game.score', { score: 1000 });
```

## アクセシビリティ

### ARIA属性の適切な使用
```javascript
element.setAttribute('role', 'button');
element.setAttribute('aria-label', i18n.t('accessibility.startButton'));
```

### キーボードナビゲーション
```javascript
element.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    // クリックと同じ処理
  }
});
```

## デバッグ機能

### デバッグモード
```javascript
// URLパラメータでデバッグモード
const urlParams = new URLSearchParams(window.location.search);
const debugMode = urlParams.get('debug') === 'true';

if (debugMode) {
  console.log('デバッグ情報');
}
```

### パフォーマンス計測
```javascript
const startTime = performance.now();
// 処理
const endTime = performance.now();
console.log(`処理時間: ${endTime - startTime}ms`);
```

## コンポーネント設計

### 責任の分離
- 1クラス1責任
- UIとロジックの分離
- データとビューの分離

### 依存性注入
```javascript
class GameScene {
  constructor(sceneManager, audioManager, i18n) {
    this.sceneManager = sceneManager;
    this.audioManager = audioManager;
    this.i18n = i18n;
  }
}
```

## ファイル構成

### 命名規則
- クラスファイル: `ClassName.js`
- ユーティリティ: `utilityName.js`
- 設定ファイル: `config-name.js`

### インポート順序
1. 外部ライブラリ（使用していない）
2. コアモジュール
3. マネージャー
4. ユーティリティ
5. 同一ディレクトリのファイル