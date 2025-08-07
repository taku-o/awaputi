#!/usr/bin/env node
/**
 * Favicon Validator Script
 * ファビコンファイルの検証スクリプト
 * 
 * 不足しているファビコンファイルをチェックし、
 * ファイルサイズや形式の妥当性を検証します。
 * 
 * Usage:
 *   node scripts/favicon-validator.js [options]
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FaviconValidator {
    /**
     * ファビコン設定
     */
    static FAVICON_CONFIG = {
        required: [
            {
                file: 'favicon.ico',
                format: 'ico',
                sizes: [16, 32, 48],
                minSize: 1000,  // 1KB
                maxSize: 50000, // 50KB
                description: 'Classic favicon for legacy browser support'
            }
        ],
        
        recommended: [
            {
                file: 'favicon-16x16.png',
                format: 'png',
                size: 16,
                minSize: 200,   // 200B
                maxSize: 5000,  // 5KB
                description: '16x16 PNG favicon for modern browsers'
            },
            {
                file: 'favicon-32x32.png',
                format: 'png',
                size: 32,
                minSize: 500,   // 500B
                maxSize: 8000,  // 8KB
                description: '32x32 PNG favicon for high-DPI displays'
            },
            {
                file: 'favicon-192x192.png',
                format: 'png',
                size: 192,
                minSize: 3000,  // 3KB
                maxSize: 20000, // 20KB
                description: '192x192 PNG for Android home screen'
            },
            {
                file: 'favicon-512x512.png',
                format: 'png',
                size: 512,
                minSize: 8000,  // 8KB
                maxSize: 50000, // 50KB
                description: '512x512 PNG for iOS and high-resolution displays'
            }
        ],

        optional: [
            {
                file: 'apple-touch-icon.png',
                format: 'png',
                size: 180,
                minSize: 5000,  // 5KB
                maxSize: 30000, // 30KB
                description: 'Apple touch icon for iOS devices'
            },
            {
                file: 'android-chrome-192x192.png',
                format: 'png',
                size: 192,
                minSize: 3000,  // 3KB
                maxSize: 20000, // 20KB
                description: 'Android Chrome icon 192x192'
            },
            {
                file: 'android-chrome-512x512.png',
                format: 'png',
                size: 512,
                minSize: 8000,  // 8KB
                maxSize: 50000, // 50KB
                description: 'Android Chrome icon 512x512'
            }
        ]
    };

    static projectRoot = path.resolve(__dirname, '..');

    /**
     * メインファビコン検証実行
     */
    static async validate(options = {}) {
        const results = {
            timestamp: new Date().toISOString(),
            projectRoot: this.projectRoot,
            summary: {
                totalFiles: 0,
                existing: 0,
                missing: 0,
                validSize: 0,
                invalidSize: 0,
                score: 0
            },
            files: [],
            recommendations: []
        };

        console.log('🎨 Favicon Validator');
        console.log(`📁 Project Root: ${this.projectRoot}`);
        console.log('');

        try {
            // 各カテゴリのファビコンをチェック
            await this._checkFaviconCategory(results, 'required', this.FAVICON_CONFIG.required);
            await this._checkFaviconCategory(results, 'recommended', this.FAVICON_CONFIG.recommended);
            
            if (options.includeOptional !== false) {
                await this._checkFaviconCategory(results, 'optional', this.FAVICON_CONFIG.optional);
            }

            // HTMLファイル内のファビコン参照をチェック
            await this._checkHTMLFaviconReferences(results);

            // 総合スコアを計算
            this._calculateScore(results);

            // 結果出力
            this._outputResults(results, options);

        } catch (error) {
            console.error('❌ Favicon validation failed:', error);
            results.error = error.message;
        }

        return results;
    }

    /**
     * ファビコンカテゴリチェック
     * @private
     */
    static async _checkFaviconCategory(results, category, faviconList) {
        console.log(`🔍 Checking ${category} favicons...`);

        for (const faviconSpec of faviconList) {
            const filePath = path.join(this.projectRoot, faviconSpec.file);
            const exists = fs.existsSync(filePath);

            results.summary.totalFiles++;

            const fileResult = {
                category,
                file: faviconSpec.file,
                path: filePath,
                exists,
                spec: faviconSpec,
                issues: []
            };

            if (exists) {
                results.summary.existing++;
                
                try {
                    // ファイル情報取得
                    const stats = fs.statSync(filePath);
                    fileResult.size = stats.size;
                    fileResult.sizeKB = Math.round(stats.size / 1024 * 10) / 10;
                    fileResult.lastModified = stats.mtime;

                    // サイズ検証
                    const sizeValid = this._validateFileSize(fileResult, faviconSpec);
                    if (sizeValid) {
                        results.summary.validSize++;
                    } else {
                        results.summary.invalidSize++;
                    }

                    // 形式検証
                    await this._validateFileFormat(fileResult, faviconSpec);

                    // 画像寸法検証（PNG/JPEGの場合）
                    if (faviconSpec.format === 'png' || faviconSpec.format === 'jpg') {
                        await this._validateImageDimensions(fileResult, faviconSpec);
                    }

                    console.log(`✅ ${faviconSpec.file} (${fileResult.sizeKB} KB)`);

                } catch (error) {
                    fileResult.issues.push({
                        type: 'error',
                        message: `Failed to analyze file: ${error.message}`
                    });
                    console.log(`❌ ${faviconSpec.file} - Analysis failed: ${error.message}`);
                }

            } else {
                results.summary.missing++;
                fileResult.issues.push({
                    type: category === 'required' ? 'error' : 'warning',
                    message: `File missing: ${faviconSpec.file}`
                });

                const urgency = category === 'required' ? '❌' : category === 'recommended' ? '⚠️' : 'ℹ️';
                console.log(`${urgency} ${faviconSpec.file} - Missing`);

                // 推奨事項に追加
                results.recommendations.push({
                    type: category === 'required' ? 'error' : 'warning',
                    file: faviconSpec.file,
                    message: `Missing ${category} favicon: ${faviconSpec.file}`,
                    description: faviconSpec.description,
                    action: this._generateCreationCommand(faviconSpec)
                });
            }

            results.files.push(fileResult);
        }
    }

    /**
     * ファイルサイズ検証
     * @private
     */
    static _validateFileSize(fileResult, spec) {
        const { size } = fileResult;
        const { minSize, maxSize } = spec;

        if (size < minSize) {
            fileResult.issues.push({
                type: 'warning',
                message: `File too small: ${Math.round(size)} bytes (min: ${minSize} bytes)`
            });
            return false;
        }

        if (size > maxSize) {
            fileResult.issues.push({
                type: 'warning',
                message: `File too large: ${Math.round(size)} bytes (max: ${maxSize} bytes)`
            });
            return false;
        }

        return true;
    }

    /**
     * ファイル形式検証
     * @private
     */
    static async _validateFileFormat(fileResult, spec) {
        try {
            // ファイルの最初の数バイトを読んでマジックナンバーをチェック
            const fd = fs.openSync(fileResult.path, 'r');
            const buffer = Buffer.alloc(20);
            fs.readSync(fd, buffer, 0, 20, 0);
            fs.closeSync(fd);

            const magicNumbers = {
                png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
                jpg: [0xFF, 0xD8, 0xFF],
                ico: [0x00, 0x00, 0x01, 0x00]
            };

            const expectedMagic = magicNumbers[spec.format];
            if (expectedMagic) {
                const matches = expectedMagic.every((byte, index) => buffer[index] === byte);
                
                if (matches) {
                    fileResult.formatValid = true;
                } else {
                    fileResult.formatValid = false;
                    fileResult.issues.push({
                        type: 'error',
                        message: `Invalid ${spec.format.toUpperCase()} format: Magic number mismatch`
                    });
                }
            }

        } catch (error) {
            fileResult.issues.push({
                type: 'warning',
                message: `Could not validate format: ${error.message}`
            });
        }
    }

    /**
     * 画像寸法検証（簡易版）
     * @private
     */
    static async _validateImageDimensions(fileResult, spec) {
        if (!spec.size) return; // サイズ指定がない場合はスキップ

        try {
            if (spec.format === 'png') {
                // PNG寸法の簡易チェック（IHDRチャンクから）
                const fd = fs.openSync(fileResult.path, 'r');
                const buffer = Buffer.alloc(32);
                fs.readSync(fd, buffer, 0, 32, 0);
                fs.closeSync(fd);

                if (buffer.toString('ascii', 12, 16) === 'IHDR') {
                    const width = buffer.readUInt32BE(16);
                    const height = buffer.readUInt32BE(20);
                    
                    fileResult.dimensions = { width, height };
                    
                    if (width !== spec.size || height !== spec.size) {
                        fileResult.issues.push({
                            type: 'warning',
                            message: `Size mismatch: ${width}x${height} (expected: ${spec.size}x${spec.size})`
                        });
                    } else {
                        fileResult.dimensionsValid = true;
                    }
                }
            }

        } catch (error) {
            fileResult.issues.push({
                type: 'info',
                message: `Could not validate dimensions: ${error.message}`
            });
        }
    }

    /**
     * HTMLファビコン参照チェック
     * @private
     */
    static async _checkHTMLFaviconReferences(results) {
        console.log('🏗️ Checking HTML favicon references...');

        const indexPath = path.join(this.projectRoot, 'index.html');
        if (!fs.existsSync(indexPath)) {
            results.recommendations.push({
                type: 'warning',
                message: 'index.html not found for favicon reference check',
                action: 'Ensure index.html exists in project root'
            });
            return;
        }

        try {
            const htmlContent = fs.readFileSync(indexPath, 'utf-8');
            
            const faviconReferences = {
                classicIcon: htmlContent.includes('rel="icon"') || htmlContent.includes('rel="shortcut icon"'),
                pngIcons: htmlContent.includes('type="image/png"'),
                appleTouchIcon: htmlContent.includes('apple-touch-icon'),
                sizes: htmlContent.includes('sizes=')
            };

            results.htmlReferences = faviconReferences;

            // 各参照タイプをチェック
            Object.entries(faviconReferences).forEach(([type, exists]) => {
                const description = {
                    classicIcon: 'Classic favicon.ico reference',
                    pngIcons: 'PNG favicon references',
                    appleTouchIcon: 'Apple touch icon reference',
                    sizes: 'Icon sizes specification'
                };

                if (!exists && (type === 'classicIcon' || type === 'pngIcons')) {
                    results.recommendations.push({
                        type: 'warning',
                        message: `Missing HTML reference: ${description[type]}`,
                        action: `Add appropriate <link rel="icon"> tags to <head> section`
                    });
                }
            });

            console.log(`📄 HTML references: ${Object.values(faviconReferences).filter(Boolean).length}/4 types found`);

        } catch (error) {
            results.recommendations.push({
                type: 'warning',
                message: `Could not check HTML references: ${error.message}`,
                action: 'Manually verify favicon links in HTML'
            });
        }
    }

    /**
     * 総合スコア計算
     * @private
     */
    static _calculateScore(results) {
        let score = 0;
        const weights = {
            required: 30,    // 必須ファイル：30点
            recommended: 15, // 推奨ファイル：15点
            optional: 5      // オプション：5点
        };

        results.files.forEach(file => {
            if (file.exists) {
                let fileScore = weights[file.category] || 0;
                
                // 品質ボーナス
                if (file.issues.length === 0) {
                    fileScore *= 1.0; // 満点
                } else {
                    const errorCount = file.issues.filter(i => i.type === 'error').length;
                    const warningCount = file.issues.filter(i => i.type === 'warning').length;
                    fileScore *= Math.max(0.3, 1.0 - (errorCount * 0.3 + warningCount * 0.1));
                }
                
                score += fileScore;
            }
        });

        // HTML参照ボーナス
        if (results.htmlReferences) {
            const refCount = Object.values(results.htmlReferences).filter(Boolean).length;
            score += Math.min(10, refCount * 2.5); // 最大10点
        }

        results.summary.score = Math.round(Math.max(0, Math.min(100, score)));
    }

    /**
     * ファイル作成コマンド生成
     * @private
     */
    static _generateCreationCommand(spec) {
        if (spec.format === 'png' && spec.size) {
            return `Create ${spec.size}x${spec.size} PNG favicon: Use favicon generator tool or online service`;
        } else if (spec.format === 'ico') {
            return `Create ICO favicon: Convert PNG files to ICO format with multiple sizes`;
        } else {
            return `Create ${spec.file}: Use appropriate favicon generation tool`;
        }
    }

    /**
     * 結果出力
     * @private
     */
    static _outputResults(results, options = {}) {
        console.log('');
        console.log('📊 Favicon Validation Results');
        console.log('=============================');
        console.log(`Total Files Checked: ${results.summary.totalFiles}`);
        console.log(`✅ Existing: ${results.summary.existing}`);
        console.log(`❌ Missing: ${results.summary.missing}`);
        console.log(`📏 Valid Size: ${results.summary.validSize}`);
        console.log(`⚠️ Size Issues: ${results.summary.invalidSize}`);
        console.log(`🏆 Overall Score: ${results.summary.score}/100`);
        console.log('');

        // スコア評価
        const grade = this._getScoreGrade(results.summary.score);
        console.log(`📈 Grade: ${grade.emoji} ${grade.letter} (${grade.description})`);
        console.log('');

        // 推奨事項
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
                    if (rec.description) console.log(`      ${rec.description}`);
                    console.log(`      Action: ${rec.action}`);
                });
                console.log('');
            }
            
            if (warnings.length > 0) {
                console.log('⚠️ Improvements:');
                warnings.forEach((rec, i) => {
                    console.log(`   ${i + 1}. ${rec.message}`);
                    if (rec.description) console.log(`      ${rec.description}`);
                    console.log(`      Action: ${rec.action}`);
                });
                console.log('');
            }
        }

        // ベストプラクティス
        if (options.showTips !== false) {
            console.log('💡 Favicon Best Practices');
            console.log('=========================');
            console.log('1. Include favicon.ico in root for legacy browser support');
            console.log('2. Provide PNG favicons for modern browsers (16x16, 32x32)');
            console.log('3. Add high-resolution icons for mobile devices (192x192, 512x512)');
            console.log('4. Keep file sizes optimized (ICO < 50KB, PNG < 20KB typically)');
            console.log('5. Test favicons across different browsers and devices');
            console.log('6. Use proper HTML link tags with correct rel attributes');
            console.log('');
        }

        // 詳細結果（オプション）
        if (options.verbose) {
            console.log('📋 Detailed File Analysis');
            console.log('=========================');
            
            ['required', 'recommended', 'optional'].forEach(category => {
                const categoryFiles = results.files.filter(f => f.category === category);
                if (categoryFiles.length === 0) return;

                console.log(`\n📁 ${category.toUpperCase()} Files:`);
                categoryFiles.forEach(file => {
                    const status = file.exists ? '✅' : '❌';
                    const size = file.exists && file.sizeKB ? ` (${file.sizeKB} KB)` : '';
                    console.log(`   ${status} ${file.file}${size}`);
                    
                    if (file.dimensions) {
                        console.log(`      Dimensions: ${file.dimensions.width}x${file.dimensions.height}`);
                    }
                    
                    file.issues.forEach(issue => {
                        const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
                        console.log(`      ${icon} ${issue.message}`);
                    });
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

    /**
     * スコア評価
     * @private
     */
    static _getScoreGrade(score) {
        if (score >= 90) return { letter: 'A+', emoji: '🏆', description: 'Excellent favicon setup' };
        if (score >= 80) return { letter: 'A', emoji: '🥇', description: 'Great favicon coverage' };
        if (score >= 70) return { letter: 'B+', emoji: '🥈', description: 'Good favicon setup' };
        if (score >= 60) return { letter: 'B', emoji: '👍', description: 'Adequate favicon coverage' };
        if (score >= 50) return { letter: 'C+', emoji: '⚠️', description: 'Basic favicon setup' };
        if (score >= 40) return { letter: 'C', emoji: '🔧', description: 'Needs improvement' };
        if (score >= 30) return { letter: 'D+', emoji: '⚠️', description: 'Poor favicon coverage' };
        return { letter: 'F', emoji: '❌', description: 'Critical favicon issues' };
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
        } else if (arg === '--no-tips') {
            options.showTips = false;
        } else if (arg === '--no-optional') {
            options.includeOptional = false;
        } else if (arg.startsWith('--output=')) {
            options.outputFile = arg.substring(9);
        } else if (arg === '--help' || arg === '-h') {
            console.log('Favicon Validator');
            console.log('Usage: node scripts/favicon-validator.js [options]');
            console.log('');
            console.log('Options:');
            console.log('  --verbose, -v     Show detailed file analysis');
            console.log('  --no-tips         Hide best practices tips');
            console.log('  --no-optional     Skip optional favicon files');
            console.log('  --output=FILE     Save results to JSON file');
            console.log('  --help, -h        Show this help');
            process.exit(0);
        }
    });
    
    // 検証実行
    FaviconValidator.validate(options)
        .then(results => {
            const hasErrors = results.recommendations.some(r => r.type === 'error');
            process.exit(hasErrors ? 1 : 0);
        })
        .catch(error => {
            console.error('❌ Favicon validation failed:', error);
            process.exit(1);
        });
}

export default FaviconValidator;