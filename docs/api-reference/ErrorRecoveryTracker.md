# ErrorRecoveryTracker

## 概要

ファイル: `debug/ErrorRecoveryTracker.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [ErrorRecoveryTracker](#errorrecoverytracker)
## 定数
- [recoverySession](#recoverysession)
- [strategies](#strategies)
- [session](#session)
- [applicableStrategies](#applicablestrategies)
- [priorityDiff](#prioritydiff)
- [errorText](#errortext)
- [cooldownKey](#cooldownkey)
- [cooldownTimer](#cooldowntimer)
- [recentAttempts](#recentattempts)
- [strategyAttempt](#strategyattempt)
- [result](#result)
- [memoryBefore](#memorybefore)
- [memoryAfter](#memoryafter)
- [improvement](#improvement)
- [gameEngine](#gameengine)
- [ctx](#ctx)
- [gameEngine](#gameengine)
- [gameEngine](#gameengine)
- [gameEngine](#gameengine)
- [currentScene](#currentscene)
- [sceneName](#scenename)
- [gameEngine](#gameengine)
- [gameEngine](#gameengine)
- [componentName](#componentname)
- [component](#component)
- [message](#message)
- [category](#category)
- [cooldownKey](#cooldownkey)
- [cooldownEnd](#cooldownend)
- [strategyStats](#strategystats)
- [categoryStats](#categorystats)
- [strategyStats](#strategystats)
- [categoryStats](#categorystats)
- [strategyStats](#strategystats)
- [effectiveness](#effectiveness)
- [key](#key)
- [data](#data)
- [recentRecoveries](#recentrecoveries)
- [now](#now)
- [totalTime](#totaltime)
- [strategyPerformance](#strategyperformance)
- [perf](#perf)
- [categoryPerformance](#categoryperformance)
- [category](#category)
- [perf](#perf)
- [recommendations](#recommendations)
- [strategyAnalysis](#strategyanalysis)
- [lowPerformanceStrategies](#lowperformancestrategies)
- [categoryAnalysis](#categoryanalysis)
- [unrecoverableCategories](#unrecoverablecategories)
- [recentRecoveries](#recentrecoveries)
- [stored](#stored)
- [data](#data)
- [dataToSave](#datatosave)

---

## ErrorRecoveryTracker

### コンストラクタ

```javascript
new ErrorRecoveryTracker(errorReporter)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `errorReporter` | 説明なし |
| `recoveryStrategies` | 復旧戦略の定義 |
| `recoveryAttempts` | 復旧試行履歴 |
| `maxRecoveryHistory` | 説明なし |
| `recoveryStats` | 復旧統計 |
| `recoveryConfig` | 復旧設定 |
| `learningData` | 復旧学習システム |
| `activeRecoveries` | 復旧状態管理 |
| `cooldownTimers` | 説明なし |

### メソッド

#### initialize

**シグネチャ**:
```javascript
 initialize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initialize();

// システムの初期化
await instance.initialize();
console.log('Initialization complete');
```

#### attemptRecovery

**シグネチャ**:
```javascript
async attemptRecovery(error, context = {})
```

**パラメーター**:
- `error`
- `context = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.attemptRecovery(error, context = {});

// attemptRecoveryの実用的な使用例
const result = instance.attemptRecovery(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.recoveryConfig.enabled)
```

**パラメーター**:
- `!this.recoveryConfig.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.recoveryConfig.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (strategies.length === 0)
```

**パラメーター**:
- `strategies.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(strategies.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

戦略を順次実行

**シグネチャ**:
```javascript
 for (const strategy of strategies)
```

**パラメーター**:
- `const strategy of strategies`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const strategy of strategies);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (recoveryError)
```

**パラメーター**:
- `recoveryError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(recoveryError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startRecoverySession

**シグネチャ**:
```javascript
 startRecoverySession(error, context)
```

**パラメーター**:
- `error`
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startRecoverySession(error, context);

// startRecoverySessionの実用的な使用例
const result = instance.startRecoverySession(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### selectRecoveryStrategies

**シグネチャ**:
```javascript
 selectRecoveryStrategies(error, context)
```

**パラメーター**:
- `error`
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.selectRecoveryStrategies(error, context);

// selectRecoveryStrategiesの実用的な使用例
const result = instance.selectRecoveryStrategies(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isStrategyApplicable

**シグネチャ**:
```javascript
 isStrategyApplicable(strategy, error, context)
