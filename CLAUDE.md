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

### Debug Game Startup Issue修正プロジェクト（Issue #113対応）🔄
**目標**: ゲーム起動時の複数のJavaScriptエラーとログ無限ループを修正

#### 問題の概要
Issue #113で報告された5つの主要なJavaScriptエラーとログ無限ループ問題：
1. **targetFPS undefined エラー** - `Cannot read properties of undefined (reading 'targetFPS')`
2. **title undefined エラー** - `Cannot read properties of undefined (reading 'title')`
3. **quality level null エラー** - `Invalid quality level: null`
4. **load null エラー** - `Cannot read properties of null (reading 'load')`
5. **socialSharingManager.initialize エラー** - `this.gameEngine.socialSharingManager.initialize is not a function`

#### 修正状況（2025-08-08確認）
**✅ 技術的修正完了**: PR #114で全エラーが修正済み（27ファイル修正）
**⚠️ Issueステータス**: まだオープン状態（最終検証待ち）
**🔍 動作確認**: 開発サーバーでゲーム読み込み中で停止、詳細調査が必要

#### 現在の調査結果
- **Playwrightテスト**: ゲームが「読み込み中」状態で停止
- **コンソールログ**: 大量のログ出力（トークン制限超過レベル）
- **リソース読み込み**: 262個のJSファイルを正常読み込み
- **404エラー**: ヘルプファイルとフォントファイルで複数の404エラー

#### 次回作業計画
1. Container-Use環境での詳細デバッグ
2. ログ出力量の問題特定
3. ゲーム起動プロセスの段階的確認
4. Issue #113最終検証とクローズ

### テストスイート修復プロジェクト（Issue #106対応）
**目標**: Phase G完了後のテスト失敗（15/114ファイル失敗、13%失敗率）を修正し、95%以上の成功率を実現

#### 進捗状況（2025-01-08現在）
**完了済み項目**:
- ✅ API Method Consistency Resolution（Section 2）
  - StatisticsCollector.processBatch method 追加
  - AnimationManager の setEasingFunctions, setSubtleAnimations 実装
  - EnhancedParticleManager の setColorPalettes, setPhysicsEnhancements 実装
  - EnhancedEffectManager の setGradientProfiles 実装
  - ConfigurationManager の setDefault → setDefaultValue 修正

- ✅ Missing Dependencies Resolution（Section 3）
  - 包括的な IndexedDB mocking を Jest setup に追加
  - fake-indexeddb import を削除（setup.js のモックを使用）
  - MockFactory import path の修正

- ✅ Jest Environment Stability（Section 4）
  - Jest環境の安定化実装完了
  - ES Modules + Jest互換性向上
  - テスト実行分離の実装

**進行中項目**:
- 🔄 Module Path Resolution Analysis（Section 1） - Task 1.4が残存
- 🔄 Phase G Architecture Compatibility（Section 5） - 未着手
- 🔄 Specific Test File Repairs（Section 6） - 一部完了、継続修正中
- 🔄 Test Suite Validation（Section 7） - 未着手

#### 現在のテスト実行状況（2025-01-08 修正中）
- ✅ ES Moduleのエクスポート問題を修正（AudioAccessibilitySupport.js等）
- ✅ AudioManager API不整合を修正（setScene、fadeOutBGM、isMuted等）
- ✅ EnhancedParticleManager API不整合を修正（renderParticle、renderTrailParticle、clearAllParticles等）
- ✅ VisualFocusManager、VisualFeedbackManager API不整合を修正
- ✅ AudioAccessibilitySupportサブコンポーネント（AudioDescriptionManager、AudioCueManager）のAPI実装完了
- 🔄 パフォーマンステストでの閾値調整が必要
- 🔄 一部統合テストでのモック設定調整が必要

#### 完了した修正作業（2025-01-08）
- ✅ **Task 1-6**: 大部分完了
  - Module Path Resolution: import文の修正完了
  - API Method Consistency: 主要クラスのAPI実装完了
  - Missing Dependencies: 依存関係問題解決
  - Jest Environment Stability: 環境安定化完了
  - Phase G Architecture Compatibility: 互換性確保完了
  - Specific Test File Repairs: AchievementNotificationSystem 90%成功率達成

#### 主要成果
- 🎯 **AchievementNotificationSystem**: 21テスト中19テスト成功（90%成功率）
- 🔧 **API不整合問題**: AudioManager、EnhancedParticleManager、VisualFocusManager、VisualFeedbackManager等の修正完了
- 🏗️ **Phase Gアーキテクチャ**: import文・パス問題の修正完了
- 🧪 **Jest環境**: ES Modules互換性とテスト安定性の向上

#### 次回継続作業
- 残存するテストファイルの小さな修正
- パフォーマンステスト閾値の調整
- 全体テストスイートでの95%成功率確認

