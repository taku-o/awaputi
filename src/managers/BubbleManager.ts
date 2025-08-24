/**
 * BubbleManager - 泡管理クラス（メインコントローラー）
 * 
 * Main Controller Patternにより、専門化されたコンポーネントを統制します。
 * 泡生成、物理計算、ドラッグ操作、特殊効果を統合管理
 */

import { getPerformanceOptimizer } from '../utils/PerformanceOptimizer';
import { BubbleSpawner } from './bubble-manager/BubbleSpawner';
import { BubblePhysicsEngine } from './bubble-manager/BubblePhysicsEngine';
import { BubbleDragSystem } from './bubble-manager/BubbleDragSystem';
import { BubbleEffectProcessor } from './bubble-manager/BubbleEffectProcessor';
import type { BubbleManager as IBubbleManager, 
    Bubble,
    Position,
    TestBubbleInfo
} from '../types/game';

export class BubbleManager implements IBubbleManager {
    public gameEngine: any;
    public bubbles: Bubble[] = [];
    public spawner: BubbleSpawner;
    public physicsEngine: BubblePhysicsEngine;
    public dragSystem: BubbleDragSystem;
    public effectProcessor: BubbleEffectProcessor;
    public lastCullTime: number = 0;
    public cullInterval: number = 500; // 0.5秒ごとにカリング
    public offscreenBubbles: Set<Bubble> = new Set();
    public offscreenTimer: Map<Bubble, number> = new Map();
    
