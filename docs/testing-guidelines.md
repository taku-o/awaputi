# Testing Guidelines - BubblePop Game

## 概要

このドキュメントは、BubblePopゲームプロジェクトでのテスト作成・実行・保守に関するガイドラインです。包括的テストスイート修正プロジェクト（Issue #97）により確立された最新のベストプラクティスを反映しています。

## 🎯 テスト目標

- **成功率**: 95%以上のテスト成功率を維持
- **安定性**: 環境間での一貫した結果
- **保守性**: 理解しやすく修正しやすいテストコード
- **網羅性**: ユニット・統合・パフォーマンステストの適切な組み合わせ

## 🛠️ テスト環境

### Jest設定

#### ES Modules対応
```javascript
// jest.config.js
export default {
  testEnvironment: 'jsdom',
  transform: {},
  setupFilesAfterEnv: [
    '<rootDir>/tests/jest-globals.js',
    '<rootDir>/tests/setup.js'
  ]
};
```

#### Jest関数のインポート
```javascript
// 必須: 全テストファイルの先頭に追加
import { jest } from '@jest/globals';
```

### テスト分類

1. **ユニットテスト** (`tests/unit/`): 個別クラス・関数のテスト
2. **統合テスト** (`tests/integration/`): コンポーネント間の連携テスト  
3. **パフォーマンステスト** (`tests/performance/`): 性能・メモリ使用量テスト
4. **E2Eテスト** (`tests/e2e/`): ブラウザでの実際の操作テスト

## 📋 MockFactory使用ガイドライン

### 基本的な使用方法

```javascript
import { MockFactory } from '../mocks/MockFactory.js';

describe('MyComponent', () => {
    let mockCanvas, mockAudioManager, mockAnalyticsAPI;
    
    beforeEach(() => {
        // 標準化されたmock作成
        mockCanvas = MockFactory.createCanvasMock();
        mockAudioManager = MockFactory.createAudioManagerMock();
        mockAnalyticsAPI = MockFactory.createAnalyticsAPIMock();
    });
});
```

### 利用可能なMockFactory メソッド

- `MockFactory.createCanvasMock()` - HTML5 Canvas API
- `MockFactory.createAudioManagerMock()` - AudioManager（getStatus()含む）
- `MockFactory.createAnalyticsAPIMock()` - AnalyticsAPI（evaluateCondition()含む）
- `MockFactory.createPerformanceMock()` - パフォーマンス測定API
- `MockFactory.createLocalStorageMock()` - localStorage API
- `MockFactory.createDOMMock()` - DOM操作API

### MockFactory利点

- **一貫性**: 全テストで統一されたmock動作
- **完全性**: API仕様に完全準拠したmock
- **保守性**: 中央集約による簡単な修正・更新

## ⚡ パフォーマンステストガイドライン

### PerformanceTestUtils使用

```javascript
import { PerformanceTestUtils } from '../utils/PerformanceTestUtils.js';

describe('Performance Tests', () => {
    test('should maintain acceptable frame rate', async () => {
        const performanceConfig = PerformanceTestUtils.createPerformanceTestConfig();
        
        const testFunction = PerformanceTestUtils.createStablePerformanceTest(
            'Frame Rate Test',
            async (threshold, env, attempt) => {
                // テスト実装
                const fps = await measureFrameRate();
                expect(fps).toBeGreaterThanOrEqual(threshold.min);
            },
            { retries: performanceConfig.retries }
        );
        
        await testFunction();
    });
});
```

### 環境対応閾值

- **CI環境**: 緩い閾値（フレームレート25-45fps）
- **ローカル環境**: 中程度閾値（フレームレート35-60fps）
- **本番環境**: 厳しい閾値（フレームレート45-60fps）

### パフォーマンステストの種類

1. **フレームレート**: `PerformanceTestUtils.measureFrameRate()`
2. **レンダリング時間**: `PerformanceTestUtils.measureRenderTime()`
3. **メモリ使用量**: `PerformanceTestUtils.measureMemoryUsage()`

## 🔧 実装ベストプラクティス

### テストファイル構造

```javascript
/**
 * ComponentName Test Suite
 * Brief description of what is being tested
 */

import { jest } from '@jest/globals';
import { MockFactory } from '../mocks/MockFactory.js';
import { ComponentName } from '../../src/path/ComponentName.js';

describe('ComponentName', () => {
    let component;
    let mockDependencies;
    
    beforeEach(async () => {
        // Mock setup
        mockDependencies = {
            canvas: MockFactory.createCanvasMock(),
            audioManager: MockFactory.createAudioManagerMock()
        };
        
        // Component initialization
        component = new ComponentName(mockDependencies);
        
        // Clear all mocks
        jest.clearAllMocks();
    });
    
    afterEach(() => {
        // Cleanup if needed
        if (component && component.cleanup) {
            component.cleanup();
        }
    });
    
    describe('Constructor', () => {
        test('should initialize correctly', () => {
            expect(component).toBeDefined();
            expect(component.dependencies).toBe(mockDependencies);
        });
    });
    
    describe('Public Methods', () => {
        test('should handle method calls correctly', () => {
            // Test implementation
        });
    });
});
```

### 動的インポート使用

ES Modulesの依存関係問題を回避するため、動的インポートを使用：

