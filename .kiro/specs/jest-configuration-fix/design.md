# Design Document

## Overview

Jest設定エラー「jest is not defined」を解決するための設計です。ES Modules環境でJestを使用する際の互換性問題を修正し、テストセットアップファイルでJest関数が正常に利用できるようにします。

## Architecture

### 問題の根本原因

1. **ES Modules + Jest互換性問題**: `"type": "module"`設定とJestの`setupFilesAfterEnv`の組み合わせで、Jestグローバルオブジェクトが利用できない
2. **jest-canvas-mock依存関係**: 現在のセットアップでは`jest-canvas-mock`パッケージを使わずに手動でCanvasをモックしているが、Jest関数が未定義
3. **NODE_OPTIONS設定**: `--experimental-vm-modules`フラグ使用時のJest初期化タイミング問題

### 解決アプローチ

1. **Jest設定の最適化**: ES Modules環境に最適化されたJest設定
2. **セットアップファイルの修正**: Jest関数の適切な利用方法
3. **依存関係の整理**: jest-canvas-mockの適切な活用または代替手法

## Components and Interfaces

### 1. Jest Configuration (jest.config.js)

```javascript
export default {
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  transform: {},
  // その他の設定...
}
```

### 2. Test Setup File (tests/setup.js)

**Option A: jest-canvas-mockを使用**
```javascript
import 'jest-canvas-mock';
// その他のセットアップ
```

**Option B: 手動モック（Jest関数の適切な利用）**
```javascript
// Jest関数は自動的に利用可能（グローバル環境）
// ただし、ES Modules環境では明示的な設定が必要
```

### 3. Package.json Scripts

```json
{
  "scripts": {
    "test": "NODE_OPTIONS='--experimental-vm-modules --no-warnings' jest"
  }
}
```

## Data Models

### Jest Configuration Schema

```javascript
{
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  transform: {},
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],
  moduleNameMapper: {'^@/(.*)$': '<rootDir>/src/$1'},
  // 既存の設定を維持
}
```

### Setup File Structure

```javascript
// Global mocks and utilities
// Canvas API mocking
// Performance API mocking
// LocalStorage mocking
// Helper functions
```

## Error Handling

### 1. Jest初期化エラー

- **検出**: Jest起動時の"jest is not defined"エラー
- **対応**: 適切なES Modules設定とセットアップファイルの修正
- **フォールバック**: jest-canvas-mockパッケージの利用

### 2. ES Modules互換性エラー

- **検出**: モジュールインポート/エクスポートエラー
- **対応**: `extensionsToTreatAsEsm`設定の追加
- **フォールバック**: CommonJS形式への一時的な変更

### 3. Canvas Mock エラー

- **検出**: Canvas関連テストの失敗
- **対応**: 適切なCanvas APIモックの実装
- **フォールバック**: jest-canvas-mockライブラリの使用

## Testing Strategy

### 1. Unit Tests

- Jest設定の各オプションが正常に動作することを確認
- セットアップファイルの各モックが適切に初期化されることを確認

### 2. Integration Tests

- 既存のテストスイートが全て正常に実行されることを確認
- CI/CD環境での実行確認

### 3. Regression Tests

- 修正後に新たな設定エラーが発生しないことを確認
- パフォーマンスの劣化がないことを確認

## Implementation Options

### Option 1: jest-canvas-mock利用

**メリット:**
- 既存のパッケージを活用
- 設定が簡単
- メンテナンスが楽

**デメリット:**
- 外部依存関係
- ES Modules互換性の確認が必要

### Option 2: 手動モック改善

**メリット:**
- 外部依存なし
- カスタマイズ可能
- ES Modules完全対応

**デメリット:**
- 実装・メンテナンスコスト
- Canvas API変更への対応

### Option 3: ハイブリッドアプローチ

**メリット:**
- 柔軟性
- 段階的移行可能

**デメリット:**
- 複雑性の増加

## Recommended Solution

**Option 1 (jest-canvas-mock利用)** を推奨します。

理由:
1. 既存のパッケージが利用可能
2. ES Modules対応済み
3. 設定が簡潔
4. コミュニティサポート

実装手順:
1. Jest設定にES Modules対応設定を追加
2. セットアップファイルでjest-canvas-mockをインポート
3. 手動モック部分を削除・整理
4. テスト実行確認