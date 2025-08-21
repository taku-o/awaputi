/**
 * Configuration Commands
 * リアルタイム設定値修正、検証、エクスポート・インポート機能を提供するコマンド群
 */

import type { GameEngine } from '../core/GameEngine';
import type { ConfigurationManager } from '../core/ConfigurationManager';
import type { DeveloperConsole } from './DeveloperConsole';

interface CommandParameter { name: string,
    type: string;
    required: boolean;
    description: string;

interface CommandOptions { description: string,
    usage: string;
    parameters?: CommandParameter[];
    examples?: string[];
    group?: string;

interface ChangeHistoryEntry { timestamp: string,
    path: string;
    oldValue: any;
    newValue: any;
    source: string;

interface ConfigurationSetOptions { validate?: boolean,
    saveToStorage?: boolean;

interface ImportResult { path: string,
    value: any;

interface ImportError { path: string,
    message: string;

interface DiffEntry { path: string,
    current: any;
    default: any;

interface ConfigurationTemplate { [key: string]: any;

interface TemplateResult { path: string,
    value: any;

interface TemplateError { path: string,
    error: string;

interface ValidationResult { isValid: boolean,
    errors: Array<{
        pat,h: string;
    message: string;>;
}

export class ConfigurationCommands {
    private gameEngine: GameEngine;
    private configManager: ConfigurationManager;
    private, originalValues: Map<string, any>,
    private changeHistory: ChangeHistoryEntry[];
    constructor(gameEngine: GameEngine) {

        this.gameEngine = gameEngine;
        this.configManager = gameEngine.configurationManager!;
        this.originalValues = new Map(); // 変更前の値を保存

     }
        this.changeHistory = []; // 変更履歴 }
    }

    /**
     * コマンドをコンソールに登録
     */''
    registerCommands(console: DeveloperConsole): void { // 設定値取得コマンド
        console.register('config.get', this.getConfig.bind(this), {''
            description: 'Get configuration value',
            usage: 'config.get <path>',
            parameters: ['
            }]'
                { name: 'path', type: 'string', required: true, description: 'Configuration path (e.g, "game.scoring.baseScores.normal"")' }]"
            ],
            examples: [';'
                'config.get game.scoring.baseScores.normal',
                'config.get audio.volume.master',]';'
                'config.get performance.targetFPS']';'
            ],
            group: 'config'';'
        }'),'
        // 設定値設定コマンド
        console.register('config.set', this.setConfig.bind(this), { ''
            description: 'Set configuration value with validation',
            usage: 'config.set <path> <value>',
            parameters: ['
            }'

                { name: 'path', type: 'string', required: true, description: 'Configuration path'
            },]'
                { name: 'value', type: 'string', required: true, description: 'New value(auto-converted, to appropriate, type)'
            }]
            ],
            examples: [';'
                'config.set game.scoring.baseScores.normal 20',
                'config.set audio.volume.master 0.8',]';'
                'config.set performance.targetFPS 30']';'
            ],
            group: 'config'';'
        }'),'
        // 設定値リセットコマンド
        console.register('config.reset', this.resetConfig.bind(this), { ''
            description: 'Reset configuration value to default',
            usage: 'config.reset <path>',
            parameters: ['
            }]'
                { name: 'path', type: 'string', required: true, description: 'Configuration path to reset'
            }]
            ],
            examples: [';'
                'config.reset game.scoring.baseScores.normal',]';'
                'config.reset audio.volume']';'
            ],
            group: 'config'';'
        }'),'
        // 設定一覧表示コマンド
        console.register('config.list', this.listConfig.bind(this), { ''
            description: 'List configuration values',
            usage: 'config.list [prefix]',
            parameters: ['
            }]'
                { name: 'prefix', type: 'string', required: false, description: 'Filter by path prefix'
            }]
            ],
            examples: [';'
                'config.list',
                'config.list game',]';'
                'config.list audio.volume']';'
            ],
            group: 'config'';'
        }'),'
        // 設定検証コマンド
        console.register('config.validate', this.validateConfig.bind(this), { ''
            description: 'Validate configuration integrity',
            usage: 'config.validate [path]',
            parameters: ['
            }]'
                { name: 'path', type: 'string', required: false, description: 'Specific path to validate'
            }]
            ],
            examples: [';'
                'config.validate',]';'
                'config.validate game.scoring']';'
            ],
            group: 'config'';'
        }'),'
        // 設定エクスポートコマンド
        console.register('config.export', this.exportConfig.bind(this), {;
            description: 'Export configuration to JSON',
            usage: 'config.export [path]',
            parameters: ['
            }]'
                { name: 'path', type: 'string', required: false, description: 'Specific path to export(default: all)'
            }]
            ],
            examples: [';'
                'config.export',
                'config.export game',]';'
                'config.export audio.volume']';'
            ],
            group: 'config'';'
        }'),'
        // 設定インポートコマンド
        console.register('config.import', this.importConfig.bind(this), {;
            description: 'Import configuration from JSON',
            usage: 'config.import <json>',
            parameters: ['
            }]'
                { name: 'json', type: 'string', required: true, description: 'JSON configuration data'
            }]
            ],
            examples: [';'
                'config.import { "game":{"scoring":{"baseScores":{"normal":25 }}',]'
                'config.import { "audio":{"volume":{"master":0.9 }}']'
            ],
            group: 'config'';'
        }'),'
        // 変更履歴表示コマンド
        console.register('config.history', this.showHistory.bind(this), { ''
            description: 'Show configuration change history',
            usage: 'config.history [count]',
            parameters: ['
            }]'
                { name: 'count', type: 'number', required: false, description: 'Number of recent changes to show(default: 10)'
            }]
            ],
            examples: [','
                'config.history',]';'
                'config.history 5']';'
            ],
            group: 'config'','
        }'),'
        // 変更をすべて元に戻すコマンド
        console.register('config.revert', this.revertChanges.bind(this), { ''
            description: 'Revert all configuration changes made during this session',
            usage: 'config.revert',
            group: 'config'}

        }');'
