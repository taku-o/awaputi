/**
 * ComparisonResultRenderer.ts
 * 比較エンジンの結果レンダリング
 * ComparisonEngineから分離された結果表示・フォーマット機能
 */

export class ComparisonResultRenderer {
    constructor() {
        // レンダリング設定
        this.renderConfig = {
            colors: {
                improved: '#4CAF50','';
                declined: '#F44336','';
                stable: '#9E9E9E','';
                excellent: '#FFD700','';
                average: '#2196F3',';
    }
    }'
                needsImprovement: '#FF9800' }
            },'
            icons: { ''
                improved: '↑','';
                declined: '↓','';
                stable: '→','';
                excellent: '★','';
                average: '●','';
                needsImprovement: '△' }
            },
            formats: {
                percentage: (value) => `${value.toFixed(1})}%`,
                number: (value) => value.toLocaleString(),
                time: (value) => this.formatTime(value),
                score: (value) => Math.round(value).toLocaleString();
            }
        };
    }
    
    /**
     * 比較サマリーを生成
     * @param {Object} comparisons - 比較結果
     * @param {Array} metrics - 使用したメトリクス
     * @returns {Object} サマリー
     */
    generateComparisonSummary(comparisons, metrics) {'
        const availableComparisons = Object.values(comparisons).filter(c => c.available);''
        if (availableComparisons.length === 0') {
    }'
            return { available: false,' };'
                message: '比較可能なデータがありません' }
            },
        }

        let totalImprovements = 0;
        let totalDeclines = 0;
';
        availableComparisons.forEach(comparison => {  totalImprovements += comparison.improvements || 0;')'
            totalDeclines += comparison.declines || 0)');'
'';
        let overallAssessment = 'stable';''
        if (totalImprovements > totalDeclines') {' }'
            overallAssessment = 'improving';' }'
        } else if (totalDeclines > totalImprovements') { ''
            overallAssessment = 'declining'; }
        }

        return { available: true,
            overallAssessment,
            totalImprovements,
            totalDeclines,
            comparisonCount: availableComparisons.length, };
            details: this.generateDetailedAnalysis(comparisons); }
        };
    }
    
    /**
     * ベンチマークサマリーを生成
     * @param {Object} comparison - ベンチマーク比較結果
     * @param {Array} metrics - 使用したメトリクス
     * @returns {Object} ベンチマークサマリー'
     */''
    generateBenchmarkSummary(comparison, metrics') {
        
    }
        const { above_average, average, below_average } = comparison;
        const total = above_average + average + below_average;'
'';
        let overallPerformance = 'average';''
        if(above_average > below_average') {'
            ';
        }'
            overallPerformance = 'excellent';' }'
        } else if (below_average > above_average') { ''
            overallPerformance = 'needs_improvement'; }
        }

        const performanceRatio = { above_average: total > 0 ? (above_average / total) * 100 : 0,
            average: total > 0 ? (average / total) * 100 : 0,
            below_average: total > 0 ? (below_average / total) * 100 : 0 }
        },

        return { overallPerformance,
            performanceRatio,
            strongMetrics: this.identifyStrongMetrics(comparison),
            weakMetrics: this.identifyWeakMetrics(comparison), };
            analysis: this.generateBenchmarkAnalysis(comparison); }
        };
    }
    
    /**
     * ステージ比較サマリーを生成
     * @param {Object} stageComparisons - ステージ比較結果
     * @param {Array} metrics - 使用したメトリクス
     * @returns {Object} ステージサマリー
     */
    generateStageComparisonSummary(stageComparisons, metrics) {
        const availableComparisons = Object.values(stageComparisons);
            .filter(c => c.comparison && c.comparison.available);'
        '';
        if (availableComparisons.length === 0') {
    }'
            return { available: false,' };'
                message: '比較可能なステージデータがありません' }
            },
        }

        let totalImprovements = 0;
        let totalDeclines = 0;
        const stagesByCategory = { tutorial: [],
            normal: [],
            special: [] }
        },

        availableComparisons.forEach(stage => {  totalImprovements += stage.comparison.improvements || 0;)
            totalDeclines += stage.comparison.declines || 0;
            );
            const category = this.categorizeStage(stage.stageId); }'
            stagesByCategory[category].push(stage);' }'
        }');'
