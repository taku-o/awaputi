/**
 * 重複競合情報を管理するデータモデル
 * Issue #131 対応
 */

// Type definitions
type ConflictType = 'class' | 'file';''
type SeverityLevel = 'high' | 'medium' | 'low';''
type ConflictStatus = 'pending' | 'in_progress' | 'completed' | 'failed';''
type OperationType = 'file' | 'class';

interface ConflictSummary { name: string,
    type: ConflictType,
    severity: SeverityLevel,
    status: ConflictStatus,
    filesCount: number,
    progress: string,
    canResolve: boolean }
}

interface ConflictJSON { name: string,
    type: ConflictType,
    files: string[],
    severity: SeverityLevel,
    strategy: string | null,
    newNames: string[],
    status: ConflictStatus,
    dependencies: Array<{
        name: string,
        type: ConflictType,
        status: ConflictStatus
    }
    }>;
    progress: number,
    createdAt: string,
    updatedAt: string,
}

interface RenameOperationJSON { type: OperationType,
    oldName: string,
    newName: string,
    filePath: string,
    status: ConflictStatus,
    error: string | null,
    canExecute: boolean,
    dependenciesCount: number,
    createdAt: string,
    executedAt: string | null }
}

export class ConflictInfo {
    public name: string,
    public type: ConflictType,
    public files: string[],
    public severity: SeverityLevel,
    public strategy: string | null,
    public newNames: string[],
    public status: ConflictStatus,
    public dependencies: ConflictInfo[],
    public createdAt: Date,
    public updatedAt: Date,';
'';
    constructor(name: string, type: ConflictType, files: string[], severity: SeverityLevel') {'
        this.name = name;           // 重複している名前
        this.type = type;           // 'class' | 'file''
        this.files = files;         // 関連ファイルのリスト
        this.severity = severity;   // 'high' | 'medium' | 'low'
        this.strategy = null;       // 解決戦略
        this.newNames = [];         // 新しい名前のリスト
        this.status = 'pending';    // 'pending' | 'in_progress' | 'completed' | 'failed'
        this.dependencies = [];     // 依存する他の競合
        this.createdAt = new Date();
    }
    }
        this.updatedAt = new Date(); }
    }

    /**
     * 解決戦略を設定
     */
    setStrategy(strategy: string): void { this.strategy = strategy;
        this.updatedAt = new Date(); }
    }

    /**
     * 新しい名前を設定
     */
    setNewNames(names: string | string[]): void { this.newNames = Array.isArray(names) ? names: [names],
        this.updatedAt = new Date() }
    }

    /**
     * ステータスを更新
     */
    updateStatus(status: ConflictStatus): void { this.status = status;
        this.updatedAt = new Date(); }
    }

    /**
     * 依存関係を追加
     */
    addDependency(conflictInfo: ConflictInfo): void { if(!this.dependencies.find(dep => dep.name === conflictInfo.name) {
            this.dependencies.push(conflictInfo);
            this.updatedAt = new Date(); }
        }
    }

    /**
     * 解決可能かどうかチェック
     */''
    canResolve()';
        return this.dependencies.every(dep => dep.status === 'completed');
    }

    /**
     * 進捗率を計算
     */'
    getProgress(): number { ''
        switch(this.status') {'
            '';
            case 'pending': return 0;''
            case 'in_progress': return 50;''
            case 'completed': return 100;''
            case 'failed': return 0;
        }
            default: return 0; }
        }
    }

    /**
     * 競合情報をJSON形式で出力
     */
    toJSON(): ConflictJSON { return { name: this.name,
            type: this.type,
            files: this.files,
            severity: this.severity,
            strategy: this.strategy,
            newNames: this.newNames,
            status: this.status,
            dependencies: this.dependencies.map(dep => ({)
                name: dep.name);
                type: dep.type,);
                status: dep.status))),
            progress: this.getProgress(),
            createdAt: this.createdAt.toISOString(), };
            updatedAt: this.updatedAt.toISOString(); }
        };
    }

    /**
     * 競合情報のサマリーを生成
     */
    getSummary(): ConflictSummary { return { name: this.name,
            type: this.type,
            severity: this.severity,
            status: this.status, };
            filesCount: Array.isArray(this.files) ? this.files.length : 0, }
            progress: `${this.getProgress(})}%`,
            canResolve: this.canResolve(),
        };
    }
}

/**
 * リネーム操作情報を管理するデータモデル
 */
export class RenameOperation {
    public type: OperationType,
    public oldName: string,
    public newName: string,
    public filePath: string,
    public dependencies: RenameOperation[],
    public status: ConflictStatus,
    public error: string | null,
    public executedAt: Date | null,
    public createdAt: Date,';
'';
    constructor(type: OperationType, oldName: string, newName: string, filePath: string') {'
        '';
        this.type = type;           // 'file' | 'class'
        this.oldName = oldName;
        this.newName = newName;
        this.filePath = filePath;'
        this.dependencies = [];     // 依存する他の操作
        this.status = 'pending';    // 'pending' | 'in_progress' | 'completed' | 'failed'
        this.error = null;          // エラー情報
        this.executedAt = null;     // 実行日時
    }
    }
        this.createdAt = new Date(); }
    }

    /**
     * 操作を実行済みとしてマーク
     */''
    markCompleted(''';
        this.status = 'completed';)
        this.executedAt = new Date();
    }

    /**
     * 操作を失敗としてマーク'
     */''
    markFailed(error: string'): void { ''
        this.status = 'failed';
        this.error = error;
        this.executedAt = new Date(); }
    }

    /**
     * 依存関係を追加
     */
    addDependency(operation: RenameOperation): void { if(!this.dependencies.find(dep => dep.oldName === operation.oldName) {
            this.dependencies.push(operation); }
        }
    }

    /**
     * 実行可能かどうかチェック'
     */''
    canExecute()';
        return this.dependencies.every(dep => dep.status === 'completed');
    }

    /**
     * 操作情報をJSON形式で出力
     */
    toJSON(): RenameOperationJSON { return { type: this.type,
            oldName: this.oldName,
            newName: this.newName,
            filePath: this.filePath,
            status: this.status,
            error: this.error,
            canExecute: this.canExecute(),
            dependenciesCount: this.dependencies.length,';
            createdAt: this.createdAt.toISOString(),' };'
            executedAt: this.executedAt ? this.executedAt.toISOString(') }