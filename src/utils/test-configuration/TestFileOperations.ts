import { BaseComponent } from '../../debug/BaseComponent.js';''
import fs from 'fs';''
import path from 'path';

// Type definitions
interface MainController { testsDir: string,
    projectRoot: string,
    backupEnabled: boolean,
    dryRun: boolean,
    testFilePatterns: Record<string, string>;
    [key: string]: any, }
}

interface FileOperationOptions { silent?: boolean;
    encoding?: BufferEncoding;
    force?: boolean;
    recursive?: boolean;
    filter?: (file: FileInfo) => boolean; }
}

interface FileInfo { name: string,
    path: string,
    size: number,
    modified: Date,
    extension: string; }
}

interface BackupInfo extends FileInfo { originalFile: string,
    backupDate: Date | null; }
}

interface OperationDetails { filePath?: string;
    size?: number;
    timestamp: number,
    backupPath?: string | null;
    originalPath?: string;
    targetPath?: string; }
}

interface OperationRecord { operation: string,
    details: OperationDetails,
    timestamp: number; }
}

interface FileOperations { read: (filePath: string, options?: FileOperationOptions) => string | null;
    write: (filePath: string, content: string, options?: FileOperationOptions) => boolean;
    backup: (filePath: string) => string | null,
    restore: (backupPath: string, targetPath: string) => boolean,
    delete: (filePath: string, options?: FileOperationOptions) => boolean; }
}

interface TestFileUpdateResult { success: boolean,
    testType: string,
    testFilePath?: string;
    linesGenerated?: number;
    dryRun?: boolean;
    error?: string; }
}

interface OperationStatistics { totalOperations: number,
    operationCounts: Record<string, number>;
    recentOperations: OperationRecord[];
    }
}

interface DirectorySizeInfo { totalFiles: number,
    totalSize: number,
    formattedSize: string,
    files: FileInfo[];
    }
}

/**
 * TestFileOperations - ファイルシステム操作・バックアップ・復元コンポーネント
 */
export class TestFileOperations extends BaseComponent { private testsDir: string
    private projectRoot: string;
    private backupEnabled: boolean;
    private dryRun: boolean;
    private testFilePatterns: Record<string, string>;
    private operationHistory: OperationRecord[];
    private fileOperations!: FileOperations;'
'';
    constructor(mainController: MainController') {'
        '';
        super(mainController, 'TestFileOperations');
        this.testsDir = mainController.testsDir;
        this.projectRoot = mainController.projectRoot;
        this.backupEnabled = mainController.backupEnabled;
        this.dryRun = mainController.dryRun;
        this.testFilePatterns = mainController.testFilePatterns;
    }
    }
        this.operationHistory = []; }
    }

    async _doInitialize(): Promise<void> { this.setupFileOperations();
        this.ensureDirectoryStructure(); }
    }

    /**
     * ファイル操作設定を初期化
     */
    private setupFileOperations(): void { this.fileOperations = {
            read: this.readFile.bind(this),
            write: this.writeFile.bind(this),
            backup: this.createBackup.bind(this),
            restore: this.restoreBackup.bind(this),
            delete: this.deleteFile.bind(this); }
        };
    }

    /**
     * ディレクトリ構造を確保'
     */''
    private ensureDirectoryStructure('')';
                path.join(this.testsDir, 'unit''),'';
                path.join(this.testsDir, 'integration''),'';
                path.join(this.testsDir, 'backups');
            ];

            for(const dir of requiredDirs) {

                if(!fs.existsSync(dir) {
                    if (!this.dryRun) {

            }
                        fs.mkdirSync(dir, { recursive: true ), }
                        console.log(`[TestFileOperations] ディレクトリ作成: ${dir)`});
                    } else {  }
                        console.log(`[DRY RUN] Would create directory: ${dir)`});
                    }'
                }''
            } catch (error') { ''
            this._handleError('directory structure setup', error); }
        }
    }

    /**
     * ファイルを読み込み
     * @param filePath - ファイルパス
     * @param options - オプション
     * @returns ファイル内容
     */
    readFile(filePath: string, options: FileOperationOptions = { ): string | null {
        try {
            if(!fs.existsSync(filePath) {
                
            }'
                if (!options.silent) {' }'
                    console.warn(`[TestFileOperations] File not found: ${filePath)`'});
                }
                return null;
            }'
'';
            const content = fs.readFileSync(filePath, options.encoding || 'utf8'');'
            '';
            this.recordOperation('read', { filePath,)
                size: content.length),
                timestamp: Date.now(); }
            });

            return content;'
'';
        } catch (error') { ''
            this._handleError('file read', error);
            return null; }
        }
    }

    /**
     * ファイルを書き込み
     * @param filePath - ファイルパス
     * @param content - ファイル内容
     * @param options - オプション
     * @returns 成功フラグ
     */
    writeFile(filePath: string, content: string, options: FileOperationOptions = { ): boolean {
        try {
            // ドライランモードの場合
            if (this.dryRun) { }
                console.log(`[DRY RUN] Would write to: ${filePath} (${content.length) characters)`});
                return true;
            }

            // ディレクトリが存在しない場合は作成
            const dir = path.dirname(filePath);
            if(!fs.existsSync(dir) { fs.mkdirSync(dir, { recursive: true ); }
            }

            // バックアップ作成（既存ファイルがある場合）
            let backupPath: string | null = null,
            if(this.backupEnabled && fs.existsSync(filePath) {'
                ';
            }'
                backupPath = this.createBackup(filePath'); }
            }
';
            // ファイル書き込み''
            fs.writeFileSync(filePath, content, options.encoding || 'utf8'');'
'';
            this.recordOperation('write', { filePath)
                size: content.length,);
                backupPath);
                timestamp: Date.now(); }
            });

            console.log(`[TestFileOperations] ファイル書き込み: ${path.basename(filePath})}`);
            return true;'
