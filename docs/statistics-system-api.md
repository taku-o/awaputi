# 統計システム API ドキュメント

## 概要

awaputi統計システムは、ゲームプレイデータの収集、分析、可視化、エクスポート機能を提供する包括的なシステムです。本システムは高度な時系列分析、トレンド分析、データ可視化、アクセシビリティ対応を特徴とします。

## システム構成

### 主要コンポーネント

- **StatisticsManager**: 統計システムの中央管理クラス
- **StatisticsCollector**: イベントベースのデータ収集システム
- **StatisticsAnalyzer**: 高度な統計分析エンジン
- **ChartRenderer**: Canvas 2D APIベースのグラフ描画システム
- **StatisticsExporter**: 多形式データエクスポート・インポート機能
- **StatisticsErrorHandler**: 包括的エラーハンドリングシステム

## API リファレンス

### StatisticsManager

統計システムの中核となるクラス。全ての統計データの管理と他コンポーネントとの統合を担当。

#### コンストラクタ

```javascript
const statisticsManager = new StatisticsManager(gameEngine);
```

**パラメータ:**
- `gameEngine` (Object): GameEngineインスタンス

#### 主要プロパティ

```javascript
// 統計データ（読み取り専用）
statisticsManager.statistics
  .gamePlayStats    // ゲームプレイ統計
  .scoreStats       // スコア統計
  .bubbleStats      // 泡統計
  .comboStats       // コンボ統計
  .stageStats       // ステージ統計
  .timeSeries       // 時系列データ
```

#### メソッド

##### データ取得

```javascript
// 基本統計データ取得
getStatistics()
// Returns: Object - 全統計データ

// 詳細統計データ取得（20+項目）
getDetailedStatistics()
// Returns: Object - 詳細統計（効率統計、分析データ含む）

// 時系列データ取得
getTimeSeriesData(period = 'all')
// Parameters: period - 'daily', 'weekly', 'monthly', 'all'
// Returns: Map - 期間別時系列データ

// サマリー統計取得
getSummaryStatistics()
// Returns: Object - 重要指標のサマリー
```

##### データ更新

```javascript
// 統計データ更新
updateStatistics(eventData)
// Parameters: eventData - ゲームイベントデータ
// Returns: Boolean - 更新成功フラグ

// 時系列データポイント追加
addTimeSeriesDataPoint(date, data)
// Parameters: date (String), data (Object)
// Returns: Boolean - 追加成功フラグ

// ステージ統計更新
updateStageStatistics(stageType, stageData)
// Parameters: stageType (String), stageData (Object)
// Returns: Boolean - 更新成功フラグ
```

##### データ永続化

```javascript
// データ保存（拡張版）
async save(options = {})
// Parameters: options - 保存オプション
// Options:
//   - includeTimeSeriesData: Boolean (default: true)
//   - createBackup: Boolean (default: true)
//   - validateIntegrity: Boolean (default: true)
//   - compress: Boolean (default: false)
// Returns: Promise<Boolean>

// データ読み込み（拡張版）
async load(options = {})
// Parameters: options - 読み込みオプション
// Options:
//   - validateIntegrity: Boolean (default: true)
//   - fallbackToBackup: Boolean (default: true)
//   - repairCorruption: Boolean (default: true)
// Returns: Promise<Boolean>

// バックアップ作成
async createBackup(label = '')
// Parameters: label - バックアップラベル
// Returns: Promise<String> - バックアップID
```

#### イベント

```javascript
// 統計更新イベント
statisticsManager.addEventListener('statisticsUpdated', (event) => {
  console.log('統計が更新されました:', event.data);
});

// エラーイベント
statisticsManager.addEventListener('error', (event) => {
  console.log('エラーが発生しました:', event.error);
});

// バックアップ作成イベント
statisticsManager.addEventListener('backupCreated', (event) => {
  console.log('バックアップが作成されました:', event.backupId);
});
```

### StatisticsCollector

高性能なイベントベースデータ収集システム。バッチ処理による効率的なデータ収集を提供。

#### コンストラクタ

