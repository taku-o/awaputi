#!/usr/bin/env node

/**
 * Test Generation Script
 * 
 * 設定ファイルからテスト期待値を自動生成し、
 * テストファイルを更新するスクリプト。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TestConfigurationGenerator, getTestConfigurationGenerator } from '../src/utils/TestConfigurationGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');

// ログ関数
const Logger = {
    info: (msg) => console.log(`[INFO] ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${msg}`),
    error: (msg) => console.error(`[ERROR] ${msg}`),
    success: (msg) => console.log(`[SUCCESS] ${msg}`),
    section: (msg) => {
        console.log('\n' + '='.repeat(60));
        console.log(`  ${msg}`);
        console.log('='.repeat(60));
    }
};

/**
 * 使用方法を表示
 */
function showUsage() {
    console.log(`
Test Configuration Generator

Usage:
  node scripts/generate-tests.js [options]

Options:
  --help, -h              Show this help message
  --dry-run              Preview changes without modifying files
  --no-backup            Don't create backup files
  --test-type <type>     Generate specific test type only (bubble|gameBalance|bubbleManager)
  --validate-only        Only validate configuration sync, don't generate tests
  --verbose, -v          Verbose output
  --output-dir <dir>     Custom output directory for test files

Examples:
  node scripts/generate-tests.js
  npm run generate:tests
  npm run generate:tests -- --dry-run
  npm run generate:tests -- --test-type bubble
  npm run generate:tests -- --validate-only

Test Types:
  bubble                 Generate Bubble.test.js from bubble configurations
  gameBalance           Generate GameBalance.test.js from GameBalance configuration
  bubbleManager         Generate BubbleManager.test.js for manager integration tests

Source Files:
  src/config/GameBalance.js
  src/bubbles/Bubble.js
  ConfigurationManager (via getter methods)
    `);
}

/**
 * コマンドライン引数を解析
 */
function parseArguments(args) {
    const options = {
        dryRun: false,
        backup: true,
        testTypes: null,
        validateOnly: false,
        verbose: false,
        outputDir: null,
        help: false
    };
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '--help':
            case '-h':
                options.help = true;
                break;
                
            case '--dry-run':
                options.dryRun = true;
                break;
                
            case '--no-backup':
                options.backup = false;
                break;
                
            case '--test-type':
                if (i + 1 < args.length) {
                    const testType = args[++i];
                    if (['bubble', 'gameBalance', 'bubbleManager'].includes(testType)) {
                        options.testTypes = [testType];
                    } else {
                        throw new Error(`Invalid test type: ${testType}`);
                    }
                } else {
                    throw new Error('--test-type requires a value');
                }
                break;
                
            case '--validate-only':
                options.validateOnly = true;
                break;
                
            case '--verbose':
            case '-v':
                options.verbose = true;
                break;
                
            case '--output-dir':
                if (i + 1 < args.length) {
                    options.outputDir = args[++i];
                } else {
                    throw new Error('--output-dir requires a value');
                }
                break;
                
            default:
                if (arg.startsWith('-')) {
                    throw new Error(`Unknown option: ${arg}`);
                }
                break;
        }
    }
    
    return options;
}

/**
 * 設定の検証
 */
