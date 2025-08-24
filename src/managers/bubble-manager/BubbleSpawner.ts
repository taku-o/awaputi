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

    constructor(gameEngine: any, _config?: any) {
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
        
        // 最大数チェック
        if (currentBubbleCount >= this.maxBubbles) {
            return false;
        }
        
        // パフォーマンス最適化チェック
        if (!getPerformanceOptimizer().shouldRunEffect('bubble_spawn')) {
            return false;
        }
        
        this.spawnTimer += deltaTime;
        
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            return true;
        }
        
        return false;
    }
    
    /**
     * ランダムな泡を生成
     */
    spawnRandomBubble(safeDistance: number = 80): Bubble | null {
        try {
            const position = this.generateSafePosition(safeDistance);
            if (!position) {
                console.warn('[BubbleSpawner] Could not find safe position for bubble spawn');
                return null;
            }
            
            const bubbleType = this.selectRandomBubbleType();
            const bubble = this.createBubble(bubbleType, position);
            
            console.log(`[BubbleSpawner] Spawned ${bubbleType} bubble at (${position.x}, ${position.y})`);
            return bubble;
            
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'BubbleSpawner.spawnRandomBubble');
            return null;
        }
    }
    
    /**
     * 特定タイプの泡を生成
     */
    spawnBubble(bubbleType: string, position: Position): Bubble {
        try {
            return this.createBubble(bubbleType, position);
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'BubbleSpawner.spawnBubble');
            // フォールバック：通常の泡を生成
            return this.createBubble('normal', position);
        }
    }
    
    /**
     * 安全な位置を生成（プレイヤーから離れた場所）
     */
    generateSafePosition(safeDistance: number): Position | null {
        const canvas = this.gameEngine.canvasManager.canvas;
        const maxAttempts = 50;
        
        for (let i = 0; i < maxAttempts; i++) {
            const position: Position = {
                x: 50 + Math.random() * (canvas.width - 100),
                y: 50 + Math.random() * (canvas.height - 100)
            };
            
            // プレイヤー位置からの距離チェック
            if (this.gameEngine.playerData && this.gameEngine.playerData.position) {
                const dx = position.x - this.gameEngine.playerData.position.x;
                const dy = position.y - this.gameEngine.playerData.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance >= safeDistance) {
                    // 他の泡との重複チェック
                    if (this.isPositionSafe(position, 40)) {
                        return position;
                    }
                }
            } else {
                // プレイヤー位置が不明な場合は重複チェックのみ
                if (this.isPositionSafe(position, 40)) {
                    return position;
                }
            }
        }
        
        return null; // 安全な位置が見つからない
    }
    
    /**
     * 位置が他の泡と重複していないかチェック
     */
    isPositionSafe(position: Position, minDistance: number): boolean {
        const bubbles = this.gameEngine.bubbleManager.bubbles;
        
        for (const bubble of bubbles) {
            if (bubble.isAlive) {
                const dx = position.x - bubble.position.x;
                const dy = position.y - bubble.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < minDistance) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * ランダムな泡タイプを選択
     */
    selectRandomBubbleType(): string {
        const typeWeights: Record<string, number> = {
            'normal': 40,
            'stone': 20,
            'iron': 15,
            'diamond': 10,
            'rainbow': 3,
            'pink': 5,
            'clock': 2,
            'electric': 3,
            'poison': 1,
            'spiky': 1
        };
        
        // ステージ設定から特殊泡の出現率を調整
        if (this.stageConfig && this.stageConfig.specialBubbleRates) {
            Object.assign(typeWeights, this.stageConfig.specialBubbleRates);
        }
        
        // 特殊生成率を適用
        Object.keys(this.specialSpawnRates).forEach(type => {
            if (typeWeights[type]) {
                typeWeights[type] *= this.specialSpawnRates[type];
            }
        });
        
        const totalWeight = Object.values(typeWeights).reduce((sum, weight) => sum + weight, 0);
        let randomValue = Math.random() * totalWeight;
        
        for (const [type, weight] of Object.entries(typeWeights)) {
            randomValue -= weight;
            if (randomValue <= 0) {
                return type;
            }
        }
        
        return 'normal'; // フォールバック
    }
    
    /**
     * 泡オブジェクトを作成
     */
    createBubble(bubbleType: string, position: Position): Bubble {
        const bubbleConfig = this.getBubbleConfig(bubbleType);
        
        const bubble = new Bubble(
            bubbleConfig.size,
            position,
            bubbleType,
            bubbleConfig.color,
            bubbleConfig.points
        );
        
        // 特殊泡の設定
        this.applySpecialBubbleProperties(bubble, bubbleType);
        
        return bubble;
    }
    
    /**
     * 泡タイプの設定を取得
     */
    getBubbleConfig(bubbleType: string): { size: number; color: string; points: number } {
        const configs: Record<string, { size: number; color: string; points: number }> = {
            'normal': { size: 40, color: '#87CEEB', points: 10 },
            'stone': { size: 50, color: '#696969', points: 20 },
            'iron': { size: 45, color: '#708090', points: 30 },
            'diamond': { size: 35, color: '#B0E0E6', points: 50 },
            'rainbow': { size: 55, color: '#FF69B4', points: 100 },
            'pink': { size: 45, color: '#FFB6C1', points: 15 },
            'clock': { size: 40, color: '#FFD700', points: 25 },
            'electric': { size: 42, color: '#FFFF00', points: 35 },
            'poison': { size: 38, color: '#9ACD32', points: -20 },
            'spiky': { size: 48, color: '#FF4500', points: 40 },
            'golden': { size: 50, color: '#FFD700', points: 75 },
            'frozen': { size: 45, color: '#00BFFF', points: 30 },
            'magnetic': { size: 47, color: '#DC143C', points: 40 },
            'explosive': { size: 52, color: '#FF6347', points: 60 },
            'phantom': { size: 43, color: 'rgba(255, 255, 255, 0.5)', points: 80 },
            'multiplier': { size: 44, color: '#9370DB', points: 45 },
            'cracked': { size: 41, color: '#D2B48C', points: 8 },
            'boss': { size: 70, color: '#8B0000', points: 200 },
            'escaping': { size: 35, color: '#FFA500', points: 50 }
        };
        
        return configs[bubbleType] || configs['normal'];
    }
    
    /**
     * 特殊泡の特性を適用
     */
    applySpecialBubbleProperties(bubble: Bubble, bubbleType: string): void {
        switch (bubbleType) {
            case 'escaping':
                // 逃げる泡：初期速度を設定
                bubble.velocity = {
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 100
                };
                break;
                
            case 'boss':
                // ボス泡：高い耐久度
                bubble.health = 5;
                bubble.maxAge = 30000; // 30秒
                break;
                
            case 'cracked':
                // ひび割れ泡：短い寿命
                bubble.maxAge = 8000; // 8秒
                break;
                
            case 'phantom':
                // 幻の泡：透明効果
                (bubble as any).isPhantom = true;
                break;
                
            case 'poison':
                // 毒泡：自動破裂
                bubble.maxAge = 15000; // 15秒で自動破裂
                break;
                
            default:
                // 通常の泡：標準設定
                bubble.maxAge = 20000; // 20秒
                break;
        }
    }
    
    /**
     * 特殊生成率を設定
     */
    setSpecialSpawnRate(bubbleType: string, rate: number): void {
        if (rate >= 0) {
            this.specialSpawnRates[bubbleType] = rate;
            console.log(`[BubbleSpawner] Set ${bubbleType} spawn rate to ${rate}`);
        } else {
            console.warn(`[BubbleSpawner] Invalid spawn rate for ${bubbleType}: ${rate}`);
        }
    }
    
    /**
     * バースト時の追加泡生成
     */
    spawnBurstBubbles(centerPosition: Position, burstType: string, count: number): Bubble[] {
        const spawnedBubbles: Bubble[] = [];
        const radius = 100; // バーストの影響範囲
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const distance = 30 + Math.random() * 50;
            
            const position: Position = {
                x: centerPosition.x + Math.cos(angle) * distance,
                y: centerPosition.y + Math.sin(angle) * distance
            };
            
            // キャンバス境界チェック
            const canvas = this.gameEngine.canvasManager.canvas;
            position.x = Math.max(20, Math.min(canvas.width - 20, position.x));
            position.y = Math.max(20, Math.min(canvas.height - 20, position.y));
            
            const bubbleType = this.selectBurstBubbleType(burstType);
            const bubble = this.createBubble(bubbleType, position);
            
            // バースト効果で初期速度を与える
            const force = 50 + Math.random() * 100;
            bubble.velocity = {
                x: Math.cos(angle) * force,
                y: Math.sin(angle) * force
            };
            
            spawnedBubbles.push(bubble);
        }
        
        console.log(`[BubbleSpawner] Spawned ${count} burst bubbles from ${burstType} bubble`);
        return spawnedBubbles;
    }
    
    /**
     * バースト時の泡タイプを選択
     */
    selectBurstBubbleType(originalType: string): string {
        // バースト時は小さな泡が多く生成される
        const burstTypes = ['normal', 'normal', 'normal', 'pink', 'clock'];
        return burstTypes[Math.floor(Math.random() * burstTypes.length)];
    }

    // =======================
    // EventStageManager対応メソッド（要件7: 未実装メソッド実装）
    // =======================

    /**
     * 生成間隔を設定
     */
    setSpawnInterval(interval: number): void {
        try {
            if (typeof interval !== 'number' || interval < 100) {
                console.warn('[BubbleSpawner] setSpawnInterval: intervalは100以上の数値である必要があります');
                return;
            }
            
            this.spawnInterval = interval;
            console.log(`[BubbleSpawner] 生成間隔を${interval}msに設定`);
        } catch (error) {
            console.error('[BubbleSpawner] setSpawnInterval error:', error);
        }
    }

    /**
     * 最大泡数を設定
     */
    setMaxBubbles(maxBubbles: number): void {
        try {
            if (typeof maxBubbles !== 'number' || maxBubbles < 1) {
                console.warn('[BubbleSpawner] setMaxBubbles: maxBubblesは1以上の数値である必要があります');
                return;
            }
            
            this.maxBubbles = maxBubbles;
            console.log(`[BubbleSpawner] 最大泡数を${maxBubbles}に設定`);
        } catch (error) {
            console.error('[BubbleSpawner] setMaxBubbles error:', error);
        }
    }

    /**
     * 生成統計を取得
     */
    getSpawnStats(): { totalSpawned: number; spawnRate: number; activeTypes: string[] } {
        try {
            const bubbles = this.gameEngine.bubbleManager.bubbles || [];
            const activeTypes = [...new Set(bubbles.filter((b: any) => b.isAlive).map((b: any) => b.type))];
            
            return {
                totalSpawned: bubbles.length,
                spawnRate: this.baseSpawnRate,
                activeTypes
            };
        } catch (error) {
            console.error('[BubbleSpawner] getSpawnStats error:', error);
            return { totalSpawned: 0, spawnRate: 0, activeTypes: [] };
        }
    }
}