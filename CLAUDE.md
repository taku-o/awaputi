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

### アクセシビリティ強化プロジェクト（Issue #25対応）
**目標**: WCAG 2.1 AA準拠の包括的なアクセシビリティサポート実装

### データ管理強化プロジェクト（Issue #29対応）✅完了
**目標**: 堅牢なデータ保護、移行、セキュリティ機能を持つ包括的なデータ管理システムの実装

#### 実装対象の機能
1. **データ保護機能**: 自動バックアップ、データ整合性チェック、破損検出・復旧
2. **データ移行機能**: JSON形式エクスポート・インポート、デバイス間移行、バージョン互換性
3. **クラウド対応準備**: 同期基盤、オフライン対応、競合解決機能
4. **データ管理UI**: バックアップ状況表示、データクリア、進捗表示
5. **セキュリティ機能**: AES-256-GCM暗号化、改ざん検出、GDPR準拠削除
6. **パフォーマンス最適化**: 非同期処理、チャンク処理、キャッシュ機能

#### 実装完了（11大タスク、40+サブタスク）✅
- **Task 1**: DataManager基盤実装（中央管理、既存システム統合）✅
- **Task 2**: ValidationManager実装（データ検証、整合性チェック）✅
- **Task 3**: BackupManager実装（自動・手動バックアップ、履歴管理）✅
- **Task 4**: RecoveryManager実装（自動復旧、手動復旧オプション）✅
- **Task 5**: Export/ImportManager実装（データ移行、競合解決）✅
- **Task 6**: SecurityManager実装（暗号化、改ざん検出、プライバシー保護）✅
- **Task 7**: DataManagementUI実装（管理画面、ダイアログ、進捗表示）✅
- **Task 8**: パフォーマンス最適化（非同期処理、チャンク処理、キャッシュ）✅
- **Task 9**: クラウド対応準備（CloudStorageAdapter、同期機能）✅
- **Task 10**: 統合テスト（単体・統合・E2E・パフォーマンステスト）✅
- **Task 11**: ドキュメント作成（API、ユーザーガイド、最終調整）✅

#### 主要コンポーネント
- **DataManager**: 中央データ管理、既存システム統合（PlayerData、SettingsManager、StatisticsManager）
- **DataStorage**: ストレージ抽象化、LocalStorage/IndexedDB対応、フォールバック機能
- **BackupManager**: 自動・手動バックアップ、履歴管理、古いバックアップ削除
- **RecoveryManager**: データ破損検出、自動復旧、復旧戦略選択
- **ExportManager/ImportManager**: JSON形式移行、バージョン互換性、競合解決
- **SecurityManager**: AES暗号化、SHA-256整合性チェック、プライバシー保護
- **ValidationManager**: データ検証、整合性チェック、検証ルールエンジン

#### パフォーマンス目標
- **データ保存**: < 100ms、**データ読み込み**: < 50ms
- **バックアップ作成**: < 500ms（バックグラウンド）、**データ復旧**: < 1000ms
- **エクスポート/インポート**: < 2000ms、**非同期処理**: バックグラウンド実行

### ServiceWorker postMessage修正プロジェクト（Issue #58対応）✅完了
**目標**: ServiceWorker内の不正なAPI使用を修正し、PWA機能の正常動作を確保

#### 問題の概要
ServiceWorker内で`self.postMessage()`を直接呼び出すことによるエラーが発生しています。ServiceWorkerコンテキストでは`self.postMessage`は存在せず、クライアントにメッセージを送信するには`clients.matchAll()`を使用してクライアントを取得し、各クライアントに対して`client.postMessage()`を呼び出す必要があります。

#### 修正対象箇所
- **Line 144**: キャッシュ更新通知で`self.postMessage()`を使用（install event handler）
- **Line 182**: オフライン準備完了通知で`self.postMessage()`を使用（activate event handler）

#### 実装アプローチ
- **Task 1**: `self.postMessage()`を既存の`postMessageToClients()`関数に置き換え
- **Task 2**: エラーハンドリングの強化（クライアント不在時の対応、メッセージ送信失敗時の処理）
- **Task 3**: ServiceWorker機能のテスト（PWA機能、オフライン動作、クライアント通知）
- **Task 4**: ブラウザ互換性検証（Chrome、Firefox、Safari、Edge対応確認）

#### 実装完了結果✅
- **PWA初期化エラーの解決**: TypeError: self.postMessage is not a function エラーを完全修正
- **ServiceWorkerインストール成功**: install/activateイベントハンドラーが正常動作
- **オフライン機能の復旧**: PWA機能が正常に動作、キャッシュ機能復旧
- **クライアント通知機能の復旧**: CACHE_UPDATED/OFFLINE_READYメッセージ配信正常化
- **包括的テスト実装**: 9つのユニットテスト、E2Eテスト、ブラウザ互換性検証完了
- **堅牢なエラーハンドリング**: クライアント不在時・メッセージ送信失敗時の適切な処理

### ドキュメント強化プロジェクト（Issue #31対応）✅完了  
**目標**: 包括的なヘルプ機能とガイドシステムの整備により、プレイヤーの学習体験と開発者の作業効率を大幅に向上

#### 実装対象の機能
1. **ゲーム内チュートリアルシステム**: 初回プレイ時の段階的な基本操作・ルール学習
2. **インタラクティブヘルプシステム**: コンテキスト対応ヘルプ、ツールチップ、検索機能
3. **包括的なFAQシステム**: カテゴリ別質問一覧、検索機能、ユーザーフィードバック
4. **ガイドツアー機能**: 各機能の実際使用による学習、進捗保存・再開
5. **多言語対応ドキュメント**: 全ヘルプコンテンツの多言語化、文化的適応
6. **開発者向けドキュメント整備**: API仕様、拡張ガイド、トラブルシューティング
7. **ドキュメント管理システム**: バージョン管理、品質チェック、自動更新通知
8. **アクセシビリティ対応ヘルプ**: WCAG準拠、スクリーンリーダー対応、キーボード操作

