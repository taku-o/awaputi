/**
 * GameVisualizationManager - ゲーム視覚化管理システム
 * 
 * ドラッグ視覚化、背景エフェクト、画面効果、描画処理などの視覚的要素を専門的に管理します
 */

// Type definitions
interface DragParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    decay: number;
    size: number;
    color: string;
}

interface DragVisualization {
    isActive: boolean;
    startPosition: { x: number; y: number };
    currentPosition: { x: number; y: number };
    targetBubble: Bubble | null;
    forceIndicator: number;
    particles: DragParticle[];
    duration: number;
    intensity: number;
}

interface Bubble {
    x: number;
    y: number;
    size: number;
}

interface PlayerData {
    currentScore: number;
}

interface BubbleManager {
    getBubbleCount(): number;
}

// Minimal GameEngine interface
interface GameEngine {
    canvas: HTMLCanvasElement;
    timeRemaining: number;
    bonusTimeRemaining: number;
    timeStopRemaining: number;
    screenShakeRemaining: number;
    screenShakeIntensity: number;
    playerData: PlayerData;
    bubbleManager: BubbleManager;
}

interface VisualizationStats {
    isDragging: boolean;
    dragParticles: number;
    forceIndicator: number;
    screenShakeActive: boolean;
    screenShakeIntensity: number;
}