```javascript
const collector = new StatisticsCollector(statisticsManager);
```

#### 設定

```javascript
// 収集設定の変更
collector.updateConfig({
  batchSize: 50,           // バッチサイズ
  batchInterval: 1000,     // バッチ処理間隔（ms）
  maxQueueSize: 1000,      // キューの最大サイズ  
  enableValidation: true,  // データ検証有効化
  enableCompression: false // データ圧縮有効化
});
```

#### メソッド

```javascript
// イベント収集
async collectEvent(eventData)
// Parameters: eventData - イベントデータオブジェクト
// Returns: Promise<Boolean>

// バッチ処理実行
async processBatch()
// Returns: Promise<Number> - 処理されたイベント数

// キュー状態取得
getQueueStatus()
// Returns: Object - キューの状態情報

// 統計収集の一時停止/再開
pauseCollection()
resumeCollection()
```

#### イベントデータ形式

```javascript
const eventData = {
  type: 'bubble_popped',     // イベントタイプ
  timestamp: Date.now(),     // タイムスタンプ
  sessionId: 'session-123',  // セッションID
  data: {                    // イベント固有データ
    bubbleType: 'normal',
    score: 100,
    combo: 5,
    position: { x: 400, y: 300 },
    accuracy: 0.95
  }
};
```

### StatisticsAnalyzer

高度な統計分析機能を提供。トレンド分析、比較分析、洞察生成を行う。

#### コンストラクタ

```javascript
const analyzer = new StatisticsAnalyzer(statisticsManager);
```

#### メソッド

##### トレンド分析

```javascript
// 包括的トレンド分析
async analyzeTrends(options = {})
// Parameters: options - 分析オプション
// Options:
//   - period: String ('daily', 'weekly', 'monthly')
//   - dataPoints: Number (最小データポイント数)
//   - includeProjection: Boolean (将来予測含む)
// Returns: Promise<Object> - トレンド分析結果

// 結果例：
{
  scoreTrend: {
    slope: 125.5,           // 傾き（スコア向上率/日）
    correlation: 0.85,      // 相関係数
    direction: 'improving', // トレンド方向
    confidence: 0.92,       // 信頼度
    projection: {           // 30日後の予測
      expectedScore: 4250,
      confidenceInterval: [3800, 4700]
    }
  },
  accuracyTrend: { /* 同様の構造 */ },
  playtimeTrend: { /* 同様の構造 */ },
  efficiencyTrend: { /* 同様の構造 */ }
}
```

##### 比較分析

```javascript
// 期間比較分析
async comparePerformance(options)
// Parameters: options - 比較オプション
// Options:
//   - startDate: Date
//   - endDate: Date
//   - comparisonPeriod: String ('previous', 'lastWeek', 'lastMonth')
//   - metrics: Array<String> (比較対象指標)
// Returns: Promise<Object> - 比較分析結果

// 結果例：
{
  scoreComparison: {
    current: 3500,
    previous: 3200,
    change: 300,
    percentageChange: 9.375,
    significance: 'significant',
    trend: 'improving'
  },
  accuracyComparison: { /* 同様の構造 */ },
  summary: {
    overallTrend: 'improving',
    keyImprovements: ['score', 'accuracy'],
    areasForImprovement: ['combo_consistency']
  }
}
```

##### 洞察生成

```javascript
// AI風洞察生成
async generateInsights(options = {})
// Parameters: options - 洞察生成オプション
// Options:
//   - analysisDepth: String ('basic', 'detailed', 'comprehensive')
//   - includeRecommendations: Boolean
//   - personalizeLevel: String ('general', 'personalized')
// Returns: Promise<Object> - 生成された洞察

// 結果例：
{
  strengths: [
    "Rainbow泡の処理精度が95%と非常に高い",
    "コンボ継続能力が平均を30%上回っている",
    "ゲーム後半でのパフォーマンス維持が優秀"
  ],
  improvements: [
    "Boss泡の処理時間を15%短縮する余地がある",
    "Electric泡への対応精度を向上させる必要がある"
  ],
  recommendations: [
    "Boss泡専用の練習モードでスキル向上を図る",
    "Electric泡出現時の冷静な対応パターンを確立する",
    "コンボ継続のための位置取り戦略を最適化する"
  ],
  milestones: [
    {
      achievement: "初回4000点超え達成",
      date: "2024-01-15",
      significance: "スコア向上の重要な節目"
    }
  ]
}
```

