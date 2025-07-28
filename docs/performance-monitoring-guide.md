# パフォーマンス監視ガイド

## 概要

このドキュメントでは、BubblePop (awaputi) ゲームのパフォーマンス監視システムの設定、使用方法、メトリクスの解釈について詳しく説明します。

## 更新履歴

- **2025-01-28**: Task 14完了 - 新機能追加、高度な監視機能、トラブルシューティング拡充
- **2025-01-27**: 初版作成

## 監視システム概要

### 主要コンポーネント

1. **PerformanceMonitoringSystem** - 中央監視システム（拡張済み）
2. **PerformanceDashboard** - リアルタイムダッシュボード
3. **PerformanceDiagnostics** - 自動診断システム（ボトルネック分析強化）
4. **PerformanceTestSuite** - テスト・検証システム
5. **PerformanceErrorRecoverySystem** - エラー検出・回復システム
6. **PerformanceIntegrationTesting** - 統合テストシステム（新規）

## 基本的なセットアップ

### 1. 監視システムの初期化

```javascript
import { PerformanceMonitoringSystem } from './src/utils/PerformanceMonitoringSystem.js';

// 監視システムの作成
const monitoring = new PerformanceMonitoringSystem();
await monitoring.initialize();

// 基本的な監視開始
await monitoring.startMonitoring({
    interval: 1000,           // 1秒間隔でデータ収集
    enableDashboard: true,    // ダッシュボード表示
    enableHistory: true,      // 履歴保存
    enableAlerts: true,       // アラート機能
    enableRealtimeStream: true // リアルタイムストリーミング
});
```

### 2. ダッシュボードの表示

```javascript
// ダッシュボードの手動制御
await monitoring.toggleDashboard(); // 表示切り替え

// 監視ステータスの確認
const status = monitoring.getMonitoringStatus();
console.log('Monitoring active:', status.active);
console.log('Metrics count:', status.metricsCount);
console.log('Data points:', status.dataPoints);
```

## 監視メトリクス

### 1. フレームレートメトリクス

#### 取得可能な指標
- **現在FPS** - リアルタイムフレームレート
- **平均FPS** - 過去の平均フレームレート
- **フレーム分散** - フレーム時間のばらつき
- **ドロップフレーム数** - 低フレームレートの発生回数
- **フレーム安定性スコア** - フレームレートの安定性指標（新規）
- **ジッターレベル** - フレーム間隔の変動度（新規）

#### 監視例
```javascript
// フレームレート履歴の取得
const frameRateHistory = monitoring.getMetricsHistory('fps', 3600000); // 1時間分

// 統計情報の取得
const frameRateStats = monitoring.getAggregatedMetrics('fps', 3600000, 'average');
console.log('Average FPS (1h):', frameRateStats);

// アラート設定
monitoring.setAlert('fps', 45, 'below', (alert) => {
    console.warn('Low FPS detected:', alert.value);
});
```

### 2. メモリメトリクス

#### 取得可能な指標
- **使用メモリ** - 現在のメモリ使用量
- **メモリ成長率** - メモリ増加の速度
- **GC頻度** - ガベージコレクションの頻度
- **メモリリーク** - 継続的なメモリ増加の検出
- **リークソース** - メモリリークの発生源特定（新規）
- **メモリプレッシャーレベル** - メモリ使用率に基づく圧迫度（新規）

#### 監視例
```javascript
// メモリ使用量の監視
monitoring.setAlert('memory_used', 150 * 1024 * 1024, 'above', (alert) => {
    console.warn('High memory usage:', alert.value / 1024 / 1024, 'MB');
});

// メモリ成長率の監視
monitoring.setAlert('memory_growth', 1024 * 1024, 'above', (alert) => {
    console.warn('High memory growth rate:', alert.value / 1024, 'KB/s');
});
```

### 3. レンダリングメトリクス

#### 取得可能な指標
- **レンダリング時間** - フレーム描画にかかる時間
- **描画コール数** - レンダリングAPI呼び出し回数
- **三角形数** - 描画される三角形の数
- **レンダリング効率** - 描画効率の指標

#### 監視例
```javascript
// レンダリング時間の監視
monitoring.setAlert('render_time', 33.33, 'above', (alert) => {
    console.warn('Slow rendering detected:', alert.value, 'ms');
});

// 描画効率の監視
const renderingHistory = monitoring.getMetricsHistory('render_time', 600000); // 10分間
const efficiency = renderingHistory.map(entry => 16.67 / entry.value);
console.log('Rendering efficiency trend:', efficiency);
```

