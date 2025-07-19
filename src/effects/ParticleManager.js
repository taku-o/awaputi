/**
 * パーティクル効果管理クラス
 * 泡が割れる時の視覚効果、爆発、きらめき等を管理
 */
export class ParticleManager {
    constructor() {
        this.particles = [];
        this.particleId = 0;
        this.maxParticles = 500;
        
        // パーティクルプール（最適化用）
        this.particlePool = [];
        this.poolSize = 100;
        this.initializePool();
    }
    
    /**
     * パーティクルプールを初期化
     */
    initializePool() {
        for (let i = 0; i < this.poolSize; i++) {
            this.particlePool.push(this.createParticleObject());
        }
    }
    
    /**
     * パーティクルオブジェクトを作成
     */
    createParticleObject() {
        return {
            id: 0,
            x: 0, y: 0,
            vx: 0, vy: 0,
            size: 0,
            color: '#FFFFFF',
            life: 0,
            maxLife: 0,
            alpha: 1,
            rotation: 0,
            rotationSpeed: 0,
            scale: 1,
            scaleSpeed: 0,
            gravity: 0,
            friction: 1,
            bounce: 0,
            type: 'circle',
            isActive: false,
            // 特殊プロパティ
            pulseSpeed: 0,
            trail: [],
            maxTrailLength: 0
        };
    }
    
    /**
     * プールからパーティクルを取得
     */
    getParticleFromPool() {
        if (this.particlePool.length > 0) {
            const particle = this.particlePool.pop();
            particle.isActive = true;
            particle.id = this.particleId++;
            return particle;
        }
        
        // プールが空の場合は新規作成
        const particle = this.createParticleObject();
        particle.isActive = true;
        particle.id = this.particleId++;
        return particle;
    }
    
    /**
     * パーティクルをプールに戻す
     */
    returnParticleToPool(particle) {
        particle.isActive = false;
        particle.trail = [];
        
        if (this.particlePool.length < this.poolSize) {
            this.particlePool.push(particle);
        }
    }
    
    /**
     * 泡ポップエフェクトを作成
     */
    createBubblePopEffect(x, y, bubbleType, bubbleSize) {
        const particleCount = Math.floor(bubbleSize / 5) + 5;
        const colors = this.getBubbleColors(bubbleType);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticleFromPool();
            
            // 基本プロパティ
            particle.x = x + (Math.random() - 0.5) * bubbleSize * 0.5;
            particle.y = y + (Math.random() - 0.5) * bubbleSize * 0.5;
            
            // 速度（放射状に飛び散る）
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const speed = 50 + Math.random() * 100;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            
            // 見た目
            particle.size = 2 + Math.random() * 4;
            particle.color = colors[Math.floor(Math.random() * colors.length)];
            particle.life = 800 + Math.random() * 400;
            particle.maxLife = particle.life;
            particle.alpha = 1;
            
            // 物理
            particle.gravity = 20 + Math.random() * 30;
            particle.friction = 0.98;
            particle.bounce = 0.3 + Math.random() * 0.4;
            
            // アニメーション
            particle.rotation = Math.random() * Math.PI * 2;
            particle.rotationSpeed = (Math.random() - 0.5) * 10;
            particle.scale = 1;
            particle.scaleSpeed = -0.8 / (particle.life / 1000);
            
            particle.type = 'circle';
            this.particles.push(particle);
        }
        
