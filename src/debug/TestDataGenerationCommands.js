/**
 * TestDataGenerationCommands - テストデータ生成コマンド群（Main Controller Pattern）
 * 
 * デバッグ・テスト環境でのデータ生成を統制する軽量オーケストレーター。
 * 4つの専門コンポーネントに機能を委譲し、統一されたインターフェースを提供。
 */

import { BubbleGenerationCommands } from './test-data-generation/BubbleGenerationCommands.js';
import { GameStateGenerationCommands } from './test-data-generation/GameStateGenerationCommands.js';
import { ScenarioCommands } from './test-data-generation/ScenarioCommands.js';
import { CommandValidator } from './test-data-generation/CommandValidator.js';

export class TestDataGenerationCommands {
    constructor(gameEngine) {
        // Main Controller Pattern設定
        this.gameEngine = gameEngine;
        this.components = new Map();
        this.generatedData = new Map();
        this.initialized = false;
        
        // 軽量エラーハンドラー
        this.errorHandler = {
            handleError: (error, context, details) => {
                console.error(`[TestDataGenerationCommands] ${context}: ${error.message}`);
                if (details) console.error('Details:', details);
            }
        };

        this.initializeComponents();
    }

    /**
     * コンポーネントを初期化
     */
    async initializeComponents() {
        try {
            const componentConfigs = [
                { name: 'bubbleGenerator', class: BubbleGenerationCommands },
                { name: 'gameStateGenerator', class: GameStateGenerationCommands },
                { name: 'scenarioProcessor', class: ScenarioCommands },
                { name: 'validator', class: CommandValidator }
            ];

            for (const { name, class: ComponentClass } of componentConfigs) {
                try {
                    const component = new ComponentClass(this);
                    await component.initialize();
                    this.components.set(name, component);
                } catch (error) {
                    console.error(`Failed to initialize ${name}:`, error);
                    this.components.set(name, this.createFallbackComponent(name));
                }
            }

            this.initialized = true;
            console.log('[TestDataGenerationCommands] 全コンポーネント初期化完了');

        } catch (error) {
            this.errorHandler.handleError(error, 'Component initialization failed');
        }
    }

    /**
     * フォールバック用の軽量コンポーネントを作成
     * @param {string} name - コンポーネント名
     * @returns {Object} フォールバック機能
     */
    createFallbackComponent(name) {
        return {
            initialized: false,
            processBubbleCommand: () => 'Component not available',
            processGameStateCommand: () => 'Component not available',
            processPlayerDataCommand: () => 'Component not available',
            processStatisticsCommand: () => 'Component not available',
            processPerformanceTestCommand: () => 'Component not available',
            processConfigTestCommand: () => 'Component not available',
            processErrorSimulationCommand: () => 'Component not available',
            processStressTestCommand: () => 'Component not available',
            validateCommand: () => ({ valid: false, errors: ['Component not available'] })
        };
    }

    /**
     * コンポーネントを取得
     * @param {string} name - コンポーネント名
     * @returns {Object} コンポーネント
     */
    getComponent(name) {
        return this.components.get(name);
    }

    /**
     * DeveloperConsoleにコマンドを登録（後方互換性維持）
     * @param {Object} console - Developer Console インスタンス
     */
    registerCommands(console) {
        try {
            // バブル生成コマンド
            const bubbleGenerator = this.getComponent('bubbleGenerator');
            if (bubbleGenerator) {
                const bubbleReg = bubbleGenerator.getBubbleCommandRegistration();
                console.register(bubbleReg.command, this.generateBubblesCommand.bind(this), bubbleReg);
            }

            // ゲーム状態関連コマンド
            const gameStateGenerator = this.getComponent('gameStateGenerator');
            if (gameStateGenerator) {
                const gameStateRegs = gameStateGenerator.getGameStateCommandRegistrations();
                for (const reg of gameStateRegs) {
                    const handler = this.getCommandHandler(reg.command);
                    if (handler) {
                        console.register(reg.command, handler, reg);
                    }
                }
            }

            // シナリオ関連コマンド
            const scenarioProcessor = this.getComponent('scenarioProcessor');
            if (scenarioProcessor) {
                const scenarioRegs = scenarioProcessor.getScenarioCommandRegistrations();
                for (const reg of scenarioRegs) {
                    const handler = this.getCommandHandler(reg.command);
                    if (handler) {
                        console.register(reg.command, handler, reg);
                    }
                }
            }

            // ユーティリティコマンド
            this.registerUtilityCommands(console);

        } catch (error) {
            this.errorHandler.handleError(error, 'Command registration failed');
        }
    }

