# 設定システム トラブルシューティングガイド

## 概要

このガイドでは、新しい設定システムで発生する可能性のある問題とその解決方法について説明します。問題の症状、原因、解決手順を体系的に整理しています。

## 問題の分類

### 1. 設定関連の問題
- 設定値が取得できない
- 設定値が反映されない
- 設定の検証エラー
- デフォルト値が使用される

### 2. パフォーマンス関連の問題
- 設定アクセスが遅い
- 計算処理が遅い
- メモリ使用量が多い
- キャッシュ効率が悪い

### 3. 互換性関連の問題
- 旧APIが動作しない
- 移行後の動作不良
- 設定値の不整合

### 4. システム関連の問題
- 初期化エラー
- メモリリーク
- エラーハンドリングの問題

## 診断ツール

### 1. デバッグ情報の取得

```javascript
// 設定システムの状態確認
function getSystemDiagnostics() {
    const configManager = getConfigurationManager();
    const calcEngine = getCalculationEngine();
    
    return {
        timestamp: new Date().toISOString(),
        configuration: {
            stats: configManager.getPerformanceStats(),
            cacheSize: configManager.cache.size,
            watcherCount: configManager.watchers.size,
            categories: Array.from(configManager.configurations.keys())
        },
        calculation: {
            stats: calcEngine.getExtendedCacheStats(),
            registeredCalculators: calcEngine.getRegisteredCalculators(),
            batchQueueSize: calcEngine.batchQueue.size
        },
        memory: {
            heapUsed: performance.memory?.usedJSHeapSize || 0,
            heapTotal: performance.memory?.totalJSHeapSize || 0,
            heapLimit: performance.memory?.jsHeapSizeLimit || 0
        }
    };
}

// 使用例
console.log('システム診断:', JSON.stringify(getSystemDiagnostics(), null, 2));
```

### 2. ログレベルの設定

```javascript
// デバッグモードの有効化
function enableDebugMode() {
    // URLパラメータでデバッグモードを有効化
    const url = new URL(window.location);
    url.searchParams.set('debug', 'true');
    window.history.replaceState({}, '', url);
    
    // ローカルストレージでも設定
    localStorage.setItem('debugMode', 'true');
    
    console.log('デバッグモードが有効になりました');
}

// ログレベルの設定
function setLogLevel(level) {
    const loggingSystem = getLoggingSystem();
    loggingSystem.setLevel(level); // 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'
    
    console.log(`ログレベルを ${level} に設定しました`);
}
```

### 3. パフォーマンス測定

```javascript
// パフォーマンス測定ユーティリティ
class PerformanceMeasurer {
    constructor() {
        this.measurements = new Map();
    }
    
    start(name) {
        this.measurements.set(name, {
            startTime: performance.now(),
            startMemory: performance.memory?.usedJSHeapSize || 0
        });
    }
    
    end(name) {
        const measurement = this.measurements.get(name);
        if (!measurement) {
            console.warn(`測定 "${name}" が開始されていません`);
            return null;
        }
        
        const result = {
            duration: performance.now() - measurement.startTime,
            memoryDelta: (performance.memory?.usedJSHeapSize || 0) - measurement.startMemory
        };
        
        this.measurements.delete(name);
        return result;
    }
    
    measure(name, fn) {
        this.start(name);
        const result = fn();
        const perf = this.end(name);
        
        console.log(`${name}: ${perf.duration.toFixed(2)}ms, メモリ: ${perf.memoryDelta} bytes`);
        return result;
    }
}

// 使用例
const measurer = new PerformanceMeasurer();
const result = measurer.measure('設定取得テスト', () => {
    const configManager = getConfigurationManager();
    for (let i = 0; i < 1000; i++) {
        configManager.get('game', 'scoring.baseScores.normal', 15);
    }
});
```

## よくある問題と解決方法

### 1. 設定値が取得できない

#### 症状
```javascript
const configManager = getConfigurationManager();
const value = configManager.get('game', 'scoring.baseScores.normal');
console.log(value); // undefined または null
```

#### 原因と解決方法

**原因1: 設定が初期化されていない**
```javascript
// 問題の確認
const gameConfig = getGameConfig();
console.log('GameConfig初期化状態:', gameConfig.getDebugInfo());

// 解決方法: 手動で初期化
gameConfig._initialize();
```

