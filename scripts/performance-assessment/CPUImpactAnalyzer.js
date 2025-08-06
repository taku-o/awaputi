/**
 * CPU Impact Analyzer Component
 * 
 * CPU影響分析機能を担当
 * Main Controller Patternの一部として設計
 */

import fs from 'fs';
import path from 'path';

export class CPUImpactAnalyzer {
    constructor(mainController) {
        this.mainController = mainController;
        this.performanceTargets = mainController.performanceTargets;
    }

    /**
     * CPU影響分析
     */
    async analyzeCPUImpact() {
        console.log('🖥️ Analyzing CPU impact...');

        const cpuIntensivePatterns = {
            'frequent DOM queries': await this.checkDOMQueries(),
            'heavy computations': await this.checkHeavyComputations(),
            'recursive operations': await this.checkRecursiveOperations(),
            'event listener efficiency': await this.checkEventListeners(),
            'animation optimizations': await this.checkAnimationOptimizations(),
            'rendering optimizations': await this.checkRenderingOptimizations(),
            'throttling mechanisms': await this.checkThrottling(),
            'worker thread usage': await this.checkWorkerThreads()
        };

        const optimizedPatterns = Object.values(cpuIntensivePatterns).filter(Boolean).length;
        const totalPatterns = Object.keys(cpuIntensivePatterns).length;
        const cpuScore = Math.round((optimizedPatterns / totalPatterns) * 100);

        return {
            status: cpuScore >= 80 ? 'EXCELLENT' : cpuScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
            score: cpuScore,
            estimatedCPUImpact: this.estimateCPUImpact(cpuScore),
            details: cpuIntensivePatterns,
            target: this.performanceTargets.cpuImpact,
            recommendations: this.generateCPURecommendations(cpuScore)
        };
    }

    /**
     * DOM クエリの効率性チェック
     */
    async checkDOMQueries() {
        const inefficientPatterns = [
            /document\.getElementById.*document\.getElementById/g, // 重複クエリ
            /querySelectorAll.*forEach/g, // 非効率な反復
            /getElementsBy.*length.*for/g // 長さを毎回計算
        ];

        const efficientPatterns = [
            /querySelector.*=.*cache/g, // キャッシュ使用
            /const.*element.*=/g, // 要素の変数化
            /documentFragment/g // DocumentFragment使用
        ];

        let inefficientCount = 0;
        let efficientCount = 0;

        const scanInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        scanInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        inefficientPatterns.forEach(pattern => {
                            const matches = content.match(pattern);
                            if (matches) inefficientCount += matches.length;
                        });

                        efficientPatterns.forEach(pattern => {
                            const matches = content.match(pattern);
                            if (matches) efficientCount += matches.length;
                        });
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        scanInDir(this.mainController.accessibilityDir);
        
        // 効率的なパターンが多いか、非効率なパターンが少ない場合はtrue
        return efficientCount > inefficientCount || inefficientCount <= 2;
    }

    /**
     * 重い計算処理のチェック
     */
    async checkHeavyComputations() {
        const heavyPatterns = [
            /for.*for.*for/g, // ネストしたループ
            /while.*while/g, // ネストした while
            /Math\.pow.*Math\.pow/g, // 重複する累乗計算
            /JSON\.parse.*JSON\.stringify/g, // 頻繁なシリアライゼーション
            /sort.*sort/g, // 重複ソート
            /filter.*filter/g // 重複フィルタ
        ];

        const optimizedPatterns = [
            /memoize|cache/g, // メモ化・キャッシュ
            /worker|Worker/g, // Web Worker使用
            /requestIdleCallback/g, // アイドルタイム活用
            /batch|chunk/g // バッチ処理
        ];

        let heavyCount = 0;
        let optimizedCount = 0;

        const scanInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        scanInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        heavyPatterns.forEach(pattern => {
                            const matches = content.match(pattern);
                            if (matches) heavyCount += matches.length;
                        });

                        optimizedPatterns.forEach(pattern => {
                            const matches = content.match(pattern);
                            if (matches) optimizedCount += matches.length;
                        });
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        scanInDir(this.mainController.accessibilityDir);
        
        // 重い処理が少ないか、最適化が実装されている場合はfalse（良い状態）
        return heavyCount <= 1 || optimizedCount > 0;
    }

