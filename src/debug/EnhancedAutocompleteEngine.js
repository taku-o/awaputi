/**
 * Enhanced Autocomplete Engine
 * 高度な自動補完機能とコンテキスト支援を提供
 */

export class EnhancedAutocompleteEngine {
    constructor(console, gameEngine) {
        this.console = console;
        this.gameEngine = gameEngine;
        
        // 補完データ
        this.completionCache = new Map();
        this.contextualSuggestions = new Map();
        this.recentCommands = [];
        this.maxRecentCommands = 50;
        
        // 学習機能
        this.frequencyMap = new Map();
        this.contextPatterns = new Map();
        
        // 設定
        this.maxSuggestions = 20;
        this.fuzzyMatchThreshold = 0.6;
        this.enableSmartSuggestions = true;
        this.enableContextualHelp = true;
        
        this.initialize();
    }

    initialize() {
        this.buildCompletionData();
        this.loadLearningData();
    }

    /**
     * 補完候補の取得
     */
    getSuggestions(input, cursorPosition = null) {
        const position = cursorPosition !== null ? cursorPosition : input.length;
        const beforeCursor = input.substring(0, position);
        const afterCursor = input.substring(position);
        
        const context = this.analyzeContext(beforeCursor, afterCursor);
        const suggestions = this.generateSuggestions(context);
        
        // 学習データに基づくスコアリング
        const scoredSuggestions = this.scoreSuggestions(suggestions, context);
        
        // ソートと制限
        return scoredSuggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, this.maxSuggestions);
    }

    /**
     * コンテキスト分析
     */
    analyzeContext(beforeCursor, afterCursor) {
        const parts = beforeCursor.trim().split(/\s+/);
        const commandName = parts[0] || '';
        const args = parts.slice(1);
        const currentArg = parts[parts.length - 1] || '';
        const argIndex = Math.max(0, args.length - 1);
        
        const context = {
            type: this.determineContextType(commandName, args),
            commandName,
            args,
            currentArg,
            argIndex,
            beforeCursor,
            afterCursor,
            isComplete: beforeCursor.endsWith(' '),
            position: beforeCursor.length
        };
        
        return context;
    }

    /**
     * コンテキストタイプの決定
     */
    determineContextType(commandName, args) {
        if (!commandName) return 'command';
        
        const command = this.console.commands.get(commandName);
        if (!command) return 'unknown';
        
        if (args.length === 0) return 'first_arg';
        
        // パラメータベースの判定
        if (command.parameters && command.parameters[args.length - 1]) {
            const param = command.parameters[args.length - 1];
            return param.type || 'generic_arg';
        }
        
        return 'generic_arg';
    }

    /**
     * 補完候補の生成
     */
    generateSuggestions(context) {
        const suggestions = [];
        
        switch (context.type) {
            case 'command':
                suggestions.push(...this.getCommandSuggestions(context));
                break;
            case 'first_arg':
            case 'generic_arg':
                suggestions.push(...this.getArgumentSuggestions(context));
                break;
            case 'string':
                suggestions.push(...this.getStringSuggestions(context));
                break;
            case 'number':
                suggestions.push(...this.getNumberSuggestions(context));
                break;
            case 'boolean':
                suggestions.push(...this.getBooleanSuggestions(context));
                break;
            default:
                suggestions.push(...this.getGenericSuggestions(context));
        }
        
        // コンテキスト固有の追加候補
        if (this.enableSmartSuggestions) {
            suggestions.push(...this.getSmartSuggestions(context));
        }
        
        return suggestions;
    }

    /**
     * コマンド補完候補
     */
    getCommandSuggestions(context) {
        const suggestions = [];
        const partial = context.currentArg.toLowerCase();
        
        // 完全一致
        for (const [command, data] of this.console.commands) {
            if (command.toLowerCase().startsWith(partial) && !data.hidden) {
                suggestions.push({
                    text: command,
                    type: 'command',
                    description: data.description,
                    usage: data.usage,
                    category: data.group || 'other',
                    score: this.calculateBaseScore(command, partial, 'exact')
                });
            }
        }
        
        // エイリアス
        for (const [alias, command] of this.console.aliases) {
            if (alias.toLowerCase().startsWith(partial)) {
                const data = this.console.commands.get(command);
                if (data && !data.hidden) {
                    suggestions.push({
                        text: alias,
                        type: 'alias',
                        description: `Alias for ${command}`,
                        category: 'alias',
                        score: this.calculateBaseScore(alias, partial, 'exact')
                    });
                }
            }
        }
        
        // ファジー一致
        if (partial.length >= 2) {
            for (const [command, data] of this.console.commands) {
                if (!command.toLowerCase().startsWith(partial) && !data.hidden) {
                    const fuzzyScore = this.calculateFuzzyScore(command, partial);
                    if (fuzzyScore >= this.fuzzyMatchThreshold) {
                        suggestions.push({
                            text: command,
                            type: 'command_fuzzy',
                            description: data.description,
                            usage: data.usage,
                            category: data.group || 'other',
                            score: this.calculateBaseScore(command, partial, 'fuzzy') * fuzzyScore
                        });
                    }
                }
            }
        }
        
        return suggestions;
    }

    /**
     * 引数補完候補
     */
    getArgumentSuggestions(context) {
        const suggestions = [];
        const command = this.console.commands.get(context.commandName);
        
        if (!command || !command.parameters) {
            return suggestions;
        }
        
        const param = command.parameters[context.argIndex];
        if (!param) return suggestions;
        
        // パラメータタイプ別の候補
        switch (param.type) {
            case 'string':
                suggestions.push(...this.getStringSuggestions(context, param));
                break;
            case 'number':
                suggestions.push(...this.getNumberSuggestions(context, param));
                break;
            case 'boolean':
                suggestions.push(...this.getBooleanSuggestions(context, param));
                break;
            default:
                // カスタム候補があれば使用
                if (param.suggestions) {
                    suggestions.push(...param.suggestions.map(s => ({
                        text: s,
                        type: 'parameter_suggestion',
                        description: `${param.name} parameter`,
                        category: 'parameter',
                        score: this.calculateBaseScore(s, context.currentArg, 'exact')
                    })));
                }
        }
        
        // コマンド固有の候補
        suggestions.push(...this.getCommandSpecificSuggestions(context, param));
        
        return suggestions;
    }

    /**
     * 文字列補完候補
     */
    getStringSuggestions(context, param = null) {
        const suggestions = [];
        
        // 履歴からの候補
        const historyValues = this.getHistoryValues(context.commandName, context.argIndex);
        for (const value of historyValues) {
            if (value.toLowerCase().includes(context.currentArg.toLowerCase())) {
                suggestions.push({
                    text: `"${value}"`,
                    type: 'history_value',
                    description: 'From command history',
                    category: 'history',
                    score: this.calculateBaseScore(value, context.currentArg, 'contains')
                });
            }
        }
        
        // パラメータ固有の候補
        if (param && param.suggestions) {
            for (const suggestion of param.suggestions) {
                if (suggestion.toLowerCase().includes(context.currentArg.toLowerCase())) {
                    suggestions.push({
                        text: `"${suggestion}"`,
                        type: 'parameter_value',
                        description: param.description || 'Parameter value',
                        category: 'parameter',
                        score: this.calculateBaseScore(suggestion, context.currentArg, 'contains')
                    });
                }
            }
        }
        
        return suggestions;
    }

    /**
     * 数値補完候補
     */
    getNumberSuggestions(context, param = null) {
        const suggestions = [];
        
        // よく使われる数値
        const commonNumbers = [0, 1, 10, 25, 50, 100, 255, 1000];
        
        for (const num of commonNumbers) {
            const numStr = num.toString();
            if (numStr.startsWith(context.currentArg) || context.currentArg === '') {
                suggestions.push({
                    text: numStr,
                    type: 'number_common',
                    description: 'Common number value',
                    category: 'number',
                    score: this.calculateBaseScore(numStr, context.currentArg, 'exact')
                });
            }
        }
        
        // パラメータ固有の範囲
        if (param) {
            if (param.min !== undefined && param.max !== undefined) {
                const range = Math.min(10, param.max - param.min + 1);
                for (let i = 0; i < range; i++) {
                    const value = param.min + i;
                    const valueStr = value.toString();
                    if (valueStr.startsWith(context.currentArg) || context.currentArg === '') {
                        suggestions.push({
                            text: valueStr,
                            type: 'number_range',
                            description: `Value in range [${param.min}, ${param.max}]`,
                            category: 'number',
                            score: this.calculateBaseScore(valueStr, context.currentArg, 'exact')
                        });
                    }
                }
            }
        }
        
        return suggestions;
    }

    /**
     * ブール値補完候補
     */
    getBooleanSuggestions(context, param = null) {
        const booleanValues = ['true', 'false', '1', '0', 'on', 'off', 'yes', 'no'];
        return booleanValues
            .filter(val => val.startsWith(context.currentArg.toLowerCase()) || context.currentArg === '')
            .map(val => ({
                text: val,
                type: 'boolean_value',
                description: 'Boolean value',
                category: 'boolean',
                score: this.calculateBaseScore(val, context.currentArg, 'exact')
            }));
    }

    /**
     * 汎用補完候補
     */
    getGenericSuggestions(context) {
        const suggestions = [];
        
        // 変数の補完
        for (const variable of this.console.context.getVariableNames()) {
            if (variable.toLowerCase().includes(context.currentArg.toLowerCase())) {
                const value = this.console.context.getVariable(variable);
                suggestions.push({
                    text: variable,
                    type: 'variable',
                    description: `Variable (${typeof value}): ${value}`,
                    category: 'variable',
                    score: this.calculateBaseScore(variable, context.currentArg, 'contains')
                });
            }
        }
        
        return suggestions;
    }

    /**
     * スマート補完候補（文脈考慮）
     */
    getSmartSuggestions(context) {
        const suggestions = [];
        
        // 最近使用したコマンドパターン
        const recentPattern = this.findRecentPattern(context);
        if (recentPattern) {
            suggestions.push(...recentPattern);
        }
        
        // コマンドシーケンス予測
        const sequencePrediction = this.predictCommandSequence(context);
        if (sequencePrediction) {
            suggestions.push(...sequencePrediction);
        }
        
        return suggestions;
    }

    /**
     * コマンド固有の補完候補
     */
    getCommandSpecificSuggestions(context, param) {
        const suggestions = [];
        
        // config コマンドの特別処理
        if (context.commandName.startsWith('config.')) {
            suggestions.push(...this.getConfigSuggestions(context, param));
        }
        
        // game コマンドの特別処理
        if (context.commandName.startsWith('game.')) {
            suggestions.push(...this.getGameSuggestions(context, param));
        }
        
        return suggestions;
    }

    /**
     * 設定コマンドの補完候補
     */
    getConfigSuggestions(context, param) {
        const suggestions = [];
        
        if (context.commandName === 'config.get' || context.commandName === 'config.set') {
            // 設定パスの候補
            const configPaths = [
                'game.scoring.baseScores.normal',
                'game.scoring.baseScores.stone',
                'game.scoring.baseScores.rainbow',
                'audio.volume.master',
                'audio.volume.effects',
                'performance.targetFPS',
                'performance.qualityLevel',
                'debug.enabled',
                'ui.language'
            ];
            
            for (const path of configPaths) {
                if (path.toLowerCase().includes(context.currentArg.toLowerCase())) {
                    suggestions.push({
                        text: path,
                        type: 'config_path',
                        description: 'Configuration path',
                        category: 'config',
                        score: this.calculateBaseScore(path, context.currentArg, 'contains')
                    });
                }
            }
        }
        
        return suggestions;
    }

    /**
     * ゲームコマンドの補完候補
     */
    getGameSuggestions(context, param) {
        const suggestions = [];
        
        if (context.commandName === 'game.setScore' || context.commandName === 'game.addScore') {
            // よく使われるスコア値
            const commonScores = [100, 500, 1000, 2500, 5000, 10000];
            for (const score of commonScores) {
                const scoreStr = score.toString();
                if (scoreStr.startsWith(context.currentArg) || context.currentArg === '') {
                    suggestions.push({
                        text: scoreStr,
                        type: 'game_score',
                        description: 'Common score value',
                        category: 'game',
                        score: this.calculateBaseScore(scoreStr, context.currentArg, 'exact')
                    });
                }
            }
        }
        
        return suggestions;
    }

    /**
     * 基本スコア計算
     */
    calculateBaseScore(text, partial, matchType) {
        let score = 0;
        
        switch (matchType) {
            case 'exact':
                if (text.toLowerCase().startsWith(partial.toLowerCase())) {
                    score = 100 - (text.length - partial.length);
                }
                break;
            case 'contains':
                if (text.toLowerCase().includes(partial.toLowerCase())) {
                    const index = text.toLowerCase().indexOf(partial.toLowerCase());
                    score = 50 - index;
                }
                break;
            case 'fuzzy':
                score = this.calculateFuzzyScore(text, partial) * 30;
                break;
        }
        
        // 頻度による調整
        const frequency = this.frequencyMap.get(text) || 0;
        score += Math.min(frequency * 2, 20);
        
        return Math.max(0, score);
    }

    /**
     * ファジースコア計算
     */
    calculateFuzzyScore(text, partial) {
        const textLower = text.toLowerCase();
        const partialLower = partial.toLowerCase();
        
        let matches = 0;
        let partialIndex = 0;
        
        for (let i = 0; i < textLower.length && partialIndex < partialLower.length; i++) {
            if (textLower[i] === partialLower[partialIndex]) {
                matches++;
                partialIndex++;
            }
        }
        
        return matches / partialLower.length;
    }

    /**
     * 候補のスコアリング
     */
    scoreSuggestions(suggestions, context) {
        return suggestions.map(suggestion => {
            let score = suggestion.score || 0;
            
            // カテゴリボーナス
            const categoryBonus = {
                'command': 10,
                'parameter': 8,
                'history': 5,
                'variable': 3,
                'alias': 2
            };
            
            score += categoryBonus[suggestion.category] || 0;
            
            // 最近使用した項目のボーナス
            if (this.recentCommands.includes(suggestion.text)) {
                score += 15;
            }
            
            return { ...suggestion, score };
        });
    }

    /**
     * 履歴から値を取得
     */
    getHistoryValues(commandName, argIndex) {
        const values = new Set();
        
        for (const historyEntry of this.console.history) {
            const parts = historyEntry.trim().split(/\s+/);
            if (parts[0] === commandName && parts[argIndex + 1]) {
                values.add(parts[argIndex + 1].replace(/^["']|["']$/g, ''));
            }
        }
        
        return Array.from(values);
    }

    /**
     * 最近のパターンを検索
     */
    findRecentPattern(context) {
        // 実装は簡略化
        return [];
    }

    /**
     * コマンドシーケンス予測
     */
    predictCommandSequence(context) {
        // 実装は簡略化
        return [];
    }

    /**
     * コマンド実行の学習
     */
    learnFromExecution(command, args, success) {
        // 頻度を更新
        this.frequencyMap.set(command, (this.frequencyMap.get(command) || 0) + 1);
        
        // 最近のコマンドを更新
        this.recentCommands.unshift(command);
        if (this.recentCommands.length > this.maxRecentCommands) {
            this.recentCommands.pop();
        }
        
        // パターンを学習
        const pattern = `${command} ${args.join(' ')}`.trim();
        this.contextPatterns.set(pattern, (this.contextPatterns.get(pattern) || 0) + 1);
        
        this.saveLearningData();
    }

    /**
     * 補完データの構築
     */
    buildCompletionData() {
        // 基本的な補完データを準備
        this.completionCache.clear();
        
        // コマンドベースの補完データ
        for (const [command, data] of this.console.commands) {
            this.completionCache.set(`command:${command}`, {
                type: 'command',
                data: data
            });
        }
    }

    /**
     * 学習データの保存
     */
    saveLearningData() {
        try {
            const learningData = {
                frequencyMap: Array.from(this.frequencyMap.entries()),
                contextPatterns: Array.from(this.contextPatterns.entries()),
                recentCommands: this.recentCommands
            };
            
            localStorage.setItem('debug-console-learning', JSON.stringify(learningData));
        } catch (error) {
            console.warn('Failed to save autocomplete learning data:', error);
        }
    }

    /**
     * 学習データの読み込み
     */
    loadLearningData() {
        try {
            const saved = localStorage.getItem('debug-console-learning');
            if (saved) {
                const learningData = JSON.parse(saved);
                
                this.frequencyMap = new Map(learningData.frequencyMap || []);
                this.contextPatterns = new Map(learningData.contextPatterns || []);
                this.recentCommands = learningData.recentCommands || [];
            }
        } catch (error) {
            console.warn('Failed to load autocomplete learning data:', error);
        }
    }

    /**
     * 設定の更新
     */
    updateSettings(settings) {
        this.maxSuggestions = settings.maxSuggestions ?? this.maxSuggestions;
        this.fuzzyMatchThreshold = settings.fuzzyMatchThreshold ?? this.fuzzyMatchThreshold;
        this.enableSmartSuggestions = settings.enableSmartSuggestions ?? this.enableSmartSuggestions;
        this.enableContextualHelp = settings.enableContextualHelp ?? this.enableContextualHelp;
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.saveLearningData();
        this.completionCache.clear();
        this.contextualSuggestions.clear();
        this.frequencyMap.clear();
        this.contextPatterns.clear();
        this.recentCommands = [];
    }
}

export default EnhancedAutocompleteEngine;