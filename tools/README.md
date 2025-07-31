# BubblePop ドキュメント管理ツール

このディレクトリには、プロジェクトのドキュメント品質を維持・管理するための包括的なツールセットが含まれています。

## 🛠️ 利用可能なツール

### 1. API ドキュメント生成器 (`api-doc-generator.js`)
ソースコードから自動的に API ドキュメントを生成します。

**機能:**
- JSDoc コメントからの自動 API ドキュメント生成
- 包括的なクラス・メソッド・プロパティのドキュメント化
- 使用例とコードサンプルの自動生成
- バージョン管理とメタデータ追加

**使用方法:**
```bash
# 基本的な API ドキュメント生成
npm run docs:generate

# プライベートメンバーも含めて生成
npm run docs:generate:private

# 使用例なしで生成（高速）
npm run docs:generate:no-examples
```

### 2. ドキュメント検証ツール (`doc-validator.js`)
ドキュメントの一貫性、品質、リンクの正常性を検証します。

**機能:**
- 必須セクションの存在確認
- リンクの正常性チェック（内部・外部・アンカー）
- コンテンツ品質分析
- 相互参照検証
- API 同期チェック

**使用方法:**
```bash
# 基本的な検証
npm run docs:validate

# 高速検証（外部リンクと相互参照を省略）
npm run docs:validate:quick

# 包括的検証（レポート保存付き）
npm run docs:validate:full
```

### 3. 高度リンクチェッカー (`link-checker.js`)
ドキュメント内のすべてのリンクを包括的にチェックします。

**機能:**
- 内部・外部・アンカー・画像リンクの検証
- レスポンス時間監視
- リンク履歴管理
- 修復提案生成
- 並行処理による高速チェック

**使用方法:**
```bash
# 全リンクチェック
npm run docs:check-links

# 内部リンクのみチェック
npm run docs:check-links:internal

# 詳細出力付きチェック
npm run docs:check-links:verbose
```

### 4. ドキュメント更新通知システム (`doc-update-notifier.js`)
ドキュメントファイルの変更を監視し、通知を送信します。

**機能:**
- リアルタイムファイル変更監視
- 変更内容の詳細分析
- 依存関係追跡
- 複数チャンネルでの通知
- 自動検証実行

**使用方法:**
```bash
# 継続監視開始
npm run docs:watch

# 一回限りのスキャン
npm run docs:watch:scan

# デーモンモードで実行
npm run docs:watch:daemon

# 高頻度監視（1分間隔、30分レポート）
npm run docs:monitor
```

## 🔧 設定

### 検証設定 (`doc-validation-config.json`)
ドキュメント検証ツールの動作を制御する設定ファイルです。

**主要設定項目:**
- `validationRules.requiredSections`: ファイル別必須セクション
- `qualityRules`: 品質基準（行長、最小単語数など）
- `linkValidation`: リンクチェック設定
- `contentValidation`: コンテンツ検証ルール
- `notifications`: 通知設定

## 📊 統合品質チェック

すべてのドキュメント管理ツールを一度に実行:

```bash
# 包括的品質チェック
npm run docs:quality
```

このコマンドは以下を実行します:
1. ドキュメント検証
2. リンクチェック
3. 結果の統合レポート生成

## 🚀 CI/CD 統合

### 事前コミットフック
```bash
# Git フックとして設定
npm run setup:hooks
```

### GitHub Actions での使用例
```yaml
- name: ドキュメント品質チェック
  run: |
    npm run docs:validate:full
    npm run docs:check-links
```

## 📈 レポートとログ

### 生成されるファイル
- `reports/`: 検証レポートとリンクチェック結果
- `notifications/`: 更新通知ログ
- `tools/file-hashes.json`: ファイル変更追跡データ
- `tools/link-history.json`: リンクチェック履歴
- `tools/doc-dependencies.json`: ドキュメント依存関係

### レポート形式
- **JSON**: 機械可読形式（API 統合用）
- **HTML**: 人間が読みやすい形式
- **TXT**: コンソール出力形式

## 🔍 トラブルシューティング

### よくある問題

**1. 外部リンクチェックが遅い**
```bash
# 内部リンクのみをチェック
npm run docs:check-links:internal
```

**2. 検証エラーが多すぎる**
```bash
# 高速検証で主要問題のみをチェック
npm run docs:validate:quick
```

**3. 監視が CPU を多く使用する**
```bash
# 監視間隔を長くする
node tools/doc-update-notifier.js --interval=300000  # 5分間隔
```

### デバッグ

環境変数を使用したデバッグ:
```bash
# 詳細ログを有効化
DEBUG=docs:* npm run docs:validate

# Webhook URL の設定
DOC_WEBHOOK_URL=https://hooks.slack.com/... npm run docs:watch
```

## 📚 関連ドキュメント

- [開発者ガイド](../docs/developer-guides/README.md)
- [API リファレンス](../docs/api-reference/README.md)
- [コントリビューション ガイド](../docs/developer-guides/contribution-guide.md)

## 🆘 サポート

問題が発生した場合:
1. このドキュメントの[トラブルシューティング](#-トラブルシューティング)セクションを確認
2. 詳細ログを有効化して問題を分析
3. Issue を作成して具体的なエラーメッセージを報告

---

**注意**: これらのツールは開発環境でのみ使用してください。本番環境では実行しないでください。