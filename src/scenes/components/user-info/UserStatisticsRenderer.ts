/**
 * UserStatisticsRenderer.ts
 * ユーザー統計描画コンポーネント
 * UserInfoSceneから分離された統計表示機能を提供
 */

import { CoreChartRenderer  } from '../../../core/ChartRenderer';
import { StatisticsDashboard  } from '../../../core/StatisticsDashboard';
import { StatisticsFilterManager  } from '../../../core/StatisticsFilterManager';
import { StatisticsExporter  } from '../../../core/StatisticsExporter';
import { GameEngine  } from '../../../types/gameEngine';
import { EventBus  } from '../../../types/eventBus';

// 統計データ関連の型定義
interface StatisticsData { totalPlayTime?: number,
    gamesPlayed?: number;
    highestScore?: number;
    averageScore?: number;
    winRate?: number;
    longestStreak?: number;
    highestCombo?: number;
    bubblesPopped?: number;
    itemsUsed?: number;
    apEarned?: number;
    scoreHistory?: Array<{ date: string,, score: number;>;
    playtimeByDay?: Array<{ day: string,, time: number;>;
    [key: string]: any;

interface StatisticsDisplaySettings { showDashboard: boolean,
    showCharts: boolean;
    showDetailedStats: boolean;
    enableAnimations: boolean;
    compactMode: boolean;
';'

interface ResponsiveLayout { ''
    layout: 'mobile' | 'tablet' | 'desktop';
    columnCount: number;
    compactMode: boolean;
    showCharts: boolean;

interface StatItem { label: string,
    value: string;

// シーン状態のインターフェース
interface SceneState { get(key: string): any,
    set(key: string, value: any): void;

// タブコンポーネントのインターフェース
interface StatisticsTabComponent { isActive: boolean,
    render(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void;

// 統計マネージャーのインターフェース
interface StatisticsManager { ''
    getDetailedStatistics('';
type, StatisticsViewMode = 'dashboard' | 'charts' | 'details';
type, PeriodFilter = 'all' | 'last7days' | 'last30days' | 'thisMonth' | 'thisYear';
type, ExportFormat = 'json' | 'csv' | 'pdf'

export, class UserStatisticsRenderer {
    private, gameEngine: ExtendedGameEngine;
    private, eventBus: EventBus | null;
    private, sceneState: SceneState;
    // 統計データ
    private, statisticsData: StatisticsData | null = null;
    // 統計システムコンポーネント
    private, chartRenderer: CoreChartRenderer | null = null;
    private, statisticsDashboard: StatisticsDashboard | null = null;
    private, statisticsFilterManager: StatisticsFilterManager | null = null;
    private, statisticsExporter: StatisticsExporter | null = null;
    // 表示設定
    private, statisticsViewMode: StatisticsViewMode = 'dashboard'';'
    private, currentPeriodFilter: PeriodFilter = 'last7days';
    private, statisticsDisplaySettings: StatisticsDisplaySettings = {
        showDashboar,d: true,
        showCharts: true,
        showDetailedStats: true,
        enableAnimations: true,
    compactMode: false,
    );
    private readonly contentPadding: number = 20),
    constructor(gameEngine: ExtendedGameEngine, eventBus: EventBus | null, sceneState: SceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        this.initialize() }
        this.setupEventListeners(); }
    }
    
    /**
     * 統計システムの初期化
     */
    private initialize(): void { this.initializeExtendedStatistics(),
        this.loadStatisticsData() }
    
    /**
     * イベントリスナーをセットアップ
     */'
    private setupEventListeners(): void { ''
        if(!this.eventBus) return,

        this.eventBus.on('statisticsDataReload', () => {  }

            this.loadStatisticsData();' }'

        }');'

        this.eventBus.on('statisticsViewModeChanged', (mode: StatisticsViewMode) => { this.statisticsViewMode = mode,' 
    }');'

        this.eventBus.on('statisticsPeriodChanged', (period: PeriodFilter) => {  this.currentPeriodFilter = period }
            this.loadStatisticsData(); }
        });
    }
    
    /**
     * 拡張統計システムの初期化
     */
    private initializeExtendedStatistics(): void { try {
            // ChartRendererの初期化
            this.chartRenderer = new CoreChartRenderer();
            
            // StatisticsFilterManagerの初期化
            if (this.gameEngine.statisticsManager) {
                this.statisticsFilterManager = new StatisticsFilterManager(this.gameEngine.statisticsManager);
                
                // StatisticsDashboardの初期化（widgetRendererは自動で作成される）
                this.statisticsDashboard = new StatisticsDashboard(
                    this.gameEngine.statisticsManager);
                    this.chartRenderer,
                    // 第3引数のwidgetRendererは省略し、DashboardWidgetRendererが自動で作成される
                ),
                ','

                // StatisticsExporterの初期化
            }

                this.statisticsExporter = new StatisticsExporter(this.gameEngine.statisticsManager); }
            }

            console.log('Extended statistics system initialized');

        } catch (error') {'
            console.error('Failed to initialize extended statistics:', error),
            
            // フォールバック: 基本的な初期化のみ
            this.chartRenderer = new CoreChartRenderer() }
    }
    
    /**
     * 統計データの読み込み
     */
    private loadStatisticsData(): void { try {
            if (this.gameEngine.statisticsManager) {

                this.statisticsData = this.gameEngine.statisticsManager.getDetailedStatistics()';'
                if(this.statisticsFilterManager && this.currentPeriodFilter !== 'all' {'
                    this.statisticsData = this.statisticsFilterManager.filterByPeriod(
                        this.statisticsData ) }
                        this.currentPeriodFilter); }
                }
                ';'
                // イベントバスに通知
                if (this.eventBus) {', ' }

                    this.eventBus.emit('statisticsDataLoaded', this.statisticsData'; }'

                }'} catch (error) { console.error('UserStatisticsRenderer: loadStatisticsData, error:', error }'
    }
    
    /**
     * 統計コンポーネントでの描画
     */
    public renderStatisticsWithComponent(;
        context: CanvasRenderingContext2D;
        y: number ,
    height: number);
        statisticsTabComponent?: StatisticsTabComponent;
    ): void { try {
            if (statisticsTabComponent && statisticsTabComponent.isActive) {
                const canvas = this.gameEngine.canvas }
                statisticsTabComponent.render(context, 0, y, canvas.width, height); }
            } else {  // フォールバック: 統計タブコンポーネントが無効な場合 }
                this.renderStatisticsFallback(context, y, height);' }'

            } catch (error) {
            console.error('Statistics tab rendering failed:', error),
            this.renderStatisticsFallback(context, y, height) }
    }
    
    /**
     * 統計データのフォールバック描画'
     */''
    private renderStatisticsFallback(context: CanvasRenderingContext2D, y: number, height: number): void { const canvas = this.gameEngine.canvas,
        context.fillStyle = '#cccccc',
        context.font = '20px Arial',
        context.textAlign = 'center',
        context.textBaseline = 'middle',
        context.fillText('統計データを読み込み中...', canvas.width / 2, y + height / 2' }'
    
    /**
     * 統計ダッシュボードの描画
     */'
    public async renderStatisticsDashboard(context: CanvasRenderingContext2D, y: number, height: number): Promise<void> { ''
        if (!this.statisticsDashboard) {

            this.renderNoDataMessage(context, y, height, 'ダッシュボードを初期化できませんでした') }
            return; }
        }
        
        try { // ダッシュボード用のサブキャンバス作成
            const canvas = this.gameEngine.canvas,
            const dashboardCanvas = document.createElement('canvas',
            dashboardCanvas.width = canvas.width - (this.contentPadding * 2'),'

            dashboardCanvas.height = height,
            const dashboardCtx = dashboardCanvas.getContext('2d),'

            if (!dashboardCtx) {', ' }

                throw new Error('Could, not get, dashboard canvas, context'; }'
            }
            
            // ダッシュボードを描画
            await this.statisticsDashboard.render(dashboardCtx, 0, 0, dashboardCanvas.width, dashboardCanvas.height);
            
            // メインキャンバスに転送
            context.drawImage(dashboardCanvas, this.contentPadding, y);

        } catch (error) {
            console.error('Dashboard render error:', error','
            this.renderNoDataMessage(context, y, height, 'ダッシュボードの描画に失敗しました' }'
    }
    
    /**
     * 統計グラフの描画
     */'
    public async renderStatisticsCharts(context: CanvasRenderingContext2D, y: number, height: number): Promise<void> { ''
        if (!this.chartRenderer || !this.statisticsData) {

            this.renderNoDataMessage(context, y, height, 'グラフデータがありません' }
            return; }
        }
        ';'

        try { const canvas = this.gameEngine.canvas,
            const chartWidth = (canvas.width - (this.contentPadding * 3)') / 2,'
            const chartHeight = height / 2 - 10,
            
            // スコア推移グラフ
            await this.chartRenderer.renderLineChart(
                context,
                this.contentPadding,
                y,
                chartWidth,
                chartHeight,
                this.statisticsData.scoreHistory || [],
                'スコア推移',')',
                '#4A90E2')','

            '),'
            
            // プレイ時間グラフ
            await this.chartRenderer.renderBarChart(
                context,
                this.contentPadding + chartWidth + 10,
                y,
                chartWidth,
                chartHeight)','
                this.statisticsData.playtimeByDay || [],
                'プレイ時間','),'

                '#50C878'),

            ' }'

        } catch (error) {
            console.error('Charts render error:', error','
            this.renderNoDataMessage(context, y, height, 'グラフの描画に失敗しました' }'
    }
    
    /**
     * 詳細統計の描画
     */
    public renderDetailedStatistics(context: CanvasRenderingContext2D, y: number, height: number): void { const canvas = this.gameEngine.canvas,
        const contentWidth = canvas.width - this.contentPadding * 2,
        const sectionHeight = 180,
        
        // レスポンシブレイアウト判定
        const isCompact = canvas.width < 800,
        const columnWidth = isCompact ? contentWidth: contentWidth / 2 - 10,

        if (!this.statisticsData) {

            this.renderNoDataMessage(context, y, height, '統計データがありません) }'
            return; }
        }
        
        let currentY = y + 20;
        
        // 基本統計
        this.renderBasicStatistics(context, this.contentPadding, currentY, columnWidth, this.statisticsData);
        
        if (!isCompact) {
        
            // 詳細統計（コンパクトモードでない場合）
        
        }
            this.renderAdvancedStatistics(context, this.contentPadding + columnWidth + 20, currentY, columnWidth, this.statisticsData); }
        } else {  currentY += sectionHeight + 20 }
            this.renderAdvancedStatistics(context, this.contentPadding, currentY, columnWidth, this.statisticsData); }
}
    
    /**
     * 基本統計の描画
     */
    private renderBasicStatistics(;
        context: CanvasRenderingContext2D,
    x: number, ;
        y: number );
        width: number,
    data: StatisticsData';'
    '): void { // セクション背景'
        context.fillStyle = '#1a1a2e',
        context.fillRect(x, y, width, 160),
        ','
        // セクション枠線
        context.strokeStyle = '#4a4a6a',

        context.lineWidth = 1,
        context.strokeRect(x, y, width, 160),
        ','
        // セクション見出し
        context.fillStyle = '#ffffff',
        context.font = 'bold 16px Arial',
        context.textAlign = 'left',
        context.fillText('基本統計', x + 15, y + 25','
        ','
        // 統計項目
        context.font = '14px Arial',

        const stats: StatItem[] = ['
            }'

            { label: '総プレイ時間', value: this.formatPlayTime(data.totalPlayTime || 0  },''
            { label: 'ゲーム回数', value: (data.gamesPlayed || 0).toLocaleString()'
            { label: '最高スコア', value: (data.highestScore || 0).toLocaleString()'
            { label: '平均スコア', value: (data.averageScore || 0).toLocaleString('}]'
            { label: '勝率', value: `${data.winRate || 0 }%` }]
        ];)
        ';'
        stats.forEach((stat, index) => {  ''
            const itemY = y + 50 + (index * 20'),'
            context.fillStyle = '#cccccc',
            context.fillText(stat.label + ':', x + 15, itemY','
            context.fillStyle = '#88ccff' }
            context.fillText(stat.value, x + 130, itemY); }
        });
    }
    
    /**
     * 詳細統計の描画
     */
    private renderAdvancedStatistics(;
        context: CanvasRenderingContext2D,
    x: number, ;
        y: number );
        width: number)','
    data: StatisticsData';'
    '): void { // セクション背景'
        context.fillStyle = '#1a1a2e',
        context.fillRect(x, y, width, 160),
        ','
        // セクション枠線
        context.strokeStyle = '#4a4a6a',

        context.lineWidth = 1,
        context.strokeRect(x, y, width, 160),
        ','
        // セクション見出し
        context.fillStyle = '#ffffff',
        context.font = 'bold 16px Arial',
        context.textAlign = 'left',
        context.fillText('詳細統計', x + 15, y + 25','
        ','
        // 詳細統計項目
        context.font = '14px Arial',

        const advancedStats: StatItem[] = ['
            }'

            { label: '連続記録', value: `${data.longestStreak || 0 }回` },''
            { label: 'コンボ記録', value: `${data.highestCombo || 0 }コンボ` },''
            { label: '泡破壊数', value: (data.bubblesPopped || 0).toLocaleString()'
            { label: 'アイテム使用', value: (data.itemsUsed || 0).toLocaleString(  }]'
            { label: 'AP獲得数', value: (data.apEarned || 0).toLocaleString(  }]
        ];
        ';'

        advancedStats.forEach((stat, index) => {  ''
            const itemY = y + 50 + (index * 20'),'
            context.fillStyle = '#cccccc',
            context.fillText(stat.label + ':', x + 15, itemY','
            context.fillStyle = '#88ccff' }
            context.fillText(stat.value, x + 130, itemY); }
        });
    }
    
    /**
     * データなしメッセージの描画'
     */''
    private renderNoDataMessage(context: CanvasRenderingContext2D, y: number, height: number, message: string): void { ''
        context.fillStyle = '#9CA3AF',
        context.font = '16px system-ui, -apple-system, sans-serif',
        context.textAlign = 'center',
        context.fillText(message, this.gameEngine.canvas.width / 2, y + height / 2) }
    
    /**
     * プレイ時間のフォーマット
     */
    private formatPlayTime(seconds: number): string { const hours = Math.floor(seconds / 3600),
        const minutes = Math.floor((seconds % 3600) / 60),
        const secs = seconds % 60,
        
        if (hours > 0) { }

            return `${hours}時間${minutes}分`;} else if (minutes > 0) {
            return `${minutes}分${secs}秒`;
        } else {  }
            return `${secs}秒`;
    
    /**
     * 統計データのエクスポート'
     */''
    public async exportStatistics(format: ExportFormat = 'json): Promise<any> {,'
        if (!this.statisticsExporter) {', ' }

            throw new Error('Statistics, exporter not, initialized'; }'
        }
        ';'

        try { return await this.statisticsExporter.export(format, this.statisticsData),' }'

        } catch (error) {
            console.error('UserStatisticsRenderer: exportStatistics, error:', error','
            throw error }
    }
    
    /**
     * レスポンシブレイアウト設定を取得
     */'
    public getResponsiveLayout(screenWidth: number): ResponsiveLayout { ''
        if (screenWidth < 600) {
            return { ''
                layout: 'mobile',
    columnCount: 1 }
                compactMode: true;;
                showCharts: false,;'} else if (screenWidth < 1024) { return { ''
                layout: 'tablet',
                columnCount: 1,
    compactMode: false,;
                showCharts: true, else {  return { ''
                layout: 'desktop',
    columnCount: 2 }
                compactMode: false;;
                showCharts: true;
    }
    
    /**
     * コンポーネントのクリーンアップ
     */'
    public cleanup(): void { ''
        if (this.eventBus) {

            this.eventBus.off('statisticsDataReload'),
            this.eventBus.off('statisticsViewModeChanged') }

            this.eventBus.off('statisticsPeriodChanged'); }
        }
        
        // リソースのクリーンアップ
        this.statisticsData = null;
        this.chartRenderer = null;
        this.statisticsDashboard = null;
        this.statisticsFilterManager = null;
        this.statisticsExporter = null;
    }'}'