        // 特殊効果（バブルタイプ別）
        this.createSpecialBubbleEffect(x, y, bubbleType, bubbleSize);
    }
    
    /**
     * バブルタイプ別の色を取得
     */
    getBubbleColors(bubbleType) {
        const colorSets = {
            normal: ['#4A90E2', '#7ED321', '#50E3C2'],
            stone: ['#8E8E93', '#C7C7CC', '#EFEFF4'],
            iron: ['#8B4513', '#A0522D', '#CD853F'],
            diamond: ['#E6E6FA', '#F8F8FF', '#FFFFFF'],
            rainbow: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
            pink: ['#FF69B4', '#FFB6C1', '#FFC0CB'],
            clock: ['#FFD700', '#FFA500', '#FF8C00'],
            electric: ['#FFFF00', '#00FFFF', '#FFFFFF'],
            poison: ['#32CD32', '#00FF00', '#98FB98'],
            spiky: ['#FF4500', '#FF6347', '#FF7F50'],
            cracked: ['#A0A0A0', '#808080', '#C0C0C0'],
            escaping: ['#DDA0DD', '#DA70D6', '#BA55D3'],
            boss: ['#8B0000', '#DC143C', '#FF0000'],
            score: ['#FFD700', '#FFA500', '#FF8C00']
        };
        
        return colorSets[bubbleType] || colorSets.normal;
    }
    
    /**
     * バブルタイプ別の特殊効果
     */
    createSpecialBubbleEffect(x, y, bubbleType, bubbleSize) {
        switch (bubbleType) {
            case 'rainbow':
                this.createRainbowSparkles(x, y, bubbleSize);
                break;
            case 'electric':
                this.createElectricSparks(x, y, bubbleSize);
                break;
            case 'spiky':
                this.createSpikeExplosion(x, y, bubbleSize);
                break;
            case 'diamond':
                this.createDiamondShards(x, y, bubbleSize);
                break;
            case 'boss':
                this.createBossExplosion(x, y, bubbleSize);
                break;
            case 'poison':
                this.createPoisonCloud(x, y, bubbleSize);
                break;
            case 'clock':
                this.createTimeRipple(x, y, bubbleSize);
                break;
        }
    }
    
    /**
     * 虹色きらめき効果
     */
    createRainbowSparkles(x, y, size) {
        const sparkleCount = 15;
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        
        for (let i = 0; i < sparkleCount; i++) {
            const particle = this.getParticleFromPool();
            
            particle.x = x + (Math.random() - 0.5) * size;
            particle.y = y + (Math.random() - 0.5) * size;
            particle.vx = (Math.random() - 0.5) * 80;
            particle.vy = (Math.random() - 0.5) * 80;
            particle.size = 3 + Math.random() * 2;
            particle.color = colors[Math.floor(Math.random() * colors.length)];
            particle.life = 1200;
            particle.maxLife = particle.life;
            particle.gravity = -10; // 上向きに浮く
            particle.friction = 0.95;
            particle.type = 'star';
            particle.pulseSpeed = 5 + Math.random() * 5;
            
            this.particles.push(particle);
        }
    }
    
    /**
     * 電気スパーク効果
     */
    createElectricSparks(x, y, size) {
        const sparkCount = 20;
        
        for (let i = 0; i < sparkCount; i++) {
            const particle = this.getParticleFromPool();
            
            particle.x = x;
            particle.y = y;
            particle.vx = (Math.random() - 0.5) * 200;
            particle.vy = (Math.random() - 0.5) * 200;
            particle.size = 1 + Math.random() * 2;
            particle.color = Math.random() > 0.5 ? '#FFFF00' : '#00FFFF';
            particle.life = 300 + Math.random() * 200;
            particle.maxLife = particle.life;
            particle.friction = 0.9;
            particle.type = 'lightning';
            particle.maxTrailLength = 5;
            particle.trail = [];
            
            this.particles.push(particle);
        }
    }
    
    /**
     * スパイク爆発効果
     */
    createSpikeExplosion(x, y, size) {
        const spikeCount = 8;
        
        for (let i = 0; i < spikeCount; i++) {
            const particle = this.getParticleFromPool();
            
            const angle = (Math.PI * 2 * i) / spikeCount;
            const speed = 120 + Math.random() * 80;
            
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = 3 + Math.random() * 3;
            particle.color = '#FF4500';
            particle.life = 600;
            particle.maxLife = particle.life;
            particle.gravity = 30;
            particle.friction = 0.95;
            particle.type = 'spike';
            particle.rotation = angle;
            
            this.particles.push(particle);
        }
    }
    
    /**
     * ダイヤモンドの破片効果
     */
    createDiamondShards(x, y, size) {
        const shardCount = 12;
        
        for (let i = 0; i < shardCount; i++) {
            const particle = this.getParticleFromPool();
            
            particle.x = x + (Math.random() - 0.5) * size * 0.3;
            particle.y = y + (Math.random() - 0.5) * size * 0.3;
            particle.vx = (Math.random() - 0.5) * 120;
            particle.vy = (Math.random() - 0.5) * 120;
            particle.size = 2 + Math.random() * 3;
            particle.color = Math.random() > 0.3 ? '#FFFFFF' : '#E6E6FA';
            particle.life = 1000 + Math.random() * 500;
            particle.maxLife = particle.life;
            particle.gravity = 20;
            particle.friction = 0.98;
            particle.bounce = 0.6;
            particle.type = 'diamond';
            particle.rotationSpeed = (Math.random() - 0.5) * 15;
            
            this.particles.push(particle);
        }
    }
    
    /**
     * ボス爆発効果
     */
    createBossExplosion(x, y, size) {
        const explosionCount = 30;
        
        for (let i = 0; i < explosionCount; i++) {
            const particle = this.getParticleFromPool();
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 150;
            
            particle.x = x + (Math.random() - 0.5) * size;
            particle.y = y + (Math.random() - 0.5) * size;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = 4 + Math.random() * 6;
            particle.color = ['#8B0000', '#DC143C', '#FF0000'][Math.floor(Math.random() * 3)];
            particle.life = 1500 + Math.random() * 1000;
            particle.maxLife = particle.life;
            particle.gravity = 25;
            particle.friction = 0.95;
            particle.bounce = 0.4;
            particle.type = 'explosion';
            particle.maxTrailLength = 3;
            particle.trail = [];
            
            this.particles.push(particle);
        }
    }
    
    /**
     * 毒の雲効果
     */
    createPoisonCloud(x, y, size) {
        const cloudCount = 10;
        
        for (let i = 0; i < cloudCount; i++) {
            const particle = this.getParticleFromPool();
            
            particle.x = x + (Math.random() - 0.5) * size;
            particle.y = y + (Math.random() - 0.5) * size;
            particle.vx = (Math.random() - 0.5) * 30;
            particle.vy = (Math.random() - 0.5) * 30;
            particle.size = 5 + Math.random() * 8;
            particle.color = Math.random() > 0.5 ? '#32CD32' : '#00FF00';
            particle.life = 2000 + Math.random() * 1000;
            particle.maxLife = particle.life;
            particle.gravity = -5; // ゆっくり上昇
            particle.friction = 0.99;
            particle.type = 'cloud';
            particle.pulseSpeed = 2;
            
            this.particles.push(particle);
        }
    }
    
    /**
     * 時間の波紋効果
     */
    createTimeRipple(x, y, size) {
        const rippleCount = 5;
        
        for (let i = 0; i < rippleCount; i++) {
            const particle = this.getParticleFromPool();
            
            particle.x = x;
            particle.y = y;
            particle.vx = 0;
            particle.vy = 0;
            particle.size = size + i * 20;
            particle.color = '#FFD700';
            particle.life = 1000 + i * 200;
            particle.maxLife = particle.life;
            particle.type = 'ripple';
            particle.scaleSpeed = 2;
            
            this.particles.push(particle);
        }
    }
    
    /**
     * コンボエフェクト
     */
    createComboEffect(x, y, comboCount) {
        const starCount = Math.min(comboCount, 20);
        const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FF4500'];
        
        for (let i = 0; i < starCount; i++) {
            const particle = this.getParticleFromPool();
            
            const angle = (Math.PI * 2 * i) / starCount;
            const radius = 30 + comboCount * 2;
            const speed = 60 + Math.random() * 40;
            
            particle.x = x + Math.cos(angle) * radius;
            particle.y = y + Math.sin(angle) * radius;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = 3 + Math.random() * 2;
            particle.color = colors[Math.min(Math.floor(comboCount / 5), colors.length - 1)];
            particle.life = 1000 + Math.random() * 500;
            particle.maxLife = particle.life;
            particle.gravity = -20;
            particle.friction = 0.97;
            particle.type = 'star';
            particle.rotationSpeed = (Math.random() - 0.5) * 10;
            
            this.particles.push(particle);
        }
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        
        this.particles = this.particles.filter(particle => {
            if (!particle.isActive) return false;
            
            // 生存時間の更新
            particle.life -= deltaTime;
            if (particle.life <= 0) {
                this.returnParticleToPool(particle);
                return false;
            }
            
            // 物理更新
            this.updatePhysics(particle, deltaSeconds);
            
            // 見た目の更新
            this.updateAppearance(particle, deltaSeconds);
            
            // トレイル更新
            this.updateTrail(particle);
            
            return true;
        });
        
        // パーティクル数制限
        if (this.particles.length > this.maxParticles) {
            const excessCount = this.particles.length - this.maxParticles;
            for (let i = 0; i < excessCount; i++) {
                const particle = this.particles.shift();
                this.returnParticleToPool(particle);
            }
        }
    }
    
    /**
     * 物理更新
     */
    updatePhysics(particle, deltaSeconds) {
        // 重力の適用
        particle.vy += particle.gravity * deltaSeconds;
        
        // 摩擦の適用
        particle.vx *= particle.friction;
        particle.vy *= particle.friction;
        
        // 位置更新
        particle.x += particle.vx * deltaSeconds;
        particle.y += particle.vy * deltaSeconds;
        
        // 境界での跳ね返り（必要に応じて）
        if (particle.bounce > 0) {
            // 簡単な境界判定（実際の画面サイズは外部から渡す必要がある）
            if (particle.y > 600 && particle.vy > 0) {
                particle.vy *= -particle.bounce;
                particle.y = 600;
            }
        }
    }
    
    /**
     * 見た目の更新
     */
    updateAppearance(particle, deltaSeconds) {
        const lifeRatio = particle.life / particle.maxLife;
        
        // 透明度（フェードアウト）
        particle.alpha = lifeRatio;
        
        // スケール
        particle.scale += particle.scaleSpeed * deltaSeconds;
        particle.scale = Math.max(0.1, particle.scale);
        
        // 回転
        particle.rotation += particle.rotationSpeed * deltaSeconds;
        
        // パルス効果
        if (particle.pulseSpeed > 0) {
            const pulse = Math.sin(Date.now() * 0.001 * particle.pulseSpeed) * 0.3 + 1;
            particle.scale *= pulse;
        }
    }
    
    /**
     * トレイル更新
     */
    updateTrail(particle) {
        if (particle.maxTrailLength > 0) {
            particle.trail.push({ x: particle.x, y: particle.y, alpha: particle.alpha });
            
            if (particle.trail.length > particle.maxTrailLength) {
                particle.trail.shift();
            }
        }
    }
    
    /**
     * 描画処理
     */
    render(context) {
        context.save();
        
        this.particles.forEach(particle => {
            if (!particle.isActive) return;
            
            context.save();
            context.globalAlpha = particle.alpha;
            context.translate(particle.x, particle.y);
            
            if (particle.rotation !== 0) {
                context.rotate(particle.rotation);
            }
            
            if (particle.scale !== 1) {
                context.scale(particle.scale, particle.scale);
            }
            
            // トレイル描画
            this.renderTrail(context, particle);
            
            // パーティクル本体描画
            this.renderParticle(context, particle);
            
            context.restore();
        });
        
        context.restore();
    }
    
    /**
     * パーティクル描画
     */
    renderParticle(context, particle) {
        context.fillStyle = particle.color;
        context.strokeStyle = particle.color;
        
        switch (particle.type) {
            case 'circle':
                context.beginPath();
                context.arc(0, 0, particle.size, 0, Math.PI * 2);
                context.fill();
                break;
                
            case 'star':
                this.drawStar(context, particle.size);
                break;
                
            case 'diamond':
                this.drawDiamond(context, particle.size);
                break;
                
            case 'spike':
                this.drawSpike(context, particle.size);
                break;
                
            case 'lightning':
                this.drawLightning(context, particle.size);
                break;
                
            case 'cloud':
                this.drawCloud(context, particle.size);
                break;
                
            case 'ripple':
                this.drawRipple(context, particle.size);
                break;
                
            case 'explosion':
                this.drawExplosion(context, particle.size);
                break;
                
            default:
                // デフォルトは円
                context.beginPath();
                context.arc(0, 0, particle.size, 0, Math.PI * 2);
                context.fill();
                break;
        }
    }
    
    /**
     * トレイル描画
     */
    renderTrail(context, particle) {
        if (particle.trail.length < 2) return;
        
        context.strokeStyle = particle.color;
        context.lineWidth = particle.size * 0.5;
        context.lineCap = 'round';
        
        context.beginPath();
        context.moveTo(
            particle.trail[0].x - particle.x,
            particle.trail[0].y - particle.y
        );
        
        for (let i = 1; i < particle.trail.length; i++) {
            const trailPoint = particle.trail[i];
            context.globalAlpha = trailPoint.alpha * (i / particle.trail.length);
            context.lineTo(
                trailPoint.x - particle.x,
                trailPoint.y - particle.y
            );
        }
        
        context.stroke();
    }
    
    /**
     * 星形描画
     */
    drawStar(context, size) {
        const spikes = 5;
        const outerRadius = size;
        const innerRadius = size * 0.5;
        
        context.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }
        context.closePath();
        context.fill();
    }
    
    /**
     * ダイヤモンド描画
     */
    drawDiamond(context, size) {
        context.beginPath();
        context.moveTo(0, -size);
        context.lineTo(size * 0.7, 0);
        context.lineTo(0, size);
        context.lineTo(-size * 0.7, 0);
        context.closePath();
        context.fill();
        
        // ハイライト
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 1;
        context.stroke();
    }
    
    /**
     * スパイク描画
     */
    drawSpike(context, size) {
        context.beginPath();
        context.moveTo(0, -size);
        context.lineTo(size * 0.3, size * 0.3);
        context.lineTo(-size * 0.3, size * 0.3);
        context.closePath();
        context.fill();
    }
    
    /**
     * 稲妻描画
     */
    drawLightning(context, size) {
        context.lineWidth = size;
        context.lineCap = 'round';
        
        context.beginPath();
        context.moveTo(-size, -size);
        context.lineTo(size * 0.5, 0);
        context.lineTo(-size * 0.5, size);
        context.stroke();
    }
    
    /**
     * 雲描画
     */
    drawCloud(context, size) {
        context.globalAlpha *= 0.6;
        
        context.beginPath();
        context.arc(-size * 0.5, 0, size * 0.5, 0, Math.PI * 2);
        context.arc(size * 0.5, 0, size * 0.5, 0, Math.PI * 2);
        context.arc(0, -size * 0.3, size * 0.4, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * 波紋描画
     */
    drawRipple(context, size) {
        context.strokeStyle = context.fillStyle;
        context.lineWidth = 2;
        context.globalAlpha *= 0.5;
        
        context.beginPath();
        context.arc(0, 0, size, 0, Math.PI * 2);
        context.stroke();
    }
    
    /**
     * 爆発描画
     */
    drawExplosion(context, size) {
        // 不規則な爆発形状
        context.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const radius = size * (0.8 + Math.random() * 0.4);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }
        context.closePath();
        context.fill();
    }
    
    /**
     * 全パーティクルをクリア
     */
    clear() {
        this.particles.forEach(particle => {
            this.returnParticleToPool(particle);
        });
        this.particles = [];
    }
    
    /**
     * パーティクル数を取得
     */
    getParticleCount() {
        return this.particles.length;
    }
    
    /**
     * アクティブなパーティクルを取得
     */
    getActiveParticles() {
        return this.particles.filter(p => p.isActive);
    }
    
    /**
     * 全パーティクルをクリア（clearAllParticlesエイリアス）
     */
    clearAllParticles() {
        this.clear();
    }
}