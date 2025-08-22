/**
 * Privacy Manager
 * プライバシー保護とGDPR準拠を管理
 */

// Privacy Manager interfaces and types
export interface ConsentStatus {
    hasConsented: boolean;
    consentDate: string;
    version: string;
    features: Record<string, boolean>;
}

export interface AnonymizationRule {
    (value: any): any;
}

export type PrivacyFeature = 'sessionTracking' | 'behaviorAnalysis' | 'performanceTracking' | 'analytics' | 'cookies';

export class PrivacyManager {
    private consentStatus: ConsentStatus | null;
    private anonymizationRules: Map<string, AnonymizationRule>;
    private optOutFeatures: Set<PrivacyFeature>;
    private consentVersion: string;

    constructor() {
        this.consentStatus = null;
        this.anonymizationRules = new Map();
        this.optOutFeatures = new Set();
        this.consentVersion = '1.0';
        
        // デフォルトの匿名化ルール
        this.setupDefaultAnonymizationRules();
        
        // 保存されている同意状態を読み込み
        this.loadConsentStatus();
    }
    
    /**
     * デフォルトの匿名化ルール設定
     */
    private setupDefaultAnonymizationRules(): void {
        // IPアドレスの匿名化
        this.anonymizationRules.set('ipAddress', (value: string): string | null => {
            if(!value) return null;
            const parts = value.split('.');
            if (parts.length === 4) {
                // 最後のオクテットを0に置換
                return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
            }
            return value;
        });
        
        // ユーザーエージェントの匿名化
        this.anonymizationRules.set('userAgent', (value: string): string | null => {
            if(!value) return null;
            
            // バージョン番号を除去
            return value.replace(/\d+\.\d+[\.\d]*/g, 'X.X');
        });
        
        // セッションIDの匿名化
        this.anonymizationRules.set('sessionId', (value: string): string | null => {
            if (!value) return null;
            // セッションIDをハッシュ化
            return this.hashValue(value);
        });
        
        // タイムスタンプの曖昧化（分単位に丸める）
        this.anonymizationRules.set('timestamp', (value: number): number => {
            if (!value) return 0;
            return Math.floor(value / 60000) * 60000; // 分単位に丸める
        });
        
        // 座標の曖昧化
        this.anonymizationRules.set('coordinates', (value: { x: number; y: number }): { x: number; y: number } | null => {
            if(!value || typeof value.x !== 'number' || typeof value.y !== 'number') return null;
            // 10ピクセル単位に丸める
            return {
                x: Math.round(value.x / 10) * 10,
                y: Math.round(value.y / 10) * 10
            };
        });
    }
    
    /**
     * 同意状態の確認
     */
    checkConsent(): boolean {
        if (!this.consentStatus) return false;
        return this.consentStatus.hasConsented;
    }
    
    /**
     * 機能のオプトアウト確認
     */
    isOptedOut(feature: PrivacyFeature): boolean {
        return this.optOutFeatures.has(feature);
    }
    
    /**
     * 同意の設定
     */
    setConsent(consent: boolean, features: Record<string, boolean> = {}): void {
        this.consentStatus = {
            hasConsented: consent,
            consentDate: new Date().toISOString(),
            version: this.consentVersion,
            features: features
        };
        
        // オプトアウト機能の更新
        this.optOutFeatures.clear();
        Object.entries(features).forEach(([feature, enabled]) => {
            if (!enabled) {
                this.optOutFeatures.add(feature as PrivacyFeature);
            }
        });
        
        this.saveConsentStatus();
    }
    
    /**
     * データの匿名化
     */
    anonymizeData(data: any): any {
        if(!data || typeof data !== 'object') return data;
        
        const anonymized = JSON.parse(JSON.stringify(data)); // ディープコピー
        
        return this.applyAnonymizationRules(anonymized);
    }
    
    /**
     * 匿名化ルールの適用
     */
    private applyAnonymizationRules(obj: any, path: string = ''): any {
        if (obj === null || obj === undefined) return obj;
        
        if (Array.isArray(obj)) {
            return obj.map((item, index) =>
                this.applyAnonymizationRules(item, `${path}[${index}]`)
            );
        }
        
        if(typeof obj === 'object') {
            const result: any = {};
            Object.keys(obj).forEach(key => {
                const currentPath = path ? `${path}.${key}` : key;
                let value = obj[key];
                
                // 特定のフィールドに対する匿名化ルール適用
                if(this.anonymizationRules.has(key)) {
                    const rule = this.anonymizationRules.get(key)!;
                    value = rule(value);
                }
                
                // 再帰的に匿名化ルールを適用
                if (typeof value === 'object' && value !== null) {
                    value = this.applyAnonymizationRules(value, currentPath);
                }
                
                result[key] = value;
            });
            
            return result;
        }
        
        return obj;
    }
    
    /**
     * 匿名化ルールの追加
     */
    addAnonymizationRule(field: string, rule: AnonymizationRule): void {
        this.anonymizationRules.set(field, rule);
    }
    
    /**
     * 匿名化ルールの削除
     */
    removeAnonymizationRule(field: string): void {
        this.anonymizationRules.delete(field);
    }
    
    /**
     * 機能のオプトアウト
     */
    optOutFeature(feature: PrivacyFeature): void {
        this.optOutFeatures.add(feature);
        // 同意状態の更新
        if (this.consentStatus) {
            this.consentStatus.features[feature] = false;
            this.saveConsentStatus();
        }
    }
    
