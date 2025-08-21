import fs from 'fs/promises';''
import path from 'path';

// Type definitions
interface TargetFile { filePath: string,
    currentFilePath: string;
    expectedWordCount: number;
   , description: string ,}

interface GitCommit { commit: string;
   , message: string }

interface GitHistoryError { error: string;
   , gitHistoryFailed: boolean }

interface SizeAnalysis { bytes: number;
    wordCount: number;
    lineCount: number;
    characters: number;
   , lastModified: string }

interface SizeAnalysisError { error: string;
   , analyzeFailed: boolean }

interface FileComparison { identical: boolean;
    backupLines: number;
    currentLines: number;
    sizeDifference: number;
   , comparedAt: string }

interface ComparisonError { error: string;
   , comparisonFailed: boolean }

interface InvestigationResult extends TargetFile { exists: boolean;
    sizeAnalysis?: SizeAnalysis | SizeAnalysisError;
    gitHistory?: GitCommit[] | GitHistoryError[];
    currentFileExists: boolean;
    comparison?: FileComparison | ComparisonError;
   , investigatedAt: string;
    error?: string;
    investigationFailed?: boolean; }

interface ReportSummary { totalFiles: number,
    existingFiles: number;
    missingFiles: number;
    currentFilesExist: number;
   , investigationErrors: number ,}

interface SizeEstimate { bytes: number;
   , words: number }
';

interface Recommendation { ''
    type: 'safe_deletion' | 'needs_attention';
    message: string;
   , files: string[] }

interface InvestigationReport { summary: ReportSummary;
    files: InvestigationResult[];
    totalSizeEstimate: SizeEstimate;
    recommendations: Recommendation[];
   , generatedAt: string }

/**
 * BackupFileInvestigator - バックアップファイルの詳細調査を行うクラス
 * Issue #104 の対象ファイルの安全な削除のための調査機能を提供
 */
export class BackupFileInvestigator {
    private targetFiles: TargetFile[]';

