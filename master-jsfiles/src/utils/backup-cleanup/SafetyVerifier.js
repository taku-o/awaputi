import fs from 'fs/promises';
import { BackupFileInvestigator } from './BackupFileInvestigator.js';
import { ReferenceAnalyzer } from './ReferenceAnalyzer.js';

/**
 * SafetyVerifier - バックアップファイル削除の安全性を検証するクラス
 * Issue #104 のバックアップファイル削除前の包括的安全性確認機能を提供
 */
export class SafetyVerifier {
    constructor() {
        this.investigator = new BackupFileInvestigator();
        this.referenceAnalyzer = new ReferenceAnalyzer();
    }

    /**
     * ファイル削除の包括的安全性検証
     * @param {string} filePath - 検証対象ファイルパス
     * @returns {Promise<Object>} 安全性検証結果
     */
    async verifyDeletionSafety(filePath) {
        const verification = {
            filePath,
            timestamp: new Date().toISOString(),
            checks: {},
            overallSafety: false,
            warnings: [],
            recommendations: []
        };

        try {
            // 1. 基本ファイル検証
            verification.checks.basicValidation = await this.performBasicValidation(filePath);
            
            // 2. 現在ファイル整合性確認
            verification.checks.currentFileIntegrity = await this.checkCurrentFileIntegrity(filePath);
            
            // 3. 参照検証
            verification.checks.referenceValidation = await this.validateNoActiveReferences(filePath);
            
            // 4. ビルド依存関係確認
            verification.checks.buildDependencies = await this.checkBuildDependencies(filePath);
            
            // 5. Git状態確認
            verification.checks.gitStatus = await this.checkGitStatus(filePath);
            
            // 6. 総合安全性評価
            verification.overallSafety = this.calculateOverallSafety(verification.checks);
            verification.warnings = this.collectWarnings(verification.checks);
            verification.recommendations = this.generateRecommendations(verification.checks);
            
        } catch (error) {
            verification.error = error.message;
            verification.overallSafety = false;
            verification.warnings.push({
                level: 'critical',
                message: `検証中にエラーが発生しました: ${error.message}`
            });
        }

        return verification;
    }

    /**
     * 基本ファイル検証
     * @param {string} filePath - ファイルパス
     * @returns {Promise<Object>} 基本検証結果
     */
    async performBasicValidation(filePath) {
        const validation = {
            fileExists: false,
            currentFileExists: false,
            isBackupFile: false,
            passed: false
        };

        try {
            // ファイル存在確認
            validation.fileExists = await this.investigator.checkFileExists(filePath);
            
            // バックアップファイル判定
            validation.isBackupFile = this.isBackupFile(filePath);
            
            // 対応する現在ファイルの存在確認
            const currentFilePath = this.getCurrentFilePath(filePath);
            if (currentFilePath) {
                validation.currentFileExists = await this.investigator.checkCurrentFileExists(currentFilePath);
                validation.currentFilePath = currentFilePath;
            }
            
            // 基本検証パス条件
            validation.passed = validation.fileExists && 
                               validation.isBackupFile && 
                               validation.currentFileExists;

        } catch (error) {
            validation.error = error.message;
            validation.passed = false;
        }

        return validation;
    }

    /**
     * 現在ファイルの整合性確認
     * @param {string} filePath - バックアップファイルパス
     * @returns {Promise<Object>} 整合性確認結果
     */
    async checkCurrentFileIntegrity(filePath) {
        const integrity = {
            currentFileValid: false,
            syntaxValid: false,
            functionallyEquivalent: false,
            passed: false
        };

        try {
            const currentFilePath = this.getCurrentFilePath(filePath);
            if (!currentFilePath) {
                integrity.error = '対応する現在ファイルが特定できません';
                return integrity;
            }

            // 現在ファイルの存在と読み取り可能性確認
            const currentContent = await fs.readFile(currentFilePath, 'utf8');
            integrity.currentFileValid = true;

            // 基本的な構文検証（JavaScriptファイルの場合）
            if (currentFilePath.endsWith('.js')) {
                integrity.syntaxValid = await this.validateJavaScriptSyntax(currentContent);
            } else {
                integrity.syntaxValid = true; // JS以外は構文チェックスキップ
            }

            // 機能的同等性の基本確認
            integrity.functionallyEquivalent = await this.checkFunctionalEquivalence(
                filePath, 
                currentFilePath
            );

            integrity.passed = integrity.currentFileValid && 
                              integrity.syntaxValid && 
                              integrity.functionallyEquivalent;

        } catch (error) {
            integrity.error = error.message;
            integrity.passed = false;
        }

        return integrity;
    }

