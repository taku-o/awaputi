# 技術スタックとコーディング規約

## 技術スタック

### フロントエンド技術
- **言語**: JavaScript (ES6+) - Vanilla JS使用、フレームワーク不使用
- **レンダリング**: HTML5 Canvas API
- **モジュールシステム**: ES6 Modules (import/export with .js extension)
- **状態管理**: カスタムイベントシステム + Singleton パターン

### ビルド・開発ツール
- **ビルドツール**: Vite
- **パッケージマネージャー**: npm
- **環境**: Node.js (ES modules対応)

### テストツール
- **ユニットテスト**: Jest (experimental VM modules)
- **E2Eテスト**: Playwright
- **パフォーマンステスト**: Jest カスタム設定
- **品質監視**: カスタムツール（tools/test-quality-monitor.js）

### 品質保証ツール
- **バンドルサイズ**: Bundlesize
- **パフォーマンス**: Lighthouse, Lighthouse CI
- **ファイルサイズ監視**: カスタムツール（tools/file-size-monitor.js）

## コーディング規約

### 命名規則
- **変数・関数名**: camelCase（英語）
- **クラス名**: PascalCase（ドメインプレフィックス付与）
- **定数**: UPPER_SNAKE_CASE
- **ファイル名**: PascalCase.js（クラス名と一致）

### コードスタイル
- **インデント**: スペース2つ
- **コメント**: 日本語で記述
- **文字列**: シングルクォート優先
- **セミコロン**: 必須
- **改行**: LF

### アーキテクチャパターン
- **設計**: OOP（ES6クラスベース）
- **イベント処理**: addEventListener パターン
- **エラーハンドリング**: 中央集権的ErrorHandler使用
- **非同期処理**: async/await パターン

### ファイルサイズ制限
- **制限値**: 1ファイル2,500語以下
- **監視方法**: tools/file-size-monitor.js
- **分割原則**: 単一責任の原則に従う

### 日本語使用
- **コメント**: 日本語
- **ドキュメント**: 日本語（一部英語併記）
- **UI文言**: i18nシステムで管理
- **エラーメッセージ**: i18nシステムで管理

## 重要な慣習
- Lintツールは現在未設定（将来的に導入予定）
- コードフォーマッターは未使用
- 手動でコードスタイルを維持
- pre-commitフックでファイルサイズチェック実施