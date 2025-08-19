/**
 * 統計レンダラーコンポーネント
 * 詳細統計の表示機能を提供
 */

interface GameEngine {
    errorHandler?: {
        handleError(error: Error, context: any): void;
    };
    debugMode?: boolean;
}

interface EventBus {
    on(event: string, callback: Function): void;
    off(event: string): void;
    emit(event: string, data?: any): void;
}

interface AccessibilitySettings {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
}

interface ComponentState {
    accessibilitySettings: AccessibilitySettings;
}

interface ColorScheme {
    background: string;
    border: string;
    title: string;
    label: string;
    value: string;
    accent: string;
}

interface FontScheme {
    title: string;
    subtitle: string;
    normal: string;
    small: string;
}

interface StatisticsData {
    basic?: {
        totalGamesPlayed?: number;
        totalPlayTime?: string;
        totalScore?: number;
        highestScore?: number;
        averageScore?: number;
        completionRate?: number;
    };
    bubbles?: {
        totalPopped?: number;
        totalMissed?: number;
        accuracy?: string;
        averageReactionTime?: string;
        favoriteType?: {
            type: string;
        };
        typeBreakdown?: Record<string, { count: number }>;
    };
    combos?: {
        maxCombo?: number;
        averageCombo?: number;
        totalCombos?: number;
        comboRate?: number;
        perfectRounds?: number;
    };
    stages?: {
        unlockedStages?: number;
        favoriteStage?: string;
        bestClearRate?: number;
        averageClearTime?: string;
        totalClears?: number;
    };
}

interface StatItem {
    label: string;
    value: string;
}

interface ResponsiveLayout {
    columns: number;
    fontSize: string;
}

export class StatisticsRenderer {
    private gameEngine: GameEngine;
    private eventBus: EventBus;
    private state: ComponentState;
    
    // エラーハンドリング
    private errorHandler?: GameEngine['errorHandler'];
    
    // アクセシビリティ設定
    private accessibilitySettings: AccessibilitySettings;
    
    // レイアウト設定
    private contentPadding: number = 20;
    private sectionHeight: number = 180;
    private lineHeight: number = 20;
    private scrollPosition: number = 0;
    
    // 統計データ
    private statisticsData: StatisticsData | null = null;
    
    // スタイル設定
    private colors: ColorScheme;
    private fonts: FontScheme;

    constructor(gameEngine: GameEngine, eventBus: EventBus, state: ComponentState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
        
        // エラーハンドリング
        this.errorHandler = gameEngine.errorHandler;
        
        // アクセシビリティ設定
        this.accessibilitySettings = state.accessibilitySettings || {
            highContrast: false,
            largeText: false,
            reducedMotion: false
        };
        
        // スタイル設定
        this.colors = this.getColorScheme();
        this.fonts = this.getFontScheme();
        
        this.setupEventListeners();
    }
    
    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void {
        // 統計データ更新イベント
        this.eventBus.on('statistics-data-updated', (data: StatisticsData) => {
            this.statisticsData = data;
        });
        
        // スクロール位置更新イベント
        this.eventBus.on('statistics-scroll-update', (position: number) => {
            this.scrollPosition = position;
        });
    }
    
    /**
     * カラースキームの取得
     * @returns カラー設定
     */
    private getColorScheme(): ColorScheme {
        if (this.accessibilitySettings.highContrast) {
            return {
                background: '#000000',
                border: '#FFFFFF',
                title: '#FFFFFF',
                label: '#CCCCCC',
                value: '#FFFFFF',
                accent: '#FFFF00'
            };
        } else {
            return {
                background: '#1a1a2e',
                border: '#333333',
                title: '#4a90e2',
                label: '#cccccc',
                value: '#ffffff',
                accent: '#4a90e2'
            };
        }
    }
    
