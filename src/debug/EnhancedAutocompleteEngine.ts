/**
 * Enhanced Autocomplete Engine
 * 拡張自動補完エンジン
 */

interface Console {
    commands?: Map<string, CommandData>;
}

interface CommandData {
    description: string;
    hidden?: boolean;
}

interface GameEngine {
    // Game engine interface
    getCurrentState?(): any;
    getComponents?(): string[];
}

interface AutocompleteSettings {
    maxSuggestions: number;
    fuzzyMatch: boolean;
    contextAware: boolean;
    learningEnabled: boolean;
}

interface Suggestion {
    text: string;
    type: 'command' | 'recent' | 'popular';
    description: string;
    score: number;
    usage: number;
}

interface ExecutionHistoryEntry {
    command: string;
    args: any[];
    success: boolean;
    timestamp: number;
}

export class EnhancedAutocompleteEngine {
    private console: Console;
    private gameEngine: GameEngine;
    private settings: AutocompleteSettings;
    private usageStats: Map<string, number>;
    private executionHistory: ExecutionHistoryEntry[];
    private maxHistorySize: number;

    constructor(console: Console, gameEngine: GameEngine) {
        this.console = console;
        this.gameEngine = gameEngine;
        this.settings = {
            maxSuggestions: 10,
            fuzzyMatch: true,
            contextAware: true,
            learningEnabled: true
        };
        this.usageStats = new Map<string, number>();
        this.executionHistory = [];
        this.maxHistorySize = 100;
    }

