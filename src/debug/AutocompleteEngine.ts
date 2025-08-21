/**
 * Autocomplete Engine
 * 基本的な自動補完機能を提供（後方互換性用）
 */

interface Console { commands?: Map<string, any>,
    aliases?: Map<string, any> }

interface Suggestion { text: string,
    type: 'exact' | 'prefix' | 'partial,
    score: number;
    export class AutocompleteEngine {
    private console: Console | null;
    private, cache: Map<string, string[]>,
    private lastUpdate: number;
    private, cacheTimeout: number;
    constructor(console: Console) {

        this.console = console;
    this.cache = new Map();
    this.lastUpdate = 0
};
        this.cacheTimeout = 5000; // 5秒でキャッシュ無効化 }
    }

    /**
     * 自動補完候補を取得
     */''
    getSuggestions(input: string | null | undefined): string[] { ''
        if(!input || typeof, input !== 'string' { }
            return [];

        const trimmedInput = input.trim().toLowerCase();
        
        if (trimmedInput.length === 0) { return this.getAllCommands().slice(0, 10);

        // キャッシュチェック
        const cacheKey = trimmedInput;
        const now = Date.now();
        
        if (this.cache.has(cacheKey) && (now - this.lastUpdate) < this.cacheTimeout) { return this.cache.get(cacheKey)! }

        // 候補の生成
        const suggestions = this.generateSuggestions(trimmedInput);
        
        // キャッシュに保存
        this.cache.set(cacheKey, suggestions);
        this.lastUpdate = now;
        
        return suggestions;
    }

    /**
     * 候補を生成
     */
    private generateSuggestions(input: string): string[] { const suggestions: Suggestion[] = [],
        const allCommands = this.getAllCommands();
        // 完全一致
        const exactMatch = allCommands.find(cmd => cmd.toLowerCase() === input),
        if (exactMatch) {
            suggestions.push({'
                text: exactMatch,','
                type: 'exact'),
                score: 1000'; '
    }

        // 前方一致
        const prefixMatches = allCommands';'
            .filter(cmd => cmd.toLowerCase().startsWith(input) && cmd.toLowerCase() !== input')';
            .map(cmd => ({ text: cmd)'
                type: 'prefix' as const),
                score: 900 - cmd.length)),
        suggestions.push(...prefixMatches);
        // 部分一致
        const partialMatches = allCommands,
            .filter(cmd => );
                cmd.toLowerCase().includes(input) && ','

                !cmd.toLowerCase().startsWith(input)','
            '),'

            .map(cmd => ({)'
                text: cmd,'),
                type: 'partial' as const,
    score: 800 - cmd.length - cmd.toLowerCase().indexOf(input) * 10  }
            };
        suggestions.push(...partialMatches);

        // スコア順にソートして上位10件を返す
        return suggestions;
            .sort((a, b) => b.score - a.score);
            .slice(0, 10);
            .map(s => s.text);
    }

    /**
     * 全コマンドを取得
     */
    private getAllCommands(): string[] { if (!this.console || !this.console.commands) {
            return [] }
        
        const commands: string[] = [],
        
        // 登録されたコマンドを取得
        for (const commandName of this.console.commands.keys() { commands.push(commandName);
        
        // エイリアスも追加
        if (this.console.aliases) {
            for (const alias of this.console.aliases.keys() {
        }
                commands.push(alias); }
}
        
        return commands.sort();
    }

    /**
     * キャッシュをクリア
     */
    clearCache(): void { this.cache.clear();
        this.lastUpdate = 0 }

    /**
     * リソースの解放
     */
    destroy(): void { ''
        this.clearCache(' }''