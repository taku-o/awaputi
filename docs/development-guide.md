# 開発ガイドライン

## コード規約
- **ES6+ モジュール**: import/export 構文使用（.js拡張子必須）
- **日本語コメント**: コード内コメントは日本語で記述
- **クラスベース**: ES6 クラス構文を使用した OOP 設計
- **イベント型**: addEventListener パターンでのイベント処理
- **命名規則**: 
  - 変数・関数名: English（camelCase）
  - クラス名: PascalCase（ドメインプレフィックス付与 - 詳細は[命名規則ガイド](development/naming-conventions-guide.md)参照）
  - 定数: UPPER_SNAKE_CASE
  - ファイル名: PascalCase（クラス名と一致、.js拡張子必須）
- **エラーハンドリング**: 中央集権的ErrorHandlerユーティリティ使用
- **非同期処理**: async/await パターン、適切なエラーバウンダリ実装

## ファイルサイズ制限（MCPトークン制限対応）
- **制限値**: 1ファイルあたり2,500語以下を厳守
- **監視**: `tools/file-size-monitor.js`による自動監視
- **警告閾値**: 2,000語で要監視、2,500語で緊急分割必要
- **分割原則**: 
  - 単一責任の原則に従ってコンポーネント分離
  - 機能別、UI別、データ処理別に適切にモジュール化
  - 分割後も既存のインポート関係を維持
- **除外対象**: `node_modules/`, `dist/`, `test-results/`, `playwright-report/`
- **チェック方法**: 
  ```bash
  # 全ファイルチェック
  node tools/file-size-monitor.js src
  
  # 特定ディレクトリチェック
  node tools/file-size-monitor.js src/scenes
  ```

## 命名競合検出・防止システム（Issue #131対応）

JavaScript クラス名とファイル名の重複を防ぐための検証ツール群が利用可能です。

### 命名競合検出ツール

```bash
# 全体的な命名競合をチェック
node scripts/check-naming-conflicts.js

# 特定の名前の競合をチェック
node scripts/check-naming-conflicts.js --name "MyClass" --type class
node scripts/check-naming-conflicts.js --name "utils.js" --type file

# ヘルプ表示
node scripts/check-naming-conflicts.js --help
```

### プロジェクト検証ツール

```bash
# プロジェクト全体の整合性検証
node scripts/validate-project.js

# 特定ディレクトリの検証  
node scripts/validate-project.js src/core/
```

### 包括レポート生成

```bash
# Issue #131の完全なプロジェクト状況レポート生成
node scripts/generate-final-report.js
```

### Pre-commit Hook統合

```bash
# .git/hooks/pre-commit に追加
#!/bin/sh
echo "🔍 命名競合チェック実行中..."
node scripts/check-naming-conflicts.js
if [ $? -ne 0 ]; then
    echo "❌ 命名競合が検出されました。修正してからコミットしてください。"
    exit 1
fi
```

### 命名規則

Issue #131で確立された統一命名戦略：

- **ドメインベース**: `Core*`, `Debug*`, `Utils*`, `Analytics*`
- **機能レベル**: `Advanced*`, `Basic*`, `Enhanced*`  
- **コンテキスト固有**: `Scenes*`, `DataManagement*`, `MainMenu*`

詳細は [命名規則ガイド](development/naming-conventions-guide.md) を参照。

## ファイル構造パターン
```javascript
// 基本的なクラス構造
export class ComponentName {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.initialize();
    }
    
    initialize() {
        // 初期化処理
    }
    
    update(deltaTime) {
        // フレーム更新処理
    }
    
    render(ctx) {
        // 描画処理
    }
}
```

## 設定システム使用例
```javascript
// 統一設定管理システム
import { getConfigurationManager } from './core/ConfigurationManager.js';

const config = getConfigurationManager();

// 設定値の取得（キャッシュ付き高速アクセス）
const baseScore = config.get('game.scoring.baseScores.normal');
const bubbleMaxAge = config.get('game.bubbles.maxAge');

// 設定値の監視
config.watch('game.difficulty', (newValue, oldValue) => {
    console.log(`難易度が ${oldValue} から ${newValue} に変更されました`);
});

// バリデーション付き設定
config.set('game.player.maxHP', 100, {
    validate: value => value > 0 && value <= 200
});
```

## ステージ設定例
```javascript
const STAGE_CONFIGS = {
    tutorial: { 
        duration: 60000, 
        bubbleTypes: ['normal'] 
    },
    normal: { 
        duration: 300000, 
        bubbleTypes: ['normal', 'stone', 'rainbow', 'pink', 'clock', 'score'] 
    }
    // 8+ 追加ステージタイプ
};
```