### ChartRenderer

Canvas 2D APIを使用した高性能グラフ描画システム。レスポンシブ対応とアクセシビリティ機能を提供。

#### コンストラクタ

```javascript
const renderer = new ChartRenderer(canvasElement, options = {});
```

**パラメータ:**
- `canvasElement` (HTMLCanvasElement): 描画対象のCanvas要素
- `options` (Object): レンダリングオプション

#### グラフ描画メソッド

##### 棒グラフ

```javascript
async renderBarChart(data, options = {})
// Parameters:
//   - data: チャートデータ
//   - options: 描画オプション
// Returns: Promise<void>

// データ形式：
const barChartData = {
  labels: ['Normal', 'Stone', 'Rainbow', 'Boss'],
  datasets: [{
    label: 'Bubble Types Popped',
    data: [800, 200, 150, 100],
    backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'],
    borderColor: ['#2980b9', '#c0392b', '#27ae60', '#e67e22'],
    borderWidth: 2
  }]
};

// オプション例：
const barOptions = {
  responsive: true,
  animation: {
    duration: 800,
    easing: 'easeOutQuart'
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { display: true },
      ticks: { color: '#333' }
    },
    x: {
      grid: { display: false },
      ticks: { color: '#333' }
    }
  },
  accessibility: {
    enabled: true,
    description: '泡タイプ別の破裂数を示す棒グラフ'
  }
};
```

##### 線グラフ

```javascript
async renderLineChart(data, options = {})
// パラメータ構造は棒グラフと同様

// データ形式例：
const lineChartData = {
  labels: ['1月', '2月', '3月', '4月', '5月'],
  datasets: [{
    label: 'スコア推移',
    data: [2500, 3200, 4100, 5500, 4800],
    borderColor: '#3498db',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    fill: true,
    tension: 0.4
  }]
};
```

##### 円グラフ

```javascript
async renderPieChart(data, options = {})

// データ形式例：
const pieChartData = {
  labels: ['Normal', 'Special', 'Rare'],
  datasets: [{
    data: [70, 25, 5],
    backgroundColor: [
      '#3498db', '#e74c3c', '#2ecc71'
    ],
    borderWidth: 2,
    borderColor: '#fff'
  }]
};
```

#### 高度な機能

```javascript
// インタラクティブイベント設定
renderer.setInteractionHandlers({
  onHover: (event, elements) => {
    // ホバー時の処理
  },
  onClick: (event, elements) => {
    // クリック時の処理
  }
});

// アクセシビリティ機能
renderer.enableAccessibility({
  screenReader: true,      // スクリーンリーダー対応
  keyboardNavigation: true, // キーボードナビゲーション
  highContrast: false,     // ハイコントラストモード
  textAlternatives: true   // テキスト代替表示
});

// レスポンシブ設定
renderer.setResponsive({
  enabled: true,
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024
  },
  layouts: {
    mobile: { fontSize: 12, padding: 10 },
    tablet: { fontSize: 14, padding: 15 },
    desktop: { fontSize: 16, padding: 20 }
  }
});
```

### StatisticsExporter

多形式データエクスポート・インポート機能を提供。データ検証と整合性チェック機能付き。

#### コンストラクタ

```javascript
const exporter = new StatisticsExporter(statisticsManager);
```

#### エクスポートメソッド

