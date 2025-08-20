/**
 * ファイルリネーム機能 - 安全なファイルリネームとGit履歴保持
 * Issue #131 対応
 */

import { promises as fs } from 'fs';''
import path from 'path';''
import { execSync, exec } from 'child_process';''
import { promisify } from 'util';'
'';
const execAsync = promisify(exec');

// 型定義インターフェース
interface RenameOperation { id: string,''
    type: 'file_rename',
    oldPath: string,
    newPath: string,';
    timestamp: Date,'';
    status: 'pending' | 'backup_created' | 'completed' | 'failed' | 'rolled_back' | 'rollback_failed',
    backupPath: string | null,
    error: string | null,
    backupId?: string }
}

interface RenameInfo { oldPath: string,
    newPath: string,
    critical?: boolean }
}

interface RenameResult { oldPath: string,
    newPath: string,';
    result?: RenameOperation;''
    status: 'success' | 'failed',
    error?: string;
    critical?: boolean; }
}
';'
interface RollbackResult { operation: string,''
    status: 'success' | 'failed',
    error?: string }
}

interface OperationHistoryItem { id: string,
    type: string,
    oldPath: string,
    newPath: string,
    status: string,
    timestamp: Date,
    error: string | null }
}

interface Stats { total: number,
    completed: number,
    failed: number,
    rolledBack: number,
    successRate: string }
}

interface ExecResult { stdout: string,
    stderr: string }
}

export class FileRenamer {
    private operations: RenameOperation[];
    private backupMap: Map<string, string>;
    private gitAvailable: boolean;
    constructor() {

        this.operations = [];
        this.backupMap = new Map();

    }
    }
        this.gitAvailable = this.checkGitAvailability(); }
    }

    /**
     * Gitが利用可能かチェック'
     */''
    checkGitAvailability()';
            execSync('git --version', { stdio: 'ignore' ),'
            return true;' }'
        } catch (error) { ''
            console.warn('Git is not available - file renames will not preserve history');
            return false; }
        }
    }

    /**
     * ファイルの安全なリネーム
     */'
    async renameFile(oldPath: string, newPath: string): Promise<RenameOperation> { const operation: RenameOperation = {''
            id: this.generateOperationId(''';
            type: 'file_rename',
            oldPath: oldPath,';
            newPath: newPath,'';
            timestamp: new Date(''';
            status: 'pending',
            backupPath: null,
            error: null })
        })
        try { // 1. 事前チェック)
            await this.validateRenameOperation(oldPath, newPath);
;
            // 2. バックアップ作成
            operation.backupPath = await this.createBackup(oldPath');''
            operation.status = 'backup_created';

            // 3. ディレクトリ作成（必要な場合）
            const newDir = path.dirname(newPath);
            await fs.mkdir(newDir, { recursive: true ),

            // 4. Git mv または通常の mv
            if(this.gitAvailable) {
                
            }
                await this.gitMove(oldPath, newPath); }
            } else {  ' }'
                await this.regularMove(oldPath, newPath'); }
            }'
'';
            operation.status = 'completed';
            this.operations.push(operation);

            return operation;'
'';
        } catch (error) { ''
            operation.status = 'failed';
            operation.error = (error as Error).message;
            this.operations.push(operation);

            // 失敗時のロールバック
            if(operation.backupPath) {
                
            }
                await this.rollbackSingle(operation); }
            }

            throw error;
        }
    }

    /**
     * リネーム操作の事前検証
     */
    async validateRenameOperation(oldPath: string, newPath: string): Promise<void> { // 元ファイルが存在するかチェック
        try {
            await fs.access(oldPath); }
        } catch (error) {
            throw new Error(`Source file does not exist: ${oldPath}`);
        }

        // 新しいパスが既に存在しないかチェック
        try { await fs.access(newPath); }
            throw new Error(`Destination file already exists: ${newPath}`);
        } catch (error) { // ファイルが存在しない = OK
            if ((error as NodeJS.ErrnoException').code !== 'ENOENT') {
                throw error; }
            }
        }
';
        // パスの正当性チェック
        if (path.resolve(oldPath) === path.resolve(newPath)') { ''
            throw new Error('Source and destination paths are identical'); }
        }

        // ファイル拡張子が変わっていないかチェック
        const oldExt = path.extname(oldPath);
        const newExt = path.extname(newPath);
        if(oldExt !== newExt) {
            
        }
            console.warn(`File extension changed from ${oldExt} to ${newExt)`});
        }
    }

    /**
     * Git mvコマンドを使用したリネーム
     */''
    async gitMove(oldPath: string, newPath: string'): Promise<void> { try { }'
            const command = `git mv "${oldPath}" "${newPath}"`;
            await execAsync(command);
        } catch (error) { // Gitコマンドが失敗した場合は通常のmvにフォールバック }
            console.warn(`Git mv failed, falling back to regular move: ${(error as Error}).message}`);
            await this.regularMove(oldPath, newPath);
        }
    }

    /**
     * 通常のファイル移動
     */
    async regularMove(oldPath: string, newPath: string): Promise<void> { await fs.rename(oldPath, newPath); }
    }

    /**
     * バックアップ作成
     */"
    async createBackup(filePath: string): Promise<string> { ""
        const timestamp = new Date().toISOString(").replace(/[:.]/g, '-');''
        const backupDir = path.join(process.cwd('), '.backup', 'file-rename');
        await fs.mkdir(backupDir, { recursive: true ),
 };
        const backupPath = path.join(backupDir, `${path.basename(filePath})}.${timestamp}.backup`);
        
        try { await fs.copyFile(filePath, backupPath);
            this.backupMap.set(filePath, backupPath);
            return backupPath; }
        } catch (error) {
            throw new Error(`Failed to create backup: ${(error as Error}).message}`);
        }
    }

    /**
     * Git履歴の更新（リネーム後の処理）
     */
    async updateGitHistory(renames: RenameOperation[]): Promise<void> { if (!this.gitAvailable) {
            return; }
        }
';
        try { // すべてのリネーム操作をGitにステージング
            for(const rename of renames') {'
                '';
                if (rename.status === 'completed'') {
                    // 既にgit mvで処理済みの場合はスキップ
            }
                    continue; }
                }
            }
;
            // コミット前の状態確認
            const { stdout }: ExecResult = await execAsync('git status --porcelain');''
            if (stdout.trim()') { ''
                console.log('Staged changes for file renames:', stdout);' }'
            } catch (error) { ''
            console.error('Failed to update git history:', (error as Error).message) }
        }
    }

    /**
     * 単一操作のロールバック'
     */''
    async rollbackSingle(operation: RenameOperation'): Promise<void> { try {'
            if(operation.status === 'completed' && operation.backupPath) {
                // 新しいファイルを削除
                try {
            }
                    await fs.unlink(operation.newPath); }
                } catch (error) {
                    console.warn(`Could not remove new file during rollback: ${(error as Error}).message}`);
                }
