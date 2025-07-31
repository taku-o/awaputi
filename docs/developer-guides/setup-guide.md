# 開発環境セットアップガイド

## 概要

このガイドでは、BubblePop (awaputi) プロジェクトの開発環境をセットアップする手順を説明します。新しい開発者が迅速にプロジェクトに参加できるよう、必要なツールの導入から初回実行まで詳細に説明しています。

## 前提条件

### 必須環境
- **Node.js**: v16.0.0 以上 (推奨: v18.0.0+)
- **npm**: v8.0.0 以上
- **Git**: v2.20.0 以上
- **Python**: v3.7+ (開発サーバー用)

### 推奨環境
- **OS**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **ブラウザ**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **エディタ**: VS Code, WebStorm, または ES6 対応エディタ
- **メモリ**: 8GB RAM以上
- **ストレージ**: 5GB以上の空き容量

## 環境構築手順

### 1. リポジトリのクローン

```bash
# HTTPSでクローン
git clone https://github.com/taku-o/awaputi.git
cd awaputi

# または SSH でクローン
git clone git@github.com:taku-o/awaputi.git
cd awaputi
```

### 2. 依存関係のインストール

```bash
# パッケージのインストール
npm install

# 開発用パッケージの確認
npm ls --depth=0
```

### 3. ローカル開発サーバーの起動

#### 推奨方法1: Python HTTP サーバー
```bash
# メインディレクトリで実行
python -m http.server 8000

# アクセス URL
# http://localhost:8000 (メインゲーム)
# http://localhost:8000/test.html (テスト環境)
```

#### 推奨方法2: npx serve
```bash
# npm serve パッケージを使用
npx serve . -p 8000

# アクセス URL
# http://localhost:8000
```

#### その他のオプション
```bash
# Node.js の http-server を使用する場合
npm install -g http-server
http-server -p 8000

# PHP サーバーを使用する場合
php -S localhost:8000
```

### 4. 開発環境の確認

#### ゲームの動作確認
1. ブラウザで http://localhost:8000 にアクセス
2. メインメニューが表示されることを確認
3. "ゲームスタート" でゲームが開始することを確認
4. 泡をクリックしてポップできることを確認

#### デバッグモードの確認
```bash
# デバッグモードでアクセス
# http://localhost:8000?debug=true

# または、ゲーム内でキーボードショートカット
# Ctrl+Shift+D (デバッグパネル表示)
```

### 5. テスト環境の設定

#### ユニットテスト
```bash
# Jest テストの実行
npm test

# 特定のテストファイル実行
npm test -- src/core/ConfigurationManager.test.js

# カバレッジ付きテスト
npm run test:coverage
```

#### E2Eテスト
```bash
# Playwright のセットアップ
npx playwright install

# E2Eテスト実行
npm run test:e2e

# 特定のテストスイート実行
npm run test:e2e -- --grep "設定管理"
```

#### パフォーマンステスト
```bash
# パフォーマンステスト実行
npm run test:performance

# 全テストスイート実行
npm run test:all
```

## 開発ツールの設定

### VS Code 推奨設定

#### 必須拡張機能
```json
{
  "recommendations": [
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.live-server",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.js-debug-nightly"
  ]
}
```

#### ワークスペース設定 (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "javascript.preferences.includePackageJsonAutoImports": "on",
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "files.associations": {
    "*.js": "javascript"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

#### デバッグ設定 (.vscode/launch.json)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "pwa-chrome",
      "url": "http://localhost:8000",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true
    },
    {
      "name": "Launch Chrome (Debug Mode)",
      "request": "launch",
      "type": "pwa-chrome",
      "url": "http://localhost:8000?debug=true",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true
    }
  ]
}
```

### Git の設定

#### 推奨 Git 設定
```bash
# 改行コードの自動変換を無効化
git config --local core.autocrlf false

# プッシュ設定
git config --local push.default simple

# ブランチのマージ設定
git config --local merge.ours.driver "echo 'Updated %O'"
```

#### Git フック (オプション)
```bash
# pre-commit フックの設定 (ESLint + テスト実行)
cp .githooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## プロジェクト構造の理解

### ディレクトリ構造
```
awaputi/
├── src/                    # メインソースコード
│   ├── core/              # コアシステム (GameEngine, InputManager等)
│   ├── scenes/            # ゲームシーン (MainMenu, GameScene等)
│   ├── config/            # 設定ファイル (GameConfig, AudioConfig等)
│   ├── utils/             # ユーティリティ (ErrorHandler, Analytics等)
│   └── locales/           # 多言語ファイル
├── docs/                  # ドキュメント
│   ├── api-reference/     # API ドキュメント (自動生成)
│   └── developer-guides/  # 開発者ガイド
├── tools/                 # 開発ツール
├── test/                  # テストファイル
├── .kiro/                 # プロジェクト仕様・タスク管理
├── index.html             # メインゲーム
├── test.html              # テスト環境
└── package.json           # プロジェクト設定
```

### 重要なファイル
- **src/core/GameEngine.js**: ゲームのメインループと統合管理
- **src/core/ConfigurationManager.js**: 統一設定管理システム
- **src/scenes/GameScene.js**: メインゲームプレイロジック
- **src/config/GameBalance.js**: ゲームバランス設定
- **CLAUDE.md**: プロジェクト全体のガイドライン

## 開発ワークフロー

