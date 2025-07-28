# パフォーマンス最適化ガイド

## 概要

このドキュメントは、BubblePop (awaputi) ゲームのパフォーマンス最適化システムの使用方法と最適化手法について説明します。

## 更新履歴

- **2025-01-28**: Task 14完了 - 新機能追加、API拡張、トラブルシューティング強化
- **2025-01-27**: 初版作成

## パフォーマンス最適化システム概要

### 主要コンポーネント

1. **PerformanceOptimizer** - 中核最適化エンジン（拡張済み）
2. **FrameStabilizer** - フレームレート安定化
3. **MemoryManager** - インテリジェントメモリ管理
4. **PerformanceWarningSystem** - リアルタイム警告システム
5. **AdaptiveQualityController** - 動的品質制御
6. **AdvancedRenderingOptimizer** - 高度レンダリング最適化
7. **ParticlePerformanceOptimizer** - パーティクル効果最適化
8. **MobilePerformanceOptimizer** - モバイル最適化
9. **PerformanceMonitoringSystem** - 監視・診断システム
10. **PerformanceDiagnostics** - 自動診断・問題特定
11. **PerformanceTestSuite** - 自動化テストスイート
12. **PerformanceErrorRecoverySystem** - エラー検出・回復
13. **PerformanceConfigurationIntegration** - 設定統合管理

### 新機能概要（Task 1-13実装）

- **予測的最適化**: 将来的なパフォーマンス問題を予測し、事前に対処
- **インテリジェントメモリ管理**: パターン分析によるリーク検出と自動クリーンアップ
- **リアルタイム警告**: ユーザーフレンドリーな警告とトラブルシューティング提案
- **統合テストシステム**: 包括的なパフォーマンステストと検証

## 基本的な使用方法

### 1. システム初期化

```javascript
// パフォーマンス最適化システムの初期化
import { PerformanceOptimizer } from './src/utils/PerformanceOptimizer.js';
import { FrameStabilizer } from './src/utils/FrameStabilizer.js';
import { MemoryManager } from './src/utils/MemoryManager.js';
import { PerformanceWarningSystem } from './src/utils/PerformanceWarningSystem.js';

// システム初期化
const performanceOptimizer = new PerformanceOptimizer();
await performanceOptimizer.initialize();

const frameStabilizer = new FrameStabilizer();
await frameStabilizer.initialize();

const memoryManager = new MemoryManager();
await memoryManager.initialize();

// 警告システムの初期化（新機能）
const warningSystem = new PerformanceWarningSystem();
await warningSystem.initialize();

// 最適化の開始
await performanceOptimizer.startOptimization();
await frameStabilizer.startStabilization();
await memoryManager.startMemoryManagement();

// 統合初期化（推奨）
import { initializePerformanceSystem } from './src/utils/PerformanceSystemInitializer.js';

const performanceSystem = await initializePerformanceSystem({
    enableWarnings: true,
    enableDiagnostics: true,
    enableErrorRecovery: true
});
```

### 2. 監視システムの起動

```javascript
import { PerformanceMonitoringSystem } from './src/utils/PerformanceMonitoringSystem.js';

const monitoring = new PerformanceMonitoringSystem();
await monitoring.initialize();

// 監視開始（ダッシュボード付き）
await monitoring.startMonitoring({
    enableDashboard: true,
    enableAlerts: true,
    interval: 1000 // 1秒間隔
});
```

### 3. エラー処理・回復システム

```javascript
import { PerformanceErrorRecoverySystem } from './src/utils/PerformanceErrorRecoverySystem.js';

const errorRecovery = new PerformanceErrorRecoverySystem();
await errorRecovery.initialize();

// エラー監視開始
await errorRecovery.startErrorMonitoring();
```

## 詳細機能ガイド

### フレームレート最適化

#### 目標設定
```javascript
// フレームレート目標の設定
await frameStabilizer.setTargetFPS(60);
await frameStabilizer.setMinimumFPS(30);

// 安定化の開始（拡張オプション）
await frameStabilizer.enableStabilization({
    adaptiveTargeting: true,
    stabilityThreshold: 5, // 5ms以内の変動を許容
    optimizationMode: 'aggressive',
    // 新機能
    predictiveStabilization: true,
    framePacing: 'vsync-aligned',
    jitterCompensation: true
});
```

#### 予測的フレーム安定化（新機能）
```javascript
// フレーム予測の有効化
await frameStabilizer.enablePredictiveStabilization({
    historySize: 100,
    predictionHorizon: 5,
    adaptiveThreshold: true
});

// フレーム分散解析
const varianceAnalysis = await frameStabilizer.analyzeFrameVariance();
console.log('Frame time stability:', varianceAnalysis.stabilityScore);
console.log('Jitter level:', varianceAnalysis.jitterLevel);
console.log('Recommendations:', varianceAnalysis.recommendations);
```

