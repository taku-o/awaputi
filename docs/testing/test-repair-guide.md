# テスト修復ガイド - Phase G後の保守手順

## 概要

このガイドは、Phase Gファイル分割プロジェクト後のテスト修復で学んだ知見をまとめ、将来的な大規模リファクタリング時のテスト保守を効率化するためのリファレンスです。

## 共通テスト失敗パターンと解決策

### 1. モジュールパス不整合問題

#### **問題の症状**
```
Cannot find module '../../../src/scenes/HelpScene.js' from 'tests/accessibility/help-system-accessibility.test.js'
```

#### **原因分析**
- Phase Gファイル分割でディレクトリ構造変更
- 相対パスの深さが変更された
- インポート文の自動更新漏れ

#### **解決手順**
1. **実際のファイル位置確認**
   ```bash
   find src -name "HelpScene.js" -type f
   ```

2. **相対パス計算**
   ```bash
   # テストファイルから対象ファイルまでの正しいパス
   # tests/accessibility/ → src/scenes/
   # = ../../src/scenes/
   ```

3. **インポート文修正**
   ```javascript
   // 修正前
   import { HelpScene } from '../../../src/scenes/HelpScene.js';
   
   // 修正後
   import { HelpScene } from '../../src/scenes/HelpScene.js';
   ```

#### **予防策**
- ファイル分割時のインポートパス一括更新スクリプト作成
- IDE拡張機能によるパス自動補完活用
- CI/CDでのパス検証チェック追加

### 2. API Method一貫性問題

#### **問題の症状**
```javascript
TypeError: enhancedParticleManager.enableBatchRendering is not a function
```

#### **原因分析**
- テストが期待するメソッドが実装クラスに存在しない
- リファクタリング時のAPI変更がテストに反映されていない
- メソッド名の変更や削除

#### **解決手順**
1. **実装クラスの確認**
   ```bash
   grep -r "enableBatchRendering" src/
   ```

2. **メソッド実装**
   ```javascript
   // EnhancedParticleManager.js に追加
   enableBatchRendering() {
       this.batchRenderingEnabled = true;
       console.log('[EnhancedParticleManager] Batch rendering enabled');
   }
   ```

3. **テスト期待値の更新**
   ```javascript
   // 実装が正しい場合はテストを修正
   expect(particleManager.isBatchRenderingEnabled()).toBe(true);
   ```

#### **予防策**
- API変更時のテスト同期チェックリスト作成
- インターフェース定義の明文化
- 自動API整合性検証ツール導入

### 3. Jest環境安定性問題

#### **問題の症状**
```
You are trying to import a file after the Jest environment has been torn down
```

#### **原因分析**
- ES Modules + Jest環境での初期化/クリーンアップ順序問題
- 非同期操作の不完全な待機
- モジュール読み込みタイミング競合

#### **解決手順**
1. **環境マネージャー導入**
   ```javascript
   // tests/utils/EnvironmentManager.js
   export class EnvironmentManager {
       static setupTestEnvironment() {
           // 適切な初期化処理
       }
       
       static cleanupTestEnvironment() {
           // リソース解放処理
       }
   }
   ```

2. **テスト分離改善**
   ```javascript
   beforeEach(() => {
       EnvironmentManager.setupTestEnvironment();
   });
   
   afterEach(() => {
       EnvironmentManager.cleanupTestEnvironment();
   });
   ```

3. **非同期処理の適切な待機**
   ```javascript
   // 修正前
   await new Promise(resolve => setTimeout(resolve, 100));
   
   // 修正後  
   await new Promise(resolve => setTimeout(resolve, 50));
   ```

#### **予防策**
- 環境初期化/クリーンアップの標準化
- 非同期処理の適切なタイムアウト設定
- テスト実行分離の徹底

### 4. タイムアウト問題

#### **問題の症状**
```
Exceeded timeout of 10000 ms for a test
```

#### **原因分析**
- CI環境とローカル環境の性能差
- 過度に長い待機時間設定
- 無限ループや処理停止

