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

### Jest設定エラー修正プロジェクト（Issue #79対応）
**目標**: Jest設定エラー「jest is not defined」を解決し、テストスイートが正常に実行できるようにする

#### 問題の概要
ES Modules環境でJestを使用する際の互換性問題により、テストセットアップファイルでJest関数（jest.fn()等）が未定義エラーとなり、全103個のテストスイートが失敗している。

#### 修正対象の問題
1. **ES Modules + Jest互換性問題**: `"type": "module"`設定とJestの`setupFilesAfterEnv`の組み合わせでJestグローバル未定義
2. **jest-canvas-mock依存関係**: 手動Canvas mockでJest関数が利用できない
3. **NODE_OPTIONS設定**: `--experimental-vm-modules`フラグ使用時の初期化タイミング問題

#### 実装アプローチ（9タスク）
- **Task 1**: Jest設定にES Modules互換性設定追加（extensionsToTreatAsEsm）
- **Task 2**: セットアップファイルでjest-canvas-mockインポート、手動モック削除
- **Task 3**: package.jsonスクリプトのNODE_OPTIONS調整、警告抑制
- **Task 4**: 基本テスト実行、「jest is not defined」エラー解消確認
- **Task 5**: 全既存テストファイルの実行確認、エラー修正
- **Task 6**: GitHub Actions等CI/CD環境でのテスト実行確認
- **Task 7**: Jest設定変更の文書化、トラブルシューティングガイド作成
- **Task 8**: テスト実行時間・カバレッジ比較、設定安定性確認
- **Task 9**: 不要コード削除、設定最適化、最終テスト実行確認

#### 推奨解決策
jest-canvas-mockパッケージ利用による解決：
- 既存パッケージでES Modules対応済み
- 設定が簡潔でコミュニティサポート充実
- 手動モック実装・メンテナンスコスト削減

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

### 実績システム実装プロジェクト（Issue #21対応）
**目標**: 基本的な実績システムを包括的なシステムに拡張し、ゲームプレイとの完全統合を実現

#### 実装対象の機能
1. **実績定義拡張**: 30個以上の多様な実績（スコア系、プレイ系、テクニック系、コレクション系）
2. **ゲームイベント統合**: BubbleManager、ScoreManager、GameSceneとのリアルタイム統合
3. **通知システム**: 実績解除時のポップアップ通知、キューイング機能
4. **UI実装**: UserInfoSceneでの実績表示、進捗バー、カテゴリ表示
5. **統計機能**: 実績統計、完了率分析、獲得AP表示

#### 実装アプローチ
- **Phase 1**: 実績定義拡張（30個以上の多様な実績）
- **Phase 2**: ゲームイベント統合システム（AchievementEventIntegrator）
- **Phase 3**: 実績通知システム（AchievementNotificationSystem）
- **Phase 4**: UserInfoScene統合（AchievementListUI、進捗表示）
- **Phase 5**: 統計システム（AchievementStatsUI、分析機能）

#### 重要な統合ポイント
- **BubbleManager**: 泡タイプ別統計とリアルタイム実績更新
- **ScoreManager**: スコア・コンボ実績の進捗追跡
- **GameScene**: ゲーム終了時の包括的実績チェック
- **StatisticsManager**: 実績統計との連携
- **EventSystem**: 統一されたイベント処理システム

### 統計システム強化プロジェクト（Issue #22対応）
**目標**: 基本的なStatisticsManagerを包括的な統計システムに拡張し、詳細統計収集、データ可視化、時系列分析機能を実装

#### 実装対象の機能
1. **詳細統計項目**: 20種類以上の統計項目（ゲームプレイ、スコア、泡関連、ステージ統計）
2. **時系列統計**: 日別・週別・月別の統計と成長トレンド分析
3. **データ可視化**: グラフ・図表表示（棒グラフ、線グラフ、円グラフ、プログレスバー）
4. **期間フィルター**: 期間別統計表示とデータ比較機能
5. **データエクスポート**: JSON、CSV、テキスト形式でのデータエクスポート
6. **パフォーマンス最適化**: バッチ処理、キャッシュ、非同期処理
7. **アクセシビリティ**: スクリーンリーダー対応、キーボードナビゲーション

