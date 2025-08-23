/**
 * Import Data Processor Component
 * 
 * データ処理と検証機能を担当
 * Main Controller Patternの一部として設計
 */

export interface ValidationRule {
    required: boolean;
    type: string;
    min?: number;
    max?: number;
}

export interface ValidationRules {
    [key: string]: ValidationRule;
}

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

export interface DataIntegrityResult {
    valid: boolean;
    issues: string[];
}

export interface VersionCompatibilityResult {
    compatible: boolean;
    error?: string;
}

export interface PlayerData {
    username?: string | null;
    ap: number;
    tap: number;
    highScore: number;
    unlockedStages: string[];
    ownedItems: string[];
}

export interface StatisticsData {
    totalPlayTime?: number;
    bubblesPopped?: number;
    gamesPlayed?: number;
    [key: string]: number | undefined;
}

export interface AchievementData {
    id: string;
    unlocked: boolean;
    unlockedAt?: string;
}

export interface ImportData {
    version: string;
    playerData: PlayerData;
    statistics?: StatisticsData;
    achievements?: AchievementData[];
    timestamp?: string;
    settings?: Record<string, any>;
}

export interface DataSizeValidationResult {
    valid: boolean;
    error?: string;
    size?: number;
}

export class ImportDataProcessor {
    private validationRules: ValidationRules;
    private maxDataSize: number;
    private supportedVersions: string[];

    constructor() {
        this.maxDataSize = 10 * 1024 * 1024; // 10MB
        this.supportedVersions = ['1.0.0', '1.1.0', '1.2.0'];
        
        this.validationRules = {
            'playerData.ap': { required: true, type: 'number', min: 0 },
            'playerData.tap': { required: true, type: 'number', min: 0 },
            'playerData.highScore': { required: true, type: 'number', min: 0 },
            'playerData.unlockedStages': { required: true, type: 'array' },
            'playerData.ownedItems': { required: true, type: 'array' }
        };
    }
    
    /**
     * インポートデータを包括的に検証
     * @param rawData - 生データ
     * @returns 検証結果
     */
    async processImportData(rawData: string): Promise<ValidationResult> {
        try {
            // データサイズ検証
            const sizeValidation = this.validateDataSize(rawData);
            if (!sizeValidation.valid) {
                return sizeValidation;
            }
            
            // JSON解析
            let parsedData: ImportData;
            try {
                parsedData = JSON.parse(rawData);
            } catch (error) {
                return {
                    valid: false,
                    error: 'Invalid JSON format'
                };
            }
            
            // バージョン互換性チェック
            const versionResult = this.validateVersionCompatibility(parsedData);
            if (!versionResult.compatible) {
                return {
                    valid: false,
                    error: versionResult.error
                };
            }
            
            // データ構造検証
            const structureResult = this.validateDataStructure(parsedData);
            if (!structureResult.valid) {
                return structureResult;
            }
            
            // データ整合性チェック
            const integrityResult = this.validateDataIntegrity(parsedData);
            if (!integrityResult.valid) {
                return {
                    valid: false,
                    error: integrityResult.issues.join(', ')
                };
            }
            
            return { valid: true };
            
        } catch (error) {
            return {
                valid: false,
                error: `Processing error: ${(error as Error).message}`
            };
        }
    }
    
    /**
     * データサイズを検証
     * @param data - データ文字列
     * @returns 検証結果
     */
    private validateDataSize(data: string): DataSizeValidationResult {
        const size = new Blob([data]).size;
        
        if (size > this.maxDataSize) {
            return {
                valid: false,
                error: `Data size ${Math.round(size / 1024 / 1024)}MB exceeds limit ${Math.round(this.maxDataSize / 1024 / 1024)}MB`,
                size
            };
        }
        
        return { valid: true, size };
    }
    
    /**
     * バージョン互換性をチェック
     * @param data - インポートデータ
     * @returns 互換性結果
     */
    private validateVersionCompatibility(data: ImportData): VersionCompatibilityResult {
        if (!data.version) {
            return {
                compatible: false,
                error: 'Version information missing'
            };
        }
        
        if (!this.supportedVersions.includes(data.version)) {
            return {
                compatible: false,
                error: `Version ${data.version} not supported. Supported versions: ${this.supportedVersions.join(', ')}`
            };
        }
        
        return { compatible: true };
    }
    
    /**
     * データ構造を検証
     * @param data - インポートデータ
     * @returns 検証結果
     */
    private validateDataStructure(data: ImportData): ValidationResult {
        // 必須フィールドチェック
        if (!data.playerData) {
            return {
                valid: false,
                error: 'Player data is required'
            };
        }
        
        // 各フィールドの型と値をチェック
        for (const [path, rule] of Object.entries(this.validationRules)) {
            const value = this.getNestedValue(data, path);
            
            if (rule.required && (value === undefined || value === null)) {
                return {
                    valid: false,
                    error: `Required field missing: ${path}`
                };
            }
            
            if (value !== undefined && value !== null) {
                const typeValidation = this.validateFieldType(value, rule, path);
                if (!typeValidation.valid) {
                    return typeValidation;
                }
            }
        }
        
        return { valid: true };
    }
    
