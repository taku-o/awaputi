import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { VisualEffectAccessibilityManager } from './VisualEffectAccessibilityManager.js';
import { AlternativeFeedbackManager } from './AlternativeFeedbackManager.js';

// Type definitions for accessibility effect integration
interface AccessibilityIntegrationState {
    initialized: boolean;
    enabled: boolean;
    integrationLevel: 'minimal' | 'partial' | 'full';
}

interface AccessibilityIntegrationConfig {
    autoDetectSettings: boolean;
    overrideVisualEffects: boolean;
    provideFeedbackAlternatives: boolean;
    announceImportantEffects: boolean;
    adaptToUserPreferences: boolean;
}

interface GameEngine {
    effectManager?: EffectManager;
    accessibilityManager?: AccessibilityManager;
    audioManager?: AudioManager;
    canvas?: HTMLCanvasElement;
    addEventListener?(event: string, handler: (event: any) => void): void;
}

interface EffectManager {
    enhancedParticleManager?: EnhancedParticleManager;
    enhancedEffectManager?: EnhancedEffectManager;
    animationManager?: AnimationManager;
    seasonalEffectManager?: SeasonalEffectManager;
}

interface EnhancedParticleManager {
    createAdvancedBubbleEffect?: (x: number, y: number, bubbleType: string, bubbleSize: number, options?: ParticleEffectOptions) => any;
    createEnhancedComboEffect?: (x: number, y: number, comboCount: number, comboType: string) => any;
}

interface EnhancedEffectManager {
    addScreenEffect?: (effectType: string, options?: ScreenEffectOptions) => any;
    addLightingEffect?: (x: number, y: number, intensity: number, color: string, radius: number) => any;
}

interface AnimationManager {
    animateUIElement?: (element: any, animationType: string, duration: number, options?: AnimationOptions) => any;
    animateBubbleSpawn?: (bubble: any, spawnType: string) => any;
}

interface SeasonalEffectManager {
    applySeasonalTheme?: (theme: SeasonalTheme) => any;
}

interface AccessibilityManager {
    getConfiguration(): AccessibilityConfiguration;
    applyConfiguration(config: AccessibilityConfiguration): Promise<void>;
    addEventListener(event: string, handler: (event: any) => void): void;
    removeEventListener?(event: string): void;
}

interface AudioManager {
    // Basic audio manager interface
}

// Effect-related type definitions
interface ParticleEffectOptions {
    position?: { x: number; y: number; };
    type?: string;
    size?: number;
    color?: string;
    count?: number;
    lifetime?: number;
    movement?: {
        type: string;
        speed: number;
        [key: string]: any;
    };
}

interface ScreenEffectOptions {
    color?: string;
    intensity?: number;
    duration?: number;
    [key: string]: any;
}

interface AnimationOptions {
    duration?: number;
    easing?: string;
    amplitude?: number;
    fromColor?: string;
    toColor?: string;
    [key: string]: any;
}

interface LightingEffectOptions {
    x: number;
    y: number;
    intensity: number;
    color: string;
    radius: number;
}

interface SeasonalTheme {
    name?: string;
    id?: string;
    colorScheme?: {
        primary?: string[];
        secondary?: string[];
        accent?: string[];
    };
    [key: string]: any;
}

// Accessibility configuration interfaces
interface AccessibilityConfiguration {
    visual?: {
        highContrast?: {
            enabled: boolean;
            level?: string;
            customColors?: any;
        };
        colorBlindness?: {
            enabled: boolean;
            type?: string;
        };
        motion?: {
            reduced: boolean;
            level?: string;
            alternativeEffects?: boolean;
        };
        textScaling?: {
            enabled: boolean;
            scale?: number;
        };
    };
    audio?: {
        visualFeedback?: {
            enabled: boolean;
            intensity?: string;
            type?: string;
        };
        vibration?: {
            enabled: boolean;
            intensity?: number;
        };
        captions?: {
            enabled: boolean;
        };
    };
    keyboard?: {
        navigationMode?: string;
        focusVisible?: boolean;
        skipLinks?: boolean;
    };
    cognitive?: {
        simplification?: {
            enabled: boolean;
            level?: string;
        };
        help?: {
            contextual?: boolean;
            tooltips?: boolean;
            tutorials?: boolean;
        };
    };
    screenReader?: {
        enabled?: boolean;
        speechRate?: number;
    };
}