#### 実装アプローチ
- **Phase 1**: StatisticsCollector（イベントキュー、バッチ処理）
- **Phase 2**: 拡張統計項目（20+項目）、時系列データ管理
- **Phase 3**: StatisticsAnalyzer（トレンド分析、比較分析、洞察生成）
- **Phase 4**: StatisticsVisualizer（グラフ描画、ダッシュボード）
- **Phase 5**: UserInfoScene統合（統計表示、期間フィルター）
- **Phase 6**: エクスポート機能、パフォーマンス最適化
- **Phase 7**: アクセシビリティ対応、テスト・統合

#### 重要な統合ポイント
- **StatisticsManager**: 中核システムの拡張・統合
- **UserInfoScene**: 統計表示UI、グラフ表示機能統合
- **GameEngine**: リアルタイム統計収集の最適化
- **PlayerData**: データ永続化、エクスポート・インポート機能
- **Canvas 2D API**: グラフ描画、レスポンシブ対応

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

### パフォーマンス・デバッグファイル分割プロジェクト Phase E.2（Issue #83対応）
**目標**: パフォーマンス・デバッグ関連の大容量ファイル（10ファイル）をMain Controller Patternで分割し、MCPツール互換性（2,500語以下）を実現

#### 問題の概要
MCPツール（find_symbol）が25,000トークン制限を超過してエラーになる。パフォーマンス・デバッグ関連の大容量ファイル（2,500語超）が原因。対象：
- PerformanceTestSuite.js（3,218語） - パフォーマンステストシステム
- PerformanceWarningSystem.js（3,211語） - パフォーマンス警告システム
- PerformanceMonitoringSystem.js（3,204語） - パフォーマンス監視システム
- PerformanceIntegrationTesting.js（2,938語） - 統合テストシステム
- BenchmarkSuite.js（3,373語） - ベンチマーク実行システム
- TestResultVisualizer.js（3,334語） - テスト結果可視化システム
- ErrorReporter.js（3,216語） - エラー報告システム
- MobileTestSuite.js（3,215語） - モバイルテストシステム
- MobileAccessibilityManager.js（2,618語） - モバイルアクセシビリティ管理
- MobileSystemIntegrator.js（2,472語） - モバイルシステム統合

#### 分割戦略（Main Controller Pattern）
1. **Main Controller Pattern**: 元クラスは軽量コントローラーとしてサブコンポーネントを統制
2. **機能分離**: 関連メソッドを専門クラスにグループ化（実行・収集・報告・分析など）
3. **API保持**: 後方互換性のため公開インターフェース維持
4. **依存注入**: サブコンポーネントをメインコントローラーに注入

#### 実装フェーズ（15大タスク）
- **Task 1**: プロジェクト準備・分析
- **Task 2-10**: 各ファイルの分割実装（PerformanceTestSuite → MobileAccessibilityManager）
- **Task 11**: 統合テスト・検証
- **Task 12**: MCPツール互換性検証
- **Task 13**: ドキュメント更新・クリーンアップ
- **Task 14**: 最終検証・プロジェクト健全性チェック
- **Task 15**: パフォーマンス効率性検証

#### パフォーマンス目標
- **ファイルサイズ**: 全ターゲットファイル2,500語以下
- **MCPツール**: find_symbol等のトークン制限エラー解消
- **サイズ削減**: メインコントローラー70%削減目標
- **API互換性**: 既存公開インターフェース完全保持

### 視覚効果強化プロジェクト（Issue #24対応）
**目標**: 既存のParticleManagerとEffectManagerを拡張し、より多様で魅力的な視覚効果を実現する包括的なシステムを実装

#### 実装対象の機能
1. **泡種類別パーティクル効果**: 18+種類の泡に特化した破壊エフェクト、15+パーティクル生成、物理演算強化
2. **段階的コンボエフェクト**: 2-5コンボ（基本金色）、6-10コンボ（画面フラッシュ）、11+コンボ（画面震動・ズーム・虹色）
3. **画面効果システム**: 遷移アニメーション、光源効果、影・反射、背景パーティクル、深度ブラー
4. **UIアニメーション**: 泡スポーン、メニュー遷移、スコア更新、ローディングアニメーション
5. **品質制御システム**: Low/Medium/High/Ultra品質、自動FPS調整、パフォーマンス監視
6. **季節限定エフェクト**: 春夏秋冬テーマ、イベント限定効果、カスタムテーマサポート
7. **モバイル最適化**: デバイス検出、タッチ最適化、バッテリー考慮、メモリ管理
8. **アクセシビリティ対応**: 高コントラスト、色覚異常サポート、動き制御、代替フィードバック