```

**パラメーター**:
- `strategy`
- `error`
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isStrategyApplicable(strategy, error, context);

// isStrategyApplicableの実用的な使用例
const result = instance.isStrategyApplicable(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isStrategyCooledDown

**シグネチャ**:
```javascript
 isStrategyCooledDown(strategyId, errorFingerprint)
```

**パラメーター**:
- `strategyId`
- `errorFingerprint`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isStrategyCooledDown(strategyId, errorFingerprint);

// isStrategyCooledDownの実用的な使用例
const result = instance.isStrategyCooledDown(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### canAttemptStrategy

**シグネチャ**:
```javascript
 canAttemptStrategy(strategyId, errorFingerprint)
```

**パラメーター**:
- `strategyId`
- `errorFingerprint`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.canAttemptStrategy(strategyId, errorFingerprint);

// canAttemptStrategyの実用的な使用例
const result = instance.canAttemptStrategy(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### executeRecoveryStrategy

**シグネチャ**:
```javascript
async executeRecoveryStrategy(strategy, error, context, session)
```

**パラメーター**:
- `strategy`
- `error`
- `context`
- `session`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.executeRecoveryStrategy(strategy, error, context, session);

// executeRecoveryStrategyの実用的な使用例
const result = instance.executeRecoveryStrategy(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (result.success)
```

**パラメーター**:
- `result.success`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(result.success);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (strategyError)
```

**パラメーター**:
- `strategyError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(strategyError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### completeRecoverySession

**シグネチャ**:
```javascript
 completeRecoverySession(session, success, result)
```

**パラメーター**:
- `session`
- `success`
- `result`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.completeRecoverySession(session, success, result);

// completeRecoverySessionの実用的な使用例
const result = instance.completeRecoverySession(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

統計を更新

**シグネチャ**:
```javascript
 if (success)
```

**パラメーター**:
- `success`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(success);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴サイズ制限

**シグネチャ**:
```javascript
 if (this.recoveryAttempts.length > this.maxRecoveryHistory)
```

**パラメーター**:
- `this.recoveryAttempts.length > this.maxRecoveryHistory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.recoveryAttempts.length > this.maxRecoveryHistory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

学習データを更新

**シグネチャ**:
```javascript
 if (this.recoveryConfig.enableLearning)
```

**パラメーター**:
- `this.recoveryConfig.enableLearning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.recoveryConfig.enableLearning);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performMemoryCleanup

**シグネチャ**:
```javascript
async performMemoryCleanup(error, context)
```

**パラメーター**:
- `error`
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performMemoryCleanup(error, context);

// performMemoryCleanupの実用的な使用例
const result = instance.performMemoryCleanup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ガベージコレクションの実行（可能な場合）

**シグネチャ**:
```javascript
 if (window.gc)
```

**パラメーター**:
- `window.gc`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(window.gc);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

キャッシュのクリア

**シグネチャ**:
```javascript
 if (this.errorReporter.gameEngine?.cacheSystem)
```

**パラメーター**:
- `this.errorReporter.gameEngine?.cacheSystem`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.errorReporter.gameEngine?.cacheSystem);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

オブジェクトプールのクリーンアップ

**シグネチャ**:
```javascript
 if (this.errorReporter.gameEngine?.objectPool)
```

**パラメーター**:
- `this.errorReporter.gameEngine?.objectPool`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.errorReporter.gameEngine?.objectPool);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パーティクルシステムのクリーンアップ

**シグネチャ**:
```javascript
 if (this.errorReporter.gameEngine?.particleManager)
```

**パラメーター**:
- `this.errorReporter.gameEngine?.particleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.errorReporter.gameEngine?.particleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (cleanupError)
```

**パラメーター**:
- `cleanupError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(cleanupError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performCanvasReset

**シグネチャ**:
```javascript
async performCanvasReset(error, context)
```

**パラメーター**:
- `error`
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performCanvasReset(error, context);

// performCanvasResetの実用的な使用例
const result = instance.performCanvasReset(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!gameEngine?.canvas)
```

**パラメーター**:
- `!gameEngine?.canvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!gameEngine?.canvas);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

レンダリングシステムの再初期化

**シグネチャ**:
```javascript
 if (gameEngine.renderOptimizer)
