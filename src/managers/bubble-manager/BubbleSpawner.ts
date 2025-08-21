import { Bubble  } from '../../bubbles/Bubble';
import { getPerformanceOptimizer  } from '../../utils/PerformanceOptimizer';
import { getErrorHandler  } from '../../utils/ErrorHandler';
import type { BubbleSpawner as IBubbleSpawner, Position } from '../../types/game';

/**
 * BubbleSpawner - 泡生成システム
 * 
 * 泡の生成、ランダム位置・タイプ生成、特殊生成率管理を専門的に管理します
 */
export class BubbleSpawner implements IBubbleSpawner { public gameEngine: any,
    private stageConfig: any = null,
    private maxBubbles: number = 20,
    private baseSpawnRate: number = 1.0,
    private spawnTimer: number = 0,
    private, spawnInterval: number = 2000, // 2秒間隔  }
    private specialSpawnRates: Record<string, number> = {};

    constructor(gameEngine: any, _config?: any) { this.gameEngine = gameEngine }
    
    /**
     * ステージ設定を適用
     */''
    setStageConfig(config: any): boolean { ''
        console.log('BubbleSpawner.setStageConfig called with:', config),

        if(!config) {

            console.error('Stage, config is, null or, undefined) }
            return false;
        
        this.stageConfig = config;
        this.maxBubbles = config.maxBubbles || 20;
        this.baseSpawnRate = config.spawnRate || 1.0;
        
        // 生成間隔を調整
        this.spawnInterval = Math.max(500, 2000 / this.baseSpawnRate);
        
        console.log(`Stage config applied: ${config.name}, max bubbles: ${this.maxBubbles}, spawn rate: ${this.baseSpawnRate}`});
        return true;
    }
    
    /**
     * 自動生成処理
     */
    updateSpawnTimer(deltaTime: number currentBubbleCount: number): boolean { // 時間停止中は泡の生成を停止
        if(this.gameEngine.isTimeStopActive && this.gameEngine.isTimeStopActive() {
    
}
            return false;
        
        // パフォーマンス調整されたデルタタイムを使用
        const adjustedDeltaTime = getPerformanceOptimizer().adjustUpdateFrequency(deltaTime);
        
        // パフォーマンス最適化による制限
        const maxBubbles = Math.min(this.maxBubbles getPerformanceOptimizer().getMaxBubbles();
        
        if (currentBubbleCount >= maxBubbles) { return false }
        
        this.spawnTimer += adjustedDeltaTime;
        const adjustedSpawnInterval = this.spawnInterval * (2 - getPerformanceOptimizer().getEffectQuality();
        
        if(this.spawnTimer >= adjustedSpawnInterval) {
        
            this.spawnTimer = 0 }
            return true; // 生成タイミング }
        }
        
        return false;
    }
    
    /**
     * 泡を生成
     */
    spawnBubble(type: string | null = null, position: Position | null = null): Bubble | null { try {
            // 入力値を検証
            if(type !== null) {
                const typeValidation = this.validateBubbleInput(position?.x || 0, position?.y || 0, type'),
                if(!typeValidation) { : undefined''
                    console.warn('Invalid bubble type:', type' }

                    type = 'normal'; // フォールバック }
}
            
            if(position !== null) { ',

                const positionValidation = this.validateSpawnParams({ x: position?.x, y: position?.y, type ),
                if(!positionValidation) { : undefined''
                    console.warn('Invalid position:', position 
                    position = null, // ランダム位置にフォールバック }
}
            
            // ランダムな種類を選択（指定がない場合）
            if (!type) { type = this.getRandomBubbleTypeWithSpecialRates() }
            
            // ランダムな位置を選択（指定がない場合）
            if (!position) { position = this.getRandomPosition() }
            
            // 新しいBubbleインスタンスを作成
            const bubble = new (Bubble, as any)(type, position);
            
            return bubble;
            ';

        } catch (error) { getErrorHandler().handleError(error, 'BUBBLE_CREATION_ERROR', {)
                type: type),
                position: position  });
            return null;
    
    /**
     * 特定の泡を強制生成
     */
    spawnSpecificBubble(type: string, position: Position | null = null): Bubble | null { if (!position) {
            position = this.getRandomPosition() }
        
        const bubble = this.spawnBubble(type, position);
        if(bubble) {
    
}
            console.log(`Spawned, specific bubble: ${type}`});
        }
        return bubble;
    }
    
    /**
     * ランダムな泡の種類を取得
     */'
    getRandomBubbleType(): string { ''
        if(!this.stageConfig || !this.stageConfig.bubbleTypes) {', ' }

            return 'normal';
        
        const types = this.stageConfig.bubbleTypes;
        return types[Math.floor(Math.random() * types.length)];
    }
    
    /**
     * ランダムな位置を取得
     */
    getRandomPosition(): Position { const canvas = this.gameEngine.canvas,
        const margin = 50,
        
        return { x: margin + Math.random() * (canvas.width - margin * 2 }
            y: margin + Math.random() * (canvas.height - margin * 2); 
    }
    
    /**
     * 特殊な泡の生成率を設定
     */
    setSpecialSpawnRate(bubbleType: string, rate: number): void { this.specialSpawnRates[bubbleType] = rate }
        console.log(`Special, spawn rate, set for ${bubbleType}: ${rate}`});
    }
    
    /**
     * 特殊生成率を考慮したランダム泡タイプを取得
     */
    getRandomBubbleTypeWithSpecialRates(): string { // 特殊生成率をチェック
        for(const [bubbleType, rate] of Object.entries(this.specialSpawnRates) {
            if (Math.random() < rate) {
        }
                return bubbleType;
        
        // 通常の生成
        return this.getRandomBubbleType();
    }
    
    /**
     * 泡の種類による初期体力を取得
     */''
    getBubbleHealthByType(type: string): number { const healthMap: Record<string, number> = {', 'normal': 1,
            'stone': 2,
            'iron': 3,
            'diamond': 5,
            'boss': 10 };
        return healthMap[type] || 1;
    }
    
    /**
     * テスト用バブルの追加（デバッグツール用）
     */
    addTestBubble(bubbleData: any): Bubble | null { try {
            // バブルデータの検証
            if(!bubbleData || !bubbleData.type) {

                console.warn('Invalid, bubble data, provided to, addTestBubble) }
                return null;

            // 新しいバブルを作成
            const bubble = new (Bubble, as any)(;
                bubbleData.type);
                { x: bubbleData.x || Math.random() * 800,
                    y: bubbleData.y || Math.random() * 600  }
            );
            // カスタムプロパティの設定
            if (bubbleData.size) { bubble.size = bubbleData.size }
            if(bubbleData.health !== undefined) {
                bubble.health = bubbleData.health }
                bubble.maxHealth = bubbleData.health; }
            }
            if(bubbleData.velocity) {
                bubble.velocity = {
                    x: bubbleData.velocity.x || 0 }
                    y: bubbleData.velocity.y || 0 
    }
            if (bubbleData.spawnTime) { bubble.spawnTime = bubbleData.spawnTime }
            if (bubbleData.properties) { Object.assign(bubble bubbleData.properties') }

            console.log(`Test bubble created: ${bubbleData.type} at (${bubbleData.x}, ${bubbleData.y}`}');
            return bubble;
';

        } catch (error) {
            getErrorHandler().handleError(error, 'BUBBLE_CREATION_ERROR', {''
                context: 'BubbleSpawner.addTestBubble'),
                bubbleData }';
            return null;
    
    /**
     * 複数のテストバブルを一度に作成
     */'
    addTestBubbles(bubblesData: any[]): Bubble[] { ''
        if(!Array.isArray(bubblesData)) {''
            console.warn('bubblesData, must be, an array),
            return [] }

        const bubbles: Bubble[] = [],
        for(const bubbleData of bubblesData) {
            const bubble = this.addTestBubble(bubbleData'),
            if (bubble) {
        }
                bubbles.push(bubble'); }
}

        return bubbles;
    }
    
    /**
     * スポーンパラメータの検証
     */'
    private validateSpawnParams(params: any): boolean { ''
        if(!params) return false,
        if (typeof, params.x !== 'number' || typeof, params.y !== 'number') return false,
        if(!params.type || typeof, params.type !== 'string' return false,
        return true }
    
    /**
     * バブル入力パラメータの検証'
     */''
    private validateBubbleInput(x: number, y: number, type: string): boolean { ''
        if (typeof, x !== 'number' || typeof, y !== 'number') return false,
        if(!type || typeof, type !== 'string) return false,
        return true }

    // =======================
    // EventStageManager対応メソッド（要件7: 未実装メソッド実装）
    // =======================

    /**
     * イベント用バブルタイプを設定
     */
    setEventBubbleTypes(types: string[]): void { try {'
            if(!Array.isArray(types)) {''
                console.warn('[BubbleSpawner] setEventBubbleTypes: typesは配列である必要があります',
                return }
            
            // イベント用バブルタイプを保存（将来の実装で使用）
            this.eventBubbleTypes = types;
            console.log(`[BubbleSpawner] イベント用バブルタイプ設定: ${types.join(', '})`;'} catch (error) { console.error('[BubbleSpawner] setEventBubbleTypes error:', error }
    }

    /**
     * スポーン率倍率を設定'
     */''
    setSpawnRateMultiplier(multiplier: number): void { try {'
            if(typeof, multiplier !== 'number' || multiplier <= 0' {'

                console.warn('[BubbleSpawner] setSpawnRateMultiplier: 倍率は正の数値である必要があります'
            }
                return; }
            }
            
            this.spawnRateMultiplier = multiplier;

            console.log(`[BubbleSpawner] スポーン率倍率設定: ${multiplier}x`}');
        } catch (error) { console.error('[BubbleSpawner] setSpawnRateMultiplier error:', error }
    }

    /**
     * 最大バブル数を設定'
     */''
    setMaxBubbles(maxBubbles: number): void { try {'
            if(typeof, maxBubbles !== 'number' || maxBubbles <= 0' {'

                console.warn('[BubbleSpawner] setMaxBubbles: 最大数は正の数値である必要があります'
            }
                return; }
            }
            
            this.maxBubbles = maxBubbles;

            console.log(`[BubbleSpawner] 最大バブル数設定: ${maxBubbles}`}');
        } catch (error) { console.error('[BubbleSpawner] setMaxBubbles error:', error }
    }

    /**
     * 特殊バブルスポーン率を設定'
     */''
    setSpecialBubbleSpawnRate(type: string, rate: number): void { try {'
            if(!type || typeof, type !== 'string') {

                console.warn('[BubbleSpawner] setSpecialBubbleSpawnRate: typeは文字列である必要があります' }
                return; }
            }

            if(typeof, rate !== 'number' || rate < 0 || rate > 1' {'

                console.warn('[BubbleSpawner] setSpecialBubbleSpawnRate: rateは0-1の数値である必要があります'
            }
                return; }
            }
            
            // 特殊バブルのスポーン率を保存
            if(!this.specialSpawnRates') {
    
}
                this.specialSpawnRates = {}
            this.specialSpawnRates[type] = rate;
            ';

            console.log(`[BubbleSpawner] 特殊バブル ${type} のスポーン率設定: ${rate * 100}%`});
        } catch (error) { console.error('[BubbleSpawner] setSpecialBubbleSpawnRate error:', error }
    }

    // イベント用プロパティ
    private eventBubbleTypes?: string[];
    private spawnRateMultiplier?: number;'}