    /**
     * ユーティリティコマンドを登録
     * @param {Object} console - Developer Console インスタンス
     */
    registerUtilityCommands(console) {
        // test.clear コマンド
        console.register('test.clear', this.clearTestDataCommand.bind(this), {
            description: 'Clear generated test data',
            usage: 'test.clear [type]',
            parameters: [
                { name: 'type', type: 'string', required: false, description: 'Data type to clear or "all"' }
            ],
            examples: ['test.clear', 'test.clear bubbles', 'test.clear all'],
            group: 'test'
        });

        // test.list コマンド
        console.register('test.list', this.listTestDataCommand.bind(this), {
            description: 'List available test data and scenarios',
            usage: 'test.list [category]',
            parameters: [
                { name: 'category', type: 'string', required: false, description: 'Category: generators, scenarios, data' }
            ],
            examples: ['test.list', 'test.list generators', 'test.list scenarios'],
            group: 'test'
        });
    }

    /**
     * コマンドハンドラーを取得
     * @param {string} command - コマンド名
     * @returns {Function|null} ハンドラー関数
     */
    getCommandHandler(command) {
        const handlers = {
            'test.bubbles': this.generateBubblesCommand.bind(this),
            'test.gamestate': this.generateGameStateCommand.bind(this),
            'test.playerdata': this.generatePlayerDataCommand.bind(this),
            'test.statistics': this.generateStatisticsCommand.bind(this),
            'test.performance': this.generatePerformanceTestCommand.bind(this),
            'test.config': this.generateConfigTestCommand.bind(this),
            'test.errors': this.simulateErrorsCommand.bind(this),
            'test.stress': this.runStressTestCommand.bind(this)
        };
        
        return handlers[command] || null;
    }

    // === 公開コマンドハンドラー（後方互換性維持） ===

    async generateBubblesCommand(args, context, console) {
        const validator = this.getComponent('validator');
        const bubbleGenerator = this.getComponent('bubbleGenerator');
        
        if (validator) {
            const validation = validator.validateCommand('test.bubbles', args);
            if (!validation.valid) {
                return `Validation errors: ${validation.errors.join(', ')}`;
            }
        }
        
        if (bubbleGenerator) {
            return await bubbleGenerator.processBubbleCommand(args, context, console);
        }
        
        return 'Bubble generation component not available';
    }

    async generateGameStateCommand(args, context, console) {
        const validator = this.getComponent('validator');
        const gameStateGenerator = this.getComponent('gameStateGenerator');
        
        if (validator) {
            const validation = validator.validateCommand('test.gamestate', args);
            if (!validation.valid) {
                return `Validation errors: ${validation.errors.join(', ')}`;
            }
        }
        
        if (gameStateGenerator) {
            return await gameStateGenerator.processGameStateCommand(args, context, console);
        }
        
        return 'Game state generation component not available';
    }

    async generatePlayerDataCommand(args, context, console) {
        const validator = this.getComponent('validator');
        const gameStateGenerator = this.getComponent('gameStateGenerator');
        
        if (validator) {
            const validation = validator.validateCommand('test.playerdata', args);
            if (!validation.valid) {
                return `Validation errors: ${validation.errors.join(', ')}`;
            }
        }
        
        if (gameStateGenerator) {
            return await gameStateGenerator.processPlayerDataCommand(args, context, console);
        }
        
        return 'Player data generation component not available';
    }

    async generateStatisticsCommand(args, context, console) {
        const validator = this.getComponent('validator');
        const gameStateGenerator = this.getComponent('gameStateGenerator');
        
        if (validator) {
            const validation = validator.validateCommand('test.statistics', args);
            if (!validation.valid) {
                return `Validation errors: ${validation.errors.join(', ')}`;
            }
        }
        
        if (gameStateGenerator) {
            return await gameStateGenerator.processStatisticsCommand(args, context, console);
        }
        
        return 'Statistics generation component not available';
    }

    async generatePerformanceTestCommand(args, context, console) {
        const validator = this.getComponent('validator');
        const scenarioProcessor = this.getComponent('scenarioProcessor');
        
        if (validator) {
            const validation = validator.validateCommand('test.performance', args);
            if (!validation.valid) {
                return `Validation errors: ${validation.errors.join(', ')}`;
            }
        }
        
        if (scenarioProcessor) {
            return await scenarioProcessor.processPerformanceTestCommand(args, context, console);
        }
        
        return 'Performance testing component not available';
    }

    async generateConfigTestCommand(args, context, console) {
        const validator = this.getComponent('validator');
        const scenarioProcessor = this.getComponent('scenarioProcessor');
        
        if (validator) {
            const validation = validator.validateCommand('test.config', args);
            if (!validation.valid) {
                return `Validation errors: ${validation.errors.join(', ')}`;
            }
        }
        
        if (scenarioProcessor) {
            return await scenarioProcessor.processConfigTestCommand(args, context, console);
        }
        
        return 'Config testing component not available';
    }

