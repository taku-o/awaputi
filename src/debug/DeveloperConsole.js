/**
 * Developer Console
 * 開発者向けコマンドライン インターフェース
 */

export class DeveloperConsole {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.element = null;
        this.inputElement = null;
        this.outputElement = null;
        this.commandRegistry = new CommandRegistry(this);
        this.errorHandler = null;
        
        // コンソール状態
        this.state = {
            visible: false,
            focused: false,
            history: [],
            historyIndex: -1,
            currentInput: '',
            maxHistorySize: 100
        };
        
        // 出力設定
        this.output = {
            lines: [],
            maxLines: 500,
            scrollToBottom: true,
            timestampFormat: 'HH:mm:ss'
        };
        
        // スタイル設定
        this.styles = {
            console: {
                position: 'fixed',
                bottom: '0',
                left: '0',
                width: '100%',
                height: '300px',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                border: '2px solid #333',
                borderBottom: 'none',
                fontFamily: 'Monaco, Consolas, monospace',
                fontSize: '12px',
                color: '#00ff00',
                zIndex: '10001',
                display: 'none'
            },
            output: {
                height: '250px',
                padding: '10px',
                overflowY: 'auto',
                borderBottom: '1px solid #333',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
            },
            input: {
                width: '100%',
                height: '40px',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#00ff00',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                padding: '10px',
                boxSizing: 'border-box'
            }
        };
        
