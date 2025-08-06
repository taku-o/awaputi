/**
 * Memory Usage Analyzer Component
 * 
 * メモリ使用量分析機能を担当
 * Main Controller Patternの一部として設計
 */

import fs from 'fs';
import path from 'path';

export class MemoryUsageAnalyzer {
    constructor(mainController) {
        this.mainController = mainController;
        this.performanceTargets = mainController.performanceTargets;
    }

    /**
     * メモリ使用量影響分析
     */
    async analyzeMemoryUsage() {
        console.log('🧠 Analyzing memory usage...');

        const totalFiles = fs.readdirSync(this.mainController.accessibilityDir, { recursive: true })
            .filter(file => file.endsWith('.js')).length;

        const subComponentDirs = ['keyboard-navigation', 'wcag-validation', 'screen-reader', 
                                 'onboarding', 'color-contrast', 'settings-ui'];

        let totalSubComponents = 0;
        let totalMemoryFootprint = 0;

        for (const subdir of subComponentDirs) {
            const subdirPath = path.join(this.mainController.accessibilityDir, subdir);
            if (fs.existsSync(subdirPath)) {
                const files = fs.readdirSync(subdirPath).filter(f => f.endsWith('.js'));
                totalSubComponents += files.length;
                
                for (const file of files) {
                    const filePath = path.join(subdirPath, file);
                    const stats = fs.statSync(filePath);
                    totalMemoryFootprint += stats.size;
                }
            }
        }

        // ファイル構造とパターンに基づくメモリ効率性指標の推定
        const memoryEfficiencyIndicators = {
            'modular architecture': totalSubComponents >= 18, // 6 subdirs × 3 components each
            'small file sizes': totalMemoryFootprint < 1024 * 1024, // < 1MB total
            'memory pooling': await this.checkMemoryPooling(),
            'garbage collection friendly': await this.checkGCFriendly(),
            'weak references': await this.checkWeakReferences(),
            'memory leak prevention': await this.checkMemoryLeakPrevention(),
            'lazy initialization': await this.checkLazyInitialization(),
            'resource cleanup': await this.checkResourceCleanup()
        };

        const passedChecks = Object.values(memoryEfficiencyIndicators).filter(Boolean).length;
        const totalChecks = Object.keys(memoryEfficiencyIndicators).length;
        const memoryScore = Math.round((passedChecks / totalChecks) * 100);

        return {
            status: memoryScore >= 80 ? 'EXCELLENT' : memoryScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
            score: memoryScore,
            totalFiles,
            totalSubComponents,
            memoryFootprint: Math.round(totalMemoryFootprint / 1024), // KB
            estimatedMemoryIncrease: this.estimateMemoryIncrease(memoryScore),
            details: memoryEfficiencyIndicators,
            recommendations: this.generateMemoryRecommendations(memoryScore)
        };
    }

    /**
     * メモリプーリングのチェック
     */
    async checkMemoryPooling() {
        return this.scanForPattern(/pool|Pool|objectPool/);
    }

    /**
     * ガベージコレクション対応のチェック
     */
    async checkGCFriendly() {
        const hasProperCleanup = await this.scanForPattern(/removeEventListener|cleanup|destroy|dispose/);
        const avoidsCircularReferences = !(await this.scanForPattern(/this\.\w+\s*=\s*this/));
        return hasProperCleanup && avoidsCircularReferences;
    }

    /**
     * 弱参照の使用チェック
     */
    async checkWeakReferences() {
        return this.scanForPattern(/WeakMap|WeakSet|WeakRef/);
    }

    /**
     * メモリリーク防止のチェック
     */
    async checkMemoryLeakPrevention() {
        const hasEventCleanup = await this.scanForPattern(/removeEventListener/);
        const hasTimerCleanup = await this.scanForPattern(/clearTimeout|clearInterval/);
        const hasNullAssignment = await this.scanForPattern(/=\s*null/);
        return hasEventCleanup || hasTimerCleanup || hasNullAssignment;
    }

    /**
     * 遅延初期化のチェック
     */
    async checkLazyInitialization() {
        return this.scanForPattern(/lazy|Lazy|defer|Defer/);
    }

