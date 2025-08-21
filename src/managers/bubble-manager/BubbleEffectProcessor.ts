import { getPerformanceOptimizer  } from '../../utils/PerformanceOptimizer';
import type { BubbleEffectProcessor as IBubbleEffectProcessor,

    Bubble' }'

} from '../../types/game';

/**
 * BubbleEffectProcessor - 泡特殊効果処理システム
 * 
 * 泡の特殊効果、連鎖反応、自動破裂処理を専門的に管理します
 */
export class BubbleEffectProcessor implements IBubbleEffectProcessor { public gameEngine: any;

    constructor(gameEngine: any) {
        this.gameEngine = gameEngine  };
    /**
     * 泡の効果を処理
     */'
    processBubbleEffect(bubble: Bubble, x: number, y: number): void { // パフォーマンス最適化: エフェクトの実行可否を判定
        if(!getPerformanceOptimizer().shouldRunEffect('bubble_effect' {'
            return }
        
        // @ts-ignore 将来のシーン依存エフェクトで使用予定
        const _gameScene = this.gameEngine.sceneManager.getCurrentScene();

        switch(bubble.type) {

            case 'rainbow':','
                // ボーナスタイム開始
                this.gameEngine.activateBonusTime(10000);
                this.notifySpecialEffect('rainbow', x, y','
                break,

            case 'pink':,
                // HP回復
                const healAmount = 15,
                this.gameEngine.playerData.heal(healAmount);
                this.notifyHeal(healAmount);
                this.notifySpecialEffect('pink', x, y','
                break,

            case 'clock':','
                // 時間停止
                this.gameEngine.activateTimeStop(3000);
                this.notifySpecialEffect('clock', x, y','
                break,

            case 'electric':','
                // 画面震動
                this.gameEngine.activateScreenShake(15, 2000);
                this.notifySpecialEffect('electric', x, y','
                break,

            case 'poison':,
                // ダメージ
                const damage = 10,
                this.gameEngine.playerData.takeDamage(damage);
                this.notifyDamage(damage, 'poison');
                this.notifySpecialEffect('poison', x, y','
                break,

            case 'spiky':','
                // 周囲の泡を割る
                this.chainReaction(bubble.position.x, bubble.position.y, 80);
                this.notifySpecialEffect('spiky', x, y','
                break,
                ','
            // 新しい泡タイプの効果処理
            case 'golden':','
                // 黄金の泡：スコア倍率効果
                this.gameEngine.activateScoreMultiplier(2.0, 5000);
                this.notifySpecialEffect('golden', x, y','
                break,

            case 'frozen':','
                // 氷の泡：周囲の泡を遅くする
                this.applySlowEffect(bubble.position.x, bubble.position.y, 120, 0.5, 8000);
                this.notifySpecialEffect('frozen', x, y','
                break,

            case 'magnetic':','
                // 磁石の泡：他の泡を引き寄せる
                this.applyMagneticPull(bubble.position.x, bubble.position.y, 100, 150);
                this.notifySpecialEffect('magnetic', x, y','
                break,

            case 'explosive':','
                // 爆発の泡：大きな爆発
                this.bigExplosion(bubble.position.x, bubble.position.y, 150, 15);
                this.notifySpecialEffect('explosive', x, y','
                break,

            case 'phantom':','
                // 幻の泡：特殊効果なし（すり抜け効果は別途処理済み）
                this.notifySpecialEffect('phantom', x, y','
                break,

            case 'multiplier':','
                // 倍率の泡：次の泡のスコアを倍増
                this.gameEngine.activateNextScoreMultiplier(3.0, 10000);
                this.notifySpecialEffect('multiplier', x, y' }'
                break; }
}
    
    /**
     * 自動破裂チェック'
     */''
    checkAutoBurst(bubble: Bubble): void { // ひび割れ泡は早期破裂
        if (bubble.type === 'cracked' && bubble.age > bubble.maxAge * 0.5) {
            this.burstBubble(bubble) }
            return; }
        }
        
        // 通常の自動破裂
        if (bubble.age >= bubble.maxAge) {
            this.burstBubble(bubble) }
            return; }
}
    
    /**
     * 泡を破裂させる
     */
    private burstBubble(bubble: Bubble): void { console.log(`${bubble.type) bubble, burst automatically`),
        
        // プレイヤーにダメージ
        const, damage = this.calculateBurstDamage(bubble);
        this.gameEngine.playerData.takeDamage(damage};
        
        // 新しいエフェクトシステムで爆発エフェクトを作成
        if (this.gameEngine.createExplosion} { }
            this.gameEngine.createExplosion(bubble.position.x, bubble.position.y, bubble.type, bubble.size, 1}
        }
        
        // 泡を削除
        bubble.isAlive = false;
    }
    
    /**
     * 破裂ダメージを計算
     */''
    private calculateBurstDamage(bubble: Bubble): number { const baseDamage: Record<string, number> = {', 'normal': 5,'
            'stone': 8,
            'iron': 12,
            'diamond': 15,
            'poison': 20,
            'spiky': 15,
            'cracked': 8,
            'boss': 25,
            'escaping': 3 };
        
        return baseDamage[bubble.type] || 5;
    }
    
    /**
     * 特殊効果通知
     */'
    private notifySpecialEffect(effectType: string, x: number, y: number): void { ''
        const gameScene = this.gameEngine.sceneManager.getCurrentScene()','
        if(gameScene && typeof, gameScene.onSpecialEffect === 'function' { }
            gameScene.onSpecialEffect(effectType, x, y); }
}
    
    /**
     * ダメージ通知
     */'
    private notifyDamage(damage: number, source: string): void { ''
        const gameScene = this.gameEngine.sceneManager.getCurrentScene()','
        if(gameScene && typeof, gameScene.onDamageTaken === 'function' { }
            gameScene.onDamageTaken(damage, source); }
}
    
    /**
     * 回復通知
     */'
    private notifyHeal(healAmount: number): void { ''
        const gameScene = this.gameEngine.sceneManager.getCurrentScene()','
        if(gameScene && typeof, gameScene.onHealed === 'function' { }
            gameScene.onHealed(healAmount); }
}
    
    /**
     * 連鎖反応（とげとげ泡用）
     */
    private chainReaction(centerX: number, centerY: number, radius: number): void { const bubbles = this.gameEngine.bubbleManager.bubbles,
        const affectedBubbles: Bubble[] = [],
        
        bubbles.forEach((bubble: Bubble) => { 
            const dx = bubble.position.x - centerX,
            const dy = bubble.position.y - centerY,
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= radius && bubble.isAlive) {  }
                affectedBubbles.push(bubble); }
};
        
        // 少し遅延して爆発させる
        affectedBubbles.forEach((bubble, index) => {  setTimeout(() => {
                if (bubble.isAlive) { }
                    this.gameEngine.bubbleManager.popBubble(bubble, bubble.position.x, bubble.position.y); }
}, index * 100);
        };
        
        console.log(`Chain, reaction affected ${affectedBubbles.length} bubbles`}
    }
    
    /**
     * スロー効果を適用（氷の泡用）
     */
    private applySlowEffect(centerX: number, centerY: number, radius: number, slowFactor: number, duration: number): void { const bubbles = this.gameEngine.bubbleManager.bubbles,
        const affectedBubbles: Bubble[] = [],
        
        bubbles.forEach((bubble: Bubble) => { 
            const dx = bubble.position.x - centerX,
            const dy = bubble.position.y - centerY,
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= radius && bubble.isAlive) {  }
                affectedBubbles.push(bubble); }
};
        
        // 影響を受けた泡にスロー効果を適用
        affectedBubbles.forEach(bubble = > {  )
            (bubble, as any).slowEffect = {
                factor: slowFactor,
                endTime: Date.now() + duration 
    };
        
        console.log(`Slow, effect applied, to ${affectedBubbles.length} bubbles`);
    }
    
    /**
     * 磁力効果を適用（磁石の泡用）
     */
    private applyMagneticPull(centerX: number, centerY: number, radius: number, strength: number): void { const bubbles = this.gameEngine.bubbleManager.bubbles,
        
        bubbles.forEach((bubble: Bubble) => { 
            const dx = bubble.position.x - centerX,
            const dy = bubble.position.y - centerY,
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= radius && distance > 0 && bubble.isAlive) {
            
                // 中心に向かう力を計算
                const pullForce = strength * (1 - distance / radius),
                const direction = {
    
}
                    x: -dx / distance }
                    y: -dy / distance 
    };
                // 速度に力を加算
                bubble.velocity.x += direction.x * pullForce * 0.016; // 60FPS想定
                bubble.velocity.y += direction.y * pullForce * 0.016;
            }
        }
    }
    
    /**
     * 大爆発効果（爆発の泡用）
     */
    private bigExplosion(centerX: number, centerY: number, radius: number, damage: number): void { const bubbles = this.gameEngine.bubbleManager.bubbles }
        const affectedBubbles: Array<{ bubble: Bubble,, distance: number;> = [];
        
        bubbles.forEach((bubble: Bubble) => {  const dx = bubble.position.x - centerX,
            const dy = bubble.position.y - centerY,
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= radius && bubble.isAlive) { }
                affectedBubbles.push({ bubble, distance ) }
        };
        
        // 距離に応じて遅延爆発
        affectedBubbles.forEach(({ bubble, distance ), _index) => { 
            const delay = (distance / radius) * 500, // 最大0.5秒の遅延
            setTimeout(() => {
                if (bubble.isAlive) { }
                    this.gameEngine.bubbleManager.popBubble(bubble, bubble.position.x, bubble.position.y); }
}, delay);
        };
        
        // プレイヤーにもダメージ
        this.gameEngine.playerData.takeDamage(damage);
        
        console.log(`Big, explosion affected ${affectedBubbles.length} bubbles`}
    }

    // =======================
    // EventStageManager対応メソッド（要件7: 未実装メソッド実装）
    // =======================

    /**
     * チェーンボーナスを設定
     */''
    setChainBonus(type: string, bonus: number): void { try {'
            if (!type || typeof, type !== 'string') {

                console.warn('[BubbleEffectProcessor] setChainBonus: typeは文字列である必要があります' }
                return; }
            }

            if (typeof, bonus !== 'number' || bonus < 0''

                console.warn('[BubbleEffectProcessor] setChainBonus: bonusは非負の数値である必要があります'
            }
                return; }
            }
            
            // チェーンボーナスを保存
            if(!this.chainBonuses') {'
    
}
                this.chainBonuses = {}
            this.chainBonuses[type] = bonus;
            ';'

            console.log(`[BubbleEffectProcessor] ${type} のチェーンボーナス設定: ${bonus}`}
        } catch (error) { console.error('[BubbleEffectProcessor] setChainBonus error:', error }
    }

    // チェーンボーナス用プロパティ
    private chainBonuses: Record<string, number> = {};'}'