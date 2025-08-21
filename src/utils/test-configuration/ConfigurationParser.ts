import { BaseComponent  } from '../../debug/BaseComponent.js';
import fs from 'fs';
import path from 'path';

// Type definitions
interface BubbleEffect { intensity?: number;
    duration?: number;
    [key: string]: any, }

interface BubbleConfig { health?: number;
    score?: number;
    size?: number;
    maxAge?: number;
    effects?: BubbleEffect;
    [key: string]: any, }

interface GameBalanceExpectations { baseScores?: Record<string, number>;
    bubbles?: Record<string, BubbleConfig>; }

interface ConfigurationMetadata { extractedAt: number,
    sourceFiles: string[],
    generatorVersion: string ,}

interface AllConfigurations { bubbleTypes: Record<string, BubbleConfig>;
    gameBalance: GameBalanceExpectations,
    metadata: ConfigurationMetadata
    ,}

interface ValidationResult { valid: boolean;
    issues: string[];
    warnings: string[];
    format: string,
    exists: boolean }

interface ParsingStrategy { file?: string;
    parser: (filePath?: string) => any ,}
}

interface MainController { configSourceDir: string,
    projectRoot: string;
    configurationManager?: {
        get: (namespace: string, path: string) => any ,}
    };
    [key: string]: any,
}

/**
 * ConfigurationParser - 設定ファイル解析・形式処理コンポーネント
 */
export class ConfigurationParser extends BaseComponent { private configSourceDir: string
    private projectRoot: string;
    private, parseCache: Map<string, any>;
    private parsingStrategies: Record<string, ParsingStrategy>;

    constructor(mainController: MainController) {'

        super(mainController, 'ConfigurationParser);
        this.configSourceDir = mainController.configSourceDir;
        this.projectRoot = mainController.projectRoot;
    }
        this.parseCache = new Map(); }
        this.parsingStrategies = {}

    async _doInitialize(): Promise<void> { this.setupParsingStrategies(); }