    /**
     * フォントスキームの取得
     * @returns フォント設定
     */
    private getFontScheme(): FontScheme {
        const baseSize = this.accessibilitySettings.largeText ? 2 : 0;
        return {
            title: `bold ${18 + baseSize}px Arial`,
            subtitle: `bold ${14 + baseSize}px Arial`,
            normal: `${14 + baseSize}px Arial`,
            small: `${12 + baseSize}px Arial`
        };
    }
    
    /**
     * 統計の詳細表示レンダリング
     * @param context - Canvas描画コンテキスト
     * @param x - 描画X座標
     * @param y - 描画Y座標
     * @param width - 描画幅
     * @param height - 描画高さ
     */
    render(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        try {
            this.renderDetailedStatistics(context, x, y, width, height);
        } catch (error) {
            this.errorHandler?.handleError(error as Error, {
                context: 'StatisticsRenderer.render',
                details: '統計レンダリングでエラーが発生しました'
            });
            this.renderErrorFallback(context, x, y, width, height, error as Error);
        }
    }
    
    /**
     * 詳細統計の描画
     * @param context - Canvas描画コンテキスト
     * @param x - 描画X座標
     * @param y - 描画Y座標
     * @param width - 描画幅
     * @param height - 描画高さ
     */
    private renderDetailedStatistics(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        if (!this.statisticsData) {
            this.renderNoDataMessage(context, x, y, width, height);
            return;
        }
        
        const sectionHeight = this.accessibilitySettings.largeText ? 200 : this.sectionHeight;
        
        // レスポンシブレイアウト判定
        const layout = this.getResponsiveLayout(width);
        
        // スクロール対応
        let currentY = y - this.scrollPosition;
        
        if (layout.columns === 1) {
            // 小画面: 1列レイアウト
            currentY = this.renderBasicStatsSection(context, x, currentY, width, sectionHeight);
            currentY = this.renderBubbleStatsSection(context, x, currentY + 20, width, sectionHeight);
            currentY = this.renderComboStatsSection(context, x, currentY + 20, width, sectionHeight);
            currentY = this.renderStageStatsSection(context, x, currentY + 20, width, sectionHeight);
        } else {
            // 中画面・大画面: 2列レイアウト
            const columnWidth = width / 2;
            currentY = this.renderBasicStatsSection(context, x, currentY, columnWidth, sectionHeight);
            currentY = this.renderBubbleStatsSection(context, x + columnWidth, currentY - sectionHeight - 20, columnWidth, sectionHeight);
            currentY = this.renderComboStatsSection(context, x, currentY, columnWidth, sectionHeight);
            currentY = this.renderStageStatsSection(context, x + columnWidth, currentY - sectionHeight - 20, columnWidth, sectionHeight);
        }
    }
    
    /**
     * 基本統計セクションの描画
     * @param context - Canvas描画コンテキスト
     * @param x - 描画X座標
     * @param y - 描画Y座標
     * @param width - 描画幅
     * @param height - 描画高さ
     * @returns 次のY座標
     */
    private renderBasicStatsSection(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): number {
        if (!this.statisticsData || !this.statisticsData.basic) {
            return y + height + 20;
        }
        
        const basic = this.statisticsData.basic;
        
        // セクション背景
        context.fillStyle = this.colors.background;
        context.fillRect(x, y, width - 10, height);
        
        // セクション枠線
        context.strokeStyle = this.colors.border;
        context.lineWidth = this.accessibilitySettings.highContrast ? 2 : 1;
        context.strokeRect(x, y, width - 10, height);
        
        // セクションタイトル
        context.fillStyle = this.colors.title;
        context.font = this.fonts.title;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText('基本統計', x + 15, y + 25);
        
        // 統計項目を描画
        const items: StatItem[] = [
            { label: '総プレイ回数', value: `${basic.totalGamesPlayed || 0}回` },
            { label: '総プレイ時間', value: basic.totalPlayTime || '0分' },
            { label: '総スコア', value: (basic.totalScore || 0).toLocaleString() },
            { label: '最高スコア', value: (basic.highestScore || 0).toLocaleString() },
            { label: '平均スコア', value: (basic.averageScore || 0).toLocaleString() },
            { label: '完了率', value: `${isNaN(basic.completionRate || 0) ? 0 : (basic.completionRate || 0).toFixed(1)}%` }
        ];
        
        this.renderStatsList(context, items, x + 15, y + 50, width - 40, this.lineHeight);
        
        return y + height + 20;
    }
    
