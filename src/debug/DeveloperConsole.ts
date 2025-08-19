/**
 * Developer Console
 * インタラクティブなコマンドライン環境でゲーム状態操作とデバッグを支援
 */

import { ConfigurationCommands } from './ConfigurationCommands.js';
import { EnhancedAutocompleteEngine } from './EnhancedAutocompleteEngine.js';
import { EnhancedHistoryManager } from './EnhancedHistoryManager.js';
import { TestDataGenerationCommands } from './TestDataGenerationCommands.js';
import { AutocompleteEngine } from './AutocompleteEngine.js';
import { ExecutionContext } from './ExecutionContext.js';

import type { GameEngine } from '../core/GameEngine';

interface CommandParameter {
    name: string;
    type: string;
    required: boolean;
    description: string;
}

interface CommandOptions {
    description?: string;
    usage?: string;
    group?: string;
    aliases?: string[];
    parameters?: CommandParameter[];
    examples?: string[];
    permissions?: string;
    hidden?: boolean;
}

interface CommandData {
    name: string;
    handler: CommandHandler;
    description: string;
    usage: string;
    group: string;
    aliases: string[];
    parameters: CommandParameter[];
    examples: string[];
    permissions: string;
    hidden: boolean;
}

interface ParsedCommand {
    name: string;
    args: string[];
    raw: string;
}

interface OutputLine {
    message: string;
    type: string;
    timestamp: string;
    id: number;
}

interface ExecutionMetadata {
    success: boolean;
    executionTime: number;
    errorMessage: string | null;
    resultType: string;
    commandName: string;
    args: string[];
}

interface HistoryEntry {
    command: string;
    timestamp: number;
    metadata: any;
}

interface AutocompleteSuggestion {
    suggestion: string;
    type: string;
    description?: string;
}

interface HistorySearchOptions {
    type?: string;
    limit?: number;
    includeMetadata?: boolean;
}

interface HistoryStatistics {
    totalCommands: number;
    sessionCommands: number;
    averageCommandLength: number;
    historySize: number;
    topCommands: [string, number][];
    errorCommands: Set<string>;
    currentSession?: {
        commands: any[];
        totalTime: number;
    };
}

interface ExportOptions {
    includeMetadata?: boolean;
}

interface ImportOptions {
    merge?: boolean;
}

type CommandHandler = (args: string[], context?: ExecutionContext, console?: DeveloperConsole) => any;

export class DeveloperConsole {
    private gameEngine: GameEngine;
    private commands: Map<string, CommandData>;
    private commandGroups: Map<string, Set<string>>;
    private aliases: Map<string, string>;
    private historyManager: EnhancedHistoryManager;
    private enhancedAutocomplete: EnhancedAutocompleteEngine;
    private autocomplete: AutocompleteEngine;
    private context: ExecutionContext;
    private outputBuffer: OutputLine[];
    private maxOutputLines: number;
    private configurationCommands: ConfigurationCommands;
    private testDataGenerationCommands: TestDataGenerationCommands;
    
    // 後方互換性のためのプロパティ
    public history: string[];
    public historyIndex: number;
    public maxHistorySize: number;
    public isOpen: boolean;
    public currentInput: string;
    public suggestions: AutocompleteSuggestion[];

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        
        // コマンド管理
        this.commands = new Map();
        this.commandGroups = new Map();
        this.aliases = new Map();
        
        // 拡張履歴管理
        this.historyManager = new EnhancedHistoryManager(this);
        
        // 後方互換性のため既存インターフェースも保持
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 100;
        
        // 拡張自動補完
        this.enhancedAutocomplete = new EnhancedAutocompleteEngine(this, gameEngine);
        
        // 後方互換性のため既存インターフェースも保持
        this.autocomplete = new AutocompleteEngine(this);
        
        // 実行コンテキスト
        this.context = new ExecutionContext(gameEngine);
        
        // 出力管理
        this.outputBuffer = [];
        this.maxOutputLines = 500;
        
        // 状態
        this.isOpen = false;
        this.currentInput = '';
        this.suggestions = [];
        
        // 拡張コマンド群
        this.configurationCommands = new ConfigurationCommands(gameEngine);
        this.testDataGenerationCommands = new TestDataGenerationCommands(gameEngine);
        
