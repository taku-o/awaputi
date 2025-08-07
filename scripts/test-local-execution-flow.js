#!/usr/bin/env node
/**
 * Local Execution Flow Test Script
 * ローカル実行フローの完全テスト
 * 
 * Task 16: 最終統合とテスト
 * 
 * Usage:
 *   node scripts/test-local-execution-flow.js [options]
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LocalExecutionFlowTester {
    static projectRoot = path.resolve(__dirname, '..');

    /**
     * テスト設定
     */
    static TEST_CONFIG = {
        // 必要なファイルのチェック
        requiredFiles: [
            'index.html',
            'src/main.js',
            'src/utils/local-execution/LocalExecutionDetector.js',
            'src/utils/local-execution/LocalModeManager.js',
            'src/utils/local-execution/FaviconGenerator.js',
            'src/utils/local-execution/DeveloperGuidanceSystem.js',
            'src/utils/local-execution/BrowserCompatibilityManager.js',
            'src/utils/local-execution/LocalExecutionErrorHandler.js',
            'src/utils/local-execution/MetaTagOptimizer.js'
        ],

        // テストするfaviconファイル
        faviconFiles: [
            'favicon.ico',
            'favicon-16x16.png',
            'favicon-32x32.png',
            'favicon-192x192.png',
            'favicon-512x512.png'
        ],

        // HTMLチェック項目
        htmlChecks: {
            hasModuleScript: /<script[^>]+type=['"]module['"][^>]*>/,
            hasViewportMeta: /<meta[^>]+name=['"]viewport['"][^>]*>/,
            hasCharsetMeta: /<meta[^>]+charset[^>]*>/,
            hasDescription: /<meta[^>]+name=['"]description['"][^>]*>/,
            noProblematicXFrame: /<meta[^>]+http-equiv=['"]X-Frame-Options['"][^>]*>/
        }
    };

    /**
     * メインテスト実行
     */
    static async runTests(options = {}) {
        const results = {
            timestamp: new Date().toISOString(),
            projectRoot: this.projectRoot,
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
                score: 0
            },
            tests: [],
            recommendations: []
        };

        console.log('🧪 Local Execution Flow Tester');
        console.log(`📁 Project Root: ${this.projectRoot}`);
        console.log('');

        try {
            // 1. ファイル存在チェック
            await this._testFileExistence(results);

            // 2. HTML構造チェック
            await this._testHTMLStructure(results);

            // 3. Faviconファイルチェック
            await this._testFaviconFiles(results);

            // 4. JSモジュール構造チェック
            await this._testJavaScriptModules(results);

            // 5. 統合システムテスト
            await this._testIntegrationSystems(results);

            // 6. パフォーマンステスト
            await this._testPerformance(results);

            // 7. ブラウザ互換性チェック
            await this._testBrowserCompatibility(results);

            // 結果の集計
            this._calculateScore(results);

            // 結果出力
            this._outputResults(results, options);

        } catch (error) {
            console.error('❌ Test execution failed:', error);
            results.error = error.message;
        }

        return results;
    }

    /**
     * ファイル存在チェック
     * @private
     */
    static async _testFileExistence(results) {
        console.log('📋 Testing file existence...');

        for (const file of this.TEST_CONFIG.requiredFiles) {
            const filePath = path.join(this.projectRoot, file);
            const exists = fs.existsSync(filePath);

            const test = {
                category: 'file-existence',
                name: `File exists: ${file}`,
                passed: exists,
                critical: true,
                message: exists ? 'File exists' : `Missing file: ${file}`
            };

            results.tests.push(test);
            results.summary.totalTests++;

            if (exists) {
                results.summary.passed++;
            } else {
                results.summary.failed++;
                results.recommendations.push({
                    type: 'error',
                    message: `Missing critical file: ${file}`,
                    action: `Create the file at ${filePath}`
                });
            }
        }
    }

    /**
     * HTML構造チェック
     * @private
     */
    static async _testHTMLStructure(results) {
        console.log('🏗️ Testing HTML structure...');

        const indexPath = path.join(this.projectRoot, 'index.html');
        if (!fs.existsSync(indexPath)) {
            results.tests.push({
                category: 'html-structure',
                name: 'HTML file exists',
                passed: false,
                critical: true,
                message: 'index.html not found'
            });
            results.summary.totalTests++;
            results.summary.failed++;
            return;
        }

        try {
            const htmlContent = fs.readFileSync(indexPath, 'utf-8');

            for (const [checkName, pattern] of Object.entries(this.TEST_CONFIG.htmlChecks)) {
                const matches = pattern.test(htmlContent);
                const shouldMatch = !checkName.startsWith('no');
                const passed = shouldMatch ? matches : !matches;

                const test = {
                    category: 'html-structure',
                    name: `HTML check: ${checkName}`,
                    passed,
                    critical: checkName === 'hasModuleScript' || checkName === 'noProblematicXFrame',
                    message: passed ? 'Check passed' : `Check failed: ${checkName}`
                };

                results.tests.push(test);
                results.summary.totalTests++;

                if (passed) {
                    results.summary.passed++;
                } else {
                    results.summary.failed++;
                    
                    if (test.critical) {
                        results.recommendations.push({
                            type: 'error',
                            message: `Critical HTML structure issue: ${checkName}`,
                            action: this._getHTMLFixAction(checkName)
                        });
                    } else {
                        results.recommendations.push({
                            type: 'warning',
                            message: `HTML structure improvement needed: ${checkName}`,
                            action: this._getHTMLFixAction(checkName)
                        });
                    }
                }
            }

        } catch (error) {
            results.tests.push({
                category: 'html-structure',
                name: 'HTML content reading',
                passed: false,
                critical: true,
                message: `Error reading HTML: ${error.message}`
            });
            results.summary.totalTests++;
            results.summary.failed++;
        }
    }

    /**
     * Faviconファイルチェック
     * @private
     */
    static async _testFaviconFiles(results) {
        console.log('🎨 Testing favicon files...');

        let faviconCount = 0;
        for (const faviconFile of this.TEST_CONFIG.faviconFiles) {
            const faviconPath = path.join(this.projectRoot, faviconFile);
            const exists = fs.existsSync(faviconPath);

            const test = {
                category: 'favicon',
                name: `Favicon exists: ${faviconFile}`,
                passed: exists,
                critical: faviconFile === 'favicon.ico',
                message: exists ? 'Favicon exists' : `Missing favicon: ${faviconFile}`
            };

            if (exists) {
                faviconCount++;
                try {
                    const stats = fs.statSync(faviconPath);
                    test.size = stats.size;
                    test.sizeKB = Math.round(stats.size / 1024 * 10) / 10;
                    test.message += ` (${test.sizeKB} KB)`;
                } catch (error) {
                    test.message += ' (size check failed)';
                }
            }

            results.tests.push(test);
            results.summary.totalTests++;

            if (exists) {
                results.summary.passed++;
            } else if (test.critical) {
                results.summary.failed++;
                results.recommendations.push({
                    type: 'error',
                    message: `Missing critical favicon: ${faviconFile}`,
                    action: 'Generate favicons using npm run validate:favicon'
                });
            } else {
                results.summary.warnings++;
                results.recommendations.push({
                    type: 'warning',
                    message: `Missing optional favicon: ${faviconFile}`,
                    action: 'Generate favicons for better browser support'
                });
            }
        }

        // Favicon coverage test
        const coverageTest = {
            category: 'favicon',
            name: 'Favicon coverage',
            passed: faviconCount >= 2,
            critical: false,
            message: `Favicon coverage: ${faviconCount}/${this.TEST_CONFIG.faviconFiles.length}`,
            faviconCount
        };

        results.tests.push(coverageTest);
        results.summary.totalTests++;

        if (coverageTest.passed) {
            results.summary.passed++;
        } else {
            results.summary.warnings++;
            results.recommendations.push({
                type: 'info',
                message: 'Improve favicon coverage for better browser support',
                action: 'Run npm run validate:favicon to check and generate missing favicons'
            });
        }
    }

    /**
     * JavaScriptモジュールチェック
     * @private
     */
    static async _testJavaScriptModules(results) {
        console.log('📦 Testing JavaScript modules...');

        const mainJsPath = path.join(this.projectRoot, 'src/main.js');
        if (!fs.existsSync(mainJsPath)) {
            results.tests.push({
                category: 'js-modules',
                name: 'Main JS file exists',
                passed: false,
                critical: true,
                message: 'src/main.js not found'
            });
            results.summary.totalTests++;
            results.summary.failed++;
            return;
        }

        try {
            const mainJsContent = fs.readFileSync(mainJsPath, 'utf-8');

            // LocalModeManagerのインポートチェック
            const hasLocalModeImport = /LocalModeManager|LocalExecutionDetector/.test(mainJsContent);
            const importTest = {
                category: 'js-modules',
                name: 'Local execution imports',
                passed: hasLocalModeImport,
                critical: true,
                message: hasLocalModeImport ? 
                    'Local execution imports found' : 
                    'Local execution imports missing'
            };

            results.tests.push(importTest);
            results.summary.totalTests++;

            if (hasLocalModeImport) {
                results.summary.passed++;
            } else {
                results.summary.failed++;
                results.recommendations.push({
                    type: 'error',
                    message: 'Local execution system not integrated in main.js',
                    action: 'Add LocalModeManager import and initialization in main.js'
                });
            }

            // 各ローカル実行モジュールの構文チェック
            const localModules = [
                'LocalExecutionDetector',
                'LocalModeManager',
                'FaviconGenerator',
                'DeveloperGuidanceSystem',
                'LocalExecutionErrorHandler'
            ];

            for (const moduleName of localModules) {
                const modulePath = path.join(this.projectRoot, `src/utils/local-execution/${moduleName}.js`);
                
                if (fs.existsSync(modulePath)) {
                    try {
                        const moduleContent = fs.readFileSync(modulePath, 'utf-8');
                        const hasClass = new RegExp(`class ${moduleName}`).test(moduleContent);
                        const hasExport = new RegExp(`export.*${moduleName}`).test(moduleContent);

                        const moduleTest = {
                            category: 'js-modules',
                            name: `Module syntax: ${moduleName}`,
                            passed: hasClass && hasExport,
                            critical: false,
                            message: (hasClass && hasExport) ? 
                                'Module syntax OK' : 
                                'Module syntax issues detected'
                        };

                        results.tests.push(moduleTest);
                        results.summary.totalTests++;

                        if (moduleTest.passed) {
                            results.summary.passed++;
                        } else {
                            results.summary.warnings++;
                        }

                    } catch (error) {
                        results.tests.push({
                            category: 'js-modules',
                            name: `Module reading: ${moduleName}`,
                            passed: false,
                            critical: false,
                            message: `Error reading module: ${error.message}`
                        });
                        results.summary.totalTests++;
                        results.summary.warnings++;
                    }
                }
            }

        } catch (error) {
            results.tests.push({
                category: 'js-modules',
                name: 'Main JS content reading',
                passed: false,
                critical: true,
                message: `Error reading main.js: ${error.message}`
            });
            results.summary.totalTests++;
            results.summary.failed++;
        }
    }

    /**
     * 統合システムテスト
     * @private
     */
    static async _testIntegrationSystems(results) {
        console.log('🔧 Testing integration systems...');

        // package.jsonのスクリプトチェック
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                const scripts = packageJson.scripts || {};

                const requiredScripts = [
                    'validate:local-execution',
                    'validate:favicon',
                    'check:browser-compatibility'
                ];

                for (const script of requiredScripts) {
                    const hasScript = scripts.hasOwnProperty(script);
                    const test = {
                        category: 'integration',
                        name: `NPM script: ${script}`,
                        passed: hasScript,
                        critical: false,
                        message: hasScript ? 'Script available' : `Missing script: ${script}`
                    };

                    results.tests.push(test);
                    results.summary.totalTests++;

                    if (hasScript) {
                        results.summary.passed++;
                    } else {
                        results.summary.warnings++;
                        results.recommendations.push({
                            type: 'warning',
                            message: `Missing npm script: ${script}`,
                            action: 'Add the script to package.json for better development experience'
                        });
                    }
                }

            } catch (error) {
                results.tests.push({
                    category: 'integration',
                    name: 'Package.json reading',
                    passed: false,
                    critical: false,
                    message: `Error reading package.json: ${error.message}`
                });
                results.summary.totalTests++;
                results.summary.warnings++;
            }
        }
    }

    /**
     * パフォーマンステスト
     * @private
     */
    static async _testPerformance(results) {
        console.log('⚡ Testing performance aspects...');

        // ファイルサイズチェック
        const criticalFiles = [
            'src/utils/local-execution/LocalModeManager.js',
            'src/utils/local-execution/LocalExecutionErrorHandler.js',
            'src/utils/local-execution/FaviconGenerator.js'
        ];

        for (const file of criticalFiles) {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                try {
                    const stats = fs.statSync(filePath);
                    const sizeKB = Math.round(stats.size / 1024 * 10) / 10;
                    
                    // 合理的なファイルサイズかチェック（50KB以下を推奨）
                    const test = {
                        category: 'performance',
                        name: `File size: ${file}`,
                        passed: sizeKB <= 50,
                        critical: false,
                        message: `File size: ${sizeKB} KB`,
                        size: stats.size,
                        sizeKB
                    };

                    results.tests.push(test);
                    results.summary.totalTests++;

                    if (test.passed) {
                        results.summary.passed++;
                    } else {
                        results.summary.warnings++;
                        results.recommendations.push({
                            type: 'warning',
                            message: `Large file detected: ${file} (${sizeKB} KB)`,
                            action: 'Consider code splitting or optimization'
                        });
                    }

                } catch (error) {
                    // ファイルサイズチェックのエラーは警告として扱う
                    results.summary.warnings++;
                }
            }
        }
    }

    /**
     * ブラウザ互換性チェック
     * @private
     */
    static async _testBrowserCompatibility(results) {
        console.log('🌐 Testing browser compatibility...');

        // BrowserCompatibilityManagerファイルの存在チェック
        const compatibilityManagerPath = path.join(
            this.projectRoot, 
            'src/utils/local-execution/BrowserCompatibilityManager.js'
        );

        const test = {
            category: 'browser-compatibility',
            name: 'BrowserCompatibilityManager exists',
            passed: fs.existsSync(compatibilityManagerPath),
            critical: true,
            message: fs.existsSync(compatibilityManagerPath) ? 
                'BrowserCompatibilityManager available' : 
                'BrowserCompatibilityManager missing'
        };

        results.tests.push(test);
        results.summary.totalTests++;

        if (test.passed) {
            results.summary.passed++;

            // 内容の基本チェック
            try {
                const content = fs.readFileSync(compatibilityManagerPath, 'utf-8');
                const features = ['getBrowserInfo', 'getCanvasSupport', 'getLocalStorageSupport'];
                
                for (const feature of features) {
                    const hasFeature = content.includes(feature);
                    const featureTest = {
                        category: 'browser-compatibility',
                        name: `Compatibility feature: ${feature}`,
                        passed: hasFeature,
                        critical: false,
                        message: hasFeature ? 'Feature available' : `Feature missing: ${feature}`
                    };

                    results.tests.push(featureTest);
                    results.summary.totalTests++;

                    if (hasFeature) {
                        results.summary.passed++;
                    } else {
                        results.summary.warnings++;
                    }
                }

            } catch (error) {
                results.summary.warnings++;
            }

        } else {
            results.summary.failed++;
            results.recommendations.push({
                type: 'error',
                message: 'BrowserCompatibilityManager is missing',
                action: 'Create BrowserCompatibilityManager for fallback support'
            });
        }
    }

    /**
     * スコア計算
     * @private
     */
    static _calculateScore(results) {
        const { totalTests, passed, failed, warnings } = results.summary;
        
        if (totalTests === 0) {
            results.summary.score = 0;
            return;
        }

        // 重要度に基づいてスコア計算
        const criticalTests = results.tests.filter(t => t.critical);
        const criticalPassed = criticalTests.filter(t => t.passed).length;
        const criticalTotal = criticalTests.length;

        const criticalScore = criticalTotal > 0 ? (criticalPassed / criticalTotal) * 70 : 0;
        const overallScore = ((passed - failed) / totalTests) * 30;
        
        results.summary.score = Math.max(0, Math.min(100, Math.round(criticalScore + overallScore)));
    }

    /**
     * HTML修正アクション取得
     * @private
     */
    static _getHTMLFixAction(checkName) {
        const actions = {
            hasModuleScript: 'Add <script type="module" src="src/main.js"></script> to HTML',
            hasViewportMeta: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            hasCharsetMeta: 'Add <meta charset="UTF-8"> to HTML head',
            hasDescription: 'Add <meta name="description" content="..."> to HTML head',
            noProblematicXFrame: 'Remove <meta http-equiv="X-Frame-Options"> from HTML head'
        };

        return actions[checkName] || 'Fix HTML structure issue';
    }

    /**
     * 結果出力
     * @private
     */
    static _outputResults(results, options = {}) {
        console.log('');
        console.log('📊 Local Execution Flow Test Results');
        console.log('=====================================');
        console.log(`Total Tests: ${results.summary.totalTests}`);
        console.log(`✅ Passed: ${results.summary.passed}`);
        console.log(`❌ Failed: ${results.summary.failed}`);
        console.log(`⚠️ Warnings: ${results.summary.warnings}`);
        console.log(`🏆 Score: ${results.summary.score}/100`);
        console.log('');

        // 評価表示
        const grade = this._getGrade(results.summary.score);
        console.log(`📈 Grade: ${grade.emoji} ${grade.letter} (${grade.description})`);
        console.log('');

        // 失敗とエラーの詳細
        const failedTests = results.tests.filter(t => !t.passed && t.critical);
        if (failedTests.length > 0) {
            console.log('🚨 Critical Issues:');
            failedTests.forEach(test => {
                console.log(`   ❌ ${test.name}: ${test.message}`);
            });
            console.log('');
        }

        // 推奨事項
        if (results.recommendations.length > 0) {
            const errors = results.recommendations.filter(r => r.type === 'error');
            const warnings = results.recommendations.filter(r => r.type === 'warning');
            const info = results.recommendations.filter(r => r.type === 'info');

            if (errors.length > 0) {
                console.log('🚨 Critical Recommendations:');
                errors.forEach((rec, i) => {
                    console.log(`   ${i + 1}. ${rec.message}`);
                    console.log(`      Action: ${rec.action}`);
                });
                console.log('');
            }

            if (warnings.length > 0 && options.verbose) {
                console.log('⚠️ Improvements:');
                warnings.forEach((rec, i) => {
                    console.log(`   ${i + 1}. ${rec.message}`);
                    console.log(`      Action: ${rec.action}`);
                });
                console.log('');
            }
        }

        // 詳細結果（verbose モード）
        if (options.verbose) {
            console.log('📋 Detailed Test Results');
            console.log('========================');
            
            const categorized = {};
            results.tests.forEach(test => {
                if (!categorized[test.category]) {
                    categorized[test.category] = [];
                }
                categorized[test.category].push(test);
            });

            Object.keys(categorized).forEach(category => {
                console.log(`\n📁 ${category.toUpperCase()}:`);
                categorized[category].forEach(test => {
                    const icon = test.passed ? '✅' : test.critical ? '❌' : '⚠️';
                    console.log(`   ${icon} ${test.name}: ${test.message}`);
                });
            });
        }

        // JSON出力（オプション）
        if (options.outputFile) {
            try {
                fs.writeFileSync(options.outputFile, JSON.stringify(results, null, 2));
                console.log(`💾 Results saved to: ${options.outputFile}`);
            } catch (error) {
                console.error(`❌ Failed to save results: ${error.message}`);
            }
        }

        // 最終メッセージ
        if (results.summary.score >= 90) {
            console.log('🎉 Excellent! Local execution flow is fully ready.');
        } else if (results.summary.score >= 70) {
            console.log('👍 Good! Local execution flow is mostly ready with minor improvements needed.');
        } else if (results.summary.score >= 50) {
            console.log('⚠️ Fair. Several improvements needed for optimal local execution.');
        } else {
            console.log('🚨 Critical issues found. Local execution may not work properly.');
        }
    }

    /**
     * 評価グレード取得
     * @private
     */
    static _getGrade(score) {
        if (score >= 90) return { letter: 'A+', emoji: '🏆', description: 'Excellent local execution setup' };
        if (score >= 80) return { letter: 'A', emoji: '🥇', description: 'Great local execution ready' };
        if (score >= 70) return { letter: 'B+', emoji: '🥈', description: 'Good local execution setup' };
        if (score >= 60) return { letter: 'B', emoji: '👍', description: 'Adequate local execution' };
        if (score >= 50) return { letter: 'C+', emoji: '⚠️', description: 'Basic local execution' };
        if (score >= 40) return { letter: 'C', emoji: '🔧', description: 'Needs improvement' };
        return { letter: 'F', emoji: '❌', description: 'Critical issues' };
    }
}

