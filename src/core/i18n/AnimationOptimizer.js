import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * アニメーション最適化システム
 * 言語切り替え時のアニメーションを最適化し、パフォーマンスを向上
 */
export class AnimationOptimizer {
    constructor() {
        // 基本設定
        this.enabled = true;
        this.optimizationLevel = 'balanced'; // 'performance', 'balanced', 'quality'
        this.maxConcurrentAnimations = 10;
        this.defaultDuration = 300; // ms
        this.reducedMotionEnabled = false;
        
        // アニメーション管理
        this.activeAnimations = new Map();
        this.animationQueue = [];
        this.scheduledAnimations = new Set();
        this.runningAnimations = new Set();
        
        // フレーム管理
        this.frameScheduler = null;
        this.frameCallbacks = new Set();
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // 最適化戦略
        this.strategies = {
            batchTransitions: true,
            useTransforms: true,
            avoidLayout: true,
            useWillChange: true,
            preferOpacity: true,
            useCompositorLayers: true
        };
        
        // アニメーションプリセット
        this.presets = {
            fadeIn: {
                keyframes: [
                    { opacity: 0, transform: 'scale(0.95)' },
                    { opacity: 1, transform: 'scale(1)' }
                ],
                options: { duration: 200, easing: 'ease-out' }
            },
            fadeOut: {
                keyframes: [
                    { opacity: 1, transform: 'scale(1)' },
                    { opacity: 0, transform: 'scale(0.95)' }
                ],
                options: { duration: 150, easing: 'ease-in' }
            },
            slideIn: {
                keyframes: [
                    { transform: 'translateY(-10px)', opacity: 0 },
                    { transform: 'translateY(0)', opacity: 1 }
                ],
                options: { duration: 250, easing: 'ease-out' }
            },
            slideOut: {
                keyframes: [
                    { transform: 'translateY(0)', opacity: 1 },
                    { transform: 'translateY(-10px)', opacity: 0 }
                ],
                options: { duration: 200, easing: 'ease-in' }
            },
            textChange: {
                keyframes: [
                    { opacity: 1, transform: 'translateY(0)' },
                    { opacity: 0.3, transform: 'translateY(-2px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ],
                options: { duration: 300, easing: 'ease-in-out' }
            }
        };
        
        // パフォーマンス監視
        this.performanceMetrics = {
            animationCount: 0,
            droppedFrames: 0,
            averageFrameTime: 0,
            frameTimeHistory: [],
            animationTimes: [],
            gpuMemoryUsage: 0
        };
        
        // 統計情報
        this.stats = {
            totalAnimations: 0,
            completedAnimations: 0,
            cancelledAnimations: 0,
            optimizedAnimations: 0,
            batchedAnimations: 0,
            averageDuration: 0,
            totalDuration: 0
        };
        
        // 初期化
        this.initialize();
        
        console.log('AnimationOptimizer initialized with level:', this.optimizationLevel);
    }
    
    /**
     * 初期化
     */
    initialize() {
        // Reduced Motion 検出
        this.detectReducedMotion();
        
        // パフォーマンス監視の開始
        this.startPerformanceMonitoring();
        
        // Intersection Observer の設定
        this.setupIntersectionObserver();
        
        // フレームスケジューラーの開始
        this.startFrameScheduler();
    }
    
    /**
     * 言語切り替えアニメーションを最適化
     */
    async optimizeLanguageSwitchAnimation(elements, options = {}) {
        const startTime = performance.now();
        
        try {
            const {
                animationType = 'textChange',
                duration = this.defaultDuration,
                staggerDelay = 50,
                batchSize = 10,
                priority = 'normal'
            } = options;
            
            if (!this.enabled || this.reducedMotionEnabled) {
                return this.skipAnimation(elements, 'Animation disabled');
            }
            
            this.stats.totalAnimations++;
            
            // 要素を優先度でグループ化
            const groupedElements = this.groupElementsByPriority(elements);
            
            // バッチ処理でアニメーション
            const animationResults = [];
            for (const [priority, elementGroup] of groupedElements) {
                if (elementGroup.length > batchSize) {
                    const batches = this.createAnimationBatches(elementGroup, batchSize);
                    for (const batch of batches) {
                        const result = await this.executeBatchAnimation(batch, {
                            animationType,
                            duration,
                            staggerDelay,
                            priority
                        });
                        animationResults.push(result);
                    }
                } else {
                    const result = await this.executeBatchAnimation(elementGroup, {
                        animationType,
                        duration,
                        staggerDelay,
                        priority
                    });
                    animationResults.push(result);
                }
            }
            
            const totalTime = performance.now() - startTime;
            this.updateAnimationStats(totalTime, elements.length);
            
            console.log(`Language switch animation optimized in ${totalTime.toFixed(2)}ms for ${elements.length} elements`);
            
            return {
                success: true,
                elementsAnimated: elements.length,
                totalTime,
                batches: animationResults.length,
                stats: this.getAnimationStats()
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'ANIMATION_OPTIMIZER_ERROR', {
                operation: 'optimizeLanguageSwitchAnimation',
                elementCount: elements.length
            });
            
            return {
                success: false,
                error: error.message,
                totalTime: performance.now() - startTime
            };
        }
    }
    
    /**
     * 要素を優先度でグループ化
     */
    groupElementsByPriority(elements) {
        const groups = new Map([
            ['critical', []],
            ['high', []],
            ['normal', []],
            ['low', []]
        ]);
        
        for (const element of elements) {
            const priority = this.getElementPriority(element);
            const group = groups.get(priority) || groups.get('normal');
            group.push(element);
        }
        
        // 空のグループを削除
        for (const [priority, group] of groups) {
            if (group.length === 0) {
                groups.delete(priority);
            }
        }
        
        return groups;
    }
    
    /**
     * 要素の優先度を取得
     */
    getElementPriority(element) {
        // データ属性での指定
        const dataPriority = element.dataset.animationPriority;
        if (dataPriority) return dataPriority;
        
        // クラス名での判定
        if (element.classList.contains('critical')) return 'critical';
        if (element.classList.contains('high-priority')) return 'high';
        if (element.classList.contains('low-priority')) return 'low';
        
        // 要素タイプでの判定
        const tagPriority = {
            'H1': 'critical', 'H2': 'high', 'H3': 'high',
            'BUTTON': 'high', 'INPUT': 'high',
            'P': 'normal', 'SPAN': 'normal', 'DIV': 'normal',
            'SMALL': 'low', 'FOOTER': 'low'
        };
        
        return tagPriority[element.tagName] || 'normal';
    }
    
    /**
     * アニメーションバッチを作成
     */
    createAnimationBatches(elements, batchSize) {
        const batches = [];
        for (let i = 0; i < elements.length; i += batchSize) {
            batches.push(elements.slice(i, i + batchSize));
        }
        return batches;
    }
    
    /**
     * バッチアニメーションを実行
     */
    async executeBatchAnimation(elements, options) {
        const { animationType, duration, staggerDelay, priority } = options;
        const startTime = performance.now();
        
        try {
            // アニメーションの準備
            const animationSpecs = elements.map((element, index) => {
                const delay = staggerDelay * index;
                return {
                    element,
                    delay,
                    ...this.getOptimizedAnimationSpec(element, animationType, duration)
                };
            });
            
            // 同期実行（Web Animations API）
            const animations = animationSpecs.map(spec => 
                this.createOptimizedAnimation(spec)
            );
            
            // アニメーション開始
            const animationPromises = animations.map(animation => {
                this.registerAnimation(animation);
                animation.play();
                return animation.finished;
            });
            
            // 完了まで待機
            await Promise.allSettled(animationPromises);
            
            // 統計更新
            this.stats.batchedAnimations++;
            this.stats.completedAnimations += elements.length;
            
            const batchTime = performance.now() - startTime;
            
            return {
                success: true,
                elements: elements.length,
                duration: batchTime,
                priority
            };
            
        } catch (error) {
            console.warn('Batch animation failed:', error);
            this.stats.cancelledAnimations += elements.length;
            
            return {
                success: false,
                elements: elements.length,
                error: error.message
            };
        }
    }
    
    /**
     * 最適化されたアニメーション仕様を取得
     */
    getOptimizedAnimationSpec(element, animationType, duration) {
        const preset = this.presets[animationType] || this.presets.textChange;
        
        // 要素の現在状態を取得
        const computedStyle = window.getComputedStyle(element);
        const currentTransform = computedStyle.transform;
        const currentOpacity = computedStyle.opacity;
        
        // 最適化されたキーフレーム
        let optimizedKeyframes = [...preset.keyframes];
        
        // 最適化戦略の適用
        if (this.strategies.avoidLayout) {
            optimizedKeyframes = this.optimizeForLayout(optimizedKeyframes);
        }
        
        if (this.strategies.useTransforms) {
            optimizedKeyframes = this.optimizeTransforms(optimizedKeyframes);
        }
        
        // オプションの最適化
        const optimizedOptions = {
            ...preset.options,
            duration: this.getOptimizedDuration(duration),
            easing: this.getOptimizedEasing(preset.options.easing),
            fill: 'both'
        };
        
        return {
            keyframes: optimizedKeyframes,
            options: optimizedOptions
        };
    }
    
    /**
     * レイアウト回避の最適化
     */
    optimizeForLayout(keyframes) {
        return keyframes.map(frame => {
            const optimized = { ...frame };
            
            // レイアウトを引き起こすプロパティを変換に置き換え
            if (optimized.left !== undefined) {
                optimized.transform = (optimized.transform || '') + ` translateX(${optimized.left})`;
                delete optimized.left;
            }
            
            if (optimized.top !== undefined) {
                optimized.transform = (optimized.transform || '') + ` translateY(${optimized.top})`;
                delete optimized.top;
            }
            
            if (optimized.width !== undefined || optimized.height !== undefined) {
                // サイズ変更はscaleに変換
                const scaleTransform = optimized.width ? ` scaleX(${optimized.width / 100})` : '';
                optimized.transform = (optimized.transform || '') + scaleTransform;
                delete optimized.width;
                delete optimized.height;
            }
            
            return optimized;
        });
    }
    
    /**
     * 変換の最適化
     */
    optimizeTransforms(keyframes) {
        return keyframes.map(frame => {
            if (frame.transform) {
                // transform を最適化（GPU アクセラレーション用）
                let transform = frame.transform;
                
                // translate3d を使用してGPUアクセラレーションを有効化
                if (transform.includes('translate') && !transform.includes('translate3d')) {
                    transform = transform.replace(/translateX\(([^)]+)\)/, 'translate3d($1, 0, 0)');
                    transform = transform.replace(/translateY\(([^)]+)\)/, 'translate3d(0, $1, 0)');
                }
                
                frame.transform = transform;
            }
            
            return frame;
        });
    }
    
