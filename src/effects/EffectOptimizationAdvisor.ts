/**
 * Effect Optimization Advisor
 * エフェクト最適化アドバイザー - 自動最適化提案と実行
 */

// Type definitions for optimization advisor
interface ProfilingDataInput { frame?: FrameAnalysis,
    memory?: MemoryAnalysis;
    particles?: Record<string, ParticleEffectAnalysis>;
    effects?: Record<string, EffectAnalysis> }

interface FrameAnalysis { averageFPS: number;
    averageRenderTime?: number;

interface MemoryAnalysis { averageMemory: number;
    hasMemoryLeak: boolean;

interface ParticleEffectAnalysis { averageDuration: number;
    rating: PerformanceRating;

interface EffectAnalysis { averageDuration: number;
    rating: PerformanceRating;

type PerformanceRating = 'excellent' | 'good' | 'acceptable' | 'poor';

interface PerformanceIssue { type: IssueType;
    severity: SeverityLevel;
    value?: number;
    description: string;
    effectType?: string;

type IssueType = 'low_fps' | 'high_memory' | 'slow_rendering' | 'poor_particle_performance' | 'memory_leak';
type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

interface AnalysisResult { issues: PerformanceIssue[];
    overallScore: number;
    performanceCategory: PerformanceCategory;

type PerformanceCategory = 'excellent' | 'good' | 'acceptable' | 'poor';

interface OptimizationStrategy { name: string;
    description: string;
    severity: SeverityLevel;
    execute: (intensity: number) => OptimizationResult  }
}

interface OptimizationRecommendation { id: string;
    name: string;
    description: string;
    severity: SeverityLevel;
    context: Record<string, any>;
    estimatedImpact: number;
    canAutoApply: boolean;

interface OptimizationResult { action: string;
    status?: string;
    reason?: string;
    previousValue?: any;
    newValue?: any;
    reductionPercent?: number;
    disabledEffects?: string[];
    skipFrames?: number;
    renderFrequency?: number;
    cullingMargin?: number;
    cleanedItems?: number;
    gcRequested?: boolean;

interface AppliedOptimization { recommendation: OptimizationRecommendation;
    result: OptimizationResult;
    timestamp: number;

interface OptimizationHistoryEntry { timestamp: number;
    recommendation: OptimizationRecommendation;
    result: OptimizationResult;
    beforeStats: any;

interface AdvisorResult { analysis: AnalysisResult;
    recommendations: OptimizationRecommendation[];
    autoApplied: AppliedOptimization[];

// Game engine interface for optimization operations
interface GameEngineInterface { enhancedParticleManager?: {
        particleMultiplie,r?: number;
        setParticleMultiplier?(multiplier: number): void;
        setRenderFrequency?(frequency: number): void;
        setCullingMargin?(margin: number): void;
        forceCleanup?(): number;;
    effectQualityController?: { getCurrentQualityLevel(): string,
        setQualityLevel(level: string): void;
    seasonalEffectManager?: { setEnabled(enabled: boolean): void;
    enhancedEffectManager?: { setScreenEffectsEnabled?(enabled: boolean): void;
        setCullingMargin?(margin: number): void;
        forceCleanup?(): number;;
    performanceOptimizer?: { getStats(): any;

export class EffectOptimizationAdvisor {
    private gameEngine: GameEngineInterface;
    private optimizationHistory: OptimizationHistoryEntry[] = [];
    private performanceBaseline: any = null;
    private, optimizationStrategies: Map<string, OptimizationStrategy> = new Map();

    constructor(gameEngine: GameEngineInterface) {

        this.gameEngine = gameEngine

     }
        this.initializeStrategies(); }
    }

    private initializeStrategies('''
        this.optimizationStrategies.set('reduce_particle_count', { ''
            name: 'パーティクル数削減',','
            description: 'パーティクル数を段階的に削減してパフォーマンスを向上',')',
            severity: 'medium',
            execute: (intensity: number) => this.reduceParticleCount(intensity),'
            }'

        }');'

        this.optimizationStrategies.set('lower_quality_settings', { ''
            name: '品質設定低下',','
            description: 'エフェクト品質を自動的に低下させる',')',
            severity: 'high',
            execute: (intensity: number) => this.lowerQualitySettings(intensity),'
            }'

        }');'

        this.optimizationStrategies.set('disable_complex_effects', { ''
            name: '複雑エフェクト無効化',','
            description: '計算負荷の高いエフェクトを一時的に無効化',')',
            severity: 'high',
            execute: (intensity: number) => this.disableComplexEffects(intensity),'
            }'

        }');'

        this.optimizationStrategies.set('optimize_render_frequency', { ''
            name: 'レンダリング頻度最適化',','
            description: 'エフェクトのレンダリング頻度を調整',')',
            severity: 'low',
            execute: (intensity: number) => this.optimizeRenderFrequency(intensity),'
            }'

        }');'

        this.optimizationStrategies.set('enable_culling', { ''
            name: 'カリング有効化',','
            description: '画面外エフェクトのカリングを強化',')',
            severity: 'low',
            execute: (intensity: number) => this.enableAggressiveCulling(intensity),'
            }'

        }');'

        this.optimizationStrategies.set('cleanup_memory', { ''
            name: 'メモリクリーンアップ',','
            description: '不要なエフェクトリソースをクリーンアップ',')',
            severity: 'medium',
    execute: (intensity: number) => this.cleanupMemory(intensity)  }
        });
    }

    analyzeAndOptimize(profilingData: ProfilingDataInput): AdvisorResult { const analysis = this.analyzePerformanceIssues(profilingData);
        const recommendations = this.generateOptimizationPlan(analysis);
        return { analysis,
            recommendations };
            autoApplied: this.autoApplyOptimizations(recommendations); 
    }

    private analyzePerformanceIssues(profilingData: ProfilingDataInput): AnalysisResult { const issues: PerformanceIssue[] = [] }
        const { frame, memory, particles, effects } = profilingData;
';'
        // FPS問題の分析
        if (frame && frame.averageFPS < 30) {
            issues.push({''
                type: 'low_fps',','
                severity: frame.averageFPS < 15 ? 'critical' : 'high', 
                value: frame.averageFPS) }
                description: `平均FPSが低い (${frame.averageFPS.toFixed(1})`
            };
        }
';'
        // メモリ問題の分析
        if (memory && memory.averageMemory > 200) {
            issues.push({''
                type: 'high_memory',','
                severity: memory.averageMemory > 500 ? 'critical' : 'high', 
                value: memory.averageMemory) }
                description: `メモリ使用量が高い (${memory.averageMemory.toFixed(1}MB)`
            };
        }
';'
        // レンダリング時間の分析
        if (frame && frame.averageRenderTime && frame.averageRenderTime > 33) {
            issues.push({''
                type: 'slow_rendering',','
                severity: frame.averageRenderTime > 50 ? 'high' : 'medium', 
                value: frame.averageRenderTime) }
                description: `レンダリング時間が長い (${frame.averageRenderTime.toFixed(2}ms)`
            };
        }

        // パーティクル性能の分析
        if (particles) { for(const [effectType, metrics] of Object.entries(particles)) {''
                if (metrics.rating === 'poor') {
                    issues.push({''
                        type: 'poor_particle_performance',
                        severity: 'medium,'
    value: metrics.averageDuration  }
                        effectType) }
                        description: `${effectType}パーティクルの性能が悪い`,
                }
}
';'
        // メモリリークの検出
        if (memory && memory.hasMemoryLeak) {
            issues.push({''
                type: 'memory_leak',','
                severity: 'critical',' }'

                description: 'メモリリークが検出されました'); 
    }

        return { issues,
            overallScore: this.calculateOverallScore(issues) },
            performanceCategory: this.categorizePerformance(frame?.averageFPS || 0); 
    }
 : undefined
    private generateOptimizationPlan(analysis: AnalysisResult): OptimizationRecommendation[] { const recommendations: OptimizationRecommendation[] = [],
        
        for (const issue of analysis.issues) {
        
            const strategies = this.getStrategiesForIssue(issue, recommendations.push(...strategies) }

        // 重複排除と優先度ソート
        const uniqueRecommendations = this.deduplicateRecommendations(recommendations);
        return this.prioritizeRecommendations(uniqueRecommendations);
    }

    private getStrategiesForIssue(issue: PerformanceIssue): OptimizationRecommendation[] { const strategies: OptimizationRecommendation[] = [],

        switch(issue.type) {

            case 'low_fps':','
                strategies.push()','
                    this.createRecommendation('reduce_particle_count', issue.severity','
                    this.createRecommendation('lower_quality_settings', issue.severity','
                    this.createRecommendation('enable_culling', 'medium'','
                '),'
                if (issue.severity === 'critical') {
        }

                    strategies.push(this.createRecommendation('disable_complex_effects', 'high)'; }
                }
                break;

            case 'high_memory':';'
                strategies.push()';'
                    this.createRecommendation('cleanup_memory', issue.severity','
                    this.createRecommendation('reduce_particle_count', 'medium'';'
                ');'

                break;

            case 'slow_rendering':';'
                strategies.push()';'
                    this.createRecommendation('optimize_render_frequency', issue.severity','
                    this.createRecommendation('enable_culling', 'medium'';'
                ');'

                break;

            case 'poor_particle_performance':';'
                strategies.push()';'
                    this.createRecommendation('reduce_particle_count', 'medium', { effectType: issue.effectType '', '),'

                break,

            case 'memory_leak':','
                strategies.push()','
                    this.createRecommendation('cleanup_memory', 'critical),'
                break }

        return strategies;
    }

    private createRecommendation(strategyId: string, severity: SeverityLevel, context: Record<string, any> = { ): OptimizationRecommendation {
        const strategy = this.optimizationStrategies.get(strategyId)!,
        return { id: strategyId,
            name: strategy.name,
    description: strategy.description,
            severity,
            context,
            estimatedImpact: this.estimateImpact(strategyId, severity) };
            canAutoApply: this.canAutoApply(strategyId, severity); }
        }

    private deduplicateRecommendations(recommendations: OptimizationRecommendation[]): OptimizationRecommendation[] { const unique = new Map<string, OptimizationRecommendation>(),
        
        for (const rec of recommendations) { }
            const key = `${rec.id}_${JSON.stringify(rec.context}`;
            if (!unique.has(key) || this.compareSeverity(unique.get(key)!.severity, rec.severity) < 0) { unique.set(key, rec) }
        }
        
        return Array.from(unique.values();
    }

    private prioritizeRecommendations(recommendations: OptimizationRecommendation[]): OptimizationRecommendation[] {
        const severityOrder: Record<SeverityLevel, number> = { critical: 4, high: 3, medium: 2, low: 1  }
        return recommendations.sort((a, b) => {  const severityDiff = severityOrder[b.severity] - severityOrder[a.severity],
            if (severityDiff !== 0) return severityDiff }
            return b.estimatedImpact - a.estimatedImpact;);
    }

    private autoApplyOptimizations(recommendations: OptimizationRecommendation[]): AppliedOptimization[] { const applied: AppliedOptimization[] = [],

        for (const rec of recommendations) {

            if(rec.canAutoApply && rec.severity !== 'critical' {'
                try {
                    const strategy = this.optimizationStrategies.get(rec.id)!,
                    const result = strategy.execute(this.calculateIntensity(rec.severity);
                    applied.push({)
                        recommendation: rec),
                        result }
                        timestamp: Date.now(); 
    };
                    
                    this.logOptimization(rec, result);
                } catch (error) {
                    console.error(`Failed to apply optimization ${rec.id}:`, error);
                }
}
        
        return applied;
    }

    // 最適化戦略の実装
    private reduceParticleCount(intensity: number): OptimizationResult { const reduction = 0.1 + (intensity * 0.3), // 10%-40%削減
        
        if (this.gameEngine.enhancedParticleManager) {
        
            const currentMultiplier = this.gameEngine.enhancedParticleManager.particleMultiplier || 1.0,
            const newMultiplier = Math.max(0.1, currentMultiplier * (1 - reduction);
            ','

            if (this.gameEngine.enhancedParticleManager.setParticleMultiplier) {
    
}

                this.gameEngine.enhancedParticleManager.setParticleMultiplier(newMultiplier); }
            }
            ';'

            return { ''
                action: 'パーティクル数削減',
                previousValue: currentMultiplier,
    newValue: newMultiplier,
                reductionPercent: reduction * 100 
    }

        return { action: 'パーティクル数削減', status: 'failed', reason: 'ParticleManager not available'
            }

    private lowerQualitySettings(intensity: number): OptimizationResult { ''
        const qualityLevels = ['ultra', 'high', 'medium', 'low'],
        const currentQuality = this.gameEngine.effectQualityController?.getCurrentQualityLevel() || 'high',
        const currentIndex = qualityLevels.indexOf(currentQuality);
        const stepsDown = Math.ceil(intensity * 2) + 1,
        const newIndex = Math.min(qualityLevels.length - 1, currentIndex + stepsDown);
        const newQuality = qualityLevels[newIndex],
        
        if (this.gameEngine.effectQualityController && newQuality !== currentQuality) {
        ','

            this.gameEngine.effectQualityController.setQualityLevel(newQuality);
            ','

            return { : undefined''
                action: '品質設定低下' 
               , previousValue: currentQuality,
                newValue: newQuality,
                newValue: newQuality,
        };
        return { action: '品質設定低下', status: 'no_change'
            }

    private disableComplexEffects(intensity: number): OptimizationResult { const effects: string[] = [],
        
        if (intensity > 0.5 && this.gameEngine.seasonalEffectManager) {
        ','

            this.gameEngine.seasonalEffectManager.setEnabled(false) }

            effects.push('seasonal'; }'
        }
        
        if (intensity > 0.7 && this.gameEngine.enhancedEffectManager?.setScreenEffectsEnabled) {
        ','

            this.gameEngine.enhancedEffectManager.setScreenEffectsEnabled(false) }

            effects.push('screen_effects'); }
        }
        ';'

        return { : undefined''
            action: '複雑エフェクト無効化'
            };
            disabledEffects: effects,

    private optimizeRenderFrequency(intensity: number): OptimizationResult { // レンダリング頻度の調整（フレームスキッピング）
        const skipFrames = Math.floor(intensity * 3), // 0-3フレームスキップ
        
        if (this.gameEngine.enhancedParticleManager?.setRenderFrequency) {
        ','

            ' }'

            this.gameEngine.enhancedParticleManager.setRenderFrequency(1 / (skipFrames + 1)); }
        }
        ';'

        return { : undefined''
            action: 'レンダリング頻度最適化',
            skipFrames };
            renderFrequency: 1 / (skipFrames + 1); 
    }

    private enableAggressiveCulling(intensity: number): OptimizationResult { const cullingMargin = 50 - (intensity * 30), // より厳しいカリング
        
        if (this.gameEngine.enhancedParticleManager?.setCullingMargin) {
    
}
            this.gameEngine.enhancedParticleManager.setCullingMargin(cullingMargin); }
        }
        
        if (this.gameEngine.enhancedEffectManager?.setCullingMargin) {
        ','

            ' }'

            this.gameEngine.enhancedEffectManager.setCullingMargin(cullingMargin); }
        }
        ';'

        return { : undefined''
            action: 'カリング有効化'
            };
            cullingMargin }
        }

    private cleanupMemory(intensity: number): OptimizationResult { let cleanedItems = 0,
        
        // パーティクルクリーンアップ
        if (this.gameEngine.enhancedParticleManager?.forceCleanup) {
            const cleaned = this.gameEngine.enhancedParticleManager.forceCleanup() }
            cleanedItems += cleaned || 0; }
        }
        
        // エフェクトクリーンアップ
        if (this.gameEngine.enhancedEffectManager?.forceCleanup) {
            const cleaned = this.gameEngine.enhancedEffectManager.forceCleanup() }
            cleanedItems += cleaned || 0; }
        }
        
        // ガベージコレクション要求
        if (intensity > 0.7 && (window, as any).gc) { ''
            (window, as any).gc('''
            action: 'メモリクリーンアップ',
            cleanedItems,
            gcRequested: intensity > 0.7  })
    }

    // ユーティリティメソッド)
    private calculateIntensity(severity: SeverityLevel): number { ''
        switch(severity) {

            case 'critical': return 1.0,
            case 'high': return 0.7,
            case 'medium': return 0.4,
            case 'low': return 0.2 }
            default: return 0.5,

    private estimateImpact(strategyId: string, severity: SeverityLevel): number { const baseImpacts: Record<string, number> = {
            reduce_particle_count: 30,
            lower_quality_settings: 25,
            disable_complex_effects: 40,
            optimize_render_frequency: 15,
            enable_culling: 10,
    cleanup_memory: 20  },
        const severityMultiplier: Record<SeverityLevel, number> = { critical: 1.5,
            high: 1.2,
            medium: 1.0,
    low: 0.8  },
        return (baseImpacts[strategyId] || 10) * (severityMultiplier[severity] || 1.0);
    }

    private canAutoApply(strategyId: string, severity: SeverityLevel): boolean { // 重要度が高すぎる場合は自動適用しない
        if (severity === 'critical') return false,
        ','

        const autoApplicable = [','
            'reduce_particle_count',
            'optimize_render_frequency',
            'enable_culling',]','
            'cleanup_memory'],
        ],
        
        return autoApplicable.includes(strategyId) }

