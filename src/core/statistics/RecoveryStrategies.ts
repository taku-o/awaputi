/**
 * RecoveryStrategies
 * 個別復旧戦略実装、破損検出・処理、部分損失復旧、バージョン不一致解決を担当
 */

// 型定義
export interface DataRecovery {
    statisticsManager: StatisticsManager;
    errorHandler: ErrorHandler;
    updateProgress(step: string, progress: number): void;
    analyzeDataIntegrity(data: any): Promise<IntegrityAnalysis>;
    calculateChecksum(data: any): string;
    repairObjectStructure(data: any, template: any): any;
}

export interface StatisticsManager {
    getDefaultStatistics(): DefaultStatistics;
    getLatestBackup(): Promise<BackupData | null>;
    getHistoricalData(): Promise<HistoricalDataEntry[]>;
    [key: string]: any;
}

export interface ErrorHandler {
    handleError(error: Error, errorType: string, context?: any): void;
}

export interface DefaultStatistics {
    totalScore: number;
    averageScore: number;
    playTime: number;
    totalGamesPlayed: number;
    wins: number;
    losses: number;
    bubbleStats: BubbleStats;
    comboStats: ComboStats;
    achievementStats: AchievementStats;
    timeStats: TimeStats;
    sessionStats: SessionStats;
    [key: string]: any;
}

export interface BubbleStats {
    normal: number;
    electric: number;
    diamond: number;
    rainbow: number;
    [key: string]: number;
}

export interface ComboStats {
    maxCombo: number;
    totalCombos: number;
    averageCombo: number;
}

export interface AchievementStats {
    total: number;
    unlocked: number;
    progress?: Record<string, any>;
}

export interface TimeStats {
    playTime: number;
    averageSessionTime: number;
}

export interface SessionStats {
    recentSessions?: SessionData[];
    [key: string]: any;
}

export interface SessionData {
    timestamp: number;
    duration: number;
    score: number;
    [key: string]: any;
}

export interface BackupData {
    data: any;
    timestamp: string;
    version?: string;
}

export interface HistoricalDataEntry {
    timestamp: number;
    data: any;
    source: string;
}

export interface IntegrityAnalysis {
    isValid: boolean;
    validFieldsRatio: number;
    invalidFields: string[];
    [key: string]: any;
}

export interface RecoveryAnalysis {
    corruptedData?: any;
    corruptionLevel?: number;
    corruptedFields?: string[];
    partialData?: any;
    missingFields?: string[];
    dataIntegrity?: number;
    oldData?: any;
    currentVersion?: string;
    dataVersion?: string;
    data?: any;
    expectedChecksum?: string;
    actualChecksum?: string;
    damagedData?: any;
    expectedStructure?: any;
    structureDamage?: StructureDamage;
    [key: string]: any;
}

export interface StructureDamage {
    missingFields?: string[];
    extraFields?: string[];
    typeErrors?: TypeError[];
}

export interface TypeError {
    field: string;
    expected: string;
    actual: string;
}

export interface RecoveryResult {
    success: boolean;
    data?: any;
    repairLog?: string[];
    migrationLog?: string[];
    recoveryMethod: RecoveryMethod;
    error?: string;
    corruptionLevel?: number;
    fieldsRepaired?: number;
    fieldsRecovered?: number;
    dataIntegrity?: number;
    fromVersion?: string;
    toVersion?: string;
    newChecksum?: string;
    missingFields?: number;
    dataSource?: DataSource;
}

export interface FieldRepairResult {
    success: boolean;
    data?: any;
    error?: string;
}

export interface InterpolationResult {
    data: any;
    log: string[];
}

export interface MigrationResult {
    success: boolean;
    data?: any;
    log?: string[];
    error?: string;
}

export interface ConversionResult {
    data: any;
    log: string[];
}

export interface StrategyStats {
    totalStrategies: number;
    availableStrategies: string[];
    recoveryPriority: string[];
}

export interface FieldTemplates {
    bubbleStats: BubbleStats;
    comboStats: ComboStats;
    achievementStats: AchievementStats;
    [key: string]: any;
}

// コールバック型
export type RecoveryStrategy = (analysis: RecoveryAnalysis, options?: RecoveryOptions) => Promise<RecoveryResult>;

