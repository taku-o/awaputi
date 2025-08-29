import { BaseComponent } from '../BaseComponent.js';

/**
 * MockDataManager - モックデータライフサイクル・キャッシュ管理コンポーネント
 */
export class MockDataManager extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'MockDataManager');
        this.mockDataGenerator = null;
        this.mockDataCache = new Map();
        this.cacheLimit = 1000;
    }

    async _doInitialize() {
        this.mockDataGenerator = new MockDataGenerator(this.mainController.gameEngine);
    }

    /**
     * テストデータを生成
     * @param {string} type - データタイプ
     * @param {number} count - 生成数
     * @param {Object} options - オプション
     * @returns {*} 生成されたデータ
     */
    generateTestData(type, count = 1, options = {}) {
        const cacheKey = this.getCacheKey(type, count, options);
        
        // キャッシュチェック
        if (this.mockDataCache.has(cacheKey)) {
            return this.cloneData(this.mockDataCache.get(cacheKey));
        }

        // 新規生成
        const data = this.mockDataGenerator.generate(type, count, options);
        
        // キャッシュに保存
        this.addToCache(cacheKey, data);
        
        return this.cloneData(data);
    }

    /**
     * ゲーム状態のモックを生成
     * @param {Object} options - オプション
     * @returns {Object} モックゲーム状態
     */
    generateMockGameState(options = {}) {
        return this.mockDataGenerator.generateGameState(options);
    }

    /**
     * バブルのモックを生成
     * @param {number} count - 生成数
     * @param {Array} types - タイプ配列
     * @returns {Array} モックバブル配列
     */
    generateMockBubbles(count = 10, types = null) {
        return this.mockDataGenerator.generateBubbles(count, types);
    }

    /**
     * 大量バブルセットを生成
     * @param {number} count - 生成数
     * @returns {Array} バブル配列
     */
    generateLargeBubbleSet(count = 1000) {
        return this.mockDataGenerator.generateLargeBubbleSet(count);
    }

    /**
     * キャッシュキーを生成
     * @private
     */
    getCacheKey(type, count, options) {
        return `${type}_${count}_${JSON.stringify(options)}`;
    }

    /**
     * キャッシュに追加
     * @private
     */
    addToCache(key, data) {
        // キャッシュサイズ制限
        if (this.mockDataCache.size >= this.cacheLimit) {
            const firstKey = this.mockDataCache.keys().next().value;
            this.mockDataCache.delete(firstKey);
        }
        
        this.mockDataCache.set(key, data);
    }

    /**
     * データをディープクローン
     * @private
     */
    cloneData(data) {
        return JSON.parse(JSON.stringify(data));
    }

    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.mockDataCache.clear();
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.clearCache();
        this.mockDataGenerator?.destroy();
        this.mockDataGenerator = null;
        super.cleanup();
    }
}

/**
 * Mock Data Generator
 * テスト用モックデータ生成システム
 */
class MockDataGenerator {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.generators = new Map();
        this.setupGenerators();
    }

    setupGenerators() {
        this.generators.set('bubble', this.generateBubble.bind(this));
        this.generators.set('bubbles', this.generateBubbles.bind(this));
        this.generators.set('gameState', this.generateGameState.bind(this));
        this.generators.set('playerData', this.generatePlayerData.bind(this));
        this.generators.set('largeBubbleSet', this.generateLargeBubbleSet.bind(this));
        this.generators.set('scoreHistory', this.generateScoreHistory.bind(this));
    }

    generate(type, count = 1, options = {}) {
        const generator = this.generators.get(type);
        if (!generator) {
            throw new Error(`Unknown mock data type: ${type}`);
        }

        if (count === 1) {
            return generator(options);
        }

        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(generator(options));
        }
        return results;
    }

    generateBubble(options = {}) {
        const types = ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'electric', 'poison', 'spiky'];
        
        return {
            id: Math.random().toString(36).substr(2, 9),
            type: options.type || types[Math.floor(Math.random() * types.length)],
            x: options.x || Math.random() * 800,
            y: options.y || Math.random() * 600,
            radius: options.radius || (20 + Math.random() * 20),
            health: options.health || (1 + Math.floor(Math.random() * 3)),
            velocity: {
                x: (Math.random() - 0.5) * 4,
                y: (Math.random() - 0.5) * 4
            },
            age: 0,
            maxAge: 5000 + Math.random() * 10000
        };
    }

    generateBubbles(count = 10, types = null) {
        const bubbles = [];
        for (let i = 0; i < count; i++) {
            const options = {};
            if (types && types.length > 0) {
                options.type = types[Math.floor(Math.random() * types.length)];
            }
            bubbles.push(this.generateBubble(options));
        }
        return bubbles;
    }

    generateGameState(options = {}) {
        return {
            score: options.score || Math.floor(Math.random() * 10000),
            combo: options.combo || Math.floor(Math.random() * 20),
            level: options.level || (1 + Math.floor(Math.random() * 10)),
            timeRemaining: options.timeRemaining || Math.floor(Math.random() * 300000),
            playerHP: options.playerHP || (80 + Math.floor(Math.random() * 20)),
            bubbleCount: options.bubbleCount || Math.floor(Math.random() * 50),
            activeEffects: options.activeEffects || [],
            gameMode: options.gameMode || 'normal'
        };
    }

    generatePlayerData(options = {}) {
        return {
            name: options.name || `TestPlayer${Math.floor(Math.random() * 1000)}`,
            totalScore: options.totalScore || Math.floor(Math.random() * 100000),
            highScore: options.highScore || Math.floor(Math.random() * 50000),
            totalAP: options.totalAP || Math.floor(Math.random() * 5000),
            currentAP: options.currentAP || Math.floor(Math.random() * 1000),
            gamesPlayed: options.gamesPlayed || Math.floor(Math.random() * 100),
            achievements: options.achievements || [],
            settings: options.settings || {
                volume: 0.5,
                difficulty: 'normal',
                quality: 'high'
            }
        };
    }

    generateLargeBubbleSet(count = 1000) {
        return this.generateBubbles(count);
    }

    generateScoreHistory(options = {}) {
        const count = options.count || 50;
        const history = [];
        
        for (let i = 0; i < count; i++) {
            history.push({
                timestamp: Date.now() - (i * 24 * 60 * 60 * 1000), // 1日ごと
                score: Math.floor(Math.random() * 10000),
                level: 1 + Math.floor(Math.random() * 10),
                duration: Math.floor(Math.random() * 300000)
            });
        }
        
        return history.reverse(); // 古い順にソート
    }

    destroy() {
        this.generators.clear();
    }
}