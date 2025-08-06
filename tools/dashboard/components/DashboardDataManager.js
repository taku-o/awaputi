/**
 * Dashboard Data Manager Component
 * 
 * ダッシュボードのデータ取得・管理を担当
 * Main Controller Patternの一部として設計
 */

export class DashboardDataManager {
    constructor(mainController) {
        this.mainController = mainController;
        this.configData = null;
        this.changeHistory = [];
        this.realTimeData = {
            accessCounts: Array(20).fill(0),
            recentChanges: []
        };
    }

    /**
     * 初期データの読み込み
     */
    async loadInitialData() {
        try {
            this.configData = await this.fetchConfigurationData();
            this.changeHistory = await this.fetchChangeHistory();
            return { configData: this.configData, changeHistory: this.changeHistory };
        } catch (error) {
            console.error('Error loading initial data:', error);
            throw error;
        }
    }

    /**
     * 設定データの取得
     * TODO: 実際のAPIエンドポイントに置き換える
     */
    async fetchConfigurationData() {
        // デモデータを返す（本番環境では実際のAPIを使用）
        return {
            scoring: {
                baseScore: 10,
                comboMultiplier: 1.5,
                timeBonus: 100,
                perfectBonus: 50,
                chainBonus: 25,
                maxCombo: 100
            },
            bubbles: {
                normalSize: 40,
                specialSize: 50,
                bossSize: 90,
                spawnRate: 1000,
                maxBubbles: 30,
                types: {
                    normal: { enabled: true, weight: 60 },
                    special: { enabled: true, weight: 25 },
                    rare: { enabled: true, weight: 10 },
                    boss: { enabled: true, weight: 5 }
                }
            },
            stages: {
                totalStages: 10,
                difficultyProgression: 'linear',
                unlockRequirements: {
                    stage2: { minScore: 1000 },
                    stage3: { minScore: 5000 },
                    stage4: { minScore: 10000 }
                }
            },
            performance: {
                targetFPS: 60,
                particleLimit: 1000,
                autoQuality: true,
                renderScale: 1.0
            }
        };
    }

    /**
     * 変更履歴の取得
     */
    async fetchChangeHistory() {
        const now = new Date();
        // デモデータ（本番環境では実際のAPIを使用）
        return [
            {
                id: 1,
                timestamp: new Date(now - 3600000),
                user: 'System',
                type: 'update',
                category: 'scoring',
                key: 'baseScore',
                oldValue: 8,
                newValue: 10,
                reason: 'バランス調整'
            },
            {
                id: 2,
                timestamp: new Date(now - 7200000),
                user: 'Admin',
                type: 'create',
                category: 'bubbles',
                key: 'types.boss',
                newValue: { enabled: true, weight: 5 }
            },
            {
                id: 3,
                timestamp: new Date(now - 10800000),
                user: 'System',
                type: 'update',
                category: 'performance',
                key: 'targetFPS',
                oldValue: 30,
                newValue: 60,
                reason: 'パフォーマンス向上'
            }
        ];
    }

    /**
     * リアルタイムデータの更新
     */
    updateRealTimeData() {
        // アクセス数カウントの更新（シミュレーション）
        this.realTimeData.accessCounts.shift();
        this.realTimeData.accessCounts.push(Math.floor(Math.random() * 50) + 10);

        // 最近の変更を追加（ランダムに）
        if (Math.random() > 0.8) {
            const categories = ['scoring', 'bubbles', 'stages', 'performance'];
            const category = categories[Math.floor(Math.random() * categories.length)];
            
            this.realTimeData.recentChanges.unshift({
                timestamp: new Date(),
                category: category,
                description: `${category} 設定が更新されました`
            });

            // 最大10件まで保持
            if (this.realTimeData.recentChanges.length > 10) {
                this.realTimeData.recentChanges.pop();
            }
        }

        return this.realTimeData;
    }

    /**
     * データのリフレッシュ
     */
    async refreshData() {
        await this.loadInitialData();
        this.updateRealTimeData();
        return {
            configData: this.configData,
            changeHistory: this.changeHistory,
            realTimeData: this.realTimeData
        };
    }