#### 実装アーキテクチャ
```
VisualEffectsSystem
├── EnhancedParticleManager (extends ParticleManager)
│   ├── BubbleEffectRenderer      // 泡種類別特殊効果
│   ├── ComboEffectRenderer       // 段階的コンボエフェクト
│   ├── SpecialEffectRenderer     // 特殊パーティクル効果
│   └── SeasonalEffectRenderer    // 季節限定エフェクト
├── EnhancedEffectManager (extends EffectManager)
│   ├── ScreenTransitionManager   // 画面遷移効果
│   ├── LightingEffectManager     // 光源・影・反射
│   └── BackgroundEffectManager   // 背景環境効果
├── AnimationManager              // UI・オブジェクトアニメーション
├── EffectQualityController       // 品質制御・パフォーマンス監視
└── SeasonalEffectManager         // テーマ・イベント管理
```

#### 実装フェーズ（13大タスク）
- **Task 1-3**: 完了（EnhancedParticleManager、泡種類別エフェクト、コンボシステム）
- **Task 4**: 進行中（EnhancedEffectManager - 画面効果強化）
- **Task 5**: UIアニメーションシステム（泡スポーン、メニュー遷移、スコア更新）
- **Task 6**: 品質制御システム（パフォーマンス監視、自動調整、リソース管理）
- **Task 7**: 季節限定エフェクト（テーマシステム、イベント効果、カスタマイズ）
- **Task 8**: システム統合（GameEngine、ConfigurationManager、AudioManager連携）
- **Task 9**: アクセシビリティ機能（視覚代替、設定統合、支援技術対応）
- **Task 10**: モバイル最適化（デバイス検出、タッチ最適化、バッテリー考慮）
- **Task 11**: 包括テストスイート（ユニット、統合、パフォーマンス、視覚テスト）
- **Task 12**: 開発ツール（デバッグUI、プロファイリング、最適化支援）
- **Task 13**: 最終統合（システム統合テスト、パフォーマンス最適化、品質保証）

#### 主要コンポーネント
- **EnhancedParticleManager**: 高度パーティクル管理、物理演算、品質スケーリング
- **EnhancedEffectManager**: 画面効果統合、光源・影システム、遷移アニメーション
- **AnimationManager**: UI・オブジェクトアニメーション制御、イージング関数
- **EffectQualityController**: 動的品質調整、パフォーマンス監視、リソース最適化
- **SeasonalEffectManager**: テーマ管理、季節限定効果、カスタムエフェクト

#### 既存システム統合ポイント
- **ParticleManager/EffectManager**: 既存システムを継承・拡張、互換性維持
- **GameEngine**: 全エフェクトシステムの統合管理、ライフサイクル制御
- **ConfigurationManager**: 品質設定、ユーザー設定、リアルタイム更新
- **AudioManager**: 音響・視覚効果の同期、統合フィードバック
- **PerformanceOptimizer**: 動的品質調整、メモリ管理、FPS監視

#### パフォーマンス目標
- **品質制御**: Ultra（150% particles）、High（100%）、Medium（50%）、Low（25%）
- **フレームレート**: 60FPS維持、30FPS以下で自動品質低下
- **メモリ使用**: オブジェクトプール活用、20%メモリ削減目標
- **モバイル対応**: デスクトップ性能の80%以上、バッテリー効率考慮

## プロジェクト情報

詳細なプロジェクト情報は以下のドキュメントを参照してください：

- **完了済みプロジェクト**: [docs/projects/completed-projects.md](docs/projects/completed-projects.md)
- **進行中プロジェクト**: [docs/projects/active-projects.md](docs/projects/active-projects.md)
- **アーキテクチャ設計**: [docs/architecture.md](docs/architecture.md)
- **開発ガイドライン**: [docs/development-guide.md](docs/development-guide.md)

### 主要完了プロジェクト
- データ管理強化（Issue #29）✅
- ServiceWorker修正（Issue #58）✅  
- ドキュメント強化（Issue #31）✅
- SEO最適化（Issue #34）✅