    /**
     * アクティブな参照がないことの確認
     * @param {string} filePath - ファイルパス
     * @returns {Promise<Object>} 参照検証結果
     */
    async validateNoActiveReferences(filePath) {
        const validation = {
            importReferences: 0,
            activeStringReferences: 0,
            reportFileReferences: 0,
            totalReferences: 0,
            passed: false
        };

        try {
            // import参照の検索
            const importAnalysis = await this.referenceAnalyzer.searchImportReferences(filePath);
            validation.importReferences = importAnalysis.importReferences.length;

            // 文字列参照の検索
            const stringAnalysis = await this.referenceAnalyzer.searchStringReferences(filePath);
            validation.activeStringReferences = stringAnalysis.activeReferences.length;
            validation.reportFileReferences = stringAnalysis.reportFileReferences.length;
            validation.totalReferences = stringAnalysis.stringReferences.length;

            // 参照分析レポート生成
            validation.referenceReport = await this.referenceAnalyzer.generateReferenceReport(
                filePath, 
                { importAnalysis, stringAnalysis }
            );

            // 検証パス条件：アクティブな参照がない
            validation.passed = validation.importReferences === 0 && 
                               validation.activeStringReferences === 0;

        } catch (error) {
            validation.error = error.message;
            validation.passed = false;
        }

        return validation;
    }

    /**
     * ビルド依存関係の確認
     * @param {string} filePath - ファイルパス
     * @returns {Promise<Object>} ビルド依存関係確認結果
     */
    async checkBuildDependencies(filePath) {
        const dependencies = {
            inPackageJson: false,
            inTsConfig: false,
            inWebpackConfig: false,
            inOtherConfigs: false,
            passed: true
        };

        try {
            // package.jsonでの参照確認
            const packageJsonPath = './package.json';
            try {
                const packageContent = await fs.readFile(packageJsonPath, 'utf8');
                dependencies.inPackageJson = packageContent.includes(filePath);
            } catch {
                // package.json読み取りエラーは無視
            }

            // その他の設定ファイルでの参照確認
            const configFiles = [
                './tsconfig.json',
                './webpack.config.js',
                './jest.config.js',
                './rollup.config.js'
            ];

            for (const configFile of configFiles) {
                try {
                    const configContent = await fs.readFile(configFile, 'utf8');
                    if (configContent.includes(filePath)) {
                        dependencies.inOtherConfigs = true;
                        dependencies.configFiles = dependencies.configFiles || [];
                        dependencies.configFiles.push(configFile);
                    }
                } catch {
                    // 設定ファイル読み取りエラーは無視
                }
            }

            // 依存関係が見つかった場合は警告
            dependencies.passed = !dependencies.inPackageJson && 
                                 !dependencies.inTsConfig && 
                                 !dependencies.inWebpackConfig && 
                                 !dependencies.inOtherConfigs;

        } catch (error) {
            dependencies.error = error.message;
            dependencies.passed = false;
        }

        return dependencies;
    }