'';
        } catch (error') { ''
            this._handleError('file write', error);
            return false; }
        }
    }

    /**
     * バックアップを作成
     * @param filePath - 元ファイルパス
     * @returns バックアップファイルパス
     */
    createBackup(filePath: string): string | null { try {
            if(!fs.existsSync(filePath) { }
                console.warn(`[TestFileOperations] Cannot backup non-existent file: ${filePath)`});
                return null;
            }'
'';
            const timestamp = new Date().toISOString(').replace(/[:.]/g, '-');
            const backupPath = `${filePath}.backup.${timestamp}`;

            if(this.dryRun) {

                

            }
                console.log(`[DRY RUN] Would create backup: ${backupPath)`});
                return backupPath;
            }'
'';
            fs.copyFileSync(filePath, backupPath');'
'';
            this.recordOperation('backup', { originalPath: filePath,)
                backupPath);
                timestamp: Date.now(); }
            });

            console.log(`[TestFileOperations] バックアップ作成: ${path.basename(backupPath})}`);
            return backupPath;'
'';
        } catch (error') { ''
            this._handleError('backup creation', error);
            return null; }
        }
    }

    /**
     * バックアップから復元
     * @param backupPath - バックアップファイルパス
     * @param targetPath - 復元先パス
     * @returns 成功フラグ
     */
    restoreBackup(backupPath: string, targetPath: string): boolean { try {
            if(!fs.existsSync(backupPath) { }
                console.warn(`[TestFileOperations] Backup file not found: ${backupPath)`});
                return false;
            }

            if(this.dryRun) {

                

            }
                console.log(`[DRY RUN] Would restore backup: ${backupPath} to ${targetPath)`});
                return true;
            }'
'';
            fs.copyFileSync(backupPath, targetPath');'
'';
            this.recordOperation('restore', { backupPath,)
                targetPath);
                timestamp: Date.now(); }
            });

            console.log(`[TestFileOperations] バックアップ復元: ${path.basename(targetPath})}`);
            return true;'
'';
        } catch (error') { ''
            this._handleError('backup restore', error);
            return false; }
        }
    }

    /**
     * ファイルを削除
     * @param filePath - ファイルパス
     * @param options - オプション
     * @returns 成功フラグ
     */
    deleteFile(filePath: string, options: FileOperationOptions = { ): boolean {
        try {
            if(!fs.existsSync(filePath) {
                
            }
                if (!options.silent) { }
                    console.warn(`[TestFileOperations] File not found for deletion: ${filePath)`});
                }
                return false;
            }

            if(this.dryRun) {

                

            }
                console.log(`[DRY RUN] Would delete: ${filePath)`});
                return true;
            }

            // バックアップ作成（強制削除でない場合）
            let backupPath: string | null = null,
            if (!options.force && this.backupEnabled) { backupPath = this.createBackup(filePath); }
            }'
'';
            fs.unlinkSync(filePath');'
'';
            this.recordOperation('delete', { filePath,)
                backupPath);
                timestamp: Date.now(); }
            });

            console.log(`[TestFileOperations] ファイル削除: ${path.basename(filePath})}`);
            return true;'
'';
        } catch (error') { ''
            this._handleError('file deletion', error);
            return false; }
        }
    }

    /**
     * テストファイルを更新
     * @param testType - テストタイプ
     * @param content - テストコード
     * @param options - オプション
     * @returns 更新結果
     */
    updateTestFile(testType: string, content: string, options: FileOperationOptions = { ): TestFileUpdateResult {
        try {
            const testFilename = this.testFilePatterns[testType];'
            if (!testFilename) {' }'
                throw new Error(`Unknown test type: ${testType)`'});
            }'
'';
            const testFilePath = path.join(this.testsDir, 'unit', testFilename);''
            const success = this.writeFile(testFilePath, content, options');

            return { success,
                testType,';
                testFilePath,'';
                linesGenerated: content.split('\n').length, };
                dryRun: this.dryRun }
            },

        } catch (error) { return { success: false,
                testType, };
                error: (error as Error).message }
            },
        }
    }

    /**
     * ディレクトリ内のファイル一覧を取得
     * @param dirPath - ディレクトリパス
     * @param options - オプション
     * @returns ファイル一覧
     */
    listFiles(dirPath: string, options: FileOperationOptions = { ): FileInfo[] {
        try {
            if(!fs.existsSync(dirPath) {
                
            }
                return []; }
            }

            const files = fs.readdirSync(dirPath);
            const fileList: FileInfo[] = [],

            for(const file of files) {

                const filePath = path.join(dirPath, file);
                const stat = fs.statSync(filePath);

                if(options.recursive && stat.isDirectory() {
                    const subFiles = this.listFiles(filePath, options);

            }
                    fileList.push(...subFiles); }
                } else if(stat.isFile() { const fileInfo: FileInfo = {
                        name: file,
                        path: filePath,
                        size: stat.size,
                        modified: stat.mtime,
                        extension: path.extname(file); }
                    };

                    // フィルター適用
                    if(options.filter) {
                        if(options.filter(fileInfo) {
                    }
                            fileList.push(fileInfo); }
                        }
                    } else { fileList.push(fileInfo); }
                    }
                }
            }

            return fileList;'
