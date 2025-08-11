# Design Document

## Overview

npm run buildを実行するたびに翻訳ファイルが変更される問題を解決するため、i18n:setupスクリプトから動的タイムスタンプ（optimizedAt）の更新処理を削除する。この変更により、ビルドプロセスがidempotent（冪等）になり、不要なファイル変更を防ぐ。

調査結果：
- optimizedAtフィールドは翻訳ファイル内にのみ存在し、実際のコードでは使用されていない
- TranslationLoaderは language、version、completeness のみを使用
- 35個の翻訳ファイル（5言語 × 7カテゴリ）が毎回更新される
- 最適化情報が必要な場合は、静的な設定やデプロイメントレポートで管理可能

## Architecture

### Current Architecture
```
npm run build
├── prebuild
│   ├── validate:config
│   └── i18n:setup (問題の原因)
│       └── optimizeTranslationFiles()
│           └── optimizedAt: new Date().toISOString() ← 毎回更新
└── vite build
```

### Target Architecture
```
npm run build
├── prebuild
│   ├── validate:config
│   └── i18n:setup (修正後)
│       └── optimizeTranslationFiles()
│           └── optimizedAtを更新しない（idempotent）
└── vite build
```

## Components and Interfaces

### 1. i18n-deployment-setup.js の修正

**現在の処理:**
```javascript
const optimized = {
  ...parsed,
  meta: {
    ...parsed.meta,
    optimizedAt: new Date().toISOString(), // ← 削除対象
    version: parsed.meta?.version || '1.0.0',
    size: Buffer.byteLength(content, 'utf8')
  }
};
```

**修正後の処理:**
```javascript
const optimized = {
  ...parsed,
  meta: {
    ...parsed.meta,
    // optimizedAtフィールドを削除
    version: parsed.meta?.version || '1.0.0',
    size: Buffer.byteLength(content, 'utf8')
  }
};
```

### 2. 翻訳ファイルの構造変更

**現在の構造:**
```json
{
  "meta": {
    "language": "ja",
    "region": "JP", 
    "version": "1.0.0",
    "lastUpdated": "2025-01-28T00:00:00Z",
    "completeness": 100,
    "quality": 95,
    "optimizedAt": "2025-08-11T16:59:56.525Z", // ← 削除対象
    "size": 1482
  },
  "translations": { ... }
}
```

**修正後の構造:**
```json
{
  "meta": {
    "language": "ja",
    "region": "JP",
    "version": "1.0.0", 
    "lastUpdated": "2025-01-28T00:00:00Z", // 静的な値
    "completeness": 100,
    "quality": 95,
    "size": 1482 // ファイルサイズは計算して更新
  },
  "translations": { ... }
}
```

### 3. 最適化情報の代替管理方法

**デプロイメントレポートでの管理:**
```javascript
// reports/i18n-deployment-report.json
{
  "timestamp": "2025-08-11T16:59:56.525Z", // ここで最適化時刻を記録
  "optimization": {
    "translationFiles": {
      "processed": 35,
      "optimizedAt": "2025-08-11T16:59:56.525Z"
    }
  }
}
```

**設定ファイルでの静的管理:**
```javascript
// src/config/I18nOptimizationConfig.js
export const I18N_OPTIMIZATION_INFO = {
  lastOptimization: "2025-01-28T00:00:00Z", // 手動更新
  version: "1.0.0",
  supportedLanguages: ["ja", "en", "zh-CN", "zh-TW", "ko"]
};
```

## Data Models

### TranslationFileMetadata
```typescript
interface TranslationFileMetadata {
  language: string;        // 必須: 言語コード
  region?: string;         // オプション: 地域コード
  version: string;         // 必須: バージョン情報
  lastUpdated: string;     // 必須: 静的な最終更新日時
  completeness: number;    // 必須: 翻訳完成度 (0-100)
  quality: number;         // 必須: 翻訳品質スコア (0-100)
  size: number;           // 必須: ファイルサイズ（バイト）
  // optimizedAt: 削除
}
```

### DeploymentReport
```typescript
interface I18nDeploymentReport {
  timestamp: string;
  optimization: {
    translationFiles: {
      processed: number;
      optimizedAt: string;  // 動的タイムスタンプはここで管理
    };
  };
}
```

## Error Handling

### 1. ファイル読み書きエラー
- 翻訳ファイルの読み込み失敗時は警告ログを出力して続行
- JSONパースエラー時は該当ファイルをスキップ
- ファイル書き込み失敗時はプロセスを停止

### 2. メタデータ検証エラー
- 必須フィールド不足時は警告を出力
- 不正な値の場合はデフォルト値で補完
- 言語コード不一致時は警告を出力して続行

### 3. 後方互換性の確保
- 既存のoptimizedAtフィールドが存在する場合は削除
- TranslationLoaderは引き続き正常動作
- 既存のテストケースは影響を受けない

## Testing Strategy

### 1. Unit Tests
- `optimizeTranslationFiles()` 関数のidempotency テスト
- メタデータ構造の検証テスト
- ファイル読み書き処理のテスト

### 2. Integration Tests  
- i18n:setup スクリプト全体の動作テスト
- TranslationLoader との互換性テスト
- ビルドプロセス全体のテスト

### 3. E2E Tests
- npm run build の複数回実行テスト
- git status での変更検出テスト
- 翻訳機能の正常動作確認テスト

### 4. Performance Tests
- ビルド時間への影響測定
- 翻訳ファイル読み込み性能テスト
- メモリ使用量の測定

### 5. Regression Tests
- 既存のi18n機能の動作確認
- 翻訳品質チェック機能の動作確認
- デプロイメントプロセスの動作確認