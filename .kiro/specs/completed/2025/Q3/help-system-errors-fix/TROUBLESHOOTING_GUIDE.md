# ヘルプシステム トラブルシューティングガイド

**Issue #162 対応** - ヘルプシステムで発生する可能性のある問題の診断と解決方法

## 目次

1. [一般的な問題と解決策](#一般的な問題と解決策)
2. [翻訳関連の問題](#翻訳関連の問題)
3. [アクセシビリティ問題](#アクセシビリティ問題)
4. [パフォーマンス問題](#パフォーマンス問題)
5. [エラー境界問題](#エラー境界問題)
6. [診断ツール](#診断ツール)
7. [ログ解析](#ログ解析)
8. [緊急時対応](#緊急時対応)

---

## 一般的な問題と解決策

### 問題1: ヘルプページが表示されない

**症状**:
- ヘルプボタンをクリックしても何も表示されない
- 白い画面またはエラーメッセージが表示される

**考えられる原因**:
1. HelpSceneの初期化失敗
2. 必要なリソースの読み込み失敗
3. JavaScriptエラーによる処理停止

**診断手順**:
```javascript
// 1. HelpSceneの状態確認
console.log('HelpScene:', helpScene);
console.log('HelpScene initialized:', helpScene.isInitialized);

// 2. エラーログの確認
const errorBoundary = helpScene.helpErrorBoundary;
console.log('Error stats:', errorBoundary.getStats());
console.log('Error history:', errorBoundary.getErrorHistory());

// 3. 依存関係の確認
console.log('Dependencies:', {
    contentManager: !!helpScene.helpContentManager,
    renderer: !!helpScene.helpRenderer,
    accessibilityManager: !!helpScene.helpAccessibilityManager
});
```

**解決策**:
1. **初期化の再実行**:
   ```javascript
   helpScene.reinitialize();
   ```

2. **セーフモードでの起動**:
   ```javascript
   helpScene.helpErrorBoundary.enterSafeMode();
   helpScene.initialize();
   ```

3. **依存関係の再構築**:
   ```javascript
   helpScene.rebuildDependencies();
   ```

### 問題2: レスポンシブ表示の不具合

**症状**:
- 異なる画面サイズで表示が崩れる
- モバイルデバイスで操作できない

**診断手順**:
```javascript
// 画面サイズとCanvas情報の確認
console.log('Screen:', {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio
});

console.log('Canvas:', {
    width: helpScene.gameEngine.canvas.width,
    height: helpScene.gameEngine.canvas.height
});
```

**解決策**:
1. **ResponsiveCanvasManagerの再初期化**:
   ```javascript
   const responsiveManager = helpScene.gameEngine.responsiveCanvasManager;
   responsiveManager.handleResize();
   ```

2. **手動でのレイアウト調整**:
   ```javascript
   helpScene.forceLayoutUpdate();
   ```

---

## 翻訳関連の問題

### 問題3: 翻訳テキストが表示されない

**症状**:
- "Translation not found" エラーが表示される
- 翻訳キーがそのまま表示される

**診断手順**:
```javascript
// 1. LocalizationManagerの状態確認
const localizationManager = helpScene.gameEngine.localizationManager;
console.log('Current language:', localizationManager.getCurrentLanguage());
console.log('Available languages:', localizationManager.getAvailableLanguages());

// 2. 欠落キーの確認
console.log('Missing keys:', localizationManager.getMissingKeys());

// 3. 特定キーの翻訳テスト
const testKey = 'help.categories.gameplay';
console.log(`Translation for ${testKey}:`, localizationManager.t(testKey));
```

**解決策**:
1. **翻訳ファイルの確認**:
   ```javascript
   // translations/ja/help.json が存在し、適切な構造になっているか確認
   fetch('/translations/ja/help.json')
       .then(r => r.json())
       .then(data => console.log('Help translations:', data))
       .catch(err => console.error('Translation file error:', err));
   ```

2. **フォールバックテキストの追加**:
   ```javascript
   localizationManager.addFallbackText('help.categories.gameplay', 'ゲームプレイ');
   localizationManager.addFallbackText('help.categories.bubbles', 'バブル');
   localizationManager.addFallbackText('help.categories.controls', '操作方法');
   ```

3. **翻訳キャッシュのクリア**:
   ```javascript
   localizationManager.clearCache();
   localizationManager.reloadTranslations();
   ```

### 問題4: 特定言語での文字化け

**症状**:
- 日本語、中国語、韓国語で文字が正しく表示されない
- フォントが適用されない

**診断手順**:
```javascript
// フォント読み込み状態の確認
document.fonts.ready.then(() => {
    console.log('Loaded fonts:', Array.from(document.fonts));
    console.log('Font face status:', {
        'Noto Sans JP': document.fonts.check('16px "Noto Sans JP"'),
        'Noto Sans SC': document.fonts.check('16px "Noto Sans SC"'),
        'Noto Sans KR': document.fonts.check('16px "Noto Sans KR"')
    });
});
```

**解決策**:
1. **フォントの強制読み込み**:
   ```javascript
   const fontLoader = new FontFace('Noto Sans JP', 'url(/fonts/NotoSansJP-Regular.woff2)');
   fontLoader.load().then(font => {
       document.fonts.add(font);
       helpScene.refresh();
   });
   ```

2. **フォールバックフォントの設定**:
   ```javascript
   const renderOptimizer = helpScene.helpRenderOptimizer;
   renderOptimizer.updateConfig({
       defaultFont: 'Arial, sans-serif, "Noto Sans JP", "Noto Sans SC", "Noto Sans KR"'
   });
   ```

---

## アクセシビリティ問題

### 問題5: スクリーンリーダーが機能しない

**症状**:
- スクリーンリーダーでヘルプコンテンツが読み上げられない
- キーボードナビゲーションが動作しない

**診断手順**:
```javascript
// 1. CoreAccessibilityManagerの状態確認
const accessibilityManager = helpScene.gameEngine.accessibilityManager;
console.log('Accessibility features:', {
    highContrast: accessibilityManager.isHighContrastEnabled(),
    largeText: accessibilityManager.isLargeTextEnabled(),
    screenReader: accessibilityManager.isScreenReaderEnabled()
});

// 2. HelpAccessibilityManagerの安全呼び出し確認
const helpAccessibilityManager = helpScene.helpAccessibilityManager;
console.log('Safe call test:', helpAccessibilityManager.safeCall('announce', 'テスト'));

// 3. 利用可能メソッドの確認
const methods = ['enableHighContrast', 'enableLargeText', 'announce'];
methods.forEach(method => {
    console.log(`${method} available:`, helpAccessibilityManager.isMethodAvailable(method));
});
```

**解決策**:
1. **アクセシビリティ機能の再有効化**:
   ```javascript
   helpAccessibilityManager.safeCall('enableScreenReaderSupport');
   helpAccessibilityManager.safeCall('enableKeyboardNavigation');
   ```

2. **ARIA属性の確認と修正**:
   ```javascript
   // Canvas要素にARIA属性を追加
   const canvas = helpScene.gameEngine.canvas;
   canvas.setAttribute('role', 'application');
   canvas.setAttribute('aria-label', 'ヘルプシステム');
   canvas.setAttribute('tabindex', '0');
   ```

3. **フォーカス管理の修正**:
   ```javascript
   helpScene.setupAccessibleFocus();
   ```

### 問題6: 高コントラストモードが適用されない

**症状**:
- 高コントラストモードを有効にしても視覚的変化がない
- 色の判別が困難

**診断手順**:
```javascript
// CSS変数の確認
const computedStyle = getComputedStyle(document.documentElement);
console.log('High contrast CSS variables:', {
    background: computedStyle.getPropertyValue('--help-bg-color'),
    text: computedStyle.getPropertyValue('--help-text-color'),
    accent: computedStyle.getPropertyValue('--help-accent-color')
});
```

**解決策**:
1. **CSS変数の強制設定**:
   ```javascript
   document.documentElement.style.setProperty('--help-bg-color', '#000000');
   document.documentElement.style.setProperty('--help-text-color', '#ffffff');
   document.documentElement.style.setProperty('--help-accent-color', '#ffff00');
   ```

2. **描画コンテキストの色設定確認**:
   ```javascript
   const renderOptimizer = helpScene.helpRenderOptimizer;
   renderOptimizer.updateConfig({
       highContrastColors: {
           background: '#000000',
           text: '#ffffff',
           accent: '#ffff00'
       }
   });
   ```

---

## パフォーマンス問題

### 問題7: フレームレートの低下

**症状**:
- 画面の動きがカクつく
- 操作に対する反応が遅い

**診断手順**:
```javascript
// 1. パフォーマンス統計の確認
const performanceIntegrator = helpScene.helpPerformanceIntegrator;
const stats = performanceIntegrator.getPerformanceStats();
console.log('Performance stats:', stats);

// 2. 描画統計の確認
const renderOptimizer = helpScene.helpRenderOptimizer;
const renderStats = renderOptimizer.getStats();
console.log('Render stats:', renderStats);

// 3. パフォーマンス問題の検出
const issues = performanceIntegrator.detectPerformanceIssues();
console.log('Performance issues:', issues);
```

**解決策**:
1. **自動最適化の有効化**:
   ```javascript
   performanceIntegrator.updateConfig({
       autoOptimization: true,
       performanceThresholds: {
           lowFPS: 30,
           criticalFPS: 15
       }
   });
   ```

2. **手動最適化の実行**:
   ```javascript
   // 描画最適化
   renderOptimizer.updateConfig({
       skipFrameThreshold: 20,
       dirtyRectEnabled: true
   });
   
   // キャッシュクリア
   renderOptimizer.clearAllCaches();
   ```

3. **パフォーマンス問題の処理**:
   ```javascript
   if (issues.length > 0) {
       performanceIntegrator.handlePerformanceIssues(issues);
   }
   ```

### 問題8: メモリ使用量の増加

**症状**:
- 時間の経過とともにメモリ使用量が増加
- ブラウザが重くなる

**診断手順**:
```javascript
// 1. メモリ情報の確認
const memoryOptimizer = helpScene.helpMemoryOptimizer;
const memoryInfo = memoryOptimizer.getMemoryInfo();
console.log('Memory info:', memoryInfo);

// 2. 追跡オブジェクトの確認
const stats = memoryOptimizer.getStats();
console.log('Memory optimizer stats:', stats);

// 3. メモリリークの検出
const leaks = memoryOptimizer.detectMemoryLeaks();
console.log('Potential memory leaks:', leaks);
```

**解決策**:
1. **メモリクリーンアップの実行**:
   ```javascript
   memoryOptimizer.cleanupOldObjects();
   memoryOptimizer.suggestGC();
   ```

2. **積極的な設定への変更**:
   ```javascript
   memoryOptimizer.updateConfig({
       maxObjectAge: 60000,    // 1分
       gcInterval: 10000,      // 10秒
       maxEventListeners: 50
   });
   ```

3. **遅延読み込みキャッシュの調整**:
   ```javascript
   const lazyLoader = helpScene.helpLazyLoader;
   lazyLoader.updateConfig({
       maxCacheSize: 20,
       preloadRadius: 0
   });
   ```

---

## エラー境界問題

### 問題9: 繰り返しエラーの発生

**症状**:
- 同じエラーが繰り返し発生する
- 安全モードが頻繁に有効になる

**診断手順**:
```javascript
// 1. エラー統計の確認
const errorBoundary = helpScene.helpErrorBoundary;
const errorStats = errorBoundary.getStats();
console.log('Error boundary stats:', errorStats);

// 2. エラー履歴の分析
const errorHistory = errorBoundary.getErrorHistory();
console.log('Recent errors:', errorHistory.slice(-10));

// 3. エラーパターンの分析
const errorTypes = errorHistory.reduce((acc, error) => {
    acc[error.type] = (acc[error.type] || 0) + 1;
    return acc;
}, {});
console.log('Error types:', errorTypes);
```

**解決策**:
1. **エラー閾値の調整**:
   ```javascript
   errorBoundary.updateConfig({
       maxErrorsPerMinute: 5,
       safeModeThreshold: 3,
       recoveryAttempts: 2
   });
   ```

2. **特定エラーの除外**:
   ```javascript
   errorBoundary.addIgnoredError('ResizeObserver loop limit exceeded');
   errorBoundary.addIgnoredError('Non-Error promise rejection captured');
   ```

3. **安全モードのリセット**:
   ```javascript
   if (errorBoundary.isSafeModeActive()) {
       errorBoundary.exitSafeMode();
   }
   ```

### 問題10: 回復不可能なエラー

**症状**:
- エラーが発生後、ヘルプシステムが完全に停止
- 再初期化も失敗する

**緊急対応**:
```javascript
// 1. 強制リセット
try {
    helpScene.emergencyReset();
} catch (e) {
    console.error('Emergency reset failed:', e);
}

// 2. 最小限の機能での再構築
try {
    const minimalHelpScene = new HelpScene(gameEngine, {
        safeMode: true,
        minimalFeatures: true,
        skipOptimizations: true
    });
} catch (e) {
    console.error('Minimal reconstruction failed:', e);
}

// 3. フォールバック表示
try {
    helpScene.showFallbackHelp();
} catch (e) {
    console.error('Fallback help failed:', e);
    // 最後の手段: 静的ヘルプページへのリダイレクト
    window.location.href = '/help/static.html';
}
```

---

## 診断ツール

### デバッグコンソールコマンド

**基本診断**:
```javascript
// ヘルプシステム全体の状態診断
window.diagnoseHelpSystem = function() {
    const helpScene = window.gameEngine?.currentScene;
    if (!helpScene || helpScene.constructor.name !== 'HelpScene') {
        console.error('HelpScene not found or not active');
        return;
    }
    
    console.group('Help System Diagnosis');
    
    // 基本状態
    console.log('Initialization:', helpScene.isInitialized);
    console.log('Safe mode:', helpScene.helpErrorBoundary?.isSafeModeActive());
    
    // パフォーマンス
    const perfStats = helpScene.helpPerformanceIntegrator?.getPerformanceStats();
    console.log('Performance:', perfStats);
    
    // エラー状況
    const errorStats = helpScene.helpErrorBoundary?.getStats();
    console.log('Errors:', errorStats);
    
    // メモリ状況
    const memoryInfo = helpScene.helpMemoryOptimizer?.getMemoryInfo();
    console.log('Memory:', memoryInfo);
    
    console.groupEnd();
};

// 使用方法: ブラウザコンソールで diagnoseHelpSystem() を実行
```

**パフォーマンス監視**:
```javascript
// 継続的なパフォーマンス監視
window.startHelpPerformanceMonitoring = function() {
    const helpScene = window.gameEngine?.currentScene;
    const interval = setInterval(() => {
        const stats = helpScene.helpPerformanceIntegrator?.getPerformanceStats();
        if (stats) {
            console.log(`FPS: ${stats.monitoring.fps}, Memory: ${stats.monitoring.memoryUsage}%`);
        }
    }, 2000);
    
    // 停止方法: clearInterval(interval)
    return interval;
};
```

### ログ設定

**デバッグログの有効化**:
```javascript
// LocalStorageでのデバッグ設定
localStorage.setItem('debug:help-system', 'true');
localStorage.setItem('debug:help-performance', 'true');
localStorage.setItem('debug:help-accessibility', 'true');
localStorage.setItem('debug:help-memory', 'true');

// 詳細レベルの設定
localStorage.setItem('debug:level', 'verbose'); // 'minimal', 'normal', 'verbose'
```

**ログフィルタリング**:
```javascript
// 特定のログだけを表示
localStorage.setItem('debug:filter', 'error,warning'); // 'info', 'warning', 'error'

// 特定コンポーネントのみ
localStorage.setItem('debug:components', 'renderer,optimizer');
```

---

## ログ解析

### エラーログの読み方

**一般的なエラーパターン**:

1. **翻訳エラー**:
   ```
   [LocalizationManager] Translation not found: help.categories.gameplay
   [LocalizationManager] Using fallback text for: help.categories.gameplay
   ```
   → 翻訳ファイルの確認が必要

2. **アクセシビリティエラー**:
   ```
   [HelpAccessibilityManager] Method 'enableHighContrast' not available
   [HelpAccessibilityManager] Safe call failed for: enableHighContrast
   ```
   → CoreAccessibilityManagerの実装確認が必要

3. **パフォーマンスエラー**:
   ```
   [HelpPerformanceIntegrator] Critical FPS detected: 12
   [HelpRenderOptimizer] Frame skip activated
   ```
   → パフォーマンス最適化が動作中

4. **メモリエラー**:
   ```
   [HelpMemoryOptimizer] Memory pressure detected: 85%
   [HelpMemoryOptimizer] Emergency cleanup executed
   ```
   → メモリクリーンアップが必要

### ログレベルの設定

```javascript
// ログレベルの動的変更
window.setHelpLogLevel = function(level) {
    const helpScene = window.gameEngine?.currentScene;
    if (helpScene) {
        helpScene.setLogLevel(level); // 'debug', 'info', 'warn', 'error'
    }
};
```

---

## 緊急時対応

### 即座の対応が必要な問題

**レベル1: 完全停止**
- 症状: ヘルプシステムが全く動作しない
- 対応: 緊急リセット → 最小構成での再起動

**レベル2: 深刻なパフォーマンス劣化**
- 症状: FPS < 10、メモリ使用量 > 90%
- 対応: 積極的最適化の適用 → 機能制限モード

**レベル3: 繰り返しエラー**
- 症状: 1分間に5回以上のエラー
- 対応: 安全モード移行 → エラー原因の特定

### 緊急対応スクリプト

```javascript
// 緊急対応用の総合スクリプト
window.emergencyHelpRecovery = function() {
    console.log('Starting emergency help recovery...');
    
    try {
        const helpScene = window.gameEngine?.currentScene;
        
        // Step 1: 安全モード確認
        if (helpScene.helpErrorBoundary?.isSafeModeActive()) {
            console.log('Safe mode active, attempting exit...');
            helpScene.helpErrorBoundary.exitSafeMode();
        }
        
        // Step 2: パフォーマンス最適化
        if (helpScene.helpPerformanceIntegrator) {
            console.log('Applying emergency optimizations...');
            helpScene.helpPerformanceIntegrator.updateConfig({
                autoOptimization: true,
                optimizationStrategies: { aggressive: true }
            });
        }
        
        // Step 3: メモリクリーンアップ
        if (helpScene.helpMemoryOptimizer) {
            console.log('Cleaning up memory...');
            helpScene.helpMemoryOptimizer.forcefulCleanup();
        }
        
        // Step 4: キャッシュクリア
        if (helpScene.helpRenderOptimizer) {
            console.log('Clearing render caches...');
            helpScene.helpRenderOptimizer.clearAllCaches();
        }
        
        // Step 5: 再初期化
        console.log('Reinitializing help system...');
        helpScene.reinitialize();
        
        console.log('Emergency recovery completed successfully');
        
    } catch (error) {
        console.error('Emergency recovery failed:', error);
        console.log('Attempting fallback to static help...');
        window.location.href = '/help/static.html';
    }
};
```

### サポート情報の収集

問題報告時に必要な情報を自動収集するスクリプト:

```javascript
window.collectHelpSystemInfo = function() {
    const info = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
        },
        helpSystem: {}
    };
    
    try {
        const helpScene = window.gameEngine?.currentScene;
        if (helpScene) {
            info.helpSystem = {
                initialized: helpScene.isInitialized,
                safeMode: helpScene.helpErrorBoundary?.isSafeModeActive(),
                performance: helpScene.helpPerformanceIntegrator?.getPerformanceStats(),
                errors: helpScene.helpErrorBoundary?.getStats(),
                memory: helpScene.helpMemoryOptimizer?.getMemoryInfo()
            };
        }
    } catch (error) {
        info.helpSystem.error = error.message;
    }
    
    // クリップボードにコピー
    navigator.clipboard.writeText(JSON.stringify(info, null, 2))
        .then(() => console.log('System info copied to clipboard'))
        .catch(() => console.log('System info:', info));
    
    return info;
};
```

このガイドを使用して、ヘルプシステムで発生する問題を効率的に診断し、解決してください。