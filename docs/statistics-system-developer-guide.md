# 統計システム 開発者ガイド

## 概要

このガイドは、awaputi統計システムの拡張・保守・統合を行う開発者向けの技術ドキュメントです。システムアーキテクチャ、拡張方法、ベストプラクティス、デバッグ手法について詳しく説明します。

## システムアーキテクチャ

### 全体構成

```
統計システム全体構成:

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GameEngine    │ -> │ StatisticsCollector │ -> │ StatisticsManager │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
                                                         v
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  UserInfoScene  │ <- │ StatisticsVisualizer │ <- │ StatisticsAnalyzer │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                  │
                                  v
                       ┌─────────────────┐
                       │  ChartRenderer  │
                       └─────────────────┘
```

### データフロー

```
データ収集フロー:
1. GameEngine -> イベント発生
2. StatisticsCollector -> イベント収集・キューイング
3. StatisticsCollector -> バッチ処理実行
4. StatisticsManager -> 統計データ更新
5. TimeSeriesDataManager -> 時系列データ保存
6. PlayerData -> 永続化

分析・表示フロー:
1. StatisticsAnalyzer -> データ取得・分析
2. StatisticsVisualizer -> 可視化データ生成
3. ChartRenderer -> グラフ描画
4. UserInfoScene -> UI更新
```

### モジュール依存関係

```javascript
// 依存関係マップ
const DEPENDENCY_MAP = {
  StatisticsManager: [],
  StatisticsCollector: ['StatisticsManager'],
  StatisticsAnalyzer: ['StatisticsManager'],
  StatisticsVisualizer: ['StatisticsManager', 'ChartRenderer'],
  ChartRenderer: [],
  StatisticsExporter: ['StatisticsManager'],
  StatisticsErrorHandler: ['StatisticsManager'],
  TimeSeriesDataManager: [],
  StatisticsPerformanceOptimizer: ['StatisticsManager']
};
```

## 新しい統計項目の追加

### 基本統計項目の追加

1. **StatisticsManager.jsの拡張**

```javascript
// src/core/StatisticsManager.js
initializeStatistics() {
  return {
    // 既存項目...
    
    // 新しい統計カテゴリを追加
    newCategoryStats: {
      totalNewEvents: 0,
      averageNewValue: 0,
      newDistribution: new Map(),
      lastNewEvent: null,
      // 統計の詳細設定
      metadata: {
        category: 'newCategory',
        displayName: '新カテゴリ統計',
        description: '新しい統計項目の説明',
        unit: 'count',
        precision: 2
      }
    }
  };
}

// 新しい統計の更新ロジック
updateNewCategoryStats(eventData) {
  const stats = this.statistics.newCategoryStats;
  
  // 基本統計の更新
  stats.totalNewEvents++;
  stats.lastNewEvent = eventData.timestamp;
  
  // 平均値の更新
  const currentTotal = stats.averageNewValue * (stats.totalNewEvents - 1);
  stats.averageNewValue = (currentTotal + eventData.value) / stats.totalNewEvents;
  
  // 分布データの更新
  const key = eventData.category;
  stats.newDistribution.set(key, (stats.newDistribution.get(key) || 0) + 1);
  
  // 変更通知
  this.emit('statisticsUpdated', {
    category: 'newCategory',
    data: stats
  });
}
```

2. **StatisticsCollector.jsでのイベント処理追加**

```javascript
// src/core/StatisticsCollector.js
processEvent(eventData) {
  // 既存処理...
  
  // 新しいイベントタイプの処理
  if (eventData.type === 'new_event_type') {
    this.statisticsManager.updateNewCategoryStats(eventData.data);
  }
}

// イベント検証ルールの追加
validateEventData(eventData) {
  // 既存検証...
  
  if (eventData.type === 'new_event_type') {
    return this.validateNewEventData(eventData.data);
  }
}

validateNewEventData(data) {
  return {
    isValid: data.value !== undefined && typeof data.value === 'number',
    errors: data.value === undefined ? ['value is required'] : []
  };
}
```

### 時系列統計項目の追加

