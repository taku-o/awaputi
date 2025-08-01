# ゲーム分析機能 API仕様書

## 概要

BubblePopゲームの包括的なプレイヤー行動・ゲームバランス・パフォーマンス分析機能のAPI仕様です。データ収集、分析、可視化、エクスポート機能を提供します。

## アーキテクチャ

```
EnhancedAnalyticsManager (中央管理)
├── PrivacyManager (プライバシー管理)
├── IndexedDBStorageManager (データストレージ)  
├── DataCollector (データ収集)
├── GameBalanceCollector (ゲームバランス分析)
├── AnalyticsPerformanceOptimizer (パフォーマンス最適化)
├── TrendAnalyzer (トレンド分析)
├── ComparisonEngine (比較分析)
├── AnalyticsDashboard (データ可視化)
├── ChartRenderer (グラフ描画)
├── ExportManager (データエクスポート)
└── AnalyticsAPI (外部API)
```

## Core APIs

### EnhancedAnalyticsManager

#### 初期化・設定

```javascript
// 初期化
const analyticsManager = new EnhancedAnalyticsManager({
    enableGameAnalytics: true,           // ゲーム分析有効化
    enablePerformanceTracking: true,     // パフォーマンス追跡
    enableBehaviorAnalysis: true,        // 行動分析
    autoInitialize: true,                // 自動初期化
    performanceOptimization: {           // パフォーマンス最適化設定
        batchSize: 50,
        batchTimeout: 5000,
        cacheSize: 1000
    }
});

// 手動初期化
await analyticsManager.initialize();

// 設定更新
analyticsManager.updateSettings({
    enableGameAnalytics: false,
    privacySettings: {
        behavior: true,    // 行動分析をオプトアウト
        performance: false // パフォーマンス分析は継続
    }
});
```

#### セッション管理

```javascript
// セッション開始
analyticsManager.startSession({
    sessionId: 'session_123',
    stageId: 'stage_normal_1',
    difficulty: 'normal',
    startTime: Date.now(),
    previousBestScore: 5000
});

// セッション終了
analyticsManager.updatePlayerBehaviorAnalysis({
    exitReason: 'completed',      // 'completed', 'game_over', 'quit'
    finalScore: 7500,
    completed: true,
    timeRemaining: 60000,
    hpRemaining: 75,
    bubblesRemaining: 0,
    maxCombo: 25,
    bubblesMissed: 3,
    activeItems: ['speed_boost']
});
```

#### プレイヤー行動追跡

```javascript
// プレイヤーインタラクション記録
analyticsManager.recordPlayerInteractionPattern({
    bubbleType: 'normal',        // バブルタイプ
    action: 'popped',            // 'popped', 'missed', 'expired'
    reactionTime: 450,           // ミリ秒
    comboCount: 10,              // 現在のコンボ数
    currentScore: 2500,          // 現在スコア
    stageProgress: 0.6,          // ステージ進行度 (0-1)
    playerHP: 85,                // プレイヤーHP
    timeRemaining: 180000        // 残り時間 (ms)
});

// プレイヤー行動追跡
analyticsManager.trackPlayerBehavior({
    type: 'interaction',         // イベントタイプ
    action: 'popped',
    bubbleType: 'rainbow',
    reactionTime: 320,
    comboCount: 15,
    currentScore: 3200,
    stageProgress: 0.4,
    playerHP: 90,
    timeRemaining: 220000
});
```

#### ゲームバランス分析

```javascript
// ゲームバランスデータ追跡
analyticsManager.trackGameBalance({
    bubbleSpawn: {
        bubbleType: 'electric',
        spawnPosition: { x: 400, y: 300 },
        spawnTiming: Date.now(),
        surroundingBubbles: ['normal', 'stone'],
        difficultyContext: 'normal'
    },
    scoreEvent: {
        scoreGain: 500,
        source: 'combo_bonus',      // 'bubble_pop', 'combo_bonus', 'item_use'
        comboMultiplier: 2.5,
        itemsActive: ['score_boost']
    },
    itemUsage: {
        itemType: 'time_freeze',
        usageTiming: 'emergency',    // 'strategic', 'emergency', 'random'
        effectDuration: 3000,
        impactOnScore: 200
    }
});
```

#### パフォーマンス監視