#### 主要問題カテゴリ
1. **モジュールパス不整合**: Phase G分割後のインポートパス破損
2. ✅ **API メソッド不一致**: enhancedParticleManager.enableBatchRendering等の未実装メソッド（解決済み）
3. ✅ **依存関係不足**: fake-indexeddb、inquirer等のパッケージ不足（解決済み）
4. **Jest環境不安定**: ES Modules + Jest環境teardown問題
5. **Phase G互換性**: 新アーキテクチャとの非互換性

#### 修正アプローチ（9フェーズ）
- **Phase 1**: モジュールパス解析・修正（TestPathResolver、パス検証）- 進行中
- ✅ **Phase 2**: APIメソッド一貫性修正（不足メソッド実装、期待値調整）- 完了
- ✅ **Phase 3**: 依存関係解決（パッケージインストール、モック代替）- 完了  
- **Phase 4**: Jest環境安定化（teardown修正、分離改善）
- **Phase 5**: Phase G互換性確保（アーキテクチャ検証、インターフェース修正）
- **Phase 6-8**: 特定テストファイル修正（PerformanceConfig、EnhancedEffectManager等）
- **Phase 9**: 最終統合・品質保証（95%成功率達成、回帰防止）

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

### 包括的テストスイート修正プロジェクト（Issue #97対応）
**目標**: 676/1338の失敗テスト（50%失敗率）を修正し、テストスイートの信頼性を95%以上に向上させる

#### 問題の概要
Jest設定問題、モック関数問題、API不整合、パフォーマンステスト不安定、E2Eテスト実行問題により、全体の50%のテストが失敗している。CI/CD安定化、開発効率向上、コード品質保証のために包括的修正が必要。

#### 主要問題カテゴリ
1. **Jest設定・ES Modules互換性**: "jest is not defined"エラー、モジュール依存関係解決
2. **モック関数標準化**: jest.fn()の一貫性、Canvas/Audio/Performance API模擬
3. **API整合性**: テスト期待値と実装の不一致（audioManager.getStatus()、analyticsAPI.evaluateCondition()等）
4. **パフォーマンステスト安定化**: 現実的な閾値設定、環境依存対応
5. **E2E環境分離**: Jest/Playwright実行環境の分離、テストタイプ別設定

#### 実装フェーズ（11段階）
- **Phase 1**: Jest設定・ES Modules互換性修正（jest-globals.js、設定更新）
- **Phase 2**: モック工場システム実装（MockFactory、Canvas/Audio/Performance標準化）
- **Phase 3**: API整合性修正（AnalyticsAPI、AudioManager実装同期）
- **Phase 4**: パフォーマンステスト安定化（環境対応閾値、再試行機能）
- **Phase 5**: E2Eテスト分離（Jest設定分割、npm script更新）
- **Phase 6**: クロス環境互換性（browser/console環境対応）
- **Phase 7**: エラー処理・回復システム（Jest/Mock/Performance エラー対応）
- **Phase 8**: テストファイル移行（AnalyticsAPI、Performance、全体）
- **Phase 9**: 検証・品質保証（成功率監視、整合性確認、環境テスト）
- **Phase 10**: ドキュメント・開発者体験（ガイドライン、ワークフロー統合）
- **Phase 11**: 最終統合・テスト（包括検証、安定性確認）

#### 技術アーキテクチャ
- **MockFactory System**: 標準化されたモック生成（Canvas、Audio、Performance、Analytics）
- **InterfaceValidator**: API実装とテスト期待値の整合性検証
- **PerformanceTestUtils**: 環境対応パフォーマンステスト（CI/Local/Production閾値）
- **JestErrorRecovery**: Jest設定エラーの自動回復・フォールバック
- **CrossEnvironmentManager**: ブラウザ/コンソール環境での一貫性保証

#### パフォーマンス目標
- **成功率**: 50%→95%以上（676失敗→67以下）
- **実行安定性**: CI/CD環境での一貫した結果
- **開発効率**: 設定問題による中断の排除
- **品質保証**: 実コード問題のみをテストで検出

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

### Syntax Error Fixes プロジェクト（Issue #686対応） 🔄
**目標**: 開発サーバー起動時に発生する複数のSyntaxErrorを修正し、クリーンなビルドプロセスを実現

#### 問題の概要
- **test-error-handler.html**: XSSテストコードの不適切な文字列リテラル処理
- **LocalizationManager.js**: 予期しないトークンエラー（調査中）
- **favicon.ico**: 404エラー（ファイル不足）

#### 実装状況
**進行予定**:
- Phase 1: 静的解析による問題特定
- Phase 2: 構文エラー修正（文字列エスケープ、トークン問題）
- Phase 3: リソース管理（favicon.ico対応）
- Phase 4: 検証とテスト

詳細情報: `docs/issues/issue-686-syntax-error-fixes.md`

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

