/**
 * LeaderboardRenderer.ts
 * リーダーボードレンダリングシステム
 * LeaderboardUIから分離されたレンダリング機能
 */

import { getErrorHandler } from '../../../utils/ErrorHandler.js';
import type { ErrorHandler } from '../../../utils/ErrorHandler.js';

/**
 * Game engine interface
 */
interface GameEngine {
    // Add specific properties/methods as needed
}

/**
 * Color configuration interface
 */
interface ColorConfig {
    background: string;
    header: string;
    tab: string;
    tabActive: string;
    text: string;
    textSecondary: string;
    border: string;
    entry: string;
    entryHover: string;
    entrySelected: string;
    gold: string;
    silver: string;
    bronze: string;
}

/**
 * Font configuration interface
 */
interface FontConfig {
    header: string;
    tab: string;
    entry: string;
    details: string;
}

/**
 * Animation configuration interface
 */
interface AnimationConfig {
    fadeSpeed: number;
    scrollSpeed: number;
    hoverScale: number;
}

/**
 * Render configuration interface
 */
interface RenderConfig {
    colors: ColorConfig;
    fonts: FontConfig;
    animations: AnimationConfig;
}

/**
 * Animation state interface
 */
interface AnimationState {
    fadeOpacity: number;
    scrollOffset: number;
    hoverScale: number;
    entryAnimations: Map<string, any>;
}

/**
 * Layout configuration interface
 */
interface LayoutConfig {
    padding: number;
    entryHeight: number;
    scrollOffset: number;
}

/**
 * Ranking entry interface
 */
interface RankingEntry {
    playerName?: string;
    score?: number;
    maxCombo?: number;
    accuracy?: number;
    playTime?: number;
    timestamp: string | Date;
}

/**
 * Cached data interface
 */
interface CachedData {
    rankings: RankingEntry[];
}

/**
 * UI state interface
 */
interface UIState {
    lastUpdateTime?: number;
    currentView: string;
    sortBy: string;
    cachedData?: CachedData | null;
    selectedEntry?: RankingEntry | null;
    hoveredEntry?: RankingEntry | null;
    showDetails?: boolean;
}

/**
 * Config update interface
 */
interface ConfigUpdate {
    colors?: Partial<ColorConfig>;
    fonts?: Partial<FontConfig>;
    animations?: Partial<AnimationConfig>;
}

/**
 * Tab definition interface
 */
interface TabDefinition {
    id: string;
    label: string;
}

/**
 * Sort option interface
 */
interface SortOption {
    id: string;
    label: string;
}

/**
 * Entry detail interface
 */
interface EntryDetail {
    label: string;
    value: string;
}

