# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**BubblePop (awaputi)** - HTML5 Canvas を使用したバブルポップゲーム
- **技術スタック**: Vanilla JavaScript (ES6+), HTML5 Canvas, Web APIs
- **アーキテクチャ**: コンポーネントベースのモジュラー設計
- **言語**: 日本語（UI、ドキュメント、コメント）

## 開発環境

### プロジェクト起動
```bash
# ローカル開発サーバー起動（推奨）
python -m http.server 8000
# または
npx serve .

# メインゲームアクセス
# http://localhost:8000

# テスト環境アクセス
# http://localhost:8000/test.html
```

### 重要な特徴
- **ビルドプロセスなし**: 純粋なES6モジュール、直接ブラウザで実行
- **外部依存なし**: package.json は存在せず、Vanilla JavaScript のみ使用
- **テスト環境**: `test.html` でバブルタイプの個別テストが可能

## アーキテクチャ構造

### コアシステム (`src/core/`)
- **GameEngine.js**: メインゲームループ、全システムの統合管理
- **SceneManager.js**: シーン（画面）遷移管理（メニュー、ゲーム、ショップ等）
- **InputManager.js**: マウス/タッチ入力の統一処理
- **PlayerData.js**: プレイヤー進捗データの永続化（LocalStorage使用）
- **StageManager.js**: ステージ設定とコンフィグ管理
- **ItemSystem.js**: アイテム/ショップシステム

### ゲームシーン (`src/scenes/`)
- **MainMenuScene.js**: メインメニュー、ユーザー登録
- **StageSelectScene.js**: ステージ選択画面
- **GameScene.js**: メインゲームプレイ
- **ShopScene.js**: アイテム購入インターフェース

### ゲーム要素
- **BubbleManager.js**: バブルのスポーン、衝突検出、ライフサイクル管理
- **Bubble.js**: 個別バブルエンティティ（12+種類の特殊バブル）
- **ScoreManager.js**: スコアリング、コンボシステム

## ゲーム仕様

### バブルタイプ（12+種類）
1. **通常系**: Normal（基本）、Stone/Iron/Diamond（硬い、複数クリック必要）
2. **特殊効果系**: 
   - Rainbow（ボーナスタイム発動）
   - Pink（HP回復）
   - Clock（時間停止効果）
   - Electric（画面震動 + 一時的操作無効）
   - Poison（ポップ時ダメージ）
   - Spiky（連鎖ダメージ）
   - Escaping（カーソルから逃げる）
   - Boss（大型、高HP）

### 進捗システム
- **AP (Awaputi Points)**: 消費可能ポイント（アイテム購入）
- **TAP (Total AP)**: 永続進捗指標
- **コンボシステム**: 連続ポップでボーナススコア
- **ステージアンロック**: 進捗ベースのコンテンツ解放

### ゲームメカニクス
- **目標**: 自動破裂前にバブルをポップ（破裂するとプレイヤーダメージ）
- **操作**: クリックでポップ、ドラッグで押し退け
- **制限時間**: 5分ステージ、段階的難易度上昇
- **HPシステム**: ダメージベース、未処理バブルからダメージ

## 技術的特徴

### 設計パターン
- **コンポーネントベース**: 責任分離された各システム
- **イベント駆動入力**: シーン間での統一入力処理
- **エンティティコンポーネント**: 設定可能なバブル特性・振る舞い
- **データ永続化**: LocalStorage でプレイヤー進捗管理

### 特殊効果システム
- **ボーナスタイム**: スコア倍率と視覚効果
- **時間停止**: バブルスポーン/移動の一時停止
- **画面震動**: Electric バブルによる妨害効果
- **コンボシステム**: 連続成功アクションの視覚フィードバック

### データ管理
- **LocalStorage**: プレイヤー進捗、ハイスコア、購入アイテム
- **自動保存**: 進捗の自動保存機能
- **データエクスポート/インポート**: ユーザーデータ管理機能

## 開発ガイドライン

### コード規約
- **ES6+ モジュール**: import/export 構文使用
- **日本語コメント**: コード内コメントは日本語で記述
- **クラスベース**: ES6 クラス構文を使用した OOP 設計
- **イベント型**: addEventListener パターンでのイベント処理