    /**
     * 最適化されたアニメーションを作成
     */
    createOptimizedAnimation(spec) {
        const { element, keyframes, options, delay } = spec;
        
        // will-change プロパティを設定
        if (this.strategies.useWillChange) {
            element.style.willChange = 'transform, opacity';
        }
        
        // コンポジターレイヤーの強制生成
        if (this.strategies.useCompositorLayers) {
            element.style.transform = element.style.transform || 'translateZ(0)';
        }
        
        // Web Animations API でアニメーション作成
        const animation = element.animate(keyframes, {
            ...options,
            delay
        });
        
        // アニメーション完了時のクリーンアップ
        animation.addEventListener('finish', () => {
            if (this.strategies.useWillChange) {
                element.style.willChange = 'auto';
            }
            this.unregisterAnimation(animation);
        });
        
        // キャンセル時のクリーンアップ
        animation.addEventListener('cancel', () => {
            if (this.strategies.useWillChange) {
                element.style.willChange = 'auto';
            }
            this.unregisterAnimation(animation);
        });
        
        return animation;
    }
    
    /**
     * 最適化された継続時間を取得
     */
    getOptimizedDuration(requestedDuration) {
        if (this.reducedMotionEnabled) {
            return Math.min(requestedDuration * 0.5, 150);
        }
        
        switch (this.optimizationLevel) {
            case 'performance':
                return Math.min(requestedDuration * 0.7, 200);
            case 'quality':
                return Math.min(requestedDuration * 1.2, 500);
            case 'balanced':
            default:
                return requestedDuration;
        }
    }
    
