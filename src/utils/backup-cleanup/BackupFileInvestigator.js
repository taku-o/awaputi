import fs from 'fs/promises';
import path from 'path';

/**
 * BackupFileInvestigator - バックアップファイルの詳細調査を行うクラス
 * Issue #104 の対象ファイルの安全な削除のための調査機能を提供
 */
export class BackupFileInvestigator {
    constructor() {
        this.targetFiles = [
            {
                filePath: 'src/utils/TestConfigurationGenerator_old.js',
                currentFilePath: 'src/utils/TestConfigurationGenerator.js',
                expectedWordCount: 3288,
                description: 'Task 4完了時のバックアップ'
            },
            {
                filePath: 'src/utils/performance-monitoring/PerformanceDataAnalyzer_Original.js',
                currentFilePath: 'src/utils/performance-monitoring/PerformanceDataAnalyzer.js',
                expectedWordCount: 2871,
                description: 'Task 2完了時のオリジナル保存'
            },
            {
                filePath: 'src/debug/TestDataGenerationCommands_old.js',
                currentFilePath: 'src/debug/TestDataGenerationCommands.js',
                expectedWordCount: 2621,
                description: '分割プロジェクトでのバックアップ'
            },
            {
                filePath: 'src/debug/TestDataGenerationCommands_backup.js',
                currentFilePath: 'src/debug/TestDataGenerationCommands.js',
                expectedWordCount: 2621,
                description: '重複バックアップ'
            },
            {
                filePath: 'src/seo/SEOTester_original.js',
                currentFilePath: 'src/seo/SEOTester.js',
                expectedWordCount: 2576,
                description: '分割プロジェクトでのオリジナル保存'
            }
        ];
    }

    /**
     * 全対象ファイルの調査を実行
     * @returns {Promise<Array>} 調査結果の配列
     */
    async investigateTargetFiles() {
        const results = [];
        
        for (const targetFile of this.targetFiles) {
            try {
                const investigation = await this.investigateFile(targetFile);
                results.push(investigation);
            } catch (error) {
                results.push({
                    ...targetFile,
                    error: error.message,
                    investigationFailed: true
                });
            }
        }
        
        return results;
    }

    /**
     * 個別ファイルの調査を実行
     * @param {Object} targetFile - 調査対象ファイル情報
     * @returns {Promise<Object>} 調査結果
     */
    async investigateFile(targetFile) {
        const result = { ...targetFile };
        
        // ファイル存在確認
        result.exists = await this.checkFileExists(targetFile.filePath);
        
        if (result.exists) {
            // ファイルサイズ分析
            result.sizeAnalysis = await this.analyzeFileSize(targetFile.filePath);
            
            // Git履歴取得
            result.gitHistory = await this.getGitHistory(targetFile.filePath);
        }
        
        // 対応する現在ファイルの確認
        result.currentFileExists = await this.checkCurrentFileExists(targetFile.currentFilePath);
        
        if (result.currentFileExists) {
            // 現在ファイルとの比較
            result.comparison = await this.compareWithCurrentFile(targetFile);
        }
        
        result.investigatedAt = new Date().toISOString();
        
        return result;
    }

    /**
     * ファイルの存在確認
     * @param {string} filePath - ファイルパス
     * @returns {Promise<boolean>} 存在するかどうか
     */
    async checkFileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 対応する現在ファイルの存在確認
     * @param {string} currentFilePath - 現在ファイルのパス
     * @returns {Promise<boolean>} 存在するかどうか
     */
    async checkCurrentFileExists(currentFilePath) {
        return this.checkFileExists(currentFilePath);
    }

    /**
     * ファイルサイズの分析
     * @param {string} filePath - ファイルパス
     * @returns {Promise<Object>} サイズ分析結果
     */
    async analyzeFileSize(filePath) {
        try {
            const stats = await fs.stat(filePath);
            const content = await fs.readFile(filePath, 'utf8');
            
            const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
            const lineCount = content.split('\n').length;
            
            return {
                bytes: stats.size,
                wordCount,
                lineCount,
                characters: content.length,
                lastModified: stats.mtime.toISOString()
            };
        } catch (error) {
            return {
                error: error.message,
                analyzeFailed: true
            };
        }
    }

