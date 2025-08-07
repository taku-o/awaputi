# Implementation Plan

- [x] 1. Phase G.1: ツールファイル分割（balance-adjuster.js）
  - balance-adjuster.jsを機能別に分割し、tools/balance/ディレクトリ構造で整理する
  - 既存の全機能を保持しながら、各ファイルを2,000語以下に制限する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 1.1 BalanceDataLoader.jsの作成
  - loadCurrentConfiguration、getConfigValue、configKeyExists、validateInputメソッドを抽出
  - 設定ファイルの読み込みと検証機能を独立したクラスとして実装
  - _Requirements: 1.1, 1.2_

- [x] 1.2 BalanceCalculator.jsの作成
  - previewBalanceImpact、performDetailedImpactAnalysis、convertPendingChangesToAnalysisFormatメソッドを抽出
  - バランス計算とインパクト分析機能を独立したクラスとして実装
  - _Requirements: 1.1, 1.2_

- [x] 1.3 BalanceValidator.jsの作成
  - runQuickTests、runBalanceTests、testBubbleConfiguration、testScoringConfigurationメソッドを抽出
  - テスト実行と検証機能を独立したクラスとして実装
  - _Requirements: 1.1, 1.2_

- [x] 1.4 BalanceExporter.jsの作成
  - saveChanges、createConfigurationBackup、applyChangesToConfigurationFiles、recordSessionメソッドを抽出
  - 設定保存とエクスポート機能を独立したクラスとして実装
  - _Requirements: 1.1, 1.2_

- [x] 1.5 BalanceConfigManager.jsの作成
  - viewCurrentConfiguration、modifySettings、selectConfigurationKey、compareConfigurationsメソッドを抽出
  - 設定管理UI機能を独立したクラスとして実装
  - _Requirements: 1.1, 1.2_

- [x] 1.6 balance-adjuster.jsメインファイルのリファクタリング
  - 分割したクラスをインポートし、メインロジックを1,800語以下に削減
  - CLIインターフェースとメインメニュー機能のみを保持
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.7 ツール分割の統合テスト
  - 分割後のbalance-adjusterツールの全機能をテスト
  - 既存のCLIコマンドが正常に動作することを確認
  - _Requirements: 1.2, 1.5_

- [x] 2. Phase G.2: オーディオアクセシビリティ分割（AudioAccessibilitySupport.js）
  - AudioAccessibilitySupport.jsをMain Controller Patternで分割
  - src/audio/accessibility/ディレクトリ構造で整理し、各ファイルを2,500語以下に制限
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.1 AudioDescriptionManager.jsの作成
  - showVisualNotification、showCaption、displayNextCaption、createNotificationContainerメソッドを抽出
  - 音声説明と視覚通知機能を独立したクラスとして実装
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 2.2 AudioCueManager.jsの作成
  - handleBubblePopEvent、handleComboEvent、handleAchievementEvent、handleGameStateEventメソッドを抽出
  - 音響キューとイベント処理機能を独立したクラスとして実装
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 2.3 AudioFeedbackManager.jsの作成 (名前変更: AudioFeedbackProcessor.js → AudioFeedbackManager.js)
  - monitorAudioLevels、updateColorIndicator、processEventPattern、checkPatternMatchesメソッドを抽出
  - 音響フィードバック処理とパターン認識機能を独立したクラスとして実装
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2.4 AudioSettingsManager.jsの作成
  - loadSettings、applySettings、setupConfigWatchers、applyHighContrastMode、applyLargeFontsメソッドを抽出
  - アクセシビリティ設定管理機能を独立したクラスとして実装
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 2.5 AudioFeedbackManager.jsの作成 (AudioCompatibilityChecker.jsの機能統合)
  - initializeVibrationManager、updateVibrationManagerSettings、triggerHapticFeedbackメソッドを統合
  - 音響フィードバック・触覚フィードバック機能を統合したクラスとして実装
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 2.6 AudioAccessibilitySupport.jsメインコントローラーのリファクタリング
  - 分割したクラスをインポートし、Main Controller Patternを適用
  - メインファイルを1,102語に削減し、サブコンポーネントの統制機能のみを保持
  - _Requirements: 2.1, 2.4, 6.1, 6.2_

- [x] 2.7 オーディオアクセシビリティ分割の統合テスト
  - 分割後のオーディオアクセシビリティ機能をテスト
  - WCAG 2.1 AA準拠とリアルタイム処理性能を確認
  - _Requirements: 2.2, 2.3, 2.4, 5.4_

- [x] 3. Phase G.3: ビジュアルフォーカス管理分割（VisualFocusManager.js）
  - VisualFocusManager.jsをMain Controller Patternで分割
  - src/core/visual/focus/ディレクトリ構造で整理し、各ファイルを2,500語以下に制限
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.1 FocusStateManager.jsの作成
  - updateFocusVisuals、updateNavigationPath、detectAndApplySystemSettings、setHighContrastModeメソッドを抽出
  - フォーカス状態管理機能を独立したクラスとして実装
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 3.2 FocusEffectRenderer.jsの作成
  - positionFocusRing、updateFocusOverlay、highlightLandmarks、updateGroupIndicatorsメソッドを抽出
  - フォーカス効果描画機能を独立したクラスとして実装
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3.3 FocusEventHandler.jsの作成
  - setupEventListeners、handleKeyDown、handleKeyUp、handleMouseDown、handleMouseMoveメソッドを抽出
  - フォーカスイベント処理機能を独立したクラスとして実装
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3.4 FocusAccessibilitySupport.jsの作成
  - showNavigationFeedback、showKeyboardHints、updateBreadcrumbTrail、generateKeyboardHintsメソッドを抽出
  - アクセシビリティサポート機能を独立したクラスとして実装
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3.5 VisualFocusManager.jsメインコントローラーのリファクタリング
  - 分割したクラスをインポートし、Main Controller Patternを適用
  - メインファイルを1,264語に削減し、サブコンポーネントの統制機能のみを保持
  - _Requirements: 3.1, 3.4, 6.1, 6.2_

