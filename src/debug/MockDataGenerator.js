/**
 * Mock Data Generator
 * テスト用の現実的なモックデータ生成システム
 * Main Controller Pattern適用版
 */

import { ComponentErrorHandler } from './ComponentErrorHandler.js';
import { MockBubbleDataGenerator } from './mock/MockBubbleDataGenerator.js';
import { MockUserDataGenerator } from './mock/MockUserDataGenerator.js';
import { MockGameStateGenerator } from './mock/MockGameStateGenerator.js';
import { MockDataValidator } from './mock/MockDataValidator.js';

export class MockDataGenerator {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.components = new Map();
        this.initialized = false;
        this.errorHandler = ComponentErrorHandler;
        
        this.initialize();
    }

    async initialize() {
        try {
            await this.initializeComponents();
            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleComponentError(error, 'MockDataGenerator', 'initialization');
            throw error;
        }
    }

    async initializeComponents() {
        // コンポーネントの作成と初期化
        const components = [
            { name: 'bubbleGenerator', class: MockBubbleDataGenerator },
            { name: 'userGenerator', class: MockUserDataGenerator },
            { name: 'gameStateGenerator', class: MockGameStateGenerator },
            { name: 'validator', class: MockDataValidator }
        ];

        for (const { name, class: ComponentClass } of components) {
            try {
                const component = new ComponentClass(this);
                component.setErrorHandler(this.errorHandler.handleComponentError);
                await component.initialize();
                this.components.set(name, component);
            } catch (error) {
                console.error(`Failed to initialize ${name}:`, error);
                // エラーハンドリング - フォールバック機能で継続
                this.components.set(name, this.createFallbackComponent(name));
            }
        }
    }

    createFallbackComponent(name) {
        return {
            initialized: false,
            generate: () => ({}),
            generateBubble: () => ({}),
            generateBubbles: () => [],
            generatePlayerData: () => ({}),
            generateGameState: () => ({}),
            validateData: () => ({ valid: true, errors: [], warnings: [] })
        };
    }

    getComponent(name) {
        return this.components.get(name);
    }

    // === 公開API（後方互換性維持） ===

    /**
     * データを生成
     * @param {string} type - データタイプ
     * @param {Object} options - 生成オプション
     * @returns {*} 生成されたデータ
     */
    generate(type, options = {}) {
        try {
            switch (type) {
                case 'bubble':
                    return this.generateBubble(options);
                case 'bubbles':
                    return this.generateBubbles(options.count || 10, options);
                case 'player':
                    return this.generatePlayerData(options);
                case 'gameState':
                    return this.generateGameState(options);
                case 'statistics':
                    return this.generateStatistics(options);
                case 'achievements':
                    return this.generateAchievements(options);
                case 'performance':
                    return this.generatePerformanceMetrics(options);
                default:
                    throw new Error(`Unknown data type: ${type}`);
            }
        } catch (error) {
            return this.errorHandler.handleComponentError(error, 'MockDataGenerator', `generate(${type})`);
        }
    }

    /**
     * シナリオ付きでデータを生成
     * @param {string} scenario - シナリオ名
     * @param {Object} options - 生成オプション
     * @returns {*} 生成されたデータ
     */
    generateWithScenario(scenario, options = {}) {
        const scenarioOptions = { ...options, scenario };
        return this.generate(options.type || 'gameState', scenarioOptions);
    }

    // === 泡関連データ生成 ===

    generateBubble(options = {}) {
        const generator = this.getComponent('bubbleGenerator');
        return generator ? generator.generateBubble(options) : this.createFallbackBubble();
    }

    generateBubbles(count = 10, options = {}) {
        const generator = this.getComponent('bubbleGenerator');
        return generator ? generator.generateBubbles(count, options) : [];
    }

    generateBubbleProperties(template) {
        const generator = this.getComponent('bubbleGenerator');
        return generator ? generator.generateBubbleProperties(template) : {};
    }

    getBubbleColor(type = null) {
        const generator = this.getComponent('bubbleGenerator');
        return generator ? generator.getBubbleColor(type) : '#4ECDC4';
    }

    addBubbleVariations(bubble) {
        const generator = this.getComponent('bubbleGenerator');
        return generator ? generator.addBubbleVariations(bubble) : bubble;
    }

    generateActiveEffects() {
        const generator = this.getComponent('bubbleGenerator');
        return generator ? generator.generateActiveEffects() : [];
    }

    // === ユーザー・プレイヤーデータ生成 ===

    generatePlayerData(options = {}) {
        const generator = this.getComponent('userGenerator');
        return generator ? generator.generatePlayerData(options) : this.createFallbackPlayerData();
    }

    generatePlayerName() {
        const generator = this.getComponent('userGenerator');
        return generator ? generator.generatePlayerName() : 'Player';
    }

    generateDetailedStatistics() {
        const generator = this.getComponent('userGenerator');
        return generator ? generator.generateDetailedStatistics() : {};
    }

    generateBubbleTypeStats() {
        const generator = this.getComponent('userGenerator');
        return generator ? generator.generateBubbleTypeStats() : {};
    }

    generatePlayerAchievements() {
        const generator = this.getComponent('userGenerator');
        return generator ? generator.generatePlayerAchievements() : [];
    }

    generatePlayerSettings() {
        const generator = this.getComponent('userGenerator');
        return generator ? generator.generatePlayerSettings() : {};
    }

    generatePlayerInventory() {
        const generator = this.getComponent('userGenerator');
        return generator ? generator.generatePlayerInventory() : {};
    }

    generateAchievements() {
        const generator = this.getComponent('userGenerator');
        return generator ? generator.generateAchievements() : [];
    }

    // === ゲーム状態・パフォーマンス関連 ===

    generateGameState(options = {}) {
        const generator = this.getComponent('gameStateGenerator');
        return generator ? generator.generateGameState(options) : this.createFallbackGameState();
    }

    generatePerformanceMetrics(options = {}) {
        const generator = this.getComponent('gameStateGenerator');
        return generator ? generator.generatePerformanceMetrics(options) : {};
    }

    generateMassGameStates(count = 100, options = {}) {
        const generator = this.getComponent('gameStateGenerator');
        return generator ? generator.generateMassGameStates(count, options) : [];
    }

    generateStressTestData(options = {}) {
        const generator = this.getComponent('gameStateGenerator');
        return generator ? generator.generateStressTestData(options) : {};
    }

    generateErrorScenario() {
        const generator = this.getComponent('gameStateGenerator');
        return generator ? generator.generateErrorScenario() : {};
    }

    generatePerformanceScenario() {
        const generator = this.getComponent('gameStateGenerator');
        return generator ? generator.generatePerformanceScenario() : {};
    }

    generateEdgeCaseScenario() {
        const generator = this.getComponent('gameStateGenerator');
        return generator ? generator.generateEdgeCaseScenario() : {};
    }

    generateErrorTrigger() {
        const generator = this.getComponent('gameStateGenerator');
        return generator ? generator.generateErrorTrigger() : {};
    }

    generateCorruptedData() {
        const generator = this.getComponent('gameStateGenerator');
        return generator ? generator.generateCorruptedData() : {};
    }

    generateEdgeCaseData() {
        const generator = this.getComponent('gameStateGenerator');
        return generator ? generator.generateEdgeCaseData() : {};
    }

    // === 統計・設定関連 ===

    generateStatistics(options = {}) {
        return {
            totalGames: this.randomInt(10, 1000),
            totalScore: this.randomInt(10000, 500000),
            averageScore: this.randomInt(1000, 5000),
            highScore: this.randomInt(5000, 50000),
            accuracy: this.randomFloat(0.4, 0.9),
            playTime: this.randomInt(3600, 360000),
            bubbleTypes: this.generateBubbleTypeStats(),
            scoreDistribution: this.generateScoreDistribution(),
            bubbleDistribution: this.generateBubbleDistribution()
        };
    }

    generateConfiguration() {
        return {
            audio: {
                masterVolume: this.randomFloat(0.5, 1.0),
                musicVolume: this.randomFloat(0.3, 0.8),
                effectsVolume: this.randomFloat(0.4, 1.0),
                enabled: this.randomChoice([true, false])
            },
            graphics: {
                quality: this.randomChoice(['low', 'medium', 'high', 'ultra']),
                particles: this.randomChoice(['off', 'low', 'medium', 'high']),
                effects: this.randomChoice([true, false]),
                fullscreen: this.randomChoice([true, false])
            },
            gameplay: {
                difficulty: this.randomChoice(['easy', 'normal', 'hard', 'expert']),
                autoSave: true,
                showHints: this.randomChoice([true, false]),
                pauseOnFocusLoss: this.randomChoice([true, false])
            }
        };
    }

    generateScoreDistribution() {
        const generator = this.getComponent('userGenerator');
        return generator ? generator.generateScoreDistribution() : {};
    }

    generateBubbleDistribution() {
        const generator = this.getComponent('bubbleGenerator');
        return generator ? generator.generateBubbleDistribution() : {};
    }

    // === 大容量データ生成 ===

    generateLargeBubbleSet(count = 1000) {
        const generator = this.getComponent('bubbleGenerator');
        return generator ? generator.generateLargeBubbleSet(count) : [];
    }

    // === データ検証 ===

    validateData(data, type) {
        const validator = this.getComponent('validator');
        return validator ? validator.validateData(data, type) : { valid: true, errors: [], warnings: [] };
    }

    generateValidationRules() {
        const validator = this.getComponent('validator');
        return validator ? validator.generateValidationRules() : {};
    }

    // === ユーティリティメソッド ===

    generateId() {
        return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    calculateStandardDeviation(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    // === フォールバック実装 ===

    createFallbackBubble() {
        return {
            id: this.generateId(),
            type: 'normal',
            size: 30,
            position: { x: 0, y: 0 },
            color: '#4ECDC4',
            health: 1,
            score: 10
        };
    }

    createFallbackPlayerData() {
        return {
            id: this.generateId(),
            name: 'Player',
            level: 1,
            totalScore: 0,
            highScore: 0,
            gamesPlayed: 0,
            accuracy: 0.5
        };
    }

    createFallbackGameState() {
        return {
            id: this.generateId(),
            state: 'menu',
            timestamp: Date.now(),
            level: 1,
            score: 0,
            lives: 3
        };
    }

    // === 位置・シナリオ関連（レガシーサポート） ===

    getScenarioPosition(scenario) {
        const positions = {
            'center': { x: 400, y: 300 },
            'corner': { x: 50, y: 50 },
            'edge': { x: 400, y: 50 },
            'random': { x: this.randomFloat(0, 800), y: this.randomFloat(0, 600) }
        };
        return positions[scenario] || positions['random'];
    }

    // === クリーンアップ ===

    destroy() {
        for (const component of this.components.values()) {
            if (component.cleanup) {
                component.cleanup();
            }
        }
        this.components.clear();
        this.initialized = false;
    }
}