    /**
     * 機能のオプトイン
     */
    optInFeature(feature: PrivacyFeature): void {
        this.optOutFeatures.delete(feature);
        // 同意状態の更新
        if (this.consentStatus) {
            this.consentStatus.features[feature] = true;
            this.saveConsentStatus();
        }
    }
    
    /**
     * データ削除要求の処理
     */
    requestDataDeletion(): Promise<boolean> {
        return new Promise((resolve) => {
            try {
                // LocalStorageからデータを削除
                const keysToDelete = [];
                for(let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.startsWith('analytics_') || key.startsWith('game_data_'))) {
                        keysToDelete.push(key);
                    }
                }
                
                keysToDelete.forEach(key => localStorage.removeItem(key));
                
                // IndexedDBからデータを削除（実装は環境に依存）
                this.clearIndexedDBData().then(() => {
                    console.log('User data deletion completed');
                    resolve(true);
                }).catch(() => {
                    resolve(false);
                });
                
            } catch (error) {
                console.error('Data deletion failed:', error);
                resolve(false);
            }
        });
    }
    
    /**
     * データエクスポート要求の処理
     */
    requestDataExport(): Promise<any> {
        return new Promise((resolve) => {
            try {
                const exportData: any = {
                    exportDate: new Date().toISOString(),
                    consentStatus: this.consentStatus,
                    localStorage: {},
                    indexedDB: {}
                };
                
                // LocalStorageデータの収集
                for(let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.startsWith('analytics_') || key.startsWith('game_data_'))) {
                        try {
                            exportData.localStorage[key] = JSON.parse(localStorage.getItem(key) || '{}');
                        } catch {
                            exportData.localStorage[key] = localStorage.getItem(key);
                        }
                    }
                }
                
                // IndexedDBデータの収集
                this.exportIndexedDBData().then(indexedDBData => {
                    exportData.indexedDB = indexedDBData;
                    resolve(exportData);
                }).catch(() => {
                    resolve(exportData);
                });
                
            } catch (error) {
                console.error('Data export failed:', error);
                resolve(null);
            }
        });
    }
    
    /**
     * プライバシー設定の取得
     */
    getPrivacySettings(): any {
        return {
            consentStatus: this.consentStatus,
            optOutFeatures: Array.from(this.optOutFeatures),
            anonymizationRules: Array.from(this.anonymizationRules.keys()),
            consentVersion: this.consentVersion
        };
    }
    
    /**
     * 同意状態の保存
     */
    private saveConsentStatus(): void {
        try {
            localStorage.setItem('privacy_consent', JSON.stringify(this.consentStatus));
        } catch (error) {
            console.error('Failed to save consent status:', error);
        }
    }
    
    /**
     * 同意状態の読み込み
     */
    private loadConsentStatus(): void {
        try {
            const saved = localStorage.getItem('privacy_consent');
            if (saved) {
                this.consentStatus = JSON.parse(saved);
                
                // オプトアウト機能の復元
                if (this.consentStatus?.features) {
                    Object.entries(this.consentStatus.features).forEach(([feature, enabled]) => {
                        if (!enabled) {
                            this.optOutFeatures.add(feature as PrivacyFeature);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load consent status:', error);
        }
    }
    
    /**
     * ハッシュ値の生成（簡易実装）
     */
    private hashValue(value: string): string {
        let hash = 0;
        for(let i = 0; i < value.length; i++) {
            const char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit整数に変換
        }
        return Math.abs(hash).toString(36);
    }
    
    /**
     * IndexedDBデータのクリア
     */
    private async clearIndexedDBData(): Promise<void> {
        try {
            if ('indexedDB' in window) {
                // ゲーム関連のデータベースを削除
                const deleteDB = (dbName: string) => {
                    return new Promise<void>((resolve, reject) => {
                        const deleteRequest = indexedDB.deleteDatabase(dbName);
                        deleteRequest.onsuccess = () => resolve();
                        deleteRequest.onerror = () => reject(deleteRequest.error);
                    });
                };
                
                await deleteDB('gameAnalytics');
                await deleteDB('bubblePopData');
            }
        } catch (error) {
            console.error('IndexedDB cleanup failed:', error);
            throw error;
        }
    }
    
    /**
     * IndexedDBデータのエクスポート
     */
    private async exportIndexedDBData(): Promise<any> {
        try {
            // 実装は省略（複雑なため）
            return {};
        } catch (error) {
            console.error('IndexedDB export failed:', error);
            return {};
        }
    }
    
    /**
     * GDPR準拠チェック
     */
    isGDPRCompliant(): boolean {
        return !!(this.consentStatus && this.consentStatus.hasConsented);
    }
    
    /**
     * Cookie同意の確認
     */
    hasCookieConsent(): boolean {
        return this.checkConsent() && !this.isOptedOut('cookies');
    }
    
    /**
     * アナリティクス同意の確認
     */
    hasAnalyticsConsent(): boolean {
        return this.checkConsent() && !this.isOptedOut('analytics');
    }
    
    /**
     * リソースの解放
     */
    destroy(): void {
        this.anonymizationRules.clear();
        this.optOutFeatures.clear();
        console.log('PrivacyManager destroyed');
    }
}