#### フレーム監視
```javascript
// フレーム統計の取得
const frameStats = frameStabilizer.getFrameStatistics();
console.log('Average FPS:', frameStats.averageFPS);
console.log('Frame variance:', frameStats.variance);
console.log('Stability score:', frameStats.stabilityScore);
```

### メモリ管理

#### 自動クリーンアップ設定
```javascript
// メモリ管理設定（拡張版）
await memoryManager.configure({
    maxMemoryUsage: 150 * 1024 * 1024, // 150MB上限
    gcInterval: 60000, // 60秒間隔でGC
    aggressiveCleanup: false,
    leakDetectionEnabled: true,
    // 新機能
    intelligentCleanup: true,
    patternAnalysis: true,
    proactiveCleanup: true,
    memoryPressureThresholds: {
        low: 0.5,
        medium: 0.7,
        high: 0.85,
        critical: 0.95
    }
});

// 手動クリーンアップ
await memoryManager.performCleanup();
```

#### インテリジェントリーク検出（新機能）
```javascript
// リーク検出の開始
const leakDetection = await memoryManager.startLeakDetection({
    sampleInterval: 5000,
    analysisWindow: 60000,
    sensitivityLevel: 'high'
});

// リーク検出結果の確認
leakDetection.onLeakDetected((leak) => {
    console.warn('Memory leak detected:', leak);
    console.log('Leak source:', leak.source);
    console.log('Growth rate:', leak.growthRate, 'bytes/second');
    console.log('Suggested actions:', leak.suggestedActions);
});

// パターン分析
const memoryPatterns = await memoryManager.analyzeMemoryPatterns();
console.log('Memory usage patterns:', memoryPatterns);
```

#### メモリ監視
```javascript
// メモリ使用状況の監視
memoryManager.onMemoryPressure((level) => {
    console.log('Memory pressure level:', level);
    if (level === 'high') {
        // 緊急クリーンアップ
        memoryManager.performEmergencyCleanup();
    }
});
```

### 動的品質制御

#### 品質レベル設定
```javascript
import { AdaptiveQualityController } from './src/utils/AdaptiveQualityController.js';

const qualityController = new AdaptiveQualityController();
await qualityController.initialize();

// 品質レベルの設定
await qualityController.setQualityLevel('high'); // low, medium, high, ultra

// 自動調整の有効化
await qualityController.enableAdaptiveQuality({
    targetFPS: 60,
    adjustmentSpeed: 'medium', // slow, medium, fast
    maintainMinimum: 'medium'
});
```

#### カスタム品質設定
```javascript
// カスタム品質プロファイル
const customProfile = {
    particleCount: 100,
    shadowQuality: 'medium',
    textureQuality: 'high',
    antiAliasing: true,
    postProcessing: false
};

await qualityController.applyCustomProfile(customProfile);
```

### レンダリング最適化

#### 高度レンダリング機能
```javascript
import { AdvancedRenderingOptimizer } from './src/utils/AdvancedRenderingOptimizer.js';

const renderOptimizer = new AdvancedRenderingOptimizer();
await renderOptimizer.initialize();

// レンダリング最適化の有効化
await renderOptimizer.enableOptimizations({
    dirtyRegionTracking: true,
    viewportCulling: true,
    batchRendering: true,
    layerCaching: true,
    spatialPartitioning: true
});
```

#### パフォーマンス設定
```javascript
// レンダリング設定
await renderOptimizer.configure({
    maxBatchSize: 1000,
    cullingMargin: 50, // ピクセル
    cacheUpdateThreshold: 16.67 // ms
});
```

### パーティクル効果最適化

#### パーティクル制御
```javascript
import { ParticlePerformanceOptimizer } from './src/utils/ParticlePerformanceOptimizer.js';

const particleOptimizer = new ParticlePerformanceOptimizer();
await particleOptimizer.initialize();

// パーティクル最適化設定
await particleOptimizer.configure({
    maxParticles: 500,
    importanceThreshold: 0.3,
    qualityScaling: true,
    batchRendering: true
});

// 動的制御
await particleOptimizer.setQualityLevel('medium');
await particleOptimizer.enableAdaptiveOptimization();
```

### モバイル最適化

