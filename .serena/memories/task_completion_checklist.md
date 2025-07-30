# タスク完了時のチェックリスト

## 必須実行項目

### 1. テスト実行
```bash
# 全テストスイート実行（必須）
npm run test:all

# 個別テスト確認
npm test                    # Jestテスト
npm run test:e2e            # E2Eテスト
npm run test:performance    # パフォーマンステスト
```

### 2. 設定検証
```bash
# 設定ファイル整合性チェック
npm run validate:config

# 国際化設定チェック（i18n関連変更時）
npm run i18n:validate
```

### 3. ビルド検証
```bash
# 本番ビルド実行
npm run build

# バンドルサイズチェック
npm run size-check

# プレビュー確認
npm run preview
```

### 4. 品質チェック（推奨）
```bash
# Lighthouseスコア確認
npm run lighthouse

# パフォーマンス最適化
npm run optimize
```

## コード品質確認

### 1. ES6構文・規約準拠
- [x] ES6 modules (import/export)
- [x] 適切な命名規則 (camelCase, PascalCase)
- [x] JSDocコメント
- [x] エラーハンドリング

### 2. アーキテクチャ準拠
- [x] コンポーネント責任分離
- [x] 依存注入パターン
- [x] ConfigurationManager使用
- [x] 非同期処理（async/await）

### 3. パフォーマンス
- [x] メモリ使用量最適化
- [x] オブジェクトプール活用
- [x] イベントリスナークリーンアップ

## デプロイ前確認

### 1. ブラウザ互換性
- [x] Chrome, Firefox, Safari, Edge確認
- [x] モバイル端末動作確認

### 2. アクセシビリティ
- [x] キーボードナビゲーション
- [x] スクリーンリーダー対応
- [x] カラーコントラスト確認

### 3. 多言語対応（該当時）
- [x] 翻訳ファイル更新
- [x] 言語切り替え動作確認