    /**
     * Git履歴の取得
     * @param {string} filePath - ファイルパス
     * @returns {Promise<Array>} Git履歴
     */
    async getGitHistory(filePath) {
        try {
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);
            
            // Git log for specific file
            const { stdout } = await execAsync(
                `git log --oneline -10 -- "${filePath}"`,
                { cwd: process.cwd() }
            );
            
            if (!stdout.trim()) {
                return [];
            }
            
            return stdout.trim().split('\n').map(line => {
                const [commit, ...messageParts] = line.split(' ');
                return {
                    commit,
                    message: messageParts.join(' ')
                };
            });
        } catch (error) {
            return [{
                error: error.message,
                gitHistoryFailed: true
            }];
        }
    }

    /**
     * 現在ファイルとの比較
     * @param {Object} targetFile - 対象ファイル情報
     * @returns {Promise<Object>} 比較結果
     */
    async compareWithCurrentFile(targetFile) {
        try {
            const backupContent = await fs.readFile(targetFile.filePath, 'utf8');
            const currentContent = await fs.readFile(targetFile.currentFilePath, 'utf8');
            
            const backupLines = backupContent.split('\n');
            const currentLines = currentContent.split('\n');
            
            return {
                identical: backupContent === currentContent,
                backupLines: backupLines.length,
                currentLines: currentLines.length,
                sizeDifference: currentContent.length - backupContent.length,
                comparedAt: new Date().toISOString()
            };
        } catch (error) {
            return {
                error: error.message,
                comparisonFailed: true
            };
        }
    }

    /**
     * 調査結果レポートの生成
     * @param {Array} investigationResults - 調査結果配列
     * @returns {Object} レポート
     */
    async generateInvestigationReport(investigationResults) {
        const report = {
            summary: {
                totalFiles: investigationResults.length,
                existingFiles: investigationResults.filter(r => r.exists).length,
                missingFiles: investigationResults.filter(r => !r.exists).length,
                currentFilesExist: investigationResults.filter(r => r.currentFileExists).length,
                investigationErrors: investigationResults.filter(r => r.investigationFailed).length
            },
            files: investigationResults,
            totalSizeEstimate: {
                bytes: investigationResults
                    .filter(r => r.sizeAnalysis && !r.sizeAnalysis.analyzeFailed)
                    .reduce((sum, r) => sum + r.sizeAnalysis.bytes, 0),
                words: investigationResults
                    .filter(r => r.sizeAnalysis && !r.sizeAnalysis.analyzeFailed)
                    .reduce((sum, r) => sum + r.sizeAnalysis.wordCount, 0)
            },
            recommendations: this.generateRecommendations(investigationResults),
            generatedAt: new Date().toISOString()
        };
        
        return report;
    }

    /**
     * 調査結果に基づく推奨事項の生成
     * @param {Array} results - 調査結果
     * @returns {Array} 推奨事項配列
     */
    generateRecommendations(results) {
        const recommendations = [];
        
        const safeToDelete = results.filter(r => 
            r.exists && r.currentFileExists && !r.investigationFailed
        );
        
        const needsAttention = results.filter(r => 
            r.investigationFailed || !r.currentFileExists
        );
        
        if (safeToDelete.length > 0) {
            recommendations.push({
                type: 'safe_deletion',
                message: `${safeToDelete.length}個のファイルは安全に削除できる可能性があります`,
                files: safeToDelete.map(f => f.filePath)
            });
        }
        
        if (needsAttention.length > 0) {
            recommendations.push({
                type: 'needs_attention',
                message: `${needsAttention.length}個のファイルは追加の調査が必要です`,
                files: needsAttention.map(f => f.filePath)
            });
        }
        
        return recommendations;
    }
}

export default BackupFileInvestigator;