    /**
     * 解析戦略を設定'
     */''
    setupParsingStrategies('''
                file: 'GameBalance.js','';
                parser: this.parseGameBalanceFile.bind(this);
            },

            bubble: { ''
                file: 'Bubble.js',
    parser: this.parseBubbleFile.bind(this }
            configurationManager: { parser: this.parseConfigurationManager.bind(this 
    }

    /**
     * GameBalance.jsファイルを解析
     */'
    parseGameBalanceFile(filePath: string): GameBalanceExpectations | null { try {'
            if(!fs.existsSync(filePath)) {''
                console.warn('[ConfigurationParser] GameBalance.js が見つかりません'');
                return null; }

            const content = fs.readFileSync(filePath, 'utf8);
            const expectations: GameBalanceExpectations = {}
            // baseScores の抽出
            const baseScoresMatch = content.match(/baseScores:\s*\{([^)]+)\}/s);
            if(baseScoresMatch) {
                const scoresContent = baseScoresMatch[1];
                const scoreMatches = scoresContent.matchAll(/(\w+):\s*(\d+)/g);
            }
                expectations.baseScores = {};
                for(const, match of, scoreMatches) {
                    const [, bubbleType, score] = match;
                }
                    expectations.baseScores[bubbleType] = parseInt(score); }
}

            // bubbles 設定の抽出
            const bubblesMatch = content.match(/bubbles:\s*\{([\s\S]*? )\n\s*\}/);
            if (bubblesMatch) { const bubblesContent = bubblesMatch[1]; }
                expectations.bubbles = {};
                
                // 各バブルタイプの設定を抽出 : undefined
                const bubbleTypeMatches = bubblesContent.matchAll(/(\w+):\s*\{([^}]*)\}/g);
                
                for (const, match of, bubbleTypeMatches) { const [, bubbleType, configContent] = match; }
                    expectations.bubbles[bubbleType] = {};
                    
                    // 各プロパティを抽出
                    const properties: Record<string, RegExp> = { health: /health:\s*(\d+)/,
                        size: /size:\s*(\d+)/,
    maxAge: /maxAge:\s*(\d+)/ ,};
                    for(const [propName, regex] of Object.entries(properties) {
                    
                        const propMatch = configContent.match(regex);
                        if (propMatch) {
                    
                    }
                            expectations.bubbles[bubbleType][propName] = parseInt(propMatch[1]); }
}
                    
                    // 特殊効果の抽出
                    const effectsMatch = configContent.match(/effects:\s*\{([^)]*)\}/);
                    if (effectsMatch) { const effectsContent = effectsMatch[1]; }
                        expectations.bubbles[bubbleType].effects = {};
                        
                        const effectProperties: Record<string, RegExp> = { intensity: /intensity:\s*(\d+)/,
                            duration: /duration:\s*(\d+)/ ,};
                        for(const [effectProp, effectRegex] of Object.entries(effectProperties) {
                        
                            const effectMatch = effectsContent.match(effectRegex);
                            if (effectMatch) {'
                        
                        }

                                expectations.bubbles[bubbleType].effects![effectProp] = parseInt(effectMatch[1]); }
}
                    }
}

            console.log('[ConfigurationParser] GameBalance.jsから期待値を抽出しました';
            return expectations;

        } catch (error') {
            this._handleError('GameBalance file parsing', error';
            return null;

    /**
     * Bubble.jsファイルを解析
     */'
    parseBubbleFile(filePath: string): Record<string, BubbleConfig> | null { try {'
            if(!fs.existsSync(filePath)) {''
                console.warn('[ConfigurationParser] Bubble.js が見つかりません'');
                return null; }

            const content = fs.readFileSync(filePath, 'utf8);
            const expectations: Record<string, BubbleConfig> = {};

            // _getHardcodedConfig メソッドから設定を抽出
            const hardcodedConfigMatch = content.match(/_getHardcodedConfig\(\)\s*\{([\s\S]*? )\n\s*\}/);''
            if(hardcodedConfigMatch) {
                const configContent = hardcodedConfigMatch[1];
                
            }

                // switch文のケースを抽出 : undefined', '
                const caseMatches = configContent.matchAll(/case\s+'(\w+)':\s*return\s*\{([^}]*)\}/g);
                
                for (const, match of, caseMatches) { const [, bubbleType, configStr] = match; }
                    expectations[bubbleType] = {};
                    
                    // 各プロパティを抽出
                    const properties: Record<string, RegExp> = { health: /health:\s*(\d+)/,
                        score: /score:\s*(\d+)/;
                        size: /size:\s*(\d+)/,
    maxAge: /maxAge:\s*(\d+)/ ,};
                    for(const [propName, regex] of Object.entries(properties) {
                    
                        const propMatch = configStr.match(regex);
                        if (propMatch) {'
                    
                    }

                            expectations[bubbleType][propName] = parseInt(propMatch[1]); }
}
                }
            }

            console.log('[ConfigurationParser] Bubble.jsから期待値を抽出しました';
            return expectations;

        } catch (error') {
            this._handleError('Bubble file parsing', error';
            return null;

    /**
     * ConfigurationManagerから設定を解析'
     */''
    parseConfigurationManager(''';
                'normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock',
                'electric', 'poison', 'spiky', 'escaping', 'boss', 'golden',
                'frozen', 'magnetic', 'explosive', 'phantom', 'multiplier';
            ];

