/**
 * Dashboard Reporting Component
 * 
 * レポート生成とエクスポート機能を担当
 * Main Controller Patternの一部として設計
 */

export class DashboardReporting {
    constructor(mainController) {
        this.mainController = mainController;
        this.reportHistory = [];
    }

    /**
     * 包括的なレポートの生成
     */
    async generateReport(options = {}) {
        const report = {
            id: this.generateReportId(),
            timestamp: new Date(),
            type: options.type || 'comprehensive',
            configuration: {},
            validation: {},
            statistics: {},
            analysis: {},
            recommendations: []
        };

        try {
            // 設定データの収集
            report.configuration = this.collectConfigurationData();
            
            // 検証結果の収集
            report.validation = this.mainController.validationManager.generateValidationReport();
            
            // 統計情報の収集
            report.statistics = this.collectStatistics();
            
            // 影響分析の実行
            report.analysis = await this.mainController.validationManager.analyzeImpact();
            
            // 推奨事項の生成
            report.recommendations = this.generateRecommendations(report);
            
            // レポート履歴に追加
            this.reportHistory.push(report);
            
            return report;
            
        } catch (error) {
            console.error('Report generation error:', error);
            throw error;
        }
    }

    /**
     * 設定データの収集
     */
    collectConfigurationData() {
        const configData = this.mainController.dataManager.configData;
        const changeHistory = this.mainController.dataManager.changeHistory;
        
        return {
            current: configData,
            recentChanges: changeHistory.slice(0, 10),
            totalChanges: changeHistory.length,
            lastModified: changeHistory[0]?.timestamp || null
        };
    }

    /**
     * 統計情報の収集
     */
    collectStatistics() {
        const statistics = this.mainController.dataManager.calculateStatistics();
        const categoryStats = this.mainController.dataManager.getCategoryStatistics();
        
        return {
            overview: {
                totalConfigurations: statistics.totalConfigs,
                recentChanges24h: statistics.recentChanges,
                categoriesModified: Object.keys(categoryStats).length
            },
            byCategory: categoryStats,
            trends: this.analyzeTrends(),
            usage: this.analyzeUsagePatterns()
        };
    }

    /**
     * トレンドの分析
     */
    analyzeTrends() {
        const changeHistory = this.mainController.dataManager.changeHistory;
        const trends = {
            daily: {},
            weekly: {},
            mostChanged: {}
        };

        // 日別の変更数
        changeHistory.forEach(change => {
            const date = new Date(change.timestamp).toDateString();
            trends.daily[date] = (trends.daily[date] || 0) + 1;
            
            // 最も変更された設定
            const key = change.key;
            trends.mostChanged[key] = (trends.mostChanged[key] || 0) + 1;
        });

        // 週別の集計
        const weeklyData = {};
        Object.entries(trends.daily).forEach(([date, count]) => {
            const week = this.getWeekNumber(new Date(date));
            weeklyData[week] = (weeklyData[week] || 0) + count;
        });
        trends.weekly = weeklyData;

        return trends;
    }

    /**
     * 使用パターンの分析
     */
    analyzeUsagePatterns() {
        const realTimeData = this.mainController.dataManager.realTimeData;
        
        return {
            averageAccessRate: this.calculateAverage(realTimeData.accessCounts),
            peakAccessTime: this.findPeakTime(realTimeData.accessCounts),
            activeUsers: this.estimateActiveUsers(realTimeData.accessCounts)
        };
    }

