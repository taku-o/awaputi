import { BaseComponent } from '../BaseComponent.js';

/**
 * DebugDataExporter - デバッグデータのエクスポート・テスト結果管理コンポーネント
 */
export class DebugDataExporter extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'DebugDataExporter');
        this.exportFormats = new Map();
        this.testResults = new Map();
        this.exportHistory = [];
        this.exportStatistics = {
            totalExports: 0,
            successfulExports: 0,
            failedExports: 0
        };
    }

    async _doInitialize() {
        this.setupExportFormats();
        this.initializeTestSuites();
    }

    /**
     * エクスポート形式を設定
     */
    setupExportFormats() {
        // JSON形式
        this.exportFormats.set('json', {
            name: 'JSON',
            extension: '.json',
            mimeType: 'application/json',
            exporter: (data) => JSON.stringify(data, null, 2)
        });

        // CSV形式
        this.exportFormats.set('csv', {
            name: 'CSV',
            extension: '.csv',
            mimeType: 'text/csv',
            exporter: (data) => this.convertToCSV(data)
        });

        // TXT形式
        this.exportFormats.set('txt', {
            name: 'Text',
            extension: '.txt',
            mimeType: 'text/plain',
            exporter: (data) => this.convertToText(data)
        });

        // XML形式
        this.exportFormats.set('xml', {
            name: 'XML',
            extension: '.xml',
            mimeType: 'application/xml',
            exporter: (data) => this.convertToXML(data)
        });
    }

    /**
     * テストスイートを初期化
     */
    initializeTestSuites() {
        // 統合テスト結果を初期化
        this.testResults.set('integration', {
            suite: 'Integration Tests',
            status: 'ready',
            results: [],
            summary: { passed: 0, failed: 0, skipped: 0 }
        });

        // 要件検証結果を初期化
        this.testResults.set('requirements', {
            suite: 'Requirements Validation',
            status: 'ready',
            results: [],
            summary: { passed: 0, failed: 0, skipped: 0 }
        });

        // 最終検証結果を初期化
        this.testResults.set('final', {
            suite: 'Final Validation',
            status: 'ready',
            results: [],
            summary: { passed: 0, failed: 0, skipped: 0 }
        });
    }

    /**
     * 現在のパネルデータをエクスポート
     * @param {string} format - エクスポート形式
     * @param {Object} options - エクスポートオプション
     */
    exportCurrentPanelData(format = 'json', options = {}) {
        const panelManager = this.mainController.getComponent('panelManager');
        const activePanel = panelManager?.getActivePanel();
        
        if (!activePanel) {
            console.warn('No active panel to export');
            return;
        }

        const panelData = this.collectPanelData(activePanel);
        this.exportData(panelData, `${activePanel}-data`, format, options);
    }

    /**
     * パネルデータを収集
     * @param {string} panelId - パネルID
     * @returns {Object} パネルデータ
     */
    collectPanelData(panelId) {
        const baseData = {
            panelId: panelId,
            timestamp: Date.now(),
            sessionId: this.mainController.sessionId,
            version: '1.0.0'
        };

        switch (panelId) {
            case 'console':
                return { ...baseData, ...this.collectConsoleData() };
            case 'performance':
                return { ...baseData, ...this.collectPerformanceData() };
            case 'memory':
                return { ...baseData, ...this.collectMemoryData() };
            case 'network':
                return { ...baseData, ...this.collectNetworkData() };
            case 'settings':
                return { ...baseData, ...this.collectSettingsData() };
            default:
                return baseData;
        }
    }

    /**
     * コンソールデータを収集
     * @returns {Object} コンソールデータ
     */
    collectConsoleData() {
        const consoleOutput = this.mainController.container?.querySelector('.console-output');
        return {
            type: 'console',
            output: consoleOutput?.textContent || '',
            commandHistory: this.getCommandHistory(),
            timestamp: Date.now()
        };
    }

    /**
     * パフォーマンスデータを収集
     * @returns {Object} パフォーマンスデータ
     */
    collectPerformanceData() {
        const visualizer = this.mainController.getComponent('visualizer');
        return {
            type: 'performance',
            metrics: {
                fps: this.getCurrentFPS(),
                memory: this.getCurrentMemoryUsage(),
                cpu: this.getCurrentCPUUsage(),
                gpu: this.getCurrentGPUUsage()
            },
            charts: visualizer ? this.exportChartData() : {},
            timestamp: Date.now()
        };
    }

    /**
     * メモリデータを収集
     * @returns {Object} メモリデータ
     */
    collectMemoryData() {
        return {
            type: 'memory',
            usage: {
                used: performance.memory?.usedJSHeapSize || 0,
                total: performance.memory?.totalJSHeapSize || 0,
                limit: performance.memory?.jsHeapSizeLimit || 0
            },
            gc: this.getGCInfo(),
            timestamp: Date.now()
        };
    }

    /**
     * ネットワークデータを収集
     * @returns {Object} ネットワークデータ
     */
    collectNetworkData() {
        return {
            type: 'network',
            requests: this.getNetworkRequests(),
            performance: this.getNetworkPerformance(),
            timestamp: Date.now()
        };
    }

    /**
     * 設定データを収集
     * @returns {Object} 設定データ
     */
    collectSettingsData() {
        return {
            type: 'settings',
            debugSettings: this.mainController.settings || {},
            theme: this.mainController.getComponent('visualizer')?.getCurrentTheme(),
            layout: this.mainController.getComponent('visualizer')?.getResponsiveLayout(),
            timestamp: Date.now()
        };
    }

    /**
     * データをエクスポート
     * @param {*} data - エクスポートデータ
     * @param {string} filename - ファイル名
     * @param {string} format - 形式
     * @param {Object} options - オプション
     */
    exportData(data, filename, format, options = {}) {
        try {
            const formatConfig = this.exportFormats.get(format);
            if (!formatConfig) {
                throw new Error(`Unsupported export format: ${format}`);
            }

            const exportedData = formatConfig.exporter(data);
            const fullFilename = `${filename}_${Date.now()}${formatConfig.extension}`;
            
            this.downloadFile(exportedData, fullFilename, formatConfig.mimeType);
            
            // エクスポート履歴に追加
            this.addToExportHistory({
                filename: fullFilename,
                format: format,
                size: exportedData.length,
                timestamp: Date.now(),
                success: true
            });
            
            this.exportStatistics.totalExports++;
            this.exportStatistics.successfulExports++;
            
        } catch (error) {
            console.error('Export failed:', error);
            this.exportStatistics.totalExports++;
            this.exportStatistics.failedExports++;
            
            this.addToExportHistory({
                filename: filename,
                format: format,
                error: error.message,
                timestamp: Date.now(),
                success: false
            });
            
            this._handleError('data export', error);
        }
    }

    /**
     * ファイルをダウンロード
     * @param {string} content - ファイル内容
     * @param {string} filename - ファイル名
     * @param {string} mimeType - MIMEタイプ
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    /**
     * CSVに変換
     * @param {*} data - データ
     * @returns {string} CSV文字列
     */
    convertToCSV(data) {
        if (Array.isArray(data)) {
            if (data.length === 0) return '';
            
            const headers = Object.keys(data[0]);
            const csvLines = [headers.join(',')];
            
            data.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
                });
                csvLines.push(values.join(','));
            });
            
            return csvLines.join('\n');
        } else {
            // オブジェクトの場合はkey-value形式
            return Object.entries(data)
                .map(([key, value]) => `"${key}","${value}"`)
                .join('\n');
        }
    }

    /**
     * テキストに変換
     * @param {*} data - データ
     * @returns {string} テキスト文字列
     */
    convertToText(data) {
        if (typeof data === 'string') return data;
        if (typeof data === 'object') {
            return this.objectToText(data, 0);
        }
        return String(data);
    }

    /**
     * オブジェクトをテキストに変換
     * @param {Object} obj - オブジェクト
     * @param {number} indent - インデントレベル
     * @returns {string} テキスト文字列
     */
    objectToText(obj, indent = 0) {
        const spaces = '  '.repeat(indent);
        const lines = [];
        
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
                lines.push(`${spaces}${key}:`);
                lines.push(this.objectToText(value, indent + 1));
            } else {
                lines.push(`${spaces}${key}: ${value}`);
            }
        }
        
        return lines.join('\n');
    }

    /**
     * XMLに変換
     * @param {*} data - データ
     * @returns {string} XML文字列
     */
    convertToXML(data) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';
        xml += this.objectToXML(data, 1);
        xml += '</data>';
        return xml;
    }

    /**
     * オブジェクトをXMLに変換
     * @param {Object} obj - オブジェクト
     * @param {number} indent - インデントレベル
     * @returns {string} XML文字列
     */
    objectToXML(obj, indent = 0) {
        const spaces = '  '.repeat(indent);
        let xml = '';
        
        for (const [key, value] of Object.entries(obj)) {
            const tagName = key.replace(/[^a-zA-Z0-9]/g, '_');
            
            if (typeof value === 'object' && value !== null) {
                xml += `${spaces}<${tagName}>\n`;
                xml += this.objectToXML(value, indent + 1);
                xml += `${spaces}</${tagName}>\n`;
            } else {
                xml += `${spaces}<${tagName}>${this.escapeXML(String(value))}</${tagName}>\n`;
            }
        }
        
        return xml;
    }

    /**
     * XML特殊文字をエスケープ
     * @param {string} text - テキスト
     * @returns {string} エスケープされたテキスト
     */
    escapeXML(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * エクスポート履歴に追加
     * @param {Object} record - エクスポート記録
     */
    addToExportHistory(record) {
        this.exportHistory.unshift(record);
        
        // 履歴の長さを制限（最大50件）
        if (this.exportHistory.length > 50) {
            this.exportHistory = this.exportHistory.slice(0, 50);
        }
    }

    // === テスト結果管理 ===

    /**
     * 統合テスト結果を取得
     * @returns {Object} テスト結果
     */
    getIntegrationTestResults() {
        return this.testResults.get('integration');
    }

    /**
     * 統合テスト結果をエクスポート
     * @param {string} format - エクスポート形式
     */
    exportIntegrationTestResults(format = 'json') {
        const results = this.getIntegrationTestResults();
        this.exportData(results, 'integration-test-results', format);
    }

    /**
     * 要件検証結果を取得
     * @returns {Object} 検証結果
     */
    getRequirementsValidationResults() {
        return this.testResults.get('requirements');
    }

    /**
     * 要件検証結果をエクスポート
     * @param {string} format - エクスポート形式
     */
    exportRequirementsValidationResults(format = 'json') {
        const results = this.getRequirementsValidationResults();
        this.exportData(results, 'requirements-validation-results', format);
    }

    /**
     * 最終検証結果を取得
     * @returns {Object} 検証結果
     */
    getFinalValidationResults() {
        return this.testResults.get('final');
    }

    /**
     * 最終検証結果をエクスポート
     * @param {string} format - エクスポート形式
     */
    exportFinalValidationResults(format = 'json') {
        const results = this.getFinalValidationResults();
        this.exportData(results, 'final-validation-results', format);
    }

    // === ヘルパーメソッド ===

    /**
     * コマンド履歴を取得
     * @returns {Array} コマンド履歴
     */
    getCommandHistory() {
        // コンソールコマンド履歴の実装
        return [];
    }

    /**
     * 現在のFPSを取得
     * @returns {number} FPS値
     */
    getCurrentFPS() {
        return 60; // 実際の実装では計測値を返す
    }

    /**
     * 現在のメモリ使用量を取得
     * @returns {number} メモリ使用量
     */
    getCurrentMemoryUsage() {
        return performance.memory?.usedJSHeapSize || 0;
    }

    /**
     * 現在のCPU使用率を取得
     * @returns {number} CPU使用率
     */
    getCurrentCPUUsage() {
        return 0; // 実際の実装では計測値を返す
    }

    /**
     * 現在のGPU使用率を取得
     * @returns {number} GPU使用率
     */
    getCurrentGPUUsage() {
        return 0; // 実際の実装では計測値を返す
    }

    /**
     * GC情報を取得
     * @returns {Object} GC情報
     */
    getGCInfo() {
        return {
            collections: 0,
            totalTime: 0,
            averageTime: 0
        };
    }

    /**
     * ネットワークリクエストを取得
     * @returns {Array} ネットワークリクエスト
     */
    getNetworkRequests() {
        return [];
    }

    /**
     * ネットワークパフォーマンスを取得
     * @returns {Object} ネットワークパフォーマンス
     */
    getNetworkPerformance() {
        return {
            download: 0,
            upload: 0,
            latency: 0
        };
    }

    /**
     * チャートデータをエクスポート
     * @returns {Object} チャートデータ
     */
    exportChartData() {
        const visualizer = this.mainController.getComponent('visualizer');
        if (!visualizer) return {};

        const chartData = {};
        for (const [id, chart] of visualizer.charts) {
            chartData[id] = {
                id: id,
                content: chart.innerHTML,
                data: chart.dataset
            };
        }
        return chartData;
    }

    // === 公開API ===

    /**
     * エクスポート統計を取得
     * @returns {Object} 統計情報
     */
    getExportStatistics() {
        return { ...this.exportStatistics };
    }

    /**
     * エクスポート履歴を取得
     * @returns {Array} エクスポート履歴
     */
    getExportHistory() {
        return [...this.exportHistory];
    }

    /**
     * 利用可能なエクスポート形式を取得
     * @returns {Array} 形式配列
     */
    getAvailableFormats() {
        return Array.from(this.exportFormats.keys());
    }

    /**
     * 全データをエクスポート
     * @param {string} format - エクスポート形式
     */
    exportAllData(format = 'json') {
        const allData = {
            debugInterface: {
                sessionId: this.mainController.sessionId,
                timestamp: Date.now()
            },
            panels: {},
            testResults: Object.fromEntries(this.testResults),
            statistics: {
                export: this.getExportStatistics(),
                panels: this.mainController.getComponent('panelManager')?.getPanelStatistics(),
                shortcuts: this.mainController.getComponent('commandProcessor')?.getShortcutStatistics()
            }
        };

        // 各パネルのデータを収集
        const panelManager = this.mainController.getComponent('panelManager');
        if (panelManager) {
            const panels = panelManager.getRegisteredPanels();
            panels.forEach(panel => {
                allData.panels[panel.id] = this.collectPanelData(panel.id);
            });
        }

        this.exportData(allData, 'debug-interface-complete', format);
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.testResults.clear();
        this.exportHistory = [];
        this.exportStatistics = {
            totalExports: 0,
            successfulExports: 0,
            failedExports: 0
        };
        
        super.cleanup();
    }
}