// オプション型
export interface RecoveryOptions {
    [key: string]: any;
}

// 列挙型
export type RecoveryMethod = 
    | 'corruption_repair' 
    | 'partial_loss_recovery' 
    | 'version_migration' 
    | 'checksum_recalculation' 
    | 'checksum_recovery'
    | 'structure_rebuild' 
    | 'complete_recovery';

export type DataSource = 'backup' | 'history' | 'default';
export type FieldType = 'number' | 'object' | 'array' | 'string' | 'unknown';

export class RecoveryStrategies {
    private dataRecovery: DataRecovery;
    private statisticsManager: StatisticsManager;
    private errorHandler: ErrorHandler;
    private strategies: Map<string, RecoveryStrategy>;
    private recoveryPriority: string[];

    constructor(dataRecovery: DataRecovery) {
        this.dataRecovery = dataRecovery;
        this.statisticsManager = dataRecovery.statisticsManager;
        this.errorHandler = dataRecovery.errorHandler;
        
        // 復旧戦略マップ
        this.strategies = new Map<string, RecoveryStrategy>([
            ['corruption', this.recoverFromCorruption.bind(this)],
            ['partial_loss', this.recoverFromPartialLoss.bind(this)],
            ['version_mismatch', this.recoverFromVersionMismatch.bind(this)],
            ['checksum_failure', this.recoverFromChecksumFailure.bind(this)],
            ['structure_damage', this.recoverFromStructureDamage.bind(this)],
            ['complete_loss', this.recoverFromCompleteLoss.bind(this)]
        ]);
        
        // 復旧優先度（高い順）
        this.recoveryPriority = [
            'gamePlayStats',
            'scoreStats', 
            'bubbleStats',
            'comboStats',
            'achievementStats',
            'timeStats',
            'sessionStats'
        ];
        
        console.log('[RecoveryStrategies] Component initialized');
    }
    