### デバッグ・テストファイル分割プロジェクト Phase F.2（Issue #94対応）✅ 完了
**目標**: デバッグ・テスト関連の大容量ファイル（7ファイル）をMain Controller Patternで分割し、MCPツール互換性（2,500語以下）を実現

#### 完了した分割対象ファイル
MCPツール（find_symbol）の25,000トークン制限問題を解決。全7ファイルの分割が完了：
- MockDataGenerator.js（3,038語 → 1,095語） - モックデータ生成システム ✅ 完了
- EnhancedDebugInterface.js（2,766語 → 1,426語） - 高度デバッグインターフェース ✅ 完了
- TestConfigurationGenerator.js（2,756語 → 821語） - テスト設定生成システム ✅ 完了
- TestDataGenerationCommands.js（2,621語 → 1,276語） - テストデータ生成コマンド ✅ 完了
- TestFailureAnalyzer.js（2,618語 → 1,929語） - テスト失敗分析システム ✅ 完了
- TestSupportTools.js（2,527語 → 497語） - テストサポートツール ✅ 完了
- GameStateCommands.js（2,523語 → 924語） - ゲーム状態操作コマンド ✅ 完了

#### 達成された成果
- **平均サイズ削減**: 57%（18,569語 → 7,968語）
- **MCPツール互換性**: 全ファイル2,500語以下を達成
- **後方互換性**: 既存API完全保持
- **アーキテクチャ**: Main Controller Pattern統一適用

#### 分割戦略（Main Controller Pattern）
1. **Main Controller Pattern**: 元クラスは軽量オーケストレーター（<2,500語）、公開API維持
2. **機能分離**: 関連メソッドをデータ生成・テスト支援・分析別に専門クラス化
3. **依存注入**: サブコンポーネントをメインコントローラーに注入
4. **API保持**: 後方互換性のため既存インターフェース完全保持

#### ディレクトリ構造
```
src/debug/
├── mock/                           # MockDataGenerator components
├── interface/                      # EnhancedDebugInterface components  
├── commands/                       # TestDataGenerationCommands components
├── analysis/                       # TestFailureAnalyzer components
├── support/                        # TestSupportTools components
└── state/                          # GameStateCommands components

src/utils/test-configuration/       # TestConfigurationGenerator components
```

#### 実装フェーズ（10大タスク）
- **Task 1**: プロジェクト構造準備・ディレクトリ作成
- **Task 2**: MockDataGenerator分割（最大3,038語→4コンポーネント）
- **Task 3**: EnhancedDebugInterface分割（2,766語→4コンポーネント）
- **Task 4**: TestConfigurationGenerator分割（2,756語→4コンポーネント）
- **Task 5**: TestDataGenerationCommands分割（2,621語→4コンポーネント）
- **Task 6**: TestFailureAnalyzer分割（2,618語→4コンポーネント）
- **Task 7**: TestSupportTools分割（2,527語→4コンポーネント）
- **Task 8**: GameStateCommands分割（2,523語→4コンポーネント）
- **Task 9**: 包括的統合テスト・検証（全テスト、MCP互換性、パフォーマンス、後方互換性）
- **Task 10**: ドキュメント・最終検証（コンポーネント文書、API文書、開発ガイドライン）

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

### パフォーマンス・ユーティリティファイル分割プロジェクト Phase F.3（Issue #95対応）✅ 完了
**目標**: Issue #77のsub issueとして、パフォーマンス・ユーティリティ関連の大容量ファイル（5ファイル）をMain Controller Patternで分割し、MCPツール互換性（2,500語以下）を実現

#### 完了した分割対象ファイル
MCPツール（find_symbol）の25,000トークン制限問題を解決。全5ファイルの分割が完了：
- PerformanceDataAnalyzer.js（2,871語 → 512語） - パフォーマンスデータ分析システム ✅ 完了
- BalanceAdjustmentValidationRules.js（2,705語 → 498語） - バランス調整検証ルール ✅ 完了
- PerformanceDiagnostics.js（2,644語 → 487語） - パフォーマンス診断システム ✅ 完了
- PerformanceConfigurationIntegration.js（2,531語 → 495語） - パフォーマンス設定統合 ✅ 完了
- ErrorHandler.js（2,520語 → 523語） - エラーハンドリングシステム ✅ 完了

#### 達成された成果
- **平均サイズ削減**: 81%（13,271語 → 2,515語）
- **MCPツール互換性**: 全ファイル2,500語以下を達成
- **後方互換性**: 既存API完全保持
- **アーキテクチャ**: Main Controller Pattern統一適用

#### 分割戦略（Main Controller Pattern）
1. **Main Controller Pattern**: 元クラスは軽量オーケストレーター（<500語）として機能
2. **機能分離**: 関連メソッドを専門クラスにグループ化（メトリクス収集・データ処理・報告・分析）
3. **API保持**: 後方互換性のため公開インターフェース完全維持
4. **依存注入**: サブコンポーネントをメインコントローラーに注入

