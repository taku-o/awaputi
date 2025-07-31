# ObjectPool

## 概要

ファイル: `utils/ObjectPool.js`  
最終更新: 2025/7/19 9:02:52

## 目次

## クラス
- [ObjectPool](#objectpool)
- [ParticlePool](#particlepool)
- [BubblePool](#bubblepool)
- [FloatingTextPool](#floatingtextpool)
- [PoolManager](#poolmanager)
## 関数
- [getPoolManager()](#getpoolmanager)
## 定数
- [activeArray](#activearray)
- [pool](#pool)
- [pool](#pool)
- [stats](#stats)
- [stats](#stats)
- [poolManager](#poolmanager)

---

## ObjectPool

### コンストラクタ

```javascript
new ObjectPool(createFunction, resetFunction, initialSize = 10)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `createFunction` | 説明なし |
| `resetFunction` | 説明なし |
| `pool` | 説明なし |
| `activeObjects` | 説明なし |
| `stats` | 説明なし |
| `pool` | 説明なし |
| `stats` | 説明なし |

### メソッド

#### for

初期プールサイズを作成

**シグネチャ**:
```javascript
 for (let i = 0; i < initialSize; i++)
```

**パラメーター**:
- `let i = 0; i < initialSize; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < initialSize; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### get

**シグネチャ**:
```javascript
 get()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.get();

// 設定値の取得
const value = instance.get('key', 'defaultValue');
console.log('Retrieved value:', value);
```

#### if

**シグネチャ**:
```javascript
 if (this.pool.length > 0)
```

**パラメーター**:
- `this.pool.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.pool.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### return

**シグネチャ**:
```javascript
 return(obj)
```

**パラメーター**:
- `obj`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.return(obj);

// returnの実用的な使用例
const result = instance.return(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

リセット関数でオブジェクトを初期状態に戻す

**シグネチャ**:
```javascript
 if (this.resetFunction)
```

**パラメーター**:
- `this.resetFunction`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.resetFunction);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### returnAll

**シグネチャ**:
```javascript
 returnAll()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.returnAll();

// returnAllの実用的な使用例
const result = instance.returnAll(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resize

**シグネチャ**:
```javascript
 resize(targetSize)
```

**パラメーター**:
- `targetSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resize(targetSize);

// resizeの実用的な使用例
const result = instance.resize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

**シグネチャ**:
```javascript
 while (this.pool.length < targetSize)
```

**パラメーター**:
- `this.pool.length < targetSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(this.pool.length < targetSize);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

**シグネチャ**:
```javascript
 while (this.pool.length > targetSize)
```

**パラメーター**:
- `this.pool.length > targetSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(this.pool.length > targetSize);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
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


---

## ParticlePool

**継承元**: `ObjectPool`

### コンストラクタ

```javascript
new ParticlePool(initialSize = 500)
```


---

## BubblePool

**継承元**: `ObjectPool`

### コンストラクタ

```javascript
new BubblePool(initialSize = 50)
```


---

## FloatingTextPool

**継承元**: `ObjectPool`

### コンストラクタ

```javascript
new FloatingTextPool(initialSize = 100)
```


---

## PoolManager

### コンストラクタ

```javascript
new PoolManager()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `pools` | 説明なし |

### メソッド

#### initializePools

**シグネチャ**:
```javascript
 initializePools()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializePools();

// initializePoolsの実用的な使用例
const result = instance.initializePools(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getPool

**シグネチャ**:
```javascript
 getPool(poolName)
```

**パラメーター**:
- `poolName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getPool(poolName);

// getPoolの実用的な使用例
const result = instance.getPool(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addPool

**シグネチャ**:
```javascript
 addPool(poolName, pool)
```

**パラメーター**:
- `poolName`
- `pool`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addPool(poolName, pool);

// addPoolの実用的な使用例
const result = instance.addPool(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### get

**シグネチャ**:
```javascript
 get(poolName)
```

**パラメーター**:
- `poolName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.get(poolName);

// 設定値の取得
const value = instance.get('key', 'defaultValue');
console.log('Retrieved value:', value);
```

#### return

**シグネチャ**:
```javascript
 return(poolName, obj)
```

**パラメーター**:
- `poolName`
- `obj`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.return(poolName, obj);

// returnの実用的な使用例
const result = instance.return(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (pool)
```

**パラメーター**:
- `pool`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(pool);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAllStats

**シグネチャ**:
```javascript
 getAllStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAllStats();

// getAllStatsの実用的な使用例
const result = instance.getAllStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearAll

**シグネチャ**:
```javascript
 clearAll()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearAll();

// clearAllの実用的な使用例
const result = instance.clearAll(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### optimize

**シグネチャ**:
```javascript
 optimize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.optimize();

// optimizeの実用的な使用例
const result = instance.optimize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

効率が低い（再利用率50%未満）場合はプールサイズを縮小

**シグネチャ**:
```javascript
 if (stats.efficiency < 50 && stats.poolSize > 10)
```

**パラメーター**:
- `stats.efficiency < 50 && stats.poolSize > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stats.efficiency < 50 && stats.poolSize > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

効率が高い（再利用率90%以上）かつプールが空になることが多い場合は拡張

**シグネチャ**:
```javascript
 if (stats.efficiency > 90 && stats.poolSize < 100)
```

**パラメーター**:
- `stats.efficiency > 90 && stats.poolSize < 100`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stats.efficiency > 90 && stats.poolSize < 100);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getPoolManager

**シグネチャ**:
```javascript
getPoolManager()
```

**使用例**:
```javascript
const result = getPoolManager();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `activeArray` | 説明なし |
| `pool` | 説明なし |
| `pool` | 説明なし |
| `stats` | 説明なし |
| `stats` | 説明なし |
| `poolManager` | 後方互換性のため |

---