## 現在の開発状況 (2025年7月時点)

### 完了済み機能 (Phase 1-4)

✅ **Phase 1: コア機能**
- ゲームエンジン基盤とゲームループ実装済み
- 基本泡クラスと泡管理システム完成
- 入力システム（マウス・タッチ統一処理）完成
- スコア・コンボシステム実装済み

✅ **Phase 2: ゲームプレイ機能**  
- 18+種類の特殊泡すべて実装済み（Normal, Stone/Iron/Diamond, Rainbow, Pink, Clock, Electric, Poison, Spiky, Escaping, Boss, Golden, Frozen, Magnetic, Explosive, Phantom, Multiplier等）
- HPシステムとゲームオーバー処理完成
- ドラッグ操作による泡の吹き飛ばし機能実装済み
- 特殊効果システム（ボーナスタイム、時間停止、画面震動、スコア倍率、磁力効果、爆発連鎖等）実装済み

✅ **Phase 3: ステージ・進歩システム**
- 10種類のステージタイプ実装済み（1分ステージ〜全部入りアワアワ）
- AP/TAPシステムとハイスコア記録機能完成
- アイテムシステム（ショップ、購入、効果適用）実装済み
- メインメニューとステージ選択画面完成

✅ **Phase 4: 追加コンテンツ・UI・UX システム（Task 29完了）**
- 6種類の新バブルタイプ（Golden, Frozen, Magnetic, Explosive, Phantom, Multiplier）実装済み
- 特別イベントステージシステム実装済み（Golden Rush, Phantom Night, Explosive Chaos等6種類）
- 実績システム実装済み（18種類の実績、進捗追跡、AP報酬）
- プレイヤー統計システム実装済み（詳細統計、セッション追跡、パフォーマンス分析）
- ユーザー情報管理画面実装済み
- フローティングテキストシステム実装済み
- パーティクル効果システム実装済み
- 音響効果システム（AudioManager）実装済み

### 現在の実装状況
- **Phase 1-4**: 完了（95%+）
- **Phase 5**: 部分完了（最適化・テスト・デプロイ）

### Phase 5の進捗状況

✅ **完了済み最適化・安定性機能**
- オブジェクトプーリングシステム実装済み（ObjectPool.js）
- パフォーマンス最適化システム実装済み（PerformanceOptimizer.js）
- レンダリング最適化実装済み（RenderOptimizer.js）
- メモリ管理システム実装済み（MemoryManager.js）
- エラーハンドリングシステム実装済み（ErrorHandler.js）
- ブラウザ互換性システム実装済み（BrowserCompatibility.js）
- レスポンシブCanvas管理実装済み（ResponsiveCanvasManager.js）
- 設定管理システム実装済み（SettingsManager.js）
- 国際化システム実装済み（LocalizationManager.js）
- キーボードショートカット実装済み（KeyboardShortcutManager.js）
- アナリティクス システム実装済み（Analytics.js）

✅ **完了済みテスト・ビルド機能**
- **Jest テストスイート**: 包括的ユニット・統合テスト実装済み
  - コアシステム: ConfigurationManager, CalculationEngine, CacheSystem等
  - 設定システム: GameConfig, GameBalance, AudioConfig等  
  - 計算エンジン: BalanceCalculator, ScoreCalculator, EffectsCalculator等
  - エラーハンドリング: ConfigurationErrorHandler, ValidationSystem等
- **Playwright E2E テスト**: 設定システム統合テスト実装済み
- **パフォーマンステスト**: 計算性能、メモリ使用量、設定アクセス速度テスト実装済み
- **Viteビルド設定**: テスト環境最適化完了
- **デプロイ設定**: Netlify, Vercel対応完了

✅ **Phase 5完了済み追加機能**
- **設定管理システム統合**: ConfigurationManager中央集権化
- **高性能計算エンジン**: CalculationEngine、各種Calculator実装
- **包括的テストスイート**: Jest、Playwright、パフォーマンステスト
- **開発者支援ツール**: デバッグ機能、トラブルシューティングガイド
- **プロジェクト標準化**: コーディング規約、ドキュメント体系化
- **アクセシビリティ・国際化**: 完全対応実装
- **レガシー互換性**: 段階的移行システム

🔄 **残りのタスク（Phase 5最終仕上げ）**
- [x] SEO最適化とメタデータ設定（Issue #34完了済み）
- [ ] ゲーム分析機能の実装（Issue #35進行中）
- [ ] PWA機能の実装
- [ ] 最終的なパフォーマンス調整

このプロジェクトは、モジュラー設計により高い拡張性と保守性を実現した、本格的なブラウザゲームです。