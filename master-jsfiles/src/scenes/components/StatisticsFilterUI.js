/**
 * 統計フィルターUIコンポーネント
 * 統計表示の期間フィルターと表示モード切り替え機能を提供
 */
export class StatisticsFilterUI {
    constructor(gameEngine, eventBus, state) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
        
        // エラーハンドリング
        this.errorHandler = gameEngine.errorHandler;
        
        // フィルター設定
        this.currentPeriodFilter = 'last7days';
        this.currentViewMode = 'dashboard';
        
        // アクセシビリティ設定
        this.accessibilitySettings = state.accessibilitySettings || {
            highContrast: false,
            largeText: false,
            reducedMotion: false
        };
        
        // レイアウト設定
        this.filterHeight = 50;
        this.modeHeight = 40;
        this.buttonSpacing = 10;
        this.contentPadding = 20;
        
        // ボタン位置情報（クリック判定用）
        this.periodButtons = [];
        this.modeButtons = [];
        
        // 期間フィルターオプション
        this.periods = [
            { key: 'today', label: '今日' },
            { key: 'last7days', label: '7日間' },
            { key: 'last30days', label: '30日間' },
            { key: 'allTime', label: '全期間' }
        ];
        
        // 表示モードオプション
        this.modes = [
            { key: 'dashboard', label: 'ダッシュボード' },
            { key: 'charts', label: 'グラフ' },
            { key: 'details', label: '詳細' }
        ];
        
        this.setupEventListeners();
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // 外部からのフィルター変更イベント
        this.eventBus.on('set-period-filter', (period) => {
            this.setPeriodFilter(period);
        });
        
