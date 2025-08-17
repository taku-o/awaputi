import fs from 'fs/promises';
import path from 'path';

// Type definitions
interface SizeAnalysisData {
    bytes: number;
    wordCount: number;
    analyzeFailed?: boolean;
}

interface GitHistoryData {
    hash: string;
    message: string;
    author: string;
    date: string;
}

interface InvestigationResult {
    filePath: string;
    exists: boolean;
    currentFileExists: boolean;
    investigationFailed: boolean;
    sizeAnalysis?: SizeAnalysisData;
    gitHistory?: GitHistoryData[];
}

interface InvestigationOverview {
    totalFilesInvestigated: number;
    filesFound: number;
    filesMissing: number;
    currentFilesExist: number;
    investigationErrors: number;
}

interface SizeAnalysisSummary {
    totalBytes: number;
    totalWords: number;
    averageFileSize: number;
    largestFile: FileSize | null;
    smallestFile: FileSize | null;
}

interface FileSize {
    file: string;
    size: number;
    words: number;
}

interface GitHistorySummary {
    filesWithHistory: number;
    filesWithoutHistory: number;
    commonCommitPatterns: CommitPattern[];
}

interface CommitPattern {
    pattern: string;
    count: number;
}

interface Recommendation {
    type: string;
    priority: string;
    message: string;
    files?: string[];
}

interface InvestigationSummary {
    overview: InvestigationOverview;
    sizeAnalysis: SizeAnalysisSummary;
    fileDetails: InvestigationResult[];
    gitHistory: GitHistorySummary;
    recommendations: Recommendation[];
    generatedAt: string;
}

interface DeletionSummaryData {
    totalFiles: number;
    attempted: number;
    succeeded: number;
    failed: number;
    skipped: number;
}

interface DeletionTiming {
    startTime: string;
    endTime: string;
    duration: number;
    averageTimePerFile: number;
}

interface BackupRecord {
    backupCreated: boolean;
    fileInfo: {
        size: number;
        wordCount: number;
    };
    gitInfo: {
        hasHistory: boolean;
        lastCommit: GitHistoryData;
    };
}

interface TestResult {
    passed: boolean;
    details?: string;
}

interface DeletionDetail {
    status: string;
    filePath: string;
    backupRecord?: BackupRecord;
    testResult?: TestResult;
}

interface DeletionResults {
    summary: DeletionSummaryData;
    startTime: string;
    endTime: string;
    duration: number;
    deletions: DeletionDetail[];
    errors: Error[];
}

interface DeletionOverview {
    totalFilesProcessed: number;
    filesAttempted: number;
    filesSucceeded: number;
    filesFailed: number;
    filesSkipped: number;
    successRate: number;
}

interface SizeReductionData {
    bytesFreed: number;
    wordsRemoved: number;
    estimatedDiskSavings: string;
}

interface BackupInfo {
    backupsCreated: number;
    recoveryPossible: number;
}

interface TestResults {
    postDeletionTestsPassed: number;
    postDeletionTestsFailed: number;
}

interface DeletionSummary {
    overview: DeletionOverview;
    timing: DeletionTiming;
    deletionDetails: DeletionDetail[];
    errors: Error[];
    sizeReduction: SizeReductionData;
    backupInfo: BackupInfo;
    testResults: TestResults;
    generatedAt: string;
}

interface FileSizeData {
    bytes: number;
    words: number;
}

interface BeforeAfterSizes {
    files: FileSizeData[];
}

interface SizeReductionStats {
    totalBytes: number;
    totalWords: number;
    fileCount: number;
}

interface ReductionMetrics {
    bytesFreed: number;
    wordsRemoved: number;
    filesRemoved: number;
    percentageReduction: number;
}

interface ImpactAssessment {
    repositorySizeReduction: string;
    searchPerformanceImprovement: string;
    maintenanceBenefits: string[];
}

interface SizeReduction {
    beforeDeletion: SizeReductionStats;
    afterDeletion: SizeReductionStats;
    reduction: ReductionMetrics;
    impact: ImpactAssessment;
    calculatedAt?: string;
}

interface RecoveryOverview {
    totalDeletedFiles: number;
    recoverableFiles: number;
    manualRecoveryRequired: number;
}

