import { Bubble } from '../bubbles/Bubble.js';
import { getPerformanceOptimizer } from '../utils/PerformanceOptimizer.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * 泡管理クラス - パフォーマンス最適化対応 + 高度なドラッグシステム
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
        
        // ドラッグ関連の拡張（両方のシステムを統合）
        this.draggedBubble = null;
        this.isDragging = false;
        this.dragStartPosition = { x: 0, y: 0 };
        this.dragCurrentPosition = { x: 0, y: 0 };
        this.dragHistory = []; // ドラッグ軌跡の履歴（速度計算用）
        this.dragPhysics = {
            friction: 0.98, // 空気抵抗
            bounce: 0.7,    // 跳ね返り係数
            gravity: 50,    // 重力加速度
            minVelocity: 5  // 最小速度（これ以下で停止）
        };
        
        // パフォーマンス最適化
        this.lastCullTime = 0;
        this.cullInterval = 500; // 0.5秒ごとにカリング
        
        // 画面外消滅処理用（統合版）
        this.offscreenBubbles = new Set(); // 画面外に出た泡を追跡
        this.offscreenTimer = new Map();   // 画面外での滞在時間
        this.offscreenTimeout = new Map(); // 画面外タイムアウト管理（パフォーマンス最適化用）
        this.offscreenTimeoutDuration = 3000; // 3秒で消滅
    }
    
    /**
     * 泡を生成
     */
    spawnBubble(type = null, position = null) {
        try {
            // パフォーマンス最適化による制限
            const maxBubbles = Math.min(this.maxBubbles, getPerformanceOptimizer().getMaxBubbles());
            
            if (this.bubbles.length >= maxBubbles) {
                return null;
            }
            
            // 入力値を検証
            if (type !== null) {
                const typeValidation = getErrorHandler().validateInput(type, 'string', {
                    maxLength: 20,
                    pattern: /^[a-zA-Z_]+$/
                });
                
                if (!typeValidation.isValid) {
                    getErrorHandler().handleError(new Error(`Invalid bubble type: ${typeValidation.errors.join(', ')}`), 'VALIDATION_ERROR', {
                        input: type,
                        errors: typeValidation.errors
                    });
                    type = 'normal'; // フォールバック
                }
            }
            
            if (position !== null) {
                const positionValidation = getErrorHandler().validateInput(position, 'object', {
                    properties: {
                        x: { type: 'number', min: -100, max: 1000 },
                        y: { type: 'number', min: -100, max: 800 }
                    }
                });
                
                if (!positionValidation.isValid) {
                    getErrorHandler().handleError(new Error(`Invalid bubble position: ${positionValidation.errors.join(', ')}`), 'VALIDATION_ERROR', {
                        input: position,
                        errors: positionValidation.errors
                    });
                    position = null; // ランダム位置にフォールバック
                }
            }
            
            // ランダムな種類を選択（指定がない場合）
            if (!type) {
                type = this.getRandomBubbleTypeWithSpecialRates();
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
            
        } catch (error) {
            getErrorHandler().handleError(error, 'BUBBLE_CREATION_ERROR', {
                type: type,
                position: position,
                bubbleCount: this.bubbles.length
            });
            return null;
        }
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
        this.maxBubbles = config.maxBubbles || 20;
        this.baseSpawnRate = config.spawnRate || 1.0;
        
        // 生成間隔を調整
        this.spawnInterval = Math.max(500, 2000 / this.baseSpawnRate);
        
        console.log(`Stage config applied: ${config.name}, max bubbles: ${this.maxBubbles}, spawn rate: ${this.baseSpawnRate}`);
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
     * 更新処理（統合版）
     */
    update(deltaTime) {
        // 時間停止中は泡の生成と動きを停止
        if (this.gameEngine.isTimeStopActive && this.gameEngine.isTimeStopActive()) {
            return;
        }
        
        // パフォーマンス調整されたデルタタイムを使用
        const adjustedDeltaTime = getPerformanceOptimizer().adjustUpdateFrequency(deltaTime);
        
        // 自動生成（パフォーマンスレベルに応じて調整）
        this.spawnTimer += adjustedDeltaTime;
        const adjustedSpawnInterval = this.spawnInterval * (2 - getPerformanceOptimizer().getEffectQuality());
        
        if (this.spawnTimer >= adjustedSpawnInterval) {
            this.spawnBubble();
            this.spawnTimer = 0;
        }
        
        // 泡の更新（統合された物理システム）
        this.bubbles.forEach((bubble, index) => {
            this.updateBubble(bubble, adjustedDeltaTime);
            this.handleOffscreenBubble(bubble, adjustedDeltaTime);
        });
        
        // 削除予定の泡を除去とプール返却
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
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
        
        // 定期的なカリング処理（パフォーマンス最適化）
        if (Date.now() - this.lastCullTime > this.cullInterval) {
            this.performCulling();
            this.lastCullTime = Date.now();
        }
        
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
        bubble.update(deltaTime, this.mousePosition);
        
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
        bubble.position.x += bubble.velocity.x * deltaSeconds;
        bubble.position.y += bubble.velocity.y * deltaSeconds;
        
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
        if (bubble.position.x - radius < 0) {
            bubble.position.x = radius;
            bubble.velocity.x *= -this.dragPhysics.bounce;
        } else if (bubble.position.x + radius > canvas.width) {
            bubble.position.x = canvas.width - radius;
            bubble.velocity.x *= -this.dragPhysics.bounce;
        }
        
        // 上下の境界
        if (bubble.position.y - radius < 0) {
            bubble.position.y = radius;
            bubble.velocity.y *= -this.dragPhysics.bounce;
        } else if (bubble.position.y + radius > canvas.height) {
            bubble.position.y = canvas.height - radius;
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
        const dx = bubble.position.x - this.mousePosition.x;
        const dy = bubble.position.y - this.mousePosition.y;
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
     * 泡が画面内にあるかチェック（パフォーマンス最適化用）
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
        if (this.bubbles.length <= getPerformanceOptimizer().getMaxBubbles()) {
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
     * 画面外の泡の処理（統合版）
     */
    handleOffscreenBubble(bubble, deltaTime) {
        const canvas = this.gameEngine.canvas;
        const margin = bubble.size; // マージンを設けて判定
        
        const isOffscreen = (
            bubble.position.x < -margin ||
            bubble.position.x > canvas.width + margin ||
            bubble.position.y < -margin ||
            bubble.position.y > canvas.height + margin
        );
        
        if (isOffscreen) {
            // 特定の泡タイプは即座に消滅
            if (this.shouldDisappearOffscreen(bubble.type)) {
                bubble.isAlive = false;
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
            
            if (timer >= this.offscreenTimeoutDuration) {
                bubble.isAlive = false;
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
        
        // 新しいエフェクトシステムで爆発エフェクトを作成
        if (this.gameEngine.createExplosion) {
            this.gameEngine.createExplosion(bubble.position.x, bubble.position.y, bubble.type, bubble.size, 1);
        }
        
        // 泡を削除
        bubble.isAlive = false;
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
        
        // ドラッグ軌跡の描画（デバッグ用、高品質モードのみ）
        if (renderQuality > 0.8 && this.isDragging && this.dragHistory.length > 1) {
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
        this.processBubbleEffect(bubble, x, y);
        
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
     * 泡の効果を処理
     */
    processBubbleEffect(bubble, x, y) {
        // パフォーマンス最適化: エフェクトの実行可否を判定
        if (!performanceOptimizer.shouldRunEffect('bubble_effect')) {
            return;
        }
        
        const gameScene = this.gameEngine.sceneManager.getCurrentScene();
        
        switch (bubble.type) {
            case 'rainbow':
                // ボーナスタイム開始
                this.gameEngine.activateBonusTime(10000);
                this.notifySpecialEffect('rainbow', x, y);
                break;
                
            case 'pink':
                // HP回復
                const healAmount = 15;
                this.gameEngine.playerData.heal(healAmount);
                this.notifyHeal(healAmount);
                this.notifySpecialEffect('pink', x, y);
                break;
                
            case 'clock':
                // 時間停止
                this.gameEngine.activateTimeStop(3000);
                this.notifySpecialEffect('clock', x, y);
                break;
                
            case 'electric':
                // 画面震動
                this.gameEngine.activateScreenShake(15, 2000);
                this.notifySpecialEffect('electric', x, y);
                break;
                
            case 'poison':
                // ダメージ
                const damage = 10;
                this.gameEngine.playerData.takeDamage(damage);
                this.notifyDamage(damage, 'poison');
                this.notifySpecialEffect('poison', x, y);
                break;
                
            case 'spiky':
                // 周囲の泡を割る
                this.chainReaction(bubble.position.x, bubble.position.y, 80);
                this.notifySpecialEffect('spiky', x, y);
                break;
                
            // 新しい泡タイプの効果処理
            case 'golden':
                // 黄金の泡：スコア倍率効果
                this.gameEngine.activateScoreMultiplier(2.0, 5000);
                this.notifySpecialEffect('golden', x, y);
                break;
                
            case 'frozen':
                // 氷の泡：周囲の泡を遅くする
                this.applySlowEffect(bubble.position.x, bubble.position.y, 120, 0.5, 8000);
                this.notifySpecialEffect('frozen', x, y);
                break;
                
            case 'magnetic':
                // 磁石の泡：他の泡を引き寄せる
                this.applyMagneticPull(bubble.position.x, bubble.position.y, 100, 150);
                this.notifySpecialEffect('magnetic', x, y);
                break;
                
            case 'explosive':
                // 爆発の泡：大きな爆発
                this.bigExplosion(bubble.position.x, bubble.position.y, 150, 15);
                this.notifySpecialEffect('explosive', x, y);
                break;
                
            case 'phantom':
                // 幻の泡：特殊効果なし（すり抜け効果は別途処理済み）
                this.notifySpecialEffect('phantom', x, y);
                break;
                
            case 'multiplier':
                // 倍率の泡：次の泡のスコアを倍増
                this.gameEngine.activateNextScoreMultiplier(3.0, 10000);
                this.notifySpecialEffect('multiplier', x, y);
                break;
        }
    }
    
    /**
     * 特殊効果通知
     */
    notifySpecialEffect(effectType, x, y) {
        const gameScene = this.gameEngine.sceneManager.getCurrentScene();
        if (gameScene && typeof gameScene.onSpecialEffect === 'function') {
            gameScene.onSpecialEffect(effectType, x, y);
        }
    }
    
    /**
     * ダメージ通知
     */
    notifyDamage(damage, source) {
        const gameScene = this.gameEngine.sceneManager.getCurrentScene();
        if (gameScene && typeof gameScene.onDamageTaken === 'function') {
            gameScene.onDamageTaken(damage, source);
        }
    }
    
    /**
     * 回復通知
     */
    notifyHeal(healAmount) {
        const gameScene = this.gameEngine.sceneManager.getCurrentScene();
        if (gameScene && typeof gameScene.onHealed === 'function') {
            gameScene.onHealed(healAmount);
        }
    }
    
    /**
     * 連鎖反応（とげとげ泡用）
     */
    chainReaction(centerX, centerY, radius) {
        const affectedBubbles = [];
        
        this.bubbles.forEach(bubble => {
            const dx = bubble.position.x - centerX;
            const dy = bubble.position.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius && bubble.isAlive) {
                affectedBubbles.push(bubble);
            }
        });
        
        // 少し遅延して爆発させる
        affectedBubbles.forEach((bubble, index) => {
            setTimeout(() => {
                if (bubble.isAlive) {
                    this.popBubble(bubble, bubble.position.x, bubble.position.y);
                }
            }, index * 100);
        });
        
        console.log(`Chain reaction affected ${affectedBubbles.length} bubbles`);
    }
    
    /**
     * ドラッグ開始処理（統合版）
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
     * ドラッグ移動処理
     */
    handleDragMove(x, y) {
        if (!this.isDragging || !this.draggedBubble) {
            return false;
        }
        
        this.dragCurrentPosition = { x, y };
        
        // 履歴を記録（最新の10個まで保持）
        this.dragHistory.push({ x, y, time: Date.now() });
        if (this.dragHistory.length > 10) {
            this.dragHistory.shift();
        }
        
        return true;
    }
    
    /**
     * ドラッグ履歴から速度を計算
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
    applyForceToBubble(bubble, direction, strength) {
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
     * ドラッグ終了処理（統合版）
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
        this.applyForceToBubble(this.draggedBubble, forceDirection, flickStrength);
        
        console.log(`Bubble flicked with strength: ${flickStrength.toFixed(1)}, direction: (${forceDirection.x.toFixed(2)}, ${forceDirection.y.toFixed(2)})`);
        
        this.resetDrag();
        return true;
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
     * スロー効果を適用（氷の泡用）
     */
    applySlowEffect(centerX, centerY, radius, slowFactor, duration) {
        const affectedBubbles = [];
        
        this.bubbles.forEach(bubble => {
            const dx = bubble.position.x - centerX;
            const dy = bubble.position.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius && bubble.isAlive) {
                affectedBubbles.push(bubble);
            }
        });
        
        // 影響を受けた泡にスロー効果を適用
        affectedBubbles.forEach(bubble => {
            bubble.slowEffect = {
                factor: slowFactor,
                endTime: Date.now() + duration
            };
        });
        
        console.log(`Slow effect applied to ${affectedBubbles.length} bubbles`);
    }
    
    /**
     * 磁力効果を適用（磁石の泡用）
     */
    applyMagneticPull(centerX, centerY, radius, strength) {
        this.bubbles.forEach(bubble => {
            const dx = bubble.position.x - centerX;
            const dy = bubble.position.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius && distance > 0 && bubble.isAlive) {
                // 中心に向かう力を計算
                const pullForce = strength * (1 - distance / radius);
                const direction = {
                    x: -dx / distance,
                    y: -dy / distance
                };
                
                // 速度に力を加算
                bubble.velocity.x += direction.x * pullForce * 0.016; // 60FPS想定
                bubble.velocity.y += direction.y * pullForce * 0.016;
            }
        });
    }
    
    /**
     * 大爆発効果（爆発の泡用）
     */
    bigExplosion(centerX, centerY, radius, damage) {
        const affectedBubbles = [];
        
        this.bubbles.forEach(bubble => {
            const dx = bubble.position.x - centerX;
            const dy = bubble.position.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius && bubble.isAlive) {
                affectedBubbles.push({ bubble, distance });
            }
        });
        
        // 距離に応じて遅延爆発
        affectedBubbles.forEach(({ bubble, distance }, index) => {
            const delay = (distance / radius) * 500; // 最大0.5秒の遅延
            setTimeout(() => {
                if (bubble.isAlive) {
                    this.popBubble(bubble, bubble.position.x, bubble.position.y);
                }
            }, delay);
        });
        
        // プレイヤーにもダメージ
        this.gameEngine.playerData.takeDamage(damage);
        
        console.log(`Big explosion affected ${affectedBubbles.length} bubbles`);
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
        this.resetDrag();
        this.offscreenBubbles.clear();
        this.offscreenTimer.clear();
        this.offscreenTimeout.clear();
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
     * スロー効果を適用（氷の泡用）
     */
    applySlowEffect(centerX, centerY, radius, slowFactor, duration) {
        const affectedBubbles = [];
        
        this.bubbles.forEach(bubble => {
            const dx = bubble.position.x - centerX;
            const dy = bubble.position.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius && bubble.isAlive) {
                affectedBubbles.push(bubble);
            }
        });
        
        // 影響を受けた泡にスロー効果を適用
        affectedBubbles.forEach(bubble => {
            bubble.slowEffect = {
                factor: slowFactor,
                endTime: Date.now() + duration
            };
        });
        
        console.log(`Slow effect applied to ${affectedBubbles.length} bubbles`);
    }
    
    /**
     * 磁力効果を適用（磁石の泡用）
     */
    applyMagneticPull(centerX, centerY, radius, strength) {
        this.bubbles.forEach(bubble => {
            const dx = bubble.position.x - centerX;
            const dy = bubble.position.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius && distance > 0 && bubble.isAlive) {
                // 中心に向かう力を計算
                const pullForce = strength * (1 - distance / radius);
                const direction = {
                    x: -dx / distance,
                    y: -dy / distance
                };
                
                // 速度に力を加算
                bubble.velocity.x += direction.x * pullForce * 0.016; // 60FPS想定
                bubble.velocity.y += direction.y * pullForce * 0.016;
            }
        });
    }
    
    /**
     * 大爆発効果（爆発の泡用）
     */
    bigExplosion(centerX, centerY, radius, damage) {
        const affectedBubbles = [];
        
        this.bubbles.forEach(bubble => {
            const dx = bubble.position.x - centerX;
            const dy = bubble.position.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius && bubble.isAlive) {
                affectedBubbles.push({ bubble, distance });
            }
        });
        
        // 距離に応じて遅延爆発
        affectedBubbles.forEach(({ bubble, distance }, index) => {
            const delay = (distance / radius) * 500; // 最大0.5秒の遅延
            setTimeout(() => {
                if (bubble.isAlive) {
                    this.popBubble(bubble, bubble.position.x, bubble.position.y);
                }
            }, delay);
        });
        
        // プレイヤーにもダメージ
        this.gameEngine.playerData.takeDamage(damage);
        
        console.log(`Big explosion affected ${affectedBubbles.length} bubbles`);
    }
    
    /**
     * 特殊な泡の生成率を設定
     */
    setSpecialSpawnRate(bubbleType, rate) {
        if (!this.specialSpawnRates) {
            this.specialSpawnRates = {};
        }
        this.specialSpawnRates[bubbleType] = rate;
        console.log(`Special spawn rate set for ${bubbleType}: ${rate}`);
    }
    
    /**
     * 特殊生成率を考慮したランダム泡タイプを取得
     */
    getRandomBubbleTypeWithSpecialRates() {
        if (!this.specialSpawnRates) {
            return this.getRandomBubbleType();
        }
        
        // 特殊生成率をチェック
        for (const [bubbleType, rate] of Object.entries(this.specialSpawnRates)) {
            if (Math.random() < rate) {
                return bubbleType;
            }
        }
        
        // 通常の生成
        return this.getRandomBubbleType();
    }
}