**原因2: キーの指定が間違っている**
```javascript
// 問題の確認
const configManager = getConfigurationManager();
const allCategories = configManager.getCategory('game');
console.log('利用可能な設定:', Object.keys(allCategories));

// 解決方法: 正しいキーを使用
const correctValue = configManager.get('game', 'scoring.baseScores.normal', 15);
```

**原因3: カテゴリが存在しない**
```javascript
// 問題の確認
const configManager = getConfigurationManager();
const categories = Array.from(configManager.configurations.keys());
console.log('利用可能なカテゴリ:', categories);

// 解決方法: カテゴリを作成または正しいカテゴリを使用
if (!configManager.configurations.has('game')) {
    configManager.configurations.set('game', new Map());
}
```

### 2. 設定値が反映されない

#### 症状
```javascript
const configManager = getConfigurationManager();
configManager.set('audio', 'volumes.master', 0.9);
const value = configManager.get('audio', 'volumes.master');
console.log(value); // 0.9以外の値が返される
```

#### 原因と解決方法

**原因1: キャッシュが古い**
```javascript
// 問題の確認
const cacheStats = configManager.getPerformanceStats();
console.log('キャッシュ統計:', cacheStats);

// 解決方法: キャッシュをクリア
configManager.clearCache('audio');
// または特定のキーのみクリア
configManager.cache.delete('audio.volumes.master');
```

**原因2: 検証エラーで設定が拒否されている**
```javascript
// 問題の確認
const isValid = configManager.validate('audio', 'volumes.master', 0.9);
console.log('検証結果:', isValid);

// 解決方法: 検証ルールを確認・修正
const rule = configManager.validationRules.get('audio.volumes.master');
console.log('検証ルール:', rule);

// 適切な値に修正
if (rule && rule.max && 0.9 > rule.max) {
    configManager.set('audio', 'volumes.master', rule.max);
}
```

**原因3: 監視者が設定を上書きしている**
```javascript
// 問題の確認
const watchers = configManager.watchers.get('audio.volumes.master');
console.log('監視者数:', watchers ? watchers.size : 0);

// 解決方法: 監視者を一時的に無効化
const watcherIds = [];
if (watchers) {
    for (const [id] of watchers) {
        watcherIds.push(id);
        configManager.unwatch(id);
    }
}

// 設定を変更
configManager.set('audio', 'volumes.master', 0.9);

// 監視者を再登録（必要に応じて）
```

### 3. パフォーマンスが低下している

#### 症状
- 設定アクセスが遅い
- 計算処理に時間がかかる
- ブラウザが重くなる

#### 診断方法

```javascript
// パフォーマンス診断
function diagnosePerformance() {
    const configManager = getConfigurationManager();
    const calcEngine = getCalculationEngine();
    
    const configStats = configManager.getPerformanceStats();
    const calcStats = calcEngine.getExtendedCacheStats();
    
    console.log('=== パフォーマンス診断 ===');
    console.log('設定アクセス統計:', configStats);
    console.log('計算処理統計:', calcStats);
    
    // 問題の特定
    const issues = [];
    
    if (parseFloat(configStats.hitRate) < 70) {
        issues.push('設定キャッシュのヒット率が低い');
    }
    
    if (parseFloat(calcStats.hitRate) < 60) {
        issues.push('計算キャッシュのヒット率が低い');
    }
    
    if (configStats.cachedKeys > 1000) {
        issues.push('設定キャッシュサイズが大きすぎる');
    }
    
    if (calcStats.batchQueueSize > 10) {
        issues.push('バッチキューが詰まっている');
    }
    
    console.log('検出された問題:', issues);
    return issues;
}
```

#### 解決方法

**キャッシュヒット率の改善**
```javascript
// プリロードキーの追加
const configManager = getConfigurationManager();
configManager.addPreloadKey('game', 'scoring.baseScores.normal');
configManager.addPreloadKey('audio', 'volumes.master');
configManager.addPreloadKey('performance', 'optimization.maxBubbles');

// キャッシュウォームアップ
configManager.warmupCache();

// メモ化の有効化
const calcEngine = getCalculationEngine();
calcEngine.enableMemoization('score', ['calculateBaseScore', 'calculateComboMultiplier']);
```

