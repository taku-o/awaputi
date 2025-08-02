# MCPトークン制限問題修正 - 実装タスク

## 緊急対応フェーズ（最優先）

- [x] 1. ファイルサイズ監視システムの構築
  - ファイルサイズチェックスクリプトの作成
  - 制限超過ファイルの自動検出機能
  - 分割優先度の自動算出
  - _要件: 3.1, 3.2_

- [x] 1.1. CLAUDE.mdの分割（3,835語 → 865語）
  - 完了済みプロジェクト情報をdocs/projects/completed-projects.mdに移動
  - 進行中プロジェクト情報をdocs/projects/active-projects.mdに移動
  - アーキテクチャ情報をdocs/architecture.mdに移動
  - 開発ガイドラインをdocs/development-guide.mdに移動
  - CLAUDE.mdから詳細情報を削除し、参照リンクに置き換え
  - ファイルサイズ制限ルールをdocs/development-guide.mdに追加
  - _要件: 1.1, 2.1_

- [x] 2. UserInfoScene.js の分割（11,260語 → 複数ファイル）
  - UserInfoScene.js のメインコントローラー部分の抽出（< 2,500語）
  - UserProfileManager.js の作成（プロフィール管理機能）
  - UserStatisticsRenderer.js の作成（統計表示機能）
  - UserAchievementDisplay.js の作成（実績表示機能）
  - UserDataExporter.js の作成（データエクスポート機能）
  - UserHelpIntegration.js の作成（ヘルプ統合機能）
  - UserInfoTabManager.js の作成（タブ管理機能）
  - UserInfoRenderer.js の作成（レンダリング機能）
  - UserInfoEventHandler.js の作成（イベント処理機能）
  - インポート文の更新と依存関係の修正
  - 分割後の機能テスト実行
  - _要件: 1.1, 2.2, 2.3_

- [x] 3. EventStageManager.js の分割（9,914語 → 933語）
  - EventStageManager.js のメインマネージャー部分の抽出（< 2,500語）
  - SeasonalEventManager.js の作成（季節イベント管理）
  - EventRankingSystem.js の作成（ランキングシステム）
  - EventNotificationSystem.js の作成（通知システム）
  - EventHistoryManager.js の作成（履歴管理）
  - インポート文の更新と依存関係の修正
  - 新コンポーネントアーキテクチャによる統合
  - レガシーAPI互換性の維持
  - 分割後の機能テスト実行
  - _要件: 1.2, 2.2, 2.3_

## 高優先度対応フェーズ

- [x] 4. MobilePerformanceOptimizer.js の分割（8,405語 → 1,858語）
  - MobilePerformanceOptimizer.js のメインオプティマイザー部分の抽出（< 2,500語）
  - MobileResourceManager.js の作成（リソース管理）
  - MobileRenderOptimizer.js の作成（レンダリング最適化）
  - MobileBatteryOptimizer.js の作成（バッテリー最適化）
  - MobileMemoryManager.js の作成（メモリ管理）
  - インポート文の更新と依存関係の修正
  - 新コンポーネントアーキテクチャによる統合
  - 分割後のパフォーマンステスト実行
  - _要件: 1.3, 2.2, 2.3_

- [x] 5. SoundEffectSystem.js の分割（7,349語 → 1,208語）
  - SoundEffectSystem.js のメインシステム部分の抽出（< 2,500語）
  - AudioEffectManager.js の作成（エフェクト管理）
  - SoundPoolManager.js の作成（サウンドプール管理）
  - AudioContextManager.js の作成（オーディオコンテキスト管理）
  - SoundEffectRenderer.js の作成（エフェクトレンダリング）
  - インポート文の更新と依存関係の修正
  - 分割後のオーディオ機能テスト実行
  - _要件: 1.4, 2.2, 2.3_

- [x] 6. TutorialOverlay.js の分割（6,627語 → 1,634語）
  - TutorialOverlay.js のメインオーバーレイ部分の抽出（< 2,500語）
  - TutorialStepManager.js の作成（ステップ管理）
  - TutorialAnimationController.js の作成（アニメーション制御）
  - TutorialInteractionHandler.js の作成（インタラクション処理）
  - TutorialProgressTracker.js の作成（進捗追跡）
  - インポート文の更新と依存関係の修正
  - 分割後のチュートリアル機能テスト実行
  - _要件: 1.5, 2.2, 2.3_

