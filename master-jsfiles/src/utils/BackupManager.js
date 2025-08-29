/**
 * バックアップ・ロールバック管理システム
 * Issue #131 対応
 */

import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export class BackupManager {
    constructor() {
        this.backupRoot = path.join(process.cwd(), '.backup');
        this.currentBackupId = null;
        this.backups = new Map();
    }

    /**
     * 新しいバックアップセッションを開始
     */
    async startBackupSession(sessionName = 'deduplication') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.currentBackupId = `${sessionName}_${timestamp}`;
        
        const backupDir = path.join(this.backupRoot, this.currentBackupId);
        await fs.mkdir(backupDir, { recursive: true });
        
        const session = {
            id: this.currentBackupId,
            name: sessionName,
            startTime: new Date(),
            backupDir: backupDir,
            files: [],
            operations: [],
            metadata: {
                gitBranch: this.getCurrentGitBranch(),
                gitCommit: this.getCurrentGitCommit(),
                nodeVersion: process.version,
                platform: process.platform
            }
        };

        this.backups.set(this.currentBackupId, session);
        
        // メタデータファイルを作成
        await this.saveSessionMetadata(session);
        
        console.log(`✓ Backup session started: ${this.currentBackupId}`);
        return this.currentBackupId;
    }

    /**
     * ファイルの完全バックアップを作成
     */
    async createFullBackup(filePaths) {
        if (!this.currentBackupId) {
            throw new Error('No active backup session. Call startBackupSession first.');
        }

        const session = this.backups.get(this.currentBackupId);
        const results = [];

        for (const filePath of filePaths) {
            try {
                const backupInfo = await this.backupSingleFile(filePath, session);
                session.files.push(backupInfo);
                results.push({ file: filePath, status: 'success', backup: backupInfo });
            } catch (error) {
                results.push({ 
                    file: filePath, 
                    status: 'failed', 
                    error: error.message 
                });
            }
        }

        await this.saveSessionMetadata(session);
        
        console.log(`✓ Backed up ${results.filter(r => r.status === 'success').length}/${filePaths.length} files`);
        return results;
    }

    /**
     * 単一ファイルのバックアップ
     */
    async backupSingleFile(filePath, session) {
        const relativePath = path.relative(process.cwd(), filePath);
        const backupPath = path.join(session.backupDir, relativePath);
        
        // バックアップディレクトリ作成
        const backupDir = path.dirname(backupPath);
        await fs.mkdir(backupDir, { recursive: true });
        
        // ファイルの統計情報取得
        const stats = await fs.stat(filePath);
        
        // ファイルコピー
        await fs.copyFile(filePath, backupPath);
        
        const backupInfo = {
            originalPath: filePath,
            relativePath: relativePath,
            backupPath: backupPath,
            size: stats.size,
            modifiedTime: stats.mtime,
            backupTime: new Date(),
            checksum: await this.calculateChecksum(filePath)
        };

        return backupInfo;
    }

    /**
     * 段階的ロールバック
     */
    async rollbackChanges(backupId, options = {}) {
        const session = this.backups.get(backupId);
        if (!session) {
            throw new Error(`Backup session not found: ${backupId}`);
        }

        const {
            selective = false,
            filePatterns = [],
            dryRun = false
        } = options;

        const results = [];
        let filesToRestore = session.files;

        // 選択的ロールバックの場合
        if (selective && filePatterns.length > 0) {
            filesToRestore = session.files.filter(file =>
                filePatterns.some(pattern => 
                    file.relativePath.includes(pattern) ||
                    file.originalPath.includes(pattern)
                )
            );
        }

        console.log(`${dryRun ? '[DRY RUN] ' : ''}Rolling back ${filesToRestore.length} files...`);

        for (const fileInfo of filesToRestore) {
            try {
                if (!dryRun) {
                    await this.restoreSingleFile(fileInfo);
                }
                
                results.push({ 
                    file: fileInfo.originalPath, 
                    status: 'restored',
                    dryRun: dryRun
                });
                
                console.log(`${dryRun ? '[DRY RUN] ' : ''}✓ Restored: ${fileInfo.relativePath}`);
                
            } catch (error) {
                results.push({ 
                    file: fileInfo.originalPath, 
                    status: 'failed', 
                    error: error.message 
                });
                
                console.error(`✗ Failed to restore: ${fileInfo.relativePath}`);
                console.error(`  Error: ${error.message}`);
            }
        }

        const successCount = results.filter(r => r.status === 'restored').length;
        console.log(`${dryRun ? '[DRY RUN] ' : ''}Rollback completed: ${successCount}/${filesToRestore.length} files restored`);

        return results;
    }

    /**
     * 単一ファイルの復元
     */
    async restoreSingleFile(fileInfo) {
        // バックアップファイルが存在するかチェック
        await fs.access(fileInfo.backupPath);
        
        // 復元先ディレクトリを作成（必要な場合）
        const targetDir = path.dirname(fileInfo.originalPath);
        await fs.mkdir(targetDir, { recursive: true });
        
        // チェックサム検証
        const backupChecksum = await this.calculateChecksum(fileInfo.backupPath);
        if (backupChecksum !== fileInfo.checksum) {
            console.warn(`Checksum mismatch for backup: ${fileInfo.relativePath}`);
        }
        
        // ファイル復元
        await fs.copyFile(fileInfo.backupPath, fileInfo.originalPath);
        
        // タイムスタンプ復元
        await fs.utimes(fileInfo.originalPath, fileInfo.modifiedTime, fileInfo.modifiedTime);
    }

    /**
     * 操作ログの記録
     */
    logOperation(operation) {
        if (!this.currentBackupId) {
            console.warn('No active backup session for logging operation');
            return;
        }

        const session = this.backups.get(this.currentBackupId);
        session.operations.push({
            ...operation,
            timestamp: new Date()
        });
    }

    /**
     * セッションメタデータの保存
     */
    async saveSessionMetadata(session) {
        const metadataPath = path.join(session.backupDir, 'session-metadata.json');
        const metadata = {
            ...session,
            files: session.files.length, // ファイルの詳細は別途保存
            endTime: new Date()
        };

        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        
        // ファイル詳細は別ファイルに保存
        const filesPath = path.join(session.backupDir, 'files-manifest.json');
        await fs.writeFile(filesPath, JSON.stringify(session.files, null, 2));
    }

    /**
     * バックアップセッションのリストを取得
     */
    async listBackupSessions() {
        try {
            const backupDirs = await fs.readdir(this.backupRoot, { withFileTypes: true });
            const sessions = [];

            for (const dir of backupDirs) {
                if (dir.isDirectory()) {
                    try {
                        const metadataPath = path.join(this.backupRoot, dir.name, 'session-metadata.json');
                        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
                        sessions.push({
                            id: dir.name,
                            name: metadata.name,
                            startTime: metadata.startTime,
                            endTime: metadata.endTime,
                            fileCount: metadata.files,
                            operationCount: metadata.operations?.length || 0
                        });
                    } catch (error) {
                        console.warn(`Could not read metadata for backup: ${dir.name}`);
                    }
                }
            }

            return sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        } catch (error) {
            return [];
        }
    }

    /**
     * 古いバックアップの削除
     */
    async cleanupOldBackups(retainDays = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retainDays);

        const sessions = await this.listBackupSessions();
        const toDelete = sessions.filter(session => 
            new Date(session.startTime) < cutoffDate
        );

        let deletedCount = 0;

        for (const session of toDelete) {
            try {
                const sessionDir = path.join(this.backupRoot, session.id);
                await fs.rm(sessionDir, { recursive: true, force: true });
                deletedCount++;
                console.log(`Deleted old backup: ${session.id}`);
            } catch (error) {
                console.error(`Failed to delete backup ${session.id}: ${error.message}`);
            }
        }

        console.log(`Cleanup completed: ${deletedCount} old backups deleted`);
        return deletedCount;
    }

    /**
     * チェックサム計算
     */
    async calculateChecksum(filePath) {
        const crypto = await import('crypto');
        const data = await fs.readFile(filePath);
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * 現在のGitブランチを取得
     */
    getCurrentGitBranch() {
        try {
            return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * 現在のGitコミットハッシュを取得
     */
    getCurrentGitCommit() {
        try {
            return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * バックアップの検証
     */
    async verifyBackup(backupId) {
        const session = this.backups.get(backupId);
        if (!session) {
            throw new Error(`Backup session not found: ${backupId}`);
        }

        const results = [];

        for (const fileInfo of session.files) {
            try {
                // バックアップファイルが存在するかチェック
                await fs.access(fileInfo.backupPath);
                
                // チェックサム検証
                const currentChecksum = await this.calculateChecksum(fileInfo.backupPath);
                const isValid = currentChecksum === fileInfo.checksum;
                
                results.push({
                    file: fileInfo.relativePath,
                    status: isValid ? 'valid' : 'corrupted',
                    checksum: currentChecksum,
                    expectedChecksum: fileInfo.checksum
                });
                
            } catch (error) {
                results.push({
                    file: fileInfo.relativePath,
                    status: 'missing',
                    error: error.message
                });
            }
        }

        const validCount = results.filter(r => r.status === 'valid').length;
        const corruptedCount = results.filter(r => r.status === 'corrupted').length;
        const missingCount = results.filter(r => r.status === 'missing').length;

        console.log(`Backup verification completed:
  Valid: ${validCount}
  Corrupted: ${corruptedCount}
  Missing: ${missingCount}`);

        return results;
    }
}