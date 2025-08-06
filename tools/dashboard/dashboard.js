/**
 * Configuration Monitoring Dashboard JavaScript - Main Controller
 * 
 * リアルタイム設定監視、整合性チェック、変更履歴の可視化
 * Main Controller Patternを採用し、各専門コンポーネントを統制
 * 
 * Created: 2025-07-27 (Task 8.3)
 * Refactored: Phase F.4 - Main Controller Pattern
 */

// Import sub-components
import { DashboardDataManager } from './components/DashboardDataManager.js';
import { DashboardVisualization } from './components/DashboardVisualization.js';
import { DashboardValidation } from './components/DashboardValidation.js';
import { DashboardReporting } from './components/DashboardReporting.js';

class ConfigurationDashboard {
    constructor() {
        this.isInitialized = false;
        this.refreshInterval = null;
        this.currentTab = 'scoring';
        
        // Initialize sub-components (dependency injection)
        this.dataManager = new DashboardDataManager(this);
        this.visualization = new DashboardVisualization(this);
        this.validationManager = new DashboardValidation(this);
        this.reportingManager = new DashboardReporting(this);
        
        this.init();
    }

    /**
     * ダッシュボードの初期化
     */
    async init() {
        try {
            this.setupEventListeners();
            await this.loadInitialData();
            this.initializeCharts();
            this.startRealTimeUpdates();
            this.isInitialized = true;
            
            this.visualization.showAlert('ダッシュボードが初期化されました', 'success');
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.visualization.showAlert('ダッシュボードの初期化に失敗しました', 'error');
        }
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // Header controls
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.refreshData());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportData());

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Validation controls
        document.getElementById('analyzeImpactBtn')?.addEventListener('click', () => this.analyzeImpact());
        document.getElementById('generateReportBtn')?.addEventListener('click', () => this.generateReport());

        // Comparison controls
        document.getElementById('compareBtn')?.addEventListener('click', () => this.compareConfigurations());

        // History filters
        document.getElementById('historyFilter')?.addEventListener('change', (e) => this.filterHistory(e.target.value));
        document.getElementById('historySearch')?.addEventListener('input', (e) => this.searchHistory(e.target.value));

        // Modal controls
        document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modalCancelBtn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('alertClose')?.addEventListener('click', () => this.closeAlert());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * 初期データの読み込み（DataManagerに委譲）
     */
    async loadInitialData() {
        try {
            const data = await this.dataManager.loadInitialData();
            const statistics = this.dataManager.calculateStatistics();
            
            this.visualization.updateSummaryCards(statistics);
            this.visualization.updateConfigurationTabs(data.configData);
            
            const validationStatus = await this.validationManager.updateValidationStatus();
            this.visualization.updateValidationStatus(validationStatus);
            
            this.visualization.updateChangeHistory(data.changeHistory);
            this.visualization.updateLastUpdateTime();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            throw error;
        }
    }

    /**
     * チャートの初期化（Visualizationに委譲）
     */
    initializeCharts() {
        this.visualization.initializeCharts();
    }

    /**
     * リアルタイム更新の開始
     */
    startRealTimeUpdates() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        this.refreshInterval = setInterval(() => {
            this.updateRealTimeData();
        }, 5000); // 5秒ごとに更新
    }

    /**
     * リアルタイムデータの更新
     */
    updateRealTimeData() {
        const realTimeData = this.dataManager.updateRealTimeData();
        this.visualization.updateRealTimeDisplay(realTimeData);
    }

    /**
     * データの更新（DataManagerに委譲）
     */
    async refreshData() {
        try {
            const data = await this.dataManager.refreshData();
            const statistics = this.dataManager.calculateStatistics();
            
            this.visualization.updateSummaryCards(statistics);
            this.visualization.updateConfigurationTabs(data.configData);
            this.visualization.updateChangeHistory(data.changeHistory);
            this.visualization.updateRealTimeDisplay(data.realTimeData);
            this.visualization.updateLastUpdateTime();
            
            this.visualization.showAlert('データを更新しました', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.visualization.showAlert('データの更新に失敗しました', 'error');
        }
    }

    /**
     * タブの切り替え
     */
    switchTab(tabId) {
        // すべてのタブとコンテンツを非アクティブ化
        document.querySelectorAll('.tab-btn, .tab-content').forEach(el => {
            el.classList.remove('active');
        });

        // アクティブなタブとコンテンツを設定
        document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
        document.getElementById(`${tabId}Tab`)?.classList.add('active');
        
        this.currentTab = tabId;
    }

    /**
     * 影響分析の実行（ValidationManagerに委譲）
     */
    async analyzeImpact() {
        try {
            const analysis = await this.validationManager.analyzeImpact();
            
            let html = '<h3>影響分析結果</h3>';
            if (analysis && analysis.impacts.length > 0) {
                html += '<div class="impact-list">';
                analysis.impacts.forEach(impact => {
                    html += `
                        <div class="impact-item severity-${impact.severity}">
                            <h4>${impact.category}</h4>
                            <p>${impact.description}</p>
                            <ul>${impact.details.map(detail => `<li>${detail}</li>`).join('')}</ul>
                        </div>
                    `;
                });
                html += '</div>';
                
                if (analysis.recommendations.length > 0) {
                    html += '<h4>推奨事項</h4><ul>';
                    analysis.recommendations.forEach(rec => {
                        html += `<li class="priority-${rec.priority}">${rec.message}</li>`;
                    });
                    html += '</ul>';
                }
            } else {
                html += '<p>現在の設定に大きな問題は検出されませんでした。</p>';
            }
            
            this.visualization.showModal('影響分析', html);
            
        } catch (error) {
            console.error('Impact analysis error:', error);
            this.visualization.showAlert('影響分析に失敗しました', 'error');
        }
    }

    /**
     * レポート生成（ReportingManagerに委譲）
     */
    async generateReport() {
        try {
            const report = await this.reportingManager.generateReport();
            
            const html = `
                <h3>レポート生成完了</h3>
                <p><strong>レポートID:</strong> ${report.id}</p>
                <p><strong>生成日時:</strong> ${new Date(report.timestamp).toLocaleString('ja-JP')}</p>
                <div class="report-actions">
                    <button onclick="dashboard.downloadReport('${report.id}', 'json')">JSON形式でダウンロード</button>
                    <button onclick="dashboard.downloadReport('${report.id}', 'html')">HTML形式でダウンロード</button>
                    <button onclick="dashboard.downloadReport('${report.id}', 'csv')">CSV形式でダウンロード</button>
                </div>
            `;
            
            this.visualization.showModal('レポート生成', html);
            
        } catch (error) {
            console.error('Report generation error:', error);
            this.visualization.showAlert('レポート生成に失敗しました', 'error');
        }
    }

    /**
     * データエクスポート
     */
    async exportData() {
        try {
            const exportData = this.dataManager.exportData('json');
            
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.visualization.showAlert('データをエクスポートしました', 'success');
            
        } catch (error) {
            console.error('Export error:', error);
            this.visualization.showAlert('エクスポートに失敗しました', 'error');
        }
    }

    /**
     * 設定比較
     */
    async compareConfigurations() {
        this.visualization.showAlert('設定比較機能は開発中です', 'info');
    }

    /**
     * 履歴のフィルタリング
     */
    filterHistory(filterType) {
        const filteredHistory = this.dataManager.filterHistory(filterType);
        this.visualization.updateChangeHistory(filteredHistory);
    }

    /**
     * 履歴の検索
     */
    searchHistory(query) {
        const searchResults = this.dataManager.searchHistory(query);
        this.visualization.updateChangeHistory(searchResults);
    }

    /**
     * レポートのダウンロード（publicメソッド）
     */
    downloadReport(reportId, format) {
        const report = this.reportingManager.reportHistory.find(r => r.id === reportId);
        if (report) {
            this.reportingManager.downloadReport(report, format);
        }
    }

    /**
     * 設定編集モーダルの表示
     */
    showEditModal(category, key, currentValue) {
        const html = `
            <h3>設定の編集</h3>
            <div class="edit-form">
                <p><strong>カテゴリ:</strong> ${category}</p>
                <p><strong>設定項目:</strong> ${key}</p>
                <label for="newValue">新しい値:</label>
                <input type="text" id="newValue" value="${currentValue}" />
                <div class="modal-actions">
                    <button onclick="dashboard.saveConfigChange('${category}', '${key}')" class="btn-primary">保存</button>
                    <button onclick="dashboard.closeModal()" class="btn-secondary">キャンセル</button>
                </div>
            </div>
        `;
        this.visualization.showModal('設定編集', html);
    }

    /**
     * 設定変更の保存
     */
    saveConfigChange(category, key) {
        const newValue = document.getElementById('newValue')?.value;
        if (newValue !== undefined) {
            // TODO: 実際の保存処理を実装
            console.log(`Saving ${category}.${key} = ${newValue}`);
            this.visualization.showAlert('設定を保存しました', 'success');
            this.closeModal();
            this.refreshData();
        }
    }

    /**
     * キーボードショートカットの処理
     */
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'r':
                    e.preventDefault();
                    this.refreshData();
                    break;
                case 'e':
                    e.preventDefault();
                    this.exportData();
                    break;
                case 'g':
                    e.preventDefault();
                    this.generateReport();
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            this.closeModal();
            this.closeAlert();
        }
    }

    /**
     * ウィンドウリサイズの処理
     */
    handleResize() {
        this.visualization.handleResize();
    }

    /**
     * モーダルを閉じる
     */
    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * アラートを閉じる
     */
    closeAlert() {
        const alert = document.getElementById('alert');
        if (alert) {
            alert.classList.remove('active');
        }
    }

    /**
     * クリーンアップ
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        this.visualization.destroy();
        this.isInitialized = false;
        
        console.log('ConfigurationDashboard destroyed');
    }
}

// グローバルインスタンス（legacy compatibility）
let dashboard;

// DOMContentLoadedで初期化
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new ConfigurationDashboard();
});

// モジュールとしてもエクスポート
export { ConfigurationDashboard };