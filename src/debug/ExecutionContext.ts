/**
 * Execution Context
 * コマンド実行時のコンテキスト情報を管理
 */

interface GameEngine {
    currentScene?: Scene;
    playerData?: PlayerData;
}

interface Scene {
    bubbleManager?: BubbleManager;
    scoreManager?: ScoreManager;
}

interface BubbleManager {
    // Bubble manager interface
    getBubbleCount?(): number;
    clearBubbles?(): void;
}

interface ScoreManager {
    // Score manager interface
    getScore?(): number;
    setScore?(score: number): void;
}

interface PlayerData {
    // Player data interface
    name?: string;
    level?: number;
    points?: number;
}

interface HistoryAction {
    action: 'setVariable' | 'deleteVariable' | 'clearVariables' | 'setPermissions' | 'executeJS';
    timestamp: number;
    name?: string;
    oldValue?: any;
    newValue?: any;
    count?: number;
    oldPermissions?: string;
    newPermissions?: string;
    code?: string;
    success?: boolean;
    error?: string;
}

interface ContextInfo {
    startTime: number;
    uptime: number;
    permissions: string;
    variableCount: number;
    historyCount: number;
    hasGameEngine: boolean;
    hasCurrentScene: boolean;
    hasBubbleManager: boolean;
    hasScoreManager: boolean;
    hasPlayerData: boolean;
}

interface SafeContext {
    game?: GameEngine;
    scene?: Scene | null;
    bubbleManager?: BubbleManager | null;
    scoreManager?: ScoreManager | null;
    playerData?: PlayerData | null;
    vars: Record<string, any>;
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
    Math: typeof Math;
    Date: typeof Date;
    JSON: typeof JSON;
}

type PermissionLevel = 'read-only' | 'read-write' | 'admin';

export class ExecutionContext {
    private gameEngine: GameEngine | null;
    private variables: Map<string, any>;
    private history: HistoryAction[];
    private permissions: PermissionLevel;
    private startTime: number;
    private maxHistorySize: number;

    constructor(gameEngine: GameEngine | null = null) {
        this.gameEngine = gameEngine;
        this.variables = new Map<string, any>();
        this.history = [];
        this.permissions = 'read-only';
        this.startTime = Date.now();
        this.maxHistorySize = 1000;
    }

    /**
     * 変数を設定
     */
    setVariable(name: string, value: any): boolean {
        if (this.permissions === 'read-only') {
            console.warn('Cannot set variable in read-only mode');
            return false;
        }

        const oldValue = this.variables.get(name);
        this.variables.set(name, value);

        this.addToHistory({
            action: 'setVariable',
            timestamp: Date.now(),
            name,
            oldValue,
            newValue: value
        });

        console.log(`Variable set: ${name} = ${value}`);
        return true;
    }

    /**
     * 変数を取得
     */
    getVariable(name: string): any {
        return this.variables.get(name);
    }

    /**
     * 変数を削除
     */
    deleteVariable(name: string): boolean {
        if (this.permissions === 'read-only') {
            console.warn('Cannot delete variable in read-only mode');
            return false;
        }

        if (!this.variables.has(name)) {
            console.warn(`Variable not found: ${name}`);
            return false;
        }

        const oldValue = this.variables.get(name);
        this.variables.delete(name);

        this.addToHistory({
            action: 'deleteVariable',
            timestamp: Date.now(),
            name,
            oldValue
        });

        console.log(`Variable deleted: ${name}`);
        return true;
    }

    /**
     * 全変数をクリア
     */
    clearVariables(): boolean {
        if (this.permissions === 'read-only') {
            console.warn('Cannot clear variables in read-only mode');
            return false;
        }

        const count = this.variables.size;
        this.variables.clear();

        this.addToHistory({
            action: 'clearVariables',
            timestamp: Date.now(),
            count
        });

        console.log(`All variables cleared (${count} variables)`);
        return true;
    }

    /**
     * 全変数を取得
     */
    getAllVariables(): Record<string, any> {
        return Object.fromEntries(this.variables);
    }

    /**
     * 権限レベルを設定
     */
    setPermissions(level: PermissionLevel): boolean {
        if (this.permissions !== 'admin' && level === 'admin') {
            console.warn('Cannot escalate to admin permissions');
            return false;
        }

        const oldPermissions = this.permissions;
        this.permissions = level;

        this.addToHistory({
            action: 'setPermissions',
            timestamp: Date.now(),
            oldPermissions,
            newPermissions: level
        });

        console.log(`Permissions changed: ${oldPermissions} -> ${level}`);
        return true;
    }