#### 実装アプローチ（9大フェーズ、30+サブタスク）
- **Phase 1**: Core Help System Infrastructure（HelpManager、TutorialManager、ContextManager基盤）
- **Phase 2**: Help Content Management System（ContentLoader、SearchEngine、multilingual support）
- **Phase 3**: Tutorial System Implementation（TutorialOverlay、interactive content、progress tracking）
- **Phase 4**: In-Game Help System（HelpScene、contextual help、FAQ system）
- **Phase 5**: Help Content Creation（game help content、FAQ database、guided tours）
- **Phase 6**: Developer Documentation System（API docs、developer guides、management tools）
- **Phase 7**: Accessibility and Internationalization（accessible interfaces、multilingual content）
- **Phase 8**: Integration and Testing（system integration、comprehensive testing、performance optimization）
- **Phase 9**: User Experience and Polish（animations、user feedback、final testing）

#### 主要コンポーネント
- **HelpManager**: 中央ヘルプ管理、コンテンツ読み込み・検索、コンテキスト対応
- **TutorialManager**: チュートリアル制御、ステップ管理、インタラクション検出
- **ContextManager**: コンテキスト検出、ツールチップ管理、動的ヘルプ提供
- **HelpScene**: 包括的ヘルプ表示シーン、カテゴリナビゲーション、検索インターフェース
- **TutorialOverlay**: BaseDialog拡張、要素ハイライト、ステップナビゲーション
- **TooltipSystem**: 動的ツールチップ表示、位置調整、アニメーション
- **ContentLoader**: 多言語コンテンツ読み込み、キャッシュ管理、バージョン管理
- **SearchEngine**: 全文検索、フィルタリング、結果ランキング、提案機能

#### 既存システム統合ポイント
- **SceneManager**: HelpScene、TutorialSceneの新規追加
- **BaseDialog**: TutorialOverlay、ヘルプダイアログでの拡張活用
- **LocalizationManager**: 多言語ヘルプコンテンツ管理・配信
- **AccessibilityManager**: WCAG準拠ヘルプ機能、支援技術対応
- **ComponentEventBus**: ヘルプシステム間通信、イベント駆動制御

#### データモデル設計
- **HelpContent**: カテゴリ別ヘルプコンテンツ、検索キーワード、関連トピック
- **Tutorial**: ステップ構造、ハイライト要素、検証機能、進捗追跡
- **FAQ**: 質問・回答ペア、カテゴリ分類、人気度・有用性評価
- **UserProgress**: 完了チュートリアル、閲覧ヘルプ、検索履歴、設定

### デバッグツール強化プロジェクト（Issue #30対応）🔄進行中
**目標**: 既存のEffectDebugInterfaceを包括的な開発支援システムに拡張し、開発者の生産性を大幅に向上させる高度なデバッグ環境を実装

#### 実装対象の機能
1. **Enhanced Debug Interface**: 統合デバッグUI、複数パネル管理、キーボードショートカット、レイアウト管理
2. **Advanced Performance Monitor**: 詳細メトリクス収集、リアルタイム可視化、閾値監視、自動警告システム
3. **Developer Console**: インタラクティブコマンドライン、ゲーム状態操作、設定変更、自動補完機能
4. **Error Reporter**: 自動エラー収集、パターン分析、開発者通知、回復追跡機能
5. **Test Support Tools**: テスト実行統合、モックデータ生成、ベンチマーク機能、結果可視化
6. **Documentation System**: 統合ヘルプ、コンテキスト支援、検索機能、インタラクティブチュートリアル

#### 実装アプローチ（8大フェーズ、50+サブタスク）
- **Phase 1**: Core Infrastructure（EnhancedDebugInterface基盤、パネル管理、ショートカット）
- **Phase 2**: Advanced Performance Monitoring（メトリクス収集、可視化、閾値管理、自動分析）
- **Phase 3**: Developer Console（コマンド実行、ゲーム状態操作、設定管理、自動補完）
- **Phase 4**: Error Reporting System（エラー収集、パターン分析、通知システム、回復追跡）
- **Phase 5**: Test Support Tools（テスト統合、モックデータ、ベンチマーク、結果分析）
- **Phase 6**: Documentation System（ヘルプ管理、コンテキスト支援、検索、チュートリアル）
- **Phase 7**: UI/UX Integration（統合インターフェース、レスポンシブ設計、テーマ、アクセシビリティ）
- **Phase 8**: Final Integration（統合テスト、要件検証、ドキュメント、パフォーマンス最適化）

#### 主要コンポーネント
- **EnhancedDebugInterface**: 既存EffectDebugInterfaceを拡張した統合デバッグUI
- **AdvancedPerformanceMonitor**: PerformanceOptimizerと連携する高度な監視システム
- **DeveloperConsole**: リアルタイムゲーム操作のためのコマンドライン環境
- **ErrorReporter**: ErrorHandlerを拡張した包括的エラー分析システム
- **TestSupportTools**: Jest/Playwrightと統合したテスト支援機能
- **DocumentationSystem**: 開発者向け統合ヘルプとチュートリアルシステム

#### 既存システム統合ポイント
- **EffectDebugInterface**: 基盤として活用し機能を大幅拡張
- **GameEngine**: 全デバッグツールの中央制御点として統合
- **ErrorHandler**: エラー収集・レポート機能の拡張統合
- **PerformanceOptimizer**: パフォーマンス監視データの提供元として連携
- **Jest/Playwright**: テスト支援ツールとの統合

#### パフォーマンス目標
- **デバッグオーバーヘッド**: < 5%（ゲーム実行への影響最小化）
- **メトリクス更新**: < 100ms、**エラー収集**: < 50ms
- **コマンド実行**: < 200ms、**パネル切り替え**: < 100ms
- **テスト実行**: < 10秒（小規模テストスイート）

