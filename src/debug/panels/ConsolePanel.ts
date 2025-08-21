/**
 * Console Panel - 開発者コンソールパネル
 */

interface GameEngine { developerConsole?: DeveloperConsole;
    configManager?: ConfigManager;
    stop: () => void;
    start: () => void ,}
}

interface DeveloperConsole { executeCommand: (command: string) => string }
}

interface ConfigManager { get: (key: string) => any }
}

interface DebugInterface { // Debug interface methods }

type OutputType = 'info' | 'command' | 'result' | 'error';

export class ConsolePanel {
    private gameEngine: GameEngine;
    private debugInterface: DebugInterface;
    private element: HTMLElement | null;
    private developerConsole?: DeveloperConsole;

    constructor(gameEngine: GameEngine, debugInterface: DebugInterface) {

        this.gameEngine = gameEngine;
        this.debugInterface = debugInterface;
        this.element = null;

    ,}
        this.developerConsole = gameEngine.developerConsole; }
    }

    /**
     * パネルを作成'
     */''
    public create()';
        this.element = document.createElement('div'');''
        this.element.className = 'debug-console-panel';

        this.element.innerHTML = `'';
            <div class="console-section">";
                <h4>開発者コンソール</h4>"";
                <div class="console-output" id="console-output"></div>"";
                <div class="console-input-container">"";
                    <input type="text" id="console-input" placeholder="コマンドを入力..." />"";
                    <button id="console-execute">実行</button>;
                </div>;
            </div>";

            <div class="console-section">";
                <h4>よく使うコマンド</h4>"";
                <div class="common-commands">"";
                    <button class="cmd-btn" data-cmd="game.pause(")">ゲーム一時停止</button>"";
                    <button class="cmd-btn" data-cmd="game.resume(")">ゲーム再開</button>"";
                    <button class="cmd-btn" data-cmd="debug.showHitboxes(")">当たり判定表示</button>"";
                    <button class="cmd-btn" data-cmd="config.get('performance'')">パフォーマンス設定取得</button>"";
                    <button class="cmd-btn" data-cmd="test.generateBubbles(10)">テスト用バブル生成</button>;
                </div>;
            </div>";

            <div class="console-section">";
                <h4>コマンド履歴</h4>"";
                <div class="command-history" id="command-history"></div>;
            </div>;
        `;

        this.bindEvents();
        return this.element;
    }

    /**
     * イベントバインド
     */"
    private bindEvents(): void { ""
        if (!this.element) return;"

        const input = this.element.querySelector('#console-input'') as HTMLInputElement;''
        const executeBtn = this.element.querySelector('#console-execute) as HTMLButtonElement;
        
        // コマンド実行
        const executeCommand = () => { 
            const command = input.value.trim();
            if(command) {
                ';

            }

                this.executeCommand(command);' }'

                input.value = ''; }
};

        executeBtn.addEventListener('click', executeCommand);''
        input.addEventListener('keypress', (e: KeyboardEvent) => {  ''
            if(e.key === 'Enter) { }'
                executeCommand(); }

            }''
        }');
';
        // よく使うコマンドボタン
        this.element.querySelectorAll('.cmd-btn).forEach(btn => {  ')'
            const button = btn as HTMLButtonElement');''
            button.addEventListener('click', () => {
                const command = button.dataset.cmd;
                if(command) {'
                    input.value = command;

                }

                    this.executeCommand(command);' }'

                    input.value = ''; }
});
        });
    }

    /**
     * コマンドを実行
     */'
    private executeCommand(command: string): void { try {'
            this.addOutput(`> ${command)`, 'command'};
            
            if(this.developerConsole} {
            ';

                ';

            }

                const, result = this.developerConsole.executeCommand(command);' }'

                this.addOutput(result, 'result'});

            } else {  // フォールバック：基本的なコマンド処理
                const result = this.executeBasicCommand(command);' }'

                this.addOutput(result, 'result); }'
            }
            
            this.addToHistory(command);
            ';

        } catch (error) { }

            this.addOutput(`エラー: ${(error, as Error'}).message}`, 'error');
        }
    }

    /**
     * 基本的なコマンドを実行'
     */''
    private executeBasicCommand(command: string): string { // 簡単なコマンド解析
        if(command.startsWith('game.) {'
            ';

        }

            return this.executeGameCommand(command);' }'

        } else if(command.startsWith('debug.) { ''
            return this.executeDebugCommand(command);' }'

        } else if(command.startsWith('config.) { ''
            return this.executeConfigCommand(command);' }'

        } else if(command.startsWith('test.) { return this.executeTestCommand(command); } else {  }'
            return `未知のコマンド: ${command}`;

    /**
     * ゲームコマンドを実行
     */'
    private executeGameCommand(command: string): string { ''
        switch(command) {'

            case 'game.pause(')':'';
                this.gameEngine.stop()';
                return 'ゲームを一時停止しました';')'
            case 'game.resume(')':'';
                this.gameEngine.start(''';
                return 'ゲームを再開しました';
        }
            default: })
                return `未知のゲームコマンド: ${command}`)
        }
    }

    /**
     * デバッグコマンドを実行
     */)'
    private executeDebugCommand(command: string): string { ''
        switch(command) {'

            case 'debug.showHitboxes(')':'';
                return 'デバッグ表示機能（未実装）';
        }
            default: }
                return `未知のデバッグコマンド: ${command}`;

    /**
     * 設定コマンドを実行'
     */''
    private executeConfigCommand(command: string): string { ''
        if(command.includes('get()) {''
            const key = command.match(/get\(['"]([^'"]+)['"]\)/)? .[1];
            if(key && this.gameEngine.configManager) {
                
            }
                const value = this.gameEngine.configManager.get(key); : undefined 
                return `${key}: ${JSON.stringify(value})`;
        return `設定コマンド実行結果（未実装）: ${command}`;
    }

    /**
     * テストコマンドを実行"
     */""
    private executeTestCommand(command: string): string { ""
        if(command.includes('generateBubbles) {'
            ';

        }

            const count = command.match(/generateBubbles\((\d+)\)/')? .[1]; }'
            return `${count || 1}個のテスト用バブルを生成しました（シミュレーション）`;
        } : undefined
        return `テストコマンド実行結果（未実装）: ${command}`;
    }

    /**
     * 出力エリアにメッセージを追加'
     */''
    private addOutput(message: string, type: OutputType = 'info): void { ''
        if(!this.element) return;

        const output = this.element.querySelector('#console-output) as HTMLElement;''
        if(output) {'
            ';

        }

            const div = document.createElement('div); }'
            div.className = `console-line console-${type}`;
            div.textContent = message;
            output.appendChild(div);
            output.scrollTop = output.scrollHeight;
        }
    }

    /**
     * コマンド履歴に追加
     */'
    private addToHistory(command: string): void { ''
        if(!this.element) return;

        const history = this.element.querySelector('#command-history) as HTMLElement;''
        if(history) {'

            const div = document.createElement('div'');''
            div.className = 'history-item';

            div.textContent = command;''
            div.addEventListener('click', () => { ''
                const input = this.element? .querySelector('#console-input) as HTMLInputElement;
        }
                if (input) { }
                    input.value = command; }
});
            history.appendChild(div);
            
            // 履歴を最大10件に制限
            while(history.children.length > 10) {
                const firstChild = history.firstChild;
                if (firstChild) {
            }
                    history.removeChild(firstChild); }
}
        }
    }

    /**
     * パネルを表示
     */ : undefined
    public show(): void { ''
        if(this.element) {'
            ';

        }

            this.element.style.display = 'block'; }
}

    /**
     * パネルを非表示
     */'
    public hide(): void { ''
        if(this.element) {'
            ';

        }

            this.element.style.display = 'none'; }
}

    /**
     * パネルサイズを更新（レスポンシブレイアウト用）
     */'
    public updateSize(): void { // パネルサイズ変更時の処理
        if(this.element) {'
            // コンソール出力を最新の位置にスクロール
            const output = this.element.querySelector('#console-output) as HTMLElement;
            if (output) {
        }
                output.scrollTop = output.scrollHeight; }
}
    }

    /**
     * パネルを破棄
     */'
    public destroy(): void { if (this.element && this.element.parentNode) {''
            this.element.parentNode.removeChild(this.element); }
        this.element = null;

    }''
}