    /**
     * 権限レベルを取得
     */
    getPermissions(): PermissionLevel {
        return this.permissions;
    }

    /**
     * 安全なコンテキストを作成
     */
    createSafeContext(): SafeContext {
        const context: SafeContext = {
            vars: this.getAllVariables(),
            log: console.log.bind(console),
            info: console.info.bind(console),
            warn: console.warn.bind(console),
            error: console.error.bind(console),
            Math: Math,
            Date: Date,
            JSON: JSON
        };

        // ゲームエンジンの安全な参照を追加
        if (this.gameEngine) {
            context.game = this.gameEngine;
            
            if (this.gameEngine.currentScene) {
                context.scene = this.gameEngine.currentScene;
                
                if (this.gameEngine.currentScene.bubbleManager) {
                    context.bubbleManager = this.gameEngine.currentScene.bubbleManager;
                }
                
                if (this.gameEngine.currentScene.scoreManager) {
                    context.scoreManager = this.gameEngine.currentScene.scoreManager;
                }
            }
            
            if (this.gameEngine.playerData) {
                context.playerData = this.gameEngine.playerData;
            }
        }

        return context;
    }

    /**
     * JavaScriptコードを実行
     */
    executeJS(code: string): { success: boolean; result?: any; error?: string } {
        if (this.permissions === 'read-only') {
            const error = 'Cannot execute JavaScript in read-only mode';
            console.warn(error);
            return { success: false, error };
        }

        try {
            const context = this.createSafeContext();
            const func = new Function(...Object.keys(context), `return ${code}`);
            const result = func(...Object.values(context));

            this.addToHistory({
                action: 'executeJS',
                timestamp: Date.now(),
                code,
                success: true
            });

            console.log('JavaScript executed successfully:', result);
            return { success: true, result };

        } catch (error) {
            const errorMessage = (error as Error).message;
            
            this.addToHistory({
                action: 'executeJS',
                timestamp: Date.now(),
                code,
                success: false,
                error: errorMessage
            });

            console.error('JavaScript execution failed:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    /**
     * コンテキスト情報を取得
     */
    getInfo(): ContextInfo {
        return {
            startTime: this.startTime,
            uptime: Date.now() - this.startTime,
            permissions: this.permissions,
            variableCount: this.variables.size,
            historyCount: this.history.length,
            hasGameEngine: !!this.gameEngine,
            hasCurrentScene: !!(this.gameEngine?.currentScene),
            hasBubbleManager: !!(this.gameEngine?.currentScene?.bubbleManager),
            hasScoreManager: !!(this.gameEngine?.currentScene?.scoreManager),
            hasPlayerData: !!(this.gameEngine?.playerData)
        };
    }

    /**
     * 履歴を取得
     */
    getHistory(): HistoryAction[] {
        return [...this.history];
    }

    /**
     * 履歴をクリア
     */
    clearHistory(): void {
        this.history = [];
        console.log('Execution history cleared');
    }

    /**
     * 履歴に追加
     */
    private addToHistory(action: HistoryAction): void {
        this.history.push(action);

        // 履歴サイズ制限
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * コンテキストをリセット
     */
    reset(): void {
        this.variables.clear();
        this.history = [];
        this.permissions = 'read-only';
        this.startTime = Date.now();
        console.log('Execution context reset');
    }

    /**
     * ゲームエンジンを設定
     */
    setGameEngine(gameEngine: GameEngine | null): void {
        this.gameEngine = gameEngine;
        console.log('Game engine reference updated');
    }

    /**
     * 統計情報を取得
     */
    getStatistics(): Record<string, number> {
        const actionCounts: Record<string, number> = {};
        
        for (const action of this.history) {
            actionCounts[action.action] = (actionCounts[action.action] || 0) + 1;
        }

        return {
            totalActions: this.history.length,
            variableCount: this.variables.size,
            uptime: Date.now() - this.startTime,
            ...actionCounts
        };
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        this.variables.clear();
        this.history = [];
        this.gameEngine = null;
        console.log('ExecutionContext destroyed');
    }
}

export default ExecutionContext;