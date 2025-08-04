# 開発ガイドライン

## アーキテクチャ原則

### 1. コンポーネントベース設計
- 各機能は独立したコンポーネントとして実装
- 単一責任の原則（SRP）を厳守
- 疎結合・高凝集を維持

### 2. Main Controller Pattern（MCPツール対応）
**目的**: MCPツール（find_symbol）の25,000トークン制限を回避

**実装方法**:
1. 2,500語を超えるファイルは分割対象
2. 元クラスは軽量コントローラーとして維持
3. 機能をサブコンポーネントに分離
4. 依存性注入でサブコンポーネントを統合

**例**:
```javascript
// メインコントローラー（軽量）
export class PerformanceOptimizer {
    constructor() {
        // サブコンポーネントを注入
        this.analyzer = new PerformanceAnalyzer(this);
        this.controller = new PerformanceAdaptiveController(this);
        this.stabilizer = new PerformanceStabilizerIntegrator(this);
    }
    
    // 公開APIは維持（後方互換性）
    optimize() {
        return this.controller.optimize();
    }
}
```

### 3. イベント駆動アーキテクチャ
- カスタムイベントによる疎結合
- EventTarget APIの活用
- 非同期処理の適切な管理

## コーディング規約

### 命名規則
```javascript
// クラス名: PascalCase
class BubbleManager {}

// メソッド・変数: camelCase
const updateBubbles = () => {};
let currentScore = 0;

// 定数: UPPER_SNAKE_CASE
const MAX_BUBBLES = 100;
const DEFAULT_SPEED = 1.0;

// プライベートメソッド: アンダースコアプレフィックス
_calculateInternalState() {}

// ファイル名: PascalCase.js
// BubbleManager.js, GameEngine.js
```

### JSDocコメント（日本語）
```javascript
/**
 * バブルを更新する
 * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
 * @returns {void}
 */
updateBubbles(deltaTime) {
    // 実装
}
```

### ES6+機能の活用
```javascript
// アロー関数
const calculate = (a, b) => a + b;

// async/await
async function loadData() {
    try {
        const data = await fetch('/api/data');
        return await data.json();
    } catch (error) {
        console.error('データ読み込みエラー:', error);
    }
}

// 分割代入
const { x, y } = position;

// スプレッド構文
const newArray = [...oldArray, newItem];
```

## パフォーマンス最適化

### 1. Canvas最適化
- requestAnimationFrame使用
- オフスクリーンCanvas活用
- 不要な再描画を避ける

### 2. メモリ管理
- オブジェクトプール使用
- 適切なガベージコレクション
- メモリリーク防止

### 3. 60FPS維持
```javascript
// フレーム時間監視
const targetFrameTime = 1000 / 60; // 16.67ms
if (frameTime > targetFrameTime) {
    // 品質調整
}
```

## アクセシビリティ対応

### WCAG 2.1 AA準拠
1. **キーボードナビゲーション**: 全機能をキーボードで操作可能
2. **スクリーンリーダー対応**: ARIAラベル、ライブリージョン
3. **色覚異常対応**: 色だけに依存しない情報提供
4. **フォーカス管理**: 明確なフォーカス表示

### 実装例
```javascript
// ARIAラベル
element.setAttribute('aria-label', 'スタートボタン');

// ライブリージョン
element.setAttribute('aria-live', 'polite');
element.setAttribute('aria-atomic', 'true');

// キーボードイベント
element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        handleAction();
    }
});
```

## エラーハンドリング

### 包括的エラー処理
```javascript
try {
    // リスクのある処理
} catch (error) {
    ErrorHandler.logError(error, {
        component: 'BubbleManager',
        action: 'updateBubbles',
        severity: 'medium'
    });
    
    // グレースフルな回復
    this.recoverFromError();
}
```

### エラー分類
- **Critical**: ゲーム続行不可
- **High**: 機能に重大な影響
- **Medium**: 一部機能に影響
- **Low**: 軽微な問題

## セキュリティ考慮事項

### 1. XSS対策
- ユーザー入力のサニタイズ
- innerHTML使用を避ける
- textContent使用推奨

### 2. データ検証
```javascript
// 入力検証
validateInput(input) {
    if (typeof input !== 'string') return false;
    if (input.length > MAX_LENGTH) return false;
    if (!VALID_PATTERN.test(input)) return false;
    return true;
}
```

### 3. ローカルストレージ
- 機密情報を保存しない
- データ暗号化を検討
- 容量制限に注意

## Git ワークフロー

### ブランチ戦略
- `master`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `fix/*`: バグ修正
- `refactor/*`: リファクタリング

### コミットメッセージ
```
<type>(<scope>): <subject>

<body>

<footer>
```

例:
```
feat(bubble): Add rainbow bubble explosion effect

- Implemented particle system for rainbow effect
- Added color transition animation
- Optimized performance for mobile devices

Closes #123
```