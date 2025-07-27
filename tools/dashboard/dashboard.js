/**
 * Configuration Monitoring Dashboard JavaScript
 * 
 * リアルタイム設定監視、整合性チェック、変更履歴の可視化
 * 
 * Created: 2025-07-27 (Task 8.3)
 */

class ConfigurationDashboard {
    constructor() {
        this.isInitialized = false;
        this.refreshInterval = null;
        this.currentTab = 'scoring';
        this.accessChart = null;
        this.configData = null;
        this.validationStatus = {
            consistency: 'pending',
            balance: 'pending',
            type: 'pending'
        };
        this.changeHistory = [];
        this.realTimeData = {
            accessCounts: Array(20).fill(0),
            recentChanges: []
        };
        
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
            
            this.showAlert('ダッシュボードが初期化されました', 'success');
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.showAlert('ダッシュボードの初期化に失敗しました', 'error');
        }
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // Header controls
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshData());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

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
     * 初期データの読み込み
     */
    async loadInitialData() {
        try {
            // Mock data for demonstration
            this.configData = await this.fetchConfigurationData();
            this.changeHistory = await this.fetchChangeHistory();
            
            this.updateSummaryCards();
            this.updateConfigurationTabs();
            this.updateValidationStatus();
            this.updateChangeHistory();
            this.updateLastUpdateTime();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            throw error;
        }
    }

    /**
     * 設定データの取得（モック実装）
     */
    async fetchConfigurationData() {
        // 実際の実装では API から取得
        return {
            scoring: {
                baseScores: {
                    normal: 15,
                    stone: 25,
                    iron: 40,
                    diamond: 60,
                    boss: 100,
                    pink: 20,
                    poison: 30,
                    spiky: 35
                },
                combo: {
                    multiplierIncrement: 0.08,
                    maxMultiplier: 2.5
                }
            },
            bubbles: {
                health: {
                    normal: 1,
                    stone: 2,
                    iron: 3,
                    diamond: 4,
                    boss: 8,
                    pink: 1,
                    poison: 1,
                    spiky: 2
                },
                maxAge: {
                    normal: 30000,
                    stone: 35000,
                    iron: 40000,
                    diamond: 45000,
                    boss: 50000
                },
                specialEffects: {
                    electric: {
                        intensity: 15,
                        duration: 1500
                    },
                    rainbow: {
                        duration: 8000
                    }
                }
            },
            stages: {
                unlockRequirements: {
                    hard: 500,
                    veryHard: 2000,
                    special: 5000,
                    nightmare: 10000
                }
            },
            performance: {
                targetFPS: 60,
                maxBubbles: 50,
                cacheSize: 100
            }
        };
    }

    /**
     * 変更履歴の取得（モック実装）
     */
    async fetchChangeHistory() {
        const now = new Date();
        return [
            {
                timestamp: new Date(now - 3600000),
                type: 'config_change',
                key: 'scoring.baseScores.normal',
                oldValue: 10,
                newValue: 15,
                user: 'admin',
                description: '通常バブルスコアの調整'
            },
            {
                timestamp: new Date(now - 7200000),
                type: 'validation',
                description: '設定整合性チェック完了',
                result: 'success'
            },
            {
                timestamp: new Date(now - 10800000),
                type: 'config_change',
                key: 'bubbles.health.boss',
                oldValue: 5,
                newValue: 8,
                user: 'admin',
                description: 'ボスバブル体力の調整'
            }
        ];
    }

    /**
     * サマリーカードの更新
     */
    updateSummaryCards() {
        const totalConfigs = this.countTotalConfigurations();
        const consistencyStatus = this.getConsistencyStatus();
        const performanceScore = this.calculatePerformanceScore();
        const recentChanges = this.countRecentChanges();

        document.getElementById('totalConfigs').textContent = totalConfigs;
        document.getElementById('consistencyStatus').textContent = consistencyStatus;
        document.getElementById('performanceScore').textContent = performanceScore + '%';
        document.getElementById('recentChanges').textContent = recentChanges;
    }

    /**
     * 総設定数の計算
     */
    countTotalConfigurations() {
        let count = 0;
        const countObject = (obj) => {
            for (const value of Object.values(obj)) {
                if (typeof value === 'object' && value !== null) {
                    count += countObject(value);
                } else {
                    count++;
                }
            }
            return count;
        };
        return countObject(this.configData);
    }

    /**
     * 整合性ステータスの取得
     */
    getConsistencyStatus() {
        const { consistency, balance, type } = this.validationStatus;
        if (consistency === 'success' && balance === 'success' && type === 'success') {
            return '✅ 良好';
        } else if (consistency === 'error' || balance === 'error' || type === 'error') {
            return '❌ 問題あり';
        } else if (consistency === 'warning' || balance === 'warning' || type === 'warning') {
            return '⚠️ 警告';
        }
        return '🔄 チェック中';
    }

    /**
     * パフォーマンススコアの計算
     */
    calculatePerformanceScore() {
        // モック計算
        const accessEfficiency = 95;
        const cacheHitRate = 88;
        const validationSpeed = 92;
        
        return Math.round((accessEfficiency + cacheHitRate + validationSpeed) / 3);
    }

    /**
     * 直近の変更数の計算
     */
    countRecentChanges() {
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return this.changeHistory.filter(change => 
            change.timestamp > last24Hours && change.type === 'config_change'
        ).length;
    }

    /**
     * 設定タブの更新
     */
    updateConfigurationTabs() {
        this.displayConfigurationTab(this.currentTab);
    }

    /**
     * タブの切り替え
     */
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        this.currentTab = tabName;
        this.displayConfigurationTab(tabName);
    }

    /**
     * 設定タブコンテンツの表示
     */
    displayConfigurationTab(tabName) {
        const content = document.getElementById('configContent');
        const data = this.configData[tabName];

        if (!data) {
            content.innerHTML = '<p class="text-center">データが見つかりません</p>';
            return;
        }

        const table = this.createConfigurationTable(data, tabName);
        content.innerHTML = table;
    }

    /**
     * 設定テーブルの作成
     */
    createConfigurationTable(data, prefix = '') {
        const rows = [];
        
        const processObject = (obj, currentPrefix = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const fullKey = currentPrefix ? `${currentPrefix}.${key}` : key;
                
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    processObject(value, fullKey);
                } else {
                    const status = this.getConfigValueStatus(fullKey, value);
                    rows.push({
                        key: fullKey,
                        value: value,
                        status: status,
                        type: typeof value
                    });
                }
            }
        };

        processObject(data);

        let tableHTML = `
            <table class="config-table">
                <thead>
                    <tr>
                        <th>設定項目</th>
                        <th>値</th>
                        <th>型</th>
                        <th>ステータス</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
        `;

        rows.forEach(row => {
            const statusIcon = this.getStatusIcon(row.status);
            tableHTML += `
                <tr>
                    <td>${row.key}</td>
                    <td><span class="config-value">${row.value}</span></td>
                    <td>${row.type}</td>
                    <td>${statusIcon} ${row.status}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="dashboard.editConfig('${row.key}')">編集</button>
                        <button class="btn btn-secondary btn-sm" onclick="dashboard.viewHistory('${row.key}')">履歴</button>
                    </td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        return tableHTML;
    }

    /**
     * 設定値のステータス取得
     */
    getConfigValueStatus(key, value) {
        // 簡易的なステータス判定
        if (key.includes('score') && typeof value === 'number') {
            return value > 0 ? 'valid' : 'invalid';
        }
        if (key.includes('health') && typeof value === 'number') {
            return value > 0 ? 'valid' : 'invalid';
        }
        return 'valid';
    }

    /**
     * ステータスアイコンの取得
     */
    getStatusIcon(status) {
        switch (status) {
            case 'valid': return '<div class="status-indicator success"></div>';
            case 'invalid': return '<div class="status-indicator error"></div>';
            case 'warning': return '<div class="status-indicator warning"></div>';
            default: return '<div class="status-indicator pending"></div>';
        }
    }

    /**
     * 検証ステータスの更新
     */
    async updateValidationStatus() {
        // 整合性チェック
        setTimeout(() => {
            this.validationStatus.consistency = 'success';
            this.updateValidationUI('consistencyCheck', 'success', '整合性チェック完了');
            this.updateValidationDetails('consistencyDetails', 'すべての設定が同期されています');
        }, 1000);

        // バランス検証
        setTimeout(() => {
            this.validationStatus.balance = 'warning';
            this.updateValidationUI('balanceCheck', 'warning', 'バランス警告あり');
            this.updateValidationDetails('balanceDetails', '一部の設定値でバランス調整が推奨されます');
        }, 2000);

        // 型安全性チェック
        setTimeout(() => {
            this.validationStatus.type = 'success';
            this.updateValidationUI('typeCheck', 'success', '型チェック完了');
            this.updateValidationDetails('typeDetails', 'すべての型が正しく定義されています');
        }, 3000);
    }

    /**
     * 検証UIの更新
     */
    updateValidationUI(elementId, status, message) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const indicator = element.querySelector('.status-indicator');
        const text = element.querySelector('span');

        indicator.className = `status-indicator ${status}`;
        text.textContent = message;
    }

    /**
     * 検証詳細の更新
     */
    updateValidationDetails(elementId, details) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = details;
        }
    }

    /**
     * 変更履歴の更新
     */
    updateChangeHistory() {
        const timeline = document.getElementById('historyTimeline');
        if (!timeline) return;

        const filteredHistory = this.getFilteredHistory();
        
        if (filteredHistory.length === 0) {
            timeline.innerHTML = '<p class="text-center">変更履歴がありません</p>';
            return;
        }

        timeline.innerHTML = filteredHistory.map(item => `
            <div class="timeline-item">
                <div class="timeline-time">${this.formatTime(item.timestamp)}</div>
                <div class="timeline-content">
                    <div class="timeline-title">${this.getChangeTitle(item)}</div>
                    <div class="timeline-description">${item.description}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * フィルタリングされた履歴の取得
     */
    getFilteredHistory() {
        const filter = document.getElementById('historyFilter')?.value || 'all';
        const search = document.getElementById('historySearch')?.value.toLowerCase() || '';

        let filtered = [...this.changeHistory];

        // 期間フィルター
        if (filter !== 'all') {
            const now = new Date();
            let cutoff;
            
            switch (filter) {
                case 'today':
                    cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    cutoff = new Date(now - 30 * 24 * 60 * 60 * 1000);
                    break;
            }
            
            if (cutoff) {
                filtered = filtered.filter(item => item.timestamp >= cutoff);
            }
        }

        // 検索フィルター
        if (search) {
            filtered = filtered.filter(item => 
                (item.key && item.key.toLowerCase().includes(search)) ||
                item.description.toLowerCase().includes(search)
            );
        }

        return filtered.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * 変更タイトルの取得
     */
    getChangeTitle(item) {
        switch (item.type) {
            case 'config_change':
                return `設定変更: ${item.key}`;
            case 'validation':
                return '検証実行';
            default:
                return 'システム操作';
        }
    }

    /**
     * 時刻のフォーマット
     */
    formatTime(timestamp) {
        return new Intl.DateTimeFormat('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            month: '2-digit',
            day: '2-digit'
        }).format(timestamp);
    }

    /**
     * チャートの初期化
     */
    initializeCharts() {
        const canvas = document.getElementById('accessChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // 簡易的なチャート実装（実際の実装では Chart.js などを使用）
        this.drawAccessChart(ctx, canvas.width, canvas.height);
    }

    /**
     * アクセスチャートの描画
     */
    drawAccessChart(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
        
        const data = this.realTimeData.accessCounts;
        const max = Math.max(...data, 1);
        const barWidth = width / data.length;
        
        // バーグラフの描画
        data.forEach((value, index) => {
            const barHeight = (value / max) * (height - 20);
            const x = index * barWidth;
            const y = height - barHeight - 10;
            
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
        });
        
        // ラベル
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('設定アクセス頻度', width / 2, height - 2);
    }

    /**
     * リアルタイム更新の開始
     */
    startRealTimeUpdates() {
        this.refreshInterval = setInterval(() => {
            this.updateRealTimeData();
        }, 5000); // 5秒間隔で更新
    }

    /**
     * リアルタイムデータの更新
     */
    updateRealTimeData() {
        // アクセス数データの更新（モック）
        this.realTimeData.accessCounts.shift();
        this.realTimeData.accessCounts.push(Math.floor(Math.random() * 20));
        
        // チャートの再描画
        const canvas = document.getElementById('accessChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            this.drawAccessChart(ctx, canvas.width, canvas.height);
        }
        
        // 変更フィードの更新
        this.updateChangesFeed();
        
        // パフォーマンス指標の更新
        this.updateSummaryCards();
    }

    /**
     * 変更フィードの更新
     */
    updateChangesFeed() {
        const feed = document.getElementById('changesFeed');
        if (!feed) return;

        const recentChanges = this.realTimeData.recentChanges.slice(-5);
        
        feed.innerHTML = recentChanges.length > 0 
            ? recentChanges.map(change => `
                <div class="change-item">
                    <span>${change.description}</span>
                    <span class="change-time">${this.formatTime(change.timestamp)}</span>
                </div>
              `).join('')
            : '<div class="text-center">変更はありません</div>';
    }

    /**
     * データの更新
     */
    async refreshData() {
        const button = document.getElementById('refreshBtn');
        button.disabled = true;
        button.textContent = '🔄 更新中...';

        try {
            await this.loadInitialData();
            this.showAlert('データが更新されました', 'success');
        } catch (error) {
            console.error('Refresh error:', error);
            this.showAlert('データの更新に失敗しました', 'error');
        } finally {
            button.disabled = false;
            button.textContent = '🔄 更新';
        }
    }

    /**
     * データのエクスポート
     */
    exportData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            configuration: this.configData,
            validationStatus: this.validationStatus,
            changeHistory: this.changeHistory,
            performanceMetrics: {
                totalConfigurations: this.countTotalConfigurations(),
                consistencyStatus: this.getConsistencyStatus(),
                performanceScore: this.calculatePerformanceScore()
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `config-dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showAlert('データをエクスポートしました', 'success');
    }

    /**
     * 影響分析の実行
     */
    async analyzeImpact() {
        const button = document.getElementById('analyzeImpactBtn');
        button.disabled = true;
        button.textContent = '分析中...';

        try {
            // モック分析結果
            const analysisResult = {
                summary: {
                    totalChanges: 3,
                    highRiskChanges: 1,
                    mediumRiskChanges: 1,
                    lowRiskChanges: 1
                },
                details: [
                    {
                        setting: 'scoring.baseScores.boss',
                        impact: 'ゲームバランスに大きな影響',
                        risk: 'HIGH',
                        recommendation: '段階的な調整を推奨'
                    },
                    {
                        setting: 'bubbles.health.normal',
                        impact: '基本的なゲームプレイに影響',
                        risk: 'MEDIUM',
                        recommendation: 'テストプレイで検証'
                    }
                ]
            };

            this.displayImpactAnalysis(analysisResult);
            this.showAlert('影響分析が完了しました', 'success');

        } catch (error) {
            console.error('Impact analysis error:', error);
            this.showAlert('影響分析に失敗しました', 'error');
        } finally {
            button.disabled = false;
            button.textContent = '影響分析実行';
        }
    }

    /**
     * 影響分析結果の表示
     */
    displayImpactAnalysis(result) {
        const container = document.getElementById('impactResults');
        if (!container) return;

        container.innerHTML = `
            <div class="impact-summary">
                <div class="impact-metric">
                    <div class="impact-metric-value">${result.summary.totalChanges}</div>
                    <div class="impact-metric-label">総変更数</div>
                </div>
                <div class="impact-metric">
                    <div class="impact-metric-value text-error">${result.summary.highRiskChanges}</div>
                    <div class="impact-metric-label">高リスク</div>
                </div>
                <div class="impact-metric">
                    <div class="impact-metric-value text-warning">${result.summary.mediumRiskChanges}</div>
                    <div class="impact-metric-label">中リスク</div>
                </div>
                <div class="impact-metric">
                    <div class="impact-metric-value text-success">${result.summary.lowRiskChanges}</div>
                    <div class="impact-metric-label">低リスク</div>
                </div>
            </div>
            
            <h4>詳細分析</h4>
            <div class="impact-details">
                ${result.details.map(detail => `
                    <div class="impact-detail-item">
                        <h5>${detail.setting}</h5>
                        <p><strong>影響:</strong> ${detail.impact}</p>
                        <p><strong>リスク:</strong> <span class="text-${detail.risk.toLowerCase()}">${detail.risk}</span></p>
                        <p><strong>推奨:</strong> ${detail.recommendation}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * レポートの生成
     */
    async generateReport() {
        const button = document.getElementById('generateReportBtn');
        button.disabled = true;
        button.textContent = 'レポート生成中...';

        try {
            const report = this.createDetailedReport();
            this.downloadReport(report);
            this.showAlert('レポートが生成されました', 'success');
        } catch (error) {
            console.error('Report generation error:', error);
            this.showAlert('レポート生成に失敗しました', 'error');
        } finally {
            button.disabled = false;
            button.textContent = 'レポート生成';
        }
    }

    /**
     * 詳細レポートの作成
     */
    createDetailedReport() {
        const now = new Date();
        return {
            reportMetadata: {
                generatedAt: now.toISOString(),
                title: 'Configuration Dashboard Report',
                version: '1.0.0'
            },
            summary: {
                totalConfigurations: this.countTotalConfigurations(),
                consistencyStatus: this.getConsistencyStatus(),
                performanceScore: this.calculatePerformanceScore(),
                recentChanges: this.countRecentChanges()
            },
            configurationData: this.configData,
            validationResults: this.validationStatus,
            changeHistory: this.changeHistory,
            recommendations: this.generateRecommendations()
        };
    }

    /**
     * 推奨事項の生成
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.validationStatus.balance === 'warning') {
            recommendations.push('バランス調整の検討が必要です');
        }
        
        if (this.countRecentChanges() > 10) {
            recommendations.push('多数の変更が行われています。安定性の確認を推奨します');
        }
        
        if (this.calculatePerformanceScore() < 80) {
            recommendations.push('パフォーマンスの最適化を検討してください');
        }
        
        return recommendations;
    }

    /**
     * レポートのダウンロード
     */
    downloadReport(report) {
        const blob = new Blob([JSON.stringify(report, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `config-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 設定比較の実行
     */
    async compareConfigurations() {
        const source1 = document.getElementById('compareSource1')?.value;
        const source2 = document.getElementById('compareSource2')?.value;

        if (!source1 || !source2) {
            this.showAlert('比較する設定を選択してください', 'warning');
            return;
        }

        const button = document.getElementById('compareBtn');
        button.disabled = true;
        button.textContent = '比較中...';

        try {
            const comparisonResult = await this.performComparison(source1, source2);
            this.displayComparisonResult(comparisonResult);
            this.showAlert('設定比較が完了しました', 'success');
        } catch (error) {
            console.error('Comparison error:', error);
            this.showAlert('設定比較に失敗しました', 'error');
        } finally {
            button.disabled = false;
            button.textContent = '比較実行';
        }
    }

    /**
     * 比較の実行
     */
    async performComparison(source1, source2) {
        // モック比較結果
        return {
            differences: [
                {
                    key: 'scoring.baseScores.normal',
                    source1Value: 10,
                    source2Value: 15,
                    type: 'modified'
                },
                {
                    key: 'bubbles.health.boss',
                    source1Value: 5,
                    source2Value: 8,
                    type: 'modified'
                }
            ],
            summary: {
                totalDifferences: 2,
                added: 0,
                removed: 0,
                modified: 2
            }
        };
    }

    /**
     * 比較結果の表示
     */
    displayComparisonResult(result) {
        const container = document.getElementById('comparisonResult');
        if (!container) return;

        if (result.differences.length === 0) {
            container.innerHTML = '<p class="text-center">相違点はありません</p>';
            return;
        }

        container.innerHTML = `
            <div class="comparison-summary">
                <p>相違点: ${result.summary.totalDifferences}件</p>
            </div>
            <div class="comparison-details">
                ${result.differences.map(diff => `
                    <div class="diff-item diff-${diff.type}">
                        <div>${diff.key}</div>
                        <div>${diff.source1Value}</div>
                        <div>${diff.source2Value}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * 履歴フィルターの適用
     */
    filterHistory(filter) {
        this.updateChangeHistory();
    }

    /**
     * 履歴検索の実行
     */
    searchHistory(query) {
        this.updateChangeHistory();
    }

    /**
     * 最終更新時刻の更新
     */
    updateLastUpdateTime() {
        const element = document.getElementById('lastUpdate');
        if (element) {
            element.textContent = new Date().toLocaleString('ja-JP');
        }
    }

    /**
     * アラートの表示
     */
    showAlert(message, type = 'info') {
        const alertBar = document.getElementById('alertBar');
        const alertMessage = document.getElementById('alertMessage');
        
        if (!alertBar || !alertMessage) return;

        alertMessage.textContent = message;
        alertBar.className = `alert-bar alert-${type}`;
        alertBar.classList.remove('hidden');

        // 3秒後に自動的に閉じる
        setTimeout(() => {
            this.closeAlert();
        }, 3000);
    }

    /**
     * アラートを閉じる
     */
    closeAlert() {
        const alertBar = document.getElementById('alertBar');
        if (alertBar) {
            alertBar.classList.add('hidden');
        }
    }

    /**
     * モーダルの表示
     */
    showModal(title, content, actionCallback = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalActionBtn = document.getElementById('modalActionBtn');

        if (!modal) return;

        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        
        if (actionCallback) {
            modalActionBtn.style.display = 'block';
            modalActionBtn.onclick = () => {
                actionCallback();
                this.closeModal();
            };
        } else {
            modalActionBtn.style.display = 'none';
        }

        modal.classList.remove('hidden');
    }

    /**
     * モーダルを閉じる
     */
    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * 設定編集（モーダル表示）
     */
    editConfig(key) {
        const currentValue = this.getConfigValue(key);
        const content = `
            <div>
                <label for="configValue">設定値:</label>
                <input type="text" id="configValue" value="${currentValue}" style="width: 100%; padding: 0.5rem; margin-top: 0.5rem;">
                <p style="margin-top: 1rem; color: #666; font-size: 0.875rem;">
                    現在の値: ${currentValue}
                </p>
            </div>
        `;

        this.showModal(`設定編集: ${key}`, content, () => {
            const newValue = document.getElementById('configValue').value;
            this.updateConfigValue(key, newValue);
        });
    }

    /**
     * 設定値の取得
     */
    getConfigValue(key) {
        const keys = key.split('.');
        let value = this.configData;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined;
            }
        }
        
        return value;
    }

    /**
     * 設定値の更新
     */
    updateConfigValue(key, newValue) {
        const oldValue = this.getConfigValue(key);
        
        // 値の型に応じて変換
        let parsedValue = newValue;
        if (typeof oldValue === 'number') {
            parsedValue = parseFloat(newValue);
        } else if (typeof oldValue === 'boolean') {
            parsedValue = newValue === 'true';
        }

        // 設定値の更新（実際の実装では API 呼び出し）
        this.setConfigValue(key, parsedValue);
        
        // 履歴に追加
        this.changeHistory.unshift({
            timestamp: new Date(),
            type: 'config_change',
            key: key,
            oldValue: oldValue,
            newValue: parsedValue,
            user: 'dashboard',
            description: `${key} の値を変更`
        });

        // UI更新
        this.updateConfigurationTabs();
        this.updateChangeHistory();
        this.showAlert(`${key} が更新されました`, 'success');
    }

    /**
     * 設定値の設定
     */
    setConfigValue(key, value) {
        const keys = key.split('.');
        let current = this.configData;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }

    /**
     * 設定履歴の表示
     */
    viewHistory(key) {
        const history = this.changeHistory.filter(item => item.key === key);
        
        const content = history.length > 0
            ? `
                <div>
                    ${history.map(item => `
                        <div style="padding: 0.5rem; border-bottom: 1px solid #eee;">
                            <div><strong>${this.formatTime(item.timestamp)}</strong></div>
                            <div>${item.oldValue} → ${item.newValue}</div>
                            <div style="color: #666; font-size: 0.875rem;">${item.description}</div>
                        </div>
                    `).join('')}
                </div>
              `
            : '<p>変更履歴がありません</p>';

        this.showModal(`変更履歴: ${key}`, content);
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
        if (this.accessChart) {
            const canvas = document.getElementById('accessChart');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                this.drawAccessChart(ctx, canvas.width, canvas.height);
            }
        }
    }

    /**
     * ダッシュボードの破棄
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // イベントリスナーの削除
        document.removeEventListener('keydown', this.handleKeyboardShortcuts);
        window.removeEventListener('resize', this.handleResize);
    }
}

// Global dashboard instance
let dashboard;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new ConfigurationDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (dashboard) {
        dashboard.destroy();
    }
});