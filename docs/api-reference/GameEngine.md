# GameEngine

## 概要

ファイル: `core/GameEngine.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [GameEngine](#gameengine)
## 定数
- [currentScene](#currentscene)
- [sceneNames](#scenenames)
- [scene](#scene)
- [memoryStats](#memorystats)
- [performanceStats](#performancestats)
- [warnings](#warnings)
- [mainMenuScene](#mainmenuscene)
- [stageSelectScene](#stageselectscene)
- [gameScene](#gamescene)
- [shopScene](#shopscene)
- [userInfoScene](#userinfoscene)
- [clickHandler](#clickhandler)
- [mouseMoveHandler](#mousemovehandler)
- [touchStartHandler](#touchstarthandler)
- [touchMoveHandler](#touchmovehandler)
- [keyDownHandler](#keydownhandler)
- [currentTime](#currenttime)
- [deltaTime](#deltatime)
- [updateStartTime](#updatestarttime)
- [renderStartTime](#renderstarttime)
- [perfStats](#perfstats)
- [optimizerStats](#optimizerstats)
- [adjustedDeltaTime](#adjusteddeltatime)
- [intensity](#intensity)
- [shakeX](#shakex)
- [shakeY](#shakey)
- [stats](#stats)
- [y](#y)
- [lineHeight](#lineheight)
- [poolStats](#poolstats)
- [result](#result)
- [combo](#combo)
- [timeElement](#timeelement)
- [minutes](#minutes)
- [seconds](#seconds)
- [alpha](#alpha)
- [alpha](#alpha)
- [remainingSeconds](#remainingseconds)
- [remainingSeconds](#remainingseconds)
- [yOffset](#yoffset)
- [remainingSeconds](#remainingseconds)
- [restartHandler](#restarthandler)
- [browserCompatibility](#browsercompatibility)
- [report](#report)
- [uiScale](#uiscale)
- [baseFontSize](#basefontsize)
- [adjustedFontSize](#adjustedfontsize)
- [gameUI](#gameui)
- [scale](#scale)
- [browserCompatibility](#browsercompatibility)
- [orientation](#orientation)
- [browserCompatibility](#browsercompatibility)
- [deviceInfo](#deviceinfo)
- [browserInfo](#browserinfo)

---

## GameEngine

### コンストラクタ

```javascript
new GameEngine(canvas)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `canvas` | 説明なし |
| `context` | 説明なし |
| `isRunning` | 説明なし |
| `lastTime` | 説明なし |
| `configManager` | 設定管理システム |
| `calculationEngine` | 説明なし |
| `responsiveCanvasManager` | レスポンシブCanvas管理 |
| `renderOptimizer` | パフォーマンス最適化システム |
| `performanceMonitor` | 説明なし |
| `audioManager` | 新しいシステム（音響・視覚効果） |
| `effectQualityController` | 拡張エフェクトシステムの初期化 |
| `effectPerformanceMonitor` | 説明なし |
| `seasonalEffectManager` | 説明なし |
| `effectConfigurationIntegrator` | 説明なし |
| `audioVisualSynchronizer` | 説明なし |
| `particleManager` | 既存システムとの下位互換性を保持 |
| `effectManager` | 説明なし |
| `enhancedParticleManager` | 拡張エフェクトマネージャー |
| `enhancedEffectManager` | 説明なし |
| `animationManager` | 説明なし |
| `effectDebugInterface` | デバッグ・プロファイリングツール（開発環境用） |
| `enhancedDebugInterface` | 統合デバッグインターフェース（拡張版） |
| `effectProfiler` | 説明なし |
| `effectOptimizationAdvisor` | 説明なし |
| `effectPerformanceOptimizer` | 説明なし |
| `effectErrorHandler` | 説明なし |
| `visualPolishEnhancements` | 説明なし |
| `playerData` | コアシステム |
| `itemManager` | 説明なし |
| `scoreManager` | 説明なし |
| `bubbleManager` | 説明なし |
| `stageManager` | 説明なし |
| `sceneManager` | 説明なし |
| `settingsManager` | 新しいUI改善システム |
| `localizationManager` | 説明なし |
| `keyboardShortcutManager` | 説明なし |
| `achievementManager` | 追加コンテンツシステム |
| `statisticsManager` | 説明なし |
| `eventStageManager` | 説明なし |
| `achievementEventIntegrator` | 実績イベント統合システム |
| `achievementNotificationSystem` | 実績通知システム |
| `timeRemaining` | ゲーム状態 |
| `isGameOver` | 5分 |
| `bonusTimeRemaining` | 特殊効果状態 |
| `timeStopRemaining` | 説明なし |
| `scoreMultiplier` | 説明なし |
| `screenShakeRemaining` | 説明なし |
| `screenShakeIntensity` | 説明なし |
| `inputDisabled` | 説明なし |
| `frameCount` | パフォーマンス統計 |
| `performanceStats` | 説明なし |
| `isRunning` | 説明なし |
| `lastTime` | 説明なし |
| `isRunning` | 説明なし |
| `lastTime` | 説明なし |
| `performanceStats` | 説明なし |
| `bonusTimeRemaining` | 説明なし |
| `scoreMultiplier` | 説明なし |
| `timeStopRemaining` | 説明なし |
| `screenShakeIntensity` | 説明なし |
| `screenShakeRemaining` | 説明なし |
| `inputDisabled` | 説明なし |
| `scoreMultiplier` | 説明なし |
| `screenShakeIntensity` | 説明なし |
| `inputDisabled` | 説明なし |
| `scoreMultiplier` | 説明なし |
| `scoreMultiplier` | 説明なし |
| `isGameOver` | 説明なし |
| `uiInfo` | UI要素のサイズ情報を保存 |

