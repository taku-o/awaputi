# ParticleManager

## 概要

ファイル: `effects/ParticleManager.js`  
最終更新: 2025/7/26 20:49:00

## 目次

## クラス
- [ParticleManager](#particlemanager)
## 定数
- [particleConfig](#particleconfig)
- [oldValue](#oldvalue)
- [excessCount](#excesscount)
- [particle](#particle)
- [oldValue](#oldvalue)
- [addCount](#addcount)
- [oldValue](#oldvalue)
- [oldValue](#oldvalue)
- [particle](#particle)
- [particle](#particle)
- [particleConfig](#particleconfig)
- [bubbleConfig](#bubbleconfig)
- [baseParticleCount](#baseparticlecount)
- [particleCount](#particlecount)
- [colors](#colors)
- [particle](#particle)
- [angle](#angle)
- [speed](#speed)
- [colorSets](#colorsets)
- [sparkleCount](#sparklecount)
- [colors](#colors)
- [particle](#particle)
- [sparkCount](#sparkcount)
- [particle](#particle)
- [spikeCount](#spikecount)
- [particle](#particle)
- [angle](#angle)
- [speed](#speed)
- [shardCount](#shardcount)
- [particle](#particle)
- [explosionCount](#explosioncount)
- [particle](#particle)
- [angle](#angle)
- [speed](#speed)
- [cloudCount](#cloudcount)
- [particle](#particle)
- [rippleCount](#ripplecount)
- [particle](#particle)
- [particleConfig](#particleconfig)
- [starConfig](#starconfig)
- [baseStarCount](#basestarcount)
- [starCount](#starcount)
- [colors](#colors)
- [particle](#particle)
- [angle](#angle)
- [radius](#radius)
- [speed](#speed)
- [deltaSeconds](#deltaseconds)
- [excessCount](#excesscount)
- [particle](#particle)
- [lifeRatio](#liferatio)
- [pulse](#pulse)
- [trailPoint](#trailpoint)
- [spikes](#spikes)
- [outerRadius](#outerradius)
- [innerRadius](#innerradius)
- [angle](#angle)
- [radius](#radius)
- [x](#x)
- [y](#y)
- [angle](#angle)
- [radius](#radius)
- [x](#x)
- [y](#y)
- [stats](#stats)
- [config](#config)
- [distribution](#distribution)

---

## ParticleManager

### コンストラクタ

```javascript
new ParticleManager()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `particles` | 説明なし |
| `particleId` | 説明なし |
| `effectsConfig` | 設定システムの初期化 |
| `particlePool` | パーティクルプール（最適化用） |
| `maxParticles` | 説明なし |
| `poolSize` | 説明なし |
| `quality` | 説明なし |
| `enabled` | 説明なし |
| `maxParticles` | フォールバック値 |
| `poolSize` | 説明なし |
| `quality` | 説明なし |
| `enabled` | 説明なし |
| `maxParticles` | 説明なし |
| `poolSize` | 説明なし |
| `quality` | 説明なし |
| `enabled` | 説明なし |
| `particlePool` | 説明なし |
| `particles` | 説明なし |
| `particles` | 説明なし |

### メソッド

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

#### if

現在のパーティクル数が新しい制限を超えている場合は削除

**シグネチャ**:
```javascript
 if (this.particles.length > newValue)
```

**パラメーター**:
- `this.particles.length > newValue`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particles.length > newValue);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < excessCount; i++)
```

**パラメーター**:
- `let i = 0; i < excessCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < excessCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

#### if

プールサイズに合わせて調整

**シグネチャ**:
```javascript
 if (this.particlePool.length > newValue)
```

**パラメーター**:
- `this.particlePool.length > newValue`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particlePool.length > newValue);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.particlePool.length < newValue)
```

**パラメーター**:
- `this.particlePool.length < newValue`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particlePool.length < newValue);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < addCount; i++)
```

**パラメーター**:
- `let i = 0; i < addCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < addCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

#### if

無効になった場合は全パーティクルをクリア

**シグネチャ**:
```javascript
 if (!newValue)
```

**パラメーター**:
- `!newValue`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!newValue);

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

#### initializePool

**シグネチャ**:
```javascript
 initializePool()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializePool();

// initializePoolの実用的な使用例
const result = instance.initializePool(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < this.poolSize; i++)
```

**パラメーター**:
- `let i = 0; i < this.poolSize; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < this.poolSize; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createParticleObject

**シグネチャ**:
```javascript
 createParticleObject()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createParticleObject();

// createParticleObjectの実用的な使用例
const result = instance.createParticleObject(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (this.particlePool.length > 0)
```

**パラメーター**:
- `this.particlePool.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particlePool.length > 0);

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

#### if

**シグネチャ**:
```javascript
 if (this.particlePool.length < this.poolSize)
```

**パラメーター**:
- `this.particlePool.length < this.poolSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particlePool.length < this.poolSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createBubblePopEffect

**シグネチャ**:
```javascript
 createBubblePopEffect(x, y, bubbleType, bubbleSize)
```

**パラメーター**:
- `x`
- `y`
- `bubbleType`
- `bubbleSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createBubblePopEffect(x, y, bubbleType, bubbleSize);

// createBubblePopEffectの実用的な使用例
const result = instance.createBubblePopEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パーティクルが無効な場合は何もしない

**シグネチャ**:
```javascript
 if (!this.enabled)
```

**パラメーター**:
- `!this.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < particleCount; i++)
```

**パラメーター**:
- `let i = 0; i < particleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < particleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

#### getBubbleColors

**シグネチャ**:
```javascript
 getBubbleColors(bubbleType)
```

**パラメーター**:
- `bubbleType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubbleColors(bubbleType);

// getBubbleColorsの実用的な使用例
const result = instance.getBubbleColors(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createSpecialBubbleEffect

**シグネチャ**:
```javascript
 createSpecialBubbleEffect(x, y, bubbleType, bubbleSize)
```

**パラメーター**:
- `x`
- `y`
- `bubbleType`
- `bubbleSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSpecialBubbleEffect(x, y, bubbleType, bubbleSize);

// createSpecialBubbleEffectの実用的な使用例
const result = instance.createSpecialBubbleEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (bubbleType)
```

**パラメーター**:
- `bubbleType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(bubbleType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createRainbowSparkles

**シグネチャ**:
```javascript
 createRainbowSparkles(x, y, size)
```

**パラメーター**:
- `x`
- `y`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRainbowSparkles(x, y, size);

// createRainbowSparklesの実用的な使用例
const result = instance.createRainbowSparkles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < sparkleCount; i++)
```

**パラメーター**:
- `let i = 0; i < sparkleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < sparkleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createElectricSparks

**シグネチャ**:
```javascript
 createElectricSparks(x, y, size)
```

**パラメーター**:
- `x`
- `y`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createElectricSparks(x, y, size);

// createElectricSparksの実用的な使用例
const result = instance.createElectricSparks(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < sparkCount; i++)
```

**パラメーター**:
- `let i = 0; i < sparkCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < sparkCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createSpikeExplosion

**シグネチャ**:
```javascript
 createSpikeExplosion(x, y, size)
```

**パラメーター**:
- `x`
- `y`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSpikeExplosion(x, y, size);

// createSpikeExplosionの実用的な使用例
const result = instance.createSpikeExplosion(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < spikeCount; i++)
```

**パラメーター**:
- `let i = 0; i < spikeCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < spikeCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createDiamondShards

**シグネチャ**:
```javascript
 createDiamondShards(x, y, size)
```

**パラメーター**:
- `x`
- `y`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createDiamondShards(x, y, size);

// createDiamondShardsの実用的な使用例
const result = instance.createDiamondShards(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < shardCount; i++)
```

**パラメーター**:
- `let i = 0; i < shardCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < shardCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createBossExplosion

**シグネチャ**:
```javascript
 createBossExplosion(x, y, size)
```

**パラメーター**:
- `x`
- `y`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createBossExplosion(x, y, size);

// createBossExplosionの実用的な使用例
const result = instance.createBossExplosion(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < explosionCount; i++)
```

**パラメーター**:
- `let i = 0; i < explosionCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < explosionCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createPoisonCloud

**シグネチャ**:
```javascript
 createPoisonCloud(x, y, size)
```

**パラメーター**:
- `x`
- `y`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createPoisonCloud(x, y, size);

// createPoisonCloudの実用的な使用例
const result = instance.createPoisonCloud(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < cloudCount; i++)
```

**パラメーター**:
- `let i = 0; i < cloudCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < cloudCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createTimeRipple

**シグネチャ**:
```javascript
 createTimeRipple(x, y, size)
```

**パラメーター**:
- `x`
- `y`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createTimeRipple(x, y, size);

// createTimeRippleの実用的な使用例
const result = instance.createTimeRipple(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < rippleCount; i++)
```

**パラメーター**:
- `let i = 0; i < rippleCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < rippleCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createComboEffect

**シグネチャ**:
```javascript
 createComboEffect(x, y, comboCount)
```

**パラメーター**:
- `x`
- `y`
- `comboCount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createComboEffect(x, y, comboCount);

// createComboEffectの実用的な使用例
const result = instance.createComboEffect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パーティクルが無効な場合は何もしない

**シグネチャ**:
```javascript
 if (!this.enabled)
```

**パラメーター**:
- `!this.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < starCount; i++)
```

**パラメーター**:
- `let i = 0; i < starCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < starCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

**シグネチャ**:
```javascript
 if (particle.life <= 0)
```

**パラメーター**:
- `particle.life <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.life <= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パーティクル数制限

**シグネチャ**:
```javascript
 if (this.particles.length > this.maxParticles)
```

**パラメーター**:
- `this.particles.length > this.maxParticles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.particles.length > this.maxParticles);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < excessCount; i++)
```

**パラメーター**:
- `let i = 0; i < excessCount; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < excessCount; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updatePhysics

**シグネチャ**:
```javascript
 updatePhysics(particle, deltaSeconds)
```

**パラメーター**:
- `particle`
- `deltaSeconds`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updatePhysics(particle, deltaSeconds);

// updatePhysicsの実用的な使用例
const result = instance.updatePhysics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

境界での跳ね返り（必要に応じて）

**シグネチャ**:
```javascript
 if (particle.bounce > 0)
```

**パラメーター**:
- `particle.bounce > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.bounce > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

簡単な境界判定（実際の画面サイズは外部から渡す必要がある）

**シグネチャ**:
```javascript
 if (particle.y > 600 && particle.vy > 0)
```

**パラメーター**:
- `particle.y > 600 && particle.vy > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.y > 600 && particle.vy > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateAppearance

**シグネチャ**:
```javascript
 updateAppearance(particle, deltaSeconds)
```

**パラメーター**:
- `particle`
- `deltaSeconds`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateAppearance(particle, deltaSeconds);

// updateAppearanceの実用的な使用例
const result = instance.updateAppearance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パルス効果

**シグネチャ**:
```javascript
 if (particle.pulseSpeed > 0)
```

**パラメーター**:
- `particle.pulseSpeed > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.pulseSpeed > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateTrail

**シグネチャ**:
```javascript
 updateTrail(particle)
```

**パラメーター**:
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateTrail(particle);

// updateTrailの実用的な使用例
const result = instance.updateTrail(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (particle.maxTrailLength > 0)
```

**パラメーター**:
- `particle.maxTrailLength > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.maxTrailLength > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (particle.trail.length > particle.maxTrailLength)
```

**パラメーター**:
- `particle.trail.length > particle.maxTrailLength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.trail.length > particle.maxTrailLength);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### render

**シグネチャ**:
```javascript
 render(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render(context);

// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);
```

#### if

**シグネチャ**:
```javascript
 if (particle.rotation !== 0)
```

**パラメーター**:
- `particle.rotation !== 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.rotation !== 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (particle.scale !== 1)
```

**パラメーター**:
- `particle.scale !== 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(particle.scale !== 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderParticle

**シグネチャ**:
```javascript
 renderParticle(context, particle)
```

**パラメーター**:
- `context`
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderParticle(context, particle);

// renderParticleの実用的な使用例
const result = instance.renderParticle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (particle.type)
```

**パラメーター**:
- `particle.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(particle.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderTrail

**シグネチャ**:
```javascript
 renderTrail(context, particle)
```

**パラメーター**:
- `context`
- `particle`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderTrail(context, particle);

// renderTrailの実用的な使用例
const result = instance.renderTrail(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 1; i < particle.trail.length; i++)
```

**パラメーター**:
- `let i = 1; i < particle.trail.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 1; i < particle.trail.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawStar

**シグネチャ**:
```javascript
 drawStar(context, size)
```

**パラメーター**:
- `context`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawStar(context, size);

// drawStarの実用的な使用例
const result = instance.drawStar(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < spikes * 2; i++)
```

**パラメーター**:
- `let i = 0; i < spikes * 2; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < spikes * 2; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (i === 0)
```

**パラメーター**:
- `i === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(i === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawDiamond

**シグネチャ**:
```javascript
 drawDiamond(context, size)
```

**パラメーター**:
- `context`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawDiamond(context, size);

// drawDiamondの実用的な使用例
const result = instance.drawDiamond(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawSpike

**シグネチャ**:
```javascript
 drawSpike(context, size)
```

**パラメーター**:
- `context`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawSpike(context, size);

// drawSpikeの実用的な使用例
const result = instance.drawSpike(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawLightning

**シグネチャ**:
```javascript
 drawLightning(context, size)
```

**パラメーター**:
- `context`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawLightning(context, size);

// drawLightningの実用的な使用例
const result = instance.drawLightning(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawCloud

**シグネチャ**:
```javascript
 drawCloud(context, size)
```

**パラメーター**:
- `context`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawCloud(context, size);

// drawCloudの実用的な使用例
const result = instance.drawCloud(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawRipple

**シグネチャ**:
```javascript
 drawRipple(context, size)
```

**パラメーター**:
- `context`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawRipple(context, size);

// drawRippleの実用的な使用例
const result = instance.drawRipple(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawExplosion

**シグネチャ**:
```javascript
 drawExplosion(context, size)
```

**パラメーター**:
- `context`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawExplosion(context, size);

// drawExplosionの実用的な使用例
const result = instance.drawExplosion(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < 8; i++)
```

**パラメーター**:
- `let i = 0; i < 8; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < 8; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (i === 0)
```

**パラメーター**:
- `i === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(i === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clear

**シグネチャ**:
```javascript
 clear()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clear();

// clearの実用的な使用例
const result = instance.clear(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getParticleCount

**シグネチャ**:
```javascript
 getParticleCount()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getParticleCount();

// getParticleCountの実用的な使用例
const result = instance.getParticleCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getActiveParticles

**シグネチャ**:
```javascript
 getActiveParticles()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getActiveParticles();

// getActiveParticlesの実用的な使用例
const result = instance.getActiveParticles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearAllParticles

**シグネチャ**:
```javascript
 clearAllParticles()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearAllParticles();

// clearAllParticlesの実用的な使用例
const result = instance.clearAllParticles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateConfiguration

**シグネチャ**:
```javascript
 updateConfiguration(config)
```

**パラメーター**:
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateConfiguration(config);

// updateConfigurationの実用的な使用例
const result = instance.updateConfiguration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.maxParticles !== undefined)
```

**パラメーター**:
- `config.maxParticles !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.maxParticles !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.poolSize !== undefined)
```

**パラメーター**:
- `config.poolSize !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.poolSize !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.quality !== undefined)
```

**パラメーター**:
- `config.quality !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.quality !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.enabled !== undefined)
```

**パラメーター**:
- `config.enabled !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.enabled !== undefined);

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

#### getCurrentConfiguration

**シグネチャ**:
```javascript
 getCurrentConfiguration()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentConfiguration();

// getCurrentConfigurationの実用的な使用例
const result = instance.getCurrentConfiguration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getPerformanceStats

**シグネチャ**:
```javascript
 getPerformanceStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getPerformanceStats();

// getPerformanceStatsの実用的な使用例
const result = instance.getPerformanceStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### syncWithEffectsConfig

**シグネチャ**:
```javascript
 syncWithEffectsConfig()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.syncWithEffectsConfig();

// syncWithEffectsConfigの実用的な使用例
const result = instance.syncWithEffectsConfig(/* 適切なパラメータ */);
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

#### debugInfo

**シグネチャ**:
```javascript
 debugInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.debugInfo();

// debugInfoの実用的な使用例
const result = instance.debugInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(particle => {
            if (particle.isActive)
```

**パラメーター**:
- `particle => {
            if (particle.isActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(particle => {
            if (particle.isActive);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `particleConfig` | 説明なし |
| `oldValue` | 説明なし |
| `excessCount` | 説明なし |
| `particle` | 説明なし |
| `oldValue` | 説明なし |
| `addCount` | 説明なし |
| `oldValue` | 説明なし |
| `oldValue` | 説明なし |
| `particle` | 説明なし |
| `particle` | 説明なし |
| `particleConfig` | 説明なし |
| `bubbleConfig` | 説明なし |
| `baseParticleCount` | 説明なし |
| `particleCount` | 説明なし |
| `colors` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `speed` | 説明なし |
| `colorSets` | 説明なし |
| `sparkleCount` | 説明なし |
| `colors` | 説明なし |
| `particle` | 説明なし |
| `sparkCount` | 説明なし |
| `particle` | 説明なし |
| `spikeCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `speed` | 説明なし |
| `shardCount` | 説明なし |
| `particle` | 説明なし |
| `explosionCount` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `speed` | 説明なし |
| `cloudCount` | 説明なし |
| `particle` | 説明なし |
| `rippleCount` | 説明なし |
| `particle` | 説明なし |
| `particleConfig` | 説明なし |
| `starConfig` | 説明なし |
| `baseStarCount` | 説明なし |
| `starCount` | 説明なし |
| `colors` | 説明なし |
| `particle` | 説明なし |
| `angle` | 説明なし |
| `radius` | 説明なし |
| `speed` | 説明なし |
| `deltaSeconds` | 説明なし |
| `excessCount` | 説明なし |
| `particle` | 説明なし |
| `lifeRatio` | 説明なし |
| `pulse` | 説明なし |
| `trailPoint` | 説明なし |
| `spikes` | 説明なし |
| `outerRadius` | 説明なし |
| `innerRadius` | 説明なし |
| `angle` | 説明なし |
| `radius` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `angle` | 説明なし |
| `radius` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `stats` | 説明なし |
| `config` | 説明なし |
| `distribution` | 説明なし |

---