### 4. ネットワークメトリクス

#### 取得可能な指標
- **ネットワーク遅延** - 通信の遅延時間
- **帯域幅使用量** - データ転送量
- **エラー率** - 通信エラーの発生率
- **接続タイプ** - ネットワーク接続の種類

#### 監視例
```javascript
// ネットワーク遅延の監視
monitoring.setAlert('network_latency', 200, 'above', (alert) => {
    console.warn('High network latency:', alert.value, 'ms');
});

// ネットワーク品質の評価
const networkMetrics = monitoring.getCurrentMetrics();
const networkQuality = networkMetrics.get('network_latency') < 100 ? 'good' : 'poor';
console.log('Network quality:', networkQuality);
```

### 5. ユーザーインタラクションメトリクス

#### 取得可能な指標
- **入力遅延** - ユーザー入力から反応までの時間
- **応答時間** - システム応答時間
- **インタラクション数** - ユーザー操作の回数
- **応答率** - 正常に処理された操作の割合

#### 監視例
```javascript
// 入力遅延の監視
monitoring.setAlert('input_lag', 50, 'above', (alert) => {
    console.warn('High input lag detected:', alert.value, 'ms');
});

// ユーザー体験品質の評価
const interactionMetrics = monitoring.getCurrentMetrics();
const uxQuality = interactionMetrics.get('input_lag') < 30 ? 'excellent' : 'needs_improvement';
console.log('UX Quality:', uxQuality);
```

## アラート設定

### 1. 基本的なアラート設定

```javascript
// フレームレートアラート
monitoring.setAlert('fps', 45, 'below', (alert) => {
    console.warn('FPS below threshold:', alert);
    // 自動的な品質調整
    if (window.AdaptiveQualityController) {
        window.AdaptiveQualityController.reduceQuality();
    }
});

// メモリアラート
monitoring.setAlert('memory_used', 150 * 1024 * 1024, 'above', (alert) => {
    console.warn('Memory usage high:', alert);
    // 自動的なメモリクリーンアップ
    if (window.MemoryManager) {
        window.MemoryManager.performCleanup();
    }
});
```

### 2. 複合条件アラート

```javascript
// カスタムアラート関数
function checkPerformanceHealth() {
    const metrics = monitoring.getCurrentMetrics();
    const fps = metrics.get('fps') || 0;
    const memory = metrics.get('memory_used') || 0;
    const renderTime = metrics.get('render_time') || 0;
    
    // 複合的な性能評価
    let healthScore = 100;
    if (fps < 45) healthScore -= 30;
    if (memory > 150 * 1024 * 1024) healthScore -= 20;
    if (renderTime > 25) healthScore -= 20;
    
    if (healthScore < 50) {
        console.warn('Performance health score low:', healthScore);
        // 緊急最適化の実行
        triggerEmergencyOptimization();
    }
}

// 定期的なヘルスチェック
setInterval(checkPerformanceHealth, 10000); // 10秒間隔
```

### 3. 段階的アラート

```javascript
// FPSの段階的アラート
monitoring.setAlert('fps', 55, 'below', (alert) => {
    console.info('FPS slightly low:', alert.value);
    // 軽微な最適化
});

monitoring.setAlert('fps', 45, 'below', (alert) => {
    console.warn('FPS concerning:', alert.value);
    // 中程度の最適化
});

monitoring.setAlert('fps', 30, 'below', (alert) => {
    console.error('FPS critical:', alert.value);
    // 緊急最適化
});
```

## 履歴データ分析

### 1. トレンド分析

```javascript
// 1時間のFPSトレンド分析
const fpsHistory = monitoring.getMetricsHistory('fps', 3600000);
const trendAnalysis = analyzeTrend(fpsHistory);

function analyzeTrend(history) {
    if (history.length < 2) return 'insufficient_data';
    
    const recent = history.slice(-10); // 最新10データポイント
    const older = history.slice(-20, -10); // その前の10データポイント
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + entry.value, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.05) return 'improving';
    if (change < -0.05) return 'degrading';
    return 'stable';
}

console.log('FPS trend:', trendAnalysis);
```

### 2. パフォーマンス統計

