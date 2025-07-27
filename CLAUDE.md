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

# デバッグモード
# http://localhost:8000?debug=true
# キーボードショートカット: Ctrl+Shift+D
```

### テスト実行
```bash
# ユニット・統合テスト
npm test

# E2Eテスト
npm run test:e2e

# パフォーマンステスト
npm run test:performance

# 全テストスイート
npm run test:all
```

### テスト修正プロジェクト（Issue #17対応）
**目標**: 136個の失敗テストを体系的に修正してCI/CD安定化

#### 修正対象の問題カテゴリ
1. **Jest Mock設定問題**: jest.fn()の未定義エラー、spy機能不足
2. **設定値不一致**: テスト期待値と実装デフォルト値の相違
3. **統合テスト依存関係**: コンポーネント初期化と依存関係の問題
4. **パフォーマンステスト不安定**: 非現実的な閾値と測定方法

#### 修正アプローチ
- **Phase 1**: Jest設定の有効化（setupFilesAfterEnv）
- **Phase 2**: モック標準化（jest.fn()への統一）
- **Phase 3**: 設定値同期（実装値との一致）
- **Phase 4**: 統合テスト依存関係修正
- **Phase 5**: パフォーマンス閾値調整
- **Phase 6**: 全体検証とCI/CD安定化

#### 重要な修正ポイント
- **PerformanceConfig**: targetFPS 50→60、現実的閾値設定
- **EffectsConfig**: パーティクル設定値の実装との同期
- **統合テスト**: 適切な依存関係初期化
- **性能テスト**: キャッシュ改善閾値5%→2%、分散許容値設定

### UserInfoScene実装プロジェクト（Issue #18対応）
**目標**: プレースホルダー状態のUserInfoSceneを完全な機能に拡張

#### 実装対象の機能
1. **統計表示**: 総プレイ時間、泡種類別破壊数、最高コンボ、ステージ別ベストスコア
2. **実績システム統合**: 解除済み実績表示、未解除実績の進捗表示
3. **ユーザー管理**: ユーザー名変更、データエクスポート/インポート機能
4. **レスポンシブUI**: 画面サイズ対応、アクセシビリティ機能

#### 実装アプローチ
- **Phase 1**: UserInfoScene基本構造、タブナビゲーション
- **Phase 2**: StatisticsDisplayComponent（基本・泡・コンボ・ステージ統計）
- **Phase 3**: AchievementDisplayComponent（実績表示・進捗バー）
- **Phase 4**: UserManagementComponent（ユーザー名変更・データ管理）
- **Phase 5**: レスポンシブ・アクセシビリティ・統合テスト

#### 重要な統合ポイント
- **StatisticsManager**: getDetailedStatistics()で統計データ取得
- **AchievementManager**: getAchievements()で実績データ取得
- **PlayerData**: ユーザー名更新、データエクスポート/インポート
- **ResponsiveCanvasManager**: レスポンシブレイアウト対応
- **ErrorHandler**: 包括的エラーハンドリング

### ゲームバランステスト同期プロジェクト（Issue #19対応）
**目標**: ゲームバランス設定とテストの同期を行い、設定値の統一とバランス調整のガイドライン作成

#### 問題の概要
現在、テストで期待される設定値と実際のGameBalance.jsの値に不整合があり、ゲームバランスとテストの信頼性に影響を与えています。主な不整合：
- Normal bubble score: テスト期待値10 vs 実装値15
- Boss bubble health: テスト期待値5 vs 実装値8
- Boss bubble size: テスト期待値100 vs 実装値90
- Electric bubble intensity: テスト期待値20 vs 実装値15
- Electric bubble duration: テスト期待値2000ms vs 実装値1500ms

#### 実装アプローチ
- **Phase 1**: 設定不整合の分析とドキュメント化
- **Phase 2**: 設定検証システムの作成
- **Phase 3**: 特定された設定不整合の解決
- **Phase 4**: 統一設定アクセスの実装
- **Phase 5**: バランス調整ガイドラインの作成
- **Phase 6**: 自動化された整合性チェックの実装
- **Phase 7**: 整合性のためのテストスイート更新
- **Phase 8**: ドキュメントと開発者ツールの作成

#### 主要コンポーネント
- **ConfigurationSynchronizer**: 設定ソース間の整合性確保
- **BalanceConfigurationValidator**: 設定値の検証ルール
- **TestConfigurationGenerator**: 正規設定からテスト期待値生成
- **BalanceGuidelinesManager**: バランス調整ガイドライン管理

### パフォーマンス最適化・安定性向上プロジェクト（Issue #20対応）
**目標**: フレームレート安定化、メモリ使用量最適化、パフォーマンス監視強化、モバイル対応改善

#### 主要改善項目
現在のパフォーマンス最適化システムの安定性と効率性を向上させる包括的な改善を実施：
- **フレームレート安定化**: 60FPS維持、フレーム時間分散解析、自動品質調整
- **メモリ管理強化**: 20%メモリ使用量削減、リーク検出、プロアクティブクリーンアップ
- **パフォーマンス監視**: リアルタイム警告システム、詳細メトリクス収集、ボトルネック特定
- **レンダリング最適化**: ダーティリージョン管理改善、ビューポートカリング、レイヤー最適化
- **パーティクル効果最適化**: インテリジェントカリング、品質スケーリング、パフォーマンス制御
- **モバイル最適化**: デバイス検出、タッチ最適化、バッテリー使用量考慮

#### 実装フェーズ（14大項目、48サブタスク）
- **Phase 1**: Enhanced PerformanceOptimizer（フレーム安定性解析、予測的問題検出）
- **Phase 2**: Frame Rate Stabilization（分散解析、自動安定化、フレームペーシング）
- **Phase 3**: Intelligent Memory Management（リーク検出、プロアクティブクリーンアップ、オブジェクトプール最適化）
- **Phase 4**: Performance Warning System（リアルタイム監視、ユーザーフレンドリー警告UI）
- **Phase 5**: Adaptive Quality Control（インテリジェント品質調整、検証・ロールバック）
- **Phase 6**: Advanced Rendering Optimization（ダーティリージョン管理、ビューポートカリング強化）
- **Phase 7**: Particle Effect Optimization（インテリジェントカリング、レンダリングパイプライン最適化）
- **Phase 8**: Mobile Performance Optimization（デバイス検出、モバイル特化最適化）
- **Phase 9**: Performance Testing System（包括的テストスイート、プロファイリングツール）
- **Phase 10-14**: 高度監視・診断、設定統合、エラー処理、統合テスト、ドキュメント

#### 主要コンポーネント
- **Enhanced PerformanceOptimizer**: 中央パフォーマンス管理、安定性向上、予測的調整
- **Intelligent MemoryManager**: 高度リーク検出、自動クリーンアップ、メモリ圧迫監視
- **PerformanceWarningSystem**: リアルタイム警告、最適化提案、トラブルシューティング
- **AdaptiveQualityController**: 段階的品質調整、視覚整合性維持、設定検証
- **MobilePerformanceAdapter**: デバイス特化最適化、タッチ最適化、バッテリー考慮
- **Advanced RenderOptimizer**: ダーティリージョン最適化、レイヤー管理、静的キャッシュ

#### パフォーマンス目標
- **安定性**: 95%シナリオで60FPS維持、フレーム分散5ms以下、24時間メモリリークゼロ
- **効率性**: メモリ使用量20%削減、レンダリング性能15%向上、自動回復機能
- **ユーザビリティ**: 2秒以内警告表示、1秒以内品質調整、モバイル性能デスクトップ10%以内

### 重要な特徴
- **ビルドプロセスなし**: 純粋なES6モジュール、直接ブラウザで実行
- **依存管理**: package.json でJest、Playwrightを管理（開発環境のみ）
- **テスト環境**: `test.html` でバブルタイプの個別テストが可能
- **高度な設定管理**: ConfigurationManagerによる統一設定システム

### 利用可能ツール
- **GitHub CLI (gh)**: GitHubリポジトリ操作、プルリクエスト管理、Issue管理
- **Playwright MCP**: ブラウザ自動化、E2Eテスト、ウェブUI操作
- **Jest**: ユニットテスト・統合テストフレームワーク
- **Vite**: 開発用ビルドツール（テスト環境）

### ドキュメント構成
- **docs/**: 包括的プロジェクトドキュメント
  - **configuration-system-api.md**: ConfigurationManager API仕様
  - **migration-guide.md**: 既存システムからの移行ガイド
  - **system-design-detailed.md**: 詳細システム設計書
  - **troubleshooting-guide.md**: トラブルシューティングガイド
  - **testing-procedures.md**: テスト手順書
  - **release-procedures.md**: リリース手順書
- **.kiro/specs/**: 機能仕様書
  - **configuration-refactoring/**: 設定管理システムリファクタリング仕様
    - **design.md**: アーキテクチャ設計
    - **requirements.md**: 要件定義（型安全性、メンテナンス性、パフォーマンス）
    - **tasks.md**: 実装タスク管理
- **.kiro/steering/**: プロジェクト規約
  - **project-conventions.md**: コーディング規約、テスト要件、デプロイ手順

## アーキテクチャ構造

### コアシステム (`src/core/`)
- **GameEngine.js**: メインゲームループ、全システムの統合管理
- **SceneManager.js**: シーン（画面）遷移管理（メニュー、ゲーム、ショップ等）
- **InputManager.js**: マウス/タッチ入力の統一処理
- **PlayerData.js**: プレイヤー進捗データの永続化（LocalStorage使用）
- **StageManager.js**: ステージ設定とコンフィグ管理
- **ItemSystem.js**: アイテム/ショップシステム
- **ConfigurationManager.js**: 統一設定管理システム（中央設定管理、キャッシュ、監視機能）
- **CalculationEngine.js**: 高性能計算エンジン（バランス計算、スコア計算等）
- **CacheSystem.js**: 高速データアクセス用キャッシュシステム
- **ValidationSystem.js**: 設定値・データ検証システム
- **LoggingSystem.js**: デバッグ・エラー追跡用ログシステム

### ゲームシーン (`src/scenes/`)
- **MainMenuScene.js**: メインメニュー、ユーザー登録
- **StageSelectScene.js**: ステージ選択画面
- **GameScene.js**: メインゲームプレイ
- **ShopScene.js**: アイテム購入インターフェース
- **UserInfoScene.js**: ユーザー情報表示画面（Issue #18対応、統計・実績・管理機能）

### ゲーム要素
- **BubbleManager.js**: バブルのスポーン、衝突検出、ライフサイクル管理
- **Bubble.js**: 個別バブルエンティティ（18+種類の特殊バブル）
- **ScoreManager.js**: スコアリング、コンボシステム

### 設定管理 (`src/config/`)
- **GameConfig.js**: ゲーム全体の設定（レンダリング、入力等）
- **GameBalance.js**: ゲームバランス設定（スコア、難易度、バブル特性等）
- **AudioConfig.js**: 音響システム設定
- **EffectsConfig.js**: 視覚効果・パーティクル設定
- **PerformanceConfig.js**: パフォーマンス最適化設定

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
- **統一設定管理**: ConfigurationManagerによる中央集権的設定制御
- **高性能計算**: CalculationEngineによる最適化された数値計算
- **キャッシュシステム**: 高頻度アクセスデータの高速化

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
- **ES6+ モジュール**: import/export 構文使用（.js拡張子必須）
- **日本語コメント**: コード内コメントは日本語で記述
- **クラスベース**: ES6 クラス構文を使用した OOP 設計
- **イベント型**: addEventListener パターンでのイベント処理
- **命名規則**: 
  - 変数・関数名: English（camelCase）
  - クラス名: PascalCase
  - 定数: UPPER_SNAKE_CASE
- **エラーハンドリング**: 中央集権的ErrorHandlerユーティリティ使用
- **非同期処理**: async/await パターン、適切なエラーバウンダリ実装

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

### 設定システム使用例
```javascript
// 統一設定管理システム
import { getConfigurationManager } from './core/ConfigurationManager.js';

