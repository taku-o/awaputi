# JavaScript Naming Conventions Guide
## Issue #131 - Class Name Deduplication Project Results

Last Updated: 2025-08-11  
Version: 1.0.0  
Project: BubblePop (awaputi)  

---

## 概要

このドキュメントは、Issue #131「JavaScript Class Name Deduplication Project」の完了に伴い作成された、JavaScriptクラス名とファイル名の命名規則ガイドです。プロジェクト全体で31のクラス名重複を解決し、将来の重複を防ぐための統一された命名戦略を確立しました。

## 実装された命名戦略

### 1. ドメインベース命名戦略 (Domain-based Naming)

各システムドメインに固有のプレフィックスを付与する戦略。

**適用例:**
```javascript
// Core System (18件適用)
CoreAccessibilityManager      // 旧: AccessibilityManager (core/)
CoreKeyboardShortcutManager  // 旧: KeyboardShortcutManager (core/)
CoreComparisonEngine         // 旧: ComparisonEngine (core/)
CoreChartRenderer           // 旧: ChartRenderer (core/)
CoreTrendAnalyzer           // 旧: TrendAnalyzer (core/)

// Debug System
DebugAccessibilityManager    // 旧: AccessibilityManager (debug/)
DebugKeyboardShortcutManager // 旧: KeyboardShortcutManager (debug/)
DebugErrorReporter          // 旧: ErrorReporter (debug/)
DebugErrorAnalyzer          // 旧: ErrorAnalyzer (debug/)

// Utils System
UtilsErrorReporter          // 旧: ErrorReporter (utils/)
UtilsErrorAnalyzer          // 旧: ErrorAnalyzer (utils/)

// Analytics System
AnalyticsComparisonEngine   // 旧: ComparisonEngine (analytics/)
AnalyticsChartRenderer      // 旧: ChartRenderer (analytics/)
AnalyticsTrendAnalyzer      // 旧: TrendAnalyzer (analytics/)
AnalyticsErrorNotificationSystem // 旧: ErrorNotificationSystem (analytics/)
AnalyticsPerformanceMonitor // 旧: PerformanceMonitor (analytics/)
```

**使用ルール:**
- `Core*`: コアシステム機能
- `Debug*`: デバッグ関連機能
- `Utils*`: ユーティリティ機能
- `Analytics*`: 分析・レポート機能
- `Audio*`: オーディオシステム機能

### 2. 機能レベル命名戦略 (Function-level Naming)

機能の複雑さや能力レベルに基づくプレフィックス付与。

**適用例:**
```javascript
// Advanced vs Basic (6件適用)
AdvancedDirtyRegionManager  // 旧: DirtyRegionManager (advanced-rendering-optimizer/)
BasicDirtyRegionManager     // 旧: DirtyRegionManager (rendering/)
AdvancedLayerManager        // 旧: LayerManager (advanced-rendering-optimizer/)
BasicLayerManager           // 旧: LayerManager (rendering/)
AdvancedViewportCuller      // 旧: ViewportCuller (advanced-rendering-optimizer/)
BasicViewportCuller         // 旧: ViewportCuller (rendering/)
```

**使用ルール:**
- `Advanced*`: 高度な機能を持つ実装
- `Basic*`: 基本的な機能を持つ実装
- `Enhanced*`: 機能拡張版
- `Standard*`: 標準実装

### 3. コンテキスト固有命名戦略 (Context-specific Naming)

使用コンテキストや画面領域に基づく命名。

**適用例:**
```javascript
// UI Context (7件適用)
ScenesBaseDialog           // 旧: BaseDialog (scenes/components/)
DataManagementBaseDialog   // 旧: BaseDialog (ui/data-management-ui/)
ScenesDialogManager        // 旧: DialogManager (scenes/components/)
MainMenuDialogManager      // 旧: DialogManager (scenes/main-menu/)
ScenesImportDialog         // 旧: ImportDialog (scenes/components/)
DataManagementImportDialog // 旧: ImportDialog (ui/data-management-ui/)
ScenesExportDialog         // 旧: ExportDialog (scenes/components/)
DataManagementExportDialog // 旧: ExportDialog (ui/data-management-ui/)
```

**使用ルール:**
- `Scenes*`: ゲームシーン関連
- `DataManagement*`: データ管理UI関連
- `MainMenu*`: メインメニュー関連
- `Component*`: コンポーネント固有

### 4. エフェクト・コンポーネント特化命名戦略

特定の機能領域に特化した命名。

**適用例:**
```javascript
// Audio System
AudioEffectContextManager      // 旧: AudioContextManager (audio/effects/)
AudioComponentPerformanceMonitor // 旧: AudioPerformanceMonitor (audio/components/)
MainAudioAccessibilitySupport  // 旧: AudioAccessibilitySupport (audio/)
ComponentAudioAccessibilitySupport // 旧: AudioAccessibilitySupport (audio/components/)
```