### 周辺ファイル分割プロジェクト Phase F.4（Issue #96対応）
**目標**: Issue #77のsub issueとして、周辺ファイル・ツール関連の大容量ファイル（7ファイル）をMain Controller Patternで分割し、MCPツール互換性（2,500語以下）を実現

#### 問題の概要
MCPツール（find_symbol）が25,000トークン制限を超過してエラーになる。周辺ファイル・ツール関連の大容量ファイル（2,500語超）の分割が必要。対象：
- tools/balance-adjuster.js（3,168語） - バランス調整ツール
- src/audio/AudioAccessibilitySupport.js（2,582語） - 音響アクセシビリティサポート
- src/seo/SEOTester.js（2,576語） - SEOテストシステム
- src/audio/AudioCacheManager.js（2,550語） - 音響キャッシュ管理
- tools/dashboard/dashboard.js（2,543語） - 開発ダッシュボード
- scripts/performance-impact-assessment.js（2,543語） - パフォーマンス影響評価
- src/scenes/components/ImportDialog.js（2,536語） - インポートダイアログ

#### 分割戦略（Main Controller Pattern）
1. **Main Controller Pattern**: 元ファイルは軽量オーケストレーター（<500語）として機能
2. **機能分離**: 関連メソッドを単一責任の専門クラスにグループ化
3. **ツール機能保持**: CLI・Web インターフェース完全保持
4. **API保持**: 後方互換性のため公開インターフェース完全維持
5. **依存注入**: サブコンポーネントをメインコントローラーに注入

#### 主要コンポーネント分割設計
- **balance-adjuster.js**: BalanceDataLoader、BalanceCalculator、BalanceValidator、BalanceExporter（4コンポーネント）
- **AudioAccessibilitySupport.js**: AudioDescriptionManager、AudioCueManager、AudioFeedbackManager、AudioSettingsManager（4コンポーネント）
- **SEOTester.js**: MetaTagValidator、StructuredDataValidator、PerformanceValidator、SEOReportGenerator（4コンポーネント）
- **AudioCacheManager.js**: LRUCacheImplementation、CacheMemoryManager、CacheDataLoader、CacheStatistics（4コンポーネント）
- **dashboard.js**: DashboardDataManager、DashboardVisualization、DashboardValidation、DashboardReporting（4コンポーネント）
- **performance-impact-assessment.js**: ResponseTimeAnalyzer、MemoryUsageAnalyzer、CPUImpactAnalyzer、PerformanceReporter（4コンポーネント）
- **ImportDialog.js**: ImportMethodSelector、ImportDataProcessor、ImportProgressManager、ImportResultHandler（4コンポーネント）

#### ディレクトリ構造
```
tools/
├── balance/
│   ├── balance-adjuster.js (Main Controller)
│   ├── BalanceDataLoader.js
│   ├── BalanceCalculator.js
│   ├── BalanceValidator.js
│   └── BalanceExporter.js
├── dashboard/
│   ├── dashboard.js (Main Controller)
│   ├── DashboardDataManager.js
│   ├── DashboardVisualization.js
│   ├── DashboardValidation.js
│   └── DashboardReporting.js

scripts/performance-assessment/
├── performance-impact-assessment.js (Main Controller)
├── ResponseTimeAnalyzer.js
├── MemoryUsageAnalyzer.js
├── CPUImpactAnalyzer.js
└── PerformanceReporter.js

src/audio/
├── accessibility/
│   ├── AudioAccessibilitySupport.js (Main Controller)
│   ├── AudioDescriptionManager.js
│   ├── AudioCueManager.js
│   ├── AudioFeedbackManager.js
│   └── AudioSettingsManager.js
├── cache/
│   ├── AudioCacheManager.js (Main Controller)
│   ├── LRUCacheImplementation.js
│   ├── CacheMemoryManager.js
│   ├── CacheDataLoader.js
│   └── CacheStatistics.js

src/seo/testing/
├── SEOTester.js (Main Controller)
├── MetaTagValidator.js
├── StructuredDataValidator.js
├── PerformanceValidator.js
└── SEOReportGenerator.js

src/scenes/components/dialogs/
├── ImportDialog.js (Main Controller)
├── ImportMethodSelector.js
├── ImportDataProcessor.js
├── ImportProgressManager.js
└── ImportResultHandler.js
```

#### 実装フェーズ（11大タスク）
- **Task 1**: プロジェクト構造準備・ディレクトリ作成
- **Task 2-8**: 各ファイルの分割実装（balance-adjuster → ImportDialog）
- **Task 9**: インポート・依存関係更新
- **Task 10**: 包括的テスト・検証（ユニット、統合、ツール機能、アクセシビリティ、SEO、UI）
- **Task 11**: ドキュメント更新・最終検証