### メソッド

#### if

Canvas コンテキストの検証

**シグネチャ**:
```javascript
 if (!this.context)
```

**パラメーター**:
- `!this.context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.context);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupLanguageChangeListener

**シグネチャ**:
```javascript
 setupLanguageChangeListener()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupLanguageChangeListener();

// setupLanguageChangeListenerの実用的な使用例
const result = instance.setupLanguageChangeListener(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### onLanguageChanged

**シグネチャ**:
```javascript
 onLanguageChanged(newLanguage, oldLanguage)
```

**パラメーター**:
- `newLanguage`
- `oldLanguage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.onLanguageChanged(newLanguage, oldLanguage);

// onLanguageChangedの実用的な使用例
const result = instance.onLanguageChanged(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### refreshAllScenes

**シグネチャ**:
```javascript
 refreshAllScenes()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.refreshAllScenes();

// refreshAllScenesの実用的な使用例
const result = instance.refreshAllScenes(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const sceneName of sceneNames)
```

**パラメーター**:
- `const sceneName of sceneNames`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const sceneName of sceneNames);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (scene && typeof scene.updateMenuLabels === 'function')
```

**パラメーター**:
- `scene && typeof scene.updateMenuLabels === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scene && typeof scene.updateMenuLabels === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (scene && typeof scene.refreshLabels === 'function')
```

**パラメーター**:
- `scene && typeof scene.refreshLabels === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scene && typeof scene.refreshLabels === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

現在のシーンを再描画

**シグネチャ**:
```javascript
 if (currentScene && typeof currentScene.render === 'function')
```

**パラメーター**:
- `currentScene && typeof currentScene.render === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentScene && typeof currentScene.render === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### initializePerformanceOptimization

**シグネチャ**:
```javascript
 initializePerformanceOptimization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializePerformanceOptimization();

// initializePerformanceOptimizationの実用的な使用例
const result = instance.initializePerformanceOptimization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performOptimization

**シグネチャ**:
```javascript
 performOptimization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performOptimization();

// performOptimizationの実用的な使用例
const result = instance.performOptimization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (warnings.length > 0)
```

**パラメーター**:
- `warnings.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(warnings.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### initializeScenes

**シグネチャ**:
```javascript
 initializeScenes()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeScenes();

// initializeScenesの実用的な使用例
const result = instance.initializeScenes(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupEventListeners

**シグネチャ**:
```javascript
 setupEventListeners()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupEventListeners();

// setupEventListenersの実用的な使用例
const result = instance.setupEventListeners(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### start

**シグネチャ**:
```javascript
 start()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.start();

// startの実用的な使用例
const result = instance.start(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stop

**シグネチャ**:
```javascript
 stop()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stop();

// stopの実用的な使用例
const result = instance.stop(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### gameLoop

**シグネチャ**:
```javascript
 gameLoop()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.gameLoop();

// gameLoopの実用的な使用例
const result = instance.gameLoop(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

統計更新

**シグネチャ**:
```javascript
 if (this.frameCount % 60 === 0)
```

**パラメーター**:
- `this.frameCount % 60 === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.frameCount % 60 === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updatePerformanceStats

**シグネチャ**:
```javascript
 updatePerformanceStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updatePerformanceStats();

// updatePerformanceStatsの実用的な使用例
const result = instance.updatePerformanceStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### update

**シグネチャ**:
```javascript
 update(deltaTime)
```

**パラメーター**:
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.update(deltaTime);

// フレーム更新処理
const deltaTime = 16.67; // 60FPS
instance.update(deltaTime);
```

#### if

実績イベント統合システムの更新

**シグネチャ**:
```javascript
 if (this.achievementEventIntegrator)
```

**パラメーター**:
- `this.achievementEventIntegrator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.achievementEventIntegrator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

実績通知システムの更新

**シグネチャ**:
```javascript
 if (this.achievementNotificationSystem)
```

**パラメーター**:
- `this.achievementNotificationSystem`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.achievementNotificationSystem);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### render

**シグネチャ**:
```javascript
 render()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render();

// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);
```

#### if

Canvas の状態を確認

**シグネチャ**:
```javascript
 if (!this.context)
```

**パラメーター**:
- `!this.context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.context);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

実績通知システムの描画（最前面）

**シグネチャ**:
```javascript
 if (this.achievementNotificationSystem)
```

**パラメーター**:
- `this.achievementNotificationSystem`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.achievementNotificationSystem);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyScreenShake

**シグネチャ**:
```javascript
 applyScreenShake()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyScreenShake();

// applyScreenShakeの実用的な使用例
const result = instance.applyScreenShake(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderPerformanceInfo

**シグネチャ**:
```javascript
 renderPerformanceInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderPerformanceInfo();

// renderPerformanceInfoの実用的な使用例
const result = instance.renderPerformanceInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (stats.memoryUsage)
```

**パラメーター**:
- `stats.memoryUsage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stats.memoryUsage);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isDebugMode

**シグネチャ**:
```javascript
 isDebugMode()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isDebugMode();

// isDebugModeの実用的な使用例
const result = instance.isDebugMode(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBubbleFromPool

**シグネチャ**:
```javascript
 getBubbleFromPool()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubbleFromPool();

// getBubbleFromPoolの実用的な使用例
const result = instance.getBubbleFromPool(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### returnBubbleToPool

**シグネチャ**:
```javascript
 returnBubbleToPool(bubble)
```

**パラメーター**:
- `bubble`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.returnBubbleToPool(bubble);

// returnBubbleToPoolの実用的な使用例
const result = instance.returnBubbleToPool(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getParticleFromPool

**シグネチャ**:
```javascript
 getParticleFromPool()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getParticleFromPool();

// getParticleFromPoolの実用的な使用例
const result = instance.getParticleFromPool(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### returnParticleToPool

**シグネチャ**:
```javascript
 returnParticleToPool(particle)
```

**パラメーター**:
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.returnParticleToPool(particle);

// returnParticleToPoolの実用的な使用例
const result = instance.returnParticleToPool(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getFloatingTextFromPool

**シグネチャ**:
```javascript
 getFloatingTextFromPool()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getFloatingTextFromPool();

// getFloatingTextFromPoolの実用的な使用例
const result = instance.getFloatingTextFromPool(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### returnFloatingTextToPool

**シグネチャ**:
```javascript
 returnFloatingTextToPool(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.returnFloatingTextToPool(text);

// returnFloatingTextToPoolの実用的な使用例
const result = instance.returnFloatingTextToPool(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addRenderObject

**シグネチャ**:
```javascript
 addRenderObject(obj, layer = 'default')
```

**パラメーター**:
- `obj`
- `layer = 'default'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addRenderObject(obj, layer = 'default');

// addRenderObjectの実用的な使用例
const result = instance.addRenderObject(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createExplosion

**シグネチャ**:
```javascript
 createExplosion(x, y, bubbleType, bubbleSize, intensity = 1)
```

**パラメーター**:
- `x`
- `y`
- `bubbleType`
- `bubbleSize`
- `intensity = 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createExplosion(x, y, bubbleType, bubbleSize, intensity = 1);

// createExplosionの実用的な使用例
const result = instance.createExplosion(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

視覚エフェクト

**シグネチャ**:
```javascript
 if (intensity > 0.5)
```

**パラメーター**:
- `intensity > 0.5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(intensity > 0.5);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createEnhancedBubbleEffect

**シグネチャ**:
```javascript
 createEnhancedBubbleEffect(x, y, bubbleType, bubbleSize, options = {})
```

**パラメーター**:
- `x`
- `y`
- `bubbleType`
- `bubbleSize`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createEnhancedBubbleEffect(x, y, bubbleType, bubbleSize, options = {});

// createEnhancedBubbleEffectの実用的な使用例
const result = instance.createEnhancedBubbleEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createEnhancedComboEffect

**シグネチャ**:
```javascript
 createEnhancedComboEffect(x, y, comboCount, comboType = 'normal')
```

**パラメーター**:
- `x`
- `y`
- `comboCount`
- `comboType = 'normal'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createEnhancedComboEffect(x, y, comboCount, comboType = 'normal');

// createEnhancedComboEffectの実用的な使用例
const result = instance.createEnhancedComboEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createSpecialBubbleEffect

**シグネチャ**:
```javascript
 createSpecialBubbleEffect(x, y, specialType, effectData = {})
```

**パラメーター**:
- `x`
- `y`
- `specialType`
- `effectData = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSpecialBubbleEffect(x, y, specialType, effectData = {});

// createSpecialBubbleEffectの実用的な使用例
const result = instance.createSpecialBubbleEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setEffectQuality

**シグネチャ**:
```javascript
 setEffectQuality(qualityLevel)
```

**パラメーター**:
- `qualityLevel`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setEffectQuality(qualityLevel);

// setEffectQualityの実用的な使用例
const result = instance.setEffectQuality(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setSeasonalTheme

**シグネチャ**:
```javascript
 setSeasonalTheme(season)
```

**パラメーター**:
- `season`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setSeasonalTheme(season);

// setSeasonalThemeの実用的な使用例
const result = instance.setSeasonalTheme(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyCustomTheme

**シグネチャ**:
```javascript
 applyCustomTheme(themeId)
```

**パラメーター**:
- `themeId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyCustomTheme(themeId);

// applyCustomThemeの実用的な使用例
const result = instance.applyCustomTheme(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (result)
```

**パラメーター**:
- `result`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(result);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEffectPerformanceStats

**シグネチャ**:
```javascript
 getEffectPerformanceStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEffectPerformanceStats();

// getEffectPerformanceStatsの実用的な使用例
const result = instance.getEffectPerformanceStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createIntegratedEffect

**シグネチャ**:
```javascript
 createIntegratedEffect(effectType, x, y, parameters = {})
```

**パラメーター**:
- `effectType`
- `x`
- `y`
- `parameters = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createIntegratedEffect(effectType, x, y, parameters = {});

// createIntegratedEffectの実用的な使用例
const result = instance.createIntegratedEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateEffectConfiguration

**シグネチャ**:
```javascript
 updateEffectConfiguration(key, value)
```

**パラメーター**:
- `key`
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateEffectConfiguration(key, value);

// updateEffectConfigurationの実用的な使用例
const result = instance.updateEffectConfiguration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateMultipleEffectConfigurations

**シグネチャ**:
```javascript
 updateMultipleEffectConfigurations(settings)
```

**パラメーター**:
- `settings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateMultipleEffectConfigurations(settings);

// updateMultipleEffectConfigurationsの実用的な使用例
const result = instance.updateMultipleEffectConfigurations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### exportEffectSettings

**シグネチャ**:
```javascript
 exportEffectSettings()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exportEffectSettings();

// exportEffectSettingsの実用的な使用例
const result = instance.exportEffectSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### importEffectSettings

**シグネチャ**:
```javascript
 importEffectSettings(settings)
```

**パラメーター**:
- `settings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.importEffectSettings(settings);

// importEffectSettingsの実用的な使用例
const result = instance.importEffectSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startBonusTime

**シグネチャ**:
```javascript
 startBonusTime(duration, multiplier = 2)
```

**パラメーター**:
- `duration`
- `multiplier = 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startBonusTime(duration, multiplier = 2);

// startBonusTimeの実用的な使用例
const result = instance.startBonusTime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startTimeStop

**シグネチャ**:
```javascript
 startTimeStop(duration)
```

**パラメーター**:
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startTimeStop(duration);

// startTimeStopの実用的な使用例
const result = instance.startTimeStop(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startScreenShake

**シグネチャ**:
```javascript
 startScreenShake(duration, intensity = 10)
```

**パラメーター**:
- `duration`
- `intensity = 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startScreenShake(duration, intensity = 10);

// startScreenShakeの実用的な使用例
const result = instance.startScreenShake(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderCombo

**シグネチャ**:
```javascript
 renderCombo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderCombo();

// renderComboの実用的な使用例
const result = instance.renderCombo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderGameOver

**シグネチャ**:
```javascript
 renderGameOver()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderGameOver();

// renderGameOverの実用的な使用例
const result = instance.renderGameOver(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateTimeDisplay

**シグネチャ**:
```javascript
 updateTimeDisplay()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateTimeDisplay();

// updateTimeDisplayの実用的な使用例
const result = instance.updateTimeDisplay(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (timeElement)
```

**パラメーター**:
- `timeElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(timeElement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderSpecialEffectBackground

**シグネチャ**:
```javascript
 renderSpecialEffectBackground()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderSpecialEffectBackground();

// renderSpecialEffectBackgroundの実用的な使用例
const result = instance.renderSpecialEffectBackground(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderSpecialEffects

**シグネチャ**:
```javascript
 renderSpecialEffects()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderSpecialEffects();

// renderSpecialEffectsの実用的な使用例
const result = instance.renderSpecialEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateSpecialEffects

**シグネチャ**:
```javascript
 updateSpecialEffects(deltaTime)
```

**パラメーター**:
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateSpecialEffects(deltaTime);

// updateSpecialEffectsの実用的な使用例
const result = instance.updateSpecialEffects(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ボーナスタイムの更新

**シグネチャ**:
```javascript
 if (this.bonusTimeRemaining > 0)
```

**パラメーター**:
- `this.bonusTimeRemaining > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.bonusTimeRemaining > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.bonusTimeRemaining <= 0)
```

**パラメーター**:
- `this.bonusTimeRemaining <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.bonusTimeRemaining <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

時間停止効果の更新

**シグネチャ**:
```javascript
 if (this.timeStopRemaining > 0)
```

**パラメーター**:
- `this.timeStopRemaining > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.timeStopRemaining > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.timeStopRemaining <= 0)
```

**パラメーター**:
- `this.timeStopRemaining <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.timeStopRemaining <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

画面揺れ効果の更新

**シグネチャ**:
```javascript
 if (this.screenShakeRemaining > 0)
```

**パラメーター**:
- `this.screenShakeRemaining > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.screenShakeRemaining > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.screenShakeRemaining <= 0)
```

**パラメーター**:
- `this.screenShakeRemaining <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.screenShakeRemaining <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### activateBonusTime

**シグネチャ**:
```javascript
 activateBonusTime(duration)
```

**パラメーター**:
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.activateBonusTime(duration);

// activateBonusTimeの実用的な使用例
const result = instance.activateBonusTime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### activateTimeStop

**シグネチャ**:
```javascript
 activateTimeStop(duration)
```

**パラメーター**:
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.activateTimeStop(duration);

// activateTimeStopの実用的な使用例
const result = instance.activateTimeStop(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getScoreMultiplier

**シグネチャ**:
```javascript
 getScoreMultiplier()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getScoreMultiplier();

// getScoreMultiplierの実用的な使用例
const result = instance.getScoreMultiplier(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isBonusTimeActive

**シグネチャ**:
```javascript
 isBonusTimeActive()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isBonusTimeActive();

// isBonusTimeActiveの実用的な使用例
const result = instance.isBonusTimeActive(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isTimeStopActive

**シグネチャ**:
```javascript
 isTimeStopActive()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isTimeStopActive();

// isTimeStopActiveの実用的な使用例
const result = instance.isTimeStopActive(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isTimeStopped

**シグネチャ**:
```javascript
 isTimeStopped()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isTimeStopped();

// isTimeStoppedの実用的な使用例
const result = instance.isTimeStopped(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### activateScreenShake

**シグネチャ**:
```javascript
 activateScreenShake(intensity, duration)
```

**パラメーター**:
- `intensity`
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.activateScreenShake(intensity, duration);

// activateScreenShakeの実用的な使用例
const result = instance.activateScreenShake(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isScreenShakeActive

**シグネチャ**:
```javascript
 isScreenShakeActive()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isScreenShakeActive();

// isScreenShakeActiveの実用的な使用例
const result = instance.isScreenShakeActive(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### activateScoreMultiplier

**シグネチャ**:
```javascript
 activateScoreMultiplier(multiplier, duration)
```

**パラメーター**:
- `multiplier`
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.activateScoreMultiplier(multiplier, duration);

// activateScoreMultiplierの実用的な使用例
const result = instance.activateScoreMultiplier(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### activateNextScoreMultiplier

**シグネチャ**:
```javascript
 activateNextScoreMultiplier(multiplier, duration)
```

**パラメーター**:
- `multiplier`
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.activateNextScoreMultiplier(multiplier, duration);

// activateNextScoreMultiplierの実用的な使用例
const result = instance.activateNextScoreMultiplier(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ScoreManagerに次の泡のスコア倍率を設定

**シグネチャ**:
```javascript
 if (this.scoreManager.setNextBubbleMultiplier)
```

**パラメーター**:
- `this.scoreManager.setNextBubbleMultiplier`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.scoreManager.setNextBubbleMultiplier);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### activateNightMode

**シグネチャ**:
```javascript
 activateNightMode()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.activateNightMode();

// activateNightModeの実用的な使用例
const result = instance.activateNightMode(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### activateReducedVisibility

**シグネチャ**:
```javascript
 activateReducedVisibility()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.activateReducedVisibility();

// activateReducedVisibilityの実用的な使用例
const result = instance.activateReducedVisibility(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### gameOver

**シグネチャ**:
```javascript
 gameOver()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.gameOver();

// gameOverの実用的な使用例
const result = instance.gameOver(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanup

**シグネチャ**:
```javascript
 cleanup()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanup();

// cleanupの実用的な使用例
const result = instance.cleanup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

拡張エフェクトシステムのクリーンアップ

**シグネチャ**:
```javascript
 if (this.enhancedParticleManager)
```

**パラメーター**:
- `this.enhancedParticleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.enhancedParticleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.enhancedEffectManager)
```

**パラメーター**:
- `this.enhancedEffectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.enhancedEffectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.seasonalEffectManager)
```

**パラメーター**:
- `this.seasonalEffectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.seasonalEffectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.effectPerformanceMonitor)
```

**パラメーター**:
- `this.effectPerformanceMonitor`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.effectPerformanceMonitor);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.effectQualityController)
```

**パラメーター**:
- `this.effectQualityController`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.effectQualityController);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.effectConfigurationIntegrator)
```

**パラメーター**:
- `this.effectConfigurationIntegrator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.effectConfigurationIntegrator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.audioVisualSynchronizer)
```

**パラメーター**:
- `this.audioVisualSynchronizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.audioVisualSynchronizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkBrowserCompatibility

**シグネチャ**:
```javascript
 checkBrowserCompatibility()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkBrowserCompatibility();

// checkBrowserCompatibilityの実用的な使用例
const result = instance.checkBrowserCompatibility(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

重要な機能が利用できない場合は警告

**シグネチャ**:
```javascript
 if (!report.features.canvas)
```

**パラメーター**:
- `!report.features.canvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!report.features.canvas);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!report.features.requestAnimationFrame)
```

**パラメーター**:
- `!report.features.requestAnimationFrame`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!report.features.requestAnimationFrame);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!report.features.webAudio)
```

**パラメーター**:
- `!report.features.webAudio`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!report.features.webAudio);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!report.features.localStorage)
```

**パラメーター**:
- `!report.features.localStorage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!report.features.localStorage);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

推奨事項と警告を表示

**シグネチャ**:
```javascript
 if (report.recommendations.length > 0)
```

**パラメーター**:
- `report.recommendations.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(report.recommendations.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (report.warnings.length > 0)
```

**パラメーター**:
- `report.warnings.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(report.warnings.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### onCanvasResize

**シグネチャ**:
```javascript
 onCanvasResize(canvasInfo)
```

**パラメーター**:
- `canvasInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.onCanvasResize(canvasInfo);

// onCanvasResizeの実用的な使用例
const result = instance.onCanvasResize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

シーンマネージャーに通知

**シグネチャ**:
```javascript
 if (this.sceneManager)
```

**パラメーター**:
- `this.sceneManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.sceneManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### adjustUIForCanvasSize

**シグネチャ**:
```javascript
 adjustUIForCanvasSize(canvasInfo)
```

**パラメーター**:
- `canvasInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.adjustUIForCanvasSize(canvasInfo);

// adjustUIForCanvasSizeの実用的な使用例
const result = instance.adjustUIForCanvasSize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### adjustHTMLUI

**シグネチャ**:
```javascript
 adjustHTMLUI(canvasInfo)
```

**パラメーター**:
- `canvasInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.adjustHTMLUI(canvasInfo);

// adjustHTMLUIの実用的な使用例
const result = instance.adjustHTMLUI(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (gameUI)
```

**パラメーター**:
- `gameUI`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gameUI);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (browserCompatibility.deviceInfo.isMobile)
```

**パラメーター**:
- `browserCompatibility.deviceInfo.isMobile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(browserCompatibility.deviceInfo.isMobile);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDeviceOptimizations

**シグネチャ**:
```javascript
 getDeviceOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDeviceOptimizations();

// getDeviceOptimizationsの実用的な使用例
const result = instance.getDeviceOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCanvasInfo

**シグネチャ**:
```javascript
 getCanvasInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCanvasInfo();

// getCanvasInfoの実用的な使用例
const result = instance.getCanvasInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### toggleFullscreen

**シグネチャ**:
```javascript
 toggleFullscreen()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toggleFullscreen();

// toggleFullscreenの実用的な使用例
const result = instance.toggleFullscreen(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.responsiveCanvasManager)
```

**パラメーター**:
- `this.responsiveCanvasManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.responsiveCanvasManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### destroy

**シグネチャ**:
```javascript
 destroy()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.destroy();

// リソースのクリーンアップ
instance.destroy();
console.log('Resources cleaned up');
```

#### if

レスポンシブCanvas管理をクリーンアップ

**シグネチャ**:
```javascript
 if (this.responsiveCanvasManager)
```

**パラメーター**:
- `this.responsiveCanvasManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.responsiveCanvasManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `currentScene` | 説明なし |
| `sceneNames` | 説明なし |
| `scene` | 説明なし |
| `memoryStats` | 説明なし |
| `performanceStats` | 説明なし |
| `warnings` | 説明なし |
| `mainMenuScene` | 説明なし |
| `stageSelectScene` | 説明なし |
| `gameScene` | 説明なし |
| `shopScene` | 説明なし |
| `userInfoScene` | 説明なし |
| `clickHandler` | 説明なし |
| `mouseMoveHandler` | 説明なし |
| `touchStartHandler` | 説明なし |
| `touchMoveHandler` | 説明なし |
| `keyDownHandler` | 説明なし |
| `currentTime` | 説明なし |
| `deltaTime` | 説明なし |
| `updateStartTime` | 説明なし |
| `renderStartTime` | 説明なし |
| `perfStats` | 説明なし |
| `optimizerStats` | 説明なし |
| `adjustedDeltaTime` | 説明なし |
| `intensity` | 説明なし |
| `shakeX` | 説明なし |
| `shakeY` | 説明なし |
| `stats` | 説明なし |
| `y` | 説明なし |
| `lineHeight` | 説明なし |
| `poolStats` | 説明なし |
| `result` | 説明なし |
| `combo` | 説明なし |
| `timeElement` | 説明なし |
| `minutes` | 説明なし |
| `seconds` | 説明なし |
| `alpha` | 説明なし |
| `alpha` | 説明なし |
| `remainingSeconds` | 説明なし |
| `remainingSeconds` | 説明なし |
| `yOffset` | 説明なし |
| `remainingSeconds` | 説明なし |
| `restartHandler` | 説明なし |
| `browserCompatibility` | 説明なし |
| `report` | 説明なし |
| `uiScale` | 説明なし |
| `baseFontSize` | 説明なし |
| `adjustedFontSize` | 説明なし |
| `gameUI` | 説明なし |
| `scale` | 説明なし |
| `browserCompatibility` | 説明なし |
| `orientation` | 説明なし |
| `browserCompatibility` | 説明なし |
| `deviceInfo` | 説明なし |
| `browserInfo` | 説明なし |

---