    /**
     * 泡統計セクションの描画
     * @param context - Canvas描画コンテキスト
     * @param x - 描画X座標
     * @param y - 描画Y座標
     * @param width - 描画幅
     * @param height - 描画高さ
     * @returns 次のY座標
     */
    private renderBubbleStatsSection(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): number {
        if (!this.statisticsData || !this.statisticsData.bubbles) {
            return y + height + 20;
        }
        
        const bubbles = this.statisticsData.bubbles;
        
        // セクション背景
        context.fillStyle = this.colors.background;
        context.fillRect(x, y, width - 10, height);
        
        // セクション枠線
        context.strokeStyle = this.colors.border;
        context.lineWidth = this.accessibilitySettings.highContrast ? 2 : 1;
        context.strokeRect(x, y, width - 10, height);
        
        // セクションタイトル
        context.fillStyle = this.colors.title;
        context.font = this.fonts.title;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText('泡統計', x + 15, y + 25);
        
        // 基本泡統計
        const items: StatItem[] = [
            { label: '総破壊数', value: (bubbles.totalPopped || 0).toLocaleString() },
            { label: '総未破壊数', value: (bubbles.totalMissed || 0).toLocaleString() },
            { label: '精度', value: bubbles.accuracy || '0%' },
            { label: '平均反応時間', value: bubbles.averageReactionTime || '0ms' },
            { label: 'お気に入り泡', value: this.getBubbleTypeName(bubbles.favoriteType?.type) || 'なし' }
        ];
        
        let itemY = y + 50;
        const lineHeight = this.accessibilitySettings.largeText ? 22 : 18;
        
        for (let i = 0; i < Math.min(5, items.length); i++) {
            const item = items[i];
            
            // ラベル
            context.fillStyle = this.colors.label;
            context.font = this.fonts.normal;
            context.textAlign = 'left';
            context.textBaseline = 'middle';
            context.fillText(item.label, x + 15, itemY);
            
            // 値
            context.fillStyle = this.colors.value;
            context.textAlign = 'right';
            context.fillText(item.value, x + width - 25, itemY);
            
            itemY += lineHeight;
        }
        
        // 泡タイプ別詳細（上位3つ）
        if (bubbles.typeBreakdown && Object.keys(bubbles.typeBreakdown).length > 0) {
            this.renderBubbleTypeBreakdown(context, bubbles.typeBreakdown, x + 15, itemY + 10, width - 40);
        }
        
        return y + height + 20;
    }
    
    /**
     * コンボ統計セクションの描画
     * @param context - Canvas描画コンテキスト
     * @param x - 描画X座標
     * @param y - 描画Y座標
     * @param width - 描画幅
     * @param height - 描画高さ
     * @returns 次のY座標
     */
    private renderComboStatsSection(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): number {
        if (!this.statisticsData || !this.statisticsData.combos) {
            return y + height + 20;
        }
        
        const combos = this.statisticsData.combos;
        
        // セクション背景
        context.fillStyle = this.colors.background;
        context.fillRect(x, y, width - 10, height);
        
        // セクション枠線
        context.strokeStyle = this.colors.border;
        context.lineWidth = this.accessibilitySettings.highContrast ? 2 : 1;
        context.strokeRect(x, y, width - 10, height);
        
        // セクションタイトル
        context.fillStyle = this.colors.title;
        context.font = this.fonts.title;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText('コンボ統計', x + 15, y + 25);
        
        // コンボ統計項目
        const items: StatItem[] = [
            { label: '最高コンボ', value: `${combos.maxCombo || 0}連続` },
            { label: '平均コンボ', value: `${combos.averageCombo || 0}連続` },
            { label: '総コンボ回数', value: `${combos.totalCombos || 0}回` },
            { label: 'コンボ率', value: `${combos.comboRate || 0}%` },
            { label: 'パーフェクト回数', value: `${combos.perfectRounds || 0}回` }
        ];
        
        this.renderStatsList(context, items, x + 15, y + 50, width - 40, this.lineHeight);
        
        return y + height + 20;
    }
    
