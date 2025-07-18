import { Bubble } from '../bubbles/Bubble.js';
import { performanceOptimizer } from '../utils/PerformanceOptimizer.js';

/**
 * 泡管理クラス - パフォーマンス最適化対応
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
        
        // ドラッグ関連
        this.draggedBubble = null;
        this.isDragging = false;
        this.dragStartPosition = { x: 0, y: 0 };
        this.dragHistory = []; // ドラッグ履歴（速度計算用）
        
        // パフォーマンス最適化
        this.lastCullTime = 0;
        this.cullInterval = 500; // 0.5秒ごとにカリング
        this.offscreenTimeout = new Map(); // 画面外タイムアウト管理
    }
    
    /**
     * 泡を生成
     */
    spawnBubble(type = null, position = null) {
        // パフォーマンス最適化による制限
        const maxBubbles = Math.min(this.maxBubbles, performanceOptimizer.getMaxBubbles());
        
        if (this.bubbles.length >= maxBubbles) {
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
        
        // プールから泡を取得するか新規作成
        let bubble;
        const pooledBubble = this.gameEngine.getBubbleFromPool();
        if (pooledBubble) {
            // プールされた泡を再初期化
            Object.assign(pooledBubble, {
                type: type,
                position: { ...position },
                velocity: { x: 0, y: 0 },
                size: 50,
                health: this.getBubbleHealthByType(type),
                maxHealth: this.getBubbleHealthByType(type),
                age: 0,
                maxAge: 10000,
                isAlive: true,
                effects: [],
                clickCount: 0,
                isEscaping: false,
                escapeSpeed: 0,
                lastMouseDistance: Infinity
            });
            bubble = pooledBubble;
        } else {
            bubble = new Bubble(type, position);
        }
        
        this.bubbles.push(bubble);
        return bubble;
    }
    
    /**
     * 泡の種類による初期体力を取得
     */
    getBubbleHealthByType(type) {
        const healthMap = {
            'normal': 1,
            'stone': 2,
            'iron': 3,
            'diamond': 5,
            'boss': 10
        };
        return healthMap[type] || 1;
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
        
        const bubble = this.spawnBubble(type, position);
        if (bubble) {
            console.log(`Spawned specific bubble: ${type}`);
        }
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
        // パフォーマンス調整されたデルタタイムを使用
        const adjustedDeltaTime = performanceOptimizer.adjustUpdateFrequency(deltaTime);
        
        // 自動生成（パフォーマンスレベルに応じて調整）
        this.spawnTimer += adjustedDeltaTime;
        const adjustedSpawnInterval = this.spawnInterval * (2 - performanceOptimizer.getEffectQuality());
        
        if (this.spawnTimer >= adjustedSpawnInterval) {
            this.spawnBubble();
            this.spawnTimer = 0;
        }
        
        // 全ての泡を更新（フラスタムカリング適用）
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            
            // パフォーマンス最適化: 画面外の泡は更新頻度を下げる
            const isVisible = this.isBubbleVisible(bubble);
            const updateDelta = isVisible ? adjustedDeltaTime : adjustedDeltaTime * 2;
            
            bubble.update(updateDelta, this.mousePosition);
            
            // 死んだ泡を削除
            if (!bubble.isAlive) {
                // 破裂した泡はダメージを与える
                if (bubble.age >= bubble.maxAge) {
                    this.gameEngine.playerData.takeDamage(5);
                }
                
                // プールに戻す
                this.gameEngine.returnBubbleToPool(bubble);
                this.bubbles.splice(i, 1);
            }
        }
        
        // 定期的なカリング処理
        if (Date.now() - this.lastCullTime > this.cullInterval) {
            this.performCulling();
            this.lastCullTime = Date.now();
        }
        
        // 画面外に出た特定の泡をチェック
        this.checkOffScreenBubbles();
    }
    
    /**
     * 泡が画面内にあるかチェック
     */
    isBubbleVisible(bubble) {
        const margin = 100;
        return (
            bubble.position.x > -margin &&
            bubble.position.x < 800 + margin &&
            bubble.position.y > -margin &&
            bubble.position.y < 600 + margin
        );
    }
    
    /**
     * パフォーマンス向上のためのカリング処理
     */
    performCulling() {
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
        if (this.isBubbleVisible(bubble)) {
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
            Math.pow(bubble.position.x - this.mousePosition.x, 2) +
            Math.pow(bubble.position.y - this.mousePosition.y, 2)
        );
        priority += Math.max(0, 50 - distance / 10);
        
        return priority;
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
        // レンダリング品質に応じて処理を調整
        const renderQuality = performanceOptimizer.getRenderQuality();
        
        // 低品質モードでは一部の泡のみレンダリング
        if (renderQuality < 0.8) {
            const step = Math.ceil(1 / renderQuality);
            this.bubbles.forEach((bubble, index) => {
                if (index % step === 0 && this.isBubbleVisible(bubble)) {
                    bubble.render(context);
                }
            });
        } else {
            // 高品質モードでは全ての可視泡をレンダリング
            this.bubbles.forEach(bubble => {
                if (this.isBubbleVisible(bubble)) {
                    bubble.render(context);
                }
            });
        }
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
                    this.applyEffects(effects, bubble.position);
                    
                    // コンボ更新
                    this.gameEngine.scoreManager.updateCombo();
                    
                    // プールに戻す
                    this.gameEngine.returnBubbleToPool(bubble);
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
    applyEffects(effects, position) {
        effects.forEach(effect => {
            // パフォーマンス最適化: エフェクトの実行可否を判定
            if (!performanceOptimizer.shouldRunEffect(effect.type)) {
                return;
            }
            
            switch (effect.type) {
                case 'heal':
                    this.gameEngine.playerData.heal(effect.amount);
                    this.showFloatingText(`+${effect.amount} HP`, '#00FF00', position);
                    break;
                    
                case 'damage':
                    this.gameEngine.playerData.takeDamage(effect.amount);
                    this.showFloatingText(`-${effect.amount} HP`, '#FF0000', position);
                    break;
                    
                case 'chain_destroy':
                    this.handleChainDestroy(effect.position, effect.radius);
                    this.showFloatingText('連鎖破壊!', '#FF6347', position);
                    break;
                    
                case 'bonus_time':
                    this.gameEngine.activateBonusTime(effect.duration);
                    this.showFloatingText('ボーナスタイム!', '#FF69B4', position);
                    break;
                    
                case 'time_stop':
                    this.gameEngine.activateTimeStop(effect.duration);
                    this.showFloatingText('時間停止!', '#FFD700', position);
                    break;
                    
                case 'bonus_score':
                    this.gameEngine.scoreManager.addScore(effect.amount);
                    this.showFloatingText(`+${effect.amount} ボーナス!`, '#32CD32', position);
                    break;
                    
                case 'screen_shake':
                    this.gameEngine.activateScreenShake(effect.intensity, effect.duration);
                    this.showFloatingText('ビリビリ!', '#FFFF00', position);
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
                this.applyEffects(filteredEffects, bubble.position);
                
                bubblesDestroyed.push(bubble);
                this.gameEngine.returnBubbleToPool(bubble);
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
    showFloatingText(text, color, position) {
        // FloatingTextManagerが利用可能な場合は使用
        if (this.gameEngine.floatingTextManager) {
            this.gameEngine.floatingTextManager.addText(
                position.x, position.y, text, { color: color }
            );
        } else {
            // フォールバック
            console.log(`Effect: ${text} at (${Math.round(position.x)}, ${Math.round(position.y)})`);
        }
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
        this.offscreenTimeout.clear();
    }
    
    /**
     * 泡の数を取得
     */
    getBubbleCount() {
        return this.bubbles.length;
    }
    
    /**
     * ドラッグ開始処理
     */
    handleDragStart(x, y) {
        // ドラッグ対象の泡を検索
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            
            if (bubble.containsPoint(x, y)) {
                this.draggedBubble = bubble;
                this.isDragging = true;
                this.dragStartPosition = { x, y };
                this.dragHistory = [{ x, y, time: Date.now() }];
                
                console.log(`Drag started on ${bubble.type} bubble`);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * ドラッグ移動処理
     */
    handleDragMove(x, y) {
        if (!this.isDragging) return false;
        
        // ドラッグ履歴を記録（速度計算用）
        this.dragHistory.push({ x, y, time: Date.now() });
        
        // 履歴サイズを制限
        if (this.dragHistory.length > 10) {
            this.dragHistory.shift();
        }
        
        return true;
    }
    
    /**
     * ドラッグ履歴から速度を計算
     */
    calculateVelocityFromHistory() {
        if (this.dragHistory.length < 2) return { x: 0, y: 0 };
        
        const recent = this.dragHistory[this.dragHistory.length - 1];
        const previous = this.dragHistory[this.dragHistory.length - 2];
        
        const timeDiff = Math.max(recent.time - previous.time, 1);
        const velocity = {
            x: (recent.x - previous.x) / timeDiff * 1000, // px/s
            y: (recent.y - previous.y) / timeDiff * 1000
        };
        
        return velocity;
    }
    
    /**
     * ドラッグ終了処理 - 泡を吹き飛ばす
     */
    handleDragEnd(startX, startY, endX, endY) {
        if (!this.isDragging || !this.draggedBubble) {
            return false;
        }
        
        // ドラッグベクトルを計算
        const dragVector = {
            x: endX - startX,
            y: endY - startY
        };
        
        // ドラッグ距離を計算
        const dragDistance = Math.sqrt(dragVector.x * dragVector.x + dragVector.y * dragVector.y);
        
        // 最小ドラッグ距離をチェック
        if (dragDistance < 20) {
            this.resetDrag();
            return false;
        }
        
        // 履歴から計算した速度を使用（より自然な物理挙動）
        const velocity = this.calculateVelocityFromHistory();
        
        // 泡の種類による重量調整
        const weightMultiplier = this.getBubbleWeightMultiplier(this.draggedBubble.type);
        
        // 速度に重量を適用
        this.draggedBubble.velocity.x = velocity.x / weightMultiplier;
        this.draggedBubble.velocity.y = velocity.y / weightMultiplier;
        
        // 最大速度制限
        const maxVelocity = 1000;
        const currentSpeed = Math.sqrt(
            this.draggedBubble.velocity.x ** 2 + this.draggedBubble.velocity.y ** 2
        );
        
        if (currentSpeed > maxVelocity) {
            const scale = maxVelocity / currentSpeed;
            this.draggedBubble.velocity.x *= scale;
            this.draggedBubble.velocity.y *= scale;
        }
        
        console.log(`Bubble blown away with velocity: (${Math.round(this.draggedBubble.velocity.x)}, ${Math.round(this.draggedBubble.velocity.y)}), weight: ${weightMultiplier}`);
        
        this.resetDrag();
        return true;
    }
    
    /**
     * 泡の種類による重量倍率を取得
     */
    getBubbleWeightMultiplier(type) {
        const weightMap = {
            'normal': 1.0,
            'stone': 1.5,
            'iron': 2.0,
            'diamond': 3.0,
            'boss': 5.0,
            'pink': 0.8,
            'rainbow': 0.7,
            'electric': 1.2
        };
        return weightMap[type] || 1.0;
    }
    
    /**
     * ドラッグ状態をリセット
     */
    resetDrag() {
        this.isDragging = false;
        this.draggedBubble = null;
        this.dragStartPosition = { x: 0, y: 0 };
        this.dragHistory = [];
    }
    
    /**
     * 画面外に出た泡をチェックして処理
     */
    checkOffScreenBubbles() {
        const canvasWidth = 800;
        const canvasHeight = 600;
        const margin = 100; // 画面外判定のマージン
        
        // 特定の泡タイプは画面外で消滅
        const disappearingTypes = ['rainbow', 'pink', 'clock', 'score', 'electric', 'poison'];
        
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            
            // 画面外判定
            const isOffScreen = (
                bubble.position.x < -margin ||
                bubble.position.x > canvasWidth + margin ||
                bubble.position.y < -margin ||
                bubble.position.y > canvasHeight + margin
            );
            
            if (isOffScreen && disappearingTypes.includes(bubble.type)) {
                // タイムアウト管理で即座に削除せず少し待つ
                const bubbleId = `${bubble.position.x}_${bubble.position.y}_${bubble.type}`;
                
                if (!this.offscreenTimeout.has(bubbleId)) {
                    this.offscreenTimeout.set(bubbleId, Date.now());
                } else {
                    const timeoutStart = this.offscreenTimeout.get(bubbleId);
                    if (Date.now() - timeoutStart > 2000) { // 2秒後に削除
                        console.log(`${bubble.type} bubble disappeared off-screen`);
                        this.gameEngine.returnBubbleToPool(bubble);
                        this.bubbles.splice(i, 1);
                        this.offscreenTimeout.delete(bubbleId);
                    }
                }
            } else {
                // 画面内に戻った場合はタイムアウトをクリア
                const bubbleId = `${bubble.position.x}_${bubble.position.y}_${bubble.type}`;
                this.offscreenTimeout.delete(bubbleId);
            }
        }
    }
}