#### モバイル検出と最適化
```javascript
import { MobilePerformanceOptimizer } from './src/utils/MobilePerformanceOptimizer.js';

const mobileOptimizer = new MobilePerformanceOptimizer();
await mobileOptimizer.initialize();

// デバイス能力の評価
const deviceCapabilities = await mobileOptimizer.assessDeviceCapabilities();
console.log('Device score:', deviceCapabilities.overallScore);

// モバイル最適化の適用
if (mobileOptimizer.isMobileDevice()) {
    await mobileOptimizer.applyMobileOptimizations();
}
```

#### バッテリー最適化
```javascript
// バッテリー監視
mobileOptimizer.onBatteryStatusChange((status) => {
    if (status.level < 0.2) {
        // 低バッテリー時の最適化
        mobileOptimizer.enablePowerSavingMode();
    }
});
```

## 設定システム統合

### 設定管理
```javascript
import { PerformanceConfigurationIntegration } from './src/utils/PerformanceConfigurationIntegration.js';

const configIntegration = new PerformanceConfigurationIntegration();
await configIntegration.initialize();

// 設定の更新
await configIntegration.updatePerformanceConfig({
    'frameStabilization.targetFPS': 50,
    'memoryManagement.maxUsage': 100 * 1024 * 1024,
    'qualityControl.autoAdjust': true
});
```

### 設定プロファイル
```javascript
// プロファイルの作成
await configIntegration.createConfigProfile('gaming', {
    'frameStabilization.targetFPS': 60,
    'qualityControl.qualityLevel': 'high',
    'mobile.batteryOptimization': false
});

// プロファイルの読み込み
await configIntegration.loadConfigProfile('gaming');
```

## 監視・診断

### パフォーマンス監視
```javascript
// リアルタイム監視
const monitoring = new PerformanceMonitoringSystem();
await monitoring.startMonitoring({
    enableDashboard: true,
    enableHistory: true,
    enableAlerts: true
});

// カスタムメトリクスの追加
monitoring.addCustomMetric('bubble_count', 150, 'gameplay');

// アラート設定
monitoring.setAlert('fps', 45, 'below', (alert) => {
    console.log('FPS alert:', alert);
});
```

### 診断システム
```javascript
import { PerformanceDiagnostics } from './src/utils/PerformanceDiagnostics.js';

const diagnostics = new PerformanceDiagnostics();
await diagnostics.initialize();

// 包括的診断の実行
const diagnosticResult = await diagnostics.diagnose({
    duration: 30000, // 30秒
    includeBottleneckAnalysis: true,
    includeAnomalyDetection: true
});

console.log('System health:', diagnosticResult.session.results.overallAssessment.healthScore);
console.log('Recommendations:', diagnosticResult.session.results.recommendations);
```

## テスト・検証

### 統合テスト
```javascript
import { PerformanceIntegrationTesting } from './src/utils/PerformanceIntegrationTesting.js';

const integrationTesting = new PerformanceIntegrationTesting();
await integrationTesting.initialize();

// 包括的テストの実行
const testResult = await integrationTesting.runComprehensiveIntegrationTests({
    includeE2ETests: true,
    includeMobileTests: true,
    timeout: 300000 // 5分
});

console.log('Test result:', testResult.passed ? 'PASSED' : 'FAILED');
console.log('Summary:', testResult.summary);
```

### パフォーマンステスト
```javascript
import { PerformanceTestSuite } from './src/utils/PerformanceTestSuite.js';

const testSuite = new PerformanceTestSuite();
await testSuite.initialize();

// テストの実行
const testResults = await testSuite.runTests();
console.log('Performance tests:', testResults.overallPassed ? 'PASSED' : 'FAILED');
```

## 最適化のベストプラクティス

### 1. 段階的最適化

1. **監視の確立** - まず監視システムを導入してベースラインを測定
2. **フレームレート安定化** - 最も体感に影響するフレームレートから最適化
3. **メモリ最適化** - 安定性向上のためメモリ管理を改善
4. **品質制御** - 動的品質制御で継続的な最適化
5. **高度最適化** - レンダリング・パーティクル最適化で微調整

### 2. 設定値の推奨

#### デスクトップ環境
```javascript
const desktopConfig = {
    frameStabilization: {
        targetFPS: 60,
        minFPS: 45,
        stabilityThreshold: 5
    },
    memoryManagement: {
        maxUsage: 200 * 1024 * 1024, // 200MB
        gcInterval: 60000,
        aggressiveCleanup: false
    },
    qualityControl: {
        defaultLevel: 'high',
        autoAdjust: true,
        adjustmentSpeed: 'medium'
    }
};
```