**メモリ使用量の最適化**
```javascript
// キャッシュサイズの調整
configManager.cacheConfig.maxSize = 500; // デフォルト: 2000

// 定期的なクリーンアップ
setInterval(() => {
    configManager.clearCache();
    calcEngine.clearCache();
    
    // ガベージコレクションの強制実行（開発時のみ）
    if (window.gc && typeof window.gc === 'function') {
        window.gc();
    }
}, 300000); // 5分間隔
```

**計算処理の最適化**
```javascript
// バッチ処理の有効化
const calcEngine = getCalculationEngine();
calcEngine.optimizationConfig.batchProcessing = true;

// 並列処理の有効化（将来の拡張）
calcEngine.optimizationConfig.parallelProcessing = true;

// 重い計算の特定と最適化
const performanceStats = calcEngine.getExtendedCacheStats();
console.log('重い計算処理:', performanceStats.topPerformingMethods);
```

### 4. メモリリークが発生している

#### 症状
- メモリ使用量が継続的に増加
- ブラウザが徐々に重くなる
- 最終的にクラッシュする

#### 診断方法

```javascript
// メモリリーク診断
class MemoryLeakDetector {
    constructor() {
        this.measurements = [];
        this.interval = null;
    }
    
    start() {
        this.interval = setInterval(() => {
            const memory = performance.memory;
            if (memory) {
                this.measurements.push({
                    timestamp: Date.now(),
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit
                });
                
                // 古い測定値を削除（直近1時間のみ保持）
                const cutoff = Date.now() - 3600000;
                this.measurements = this.measurements.filter(m => m.timestamp > cutoff);
            }
        }, 10000); // 10秒間隔
    }
    
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    
    analyze() {
        if (this.measurements.length < 2) {
            return { status: 'insufficient_data' };
        }
        
        const first = this.measurements[0];
        const last = this.measurements[this.measurements.length - 1];
        const duration = last.timestamp - first.timestamp;
        const memoryIncrease = last.used - first.used;
        const increaseRate = memoryIncrease / duration * 1000; // bytes/sec
        
        return {
            status: increaseRate > 1000 ? 'potential_leak' : 'normal',
            increaseRate: increaseRate,
            totalIncrease: memoryIncrease,
            duration: duration,
            measurements: this.measurements.length
        };
    }
}

// 使用例
const detector = new MemoryLeakDetector();
detector.start();

// 1時間後に分析
setTimeout(() => {
    const analysis = detector.analyze();
    console.log('メモリリーク分析:', analysis);
    detector.stop();
}, 3600000);
```

#### 解決方法

**イベントリスナーの適切な削除**
```javascript
// 問題のあるコード
class BadComponent {
    constructor() {
        this.configManager = getConfigurationManager();
        this.watchId = this.configManager.watch('game', 'scoring.baseScores.normal', this.handleChange.bind(this));
    }
    
    handleChange(newValue) {
        console.log('設定が変更されました:', newValue);
    }
    
    // destroy メソッドがない → メモリリーク
}

// 修正されたコード
class GoodComponent {
    constructor() {
        this.configManager = getConfigurationManager();
        this.watchId = this.configManager.watch('game', 'scoring.baseScores.normal', this.handleChange.bind(this));
    }
    
    handleChange(newValue) {
        console.log('設定が変更されました:', newValue);
    }
    
    destroy() {
        // 監視を解除
        if (this.watchId) {
            this.configManager.unwatch(this.watchId);
            this.watchId = null;
        }
        
        // 参照を削除
        this.configManager = null;
    }
}
```

**循環参照の回避**
```javascript
// 問題のあるコード
class BadCalculator {
    constructor() {
        this.parent = null;
        this.children = [];
    }
    
    addChild(child) {
        child.parent = this; // 循環参照
        this.children.push(child);
    }
}

// 修正されたコード
class GoodCalculator {
    constructor() {
        this.parentId = null; // IDで参照
        this.childIds = [];
    }
    
    addChild(child) {
        child.parentId = this.id;
        this.childIds.push(child.id);
    }
    
    destroy() {
        // 参照を明示的に削除
        this.parentId = null;
        this.childIds = [];
    }
}
```