    /**
     * 再帰処理のチェック
     */
    async checkRecursiveOperations() {
        const recursivePatterns = [
            /function.*\w+.*\w+\(/g, // 再帰関数の可能性
            /const.*=.*=>/g // 再帰アロー関数の可能性
        ];

        const optimizedRecursion = [
            /iterative|loop/g, // 反復処理への変換
            /memoize|memo/g, // メモ化最適化
            /tailRecursion|tail/g // 末尾再帰最適化
        ];

        let recursiveCount = 0;
        let optimizedCount = 0;

        const scanInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        scanInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        // 再帰の簡易検出（関数名が関数内で使用されているか）
                        const functionNames = content.match(/function\s+(\w+)/g);
                        if (functionNames) {
                            functionNames.forEach(funcDef => {
                                const funcName = funcDef.match(/function\s+(\w+)/)[1];
                                const regex = new RegExp(funcName, 'g');
                                const matches = content.match(regex);
                                if (matches && matches.length > 1) {
                                    recursiveCount++;
                                }
                            });
                        }

                        optimizedRecursion.forEach(pattern => {
                            const matches = content.match(pattern);
                            if (matches) optimizedCount += matches.length;
                        });
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        scanInDir(this.mainController.accessibilityDir);
        
        // 再帰が少ないか最適化されている場合はfalse（良い状態）
        return recursiveCount <= 2 || optimizedCount > 0;
    }

    /**
     * イベントリスナーの効率性チェック
     */
    async checkEventListeners() {
        const efficientPatterns = [
            /addEventListener.*\{.*once.*true/g, // once オプション使用
            /removeEventListener/g, // 適切なクリーンアップ
            /debounce|throttle/g, // デバウンス・スロットル
            /passive.*true/g, // passive リスナー
            /signal.*AbortSignal/g // AbortController使用
        ];

        let efficientCount = 0;
        let totalListeners = 0;

        const scanInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        scanInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        const listeners = content.match(/addEventListener/g);
                        if (listeners) totalListeners += listeners.length;

                        efficientPatterns.forEach(pattern => {
                            const matches = content.match(pattern);
                            if (matches) efficientCount += matches.length;
                        });
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        scanInDir(this.mainController.accessibilityDir);
        
        // 効率的なパターンが使用されている場合はtrue
        return totalListeners === 0 || efficientCount > 0;
    }

    /**
     * アニメーション最適化のチェック
     */
    async checkAnimationOptimizations() {
        const optimizedAnimations = [
            /requestAnimationFrame/g, // RAF使用
            /transform|translate/g, // GPU加速プロパティ
            /will-change/g, // will-change使用
            /animation.*duration/g, // duration指定
            /cubic-bezier/g // イージング関数
        ];

        const inefficientAnimations = [
            /setInterval.*animation/g, // setIntervalでのアニメーション
            /top|left|width|height.*=.*px/g, // レイアウト変更プロパティ
            /setTimeout.*loop/g // setTimeout ループ
        ];

        let optimizedCount = 0;
        let inefficientCount = 0;

        const scanInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        scanInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        optimizedAnimations.forEach(pattern => {
                            const matches = content.match(pattern);
                            if (matches) optimizedCount += matches.length;
                        });

                        inefficientAnimations.forEach(pattern => {
                            const matches = content.match(pattern);
                            if (matches) inefficientCount += matches.length;
                        });
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        scanInDir(this.mainController.accessibilityDir);
        
        // アニメーションがないか最適化されている場合はtrue
        return inefficientCount === 0 || optimizedCount > inefficientCount;
    }

    /**
     * レンダリング最適化のチェック
     */
    async checkRenderingOptimizations() {
        const optimizations = [
            /virtual|Virtual/g, // 仮想化
            /lazy|Lazy/g, // 遅延ローディング
            /memo|useMemo|useCallback/g, // メモ化
            /shouldComponentUpdate/g, // 更新最適化
            /batch|Batch/g // バッチ更新
        ];

        let optimizationCount = 0;

        const scanInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        scanInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        optimizations.forEach(pattern => {
                            const matches = content.match(pattern);
                            if (matches) optimizationCount += matches.length;
                        });
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        scanInDir(this.mainController.accessibilityDir);
        
        return optimizationCount > 0;
    }

    /**
     * スロットリングメカニズムのチェック
     */
    async checkThrottling() {
        const throttlingPatterns = [
            /debounce/g,
            /throttle/g,
            /requestAnimationFrame/g,
            /requestIdleCallback/g
        ];

        let throttlingCount = 0;

        const scanInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        scanInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        throttlingPatterns.forEach(pattern => {
                            const matches = content.match(pattern);
                            if (matches) throttlingCount += matches.length;
                        });
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        scanInDir(this.mainController.accessibilityDir);
        
        return throttlingCount > 0;
    }

    /**
     * ワーカースレッド使用のチェック
     */
    async checkWorkerThreads() {
        const workerPatterns = [
            /new Worker/g,
            /worker/g,
            /postMessage/g,
            /onmessage/g
        ];

        let workerCount = 0;

        const scanInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        scanInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        workerPatterns.forEach(pattern => {
                            const matches = content.match(pattern);
                            if (matches) workerCount += matches.length;
                        });
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        scanInDir(this.mainController.accessibilityDir);
        
        return workerCount > 0;
    }

    /**
     * CPU影響度の推定
     */
    estimateCPUImpact(score) {
        return score >= 80 ? '<5%' : score >= 60 ? '<15%' : '<25%';
    }

    /**
     * CPU推奨事項の生成
     */
    generateCPURecommendations(score) {
        const recommendations = [];
        if (score < 60) {
            recommendations.push('Implement throttling for heavy operations');
            recommendations.push('Move computations to web workers');
            recommendations.push('Optimize DOM queries and updates');
        }
        if (score < 80) {
            recommendations.push('Add performance monitoring');
            recommendations.push('Implement request animation frame optimization');
        }
        return recommendations;
    }

    /**
     * 詳細CPU分析の実行
     */
    async runDetailedCPUAnalysis() {
        const basicAnalysis = await this.analyzeCPUImpact();
        
        return {
            ...basicAnalysis,
            detailedMetrics: {
                functionComplexity: await this.analyzeFunctionComplexity(),
                loopOptimization: await this.analyzeLoopOptimization(),
                algorithmicComplexity: await this.estimateAlgorithmicComplexity(),
                concurrencyPatterns: await this.analyzeConcurrencyPatterns()
            },
            performanceBottlenecks: await this.identifyPerformanceBottlenecks(),
            optimizationOpportunities: await this.identifyOptimizationOpportunities(basicAnalysis.score)
        };
    }

    /**
     * 関数複雑性の分析
     */
    async analyzeFunctionComplexity() {
        const complexity = { simple: 0, moderate: 0, complex: 0, veryComplex: 0 };

        const analyzeInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        analyzeInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        // 関数の抽出と複雑度計算（簡易版）
                        const functions = content.match(/function[^{]*{[^}]*}|=>\s*{[^}]*}/g) || [];
                        functions.forEach(func => {
                            const cyclomaticComplexity = this.calculateCyclomaticComplexity(func);
                            if (cyclomaticComplexity <= 5) complexity.simple++;
                            else if (cyclomaticComplexity <= 10) complexity.moderate++;
                            else if (cyclomaticComplexity <= 20) complexity.complex++;
                            else complexity.veryComplex++;
                        });
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        analyzeInDir(this.mainController.accessibilityDir);
        
        const total = Object.values(complexity).reduce((sum, count) => sum + count, 0);
        return {
            complexity,
            averageComplexity: total > 0 ? 
                (complexity.simple * 1 + complexity.moderate * 2 + complexity.complex * 3 + complexity.veryComplex * 4) / total :
                0,
            qualityScore: total > 0 ? Math.round(((complexity.simple + complexity.moderate) / total) * 100) : 100
        };
    }

    /**
     * サイクロマティック複雑度の計算（簡易版）
     */
    calculateCyclomaticComplexity(functionCode) {
        const complexityKeywords = [
            /if\s*\(/g,
            /else\s+if/g,
            /while\s*\(/g,
            /for\s*\(/g,
            /catch\s*\(/g,
            /switch\s*\(/g,
            /case\s+/g,
            /&&/g,
            /\|\|/g,
            /\?.*:/g // 三項演算子
        ];

        let complexity = 1; // 基本複雑度
        
        complexityKeywords.forEach(pattern => {
            const matches = functionCode.match(pattern);
            if (matches) complexity += matches.length;
        });

        return complexity;
    }

    /**
     * ループ最適化の分析
     */
    async analyzeLoopOptimization() {
        const loops = {
            optimized: 0,
            unoptimized: 0,
            nested: 0
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
                        
                        // 最適化されたループ
                        const optimizedPatterns = [
                            /for\s*\(.*const.*of/g, // for-of loop
                            /forEach/g, // Array methods
                            /map|filter|reduce/g, // Functional methods
                            /for.*break/g // Early exit
                        ];

                        optimizedPatterns.forEach(pattern => {
                            const matches = content.match(pattern);
                            if (matches) loops.optimized += matches.length;
                        });

                        // 最適化されていないループ
                        const unoptimizedPatterns = [
                            /for\s*\(.*i.*length/g, // Traditional for loop with length
                            /while\s*\(.*true/g // Infinite while loops
                        ];

                        unoptimizedPatterns.forEach(pattern => {
                            const matches = content.match(pattern);
                            if (matches) loops.unoptimized += matches.length;
                        });

                        // ネストしたループ
                        const nestedLoops = content.match(/for.*for|while.*while|for.*while|while.*for/g);
                        if (nestedLoops) loops.nested += nestedLoops.length;
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        analyzeInDir(this.mainController.accessibilityDir);

        const total = loops.optimized + loops.unoptimized;
        return {
            loops,
            optimizationRatio: total > 0 ? Math.round((loops.optimized / total) * 100) : 100,
            nestedLoopRisk: loops.nested > 0 ? 'HIGH' : 'LOW'
        };
    }

    /**
     * アルゴリズム複雑度の推定
     */
    async estimateAlgorithmicComplexity() {
        const complexity = {
            constant: 0,    // O(1)
            logarithmic: 0, // O(log n)  
            linear: 0,      // O(n)
            quadratic: 0,   // O(n²)
            exponential: 0  // O(2^n)
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
                        
                        // O(1) - 定数時間
                        if (/\[.*\]|\.get\(|\.set\(/g.test(content)) complexity.constant++;
                        
                        // O(log n) - 対数時間
                        if (/binary.*search|divide.*2|log/gi.test(content)) complexity.logarithmic++;
                        
                        // O(n) - 線形時間
                        if (/forEach|map|filter|for.*of|for.*in/g.test(content)) complexity.linear++;
                        
                        // O(n²) - 二次時間
                        if (/for.*for|nested.*loop|bubble.*sort/gi.test(content)) complexity.quadratic++;
                        
                        // O(2^n) - 指数時間
                        if (/recursive.*recursive|fibonacci|power.*2/gi.test(content)) complexity.exponential++;
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        analyzeInDir(this.mainController.accessibilityDir);

        const total = Object.values(complexity).reduce((sum, count) => sum + count, 0);
        const efficiencyScore = total > 0 ? 
            Math.round(((complexity.constant * 100 + complexity.logarithmic * 80 + complexity.linear * 60 + complexity.quadratic * 30 + complexity.exponential * 10) / total / 100) * 100) :
            100;

        return {
            complexity,
            efficiencyScore,
            dominantComplexity: this.findDominantComplexity(complexity)
        };
    }

    /**
     * 支配的な複雑度の特定
     */
    findDominantComplexity(complexity) {
        const entries = Object.entries(complexity);
        entries.sort((a, b) => b[1] - a[1]);
        return entries[0][0];
    }

    /**
     * 並行処理パターンの分析
     */
    async analyzeConcurrencyPatterns() {
        const patterns = {
            promises: 0,
            asyncAwait: 0,
            parallelExecution: 0,
            webWorkers: 0,
            generators: 0
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
                        
                        patterns.promises += (content.match(/new Promise|Promise\./g) || []).length;
                        patterns.asyncAwait += (content.match(/async|await/g) || []).length;
                        patterns.parallelExecution += (content.match(/Promise\.all|Promise\.allSettled|Promise\.race/g) || []).length;
                        patterns.webWorkers += (content.match(/new Worker|postMessage/g) || []).length;
                        patterns.generators += (content.match(/function\*|yield/g) || []).length;
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        analyzeInDir(this.mainController.accessibilityDir);

        const total = Object.values(patterns).reduce((sum, count) => sum + count, 0);
        return {
            patterns,
            concurrencyScore: total,
            modernAsyncUsage: patterns.asyncAwait > patterns.promises,
            parallelizationLevel: patterns.parallelExecution > 0 ? 'HIGH' : patterns.asyncAwait > 0 ? 'MEDIUM' : 'LOW'
        };
    }

    /**
     * パフォーマンスボトルネックの特定
     */
    async identifyPerformanceBottlenecks() {
        const bottlenecks = [];

        // 同期処理のボトルネック検出
        const synchronousBlocking = await this.checkSynchronousBlocking();
        if (synchronousBlocking.length > 0) {
            bottlenecks.push({
                category: 'Synchronous Blocking',
                severity: 'HIGH',
                issues: synchronousBlocking
            });
        }

        // DOM操作のボトルネック検出
        const domBottlenecks = await this.checkDOMBottlenecks();
        if (domBottlenecks.length > 0) {
            bottlenecks.push({
                category: 'DOM Operations',
                severity: 'MEDIUM',
                issues: domBottlenecks
            });
        }

        return bottlenecks;
    }

    /**
     * 同期ブロッキング処理のチェック
     */
    async checkSynchronousBlocking() {
        const blocking = [];
        
        const scanInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        scanInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        if (/alert\(|confirm\(|prompt\(/g.test(content)) {
                            blocking.push(`Blocking dialogs in ${file.name}`);
                        }
                        if (/while\s*\(.*true.*\)/g.test(content)) {
                            blocking.push(`Infinite while loop in ${file.name}`);
                        }
                        if (/document\.write/g.test(content)) {
                            blocking.push(`document.write usage in ${file.name}`);
                        }
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        scanInDir(this.mainController.accessibilityDir);
        return blocking;
    }

    /**
     * DOMボトルネックのチェック
     */
    async checkDOMBottlenecks() {
        const bottlenecks = [];
        
        const scanInDir = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        scanInDir(filePath);
                    } else if (file.name.endsWith('.js')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        // 頻繁なDOM操作
                        const domQueries = (content.match(/querySelector|getElementById/g) || []).length;
                        if (domQueries > 10) {
                            bottlenecks.push(`Excessive DOM queries (${domQueries}) in ${file.name}`);
                        }

                        // スタイル変更
                        const styleChanges = (content.match(/\.style\./g) || []).length;
                        if (styleChanges > 5) {
                            bottlenecks.push(`Frequent style changes (${styleChanges}) in ${file.name}`);
                        }
                    }
                }
            } catch (error) {
                // ディレクトリが存在しない場合は無視
            }
        };

        scanInDir(this.mainController.accessibilityDir);
        return bottlenecks;
    }

    /**
     * 最適化機会の特定
     */
    async identifyOptimizationOpportunities(score) {
        const opportunities = [];

        if (score < 60) {
            opportunities.push({
                priority: 'HIGH',
                category: 'Algorithm Optimization',
                description: 'Replace O(n²) algorithms with more efficient alternatives'
            });
            opportunities.push({
                priority: 'HIGH',
                category: 'Concurrency',
                description: 'Implement Web Workers for CPU-intensive operations'
            });
        }

        if (score < 80) {
            opportunities.push({
                priority: 'MEDIUM',
                category: 'Caching',
                description: 'Add intelligent caching for computed results'
            });
            opportunities.push({
                priority: 'MEDIUM',
                category: 'Debouncing',
                description: 'Implement debouncing for frequent operations'
            });
        }

        return opportunities;
    }

    /**
     * ステータス取得
     */
    getStatus() {
        return {
            analyzerType: 'CPUImpactAnalyzer',
            target: this.performanceTargets.cpuImpact,
            checkCategories: [
                'DOM queries',
                'heavy computations',
                'recursive operations',
                'event listeners',
                'animations',
                'rendering',
                'throttling',
                'worker threads'
            ]
        };
    }
}