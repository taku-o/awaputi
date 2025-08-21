import fs from 'fs/promises';''
import path from 'path';''
import { SafetyVerifier } from './SafetyVerifier.js';

// Type definitions
interface FileInfo { filePath: string,
    [key: string]: any, }

interface DeletionSummary { totalFiles: number,
    attempted: number;
    succeeded: number;
    failed: number;
    skipped: number ,}

interface SafetyCheck { overallSafety: boolean;
    [key: string]: any, }

interface BackupFileInfo { size: number,
    lastModified: string;
    contentHash: string;
    lineCount: number ,}

interface GitCommitInfo { hash: string;
    message: string }

interface GitInfo { hasHistory: boolean;
    lastCommit: GitCommitInfo | null;
    branch: string | null;
    error?: string }
';

interface RecoveryInstructions { ''
    method: 'git_history' | 'manual';
    commands: string[];
    notes: string[] }

interface BackupRecord { filePath: string;
    createdAt: string;
    backupCreated: boolean;
    fileInfo?: BackupFileInfo;
    gitInfo?: GitInfo;
    recoveryInstructions?: RecoveryInstructions;
    error?: string; }

interface DeletionResult { filePath: string,
    success: boolean;
    deletedAt: string | null;
    error: string | null ,}

interface VerificationResult { filePath: string;
    deleted: boolean;
    verifiedAt: string;
    error?: string }

interface TestResults { basicImportTest: boolean;
    buildTest: boolean;
    syntaxTest: boolean }

interface PostDeletionTestResult { passed: boolean;
    tests: TestResults;
    errors: string[];
    executedAt: string }
';

interface DeletionRecord { filePath: string,''
    status: 'deleted' | 'skipped' | 'failed';
    backupRecord?: BackupRecord;
    deletionResult?: DeletionResult;
    verificationResult?: VerificationResult;
    testResult?: PostDeletionTestResult;
    timestamp: string;
    reason?: string;
    safetyCheck?: SafetyCheck;
    ,}

interface DeletionError { filePath: string,
    error: string;
    timestamp?: string;
    testResult?: PostDeletionTestResult;
    verificationResult?: VerificationResult;
    deletionResult?: DeletionResult;
    ,}

interface DeletionResults { summary: DeletionSummary,
    deletions: DeletionRecord[];
    errors: DeletionError[];
    startTime: string;
    endTime?: string;
    duration?: number; ,}

interface SizeReduction { filesDeleted: number,
    estimatedBytesFreed: number ,}

interface DeletionReport { summary: DeletionSummary;
    successfulDeletions: DeletionRecord[];
    skippedDeletions: DeletionRecord[];
    errors: DeletionError[];
    recoveryInfo: {
        backupRecords: Record<string, BackupRecord>;
        deletionLog: DeletionRecord[] ,};
    generatedAt: string;
    sizeReduction?: SizeReduction;
    }

/**
 * SequentialFileRemover - バックアップファイルの段階的安全削除を行うクラス
 * Issue #104 のバックアップファイルを一つずつ安全に削除する機能を提供
 */
export class SequentialFileRemover {
    private safetyVerifier: SafetyVerifier;
    private deletionLog: DeletionRecord[];
    private backupRecord: Record<string, BackupRecord>;

