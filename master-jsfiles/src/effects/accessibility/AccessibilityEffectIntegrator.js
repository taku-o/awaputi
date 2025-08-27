import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { VisualEffectAccessibilityManager } from './VisualEffectAccessibilityManager.js';
import { AlternativeFeedbackManager } from './AlternativeFeedbackManager.js';

/**
 * アクセシビリティ効果統合管理クラス
 * 視覚効果システムとアクセシビリティ機能を統合
 */
export class AccessibilityEffectIntegrator {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.effectManager = null;
        this.accessibilityManager = null;
        this.visualAccessibilityManager = null;
        this.alternativeFeedbackManager = null;
        
        this.state = {
            initialized: false,
            enabled: true,
            integrationLevel: 'full' // 'minimal', 'partial', 'full'
        };
        
        // 統合設定
        this.integrationConfig = {
            autoDetectSettings: true,
            overrideVisualEffects: true,
            provideFeedbackAlternatives: true,
            announceImportantEffects: true,
            adaptToUserPreferences: true
        };
        
        console.log('AccessibilityEffectIntegrator initialized');
    }
    
    /**
     * 初期化
     */
    async initialize() {
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
    async getRequiredSystems() {
        // GameEngineから必要なシステムを取得
        this.effectManager = this.gameEngine.effectManager;
        this.accessibilityManager = this.gameEngine.accessibilityManager;
        
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
    async initializeAccessibilityManagers() {
        // 視覚効果アクセシビリティマネージャー
        this.visualAccessibilityManager = new VisualEffectAccessibilityManager(
            this.effectManager,
            this.accessibilityManager
        );
        await this.visualAccessibilityManager.initialize();
        
        // 代替フィードバックマネージャー
        this.alternativeFeedbackManager = new AlternativeFeedbackManager(
            this.accessibilityManager,
            this.gameEngine.audioManager
        );
        await this.alternativeFeedbackManager.initialize();
        
        console.log('Accessibility managers initialized');
    }
    
    /**
     * エフェクトシステムとの統合
     */
    async integrateWithEffectSystems() {
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
    integrateWithParticleManager() {
        const particleManager = this.effectManager.enhancedParticleManager;
        
        // 元のメソッドを保存
        const originalCreateBubbleEffect = particleManager.createAdvancedBubbleEffect?.bind(particleManager);
        const originalCreateComboEffect = particleManager.createEnhancedComboEffect?.bind(particleManager);
        
        // アクセシビリティ統合版に置き換え
        particleManager.createAdvancedBubbleEffect = (x, y, bubbleType, bubbleSize, options = {}) => {
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
        
        particleManager.createEnhancedComboEffect = (x, y, comboCount, comboType) => {
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
    integrateWithEffectManager() {
        const effectManager = this.effectManager.enhancedEffectManager;
        
        // 元のメソッドを保存
        const originalAddScreenEffect = effectManager.addScreenEffect?.bind(effectManager);
        const originalAddLightingEffect = effectManager.addLightingEffect?.bind(effectManager);
        
        // アクセシビリティ統合版に置き換え
        effectManager.addScreenEffect = (effectType, options = {}) => {
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
        
        effectManager.addLightingEffect = (x, y, intensity, color, radius) => {
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
    integrateWithAnimationManager() {
        const animationManager = this.effectManager.animationManager;
        
        // 元のメソッドを保存
        const originalAnimateUIElement = animationManager.animateUIElement?.bind(animationManager);
        const originalAnimateBubbleSpawn = animationManager.animateBubbleSpawn?.bind(animationManager);
        
        // アクセシビリティ統合版に置き換え
        animationManager.animateUIElement = (element, animationType, duration, options = {}) => {
            // UIアニメーションの処理
            const accessibleOptions = this.processUIAnimation(animationType, duration, options);
            
            if (originalAnimateUIElement) {
                return originalAnimateUIElement(element, animationType, accessibleOptions.duration, accessibleOptions);
            }
            return null;
        };
        
        animationManager.animateBubbleSpawn = (bubble, spawnType) => {
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
    integrateWithSeasonalEffectManager() {
        const seasonalManager = this.effectManager.seasonalEffectManager;
        
        // 元のメソッドを保存
        const originalApplySeasonalTheme = seasonalManager.applySeasonalTheme?.bind(seasonalManager);
        
        // アクセシビリティ統合版に置き換え
        seasonalManager.applySeasonalTheme = (theme) => {
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
    processParticleEffect(effectType, options, context) {
        if (!this.visualAccessibilityManager) return options;
        
        return this.visualAccessibilityManager.applyAccessibilityToParticle(options);
    }
    
    /**
     * 画面効果の処理
     */
    processScreenEffect(effectType, options) {
        if (!this.visualAccessibilityManager) return options;
        
        return this.visualAccessibilityManager.applyAccessibilityToEffect(effectType, options);
    }
    
    /**
     * 光源効果の処理
     */
    processLightingEffect(lightingOptions) {
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
    processUIAnimation(animationType, duration, options) {
        if (!this.visualAccessibilityManager) {
            return { duration, ...options };
        }
        
        return this.visualAccessibilityManager.applyAccessibilityToAnimation(animationType, duration, options);
    }
    
    /**
     * バブルスポーンアニメーションの処理
     */
    processBubbleSpawnAnimation(spawnType) {
        const config = this.visualAccessibilityManager?.getConfiguration();
        
        if (config?.motionReduced) {
            // アニメーションを簡素化
            const simplifiedTypes = {
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
    processSeasonalTheme(theme) {
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
    adaptThemeForColorBlindness(theme, colorBlindnessType) {
        // 色覚異常タイプに応じたテーマ調整
        const adaptations = {
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
    provideFeedbackForEffect(effectType, options = {}) {
        if (!this.alternativeFeedbackManager || !this.state.enabled) return;
        
        this.alternativeFeedbackManager.provideIntegratedFeedback(effectType, null, {
            hapticIntensity: options.hapticIntensity || 0.5,
            description: options.description,
            canvasContext: this.gameEngine.canvas?.getContext('2d')
        });
    }
    
    /**
     * バブルの触覚強度を取得
     */
    getBubbleHapticIntensity(bubbleType) {
        const intensities = {
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
    getComboHapticIntensity(comboCount) {
        if (comboCount < 5) return 0.3;
        if (comboCount < 10) return 0.6;
        return 1.0;
    }
    
    /**
     * バブル効果の説明を取得
     */
    getBubbleEffectDescription(bubbleType) {
        const descriptions = {
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
    getComboEffectDescription(comboCount) {
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
    getScreenEffectDescription(effectType) {
        const descriptions = {
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
    announceThemeChange(theme) {
        if (!this.alternativeFeedbackManager) return;
        
        const themeName = theme.name || theme.id || '不明';
        const description = `テーマが${themeName}に変更されました`;
        
        this.alternativeFeedbackManager.announceVisualEffect(description);
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        if (this.accessibilityManager) {
            // アクセシビリティ設定変更の監視
            this.accessibilityManager.addEventListener('configurationApplied', (event) => {
                this.handleAccessibilityConfigChange(event.config);
            });
            
            // システム設定変更の監視
            this.accessibilityManager.addEventListener('systemPreferenceChanged', (event) => {
                this.handleSystemPreferenceChange(event);
            });
        }
        
        // GameEngineイベントの監視
        if (this.gameEngine) {
            this.gameEngine.addEventListener?.('sceneChanged', (event) => {
                this.handleSceneChange(event);
            });
        }
    }
    
    /**
     * アクセシビリティ設定変更の処理
     */
    handleAccessibilityConfigChange(config) {
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
    handleSystemPreferenceChange(event) {
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
    handleSceneChange(event) {
        // シーン固有のアクセシビリティ設定を適用
        this.applySceneSpecificSettings(event.newScene);
    }
    
    /**
     * 統合レベルの調整
     */
    adjustIntegrationLevel(config) {
        let integrationLevel = 'full';
        
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
    applySceneSpecificSettings(sceneName) {
        // シーンに応じたアクセシビリティ設定の調整
        const sceneSettings = {
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
    async applyInitialSettings() {
        if (this.accessibilityManager) {
            const config = this.accessibilityManager.getConfiguration();
            this.handleAccessibilityConfigChange(config);
        }
    }
    
    /**
     * 統合状態の取得
     */
    getIntegrationStatus() {
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
    setEnabled(enabled) {
        this.state.enabled = enabled;
        
        if (this.visualAccessibilityManager) {
            this.visualAccessibilityManager.setEnabled?.(enabled);
        }
        
        if (this.alternativeFeedbackManager) {
            this.alternativeFeedbackManager.setEnabled?.(enabled);
        }
        
        console.log(`Accessibility effect integration ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * レポート生成
     */
    generateReport() {
        return {
            component: 'AccessibilityEffectIntegrator',
            state: { ...this.state },
            configuration: { ...this.integrationConfig },
            managers: {
                visual: this.visualAccessibilityManager?.generateReport?.() || null,
                alternativeFeedback: this.alternativeFeedbackManager?.generateReport?.() || null
            },
            integrationStatus: this.getIntegrationStatus()
        };
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
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
        
        // 参照のクリア
        this.gameEngine = null;
        this.effectManager = null;
        this.accessibilityManager = null;
        
        this.state.initialized = false;
        console.log('AccessibilityEffectIntegrator destroyed');
    }
}