        this.initialize();
    }

    private initialize(): void {
        this.registerBuiltinCommands();
        this.registerExtensionCommands();
        this.loadHistory();
    }

    /**
     * コンソールの表示/非表示切り替え
     */
    toggle(): void {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

    show(): void {
        this.isOpen = true;
        // UIの表示処理は ConsolePanel で行う
    }

    hide(): void {
        this.isOpen = false;
        // UIの非表示処理は ConsolePanel で行う
    }

    /**
     * コマンドの登録
     */
    register(name: string, handler: CommandHandler, options: CommandOptions = {}): boolean {
        const commandData: CommandData = {
            name,
            handler,
            description: options.description || '',
            usage: options.usage || name,
            group: options.group || 'custom',
            aliases: options.aliases || [],
            parameters: options.parameters || [],
            examples: options.examples || [],
            permissions: options.permissions || 'user',
            hidden: options.hidden || false
        };

        // メインコマンドの登録
        this.commands.set(name, commandData);
        
        // エイリアスの登録
        for (const alias of commandData.aliases) {
            this.aliases.set(alias, name);
        }
        
        // グループへの追加
        this.addToGroup(commandData.group, name);
        
        return true;
    }

    /**
     * コマンドの実行
     */
    async execute(commandLine: string): Promise<void> {
        if (!commandLine.trim()) return;
        
        try {
            // 履歴に追加
            this.addToHistory(commandLine);
            
            // コマンドの解析
            const parsed = this.parseCommand(commandLine);
            
            // 出力にコマンドを表示
            this.output(`> ${commandLine}`, 'input');
            
            // コマンドの実行
            const result = await this.executeCommand(parsed);
            
            // 結果の出力
            if (result !== undefined) {
                this.output(result, 'result');
            }
            
        } catch (error) {
            this.output(`Error: ${(error as Error).message}`, 'error');
            console.error('Console command error:', error);
        }
    }

    /**
     * コマンドの解析
     */
    private parseCommand(commandLine: string): ParsedCommand {
        const parts = this.tokenize(commandLine);
        
        if (parts.length === 0) {
            throw new Error('Empty command');
        }
        
        const commandName = parts[0];
        const args = parts.slice(1);
        
        // エイリアスの解決
        const resolvedName = this.aliases.get(commandName) || commandName;
        
        return {
            name: resolvedName,
            args,
            raw: commandLine
        };
    }

    /**
     * コマンドラインのトークン化
     */
    private tokenize(commandLine: string): string[] {
        const tokens: string[] = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        
        for (let i = 0; i < commandLine.length; i++) {
            const char = commandLine[i];
            
            if (!inQuotes && (char === '"' || char === "'")) {
                inQuotes = true;
                quoteChar = char;
            } else if (inQuotes && char === quoteChar) {
                inQuotes = false;
                quoteChar = '';
            } else if (!inQuotes && char === ' ') {
                if (current.trim()) {
                    tokens.push(current.trim());
                    current = '';
                }
            } else {
                current += char;
            }
        }
        
        if (current.trim()) {
            tokens.push(current.trim());
        }
        
        return tokens;
    }

    /**
     * コマンドの実行
     */
    private async executeCommand(parsed: ParsedCommand): Promise<any> {
        const command = this.commands.get(parsed.name);
        
        if (!command) {
            throw new Error(`Unknown command: ${parsed.name}`);
        }
        
        // パラメータのバリデーション
        this.validateParameters(command, parsed.args);
        
        // 実行時間の測定開始
        const startTime = performance.now();
        let success = true;
        let errorMessage: string | null = null;
        let result: any = undefined;
        
        try {
            // ハンドラーの実行
            result = await command.handler(parsed.args, this.context, this);
            
            // 自動補完エンジンに学習させる
            this.enhancedAutocomplete.learnFromExecution(parsed.name, parsed.args, true);
            
        } catch (error) {
            success = false;
            errorMessage = (error as Error).message;
            
            // 自動補完エンジンに学習させる
            this.enhancedAutocomplete.learnFromExecution(parsed.name, parsed.args, false);
            
            throw error;
        } finally {
            // 実行時間の測定終了
            const executionTime = performance.now() - startTime;
            
            // 拡張履歴管理に実行情報を記録
            this.historyManager.addCommand(parsed.raw, {
                success,
                executionTime,
                errorMessage,
                resultType: typeof result,
                commandName: parsed.name,
                args: parsed.args
            });
        }
        
        return result;
    }

    /**
     * パラメータのバリデーション
     */
    private validateParameters(command: CommandData, args: string[]): void {
        const required = command.parameters.filter(p => p.required);
        
        if (args.length < required.length) {
            throw new Error(
                `Command '${command.name}' requires at least ${required.length} arguments. ` +
                `Usage: ${command.usage}`
            );
        }
        
        // 型チェック
        for (let i = 0; i < command.parameters.length && i < args.length; i++) {
            const param = command.parameters[i];
            const arg = args[i];
            
            if (param.type && !this.validateParameterType(arg, param.type)) {
                throw new Error(
                    `Parameter '${param.name}' must be of type ${param.type}, got: ${arg}`
                );
            }
        }
    }

    /**
     * パラメータ型のバリデーション
     */
    private validateParameterType(value: string, type: string): boolean {
        switch (type) {
            case 'number':
                return !isNaN(parseFloat(value));
            case 'boolean':
                return ['true', 'false', '1', '0', 'on', 'off'].includes(value.toLowerCase());
            case 'string':
                return true;
            default:
                return true;
        }
    }

    /**
     * 出力
     */
    output(message: string, type: string = 'info'): void {
        const timestamp = new Date().toISOString().substr(11, 8);
        const outputLine: OutputLine = {
            message,
            type,
            timestamp,
            id: Date.now() + Math.random()
        };
        
        this.outputBuffer.push(outputLine);
        
        // バッファサイズの制限
        if (this.outputBuffer.length > this.maxOutputLines) {
            this.outputBuffer.shift();
        }
        
        // UIへの通知
        this.notifyOutput(outputLine);
    }

    /**
     * 履歴への追加（後方互換性）
     */
    private addToHistory(command: string): void {
        // 既存の履歴配列も更新（後方互換性のため）
        if (this.history.length > 0 && this.history[this.history.length - 1] === command) {
            return;
        }
        
        this.history.push(command);
        
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
        
        this.historyIndex = this.history.length;
        this.saveHistory();
    }

    /**
     * 履歴のナビゲーション（拡張版使用）
     */
    navigateHistory(direction: string, filter: string | null = null): string {
        // 拡張履歴管理を使用
        const entry = this.historyManager.navigate(direction, filter);
        
        if (entry) {
            // 既存の履歴インデックスも更新（後方互換性）
            const simpleHistory = this.historyManager.history.map(e => e.command);
            this.historyIndex = simpleHistory.indexOf(entry.command);
            return entry.command;
        }
        
        // フォールバック: 既存の実装
        if (this.history.length === 0) return '';
        
        if (direction === 'up') {
            this.historyIndex = Math.max(0, this.historyIndex - 1);
        } else if (direction === 'down') {
            this.historyIndex = Math.min(this.history.length, this.historyIndex + 1);
        }
        
        return this.historyIndex < this.history.length 
            ? this.history[this.historyIndex] 
            : '';
    }

    /**
     * 自動補完の取得（拡張版使用）
     */
    getAutocompleteSuggestions(partial: string, cursorPosition: number | null = null): AutocompleteSuggestion[] {
        // 拡張自動補完エンジンを優先使用
        if (this.enhancedAutocomplete) {
            return this.enhancedAutocomplete.getSuggestions(partial, cursorPosition);
        }
        
        // フォールバック: 既存の実装
        return this.autocomplete.getSuggestions(partial);
    }

    /**
     * 履歴検索
     */
    searchHistory(query: string, options: HistorySearchOptions = {}): HistoryEntry[] {
        return this.historyManager.search(query, options);
    }

    /**
     * 履歴統計の取得
     */
    getHistoryStatistics(): HistoryStatistics {
        return this.historyManager.getStatistics();
    }

    /**
     * 履歴のエクスポート
     */
    exportHistory(format: string = 'json', options: ExportOptions = {}): string {
        return this.historyManager.exportHistory(format, options);
    }

    /**
     * 履歴のインポート
     */
    importHistory(data: string, format: string = 'json', options: ImportOptions = {}): any {
        return this.historyManager.importHistory(data, format, options);
    }

    /**
     * 自動補完設定の更新
     */
    updateAutocompleteSettings(settings: any): void {
        if (this.enhancedAutocomplete) {
            this.enhancedAutocomplete.updateSettings(settings);
        }
    }

    /**
     * グループへの追加
     */
    private addToGroup(group: string, commandName: string): void {
        if (!this.commandGroups.has(group)) {
            this.commandGroups.set(group, new Set());
        }
        this.commandGroups.get(group)!.add(commandName);
    }

    /**
     * 出力の通知
     */
    notifyOutput(outputLine: OutputLine): void {
        // ConsolePanel が実装
    }

    /**
     * 履歴の保存
     */
    private saveHistory(): void {
        try {
            localStorage.setItem('debug-console-history', JSON.stringify(this.history));
        } catch (error) {
            console.warn('Failed to save console history:', error);
        }
    }

    /**
     * 履歴の読み込み
     */
    private loadHistory(): void {
        try {
            const saved = localStorage.getItem('debug-console-history');
            if (saved) {
                this.history = JSON.parse(saved);
                this.historyIndex = this.history.length;
            }
        } catch (error) {
            console.warn('Failed to load console history:', error);
        }
    }

    /**
     * 組み込みコマンドの登録
     */
    private registerBuiltinCommands(): void {
        // ヘルプコマンド
        this.register('help', this.helpCommand.bind(this), {
            description: 'Show available commands or detailed help for a specific command',
            usage: 'help [command]',
            parameters: [
                { name: 'command', type: 'string', required: false, description: 'Specific command to get help for' }
            ],
            examples: ['help', 'help game.pause'],
            group: 'system'
        });

        // クリアコマンド
        this.register('clear', this.clearCommand.bind(this), {
            description: 'Clear the console output',
            usage: 'clear',
            aliases: ['cls'],
            group: 'system'
        });

        // 履歴コマンド
        this.register('history', this.historyCommand.bind(this), {
            description: 'Show command history',
            usage: 'history [count]',
            parameters: [
                { name: 'count', type: 'number', required: false, description: 'Number of recent commands to show' }
            ],
            group: 'system'
        });

        // 履歴検索コマンド
        this.register('history.search', this.historySearchCommand.bind(this), {
            description: 'Search command history',
            usage: 'history.search <query> [options]',
            parameters: [
                { name: 'query', type: 'string', required: true, description: 'Search query' },
                { name: 'type', type: 'string', required: false, description: 'Search type: exact, contains, fuzzy, regex' },
                { name: 'limit', type: 'number', required: false, description: 'Maximum results to show' }
            ],
            examples: [
                'history.search config',
                'history.search "game.set" exact',
                'history.search "conf.*get" regex'
            ],
            group: 'system'
        });

        // 履歴統計コマンド
        this.register('history.stats', this.historyStatsCommand.bind(this), {
            description: 'Show command history statistics',
            usage: 'history.stats',
            group: 'system'
        });

        // 履歴エクスポートコマンド
        this.register('history.export', this.historyExportCommand.bind(this), {
            description: 'Export command history',
            usage: 'history.export [format]',
            parameters: [
                { name: 'format', type: 'string', required: false, description: 'Export format: json, csv, text' }
            ],
            examples: [
                'history.export',
                'history.export csv',
                'history.export text'
            ],
            group: 'system'
        });

        // エコーコマンド
        this.register('echo', this.echoCommand.bind(this), {
            description: 'Print text to console',
            usage: 'echo <text>',
            parameters: [
                { name: 'text', type: 'string', required: true, description: 'Text to print' }
            ],
            examples: ['echo "Hello World"'],
            group: 'system'
        });

        // 変数設定コマンド
        this.register('set', this.setCommand.bind(this), {
            description: 'Set a variable in the console context',
            usage: 'set <name> <value>',
            parameters: [
                { name: 'name', type: 'string', required: true, description: 'Variable name' },
                { name: 'value', type: 'string', required: true, description: 'Variable value' }
            ],
            examples: ['set testValue 123'],
            group: 'system'
        });

        // 変数取得コマンド
        this.register('get', this.getCommand.bind(this), {
            description: 'Get a variable from the console context',
            usage: 'get <name>',
            parameters: [
                { name: 'name', type: 'string', required: true, description: 'Variable name' }
            ],
            examples: ['get testValue'],
            group: 'system'
        });

        // JavaScriptコマンド
        this.register('js', this.jsCommand.bind(this), {
            description: 'Execute JavaScript code',
            usage: 'js <code>',
            parameters: [
                { name: 'code', type: 'string', required: true, description: 'JavaScript code to execute' }
            ],
            examples: ['js console.log("Hello from console")'],
            group: 'system'
        });

        // コマンド一覧
        this.register('commands', this.commandsCommand.bind(this), {
            description: 'List all available commands',
            usage: 'commands [group]',
            parameters: [
                { name: 'group', type: 'string', required: false, description: 'Filter by command group' }
            ],
            examples: ['commands', 'commands game'],
            group: 'system'
        });
    }

    /**
     * 拡張コマンドの登録
     */
    private registerExtensionCommands(): void {
        // 設定管理コマンドの登録
        this.configurationCommands.registerCommands(this);
        
        // テストデータ生成コマンドの登録
        this.testDataGenerationCommands.registerCommands(this);
    }

    // 組み込みコマンドの実装
    private helpCommand(args: string[]): string {
        if (args.length === 0) {
            const groups = Array.from(this.commandGroups.keys()).sort();
            let output = 'Available command groups:\n';
            
            for (const group of groups) {
                const commands = Array.from(this.commandGroups.get(group)!);
                output += `  ${group}: ${commands.length} commands\n`;
            }
            
            output += '\nUse "help <command>" for detailed information.\n';
            output += 'Use "commands [group]" to list commands in a group.';
            
            return output;
        } else {
            const commandName = args[0];
            const command = this.commands.get(commandName);
            
            if (!command) {
                return `Command '${commandName}' not found.`;
            }
            
            let output = `Command: ${command.name}\n`;
            output += `Description: ${command.description}\n`;
            output += `Usage: ${command.usage}\n`;
            
            if (command.aliases.length > 0) {
                output += `Aliases: ${command.aliases.join(', ')}\n`;
            }
            
            if (command.parameters.length > 0) {
                output += 'Parameters:\n';
                for (const param of command.parameters) {
                    const req = param.required ? '[required]' : '[optional]';
                    output += `  ${param.name} (${param.type || 'any'}) ${req}: ${param.description}\n`;
                }
            }
            
            if (command.examples.length > 0) {
                output += 'Examples:\n';
                for (const example of command.examples) {
                    output += `  ${example}\n`;
                }
            }
            
            return output;
        }
    }

    private clearCommand(): string {
        this.outputBuffer = [];
        return ''; // 何も出力しない
    }

    private historyCommand(args: string[]): string {
        const count = args.length > 0 ? parseInt(args[0]) : 10;
        
        // 拡張履歴管理からデータを取得
        const allHistory = this.historyManager.history;
        const recentHistory = allHistory.slice(-count);
        
        if (recentHistory.length === 0) {
            return 'No command history available.';
        }
        
        let output = `Recent commands (${recentHistory.length} of ${allHistory.length}):\n`;
        recentHistory.forEach((entry, index) => {
            const num = allHistory.length - count + index + 1;
            const time = new Date(entry.timestamp).toLocaleTimeString();
            const status = entry.metadata.success ? '✓' : '✗';
            const execTime = entry.metadata.executionTime ? ` (${entry.metadata.executionTime.toFixed(1)}ms)` : '';
            
            output += `  ${num}: [${time}] ${status} ${entry.command}${execTime}\n`;
        });
        
        return output;
    }

    private historySearchCommand(args: string[]): string {
        if (args.length === 0) {
            return 'Usage: history.search <query> [type] [limit]';
        }
        
        const query = args[0];
        const searchType = args[1] || 'fuzzy';
        const limit = args[2] ? parseInt(args[2]) : 20;
        
        const results = this.searchHistory(query, {
            type: searchType,
            limit: limit,
            includeMetadata: true
        });
        
        if (results.length === 0) {
            return `No commands found matching "${query}".`;
        }
        
        let output = `Search results for "${query}" (${results.length} found):\n`;
        results.forEach((entry, index) => {
            const time = new Date(entry.timestamp).toLocaleTimeString();
            const status = entry.metadata.success ? '✓' : '✗';
            const score = (entry as any).relevanceScore ? ` [${((entry as any).relevanceScore * 100).toFixed(0)}%]` : '';
            
            output += `  ${index + 1}: [${time}] ${status} ${entry.command}${score}\n`;
        });
        
        return output;
    }

    private historyStatsCommand(): string {
        const stats = this.getHistoryStatistics();
        
        let output = 'Command History Statistics:\n';
        output += `  Total Commands: ${stats.totalCommands}\n`;
        output += `  Session Commands: ${stats.sessionCommands}\n`;
        output += `  Average Command Length: ${stats.averageCommandLength.toFixed(1)} characters\n`;
        output += `  History Size: ${stats.historySize}\n`;
        
        if (stats.topCommands.length > 0) {
            output += '\n  Most Used Commands:\n';
            stats.topCommands.forEach(([cmd, count], index) => {
                output += `    ${index + 1}. ${cmd}: ${count} times\n`;
            });
        }
        
        if (stats.errorCommands.size > 0) {
            output += `\n  Commands with Errors: ${Array.from(stats.errorCommands).join(', ')}\n`;
        }
        
        if (stats.currentSession) {
            const sessionTime = Math.round(stats.currentSession.totalTime / 1000);
            output += `\n  Current Session: ${stats.currentSession.commands.length} commands in ${sessionTime}s\n`;
        }
        
        return output;
    }

    private historyExportCommand(args: string[]): string {
        const format = args[0] || 'json';
        
        try {
            const exported = this.exportHistory(format, {
                includeMetadata: true
            });
            
            // クリップボードにコピー（可能であれば）
            if (navigator.clipboard) {
                navigator.clipboard.writeText(exported).catch(() => {
                    // クリップボードエラーは無視
                });
            }
            
            const lines = exported.split('\n').length;
            return `History exported in ${format} format (${lines} lines).\n${format === 'json' ? 'Copied to clipboard if supported.' : ''}\n\n${exported.substring(0, 500)}${exported.length > 500 ? '...\n\n[Output truncated. Full data copied to clipboard.]' : ''}`;
        } catch (error) {
            return `Error exporting history: ${(error as Error).message}`;
        }
    }

    private echoCommand(args: string[]): string {
        return args.join(' ');
    }

    private setCommand(args: string[]): string {
        const [name, ...valueParts] = args;
        const value = valueParts.join(' ');
        
        this.context.setVariable(name, value);
        return `Set ${name} = ${value}`;
    }

    private getCommand(args: string[]): string {
        const name = args[0];
        const value = this.context.getVariable(name);
        
        if (value === undefined) {
            return `Variable '${name}' is not defined.`;
        }
        
        return `${name} = ${value}`;
    }

    private jsCommand(args: string[]): string {
        const code = args.join(' ');
        
        try {
            // コンテキストに gameEngine を追加
            const context = {
                gameEngine: this.gameEngine,
                console: this,
                ...this.context.variables
            };
            
            // セキュリティ上の理由でeval()の代わりにFunction()を使用
            const func = new Function(...Object.keys(context), `return ${code}`);
            const result = func(...Object.values(context));
            
            return result !== undefined ? String(result) : 'undefined';
        } catch (error) {
            return `JavaScript Error: ${(error as Error).message}`;
        }
    }

    private commandsCommand(args: string[]): string {
        const groupFilter = args.length > 0 ? args[0] : null;
        
        let commands: string[];
        if (groupFilter) {
            const groupCommands = this.commandGroups.get(groupFilter);
            if (!groupCommands) {
                return `Group '${groupFilter}' not found.`;
            }
            commands = Array.from(groupCommands);
        } else {
            commands = Array.from(this.commands.keys());
        }
        
        commands.sort();
        
        let output = groupFilter 
            ? `Commands in group '${groupFilter}':\n`
            : 'All available commands:\n';
        
        for (const cmdName of commands) {
            const cmd = this.commands.get(cmdName)!;
            if (!cmd.hidden) {
                output += `  ${cmdName} - ${cmd.description}\n`;
            }
        }
        
        return output;
    }

    // パブリックAPI
    getCommands(): string[] {
        return Array.from(this.commands.keys());
    }

    getCommandGroups(): string[] {
        return Array.from(this.commandGroups.keys());
    }

    getHistory(): string[] {
        return [...this.history];
    }

    getOutput(): OutputLine[] {
        return [...this.outputBuffer];
    }

    clearOutput(): void {
        this.outputBuffer = [];
    }

    destroy(): void {
        this.saveHistory();
        
        // 拡張機能のクリーンアップ
        if (this.configurationCommands) {
            this.configurationCommands.destroy();
        }
        
        if (this.enhancedAutocomplete) {
            this.enhancedAutocomplete.destroy();
        }
        
        if (this.historyManager) {
            this.historyManager.destroy();
        }
        
        this.commands.clear();
        this.commandGroups.clear();
        this.aliases.clear();
        this.history = [];
        this.outputBuffer = [];
    }
}