```javascript
// JSON形式エクスポート
async exportData(format, options = {})
// Parameters:
//   - format: 'json' | 'csv' | 'txt'
//   - options: エクスポートオプション
// Returns: Promise<Object> - エクスポート結果

// オプション例：
const exportOptions = {
  includeTimeSeriesData: true,    // 時系列データ含む
  includeMetadata: true,          // メタデータ含む
  compressData: false,            // データ圧縮
  anonymize: false,               // 個人情報匿名化
  dateRange: {                    // 期間指定
    start: '2024-01-01',
    end: '2024-01-31'
  },
  statisticsTypes: [              // エクスポート対象統計
    'gamePlayStats',
    'scoreStats',
    'bubbleStats'
  ]
};

// 結果例：
{
  success: true,
  format: 'json',
  data: '{"gamePlayStats": {...}}',
  metadata: {
    exportDate: '2024-01-20T10:30:00Z',
    version: '1.0',
    totalRecords: 1250,
    dataIntegrity: 'verified'
  },
  checksum: 'sha256:abc123...'
}
```

#### インポートメソッド

```javascript
// データインポート
async importData(data, format, options = {})
// Parameters:
//   - data: インポートデータ
//   - format: データ形式
//   - options: インポートオプション
// Returns: Promise<Object> - インポート結果

// オプション例：
const importOptions = {
  validateIntegrity: true,       // 整合性チェック
  mergeStrategy: 'append',       // 'append', 'replace', 'merge'
  backupBeforeImport: true,      // インポート前バックアップ
  conflictResolution: 'newer',   // 'newer', 'older', 'manual'
  dryRun: false                 // テスト実行
};

// 結果例：
{
  success: true,
  recordsImported: 1250,
  recordsSkipped: 0,
  conflicts: [],
  warnings: [],
  backupId: 'backup_20240120_103000'
}
```

### StatisticsErrorHandler

包括的エラーハンドリングシステム。自動復旧機能とセーフモード機能を提供。

#### エラータイプと対応

```javascript
const ERROR_TYPES = {
  DATA_CORRUPTION: 'data_corruption',     // データ破損
  STORAGE_FULL: 'storage_full',           // ストレージ容量不足
  CALCULATION_ERROR: 'calculation_error', // 計算エラー
  RENDER_ERROR: 'render_error',           // 描画エラー
  NETWORK_ERROR: 'network_error',         // ネットワークエラー
  VALIDATION_ERROR: 'validation_error'    // バリデーションエラー
};

const SEVERITY_LEVELS = {
  LOW: 1,       // 警告レベル
  MEDIUM: 2,    // 注意レベル
  HIGH: 3,      // エラーレベル
  CRITICAL: 4   // 致命的レベル
};
```

#### メソッド

```javascript
// エラーハンドリング
handleError(error, context = {})
// Parameters:
//   - error: Error オブジェクト
//   - context: エラーコンテキスト
// Returns: Object - 処理結果

// 自動復旧実行
async attemptRecovery(errorType, recoveryOptions = {})
// Parameters:
//   - errorType: エラータイプ
//   - recoveryOptions: 復旧オプション
// Returns: Promise<Boolean> - 復旧成功フラグ

// セーフモード有効化
enableSafeMode(level = 'standard')
// Parameters: level - 'minimal', 'standard', 'strict'
// Returns: Boolean - 有効化成功フラグ
```

## 使用例

### 基本的な統計システムセットアップ

```javascript
// 1. システム初期化
const gameEngine = new GameEngine();
const statisticsManager = new StatisticsManager(gameEngine);
const statisticsCollector = new StatisticsCollector(statisticsManager);
const statisticsAnalyzer = new StatisticsAnalyzer(statisticsManager);

// 2. データ収集開始
await statisticsCollector.initialize();
statisticsCollector.startCollection();

// 3. ゲームイベント収集
gameEngine.addEventListener('bubblePopped', async (event) => {
  await statisticsCollector.collectEvent({
    type: 'bubble_popped',
    timestamp: Date.now(),
    data: event.detail
  });
});

// 4. 定期的な統計更新
setInterval(async () => {
  await statisticsCollector.processBatch();
}, 5000);
```

### 統計データの表示と分析