const config = getConfigurationManager();

// 設定値の取得（キャッシュ付き高速アクセス）
const baseScore = config.get('game.scoring.baseScores.normal');
const bubbleMaxAge = config.get('game.bubbles.maxAge');

// 設定値の監視
config.watch('game.difficulty', (newValue, oldValue) => {
    console.log(`難易度が ${oldValue} から ${newValue} に変更されました`);
});

// バリデーション付き設定
config.set('game.player.maxHP', 100, {
    validate: value => value > 0 && value <= 200
});
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
- **オブジェクトプーリング**: バブル生成の最適化（実装済み）
- **効率的レンダリング**: Canvas 描画の最適化
- **メモリ管理**: イベントリスナーの適切な cleanup
- **バンドルサイズ制限**: JS < 500KB、CSS < 50KB（gzip圧縮後）
- **Lighthouse目標**: 全メトリクス >90
- **リソース最適化**: 遅延読み込み、アセット圧縮、コード分割

### ブラウザ互換性・アクセシビリティ
- **対象ブラウザ**: Chrome、Firefox、Safari、Edge（モダンブラウザ）
- **レスポンシブ**: ResponsiveCanvasManager でモバイル対応
- **キーボードナビゲーション**: KeyboardShortcutManager実装済み
- **スクリーンリーダー**: ARIA ラベル、セマンティック HTML
- **国際化**: LocalizationManager（日本語・英語対応）

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
- **Jest テストスイート**: 包括的ユニット・統合テスト実装済み
  - コアシステム: ConfigurationManager, CalculationEngine, CacheSystem等
  - 設定システム: GameConfig, GameBalance, AudioConfig等  
  - 計算エンジン: BalanceCalculator, ScoreCalculator, EffectsCalculator等
  - エラーハンドリング: ConfigurationErrorHandler, ValidationSystem等
