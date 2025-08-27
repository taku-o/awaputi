/**
 * UIComplexityAnalyzer - UI複雑度分析システム
 * 
 * UIの複雑さを測定し、簡素化の必要性を判断する分析機能を提供
 */

export class UIComplexityAnalyzer {
    constructor() {
        this.complexityMetrics = {
            elementCount: 0,
            interactionCount: 0,
            informationDensity: 0,
            visualComplexity: 0,
            cognitiveLoad: 0
        };
        
        this.analysisHistory = [];
        this.thresholds = this.initializeThresholds();
        this.weightings = this.initializeWeightings();
        
        this.setupObserver();
    }

    /**
     * 閾値を初期化
     */
    initializeThresholds() {
        return {
            // 要素数の閾値
            elementCount: {
                low: 10,
                medium: 25,
                high: 50,
                extreme: 100
            },
            
            // インタラクション数の閾値
            interactionCount: {
                low: 5,
                medium: 15,
                high: 30,
                extreme: 50
            },
            
            // 情報密度の閾値
            informationDensity: {
                low: 0.3,
                medium: 0.6,
                high: 0.8,
                extreme: 1.0
            },
            
            // 視覚的複雑さの閾値
            visualComplexity: {
                low: 0.2,
                medium: 0.5,
                high: 0.7,
                extreme: 0.9
            },
            
            // 認知負荷の閾値
            cognitiveLoad: {
                low: 0.3,
                medium: 0.6,
                high: 0.8,
                extreme: 1.0
            }
        };
    }

    /**
     * 重み付けを初期化
     */
    initializeWeightings() {
        return {
            elementCount: 0.2,
            interactionCount: 0.25,
            informationDensity: 0.2,
            visualComplexity: 0.15,
            cognitiveLoad: 0.2
        };
    }

    /**
     * 観察者を設定
     */
    setupObserver() {
        // Mutation ObserverでDOM変更を監視
        this.mutationObserver = new MutationObserver(() => {
            this.scheduleComplexityAnalysis();
        });
        
        // Intersection Observerで表示要素を監視
        this.intersectionObserver = new IntersectionObserver((entries) => {
            this.updateVisibilityMetrics(entries);
        });
        
        this.startObserving();
    }

    /**
     * 監視を開始
     */
    startObserving() {
        if (typeof document !== 'undefined') {
            this.mutationObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }
    }

    /**
     * 複雑度分析をスケジュール
     */
    scheduleComplexityAnalysis() {
        if (this.analysisTimer) {
            clearTimeout(this.analysisTimer);
        }
        
        this.analysisTimer = setTimeout(() => {
            this.analyzeComplexity();
        }, 500); // 500ms後に分析実行
    }

    /**
     * UI複雑度を分析
     */
    analyzeComplexity(container = document.body) {
        const startTime = performance.now();
        
        try {
            // 各メトリックを計算
            this.complexityMetrics = {
                elementCount: this.calculateElementCount(container),
                interactionCount: this.calculateInteractionCount(container),
                informationDensity: this.calculateInformationDensity(container),
                visualComplexity: this.calculateVisualComplexity(container),
                cognitiveLoad: this.calculateCognitiveLoad(container)
            };
            
            // 総合複雑度スコアを計算
            const overallComplexity = this.calculateOverallComplexity();
            
            // 分析結果を記録
            const analysis = {
                timestamp: Date.now(),
                metrics: { ...this.complexityMetrics },
                overallComplexity,
                recommendations: this.generateRecommendations(),
                analysisTime: performance.now() - startTime
            };
            
            this.analysisHistory.push(analysis);
            
            // 履歴サイズを制限
            if (this.analysisHistory.length > 100) {
                this.analysisHistory = this.analysisHistory.slice(-50);
            }
            
            return analysis;
            
        } catch (error) {
            console.error('Complexity analysis failed:', error);
            return null;
        }
    }

    /**
     * 要素数を計算
     */
    calculateElementCount(container) {
        const elements = container.querySelectorAll('*');
        const visibleElements = Array.from(elements).filter(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });
        
