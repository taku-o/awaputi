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

interface GameEngine {
    // Game engine interface
}

interface ErrorHandler {
    handleComponentError: (error: Error, component: string, operation: string) => any;
}

interface MockComponent {
    initialized?: boolean;
    generate?: () => any;
    generateBubble?: (options?: any) => MockBubble;
    generateBubbles?: (count: number, options?: any) => MockBubble[];
    generatePlayerData?: (options?: any) => MockPlayerData;
    generateGameState?: (options?: any) => MockGameState;
    validateData?: (data: any, type: string) => ValidationResult;
    setErrorHandler?: (handler: ErrorHandler['handleComponentError']) => void;
    initialize?: () => Promise<void> | void;
    cleanup?: () => void;
    generateBubbleProperties?: (template: any) => any;
    getBubbleColor?: (type?: string | null) => string;
    addBubbleVariations?: (bubble: MockBubble) => MockBubble;
    generateActiveEffects?: () => any[];
    generatePlayerName?: () => string;
    generateDetailedStatistics?: () => any;
    generateBubbleTypeStats?: () => any;
    generatePlayerAchievements?: () => any[];
    generatePlayerSettings?: () => any;
    generatePlayerInventory?: () => any;
    generateAchievements?: () => any[];
    generatePerformanceMetrics?: (options?: any) => any;
    generateMassGameStates?: (count: number, options?: any) => MockGameState[];
    generateStressTestData?: (options?: any) => any;
    generateErrorScenario?: () => any;
    generatePerformanceScenario?: () => any;
    generateEdgeCaseScenario?: () => any;
    generateErrorTrigger?: () => any;
    generateCorruptedData?: () => any;
    generateEdgeCaseData?: () => any;
    generateScoreDistribution?: () => any;
    generateBubbleDistribution?: () => any;
    generateLargeBubbleSet?: (count: number) => MockBubble[];
    generateValidationRules?: () => any;
}

interface ComponentDefinition {
    name: string;
    class: new (generator: MockDataGenerator) => MockComponent;
}

interface MockBubble {
    id: string;
    type: string;
    size: number;
    position: { x: number; y: number };
    color: string;
    health: number;
    score: number;
}

interface MockPlayerData {
    id: string;
    name: string;
    level: number;
    totalScore: number;
    highScore: number;
    gamesPlayed: number;
    accuracy: number;
}

interface MockGameState {
    id: string;
    state: string;
    timestamp: number;
    level: number;
    score: number;
    lives: number;
}

interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

interface AudioSettings {
    masterVolume: number;
    musicVolume: number;
    effectsVolume: number;
    enabled: boolean;
}

interface GraphicsSettings {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    particles: 'off' | 'low' | 'medium' | 'high';
    effects: boolean;
    fullscreen: boolean;
}

interface GameplaySettings {
    difficulty: 'easy' | 'normal' | 'hard' | 'expert';
    autoSave: boolean;
    showHints: boolean;
    pauseOnFocusLoss: boolean;
}

interface Configuration {
    audio: AudioSettings;
    graphics: GraphicsSettings;
    gameplay: GameplaySettings;
}

interface Statistics {
    totalGames: number;
    totalScore: number;
    averageScore: number;
    highScore: number;
    accuracy: number;
    playTime: number;
    bubbleTypes: any;
    scoreDistribution: any;
    bubbleDistribution: any;
}

interface Position {
    x: number;
    y: number;
}

type DataType = 'bubble' | 'bubbles' | 'player' | 'gameState' | 'statistics' | 'achievements' | 'performance';
type Scenario = 'center' | 'corner' | 'edge' | 'random';