```

**パラメーター**:
- `gameEngine.renderOptimizer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gameEngine.renderOptimizer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (resetError)
```

**パラメーター**:
- `resetError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(resetError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performAudioRestart

**シグネチャ**:
```javascript
async performAudioRestart(error, context)
```

**パラメーター**:
- `error`
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performAudioRestart(error, context);

// performAudioRestartの実用的な使用例
const result = instance.performAudioRestart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!gameEngine?.audioManager)
```

**パラメーター**:
- `!gameEngine?.audioManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!gameEngine?.audioManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (restartError)
```

**パラメーター**:
- `restartError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(restartError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performStorageFallback

**シグネチャ**:
```javascript
async performStorageFallback(error, context)
```

**パラメーター**:
- `error`
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performStorageFallback(error, context);

// performStorageFallbackの実用的な使用例
const result = instance.performStorageFallback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

インメモリストレージへの切り替え

**シグネチャ**:
```javascript
 if (gameEngine?.playerData)
```

**パラメーター**:
- `gameEngine?.playerData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gameEngine?.playerData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

設定管理システムのフォールバック

**シグネチャ**:
```javascript
 if (gameEngine?.settingsManager)
```

**パラメーター**:
- `gameEngine?.settingsManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gameEngine?.settingsManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (fallbackError)
```

**パラメーター**:
- `fallbackError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(fallbackError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performSceneReload

**シグネチャ**:
```javascript
async performSceneReload(error, context)
```

**パラメーター**:
- `error`
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performSceneReload(error, context);

// performSceneReloadの実用的な使用例
const result = instance.performSceneReload(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!gameEngine?.sceneManager)
```

**パラメーター**:
- `!gameEngine?.sceneManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!gameEngine?.sceneManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!currentScene)
```

**パラメーター**:
- `!currentScene`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!currentScene);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (reloadError)
```

**パラメーター**:
- `reloadError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(reloadError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performSafeModeSwitch

**シグネチャ**:
```javascript
async performSafeModeSwitch(error, context)
```

**パラメーター**:
- `error`
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performSafeModeSwitch(error, context);

// performSafeModeSwitchの実用的な使用例
const result = instance.performSafeModeSwitch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

セーフモードの有効化

**シグネチャ**:
```javascript
 if (gameEngine?.enableSafeMode)
```

**パラメーター**:
- `gameEngine?.enableSafeMode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gameEngine?.enableSafeMode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

エフェクトの無効化

**シグネチャ**:
```javascript
 if (gameEngine?.effectManager)
```

**パラメーター**:
- `gameEngine?.effectManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gameEngine?.effectManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パーティクルシステムの無効化

**シグネチャ**:
```javascript
 if (gameEngine?.particleManager)
```

**パラメーター**:
- `gameEngine?.particleManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gameEngine?.particleManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

オーディオの無効化

**シグネチャ**:
```javascript
 if (gameEngine?.audioManager)
```

**パラメーター**:
- `gameEngine?.audioManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(gameEngine?.audioManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (safeModeError)
```

**パラメーター**:
- `safeModeError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(safeModeError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performComponentRestart

**シグネチャ**:
```javascript
async performComponentRestart(error, context)
```

**パラメーター**:
- `error`
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performComponentRestart(error, context);

// performComponentRestartの実用的な使用例
const result = instance.performComponentRestart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!componentName)
```

**パラメーター**:
- `!componentName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!componentName);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (component && typeof component.restart === 'function')
```

**パラメーター**:
- `component && typeof component.restart === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(component && typeof component.restart === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (component && typeof component.initialize === 'function')
```

**パラメーター**:
- `component && typeof component.initialize === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(component && typeof component.initialize === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (restartError)
```

**パラメーター**:
- `restartError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(restartError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### identifyProblemComponent

**シグネチャ**:
```javascript
 identifyProblemComponent(error, context)
```

**パラメーター**:
- `error`
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.identifyProblemComponent(error, context);

// identifyProblemComponentの実用的な使用例
const result = instance.identifyProblemComponent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getMemoryUsage

**シグネチャ**:
```javascript
 getMemoryUsage()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMemoryUsage();

// getMemoryUsageの実用的な使用例
const result = instance.getMemoryUsage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (performance.memory)
```

**パラメーター**:
- `performance.memory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(performance.memory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createTimeoutPromise

**シグネチャ**:
```javascript
 createTimeoutPromise(duration)
```

**パラメーター**:
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createTimeoutPromise(duration);

// createTimeoutPromiseの実用的な使用例
const result = instance.createTimeoutPromise(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setCooldown

**シグネチャ**:
```javascript
 setCooldown(strategyId, errorFingerprint)
```

**パラメーター**:
- `strategyId`
- `errorFingerprint`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setCooldown(strategyId, errorFingerprint);

// setCooldownの実用的な使用例
const result = instance.setCooldown(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordStrategySuccess

**シグネチャ**:
```javascript
 recordStrategySuccess(strategyId, errorCategory, duration)
```

**パラメーター**:
- `strategyId`
- `errorCategory`
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordStrategySuccess(strategyId, errorCategory, duration);

// recordStrategySuccessの実用的な使用例
const result = instance.recordStrategySuccess(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordStrategyFailure

**シグネチャ**:
```javascript
 recordStrategyFailure(strategyId, errorCategory, reason)
```

**パラメーター**:
- `strategyId`
- `errorCategory`
- `reason`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordStrategyFailure(strategyId, errorCategory, reason);

// recordStrategyFailureの実用的な使用例
const result = instance.recordStrategyFailure(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStrategyEffectiveness

**シグネチャ**:
```javascript
 getStrategyEffectiveness(strategyId, errorCategory)
```

**パラメーター**:
- `strategyId`
- `errorCategory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStrategyEffectiveness(strategyId, errorCategory);

// getStrategyEffectivenessの実用的な使用例
const result = instance.getStrategyEffectiveness(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!strategyStats || strategyStats.attempts === 0)
```

**パラメーター**:
- `!strategyStats || strategyStats.attempts === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!strategyStats || strategyStats.attempts === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateLearningData

**シグネチャ**:
```javascript
 updateLearningData(session)
```

**パラメーター**:
- `session`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateLearningData(session);

// updateLearningDataの実用的な使用例
const result = instance.updateLearningData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最新100件のみ保持

**シグネチャ**:
```javascript
 if (data.length > 100)
```

**パラメーター**:
- `data.length > 100`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.length > 100);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateRecoveryId

**シグネチャ**:
```javascript
 generateRecoveryId()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateRecoveryId();

// generateRecoveryIdの実用的な使用例
const result = instance.generateRecoveryId(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateRecoveryReport

**シグネチャ**:
```javascript
 generateRecoveryReport(timeframe = 'session')
```

**パラメーター**:
- `timeframe = 'session'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateRecoveryReport(timeframe = 'session');

// generateRecoveryReportの実用的な使用例
const result = instance.generateRecoveryReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRecoveriesForTimeframe

**シグネチャ**:
```javascript
 getRecoveriesForTimeframe(timeframe)
```

**パラメーター**:
- `timeframe`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRecoveriesForTimeframe(timeframe);

// getRecoveriesForTimeframeの実用的な使用例
const result = instance.getRecoveriesForTimeframe(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (timeframe)
```

**パラメーター**:
- `timeframe`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(timeframe);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateAverageRecoveryTime

**シグネチャ**:
```javascript
 calculateAverageRecoveryTime(recoveries)
```

**パラメーター**:
- `recoveries`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateAverageRecoveryTime(recoveries);

// calculateAverageRecoveryTimeの実用的な使用例
const result = instance.calculateAverageRecoveryTime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeStrategyPerformance

**シグネチャ**:
```javascript
 analyzeStrategyPerformance(recoveries)
```

**パラメーター**:
- `recoveries`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeStrategyPerformance(recoveries);

// analyzeStrategyPerformanceの実用的な使用例
const result = instance.analyzeStrategyPerformance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (strategy.success)
```

**パラメーター**:
- `strategy.success`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(strategy.success);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeCategoryPerformance

**シグネチャ**:
```javascript
 analyzeCategoryPerformance(recoveries)
```

**パラメーター**:
- `recoveries`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeCategoryPerformance(recoveries);

// analyzeCategoryPerformanceの実用的な使用例
const result = instance.analyzeCategoryPerformance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (recovery.success)
```

**パラメーター**:
- `recovery.success`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(recovery.success);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateRecoveryRecommendations

**シグネチャ**:
```javascript
 generateRecoveryRecommendations(recoveries)
```

**パラメーター**:
- `recoveries`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateRecoveryRecommendations(recoveries);

// generateRecoveryRecommendationsの実用的な使用例
const result = instance.generateRecoveryRecommendations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (lowPerformanceStrategies.length > 0)
```

**パラメーター**:
- `lowPerformanceStrategies.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(lowPerformanceStrategies.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (unrecoverableCategories.length > 0)
```

**パラメーター**:
- `unrecoverableCategories.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(unrecoverableCategories.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupPeriodicAnalysis

**シグネチャ**:
```javascript
 setupPeriodicAnalysis()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupPeriodicAnalysis();

// setupPeriodicAnalysisの実用的な使用例
const result = instance.setupPeriodicAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateRecoveryStatistics

**シグネチャ**:
```javascript
 updateRecoveryStatistics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateRecoveryStatistics();

// updateRecoveryStatisticsの実用的な使用例
const result = instance.updateRecoveryStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (recentRecoveries.length > 0)
```

**パラメーター**:
- `recentRecoveries.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(recentRecoveries.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### loadRecoveryData

**シグネチャ**:
```javascript
 loadRecoveryData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadRecoveryData();

// loadRecoveryDataの実用的な使用例
const result = instance.loadRecoveryData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (stored)
```

**パラメーター**:
- `stored`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stored);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data.recoveryStats)
```

**パラメーター**:
- `data.recoveryStats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.recoveryStats);

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

#### saveRecoveryData

**シグネチャ**:
```javascript
 saveRecoveryData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveRecoveryData();

// saveRecoveryDataの実用的な使用例
const result = instance.saveRecoveryData(/* 適切なパラメータ */);
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

#### updateConfiguration

**シグネチャ**:
```javascript
 updateConfiguration(newConfig)
```

**パラメーター**:
- `newConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateConfiguration(newConfig);

// updateConfigurationの実用的な使用例
const result = instance.updateConfiguration(/* 適切なパラメータ */);
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


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `recoverySession` | 説明なし |
| `strategies` | 説明なし |
| `session` | 説明なし |
| `applicableStrategies` | 説明なし |
| `priorityDiff` | 説明なし |
| `errorText` | 説明なし |
| `cooldownKey` | 説明なし |
| `cooldownTimer` | 説明なし |
| `recentAttempts` | 説明なし |
| `strategyAttempt` | 説明なし |
| `result` | 説明なし |
| `memoryBefore` | 説明なし |
| `memoryAfter` | 説明なし |
| `improvement` | 説明なし |
| `gameEngine` | 説明なし |
| `ctx` | 説明なし |
| `gameEngine` | 説明なし |
| `gameEngine` | 説明なし |
| `gameEngine` | 説明なし |
| `currentScene` | 説明なし |
| `sceneName` | 説明なし |
| `gameEngine` | 説明なし |
| `gameEngine` | 説明なし |
| `componentName` | 説明なし |
| `component` | 説明なし |
| `message` | 説明なし |
| `category` | 説明なし |
| `cooldownKey` | 説明なし |
| `cooldownEnd` | 説明なし |
| `strategyStats` | 説明なし |
| `categoryStats` | 説明なし |
| `strategyStats` | 説明なし |
| `categoryStats` | 説明なし |
| `strategyStats` | 説明なし |
| `effectiveness` | 説明なし |
| `key` | 説明なし |
| `data` | 説明なし |
| `recentRecoveries` | 説明なし |
| `now` | 説明なし |
| `totalTime` | 説明なし |
| `strategyPerformance` | 説明なし |
| `perf` | 説明なし |
| `categoryPerformance` | 説明なし |
| `category` | 説明なし |
| `perf` | 説明なし |
| `recommendations` | 説明なし |
| `strategyAnalysis` | 説明なし |
| `lowPerformanceStrategies` | 説明なし |
| `categoryAnalysis` | 説明なし |
| `unrecoverableCategories` | 説明なし |
| `recentRecoveries` | 説明なし |
| `stored` | 説明なし |
| `data` | 説明なし |
| `dataToSave` | 説明なし |

---

