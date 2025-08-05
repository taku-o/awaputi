# ファイル構造・アーキテクチャ・設計パターン

## プロジェクト全体構造

```
awaputi/
├── src/                    # ソースコード
│   ├── core/              # コアゲームエンジン・マネージャー
│   ├── scenes/            # ゲームシーン（メニュー、ゲーム、設定等）
│   ├── bubbles/           # 泡の種類・泡管理システム
│   ├── effects/           # 視覚効果・パーティクルシステム
│   ├── audio/             # 音響システム・サウンドエフェクト
│   ├── ui/                # UIコンポーネント・ユーザーインターフェース
│   ├── utils/             # ユーティリティ関数・ヘルパー
│   ├── config/            # 設定ファイル・GameBalance
│   ├── locales/           # 多言語リソース（i18n）
│   ├── accessibility/     # アクセシビリティ機能
│   ├── analytics/         # 分析・統計システム
│   ├── seo/               # SEO最適化機能
│   ├── debug/             # デバッグ・テストツール
│   ├── styles/            # CSSスタイル
│   └── main.js            # エントリーポイント
├── tests/                 # テストファイル
│   ├── unit/              # 単体テスト
│   ├── integration/       # 統合テスト
│   ├── performance/       # パフォーマンステスト
│   ├── e2e/               # E2Eテスト
│   ├── mocks/             # モックファイル
│   └── setup.js           # テスト環境設定
├── docs/                  # ドキュメント
│   ├── developer-guides/  # 開発者ガイド
│   ├── projects/          # プロジェクト進捗管理
│   └── api-reference/     # API文書（自動生成）
├── tools/                 # 開発ツール
├── scripts/               # ビルド・デプロイスクリプト
├── dist/                  # ビルド出力ディレクトリ
├── index.html             # メインエントリーポイント
├── test.html              # テスト環境
├── package.json           # npm設定
├── vite.config.js         # Vite設定
├── jest.config.js         # Jest設定
└── CLAUDE.md              # プロジェクト指示書
```

## コアアーキテクチャ

### 1. ゲームエンジン（src/core/GameEngine.js）
```javascript
export class GameEngine {
    constructor() {
        this.sceneManager = new SceneManager(this);
        this.inputManager = new InputManager(this);
        this.configManager = new ConfigurationManager();
        this.running = false;
    }
    
    start() {
        this.gameLoop();
    }
    
    gameLoop() {
        // メインゲームループ
        // update() -> render() -> requestAnimationFrame()
    }
}
```

### 2. シーン管理システム（src/core/SceneManager.js）
- **MainMenuScene**: メインメニュー画面
- **GameScene**: ゲームプレイ画面
- **StageSelectScene**: ステージ選択画面
- **SettingsScene**: 設定画面
- **UserInfoScene**: ユーザー情報・統計画面
- **ItemShopScene**: アイテムショップ画面

### 3. コアマネージャー類
- **ConfigurationManager**: 統一設定管理
- **StatisticsManager**: 統計・分析データ管理
- **AchievementManager**: 実績システム管理
- **PlayerData**: プレイヤーデータ永続化
- **DataManager**: データ管理・バックアップ
- **LocalizationManager**: 多言語対応（i18n）

## 設計パターン

### 1. Main Controller Pattern（ファイルサイズ制限対応）
大容量ファイル（2,500語超）をMain Controller Patternで分割：

```javascript
// MainController.js（軽量オーケストレーター <2,500語）
export class StatisticsManager {
    constructor() {
        this.components = new Map();
        this.initializeComponents();
    }
    
    async initializeComponents() {
        // サブコンポーネント初期化
        this.components.set('collector', new StatisticsCollector(this));
        this.components.set('analyzer', new StatisticsAnalyzer(this));
        this.components.set('exporter', new StatisticsExporter(this));
    }
    
    // 公開API維持（後方互換性）
    getDetailedStatistics() {
        return this.components.get('analyzer').analyze();
    }
}

// SubComponent例: StatisticsCollector.js（専門機能 <2,500語）
export class StatisticsCollector {
    constructor(mainController) {
        this.mainController = mainController;
    }
    
    collectGameplayStats(gameData) {
        // 統計収集の専門ロジック
    }
}
```

### 2. コンポーネントベース設計
```javascript
export class BubbleManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.bubbles = [];
        this.bubbleTypes = new Map();
        this.initialize();
    }
    
    initialize() {
        this.loadBubbleTypes();
        this.setupBubblePool();
    }
    
    update(deltaTime) {
        for (const bubble of this.bubbles) {
            bubble.update(deltaTime);
        }
        this.handleCollisions();
        this.cleanupDestroyedBubbles();
    }
    
    render(ctx) {
        for (const bubble of this.bubbles) {
            bubble.render(ctx);
        }
    }
}
```