## 命名規則の詳細ルール

### ファイル名規則

1. **PascalCaseを使用**
   ```javascript
   CoreAccessibilityManager.js    // ✅ 正しい
   core_accessibility_manager.js // ❌ 間違い
   ```

2. **プレフィックス + 機能名**
   ```javascript
   DebugErrorReporter.js          // ✅ 正しい
   ErrorReporterDebug.js          // ❌ 間違い
   ```

3. **ディレクトリ構造との整合性**
   ```
   src/core/CoreAccessibilityManager.js    // ✅ 正しい
   src/debug/DebugAccessibilityManager.js  // ✅ 正しい
   ```

### クラス名規則

1. **ファイル名とクラス名の一致**
   ```javascript
   // CoreAccessibilityManager.js
   export class CoreAccessibilityManager { } // ✅ 正しい
   export class AccessibilityManager { }     // ❌ 間違い
   ```

2. **exportの統一**
   ```javascript
   // Named export推奨
   export class CoreAccessibilityManager { }
   
   // Default exportも可
   export default CoreAccessibilityManager;
   ```

## 実装時のベストプラクティス

### 1. インポート文の更新

**リネーム後の正しいインポート:**
```javascript
// Before
import { AccessibilityManager } from '../core/AccessibilityManager.js';

// After
import { CoreAccessibilityManager } from '../core/CoreAccessibilityManager.js';
```

### 2. クラス instantiation の更新

```javascript
// Before
this.accessibilityManager = new AccessibilityManager(config);

// After  
this.accessibilityManager = new CoreAccessibilityManager(config);
```

### 3. コメントとドキュメントの更新

```javascript
/**
 * CoreAccessibilityManager - コアシステムのアクセシビリティ管理
 * 旧名: AccessibilityManager
 * リネーム理由: DebugAccessibilityManagerとの重複解決
 */
export class CoreAccessibilityManager {
    // ...
}
```

## Git履歴の保持

すべてのファイル名変更は `git mv` を使用して実行され、Git履歴が保持されています。

```bash
# 履歴確認の例
git log --follow src/core/CoreAccessibilityManager.js
```

## 重複検出・防止ツール

### 1. 命名競合検出ツール

```bash
# 全体的な競合チェック
node scripts/check-naming-conflicts.js

# 特定の名前の競合チェック
node scripts/check-naming-conflicts.js --name "MyClass" --type class
```

### 2. プロジェクト検証ツール

```bash
# コード整合性検証
node scripts/validate-project.js

# 特定ディレクトリの検証
node scripts/validate-project.js src/core/
```

### 3. 最終レポート生成

```bash
# 包括的なプロジェクト状況レポート
node scripts/generate-final-report.js
```

## CI/CD統合

### Pre-commit Hook設定

```bash
# .git/hooks/pre-commit
#!/bin/sh
node scripts/check-naming-conflicts.js
if [ $? -ne 0 ]; then
    echo "命名競合が検出されました。修正してからコミットしてください。"
    exit 1
fi
```

### GitHub Actions設定例

```yaml
# .github/workflows/naming-validation.yml
name: Naming Validation
on: [push, pull_request]

jobs:
  validate-naming:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: node scripts/check-naming-conflicts.js
      - run: node scripts/validate-project.js
```

## トラブルシューティング

### よくある問題と解決方法

1. **インポートエラー**
   ```
   Error: Cannot find module './AccessibilityManager.js'
   ```
   **解決:** リネーム後のファイル名に更新
   ```javascript
   import { CoreAccessibilityManager } from './CoreAccessibilityManager.js';
   ```

2. **クラス参照エラー**
   ```
   ReferenceError: AccessibilityManager is not defined
   ```
   **解決:** クラス名を新しい名前に更新
   ```javascript
   this.manager = new CoreAccessibilityManager();
   ```

3. **テスト失敗**
   ```
   Test failed: AccessibilityManager is not a constructor
   ```
   **解決:** テストファイル内のインポートとクラス参照を更新

## 今後の開発指針

### 新しいクラス作成時のチェックリスト

- [ ] 既存のクラス名と重複していないか確認
- [ ] 適切なドメインプレフィックスを使用
- [ ] ファイル名とクラス名が一致している
- [ ] 命名競合検出ツールで検証済み

### レビュー時のチェックポイント

- [ ] 命名規則に準拠している
- [ ] 関連するインポート文がすべて更新されている
- [ ] テストが正常に実行される
- [ ] ドキュメントが更新されている

---

## 関連リソース

- [Issue #131](https://github.com/taku-o/awaputi/issues/131) - JavaScript Class Name Deduplication
- [プロジェクトアーキテクチャ](../architecture.md)
- [開発ガイドライン](../development-guide.md)
- [API Reference](../api-reference/)

---

*このガイドは Issue #131 の完了に伴い作成され、プロジェクトの命名整合性を保つために継続的に更新されます。*