### デバッグツール強化プロジェクト（Issue #30対応）🔄進行中
**目標**: 既存のEffectDebugInterfaceを包括的な開発支援システムに拡張し、開発者の生産性を大幅に向上させる高度なデバッグ環境を実装

#### 実装対象の機能
1. **Enhanced Debug Interface**: 統合デバッグUI、複数パネル管理、キーボードショートカット、レイアウト管理
2. **Advanced Performance Monitor**: 詳細メトリクス収集、リアルタイム可視化、閾値監視、自動警告システム
3. **Developer Console**: インタラクティブコマンドライン、ゲーム状態操作、設定変更、自動補完機能
4. **Error Reporter**: 自動エラー収集、パターン分析、開発者通知、回復追跡機能
5. **Test Support Tools**: テスト実行統合、モックデータ生成、ベンチマーク機能、結果可視化
6. **Documentation System**: 統合ヘルプ、コンテキスト支援、検索機能、インタラクティブチュートリアル

#### 実装アプローチ（8大フェーズ、50+サブタスク）
- **Phase 1**: Core Infrastructure（EnhancedDebugInterface基盤、パネル管理、ショートカット）
- **Phase 2**: Advanced Performance Monitoring（メトリクス収集、可視化、閾値管理、自動分析）
- **Phase 3**: Developer Console（コマンド実行、ゲーム状態操作、設定管理、自動補完）
- **Phase 4**: Error Reporting System（エラー収集、パターン分析、通知システム、回復追跡）
- **Phase 5**: Test Support Tools（テスト統合、モックデータ、ベンチマーク、結果分析）
- **Phase 6**: Documentation System（ヘルプ管理、コンテキスト支援、検索、チュートリアル）
- **Phase 7**: UI/UX Integration（統合インターフェース、レスポンシブ設計、テーマ、アクセシビリティ）
- **Phase 8**: Final Integration（統合テスト、要件検証、ドキュメント、パフォーマンス最適化）

#### 主要コンポーネント
- **EnhancedDebugInterface**: 既存EffectDebugInterfaceを拡張した統合デバッグUI
- **AdvancedPerformanceMonitor**: PerformanceOptimizerと連携する高度な監視システム
- **DeveloperConsole**: リアルタイムゲーム操作のためのコマンドライン環境
- **ErrorReporter**: ErrorHandlerを拡張した包括的エラー分析システム
- **TestSupportTools**: Jest/Playwrightと統合したテスト支援機能
- **DocumentationSystem**: 開発者向け統合ヘルプとチュートリアルシステム

#### 既存システム統合ポイント
- **EffectDebugInterface**: 基盤として活用し機能を大幅拡張
- **GameEngine**: 全デバッグツールの中央制御点として統合
- **ErrorHandler**: エラー収集・レポート機能の拡張統合
- **PerformanceOptimizer**: パフォーマンス監視データの提供元として連携
- **Jest/Playwright**: テスト支援ツールとの統合

#### パフォーマンス目標
- **デバッグオーバーヘッド**: < 5%（ゲーム実行への影響最小化）
- **メトリクス更新**: < 100ms、**エラー収集**: < 50ms
- **コマンド実行**: < 200ms、**パネル切り替え**: < 100ms
- **テスト実行**: < 10秒（小規模テストスイート）

### 多言語対応強化プロジェクト（Issue #27対応）🔄進行中
**目標**: 既存の基本的な多言語対応を包括的な国際化（i18n）・ローカライゼーション（l10n）システムに拡張

#### 現在の状況（2025年7月30日更新）
- **Phase 1基盤**: ✅完了 - Enhanced LocalizationManager、TranslationLoader、LanguageDetector、TranslationCache実装済み
- **翻訳ファイル構造**: ✅完了 - src/locales/配下に言語別ディレクトリ（ja/, en/, zh-CN/, zh-TW/, ko/）、カテゴリ別JSON分割
- **完全英語翻訳**: ✅完了 - 7カテゴリ（common, menu, game, settings, errors, achievements, help）の英語翻訳ファイル完成
- **日本語翻訳**: ✅完了 - LocalizationManager内の1,200+翻訳キーを外部ファイルに構造化移行
- **中国語・韓国語翻訳**: ✅完了 - zh-CN、zh-TW、ko言語の翻訳ファイル構造実装済み
- **設定システム**: ✅完了 - config/languages.json, regions.json, formats.json実装済み
- **文化的適応**: ✅完了 - RTL言語検出、数値・日付フォーマット、色・ジェスチャー規約、アクセシビリティ翻訳対応
- **システム統合テスト**: ✅完了 - Phase 4の統合テストを先行実装済み
- **🔄 次のタスク**: Task 13.2 - E2Eテスト実装（言語切り替え、多言語UI操作、地域化機能のE2Eテスト）

#### 実装完了状況（18大タスク、4段階）
**Phase 1（高優先度）**: ✅完了（4/4タスク）
1. **✅ Enhanced LocalizationManager**: 翻訳キャッシュ、言語検出、文化的適応、アクセシビリティ対応
2. **✅ 翻訳ファイル構造化**: カテゴリ別（7種）×言語別（5言語対応）JSON構造、メタデータ付き
3. **✅ 完全英語翻訳**: 1,200+翻訳キーの英語版完成、アクセシビリティ翻訳含む
4. **✅ 動的言語切り替え基盤**: TranslationLoader、非同期読み込み、プリロード機能完成

**Phase 2（中優先度）**: ✅完了（3/3タスク）
5. **✅中国語対応**: 簡体字（zh-CN）・繁体字（zh-TW）翻訳ファイル構造完成
6. **✅韓国語対応**: 韓国語（ko）翻訳ファイル構造完成
7. **✅地域化機能**: FormatterEngine、RegionalSettingsManager実装完成

