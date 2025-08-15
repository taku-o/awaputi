/**
 * CalculationEngine - ゲーム計算エンジン
 * ゲーム内の各種計算処理を担当
 */

/**
 * 計算エンジンクラス
 * スコア計算、ダメージ計算、物理演算などのゲーム内計算を統括
 */
export class CalculationEngine {
    private __initialized: boolean;
    
    constructor() {
        this.__initialized = false;
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    private initialize(): void {
        // 初期化処理（将来的に実装）
        this.__initialized = true;
        console.log('[CalculationEngine] Initialized');
    }
    
    /**
     * スコア計算
     * @param baseScore - 基本スコア
     * @param multiplier - 倍率
     * @param combo - コンボ数
     * @returns 計算されたスコア
     */
    calculateScore(baseScore: number, multiplier: number = 1, combo: number = 0): number {
        // 基本的なスコア計算ロジック
        const comboBonus = Math.floor(combo * 0.1 * baseScore);
        return Math.floor((baseScore + comboBonus) * multiplier);
    }
    
    /**
     * ダメージ計算
     * @param baseDamage - 基本ダメージ
     * @param defense - 防御力
     * @returns 計算されたダメージ
     */
    calculateDamage(baseDamage: number, defense: number = 0): number {
        // 基本的なダメージ計算ロジック
        const damage = Math.max(1, baseDamage - defense);
        return Math.floor(damage);
    }
    
    /**
     * 距離計算
     * @param x1 - 座標1のX
     * @param y1 - 座標1のY
     * @param x2 - 座標2のX
     * @param y2 - 座標2のY
     * @returns 2点間の距離
     */
    calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * 角度計算
     * @param x1 - 座標1のX
     * @param y1 - 座標1のY
     * @param x2 - 座標2のX
     * @param y2 - 座標2のY
     * @returns ラジアン単位の角度
     */
    calculateAngle(x1: number, y1: number, x2: number, y2: number): number {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    /**
     * 速度ベクトル計算
     * @param angle - 角度（ラジアン）
     * @param speed - 速度
     * @returns 速度ベクトル {vx, vy}
     */
    calculateVelocity(angle: number, speed: number): { vx: number; vy: number } {
        return {
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed
        };
    }
    
    /**
     * 衝突判定（円形）
     * @param x1 - オブジェクト1のX座標
     * @param y1 - オブジェクト1のY座標
     * @param r1 - オブジェクト1の半径
     * @param x2 - オブジェクト2のX座標
     * @param y2 - オブジェクト2のY座標
     * @param r2 - オブジェクト2の半径
     * @returns 衝突しているかどうか
     */
    checkCollision(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean {
        const distance = this.calculateDistance(x1, y1, x2, y2);
        return distance < (r1 + r2);
    }
    
    /**
     * 経験値計算
     * @param level - 現在のレベル
     * @param baseExp - 基本経験値
     * @returns 必要経験値
     */
    calculateRequiredExp(level: number, baseExp: number = 100): number {
        // レベルが上がるごとに必要経験値が増加
        return Math.floor(baseExp * Math.pow(1.5, level - 1));
    }
    
    /**
     * リソースのクリーンアップ
     */
    destroy(): void {
        this.__initialized = false;
        console.log('[CalculationEngine] Destroyed');
    }
}

// シングルトンインスタンス
let calculationEngineInstance: CalculationEngine | null = null;

/**
 * CalculationEngineのシングルトンインスタンスを取得
 * @returns CalculationEngine インスタンス
 */
export function getCalculationEngine(): CalculationEngine {
    if (!calculationEngineInstance) {
        calculationEngineInstance = new CalculationEngine();
    }
    return calculationEngineInstance;
}

export default CalculationEngine;