'';
        } catch (error') { ''
            this._handleError('file listing', error);
            return []; }
        }
    }

    /**
     * バックアップファイル一覧を取得
     * @returns バックアップファイル一覧'
     */''
    listBackups('')';
        const backupDir = path.join(this.testsDir, 'backups');'
        const backupFiles = this.listFiles(backupDir, { );''
            filter: (file') => file.name.includes('.backup.'); }
        });

        return backupFiles.map(file => ({ )'
            ...file);' }'
            originalFile: file.name.replace(/\.backup\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{ 3')Z$/, ''),
            backupDate: this.parseBackupDate(file.name); }
        });
    }

    /**
     * バックアップ日時を解析
     * @param filename - ファイル名
     * @returns バックアップ日時
     */
    private parseBackupDate(filename: string): Date | null {'
        const match = filename.match(/\.backup\.(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{ 3)Z)$/);''
        if(match') {
            
        }'
            try {' }'
                return new Date(match[1].replace(/-/g, ':').replace(/T(\d{2)-(\d{2})-(\d{2}')/, 'T$1: $2:$3')),
            } catch (error) {
                console.warn(`[TestFileOperations] Invalid backup date format: ${match[1]}`);
            }
        }
        return null;
    }

    /**
     * 古いバックアップを削除
     * @param maxAge - 最大保持期間（ミリ秒）
     * @returns 削除されたファイル数
     */
    cleanupOldBackups(maxAge: number = 7 * 24 * 60 * 60 * 1000): number { // デフォルト7日
        try {
            const backups = this.listBackups();
            const cutoffDate = new Date(Date.now() - maxAge);
            let deletedCount = 0;

            for(const backup of backups) {

                if (backup.backupDate && backup.backupDate < cutoffDate) {
                    if(this.deleteFile(backup.path, { silent: true, force: true )) {

            }
                        deletedCount++; }
                    }
                }
            }

            console.log(`[TestFileOperations] 古いバックアップを削除: ${deletedCount)件`});
            return deletedCount;'
'';
        } catch (error') { ''
            this._handleError('backup cleanup', error);
            return 0; }
        }
    }

    /**
     * 操作を記録
     * @param operation - 操作種別
     * @param details - 詳細情報
     */
    private recordOperation(operation: string, details: OperationDetails): void { this.operationHistory.push({)
            operation,);
            details);
            timestamp: Date.now(); }
        });

        // 履歴サイズを制限（最大1000件）
        if (this.operationHistory.length > 1000) { this.operationHistory = this.operationHistory.slice(-1000); }
        }
    }

    /**
     * ファイル操作統計を取得
     * @returns 操作統計
     */
    getOperationStatistics(): OperationStatistics { const stats: OperationStatistics = {
            totalOperations: this.operationHistory.length }
            operationCounts: {},
            recentOperations: this.operationHistory.slice(-10),
        };

        // 操作種別ごとのカウント
        for (const record of this.operationHistory) { stats.operationCounts[record.operation] = (stats.operationCounts[record.operation] || 0) + 1; }
        }

        return stats;
    }

    /**
     * ファイルサイズを人間可読形式に変換
     * @param bytes - バイト数
     * @returns 人間可読なサイズ
     */'
    formatFileSize(bytes: number): string { ''
        if (bytes === 0') return '0 Bytes';
        ';
        const k = 1024;''
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k);'
        '';
        return parseFloat((bytes / Math.pow(k, i).toFixed(2)') + ' ' + sizes[i]; }
    }

    /**
     * ディレクトリサイズを計算
     * @param dirPath - ディレクトリパス
     * @returns サイズ情報
     */
    calculateDirectorySize(dirPath: string): DirectorySizeInfo { try {
            const files = this.listFiles(dirPath, { recursive: true ),
            const totalSize = files.reduce((sum, file) => sum + file.size, 0);
            
            return { totalFiles: files.length,
                totalSize,
                formattedSize: this.formatFileSize(totalSize), };
                files }
            };'
'';
        } catch (error') { ''
            this._handleError('directory size calculation', error');
            return { totalFiles: 0,'
                totalSize: 0,'';
                formattedSize: '0 Bytes', };
                files: [] }
            },
        }
    }

    /**
     * クリーンアップ
     */'
    cleanup(): void { this.operationHistory = [];''
        super.cleanup(') }