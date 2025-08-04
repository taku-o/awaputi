import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * モーション管理クラス
 * アニメーション制御の詳細制御と前庭障害への配慮
 */
export class MotionManager {
    constructor(visualAccessibilityManager) {
        this.visualAccessibilityManager = visualAccessibilityManager;
        this.accessibilityManager = visualAccessibilityManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager?.gameEngine;
        
        // モーション設定
        this.config = {
            enabled: true,
            globalReducedMotion: false,
            respectSystemPreference: true,
            vestibularSafety: true,
            motionLevels: {
                none: 'すべてのアニメーションを無効',
                essential: '重要なアニメーションのみ',
                reduced: '軽減されたアニメーション',
                normal: '通常のアニメーション',
                enhanced: '強化されたアニメーション'
            },
            motionCategories: {
                transitions: { enabled: true, intensity: 1.0, duration: 1.0 },
                transforms: { enabled: true, intensity: 1.0, duration: 1.0 },
                parallax: { enabled: true, intensity: 0.5, duration: 1.0 },
                particles: { enabled: true, intensity: 0.8, duration: 1.0 },
                camera: { enabled: true, intensity: 0.3, duration: 1.0 },
                ui: { enabled: true, intensity: 1.0, duration: 1.0 },
                game: { enabled: true, intensity: 0.9, duration: 1.0 },
                background: { enabled: true, intensity: 0.6, duration: 1.0 }
            },
            vestibularGuidelines: {
                maxRotationSpeed: 360, // 度/秒
                maxScaleChange: 2.0,
                maxParallaxDistance: 100, // ピクセル
                flashingThreshold: 3, // 回/秒
                autoplayPause: 5000 // 5秒で自動停止
            }
        };
        
        // 現在の設定
        this.currentLevel = 'normal';
        this.activeAnimations = new Map();
        this.pausedAnimations = new Set();
        this.animationObservers = new Map();
        
        // CSS アニメーション管理
        this.dynamicStyleSheet = null;
        this.cssRules = new Map();
        
        // パフォーマンス監視
        this.performanceMonitor = {
            frameRate: 60,
            droppedFrames: 0,
            animationCount: 0,
            lastFrameTime: 0
        };
        
        // 統計情報
        this.stats = {
            animationsControlled: 0,
            animationsPaused: 0,
            animationsReduced: 0,
            vestibularWarnings: 0,
            performanceAdjustments: 0,
            sessionStart: Date.now()
        };
        
        // ユーザー設定
        this.userPreferences = {
            motionLevel: 'normal',
            vestibularSafety: true,
            autoReduceOnPerformance: true,
            customIntensities: new Map(),
            flashingSensitivity: 'medium', // 'low', 'medium', 'high'
            parallaxSensitivity: 'medium',
            // 新しい段階的制御設定
            granularControls: {
                animationIntensity: 1.0,     // アニメーション強度 (0.0-2.0)
                transitionSpeed: 1.0,        // トランジション速度 (0.1-3.0)
                effectsLevel: 1.0,           // エフェクトレベル (0.0-2.0)
                particleDensity: 1.0,        // パーティクル密度 (0.0-2.0)
                cameraMovement: 0.5,         // カメラ移動 (0.0-1.0)
                backgroundMotion: 0.8        // 背景モーション (0.0-1.0)
            },
            // 選択的モーション軽減
            selectiveReduction: {
                disableRotation: false,
                disableScaling: false,
                disableParallax: false,
                disableParticles: false,
                disableCameraShake: false,
                disableBackgroundAnimation: false
            }
        };
        
        // 危険なモーションパターンの検出
        this.hazardPatterns = {
            rapidFlashing: { threshold: 3, detected: false },
            rapidRotation: { threshold: 720, detected: false }, // 度/秒
            extremeZoom: { threshold: 3.0, detected: false },
            violentShaking: { threshold: 20, detected: false } // ピクセル/フレーム
        };
        
        console.log('MotionManager initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // システム設定の検出
            this.detectSystemPreferences();
            
            // ユーザー設定の読み込み
            this.loadUserPreferences();
            
            // 動的スタイルシートの作成
            this.createDynamicStyleSheet();
            
            // パフォーマンス監視の開始
            this.startPerformanceMonitoring();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // 初期アニメーション分析
            this.analyzeExistingAnimations();
            
            console.log('MotionManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'MOTION_MANAGER_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * システム設定の検出
     */
    detectSystemPreferences() {
        if (!this.config.respectSystemPreference) return;
        
        try {
            if (window.matchMedia) {
                const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
                
                if (reducedMotionQuery.matches) {
                    this.config.globalReducedMotion = true;
                    this.currentLevel = 'reduced';
                    console.log('System reduced motion preference detected');
                }
                
                // 変更を監視
                reducedMotionQuery.addEventListener('change', (e) => {
                    this.handleSystemPreferenceChange(e.matches);
                });
            }
        } catch (error) {
            console.warn('Failed to detect motion preferences:', error);
        }
    }
    
    /**
     * システム設定変更の処理
     */
    handleSystemPreferenceChange(reducedMotion) {
        this.config.globalReducedMotion = reducedMotion;
        
        if (reducedMotion) {
            this.setMotionLevel('reduced');
        } else {
            this.setMotionLevel(this.userPreferences.motionLevel);
        }
        
        console.log(`System motion preference changed: ${reducedMotion ? 'reduced' : 'normal'}`);
    }
    
    /**
     * ユーザー設定の読み込み
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('motionManager_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.userPreferences, preferences);
                
                // カスタム強度の復元
                if (preferences.customIntensities) {
                    this.userPreferences.customIntensities = new Map(preferences.customIntensities);
                }
                
                // 設定を適用
                if (!this.config.globalReducedMotion) {
                    this.setMotionLevel(this.userPreferences.motionLevel);
                }
            }
        } catch (error) {
            console.warn('Failed to load motion preferences:', error);
        }
    }
    
    /**
     * ユーザー設定の保存
     */
    saveUserPreferences() {
        try {
            const preferences = {
                ...this.userPreferences,
                customIntensities: Array.from(this.userPreferences.customIntensities.entries())
            };
            
            localStorage.setItem('motionManager_preferences', 
                JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save motion preferences:', error);
        }
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
                    this.userPreferences.autoReduceOnPerformance) {
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
        if (this.currentLevel === 'none' || this.currentLevel === 'essential') {
            return; // 既に最低レベル
        }
        
        const levelOrder = ['enhanced', 'normal', 'reduced', 'essential', 'none'];
        const currentIndex = levelOrder.indexOf(this.currentLevel);
        
        if (currentIndex < levelOrder.length - 1) {
            const newLevel = levelOrder[currentIndex + 1];
            console.warn(`Performance degradation detected, reducing motion to: ${newLevel}`);
            this.setMotionLevel(newLevel);
            this.stats.performanceAdjustments++;
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ページ可視性変更
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAllAnimations();
            } else {
                this.resumeAllAnimations();
            }
        });
        
        // DOM変更の監視
        this.observeAnimations();
        
        // ゲームイベントの監視
        if (this.gameEngine) {
            this.gameEngine.addEventListener?.('bubblePopped', (event) => {
                this.analyzeGameAnimation(event.element, 'pop');
            });
            
            this.gameEngine.addEventListener?.('specialEffect', (event) => {
                this.analyzeGameAnimation(event.element, 'effect');
            });
        }
    }
    
    /**
     * アニメーションの監視
     */
    observeAnimations() {
        // CSS Animation監視
        this.animationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || 
                     mutation.attributeName === 'class')) {
                    this.analyzeElementAnimation(mutation.target);
                }
                
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.analyzeElementAnimation(node);
                        }
                    });
                }
            });
        });
        
        this.animationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
    
    /**
     * 既存アニメーションの分析
     */
    analyzeExistingAnimations() {
        const animatedElements = document.querySelectorAll('*');
        
        animatedElements.forEach(element => {
            this.analyzeElementAnimation(element);
        });
        
        console.log(`Analyzed ${animatedElements.length} elements for animations`);
    }
    
    /**
     * 要素アニメーションの分析
     */
    analyzeElementAnimation(element) {
        const styles = window.getComputedStyle(element);
        const hasAnimation = styles.animationName !== 'none';
        const hasTransition = styles.transitionProperty !== 'none';
        
        if (!hasAnimation && !hasTransition) {
            return;
        }
        
        const animationData = {
            element,
            type: hasAnimation ? 'animation' : 'transition',
            duration: parseFloat(styles.animationDuration || styles.transitionDuration || '0'),
            timing: styles.animationTimingFunction || styles.transitionTimingFunction,
            delay: parseFloat(styles.animationDelay || styles.transitionDelay || '0'),
            iterations: styles.animationIterationCount || '1',
            direction: styles.animationDirection || 'normal',
            category: this.categorizeAnimation(element, styles),
            hazardLevel: this.assessHazardLevel(element, styles)
        };
        
        this.activeAnimations.set(element, animationData);
        this.applyMotionControl(element, animationData);
        
        // 危険パターンの検出
        if (animationData.hazardLevel > 0) {
            this.handleHazardousAnimation(element, animationData);
        }
        
        this.stats.animationsControlled++;
    }
    
    /**
     * アニメーションのカテゴリ分類
     */
    categorizeAnimation(element, styles) {
        // 要素の種類とプロパティから分類
        const classes = Array.from(element.classList);
        
        if (classes.some(cls => cls.includes('particle'))) return 'particles';
        if (classes.some(cls => cls.includes('parallax'))) return 'parallax';
        if (classes.some(cls => cls.includes('camera'))) return 'camera';
        if (classes.some(cls => cls.includes('ui'))) return 'ui';
        if (classes.some(cls => cls.includes('game'))) return 'game';
        if (classes.some(cls => cls.includes('background'))) return 'background';
        
        // プロパティから推測
        const transform = styles.transform;
        if (transform && transform.includes('rotate')) return 'transforms';
        if (transform && transform.includes('scale')) return 'transforms';
        
        return 'transitions';
    }
    
    /**
     * 危険レベルの評価
     */
    assessHazardLevel(element, styles) {
        let hazardLevel = 0;
        
        // 回転速度のチェック
        const transform = styles.transform;
        if (transform && transform.includes('rotate')) {
            const duration = parseFloat(styles.animationDuration || '1');
            const rotationSpeed = 360 / duration; // 度/秒
            
            if (rotationSpeed > this.config.vestibularGuidelines.maxRotationSpeed) {
                hazardLevel += 2;
                this.hazardPatterns.rapidRotation.detected = true;
            }
        }
        
        // スケール変更のチェック
        if (transform && transform.includes('scale')) {
            const scaleMatch = transform.match(/scale\(([^)]+)\)/);
            if (scaleMatch) {
                const scale = parseFloat(scaleMatch[1]);
                if (scale > this.config.vestibularGuidelines.maxScaleChange) {
                    hazardLevel += 1;
                    this.hazardPatterns.extremeZoom.detected = true;
                }
            }
        }
        
        // 点滅のチェック
        const iterations = styles.animationIterationCount;
        const duration = parseFloat(styles.animationDuration || '1');
        if (iterations === 'infinite' && duration < 0.5) {
            hazardLevel += 3;
            this.hazardPatterns.rapidFlashing.detected = true;
        }
        
        return hazardLevel;
    }
    
    /**
     * 危険なアニメーションの処理
     */
    handleHazardousAnimation(element, animationData) {
        if (!this.config.vestibularSafety) return;
        
        console.warn('Hazardous animation detected:', animationData);
        
        // 警告表示
        element.classList.add('motion-warning');
        
        // 自動修正
        if (animationData.hazardLevel >= 2) {
            this.pauseAnimation(element);
            this.stats.vestibularWarnings++;
        }
        
        // ユーザーに制御オプションを提供
        this.createAnimationControl(element, animationData);
    }
    
    /**
     * アニメーション制御UIの作成
     */
    createAnimationControl(element, animationData) {
        const controlId = `motion-control-${Date.now()}`;
        const control = document.createElement('div');
        control.id = controlId;
        control.className = 'motion-control-overlay';
        control.innerHTML = `
            <div class="motion-control-panel">
                <p>激しいアニメーションが検出されました</p>
                <button onclick="motionManager.pauseAnimation('${element.id || controlId}')">一時停止</button>
                <button onclick="motionManager.reduceAnimation('${element.id || controlId}')">軽減</button>
                <button onclick="motionManager.dismissWarning('${controlId}')">続行</button>
            </div>
        `;
        control.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
        `;
        
        document.body.appendChild(control);
        
        // 5秒後に自動消去
        setTimeout(() => {
            if (document.getElementById(controlId)) {
                document.body.removeChild(control);
            }
        }, 5000);
    }
    
    /**
     * モーション制御の適用
     */
    applyMotionControl(element, animationData) {
        const category = animationData.category;
        const categoryConfig = this.config.motionCategories[category];
        
        if (!categoryConfig || !categoryConfig.enabled) {
            element.classList.add('motion-category-disabled');
            return;
        }
        
        // 段階的制御の適用
        this.applyGranularControls(element, animationData);
        
        // 選択的軽減の適用
        this.applySelectiveReduction(element, animationData);
        
        // 強度と持続時間の調整
        const intensityFactor = categoryConfig.intensity;
        const durationFactor = categoryConfig.duration;
        
        element.style.setProperty('--motion-intensity', intensityFactor.toString());
        element.style.setProperty('--motion-duration', durationFactor.toString());
        element.style.setProperty('--original-duration', `${animationData.duration}s`);
        
        // レベル別制御クラスの適用
        element.classList.add(`motion-${this.currentLevel}`);
        
        if (this.config.vestibularSafety) {
            element.classList.add('vestibular-safe');
            this.applyVestibularSafetyEnhancements(element, animationData);
        }
        
        // ゲーム要素の特別制御
        if (category === 'game') {
            element.classList.add('game-motion-controlled');
            this.applyGameMotionControl(element, animationData);
        }
    }

    /**
     * 段階的制御の適用
     */
    applyGranularControls(element, animationData) {
        const controls = this.userPreferences.granularControls;
        const category = animationData.category;
        
        // カテゴリ別段階的制御
        switch (category) {
            case 'particles':
                element.style.setProperty('--particle-density', controls.particleDensity.toString());
                element.style.setProperty('--effects-level', controls.effectsLevel.toString());
                break;
                
            case 'camera':
                element.style.setProperty('--camera-movement', controls.cameraMovement.toString());
                break;
                
            case 'background':
                element.style.setProperty('--background-motion', controls.backgroundMotion.toString());
                break;
                
            case 'transitions':
                element.style.setProperty('--transition-speed', controls.transitionSpeed.toString());
                break;
                
            default:
                element.style.setProperty('--animation-intensity', controls.animationIntensity.toString());
        }
    }

    /**
     * 選択的軽減の適用
     */
    applySelectiveReduction(element, animationData) {
        const selective = this.userPreferences.selectiveReduction;
        const styles = window.getComputedStyle(element);
        
        // 回転の無効化
        if (selective.disableRotation && styles.transform.includes('rotate')) {
            element.style.transform = styles.transform.replace(/rotate\([^)]*\)/g, 'rotate(0deg)');
            element.classList.add('rotation-disabled');
        }
        
        // スケーリングの無効化
        if (selective.disableScaling && styles.transform.includes('scale')) {
            element.style.transform = styles.transform.replace(/scale\([^)]*\)/g, 'scale(1)');
            element.classList.add('scaling-disabled');
        }
        
        // パララックスの無効化
        if (selective.disableParallax && element.classList.contains('parallax')) {
            element.style.transform = 'translateZ(0)';
            element.classList.add('parallax-disabled');
        }
        
        // パーティクルの無効化
        if (selective.disableParticles && animationData.category === 'particles') {
            element.style.display = 'none';
            element.classList.add('particles-disabled');
        }
        
        // カメラシェイクの無効化
        if (selective.disableCameraShake && element.classList.contains('camera-shake')) {
            element.style.transform = 'none';
            element.classList.add('camera-shake-disabled');
        }
        
        // 背景アニメーションの無効化
        if (selective.disableBackgroundAnimation && element.classList.contains('background-animation')) {
            element.style.animationPlayState = 'paused';
            element.classList.add('background-animation-disabled');
        }
    }

    /**
     * 前庭安全性強化機能
     */
    applyVestibularSafetyEnhancements(element, animationData) {
        const guidelines = this.config.vestibularGuidelines;
        
        // 自動停止タイマーの設定
        if (animationData.iterations === 'infinite') {
            setTimeout(() => {
                if (element && !element.classList.contains('user-controlled')) {
                    element.style.animationPlayState = 'paused';
                    console.log('Auto-paused infinite animation for vestibular safety');
                }
            }, guidelines.autoplayPause);
        }
        
        // 前庭障害特有の制限
        const vestibularLimitations = {
            maxRotationPerSecond: guidelines.maxRotationSpeed,
            maxScaleChangePerSecond: guidelines.maxScaleChange / 10,
            maxTranslationPerSecond: guidelines.maxParallaxDistance
        };
        
        // CSS カスタムプロパティで制限を適用
        Object.entries(vestibularLimitations).forEach(([key, value]) => {
            element.style.setProperty(`--vestibular-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value.toString());
        });
    }
    
    /**
     * ゲーム要素モーション制御
     */
    applyGameMotionControl(element, animationData) {
        const gameIntensity = this.userPreferences.customIntensities.get('game') || 
                             this.config.motionCategories.game.intensity;
        
        element.style.setProperty('--game-motion-intensity', gameIntensity.toString());
        element.style.setProperty('--game-motion-duration', 
            this.config.motionCategories.game.duration.toString());
    }
    
    /**
     * ゲームアニメーションの分析
     */
    analyzeGameAnimation(element, type) {
        if (!element) return;
        
        const gameAnimationData = {
            element,
            type,
            timestamp: Date.now(),
            category: 'game'
        };
        
        // ゲーム固有の危険パターンチェック
        if (type === 'effect' && this.detectViolentShaking(element)) {
            this.hazardPatterns.violentShaking.detected = true;
            this.handleHazardousAnimation(element, {
                ...gameAnimationData,
                hazardLevel: 2
            });
        }
    }
    
    /**
     * 激しい振動の検出
     */
    detectViolentShaking(element) {
        // 要素の位置変化を監視
        const rect = element.getBoundingClientRect();
        const lastPosition = this.lastPositions?.get(element);
        
        if (lastPosition) {
            const deltaX = Math.abs(rect.x - lastPosition.x);
            const deltaY = Math.abs(rect.y - lastPosition.y);
            const maxDelta = Math.max(deltaX, deltaY);
            
            if (maxDelta > this.hazardPatterns.violentShaking.threshold) {
                return true;
            }
        }
        
        if (!this.lastPositions) {
            this.lastPositions = new Map();
        }
        this.lastPositions.set(element, { x: rect.x, y: rect.y });
        
        return false;
    }
    
    // パブリックAPI
    
    /**
     * モーションレベルの設定
     */
    setMotionLevel(level) {
        if (!this.config.motionLevels[level]) {
            console.warn(`Unknown motion level: ${level}`);
            return;
        }
        
        const oldLevel = this.currentLevel;
        this.currentLevel = level;
        this.userPreferences.motionLevel = level;
        
        // 全要素に新しいレベルを適用
        document.body.className = document.body.className.replace(/motion-\w+/g, '');
        document.body.classList.add(`motion-${level}`);
        
        // 個別要素の再適用
        for (const [element, animationData] of this.activeAnimations) {
            element.className = element.className.replace(/motion-\w+/g, '');
            this.applyMotionControl(element, animationData);
        }
        
        this.saveUserPreferences();
        console.log(`Motion level changed from ${oldLevel} to ${level}`);
    }
    
    /**
     * カテゴリ別制御の設定
     */
    setCategoryControl(category, enabled, intensity = 1.0, duration = 1.0) {
        if (!this.config.motionCategories[category]) {
            console.warn(`Unknown motion category: ${category}`);
            return;
        }
        
        this.config.motionCategories[category] = {
            enabled,
            intensity: Math.max(0, Math.min(2.0, intensity)),
            duration: Math.max(0.1, Math.min(5.0, duration))
        };
        
        // 該当カテゴリの要素を更新
        for (const [element, animationData] of this.activeAnimations) {
            if (animationData.category === category) {
                this.applyMotionControl(element, animationData);
            }
        }
        
        console.log(`Category ${category} control updated:`, this.config.motionCategories[category]);
    }
    
    /**
     * 前庭安全モードの切り替え
     */
    toggleVestibularSafety(enabled) {
        this.config.vestibularSafety = enabled;
        this.userPreferences.vestibularSafety = enabled;
        
        document.body.classList.toggle('vestibular-safe', enabled);
        
        if (enabled) {
            // 危険なアニメーションを再チェック
            for (const [element, animationData] of this.activeAnimations) {
                if (animationData.hazardLevel > 0) {
                    this.handleHazardousAnimation(element, animationData);
                }
            }
        } else {
            // 警告を削除
            document.querySelectorAll('.motion-warning').forEach(element => {
                element.classList.remove('motion-warning');
            });
        }
        
        this.saveUserPreferences();
        console.log(`Vestibular safety ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * すべてのアニメーションの一時停止
     */
    pauseAllAnimations() {
        for (const element of this.activeAnimations.keys()) {
            this.pauseAnimation(element);
        }
        console.log('All animations paused');
    }
    
    /**
     * すべてのアニメーションの再開
     */
    resumeAllAnimations() {
        for (const element of this.pausedAnimations) {
            this.resumeAnimation(element);
        }
        console.log('All animations resumed');
    }
    
    /**
     * 個別アニメーションの一時停止
     */
    pauseAnimation(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (element) {
            element.style.animationPlayState = 'paused';
            this.pausedAnimations.add(element);
            this.stats.animationsPaused++;
        }
    }
    
    /**
     * 個別アニメーションの再開
     */
    resumeAnimation(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (element) {
            element.style.animationPlayState = 'running';
            this.pausedAnimations.delete(element);
        }
    }
    
    /**
     * アニメーションの軽減
     */
    reduceAnimation(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (element) {
            element.style.animationDuration = '0.5s';
            element.style.animationIterationCount = '1';
            element.classList.add('motion-reduced');
            this.stats.animationsReduced++;
        }
    }
    
    /**
     * 警告の却下
     */
    dismissWarning(controlId) {
        const control = document.getElementById(controlId);
        if (control) {
            document.body.removeChild(control);
        }
    }
    
    /**
     * パフォーマンスモードの切り替え
     */
    togglePerformanceMode(enabled) {
        document.body.classList.toggle('performance-mode', enabled);
        
        if (enabled) {
            // 複雑なアニメーションを無効化
            document.querySelectorAll('.complex-animation').forEach(element => {
                element.style.animationPlayState = 'paused';
            });
        }
        
        console.log(`Performance mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * 現在の状態の取得
     */
    getCurrentState() {
        return {
            motionLevel: this.currentLevel,
            vestibularSafety: this.config.vestibularSafety,
            activeAnimations: this.activeAnimations.size,
            pausedAnimations: this.pausedAnimations.size,
            frameRate: this.performanceMonitor.frameRate,
            categories: this.config.motionCategories,
            hazardPatterns: Object.fromEntries(
                Object.entries(this.hazardPatterns).map(([key, value]) => [key, value.detected])
            )
        };
    }
    
    /**
     * 段階的制御の設定
     */
    setGranularControl(property, value) {
        const validProperties = Object.keys(this.userPreferences.granularControls);
        
        if (!validProperties.includes(property)) {
            console.warn(`Invalid granular control property: ${property}`);
            return false;
        }
        
        // 値の範囲チェック
        const ranges = {
            animationIntensity: [0.0, 2.0],
            transitionSpeed: [0.1, 3.0],
            effectsLevel: [0.0, 2.0],
            particleDensity: [0.0, 2.0],
            cameraMovement: [0.0, 1.0],
            backgroundMotion: [0.0, 1.0]
        };
        
        const [min, max] = ranges[property];
        const clampedValue = Math.max(min, Math.min(max, value));
        
        this.userPreferences.granularControls[property] = clampedValue;
        
        // 該当する要素に変更を適用
        this.reapplyMotionControls(property);
        
        this.saveUserPreferences();
        console.log(`Granular control ${property} set to ${clampedValue}`);
        return true;
    }

    /**
     * 選択的軽減の設定
     */
    setSelectiveReduction(property, enabled) {
        const validProperties = Object.keys(this.userPreferences.selectiveReduction);
        
        if (!validProperties.includes(property)) {
            console.warn(`Invalid selective reduction property: ${property}`);
            return false;
        }
        
        this.userPreferences.selectiveReduction[property] = enabled;
        
        // 該当する要素に変更を適用
        this.reapplyMotionControls(property);
        
        this.saveUserPreferences();
        console.log(`Selective reduction ${property} ${enabled ? 'enabled' : 'disabled'}`);
        return true;
    }

    /**
     * モーション制御の再適用
     */
    reapplyMotionControls(changedProperty = null) {
        for (const [element, animationData] of this.activeAnimations) {
            // 特定のプロパティのみの変更の場合、関連要素のみ更新
            if (changedProperty && !this.isElementAffectedByProperty(element, animationData, changedProperty)) {
                continue;
            }
            
            this.applyMotionControl(element, animationData);
        }
    }

    /**
     * 要素が特定のプロパティの影響を受けるかチェック
     */
    isElementAffectedByProperty(element, animationData, property) {
        const propertyMappings = {
            // 段階的制御
            animationIntensity: ['transitions', 'transforms', 'ui'],
            transitionSpeed: ['transitions'],
            effectsLevel: ['particles', 'effects'],
            particleDensity: ['particles'],
            cameraMovement: ['camera'],
            backgroundMotion: ['background'],
            
            // 選択的軽減
            disableRotation: true, // すべての回転要素
            disableScaling: true,  // すべてのスケーリング要素
            disableParallax: ['parallax'],
            disableParticles: ['particles'],
            disableCameraShake: ['camera'],
            disableBackgroundAnimation: ['background']
        };
        
        const mapping = propertyMappings[property];
        
        if (mapping === true) {
            return true; // すべての要素が影響を受ける
        }
        
        if (Array.isArray(mapping)) {
            return mapping.includes(animationData.category);
        }
        
        return false;
    }

    /**
     * アニメーション強度の一括設定
     */
    setAnimationIntensityProfile(profileName) {
        const profiles = {
            minimal: {
                animationIntensity: 0.2,
                transitionSpeed: 0.5,
                effectsLevel: 0.1,
                particleDensity: 0.1,
                cameraMovement: 0.0,
                backgroundMotion: 0.2
            },
            reduced: {
                animationIntensity: 0.5,
                transitionSpeed: 0.7,
                effectsLevel: 0.3,
                particleDensity: 0.3,
                cameraMovement: 0.2,
                backgroundMotion: 0.4
            },
            normal: {
                animationIntensity: 1.0,
                transitionSpeed: 1.0,
                effectsLevel: 1.0,
                particleDensity: 1.0,
                cameraMovement: 0.5,
                backgroundMotion: 0.8
            },
            enhanced: {
                animationIntensity: 1.5,
                transitionSpeed: 1.2,
                effectsLevel: 1.5,
                particleDensity: 1.5,
                cameraMovement: 0.8,
                backgroundMotion: 1.0
            }
        };
        
        const profile = profiles[profileName];
        if (!profile) {
            console.warn(`Unknown animation intensity profile: ${profileName}`);
            return false;
        }
        
        Object.assign(this.userPreferences.granularControls, profile);
        this.reapplyMotionControls();
        this.saveUserPreferences();
        
        console.log(`Animation intensity profile set to: ${profileName}`);
        return true;
    }

    /**
     * 前庭障害対応プロファイルの設定
     */
    setVestibularDisorderProfile(severityLevel) {
        const profiles = {
            mild: {
                granularControls: {
                    animationIntensity: 0.8,
                    transitionSpeed: 0.8,
                    effectsLevel: 0.6,
                    particleDensity: 0.5,
                    cameraMovement: 0.2,
                    backgroundMotion: 0.4
                },
                selectiveReduction: {
                    disableRotation: false,
                    disableScaling: false,
                    disableParallax: true,
                    disableParticles: false,
                    disableCameraShake: true,
                    disableBackgroundAnimation: false
                }
            },
            moderate: {
                granularControls: {
                    animationIntensity: 0.5,
                    transitionSpeed: 0.6,
                    effectsLevel: 0.3,
                    particleDensity: 0.3,
                    cameraMovement: 0.0,
                    backgroundMotion: 0.2
                },
                selectiveReduction: {
                    disableRotation: true,
                    disableScaling: true,
                    disableParallax: true,
                    disableParticles: true,
                    disableCameraShake: true,
                    disableBackgroundAnimation: true
                }
            },
            severe: {
                granularControls: {
                    animationIntensity: 0.1,
                    transitionSpeed: 0.3,
                    effectsLevel: 0.0,
                    particleDensity: 0.0,
                    cameraMovement: 0.0,
                    backgroundMotion: 0.0
                },
                selectiveReduction: {
                    disableRotation: true,
                    disableScaling: true,
                    disableParallax: true,
                    disableParticles: true,
                    disableCameraShake: true,
                    disableBackgroundAnimation: true
                }
            }
        };
        
        const profile = profiles[severityLevel];
        if (!profile) {
            console.warn(`Unknown vestibular disorder severity level: ${severityLevel}`);
            return false;
        }
        
        Object.assign(this.userPreferences.granularControls, profile.granularControls);
        Object.assign(this.userPreferences.selectiveReduction, profile.selectiveReduction);
        
        this.config.vestibularSafety = true;
        this.userPreferences.vestibularSafety = true;
        
        this.reapplyMotionControls();
        this.saveUserPreferences();
        
        console.log(`Vestibular disorder profile set to: ${severityLevel}`);
        return true;
    }

    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.visual?.motion) {
            Object.assign(this.config, config.visual.motion);
        }
        
        console.log('MotionManager configuration applied');
    }
    
    /**
     * レポートの生成
     */
    generateReport() {
        const sessionDuration = Date.now() - this.stats.sessionStart;
        
        return {
            timestamp: new Date().toISOString(),
            configuration: {
                motionLevel: this.currentLevel,
                vestibularSafety: this.config.vestibularSafety,
                respectSystemPreference: this.config.respectSystemPreference
            },
            statistics: {
                ...this.stats,
                sessionDuration,
                averageFrameRate: this.performanceMonitor.frameRate
            },
            performance: this.performanceMonitor,
            hazardDetection: this.hazardPatterns,
            userPreferences: this.userPreferences
        };
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        
        if (enabled) {
            this.setMotionLevel(this.userPreferences.motionLevel);
        } else {
            this.setMotionLevel('none');
        }
        
        console.log(`MotionManager ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying MotionManager...');
        
        // アニメーション監視の停止
        if (this.animationObserver) {
            this.animationObserver.disconnect();
        }
        
        // すべてのアニメーションを正常状態に戻す
        for (const element of this.activeAnimations.keys()) {
            element.className = element.className.replace(/motion-\w+/g, '');
            element.classList.remove('vestibular-safe', 'performance-mode', 'motion-warning');
            element.style.removeProperty('--motion-intensity');
            element.style.removeProperty('--motion-duration');
            element.style.removeProperty('--original-duration');
        }
        
        // スタイルシートの削除
        if (this.dynamicStyleSheet && this.dynamicStyleSheet.parentNode) {
            this.dynamicStyleSheet.parentNode.removeChild(this.dynamicStyleSheet);
        }
        
        // 制御UIの削除
        document.querySelectorAll('.motion-control-overlay').forEach(element => {
            element.remove();
        });
        
        // ユーザー設定の保存
        this.saveUserPreferences();
        
        // データのクリア
        this.activeAnimations.clear();
        this.pausedAnimations.clear();
        this.animationObservers.clear();
        this.cssRules.clear();
        
        if (this.lastPositions) {
            this.lastPositions.clear();
        }
        
        console.log('MotionManager destroyed');
    }
}