```javascript
// src/core/TimeSeriesDataManager.js
addTimeSeriesPoint(date, data) {
  // 既存処理...
  
  // 新しい時系列データの追加
  if (data.newMetric !== undefined) {
    this.ensureTimeSeriesExists('newMetric');
    this.timeSeries.get('newMetric').set(date, {
      value: data.newMetric,
      count: data.newMetricCount || 1,
      metadata: {
        source: 'newCategory',
        calculatedAt: Date.now()
      }
    });
  }
}

// 新しい集計メソッドの追加
aggregateNewMetric(period = 'daily') {
  const data = this.timeSeries.get('newMetric');
  if (!data) return new Map();
  
  // 期間別集計ロジック
  return this.aggregateByPeriod(data, period, (values) => ({
    total: values.reduce((sum, v) => sum + v.value, 0),
    average: values.reduce((sum, v) => sum + v.value, 0) / values.length,
    max: Math.max(...values.map(v => v.value)),
    min: Math.min(...values.map(v => v.value))
  }));
}
```

## 新しい分析機能の追加

### カスタム分析アルゴリズムの実装

```javascript
// src/core/StatisticsAnalyzer.js内に新しい分析メソッドを追加

async analyzeNewPattern(options = {}) {
  const stats = this.statisticsManager.getStatistics();
  const timeSeries = this.statisticsManager.getTimeSeriesData();
  
  // 新しいパターン分析の実装
  const patterns = this.identifyNewPatterns(stats, timeSeries);
  const insights = this.generateNewInsights(patterns);
  const recommendations = this.generateNewRecommendations(patterns);
  
  return {
    patterns,
    insights,
    recommendations,
    confidence: this.calculateConfidence(patterns),
    metadata: {
      analyzedAt: Date.now(),
      algorithm: 'newPatternAnalysis',
      version: '1.0'
    }
  };
}

identifyNewPatterns(stats, timeSeries) {
  const patterns = [];
  
  // パターン識別ロジックの実装
  // 例: 特定の時間帯での性能変化パターン
  const hourlyPerformance = this.analyzeHourlyPerformance(timeSeries);
  if (hourlyPerformance.hasSignificantVariation) {
    patterns.push({
      type: 'hourly_variation',
      strength: hourlyPerformance.variation,
      peakHours: hourlyPerformance.peakHours,
      description: '時間帯による性能変動が見られます'
    });
  }
  
  return patterns;
}

generateNewInsights(patterns) {
  return patterns.map(pattern => {
    switch (pattern.type) {
      case 'hourly_variation':
        return {
          type: 'performance_timing',
          message: `${pattern.peakHours.join(', ')}時台で特に良い成績を出しています`,
          actionable: true,
          priority: 'medium'
        };
      default:
        return null;
    }
  }).filter(Boolean);
}
```

### 機械学習風分析の追加

```javascript
// より高度な分析機能
async performAdvancedAnalysis(options = {}) {
  const {
    algorithm = 'neural_network_simulation',
    lookbackDays = 30,
    predictionDays = 7
  } = options;
  
  const trainingData = this.prepareTrainingData(lookbackDays);
  const model = this.createSimpleModel(algorithm);
  const predictions = await this.generatePredictions(model, trainingData, predictionDays);
  
  return {
    predictions,
    confidence: model.confidence,
    recommendations: this.generateMLRecommendations(predictions),
    model: {
      type: algorithm,
      accuracy: model.accuracy,
      trainingDataSize: trainingData.length
    }
  };
}

createSimpleModel(algorithm) {
  // 簡化された機械学習風アルゴリズム
  // 実際は統計的手法を使用
  
  const models = {
    linear_regression: {
      predict: (data) => this.linearRegression(data),
      confidence: 0.75,
      accuracy: 0.82
    },
    moving_average: {
      predict: (data) => this.movingAveragePredict(data),
      confidence: 0.85,
      accuracy: 0.78
    },
    neural_network_simulation: {
      predict: (data) => this.neuralNetworkSimulation(data),
      confidence: 0.80,
      accuracy: 0.85
    }
  };
  
  return models[algorithm] || models.linear_regression;
}
```

