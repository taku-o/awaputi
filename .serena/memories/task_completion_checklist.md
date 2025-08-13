# タスク完了時チェックリスト

## コード実装完了後の必須確認事項

### 1. コード品質チェック
```bash
# ファイルサイズ確認（2,500語制限）
npm run filesize:check
# または特定ディレクトリ
node tools/file-size-monitor.js src/実装したディレクトリ
```

### 2. テスト実行
```bash
# 関連するユニットテストを実行
npm run test:unit

# 統合テストも実行（必要に応じて）
npm run test:integration

# E2Eテストが必要な場合
npm run test:e2e
```

### 3. ビルド確認
```bash
# ビルドが通ることを確認
npm run build:dev

# 本番ビルドも確認（重要な変更の場合）
npm run build
```

### 4. ドキュメント更新
- 実装内容に応じて関連ドキュメントを更新
- 新機能の場合は`docs/`にドキュメント追加
- APIの変更がある場合は`npm run docs:generate`

### 5. 設定検証
```bash
# 設定ファイルの整合性確認
npm run validate:config
```

### 6. ブラウザ互換性
```bash
# ブラウザ互換性の確認（新機能追加時）
npm run check:browser-compatibility
```

### 7. i18n確認（UI変更時）
```bash
# 翻訳ファイルの検証
npm run i18n:validate

# 新しいUIテキストを追加した場合は全言語に追加
```

### 8. コミット前の最終確認
- [ ] コードにコメント（日本語）を適切に追加
- [ ] 不要なconsole.logやデバッグコードを削除
- [ ] エラーハンドリングが適切に実装されている
- [ ] 命名規則に従っている（PascalCase、camelCase等）
- [ ] インポート文に.js拡張子が付いている

### 9. Git操作
```bash
# 変更内容の確認
git status
git diff

# ステージング
git add .

# コミット（意味のあるメッセージで）
git commit -m "feat: 機能の説明" # または fix:, refactor: など
```

## 重要な注意事項

### 現在利用不可のコマンド
- `npm run lint` - Lintツール未設定
- コードフォーマッター未設定

### 手動確認事項
- コードスタイルの一貫性（インデント、セミコロン等）
- 日本語コメントの適切性
- ファイルサイズ制限（2,500語）の遵守

### 推奨事項
- 大きな変更の場合は`npm run test:all`で全テスト実行
- パフォーマンスに影響する変更は`npm run test:performance`
- アクセシビリティに関わる変更は手動で動作確認