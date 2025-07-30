# コード規約・スタイル

## 命名規則
- **変数・関数名**: English (camelCase) - `gameEngine`, `calculateScore`
- **クラス名**: PascalCase - `GameEngine`, `BubbleManager`
- **定数**: UPPER_SNAKE_CASE - `BUBBLE_TYPES`, `MAX_HP`
- **ファイル名**: PascalCase - `GameEngine.js`, `BubbleManager.js`

## コード構造
- **ES6+ クラス構文**: OOP設計
- **モジュールシステム**: import/export (.js拡張子必須)
- **JSDoc**: 型ヒント、API仕様書
- **コメント**: 日本語でのドキュメント

## ファイル構造パターン
```javascript
// 基本クラス構造
export class ComponentName {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.initialize();
    }
    
    initialize() {
        // 初期化処理
    }
    
    update(deltaTime) {
        // フレーム更新処理
    }
    
    render(ctx) {
        // 描画処理
    }
}
```

## 設計原則
- **責任分離**: 各クラスは単一責任
- **依存注入**: コンストラクタで依存関係注入
- **エラーハンドリング**: ErrorHandler中央管理
- **非同期処理**: async/await、適切なエラーバウンダリ
- **パフォーマンス**: オブジェクトプール、メモリ管理
- **アクセシビリティ**: ARIA属性、セマンティックHTML