### 1. 基本的な開発フロー

#### 新機能開発
```bash
# 1. 作業ブランチの作成
git checkout master
git pull origin master
git checkout -b feature/new-feature-name

# 2. 開発実行
# コードの編集・テスト

# 3. コミット・プッシュ
git add .
git commit -m "✨ feat: 新機能の実装"
git push origin feature/new-feature-name

# 4. プルリクエスト作成
gh pr create --title "新機能: 機能名" --body "詳細説明"
```

#### バグ修正
```bash
# 1. 修正ブランチの作成
git checkout -b fix/bug-description

# 2. 修正・テスト実行
npm test
npm run test:e2e

# 3. コミット・プッシュ
git commit -m "🐛 fix: バグの修正"
git push origin fix/bug-description
```

### 2. コミットメッセージ規約

#### Conventional Commits + 絵文字形式
```
<絵文字> <type>: <description>

例:
✨ feat: 新しい泡タイプ（Magnetic）を追加
🐛 fix: スコア計算のバグを修正
📚 docs: API ドキュメントを更新
🎨 style: コードフォーマットを修正
♻️ refactor: ConfigurationManager を最適化
🧪 test: ユニットテストを追加
🔧 chore: 依存関係を更新
```

#### 利用可能な type と 絵文字
- ✨ feat: 新機能
- 🐛 fix: バグ修正
- 📚 docs: ドキュメント
- 🎨 style: スタイル変更
- ♻️ refactor: リファクタリング
- 🧪 test: テスト
- 🔧 chore: その他の変更

### 3. コードレビュープロセス

#### プルリクエスト作成前チェックリスト
- [ ] ローカルテストが全て通過している
- [ ] ESLint エラーが修正済み
- [ ] 新機能にテストが追加されている
- [ ] ドキュメントが更新されている
- [ ] パフォーマンスへの影響が確認済み

#### レビュー観点
- **機能性**: 要件を満たしているか
- **品質**: コード品質と可読性
- **テスト**: 適切なテストカバレッジ
- **パフォーマンス**: 性能への影響
- **互換性**: 既存機能への影響

## よくある問題と解決方法

### 1. 開発サーバーの問題

#### ポート使用エラー
```bash
# エラー: Address already in use :::8000
# 解決方法: 別のポートを使用
python -m http.server 8001
# または使用中のプロセスを確認
lsof -ti:8000 | xargs kill -9
```

#### CORS エラー
```bash
# エラー: Cross-Origin Request Blocked
# 解決方法: 適切な HTTP サーバーを使用
npx serve . --cors
```

### 2. 依存関係の問題

#### npm install エラー
```bash
# 1. キャッシュクリア
npm cache clean --force

# 2. node_modules 削除・再インストール
rm -rf node_modules package-lock.json
npm install

# 3. Node.js バージョン確認
node --version  # v16.0.0+
```

#### テスト実行エラー
```bash
# Jest 設定確認
npm run test -- --verbose

# Playwright インストール確認
npx playwright install --with-deps
```

### 3. パフォーマンスの問題

#### ゲーム動作が重い
```bash
# 1. デバッグモードで確認
# http://localhost:8000?debug=true

# 2. パフォーマンス設定調整
# src/config/PerformanceConfig.js
# maxBubbles: 20 → 15
# maxParticles: 500 → 300
```

#### メモリリーク
```bash
# ブラウザの開発者ツールでメモリ使用量確認
# Performance タブ → Memory → Record
```

### 4. Git の問題

#### マージコンフリクト
```bash
# 1. 最新のmaster取得
git checkout master
git pull origin master

# 2. ブランチにマージ
git checkout feature-branch
git merge master

# 3. コンフリクト解決後
git add .
git commit -m "resolve merge conflict"
```

#### 間違ったコミット
```bash
# 直前のコミットを修正
git commit --amend -m "修正されたコミットメッセージ"

# コミット取り消し (作業内容は保持)
git reset --soft HEAD~1
```

## 次のステップ

### 1. プロジェクト理解を深める
1. [アーキテクチャガイド](./architecture-guide.md) を読む
2. [コーディング規約](./coding-conventions.md) を確認
3. [API ドキュメント](../api-reference/README.md) を参照

### 2. 開発に参加する
1. [コントリビューションガイド](./contribution-guide.md) を読む
2. [Issue の選び方](./issue-selection-guide.md) を確認
3. 初回コントリビューション用の Good First Issue を探す

### 3. 高度な機能を学ぶ
1. [パフォーマンス最適化ガイド](./performance-guide.md)
2. [テスト戦略ガイド](./testing-guide.md)
3. [デプロイガイド](./deployment-guide.md)

## サポート・コミュニティ

### ヘルプが必要な場合
- **GitHub Issues**: バグ報告・機能要望
- **GitHub Discussions**: 質問・議論
- **Documentation**: 包括的なドキュメント
- **Code Comments**: 日本語コメントによる詳細説明

### 連絡先
- **プロジェクトメンテナー**: GitHub @taku-o
- **Issue 報告**: [GitHub Issues](https://github.com/taku-o/awaputi/issues)
- **機能要望**: [GitHub Discussions](https://github.com/taku-o/awaputi/discussions)

---

**開発環境のセットアップが完了しました！** 

質問がある場合は、遠慮なく Issue を作成するか、既存のドキュメントを参照してください。良い開発体験をお楽しみください！