**キャッシュサイズの制限**
```javascript
// キャッシュサイズの監視と制限
function limitCacheSize() {
    const configManager = getConfigurationManager();
    const calcEngine = getCalculationEngine();
    
    // 設定キャッシュの制限
    if (configManager.cache.size > 1000) {
        console.warn('設定キャッシュサイズが大きすぎます:', configManager.cache.size);
        configManager.clearCache();
    }
    
    // 計算キャッシュの制限
    const calcStats = calcEngine.getCacheStats();
    if (calcStats.size > 2000) {
        console.warn('計算キャッシュサイズが大きすぎます:', calcStats.size);
        calcEngine.clearCache();
    }
}

// 定期的にチェック
setInterval(limitCacheSize, 60000); // 1分間隔
```

### 5. 互換性の問題

#### 症状
- 旧APIが動作しない
- 移行後に設定値が変わる
- 計算結果が異なる

#### 診断方法

```javascript
// 互換性チェック
function checkCompatibility() {
    const issues = [];
    
    // 旧APIの存在確認
    try {
        const BALANCE_CONFIG = window.BALANCE_CONFIG;
        if (!BALANCE_CONFIG) {
            issues.push('BALANCE_CONFIG が見つかりません');
        }
    } catch (error) {
        issues.push(`BALANCE_CONFIG アクセスエラー: ${error.message}`);
    }
    
    // 設定値の整合性確認
    try {
        const gameConfig = getGameConfig();
        const oldValue = window.BALANCE_CONFIG?.scoring?.baseScores?.normal;
        const newValue = gameConfig.getBubbleBaseScore('normal');
        
        if (oldValue && newValue && oldValue !== newValue) {
            issues.push(`設定値の不整合: 旧=${oldValue}, 新=${newValue}`);
        }
    } catch (error) {
        issues.push(`設定値比較エラー: ${error.message}`);
    }
    
    // 計算結果の整合性確認
    try {
        const gameConfig = getGameConfig();
        const calcEngine = getCalculationEngine();
        
        const oldResult = gameConfig.calculateScore('normal', 0.5);
        const newResult = calcEngine.calculate('score', 'calculateBaseScore', ['normal', 0.5]);
        
        if (Math.abs(oldResult - newResult) > 0.01) {
            issues.push(`計算結果の不整合: 旧=${oldResult}, 新=${newResult}`);
        }
    } catch (error) {
        issues.push(`計算結果比較エラー: ${error.message}`);
    }
    
    return issues;
}

// 使用例
const compatibilityIssues = checkCompatibility();
if (compatibilityIssues.length > 0) {
    console.warn('互換性の問題が検出されました:', compatibilityIssues);
}
```

#### 解決方法

**互換性レイヤーの使用**
```javascript
// GameBalanceCompatibilityを使用
import { getGameBalanceCompatibility } from '../core/GameBalanceCompatibility.js';

const compatibility = getGameBalanceCompatibility();

// 旧API形式でアクセス（警告付き）
const oldStyleConfig = compatibility.getBALANCE_CONFIG();
const score = compatibility.calculateScore('diamond', 0.8);

// 段階的に新APIに移行
const gameConfig = getGameConfig();
const newScore = gameConfig.calculateScore('diamond', 0.8);
```

**設定値の同期**
```javascript
// 旧システムから新システムへの設定同期
function syncLegacySettings() {
    const configManager = getConfigurationManager();
    const gameConfig = getGameConfig();
    
    if (window.BALANCE_CONFIG) {
        const legacy = window.BALANCE_CONFIG;
        
        // スコア設定の同期
        if (legacy.scoring?.baseScores) {
            for (const [bubbleType, score] of Object.entries(legacy.scoring.baseScores)) {
                configManager.set('game', `scoring.baseScores.${bubbleType}`, score);
            }
        }
        
        // その他の設定も同様に同期
        console.log('レガシー設定の同期が完了しました');
    }
}

// アプリケーション起動時に実行
syncLegacySettings();
```

### 6. 初期化エラー

