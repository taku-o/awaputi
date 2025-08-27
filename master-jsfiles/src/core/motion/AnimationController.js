/**
 * AnimationController
 * アクティブアニメーション管理、一時停止・再開・強度制御、パフォーマンス監視
 */
export class AnimationController {
    constructor(motionManager) {
        this.motionManager = motionManager;
        this.visualAccessibilityManager = motionManager.visualAccessibilityManager;
        this.accessibilityManager = motionManager.accessibilityManager;
        this.gameEngine = motionManager.gameEngine;
        
        // アニメーション状態管理
        this.activeAnimations = motionManager.activeAnimations;
        this.pausedAnimations = motionManager.pausedAnimations;
        this.animationObservers = motionManager.animationObservers;
        
        // CSS アニメーション管理
        this.dynamicStyleSheet = null;
        this.cssRules = new Map();
        
        // パフォーマンス監視
        this.performanceMonitor = motionManager.performanceMonitor;
        
        // 統計情報
        this.stats = motionManager.stats;
        
        console.log('[AnimationController] Component initialized');
    }
    
    /**
     * 動的スタイルシートの作成
     */
    createDynamicStyleSheet() {
        this.dynamicStyleSheet = document.createElement('style');
        this.dynamicStyleSheet.id = 'motion-manager-styles';
        this.dynamicStyleSheet.textContent = `
            /* モーションレベル基本設定 */
            .motion-none * {
                animation: none !important;
                transition: none !important;
                transform: none !important;
            }
            
            .motion-essential * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
            
            .motion-reduced * {
                animation-duration: calc(var(--original-duration, 1s) * 0.5) !important;
                transition-duration: calc(var(--original-duration, 1s) * 0.5) !important;
                animation-iteration-count: 1 !important;
            }
            
            .motion-reduced .parallax {
                transform: none !important;
            }
            
            /* カテゴリ別制御 */
            .motion-category-disabled {
                animation-play-state: paused !important;
                transition: none !important;
            }
            
            /* 前庭安全モード */
            .vestibular-safe * {
                max-width: 100vw !important;
                max-height: 100vh !important;
            }
            
            .vestibular-safe .rotating {
                animation-duration: 2s !important;
                animation-iteration-count: 1 !important;
            }
            
            .vestibular-safe .scaling {
                transform: scale(1) !important;
            }
            
            .vestibular-safe .parallax {
                transform: translateZ(0) !important;
            }
            
            /* パフォーマンス最適化 */
            .performance-mode * {
                will-change: auto !important;
                transform: translateZ(0);
            }
            
            .performance-mode .complex-animation {
                animation: none !important;
            }
            
            /* 危険パターン警告 */
            .motion-warning {
                border: 3px solid #ff6b6b !important;
                background: rgba(255, 107, 107, 0.1) !important;
            }
            
            .motion-warning::before {
                content: '⚠️ 激しいアニメーション';
                position: absolute;
                top: -25px;
                left: 0;
                background: #ff6b6b;
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 11px;
                z-index: 1000;
            }
            
            /* ゲーム要素特別制御 */
            .game-motion-controlled {
                --motion-intensity: var(--game-motion-intensity, 1.0);
                --motion-duration: var(--game-motion-duration, 1.0);
            }
            
            .game-motion-controlled * {
                animation-duration: calc(var(--original-duration, 1s) * var(--motion-duration)) !important;
                transform: scale(var(--motion-intensity)) !important;
            }
        `;
        document.head.appendChild(this.dynamicStyleSheet);
    }
    
