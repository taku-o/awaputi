import fs from 'fs/promises';
import path from 'path';

/**
 * CleanupReporter - バックアップファイルクリーンアップの包括的レポート生成クラス
 * Issue #104 のクリーンアップ作業の結果を詳細にレポートする機能を提供
 */
export class CleanupReporter {
    constructor() {
        this.reports = [];
    }

    /**
     * 調査結果サマリーの生成
     * @param {Array} investigationResults - 調査結果配列
     * @returns {Object} 調査サマリー
     */
    async generateInvestigationSummary(investigationResults) {
        const summary = {
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
                (sum, r) => sum + r.sizeAnalysis.bytes, 0
            );
            summary.sizeAnalysis.totalWords = validSizeResults.reduce(
                (sum, r) => sum + r.sizeAnalysis.wordCount, 0
            );
            summary.sizeAnalysis.averageFileSize = Math.round(
                summary.sizeAnalysis.totalBytes / validSizeResults.length
            );

            // 最大・最小ファイル
            const sizes = validSizeResults.map(r => ({
                file: r.filePath,
                size: r.sizeAnalysis.bytes,
                words: r.sizeAnalysis.wordCount
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
     * @param {Object} deletionResults - 削除結果
     * @returns {Object} 削除サマリー
     */
    async generateDeletionSummary(deletionResults) {
        const summary = {
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
     * @param {Object} beforeSizes - 削除前サイズ情報
     * @param {Object} afterSizes - 削除後サイズ情報
     * @returns {Object} サイズ削減効果
     */
    async calculateSizeReduction(beforeSizes, afterSizes) {
        const reduction = {
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
     * @param {Array} deletedFiles - 削除されたファイル情報
     * @returns {Object} 復旧手順
     */
    async createRecoveryInstructions(deletedFiles) {
        const instructions = {
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
     * @param {Object} allResults - 全結果データ
     * @returns {Object} 最終レポート
     */
    async generateFinalReport(allResults) {
        const report = {
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
     * @param {Array} filesWithHistory - Git履歴があるファイル配列
     * @returns {Array} コミットパターン
     */
    analyzeCommitPatterns(filesWithHistory) {
        const patterns = {};
        
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
     * @param {string} message - コミットメッセージ
     * @returns {string} パターン
     */
    extractCommitPattern(message) {
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
     * @param {Array} investigationResults - 調査結果
     * @returns {Array} 推奨事項
     */
    generateInvestigationRecommendations(investigationResults) {
        const recommendations = [];
        
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
     * @param {number} bytes - バイト数
     * @returns {string} フォーマット済み文字列
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 復旧方法の決定
     * @param {Object} deletedFile - 削除されたファイル情報
     * @returns {Object} 復旧方法
     */
    determineRecoveryMethod(deletedFile) {
        const method = {
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
     * @param {Object} recoveryMethods - 復旧方法オブジェクト
     * @returns {Array} 手順配列
     */
    generateStepByStepRecovery(recoveryMethods) {
        const steps = [];

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
     * @param {Array} deletedFiles - 削除されたファイル配列
     * @returns {Array} 緊急時手順
     */
    generateEmergencyProcedures(deletedFiles) {
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
     * @param {Object} allResults - 全結果
     * @returns {string} ステータス
     */
    determineOverallStatus(allResults) {
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
     * @param {Object} allResults - 全結果
     * @returns {Object} 主要メトリクス
     */
    extractKeyMetrics(allResults) {
        const metrics = {};

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
     * @param {Object} allResults - 全結果
     * @returns {Object} 推奨事項
     */
    generateFinalRecommendations(allResults) {
        const recommendations = {
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
     * @param {Object} allResults - 全結果
     * @param {string} overallStatus - 全体ステータス
     * @returns {Object} 結論
     */
    generateConclusion(allResults, overallStatus) {
        const conclusion = {
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
     * @param {Object} report - レポートオブジェクト
     * @param {string} filename - ファイル名
     * @returns {Promise<void>}
     */
    async saveReportToFile(report, filename) {
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
            console.error(`Failed to save report: ${error.message}`);
        }
    }
}

export default CleanupReporter;