**Phase 3（中優先度）**: ✅完了（3/3タスク）
8. **✅翻訳品質管理**: QualityChecker、検証ルール、品質レポート実装完成
9. **✅翻訳管理ツール**: TranslationKeyManager、ProgressTracker、検証コマンド実装完成
10. **✅自動化ツール**: 翻訳ファイル生成、インポート・エクスポート実装完成

**Phase 4（低優先度）**: ✅完了（2/2タスク）
11. **✅RTL言語対応準備**: RTL言語検出、RTL対応UIコンポーネント実装完成
12. **✅高度地域化**: 文化的適応システム、高度フォーマット機能実装完成

#### 統合・テスト・デプロイ: ✅完了（5/6タスク）、🔄進行中（1/6タスク）
13. **✅システム統合・E2Eテスト**: SystemIntegrationTester、言語切り替えE2E、多言語UI操作テスト実装完了（タスク13）
14. **✅パフォーマンス最適化**: OptimizedTranslationLoader、I18nPerformanceMonitor、I18nRenderOptimizer統合完了（タスク14）
15. **✅セキュリティ強化**: I18nSecurityManager、I18nSecurityTester統合によるXSS防止・脆弱性テスト実装完了（タスク15）
16. **🔄ドキュメント作成**: 開発者ガイド、ユーザードキュメント作成中（タスク16）
17. **⏳品質保証テスト**: 翻訳品質・パフォーマンステスト実施（タスク17）
18. **⏳最終検証**: 要件適合性検証、リリース準備（タスク18）

#### 実装済み技術アーキテクチャ
- **Enhanced LocalizationManager**: 中央翻訳管理、LRUキャッシュ、文化的適応、アクセシビリティ対応完成
- **TranslationLoader**: 非同期翻訳ファイル読み込み、プリロード、エラーハンドリング完成
- **LanguageDetector**: URL・ストレージ・ブラウザ設定からの自動言語検出完成
- **TranslationCache**: LRUアルゴリズム、キャッシュサイズ制限、パフォーマンス監視完成
- **翻訳ファイル構造**: メタデータ付きJSON、バージョン管理、完成度追跡完成

#### 翻訳ファイル構造
```
src/locales/
├── ja/              # 日本語（完了）- 1,200+翻訳キー
├── en/              # 英語（完了）- 1,200+翻訳キー  
├── zh-CN/           # 中国語簡体字（構造のみ実装、翻訳未実装）
├── zh-TW/           # 中国語繁体字（構造のみ実装、翻訳未実装）
├── ko/              # 韓国語（構造のみ実装、翻訳未実装）
└── config/          # 言語・地域・フォーマット設定
    ├── languages.json    # 言語設定（方向、フォント、複数形ルール）
    ├── regions.json      # 地域設定（通貨、タイムゾーン、数値形式）
    └── formats.json      # フォーマット設定（日付、数値、通貨形式）
```

#### 既存システム統合ポイント
- **SettingsManager**: 言語設定の永続化、フォント動的読み込み
- **GameEngine**: 全シーンでの言語変更イベント処理
- **UserInfoScene**: 多言語統計・実績表示
- **ErrorHandler**: 多言語エラーメッセージ
- **ResponsiveCanvasManager**: RTL言語でのレイアウト調整

#### パフォーマンス目標
- **翻訳取得**: < 10ms、**言語切り替え**: < 500ms
- **メモリ使用量増加**: < 20%、**翻訳完成度**: > 95%
- **品質スコア**: > 90%、**ユーザビリティ**: > 80%満足度

#### 全体実装状況（2025年7月30日更新）
- **Phase 1-4**: 基本機能実装完了（100%）- タスク1-12完成
- **Task 13**: システム統合・E2Eテスト完了（100%）- SystemIntegrationTester、E2Eテスト実装済み
- **Task 14**: パフォーマンス最適化完了（100%）- OptimizedTranslationLoader、I18nPerformanceMonitor、I18nRenderOptimizer統合完了
- **Task 15**: セキュリティ強化完了（100%）- I18nSecurityManager、I18nSecurityTester統合によるXSS防止・脆弱性テスト実装
- **Task 16**: ドキュメント作成（進行中）- 開発者ガイド、ユーザードキュメント多言語化
- **Task 17-18**: 品質保証・最終検証（未着手）- 翻訳品質テスト、要件適合性検証、リリース準備

#### 残り作業（Task 16-18）
- **タスク16.1**: 開発者ドキュメント作成（多言語対応システム使用方法、新言語追加手順、翻訳管理ガイドライン）
- **タスク16.2**: ユーザードキュメント多言語化（README.md多言語版、ヘルプドキュメント翻訳）
- **タスク16.3**: 本番環境デプロイ準備（多言語対応設定、CDN最適化、翻訳ファイル配信最適化）
- **タスク17**: 品質保証テスト（翻訳品質テスト、パフォーマンステスト実施）
- **タスク18**: 最終検証（要件適合性検証、リリース準備、移行ガイド作成）

### イベントステージシステム実装プロジェクト（Issue #28対応）🔄進行中
**目標**: EventStageManagerの完全実装により、期間限定コンテンツと特別なルールを持つステージを提供し、長期的なユーザー維持とコンテンツ拡張を実現

#### 実装対象の機能
1. **季節イベント**: 春の桜・夏の花火・秋の紅葉・冬の雪景色ステージ（自動スケジューリング対応）
2. **特別イベント**: 記念日・チャレンジ・限定コラボ・コミュニティイベント
3. **特別ルール**: 時間制限変更、特殊泡出現率変更、スコア倍率変更、特別勝利条件
4. **イベント管理**: スケジュール管理、開始・終了時刻制御、通知システム、参加条件設定
5. **報酬システム**: イベント限定報酬、ランキングシステム、参加賞配布、特別称号付与
6. **統計収集**: イベント参加履歴、完了率、お気に入りイベント、総イベントスコア