### 進行中プロジェクト
- MCPトークン制限問題修正（Issue #70）🔄
- 多言語対応強化（Issue #27）🔄
- イベントステージシステム（Issue #28）🔄
- PWA実装（Issue #33）🔄
- チュートリアルシステム（Issue #36）🔄
- ソーシャル機能強化（Issue #37）🔄

### MCPトークン制限問題修正プロジェクト（Issue #70対応）
**目標**: MCPツール（find_symbol）のトークン制限超過問題を解決し、開発効率を向上させる

#### 問題の概要
find_symbolツールが25,000トークン制限を超過してエラーになる。大きなファイル（特に2,500語以上）が原因。

#### 実装状況
**完了済みタスク**: 
- Task 1-13: 主要な大容量ファイルの分割完了
  - UserInfoScene.js（11,260語→複数ファイル）
  - EventStageManager.js（9,914語→933語）
  - MobilePerformanceOptimizer.js（8,405語→1,858語）
  - SoundEffectSystem.js（7,349語→1,208語）
  - TutorialOverlay.js（6,627語→1,634語）
  - 他、10以上のファイルを分割
- Task 17: MCPツール動作確認完了
- Task 18: プロジェクト健全性チェック（部分完了）

**残作業**:
- Task 14: 分割後の統合テスト
- Task 15: コンポーネント設計標準の策定
- Task 16: ドキュメントの更新

#### ファイルサイズ制限ルール
- **制限値**: 1ファイル2,500語以下を推奨
- **監視**: pre-commitフックとCIで自動チェック
- **分割基準**: 単一責任の原則に従ったコンポーネント分離

### ChallengeUIインポート修正プロジェクト（Issue #71対応）
**目標**: ChallengeUI関連コンポーネントのインポートエラーを修正し、ビルドの安定化を実現

#### 問題の概要
ChallengesTab.jsでインポートエラーが発生し、ビルドプロセスが失敗している：
- ChallengeUIの間違ったインポートパス（LeaderboardUI.jsから参照）
- 存在しないChallengeDetailModalクラスの参照
- 開発環境での動作不安定

#### 修正対象
1. **インポートパス修正**: `../../ui/components/LeaderboardUI.js` → `../../core/ChallengeUI.js`
2. **ChallengeDetailModal実装**: 新規作成（src/ui/components/ChallengeDetailModal.js）
3. **ビルド安定化**: インポートエラーの完全解決

#### 実装アプローチ
- **Phase 1**: インポートパスの即座修正
- **Phase 2**: ChallengeDetailModal基本実装
- **Phase 3**: モーダル機能拡充（UI、イベント処理）
- **Phase 4**: テスト・検証・統合

### 大容量ファイル分割プロジェクト（Issue #72対応）
**目標**: PerformanceOptimizer.js（5,092語）とComparisonEngine.js（5,043語）を2,500語以下に分割し、MCPツールの安定動作を実現

#### 問題の概要
MCPツール（find_symbol）が25,000トークン制限を超過してエラーになる。大容量ファイル（2,500語超）が原因。対象：
- PerformanceOptimizer.js（5,092語）
- ComparisonEngine.js（5,043語）

#### 分割戦略
1. **Main Controller Pattern**: 元クラスは軽量コントローラーとしてサブコンポーネントを統制
2. **機能分離**: 関連メソッドを専門クラスにグループ化
3. **API保持**: 後方互換性のため公開インターフェース維持
4. **依存注入**: サブコンポーネントをメインコントローラーに注入

#### PerformanceOptimizer分割設計
- **PerformanceOptimizer.js** (メインコントローラー): 公開API、統制、設定管理
- **PerformanceAnalyzer.js**: フレーム解析、メトリクス計算、安定性解析
- **PerformanceAdaptiveController.js**: 適応最適化、品質レベル調整
- **PerformanceStabilizerIntegrator.js**: 安定化統合、安定性解析

#### ComparisonEngine分割設計
- **ComparisonEngine.js** (メインコントローラー): 公開API、比較統制、結果集約
- **StatisticalAnalyzer.js**: 基本統計計算、有意性検定、効果量計算
- **StageComparisonAnalyzer.js**: ステージ特化比較、難易度調整メトリクス
- **ComparisonDataProcessor.js**: データ前処理、検証、ヘルパーユーティリティ

