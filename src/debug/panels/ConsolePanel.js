/**
 * Console Panel - 開発者コンソールパネル
 */
export class ConsolePanel {
    constructor(gameEngine, debugInterface) {
        this.gameEngine = gameEngine;
        this.debugInterface = debugInterface;
        this.element = null;
        this.developerConsole = gameEngine.developerConsole;
    }

    /**
     * パネルを作成
     */
    create() {
        this.element = document.createElement('div');
        this.element.className = 'debug-console-panel';
        this.element.innerHTML = `
            <div class="console-section">
                <h4>開発者コンソール</h4>
                <div class="console-output" id="console-output"></div>
                <div class="console-input-container">
                    <input type="text" id="console-input" placeholder="コマンドを入力..." />
                    <button id="console-execute">実行</button>
                </div>
            </div>
            
            <div class="console-section">
                <h4>よく使うコマンド</h4>
                <div class="common-commands">
                    <button class="cmd-btn" data-cmd="game.pause()">ゲーム一時停止</button>
                    <button class="cmd-btn" data-cmd="game.resume()">ゲーム再開</button>
                    <button class="cmd-btn" data-cmd="debug.showHitboxes()">当たり判定表示</button>
                    <button class="cmd-btn" data-cmd="config.get('performance')">パフォーマンス設定取得</button>
                    <button class="cmd-btn" data-cmd="test.generateBubbles(10)">テスト用バブル生成</button>
                </div>
            </div>
            
            <div class="console-section">
                <h4>コマンド履歴</h4>
                <div class="command-history" id="command-history"></div>
            </div>
        `;

        this.bindEvents();
        return this.element;
    }

    /**
     * イベントバインド
     */
    bindEvents() {
        const input = this.element.querySelector('#console-input');
        const executeBtn = this.element.querySelector('#console-execute');
        
        // コマンド実行
        const executeCommand = () => {
            const command = input.value.trim();
            if (command) {
                this.executeCommand(command);
                input.value = '';
            }
        };

        executeBtn.addEventListener('click', executeCommand);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executeCommand();
            }
        });

        // よく使うコマンドボタン
        this.element.querySelectorAll('.cmd-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.dataset.cmd;
                input.value = command;
                this.executeCommand(command);
                input.value = '';
            });
        });
    }

    /**
     * コマンドを実行
     */
    executeCommand(command) {
        try {
            this.addOutput(`> ${command}`, 'command');
            
            if (this.developerConsole) {
                const result = this.developerConsole.executeCommand(command);
                this.addOutput(result, 'result');
            } else {
                // フォールバック：基本的なコマンド処理
                const result = this.executeBasicCommand(command);
                this.addOutput(result, 'result');
            }
            
            this.addToHistory(command);
            
        } catch (error) {
            this.addOutput(`エラー: ${error.message}`, 'error');
        }
    }

    /**
     * 基本的なコマンドを実行
     */
    executeBasicCommand(command) {
        // 簡単なコマンド解析
        if (command.startsWith('game.')) {
            return this.executeGameCommand(command);
        } else if (command.startsWith('debug.')) {
            return this.executeDebugCommand(command);
        } else if (command.startsWith('config.')) {
            return this.executeConfigCommand(command);
        } else if (command.startsWith('test.')) {
            return this.executeTestCommand(command);
        } else {
            return `未知のコマンド: ${command}`;
        }
    }

    /**
     * ゲームコマンドを実行
     */
    executeGameCommand(command) {
        switch (command) {
            case 'game.pause()':
                this.gameEngine.stop();
                return 'ゲームを一時停止しました';
            case 'game.resume()':
                this.gameEngine.start();
                return 'ゲームを再開しました';
            default:
                return `未知のゲームコマンド: ${command}`;
        }
    }

    /**
     * デバッグコマンドを実行
     */
    executeDebugCommand(command) {
        switch (command) {
            case 'debug.showHitboxes()':
                return 'デバッグ表示機能（未実装）';
            default:
                return `未知のデバッグコマンド: ${command}`;
        }
    }

    /**
     * 設定コマンドを実行
     */
    executeConfigCommand(command) {
        if (command.includes('get(')) {
            const key = command.match(/get\(['"]([^'"]+)['"]\)/)?.[1];
            if (key && this.gameEngine.configManager) {
                const value = this.gameEngine.configManager.get(key);
                return `${key}: ${JSON.stringify(value)}`;
            }
        }
        return `設定コマンド実行結果（未実装）: ${command}`;
    }

    /**
     * テストコマンドを実行
     */
    executeTestCommand(command) {
        if (command.includes('generateBubbles')) {
            const count = command.match(/generateBubbles\((\d+)\)/)?.[1];
            return `${count || 1}個のテスト用バブルを生成しました（シミュレーション）`;
        }
        return `テストコマンド実行結果（未実装）: ${command}`;
    }

    /**
     * 出力エリアにメッセージを追加
     */
    addOutput(message, type = 'info') {
        const output = this.element.querySelector('#console-output');
        if (output) {
            const div = document.createElement('div');
            div.className = `console-line console-${type}`;
            div.textContent = message;
            output.appendChild(div);
            output.scrollTop = output.scrollHeight;
        }
    }

    /**
     * コマンド履歴に追加
     */
    addToHistory(command) {
        const history = this.element.querySelector('#command-history');
        if (history) {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.textContent = command;
            div.addEventListener('click', () => {
                const input = this.element.querySelector('#console-input');
                if (input) {
                    input.value = command;
                }
            });
            history.appendChild(div);
            
            // 履歴を最大10件に制限
            while (history.children.length > 10) {
                history.removeChild(history.firstChild);
            }
        }
    }

    /**
     * パネルを表示
     */
    show() {
        if (this.element) {
            this.element.style.display = 'block';
        }
    }

    /**
     * パネルを非表示
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    /**
     * パネルを破棄
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}