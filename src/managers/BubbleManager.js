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
        
        // ドラッグ関連の拡張
        this.draggedBubble = null;
        this.isDragging = false;
        this.dragStartPosition = { x: 0, y: 0 };
        this.dragCurrentPosition = { x: 0, y: 0 };
        this.dragHistory = []; // ドラッグ軌跡の履歴
        this.dragPhysics = {
            friction: 0.98, // 空気抵抗
            bounce: 0.7,    // 跳ね返り係数
            gravity: 50,    // 重力加速度
            minVelocity: 5  // 最小速度（これ以下で停止）
        };
        
        // 画面外消滅処理用
        this.offscreenBubbles = new Set(); // 画面外に出た泡を追跡
        this.offscreenTimer = new Map();   // 画面外での滞在時間
        this.offscreenTimeout = 3000;      // 3秒で消滅
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
        this.maxBubbles = config.maxBubbles || 20;
        this.baseSpawnRate = config.spawnRate || 1.0;
        
        // 生成間隔を調整
        this.spawnInterval = Math.max(500, 2000 / this.baseSpawnRate);
        
        console.log(`Stage config applied: ${config.name}, max bubbles: ${this.maxBubbles}, spawn rate: ${this.baseSpawnRate}`);
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // 時間停止中は泡の生成と動きを停止
        if (this.gameEngine.isTimeStopped()) {
            return;
        }
        
        // 泡の生成
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnBubble();
        }
        
        // 泡の更新
        this.bubbles.forEach((bubble, index) => {
            this.updateBubble(bubble, deltaTime);
            
            // 画面外判定と処理
            this.handleOffscreenBubble(bubble, deltaTime);
        });
        
        // 削除予定の泡を除去
        this.bubbles = this.bubbles.filter(bubble => bubble.isAlive);
        
        // 画面外タイマーのクリーンアップ
        this.cleanupOffscreenTimers();
    }
    
    /**
     * 個別泡の更新処理（物理計算を含む）
     */
    updateBubble(bubble, deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        
        // 逃げる泡の特殊処理
        if (bubble.type === 'escaping') {
            this.updateEscapingBubble(bubble, deltaSeconds);
        }
        
        // 物理計算
        this.applyPhysics(bubble, deltaSeconds);
        
        // 基本更新
        bubble.update(deltaTime);
        
        // 年齢に基づく自動破裂チェック
        this.checkAutoBurst(bubble);
    }
    
    /**
     * 物理計算を適用
     */
    applyPhysics(bubble, deltaSeconds) {
        // 重力の適用（上向きの速度がある場合のみ）
        if (bubble.velocity.y < 0) {
            bubble.velocity.y += this.dragPhysics.gravity * deltaSeconds;
        }
        
        // 摩擦の適用
        bubble.velocity.x *= this.dragPhysics.friction;
        bubble.velocity.y *= this.dragPhysics.friction;
        
        // 最小速度未満で停止
        const speed = Math.sqrt(bubble.velocity.x * bubble.velocity.x + bubble.velocity.y * bubble.velocity.y);
        if (speed < this.dragPhysics.minVelocity) {
            bubble.velocity.x = 0;
            bubble.velocity.y = 0;
        }
        
        // 位置更新
        bubble.x += bubble.velocity.x * deltaSeconds;
        bubble.y += bubble.velocity.y * deltaSeconds;
        
        // 境界との衝突判定
        this.handleBoundaryCollision(bubble);
    }
    
    /**
     * 境界との衝突判定
     */
    handleBoundaryCollision(bubble) {
        const canvas = this.gameEngine.canvas;
        const radius = bubble.size / 2;
        
        // 左右の境界
        if (bubble.x - radius < 0) {
            bubble.x = radius;
            bubble.velocity.x *= -this.dragPhysics.bounce;
        } else if (bubble.x + radius > canvas.width) {
            bubble.x = canvas.width - radius;
            bubble.velocity.x *= -this.dragPhysics.bounce;
        }
        
        // 上下の境界
        if (bubble.y - radius < 0) {
            bubble.y = radius;
            bubble.velocity.y *= -this.dragPhysics.bounce;
        } else if (bubble.y + radius > canvas.height) {
            bubble.y = canvas.height - radius;
            bubble.velocity.y *= -this.dragPhysics.bounce;
            
            // 地面に着地したら速度を大幅に減衰
            bubble.velocity.x *= 0.3;
            bubble.velocity.y *= 0.1;
        }
    }
    
    /**
     * 逃げる泡の更新処理
     */
    updateEscapingBubble(bubble, deltaSeconds) {
        const dx = bubble.x - this.mousePosition.x;
        const dy = bubble.y - this.mousePosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 一定距離内でマウスから逃げる
        const escapeDistance = 100;
        if (distance < escapeDistance && distance > 0) {
            const escapeForce = 200 * (1 - distance / escapeDistance);
            const escapeDirection = {
                x: dx / distance,
                y: dy / distance
            };
            
            bubble.velocity.x += escapeDirection.x * escapeForce * deltaSeconds;
            bubble.velocity.y += escapeDirection.y * escapeForce * deltaSeconds;
            
            // 最大逃げ速度を制限
            const maxEscapeSpeed = 300;
            const currentSpeed = Math.sqrt(bubble.velocity.x * bubble.velocity.x + bubble.velocity.y * bubble.velocity.y);
            if (currentSpeed > maxEscapeSpeed) {
                bubble.velocity.x = (bubble.velocity.x / currentSpeed) * maxEscapeSpeed;
                bubble.velocity.y = (bubble.velocity.y / currentSpeed) * maxEscapeSpeed;
            }
        }
    }
    
    /**
     * 画面外の泡の処理
     */
    handleOffscreenBubble(bubble, deltaTime) {
        const canvas = this.gameEngine.canvas;
        const margin = bubble.size; // マージンを設けて判定
        
        const isOffscreen = (
            bubble.x < -margin ||
            bubble.x > canvas.width + margin ||
            bubble.y < -margin ||
            bubble.y > canvas.height + margin
        );
        
        if (isOffscreen) {
            // 特定の泡タイプは即座に消滅
            if (this.shouldDisappearOffscreen(bubble.type)) {
                bubble.destroy();
                console.log(`${bubble.type} bubble disappeared offscreen`);
                return;
            }
            
            // その他の泡は時間経過で消滅
            if (!this.offscreenBubbles.has(bubble)) {
                this.offscreenBubbles.add(bubble);
                this.offscreenTimer.set(bubble, 0);
            }
            
            const timer = this.offscreenTimer.get(bubble) + deltaTime;
            this.offscreenTimer.set(bubble, timer);
            
            if (timer >= this.offscreenTimeout) {
                bubble.destroy();
                console.log(`${bubble.type} bubble timed out offscreen`);
            }
        } else {
            // 画面内に戻った場合はタイマーをリセット
            if (this.offscreenBubbles.has(bubble)) {
                this.offscreenBubbles.delete(bubble);
                this.offscreenTimer.delete(bubble);
            }
        }
    }
    
    /**
     * 特定の泡タイプが画面外で即座に消滅するかどうか
     */
    shouldDisappearOffscreen(bubbleType) {
        const disappearTypes = ['rainbow', 'pink', 'clock', 'score', 'electric', 'poison'];
        return disappearTypes.includes(bubbleType);
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
     * ドラッグ開始処理（改良版）
     */
    handleDragStart(x, y) {
        // ドラッグ対象の泡を検索（最前面から）
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            
            if (bubble.containsPoint(x, y)) {
                this.draggedBubble = bubble;
                this.isDragging = true;
                this.dragStartPosition = { x, y };
                this.dragCurrentPosition = { x, y };
                this.dragHistory = [{ x, y, time: Date.now() }];
                
                console.log(`Drag started on ${bubble.type} bubble`);
                return bubble; // 泡オブジェクトを返す
            }
        }
        
        return null;
    }
    
    /**
     * ドラッグ移動処理（新規追加）
     */
    handleDragMove(x, y) {
        if (!this.isDragging || !this.draggedBubble) {
            return false;
        }
        
        this.dragCurrentPosition = { x, y };
        
        // 履歴を記録（最新の5つまで保持）
        this.dragHistory.push({ x, y, time: Date.now() });
        if (this.dragHistory.length > 5) {
            this.dragHistory.shift();
        }
        
        return true;
    }
    
    /**
     * ドラッグ終了処理（改良版）
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
        if (dragDistance < 15) {
            this.resetDrag();
            return false;
        }
        
        // 履歴から速度を計算（より滑らかな投擲）
        const velocity = this.calculateVelocityFromHistory();
        
        // フリック強度を計算
        const flickStrength = this.calculateFlickStrength(dragVector, velocity);
        
        // 力の方向を計算
        const forceDirection = this.calculateForceDirection(dragVector, velocity);
        
        // 泡に物理的な力を適用
        this.applyForceToeBubble(this.draggedBubble, forceDirection, flickStrength);
        
        console.log(`Bubble flicked with strength: ${flickStrength.toFixed(1)}, direction: (${forceDirection.x.toFixed(2)}, ${forceDirection.y.toFixed(2)})`);
        
        this.resetDrag();
        return true;
    }
    
    /**
     * 履歴から速度を計算
     */
    calculateVelocityFromHistory() {
        if (this.dragHistory.length < 2) {
            return { x: 0, y: 0 };
        }
        
        const recent = this.dragHistory[this.dragHistory.length - 1];
        const previous = this.dragHistory[this.dragHistory.length - 2];
        const timeDiff = Math.max(recent.time - previous.time, 1); // ゼロ除算防止
        
        return {
            x: (recent.x - previous.x) / timeDiff * 1000, // ピクセル/秒
            y: (recent.y - previous.y) / timeDiff * 1000
        };
    }
    
    /**
     * フリック強度を計算
     */
    calculateFlickStrength(dragVector, velocity) {
        const dragDistance = Math.sqrt(dragVector.x * dragVector.x + dragVector.y * dragVector.y);
        const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        // ドラッグ距離と速度の両方を考慮
        const distanceComponent = Math.min(dragDistance / 30, 10); // 最大10倍
        const velocityComponent = Math.min(velocityMagnitude / 100, 5); // 最大5倍
        
        return Math.max(1, distanceComponent * 0.7 + velocityComponent * 0.3) * 250; // 基本力250
    }
    
    /**
     * 力の方向を計算
     */
    calculateForceDirection(dragVector, velocity) {
        // ドラッグベクトルと速度ベクトルを合成
        const combinedVector = {
            x: dragVector.x * 0.6 + velocity.x * 0.4,
            y: dragVector.y * 0.6 + velocity.y * 0.4
        };
        
        const magnitude = Math.sqrt(combinedVector.x * combinedVector.x + combinedVector.y * combinedVector.y);
        if (magnitude === 0) {
            return { x: 0, y: 0 };
        }
        
        return {
            x: combinedVector.x / magnitude,
            y: combinedVector.y / magnitude
        };
    }
    
    /**
     * 泡に力を適用
     */
    applyForceToeBubble(bubble, direction, strength) {
        bubble.velocity.x = direction.x * strength;
        bubble.velocity.y = direction.y * strength;
        
        // 泡のタイプによる調整
        switch (bubble.type) {
            case 'stone':
                // 石は重いので速度を減衰
                bubble.velocity.x *= 0.7;
                bubble.velocity.y *= 0.7;
                break;
            case 'iron':
                bubble.velocity.x *= 0.5;
                bubble.velocity.y *= 0.5;
                break;
            case 'diamond':
                bubble.velocity.x *= 0.3;
                bubble.velocity.y *= 0.3;
                break;
            case 'escaping':
                // 逃げる泡は軽いので速度を増幅
                bubble.velocity.x *= 1.5;
                bubble.velocity.y *= 1.5;
                break;
            case 'boss':
                // ボス泡は非常に重い
                bubble.velocity.x *= 0.2;
                bubble.velocity.y *= 0.2;
                break;
        }
    }
    
    /**
     * ドラッグ状態をリセット
     */
    resetDrag() {
        this.isDragging = false;
        this.draggedBubble = null;
        this.dragStartPosition = { x: 0, y: 0 };
        this.dragCurrentPosition = { x: 0, y: 0 };
        this.dragHistory = [];
    }
    
    /**
     * 自動破裂チェック
     */
    checkAutoBurst(bubble) {
        // ひび割れ泡は早期破裂
        if (bubble.type === 'cracked' && bubble.age > bubble.maxAge * 0.5) {
            this.burstBubble(bubble);
            return;
        }
        
        // 通常の自動破裂
        if (bubble.age >= bubble.maxAge) {
            this.burstBubble(bubble);
        }
    }
    
    /**
     * 泡を破裂させる
     */
    burstBubble(bubble) {
        console.log(`${bubble.type} bubble burst automatically`);
        
        // プレイヤーにダメージ
        const damage = this.calculateBurstDamage(bubble);
        this.gameEngine.playerData.takeDamage(damage);
        
        // 泡を削除
        bubble.destroy();
    }
    
    /**
     * 破裂ダメージを計算
     */
    calculateBurstDamage(bubble) {
        const baseDamage = {
            'normal': 5,
            'stone': 8,
            'iron': 12,
            'diamond': 15,
            'poison': 20,
            'spiky': 15,
            'cracked': 8,
            'boss': 25,
            'escaping': 3
        };
        
        return baseDamage[bubble.type] || 5;
    }
    
    /**
     * マウス位置を更新
     */
    updateMousePosition(x, y) {
        this.mousePosition.x = x;
        this.mousePosition.y = y;
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
        
        return false;
    }
    
    /**
     * 泡を割る
     */
    popBubble(bubble, x, y) {
        console.log(`${bubble.type} bubble popped`);
        
        // 泡の効果を処理
        this.processBubbleEffect(bubble);
        
        // スコアを加算
        this.gameEngine.scoreManager.addScore(bubble, x, y);
        
        // 泡を削除
        bubble.destroy();
    }
    
    /**
     * 泡の効果を処理
     */
    processBubbleEffect(bubble) {
        switch (bubble.type) {
            case 'rainbow':
                // ボーナスタイム開始
                this.gameEngine.startBonusTime(10000, 2);
                break;
                
            case 'pink':
                // HP回復
                this.gameEngine.playerData.heal(15);
                break;
                
            case 'clock':
                // 時間停止
                this.gameEngine.startTimeStop(3000);
                break;
                
            case 'electric':
                // 画面震動
                this.gameEngine.startScreenShake(2000, 15);
                break;
                
            case 'poison':
                // ダメージ
                this.gameEngine.playerData.takeDamage(10);
                break;
                
            case 'spiky':
                // 周囲の泡を割る
                this.chainReaction(bubble.x, bubble.y, 80);
                break;
        }
    }
    
    /**
     * 連鎖反応（とげとげ泡用）
     */
    chainReaction(centerX, centerY, radius) {
        const affectedBubbles = [];
        
        this.bubbles.forEach(bubble => {
            const dx = bubble.x - centerX;
            const dy = bubble.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius && bubble.isAlive) {
                affectedBubbles.push(bubble);
            }
        });
        
        // 少し遅延して爆発させる
        affectedBubbles.forEach((bubble, index) => {
            setTimeout(() => {
                if (bubble.isAlive) {
                    this.popBubble(bubble, bubble.x, bubble.y);
                }
            }, index * 100);
        });
        
        console.log(`Chain reaction affected ${affectedBubbles.length} bubbles`);
    }
    
    /**
     * ランダムな泡の種類を取得
     */
    getRandomBubbleType() {
        if (!this.stageConfig || !this.stageConfig.bubbleTypes) {
            return 'normal';
        }
        
        const types = this.stageConfig.bubbleTypes;
        return types[Math.floor(Math.random() * types.length)];
    }
    
    /**
     * ランダムな位置を取得
     */
    getRandomPosition() {
        const canvas = this.gameEngine.canvas;
        const margin = 50;
        
        return {
            x: margin + Math.random() * (canvas.width - margin * 2),
            y: margin + Math.random() * (canvas.height - margin * 2)
        };
    }
    
    /**
     * 描画処理
     */
    render(context) {
        this.bubbles.forEach(bubble => {
            bubble.render(context);
        });
        
        // ドラッグ軌跡の描画（デバッグ用）
        if (this.isDragging && this.dragHistory.length > 1) {
            context.save();
            context.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            context.lineWidth = 2;
            context.setLineDash([3, 3]);
            
            context.beginPath();
            context.moveTo(this.dragHistory[0].x, this.dragHistory[0].y);
            
            for (let i = 1; i < this.dragHistory.length; i++) {
                context.lineTo(this.dragHistory[i].x, this.dragHistory[i].y);
            }
            
            context.stroke();
            context.restore();
        }
    }
    
    /**
     * 全ての泡をクリア
     */
    clearAllBubbles() {
        this.bubbles = [];
        this.resetDrag();
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
}