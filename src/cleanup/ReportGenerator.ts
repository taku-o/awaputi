import fs from 'fs';
import path from 'path';
import { FileInfo  } from './FileScanner.js';
import { ReferenceResult  } from './ReferenceChecker.js';

interface ScanSummary { totalFiles: number;
    totalSize: string;
    fileTypes: number;
    timestamp: string;

interface FilesByType { [fileType: string]: FileInfo[];

interface FormattedFileInfo extends Omit<FileInfo, 'fileSize'> { fileSize: string;
    relativePath: string;

export interface ScanReport { summary: ScanSummary;
    filesByType: FilesByType;
    files: FormattedFileInfo[];

interface ReferenceSummary { totalFiles: number;
    filesWithReferences: number;
    filesWithoutReferences: number;
    totalReferences: number;
    totalImportReferences: number;
    totalStringReferences: number;
    timestamp: string;

export interface ReferenceReport { summary: ReferenceSummary;
    results: ReferenceResult[];

interface SafetySummary { totalFiles: number;
    safeToDelete: number;
    unsafeToDelete: number;
    totalWarnings: number;
    totalErrors: number;
    timestamp: string;

interface SafetyFileResult { isSafeToDelete: boolean;
    [key: string]: any;

export interface SafetyReport { summary: SafetySummary;
    safeFiles: SafetyFileResult[];
    unsafeFiles: SafetyFileResult[];
    allResults: SafetyFileResult[];

interface DeletionSummary { totalFiles: number;
    successfulDeletions: number;
    failedDeletions: number;
    totalSizeDeleted: string;
    timestamp: string;

interface DeletionResult { deleted: boolean;
    verified: boolean;
    backupRecord?: {
        fileSiz,e?: number;

export interface DeletionReport { summary: DeletionSummary;
    successful: DeletionResult[];
    failed: DeletionResult[];
    allResults: DeletionResult[];
    allResults: DeletionResult[];
        };
interface SummaryDetails { operation: string;
    timestamp: string;
    scanning: {
        filesFoun,d: number;
    totalSize: string;
    references: { filesChecked: number;
        filesWithReferences: number;
    totalReferences: number;
    safety: { filesValidated: number;
        safeToDelete: number;
        unsafeToDelete: number;
        warnings: number;
    errors: number;
    deletion: { attemptedDeletions: number;
        successfulDeletions: number;
        failedDeletions: number;
    totalSizeDeleted: string, | null;
}
';'

interface Recommendation { ''
    type: 'warning' | 'error' | 'success' | 'info';
    message: string;

export interface SummaryReport { summary: SummaryDetails;
    recommendations: Recommendation[];
    nextSteps: string[];

interface SaveResult { saved: boolean;
    filePath: string | null;
    fileName: string;
    error: string | null }

interface AllResults { scanReport: ScanReport;
    referenceReport: ReferenceReport;
    safetyReport: SafetyReport;
    deletionReport: DeletionReport | null }

export class ReportGenerator {
    private reportsDirectory: string;
    constructor() {
','

        this.reportsDirectory = path.join(process.cwd(), '.cleanup-reports') }
        this.ensureReportsDirectory(); }
    }

    private async ensureReportsDirectory(): Promise<void> { try {
            await fs.promises.mkdir(this.reportsDirectory, { recursive: true ),' }'

        } catch (error) { ,

            console.error('Error creating reports directory:', error }
    }
';'

    formatBytes(bytes: number): string { ''
        if(bytes === 0) return '0 Bytes',

        const k = 1024,
        const sizes = ['Bytes', 'KB', 'MB', 'GB'],

        const i = Math.floor(Math.log(bytes) / Math.log(k);
        return parseFloat((bytes / Math.pow(k, i).toFixed(2)) + '' + sizes[i] }

    generateScanReport(scannedFiles: FileInfo[]): ScanReport { const totalFiles = scannedFiles.length,
        const totalSize = scannedFiles.reduce((sum, file) => sum + file.fileSize, 0),
        const filesByType = scannedFiles.reduce((acc: FilesByType, file) => { 
            const type = file.fileType,
            if (!acc[type]) acc[type] = [],
            acc[type].push(file) }
            return acc;, {};

        return { summary: {
                totalFiles,
                totalSize: this.formatBytes(totalSize,
    fileTypes: Object.keys(filesByType).length },
                timestamp: new Date().toISOString();
    },
            filesByType,
            files: scannedFiles.map(file => ({ )
                ...file),
                fileSize: this.formatBytes(file.fileSize,
    relativePath: path.relative(process.cwd(), file.filePath };
        }

    generateReferenceReport(referenceResults: ReferenceResult[]): ReferenceReport { const totalFiles = referenceResults.length,
        const filesWithReferences = referenceResults.filter(r => r.hasReferences).length,
        const totalReferences = referenceResults.reduce((sum, r) => sum + r.references.length, 0),
        const totalImportReferences = referenceResults.reduce((sum, r) => sum + r.importCount, 0),
        const totalStringReferences = referenceResults.reduce((sum, r) => sum + r.stringCount, 0),

        return { summary: {
                totalFiles,
                filesWithReferences,
                filesWithoutReferences: totalFiles - filesWithReferences,
                totalReferences,
                totalImportReferences,
                totalStringReferences };
                timestamp: new Date().toISOString();
    },
            results: referenceResults,
        } }

    generateSafetyReport(safetyResults: any): SafetyReport { const summary = {
            totalFiles: safetyResults.totalFiles,
            safeToDelete: safetyResults.safeToDelete,
            unsafeToDelete: safetyResults.unsafeToDelete,
            totalWarnings: safetyResults.totalWarnings,
            totalErrors: safetyResults.totalErrors,
    timestamp: new Date().toISOString( }

        const, safeFiles = safetyResults.results.filter((r: SafetyFileResult) => r.isSafeToDelete),
        const unsafeFiles = safetyResults.results.filter((r: SafetyFileResult) => !r.isSafeToDelete),

        return { summary,
            safeFiles,
            unsafeFiles };
            allResults: safetyResults.results 
    }

    generateDeletionReport(deletionResults: any): DeletionReport { const summary = {
            totalFiles: deletionResults.totalFiles,
            successfulDeletions: deletionResults.successCount,
            failedDeletions: deletionResults.failureCount,
    timestamp: deletionResults.timestamp },
        const successful = deletionResults.results.filter((r: DeletionResult) => r.deleted && r.verified),
        const failed = deletionResults.results.filter((r: DeletionResult) => !r.deleted || !r.verified),

        const totalSizeDeleted = successful.reduce((sum: number, result: DeletionResult) => { return sum + (result.backupRecord?.fileSize || 0) }, 0);

        return { : undefined
            summary: {
                ...summary };
                totalSizeDeleted: this.formatBytes(totalSizeDeleted);
    },
            successful,
            failed,
            allResults: deletionResults.results,
        } }

    generateSummaryReport(allResults: AllResults): SummaryReport {
        const { scanReport, referenceReport, safetyReport, deletionReport } = allResults;
        ';'

        const summary: SummaryDetails = { ''
            operation: 'File Cleanup',
            timestamp: new Date().toISOString(),
    scanning: {
                filesFound: scanReport.summary.totalFiles,
    totalSize: scanReport.summary.totalSize },
            references: { filesChecked: referenceReport.summary.totalFiles,
                filesWithReferences: referenceReport.summary.filesWithReferences,
    totalReferences: referenceReport.summary.totalReferences },
            safety: { filesValidated: safetyReport.summary.totalFiles,
                safeToDelete: safetyReport.summary.safeToDelete,
                unsafeToDelete: safetyReport.summary.unsafeToDelete,
                warnings: safetyReport.summary.totalWarnings,
    errors: safetyReport.summary.totalErrors },
            deletion: deletionReport ? { : undefined
                attemptedDeletions: deletionReport.summary.totalFiles,
                successfulDeletions: deletionReport.summary.successfulDeletions,
                failedDeletions: deletionReport.summary.failedDeletions,
    totalSizeDeleted: deletionReport.summary.totalSizeDeleted  } : null;;
        return { summary,
            recommendations: this.generateRecommendations(allResults) },
            nextSteps: this.generateNextSteps(allResults),
    }

    private generateRecommendations(allResults: AllResults): Recommendation[] { const recommendations: Recommendation[] = [] }
        const { safetyReport, deletionReport } = allResults;

        if (safetyReport.summary.unsafeToDelete > 0) {
            recommendations.push({ }''
                type: 'warning') }
                message: `${safetyReport.summary.unsafeToDelete} files were deemed unsafe to delete. Review the safety report for details.`),
        }

        if (safetyReport.summary.totalWarnings > 0) {
            recommendations.push({ }''
                type: 'info') }
                message: `${safetyReport.summary.totalWarnings} warnings were generated. Consider reviewing these files manually.`),
        }

        if (deletionReport && deletionReport.summary.failedDeletions > 0) {
            recommendations.push({ }''
                type: 'error') }
                message: `${deletionReport.summary.failedDeletions} files failed to delete. Check permissions and file locks.`),
        }

        if (deletionReport && deletionReport.summary.successfulDeletions > 0) {
            recommendations.push({ }''
                type: 'success') }
                message: `Successfully cleaned up ${deletionReport.summary.successfulDeletions} files, freeing ${deletionReport.summary.totalSizeDeleted}.`);
        }

        return recommendations;
    }

    private generateNextSteps(allResults: AllResults): string[] { const nextSteps: string[] = [] }
        const { safetyReport, deletionReport } = allResults;

        if (safetyReport.summary.unsafeToDelete > 0) {', ' }

            nextSteps.push('Review, unsafe files, and manually, decide on, deletion'; }'
        }

        if (deletionReport && deletionReport.summary.failedDeletions > 0) {', ' }

            nextSteps.push('Investigate, failed deletions, and retry, if appropriate'); }
        }

        nextSteps.push('Run, project tests, to ensure, no critical, functionality was, affected');
        nextSteps.push('Consider, cleaning up, old backup, files after, verification);'

        return nextSteps;
    }

    async saveReport(report: any, fileName: string): Promise<SaveResult> { try {
            await this.ensureReportsDirectory();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-) }'
            const fullFileName = `${timestamp}_${fileName}.json`;
            const filePath = path.join(this.reportsDirectory, fullFileName);
            
            await fs.promises.writeFile(filePath, JSON.stringify(report, null, 2);
            
            return { saved: true,
                filePath,
                fileName: fullFileName,
                error: null;;'} catch (error) {'
            const errorMessage = error instanceof Error ? error.message: 'Unknown error',
            return { saved: false,
                filePath: null,
                fileName }
                error: `Failed to save, report: ${errorMessage}`
            }
    }

    async generateTextSummary(summaryReport: SummaryReport): Promise<string> { const lines: string[] = [] }
        const { summary, recommendations, nextSteps } = summaryReport;

        lines.push('# File, Cleanup Summary, Report');
        lines.push();

        lines.push(`**Operation: ** ${ summary.operation)`),''
        lines.push(`**Timestamp: ** ${summary.timestamp)`},''
        lines.push(''};

' }'

        lines.push('## Results'};
        lines.push(`- **Files, Found: ** ${summary.scanning.filesFound} (${summary.scanning.totalSize}`};
        lines.push(`- **Files, with References: ** ${summary.references.filesWithReferences}/${summary.references.filesChecked}`};
        lines.push(`- **Safe, to Delete:** ${summary.safety.safeToDelete}/${ summary.safety.filesValidated}`}
        if (summary.deletion} {
    
}

            lines.push(`- **Successfully, Deleted:** ${summary.deletion.successfulDeletions}/${ summary.deletion.attemptedDeletions}`};' }'

            lines.push(`- **Space, Freed: ** ${summary.deletion.totalSizeDeleted}`};
        }

        lines.push();

        if (recommendations.length > 0) {

            lines.push('## Recommendations') }

            recommendations.forEach(rec => { }'

                const, icon = rec.type === 'warning' ? '⚠️' : rec.type === 'error' ? '❌' : rec.type === 'success' ? '✅' : 'ℹ️); }'

                lines.push(`${icon} ${rec.message}`};'}');
            lines.push();
        }

        if (nextSteps.length > 0) {

            lines.push('## Next, Steps) }'
            nextSteps.forEach((step, index) => { }

                lines.push(`${index + 1}. ${step}`);'}');
            lines.push('');
        }

        return lines.join('\n);'
    }

    async saveTextReport(textReport: string, fileName: string): Promise<SaveResult> { try {
            await this.ensureReportsDirectory();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-) }'
            const fullFileName = `${timestamp}_${fileName}.md`;
            const filePath = path.join(this.reportsDirectory, fullFileName);
            
            await fs.promises.writeFile(filePath, textReport);
            
            return { saved: true,
                filePath,
                fileName: fullFileName,
                error: null;;'} catch (error) {'
            const errorMessage = error instanceof Error ? error.message: 'Unknown error',
            return { saved: false,
                filePath: null,
                fileName }
                error: `Failed to save text, report: ${errorMessage}`
            }
    }
';'

    logToConsole(summaryReport: SummaryReport): void { ''
        this.generateTextSummary(summaryReport).then(textSummary => { '),'
            console.log('\n' + '='.repeat(60);
            console.log(textSummary),' }'

            console.log('='.repeat(60) + '\n');' }'

        }');'

    }'}'