# バブルポップゲーム - リリース手順書

## 概要

このドキュメントでは、バブルポップゲームのリリース手順について説明します。

## 前提条件

- Node.js (v18以上)
- npm または yarn
- Git
- GitHub CLI (gh) - オプション

## リリース前チェックリスト

### 1. コード品質チェック
```bash
# 依存関係のインストール
npm install

# リンターチェック
npm run lint

# テスト実行
npm test

# E2Eテスト実行
npm run test:e2e

# パフォーマンステスト実行
npm run test:performance
```

### 2. ビルドテスト
```bash
# 本番ビルド実行
npm run build

# ビルド結果の確認
ls -la dist/

# ローカルでビルド版をテスト
npm run preview
```

### 3. 動作確認
- [動作確認手順書](./testing-procedures.md)に従って全機能をテスト
- 複数ブラウザでの動作確認
- モバイルデバイスでの動作確認

## リリース手順

### 1. バージョン管理

#### package.jsonのバージョン更新
```bash
# パッチバージョンアップ（バグ修正）
npm version patch

# マイナーバージョンアップ（新機能追加）
npm version minor

# メジャーバージョンアップ（破壊的変更）
npm version major
```

#### 変更ログの更新
`CHANGELOG.md`を更新し、以下の情報を記載：
- 新機能
- バグ修正
- 破壊的変更
- 既知の問題

### 2. 自動デプロイ（推奨）

#### GitHub Actionsを使用した自動デプロイ
```bash
# mainブランチにプッシュ
git push origin main

# タグをプッシュ（自動デプロイトリガー）
git push origin --tags
```

#### Netlifyでの自動デプロイ
- GitHubリポジトリと連携済みの場合、mainブランチへのプッシュで自動デプロイ
- ビルドコマンド: `npm run build`
- 公開ディレクトリ: `dist`

### 3. 手動デプロイ

#### Netlifyへの手動デプロイ
```bash
# ビルド実行
npm run build

# Netlify CLIでデプロイ
npx netlify deploy --prod --dir=dist
```

#### Vercelへの手動デプロイ
```bash
# Vercel CLIでデプロイ
npx vercel --prod
```

#### 静的ホスティングサービスへのデプロイ
```bash
# ビルド実行
npm run build

# distフォルダの内容をホスティングサービスにアップロード
```

## デプロイ後の確認

### 1. 基本動作確認
- [ ] ゲームが正常に起動する
- [ ] メインメニューが表示される
- [ ] ステージ選択が機能する
- [ ] ゲームプレイが正常に動作する

### 2. パフォーマンス確認
```bash
# Lighthouse監査実行
npm run lighthouse

# パフォーマンス指標の確認
# - Performance: 90以上
# - Accessibility: 95以上
# - Best Practices: 90以上
# - SEO: 90以上
```

### 3. クロスブラウザ確認
- [ ] Chrome（最新版）
- [ ] Firefox（最新版）
- [ ] Safari（最新版）
- [ ] Edge（最新版）
- [ ] モバイルブラウザ（iOS Safari、Android Chrome）

## ロールバック手順

### 問題が発生した場合の緊急対応

#### 1. 前のバージョンへのロールバック
```bash
# 前のコミットに戻す
git revert HEAD

# 緊急修正をプッシュ
git push origin main
```

#### 2. Netlifyでのロールバック
1. Netlify管理画面にログイン
2. サイトの「Deploys」タブを開く
3. 前の正常なデプロイを選択
4. 「Publish deploy」をクリック

#### 3. 緊急メンテナンス
必要に応じて、メンテナンス画面を表示：
```html
<!-- index.htmlを一時的に置き換え -->
<!DOCTYPE html>
<html>
<head>
    <title>メンテナンス中</title>
</head>
<body>
    <h1>メンテナンス中</h1>
    <p>現在システムメンテナンス中です。しばらくお待ちください。</p>
</body>
</html>
```

## 監視とアラート

### 1. エラー監視
- ブラウザコンソールエラーの監視
- JavaScript実行エラーの追跡
- パフォーマンス低下の検出

### 2. アクセス監視
- ページビュー数の確認
- ユーザーエンゲージメントの測定
- 離脱率の監視

## トラブルシューティング

### よくある問題と解決方法

#### ビルドエラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install

# キャッシュをクリア
npm run clean
```

#### デプロイエラー
- 環境変数の設定確認
- ビルド設定の確認
- 依存関係の確認

#### パフォーマンス問題
- アセットサイズの最適化
- 画像圧縮の確認
- コード分割の実装

## 連絡先

リリースに関する問題や質問がある場合：
- 開発チーム: [連絡先]
- 緊急時対応: [緊急連絡先]

## 関連ドキュメント

- [動作確認手順書](./testing-procedures.md)
- [開発環境セットアップ](./development-setup.md)
- [トラブルシューティングガイド](./troubleshooting.md)