#### モバイル環境
```javascript
const mobileConfig = {
    frameStabilization: {
        targetFPS: 45,
        minFPS: 30,
        stabilityThreshold: 8
    },
    memoryManagement: {
        maxUsage: 100 * 1024 * 1024, // 100MB
        gcInterval: 30000,
        aggressiveCleanup: true
    },
    qualityControl: {
        defaultLevel: 'medium',
        autoAdjust: true,
        adjustmentSpeed: 'fast'
    },
    mobile: {
        batteryOptimization: true,
        thermalManagement: true,
        touchOptimization: true
    }
};
```

### 3. 監視項目

以下のメトリクスを継続的に監視することを推奨：

- **フレームレート** - 目標60fps、最低30fps
- **メモリ使用量** - デスクトップ200MB、モバイル100MB以下
- **レンダリング時間** - 16.67ms以下（60fps維持）
- **入力遅延** - 50ms以下
- **バッテリー消費** - モバイルで800mW以下

### 4. トラブルシューティング

#### フレームレート低下
1. 品質レベルを下げる
2. パーティクル数を減らす
3. レンダリング最適化を有効化
4. 他のタブ・アプリケーションを閉じる

**高度な診断（新機能）:**
```javascript
// フレームレート問題の詳細診断
const frameRateDiagnosis = await diagnostics.diagnoseFrameRateIssues();
console.log('Root cause:', frameRateDiagnosis.rootCause);
console.log('Bottlenecks:', frameRateDiagnosis.bottlenecks);
console.log('Optimization suggestions:', frameRateDiagnosis.suggestions);

// 自動修復の試行
if (frameRateDiagnosis.canAutoFix) {
    await frameRateDiagnosis.applyAutoFix();
}
```

#### メモリ不足
1. メモリクリーンアップを実行
2. キャッシュをクリア
3. オブジェクトプールサイズを調整
4. ブラウザを再起動

**メモリリーク診断（新機能）:**
```javascript
// メモリリークの詳細分析
const leakAnalysis = await memoryManager.performLeakAnalysis();
if (leakAnalysis.leaksDetected) {
    console.log('Leaks found:', leakAnalysis.leaks);
    
    // 各リークに対する対処
    for (const leak of leakAnalysis.leaks) {
        console.log(`Leak in ${leak.component}:`, leak.details);
        if (leak.autoFixAvailable) {
            await leak.applyFix();
        }
    }
}
```

#### モバイルでの問題
1. バッテリー最適化を有効化
2. 品質レベルを下げる
3. バックグラウンドアプリを終了
4. デバイスを再起動

**モバイル固有の診断（新機能）:**
```javascript
// モバイルパフォーマンス診断
const mobileDiagnosis = await mobileOptimizer.diagnoseMobileIssues();
console.log('Device capabilities:', mobileDiagnosis.deviceCapabilities);
console.log('Performance bottlenecks:', mobileDiagnosis.bottlenecks);
console.log('Recommended settings:', mobileDiagnosis.recommendedSettings);

// 最適設定の自動適用
await mobileOptimizer.applyOptimalSettings(mobileDiagnosis.recommendedSettings);
```

#### 一般的なエラーと解決策

**警告システムメッセージの対処法:**
```javascript
// 警告メッセージごとの対処
warningSystem.onWarning((warning) => {
    switch(warning.type) {
        case 'high_memory_usage':
            // メモリ使用量が高い場合
            memoryManager.performIntelligentCleanup();
            break;
            
        case 'frame_drops':
            // フレームドロップが発生した場合
            qualityController.reduceQualityLevel();
            break;
            
        case 'thermal_throttling':
            // 熱によるスロットリングの場合
            mobileOptimizer.enableThermalProtection();
            break;
            
        default:
            // その他の警告
            console.log('Applying suggestion:', warning.suggestion);
            warning.applySuggestion();
    }
});
```

## API リファレンス

### PerformanceOptimizer（拡張版）

#### メソッド
- `initialize()` - システム初期化
- `startOptimization()` - 最適化開始
- `stopOptimization()` - 最適化停止
- `getPerformanceMetrics()` - 性能メトリクス取得
- `optimizeForTarget(target)` - 目標値最適化
- **新規:** `analyzeFrameStability()` - フレーム安定性解析
- **新規:** `predictPerformanceIssues()` - パフォーマンス問題予測
- **新規:** `getDetailedStatistics()` - 詳細統計情報取得
- **新規:** `enableProactiveOptimization(options)` - プロアクティブ最適化有効化

### FrameStabilizer

