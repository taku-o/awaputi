# 既存システムからの移行ガイド

## 概要

このガイドでは、既存のBALANCE_CONFIGとBalanceHelperから新しい設定システムへの移行方法を説明します。新しいシステムは既存のAPIとの互換性を保ちながら、段階的な移行を可能にします。

## 移行戦略

### 段階的移行アプローチ

1. **Phase 1**: 新システムの導入（既存システムと並行動作）
2. **Phase 2**: 新APIの使用開始（警告付きで旧APIも利用可能）
3. **Phase 3**: 旧APIの段階的廃止
4. **Phase 4**: 旧システムの完全削除

### 互換性保証期間

- **完全互換性**: 新システム導入から3ヶ月間
- **警告付き互換性**: その後3ヶ月間
- **完全移行**: 6ヶ月後に旧システム削除

## 移行マッピング

### 1. BALANCE_CONFIG → GameConfig

#### 旧システム
```javascript
// 従来の使用方法
import { BALANCE_CONFIG } from './GameBalance.js';

const normalScore = BALANCE_CONFIG.scoring.baseScores.normal;
const comboIncrement = BALANCE_CONFIG.scoring.combo.multiplierIncrement;
const stageRequirement = BALANCE_CONFIG.stages.unlockRequirements.hard;
```

#### 新システム
```javascript
// 新しい使用方法
import { getGameConfig } from '../config/GameConfig.js';

const gameConfig = getGameConfig();
const normalScore = gameConfig.getBubbleBaseScore('normal');
const comboConfig = gameConfig.getComboConfig();
const stageRequirement = gameConfig.getStageUnlockRequirement('hard');
```

#### 移行テーブル

| 旧API | 新API | 備考 |
|-------|-------|------|
| `BALANCE_CONFIG.scoring.baseScores.{type}` | `gameConfig.getBubbleBaseScore(type)` | 直接アクセスから関数呼び出しに変更 |
| `BALANCE_CONFIG.scoring.combo` | `gameConfig.getComboConfig()` | オブジェクト全体を取得 |
| `BALANCE_CONFIG.stages.unlockRequirements.{stage}` | `gameConfig.getStageUnlockRequirement(stage)` | 関数呼び出しに変更 |
| `BALANCE_CONFIG.stages.difficulty.{stage}` | `gameConfig.getStageDifficulty(stage)` | 関数呼び出しに変更 |
| `BALANCE_CONFIG.items.baseCosts.{item}` | `gameConfig.getItemBaseCost(item)` | 関数呼び出しに変更 |
| `BALANCE_CONFIG.bubbles.maxAge.{type}` | `gameConfig.getBubbleMaxAge(type)` | 関数呼び出しに変更 |

### 2. BalanceHelper → 計算クラス

#### 旧システム
```javascript
// 従来の使用方法
import { BalanceHelper } from './BalanceHelper.js';

const score = BalanceHelper.calculateScore('diamond', 0.8);
const comboMultiplier = BalanceHelper.calculateComboMultiplier(5);
const itemCost = BalanceHelper.calculateItemCost('scoreMultiplier', 2);
```

#### 新システム（直接使用）
```javascript
// GameConfigを直接使用
import { getGameConfig } from '../config/GameConfig.js';

const gameConfig = getGameConfig();
const score = gameConfig.calculateScore('diamond', 0.8);
const comboMultiplier = gameConfig.calculateComboMultiplier(5);
const itemCost = gameConfig.calculateItemCost('scoreMultiplier', 2);
```

#### 新システム（CalculationEngine使用）
```javascript
// CalculationEngineを使用（推奨）
import { getCalculationEngine } from '../core/CalculationEngine.js';

const calcEngine = getCalculationEngine();
const scoreResult = calcEngine.calculate('score', 'calculateTotalScore', [{
    bubbleType: 'diamond',
    ageRatio: 0.8,
    comboCount: 1
}]);
const comboMultiplier = calcEngine.calculate('score', 'calculateComboMultiplier', [5]);
const itemCost = calcEngine.calculate('balance', 'calculateItemCost', ['scoreMultiplier', 2]);
```

### 3. 分散した設定値 → 統一設定管理

#### 旧システム
```javascript
// 各ファイルに分散した設定
// AudioManager.js
const DEFAULT_VOLUME = 0.7;
const DEFAULT_SFX_VOLUME = 0.8;

// ParticleManager.js
const MAX_PARTICLES = 500;
const PARTICLE_POOL_SIZE = 100;

// PerformanceOptimizer.js
const TARGET_FPS = 60;
const MAX_BUBBLES = 20;
```

#### 新システム
```javascript
// 統一された設定管理
import { getConfigurationManager } from '../core/ConfigurationManager.js';

const configManager = getConfigurationManager();
const masterVolume = configManager.get('audio', 'volumes.master', 0.7);
const sfxVolume = configManager.get('audio', 'volumes.sfx', 0.8);
const maxParticles = configManager.get('effects', 'particles.maxCount', 500);
const targetFPS = configManager.get('performance', 'optimization.targetFPS', 60);
```

