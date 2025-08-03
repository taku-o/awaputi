# タスク完了時のチェックリスト

## コード変更後の必須確認事項

### 1. テスト実行
```bash
# ユニットテストを実行して既存機能が壊れていないか確認
npm test

# 変更したファイルに関連するテストを実行
npm test -- [テストファイル名]

# 統合テストも必要に応じて実行
npm run test:integration
```

### 2. ファイルサイズチェック
```bash
# MCPツール互換性のため、ファイルサイズをチェック
npm run filesize:check

# 2,500語を超えるファイルがある場合は分割を検討
```

### 3. 設定検証
```bash
# 設定ファイルの整合性を確認
npm run validate:config
```

### 4. リンター実行（現在は未設定だが推奨）
```bash
# ESLint等が設定されている場合
# npm run lint
```

### 5. ビルド確認
```bash
# ビルドが正常に完了するか確認
npm run build

# ビルドエラーがある場合は修正
```

### 6. ローカル動作確認
```bash
# 開発サーバーを起動
python -m http.server 8000

# ブラウザで動作確認
# http://localhost:8000
```

### 7. Git コミット前の確認
```bash
# 変更内容を確認
git status
git diff

# 不要なファイルが含まれていないか確認
# console.logなどのデバッグコードが残っていないか確認
```

### 8. コミットメッセージの規約
```
# 形式: <type>: <description>

feat: 新機能追加
fix: バグ修正
refactor: リファクタリング
docs: ドキュメント更新
test: テスト追加・修正
style: コードスタイルの変更
perf: パフォーマンス改善
chore: その他の変更

# 例:
git commit -m "feat: Add new bubble type for special events"
git commit -m "fix: Resolve memory leak in ParticleManager"
```

### 9. プロジェクト固有の確認事項

#### MCPツール互換性
- ファイルサイズが2,500語以下であることを確認
- 大きなファイルはMain Controller Patternで分割

#### 多言語対応
- 新しいUIテキストは LocalizationManager を使用
- 翻訳キーを適切に追加

#### アクセシビリティ
- WCAG 2.1 AA準拠を維持
- ARIAラベル、キーボードナビゲーション対応

#### パフォーマンス
- 60FPS維持を目指す
- メモリリークがないか確認

### 10. ドキュメント更新
```bash
# APIドキュメントを更新（必要に応じて）
npm run docs:generate

# プロジェクトドキュメントの更新
# - CLAUDE.md の更新（必要に応じて）
# - 関連するIssueのドキュメント更新
```

### 推奨される追加確認
- コードレビューのためのPR作成
- 関連するIssueへのコメント追加
- チームメンバーへの共有（必要に応じて）