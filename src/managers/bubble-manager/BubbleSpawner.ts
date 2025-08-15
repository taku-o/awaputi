import { Bubble } from '../../bubbles/Bubble';
import { getPerformanceOptimizer } from '../../utils/PerformanceOptimizer';
import { getErrorHandler } from '../../utils/ErrorHandler';
import type { BubbleSpawner as IBubbleSpawner, Position } from '../../types/game';

/**
 * BubbleSpawner - 泡生成システム
 * 
 * 泡の生成、ランダム位置・タイプ生成、特殊生成率管理を専門的に管理します
 */
export class BubbleSpawner implements IBubbleSpawner {
    public gameEngine: any;
    private stageConfig: any = null;
    private maxBubbles: number = 20;
    private baseSpawnRate: number = 1.0;
    private spawnTimer: number = 0;
    private spawnInterval: number = 2000; // 2秒間隔
    private specialSpawnRates: Record<string, number> = {};

    constructor(gameEngine: any, config?: any) {
        this.gameEngine = gameEngine;
    }
    
    /**
     * ステージ設定を適用
     */
    setStageConfig(config: any): boolean {
        console.log('BubbleSpawner.setStageConfig called with:', config);
        
        if (!config) {
            console.error('Stage config is null or undefined');
            return false;
        }
        
        this.stageConfig = config;
        this.maxBubbles = config.maxBubbles || 20;
        this.baseSpawnRate = config.spawnRate || 1.0;
        
        // 生成間隔を調整
        this.spawnInterval = Math.max(500, 2000 / this.baseSpawnRate);
        
        console.log(`Stage config applied: ${config.name}, max bubbles: ${this.maxBubbles}, spawn rate: ${this.baseSpawnRate}`);
        return true;
    }
    
    /**
     * 自動生成処理
     */
    updateSpawnTimer(deltaTime: number, currentBubbleCount: number): boolean {
        // 時間停止中は泡の生成を停止
        if (this.gameEngine.isTimeStopActive && this.gameEngine.isTimeStopActive()) {
            return false;
        }
        
        // パフォーマンス調整されたデルタタイムを使用
        const adjustedDeltaTime = getPerformanceOptimizer().adjustUpdateFrequency(deltaTime);
        
        // パフォーマンス最適化による制限
        const maxBubbles = Math.min(this.maxBubbles, getPerformanceOptimizer().getMaxBubbles());
        
        if (currentBubbleCount >= maxBubbles) {
            return false;
        }
        
        this.spawnTimer += adjustedDeltaTime;
        const adjustedSpawnInterval = this.spawnInterval * (2 - getPerformanceOptimizer().getEffectQuality());
        
        if (this.spawnTimer >= adjustedSpawnInterval) {
            this.spawnTimer = 0;
            return true; // 生成タイミング
        }
        
        return false;
    }
    
