# Implementation Plan

- [x] 1. Jest設定の修正とES Modules対応
  - Jest設定ファイルにES Modules互換性設定を追加
  - `extensionsToTreatAsEsm`オプションの設定
  - 既存設定との互換性確認
  - _Requirements: 1.2, 3.1, 3.2_

- [x] 2. テストセットアップファイルの修正
  - jest-canvas-mockパッケージの適切な利用
  - 手動Canvas mockingコードの整理・削除
  - ES Modules環境でのインポート方式の修正
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. package.jsonスクリプトの最適化
  - NODE_OPTIONSフラグの調整
  - 警告メッセージの抑制設定
  - テスト実行コマンドの最適化
  - _Requirements: 3.2, 3.3_

- [x] 4. Jest設定の検証とテスト実行
  - 修正されたJest設定での基本テスト実行
  - "jest is not defined"エラーの解消確認
  - Canvas mockingの動作確認
  - _Requirements: 1.1, 2.2, 4.1_

- [x] 5. 全テストスイートの実行確認
  - 全ての既存テストファイルの実行確認
  - エラーメッセージの確認と修正
  - テスト結果の検証
  - _Requirements: 4.1, 4.2_

- [ ] 6. CI/CD環境での動作確認
  - GitHub Actions等でのテスト実行確認
  - 環境変数とNODE_OPTIONSの互換性確認
  - パフォーマンスの確認
  - _Requirements: 1.3, 4.3_

- [ ] 7. 設定ドキュメントの更新
  - Jest設定変更の文書化
  - ES Modules + Jest使用時の注意点記載
  - トラブルシューティングガイドの作成
  - _Requirements: 5.1, 5.2_

- [ ] 8. 回帰テストとバリデーション
  - 修正前後のテスト実行時間比較
  - カバレッジレポートの確認
  - 設定の安定性確認
  - _Requirements: 4.2, 5.3_

- [ ] 9. 最終検証とクリーンアップ
  - 不要なコードやコメントの削除
  - 設定ファイルの最適化
  - 最終的なテスト実行確認
  - _Requirements: 4.1, 4.2, 4.3_