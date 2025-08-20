import { BaseComponent } from '../BaseComponent.js';

// Type definitions
interface ExportFormat {
    name: string;
    extension: string;
    mimeType: string;
    exporter: (data: any) => string;
}

interface ExportOptions {
    includeMetadata?: boolean;
    compressed?: boolean;
    [key: string]: any;
}

interface ExportStatistics {
    totalExports: number;
    successfulExports: number;
    failedExports: number;
}

interface ExportRecord {
    filename: string;
    format: string;
    size?: number;
    error?: string;
    timestamp: number;
    success: boolean;
}

interface TestSuite {
    suite: string;
    status: 'ready' | 'running' | 'completed' | 'failed';
    results: TestResult[];
    summary: TestSummary;
}

interface TestResult {
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    duration?: number;
    error?: string;
}

interface TestSummary {
    passed: number;
    failed: number;
    skipped: number;
}

interface PanelData {
    panelId: string;
    timestamp: number;
    sessionId: string;
    version: string;
    type: string;
    [key: string]: any;
}

interface MetricsData {
    fps: number;
    memory: number;
    cpu: number;
    gpu: number;
}

interface NetworkPerformance {
    download: number;
    upload: number;
    latency: number;
}

interface GCInfo {
    collections: number;
    totalTime: number;
    averageTime: number;
}

interface MainController {
    container?: HTMLElement;
    sessionId: string;
    settings?: any;
    getComponent(name: string): any;
}

interface PanelManager {
    getActivePanel(): string | null;
    getRegisteredPanels(): { id: string }[];
    getPanelStatistics?(): any;
}

interface CommandProcessor {
    getShortcutStatistics?(): any;
}

interface Visualizer {
    charts: Map<string, HTMLElement>;
    getCurrentTheme?(): any;
    getResponsiveLayout?(): any;
}

/**
 * DebugDataExporter - デバッグデータのエクスポート・テスト結果管理コンポーネント
 */
export class DebugDataExporter extends BaseComponent {
    private exportFormats: Map<string, ExportFormat>;
    private testResults: Map<string, TestSuite>;
    private exportHistory: ExportRecord[];
    private exportStatistics: ExportStatistics;

    constructor(mainController: MainController) {
        super(mainController, 'DebugDataExporter');
        this.exportFormats = new Map<string, ExportFormat>();
        this.testResults = new Map<string, TestSuite>();
        this.exportHistory = [];
        this.exportStatistics = {
            totalExports: 0,
            successfulExports: 0,
            failedExports: 0
        };
    }

    async _doInitialize(): Promise<void> {
        this.setupExportFormats();
        this.initializeTestSuites();
    }

    /**
     * エクスポート形式を設定
     */
    setupExportFormats(): void {
        // JSON形式
        this.exportFormats.set('json', {
            name: 'JSON',
            extension: '.json',
            mimeType: 'application/json',
            exporter: (data: any) => JSON.stringify(data, null, 2)
        });

        // CSV形式
        this.exportFormats.set('csv', {
            name: 'CSV',
            extension: '.csv',
            mimeType: 'text/csv',
            exporter: (data: any) => this.convertToCSV(data)
        });

        // TXT形式
        this.exportFormats.set('txt', {
            name: 'Text',
            extension: '.txt',
            mimeType: 'text/plain',
            exporter: (data: any) => this.convertToText(data)
        });

        // XML形式
        this.exportFormats.set('xml', {
            name: 'XML',
            extension: '.xml',
            mimeType: 'application/xml',
            exporter: (data: any) => this.convertToXML(data)
        });
    }

