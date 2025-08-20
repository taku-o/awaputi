/**
 * AnimationController
 * アクティブアニメーション管理、一時停止・再開・強度制御、パフォーマンス監視
 */

// 型定義
export interface MotionManager { visualAccessibilityManager: VisualAccessibilityManager,
    accessibilityManager: AccessibilityManager,
    gameEngine: GameEngine,
    activeAnimations: Map<string, AnimationData>,
    pausedAnimations: Set<string>,
    animationObservers: Map<string, MutationObserver>,
    performanceMonitor: PerformanceMonitor,
    stats: MotionStats,
    userPreferences: UserPreferences,
    currentLevel: MotionLevel,
    config: MotionConfig,
    setMotionLevel: (level: MotionLevel) => void; }
}

export interface VisualAccessibilityManager { [key: string]: any, }
}

export interface AccessibilityManager { [key: string]: any, }
}

export interface GameEngine { [key: string]: any, }
}

export interface AnimationData { id: string,
    element: HTMLElement,
    category: string,
    options: AnimationOptions,
    startTime: number,
    duration: number | null,
    isActive: boolean,
    isPaused: boolean; }
}

export interface AnimationOptions { duration?: number;
    intensity?: number;
    speed?: number;
    category?: string;
    vestibularSafe?: boolean;
    [key: string]: any, }
}

export interface PerformanceMonitor { frameRate: number,
    droppedFrames: number,
    lastFrameTime: number; }
}

export interface MotionStats { animationsControlled: number,
    animationsPaused: number,
    animationsReduced: number,
    performanceAdjustments: number; }
}

export interface UserPreferences { autoReduceOnPerformance: boolean,
    granularControls: GranularControls,
    selectiveReduction: SelectiveReduction;
    }
}

export interface GranularControls { particleDensity: number,
    cameraMovement: number,
    backgroundMotion: number; }
}

export interface SelectiveReduction { disableRotation: boolean,
    disableScaling: boolean,
    disableParallax: boolean; }
}

export interface MotionConfig { vestibularSafety: boolean,
    vestibularGuidelines: VestibularGuidelines,
    motionCategories: Record<string, MotionCategoryConfig>, }
}

export interface VestibularGuidelines { maxRotationSpeed: number,
    maxScaleChange: number,
    maxTranslationSpeed: number,
    maxFlashFrequency: number; }
}

export interface MotionCategoryConfig { enabled: boolean,
    intensity: number,
    duration: number,
    vestibularSafe: boolean; }
}

export interface AnimationStatistics { active: number,
    paused: number,
    observed: number,
    performance: PerformanceMetrics,
    categories: Record<string, CategoryStats>,
    totalControlled: number,
    totalPaused: number,
    totalReduced: number; }
}

export interface PerformanceMetrics { frameRate: number,
    droppedFrames: number,
    lastFrameTime: number; }
}

export interface CategoryStats { active: number,
    paused: number; }
}

// 列挙型
export type MotionLevel = 'none' | 'essential' | 'reduced' | 'normal' | 'enhanced';
';
export type AnimationCategory = '';
    | 'general' | 'particles' | 'camera' | 'background' | 'ui' '';
    | 'parallax' | 'transitions' | 'effects' | 'gameplay';'
'';
export type AnimationState = 'active' | 'paused' | 'stopped' | 'completed';'
'';
export type PerformanceLevel = 'low' | 'medium' | 'high' | 'critical';

// 定数
export const PERFORMANCE_THRESHOLD_FPS = 30;
export const ANIMATION_ID_LENGTH = 9;'
export const DEFAULT_ANIMATION_DURATION = 1000;''
export const DYNAMIC_STYLESHEET_ID = 'motion-manager-styles';
export const PERFORMANCE_MONITOR_INTERVAL = 1000;'
'';
export const MOTION_LEVEL_HIERARCHY: MotionLevel[] = ['none', 'essential', 'reduced', 'normal', 'enhanced'];

export const DEFAULT_MOTION_CONFIG: Partial<MotionConfig> = { vestibularSafety: true,
    vestibularGuidelines: {
        maxRotationSpeed: 45, // degrees per second;
        maxScaleChange: 1.5,
        maxTranslationSpeed: 100, // pixels per second;
        maxFlashFrequency: 3 // flashes per second }
    }
},

