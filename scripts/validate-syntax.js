#!/usr/bin/env node

/**
 * Syntax Validation Script
 * 構文検証スクリプト - 開発ワークフローでの自動検証用
 */

import { HTMLJavaScriptChecker } from '../src/utils/syntax-validation/HTMLJavaScriptChecker.js';
import { JavaScriptModuleValidator } from '../src/utils/syntax-validation/JavaScriptModuleValidator.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(__dirname);

/**
 * 構文検証の実行
 */
async function runSyntaxValidation() {
    console.log('🔍 Starting syntax validation...\n');
    
    let totalErrors = 0;
    let totalWarnings = 0;
    
    // HTML ファイルの検証
    console.log('📄 Validating HTML files...');
    const htmlResults = await validateHTMLFiles();
    totalErrors += htmlResults.errors;
    totalWarnings += htmlResults.warnings;
    
    // JavaScript モジュールの検証
    console.log('\n📦 Validating JavaScript modules...');
    const jsResults = await validateJavaScriptModules();
    totalErrors += jsResults.errors;
    totalWarnings += jsResults.warnings;
    
    // リソースファイルの検証
    console.log('\n📁 Validating resources...');
    const resourceResults = await validateResources();
    totalErrors += resourceResults.errors;
    totalWarnings += resourceResults.warnings;
    
    // 結果サマリー
    console.log('\n' + '='.repeat(50));
    console.log('📊 Syntax Validation Results');
    console.log('='.repeat(50));
    
    if (totalErrors === 0) {
        console.log('✅ All syntax validation checks passed!');
    } else {
        console.log(`❌ Found ${totalErrors} error(s)`);
    }
    
    if (totalWarnings > 0) {
        console.log(`⚠️  Found ${totalWarnings} warning(s)`);
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`   HTML files: ${htmlResults.filesChecked} checked`);
    console.log(`   JS modules: ${jsResults.filesChecked} checked`);
    console.log(`   Resources: ${resourceResults.filesChecked} checked`);
    
    // エラーがある場合は終了コード1で終了
    if (totalErrors > 0) {
        console.log('\n❌ Syntax validation failed. Please fix the errors above.');
        process.exit(1);
    } else {
        console.log('\n✅ Syntax validation completed successfully.');
        process.exit(0);
    }
}

/**
 * HTMLファイルの検証
 */
async function validateHTMLFiles() {
    const checker = new HTMLJavaScriptChecker();
    let errors = 0;
    let warnings = 0;
    let filesChecked = 0;
    
    // 検証対象のHTMLファイル
    const htmlFiles = [
        'test-error-handler.html',
        'index.html',
        'test.html'
    ];
    
    for (const fileName of htmlFiles) {
        const filePath = path.join(projectRoot, fileName);
        
        try {
            await fs.access(filePath);
            const content = await fs.readFile(filePath, 'utf8');
            const result = checker.validateHTML(content);
            
            filesChecked++;
            
            console.log(`  📄 ${fileName}:`);
            if (result.isValid) {
                console.log(`     ✅ Valid (${result.scriptBlockCount} script blocks)`);
            } else {
                console.log(`     ❌ ${result.errors.length} error(s)`);
                result.errors.forEach(error => {
                    console.log(`        - ${error.message} (line ${error.line})`);
                });
                errors += result.errors.length;
            }
            
            if (result.warnings.length > 0) {
                console.log(`     ⚠️  ${result.warnings.length} warning(s)`);
                result.warnings.forEach(warning => {
                    console.log(`        - ${warning.message}`);
                });
                warnings += result.warnings.length;
            }
            
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.log(`  ❌ ${fileName}: Error reading file - ${error.message}`);
                errors++;
            }
            // ファイルが存在しない場合はスキップ
        }
    }
    
    return { errors, warnings, filesChecked };
}

/**
 * JavaScriptモジュールの検証
 */