    /**
     * ステージ統計セクションの描画
     * @param context - Canvas描画コンテキスト
     * @param x - 描画X座標
     * @param y - 描画Y座標
     * @param width - 描画幅
     * @param height - 描画高さ
     * @returns 次のY座標
     */
    private renderStageStatsSection(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): number {
        if (!this.statisticsData || !this.statisticsData.stages) {
            return y + height + 20;
        }
        
        const stages = this.statisticsData.stages;
        
        // セクション背景
        context.fillStyle = this.colors.background;
        context.fillRect(x, y, width - 10, height);
        
        // セクション枠線
        context.strokeStyle = this.colors.border;
        context.lineWidth = this.accessibilitySettings.highContrast ? 2 : 1;
        context.strokeRect(x, y, width - 10, height);
        
        // セクションタイトル
        context.fillStyle = this.colors.title;
        context.font = this.fonts.title;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText('ステージ統計', x + 15, y + 25);
        
        // ステージ統計項目
        const items: StatItem[] = [
            { label: '解放ステージ数', value: `${stages.unlockedStages || 0}個` },
            { label: 'お気に入りステージ', value: stages.favoriteStage || 'なし' },
            { label: '最高クリア率', value: `${stages.bestClearRate || 0}%` },
            { label: '平均クリア時間', value: stages.averageClearTime || '0分' },
            { label: '総クリア回数', value: `${stages.totalClears || 0}回` }
        ];
        
        this.renderStatsList(context, items, x + 15, y + 50, width - 40, this.lineHeight);
        
        return y + height + 20;
    }
    
    /**
     * 統計リストの描画
     * @param context - Canvas描画コンテキスト
     * @param items - 統計項目配列
     * @param x - 描画X座標
     * @param y - 描画Y座標
     * @param width - 描画幅
     * @param lineHeight - 行の高さ
     */
    private renderStatsList(context: CanvasRenderingContext2D, items: StatItem[], x: number, y: number, width: number, lineHeight: number): void {
        const adjustedLineHeight = this.accessibilitySettings.largeText ? lineHeight + 2 : lineHeight;
        
        context.font = this.fonts.normal;
        let itemY = y;
        
        for (const item of items) {
            // ラベル
            context.fillStyle = this.colors.label;
            context.textAlign = 'left';
            context.textBaseline = 'middle';
            context.fillText(item.label, x, itemY);
            
            // 値
            context.fillStyle = this.colors.value;
            context.textAlign = 'right';
            context.fillText(item.value, x + width, itemY);
            
            itemY += adjustedLineHeight;
        }
    }
    
    /**
     * 泡タイプ別詳細の描画
     * @param context - Canvas描画コンテキスト
     * @param typeBreakdown - 泡タイプ別データ
     * @param x - 描画X座標
     * @param y - 描画Y座標
     * @param width - 描画幅
     */
    private renderBubbleTypeBreakdown(context: CanvasRenderingContext2D, typeBreakdown: Record<string, { count: number }>, x: number, y: number, width: number): void {
        // 小見出し
        context.fillStyle = this.colors.accent;
        context.font = this.fonts.subtitle;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText('上位泡タイプ', x, y);
        
        // 泡タイプをソート
        const sortedTypes = Object.entries(typeBreakdown)
            .sort(([,a], [,b]) => (b.count || 0) - (a.count || 0))
            .slice(0, 3);
        
        const smallLineHeight = this.accessibilitySettings.largeText ? 18 : 15;
        let typeY = y + 20;
        
        context.font = this.fonts.small;
        for (const [type, data] of sortedTypes) {
            const typeName = this.getBubbleTypeName(type);
            const count = data.count || 0;
            
            context.fillStyle = this.colors.label;
            context.textAlign = 'left';
            context.fillText(`${typeName}:`, x + 10, typeY);
            
            context.fillStyle = this.colors.value;
            context.textAlign = 'right';
            context.fillText(`${count}個`, x + width - 10, typeY);
            
            typeY += smallLineHeight;
        }
    }
    
