# 推奨コマンド一覧

## 開発サーバー起動
```bash
# ローカル開発サーバー起動（推奨）
python -m http.server 8000
# または
npx serve .
# または
npm run dev

# メインゲームアクセス
# http://localhost:8000

# テスト環境アクセス
# http://localhost:8000/test.html

# デバッグモード
# http://localhost:8000?debug=true
# キーボードショートカット: Ctrl+Shift+D
```

## テスト実行
```bash
# ユニット・統合テスト
npm test

# テストをウォッチモードで実行
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage

# E2Eテスト
npm run test:e2e

# パフォーマンステスト
npm run test:performance

# 全テストスイート
npm run test:all
```

## ビルド・デプロイ
```bash
# 本番用ビルド
npm run build

# 開発用ビルド
npm run build:dev

# ビルドプレビュー
npm run preview

# ビルドファイルクリーン
npm run clean

# デプロイ（各プラットフォーム）
npm run deploy:netlify
npm run deploy:vercel
npm run deploy:gh-pages
```

## 検証・チェック
```bash
# 設定検証
npm run validate:config
npm run validate:config:verbose

# ファイルサイズチェック
npm run filesize:check
npm run filesize:watch
npm run filesize:report

# i18n関連
npm run i18n:validate
npm run i18n:quality-report
npm run validate:i18n-requirements

# Lighthouse監査
npm run lighthouse
npm run lighthouse:ci
```

## ドキュメント生成
```bash
# APIドキュメント生成
npm run docs:generate
npm run docs:generate:private  # プライベートメソッド含む
npm run docs:clean

# ドキュメント検証
npm run docs:validate
npm run docs:check-links
npm run docs:quality

# ドキュメントサーバー起動
npm run docs:serve
```

## Git フック設定
```bash
# Gitフック設定
npm run setup:hooks
npm run setup:hooks:force
```

## 一般的なGitワークフロー
```bash
# 現在の状態確認
git status

# 差分確認
git diff

# ファイルをステージング
git add [ファイル名]
git add .  # 全ファイル

# コミット
git commit -m "コミットメッセージ"

# リモートにプッシュ
git push origin [ブランチ名]

# ブランチ作成・切り替え
git checkout -b [新しいブランチ名]
git checkout [既存ブランチ名]

# コミット履歴確認
git log --oneline
```

## 便利なエイリアス
```bash
# package.jsonに定義済みのスクリプトを活用
npm run [スクリプト名]

# よく使うコマンドの組み合わせ
npm test && npm run build  # テスト後ビルド
npm run filesize:check && npm run validate:config  # サイズと設定チェック
```