```javascript
// 1. Canvas要素の取得
const canvas = document.getElementById('statisticsCanvas');
const chartRenderer = new ChartRenderer(canvas);

// 2. 統計データ取得
const stats = statisticsManager.getDetailedStatistics();
const timeSeriesData = statisticsManager.getTimeSeriesData('weekly');

// 3. トレンド分析実行
const trendAnalysis = await statisticsAnalyzer.analyzeTrends({
  period: 'weekly',
  includeProjection: true
});

// 4. グラフ描画
await chartRenderer.renderLineChart({
  labels: Array.from(timeSeriesData.keys()),
  datasets: [{
    label: 'Weekly Score Trend',
    data: Array.from(timeSeriesData.values()).map(d => d.averageScore),
    borderColor: '#3498db'
  }]
});

// 5. 洞察生成と表示
const insights = await statisticsAnalyzer.generateInsights();
console.log('プレイヤーの強み:', insights.strengths);
console.log('改善提案:', insights.recommendations);
```

### データエクスポート・インポート

```javascript
// 1. エクスポート実行
const exporter = new StatisticsExporter(statisticsManager);
const exportResult = await exporter.exportData('json', {
  includeTimeSeriesData: true,
  anonymize: false,
  dateRange: {
    start: '2024-01-01',
    end: '2024-01-31'
  }
});

if (exportResult.success) {
  // ファイルダウンロード処理
  const blob = new Blob([exportResult.data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `statistics_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

// 2. インポート実行（ファイル選択後）
const fileInput = document.getElementById('importFile');
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  const text = await file.text();
  
  const importResult = await exporter.importData(text, 'json', {
    validateIntegrity: true,
    backupBeforeImport: true
  });
  
  if (importResult.success) {
    console.log(`${importResult.recordsImported}件のレコードをインポートしました`);
  }
});
```

## パフォーマンス要件

### 処理時間要件

- **統計収集**: < 1ms per event
- **バッチ処理**: < 100ms per batch (50 events)
- **初回表示**: < 500ms
- **データ更新**: < 100ms
- **グラフ描画**: < 300ms
- **エクスポート**: < 2000ms (standard dataset)

### メモリ使用量

- **基本統計データ**: < 1MB
- **時系列データ**: < 5MB (1年分)
- **キャッシュデータ**: < 2MB
- **描画バッファ**: < 10MB

### ストレージ

- **LocalStorage使用量**: < 8MB (制限の80%)
- **バックアップ保存**: 最大5世代
- **データ圧縮**: 自動適用時60%サイズ削減

## エラーハンドリング

### 主要エラーパターンと対応

1. **データ破損**
   - 自動検出とバックアップからの復旧
   - 部分復旧機能
   - ユーザーへの適切な通知

2. **ストレージ容量不足**
   - 古いデータの自動アーカイブ
   - 圧縮による容量削減
   - 代替ストレージへのフォールバック

3. **計算エラー**
   - セーフモードでの代替計算
   - エラーログの詳細記録
   - システム継続動作の保証

## アクセシビリティ

### 対応機能

- **スクリーンリーダー**: ARIA属性、代替テキスト
- **キーボードナビゲーション**: Tab順序、ショートカットキー
- **視覚的配慮**: ハイコントラスト、大文字サイズ、色以外の情報伝達

### 実装例

```javascript
// アクセシビリティ機能の有効化
chartRenderer.enableAccessibility({
  screenReader: true,
  keyboardNavigation: true,
  highContrast: user.preferences.highContrast
});

// ARIA属性の設定
statisticsContainer.setAttribute('role', 'main');
statisticsContainer.setAttribute('aria-label', '統計情報ダッシュボード');
```

## 今後の拡張性

### 追加可能な機能

1. **リアルタイム分析**: WebSocketベースのリアルタイム統計更新
2. **機械学習**: プレイスタイル予測、推奨システム
3. **クラウド同期**: 複数デバイス間でのデータ同期
4. **詳細分析**: 更に高度な統計分析アルゴリズム

### 技術的拡張

- **WebWorker**: 重い計算処理のオフロード
- **IndexedDB**: より大容量のデータ保存
- **WebGL**: より高性能なグラフ描画
- **Progressive Web App**: オフライン対応

---

このAPIドキュメントは統計システムv1.0に基づいています。最新の情報については、各クラスのJSDocコメントもご参照ください。