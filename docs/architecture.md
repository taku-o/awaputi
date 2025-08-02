# システムアーキテクチャ

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

## パフォーマンス考慮
- **オブジェクトプーリング**: バブル生成の最適化（実装済み）
- **効率的レンダリング**: Canvas 描画の最適化
- **メモリ管理**: イベントリスナーの適切な cleanup
- **バンドルサイズ制限**: JS < 500KB、CSS < 50KB（gzip圧縮後）
- **Lighthouse目標**: 全メトリクス >90
- **リソース最適化**: 遅延読み込み、アセット圧縮、コード分割

## ブラウザ互換性・アクセシビリティ
- **対象ブラウザ**: Chrome、Firefox、Safari、Edge（モダンブラウザ）
- **レスポンシブ**: ResponsiveCanvasManager でモバイル対応
- **キーボードナビゲーション**: KeyboardShortcutManager実装済み
- **スクリーンリーダー**: ARIA ラベル、セマンティック HTML
- **国際化**: LocalizationManager（日本語・英語対応）

## 技術アーキテクチャの完成度
- **コアシステム**: 100%完了（GameEngine + ConfigurationManager統合）
- **設定管理**: 100%完了（統一設定システム、計算エンジン）
- **ゲームプレイ**: 100%完了（BubbleManager, ScoreManager, 18+バブルタイプ）
- **データ管理**: 100%完了（PlayerData, StatisticsManager, AchievementManager）
- **UI/UX**: 100%完了（全シーン、エフェクト、音響、アクセシビリティ）
- **最適化**: 100%完了（パフォーマンス、メモリ、レンダリング最適化）
- **テスト**: 100%完了（包括的ユニット、統合、E2E、パフォーマンステスト）
- **デプロイ**: 95%完了（ビルド設定、デプロイ環境、最終調整残り）

## ファイル構成の完成度
- **総JSファイル数**: 50+ファイル
- **コア機能**: 16ファイル（100%完了）- ConfigurationManager他新システム追加
- **設定管理**: 5ファイル（100%完了）- GameConfig, AudioConfig等
- **シーン**: 6ファイル（100%完了）
- **マネージャー**: 2ファイル（100%完了）
- **ユーティリティ**: 12ファイル（100%完了）
- **エフェクト・UI**: 4ファイル（100%完了）
- **テストスイート**: 25+ファイル（100%完了）- Jest, Playwright E2E

## 拡張性

### 新しいバブルタイプの追加
1. `src/bubbles/Bubble.js` で新しいタイプを定義
2. `BubbleManager.js` でスポーン/管理ロジック追加
3. ステージ設定で使用可能に設定

### 新しいシーンの追加
1. `src/scenes/` に新しいシーンクラス作成
2. `SceneManager.js` でシーン登録
3. 遷移ロジックの実装

## 重要な特徴
- **ビルドプロセスなし**: 純粋なES6モジュール、直接ブラウザで実行
- **依存管理**: package.json でJest、Playwrightを管理（開発環境のみ）
- **テスト環境**: `test.html` でバブルタイプの個別テストが可能
- **高度な設定管理**: ConfigurationManagerによる統一設定システム
- **包括的アクセシビリティ**: WCAG 2.1 AA準拠、支援技術対応、多様なニーズ支援

## 利用可能ツール
- **GitHub CLI (gh)**: GitHubリポジトリ操作、プルリクエスト管理、Issue管理
- **Playwright MCP**: ブラウザ自動化、E2Eテスト、ウェブUI操作
- **Serena MCP**: セマンティックコード解析、シンボル検索、効率的コード編集、メモリ管理
- **Jest**: ユニットテスト・統合テストフレームワーク
- **Vite**: 開発用ビルドツール（テスト環境）

## ドキュメント構成
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