async function validateJavaScriptModules() {
    const validator = new JavaScriptModuleValidator();
    let errors = 0;
    let warnings = 0;
    let filesChecked = 0;
    
    // 重要なJavaScriptファイル
    const jsFiles = [
        'src/core/LocalizationManager.js',
        'src/core/GameEngine.js',
        'src/managers/ScoreManager.js',
        'src/utils/syntax-validation/HTMLJavaScriptChecker.js',
        'src/utils/syntax-validation/JavaScriptModuleValidator.js'
    ];
    
    for (const fileName of jsFiles) {
        const filePath = path.join(projectRoot, fileName);
        
        try {
            await fs.access(filePath);
            const content = await fs.readFile(filePath, 'utf8');
            const result = await validator.validateModule(content, fileName);
            
            filesChecked++;
            
            console.log(`  📦 ${fileName}:`);
            if (result.isValid) {
                const stats = result.statistics;
                console.log(`     ✅ Valid (${stats.classes}c/${stats.functions}f/${stats.imports}i/${stats.exports}e)`);
            } else {
                console.log(`     ❌ ${result.errors.length} error(s)`);
                result.errors.forEach(error => {
                    console.log(`        - ${error.message} (line ${error.line})`);
                });
                errors += result.errors.length;
            }
            
            if (result.warnings.length > 0) {
                console.log(`     ⚠️  ${result.warnings.length} warning(s)`);
                result.warnings.forEach(warning => {
                    console.log(`        - ${warning.message}`);
                });
                warnings += result.warnings.length;
            }
            
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.log(`  ❌ ${fileName}: Error reading file - ${error.message}`);
                errors++;
            }
            // ファイルが存在しない場合はスキップ
        }
    }
    
    return { errors, warnings, filesChecked };
}

/**
 * リソースファイルの検証
 */
async function validateResources() {
    let errors = 0;
    let warnings = 0;
    let filesChecked = 0;
    
    // 必要なリソースファイル
    const requiredResources = [
        { path: 'favicon.ico', required: true },
        { path: 'favicon-32x32.png', required: false },
        { path: 'favicon-16x16.png', required: false }
    ];
    
    for (const resource of requiredResources) {
        const filePath = path.join(projectRoot, resource.path);
        
        try {
            const stats = await fs.stat(filePath);
            filesChecked++;
            
            console.log(`  📁 ${resource.path}:`);
            console.log(`     ✅ Found (${stats.size} bytes)`);
            
            if (stats.size === 0) {
                console.log(`     ⚠️  File is empty`);
                warnings++;
            }
            
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log(`  📁 ${resource.path}:`);
                if (resource.required) {
                    console.log(`     ❌ Missing (required)`);
                    errors++;
                } else {
                    console.log(`     ⚠️  Missing (optional)`);
                    warnings++;
                }
            } else {
                console.log(`  ❌ ${resource.path}: Error checking file - ${error.message}`);
                errors++;
            }
        }
    }
    
    return { errors, warnings, filesChecked };
}

/**
 * コマンドライン引数の処理
 */
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        verbose: false,
        htmlOnly: false,
        jsOnly: false,
        resourcesOnly: false
    };
    
    args.forEach(arg => {
        switch (arg) {
            case '--verbose':
            case '-v':
                options.verbose = true;
                break;
            case '--html-only':
                options.htmlOnly = true;
                break;
            case '--js-only':
                options.jsOnly = true;
                break;
            case '--resources-only':
                options.resourcesOnly = true;
                break;
            case '--help':
            case '-h':
                console.log(`
Usage: node validate-syntax.js [options]

Options:
  --verbose, -v      Show detailed output
  --html-only        Only validate HTML files
  --js-only          Only validate JavaScript modules
  --resources-only   Only validate resource files
  --help, -h         Show this help message

Examples:
  node validate-syntax.js
  node validate-syntax.js --verbose
  node validate-syntax.js --html-only
`);
                process.exit(0);
                break;
        }
    });
    
    return options;
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
    const options = parseArguments();
    runSyntaxValidation(options).catch(error => {
        console.error('❌ Syntax validation script failed:', error);
        process.exit(1);
    });
}