export class LeaderboardRenderer {
    private gameEngine: GameEngine;
    private errorHandler: ErrorHandler;
    // レンダリング設定
    private renderConfig: RenderConfig = {
        colors: {
            background: '#1a1a2e',
            header: '#16213e',
            tab: '#0f3460',
            tabActive: '#e94560',
            text: '#ffffff',
            textSecondary: '#cccccc',
            border: '#333333',
            entry: '#252a3e',
            entryHover: '#2a3041',
            entrySelected: '#e94560',
            gold: '#ffd700',
            silver: '#c0c0c0',
            bronze: '#cd7f32'
        },
        fonts: {
            header: '24px Arial',
            tab: '16px Arial',
            entry: '14px Arial',
            details: '12px Arial'
        },
        animations: {
            fadeSpeed: 0.1,
            scrollSpeed: 0.2,
            hoverScale: 1.05
        }
    };
    // アニメーション状態
    private animationState: AnimationState = {
        fadeOpacity: 1.0,
        scrollOffset: 0,
        hoverScale: 1.0,
        entryAnimations: new Map()
    };

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
    }
    
    /**
     * メインレンダリング
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {Object} uiState - UI状態
     * @param {Object} layout - レイアウト設定
     */
    render(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        uiState: UIState,
        layout: LayoutConfig
    ): void {
        try {
            // 背景
            this.renderBackground(context, x, y, width, height);
            
            // ヘッダー（タイトル・更新時間）
            const headerY = this.renderHeader(context, x, y, width, uiState);
            
            // タブ（期間・ステージ切り替え）
            const tabY = this.renderTabs(context, x, headerY, width, uiState);
            
            // ソートオプション
            const sortY = this.renderSortOptions(context, x, tabY, width, uiState);
            
            // ランキングリスト
            const listHeight = height - (sortY - y) - layout.padding;
            this.renderRankingList(context, x, sortY, width, listHeight, uiState, layout);
            
            // 詳細情報（選択時）
            if (uiState.showDetails && uiState.selectedEntry) {
                this.renderEntryDetails(context, x, y, width, height, uiState);
            }
        } catch (error) {
            console.error('[LeaderboardRenderer] 描画エラー:', error);
            this.renderErrorMessage(context, x, y, width, height);
        }
    }
    
    /**
     * 背景を描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     */
    renderBackground(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
    ): void {
        // グラデーション背景
        const gradient = context.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, this.renderConfig.colors.background);
        gradient.addColorStop(1, '#0f1419');
        
        context.fillStyle = gradient;
        context.fillRect(x, y, width, height);
        
        // 境界線
        context.strokeStyle = this.renderConfig.colors.border;
        context.lineWidth = 2;
        context.strokeRect(x, y, width, height);
    }
    
    /**
     * ヘッダーを描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {Object} uiState - UI状態
     * @returns {number} 次のY座標
     */
    renderHeader(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        uiState: UIState
    ): number {
        const headerHeight = 60;
        const padding = 20;
        
        // ヘッダー背景
        context.fillStyle = this.renderConfig.colors.header;
        context.fillRect(x, y, width, headerHeight);
        
        // タイトル
        context.fillStyle = this.renderConfig.colors.text;
        context.font = this.renderConfig.fonts.header;
        context.textAlign = 'left';
        context.fillText('🏆 リーダーボード', x + padding, y + 35);
        
        // 更新時間
        if (uiState.lastUpdateTime) {
            const updateTime = new Date(uiState.lastUpdateTime).toLocaleTimeString();
            context.font = this.renderConfig.fonts.details;
            context.textAlign = 'right';
            context.fillText(`最終更新: ${updateTime}`, x + width - padding, y + 35);
        }
        
        return y + headerHeight;
    }
    
    /**
     * タブを描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {Object} uiState - UI状態
     * @returns {number} 次のY座標
     */
    renderTabs(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        uiState: UIState
    ): number {
        const tabHeight = 40;
        const padding = 20;
        
        const tabs: TabDefinition[] = [
            { id: 'overall', label: '総合' },
            { id: 'daily', label: '日間' },
            { id: 'weekly', label: '週間' },
            { id: 'monthly', label: '月間' },
            { id: 'stage', label: 'ステージ別' }
        ];
        
        const tabWidth = (width - padding * 2) / tabs.length;
        
        tabs.forEach((tab, index) => {
            const tabX = x + padding + (index * tabWidth);
            const isActive = tab.id === uiState.currentView;
            
            // タブ背景
            context.fillStyle = isActive ? 
                this.renderConfig.colors.tabActive : this.renderConfig.colors.tab;
            context.fillRect(tabX, y, tabWidth, tabHeight);
            
            // タブテキスト
            context.fillStyle = this.renderConfig.colors.text;
            context.font = this.renderConfig.fonts.tab;
            context.textAlign = 'center';
            context.fillText(tab.label, tabX + tabWidth / 2, y + 25);
            
            // アクティブタブの下線
            if (isActive) {
                context.fillStyle = this.renderConfig.colors.text;
                context.fillRect(tabX, y + tabHeight - 3, tabWidth, 3);
            }
        });
        
        return y + tabHeight;
    }
    
    /**
     * ソートオプションを描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {Object} uiState - UI状態
     * @returns {number} 次のY座標
     */
    renderSortOptions(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        uiState: UIState
    ): number {
        const optionHeight = 35;
        const padding = 20;
        
        const sortOptions: SortOption[] = [
            { id: 'score', label: 'スコア順' },
            { id: 'timestamp', label: '日時順' },
            { id: 'combo', label: 'コンボ順' },
            { id: 'accuracy', label: '精度順' }
        ];

        const optionWidth = (width - padding * 2) / sortOptions.length;
        
        // 背景
        context.fillStyle = '#1e1e2e';
        context.fillRect(x, y, width, optionHeight);
        
        sortOptions.forEach((option, index) => {
            const optionX = x + padding + (index * optionWidth);
            const isActive = option.id === uiState.sortBy;
            
            // オプション背景
            if (isActive) {
                context.fillStyle = this.renderConfig.colors.entrySelected;
                context.fillRect(optionX + 5, y + 5, optionWidth - 10, optionHeight - 10);
            }
            
            // オプションテキスト
            context.fillStyle = isActive ? 
                this.renderConfig.colors.text : this.renderConfig.colors.textSecondary;
            context.font = this.renderConfig.fonts.entry;
            context.textAlign = 'center';
            context.fillText(option.label, optionX + optionWidth / 2, y + 22);
        });
        
        return y + optionHeight;
    }
    
    /**
     * ランキングリストを描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {Object} uiState - UI状態
     * @param {Object} layout - レイアウト設定
     */
    renderRankingList(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        uiState: UIState,
        layout: LayoutConfig
    ): void {
        const data = uiState.cachedData;
        
        if (!data || !data.rankings || data.rankings.length === 0) {
            this.renderNoData(context, x, y, width, height);
            return;
        }
        
        // リストヘッダー
        const headerY = this.renderListHeader(context, x, y, width);
        
        // エントリー描画
        const entryStartY = headerY;
        const availableHeight = height - (headerY - y);
        const maxEntries = Math.floor(availableHeight / layout.entryHeight);
        
        const startIndex = layout.scrollOffset;
        const endIndex = Math.min(startIndex + maxEntries, data.rankings.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const entry = data.rankings[i];
            const entryY = entryStartY + ((i - startIndex) * layout.entryHeight);
            this.renderRankingEntry(context, x, entryY, width, layout.entryHeight, entry, i + 1, uiState);
        }
        
        // スクロールバー
        if (data.rankings.length > maxEntries) {
            this.renderScrollbar(context, x + width - 15, y, 15, height,
                               startIndex, data.rankings.length, maxEntries);
        }
    }
    
    /**
     * リストヘッダーを描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @returns {number} 次のY座標
     */
    renderListHeader(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number
    ): number {
        const headerHeight = 30;
        const padding = 20;
        
        // ヘッダー背景
        context.fillStyle = '#2a2d3a';
        context.fillRect(x, y, width, headerHeight);
        
        // ヘッダーテキスト
        context.fillStyle = this.renderConfig.colors.textSecondary;
        context.font = this.renderConfig.fonts.details;
        context.textAlign = 'left';
        
        // 列ヘッダー
        context.fillText('順位', x + padding, y + 20);
        context.fillText('プレイヤー', x + padding + 80, y + 20);
        context.fillText('スコア', x + width - 200, y + 20);
        context.fillText('日時', x + width - 100, y + 20);
        
        return y + headerHeight;
    }
    
    /**
     * ランキングエントリーを描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {Object} entry - エントリーデータ
     * @param {number} rank - 順位
     * @param {Object} uiState - UI状態
     */
    renderRankingEntry(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        entry: RankingEntry,
        rank: number,
        uiState: UIState
    ): void {
        const padding = 20;
        const isSelected = uiState.selectedEntry === entry;
        const isHovered = uiState.hoveredEntry === entry;
        
        // エントリー背景
        let bgColor = this.renderConfig.colors.entry;
        if (isSelected) {
            bgColor = this.renderConfig.colors.entrySelected;
        } else if (isHovered) {
            bgColor = this.renderConfig.colors.entryHover;
        }
        
        context.fillStyle = bgColor;
        context.fillRect(x + 5, y + 2, width - 10, height - 4);
        
        // 順位表示（特別な色）
        const rankColor = this.getRankColor(rank);
        context.fillStyle = rankColor;
        context.font = 'bold ' + this.renderConfig.fonts.entry;
        context.textAlign = 'center';
        context.fillText(rank.toString(), x + padding + 20, y + height / 2 + 5);
        
        // プレイヤー名
        context.fillStyle = this.renderConfig.colors.text;
        context.font = this.renderConfig.fonts.entry;
        context.textAlign = 'left';
        const playerName = this.truncateText(context, entry.playerName || 'Unknown', 150);
        context.fillText(playerName, x + padding + 80, y + height / 2 + 5);
        
        // スコア
        context.textAlign = 'right';
        context.fillText(entry.score?.toLocaleString() || '0', x + width - 120, y + height / 2 + 5);
        
        // 日時
        context.fillStyle = this.renderConfig.colors.textSecondary;
        context.font = this.renderConfig.fonts.details;
        const date = new Date(entry.timestamp).toLocaleDateString();
        context.fillText(date, x + width - 20, y + height / 2 + 5);
        
        // メダルアイコン（上位3位）
        if (rank <= 3) {
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
            context.font = '20px Arial';
            context.fillText(medal, x + padding + 50, y + height / 2 + 5);
        }
    }
    
    /**
     * データなし表示
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     */
    renderNoData(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
    ): void {
        context.fillStyle = this.renderConfig.colors.textSecondary;
        context.font = this.renderConfig.fonts.entry;
        context.textAlign = 'center';
        context.fillText('データがありません', x + width / 2, y + height / 2);
    }
    
    /**
     * スクロールバーを描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {number} scrollOffset - スクロールオフセット
     * @param {number} totalItems - 総アイテム数
     * @param {number} visibleItems - 表示アイテム数
     */
    renderScrollbar(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        scrollOffset: number,
        totalItems: number,
        visibleItems: number
    ): void {
        // スクロールバー背景
        context.fillStyle = '#333333';
        context.fillRect(x, y, width, height);
        
        // スクロールハンドル
        const handleHeight = Math.max(20, (visibleItems / totalItems) * height);
        const handleY = y + (scrollOffset / (totalItems - visibleItems)) * (height - handleHeight);
        
        context.fillStyle = '#666666';
        context.fillRect(x + 2, handleY, width - 4, handleHeight);
    }
    
    /**
     * エントリー詳細を描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {Object} uiState - UI状態
     */
    renderEntryDetails(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        uiState: UIState
    ): void {
        const entry = uiState.selectedEntry;
        if (!entry) return;
        
        const modalWidth = Math.min(400, width * 0.8);
        const modalHeight = Math.min(300, height * 0.7);
        const modalX = x + (width - modalWidth) / 2;
        const modalY = y + (height - modalHeight) / 2;
        
        // オーバーレイ背景
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(x, y, width, height);
        
        // モーダル背景
        context.fillStyle = this.renderConfig.colors.background;
        context.fillRect(modalX, modalY, modalWidth, modalHeight);
        context.strokeStyle = this.renderConfig.colors.border;
        context.lineWidth = 2;
        context.strokeRect(modalX, modalY, modalWidth, modalHeight);
        
        // 詳細情報
        const padding = 20;
        let currentY = modalY + padding;
        
        // プレイヤー名
        context.fillStyle = this.renderConfig.colors.text;
        context.font = this.renderConfig.fonts.header;
        context.textAlign = 'center';
        context.fillText(entry.playerName || 'Unknown Player', modalX + modalWidth / 2, currentY + 30);
        currentY += 60;
        
        // 詳細データ
        const details: EntryDetail[] = [
            { label: 'スコア', value: entry.score?.toLocaleString() || '0' },
            { label: 'コンボ', value: entry.maxCombo?.toString() || '0' },
            { label: '精度', value: entry.accuracy ? `${(entry.accuracy * 100).toFixed(1)}%` : 'N/A' },
            { label: 'プレイ時間', value: entry.playTime ? this.formatTime(entry.playTime) : 'N/A' },
            { label: '日時', value: new Date(entry.timestamp).toLocaleString() }
        ];
        
        context.font = this.renderConfig.fonts.entry;
        context.textAlign = 'left';
        
        details.forEach(detail => {
            context.fillStyle = this.renderConfig.colors.textSecondary;
            context.fillText(detail.label + ':', modalX + padding, currentY);
            
            context.fillStyle = this.renderConfig.colors.text;
            context.textAlign = 'right';
            context.fillText(detail.value, modalX + modalWidth - padding, currentY);
            context.textAlign = 'left';
            currentY += 25;
        });
        
        // 閉じるボタン
        const buttonWidth = 80;
        const buttonHeight = 30;
        const buttonX = modalX + modalWidth - buttonWidth - padding;
        const buttonY = modalY + modalHeight - buttonHeight - padding;
        
        context.fillStyle = this.renderConfig.colors.tabActive;
        context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        context.fillStyle = this.renderConfig.colors.text;
        context.font = this.renderConfig.fonts.entry;
        context.textAlign = 'center';
        context.fillText('閉じる', buttonX + buttonWidth / 2, buttonY + 20);
    }
    
    /**
     * エラーメッセージを描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     */
    renderErrorMessage(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
    ): void {
        context.fillStyle = this.renderConfig.colors.textSecondary;
        context.font = this.renderConfig.fonts.entry;
        context.textAlign = 'center';
        context.fillText('データの読み込みでエラーが発生しました', x + width / 2, y + height / 2);
    }
    
    /**
     * 順位に応じた色を取得
     * @param {number} rank - 順位
     * @returns {string} 色
     */
    getRankColor(rank: number): string {
        if (rank === 1) return this.renderConfig.colors.gold;
        if (rank === 2) return this.renderConfig.colors.silver;
        if (rank === 3) return this.renderConfig.colors.bronze;
        return this.renderConfig.colors.text;
    }
    
    /**
     * テキストを切り詰め
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {string} text - テキスト
     * @param {number} maxWidth - 最大幅
     * @returns {string} 切り詰められたテキスト
     */
    truncateText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string {
        if (context.measureText(text).width <= maxWidth) {
            return text;
        }
        
        let truncated = text;
        while (context.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        
        return truncated + '...';
    }
    
    /**
     * 時間をフォーマット
     * @param {number} milliseconds - ミリ秒
     * @returns {string} フォーマットされた時間
     */
    formatTime(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}分${remainingSeconds}秒`;
        } else {
            return `${remainingSeconds}秒`;
        }
    }
    
    /**
     * アニメーション状態を更新
     * @param {Object} animationUpdates - アニメーション更新
     */
    updateAnimations(animationUpdates: Partial<AnimationState>): void {
        Object.assign(this.animationState, animationUpdates);
    }
    
    /**
     * レンダリング設定を更新
     * @param {Object} configUpdates - 設定更新
     */
    updateRenderConfig(configUpdates: ConfigUpdate): void {
        if (configUpdates.colors) {
            Object.assign(this.renderConfig.colors, configUpdates.colors);
        }
        if (configUpdates.fonts) {
            Object.assign(this.renderConfig.fonts, configUpdates.fonts);
        }
        if (configUpdates.animations) {
            Object.assign(this.renderConfig.animations, configUpdates.animations);
        }
    }
    
    /**
     * レンダラーを破棄
     */
    dispose(): void {
        this.animationState.entryAnimations.clear();
        console.log('[LeaderboardRenderer] Disposed');
    }
}