## 段階的移行手順

### Step 1: 新システムの導入

1. **新しい設定クラスをインポート**
```javascript
// 既存のインポートはそのまま維持
import { BALANCE_CONFIG } from './GameBalance.js';

// 新しいインポートを追加
import { getGameConfig } from '../config/GameConfig.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
```

2. **新旧システムの並行使用**
```javascript
// 段階的に新システムに移行
const gameConfig = getGameConfig();

// 重要でない部分から新システムを使用開始
const newScore = gameConfig.getBubbleBaseScore('normal');

// 重要な部分は既存システムを継続使用
const criticalValue = BALANCE_CONFIG.scoring.baseScores.normal;
```

### Step 2: 新APIの段階的採用

1. **読み取り専用操作から移行**
```javascript
// Before
const baseScore = BALANCE_CONFIG.scoring.baseScores.diamond;

// After
const gameConfig = getGameConfig();
const baseScore = gameConfig.getBubbleBaseScore('diamond');
```

2. **計算処理の移行**
```javascript
// Before
import { BalanceHelper } from './BalanceHelper.js';
const score = BalanceHelper.calculateScore('diamond', 0.8);

// After
const gameConfig = getGameConfig();
const score = gameConfig.calculateScore('diamond', 0.8);
```

3. **設定監視の追加**
```javascript
// 新機能：設定変更の監視
const configManager = getConfigurationManager();
const watchId = configManager.watch('game', 'scoring.baseScores.normal', (newValue, oldValue) => {
    console.log(`スコア設定が変更されました: ${oldValue} → ${newValue}`);
    // 必要に応じて再計算や更新処理
});
```

### Step 3: 高度な機能の活用

1. **CalculationEngineの使用**
```javascript
// より高度な計算処理
import { getCalculationEngine } from '../core/CalculationEngine.js';

const calcEngine = getCalculationEngine();
const complexScore = calcEngine.calculate('score', 'calculateTotalScore', [{
    bubbleType: 'diamond',
    ageRatio: 0.9,
    comboCount: 8,
    specialMultiplier: 1.5,
    itemMultiplier: 1.3
}]);
```

2. **設定の動的変更**
```javascript
// 実行時の設定変更
const configManager = getConfigurationManager();
configManager.set('performance', 'optimization.maxBubbles', 25);
configManager.set('effects', 'particles.maxCount', 300);
```

### Step 4: 旧システムの段階的削除

1. **旧インポートの削除**
```javascript
// 削除対象
// import { BALANCE_CONFIG } from './GameBalance.js';
// import { BalanceHelper } from './BalanceHelper.js';

// 保持
import { getGameConfig } from '../config/GameConfig.js';
import { getCalculationEngine } from '../core/CalculationEngine.js';
```

2. **旧API呼び出しの置換確認**
```bash
# 旧APIの使用箇所を検索
grep -r "BALANCE_CONFIG" src/
grep -r "BalanceHelper" src/

# 置換が完了したら旧ファイルを削除
```

## 互換性レイヤーの使用

新システムには既存コードとの互換性を保つためのレイヤーが含まれています。

### GameBalanceCompatibility

```javascript
// 互換性レイヤーを通じた旧APIの使用
import { getGameBalanceCompatibility } from '../core/GameBalanceCompatibility.js';

const compatibility = getGameBalanceCompatibility();

// 旧API形式でアクセス（警告付き）
const oldStyleConfig = compatibility.getBALANCE_CONFIG();
const score = compatibility.calculateScore('diamond', 0.8);
```

### 警告メッセージの処理

```javascript
// 開発環境でのみ警告を表示
if (process.env.NODE_ENV === 'development') {
    console.warn('BALANCE_CONFIG の直接アクセスは非推奨です。GameConfig を使用してください。');
}
```

## 移行チェックリスト

### Phase 1: 準備段階
- [ ] 新しい設定システムの理解
- [ ] 既存コードの依存関係調査
- [ ] 移行計画の策定
- [ ] テスト環境での動作確認

### Phase 2: 部分移行
- [ ] 非重要な機能から新APIに移行
- [ ] 新旧システムの並行動作確認
- [ ] 単体テストの更新
- [ ] 統合テストの実行

### Phase 3: 本格移行
- [ ] 重要な機能の新APIへの移行
- [ ] 設定監視機能の追加
- [ ] パフォーマンステストの実行
- [ ] ユーザー受け入れテスト

### Phase 4: 完了
- [ ] 旧APIの完全削除
- [ ] 互換性レイヤーの削除
- [ ] ドキュメントの更新
- [ ] 最終テストの実行

## よくある移行問題と解決方法

### 1. 設定値の不整合

**問題**: 新旧システムで設定値が異なる