    /**
     * 拡張された自動補完候補を取得
     */
    getSuggestions(input: string, context?: any): Suggestion[] {
        if (!input || input.trim().length === 0) {
            return this.getRecentCommands();
        }

        const suggestions: Suggestion[] = [];

        // 基本コマンド候補
        const commandSuggestions = this.getCommandSuggestions(input);
        suggestions.push(...commandSuggestions);

        // 最近使用したコマンド候補
        if (this.settings.learningEnabled) {
            const recentSuggestions = this.getRecentSuggestions(input);
            suggestions.push(...recentSuggestions);
        }

        // コンテキスト対応候補
        if (this.settings.contextAware && context) {
            const contextSuggestions = this.getContextSuggestions(input, context);
            suggestions.push(...contextSuggestions);
        }

        // ファジーマッチング候補
        if (this.settings.fuzzyMatch) {
            const fuzzyMatches = this.getFuzzyMatches(input);
            suggestions.push(...fuzzyMatches);
        }

        // 重複除去とスコアリング
        const uniqueSuggestions = this.deduplicateAndScore(suggestions);

        // ソートして上位候補を返す
        return uniqueSuggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, this.settings.maxSuggestions);
    }

    /**
     * コマンド実行履歴を記録
     */
    recordExecution(command: string, args: any[], success: boolean): void {
        if (!this.settings.learningEnabled) return;

        const entry: ExecutionHistoryEntry = {
            command,
            args,
            success,
            timestamp: Date.now()
        };

        this.executionHistory.push(entry);

        // 履歴サイズ制限
        if (this.executionHistory.length > this.maxHistorySize) {
            this.executionHistory.shift();
        }

        // 使用統計を更新
        this.updateUsageStats(command, success);
    }

    /**
     * 基本コマンド候補を取得
     */
    private getCommandSuggestions(input: string): Suggestion[] {
        const suggestions: Suggestion[] = [];
        
        if (!this.console.commands) return suggestions;

        const inputLower = input.toLowerCase();

        for (const [commandName, commandData] of this.console.commands) {
            if (commandData.hidden) continue;

            if (commandName.toLowerCase().startsWith(inputLower)) {
                const usage = this.usageStats.get(commandName) || 0;
                const suggestion: Suggestion = {
                    text: commandName,
                    type: 'command',
                    description: commandData.description,
                    score: this.calculateCommandScore(commandName, input, usage),
                    usage
                };
                suggestions.push(suggestion);
            }
        }

        return suggestions;
    }

    /**
     * 最近使用したコマンド候補を取得
     */
    private getRecentSuggestions(input: string): Suggestion[] {
        const suggestions: Suggestion[] = [];
        const inputLower = input.toLowerCase();

        // 最近成功したコマンドを取得
        const recentCommands = this.executionHistory
            .filter(entry => entry.success && entry.command.toLowerCase().includes(inputLower))
            .slice(-10)
            .reverse();

        for (const entry of recentCommands) {
            const usage = this.usageStats.get(entry.command) || 0;
            const suggestion: Suggestion = {
                text: entry.command,
                type: 'recent',
                description: `Recently used (${this.formatTimestamp(entry.timestamp)})`,
                score: this.calculateRecentScore(entry, input),
                usage
            };
            suggestions.push(suggestion);
        }

        return suggestions;
    }

    /**
     * 最近のコマンド一覧を取得（入力なしの場合）
     */
    private getRecentCommands(): Suggestion[] {
        const suggestions: Suggestion[] = [];

        // 最近成功したユニークなコマンドを取得
        const recentUniqueCommands = new Map<string, ExecutionHistoryEntry>();
        
        for (let i = this.executionHistory.length - 1; i >= 0; i--) {
            const entry = this.executionHistory[i];
            if (entry.success && !recentUniqueCommands.has(entry.command)) {
                recentUniqueCommands.set(entry.command, entry);
                if (recentUniqueCommands.size >= 5) break;
            }
        }

        for (const [command, entry] of recentUniqueCommands) {
            const usage = this.usageStats.get(command) || 0;
            const suggestion: Suggestion = {
                text: command,
                type: 'recent',
                description: `Recently used (${this.formatTimestamp(entry.timestamp)})`,
                score: 100 + usage,
                usage
            };
            suggestions.push(suggestion);
        }

        return suggestions;
    }

    /**
     * コンテキスト対応候補を取得
     */
    private getContextSuggestions(input: string, context: any): Suggestion[] {
        const suggestions: Suggestion[] = [];
        
        // ゲームエンジンのコンテキストを活用
        if (this.gameEngine.getComponents) {
            const components = this.gameEngine.getComponents();
            const inputLower = input.toLowerCase();

            for (const component of components) {
                if (component.toLowerCase().includes(inputLower)) {
                    const suggestion: Suggestion = {
                        text: `inspect ${component}`,
                        type: 'command',
                        description: `Inspect ${component} component`,
                        score: this.calculateContextScore(component, input),
                        usage: 0
                    };
                    suggestions.push(suggestion);
                }
            }
        }

        return suggestions;
    }

    /**
     * ファジーマッチング候補を取得
     */
    private getFuzzyMatches(input: string): Suggestion[] {
        const suggestions: Suggestion[] = [];
        
        if (!this.console.commands) return suggestions;

        const inputLower = input.toLowerCase();

        for (const [commandName, commandData] of this.console.commands) {
            if (commandData.hidden) continue;

            const fuzzyScore = this.calculateFuzzyScore(commandName.toLowerCase(), inputLower);
            
            if (fuzzyScore > 0.3) { // 閾値
                const usage = this.usageStats.get(commandName) || 0;
                const suggestion: Suggestion = {
                    text: commandName,
                    type: 'command',
                    description: `${commandData.description} (fuzzy match)`,
                    score: fuzzyScore * 50 + usage,
                    usage
                };
                suggestions.push(suggestion);
            }
        }

        return suggestions;
    }

    /**
     * 候補の重複除去とスコア調整
     */
    private deduplicateAndScore(suggestions: Suggestion[]): Suggestion[] {
        const uniqueMap = new Map<string, Suggestion>();

        for (const suggestion of suggestions) {
            const existing = uniqueMap.get(suggestion.text);
            
            if (!existing || suggestion.score > existing.score) {
                uniqueMap.set(suggestion.text, suggestion);
            }
        }

        return Array.from(uniqueMap.values());
    }

    /**
     * 使用統計を更新
     */
    private updateUsageStats(command: string, success: boolean): void {
        if (!success) return;

        const currentCount = this.usageStats.get(command) || 0;
        this.usageStats.set(command, currentCount + 1);
    }

    /**
     * コマンドスコアを計算
     */
    private calculateCommandScore(command: string, input: string, usage: number): number {
        const exactMatch = command.toLowerCase() === input.toLowerCase();
        const prefixMatch = command.toLowerCase().startsWith(input.toLowerCase());
        
        let score = 0;
        
        if (exactMatch) {
            score += 100;
        } else if (prefixMatch) {
            score += 80;
        }
        
        score += Math.min(usage, 50); // 使用回数ボーナス（最大50）
        
        return score;
    }

    /**
     * 最近使用したコマンドのスコアを計算
     */
    private calculateRecentScore(entry: ExecutionHistoryEntry, input: string): number {
        const timeDiff = Date.now() - entry.timestamp;
        const hoursSinceUsed = timeDiff / (1000 * 60 * 60);
        
        // 最近使用したほど高スコア
        const timeScore = Math.max(0, 50 - hoursSinceUsed);
        
        // マッチ度合い
        const matchScore = entry.command.toLowerCase().includes(input.toLowerCase()) ? 30 : 0;
        
        return timeScore + matchScore;
    }

    /**
     * コンテキストスコアを計算
     */
    private calculateContextScore(component: string, input: string): number {
        const inputLower = input.toLowerCase();
        const componentLower = component.toLowerCase();
        
        if (componentLower.startsWith(inputLower)) {
            return 60;
        } else if (componentLower.includes(inputLower)) {
            return 40;
        }
        
        return 20;
    }

    /**
     * ファジーマッチングスコアを計算
     */
    private calculateFuzzyScore(target: string, input: string): number {
        if (target.includes(input)) {
            return 0.8;
        }

        // 簡単なファジーマッチング（Levenshtein距離ベース）
        const distance = this.levenshteinDistance(target, input);
        const maxLength = Math.max(target.length, input.length);
        
        return 1 - (distance / maxLength);
    }

    /**
     * Levenshtein距離を計算
     */
    private levenshteinDistance(str1: string, str2: string): number {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

        for (let i = 0; i <= str1.length; i++) {
            matrix[0][i] = i;
        }

        for (let j = 0; j <= str2.length; j++) {
            matrix[j][0] = j;
        }

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + cost
                );
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * タイムスタンプをフォーマット
     */
    private formatTimestamp(timestamp: number): string {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) {
            return 'just now';
        } else if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}m ago`;
        } else {
            return `${Math.floor(diff / 3600000)}h ago`;
        }
    }

    /**
     * 設定を更新
     */
    updateSettings(newSettings: Partial<AutocompleteSettings>): void {
        this.settings = { ...this.settings, ...newSettings };
        console.log('Enhanced autocomplete settings updated');
    }

    /**
     * 統計情報を取得
     */
    getStatistics(): {
        totalCommands: number;
        usageStats: Record<string, number>;
        historySize: number;
        successfulExecutions: number;
    } {
        const successfulExecutions = this.executionHistory.filter(entry => entry.success).length;

        return {
            totalCommands: this.console.commands?.size || 0,
            usageStats: Object.fromEntries(this.usageStats),
            historySize: this.executionHistory.length,
            successfulExecutions
        };
    }

    /**
     * 学習データをリセット
     */
    resetLearning(): void {
        this.usageStats.clear();
        this.executionHistory = [];
        console.log('Enhanced autocomplete learning data reset');
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        this.usageStats.clear();
        this.executionHistory = [];
        console.log('EnhancedAutocompleteEngine destroyed');
    }
}

export default EnhancedAutocompleteEngine;