#### 症状
```
Error: ConfigurationManager is not initialized
Error: Calculator 'score' is not registered
```

#### 解決方法

**初期化順序の確認**
```javascript
// 正しい初期化順序
async function initializeConfigurationSystem() {
    try {
        // 1. ConfigurationManagerの初期化
        const configManager = getConfigurationManager();
        console.log('ConfigurationManager initialized');
        
        // 2. 各種Configクラスの初期化
        const gameConfig = getGameConfig();
        const audioConfig = getAudioConfig();
        const effectsConfig = getEffectsConfig();
        const performanceConfig = getPerformanceConfig();
        console.log('Config classes initialized');
        
        // 3. CalculationEngineの初期化
        const calcEngine = getCalculationEngine();
        console.log('CalculationEngine initialized');
        
        // 4. 計算処理クラスの登録確認
        const registeredCalculators = calcEngine.getRegisteredCalculators();
        console.log('Registered calculators:', registeredCalculators);
        
        if (!registeredCalculators.includes('score')) {
            console.warn('ScoreCalculator not registered, registering manually...');
            const { getScoreCalculator } = await import('../core/ScoreCalculator.js');
            calcEngine.registerCalculator('score', getScoreCalculator());
        }
        
        console.log('Configuration system initialization complete');
        return true;
        
    } catch (error) {
        console.error('Configuration system initialization failed:', error);
        return false;
    }
}

// 使用例
initializeConfigurationSystem().then(success => {
    if (success) {
        // アプリケーションの開始
        startApplication();
    } else {
        // エラーハンドリング
        showInitializationError();
    }
});
```

**手動初期化**
```javascript
// 緊急時の手動初期化
function forceInitialization() {
    try {
        // ConfigurationManagerの強制初期化
        const configManager = getConfigurationManager();
        configManager._initialize();
        
        // デフォルト設定の強制設定
        configManager.set('game', 'scoring.baseScores.normal', 15);
        configManager.set('audio', 'volumes.master', 0.7);
        configManager.set('effects', 'particles.maxCount', 500);
        configManager.set('performance', 'optimization.targetFPS', 60);
        
        // 計算処理クラスの手動登録
        const calcEngine = getCalculationEngine();
        
        // ScoreCalculatorの手動作成と登録
        const scoreCalculator = {
            calculateBaseScore: (bubbleType, ageRatio) => {
                const baseScores = { normal: 15, stone: 35, iron: 65, diamond: 120 };
                return baseScores[bubbleType] || 15;
            },
            calculateComboMultiplier: (comboCount) => {
                return Math.min(1 + (comboCount - 1) * 0.08, 2.5);
            }
        };
        calcEngine.registerCalculator('score', scoreCalculator);
        
        console.log('強制初期化が完了しました');
        return true;
        
    } catch (error) {
        console.error('強制初期化に失敗しました:', error);
        return false;
    }
}
```

## 予防的メンテナンス

### 1. 定期的なヘルスチェック