## 新しいグラフタイプの追加

### カスタムグラフレンダラーの実装

```javascript
// src/core/CustomChartRenderer.js (新規作成)
export class CustomChartRenderer extends ChartRenderer {
  constructor(canvas, options = {}) {
    super(canvas, options);
    this.customChartTypes = new Set(['heatmap', 'radar', 'sankey']);
  }
  
  async renderHeatmap(data, options = {}) {
    const {
      cellSize = 20,
      colorScheme = 'viridis',
      showLabels = true
    } = options;
    
    const ctx = this.getContext();
    const { width, height } = this.canvas;
    
    // ヒートマップの描画ロジック
    this.clearCanvas();
    this.drawHeatmapGrid(ctx, data, cellSize);
    this.applyColorScheme(ctx, data, colorScheme);
    
    if (showLabels) {
      this.drawHeatmapLabels(ctx, data);
    }
    
    // アクセシビリティ情報の追加
    this.addAccessibilityInfo({
      type: 'heatmap',
      description: 'パフォーマンスの時間別ヒートマップ',
      data: this.generateTextDescription(data)
    });
  }
  
  drawHeatmapGrid(ctx, data, cellSize) {
    const maxValue = Math.max(...data.values.flat());
    const minValue = Math.min(...data.values.flat());
    
    data.values.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        const x = colIndex * cellSize;
        const y = rowIndex * cellSize;
        
        // 値に応じた色の計算
        const intensity = (value - minValue) / (maxValue - minValue);
        const color = this.getHeatmapColor(intensity);
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);
        
        // 境界線の描画
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
      });
    });
  }
  
  async renderRadarChart(data, options = {}) {
    const {
      radius = 100,
      levels = 5,
      showGrid = true,
      showLabels = true
    } = options;
    
    const ctx = this.getContext();
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    this.clearCanvas();
    
    if (showGrid) {
      this.drawRadarGrid(ctx, centerX, centerY, radius, levels, data.labels.length);
    }
    
    // データ系列の描画
    data.datasets.forEach((dataset, index) => {
      this.drawRadarData(ctx, centerX, centerY, radius, dataset, data.labels.length, index);
    });
    
    if (showLabels) {
      this.drawRadarLabels(ctx, centerX, centerY, radius, data.labels);
    }
  }
}

// ChartRendererの拡張
export class ExtendedChartRenderer extends ChartRenderer {
  constructor(canvas, options = {}) {
    super(canvas, options);
    this.customRenderer = new CustomChartRenderer(canvas, options);
  }
  
  async renderChart(type, data, options = {}) {
    if (this.customRenderer.customChartTypes.has(type)) {
      return await this.customRenderer[`render${this.capitalize(type)}`](data, options);
    }
    
    // 基本グラフタイプの処理
    return await super.renderChart(type, data, options);
  }
}
```

### グラフの統合

```javascript
// src/core/StatisticsVisualizer.js での新しいグラフの統合
async generateHeatmapVisualization(statType, period = 'weekly') {
  const timeSeries = this.statisticsManager.getTimeSeriesData(period);
  
  // ヒートマップ用のデータ変換
  const heatmapData = this.convertTimeSeriesToHeatmap(timeSeries, statType);
  
  return {
    type: 'heatmap',
    data: heatmapData,
    options: {
      cellSize: 15,
      colorScheme: 'blues',
      showLabels: true,
      title: `${statType} パフォーマンス ヒートマップ`,
      accessibility: {
        description: `${period}期間の${statType}パフォーマンスを時間・曜日別に表示したヒートマップ`
      }
    }
  };
}

convertTimeSeriesToHeatmap(timeSeries, statType) {
  const data = {
    labels: {
      x: ['月', '火', '水', '木', '金', '土', '日'],
      y: Array.from({length: 24}, (_, i) => `${i}:00`)
    },
    values: Array(24).fill().map(() => Array(7).fill(0))
  };
  
  // 時系列データからヒートマップデータへの変換
  for (const [date, stats] of timeSeries) {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const hour = dateObj.getHours();
    
    if (stats[statType] !== undefined) {
      data.values[hour][dayOfWeek] = stats[statType];
    }
  }
  
  return data;
}
```

