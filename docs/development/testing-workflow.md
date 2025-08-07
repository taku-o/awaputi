# テスト統合開発ワークフロー

## 概要

Issue #106のテスト修復完了後の安定化されたテスト環境を活用した開発ワークフローガイドです。テスト成功率95%以上を維持しながら効率的な開発を行うための手順を示します。

## 開発フロー統合

### 1. 新機能開発時のテストワークフロー

#### **Step 1: 開発開始前の準備**
```bash
# 現在のテスト状況確認
npm test -- --testPathPattern="GameEngine|SyncManager|ScreenshotCapture" --verbose

# 95%以上の成功率を確認
echo "✅ High-stability tests: Expected 100% success rate"
```

#### **Step 2: Test-Driven Development (TDD)**
```bash
# 1. テスト作成（Red）
npm test -- --testPathPattern="新機能テスト" --watchAll

# 2. 最小実装（Green）  
npm test -- --testPathPattern="新機能テスト"

# 3. リファクタリング（Refactor）
npm test -- --testPathPattern="関連テスト"
```

#### **Step 3: 統合テスト確認**
```bash
# 影響範囲のテスト実行
npm test -- --testPathPattern="影響するコンポーネント"

# 高安定性テストの回帰チェック
npm test -- --testPathPattern="GameEngine.test.js" --verbose
```

### 2. バグ修正時のワークフロー

#### **Step 1: 問題の再現と特定**
```bash
# 失敗テストの特定
npm test -- --testPathPattern="問題のあるテスト" --verbose

# ログ分析
npm test 2>&1 | grep -A 5 -B 5 "FAIL"
```

#### **Step 2: 修正の実装**
```bash
# テスト駆動での修正
# 1. 失敗条件の明確化
# 2. 最小修正の実装  
# 3. テスト成功の確認
```

#### **Step 3: 回帰テスト**
```bash
# 関連テスト実行
npm test -- --testPathPattern="修正に関連するテスト"

# 全体影響確認
npm test -- --testPathPattern="高安定性テスト"
```

### 3. リファクタリング時のワークフロー

#### **Step 1: 事前安全確認**
```bash
# ベースライン成功率確認
npm test 2>&1 | tail -5

# 重要テストの事前実行
npm test -- --testPathPattern="GameEngine|SyncManager" --verbose
```

#### **Step 2: 段階的リファクタリング**
```bash
# 小さな単位でのリファクタリング実行
# 各段階でのテスト確認
npm test -- --testPathPattern="リファクタリング対象"

# API変更時の影響確認
grep -r "変更したAPI" tests/
```

#### **Step 3: 包括的検証**
```bash
# 全テスト実行
npm test

# 成功率確認（95%以上維持）
npm test 2>&1 | grep -E "(passed|failed|total)"
```

## CI/CD統合ワークフロー

### プルリクエスト作成時

#### **自動実行チェック**
1. **ファイルサイズ監視**（2,500語制限）
2. **テスト成功率監視**（95%閾値）
3. **高安定性テスト実行**（100%期待値）
4. **設定整合性チェック**（ゲームバランス等）

#### **GitHub Actions自動実行項目**
```yaml
# .github/workflows/pr-validation.yml で自動実行
- Basic Validation
- Test Success Rate Monitoring  
- Configuration Check
- File Size Monitoring
```

#### **品質ゲート**
- [ ] テスト成功率 ≥ 95%
- [ ] 高安定性テスト = 100%
- [ ] ファイルサイズ制限遵守
- [ ] 設定整合性確認

### マージ後の継続監視

#### **自動監視項目**
- 夜間テスト実行結果
- 成功率トレンド分析
- 新規失敗パターン検出
- パフォーマンス劣化監視

## 開発ツールの活用

### 1. VSCode統合

#### **推奨拡張機能**
```json
{
  "recommendations": [
    "ms-vscode.vscode-jest",
    "bradlc.vscode-tailwindcss", 
    "esbenp.prettier-vscode"
  ]
}
```

#### **設定ファイル (.vscode/settings.json)**
```json
{
  "jest.autoRun": {
    "watch": true,
    "onStartup": ["all-tests"]
  },
  "jest.showCoverageOnLoad": true,
  "jest.testExplorer": {
    "showInlineError": true
  }
}
```

### 2. npm scriptsの活用

