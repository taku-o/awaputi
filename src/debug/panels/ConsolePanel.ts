/**
 * Console Panel - 開発者コンソールパネル
 */

interface GameEngine {
    developerConsole?: DeveloperConsole;
    configManager?: ConfigManager;
    stop: () => void;
    start: () => void;
}

interface DeveloperConsole {
    executeCommand: (command: string) => string;
}

interface ConfigManager {
    get: (key: string) => any;
}

interface DebugInterface {
    // Debug interface methods
    hide?: () => void;
    show?: () => void;
}

type OutputType = 'info' | 'command' | 'result' | 'error';

interface OutputEntry {
    type: OutputType;
    message: string;
    timestamp: number;
    command?: string;
}

export class ConsolePanel {
    private gameEngine: GameEngine;
    private debugInterface: DebugInterface;
    private element: HTMLElement | null;
    private developerConsole?: DeveloperConsole;
    private outputElement?: HTMLElement;
    private inputElement?: HTMLInputElement;
    private outputHistory: OutputEntry[];
    private commandHistory: string[];
    private historyIndex: number;
    private maxHistorySize: number;

    constructor(gameEngine: GameEngine, debugInterface: DebugInterface) {
        this.gameEngine = gameEngine;
        this.debugInterface = debugInterface;
        this.element = null;
        this.developerConsole = gameEngine.developerConsole;
        this.outputHistory = [];
        this.commandHistory = [];
        this.historyIndex = -1;
        this.maxHistorySize = 100;
    }

    /**
     * パネルを作成
     */
    public create(): HTMLElement {
        this.element = document.createElement('div');
        this.element.className = 'console-panel';
        this.element.innerHTML = this.createHTML();

        this.setupElements();
        this.setupEventListeners();
        this.addWelcomeMessage();

        return this.element;
    }

    /**
     * HTML構造を作成
     */
    private createHTML(): string {
        return `
            <div class="console-header">
                <h3>Developer Console</h3>
                <div class="console-controls">
                    <button class="clear-btn" title="Clear console">Clear</button>
                    <button class="help-btn" title="Show help">Help</button>
                </div>
            </div>
            <div class="console-output" id="console-output"></div>
            <div class="console-input-container">
                <span class="console-prompt">></span>
                <input type="text" class="console-input" id="console-input" placeholder="Enter command..." autocomplete="off">
            </div>
            <div class="console-status">
                <span class="command-count">Commands: 0</span>
                <span class="separator">|</span>
                <span class="game-status">Game: Running</span>
            </div>
        `;
    }

    /**
     * DOM要素を設定
     */
    private setupElements(): void {
        if (!this.element) return;

        this.outputElement = this.element.querySelector('#console-output') as HTMLElement;
        this.inputElement = this.element.querySelector('#console-input') as HTMLInputElement;
    }