async function validateConfiguration(generator, options) {
    Logger.section('設定同期の検証');
    
    const validation = generator.validateConfigurationSync();
    
    Logger.info(`バブルタイプ数: ${validation.bubbleTypesCount}`);
    Logger.info(`ソースファイル: ${validation.sourceFiles.join(', ')}`);
    
    if (validation.issues.length > 0) {
        Logger.error('設定の問題が検出されました:');
        validation.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (validation.warnings.length > 0) {
        Logger.warn('設定の警告:');
        validation.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (validation.valid) {
        Logger.success('設定の検証が正常に完了しました');
    } else {
        Logger.error('設定に重要な問題があります。修正が必要です。');
        return false;
    }
    
    if (options.verbose) {
        const stats = generator.getGenerationStatistics();
        Logger.info(`生成統計: ${JSON.stringify(stats, null, 2)}`);
    }
    
    return true;
}

/**
 * テスト生成の実行
 */
async function generateTests(generator, expectations, options) {
    Logger.section('テストファイルの生成');
    
    if (options.dryRun) {
        Logger.warn('ドライランモード: ファイルは変更されません');
    }
    
    const updateOptions = {
        testTypes: options.testTypes,
        dryRun: options.dryRun,
        backup: options.backup,
        outputDir: options.outputDir
    };
    
    const results = generator.updateTestFiles(expectations, updateOptions);
    
    // 結果の表示
    if (results.updated.length > 0) {
        Logger.success(`${results.updated.length}件のテストファイルを更新しました:`);
        results.updated.forEach(result => {
            const info = options.dryRun ? '[DRY RUN] ' : '';
            Logger.info(`  ${info}${result.testType}: ${path.basename(result.testFilePath)}`);
            
            if (options.verbose && result.linesGenerated) {
                Logger.info(`    生成行数: ${result.linesGenerated}`);
            }
        });
    }
    
    if (results.backups.length > 0) {
        Logger.info(`${results.backups.length}件のバックアップファイルを作成しました:`);
        results.backups.forEach(backup => {
            Logger.info(`  ${path.basename(backup)}`);
        });
    }
    
    if (results.failed.length > 0) {
        Logger.error(`${results.failed.length}件のテストファイル生成が失敗しました:`);
        results.failed.forEach(failure => {
            Logger.error(`  ${failure.testType}: ${failure.error}`);
        });
    }
    
    if (results.skipped.length > 0) {
        Logger.warn(`${results.skipped.length}件のテストファイルがスキップされました:`);
        results.skipped.forEach(skipped => {
            Logger.warn(`  ${skipped.testType}: ${skipped.reason}`);
        });
    }
    
    return results.failed.length === 0;
}

/**
 * 期待値のプレビュー表示
 */
function previewExpectations(expectations, options) {
    if (!options.verbose) return;
    
    Logger.section('抽出された期待値のプレビュー');
    
    console.log('バブルタイプ設定:');
    for (const [bubbleType, config] of Object.entries(expectations.bubbleTypes || {})) {
        console.log(`  ${bubbleType}:`);
        console.log(`    health: ${config.health || 'N/A'}`);
        console.log(`    score: ${config.score || 'N/A'}`);
        console.log(`    size: ${config.size || 'N/A'}`);
        console.log(`    maxAge: ${config.maxAge || 'N/A'}`);
        
        if (config.effects) {
            console.log(`    effects:`);
            for (const [effectProp, effectValue] of Object.entries(config.effects)) {
                console.log(`      ${effectProp}: ${effectValue}`);
            }
        }
    }
    
    if (expectations.gameBalance) {
        console.log('\nGameBalance設定:');
        
        if (expectations.gameBalance.baseScores) {
            console.log('  baseScores:');
            for (const [bubbleType, score] of Object.entries(expectations.gameBalance.baseScores)) {
                console.log(`    ${bubbleType}: ${score}`);
            }
        }
        
        if (expectations.gameBalance.bubbles) {
            console.log('  bubbles configuration count:', Object.keys(expectations.gameBalance.bubbles).length);
        }
    }
    
    if (expectations.metadata) {
        console.log('\nメタデータ:');
        console.log(`  生成日時: ${new Date(expectations.metadata.extractedAt).toLocaleString('ja-JP')}`);
        console.log(`  ソースファイル: ${expectations.metadata.sourceFiles.join(', ')}`);
        console.log(`  生成器バージョン: ${expectations.metadata.generatorVersion}`);
    }
}

/**
 * 事後処理とレポート
 */
function postProcessing(results, options) {
    Logger.section('事後処理');
    
    // レポートファイルの生成
    if (!options.dryRun) {
        try {
            const reportsDir = path.join(PROJECT_ROOT, 'reports');
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const reportPath = path.join(reportsDir, `test-generation-${timestamp}.json`);
            
            const report = {
                timestamp: new Date().toISOString(),
                options: options,
                results: results,
                success: results.failed.length === 0
            };
            
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            Logger.info(`レポートを保存しました: ${path.basename(reportPath)}`);
            
        } catch (reportError) {
            Logger.warn(`レポート保存に失敗しました: ${reportError.message}`);
        }
    }
    
    // 次のステップの提案
    if (!options.dryRun && results.updated.length > 0) {
        Logger.section('次のステップ');
        Logger.info('生成されたテストを実行してください:');
        Logger.info('  npm test');
        Logger.info('');
        Logger.info('設定検証を実行してください:');
        Logger.info('  npm run validate:config');
        Logger.info('');
        Logger.info('変更をコミットする前に:');
        Logger.info('  git add tests/unit/');
        Logger.info('  git commit -m "🧪 update: 設定から自動生成されたテストを更新"');
    }
}

/**
 * メイン実行関数
 */
async function main() {
    try {
        const args = process.argv.slice(2);
        
        const options = parseArguments(args);
        
        if (options.help) {
            showUsage();
            process.exit(0);
        }
        
        Logger.section('テスト設定生成を開始');
        
        if (options.verbose) {
            Logger.info('実行オプション:');
            console.log(JSON.stringify(options, null, 2));
        }
        
        // テスト生成器の初期化
        const generatorOptions = {
            projectRoot: PROJECT_ROOT,
            dryRun: options.dryRun,
            backupEnabled: options.backup
        };
        
        if (options.outputDir) {
            generatorOptions.testsDir = path.resolve(options.outputDir);
        }
        
        const generator = getTestConfigurationGenerator(generatorOptions);
        
        // 設定の検証
        const validationPassed = await validateConfiguration(generator, options);
        if (!validationPassed) {
            Logger.error('設定検証が失敗しました。テスト生成を中止します。');
            process.exit(1);
        }
        
        // 検証のみモードの場合はここで終了
        if (options.validateOnly) {
            Logger.success('設定検証が完了しました。');
            process.exit(0);
        }
        
        // 正規設定から期待値を抽出
        Logger.info('設定ファイルから期待値を抽出中...');
        const expectations = generator.extractCanonicalExpectations();
        
        if (!expectations) {
            Logger.error('期待値の抽出に失敗しました。');
            process.exit(1);
        }
        
        // 期待値のプレビュー表示
        previewExpectations(expectations, options);
        
        // テスト生成の実行
        const success = await generateTests(generator, expectations, options);
        
        // 事後処理
        const results = {
            updated: [], // この情報は generateTests から取得する必要がある
            failed: [],
            skipped: [],
            backups: []
        };
        
        postProcessing(results, options);
        
        if (success) {
            Logger.success('✅ テスト生成が正常に完了しました！');
            process.exit(0);
        } else {
            Logger.error('❌ テスト生成中にエラーが発生しました。');
            process.exit(1);
        }
        
    } catch (error) {
        Logger.error(`テスト生成スクリプト実行エラー: ${error.message}`);
        
        if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
            console.error(error.stack);
        }
        
        process.exit(1);
    }
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export {
    parseArguments,
    validateConfiguration,
    generateTests,
    previewExpectations,
    postProcessing
};