export const DEFAULT_ANIMATION_OPTIONS: AnimationOptions = { duration: DEFAULT_ANIMATION_DURATION,
    intensity: 1.0,
    speed: 1.0,
    vestibularSafe: true }
},

// ユーティリティ関数
export function isValidMotionLevel(level: string): level is MotionLevel { return MOTION_LEVEL_HIERARCHY.includes(level as MotionLevel); }
}'
'';
export function isValidAnimationCategory(category: string'): category is AnimationCategory { return [''
        'general', 'particles', 'camera', 'background', 'ui',']';
        'parallax', 'transitions', 'effects', 'gameplay'];
    ].includes(category); }
}

export function isHTMLElement(element: any): element is HTMLElement { return element instanceof HTMLElement; }
}'
'';
export function isAnimationData(data: any'): data is AnimationData { return data &&''
           typeof data.id === 'string' &&'';
           isHTMLElement(data.element') &&'';
           typeof data.category === 'string' &&'';
           typeof data.startTime === 'number'; }
}'
'';
export function isValidIntensity(intensity: any'): intensity is number { ''
    return typeof intensity === 'number' && intensity >= 0 && intensity <= 10; }
}'
'';
export function isValidDuration(duration: any'): duration is number { ''
    return typeof duration === 'number' && duration > 0; }
}'
'';
export function isValidFrameRate(fps: any'): fps is number { ''
    return typeof fps === 'number' && fps >= 0 && fps <= 240; }
}

export function calculateRotationSpeed(rotation: number, duration: number): number { return Math.abs(rotation / duration); }
}

export function calculateScaleChange(fromScale: number, toScale: number): number { return Math.abs(toScale - fromScale); }
}

export function clampIntensity(intensity: number): number { return Math.max(0, Math.min(10, intensity); }
}

export function clampDuration(duration: number): number { return Math.max(0.1, Math.min(60, duration); }
}

export function generateAnimationId(): string {
    return `animation_${Date.now(})}_${Math.random().toString(36).substr(2, ANIMATION_ID_LENGTH})}`;
}

export function parseTransformValue(transform: string, property: string): number | null {
    const regex = new RegExp(`${property}\\(([0-9.-]+)(?:deg|px|%)? \\)`);
    const match = transform.match(regex); : undefined
    return match ? parseFloat(match[1]) : null;
}

export function createMotionWarningStyle(): string { return `
        .motion-warning {'
            border: 3px solid #ff6b6b !important,'';
            background: rgba(255, 107, 107, 0.1') !important, }
        }
        ';
        .motion-warning::before { ''
            content: '⚠️ 激しいアニメーション',
            position: absolute,
            top: -25px,
            left: 0,
            background: #ff6b6b,
            color: white,
            padding: 2px 6px,
            border-radius: 3px,
            font-size: 11px,
            z-index: 1000, }
        }
    `;
}

export class AnimationController {
    private motionManager: MotionManager;
    private visualAccessibilityManager: VisualAccessibilityManager;
    private accessibilityManager: AccessibilityManager;
    private gameEngine: GameEngine;
    // アニメーション状態管理
    private activeAnimations: Map<string, AnimationData>;
    private pausedAnimations: Set<string>;
    private animationObservers: Map<string, MutationObserver>;
    
    // CSS アニメーション管理
    private dynamicStyleSheet: HTMLStyleElement | null = null;
    private cssRules: Map<string, string> = new Map();
    
    // パフォーマンス監視
    private performanceMonitor: PerformanceMonitor;
    // 統計情報
    private stats: MotionStats';
'';
    constructor(motionManager: MotionManager') {
        this.motionManager = motionManager;
        this.visualAccessibilityManager = motionManager.visualAccessibilityManager;
        this.accessibilityManager = motionManager.accessibilityManager;
        this.gameEngine = motionManager.gameEngine;
        
        // アニメーション状態管理
        this.activeAnimations = motionManager.activeAnimations;
        this.pausedAnimations = motionManager.pausedAnimations;
        this.animationObservers = motionManager.animationObservers;
        
        // パフォーマンス監視
        this.performanceMonitor = motionManager.performanceMonitor;
        
        // 統計情報
        this.stats = motionManager.stats;'
        ';
    }
    }'
        console.log('[AnimationController] Component initialized'); }
    }
    
    /**
     * 動的スタイルシートの作成
     */'
    createDynamicStyleSheet(): void { ''
        if(this.dynamicStyleSheet') {
            
        }
            return; // 既に作成済み }
        }'
