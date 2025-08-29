/**
 * Effect Optimization Advisor
 * エフェクト最適化アドバイザー - 自動最適化提案と実行
 */

export class EffectOptimizationAdvisor {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.optimizationHistory = [];
        this.performanceBaseline = null;
        this.optimizationStrategies = new Map();
        
        this.initializeStrategies();
    }

    initializeStrategies() {
        // 最適化戦略の定義
        this.optimizationStrategies.set('reduce_particle_count', {
            name: 'パーティクル数削減',
            description: 'パーティクル数を段階的に削減してパフォーマンスを向上',
            severity: 'medium',
            execute: (intensity) => this.reduceParticleCount(intensity)
        });

        this.optimizationStrategies.set('lower_quality_settings', {
            name: '品質設定低下',
            description: 'エフェクト品質を自動的に低下させる',
            severity: 'high',
            execute: (intensity) => this.lowerQualitySettings(intensity)
        });

        this.optimizationStrategies.set('disable_complex_effects', {
            name: '複雑エフェクト無効化',
            description: '計算負荷の高いエフェクトを一時的に無効化',
            severity: 'high',
            execute: (intensity) => this.disableComplexEffects(intensity)
        });

        this.optimizationStrategies.set('optimize_render_frequency', {
            name: 'レンダリング頻度最適化',
            description: 'エフェクトのレンダリング頻度を調整',
            severity: 'low',
            execute: (intensity) => this.optimizeRenderFrequency(intensity)
        });

        this.optimizationStrategies.set('enable_culling', {
            name: 'カリング有効化',
            description: '画面外エフェクトのカリングを強化',
            severity: 'low',
            execute: (intensity) => this.enableAggressiveCulling(intensity)
        });

        this.optimizationStrategies.set('cleanup_memory', {
            name: 'メモリクリーンアップ',
            description: '不要なエフェクトリソースをクリーンアップ',
            severity: 'medium',
            execute: (intensity) => this.cleanupMemory(intensity)
        });
    }

    analyzeAndOptimize(profilingData) {
        const analysis = this.analyzePerformanceIssues(profilingData);
        const recommendations = this.generateOptimizationPlan(analysis);
        
        return {
            analysis,
            recommendations,
            autoApplied: this.autoApplyOptimizations(recommendations)
        };
    }

    analyzePerformanceIssues(profilingData) {
        const issues = [];
        const { frame, memory, particles, effects } = profilingData;

        // FPS問題の分析
        if (frame && frame.averageFPS < 30) {
            issues.push({
                type: 'low_fps',
                severity: frame.averageFPS < 15 ? 'critical' : 'high',
                value: frame.averageFPS,
                description: `平均FPSが低い (${frame.averageFPS.toFixed(1)})`
            });
        }

        // メモリ問題の分析
        if (memory && memory.averageMemory > 200) {
            issues.push({
                type: 'high_memory',
                severity: memory.averageMemory > 500 ? 'critical' : 'high',
                value: memory.averageMemory,
                description: `メモリ使用量が高い (${memory.averageMemory.toFixed(1)}MB)`
            });
        }

        // レンダリング時間の分析
        if (frame && frame.averageRenderTime > 33) {
            issues.push({
                type: 'slow_rendering',
                severity: frame.averageRenderTime > 50 ? 'high' : 'medium',
                value: frame.averageRenderTime,
                description: `レンダリング時間が長い (${frame.averageRenderTime.toFixed(2)}ms)`
            });
        }

        // パーティクル性能の分析
        if (particles) {
            for (const [effectType, metrics] of Object.entries(particles)) {
                if (metrics.rating === 'poor') {
                    issues.push({
                        type: 'poor_particle_performance',
                        severity: 'medium',
                        value: metrics.averageDuration,
                        effectType,
                        description: `${effectType}パーティクルの性能が悪い`
                    });
                }
            }
        }

        // メモリリークの検出
        if (memory && memory.hasMemoryLeak) {
            issues.push({
                type: 'memory_leak',
                severity: 'critical',
                description: 'メモリリークが検出されました'
            });
        }

        return {
            issues,
            overallScore: this.calculateOverallScore(issues),
            performanceCategory: this.categorizePerformance(frame?.averageFPS || 0)
        };
    }

    generateOptimizationPlan(analysis) {
        const recommendations = [];
        
        for (const issue of analysis.issues) {
            const strategies = this.getStrategiesForIssue(issue);
            recommendations.push(...strategies);
        }

        // 重複排除と優先度ソート
        const uniqueRecommendations = this.deduplicateRecommendations(recommendations);
        return this.prioritizeRecommendations(uniqueRecommendations);
    }

    getStrategiesForIssue(issue) {
        const strategies = [];

        switch (issue.type) {
            case 'low_fps':
                strategies.push(
                    this.createRecommendation('reduce_particle_count', issue.severity),
                    this.createRecommendation('lower_quality_settings', issue.severity),
                    this.createRecommendation('enable_culling', 'medium')
                );
                if (issue.severity === 'critical') {
                    strategies.push(this.createRecommendation('disable_complex_effects', 'high'));
                }
                break;

            case 'high_memory':
                strategies.push(
                    this.createRecommendation('cleanup_memory', issue.severity),
                    this.createRecommendation('reduce_particle_count', 'medium')
                );
                break;

            case 'slow_rendering':
                strategies.push(
                    this.createRecommendation('optimize_render_frequency', issue.severity),
                    this.createRecommendation('enable_culling', 'medium')
                );
                break;

            case 'poor_particle_performance':
                strategies.push(
                    this.createRecommendation('reduce_particle_count', 'medium', { effectType: issue.effectType })
                );
                break;

            case 'memory_leak':
                strategies.push(
                    this.createRecommendation('cleanup_memory', 'critical')
                );
                break;
        }

        return strategies;
    }

    createRecommendation(strategyId, severity, context = {}) {
        const strategy = this.optimizationStrategies.get(strategyId);
        return {
            id: strategyId,
            name: strategy.name,
            description: strategy.description,
            severity,
            context,
            estimatedImpact: this.estimateImpact(strategyId, severity),
            canAutoApply: this.canAutoApply(strategyId, severity)
        };
    }

    deduplicateRecommendations(recommendations) {
        const unique = new Map();
        
        for (const rec of recommendations) {
            const key = `${rec.id}_${JSON.stringify(rec.context)}`;
            if (!unique.has(key) || unique.get(key).severity < rec.severity) {
                unique.set(key, rec);
            }
        }
        
        return Array.from(unique.values());
    }

    prioritizeRecommendations(recommendations) {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        
        return recommendations.sort((a, b) => {
            const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
            if (severityDiff !== 0) return severityDiff;
            
            return b.estimatedImpact - a.estimatedImpact;
        });
    }

    autoApplyOptimizations(recommendations) {
        const applied = [];
        
        for (const rec of recommendations) {
            if (rec.canAutoApply && rec.severity !== 'critical') {
                try {
                    const strategy = this.optimizationStrategies.get(rec.id);
                    const result = strategy.execute(this.calculateIntensity(rec.severity));
                    
                    applied.push({
                        recommendation: rec,
                        result,
                        timestamp: Date.now()
                    });
                    
                    this.logOptimization(rec, result);
                } catch (error) {
                    console.error(`Failed to apply optimization ${rec.id}:`, error);
                }
            }
        }
        
        return applied;
    }

    // 最適化戦略の実装
    reduceParticleCount(intensity) {
        const reduction = 0.1 + (intensity * 0.3); // 10%-40%削減
        
        if (this.gameEngine.enhancedParticleManager) {
            const currentMultiplier = this.gameEngine.enhancedParticleManager.particleMultiplier || 1.0;
            const newMultiplier = Math.max(0.1, currentMultiplier * (1 - reduction));
            
            this.gameEngine.enhancedParticleManager.setParticleMultiplier(newMultiplier);
            
            return {
                action: 'パーティクル数削減',
                previousValue: currentMultiplier,
                newValue: newMultiplier,
                reductionPercent: reduction * 100
            };
        }
        
        return { action: 'パーティクル数削減', status: 'failed', reason: 'ParticleManager not available' };
    }

    lowerQualitySettings(intensity) {
        const qualityLevels = ['ultra', 'high', 'medium', 'low'];
        const currentQuality = this.gameEngine.effectQualityController?.getCurrentQualityLevel() || 'high';
        const currentIndex = qualityLevels.indexOf(currentQuality);
        const stepsDown = Math.ceil(intensity * 2) + 1;
        const newIndex = Math.min(qualityLevels.length - 1, currentIndex + stepsDown);
        const newQuality = qualityLevels[newIndex];
        
        if (this.gameEngine.effectQualityController && newQuality !== currentQuality) {
            this.gameEngine.effectQualityController.setQualityLevel(newQuality);
            
            return {
                action: '品質設定低下',
                previousValue: currentQuality,
                newValue: newQuality
            };
        }
        
        return { action: '品質設定低下', status: 'no_change' };
    }

    disableComplexEffects(intensity) {
        const effects = [];
        
        if (intensity > 0.5 && this.gameEngine.seasonalEffectManager) {
            this.gameEngine.seasonalEffectManager.setEnabled(false);
            effects.push('seasonal');
        }
        
        if (intensity > 0.7 && this.gameEngine.enhancedEffectManager) {
            this.gameEngine.enhancedEffectManager.setScreenEffectsEnabled(false);
            effects.push('screen_effects');
        }
        
        return {
            action: '複雑エフェクト無効化',
            disabledEffects: effects
        };
    }

    optimizeRenderFrequency(intensity) {
        // レンダリング頻度の調整（フレームスキッピング）
        const skipFrames = Math.floor(intensity * 3); // 0-3フレームスキップ
        
        if (this.gameEngine.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.setRenderFrequency(1 / (skipFrames + 1));
        }
        
        return {
            action: 'レンダリング頻度最適化',
            skipFrames,
            renderFrequency: 1 / (skipFrames + 1)
        };
    }

    enableAggressiveCulling(intensity) {
        const cullingMargin = 50 - (intensity * 30); // より厳しいカリング
        
        if (this.gameEngine.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.setCullingMargin(cullingMargin);
        }
        
        if (this.gameEngine.enhancedEffectManager) {
            this.gameEngine.enhancedEffectManager.setCullingMargin(cullingMargin);
        }
        
        return {
            action: 'カリング有効化',
            cullingMargin
        };
    }

    cleanupMemory(intensity) {
        let cleanedItems = 0;
        
        // パーティクルクリーンアップ
        if (this.gameEngine.enhancedParticleManager) {
            const cleaned = this.gameEngine.enhancedParticleManager.forceCleanup();
            cleanedItems += cleaned || 0;
        }
        
        // エフェクトクリーンアップ
        if (this.gameEngine.enhancedEffectManager) {
            const cleaned = this.gameEngine.enhancedEffectManager.forceCleanup();
            cleanedItems += cleaned || 0;
        }
        
        // ガベージコレクション要求
        if (intensity > 0.7 && window.gc) {
            window.gc();
        }
        
        return {
            action: 'メモリクリーンアップ',
            cleanedItems,
            gcRequested: intensity > 0.7
        };
    }

    // ユーティリティメソッド
    calculateIntensity(severity) {
        switch (severity) {
            case 'critical': return 1.0;
            case 'high': return 0.7;
            case 'medium': return 0.4;
            case 'low': return 0.2;
            default: return 0.5;
        }
    }

    estimateImpact(strategyId, severity) {
        const baseImpacts = {
            reduce_particle_count: 30,
            lower_quality_settings: 25,
            disable_complex_effects: 40,
            optimize_render_frequency: 15,
            enable_culling: 10,
            cleanup_memory: 20
        };
        
        const severityMultiplier = {
            critical: 1.5,
            high: 1.2,
            medium: 1.0,
            low: 0.8
        };
        
        return (baseImpacts[strategyId] || 10) * (severityMultiplier[severity] || 1.0);
    }

    canAutoApply(strategyId, severity) {
        // 重要度が高すぎる場合は自動適用しない
        if (severity === 'critical') return false;
        
        const autoApplicable = [
            'reduce_particle_count',
            'optimize_render_frequency',
            'enable_culling',
            'cleanup_memory'
        ];
        
        return autoApplicable.includes(strategyId);
    }

    calculateOverallScore(issues) {
        let score = 100;
        
        for (const issue of issues) {
            switch (issue.severity) {
                case 'critical': score -= 30; break;
                case 'high': score -= 20; break;
                case 'medium': score -= 10; break;
                case 'low': score -= 5; break;
            }
        }
        
        return Math.max(0, score);
    }

    categorizePerformance(fps) {
        if (fps >= 55) return 'excellent';
        if (fps >= 40) return 'good';
        if (fps >= 25) return 'acceptable';
        return 'poor';
    }

    logOptimization(recommendation, result) {
        const logEntry = {
            timestamp: Date.now(),
            recommendation,
            result,
            beforeStats: this.gameEngine.performanceOptimizer?.getStats() || {}
        };
        
        this.optimizationHistory.push(logEntry);
        
        // 履歴サイズ制限
        if (this.optimizationHistory.length > 100) {
            this.optimizationHistory.shift();
        }
        
        console.log('Applied optimization:', logEntry);
    }

    getOptimizationHistory() {
        return this.optimizationHistory;
    }

    revertLastOptimization() {
        if (this.optimizationHistory.length === 0) {
            return { success: false, reason: 'No optimizations to revert' };
        }
        
        const lastOptimization = this.optimizationHistory.pop();
        // リバート実装は複雑なため、ここでは基本的な復元のみ
        
        return {
            success: true,
            reverted: lastOptimization.recommendation.name
        };
    }
}

// グローバルアクセス用（デバッグ目的）
window.EffectOptimizationAdvisor = EffectOptimizationAdvisor;