```javascript
beforeEach(async () => {
    // 動的インポートでパス解決問題を回避
    const { ComponentName } = await import('../../src/path/ComponentName.js');
    component = new ComponentName(mockDependencies);
});
```

### Mock設定のベストプラクティス

```javascript
// ❌ 手動mock作成 - 避ける
const mockCanvas = {
    getContext: jest.fn(() => ({
        fillRect: jest.fn(),
        // 不完全なAPI...
    }))
};

// ✅ MockFactory使用 - 推奨
const mockCanvas = MockFactory.createCanvasMock();
```

## 🌐 クロス環境テスト

### 環境固有の考慮事項

#### CI環境
- より緩いパフォーマンス閾値
- メモリテストを無効化可能
- リトライ機能の活用

#### ローカル開発環境
- 詳細なデバッグ情報
- インタラクティブなテスト実行
- ホットリロード対応

#### ブラウザ環境 vs Node.js環境
- DOM API可用性の違い
- パフォーマンス特性の違い
- ファイルシステムアクセスの制限

### 環境検出とアダプテーション

```javascript
// 環境検出
const environment = PerformanceTestUtils.detectEnvironment();

// 環境別設定
const config = PerformanceTestUtils.createPerformanceTestConfig(environment);

// 環境対応閾値取得
const thresholds = PerformanceTestUtils.getEnvironmentThresholds(environment);
```

## 🎭 ブラウザ自動化テスト（Playwright）

BubblePopゲームでは、実際のブラウザ環境での動作を確認するため、Playwrightを使用したブラウザ自動化テストをサポートしています。

### テストガイド
詳細な操作手順とベストプラクティスは、**[Playwright テストガイド](playwright-testing-guide.md)** を参照してください。

### 主な特徴
- **URLパラメータによる裏道**: `?username=TestUser&skipUsernameInput=true` でユーザー名入力をスキップ
- **Canvas操作対応**: ゲーム画面の自動操作とスクリーンショット撮影
- **安定した手順**: 確実にメインメニューにアクセスできる方法を提供

### 使用場面
- レイアウト問題の検証
- UI/UXの回帰テスト
- 多言語対応の表示確認
- パフォーマンス測定

## 🚨 トラブルシューティング

### よくある問題と解決法

#### 1. "jest is not defined" エラー
```javascript
// 解決法: Jest関数のインポートを追加
import { jest } from '@jest/globals';
```

#### 2. "Cannot find module" エラー
```javascript
// 解決法: 動的インポートを使用
const { ModuleName } = await import('../../src/path/ModuleName.js');
```

#### 3. "is not a function" エラー
```javascript
// 解決法: MockFactoryの完全なAPIを使用
const mockObject = MockFactory.createObjectMock();
```

#### 4. パフォーマンステストの不安定性
```javascript
// 解決法: PerformanceTestUtilsの安定化機能を使用
const stableTest = PerformanceTestUtils.createStablePerformanceTest(
    'Test Name',
    testFunction,
    { retries: 3, timeout: 10000 }
);
```

#### 5. メモリリーク
```javascript
// 解決法: 適切なクリーンアップ
afterEach(() => {
    if (component && component.cleanup) {
        component.cleanup();
    }
    jest.clearAllMocks();
});
```

## 📊 監視・測定ツール

### テスト成功率監視
```bash
# テスト成功率を監視・記録
node scripts/test-success-monitor.js all run

# レポート表示
node scripts/test-success-monitor.js all report
```

### API整合性検証
```bash
# API整合性をチェック
node scripts/api-consistency-validator.js
```

### クロス環境テスト
```bash
# 全環境でテスト実行
node scripts/cross-environment-tester.js

# 特定環境のみ
node scripts/cross-environment-tester.js unit
```

## 📝 コードレビューチェックリスト

### テスト品質チェック
- [ ] Jest importが含まれている
- [ ] MockFactoryを適切に使用している
- [ ] 動的インポートで依存関係問題を回避している
- [ ] 適切なbeforeEach/afterEachクリーンアップ
- [ ] パフォーマンステストで環境対応閾値を使用
- [ ] テスト名が説明的で理解しやすい
- [ ] エラーケースのテストが含まれている

### パフォーマンステスト特有
- [ ] PerformanceTestUtilsを使用している
- [ ] 環境検出とアダプテーションを実装
- [ ] リトライロジックが含まれている
- [ ] 適切なタイムアウト設定
- [ ] メモリリークの可能性をチェック

## 🔄 継続的改善

### 定期的なタスク
1. **週次**: テスト成功率の監視と分析
2. **月次**: API整合性検証の実行
3. **リリース前**: 全環境でのクロステスト実行
4. **新機能追加時**: 該当テストの作成・更新

### メトリクス追跡
- テスト成功率（目標: 95%以上）
- テスト実行時間の推移
- 環境間の性能差異
- API整合性の問題数

### 改善サイクル
1. 問題の特定（監視ツール使用）
2. 根本原因分析
3. 修正実装
4. 検証・テスト
5. ドキュメント・ガイドライン更新

---

## 📚 参考資料

- [Jest Configuration](https://jestjs.io/docs/configuration)
- [ES Modules in Jest](https://jestjs.io/docs/ecmascript-modules)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Performance Testing Guidelines](https://web.dev/performance-budgets-101/)

---

**最終更新**: 2025-08-05  
**プロジェクト**: BubblePop Game (awaputi)  
**関連Issue**: #97 - 包括的テストスイート修正プロジェクト