## 中優先度対応フェーズ

- [ ] 7. AudioController.js の分割（6,409語 → 複数ファイル）
  - AudioController.js のメインコントローラー部分の抽出（< 2,500語）
  - AudioChannelManager.js の作成（チャンネル管理）
  - AudioVolumeController.js の作成（音量制御）
  - AudioFormatHandler.js の作成（フォーマット処理）
  - インポート文の更新と依存関係の修正
  - _要件: 2.1, 2.2, 2.3_

- [ ] 8. LeaderboardUI.js の分割（6,337語 → 複数ファイル）
  - LeaderboardUI.js のメインUI部分の抽出（< 2,500語）
  - LeaderboardRenderer.js の作成（レンダリング）
  - LeaderboardDataManager.js の作成（データ管理）
  - LeaderboardAnimationController.js の作成（アニメーション）
  - インポート文の更新と依存関係の修正
  - _要件: 2.1, 2.2, 2.3_

- [ ] 9. ComparisonEngine.js の分割（6,130語 → 複数ファイル）
  - ComparisonEngine.js のメインエンジン部分の抽出（< 2,500語）
  - DataComparator.js の作成（データ比較）
  - ComparisonAlgorithms.js の作成（比較アルゴリズム）
  - ComparisonResultRenderer.js の作成（結果レンダリング）
  - インポート文の更新と依存関係の修正
  - _要件: 2.1, 2.2, 2.3_

- [ ] 10. SocialSharingManager.js の分割（5,943語 → 複数ファイル）
  - SocialSharingManager.js のメインマネージャー部分の抽出（< 2,500語）
  - SocialPlatformAdapters.js の作成（プラットフォーム対応）
  - ShareContentGenerator.js の作成（コンテンツ生成）
  - SocialAnalyticsTracker.js の作成（分析追跡）
  - インポート文の更新と依存関係の修正
  - _要件: 2.1, 2.2, 2.3_

## システム最適化フェーズ

- [ ] 11. MCPツール設定の最適化
  - .kiro/settings/mcp.json の作成
  - 大きなファイルの除外パターン設定
  - トークン制限の調整
  - find_symbol機能の動作確認テスト
  - _要件: 4.1, 4.2, 4.3_

- [ ] 12. ファイルサイズ監視の自動化
  - pre-commitフックの設定
  - CIでの継続的監視設定
  - 開発時のリアルタイム警告システム
  - ファイルサイズレポートの自動生成
  - _要件: 3.3, 3.4_

- [ ] 13. 残りの制限超過ファイルの段階的分割
  - 2,500語を超える残りファイルのリスト作成
  - 優先度に基づく分割計画の策定
  - 各ファイルの段階的分割実行
  - 分割後の統合テスト実行
  - _要件: 2.1, 2.2, 2.3, 2.4_

## 品質保証フェーズ

- [ ] 14. 分割後の統合テスト
  - 全シーンの動作確認テスト
  - インポート/エクスポートの整合性テスト
  - パフォーマンス回帰テスト
  - MCPツールの動作確認テスト
  - _要件: 2.4, 4.3_

- [ ] 15. コンポーネント設計標準の策定
  - ファイルサイズ制限のガイドライン作成
  - 単一責任の原則の適用指針
  - 分割タイミングの判断基準
  - 新規開発時のチェックリスト作成
  - _要件: 5.1, 5.2, 5.3, 5.4_

- [ ] 16. ドキュメントの更新
  - 分割されたコンポーネントのAPI文書更新
  - アーキテクチャ図の更新
  - 開発者向けガイドの更新
  - トラブルシューティングガイドの作成
  - _要件: 5.4_

## 最終検証フェーズ

- [ ] 17. MCPツール動作の最終確認
  - find_symbolコマンドのトークン使用量測定
  - 検索結果の精度確認
  - レスポンス時間の測定
  - エラー発生率の確認
  - _要件: 4.3_

- [ ] 18. プロジェクト全体の健全性チェック
  - 全ファイルのサイズ制限遵守確認
  - 依存関係の循環参照チェック
  - 未使用インポートの削除
  - コードカバレッジの確認
  - _要件: 2.4, 5.4_