#### 実装アプローチ（15大タスク）
- **Task 1**: 季節イベント自動スケジューリング機能（SEASONAL_PERIODS定数、scheduleSeasonalEvents()）
- **Task 2**: イベント通知機能統合（sendEventNotification()、AchievementNotificationSystemとの連携）
- **Task 3**: AchievementNotificationSystemのイベント通知対応拡張
- **Task 4**: 管理者向けイベント制御機能（adminActivateEvent()、adminDeactivateEvent()）
- **Task 5**: 統計収集機能強化（recordEventParticipation()、getDetailedEventStatistics()）
- **Task 6**: StageSelectSceneイベント表示機能（renderEventSection()、renderEventTimer()）
- **Task 7**: StageSelectSceneイベント通知表示（renderEventNotificationBadge()）
- **Task 8**: StageSelectSceneイベント選択機能（selectEventStage()、validateEventStageAccess()）
- **Task 9**: 季節イベント具体的設定実装（春夏秋冬の特別ルール）
- **Task 10**: 特別イベント具体的設定実装（記念日、チャレンジ、コラボ、コミュニティ）
- **Task 11**: イベント報酬システム実装（grantEventRewards()拡張、calculateEventBonus()）
- **Task 12**: イベントランキングシステム（EventRankingManager、リーダーボード、ランキング報酬）
- **Task 13**: イベントデータ永続化（saveEventData()、loadEventData()、migrateEventData()）
- **Task 14**: 統合テスト実装（単体・統合・フロー全体テスト）
- **Task 15**: エラーハンドリング実装（handleEventError()、validateEventConfiguration()）

#### 主要コンポーネント
- **Enhanced EventStageManager**: 既存クラスを拡張（季節イベント、通知、管理者機能、統計強化）
- **Event Notification System**: AchievementNotificationSystemを活用したイベント通知
- **Enhanced StageSelectScene**: イベント専用セクション、残り時間表示、通知バッジ
- **Seasonal Event Scheduler**: 日付ベース自動有効化、地域設定対応準備
- **Event Statistics Collector**: 詳細統計収集、エクスポート機能
- **EventRankingManager**: イベント別ランキング管理システム

#### 既存実装の活用
- **EventStageManager**: 基本構造実装済み（6種類のイベント定義、基本的な報酬システム）
- **AchievementNotificationSystem**: 通知基盤として活用・拡張
- **StageManager/StageSelectScene**: イベントステージ統合先

### PWA実装プロジェクト（Issue #33対応）🔄進行中
**目標**: Progressive Web App機能の完全実装により、モバイルユーザー体験を向上させ、ネイティブアプリライクな機能を提供

#### 現在の状況（2025年7月31日更新）
- **既存基盤**: manifest.json、Service Worker (sw.js)、PWAManager.js実装済み
- **主要問題**: 参照されているアセットファイル（アイコン、スクリーンショット）が存在しない
- **対応方針**: アセット生成、設定最適化、テスト・検証の順で実装

#### 実装対象の機能
1. **PWAアセット生成**: アイコンファイル（192x192px, 512x512px等）、マスカブルアイコン、ファビコン、Apple Touch Icons
2. **manifest.json最適化**: アイコン参照の検証、PWAコンプライアンス確保、ショートカット機能
3. **Service Worker強化**: キャッシュ戦略最適化、オフライン機能改善、更新通知システム
4. **PWAManager統合**: インストールプロンプト最適化、オフライン状態管理、ユーザー体験向上
5. **メタタグ最適化**: Apple-specific meta tags、theme-color設定、viewport設定
6. **テスト・検証フレームワーク**: PWAコンプライアンステスト、クロスブラウザテスト、モバイルデバイステスト

#### 実装アプローチ（12大タスク、30+サブタスク）
- **Task 1**: アセットディレクトリ構造とベースアイコン生成システム作成
- **Task 2**: PWAアイコンアセット生成（2.1: 標準サイズ、2.2: 追加サイズ、2.3: マスカブルアイコン）
- **Task 3**: Apple-specific PWAアセット（3.1: Apple Touch Icons、3.2: スプラッシュスクリーン）
- **Task 4**: ファビコンとブラウザタブアイコン生成
- **Task 5**: manifest.json検証・最適化（5.1: アイコン参照確認、5.2: PWAコンプライアンス最適化）
- **Task 6**: Service Worker強化（6.1: 静的アセットキャッシュ最適化、6.2: キャッシュ管理改善）
- **Task 7**: PWAManager統合強化（7.1: インストールプロンプト改善、7.2: オフライン機能管理）
- **Task 8**: index.htmlメタタグ追加・最適化
- **Task 9**: PWAテスト・検証フレームワーク（9.1: 自動コンプライアンステスト、9.2: クロスブラウザ・デバイステスト）
- **Task 10**: PWAアセット生成ツール・スクリプト（10.1: 自動アイコン生成、10.2: PWA検証・監査）
- **Task 11**: PWAパフォーマンス・UX最適化（11.1: ローディング最適化、11.2: 更新処理強化）
- **Task 12**: PWAドキュメント・デプロイ準備（12.1: ユーザードキュメント、12.2: 本番環境準備）

#### 主要コンポーネント
- **PWAAssetGenerator**: Canvas APIベースアイコン生成、各種サイズ・フォーマット対応
- **ManifestValidator**: manifest.json検証、アイコン参照チェック、PWAコンプライアンス確認
- **Service Worker Enhancement**: 最適化されたキャッシュ戦略、効率的アセットプリローディング
- **PWAManager Integration**: 既存PWAManager.jsとの統合、インストール・オフライン体験向上
- **PWATester**: 自動テストフレームワーク、Lighthouse統合、デバイス互換性テスト