#### **解決手順**
1. **タイムアウト値の調整**
   ```javascript
   // CI環境対応の現実的な値に調整
   test('テスト名', async () => {
       // 処理時間短縮
       await new Promise(resolve => setTimeout(resolve, 5));
   });
   ```

2. **処理効率の改善**
   ```javascript
   // バッチサイズ削減で処理時間短縮
   optimizer.config.batchSize = Math.max(10, Math.floor(originalBatchSize * 0.8));
   ```

3. **環境別設定**
   ```javascript
   const isCI = process.env.CI === 'true';
   const timeout = isCI ? 30000 : 10000;
   ```

#### **予防策**
- CI/ローカル環境別タイムアウト設定
- パフォーマンステストの現実的な閾値設定
- 処理時間計測による最適値決定

## 修復作業ワークフロー

### Phase 1: 問題の特定と分類
1. **テスト実行とエラー収集**
   ```bash
   npm test 2>&1 | tee test-results.log
   ```

2. **失敗パターンの分類**
   - モジュールパス問題
   - API不整合問題
   - 環境・タイムアウト問題
   - 依存関係問題

3. **影響範囲の評価**
   - 失敗テスト数の把握
   - 重要度別優先順位決定

### Phase 2: 高優先度問題の修正
1. **クリティカルパス修正**
   - ビルド阻害要因の解決
   - 基盤システム（GameEngine等）の安定化

2. **API整合性復旧**
   - 不足メソッドの実装
   - インターフェース同期

### Phase 3: 個別テストファイル修正
1. **ファイル別修正作業**
   - パス修正
   - モック設定調整
   - タイムアウト値調整

2. **検証と品質確認**
   - 個別テスト実行
   - 成功率測定

### Phase 4: 統合検証と回帰防止
1. **全体テスト実行**
   - 成功率目標達成確認
   - 安定性検証

2. **CI/CD統合**
   - 自動監視設定
   - レポート生成システム

## ツールと自動化

### 1. パス修正支援ツール
```bash
# インポートパス一括置換スクリプト
./tools/fix-import-paths.sh src/ tests/
```

### 2. API整合性チェック
```bash
# APIメソッド存在確認
./tools/api-consistency-checker.js
```

### 3. テスト成功率監視
```bash
# 継続監視スクリプト
./tools/test-success-monitor.js --threshold=95
```

## 品質保証チェックリスト

### 修復前チェック
- [ ] 失敗テストの完全なログ収集
- [ ] 問題パターンの分類と優先順位決定
- [ ] 影響範囲の評価完了
- [ ] バックアップ・復旧計画準備

### 修復中チェック  
- [ ] 個別修正の段階的実行
- [ ] 各修正後の動作確認
- [ ] 副作用・回帰問題の監視
- [ ] 進捗状況の文書化

### 修復後チェック
- [ ] 95%以上の成功率達成
- [ ] CI/CD環境での安定性確認
- [ ] 回帰防止措置の実装
- [ ] ドキュメント・知識共有完了

## トラブルシューティング

### よくある問題と解決策

#### Q1: jest.mockが動作しない
```javascript
// ES Modules環境での正しいモック
jest.doMock('../../src/analytics/ChartRenderer.js', () => ({
    ChartRenderer: jest.fn(() => mockChartRenderer)
}));
```

#### Q2: CI環境でのみ失敗するテスト
```javascript
// 環境対応のタイムアウト調整
const testTimeout = process.env.CI ? 15000 : 5000;
test('テスト', async () => {
    // 処理
}, testTimeout);
```

#### Q3: メモリリークによる失敗
```javascript
afterEach(() => {
    // 適切なリソース解放
    jest.clearAllMocks();
    // カスタムクリーンアップ
});
```

## 参考資料

- [Jest Configuration Guide](https://jestjs.io/docs/configuration)
- [ES Modules in Jest](https://jestjs.io/docs/ecmascript-modules)
- [Issue #106 Specification](.kiro/specs/test-suite-repair-issue-106/)
- [Regression Prevention Guide](./regression-prevention.md)

## 更新履歴

- 2025-01-08: Phase G後テスト修復経験に基づく初回作成
- Issue #106対応完了時点での知見集約版