## エラーハンドリングの拡張

### カスタムエラータイプの追加

```javascript
// src/core/StatisticsErrors.js (新規作成)
export class StatisticsError extends Error {
  constructor(message, type, severity, context = {}) {
    super(message);
    this.name = 'StatisticsError';
    this.type = type;
    this.severity = severity;
    this.context = context;
    this.timestamp = Date.now();
  }
}

export class StatisticsDataCorruptionError extends StatisticsError {
  constructor(message, corruptedData, context = {}) {
    super(message, 'DATA_CORRUPTION', 'HIGH', context);
    this.name = 'StatisticsDataCorruptionError';
    this.corruptedData = corruptedData;
  }
}

export class StatisticsCalculationError extends StatisticsError {
  constructor(message, calculationType, inputData, context = {}) {
    super(message, 'CALCULATION_ERROR', 'MEDIUM', context);
    this.name = 'StatisticsCalculationError';
    this.calculationType = calculationType;
    this.inputData = inputData;
  }
}

// エラーハンドラーの拡張
export class ExtendedStatisticsErrorHandler extends StatisticsErrorHandler {
  constructor(statisticsManager) {
    super(statisticsManager);
    
    // カスタムエラーハンドラーの追加
    this.customErrorHandlers = new Map([
      ['CUSTOM_ERROR_TYPE', this.handleCustomError.bind(this)]
    ]);
  }
  
  handleError(error, context = {}) {
    // カスタムエラーハンドラーのチェック
    if (this.customErrorHandlers.has(error.type)) {
      return this.customErrorHandlers.get(error.type)(error, context);
    }
    
    // 基本エラーハンドリング
    return super.handleError(error, context);
  }
  
  async handleCustomError(error, context) {
    // カスタムエラーの処理ロジック
    this.logError(error, 'CUSTOM', context);
    
    const recoveryStrategy = this.determineCustomRecoveryStrategy(error);
    const recoveryResult = await this.executeCustomRecovery(recoveryStrategy, error);
    
    return {
      handled: true,
      recovery: recoveryResult,
      userMessage: this.generateUserFriendlyMessage(error),
      technicalDetails: {
        error: error.message,
        stack: error.stack,
        context
      }
    };
  }
}
```

### 詳細ログとデバッグ

```javascript
// src/core/StatisticsDebugger.js (新規作成)
export class StatisticsDebugger {
  constructor(statisticsManager) {
    this.statisticsManager = statisticsManager;
    this.debugMode = false;
    this.logHistory = [];
    this.maxLogEntries = 1000;
  }
  
  enableDebugMode(level = 'standard') {
    this.debugMode = true;
    this.debugLevel = level;
    
    // デバッグイベントリスナーの設定
    this.setupDebugListeners();
    
    console.log(`[StatisticsDebugger] Debug mode enabled (${level})`);
  }
  
  log(level, message, data = {}) {
    if (!this.debugMode) return;
    
    const logEntry = {
      timestamp: Date.now(),
      level,
      message,
      data: JSON.parse(JSON.stringify(data)),
      stack: new Error().stack
    };
    
    this.logHistory.push(logEntry);
    
    // ログ履歴のサイズ制限
    if (this.logHistory.length > this.maxLogEntries) {
      this.logHistory.shift();
    }
    
    // コンソール出力
    const consoleMethod = this.getConsoleMethod(level);
    consoleMethod(`[Statistics${level.toUpperCase()}]`, message, data);
  }
  
  generatePerformanceReport() {
    const startTime = Date.now();
    
    // パフォーマンス測定
    const stats = this.statisticsManager.getStatistics();
    const timeSeries = this.statisticsManager.getTimeSeriesData();
    
    const report = {
      generatedAt: startTime,
      statistics: {
        dataSize: this.calculateDataSize(stats),
        timeSeriesSize: this.calculateTimeSeriesSize(timeSeries),
        totalRecords: this.countTotalRecords(stats, timeSeries)
      },
      performance: {
        memoryUsage: this.getMemoryUsage(),
        processingTime: {
          statisticsAccess: this.measureStatisticsAccess(),
          timeSeriesAccess: this.measureTimeSeriesAccess(),
          analysisExecution: this.measureAnalysisExecution()
        }
      },
      issues: this.identifyPerformanceIssues()
    };
    
    this.log('info', 'Performance report generated', report);
    return report;
  }
  
  exportDebugData(format = 'json') {
    const debugData = {
      logHistory: this.logHistory,
      currentState: {
        statistics: this.statisticsManager.getStatistics(),
        timeSeries: this.statisticsManager.getTimeSeriesData(),
        configuration: this.statisticsManager.config
      },
      systemInfo: this.getSystemInfo(),
      performanceMetrics: this.collectPerformanceMetrics()
    };
    
    switch (format) {
      case 'json':
        return JSON.stringify(debugData, null, 2);
      case 'csv':
        return this.convertToCSV(debugData);
      default:
        return debugData;
    }
  }
}
```