```javascript
// システムヘルスチェック
class SystemHealthChecker {
    constructor() {
        this.checks = [
            this.checkConfigurationManager,
            this.checkCalculationEngine,
            this.checkMemoryUsage,
            this.checkCacheEfficiency,
            this.checkErrorRate
        ];
    }
    
    async runHealthCheck() {
        const results = [];
        
        for (const check of this.checks) {
            try {
                const result = await check.call(this);
                results.push(result);
            } catch (error) {
                results.push({
                    name: check.name,
                    status: 'ERROR',
                    message: error.message
                });
            }
        }
        
        return this.generateHealthReport(results);
    }
    
    checkConfigurationManager() {
        const configManager = getConfigurationManager();
        const stats = configManager.getPerformanceStats();
        
        return {
            name: 'ConfigurationManager',
            status: parseFloat(stats.hitRate) > 70 ? 'OK' : 'WARNING',
            details: stats
        };
    }
    
    checkCalculationEngine() {
        const calcEngine = getCalculationEngine();
        const stats = calcEngine.getCacheStats();
        
        return {
            name: 'CalculationEngine',
            status: parseFloat(stats.hitRate) > 60 ? 'OK' : 'WARNING',
            details: stats
        };
    }
    
    checkMemoryUsage() {
        const memory = performance.memory;
        if (!memory) {
            return {
                name: 'MemoryUsage',
                status: 'UNKNOWN',
                message: 'Memory API not available'
            };
        }
        
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        return {
            name: 'MemoryUsage',
            status: usageRatio < 0.8 ? 'OK' : usageRatio < 0.9 ? 'WARNING' : 'CRITICAL',
            details: {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit,
                usageRatio: usageRatio
            }
        };
    }
    
    generateHealthReport(results) {
        const summary = {
            timestamp: new Date().toISOString(),
            overallStatus: 'OK',
            checks: results,
            recommendations: []
        };
        
        // 全体的なステータスを決定
        const hasError = results.some(r => r.status === 'ERROR');
        const hasCritical = results.some(r => r.status === 'CRITICAL');
        const hasWarning = results.some(r => r.status === 'WARNING');
        
        if (hasError || hasCritical) {
            summary.overallStatus = 'CRITICAL';
        } else if (hasWarning) {
            summary.overallStatus = 'WARNING';
        }
        
        // 推奨事項を生成
        results.forEach(result => {
            if (result.status === 'WARNING' || result.status === 'CRITICAL') {
                summary.recommendations.push(this.getRecommendation(result));
            }
        });
        
        return summary;
    }
    
    getRecommendation(result) {
        switch (result.name) {
            case 'ConfigurationManager':
                return 'キャッシュヒット率が低下しています。プリロードキーの追加を検討してください。';
            case 'CalculationEngine':
                return '計算キャッシュの効率が悪化しています。メモ化の有効化を検討してください。';
            case 'MemoryUsage':
                return 'メモリ使用量が高くなっています。キャッシュサイズの調整や定期的なクリーンアップを実施してください。';
            default:
                return `${result.name} で問題が検出されました。詳細を確認してください。`;
        }
    }
}

// 使用例
const healthChecker = new SystemHealthChecker();
healthChecker.runHealthCheck().then(report => {
    console.log('システムヘルスレポート:', report);
    
    if (report.overallStatus !== 'OK') {
        console.warn('システムに問題があります:', report.recommendations);
    }
});
```

### 2. 自動修復機能

```javascript
// 自動修復システム
class AutoRepairSystem {
    constructor() {
        this.repairActions = new Map([
            ['low_cache_hit_rate', this.repairCacheHitRate],
            ['high_memory_usage', this.repairMemoryUsage],
            ['initialization_error', this.repairInitialization],
            ['validation_errors', this.repairValidation]
        ]);
    }
    
    async diagnoseAndRepair() {
        const issues = await this.diagnoseIssues();
        const repairResults = [];
        
        for (const issue of issues) {
            const repairAction = this.repairActions.get(issue.type);
            if (repairAction) {
                try {
                    const result = await repairAction.call(this, issue);
                    repairResults.push({
                        issue: issue.type,
                        status: 'REPAIRED',
                        details: result
                    });
                } catch (error) {
                    repairResults.push({
                        issue: issue.type,
                        status: 'FAILED',
                        error: error.message
                    });
                }
            }
        }
        
        return repairResults;
    }
    
    async diagnoseIssues() {
        const issues = [];
        
        // キャッシュヒット率の診断
        const configManager = getConfigurationManager();
        const configStats = configManager.getPerformanceStats();
        if (parseFloat(configStats.hitRate) < 70) {
            issues.push({
                type: 'low_cache_hit_rate',
                severity: 'MEDIUM',
                details: configStats
            });
        }
        
        // メモリ使用量の診断
        if (performance.memory) {
            const usageRatio = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
            if (usageRatio > 0.8) {
                issues.push({
                    type: 'high_memory_usage',
                    severity: usageRatio > 0.9 ? 'HIGH' : 'MEDIUM',
                    details: { usageRatio, memory: performance.memory }
                });
            }
        }
        
        return issues;
    }
    
    repairCacheHitRate(issue) {
        const configManager = getConfigurationManager();
        
        // プリロードキーを追加
        const commonKeys = [
            'game.scoring.baseScores.normal',
            'audio.volumes.master',
            'effects.particles.maxCount',
            'performance.optimization.targetFPS'
        ];
        
        commonKeys.forEach(key => {
            const [category, keyPath] = key.split('.', 2);
            configManager.addPreloadKey(category, keyPath);
        });
        
        // キャッシュウォームアップ
        configManager.warmupCache();
        
        return { action: 'added_preload_keys_and_warmed_cache', keys: commonKeys };
    }
    
    repairMemoryUsage(issue) {
        const configManager = getConfigurationManager();
        const calcEngine = getCalculationEngine();
        
        // キャッシュサイズを削減
        const originalConfigCacheSize = configManager.cacheConfig.maxSize;
        const originalCalcCacheSize = calcEngine.cacheConfig.maxSize;
        
        configManager.cacheConfig.maxSize = Math.floor(originalConfigCacheSize * 0.7);
        calcEngine.cacheConfig.maxSize = Math.floor(originalCalcCacheSize * 0.7);
        
        // キャッシュをクリア
        configManager.clearCache();
        calcEngine.clearCache();
        
        return {
            action: 'reduced_cache_sizes_and_cleared',
            configCacheSize: { old: originalConfigCacheSize, new: configManager.cacheConfig.maxSize },
            calcCacheSize: { old: originalCalcCacheSize, new: calcEngine.cacheConfig.maxSize }
        };
    }
}

// 使用例
const autoRepair = new AutoRepairSystem();
autoRepair.diagnoseAndRepair().then(results => {
    console.log('自動修復結果:', results);
});
```