// CLI実行部分
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const options = {};
    
    // CLI引数の解析
    args.forEach(arg => {
        if (arg === '--verbose' || arg === '-v') {
            options.verbose = true;
        } else if (arg.startsWith('--output=')) {
            options.outputFile = arg.substring(9);
        } else if (arg === '--help' || arg === '-h') {
            console.log('Local Execution Flow Tester');
            console.log('Usage: node scripts/test-local-execution-flow.js [options]');
            console.log('');
            console.log('Options:');
            console.log('  --verbose, -v     Show detailed test results');
            console.log('  --output=FILE     Save results to JSON file');
            console.log('  --help, -h        Show this help');
            console.log('');
            console.log('This script tests the complete local execution flow including:');
            console.log('- File existence and structure validation');
            console.log('- HTML structure and meta tags');
            console.log('- Favicon files and coverage');
            console.log('- JavaScript modules and imports');
            console.log('- Integration systems and npm scripts');
            console.log('- Performance and compatibility checks');
            process.exit(0);
        }
    });
    
    // テスト実行
    LocalExecutionFlowTester.runTests(options)
        .then(results => {
            const hasErrors = results.summary.failed > 0;
            process.exit(hasErrors ? 1 : 0);
        })
        .catch(error => {
            console.error('❌ Test execution failed:', error);
            process.exit(1);
        });
}

export default LocalExecutionFlowTester;