'';
        let overallTrend = 'stable';''
        if(totalImprovements > totalDeclines') {'
            ';
        }'
            overallTrend = 'improving';' }'
        } else if (totalDeclines > totalImprovements') { ''
            overallTrend = 'declining'; }
        }

        return { available: true,
            overallTrend,
            totalImprovements,
            totalDeclines,
            stageCount: availableComparisons.length,
            stagesByCategory,
            details: this.generateStageAnalysisDetails(stageComparisons), };
            recommendations: this.generateStageRecommendations(stageComparisons); }
        };
    }
    
    /**
     * 詳細分析を生成
     * @param {Object} comparisons - 比較結果
     * @returns {Object} 詳細分析
     */
    generateDetailedAnalysis(comparisons) {
        const analysis = {
            strengths: [],
            weaknesses: [],
    }
            opportunities: [] }
        },

        Object.entries(comparisons).forEach(([period, comparison]) => {  if (!comparison.available) return; }'
' }'
            Object.entries(comparison.metrics || {}).forEach(([metricName, metric]') => {  ''
                if (metric.trend === 'improved' && Math.abs(metric.changePercent) > 10) {
                    analysis.strengths.push({
                        metric: metricName,);
                        period: period);
                        improvement: metric.changePercent,) }'
                        value: metric.current),' }'
                    }');''
                } else if (metric.trend === 'declined' && Math.abs(metric.changePercent) > 10) { analysis.weaknesses.push({
                        metric: metricName,);
                        period: period);
                        decline: metric.changePercent,);
                        value: metric.current); }
                }
            });
        });

        if (analysis.weaknesses.length > 0) { analysis.opportunities = this.identifyOpportunities(analysis.weaknesses); }
        }

        return analysis;
    }
    
    /**
     * ベンチマーク分析を生成
     * @param {Object} comparison - ベンチマーク比較結果
     * @returns {Object} ベンチマーク分析
     */
    generateBenchmarkAnalysis(comparison) {
        const analysis = {
            strengths: [],
            improvements: [],
    }
            insights: [] }
        },'
'';
        Object.entries(comparison.metrics || {}).forEach(([metricName, metric]') => {  ''
            if(metric.performance === 'above_average') {
                analysis.strengths.push({
                    metric: metricName,);
                    percentileRank: metric.percentileRank);
            }
                    value: metric.current,) }'
                    difference: metric.differencePercent),' }'
                }');''
            } else if (metric.performance === 'below_average') { analysis.improvements.push({
                    metric: metricName,
                    percentileRank: metric.percentileRank,);
                    value: metric.current);
                    difference: metric.differencePercent,);
                    targetValue: metric.benchmark.median); }
            }
        });

        // インサイトの生成
        if(analysis.improvements.length > 0) {'
            const worstMetric = analysis.improvements'';
                .sort((a, b) => a.percentileRank - b.percentileRank')[0];
            ';
            analysis.insights.push({'
        }'
                type: 'improvement_priority', })
                message: `${worstMetric.metric}の改善を優先的に行うことで、全体的なパフォーマンスが向上する可能性があります`,)
                metric: worstMetric),
        }'
'';
        if(analysis.strengths.length > 0') {'
            analysis.insights.push({''
                type: 'leverage_strength',')';
                message: '強みを活かしてさらなる成長を目指しましょう',);
        }
                metrics: analysis.strengths); }
        }

        return analysis;
    }
    
    /**
     * ステージ分析詳細を生成
     * @param {Object} stageComparisons - ステージ比較結果
     * @returns {Object} ステージ分析詳細
     */
    generateStageAnalysisDetails(stageComparisons) { const details = { }
            byCategory: {},
            excellentStages: [],
            improvingStages: [],
            strugglingStages: [];
        },

        Object.entries(stageComparisons).forEach(([stageId, stageData]) => {  if (!stageData.comparison || !stageData.comparison.available) return;

            const category = this.categorizeStage(stageId);
            const performance = this.assessStagePerformance(stageData.current, stageData.comparison.metrics);

            if(!details.byCategory[category]) {

                details.byCategory[category] = {
                    stages: [],
                    averagePerformance: 0,

            }
                    totalImprovements: 0, }
                    totalDeclines: 0 }
                },
            }

            const categoryData = details.byCategory[category];
            categoryData.stages.push({ stageId)'
                performance,')';
                comparison: stageData.comparison)'),

            categoryData.totalImprovements += stageData.comparison.improvements || 0;
            categoryData.totalDeclines += stageData.comparison.declines || 0;
