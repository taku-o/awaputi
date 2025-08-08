import { ParticleManager } from './ParticleManager.js';
import { BubbleEffectRenderer } from './renderers/BubbleEffectRenderer.js';
import { ComboEffectRenderer } from './renderers/ComboEffectRenderer.js';
import { SpecialEffectRenderer } from './renderers/SpecialEffectRenderer.js';
import { SeasonalEffectRenderer } from './renderers/SeasonalEffectRenderer.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getEffectQualityController } from './EffectQualityController.js';
import { getEffectPerformanceMonitor } from './EffectPerformanceMonitor.js';

// サブコンポーネントのインポート
import { ParticleRenderingEngine } from './enhanced-particle-manager/ParticleRenderingEngine.js';
import { ParticleQualityManager } from './enhanced-particle-manager/ParticleQualityManager.js';
import { ParticlePhysicsEngine } from './enhanced-particle-manager/ParticlePhysicsEngine.js';

/**
 * 強化されたパーティクル管理クラス (Main Controller Pattern)
 * 既存のParticleManagerを拡張し、より多様で魅力的な視覚効果を実現
 * 
 * Main Controller Pattern適用：
 * - ParticleRenderingEngine: レンダリング処理とパーティクル描画
 * - ParticleQualityManager: 品質制御と最適化設定管理
 * - ParticlePhysicsEngine: 物理演算とアニメーション処理
 * - 既存Renderer群: 泡・コンボ・特殊・季節限定効果
 */
export class EnhancedParticleManager extends ParticleManager {
    constructor() {
        super();
        
        // サブコンポーネントの初期化
        this.renderingEngine = new ParticleRenderingEngine(null, this);
        this.qualityManager = new ParticleQualityManager();
        this.physicsEngine = new ParticlePhysicsEngine();
        
        // 外部依存システム
        this.qualityController = getEffectQualityController();
        this.performanceMonitor = getEffectPerformanceMonitor();
        
        // 既存エフェクトレンダラーの初期化
        this.bubbleRenderer = new BubbleEffectRenderer(this);
        this.comboRenderer = new ComboEffectRenderer(this);
        this.specialRenderer = new SpecialEffectRenderer(this);
        this.seasonalRenderer = new SeasonalEffectRenderer(this);
        
        console.log('[EnhancedParticleManager] Main Controller Pattern初期化完了');
    }
    
    // ========================================
    // 品質管理API - Quality Managerにデリゲート
    // ========================================
    
    setQualityLevel(level) {
        return this.qualityManager.setQualityLevel(level);
    }
    
    getCurrentQualityLevel() {
        return this.qualityManager.getCurrentQualityLevel();
    }
    
    adjustParticleCount(baseCount) {
        return this.qualityManager.adjustParticleCount(baseCount);
    }
    
    adjustParticleSize(baseSize) {
        return this.qualityManager.adjustParticleSize(baseSize);
    }
    
    enableBatchRendering() {
        this.qualityManager.enableBatchRendering();
        this.renderingEngine.enableBatchRendering();
        console.log('[EnhancedParticleManager] バッチレンダリングを有効化しました');
    }
    
    enableAggressiveCulling() {
        this.qualityManager.enableAggressiveCulling();
        console.log('[EnhancedParticleManager] アグレッシブカリングを有効化しました');
    }
    
    setAggressiveCulling(enabled) {
        if (enabled) {
            this.qualityManager.enableAggressiveCulling();
        } else {
            this.qualityManager.disableAggressiveCulling();
        }
        console.log(`[EnhancedParticleManager] アグレッシブカリングを${enabled ? '有効化' : '無効化'}しました`);
    }
    
    setColorPalettes(paletteName) {
        this.qualityManager.setColorPalettes(paletteName);
    }
    
    setPhysicsEnhancements(enabled) {
        this.qualityManager.setPhysicsEnhancements(enabled);
    }
    
    getActiveParticleCount() {
        // ParticleManagerの基本メソッドを使用
        return this.getParticleCount();
    }
    
    enableSmoothTransitions(enabled) {
        this.physicsEngine.enableSmoothTransitions(enabled);
        console.log(`[EnhancedParticleManager] スムーズトランジションを${enabled ? '有効化' : '無効化'}しました`);
    }
    
    // ========================================
    // 物理演算API - Physics Engineにデリゲート
    // ========================================
    
    enableBackground(enabled, density = 0.1, theme = 'default') {
        this.physicsEngine.enableBackground(enabled, density, theme);
    }
    
    setBackgroundDensity(density) {
        this.physicsEngine.enableBackground(true, density, this.physicsEngine.backgroundTheme);
    }
    
    setBackgroundTheme(theme) {
        this.physicsEngine.enableBackground(true, this.physicsEngine.backgroundDensity, theme);
    }
    
    addMagneticField(x, y, strength, radius) {
        this.physicsEngine.addMagneticField(x, y, strength, radius);
    }
    