        this.eventBus.on('set-view-mode', (mode) => {
            this.setViewMode(mode);
        });
    }
    
    /**
     * フィルターUIの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @returns {number} - 描画された高さ
     */
    render(context, x, y, width) {
        try {
            let currentY = y;
            
            // 期間フィルターUIの描画
            currentY = this.renderPeriodFilter(context, x, currentY, width);
            
            // 表示モード切り替えUIの描画
            currentY = this.renderViewModeSelector(context, x, currentY + 10, width);
            
            return currentY - y;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'StatisticsFilterUI.render',
                details: 'フィルターUIの描画でエラーが発生しました'
            });
            return this.filterHeight + this.modeHeight + 10; // フォールバック高さ
        }
    }
    
    /**
     * 期間フィルターUIの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @returns {number} - 描画後のY座標
     */
    renderPeriodFilter(context, x, y, width) {
        const filterHeight = this.accessibilitySettings.largeText ? 60 : this.filterHeight;
        const buttonWidth = this.accessibilitySettings.largeText ? 120 : 100;
        const buttonHeight = this.accessibilitySettings.largeText ? 35 : 30;
        
        // クリック判定用配列をリセット
        this.periodButtons = [];
        
        // フィルター背景
        context.fillStyle = this.accessibilitySettings.highContrast ? '#000000' : '#F8FAFC';
        context.fillRect(x, y, width, filterHeight);
        
        // フィルター枠線
        context.strokeStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#E5E7EB';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, filterHeight);
        
        // フィルタータイトル
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#374151';
        context.font = this.accessibilitySettings.largeText ? '16px system-ui, -apple-system, sans-serif' : '14px system-ui, -apple-system, sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText('期間フィルター:', x + 10, y + filterHeight / 2);
        
        // 期間フィルターボタン
        let buttonX = x + (this.accessibilitySettings.largeText ? 140 : 120);
        this.periods.forEach((period) => {
            const isActive = this.currentPeriodFilter === period.key;
            
            // ボタン位置情報を保存（クリック判定用）
            this.periodButtons.push({
                key: period.key,
                x: buttonX,
                y: y + (filterHeight - buttonHeight) / 2,
                width: buttonWidth,
                height: buttonHeight
            });
            
            // ボタン背景
            if (this.accessibilitySettings.highContrast) {
                context.fillStyle = isActive ? '#FFFFFF' : '#444444';
            } else {
                context.fillStyle = isActive ? '#3B82F6' : '#FFFFFF';
            }
            context.fillRect(buttonX, y + (filterHeight - buttonHeight) / 2, buttonWidth, buttonHeight);
            
            // ボタン枠線
            if (this.accessibilitySettings.highContrast) {
                context.strokeStyle = '#FFFFFF';
            } else {
                context.strokeStyle = isActive ? '#3B82F6' : '#D1D5DB';
            }
            context.lineWidth = 2;
            context.strokeRect(buttonX, y + (filterHeight - buttonHeight) / 2, buttonWidth, buttonHeight);
            
            // ボタンテキスト
            if (this.accessibilitySettings.highContrast) {
                context.fillStyle = isActive ? '#000000' : '#FFFFFF';
            } else {
                context.fillStyle = isActive ? '#FFFFFF' : '#374151';
            }
            context.font = this.accessibilitySettings.largeText ? '14px system-ui, -apple-system, sans-serif' : '12px system-ui, -apple-system, sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(period.label, buttonX + buttonWidth / 2, y + filterHeight / 2);
            
            buttonX += buttonWidth + this.buttonSpacing;
        });
        
        return y + filterHeight;
    }
    
    /**
     * 表示モード切り替えUIの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @returns {number} - 描画後のY座標
     */
    renderViewModeSelector(context, x, y, width) {
        const modeHeight = this.accessibilitySettings.largeText ? 50 : this.modeHeight;
        const buttonWidth = this.accessibilitySettings.largeText ? 100 : 80;
        const buttonHeight = this.accessibilitySettings.largeText ? 30 : 25;
        
        // クリック判定用配列をリセット
        this.modeButtons = [];
        
        // モード切り替え背景
        context.fillStyle = this.accessibilitySettings.highContrast ? '#000000' : '#F8FAFC';
        context.fillRect(x, y, width, modeHeight);
        
        // モード切り替えタイトル
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#374151';
        context.font = this.accessibilitySettings.largeText ? '14px system-ui, -apple-system, sans-serif' : '12px system-ui, -apple-system, sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText('表示モード:', x + 10, y + modeHeight / 2);
        
        // 表示モードボタン
        let buttonX = x + (this.accessibilitySettings.largeText ? 100 : 80);
        this.modes.forEach((mode) => {
            const isActive = this.currentViewMode === mode.key;
            
            // ボタン位置情報を保存（クリック判定用）
            this.modeButtons.push({
                key: mode.key,
                x: buttonX,
                y: y + (modeHeight - buttonHeight) / 2,
                width: buttonWidth,
                height: buttonHeight
            });
            
            // ボタン背景
            if (this.accessibilitySettings.highContrast) {
                context.fillStyle = isActive ? '#FFFFFF' : '#444444';
            } else {
                context.fillStyle = isActive ? '#10B981' : '#FFFFFF';
            }
            context.fillRect(buttonX, y + (modeHeight - buttonHeight) / 2, buttonWidth, buttonHeight);
            
            // ボタン枠線
            if (this.accessibilitySettings.highContrast) {
                context.strokeStyle = '#FFFFFF';
            } else {
                context.strokeStyle = isActive ? '#10B981' : '#D1D5DB';
            }
            context.lineWidth = 2;
            context.strokeRect(buttonX, y + (modeHeight - buttonHeight) / 2, buttonWidth, buttonHeight);
            
            // ボタンテキスト
            if (this.accessibilitySettings.highContrast) {
                context.fillStyle = isActive ? '#000000' : '#FFFFFF';
            } else {
                context.fillStyle = isActive ? '#FFFFFF' : '#374151';
            }
            context.font = this.accessibilitySettings.largeText ? '12px system-ui, -apple-system, sans-serif' : '10px system-ui, -apple-system, sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(mode.label, buttonX + buttonWidth / 2, y + modeHeight / 2);
            
            buttonX += buttonWidth + (this.buttonSpacing / 2);
        });
        
        return y + modeHeight;
    }
    
    /**
     * クリックイベント処理
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @returns {boolean} - イベントが処理された場合true
     */
    handleClick(x, y) {
        try {
            // 期間フィルターボタンのクリック判定
            for (const button of this.periodButtons) {
                if (x >= button.x && x <= button.x + button.width &&
                    y >= button.y && y <= button.y + button.height) {
                    this.setPeriodFilter(button.key);
                    return true;
                }
            }
            
            // 表示モードボタンのクリック判定
            for (const button of this.modeButtons) {
                if (x >= button.x && x <= button.x + button.width &&
                    y >= button.y && y <= button.y + button.height) {
                    this.setViewMode(button.key);
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'StatisticsFilterUI.handleClick',
                details: `クリック処理でエラーが発生しました: (${x}, ${y})`
            });
            return false;
        }
    }
    
    /**
     * 期間フィルターの設定
     * @param {string} period - 期間フィルター
     */
    setPeriodFilter(period) {
        if (this.periods.some(p => p.key === period)) {
            this.currentPeriodFilter = period;
            this.eventBus.emit('statistics-filter-changed', { 
                period: period 
            });
        }
    }
    
    /**
     * 表示モードの設定
     * @param {string} mode - 表示モード
     */
    setViewMode(mode) {
        if (this.modes.some(m => m.key === mode)) {
            this.currentViewMode = mode;
            this.eventBus.emit('statistics-view-mode-changed', mode);
        }
    }
    
    /**
     * 現在の期間フィルターを取得
     * @returns {string} - 現在の期間フィルター
     */
    getCurrentPeriodFilter() {
        return this.currentPeriodFilter;
    }
    
    /**
     * 現在の表示モードを取得
     * @returns {string} - 現在の表示モード
     */
    getCurrentViewMode() {
        return this.currentViewMode;
    }
    
    /**
     * フィルター状態のリセット
     */
    reset() {
        this.currentPeriodFilter = 'last7days';
        this.currentViewMode = 'dashboard';
        this.periodButtons = [];
        this.modeButtons = [];
    }
    
    /**
     * コンポーネントのクリーンアップ
     */
    cleanup() {
        // イベントリスナーのクリーンアップ
        this.eventBus.off('set-period-filter');
        this.eventBus.off('set-view-mode');
        
        // 状態のリセット
        this.reset();
    }
}