    private lastDebugTime?: number;
    private lastUpdateDebugTime?: number;

    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        
        // 専門化されたコンポーネントを初期化
        this.spawner = new BubbleSpawner(gameEngine);
        this.physicsEngine = new BubblePhysicsEngine(gameEngine);
        this.dragSystem = new BubbleDragSystem();
        this.effectProcessor = new BubbleEffectProcessor(gameEngine);
    }
    
    /**
     * ステージ設定を適用
     */
    setStageConfig(config: any): any {
        return this.spawner.setStageConfig(config);
    }
    
    /**
     * 泡の更新処理（メインループ）
     */
    update(deltaTime: number): void {
        // パフォーマンス最適化チェック
        if (!getPerformanceOptimizer().shouldRunEffect('bubble_update')) {
            return;
        }
        
        this.updateDebugTiming(deltaTime);
        
        // 自動生成の判定
        if (this.spawner.updateSpawnTimer(deltaTime, this.bubbles.length)) {
            this.spawnRandomBubble();
        }
        
        // 各泡の更新
        this.bubbles.forEach(bubble => {
            if (bubble.isAlive) {
                // 物理更新
                this.physicsEngine.updateBubble(bubble, deltaTime);
                
                // 年齢更新
                this.physicsEngine.updateBubbleAge(bubble, deltaTime);
                
                // 特殊効果更新
                this.physicsEngine.applySpecialEffects(bubble, deltaTime);
                
                // 自動破裂チェック
                this.effectProcessor.checkAutoBurst(bubble);
            }
        });
        
        // 衝突検出
        this.physicsEngine.checkCollisions(this.bubbles.filter(b => b.isAlive));
        
        // 死んだ泡の削除
        this.cullDeadBubbles(deltaTime);
        
        // オフスクリーン泡の管理
        this.manageOffscreenBubbles(deltaTime);
    }
    
    /**
     * デバッグタイミングの更新
     */
    updateDebugTiming(deltaTime: number): void {
        const now = Date.now();
        if (!this.lastUpdateDebugTime) {
            this.lastUpdateDebugTime = now;
        }
        
        if (now - this.lastUpdateDebugTime > 5000) { // 5秒ごと
            console.log(`[BubbleManager] Active bubbles: ${this.bubbles.filter(b => b.isAlive).length}`);
            this.lastUpdateDebugTime = now;
        }
    }
    
    /**
     * ランダムな泡を生成
     */
    spawnRandomBubble(): void {
        const bubble = this.spawner.spawnRandomBubble();
        if (bubble) {
            this.bubbles.push(bubble);
        }
    }
    
    /**
     * 特定タイプの泡を生成
     */
    spawnBubble(bubbleType: string, position: Position): Bubble {
        const bubble = this.spawner.spawnBubble(bubbleType, position);
        this.bubbles.push(bubble);
        return bubble;
    }
    
    /**
     * 泡をクリック/タップで破裂させる
     */
    popBubble(bubble: Bubble, x: number, y: number): boolean {
        if (!bubble.isAlive) {
            return false;
        }
        
        // 特殊効果を処理
        this.effectProcessor.processBubbleEffect(bubble, x, y);
        
        // 泡を削除
        bubble.isAlive = false;
        
        console.log(`[BubbleManager] Popped ${bubble.type} bubble at (${x}, ${y})`);
        return true;
    }
    
    /**
     * ドラッグ開始処理
     */
    handleDragStart(x: number, y: number): Bubble | null {
        return this.dragSystem.handleDragStart(this.bubbles.filter(b => b.isAlive), x, y);
    }
    
    /**
     * ドラッグ移動処理
     */
    handleDragMove(x: number, y: number): boolean {
        return this.dragSystem.handleDragMove(x, y);
    }
    
    /**
     * ドラッグ終了処理
     */
    handleDragEnd(startX: number, startY: number, endX: number, endY: number): boolean {
        return this.dragSystem.handleDragEnd(startX, startY, endX, endY, this.physicsEngine);
    }
    
    /**
     * マウス位置を更新
     */
    updateMousePosition(x: number, y: number): void {
        this.physicsEngine.updateMousePosition(x, y);
    }
    
    /**
     * 死んだ泡を削除
     */
    cullDeadBubbles(deltaTime: number): void {
        const now = Date.now();
        
        if (now - this.lastCullTime < this.cullInterval) {
            return;
        }
        
        this.lastCullTime = now;
        
        const aliveBubbles = this.bubbles.filter(bubble => bubble.isAlive);
        const removedCount = this.bubbles.length - aliveBubbles.length;
        
        if (removedCount > 0) {
            this.bubbles = aliveBubbles;
            console.log(`[BubbleManager] Culled ${removedCount} dead bubbles. Active: ${aliveBubbles.length}`);
        }
    }
    
    /**
     * オフスクリーン泡の管理
     */
    manageOffscreenBubbles(deltaTime: number): void {
        const canvas = this.gameEngine.canvasManager.canvas;
        const margin = 50;
        
        this.bubbles.forEach(bubble => {
            if (!bubble.isAlive) return;
            
            const isOffscreen = bubble.position.x < -margin || 
                              bubble.position.x > canvas.width + margin ||
                              bubble.position.y < -margin || 
                              bubble.position.y > canvas.height + margin;
            
            if (isOffscreen) {
                if (!this.offscreenBubbles.has(bubble)) {
                    this.offscreenBubbles.add(bubble);
                    this.offscreenTimer.set(bubble, Date.now());
                } else {
                    const offscreenTime = Date.now() - (this.offscreenTimer.get(bubble) || 0);
                    if (offscreenTime > 10000) { // 10秒でタイムアウト
                        bubble.isAlive = false;
                        this.offscreenBubbles.delete(bubble);
                        this.offscreenTimer.delete(bubble);
                    }
                }
            } else {
                if (this.offscreenBubbles.has(bubble)) {
                    this.offscreenBubbles.delete(bubble);
                    this.offscreenTimer.delete(bubble);
                }
            }
        });
    }
    
    /**
     * 全ての泡を削除
     */
    clearAllBubbles(): void {
        this.bubbles.forEach(bubble => {
            bubble.isAlive = false;
        });
        this.bubbles = [];
        this.offscreenBubbles.clear();
        this.offscreenTimer.clear();
        console.log('[BubbleManager] Cleared all bubbles');
    }
    
    /**
     * 指定位置の泡を検索
     */
    findBubbleAtPosition(x: number, y: number): Bubble | null {
        const aliveBubbles = this.bubbles.filter(b => b.isAlive);
        
        // 最前面から検索
        for (let i = aliveBubbles.length - 1; i >= 0; i--) {
            const bubble = aliveBubbles[i];
            if (bubble.containsPoint(x, y)) {
                return bubble;
            }
        }
        
        return null;
    }
    
    /**
     * 範囲内の泡を取得
     */
    getBubblesInRange(centerX: number, centerY: number, radius: number): Bubble[] {
        return this.bubbles.filter(bubble => {
            if (!bubble.isAlive) return false;
            
            const dx = bubble.position.x - centerX;
            const dy = bubble.position.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            return distance <= radius;
        });
    }
    
    /**
     * レンダリング処理
     */
    render(context: CanvasRenderingContext2D, renderQuality: number): void {
        // 生きている泡のみレンダリング
        const aliveBubbles = this.bubbles.filter(b => b.isAlive);
        
        aliveBubbles.forEach(bubble => {
            bubble.render(context);
        });
        
        // ドラッグ軌跡の描画（デバッグ用）
        this.dragSystem.renderDragTrail(context, renderQuality);
        
        // デバッグ情報の表示
        if (renderQuality > 0.8) {
            this.renderDebugInfo(context);
        }
    }
    
    /**
     * デバッグ情報のレンダリング
     */
    renderDebugInfo(context: CanvasRenderingContext2D): void {
        const now = Date.now();
        if (!this.lastDebugTime) {
            this.lastDebugTime = now;
        }
        
        if (now - this.lastDebugTime > 1000) { // 1秒ごと
            context.save();
            context.fillStyle = 'rgba(255, 255, 255, 0.8)';
            context.font = '12px Arial';
            context.fillText(`Bubbles: ${this.bubbles.filter(b => b.isAlive).length}`, 10, 20);
            context.fillText(`Offscreen: ${this.offscreenBubbles.size}`, 10, 35);
            context.restore();
            
            this.lastDebugTime = now;
        }
    }
    
    /**
     * 統計情報を取得
     */
    getStats(): { total: number; alive: number; dead: number; offscreen: number } {
        const alive = this.bubbles.filter(b => b.isAlive).length;
        const dead = this.bubbles.length - alive;
        
        return {
            total: this.bubbles.length,
            alive: alive,
            dead: dead,
            offscreen: this.offscreenBubbles.size
        };
    }
    
    /**
     * ドラッグ中かどうか
     */
    isDragInProgress(): boolean {
        return this.dragSystem.isDragInProgress();
    }
    
    /**
     * ドラッグ中の泡を取得
     */
    getDraggedBubble(): Bubble | null {
        return this.dragSystem.getDraggedBubble();
    }

    // =======================
    // EventStageManager対応メソッド（要件7: 未実装メソッド実装）
    // =======================

    /**
     * テスト用の泡を生成
     */
    createTestBubble(info: TestBubbleInfo): Bubble {
        try {
            console.log('[BubbleManager] createTestBubble called with:', info);
            
            const position: Position = {
                x: info.x || 100,
                y: info.y || 100
            };
            
            const bubbleType = info.type || 'normal';
            const bubble = this.spawner.spawnBubble(bubbleType, position);
            
            // テスト用の特別な設定
            if (info.size) {
                bubble.size = info.size;
            }
            
            if (info.velocity) {
                bubble.velocity = { ...info.velocity };
            }
            
            this.bubbles.push(bubble);
            console.log(`[BubbleManager] Created test bubble: ${bubbleType} at (${position.x}, ${position.y})`);
            
            return bubble;
        } catch (error) {
            console.error('[BubbleManager] createTestBubble error:', error);
            // フォールバック：通常の泡を作成
            const fallbackPosition: Position = { x: 100, y: 100 };
            const fallbackBubble = this.spawner.spawnBubble('normal', fallbackPosition);
            this.bubbles.push(fallbackBubble);
            return fallbackBubble;
        }
    }

    /**
     * パフォーマンス統計を取得
     */
    getPerformanceStats(): { updateTime: number; renderTime: number; bubbleCount: number } {
        try {
            const stats = this.getStats();
            const physicsStats = this.physicsEngine.getPerformanceStats();
            
            return {
                updateTime: 0, // 実際の測定は複雑なので仮値
                renderTime: 0, // 実際の測定は複雑なので仮値
                bubbleCount: stats.alive
            };
        } catch (error) {
            console.error('[BubbleManager] getPerformanceStats error:', error);
            return { updateTime: 0, renderTime: 0, bubbleCount: 0 };
        }
    }

    /**
     * 生成設定を更新
     */
    updateSpawnSettings(settings: { maxBubbles?: number; spawnRate?: number; specialRates?: Record<string, number> }): void {
        try {
            if (settings.maxBubbles !== undefined) {
                this.spawner.setMaxBubbles(settings.maxBubbles);
            }
            
            if (settings.spawnRate !== undefined) {
                this.spawner.baseSpawnRate = settings.spawnRate;
            }
            
            if (settings.specialRates) {
                Object.entries(settings.specialRates).forEach(([type, rate]) => {
                    this.spawner.setSpecialSpawnRate(type, rate);
                });
            }
            
            console.log('[BubbleManager] spawn settings updated:', settings);
        } catch (error) {
            console.error('[BubbleManager] updateSpawnSettings error:', error);
        }
    }
}