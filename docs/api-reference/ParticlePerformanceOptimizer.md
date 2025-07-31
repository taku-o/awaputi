# ParticlePerformanceOptimizer

## 概要

ファイル: `utils/ParticlePerformanceOptimizer.js`  
最終更新: 2025/7/28 12:01:10

## 目次

## クラス
- [ParticlePerformanceOptimizer](#particleperformanceoptimizer)
## 関数
- [getParticlePerformanceOptimizer()](#getparticleperformanceoptimizer)
- [reinitializeParticlePerformanceOptimizer()](#reinitializeparticleperformanceoptimizer)
## 定数
- [poolTypes](#pooltypes)
- [worldSize](#worldsize)
- [gridSize](#gridsize)
- [key](#key)
- [bufferTypes](#buffertypes)
- [defaultTypes](#defaulttypes)
- [optimizationStart](#optimizationstart)
- [cullingStart](#cullingstart)
- [visibleParticles](#visibleparticles)
- [scaledParticles](#scaledparticles)
- [batchingStart](#batchingstart)
- [renderBatches](#renderbatches)
- [totalTime](#totaltime)
- [alpha](#alpha)
- [gridSize](#gridsize)
- [gridX](#gridx)
- [gridY](#gridy)
- [key](#key)
- [cell](#cell)
- [stats](#stats)
- [beforeDistance](#beforedistance)
- [beforeAge](#beforeage)
- [beforeImportance](#beforeimportance)
- [frustum](#frustum)
- [margin](#margin)
- [maxDistance](#maxdistance)
- [fadeDistance](#fadedistance)
- [dx](#dx)
- [dy](#dy)
- [distance](#distance)
- [fadeRatio](#faderatio)
- [age](#age)
- [lifetime](#lifetime)
- [ageRatio](#ageratio)
- [particlesWithScores](#particleswithscores)
- [culledCount](#culledcount)
- [importantParticles](#importantparticles)
- [cacheKey](#cachekey)
- [factors](#factors)
- [distance](#distance)
- [distanceScore](#distancescore)
- [size](#size)
- [sizeScore](#sizescore)
- [opacity](#opacity)
- [velocity](#velocity)
- [velocityScore](#velocityscore)
- [age](#age)
- [lifetime](#lifetime)
- [ageScore](#agescore)
- [screenSize](#screensize)
- [screenAreaScore](#screenareascore)
- [effectType](#effecttype)
- [effectConfig](#effectconfig)
- [priority](#priority)
- [priorityScore](#priorityscore)
- [finalScore](#finalscore)
- [currentFrame](#currentframe)
- [maxAge](#maxage)
- [currentLevel](#currentlevel)
- [qualityConfig](#qualityconfig)
- [scaledParticles](#scaledparticles)
- [scaledParticle](#scaledparticle)
- [targetCount](#targetcount)
- [particlesWithImportance](#particleswithimportance)
- [batches](#batches)
- [batchKey](#batchkey)
- [optimizedBatches](#optimizedbatches)
- [material](#material)
- [texture](#texture)
- [blendMode](#blendmode)
- [optimizedBatches](#optimizedbatches)
- [maxBatchSize](#maxbatchsize)
- [particles](#particles)
- [subBatch](#subbatch)
- [monitor](#monitor)
- [performanceGain](#performancegain)
- [reductionRatio](#reductionratio)
- [batchingGain](#batchinggain)
- [cullingGain](#cullinggain)
- [history](#history)
- [recentFrames](#recentframes)
- [avgOptimizationTime](#avgoptimizationtime)
- [particleLoad](#particleload)
- [estimatedFPS](#estimatedfps)
- [currentFPS](#currentfps)
- [targetFPS](#targetfps)
- [optimizationTrigger](#optimizationtrigger)
- [reductionRate](#reductionrate)
- [newLevel](#newlevel)
- [newLimit](#newlimit)
- [recoveryRate](#recoveryrate)
- [newLevel](#newlevel)
- [targetLimit](#targetlimit)
- [newLimit](#newlimit)
- [effectConfig](#effectconfig)
- [effect](#effect)
- [pool](#pool)
- [particle](#particle)
- [particle](#particle)
- [type](#type)
- [pool](#pool)
- [levelConfig](#levelconfig)
- [particlePerformanceOptimizer](#particleperformanceoptimizer)

---

## ParticlePerformanceOptimizer

### コンストラクタ

```javascript
new ParticlePerformanceOptimizer()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `errorHandler` | 説明なし |
| `configManager` | 説明なし |
| `particleConfig` | Particle optimization configuration |
| `particleManager` | Particle management |
| `importanceScoring` | Importance scoring system |
| `qualityScaling` | Quality scaling system |
| `batchRenderer` | Batch rendering system |
| `performanceMonitor` | Performance monitoring |
| `cullingSystem` | Culling system |
| `effectSystem` | Effect system integration |
| `monitoringInterval` | 説明なし |

### メソッド

#### initializeParticleOptimizer

**シグネチャ**:
```javascript
 initializeParticleOptimizer()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeParticleOptimizer();

// initializeParticleOptimizerの実用的な使用例
const result = instance.initializeParticleOptimizer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### initializeParticlePools

**シグネチャ**:
```javascript
 initializeParticlePools()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeParticlePools();

// initializeParticlePoolsの実用的な使用例
const result = instance.initializeParticlePools(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const type of poolTypes)
```

**パラメーター**:
- `const type of poolTypes`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const type of poolTypes);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### initializeSpatialPartitioning

**シグネチャ**:
```javascript
 initializeSpatialPartitioning()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeSpatialPartitioning();

// initializeSpatialPartitioningの実用的な使用例
const result = instance.initializeSpatialPartitioning(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let x = -worldSize; x < worldSize; x += gridSize)
```

**パラメーター**:
- `let x = -worldSize; x < worldSize; x += gridSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let x = -worldSize; x < worldSize; x += gridSize);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let y = -worldSize; y < worldSize; y += gridSize)
```

**パラメーター**:
- `let y = -worldSize; y < worldSize; y += gridSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let y = -worldSize; y < worldSize; y += gridSize);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### initializeBatchRenderer

**シグネチャ**:
```javascript
 initializeBatchRenderer()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeBatchRenderer();

// initializeBatchRendererの実用的な使用例
const result = instance.initializeBatchRenderer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createVertexBuffers

**シグネチャ**:
```javascript
 createVertexBuffers()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createVertexBuffers();

// createVertexBuffersの実用的な使用例
const result = instance.createVertexBuffers(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const type of bufferTypes)
```

**パラメーター**:
- `const type of bufferTypes`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const type of bufferTypes);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createTextureAtlas

**シグネチャ**:
```javascript
 createTextureAtlas()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createTextureAtlas();

// createTextureAtlasの実用的な使用例
const result = instance.createTextureAtlas(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupInstanceRendering

**シグネチャ**:
```javascript
 setupInstanceRendering()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupInstanceRendering();

// setupInstanceRenderingの実用的な使用例
const result = instance.setupInstanceRendering(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startPerformanceMonitoring

**シグネチャ**:
```javascript
 startPerformanceMonitoring()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startPerformanceMonitoring();

// startPerformanceMonitoringの実用的な使用例
const result = instance.startPerformanceMonitoring(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### registerDefaultParticleTypes

**シグネチャ**:
```javascript
 registerDefaultParticleTypes()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerDefaultParticleTypes();

// registerDefaultParticleTypesの実用的な使用例
const result = instance.registerDefaultParticleTypes(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### registerParticleType

**シグネチャ**:
```javascript
 registerParticleType(type, config)
```

**パラメーター**:
- `type`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerParticleType(type, config);

// registerParticleTypeの実用的な使用例
const result = instance.registerParticleType(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### optimizeParticles

**シグネチャ**:
```javascript
 optimizeParticles(particles, camera = null)
```

**パラメーター**:
- `particles`
- `camera = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.optimizeParticles(particles, camera = null);

// optimizeParticlesの実用的な使用例
const result = instance.optimizeParticles(/* 適切なパラメータ */);
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

#### updateParticleTracking

**シグネチャ**:
```javascript
 updateParticleTracking(particles)
```

**パラメーター**:
- `particles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateParticleTracking(particles);

// updateParticleTrackingの実用的な使用例
const result = instance.updateParticleTracking(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

Update spatial partitioning

**シグネチャ**:
```javascript
 for (const particle of particles)
```

**パラメーター**:
- `const particle of particles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const particle of particles);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addParticleToSpatialGrid

**シグネチャ**:
```javascript
 addParticleToSpatialGrid(particle)
```

**パラメーター**:
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addParticleToSpatialGrid(particle);

// addParticleToSpatialGridの実用的な使用例
const result = instance.addParticleToSpatialGrid(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (cell)
```

**パラメーター**:
- `cell`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(cell);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performParticleCulling

**シグネチャ**:
```javascript
 performParticleCulling(particles, camera)
```

**パラメーター**:
- `particles`
- `camera`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performParticleCulling(particles, camera);

// performParticleCullingの実用的な使用例
const result = instance.performParticleCulling(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.particleConfig.cullingEnabled)
```

**パラメーター**:
- `!this.particleConfig.cullingEnabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.particleConfig.cullingEnabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Frustum culling

**シグネチャ**:
```javascript
 if (this.particleConfig.culling.frustumCulling && camera)
```

**パラメーター**:
- `this.particleConfig.culling.frustumCulling && camera`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particleConfig.culling.frustumCulling && camera);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Distance culling

**シグネチャ**:
```javascript
 if (this.particleConfig.culling.distanceCulling && camera)
```

**パラメーター**:
- `this.particleConfig.culling.distanceCulling && camera`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particleConfig.culling.distanceCulling && camera);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Age culling (remove very old or very young particles based on importance)

**シグネチャ**:
```javascript
 culling (remove very old or very young particles based on importance)
```

**パラメーター**:
- `remove very old or very young particles based on importance`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(remove very old or very young particles based on importance);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Importance-based culling (most important step)

**シグネチャ**:
```javascript
 culling (most important step)
```

**パラメーター**:
- `most important step`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(most important step);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performFrustumCulling

**シグネチャ**:
```javascript
 performFrustumCulling(particles, camera)
```

**パラメーター**:
- `particles`
- `camera`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performFrustumCulling(particles, camera);

// performFrustumCullingの実用的な使用例
const result = instance.performFrustumCulling(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateFrustum

**シグネチャ**:
```javascript
 updateFrustum(camera)
```

**パラメーター**:
- `camera`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateFrustum(camera);

// updateFrustumの実用的な使用例
const result = instance.updateFrustum(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performDistanceCulling

**シグネチャ**:
```javascript
 performDistanceCulling(particles, camera)
```

**パラメーター**:
- `particles`
- `camera`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performDistanceCulling(particles, camera);

// performDistanceCullingの実用的な使用例
const result = instance.performDistanceCulling(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance > maxDistance)
```

**パラメーター**:
- `distance > maxDistance`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance > maxDistance);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Apply fade for particles near max distance

**シグネチャ**:
```javascript
 if (distance > fadeDistance)
```

**パラメーター**:
- `distance > fadeDistance`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance > fadeDistance);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performAgeCulling

**シグネチャ**:
```javascript
 performAgeCulling(particles)
```

**パラメーター**:
- `particles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performAgeCulling(particles);

// performAgeCullingの実用的な使用例
const result = instance.performAgeCulling(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Cull particles that are too young (just created, may not be visible yet)

**シグネチャ**:
```javascript
 young (just created, may not be visible yet)
```

**パラメーター**:
- `just created`
- `may not be visible yet`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(just created, may not be visible yet);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Cull particles that are too old (nearly dead, very transparent)

**シグネチャ**:
```javascript
 old (nearly dead, very transparent)
```

**パラメーター**:
- `nearly dead`
- `very transparent`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(nearly dead, very transparent);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performImportanceCulling

**シグネチャ**:
```javascript
 performImportanceCulling(particles)
```

**パラメーター**:
- `particles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performImportanceCulling(particles);

// performImportanceCullingの実用的な使用例
const result = instance.performImportanceCulling(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

If we're under the limit, no need to cull

**シグネチャ**:
```javascript
 if (particles.length <= this.particleConfig.maxParticles)
```

**パラメーター**:
- `particles.length <= this.particleConfig.maxParticles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particles.length <= this.particleConfig.maxParticles);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateParticleImportance

**シグネチャ**:
```javascript
 calculateParticleImportance(particle)
```

**パラメーター**:
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateParticleImportance(particle);

// calculateParticleImportanceの実用的な使用例
const result = instance.calculateParticleImportance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Clean old cache entries periodically

**シグネチャ**:
```javascript
 if (this.importanceScoring.scoreCache.size > 10000)
```

**パラメーター**:
- `this.importanceScoring.scoreCache.size > 10000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.importanceScoring.scoreCache.size > 10000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanImportanceCache

**シグネチャ**:
```javascript
 cleanImportanceCache()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanImportanceCache();

// cleanImportanceCacheの実用的な使用例
const result = instance.cleanImportanceCache(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentFrame - timestamp > maxAge)
```

**パラメーター**:
- `currentFrame - timestamp > maxAge`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentFrame - timestamp > maxAge);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyQualityScaling

**シグネチャ**:
```javascript
 applyQualityScaling(particles)
```

**パラメーター**:
- `particles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyQualityScaling(particles);

// applyQualityScalingの実用的な使用例
const result = instance.applyQualityScaling(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.qualityScaling.enabled)
```

**パラメーター**:
- `!this.qualityScaling.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.qualityScaling.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Scale complexity (reduce particle properties)

**シグネチャ**:
```javascript
 complexity (reduce particle properties)
```

**パラメーター**:
- `reduce particle properties`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(reduce particle properties);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Remove expensive effects at low quality

**シグネチャ**:
```javascript
 if (currentLevel < 0.6)
```

**パラメーター**:
- `currentLevel < 0.6`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentLevel < 0.6);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentLevel < 0.4)
```

**パラメーター**:
- `currentLevel < 0.4`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentLevel < 0.4);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (scaledParticles.length > targetCount)
```

**パラメーター**:
- `scaledParticles.length > targetCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scaledParticles.length > targetCount);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRenderBatches

**シグネチャ**:
```javascript
 createRenderBatches(particles)
```

**パラメーター**:
- `particles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRenderBatches(particles);

// createRenderBatchesの実用的な使用例
const result = instance.createRenderBatches(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.batchRenderer.enabled)
```

**パラメーター**:
- `!this.batchRenderer.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.batchRenderer.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

Group particles by render properties

**シグネチャ**:
```javascript
 for (const particle of particles)
```

**パラメーター**:
- `const particle of particles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const particle of particles);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBatchKey

**シグネチャ**:
```javascript
 getBatchKey(particle)
```

**パラメーター**:
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBatchKey(particle);

// getBatchKeyの実用的な使用例
const result = instance.getBatchKey(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### optimizeBatchSizes

**シグネチャ**:
```javascript
 optimizeBatchSizes(batches)
```

**パラメーター**:
- `batches`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.optimizeBatchSizes(batches);

// optimizeBatchSizesの実用的な使用例
const result = instance.optimizeBatchSizes(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [key, batch] of batches)
```

**パラメーター**:
- `const [key`
- `batch] of batches`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [key, batch] of batches);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (particles.length <= maxBatchSize)
```

**パラメーター**:
- `particles.length <= maxBatchSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particles.length <= maxBatchSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

Split large batch into smaller batches

**シグネチャ**:
```javascript
 for (let i = 0; i < particles.length; i += maxBatchSize)
```

**パラメーター**:
- `let i = 0; i < particles.length; i += maxBatchSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particles.length; i += maxBatchSize);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateFramePerformanceMetrics

**シグネチャ**:
```javascript
 updateFramePerformanceMetrics(optimizationTime, originalCount, finalCount)
```

**パラメーター**:
- `optimizationTime`
- `originalCount`
- `finalCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateFramePerformanceMetrics(optimizationTime, originalCount, finalCount);

// updateFramePerformanceMetricsの実用的な使用例
const result = instance.updateFramePerformanceMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Keep history size manageable

**シグネチャ**:
```javascript
 if (monitor.performanceHistory.length > monitor.historySize)
```

**パラメーター**:
- `monitor.performanceHistory.length > monitor.historySize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(monitor.performanceHistory.length > monitor.historySize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculatePerformanceGain

**シグネチャ**:
```javascript
 calculatePerformanceGain(originalCount, finalCount)
```

**パラメーター**:
- `originalCount`
- `finalCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculatePerformanceGain(originalCount, finalCount);

// calculatePerformanceGainの実用的な使用例
const result = instance.calculatePerformanceGain(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updatePerformanceMetrics

**シグネチャ**:
```javascript
 updatePerformanceMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updatePerformanceMetrics();

// updatePerformanceMetricsの実用的な使用例
const result = instance.updatePerformanceMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### performAdaptiveOptimization

**シグネチャ**:
```javascript
 performAdaptiveOptimization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.performAdaptiveOptimization();

// performAdaptiveOptimizationの実用的な使用例
const result = instance.performAdaptiveOptimization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Check if we need to reduce quality

**シグネチャ**:
```javascript
 if (currentFPS < optimizationTrigger)
```

**パラメーター**:
- `currentFPS < optimizationTrigger`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentFPS < optimizationTrigger);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentFPS > targetFPS + 10)
```

**パラメーター**:
- `currentFPS > targetFPS + 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentFPS > targetFPS + 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### reduceParticleQuality

**シグネチャ**:
```javascript
 reduceParticleQuality()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.reduceParticleQuality();

// reduceParticleQualityの実用的な使用例
const result = instance.reduceParticleQuality(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newLevel !== this.qualityScaling.currentLevel)
```

**パラメーター**:
- `newLevel !== this.qualityScaling.currentLevel`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newLevel !== this.qualityScaling.currentLevel);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### increaseParticleQuality

**シグネチャ**:
```javascript
 increaseParticleQuality()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.increaseParticleQuality();

// increaseParticleQualityの実用的な使用例
const result = instance.increaseParticleQuality(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newLevel !== this.qualityScaling.currentLevel)
```

**パラメーター**:
- `newLevel !== this.qualityScaling.currentLevel`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newLevel !== this.qualityScaling.currentLevel);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (document.hidden)
```

**パラメーター**:
- `document.hidden`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(document.hidden);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleQualityChange

**シグネチャ**:
```javascript
 handleQualityChange(details)
```

**パラメーター**:
- `details`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleQualityChange(details);

// handleQualityChangeの実用的な使用例
const result = instance.handleQualityChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (details.level && this.qualityScaling.levels[details.level])
```

**パラメーター**:
- `details.level && this.qualityScaling.levels[details.level]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(details.level && this.qualityScaling.levels[details.level]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handlePerformanceWarning

**シグネチャ**:
```javascript
 handlePerformanceWarning(warning)
```

**パラメーター**:
- `warning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handlePerformanceWarning(warning);

// handlePerformanceWarningの実用的な使用例
const result = instance.handlePerformanceWarning(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (warning.type === 'critical' || warning.source === 'particles')
```

**パラメーター**:
- `warning.type === 'critical' || warning.source === 'particles'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(warning.type === 'critical' || warning.source === 'particles');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### pauseParticleOptimization

**シグネチャ**:
```javascript
 pauseParticleOptimization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.pauseParticleOptimization();

// pauseParticleOptimizationの実用的な使用例
const result = instance.pauseParticleOptimization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resumeParticleOptimization

**シグネチャ**:
```javascript
 resumeParticleOptimization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resumeParticleOptimization();

// resumeParticleOptimizationの実用的な使用例
const result = instance.resumeParticleOptimization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createEffect

**シグネチャ**:
```javascript
 createEffect(type, config)
```

**パラメーター**:
- `type`
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createEffect(type, config);

// createEffectの実用的な使用例
const result = instance.createEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!effectConfig)
```

**パラメーター**:
- `!effectConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!effectConfig);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getParticleFromPool

**シグネチャ**:
```javascript
 getParticleFromPool(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getParticleFromPool(type);

// getParticleFromPoolの実用的な使用例
const result = instance.getParticleFromPool(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!pool)
```

**パラメーター**:
- `!pool`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!pool);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (pool.available.length > 0)
```

**パラメーター**:
- `pool.available.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(pool.available.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Create new particle if pool is empty

**シグネチャ**:
```javascript
 if (pool.inUse.size < pool.maxSize)
```

**パラメーター**:
- `pool.inUse.size < pool.maxSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(pool.inUse.size < pool.maxSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### createNewParticle

**シグネチャ**:
```javascript
 createNewParticle(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createNewParticle(type);

// createNewParticleの実用的な使用例
const result = instance.createNewParticle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetParticle

**シグネチャ**:
```javascript
 resetParticle(particle)
```

**パラメーター**:
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetParticle(particle);

// resetParticleの実用的な使用例
const result = instance.resetParticle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setQualityLevel

**シグネチャ**:
```javascript
 setQualityLevel(level)
```

**パラメーター**:
- `level`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setQualityLevel(level);

// setQualityLevelの実用的な使用例
const result = instance.setQualityLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.qualityScaling.levels[level])
```

**パラメーター**:
- `this.qualityScaling.levels[level]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.qualityScaling.levels[level]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setAdaptiveOptimization

**シグネチャ**:
```javascript
 setAdaptiveOptimization(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setAdaptiveOptimization(enabled);

// setAdaptiveOptimizationの実用的な使用例
const result = instance.setAdaptiveOptimization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStats

**シグネチャ**:
```javascript
 getStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStats();

// getStatsの実用的な使用例
const result = instance.getStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### configure

**シグネチャ**:
```javascript
 configure(config)
```

**パラメーター**:
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.configure(config);

// configureの実用的な使用例
const result = instance.configure(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.particles)
```

**パラメーター**:
- `config.particles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.particles);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.culling)
```

**パラメーター**:
- `config.culling`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.culling);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.quality)
```

**パラメーター**:
- `config.quality`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.quality);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.batching)
```

**パラメーター**:
- `config.batching`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.batching);

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

Clear intervals

**シグネチャ**:
```javascript
 if (this.monitoringInterval)
```

**パラメーター**:
- `this.monitoringInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.monitoringInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getParticlePerformanceOptimizer

**シグネチャ**:
```javascript
getParticlePerformanceOptimizer()
```

**使用例**:
```javascript
const result = getParticlePerformanceOptimizer();
```

---

## reinitializeParticlePerformanceOptimizer

**シグネチャ**:
```javascript
reinitializeParticlePerformanceOptimizer()
```

**使用例**:
```javascript
const result = reinitializeParticlePerformanceOptimizer();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `poolTypes` | 説明なし |
| `worldSize` | 説明なし |
| `gridSize` | 説明なし |
| `key` | 説明なし |
| `bufferTypes` | 説明なし |
| `defaultTypes` | 説明なし |
| `optimizationStart` | 説明なし |
| `cullingStart` | 説明なし |
| `visibleParticles` | 説明なし |
| `scaledParticles` | 説明なし |
| `batchingStart` | 説明なし |
| `renderBatches` | 説明なし |
| `totalTime` | 説明なし |
| `alpha` | 説明なし |
| `gridSize` | 説明なし |
| `gridX` | 説明なし |
| `gridY` | 説明なし |
| `key` | 説明なし |
| `cell` | 説明なし |
| `stats` | 説明なし |
| `beforeDistance` | 説明なし |
| `beforeAge` | 説明なし |
| `beforeImportance` | 説明なし |
| `frustum` | 説明なし |
| `margin` | 説明なし |
| `maxDistance` | 説明なし |
| `fadeDistance` | 説明なし |
| `dx` | 説明なし |
| `dy` | 説明なし |
| `distance` | 説明なし |
| `fadeRatio` | 説明なし |
| `age` | 説明なし |
| `lifetime` | 説明なし |
| `ageRatio` | 説明なし |
| `particlesWithScores` | 説明なし |
| `culledCount` | 説明なし |
| `importantParticles` | 説明なし |
| `cacheKey` | 説明なし |
| `factors` | 説明なし |
| `distance` | 説明なし |
| `distanceScore` | 説明なし |
| `size` | 説明なし |
| `sizeScore` | 説明なし |
| `opacity` | 説明なし |
| `velocity` | 説明なし |
| `velocityScore` | 説明なし |
| `age` | 説明なし |
| `lifetime` | 説明なし |
| `ageScore` | 説明なし |
| `screenSize` | 説明なし |
| `screenAreaScore` | 説明なし |
| `effectType` | 説明なし |
| `effectConfig` | 説明なし |
| `priority` | 説明なし |
| `priorityScore` | 説明なし |
| `finalScore` | 説明なし |
| `currentFrame` | 説明なし |
| `maxAge` | 説明なし |
| `currentLevel` | 説明なし |
| `qualityConfig` | 説明なし |
| `scaledParticles` | 説明なし |
| `scaledParticle` | 説明なし |
| `targetCount` | 説明なし |
| `particlesWithImportance` | 説明なし |
| `batches` | 説明なし |
| `batchKey` | 説明なし |
| `optimizedBatches` | 説明なし |
| `material` | 説明なし |
| `texture` | 説明なし |
| `blendMode` | 説明なし |
| `optimizedBatches` | 説明なし |
| `maxBatchSize` | 説明なし |
| `particles` | 説明なし |
| `subBatch` | 説明なし |
| `monitor` | 説明なし |
| `performanceGain` | 説明なし |
| `reductionRatio` | 説明なし |
| `batchingGain` | 説明なし |
| `cullingGain` | 説明なし |
| `history` | 説明なし |
| `recentFrames` | 説明なし |
| `avgOptimizationTime` | 説明なし |
| `particleLoad` | 説明なし |
| `estimatedFPS` | 説明なし |
| `currentFPS` | 説明なし |
| `targetFPS` | 説明なし |
| `optimizationTrigger` | 説明なし |
| `reductionRate` | 説明なし |
| `newLevel` | 説明なし |
| `newLimit` | 説明なし |
| `recoveryRate` | 説明なし |
| `newLevel` | 説明なし |
| `targetLimit` | 説明なし |
| `newLimit` | 説明なし |
| `effectConfig` | 説明なし |
| `effect` | 説明なし |
| `pool` | 説明なし |
| `particle` | 説明なし |
| `particle` | 説明なし |
| `type` | 説明なし |
| `pool` | 説明なし |
| `levelConfig` | 説明なし |
| `particlePerformanceOptimizer` | 後方互換性のため |

---