```javascript
// パフォーマンスメトリクス追跡
analyticsManager.trackPerformanceMetrics({
    fps: 58.5,
    memoryUsage: 67 * 1024 * 1024,  // バイト
    loadTimes: {
        assets: 850,                 // ミリ秒
        scripts: 320,
        total: 1200
    },
    timestamp: Date.now()
});

// エラー追跡
analyticsManager.trackError(error, {
    context: 'bubble_interaction',
    stageId: 'stage_1',
    playerAction: 'click',
    additionalInfo: { bubbleType: 'boss' }
});
```

#### 統計・レポート取得

```javascript
// 基本統計取得
const stats = analyticsManager.getAnalyticsStats();
/*
{
    isInitialized: true,
    isGameAnalyticsEnabled: true,
    performanceMonitor: { fps: 60, memoryUsage: 50MB, errorCount: 0 },
    playerSkillLevel: 'intermediate',
    playStyleDistribution: { aggressive: 0.3, defensive: 0.5, strategic: 0.2 },
    dataCollector: { eventsProcessed: 1250, batchesProcessed: 25 }
}
*/

// 拡張統計取得（キャッシュ付き）
const extendedStats = analyticsManager.getExtendedAnalyticsStats();

// パフォーマンス最適化統計
const optimizationStats = analyticsManager.getPerformanceOptimizationStats();

// パフォーマンスレポート生成
const performanceReport = analyticsManager.generatePerformanceReport();
/*
{
    summary: {
        batchesProcessed: 25,
        cacheHitRate: '78.50%',
        averageFPS: 58,
        memoryUsage: '67.23MB',
        eventProcessingTime: '15ms'
    },
    recommendations: ['キャッシュサイズを増やすことを検討してください'],
    detailedStats: { ... }
}
*/
```

### データストレージ API

#### IndexedDBStorageManager

```javascript
// データ保存
await storageManager.saveData('sessions', sessionData);
await storageManager.saveData('bubbleInteractions', interactionData);
await storageManager.saveData('performance', performanceData);

// データ取得
const sessions = await storageManager.getData('sessions', {
    stageId: 'stage_1',
    startTime: { $gte: Date.now() - 7 * 24 * 60 * 60 * 1000 } // 1週間以内
});

// データ集計
const aggregatedData = await storageManager.aggregateData('bubbleInteractions', {
    groupBy: 'bubbleType',
    aggregations: {
        count: { $count: 1 },
        avgReactionTime: { $avg: 'reactionTime' },
        successRate: { $avg: { $cond: [{ $eq: ['action', 'popped'] }, 1, 0] } }
    }
});

// データクリーンアップ
await storageManager.cleanupOldData(30); // 30日以上古いデータを削除
```

### 分析エンジン APIs

#### TrendAnalyzer

```javascript
const trendAnalyzer = new TrendAnalyzer(storageManager);

// 週次トレンド分析
const weeklyTrend = await trendAnalyzer.analyzeWeeklyTrend('score', startDate);
/*
{
    period: 'weekly',
    startDate: timestamp,
    endDate: timestamp,
    dataPoints: [
        { date: timestamp, value: 5200, change: 0.12 },
        { date: timestamp, value: 5500, change: 0.06 }
    ],
    overallTrend: 'improving',
    trendStrength: 0.85
}
*/

// 月次トレンド分析
const monthlyTrend = await trendAnalyzer.analyzeMonthlyTrend('accuracy', startDate);

// 異常パターン検出
const anomalies = trendAnalyzer.detectAnomalies(dataArray, threshold);
/*
[
    { index: 5, value: 1250, expectedRange: [4800, 5200], severity: 'high' },
    { index: 12, value: 3200, expectedRange: [4900, 5300], severity: 'medium' }
]
*/

// 季節調整
const seasonallyAdjusted = trendAnalyzer.seasonalAdjustment(data, 7); // 週次季節性
```

#### ComparisonEngine

```javascript
const comparisonEngine = new ComparisonEngine(storageManager);

// 過去データとの比較
const pastComparison = await comparisonEngine.compareWithPast(currentData, 'week');
/*
{
    period: 'week',
    current: { score: 5500, accuracy: 0.85, playTime: 1800 },
    past: { score: 5200, accuracy: 0.82, playTime: 1950 },
    changes: {
        score: { absolute: 300, percentage: 5.77, trend: 'improved' },
        accuracy: { absolute: 0.03, percentage: 3.66, trend: 'improved' },
        playTime: { absolute: -150, percentage: -7.69, trend: 'decreased' }
    },
    overallAssessment: 'improvement'
}
*/

// ベンチマーク比較
const benchmarkComparison = await comparisonEngine.compareWithBenchmark(userData, 'global');

// ステージ別比較
const stageComparison = await comparisonEngine.compareByStage(stageData);

// 改善提案生成
const suggestions = comparisonEngine.generateImprovementSuggestions(comparisonResult);
/*
[
    {
        area: 'reaction_time',
        currentValue: 520,
        targetValue: 450,
        priority: 'high',
        suggestion: '素早いクリックを意識して、反応時間を70ms改善しましょう。',
        practiceMethod: 'normal_bubbles_focus'
    }
]
*/
```

