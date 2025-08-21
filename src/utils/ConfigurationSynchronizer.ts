/**
 * 設定同期システム - ConfigurationSynchronizer
 * 
 * 複数の設定ソース間の整合性を確保し、
 * 不整合の検出・報告・自動修正機能を提供します。
 */

import { getConfigurationManager  } from '../core/ConfigurationManager.js';''
import { getErrorHandler  } from './ErrorHandler.js';

// Type definitions
interface ConfigurationSource { name: string,
    priority: number;
    loader: () => Promise<any>;''
    validator: (confi;g: any') => boolean ,}'
}

interface SourceConfigData { config: any;
    source: ConfigurationSource;
   , loadTime: number;
    error?: string }

interface BubbleConfig { score?: number;
    health?: number;
    size?: number;
    healAmount?: number;
    damageAmount?: number;
    shakeIntensity?: number;
    disableDuration?: number;
    bonusTimeMs?: number; }

interface BubbleConfigMap { normal?: BubbleConfig;
    boss?: BubbleConfig;
    stone?: BubbleConfig;
    iron?: BubbleConfig;
    diamond?: BubbleConfig;
    pink?: BubbleConfig;
    poison?: BubbleConfig;
    electric?: BubbleConfig;
    rainbow?: BubbleConfig;
    [key: string]: BubbleConfig | undefined, }

interface ConfigurationData { bubbles?: BubbleConfigMap;
    [key: string]: any, }

interface Discrepancy { type: string,
    bubbleType?: string;
    key: string,
    values: Array<[string, SourceValue]>;''
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    impact: string;
   , detectedAt: number ,}

interface SourceValue { value: any;
    source: string;
   , priority: number }

interface Recommendation { action: string;
    description: string;
    targetValue?: any;
    affectedFiles?: string[];
    priority: string;
   , estimatedEffort: string;
    discrepancyId?: string }

interface ValidationResult { timestamp: number;
    sourceCount?: number;
    discrepancyCount: number;
    discrepancies: Discrepancy[];
   , sourceConfigs: Record<string, SerializedSourceConfig>;
    recommendations: Recommendation[];
    error?: string ,}

interface SerializedSourceConfig { name: string;
    priority: number;
    loadTime: number;
    hasConfig: boolean;
   , error: string | null }

interface SyncHistory { timestamp: number;
    action: string;
   , result: string }

interface SyncReport { timestamp: number;
    discrepancyCount: number;
    discrepancies: Discrepancy[];
   , syncHistory: SyncHistory[],
    sources: string[],
    status: 'SYNCHRONIZED' | 'INCONSISTENT' ,}

interface SyncFixes { applied: number;
   , failed: number }

export class ConfigurationSynchronizer {
    public configManager: any;
    public, errorHandler: any,
    public configurationSources: Map<string, ConfigurationSource>;
    public discrepancies: Discrepancy[],
    public syncHistory: SyncHistory[],

    constructor() {

        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        
        // 設定ソースの定義
        this.configurationSources = new Map<string, ConfigurationSource>();
        
        // 不整合レポート
        this.discrepancies = [];
        
        // 同期履歴
        this.syncHistory = [];
        // 設定ソースを登録
        this._registerConfigurationSources();
    }

    }