';
            // パフォーマンス別分類''
            if(performance.grade === 'A' || performance.grade === 'B') {'
                ';
            }'
                details.excellentStages.push(stageId');' }'
            } else if (stageData.comparison.overallTrend === 'improving') { ''
                details.improvingStages.push(stageId');' }'
            } else if (performance.grade === 'D' || performance.grade === 'F') { details.strugglingStages.push(stageId); }
            }
        });

        return details;
    }
    
    /**
     * ステージ推奨事項を生成
     * @param {Object} stageComparisons - ステージ比較結果
     * @returns {Array} 推奨事項
     */
    generateStageRecommendations(stageComparisons) {
        const recommendations = [];
        const weakStages = [];
        const improvingStages = [];

        Object.entries(stageComparisons).forEach(([stageId, stageData]) => { 
    }
            if (!stageData.comparison) return; }'
' }'
            const performance = this.assessStagePerformance(stageData.current, {}');'
            '';
            if(performance.grade = == 'D' || performance.grade === 'F') {
                weakStages.push({)
                    stageId);
                    stageInfo: this.getStageInfo(stageId) }'
                    weaknesses: this.identifyStageWeaknesses(stageData.current),' }'
                }');''
            } else if (stageData.comparison.overallTrend === 'improving') { improvingStages.push(stageId); }
            }
        });'
'';
        if(weakStages.length > 0') {'
            recommendations.push({''
                type: 'focus_weak_stages',')';
                priority: 'high')';
                stages: weakStages,');
        }'
                message: '以下のステージに重点的に取り組むことをお勧めします'); }
        }'
'';
        if(improvingStages.length > 0') {'
            recommendations.push({''
                type: 'maintain_momentum',')';
                priority: 'medium')';
                stages: improvingStages,');
        }'
                message: '改善が見られるステージでの練習を継続しましょう'); }
        }

        return recommendations;
    }
    
    /**
     * 時間をフォーマット
     * @param {number} milliseconds - ミリ秒
     * @returns {string} フォーマットされた時間
     */
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
    }
        if (hours > 0) { }
            return `${hours}時間${minutes % 60}分`;
        } else if (minutes > 0) {
            return `${minutes}分${seconds % 60}秒`;
        } else {  }
            return `${seconds}秒`;
        }
    }
    
    /**
     * ステージをカテゴライズ
     * @param {string} stageId - ステージID
     * @returns {string} カテゴリー'
     */''
    categorizeStage(stageId') {'
        '';
        if (stageId === 'tutorial'') return 'tutorial';''
        if (stageId.startsWith('stage')') return 'normal';''
        if (['endless', 'timeattack', 'awawa'].includes(stageId)') return 'special';'
    }'
        return 'other'; }
    }
    
    /**
     * ステージ情報を取得
     * @param {string} stageId - ステージID
     * @returns {Object} ステージ情報'
     */''
    getStageInfo(stageId') { const stageMap = {' }'
            'tutorial': { name: 'チュートリアル', difficulty: 1 },''
            'stage1': { name: 'ステージ1', difficulty: 2 },''
            'stage2': { name: 'ステージ2', difficulty: 3 },''
            'stage3': { name: 'ステージ3', difficulty: 4 },''
            'stage4': { name: 'ステージ4', difficulty: 5 },''
            'stage5': { name: 'ステージ5', difficulty: 6 },''
            'endless': { name: 'エンドレスモード', difficulty: 7 },''
            'timeattack': { name: 'タイムアタック', difficulty: 8 },''
            'awawa': { name: 'あわわモード', difficulty: 9 }
        };
        
        return stageMap[stageId] || { name: stageId, difficulty: 5 }
    }
    
    /**
     * ステージパフォーマンスを評価
     * @param {Object} stageData - ステージデータ
     * @param {Object} metrics - メトリクス
     * @returns {Object} パフォーマンス評価
     */
    assessStagePerformance(stageData, metrics) {
        let score = 0;
        let maxScore = 0;

        if (stageData.completionRate !== undefined) {
            score += stageData.completionRate * 40;
    }
            maxScore += 40; }
        }
        if(stageData.averageAccuracy !== undefined) {
            score += stageData.averageAccuracy * 30;
        }
            maxScore += 30; }
        }
        if(stageData.consistencyScore !== undefined) {
            score += stageData.consistencyScore * 30;
        }
            maxScore += 30; }
        }'
