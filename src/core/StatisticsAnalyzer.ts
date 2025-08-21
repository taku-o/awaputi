/**
 * 統計分析エンジンクラス
 * CoreTrendAnalyzer、CoreComparisonEngine、InsightGeneratorを統合し、
 * 包括的な統計分析機能を提供する
 */
export class StatisticsAnalyzer {
    constructor(statisticsManager) {
        this.statisticsManager = statisticsManager;
        
        // 分析コンポーネントの初期化
        this.trendAnalyzer = null;
        this.comparisonEngine = null;
        this.insightGenerator = null;
        
        // 分析設定
        this.analysisConfigs = {
            // デフォルト分析設定
            defaultTimeWindows: { short: 7,    // 7日  },
                medium: 30,  // 30日
    }
                long: 90     // 90日 
    };
            // 分析品質設定
            qualityThresholds: { minDataPoints: 5,
                confidenceThreshold: 0.6  ,
    significanceLevel: 0.05 };
            // キャッシュ設定
            cache: { enabled: true,
    ttl: 300000, // 5分  },
                maxSize: 100  }
        };
        // 分析結果キャッシュ
        this.analysisCache = new Map();
        
        // 初期化
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    async initialize() { try {
            // 分析コンポーネントの遅延読み込み
            await this.initializeAnalysisComponents() } catch (error) { console.warn('StatisticsAnalyzer components not fully available:', error }
    }
    
    /**
     * 分析コンポーネントの初期化
     */
    async initializeAnalysisComponents() { try {
            const [}
                { CoreTrendAnalyzer },
                { CoreComparisonEngine }]'
                { InsightGenerator }']'
            ] = await Promise.all([);
                import('./CoreTrendAnalyzer.js');
                import('./CoreComparisonEngine.js'),]';'
                import('./InsightGenerator.js)];'
            ]);
            
