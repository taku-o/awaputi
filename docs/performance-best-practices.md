# パフォーマンス最適化ベストプラクティス

## 概要

このドキュメントでは、BubblePop (awaputi) ゲームのパフォーマンスを最大限に引き出すためのベストプラクティスを紹介します。

## 作成日

- **2025-01-28**: Task 14完了 - パフォーマンス最適化ベストプラクティスドキュメント作成

## 開発時のベストプラクティス

### 1. コード最適化

#### ループの最適化
```javascript
// ❌ 悪い例: 毎回length計算
for (let i = 0; i < array.length; i++) {
    // 処理
}

// ✅ 良い例: lengthをキャッシュ
const len = array.length;
for (let i = 0; i < len; i++) {
    // 処理
}

// ✅ より良い例: forEachやfor...ofを使用
array.forEach(item => {
    // 処理
});
```

#### オブジェクト作成の最小化
```javascript
// ❌ 悪い例: ループ内でオブジェクト作成
function updatePositions(objects) {
    objects.forEach(obj => {
        obj.position = { x: obj.x + 1, y: obj.y + 1 }; // 毎回新しいオブジェクト
    });
}

// ✅ 良い例: 既存オブジェクトを再利用
function updatePositions(objects) {
    objects.forEach(obj => {
        obj.position.x = obj.x + 1;
        obj.position.y = obj.y + 1;
    });
}
```

### 2. メモリ管理

#### オブジェクトプーリング
```javascript
// オブジェクトプールの実装例
class ParticlePool {
    constructor(size = 100) {
        this.pool = [];
        this.active = [];
        
        // 事前にオブジェクトを作成
        for (let i = 0; i < size; i++) {
            this.pool.push(new Particle());
        }
    }
    
    acquire() {
        if (this.pool.length > 0) {
            const particle = this.pool.pop();
            this.active.push(particle);
            return particle;
        }
        // プールが空の場合は新規作成（警告を出すことを推奨）
        console.warn('Particle pool exhausted, creating new instance');
        return new Particle();
    }
    
    release(particle) {
        const index = this.active.indexOf(particle);
        if (index !== -1) {
            this.active.splice(index, 1);
            particle.reset(); // オブジェクトをリセット
            this.pool.push(particle);
        }
    }
}
```

#### メモリリーク防止
```javascript
// ✅ イベントリスナーの適切な管理
class Component {
    constructor() {
        this.handleClick = this.handleClick.bind(this);
    }
    
    onMount() {
        document.addEventListener('click', this.handleClick);
    }
    
    onUnmount() {
        // 必ずリスナーを削除
        document.removeEventListener('click', this.handleClick);
    }
    
    handleClick(e) {
        // 処理
    }
}

// ✅ タイマーの適切な管理
class AnimationManager {
    constructor() {
        this.timers = new Set();
    }
    
    startAnimation() {
        const timer = setInterval(() => {
            // アニメーション処理
        }, 16);
        
        this.timers.add(timer);
        return timer;
    }
    
    stopAllAnimations() {
        // すべてのタイマーをクリア
        this.timers.forEach(timer => clearInterval(timer));
        this.timers.clear();
    }
}
```

### 3. レンダリング最適化

#### Canvas描画の最適化
```javascript
// ✅ 描画状態の保存・復元を最小化
function drawBubbles(ctx, bubbles) {
    // 共通の設定は一度だけ
    ctx.fillStyle = 'blue';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    
    bubbles.forEach(bubble => {
        // 必要な場合のみ状態を変更
        if (bubble.color !== 'blue') {
            ctx.fillStyle = bubble.color;
        }
        
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 色を戻す必要がある場合
        if (bubble.color !== 'blue') {
            ctx.fillStyle = 'blue';
        }
    });
}

// ✅ レイヤー分離による最適化
class LayeredRenderer {
    constructor() {
        this.staticCanvas = document.createElement('canvas');
        this.dynamicCanvas = document.createElement('canvas');
        this.staticCtx = this.staticCanvas.getContext('2d');
        this.dynamicCtx = this.dynamicCanvas.getContext('2d');
        this.staticDirty = true;
    }
    
    renderStatic() {
        if (!this.staticDirty) return;
        
        // 背景など変化しない要素を描画
        this.staticCtx.clearRect(0, 0, this.staticCanvas.width, this.staticCanvas.height);
        // 静的要素の描画...
        
        this.staticDirty = false;
    }
    
    renderDynamic() {
        // 動的要素のみクリアして再描画
        this.dynamicCtx.clearRect(0, 0, this.dynamicCanvas.width, this.dynamicCanvas.height);
        // 動的要素の描画...
    }
}
```

### 4. 計算の最適化