    /**
     * 復旧戦略を実行
     * @param strategyName 戦略名
     * @param analysis 分析結果
     * @param options オプション
     * @returns 復旧結果
     */
    async executeStrategy(strategyName: string, analysis: RecoveryAnalysis, options: RecoveryOptions = {}): Promise<RecoveryResult> {
        try {
            const strategy = this.strategies.get(strategyName);
            if (!strategy) {
                throw new Error(`Unknown recovery strategy: ${strategyName}`);
            }
            
            console.log(`[RecoveryStrategies] Executing strategy: ${strategyName}`);
            this.dataRecovery.updateProgress(`recovery_${strategyName}`, 0);
            
            const result = await strategy(analysis, options);
            
            this.dataRecovery.updateProgress(`recovery_${strategyName}`, 100);
            console.log(`[RecoveryStrategies] Strategy completed: ${strategyName}`);
            
            return result;
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'RECOVERY_STRATEGY_ERROR', {
                strategy: strategyName,
                analysis,
                options
            });
            throw error;
        }
    }
    
    /**
     * データ破損からの復旧
     * @param analysis 破損分析結果
     * @param options 復旧オプション
     * @returns 復旧結果
     */
    async recoverFromCorruption(analysis: RecoveryAnalysis, options: RecoveryOptions = {}): Promise<RecoveryResult> {
        console.log('[RecoveryStrategies] Starting corruption recovery');
        
        try {
            const { corruptedData, corruptionLevel = 0, corruptedFields = [] } = analysis;
            const recoveredData = { ...corruptedData };
            const repairLog: string[] = [];
            
            // 軽度な破損の場合：フィールド単位で修復
            if (corruptionLevel < 0.3) {
                for (const field of corruptedFields) {
                    const repaired = await this._repairCorruptedField(field, recoveredData[field]);
                    if (repaired.success && repaired.data !== undefined) {
                        recoveredData[field] = repaired.data;
                        repairLog.push(`Repaired field: ${field}`);
                    }
                }
            }
            // 中度な破損の場合：統計的補間
            else if (corruptionLevel < 0.7) {
                const interpolated = await this._interpolateCorruptedData(recoveredData, analysis);
                Object.assign(recoveredData, interpolated.data);
                repairLog.push(...interpolated.log);
            }
            // 重度な破損の場合：バックアップから復元
            else {
                const backup = await this.statisticsManager.getLatestBackup();
                if (backup) {
                    Object.assign(recoveredData, backup.data);
                    repairLog.push('Restored from backup due to severe corruption');
                } else {
                    // バックアップがない場合は初期化
                    const defaultData = this.statisticsManager.getDefaultStatistics();
                    Object.assign(recoveredData, defaultData);
                    repairLog.push('Initialized with default data - no backup available');
                }
            }
            
            return {
                success: true,
                data: recoveredData,
                repairLog,
                recoveryMethod: 'corruption_repair',
                corruptionLevel,
                fieldsRepaired: corruptedFields.length
            };
            
        } catch (error) {
            console.error('[RecoveryStrategies] Corruption recovery failed:', error);
            return {
                success: false,
                error: (error as Error).message,
                recoveryMethod: 'corruption_repair'
            };
        }
    }
    
    /**
     * 部分データ損失からの復旧
     * @param analysis 損失分析結果
     * @param options 復旧オプション
     * @returns 復旧結果
     */
    async recoverFromPartialLoss(analysis: RecoveryAnalysis, options: RecoveryOptions = {}): Promise<RecoveryResult> {
        console.log('[RecoveryStrategies] Starting partial loss recovery');
        
        try {
            const { partialData, missingFields = [], dataIntegrity } = analysis;
            const recoveredData = { ...partialData };
            const repairLog: string[] = [];
            
            // 優先度順に欠損フィールドを復旧
            for (const field of this.recoveryPriority) {
                if (missingFields.includes(field)) {
                    const recovered = await this._recoverMissingField(field, recoveredData);
                    if (recovered.success && recovered.data !== undefined) {
                        recoveredData[field] = recovered.data;
                        repairLog.push(`Recovered missing field: ${field}`);
                    } else {
                        // デフォルト値で初期化
                        const defaultValue = this._getDefaultFieldValue(field);
                        recoveredData[field] = defaultValue;
                        repairLog.push(`Initialized field with default: ${field}`);
                    }
                }
            }
            
            return {
                success: true,
                data: recoveredData,
                repairLog,
                recoveryMethod: 'partial_loss_recovery',
                fieldsRecovered: missingFields.length,
                dataIntegrity
            };
            
        } catch (error) {
            console.error('[RecoveryStrategies] Partial loss recovery failed:', error);
            return {
                success: false,
                error: (error as Error).message,
                recoveryMethod: 'partial_loss_recovery'
            };
        }
    }
    
    /**
     * バージョン不一致からの復旧
     * @param analysis バージョン分析結果
     * @param options 復旧オプション
     * @returns 復旧結果
     */
    async recoverFromVersionMismatch(analysis: RecoveryAnalysis, options: RecoveryOptions = {}): Promise<RecoveryResult> {
        console.log('[RecoveryStrategies] Starting version mismatch recovery');
        
        try {
            const { oldData, currentVersion, dataVersion } = analysis;
            const migratedData = { ...oldData };
            const migrationLog: string[] = [];
            
            // バージョン間マイグレーション
            const migrationResult = await this._migrateDataToVersion(
                migratedData, 
                dataVersion || 'unknown', 
                currentVersion || 'latest'
            );
            
            if (migrationResult.success && migrationResult.data) {
                Object.assign(migratedData, migrationResult.data);
                migrationLog.push(...(migrationResult.log || []));
            } else {
                // マイグレーション失敗時は構造を現在のバージョンに合わせて初期化
                const currentStructure = this.statisticsManager.getDefaultStatistics();
                const converted = this._convertToCurrentStructure(oldData, currentStructure);
                Object.assign(migratedData, converted.data);
                migrationLog.push(...converted.log);
            }
            
            return {
                success: true,
                data: migratedData,
                migrationLog,
                recoveryMethod: 'version_migration',
                fromVersion: dataVersion,
                toVersion: currentVersion
            };
            
        } catch (error) {
            console.error('[RecoveryStrategies] Version mismatch recovery failed:', error);
            return {
                success: false,
                error: (error as Error).message,
                recoveryMethod: 'version_migration'
            };
        }
    }
    
    /**
     * チェックサム失敗からの復旧
     * @param analysis チェックサム分析結果
     * @param options 復旧オプション
     * @returns 復旧結果
     */
    async recoverFromChecksumFailure(analysis: RecoveryAnalysis, options: RecoveryOptions = {}): Promise<RecoveryResult> {
        console.log('[RecoveryStrategies] Starting checksum failure recovery');
        
        try {
            const { data, expectedChecksum, actualChecksum } = analysis;
            const recoveredData = { ...data };
            const repairLog: string[] = [];
            
            // データの整合性を検証し、問題のある部分を特定
            const integrityCheck = await this.dataRecovery.analyzeDataIntegrity(data);
            
            if (integrityCheck.isValid) {
                // データ自体は有効なので、チェックサムを再計算
                const newChecksum = this.dataRecovery.calculateChecksum(recoveredData);
                repairLog.push(`Recalculated checksum: ${expectedChecksum} -> ${newChecksum}`);
                
                return {
                    success: true,
                    data: recoveredData,
                    repairLog,
                    recoveryMethod: 'checksum_recalculation',
                    newChecksum
                };
            } else {
                // データに問題がある場合は破損として処理
                return await this.recoverFromCorruption({
                    corruptedData: data,
                    corruptionLevel: 1 - integrityCheck.validFieldsRatio,
                    corruptedFields: integrityCheck.invalidFields
                }, options);
            }
            
        } catch (error) {
            console.error('[RecoveryStrategies] Checksum failure recovery failed:', error);
            return {
                success: false,
                error: (error as Error).message,
                recoveryMethod: 'checksum_recovery'
            };
        }
    }
    
    /**
     * 構造破損からの復旧
     * @param analysis 構造分析結果
     * @param options 復旧オプション
     * @returns 復旧結果
     */
    async recoverFromStructureDamage(analysis: RecoveryAnalysis, options: RecoveryOptions = {}): Promise<RecoveryResult> {
        console.log('[RecoveryStrategies] Starting structure damage recovery');
        
        try {
            const { damagedData, expectedStructure, structureDamage } = analysis;
            const recoveredData: any = {};
            const repairLog: string[] = [];
            
            // 期待される構造に基づいてデータを再構築
            const rebuilt = this.dataRecovery.repairObjectStructure(damagedData, expectedStructure);
            Object.assign(recoveredData, rebuilt);
            repairLog.push('Rebuilt data structure based on expected schema');
            
            // 失われたフィールドをデフォルト値で補完
            for (const field of structureDamage?.missingFields || []) {
                const defaultValue = this._getDefaultFieldValue(field);
                recoveredData[field] = defaultValue;
                repairLog.push(`Added missing field with default: ${field}`);
            }
            
            return {
                success: true,
                data: recoveredData,
                repairLog,
                recoveryMethod: 'structure_rebuild',
                missingFields: structureDamage?.missingFields?.length || 0
            };
            
        } catch (error) {
            console.error('[RecoveryStrategies] Structure damage recovery failed:', error);
            return {
                success: false,
                error: (error as Error).message,
                recoveryMethod: 'structure_rebuild'
            };
        }
    }
    
    /**
     * 完全データ損失からの復旧
     * @param analysis 損失分析結果
     * @param options 復旧オプション
     * @returns 復旧結果
     */
    async recoverFromCompleteLoss(analysis: RecoveryAnalysis, options: RecoveryOptions = {}): Promise<RecoveryResult> {
        console.log('[RecoveryStrategies] Starting complete loss recovery');
        
        try {
            const repairLog: string[] = [];
            let recoveredData: any = null;
            let dataSource: DataSource = 'default';
            
            // 1. 最新のバックアップから復元を試行
            const latestBackup = await this.statisticsManager.getLatestBackup();
            if (latestBackup && latestBackup.data) {
                recoveredData = { ...latestBackup.data };
                repairLog.push(`Restored from backup: ${latestBackup.timestamp}`);
                dataSource = 'backup';
            }
            
            // 2. バックアップがない場合は履歴データから復元を試行
            if (!recoveredData) {
                const historyData = await this.statisticsManager.getHistoricalData();
                if (historyData && historyData.length > 0) {
                    recoveredData = this._reconstructFromHistory(historyData);
                    repairLog.push('Reconstructed from historical data');
                    dataSource = 'history';
                }
            }
            
            // 3. 全て失敗した場合はデフォルトデータで初期化
            if (!recoveredData) {
                recoveredData = this.statisticsManager.getDefaultStatistics();
                repairLog.push('Initialized with default statistics (complete data loss)');
                dataSource = 'default';
            }
            
            return {
                success: true,
                data: recoveredData,
                repairLog,
                recoveryMethod: 'complete_recovery',
                dataSource
            };
            
        } catch (error) {
            console.error('[RecoveryStrategies] Complete loss recovery failed:', error);
            return {
                success: false,
                error: (error as Error).message,
                recoveryMethod: 'complete_recovery'
            };
        }
    }
    
    /**
     * 破損フィールドを修復
     * @param fieldName フィールド名
     * @param corruptedValue 破損した値
     * @returns 修復結果
     * @private
     */
    private async _repairCorruptedField(fieldName: string, corruptedValue: any): Promise<FieldRepairResult> {
        try {
            // フィールドタイプに応じた修復戦略
            const fieldType = this._getFieldType(fieldName);
            
            switch (fieldType) {
                case 'number':
                    const repaired = this._repairNumericField(corruptedValue);
                    return { success: true, data: repaired };
                    
                case 'object':
                    const template = this._getFieldTemplate(fieldName);
                    const repairedObj = this.dataRecovery.repairObjectStructure(corruptedValue, template);
                    return { success: true, data: repairedObj };
                    
                case 'array':
                    const repairedArray = this._repairArrayField(corruptedValue);
                    return { success: true, data: repairedArray };
                    
                default:
                    return { success: false, error: `Unknown field type: ${fieldType}` };
            }
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }
    
    /**
     * 破損データの統計的補間
     * @param data データ
     * @param analysis 分析結果
     * @returns 補間結果
     * @private
     */
    private async _interpolateCorruptedData(data: any, analysis: RecoveryAnalysis): Promise<InterpolationResult> {
        // 簡単な統計的補間の実装
        const interpolatedData = { ...data };
        const log: string[] = [];
        
        // 基本的な補間ロジック
        if (analysis.corruptedFields) {
            for (const field of analysis.corruptedFields) {
                const defaultValue = this._getDefaultFieldValue(field);
                interpolatedData[field] = defaultValue;
                log.push(`Interpolated field ${field} with default value`);
            }
        }
        
        return { data: interpolatedData, log };
    }
    
    /**
     * データのバージョン間マイグレーション
     * @param data データ
     * @param fromVersion 元バージョン
     * @param toVersion 対象バージョン
     * @returns マイグレーション結果
     * @private
     */
    private async _migrateDataToVersion(data: any, fromVersion: string, toVersion: string): Promise<MigrationResult> {
        try {
            // 基本的なマイグレーションロジック
            const migratedData = { ...data };
            const log: string[] = [];
            
            log.push(`Migrating data from ${fromVersion} to ${toVersion}`);
            
            // バージョン固有のマイグレーション処理をここに追加
            // 現在は基本的なフィールド追加のみ実装
            const currentStructure = this.statisticsManager.getDefaultStatistics();
            for (const [key, value] of Object.entries(currentStructure)) {
                if (!(key in migratedData)) {
                    migratedData[key] = value;
                    log.push(`Added missing field: ${key}`);
                }
            }
            
            return { success: true, data: migratedData, log };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }
    
    /**
     * 現在の構造に変換
     * @param oldData 古いデータ
     * @param currentStructure 現在の構造
     * @returns 変換結果
     * @private
     */
    private _convertToCurrentStructure(oldData: any, currentStructure: any): ConversionResult {
        const convertedData = { ...currentStructure };
        const log: string[] = [];
        
        // 既存データで上書き可能なフィールドを復元
        for (const [key, value] of Object.entries(oldData)) {
            if (key in currentStructure && typeof value === typeof currentStructure[key]) {
                convertedData[key] = value;
                log.push(`Preserved field: ${key}`);
            } else {
                log.push(`Discarded incompatible field: ${key}`);
            }
        }
        
        return { data: convertedData, log };
    }
    
    /**
     * 履歴データから再構築
     * @param historyData 履歴データ
     * @returns 再構築されたデータ
     * @private
     */
    private _reconstructFromHistory(historyData: HistoricalDataEntry[]): any {
        // 最新のデータから復元
        if (historyData.length > 0) {
            return { ...historyData[historyData.length - 1].data };
        }
        
        return this.statisticsManager.getDefaultStatistics();
    }
    
    /**
     * 数値フィールドを修復
     * @param value 破損した値
     * @returns 修復された値
     * @private
     */
    private _repairNumericField(value: any): number {
        if (typeof value === 'number' && !isNaN(value)) {
            return Math.max(0, value); // 負の値は0に修正
        }
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            if (!isNaN(parsed)) {
                return Math.max(0, parsed);
            }
        }
        return 0; // 修復不可能な場合は0
    }
    
    /**
     * 配列フィールドを修復
     * @param value 破損した値
     * @returns 修復された配列
     * @private
     */
    private _repairArrayField(value: any): any[] {
        if (Array.isArray(value)) {
            return value.filter(item => item !== null && item !== undefined);
        }
        return []; // 修復不可能な場合は空配列
    }
    
    /**
     * 欠損フィールドを復旧
     * @param fieldName フィールド名
     * @param existingData 既存データ
     * @returns 復旧結果
     * @private
     */
    private async _recoverMissingField(fieldName: string, existingData: any): Promise<FieldRepairResult> {
        try {
            // 関連するフィールドから推定
            const estimatedValue = this._estimateFieldValue(fieldName, existingData);
            return { success: true, data: estimatedValue };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }
    
    /**
     * フィールド値を推定
     * @param fieldName フィールド名
     * @param existingData 既存データ
     * @returns 推定値
     * @private
     */
    private _estimateFieldValue(fieldName: string, existingData: any): any {
        // フィールドタイプに応じた推定ロジック
        switch (fieldName) {
            case 'totalGamesPlayed':
                return Math.max(1, (existingData.wins || 0) + (existingData.losses || 0));
            case 'totalScore':
                return (existingData.averageScore || 0) * (existingData.totalGamesPlayed || 1);
            case 'playTime':
                return (existingData.totalGamesPlayed || 1) * 300000; // 5分平均と仮定
            default:
                return this._getDefaultFieldValue(fieldName);
        }
    }
    
    /**
     * デフォルトフィールド値を取得
     * @param fieldName フィールド名
     * @returns デフォルト値
     * @private
     */
    private _getDefaultFieldValue(fieldName: string): any {
        const defaults = this.statisticsManager.getDefaultStatistics();
        return this._getNestedValue(defaults, fieldName) || 0;
    }
    
    /**
     * ネストした値を取得
     * @param obj オブジェクト
     * @param path ドット記法のパス
     * @returns 値
     * @private
     */
    private _getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    /**
     * フィールドタイプを取得
     * @param fieldName フィールド名
     * @returns フィールドタイプ
     * @private
     */
    private _getFieldType(fieldName: string): FieldType {
        const numericFields = ['totalScore', 'averageScore', 'playTime', 'totalGamesPlayed'];
        const objectFields = ['bubbleStats', 'comboStats', 'achievementStats'];
        const arrayFields = ['recentScores', 'sessionHistory'];
        
        if (numericFields.includes(fieldName)) return 'number';
        if (objectFields.includes(fieldName)) return 'object';
        if (arrayFields.includes(fieldName)) return 'array';
        return 'unknown';
    }
    
    /**
     * フィールドテンプレートを取得
     * @param fieldName フィールド名
     * @returns テンプレート
     * @private
     */
    private _getFieldTemplate(fieldName: string): any {
        const templates: FieldTemplates = {
            bubbleStats: { normal: 0, electric: 0, diamond: 0, rainbow: 0 },
            comboStats: { maxCombo: 0, totalCombos: 0, averageCombo: 0 },
            achievementStats: { total: 0, unlocked: 0, progress: {} }
        };
        return templates[fieldName] || {};
    }
    
    /**
     * 利用可能な戦略一覧を取得
     * @returns 戦略名のリスト
     */
    getAvailableStrategies(): string[] {
        return Array.from(this.strategies.keys());
    }
    
    /**
     * 戦略の統計情報を取得
     * @returns 戦略統計
     */
    getStrategyStats(): StrategyStats {
        return {
            totalStrategies: this.strategies.size,
            availableStrategies: this.getAvailableStrategies(),
            recoveryPriority: [...this.recoveryPriority]
        };
    }
}