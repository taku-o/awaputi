# Main Controller Pattern - アーキテクチャ設計書

## 概要

Main Controller Patternは、大容量ファイル（2,500語超）をMCPツール対応とセマンティック解析最適化のために分割するアーキテクチャパターンです。Issue #72の大容量ファイル分割プロジェクトで確立されました。

## 設計原則

### 1. 軽量コントローラー + 専門コンポーネント
- **メインコントローラー**: 公開API保持、依存関係統制、軽量（通常1,000-2,000語）
- **専門コンポーネント**: 機能特化、単一責任、独立性（各500-1,500語）

### 2. 後方互換性保証
- 既存の公開インターフェース完全維持
- 外部依存関係への影響なし
- テストスイート継続成功

### 3. MCPツール最適化
- 全ファイル2,500語以下
- Serena find_symbolツール完全対応
- セマンティックコード解析エラー解消

## アーキテクチャ構造

### 基本パターン

```javascript
// MainController.js (元の大容量ファイル → 軽量コントローラー)
import { ComponentA } from './main-controller/ComponentA.js';
import { ComponentB } from './main-controller/ComponentB.js';
import { ComponentC } from './main-controller/ComponentC.js';

export class MainController {
    constructor(...args) {
        // 専門コンポーネントを初期化・注入
        this.componentA = new ComponentA(args);
        this.componentB = new ComponentB(args);
        this.componentC = new ComponentC(args);
    }
    
    // 公開API: 既存インターフェース保持
    publicMethod1() {
        return this.componentA.handleMethod1();
    }
    
    publicMethod2() {
        return this.componentB.handleMethod2();
    }
    
    // 内部統制: コンポーネント間連携
    complexOperation() {
        const resultA = this.componentA.process();
        const resultB = this.componentB.process(resultA);
        return this.componentC.finalize(resultB);
    }
}
```

### ディレクトリ構造

```
src/
├── managers/
│   ├── MainController.js              # メインコントローラー (軽量)
│   └── main-controller/               # 専門コンポーネント群
│       ├── ComponentA.js              # 機能A専門
│       ├── ComponentB.js              # 機能B専門
│       ├── ComponentC.js              # 機能C専門
│       └── SharedUtilities.js         # 共通ユーティリティ
```

## 実装済み事例

### 1. BubbleManager (Phase D.13)
**分割前**: 3,552語 → **分割後**: 876語 (75%削減)

```
src/managers/
├── BubbleManager.js                   # バブル管理統制 (876語)
└── bubble-manager/
    ├── BubbleSpawner.js              # バブル生成システム
    ├── BubblePhysicsEngine.js        # 物理演算・衝突検出
    ├── BubbleDragSystem.js           # ドラッグ・フリック操作
    └── BubbleEffectProcessor.js      # 特殊効果処理
```

### 2. EnvironmentalAudioManager (Phase D.14)
**分割前**: 3,549語 → **分割後**: 533語 (85%削減)

```
src/audio/
├── EnvironmentalAudioManager.js      # 環境音管理統制 (533語)
└── environmental-audio-manager/
    ├── BiomeDefinitionManager.js     # バイオーム・天候・時間定義
    ├── EnvironmentalSoundGenerator.js # 環境音生成システム
    ├── BiomeTransitionController.js  # バイオーム遷移・フェード
    └── EnvironmentalAudioSettings.js # 設定管理・性能監視
```

### 3. GameEngine (Phase C.8)
**分割前**: 4,087語 → **分割後**: 1,544語 (62%削減)

```
src/core/
├── GameEngine.js                     # ゲームエンジン統制 (1,544語)
└── game-engine/
    ├── GameStateManager.js           # ゲーム状態管理
    ├── GameLoopController.js         # ゲームループ制御
    ├── SystemCoordinator.js          # システム統合
    ├── PerformanceController.js      # パフォーマンス制御
    ├── ErrorHandler.js               # エラーハンドリング
    ├── ConfigurationLoader.js        # 設定読み込み
    ├── EventDispatcher.js            # イベント配信
    └── ResourceManager.js            # リソース管理
```

## 分割戦略

### 1. 責任領域分析
元ファイルのメソッド・機能を以下の観点で分類：
- **コア制御**: 必須の統制機能（メインコントローラーに残留）
- **専門処理**: 特定領域の処理（専門コンポーネントに分離）
- **ユーティリティ**: 共通処理（共有ユーティリティに分離）

### 2. 依存関係設計
- **トップダウン**: メインコントローラー → 専門コンポーネント
- **注入パターン**: コンストラクタでの依存注入
- **疎結合**: コンポーネント間直接依存回避

### 3. API互換性維持
- 全ての公開メソッドをメインコントローラーで保持
- 内部実装のみ専門コンポーネントに委譲
- テストスイート継続成功確保

## 分割実装手順

### Phase 1: 分析・準備
1. **元ファイル解析**: 語数、メソッド構成、依存関係
2. **責任領域特定**: 機能別グループ化
3. **分割計画策定**: コンポーネント設計、命名

### Phase 2: コンポーネント分離
1. **専門コンポーネント作成**: 単一責任原則適用
2. **共通ユーティリティ抽出**: 重複処理統合
3. **依存関係解決**: インポート・エクスポート調整

### Phase 3: メインコントローラー更新
1. **コンポーネント統合**: インポート・初期化
2. **API委譲実装**: 既存メソッドの委譲
3. **統制ロジック**: コンポーネント間連携

### Phase 4: 検証・最適化
1. **機能テスト**: 全機能の動作確認
2. **語数検証**: 2,500語制限遵守確認
3. **パフォーマンステスト**: 性能劣化なし確認

## 成功基準

### パフォーマンス目標
- **語数削減**: 50%以上削減（目標70%+）
- **MCPツール対応**: 全ファイル2,500語以下
- **実行性能**: 性能劣化5%以内

### 品質目標
- **後方互換性**: 100%維持
- **テスト継続性**: 全テスト成功
- **コード品質**: ESLint/Prettier適合

### 保守性目標
- **単一責任**: 各コンポーネント明確な責任
- **疎結合**: 独立性・交換可能性
- **可読性**: 明確な命名・構造

## ベストプラクティス

### 1. 命名規則
- **メインコントローラー**: 元ファイル名維持
- **コンポーネント**: 機能を表す明確な名前
- **ディレクトリ**: ケバブケース（例: `bubble-manager/`）

### 2. コンポーネント設計
- **単一責任**: 1つの明確な機能・責任
- **適切サイズ**: 500-1,500語程度
- **明確インターフェース**: 明確なパブリックAPI

### 3. 統制パターン
- **委譲優先**: 複雑な処理は専門コンポーネントに委譲
- **統制最小化**: メインコントローラーは軽量に保持
- **エラーハンドリング**: 統一されたエラー処理

## 今後の拡張

### Phase E: 残存ファイル分割 (Issue #77)
- 残存52ファイル（2,500語超）の分割対応
- 同一パターンの継続適用
- 100%MCPツール互換性達成

### 継続改善
- パフォーマンス最適化
- コンポーネント再利用性向上
- テストカバレッジ強化

## 関連ドキュメント

- [Issue #72: 大容量ファイル分割プロジェクト](https://github.com/taku-o/awaputi/issues/72)
- [Issue #77: Phase E残存ファイル分割](https://github.com/taku-o/awaputi/issues/77)
- [アーキテクチャ設計書](./architecture.md)
- [開発ガイドライン](./development-guide.md)