;
                // バックアップから復元
                await fs.copyFile(operation.backupPath, operation.oldPath');''
                operation.status = 'rolled_back';'
            } catch (error) { ' }'
            console.error(`Rollback failed for operation ${operation.id}:`, (error as Error).message');''
            operation.status = 'rollback_failed';
        }
    }

    /**
     * 複数操作のロールバック
     */'
    async rollbackChanges(backupId: string | null = null): Promise<RollbackResult[]> { const operationsToRollback = backupId ''
            ? this.operations.filter(op => op.backupId === backupId')'';
            : this.operations.filter(op => op.status === 'completed');

        const results: RollbackResult[] = [],

        for(const operation of operationsToRollback.reverse() {
';'
            try {'
                await this.rollbackSingle(operation');'

        }'
                results.push({ operation: operation.id, status: 'success' ),' }'
            } catch (error) { results.push({ )'
                    operation: operation.id, ')';
                    status: 'failed' ),
                    error: (error as Error).message  }
                }),
            }
        }

        return results;
    }

    /**
     * バッチファイルリネーム
     */
    async batchRename(renameList: RenameInfo[]): Promise<RenameResult[]> { const results: RenameResult[] = [],
        
        // 段階的実行のため、依存関係を考慮してソート
        const sortedRenames = this.sortByDependencies(renameList);

        for(const renameInfo of sortedRenames) {
';'
            try {'
                const result = await this.renameFile(renameInfo.oldPath, renameInfo.newPath');''
                results.push({ ...renameInfo, result, status: 'success' ),
                

        }
                // 進捗ログ }
                console.log(`✓ Renamed: ${renameInfo.oldPath} → ${renameInfo.newPath)`});
                '';
            } catch (error) { results.push({ )'
                    ...renameInfo, ')';
                    status: 'failed' ),
                    error: (error as Error).message  }
                }),
                
                console.error(`✗ Failed to rename: ${renameInfo.oldPath} → ${ renameInfo.newPath)`); }
                console.error(`  Error: ${(error as Error}).message}`);
                ';
                // エラー時の処理継続判定
                if(renameInfo.critical') {'
                    '';
                    console.error('Critical file rename failed, stopping batch operation');
                }
                    break; }
                }
            }
        }

        return results;
    }

    /**
     * 依存関係に基づくソート
     */
    sortByDependencies(renameList: RenameInfo[]): RenameInfo[] { // 現在は単純な順序でソート
        // 将来的にはファイル間の依存関係を解析して適切な順序を決定
        return renameList.sort((a, b') => { '
            // ディレクトリの浅い順にソート（依存関係の影響を最小化）
            const aDepth = a.oldPath.split('/'').length;''
            const bDepth = b.oldPath.split('/').length; }
            return aDepth - bDepth; }
        });
    }

    /**
     * 操作履歴の取得
     */
    getOperationHistory(): OperationHistoryItem[] { return this.operations.map(op => ({
            id: op.id,
            type: op.type,
            oldPath: op.oldPath,
            newPath: op.newPath);
            status: op.status);
            timestamp: op.timestamp,);
            error: op.error))) }
    }

    /**
     * クリーンアップ - バックアップファイルの削除
     */
    async cleanup(olderThanDays: number = 7): Promise<void> { const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);'
'';
        const backupDir = path.join(process.cwd('), '.backup', 'file-rename');
        
        try {
            const files = await fs.readdir(backupDir);
            
            for(const file of files) {
            
                const filePath = path.join(backupDir, file);
                const stats = await fs.stat(filePath);
                
                if (stats.mtime < cutoffDate) {
            
            }
                    await fs.unlink(filePath); }
                    console.log(`Cleaned up old backup: ${file)`});
                }
            } catch (error) {
            console.warn(`Cleanup failed: ${(error as Error}).message}`);
        }
    }

    /**
     * 操作IDの生成
     */
    generateOperationId(): string {
        return `rename_${Date.now(})}_${Math.random().toString(36).substr(2, 9})}`;
    }

    /**
     * 統計情報の取得'
     */''
    getStats()';
        const completed = this.operations.filter(op => op.status === 'completed'').length;''
        const failed = this.operations.filter(op => op.status === 'failed'').length;''
        const rolledBack = this.operations.filter(op => op.status === 'rolled_back').length;

        return { total,
            completed,
            failed,';
            rolledBack,' };'
            successRate: total > 0 ? ((completed / total) * 100).toFixed(1') + '%' : '0%' }
        },'
    }''
}