# システムアーキテクチャ

## アーキテクチャ構造

### コアシステム (`src/core/`)
#### メインコントローラー
- **GameEngine.js**: メインゲームループ、全システム統制（1,544語、Main Controller Pattern適用）
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

#### 分割コンポーネントシステム（Main Controller Pattern）
**代替入力管理** (`src/core/alternative-input-manager/`)
- **AlternativeInputManager.js**: 代替入力統制（1,803語）
- **VoiceControlHandler.js**: 音声認識制御
- **EyeTrackingHandler.js**: 視線追跡制御  
- **SwitchControlHandler.js**: スイッチデバイス制御

**簡素化管理** (`src/core/simplification-manager/`)
- **SimplificationManager.js**: UI簡素化統制（1,007語）
- **UISimplifier.js**: インターフェース簡素化
- **AnimationReducer.js**: アニメーション削減
- **ContentOptimizer.js**: コンテンツ最適化

#### Phase G分割システム（Issue #103対応）
**視覚フォーカス管理** (`src/core/visual/focus/`)
- **VisualFocusManager.js**: フォーカス管理統制（1,264語、50%削減）
- **FocusStateManager.js**: フォーカス状態管理
- **FocusEffectRenderer.js**: フォーカス効果描画
- **FocusEventHandler.js**: フォーカスイベント処理
- **FocusAccessibilitySupport.js**: アクセシビリティサポート

**視覚フィードバック管理** (`src/core/visual/feedback/`)
- **VisualFeedbackManager.js**: フィードバック管理統制（1,006語、60%削減）
- **FeedbackAnimationManager.js**: アニメーション効果管理
- **FeedbackEffectRenderer.js**: エフェクト描画処理
- **FeedbackTriggerHandler.js**: トリガーとイベント処理
- **FeedbackConfigManager.js**: 設定と要素管理

### ゲームシーン (`src/scenes/`)
#### シーンコントローラー（Main Controller Pattern）
- **MainMenuScene.js**: メインメニュー統制（931語、78%削減）
  - `src/scenes/main-menu-scene/`: 8コンポーネント分割
- **StageSelectScene.js**: ステージ選択画面（2,573語）
- **GameScene.js**: ゲームプレイ統制（613語、84%削減）
  - `src/scenes/game-scene/`: 8コンポーネント分割
- **ShopScene.js**: アイテム購入インターフェース
- **UserInfoScene.js**: ユーザー情報表示画面（Issue #18対応、統計・実績・管理機能）

### ゲーム要素（Main Controller Pattern）
#### バブル管理システム
- **BubbleManager.js**: バブル管理統制（876語、75%削減）
  - `src/managers/bubble-manager/`: 5コンポーネント分割
  - **BubbleSpawner.js**: バブル生成システム
  - **BubblePhysicsEngine.js**: 物理演算・衝突検出
  - **BubbleDragSystem.js**: ドラッグ・フリック操作
  - **BubbleEffectProcessor.js**: 特殊効果処理
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

### 音響システム (`src/audio/`)
#### Phase G分割システム（Issue #103対応）
**アクセシビリティ音響管理** (`src/audio/accessibility/`)
- **AudioAccessibilitySupport.js**: 音響アクセシビリティ統制（336語、87%削減）
- **AudioDescriptionManager.js**: 音声説明と視覚通知管理
- **AudioCueManager.js**: 音響キューとイベント処理
- **AudioFeedbackManager.js**: 音響フィードバックと触覚処理
- **AudioSettingsManager.js**: アクセシビリティ設定管理
- **AudioEventManager.js**: 音響イベントの統一管理
- **AudioLegacyAdapter.js**: 既存システムとの互換性維持

### アクセシビリティシステム (`src/accessibility/`)
#### Main Controllerパターン適用（Phase E.3完了）
- **KeyboardNavigationTester.js**: キーボードナビゲーションテスト統制（781語、75%削減）
  - `src/accessibility/keyboard-navigation/`: 3コンポーネント分割
  - **KeyboardEventHandler.js**: イベント処理
  - **NavigationStateManager.js**: フォーカス管理
  - **KeyboardAccessibilityReporter.js**: レポート生成
- **WCAGValidator.js**: WCAG準拠検証統制（726語、75%削減）
  - `src/accessibility/wcag-validation/`: 3コンポーネント分割
  - **WCAGRuleEngine.js**: ガイドライン検証
  - **AccessibilityAuditor.js**: 監査実行
  - **ComplianceReporter.js**: 準拠レポート
- **ScreenReaderSimulator.js**: スクリーンリーダーシミュレーション統制（731語、75%削減）
  - `src/accessibility/screen-reader/`: 3コンポーネント分割
  - **ScreenReaderEngine.js**: シミュレーションエンジン
  - **ARIAAttributeProcessor.js**: ARIA処理
  - **TextToSpeechController.js**: 音声合成制御