interface FeedbackOptions {
    hapticIntensity?: number;
    description?: string;
    canvasContext?: CanvasRenderingContext2D;
    volume?: number;
    rate?: number;
    pitch?: number;
    language?: string;
}

interface SceneChangeEvent {
    newScene: string;
    oldScene?: string;
}

interface SystemPreferenceChangeEvent {
    preference: string;
    value: any;
}

interface IntegrationStatus {
    initialized: boolean;
    enabled: boolean;
    integrationLevel: string;
    managersAvailable: {
        visual: boolean;
        alternativeFeedback: boolean;
        accessibility: boolean;
    };
    configuration: AccessibilityIntegrationConfig;
}

interface AccessibilityReport {
    component: string;
    state: AccessibilityIntegrationState;
    configuration: AccessibilityIntegrationConfig;
    managers: {
        visual: any;
        alternativeFeedback: any;
    };
    integrationStatus: IntegrationStatus;
}

/**
 * アクセシビリティ効果統合管理クラス
 * 視覚効果システムとアクセシビリティ機能を統合
 */
export class AccessibilityEffectIntegrator {
    private gameEngine: GameEngine;
    private effectManager: EffectManager | null = null;
    private accessibilityManager: AccessibilityManager | null = null;
    private visualAccessibilityManager: VisualEffectAccessibilityManager | null = null;
    private alternativeFeedbackManager: AlternativeFeedbackManager | null = null;
    private state: AccessibilityIntegrationState = {
        initialized: false,
        enabled: true,
        integrationLevel: 'full' // 'minimal', 'partial', 'full'
    };

