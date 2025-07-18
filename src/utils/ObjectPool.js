/**
 * オブジェクトプーリングシステム
 * オブジェクトの再利用によりガベージコレクションを削減し、パフォーマンスを向上
 */
export class ObjectPool {
    constructor(createFunction, resetFunction, initialSize = 10) {
        this.createFunction = createFunction;
        this.resetFunction = resetFunction;
        this.pool = [];
        this.activeObjects = new Set();
        this.stats = {
            created: 0,
            reused: 0,
            returned: 0
        };
        
        // 初期プールサイズを作成
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFunction());
            this.stats.created++;
        }
    }
    
    /**
     * プールからオブジェクトを取得
     * @returns {*} プールされたオブジェクト
     */
    get() {
        let obj;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop();
            this.stats.reused++;
        } else {
            obj = this.createFunction();
            this.stats.created++;
        }
        
        this.activeObjects.add(obj);
        return obj;
    }
    
    /**
     * オブジェクトをプールに戻す
     * @param {*} obj - 返却するオブジェクト
     */
    return(obj) {
        if (!this.activeObjects.has(obj)) {
            return; // 既にプールに戻されているか、このプールのオブジェクトではない
        }
        
        this.activeObjects.delete(obj);
        
        // リセット関数でオブジェクトを初期状態に戻す
        if (this.resetFunction) {
            this.resetFunction(obj);
        }
        
        this.pool.push(obj);
        this.stats.returned++;
    }
    
    /**
     * アクティブなオブジェクトをすべてプールに戻す
     */
    returnAll() {
        const activeArray = Array.from(this.activeObjects);
        activeArray.forEach(obj => this.return(obj));
    }
    
    /**
     * プールサイズを動的に調整
     * @param {number} targetSize - 目標サイズ
     */
    resize(targetSize) {
        while (this.pool.length < targetSize) {
            this.pool.push(this.createFunction());
            this.stats.created++;
        }
        
        while (this.pool.length > targetSize) {
            this.pool.pop();
        }
    }
    
    /**
     * プールの統計情報を取得
     * @returns {object} 統計情報
     */
    getStats() {
        return {
            ...this.stats,
            poolSize: this.pool.length,
            activeCount: this.activeObjects.size,
            efficiency: this.stats.reused / (this.stats.reused + this.stats.created) * 100
        };
    }
    
    /**
     * プールをクリア
     */
    clear() {
        this.pool = [];
        this.activeObjects.clear();
        this.stats = {
            created: 0,
            reused: 0,
            returned: 0
        };
    }
}

/**
 * パーティクル用オブジェクトプール
 */
export class ParticlePool extends ObjectPool {
    constructor(initialSize = 500) {
        super(
            () => ({
                x: 0, y: 0, vx: 0, vy: 0,
                life: 1.0, maxLife: 1.0,
                size: 1, color: '#FFFFFF',
                type: 'default', isActive: false
            }),
            (particle) => {
                particle.x = 0;
                particle.y = 0;
                particle.vx = 0;
                particle.vy = 0;
                particle.life = 1.0;
                particle.maxLife = 1.0;
                particle.size = 1;
                particle.color = '#FFFFFF';
                particle.type = 'default';
                particle.isActive = false;
            },
            initialSize
        );
    }
}

/**
 * 泡用オブジェクトプール
 */
export class BubblePool extends ObjectPool {
    constructor(initialSize = 50) {
        super(
            () => ({
                type: 'normal',
                position: { x: 0, y: 0 },
                velocity: { x: 0, y: 0 },
                size: 50,
                health: 1,
                maxHealth: 1,
                age: 0,
                maxAge: 10000,
                isAlive: true,
                effects: [],
                clickCount: 0,
                isEscaping: false,
                escapeSpeed: 0,
                lastMouseDistance: Infinity
            }),
            (bubble) => {
                bubble.type = 'normal';
                bubble.position.x = 0;
                bubble.position.y = 0;
                bubble.velocity.x = 0;
                bubble.velocity.y = 0;
                bubble.size = 50;
                bubble.health = 1;
                bubble.maxHealth = 1;
                bubble.age = 0;
                bubble.maxAge = 10000;
                bubble.isAlive = true;
                bubble.effects = [];
                bubble.clickCount = 0;
                bubble.isEscaping = false;
                bubble.escapeSpeed = 0;
                bubble.lastMouseDistance = Infinity;
            },
            initialSize
        );
    }
}

