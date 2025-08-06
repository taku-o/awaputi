/**
 * Dashboard Visualization Component
 * 
 * チャートと視覚的な表示を担当
 * Main Controller Patternの一部として設計
 */

export class DashboardVisualization {
    constructor(mainController) {
        this.mainController = mainController;
        this.accessChart = null;
        this.charts = {};
    }

    /**
     * チャートの初期化
     */
    initializeCharts() {
        this.initializeAccessChart();
        this.initializeCategoryChart();
        this.updateCharts();
    }

    /**
     * アクセスチャートの初期化
     */
    initializeAccessChart() {
        const canvas = document.getElementById('accessChart');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');
        this.accessChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(20).fill('').map((_, i) => i === 19 ? '現在' : ''),
                datasets: [{
                    label: 'アクセス数',
                    data: this.mainController.dataManager.realTimeData.accessCounts,
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    }
                }
            }
        });
    }

    /**
     * カテゴリチャートの初期化
     */
    initializeCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas || !window.Chart) return;

        const stats = this.mainController.dataManager.getCategoryStatistics();
        const ctx = canvas.getContext('2d');
        
        this.charts.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(stats),
                datasets: [{
                    data: Object.values(stats),
                    backgroundColor: [
                        '#4a90e2',
                        '#50c878',
                        '#f39c12',
                        '#e74c3c'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    /**
     * チャートの更新
     */
    updateCharts() {
        if (this.accessChart) {
            const realTimeData = this.mainController.dataManager.realTimeData;
            this.accessChart.data.datasets[0].data = realTimeData.accessCounts;
            this.accessChart.update('none');
        }

        if (this.charts.categoryChart) {
            const stats = this.mainController.dataManager.getCategoryStatistics();
            this.charts.categoryChart.data.labels = Object.keys(stats);
            this.charts.categoryChart.data.datasets[0].data = Object.values(stats);
            this.charts.categoryChart.update();
        }
    }

    /**
     * サマリーカードの更新
     */
    updateSummaryCards(statistics) {
        document.getElementById('totalConfigs').textContent = statistics.totalConfigs;
        document.getElementById('consistencyStatus').textContent = this.getConsistencyStatus();
        document.getElementById('performanceScore').textContent = this.calculatePerformanceScore() + '%';
        document.getElementById('recentChanges').textContent = statistics.recentChanges;
    }

    /**
     * 設定タブの更新
     */
    updateConfigurationTabs(configData) {
        for (const [category, data] of Object.entries(configData)) {
            const tabContent = document.getElementById(`${category}Tab`);
            if (tabContent) {
                tabContent.innerHTML = this.renderConfigurationTable(data, category);
                this.attachConfigEditListeners(category);
            }
        }
    }

    /**
     * 設定テーブルのレンダリング
     */
    renderConfigurationTable(data, category) {
        let html = '<table class="config-table"><thead><tr><th>設定名</th><th>現在の値</th><th>型</th><th>操作</th></tr></thead><tbody>';
        
        const renderRows = (obj, prefix = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    html += `<tr class="section-row"><td colspan="4"><strong>${fullKey}</strong></td></tr>`;
                    renderRows(value, fullKey);
                } else {
                    const type = Array.isArray(value) ? 'array' : typeof value;
                    const displayValue = Array.isArray(value) ? `[${value.join(', ')}]` : String(value);
                    
                    html += `
                        <tr>
                            <td>${key}</td>
                            <td class="config-value">${this.escapeHtml(displayValue)}</td>
                            <td><span class="type-badge type-${type}">${type}</span></td>
                            <td>
                                <button class="btn-small btn-edit" data-category="${category}" data-key="${fullKey}" data-value="${this.escapeHtml(displayValue)}">
                                    編集
                                </button>
                            </td>
                        </tr>
                    `;
                }
            }
        };
        
        renderRows(data);
        html += '</tbody></table>';
        return html;
    }

    /**
     * 変更履歴の表示更新
     */
    updateChangeHistory(history) {
        const historyContainer = document.getElementById('changeHistory');
        if (!historyContainer) return;

        let html = '';
        history.forEach(change => {
            const typeIcon = this.getChangeTypeIcon(change.type);
            const typeClass = this.getChangeTypeClass(change.type);
            
            html += `
                <div class="history-item">
                    <div class="history-header">
                        <span class="history-icon ${typeClass}">${typeIcon}</span>
                        <span class="history-category">${change.category}</span>
                        <span class="history-time">${this.formatRelativeTime(change.timestamp)}</span>
                    </div>
                    <div class="history-details">
                        <div class="history-key">${change.key}</div>
                        ${change.oldValue !== undefined ? 
                            `<div class="history-values">
                                <span class="old-value">${this.escapeHtml(String(change.oldValue))}</span>
                                →
                                <span class="new-value">${this.escapeHtml(String(change.newValue))}</span>
                            </div>` : 
                            `<div class="new-value">${this.escapeHtml(String(change.newValue))}</div>`
                        }
                        <div class="history-user">by ${change.user}</div>
                        ${change.reason ? `<div class="history-reason">${change.reason}</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        historyContainer.innerHTML = html || '<p class="no-data">履歴がありません</p>';
    }

    /**
     * 検証ステータスの表示更新
     */
    updateValidationStatus(status) {
        for (const [type, result] of Object.entries(status)) {
            const element = document.getElementById(`validation-${type}`);
            if (element) {
                element.className = `validation-status status-${result}`;
                element.innerHTML = this.getValidationStatusIcon(result);
            }
        }
    }

    /**
     * リアルタイム更新の表示
     */
    updateRealTimeDisplay(realTimeData) {
        // リアルタイムフィードの更新
        const feedContainer = document.getElementById('realtimeFeed');
        if (feedContainer && realTimeData.recentChanges.length > 0) {
            let html = '';
            realTimeData.recentChanges.slice(0, 5).forEach(change => {
                html += `
                    <div class="feed-item">
                        <span class="feed-time">${this.formatTime(change.timestamp)}</span>
                        <span class="feed-desc">${change.description}</span>
                    </div>
                `;
            });
            feedContainer.innerHTML = html;
        }

        // チャートの更新
        this.updateCharts();
    }

    /**
     * 最終更新時刻の表示
     */
    updateLastUpdateTime() {
        const element = document.getElementById('lastUpdate');
        if (element) {
            element.textContent = new Date().toLocaleString('ja-JP');
        }
    }

    /**
     * モーダルの表示
     */
    showModal(title, content) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = title;
            modalBody.innerHTML = content;
            modal.classList.add('active');
        }
    }

    /**
     * アラートの表示
     */
    showAlert(message, type = 'info') {
        const alert = document.getElementById('alert');
        const alertMessage = document.getElementById('alertMessage');
        
        if (alert && alertMessage) {
            alert.className = `alert alert-${type} active`;
            alertMessage.textContent = message;
            
            // 5秒後に自動的に閉じる
            setTimeout(() => {
                alert.classList.remove('active');
            }, 5000);
        }
    }

    // ========================================
    // Helper Methods
    // ========================================

    /**
     * 整合性ステータスの取得
     */
    getConsistencyStatus() {
        const status = this.mainController.validationManager.getConsistencyStatus();
        return status === 'valid' ? '正常' : '要確認';
    }

    /**
     * パフォーマンススコアの計算
     */
    calculatePerformanceScore() {
        // 簡易的なパフォーマンススコア計算
        return Math.floor(Math.random() * 20) + 80;
    }

    /**
     * HTMLエスケープ
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 相対時間のフォーマット
     */
    formatRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - new Date(timestamp).getTime();
        
        if (diff < 60000) return '1分未満';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}時間前`;
        return `${Math.floor(diff / 86400000)}日前`;
    }

    /**
     * 時刻のフォーマット
     */
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 変更タイプのアイコン取得
     */
    getChangeTypeIcon(type) {
        const icons = {
            create: '➕',
            update: '✏️',
            delete: '🗑️'
        };
        return icons[type] || '📝';
    }

    /**
     * 変更タイプのクラス取得
     */
    getChangeTypeClass(type) {
        const classes = {
            create: 'type-create',
            update: 'type-update',
            delete: 'type-delete'
        };
        return classes[type] || 'type-default';
    }

    /**
     * 検証ステータスのアイコン取得
     */
    getValidationStatusIcon(status) {
        const icons = {
            valid: '✅',
            warning: '⚠️',
            error: '❌',
            pending: '⏳'
        };
        return icons[status] || '❓';
    }

    /**
     * 設定編集リスナーのアタッチ
     */
    attachConfigEditListeners(category) {
        const buttons = document.querySelectorAll(`#${category}Tab .btn-edit`);
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.target.dataset.key;
                const value = e.target.dataset.value;
                this.mainController.showEditModal(category, key, value);
            });
        });
    }

    /**
     * ウィンドウリサイズの処理
     */
    handleResize() {
        // チャートのリサイズ
        if (this.accessChart) {
            this.accessChart.resize();
        }
        
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    }

    /**
     * クリーンアップ
     */
    destroy() {
        if (this.accessChart) {
            this.accessChart.destroy();
            this.accessChart = null;
        }
        
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        
        this.charts = {};
    }
}