'';
        this.dynamicStyleSheet = document.createElement('style');
        this.dynamicStyleSheet.id = DYNAMIC_STYLESHEET_ID;
        this.dynamicStyleSheet.textContent = `;
            /* モーションレベル基本設定 */
            .motion-none * { animation: none !important,
                transition: none !important,
                transform: none !important; }
            }
            
            .motion-essential * { animation-duration: 0.1s !important,
                transition-duration: 0.1s !important, }
            }
            
            .motion-reduced * { animation-duration: calc(var(--original-duration, 1s) * 0.5) !important;
                transition-duration: calc(var(--original-duration, 1s) * 0.5) !important;
                animation-iteration-count: 1 !important, }
            }
            
            .motion-reduced .parallax { transform: none !important; }
            }
            
            /* カテゴリ別制御 */
            .motion-category-disabled { animation-play-state: paused !important,
                transition: none !important; }
            }
            
            /* 前庭安全モード */
            .vestibular-safe * { max-width: 100vw !important,
                max-height: 100vh !important, }
            }
            
            .vestibular-safe .rotating { animation-duration: 2s !important,
                animation-iteration-count: 1 !important, }
            }
            
            .vestibular-safe .scaling { transform: scale(1) !important; }
            }
            
            .vestibular-safe .parallax { transform: translateZ(0) !important; }
            }
            
            /* パフォーマンス最適化 */
            .performance-mode * { will-change: auto !important,
                transform: translateZ(0); }
            }
            
            .performance-mode .complex-animation { animation: none !important; }
            }
            
            ${createMotionWarningStyle(})}
            
            /* ゲーム要素特別制御 */
            .game-motion-controlled { --motion-intensity: var(--game-motion-intensity, 1.0);
                --motion-duration: var(--game-motion-duration, 1.0); }
            }
            
            .game-motion-controlled * { animation-duration: calc(var(--original-duration, 1s) * var(--motion-duration) !important;
                transform: scale(var(--motion-intensity) !important; }
            }
        `;
        document.head.appendChild(this.dynamicStyleSheet);
    }
    
    /**
     * パフォーマンス監視の開始
     */
    startPerformanceMonitoring(): void { let lastTime = performance.now();
        let frameCount = 0;
        
        const monitorFrame = (currentTime: number) => { 
            frameCount++;
            
            if(currentTime - lastTime >= PERFORMANCE_MONITOR_INTERVAL) {
            
                this.performanceMonitor.frameRate = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // パフォーマンス低下の検出
                if (this.performanceMonitor.frameRate < PERFORMANCE_THRESHOLD_FPS && ;
            }
                    this.motionManager.userPreferences.autoReduceOnPerformance) { }
                    this.handlePerformanceDegradation(); }
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
    private handlePerformanceDegradation(): void { const currentLevel = this.motionManager.currentLevel;
        let newLevel: MotionLevel = currentLevel,
        
        // 段階的にレベルを下げる
        const currentIndex = MOTION_LEVEL_HIERARCHY.indexOf(currentLevel);
        if(currentIndex > 0) {
            
        }
            newLevel = MOTION_LEVEL_HIERARCHY[currentIndex - 1]; }
        }
        
        if(newLevel !== currentLevel) {
        
            
        
        }'
            console.log(`Performance degradation detected. Reducing motion level: ${currentLevel} → ${ newLevel)`);' }'
            this.motionManager.setMotionLevel(newLevel'});
            this.stats.performanceAdjustments++;
        }
    }
    
    /**
     * アニメーションの登録'
     */''
    registerAnimation(element: HTMLElement, category: AnimationCategory = 'general', options: AnimationOptions = { ): string | null {'
        try {''
            if (!isHTMLElement(element)') {''
                throw new Error('Invalid element provided'); }
            }
';
            if(!isValidAnimationCategory(category) { ' }'
                console.warn(`Invalid animation category: ${category'), using 'general'`'});''
                category = 'general';
            }

            const id = generateAnimationId();
            const mergedOptions = { ...DEFAULT_ANIMATION_OPTIONS, ...options };
            
            const animationData: AnimationData = { id,
                element,
                category,
                options: mergedOptions,
                startTime: Date.now(),
                duration: mergedOptions.duration || null,
                isActive: true,
                isPaused: false }
            },
            
            this.activeAnimations.set(id, animationData);
            this.stats.animationsControlled++;
            
            // カテゴリ設定の適用
            this.applyCategorySettings(element, category);
            
            // 前庭安全性の検証
            if (this.motionManager.config.vestibularSafety) { this.validateAndAdjustAnimation(animationData); }
            }
            
            // オブザーバーの設定
            this.setupAnimationObserver(animationData);
            
            console.log(`Animation registered: ${id} (${category)`});
            return id;'
            '';
        } catch (error') { ''
            console.error('Failed to register animation:', error);
            return null; }
        }
    }
    
    /**
     * アニメーションの登録解除'
     */''
    unregisterAnimation(animationId: string'): boolean { ''
        if(typeof animationId !== 'string') {
            
        }
            return false; }
        }

        const animation = this.activeAnimations.get(animationId);
        if(animation) {
            this.activeAnimations.delete(animationId);
            this.pausedAnimations.delete(animationId);
            
            // オブザーバーのクリーンアップ
            const observer = this.animationObservers.get(animationId);
            if (observer) {
                observer.disconnect();
        }
                this.animationObservers.delete(animationId); }
            }
            
            console.log(`Animation unregistered: ${animationId)`});
            return true;
        }
        return false;
    }
    
    /**
     * カテゴリ設定の適用
     */
    private applyCategorySettings(element: HTMLElement, category: string): void { const config = this.motionManager.config.motionCategories[category];
        if (!config) return;'
        '';
        if(!config.enabled') {'
            '';
            element.classList.add('motion-category-disabled'');
        }
            return; }
        }
        ';
        // CSS カスタムプロパティで強度と速度を制御''
        element.style.setProperty('--motion-intensity', String(config.intensity)');''
        element.style.setProperty('--motion-duration', String(config.duration);
        
        // 段階的制御の適用
        this.applyGranularControls(element, category);
        
        // 選択的軽減の適用
        this.applySelectiveReduction(element, category);
    }

    /**
     * 段階的制御の適用
     */
    private applyGranularControls(element: HTMLElement, category: string): void { const granular = this.motionManager.userPreferences.granularControls;'
        '';
        switch(category') {'
            '';
            case 'particles':'';
                element.style.setProperty('--particle-density', String(granular.particleDensity)');'
                break;''
            case 'camera':'';
                element.style.setProperty('--camera-movement', String(granular.cameraMovement)');'
                break;''
            case 'background':'';
                element.style.setProperty('--background-motion', String(granular.backgroundMotion);
        }
                break; }
        }
    }

    /**
     * 選択的軽減の適用'
     */''
    private applySelectiveReduction(element: HTMLElement, category: string'): void { const selective = this.motionManager.userPreferences.selectiveReduction;
        const currentTransform = element.style.transform;'
        '';
        if(selective.disableRotation && currentTransform? .includes('rotate') {'
            ';
        }'
            element.style.transform = currentTransform.replace(/rotate\([^)]*\')/g, '''); }
        }'
        '';
        if(selective.disableScaling && currentTransform?.includes('scale') {'
            ';
        }'
            element.style.transform = currentTransform.replace(/scale\([^)]*\')/g, '''); }
        }'
        '';
        if(selective.disableParallax && category === 'parallax'') {'
            ';
        }'
            element.classList.add('motion-category-disabled'); }
        }
    }
    
    /**
     * アニメーションの検証と調整
     */ : undefined
    private validateAndAdjustAnimation(animationData: AnimationData): void { const element = animationData.element;
        const computedStyle = getComputedStyle(element);
        
        // 回転速度の検証
        this.validateRotationSpeed(element, computedStyle, animationData);
        
        // スケール変更の検証
        this.validateScaleChange(element, computedStyle, animationData); }
    }

    /**
     * 回転速度の検証'
     */''
    private validateRotationSpeed(element: HTMLElement, computedStyle: CSSStyleDeclaration, animationData: AnimationData'): void { const transform = computedStyle.transform;''
        if (!transform || !transform.includes('rotate')') return;'
'';
        const rotation = parseTransformValue(transform, 'rotate');
        if (rotation === null) return;

        const duration = parseFloat(computedStyle.animationDuration) || 1;
        const rotationSpeed = calculateRotationSpeed(rotation, duration);
        
        if(rotationSpeed > this.motionManager.config.vestibularGuidelines.maxRotationSpeed) {
        
            
        
        }
            const newDuration = rotation / this.motionManager.config.vestibularGuidelines.maxRotationSpeed; }
            element.style.animationDuration = `${newDuration}s`;
            console.log(`Animation ${animationData.id): Rotation speed adjusted for vestibular safety`});
        }
    }

    /**
     * スケール変更の検証'
     */''
    private validateScaleChange(element: HTMLElement, computedStyle: CSSStyleDeclaration, animationData: AnimationData'): void { const transform = computedStyle.transform;''
        if (!transform || !transform.includes('scale')') return;'
'';
        const scale = parseTransformValue(transform, 'scale');
        if (scale === null) return;

        if(scale > this.motionManager.config.vestibularGuidelines.maxScaleChange) {

            const maxScale = this.motionManager.config.vestibularGuidelines.maxScaleChange;

        }
            element.style.transform = transform.replace(/scale\([^)]*\)/g, `scale(${maxScale)`); }
            console.log(`Animation ${animationData.id): Scale adjusted for vestibular safety`});
        }
    }
    
    /**
     * アニメーションオブザーバーの設定
     */'
    private setupAnimationObserver(animationData: AnimationData): void { const observer = new MutationObserver((mutations) => { ''
            mutations.forEach((mutation') => {''
                if(mutation.type === 'attributes' && ')';
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class') { }
                    this.validateAndAdjustAnimation(animationData); }
                }'
            });''
        }');
        ';
        observer.observe(animationData.element, { attributes: true,')'
            attributeFilter: ['style', 'class']);
        
        this.animationObservers.set(animationData.id, observer); }
    }
    
    /**
     * アニメーションの一時停止
     */'
    pauseAnimation(animationId: string): boolean { const animation = this.activeAnimations.get(animationId);''
        if(animation && !animation.isPaused') {'
            '';
            animation.element.style.animationPlayState = 'paused';
            animation.isPaused = true;
            this.pausedAnimations.add(animationId);
            this.stats.animationsPaused++;
        }
             }
            console.log(`Animation paused: ${animationId)`});
            return true;
        }
        return false;
    }
    
    /**
     * アニメーションの再開
     */'
    resumeAnimation(animationId: string): boolean { const animation = this.activeAnimations.get(animationId);''
        if(animation && animation.isPaused') {'
            '';
            animation.element.style.animationPlayState = 'running';
            animation.isPaused = false;
            this.pausedAnimations.delete(animationId);
        }
             }
            console.log(`Animation resumed: ${animationId)`});
            return true;
        }
        return false;
    }
    
    /**
     * カテゴリ別アニメーションの一時停止
     */
    pauseAnimationsByCategory(category: string): number { let pausedCount = 0;
        
        this.activeAnimations.forEach((animation, id) => { 
            if(animation.category === category && !animation.isPaused) {
                
            }
                if(this.pauseAnimation(id) { }
                    pausedCount++; }
                }
            }
        });
        
        console.log(`Paused ${pausedCount} animations in category: ${category)`});
        return pausedCount;
    }
    
    /**
     * カテゴリ別アニメーションの再開
     */
    resumeAnimationsByCategory(category: string): number { let resumedCount = 0;
        
        this.activeAnimations.forEach((animation, id) => { 
            if(animation.category === category && animation.isPaused) {
                
            }
                if(this.resumeAnimation(id) { }
                    resumedCount++; }
                }
            }
        });
        
        console.log(`Resumed ${resumedCount} animations in category: ${category)`});
        return resumedCount;
    }
    
    /**
     * すべてのアニメーションの一時停止
     */
    pauseAllAnimations(): number { let pausedCount = 0;
        
        this.activeAnimations.forEach((animation, id) => { 
            if(!animation.isPaused && this.pauseAnimation(id) { }
                pausedCount++; }
            }
        });
        
        console.log(`Paused all animations: ${pausedCount} total`);
        return pausedCount;
    }
    
    /**
     * すべてのアニメーションの再開
     */
    resumeAllAnimations(): number { let resumedCount = 0;
        
        this.pausedAnimations.forEach(id => { );
            if(this.resumeAnimation(id) { }
                resumedCount++; }
            }
        });
        
        console.log(`Resumed all animations: ${resumedCount} total`);
        return resumedCount;
    }
    
    /**
     * アニメーション強度の調整
     */'
    adjustAnimationIntensity(animationId: string, intensityMultiplier: number): boolean { ''
        if (!isValidIntensity(intensityMultiplier)') {''
            console.error('Invalid intensity multiplier provided');
            return false; }
        }
