import { Bubble } from '../bubbles/Bubble.js';

/**
 * 泡管理クラス
 */
export class BubbleManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.bubbles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // 2秒間隔
        this.maxBubbles = 20;
        this.mousePosition = { x: 0, y: 0 };
        this.stageConfig = null; // ステージ設定
        this.baseSpawnRate = 1.0; // 基本生成レート
    }
    
    /**
     * 泡を生成
     */
    spawnBubble(type = null, position = null) {
        if (this.bubbles.length >= this.maxBubbles) {
            return null;
        }
        
        // ランダムな種類を選択（指定がない場合）
        if (!type) {
            type = this.getRandomBubbleType();
        }
        
        // ランダムな位置を選択（指定がない場合）
        if (!position) {
            position = this.getRandomPosition();
        }
        
        const bubble = new Bubble(type, position);
        this.bubbles.push(bubble);
        
        return bubble;
    }
    
    /**
     * ステージ設定を適用
     */
    setStageConfig(config) {
        this.stageConfig = config;
        this.maxBubbles = config.maxBubbles;
        this.baseSpawnRate = config.spawnRate;
        
        // 生成間隔を調整（レートが高いほど間隔が短くなる）
        this.spawnInterval = Math.max(500, 2000 / config.spawnRate);
        
        console.log(`Stage config applied: maxBubbles=${this.maxBubbles}, spawnRate=${this.baseSpawnRate}, interval=${this.spawnInterval}ms`);
    }
    
    /**
     * 特定の泡を強制生成
     */
    spawnSpecificBubble(type, position = null) {
        if (!position) {
            position = this.getRandomPosition();
        }
        
        const bubble = new Bubble(type, position);
        this.bubbles.push(bubble);
        
        console.log(`Spawned specific bubble: ${type}`);
        return bubble;
    }
    
    /**
     * ランダムな泡の種類を取得
     */
    getRandomBubbleType() {
        // ステージ設定がある場合はそれに従う
        if (this.stageConfig && this.stageConfig.bubbleTypes) {
            const allowedTypes = this.stageConfig.bubbleTypes;
            const randomIndex = Math.floor(Math.random() * allowedTypes.length);
            return allowedTypes[randomIndex];
        }
        
        // アイテム効果によるレア率倍率を取得
        const rareRateMultiplier = this.gameEngine.itemManager ? 
            this.gameEngine.itemManager.getEffectValue('rareRate') : 1;
        
        // デフォルトの重み付き選択（レア率倍率を適用）
        const types = [
            { type: 'normal', weight: 25, isRare: false },
            { type: 'stone', weight: 10, isRare: false },
            { type: 'iron', weight: 7, isRare: true },
            { type: 'diamond', weight: 3, isRare: true },
            { type: 'pink', weight: 10, isRare: true },
            { type: 'poison', weight: 10, isRare: false },
            { type: 'spiky', weight: 7, isRare: true },
            { type: 'rainbow', weight: 4, isRare: true },
            { type: 'clock', weight: 5, isRare: true },
            { type: 'score', weight: 3, isRare: true },
            { type: 'electric', weight: 6, isRare: true },
            { type: 'escaping', weight: 5, isRare: true },
            { type: 'cracked', weight: 4, isRare: true },
            { type: 'boss', weight: 1, isRare: true }
        ];
        
        // レア率倍率を適用
        types.forEach(typeInfo => {
            if (typeInfo.isRare) {
                typeInfo.weight = Math.floor(typeInfo.weight * rareRateMultiplier);
            }
        });
        
        const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const typeInfo of types) {
            random -= typeInfo.weight;
            if (random <= 0) {
                return typeInfo.type;
            }
        }
        
        return 'normal';
    }
    
    /**
     * ランダムな位置を取得
     */
    getRandomPosition() {
        const margin = 70; // 泡のサイズを考慮したマージン
        return {
            x: margin + Math.random() * (800 - margin * 2),
            y: margin + Math.random() * (600 - margin * 2)
        };
    }
    
    /**
     * 泡を更新
     */
    update(deltaTime) {
        // 自動生成
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnBubble();
            this.spawnTimer = 0;
        }
        
        // 全ての泡を更新
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            bubble.update(deltaTime, this.mousePosition);
            
            // 死んだ泡を削除
            if (!bubble.isAlive) {
                // 破裂した泡はダメージを与える
                if (bubble.age >= bubble.maxAge) {
                    this.gameEngine.playerData.takeDamage(5);
                }
                
                this.bubbles.splice(i, 1);
            }
        }
    }
    
    /**
     * マウス位置を更新
     */
    updateMousePosition(x, y) {
        this.mousePosition.x = x;
        this.mousePosition.y = y;
    }
    
    /**
     * 泡を描画
     */
    render(context) {
        this.bubbles.forEach(bubble => {
            bubble.render(context);
        });
    }
    
    /**
     * クリック処理
     */
    handleClick(x, y) {
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            
            if (bubble.containsPoint(x, y)) {
                const wasDestroyed = bubble.takeDamage();
                
                if (wasDestroyed) {
                    // スコア加算
                    const score = bubble.getScore();
                    this.gameEngine.scoreManager.addScore(score);
                    
                    // 特殊効果を適用
                    const effects = bubble.getAndClearEffects();
                    this.applyEffects(effects);
                    
                    // コンボ更新
                    this.gameEngine.scoreManager.updateCombo();
                    
                    // 泡を削除
                    this.bubbles.splice(i, 1);
                }
                
                return true; // クリックが処理された
            }
        }
        
        // 空振りの場合、コンボをリセット
        this.gameEngine.scoreManager.resetCombo();
        return false;
    }
    
    /**
     * 特殊効果を適用
     */
    applyEffects(effects) {
        effects.forEach(effect => {
            switch (effect.type) {
                case 'heal':
                    this.gameEngine.playerData.heal(effect.amount);
                    this.showFloatingText(`+${effect.amount} HP`, '#00FF00');
                    break;
                    
                case 'damage':
                    this.gameEngine.playerData.takeDamage(effect.amount);
                    this.showFloatingText(`-${effect.amount} HP`, '#FF0000');
                    break;
                    
                case 'chain_destroy':
                    this.handleChainDestroy(effect.position, effect.radius);
                    this.showFloatingText('連鎖破壊!', '#FF6347');
                    break;
                    
                case 'bonus_time':
                    this.gameEngine.activateBonusTime(effect.duration);
                    this.showFloatingText('ボーナスタイム!', '#FF69B4');
                    break;
                    
                case 'time_stop':
                    this.gameEngine.activateTimeStop(effect.duration);
                    this.showFloatingText('時間停止!', '#FFD700');
                    break;
                    
                case 'bonus_score':
                    this.gameEngine.scoreManager.addScore(effect.amount);
                    this.showFloatingText(`+${effect.amount} ボーナス!`, '#32CD32');
                    break;
                    
                case 'screen_shake':
                    this.gameEngine.activateScreenShake(effect.intensity, effect.duration);
                    this.showFloatingText('ビリビリ!', '#FFFF00');
                    break;
            }
        });
    }
    
    /**
     * 連鎖破壊を処理
     */
    handleChainDestroy(centerPosition, radius) {
        const bubblesDestroyed = [];
        
        // 範囲内の泡を検索して破壊
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            const dx = bubble.position.x - centerPosition.x;
            const dy = bubble.position.y - centerPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius) {
                // スコア加算
                const score = bubble.getScore();
                this.gameEngine.scoreManager.addScore(score);
                
                // 特殊効果を適用（連鎖による破壊なので一部効果は発動しない）
                const effects = bubble.getAndClearEffects();
                const filteredEffects = effects.filter(effect => 
                    effect.type !== 'chain_destroy' // 連鎖の連鎖は防ぐ
                );
                this.applyEffects(filteredEffects);
                
                bubblesDestroyed.push(bubble);
                this.bubbles.splice(i, 1);
            }
        }
        
        // 連鎖で破壊された泡の数だけコンボを増加
        for (let i = 0; i < bubblesDestroyed.length; i++) {
            this.gameEngine.scoreManager.updateCombo();
        }
        
        return bubblesDestroyed.length;
    }

    /**
     * フローティングテキストを表示
     */
    showFloatingText(text, color) {
        // 簡単な実装（後で改善）
        console.log(`Effect: ${text}`);
    }
    
    /**
     * 全ての泡をクリア
     */
    clearAllBubbles() {
        this.bubbles = [];
    }
    
    /**
     * 泡の数を取得
     */
    getBubbleCount() {
        return this.bubbles.length;
    }
}