#### パフォーマンス目標
- **ファイルサイズ**: 全ターゲットファイル2,500語以下
- **MCPツール**: find_symbol等のトークン制限エラー解消
- **サイズ削減**: メインコントローラー85%削減目標（500語以下）
- **ツール機能**: CLI・Web インターフェース完全保持
- **API互換性**: 既存公開インターフェース完全保持

### バックアップツールファイル最適化プロジェクト（Issue #85対応）
**目標**: Issue #77のsub issueとして、大容量ファイル分割プロジェクト Phase E.4を実装し、プロジェクト整理とMCPツール互換性向上を実現

#### 問題の概要
MCPツール（find_symbol）が25,000トークン制限を超過してエラーになる。残存する大容量ツール・テストファイル（2,500語超）の分割・最適化が必要。対象：
- `tools/api-doc-generator.js`（3,727語） - API文書生成ツール
- `tests/analytics/ComparisonEngine.test.js`（3,494語） - 比較エンジンテストスイート

#### 実装対象の機能
1. **バックアップファイル確認**: 既存バックアップファイル（*_old.js、*_original.js）の完全削除確認
2. **ツールファイル分割**: API文書生成ツールのMain Controller Pattern分割
3. **テストファイル最適化**: 比較エンジンテストの機能別分割・組織化
4. **プロジェクト構造最適化**: MCPツール互換性確保、不要ファイル削除

#### 分割戦略（Main Controller Pattern）
1. **Main Controller Pattern**: 元ファイルは軽量オーケストレーター（<2,500語）として機能
2. **機能分離**: 関連メソッドを単一責任の専門クラスにグループ化
3. **API保持**: 後方互換性のため公開インターフェース完全維持
4. **依存注入**: サブコンポーネントをメインコントローラーに注入

#### API文書生成ツール分割設計
```
tools/
├── api-doc-generator.js (Main Controller)
└── api-doc-generator/
    ├── APIDocParser.js         // ソースコード解析、JSDoc抽出
    ├── DocumentationGenerator.js // 文書構造生成、多言語対応
    ├── TemplateRenderer.js     // Markdown template処理、出力生成
    └── APIDocValidator.js      // 文書検証、整合性チェック
```

#### 比較エンジンテスト分割設計
```
tests/analytics/
├── ComparisonEngine.test.js (Main Test Suite)
└── comparison-engine-tests/
    ├── ComparisonEngineBasicTests.js      // 基本機能テスト
    ├── ComparisonEngineAdvancedTests.js   // 高度機能・エッジケース
    ├── ComparisonEnginePerformanceTests.js // パフォーマンス・スケーラビリティ
    └── ComparisonEngineIntegrationTests.js // 統合・システムテスト
```

#### 実装フェーズ（20大タスク）
- **Task 1**: バックアップファイル状況確認・完了
- **Task 2-8**: API文書生成ツール分割（分析・準備→4コンポーネント実装→統合→テスト）
- **Task 9-15**: 比較エンジンテスト分割（分析・準備→4テストスイート実装→統合→検証）
- **Task 16**: プロジェクト構造最適化・クリーンアップ
- **Task 17**: MCPツール互換性検証
- **Task 18**: 最終システム統合テスト
- **Task 19**: ドキュメント・変更履歴更新
- **Task 20**: 最終検証・プロジェクトコミット

#### 主要コンポーネント
- **APIDocParser**: ソースコード解析、クラス・メソッド抽出、JSDoc処理
- **DocumentationGenerator**: 文書構造生成、クロスリファレンス、多言語対応
- **TemplateRenderer**: Markdownテンプレート処理、スタイリング、出力生成
- **APIDocValidator**: 文書検証、リンク検証、整合性レポート
- **分割テストスイート**: 機能別テスト組織化、実行時間改善、保守性向上

#### パフォーマンス目標
- **ファイルサイズ**: 全ターゲットファイル2,500語以下
- **MCPツール**: find_symbol等のトークン制限エラー解消
- **後方互換性**: 既存API・CLI・ビルドプロセス完全保持
- **テスト効率**: 実行時間短縮、保守性向上、カバレッジ維持

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
- **ローカルファイル実行CORS問題修正（Issue #63）** 🔄 - 進行中
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

### ローカルファイル実行CORS問題修正プロジェクト（Issue #63対応）🔄
**目標**: ローカル環境でindex.htmlを直接ブラウザで開いた際に発生するCORSエラーとリソース読み込み問題を解決し、開発体験を改善

#### 問題の概要
現在、ローカルファイル実行時に以下の問題が発生：
1. **ES6モジュールのCORSエラー**: `file://`プロトコルでのモジュール読み込み制限
2. **X-Frame-Optionsメタタグエラー**: メタタグでの設定が適切ではない
3. **ファビコンファイルの不足**: 必要なファビコンファイル（favicon.ico、各サイズPNG）が存在しない
4. **開発サーバー使用の推奨不足**: README.mdでの開発サーバー使用方法の説明不足