- **AccessibilityOnboarding.js**: アクセシビリティオンボーディング統制（685語、75%削減）
  - `src/accessibility/onboarding/`: 3コンポーネント分割
  - **OnboardingFlowManager.js**: フロー管理
  - **AccessibilityTutorial.js**: チュートリアル配信
  - **OnboardingProgressTracker.js**: 進捗追跡
- **ColorContrastAnalyzer.js**: 色彩コントラスト分析統制（490語、82%削減）
  - `src/accessibility/color-contrast/`: 3コンポーネント分割
  - **ContrastCalculator.js**: コントラスト計算
  - **ColorAnalysisEngine.js**: 色彩分析
  - **ColorBlindnessSimulator.js**: 色覚異常シミュレーション
- **AccessibilitySettingsUI.js**: アクセシビリティ設定UI統制（1,254語、53%削減）
  - `src/accessibility/settings-ui/`: 3コンポーネント分割
  - **AccessibilitySettingsPanel.js**: UI描画
  - **SettingsValidator.js**: 設定検証
  - **AccessibilityPreferencesManager.js**: 設定永続化

## 技術的特徴

### 設計パターン
- **Main Controller Pattern**: 大容量ファイルの軽量コントローラー + 専門コンポーネント分離
- **コンポーネントベース**: 責任分離された各システム（2,500語制限対応）
- **イベント駆動入力**: シーン間での統一入力処理
- **エンティティコンポーネント**: 設定可能なバブル特性・振る舞い
- **データ永続化**: LocalStorage でプレイヤー進捗管理
- **統一設定管理**: ConfigurationManagerによる中央集権的設定制御
- **高性能計算**: CalculationEngineによる最適化された数値計算
- **キャッシュシステム**: 高頻度アクセスデータの高速化
- **MCPツール互換性**: 全ファイル2,500語以下でSemanticコード解析対応
- **アクセシビリティファースト**: WCAG 2.1 AA準拠、支援技術完全対応

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
- **コアシステム**: 100%完了（GameEngine + ConfigurationManager統合、Main Controller Pattern適用）
- **設定管理**: 100%完了（統一設定システム、計算エンジン）
- **ゲームプレイ**: 100%完了（BubbleManager, ScoreManager, 18+バブルタイプ）
- **データ管理**: 100%完了（PlayerData, StatisticsManager, AchievementManager）
- **UI/UX**: 100%完了（全シーン、エフェクト、音響、アクセシビリティ）
- **最適化**: 100%完了（パフォーマンス、メモリ、レンダリング最適化）
- **ファイル分割**: 100%完了（38ファイル分割、77%削減、MCPツール完全対応）
- **テスト**: 100%完了（包括的ユニット、統合、E2E、パフォーマンステスト）
- **デプロイ**: 95%完了（ビルド設定、デプロイ環境、最終調整残り）

## ファイル構成の完成度（大容量ファイル分割後）
- **総JSファイル数**: 100+ファイル（分割により倍増）
- **Main Controllerファイル**: 38ファイル（全て2,500語以下）
- **分割コンポーネント**: 150+ファイル（専門化された小規模ファイル）
- **コア機能**: 30+ファイル（100%完了）- Main Controller Pattern適用
- **設定管理**: 5ファイル（100%完了）- GameConfig, AudioConfig等
- **シーン**: 15+ファイル（100%完了）- 分割コンポーネント含む
- **マネージャー**: 10+ファイル（100%完了）- 分割コンポーネント含む
- **ユーティリティ**: 20+ファイル（100%完了）- 最適化済み
- **エフェクト・UI**: 15+ファイル（100%完了）- 高度分割済み
- **テストスイート**: 25+ファイル（100%完了）- Jest, Playwright E2E
- **MCPツール互換性**: 100%（全ファイル2,500語以下、Serena完全対応）

## 大容量ファイル分割プロジェクト成果（Issue #72）
### Phase A-D完了実績
- **分割対象**: 38ファイル（元総語数: 約15万語）
- **削減実績**: 77%削減達成（語数大幅削減）
- **Main Controller Pattern**: 全分割ファイルに適用
- **後方互換性**: 100%維持（既存API完全保持）

### 分割アーキテクチャパターン
1. **Main Controller**: 元クラス → 軽量統制コントローラー（公開API保持）
2. **専門コンポーネント**: 機能別分離（単一責任原則）
3. **依存注入**: メインコントローラーがサブコンポーネント統制
4. **MCPツール最適化**: 全ファイル2,500語以下でfind_symbolエラー解消

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

## 開発ツールシステム (`tools/`)
### Phase G分割システム（Issue #103対応）
**バランス調整ツール** (`tools/balance/`)
- **balance-adjuster.js**: バランス調整ツール統制（463語、85%削減）
- **BalanceDataLoader.js**: 設定ファイル読み込みと解析
- **BalanceCalculator.js**: バランス計算とインパクト分析
- **BalanceValidator.js**: テスト実行と検証機能
- **BalanceExporter.js**: 設定保存とエクスポート機能

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