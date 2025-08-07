import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * Particle Quality Manager
 * パーティクル品質管理 - 品質制御、最適化設定、パフォーマンス調整
 */
export class ParticleQualityManager {
    constructor() {
        this.errorHandler = getErrorHandler();
        
        // 品質設定
        this.qualitySettings = {
            low: { countMultiplier: 0.25, sizeMultiplier: 0.8, complexityLevel: 1 },
            medium: { countMultiplier: 0.5, sizeMultiplier: 0.9, complexityLevel: 2 },
            high: { countMultiplier: 1.0, sizeMultiplier: 1.0, complexityLevel: 3 },
            ultra: { countMultiplier: 1.5, sizeMultiplier: 1.2, complexityLevel: 4 }
        };
        
        // 現在の品質レベル
        this.currentQualityLevel = 'high';
        
        // パフォーマンス最適化設定
        this.optimizationSettings = {
            batchRendering: false,
            aggressiveCulling: false,
            smoothTransitions: false,
            interpolation: false,
            easingEnabled: false,
            colorPalettes: [],
            physicsEnhancements: false
        };
        
        // 色パレット
        this.colorPalettes = {
            default: ['#ffffff', '#ffff00', '#ff00ff', '#00ffff'],
            warm: ['#ff6b35', '#f7931e', '#ffd23f', '#fff95b'],
            cool: ['#4fc3f7', '#29b6f6', '#03a9f4', '#0288d1'],
            nature: ['#4caf50', '#8bc34a', '#cddc39', '#ffeb3b'],
            fire: ['#ff5722', '#ff9800', '#ffc107', '#ffeb3b'],
            ocean: ['#006064', '#0097a7', '#00bcd4', '#26c6da']
        };
        
        console.log('[ParticleQualityManager] パーティクル品質管理システムを初期化しました');
    }
    