    /**
     * 最適化されたイージングを取得
     */
    getOptimizedEasing(requestedEasing) {
        if (this.optimizationLevel === 'performance') {
            // パフォーマンス優先の場合はシンプルなイージング
            const simpleEasings = {
                'ease-in-out': 'ease',
                'cubic-bezier(0.4, 0, 0.2, 1)': 'ease-out'
            };
            return simpleEasings[requestedEasing] || requestedEasing;
        }
        
        return requestedEasing;
    }
    
    /**
     * アニメーションをスキップ
     */
    skipAnimation(elements, reason) {
        console.log(`Animation skipped: ${reason}`);
        
        return {
            success: true,
            skipped: true,
            reason,
            elementsCount: elements.length
        };
    }
    
    /**
     * アニメーションを登録
     */
    registerAnimation(animation) {
        const id = this.generateAnimationId();
        this.activeAnimations.set(id, {
            animation,
            startTime: performance.now(),
            element: animation.effect.target
        });
        this.runningAnimations.add(animation);
        
        return id;
    }
    
    /**
     * アニメーションの登録を解除
     */
    unregisterAnimation(animation) {
        this.runningAnimations.delete(animation);
        
        // アクティブアニメーションから削除
        for (const [id, data] of this.activeAnimations) {
            if (data.animation === animation) {
                this.activeAnimations.delete(id);
                break;
            }
        }
    }
    