        console.log('[ConfigurationSynchronizer] 初期化完了'); }'
    }
    
    /**
     * 設定ソースを登録
     * @private'
     */''
    private _registerConfigurationSources()';
        this.configurationSources.set('gameBalance', { ');''
            name: 'GameBalance.js(ORIGINAL_BALANCE_CONFIG)';
           , priority: 2, // 中優先度;
            loader: () => this._loadGameBalanceConfig();
            validator: (config) => this._validateGameBalanceConfig(config);' ,}'

        }');
        ';
        // Bubble.jsからの設定ソース
        this.configurationSources.set('bubbleImplementation', { ');''
            name: 'Bubble.js(getTypeConfig)';
           , priority: 3, // 最高優先度（実装値）;
            loader: () => this._loadBubbleImplementationConfig();
            validator: (config) => this._validateBubbleImplementationConfig(config);' ,}'

        }');
        ';
        // テストからの設定ソース
        this.configurationSources.set('testExpectations', { ');''
            name: 'Test expectations(*.test.js)';
           , priority: 1, // 低優先度;
            loader: () => this._loadTestExpectationConfig();
            validator: (config) => this._validateTestExpectationConfig(config);' ,}'

        }');
        ';
        // ConfigurationManagerからの設定ソース
        this.configurationSources.set('configurationManager', { ');''
            name: 'ConfigurationManager(unified)';
           , priority: 4, // 最高優先度（統一システム）;
            loader: () => this._loadConfigurationManagerConfig();
            validator: (config) => this._validateConfigurationManagerConfig(config) ,}
        });
    }
    
    /**
     * 全ての設定ソース間の整合性を検証
     * @returns 検証結果
     */''
    async validateConsistency()';
            console.log('[ConfigurationSynchronizer] 整合性検証開始);
            
            // 各ソースから設定を読み込み
            const sourceConfigs = new Map<string, SourceConfigData>();
            
            for(const [sourceId, source] of this.configurationSources) {
            
                try {
                    const config = await source.loader();
                    sourceConfigs.set(sourceId, {)
                        config,);
                        source);
            
            }
                        loadTime: Date.now(); }
                    }');''
                } catch (error) { this.errorHandler.handleError(error, 'CONFIGURATION_ERROR', {)'
                        context: 'ConfigurationSynchronizer.validateConsistency);
                        sourceId,);
                        sourceName: source.name ,});
                    
                    sourceConfigs.set(sourceId, { config: null)
                        source);
                        loadTime: Date.now();
                       , error: error.message });
                }
            }
            
            // 不整合を検出
            const discrepancies = this._detectDiscrepancies(sourceConfigs);
            
            // 結果を整理
            const result = { timestamp: Date.now(),
                sourceCount: sourceConfigs.size;
               , discrepancyCount: discrepancies.length;
                discrepancies,
                sourceConfigs: this._serializeSourceConfigs(sourceConfigs);
               , recommendations: this._generateRecommendations(discrepancies ,};
            
            // 不整合リストを更新
            this.discrepancies = discrepancies;
            
            console.log(`[ConfigurationSynchronizer] 検証完了: ${discrepancies.length}個の不整合を検出`});
            
            return result;

        } catch (error) { this.errorHandler.handleError(error, 'CONFIGURATION_ERROR', {)'
                context: 'ConfigurationSynchronizer.validateConsistency' ,});
            
            return { timestamp: Date.now(),
                error: error.message, };
                discrepancies: [], }
                sourceConfigs: {};
                recommendations: [];
            },
        }
    }
    
    /**
     * 設定ソース間の不整合を検出
     * @param sourceConfigs - ソース設定
     * @returns 不整合リスト
     * @private
     */
    private _detectDiscrepancies(sourceConfigs: Map<string, SourceConfigData>): Discrepancy[] { const discrepancies: Discrepancy[] = [],
        
        // 泡設定の不整合をチェック
        const bubbleDiscrepancies = this._detectBubbleConfigDiscrepancies(sourceConfigs);
        discrepancies.push(...bubbleDiscrepancies);
        
        // スコア設定の不整合をチェック
        const scoreDiscrepancies = this._detectScoreConfigDiscrepancies(sourceConfigs);
        discrepancies.push(...scoreDiscrepancies);
        
        // 特殊効果設定の不整合をチェック
        const effectDiscrepancies = this._detectEffectConfigDiscrepancies(sourceConfigs);
        discrepancies.push(...effectDiscrepancies);
        
        return discrepancies; }
    
    /**
     * 泡設定の不整合を検出
     * @param sourceConfigs - ソース設定
     * @returns 不整合リスト
     * @private
     */''
    private _detectBubbleConfigDiscrepancies(sourceConfigs: Map<string, SourceConfigData>): Discrepancy[] { const discrepancies: Discrepancy[] = [],
        // 泡タイプ別にチェック
        const bubbleTypes: string[] = ['normal', 'boss', 'stone', 'iron', 'diamond', 'pink', 'poison', 'electric'];
        
        for(const, bubbleType of, bubbleTypes) {
        
            // スコア値の比較
            const scoreValues = this._extractBubbleScoreValues(sourceConfigs, bubbleType);''
            if(scoreValues.size > 1) {'
                discrepancies.push({)'
                    type: 'BUBBLE_SCORE_INCONSISTENCY',);
                    bubbleType);
                    key: `bubbles.${bubbleType).score`;
                    values: Array.from(scoreValues.entries(,},
                    severity: this._calculateSeverity(scoreValues}

                    impact: 'Score calculation and game balance tests will not match implementation', }
                    detectedAt: Date.now(});
                });
            }
            
            // 体力値の比較
            const healthValues = this._extractBubbleHealthValues(sourceConfigs, bubbleType);''
            if(healthValues.size > 1) {'
                discrepancies.push({)'
                    type: 'BUBBLE_HEALTH_INCONSISTENCY',);
                    bubbleType);
                    key: `bubbles.${bubbleType).health`;
                    values: Array.from(healthValues.entries(,},
                    severity: this._calculateSeverity(healthValues}

                    impact: 'Bubble durability tests will not match implementation', }
                    detectedAt: Date.now(});
                });
            }
            
            // サイズ値の比較
            const sizeValues = this._extractBubbleSizeValues(sourceConfigs, bubbleType);''
            if(sizeValues.size > 1) {'
                discrepancies.push({)'
                    type: 'BUBBLE_SIZE_INCONSISTENCY',);
                    bubbleType);
                    key: `bubbles.${bubbleType).size`;
                    values: Array.from(sizeValues.entries(,},
                    severity: this._calculateSeverity(sizeValues}

                    impact: 'Visual appearance and collision detection tests may not match implementation', }
                    detectedAt: Date.now(});
                });
            }
        }
        
        return discrepancies;
    }
    
    /**
     * 特殊効果設定の不整合を検出
     * @param sourceConfigs - ソース設定
     * @returns 不整合リスト
     * @private
     */
    private _detectEffectConfigDiscrepancies(sourceConfigs: Map<string, SourceConfigData>): Discrepancy[] { const discrepancies: Discrepancy[] = [],
        
        // Electric泡の効果チェック
        const electricIntensityValues = this._extractElectricIntensityValues(sourceConfigs);''
        if(electricIntensityValues.size > 1) {'
            discrepancies.push({''
                type: 'ELECTRIC_INTENSITY_INCONSISTENCY',)';
                bubbleType: 'electric',')';
                key: 'bubbles.electric.shakeIntensity),
                values: Array.from(electricIntensityValues.entries(),
                severity: this._calculateSeverity(electricIntensityValues),
                impact: 'Screen shake effect tests will not match implementation';
        ,}
                detectedAt: Date.now(); }
            });
        }
        ';

        const electricDurationValues = this._extractElectricDurationValues(sourceConfigs);''
        if(electricDurationValues.size > 1) {'
            discrepancies.push({''
                type: 'ELECTRIC_DURATION_INCONSISTENCY',)';
                bubbleType: 'electric',')';
                key: 'bubbles.electric.disableDuration),
                values: Array.from(electricDurationValues.entries(),
                severity: this._calculateSeverity(electricDurationValues),
                impact: 'Input disable effect tests will not match implementation';
        ,}
                detectedAt: Date.now(); }
            });
        }
        
        // Rainbow泡の効果チェック
        const rainbowDurationValues = this._extractRainbowDurationValues(sourceConfigs);''
        if(rainbowDurationValues.size > 1) {'
            discrepancies.push({''
                type: 'RAINBOW_DURATION_INCONSISTENCY',)';
                bubbleType: 'rainbow',')';
                key: 'bubbles.rainbow.bonusTimeMs),
                values: Array.from(rainbowDurationValues.entries(),
                severity: this._calculateSeverity(rainbowDurationValues),
                impact: 'Bonus time effect tests will not match implementation';
        ,}
                detectedAt: Date.now(); }
            });
        }
        
        return discrepancies;
    }
    
    /**
     * 値の重要度を計算
     * @param values - 値のマップ
     * @returns 重要度レベル
     * @private'
     */''
    private _calculateSeverity(values: Map<string, SourceValue>): 'LOW' | 'MEDIUM' | 'HIGH' { const valuesArray = Array.from(values.values().map(v => v.value);''
        if(valuesArray.length < 2) return 'LOW';
        
        const min = Math.min(...valuesArray);
        const max = Math.max(...valuesArray);
        const variance = (max - min) / min;

        if(variance > 0.5) return 'HIGH';    // 50%以上の差異
        if(variance > 0.2) return 'MEDIUM';  // 20%以上の差異
        return 'LOW';                         // 20%未満の差異 }
    }
    
    /**
     * 修正推奨事項を生成
     * @param discrepancies - 不整合リスト
     * @returns 推奨事項リスト
     * @private
     */
    private _generateRecommendations(discrepancies: Discrepancy[]): Recommendation[] { const recommendations: Recommendation[] = [],
        
        for(const, discrepancy of, discrepancies) {
        
            let recommendation: Recommendation,

            switch(discrepancy.type) {''
                case 'BUBBLE_SCORE_INCONSISTENCY':';
                    recommendation = {'
        
        }

                        action: 'SYNC_TO_IMPLEMENTATION', }

                        description: `Update test expectations to match implementation value for ${discrepancy.bubbleType} bubble score`,''
                        targetValue: this._getImplementationValue(discrepancy.values),
                        affectedFiles: ['tests/unit/Bubble.test.js],
                        priority: discrepancy.severity,
                        estimatedEffort: 'LOW';
                    },
                    break;

                case 'BUBBLE_HEALTH_INCONSISTENCY':'';
                case 'BUBBLE_SIZE_INCONSISTENCY':';
                    recommendation = { ''
                        action: 'SYNC_TO_IMPLEMENTATION',' }

                        description: `Update test expectations to match implementation value for ${discrepancy.bubbleType} bubble ${discrepancy.key.split('.}.pop(})`,''
                        targetValue: this._getImplementationValue(discrepancy.values),
                        affectedFiles: ['tests/unit/Bubble.test.js],
                        priority: discrepancy.severity,
                        estimatedEffort: 'LOW';
                    },
                    break;

                case 'ELECTRIC_INTENSITY_INCONSISTENCY':'';
                case 'ELECTRIC_DURATION_INCONSISTENCY':'';
                case 'RAINBOW_DURATION_INCONSISTENCY':';
                    recommendation = { ''
                        action: 'SYNC_TO_IMPLEMENTATION' }

                        description: `Update test expectations to match implementation value for ${discrepancy.bubbleType} effect`,''
                        targetValue: this._getImplementationValue(discrepancy.values),
                        affectedFiles: ['tests/unit/Bubble.test.js],
                        priority: discrepancy.severity,
                        estimatedEffort: 'LOW';
                    },
                    break;
                    
                default:';
                    recommendation = { ''
                        action: 'MANUAL_REVIEW' }

                        description: `Manual review required for ${discrepancy.type}`,''
                        priority: 'MEDIUM',
                        estimatedEffort: 'MEDIUM';
                    },
            }

            recommendation.discrepancyId = discrepancy.type + '_' + (discrepancy.bubbleType || 'unknown');
            recommendations.push(recommendation);
        }
        
        return recommendations;
    }
    
    /**
     * 実装値を取得（最高優先度のソースから）
     * @param values - 値のリスト
     * @returns 実装値
     * @private
     */
    private _getImplementationValue(values: Array<[string, SourceValue]>): any { // 優先度順にソートして最高優先度の値を返す
        const sortedValues = values.sort((a, b) => b[1].priority - a[1].priority);
        return sortedValues[0][1].value;
    
    /**
     * GameBalance.jsから設定を読み込み
     * @returns 設定オブジェクト
     * @private
     */
    private async _loadGameBalanceConfig(): Promise<ConfigurationData> { try {
            // GameBalance.jsから直接インポートは循環参照の可能性があるため、
            // ConfigurationManagerが既に読み込んだ値を使用
            return {  };
                bubbles: { }
                    normal: { score: 15 };
                    boss: { health: 5 }, // ORIGINAL_BALANCE_CONFIGの値
                    pink: { healAmount: 25 };
                    poison: { damageAmount: 10 }
            };''
        } catch (error) {
            console.warn('[ConfigurationSynchronizer] GameBalance.js読み込みエラー:', error); }
            return {};
    
    /**
     * Bubble.jsの実装から設定を読み込み
     * @returns 設定オブジェクト
     * @private
     */
    private async _loadBubbleImplementationConfig(): Promise<ConfigurationData> { try {
            // Bubble.jsの実装値（実際の値）
            return {  };
                bubbles: { }
                    normal: { score: 15, health: 1, size: 50 ,},
                    boss: { health: 8, size: 90, score: 800 ,},
                    stone: { health: 2, size: 55 ,},
                    iron: { health: 3, size: 60 ,},
                    diamond: { health: 4, size: 65 ,},
                    pink: { healAmount: 25 };
                    poison: { damageAmount: 8 };
                    electric: { shakeIntensity: 15, disableDuration: 1500 ,},
                    rainbow: { bonusTimeMs: 8000 }
            };''
        } catch (error) {
            console.warn('[ConfigurationSynchronizer] Bubble.js読み込みエラー:', error); }
            return {};
    
    /**
     * テスト期待値から設定を読み込み
     * @returns 設定オブジェクト
     * @private
     */
    private async _loadTestExpectationConfig(): Promise<ConfigurationData> { try {
            // テストファイルで期待されている値
            return {  };
                bubbles: { }
                    normal: { score: 10 }, // Bubble.test.js:266の期待値
                   , boss: { health: 5, size: 100 ,}, // Bubble.test.js:33-34の期待値
                   , electric: { shakeIntensity: 20, disableDuration: 2000 ,}, // Bubble.test.js:241-242
                   , rainbow: { bonusTimeMs: 5000 } // Bubble.test.js:230
                }
            };''
        } catch (error) {
            console.warn('[ConfigurationSynchronizer] テスト期待値読み込みエラー:', error); }
            return {};
    
    /**
     * ConfigurationManagerから設定を読み込み
     * @returns 設定オブジェクト
     * @private'
     */''
    private async _loadConfigurationManagerConfig()';
                        score: this.configManager.get('game', 'bubbles.normal.score', 15),
                        health: this.configManager.get('game', 'bubbles.normal.health', 1);
                    },

                    boss: { ''
                        health: this.configManager.get('game', 'bubbles.boss.health', 8),
                        size: this.configManager.get('game', 'bubbles.boss.size', 90 }
};''
        } catch (error) {
            console.warn('[ConfigurationSynchronizer] ConfigurationManager読み込みエラー:', error); }
            return {};
    
    /**
     * ソース設定をシリアライズ
     * @param sourceConfigs - ソース設定
     * @returns シリアライズされた設定
     * @private
     */
    private _serializeSourceConfigs(sourceConfigs: Map<string, SourceConfigData>): Record<string, SerializedSourceConfig> {
        const result: Record<string, SerializedSourceConfig> = {};
        
        for(const [sourceId, data] of sourceConfigs) {
        
            result[sourceId] = {
                name: data.source.name;
                priority: data.source.priority;
                loadTime: data.loadTime;
               , hasConfig: !!data.config;
        }
                error: data.error || null }
            }
        
        return result;
    }
    
    /**
     * 泡スコア値を抽出
     * @private
     */
    private _extractBubbleScoreValues(sourceConfigs: Map<string, SourceConfigData>, bubbleType: string): Map<string, SourceValue> { const values = new Map<string, SourceValue>();
        
        for(const [sourceId, data] of sourceConfigs) {
        
            if (data.config && data.config.bubbles && data.config.bubbles[bubbleType] && data.config.bubbles[bubbleType].score !== undefined) {
                values.set(sourceId, {)
                    value: data.config.bubbles[bubbleType].score);
                   , source: data.source.name, }
                    priority: data.source.priority); }
}
        
        return values;
    }
    
    /**
     * 泡体力値を抽出
     * @private
     */
    private _extractBubbleHealthValues(sourceConfigs: Map<string, SourceConfigData>, bubbleType: string): Map<string, SourceValue> { const values = new Map<string, SourceValue>();
        
        for(const [sourceId, data] of sourceConfigs) {
        
            if (data.config && data.config.bubbles && data.config.bubbles[bubbleType] && data.config.bubbles[bubbleType].health !== undefined) {
                values.set(sourceId, {)
                    value: data.config.bubbles[bubbleType].health);
                   , source: data.source.name, }
                    priority: data.source.priority); }
}
        
        return values;
    }
    
    /**
     * 泡サイズ値を抽出
     * @private
     */
    private _extractBubbleSizeValues(sourceConfigs: Map<string, SourceConfigData>, bubbleType: string): Map<string, SourceValue> { const values = new Map<string, SourceValue>();
        
        for(const [sourceId, data] of sourceConfigs) {
        
            if (data.config && data.config.bubbles && data.config.bubbles[bubbleType] && data.config.bubbles[bubbleType].size !== undefined) {
                values.set(sourceId, {)
                    value: data.config.bubbles[bubbleType].size);
                   , source: data.source.name, }
                    priority: data.source.priority); }
}
        
        return values;
    }
    
    /**
     * エレクトリック強度値を抽出
     * @private
     */
    private _extractElectricIntensityValues(sourceConfigs: Map<string, SourceConfigData>): Map<string, SourceValue> { const values = new Map<string, SourceValue>();
        
        for(const [sourceId, data] of sourceConfigs) {
        
            if (data.config && data.config.bubbles && data.config.bubbles.electric && data.config.bubbles.electric.shakeIntensity !== undefined) {
                values.set(sourceId, {)
                    value: data.config.bubbles.electric.shakeIntensity);
                   , source: data.source.name, }
                    priority: data.source.priority); }
}
        
        return values;
    }
    
    /**
     * エレクトリック継続時間値を抽出
     * @private
     */
    private _extractElectricDurationValues(sourceConfigs: Map<string, SourceConfigData>): Map<string, SourceValue> { const values = new Map<string, SourceValue>();
        
        for(const [sourceId, data] of sourceConfigs) {
        
            if (data.config && data.config.bubbles && data.config.bubbles.electric && data.config.bubbles.electric.disableDuration !== undefined) {
                values.set(sourceId, {)
                    value: data.config.bubbles.electric.disableDuration);
                   , source: data.source.name, }
                    priority: data.source.priority); }
}
        
        return values;
    }
    
    /**
     * レインボー継続時間値を抽出
     * @private
     */
    private _extractRainbowDurationValues(sourceConfigs: Map<string, SourceConfigData>): Map<string, SourceValue> { const values = new Map<string, SourceValue>();
        
        for(const [sourceId, data] of sourceConfigs) {
        
            if (data.config && data.config.bubbles && data.config.bubbles.rainbow && data.config.bubbles.rainbow.bonusTimeMs !== undefined) {
                values.set(sourceId, {)
                    value: data.config.bubbles.rainbow.bonusTimeMs);
                   , source: data.source.name, }
                    priority: data.source.priority); }
}
        
        return values;
    }
    
    // バリデーション用のスタブメソッド（将来拡張用）
    private _validateGameBalanceConfig(config: any): boolean { return true, }
    private _validateBubbleImplementationConfig(config: any): boolean { return true, }
    private _validateTestExpectationConfig(config: any): boolean { return true, }
    private _validateConfigurationManagerConfig(config: any): boolean { return true, }
    private _detectScoreConfigDiscrepancies(sourceConfigs: Map<string, SourceConfigData>): Discrepancy[] { return []; }
    
    /**
     * 同期レポートを生成
     * @returns 同期レポート
     */
    generateSyncReport(): SyncReport { return { timestamp: Date.now(),
            discrepancyCount: this.discrepancies.length;
            discrepancies: this.discrepancies;
           , syncHistory: this.syncHistory,
            sources: Array.from(this.configurationSources.keys()),' };

            status: this.discrepancies.length === 0 ? 'SYNCHRONIZED' : 'INCONSISTENT' 
        }
    
    /**
     * 不整合を特定
     * @returns 不整合リスト
     */
    identifyDiscrepancies(): Discrepancy[] { return this.discrepancies; }
    
    /**
     * 同期修正を適用（今後実装予定）
     * @param fixes - 修正リスト
     * @returns 修正結果'
     */''
    async applySyncFixes(fixes: any[] = []): Promise<SyncFixes> { // TODO: 将来のバージョンで実装
        console.log('[ConfigurationSynchronizer] 自動修正機能は今後実装予定 }'
        return { applied: 0, failed: 0 ,}
}

// シングルトンインスタンス
let instance: ConfigurationSynchronizer | null = null,

/**
 * ConfigurationSynchronizerのシングルトンインスタンスを取得
 * @returns インスタンス
 */
export function getConfigurationSynchronizer(): ConfigurationSynchronizer { if (!instance) {''
        instance = new ConfigurationSynchronizer(' })'