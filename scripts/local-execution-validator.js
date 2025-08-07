#!/usr/bin/env node
/**
 * Local Execution Validator Script
 * ローカル実行環境の検証・テストスクリプト
 * 
 * ローカルファイル実行時の問題を事前に検証し、
 * 不足しているファイルや設定の問題を特定します。
 * 
 * Usage: 
 *   node scripts/local-execution-validator.js [options]
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LocalExecutionValidator {
    /**
     * 検証対象ファイル設定
     */
    static VALIDATION_CONFIG = {
        requiredFiles: [
            'index.html',
            'src/main.js',
            'src/utils/local-execution/LocalExecutionDetector.js',
            'src/utils/local-execution/LocalModeManager.js',
            'src/utils/local-execution/FaviconGenerator.js',
            'src/utils/local-execution/DeveloperGuidanceSystem.js',
            'src/utils/local-execution/MetaTagOptimizer.js',
            'src/utils/local-execution/BrowserCompatibilityManager.js',
            'src/utils/local-execution/LocalExecutionErrorHandler.js'
        ],
        
        optionalFiles: [
            'favicon.ico',
            'favicon-16x16.png',
            'favicon-32x32.png',
            'favicon-192x192.png',
            'favicon-512x512.png'
        ],
        
        htmlChecks: {
            requiredMetaTags: [
                'viewport',
                'description',
                'charset'
            ],
            problematicMetaTags: [
                'X-Frame-Options',
                'Content-Security-Policy'
            ]
        },

        jsModuleChecks: {
            requiresESModules: true,
            checkImportPaths: true,
            validateSyntax: true
        }
    };

    /**
     * プロジェクトルートディレクトリ
     */
    static projectRoot = path.resolve(__dirname, '..');

    /**
     * メイン検証実行
     */
    static async validate(options = {}) {
        const results = {
            timestamp: new Date().toISOString(),
            projectRoot: this.projectRoot,
            summary: {
                totalChecks: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            },
            checks: [],
            recommendations: []
        };

        console.log('🔍 Local Execution Validator');
        console.log(`📁 Project Root: ${this.projectRoot}`);
        console.log('');

        try {
            // 1. ファイル存在チェック
            await this._checkFileExistence(results);
            
            // 2. HTML構造チェック
            await this._checkHTMLStructure(results);
            
            // 3. JavaScript モジュールチェック
            await this._checkJavaScriptModules(results);
            
            // 4. ファビコン関連チェック
            await this._checkFaviconFiles(results);
            
            // 5. ブラウザ互換性チェック
            await this._checkBrowserCompatibility(results);
            
            // 6. パフォーマンス設定チェック
            await this._checkPerformanceSettings(results);

            // 結果出力
            this._outputResults(results, options);

        } catch (error) {
            console.error('❌ Validation failed:', error);
            results.error = error.message;
        }

        return results;
    }

    /**
     * ファイル存在チェック
     * @private
     */
    static async _checkFileExistence(results) {
        console.log('📋 Checking file existence...');
        
        // 必須ファイルチェック
        for (const file of this.VALIDATION_CONFIG.requiredFiles) {
            const filePath = path.join(this.projectRoot, file);
            const exists = fs.existsSync(filePath);
            
            const check = {
                category: 'file-existence',
                type: 'required',
                file,
                path: filePath,
                passed: exists,
                message: exists ? `✅ Required file exists` : `❌ Required file missing`
            };

            results.checks.push(check);
            results.summary.totalChecks++;
            
            if (exists) {
                results.summary.passed++;
            } else {
                results.summary.failed++;
                results.recommendations.push({
                    type: 'error',
                    message: `Missing required file: ${file}`,
                    action: `Create the file at ${filePath}`
                });
            }
        }

        // オプションファイルチェック
        for (const file of this.VALIDATION_CONFIG.optionalFiles) {
            const filePath = path.join(this.projectRoot, file);
            const exists = fs.existsSync(filePath);
            
            const check = {
                category: 'file-existence',
                type: 'optional',
                file,
                path: filePath,
                passed: exists,
                warning: !exists,
                message: exists ? `✅ Optional file exists` : `⚠️ Optional file missing`
            };

            results.checks.push(check);
            results.summary.totalChecks++;
            
            if (exists) {
                results.summary.passed++;
            } else {
                results.summary.warnings++;
                results.recommendations.push({
                    type: 'warning',
                    message: `Missing optional file: ${file}`,
                    action: `Consider creating ${file} for better favicon support`
                });
            }
        }
    }

    /**
     * HTML構造チェック
     * @private
     */
    static async _checkHTMLStructure(results) {
        console.log('🏗️ Checking HTML structure...');
        
        const indexPath = path.join(this.projectRoot, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            results.checks.push({
                category: 'html-structure',
                passed: false,
                message: '❌ index.html not found for HTML structure check'
            });
            results.summary.totalChecks++;
            results.summary.failed++;
            return;
        }

        try {
            const htmlContent = fs.readFileSync(indexPath, 'utf-8');
            
            // メタタグチェック
            for (const metaTag of this.VALIDATION_CONFIG.htmlChecks.requiredMetaTags) {
                const hasMetaTag = htmlContent.includes(`name="${metaTag}"`) || 
                                  htmlContent.includes(`charset`) ||
                                  htmlContent.includes('viewport');
                
                const check = {
                    category: 'html-structure',
                    type: 'meta-tag',
                    tag: metaTag,
                    passed: hasMetaTag,
                    message: hasMetaTag ? `✅ Meta tag ${metaTag} found` : `❌ Meta tag ${metaTag} missing`
                };

                results.checks.push(check);
                results.summary.totalChecks++;
                
                if (hasMetaTag) {
                    results.summary.passed++;
                } else {
                    results.summary.failed++;
                    results.recommendations.push({
                        type: 'warning',
                        message: `Add missing meta tag: ${metaTag}`,
                        action: `Include <meta name="${metaTag}" content="..."> in <head>`
                    });
                }
            }

            // 問題のあるメタタグチェック
            for (const metaTag of this.VALIDATION_CONFIG.htmlChecks.problematicMetaTags) {
                const hasProblematicTag = htmlContent.includes(`http-equiv="${metaTag}"`);
                
                const check = {
                    category: 'html-structure',
                    type: 'problematic-meta',
                    tag: metaTag,
                    passed: !hasProblematicTag,
                    warning: hasProblematicTag,
                    message: hasProblematicTag ? `⚠️ Problematic meta tag ${metaTag} found` : `✅ No problematic ${metaTag} meta tag`
                };

                results.checks.push(check);
                results.summary.totalChecks++;
                
                if (!hasProblematicTag) {
                    results.summary.passed++;
                } else {
                    results.summary.warnings++;
                    results.recommendations.push({
                        type: 'warning',
                        message: `Problematic meta tag found: ${metaTag}`,
                        action: `Remove or modify meta tag to avoid local file execution issues`
                    });
                }
            }

            // ES6 モジュール script タグチェック
            const hasModuleScript = htmlContent.includes('type="module"');
            const check = {
                category: 'html-structure',
                type: 'module-script',
                passed: hasModuleScript,
                message: hasModuleScript ? `✅ ES6 module script found` : `❌ ES6 module script missing`
            };

            results.checks.push(check);
            results.summary.totalChecks++;
            
            if (hasModuleScript) {
                results.summary.passed++;
            } else {
                results.summary.failed++;
                results.recommendations.push({
                    type: 'error',
                    message: 'Missing ES6 module script tag',
                    action: 'Add <script type="module" src="src/main.js"></script> to HTML'
                });
            }

        } catch (error) {
            results.checks.push({
                category: 'html-structure',
                passed: false,
                error: error.message,
                message: `❌ Error reading index.html: ${error.message}`
            });
            results.summary.totalChecks++;
            results.summary.failed++;
        }
    }

    /**
     * JavaScript モジュールチェック
     * @private
     */
    static async _checkJavaScriptModules(results) {
        console.log('📦 Checking JavaScript modules...');
        
        const mainJsPath = path.join(this.projectRoot, 'src/main.js');
        
        if (!fs.existsSync(mainJsPath)) {
            results.checks.push({
                category: 'js-modules',
                passed: false,
                message: '❌ src/main.js not found for module check'
            });
            results.summary.totalChecks++;
            results.summary.failed++;
            return;
        }

        try {
            const mainJsContent = fs.readFileSync(mainJsPath, 'utf-8');
            
            // LocalModeManager のインポートチェック
            const hasLocalModeImport = mainJsContent.includes('LocalModeManager') || 
                                      mainJsContent.includes('LocalExecutionDetector');
            
            const check = {
                category: 'js-modules',
                type: 'local-mode-import',
                passed: hasLocalModeImport,
                message: hasLocalModeImport ? `✅ Local mode imports found` : `❌ Local mode imports missing`
            };

            results.checks.push(check);
            results.summary.totalChecks++;
            
            if (hasLocalModeImport) {
                results.summary.passed++;
            } else {
                results.summary.failed++;
                results.recommendations.push({
                    type: 'error',
                    message: 'Local mode manager not imported in main.js',
                    action: 'Add import for LocalModeManager or LocalExecutionDetector'
                });
            }

            // 各ローカル実行モジュールのチェック
            const localModules = [
                'LocalExecutionDetector',
                'LocalModeManager',
                'FaviconGenerator',
                'DeveloperGuidanceSystem'
            ];

            for (const moduleName of localModules) {
                const modulePath = path.join(this.projectRoot, `src/utils/local-execution/${moduleName}.js`);
                
                if (fs.existsSync(modulePath)) {
                    try {
                        const moduleContent = fs.readFileSync(modulePath, 'utf-8');
                        
                        // 基本的な構文チェック
                        const hasClass = moduleContent.includes(`class ${moduleName}`);
                        const hasExport = moduleContent.includes(`export default ${moduleName}`);
                        
                        const moduleCheck = {
                            category: 'js-modules',
                            type: 'module-syntax',
                            module: moduleName,
                            passed: hasClass && hasExport,
                            message: (hasClass && hasExport) ? 
                                `✅ Module ${moduleName} syntax OK` : 
                                `❌ Module ${moduleName} syntax issues`
                        };

                        results.checks.push(moduleCheck);
                        results.summary.totalChecks++;
                        
                        if (hasClass && hasExport) {
                            results.summary.passed++;
                        } else {
                            results.summary.failed++;
                            results.recommendations.push({
                                type: 'error',
                                message: `Module syntax issues in ${moduleName}`,
                                action: 'Ensure proper class declaration and default export'
                            });
                        }
                        
                    } catch (error) {
                        results.checks.push({
                            category: 'js-modules',
                            type: 'module-syntax',
                            module: moduleName,
                            passed: false,
                            error: error.message,
                            message: `❌ Error reading ${moduleName}: ${error.message}`
                        });
                        results.summary.totalChecks++;
                        results.summary.failed++;
                    }
                }
            }

        } catch (error) {
            results.checks.push({
                category: 'js-modules',
                passed: false,
                error: error.message,
                message: `❌ Error checking JavaScript modules: ${error.message}`
            });
            results.summary.totalChecks++;
            results.summary.failed++;
        }
    }

    /**
     * ファビコンファイルチェック
     * @private
     */
    static async _checkFaviconFiles(results) {
        console.log('🎨 Checking favicon files...');
        
        const faviconFiles = [
            { file: 'favicon.ico', required: true },
            { file: 'favicon-16x16.png', required: false },
            { file: 'favicon-32x32.png', required: false },
            { file: 'favicon-192x192.png', required: false },
            { file: 'favicon-512x512.png', required: false }
        ];

        let faviconCount = 0;

        for (const { file, required } of faviconFiles) {
            const faviconPath = path.join(this.projectRoot, file);
            const exists = fs.existsSync(faviconPath);
            
            if (exists) {
                faviconCount++;
                
                // ファイルサイズチェック
                try {
                    const stats = fs.statSync(faviconPath);
                    const sizeKB = Math.round(stats.size / 1024);
                    
                    const check = {
                        category: 'favicon-files',
                        type: 'favicon-exists',
                        file,
                        passed: true,
                        size: stats.size,
                        sizeKB,
                        message: `✅ Favicon ${file} exists (${sizeKB} KB)`
                    };

                    results.checks.push(check);
                    results.summary.totalChecks++;
                    results.summary.passed++;
                    
                } catch (error) {
                    results.checks.push({
                        category: 'favicon-files',
                        type: 'favicon-exists',
                        file,
                        passed: false,
                        error: error.message,
                        message: `❌ Error checking favicon ${file}: ${error.message}`
                    });
                    results.summary.totalChecks++;
                    results.summary.failed++;
                }
            } else {
                const check = {
                    category: 'favicon-files',
                    type: 'favicon-missing',
                    file,
                    passed: !required,
                    warning: !required,
                    failed: required,
                    message: required ? `❌ Required favicon ${file} missing` : `⚠️ Optional favicon ${file} missing`
                };

                results.checks.push(check);
                results.summary.totalChecks++;
                
                if (required) {
                    results.summary.failed++;
                    results.recommendations.push({
                        type: 'error',
                        message: `Required favicon missing: ${file}`,
                        action: 'Generate favicon files using tools/generate-favicons.js'
                    });
                } else {
                    results.summary.warnings++;
                    results.recommendations.push({
                        type: 'warning',
                        message: `Optional favicon missing: ${file}`,
                        action: 'Consider generating for better mobile support'
                    });
                }
            }
        }

        // ファビコンファイル総合評価
        const faviconCheck = {
            category: 'favicon-files',
            type: 'favicon-summary',
            passed: faviconCount >= 2, // 最低2個は欲しい
            faviconCount,
            totalPossible: faviconFiles.length,
            message: faviconCount >= 3 ? 
                `✅ Good favicon coverage (${faviconCount}/${faviconFiles.length})` :
                faviconCount >= 2 ?
                `⚠️ Basic favicon coverage (${faviconCount}/${faviconFiles.length})` :
                `❌ Poor favicon coverage (${faviconCount}/${faviconFiles.length})`
        };

        results.checks.push(faviconCheck);
        results.summary.totalChecks++;
        
        if (faviconCount >= 2) {
            results.summary.passed++;
        } else {
            results.summary.failed++;
        }

        if (faviconCount < 3) {
            results.recommendations.push({
                type: 'info',
                message: 'Improve favicon coverage for better browser support',
                action: 'Run: node tools/generate-favicons.js to create missing favicons'
            });
        }
    }

    /**
     * ブラウザ互換性チェック
     * @private
     */
    static async _checkBrowserCompatibility(results) {
        console.log('🌐 Checking browser compatibility setup...');
        
        const compatibilityManagerPath = path.join(this.projectRoot, 'src/utils/local-execution/BrowserCompatibilityManager.js');
        const exists = fs.existsSync(compatibilityManagerPath);
        
        const check = {
            category: 'browser-compatibility',
            type: 'compatibility-manager',
            passed: exists,
            message: exists ? `✅ BrowserCompatibilityManager exists` : `❌ BrowserCompatibilityManager missing`
        };

        results.checks.push(check);
        results.summary.totalChecks++;
        
        if (exists) {
            results.summary.passed++;
            
            // ファイル内容の基本チェック
            try {
                const content = fs.readFileSync(compatibilityManagerPath, 'utf-8');
                
                const features = ['getBrowserInfo', 'getCanvasSupport', 'getLocalStorageSupport', 'implementCanvasFallback'];
                
                for (const feature of features) {
                    const hasFeature = content.includes(feature);
                    
                    const featureCheck = {
                        category: 'browser-compatibility',
                        type: 'compatibility-feature',
                        feature,
                        passed: hasFeature,
                        message: hasFeature ? `✅ Feature ${feature} implemented` : `❌ Feature ${feature} missing`
                    };

                    results.checks.push(featureCheck);
                    results.summary.totalChecks++;
                    
                    if (hasFeature) {
                        results.summary.passed++;
                    } else {
                        results.summary.failed++;
                    }
                }
                
            } catch (error) {
                results.checks.push({
                    category: 'browser-compatibility',
                    type: 'compatibility-content',
                    passed: false,
                    error: error.message,
                    message: `❌ Error reading BrowserCompatibilityManager: ${error.message}`
                });
                results.summary.totalChecks++;
                results.summary.failed++;
            }
        } else {
            results.summary.failed++;
            results.recommendations.push({
                type: 'error',
                message: 'BrowserCompatibilityManager not found',
                action: 'Create BrowserCompatibilityManager.js for browser fallback support'
            });
        }
    }

    /**
     * パフォーマンス設定チェック
     * @private
     */
    static async _checkPerformanceSettings(results) {
        console.log('⚡ Checking performance settings...');
        
        // FaviconGenerator のパフォーマンス設定チェック
        const faviconGenPath = path.join(this.projectRoot, 'src/utils/local-execution/FaviconGenerator.js');
        
        if (fs.existsSync(faviconGenPath)) {
            try {
                const content = fs.readFileSync(faviconGenPath, 'utf-8');
                
                const performanceFeatures = [
                    'PERFORMANCE_CONFIG',
                    'lazyLoadingEnabled',
                    'batchProcessing',
                    'memoryCleanupEnabled'
                ];
                
                let performanceScore = 0;
                
                for (const feature of performanceFeatures) {
                    if (content.includes(feature)) {
                        performanceScore++;
                    }
                }
                
                const performanceCheck = {
                    category: 'performance-settings',
                    type: 'favicon-performance',
                    passed: performanceScore >= 3,
                    score: performanceScore,
                    maxScore: performanceFeatures.length,
                    message: performanceScore >= 3 ? 
                        `✅ Good performance configuration (${performanceScore}/${performanceFeatures.length})` : 
                        `⚠️ Limited performance configuration (${performanceScore}/${performanceFeatures.length})`
                };

                results.checks.push(performanceCheck);
                results.summary.totalChecks++;
                
                if (performanceScore >= 3) {
                    results.summary.passed++;
                } else {
                    results.summary.warnings++;
                    results.recommendations.push({
                        type: 'info',
                        message: 'Consider enabling more performance optimizations',
                        action: 'Review FaviconGenerator performance configuration'
                    });
                }
                
            } catch (error) {
                results.checks.push({
                    category: 'performance-settings',
                    type: 'favicon-performance',
                    passed: false,
                    error: error.message,
                    message: `❌ Error checking performance settings: ${error.message}`
                });
                results.summary.totalChecks++;
                results.summary.failed++;
            }
        }
    }

    /**
     * 結果出力
     * @private
     */
    static _outputResults(results, options = {}) {
        console.log('');
        console.log('📊 Validation Results');
        console.log('=====================');
        console.log(`Total Checks: ${results.summary.totalChecks}`);
        console.log(`✅ Passed: ${results.summary.passed}`);
        console.log(`❌ Failed: ${results.summary.failed}`);
        console.log(`⚠️ Warnings: ${results.summary.warnings}`);
        
        const successRate = results.summary.totalChecks > 0 ? 
            Math.round((results.summary.passed / results.summary.totalChecks) * 100) : 0;
        console.log(`📈 Success Rate: ${successRate}%`);
        console.log('');

        // 推奨事項出力
        if (results.recommendations.length > 0) {
            console.log('💡 Recommendations');
            console.log('==================');
            
            const errors = results.recommendations.filter(r => r.type === 'error');
            const warnings = results.recommendations.filter(r => r.type === 'warning');
            const info = results.recommendations.filter(r => r.type === 'info');
            
            if (errors.length > 0) {
                console.log('🚨 Critical Issues:');
                errors.forEach((rec, i) => {
                    console.log(`   ${i + 1}. ${rec.message}`);
                    console.log(`      Action: ${rec.action}`);
                });
                console.log('');
            }
            
            if (warnings.length > 0) {
                console.log('⚠️ Warnings:');
                warnings.forEach((rec, i) => {
                    console.log(`   ${i + 1}. ${rec.message}`);
                    console.log(`      Action: ${rec.action}`);
                });
                console.log('');
            }
            
            if (info.length > 0 && options.showInfo !== false) {
                console.log('ℹ️ Suggestions:');
                info.forEach((rec, i) => {
                    console.log(`   ${i + 1}. ${rec.message}`);
                    console.log(`      Action: ${rec.action}`);
                });
                console.log('');
            }
        }

        // 詳細結果（オプション）
        if (options.verbose) {
            console.log('📋 Detailed Results');
            console.log('==================');
            
            const categorized = {};
            results.checks.forEach(check => {
                if (!categorized[check.category]) {
                    categorized[check.category] = [];
                }
                categorized[check.category].push(check);
            });

            Object.keys(categorized).forEach(category => {
                console.log(`\n📁 ${category}:`);
                categorized[category].forEach(check => {
                    console.log(`   ${check.message}`);
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
        } else if (arg === '--quiet' || arg === '-q') {
            options.showInfo = false;
        } else if (arg.startsWith('--output=')) {
            options.outputFile = arg.substring(9);
        } else if (arg === '--help' || arg === '-h') {
            console.log('Local Execution Validator');
            console.log('Usage: node scripts/local-execution-validator.js [options]');
            console.log('');
            console.log('Options:');
            console.log('  --verbose, -v     Show detailed results');
            console.log('  --quiet, -q       Hide suggestions');
            console.log('  --output=FILE     Save results to JSON file');
            console.log('  --help, -h        Show this help');
            process.exit(0);
        }
    });
    
    // 検証実行
    LocalExecutionValidator.validate(options)
        .then(results => {
            const hasErrors = results.summary.failed > 0;
            process.exit(hasErrors ? 1 : 0);
        })
        .catch(error => {
            console.error('❌ Validation failed:', error);
            process.exit(1);
        });
}

export default LocalExecutionValidator;