    /**
     * アニメーションIDを生成
     */
    generateAnimationId() {
        return `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Reduced Motion を検出
     */
    detectReducedMotion() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.reducedMotionEnabled = mediaQuery.matches;
            
            mediaQuery.addEventListener('change', (e) => {
                this.reducedMotionEnabled = e.matches;
                console.log('Reduced motion preference changed:', e.matches);
                
                if (e.matches) {
                    this.cancelAllAnimations();
                }
            });
        }
    }
    
    /**
     * パフォーマンス監視を開始
     */
    startPerformanceMonitoring() {
        if (typeof PerformanceObserver !== 'undefined') {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    
                    for (const entry of entries) {
                        if (entry.entryType === 'measure' && entry.name.includes('animation')) {
                            this.performanceMetrics.animationTimes.push(entry.duration);
                        }
                    }
                });
                
                observer.observe({ entryTypes: ['measure'] });
            } catch (error) {
                console.warn('Performance monitoring setup failed:', error);
            }
        }
    }
    
    /**
     * Intersection Observer を設定
     */
    setupIntersectionObserver() {
        if (typeof IntersectionObserver !== 'undefined') {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    const element = entry.target;
                    
                    if (!entry.isIntersecting) {
                        // 画面外の要素のアニメーションを一時停止
                        this.pauseElementAnimations(element);
                    } else {
                        // 画面内に戻った要素のアニメーションを再開
                        this.resumeElementAnimations(element);
                    }
                }
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });
        }
    }
    
    /**
     * フレームスケジューラーを開始
     */
    startFrameScheduler() {
        const scheduleFrame = (timestamp) => {
            const deltaTime = timestamp - this.lastFrameTime;
            
            if (deltaTime >= this.frameInterval) {
                // フレーム処理を実行
                this.processFrameCallbacks(deltaTime);
                
                // フレーム時間を記録
                this.recordFrameTime(deltaTime);
                
                this.lastFrameTime = timestamp;
            }
            
            this.frameScheduler = requestAnimationFrame(scheduleFrame);
        };
        
        this.frameScheduler = requestAnimationFrame(scheduleFrame);
    }
    
    /**
     * フレームコールバックを処理
     */
    processFrameCallbacks(deltaTime) {
        for (const callback of this.frameCallbacks) {
            try {
                callback(deltaTime);
            } catch (error) {
                console.warn('Frame callback error:', error);
                this.frameCallbacks.delete(callback);
            }
        }
    }
    
    /**
     * フレーム時間を記録
     */
    recordFrameTime(deltaTime) {
        this.performanceMetrics.frameTimeHistory.push(deltaTime);
        
        // 履歴サイズを制限
        if (this.performanceMetrics.frameTimeHistory.length > 60) {
            this.performanceMetrics.frameTimeHistory.shift();
        }
        
        // 平均フレーム時間を計算
        const sum = this.performanceMetrics.frameTimeHistory.reduce((a, b) => a + b, 0);
        this.performanceMetrics.averageFrameTime = sum / this.performanceMetrics.frameTimeHistory.length;
        
        // ドロップフレームを検出
        if (deltaTime > this.frameInterval * 2) {
            this.performanceMetrics.droppedFrames++;
        }
    }
    
    /**
     * 要素のアニメーションを一時停止
     */
    pauseElementAnimations(element) {
        for (const [id, data] of this.activeAnimations) {
            if (data.element === element && data.animation.playState === 'running') {
                data.animation.pause();
            }
        }
    }
    
    /**
     * 要素のアニメーションを再開
     */
    resumeElementAnimations(element) {
        for (const [id, data] of this.activeAnimations) {
            if (data.element === element && data.animation.playState === 'paused') {
                data.animation.play();
            }
        }
    }
    
    /**
     * 全アニメーションをキャンセル
     */
    cancelAllAnimations() {
        for (const animation of this.runningAnimations) {
            animation.cancel();
        }
        
        this.activeAnimations.clear();
        this.runningAnimations.clear();
        this.stats.cancelledAnimations += this.runningAnimations.size;
        
        console.log('All animations cancelled');
    }
    
    /**
     * アニメーション統計を更新
     */
    updateAnimationStats(totalTime, elementCount) {
        this.stats.totalDuration += totalTime;
        this.stats.averageDuration = this.stats.totalDuration / this.stats.totalAnimations;
        this.performanceMetrics.animationCount = this.activeAnimations.size;
    }
    
    /**
     * アニメーション統計を取得
     */
    getAnimationStats() {
        const fps = this.performanceMetrics.averageFrameTime > 0 
            ? 1000 / this.performanceMetrics.averageFrameTime 
            : 0;
            
        return {
            ...this.stats,
            activeAnimations: this.activeAnimations.size,
            queuedAnimations: this.animationQueue.length,
            averageFPS: Math.round(fps * 10) / 10,
            droppedFrames: this.performanceMetrics.droppedFrames,
            optimizationLevel: this.optimizationLevel,
            reducedMotionEnabled: this.reducedMotionEnabled,
            strategiesUsed: Object.entries(this.strategies)
                .filter(([, enabled]) => enabled)
                .map(([strategy]) => strategy)
        };
    }
    
    /**
     * 詳細パフォーマンス統計を取得
     */
    getDetailedPerformanceStats() {
        const stats = this.getAnimationStats();
        
        return {
            ...stats,
            frameTimeDistribution: {
                min: Math.min(...this.performanceMetrics.frameTimeHistory) || 0,
                max: Math.max(...this.performanceMetrics.frameTimeHistory) || 0,
                average: this.performanceMetrics.averageFrameTime
            },
            animationTimeDistribution: {
                min: Math.min(...this.performanceMetrics.animationTimes) || 0,
                max: Math.max(...this.performanceMetrics.animationTimes) || 0,
                average: this.performanceMetrics.animationTimes.length > 0
                    ? this.performanceMetrics.animationTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.animationTimes.length
                    : 0
            },
            presetUsage: Object.keys(this.presets),
            strategyEffectiveness: this.calculateStrategyEffectiveness()
        };
    }
    
    /**
     * 戦略の効果を計算
     */
    calculateStrategyEffectiveness() {
        const effectiveness = {};
        
        for (const [strategy, enabled] of Object.entries(this.strategies)) {
            if (enabled) {
                // 簡易的な効果測定（実際の実装ではより詳細な測定が必要）
                effectiveness[strategy] = {
                    enabled: true,
                    estimatedImprovement: this.getStrategyImprovement(strategy)
                };
            }
        }
        
        return effectiveness;
    }
    
    /**
     * 戦略の改善効果を取得
     */
    getStrategyImprovement(strategy) {
        const improvements = {
            batchTransitions: 25, // 25% 改善
            useTransforms: 40,
            avoidLayout: 60,
            useWillChange: 20,
            preferOpacity: 30,
            useCompositorLayers: 35
        };
        
        return improvements[strategy] || 10;
    }
    
    /**
     * 設定を更新
     */
    updateConfiguration(config) {
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
        }
        
        if (config.optimizationLevel) {
            this.optimizationLevel = config.optimizationLevel;
        }
        
        if (config.maxConcurrentAnimations !== undefined) {
            this.maxConcurrentAnimations = config.maxConcurrentAnimations;
        }
        
        if (config.strategies) {
            this.strategies = { ...this.strategies, ...config.strategies };
        }
        
        console.log('AnimationOptimizer configuration updated:', config);
    }
    
    /**
     * カスタムプリセットを追加
     */
    addCustomPreset(name, preset) {
        this.presets[name] = preset;
        console.log(`Custom animation preset added: ${name}`);
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        // 全アニメーションをキャンセル
        this.cancelAllAnimations();
        
        // フレームスケジューラーを停止
        if (this.frameScheduler) {
            cancelAnimationFrame(this.frameScheduler);
        }
        
        // オブザーバーを切断
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        // フレームコールバックをクリア
        this.frameCallbacks.clear();
        
        console.log('AnimationOptimizer cleaned up');
    }
}