    async simulateErrorsCommand(args, context, console) {
        const validator = this.getComponent('validator');
        const scenarioProcessor = this.getComponent('scenarioProcessor');
        
        if (validator) {
            const validation = validator.validateCommand('test.errors', args);
            if (!validation.valid) {
                return `Validation errors: ${validation.errors.join(', ')}`;
            }
        }
        
        if (scenarioProcessor) {
            return await scenarioProcessor.processErrorSimulationCommand(args, context, console);
        }
        
        return 'Error simulation component not available';
    }

    async runStressTestCommand(args, context, console) {
        const validator = this.getComponent('validator');
        const scenarioProcessor = this.getComponent('scenarioProcessor');
        
        if (validator) {
            const validation = validator.validateCommand('test.stress', args);
            if (!validation.valid) {
                return `Validation errors: ${validation.errors.join(', ')}`;
            }
        }
        
        if (scenarioProcessor) {
            return await scenarioProcessor.processStressTestCommand(args, context, console);
        }
        
        return 'Stress testing component not available';
    }

    async clearTestDataCommand(args, context, console) {
        const type = args[0] || 'all';
        
        if (type === 'all') {
            this.generatedData.clear();
            
            // 各コンポーネントのデータもクリア
            for (const component of this.components.values()) {
                if (component.clearCache) {
                    component.clearCache();
                }
            }
            
            return 'Cleared all test data';
        } else if (this.generatedData.has(type)) {
            this.generatedData.delete(type);
            return `Cleared test data: ${type}`;
        } else {
            return `No test data found for: ${type}`;
        }
    }

    async listTestDataCommand(args, context, console) {
        const category = args[0] || 'all';
        let output = '';
        
        if (category === 'all' || category === 'generators') {
            output += 'Available Data Generators:\n';
            const bubbleGenerator = this.getComponent('bubbleGenerator');
            const gameStateGenerator = this.getComponent('gameStateGenerator');
            
            if (bubbleGenerator) output += '  - Bubble Generator (bubbles)\n';
            if (gameStateGenerator) {
                output += '  - Game State Generator (gamestate, playerdata, statistics)\n';
            }
            output += '\n';
        }
        
        if (category === 'all' || category === 'scenarios') {
            output += 'Available Test Scenarios:\n';
            const gameStateGenerator = this.getComponent('gameStateGenerator');
            const scenarioProcessor = this.getComponent('scenarioProcessor');
            
            if (gameStateGenerator) {
                const scenarios = gameStateGenerator.getAvailableScenarios();
                for (const scenario of scenarios) {
                    output += `  - ${scenario.name}: ${scenario.description}\n`;
                }
            }
            
            if (scenarioProcessor) {
                output += '  - Performance tests: memory, cpu, rendering, particles\n';
                output += '  - Config tests: game, audio, effects, performance\n';
                output += '  - Error simulations: memory, network, render, logic, crash\n';
                output += '  - Stress tests: bubbles, rendering, audio, memory, all\n';
            }
            output += '\n';
        }
        
        if (category === 'all' || category === 'data') {
            output += 'Generated Test Data:\n';
            if (this.generatedData.size === 0) {
                output += '  (no data generated yet)\n';
            } else {
                for (const [name, data] of this.generatedData) {
                    const dataType = Array.isArray(data) ? 'array' : typeof data;
                    const dataSize = Array.isArray(data) ? data.length : Object.keys(data).length;
                    output += `  - ${name}: ${dataType} (${dataSize} items)\n`;
                }
            }
        }
        
        return output.trim();
    }

    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    getStatistics() {
        const stats = {
            initialized: this.initialized,
            componentsCount: this.components.size,
            generatedDataCount: this.generatedData.size,
            components: {}
        };

        // 各コンポーネントの統計を収集
        for (const [name, component] of this.components) {
            if (component.getGenerationStatistics) {
                stats.components[name] = component.getGenerationStatistics();
            } else if (component.getValidationStatistics) {
                stats.components[name] = component.getValidationStatistics();
            } else {
                stats.components[name] = { initialized: component.initialized };
            }
        }

        return stats;
    }

    /**
     * リソースの解放（後方互換性維持）
     */
    destroy() {
        // 各コンポーネントをクリーンアップ
        for (const component of this.components.values()) {
            if (component.cleanup) {
                component.cleanup();
            }
        }
        
        this.components.clear();
        this.generatedData.clear();
        this.initialized = false;
        
        console.log('[TestDataGenerationCommands] クリーンアップ完了');
    }
}