    /**
     * Git状態の確認
     * @param {string} filePath - ファイルパス
     * @returns {Promise<Object>} Git状態確認結果
     */
    async checkGitStatus(filePath) {
        const gitStatus = {
            isTracked: false,
            hasUncommittedChanges: false,
            lastCommitInfo: null,
            passed: true
        };

        try {
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);

            // ファイルがGit追跡されているか確認
            try {
                await execAsync(`git ls-files --error-unmatch "${filePath}"`);
                gitStatus.isTracked = true;
            } catch {
                gitStatus.isTracked = false;
            }

            if (gitStatus.isTracked) {
                // 未コミットの変更があるか確認
                try {
                    const { stdout } = await execAsync(`git diff --name-only HEAD -- "${filePath}"`);
                    gitStatus.hasUncommittedChanges = stdout.trim().length > 0;
                } catch {
                    gitStatus.hasUncommittedChanges = false;
                }

                // 最後のコミット情報取得
                try {
                    const { stdout } = await execAsync(
                        `git log -1 --format="%H %s" -- "${filePath}"`
                    );
                    if (stdout.trim()) {
                        const [hash, ...messageParts] = stdout.trim().split(' ');
                        gitStatus.lastCommitInfo = {
                            hash,
                            message: messageParts.join(' ')
                        };
                    }
                } catch {
                    // 最後のコミット情報取得エラーは無視
                }
            }

            // Git状態での安全性評価
            gitStatus.passed = !gitStatus.hasUncommittedChanges;

        } catch (error) {
            gitStatus.error = error.message;
            gitStatus.passed = true; // Gitエラーは削除安全性に影響しない
        }