### データ可視化 APIs

#### AnalyticsDashboard

```javascript
const dashboard = new AnalyticsDashboard(containerElement);

// ダッシュボード初期化
await dashboard.initialize();

// 基本統計表示
await dashboard.renderBasicStats();

// バブルタイプ別分析
await dashboard.renderBubbleAnalysis();

// トレンド分析表示
await dashboard.renderTrendAnalysis({
    period: 'week',
    metrics: ['score', 'accuracy', 'reactionTime']
});

// 比較分析表示
await dashboard.renderComparisonAnalysis({
    compareWith: 'pastWeek',
    metrics: ['score', 'playTime', 'comboCount']
});
```

#### ChartRenderer

```javascript
const chartRenderer = new ChartRenderer();

// 線グラフ作成
const lineChart = chartRenderer.createLineChart(canvasElement, {
    labels: ['月', '火', '水', '木', '金', '土', '日'],
    datasets: [{
        label: 'スコア推移',
        data: [4500, 4800, 5200, 4900, 5500, 5800, 6000],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
    }]
}, {
    responsive: true,
    plugins: {
        title: { display: true, text: '週間スコア推移' }
    }
});

// 棒グラフ作成
const barChart = chartRenderer.createBarChart(canvasElement, barData, options);

// 円グラフ作成
const pieChart = chartRenderer.createPieChart(canvasElement, pieData, options);

// リアルタイムグラフ更新
chartRenderer.updateRealtimeChart('fps-chart', { fps: 58, timestamp: Date.now() });
```

### データエクスポート APIs

#### ExportManager

```javascript
const exportManager = new ExportManager(storageManager);

// JSON形式エクスポート
const jsonData = await exportManager.exportToJSON({
    tables: ['sessions', 'bubbleInteractions'],
    dateRange: {
        start: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30日前
        end: Date.now()
    },
    anonymize: true
});

// CSV形式エクスポート
const csvData = await exportManager.exportToCSV('sessions', {
    columns: ['sessionId', 'stageId', 'finalScore', 'duration', 'completed'],
    filters: { completed: true }
});

// XML形式エクスポート
const xmlData = await exportManager.exportToXML(data, { rootElement: 'analytics' });

// フィルタ付きエクスポート
const filteredData = await exportManager.exportFiltered({
    table: 'bubbleInteractions',
    filters: {
        bubbleType: { $in: ['rainbow', 'boss'] },
        action: 'popped',
        reactionTime: { $lt: 500 }
    },
    sort: { timestamp: -1 },
    limit: 1000
});
```

#### AnalyticsAPI

```javascript
const analyticsAPI = new AnalyticsAPI(storageManager);

// エンドポイント登録
analyticsAPI.registerEndpoint('/stats/summary', async (query) => {
    return await storageManager.aggregateData('sessions', {
        groupBy: 'stageId',
        aggregations: {
            avgScore: { $avg: 'finalScore' },
            totalPlays: { $count: 1 },
            completionRate: { $avg: { $cond: ['completed', 1, 0] } }
        }
    });
});

// データ取得API
const summaryData = await analyticsAPI.getData({
    endpoint: '/stats/summary',
    parameters: { period: 'week' }
});

// 集計データAPI
const aggregatedData = await analyticsAPI.getAggregatedData({
    table: 'bubbleInteractions',
    groupBy: 'bubbleType',
    aggregations: {
        count: { $count: 1 },
        avgScore: { $avg: 'scoreGained' }
    },
    filters: { timestamp: { $gte: Date.now() - 7 * 24 * 60 * 60 * 1000 } }
});
```

### プライバシー管理 APIs

#### PrivacyManager

