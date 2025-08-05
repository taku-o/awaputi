# 技術スタック・コード規約・設計パターン

## 技術スタック

### 基本技術
- **JavaScript**: ES6+ (ES2015+), Vanilla JavaScript
- **HTML5**: Canvas API, Web APIs
- **CSS**: モダンCSS、レスポンシブデザイン
- **モジュールシステム**: ES Modules (`type: "module"`)

### 開発・ビルドツール
- **ビルドツール**: Vite 5.x
- **パッケージマネージャー**: npm
- **バンドラー**: Rollup (Vite内包)
- **最適化**: Terser（本番用圧縮）

### テスト環境
- **ユニット・統合テスト**: Jest 29.x (ES Modules対応)
- **E2Eテスト**: Playwright
- **テスト環境**: jsdom (jest-environment-jsdom)
- **モック**: jest-canvas-mock
- **カバレッジ**: Jest内蔵カバレッジツール

### デプロイメント
- **本番環境**: Netlify, Vercel, GitHub Pages
- **CI/CD**: GitHub Actions
- **パフォーマンス監視**: Lighthouse
- **PWA**: Service Worker, Web App Manifest

## コード規約

### 命名規則
- **変数・関数名**: English（camelCase）
  - 例: `bubbleManager`, `getCurrentScore()`
- **クラス名**: PascalCase
  - 例: `GameEngine`, `BubbleManager`
- **定数**: UPPER_SNAKE_CASE
  - 例: `STAGE_CONFIGS`, `DEFAULT_SETTINGS`
- **ファイル名**: PascalCase.js
  - 例: `GameEngine.js`, `BubbleManager.js`

### 言語使用方針
- **コメント**: 日本語で記述
- **変数・関数・クラス名**: 英語
- **ユーザー向けメッセージ**: 多言語対応（i18n）

### ES6+ モジュール規約
```javascript
// 必須: .js拡張子を明記
import { GameEngine } from './core/GameEngine.js';
import { BubbleManager } from '../managers/BubbleManager.js';

// 推奨: named export使用
export class ComponentName { ... }
export { UtilityFunction };

// 避ける: default export（デバッグ困難）
// export default class ComponentName { ... }
```

### クラス設計パターン
```javascript
export class ComponentName {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.initialized = false;
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    initialize() {
        // 初期化ロジック
        this.initialized = true;
    }
    
    /**
     * フレーム更新処理
     * @param {number} deltaTime - 前回フレームからの経過時間
     */
    update(deltaTime) {
        if (!this.initialized) return;
        // 更新ロジック
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} ctx - Canvas描画コンテキスト
     */
    render(ctx) {
        if (!this.initialized) return;
        // 描画ロジック
    }
    
    /**
     * リソース解放
     */
    destroy() {
        this.initialized = false;
        // クリーンアップ処理
    }
}
```

## 設計パターン

### Main Controller Pattern（大容量ファイル分割用）
MCPトークン制限（2,500語）対応の標準パターン：

```javascript
// MainController.js (軽量オーケストレーター)
export class MainController {
    constructor() {
        this.components = new Map();
        this.initializeComponents();
    }
    
    async initializeComponents() {
        // サブコンポーネントの初期化
        this.components.set('dataProcessor', new DataProcessor(this));
        this.components.set('validator', new Validator(this));
    }
    
    // 公開API維持（後方互換性）
    processData(data) {
        return this.components.get('dataProcessor').process(data);
    }
}
```

### 統一設定管理パターン
```javascript
import { getConfigurationManager } from './core/ConfigurationManager.js';

const config = getConfigurationManager();

// 設定値の取得（キャッシュ付き高速アクセス）
const baseScore = config.get('game.scoring.baseScores.normal');

// 設定値の監視
config.watch('game.difficulty', (newValue, oldValue) => {
    console.log(`難易度が ${oldValue} から ${newValue} に変更されました`);
});
```

### イベント処理パターン
```javascript
// addEventListener パターンを推奨
element.addEventListener('click', this.handleClick.bind(this));

// エラーハンドリング
import { getErrorHandler } from './utils/ErrorHandler.js';

try {
    // リスキーな処理
} catch (error) {
    getErrorHandler().handleError(error, { context: 'ComponentName' });
}
```

### 非同期処理パターン
```javascript
// async/await パターン推奨
async initialize() {
    try {
        await this.loadResources();
        await this.setupComponents();
        this.initialized = true;
    } catch (error) {
        this.handleError('Initialization failed', error);
    }
}
```

## アクセシビリティ規約

### WCAG 2.1 AA準拠
- **キーボードナビゲーション**: 完全対応必須
- **スクリーンリーダー**: ARIA属性適切使用
- **色彩コントラスト**: AA基準準拠
- **フォーカス管理**: 視覚的フォーカスインジケーター

### 実装例
```javascript
// ARIA属性の適切な使用
element.setAttribute('aria-label', '泡を割るボタン');
element.setAttribute('role', 'button');
element.setAttribute('tabindex', '0');

// キーボードイベント処理
element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        this.handleActivation();
    }
});
```