#### 実装アプローチ（16タスク）
- **Phase 1**: Core Detection and Optimization (Tasks 1-2)
- **Phase 2**: Favicon Generation System (Tasks 3, 9)  
- **Phase 3**: Developer Guidance System (Tasks 4, 10)
- **Phase 4**: Integration and Management (Tasks 5-8)
- **Phase 5**: Testing and Optimization (Tasks 11-13)
- **Phase 6**: Final Integration (Tasks 14-16)

#### 主要コンポーネント
- **LocalExecutionDetector**: ローカル実行環境検出（`file://`プロトコル判定）
- **FaviconGenerator**: Canvas APIベースの動的ファビコン生成
- **MetaTagOptimizer**: ローカル実行時のセキュリティメタタグ最適化
- **DeveloperGuidanceSystem**: 非侵入的な開発者ガイダンス表示
- **LocalModeManager**: ローカル実行モード統合管理

#### 詳細仕様
詳細な仕様とタスクリストは `docs/projects/local-file-execution-cors-issue-63.md` および `.kiro/specs/local-file-execution-cors-issue-63/` を参照

### コアファイル分割プロジェクト Phase F.1（Issue #93対応）
**目標**: 最重要コアファイル7件をMain Controller Patternで分割し、MCPツール互換性（2,500語以下）を実現

#### 問題の概要
MCPツール（find_symbol）が25,000トークン制限を超過してエラーになる。最重要コアファイル（2,535-2,812語）が原因。対象：
- SettingsManager.js（2,812語） - 設定管理システム
- StatisticsDataRecovery.js（2,772語） - データ復旧・検証システム
- FocusManager.js（2,765語） - フォーカス管理・アクセシビリティ
- HelpEffectivenessAnalyzer.js（2,757語） - ヘルプ分析・効果測定
- MotionManager.js（2,754語） - モーション・アニメーション管理
- ChallengeUI.js（2,644語） - チャレンジユーザーインターフェース
- TimingAdjustmentManager.js（2,535語） - タイミング調整・キャリブレーション

#### 分割戦略（Main Controller Pattern）
1. **Main Controller Pattern**: 元クラスは軽量オーケストレーター（<2,500語）、公開API維持
2. **機能分離**: 関連メソッドを専門クラスにグループ化（データ管理、UI制御、検証、設定など）
3. **依存注入**: サブコンポーネントをメインコントローラーに注入
4. **API保持**: 後方互換性のため既存インターフェース完全保持

#### 主要コンポーネント分割設計
- **SettingsManager**: DataManager、UIController、ExportImport（4コンポーネント）
- **StatisticsDataRecovery**: RecoveryStrategies、RecoveryValidation、RecoveryUserGuidance（4コンポーネント）
- **FocusManager**: FocusNavigation、FocusRingRenderer、FocusTrapManager（4コンポーネント）
- **HelpEffectivenessAnalyzer**: MetricsCollector、DataAnalyzer、ReportGenerator（4コンポーネント）
- **MotionManager**: ConfigManager、AnimationController、VestibularSafetyManager（4コンポーネント）
- **ChallengeUI**: UIRenderer、InteractionHandler、DataController（4コンポーネント）
- **TimingAdjustmentManager**: Calibrator、AdjustmentAlgorithms、FeedbackSystem（4コンポーネント）

#### ディレクトリ構造
```
src/core/
├── settings/
│   ├── SettingsManager.js (Main Controller)
│   ├── SettingsDataManager.js
│   ├── SettingsUIController.js
│   └── SettingsExportImport.js
├── statistics/
│   ├── StatisticsDataRecovery.js (Main Controller)
│   ├── RecoveryStrategies.js
│   ├── RecoveryValidation.js
│   └── RecoveryUserGuidance.js
└── [他のコンポーネント]/
```

#### 実装フェーズ（10大タスク）
- **Task 1**: プロジェクト構造準備・ディレクトリ作成
- **Task 2-8**: 各ファイルの分割実装（SettingsManager → TimingAdjustmentManager）
- **Task 9**: 包括的統合テスト・検証（全テスト、MCP互換性、パフォーマンス、エラー処理）
- **Task 10**: ドキュメント・最終検証（アーキテクチャ文書、API文書、開発ガイドライン）

#### パフォーマンス目標
- **ファイルサイズ**: 全ターゲットファイル2,500語以下
- **MCPツール**: find_symbol等のトークン制限エラー解消
- **サイズ削減**: メインコントローラー70%削減目標
- **API互換性**: 既存公開インターフェース完全保持

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

### アクセシビリティファイル分割プロジェクト Phase E.3（Issue #84対応）
**目標**: アクセシビリティ関連の大容量ファイル（6ファイル）をMain Controller Patternで分割し、MCPツール互換性（2,500語以下）を実現し、WCAG 2.1 AA準拠レベルを完全維持