';
        const animation = this.activeAnimations.get(animationId);''
        if (!animation') return false;
        ';
        const element = animation.element;''
        const currentIntensity = parseFloat(element.style.getPropertyValue('--motion-intensity'') || '1.0');''
        const newIntensity = clampIntensity(currentIntensity * intensityMultiplier');'
        '';
        element.style.setProperty('--motion-intensity', newIntensity.toFixed(2);
        
        console.log(`Animation ${animationId} intensity adjusted: ${currentIntensity} → ${newIntensity)`});
        return true;
    }
    
    /**
     * アニメーション速度の調整'
     */''
    adjustAnimationSpeed(animationId: string, speedMultiplier: number'): boolean { ''
        if(typeof speedMultiplier !== 'number' || speedMultiplier <= 0') {'
            '';
            console.error('Invalid speed multiplier provided');
        }
            return false; }
        }
';
        const animation = this.activeAnimations.get(animationId);''
        if (!animation') return false;
        ';
        const element = animation.element;''
        const currentDuration = parseFloat(element.style.getPropertyValue('--motion-duration'') || '1.0');''
        const newDuration = clampDuration(currentDuration / speedMultiplier'); // 速度を上げる = 時間を短くする'
        '';
        element.style.setProperty('--motion-duration', newDuration.toFixed(2);
        
        console.log(`Animation ${animationId} speed adjusted: ${currentDuration} → ${newDuration)`});
        return true;
    }
    
    /**
     * アニメーション統計の取得
     */
    getAnimationStats(): AnimationStatistics { return { active: this.activeAnimations.size,
            paused: this.pausedAnimations.size,
            observed: this.animationObservers.size,
            performance: {
                frameRate: this.performanceMonitor.frameRate,
                droppedFrames: this.performanceMonitor.droppedFrames, };
                lastFrameTime: this.performanceMonitor.lastFrameTime }
            },
            categories: this.getAnimationsByCategory(),
            totalControlled: this.stats.animationsControlled,
            totalPaused: this.stats.animationsPaused,
            totalReduced: this.stats.animationsReduced;
        },
    }
    
    /**
     * カテゴリ別アニメーション統計
     */
    private getAnimationsByCategory(): Record<string, CategoryStats> {
        const categories: Record<string, CategoryStats> = {};
        
        this.activeAnimations.forEach(animation => {  )
            const category = animation.category); }
            if (!categories[category]) { }
                categories[category] = { active: 0, paused: 0 }
            }
            
            categories[category].active++;
            if (animation.isPaused) { categories[category].paused++; }
            }
        });
        
        return categories;
    }

    /**
     * アニメーションの検索
     */
    findAnimations(predicate: (animation: AnimationData) => boolean): AnimationData[] { const results: AnimationData[] = [],
        
        this.activeAnimations.forEach(animation => { );
            if(predicate(animation) { }
                results.push(animation); }
            }
        });
        
        return results;
    }

    /**
     * カテゴリ別アニメーション一覧取得
     */
    getAnimationsByCategory(category: string): AnimationData[] { return this.findAnimations(animation => animation.category === category); }
    }

    /**
     * アクティブなアニメーション一覧取得
     */
    getActiveAnimations(): AnimationData[] { return Array.from(this.activeAnimations.values().filter(animation => !animation.isPaused); }
    }

    /**
     * 一時停止中のアニメーション一覧取得
     */
    getPausedAnimations(): AnimationData[] { return Array.from(this.activeAnimations.values().filter(animation => animation.isPaused); }
    }

    /**
     * パフォーマンス統計をリセット'
     */''
    resetPerformanceStats('')';
        console.log('[AnimationController] Performance stats reset');
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy(): void { // すべてのオブザーバーを停止
        this.animationObservers.forEach(observer => observer.disconnect();
        this.animationObservers.clear();
        
        // アニメーション停止
        this.pauseAllAnimations();
        this.activeAnimations.clear();
        this.pausedAnimations.clear();
        
        // 動的スタイルシートの削除
        if(this.dynamicStyleSheet && this.dynamicStyleSheet.parentNode) {
            this.dynamicStyleSheet.parentNode.removeChild(this.dynamicStyleSheet);
        }
            this.dynamicStyleSheet = null; }
        }
        ';
        // CSS ルールのクリア''
        this.cssRules.clear('')';
        console.log('[AnimationController] Component destroyed'');'
    }''
}