#### 実装フェーズ（9大タスク）
- **Task 1**: プロジェクト準備（ディレクトリ構造、監視ツール）
- **Task 2**: PerformanceOptimizer分析・準備（4サブタスク）
- **Task 3**: PerformanceOptimizer分割実装（3サブタスク）
- **Task 4**: ComparisonEngine分析・準備（4サブタスク）
- **Task 5**: ComparisonEngine分割実装（3サブタスク）
- **Task 6**: 統合テスト・検証（3サブタスク）
- **Task 7**: MCPツール互換性検証（2サブタスク）
- **Task 8**: ドキュメント・クリーンアップ（2サブタスク）
- **Task 9**: 最終検証・プロジェクト健全性チェック（2サブタスク）

### 古いファイルクリーンアップ（Issue #76対応）
**目標**: プロジェクト内の不要な`_old`や`_original`ファイルを安全に削除し、プロジェクトの整理とメンテナンス性向上を実現

#### 対象ファイル
- `src/core/AchievementManager_old.js` (80,507 bytes)
- `src/utils/AdvancedRenderingOptimizer_old.js` (14,106 bytes)  
- `src/scenes/MainMenuScene_original.js` (52,374 bytes)

#### 実装アプローチ
1. **FileScanner**: パターンマッチによるファイル検出、フィルタリング
2. **ReferenceChecker**: import文・文字列参照の検証
3. **SafetyValidator**: 削除安全性の多段階検証
4. **FileRemover**: バックアップ機能付き安全削除
5. **ReportGenerator**: 包括的な削除レポート生成

#### セキュリティ機能
- 削除前の複数段階安全性確認
- バックアップレコードによる削除履歴保持
- 誤削除時のロールバック機能
- 対応する現在ファイルの存在確認

### コアファイル分割プロジェクト Phase E.1（Issue #82対応）
**目標**: 重要なコアファイル7件をMain Controller Patternで分割し、MCPツール互換性（2,500語以下）を実現

#### 分割対象ファイル
1. **LeaderboardManager.js** (3,489語) → 4コンポーネント（DataProcessor、RankingManager、StorageManager）
2. **PWAManager.js** (2,968語) → 3コンポーネント（ServiceWorkerManager、InstallationManager）
3. **SettingsManager.js** (2,798語) → 3コンポーネント（Validator、StorageManager）
4. **ParticleManager.js** (2,728語) → 3コンポーネント（Renderer、LifecycleManager）
5. **StatisticsDashboard.js** (2,596語) → 2コンポーネント（ChartRenderer）
6. **DataManager.js** (2,578語) → 2コンポーネント（StorageManager）
7. **StageSelectScene.js** (2,573語) → 2コンポーネント（DataManager）

#### Main Controller Pattern設計
- **Main Controller**: 軽量オーケストレーター（<2,500語）、公開API維持
- **Sub-Components**: 機能特化クラス、単一責任原則
- **Dependency Injection**: サブコンポーネントの注入による統制
- **API Preservation**: 後方互換性のため既存インターフェース保持

#### ディレクトリ構造
```
src/
├── core/
│   ├── LeaderboardManager.js + leaderboard/
│   ├── PWAManager.js + pwa/
│   ├── SettingsManager.js + settings/
│   ├── DataManager.js + data/
│   └── StatisticsDashboard.js + statistics/
├── effects/
│   └── ParticleManager.js + particles/
└── scenes/
    └── StageSelectScene.js + stage-select/
```

#### 実装フェーズ（12大タスク）
- **Task 1**: プロジェクト準備・ディレクトリ構造作成
- **Task 2-8**: 各ファイルの分割実装（LeaderboardManager → StageSelectScene）
- **Task 9**: 統合テスト・検証
- **Task 10**: MCPツール互換性検証
- **Task 11**: ドキュメント更新・クリーンアップ
- **Task 12**: 最終検証・プロジェクト健全性チェック

#### パフォーマンス目標
- **ファイルサイズ**: 全ターゲットファイル2,500語以下
- **MCPツール**: find_symbol等のトークン制限エラー解消
- **サイズ削減**: メインコントローラー70%削減目標
- **API互換性**: 既存公開インターフェース完全保持