export class GameVisualizationManager {
    private gameEngine: GameEngine;
    private dragVisualization: DragVisualization;

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        
        // ドラッグビジュアライゼーション
        this.dragVisualization = {
            isActive: false,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            targetBubble: null,
            forceIndicator: 0,
            particles: [],
            duration: 0,
            intensity: 1
        };
    }
    
    /**
     * ドラッグビジュアライゼーションのリセット
     */
    public resetDragVisualization(): void {
        this.dragVisualization = {
            isActive: false,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            targetBubble: null,
            forceIndicator: 0,
            particles: [],
            duration: 0,
            intensity: 1
        };
    }
    
    /**
     * ドラッグ開始
     * @param x - 開始X座標
     * @param y - 開始Y座標
     * @param targetBubble - 対象の泡
     */
    public startDrag(x: number, y: number, targetBubble: Bubble | null = null): void {
        this.dragVisualization.isActive = true;
        this.dragVisualization.startPosition = { x, y };
        this.dragVisualization.currentPosition = { x, y };
        this.dragVisualization.targetBubble = targetBubble;
        this.dragVisualization.duration = 0;
        this.dragVisualization.particles = [];
    }
    
    /**
     * ドラッグ更新
     * @param x - 現在のX座標
     * @param y - 現在のY座標
     */
    public updateDrag(x: number, y: number): void {
        if (!this.dragVisualization.isActive) return;
        
        this.dragVisualization.currentPosition = { x, y };
        
        // 力の強度計算
        const dx = x - this.dragVisualization.startPosition.x;
        const dy = y - this.dragVisualization.startPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.dragVisualization.forceIndicator = Math.min(distance / 100, 2.0);
    }
    
    /**
     * ドラッグ終了
     */
    public endDrag(): void {
        this.dragVisualization.isActive = false;
        this.dragVisualization.targetBubble = null;
        this.dragVisualization.forceIndicator = 0;
    }
    
    /**
     * ドラッグビジュアライゼーションの更新
     * @param deltaTime - 経過時間
     */
    public updateDragVisualization(deltaTime: number): void {
        if (!this.dragVisualization.isActive) return;
        
        this.dragVisualization.duration += deltaTime;
        
        // パーティクル生成
        if (this.dragVisualization.duration % 50 < deltaTime) {
            this.createDragParticle();
        }
        
        // 既存パーティクルの更新
        this.updateDragParticles(deltaTime);
    }
    
    /**
     * ドラッグパーティクルの生成
     */
    private createDragParticle(): void {
        const start = this.dragVisualization.startPosition;
        const current = this.dragVisualization.currentPosition;
        
        // 軌道上にパーティクルを配置
        const t = Math.random();
        const x = start.x + (current.x - start.x) * t;
        const y = start.y + (current.y - start.y) * t;
        
        this.dragVisualization.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1.0,
            decay: 0.02,
            size: 2 + Math.random() * 3,
            color: `hsl(${60 + Math.random() * 60}, 70%, 60%)`
        });
    }
    
    /**
     * ドラッグパーティクルの更新
     * @param deltaTime - 経過時間
     */
    private updateDragParticles(deltaTime: number): void {
        for (let i = this.dragVisualization.particles.length - 1; i >= 0; i--) {
            const particle = this.dragVisualization.particles[i];
            
            particle.x += particle.vx * deltaTime / 16.67;
            particle.y += particle.vy * deltaTime / 16.67;
            particle.life -= particle.decay * deltaTime / 16.67;
            
            if (particle.life <= 0) {
                this.dragVisualization.particles.splice(i, 1);
            }
        }
    }
    
    /**
     * 背景グラデーション描画
     * @param context - 描画コンテキスト
     */
    public renderBackground(context: CanvasRenderingContext2D): void {
        const canvas = this.gameEngine.canvas;
        
        // 時間に基づくグラデーション
        const timeRatio = this.gameEngine.timeRemaining / 300000; // 5分
        const topColor = timeRatio > 0.5 ? '#000033' : timeRatio > 0.25 ? '#330000' : '#660000';
        const bottomColor = timeRatio > 0.5 ? '#000011' : timeRatio > 0.25 ? '#110000' : '#220000';
        
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, topColor);
        gradient.addColorStop(1, bottomColor);
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // ボーナスタイム時のオーバーレイ
        if (this.gameEngine.bonusTimeRemaining > 0) {
            const alpha = 0.1 + 0.1 * Math.sin(Date.now() * 0.01);
            context.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // 時間停止時のオーバーレイ
        if (this.gameEngine.timeStopRemaining > 0) {
            context.fillStyle = 'rgba(0, 100, 200, 0.1)';
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // 画面震動エフェクト
        this.applyScreenShake(context);
    }
    
    /**
     * 画面震動エフェクトの適用
     * @param context - 描画コンテキスト
     */
    private applyScreenShake(context: CanvasRenderingContext2D): void {
        if (this.gameEngine.screenShakeRemaining > 0) {
            const intensity = this.gameEngine.screenShakeIntensity;
            const offsetX = (Math.random() - 0.5) * intensity * 2;
            const offsetY = (Math.random() - 0.5) * intensity * 2;
            context.translate(offsetX, offsetY);
        }
    }
    
    /**
     * ドラッグビジュアライゼーション描画
     * @param context - 描画コンテキスト
     */
    public renderDragVisualization(context: CanvasRenderingContext2D): void {
        if (!this.dragVisualization.isActive) return;
        
        const start = this.dragVisualization.startPosition;
        const current = this.dragVisualization.currentPosition;
        
        context.save();
        
        // 軌道線の描画
        this.renderDragTrajectory(context, start, current);
        
        // 力の強度インジケーター
        this.renderForceIndicator(context, start, current);
        
        // ドラッグパーティクルの描画
        this.renderDragParticles(context);
        
        // 対象泡のハイライト
        if (this.dragVisualization.targetBubble) {
            this.renderTargetHighlight(context, this.dragVisualization.targetBubble);
        }
        
        context.restore();
    }
    
    /**
     * ドラッグ軌道の描画
     * @param context - 描画コンテキスト
     * @param start - 開始位置
     * @param current - 現在位置
     */
    private renderDragTrajectory(context: CanvasRenderingContext2D, start: { x: number; y: number }, current: { x: number; y: number }): void {
        const alpha = 0.6 + 0.4 * Math.sin(Date.now() * 0.01);
        
        // グラデーション軌道線
        const gradient = context.createLinearGradient(start.x, start.y, current.x, current.y);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(1, `rgba(255, 215, 0, ${alpha * 0.5})`);
        
        context.strokeStyle = gradient;
        context.lineWidth = 3 + this.dragVisualization.forceIndicator;
        context.lineCap = 'round';
        
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(current.x, current.y);
        context.stroke();
    }
    
    /**
     * 力の強度インジケーター描画
     * @param context - 描画コンテキスト
     * @param start - 開始位置
     * @param current - 現在位置
     */
    private renderForceIndicator(context: CanvasRenderingContext2D, start: { x: number; y: number }, current: { x: number; y: number }): void {
        const intensity = this.dragVisualization.forceIndicator;
        if (intensity < 0.1) return;
        
        // 力の方向矢印
        const dx = current.x - start.x;
        const dy = current.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
            const angle = Math.atan2(dy, dx);
            const arrowSize = 10 + intensity * 5;
            
            context.fillStyle = `rgba(255, 215, 0, ${intensity})`;
            context.save();
            context.translate(current.x, current.y);
            context.rotate(angle);
            
            // 矢印の描画
            context.beginPath();
            context.moveTo(-arrowSize, -arrowSize / 2);
            context.lineTo(0, 0);
            context.lineTo(-arrowSize, arrowSize / 2);
            context.fill();
            
            context.restore();
        }
    }
    
    /**
     * ドラッグパーティクルの描画
     * @param context - 描画コンテキスト
     */
    private renderDragParticles(context: CanvasRenderingContext2D): void {
        this.dragVisualization.particles.forEach(particle => {
            context.save();
            context.globalAlpha = particle.life;
            context.fillStyle = particle.color;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
            context.restore();
        });
    }
    
    /**
     * 対象泡のハイライト描画
     * @param context - 描画コンテキスト
     * @param targetBubble - 対象の泡
     */
    private renderTargetHighlight(context: CanvasRenderingContext2D, targetBubble: Bubble): void {
        const pulseAlpha = 0.3 + 0.3 * Math.sin(Date.now() * 0.005);
        
        context.save();
        context.globalAlpha = pulseAlpha;
        context.strokeStyle = '#FFD700';
        context.lineWidth = 4;
        context.beginPath();
        context.arc(targetBubble.x, targetBubble.y, targetBubble.size + 10, 0, Math.PI * 2);
        context.stroke();
        context.restore();
    }
    
    /**
     * ゲームオーバー画面の描画
     * @param context - 描画コンテキスト
     */
    public renderGameOver(context: CanvasRenderingContext2D): void {
        const canvas = this.gameEngine.canvas;
        
        // 半透明オーバーレイ
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // GAME OVER テキスト
        context.fillStyle = '#FF0000';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowColor = 'rgba(0, 0, 0, 0.8)';
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.shadowBlur = 6;
        context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
        
        // 最終スコア
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 24px Arial';
        context.fillText(`Final Score: ${this.gameEngine.playerData.currentScore.toLocaleString()}`, 
                        canvas.width / 2, canvas.height / 2 + 20);
        
        // 操作説明
        context.fillStyle = '#CCCCCC';
        context.font = '18px Arial';
        context.fillText('Press ESC to return to menu', canvas.width / 2, canvas.height / 2 + 80);
    }
    
    /**
     * ポーズ画面の描画
     * @param context - 描画コンテキスト
     */
    public renderPause(context: CanvasRenderingContext2D): void {
        const canvas = this.gameEngine.canvas;
        
        // 半透明オーバーレイ
        context.fillStyle = 'rgba(0, 0, 0, 0.6)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // PAUSE テキスト
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 36px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowColor = 'rgba(0, 0, 0, 0.8)';
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowBlur = 4;
        context.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        
        // 操作説明
        context.fillStyle = '#CCCCCC';
        context.font = '18px Arial';
        context.fillText('Press SPACE to resume', canvas.width / 2, canvas.height / 2 + 60);
    }
    
    /**
     * 画面エフェクトの更新
     * @param deltaTime - 経過時間
     */
    public updateScreenEffects(deltaTime: number): void {
        // 画面震動の更新
        if (this.gameEngine.screenShakeRemaining > 0) {
            this.gameEngine.screenShakeRemaining -= deltaTime;
            if (this.gameEngine.screenShakeRemaining <= 0) {
                this.gameEngine.screenShakeRemaining = 0;
                this.gameEngine.screenShakeIntensity = 0;
            }
        }
    }
    
    /**
     * 画面震動の開始
     * @param duration - 持続時間
     * @param intensity - 強度
     */
    public startScreenShake(duration: number, intensity: number): void {
        this.gameEngine.screenShakeRemaining = Math.max(this.gameEngine.screenShakeRemaining, duration);
        this.gameEngine.screenShakeIntensity = Math.max(this.gameEngine.screenShakeIntensity, intensity);
    }
    
    /**
     * 視覚化統計の取得
     * @returns 統計情報
     */
    public getVisualizationStats(): VisualizationStats {
        return {
            isDragging: this.dragVisualization.isActive,
            dragParticles: this.dragVisualization.particles.length,
            forceIndicator: this.dragVisualization.forceIndicator,
            screenShakeActive: this.gameEngine.screenShakeRemaining > 0,
            screenShakeIntensity: this.gameEngine.screenShakeIntensity
        };
    }
}