/**
 * 重複競合情報を管理するデータモデル
 * Issue #131 対応
 */

export class ConflictInfo {
    constructor(name, type, files, severity) {
        this.name = name;           // 重複している名前
        this.type = type;           // 'class' | 'file'
        this.files = files;         // 関連ファイルのリスト
        this.severity = severity;   // 'high' | 'medium' | 'low'
        this.strategy = null;       // 解決戦略
        this.newNames = [];         // 新しい名前のリスト
        this.status = 'pending';    // 'pending' | 'in_progress' | 'completed' | 'failed'
        this.dependencies = [];     // 依存する他の競合
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * 解決戦略を設定
     */
    setStrategy(strategy) {
        this.strategy = strategy;
        this.updatedAt = new Date();
    }

    /**
     * 新しい名前を設定
     */
    setNewNames(names) {
        this.newNames = Array.isArray(names) ? names : [names];
        this.updatedAt = new Date();
    }

    /**
     * ステータスを更新
     */
    updateStatus(status) {
        this.status = status;
        this.updatedAt = new Date();
    }

    /**
     * 依存関係を追加
     */
    addDependency(conflictInfo) {
        if (!this.dependencies.find(dep => dep.name === conflictInfo.name)) {
            this.dependencies.push(conflictInfo);
            this.updatedAt = new Date();
        }
    }

    /**
     * 解決可能かどうかチェック
     */
    canResolve() {
        return this.dependencies.every(dep => dep.status === 'completed');
    }

    /**
     * 進捗率を計算
     */
    getProgress() {
        switch (this.status) {
            case 'pending': return 0;
            case 'in_progress': return 50;
            case 'completed': return 100;
            case 'failed': return 0;
            default: return 0;
        }
    }

    /**
     * 競合情報をJSON形式で出力
     */
    toJSON() {
        return {
            name: this.name,
            type: this.type,
            files: this.files,
            severity: this.severity,
            strategy: this.strategy,
            newNames: this.newNames,
            status: this.status,
            dependencies: this.dependencies.map(dep => ({
                name: dep.name,
                type: dep.type,
                status: dep.status
            })),
            progress: this.getProgress(),
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }

    /**
     * 競合情報のサマリーを生成
     */
    getSummary() {
        return {
            name: this.name,
            type: this.type,
            severity: this.severity,
            status: this.status,
            filesCount: Array.isArray(this.files) ? this.files.length : 0,
            progress: `${this.getProgress()}%`,
            canResolve: this.canResolve()
        };
    }
}

/**
 * リネーム操作情報を管理するデータモデル
 */
export class RenameOperation {
    constructor(type, oldName, newName, filePath) {
        this.type = type;           // 'file' | 'class'
        this.oldName = oldName;
        this.newName = newName;
        this.filePath = filePath;
        this.dependencies = [];     // 依存する他の操作
        this.status = 'pending';    // 'pending' | 'in_progress' | 'completed' | 'failed'
        this.error = null;          // エラー情報
        this.executedAt = null;     // 実行日時
        this.createdAt = new Date();
    }

    /**
     * 操作を実行済みとしてマーク
     */
    markCompleted() {
        this.status = 'completed';
        this.executedAt = new Date();
    }

    /**
     * 操作を失敗としてマーク
     */
    markFailed(error) {
        this.status = 'failed';
        this.error = error;
        this.executedAt = new Date();
    }

    /**
     * 依存関係を追加
     */
    addDependency(operation) {
        if (!this.dependencies.find(dep => dep.oldName === operation.oldName)) {
            this.dependencies.push(operation);
        }
    }

    /**
     * 実行可能かどうかチェック
     */
    canExecute() {
        return this.dependencies.every(dep => dep.status === 'completed');
    }

    /**
     * 操作情報をJSON形式で出力
     */
    toJSON() {
        return {
            type: this.type,
            oldName: this.oldName,
            newName: this.newName,
            filePath: this.filePath,
            status: this.status,
            error: this.error,
            canExecute: this.canExecute(),
            dependenciesCount: this.dependencies.length,
            createdAt: this.createdAt.toISOString(),
            executedAt: this.executedAt ? this.executedAt.toISOString() : null
        };
    }
}