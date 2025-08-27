import { BaseComponent } from '../BaseComponent.js';

/**
 * DebugVisualization - デバッグデータの視覚化・UI機能コンポーネント
 */
export class DebugVisualization extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'DebugVisualization');
        this.charts = new Map();
        this.themes = new Map();
        this.currentTheme = 'default';
        this.responsiveLayout = null;
        this.breakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        };
        this.orientationData = {
            current: 'landscape',
            supported: ['portrait', 'landscape']
        };
    }

    async _doInitialize() {
        this.setupThemes();
        this.initializeResponsiveLayout();
        this.bindVisualizationEvents();
        this.createDebugStyles();
    }

    /**
     * テーマを設定
     */
    setupThemes() {
        // デフォルトテーマ
        this.themes.set('default', {
            name: 'Default',
            colors: {
                primary: '#007acc',
                secondary: '#1e1e1e',
                success: '#4caf50',
                warning: '#ff9800',
                error: '#f44336',
                background: '#252526',
                surface: '#2d2d30',
                text: '#cccccc',
                textSecondary: '#969696'
            },
            fonts: {
                primary: 'Consolas, Monaco, monospace',
                size: '12px',
                lineHeight: '1.4'
            }
        });

        // ダークテーマ
        this.themes.set('dark', {
            name: 'Dark',
            colors: {
                primary: '#bb86fc',
                secondary: '#121212',
                success: '#03dac6',
                warning: '#ffb74d',
                error: '#cf6679',
                background: '#121212',
                surface: '#1e1e1e',
                text: '#ffffff',
                textSecondary: '#a0a0a0'
            },
            fonts: {
                primary: 'Roboto Mono, monospace',
                size: '12px',
                lineHeight: '1.5'
            }
        });

        // ライトテーマ
        this.themes.set('light', {
            name: 'Light',
            colors: {
                primary: '#1976d2',
                secondary: '#f5f5f5',
                success: '#388e3c',
                warning: '#f57c00',
                error: '#d32f2f',
                background: '#ffffff',
                surface: '#f8f9fa',
                text: '#212121',
                textSecondary: '#666666'
            },
            fonts: {
                primary: 'Source Code Pro, monospace',
                size: '12px',
                lineHeight: '1.4'
            }
        });
    }

    /**
     * レスポンシブレイアウトを初期化
     */
    initializeResponsiveLayout() {
        this.responsiveLayout = {
            currentBreakpoint: this.getCurrentBreakpoint(),
            isTouchDevice: this.isTouchDevice(),
            orientation: this.getOrientation()
        };

        // リサイズイベントリスナー
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // オリエンテーション変更イベント
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleOrientationChange(), 100);
        });
    }

    /**
     * 視覚化イベントをバインド
     */
    bindVisualizationEvents() {
        // テーマ切り替えイベント
        document.addEventListener('themeChange', (event) => {
            this.setTheme(event.detail.theme);
        });

        // パフォーマンス監視イベント
        document.addEventListener('performanceUpdate', (event) => {
            this.updatePerformanceVisualization(event.detail);
        });
    }

    /**
     * デバッグスタイルを作成
     */
    createDebugStyles() {
        if (document.getElementById('debug-visualization-styles')) return;

        const style = document.createElement('style');
        style.id = 'debug-visualization-styles';
        style.textContent = this.generateThemeCSS(this.getCurrentTheme());
        
        document.head.appendChild(style);
        
        // レスポンシブスタイルも追加
        this.addResponsiveStyles();
    }

    /**
     * テーマCSSを生成
     * @param {Object} theme - テーマ設定
     * @returns {string} CSS文字列
     */
    generateThemeCSS(theme) {
        return `
            .debug-interface {
                --primary-color: ${theme.colors.primary};
                --secondary-color: ${theme.colors.secondary};
                --success-color: ${theme.colors.success};
                --warning-color: ${theme.colors.warning};
                --error-color: ${theme.colors.error};
                --background-color: ${theme.colors.background};
                --surface-color: ${theme.colors.surface};
                --text-color: ${theme.colors.text};
                --text-secondary-color: ${theme.colors.textSecondary};
                --font-family: ${theme.fonts.primary};
                --font-size: ${theme.fonts.size};
                --line-height: ${theme.fonts.lineHeight};
            }

            .debug-interface {
                background-color: var(--background-color);
                color: var(--text-color);
                font-family: var(--font-family);
                font-size: var(--font-size);
                line-height: var(--line-height);
                border: 1px solid var(--primary-color);
                border-radius: 4px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }

            .debug-tabs {
                background-color: var(--surface-color);
                border-bottom: 1px solid var(--primary-color);
                display: flex;
                flex-wrap: wrap;
            }

            .debug-tab {
                background-color: var(--surface-color);
                color: var(--text-secondary-color);
                border: none;
                padding: 8px 16px;
                cursor: pointer;
                border-right: 1px solid var(--primary-color);
                transition: all 0.2s ease;
            }

            .debug-tab:hover {
                background-color: var(--primary-color);
                color: var(--text-color);
            }

            .debug-tab.active {
                background-color: var(--primary-color);
                color: var(--text-color);
                font-weight: bold;
            }

            .debug-content {
                background-color: var(--background-color);
                padding: 16px;
                min-height: 200px;
                overflow-y: auto;
            }

            .debug-panel-content {
                display: none;
            }

            .debug-panel-content.active {
                display: block;
            }

            .performance-charts {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-top: 16px;
            }

            .chart {
                background-color: var(--surface-color);
                padding: 12px;
                border-radius: 4px;
                border: 1px solid var(--primary-color);
                text-align: center;
                font-weight: bold;
            }

            .console-output {
                background-color: var(--surface-color);
                padding: 8px;
                border-radius: 4px;
                min-height: 150px;
                overflow-y: auto;
                font-family: var(--font-family);
                white-space: pre-wrap;
                margin-bottom: 8px;
            }

            .console-input {
                width: 100%;
                background-color: var(--surface-color);
                color: var(--text-color);
                border: 1px solid var(--primary-color);
                padding: 8px;
                border-radius: 4px;
                font-family: var(--font-family);
            }

            .debug-status {
                background-color: var(--surface-color);
                padding: 4px 8px;
                border-top: 1px solid var(--primary-color);
                font-size: 10px;
                color: var(--text-secondary-color);
            }

            .panel-statistics {
                display: flex;
                gap: 16px;
                font-size: 10px;
                color: var(--text-secondary-color);
            }
        `;
    }

    /**
     * レスポンシブスタイルを追加
     */
    addResponsiveStyles() {
        const responsiveStyle = document.createElement('style');
        responsiveStyle.id = 'debug-responsive-styles';
        responsiveStyle.textContent = `
            /* Mobile styles */
            @media (max-width: ${this.breakpoints.mobile}px) {
                .debug-interface {
                    width: 100vw !important;
                    height: 50vh !important;
                    bottom: 0 !important;
                    right: 0 !important;
                    top: auto !important;
                    left: 0 !important;
                    border-radius: 8px 8px 0 0;
                }

                .debug-tabs {
                    overflow-x: auto;
                    scrollbar-width: thin;
                }

                .debug-tab {
                    flex-shrink: 0;
                    min-width: 80px;
                    padding: 12px 8px;
                    font-size: 11px;
                }

                .debug-content {
                    padding: 12px;
                    font-size: 11px;
                }

                .performance-charts {
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
            }

            /* Tablet styles */
            @media (min-width: ${this.breakpoints.mobile + 1}px) and (max-width: ${this.breakpoints.tablet}px) {
                .debug-interface {
                    width: 80vw !important;
                    height: 60vh !important;
                }

                .performance-charts {
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            /* Desktop styles */
            @media (min-width: ${this.breakpoints.desktop}px) {
                .debug-interface {
                    width: 60vw;
                    height: 70vh;
                }

                .performance-charts {
                    grid-template-columns: repeat(3, 1fr);
                }
            }

            /* Portrait orientation */
            @media (orientation: portrait) {
                .debug-interface {
                    height: 40vh !important;
                }

                .debug-tabs {
                    flex-direction: column;
                    width: 120px;
                    float: left;
                }

                .debug-content {
                    margin-left: 120px;
                }
            }

            /* Touch device optimizations */
            @media (pointer: coarse) {
                .debug-tab {
                    min-height: 44px;
                    padding: 12px 16px;
                }

                .console-input {
                    min-height: 44px;
                    font-size: 16px; /* Prevent zoom on iOS */
                }
            }
        `;
        
        document.head.appendChild(responsiveStyle);
    }

    /**
     * パフォーマンス視覚化を更新
     * @param {Object} data - パフォーマンスデータ
     */
    updatePerformanceVisualization(data) {
        this.updateFPSChart(data.fps);
        this.updateMemoryChart(data.memory);
        this.updateCPUChart(data.cpu);
        this.updateNetworkChart(data.network);
    }

    /**
     * FPSチャートを更新
     * @param {number} fps - FPS値
     */
    updateFPSChart(fps) {
        const chart = this.charts.get('fps') || this.createChart('fps', 'FPS');
        const color = fps > 50 ? 'var(--success-color)' : fps > 30 ? 'var(--warning-color)' : 'var(--error-color)';
        
        chart.innerHTML = `
            <div style="color: ${color}">
                <div style="font-size: 24px;">${fps.toFixed(1)}</div>
                <div style="font-size: 12px;">FPS</div>
            </div>
        `;
    }

    /**
     * メモリチャートを更新
     * @param {number} memory - メモリ使用量（MB）
     */
    updateMemoryChart(memory) {
        const chart = this.charts.get('memory') || this.createChart('memory', 'Memory');
        const percentage = Math.min((memory / 1000) * 100, 100);
        const color = percentage > 80 ? 'var(--error-color)' : percentage > 60 ? 'var(--warning-color)' : 'var(--success-color)';
        
        chart.innerHTML = `
            <div style="color: ${color}">
                <div style="font-size: 18px;">${memory.toFixed(1)}MB</div>
                <div style="font-size: 12px;">Memory Usage</div>
                <div style="width: 100%; height: 4px; background: var(--surface-color); margin: 4px 0;">
                    <div style="width: ${percentage}%; height: 100%; background: ${color};"></div>
                </div>
            </div>
        `;
    }

    /**
     * CPUチャートを更新
     * @param {number} cpu - CPU使用率（%）
     */
    updateCPUChart(cpu) {
        const chart = this.charts.get('cpu') || this.createChart('cpu', 'CPU');
        const color = cpu > 80 ? 'var(--error-color)' : cpu > 60 ? 'var(--warning-color)' : 'var(--success-color)';
        
        chart.innerHTML = `
            <div style="color: ${color}">
                <div style="font-size: 18px;">${cpu.toFixed(1)}%</div>
                <div style="font-size: 12px;">CPU Usage</div>
                <div style="width: 100%; height: 4px; background: var(--surface-color); margin: 4px 0;">
                    <div style="width: ${cpu}%; height: 100%; background: ${color};"></div>
                </div>
            </div>
        `;
    }

    /**
     * ネットワークチャートを更新
     * @param {Object} network - ネットワークデータ
     */
    updateNetworkChart(network) {
        const chart = this.charts.get('network') || this.createChart('network', 'Network');
        
        chart.innerHTML = `
            <div>
                <div style="font-size: 14px;">↓ ${(network.download / 1024).toFixed(1)}KB/s</div>
                <div style="font-size: 14px;">↑ ${(network.upload / 1024).toFixed(1)}KB/s</div>
                <div style="font-size: 12px;">Network</div>
            </div>
        `;
    }

    /**
     * チャートを作成
     * @param {string} id - チャートID
     * @param {string} title - チャートタイトル
     * @returns {HTMLElement} チャート要素
     */
    createChart(id, title) {
        const chartsContainer = this.mainController.container?.querySelector('.performance-charts');
        if (!chartsContainer) return null;

        const chart = document.createElement('div');
        chart.className = 'chart';
        chart.id = `chart-${id}`;
        chart.setAttribute('aria-label', `${title} chart`);
        
        chartsContainer.appendChild(chart);
        this.charts.set(id, chart);
        
        return chart;
    }

    /**
     * リサイズを処理
     */
    handleResize() {
        const newBreakpoint = this.getCurrentBreakpoint();
        if (newBreakpoint !== this.responsiveLayout.currentBreakpoint) {
            this.responsiveLayout.currentBreakpoint = newBreakpoint;
            this.applyResponsiveLayout();
        }
    }

    /**
     * オリエンテーション変更を処理
     */
    handleOrientationChange() {
        const newOrientation = this.getOrientation();
        if (newOrientation !== this.responsiveLayout.orientation) {
            this.responsiveLayout.orientation = newOrientation;
            this.applyResponsiveLayout();
        }
    }

    /**
     * レスポンシブレイアウトを適用
     */
    applyResponsiveLayout() {
        const container = this.mainController.container;
        if (!container) return;

        // ブレークポイントクラスを更新
        container.classList.remove('mobile', 'tablet', 'desktop');
        container.classList.add(this.responsiveLayout.currentBreakpoint);

        // オリエンテーションクラスを更新
        container.classList.remove('portrait', 'landscape');
        container.classList.add(this.responsiveLayout.orientation);

        // タッチデバイスクラス
        if (this.responsiveLayout.isTouchDevice) {
            container.classList.add('touch-device');
        }
    }

    // === 公開API ===

    /**
     * 現在のブレークポイントを取得
     * @returns {string} ブレークポイント名
     */
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width <= this.breakpoints.mobile) return 'mobile';
        if (width <= this.breakpoints.tablet) return 'tablet';
        return 'desktop';
    }

    /**
     * タッチデバイスかチェック
     * @returns {boolean} タッチデバイスフラグ
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * 画面の向きを取得
     * @returns {string} 向き
     */
    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    /**
     * レスポンシブレイアウト情報を取得
     * @returns {Object} レイアウト情報
     */
    getResponsiveLayout() {
        return { ...this.responsiveLayout };
    }

    /**
     * テーマを設定
     * @param {string} themeName - テーマ名
     */
    setTheme(themeName) {
        if (!this.themes.has(themeName)) {
            console.warn(`Theme not found: ${themeName}`);
            return;
        }

        this.currentTheme = themeName;
        const styleElement = document.getElementById('debug-visualization-styles');
        if (styleElement) {
            styleElement.textContent = this.generateThemeCSS(this.getCurrentTheme());
        }
    }

    /**
     * 現在のテーマを取得
     * @returns {Object} テーマ設定
     */
    getCurrentTheme() {
        return this.themes.get(this.currentTheme);
    }

    /**
     * 利用可能なテーマ一覧を取得
     * @returns {Array} テーマ名配列
     */
    getAvailableThemes() {
        return Array.from(this.themes.keys());
    }

    /**
     * カスタムチャートを追加
     * @param {string} id - チャートID
     * @param {string} title - チャートタイトル
     * @param {Function} renderer - レンダラー関数
     */
    addCustomChart(id, title, renderer) {
        const chart = this.createChart(id, title);
        if (chart && renderer) {
            chart.renderer = renderer;
        }
    }

    /**
     * チャートを削除
     * @param {string} id - チャートID
     */
    removeChart(id) {
        const chart = this.charts.get(id);
        if (chart) {
            chart.remove();
            this.charts.delete(id);
        }
    }

    /**
     * 全チャートをクリア
     */
    clearAllCharts() {
        for (const chart of this.charts.values()) {
            chart.remove();
        }
        this.charts.clear();
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        // スタイル要素を削除
        document.getElementById('debug-visualization-styles')?.remove();
        document.getElementById('debug-responsive-styles')?.remove();

        // チャートをクリア
        this.clearAllCharts();

        // イベントリスナーを削除
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleOrientationChange);

        super.cleanup();
    }
}