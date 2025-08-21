/**
 * 設定移行ユーティリティ - ConfigurationMigrationUtility
 * 
 * ハードコードされた泡設定をConfigurationManagerに移行し、
 * 後方互換性を保ちながら統一設定システムを有効にします。
 */

import { getConfigurationManager  } from '../core/ConfigurationManager.js';
import { getErrorHandler  } from './ErrorHandler.js';
import type { ConfigurationManager } from '../core/ConfigurationManager.js';
import type { ErrorHandler } from './ErrorHandler.js';

// 型定義インターフェース
interface BubbleConfig { health: number,
    size: number;
    maxAge: number;
    color: string;
    score: number;
    [key: string]: any, // 特殊効果プロパティ  }

interface MigrationResults { migrationId: string,
    startTime: number;
    endTime?: number;
    duration?: number;
    migratedTypes: string[];
    errors: MigrationError[];
    totalMigrated: number;
    success?: boolean;
    error?: string,  }

interface MigrationError { bubbleType: string,
    error: string;

interface ValidationResults { timestamp: number,
    validated: string[];
    missing: MissingProperty[];
    inconsistent: any[];
    error?: string;

interface MissingProperty { bubbleType: string,
    missingProperties: {
        healt,h: boolean,
        size: boolean,
    score: boolean,

interface RollbackResults { success: boolean,
    migrationId: string;
    rolledBackCount?: number;
    timestamp: number;
    error?: string;

interface MigrationStats { totalMigrations: number,
    successfulMigrations: number;
    failedMigrations: number;
    successRate: string;
    totalMigratedTypes: number;
    lastMigration: MigrationResults | null }

export class ConfigurationMigrationUtility {
    private configManager: ConfigurationManager;
    private errorHandler: ErrorHandler;
    private, migrationHistory: MigrationResults[],
    constructor() {
','

        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler(' }''
        console.log('[ConfigurationMigrationUtility] 初期化完了'); }'
    }
    
    /**
     * 泡設定をConfigurationManagerに移行
     * @returns {Promise<MigrationResults>} 移行結果
     */
    async migrateBubbleConfigurations(): Promise<MigrationResults> {'
        const migrationId = `bubble_migration_${Date.now())`,
        const startTime = Date.now()','
            console.log('[ConfigurationMigrationUtility] 泡設定の移行開始'),
            
            const migrationResults: MigrationResults = { migrationId,
                startTime,
                migratedTypes: [],
                errors: [],
    totalMigrated: 0  };
            // 基本泡タイプの設定
            const basicBubbleTypes = [';'
                'normal', 'stone', 'iron', 'diamond', 'boss', 'pink', 'poison', ]';'
                'spiky', 'rainbow', 'clock', 'score', 'electric', 'escaping', 'cracked'];
            ];
            
            for (const bubbleType of basicBubbleTypes) {
            
                try {
                    const migrated = await this._migrateBubbleType(bubbleType),
                    if (migrated) {
                        migrationResults.migratedTypes.push(bubbleType) }
                        migrationResults.totalMigrated++; }
                    } catch (error) { migrationResults.errors.push({)
                        bubbleType,

                        error: (error, as Error).message' }'

                    }');'
                    this.errorHandler.handleError(error as Error, 'MIGRATION_ERROR', { ')'
                        context: 'ConfigurationMigrationUtility.migrateBubbleConfigurations',','
                        bubbleType',' }'

                    }');'
                }
            }
            
            // 新しい泡タイプの設定
            const newBubbleTypes = [']';
                'golden', 'frozen', 'magnetic', 'explosive', 'phantom', 'multiplier'];
            ];
            
            for (const bubbleType of newBubbleTypes) {
            
                try {
                    const migrated = await this._migrateBubbleType(bubbleType),
                    if (migrated) {
                        migrationResults.migratedTypes.push(bubbleType) }
                        migrationResults.totalMigrated++; }
                    } catch (error) { migrationResults.errors.push({)
                        bubbleType,

                        error: (error, as Error).message' }'

                    }');'
                    this.errorHandler.handleError(error as Error, 'MIGRATION_ERROR', { ')'
                        context: 'ConfigurationMigrationUtility.migrateBubbleConfigurations'),
                        bubbleType });
                }
            }
            