### 3. イベントドリブン設計
```javascript
// イベント発火
this.gameEngine.eventSystem.emit('bubblePopped', {
    type: bubble.type,
    score: bubble.score,
    position: bubble.position
});

// イベント購読
this.gameEngine.eventSystem.on('bubblePopped', (data) => {
    this.updateScore(data.score);
    this.createParticleEffect(data.position);
});
```

### 4. 統一設定管理パターン
```javascript
import { getConfigurationManager } from './core/ConfigurationManager.js';

const config = getConfigurationManager();

// ゲームバランス設定
const bubbleConfig = {
    normal: { health: 1, score: 10, size: 40 },
    stone: { health: 2, score: 20, size: 45 },
    boss: { health: 8, score: 100, size: 90 }
};

// 設定監視
config.watch('game.difficulty', (newValue, oldValue) => {
    this.adjustGameBalance(newValue);
});
```

## アクセシビリティアーキテクチャ

### WCAG 2.1 AA準拠システム
```javascript
// AccessibilityManager.js
export class AccessibilityManager {
    constructor(gameEngine) {
        this.focusManager = new FocusManager();
        this.screenReaderManager = new ScreenReaderManager();
        this.keyboardManager = new KeyboardAccessibilityManager();
        this.contrastManager = new ContrastManager();
    }
    
    // キーボードナビゲーション
    handleKeyboardNavigation(event) {
        switch(event.key) {
            case 'Tab': this.focusManager.focusNext(); break;
            case 'Enter': this.activateCurrentElement(); break;
            case 'Escape': this.returnToMainMenu(); break;
        }
    }
}
```

### 多言語対応アーキテクチャ
```javascript
// LocalizationManager.js
export class LocalizationManager {
    constructor() {
        this.currentLocale = 'ja-JP';
        this.translations = new Map();
        this.formatters = new Map();
    }
    
    t(key, params = {}) {
        const translation = this.translations.get(this.currentLocale)?.get(key);
        return this.interpolate(translation, params);
    }
    
    // 文化的適応
    formatNumber(number) {
        return this.formatters.get(this.currentLocale).number.format(number);
    }
}
```

## データフローアーキテクチャ

### 1. ゲームデータフロー
```
User Input → InputManager → GameScene → BubbleManager → ScoreManager → StatisticsManager → PlayerData
```

### 2. 設定データフロー
```
ConfigurationManager ←→ SettingsScene ←→ PlayerData ←→ LocalStorage
```

### 3. 実績・統計データフロー
```
GameEvent → AchievementManager → StatisticsManager → ExportManager → CloudStorage
```

## パフォーマンス最適化アーキテクチャ

### 1. オブジェクトプール
```javascript
export class BubblePool {
    constructor(maxSize = 100) {
        this.pool = [];
        this.maxSize = maxSize;
        this.preAllocate();
    }
    
    getBubble() {
        return this.pool.pop() || new Bubble();
    }
    
    returnBubble(bubble) {
        bubble.reset();
        if (this.pool.length < this.maxSize) {
            this.pool.push(bubble);
        }
    }
}
```

### 2. レンダリング最適化
```javascript
export class RenderingOptimizer {
    constructor() {
        this.dirtyRegions = [];
        this.viewportCulling = true;
        this.levelOfDetail = true;
    }
    
    render(ctx, entities) {
        // ビューポートカリング
        const visibleEntities = this.cullOutsideViewport(entities);
        
        // ダーティリージョン管理
        for (const region of this.dirtyRegions) {
            this.renderRegion(ctx, region, visibleEntities);
        }
    }
}
```

## テストアーキテクチャ

### 1. テスト構造
```
tests/
├── unit/              # 単体テスト（クラス・関数レベル）
├── integration/       # 統合テスト（コンポーネント間）
├── performance/       # パフォーマンステスト
├── e2e/              # E2Eテスト（ブラウザ）
├── mocks/            # モックファイル
│   ├── MockFactory.js # 統一モック生成
│   └── GameMocks.js   # ゲーム専用モック
└── setup.js          # テスト環境初期化
```

### 2. Mock Factory Pattern
```javascript
export class MockFactory {
    static createMockGameEngine() {
        return {
            currentScene: null,
            sceneManager: this.createMockSceneManager(),
            inputManager: this.createMockInputManager(),
            configManager: this.createMockConfigurationManager()
        };
    }
    
    static createMockBubble(type = 'normal') {
        return {
            type,
            x: 100, y: 100,
            health: 1,
            update: jest.fn(),
            render: jest.fn(),
            destroy: jest.fn()
        };
    }
}
```