    /**
     * パフォーマンス監視の開始
     */
    startPerformanceMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const monitorFrame = (currentTime) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                this.performanceMonitor.frameRate = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // パフォーマンス低下の検出
                if (this.performanceMonitor.frameRate < 30 && 
                    this.motionManager.userPreferences.autoReduceOnPerformance) {
                    this.handlePerformanceDegradation();
                }
            }
            
            this.performanceMonitor.lastFrameTime = currentTime;
            requestAnimationFrame(monitorFrame);
        };
        
        requestAnimationFrame(monitorFrame);
    }
    
    /**
     * パフォーマンス低下の処理
     */
    handlePerformanceDegradation() {
        const currentLevel = this.motionManager.currentLevel;
        let newLevel = currentLevel;
        
        // 段階的にレベルを下げる
        if (currentLevel === 'enhanced') newLevel = 'normal';
        else if (currentLevel === 'normal') newLevel = 'reduced';
        else if (currentLevel === 'reduced') newLevel = 'essential';
        
        if (newLevel !== currentLevel) {
            console.log(`Performance degradation detected. Reducing motion level: ${currentLevel} → ${newLevel}`);
            this.motionManager.setMotionLevel(newLevel);
            this.stats.performanceAdjustments++;
        }
    }
    
    /**
     * アニメーションの登録
     */
    registerAnimation(element, category = 'general', options = {}) {
        try {
            const id = this.generateAnimationId();
            const animationData = {
                id,
                element,
                category,
                options,
                startTime: Date.now(),
                duration: options.duration || null,
                isActive: true,
                isPaused: false
            };
            
            this.activeAnimations.set(id, animationData);
            this.stats.animationsControlled++;
            
            // カテゴリ設定の適用
            this.applyCategorySettings(element, category);
            
            // 前庭安全性の検証
            if (this.motionManager.config.vestibularSafety) {
                this.validateAndAdjustAnimation(animationData);
            }
            
            // オブザーバーの設定
            this.setupAnimationObserver(animationData);
            
            console.log(`Animation registered: ${id} (${category})`);
            return id;
            
        } catch (error) {
            console.error('Failed to register animation:', error);
            return null;
        }
    }
    
    /**
     * アニメーションの登録解除
     */
    unregisterAnimation(animationId) {
        const animation = this.activeAnimations.get(animationId);
        if (animation) {
            this.activeAnimations.delete(animationId);
            this.pausedAnimations.delete(animationId);
            
            // オブザーバーのクリーンアップ
            if (this.animationObservers.has(animationId)) {
                this.animationObservers.get(animationId).disconnect();
                this.animationObservers.delete(animationId);
            }
            
            console.log(`Animation unregistered: ${animationId}`);
            return true;
        }
        return false;
    }
    
    /**
     * カテゴリ設定の適用
     */
    applyCategorySettings(element, category) {
        const config = this.motionManager.config.motionCategories[category];
        if (!config) return;
        
        if (!config.enabled) {
            element.classList.add('motion-category-disabled');
            return;
        }
        
        // CSS カスタムプロパティで強度と速度を制御
        element.style.setProperty('--motion-intensity', config.intensity);
        element.style.setProperty('--motion-duration', config.duration);
        
        // 段階的制御の適用
        const granular = this.motionManager.userPreferences.granularControls;
        
        if (category === 'particles') {
            element.style.setProperty('--particle-density', granular.particleDensity);
        } else if (category === 'camera') {
            element.style.setProperty('--camera-movement', granular.cameraMovement);
        } else if (category === 'background') {
            element.style.setProperty('--background-motion', granular.backgroundMotion);
        }
        
        // 選択的軽減の適用
        const selective = this.motionManager.userPreferences.selectiveReduction;
        
        if (selective.disableRotation && element.style.transform?.includes('rotate')) {
            element.style.transform = element.style.transform.replace(/rotate\([^)]*\)/, '');
        }
        
        if (selective.disableScaling && element.style.transform?.includes('scale')) {
            element.style.transform = element.style.transform.replace(/scale\([^)]*\)/, '');
        }
        
        if (selective.disableParallax && category === 'parallax') {
            element.classList.add('motion-category-disabled');
        }
    }
    
    /**
     * アニメーションの検証と調整
     */
    validateAndAdjustAnimation(animationData) {
        const element = animationData.element;
        const computedStyle = getComputedStyle(element);
        
        // 回転速度の検証
        const transform = computedStyle.transform;
        if (transform && transform.includes('rotate')) {
            const rotationMatch = transform.match(/rotate\(([0-9.]+)deg\)/);
            if (rotationMatch) {
                const rotation = parseFloat(rotationMatch[1]);
                const duration = parseFloat(computedStyle.animationDuration) || 1;
                const rotationSpeed = rotation / duration;
                
                if (rotationSpeed > this.motionManager.config.vestibularGuidelines.maxRotationSpeed) {
                    element.style.animationDuration = `${rotation / this.motionManager.config.vestibularGuidelines.maxRotationSpeed}s`;
                    console.log(`Animation ${animationData.id}: Rotation speed adjusted for vestibular safety`);
                }
            }
        }
        
        // スケール変更の検証
        if (transform && transform.includes('scale')) {
            const scaleMatch = transform.match(/scale\(([0-9.]+)\)/);
            if (scaleMatch) {
                const scale = parseFloat(scaleMatch[1]);
                if (scale > this.motionManager.config.vestibularGuidelines.maxScaleChange) {
                    element.style.transform = transform.replace(/scale\([^)]*\)/, `scale(${this.motionManager.config.vestibularGuidelines.maxScaleChange})`);
                    console.log(`Animation ${animationData.id}: Scale adjusted for vestibular safety`);
                }
            }
        }
    }
    
    /**
     * アニメーションオブザーバーの設定
     */
    setupAnimationObserver(animationData) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    this.validateAndAdjustAnimation(animationData);
                }
            });
        });
        
        observer.observe(animationData.element, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        this.animationObservers.set(animationData.id, observer);
    }
    
    /**
     * アニメーションの一時停止
     */
    pauseAnimation(animationId) {
        const animation = this.activeAnimations.get(animationId);
        if (animation && !animation.isPaused) {
            animation.element.style.animationPlayState = 'paused';
            animation.isPaused = true;
            this.pausedAnimations.add(animationId);
            this.stats.animationsPaused++;
            
            console.log(`Animation paused: ${animationId}`);
            return true;
        }
        return false;
    }
    
    /**
     * アニメーションの再開
     */
    resumeAnimation(animationId) {
        const animation = this.activeAnimations.get(animationId);
        if (animation && animation.isPaused) {
            animation.element.style.animationPlayState = 'running';
            animation.isPaused = false;
            this.pausedAnimations.delete(animationId);
            
            console.log(`Animation resumed: ${animationId}`);
            return true;
        }
        return false;
    }
    
    /**
     * カテゴリ別アニメーションの一時停止
     */
    pauseAnimationsByCategory(category) {
        let pausedCount = 0;
        
        this.activeAnimations.forEach((animation, id) => {
            if (animation.category === category && !animation.isPaused) {
                if (this.pauseAnimation(id)) {
                    pausedCount++;
                }
            }
        });
        
        console.log(`Paused ${pausedCount} animations in category: ${category}`);
        return pausedCount;
    }
    
    /**
     * カテゴリ別アニメーションの再開
     */
    resumeAnimationsByCategory(category) {
        let resumedCount = 0;
        
        this.activeAnimations.forEach((animation, id) => {
            if (animation.category === category && animation.isPaused) {
                if (this.resumeAnimation(id)) {
                    resumedCount++;
                }
            }
        });
        
        console.log(`Resumed ${resumedCount} animations in category: ${category}`);
        return resumedCount;
    }
    
    /**
     * すべてのアニメーションの一時停止
     */
    pauseAllAnimations() {
        let pausedCount = 0;
        
        this.activeAnimations.forEach((animation, id) => {
            if (!animation.isPaused && this.pauseAnimation(id)) {
                pausedCount++;
            }
        });
        
        console.log(`Paused all animations: ${pausedCount} total`);
        return pausedCount;
    }
    
    /**
     * すべてのアニメーションの再開
     */
    resumeAllAnimations() {
        let resumedCount = 0;
        
        this.pausedAnimations.forEach(id => {
            if (this.resumeAnimation(id)) {
                resumedCount++;
            }
        });
        
        console.log(`Resumed all animations: ${resumedCount} total`);
        return resumedCount;
    }
    
    /**
     * アニメーション強度の調整
     */
    adjustAnimationIntensity(animationId, intensityMultiplier) {
        const animation = this.activeAnimations.get(animationId);
        if (!animation) return false;
        
        const element = animation.element;
        const currentIntensity = parseFloat(element.style.getPropertyValue('--motion-intensity') || '1.0');
        const newIntensity = currentIntensity * intensityMultiplier;
        
        element.style.setProperty('--motion-intensity', newIntensity.toFixed(2));
        
        console.log(`Animation ${animationId} intensity adjusted: ${currentIntensity} → ${newIntensity}`);
        return true;
    }
    
    /**
     * アニメーション速度の調整
     */
    adjustAnimationSpeed(animationId, speedMultiplier) {
        const animation = this.activeAnimations.get(animationId);
        if (!animation) return false;
        
        const element = animation.element;
        const currentDuration = parseFloat(element.style.getPropertyValue('--motion-duration') || '1.0');
        const newDuration = currentDuration / speedMultiplier; // 速度を上げる = 時間を短くする
        
        element.style.setProperty('--motion-duration', newDuration.toFixed(2));
        
        console.log(`Animation ${animationId} speed adjusted: ${currentDuration} → ${newDuration}`);
        return true;
    }
    
    /**
     * アニメーションIDの生成
     */
    generateAnimationId() {
        return `animation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * アニメーション統計の取得
     */
    getAnimationStats() {
        return {
            active: this.activeAnimations.size,
            paused: this.pausedAnimations.size,
            observed: this.animationObservers.size,
            performance: {
                frameRate: this.performanceMonitor.frameRate,
                droppedFrames: this.performanceMonitor.droppedFrames,
                lastFrameTime: this.performanceMonitor.lastFrameTime
            },
            categories: this.getAnimationsByCategory(),
            totalControlled: this.stats.animationsControlled,
            totalPaused: this.stats.animationsPaused,
            totalReduced: this.stats.animationsReduced
        };
    }
    
    /**
     * カテゴリ別アニメーション統計
     */
    getAnimationsByCategory() {
        const categories = {};
        
        this.activeAnimations.forEach(animation => {
            const category = animation.category;
            if (!categories[category]) {
                categories[category] = { active: 0, paused: 0 };
            }
            
            categories[category].active++;
            if (animation.isPaused) {
                categories[category].paused++;
            }
        });
        
        return categories;
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy() {
        // すべてのオブザーバーを停止
        this.animationObservers.forEach(observer => observer.disconnect());
        this.animationObservers.clear();
        
        // アニメーション停止
        this.pauseAllAnimations();
        this.activeAnimations.clear();
        this.pausedAnimations.clear();
        
        // 動的スタイルシートの削除
        if (this.dynamicStyleSheet && this.dynamicStyleSheet.parentNode) {
            this.dynamicStyleSheet.parentNode.removeChild(this.dynamicStyleSheet);
        }
        
        console.log('[AnimationController] Component destroyed');
    }
}