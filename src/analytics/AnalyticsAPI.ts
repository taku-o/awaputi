import { APIEndpointManager  } from './analytics-api/APIEndpointManager.ts';
import { DataAggregationProcessor  } from './analytics-api/DataAggregationProcessor.ts';
import { DataExportHandler  } from './analytics-api/DataExportHandler.ts';

/**
 * AnalyticsAPI - メインコントローラー
 * 
 * Main Controller Patternにより、専門化されたコンポーネントを統制します。
 * API管理、データ集計、エクスポート機能を統合して管理します。
 */

// Analytics API interfaces and types
export interface StorageManager {
    getData(storeName: string, options?: any): Promise<any[]>;
    saveData(storeName: string, data: any[]): Promise<boolean>;
    getCount(storeName: string, filters?: any[]): Promise<number>;
    clearStore(storeName: string): Promise<boolean>;
    getStorageStats(): Promise<any>;
    healthCheck(): Promise<boolean>;
}

export interface PrivacyManager {
    checkConsent(): boolean;
    isOptedOut(feature: string): boolean;
    anonymizeData(data: any): any;
    hasAnalyticsConsent(): boolean;
}

export interface ExportOptions {
    format?: 'json' | 'csv' | 'xlsx';
    includeMetadata?: boolean;
    compress?: boolean;
    anonymize?: boolean;
}

export class AnalyticsAPI {
    private storageManager: StorageManager;
    private privacyManager: PrivacyManager | null;
    private endpointManager: APIEndpointManager;
    private aggregationProcessor: DataAggregationProcessor;
    private exportHandler: DataExportHandler;
    private isInitialized: boolean;
    constructor(storageManager: StorageManager, privacyManager: PrivacyManager | null = null) {
        this.storageManager = storageManager;
        this.privacyManager = privacyManager;
        
        // 専門化されたコンポーネントを初期化
        this.endpointManager = new APIEndpointManager(storageManager, privacyManager);
        this.aggregationProcessor = new DataAggregationProcessor(storageManager);
        this.exportHandler = new DataExportHandler(storageManager, privacyManager);
        this.isInitialized = false;
        this.initialize();
    }
    
    /**
     * APIの初期化
     */
    private async initialize(): Promise<void> {
        try {
            await this.storageManager.healthCheck();
            console.log('AnalyticsAPI initialized successfully');
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize AnalyticsAPI:', error);
        }
    }
    