## サポートとエスカレーション

### 1. ログの収集

```javascript
// 包括的なログ収集
function collectDiagnosticLogs() {
    const logs = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        system: getSystemDiagnostics(),
        errors: getRecentErrors(),
        performance: getPerformanceMetrics(),
        configuration: getConfigurationSnapshot()
    };
    
    return JSON.stringify(logs, null, 2);
}

function getRecentErrors() {
    // エラーログシステムから最近のエラーを取得
    const errorHandler = getErrorHandler();
    return errorHandler.getRecentErrors(50); // 直近50件
}

function getPerformanceMetrics() {
    return {
        memory: performance.memory,
        timing: performance.timing,
        navigation: performance.navigation
    };
}

function getConfigurationSnapshot() {
    const configManager = getConfigurationManager();
    return {
        categories: Array.from(configManager.configurations.keys()),
        cacheSize: configManager.cache.size,
        watcherCount: configManager.watchers.size,
        stats: configManager.getPerformanceStats()
    };
}
```

### 2. 問題報告テンプレート

```markdown
## 問題報告テンプレート

### 基本情報
- 発生日時: [YYYY-MM-DD HH:MM:SS]
- ブラウザ: [Chrome/Firefox/Safari/Edge] [バージョン]
- OS: [Windows/macOS/Linux] [バージョン]
- URL: [問題が発生したページのURL]

### 問題の詳細
- 症状: [具体的な症状を記述]
- 再現手順: 
  1. [手順1]
  2. [手順2]
  3. [手順3]
- 期待する動作: [期待していた動作]
- 実際の動作: [実際に起こった動作]

### エラーメッセージ
```
[エラーメッセージをここに貼り付け]
```

### 診断情報
```javascript
// 以下のコードを実行して結果を貼り付けてください
console.log(collectDiagnosticLogs());
```

### 追加情報
- 問題の頻度: [常に/時々/稀に]
- 影響範囲: [全機能/特定機能のみ]
- 回避策: [あれば記述]
```

### 3. エスカレーション基準

| 重要度 | 基準 | 対応時間 | エスカレーション先 |
|--------|------|----------|-------------------|
| Critical | システム全体が停止、データ損失 | 1時間以内 | 開発チームリーダー |
| High | 主要機能が使用不可 | 4時間以内 | 開発チーム |
| Medium | 一部機能に問題、回避策あり | 1営業日以内 | 担当開発者 |
| Low | 軽微な問題、影響限定的 | 1週間以内 | バックログ |

## 関連ドキュメント

- [API ドキュメント](./configuration-system-api.md)
- [移行ガイド](./migration-guide.md)
- [詳細設計書](./system-design-detailed.md)
- [要件定義書](../.kiro/specs/configuration-refactoring/requirements.md)