```javascript
// 日次パフォーマンスレポート生成
async function generateDailyReport() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    const report = await monitoring.generateReport(24 * 60 * 60 * 1000);
    
    console.log('=== Daily Performance Report ===');
    console.log('Report Period:', new Date(report.timeRange.startTime), 'to', new Date(report.timeRange.endTime));
    console.log('Overall Health:', report.summary.overallHealth);
    console.log('Metrics Summary:');
    
    for (const [metricId, stats] of report.metrics) {
        console.log(`  ${metricId}:`);
        console.log(`    Current: ${stats.current}`);
        console.log(`    Average: ${stats.average.toFixed(2)}`);
        console.log(`    Min/Max: ${stats.min}/${stats.max}`);
        console.log(`    Trend: ${stats.trend}`);
        console.log(`    Samples: ${stats.samplesCount}`);
    }
    
    if (report.alerts.length > 0) {
        console.log('Alerts:', report.alerts.length);
        report.alerts.forEach(alert => {
            console.log(`  - ${alert.type}: ${alert.message}`);
        });
    }
}

// 毎日午前0時にレポート生成
scheduleDaily(generateDailyReport, '00:00');
```

### 3. パフォーマンス比較

```javascript
// 異なる期間のパフォーマンス比較
function comparePerformancePeriods() {
    const thisWeek = monitoring.getAggregatedMetrics('fps', 7 * 24 * 60 * 60 * 1000, 'average');
    const lastWeek = monitoring.getAggregatedMetrics('fps', 7 * 24 * 60 * 60 * 1000, 'average', 7 * 24 * 60 * 60 * 1000);
    
    const change = ((thisWeek - lastWeek) / lastWeek) * 100;
    
    console.log('Week-over-week FPS change:', change.toFixed(1) + '%');
    
    if (change > 5) {
        console.log('✅ Performance improved significantly');
    } else if (change < -5) {
        console.log('⚠️ Performance degraded significantly');
    } else {
        console.log('➡️ Performance stable');
    }
}
```

## カスタムメトリクス

### 1. ゲーム固有メトリクス

```javascript
// ゲーム固有のメトリクス追加
monitoring.addCustomMetric('bubble_count', getBubbleCount(), 'gameplay');
monitoring.addCustomMetric('player_score', getPlayerScore(), 'gameplay');
monitoring.addCustomMetric('combo_multiplier', getComboMultiplier(), 'gameplay');

// ゲームパフォーマンスの監視
function monitorGameplayMetrics() {
    const bubbleCount = getBubbleCount();
    const fps = monitoring.getCurrentMetrics().get('fps');
    
    // バブル数とFPSの相関監視
    if (bubbleCount > 100 && fps < 45) {
        console.warn('High bubble count affecting performance');
        // バブル数の制限
        limitBubbleSpawn();
    }
}

// ゲームループに統合
setInterval(monitorGameplayMetrics, 1000);
```

### 2. ビジネスメトリクス

```javascript
// ユーザーエクスペリエンス関連メトリクス
monitoring.addCustomMetric('session_duration', getSessionDuration(), 'ux');
monitoring.addCustomMetric('user_interactions', getUserInteractionCount(), 'ux');
monitoring.addCustomMetric('error_rate', getErrorRate(), 'quality');

// UX品質の評価
function evaluateUXQuality() {
    const metrics = monitoring.getCurrentMetrics();
    const fps = metrics.get('fps') || 0;
    const inputLag = metrics.get('input_lag') || 0;
    const errorRate = metrics.get('error_rate') || 0;
    
    let uxScore = 100;
    if (fps < 45) uxScore -= 30;
    if (inputLag > 50) uxScore -= 25;
    if (errorRate > 0.05) uxScore -= 20;
    
    monitoring.addCustomMetric('ux_score', uxScore, 'quality');
    
    return uxScore;
}
```

## 監視のベストプラクティス

### 1. 監視間隔の最適化

```javascript
// 環境に応じた監視間隔の調整
const monitoringConfig = {
    development: {
        interval: 500,           // 開発時は詳細監視
        enableDashboard: true,
        enableHistory: true
    },
    production: {
        interval: 2000,          // 本番環境では負荷軽減
        enableDashboard: false,  // ダッシュボードは無効
        enableHistory: true
    },
    mobile: {
        interval: 3000,          // モバイルはさらに間隔を長く
        enableDashboard: false,
        enableHistory: false,    // 履歴は最小限
        enableAlerts: true       // アラートは維持
    }
};

const environment = detectEnvironment();
await monitoring.startMonitoring(monitoringConfig[environment]);
```

### 2. データ保持ポリシー

```javascript
// データ保持期間の設定
await monitoring.startMonitoring({
    retention: {
        realtime: 5 * 60 * 1000,      // リアルタイムデータ: 5分
        shortTerm: 2 * 60 * 60 * 1000, // 短期データ: 2時間
        longTerm: 7 * 24 * 60 * 60 * 1000 // 長期データ: 7日
    }
});
```