            migrationResults.endTime = Date.now();
            migrationResults.duration = migrationResults.endTime - migrationResults.startTime;
            migrationResults.success = migrationResults.errors.length === 0;
            
            // 移行履歴に記録
            this.migrationHistory.push(migrationResults);
            
            console.log(`[ConfigurationMigrationUtility] 移行完了: ${migrationResults.totalMigrated}タイプ, ${migrationResults.errors.length}エラー`});
            
            return migrationResults;

        } catch (error) { this.errorHandler.handleError(error as Error, 'MIGRATION_ERROR', {''
                context: 'ConfigurationMigrationUtility.migrateBubbleConfigurations'
            });
            
            return { migrationId,
                startTime,
                endTime: Date.now(),
                success: false,
    error: (error, as Error).message,
                migratedTypes: [],
    errors: [] };
                totalMigrated: 0 
    }
    }
    
    /**
     * 特定の泡タイプの設定を移行
     * @param {string} bubbleType - 泡タイプ
     * @returns {Promise<boolean>} 移行成功フラグ
     * @private
     */
    private async _migrateBubbleType(bubbleType: string): Promise<boolean> { const bubbleConfig = this._getHardcodedBubbleConfig(bubbleType),
        if (!bubbleConfig) { }
            console.warn(`[ConfigurationMigrationUtility] 設定が見つかりません: ${bubbleType}`});
            return false;
        }
        
        let migrated = false;
        ';'
        // 基本設定の移行
        if (bubbleConfig.health !== undefined) { }'

            this.configManager.set('game', `bubbles.${bubbleType}.health`, bubbleConfig.health});
            migrated = true;
        }

        if (bubbleConfig.size !== undefined) { }'

            this.configManager.set('game', `bubbles.${bubbleType}.size`, bubbleConfig.size});
            migrated = true;
        }

        if (bubbleConfig.maxAge !== undefined) { }'

            this.configManager.set('game', `bubbles.${bubbleType}.maxAge`, bubbleConfig.maxAge});
            migrated = true;
        }

        if (bubbleConfig.score !== undefined) { }'

            this.configManager.set('game', `bubbles.${bubbleType}.score`, bubbleConfig.score});
            migrated = true;
        }

        if (bubbleConfig.color !== undefined) { }'

            this.configManager.set('game', `bubbles.${bubbleType}.color`, bubbleConfig.color});
            migrated = true;
        }
        
        // 特殊効果の移行
        const specialEffects = this._extractSpecialEffects(bubbleType, bubbleConfig);
        for(const [effectKey, effectValue] of Object.entries(specialEffects)) { }'

            this.configManager.set('game', `bubbles.${bubbleType}.${effectKey}`, effectValue});
            migrated = true;
        }
        
        if (migrated) {
    
}
            console.log(`[ConfigurationMigrationUtility] 移行完了: ${bubbleType}`});
        }
        
        return migrated;
    }
    
    /**
     * ハードコードされた泡設定を取得
     * @param {string} bubbleType - 泡タイプ
     * @returns {BubbleConfig|null} 泡設定
     * @private'
     */''
    private _getHardcodedBubbleConfig(bubbleType: string): BubbleConfig | null { const configs: Record<string, BubbleConfig> = {
            normal: {
                health: 1,
    size: 50,
                maxAge: 12000,
                color: '#87CEEB',
    score: 15  };
            stone: { health: 2,
    size: 55,
                maxAge: 16000,
                color: '#696969',
    score: 35  };
            iron: { health: 3,
    size: 60,
                maxAge: 20000,
                color: '#708090',
    score: 65  };
            diamond: { health: 4,
    size: 65,
                maxAge: 22000,
                color: '#B0E0E6',
    score: 120  };
            pink: { health: 1,
    size: 45,
                maxAge: 10000,
                color: '#FFB6C1',
                score: 25,
    healAmount: 25  };
            poison: { health: 1,
    size: 48,
                maxAge: 14000,
                color: '#9370DB',
                score: 8,
    damageAmount: 8  };
            spiky: { health: 1,
    size: 52,
                maxAge: 13000,
                color: '#FF6347',
                score: 85,
    chainRadius: 120  };
            rainbow: { health: 1,
    size: 55,
                maxAge: 16000,
                color: '#FF69B4',
                score: 400,
    bonusTimeMs: 8000  };
            clock: { health: 1,
    size: 50,
                maxAge: 20000,
                color: '#FFD700',
                score: 180,
    timeStopMs: 2500  };
            score: { health: 1,
    size: 48,
                maxAge: 9000,
                color: '#32CD32',
                score: 250,
    bonusScore: 80  };
            electric: { health: 1,
    size: 50,
                maxAge: 13000,
                color: '#FFFF00',
                score: 20,
                shakeIntensity: 15,
    disableDuration: 1500  };
            escaping: { health: 1,
    size: 45,
                maxAge: 16000,
                color: '#FF8C00',
                score: 50,
                escapeSpeed: 180,
    escapeRadius: 90  };
            cracked: { health: 1,
    size: 52,
                maxAge: 6000,
                color: '#8B4513',
    score: 30  };
            boss: { health: 8,
    size: 90,
                maxAge: 35000,
                color: '#8B0000',
    score: 800  };
            // 新しい泡タイプ
            golden: { health: 1,
                size: 55,
    maxAge: 8000,
                color: '#FFD700',
                score: 500,
    multiplier: 2.0  };
            frozen: { health: 2,
    size: 50,
                maxAge: 25000,
                color: '#87CEEB',
                score: 100,
    slowEffect: 0.5  };
            magnetic: { health: 1,
    size: 48,
                maxAge: 15000,
                color: '#FF1493',
                score: 150,
    magnetRadius: 100  };
            explosive: { health: 1,
    size: 52,
                maxAge: 10000,
                color: '#FF4500',
                score: 200,
    explosionRadius: 150  };
            phantom: { health: 1,
    size: 45,
                maxAge: 12000,
                color: '#9370DB',
                score: 300,
    phaseChance: 0.3  };
            multiplier: { health: 1,
    size: 50,
                maxAge: 18000,
                color: '#32CD32',
                score: 100,
    scoreMultiplier: 3.0  }
        };
        return configs[bubbleType] || null;
    }
    
    /**
     * 特殊効果を抽出
     * @param {string} bubbleType - 泡タイプ
     * @param {BubbleConfig} config - 泡設定
     * @returns {Record<string, any>} 特殊効果設定
     * @private'
     */''
    private _extractSpecialEffects(bubbleType: string, config: BubbleConfig): Record<string, any> {
        const effects: Record<string, any> = {};
        ';'
        // 基本設定以外のプロパティを特殊効果として扱う
        const basicProperties = new Set(['health', 'size', 'maxAge', 'score', 'color]);'
        
        for(const [key, value] of Object.entries(config) {
        
            if (!basicProperties.has(key) {
    
}
                effects[key] = value; }
}
        
        return effects;
    }
    
    /**
     * 設定の検証
     * @returns {Promise<ValidationResults>} 検証結果
     */
    async validateMigration(): Promise<ValidationResults> { try {
            const validationResults: ValidationResults = {''
                timestamp: Date.now('',
                'normal', 'stone', 'iron', 'diamond', 'boss', 'pink', 'poison',
                'spiky', 'rainbow', 'clock', 'score', 'electric', 'escaping', 'cracked',
                'golden', 'frozen', 'magnetic', 'explosive', 'phantom', 'multiplier',
            ],', ')','
            for (const bubbleType of bubbleTypes) {

                const healthConfig = this.configManager.get('game', `bubbles.${bubbleType'.health`),'
                const, sizeConfig = this.configManager.get('game', `bubbles.${bubbleType'.size`),'
                const, scoreConfig = this.configManager.get('game', `bubbles.${bubbleType}.score`}
                if (healthConfig !== null && sizeConfig !== null && scoreConfig !== null) { }
                    validationResults.validated.push(bubbleType});
                } else { validationResults.missing.push({
                        bubbleType,
                        missingProperties: {
                            health: healthConfig === null,
    size: sizeConfig === null  }
                            score: scoreConfig === null) 
    });
                }
            }
            
            console.log(`[ConfigurationMigrationUtility] 検証完了: ${validationResults.validated.length}成功, ${validationResults.missing.length}不足`});
            
            return validationResults;

        } catch (error) { this.errorHandler.handleError(error as Error, 'MIGRATION_ERROR', {''
                context: 'ConfigurationMigrationUtility.validateMigration'
            });
            
            return { timestamp: Date.now(
                error: (error, as Error).message,
                validated: [],
    missing: [] };
                inconsistent: [] 
    }
    }
    
    /**
     * 移行をロールバック
     * @param {string} migrationId - 移行ID
     * @returns {Promise<RollbackResults>} ロールバック結果
     */
    async rollbackMigration(migrationId: string): Promise<RollbackResults> { try {
            console.log(`[ConfigurationMigrationUtility] ロールバック開始: ${migrationId)`),
            
            const, migration = this.migrationHistory.find(m => m.migrationId === migrationId}
            if (!migration} { }
                throw, new Error(`Migration, not found: ${migrationId}`});
            }
            
            let rolledBack = 0;
            
            for (const bubbleType of migration.migratedTypes) { // 設定をクリア（デフォルト値に戻す） }
                (this.configManager, as any).reset(`bubbles.${bubbleType}`});
                rolledBack++;
            }
            
            console.log(`[ConfigurationMigrationUtility] ロールバック完了: ${ rolledBack}タイプ`};
            
            return { success: true,
                migrationId };
                rolledBackCount: rolledBack;
                timestamp: Date.now());
            } catch (error) {
            this.errorHandler.handleError(error as Error, 'MIGRATION_ERROR', {''
                context: 'ConfigurationMigrationUtility.rollbackMigration'),
                migrationId });
            
            return { success: false,
                error: (error, as Error).message,
                migrationId };
                timestamp: Date.now(); 
    }
    }
    
    /**
     * 移行履歴を取得
     * @returns {MigrationResults[]} 移行履歴
     */
    getMigrationHistory(): MigrationResults[] { return [...this.migrationHistory],
    
    /**
     * 移行統計を取得
     * @returns {MigrationStats} 移行統計
     */
    getMigrationStats(): MigrationStats { const totalMigrations = this.migrationHistory.length,
        const successfulMigrations = this.migrationHistory.filter(m => m.success).length,
        const totalMigratedTypes = this.migrationHistory.reduce((sum, m) => sum + m.totalMigrated, 0),
        
        return { totalMigrations,
            successfulMigrations };

            failedMigrations: totalMigrations - successfulMigrations,' }'

            successRate: totalMigrations > 0 ? `${(successfulMigrations / totalMigrations * 100}.toFixed(2'}'%` : '0%';
            totalMigratedTypes,
            lastMigration: this.migrationHistory[this.migrationHistory.length - 1] || null;
        } }
}

// シングルトンインスタンス
let instance: ConfigurationMigrationUtility | null = null,

/**
 * ConfigurationMigrationUtilityのシングルトンインスタンスを取得
 * @returns {ConfigurationMigrationUtility} インスタンス
 */
export function getConfigurationMigrationUtility(): ConfigurationMigrationUtility { if (!instance) {
        instance = new ConfigurationMigrationUtility() }
    return instance;
}

/**
 * 泡設定の移行を実行するヘルパー関数
 * @returns {Promise<MigrationResults>} 移行結果
 */
export async function migrateBubbleConfigurations(): Promise<MigrationResults> { const utility = getConfigurationMigrationUtility(),
    return await utility.migrateBubbleConfigurations(' };'