    /**
     * データなしメッセージの描画
     * @param context - Canvas描画コンテキスト
     * @param x - 描画X座標
     * @param y - 描画Y座標
     * @param width - 描画幅
     * @param height - 描画高さ
     */
    private renderNoDataMessage(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        context.fillStyle = this.accessibilitySettings.highContrast ? '#888888' : '#9CA3AF';
        context.font = this.accessibilitySettings.largeText ? '20px system-ui, -apple-system, sans-serif' : '16px system-ui, -apple-system, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('統計データがありません', x + width / 2, y + height / 2);
    }
    
    /**
     * エラーフォールバックの描画
     * @param context - Canvas描画コンテキスト
     * @param x - 描画X座標
     * @param y - 描画Y座標
     * @param width - 描画幅
     * @param height - 描画高さ
     * @param error - エラーオブジェクト
     */
    private renderErrorFallback(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, error: Error): void {
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FF0000' : '#FF6B6B';
        context.fillRect(x, y, width, height);
        
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#333333';
        context.font = this.accessibilitySettings.largeText ? '18px sans-serif' : '16px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const errorText = '統計表示でエラーが発生しました';
        context.fillText(errorText, x + width / 2, y + height / 2);
        
        // デバッグ情報（開発時のみ）
        if (this.gameEngine.debugMode) {
            context.font = '12px monospace';
            context.fillText(error.message, x + width / 2, y + height / 2 + 30);
        }
    }
    
    /**
     * 泡タイプ名の取得
     * @param type - 泡タイプ
     * @returns 表示用の泡タイプ名
     */
    private getBubbleTypeName(type?: string): string {
        const typeNames: Record<string, string> = {
            'normal': '通常',
            'stone': '石',
            'iron': '鉄',
            'diamond': 'ダイヤ',
            'rainbow': 'レインボー',
            'pink': 'ピンク',
            'clock': '時計',
            'electric': '電気',
            'poison': '毒',
            'spiky': 'トゲ',
            'escaping': '逃げる',
            'boss': 'ボス',
            'golden': '金',
            'frozen': '氷',
            'magnetic': '磁力',
            'explosive': '爆発',
            'phantom': '幽霊',
            'multiplier': '倍率'
        };
        
        return typeNames[type || ''] || type || '不明';
    }
    
    /**
     * レスポンシブレイアウトの取得
     * @param screenWidth - 画面幅
     * @returns レイアウト設定
     */
    private getResponsiveLayout(screenWidth: number): ResponsiveLayout {
        if (screenWidth < 600) {
            return { columns: 1, fontSize: 'small' };
        } else if (screenWidth < 800) {
            return { columns: 2, fontSize: 'medium' };
        } else {
            return { columns: 2, fontSize: 'large' };
        }
    }
    
    /**
     * クリックイベント処理
     * @param x - クリックX座標
     * @param y - クリックY座標
     * @returns イベントが処理された場合true
     */
    handleClick(x: number, y: number): boolean {
        // 現在の実装では特別なクリック処理は不要
        // 将来的にセクションの展開/折りたたみなどを実装する場合はここで処理
        return false;
    }
    
    /**
     * フレーム更新処理
     * @param deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime: number): void {
        // アニメーション等が必要な場合はここで処理
        // 現在の実装では静的表示のため何もしない
    }
    
    /**
     * コンポーネントのクリーンアップ
     */
    cleanup(): void {
        // イベントリスナーのクリーンアップ
        this.eventBus.off('statistics-data-updated');
        this.eventBus.off('statistics-scroll-update');
        
        // データのクリア
        this.statisticsData = null;
    }
}