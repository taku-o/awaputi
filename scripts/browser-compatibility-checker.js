#!/usr/bin/env node
/**
 * Browser Compatibility Checker Script
 * ブラウザ互換性チェッカー
 * 
 * 現在のブラウザでの互換性をテストし、
 * 必要なフォールバック機能を特定します。
 * 
 * Usage:
 *   node scripts/browser-compatibility-checker.js [options]
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BrowserCompatibilityChecker {
    /**
     * チェック対象機能
     */
    static COMPATIBILITY_FEATURES = {
        canvas: {
            name: 'Canvas API',
            description: 'HTML5 Canvas for dynamic favicon generation',
            tests: [
                'canvas_creation',
                'canvas_2d_context',
                'canvas_to_data_url',
                'canvas_to_blob',
                'canvas_drawing'
            ],
            fallbacks: ['SVG generation', 'Static icon files']
        },
        
        localStorage: {
            name: 'Local Storage',
            description: 'Browser storage for caching and settings',
            tests: [
                'localStorage_availability',
                'localStorage_read',
                'localStorage_write',
                'localStorage_quota'
            ],
            fallbacks: ['Cookie storage', 'Memory storage', 'No storage']
        },
        
        es6Modules: {
            name: 'ES6 Modules',
            description: 'JavaScript module system',
            tests: [
                'module_script_support',
                'dynamic_import',
                'worker_modules'
            ],
            fallbacks: ['Bundle scripts', 'Legacy scripts']
        },
        
        fetch: {
            name: 'Fetch API',
            description: 'Modern HTTP request API',
            tests: [
                'fetch_availability',
                'fetch_cors',
                'fetch_blob'
            ],
            fallbacks: ['XMLHttpRequest']
        },

        webgl: {
            name: 'WebGL',
            description: '3D graphics capability',
            tests: [
                'webgl_context',
                'webgl_extensions'
            ],
            fallbacks: ['Canvas 2D fallback']
        }
    };

    static projectRoot = path.resolve(__dirname, '..');

    /**
     * メイン互換性チェック実行
     */
    static async check(options = {}) {
        const results = {
            timestamp: new Date().toISOString(),
            userAgent: this._getUserAgent(),
            browser: this._detectBrowser(),
            platform: this._detectPlatform(),
            features: {},
            summary: {
                totalFeatures: 0,
                supported: 0,
                partial: 0,
                unsupported: 0,
                score: 0
            },
            recommendations: []
        };

        console.log('🌐 Browser Compatibility Checker');
        console.log(`🖥️ Platform: ${results.platform.name} ${results.platform.version}`);
        console.log(`🌍 Browser: ${results.browser.name} ${results.browser.version}`);
        console.log(`📱 User Agent: ${results.userAgent}`);
        console.log('');

        try {
            // 各機能をテスト
            for (const [featureName, featureConfig] of Object.entries(this.COMPATIBILITY_FEATURES)) {
                if (options.features && !options.features.includes(featureName)) {
                    continue; // 特定機能のみテストする場合はスキップ
                }
                
                console.log(`🔍 Testing ${featureConfig.name}...`);
                results.features[featureName] = await this._testFeature(featureName, featureConfig);
                results.summary.totalFeatures++;
            }

            // 結果の集計
            this._calculateSummary(results);
            
            // 推奨事項の生成
            this._generateRecommendations(results);

            // 結果出力
            this._outputResults(results, options);

        } catch (error) {
            console.error('❌ Compatibility check failed:', error);
            results.error = error.message;
        }

        return results;
    }

    /**
     * 機能テスト実行
     * @private
     */
    static async _testFeature(featureName, featureConfig) {
        const result = {
            name: featureConfig.name,
            description: featureConfig.description,
            tests: {},
            status: 'unknown', // 'supported', 'partial', 'unsupported'
            score: 0,
            issues: [],
            fallbacksAvailable: featureConfig.fallbacks || []
        };

        try {
            // 各テストを実行
            for (const testName of featureConfig.tests) {
                const testMethod = `_test_${testName}`;
                
                if (typeof this[testMethod] === 'function') {
                    try {
                        const testResult = await this[testMethod]();
                        result.tests[testName] = {
                            passed: testResult.passed,
                            message: testResult.message,
                            details: testResult.details || {}
                        };
                        
                        if (testResult.passed) {
                            result.score++;
                        } else if (testResult.message) {
                            result.issues.push(testResult.message);
                        }
                        
                    } catch (error) {
                        result.tests[testName] = {
                            passed: false,
                            message: `Test failed: ${error.message}`,
                            error: error.message
                        };
                        result.issues.push(`${testName}: ${error.message}`);
                    }
                } else {
                    result.tests[testName] = {
                        passed: false,
                        message: 'Test not implemented',
                        error: 'Test method not found'
                    };
                }
            }

            // ステータス判定
            const totalTests = featureConfig.tests.length;
            const passedTests = result.score;
            
            if (passedTests === totalTests) {
                result.status = 'supported';
            } else if (passedTests > 0) {
                result.status = 'partial';
            } else {
                result.status = 'unsupported';
            }

        } catch (error) {
            result.status = 'unsupported';
            result.issues.push(`Feature test failed: ${error.message}`);
        }

        return result;
    }

    // ========== Canvas API Tests ==========
    
    static async _test_canvas_creation() {
        try {
            // Node.js環境ではCanvas APIは利用できないので、模擬テスト
            if (typeof document === 'undefined') {
                return {
                    passed: false,
                    message: 'Canvas API not available (Node.js environment)',
                    details: { environment: 'nodejs' }
                };
            }
            
            const canvas = document.createElement('canvas');
            return {
                passed: !!canvas,
                message: canvas ? 'Canvas element created successfully' : 'Canvas creation failed'
            };
        } catch (error) {
            return {
                passed: false,
                message: `Canvas creation failed: ${error.message}`
            };
        }
    }

    static async _test_canvas_2d_context() {
        try {
            if (typeof document === 'undefined') {
                return {
                    passed: false,
                    message: '2D context not available (Node.js environment)',
                    details: { environment: 'nodejs' }
                };
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            return {
                passed: !!ctx,
                message: ctx ? '2D context acquired successfully' : '2D context acquisition failed',
                details: { contextType: typeof ctx }
            };
        } catch (error) {
            return {
                passed: false,
                message: `2D context test failed: ${error.message}`
            };
        }
    }

    static async _test_canvas_to_data_url() {
        try {
            if (typeof document === 'undefined') {
                return {
                    passed: false,
                    message: 'toDataURL not available (Node.js environment)',
                    details: { environment: 'nodejs' }
                };
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;
            
            const dataUrl = canvas.toDataURL('image/png');
            const isValidDataUrl = dataUrl && dataUrl.startsWith('data:image/png');
            
            return {
                passed: isValidDataUrl,
                message: isValidDataUrl ? 'toDataURL works correctly' : 'toDataURL failed or invalid',
                details: { dataUrlLength: dataUrl ? dataUrl.length : 0 }
            };
        } catch (error) {
            return {
                passed: false,
                message: `toDataURL test failed: ${error.message}`
            };
        }
    }

    static async _test_canvas_to_blob() {
        try {
            if (typeof document === 'undefined') {
                return {
                    passed: false,
                    message: 'toBlob not available (Node.js environment)',
                    details: { environment: 'nodejs' }
                };
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;
            
            return new Promise((resolve) => {
                if (typeof canvas.toBlob === 'function') {
                    canvas.toBlob((blob) => {
                        resolve({
                            passed: !!blob,
                            message: blob ? 'toBlob works correctly' : 'toBlob returned null',
                            details: { blobSize: blob ? blob.size : 0 }
                        });
                    }, 'image/png');
                } else {
                    resolve({
                        passed: false,
                        message: 'toBlob method not available'
                    });
                }
            });
        } catch (error) {
            return {
                passed: false,
                message: `toBlob test failed: ${error.message}`
            };
        }
    }

    static async _test_canvas_drawing() {
        try {
            if (typeof document === 'undefined') {
                return {
                    passed: false,
                    message: 'Canvas drawing not available (Node.js environment)',
                    details: { environment: 'nodejs' }
                };
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                return {
                    passed: false,
                    message: 'No 2D context for drawing test'
                };
            }
            
            // 簡単な描画テスト
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(0, 0, 10, 10);
            
            // 描画されたピクセルをチェック
            const imageData = ctx.getImageData(5, 5, 1, 1);
            const red = imageData.data[0];
            
            return {
                passed: red === 255,
                message: red === 255 ? 'Canvas drawing works correctly' : 'Canvas drawing failed',
                details: { redValue: red }
            };
        } catch (error) {
            return {
                passed: false,
                message: `Canvas drawing test failed: ${error.message}`
            };
        }
    }

    // ========== Local Storage Tests ==========
    
    static async _test_localStorage_availability() {
        try {
            const available = typeof localStorage !== 'undefined' && localStorage !== null;
            return {
                passed: available,
                message: available ? 'localStorage is available' : 'localStorage is not available',
                details: { type: typeof localStorage }
            };
        } catch (error) {
            return {
                passed: false,
                message: `localStorage availability test failed: ${error.message}`
            };
        }
    }

    static async _test_localStorage_read() {
        try {
            if (typeof localStorage === 'undefined') {
                return {
                    passed: false,
                    message: 'localStorage not available for read test'
                };
            }
            
            const testValue = localStorage.getItem('__compatibility_test__');
            return {
                passed: true, // 読み込み自体は成功（値がnullでも）
                message: 'localStorage read operation successful',
                details: { testValue }
            };
        } catch (error) {
            return {
                passed: false,
                message: `localStorage read failed: ${error.message}`
            };
        }
    }

    static async _test_localStorage_write() {
        try {
            if (typeof localStorage === 'undefined') {
                return {
                    passed: false,
                    message: 'localStorage not available for write test'
                };
            }
            
            const testKey = '__compatibility_write_test__';
            const testValue = 'test_' + Date.now();
            
            localStorage.setItem(testKey, testValue);
            const retrievedValue = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            return {
                passed: retrievedValue === testValue,
                message: retrievedValue === testValue ? 
                    'localStorage write/read successful' : 
                    'localStorage write/read failed',
                details: { testValue, retrievedValue }
            };
        } catch (error) {
            const isQuotaError = error.name === 'QuotaExceededError' || error.message.includes('quota');
            return {
                passed: false,
                message: isQuotaError ? 
                    'localStorage quota exceeded' : 
                    `localStorage write failed: ${error.message}`,
                details: { isQuotaError, errorName: error.name }
            };
        }
    }

    static async _test_localStorage_quota() {
        try {
            if (typeof localStorage === 'undefined') {
                return {
                    passed: false,
                    message: 'localStorage not available for quota test'
                };
            }
            
            // 簡易クォータテスト
            let estimatedQuota = 0;
            const testData = 'a'.repeat(1024); // 1KB
            
            for (let i = 0; i < 10; i++) {
                try {
                    localStorage.setItem(`__quota_test_${i}__`, testData);
                    estimatedQuota += 1024;
                } catch (e) {
                    break;
                }
            }
            
            // クリーンアップ
            for (let i = 0; i < 10; i++) {
                try {
                    localStorage.removeItem(`__quota_test_${i}__`);
                } catch (e) {
                    break;
                }
            }
            
            return {
                passed: estimatedQuota > 0,
                message: `localStorage quota test: ~${estimatedQuota} bytes available`,
                details: { estimatedQuota }
            };
        } catch (error) {
            return {
                passed: false,
                message: `localStorage quota test failed: ${error.message}`
            };
        }
    }

    // ========== ES6 Modules Tests ==========
    
    static async _test_module_script_support() {
        try {
            if (typeof document === 'undefined') {
                return {
                    passed: false,
                    message: 'Module script test not available (Node.js environment)'
                };
            }
            
            const script = document.createElement('script');
            script.type = 'module';
            const supportsModules = script.type === 'module';
            
            return {
                passed: supportsModules,
                message: supportsModules ? 
                    'Module script type supported' : 
                    'Module script type not supported',
                details: { actualType: script.type }
            };
        } catch (error) {
            return {
                passed: false,
                message: `Module script test failed: ${error.message}`
            };
        }
    }

    static async _test_dynamic_import() {
        try {
            const supportsDynamicImport = typeof import === 'function';
            return {
                passed: supportsDynamicImport,
                message: supportsDynamicImport ? 
                    'Dynamic import supported' : 
                    'Dynamic import not supported',
                details: { importType: typeof import }
            };
        } catch (error) {
            return {
                passed: false,
                message: `Dynamic import test failed: ${error.message}`
            };
        }
    }

    static async _test_worker_modules() {
        try {
            const supportsWorker = typeof Worker !== 'undefined';
            return {
                passed: supportsWorker,
                message: supportsWorker ? 
                    'Web Workers supported (modules may be available)' : 
                    'Web Workers not supported',
                details: { workerType: typeof Worker }
            };
        } catch (error) {
            return {
                passed: false,
                message: `Worker modules test failed: ${error.message}`
            };
        }
    }

    // ========== Helper Methods ==========
    
    static _getUserAgent() {
        if (typeof navigator !== 'undefined' && navigator.userAgent) {
            return navigator.userAgent;
        }
        return `Node.js ${process.version}`;
    }

    static _detectBrowser() {
        const userAgent = this._getUserAgent();
        
        if (userAgent.includes('Node.js')) {
            const version = process.version.substring(1);
            return { name: 'Node.js', version, isNode: true };
        }
        
        // ブラウザ検出ロジック（簡易版）
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            const match = userAgent.match(/Chrome\/(\d+)/);
            return { name: 'Chrome', version: match ? match[1] : 'unknown' };
        } else if (userAgent.includes('Firefox')) {
            const match = userAgent.match(/Firefox\/(\d+)/);
            return { name: 'Firefox', version: match ? match[1] : 'unknown' };
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            const match = userAgent.match(/Safari\/(\d+)/);
            return { name: 'Safari', version: match ? match[1] : 'unknown' };
        } else if (userAgent.includes('Edg')) {
            const match = userAgent.match(/Edg\/(\d+)/);
            return { name: 'Edge', version: match ? match[1] : 'unknown' };
        }
        
        return { name: 'Unknown', version: 'unknown' };
    }

    static _detectPlatform() {
        if (typeof process !== 'undefined') {
            return {
                name: process.platform,
                version: process.version,
                arch: process.arch
            };
        } else if (typeof navigator !== 'undefined') {
            return {
                name: navigator.platform || 'Unknown',
                version: 'unknown',
                arch: 'unknown'
            };
        }
        
        return { name: 'Unknown', version: 'unknown', arch: 'unknown' };
    }

    static _calculateSummary(results) {
        let totalScore = 0;
        
        Object.values(results.features).forEach(feature => {
            switch (feature.status) {
                case 'supported':
                    results.summary.supported++;
                    totalScore += 100;
                    break;
                case 'partial':
                    results.summary.partial++;
                    totalScore += 50;
                    break;
                case 'unsupported':
                    results.summary.unsupported++;
                    totalScore += 0;
                    break;
            }
        });
        
        results.summary.score = results.summary.totalFeatures > 0 ? 
            Math.round(totalScore / results.summary.totalFeatures) : 0;
    }

    static _generateRecommendations(results) {
        Object.entries(results.features).forEach(([featureName, feature]) => {
            if (feature.status === 'unsupported' || feature.status === 'partial') {
                results.recommendations.push({
                    type: feature.status === 'unsupported' ? 'error' : 'warning',
                    feature: featureName,
                    message: `${feature.name} is ${feature.status}`,
                    issues: feature.issues,
                    fallbacks: feature.fallbacksAvailable,
                    action: `Consider using fallback: ${feature.fallbacksAvailable.join(', ')}`
                });
            }
        });
    }

    static _outputResults(results, options = {}) {
        console.log('📊 Compatibility Check Results');
        console.log('==============================');
        console.log(`Overall Score: ${results.summary.score}/100`);
        console.log(`✅ Fully Supported: ${results.summary.supported}`);
        console.log(`⚠️ Partially Supported: ${results.summary.partial}`);
        console.log(`❌ Unsupported: ${results.summary.unsupported}`);
        console.log('');

        // 機能別結果
        console.log('🔍 Feature Support Details');
        console.log('===========================');
        
        Object.entries(results.features).forEach(([featureName, feature]) => {
            const statusIcon = {
                'supported': '✅',
                'partial': '⚠️',
                'unsupported': '❌'
            };
            
            console.log(`${statusIcon[feature.status]} ${feature.name} (${feature.status})`);
            
            if (options.verbose) {
                Object.entries(feature.tests).forEach(([testName, test]) => {
                    const icon = test.passed ? '  ✓' : '  ✗';
                    console.log(`${icon} ${testName}: ${test.message}`);
                });
            }
            
            if (feature.issues.length > 0) {
                feature.issues.forEach(issue => {
                    console.log(`    ⚠️ ${issue}`);
                });
            }
        });
        console.log('');

        // 推奨事項
        if (results.recommendations.length > 0) {
            console.log('💡 Recommendations');
            console.log('==================');
            
            results.recommendations.forEach((rec, i) => {
                const icon = rec.type === 'error' ? '🚨' : '⚠️';
                console.log(`${icon} ${i + 1}. ${rec.message}`);
                
                if (rec.fallbacks.length > 0) {
                    console.log(`   Fallbacks available: ${rec.fallbacks.join(', ')}`);
                }
                
                console.log(`   Action: ${rec.action}`);
                console.log('');
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
    args.forEach((arg, i) => {
        if (arg === '--verbose' || arg === '-v') {
            options.verbose = true;
        } else if (arg.startsWith('--features=')) {
            options.features = arg.substring(11).split(',');
        } else if (arg.startsWith('--output=')) {
            options.outputFile = arg.substring(9);
        } else if (arg === '--help' || arg === '-h') {
            console.log('Browser Compatibility Checker');
            console.log('Usage: node scripts/browser-compatibility-checker.js [options]');
            console.log('');
            console.log('Options:');
            console.log('  --verbose, -v          Show detailed test results');
            console.log('  --features=LIST        Test specific features (comma-separated)');
            console.log('                         Available: canvas,localStorage,es6Modules,fetch,webgl');
            console.log('  --output=FILE          Save results to JSON file');
            console.log('  --help, -h             Show this help');
            console.log('');
            console.log('Examples:');
            console.log('  node scripts/browser-compatibility-checker.js --verbose');
            console.log('  node scripts/browser-compatibility-checker.js --features=canvas,localStorage');
            process.exit(0);
        }
    });
    
    // 互換性チェック実行
    BrowserCompatibilityChecker.check(options)
        .then(results => {
            const hasErrors = results.recommendations.some(r => r.type === 'error');
            process.exit(hasErrors ? 1 : 0);
        })
        .catch(error => {
            console.error('❌ Compatibility check failed:', error);
            process.exit(1);
        });
}

export default BrowserCompatibilityChecker;