    /**
     * 統計情報の計算
     */
    calculateStatistics() {
        const totalConfigs = this.countTotalConfigurations();
        const recentChanges = this.countRecentChanges();
        const categoryStats = this.getCategoryStatistics();
        
        return {
            totalConfigs,
            recentChanges,
            categoryStats
        };
    }

    /**
     * 設定総数のカウント
     */
    countTotalConfigurations() {
        if (!this.configData) return 0;
        
        let count = 0;
        const countRecursive = (obj) => {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    countRecursive(obj[key]);
                } else {
                    count++;
                }
            }
        };
        
        countRecursive(this.configData);
        return count;
    }

    /**
     * 最近の変更数カウント（24時間以内）
     */
    countRecentChanges() {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return this.changeHistory.filter(change => 
            new Date(change.timestamp) > oneDayAgo
        ).length;
    }

    /**
     * カテゴリ別統計
     */
    getCategoryStatistics() {
        const stats = {};
        
        this.changeHistory.forEach(change => {
            if (!stats[change.category]) {
                stats[change.category] = 0;
            }
            stats[change.category]++;
        });
        
        return stats;
    }

    /**
     * データのエクスポート
     */
    exportData(format = 'json') {
        const exportData = {
            timestamp: new Date().toISOString(),
            configuration: this.configData,
            changeHistory: this.changeHistory,
            statistics: this.calculateStatistics()
        };

        if (format === 'json') {
            return JSON.stringify(exportData, null, 2);
        } else if (format === 'csv') {
            // CSV形式での出力（簡易版）
            return this.convertToCSV(exportData);
        }
        
        return exportData;
    }

    /**
     * CSV変換（簡易実装）
     */
    convertToCSV(data) {
        let csv = 'Category,Key,Value\n';
        
        const flattenObject = (obj, prefix = '') => {
            for (const key in obj) {
                const value = obj[key];
                const newKey = prefix ? `${prefix}.${key}` : key;
                
                if (typeof value === 'object' && value !== null) {
                    flattenObject(value, newKey);
                } else {
                    csv += `"${newKey}","${value}"\n`;
                }
            }
        };
        
        flattenObject(data.configuration);
        return csv;
    }

    /**
     * 検索・フィルタリング
     */
    searchConfiguration(query) {
        if (!query || !this.configData) return [];
        
        const results = [];
        const searchRecursive = (obj, path = '') => {
            for (const key in obj) {
                const value = obj[key];
                const currentPath = path ? `${path}.${key}` : key;
                
                if (key.toLowerCase().includes(query.toLowerCase()) ||
                    String(value).toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                        path: currentPath,
                        key: key,
                        value: value
                    });
                }
                
                if (typeof value === 'object' && value !== null) {
                    searchRecursive(value, currentPath);
                }
            }
        };
        
        searchRecursive(this.configData);
        return results;
    }

    /**
     * 履歴のフィルタリング
     */
    filterHistory(filterType) {
        switch (filterType) {
            case 'today':
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return this.changeHistory.filter(change => 
                    new Date(change.timestamp) >= today
                );
            
            case 'week':
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return this.changeHistory.filter(change => 
                    new Date(change.timestamp) >= weekAgo
                );
            
            case 'month':
                const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                return this.changeHistory.filter(change => 
                    new Date(change.timestamp) >= monthAgo
                );
            
            default:
                return this.changeHistory;
        }
    }

    /**
     * 履歴の検索
     */
    searchHistory(query) {
        if (!query) return this.changeHistory;
        
        const lowerQuery = query.toLowerCase();
        return this.changeHistory.filter(change => 
            change.category.toLowerCase().includes(lowerQuery) ||
            change.key.toLowerCase().includes(lowerQuery) ||
            (change.reason && change.reason.toLowerCase().includes(lowerQuery)) ||
            change.user.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * ステータス取得
     */
    getStatus() {
        return {
            dataLoaded: this.configData !== null,
            historyCount: this.changeHistory.length,
            realTimeActive: true,
            lastUpdate: new Date()
        };
    }
}