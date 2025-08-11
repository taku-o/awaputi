#!/usr/bin/env node

import { ReportGenerator } from '../src/utils/validation/ReportGenerator.js';
import { ValidationEngine } from '../src/utils/validation/ValidationEngine.js';
import { NamingConflictDetector } from '../src/utils/validation/NamingConflictDetector.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Issue #131 JavaScript クラス名重複解決プロジェクトの最終レポート生成
 */
async function generateFinalReport() {
    console.log('📊 Generating comprehensive project report for Issue #131...');
    console.log(`Project root: ${projectRoot}`);
    console.log('='.repeat(60));
    
    try {
        // ReportGeneratorでメインレポートを生成
        const reportGenerator = new ReportGenerator({
            projectRoot,
            includeStatistics: true,
            includeChangeLog: true,
            includeImpactAnalysis: true,
            includeRecommendations: true,
            outputFormat: 'both'
        });
        
        console.log('🔍 Step 1: Generating comprehensive project report...');
        const comprehensiveReport = await reportGenerator.generateComprehensiveReport();
        
        // レポートを保存
        console.log('💾 Step 2: Saving reports to files...');
        const outputDir = path.join(projectRoot, 'reports');
        const savedReports = await reportGenerator.saveReport(comprehensiveReport, outputDir);
        
        // 現在の命名競合状況を確認
        console.log('🔍 Step 3: Verifying current naming conflicts...');
        const conflictDetector = new NamingConflictDetector({
            projectRoot,
            warningLevel: 'strict'
        });
        
        const conflictReport = await conflictDetector.generateReport();
        
        // コード検証を実行
        console.log('🔍 Step 4: Running final code validation...');
        const validator = new ValidationEngine({
            projectRoot,
            validateSyntax: true,
            validateImports: true,
            validateExports: true,
            validateReferences: true
        });
        
        const validationTargets = [
            'src/core/',
            'src/debug/',
            'src/analytics/',
            'src/audio/',
            'src/scenes/',
            'src/ui/',
            'src/utils/',
            'src/utils/validation/'
        ];
        
        const validationReport = await validator.validateTargets(validationTargets);
        
        // 最終レポート結果を表示
        console.log('\n📋 FINAL REPORT SUMMARY');
        console.log('='.repeat(60));
        
        console.log('\n✅ Project Completion Status:');
        console.log(`   Tasks Completed: ${comprehensiveReport.summary.tasksCompleted}/${comprehensiveReport.summary.totalTasks}`);
        console.log(`   Completion Rate: ${comprehensiveReport.summary.completionPercentage}%`);
        console.log(`   Status: ${comprehensiveReport.summary.completionStatus}`);
        
        console.log('\n📊 Duplications Resolved:');
        console.log(`   Total Classes: ${comprehensiveReport.statistics.duplicationsResolved.totalClasses}`);
        console.log(`   Total Files: ${comprehensiveReport.statistics.duplicationsResolved.totalFiles}`);
        console.log(`   Files Renamed: ${comprehensiveReport.statistics.filesModified.renamed}`);
        console.log(`   Files Updated: ${comprehensiveReport.statistics.filesModified.updated}`);
        console.log(`   New Files Created: ${comprehensiveReport.statistics.filesModified.created}`);
        
        console.log('\n🎯 Naming Strategies Applied:');
        for (const [strategy, count] of Object.entries(comprehensiveReport.statistics.namingStrategies)) {
            console.log(`   ${strategy}: ${count} applications`);
        }
        
        console.log('\n🔍 Current Conflict Status:');
        console.log(`   Duplicate Files: ${conflictReport.conflicts.files.length}`);
        console.log(`   Duplicate Classes: ${conflictReport.conflicts.classes.length}`);
        console.log(`   Duplicate Functions: ${conflictReport.conflicts.functions.length}`);
        
        console.log('\n✅ Code Validation Results:');
        console.log(`   Total Files Validated: ${validationReport.summary.totalFiles}`);
        console.log(`   Success Rate: ${validationReport.summary.successRate}%`);
        console.log(`   Files with Errors: ${validationReport.summary.errorFiles}`);
        console.log(`   Files with Warnings: ${validationReport.summary.warningFiles}`);
        
        if (validationReport.summary.errorFiles > 0) {
            console.log('\n❌ Validation Errors Found:');
            validationReport.errors.slice(0, 5).forEach((error, index) => {
                console.log(`   ${index + 1}. ${path.relative(projectRoot, error.file)}: ${error.error}`);
            });
            if (validationReport.errors.length > 5) {
                console.log(`   ... and ${validationReport.errors.length - 5} more errors`);
            }
        }
        
        console.log('\n📁 Generated Reports:');
        for (const [format, filePath] of Object.entries(savedReports)) {
            console.log(`   ${format.toUpperCase()}: ${path.relative(projectRoot, filePath)}`);
        }
        
        // 推奨事項を表示
        console.log('\n💡 Key Recommendations:');
        comprehensiveReport.recommendations.slice(0, 3).forEach((rec, index) => {
            const priority = rec.priority === 'High' ? '🔴' : rec.priority === 'Medium' ? '🟡' : '🟢';
            console.log(`   ${index + 1}. ${priority} ${rec.recommendation}`);
            console.log(`      Implementation: ${rec.implementation}`);
        });
        
        // 将来の防止措置
        console.log('\n🛡️  Future Prevention Measures:');
        console.log(`   - Automatic Validation: ${comprehensiveReport.futurePreventionMeasures.automaticValidation.description}`);
        console.log(`   - Development Guidelines: Domain-based, Function-level, Context-specific naming`);
        console.log(`   - Tool Integration: ValidationEngine, NamingConflictDetector in CI/CD`);
        
        // 最終判定
        console.log('\n🎉 PROJECT STATUS:');
        if (conflictReport.conflicts.files.length === 0 && 
            conflictReport.conflicts.classes.length === 0 && 
            validationReport.summary.errorFiles === 0) {
            console.log('   ✅ SUCCESS: All major duplications resolved and validated!');
            console.log('   📝 Ready for final commit and PR creation.');
            process.exit(0);
        } else {
            console.log('   ⚠️  MINOR ISSUES: Some items may need attention:');
            if (conflictReport.conflicts.files.length > 0) {
                console.log(`      - ${conflictReport.conflicts.files.length} file name conflicts remaining`);
            }
            if (conflictReport.conflicts.classes.length > 0) {
                console.log(`      - ${conflictReport.conflicts.classes.length} class name conflicts remaining`);
            }
            if (validationReport.summary.errorFiles > 0) {
                console.log(`      - ${validationReport.summary.errorFiles} files with validation errors`);
            }
            console.log('   📝 Review and address remaining issues before final commit.');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Failed to generate final report:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// ヘルプ表示
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Usage: ${path.basename(process.argv[1])} [options]

Options:
  --help, -h    Show this help message

This script generates a comprehensive final report for Issue #131 (JavaScript Class Name Deduplication).
It combines data from ReportGenerator, ValidationEngine, and NamingConflictDetector to provide
a complete overview of the project completion status.

The script will:
1. Generate comprehensive project report
2. Save reports in JSON and Markdown formats
3. Verify current naming conflicts
4. Run final code validation
5. Display summary and recommendations
6. Exit with status code 0 if successful, 1 if issues remain
`);
    process.exit(0);
}

// メイン実行
generateFinalReport();