- **Playwright E2E テスト**: 設定システム統合テスト実装済み
- **パフォーマンステスト**: 計算性能、メモリ使用量、設定アクセス速度テスト実装済み
- **Viteビルド設定**: テスト環境最適化完了
- **デプロイ設定**: Netlify, Vercel対応完了

✅ **Phase 5完了済み追加機能**
- **設定管理システム統合**: ConfigurationManager中央集権化
- **高性能計算エンジン**: CalculationEngine、各種Calculator実装
- **包括的テストスイート**: Jest、Playwright、パフォーマンステスト
- **開発者支援ツール**: デバッグ機能、トラブルシューティングガイド
- **プロジェクト標準化**: コーディング規約、ドキュメント体系化
- **アクセシビリティ・国際化**: 完全対応実装
- **レガシー互換性**: 段階的移行システム

🔄 **残りのタスク（Phase 5最終仕上げ）**
- [ ] SEO最適化とメタデータ設定
- [ ] PWA機能の実装
- [ ] 最終的なパフォーマンス調整

### 技術アーキテクチャの完成度
- **コアシステム**: 100%完了（GameEngine + ConfigurationManager統合）
- **設定管理**: 100%完了（統一設定システム、計算エンジン）
- **ゲームプレイ**: 100%完了（BubbleManager, ScoreManager, 18+バブルタイプ）
- **データ管理**: 100%完了（PlayerData, StatisticsManager, AchievementManager）
- **UI/UX**: 100%完了（全シーン、エフェクト、音響、アクセシビリティ）
- **最適化**: 100%完了（パフォーマンス、メモリ、レンダリング最適化）
- **テスト**: 100%完了（包括的ユニット、統合、E2E、パフォーマンステスト）
- **デプロイ**: 95%完了（ビルド設定、デプロイ環境、最終調整残り）

### ファイル構成の完成度
- **総JSファイル数**: 50+ファイル
- **コア機能**: 16ファイル（100%完了）- ConfigurationManager他新システム追加
- **設定管理**: 5ファイル（100%完了）- GameConfig, AudioConfig等
- **シーン**: 6ファイル（100%完了）
- **マネージャー**: 2ファイル（100%完了）
- **ユーティリティ**: 12ファイル（100%完了）
- **エフェクト・UI**: 4ファイル（100%完了）
- **テストスイート**: 25+ファイル（100%完了）- Jest, Playwright E2E

このプロジェクトは、モジュラー設計により高い拡張性と保守性を実現した、本格的なブラウザゲームです。