### 3. パフォーマンス影響の最小化

```javascript
// 監視システム自体のパフォーマンス監視
function monitorMonitoringOverhead() {
    const startTime = performance.now();
    
    // 監視処理の実行時間測定
    monitoring.collectMetrics().then(() => {
        const overhead = performance.now() - startTime;
        
        if (overhead > 10) { // 10ms以上かかっている場合
            console.warn('Monitoring overhead high:', overhead, 'ms');
            // 監視間隔を調整
            monitoring.adjustInterval(monitoring.currentInterval * 1.5);
        }
    });
}
```

## トラブルシューティング

### 1. 監視システムの問題

#### ダッシュボードが表示されない
```javascript
// ダッシュボードの状態確認
const dashboardStatus = monitoring.dashboard.visible;
console.log('Dashboard visible:', dashboardStatus);

// 強制表示
await monitoring.dashboard.show();

// CSSスタイルの確認
const dashboardElement = document.getElementById('performance-dashboard');
console.log('Dashboard element:', dashboardElement);

// 新機能: ダッシュボード診断
const dashboardDiagnosis = await monitoring.diagnoseDashboardIssues();
if (dashboardDiagnosis.issues.length > 0) {
    console.warn('Dashboard issues:', dashboardDiagnosis.issues);
    // 自動修復の試行
    await dashboardDiagnosis.attemptAutoFix();
}
```

#### データが更新されない
```javascript
// 監視状態の確認
const status = monitoring.getMonitoringStatus();
console.log('Monitoring status:', status);

// データ収集の手動実行
await monitoring.collectAndProcessMetrics();

// 最新メトリクスの確認
const metrics = monitoring.getCurrentMetrics();
console.log('Current metrics:', Object.fromEntries(metrics));
```

### 2. メトリクスの異常値

#### 異常に高い/低い値の調査
```javascript
// 異常値の検出
function detectAnomalies() {
    const history = monitoring.getMetricsHistory('fps', 300000); // 5分間
    const values = history.map(entry => entry.value);
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    
    const anomalies = history.filter(entry => {
        const zScore = Math.abs(entry.value - mean) / stdDev;
        return zScore > 2; // 2標準偏差を超える値
    });
    
    if (anomalies.length > 0) {
        console.warn('Anomalies detected:', anomalies);
    }
    
    return anomalies;
}
```

### 3. アラートの調整

#### 閾値の最適化
```javascript
// 動的閾値の計算
function calculateDynamicThreshold(metricId, percentile = 95) {
    const history = monitoring.getMetricsHistory(metricId, 3600000); // 1時間
    const values = history.map(entry => entry.value).sort((a, b) => a - b);
    
    const index = Math.floor(values.length * percentile / 100);
    const threshold = values[index];
    
    // 閾値の更新
    monitoring.setAlert(metricId, threshold, 'above');
    
    console.log(`Dynamic threshold for ${metricId}: ${threshold}`);
    return threshold;
}

// 週次で閾値を再計算
setInterval(() => {
    calculateDynamicThreshold('fps');
    calculateDynamicThreshold('memory_used');
    calculateDynamicThreshold('render_time');
}, 7 * 24 * 60 * 60 * 1000); // 1週間間隔
```

## 高度な監視設定

### 1. A/B テスト監視

```javascript
// A/Bテスト用の監視設定
function setupABTestMonitoring(testGroup) {
    const metricsPrefix = `ab_test_${testGroup}`;
    
    // テストグループ別のメトリクス収集
    monitoring.addCustomMetric(`${metricsPrefix}_fps`, getCurrentFPS(), 'ab_test');
    monitoring.addCustomMetric(`${metricsPrefix}_engagement`, getEngagementScore(), 'ab_test');
    
    // テスト結果の比較
    if (testGroup === 'control') {
        // コントロールグループの設定
        enableStandardOptimizations();
    } else if (testGroup === 'experimental') {
        // 実験グループの設定
        enableExperimentalOptimizations();
    }
}

// テスト結果の分析
function analyzeABTestResults() {
    const controlFPS = monitoring.getAggregatedMetrics('ab_test_control_fps', 86400000, 'average');
    const experimentalFPS = monitoring.getAggregatedMetrics('ab_test_experimental_fps', 86400000, 'average');
    
    const improvement = ((experimentalFPS - controlFPS) / controlFPS) * 100;
    console.log('Performance improvement:', improvement.toFixed(2) + '%');
    
    return {
        control: controlFPS,
        experimental: experimentalFPS,
        improvement: improvement
    };
}
```

### 2. プロダクション監視