#### 既存システム統合ポイント
- **EventStageManager**: 基本構造実装済み（6種類のイベント定義、基本的な報酬システム）
- **AchievementNotificationSystem**: 通知基盤として活用・拡張
- **StageManager/StageSelectScene**: イベントステージ統合先

### モバイル対応強化プロジェクト（Issue #26対応）
**目標**: モバイルデバイスでのユーザー体験を大幅に向上させる高度なモバイル特化機能の実装

#### 実装対象の機能
1. **タッチ操作の改善**: マルチタッチ対応、スワイプ・ピンチジェスチャー、誤タッチ防止、タッチ感度調整
2. **レスポンシブレイアウトの最適化**: 画面サイズ自動調整、画面回転対応、セーフエリア対応、動的UI要素スケーリング
3. **パフォーマンス最適化**: 30FPS以上維持、省電力モード、メモリ管理、熱制御、ネットワーク最適化
4. **デバイス固有対応**: iOS/Android最適化、ブラウザ固有対応、高DPIディスプレイ対応
5. **PWA機能**: インストール可能、オフライン動作、プッシュ通知、バックグラウンド管理
6. **UI/UX改善**: 片手操作モード、タッチターゲット最適化（44px×44px）、非侵入的通知
7. **ジェスチャー操作**: スワイプ、ピンチズーム、ダブルタップ、長押し、カスタムジェスチャー
8. **モバイルテスト**: デバイステスト、レイアウトテスト、タッチ操作テスト、パフォーマンステスト

#### 実装アプローチ（10大タスク、37サブタスク）
- **Task 1**: Enhanced Touch Manager実装（マルチタッチ、基本ジェスチャー、タッチ応答性）
- **Task 2**: Advanced Responsive Layout Manager実装（動的レイアウト、画面回転、セーフエリア）
- **Task 3**: Mobile Performance Optimizer強化（バッテリー監視、メモリ管理、熱制御）
- **Task 4**: PWA Manager実装（Service Worker、App Manifest、オフライン機能）
- **Task 5**: Device Specific Handler実装（iOS/Android最適化、高DPI対応）
- **Task 6**: Advanced Gesture Recognition System実装（スワイプ、ピンチ、高度ジェスチャー）
- **Task 7**: Mobile UI/UX Manager実装（片手操作、タッチ最適化、通知システム）
- **Task 8**: モバイルアクセシビリティ強化（スクリーンリーダー、色覚対応）
- **Task 9**: 包括的テストスイート実装（タッチ、レイアウト、パフォーマンス、PWAテスト）
- **Task 10**: システム統合とエラーハンドリング（統合テスト、デバッグ、ドキュメント）

#### 主要コンポーネント
- **EnhancedTouchManager**: 高度なタッチ処理、ジェスチャー検出、感度調整
- **AdvancedResponsiveLayoutManager**: 動的レイアウト調整、セーフエリア管理
- **MobilePerformanceOptimizer**: モバイル特化パフォーマンス最適化（既存実装を強化）
- **PWAManager**: Progressive Web App機能管理
- **DeviceSpecificHandler**: プラットフォーム固有最適化
- **AdvancedGestureRecognitionSystem**: 複雑なジェスチャー認識
- **MobileUIUXManager**: モバイルUI/UX最適化

#### 既存実装の活用
- **InputManager**: 基本的なタッチ・マルチタッチ対応は実装済み→拡張
- **MobilePerformanceOptimizer**: 包括的な最適化システム実装済み→強化
- **ResponsiveCanvasManager**: 基本的なレスポンシブ対応実装済み→高度化

#### 実装対象の機能
1. **Core AccessibilityManager**: 全アクセシビリティ機能の統合管理システム
2. **Enhanced Keyboard Navigation**: 論理的タブ順序、2D矢印キーナビゲーション、カスタムショートカット
3. **Advanced Screen Reader Support**: 動的コンテンツ通知、ARIA管理、音声合成、多言語対応
4. **Visual Accessibility**: 高コントラスト、テキストスケーリング、色覚異常対応、アニメーション制御
5. **Audio Accessibility**: 音響効果の視覚化、リアルタイム字幕、振動フィードバック
6. **Motor Accessibility**: ワンハンド操作、感度調整、代替入力デバイス対応、タイミング調整
7. **Cognitive Accessibility**: UI簡素化、コンテキストヘルプ、エラー回復支援、ステップガイダンス
8. **Testing Framework**: 自動WCAG準拠チェック、スクリーンリーダーシミュレーション、包括的テスト

#### アーキテクチャ構造
```
AccessibilityManager (中核統制)
├── KeyboardAccessibilityManager (FocusManager, NavigationEngine, ShortcutManager)
├── ScreenReaderManager (ARIAManager, LiveRegionManager, SpeechSynthesisManager)
├── VisualAccessibilityManager (ContrastManager, TextScalingManager, ColorBlindnessSupport)
├── AudioAccessibilityManager (VisualFeedbackManager, CaptionManager, VibrationManager)
├── MotorAccessibilityManager (AlternativeInputManager, GestureCustomizer, TimingAdjustmentManager)
├── CognitiveAccessibilityManager (SimplificationManager, HelpSystemManager, ErrorRecoveryManager)
└── AccessibilityTestingFramework (WCAGValidator, ScreenReaderSimulator, KeyboardTester)
```

