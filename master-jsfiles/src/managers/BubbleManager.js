/**
 * BubbleManager - 泡管理クラス（メインコントローラー）
 * 
 * Main Controller Patternにより、専門化されたコンポーネントを統制します。
 * 泡生成、物理計算、ドラッグ操作、特殊効果を統合管理
 */

import { getPerformanceOptimizer } from '../utils/PerformanceOptimizer.js';
import { BubbleSpawner } from './bubble-manager/BubbleSpawner.js';
import { BubblePhysicsEngine } from './bubble-manager/BubblePhysicsEngine.js';
import { BubbleDragSystem } from './bubble-manager/BubbleDragSystem.js';
import { BubbleEffectProcessor } from './bubble-manager/BubbleEffectProcessor.js';

export class BubbleManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.bubbles = [];
        
        // 専門化されたコンポーネントを初期化
        this.spawner = new BubbleSpawner(gameEngine);
        this.physicsEngine = new BubblePhysicsEngine(gameEngine);
        this.dragSystem = new BubbleDragSystem();
        this.effectProcessor = new BubbleEffectProcessor(gameEngine);
        
        // パフォーマンス最適化
        this.lastCullTime = 0;
        this.cullInterval = 500; // 0.5秒ごとにカリング
        
        // 画面外消滅処理用
        this.offscreenBubbles = new Set();
        this.offscreenTimer = new Map();
    }
    
    /**
     * ステージ設定を適用
     */
    setStageConfig(config) {
        return this.spawner.setStageConfig(config);
    }
    
    /**
     * 泡を生成
     */
    spawnBubble(type = null, position = null) {
        console.log('[DEBUG] BubbleManager.spawnBubble 呼び出し開始');
        console.log('[DEBUG] this.spawner:', !!this.spawner);
        console.log('[DEBUG] typeof this.spawner.spawnBubble:', typeof (this.spawner && this.spawner.spawnBubble));
        console.log('[DEBUG] type:', type, 'position:', position);
        
        if (!this.spawner) {
            console.error('[DEBUG] spawnerがnullです');
            return null;
        }
        
        if (typeof this.spawner.spawnBubble !== 'function') {
            console.error('[DEBUG] spawner.spawnBubbleメソッドが存在しません');
            return null;
        }
        
        const bubble = this.spawner.spawnBubble(type, position);
        console.log('[DEBUG] spawner.spawnBubble結果:', !!bubble);
        
        if (bubble) {
            console.log('[DEBUG] バブルをbubblesに追加:', bubble.id || 'ID不明');
            this.bubbles.push(bubble);
        } else {
            console.warn('[DEBUG] spawnerからnullのバブルが返されました');
        }
        
        return bubble;
    }
    
    /**
     * 特定の泡を強制生成
     */
    spawnSpecificBubble(type, position = null) {
        return this.spawner.spawnSpecificBubble(type, position);
    }
    
    /**
     * マウス位置を更新
     */
    updateMousePosition(x, y) {
        this.physicsEngine.updateMousePosition(x, y);
    }
    
    /**
     * 更新処理（統合版）
     */
    update(deltaTime) {
        // デバッグ情報（10秒間隔）
        if (!this.lastUpdateDebugTime || performance.now() - this.lastUpdateDebugTime > 10000) {
            console.log(`[DEBUG] BubbleManager.update: バブル数=${this.bubbles.length}, deltaTime=${deltaTime.toFixed(2)}ms`);
            console.log(`[DEBUG] spawner=${!!this.spawner}, physicsEngine=${!!this.physicsEngine}`);
            this.lastUpdateDebugTime = performance.now();
        }
        
        // 自動生成チェック
        const shouldSpawn = this.spawner.updateSpawnTimer(deltaTime, this.bubbles.length);
        if (shouldSpawn) {
            console.log(`[DEBUG] Spawning bubble - current count: ${this.bubbles.length}`);
            this.spawnBubble();
        }
        
        // 泡の更新（統合された物理システム）
        this.bubbles.forEach((bubble) => {
            this.physicsEngine.updateBubble(bubble, deltaTime);
            this.physicsEngine.handleOffscreenBubble(bubble, deltaTime, this.offscreenBubbles, this.offscreenTimer);
            
            // 自動破裂チェック
            this.effectProcessor.checkAutoBurst(bubble);
            
            // 基本更新
            bubble.update(deltaTime, this.physicsEngine.mousePosition);
        });
        
        // 削除予定の泡を除去とプール返却
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            if (!bubble.isAlive) {
                console.log(`[DEBUG] Removing bubble: age=${bubble.age}, maxAge=${bubble.maxAge}`);
                
                // 破裂した泡はダメージを与える
                if (bubble.age >= bubble.maxAge) {
                    this.gameEngine.playerData.takeDamage(5);
                }
                
                // プールに戻す
                this.gameEngine.returnBubbleToPool(bubble);
                this.bubbles.splice(i, 1);
            }
        }
        
        // 定期的なカリング処理（パフォーマンス最適化）
        if (Date.now() - this.lastCullTime > this.cullInterval) {
            this.performCulling();
            this.lastCullTime = Date.now();
        }
        
        // 画面外タイマーのクリーンアップ
        this.cleanupOffscreenTimers();
    }
    
    /**
     * パフォーマンス向上のためのカリング処理
     */
    performCulling() {
        const performanceOptimizer = getPerformanceOptimizer();
        if (this.bubbles.length <= performanceOptimizer.getMaxBubbles()) {
            return; // 制限内なのでカリング不要
        }
        
        // 優先度の低い泡を削除
        const bubblesWithPriority = this.bubbles.map((bubble, index) => ({
            bubble,
            index,
            priority: this.calculateBubblePriority(bubble)
        }));
        
        // 優先度順にソート（低い順）
        bubblesWithPriority.sort((a, b) => a.priority - b.priority);
        
        // 下位の泡を削除
        const targetCount = performanceOptimizer.getMaxBubbles();
        const toRemove = this.bubbles.length - targetCount;
        
        for (let i = 0; i < toRemove; i++) {
            const item = bubblesWithPriority[i];
            this.gameEngine.returnBubbleToPool(item.bubble);
            this.bubbles.splice(item.index, 1);
        }
        
        console.log(`Culled ${toRemove} bubbles for performance`);
    }
    
    /**
     * 泡の優先度を計算（低いほど削除対象）
     */
    calculateBubblePriority(bubble) {
        let priority = 0;
        
        // 画面内の泡は高優先度
        if (this.physicsEngine.isBubbleVisible(bubble)) {
            priority += 100;
        }
        
        // レア泡は高優先度
        const rareTypes = ['rainbow', 'pink', 'clock', 'score', 'diamond', 'boss'];
        if (rareTypes.includes(bubble.type)) {
            priority += 50;
        }
        
        // 新しい泡は高優先度
        priority += Math.max(0, 50 - bubble.age / 200);
        
        // マウスに近い泡は高優先度
        const distance = Math.sqrt(
            Math.pow(bubble.position.x - this.physicsEngine.mousePosition.x, 2) +
            Math.pow(bubble.position.y - this.physicsEngine.mousePosition.y, 2)
        );
        priority += Math.max(0, 50 - distance / 10);
        
        return priority;
    }
    
    /**
     * 画面外タイマーのクリーンアップ
     */
    cleanupOffscreenTimers() {
        // 既に削除された泡のタイマーを削除
        for (const [bubble, timer] of this.offscreenTimer.entries()) {
            if (!bubble.isAlive) {
                this.offscreenBubbles.delete(bubble);
                this.offscreenTimer.delete(bubble);
            }
        }
    }
    
    /**
     * 泡を描画
     */
    render(context) {
        const performanceOptimizer = getPerformanceOptimizer();
        const renderQuality = performanceOptimizer.getRenderQuality();
        
        // デバッグ情報を出力（5秒間隔）
        if (!this.lastDebugTime || performance.now() - this.lastDebugTime > 5000) {
            console.log(`[DEBUG] BubbleManager.render: 泡の数=${this.bubbles.length}, renderQuality=${renderQuality}`);
            if (this.bubbles.length > 0) {
                const bubble = this.bubbles[0];
                console.log(`[DEBUG] 最初の泡: type=${bubble.type}, position=(${bubble.x}, ${bubble.y}), visible=${this.physicsEngine.isBubbleVisible(bubble)}`);
            }
            this.lastDebugTime = performance.now();
        }
        
        let renderedCount = 0;
        
        // 低品質モードでは一部の泡のみレンダリング
        if (renderQuality < 0.8) {
            const step = Math.ceil(1 / renderQuality);
            this.bubbles.forEach((bubble, index) => {
                if (index % step === 0 && this.physicsEngine.isBubbleVisible(bubble)) {
                    bubble.render(context);
                    renderedCount++;
                }
            });
        } else {
            // 高品質モードでは全ての可視泡をレンダリング
            this.bubbles.forEach(bubble => {
                if (this.physicsEngine.isBubbleVisible(bubble)) {
                    bubble.render(context);
                    renderedCount++;
                }
            });
        }
        
        // レンダリング統計
        if (!this.lastDebugTime || performance.now() - this.lastDebugTime > 5000) {
            console.log(`[DEBUG] レンダリングした泡の数: ${renderedCount}/${this.bubbles.length}`);
        }
        
        // ドラッグ軌跡の描画（デバッグ用、高品質モードのみ）
        this.dragSystem.renderDragTrail(context, renderQuality);
    }
    
    /**
     * クリック処理
     */
    handleClick(x, y) {
        // 最前面の泡を検索
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            
            if (bubble.containsPoint(x, y)) {
                this.popBubble(bubble, x, y);
                return true;
            }
        }
        
        // 空振りの場合、コンボをリセット
        this.gameEngine.scoreManager.resetCombo();
        return false;
    }
    
    /**
     * 泡を割る
     */
    popBubble(bubble, x, y) {
        console.log(`${bubble.type} bubble popped`);
        
        // 幻の泡のすり抜け判定
        if (bubble.type === 'phantom') {
            const config = bubble.getTypeConfig();
            if (Math.random() < config.phaseChance) {
                console.log('Phantom bubble phased through click!');
                return false; // すり抜けた
            }
        }
        
        // 泡の効果を処理
        this.effectProcessor.processBubbleEffect(bubble, x, y);
        
        // コンボを更新
        this.gameEngine.scoreManager.updateCombo();
        
        // スコアを加算
        const score = bubble.getScore();
        this.gameEngine.scoreManager.addScore(score);
        
        // 新しいエフェクトシステムで爆発エフェクトを作成
        if (this.gameEngine.createExplosion) {
            this.gameEngine.createExplosion(x, y, bubble.type, bubble.size, 1);
        }
        
        // プールに戻す
        this.gameEngine.returnBubbleToPool(bubble);
        this.bubbles.splice(this.bubbles.indexOf(bubble), 1);
        return true; // 正常に割れた
    }
    
    /**
     * ドラッグ開始処理
     */
    handleDragStart(x, y) {
        return this.dragSystem.handleDragStart(this.bubbles, x, y);
    }
    
    /**
     * ドラッグ移動処理
     */
    handleDragMove(x, y) {
        return this.dragSystem.handleDragMove(x, y);
    }
    
    /**
     * ドラッグ終了処理
     */
    handleDragEnd(startX, startY, endX, endY) {
        return this.dragSystem.handleDragEnd(startX, startY, endX, endY, this.physicsEngine);
    }
    
    /**
     * パス上のバブルを取得
     */
    getBubblesAlongPath(startPos, endPos) {
        return this.physicsEngine.getBubblesAlongPath(this.bubbles, startPos, endPos);
    }
    
    /**
     * 指定範囲内のバブルを取得
     */
    getBubblesInRadius(x, y, radius) {
        return this.physicsEngine.getBubblesInRadius(this.bubbles, x, y, radius);
    }
    
    /**
     * 全ての泡をクリア
     */
    clearAllBubbles() {
        // すべての泡をプールに戻す
        this.bubbles.forEach(bubble => {
            this.gameEngine.returnBubbleToPool(bubble);
        });
        this.bubbles = [];
        this.dragSystem.resetDrag();
        this.offscreenBubbles.clear();
        this.offscreenTimer.clear();
        console.log('All bubbles cleared');
    }
    
    /**
     * 泡の数を取得
     */
    getBubbleCount() {
        return this.bubbles.length;
    }
    
    /**
     * アクティブな泡を取得
     */
    getActiveBubbles() {
        return this.bubbles.filter(bubble => bubble.isAlive);
    }
    
    /**
     * 特殊な泡の生成率を設定
     */
    setSpecialSpawnRate(bubbleType, rate) {
        this.spawner.setSpecialSpawnRate(bubbleType, rate);
    }
    
    /**
     * テスト用バブルの追加（デバッグツール用）
     */
    addTestBubble(bubbleData) {
        const bubble = this.spawner.addTestBubble(bubbleData);
        if (bubble) {
            this.bubbles.push(bubble);
            return true;
        }
        return false;
    }
    
    /**
     * 複数のテストバブルを一度に追加
     */
    addTestBubbles(bubblesData) {
        const bubbles = this.spawner.addTestBubbles(bubblesData);
        this.bubbles.push(...bubbles);
        return bubbles.length;
    }
    
    /**
     * テスト用バブルの削除（IDまたは条件による）
     */
    removeTestBubbles(condition) {
        let removedCount = 0;
        
        if (typeof condition === 'string') {
            // IDによる削除
            this.bubbles = this.bubbles.filter(bubble => {
                if (bubble.id === condition) {
                    removedCount++;
                    return false;
                }
                return true;
            });
        } else if (typeof condition === 'function') {
            // 条件関数による削除
            this.bubbles = this.bubbles.filter(bubble => {
                if (condition(bubble)) {
                    removedCount++;
                    return false;
                }
                return true;
            });
        } else if (condition === 'all') {
            // 全削除
            removedCount = this.bubbles.length;
            this.bubbles = [];
        }

        return removedCount;
    }
    
    /**
     * テスト用バブル情報の取得
     */
    getTestBubbleInfo() {
        return {
            total: this.bubbles.length,
            byType: this.bubbles.reduce((acc, bubble) => {
                acc[bubble.type] = (acc[bubble.type] || 0) + 1;
                return acc;
            }, {}),
            positions: this.bubbles.map(bubble => ({
                id: bubble.id,
                type: bubble.type,
                x: bubble.position.x,
                y: bubble.position.y,
                health: bubble.health
            }))
        };
    }
}