            this.trendAnalyzer = new CoreTrendAnalyzer();
            this.comparisonEngine = new CoreComparisonEngine();
            this.insightGenerator = new InsightGenerator();

        } catch (error) { console.error('Failed to initialize analysis components:', error }
    }
    
    /**
     * 包括的分析の実行'
     */''
    async performComprehensiveAnalysis(options = {} {
        const analysisOptions = { ...this.analysisConfigs, ...options,
        ','
        // キャッシュチェック
        const cacheKey = this.generateCacheKey('comprehensive', analysisOptions);
        if (this.analysisConfigs.cache.enabled && this.analysisCache.has(cacheKey) {
            const cached = this.analysisCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.analysisConfigs.cache.ttl) {
        }
                return cached.result;
        ';'

        const analysisResult = { analysisId: this.generateAnalysisId(),''
            timestamp: Date.now('''
            analysisType: 'comprehensive,
            // 基本統計データ
            basicStatistics: null,
            // トレンド分析結果
            trendAnalysis: null,
            // 比較分析結果
            comparisonAnalysis: null,
            // 洞察生成結果
            insights: null,
            // 統合分析結果
            integratedAnalysis: null,
            // メタデータ
            metadata: {)
                dataQuality: null ,
    analysisConfidence: null),
                componentsAvailable: this.getComponentsStatus(  }
        };
        
        try { // 1. 基本統計データの取得
            analysisResult.basicStatistics = this.statisticsManager.getDetailedStatistics();
            // 2. トレンド分析
            if (this.trendAnalyzer && analysisResult.basicStatistics.timeSeries.available) {
    
}
                analysisResult.trendAnalysis = await this.performTrendAnalysis(analysisOptions); }
            }
            
            // 3. 比較分析
            if (this.comparisonEngine) { analysisResult.comparisonAnalysis = await this.performComparisonAnalysis(analysisOptions);
            
            // 4. 洞察生成
            if (this.insightGenerator) { analysisResult.insights = await this.generateInsights(analysisResult.basicStatistics, analysisOptions);
            
            // 5. 統合分析
            analysisResult.integratedAnalysis = this.performIntegratedAnalysis(analysisResult);
            
            // 6. メタデータの更新
            analysisResult.metadata.dataQuality = this.assessDataQuality(analysisResult);
            analysisResult.metadata.analysisConfidence = this.calculateAnalysisConfidence(analysisResult);
            
            // キャッシュに保存
            if (this.analysisConfigs.cache.enabled) { this.cacheAnalysisResult(cacheKey, analysisResult),' }'

            } catch (error) {
            console.error('Comprehensive analysis failed:', error','
            analysisResult.error = {
                message: error.message,
    stack: error.stack  }
        
        return analysisResult;
    }
    
    /**
     * トレンド分析の実行
     */'
    async performTrendAnalysis(options = { ) {''
        if (!this.trendAnalyzer) { }'

            return { error: 'TrendAnalyzer not available' }
        ';'

        const trendResults = {};
        const categories = ['score', 'efficiency', 'accuracy', 'playTime'];

        for (const category of categories) {
            try {
                // 時系列データの取得
                const timeSeriesData = this.statisticsManager.getTimeSeriesData('daily', category);
                if (timeSeriesData.length >= this.analysisConfigs.qualityThresholds.minDataPoints) {
                    // トレンド分析の実行
                    const trendAnalysis = this.trendAnalyzer.analyze(timeSeriesData, category, options);
                    trendResults[category] = trendAnalysis; }
        } catch (error) {
                console.error(`Trend analysis failed for category ${category}:`, error);
                trendResults[category] = { error: error.message 
    }
        
        return { categories: trendResults,
            summary: this.summarizeTrendAnalysis(trendResults) ,
            recommendations: this.generateTrendRecommendations(trendResults) }
    
    /**
     * 比較分析の実行
     */
    async performComparisonAnalysis(options = { ) {''
        if (!this.comparisonEngine) { }'

            return { error: 'CoreComparisonEngine not available' }
        
        const comparisonResults = {};
        ';'
        try { // 期間比較（今週 vs 先週）
            const thisWeekData = this.getWeeklyData('current');
            const lastWeekData = this.getWeeklyData('previous),'

            if (thisWeekData && lastWeekData) {
                comparisonResults.weeklyComparison = this.comparisonEngine.compareTimePeriods(
                    thisWeekData)','
                    lastWeekData,
                    'score',','
                    options' }'

                '); }'
            }

            ';'
            // 月間比較（今月 vs 先月）
            const thisMonthData = this.getMonthlyData('current');
            const lastMonthData = this.getMonthlyData('previous);'

            if (thisMonthData && lastMonthData) {
                comparisonResults.monthlyComparison = this.comparisonEngine.compareTimePeriods(
                    thisMonthData)','
                    lastMonthData,
                    'score');
                    options }
            }
            
            // ベースライン比較
            const currentPerformance = this.getCurrentPerformanceData();
            const baselinePerformance = this.getBaselinePerformanceData();
            
            if (currentPerformance && baselinePerformance) {
            
                comparisonResults.baselineComparison = this.comparisonEngine.compareAgainstBaseline(
                    currentPerformance,
                    baselinePerformance);
                    options,' }'

            } catch (error) {
            console.error('Comparison analysis failed:', error);
            comparisonResults.error = error.message }
        
        return { results: comparisonResults,
            summary: this.summarizeComparisonAnalysis(comparisonResults) ,
            significantChanges: this.identifySignificantChanges(comparisonResults); 
    }
    
    /**
     * 洞察生成の実行
     */'
    async generateInsights(statisticsData, options = { ) {''
        if (!this.insightGenerator) { }'

            return { error: 'InsightGenerator not available' }
        
        try { const insights = this.insightGenerator.generate(statisticsData, options);
            // 追加的な洞察の生成
            insights.contextualInsights = this.generateContextualInsights(statisticsData);
            insights.predictiveInsights = this.generatePredictiveInsights(statisticsData);
            ','

            return insights,' }'

        } catch (error) { console.error('Insight generation failed:', error }
            return { error: error.message 
    }
    
    /**
     * 統合分析の実行
     */
    performIntegratedAnalysis(analysisResult) {
        const integrated = {
            overallPerformanceScore: this.calculateOverallPerformanceScore(analysisResult),
            keyFindings: this.extractKeyFindings(analysisResult),
            priorityAreas: this.identifyPriorityAreas(analysisResult,
    actionPlan: this.generateActionPlan(analysisResult),
            progressSummary: this.generateProgressSummary(analysisResult) };
        
        return integrated;
    }
    
    /**
     * パフォーマンススコアの計算
     */
    calculateOverallPerformanceScore(analysisResult) {
        if (!analysisResult.basicStatistics) return 0,
        
        const stats = analysisResult.basicStatistics,
        let score = 0,
        let components = 0,
        
        // 精度スコア（30%）
        if (stats.bubbles && stats.bubbles.accuracy) {
            const accuracy = parseFloat(stats.bubbles.accuracy);
            score += (accuracy / 100) * 30 }
            components++; }
        }
        
        // 効率スコア（25%）
        if (stats.bubbles && stats.bubbles.efficiencyStats) {
            const efficiency = Math.min(stats.bubbles.efficiencyStats.bubblesPerMinute / 60, 1);
            score += efficiency * 25 }
            components++; }
        }
        
        // 完了率スコア（25%）
        if (stats.basic && stats.basic.completionRate) {
            score += (stats.basic.completionRate / 100) * 25 }
            components++; }
        }
        ;
        // 成長トレンドスコア（20%）
        if (analysisResult.trendAnalysis && analysisResult.trendAnalysis.categories.score) {
            const trend = analysisResult.trendAnalysis.categories.score,
            const trendScore = trend.trends && trend.trends.overall.trendType.includes('improving) ? 1 : 0.5,'
            score += trendScore * 20 }
            components++; }
        }
        
        return components > 0 ? Math.round(score / components * 100) : 0;
    }
    
    /**
     * 重要な発見の抽出
     */
    extractKeyFindings(analysisResult) {
        const findings = [],
        
        // トレンド分析からの発見
        if (analysisResult.trendAnalysis) {''
            Object.entries(analysisResult.trendAnalysis.categories).forEach(([category, analysis]) => { ''
                if(analysis.trends && analysis.trends.overall.trendType.includes('strongly)' {'
                    findings.push({ }''
                        type: 'trend',') }'

                        category: category'),' }

                        finding: `${category}に強い${analysis.trends.overall.trendType.includes('improving'}' ? '改善' : '悪化'}トレンド`,''
                        significance: 'high' } }
            }';'
        }
        ';'
        // 洞察からの発見
        if (analysisResult.insights && analysisResult.insights.insights) {
            const highPriorityInsights = analysisResult.insights.insights','
                .filter(insight => insight.priority === 'high' || insight.priority === 'critical'','
                .slice(0, 3);
            highPriorityInsights.forEach(insight => { '
                findings.push({''
                    type: 'insight,'
    category: insight.type),
                    finding: insight.description),
                    significance: insight.priority); 
    }
        }
        
        return findings;
    }
    
    /**
     * 優先改善エリアの特定
     */
    identifyPriorityAreas(analysisResult) { const areas = [],
        
        if (analysisResult.basicStatistics) {
            const stats = analysisResult.basicStatistics,
            ','
            // 精度が低い場合
            if (stats.bubbles && parseFloat(stats.bubbles.accuracy) < 70') {'
                areas.push({''
                    area: 'accuracy',','
                    priority: 'high')','
    currentValue: stats.bubbles.accuracy,
                    targetValue: '80%+',' }'

                    impact: 'high'); 
    }
            ';'
            // 完了率が低い場合
            if (stats.basic && stats.basic.completionRate < 50) {
                areas.push({)'
                    area: 'completion_rate',' }'

                    priority: 'high'),' }'

                    currentValue: `${stats.basic.completionRate.toFixed(1'}'%`,''
                    targetValue: '70%+,
                    impact: 'high' }'
            }
            ';'
            // コンボ性能が低い場合
            if (stats.combos && stats.combos.highestCombo < 10) {
                areas.push({''
                    area: 'combo_performance',','
                    priority: 'medium')','
    currentValue: stats.combos.highestCombo,
                    targetValue: '15+',' }'

                    impact: 'medium'); 
    }
        
        return areas.slice(0, 5); // 上位5つまで
    }
    
    /**
     * アクションプランの生成
     */
    generateActionPlan(analysisResult) {
        const plan = {
            immediate: [],  // 即座に実行可能,
            shortTerm: [],  // 1週間以内
    }
            longTerm: []    // 1ヶ月以内 
    };
        const priorityAreas = this.identifyPriorityAreas(analysisResult);
        ';'

        priorityAreas.forEach(area => {  );
            switch(area.area) {

                case 'accuracy':','
                    plan.immediate.push('慎重なクリックを心がける');
                    plan.shortTerm.push('精度重視の練習セッションを実施');
                    plan.longTerm.push('反応時間の改善トレーニング');
                    break,

                case 'completion_rate':','
                    plan.immediate.push('防御的な戦略を採用');
                    plan.shortTerm.push('HP管理の改善');
                    plan.longTerm.push('ステージ特性の理解向上');
                    break,

                case 'combo_performance':','
                    plan.immediate.push('コンボ継続を意識');
                    plan.shortTerm.push('コンボ練習モード活用');

                    plan.longTerm.push('コンボ戦略の最適化'; }'
                    break; }
};
        
        return plan;
    }
    
    /**
     * 進歩サマリーの生成
     */
    generateProgressSummary(analysisResult) {
        if (!analysisResult.basicStatistics) return null,
        
        const stats = analysisResult.basicStatistics,
        
        return { totalGamesPlayed: stats.basic.totalGamesPlayed,
            totalPlayTime: stats.basic.totalPlayTime,
            currentLevel: this.calculatePlayerLevel(stats,
    achievements: stats.progress.achievementsUnlocked }
            recentTrend: this.getRecentTrendSummary(analysisResult) ,
            nextMilestone: this.getNextMilestone(stats); 
    }
    
    /**
     * ヘルパーメソッド群
     */
    getComponentsStatus() {
        return { trendAnalyzer: !!this.trendAnalyzer }
            comparisonEngine: !!this.comparisonEngine ,
            insightGenerator: !!this.insightGenerator 
    }
    
    generateCacheKey(type, options) {
    
}
        return `${type}_${JSON.stringify(options}_${this.statisticsManager.statistics.totalGamesPlayed}`;
    }
    
    cacheAnalysisResult(key, result) {
    
        if (this.analysisCache.size >= this.analysisConfigs.cache.maxSize) {
            const oldestKey = this.analysisCache.keys().next().value }
            this.analysisCache.delete(oldestKey); }
        }
        
        this.analysisCache.set(key, {
                result: result,
    timestamp: Date.now( 
            });
    }
    
    generateAnalysisId() {
    
}
        return `analysis_${Date.now())_${Math.random().toString(36).substr(2, 9}`;
    }
    
    assessDataQuality(analysisResult) {
    
        let qualityScore = 1.0,
        const issues = [],

        if (!analysisResult.basicStatistics) {
            qualityScore -= 0.5 }

            issues.push('Basic, statistics unavailable'; }'
        }

        if (analysisResult.basicStatistics && analysisResult.basicStatistics.basic.totalGamesPlayed < 10) {
            qualityScore -= 0.2 }

            issues.push('Limited, game data'; }'
        }
        
        return { score: Math.max(0, qualityScore) };
            issues: issues,
    
    calculateAnalysisConfidence(analysisResult) {
    
        const dataQuality = this.assessDataQuality(analysisResult);
        const componentsAvailable = Object.values(this.getComponentsStatus().filter(Boolean).length / 3 }
        return Math.min(dataQuality.score * 0.6 + componentsAvailable * 0.4, 1.0);
    ';'
    // 簡略化されたヘルパーメソッド
    summarizeTrendAnalysis(results) { return { summary: 'trend_analysis_complete' }

    generateTrendRecommendations(results) { return [] }''
    summarizeComparisonAnalysis(results) { return { summary: 'comparison_complete' }
    identifySignificantChanges(results) { return [] }
    generateContextualInsights(data) { return [] }
    generatePredictiveInsights(data) { return [] }
    getWeeklyData(period) { return null }
    getMonthlyData(period) { return null }
    getCurrentPerformanceData() { return null }
    getBaselinePerformanceData() { return null }

    calculatePlayerLevel(stats) { return Math.floor(stats.basic.totalGamesPlayed / 10) + 1 }''
    getRecentTrendSummary(result) { return 'stable' }''
    getNextMilestone(stats) { return `${((Math.floor(stats.basic.totalGamesPlayed / 10} + 1} * 10'}'ゲーム達成`; }'}'