#### 問題の概要
MCPツール（find_symbol）が25,000トークン制限を超過してエラーになる。アクセシビリティ関連の大容量ファイル（2,500語超）が原因。対象：
- KeyboardNavigationTester.js（3,116語） - キーボードナビゲーションテストシステム
- WCAGValidator.js（2,931語） - WCAG準拠検証システム
- ScreenReaderSimulator.js（2,872語） - スクリーンリーダーシミュレーションシステム
- AccessibilityOnboarding.js（2,775語） - アクセシビリティオンボーディングシステム
- ColorContrastAnalyzer.js（2,719語） - 色彩コントラスト分析システム
- AccessibilitySettingsUI.js（2,697語） - アクセシビリティ設定UIシステム

#### 分割戦略（Main Controller Pattern + アクセシビリティ対応）
1. **Main Controller Pattern**: 元クラスは軽量オーケストレーター（<2,500語）、公開API維持
2. **アクセシビリティ保持**: WCAG 2.1 AA準拠レベルを分割後も完全維持
3. **支援技術互換性**: スクリーンリーダー・キーボードナビゲーション対応保持
4. **機能分離**: 関連メソッドをアクセシビリティ要件別に専門クラス化
5. **依存注入**: サブコンポーネントをメインコントローラーに注入
6. **エラー処理**: アクセシビリティ機能の優雅な劣化と代替手段提供

#### 主要コンポーネント分割設計
- **KeyboardNavigationTester**: EventHandler、StateManager、AccessibilityReporter（4コンポーネント）
- **WCAGValidator**: RuleEngine、AccessibilityAuditor、ComplianceReporter（4コンポーネント）
- **ScreenReaderSimulator**: ScreenReaderEngine、ARIAProcessor、TextToSpeechController（4コンポーネント）
- **AccessibilityOnboarding**: FlowManager、Tutorial、ProgressTracker（4コンポーネント）
- **ColorContrastAnalyzer**: ContrastCalculator、AnalysisEngine、ColorBlindnessSimulator（4コンポーネント）
- **AccessibilitySettingsUI**: SettingsPanel、Validator、PreferencesManager（4コンポーネント）

#### 実装フェーズ（9大タスク）
- **Task 1**: プロジェクト準備・アクセシビリティ分析
- **Task 2-7**: 各ファイルの分割実装（KeyboardNavigationTester → AccessibilitySettingsUI）
- **Task 8**: 包括的アクセシビリティテスト・検証（WCAG 2.1 AA、スクリーンリーダー、キーボード）
- **Task 9**: ドキュメント更新・デプロイメント準備

#### アクセシビリティ保証要件
- **WCAG 2.1 AA準拠**: 分割後も完全維持、自動テスト・手動検証実施
- **支援技術互換性**: NVDA、JAWS、VoiceOver対応保持
- **キーボードナビゲーション**: マウス依存なしでの完全操作性
- **色彩アクセシビリティ**: コントラスト比AA/AAA基準準拠
- **エラー処理**: アクセシビリティ機能失敗時の代替手段提供

#### パフォーマンス目標
- **ファイルサイズ**: 全ターゲットファイル2,500語以下
- **MCPツール**: find_symbol等のトークン制限エラー解消
- **アクセシビリティ**: 100ms以内の応答時間、メモリ最適化
- **API互換性**: 既存公開インターフェース完全保持

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

### バックアップファイル削除プロジェクト（Issue #104対応）
**目標**: Issue #77の大容量ファイル分割プロジェクトで作成された不要なバックアップファイル5件を安全に削除し、リポジトリサイズ削減とメンテナンス性向上を実現

#### 削除対象ファイル
大容量ファイル分割プロジェクト（Issue #77, #103）の過程で作成されたバックアップファイル：
- `src/utils/TestConfigurationGenerator_old.js`（3,288語） - Task 4完了時のバックアップ
- `src/utils/performance-monitoring/PerformanceDataAnalyzer_Original.js`（2,871語） - Task 2完了時のオリジナル保存
- `src/debug/TestDataGenerationCommands_old.js`（2,621語） - 分割プロジェクトでのバックアップ
- `src/debug/TestDataGenerationCommands_backup.js`（2,621語） - 重複バックアップ
- `src/seo/SEOTester_original.js`（2,576語） - 分割プロジェクトでのオリジナル保存

**合計削除予定サイズ**: 13,977語（推定55-70KB）

#### 実装アプローチ
1. **Phase 1**: 調査・分析（1日）
   - 対象ファイルの存在確認と対応する現在ファイルの確認
   - 参照関係の分析（import文、文字列参照）
   - Git履歴の調査
2. **Phase 2**: 削除実行（0.5日）
   - 段階的な安全削除（1ファイルずつ確認しながら）
   - 削除後の動作確認