**解決方法**:
```javascript
// 設定値の同期確認
const configManager = getConfigurationManager();
const gameConfig = getGameConfig();

// 旧システムの値と比較
const oldValue = BALANCE_CONFIG.scoring.baseScores.normal;
const newValue = gameConfig.getBubbleBaseScore('normal');

if (oldValue !== newValue) {
    console.warn(`設定値の不整合: 旧=${oldValue}, 新=${newValue}`);
}
```

### 2. パフォーマンスの低下

**問題**: 新システムでパフォーマンスが低下

**解決方法**:
```javascript
// キャッシュの活用
const calcEngine = getCalculationEngine();
const stats = calcEngine.getCacheStats();
console.log('キャッシュヒット率:', stats.hitRate);

// 頻繁にアクセスされる設定のプリロード
configManager.addPreloadKey('game', 'scoring.baseScores.normal');
```

### 3. 型エラー

**問題**: TypeScript使用時の型エラー

**解決方法**:
```typescript
// 適切な型定義の使用
interface ScoreParams {
    bubbleType: string;
    ageRatio: number;
    comboCount?: number;
}

const params: ScoreParams = {
    bubbleType: 'diamond',
    ageRatio: 0.8,
    comboCount: 5
};

const result = calcEngine.calculate('score', 'calculateTotalScore', [params]);
```

### 4. 設定変更の反映遅延

**問題**: 設定変更が即座に反映されない

**解決方法**:
```javascript
// 設定変更の監視と即座の反映
const configManager = getConfigurationManager();

configManager.watch('performance', 'optimization.maxBubbles', (newValue) => {
    // 即座に反映
    gameEngine.setMaxBubbles(newValue);
});

// キャッシュのクリア
configManager.clearCache('performance');
```

## 移行後の検証

### 1. 機能テスト

```javascript
// 基本機能の動作確認
const gameConfig = getGameConfig();
const calcEngine = getCalculationEngine();

// スコア計算の検証
const testScore = calcEngine.calculate('score', 'calculateTotalScore', [{
    bubbleType: 'normal',
    ageRatio: 0.5,
    comboCount: 1
}]);

console.assert(testScore.baseScore === 15, 'スコア計算が正しくありません');
```

### 2. パフォーマンステスト

```javascript
// パフォーマンスの測定
const startTime = performance.now();

for (let i = 0; i < 1000; i++) {
    calcEngine.calculate('score', 'calculateBaseScore', ['normal', 0.5]);
}

const endTime = performance.now();
console.log(`1000回の計算時間: ${endTime - startTime}ms`);

// キャッシュ効率の確認
const cacheStats = calcEngine.getCacheStats();
console.log('キャッシュ効率:', cacheStats);
```

### 3. メモリ使用量の確認

```javascript
// メモリ使用量の監視
const memoryBefore = performance.memory?.usedJSHeapSize || 0;

// 大量の計算処理
for (let i = 0; i < 10000; i++) {
    calcEngine.calculate('balance', 'calculateItemCost', ['scoreMultiplier', i % 10]);
}

const memoryAfter = performance.memory?.usedJSHeapSize || 0;
console.log(`メモリ使用量の増加: ${(memoryAfter - memoryBefore) / 1024 / 1024}MB`);
```

## 移行完了後のメンテナンス

### 1. 定期的な設定の見直し

```javascript
// 月次での設定値の見直し
const configManager = getConfigurationManager();
const performanceStats = configManager.getPerformanceStats();

if (performanceStats.hitRate < 80) {
    console.warn('キャッシュ効率が低下しています');
    // 設定の最適化を実施
}
```

### 2. 新機能の追加

```javascript
// 新しい設定項目の追加
configManager.setDefaultValue('game', 'newFeature.enabled', true);
configManager.setValidationRule('game', 'newFeature.enabled', {
    type: 'boolean'
});
```

### 3. ドキュメントの更新

- API仕様書の更新
- 使用例の追加
- トラブルシューティングガイドの更新

## サポートとヘルプ

### 移行に関する質問

移行中に問題が発生した場合は、以下の情報を含めて報告してください：

1. 使用していた旧API
2. 移行しようとしている新API
3. エラーメッセージ
4. 期待する動作と実際の動作

### デバッグ情報の取得

```javascript
// デバッグ情報の収集
const configManager = getConfigurationManager();
const calcEngine = getCalculationEngine();

const debugInfo = {
    configStats: configManager.getPerformanceStats(),
    cacheStats: calcEngine.getCacheStats(),
    registeredCalculators: calcEngine.getRegisteredCalculators()
};

console.log('デバッグ情報:', JSON.stringify(debugInfo, null, 2));
```

## 関連ドキュメント

- [API ドキュメント](./configuration-system-api.md)
- [設計ドキュメント](../specs/configuration-refactoring/design.md)
- [要件定義書](../specs/configuration-refactoring/requirements.md)
- [トラブルシューティングガイド](./troubleshooting-guide.md)