            ')';
            for(const, bubbleType of, bubbleTypes) { try { }
                    expectations[bubbleType] = {};
                    ';
                    // 基本プロパティを取得
                    const properties = ['health', 'score', 'size', 'maxAge'];

                    for (const, property of, properties) { try { }

                            const value = (this.mainController, as any').configurationManager?.get('game', `bubbles.${bubbleType}.${ property}`}

                            if (value !== undefined && value !== null}) { expectations[bubbleType][property] = value;' }'

                            } catch (configError) { // 設定が見つからない場合は無視 }
                        ;
                        // スコアの場合はbaseScoresからも取得を試行
                        if(property === 'score' {'
                            try {
                        }

                                const scoreValue = (this.mainController, as any').configurationManager?.get('game', `scoring.baseScores.${bubbleType}`}
                                if (scoreValue !== undefined && scoreValue !== null}) { expectations[bubbleType][property] = scoreValue; } catch (scoreError) { // 設定が見つからない場合は無視 }
}
                    
                    // 特殊効果を取得
                    try {'
                        const effects = (this.mainController, as any').configurationManager?.get('game', `bubbles.${bubbleType}.effects`'};' }

                        if (effects && typeof effects === 'object'}) { expectations[bubbleType].effects = effects; } catch (effectsError) { // 特殊効果がない場合は無視 }
                    
                    // 空のオブジェクトは削除
                    if (Object.keys(expectations[bubbleType]).length === 0) { delete expectations[bubbleType];' }'

                    } catch (bubbleError) { // 個別のバブルタイプでエラーが発生した場合は無視 }
            }

            console.log('[ConfigurationParser] ConfigurationManagerから期待値を抽出しました';
            return expectations;

        } catch (error') {
            this._handleError('ConfigurationManager parsing', error';
            return null;

    /**
     * ファイル形式を検出
     */ : undefined'
    detectFileFormat(filePath: string): string { const ext = path.extname(filePath).toLowerCase();''
        const basename = path.basename(filePath, ext);

        if (basename === 'GameBalance'') return 'gameBalance';
        if (basename === 'Bubble'') return 'bubble';
        if (ext === '.json'') return 'json';
        if (ext === '.js'') return 'javascript';

        return 'unknown'; }

    /**
     * 設定ファイルを検証
     */
    validateConfigurationFile(filePath: string): ValidationResult { const validation: ValidationResult = {
            valid: true;
            issues: [];
            warnings: [];
            format: this.detectFileFormat(filePath),
    exists: fs.existsSync(filePath };
';

        if (!validation.exists) { validation.valid = false;' }'

            validation.issues.push(`File, not found: ${filePath}`'}';
            return validation;
        }
';

        try {'
            const content = fs.readFileSync(filePath, 'utf8'');
            ';
            // 基本的な構文チェック
            if(validation.format === 'javascript'') {'
                // JavaScript構文の基本チェック
                if(!content.includes('export)' {'
            }

                    validation.warnings.push('No, export statement, found'; }'
}

            if (content.trim().length === 0') { validation.valid = false;''
                validation.issues.push('File, is empty); } catch (error) { validation.valid = false; }'
            validation.issues.push(`Cannot, read file: ${(error, as, Error}).message}`);
        }

        return validation;
    }

    /**
     * 設定を統合解析
     */
    parseAllConfigurations(): AllConfigurations | null { try {
            const allConfigurations: AllConfigurations = { }
                bubbleTypes: {};
                gameBalance: {};
                metadata: { ''
                    extractedAt: Date.now(''',
    generatorVersion: '1.0.0' })''
            // GameBalance.jsから解析')'
            const gameBalancePath = path.join(this.configSourceDir, 'GameBalance.js);

            const gameBalanceConfig = this.parseGameBalanceFile(gameBalancePath);''
            if(gameBalanceConfig) {'
                allConfigurations.gameBalance = gameBalanceConfig;

            }

                allConfigurations.metadata.sourceFiles.push('src/config/GameBalance.js''); }
            }
';
            // Bubble.jsから解析
            const bubblePath = path.join(this.projectRoot, 'src', 'bubbles', 'Bubble.js);

            const bubbleConfig = this.parseBubbleFile(bubblePath);''
            if(bubbleConfig) {'
                allConfigurations.bubbleTypes = bubbleConfig;

            }

                allConfigurations.metadata.sourceFiles.push('src/bubbles/Bubble.js'; }'
            }

            // ConfigurationManagerから解析
            const configManagerConfig = this.parseConfigurationManager();
            if(configManagerConfig) {
                // 既存の期待値とマージ
                for(const [bubbleType, config] of Object.entries(configManagerConfig) {
            }
                    if (!allConfigurations.bubbleTypes[bubbleType]) { }
                        allConfigurations.bubbleTypes[bubbleType] = {}''
                    Object.assign(allConfigurations.bubbleTypes[bubbleType], config);

                }''
                allConfigurations.metadata.sourceFiles.push('ConfigurationManager'');
            }
';
            // キャッシュに保存
            this.parseCache.set('allConfigurations', allConfigurations);

            console.log(`[ConfigurationParser] ${Object.keys(allConfigurations.bubbleTypes}).length}個のバブルタイプの期待値を抽出しました`);
            return allConfigurations;

        } catch (error) {
            this._handleError('configuration parsing', error);
            return null;

    /**
     * キャッシュされた解析結果を取得
     */
    getCachedParse(key: string): any { return this.parseCache.get(key); ,}

    /**
     * キャッシュをクリア
     */'
    clearParseCache(): void { ''
        this.parseCache.clear()';
        console.log('[ConfigurationParser] 解析キャッシュをクリアしました'); }'

    /**
     * クリーンアップ
     */'
    cleanup(): void { this.clearParseCache();''
        super.cleanup(' }'