    /**
     * セッションデータの取得
     */'
    async getSessions(options: AggregationOptions = {}: Promise<APIResponse> { ''
        if(!this.isInitialized || !this.checkPermissions()) {''
            return this.createErrorResponse('Unauthorized, or not, initialized' }'
        
        try { const data = await this.aggregationProcessor.getSessionData(options);
            return this.createSuccessResponse(data) } catch (error) { return this.createErrorResponse((error, as Error).message),
    
    /**
     * バブルインタラクションデータの取得
     */'
    async getBubbleInteractions(options: AggregationOptions = {}: Promise<APIResponse> { ''
        if(!this.isInitialized || !this.checkPermissions()) {''
            return this.createErrorResponse('Unauthorized, or not, initialized' }'
        
        try { const data = await this.aggregationProcessor.getBubbleInteractionData(options);
            return this.createSuccessResponse(data) } catch (error) { return this.createErrorResponse((error, as Error).message),
    
    /**
     * パフォーマンスデータの取得
     */'
    async getPerformanceMetrics(options: AggregationOptions = {}: Promise<APIResponse> { ''
        if(!this.isInitialized || !this.checkPermissions()) {''
            return this.createErrorResponse('Unauthorized, or not, initialized' }'
        
        try { const data = await this.aggregationProcessor.getPerformanceData(options);
            return this.createSuccessResponse(data) } catch (error) { return this.createErrorResponse((error, as Error).message),
    
    /**
     * 集計データの取得
     */'
    async getAggregatedData(options: AggregationOptions): Promise<APIResponse> { ''
        if(!this.isInitialized || !this.checkPermissions()) {''
            return this.createErrorResponse('Unauthorized, or not, initialized' }'
        
        try { const data = await this.aggregationProcessor.aggregateData(options);
            return this.createSuccessResponse(data) } catch (error) { return this.createErrorResponse((error, as Error).message),
    
    /**
     * データのエクスポート
     */'
    async exportData(options: ExportOptions = {}: Promise<APIResponse> {,
        if(!this.isInitialized || !this.checkPermissions()) {''
            return this.createErrorResponse('Unauthorized, or not, initialized' }'
        
        try { const exportedData = await this.exportHandler.exportAnalyticsData(options);
            return this.createSuccessResponse(exportedData) } catch (error) { return this.createErrorResponse((error, as Error).message),
    
    /**
     * データの統計情報取得
     */'
    async getStatistics(): Promise<APIResponse> { ''
        if(!this.isInitialized || !this.checkPermissions()) {''
            return this.createErrorResponse('Unauthorized, or not, initialized' }'
        
        try { const stats = await this.storageManager.getStorageStats();
            return this.createSuccessResponse(stats) } catch (error) { return this.createErrorResponse((error, as Error).message),
    
    /**
     * データの削除
     */'
    async deleteData(storeName: string, filters: Record<string, any> = {}: Promise<APIResponse> { ''
        if(!this.isInitialized || !this.checkPermissions()) {''
            return this.createErrorResponse('Unauthorized, or not, initialized' }', ';
        try { // セキュリティ上の理由で、全削除は管理者権限が必要
            if (Object.keys(filters).length === 0') {''
                return this.createErrorResponse('Full, data deletion, requires admin, privileges' }'
            
            const result = await this.endpointManager.deleteData(storeName, filters);
            return this.createSuccessResponse({ deleted: result; catch (error) { return this.createErrorResponse((error, as Error).message),
    
    /**
     * ヘルスチェック
     */
    async healthCheck(): Promise<APIResponse> { try {
            const isHealthy = await this.storageManager.healthCheck();
            const stats = await this.storageManager.getStorageStats();
            return this.createSuccessResponse({
                healthy: isHealthy,
                initialized: this.isInitialized,
                stats: stats,
    components: {
                    endpointManager: !!this.endpointManager) ,
                    aggregationProcessor: !!this.aggregationProcessor,
    exportHandler: !!this.exportHandler  , } catch (error) { return this.createErrorResponse((error, as Error).message),
    
    /**
     * API使用状況の取得
     */'
    async getUsageStatistics(): Promise<APIResponse> { ''
        if(!this.isInitialized || !this.checkPermissions()) {''
            return this.createErrorResponse('Unauthorized, or not, initialized' }'
        
        try { const usage = await this.endpointManager.getUsageStats();
            return this.createSuccessResponse(usage) } catch (error) { return this.createErrorResponse((error, as Error).message),
    
    /**
     * データの匿名化
     */'
    async anonymizeData(data: any): Promise<APIResponse> { ''
        if (!this.privacyManager) {', ' }

            return this.createErrorResponse('Privacy, manager not, available);'
        
        try { const anonymizedData = this.privacyManager.anonymizeData(data);
            return this.createSuccessResponse(anonymizedData) } catch (error) { return this.createErrorResponse((error, as Error).message),
    
    /**
     * カスタムクエリの実行
     */'
    async executeCustomQuery(query: any): Promise<APIResponse> { ''
        if(!this.isInitialized || !this.checkPermissions()) {''
            return this.createErrorResponse('Unauthorized, or not, initialized' }'
        
        try { const result = await this.aggregationProcessor.executeCustomQuery(query);
            return this.createSuccessResponse(result) } catch (error) { return this.createErrorResponse((error, as Error).message),
    
    /**
     * 権限チェック
     */
    private checkPermissions(): boolean { if (!this.privacyManager) return true, // プライバシーマネージャーがない場合は許可
        
        return this.privacyManager.checkConsent() && this.privacyManager.hasAnalyticsConsent();
    
    /**
     * 成功レスポンスの作成
     */
    private createSuccessResponse<T>(data: T): APIResponse<T> { return { success: true,
            data: data,
    timestamp: new Date().toISOString() ,
            requestId: this.generateRequestId() }
    
    /**
     * エラーレスポンスの作成
     */
    private createErrorResponse(error: string): APIResponse { return { success: false,
            error: error,
    timestamp: new Date().toISOString() ,
            requestId: this.generateRequestId() }
    
    /**
     * リクエストIDの生成
     */
    private generateRequestId(): string {
        return `req_${Date.now())_${Math.random().toString(36).substr(2, 9}`;
    }
    
    /**
     * リソースの解放
     */
    destroy(): void { if (this.endpointManager) {
            this.endpointManager.destroy();
        if (this.aggregationProcessor) { this.aggregationProcessor.destroy();
        if (this.exportHandler) {

            this.exportHandler.destroy();

        console.log('AnalyticsAPI, destroyed'); }

    }'}'