- [x] 3.6 ビジュアルフォーカス分割の統合テスト
  - 分割後のビジュアルフォーカス管理機能をテスト
  - キーボードナビゲーションと視覚的フィードバックが正常に動作することを確認
  - _Requirements: 3.2, 3.3, 5.4_

- [x] 4. Phase G.4: ビジュアルフィードバック管理分割（VisualFeedbackManager.js）
  - VisualFeedbackManager.jsをMain Controller Patternで分割
  - src/core/visual/feedback/ディレクトリ構造で整理し、各ファイルを2,500語以下に制限
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4.1 FeedbackAnimationManager.jsの作成
  - createFlashEffect、createGlowEffect、createPulseEffect、createRippleEffect、createShakeEffectメソッドを抽出
  - アニメーション管理機能を独立したクラスとして実装
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 4.2 FeedbackEffectRenderer.jsの作成
  - createColorEffect、createBorderEffect、createScaleEffect、startAudioVisualizationメソッドを抽出
  - エフェクト描画機能を独立したクラスとして実装
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 4.3 FeedbackTriggerHandler.jsの作成
  - setupEventListeners、selectFeedbackTarget、triggerVolumeBasedFeedback、triggerEdgeFeedbackメソッドを抽出
  - トリガー処理機能を独立したクラスとして実装
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 4.4 FeedbackConfigManager.jsの作成
  - loadUserPreferences、saveUserPreferences、createFeedbackElements、setupAudioAnalysisメソッドを抽出
  - 設定管理機能を独立したクラスとして実装
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 4.5 VisualFeedbackManager.jsメインコントローラーのリファクタリング
  - 分割したクラスをインポートし、Main Controller Patternを適用
  - メインファイルを1,200語以下に削減し、サブコンポーネントの統制機能のみを保持
  - _Requirements: 4.1, 4.4, 6.1, 6.2_

- [x] 4.6 ビジュアルフィードバック分割の統合テスト
  - 分割後のビジュアルフィードバック管理機能をテスト
  - 視覚的フィードバックとゲーム体験が正常に維持されることを確認
  - _Requirements: 4.2, 4.3, 5.4_

- [ ] 5. Phase G.5: 品質保証と最終検証
  - 全分割ファイルの品質保証とMCPツール互換性の最終確認
  - パフォーマンステストと統合テストの実行
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5.1 ファイルサイズ検証
  - 全分割ファイルが2,500語以下であることを確認
  - wc -wコマンドを使用してファイルサイズを測定し、記録
  - _Requirements: 5.1_

- [ ] 5.2 機能完全性テスト
  - 既存のテストスイートを実行し、全テストが通過することを確認
  - 分割前後で機能に差異がないことを検証
  - _Requirements: 5.2, 5.5_

- [ ] 5.3 後方互換性テスト
  - 既存のAPIインターフェースが100%維持されていることを確認
  - インポート文とクラス使用方法に変更がないことを検証
  - _Requirements: 5.3_

- [ ] 5.4 パフォーマンステスト
  - 分割後のシステムパフォーマンスを測定
  - 性能劣化が5%以内に収まることを確認
  - _Requirements: 5.4_

- [ ] 5.5 統合テスト実行
  - 全機能が正常に連携することを確認
  - エンドツーエンドテストを実行し、システム全体の動作を検証
  - _Requirements: 5.5_

- [ ] 6. Phase G.6: ドキュメント更新と完了処理
  - 分割後のファイル構造とAPIの変更をドキュメント化
  - アーキテクチャドキュメントの更新と移行ガイドの作成
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 6.1 JSDocコメント更新
  - 各分割ファイルにJSDocコメントを適切に記載
  - クラスの役割と責任を明確に説明
  - _Requirements: 7.1, 7.5_

- [ ] 6.2 README.md更新
  - 新しいファイル構造をREADME.mdに反映
  - ディレクトリ構造の変更を文書化
  - _Requirements: 7.2, 7.5_

- [ ] 6.3 移行ガイド作成
  - APIの変更点と移行方法を説明するガイドを作成
  - 開発者向けの変更点サマリーを提供
  - _Requirements: 7.3_

- [ ] 6.4 アーキテクチャドキュメント更新
  - Main Controller Patternの適用をアーキテクチャドキュメントに反映
  - 新しいファイル構造と責任分離を文書化
  - _Requirements: 7.4_

- [ ] 6.5 完了報告作成
  - Phase G完了報告書を作成
  - MCPツール完全互換達成の確認と成果をまとめる
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7. Phase G.7: 最終コミットと完了
  - 全変更をコミットし、Phase G完了をマーク
  - Issue #103のクローズ準備
  - _Requirements: 全要件_

- [ ] 7.1 最終テスト実行
  - 全テストスイートを実行し、問題がないことを最終確認
  - CI/CDパイプラインでの自動テストも確認
  - _Requirements: 5.2, 5.5_

- [ ] 7.2 変更のコミット
  - 全分割ファイルと更新されたドキュメントをコミット
  - 適切なコミットメッセージでPhase G完了を記録
  - _Requirements: 全要件_

- [ ] 7.3 Issue #103完了報告
  - GitHub Issue #103に完了報告を投稿
  - MCPツール完全互換達成の確認結果を報告
  - _Requirements: 5.1_