'';
        const averageScore = maxScore > 0 ? (score / maxScore') * 100 : 0;''
        let grade = 'F';'
        '';
        if(averageScore >= 90') {'
            ';
        }'
            grade = 'A';' }'
        } else if (averageScore >= 80') { ''
            grade = 'B';' }'
        } else if (averageScore >= 70') { ''
            grade = 'C';' }'
        } else if (averageScore >= 60') { ''
            grade = 'D'; }
        }

        return { score: averageScore,
            grade,
            strengths: this.identifyStageStrengths(stageData), };
            weaknesses: this.identifyStageWeaknesses(stageData); }
        };
    }
    
    /**
     * ステージの強みを特定
     * @param {Object} stageData - ステージデータ
     * @returns {Array} 強み
     */
    identifyStageStrengths(stageData) {
        const strengths = [];'
        '';
        if (stageData.completionRate >= 0.8') {'
    }'
            strengths.push('高い完了率'); }'
        }''
        if(stageData.averageAccuracy >= 0.85') {'
            ';
        }'
            strengths.push('優れた精度'); }'
        }''
        if(stageData.consistencyScore >= 0.7') {'
            ';
        }'
            strengths.push('安定したパフォーマンス'); }'
        }''
        if(stageData.averageAttemptsToComplete <= 3') {'
            ';
        }'
            strengths.push('効率的なクリア'); }
        }
        
        return strengths;
    }
    
    /**
     * ステージの弱点を特定
     * @param {Object} stageData - ステージデータ
     * @returns {Array} 弱点
     */
    identifyStageWeaknesses(stageData) {
        const weaknesses = [];'
        '';
        if (stageData.completionRate < 0.5') {'
    }'
            weaknesses.push('低い完了率'); }'
        }''
        if(stageData.averageAccuracy < 0.7') {'
            ';
        }'
            weaknesses.push('精度の改善が必要'); }'
        }''
        if(stageData.consistencyScore < 0.4') {'
            ';
        }'
            weaknesses.push('パフォーマンスが不安定'); }'
        }''
        if(stageData.averageAttemptsToComplete > 10') {'
            ';
        }'
            weaknesses.push('クリアまでの試行回数が多い'); }
        }
        
        return weaknesses;
    }
    
    /**
     * 強いメトリクスを特定
     * @param {Object} comparison - 比較結果
     * @returns {Array} 強いメトリクス
     */
    identifyStrongMetrics(comparison) {
        
    }'
        return Object.entries(comparison.metrics || {})''
            .filter(([_, metric]') => metric.performance === 'above_average');
            .map(([name, metric]) => ({ name,
                percentileRank: metric.percentileRank);
                value: metric.current }
            })
            .sort((a, b) => b.percentileRank - a.percentileRank);
    }
    
    /**
     * 弱いメトリクスを特定
     * @param {Object} comparison - 比較結果
     * @returns {Array} 弱いメトリクス
     */
    identifyWeakMetrics(comparison) {
        
    }'
        return Object.entries(comparison.metrics || {})''
            .filter(([_, metric]') => metric.performance === 'below_average');
            .map(([name, metric]) => ({ name,
                percentileRank: metric.percentileRank,
                value: metric.current);
                targetValue: metric.benchmark.median }
            })
            .sort((a, b) => a.percentileRank - b.percentileRank);
    }
    
    /**
     * 改善の機会を特定
     * @param {Array} weaknesses - 弱点リスト
     * @returns {Array} 改善の機会
     */
    identifyOpportunities(weaknesses) {
        return weaknesses.map(weakness => ({)
            metric: weakness.metric,)';
            currentValue: weakness.value),'';
            improvementPotential: Math.abs(weakness.decline'),';
    }'
            priority: weakness.decline < -20 ? 'high' : 'medium'' }'
        }'),'
    }''
}