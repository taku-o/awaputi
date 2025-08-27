import { BaseComponent } from '../BaseComponent.js';

/**
 * BubbleGenerationCommands - バブル生成コマンド処理コンポーネント
 */
export class BubbleGenerationCommands extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'BubbleGenerationCommands');
        this.bubbleTypeDefinitions = new Map();
        this.generationTemplates = new Map();
        this.lastGeneratedBubbles = null;
    }

    async _doInitialize() {
        this.setupBubbleTypeDefinitions();
        this.setupGenerationTemplates();
    }

    /**
     * バブルタイプ定義を設定
     */
    setupBubbleTypeDefinitions() {
        const bubbleTypes = ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'electric', 'poison', 'spiky', 'escaping', 'boss'];
        
        // ヘルスマップ
        const healthMap = {
            normal: 1, stone: 2, iron: 3, diamond: 4, rainbow: 1, pink: 1,
            clock: 1, electric: 2, poison: 1, spiky: 2, escaping: 1, boss: 8,
            golden: 1, frozen: 3, magnetic: 2, explosive: 1, phantom: 1, multiplier: 1
        };

        // 特性マップ
        const propertiesMap = {
            normal: {},
            stone: { hardness: 'medium' },
            iron: { hardness: 'hard', metallic: true },
            diamond: { hardness: 'extreme', sparkle: true },
            rainbow: { special: 'bonusTime', colorful: true },
            pink: { special: 'heal', healing: 1 },
            clock: { special: 'timeStop', duration: 3000 },
            electric: { special: 'shock', intensity: 15 },
            poison: { special: 'damage', damage: 1 },
            spiky: { special: 'chainDamage', spikes: true },
            escaping: { special: 'flee', speed: 2.0 },
            boss: { special: 'boss', size: 2.0, threat: 'high' }
        };

        // バブルタイプ定義を設定
        for (const type of bubbleTypes) {
            this.bubbleTypeDefinitions.set(type, {
                type,
                health: healthMap[type] || 1,
                properties: propertiesMap[type] || {},
                category: this.categorizeBubbleType(type)
            });
        }
    }

    /**
     * 生成テンプレートを設定
     */
    setupGenerationTemplates() {
        this.generationTemplates.set('random', {
            description: 'Random bubble generation',
            generator: (count, options) => this.generateRandomBubbles(count, options)
        });

        this.generationTemplates.set('pattern', {
            description: 'Pattern-based bubble generation',
            generator: (count, options) => this.generatePatternBubbles(count, options)
        });

        this.generationTemplates.set('stress', {
            description: 'Stress test bubble generation',
            generator: (count, options) => this.generateStressBubbles(count, options)
        });
    }

    /**
     * バブル生成コマンドを処理
     * @param {Array} args - コマンド引数
     * @param {Object} context - 実行コンテキスト
     * @param {Object} console - コンソールオブジェクト
     * @returns {Promise<string>} 実行結果
     */
    async processBubbleCommand(args, context, console) {
        try {
            const count = parseInt(args[0]) || 10;
            const type = args[1] || 'random';
            const options = args[2] ? JSON.parse(args[2]) : {};

            // パラメータ検証
            const validation = this.validateBubbleParameters(count, type, options);
            if (!validation.valid) {
                throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
            }

            // バブルを生成
            const bubbles = this.generateBubbles(count, type, options);
            
            // ゲームエンジンに追加
            this.addBubblesToGame(bubbles);
            
            // 結果を記録
            this.lastGeneratedBubbles = bubbles;

            return `Generated ${bubbles.length} ${type} bubbles. ${bubbles.length > 0 ? `First bubble: ${bubbles[0].type} at (${bubbles[0].x.toFixed(1)}, ${bubbles[0].y.toFixed(1)})` : ''}`;

        } catch (error) {
            this._handleError('bubble command processing', error);
            return `Error generating bubbles: ${error.message}`;
        }
    }

    /**
     * バブルを生成
     * @param {number} count - 生成数
     * @param {string} type - バブルタイプ
     * @param {Object} options - オプション
     * @returns {Array} 生成されたバブル配列
     */
    generateBubbles(count, type, options = {}) {
        const bubbles = [];
        const bubbleTypes = Array.from(this.bubbleTypeDefinitions.keys());
        
        for (let i = 0; i < count; i++) {
            let bubbleType;
            
            if (type === 'random') {
                bubbleType = bubbleTypes[Math.floor(Math.random() * bubbleTypes.length)];
            } else if (this.bubbleTypeDefinitions.has(type)) {
                bubbleType = type;
            } else {
                bubbleType = 'normal'; // フォールバック
            }
            
            const bubble = this.createBubbleData(bubbleType, i, options);
            bubbles.push(bubble);
        }
        
        return bubbles;
    }

    /**
     * 個別のバブルデータを作成
     * @param {string} type - バブルタイプ
     * @param {number} index - インデックス
     * @param {Object} options - オプション
     * @returns {Object} バブルデータ
     */
    createBubbleData(type, index, options = {}) {
        const definition = this.bubbleTypeDefinitions.get(type);
        
        return {
            id: `test-bubble-${index}`,
            type,
            x: options.x !== undefined ? options.x : Math.random() * 800,
            y: options.y !== undefined ? options.y : Math.random() * 600,
            size: options.size !== undefined ? options.size : Math.random() * 30 + 20,
            health: definition.health,
            velocity: {
                x: options.velocityX !== undefined ? options.velocityX : (Math.random() - 0.5) * 4,
                y: options.velocityY !== undefined ? options.velocityY : (Math.random() - 0.5) * 4
            },
            spawnTime: Date.now() - Math.random() * 10000,
            properties: { ...definition.properties, ...options.properties }
        };
    }

    /**
     * ランダムバブルを生成
     * @param {number} count - 生成数
     * @param {Object} options - オプション
     * @returns {Array} バブル配列
     */
    generateRandomBubbles(count, options = {}) {
        return this.generateBubbles(count, 'random', options);
    }

    /**
     * パターンバブルを生成
     * @param {number} count - 生成数
     * @param {Object} options - オプション
     * @returns {Array} バブル配列
     */
    generatePatternBubbles(count, options = {}) {
        const pattern = options.pattern || 'grid';
        const bubbles = [];
        
        switch (pattern) {
            case 'grid':
                const cols = Math.ceil(Math.sqrt(count));
                const rows = Math.ceil(count / cols);
                const spacing = options.spacing || 80;
                
                for (let i = 0; i < count; i++) {
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    
                    const bubble = this.createBubbleData(options.type || 'normal', i, {
                        ...options,
                        x: col * spacing + 50,
                        y: row * spacing + 50,
                        velocityX: 0,
                        velocityY: 0
                    });
                    bubbles.push(bubble);
                }
                break;
                
            case 'circle':
                const centerX = options.centerX || 400;
                const centerY = options.centerY || 300;
                const radius = options.radius || 200;
                
                for (let i = 0; i < count; i++) {
                    const angle = (i / count) * 2 * Math.PI;
                    
                    const bubble = this.createBubbleData(options.type || 'normal', i, {
                        ...options,
                        x: centerX + Math.cos(angle) * radius,
                        y: centerY + Math.sin(angle) * radius,
                        velocityX: 0,
                        velocityY: 0
                    });
                    bubbles.push(bubble);
                }
                break;
                
            default:
                return this.generateRandomBubbles(count, options);
        }
        
        return bubbles;
    }

    /**
     * ストレステスト用バブルを生成
     * @param {number} count - 生成数
     * @param {Object} options - オプション
     * @returns {Array} バブル配列
     */
    generateStressBubbles(count, options = {}) {
        const stressTypes = ['boss', 'electric', 'poison', 'spiky'];
        const bubbles = [];
        
        for (let i = 0; i < count; i++) {
            const type = stressTypes[i % stressTypes.length];
            const bubble = this.createBubbleData(type, i, {
                ...options,
                size: Math.random() * 50 + 30, // 大きめのサイズ
                velocityX: (Math.random() - 0.5) * 8, // 高速移動
                velocityY: (Math.random() - 0.5) * 8
            });
            bubbles.push(bubble);
        }
        
        return bubbles;
    }

    /**
     * バブルパラメータを検証
     * @param {number} count - 生成数
     * @param {string} type - バブルタイプ
     * @param {Object} options - オプション
     * @returns {Object} 検証結果
     */
    validateBubbleParameters(count, type, options) {
        const errors = [];
        
        // 数量検証
        if (!Number.isInteger(count) || count < 1 || count > 1000) {
            errors.push('Count must be between 1 and 1000');
        }
        
        // タイプ検証
        if (type !== 'random' && !this.bubbleTypeDefinitions.has(type)) {
            errors.push(`Unknown bubble type: ${type}. Available: ${Array.from(this.bubbleTypeDefinitions.keys()).join(', ')}, random`);
        }
        
        // オプション検証
        if (options.x !== undefined && (typeof options.x !== 'number' || options.x < 0 || options.x > 1000)) {
            errors.push('Option x must be a number between 0 and 1000');
        }
        
        if (options.y !== undefined && (typeof options.y !== 'number' || options.y < 0 || options.y > 800)) {
            errors.push('Option y must be a number between 0 and 800');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * バブルをゲームに追加
     * @param {Array} bubbles - バブル配列
     */
    addBubblesToGame(bubbles) {
        const gameEngine = this.mainController.gameEngine;
        
        if (gameEngine && gameEngine.currentScene && gameEngine.currentScene.bubbleManager) {
            const bubbleManager = gameEngine.currentScene.bubbleManager;
            
            for (const bubbleData of bubbles) {
                if (bubbleManager.addTestBubble) {
                    bubbleManager.addTestBubble(bubbleData);
                }
            }
        }
    }

    /**
     * バブルタイプを分類
     * @param {string} type - バブルタイプ
     * @returns {string} カテゴリ
     */
    categorizeBubbleType(type) {
        const categories = {
            basic: ['normal', 'stone', 'iron', 'diamond'],
            special: ['rainbow', 'pink', 'clock'],
            dangerous: ['electric', 'poison', 'spiky'],
            advanced: ['escaping', 'boss']
        };
        
        for (const [category, types] of Object.entries(categories)) {
            if (types.includes(type)) {
                return category;
            }
        }
        
        return 'unknown';
    }

    /**
     * バブル生成統計を取得
     * @returns {Object} 統計情報
     */
    getGenerationStatistics() {
        return {
            definedTypes: this.bubbleTypeDefinitions.size,
            availableTemplates: this.generationTemplates.size,
            lastGenerated: this.lastGeneratedBubbles ? this.lastGeneratedBubbles.length : 0,
            supportedCommands: ['test.bubbles']
        };
    }

    /**
     * バブル生成コマンドの登録情報を取得
     * @returns {Object} コマンド登録情報
     */
    getBubbleCommandRegistration() {
        return {
            command: 'test.bubbles',
            handler: this.processBubbleCommand.bind(this),
            description: 'Generate test bubbles with specified parameters',
            usage: 'test.bubbles [count] [type] [options]',
            parameters: [
                { name: 'count', type: 'number', required: false, description: 'Number of bubbles (default: 10)' },
                { name: 'type', type: 'string', required: false, description: 'Bubble type or "random"' },
                { name: 'options', type: 'string', required: false, description: 'JSON options string' }
            ],
            examples: [
                'test.bubbles',
                'test.bubbles 20',
                'test.bubbles 15 electric',
                'test.bubbles 5 random {"spawnDelay": 100}'
            ],
            group: 'test'
        };
    }

    /**
     * 最後に生成されたバブルを取得
     * @returns {Array|null} バブル配列
     */
    getLastGeneratedBubbles() {
        return this.lastGeneratedBubbles;
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.bubbleTypeDefinitions.clear();
        this.generationTemplates.clear();
        this.lastGeneratedBubbles = null;
        super.cleanup();
    }
}