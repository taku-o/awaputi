# TypeScript移行中に発見した未実装機能一覧

## 概要
TypeScript移行作業中に発見した「将来実装する」「現時点では未実装」のコード箇所を記録。
これらは型安全性確保のためのスタブ実装や、機能拡張予定の箇所です。

## 発見した未実装機能

### 1. AchievementManager - 実績システム関連
**ファイル**: `src/core/AchievementManager.ts`
**箇所**: Line 135-165, 304-324

#### 未実装の詳細:
- **ProgressTrackerオブジェクト**: モック実装のみ
  - `addEventListener()`: 空の関数
  - `updateProgress()`: 空の関数
  - `evaluateAchievementCondition()`: 常にnullを返す
  - `isAchievementUnlocked()`: 常にfalseを返す
  - `unlockAchievement()`: 空の関数
  - `getProgressHistory()`: 空配列を返す

- **PerformanceOptimizer**: モック実装のみ
  - `processUpdate()`: コールバックをそのまま実行するだけ
  - `getFromCache()`: 常にnullを返す
  - `setCache()`: 空の関数
  - `updateConfig()`: 空の関数

#### 実装予定の機能:
- 実績の進捗追跡システム
- パフォーマンス最適化キャッシング
- 実績アンロック条件の評価ロジック

### 2. ConfigurationManager - 設定管理拡張機能
**ファイル**: `src/core/ConfigurationManager.ts`
**箇所**: Line 60-61, 101-109

#### 未実装の詳細:
- **遅延読み込みシステム**: `_lazyLoaders` Map
  - 設定値の遅延読み込み機能
  - メモリ効率化のための動的読み込み

- **プリロードシステム**: `_preloadKeys` Set
  - 頻繁にアクセスされるキーの事前読み込み
  - パフォーマンス向上のための先読み機能

#### コメント:
```typescript
// 遅延読み込み用の設定ローダー
this._lazyLoaders = new Map<string, () => ConfigurationValue>();

// 頻繁にアクセスされるキーのプリロード設定
this._preloadKeys = new Set([
    'game.scoring.baseScores',
    'game.bubbles.maxAge',
    // ... 他の重要な設定キー
]);
```

### 3. PlayerData - 復活アイテムシステム
**ファイル**: `src/core/PlayerData.ts`
**箇所**: Line 175-178

#### 未実装の詳細:
- **ItemManager統合**: `this.gameEngine.itemManager.useRevival()`
  - 復活アイテムの使用ロジック
  - ゲームオーバー時の自動復活処理

#### 現在のスタブ実装:
```typescript
if (this.gameEngine && this.gameEngine.itemManager && this.gameEngine.itemManager.useRevival()) {
    console.log('Revival item activated!');
    return { died: false }; // 復活したのでゲームオーバーではない
}
```

### 4. AudioSubsystemCoordinator - オーディオサブシステム
**ファイル**: `src/audio/AudioSubsystemCoordinator.ts`
**箇所**: Line 205-210

#### 未実装の詳細:
- **動的インポートシステム**: `await import('./AudioAccessibilitySupport.js')`
  - アクセシビリティ支援システムの動的読み込み
  - モジュールの遅延初期化

#### 現在の実装状態:
- MainAudioAccessibilitySupport クラスは存在
- 動的インポートは機能している
- 初期化処理は正常動作

### 5. ProceduralSoundGenerator - 音響生成システム
**ファイル**: `src/audio/ProceduralSoundGenerator.ts`
**箇所**: 全体的にスタブ実装状態

#### 未実装の詳細:
- **音響生成アルゴリズム**: 基本的な実装はあるが限定的
- **動的パラメーター調整**: `updateSoundParameters()` 
- **音響品質最適化**: 高品質音響生成機能
- **リアルタイム音響生成**: ゲーム状況に応じた動的生成

## 優先実装推奨項目

### 高優先度
1. **PlayerData復活アイテムシステム**: ゲームプレイに直接影響
2. **AchievementManager進捗追跡**: ユーザーエンゲージメント向上

### 中優先度
1. **ConfigurationManager遅延読み込み**: パフォーマンス向上
2. **ProceduralSoundGenerator音響品質**: ユーザー体験向上

### 低優先度
1. **パフォーマンス最適化キャッシング**: 最適化レベルの機能

## 実装時の注意事項

### 型安全性の維持
- 未実装機能もTypeScriptの型システムに適合させる
- インターフェース定義を先行して作成
- スタブ実装で型エラーを防ぐ

### 段階的実装
- 機能を小さなユニットに分割
- 各段階でテストとビルドの確認
- 後方互換性の維持

### ドキュメント更新
- 実装完了時はこのファイルから該当項目を削除
- 新たに発見した未実装箇所は追記
- 実装仕様書への反映

## completedディレクトリ内のtasks.md不整合問題

### 発見した問題
**調査日**: 2025-01-16
**調査対象**: `.kiro/specs/completed/2025/Q3/*/tasks.md`

#### 問題のあるファイル
**ファイル**: `mcp-token-limit-fix/tasks.md`

#### 不整合箇所:
1. **Line 144**: `- [x] インポート/エクスポートの整合性テスト（部分完了）`
   - 問題: "部分完了"と記載されているのにチェックマーク[x]がついている
   - 正しくは: `[ ]`であるべき

2. **Line 177**: `- [x] 18. プロジェクト全体の健全性チェック（部分完了）`
   - 問題: "部分完了"と記載されているのにチェックマーク[x]がついている
   - 正しくは: `[ ]`であるべき

#### 影響
- completedディレクトリなのに未完了タスクが存在することになる
- プロジェクト完了状況の誤解を招く
- 作業継続の必要性が不明確になる

#### 推奨対応
- 該当タスクのチェック状態を`[ ]`に修正
- または「部分完了」の記述を削除して真の完了状態に更新
- 同様の問題が他のファイルにもないか全体的な監査を実施

## 更新履歴
- **2025-01-16**: completedディレクトリ内tasks.md不整合問題を発見・記録
- **2025-01-15**: 初期版作成、TypeScript移行Phase 7作業中に発見した未実装機能をリスト化