```javascript
const privacyManager = new PrivacyManager();

// 同意要求
const consent = await privacyManager.requestConsent();

// 同意状況確認
const hasConsent = privacyManager.checkConsent();

// オプトアウト設定
privacyManager.setOptOut('behavior', true);    // 行動分析をオプトアウト
privacyManager.setOptOut('performance', false); // パフォーマンス分析は継続

// オプトアウト確認
const isOptedOut = privacyManager.isOptedOut('behavior');

// データ匿名化
const anonymizedData = privacyManager.anonymizeData({
    userId: 'user123',
    email: 'user@example.com',
    sessionData: { score: 5000, accuracy: 0.85 }
});
/*
{
    sessionData: { score: 5000, accuracy: 0.85 },
    anonymized: true,
    timestamp: timestamp,
    // userId, emailは除去される
}
*/

// ユーザーデータエクスポート
const userData = await privacyManager.exportUserData(async () => {
    return {
        sessions: await storageManager.getData('sessions'),
        interactions: await storageManager.getData('bubbleInteractions')
    };
});

// ユーザーデータ削除
await privacyManager.deleteUserData(async () => {
    await storageManager.deleteData('sessions', {});
    await storageManager.deleteData('bubbleInteractions', {});
});
```

## イベントドリブン APIs

### データ収集イベント

```javascript
// カスタムイベントリスナー登録
analyticsManager.addEventListener('dataCollected', (event) => {
    console.log('Data collected:', event.detail);
});

analyticsManager.addEventListener('sessionStarted', (event) => {
    console.log('Session started:', event.detail.sessionId);
});

analyticsManager.addEventListener('sessionEnded', (event) => {
    console.log('Session ended:', event.detail);
});

// パフォーマンス警告イベント
analyticsManager.addEventListener('performanceWarning', (event) => {
    console.warn('Performance issue:', event.detail);
    // 自動的に最適化設定を調整
    analyticsManager.adjustPerformanceConfiguration({
        batchSize: Math.max(10, event.detail.suggestedBatchSize)
    });
});
```

## エラーハンドリング

### エラータイプと対処法

```javascript
try {
    await analyticsManager.initialize();
} catch (error) {
    switch (error.name) {
        case 'StorageInitializationError':
            // IndexedDBが利用できない場合
            console.warn('Falling back to LocalStorage');
            break;
            
        case 'PrivacyConsentError':
            // プライバシー同意が得られない場合
            console.info('Analytics disabled due to privacy settings');
            break;
            
        case 'QuotaExceededError':
            // ストレージ容量不足
            await analyticsManager.performanceOptimizer.performMemoryCleanup();
            break;
            
        default:
            console.error('Analytics initialization failed:', error);
    }
}

// エラー回復メカニズム
analyticsManager.addEventListener('error', async (event) => {
    const { error, context } = event.detail;
    
    if (error.name === 'DataCollectionError') {
        // データ収集エラーの場合、一時的に無効化
        analyticsManager.updateSettings({ enableGameAnalytics: false });
        
        // 30秒後に再有効化を試行
        setTimeout(() => {
            analyticsManager.updateSettings({ enableGameAnalytics: true });
        }, 30000);
    }
});
```

## パフォーマンス最適化

### バッチ処理設定

```javascript
// 高頻度データ環境用設定
const highFrequencyConfig = {
    batchSize: 100,          // 大きなバッチサイズ
    batchTimeout: 2000,      // 短いタイムアウト
    maxBatchDelay: 10000     // 最大遅延時間
};

// リソース制約環境用設定
const lowResourceConfig = {
    batchSize: 20,           // 小さなバッチサイズ
    batchTimeout: 10000,     // 長いタイムアウト
    cacheSize: 200          // 小さなキャッシュ
};

analyticsManager.adjustPerformanceConfiguration(highFrequencyConfig);
```

### キャッシュ戦略

```javascript
// キャッシュ付きデータアクセス
const getCachedStats = () => {
    const cacheKey = 'weekly_stats';
    let stats = analyticsManager.getCachedAnalyticsData(cacheKey);
    
    if (!stats) {
        stats = calculateWeeklyStats();
        analyticsManager.setCachedAnalyticsData(cacheKey, stats);
    }
    
    return stats;
};

// キャッシュ無効化
analyticsManager.performanceOptimizer.cache.delete('weekly_stats');
```

## セキュリティとプライバシー

### データ保護

```javascript
// GDPR準拠設定
const gdprConfig = {
    enableGDPRMode: true,
    dataRetentionDays: 365,      // 1年間保持
    anonymizeAfterDays: 30,      // 30日後に匿名化
    requireExplicitConsent: true
};

// データ暗号化（実装例）
const encryptedData = privacyManager.encryptSensitiveData(userData);
const decryptedData = privacyManager.decryptSensitiveData(encryptedData);
```

### アクセス制御

```javascript
// API アクセス制限
analyticsAPI.setRateLimit('/stats/export', {
    requests: 10,
    window: 3600000  // 1時間に10リクエスト
});

// データアクセス権限チェック
const hasPermission = await privacyManager.checkDataAccess('performance_data');
```

