import fs from 'fs';
import path from 'path';

export class FileRemover {
    constructor() {
        this.backupDirectory = path.join(process.cwd(), '.cleanup-backups');
        this.ensureBackupDirectory();
    }

    async ensureBackupDirectory() {
        try {
            await fs.promises.mkdir(this.backupDirectory, { recursive: true });
        } catch (error) {
            console.error('Error creating backup directory:', error);
        }
    }

    async createBackupRecord(filePath) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = path.basename(filePath);
        const backupFileName = `${timestamp}_${fileName}.backup`;
        const backupPath = path.join(this.backupDirectory, backupFileName);

        try {
            await this.ensureBackupDirectory();
            await fs.promises.copyFile(filePath, backupPath);

            const stats = await fs.promises.stat(filePath);
            const backupRecord = {
                originalPath: filePath,
                backupPath,
                fileName,
                fileSize: stats.size,
                lastModified: stats.mtime,
                backupTimestamp: new Date().toISOString(),
                backupCreated: true,
                error: null
            };

            // Save backup metadata
            const metadataPath = path.join(this.backupDirectory, `${timestamp}_${fileName}.meta.json`);
            await fs.promises.writeFile(metadataPath, JSON.stringify(backupRecord, null, 2));

            return backupRecord;
        } catch (error) {
            return {
                originalPath: filePath,
                backupPath: null,
                fileName: path.basename(filePath),
                fileSize: 0,
                lastModified: null,
                backupTimestamp: new Date().toISOString(),
                backupCreated: false,
                error: `Failed to create backup: ${error.message}`
            };
        }
    }

    async removeFile(filePath) {
        try {
            await fs.promises.unlink(filePath);
            return {
                deleted: true,
                error: null,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                deleted: false,
                error: `Failed to delete file: ${error.message}`,
                timestamp: new Date().toISOString()
            };
        }
    }

    async verifyRemoval(filePath) {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return {
                verified: false,
                error: 'File still exists after deletion attempt'
            };
        } catch (error) {
            if (error.code === 'ENOENT') {
                return {
                    verified: true,
                    error: null
                };
            }
            return {
                verified: false,
                error: `Error verifying removal: ${error.message}`
            };
        }
    }

    async rollbackIfNeeded(backupRecord) {
        if (!backupRecord.backupCreated || !backupRecord.backupPath) {
            return {
                rolledBack: false,
                error: 'No backup available for rollback'
            };
        }

        try {
            await fs.promises.copyFile(backupRecord.backupPath, backupRecord.originalPath);
            return {
                rolledBack: true,
                error: null,
                restoredPath: backupRecord.originalPath
            };
        } catch (error) {
            return {
                rolledBack: false,
                error: `Failed to rollback: ${error.message}`
            };
        }
    }

    async safeRemoveFile(filePath) {
        const result = {
            filePath: path.relative(process.cwd(), filePath),
            deleted: false,
            backupCreated: false,
            verified: false,
            error: null,
            timestamp: new Date().toISOString(),
            backupRecord: null,
            removalResult: null,
            verificationResult: null
        };

        try {
            // Step 1: Create backup
            const backupRecord = await this.createBackupRecord(filePath);
            result.backupRecord = backupRecord;
            result.backupCreated = backupRecord.backupCreated;

            if (!backupRecord.backupCreated) {
                result.error = `Backup failed: ${backupRecord.error}`;
                return result;
            }

            // Step 2: Remove file
            const removalResult = await this.removeFile(filePath);
            result.removalResult = removalResult;
            result.deleted = removalResult.deleted;

            if (!removalResult.deleted) {
                result.error = `Deletion failed: ${removalResult.error}`;
                return result;
            }

            // Step 3: Verify removal
            const verificationResult = await this.verifyRemoval(filePath);
            result.verificationResult = verificationResult;
            result.verified = verificationResult.verified;

            if (!verificationResult.verified) {
                result.error = `Verification failed: ${verificationResult.error}`;
                // Attempt rollback
                const rollbackResult = await this.rollbackIfNeeded(backupRecord);
                result.rollbackResult = rollbackResult;
            }

        } catch (error) {
            result.error = `Unexpected error during removal: ${error.message}`;
        }

        return result;
    }

    async removeBatch(filePaths) {
        const results = [];
        let successCount = 0;
        let failureCount = 0;

        for (const filePath of filePaths) {
            const result = await this.safeRemoveFile(filePath);
            results.push(result);

            if (result.deleted && result.verified) {
                successCount++;
            } else {
                failureCount++;
            }
        }

        return {
            results,
            totalFiles: filePaths.length,
            successCount,
            failureCount,
            timestamp: new Date().toISOString()
        };
    }

    async listBackups() {
        try {
            const files = await fs.promises.readdir(this.backupDirectory);
            const metaFiles = files.filter(file => file.endsWith('.meta.json'));
            
            const backups = [];
            for (const metaFile of metaFiles) {
                try {
                    const metaPath = path.join(this.backupDirectory, metaFile);
                    const content = await fs.promises.readFile(metaPath, 'utf8');
                    const metadata = JSON.parse(content);
                    backups.push(metadata);
                } catch (error) {
                    console.error(`Error reading backup metadata ${metaFile}:`, error);
                }
            }

            return backups.sort((a, b) => new Date(b.backupTimestamp) - new Date(a.backupTimestamp));
        } catch (error) {
            console.error('Error listing backups:', error);
            return [];
        }
    }

    async cleanupOldBackups(maxAge = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - maxAge);

        try {
            const backups = await this.listBackups();
            const oldBackups = backups.filter(backup => 
                new Date(backup.backupTimestamp) < cutoffDate
            );

            let cleanedCount = 0;
            for (const backup of oldBackups) {
                try {
                    if (backup.backupPath && await this.fileExists(backup.backupPath)) {
                        await fs.promises.unlink(backup.backupPath);
                    }
                    
                    const metaFile = backup.backupPath + '.meta.json';
                    if (await this.fileExists(metaFile)) {
                        await fs.promises.unlink(metaFile);
                    }
                    
                    cleanedCount++;
                } catch (error) {
                    console.error(`Error cleaning backup ${backup.fileName}:`, error);
                }
            }

            return {
                cleanedCount,
                totalOld: oldBackups.length,
                cutoffDate: cutoffDate.toISOString()
            };
        } catch (error) {
            console.error('Error cleaning old backups:', error);
            return { cleanedCount: 0, totalOld: 0, error: error.message };
        }
    }

    async fileExists(filePath) {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }
}