    /**
     * イベントリスナーを設定
     */
    private setupEventListeners(): void {
        if (!this.element || !this.inputElement) return;

        // コマンド入力処理
        this.inputElement.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });

        // クリアボタン
        const clearBtn = this.element.querySelector('.clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearOutput());
        }

        // ヘルプボタン
        const helpBtn = this.element.querySelector('.help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }

        // 出力エリアのスクロール同期
        if (this.outputElement) {
            this.outputElement.addEventListener('scroll', () => {
                // オートスクロールの制御
            });
        }
    }

    /**
     * キーボードイベント処理
     */
    private handleKeyDown(event: KeyboardEvent): void {
        if (!this.inputElement) return;

        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                this.executeCommand();
                break;

            case 'ArrowUp':
                event.preventDefault();
                this.navigateHistory(-1);
                break;

            case 'ArrowDown':
                event.preventDefault();
                this.navigateHistory(1);
                break;

            case 'Tab':
                event.preventDefault();
                this.handleAutoComplete();
                break;

            case 'Escape':
                event.preventDefault();
                this.clearInput();
                break;
        }
    }

    /**
     * コマンドを実行
     */
    private executeCommand(): void {
        if (!this.inputElement || !this.developerConsole) return;

        const command = this.inputElement.value.trim();
        if (!command) return;

        // コマンドを履歴に追加
        this.addToHistory(command);

        // コマンドを出力に表示
        this.addOutput('command', `> ${command}`);

        try {
            // コマンドを実行
            const result = this.developerConsole.executeCommand(command);
            
            if (result) {
                this.addOutput('result', result);
            } else {
                this.addOutput('info', 'Command executed successfully');
            }

        } catch (error) {
            const errorMessage = (error as Error).message || 'Unknown error occurred';
            this.addOutput('error', `Error: ${errorMessage}`);
        }

        // 入力をクリア
        this.clearInput();
        this.updateStatus();
    }

    /**
     * 出力を追加
     */
    private addOutput(type: OutputType, message: string, command?: string): void {
        if (!this.outputElement) return;

        const entry: OutputEntry = {
            type,
            message,
            timestamp: Date.now(),
            command
        };

        this.outputHistory.push(entry);

        // 履歴サイズ制限
        if (this.outputHistory.length > this.maxHistorySize) {
            this.outputHistory.shift();
            this.refreshOutput();
            return;
        }

        // DOM要素を作成して追加
        const outputItem = this.createOutputElement(entry);
        this.outputElement.appendChild(outputItem);

        // 自動スクロール
        this.scrollToBottom();
    }

    /**
     * 出力要素を作成
     */
    private createOutputElement(entry: OutputEntry): HTMLElement {
        const item = document.createElement('div');
        item.className = `console-output-item output-${entry.type}`;

        const timestamp = new Date(entry.timestamp).toLocaleTimeString();
        
        item.innerHTML = `
            <span class="output-timestamp">${timestamp}</span>
            <span class="output-message">${this.escapeHtml(entry.message)}</span>
        `;

        return item;
    }

    /**
     * コマンド履歴に追加
     */
    private addToHistory(command: string): void {
        // 重複を避ける
        const existingIndex = this.commandHistory.indexOf(command);
        if (existingIndex !== -1) {
            this.commandHistory.splice(existingIndex, 1);
        }

        this.commandHistory.push(command);

        // 履歴サイズ制限
        if (this.commandHistory.length > this.maxHistorySize) {
            this.commandHistory.shift();
        }

        this.historyIndex = this.commandHistory.length;
    }

    /**
     * 履歴ナビゲーション
     */
    private navigateHistory(direction: number): void {
        if (!this.inputElement || this.commandHistory.length === 0) return;

        this.historyIndex += direction;

        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            this.inputElement.value = '';
            return;
        }

        this.inputElement.value = this.commandHistory[this.historyIndex] || '';
        
        // カーソルを末尾に移動
        setTimeout(() => {
            if (this.inputElement) {
                this.inputElement.setSelectionRange(this.inputElement.value.length, this.inputElement.value.length);
            }
        }, 0);
    }

    /**
     * オートコンプリート処理
     */
    private handleAutoComplete(): void {
        if (!this.inputElement) return;

        const currentValue = this.inputElement.value;
        const availableCommands = this.getAvailableCommands();

        const matches = availableCommands.filter(cmd => 
            cmd.startsWith(currentValue.toLowerCase())
        );

        if (matches.length === 1) {
            this.inputElement.value = matches[0];
        } else if (matches.length > 1) {
            this.addOutput('info', `Available: ${matches.join(', ')}`);
        }
    }

    /**
     * 利用可能なコマンドを取得
     */
    private getAvailableCommands(): string[] {
        // 基本的なコマンドリスト
        const basicCommands = [
            'help',
            'clear',
            'status',
            'start',
            'stop',
            'restart',
            'config',
            'debug'
        ];

        return basicCommands;
    }

    /**
     * ウェルカムメッセージを追加
     */
    private addWelcomeMessage(): void {
        this.addOutput('info', 'Developer Console initialized. Type "help" for available commands.');
        this.updateStatus();
    }

    /**
     * ヘルプを表示
     */
    private showHelp(): void {
        const helpText = `
Available Commands:
  help     - Show this help message
  clear    - Clear console output
  status   - Show game status
  start    - Start the game
  stop     - Stop the game
  restart  - Restart the game
  config   - Show configuration
  debug    - Toggle debug mode

Keyboard Shortcuts:
  Enter      - Execute command
  ↑/↓ Arrow - Navigate command history
  Tab        - Auto-complete command
  Escape     - Clear input
        `.trim();

        this.addOutput('info', helpText);
    }

    /**
     * 出力をクリア
     */
    private clearOutput(): void {
        if (!this.outputElement) return;

        this.outputElement.innerHTML = '';
        this.outputHistory = [];
        this.addOutput('info', 'Console cleared.');
    }

    /**
     * 入力をクリア
     */
    private clearInput(): void {
        if (!this.inputElement) return;

        this.inputElement.value = '';
        this.historyIndex = this.commandHistory.length;
    }

    /**
     * 出力を更新（履歴制限時）
     */
    private refreshOutput(): void {
        if (!this.outputElement) return;

        this.outputElement.innerHTML = '';

        for (const entry of this.outputHistory) {
            const outputItem = this.createOutputElement(entry);
            this.outputElement.appendChild(outputItem);
        }

        this.scrollToBottom();
    }

    /**
     * 底部にスクロール
     */
    private scrollToBottom(): void {
        if (!this.outputElement) return;

        setTimeout(() => {
            if (this.outputElement) {
                this.outputElement.scrollTop = this.outputElement.scrollHeight;
            }
        }, 0);
    }

    /**
     * ステータスを更新
     */
    private updateStatus(): void {
        if (!this.element) return;

        const commandCountElement = this.element.querySelector('.command-count');
        if (commandCountElement) {
            commandCountElement.textContent = `Commands: ${this.commandHistory.length}`;
        }

        const gameStatusElement = this.element.querySelector('.game-status');
        if (gameStatusElement) {
            // ゲームの状態を取得して表示
            gameStatusElement.textContent = 'Game: Running';
        }
    }

    /**
     * HTMLエスケープ
     */
    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * パネルの表示
     */
    public show(): void {
        if (this.element) {
            this.element.style.display = 'block';
            
            // 入力フォーカス
            if (this.inputElement) {
                this.inputElement.focus();
            }
        }
    }

    /**
     * パネルの非表示
     */
    public hide(): void {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    /**
     * パネルのリサイズ
     */
    public resize(): void {
        if (this.outputElement) {
            this.scrollToBottom();
        }
    }

    /**
     * 統計情報の取得
     */
    public getStatistics(): {
        commandCount: number;
        outputCount: number;
        historySize: number;
    } {
        return {
            commandCount: this.commandHistory.length,
            outputCount: this.outputHistory.length,
            historySize: this.maxHistorySize
        };
    }

    /**
     * クリーンアップ
     */
    public destroy(): void {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.outputHistory = [];
        this.commandHistory = [];
        this.element = null;
        this.outputElement = undefined;
        this.inputElement = undefined;
        
        console.log('ConsolePanel destroyed');
    }
}

export default ConsolePanel;