/**
 * Error Storage
 * エラーデータの永続化専用クラス
 */

export class ErrorStorage {
    constructor(errorReporter) {
        this.errorReporter = errorReporter;
        this.storageKey = 'errorReporter_data';
        this.maxStorageSize = 500; // IndexedDBの代わりにLocalStorageを使用
        
        // ストレージ統計
        this.storageStats = {
            totalStored: 0,
            totalNotifications: 0,
            storageSize: 0,
            lastCleanup: Date.now()
        };
        
        // 圧縮設定
        this.compressionEnabled = true;
        this.compressionThreshold = 1024; // 1KB以上で圧縮
        
        this.initializeStorage();
    }
    
    /**
     * ストレージの初期化
     */
    initializeStorage() {
        this.updateStorageStats();
        this.setupPeriodicCleanup();
    }
    
    /**
     * エラーの保存
     */
    store(error) {
        try {
            const stored = this.getStoredData();
            const errorData = this.prepareErrorForStorage(error);
            
            stored.errors.push(errorData);
            this.storageStats.totalStored++;
            
            // サイズ制限の適用
            if (stored.errors.length > this.maxStorageSize) {
                const removed = stored.errors.shift();
                console.debug('Storage limit reached, removed oldest error:', removed.id);
            }
            
            stored.lastUpdated = Date.now();
            this.saveStoredData(stored);
            
            return error.id;
        } catch (e) {
            console.warn('Failed to store error:', e.message);
            return null;
        }
    }
    
    /**
     * 通知の保存
     */
    storeNotification(notification) {
        try {
            const stored = this.getStoredData();
            const notificationData = this.prepareNotificationForStorage(notification);
            
            stored.notifications.push(notificationData);
            this.storageStats.totalNotifications++;
            
            // 通知は最新10件のみ保持
            if (stored.notifications.length > 10) {
                stored.notifications.shift();
            }
            
            stored.lastUpdated = Date.now();
            this.saveStoredData(stored);
            
            return notification.id;
        } catch (e) {
            console.warn('Failed to store notification:', e.message);
            return null;
        }
    }
    
    /**
     * セッション別エラーの読み込み
     */
    loadSession(sessionId) {
        try {
            const stored = this.getStoredData();
            const sessionErrors = stored.errors.filter(error => 
                error.sessionId === sessionId
            );
            
            return sessionErrors.map(errorData => 
                this.reconstructErrorFromStorage(errorData)
            );
        } catch (e) {
            console.warn('Failed to load session errors:', e.message);
            return [];
        }
    }
    
    /**
     * エラーIDでの取得
     */
    getErrorById(errorId) {
        try {
            const stored = this.getStoredData();
            const errorData = stored.errors.find(error => error.id === errorId);
            
            return errorData ? this.reconstructErrorFromStorage(errorData) : null;
        } catch (e) {
            console.warn('Failed to get error by ID:', e.message);
            return null;
        }
    }
    
    /**
     * 期間別エラーの取得
     */
    getErrorsByTimeRange(startTime, endTime) {
        try {
            const stored = this.getStoredData();
            const filteredErrors = stored.errors.filter(error => 
                error.timestamp >= startTime && error.timestamp <= endTime
            );
            
            return filteredErrors.map(errorData =>
                this.reconstructErrorFromStorage(errorData)
            );
        } catch (e) {
            console.warn('Failed to get errors by time range:', e.message);
            return [];
        }
    }
    
    /**
     * カテゴリ別エラーの取得
     */
    getErrorsByCategory(category) {
        try {
            const stored = this.getStoredData();
            const categoryErrors = stored.errors.filter(error => 
                error.category === category
            );
            
            return categoryErrors.map(errorData =>
                this.reconstructErrorFromStorage(errorData)
            );
        } catch (e) {
            console.warn('Failed to get errors by category:', e.message);
            return [];
        }
    }
    
    /**
     * 重要度別エラーの取得
     */
    getErrorsBySeverity(severity) {
        try {
            const stored = this.getStoredData();
            const severityErrors = stored.errors.filter(error => 
                error.severity === severity
            );
            
            return severityErrors.map(errorData =>
                this.reconstructErrorFromStorage(errorData)
            );
        } catch (e) {
            console.warn('Failed to get errors by severity:', e.message);
            return [];
        }
    }
    
    /**
     * エラー検索
     */
    searchErrors(query) {
        try {
            const stored = this.getStoredData();
            const regex = new RegExp(query, 'i');
            
            const matchingErrors = stored.errors.filter(error => 
                regex.test(error.message) ||
                regex.test(error.category) ||
                regex.test(error.fingerprint)
            );
            
            return matchingErrors.map(errorData =>
                this.reconstructErrorFromStorage(errorData)
            );
        } catch (e) {
            console.warn('Failed to search errors:', e.message);
            return [];
        }
    }
    
