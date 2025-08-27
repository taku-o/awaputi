/**
 * Execution Context
 * コマンド実行時のコンテキスト情報を管理
 */

export class ExecutionContext {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.variables = new Map();
        this.history = [];
        this.startTime = Date.now();
        this.permissions = 'user'; // 'user', 'admin', 'system'
        
        // ゲームエンジンへの便利なアクセス
        this.game = gameEngine;
        this.scene = null;
        this.bubbleManager = null;
        this.scoreManager = null;
        this.playerData = null;
        
        this.updateContextReferences();
    }

    /**
     * コンテキスト参照を更新
     */
    updateContextReferences() {
        if (this.gameEngine) {
            this.scene = this.gameEngine.currentScene;
            this.playerData = this.gameEngine.playerData;
            
            if (this.scene) {
                this.bubbleManager = this.scene.bubbleManager;
                this.scoreManager = this.scene.scoreManager;
            }
        }
    }

    /**
     * 変数を設定
     */
    setVariable(name, value) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('Variable name must be a non-empty string');
        }
        
        const normalizedName = name.trim();
        const oldValue = this.variables.get(normalizedName);
        
        this.variables.set(normalizedName, value);
        
        // 履歴に記録
        this.history.push({
            action: 'setVariable',
            name: normalizedName,
            oldValue,
            newValue: value,
            timestamp: Date.now()
        });
        
        return oldValue;
    }

    /**
     * 変数を取得
     */
    getVariable(name) {
        if (typeof name !== 'string') {
            return undefined;
        }
        
        const normalizedName = name.trim();
        return this.variables.get(normalizedName);
    }

    /**
     * 変数を削除
     */
    deleteVariable(name) {
        if (typeof name !== 'string') {
            return false;
        }
        
        const normalizedName = name.trim();
        const oldValue = this.variables.get(normalizedName);
        const deleted = this.variables.delete(normalizedName);
        
        if (deleted) {
            this.history.push({
                action: 'deleteVariable',
                name: normalizedName,
                oldValue,
                timestamp: Date.now()
            });
        }
        
        return deleted;
    }

    /**
     * 全変数を取得
     */
    getAllVariables() {
        const result = {};
        for (const [name, value] of this.variables) {
            result[name] = value;
        }
        return result;
    }

    /**
     * 変数をクリア
     */
    clearVariables() {
        const count = this.variables.size;
        this.variables.clear();
        
        this.history.push({
            action: 'clearVariables',
            count,
            timestamp: Date.now()
        });
        
        return count;
    }

    /**
     * 権限を設定
     */
    setPermissions(permissions) {
        const validPermissions = ['user', 'admin', 'system'];
        if (!validPermissions.includes(permissions)) {
            throw new Error(`Invalid permissions: ${permissions}. Must be one of: ${validPermissions.join(', ')}`);
        }
        
        const oldPermissions = this.permissions;
        this.permissions = permissions;
        
        this.history.push({
            action: 'setPermissions',
            oldPermissions,
            newPermissions: permissions,
            timestamp: Date.now()
        });
        
        return oldPermissions;
    }

    /**
     * 権限をチェック
     */
    hasPermission(requiredPermission) {
        const permissionLevels = {
            'user': 0,
            'admin': 1,
            'system': 2
        };
        
        const currentLevel = permissionLevels[this.permissions] || 0;
        const requiredLevel = permissionLevels[requiredPermission] || 0;
        
        return currentLevel >= requiredLevel;
    }

    /**
     * JavaScript コードを安全に実行
     */
    executeJS(code) {
        if (!this.hasPermission('admin')) {
            throw new Error('JavaScript execution requires admin permissions');
        }
        
        if (typeof code !== 'string') {
            throw new Error('Code must be a string');
        }
        
        try {
            // 安全な実行環境を作成
            const safeContext = {
                // ゲームエンジンへのアクセス
                game: this.gameEngine,
                scene: this.scene,
                bubbleManager: this.bubbleManager,
                scoreManager: this.scoreManager,
                playerData: this.playerData,
                
                // コンテキスト変数へのアクセス
                vars: this.getAllVariables(),
                
                // ユーティリティ関数
                log: console.log.bind(console),
                info: console.info.bind(console),
                warn: console.warn.bind(console),
                error: console.error.bind(console),
                
                // 数学関数
                Math,
                Date,
                JSON,
                
                // 禁止された危険なオブジェクトは除外
                // window, document, eval, Function 等はアクセス不可
            };
            
            // 関数として実行
            const func = new Function(...Object.keys(safeContext), `"use strict"; return (${code});`);
            const result = func(...Object.values(safeContext));
            
            this.history.push({
                action: 'executeJS',
                code: code.length > 100 ? code.substring(0, 100) + '...' : code,
                success: true,
                timestamp: Date.now()
            });
            
            return result;
            
        } catch (error) {
            this.history.push({
                action: 'executeJS',
                code: code.length > 100 ? code.substring(0, 100) + '...' : code,
                success: false,
                error: error.message,
                timestamp: Date.now()
            });
            
            throw error;
        }
    }

    /**
     * コンテキスト情報を取得
     */
    getInfo() {
        return {
            startTime: this.startTime,
            uptime: Date.now() - this.startTime,
            permissions: this.permissions,
            variableCount: this.variables.size,
            historyCount: this.history.length,
            hasGameEngine: !!this.gameEngine,
            hasCurrentScene: !!this.scene,
            hasBubbleManager: !!this.bubbleManager,
            hasScoreManager: !!this.scoreManager,
            hasPlayerData: !!this.playerData
        };
    }

    /**
     * 履歴を取得
     */
    getHistory(limit = 50) {
        const startIndex = Math.max(0, this.history.length - limit);
        return this.history.slice(startIndex);
    }

    /**
     * 履歴をクリア
     */
    clearHistory() {
        const count = this.history.length;
        this.history = [];
        return count;
    }

    /**
     * コンテキストをリセット
     */
    reset() {
        this.clearVariables();
        this.clearHistory();
        this.permissions = 'user';
        this.startTime = Date.now();
        this.updateContextReferences();
    }

    /**
     * リソースの解放
     */
    destroy() {
        this.clearVariables();
        this.clearHistory();
        this.gameEngine = null;
        this.scene = null;
        this.bubbleManager = null;
        this.scoreManager = null;
        this.playerData = null;
    }
}