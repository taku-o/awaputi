# Implementation Plan

- [x] 1. i18n-deployment-setup.jsスクリプトの修正
  - optimizeTranslationFiles()関数からoptimizedAtタイムスタンプ更新処理を削除
  - ファイル書き込み処理をidempotentに変更（内容が同じ場合は書き込みをスキップ）
  - _Requirements: 1.1, 1.2, 4.1, 4.2_

- [x] 2. 既存翻訳ファイルからoptimizedAtフィールドを削除
  - 全35個の翻訳ファイル（5言語×7カテゴリ）からoptimizedAtフィールドを削除
  - メタデータの整合性を保持（language, version, completeness等は維持）
  - _Requirements: 2.1, 2.2_

- [x] 3. デプロイメントレポートに最適化情報を追加
  - i18n-deployment-report.jsonに最適化タイムスタンプを記録する機能を追加
  - 最適化処理の統計情報（処理ファイル数、処理時間等）を含める
  - _Requirements: 3.1, 3.2_

- [x] 4. i18n:setupスクリプトのidempotency テストを作成
  - 同じ翻訳ファイルに対して複数回実行してもファイルが変更されないことを検証
  - git statusでの変更検出がないことを確認するテスト
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. TranslationLoaderとの互換性テストを作成
  - 修正後の翻訳ファイル構造でTranslationLoaderが正常動作することを検証
  - メタデータ検証機能（_validateMetadata）の動作確認
  - _Requirements: 2.2, 5.1, 5.2_

- [x] 6. ビルドプロセス全体のintegration テストを作成
  - npm run buildの複数回実行でファイル変更が発生しないことを検証
  - prebuildプロセス全体の動作確認
  - _Requirements: 1.1, 1.2, 1.3, 4.3_

- [ ] 7. 既存のi18n関連テストの実行と修正
  - 全てのi18n関連unit testを実行して互換性を確認
  - 必要に応じてテストケースを修正（optimizedAt関連の期待値削除等）
  - _Requirements: 5.2, 5.3_

- [ ] 8. パフォーマンス影響の測定とテスト
  - 修正前後でのビルド時間の比較測定
  - 翻訳ファイル読み込み性能への影響測定
  - _Requirements: 3.3_

- [ ] 9. エラーハンドリングの強化とテスト
  - ファイル読み書きエラー時の適切な処理を実装
  - JSONパースエラー時の graceful degradation を実装
  - エラーケースのunit testを作成
  - _Requirements: 2.1, 2.2_

- [ ] 10. ドキュメントの更新
  - 変更内容をREADME.mdやdocs/に記録
  - i18nシステムの仕様変更を開発者向けドキュメントに反映
  - _Requirements: 5.3_

- [ ] 11. 最終的な動作確認とregression テスト
  - 全ての翻訳機能が正常に動作することを確認
  - デプロイメントプロセスに影響がないことを確認
  - 本番環境での動作を想定したE2Eテスト
  - _Requirements: 5.1, 5.2, 5.3_