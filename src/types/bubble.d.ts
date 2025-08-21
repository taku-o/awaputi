/**
 * バブルシステム型定義
 * TypeScript移行 - Task 23対応
 */

// 基本データ構造
export interface Position { x: number,
    y: number ,}

export interface Velocity { x: number;
   , y: number }

// バブルタイプ定義
export type BubbleType = ;
    | 'normal' | 'stone' | 'iron' | 'diamond''';
    | 'pink' | 'poison' | 'spiky' | 'rainbow''';
    | 'clock' | 'score' | 'electric' | 'escaping''';
    | 'cracked' | 'boss' | 'golden' | 'frozen''';
    | 'magnetic' | 'explosive' | 'phantom' | 'multiplier';

// バブル設定インターフェース
export interface BubbleConfig { health: number,
    size: number;
    maxAge: number;
    color: string;
   , score: number;
    // 特殊効果プロパティ（オプション）
    healAmount?: number;
    damageAmount?: number;
    chainRadius?: number;
    bonusTimeMs?: number;
    timeStopMs?: number;
    bonusScore?: number;
    shakeIntensity?: number;
    disableDuration?: number;
    escapeSpeed?: number;
    escapeRadius?: number;
    multiplier?: number;
    slowEffect?: number;
    magnetRadius?: number;
    explosionRadius?: number;
    phaseChance?: number;
    scoreMultiplier?: number; ,}

// バブル効果定義
export interface BubbleEffect { type: BubbleEffectType,
    amount?: number;
    position?: Position;
    radius?: number;
    duration?: number;
    intensity?: number;
    multiplier?: number;
    slowFactor?: number;
    strength?: number;
    damage?: number; }
';

export type BubbleEffectType = '';
    | 'heal' | 'damage' | 'chain_destroy' | 'bonus_time''';
    | 'time_stop' | 'bonus_score' | 'screen_shake''';
    | 'score_multiplier' | 'slow_area' | 'magnetic_pull''';
    | 'big_explosion' | 'next_score_multiplier';

// バブルクラス型定義
export interface BubbleInterface { // 基本プロパティ
    id: string;
    type: BubbleType;
    position: Position;
    velocity: Velocity;
    size: number;
    health: number;
    maxHealth: number;
    age: number;
    maxAge: number;
    isAlive: boolean;
    effects: BubbleEffect[];
   , clickCount: number;
    // メソッド定義
    applyTypeConfig(): void;
    getTypeConfig(): BubbleConfig;
    update(deltaTime: number, mousePosition?: Position | null): void;
    handleEscapingBehavior(mousePosition: Position, deltaTime: number): void,
    handleBoundaryCollision(): void;
    render(context: CanvasRenderingContext2D): void,
    renderSpecialIcon(context: CanvasRenderingContext2D, centerX: number, centerY: number): void,
    blendColors(color1: string, color2: string, ratio: number): string,
    takeDamage(amount?: number): boolean;
    destroy(): void;
    burst(): void;
    triggerSpecialEffect(): void;
    containsPoint(x: number, y: number): boolean,
    getScore(): number;
    updateSpecialBehavior(deltaTime: number, mousePosition?: Position): void;''
    getAndClearEffects(''';
    animationQuality: 'high' | 'medium' | 'low',' }

})