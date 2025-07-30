/**
 * Mock Data Generator
 * テスト用の現実的なモックデータ生成システム
 */

export class MockDataGenerator {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.generators = new Map();
        this.templates = new Map();
        this.scenarios = new Map();
        
        this.initialize();
    }

    initialize() {
        this.setupGenerators();
        this.setupTemplates();
        this.setupScenarios();
    }

    setupGenerators() {
        // 基本データ生成器
        this.generators.set('bubble', this.generateBubble.bind(this));
        this.generators.set('bubbles', this.generateBubbles.bind(this));
        this.generators.set('gameState', this.generateGameState.bind(this));
        this.generators.set('playerData', this.generatePlayerData.bind(this));
        this.generators.set('configuration', this.generateConfiguration.bind(this));
        this.generators.set('statistics', this.generateStatistics.bind(this));
        this.generators.set('achievements', this.generateAchievements.bind(this));
        this.generators.set('scoreHistory', this.generateScoreHistory.bind(this));
        this.generators.set('performanceMetrics', this.generatePerformanceMetrics.bind(this));
        
        // 大量データ生成器
        this.generators.set('largeBubbleSet', this.generateLargeBubbleSet.bind(this));
        this.generators.set('massGameStates', this.generateMassGameStates.bind(this));
        this.generators.set('stressTestData', this.generateStressTestData.bind(this));
        
        // 特殊シナリオ生成器
        this.generators.set('errorScenario', this.generateErrorScenario.bind(this));
        this.generators.set('performanceScenario', this.generatePerformanceScenario.bind(this));
        this.generators.set('edgeCaseScenario', this.generateEdgeCaseScenario.bind(this));
    }

    setupTemplates() {
        // バブルタイプのテンプレート
        this.templates.set('bubbleTypes', {
            normal: { health: 1, score: 10, radius: 25 },
            stone: { health: 2, score: 20, radius: 30 },
            iron: { health: 3, score: 30, radius: 32 },
            diamond: { health: 5, score: 50, radius: 35 },
            rainbow: { health: 1, score: 100, radius: 28, effect: 'bonus' },
            pink: { health: 1, score: 15, radius: 25, effect: 'heal' },
            clock: { health: 1, score: 25, radius: 30, effect: 'timeStop' },
            electric: { health: 2, score: 40, radius: 35, effect: 'shock' },
            poison: { health: 1, score: 10, radius: 25, effect: 'poison' },
            spiky: { health: 2, score: 35, radius: 32, effect: 'damage' },
            escaping: { health: 1, score: 50, radius: 28, effect: 'escape' },
            boss: { health: 8, score: 200, radius: 60, effect: 'boss' },
            golden: { health: 1, score: 500, radius: 30, effect: 'golden' },
            frozen: { health: 3, score: 75, radius: 35, effect: 'freeze' },
            magnetic: { health: 2, score: 60, radius: 32, effect: 'magnetic' },
            explosive: { health: 1, score: 80, radius: 40, effect: 'explode' },
            phantom: { health: 1, score: 150, radius: 25, effect: 'phantom' },
            multiplier: { health: 1, score: 30, radius: 28, effect: 'multiply' }
        });

        // ゲームモードテンプレート
        this.templates.set('gameModes', {
            tutorial: { duration: 60000, maxBubbles: 10, difficulty: 0.5 },
            easy: { duration: 180000, maxBubbles: 20, difficulty: 0.7 },
            normal: { duration: 300000, maxBubbles: 30, difficulty: 1.0 },
            hard: { duration: 300000, maxBubbles: 40, difficulty: 1.3 },
            extreme: { duration: 240000, maxBubbles: 50, difficulty: 1.6 },
            endless: { duration: Infinity, maxBubbles: 60, difficulty: 1.0 },
            boss: { duration: 120000, maxBubbles: 15, difficulty: 1.2, special: 'boss' },
            timeAttack: { duration: 60000, maxBubbles: 100, difficulty: 1.1 }
        });

        // 実績テンプレート
        this.templates.set('achievementTypes', {
            score: { category: 'score', difficulty: 'medium' },
            combo: { category: 'skill', difficulty: 'hard' },
            survival: { category: 'endurance', difficulty: 'medium' },
            special: { category: 'special', difficulty: 'hard' },
            collection: { category: 'collection', difficulty: 'easy' },
            mastery: { category: 'mastery', difficulty: 'extreme' }
        });
    }

    setupScenarios() {
        // テストシナリオの定義
        this.scenarios.set('normalGameplay', {
            bubbleCount: { min: 10, max: 30 },
            bubbleTypes: ['normal', 'stone', 'rainbow', 'pink'],
            playerHP: { min: 80, max: 100 },
            score: { min: 0, max: 5000 },
            timeRemaining: { min: 60000, max: 300000 }
        });

        this.scenarios.set('highIntensity', {
            bubbleCount: { min: 40, max: 60 },
            bubbleTypes: ['normal', 'stone', 'iron', 'electric', 'poison', 'spiky'],
            playerHP: { min: 20, max: 60 },
            score: { min: 5000, max: 20000 },
            timeRemaining: { min: 30000, max: 120000 }
        });

        this.scenarios.set('bossEncounter', {
            bubbleCount: { min: 5, max: 15 },
            bubbleTypes: ['boss', 'normal', 'stone', 'iron'],
            playerHP: { min: 50, max: 100 },
            score: { min: 10000, max: 50000 },
            timeRemaining: { min: 60000, max: 120000 },
            special: 'boss'
        });

        this.scenarios.set('endGame', {
            bubbleCount: { min: 50, max: 80 },
            bubbleTypes: ['diamond', 'boss', 'electric', 'explosive', 'phantom'],
            playerHP: { min: 1, max: 30 },
            score: { min: 50000, max: 100000 },
            timeRemaining: { min: 10000, max: 60000 }
        });
    }

    // メイン生成メソッド
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
            results.push(generator({ ...options, index: i }));
        }
        return results;
    }

    generateWithScenario(scenario, type, count = 1) {
        const scenarioData = this.scenarios.get(scenario);
        if (!scenarioData) {
            throw new Error(`Unknown scenario: ${scenario}`);
        }

        return this.generate(type, count, { scenario: scenarioData });
    }

    // バブル生成メソッド
    generateBubble(options = {}) {
        const scenario = options.scenario;
        const bubbleTypes = scenario?.bubbleTypes || 
            ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock'];
        
        const type = options.type || this.randomChoice(bubbleTypes);
        const template = this.templates.get('bubbleTypes')[type] || 
            this.templates.get('bubbleTypes').normal;

        const bubble = {
            id: this.generateId(),
            type: type,
            x: options.x ?? this.randomFloat(50, 750),
            y: options.y ?? this.randomFloat(50, 550),
            radius: template.radius + this.randomFloat(-3, 3),
            health: options.health ?? template.health,
            maxHealth: template.health,
            score: template.score,
            velocity: {
                x: options.velocityX ?? this.randomFloat(-2, 2),
                y: options.velocityY ?? this.randomFloat(-2, 2)
            },
            age: 0,
            maxAge: options.maxAge ?? this.randomInt(5000, 15000),
            effects: template.effect ? [template.effect] : [],
            properties: this.generateBubbleProperties(type),
            metadata: {
                created: Date.now(),
                scenario: options.scenario ? scenario : null,
                testData: true
            }
        };

        return this.addBubbleVariations(bubble, options);
    }

    generateBubbleProperties(type) {
        const properties = {
            color: this.getBubbleColor(type),
            opacity: 1.0,
            pulsing: false,
            glowing: false,
            rotating: false,
            scale: 1.0
        };

        // タイプ別の特別な属性
        switch (type) {
            case 'rainbow':
                properties.color = 'rainbow';
                properties.glowing = true;
                break;
            case 'electric':
                properties.pulsing = true;
                properties.glowing = true;
                break;
            case 'diamond':
                properties.glowing = true;
                properties.rotating = true;
                break;
            case 'phantom':
                properties.opacity = 0.7;
                properties.pulsing = true;
                break;
            case 'golden':
                properties.color = '#FFD700';
                properties.glowing = true;
                properties.rotating = true;
                break;
        }

        return properties;
    }

    getBubbleColor(type) {
        const colors = {
            normal: '#4A90E2',
            stone: '#8B7355',
            iron: '#708090',
            diamond: '#B9F2FF',
            rainbow: 'rainbow',
            pink: '#FF69B4',
            clock: '#32CD32',
            electric: '#FFFF00',
            poison: '#9370DB',
            spiky: '#FF4500',
            escaping: '#FF1493',
            boss: '#8B0000',
            golden: '#FFD700',
            frozen: '#87CEEB',
            magnetic: '#DC143C',
            explosive: '#FF6347',
            phantom: '#DDA0DD',
            multiplier: '#00CED1'
        };
        return colors[type] || colors.normal;
    }

    addBubbleVariations(bubble, options) {
        // ランダムなバリエーションを追加
        if (options.addVariations !== false) {
            // サイズのバリエーション
            if (Math.random() < 0.2) {
                bubble.radius *= this.randomFloat(0.8, 1.3);
            }

            // 速度のバリエーション
            if (Math.random() < 0.3) {
                bubble.velocity.x *= this.randomFloat(0.5, 2.0);
                bubble.velocity.y *= this.randomFloat(0.5, 2.0);
            }

            // 特殊効果のバリエーション
            if (Math.random() < 0.1) {
                bubble.effects.push('special_' + this.randomInt(1, 5));
            }
        }

        return bubble;
    }

    generateBubbles(count = 10, options = {}) {
        const bubbles = [];
        const scenario = options.scenario;
        
        for (let i = 0; i < count; i++) {
            const bubbleOptions = { ...options, index: i };
            
            // シナリオベースの配置パターン
            if (scenario) {
                bubbleOptions.x = this.getScenarioPosition(i, count, 'x');
                bubbleOptions.y = this.getScenarioPosition(i, count, 'y');
            }
            
            bubbles.push(this.generateBubble(bubbleOptions));
        }
        
        return bubbles;
    }

    getScenarioPosition(index, total, axis) {
        const patterns = {
            scattered: () => axis === 'x' ? this.randomFloat(50, 750) : this.randomFloat(50, 550),
            line: () => axis === 'x' ? 100 + (index * 600 / total) : 300,
            circle: () => {
                const angle = (index / total) * Math.PI * 2;
                const radius = 200;
                const centerX = 400, centerY = 300;
                return axis === 'x' ? 
                    centerX + Math.cos(angle) * radius : 
                    centerY + Math.sin(angle) * radius;
            },
            grid: () => {
                const cols = Math.ceil(Math.sqrt(total));
                const rows = Math.ceil(total / cols);
                const col = index % cols;
                const row = Math.floor(index / cols);
                return axis === 'x' ? 
                    100 + (col * 600 / cols) : 
                    100 + (row * 400 / rows);
            }
        };

        const pattern = this.randomChoice(['scattered', 'line', 'circle', 'grid']);
        return patterns[pattern]();
    }

    // ゲーム状態生成
    generateGameState(options = {}) {
        const scenario = options.scenario || this.scenarios.get('normalGameplay');
        
        return {
            // 基本状態
            score: this.randomInt(scenario.score?.min || 0, scenario.score?.max || 10000),
            combo: this.randomInt(0, 20),
            level: options.level || this.randomInt(1, 10),
            
            // 時間関連
            timeRemaining: this.randomInt(
                scenario.timeRemaining?.min || 60000, 
                scenario.timeRemaining?.max || 300000
            ),
            totalTime: options.totalTime || 300000,
            
            // プレイヤー状態
            playerHP: this.randomInt(scenario.playerHP?.min || 80, scenario.playerHP?.max || 100),
            maxHP: 100,
            
            // バブル状態
            bubbleCount: this.randomInt(
                scenario.bubbleCount?.min || 10, 
                scenario.bubbleCount?.max || 30
            ),
            maxBubbles: 50,
            
            // エフェクト
            activeEffects: this.generateActiveEffects(options),
            
            // ゲームモード
            gameMode: options.gameMode || 'normal',
            difficulty: options.difficulty || 1.0,
            
            // 統計
            bubblesPopped: this.randomInt(0, 200),
            longestCombo: this.randomInt(0, 15),
            accuracy: this.randomFloat(0.6, 0.95),
            
            // メタデータ
            sessionId: this.generateId(),
            timestamp: Date.now(),
            testData: true,
            scenario: scenario
        };
    }

    generateActiveEffects(options = {}) {
        const possibleEffects = [
            { type: 'bonusTime', duration: 5000, multiplier: 2.0 },
            { type: 'timeStop', duration: 3000 },
            { type: 'shield', duration: 10000 },
            { type: 'doubleScore', duration: 8000, multiplier: 2.0 },
            { type: 'slowMotion', duration: 4000, factor: 0.5 },
            { type: 'magneticField', duration: 6000, radius: 100 }
        ];

        const effects = [];
        const effectCount = this.randomInt(0, 3);
        
        for (let i = 0; i < effectCount; i++) {
            const effect = { ...this.randomChoice(possibleEffects) };
            effect.startTime = Date.now() - this.randomInt(0, effect.duration);
            effect.id = this.generateId();
            effects.push(effect);
        }

        return effects;
    }

    // プレイヤーデータ生成
    generatePlayerData(options = {}) {
        const gamesPlayed = options.gamesPlayed || this.randomInt(10, 500);
        const totalScore = this.randomInt(gamesPlayed * 100, gamesPlayed * 1000);
        
        return {
            // 基本情報
            id: this.generateId(),
            name: options.name || this.generatePlayerName(),
            createdAt: Date.now() - this.randomInt(86400000, 31536000000), // 1日〜1年前
            
            // スコア関連
            totalScore: totalScore,
            highScore: Math.max(totalScore * 0.1, this.randomInt(1000, 50000)),
            averageScore: Math.floor(totalScore / gamesPlayed),
            
            // ポイント関連
            totalAP: this.randomInt(gamesPlayed * 10, gamesPlayed * 50),
            currentAP: this.randomInt(0, 5000),
            spentAP: this.randomInt(0, 10000),
            
            // ゲーム統計
            gamesPlayed: gamesPlayed,
            gamesWon: Math.floor(gamesPlayed * this.randomFloat(0.3, 0.8)),
            totalPlayTime: gamesPlayed * this.randomInt(120000, 400000), // 2-6分/ゲーム
            
            // 詳細統計
            statistics: this.generateDetailedStatistics(gamesPlayed),
            
            // 実績
            achievements: this.generatePlayerAchievements(),
            
            // 設定
            settings: this.generatePlayerSettings(),
            
            // アイテム
            inventory: this.generatePlayerInventory(),
            
            // メタデータ
            lastPlayed: Date.now() - this.randomInt(0, 604800000), // 最大1週間前
            testData: true
        };
    }

    generatePlayerName() {
        const prefixes = ['Super', 'Mega', 'Ultra', 'Pro', 'Master', 'Elite', 'Ace'];
        const suffixes = ['Player', 'Gamer', 'Popper', 'Hunter', 'Champion', 'Hero', 'Star'];
        const numbers = Math.random() < 0.7 ? this.randomInt(1, 9999) : '';
        
        return `${this.randomChoice(prefixes)}${this.randomChoice(suffixes)}${numbers}`;
    }

    generateDetailedStatistics(gamesPlayed) {
        return {
            // バブル統計
            totalBubblesPopped: gamesPlayed * this.randomInt(50, 200),
            bubbleTypeStats: this.generateBubbleTypeStats(),
            
            // コンボ統計
            totalCombos: gamesPlayed * this.randomInt(5, 20),
            longestCombo: this.randomInt(5, 50),
            averageCombo: this.randomFloat(3, 12),
            
            // 精度統計
            totalClicks: gamesPlayed * this.randomInt(100, 300),
            accurateClicks: null, // 計算で設定
            accuracy: this.randomFloat(0.5, 0.95),
            
            // タイミング統計
            averageReactionTime: this.randomInt(200, 800),
            fastestReaction: this.randomInt(100, 300),
            
            // 生存統計
            totalDamage: gamesPlayed * this.randomInt(0, 30),
            timesRevived: Math.floor(gamesPlayed * this.randomFloat(0, 0.2)),
            
            // 効果使用統計
            powerUpsUsed: gamesPlayed * this.randomInt(1, 8),
            effectsTriggered: gamesPlayed * this.randomInt(3, 15)
        };
    }

    generateBubbleTypeStats() {
        const types = Object.keys(this.templates.get('bubbleTypes'));
        const stats = {};
        
        types.forEach(type => {
            stats[type] = {
                popped: this.randomInt(10, 500),
                missed: this.randomInt(0, 50),
                accuracy: this.randomFloat(0.7, 0.98)
            };
        });
        
        return stats;
    }

    generatePlayerAchievements() {
        const allAchievements = this.generateAchievements();
        const unlockedCount = this.randomInt(Math.floor(allAchievements.length * 0.2), 
                                           Math.floor(allAchievements.length * 0.8));
        
        return this.shuffleArray(allAchievements)
            .slice(0, unlockedCount)
            .map(achievement => ({
                ...achievement,
                unlockedAt: Date.now() - this.randomInt(0, 2592000000), // 最大30日前
                progress: achievement.maxProgress || 1,
                completed: true
            }));
    }

    generatePlayerSettings() {
        return {
            // 音響設定
            masterVolume: this.randomFloat(0.3, 1.0),
            effectVolume: this.randomFloat(0.5, 1.0),
            musicVolume: this.randomFloat(0.2, 0.8),
            
            // グラフィック設定
            quality: this.randomChoice(['low', 'medium', 'high', 'ultra']),
            particlesEnabled: Math.random() > 0.2,
            effectsEnabled: Math.random() > 0.1,
            animationsEnabled: Math.random() > 0.15,
            
            // ゲームプレイ設定
            difficulty: this.randomChoice(['easy', 'normal', 'hard']),
            autoSave: true,
            showTutorials: Math.random() < 0.3,
            
            // アクセシビリティ設定
            colorBlindMode: Math.random() < 0.1,
            highContrast: Math.random() < 0.05,
            largeText: Math.random() < 0.15,
            
            // その他
            language: this.randomChoice(['ja', 'en']),
            theme: this.randomChoice(['default', 'dark', 'light']),
            showFPS: Math.random() < 0.2
        };
    }

    generatePlayerInventory() {
        const items = [
            { id: 'health_potion', name: 'ヘルスポーション', count: this.randomInt(0, 10) },
            { id: 'time_boost', name: 'タイムブースト', count: this.randomInt(0, 5) },
            { id: 'score_multiplier', name: 'スコア倍率', count: this.randomInt(0, 3) },
            { id: 'shield', name: 'シールド', count: this.randomInt(0, 8) },
            { id: 'bubble_magnet', name: 'バブルマグネット', count: this.randomInt(0, 6) }
        ];
        
        return items.filter(item => item.count > 0);
    }

    // 設定データ生成
    generateConfiguration(options = {}) {
        return {
            // ゲーム設定
            game: {
                defaultDifficulty: options.difficulty || 'normal',
                maxBubbles: options.maxBubbles || 50,
                gameSpeed: this.randomFloat(0.8, 1.5),
                bubbleSpawnRate: this.randomFloat(0.5, 2.0)
            },
            
            // レンダリング設定
            rendering: {
                quality: this.randomChoice(['low', 'medium', 'high', 'ultra']),
                maxParticles: this.randomInt(50, 500),
                enableEffects: Math.random() > 0.2,
                vsync: Math.random() > 0.3
            },
            
            // 音響設定
            audio: {
                masterVolume: this.randomFloat(0.3, 1.0),
                effectVolume: this.randomFloat(0.5, 1.0),
                musicVolume: this.randomFloat(0.2, 0.8),
                enableAudio: Math.random() > 0.1
            },
            
            // パフォーマンス設定
            performance: {
                targetFPS: this.randomChoice([30, 60, 120]),
                enableOptimizations: Math.random() > 0.2,
                memoryLimit: this.randomInt(50, 500), // MB
                gcThreshold: this.randomFloat(0.7, 0.9)
            },
            
            // デバッグ設定
            debug: {
                enableLogging: Math.random() < 0.3,
                showDebugInfo: Math.random() < 0.1,
                enableProfiler: Math.random() < 0.05,
                logLevel: this.randomChoice(['error', 'warn', 'info', 'debug'])
            }
        };
    }

    // 統計データ生成
    generateStatistics(options = {}) {
        const days = options.days || 30;
        const sessions = options.sessions || this.randomInt(50, 200);
        
        return {
            // 期間情報
            period: {
                startDate: Date.now() - (days * 24 * 60 * 60 * 1000),
                endDate: Date.now(),
                totalDays: days,
                activeDays: Math.floor(days * this.randomFloat(0.3, 0.9))
            },
            
            // ゲームセッション統計
            sessions: {
                total: sessions,
                averagePerDay: sessions / days,
                averageDuration: this.randomInt(180000, 600000), // 3-10分
                totalDuration: sessions * this.randomInt(180000, 600000)
            },
            
            // スコア統計
            scores: {
                total: sessions * this.randomInt(500, 5000),
                average: this.randomInt(1000, 8000),
                highest: this.randomInt(10000, 100000),
                distribution: this.generateScoreDistribution()
            },
            
            // バブル統計
            bubbles: {
                totalPopped: sessions * this.randomInt(100, 500),
                averagePerSession: this.randomInt(150, 300),
                typeDistribution: this.generateBubbleDistribution(),
                accuracy: this.randomFloat(0.6, 0.92)
            },
            
            // 進捗統計
            progress: {
                levelsCompleted: this.randomInt(5, 25),
                achievementsUnlocked: this.randomInt(10, 50),
                totalAP: this.randomInt(1000, 20000),
                itemsUnlocked: this.randomInt(3, 15)
            },
            
            // パフォーマンス統計
            performance: {
                averageFPS: this.randomFloat(45, 62),
                minFPS: this.randomFloat(20, 40),
                memoryUsage: this.randomFloat(50, 200), // MB
                loadTime: this.randomInt(1000, 5000) // ms
            }
        };
    }

    generateScoreDistribution() {
        return {
            '0-1000': this.randomInt(5, 20),
            '1000-5000': this.randomInt(20, 40),
            '5000-10000': this.randomInt(15, 30),
            '10000-25000': this.randomInt(10, 20),
            '25000+': this.randomInt(0, 10)
        };
    }

    generateBubbleDistribution() {
        const types = Object.keys(this.templates.get('bubbleTypes'));
        const distribution = {};
        
        types.forEach(type => {
            distribution[type] = this.randomInt(10, 200);
        });
        
        return distribution;
    }

    // 実績データ生成
    generateAchievements(options = {}) {
        const achievements = [
            // スコア系実績
            { id: 'score_1k', name: '初心者', description: '1,000点獲得', category: 'score', requirement: 1000, ap: 10 },
            { id: 'score_10k', name: 'アマチュア', description: '10,000点獲得', category: 'score', requirement: 10000, ap: 25 },
            { id: 'score_50k', name: 'プロ', description: '50,000点獲得', category: 'score', requirement: 50000, ap: 50 },
            { id: 'score_100k', name: 'エキスパート', description: '100,000点獲得', category: 'score', requirement: 100000, ap: 100 },
            
            // コンボ系実績
            { id: 'combo_5', name: 'コンボ初心者', description: '5コンボ達成', category: 'combo', requirement: 5, ap: 15 },
            { id: 'combo_10', name: 'コンボマスター', description: '10コンボ達成', category: 'combo', requirement: 10, ap: 30 },
            { id: 'combo_20', name: 'コンボレジェンド', description: '20コンボ達成', category: 'combo', requirement: 20, ap: 75 },
            
            // バブル系実績
            { id: 'bubbles_100', name: 'バブルハンター', description: '100個のバブルを破壊', category: 'collection', requirement: 100, ap: 20 },
            { id: 'bubbles_1000', name: 'バブルスレイヤー', description: '1,000個のバブルを破壊', category: 'collection', requirement: 1000, ap: 50 },
            { id: 'bubbles_rainbow', name: '虹色コレクター', description: 'レインボーバブル50個破壊', category: 'special', requirement: 50, ap: 40 },
            
            // 生存系実績
            { id: 'survive_perfect', name: 'パーフェクト', description: 'ダメージ無しでクリア', category: 'skill', requirement: 1, ap: 60 },
            { id: 'survive_hard', name: 'サバイバー', description: 'ハード以上でクリア', category: 'skill', requirement: 1, ap: 80 },
            
            // 特殊実績
            { id: 'speed_clear', name: 'スピードクリア', description: '2分でクリア', category: 'special', requirement: 120000, ap: 90 },
            { id: 'boss_defeat', name: 'ボスキラー', description: 'ボスバブル10体撃破', category: 'boss', requirement: 10, ap: 100 }
        ];

        return achievements.map(achievement => ({
            ...achievement,
            id: achievement.id,
            unlocked: Math.random() < (options.unlockRate || 0.4),
            progress: this.randomInt(0, achievement.requirement),
            maxProgress: achievement.requirement,
            unlockedAt: Math.random() < 0.4 ? Date.now() - this.randomInt(0, 2592000000) : null
        }));
    }

    // パフォーマンスメトリクス生成
    generatePerformanceMetrics(options = {}) {
        const duration = options.duration || 60000; // 1分間
        const sampleCount = Math.floor(duration / 100); // 100ms間隔
        
        const metrics = {
            timestamp: Date.now(),
            duration: duration,
            sampleCount: sampleCount,
            
            // FPS メトリクス
            fps: {
                samples: [],
                average: 0,
                min: 0,
                max: 0,
                stdDev: 0
            },
            
            // メモリメトリクス
            memory: {
                samples: [],
                peak: 0,
                average: 0,
                gcEvents: this.randomInt(0, 5)
            },
            
            // レンダリングメトリクス
            rendering: {
                frameTime: [],
                drawCalls: [],
                triangles: []
            },
            
            // ゲーム固有メトリクス
            game: {
                bubbleCount: [],
                particleCount: [],
                effectCount: []
            }
        };

        // FPSサンプル生成
        const baseFPS = this.randomFloat(45, 65);
        for (let i = 0; i < sampleCount; i++) {
            const variation = this.randomFloat(-10, 10);
            const fps = Math.max(15, baseFPS + variation);
            metrics.fps.samples.push(fps);
        }

        // FPS統計計算
        metrics.fps.average = metrics.fps.samples.reduce((sum, fps) => sum + fps, 0) / sampleCount;
        metrics.fps.min = Math.min(...metrics.fps.samples);
        metrics.fps.max = Math.max(...metrics.fps.samples);
        metrics.fps.stdDev = this.calculateStandardDeviation(metrics.fps.samples);

        // メモリサンプル生成
        let currentMemory = this.randomFloat(50, 100);
        for (let i = 0; i < sampleCount; i++) {
            currentMemory += this.randomFloat(-2, 5);
            currentMemory = Math.max(30, Math.min(300, currentMemory));
            metrics.memory.samples.push(currentMemory);
        }

        metrics.memory.peak = Math.max(...metrics.memory.samples);
        metrics.memory.average = metrics.memory.samples.reduce((sum, mem) => sum + mem, 0) / sampleCount;

        // レンダリングメトリクス生成
        for (let i = 0; i < sampleCount; i++) {
            metrics.rendering.frameTime.push(this.randomFloat(8, 20));
            metrics.rendering.drawCalls.push(this.randomInt(10, 100));
            metrics.rendering.triangles.push(this.randomInt(500, 5000));
        }

        // ゲームメトリクス生成
        for (let i = 0; i < sampleCount; i++) {
            metrics.game.bubbleCount.push(this.randomInt(5, 50));
            metrics.game.particleCount.push(this.randomInt(0, 200));
            metrics.game.effectCount.push(this.randomInt(0, 10));
        }

        return metrics;
    }

    // 大量データ生成メソッド
    generateLargeBubbleSet(count = 1000, options = {}) {
        console.log(`Generating ${count} bubbles for stress testing...`);
        return this.generateBubbles(count, options);
    }

    generateMassGameStates(count = 100, options = {}) {
        console.log(`Generating ${count} game states...`);
        const states = [];
        for (let i = 0; i < count; i++) {
            states.push(this.generateGameState({ ...options, index: i }));
        }
        return states;
    }

    generateStressTestData(options = {}) {
        return {
            bubbles: this.generateLargeBubbleSet(options.bubbleCount || 500),
            gameStates: this.generateMassGameStates(options.stateCount || 50),
            performanceMetrics: this.generatePerformanceMetrics(options),
            playerData: Array.from({ length: options.playerCount || 20 }, () => this.generatePlayerData())
        };
    }

    // 特殊シナリオ生成
    generateErrorScenario(options = {}) {
        const errorTypes = ['null_reference', 'memory_leak', 'infinite_loop', 'stack_overflow', 'type_error'];
        
        return {
            errorType: this.randomChoice(errorTypes),
            triggerCondition: this.generateErrorTrigger(),
            expectedBehavior: 'graceful_degradation',
            testData: this.generateCorruptedData(),
            metadata: {
                scenario: 'error_handling',
                severity: this.randomChoice(['low', 'medium', 'high', 'critical']),
                frequency: this.randomChoice(['rare', 'occasional', 'frequent'])
            }
        };
    }

    generateErrorTrigger() {
        return {
            bubbleCount: this.randomInt(100, 1000),
            memoryPressure: this.randomFloat(0.8, 1.2),
            processingLoad: this.randomFloat(0.9, 1.5),
            networkLatency: this.randomInt(100, 2000)
        };
    }

    generateCorruptedData() {
        return {
            invalidBubbles: this.generateBubbles(5).map(bubble => {
                // データを意図的に破損
                if (Math.random() < 0.3) bubble.x = null;
                if (Math.random() < 0.3) bubble.type = 'invalid_type';
                if (Math.random() < 0.3) bubble.health = -1;
                return bubble;
            }),
            invalidGameState: {
                score: -100,
                timeRemaining: 'invalid',
                playerHP: null,
                bubbleCount: Infinity
            }
        };
    }

    generatePerformanceScenario(options = {}) {
        return {
            targetFPS: options.targetFPS || 60,
            maxMemory: options.maxMemory || 200, // MB
            stressLevel: this.randomChoice(['light', 'medium', 'heavy', 'extreme']),
            loadConditions: {
                bubbleCount: this.randomInt(50, 500),
                particleCount: this.randomInt(100, 2000),
                effectCount: this.randomInt(5, 50),
                audioSources: this.randomInt(1, 20)
            },
            expectedMetrics: {
                minFPS: Math.max(30, (options.targetFPS || 60) * 0.8),
                maxMemoryIncrease: 50, // MB
                maxLatency: 100 // ms
            }
        };
    }

    generateEdgeCaseScenario(options = {}) {
        const edgeCases = [
            'zero_bubbles',
            'maximum_bubbles',
            'negative_score',
            'zero_time',
            'infinite_combo',
            'null_player',
            'empty_config'
        ];

        return {
            caseType: this.randomChoice(edgeCases),
            testData: this.generateEdgeCaseData(this.randomChoice(edgeCases)),
            expectedOutcome: 'handled_gracefully',
            validationRules: this.generateValidationRules()
        };
    }

    generateEdgeCaseData(caseType) {
        switch (caseType) {
            case 'zero_bubbles':
                return { bubbles: [], gameState: this.generateGameState({ bubbleCount: 0 }) };
            case 'maximum_bubbles':
                return { bubbles: this.generateBubbles(1000), gameState: this.generateGameState({ bubbleCount: 1000 }) };
            case 'negative_score':
                return { gameState: this.generateGameState({ score: -1000 }) };
            case 'zero_time':
                return { gameState: this.generateGameState({ timeRemaining: 0 }) };
            case 'infinite_combo':
                return { gameState: this.generateGameState({ combo: Number.MAX_SAFE_INTEGER }) };
            default:
                return { message: 'Unknown edge case' };
        }
    }

    generateValidationRules() {
        return {
            bubbleCount: { min: 0, max: 1000 },
            score: { min: 0, max: Number.MAX_SAFE_INTEGER },
            timeRemaining: { min: 0, max: 600000 },
            playerHP: { min: 0, max: 100 },
            combo: { min: 0, max: 999 }
        };
    }

    // ユーティリティメソッド
    generateId() {
        return 'mock_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
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
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / squaredDiffs.length;
        return Math.sqrt(avgSquaredDiff);
    }

    // クリーンアップ
    destroy() {
        this.generators.clear();
        this.templates.clear();
        this.scenarios.clear();
    }
}

// グローバルアクセス用（デバッグ目的）
window.MockDataGenerator = MockDataGenerator;