#### メソッド
- `setTargetFPS(fps)` - 目標FPS設定
- `enableStabilization(options)` - 安定化有効化
- `getFrameStatistics()` - フレーム統計取得
- `reportFrameDrop(fps)` - フレーム低下報告
- **新規:** `analyzeFrameVariance()` - フレーム分散解析
- **新規:** `enablePredictiveStabilization(options)` - 予測的安定化有効化
- **新規:** `optimizeFramePacing()` - フレームペーシング最適化
- **新規:** `getStabilityScore()` - 安定性スコア取得

### MemoryManager

#### メソッド
- `configure(options)` - 設定変更
- `performCleanup()` - クリーンアップ実行
- `getMemoryStatistics()` - メモリ統計取得
- `onMemoryPressure(callback)` - メモリプレッシャー監視
- **新規:** `startLeakDetection(options)` - リーク検出開始
- **新規:** `analyzeMemoryPatterns()` - メモリパターン分析
- **新規:** `performIntelligentCleanup()` - インテリジェントクリーンアップ
- **新規:** `getLeakDetectionReport()` - リーク検出レポート取得
- **新規:** `enableProactiveCleanup(options)` - プロアクティブクリーンアップ有効化

### PerformanceWarningSystem（新規）

#### メソッド
- `initialize()` - システム初期化
- `showWarning(type, message, suggestions)` - 警告表示
- `hideWarning()` - 警告非表示
- `onWarning(callback)` - 警告イベントリスナー
- `getWarningHistory()` - 警告履歴取得
- `configureSeverityLevels(levels)` - 重要度レベル設定
- `enableAutoSuggestions(enabled)` - 自動提案有効化

### AdaptiveQualityController

#### メソッド
- `setQualityLevel(level)` - 品質レベル設定
- `enableAdaptiveQuality(options)` - 自動品質制御有効化
- `getCurrentQuality()` - 現在の品質取得
- `applyCustomProfile(profile)` - カスタムプロファイル適用
- **新規:** `validateQualitySettings(settings)` - 品質設定検証
- **新規:** `rollbackQualityChange()` - 品質変更ロールバック
- **新規:** `getQualityHistory()` - 品質変更履歴取得
- **新規:** `saveUserPreferences()` - ユーザー設定保存

## パフォーマンス最適化チェックリスト

### 初期セットアップ
- [ ] パフォーマンス最適化システムの初期化
- [ ] 監視システムの起動
- [ ] 警告システムの設定
- [ ] エラー回復システムの有効化
- [ ] ベースラインメトリクスの記録

### 定期メンテナンス
- [ ] 週次パフォーマンスレポートの確認
- [ ] メモリリーク診断の実行
- [ ] フレーム安定性の検証
- [ ] 品質設定の見直し
- [ ] モバイルデバイステストの実施

### トラブルシューティング時
- [ ] 診断システムの実行
- [ ] ボトルネック分析の確認
- [ ] 推奨事項の適用
- [ ] テストスイートの実行
- [ ] 改善効果の測定

## よくある質問（FAQ）

### Q: パフォーマンス最適化システムがゲームを遅くしている？
**A:** 最適化システム自体のオーバーヘッドは最小限（通常1-2%）に設計されています。監視間隔を調整することで、さらに軽減できます。

### Q: メモリリークの警告が頻繁に出るが正常？
**A:** 小規模な一時的なメモリ増加は正常です。継続的な増加パターンのみが真のリークとして検出されます。感度設定を調整できます。

### Q: モバイルで最適な設定は？
**A:** デバイス能力評価を実行し、推奨設定を自動適用することをお勧めします。一般的には品質レベル「medium」、バッテリー最適化「有効」が適切です。

### Q: フレームレートが目標値に達しない
**A:** 診断システムを実行してボトルネックを特定してください。多くの場合、パーティクル数の削減や品質レベルの調整で改善されます。

## サポート・お問い合わせ

パフォーマンス最適化に関するご質問やサポートが必要な場合は、以下をご確認ください：

1. **ログの確認** - ブラウザのコンソールでエラー・警告を確認
2. **診断の実行** - PerformanceDiagnostics を使用して自動診断
3. **設定の確認** - 設定値が環境に適しているか確認
4. **ドキュメント** - 本ガイドの該当セクションを参照
5. **警告システム** - 表示される提案に従って対処
6. **テストスイート** - パフォーマンステストで問題を特定

最適なパフォーマンスを得るために、継続的な監視と調整を行うことを強く推奨します。

## 関連ドキュメント

- [パフォーマンス監視ガイド](./performance-monitoring-guide.md)
- [トラブルシューティングガイド](./troubleshooting-guide.md)
- [設定管理ガイド](./configuration-management-guide.md)
- [システム設計詳細](./system-design-detailed.md)