#### **効率化スクリプト**
```json
{
  "scripts": {
    "test:quick": "jest --testPathPattern='GameEngine|SyncManager|ScreenshotCapture' --verbose",
    "test:stability": "jest --testPathPattern='高安定性テスト' --watchAll",
    "test:coverage": "jest --coverage --coverageDirectory=coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

### 3. 自動化ツール

#### **pre-commit hooks**
```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 高安定性テスト実行
npm run test:quick

# ファイルサイズチェック  
node tools/file-size-monitor.js .
```

## デバッグとトラブルシューティング

### 1. テスト失敗時の対応手順

#### **Step 1: 失敗分析**
```bash
# 詳細ログ出力
npm test -- --testPathPattern="失敗テスト" --verbose

# エラーパターン分類
# - モジュールパス問題
# - API不整合問題  
# - タイムアウト問題
# - 環境問題
```

#### **Step 2: 原因特定**
```bash
# 関連ファイル確認
find src -name "*関連ファイル*" -type f

# インポートパス検証
grep -r "import.*問題のモジュール" src/ tests/

# API存在確認  
grep -r "問題のメソッド" src/
```

#### **Step 3: 修正実装**
- [Test Repair Guide](./test-repair-guide.md) の対応パターン参照
- 段階的修正と検証
- 影響範囲の最小化

### 2. パフォーマンス問題の対応

#### **測定と分析**
```bash
# テスト実行時間測定
time npm test

# メモリ使用量監視
node --inspect node_modules/.bin/jest

# ボトルネック特定
npm test -- --detectSlowTests
```

#### **最適化手法**
- テスト分割と並列実行
- モック活用による依存関係削減
- 不要な待機時間削除
- CI環境最適化

## 品質保証ベストプラクティス

### 1. テスト作成ガイドライン

#### **命名規則**
```javascript
// Good: 具体的で明確な説明
test('GameEngine should maintain 60 FPS under normal load', () => {

// Bad: 抽象的で不明確
test('performance test', () => {
```

#### **構造化**
```javascript
describe('ComponentName', () => {
  describe('initialization', () => {
    test('should initialize with default values', () => {
    });
  });
  
  describe('user interactions', () => {
    test('should handle click events correctly', () => {
    });
  });
});
```

### 2. モック戦略

#### **レベル別モック**
```javascript
// Level 1: Unit Test - 細かいモック
jest.mock('./dependency', () => ({
  method: jest.fn(() => 'mocked result')
}));

// Level 2: Integration Test - 部分モック  
jest.mock('./externalService');

// Level 3: E2E Test - 最小モック
// 実際のサービス使用
```

### 3. 継続的品質改善

#### **定期レビュー項目**
- [ ] テスト成功率トレンド分析
- [ ] テストカバレッジ推移確認
- [ ] 実行時間パフォーマンス評価
- [ ] 新規失敗パターン特定と対策

#### **改善アクション**
- 低カバレッジエリアの特定とテスト追加
- 不安定テストの修正または削除  
- テスト実行環境の最適化
- 開発者フィードバックの収集と反映

## 緊急時対応手順

### 1. CI/CD障害時

#### **即座対応**
```bash
# ローカルでの緊急検証
npm test -- --testPathPattern="最重要テスト"

# 問題の分離
npm test -- --testPathPattern="問題のないテスト"

# 一時的回避策実装
# （例：問題テストの一時スキップ）
```

#### **根本解決**
- 問題の根本原因分析
- 修正とテスト
- CI/CD環境での検証
- 再発防止策実装

### 2. テスト成功率急落時

#### **トリアージ**
1. **重要度分析**: GameEngine、SyncManager等の重要システム優先
2. **影響範囲特定**: 失敗テストの関連性分析
3. **緊急度評価**: ビルド阻害度とユーザー影響評価

#### **復旧手順**
1. **回帰点特定**: git bisectによる問題コミット特定
2. **最小修正**: 成功率回復のための最小限修正
3. **段階的復旧**: 個別テスト修正と検証
4. **全体検証**: 95%成功率回復確認

## 関連リソース

- [Test Repair Guide](./test-repair-guide.md)
- [Regression Prevention Guide](./regression-prevention.md)  
- [Issue #106 Specification](.kiro/specs/test-suite-repair-issue-106/)
- [GitHub Actions Workflows](../../.github/workflows/)

## 更新履歴

- 2025-01-08: Issue #106完了に伴う初回作成
- テスト修復プロジェクトで得た知見を統合したワークフローガイド