        this.initialize();
    }

    initialize() {
        this.setupErrorHandler();
        this.createConsoleElement();
        this.setupEventListeners();
        this.registerDefaultCommands();
        this.setupKeyboardShortcuts();
        
        console.log('[DeveloperConsole] Developer console initialized');
    }

    /**
     * エラーハンドラ設定
     */
    setupErrorHandler() {
        try {
            const { getErrorHandler } = require('../utils/ErrorHandler.js');
            this.errorHandler = getErrorHandler();
        } catch (error) {
            console.warn('[DeveloperConsole] ErrorHandler not available:', error.message);
            this.errorHandler = {
                handleError: (error, context) => console.error(`[${context}]`, error)
            };
        }
    }

    /**
     * コンソール要素作成
     */
    createConsoleElement() {
        // メインコンテナ
        this.element = document.createElement('div');
        this.element.className = 'developer-console';
        this.applyStyles(this.element, this.styles.console);
        
        // 出力エリア
        this.outputElement = document.createElement('div');
        this.outputElement.className = 'console-output';
        this.applyStyles(this.outputElement, this.styles.output);
        
        // 入力エリア
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'text';
        this.inputElement.className = 'console-input';
        this.inputElement.placeholder = 'Type command or "help" for available commands...';
        this.applyStyles(this.inputElement, this.styles.input);
        
        // 組み立て
        this.element.appendChild(this.outputElement);
        this.element.appendChild(this.inputElement);
        document.body.appendChild(this.element);
        
        // 初期メッセージ
        this.printWelcomeMessage();
    }

    /**
     * スタイル適用
     */
    applyStyles(element, styles) {
        Object.assign(element.style, styles);
    }

    /**
     * イベントリスナー設定
     */
    setupEventListeners() {
        // 入力イベント
        this.inputElement.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        this.inputElement.addEventListener('input', (e) => {
            this.state.currentInput = e.target.value;
        });
        
        this.inputElement.addEventListener('focus', () => {
            this.state.focused = true;
        });
        
        this.inputElement.addEventListener('blur', () => {
            this.state.focused = false;
        });
        
        // アウトプットクリック（フォーカス復帰）
        this.outputElement.addEventListener('click', () => {
            if (this.state.visible) {
                this.inputElement.focus();
            }
        });
    }

    /**
     * キーボードショートカット設定
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // F12またはCtrl+Shift+C でコンソール切り替え
            if ((e.key === 'F12') || (e.ctrlKey && e.shiftKey && e.key === 'C')) {
                e.preventDefault();
                this.toggle();
            }
            
            // Escapeでコンソール非表示
            if (e.key === 'Escape' && this.state.visible) {
                e.preventDefault();
                this.hide();
            }
        });
    }

    /**
     * キーダウンハンドラ
     */
    handleKeyDown(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                this.executeCommand();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.navigateHistory(-1);
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                this.navigateHistory(1);
                break;
                
            case 'Tab':
                e.preventDefault();
                this.handleTabCompletion();
                break;
                
            case 'Escape':
                e.preventDefault();
                this.hide();
                break;
        }
    }

    /**
     * コマンド実行
     */
    executeCommand() {
        const input = this.inputElement.value.trim();
        if (!input) return;
        
        // 履歴に追加
        this.addToHistory(input);
        
        // コマンド表示
        this.print(`> ${input}`, 'command');
        
        // 入力クリア
        this.inputElement.value = '';
        this.state.currentInput = '';
        this.state.historyIndex = -1;
        
        try {
            // コマンド解析・実行
            const result = this.commandRegistry.execute(input);
            
            if (result !== undefined && result !== null) {
                this.print(result);
            }
        } catch (error) {
            this.printError(`Command error: ${error.message}`);
            this.errorHandler.handleError(error, 'DeveloperConsole.executeCommand');
        }
    }

    /**
     * 履歴ナビゲーション
     */
    navigateHistory(direction) {
        if (this.state.history.length === 0) return;
        
        if (direction === -1) { // 上 (古い方向)
            if (this.state.historyIndex === -1) {
                this.state.historyIndex = this.state.history.length - 1;
            } else if (this.state.historyIndex > 0) {
                this.state.historyIndex--;
            }
        } else { // 下 (新しい方向)
            if (this.state.historyIndex === -1) return;
            if (this.state.historyIndex < this.state.history.length - 1) {
                this.state.historyIndex++;
            } else {
                this.state.historyIndex = -1;
                this.inputElement.value = this.state.currentInput;
                return;
            }
        }
        
        this.inputElement.value = this.state.history[this.state.historyIndex];
    }

    /**
     * タブ補完処理
     */
    handleTabCompletion() {
        const input = this.inputElement.value;
        const completions = this.commandRegistry.getCompletions(input);
        
        if (completions.length === 1) {
            // 単一の補完候補
            this.inputElement.value = completions[0];
        } else if (completions.length > 1) {
            // 複数の補完候補を表示
            this.print(`Available completions:`);
            completions.forEach(completion => {
                this.print(`  ${completion}`, 'info');
            });
        }
    }

    /**
     * 履歴追加
     */
    addToHistory(command) {
        // 重複する最新エントリを削除
        const lastIndex = this.state.history.lastIndexOf(command);
        if (lastIndex === this.state.history.length - 1) {
            this.state.history.pop();
        }
        
        this.state.history.push(command);
        
        // サイズ制限
        if (this.state.history.length > this.state.maxHistorySize) {
            this.state.history.shift();
        }
    }

    /**
     * テキスト出力
     */
    print(text, type = 'normal') {
        const timestamp = this.formatTimestamp(new Date());
        const line = {
            timestamp: timestamp,
            text: String(text),
            type: type
        };
        
        this.output.lines.push(line);
        
        // 行数制限
        if (this.output.lines.length > this.output.maxLines) {
            this.output.lines.shift();
        }
        
        this.renderOutput();
    }

    /**
     * エラー出力
     */
    printError(text) {
        this.print(text, 'error');
    }

    /**
     * 警告出力
     */
    printWarning(text) {
        this.print(text, 'warning');
    }

    /**
     * 情報出力
     */
    printInfo(text) {
        this.print(text, 'info');
    }

    /**
     * 成功出力
     */
    printSuccess(text) {
        this.print(text, 'success');
    }

    /**
     * 出力レンダリング
     */
    renderOutput() {
        const html = this.output.lines.map(line => {
            const colorClass = this.getColorClass(line.type);
            return `<span class="${colorClass}">[${line.timestamp}] ${this.escapeHtml(line.text)}</span>`;
        }).join('\n');
        
        this.outputElement.innerHTML = html;
        
        // 最下部にスクロール
        if (this.output.scrollToBottom) {
            this.outputElement.scrollTop = this.outputElement.scrollHeight;
        }
    }

    /**
     * カラークラス取得
     */
    getColorClass(type) {
        const colors = {
            normal: 'color: #00ff00',
            command: 'color: #ffffff',
            error: 'color: #ff6b6b',
            warning: 'color: #ffa500',
            info: 'color: #4ecdc4',
            success: 'color: #00ff88'
        };
        
        return `style="${colors[type] || colors.normal}"`;
    }

    /**
     * HTML エスケープ
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * タイムスタンプフォーマット
     */
    formatTimestamp(date) {
        return date.toTimeString().split(' ')[0];
    }

    /**
     * ウェルカムメッセージ
     */
    printWelcomeMessage() {
        this.print('=== Developer Console ===', 'info');
        this.print('Type "help" for available commands', 'info');
        this.print('Press F12 or Ctrl+Shift+C to toggle console', 'info');
        this.print('Press Escape to hide console', 'info');
        this.print('Use Tab for command completion', 'info');
        this.print('Use Up/Down arrows for command history', 'info');
        this.print('');
    }

    /**
     * デフォルトコマンド登録
     */
    registerDefaultCommands() {
        // ヘルプコマンド
        this.commandRegistry.register('help', {
            description: 'Show available commands',
            usage: 'help [command]',
            execute: (args) => {
                if (args.length > 0) {
                    return this.commandRegistry.getCommandHelp(args[0]);
                } else {
                    return this.commandRegistry.getCommandList();
                }
            }
        });
        
        // クリアコマンド
        this.commandRegistry.register('clear', {
            description: 'Clear console output',
            usage: 'clear',
            execute: () => {
                this.clear();
                return 'Console cleared';
            }
        });
        
        // 履歴表示コマンド
        this.commandRegistry.register('history', {
            description: 'Show command history',
            usage: 'history [count]',
            execute: (args) => {
                const count = args.length > 0 ? parseInt(args[0]) : this.state.history.length;
                const start = Math.max(0, this.state.history.length - count);
                return this.state.history.slice(start).map((cmd, i) => 
                    `${start + i + 1}: ${cmd}`
                ).join('\n');
            }
        });
        
        // エコーコマンド
        this.commandRegistry.register('echo', {
            description: 'Echo text to console',
            usage: 'echo <text>',
            execute: (args) => {
                return args.join(' ');
            }
        });
        
        // 日時表示コマンド
        this.commandRegistry.register('date', {
            description: 'Show current date and time',
            usage: 'date',
            execute: () => {
                return new Date().toString();
            }
        });
        
        // ゲームエンジン情報
        this.commandRegistry.register('engine', {
            description: 'Show game engine information',
            usage: 'engine',
            execute: () => {
                if (!this.gameEngine) return 'Game engine not available';
                
                const info = [];
                info.push('=== Game Engine Information ===');
                info.push(`Canvas: ${this.gameEngine.canvas ? 'Available' : 'Not available'}`);
                info.push(`Scene Manager: ${this.gameEngine.sceneManager ? 'Available' : 'Not available'}`);
                info.push(`Input Manager: ${this.gameEngine.inputManager ? 'Available' : 'Not available'}`);
                
                if (this.gameEngine.performanceOptimizer) {
                    info.push(`Current FPS: ${this.gameEngine.performanceOptimizer.getCurrentFPS()}`);
                }
                
                return info.join('\n');
            }
        });
    }

    /**
     * 表示/非表示切り替え
     */
    toggle() {
        if (this.state.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 表示
     */
    show() {
        this.element.style.display = 'block';
        this.state.visible = true;
        this.inputElement.focus();
        this.print('Console opened', 'info');
    }

    /**
     * 非表示
     */
    hide() {
        this.element.style.display = 'none';
        this.state.visible = false;
        this.state.focused = false;
        this.print('Console closed', 'info');
    }

    /**
     * クリア
     */
    clear() {
        this.output.lines = [];
        this.outputElement.innerHTML = '';
    }

    /**
     * コマンド登録（外部から）
     */
    registerCommand(name, config) {
        return this.commandRegistry.register(name, config);
    }

    /**
     * コマンド登録解除
     */
    unregisterCommand(name) {
        return this.commandRegistry.unregister(name);
    }

    /**
     * 設定更新
     */
    updateSettings(settings) {
        if (settings.maxHistorySize) {
            this.state.maxHistorySize = settings.maxHistorySize;
        }
        
        if (settings.maxOutputLines) {
            this.output.maxLines = settings.maxOutputLines;
        }
        
        if (settings.timestampFormat) {
            this.output.timestampFormat = settings.timestampFormat;
        }
        
        if (settings.styles) {
            Object.assign(this.styles, settings.styles);
            this.applyStyles(this.element, this.styles.console);
            this.applyStyles(this.outputElement, this.styles.output);
            this.applyStyles(this.inputElement, this.styles.input);
        }
        
        this.print('Console settings updated', 'info');
    }

    /**
     * 状態取得
     */
    getState() {
        return {
            visible: this.state.visible,
            focused: this.state.focused,
            historySize: this.state.history.length,
            outputLines: this.output.lines.length,
            availableCommands: this.commandRegistry.getCommandNames()
        };
    }

    /**
     * クリーンアップ
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.commandRegistry.destroy();
        
        console.log('[DeveloperConsole] Destroyed');
    }
}

/**
 * Command Registry
 * コマンド登録・管理システム
 */
export class CommandRegistry {
    constructor(console) {
        this.console = console;
        this.commands = new Map();
        this.aliases = new Map();
        this.middleware = [];
    }

    /**
     * コマンド登録
     */
    register(name, config) {
        if (!name || !config || typeof config.execute !== 'function') {
            throw new Error('Invalid command configuration');
        }

        const command = {
            name: name,
            description: config.description || 'No description',
            usage: config.usage || name,
            execute: config.execute,
            aliases: config.aliases || [],
            category: config.category || 'general',
            hidden: config.hidden || false
        };

        this.commands.set(name, command);

        // エイリアス登録
        if (command.aliases) {
            command.aliases.forEach(alias => {
                this.aliases.set(alias, name);
            });
        }

        console.log(`[CommandRegistry] Command '${name}' registered`);
        return true;
    }

    /**
     * コマンド登録解除
     */
    unregister(name) {
        const command = this.commands.get(name);
        if (!command) return false;

        // エイリアス削除
        if (command.aliases) {
            command.aliases.forEach(alias => {
                this.aliases.delete(alias);
            });
        }

        this.commands.delete(name);
        console.log(`[CommandRegistry] Command '${name}' unregistered`);
        return true;
    }

    /**
     * コマンド実行
     */
    execute(input) {
        const { command, args } = this.parseInput(input);
        
        if (!command) {
            throw new Error('Empty command');
        }

        // エイリアス解決
        const actualCommand = this.aliases.get(command) || command;
        const commandObj = this.commands.get(actualCommand);

        if (!commandObj) {
            throw new Error(`Unknown command: ${command}`);
        }

        // ミドルウェア実行
        for (const middleware of this.middleware) {
            const result = middleware(actualCommand, args);
            if (result === false) {
                throw new Error('Command blocked by middleware');
            }
        }

        // コマンド実行
        try {
            return commandObj.execute(args, this.console);
        } catch (error) {
            throw new Error(`Command execution failed: ${error.message}`);
        }
    }

    /**
     * 入力解析
     */
    parseInput(input) {
        const trimmed = input.trim();
        if (!trimmed) return { command: null, args: [] };

        const parts = this.splitCommand(trimmed);
        return {
            command: parts[0],
            args: parts.slice(1)
        };
    }

    /**
     * コマンド分割（クォート対応）
     */
    splitCommand(input) {
        const parts = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            
            if (!inQuotes && (char === '"' || char === "'")) {
                inQuotes = true;
                quoteChar = char;
            } else if (inQuotes && char === quoteChar) {
                inQuotes = false;
                quoteChar = '';
            } else if (!inQuotes && char === ' ') {
                if (current) {
                    parts.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }

        if (current) {
            parts.push(current);
        }

        return parts;
    }

    /**
     * 補完候補取得
     */
    getCompletions(input) {
        const { command, args } = this.parseInput(input);
        
        if (args.length === 0) {
            // コマンド名の補完
            const commandNames = Array.from(this.commands.keys())
                .concat(Array.from(this.aliases.keys()))
                .filter(name => name.startsWith(command || ''))
                .sort();
            
            return commandNames;
        } else {
            // 引数の補完（コマンド固有の実装が必要）
            const commandObj = this.commands.get(command);
            if (commandObj && commandObj.getCompletions) {
                return commandObj.getCompletions(args);
            }
            return [];
        }
    }

    /**
     * コマンド一覧取得
     */
    getCommandList() {
        const categories = {};
        
        this.commands.forEach((command, name) => {
            if (command.hidden) return;
            
            if (!categories[command.category]) {
                categories[command.category] = [];
            }
            
            categories[command.category].push({
                name: name,
                description: command.description,
                aliases: command.aliases
            });
        });

        const output = [];
        output.push('Available commands:');
        output.push('');

        Object.keys(categories).sort().forEach(category => {
            output.push(`${category.toUpperCase()}:`);
            categories[category].forEach(cmd => {
                const aliasText = cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
                output.push(`  ${cmd.name}${aliasText} - ${cmd.description}`);
            });
            output.push('');
        });

        return output.join('\n');
    }

    /**
     * コマンドヘルプ取得
     */
    getCommandHelp(commandName) {
        const actualCommand = this.aliases.get(commandName) || commandName;
        const command = this.commands.get(actualCommand);

        if (!command) {
            return `Unknown command: ${commandName}`;
        }

        const output = [];
        output.push(`Command: ${command.name}`);
        output.push(`Description: ${command.description}`);
        output.push(`Usage: ${command.usage}`);
        
        if (command.aliases.length > 0) {
            output.push(`Aliases: ${command.aliases.join(', ')}`);
        }

        return output.join('\n');
    }

    /**
     * コマンド名一覧取得
     */
    getCommandNames() {
        return Array.from(this.commands.keys()).sort();
    }

    /**
     * ミドルウェア追加
     */
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.commands.clear();
        this.aliases.clear();
        this.middleware = [];
    }
}

export default DeveloperConsole;