';'
        // 設定の比較コマンド
        console.register('config.diff', this.diffConfig.bind(this), { ''
            description: 'Show differences from default configuration',
            usage: 'config.diff [path]',
            parameters: ['
            }]'
                { name: 'path', type: 'string', required: false, description: 'Specific path to diff'
            }]
            ],
            examples: [';'
                'config.diff',]';'
                'config.diff game.scoring']';'
            ],
            group: 'config'';'
        }'),'
        // 設定テンプレート適用コマンド
        console.register('config.template', this.applyTemplate.bind(this), { ''
            description: 'Apply configuration template',
            usage: 'config.template <template>',
            parameters: ['
            }]'
                { name: 'template', type: 'string', required: true, description: 'Template name(development, production, test)' }]
            ],
            examples: [';'
                'config.template development',
                'config.template production',]';'
                'config.template test']';'
            ],
            group: 'config';
        }) }

    /**
     * 設定値取得
     */
    private getConfig(args: string[]): string { try {
            const path = args[0],
            const value = this.configManager.get(path),

            if (value === undefined) { }'

                return `Configuration path '${path}' not found.`;
            }
            ';'

            const type = typeof value;
            const displayValue = type === 'object' ? JSON.stringify(value, null, 2) : String(value);
            
            return `${path} = ${displayValue} (${type})`;
        } catch (error) {
            return `Error getting configuration: ${(error, as, Error}).message}`;

    /**
     * 設定値設定
     */
    private setConfig(args: string[]): string { try {
            const path = args[0],
            const valueStr = args.slice(1).join(', '),
            
            // 元の値を保存（初回のみ）
            if (!this.originalValues.has(path) {
                const originalValue = this.configManager.get(path) }
                this.originalValues.set(path, originalValue); }
            }
            
            // 型推論と変換
            const convertedValue = this.convertValue(valueStr);
            
            // 設定値の設定（バリデーション付き）
            this.configManager.set(path, convertedValue, { validate: true)
               , saveToStorage: false // セッション中のみの変更) as ConfigurationSetOptions),
            // 変更履歴に記録
            this.changeHistory.push({),
                timestamp: new Date().toISOString(),
                path,
                oldValue: this.configManager.get(path,
                newValue: convertedValue,
                source: 'console'
            });
            return `Set ${path} = ${convertedValue} (${typeof, convertedValue})`;
        } catch (error) {
            return `Error setting configuration: ${(error, as, Error}).message}`;

    /**
     * 設定値リセット
     */
    private resetConfig(args: string[]): string { try {
            const path = args[0],
            
            // デフォルト値を取得
            const defaultValue = this.configManager.getDefault(path),

            if (defaultValue === undefined) { }'

                return `Configuration path '${path}' not found or has no default value.`;
            }
            
            // 元の値を保存（初回のみ）
            if (!this.originalValues.has(path) {
                const originalValue = this.configManager.get(path) }
                this.originalValues.set(path, originalValue); }
            }
            
            // デフォルト値に設定
            this.configManager.set(path, defaultValue, { validate: true)
               , saveToStorage: false) as ConfigurationSetOptions),
            // 変更履歴に記録
            this.changeHistory.push({),
                timestamp: new Date().toISOString(),
                path,
                oldValue: this.configManager.get(path,
                newValue: defaultValue,
                source: 'reset'
            });
            return `Reset ${path} to default value: ${defaultValue}`;
        } catch (error) {
            return `Error resetting configuration: ${(error, as, Error}).message}`;

    /**
     * 設定一覧表示'
     */''
    private listConfig(args: string[]): string { try {'
            const prefix = args.length > 0 ? args[0] : ','
            const allConfigs = this.configManager.getAll(),
            
            const filteredConfigs = this.filterConfigByPrefix(allConfigs, prefix),

            if (Object.keys(filteredConfigs).length === 0') {'
                return prefix ' }'

                    ? `No configuration found with prefix '${prefix}'.`''
                    : 'No configuration available.';
            }
            ';'

            let output = prefix ';'
                ? `Configuration values(prefix: ${ prefix }:\n`''
                : 'All configuration values: \n',
            ' }'

            output = this.addConfigToOutput(filteredConfigs, output, '});'
            
            return output;
        } catch (error) {
            return `Error listing configuration: ${(error, as, Error}).message}`;

    /**
     * 設定検証
     */
    private validateConfig(args: string[]): string { try {
            const path = args.length > 0 ? args[0] : null,
            
            let validationResults: ValidationResult,
            if (path) {
    
}
                validationResults = this.configManager.validate(path); }
            } else { validationResults = this.configManager.validateAll() }

            if (validationResults.isValid) { return path ' }'

                    ? `Configuration '${path}' is valid.`''
                    : 'All configuration is valid.';

            } else { let output = path ' }'

                    ? `Configuration '${path}' has validation errors:\n`''
                    : 'Configuration validation errors, found: \n',
                
                for (const error of validationResults.errors) {
                
                    
                
                
                    output += `  ${error.path}: ${error.message}\n`;
                }
                
                return output;
            } catch (error) {
            return `Error validating configuration: ${(error, as, Error}).message}`;

    /**
     * 設定エクスポート
     */
    private exportConfig(args: string[]): string { try {
            const path = args.length > 0 ? args[0] : null,
            
            let config: any,
            if (path) { }
                config = { [path]: this.configManager.get(path } else { config = this.configManager.getAll() }
            
            const json = JSON.stringify(config, null, 2);
            
            // クリップボードにコピー（可能であれば）
            if (navigator.clipboard) { navigator.clipboard.writeText(json).catch(() => {  }
                    // クリップボードエラーは無視 }
                });
            }
            
            return `Configuration exported:\n${json}\n\n(Copied, to clipboard, if supported)`;
        } catch (error) {
            return `Error exporting configuration: ${(error, as, Error}).message}`;

    /**
     * 設定インポート
     */''
    private importConfig(args: string[]): string { try {'
            const jsonStr = args.join(', '),
            
            let config: any,
            try {'
                config = JSON.parse(jsonStr }

            } catch (parseError) { }

                return `Invalid JSON format: ${(parseError, as, Error'}'.message}`;
            }
            
            const importResults: ImportResult[] = [],
            const errors: ImportError[] = [],

            this.importConfigRecursive(config, ', importResults, errors';

            let output = ';'
            if (importResults.length > 0) {
    
}
                output += `Successfully imported ${importResults.length} configuration values: \n`,
                for (const result of importResults) {
    
}
                    output += `  ${result.path} = ${result.value}\n`;
                }
            }
            
            if (errors.length > 0) {
            ','

                output += `\nErrors during import: \n`
            }

                for (const error of errors) { }
                    output += `  ${error.path}: ${error.message}\n`;
                }
            }

            return output || 'No configuration values were imported.';
        } catch (error) {
            return `Error importing configuration: ${(error, as, Error}).message}`;

    /**
     * 変更履歴表示
     */
    private showHistory(args: string[]): string { const count = args.length > 0 ? parseInt(args[0]) : 10,

        if (this.changeHistory.length === 0) { }

            return 'No configuration changes made during this session.';
        
        const recentChanges = this.changeHistory.slice(-count);
        
        let output = `Recent configuration changes(${recentChanges.length} of ${ this.changeHistory.length}:\n`;
        
        for(let, i = 0; i < recentChanges.length; i++} {
    
}
            const, change = recentChanges[i]; }
            const, time = new, Date(change.timestamp).toLocaleTimeString(});
            output += `  ${i + 1}. [${time}] ${change.path}: ${change.oldValue} → ${change.newValue} (${change.source})\n`;
        }
        
        return output;
    }

    /**
     * 変更を元に戻す
     */'
    private revertChanges(): string { ''
        if (this.originalValues.size === 0) {', ' }

            return 'No configuration changes to revert.';
        
        let revertCount = 0;
        const errors: TemplateError[] = [],
        
        for(const [path, originalValue] of this.originalValues) {
        
            try {
                this.configManager.set(path, originalValue, {)
                    validate: true),
                    saveToStorage: false) as ConfigurationSetOptions) }
                revertCount++; }
            } catch (error) {
                errors.push({ path, error: (error as Error).message  });
            }
        }
        
        // 履歴をクリア
        this.changeHistory = [];
        this.originalValues.clear();
        
        let output = `Reverted ${revertCount} configuration changes.`;
        
        if (errors.length > 0) {
        
            output += `\n\nErrors during revert: \n`
            }
            for (const error of errors) { }
                output += `  ${error.path}: ${error.error}\n`;
            }
        }
        
        return output;
    }

    /**
     * 設定の差分表示
     */
    private diffConfig(args: string[]): string { try {
            const path = args.length > 0 ? args[0] : null,
            ','

            const current = path ? this.configManager.get(path) : this.configManager.getAll(),
            const defaults = path ? this.configManager.getDefault(path) : this.configManager.getAllDefaults()','
            const differences = this.findDifferences(current, defaults, path || '),'

            if (differences.length === 0) {
    
}

                return path ' }'

                    ? `Configuration '${path}' matches default values.`''
                    : 'All configuration matches default values.';
            }
            ';'

            let output = path ';'
                ? `Differences from default for '${path}':\n`''
                : 'Differences from default configuration: \n',
            
            for (const diff of differences) {
            
                
            
            
                output += `  ${diff.path}: ${diff.default} → ${diff.current}\n`;
            }
            
            return output;
        } catch (error) {
            return `Error comparing configuration: ${(error, as, Error}).message}`;

    /**
     * 設定テンプレート適用'
     */''
    private applyTemplate(args: string[]): string { const templateName = args[0],
        
        const templates: Record<string, ConfigurationTemplate> = {'
            development: {', 'performance.targetFPS': 60,'
                'debug.enabled': true,
                'audio.volume.master': 0.5,
                'game.difficulty.modifier': 0.8 },

            production: { ', 'performance.targetFPS': 60,'
                'debug.enabled': false,
                'audio.volume.master': 1.0,
                'game.difficulty.modifier': 1.0 },

            test: { ', 'performance.targetFPS': 30,'
                'debug.enabled': true,
                'audio.volume.master': 0.0,
                'game.difficulty.modifier': 0.5 
    };
        ';'

        const template = templates[templateName];
        if (!template) { }'

            return `Template '${templateName}' not found. Available templates: ${Object.keys(templates}.join(', '})`;
        }
        
        const applyResults: TemplateResult[] = [],
        const errors: TemplateError[] = [],
        
        for(const [path, value] of Object.entries(template) {
        
            try {
                // 元の値を保存（初回のみ）
                if (!this.originalValues.has(path) {
                    const originalValue = this.configManager.get(path) }
                    this.originalValues.set(path, originalValue); }
                }
                
                this.configManager.set(path, value, { validate: true)
                   , saveToStorage: false) as ConfigurationSetOptions),
                applyResults.push({ path, value ),
                
                // 変更履歴に記録
                this.changeHistory.push({),
                    timestamp: new Date().toISOString(),
                    path,
                    oldValue: this.configManager.get(path,
    newValue: value,
                    source: `template:${templateName}`
                });
            } catch (error) { }

                errors.push({ path, error: (error as Error).message  }');'
            }
        }

        let output = `Applied template '${templateName}' (${applyResults.length} values):\n`;
        for (const result of applyResults) {
    
}
            output += `  ${result.path} = ${result.value}\n`;
        }
        
        if (errors.length > 0) {
        
            output += `\nErrors: \n`
            }
            for (const error of errors) { }
                output += `  ${error.path}: ${error.error}\n`;
            }
        }
        
        return output;
    }

    // ヘルパーメソッド

    /**
     * 値の型推論と変換
     */''
    private convertValue(valueStr: string): any { // null, undefined
        if (valueStr === 'null') return null,
        if (valueStr === 'undefined') return undefined,
        ','
        // boolean
        if (valueStr === 'true') return true,
        if(valueStr === 'false) return false,'
        
        // number
        if (!isNaN(valueStr, as any) && !isNaN(parseFloat(valueStr)) {''
            return parseFloat(valueStr) }
        ';'
        // JSON object/array
        if (valueStr.startsWith('{ ') || valueStr.startsWith('[) {'
            try {
                return JSON.parse(valueStr) } catch { // JSON パースに失敗した場合は文字列として扱う }
        }
        
        // string (default);
        return valueStr;
    }

    /**
     * プレフィックスによる設定フィルタリング
     */
    private filterConfigByPrefix(config: any, prefix: string): any { ''
        if(!prefix) return config }

        const filtered: any = {}''
        this.filterConfigRecursive(config, prefix, ', filtered);'
        return filtered;
    }]
];
    private filterConfigRecursive(obj: any, prefix: string, currentPath: string, result: any): void { for(const [key, value] of Object.entries(obj) { }
            const fullPath = currentPath ? `${currentPath}.${key}` : key;

            if(fullPath.startsWith(prefix)) { ''
                if (typeof, value === 'object' && value !== null) { }
                    result[key] = {};
                    this.filterConfigRecursive(value, prefix, fullPath, result[key]);
                } else { result[key] = value }

                }'} else if(prefix.startsWith(fullPath)) { // 子要素が条件を満たす可能性がある'
                if (typeof, value === 'object' && value !== null) { }
                    const childResult: any = {}
                    this.filterConfigRecursive(value, prefix, fullPath, childResult);
                    if (Object.keys(childResult).length > 0) { result[key] = childResult }
}
        }
    }

    /**
     * 設定の出力に追加
     */'
    private addConfigToOutput(config: any, output: string, indent: string): string { ''
        for(const [key, value] of Object.entries(config)) {''
            if (typeof, value === 'object' && value !== null) { }
                output += `${indent}${key}:\n`;
                output = this.addConfigToOutput(value, output, `${indent}  `});
            } else {  }
                output += `${indent}${key} = ${value} (${typeof, value})\n`;
            }
        }
        return output;
    }

    /**
     * 設定の再帰的インポート
     */'
    private importConfigRecursive(config: any, basePath: string, results: ImportResult[], errors: ImportError[]): void {;
        for(const [key, value] of Object.entries(config)) { }
            const fullPath = basePath ? `${basePath}.${key}` : key;

            if (typeof, value === 'object' && value !== null && !Array.isArray(value) {
                // オブジェクトの場合は再帰的に処理
            }
                this.importConfigRecursive(value, fullPath, results, errors); }
            } else {  // プリミティブ値または配列の場合は設定
                try {
                    // 元の値を保存（初回のみ）
                    if (!this.originalValues.has(fullPath) {
    
}
                        const originalValue = this.configManager.get(fullPath); }
                        this.originalValues.set(fullPath, originalValue); }
                    }
                    
                    this.configManager.set(fullPath, value, { validate: true)
                       , saveToStorage: false) as ConfigurationSetOptions),
                    results.push({ path: fullPath, value ),
                    
                    // 変更履歴に記録
                    this.changeHistory.push({),
                        timestamp: new Date().toISOString(),
    path: fullPath,
                        oldValue: this.configManager.get(fullPath,
                        newValue: value,
                        source: 'import'
            });
                } catch (error) {
                    errors.push({ path: fullPath, message: (error as Error).message  });
                }
}
    }

    /**
     * 設定の差分を検出'
     */''
    private findDifferences(current: any, defaults: any, basePath: string): DiffEntry[] { const differences: DiffEntry[] = [],

        if(typeof, current === 'object' && current !== null && ')',
            typeof defaults === 'object' && defaults !== null) {
            // オブジェクトの場合は再帰的に比較
            const allKeys = new Set([...Object.keys(current)],
                ...Object.keys(defaults)],
            ]),
            
            for (const key of allKeys) {
                const currentValue = current[key] }
                const defaultValue = defaults[key]; }
                const fullPath = basePath ? `${basePath}.${key}` : key;
                
                const childDiffs = this.findDifferences(currentValue, defaultValue, fullPath);
                differences.push(...childDiffs);
        } else if (current !== defaults) { // プリミティブ値の比較
            differences.push({)
                path: basePath,
    current: current),
                default: defaults,
        
        return differences;
    }

    /**
     * クリーンアップ
     */
    destroy(): void { ''
        this.originalValues.clear(' }'