    /**
     * テストスイートを初期化
     */
    initializeTestSuites(): void {
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
     * @param format - エクスポート形式
     * @param options - エクスポートオプション
     */
    exportCurrentPanelData(format: string = 'json', options: ExportOptions = {}): void {
        const panelManager = (this.mainController as MainController).getComponent('panelManager') as PanelManager;
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
     * @param panelId - パネルID
     * @returns パネルデータ
     */
    collectPanelData(panelId: string): PanelData {
        const controller = this.mainController as MainController;
        const baseData: PanelData = {
            panelId: panelId,
            timestamp: Date.now(),
            sessionId: controller.sessionId,
            version: '1.0.0',
            type: 'unknown'
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
     * @returns コンソールデータ
     */
    collectConsoleData(): Partial<PanelData> {
        const controller = this.mainController as MainController;
        const consoleOutput = controller.container?.querySelector('.console-output');
        return {
            type: 'console',
            output: consoleOutput?.textContent || '',
            commandHistory: this.getCommandHistory(),
            timestamp: Date.now()
        };
    }

    /**
     * パフォーマンスデータを収集
     * @returns パフォーマンスデータ
     */
    collectPerformanceData(): Partial<PanelData> {
        const controller = this.mainController as MainController;
        const visualizer = controller.getComponent('visualizer') as Visualizer;
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
     * @returns メモリデータ
     */
    collectMemoryData(): Partial<PanelData> {
        return {
            type: 'memory',
            usage: {
                used: (performance as any).memory?.usedJSHeapSize || 0,
                total: (performance as any).memory?.totalJSHeapSize || 0,
                limit: (performance as any).memory?.jsHeapSizeLimit || 0
            },
            gc: this.getGCInfo(),
            timestamp: Date.now()
        };
    }

    /**
     * ネットワークデータを収集
     * @returns ネットワークデータ
     */
    collectNetworkData(): Partial<PanelData> {
        return {
            type: 'network',
            requests: this.getNetworkRequests(),
            performance: this.getNetworkPerformance(),
            timestamp: Date.now()
        };
    }

    /**
     * 設定データを収集
     * @returns 設定データ
     */
    collectSettingsData(): Partial<PanelData> {
        const controller = this.mainController as MainController;
        const visualizer = controller.getComponent('visualizer') as Visualizer;
        return {
            type: 'settings',
            debugSettings: controller.settings || {},
            theme: visualizer?.getCurrentTheme?.(),
            layout: visualizer?.getResponsiveLayout?.(),
            timestamp: Date.now()
        };
    }

    /**
     * データをエクスポート
     * @param data - エクスポートデータ
     * @param filename - ファイル名
     * @param format - 形式
     * @param options - オプション
     */
    exportData(data: any, filename: string, format: string, options: ExportOptions = {}): void {
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
                error: (error as Error).message,
                timestamp: Date.now(),
                success: false
            });
            
            this._handleError('data export', error);
        }
    }

    /**
     * ファイルをダウンロード
     * @param content - ファイル内容
     * @param filename - ファイル名
     * @param mimeType - MIMEタイプ
     */
    downloadFile(content: string, filename: string, mimeType: string): void {
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
     * @param data - データ
     * @returns CSV文字列
     */
    convertToCSV(data: any): string {
        if (Array.isArray(data)) {
            if (data.length === 0) return '';
            
            const headers = Object.keys(data[0]);
            const csvLines = [headers.join(',')];
            
            data.forEach((row: any) => {
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
     * @param data - データ
     * @returns テキスト文字列
     */
    convertToText(data: any): string {
        if (typeof data === 'string') return data;
        if (typeof data === 'object') {
            return this.objectToText(data, 0);
        }
        return String(data);
    }

    /**
     * オブジェクトをテキストに変換
     * @param obj - オブジェクト
     * @param indent - インデントレベル
     * @returns テキスト文字列
     */
    objectToText(obj: any, indent: number = 0): string {
        const spaces = '  '.repeat(indent);
        const lines: string[] = [];
        
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
     * @param data - データ
     * @returns XML文字列
     */
    convertToXML(data: any): string {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';
        xml += this.objectToXML(data, 1);
        xml += '</data>';
        return xml;
    }

    /**
     * オブジェクトをXMLに変換
     * @param obj - オブジェクト
     * @param indent - インデントレベル
     * @returns XML文字列
     */
    objectToXML(obj: any, indent: number = 0): string {
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
     * @param text - テキスト
     * @returns エスケープされたテキスト
     */
    escapeXML(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * エクスポート履歴に追加
     * @param record - エクスポート記録
     */
    addToExportHistory(record: ExportRecord): void {
        this.exportHistory.unshift(record);
        
        // 履歴の長さを制限（最大50件）
        if (this.exportHistory.length > 50) {
            this.exportHistory = this.exportHistory.slice(0, 50);
        }
    }

    // === テスト結果管理 ===

    /**
     * 統合テスト結果を取得
     * @returns テスト結果
     */
    getIntegrationTestResults(): TestSuite | undefined {
        return this.testResults.get('integration');
    }

    /**
     * 統合テスト結果をエクスポート
     * @param format - エクスポート形式
     */
    exportIntegrationTestResults(format: string = 'json'): void {
        const results = this.getIntegrationTestResults();
        if (results) {
            this.exportData(results, 'integration-test-results', format);
        }
    }

    /**
     * 要件検証結果を取得
     * @returns 検証結果
     */
    getRequirementsValidationResults(): TestSuite | undefined {
        return this.testResults.get('requirements');
    }

    /**
     * 要件検証結果をエクスポート
     * @param format - エクスポート形式
     */
    exportRequirementsValidationResults(format: string = 'json'): void {
        const results = this.getRequirementsValidationResults();
        if (results) {
            this.exportData(results, 'requirements-validation-results', format);
        }
    }

    /**
     * 最終検証結果を取得
     * @returns 検証結果
     */
    getFinalValidationResults(): TestSuite | undefined {
        return this.testResults.get('final');
    }

    /**
     * 最終検証結果をエクスポート
     * @param format - エクスポート形式
     */
    exportFinalValidationResults(format: string = 'json'): void {
        const results = this.getFinalValidationResults();
        if (results) {
            this.exportData(results, 'final-validation-results', format);
        }
    }

    // === ヘルパーメソッド ===

    /**
     * コマンド履歴を取得
     * @returns コマンド履歴
     */
    getCommandHistory(): string[] {
        // コンソールコマンド履歴の実装
        return [];
    }

    /**
     * 現在のFPSを取得
     * @returns FPS値
     */
    getCurrentFPS(): number {
        return 60; // 実際の実装では計測値を返す
    }

    /**
     * 現在のメモリ使用量を取得
     * @returns メモリ使用量
     */
    getCurrentMemoryUsage(): number {
        return (performance as any).memory?.usedJSHeapSize || 0;
    }

    /**
     * 現在のCPU使用率を取得
     * @returns CPU使用率
     */
    getCurrentCPUUsage(): number {
        return 0; // 実際の実装では計測値を返す
    }

    /**
     * 現在のGPU使用率を取得
     * @returns GPU使用率
     */
    getCurrentGPUUsage(): number {
        return 0; // 実際の実装では計測値を返す
    }

    /**
     * GC情報を取得
     * @returns GC情報
     */
    getGCInfo(): GCInfo {
        return {
            collections: 0,
            totalTime: 0,
            averageTime: 0
        };
    }

    /**
     * ネットワークリクエストを取得
     * @returns ネットワークリクエスト
     */
    getNetworkRequests(): any[] {
        return [];
    }

    /**
     * ネットワークパフォーマンスを取得
     * @returns ネットワークパフォーマンス
     */
    getNetworkPerformance(): NetworkPerformance {
        return {
            download: 0,
            upload: 0,
            latency: 0
        };
    }

    /**
     * チャートデータをエクスポート
     * @returns チャートデータ
     */
    exportChartData(): Record<string, any> {
        const controller = this.mainController as MainController;
        const visualizer = controller.getComponent('visualizer') as Visualizer;
        if (!visualizer) return {};

        const chartData: Record<string, any> = {};
        for (const [id, chart] of visualizer.charts) {
            chartData[id] = {
                id: id,
                content: chart.innerHTML,
                data: (chart as any).dataset
            };
        }
        return chartData;
    }

    // === 公開API ===

    /**
     * エクスポート統計を取得
     * @returns 統計情報
     */
    getExportStatistics(): ExportStatistics {
        return { ...this.exportStatistics };
    }

    /**
     * エクスポート履歴を取得
     * @returns エクスポート履歴
     */
    getExportHistory(): ExportRecord[] {
        return [...this.exportHistory];
    }

    /**
     * 利用可能なエクスポート形式を取得
     * @returns 形式配列
     */
    getAvailableFormats(): string[] {
        return Array.from(this.exportFormats.keys());
    }

    /**
     * 全データをエクスポート
     * @param format - エクスポート形式
     */
    exportAllData(format: string = 'json'): void {
        const controller = this.mainController as MainController;
        const allData = {
            debugInterface: {
                sessionId: controller.sessionId,
                timestamp: Date.now()
            },
            panels: {} as Record<string, PanelData>,
            testResults: Object.fromEntries(this.testResults),
            statistics: {
                export: this.getExportStatistics(),
                panels: (controller.getComponent('panelManager') as PanelManager)?.getPanelStatistics?.(),
                shortcuts: (controller.getComponent('commandProcessor') as CommandProcessor)?.getShortcutStatistics?.()
            }
        };

        // 各パネルのデータを収集
        const panelManager = controller.getComponent('panelManager') as PanelManager;
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
    cleanup(): void {
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