```javascript
// プロダクション環境での堅牢な監視
class ProductionMonitoring {
    constructor() {
        this.monitoring = new PerformanceMonitoringSystem();
        this.errorThreshold = 5; // 5分間で5回エラーが発生したら警告
        this.errorCount = 0;
        this.errorWindowStart = Date.now();
    }
    
    async initialize() {
        await this.monitoring.initialize();
        
        // プロダクション向け設定
        await this.monitoring.startMonitoring({
            interval: 5000,          // 5秒間隔
            enableDashboard: false,  // ダッシュボード無効
            enableHistory: true,
            enableAlerts: true,
            retention: 7 * 24 * 60 * 60 * 1000 // 7日間保持
        });
        
        // 重要なアラートのみ設定
        this.setupCriticalAlerts();
        
        // エラー監視
        this.setupErrorMonitoring();
        
        // 定期レポート
        this.setupPeriodicReporting();
    }
    
    setupCriticalAlerts() {
        // 重要な閾値のみアラート
        this.monitoring.setAlert('fps', 20, 'below', this.handleCriticalFPS.bind(this));
        this.monitoring.setAlert('memory_used', 300 * 1024 * 1024, 'above', this.handleCriticalMemory.bind(this));
    }
    
    handleCriticalFPS(alert) {
        console.error('CRITICAL: FPS extremely low:', alert.value);
        this.sendAlert('critical_fps', alert);
        
        // 緊急フォールバック
        if (window.GracefulDegradationManager) {
            window.GracefulDegradationManager.enterEmergencyMode();
        }
    }
    
    handleCriticalMemory(alert) {
        console.error('CRITICAL: Memory usage extremely high:', alert.value);
        this.sendAlert('critical_memory', alert);
        
        // 緊急メモリクリーンアップ
        if (window.MemoryManager) {
            window.MemoryManager.performEmergencyCleanup();
        }
    }
    
    sendAlert(type, data) {
        // 外部監視システムへの通知
        // (Sentry, DataDog, CloudWatch など)
        console.log('Sending alert to external system:', { type, data });
    }
    
    setupPeriodicReporting() {
        // 1時間ごとのヘルスチェック
        setInterval(() => {
            this.performHealthCheck();
        }, 60 * 60 * 1000);
        
        // 日次レポート
        setInterval(() => {
            this.generateDailyReport();
        }, 24 * 60 * 60 * 1000);
    }
    
    async performHealthCheck() {
        const systemHealth = await this.monitoring.getSystemHealth();
        console.log('System health check:', systemHealth);
        
        if (systemHealth.healthScore < 70) {
            this.sendAlert('health_degradation', systemHealth);
        }
    }
}

// プロダクション監視の開始
const productionMonitoring = new ProductionMonitoring();
await productionMonitoring.initialize();
```

## 監視チェックリスト

### 初期設定
- [ ] 監視システムの初期化
- [ ] ダッシュボードの設定
- [ ] アラート闾値の設定
- [ ] カスタムメトリクスの追加
- [ ] データ保持ポリシーの確立

### 日次監視タスク
- [ ] パフォーマンスレポートの確認
- [ ] 異常値のチェック
- [ ] アラート履歴のレビュー
- [ ] トレンド分析
- [ ] 闾値の最適化

### 問題発生時の対応
- [ ] 診断システムの実行
- [ ] ボトルネックの特定
- [ ] 影響範囲の評価
- [ ] 改善策の実施
- [ ] 効果の検証

## よくある質問（FAQ）

### Q: 監視システム自体がパフォーマンスに影響している？
**A:** 監視システムのオーバーヘッドは通常 1-2% 以下です。監視間隔を調整することで、さらに軽減できます。

### Q: どのメトリクスを優先的に監視すべき？
**A:** FPS、メモリ使用量、入力遅延の3つが最も重要です。これらはユーザー体験に直接影響します。

### Q: アラートが頻繁に発生する場合は？
**A:** 動的闾値計算機能を使用して、環境に応じた適切な闾値を設定してください。

### Q: プロダクション環境での監視設定は？
**A:** ProductionMonitoring クラスを使用し、ダッシュボードを無効化、重要なアラートのみを設定、データ保持期間を長く設定します。

## 関連ドキュメント

- [パフォーマンス最適化ガイド](./performance-optimization-guide.md)
- [トラブルシューティングガイド](./troubleshooting-guide.md)
- [設定管理ガイド](./configuration-management-guide.md)

パフォーマンス監視は継続的なプロセスです。定期的な分析と調整により、最適なユーザーエクスペリエンスを維持できます。