### ファイル構造パターン
```javascript
// 基本的なクラス構造
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

### ステージ設定例
```javascript
const STAGE_CONFIGS = {
    tutorial: { 
        duration: 60000, 
        bubbleTypes: ['normal'] 
    },
    normal: { 
        duration: 300000, 
        bubbleTypes: ['normal', 'stone', 'rainbow', 'pink', 'clock', 'score'] 
    }
    // 8+ 追加ステージタイプ
};
```

## 拡張性

### 新しいバブルタイプの追加
1. `src/bubbles/Bubble.js` で新しいタイプを定義
2. `BubbleManager.js` でスポーン/管理ロジック追加
3. ステージ設定で使用可能に設定

### 新しいシーンの追加
1. `src/scenes/` に新しいシーンクラス作成
2. `SceneManager.js` でシーン登録
3. 遷移ロジックの実装

### パフォーマンス考慮
- **オブジェクトプーリング**: バブル生成の最適化（実装予定）
- **効率的レンダリング**: Canvas 描画の最適化
- **メモリ管理**: イベントリスナーの適切な cleanup

## 現在の開発状況 (2025年7月時点)

### 完了済み機能 (Phase 1-4)

✅ **Phase 1: コア機能**
- ゲームエンジン基盤とゲームループ実装済み
- 基本泡クラスと泡管理システム完成
- 入力システム（マウス・タッチ統一処理）完成
- スコア・コンボシステム実装済み

✅ **Phase 2: ゲームプレイ機能**  
- 18+種類の特殊泡すべて実装済み（Normal, Stone/Iron/Diamond, Rainbow, Pink, Clock, Electric, Poison, Spiky, Escaping, Boss, Golden, Frozen, Magnetic, Explosive, Phantom, Multiplier等）
- HPシステムとゲームオーバー処理完成
- ドラッグ操作による泡の吹き飛ばし機能実装済み
- 特殊効果システム（ボーナスタイム、時間停止、画面震動、スコア倍率、磁力効果、爆発連鎖等）実装済み

✅ **Phase 3: ステージ・進歩システム**
- 10種類のステージタイプ実装済み（1分ステージ〜全部入りアワアワ）
- AP/TAPシステムとハイスコア記録機能完成
- アイテムシステム（ショップ、購入、効果適用）実装済み
- メインメニューとステージ選択画面完成

✅ **Phase 4: 追加コンテンツ・UI・UX システム（Task 29完了）**
- 6種類の新バブルタイプ（Golden, Frozen, Magnetic, Explosive, Phantom, Multiplier）実装済み
- 特別イベントステージシステム実装済み（Golden Rush, Phantom Night, Explosive Chaos等6種類）
- 実績システム実装済み（18種類の実績、進捗追跡、AP報酬）
- プレイヤー統計システム実装済み（詳細統計、セッション追跡、パフォーマンス分析）
- ユーザー情報管理画面実装済み
- フローティングテキストシステム実装済み
- パーティクル効果システム実装済み
- 音響効果システム（AudioManager）実装済み

### 現在の実装状況
- **Phase 1-4**: 完了（95%+）
- **Phase 5**: 部分完了（最適化・テスト・デプロイ）

### Phase 5の進捗状況

✅ **完了済み最適化・安定性機能**
- オブジェクトプーリングシステム実装済み（ObjectPool.js）
- パフォーマンス最適化システム実装済み（PerformanceOptimizer.js）
- レンダリング最適化実装済み（RenderOptimizer.js）
- メモリ管理システム実装済み（MemoryManager.js）
- エラーハンドリングシステム実装済み（ErrorHandler.js）
- ブラウザ互換性システム実装済み（BrowserCompatibility.js）
- レスポンシブCanvas管理実装済み（ResponsiveCanvasManager.js）
- 設定管理システム実装済み（SettingsManager.js）
- 国際化システム実装済み（LocalizationManager.js）
- キーボードショートカット実装済み（KeyboardShortcutManager.js）
- アナリティクス システム実装済み（Analytics.js）

✅ **完了済みテスト・ビルド機能**
- Jestユニットテストスイート実装済み（Bubble, GameBalance, GameEngine, PlayerData）
- Playwrightインテグレーション・E2Eテスト実装済み
- パフォーマンステスト実装済み
- Viteビルド設定最適化完了
- デプロイ設定（Netlify, Vercel）完了

🔄 **残りのタスク（Phase 5）**
- [ ] 包括的テストカバレッジの拡張
- [ ] 高度なアナリティクス機能
- [ ] SEO最適化とメタデータ設定
- [ ] PWA機能の実装

### 技術アーキテクチャの完成度
- **コアシステム**: 100%完了（GameEngine, SceneManager, InputManager等）
- **ゲームプレイ**: 100%完了（BubbleManager, ScoreManager, 18+バブルタイプ）
- **データ管理**: 100%完了（PlayerData, StatisticsManager, AchievementManager）
- **UI/UX**: 95%完了（全シーン、エフェクト、音響システム）
- **最適化**: 90%完了（パフォーマンス、メモリ、レンダリング最適化）
- **テスト**: 80%完了（ユニット、統合、E2Eテスト）
- **デプロイ**: 90%完了（ビルド設定、デプロイ環境）

### ファイル構成の完成度
- **総JSファイル数**: 35ファイル
- **コア機能**: 11ファイル（100%完了）
- **シーン**: 6ファイル（100%完了）
- **マネージャー**: 2ファイル（100%完了）
- **ユーティリティ**: 10ファイル（95%完了）
- **エフェクト・UI**: 4ファイル（100%完了）
- **設定・バランス**: 2ファイル（100%完了）

このプロジェクトは、モジュラー設計により高い拡張性と保守性を実現した、本格的なブラウザゲームです。