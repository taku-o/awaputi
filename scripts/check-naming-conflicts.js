#!/usr/bin/env node

import { NamingConflictDetector } from '../src/utils/validation/NamingConflictDetector.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * 命名競合をチェックして結果を表示
 */
async function checkNamingConflicts() {
    console.log('🔍 Checking for naming conflicts...');
    console.log(`Project root: ${projectRoot}`);
    
    const detector = new NamingConflictDetector({
        projectRoot,
        detectFileNames: true,
        detectClassNames: true,
        detectFunctionNames: true,
        warningLevel: 'strict'
    });
    
    try {
        const report = await detector.generateReport();
        
        console.log('\n📊 Naming Conflict Report:');
        console.log('============================');
        console.log(`Total files scanned: ${report.summary.totalFiles}`);
        console.log(`Total classes found: ${report.summary.totalClasses}`);
        console.log(`Total functions found: ${report.summary.totalFunctions}`);
        console.log(`Duplicate files: ${report.summary.duplicateFiles}`);
        console.log(`Duplicate classes: ${report.summary.duplicateClasses}`);
        console.log(`Duplicate functions: ${report.summary.duplicateFunctions}`);
        
        let hasConflicts = false;
        
        // ファイル名競合を表示
        if (report.conflicts.files.length > 0) {
            console.log('\n❌ File Name Conflicts:');
            console.log('------------------------');
            report.conflicts.files.forEach(conflict => {
                hasConflicts = true;
                console.log(`📄 "${conflict.name}" (${conflict.count} files):`);
                conflict.files.forEach(file => {
                    console.log(`   ${path.relative(projectRoot, file)}`);
                });
                console.log();
            });
        }
        
        // クラス名競合を表示
        if (report.conflicts.classes.length > 0) {
            console.log('\n❌ Class Name Conflicts:');
            console.log('------------------------');
            report.conflicts.classes.forEach(conflict => {
                hasConflicts = true;
                console.log(`🏗️  "${conflict.name}" (${conflict.count} occurrences):`);
                conflict.occurrences.forEach(occurrence => {
                    console.log(`   ${path.relative(projectRoot, occurrence.file)}:${occurrence.line}`);
                });
                console.log();
            });
        }
        
        // 関数名競合を表示
        if (report.conflicts.functions.length > 0) {
            console.log('\n⚠️  Function Name Conflicts:');
            console.log('----------------------------');
            report.conflicts.functions.forEach(conflict => {
                console.log(`⚙️  "${conflict.name}" (${conflict.count} occurrences):`);
                conflict.occurrences.forEach(occurrence => {
                    console.log(`   ${path.relative(projectRoot, occurrence.file)}:${occurrence.line}`);
                });
                console.log();
            });
        }
        
        // 推奨事項を表示
        if (report.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            console.log('-------------------');
            report.recommendations.forEach((rec, index) => {
                const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
                console.log(`${index + 1}. ${priority} ${rec.message}`);
                console.log(`   Action: ${rec.action}`);
                console.log();
            });
        }
        
        // レポートファイルを保存
        const reportPath = path.join(projectRoot, 'naming-conflicts-report.json');
        await saveReport(report, reportPath);
        console.log(`📋 Report saved to: ${path.relative(projectRoot, reportPath)}`);
        
        // 結果判定
        if (hasConflicts) {
            console.log('\n❌ Naming conflicts detected!');
            console.log('Please resolve conflicts before proceeding.');
            process.exit(1);
        } else {
            console.log('\n✅ No critical naming conflicts found!');
            if (report.conflicts.functions.length > 0) {
                console.log('⚠️  Some function name duplications exist but are not critical.');
            }
            process.exit(0);
        }
        
    } catch (error) {
        console.error('❌ Error checking naming conflicts:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/**
 * 特定の名前の競合をチェック
 * @param {string} name - チェック対象の名前
 * @param {string} type - 名前の種類 (file|class|function)
 * @param {string} context - コンテキスト（ファイルパス等）
 */
async function checkSpecificName(name, type, context = '') {
    console.log(`🔍 Checking ${type} name: "${name}"`);
    if (context) {
        console.log(`Context: ${context}`);
    }
    
    const detector = new NamingConflictDetector({
        projectRoot,
        warningLevel: 'strict'
    });
    
    try {
        const result = await detector.checkNamingConflict(name, type, context);
        
        console.log('\n📊 Conflict Check Result:');
        console.log('=========================');
        console.log(`Name: ${name}`);
        console.log(`Type: ${type}`);
        console.log(`Has Conflict: ${result.hasConflict ? 'YES' : 'NO'}`);
        console.log(`Level: ${result.conflictLevel.toUpperCase()}`);
        console.log(`Message: ${result.message}`);
        
        if (result.conflicts.length > 0) {
            console.log('\nConflicting with:');
            if (type === 'file') {
                result.conflicts.forEach(conflictPath => {
                    console.log(`  📄 ${path.relative(projectRoot, conflictPath)}`);
                });
            } else {
                result.conflicts.forEach(conflict => {
                    console.log(`  🏗️  ${path.relative(projectRoot, conflict.file)}:${conflict.line}`);
                });
            }
        }
        
        if (result.suggestions.length > 0) {
            console.log('\n💡 Suggested alternatives:');
            result.suggestions.forEach((suggestion, index) => {
                console.log(`  ${index + 1}. ${suggestion}`);
            });
        }
        
        process.exit(result.hasConflict ? 1 : 0);
        
    } catch (error) {
        console.error('❌ Error checking specific name:', error.message);
        process.exit(1);
    }
}

/**
 * レポートをファイルに保存
 * @param {Object} report - レポートオブジェクト
 * @param {string} filePath - 保存先パス
 */
async function saveReport(report, filePath) {
    const fs = await import('fs');
    await fs.promises.writeFile(filePath, JSON.stringify(report, null, 2));
}

/**
 * ヘルプメッセージを表示
 */
function showHelp() {
    console.log(`
Usage: ${path.basename(process.argv[1])} [options]

Options:
  --help, -h           Show this help message
  --name <name>        Check specific name for conflicts
  --type <type>        Type of name to check (file|class|function)
  --context <path>     Context information (file path)

Examples:
  ${path.basename(process.argv[1])}                                    # Check all naming conflicts
  ${path.basename(process.argv[1])} --name "MyClass" --type class      # Check if "MyClass" conflicts
  ${path.basename(process.argv[1])} --name "utils.js" --type file      # Check if "utils.js" conflicts
`);
}

// コマンドライン引数を解析
const args = process.argv.slice(2);
const options = {};
let i = 0;

while (i < args.length) {
    switch (args[i]) {
        case '--help':
        case '-h':
            showHelp();
            process.exit(0);
            break;
        case '--name':
            options.name = args[++i];
            break;
        case '--type':
            options.type = args[++i];
            break;
        case '--context':
            options.context = args[++i];
            break;
        default:
            console.error(`Unknown option: ${args[i]}`);
            process.exit(1);
    }
    i++;
}

// 実行
if (options.name && options.type) {
    // 特定の名前をチェック
    checkSpecificName(options.name, options.type, options.context);
} else if (options.name || options.type) {
    console.error('Both --name and --type are required when checking specific names');
    process.exit(1);
} else {
    // 全体をチェック
    checkNamingConflicts();
}