    /**
     * 保存されたデータの取得
     */
    getStoredData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) {
                return this.createEmptyStorageStructure();
            }
            
            const parsed = JSON.parse(data);
            
            // データ構造の検証と修復
            if (!this.validateStorageStructure(parsed)) {
                console.warn('Invalid storage structure, recreating...');
                return this.createEmptyStorageStructure();
            }
            
            return parsed;
        } catch (e) {
            console.warn('Failed to parse stored data, recreating:', e.message);
            return this.createEmptyStorageStructure();
        }
    }
    
    /**
     * 空のストレージ構造の作成
     */
    createEmptyStorageStructure() {
        return {
            errors: [],
            notifications: [],
            sessions: [],
            metadata: {
                version: '1.0',
                created: Date.now()
            },
            lastUpdated: Date.now()
        };
    }
    
    /**
     * ストレージ構造の検証
     */
    validateStorageStructure(data) {
        return data &&
               Array.isArray(data.errors) &&
               Array.isArray(data.notifications) &&
               Array.isArray(data.sessions) &&
               typeof data.lastUpdated === 'number';
    }
    
    /**
     * データの保存
     */
    saveStoredData(data) {
        try {
            const serialized = JSON.stringify(data);
            
            // 圧縮の検討
            const dataSize = new Blob([serialized]).size;
            if (this.compressionEnabled && dataSize > this.compressionThreshold) {
                // 簡易圧縮（重複除去など）
                data = this.compressStorageData(data);
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            this.updateStorageStats();
            
        } catch (e) {
            // ストレージ容量エラーの場合、古いデータを削除
            if (e.name === 'QuotaExceededError') {
                console.warn('Storage quota exceeded, cleaning up...');
                data.errors = data.errors.slice(-Math.floor(this.maxStorageSize / 2));
                data.notifications = data.notifications.slice(-5);
                
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(data));
                    this.updateStorageStats();
                } catch (retryError) {
                    console.error('Failed to save even after cleanup:', retryError.message);
                }
            } else {
                console.error('Failed to save storage data:', e.message);
            }
        }
    }
    
    /**
     * ストレージ用のエラーデータ準備
     */
    prepareErrorForStorage(error) {
        // ストレージサイズを最適化するため、必要最小限のデータのみ保存
        return {
            id: error.id,
            sessionId: error.sessionId,
            timestamp: error.timestamp,
            message: error.message,
            name: error.name,
            category: error.category,
            severity: error.severity,
            fingerprint: error.fingerprint,
            
            // 簡略化されたコンテキスト
            context: {
                url: error.context.url,
                gameState: error.context.gameState ? {
                    currentScene: error.context.gameState.currentScene,
                    isRunning: error.context.gameState.isRunning
                } : null
            },
            
            // スタックトレースは最初の3行のみ保存
            stack: error.stack ? error.stack.split('\n').slice(0, 3).join('\n') : null
        };
    }
    
    /**
     * ストレージ用の通知データ準備
     */
    prepareNotificationForStorage(notification) {
        return {
            id: notification.id,
            timestamp: notification.timestamp,
            type: notification.type,
            errorId: notification.error?.id,
            sessionId: notification.sessionId,
            
            // 通知固有データ
            additionalInfo: notification.additionalInfo ? {
                patternInfo: notification.additionalInfo.patternInfo ? {
                    count: notification.additionalInfo.patternInfo.count,
                    trend: notification.additionalInfo.patternInfo.trend
                } : null
            } : null
        };
    }
    
    /**
     * ストレージからエラーデータの復元
     */
    reconstructErrorFromStorage(errorData) {
        // 基本的な構造のみ復元（完全な復元は不可能）
        return {
            ...errorData,
            isReconstructed: true,
            reconstructedAt: Date.now()
        };
    }
    
    /**
     * ストレージデータの圧縮
     */
    compressStorageData(data) {
        // 重複するフィンガープリントのエラーを統合
        const errorMap = new Map();
        
        data.errors.forEach(error => {
            if (errorMap.has(error.fingerprint)) {
                const existing = errorMap.get(error.fingerprint);
                existing.count = (existing.count || 1) + 1;
                existing.lastSeen = Math.max(existing.timestamp, error.timestamp);
                
                // 最新のエラーデータを保持
                if (error.timestamp > existing.timestamp) {
                    existing.message = error.message;
                    existing.context = error.context;
                }
            } else {
                errorMap.set(error.fingerprint, { ...error, count: 1 });
            }
        });
        
        return {
            ...data,
            errors: Array.from(errorMap.values()),
            compressed: true,
            compressionRatio: data.errors.length / errorMap.size
        };
    }
    
    /**
     * ストレージ統計の更新
     */
    updateStorageStats() {
        try {
            const stored = this.getStoredData();
            const serialized = JSON.stringify(stored);
            
            this.storageStats = {
                totalStored: stored.errors.length,
                totalNotifications: stored.notifications.length,
                storageSize: new Blob([serialized]).size,
                lastCleanup: this.storageStats.lastCleanup,
                compressionRatio: stored.compressionRatio || 1
            };
        } catch (e) {
            console.warn('Failed to update storage stats:', e.message);
        }
    }
    
    /**
     * 定期クリーンアップの設定
     */
    setupPeriodicCleanup() {
        // 1時間ごとにクリーンアップ
        setInterval(() => {
            this.cleanup();
        }, 3600000);
    }
    
    /**
     * ストレージのクリーンアップ
     */
    cleanup() {
        try {
            const stored = this.getStoredData();
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            
            const originalErrorCount = stored.errors.length;
            const originalNotificationCount = stored.notifications.length;
            
            // 1週間以上古いエラーを削除
            stored.errors = stored.errors.filter(error => error.timestamp > oneWeekAgo);
            stored.notifications = stored.notifications.filter(n => n.timestamp > oneWeekAgo);
            
            // 古いセッション情報をクリーンアップ
            stored.sessions = stored.sessions.filter(session => 
                session.lastActivity > oneWeekAgo
            );
            
            const cleanedErrors = originalErrorCount - stored.errors.length;
            const cleanedNotifications = originalNotificationCount - stored.notifications.length;
            
            if (cleanedErrors > 0 || cleanedNotifications > 0) {
                console.log(`Storage cleanup: removed ${cleanedErrors} errors, ${cleanedNotifications} notifications`);
                stored.lastUpdated = Date.now();
                this.saveStoredData(stored);
            }
            
            this.storageStats.lastCleanup = Date.now();
        } catch (e) {
            console.warn('Failed to cleanup storage:', e.message);
        }
    }
    
    /**
     * ストレージの統計情報取得
     */
    getStorageStatistics() {
        return {
            ...this.storageStats,
            maxStorageSize: this.maxStorageSize,
            storageUsagePercentage: ((this.storageStats.totalStored / this.maxStorageSize) * 100).toFixed(2),
            estimatedSizeKB: (this.storageStats.storageSize / 1024).toFixed(2),
            compressionEnabled: this.compressionEnabled
        };
    }
    
    /**
     * ストレージの完全クリア
     */
    clearStorage() {
        try {
            localStorage.removeItem(this.storageKey);
            this.storageStats = {
                totalStored: 0,
                totalNotifications: 0,
                storageSize: 0,
                lastCleanup: Date.now()
            };
            return true;
        } catch (e) {
            console.warn('Failed to clear storage:', e.message);
            return false;
        }
    }
    
    /**
     * データのエクスポート
     */
    exportData(format = 'json') {
        try {
            const stored = this.getStoredData();
            const exportData = {
                ...stored,
                exportedAt: Date.now(),
                statistics: this.getStorageStatistics()
            };
            
            switch (format) {
                case 'json':
                    return JSON.stringify(exportData, null, 2);
                case 'csv':
                    return this.convertToCSV(stored.errors);
                default:
                    return exportData;
            }
        } catch (e) {
            console.warn('Failed to export data:', e.message);
            return null;
        }
    }
    
    /**
     * CSV変換
     */
    convertToCSV(errors) {
        const headers = ['id', 'timestamp', 'severity', 'category', 'message', 'fingerprint', 'sessionId'];
        const rows = errors.map(error => [
            error.id,
            new Date(error.timestamp).toISOString(),
            error.severity,
            error.category,
            error.message.replace(/"/g, '""'),
            error.fingerprint,
            error.sessionId
        ]);
        
        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ];
        
        return csv.join('\n');
    }
    
    /**
     * データのインポート
     */
    importData(data, mergeMode = false) {
        try {
            const importedData = typeof data === 'string' ? JSON.parse(data) : data;
            
            if (!this.validateStorageStructure(importedData)) {
                throw new Error('Invalid import data structure');
            }
            
            if (mergeMode) {
                const existing = this.getStoredData();
                
                // エラーのマージ（重複チェック）
                const existingErrorIds = new Set(existing.errors.map(e => e.id));
                const newErrors = importedData.errors.filter(e => !existingErrorIds.has(e.id));
                
                existing.errors.push(...newErrors);
                existing.notifications.push(...importedData.notifications);
                existing.lastUpdated = Date.now();
                
                this.saveStoredData(existing);
            } else {
                // 完全上書き
                importedData.lastUpdated = Date.now();
                this.saveStoredData(importedData);
            }
            
            return true;
        } catch (e) {
            console.warn('Failed to import data:', e.message);
            return false;
        }
    }
}