## 使用例とベストプラクティス

### 基本的な使用パターン

```javascript
// 1. システム初期化
const analytics = new EnhancedAnalyticsManager();
await analytics.initialize();

// 2. ゲームセッション開始
analytics.startSession({
    sessionId: generateSessionId(),
    stageId: currentStage.id,
    difficulty: currentDifficulty,
    startTime: Date.now(),
    previousBestScore: playerData.getBestScore(currentStage.id)
});

// 3. ゲームプレイ中のデータ収集
gameEngine.addEventListener('bubbleClick', (event) => {
    analytics.recordPlayerInteractionPattern({
        bubbleType: event.bubble.type,
        action: event.result.action,
        reactionTime: event.reactionTime,
        comboCount: scoreManager.currentCombo,
        currentScore: scoreManager.currentScore,
        stageProgress: gameEngine.getProgress(),
        playerHP: player.hp,
        timeRemaining: gameEngine.timeRemaining
    });
});

// 4. セッション終了
gameEngine.addEventListener('gameEnd', (event) => {
    analytics.updatePlayerBehaviorAnalysis({
        exitReason: event.reason,
        finalScore: event.finalScore,
        completed: event.completed,
        timeRemaining: event.timeRemaining,
        hpRemaining: player.hp,
        bubblesRemaining: event.bubblesRemaining,
        maxCombo: scoreManager.maxCombo,
        activeItems: itemManager.getActiveItems()
    });
});

// 5. 定期的な統計確認
setInterval(() => {
    const report = analytics.generatePerformanceReport();
    if (report.recommendations.length > 0) {
        console.log('Performance recommendations:', report.recommendations);
    }
}, 60000); // 1分間隔
```

### 高度な使用パターン

```javascript
// カスタム分析ロジック
class CustomAnalyzer {
    constructor(analyticsManager) {
        this.analytics = analyticsManager;
    }
    
    async analyzePlayerSkillProgression() {
        const sessions = await this.analytics.storageManager.getData('sessions', {
            timestamp: { $gte: Date.now() - 30 * 24 * 60 * 60 * 1000 }
        });
        
        const progression = sessions.map(session => ({
            date: session.startTime,
            accuracy: session.successRate,
            avgReactionTime: session.avgReactionTime,
            skillScore: this.calculateSkillScore(session)
        }));
        
        return this.analytics.trendAnalyzer.analyzeProgression(progression);
    }
    
    calculateSkillScore(session) {
        const accuracyWeight = 0.4;
        const speedWeight = 0.3;
        const consistencyWeight = 0.3;
        
        const accuracyScore = session.successRate * 100;
        const speedScore = Math.max(0, 100 - session.avgReactionTime / 10);
        const consistencyScore = Math.max(0, 100 - session.reactionTimeVariance);
        
        return accuracyWeight * accuracyScore + 
               speedWeight * speedScore + 
               consistencyWeight * consistencyScore;
    }
}
```

## APIレスポンス形式

### 標準レスポンス形式

```typescript
interface AnalyticsResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    metadata?: {
        timestamp: number;
        version: string;
        cached: boolean;
        processingTime: number;
    };
}
```

### エラーコード一覧

| コード | 説明 | 対処法 |
|--------|------|--------|
| `INIT_001` | 初期化失敗 | 再初期化を実行 |
| `STORAGE_001` | ストレージエラー | フォールバック実行 |
| `PRIVACY_001` | プライバシー同意未取得 | 同意要求表示 |
| `QUOTA_001` | ストレージ容量不足 | データクリーンアップ |
| `PERFORMANCE_001` | パフォーマンス閾値超過 | 設定最適化実行 |
| `VALIDATION_001` | データ検証エラー | データ形式確認 |

## バージョン互換性

### マイグレーション

```javascript
// データスキーマ マイグレーション
class DataMigrator {
    async migrateToVersion(targetVersion) {
        const currentVersion = await this.getCurrentVersion();
        
        if (currentVersion < targetVersion) {
            for (let version = currentVersion + 1; version <= targetVersion; version++) {
                await this.runMigration(version);
            }
        }
    }
    
    async runMigration(version) {
        switch (version) {
            case 2:
                await this.migrateToV2();
                break;
            case 3:
                await this.migrateToV3();
                break;
        }
    }
}
```

この API仕様書は、ゲーム分析機能の全ての公開インターフェースを包含し、開発者が効率的に機能を統合・活用できるよう設計されています。