import { getErrorHandler } from '../utils/ErrorHandler.js';

// Type definitions for quality scaling and performance optimization
interface ParticleManager { setQualityLevel(quality: string): void,
    maxParticles: number,
    particles: Particle[],
    backgroundEnabled: boolean,
    backgroundParticles: Particle[],
    returnParticleToPool(particle: Particle): void, }
}

interface Particle { type: string,
    life: number,
    maxLife: number,
    size: number; }
}
';
interface PerformanceMonitor { ''
    getCurrentMetrics(''';
type QualityLevelName = 'potato' | 'low' | 'medium' | 'high' | 'ultra' | 'insane';

/**
 * パーティクル品質スケーリングシステム
 * デバイス性能に応じてパーティクル効果の品質を動的に調整
 */
export class QualityScalingSystem {
    private particleManager: ParticleManager;
    private performanceMonitor: PerformanceMonitor | null;
    private qualityLevels: QualityLevels;
    private currentQuality: string;
    private autoAdjustEnabled: boolean;
    private performanceThresholds: PerformanceThresholds;
    private adjustmentHistory: AdjustmentRecord[];
    private lastAdjustmentTime: number;
    private adjustmentCooldown: number;
    private fallbackEffects: FallbackEffects';
')';
    constructor(particleManager: ParticleManager, performanceMonitor: PerformanceMonitor | null = null') {
        this.particleManager = particleManager;
        this.performanceMonitor = performanceMonitor;
        
        // 品質レベル定義'
        this.qualityLevels = {''
            'potato': {''
                name: 'ポテト',
                countMultiplier: 0.1,
                sizeMultiplier: 0.6,';
                complexityLevel: 0,'';
                enabledEffects: ['circle'],'';
                disabledFeatures: ['trail', 'glow', 'background', 'lighting'],';
                maxParticles: 50,';
    }
    }'
                description: '最低品質 - 古い端末向け' }'
            },''
            'low': { ''
                name: '低',
                countMultiplier: 0.25,
                sizeMultiplier: 0.8,';
                complexityLevel: 1,'';
                enabledEffects: ['circle', 'star', 'diamond'],'';
                disabledFeatures: ['trail', 'glow', 'background'],';
                maxParticles: 150,'';
                description: '低品質 - 軽量モード' }'
            },''
            'medium': { ''
                name: '中',
                countMultiplier: 0.5,
                sizeMultiplier: 0.9,';
                complexityLevel: 2,'';
                enabledEffects: ['circle', 'star', 'diamond', 'advanced_circle', 'hexagon'],'';
                disabledFeatures: ['background'],';
                maxParticles: 300,'';
                description: '中品質 - バランス重視' }'
            },''
            'high': { ''
                name: '高',
                countMultiplier: 1.0,
                sizeMultiplier: 1.0,';
                complexityLevel: 3,'';
                enabledEffects: ['*'],
                disabledFeatures: [],';
                maxParticles: 500,'';
                description: '高品質 - 標準設定' }'
            },''
            'ultra': { ''
                name: '最高',
                countMultiplier: 1.5,
                sizeMultiplier: 1.2,';
                complexityLevel: 4,'';
                enabledEffects: ['*'],
                disabledFeatures: [],';
                maxParticles: 800,'';
                description: '最高品質 - ハイエンド向け' }'
            },''
            'insane': { ''
                name: '狂気',
                countMultiplier: 2.0,
                sizeMultiplier: 1.5,';
                complexityLevel: 5,'';
                enabledEffects: ['*'],
                disabledFeatures: [],';
                maxParticles: 1200,'';
                description: '狂気品質 - 実験的設定' }
            }
        },
        ';
        // 現在の品質レベル''
        this.currentQuality = 'high';
        
        // 自動調整設定
        this.autoAdjustEnabled = true;
        this.performanceThresholds = { targetFPS: 60,
            minFPS: 30,
            criticalFPS: 15,
            memoryThreshold: 50 * 1024 * 1024, // 50MB;
            particleCountThreshold: 300 }
        },
        
        // 調整履歴
        this.adjustmentHistory = [];
        this.lastAdjustmentTime = 0;
        this.adjustmentCooldown = 2000; // 2秒
        
        // フォールバック効果定義'
        this.fallbackEffects = { ''
            'glow_circle': 'advanced_circle','';
            'advanced_circle': 'circle','';
            'trail_particle': 'circle','';
            'energy_orb': 'glow_circle','';
            'magic_sparkle': 'star','';
            'plasma_burst': 'explosion','';
            'hexagon': 'circle','';
            'triangle': 'circle','';
            'cross': 'circle' }
        };'
        '';
        console.log('[QualityScalingSystem] 初期化完了 - 品質レベル:', this.currentQuality);
    }
    
    /**
     * 品質レベルを設定
     * @param quality - 品質レベル
     * @param force - 強制設定
     */
    public setQualityLevel(quality: string, force: boolean = false): boolean { if (!this.qualityLevels[quality]) { }
            console.warn(`[QualityScalingSystem] 不正な品質レベル: ${quality)`});
            return false;
        }
        
        const oldQuality = this.currentQuality;
        this.currentQuality = quality;
        
        // パーティクルマネージャーに品質設定を適用
        if(this.particleManager) {'
            this.particleManager.setQualityLevel(quality);''
            this.applyQualitySettings('')';
        this.recordAdjustment(oldQuality, quality, force ? 'manual' : 'auto');
        }
         }
        console.log(`[QualityScalingSystem] 品質レベル変更: ${oldQuality} → ${quality)`});
        return true;
    }
    
    /**
     * 品質設定を適用
     */
    private applyQualitySettings(): void { const settings = this.qualityLevels[this.currentQuality];
        
        // パーティクル数制限
        if(this.particleManager.maxParticles !== settings.maxParticles) {
            
        }
            this.particleManager.maxParticles = settings.maxParticles; }
        }
        
        // 現在のパーティクル数が制限を超えている場合は削減
        if(this.particleManager.particles.length > settings.maxParticles) {'
            const excessCount = this.particleManager.particles.length - settings.maxParticles;'
        }'
            this.removeExcessParticles(excessCount'); }
        }
        ';
        // 背景パーティクルの調整''
        if(settings.disabledFeatures.includes('background') {
            this.particleManager.backgroundEnabled = false;
        }
            this.particleManager.backgroundParticles = []; }
        }
    }
    
    /**
     * 余剰パーティクルを削除
     * @param count - 削除する数
     */
    private removeExcessParticles(count: number): void { // 優先度の低いパーティクルから削除
        const sortedParticles = this.particleManager.particles.sort((a, b) => { 
            const priorityA = this.getParticlePriority(a);
            const priorityB = this.getParticlePriority(b); }
            return priorityA - priorityB; }
        });
        
        for(let i = 0; i < count && sortedParticles.length > 0; i++) {
        
            const particle = sortedParticles.shift();
            if (particle) {
        
        }
                this.particleManager.returnParticleToPool(particle); }
            }
        }
        
        this.particleManager.particles = sortedParticles;
    }
    
    /**
     * パーティクルの優先度を取得
     * @param particle - パーティクル
     * @returns 優先度 (低いほど削除されやすい)'
     */''
    private getParticlePriority(particle: Particle'): number { const typePriorities: Record<string, number> = {''
            'background': 1,'';
            'circle': 2,'';
            'advanced_circle': 3,'';
            'star': 4,'';
            'diamond': 5,'';
            'glow_circle': 6,'';
            'trail_particle': 7,'';
            'energy_orb': 8,'';
            'magic_sparkle': 9,'';
            'plasma_burst': 10 }
        };
        
        const typePriority = typePriorities[particle.type] || 5;
        const agePriority = (particle.maxLife - particle.life) / particle.maxLife * 3; // 古いパーティクルほど優先度低
        const sizePriority = particle.size / 10; // 小さいパーティクルほど優先度低
        
        return typePriority + agePriority + sizePriority;
    }
    
    /**
     * パフォーマンスに基づく自動品質調整
     * @param performanceData - パフォーマンスデータ
     */
    public autoAdjustQuality(performanceData: PerformanceData): void { if (!this.autoAdjustEnabled) return;
        
        const now = Date.now();
        if (now - this.lastAdjustmentTime < this.adjustmentCooldown) return;
        
        try { }
            const { fps, memoryUsage, particleCount } = performanceData;
            const currentSettings = this.qualityLevels[this.currentQuality];
            
            // パフォーマンス評価
            let adjustmentDirection = 0; // -1: 下げる, 0: 維持, 1: 上げる
            
            // FPS評価
            if (fps < this.performanceThresholds.criticalFPS) { adjustmentDirection = -2; // 大幅に下げる }
            } else if (fps < this.performanceThresholds.minFPS) { adjustmentDirection = -1; // 下げる }
            } else if (fps > this.performanceThresholds.targetFPS + 10) { adjustmentDirection = 1; // 上げる }
            }
            
            // メモリ使用量評価
            if (memoryUsage > this.performanceThresholds.memoryThreshold) { adjustmentDirection = Math.min(adjustmentDirection - 1, -1); }
            }
            
            // パーティクル数評価
            if (particleCount > this.performanceThresholds.particleCountThreshold) { adjustmentDirection = Math.min(adjustmentDirection - 1, -1); }
            }
            
            // 品質レベル調整
            this.adjustQualityLevel(adjustmentDirection);
            this.lastAdjustmentTime = now;
            ';
        } catch (error) { ''
            getErrorHandler('')';
                context: 'QualityScalingSystem.autoAdjustQuality'); }
            });
        }
    }
    
    /**
     * 品質レベルを調整
     * @param direction - 調整方向 (-2, -1, 0, 1, 2)
     */'
    private adjustQualityLevel(direction: number): void { ''
        if (direction === 0') return;'
        '';
        const qualityOrder: QualityLevelName[] = ['potato', 'low', 'medium', 'high', 'ultra', 'insane'];
        const currentIndex = qualityOrder.indexOf(this.currentQuality as QualityLevelName);
        
        let newIndex = currentIndex + direction;
        newIndex = Math.max(0, Math.min(qualityOrder.length - 1, newIndex);
        
        if(newIndex !== currentIndex) {
        
            const newQuality = qualityOrder[newIndex];
        
        }
            this.setQualityLevel(newQuality); }
        }
    }
    
    /**
     * 効果がサポートされているかチェック
     * @param effectType - 効果タイプ
     * @returns サポート状況
     */
    public isEffectSupported(effectType: string): boolean { const settings = this.qualityLevels[this.currentQuality];
        ';
        // 無効化された機能をチェック''
        if (settings.disabledFeatures.includes(effectType)') {
            return false; }
        }
        ';
        // 有効な効果をチェック''
        if(settings.enabledEffects.includes('*') { return true; }
        }
        
        return settings.enabledEffects.includes(effectType);
    }
    
    /**
     * フォールバック効果を取得
     * @param originalType - 元の効果タイプ
     * @returns フォールバック効果タイプ
     */
    public getFallbackEffect(originalType: string): string { // サポートされている場合は元のタイプを返す
        if(this.isEffectSupported(originalType) {
            
        }
            return originalType; }
        }
        
        // フォールバック効果を検索
        let fallbackType: string | undefined = this.fallbackEffects[originalType],
        ';
        // フォールバック効果もサポートされていない場合は再帰的に検索''
        while (fallbackType && !this.isEffectSupported(fallbackType)') { fallbackType = this.fallbackEffects[fallbackType]; }
        }
        ';
        // 最終的なフォールバック''
        return fallbackType || 'circle';
    }
    
    /**
     * 調整履歴を記録
     * @param from - 変更前品質
     * @param to - 変更後品質
     * @param reason - 変更理由
     */
    private recordAdjustment(from: string, to: string, reason: string): void { this.adjustmentHistory.push({);
            timestamp: Date.now(),
            from,
            to,
            reason,
            performance: this.performanceMonitor ? this.performanceMonitor.getCurrentMetrics() : null }
        }),
        
        // 履歴サイズ制限
        if (this.adjustmentHistory.length > 50) { this.adjustmentHistory.shift(); }
        }
    }
    
    /**
     * 現在の品質設定を取得
     * @returns 品質設定
     */
    public getCurrentQualitySettings(): CurrentQualitySettings { return { ...this.qualityLevels[this.currentQuality], };
            current: this.currentQuality }
        },
    }
    
    /**
     * パフォーマンス統計を取得
     * @returns パフォーマンス統計
     */
    public getPerformanceStats(): PerformanceStats { const currentSettings = this.qualityLevels[this.currentQuality];
        
        return { currentQuality: this.currentQuality,
            qualityName: currentSettings.name,
            autoAdjustEnabled: this.autoAdjustEnabled,
            countMultiplier: currentSettings.countMultiplier,
            complexityLevel: currentSettings.complexityLevel,
            maxParticles: currentSettings.maxParticles,
            enabledEffects: currentSettings.enabledEffects.length,
            disabledFeatures: currentSettings.disabledFeatures.length,
            adjustmentCount: this.adjustmentHistory.length, };
            lastAdjustment: this.adjustmentHistory[this.adjustmentHistory.length - 1] || null }
        },
    }
    
    /**
     * デバイス性能を評価して推奨品質を取得
     * @returns 推奨品質レベル'
     */''
    public getRecommendedQuality('')';
        const canvas = document.createElement('canvas'');''
        const gl = canvas.getContext('webgl'') || canvas.getContext('experimental-webgl');
        
        let score = 0;
        ';
        // WebGLサポート''
        if(gl') {
            score += 2;
            ';
            // GPU情報''
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');'
            if (debugInfo) {''
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL');''
                if (renderer && (renderer.includes('NVIDIA'') || renderer.includes('AMD')') {
        }
                    score += 2; }
                }
            }
        }
        ';
        // メモリ情報''
        if('deviceMemory' in navigator) {
            const deviceMemory = (navigator as any).deviceMemory;
            if (deviceMemory >= 8) score += 3;
            else if (deviceMemory >= 4) score += 2;
        }
            else if (deviceMemory >= 2) score += 1; }
        }
        
        // CPUコア数
        if(navigator.hardwareConcurrency) {
            if (navigator.hardwareConcurrency >= 8) score += 2;
        }
            else if (navigator.hardwareConcurrency >= 4) score += 1; }
        }
        
        // モバイル検出
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) { score -= 2; }
        }
        ';
        // 品質レベル決定''
        if (score >= 8') return 'ultra';''
        if (score >= 6') return 'high';''
        if (score >= 4') return 'medium';''
        if (score >= 2') return 'low';''
        return 'potato';
    }
    
    /**
     * 自動調整を有効/無効化
     * @param enabled - 有効状態'
     */''
    public setAutoAdjustEnabled(enabled: boolean'): void { this.autoAdjustEnabled = enabled;' }'
        console.log(`[QualityScalingSystem] 自動調整: ${enabled ? '有効' : '無効')`});
    }
    
    /**
     * デバッグ情報を出力'
     */''
    public debugInfo('')';
        console.group('[QualityScalingSystem] デバッグ情報'');''
        console.log('現在の品質:', this.getCurrentQualitySettings()');''
        console.log('パフォーマンス統計:', this.getPerformanceStats()');''
        console.log('推奨品質:', this.getRecommendedQuality()');''
        console.log('調整履歴:', this.adjustmentHistory.slice(-5);''
        console.groupEnd(');