import { getErrorHandler  } from '../utils/ErrorHandler.js';
import { MotionConfigManager  } from './motion/MotionConfigManager.js';
import { AnimationController  } from './motion/AnimationController.js';
import { VestibularSafetyManager  } from './motion/VestibularSafetyManager.js';

/**
 * MotionManager (Main, Controller)
 * モーション管理システムの軽量オーケストレーター
 * Main Controller Patternによる軽量化実装
 */
export class MotionManager {'

    constructor(visualAccessibilityManager) {
        this.visualAccessibilityManager = visualAccessibilityManager;
        this.accessibilityManager = visualAccessibilityManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager?.gameEngine;
        
        // モーション設定
        this.config = { : undefined
            enabled: true;
            globalReducedMotion: false;
            respectSystemPreference: true;
            vestibularSafety: true;
    motionLevels: {''
                none: 'すべてのアニメーションを無効';
                essential: '重要なアニメーションのみ';
                reduced: '軽減されたアニメーション';
                normal: '通常のアニメーション' }

                enhanced: '強化されたアニメーション' 
    };
            motionCategories: {
                transitions: { enabled: true, intensity: 1.0, duration: 1.0  };
                transforms: { enabled: true, intensity: 1.0, duration: 1.0  };
                parallax: { enabled: true, intensity: 0.5, duration: 1.0  };
                particles: { enabled: true, intensity: 0.8, duration: 1.0  };
                camera: { enabled: true, intensity: 0.3, duration: 1.0  };
                ui: { enabled: true, intensity: 1.0, duration: 1.0  };
                game: { enabled: true, intensity: 0.9, duration: 1.0  };
                background: { enabled: true, intensity: 0.6, duration: 1.0  };
            vestibularGuidelines: { maxRotationSpeed: 360, // 度/秒
                maxScaleChange: 2.0;
    maxParallaxDistance: 100, // ピクセル;
                flashingThreshold: 3, // 回/秒;
                autoplayPause: 5000 // 5秒で自動停止  }
        };
        ;
        // 現在の状態
        this.currentLevel = 'normal';
        this.activeAnimations = new Map();
        this.pausedAnimations = new Set();
        this.animationObservers = new Map();
        
        // パフォーマンス監視
        this.performanceMonitor = { frameRate: 60;
            droppedFrames: 0;
            animationCount: 0;
    lastFrameTime: 0  };
        // 統計情報
        this.stats = { animationsControlled: 0;
            animationsPaused: 0;
            animationsReduced: 0;
            vestibularWarnings: 0;
    performanceAdjustments: 0;
            sessionStart: Date.now('''
            motionLevel: 'normal';
    vestibularSafety: true;
            autoReduceOnPerformance: true;
            customIntensities: new Map('';
    flashingSensitivity: 'medium';
            parallaxSensitivity: 'medium';
    granularControls: {
                animationIntensity: 1.0;
                transitionSpeed: 1.0;
                effectsLevel: 1.0;
                particleDensity: 1.0;
                cameraMovement: 0.5;
    backgroundMotion: 0.8  };
            selectiveReduction: { disableRotation: false;
                disableScaling: false;
                disableParallax: false;
                disableParticles: false;
                disableCameraShake: false;
    disableBackgroundAnimation: false;
        // 危険なモーションパターンの検出
        this.hazardPatterns = {
            rapidFlashing: { threshold: 3, detected: false;
            rapidRotation: { threshold: 720, detected: false,)
            extremeZoom: { threshold: 3.0, detected: false,)
            violentShaking: { threshold: 20, detected: false;
            violentShaking: { threshold: 20, detected: false;
        };
        // サブコンポーネントの初期化（依存注入）)
        this.configManager = new MotionConfigManager(this);
        this.animationController = new AnimationController(this);
        this.vestibularSafetyManager = new VestibularSafetyManager(this);

        console.log('[MotionManager] Main Controller initialized with sub-components);'
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    initialize() {
        try {
            // システム設定の検出（設定管理に委譲）
            this.configManager.detectSystemPreferences();
            // ユーザー設定の読み込み（設定管理に委譲）
            this.configManager.loadUserPreferences();
            // 動的スタイルシートの作成（アニメーション制御に委譲）
            this.animationController.createDynamicStyleSheet();
            // パフォーマンス監視の開始（アニメーション制御に委譲）
            this.animationController.startPerformanceMonitoring();
            // イベントリスナーの設定（前庭安全に委譲）
            this.vestibularSafetyManager.setupEventListeners();
            // 初期アニメーション分析
            this.analyzeExistingAnimations();
            // 安全性監視開始（前庭安全に委譲）
            this.vestibularSafetyManager.startSafetyMonitoring() }

            console.log('MotionManager, initialized successfully'); }'

        } catch (error) { getErrorHandler().handleError(error, 'MOTION_MANAGER_ERROR', {''
                operation: 'initialize'
            }';'
        }
    }
    
    /**
     * 既存アニメーションの分析'
     */''
    analyzeExistingAnimations()';'
                '[style*="animation"], [style*="transition"], .animated, .animate);'
            
            animatedElements.forEach(element => {  );
                const category = this.detectAnimationCategory(element) }
                this.animationController.registerAnimation(element, category); }
            };
            ';'

            console.log(`Analyzed ${animatedElements.length} existing, animations`);
        } catch (error) { console.warn('Failed to analyze existing animations:', error }
    }
    
    /**
     * アニメーションカテゴリの検出
     */
    detectAnimationCategory(element) {
        // クラス名からカテゴリを推定
        const classNames = element.className.toLowerCase()','
        if(classNames.includes('particle)' return 'particles',
        if(classNames.includes('parallax)' return 'parallax',
        if(classNames.includes('camera)' return 'camera',
        if (classNames.includes('ui') || classNames.includes('menu)' return 'ui',
        if (classNames.includes('game') || classNames.includes('bubble)' return 'game',
        if (classNames.includes('background') || classNames.includes('bg)' return 'background',
        if(classNames.includes('transition)' return 'transitions',
        if(classNames.includes('transform)' return 'transforms',

        ' }'

        return 'general';
    
    // ========== 公開API（サブコンポーネントに委譲） ==========
    
    /**
     * モーションレベルの設定（設定管理に委譲）
     */
    setMotionLevel(level) { return this.configManager.setMotionLevel(level) }
    
    /**
     * カテゴリ別設定の取得（設定管理に委譲）
     */
    getCategoryConfig(category) { return this.configManager.getCategoryConfig(category) }
    
    /**
     * カテゴリ別設定の更新（設定管理に委譲）
     */
    setCategoryConfig(category, config) { return this.configManager.setCategoryConfig(category, config) }
    
    /**
     * アニメーションの登録（アニメーション制御に委譲）
     */
    registerAnimation(element, category, options) { return this.animationController.registerAnimation(element, category, options) }
    
    /**
     * アニメーションの登録解除（アニメーション制御に委譲）
     */
    unregisterAnimation(animationId) { return this.animationController.unregisterAnimation(animationId) }
    
    /**
     * すべてのアニメーション一時停止（アニメーション制御に委譲）
     */
    pauseAllAnimations() { return this.animationController.pauseAllAnimations() }
    
    /**
     * すべてのアニメーション再開（アニメーション制御に委譲）
     */
    resumeAllAnimations() { return this.animationController.resumeAllAnimations() }
    
    /**
     * カテゴリ別アニメーション一時停止（アニメーション制御に委譲）
     */
    pauseAnimationsByCategory(category) { return this.animationController.pauseAnimationsByCategory(category) }
    
    /**
     * カテゴリ別アニメーション再開（アニメーション制御に委譲）
     */
    resumeAnimationsByCategory(category) { return this.animationController.resumeAnimationsByCategory(category) }
    
    /**
     * 前庭安全性チェック（前庭安全に委譲）
     */
    checkVestibularSafety() { return this.vestibularSafetyManager.checkVestibularSafety() }
    
    /**
     * 緊急停止（前庭安全に委譲）
     */
    emergencyStop() { return this.vestibularSafetyManager.emergencyStop() }
    
    // ========== 後方互換性メソッド ==========
    
    /**
     * 段階的制御の設定（設定管理に委譲）
     */
    setGranularControl(property, value) {
        this.configManager.updateGranularControls({ [property]: value ) }
        return true;
    
    /**
     * 選択的軽減の設定（設定管理に委譲）
     */
    setSelectiveReduction(property, enabled) {
        this.configManager.updateSelectiveReduction({ [property]: enabled ) }
        return true;
    
    /**
     * モーションの再適用
     */
    reapplyMotionControls(property) {
        // 全アニメーションに設定を再適用
    }
        this.activeAnimations.forEach((animation, id) => {  }
            this.animationController.applyCategorySettings(animation.element, animation.category); }
        };
    }
    
    /**
     * パフォーマンスモードの切り替え（アニメーション制御に委譲）
     */''
    togglePerformanceMode(enabled) {

        document.body.classList.toggle('performance-mode', enabled);
        if (enabled) {
    }

            document.querySelectorAll('.complex-animation').forEach(element => { }

                element.style.animationPlayState = 'paused')'; }'
        }

        console.log(`Performance, mode ${enabled ? 'enabled' : 'disabled'}`;
    }
    
    // ========== 個別アニメーション制御（後方互換性） ==========
    
    /**
     * 個別アニメーション一時停止（後方互換性）
     */''
    pauseAnimation(element) {

        if(typeof, element === 'string' { }
            element = document.getElementById(element); }
        }

        if (element) {

            element.style.animationPlayState = 'paused',
            this.pausedAnimations.add(element) }
            this.stats.animationsPaused++; }
}
    
    /**
     * 個別アニメーション再開（後方互換性）'
     */''
    resumeAnimation(element) {

        if(typeof, element === 'string' { }
            element = document.getElementById(element); }
        }

        if (element) {

            element.style.animationPlayState = 'running' }
            this.pausedAnimations.delete(element); }
}
    
    /**
     * アニメーション軽減（後方互換性）'
     */''
    reduceAnimation(element) {

        if(typeof, element === 'string' { }
            element = document.getElementById(element); }
        }

        if (element) {

            element.style.animationDuration = '0.5s',
            element.style.animationIterationCount = '1',
            element.classList.add('motion-reduced) }'
            this.stats.animationsReduced++; }
}
    
    // ========== 状態取得 ==========
    
    /**
     * 現在の状態取得
     */
    getCurrentState() {
        return { motionLevel: this.currentLevel,
            vestibularSafety: this.config.vestibularSafety,
            activeAnimations: this.activeAnimations.size,
            pausedAnimations: this.pausedAnimations.size,
            frameRate: this.performanceMonitor.frameRate,
            categories: this.config.motionCategories,
    hazardPatterns: Object.fromEntries() }
                Object.entries(this.hazardPatterns).map(([key, value]) => [key, value.detected]) };
            ); }
        }
    
    /**
     * 統計情報の取得
     */
    getStats() { return { }
            main: { ...this.stats,
            config: this.configManager.getConfigStats(),
            animation: this.animationController.getAnimationStats(
    safety: this.vestibularSafetyManager.getSafetyStats() }
    
    // ========== その他のユーティリティ ==========
    
    /**
     * 警告の却下（後方互換性）
     */
    dismissWarning(controlId) {
        const control = document.getElementById(controlId);
        if (control) {
    }
            document.body.removeChild(control); }
}
    
    /**
     * クリーンアップ処理
     */
    destroy() {
        try {
            // サブコンポーネントのクリーンアップ
            if (this.vestibularSafetyManager) {
    }
                this.vestibularSafetyManager.destroy(); }
            }
            
            if (this.animationController) { this.animationController.destroy() }
            
            if (this.configManager) {
            ','

                this.configManager.destroy() }

            console.log('MotionManager, cleaned up, successfully');' }'

        } catch (error) { console.error('Failed to cleanup MotionManager:', error }

    }'}'