interface RecoveryMethod {
    filePath: string;
    type: string;
    instructions: string[];
    confidence: string;
}

interface RecoveryMethods {
    gitHistory: RecoveryMethod[];
    backup: RecoveryMethod[];
    manual: RecoveryMethod[];
}

interface RecoveryStep {
    step: number;
    title: string;
    description: string;
    commands: string[];
}

interface EmergencyProcedure {
    scenario: string;
    procedure: string[];
}

interface RecoveryInstructions {
    overview: RecoveryOverview;
    recoveryMethods: RecoveryMethods;
    stepByStepInstructions: RecoveryStep[];
    emergencyProcedures: EmergencyProcedure[];
    generatedAt: string;
}

interface ExecutiveSummary {
    projectName: string;
    issueNumber: string;
    operationType: string;
    operationDate: string;
    overallStatus: string;
    keyMetrics: Record<string, any>;
}

interface FinalRecommendations {
    immediate: string[];
    future: string[];
    bestPractices: string[];
}

interface Conclusion {
    operationSuccessful: boolean;
    risksIdentified: string[];
    benefitsAchieved: string[];
    nextSteps: string[];
}

interface Appendices {
    detailedLogs: any[];
    technicalDetails: Record<string, any>;
    references: string[];
}

interface AllResults {
    investigationSummary?: InvestigationSummary;
    deletionSummary?: DeletionSummary;
    integrityValidation?: any;
    sizeReduction?: SizeReduction;
    recoveryInstructions?: RecoveryInstructions;
    detailedLogs?: any[];
    technicalDetails?: Record<string, any>;
}

interface FinalReport {
    executiveSummary: ExecutiveSummary;
    investigationSummary?: InvestigationSummary;
    deletionSummary?: DeletionSummary;
    integrityValidation?: any;
    sizeReductionAnalysis?: SizeReduction;
    recoveryInformation?: RecoveryInstructions;
    recommendations: FinalRecommendations;
    conclusion: Conclusion;
    appendices: Appendices;
    generatedAt: string;
    reportVersion: string;
}

/**
 * CleanupReporter - バックアップファイルクリーンアップの包括的レポート生成クラス
 * Issue #104 のクリーンアップ作業の結果を詳細にレポートする機能を提供
 */
export class CleanupReporter {
    private reports: any[];

    constructor() {
        this.reports = [];
    }

    /**
     * 調査結果サマリーの生成
     */
    async generateInvestigationSummary(investigationResults: InvestigationResult[]): Promise<InvestigationSummary> {
        const summary: InvestigationSummary = {
            overview: {
                totalFilesInvestigated: investigationResults.length,
                filesFound: investigationResults.filter(r => r.exists).length,
                filesMissing: investigationResults.filter(r => !r.exists).length,
                currentFilesExist: investigationResults.filter(r => r.currentFileExists).length,
                investigationErrors: investigationResults.filter(r => r.investigationFailed).length
            },
            sizeAnalysis: {
                totalBytes: 0,
                totalWords: 0,
                averageFileSize: 0,
                largestFile: null,
                smallestFile: null
            },
            fileDetails: investigationResults,
            gitHistory: {
                filesWithHistory: 0,
                filesWithoutHistory: 0,
                commonCommitPatterns: []
            },
            recommendations: [],
            generatedAt: new Date().toISOString()
        };

        // サイズ分析
        const validSizeResults = investigationResults.filter(r => 
            r.sizeAnalysis && !r.sizeAnalysis.analyzeFailed
        );

        if (validSizeResults.length > 0) {
            summary.sizeAnalysis.totalBytes = validSizeResults.reduce(
                (sum, r) => sum + (r.sizeAnalysis?.bytes || 0), 0
            );
            summary.sizeAnalysis.totalWords = validSizeResults.reduce(
                (sum, r) => sum + (r.sizeAnalysis?.wordCount || 0), 0
            );
            summary.sizeAnalysis.averageFileSize = Math.round(
                summary.sizeAnalysis.totalBytes / validSizeResults.length
            );

            // 最大・最小ファイル
            const sizes: FileSize[] = validSizeResults.map(r => ({
                file: r.filePath,
                size: r.sizeAnalysis?.bytes || 0,
                words: r.sizeAnalysis?.wordCount || 0
            }));
            
            summary.sizeAnalysis.largestFile = sizes.reduce(
                (max, current) => current.size > max.size ? current : max
            );
            summary.sizeAnalysis.smallestFile = sizes.reduce(
                (min, current) => current.size < min.size ? current : min
            );
        }

        // Git履歴分析
        const filesWithHistory = investigationResults.filter(r => 
            r.gitHistory && Array.isArray(r.gitHistory) && r.gitHistory.length > 0
        );
        summary.gitHistory.filesWithHistory = filesWithHistory.length;
        summary.gitHistory.filesWithoutHistory = investigationResults.length - filesWithHistory.length;

        // 共通コミットパターン分析
        summary.gitHistory.commonCommitPatterns = this.analyzeCommitPatterns(filesWithHistory);

        // 推奨事項生成
        summary.recommendations = this.generateInvestigationRecommendations(investigationResults);

        return summary;
    }

