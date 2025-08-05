# 推奨コマンド・開発ワークフロー

## 日常開発コマンド

### 開発サーバー
```bash
# 開発サーバー起動（推奨：ローカル開発）
python -m http.server 8000
# または
npx serve .

# Vite開発サーバー（高度な機能使用時）
npm run dev
```

### アクセスURL
```bash
# メインゲーム
http://localhost:8000

# テスト環境
http://localhost:8000/test.html

# デバッグモード
http://localhost:8000?debug=true
# キーボードショートカット: Ctrl+Shift+D
```

## テスト実行

### 基本テスト
```bash
# 全テストスイート実行
npm test

# 単体テスト（推奨：開発中）
npm run test:unit

# テスト監視モード
npm run test:watch
npm run test:unit:watch

# カバレッジ付きテスト
npm run test:coverage
npm run test:unit:coverage
```

### 専門テスト
```bash
# パフォーマンステスト
npm run test:performance
npm run test:performance:verbose

# E2Eテスト
npm run test:e2e
npm run test:e2e:ui        # UI表示付き
npm run test:e2e:debug     # デバッグモード

# 統合テスト
npm run test:integration
npm run test:integration:watch

# 品質テスト
npm run test:quality
npm run test:translation-quality
npm run test:i18n-usability

# 全テスト実行（CI用）
npm run test:all
```

## ビルド・デプロイメント

### ビルド
```bash
# 本番ビルド
npm run build

# 開発ビルド
npm run build:dev

# ステージングビルド
npm run build:staging

# GitHub Pages用ビルド
npm run build:gh-pages

# 強制ビルド（キャッシュクリア）
npm run build:force

# バンドル分析
npm run build:analyze
```

### プレビュー・デプロイ
```bash
# ビルド結果のプレビュー
npm run preview
npm run preview:dist

# デプロイメント
npm run deploy:netlify      # Netlify本番
npm run deploy:vercel       # Vercel本番
npm run deploy:gh-pages     # GitHub Pages
npm run deploy:all          # 全プラットフォーム
npm run deploy:staging      # ステージング環境
```

## 設定・検証

### 設定検証
```bash
# 設定ファイル検証
npm run validate:config
npm run validate:config:verbose

# i18n設定検証
npm run validate:i18n-requirements
npm run i18n:validate
```

### ファイルサイズ監視（MCPトークン制限対応）
```bash
# ファイルサイズチェック
npm run filesize:check

# ファイルサイズ監視（リアルタイム）
npm run filesize:watch

# サイズレポート生成
npm run filesize:report

# 手動チェック
node tools/file-size-monitor.js src
node tools/file-size-monitor.js src/scenes  # 特定ディレクトリ
```

## 国際化（i18n）

### i18n開発
```bash
# i18n環境セットアップ
npm run i18n:setup

# i18n最適化
npm run i18n:optimize

# 翻訳品質レポート
npm run i18n:quality-report

# i18nパフォーマンステスト
npm run i18n:performance-test
npm run test:i18n-performance

# i18nリリース準備
npm run prepare:i18n-release
```

## ドキュメント管理

### API文書生成
```bash
# API文書生成
npm run docs:generate
npm run docs:generate:private      # private含む
npm run docs:generate:no-examples  # 例なし

# 文書検証
npm run docs:validate
npm run docs:validate:quick        # 高速検証
npm run docs:validate:full         # 完全検証

# リンクチェック
npm run docs:check-links
npm run docs:check-links:internal  # 内部リンクのみ
npm run docs:check-links:verbose   # 詳細出力

# 文書監視
npm run docs:watch
npm run docs:monitor               # バックグラウンド監視

# 文書品質チェック
npm run docs:quality
```

### 文書サーバー
```bash
# 文書サーバー起動
npm run docs:serve                 # http://localhost:8080

# 文書クリーンアップ
npm run docs:clean
```

## 品質・パフォーマンス

### パフォーマンス監視
```bash
# Lighthouse分析
npm run lighthouse
npm run lighthouse:ci

# バンドルサイズチェック
npm run size-check
```

### プロジェクト最適化
```bash
# ビルド最適化
npm run optimize

# プロジェクトクリーンアップ
npm run clean
```

## Git・開発環境

### Git Hooks
```bash
# Git Hooks セットアップ
npm run setup:hooks
npm run setup:hooks:force
```

## Darwin (macOS) システムコマンド

### 基本システムコマンド
```bash
# ファイル・ディレクトリ操作
ls -la                    # ファイル一覧（詳細）
find . -name "*.js"       # JavaScript ファイル検索
grep -r "pattern" src/    # パターン検索
cd path/to/directory      # ディレクトリ移動

# プロセス管理
ps aux | grep node        # Node.js プロセス確認
kill -9 <PID>            # プロセス強制終了
lsof -ti:8000            # ポート8000使用プロセス確認

# ネットワーク
netstat -an | grep 8000   # ポート8000の状態確認
curl http://localhost:8000 # ローカルサーバーテスト
```

### Git操作
```bash
# 基本Git操作
git status                # 変更状況確認
git add .                 # 全変更をステージング
git commit -m "message"   # コミット
git push origin main      # プッシュ
git pull origin main      # プル

# ブランチ操作
git checkout -b feature/new-feature  # 新ブランチ作成・切替
git merge feature-branch             # マージ
git branch -d feature-branch         # ブランチ削除
```