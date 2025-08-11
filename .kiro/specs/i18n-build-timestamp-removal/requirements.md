# Requirements Document

## Introduction

npm run buildを実行するたびに、src/locales以下の翻訳ファイル（35個）が「変更」状態になってしまう問題を解決する。現在、i18n:setupスクリプトが翻訳ファイルのoptimizedAtタイムスタンプを現在時刻に更新するため、ビルドのたびにGitで変更として検出される。これは開発・バージョン管理上の問題となっている。

解決方針として、動的なタイムスタンプを翻訳ファイルから削除し、必要な場合は他の場所にハードコーディングする方式を採用する。

## Requirements

### Requirement 1

**User Story:** As a developer, I want to run npm run build without causing unnecessary file changes, so that I can maintain clean version control history.

#### Acceptance Criteria

1. WHEN npm run buildを実行 THEN src/locales以下の翻訳ファイルが変更状態にならない SHALL システム
2. WHEN ビルドプロセスが完了 THEN 翻訳ファイルのoptimizedAtフィールドが更新されない SHALL システム
3. WHEN git statusを確認 THEN 翻訳ファイルが変更として表示されない SHALL システム

### Requirement 2

**User Story:** As a developer, I want to preserve essential metadata in translation files, so that the i18n system continues to function correctly.

#### Acceptance Criteria

1. WHEN 翻訳ファイルを読み込み THEN language、version、completenessなどの必要なメタデータが保持されている SHALL システム
2. WHEN TranslationLoaderがメタデータを検証 THEN 既存の機能が正常に動作する SHALL システム
3. WHEN i18nシステムが初期化 THEN 翻訳の品質チェックが継続して機能する SHALL システム

### Requirement 3

**User Story:** As a developer, I want to track translation optimization information when needed, so that I can monitor i18n system performance without affecting version control.

#### Acceptance Criteria

1. WHEN 最適化情報が必要 THEN 静的な場所（設定ファイルやコード内）で管理される SHALL システム
2. WHEN デプロイメントレポートを生成 THEN 最適化情報が適切に記録される SHALL システム
3. WHEN パフォーマンス監視が必要 THEN 動的でない方法で最終更新時間を取得できる SHALL システム

### Requirement 4

**User Story:** As a developer, I want the i18n:setup script to be idempotent, so that multiple executions don't cause unnecessary changes.

#### Acceptance Criteria

1. WHEN i18n:setupスクリプトを複数回実行 THEN 翻訳ファイルの内容が変更されない SHALL システム
2. WHEN prebuildプロセスが実行 THEN 既に最適化済みのファイルが再度変更されない SHALL システム
3. WHEN 開発環境でビルドを繰り返し実行 THEN ファイルの変更状態が発生しない SHALL システム

### Requirement 5

**User Story:** As a developer, I want to maintain backward compatibility with existing i18n functionality, so that no existing features are broken.

#### Acceptance Criteria

1. WHEN 既存のi18nコードが実行 THEN すべての翻訳機能が正常に動作する SHALL システム
2. WHEN テストスイートを実行 THEN すべてのi18n関連テストがパスする SHALL システム
3. WHEN 本番環境にデプロイ THEN ユーザー向け機能に影響がない SHALL システム