## テストの追加

### ユニットテストの作成

```javascript
// tests/unit/NewStatisticsFeature.test.js
import { jest } from '@jest/globals';
import { StatisticsManager } from '../../src/core/StatisticsManager.js';

describe('NewStatisticsFeature', () => {
  let statisticsManager;
  let mockGameEngine;
  
  beforeEach(() => {
    mockGameEngine = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    
    statisticsManager = new StatisticsManager(mockGameEngine);
  });
  
  describe('新しい統計項目', () => {
    test('新カテゴリ統計が正しく初期化される', () => {
      const stats = statisticsManager.initializeStatistics();
      
      expect(stats.newCategoryStats).toBeDefined();
      expect(stats.newCategoryStats.totalNewEvents).toBe(0);
      expect(stats.newCategoryStats.averageNewValue).toBe(0);
      expect(stats.newCategoryStats.newDistribution).toBeInstanceOf(Map);
    });
    
    test('新しいイベントが正しく処理される', async () => {
      const eventData = {
        type: 'new_event_type',
        timestamp: Date.now(),
        data: {
          value: 100,
          category: 'testCategory'
        }
      };
      
      await statisticsManager.updateNewCategoryStats(eventData.data);
      
      const stats = statisticsManager.getStatistics();
      expect(stats.newCategoryStats.totalNewEvents).toBe(1);
      expect(stats.newCategoryStats.averageNewValue).toBe(100);
      expect(stats.newCategoryStats.newDistribution.get('testCategory')).toBe(1);
    });
  });
  
  describe('カスタム分析機能', () => {
    test('新パターン分析が正しく実行される', async () => {
      // テストデータの準備
      statisticsManager.statistics = {
        // テスト用の統計データ
      };
      
      const analyzer = new StatisticsAnalyzer(statisticsManager);
      const result = await analyzer.analyzeNewPattern();
      
      expect(result).toBeDefined();
      expect(result.patterns).toBeInstanceOf(Array);
      expect(result.insights).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(typeof result.confidence).toBe('number');
    });
  });
});
```

### 統合テストの作成

```javascript
// tests/integration/NewFeatureIntegration.test.js
describe('新機能統合テスト', () => {
  let statisticsSystem;
  
  beforeAll(async () => {
    statisticsSystem = await setupCompleteStatisticsSystem();
  });
  
  test('新機能が既存システムと正しく統合される', async () => {
    // 1. イベント収集
    await statisticsSystem.collector.collectEvent(newEventData);
    
    // 2. 分析実行
    const analysis = await statisticsSystem.analyzer.analyzeNewPattern();
    
    // 3. 可視化実行
    const visualization = await statisticsSystem.visualizer.generateHeatmapVisualization('newMetric');
    
    // 4. 統合確認
    expect(analysis.patterns.length).toBeGreaterThan(0);
    expect(visualization.type).toBe('heatmap');
    expect(visualization.data).toBeDefined();
  });
  
  test('エラー処理が正しく動作する', async () => {
    const invalidEventData = { /* 無効なデータ */ };
    
    const result = await statisticsSystem.collector.collectEvent(invalidEventData);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.recovery).toBeDefined();
  });
});
```