export class MockDataGenerator {
    private gameEngine: GameEngine;
    private components: Map<string, MockComponent>;
    private initialized: boolean;
    private errorHandler: ErrorHandler;

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        this.components = new Map();
        this.initialized = false;
        this.errorHandler = ComponentErrorHandler;
        
        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            await this.initializeComponents();
            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleComponentError(error as Error, 'MockDataGenerator', 'initialization');
            throw error;
        }
    }

    private async initializeComponents(): Promise<void> {
        // コンポーネントの作成と初期化
        const components: ComponentDefinition[] = [
            { name: 'bubbleGenerator', class: MockBubbleDataGenerator as any },
            { name: 'userGenerator', class: MockUserDataGenerator as any },
            { name: 'gameStateGenerator', class: MockGameStateGenerator as any },
            { name: 'validator', class: MockDataValidator as any }
        ];

        for (const { name, class: ComponentClass } of components) {
            try {
                const component = new ComponentClass(this);
                if (component.setErrorHandler) {
                    component.setErrorHandler(this.errorHandler.handleComponentError);
                }
                if (component.initialize) {
                    await component.initialize();
                }
                this.components.set(name, component);
            } catch (error) {
                console.error(`Failed to initialize ${name}:`, error);
                // エラーハンドリング - フォールバック機能で継続
                this.components.set(name, this.createFallbackComponent(name));
            }
        }
    }

    private createFallbackComponent(name: string): MockComponent {
        return {
            initialized: false,
            generate: () => ({}),
            generateBubble: () => this.createFallbackBubble(),
            generateBubbles: () => [],
            generatePlayerData: () => this.createFallbackPlayerData(),
            generateGameState: () => this.createFallbackGameState(),
            validateData: () => ({ valid: true, errors: [], warnings: [] })
        };
    }

    public getComponent(name: string): MockComponent | undefined {
        return this.components.get(name);
    }

    // === 公開API（後方互換性維持） ===

    /**
     * データを生成
     */
    public generate(type: DataType, options: any = {}): any {
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
                    return this.generateAchievements();
                case 'performance':
                    return this.generatePerformanceMetrics(options);
                default:
                    throw new Error(`Unknown data type: ${type}`);
            }
        } catch (error) {
            return this.errorHandler.handleComponentError(error as Error, 'MockDataGenerator', `generate(${type})`);
        }
    }

    /**
     * シナリオ付きでデータを生成
     */
    public generateWithScenario(scenario: string, options: any = {}): any {
        const scenarioOptions = { ...options, scenario };
        return this.generate((options.type || 'gameState') as DataType, scenarioOptions);
    }

    // === 泡関連データ生成 ===

    public generateBubble(options: any = {}): MockBubble {
        const generator = this.getComponent('bubbleGenerator');
        return generator?.generateBubble ? generator.generateBubble(options) : this.createFallbackBubble();
    }

    public generateBubbles(count: number = 10, options: any = {}): MockBubble[] {
        const generator = this.getComponent('bubbleGenerator');
        return generator?.generateBubbles ? generator.generateBubbles(count, options) : [];
    }

    public generateBubbleProperties(template: any): any {
        const generator = this.getComponent('bubbleGenerator');
        return generator?.generateBubbleProperties ? generator.generateBubbleProperties(template) : {};
    }

    public getBubbleColor(type: string | null = null): string {
        const generator = this.getComponent('bubbleGenerator');
        return generator?.getBubbleColor ? generator.getBubbleColor(type) : '#4ECDC4';
    }

    public addBubbleVariations(bubble: MockBubble): MockBubble {
        const generator = this.getComponent('bubbleGenerator');
        return generator?.addBubbleVariations ? generator.addBubbleVariations(bubble) : bubble;
    }

    public generateActiveEffects(): any[] {
        const generator = this.getComponent('bubbleGenerator');
        return generator?.generateActiveEffects ? generator.generateActiveEffects() : [];
    }

    // === ユーザー・プレイヤーデータ生成 ===

    public generatePlayerData(options: any = {}): MockPlayerData {
        const generator = this.getComponent('userGenerator');
        return generator?.generatePlayerData ? generator.generatePlayerData(options) : this.createFallbackPlayerData();
    }

    public generatePlayerName(): string {
        const generator = this.getComponent('userGenerator');
        return generator?.generatePlayerName ? generator.generatePlayerName() : 'Player';
    }

    public generateDetailedStatistics(): any {
        const generator = this.getComponent('userGenerator');
        return generator?.generateDetailedStatistics ? generator.generateDetailedStatistics() : {};
    }

    public generateBubbleTypeStats(): any {
        const generator = this.getComponent('userGenerator');
        return generator?.generateBubbleTypeStats ? generator.generateBubbleTypeStats() : {};
    }

    public generatePlayerAchievements(): any[] {
        const generator = this.getComponent('userGenerator');
        return generator?.generatePlayerAchievements ? generator.generatePlayerAchievements() : [];
    }

    public generatePlayerSettings(): any {
        const generator = this.getComponent('userGenerator');
        return generator?.generatePlayerSettings ? generator.generatePlayerSettings() : {};
    }

    public generatePlayerInventory(): any {
        const generator = this.getComponent('userGenerator');
        return generator?.generatePlayerInventory ? generator.generatePlayerInventory() : {};
    }

    public generateAchievements(): any[] {
        const generator = this.getComponent('userGenerator');
        return generator?.generateAchievements ? generator.generateAchievements() : [];
    }

    // === ゲーム状態・パフォーマンス関連 ===

    public generateGameState(options: any = {}): MockGameState {
        const generator = this.getComponent('gameStateGenerator');
        return generator?.generateGameState ? generator.generateGameState(options) : this.createFallbackGameState();
    }

    public generatePerformanceMetrics(options: any = {}): any {
        const generator = this.getComponent('gameStateGenerator');
        return generator?.generatePerformanceMetrics ? generator.generatePerformanceMetrics(options) : {};
    }

    public generateMassGameStates(count: number = 100, options: any = {}): MockGameState[] {
        const generator = this.getComponent('gameStateGenerator');
        return generator?.generateMassGameStates ? generator.generateMassGameStates(count, options) : [];
    }

    public generateStressTestData(options: any = {}): any {
        const generator = this.getComponent('gameStateGenerator');
        return generator?.generateStressTestData ? generator.generateStressTestData(options) : {};
    }

    public generateErrorScenario(): any {
        const generator = this.getComponent('gameStateGenerator');
        return generator?.generateErrorScenario ? generator.generateErrorScenario() : {};
    }

    public generatePerformanceScenario(): any {
        const generator = this.getComponent('gameStateGenerator');
        return generator?.generatePerformanceScenario ? generator.generatePerformanceScenario() : {};
    }

    public generateEdgeCaseScenario(): any {
        const generator = this.getComponent('gameStateGenerator');
        return generator?.generateEdgeCaseScenario ? generator.generateEdgeCaseScenario() : {};
    }

    public generateErrorTrigger(): any {
        const generator = this.getComponent('gameStateGenerator');
        return generator?.generateErrorTrigger ? generator.generateErrorTrigger() : {};
    }

    public generateCorruptedData(): any {
        const generator = this.getComponent('gameStateGenerator');
        return generator?.generateCorruptedData ? generator.generateCorruptedData() : {};
    }

    public generateEdgeCaseData(): any {
        const generator = this.getComponent('gameStateGenerator');
        return generator?.generateEdgeCaseData ? generator.generateEdgeCaseData() : {};
    }

    // === 統計・設定関連 ===

    public generateStatistics(options: any = {}): Statistics {
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

    public generateConfiguration(): Configuration {
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

    public generateScoreDistribution(): any {
        const generator = this.getComponent('userGenerator');
        return generator?.generateScoreDistribution ? generator.generateScoreDistribution() : {};
    }

    public generateBubbleDistribution(): any {
        const generator = this.getComponent('bubbleGenerator');
        return generator?.generateBubbleDistribution ? generator.generateBubbleDistribution() : {};
    }

    // === 大容量データ生成 ===

    public generateLargeBubbleSet(count: number = 1000): MockBubble[] {
        const generator = this.getComponent('bubbleGenerator');
        return generator?.generateLargeBubbleSet ? generator.generateLargeBubbleSet(count) : [];
    }

    // === データ検証 ===

    public validateData(data: any, type: string): ValidationResult {
        const validator = this.getComponent('validator');
        return validator?.validateData ? validator.validateData(data, type) : { valid: true, errors: [], warnings: [] };
    }

    public generateValidationRules(): any {
        const validator = this.getComponent('validator');
        return validator?.generateValidationRules ? validator.generateValidationRules() : {};
    }

    // === ユーティリティメソッド ===

    public generateId(): string {
        return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    public randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public randomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    public randomChoice<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    public shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    public calculateStandardDeviation(values: number[]): number {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    // === フォールバック実装 ===

    private createFallbackBubble(): MockBubble {
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

    private createFallbackPlayerData(): MockPlayerData {
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

    private createFallbackGameState(): MockGameState {
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

    public getScenarioPosition(scenario: Scenario): Position {
        const positions: Record<Scenario, Position> = {
            'center': { x: 400, y: 300 },
            'corner': { x: 50, y: 50 },
            'edge': { x: 400, y: 50 },
            'random': { x: this.randomFloat(0, 800), y: this.randomFloat(0, 600) }
        };
        return positions[scenario] || positions['random'];
    }

    // === クリーンアップ ===

    public destroy(): void {
        for (const component of this.components.values()) {
            if (component.cleanup) {
                component.cleanup();
            }
        }
        this.components.clear();
        this.initialized = false;
    }
}