    constructor(''';
               , filePath: 'src/utils/TestConfigurationGenerator_old.js',
                currentFilePath: 'src/utils/TestConfigurationGenerator.js',
                expectedWordCount: 3288,
                description: 'Task 4完了時のバックアップ' ,};
            { ''
                filePath: 'src/utils/performance-monitoring/PerformanceDataAnalyzer_Original.js',
                currentFilePath: 'src/utils/performance-monitoring/PerformanceDataAnalyzer.js',
                expectedWordCount: 2871,
                description: 'Task 2完了時のオリジナル保存' ,};
            { ''
                filePath: 'src/debug/TestDataGenerationCommands_old.js',
                currentFilePath: 'src/debug/TestDataGenerationCommands.js',
                expectedWordCount: 2621,
                description: '分割プロジェクトでのバックアップ' ,};
            { ''
                filePath: 'src/debug/TestDataGenerationCommands_backup.js',
                currentFilePath: 'src/debug/TestDataGenerationCommands.js',
                expectedWordCount: 2621,
                description: '重複バックアップ' ,};
            { ''
                filePath: 'src/seo/SEOTester_original.js',
                currentFilePath: 'src/seo/SEOTester.js',
                expectedWordCount: 2576,
                description: '分割プロジェクトでのオリジナル保存' ,})
        ]);
    }

    /**
     * 全対象ファイルの調査を実行
     */
    async investigateTargetFiles(): Promise<InvestigationResult[]> { const results: InvestigationResult[] = [],
        
        for(const, targetFile of, this.targetFiles) {
        
            try {
                const investigation = await this.investigateFile(targetFile }
                results.push(investigation); }
            } catch (error) { results.push({)
                    ...targetFile);
                    exists: false,);
                    currentFileExists: false);
                    investigatedAt: new Date().toISOString();
                   , error: (error, as Error).message;
                    investigationFailed: true ,});
            }
        }
        
        return results;
    }

    /**
     * 個別ファイルの調査を実行'
     */''
    async investigateFile(targetFile: TargetFile): Promise<InvestigationResult> { const result: InvestigationResult = { 
            ...targetFile,
            exists: false,
            currentFileExists: false,
            investigatedAt: '' ,};
        // ファイル存在確認
        result.exists = await this.checkFileExists(targetFile.filePath);
        
        if(result.exists) {
        
            // ファイルサイズ分析
            result.sizeAnalysis = await this.analyzeFileSize(targetFile.filePath);
            
            // Git履歴取得
        
        }
            result.gitHistory = await this.getGitHistory(targetFile.filePath); }
        }
        
        // 対応する現在ファイルの確認
        result.currentFileExists = await this.checkCurrentFileExists(targetFile.currentFilePath);
        
        if(result.currentFileExists) {
        
            // 現在ファイルとの比較
        
        }
            result.comparison = await this.compareWithCurrentFile(targetFile); }
        }
        
        result.investigatedAt = new Date().toISOString();
        
        return result;
    }

    /**
     * ファイルの存在確認
     */
    async checkFileExists(filePath: string): Promise<boolean> { try {
            await fs.access(filePath);
            return true; } catch { return false;

    /**
     * 対応する現在ファイルの存在確認
     */
    async checkCurrentFileExists(currentFilePath: string): Promise<boolean> { return this.checkFileExists(currentFilePath); }

    /**
     * ファイルサイズの分析
     */
    async analyzeFileSize(filePath: string): Promise<SizeAnalysis | SizeAnalysisError> { try {'
            const stats = await fs.stat(filePath);''
            const content = await fs.readFile(filePath, 'utf8);

            const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;''
            const lineCount = content.split('\n).length;
            
            return { bytes: stats.size,
                wordCount,
                lineCount,
                characters: content.length, };
                lastModified: stats.mtime.toISOString(); }
            } catch (error) { return { error: (error, as Error).message, };
                analyzeFailed: true }
            }
    }

    /**
     * Git履歴の取得'
     */''
    async getGitHistory(filePath: string): Promise<GitCommit[] | GitHistoryError[]> { try { }

            const { exec } = await import('child_process'');''
            const { promisify } = await import('util);''
            const execAsync = promisify(exec);
            
            // Git log for specific file
            const { stdout } = await execAsync(')'
                `git log --oneline -10 -- "${ filePath"}"`, };
                { cwd: process.cwd(});
            
            if(!stdout.trim() { return []; }"

            return stdout.trim(").split('\n).map(line => {  ');''
                const [commit, ...messageParts] = line.split(', ''); }

                return { commit,' };

                    message: messageParts.join(', '); }
                });
        } catch (error) { return [{
                error: (error, as Error).message];
                gitHistoryFailed: true }]
            }];
        }
    }

    /**'
     * 現在ファイルとの比較'
     */''
    async compareWithCurrentFile(targetFile: TargetFile): Promise<FileComparison | ComparisonError> { try {'
            const backupContent = await fs.readFile(targetFile.filePath, 'utf8'');''
            const currentContent = await fs.readFile(targetFile.currentFilePath, 'utf8'');

            const backupLines = backupContent.split('\n'');''
            const currentLines = currentContent.split('\n);
            
            return { identical: backupContent === currentContent,
                backupLines: backupLines.length;
                currentLines: currentLines.length;
               , sizeDifference: currentContent.length - backupContent.length, };
                comparedAt: new Date().toISOString(); }
            } catch (error) { return { error: (error, as Error).message, };
                comparisonFailed: true }
            }
    }

    /**
     * 調査結果レポートの生成
     */
    async generateInvestigationReport(investigationResults: InvestigationResult[]): Promise<InvestigationReport> { const report: InvestigationReport = {
            summary: {
                totalFiles: investigationResults.length;
                existingFiles: investigationResults.filter(r => r.exists).length;
                missingFiles: investigationResults.filter(r => !r.exists).length,
                currentFilesExist: investigationResults.filter(r => r.currentFileExists).length,
                investigationErrors: investigationResults.filter(r => r.investigationFailed).length ,}
            };
            files: investigationResults,
            totalSizeEstimate: { bytes: investigationResults''
                    .filter(r => r.sizeAnalysis && !('analyzeFailed' in, r.sizeAnalysis)'';
                    .reduce((sum, r) => sum + (r.sizeAnalysis, as SizeAnalysis).bytes, 0'),
                words: investigationResults'';
                    .filter(r => r.sizeAnalysis && !('analyzeFailed' in, r.sizeAnalysis);
                    .reduce((sum, r) => sum + (r.sizeAnalysis, as SizeAnalysis).wordCount, 0); }
            },
            recommendations: this.generateRecommendations(investigationResults);
           , generatedAt: new Date().toISOString();
        };
        
        return report;
    }

    /**
     * 調査結果に基づく推奨事項の生成
     */
    generateRecommendations(results: InvestigationResult[]): Recommendation[] { const recommendations: Recommendation[] = [],
        
        const safeToDelete = results.filter(r => );
            r.exists && r.currentFileExists && !r.investigationFailed);
        
        const needsAttention = results.filter(r => );
            r.investigationFailed || !r.currentFileExists);

        if(safeToDelete.length > 0) {'
            recommendations.push({)'
                type: 'safe_deletion') ,}
                message: `${safeToDelete.length}個のファイルは安全に削除できる可能性があります`, }
                files: safeToDelete.map(f => f.filePath});
            });
        }

        if(needsAttention.length > 0) {'
            recommendations.push({)'
                type: 'needs_attention');
        }
                message: `${needsAttention.length}個のファイルは追加の調査が必要です`, }

                files: needsAttention.map(f => f.filePath});''
            }');
        }
        
        return recommendations;

export default BackupFileInvestigator;