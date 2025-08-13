# 推奨コマンド一覧

## 開発サーバー
```bash
# ローカル開発サーバー起動（推奨）
python -m http.server 8000
# または
npx serve .

# Vite開発サーバー
npm run dev
```

## テスト実行
```bash
# ユニットテスト
npm test
npm run test:unit
npm run test:unit:watch

# E2Eテスト
npm run test:e2e
npm run test:e2e:ui  # UI付き

# パフォーマンステスト
npm run test:performance

# 統合テスト
npm run test:integration

# 全テスト実行
npm run test:all

# テスト品質監視
npm run test:quality-monitor
```

## ビルド
```bash
# プロダクションビルド
npm run build

# 開発ビルド
npm run build:dev

# GitHub Pages用ビルド
npm run build:gh-pages

# ビルド後プレビュー
npm run preview
```

## 品質チェック
```bash
# ファイルサイズチェック
npm run filesize:check
node tools/file-size-monitor.js src

# 設定検証
npm run validate:config

# ブラウザ互換性チェック
npm run check:browser-compatibility

# i18n検証
npm run i18n:validate
```

## ドキュメント
```bash
# APIドキュメント生成
npm run docs:generate

# ドキュメント検証
npm run docs:validate

# リンクチェック
npm run docs:check-links
```

## デプロイ
```bash
# Netlifyデプロイ
npm run deploy:netlify

# Vercelデプロイ
npm run deploy:vercel

# GitHub Pagesデプロイ
npm run deploy:gh-pages
```

## Git操作
```bash
# 基本的なGitコマンド
git status
git diff
git add .
git commit -m "メッセージ"
git push origin ブランチ名

# ブランチ操作
git checkout -b feature/新機能名
git checkout master
git merge feature/新機能名
```

## ユーティリティ
```bash
# 命名競合チェック
node scripts/check-naming-conflicts.js

# i18n品質レポート
npm run i18n:quality-report

# Lighthouse実行
npm run lighthouse
```

## システムコマンド（Darwin）
```bash
# ファイル一覧
ls -la

# ディレクトリ移動
cd ディレクトリ名

# ファイル検索
find . -name "*.js"

# 内容検索
grep -r "検索文字列" .

# プロセス確認
ps aux | grep node
```

## 注意事項
- 現在Lintツールは未設定（npm run lintは使用不可）
- コードフォーマッターも未設定
- ファイルサイズ制限（2,500語）に注意
- テスト実行時は`NODE_OPTIONS='--experimental-vm-modules --no-warnings'`が必要