#### 高頻度計算のキャッシュ
```javascript
// ✅ 計算結果のキャッシュ
class PhysicsEngine {
    constructor() {
        this.distanceCache = new Map();
    }
    
    getDistance(obj1, obj2) {
        // キャッシュキーの生成
        const key = `${obj1.id}-${obj2.id}`;
        const reverseKey = `${obj2.id}-${obj1.id}`;
        
        // キャッシュチェック
        if (this.distanceCache.has(key)) {
            return this.distanceCache.get(key);
        }
        if (this.distanceCache.has(reverseKey)) {
            return this.distanceCache.get(reverseKey);
        }
        
        // 計算実行
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // キャッシュに保存
        this.distanceCache.set(key, distance);
        
        return distance;
    }
    
    clearCache() {
        // フレームごとにキャッシュをクリア
        this.distanceCache.clear();
    }
}
```

#### 数学的最適化
```javascript
// ✅ 平方根計算の回避
function checkCollision(obj1, obj2, threshold) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    
    // ❌ 悪い例: 平方根を計算
    // const distance = Math.sqrt(dx * dx + dy * dy);
    // return distance < threshold;
    
    // ✅ 良い例: 平方距離で比較
    const squaredDistance = dx * dx + dy * dy;
    return squaredDistance < threshold * threshold;
}

// ✅ 三角関数の事前計算
class RotationOptimizer {
    constructor() {
        this.sinTable = new Float32Array(360);
        this.cosTable = new Float32Array(360);
        
        // 事前計算
        for (let i = 0; i < 360; i++) {
            const rad = (i * Math.PI) / 180;
            this.sinTable[i] = Math.sin(rad);
            this.cosTable[i] = Math.cos(rad);
        }
    }
    
    getSin(degrees) {
        const index = Math.round(degrees) % 360;
        return this.sinTable[index < 0 ? index + 360 : index];
    }
    
    getCos(degrees) {
        const index = Math.round(degrees) % 360;
        return this.cosTable[index < 0 ? index + 360 : index];
    }
}
```

## プロダクション最適化

### 1. 初期化の最適化

```javascript
// ✅ 遅延初期化
class LazyResourceLoader {
    constructor() {
        this.resources = new Map();
        this.loadPromises = new Map();
    }
    
    async getResource(id) {
        // 既にロード済み
        if (this.resources.has(id)) {
            return this.resources.get(id);
        }
        
        // ロード中
        if (this.loadPromises.has(id)) {
            return await this.loadPromises.get(id);
        }
        
        // 新規ロード
        const loadPromise = this.loadResource(id);
        this.loadPromises.set(id, loadPromise);
        
        try {
            const resource = await loadPromise;
            this.resources.set(id, resource);
            this.loadPromises.delete(id);
            return resource;
        } catch (error) {
            this.loadPromises.delete(id);
            throw error;
        }
    }
    
    async loadResource(id) {
        // 実際のリソースロード処理
        const response = await fetch(`/resources/${id}`);
        return await response.json();
    }
}

// ✅ 段階的初期化
class ProgressiveInitializer {
    async initialize() {
        // 必須コンポーネントの初期化
        await this.initializeCritical();
        
        // UIを表示可能に
        this.showUI();
        
        // 非同期で残りを初期化
        this.initializeSecondary().catch(console.error);
        this.initializeOptional().catch(console.error);
    }
    
    async initializeCritical() {
        // ゲームプレイに必須の要素のみ
        await Promise.all([
            this.loadGameEngine(),
            this.loadCoreAssets()
        ]);
    }
    
    async initializeSecondary() {
        // 重要だが必須ではない要素
        await Promise.all([
            this.loadAudioSystem(),
            this.loadParticleSystem()
        ]);
    }
    
    async initializeOptional() {
        // オプション要素
        await this.loadAchievements();
        await this.loadLeaderboards();
    }
}
```

### 2. アセット最適化

```javascript
// ✅ 画像の最適化
class ImageOptimizer {
    constructor() {
        this.cache = new Map();
    }
    
    async loadOptimizedImage(url, maxWidth, maxHeight) {
        const cacheKey = `${url}-${maxWidth}x${maxHeight}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const img = new Image();
        img.src = url;
        await new Promise(resolve => img.onload = resolve);
        
        // 必要に応じてリサイズ
        if (img.width > maxWidth || img.height > maxHeight) {
            const canvas = document.createElement('canvas');
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const optimizedImg = new Image();
            optimizedImg.src = canvas.toDataURL('image/webp', 0.8);
            await new Promise(resolve => optimizedImg.onload = resolve);
            
            this.cache.set(cacheKey, optimizedImg);
            return optimizedImg;
        }
        
        this.cache.set(cacheKey, img);
        return img;
    }
}
```

### 3. ネットワーク最適化

```javascript
// ✅ リクエストのバッチング
class BatchRequestManager {
    constructor(batchSize = 10, batchDelay = 100) {
        this.batchSize = batchSize;
        this.batchDelay = batchDelay;
        this.pendingRequests = [];
        this.batchTimer = null;
    }
    