    /**
     * 削除作業サマリーの生成
     */
    async generateDeletionSummary(deletionResults: DeletionResults): Promise<DeletionSummary> {
        const summary: DeletionSummary = {
            overview: {
                totalFilesProcessed: deletionResults.summary.totalFiles,
                filesAttempted: deletionResults.summary.attempted,
                filesSucceeded: deletionResults.summary.succeeded,
                filesFailed: deletionResults.summary.failed,
                filesSkipped: deletionResults.summary.skipped,
                successRate: 0
            },
            timing: {
                startTime: deletionResults.startTime,
                endTime: deletionResults.endTime,
                duration: deletionResults.duration,
                averageTimePerFile: 0
            },
            deletionDetails: deletionResults.deletions,
            errors: deletionResults.errors,
            sizeReduction: {
                bytesFreed: 0,
                wordsRemoved: 0,
                estimatedDiskSavings: '0 KB'
            },
            backupInfo: {
                backupsCreated: 0,
                recoveryPossible: 0
            },
            testResults: {
                postDeletionTestsPassed: 0,
                postDeletionTestsFailed: 0
            },
            generatedAt: new Date().toISOString()
        };

        // 成功率計算
        if (deletionResults.summary.attempted > 0) {
            summary.overview.successRate = Math.round(
                (deletionResults.summary.succeeded / deletionResults.summary.attempted) * 100
            );
        }

        // 平均処理時間
        if (deletionResults.summary.totalFiles > 0 && deletionResults.duration) {
            summary.timing.averageTimePerFile = Math.round(
                deletionResults.duration / deletionResults.summary.totalFiles
            );
        }

        // サイズ削減計算
        const successfulDeletions = deletionResults.deletions.filter(d => d.status === 'deleted');
        for (const deletion of successfulDeletions) {
            if (deletion.backupRecord && deletion.backupRecord.fileInfo) {
                summary.sizeReduction.bytesFreed += deletion.backupRecord.fileInfo.size;
                summary.sizeReduction.wordsRemoved += deletion.backupRecord.fileInfo.wordCount || 0;
            }
        }

        summary.sizeReduction.estimatedDiskSavings = this.formatBytes(summary.sizeReduction.bytesFreed);

        // バックアップ情報
        summary.backupInfo.backupsCreated = successfulDeletions.filter(
            d => d.backupRecord && d.backupRecord.backupCreated
        ).length;
        summary.backupInfo.recoveryPossible = successfulDeletions.filter(
            d => d.backupRecord && d.backupRecord.gitInfo && d.backupRecord.gitInfo.hasHistory
        ).length;

        // テスト結果
        summary.testResults.postDeletionTestsPassed = successfulDeletions.filter(
            d => d.testResult && d.testResult.passed
        ).length;
        summary.testResults.postDeletionTestsFailed = successfulDeletions.filter(
            d => d.testResult && !d.testResult.passed
        ).length;

        return summary;
    }