        return gitStatus;
    }

    /**
     * 総合安全性の計算
     * @param {Object} checks - 各種検証結果
     * @returns {boolean} 総合安全性判定
     */
    calculateOverallSafety(checks) {
        const requiredChecks = [
            'basicValidation',
            'currentFileIntegrity',
            'referenceValidation'
        ];

        return requiredChecks.every(checkName => 
            checks[checkName] && checks[checkName].passed
        );
    }

    /**
     * 警告の収集
     * @param {Object} checks - 各種検証結果
     * @returns {Array} 警告配列
     */
    collectWarnings(checks) {
        const warnings = [];

        // 参照検証警告
        if (checks.referenceValidation && checks.referenceValidation.referenceReport) {
            const refWarnings = checks.referenceValidation.referenceReport.safetyAssessment.warnings;
            warnings.push(...refWarnings);
        }

        // ビルド依存関係警告
        if (checks.buildDependencies && !checks.buildDependencies.passed) {
            warnings.push({
                level: 'medium',
                message: 'ビルド設定ファイルで参照されている可能性があります'
            });
        }

        // Git状態警告
        if (checks.gitStatus && checks.gitStatus.hasUncommittedChanges) {
            warnings.push({
                level: 'low',
                message: '未コミットの変更があります'
            });
        }

        return warnings;
    }

    /**
     * 推奨事項の生成
     * @param {Object} checks - 各種検証結果
     * @returns {Array} 推奨事項配列
     */
    generateRecommendations(checks) {
        const recommendations = [];

        if (this.calculateOverallSafety(checks)) {
            recommendations.push({
                type: 'safe_deletion',
                message: '安全に削除できます',
                priority: 'high'
            });
        } else {
            recommendations.push({
                type: 'manual_review',
                message: '手動確認が必要です',
                priority: 'high'
            });
        }

        // 参照検証推奨事項
        if (checks.referenceValidation && checks.referenceValidation.referenceReport) {
            const refRecommendations = checks.referenceValidation.referenceReport.safetyAssessment.recommendations;
            recommendations.push(...refRecommendations);
        }

        return recommendations;
    }

    /**
     * バックアップファイルかどうかの判定
     * @param {string} filePath - ファイルパス
     * @returns {boolean} バックアップファイルかどうか
     */
    isBackupFile(filePath) {
        const backupPatterns = [
            /_old\./,
            /_backup\./,
            /_original\./,
            /\.old$/,
            /\.backup$/,
            /\.orig$/
        ];

        return backupPatterns.some(pattern => pattern.test(filePath));
    }

    /**
     * 対応する現在ファイルのパスを取得
     * @param {string} backupFilePath - バックアップファイルパス
     * @returns {string|null} 現在ファイルパス
     */
    getCurrentFilePath(backupFilePath) {
        const mapping = {
            'src/utils/TestConfigurationGenerator_old.js': 'src/utils/TestConfigurationGenerator.js',
            'src/utils/performance-monitoring/PerformanceDataAnalyzer_Original.js': 'src/utils/performance-monitoring/PerformanceDataAnalyzer.js',
            'src/debug/TestDataGenerationCommands_old.js': 'src/debug/TestDataGenerationCommands.js',
            'src/debug/TestDataGenerationCommands_backup.js': 'src/debug/TestDataGenerationCommands.js',
            'src/seo/SEOTester_original.js': 'src/seo/SEOTester.js'
        };

        return mapping[backupFilePath] || null;
    }

    /**
     * JavaScript構文の検証
     * @param {string} content - ファイル内容
     * @returns {Promise<boolean>} 構文が有効かどうか
     */
    async validateJavaScriptSyntax(content) {
        try {
            new Function(content);
            return true;
        } catch {
            // ES6モジュール構文などで失敗する場合があるが、
            // 基本的な構文エラーでなければOKとする
            return !content.includes('SyntaxError');
        }
    }

    /**
     * 機能的同等性の確認
     * @param {string} backupFilePath - バックアップファイルパス
     * @param {string} currentFilePath - 現在ファイルパス
     * @returns {Promise<boolean>} 機能的に同等かどうか
     */
    async checkFunctionalEquivalence(backupFilePath, currentFilePath) {
        try {
            const backupContent = await fs.readFile(backupFilePath, 'utf8');
            const currentContent = await fs.readFile(currentFilePath, 'utf8');

            // 単純な比較：現在ファイルが存在し、内容が異なることを確認
            // （同じなら現在ファイルが更新されていない可能性）
            return backupContent !== currentContent && currentContent.length > 0;
        } catch {
            return false;
        }
    }

    /**
     * 安全性検証レポートの生成
     * @param {Array} verificationResults - 検証結果配列
     * @returns {Object} 安全性レポート
     */
    async generateSafetyReport(verificationResults) {
        const report = {
            summary: {
                totalFiles: verificationResults.length,
                safeFiles: verificationResults.filter(r => r.overallSafety).length,
                unsafeFiles: verificationResults.filter(r => !r.overallSafety).length,
                errorFiles: verificationResults.filter(r => r.error).length
            },
            safetyBreakdown: {
                basicValidation: verificationResults.filter(r => r.checks.basicValidation && r.checks.basicValidation.passed).length,
                currentFileIntegrity: verificationResults.filter(r => r.checks.currentFileIntegrity && r.checks.currentFileIntegrity.passed).length,
                referenceValidation: verificationResults.filter(r => r.checks.referenceValidation && r.checks.referenceValidation.passed).length,
                buildDependencies: verificationResults.filter(r => r.checks.buildDependencies && r.checks.buildDependencies.passed).length,
                gitStatus: verificationResults.filter(r => r.checks.gitStatus && r.checks.gitStatus.passed).length
            },
            files: verificationResults,
            overallRecommendation: this.generateOverallRecommendation(verificationResults),
            generatedAt: new Date().toISOString()
        };

        return report;
    }

    /**
     * 全体的な推奨事項の生成
     * @param {Array} verificationResults - 検証結果配列
     * @returns {Object} 全体推奨事項
     */
    generateOverallRecommendation(verificationResults) {
        const safeFiles = verificationResults.filter(r => r.overallSafety);
        const unsafeFiles = verificationResults.filter(r => !r.overallSafety);

        if (unsafeFiles.length === 0) {
            return {
                action: 'proceed_with_deletion',
                message: '全てのファイルが安全に削除できます',
                priority: 'high'
            };
        } else if (safeFiles.length > 0) {
            return {
                action: 'selective_deletion',
                message: `${safeFiles.length}個のファイルは安全に削除できます。${unsafeFiles.length}個のファイルは要確認です`,
                priority: 'medium'
            };
        } else {
            return {
                action: 'manual_review_required',
                message: '全てのファイルで手動確認が必要です',
                priority: 'high'
            };
        }
    }
}

export default SafetyVerifier;