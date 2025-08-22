/**
 * Autocomplete Engine
 * 基本的な自動補完機能を提供（後方互換性用）
 */

interface Console {
    commands?: Map<string, any>;
    aliases?: Map<string, any>;
}

interface Suggestion {
    text: string;
    type: 'exact' | 'prefix' | 'partial';
    score: number;
}

export class AutocompleteEngine {
    private console: Console | null;
    private cache: Map<string, string[]>;
    private lastUpdate: number;
    private cacheTimeout: number;

    constructor(console: Console) {
        this.console = console;
        this.cache = new Map();
        this.lastUpdate = 0;
        this.cacheTimeout = 5000; // 5秒でキャッシュ無効化
    }

    /**
     * 自動補完候補を取得
     */
    getSuggestions(input: string | null | undefined): string[] {
        if (!input || typeof input !== 'string') {
            return [];
        }

        const now = Date.now();
        if (now - this.lastUpdate > this.cacheTimeout) {
            this.cache.clear();
        }

        const cacheKey = input.toLowerCase();
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey) || [];
        }

        const suggestions = this.generateSuggestions(input);
        this.cache.set(cacheKey, suggestions);
        this.lastUpdate = now;

        return suggestions;
    }

    /**
     * 補完候補生成
     */
    private generateSuggestions(input: string): string[] {
        const suggestions: string[] = [];
        
        if (!this.console) {
            return suggestions;
        }

        const inputLower = input.toLowerCase();

        // コマンド検索
        if (this.console.commands) {
            for (const [command] of this.console.commands) {
                if (command.toLowerCase().startsWith(inputLower)) {
                    suggestions.push(command);
                }
            }
        }

        // エイリアス検索
        if (this.console.aliases) {
            for (const [alias] of this.console.aliases) {
                if (alias.toLowerCase().startsWith(inputLower)) {
                    suggestions.push(alias);
                }
            }
        }

        return suggestions.sort();
    }

    /**
     * キャッシュクリア
     */
    clearCache(): void {
        this.cache.clear();
        this.lastUpdate = 0;
    }

    /**
     * 統計情報取得
     */
    getStatistics(): { cacheSize: number; lastUpdate: number } {
        return {
            cacheSize: this.cache.size,
            lastUpdate: this.lastUpdate
        };
    }
}

export default AutocompleteEngine;