    /**
     * サイズ削減効果の計算
     */
    async calculateSizeReduction(beforeSizes: BeforeAfterSizes, afterSizes: BeforeAfterSizes): Promise<SizeReduction> {
        const reduction: SizeReduction = {
            beforeDeletion: {
                totalBytes: 0,
                totalWords: 0,
                fileCount: 0
            },
            afterDeletion: {
                totalBytes: 0,
                totalWords: 0,
                fileCount: 0
            },
            reduction: {
                bytesFreed: 0,
                wordsRemoved: 0,
                filesRemoved: 0,
                percentageReduction: 0
            },
            impact: {
                repositorySizeReduction: '0 KB',
                searchPerformanceImprovement: 'Low',
                maintenanceBenefits: []
            }
        };

        // 削除前の計算
        if (beforeSizes && beforeSizes.files) {
            for (const file of beforeSizes.files) {
                reduction.beforeDeletion.totalBytes += file.bytes || 0;
                reduction.beforeDeletion.totalWords += file.words || 0;
                reduction.beforeDeletion.fileCount++;
            }
        }

        // 削除後の計算
        if (afterSizes && afterSizes.files) {
            for (const file of afterSizes.files) {
                reduction.afterDeletion.totalBytes += file.bytes || 0;
                reduction.afterDeletion.totalWords += file.words || 0;
                reduction.afterDeletion.fileCount++;
            }
        }

        // 削減効果計算
        reduction.reduction.bytesFreed = reduction.beforeDeletion.totalBytes - reduction.afterDeletion.totalBytes;
        reduction.reduction.wordsRemoved = reduction.beforeDeletion.totalWords - reduction.afterDeletion.totalWords;
        reduction.reduction.filesRemoved = reduction.beforeDeletion.fileCount - reduction.afterDeletion.fileCount;

        if (reduction.beforeDeletion.totalBytes > 0) {
            reduction.reduction.percentageReduction = Math.round(
                (reduction.reduction.bytesFreed / reduction.beforeDeletion.totalBytes) * 100
            );
        }

        // 影響評価
        reduction.impact.repositorySizeReduction = this.formatBytes(reduction.reduction.bytesFreed);
        
        if (reduction.reduction.filesRemoved >= 5) {
            reduction.impact.searchPerformanceImprovement = 'High';
        } else if (reduction.reduction.filesRemoved >= 3) {
            reduction.impact.searchPerformanceImprovement = 'Medium';
        } else {
            reduction.impact.searchPerformanceImprovement = 'Low';
        }

        // メンテナンス効果
        reduction.impact.maintenanceBenefits = [
            `${reduction.reduction.filesRemoved}個の不要ファイルを削除`,
            `${reduction.impact.repositorySizeReduction}のディスク容量節約`,
            'IDE検索結果の整理',
            'プロジェクト構造の簡素化'
        ];

        reduction.calculatedAt = new Date().toISOString();
        return reduction;
    }

    /**
     * 復旧手順の作成
     */
    async createRecoveryInstructions(deletedFiles: DeletionDetail[]): Promise<RecoveryInstructions> {
        const instructions: RecoveryInstructions = {
            overview: {
                totalDeletedFiles: deletedFiles.length,
                recoverableFiles: 0,
                manualRecoveryRequired: 0
            },
            recoveryMethods: {
                gitHistory: [],
                backup: [],
                manual: []
            },
            stepByStepInstructions: [],
            emergencyProcedures: [],
            generatedAt: new Date().toISOString()
        };

        for (const file of deletedFiles) {
            const recoveryMethod = this.determineRecoveryMethod(file);
            
            switch (recoveryMethod.type) {
                case 'git_history':
                    instructions.overview.recoverableFiles++;
                    instructions.recoveryMethods.gitHistory.push(recoveryMethod);
                    break;
                case 'backup':
                    instructions.overview.recoverableFiles++;
                    instructions.recoveryMethods.backup.push(recoveryMethod);
                    break;
                case 'manual':
                    instructions.overview.manualRecoveryRequired++;
                    instructions.recoveryMethods.manual.push(recoveryMethod);
                    break;
            }
        }

        // ステップバイステップ手順
        instructions.stepByStepInstructions = this.generateStepByStepRecovery(instructions.recoveryMethods);
        
        // 緊急時手順
        instructions.emergencyProcedures = this.generateEmergencyProcedures(deletedFiles);

        return instructions;
    }