    /**
     * 品質レベルを設定
     */
    setQualityLevel(level) {
        try {
            if (this.qualitySettings[level]) {
                this.currentQualityLevel = level;
                const settings = this.qualitySettings[level];
                
                console.log(`[ParticleQualityManager] 品質レベルを${level}に設定しました:`, settings);
                return settings;
            } else {
                console.warn(`[ParticleQualityManager] 無効な品質レベル: ${level}`);
                return this.qualitySettings.high;
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleQualityManager.setQualityLevel'
            });
            return this.qualitySettings.high;
        }
    }
    
    /**
     * 現在の品質レベルを取得
     */
    getCurrentQualityLevel() {
        return this.currentQualityLevel;
    }
    
    /**
     * 現在の品質設定を取得
     */
    getCurrentQualitySettings() {
        return this.qualitySettings[this.currentQualityLevel];
    }
    
    /**
     * パーティクル数を品質に応じて調整
     */
    adjustParticleCount(baseCount) {
        try {
            const settings = this.qualitySettings[this.currentQualityLevel];
            return Math.floor(baseCount * settings.countMultiplier);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleQualityManager.adjustParticleCount'
            });
            return baseCount;
        }
    }
    
    /**
     * パーティクルサイズを品質に応じて調整
     */
    adjustParticleSize(baseSize) {
        try {
            const settings = this.qualitySettings[this.currentQualityLevel];
            return baseSize * settings.sizeMultiplier;
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleQualityManager.adjustParticleSize'
            });
            return baseSize;
        }
    }
    
    /**
     * 複雑度レベルを取得
     */
    getComplexityLevel() {
        try {
            const settings = this.qualitySettings[this.currentQualityLevel];
            return settings.complexityLevel;
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleQualityManager.getComplexityLevel'
            });
            return 2; // デフォルト値
        }
    }
    
    /**
     * バッチレンダリングを有効化
     */
    enableBatchRendering() {
        this.optimizationSettings.batchRendering = true;
        console.log('[ParticleQualityManager] バッチレンダリングを有効化しました');
    }
    
    /**
     * アグレッシブカリングを有効化
     */
    enableAggressiveCulling() {
        this.optimizationSettings.aggressiveCulling = true;
        console.log('[ParticleQualityManager] アグレッシブカリングを有効化しました');
    }
    
    /**
     * スムース遷移を有効化
     */
    enableSmoothTransitions() {
        this.optimizationSettings.smoothTransitions = true;
        console.log('[ParticleQualityManager] スムース遷移を有効化しました');
    }
    
    /**
     * 色パレットを設定
     */
    setColorPalettes(paletteName) {
        try {
            if (this.colorPalettes[paletteName]) {
                this.optimizationSettings.colorPalettes = this.colorPalettes[paletteName];
                console.log(`[ParticleQualityManager] 色パレット「${paletteName}」を設定しました`);
            } else {
                console.warn(`[ParticleQualityManager] 未知の色パレット: ${paletteName}`);
                this.optimizationSettings.colorPalettes = this.colorPalettes.default;
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleQualityManager.setColorPalettes'
            });
        }
    }
    
    /**
     * 物理演算強化を設定
     */
    setPhysicsEnhancements(enabled) {
        try {
            this.optimizationSettings.physicsEnhancements = enabled;
            console.log(`[ParticleQualityManager] 物理演算強化: ${enabled ? '有効' : '無効'}`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleQualityManager.setPhysicsEnhancements'
            });
        }
    }
    
    /**
     * 最適化設定を取得
     */
    getOptimizationSettings() {
        return { ...this.optimizationSettings };
    }
    
    /**
     * 品質に基づいてパーティクル効果を決定
     */
    shouldUseAdvancedEffect(effectType) {
        try {
            const complexityLevel = this.getComplexityLevel();
            
            const effectComplexity = {
                'basic': 1,
                'glow': 2,
                'trail': 2,
                'energy': 3,
                'plasma': 4
            };
            
            return complexityLevel >= (effectComplexity[effectType] || 1);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleQualityManager.shouldUseAdvancedEffect'
            });
            return false;
        }
    }
    
    /**
     * フレームレートに基づく動的品質調整
     */
    adjustQualityBasedOnPerformance(currentFPS, targetFPS = 60) {
        try {
            if (currentFPS < targetFPS * 0.8) {
                // パフォーマンスが低下している場合、品質を下げる
                const currentLevels = ['ultra', 'high', 'medium', 'low'];
                const currentIndex = currentLevels.indexOf(this.currentQualityLevel);
                
                if (currentIndex < currentLevels.length - 1) {
                    const newLevel = currentLevels[currentIndex + 1];
                    this.setQualityLevel(newLevel);
                    console.log(`[ParticleQualityManager] パフォーマンス低下により品質を${newLevel}に調整`);
                    return true;
                }
            } else if (currentFPS > targetFPS * 1.1) {
                // パフォーマンスに余裕がある場合、品質を上げる
                const currentLevels = ['low', 'medium', 'high', 'ultra'];
                const currentIndex = currentLevels.indexOf(this.currentQualityLevel);
                
                if (currentIndex > 0) {
                    const newLevel = currentLevels[currentIndex - 1];
                    this.setQualityLevel(newLevel);
                    console.log(`[ParticleQualityManager] パフォーマンス向上により品質を${newLevel}に調整`);
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleQualityManager.adjustQualityBasedOnPerformance'
            });
            return false;
        }
    }
    
    /**
     * カスタム品質設定を登録
     */
    registerCustomQualitySettings(name, settings) {
        try {
            this.qualitySettings[name] = {
                countMultiplier: settings.countMultiplier || 1.0,
                sizeMultiplier: settings.sizeMultiplier || 1.0,
                complexityLevel: settings.complexityLevel || 2
            };
            
            console.log(`[ParticleQualityManager] カスタム品質設定「${name}」を登録しました`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleQualityManager.registerCustomQualitySettings'
            });
        }
    }
}