    /**
     * 泡を生成
     */
    spawnBubble(type: string | null = null, position: Position | null = null): Bubble | null {
        try {
            // 入力値を検証
            if (type !== null) {
                const typeValidation = getErrorHandler().validateInput(type, 'string', {
                    maxLength: 20,
                    pattern: /^[a-zA-Z_]+$/
                });
                
                if (!typeValidation.isValid) {
                    getErrorHandler().handleError(new Error(`Invalid bubble type: ${typeValidation.errors.join(', ')}`), 'VALIDATION_ERROR', {
                        input: type,
                        errors: typeValidation.errors
                    });
                    type = 'normal'; // フォールバック
                }
            }
            
            if (position !== null) {
                const positionValidation = getErrorHandler().validateInput(position, 'object', {
                    properties: {
                        x: { type: 'number', min: -100, max: 1000 },
                        y: { type: 'number', min: -100, max: 800 }
                    }
                });
                
                if (!positionValidation.isValid) {
                    getErrorHandler().handleError(new Error(`Invalid bubble position: ${positionValidation.errors.join(', ')}`), 'VALIDATION_ERROR', {
                        input: position,
                        errors: positionValidation.errors
                    });
                    position = null; // ランダム位置にフォールバック
                }
            }
            
            // ランダムな種類を選択（指定がない場合）
            if (!type) {
                type = this.getRandomBubbleTypeWithSpecialRates();
            }
            
            // ランダムな位置を選択（指定がない場合）
            if (!position) {
                position = this.getRandomPosition();
            }
            
            // 新しいBubbleインスタンスを作成
            const bubble = new (Bubble as any)(type, position);
            
            return bubble;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'BUBBLE_CREATION_ERROR', {
                type: type,
                position: position
            });
            return null;
        }
    }
    
    /**
     * 特定の泡を強制生成
     */
    spawnSpecificBubble(type: string, position: Position | null = null): Bubble | null {
        if (!position) {
            position = this.getRandomPosition();
        }
        
        const bubble = this.spawnBubble(type, position);
        if (bubble) {
            console.log(`Spawned specific bubble: ${type}`);
        }
        return bubble;
    }
    
    /**
     * ランダムな泡の種類を取得
     */
    getRandomBubbleType(): string {
        if (!this.stageConfig || !this.stageConfig.bubbleTypes) {
            return 'normal';
        }
        
        const types = this.stageConfig.bubbleTypes;
        return types[Math.floor(Math.random() * types.length)];
    }
    
    /**
     * ランダムな位置を取得
     */
    getRandomPosition(): Position {
        const canvas = this.gameEngine.canvas;
        const margin = 50;
        
        return {
            x: margin + Math.random() * (canvas.width - margin * 2),
            y: margin + Math.random() * (canvas.height - margin * 2)
        };
    }
    
    /**
     * 特殊な泡の生成率を設定
     */
    setSpecialSpawnRate(bubbleType: string, rate: number): void {
        this.specialSpawnRates[bubbleType] = rate;
        console.log(`Special spawn rate set for ${bubbleType}: ${rate}`);
    }
    
    /**
     * 特殊生成率を考慮したランダム泡タイプを取得
     */
    getRandomBubbleTypeWithSpecialRates(): string {
        // 特殊生成率をチェック
        for (const [bubbleType, rate] of Object.entries(this.specialSpawnRates)) {
            if (Math.random() < rate) {
                return bubbleType;
            }
        }
        
        // 通常の生成
        return this.getRandomBubbleType();
    }
    
    /**
     * 泡の種類による初期体力を取得
     */
    getBubbleHealthByType(type: string): number {
        const healthMap: Record<string, number> = {
            'normal': 1,
            'stone': 2,
            'iron': 3,
            'diamond': 5,
            'boss': 10
        };
        return healthMap[type] || 1;
    }
    
    /**
     * テスト用バブルの追加（デバッグツール用）
     */
    addTestBubble(bubbleData: any): Bubble | null {
        try {
            // バブルデータの検証
            if (!bubbleData || !bubbleData.type) {
                console.warn('Invalid bubble data provided to addTestBubble');
                return null;
            }

            // 新しいバブルを作成
            const bubble = new (Bubble as any)(
                bubbleData.type,
                {
                    x: bubbleData.x || Math.random() * 800,
                    y: bubbleData.y || Math.random() * 600
                }
            );

            // カスタムプロパティの設定
            if (bubbleData.size) {
                bubble.size = bubbleData.size;
            }
            if (bubbleData.health !== undefined) {
                bubble.health = bubbleData.health;
                bubble.maxHealth = bubbleData.health;
            }
            if (bubbleData.velocity) {
                bubble.velocity = {
                    x: bubbleData.velocity.x || 0,
                    y: bubbleData.velocity.y || 0
                };
            }
            if (bubbleData.spawnTime) {
                bubble.spawnTime = bubbleData.spawnTime;
            }
            if (bubbleData.properties) {
                Object.assign(bubble, bubbleData.properties);
            }

            console.log(`Test bubble created: ${bubbleData.type} at (${bubbleData.x}, ${bubbleData.y})`);
            return bubble;

        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'BubbleSpawner.addTestBubble',
                bubbleData
            });
            return null;
        }
    }
    
    /**
     * 複数のテストバブルを一度に作成
     */
    addTestBubbles(bubblesData: any[]): Bubble[] {
        if (!Array.isArray(bubblesData)) {
            console.warn('bubblesData must be an array');
            return [];
        }

        const bubbles: Bubble[] = [];
        for (const bubbleData of bubblesData) {
            const bubble = this.addTestBubble(bubbleData);
            if (bubble) {
                bubbles.push(bubble);
            }
        }

        return bubbles;
    }
}