    /**
     * 最終レポートの生成
     */
    async generateFinalReport(allResults: AllResults): Promise<FinalReport> {
        const report: FinalReport = {
            executiveSummary: {
                projectName: 'BubblePop (awaputi)',
                issueNumber: 'Issue #104',
                operationType: 'Backup File Cleanup',
                operationDate: new Date().toISOString(),
                overallStatus: 'Unknown',
                keyMetrics: {}
            },
            investigationSummary: allResults.investigationSummary,
            deletionSummary: allResults.deletionSummary,
            integrityValidation: allResults.integrityValidation,
            sizeReductionAnalysis: allResults.sizeReduction,
            recoveryInformation: allResults.recoveryInstructions,
            recommendations: {
                immediate: [],
                future: [],
                bestPractices: []
            },
            conclusion: {
                operationSuccessful: false,
                risksIdentified: [],
                benefitsAchieved: [],
                nextSteps: []
            },
            appendices: {
                detailedLogs: allResults.detailedLogs || [],
                technicalDetails: allResults.technicalDetails || {},
                references: [
                    'Issue #104: https://github.com/taku-o/awaputi/issues/104',
                    'Issue #77: Large File Splitting Project',
                    'Project Documentation: docs/architecture.md'
                ]
            },
            generatedAt: new Date().toISOString(),
            reportVersion: '1.0.0'
        };

        // 全体ステータス判定
        report.executiveSummary.overallStatus = this.determineOverallStatus(allResults);
        
        // 主要メトリクス
        report.executiveSummary.keyMetrics = this.extractKeyMetrics(allResults);
        
        // 推奨事項
        report.recommendations = this.generateFinalRecommendations(allResults);
        
        // 結論
        report.conclusion = this.generateConclusion(allResults, report.executiveSummary.overallStatus);

        return report;
    }

    // Helper methods