/**
 * フローティングテキスト用オブジェクトプール
 */
export class FloatingTextPool extends ObjectPool {
    constructor(initialSize = 100) {
        super(
            () => ({
                x: 0, y: 0, vx: 0, vy: 0,
                text: '', color: '#FFFFFF',
                fontSize: 16, fontWeight: 'normal',
                life: 1.0, maxLife: 1000,
                scale: 1.0, opacity: 1.0,
                isActive: false
            }),
            (text) => {
                text.x = 0;
                text.y = 0;
                text.vx = 0;
                text.vy = 0;
                text.text = '';
                text.color = '#FFFFFF';
                text.fontSize = 16;
                text.fontWeight = 'normal';
                text.life = 1.0;
                text.maxLife = 1000;
                text.scale = 1.0;
                text.opacity = 1.0;
                text.isActive = false;
            },
            initialSize
        );
    }
}

/**
 * グローバルオブジェクトプールマネージャー
 */
export class PoolManager {
    constructor() {
        this.pools = new Map();
        this.initializePools();
    }
    
    /**
     * 標準プールを初期化
     */
    initializePools() {
        this.pools.set('particles', new ParticlePool(500));
        this.pools.set('bubbles', new BubblePool(50));
        this.pools.set('floatingText', new FloatingTextPool(100));
    }
    
    /**
     * 指定されたプールを取得
     * @param {string} poolName - プール名
     * @returns {ObjectPool} プール
     */
    getPool(poolName) {
        return this.pools.get(poolName);
    }
    
    /**
     * 新しいプールを追加
     * @param {string} poolName - プール名
     * @param {ObjectPool} pool - プール
     */
    addPool(poolName, pool) {
        this.pools.set(poolName, pool);
    }
    
    /**
     * オブジェクトを取得
     * @param {string} poolName - プール名
     * @returns {*} プールされたオブジェクト
     */
    get(poolName) {
        const pool = this.pools.get(poolName);
        return pool ? pool.get() : null;
    }
    
    /**
     * オブジェクトを返却
     * @param {string} poolName - プール名
     * @param {*} obj - 返却するオブジェクト
     */
    return(poolName, obj) {
        const pool = this.pools.get(poolName);
        if (pool) {
            pool.return(obj);
        }
    }
    
    /**
     * すべてのプールの統計情報を取得
     * @returns {object} 統計情報
     */
    getAllStats() {
        const stats = {};
        this.pools.forEach((pool, name) => {
            stats[name] = pool.getStats();
        });
        return stats;
    }
    
    /**
     * すべてのプールをクリア
     */
    clearAll() {
        this.pools.forEach(pool => pool.clear());
    }
    
    /**
     * メモリ使用量を最適化
     */
    optimize() {
        this.pools.forEach((pool, name) => {
            const stats = pool.getStats();
            
            // 効率が低い（再利用率50%未満）場合はプールサイズを縮小
            if (stats.efficiency < 50 && stats.poolSize > 10) {
                pool.resize(Math.max(10, Math.floor(stats.poolSize * 0.8)));
                console.log(`Optimized pool ${name}: reduced size to ${pool.pool.length}`);
            }
            
            // 効率が高い（再利用率90%以上）かつプールが空になることが多い場合は拡張
            if (stats.efficiency > 90 && stats.poolSize < 100) {
                pool.resize(Math.min(100, Math.floor(stats.poolSize * 1.2)));
                console.log(`Optimized pool ${name}: increased size to ${pool.pool.length}`);
            }
        });
    }
}

// グローバルインスタンス
export const poolManager = new PoolManager();