## パフォーマンス最適化

### メモリ使用量の最適化

```javascript
// src/core/StatisticsMemoryOptimizer.js (新規作成)
export class StatisticsMemoryOptimizer {
  constructor(statisticsManager) {
    this.statisticsManager = statisticsManager;
    this.optimizationStrategies = new Map([
      ['timeSeriesCompression', this.compressTimeSeriesData.bind(this)],
      ['oldDataArchival', this.archiveOldData.bind(this)],
      ['redundantDataElimination', this.eliminateRedundantData.bind(this)]
    ]);
  }
  
  async optimizeMemoryUsage(strategies = ['timeSeriesCompression', 'oldDataArchival']) {
    const results = [];
    
    for (const strategy of strategies) {
      if (this.optimizationStrategies.has(strategy)) {
        const result = await this.optimizationStrategies.get(strategy)();
        results.push({ strategy, ...result });
      }
    }
    
    return {
      totalMemorySaved: results.reduce((sum, r) => sum + r.memorySaved, 0),
      optimizations: results
    };
  }
  
  compressTimeSeriesData() {
    const timeSeriesManager = this.statisticsManager.timeSeriesManager;
    const originalSize = this.calculateDataSize(timeSeriesManager.timeSeries);
    
    // データ圧縮の実装
    const compressedData = this.compressData(timeSeriesManager.timeSeries);
    timeSeriesManager.timeSeries = compressedData;
    
    const newSize = this.calculateDataSize(compressedData);
    
    return {
      memorySaved: originalSize - newSize,
      compressionRatio: newSize / originalSize,
      recordsAffected: this.countRecords(compressedData)
    };
  }
  
  async archiveOldData(cutoffDays = 90) {
    const cutoffDate = Date.now() - (cutoffDays * 24 * 60 * 60 * 1000);
    const stats = this.statisticsManager.getStatistics();
    
    // 古いデータの特定と分離
    const oldData = this.extractOldData(stats, cutoffDate);
    const archivedSize = this.calculateDataSize(oldData);
    
    // アーカイブの実行
    await this.createArchive(oldData, cutoffDate);
    await this.removeOldDataFromActiveStats(cutoffDate);
    
    return {
      memorySaved: archivedSize,
      recordsArchived: this.countRecords(oldData),
      archiveLocation: this.getArchiveLocation(cutoffDate)
    };
  }
}
```

### 計算パフォーマンスの最適化

