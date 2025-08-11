#!/usr/bin/env node

import { ValidationEngine } from '../src/utils/validation/ValidationEngine.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * プロジェクト全体の検証を実行
 */
async function validateProject() {
    console.log('🔍 Starting project validation...');
    console.log(`Project root: ${projectRoot}`);
    
    const validator = new ValidationEngine({
        projectRoot,
        validateSyntax: true,
        validateImports: true,
        validateExports: true,
        validateReferences: true
    });
    
    try {
        // 検証対象ディレクトリを指定
        const targets = [
            'src/',
            // 特に変更したファイルを重点的にチェック
            'src/ui/data-management-ui/',
            'src/scenes/components/',
            'src/utils/advanced-rendering-optimizer/',
            'src/utils/rendering/',
            'src/core/',
            'src/debug/',
            'src/analytics/',
            'src/audio/'
        ];
        
        console.log(`Validating targets: ${targets.join(', ')}`);
        
        const report = await validator.validateTargets(targets);
        
        // 結果を表示
        console.log('\n📊 Validation Results:');
        console.log('========================');
        console.log(`Total files processed: ${report.summary.totalFiles}`);
        console.log(`Valid files: ${report.summary.validFiles}`);
        console.log(`Files with errors: ${report.summary.errorFiles}`);
        console.log(`Files with warnings: ${report.summary.warningFiles}`);
        console.log(`Success rate: ${report.summary.successRate}%`);
        console.log(`Validation time: ${report.summary.duration}`);
        
        // エラーがある場合は詳細表示
        if (report.errors.length > 0) {
            console.log('\n❌ Errors found:');
            report.errors.forEach(({ file, error }, index) => {
                console.log(`${index + 1}. ${path.relative(projectRoot, file)}`);
                console.log(`   ${error}`);
            });
        }
        
        // 警告がある場合は表示
        if (report.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            report.warnings.slice(0, 10).forEach(({ file, warning }, index) => {
                console.log(`${index + 1}. ${path.relative(projectRoot, file)}`);
                console.log(`   ${warning}`);
            });
            
            if (report.warnings.length > 10) {
                console.log(`   ... and ${report.warnings.length - 10} more warnings`);
            }
        }
        
        // レポートを保存
        const reportPath = path.join(projectRoot, 'validation-report.json');
        await validator.saveReport(report, reportPath);
        
        // 結果判定
        if (report.summary.errorFiles === 0) {
            console.log('\n✅ All files passed validation!');
            if (report.summary.warningFiles > 0) {
                console.log(`⚠️  However, there are ${report.summary.warningFiles} files with warnings.`);
            }
            process.exit(0);
        } else {
            console.log(`\n❌ Validation failed: ${report.summary.errorFiles} files have errors.`);
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Validation failed with error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/**
 * 特定のファイルまたはディレクトリを検証
 */
async function validateSpecificTarget(target) {
    console.log(`🔍 Validating specific target: ${target}`);
    
    const validator = new ValidationEngine({
        projectRoot,
        validateSyntax: true,
        validateImports: true,
        validateExports: true,
        validateReferences: true
    });
    
    try {
        const report = await validator.validateTargets([target]);
        
        console.log('\n📊 Validation Results:');
        console.log('========================');
        console.log(`Files processed: ${report.summary.totalFiles}`);
        console.log(`Success rate: ${report.summary.successRate}%`);
        
        if (report.errors.length > 0) {
            console.log('\n❌ Errors:');
            report.errors.forEach(({ file, error }) => {
                console.log(`${path.relative(projectRoot, file)}: ${error}`);
            });
        }
        
        if (report.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            report.warnings.forEach(({ file, warning }) => {
                console.log(`${path.relative(projectRoot, file)}: ${warning}`);
            });
        }
        
        return report.summary.errorFiles === 0;
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        return false;
    }
}

// コマンドライン引数を処理
const args = process.argv.slice(2);

if (args.length > 0) {
    // 特定のターゲットを検証
    const target = args[0];
    validateSpecificTarget(target)
        .then(success => process.exit(success ? 0 : 1))
        .catch(error => {
            console.error('Validation error:', error);
            process.exit(1);
        });
} else {
    // プロジェクト全体を検証
    validateProject();
}