    /**
     * リソースクリーンアップのチェック
     */
    async checkResourceCleanup() {
        const patterns = [
            /cleanup|Cleanup/,
            /destroy|Destroy/,
            /dispose|Dispose/,
            /removeEventListener/,
            /clearTimeout|clearInterval/
        ];
        
        for (const pattern of patterns) {
            if (await this.scanForPattern(pattern)) {
                return true;
            }
        }
        return false;
    }

    /**
     * パターンスキャン用ヘルパー
     */
    async scanForPattern(pattern) {
        const scanInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        if (scanInDir(filePath)) return true;
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        if (pattern.test(content)) return true;
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
            return false;
        };

        return scanInDir(this.mainController.accessibilityDir);
    }

    /**
     * メモリ使用量増加の推定
     */
    estimateMemoryIncrease(score) {
        return score >= 80 ? '<10%' : score >= 60 ? '<20%' : '<30%';
    }

    /**
     * メモリ推奨事項の生成
     */
    generateMemoryRecommendations(score) {
        const recommendations = [];
        if (score < 60) {
            recommendations.push('Implement object pooling for frequently created objects');
            recommendations.push('Add weak references for cache management');
            recommendations.push('Optimize data structures to reduce memory footprint');
        }
        if (score < 80) {
            recommendations.push('Add memory usage monitoring');
            recommendations.push('Implement lazy loading for large components');
        }
        return recommendations;
    }

    /**
     * 詳細メモリ分析の実行
     */
    async runDetailedMemoryAnalysis() {
        const basicAnalysis = await this.analyzeMemoryUsage();
        
        return {
            ...basicAnalysis,
            detailedMetrics: {
                memoryLeakRisk: await this.assessMemoryLeakRisk(),
                dataStructureEfficiency: await this.analyzeDataStructures(),
                cacheUsageOptimization: await this.analyzeCacheUsage(),
                objectLifecycleManagement: await this.analyzeObjectLifecycle()
            },
            optimizationSuggestions: await this.generateOptimizationSuggestions(basicAnalysis.score)
        };
    }

    /**
     * メモリリークリスクの評価
     */
    async assessMemoryLeakRisk() {
        const risks = {
            unremoved_listeners: 0,
            uncleaned_timers: 0,
            circular_references: 0,
            unclosed_resources: 0
        };

        const assessInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        assessInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        // イベントリスナーのリーク
                        const addListeners = (content.match(/addEventListener/g) || []).length;
                        const removeListeners = (content.match(/removeEventListener/g) || []).length;
                        if (addListeners > removeListeners) {
                            risks.unremoved_listeners += (addListeners - removeListeners);
                        }

                        // タイマーのリーク
                        const setTimeouts = (content.match(/setTimeout|setInterval/g) || []).length;
                        const clearTimeouts = (content.match(/clearTimeout|clearInterval/g) || []).length;
                        if (setTimeouts > clearTimeouts) {
                            risks.uncleaned_timers += (setTimeouts - clearTimeouts);
                        }

                        // 循環参照
                        if (/this\.\w+\s*=\s*this/.test(content)) {
                            risks.circular_references++;
                        }

                        // リソースの未クローズ
                        const openResources = (content.match(/open|connect|create/g) || []).length;
                        const closeResources = (content.match(/close|disconnect|destroy|cleanup/g) || []).length;
                        if (openResources > closeResources) {
                            risks.unclosed_resources += (openResources - closeResources);
                        }
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        assessInDir(this.mainController.accessibilityDir);
        
        const totalRisk = Object.values(risks).reduce((sum, risk) => sum + risk, 0);
        return {
            riskLevel: totalRisk === 0 ? 'LOW' : totalRisk <= 5 ? 'MEDIUM' : 'HIGH',
            risks,
            totalRisk
        };
    }

    /**
     * データ構造効率性の分析
     */
    async analyzeDataStructures() {
        const structures = {
            arrays: 0,
            objects: 0,
            maps: 0,
            sets: 0,
            weakmaps: 0,
            weaksets: 0
        };

        const analyzeInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        analyzeInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        structures.arrays += (content.match(/\[\]|new Array|Array\.from/g) || []).length;
                        structures.objects += (content.match(/\{\}|new Object/g) || []).length;
                        structures.maps += (content.match(/new Map/g) || []).length;
                        structures.sets += (content.match(/new Set/g) || []).length;
                        structures.weakmaps += (content.match(/new WeakMap/g) || []).length;
                        structures.weaksets += (content.match(/new WeakSet/g) || []).length;
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        analyzeInDir(this.mainController.accessibilityDir);

        const total = Object.values(structures).reduce((sum, count) => sum + count, 0);
        const efficiencyScore = total > 0 ? 
            Math.round(((structures.maps + structures.sets + structures.weakmaps + structures.weaksets) / total) * 100) : 
            0;

        return {
            structures,
            efficiencyScore,
            recommendation: efficiencyScore < 30 ? 'Consider using Maps and Sets for better performance' : 'Good data structure usage'
        };
    }

    /**
     * キャッシュ使用の分析
     */
    async analyzeCacheUsage() {
        let cacheImplementations = 0;
        let cacheOptimizations = 0;

        const analyzeInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        analyzeInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        if (/cache|Cache|memoize|Memoize/.test(content)) {
                            cacheImplementations++;
                        }
                        if (/LRU|TTL|expire|maxSize|weakref/i.test(content)) {
                            cacheOptimizations++;
                        }
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        analyzeInDir(this.mainController.accessibilityDir);

        return {
            implementations: cacheImplementations,
            optimizations: cacheOptimizations,
            efficiencyRatio: cacheImplementations > 0 ? cacheOptimizations / cacheImplementations : 0,
            recommendation: cacheImplementations === 0 ? 
                'Consider implementing caching for frequently accessed data' :
                cacheOptimizations === 0 ? 'Add cache optimization strategies' : 'Good cache implementation'
        };
    }

    /**
     * オブジェクトライフサイクル管理の分析
     */
    async analyzeObjectLifecycle() {
        const lifecycle = {
            constructors: 0,
            destructors: 0,
            cleanupMethods: 0,
            factoryPatterns: 0
        };

        const analyzeInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        analyzeInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        lifecycle.constructors += (content.match(/constructor\s*\(/g) || []).length;
                        lifecycle.destructors += (content.match(/destroy|cleanup|dispose/g) || []).length;
                        lifecycle.cleanupMethods += (content.match(/removeEventListener|clearTimeout|clearInterval/g) || []).length;
                        lifecycle.factoryPatterns += (content.match(/create\w+|make\w+|build\w+/g) || []).length;
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        analyzeInDir(this.mainController.accessibilityDir);

        const managementRatio = lifecycle.constructors > 0 ? 
            (lifecycle.destructors + lifecycle.cleanupMethods) / lifecycle.constructors : 0;

        return {
            lifecycle,
            managementRatio: Math.round(managementRatio * 100),
            quality: managementRatio >= 0.8 ? 'EXCELLENT' : managementRatio >= 0.5 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
        };
    }

    /**
     * 最適化提案の生成
     */
    async generateOptimizationSuggestions(score) {
        const suggestions = [];
        
        if (score < 60) {
            suggestions.push({
                priority: 'HIGH',
                category: 'Memory Management',
                suggestion: 'Implement comprehensive object lifecycle management with proper cleanup methods'
            });
            suggestions.push({
                priority: 'HIGH',
                category: 'Data Structures',
                suggestion: 'Replace objects with Maps/Sets where appropriate for better memory efficiency'
            });
        }

        if (score < 80) {
            suggestions.push({
                priority: 'MEDIUM',
                category: 'Caching',
                suggestion: 'Implement intelligent caching with size limits and TTL'
            });
            suggestions.push({
                priority: 'MEDIUM',
                category: 'Lazy Loading',
                suggestion: 'Add lazy initialization for heavy components'
            });
        }

        return suggestions;
    }

    /**
     * ステータス取得
     */
    getStatus() {
        return {
            analyzerType: 'MemoryUsageAnalyzer',
            target: this.performanceTargets.memoryIncrease,
            checkCategories: [
                'modular architecture',
                'small file sizes',
                'memory pooling',
                'garbage collection friendly',
                'weak references',
                'memory leak prevention',
                'lazy initialization',
                'resource cleanup'
            ]
        };
    }
}