    private calculateOverallScore(issues: PerformanceIssue[]): number { let score = 100,
        
        for (const issue of issues) {
        ','

            switch(issue.severity) {''
                case 'critical': score -= 30, break,
                case 'high': score -= 20, break,
                case 'medium': score -= 10, break }

                case 'low': score -= 5; break; 
    }
        
        return Math.max(0, score);
    }
';'

    private categorizePerformance(fps: number): PerformanceCategory { ''
        if(fps >= 55) return 'excellent',
        if(fps >= 40) return 'good',
        if(fps >= 25) return 'acceptable',
        return 'poor' }

    private compareSeverity(a: SeverityLevel, b: SeverityLevel): number {
        const severityOrder: Record<SeverityLevel, number> = { critical: 4, high: 3, medium: 2, low: 1  }
        return severityOrder[a] - severityOrder[b];
    }

    private logOptimization(recommendation: OptimizationRecommendation, result: OptimizationResult): void { const logEntry: OptimizationHistoryEntry = {
            timestamp: Date.now();
            recommendation,
            result }
            beforeStats: this.gameEngine.performanceOptimizer?.getStats() || {},
        this.optimizationHistory.push(logEntry);
        
        // 履歴サイズ制限
        if (this.optimizationHistory.length > 100) {

            this.optimizationHistory.shift() }

        console.log('Applied optimization:', logEntry); }
    }

    getOptimizationHistory(): OptimizationHistoryEntry[] { return this.optimizationHistory }
';'

    revertLastOptimization(): { success: boolean, reason?: string, reverted?: string; { ''
        if (this.optimizationHistory.length === 0) { }'

            return { success: false, reason: 'No optimizations to revert'
            }
        
        const lastOptimization = this.optimizationHistory.pop()!;
        // リバート実装は複雑なため、ここでは基本的な復元のみ
        
        return { success: true,
            reverted: lastOptimization.recommendation.name 
    }
}
;
// グローバルアクセス用（デバッグ目的）
(window, as any').EffectOptimizationAdvisor = EffectOptimizationAdvisor;'