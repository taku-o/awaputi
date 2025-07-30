# 推奨コマンド

## 開発サーバー起動
```bash
# ローカル開発サーバー（推奨）
python -m http.server 8000
# または
npx serve .

# Vite開発サーバー
npm run dev
```

## テスト実行
```bash
# 全テストスイート
npm run test:all

# 個別テストタイプ
npm test                    # Jestユニット・統合テスト
npm run test:e2e            # Playwrightテスト  
npm run test:performance    # パフォーマンステスト
npm run test:quality        # 品質テスト

# テスト関連
npm run test:watch          # ウォッチモード
npm run test:coverage       # カバレッジ付き
npm run test:i18n-performance # 国際化パフォーマンステスト
```

## ビルド・デプロイ
```bash
# ビルド
npm run build               # 本番ビルド
npm run build:dev           # 開発ビルド
npm run build:staging       # ステージングビルド
npm run build:gh-pages      # GitHub Pages用

# プレビュー
npm run preview             # ビルド結果プレビュー
npm run preview:dist        # 分散プレビュー

# デプロイ
npm run deploy:netlify      # Netlifyデプロイ
npm run deploy:vercel       # Vercelデプロイ
npm run deploy:gh-pages     # GitHub Pagesデプロイ
npm run deploy:all          # 全環境デプロイ
```

## 品質・最適化
```bash
# 設定検証
npm run validate:config     # 設定ファイル検証
npm run validate:config:verbose # 詳細検証

# 国際化
npm run i18n:setup          # i18n環境構築
npm run i18n:validate       # i18n検証
npm run i18n:quality-report # 翻訳品質レポート

# パフォーマンス
npm run lighthouse          # Lighthouseテスト
npm run size-check          # バンドルサイズチェック
npm run optimize            # 最適化実行
```

## Darwin/macOS 固有コマンド
```bash
# ファイル・ディレクトリ操作
ls -la                      # ファイル一覧（詳細）
find . -name "*.js"         # JavaScript ファイル検索
grep -r "pattern" src/      # テキスト検索
open index.html             # デフォルトブラウザで開く
```