#### 実装フェーズ（12段階、60+サブタスク）
- **Phase 1**: Core Infrastructure（AccessibilityManager基盤構築、システム設定検出）
- **Phase 2**: Enhanced Keyboard Accessibility（FocusManager、2Dナビゲーション、ショートカット強化）
- **Phase 3**: Advanced Screen Reader Support（ARIAManager、LiveRegionManager、SpeechSynthesis）
- **Phase 4**: Visual Accessibility Features（ContrastManager、TextScaling、ColorBlindnessSupport）
- **Phase 5**: Audio Accessibility（VisualFeedbackManager、CaptionManager、VibrationManager）
- **Phase 6**: Motor Accessibility（AlternativeInputManager、GestureCustomizer、TimingAdjustment）
- **Phase 7**: Cognitive Accessibility（SimplificationManager、ContextualHelpManager、ErrorRecovery）
- **Phase 8**: Testing Framework（WCAGValidator、ScreenReaderSimulator、KeyboardTester、ColorContrastAnalyzer）
- **Phase 9**: Settings Integration（設定UI、プロファイル管理、オンボーディング）
- **Phase 10**: Localization Support（多言語アクセシビリティ、文化的適応）
- **Phase 11**: Performance & Error Handling（最適化、エラー処理、アナリティクス）
- **Phase 12**: Integration Testing（E2Eテスト、ユーザーテスト、WCAG検証）

#### 重要な統合ポイント
- **既存システムとの統合**: StatisticsAccessibilityManager、KeyboardShortcutManagerの拡張
- **GameEngine統合**: 全シーンでのアクセシビリティ機能有効化
- **SettingsManager統合**: アクセシビリティ設定の永続化と同期
- **LocalizationManager統合**: 多言語アクセシビリティサポート
- **ErrorHandler統合**: アクセシビリティエラーの包括的処理

#### WCAG 2.1 AA準拠目標
- **知覚可能性**: 代替テキスト、字幕、色彩コントラスト、テキストサイズ調整
- **操作可能性**: キーボードアクセス、タイミング調整、発作防止、ナビゲーション支援
- **理解可能性**: 読みやすさ、予測可能性、入力支援
- **堅牢性**: 支援技術互換性、将来的互換性

### 重要な特徴
- **ビルドプロセスなし**: 純粋なES6モジュール、直接ブラウザで実行
- **依存管理**: package.json でJest、Playwrightを管理（開発環境のみ）
- **テスト環境**: `test.html` でバブルタイプの個別テストが可能
- **高度な設定管理**: ConfigurationManagerによる統一設定システム
- **包括的アクセシビリティ**: WCAG 2.1 AA準拠、支援技術対応、多様なニーズ支援

### 利用可能ツール
- **GitHub CLI (gh)**: GitHubリポジトリ操作、プルリクエスト管理、Issue管理
- **Playwright MCP**: ブラウザ自動化、E2Eテスト、ウェブUI操作
- **Serena MCP**: セマンティックコード解析、シンボル検索、効率的コード編集、メモリ管理
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

### SEO最適化プロジェクト（Issue #34対応）✅完了
**目標**: 包括的なSEO最適化により、検索エンジン最適化、ソーシャルメディア共有体験の向上、ブランディング強化を実現

#### 完了状況（2025年7月31日完了）
- **全タスク完了**: Task 1-11すべて完了（100%達成）
- **SEOシステム**: SEOMetaManager、StructuredDataEngine、SocialMediaOptimizer完全実装
- **HTMLテンプレート統合**: 動的メタタグ注入、構造化データ注入システム完全統合
- **ゲーム状態連携**: リアルタイムSEO更新、ソーシャル共有機能完全実装

#### 実装完了状況（11大タスク）
- **✅ Task 1**: SEOインフラ基盤（設定管理、ユーティリティ、エラーハンドリング）
- **✅ Task 2**: メタタグ管理システム（SEOMetaManager、動的コンテンツ、多言語対応）
- **✅ Task 3**: 構造化データシステム（StructuredDataEngine、スキーマ生成・検証）
- **✅ Task 4**: サイトインフラファイル（robots.txt、sitemap.xml動的生成）
- **✅ Task 5**: ソーシャルメディア最適化（SocialMediaOptimizer、画像生成）
- **✅ Task 6**: ファビコン管理（FaviconManager、全デバイス対応アセット生成）
- **✅ Task 7**: 多言語SEO（hreflangタグ、LocalizationManager統合）
- **✅ Task 8**: パフォーマンス最適化（画像最適化、構造化データ最小化）
- **✅ Task 9**: SEOテストスイート（自動検証、パフォーマンス監視）
- **✅ Task 10**: システム統合（HTML統合、ゲーム状態連携、ソーシャル共有機能完全実装）  
- **✅ Task 11**: ドキュメント・監視ツール（設定ドキュメント、アナリティクス統合）

#### 主要コンポーネント（実装完了）
- **SEOMetaManager**: 動的メタタグ管理、キャッシュバスティング、多言語対応
- **StructuredDataEngine**: JSON-LD生成、スキーマ検証、動的コンテンツ
- **SocialMediaOptimizer**: プラットフォーム別最適化、動的画像生成
- **FaviconManager**: 包括的ファビコン管理、全デバイス対応
- **SitemapGenerator**: 動的サイトマップ生成、優先度・更新頻度管理

#### 既存システム統合ポイント
- **LocalizationManager**: 多言語メタデータ、hreflangタグ生成
- **GameEngine**: ゲーム状態ベースの動的SEOコンテンツ（Task 10.2で実装予定）
- **ConfigurationManager**: SEO設定の中央管理
- **PerformanceOptimizer**: SEO最適化のパフォーマンス影響監視

#### WCAG/検索エンジン準拠目標（達成済み）
- **Open Graph完全対応**: title、description、image、url、type、site_name
- **Twitter Card最適化**: summary_large_image形式、最適化画像
- **構造化データ**: VideoGame、Organization、WebApplicationスキーマ
- **Lighthouse SEOスコア**: >90維持、パフォーマンス影響最小化

### チュートリアルシステム実装プロジェクト（Issue #36対応）🔄進行中
**目標**: 新規プレイヤーがゲームを理解しやすくするため、インタラクティブなチュートリアルシステムを実装し、プレイヤーの離脱率を減少させ、ゲーム理解度を向上させる