    /**
     * データ整合性をチェック
     * @param data - インポートデータ
     * @returns 整合性結果
     */
    private validateDataIntegrity(data: ImportData): DataIntegrityResult {
        const issues: string[] = [];
        
        // プレイヤーデータの整合性チェック
        if (data.playerData) {
            if (data.playerData.ap < 0) {
                issues.push('AP cannot be negative');
            }
            
            if (data.playerData.tap < data.playerData.ap) {
                issues.push('Total AP cannot be less than current AP');
            }
            
            if (data.playerData.highScore < 0) {
                issues.push('High score cannot be negative');
            }
        }
        
        // 統計データの整合性チェック
        if (data.statistics) {
            if (data.statistics.totalPlayTime && data.statistics.totalPlayTime < 0) {
                issues.push('Total play time cannot be negative');
            }
            
            if (data.statistics.bubblesPopped && data.statistics.bubblesPopped < 0) {
                issues.push('Bubbles popped count cannot be negative');
            }
        }
        
        // 実績データの整合性チェック
        if (data.achievements) {
            for (const achievement of data.achievements) {
                if (!achievement.id || typeof achievement.id !== 'string') {
                    issues.push('Achievement ID is required and must be a string');
                }
                
                if (achievement.unlocked && !achievement.unlockedAt) {
                    issues.push(`Unlocked achievement ${achievement.id} missing unlock timestamp`);
                }
            }
        }
        
        return {
            valid: issues.length === 0,
            issues
        };
    }
    
    /**
     * ネストされたオブジェクトから値を取得
     * @param obj - オブジェクト
     * @param path - パス（例: 'playerData.ap'）
     * @returns 値
     */
    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }
    
    /**
     * フィールドの型を検証
     * @param value - 値
     * @param rule - 検証ルール
     * @param path - フィールドパス
     * @returns 検証結果
     */
    private validateFieldType(value: any, rule: ValidationRule, path: string): ValidationResult {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        
        if (actualType !== rule.type) {
            return {
                valid: false,
                error: `Field ${path} expected ${rule.type}, got ${actualType}`
            };
        }
        
        // 数値の範囲チェック
        if (rule.type === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                return {
                    valid: false,
                    error: `Field ${path} value ${value} below minimum ${rule.min}`
                };
            }
            
            if (rule.max !== undefined && value > rule.max) {
                return {
                    valid: false,
                    error: `Field ${path} value ${value} above maximum ${rule.max}`
                };
            }
        }
        
        return { valid: true };
    }
    
    /**
     * インポートデータを正規化
     * @param data - 生データ
     * @returns 正規化されたデータ
     */
    normalizeImportData(data: ImportData): ImportData {
        const normalized: ImportData = {
            version: data.version,
            playerData: {
                username: data.playerData.username || null,
                ap: Math.max(0, data.playerData.ap || 0),
                tap: Math.max(0, data.playerData.tap || 0),
                highScore: Math.max(0, data.playerData.highScore || 0),
                unlockedStages: Array.isArray(data.playerData.unlockedStages) ? data.playerData.unlockedStages : [],
                ownedItems: Array.isArray(data.playerData.ownedItems) ? data.playerData.ownedItems : []
            }
        };
        
        if (data.statistics) {
            normalized.statistics = {
                totalPlayTime: Math.max(0, data.statistics.totalPlayTime || 0),
                bubblesPopped: Math.max(0, data.statistics.bubblesPopped || 0),
                gamesPlayed: Math.max(0, data.statistics.gamesPlayed || 0)
            };
        }
        
        if (data.achievements) {
            normalized.achievements = data.achievements.filter(achievement => 
                achievement.id && typeof achievement.id === 'string'
            );
        }
        
        if (data.settings) {
            normalized.settings = { ...data.settings };
        }
        
        if (data.timestamp) {
            normalized.timestamp = data.timestamp;
        }
        
        return normalized;
    }
    
    /**
     * サポートされているバージョン一覧を取得
     * @returns バージョン配列
     */
    getSupportedVersions(): string[] {
        return [...this.supportedVersions];
    }
    
    /**
     * 最大データサイズを取得
     * @returns バイト数
     */
    getMaxDataSize(): number {
        return this.maxDataSize;
    }
    
    /**
     * 検証ルールを取得
     * @returns 検証ルール
     */
    getValidationRules(): ValidationRules {
        return { ...this.validationRules };
    }
}