    async request(endpoint, data) {
        return new Promise((resolve, reject) => {
            this.pendingRequests.push({
                endpoint,
                data,
                resolve,
                reject
            });
            
            if (this.pendingRequests.length >= this.batchSize) {
                this.flush();
            } else if (!this.batchTimer) {
                this.batchTimer = setTimeout(() => this.flush(), this.batchDelay);
            }
        });
    }
    
    async flush() {
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }
        
        if (this.pendingRequests.length === 0) return;
        
        const batch = this.pendingRequests.splice(0, this.batchSize);
        
        try {
            const response = await fetch('/api/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requests: batch.map(req => ({
                        endpoint: req.endpoint,
                        data: req.data
                    }))
                })
            });
            
            const results = await response.json();
            
            batch.forEach((req, index) => {
                if (results[index].success) {
                    req.resolve(results[index].data);
                } else {
                    req.reject(new Error(results[index].error));
                }
            });
        } catch (error) {
            batch.forEach(req => req.reject(error));
        }
        
        // 残りのリクエストがある場合は続行
        if (this.pendingRequests.length > 0) {
            this.flush();
        }
    }
}
```

## モバイル最適化のベストプラクティス

### 1. タッチ操作の最適化

```javascript
// ✅ タッチイベントの最適化
class TouchOptimizer {
    constructor(element) {
        this.element = element;
        this.touching = false;
        this.lastTouch = { x: 0, y: 0 };
        
        // パッシブリスナーで性能向上
        this.element.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
        this.element.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.element.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
    }
    
    onTouchStart(e) {
        this.touching = true;
        const touch = e.touches[0];
        this.lastTouch.x = touch.clientX;
        this.lastTouch.y = touch.clientY;
    }
    
    onTouchMove(e) {
        if (!this.touching) return;
        
        // スクロール防止が必要な場合のみ
        e.preventDefault();
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.lastTouch.x;
        const deltaY = touch.clientY - this.lastTouch.y;
        
        // しきい値を設けて小さな動きを無視
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            this.handleMove(deltaX, deltaY);
            this.lastTouch.x = touch.clientX;
            this.lastTouch.y = touch.clientY;
        }
    }
    
    onTouchEnd(e) {
        this.touching = false;
    }
    
    handleMove(deltaX, deltaY) {
        // 実際の処理
    }
}
```

### 2. バッテリー最適化

```javascript
// ✅ バッテリー状態に応じた最適化
class BatteryOptimizer {
    constructor() {
        this.batteryLevel = 1;
        this.isCharging = true;
        
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                this.battery = battery;
                this.updateBatteryStatus();
                
                battery.addEventListener('levelchange', () => this.updateBatteryStatus());
                battery.addEventListener('chargingchange', () => this.updateBatteryStatus());
            });
        }
    }
    
    updateBatteryStatus() {
        this.batteryLevel = this.battery.level;
        this.isCharging = this.battery.charging;
        
        this.applyOptimizations();
    }
    
    applyOptimizations() {
        if (this.batteryLevel < 0.2 && !this.isCharging) {
            // 低バッテリーモード
            this.enablePowerSavingMode();
        } else if (this.batteryLevel < 0.5 && !this.isCharging) {
            // 中程度の最適化
            this.enableModeratePowerSaving();
        } else {
            // 通常モード
            this.disablePowerSaving();
        }
    }
    
    enablePowerSavingMode() {
        // フレームレートを下げる
        if (window.frameStabilizer) {
            window.frameStabilizer.setTargetFPS(30);
        }
        
        // エフェクトを無効化
        if (window.particleOptimizer) {
            window.particleOptimizer.setQualityLevel('low');
        }
        
        // 背景アニメーションを停止
        if (window.backgroundAnimator) {
            window.backgroundAnimator.pause();
        }
    }
    
    enableModeratePowerSaving() {
        if (window.frameStabilizer) {
            window.frameStabilizer.setTargetFPS(45);
        }
        
        if (window.particleOptimizer) {
            window.particleOptimizer.setQualityLevel('medium');
        }
    }
    
    disablePowerSaving() {
        if (window.frameStabilizer) {
            window.frameStabilizer.setTargetFPS(60);
        }
        
        if (window.particleOptimizer) {
            window.particleOptimizer.setQualityLevel('high');
        }
        
        if (window.backgroundAnimator) {
            window.backgroundAnimator.resume();
        }
    }
}
```

## パフォーマンステストのベストプラクティス

### 1. ベンチマーク作成

```javascript
// ✅ 再現可能なベンチマーク
class PerformanceBenchmark {
    constructor(name) {
        this.name = name;
        this.results = [];
    }
    
