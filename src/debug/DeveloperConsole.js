/**
 * Developer Console
 * インタラクティブなコマンドライン環境でゲーム状態操作とデバッグを支援
 */

import { ConfigurationCommands } from './ConfigurationCommands.js';

export class DeveloperConsole {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // コマンド管理
        this.commands = new Map();
        this.commandGroups = new Map();
        this.aliases = new Map();
        
        // 履歴管理
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 100;
        
        // 自動補完
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
        
        this.initialize();
    }

    initialize() {
        this.registerBuiltinCommands();
        this.registerExtensionCommands();
        this.loadHistory();
    }

    /**
     * コンソールの表示/非表示切り替え
     */
    toggle() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        this.isOpen = true;
        // UIの表示処理は ConsolePanel で行う
    }

    hide() {
        this.isOpen = false;
        // UIの非表示処理は ConsolePanel で行う
    }

    /**
     * コマンドの登録
     */
    register(name, handler, options = {}) {
        const commandData = {
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
    async execute(commandLine) {
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
            this.output(`Error: ${error.message}`, 'error');
            console.error('Console command error:', error);
        }
    }

    /**
     * コマンドの解析
     */
    parseCommand(commandLine) {
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
    tokenize(commandLine) {
        const tokens = [];
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
    async executeCommand(parsed) {
        const command = this.commands.get(parsed.name);
        
        if (!command) {
            throw new Error(`Unknown command: ${parsed.name}`);
        }
        
        // パラメータのバリデーション
        this.validateParameters(command, parsed.args);
        
        // ハンドラーの実行
        return await command.handler(parsed.args, this.context, this);
    }

    /**
     * パラメータのバリデーション
     */
    validateParameters(command, args) {
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
    validateParameterType(value, type) {
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
    output(message, type = 'info') {
        const timestamp = new Date().toISOString().substr(11, 8);
        const outputLine = {
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
     * 履歴への追加
     */
    addToHistory(command) {
        // 重複する直前のコマンドは追加しない
        if (this.history.length > 0 && this.history[this.history.length - 1] === command) {
            return;
        }
        
        this.history.push(command);
        
        // 履歴サイズの制限
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
        
        this.historyIndex = this.history.length;
        this.saveHistory();
    }

    /**
     * 履歴のナビゲーション
     */
    navigateHistory(direction) {
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
     * 自動補完の取得
     */
    getAutocompleteSuggestions(partial) {
        return this.autocomplete.getSuggestions(partial);
    }

    /**
     * グループへの追加
     */
    addToGroup(group, commandName) {
        if (!this.commandGroups.has(group)) {
            this.commandGroups.set(group, new Set());
        }
        this.commandGroups.get(group).add(commandName);
    }

    /**
     * 出力の通知
     */
    notifyOutput(outputLine) {
        // ConsolePanel が実装
    }

    /**
     * 履歴の保存
     */
    saveHistory() {
        try {
            localStorage.setItem('debug-console-history', JSON.stringify(this.history));
        } catch (error) {
            console.warn('Failed to save console history:', error);
        }
    }

    /**
     * 履歴の読み込み
     */
    loadHistory() {
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
    registerBuiltinCommands() {
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
    registerExtensionCommands() {
        // 設定管理コマンドの登録
        this.configurationCommands.registerCommands(this);
    }

    // 組み込みコマンドの実装
    helpCommand(args) {
        if (args.length === 0) {
            const groups = Array.from(this.commandGroups.keys()).sort();
            let output = 'Available command groups:\n';
            
            for (const group of groups) {
                const commands = Array.from(this.commandGroups.get(group));
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

    clearCommand() {
        this.outputBuffer = [];
        return ''; // 何も出力しない
    }

    historyCommand(args) {
        const count = args.length > 0 ? parseInt(args[0]) : 10;
        const recentHistory = this.history.slice(-count);
        
        if (recentHistory.length === 0) {
            return 'No command history available.';
        }
        
        let output = 'Recent commands:\n';
        recentHistory.forEach((cmd, index) => {
            const num = this.history.length - count + index + 1;
            output += `  ${num}: ${cmd}\n`;
        });
        
        return output;
    }

    echoCommand(args) {
        return args.join(' ');
    }

    setCommand(args) {
        const [name, ...valueParts] = args;
        const value = valueParts.join(' ');
        
        this.context.setVariable(name, value);
        return `Set ${name} = ${value}`;
    }

    getCommand(args) {
        const name = args[0];
        const value = this.context.getVariable(name);
        
        if (value === undefined) {
            return `Variable '${name}' is not defined.`;
        }
        
        return `${name} = ${value}`;
    }

    jsCommand(args) {
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
            return `JavaScript Error: ${error.message}`;
        }
    }

    commandsCommand(args) {
        const groupFilter = args.length > 0 ? args[0] : null;
        
        let commands;
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
            const cmd = this.commands.get(cmdName);
            if (!cmd.hidden) {
                output += `  ${cmdName} - ${cmd.description}\n`;
            }
        }
        
        return output;
    }

    // パブリックAPI
    getCommands() {
        return Array.from(this.commands.keys());
    }

    getCommandGroups() {
        return Array.from(this.commandGroups.keys());
    }

    getHistory() {
        return [...this.history];
    }

    getOutput() {
        return [...this.outputBuffer];
    }

    clearOutput() {
        this.outputBuffer = [];
    }

    destroy() {
        this.saveHistory();
        
        // 拡張コマンドのクリーンアップ  
        if (this.configurationCommands) {
            this.configurationCommands.destroy();
        }
        
        this.commands.clear();
        this.commandGroups.clear();
        this.aliases.clear();
        this.history = [];
        this.outputBuffer = [];
    }
}

/**
 * 自動補完エンジン
 */
class AutocompleteEngine {
    constructor(console) {
        this.console = console;
    }

    getSuggestions(partial) {
        const suggestions = [];
        
        // コマンド名の補完
        for (const [command, data] of this.console.commands) {
            if (command.startsWith(partial) && !data.hidden) {
                suggestions.push({
                    text: command,
                    type: 'command',
                    description: data.description
                });
            }
        }
        
        // エイリアスの補完
        for (const [alias, command] of this.console.aliases) {
            if (alias.startsWith(partial)) {
                const data = this.console.commands.get(command);
                if (data && !data.hidden) {
                    suggestions.push({
                        text: alias,
                        type: 'alias',
                        description: `Alias for ${command}`
                    });
                }
            }
        }
        
        // 変数の補完
        for (const variable of this.console.context.getVariableNames()) {
            if (variable.startsWith(partial)) {
                suggestions.push({
                    text: variable,
                    type: 'variable',
                    description: 'Context variable'
                });
            }
        }
        
        return suggestions.sort((a, b) => a.text.localeCompare(b.text));
    }
}

/**
 * 実行コンテキスト
 */
class ExecutionContext {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.variables = new Map();
    }

    setVariable(name, value) {
        this.variables.set(name, value);
    }

    getVariable(name) {
        return this.variables.get(name);
    }

    getVariableNames() {
        return Array.from(this.variables.keys());
    }

    clearVariables() {
        this.variables.clear();
    }
}

// デフォルトエクスポート
export default DeveloperConsole;