    setWindForce(x, y) {
        this.physicsEngine.setWindForce(x, y);
    }
    
    // ========================================
    // レンダリングAPI - Rendering Engineにデリゲート
    // ========================================
    
    renderParticle(context, particle) {
        this.renderingEngine.renderParticle(context, particle);
    }
    
    renderTrailParticle(context, particle) {
        this.renderingEngine.renderTrailParticle(context, particle);
    }
    
    // ========================================
    // 統合レンダリング - Base class + サブコンポーネント
    // ========================================
    
    render(context, deltaTime) {
        try {
            // 基底クラスのレンダリング
            super.render(context, deltaTime);
            
            // 背景パーティクルの更新と描画
            this._renderBackgroundParticles(context, deltaTime);
            
            // パフォーマンス監視
            this._monitorPerformance();
            
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EnhancedParticleManager.render'
            });
        }
    }
    
    /**
     * 背景パーティクルのレンダリング
     */
    _renderBackgroundParticles(context, deltaTime) {
        try {
            if (!this.physicsEngine.backgroundEnabled) return;
            
            // 背景パーティクルの更新
            this.physicsEngine.updateBackgroundParticles(deltaTime, context.canvas.width, context.canvas.height);
            
            // 背景パーティクルの描画
            const backgroundParticles = this.physicsEngine.getBackgroundParticles();
            backgroundParticles.forEach(particle => {
                this.renderingEngine.renderParticle(context, particle);
            });
            
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EnhancedParticleManager._renderBackgroundParticles'
            });
        }
    }
    
    /**
     * パフォーマンス監視
     */
    _monitorPerformance() {
        try {
            // フレームレートに基づく品質自動調整
            const currentFPS = this.performanceMonitor ? this.performanceMonitor.getCurrentFPS() : 60;
            this.qualityManager.adjustQualityBasedOnPerformance(currentFPS);
            
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EnhancedParticleManager._monitorPerformance'
            });
        }
    }
    
    // ========================================
    // パーティクル生成API（既存メソッドの拡張）
    // ========================================
    
    createParticle(x, y, vx, vy, options = {}) {
        try {
            // 品質に基づいたパーティクル調整
            const adjustedSize = this.qualityManager.adjustParticleSize(options.size || 2);
            const adjustedOptions = { ...options, size: adjustedSize };
            
            // 基底クラスのcreateParticleメソッドを呼び出し
            const particle = super.createParticle ? 
                super.createParticle(x, y, vx, vy, adjustedOptions) :
                this._createEnhancedParticle(x, y, vx, vy, adjustedOptions);
                
            return particle;
            
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EnhancedParticleManager.createParticle'
            });
            return null;
        }
    }
    
    /**
     * 拡張パーティクル生成（フォールバック）
     */
    _createEnhancedParticle(x, y, vx, vy, options) {
        const particle = {
            x, y, vx, vy,
            size: options.size || 2,
            color: options.color || '#ffffff',
            alpha: options.alpha || 1.0,
            life: options.life || 1000,
            maxLife: options.life || 1000,
            type: options.type || 'basic',
            active: true,
            gravityAffected: options.gravityAffected !== false,
            hasTrail: options.hasTrail || false,
            rotation: options.rotation || 0,
            rotationSpeed: options.rotationSpeed || 0,
            mass: options.mass || 1
        };
        
        // パーティクル配列に追加（基底クラスのparticles配列があれば使用）
        if (this.particles) {
            this.particles.push(particle);
        }
        
        return particle;
    }
    
    // ========================================
    // Issue #106対応: テスト互換性メソッド
    // ========================================
    
    clearAllParticles() {
        // 基底クラスのクリア
        if (super.clearAllParticles) {
            super.clearAllParticles();
        }
        
        // 背景パーティクルもクリア
        this.physicsEngine.backgroundParticles = [];
        
        console.log('[EnhancedParticleManager] 全パーティクルをクリアしました');
    }
    
    // ========================================
    // ユーティリティAPI
    // ========================================
    
    getCurrentSettings() {
        return {
            qualityLevel: this.qualityManager.getCurrentQualityLevel(),
            qualitySettings: this.qualityManager.getCurrentQualitySettings(),
            optimizationSettings: this.qualityManager.getOptimizationSettings(),
            backgroundEnabled: this.physicsEngine.backgroundEnabled,
            backgroundDensity: this.physicsEngine.backgroundDensity,
            backgroundTheme: this.physicsEngine.backgroundTheme
        };
    }
    
    getPerformanceMetrics() {
        const backgroundCount = this.physicsEngine.backgroundParticles.length;
        const totalParticles = (this.particles ? this.particles.length : 0) + backgroundCount;
        
        return {
            totalParticles,
            backgroundParticles: backgroundCount,
            currentQuality: this.qualityManager.getCurrentQualityLevel(),
            complexityLevel: this.qualityManager.getComplexityLevel()
        };
    }
}