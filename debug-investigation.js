import { BackupFileInvestigator } from './src/utils/backup-cleanup/BackupFileInvestigator.js';
import { ReferenceAnalyzer } from './src/utils/backup-cleanup/ReferenceAnalyzer.js';

async function debugInvestigation() {
    console.log('🔍 Debug Investigation for Issue #104');
    console.log('=====================================\n');

    const investigator = new BackupFileInvestigator();
    const referenceAnalyzer = new ReferenceAnalyzer();

    // 調査実行
    const investigationResults = await investigator.investigateTargetFiles();
    
    console.log('📋 Investigation Summary:');
    console.log(`Total files: ${investigationResults.length}`);
    console.log(`Files found: ${investigationResults.filter(r => r.exists).length}`);
    console.log(`Current files exist: ${investigationResults.filter(r => r.currentFileExists).length}\n`);

    // 各ファイルの詳細を確認
    for (const result of investigationResults) {
        console.log(`\n📄 ${result.filePath}`);
        console.log(`- Exists: ${result.exists}`);
        console.log(`- Current file exists: ${result.currentFileExists}`);
        
        if (result.sizeAnalysis && !result.sizeAnalysis.analyzeFailed) {
            console.log(`- Size: ${result.sizeAnalysis.bytes} bytes, ${result.sizeAnalysis.wordCount} words`);
        }

        if (result.exists) {
            // 参照分析
            console.log('\n🔗 Reference Analysis:');
            const referenceReport = await referenceAnalyzer.generateReferenceReport(result.filePath, {});
            
            console.log(`- Total references: ${referenceReport.summary.totalReferences}`);
            console.log(`- Import references: ${referenceReport.summary.importReferences}`);
            console.log(`- String references: ${referenceReport.summary.stringReferences}`);
            console.log(`- Active references: ${referenceReport.summary.activeReferences}`);
            console.log(`- Report file references: ${referenceReport.summary.reportFileReferences}`);
            console.log(`- Safe to delete: ${referenceReport.safetyAssessment.safeToDelete}`);

            // 具体的な参照を表示
            if (referenceReport.summary.activeReferences > 0) {
                console.log('\n⚠️ Active References Found:');
                const activeRefs = [
                    ...referenceReport.importAnalysis.importReferences,
                    ...referenceReport.stringAnalysis.activeReferences
                ];
                
                activeRefs.slice(0, 5).forEach((ref, index) => {
                    console.log(`  ${index + 1}. ${ref.file}:${ref.line} - ${ref.content.substring(0, 100)}...`);
                });
                
                if (activeRefs.length > 5) {
                    console.log(`  ... and ${activeRefs.length - 5} more`);
                }
            }
        }
    }
}

debugInvestigation().catch(console.error);