    constructor() {

        this.safetyVerifier = new SafetyVerifier();

    }
        this.deletionLog = []; }
        this.backupRecord = {}

    /**
     * 検証済みファイルの安全削除実行
     */
    async removeFilesSafely(verifiedFiles: FileInfo[]): Promise<DeletionResults> { const results: DeletionResults = {
            summary: {
                totalFiles: verifiedFiles.length;
                attempted: 0;
                succeeded: 0;
                failed: 0;
                skipped: 0 };
            deletions: [];
            errors: [];
            startTime: new Date().toISOString();
        };

        for(const, fileInfo of, verifiedFiles) {

            try {
                results.summary.attempted++;
                
                // 事前安全性確認
                const finalSafetyCheck = await this.safetyVerifier.verifyDeletionSafety(fileInfo.filePath);

                if(!finalSafetyCheck.overallSafety) {
                    results.summary.skipped++;
                    results.deletions.push({'
                        filePath: fileInfo.filePath,
                        status: 'skipped',)';
                        reason: 'Final safety check failed',);
                        safetyCheck: finalSafetyCheck);
        ,}
                        timestamp: new Date().toISOString(); }
                    });
                    continue;
                }

                // バックアップ記録作成
                const backupRecord = await this.createDeletionBackup(fileInfo.filePath);
                
                // ファイル削除実行
                const deletionResult = await this.deleteFile(fileInfo.filePath);
                
                if(deletionResult.success) {
                
                    // 削除確認
                    const verificationResult = await this.verifyDeletion(fileInfo.filePath);
                    
                    if (verificationResult.deleted) {
                        // 削除後テスト実行
                        const testResult = await this.runPostDeletionTests(''';
                            status: 'deleted';
                            backupRecord,
                            deletionResult);
                            verificationResult);
                            testResult,);
                }
                            timestamp: new Date().toISOString(), };
                        
                        results.deletions.push(deletionRecord);
                        this.deletionLog.push(deletionRecord);

                        if(testResult.passed) { results.summary.succeeded++; } else { results.summary.failed++;
                            results.errors.push({'
                                filePath: fileInfo.filePath,)';
                                error: 'Post-deletion tests failed',' }

                                testResult)'); }'
} else { results.summary.failed++;
                        results.errors.push({'
                            filePath: fileInfo.filePath,)';
                            error: 'Deletion verification failed',' }

                            verificationResult)'); }'
} else { results.summary.failed++;
                    results.errors.push({'
                        filePath: fileInfo.filePath,)';
                        error: 'File deletion failed', }
                        deletionResult); }
                } catch (error) { results.summary.failed++;
                results.errors.push({)
                    filePath: fileInfo.filePath);
                    error: (error, as Error).message;
                    timestamp: new Date().toISOString( });
            }
        }

        results.endTime = new Date().toISOString();
        results.duration = new Date(results.endTime).getTime() - new Date(results.startTime).getTime();
        
        return results;
    }

    /**
     * 削除前バックアップ記録作成
     */
    async createDeletionBackup(filePath: string): Promise<BackupRecord> { const backup: BackupRecord = {'
            filePath,
            createdAt: new Date().toISOString()';
            const content = await fs.readFile(filePath, 'utf8);
            const stats = await fs.stat(filePath);
            
            // Git情報取得
            const gitInfo = await this.getGitFileInfo(filePath);
            
            backup.fileInfo = {
                size: stats.size;
                lastModified: stats.mtime.toISOString(),
                contentHash: this.calculateHash(content),
                lineCount: content.split('\n).length ,};
            backup.gitInfo = gitInfo;
            backup.recoveryInstructions = this.generateRecoveryInstructions(filePath, gitInfo);
            backup.backupCreated = true;
            
            // バックアップ記録を保存
            this.backupRecord[filePath] = backup;
            
        } catch (error) { backup.error = (error, as Error).message;
            backup.backupCreated = false; }

        return backup;
    }

    /**
     * ファイル削除実行
     */
    async deleteFile(filePath: string): Promise<DeletionResult> { const result: DeletionResult = {
            filePath,
            success: false;
            deletedAt: null;
            error: null ,};
        try { // ファイル存在確認
            await fs.access(filePath);
            
            // ファイル削除
            await fs.unlink(filePath);
            
            result.success = true;
            result.deletedAt = new Date().toISOString();
             } catch (error) { result.error = (error, as Error).message;
            result.success = false; }

        return result;
    }

    /**
     * 削除確認
     */
    async verifyDeletion(filePath: string): Promise<VerificationResult> { const verification: VerificationResult = {
            filePath,
            deleted: false;
            verifiedAt: new Date().toISOString( ,};
        try { // ファイルが存在しないことを確認
            await fs.access(filePath);

            verification.deleted = false;''
            verification.error = 'File still exists'; } catch (error) { // ファイルが存在しない場合はエラーが発生する（期待される動作）
            verification.deleted = true; }

        return verification;
    }

    /**
     * 削除後テスト実行
     */
    async runPostDeletionTests(): Promise<PostDeletionTestResult> { const testResult: PostDeletionTestResult = {
            passed: false;
            tests: {
                basicImportTest: false;
                buildTest: false;
                syntaxTest: false };
            errors: [];
            executedAt: new Date().toISOString();
        };

        try { // 基本的なインポートテスト
            testResult.tests.basicImportTest = await this.runBasicImportTest();
            
            // ビルドテスト（簡易）
            testResult.tests.buildTest = await this.runBasicBuildTest();
            
            // 構文テスト
            testResult.tests.syntaxTest = await this.runBasicSyntaxTest();
            
            // 全テストが通過した場合
            testResult.passed = Object.values(testResult.tests).every(test => test === true);
             }
        } catch (error) { testResult.errors.push((error, as Error).message);
            testResult.passed = false; }

        return testResult;
    }

    /**
     * 基本インポートテストの実行
     */''
    async runBasicImportTest(''';
                'src/core/GameEngine.js',
                'src/core/SceneManager.js';
            ];
            );
            for(const, coreFile of, coreFiles) {
            ';

                try {'
                    await fs.access(coreFile);''
                    const content = await fs.readFile(coreFile, 'utf8'');
                    ';
                    // 基本的な構文チェック
                    if(content.includes('SyntaxError) || content.length === 0) {'
            
            }
                        return false; catch (error) { // コアファイルにアクセスできない場合
                    return false;
            
            return true;
        } catch (error) { return false;

    /**
     * 基本ビルドテストの実行
     */''
    async runBasicBuildTest()';
            await fs.access('./package.json'');
            ';
            // 基本的なプロジェクト構造の確認
            const requiredDirs = ['src', 'src/core', 'src/scenes];
            
            for(const, dir of, requiredDirs) {
            
                try {
                    const stats = await fs.stat(dir);
                    if(!stats.isDirectory() {
            
            }
                        return false; catch (error) { return false;
            
            return true;
        } catch (error) { return false;

    /**
     * 基本構文テストの実行
     */
    async runBasicSyntaxTest(): Promise<boolean> { try {
            // プロジェクト内のJSファイルの基本構文チェック
            const jsFiles = await this.findJavaScriptFiles();
            const sampleSize = Math.min(jsFiles.length, 10); // 最大10ファイルをサンプル

            for(let, i = 0; i < sampleSize; i++) {
                const file = jsFiles[i];

                try {'
                    const content = await fs.readFile(file, 'utf8'');
                    ';
                    // 明らかな構文エラーをチェック
                    if (content.includes('SyntaxError'') || '';
                        content.includes('Unexpected, token'') ||'';
                        content.match(/\bimport\s+.*\s+from\s+['"][^'"]*_old\.js['"]/) ||"";
                        content.match(/\bimport\s+.*\s+from\s+['"][^'"]*_original\.js['"]/) ||"";
                        content.match(/\bimport\s+.*\s+from\s+['"][^'"]*_backup\.js['"]/) {
            }
                        return false; catch (error) { // ファイル読み取りエラーは無視
                    continue; }
            }
            
            return true;
        } catch (error) { return false;

    /**
     * JavaScriptファイルの検索
     */
    async findJavaScriptFiles(): Promise<string[]> { const jsFiles: string[] = [],
        
        async function scanDir(dir: string) {
            try { ,}
                const entries = await fs.readdir(dir, { withFileTypes: true });"

                for(const, entry of, entries) {"

                    if (entry.name.startsWith('.'') || entry.name === 'node_modules') {
                }
                        continue; }
                    }
                    
                    const fullPath = path.join(dir, entry.name);
                    
                    if(entry.isDirectory() {
                    ';

                        ';

                    }

                        await scanDir(fullPath);' }'

                    } else if (entry.name.endsWith('.js'') && !entry.name.includes('_old'') && !entry.name.includes('_original'') && !entry.name.includes('_backup) { jsFiles.push(fullPath); }

                    }''
                } catch (error) { // ディレクトリアクセスエラーは無視 }
        }

        await scanDir('./src);
        return jsFiles;
    }

    /**
     * Gitファイル情報取得'
     */''
    async getGitFileInfo(filePath: string): Promise<GitInfo> { const gitInfo: GitInfo = {
            hasHistory: false;
            lastCommit: null;
            branch: null };
';

        try { }

            const { exec } = await import('child_process'');''
            const { promisify } = await import('util);''
            const execAsync = promisify(exec);

            // 最後のコミット情報
            try { }

                const { stdout } = await execAsync(`git, log -1 --format="%H %s %ai" -- "${ filePath)"`);
                if(stdout.trim() {"

                    const [hash, ...rest] = stdout.trim("}.split(' ''};
                    gitInfo.hasHistory = true;
                    gitInfo.lastCommit = {
                }

                        hash,' }'

                        message: rest.join(' '});
                    };''
                } catch (error) { // Git履歴取得エラーは無視 }

            // 現在のブランチ
            try { }

                const { stdout } = await execAsync('git, branch --show-current);
                gitInfo.branch = stdout.trim();
            } catch (error) { // ブランチ取得エラーは無視 } catch (error) { gitInfo.error = (error, as Error).message; }

        return gitInfo;
    }

    /**
     * 復旧手順の生成
     */''
    generateRecoveryInstructions(filePath: string, gitInfo: GitInfo): RecoveryInstructions { const instructions: RecoveryInstructions = {''
            method: 'git_history';
            commands: [];
            notes: [] };
';

        if (gitInfo.hasHistory && gitInfo.lastCommit) { instructions.commands.push(' }'

                `# ${filePath}を復旧するコマンド:`)''
                `git show ${gitInfo.lastCommit.hash}:"${filePath}" > "${ filePath"}"` });"
            instructions.notes.push(")";
                `最後のコミット: ${gitInfo.lastCommit.hash}`")""
                `ブランチ: ${ gitInfo.branch || 'unknown'}`' }

            '});

        } else {
            instructions.method = 'manual';

            instructions.notes.push('';
                'Git履歴が見つかりません',)';
                '手動で復旧する必要があります',' }

                '対応する現在ファイルから復元を検討してください'); }
        }

        return instructions;
    }

    /**
     * 内容のハッシュ計算
     */
    calculateHash(content: string): string { // シンプルなハッシュ計算
        let hash = 0;
        for(let, i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
        }
            hash = hash & hash; // 32bit整数に変換 }
        }
        return hash.toString(16);
    }

    /**
     * 削除ログの取得
     */
    getDeletionLog(): DeletionRecord[] { return this.deletionLog; }

    /**
     * バックアップ記録の取得
     */
    getBackupRecord(): Record<string, BackupRecord> { return this.backupRecord; }

    /**
     * 削除実行レポートの生成
     */''
    generateDeletionReport(deletionResults: DeletionResults): DeletionReport { const report: DeletionReport = {'
            summary: deletionResults.summary,
            successfulDeletions: deletionResults.deletions.filter(d => d.status === 'deleted''),
            skippedDeletions: deletionResults.deletions.filter(d => d.status === 'skipped);
            errors: deletionResults.errors;
            recoveryInfo: {
                backupRecords: this.backupRecord;
                deletionLog: this.deletionLog ,}
            };
            generatedAt: new Date().toISOString();
        };

        // サイズ削減計算
        const deletedFiles = report.successfulDeletions;
        if(deletedFiles.length > 0) {
            report.sizeReduction = {
                filesDeleted: deletedFiles.length }
                estimatedBytesFreed: deletedFiles.reduce((sum, file) => {  }
                    return sum + (file.backupRecord?.fileInfo ? file.backupRecord.fileInfo.size: 0),' '
                }, 0');

        return report;

export default SequentialFileRemover;