#### 実装対象の機能
1. **段階的チュートリアルシステム**: 基本操作説明、バブルタイプ紹介、UI要素説明、アイテムシステム紹介
2. **インタラクティブガイドシステム**: 要素ハイライト、ステップバイステップ指示、実操作プロンプト、進行状況表示
3. **包括的ヘルプシステム**: いつでもアクセス可能なヘルプ、FAQ機能、ゲーム用語集、戦略とコツ
4. **プレイヤー適応型システム**: 自動チュートリアル開始、スキップ機能、復習機能、難易度別ヒント
5. **マルチメディア対応システム**: アニメーション付き説明、音声ガイド、視覚的デモンストレーション、動画チュートリアル
6. **データ永続化システム**: LocalStorage進行状況保存、中断・再開機能、完了状態管理
7. **既存システム統合**: SceneManager、LocalizationManager、AccessibilityManager統合

#### 主要コンポーネント
- **TutorialManager**: 中央制御、ステップ管理、イベントシステム
- **TutorialOverlay**: UI表示、ハイライト機能、ツールチップ
- **TutorialStepManager**: ステップ定義、遷移ロジック、検証システム
- **TutorialProgressTracker**: 進行状況管理、LocalStorage連携
- **TutorialActions**: インタラクティブ機能、デモンストレーション

#### 実装アプローチ（15大タスク、60+サブタスク）
- **Task 1**: コアシステム基盤構築（TutorialManager、GameEngine統合、エラーハンドリング）
- **Task 2**: データ永続化システム（TutorialProgressTracker、LocalStorage連携、リセット機能）
- **Task 3**: ステップ管理システム（TutorialStepManager、ステップ定義、遷移ロジック）
- **Task 4**: オーバーレイUIシステム（TutorialOverlay、コンテンツ表示、プログレス表示）
- **Task 5**: ハイライトシステム（要素ハイライト、アニメーション、管理機能）
- **Task 6**: インタラクティブ機能（TutorialActions、検証システム、デモンストレーション）
- **Task 7**: ツールチップシステム（TooltipSystem、位置調整、コンテンツ管理）
- **Task 8**: 多言語対応システム（LocalizationManager統合、RTL言語サポート）
- **Task 9**: アクセシビリティ機能（AccessibilityManager統合、スクリーンリーダー対応）
- **Task 10**: 音声・マルチメディア機能（音声ガイド、動画チュートリアル）
- **Task 11**: 適応型機能（スキップ、復習、難易度別ヒント）
- **Task 12**: GameEngine統合とシーン連携（SceneManager統合、ゲーム内チュートリアル）
- **Task 13**: パフォーマンス最適化（メモリ、レンダリング、遅延読み込み）
- **Task 14**: テスト実装（ユニット、統合、E2Eテスト）
- **Task 15**: ドキュメント作成と最終統合（APIドキュメント、ユーザーガイド）

#### 既存システム統合ポイント
- **GameEngine**: 全チュートリアル機能の中央制御
- **SceneManager**: チュートリアルシーン統合、既存シーンでのオーバーレイ表示
- **LocalizationManager**: 多言語チュートリアルコンテンツ
- **AccessibilityManager**: WCAG準拠チュートリアル機能
- **HelpManager**: 既存ヘルプシステムとの統合（src/core/help/）
- **TutorialOverlay**: 既存実装（src/core/help/TutorialOverlay.js）の活用・拡張

### ゲーム分析機能実装プロジェクト（Issue #35対応）🔄進行中
**目標**: プレイヤー行動とゲームバランスの分析機能を実装し、データドリブンなゲーム改善を実現

#### 実装対象の機能
1. **プレイヤー行動分析**: セッション長、クリック成功率、ステージ完了率、離脱ポイント分析
2. **ゲームバランス分析**: バブルタイプ頻度vs難易度、スコア分布、アイテム使用率、平均プレイ時間
3. **パフォーマンス分析**: フレームレート監視、メモリ使用量、ロード時間、エラー率
4. **データ可視化**: ダッシュボード機能、グラフ・チャート生成、トレンド分析、比較機能
5. **プライバシー保護**: データ匿名化、オプトアウト機能、ローカルストレージ使用、GDPR準拠

#### 技術要件
- **既存システム拡張**: Analytics.js、StatisticsManagerの機能拡張
- **可視化ライブラリ**: Chart.js、D3.js統合
- **データストレージ**: IndexedDB使用、LocalStorageフォールバック
- **非同期処理**: バッチ処理、パフォーマンス最適化

#### 実装アプローチ（11大タスク）
- **Task 1**: 基盤システム構築（IndexedDBStorageManager、PrivacyManager）
- **Task 2**: データ収集システム（DataCollector、ゲームバランス分析）
- **Task 3**: 拡張Analytics Manager（EnhancedAnalyticsManager統合）
- **Task 4**: パフォーマンス監視（RealtimeMonitor、エラー追跡）
- **Task 5**: Chart.js/D3.js統合（ChartRenderer、DataVisualizer）
- **Task 6**: 基本ダッシュボード（AnalyticsDashboard、基本統計表示）
- **Task 7**: トレンド分析（TrendAnalyzer、異常パターン検出）
- **Task 8**: 比較分析（ComparisonEngine、改善提案システム）
- **Task 9**: リアルタイム監視（リアルタイムグラフ、警告システム）
- **Task 10**: データエクスポート・API（ExportManager、AnalyticsAPI）
- **Task 11**: 統合テスト・最適化（E2Eテスト、パフォーマンス調整）

🔄 **残りのタスク（Phase 5最終仕上げ）**
- [x] SEO最適化とメタデータ設定（Issue #34完了済み）
- [ ] ゲーム分析機能の実装（Issue #35進行中）
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