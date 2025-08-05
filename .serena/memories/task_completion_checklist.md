# タスク完了時の実行チェックリスト

## 基本チェックリスト（すべてのタスクで実行）

### 1. ファイルサイズ制限チェック（必須）
```bash
# MCPトークン制限対応（2,500語以下）
npm run filesize:check
# または
node tools/file-size-monitor.js src

# 問題があれば Main Controller Pattern で分割
```

### 2. テスト実行（必須）
```bash
# 基本テスト実行
npm run test:unit              # 単体テスト
npm run test:integration       # 統合テスト

# 該当する場合は追加テスト
npm run test:performance       # パフォーマンス関連の変更時
npm run test:e2e              # UI/UX変更時
npm run test:quality          # 品質関連の変更時
```

### 3. 設定検証（設定変更時）
```bash
npm run validate:config        # 設定ファイル変更時
npm run validate:i18n-requirements  # 多言語関連変更時
```

## 変更内容別チェックリスト

### コア機能変更時
```bash
# 1. 単体テスト
npm run test:unit

# 2. 統合テスト（必須）
npm run test:integration

# 3. パフォーマンステスト
npm run test:performance

# 4. 設定検証
npm run validate:config
```

### UI/UX変更時
```bash
# 1. 基本テスト
npm run test:unit

# 2. E2Eテスト（必須）
npm run test:e2e

# 3. アクセシビリティテスト
npm run test:quality

# 4. i18n対応確認
npm run test:i18n-usability
```

### 多言語対応変更時
```bash
# 1. i18n検証（必須）
npm run validate:i18n-requirements
npm run i18n:validate

# 2. 翻訳品質テスト
npm run test:translation-quality
npm run test:i18n-usability

# 3. i18nパフォーマンステスト
npm run test:i18n-performance

# 4. 品質レポート生成
npm run i18n:quality-report
```

### パフォーマンス最適化時
```bash
# 1. パフォーマンステスト（必須）
npm run test:performance
npm run test:performance:verbose

# 2. バンドルサイズチェック
npm run size-check

# 3. ビルドテスト
npm run build
npm run build:analyze

# 4. Lighthouse分析
npm run lighthouse
```

### アクセシビリティ変更時
```bash
# 1. 品質テスト（必須）
npm run test:quality

# 2. アクセシビリティ特化テスト
# WCAG 2.1 AA準拠確認（手動）
# キーボードナビゲーション確認
# スクリーンリーダー確認

# 3. E2Eテスト
npm run test:e2e
```

### デバッグツール変更時
```bash
# 1. デバッグツール単体テスト
npm run test:unit -- tests/debug/

# 2. 統合テスト
npm run test:integration

# 3. 開発環境での動作確認
http://localhost:8000?debug=true
```

## ドキュメント更新（該当時）

### API変更時
```bash
# 1. API文書生成
npm run docs:generate

# 2. 文書検証
npm run docs:validate

# 3. リンクチェック
npm run docs:check-links
```

### 大きな機能追加時
```bash
# 1. 開発ガイド更新確認
# docs/development-guide.md

# 2. アーキテクチャ文書更新
# docs/architecture.md

# 3. README更新（必要に応じて）
```

## 最終確認（本番デプロイ前）

### ビルド確認
```bash
# 1. クリーンビルド
npm run clean
npm run build

# 2. プレビュー確認
npm run preview
# http://localhost:4173 で動作確認

# 3. 全テスト実行
npm run test:all
```

### 品質確認
```bash
# 1. 全体品質チェック
npm run docs:quality

# 2. パフォーマンス最終確認
npm run lighthouse

# 3. i18n最終確認
npm run i18n:quality-report
```

## エラー対応ガイド

### テスト失敗時
1. **単体テスト失敗**: 該当コンポーネントの修正
2. **統合テスト失敗**: コンポーネント間の依存関係確認
3. **E2Eテスト失敗**: ブラウザでの手動確認後修正
4. **パフォーマンステスト失敗**: プロファイリング後最適化

### ファイルサイズ制限違反時
1. **Main Controller Pattern**で分割実装
2. 機能別コンポーネント分離
3. 公開API維持で後方互換性確保

### ビルド失敗時
1. 依存関係確認: `npm install`
2. TypeScript型エラー確認
3. モジュールインポートパス確認

## コミット前の最終チェック

```bash
# 1. ファイルサイズ
npm run filesize:check

# 2. 基本テスト
npm run test:unit

# 3. Git状態確認
git status
git diff

# 4. コミット
git add .
git commit -m "適切なコミットメッセージ"
```