```javascript
// 高速計算のための最適化
export class FastStatisticsCalculator {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5000; // 5秒
  }
  
  // メモ化による高速化
  memoizedCalculation(key, calculationFn, ...args) {
    const cacheKey = `${key}:${JSON.stringify(args)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }
    
    const result = calculationFn(...args);
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
    
    return result;
  }
  
  // バッチ処理による最適化
  batchCalculateStatistics(events) {
    // イベントをタイプ別にグループ化
    const groupedEvents = events.reduce((groups, event) => {
      const type = event.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(event);
      return groups;
    }, {});
    
    // タイプ別の一括計算
    const results = {};
    for (const [type, typeEvents] of Object.entries(groupedEvents)) {
      results[type] = this.calculateStatisticsForType(type, typeEvents);
    }
    
    return results;
  }
  
  // WebWorker を使用した非同期計算
  async calculateInWorker(calculationType, data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker('/src/workers/statistics-calculator.js');
      
      worker.postMessage({
        type: calculationType,
        data
      });
      
      worker.onmessage = (e) => {
        resolve(e.data.result);
        worker.terminate();
      };
      
      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };
    });
  }
}
```

## デバッグとトラブルシューティング

### デバッグツールの使用

```javascript
// ブラウザ開発者ツールでの統計システムデバッグ
window.awaputi = window.awaputi || {};
window.awaputi.debugStatistics = {
  // 統計システムの状態確認
  getSystemState() {
    const statisticsManager = window.gameEngine?.statisticsManager;
    if (!statisticsManager) {
      return { error: 'Statistics system not found' };
    }
    
    return {
      statistics: statisticsManager.getStatistics(),
      timeSeries: statisticsManager.getTimeSeriesData(),
      collectors: statisticsManager.collectors?.length || 0,
      analyzers: statisticsManager.analyzers?.length || 0,
      isCollecting: statisticsManager.isCollecting(),
      lastUpdate: statisticsManager.lastUpdateTime
    };
  },
  
  // パフォーマンス監視
  startPerformanceMonitoring() {
    const monitor = setInterval(() => {
      const stats = this.getSystemState();
      const memoryInfo = performance.memory;
      
      console.log('[Statistics Performance]', {
        timestamp: new Date().toISOString(),
        memory: {
          used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024) + 'MB'
        },
        statistics: {
          totalRecords: stats.statistics?.gamePlayStats?.totalGames || 0,
          timeSeriesSize: stats.timeSeries?.size || 0
        }
      });
    }, 10000);
    
    return monitor;
  },
  
  // データ整合性チェック
  validateDataIntegrity() {
    const statisticsManager = window.gameEngine?.statisticsManager;
    const issues = [];
    
    // 基本データ検証
    const stats = statisticsManager.getStatistics();
    if (stats.scoreStats.totalScore < 0) {
      issues.push('Total score is negative');
    }
    
    if (stats.bubbleStats.accuracy > 1 || stats.bubbleStats.accuracy < 0) {
      issues.push('Invalid accuracy value');
    }
    
    // 時系列データ検証
    const timeSeries = statisticsManager.getTimeSeriesData();
    for (const [date, data] of timeSeries) {
      if (isNaN(new Date(date).getTime())) {
        issues.push(`Invalid date in time series: ${date}`);
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  },
  
  // 統計リセット（開発用）
  resetStatistics() {
    const statisticsManager = window.gameEngine?.statisticsManager;
    if (confirm('統計データを全て削除しますか？この操作は取り消せません。')) {
      statisticsManager.statistics = statisticsManager.initializeStatistics();
      statisticsManager.save();
      console.log('Statistics reset completed');
    }
  }
};
```

### よくある問題と解決方法

```javascript
// トラブルシューティングガイド
export const TROUBLESHOOTING_GUIDE = {
  'statistics_not_updating': {
    symptoms: ['統計データが更新されない', 'イベントが収集されない'],
    causes: [
      'StatisticsCollectorが初期化されていない',
      'GameEngineとの連携が切れている',
      'LocalStorageの容量不足'
    ],
    solutions: [
      'statisticsCollector.initialize()を実行',
      'gameEngine.statisticsManagerの参照を確認',
      'LocalStorageをクリアして再試行'
    ],
    code: `
      // 解決コード例
      const collector = gameEngine.statisticsManager.collector;
      if (!collector.isInitialized) {
        await collector.initialize();
      }
      
      // イベント収集の再開
      collector.resumeCollection();
    `
  },
  
  'charts_not_rendering': {
    symptoms: ['グラフが表示されない', '描画エラーが発生する'],
    causes: [
      'Canvas要素が見つからない',
      'データ形式が正しくない',
      'ChartRendererの初期化エラー'
    ],
    solutions: [
      'Canvas要素の存在確認',
      'データ形式の検証',
      'ChartRendererの再初期化'
    ],
    code: `
      // 解決コード例
      const canvas = document.getElementById('statisticsCanvas');
      if (!canvas) {
        console.error('Canvas element not found');
        return;
      }
      
      const renderer = new ChartRenderer(canvas);
      await renderer.initialize();
    `
  },
  
  'performance_issues': {
    symptoms: ['統計画面の表示が遅い', 'ブラウザが重くなる'],
    causes: [
      '大量の時系列データ',
      'メモリリーク',
      '効率的でない計算処理'
    ],
    solutions: [
      'データのアーカイブ実行',
      'メモリ最適化機能の有効化',
      '表示期間の制限'
    ],
    code: `
      // パフォーマンス改善コード例
      const optimizer = new StatisticsMemoryOptimizer(statisticsManager);
      await optimizer.optimizeMemoryUsage();
      
      // 表示期間の制限
      statisticsManager.setDisplayPeriod('last30days');
    `
  }
};
```

## ベストプラクティス

### コーディング規約

```javascript
// 統計システム開発のベストプラクティス

// 1. イベントデータの型安全性
const EventDataSchema = {
  type: 'string',          // 必須
  timestamp: 'number',     // 必須
  sessionId: 'string',     // 必須
  data: 'object'          // 必須、イベント固有データ
};

// 2. エラーハンドリングの一貫性
function handleStatisticsError(error, context = {}) {
  // ログ記録
  console.error('[Statistics Error]', error.message, context);
  
  // エラー分類
  const errorType = classifyError(error);
  
  // 復旧戦略の決定
  const recoveryStrategy = determineRecoveryStrategy(errorType);
  
  // ユーザーへの通知
  notifyUser(generateUserFriendlyMessage(error));
  
  // 復旧実行
  return executeRecovery(recoveryStrategy, error, context);
}

// 3. パフォーマンス監視の統合
class PerformanceAwareStatisticsManager extends StatisticsManager {
  async updateStatistics(eventData) {
    const startTime = performance.now();
    
    try {
      const result = await super.updateStatistics(eventData);
      
      const endTime = performance.now();
      this.recordPerformanceMetric('updateStatistics', endTime - startTime);
      
      return result;
    } catch (error) {
      this.recordPerformanceIssue('updateStatistics', error);
      throw error;
    }
  }
}

// 4. メモリ効率的なデータ構造
class EfficientTimeSeriesManager {
  constructor() {
    // Map よりもメモリ効率的な実装
    this.compressedData = new CompressedMap();
    this.indexCache = new LRUCache(100);
  }
  
  addDataPoint(date, data) {
    // データ圧縮
    const compressed = this.compressData(data);
    this.compressedData.set(date, compressed);
    
    // インデックス更新
    this.updateIndex(date);
  }
}
```

### セキュリティ考慮事項

```javascript
// セキュリティガイドライン

// 1. データの検証
function validateStatisticsData(data) {
  // XSS対策
  const sanitized = sanitizeInput(data);
  
  // データサイズ制限
  if (JSON.stringify(sanitized).length > MAX_DATA_SIZE) {
    throw new Error('Data size exceeds limit');
  }
  
  // 型検証
  return validateDataTypes(sanitized);
}

// 2. LocalStorage の安全な使用
class SecureStatisticsStorage {
  save(data) {
    try {
      // データの暗号化（簡易版）
      const encrypted = this.encryptData(data);
      
      // 整合性チェック用のハッシュ
      const hash = this.generateHash(encrypted);
      
      localStorage.setItem('statistics_data', encrypted);
      localStorage.setItem('statistics_hash', hash);
    } catch (error) {
      throw new StatisticsStorageError('Failed to save data securely', error);
    }
  }
  
  load() {
    try {
      const encrypted = localStorage.getItem('statistics_data');
      const hash = localStorage.getItem('statistics_hash');
      
      // 整合性確認
      if (!this.verifyHash(encrypted, hash)) {
        throw new Error('Data integrity check failed');
      }
      
      return this.decryptData(encrypted);
    } catch (error) {
      throw new StatisticsStorageError('Failed to load data securely', error);
    }
  }
}

// 3. プライバシー保護
class PrivacyAwareStatisticsExporter {
  exportData(data, options = {}) {
    let exportData = { ...data };
    
    if (options.anonymize) {
      exportData = this.anonymizeData(exportData);
    }
    
    if (options.removePersonalInfo) {
      exportData = this.removePersonalInfo(exportData);
    }
    
    return exportData;
  }
  
  anonymizeData(data) {
    // ユーザー識別可能な情報の匿名化
    return {
      ...data,
      userId: this.generateAnonymousId(),
      sessionIds: data.sessionIds?.map(() => this.generateAnonymousId()),
      timestamps: data.timestamps?.map(() => this.fuzzyTimestamp())
    };
  }
}
```

---

このガイドは統計システムの拡張・保守を行う開発者向けの包括的な技術資料です。実装時は各プロジェクトの要件に応じて適切にカスタマイズしてご利用ください。

詳細な API リファレンスについては `statistics-system-api.md` もご参照ください。