    // 統合設定
    private integrationConfig: AccessibilityIntegrationConfig = {
        autoDetectSettings: true,
        overrideVisualEffects: true,
        provideFeedbackAlternatives: true,
        announceImportantEffects: true,
        adaptToUserPreferences: true
    };

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        console.log('AccessibilityEffectIntegrator initialized');
    }
    
    /**
     * 初期化
     */
    async initialize(): Promise<boolean> {
        try {
            console.log('Initializing accessibility effect integration...');
            
            // 必要なシステムの取得
            await this.getRequiredSystems();
            
            // アクセシビリティマネージャーの初期化
            await this.initializeAccessibilityManagers();
            
            // エフェクトシステムとの統合
            await this.integrateWithEffectSystems();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // 初期設定の適用
            await this.applyInitialSettings();

            this.state.initialized = true;
            console.log('Accessibility effect integration initialized successfully');
            
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_ERROR', {
                operation: 'initialize',
                component: 'AccessibilityEffectIntegrator'
            });
            return false;
        }
    }
    
    /**
     * 必要なシステムの取得
     */
    private async getRequiredSystems(): Promise<void> {
        // GameEngineから必要なシステムを取得
        this.effectManager = this.gameEngine.effectManager || null;
        this.accessibilityManager = this.gameEngine.accessibilityManager || null;

        if (!this.effectManager) {
            throw new Error('EffectManager not found in GameEngine');
        }

        if (!this.accessibilityManager) {
            console.warn('AccessibilityManager not found, creating basic instance');
            // 基本的なアクセシビリティ機能のみ提供
            this.state.integrationLevel = 'minimal';
        }
    }
    
    /**
     * アクセシビリティマネージャーの初期化
     */
    private async initializeAccessibilityManagers(): Promise<void> {
        // 視覚効果アクセシビリティマネージャー
        this.visualAccessibilityManager = new VisualEffectAccessibilityManager(
            this.effectManager!,
            this.accessibilityManager!
        );
        await this.visualAccessibilityManager.initialize();
        
        // 代替フィードバックマネージャー
        this.alternativeFeedbackManager = new AlternativeFeedbackManager(
            this.accessibilityManager!,
            this.gameEngine.audioManager!
        );
        await this.alternativeFeedbackManager.initialize();
        
        console.log('Accessibility managers initialized');
    }
    
    /**
     * エフェクトシステムとの統合
     */
    private async integrateWithEffectSystems(): Promise<void> {
        if (!this.effectManager) return;
        
        // EnhancedParticleManagerとの統合
        if (this.effectManager.enhancedParticleManager) {
            this.integrateWithParticleManager();
        }
        
        // EnhancedEffectManagerとの統合
        if (this.effectManager.enhancedEffectManager) {
            this.integrateWithEffectManager();
        }
        
        // AnimationManagerとの統合
        if (this.effectManager.animationManager) {
            this.integrateWithAnimationManager();
        }
        
        // SeasonalEffectManagerとの統合
        if (this.effectManager.seasonalEffectManager) {
            this.integrateWithSeasonalEffectManager();
        }

        console.log('Integration with effect systems completed');
    }
    
    /**
     * パーティクルマネージャーとの統合
     */
    private integrateWithParticleManager(): void {
        const particleManager = this.effectManager!.enhancedParticleManager!;
        
        // 元のメソッドを保存
        const originalCreateBubbleEffect = particleManager.createAdvancedBubbleEffect?.bind(particleManager);
        const originalCreateComboEffect = particleManager.createEnhancedComboEffect?.bind(particleManager);

        // アクセシビリティ統合版に置き換え
        particleManager.createAdvancedBubbleEffect = (x: number, y: number, bubbleType: string, bubbleSize: number, options: ParticleEffectOptions = {}): any => {
            // アクセシビリティチェック
            const accessibleOptions = this.processParticleEffect('bubble-pop', options, {
                position: { x, y },
                type: bubbleType,
                size: bubbleSize
            });
            
            // 代替フィードバックの提供
            this.provideFeedbackForEffect('bubble-pop', {
                hapticIntensity: this.getBubbleHapticIntensity(bubbleType),
                description: this.getBubbleEffectDescription(bubbleType)
            });

            if (originalCreateBubbleEffect) {
                return originalCreateBubbleEffect(x, y, bubbleType, bubbleSize, accessibleOptions);
            }
            return null;
        };

        particleManager.createEnhancedComboEffect = (x: number, y: number, comboCount: number, comboType: string): any => {
            // コンボ効果の処理
            const accessibleOptions = this.processParticleEffect('combo', {}, {
                position: { x, y },
                count: comboCount,
                type: comboType
            });
            
            // コンボレベルに応じた代替フィードバック
            this.provideFeedbackForEffect('combo-start', {
                hapticIntensity: this.getComboHapticIntensity(comboCount),
                description: this.getComboEffectDescription(comboCount)
            });

            if (originalCreateComboEffect) {
                return originalCreateComboEffect(x, y, comboCount, comboType);
            }
            return null;
        };
    }
    
    /**
     * エフェクトマネージャーとの統合
     */
    private integrateWithEffectManager(): void {
        const effectManager = this.effectManager!.enhancedEffectManager!;
        
        // 元のメソッドを保存
        const originalAddScreenEffect = effectManager.addScreenEffect?.bind(effectManager);
        const originalAddLightingEffect = effectManager.addLightingEffect?.bind(effectManager);
        
        // アクセシビリティ統合版に置き換え
        effectManager.addScreenEffect = (effectType: string, options: ScreenEffectOptions = {}): any => {
            // 画面効果の処理
            const accessibleOptions = this.processScreenEffect(effectType, options);
            
            // 画面効果に対する代替フィードバック
            this.provideFeedbackForEffect(effectType, {
                description: this.getScreenEffectDescription(effectType)
            });
            
            if (originalAddScreenEffect) {
                return originalAddScreenEffect(effectType, accessibleOptions);
            }
            return null;
        };
        
        effectManager.addLightingEffect = (x: number, y: number, intensity: number, color: string, radius: number): any => {
            // 光源効果の処理
            const accessibleOptions = this.processLightingEffect({ x, y, intensity, color, radius });
            
            if (originalAddLightingEffect) {
                return originalAddLightingEffect(
                    accessibleOptions.x,
                    accessibleOptions.y,
                    accessibleOptions.intensity,
                    accessibleOptions.color,
                    accessibleOptions.radius
                );
            }
            return null;
        };
    }
    
    /**
     * アニメーションマネージャーとの統合
     */
    private integrateWithAnimationManager(): void {
        const animationManager = this.effectManager!.animationManager!;
        
        // 元のメソッドを保存
        const originalAnimateUIElement = animationManager.animateUIElement?.bind(animationManager);
        const originalAnimateBubbleSpawn = animationManager.animateBubbleSpawn?.bind(animationManager);
        
        // アクセシビリティ統合版に置き換え
        animationManager.animateUIElement = (element: any, animationType: string, duration: number, options: AnimationOptions = {}): any => {
            // UIアニメーションの処理
            const accessibleOptions = this.processUIAnimation(animationType, duration, options);
            
            if (originalAnimateUIElement) {
                return originalAnimateUIElement(element, animationType, accessibleOptions.duration, accessibleOptions);
            }
            return null;
        };
        
        animationManager.animateBubbleSpawn = (bubble: any, spawnType: string): any => {
            // バブルスポーンアニメーションの処理
            const accessibleSpawnType = this.processBubbleSpawnAnimation(spawnType);
            
            if (originalAnimateBubbleSpawn) {
                return originalAnimateBubbleSpawn(bubble, accessibleSpawnType);
            }
            return null;
        };
    }
    
    /**
     * 季節効果マネージャーとの統合
     */
    private integrateWithSeasonalEffectManager(): void {
        const seasonalManager = this.effectManager!.seasonalEffectManager!;
        
        // 元のメソッドを保存
        const originalApplySeasonalTheme = seasonalManager.applySeasonalTheme?.bind(seasonalManager);
        
        // アクセシビリティ統合版に置き換え
        seasonalManager.applySeasonalTheme = (theme: SeasonalTheme): any => {
            // 季節テーマの処理
            const accessibleTheme = this.processSeasonalTheme(theme);
            
            // テーマ変更の通知
            this.announceThemeChange(theme);
            
            if (originalApplySeasonalTheme) {
                return originalApplySeasonalTheme(accessibleTheme);
            }
            return null;
        };
    }
    
    /**
     * パーティクル効果の処理
     */
    private processParticleEffect(effectType: string, options: ParticleEffectOptions, context: any): ParticleEffectOptions {
        if (!this.visualAccessibilityManager) return options;
        
        return this.visualAccessibilityManager.applyAccessibilityToParticle(options);
    }
    
    /**
     * 画面効果の処理
     */
    private processScreenEffect(effectType: string, options: ScreenEffectOptions): ScreenEffectOptions {
        if (!this.visualAccessibilityManager) return options;
        
        return this.visualAccessibilityManager.applyAccessibilityToEffect(effectType, options);
    }
    
    /**
     * 光源効果の処理
     */
    private processLightingEffect(lightingOptions: LightingEffectOptions): LightingEffectOptions {
        if (!this.visualAccessibilityManager) return lightingOptions;
        
        // ハイコントラストモードでの光源調整
        const config = this.visualAccessibilityManager.getConfiguration();
        if (config.highContrastActive) {
            return {
                ...lightingOptions,
                intensity: Math.min(lightingOptions.intensity * 1.5, 1.0),
                color: this.visualAccessibilityManager.convertToHighContrast(lightingOptions.color)
            };
        }
        
        return lightingOptions;
    }
    
    /**
     * UIアニメーションの処理
     */
    private processUIAnimation(animationType: string, duration: number, options: AnimationOptions): AnimationOptions & { duration: number } {
        if (!this.visualAccessibilityManager) {
            return { duration, ...options };
        }
        
        return this.visualAccessibilityManager.applyAccessibilityToAnimation(animationType, duration, options);
    }
    
    /**
     * バブルスポーンアニメーションの処理
     */
    private processBubbleSpawnAnimation(spawnType: string): string {
        const config = this.visualAccessibilityManager?.getConfiguration();
        if (config?.motionReduced) {
            // アニメーションを簡素化
            const simplifiedTypes: Record<string, string> = {
                'bounce': 'fade',
                'spiral': 'scale',
                'explosion': 'fade'
            };

            return simplifiedTypes[spawnType] || 'fade';
        }
        
        return spawnType;
    }
    
    /**
     * 季節テーマの処理
     */
    private processSeasonalTheme(theme: SeasonalTheme): SeasonalTheme {
        const config = this.visualAccessibilityManager?.getConfiguration();
        if (config?.highContrastActive) {
            // ハイコントラスト版のテーマを適用
            return {
                ...theme,
                colorScheme: {
                    primary: ['#FFFFFF', '#000000'],
                    secondary: ['#FFFF00', '#FF0000'],
                    accent: ['#00FF00', '#0000FF']
                }
            };
        }

        if (config?.colorBlindnessMode !== 'none') {
            // 色覚異常対応のテーマを適用
            return this.adaptThemeForColorBlindness(theme, config.colorBlindnessMode);
        }
        
        return theme;
    }
    
    /**
     * 色覚異常対応テーマの適用
     */
    private adaptThemeForColorBlindness(theme: SeasonalTheme, colorBlindnessType: string): SeasonalTheme {
        // 色覚異常タイプに応じたテーマ調整
        const adaptations: Record<string, { avoidColors: string[]; preferColors: string[]; }> = {
            'protanopia': { // 赤色盲
                avoidColors: ['#FF0000', '#FF4500'],
                preferColors: ['#0000FF', '#00FF00', '#FFFF00']
            },
            'deuteranopia': { // 緑色盲
                avoidColors: ['#00FF00', '#32CD32'],
                preferColors: ['#FF0000', '#0000FF', '#FFFF00']
            },
            'tritanopia': { // 青色盲
                avoidColors: ['#0000FF', '#4169E1'],
                preferColors: ['#FF0000', '#00FF00', '#FF8000']
            }
        };
        
        const adaptation = adaptations[colorBlindnessType];
        if (!adaptation) return theme;
        
        return {
            ...theme,
            colorScheme: {
                ...theme.colorScheme,
                primary: adaptation.preferColors.slice(0, 2),
                secondary: adaptation.preferColors.slice(1, 3),
                accent: adaptation.preferColors
            }
        };
    }
    
    /**
     * 効果に対するフィードバックの提供
     */
    private provideFeedbackForEffect(effectType: string, options: FeedbackOptions = {}): void {
        if (!this.alternativeFeedbackManager || !this.state.enabled) return;
        
        this.alternativeFeedbackManager.provideIntegratedFeedback(effectType, null, {
            hapticIntensity: options.hapticIntensity || 0.5,
            description: options.description,
            canvasContext: this.gameEngine.canvas?.getContext('2d') || undefined
        });
    }
    
    /**
     * バブルの触覚強度を取得
     */
    private getBubbleHapticIntensity(bubbleType: string): number {
        const intensities: Record<string, number> = {
            'normal': 0.3,
            'stone': 0.5,
            'iron': 0.7,
            'diamond': 0.9,
            'boss': 1.0,
            'electric': 0.8,
            'rainbow': 0.6,
            'golden': 0.7
        };
        
        return intensities[bubbleType] || 0.5;
    }
    
    /**
     * コンボの触覚強度を取得
     */
    private getComboHapticIntensity(comboCount: number): number {
        if (comboCount < 5) return 0.3;
        if (comboCount < 10) return 0.6;
        return 1.0;
    }
    
    /**
     * バブル効果の説明を取得
     */
    private getBubbleEffectDescription(bubbleType: string): string {
        const descriptions: Record<string, string> = {
            'normal': '通常のバブルが破壊されました',
            'stone': '石バブルが破壊されました',
            'iron': '鉄バブルが破壊されました',
            'diamond': 'ダイヤモンドバブルが破壊されました',
            'boss': 'ボスバブルが破壊されました',
            'electric': '電気バブルが破壊され、画面が震動しています',
            'rainbow': 'レインボーバブルが破壊され、ボーナスタイムが開始されました',
            'golden': 'ゴールデンバブルが破壊されました'
        };

        return descriptions[bubbleType] || 'バブルが破壊されました';
    }
    
    /**
     * コンボ効果の説明を取得
     */
    private getComboEffectDescription(comboCount: number): string {
        if (comboCount < 5) {
            return `${comboCount}コンボ達成`;
        } else if (comboCount < 10) {
            return `${comboCount}コンボ達成！画面がフラッシュしています`;
        } else {
            return `${comboCount}コンボ達成！！画面が震動し、虹色の効果が表示されています`;
        }
    }
    
    /**
     * 画面効果の説明を取得
     */
    private getScreenEffectDescription(effectType: string): string {
        const descriptions: Record<string, string> = {
            'flash': '画面がフラッシュしています',
            'shake': '画面が震動しています',
            'zoom': '画面がズームしています',
            'fade': '画面がフェードしています',
            'blur': '画面がぼかされています'
        };

        return descriptions[effectType] || '画面効果が実行されています';
    }
    
    /**
     * テーマ変更の通知
     */
    private announceThemeChange(theme: SeasonalTheme): void {
        if (!this.alternativeFeedbackManager) return;

        const themeName = theme.name || theme.id || '不明';
        const description = `テーマが${themeName}に変更されました`;
        
        this.alternativeFeedbackManager.announceVisualEffect(description);
    }
    
    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void {
        if (this.accessibilityManager) {
            // アクセシビリティ設定変更の監視
            this.accessibilityManager.addEventListener('configurationApplied', (event: any) => {
                this.handleAccessibilityConfigChange(event.config);
            });
            
            // システム設定変更の監視
            this.accessibilityManager.addEventListener('systemPreferenceChanged', (event: SystemPreferenceChangeEvent) => {
                this.handleSystemPreferenceChange(event);
            });
        }
        
        // GameEngineイベントの監視
        if (this.gameEngine) {
            this.gameEngine.addEventListener?.('sceneChanged', (event: SceneChangeEvent) => {
                this.handleSceneChange(event);
            });
        }
    }
    /**
     * アクセシビリティ設定変更の処理
     */
    private handleAccessibilityConfigChange(config: AccessibilityConfiguration): void {
        console.log('Accessibility configuration changed, updating integrations...');
        
        // 統合レベルの調整
        this.adjustIntegrationLevel(config);
        
        // マネージャーへの設定反映
        if (this.visualAccessibilityManager) {
            this.visualAccessibilityManager.applyAccessibilitySettings();
        }
        
        if (this.alternativeFeedbackManager) {
            this.alternativeFeedbackManager.applyConfiguration();
        }
    }
    
    /**
     * システム設定変更の処理
     */
    private handleSystemPreferenceChange(event: SystemPreferenceChangeEvent): void {
        console.log('System preference changed:', event.preference);
        
        // 必要に応じて統合設定を調整
        if (event.preference === 'reducedMotion' && event.value) {
            this.integrationConfig.overrideVisualEffects = true;
            console.log('Enhanced visual effect overrides enabled for reduced motion');
        }
    }
    
    /**
     * シーン変更の処理
     */
    private handleSceneChange(event: SceneChangeEvent): void {
        // シーン固有のアクセシビリティ設定を適用
        this.applySceneSpecificSettings(event.newScene);
    }
    
    /**
     * 統合レベルの調整
     */
    private adjustIntegrationLevel(config: AccessibilityConfiguration): void {
        let integrationLevel: 'minimal' | 'partial' | 'full' = 'full';
        
        // 設定に基づいて統合レベルを決定
        const accessibilityFeatures = [
            config.visual?.highContrast?.enabled,
            config.visual?.colorBlindness?.enabled,
            config.visual?.motion?.reduced,
            config.audio?.visualFeedback?.enabled,
            config.audio?.vibration?.enabled
        ].filter(Boolean).length;

        if (accessibilityFeatures === 0) {
            integrationLevel = 'minimal';
        } else if (accessibilityFeatures < 3) {
            integrationLevel = 'partial';
        }
        
        this.state.integrationLevel = integrationLevel;
        console.log(`Integration level adjusted to: ${integrationLevel}`);
    }
    
    /**
     * シーン固有設定の適用
     */
    private applySceneSpecificSettings(sceneName: string): void {
        // シーンに応じたアクセシビリティ設定の調整
        const sceneSettings: Record<string, Partial<AccessibilityIntegrationConfig>> = {
            'GameScene': {
                announceImportantEffects: true,
                provideFeedbackAlternatives: true
            },
            'MenuScene': {
                announceImportantEffects: false,
                provideFeedbackAlternatives: false
            }
        };
        
        const settings = sceneSettings[sceneName];
        if (settings) {
            Object.assign(this.integrationConfig, settings);
            console.log(`Scene-specific accessibility settings applied for: ${sceneName}`);
        }
    }
    /**
     * 初期設定の適用
     */
    private async applyInitialSettings(): Promise<void> {
        if (this.accessibilityManager) {
            const config = this.accessibilityManager.getConfiguration();
            this.handleAccessibilityConfigChange(config);
        }
    }
    
    /**
     * 統合状態の取得
     */
    getIntegrationStatus(): IntegrationStatus {
        return {
            initialized: this.state.initialized,
            enabled: this.state.enabled,
            integrationLevel: this.state.integrationLevel,
            managersAvailable: {
                visual: !!this.visualAccessibilityManager,
                alternativeFeedback: !!this.alternativeFeedbackManager,
                accessibility: !!this.accessibilityManager
            },
            configuration: { ...this.integrationConfig }
        };
    }
    
    /**
     * 統合の有効/無効切り替え
     */
    setEnabled(enabled: boolean): void {
        this.state.enabled = enabled;
        
        if (this.visualAccessibilityManager) {
            (this.visualAccessibilityManager as any).setEnabled?.(enabled);
        }
        
        if (this.alternativeFeedbackManager) {
            (this.alternativeFeedbackManager as any).setEnabled?.(enabled);
        }

        console.log(`Accessibility effect integration ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * レポート生成
     */
    generateReport(): AccessibilityReport {
        return {
            component: 'AccessibilityEffectIntegrator',
            state: { ...this.state },
            configuration: { ...this.integrationConfig },
            managers: {
                visual: (this.visualAccessibilityManager as any)?.generateReport?.() || null,
                alternativeFeedback: (this.alternativeFeedbackManager as any)?.generateReport?.() || null
            },
            integrationStatus: this.getIntegrationStatus()
        };
    }
    
    /**
     * クリーンアップ
     */
    destroy(): void {
        console.log('Destroying AccessibilityEffectIntegrator...');
        
        // マネージャーのクリーンアップ
        if (this.visualAccessibilityManager) {
            this.visualAccessibilityManager.destroy();
            this.visualAccessibilityManager = null;
        }
        
        if (this.alternativeFeedbackManager) {
            this.alternativeFeedbackManager.destroy();
            this.alternativeFeedbackManager = null;
        }

        this.state.initialized = false;
        console.log('AccessibilityEffectIntegrator destroyed');
    }
}