    /**
     * 推奨事項の生成
     */
    generateRecommendations(report) {
        const recommendations = [];
        
        // 検証エラーに基づく推奨事項
        if (report.validation.summary.totalErrors > 0) {
            recommendations.push({
                priority: 'high',
                category: '設定エラー',
                message: `${report.validation.summary.totalErrors}件の設定エラーが検出されました。早急な修正が必要です。`,
                actions: report.validation.results.consistency?.map(error => ({
                    type: 'fix',
                    description: error
                })) || []
            });
        }

        // バランス警告に基づく推奨事項
        if (report.validation.summary.totalWarnings > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'バランス調整',
                message: 'ゲームバランスに影響する可能性のある設定が検出されました。',
                actions: report.validation.results.balance?.map(warning => ({
                    type: 'review',
                    description: warning
                })) || []
            });
        }

        // パフォーマンスに基づく推奨事項
        const performanceLoad = report.analysis?.impacts?.find(i => i.category === 'パフォーマンス')?.description;
        if (performanceLoad && performanceLoad.includes('高')) {
            recommendations.push({
                priority: 'medium',
                category: 'パフォーマンス最適化',
                message: 'パフォーマンスへの負荷が高い設定が検出されました。',
                actions: [{
                    type: 'optimize',
                    description: 'パーティクル数の削減または品質設定の調整を検討してください。'
                }]
            });
        }

        // 変更頻度に基づく推奨事項
        const mostChanged = Object.entries(report.statistics.trends.mostChanged)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);
        
        if (mostChanged.length > 0 && mostChanged[0][1] > 5) {
            recommendations.push({
                priority: 'low',
                category: '設定の安定性',
                message: '頻繁に変更される設定があります。',
                actions: mostChanged.map(([key, count]) => ({
                    type: 'stabilize',
                    description: `${key} が ${count}回変更されています。適切な値を検討してください。`
                }))
            });
        }

        return recommendations;
    }

    /**
     * レポートのエクスポート
     */
    exportReport(report, format = 'json') {
        switch (format) {
            case 'json':
                return this.exportAsJSON(report);
            
            case 'html':
                return this.exportAsHTML(report);
            
            case 'csv':
                return this.exportAsCSV(report);
            
            case 'pdf':
                // PDF生成は外部ライブラリが必要
                console.warn('PDF export requires external library');
                return this.exportAsHTML(report);
            
            default:
                return this.exportAsJSON(report);
        }
    }

    /**
     * JSON形式でのエクスポート
     */
    exportAsJSON(report) {
        return JSON.stringify(report, null, 2);
    }

    /**
     * HTML形式でのエクスポート
     */
    exportAsHTML(report) {
        return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>設定レポート - ${new Date(report.timestamp).toLocaleDateString('ja-JP')}</title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        h1, h2, h3 { color: #333; }
        .section { margin-bottom: 30px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .error { color: #e74c3c; }
        .warning { color: #f39c12; }
        .success { color: #27ae60; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .recommendation { background: #e8f4f8; padding: 10px; margin: 10px 0; border-left: 4px solid #3498db; }
    </style>
</head>
<body>
    <h1>設定監視レポート</h1>
    <div class="summary">
        <p><strong>生成日時:</strong> ${new Date(report.timestamp).toLocaleString('ja-JP')}</p>
        <p><strong>レポートID:</strong> ${report.id}</p>
        <p><strong>レポートタイプ:</strong> ${report.type}</p>
    </div>

    <div class="section">
        <h2>検証結果サマリー</h2>
        <p class="${report.validation.summary.overallStatus === 'error' ? 'error' : report.validation.summary.overallStatus === 'warning' ? 'warning' : 'success'}">
            全体ステータス: ${this.getStatusText(report.validation.summary.overallStatus)}
        </p>
        <ul>
            <li>エラー数: ${report.validation.summary.totalErrors}</li>
            <li>警告数: ${report.validation.summary.totalWarnings}</li>
        </ul>
    </div>

    <div class="section">
        <h2>統計情報</h2>
        <ul>
            <li>総設定数: ${report.statistics.overview.totalConfigurations}</li>
            <li>24時間以内の変更: ${report.statistics.overview.recentChanges24h}</li>
            <li>変更されたカテゴリ数: ${report.statistics.overview.categoriesModified}</li>
        </ul>
    </div>

    <div class="section">
        <h2>推奨事項</h2>
        ${report.recommendations.map(rec => `
            <div class="recommendation">
                <h3>${rec.category} (優先度: ${this.getPriorityText(rec.priority)})</h3>
                <p>${rec.message}</p>
                ${rec.actions.length > 0 ? `
                    <ul>
                        ${rec.actions.map(action => `
                            <li>[${action.type}] ${action.description}</li>
                        `).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>最近の変更履歴</h2>
        <table>
            <thead>
                <tr>
                    <th>日時</th>
                    <th>カテゴリ</th>
                    <th>キー</th>
                    <th>変更内容</th>
                    <th>ユーザー</th>
                </tr>
            </thead>
            <tbody>
                ${report.configuration.recentChanges.map(change => `
                    <tr>
                        <td>${new Date(change.timestamp).toLocaleString('ja-JP')}</td>
                        <td>${change.category}</td>
                        <td>${change.key}</td>
                        <td>${change.oldValue !== undefined ? `${change.oldValue} → ${change.newValue}` : change.newValue}</td>
                        <td>${change.user}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>
        `;
    }

    /**
     * CSV形式でのエクスポート
     */
    exportAsCSV(report) {
        let csv = 'カテゴリ,キー,現在の値,最終更新,検証状態\n';
        
        const flattenConfig = (obj, prefix = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const path = prefix ? `${prefix}.${key}` : key;
                
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    flattenConfig(value, path);
                } else {
                    const validationState = this.getValidationStateForPath(path, report.validation);
                    csv += `"${path}","${key}","${value}","${new Date().toLocaleDateString('ja-JP')}","${validationState}"\n`;
                }
            }
        };
        
        if (report.configuration.current) {
            flattenConfig(report.configuration.current);
        }
        
        return csv;
    }

    /**
     * レポートのダウンロード
     */
    downloadReport(report, format = 'json', filename = null) {
        const content = this.exportReport(report, format);
        const mimeTypes = {
            json: 'application/json',
            html: 'text/html',
            csv: 'text/csv'
        };
        
        const blob = new Blob([content], { type: mimeTypes[format] || 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `report_${report.id}_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    // ========================================
    // Helper Methods
    // ========================================

    /**
     * レポートIDの生成
     */
    generateReportId() {
        return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 週番号の取得
     */
    getWeekNumber(date) {
        const firstJan = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + firstJan.getDay() + 1) / 7);
    }

    /**
     * 平均値の計算
     */
    calculateAverage(array) {
        if (!array || array.length === 0) return 0;
        return array.reduce((sum, val) => sum + val, 0) / array.length;
    }

    /**
     * ピーク時間の検出
     */
    findPeakTime(accessCounts) {
        if (!accessCounts || accessCounts.length === 0) return null;
        
        const maxValue = Math.max(...accessCounts);
        const maxIndex = accessCounts.indexOf(maxValue);
        
        return {
            index: maxIndex,
            value: maxValue,
            relativeTime: `${accessCounts.length - maxIndex}分前`
        };
    }

    /**
     * アクティブユーザーの推定
     */
    estimateActiveUsers(accessCounts) {
        const average = this.calculateAverage(accessCounts);
        return Math.round(average / 10); // 簡易推定
    }

    /**
     * ステータステキストの取得
     */
    getStatusText(status) {
        const texts = {
            valid: '正常',
            warning: '警告あり',
            error: 'エラーあり',
            pending: '検証中'
        };
        return texts[status] || '不明';
    }

    /**
     * 優先度テキストの取得
     */
    getPriorityText(priority) {
        const texts = {
            high: '高',
            medium: '中',
            low: '低'
        };
        return texts[priority] || priority;
    }

    /**
     * パスの検証状態取得
     */
    getValidationStateForPath(path, validation) {
        // 簡易実装
        return validation.summary.overallStatus;
    }

    /**
     * ステータス取得
     */
    getStatus() {
        return {
            reportHistoryCount: this.reportHistory.length,
            lastReportTime: this.reportHistory[this.reportHistory.length - 1]?.timestamp || null,
            availableFormats: ['json', 'html', 'csv']
        };
    }
}