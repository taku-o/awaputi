import { BaseComponent } from '../BaseComponent.js';

/**
 * MockBubbleDataGenerator - 泡関連のモックデータ生成コンポーネント
 */
export class MockBubbleDataGenerator extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'MockBubbleDataGenerator');
        this.bubbleTypes = [];
        this.bubbleColors = [];
        this.bubbleTemplates = new Map();
    }

    async _doInitialize() {
        this.setupBubbleTypes();
        this.setupBubbleColors();
        this.setupBubbleTemplates();
    }

    setupBubbleTypes() {
        this.bubbleTypes = [
            'normal', 'special', 'power', 'multi', 'explosive', 
            'time', 'electric', 'freeze', 'magnetic', 'gravity',
            'healing', 'shield', 'portal', 'rainbow', 'boss',
            'combo', 'scatter', 'duplicate'
        ];
    }

    setupBubbleColors() {
        this.bubbleColors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#FFD93D', '#6BCF7F', '#DDA0DD', '#87CEEB', '#F0E68C',
            '#FF69B4', '#20B2AA', '#9370DB', '#3CB371', '#CD853F'
        ];
    }

    setupBubbleTemplates() {
        const templates = {
            basic: {
                size: [20, 40],
                speed: [50, 100],
                health: [1, 3],
                score: [10, 50]
            },
            special: {
                size: [30, 60],
                speed: [40, 80],
                health: [2, 5],
                score: [50, 150]
            },
            boss: {
                size: [80, 120],
                speed: [20, 40],
                health: [10, 20],
                score: [500, 1000]
            }
        };

        for (const [name, config] of Object.entries(templates)) {
            this.bubbleTemplates.set(name, config);
        }
    }

    /**
     * 単一の泡を生成
     * @param {Object} options - 生成オプション
     * @returns {Object} 泡データ
     */
    generateBubble(options = {}) {
        const type = options.type || this.mainController.randomChoice(this.bubbleTypes);
        const template = this.getBubbleTemplate(type);

        return {
            id: this.mainController.generateId(),
            type: type,
            ...this.generateBubbleProperties(template),
            position: options.position || { x: 0, y: 0 },
            created: Date.now()
        };
    }

    /**
     * 泡のプロパティを生成
     * @param {Object} template - 泡テンプレート
     * @returns {Object} 泡プロパティ
     */
    generateBubbleProperties(template) {
        return {
            size: this.mainController.randomFloat(template.size[0], template.size[1]),
            speed: this.mainController.randomFloat(template.speed[0], template.speed[1]),
            health: this.mainController.randomInt(template.health[0], template.health[1]),
            maxHealth: template.health[1],
            score: this.mainController.randomInt(template.score[0], template.score[1]),
            color: this.getBubbleColor(),
            effects: this.generateActiveEffects(),
            angle: this.mainController.randomFloat(0, Math.PI * 2),
            velocity: {
                x: this.mainController.randomFloat(-50, 50),
                y: this.mainController.randomFloat(-50, 50)
            }
        };
    }

    /**
     * 泡の色を取得
     * @param {string} type - 泡タイプ
     * @returns {string} 色コード
     */
    getBubbleColor(type = null) {
        if (type) {
            const colorMap = {
                'normal': '#4ECDC4',
                'special': '#FF6B6B',
                'power': '#FFD93D',
                'boss': '#9370DB',
                'electric': '#87CEEB',
                'freeze': '#B0E0E6',
                'fire': '#FF4500'
            };
            return colorMap[type] || this.mainController.randomChoice(this.bubbleColors);
        }
        return this.mainController.randomChoice(this.bubbleColors);
    }

    /**
     * アクティブエフェクトを生成
     * @returns {Array} エフェクト配列
     */
    generateActiveEffects() {
        const effects = ['none', 'glow', 'pulse', 'rotate', 'fade', 'bounce'];
        const effectCount = this.mainController.randomInt(0, 3);
        const activeEffects = [];

        for (let i = 0; i < effectCount; i++) {
            const effect = this.mainController.randomChoice(effects);
            if (!activeEffects.includes(effect)) {
                activeEffects.push(effect);
            }
        }

        return activeEffects;
    }

    /**
     * 複数の泡を生成
     * @param {number} count - 生成数
     * @param {Object} options - 生成オプション
     * @returns {Array} 泡データ配列
     */
    generateBubbles(count = 10, options = {}) {
        const bubbles = [];
        for (let i = 0; i < count; i++) {
            const bubble = this.generateBubble({
                ...options,
                position: this.generateRandomPosition()
            });
            bubbles.push(bubble);
        }
        return bubbles;
    }

    /**
     * ランダムな位置を生成
     * @returns {Object} 位置座標
     */
    generateRandomPosition() {
        return {
            x: this.mainController.randomFloat(0, 800),
            y: this.mainController.randomFloat(0, 600)
        };
    }

    /**
     * 泡のバリエーションを追加
     * @param {Object} bubble - 基本泡データ
     * @returns {Object} バリエーション付き泡データ
     */
    addBubbleVariations(bubble) {
        const variations = ['shiny', 'transparent', 'metallic', 'neon', 'matte'];
        bubble.variation = this.mainController.randomChoice(variations);
        
        if (bubble.variation === 'shiny') {
            bubble.reflection = this.mainController.randomFloat(0.5, 1.0);
        }
        
        if (bubble.variation === 'transparent') {
            bubble.opacity = this.mainController.randomFloat(0.3, 0.8);
        }
        
        return bubble;
    }

    /**
     * 泡テンプレートを取得
     * @param {string} type - 泡タイプ
     * @returns {Object} テンプレート
     */
    getBubbleTemplate(type) {
        if (type === 'boss') return this.bubbleTemplates.get('boss');
        if (['special', 'power', 'electric'].includes(type)) {
            return this.bubbleTemplates.get('special');
        }
        return this.bubbleTemplates.get('basic');
    }

    /**
     * 泡タイプ統計を生成
     * @returns {Object} 統計データ
     */
    generateBubbleTypeStats() {
        const stats = {};
        this.bubbleTypes.forEach(type => {
            stats[type] = {
                count: this.mainController.randomInt(10, 100),
                destroyed: this.mainController.randomInt(5, 80),
                accuracy: this.mainController.randomFloat(0.4, 0.9),
                avgScore: this.mainController.randomInt(20, 200)
            };
        });
        return stats;
    }

    /**
     * 泡の分布データを生成
     * @returns {Object} 分布データ
     */
    generateBubbleDistribution() {
        const distribution = {};
        this.bubbleTypes.forEach(type => {
            distribution[type] = this.mainController.randomFloat(0.05, 0.25);
        });
        
        // 正規化
        const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
        Object.keys(distribution).forEach(key => {
            distribution[key] = distribution[key] / total;
        });
        
        return distribution;
    }

    /**
     * 大量の泡セットを生成
     * @param {number} count - 生成数
     * @returns {Array} 大量泡データ
     */
    generateLargeBubbleSet(count = 1000) {
        return this.generateBubbles(count, { 
            performance: true,
            simplify: true 
        });
    }
}