    /**
     * コミットパターンの分析
     */
    analyzeCommitPatterns(filesWithHistory: InvestigationResult[]): CommitPattern[] {
        const patterns: Record<string, number> = {};
        
        for (const file of filesWithHistory) {
            if (file.gitHistory && Array.isArray(file.gitHistory)) {
                for (const commit of file.gitHistory) {
                    if (commit.message) {
                        const pattern = this.extractCommitPattern(commit.message);
                        patterns[pattern] = (patterns[pattern] || 0) + 1;
                    }
                }
            }
        }

        return Object.entries(patterns)
            .map(([pattern, count]) => ({ pattern, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    /**
     * コミットメッセージからパターンを抽出
     */
    extractCommitPattern(message: string): string {
        // Task番号やフェーズ情報を抽出
        if (message.includes('Task')) {
            return 'Task-related';
        } else if (message.includes('分割') || message.includes('split')) {
            return 'File splitting';
        } else if (message.includes('完了') || message.includes('complete')) {
            return 'Completion';
        } else if (message.includes('バックアップ') || message.includes('backup')) {
            return 'Backup creation';
        } else {
            return 'Other';
        }
    }

    /**
     * 調査推奨事項の生成
     */
    generateInvestigationRecommendations(investigationResults: InvestigationResult[]): Recommendation[] {
        const recommendations: Recommendation[] = [];
        
        const safeFiles = investigationResults.filter(r => 
            r.exists && r.currentFileExists && !r.investigationFailed
        );
        
        if (safeFiles.length > 0) {
            recommendations.push({
                type: 'proceed_with_deletion',
                priority: 'high',
                message: `${safeFiles.length}個のファイルは削除プロセスに進めます`,
                files: safeFiles.map(f => f.filePath)
            });
        }

        const problematicFiles = investigationResults.filter(r => 
            r.investigationFailed || !r.currentFileExists
        );
        
        if (problematicFiles.length > 0) {
            recommendations.push({
                type: 'manual_review',
                priority: 'high',
                message: `${problematicFiles.length}個のファイルは手動確認が必要です`,
                files: problematicFiles.map(f => f.filePath)
            });
        }

        return recommendations;
    }

    /**
     * バイト数のフォーマット
     */
    formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 復旧方法の決定
     */
    determineRecoveryMethod(deletedFile: DeletionDetail): RecoveryMethod {
        const method: RecoveryMethod = {
            filePath: deletedFile.filePath,
            type: 'manual',
            instructions: [],
            confidence: 'low'
        };

        if (deletedFile.backupRecord && deletedFile.backupRecord.gitInfo) {
            const gitInfo = deletedFile.backupRecord.gitInfo;
            
            if (gitInfo.hasHistory && gitInfo.lastCommit) {
                method.type = 'git_history';
                method.confidence = 'high';
                method.instructions = [
                    `git show ${gitInfo.lastCommit.hash}:"${deletedFile.filePath}" > "${deletedFile.filePath}"`,
                    `git add "${deletedFile.filePath}"`,
                    `git commit -m "復旧: ${path.basename(deletedFile.filePath)}"`
                ];
            }
        }

        if (method.type === 'manual') {
            method.instructions = [
                `対応する現在ファイルから手動で復旧を検討`,
                `プロジェクトの最新バックアップから復元`,
                `必要に応じて再実装`
            ];
        }

        return method;
    }

    /**
     * ステップバイステップ復旧手順の生成
     */
    generateStepByStepRecovery(recoveryMethods: RecoveryMethods): RecoveryStep[] {
        const steps: RecoveryStep[] = [];

        if (recoveryMethods.gitHistory.length > 0) {
            steps.push({
                step: 1,
                title: 'Git履歴からの復旧',
                description: 'Git履歴が利用可能なファイルを復旧します',
                commands: recoveryMethods.gitHistory.flatMap(method => method.instructions)
            });
        }

        if (recoveryMethods.backup.length > 0) {
            steps.push({
                step: steps.length + 1,
                title: 'バックアップからの復旧',
                description: 'バックアップ情報を使用してファイルを復旧します',
                commands: recoveryMethods.backup.flatMap(method => method.instructions)
            });
        }

        if (recoveryMethods.manual.length > 0) {
            steps.push({
                step: steps.length + 1,
                title: '手動復旧',
                description: '手動での復旧が必要なファイルの対処',
                commands: ['# 各ファイルの状況に応じて手動で対処してください']
            });
        }

        return steps;
    }

    /**
     * 緊急時手順の生成
     */
    generateEmergencyProcedures(deletedFiles: DeletionDetail[]): EmergencyProcedure[] {
        return [
            {
                scenario: 'システム全体が動作しなくなった場合',
                procedure: [
                    '1. 即座にgit log --onelineで最近のコミットを確認',
                    '2. git reset --hard HEAD~1で最新コミットを取り消し',
                    '3. ファイル削除前の状態に戻す',
                    '4. 問題の原因を特定してから再度削除を実行'
                ]
            },
            {
                scenario: 'インポートエラーが発生した場合',
                procedure: [
                    '1. エラーメッセージから問題のファイルを特定',
                    '2. Git履歴から該当ファイルを復旧',
                    '3. npm test または npm run build で動作確認',
                    '4. 問題が解決したら削除作業を慎重に再開'
                ]
            },
            {
                scenario: 'ビルドが失敗した場合',
                procedure: [
                    '1. package.json とビルド設定ファイルを確認',
                    '2. 削除されたファイルが設定で参照されていないか確認',
                    '3. 必要に応じて設定ファイルを更新',
                    '4. ビルドエラーが解消されるまで削除を中止'
                ]
            }
        ];
    }

    /**
     * 全体ステータスの決定
     */
    determineOverallStatus(allResults: AllResults): string {
        if (allResults.deletionSummary && allResults.deletionSummary.overview.successRate === 100) {
            return 'Success';
        } else if (allResults.deletionSummary && allResults.deletionSummary.overview.successRate >= 80) {
            return 'Partial Success';
        } else if (allResults.deletionSummary && allResults.deletionSummary.overview.successRate > 0) {
            return 'Mixed Results';
        } else {
            return 'Failed';
        }
    }

    /**
     * 主要メトリクスの抽出
     */
    extractKeyMetrics(allResults: AllResults): Record<string, any> {
        const metrics: Record<string, any> = {};

        if (allResults.deletionSummary) {
            metrics.filesProcessed = allResults.deletionSummary.overview.totalFilesProcessed;
            metrics.filesDeleted = allResults.deletionSummary.overview.filesSucceeded;
            metrics.successRate = `${allResults.deletionSummary.overview.successRate}%`;
        }

        if (allResults.sizeReduction) {
            metrics.diskSpaceSaved = allResults.sizeReduction.impact.repositorySizeReduction;
            metrics.filesRemoved = allResults.sizeReduction.reduction.filesRemoved;
        }

        if (allResults.integrityValidation && allResults.integrityValidation.summary) {
            metrics.integrityStatus = allResults.integrityValidation.summary.overallIntegrity ? 'Intact' : 'Issues Found';
        }

        return metrics;
    }

    /**
     * 最終推奨事項の生成
     */
    generateFinalRecommendations(allResults: AllResults): FinalRecommendations {
        const recommendations: FinalRecommendations = {
            immediate: [],
            future: [],
            bestPractices: []
        };

        // 即座に対応すべき事項
        if (allResults.integrityValidation && !allResults.integrityValidation.summary.overallIntegrity) {
            recommendations.immediate.push('システム整合性の問題を修正する');
        }

        if (allResults.deletionSummary && allResults.deletionSummary.errors.length > 0) {
            recommendations.immediate.push('削除エラーの原因を調査し解決する');
        }

        // 将来の改善案
        recommendations.future.push('定期的なバックアップファイルクリーンアップの自動化');
        recommendations.future.push('ファイルサイズ監視システムの導入');

        // ベストプラクティス
        recommendations.bestPractices = [
            'ファイル分割時は不要なバックアップを即座に削除',
            'Git履歴に依存した復旧戦略の確立',
            'プロジェクト構造の定期的な見直し',
            'MCPツール制限を考慮したファイルサイズ管理'
        ];

        return recommendations;
    }

    /**
     * 結論の生成
     */
    generateConclusion(allResults: AllResults, overallStatus: string): Conclusion {
        const conclusion: Conclusion = {
            operationSuccessful: overallStatus === 'Success',
            risksIdentified: [],
            benefitsAchieved: [],
            nextSteps: []
        };

        // リスクの特定
        if (allResults.integrityValidation && !allResults.integrityValidation.summary.overallIntegrity) {
            conclusion.risksIdentified.push('システム整合性の問題');
        }

        if (allResults.deletionSummary && allResults.deletionSummary.overview.successRate < 100) {
            conclusion.risksIdentified.push('一部ファイルの削除失敗');
        }

        // 達成された利益
        if (allResults.sizeReduction) {
            conclusion.benefitsAchieved.push(`${allResults.sizeReduction.impact.repositorySizeReduction}のディスク容量節約`);
            conclusion.benefitsAchieved.push(`${allResults.sizeReduction.reduction.filesRemoved}個の不要ファイル削除`);
        }

        conclusion.benefitsAchieved.push('プロジェクト構造の整理');
        conclusion.benefitsAchieved.push('MCPツールの動作安定化');

        // 次のステップ
        if (conclusion.operationSuccessful) {
            conclusion.nextSteps = [
                'file-size-report.jsonの更新',
                'プロジェクトドキュメントの更新',
                '定期的なクリーンアップ手順の確立'
            ];
        } else {
            conclusion.nextSteps = [
                '失敗した削除の原因調査',
                'システム整合性の修復',
                '改善されたクリーンアップ戦略の策定'
            ];
        }

        return conclusion;
    }

    /**
     * レポートをファイルに保存
     */
    async saveReportToFile(report: FinalReport, filename: string): Promise<void> {
        try {
            const reportsDir = '.kiro/reports';
            
            // レポートディレクトリを作成
            try {
                await fs.mkdir(reportsDir, { recursive: true });
            } catch (error) {
                // ディレクトリ作成エラーは無視
            }

            const filePath = path.join(reportsDir, filename);
            await fs.writeFile(filePath, JSON.stringify(report, null, 2), 'utf8');
            
            console.log(`Report saved to: ${filePath}`);
        } catch (error) {
            console.error(`Failed to save report: ${(error as Error).message}`);
        }
    }
}

export default CleanupReporter;