    async run(iterations = 100) {
        console.log(`Running benchmark: ${this.name}`);
        
        // ウォームアップ
        for (let i = 0; i < 10; i++) {
            await this.runSingle();
        }
        
        // 本番計測
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            await this.runSingle();
            const endTime = performance.now();
            
            this.results.push(endTime - startTime);
            
            // プログレス表示
            if (i % 10 === 0) {
                console.log(`Progress: ${i}/${iterations}`);
            }
        }
        
        return this.analyze();
    }
    
    async runSingle() {
        // サブクラスで実装
        throw new Error('runSingle must be implemented');
    }
    
    analyze() {
        const sorted = [...this.results].sort((a, b) => a - b);
        const sum = sorted.reduce((acc, val) => acc + val, 0);
        
        return {
            name: this.name,
            samples: sorted.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            mean: sum / sorted.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)]
        };
    }
}

// 実装例
class RenderingBenchmark extends PerformanceBenchmark {
    constructor(bubbleCount) {
        super(`Rendering ${bubbleCount} bubbles`);
        this.bubbleCount = bubbleCount;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.bubbles = this.generateBubbles();
    }
    
    generateBubbles() {
        const bubbles = [];
        for (let i = 0; i < this.bubbleCount; i++) {
            bubbles.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                radius: 10 + Math.random() * 40,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
        }
        return bubbles;
    }
    
    async runSingle() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.bubbles.forEach(bubble => {
            this.ctx.fillStyle = bubble.color;
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}
```

### 2. パフォーマンスプロファイリング

```javascript
// ✅ 詳細なプロファイリング
class DetailedProfiler {
    constructor() {
        this.markers = new Map();
        this.measurements = new Map();
    }
    
    mark(name) {
        performance.mark(name);
        this.markers.set(name, performance.now());
    }
    
    measure(name, startMark, endMark) {
        performance.measure(name, startMark, endMark);
        
        const startTime = this.markers.get(startMark);
        const endTime = this.markers.get(endMark);
        
        if (!this.measurements.has(name)) {
            this.measurements.set(name, []);
        }
        
        this.measurements.get(name).push({
            duration: endTime - startTime,
            timestamp: startTime
        });
    }
    
    getReport() {
        const report = {};
        
        this.measurements.forEach((measurements, name) => {
            const durations = measurements.map(m => m.duration);
            const sum = durations.reduce((acc, val) => acc + val, 0);
            
            report[name] = {
                count: durations.length,
                total: sum,
                average: sum / durations.length,
                min: Math.min(...durations),
                max: Math.max(...durations)
            };
        });
        
        return report;
    }
    
    clear() {
        this.markers.clear();
        this.measurements.clear();
        performance.clearMarks();
        performance.clearMeasures();
    }
}

// 使用例
const profiler = new DetailedProfiler();

function gameLoop() {
    profiler.mark('frame-start');
    
    profiler.mark('update-start');
    updateGame();
    profiler.mark('update-end');
    profiler.measure('update', 'update-start', 'update-end');
    
    profiler.mark('render-start');
    renderGame();
    profiler.mark('render-end');
    profiler.measure('render', 'render-start', 'render-end');
    
    profiler.mark('frame-end');
    profiler.measure('frame', 'frame-start', 'frame-end');
    
    requestAnimationFrame(gameLoop);
}

// 定期的にレポートを出力
setInterval(() => {
    console.table(profiler.getReport());
}, 5000);
```

## チェックリスト

### 開発時チェックリスト
- [ ] オブジェクトプーリングを使用している
- [ ] イベントリスナーが適切に削除されている
- [ ] タイマーが適切にクリアされている
- [ ] 不要なオブジェクト作成を避けている
- [ ] Canvas描画が最適化されている
- [ ] 高頻度計算がキャッシュされている
- [ ] メモリリークテストを実施した

### リリース前チェックリスト
- [ ] 全デバイスでのパフォーマンステスト完了
- [ ] メモリ使用量が許容範囲内
- [ ] フレームレートが目標値を達成
- [ ] バッテリー消費が適切
- [ ] ネットワーク使用量が最適化されている
- [ ] エラーハンドリングが実装されている
- [ ] パフォーマンス監視が有効化されている

## まとめ

パフォーマンス最適化は継続的なプロセスです。これらのベストプラクティスを適用し、定期的な測定と改善を行うことで、すべてのユーザーに快適なゲーム体験を提供できます。

## 関連ドキュメント

- [パフォーマンス最適化ガイド](./performance-optimization-guide.md)
- [パフォーマンス監視ガイド](./performance-monitoring-guide.md)
- [トラブルシューティングガイド](./troubleshooting-guide.md)