        return {
            total: elements.length,
            visible: visibleElements.length,
            score: Math.min(visibleElements.length / this.thresholds.elementCount.extreme, 1.0)
        };
    }

    /**
     * インタラクション数を計算
     */
    calculateInteractionCount(container) {
        const interactiveSelectors = [
            'button', 'input', 'select', 'textarea', 'a[href]',
            '[onclick]', '[tabindex]', '[role="button"]', '[role="link"]'
        ];
        
        const interactiveElements = container.querySelectorAll(interactiveSelectors.join(','));
        const visibleInteractive = Array.from(interactiveElements).filter(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });
        
        return {
            total: interactiveElements.length,
            visible: visibleInteractive.length,
            score: Math.min(visibleInteractive.length / this.thresholds.interactionCount.extreme, 1.0)
        };
    }

    /**
     * 情報密度を計算
     */
    calculateInformationDensity(container) {
        const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li');
        let totalTextLength = 0;
        let visibleArea = 0;
        
        Array.from(textElements).forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && style.visibility !== 'hidden') {
                totalTextLength += el.textContent.length;
                const rect = el.getBoundingClientRect();
                visibleArea += rect.width * rect.height;
            }
        });
        
        const density = visibleArea > 0 ? totalTextLength / visibleArea * 1000 : 0;
        
        return {
            textLength: totalTextLength,
            visibleArea,
            density,
            score: Math.min(density / 10, 1.0) // 正規化
        };
    }

    /**
     * 視覚的複雑さを計算
     */
    calculateVisualComplexity(container) {
        const elements = container.querySelectorAll('*');
        let colorVariety = new Set();
        let fontVariety = new Set();
        let borderCount = 0;
        let shadowCount = 0;
        
        Array.from(elements).forEach(el => {
            const style = window.getComputedStyle(el);
            
            if (style.display !== 'none' && style.visibility !== 'hidden') {
                // 色の多様性
                if (style.color && style.color !== 'rgba(0, 0, 0, 0)') {
                    colorVariety.add(style.color);
                }
                if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    colorVariety.add(style.backgroundColor);
                }
                
                // フォントの多様性
                if (style.fontFamily) {
                    fontVariety.add(style.fontFamily);
                }
                
                // ボーダーの数
                if (style.border && style.border !== 'none') {
                    borderCount++;
                }
                
                // シャドウの数
                if (style.boxShadow && style.boxShadow !== 'none') {
                    shadowCount++;
                }
            }
        });
        
        const complexityFactors = {
            colors: colorVariety.size,
            fonts: fontVariety.size,
            borders: borderCount,
            shadows: shadowCount
        };
        
        // 総合的な視覚複雑度スコア
        const score = (
            Math.min(colorVariety.size / 20, 1.0) * 0.3 +
            Math.min(fontVariety.size / 10, 1.0) * 0.2 +
            Math.min(borderCount / 50, 1.0) * 0.25 +
            Math.min(shadowCount / 20, 1.0) * 0.25
        );
        
        return {
            ...complexityFactors,
            score
        };
    }

    /**
     * 認知負荷を計算
     */
    calculateCognitiveLoad(container) {
        const factors = {
            // 階層の深さ
            hierarchyDepth: this.calculateHierarchyDepth(container),
            
            // 情報の種類数
            informationTypes: this.countInformationTypes(container),
            
            // アニメーション数
            animationCount: this.countAnimations(container),
            
            // モーダル・ポップアップ数
            overlayCount: this.countOverlays(container)
        };
        
        // 認知負荷スコアを計算
        const score = (
            Math.min(factors.hierarchyDepth / 10, 1.0) * 0.3 +
            Math.min(factors.informationTypes / 15, 1.0) * 0.3 +
            Math.min(factors.animationCount / 10, 1.0) * 0.2 +
            Math.min(factors.overlayCount / 5, 1.0) * 0.2
        );
        
        return {
            ...factors,
            score
        };
    }

    /**
     * 階層の深さを計算
     */
    calculateHierarchyDepth(container) {
        let maxDepth = 0;
        
        function traverse(element, depth) {
            maxDepth = Math.max(maxDepth, depth);
            Array.from(element.children).forEach(child => {
                traverse(child, depth + 1);
            });
        }
        
        traverse(container, 0);
        return maxDepth;
    }

    /**
     * 情報タイプ数を計算
     */
    countInformationTypes(container) {
        const typeSelectors = [
            'h1, h2, h3, h4, h5, h6', // 見出し
            'p', // 段落
            'ul, ol', // リスト
            'table', // テーブル
            'form', // フォーム
            'img', // 画像
            'video', // 動画
            'canvas', // キャンバス
            '.score, .timer, .status', // ゲーム情報
            '.button, button', // ボタン
            '.menu, .nav' // ナビゲーション
        ];
        
        let typeCount = 0;
        typeSelectors.forEach(selector => {
            if (container.querySelector(selector)) {
                typeCount++;
            }
        });
        
        return typeCount;
    }

    /**
     * アニメーション数を計算
     */
    countAnimations(container) {
        const animatedElements = container.querySelectorAll('[style*="animation"], [class*="animate"]');
        return animatedElements.length;
    }

    /**
     * オーバーレイ数を計算
     */
    countOverlays(container) {
        const overlaySelectors = [
            '.modal', '.popup', '.tooltip', '.overlay',
            '[role="dialog"]', '[aria-modal="true"]'
        ];
        
        let overlayCount = 0;
        overlaySelectors.forEach(selector => {
            overlayCount += container.querySelectorAll(selector).length;
        });
        
        return overlayCount;
    }

    /**
     * 総合複雑度を計算
     */
    calculateOverallComplexity() {
        const metrics = this.complexityMetrics;
        const weights = this.weightings;
        
        const weightedScore = (
            metrics.elementCount.score * weights.elementCount +
            metrics.interactionCount.score * weights.interactionCount +
            metrics.informationDensity.score * weights.informationDensity +
            metrics.visualComplexity.score * weights.visualComplexity +
            metrics.cognitiveLoad.score * weights.cognitiveLoad
        );
        
        return {
            score: weightedScore,
            level: this.getComplexityLevel(weightedScore),
            breakdown: {
                elementCount: metrics.elementCount.score * weights.elementCount,
                interactionCount: metrics.interactionCount.score * weights.interactionCount,
                informationDensity: metrics.informationDensity.score * weights.informationDensity,
                visualComplexity: metrics.visualComplexity.score * weights.visualComplexity,
                cognitiveLoad: metrics.cognitiveLoad.score * weights.cognitiveLoad
            }
        };
    }

    /**
     * 複雑度レベルを取得
     */
    getComplexityLevel(score) {
        if (score < 0.3) return 'low';
        if (score < 0.6) return 'medium';
        if (score < 0.8) return 'high';
        return 'extreme';
    }

    /**
     * 推奨事項を生成
     */
    generateRecommendations() {
        const recommendations = [];
        const metrics = this.complexityMetrics;
        
        // 要素数に基づく推奨
        if (metrics.elementCount.score > 0.7) {
            recommendations.push({
                type: 'element_reduction',
                priority: 'high',
                message: '表示要素数が多すぎます。重要でない要素を非表示にすることを推奨します。',
                action: 'hide_non_essential_elements'
            });
        }
        
        // インタラクション数に基づく推奨
        if (metrics.interactionCount.score > 0.7) {
            recommendations.push({
                type: 'interaction_simplification',
                priority: 'medium',
                message: 'インタラクティブ要素が多すぎます。主要な操作のみに集中することを推奨します。',
                action: 'simplify_interactions'
            });
        }
        
        // 情報密度に基づく推奨
        if (metrics.informationDensity.score > 0.8) {
            recommendations.push({
                type: 'information_spacing',
                priority: 'medium',
                message: '情報密度が高すぎます。テキストの間隔を広げることを推奨します。',
                action: 'increase_spacing'
            });
        }
        
        // 視覚的複雑さに基づく推奨
        if (metrics.visualComplexity.score > 0.7) {
            recommendations.push({
                type: 'visual_simplification',
                priority: 'medium',
                message: '視覚的要素が複雑すぎます。色やフォントの統一を推奨します。',
                action: 'unify_visual_elements'
            });
        }
        
        // 認知負荷に基づく推奨
        if (metrics.cognitiveLoad.score > 0.8) {
            recommendations.push({
                type: 'cognitive_reduction',
                priority: 'high',
                message: '認知負荷が高すぎます。段階的な情報開示を推奨します。',
                action: 'progressive_disclosure'
            });
        }
        
        return recommendations;
    }

    /**
     * 可視性メトリクスを更新
     */
    updateVisibilityMetrics(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 要素が表示されたときの処理
                this.scheduleComplexityAnalysis();
            }
        });
    }

    /**
     * 分析履歴を取得
     */
    getAnalysisHistory(limit = 10) {
        return this.analysisHistory.slice(-limit);
    }

    /**
     * 現在のメトリクスを取得
     */
    getCurrentMetrics() {
        return {
            ...this.complexityMetrics,
            overall: this.calculateOverallComplexity(),
            lastAnalysis: this.analysisHistory[this.analysisHistory.length - 1]?.timestamp
        };
    }

    /**
     * 重み付けを更新
     */
    updateWeightings(newWeightings) {
        Object.assign(this.weightings, newWeightings);
    }

    /**
     * 閾値を更新
     */
    updateThresholds(newThresholds) {
        Object.assign(this.thresholds, newThresholds);
    }

    /**
     * 統計情報を取得
     */
    getStats() {
        const recentAnalyses = this.analysisHistory.slice(-10);
        const avgComplexity = recentAnalyses.reduce((sum, analysis) => 
            sum + analysis.overallComplexity.score, 0) / recentAnalyses.length;
        
        return {
            totalAnalyses: this.analysisHistory.length,
            averageComplexity: avgComplexity || 0,
            currentMetrics: this.complexityMetrics,
            recentTrend: this.calculateComplexityTrend(),
            performanceStats: {
                averageAnalysisTime: recentAnalyses.reduce((sum, analysis) => 
                    sum + analysis.analysisTime, 0) / recentAnalyses.length
            }
        };
    }

    /**
     * 複雑度トレンドを計算
     */
    calculateComplexityTrend() {
        if (this.analysisHistory.length < 2) return 'stable';
        
        const recent = this.analysisHistory.slice(-5);
        const scores = recent.map(analysis => analysis.overallComplexity.score);
        
        const trend = scores[scores.length - 1] - scores[0];
        
        if (trend > 0.1) return 'increasing';
        if (trend < -0.1) return 'decreasing';
        return 'stable';
    }

    /**
     * クリーンアップ
     */
    destroy() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.analysisTimer) {
            clearTimeout(this.analysisTimer);
        }
        
        this.analysisHistory = [];
    }
}