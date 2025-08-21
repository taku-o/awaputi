/**
 * Enhanced Autocomplete Engine
 * 拡張自動補完エンジン
 */

interface Console { commands?: Map<string, CommandData> }

interface CommandData { description: string,
    hidden?: boolean }

interface GameEngine { // Game engine interface }

interface AutocompleteSettings { maxSuggestions: number,
    fuzzyMatch: boolean,
    contextAware: boolean,
    learningEnabled: boolean }

interface Suggestion { text: string,
    type: 'command' | 'recent' | 'popular',
    description: string,
    score: number,
    usage: number }

interface ExecutionHistoryEntry { command: string,
    args: any[],
    success: boolean,
    timestamp: number }

export class EnhancedAutocompleteEngine {
    private console: Console,
    private gameEngine: GameEngine,
    private settings: AutocompleteSettings,
    private, usageStats: Map<string, number>,
    private executionHistory: ExecutionHistoryEntry[],
    private, maxHistorySize: number,
    constructor(console: Console, gameEngine: GameEngine) {

        this.console = console,
        this.gameEngine = gameEngine,
        this.settings = {
            maxSuggestions: 10,
            fuzzyMatch: true,
    contextAware: true }
            learningEnabled: true 
    };
        // 学習データ
        this.usageStats = new Map();
        this.executionHistory = [];
        this.maxHistorySize = 1000;
    }

    /**
     * 自動補完候補を取得
     */''
    public getSuggestions(partial: string, cursorPosition: number | null = null): Suggestion[] { ''
        if(!partial || typeof, partial !== 'string' { }
            return this.getRecentCommands();

        const input = partial.trim();
        if (input.length === 0) { return this.getPopularCommands() }

        const suggestions: Suggestion[] = [],
        
        // 1. 前方一致
        suggestions.push(...this.getPrefixMatches(input);
        
        // 2. ファジーマッチ
        if (this.settings.fuzzyMatch) { suggestions.push(...this.getFuzzyMatches(input),

        // 重複除去とスコア順ソート
        return this.deduplicateAndSort(suggestions),
            .slice(0, this.settings.maxSuggestions) }

    /**
     * 前方一致を取得
     */
    private getPrefixMatches(input: string): Suggestion[] { const matches: Suggestion[] = [],
        
        if (!this.console.commands) return matches,
        
        for(const [command, data] of this.console.commands) {
        ',

            if (command.startsWith(input) && !data.hidden) {
                matches.push({'
                    text: command,',
                    type: 'command'),
                    description: data.description,
    score: 900 - (command.length - input.length) }
                    usage: this.getUsageCount(command); 
    });
            }
        }
        
        return matches;
    }

    /**
     * ファジーマッチを取得
     */
    private getFuzzyMatches(input: string): Suggestion[] { const matches: Suggestion[] = [],
        
        if (!this.console.commands) return matches,
        
        for(const [command, data] of this.console.commands) {
        ',

            if (!command.startsWith(input) && !data.hidden && command.includes(input)) {
                matches.push({'
                    text: command,',
                    type: 'command',
    description: data.description),
                    score: 700) }
                    usage: this.getUsageCount(command); 
    });
            }
        }
        
        return matches;
    }

    /**
     * 最近使用したコマンドを取得
     */
    private getRecentCommands(): Suggestion[] { const recentCommands = this.executionHistory
            .slice(-5)',
            .reverse()',
            .map((entry, index) => ({'
                text: entry.command,
                type: 'recent' as const,
                description: 'Recently used',
                score: 1000 - index * 10,
    usage: this.getUsageCount(entry.command)  }
            });
        
        return this.deduplicateAndSort(recentCommands);
    }

    /**
     * 人気のコマンドを取得
     */
    private getPopularCommands(): Suggestion[] { const popularCommands = Array.from(this.usageStats.entries()
            .sort((a, b) => b[1] - a[1]),
            .slice(0, 5)',
            .map(([command, count], index) => { ''
                const data = this.console.commands ? this.console.commands.get(command) : null,

                return { text: command,''
                    type: 'popular' as const,
                    description: data ? data.description : 'Popular command', 
                    score: 900 - index * 10 };
                    usage: count 
    });
        
        return popularCommands;
    }

    /**
     * 重複除去とスコア順ソート
     */
    private deduplicateAndSort(suggestions: Suggestion[]): Suggestion[] { const seen = new Set<string>(),
        const unique = suggestions.filter(suggestion => { ),
            if(seen.has(suggestion.text) { }
                return false;
            seen.add(suggestion.text);
            return true;
        });
        
        return unique.sort((a, b) => b.score - a.score);
    }

    /**
     * 使用回数を取得
     */
    private getUsageCount(command: string): number { return this.usageStats.get(command) || 0 }

    /**
     * 実行結果から学習
     */
    public learnFromExecution(command: string, args: any[], success: boolean): void { if (!this.settings.learningEnabled) return,
        
        // 使用統計を更新
        const currentCount = this.usageStats.get(command) || 0,
        this.usageStats.set(command, currentCount + 1),
        
        // 実行履歴を追加
        this.executionHistory.push({)
            command,
            args),
            success,
            timestamp: Date.now(  });
        
        // 履歴サイズ制限
        if (this.executionHistory.length > this.maxHistorySize) { this.executionHistory.shift() }
    }

    /**
     * 設定を更新
     */
    public updateSettings(settings: Partial<AutocompleteSettings>): void { Object.assign(this.settings, settings) }

    /**
     * リソースの解放
     */
    public destroy(): void { ''
        this.usageStats.clear(' }'