3. **Phase 3**: 検証（0.5日）
   - ビルド・テスト成功確認
   - 削除結果のドキュメント化

#### 主要コンポーネント
- **BackupFileInvestigator**: 対象ファイルの詳細調査
- **ReferenceAnalyzer**: ファイル参照関係の分析
- **SafetyVerifier**: 削除安全性の検証
- **SequentialFileRemover**: 段階的ファイル削除
- **IntegrityValidator**: 削除後の整合性確認
- **CleanupReporter**: 作業結果の詳細レポート

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

### 最終残存ファイル分割プロジェクト Phase G（Issue #103対応）
**目標**: Issue #77の最終フェーズとして、Phase F完了後も残存する4つの大容量ファイル（2,500語超過）を分割し、MCPツール完全互換（全ファイル2,500語以下）の目標達成を実現

#### 分割対象ファイル
MCPツール（find_symbol）の25,000トークン制限問題を解決するため、残存する大容量ファイルを分割：
- tools/balance-adjuster.js（3,168語） - ゲームバランス調整ツール
- src/audio/AudioAccessibilitySupport.js（2,558語） - オーディオアクセシビリティサポート
- src/core/VisualFocusManager.js（2,520語） - ビジュアルフォーカス管理
- src/core/VisualFeedbackManager.js（2,501語） - ビジュアルフィードバック管理

#### 分割戦略（Main Controller Pattern）
1. **Main Controller Pattern**: 元クラスは軽量オーケストレーター（<2,500語）として機能
2. **機能分離**: 関連メソッドを単一責任の専門クラスにグループ化
3. **ツール機能保持**: CLI・Web インターフェース完全保持
4. **API保持**: 後方互換性のため公開インターフェース完全維持
5. **依存注入**: サブコンポーネントをメインコントローラーに注入

#### 主要コンポーネント分割設計
- **balance-adjuster.js**: BalanceDataLoader、BalanceCalculator、BalanceValidator、BalanceExporter、BalanceConfigManager（5コンポーネント）
- **AudioAccessibilitySupport.js**: AudioDescriptionManager、AudioCueManager、AudioFeedbackProcessor、AudioSettingsManager、AudioCompatibilityChecker（5コンポーネント）
- **VisualFocusManager.js**: FocusStateManager、FocusEffectRenderer、FocusEventHandler、FocusAccessibilitySupport（4コンポーネント）
- **VisualFeedbackManager.js**: FeedbackAnimationManager、FeedbackEffectRenderer、FeedbackTriggerHandler、FeedbackConfigManager（4コンポーネント）

#### ディレクトリ構造
```
tools/balance/
├── balance-adjuster.js (Main Tool)
├── BalanceDataLoader.js
├── BalanceCalculator.js
├── BalanceValidator.js
├── BalanceExporter.js
└── BalanceConfigManager.js

src/audio/accessibility/
├── AudioAccessibilitySupport.js (Main Controller)
├── AudioDescriptionManager.js
├── AudioCueManager.js
├── AudioFeedbackProcessor.js
├── AudioSettingsManager.js
└── AudioCompatibilityChecker.js

src/core/visual/focus/
├── VisualFocusManager.js (Main Controller)
├── FocusStateManager.js
├── FocusEffectRenderer.js
├── FocusEventHandler.js
└── FocusAccessibilitySupport.js

src/core/visual/feedback/
├── VisualFeedbackManager.js (Main Controller)
├── FeedbackAnimationManager.js
├── FeedbackEffectRenderer.js
├── FeedbackTriggerHandler.js
└── FeedbackConfigManager.js
```

#### 実装フェーズ（7大フェーズ）
- **Phase G.1**: ツールファイル分割（balance-adjuster.js → 5コンポーネント）
- **Phase G.2**: オーディオアクセシビリティ分割（AudioAccessibilitySupport.js → 5コンポーネント）
- **Phase G.3**: ビジュアルフォーカス管理分割（VisualFocusManager.js → 4コンポーネント）
- **Phase G.4**: ビジュアルフィードバック管理分割（VisualFeedbackManager.js → 4コンポーネント）
- **Phase G.5**: 品質保証と最終検証（ファイルサイズ検証、統合テスト、パフォーマンステスト）
- **Phase G.6**: ドキュメント更新と完了処理（JSDoc、README、アーキテクチャ文書）
- **Phase G.7**: 最終コミットと完了（Issue #103クローズ準備）

#### パフォーマンス目標
- **ファイルサイズ**: 全ファイル2,500語以下（メインファイルは1,800語以下目標）
- **MCPツール**: find_symbol等のトークン制限エラー完全解消
- **ツール機能**: CLI・アクセシビリティ機能完全保持
- **品質基準**: WCAG 2.1 AA準拠維持、パフォーマンス劣化5%以内