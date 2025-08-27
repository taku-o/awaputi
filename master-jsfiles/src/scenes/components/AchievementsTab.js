/**
 * 実績タブコンポーネント
 * UserInfoSceneの実績表示機能を担当
 */
import { TabComponent } from './TabComponent.js';

export class AchievementsTab extends TabComponent {
    constructor(gameEngine, eventBus, state) {
        super(gameEngine, eventBus, state);
        
        // サブコンポーネント
        this.categoryFilter = null;
        this.progressRenderer = null;
        this.achievementsRenderer = null;
        
        // データ
        this.achievementsData = null;
        this.filteredAchievements = null;
        this.lastDataUpdate = 0;
        
        // UI状態
        this.scrollPosition = 0;
        this.maxScrollPosition = 0;
        this.currentCategory = 'all';
        
        // レイアウト設定
        this.contentPadding = 20;
        this.sectionSpacing = 20;
        this.achievementHeight = 80;
        this.achievementSpacing = 10;
        
        // フィルター設定
        this.categories = ['all', 'score', 'play', 'technique', 'collection', 'special'];
        this.categoryLabels = ['全て', 'スコア系', 'プレイ系', 'テクニック系', 'コレクション系', '特殊系'];
    }
    
    /**
     * コンポーネントの初期化
     */
    initialize() {
        super.initialize();
        
        // サブコンポーネントを初期化
        this.categoryFilter = new AchievementCategoryFilter(this.gameEngine, this.eventBus, this.state);
        this.progressRenderer = new AchievementProgressRenderer(this.gameEngine, this.eventBus, this.state);
        this.achievementsRenderer = new AchievementsRenderer(this.gameEngine, this.eventBus, this.state);
        
        this.categoryFilter.initialize();
        this.progressRenderer.initialize();
        this.achievementsRenderer.initialize();
        
        // イベントリスナーを設定
        this.setupEventListeners();
        
        // 初期データを読み込み
        this.loadAchievementsData();
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // カテゴリフィルター変更
        this.eventBus.on('achievement-category-changed', (data) => {
            this.currentCategory = data.category;
            this.scrollPosition = 0; // スクロール位置をリセット
            this.updateFilteredAchievements();
        });
        
        // 実績データ更新
        this.eventBus.on('achievements-data-updated', (data) => {
            this.achievementsData = data.achievements;
            this.updateFilteredAchievements();
        });
        
        // エラーハンドリング
        this.eventBus.on('component-error', (error) => {
            console.error('AchievementsTab error:', error);
        });
    }
    
    /**
     * 実績データを読み込み
     */
    loadAchievementsData() {
        try {
            const achievementManager = this.gameEngine.achievementManager;
            if (achievementManager) {
                this.achievementsData = achievementManager.getAchievements();
                this.updateFilteredAchievements();
            }
            
            this.lastDataUpdate = Date.now();
        } catch (error) {
            console.error('Failed to load achievements data:', error);
            this.achievementsData = [];
            this.filteredAchievements = [];
        }
    }
    
    /**
     * フィルターされた実績データを更新
     */
    updateFilteredAchievements() {
        if (!this.achievementsData || !Array.isArray(this.achievementsData)) {
            this.filteredAchievements = [];
            return;
        }
        
        if (this.currentCategory === 'all') {
            this.filteredAchievements = [...this.achievementsData];
        } else {
            this.filteredAchievements = this.achievementsData.filter(
                achievement => achievement.category === this.currentCategory
            );
        }
        
        // 解除済みと未解除で分類
        this.unlockedAchievements = this.filteredAchievements.filter(a => a.unlocked);
        this.progressAchievements = this.filteredAchievements.filter(a => !a.unlocked);
    }
    
    /**
     * レンダリング処理
     */
    render(context, x, y, width, height) {
        try {
            if (!this.isActive) return;
            
            // 背景を描画
            this.renderBackground(context, x, y, width, height);
            
            // データを定期更新
            this.updateDataIfNeeded();
            
            let currentY = y;
            
            // カテゴリフィルターを描画
            const filterHeight = this.categoryFilter.render(
                context, 
                x, 
                currentY, 
                width, 
                this.currentCategory,
                this.categories,
                this.categoryLabels
            );
            currentY += filterHeight + 10;
            
            // 実績コンテンツを描画
            const contentHeight = height - (currentY - y) - 20;
            this.renderAchievementsContent(context, x, currentY, width, contentHeight);
            
            // スクロールバーを描画
            this.renderScrollbar(context, x + width - 16, currentY, 16, contentHeight);
            
        } catch (error) {
            this.renderErrorFallback(context, x, y, width, height, error);
        }
    }
    
    /**
     * 背景を描画
     */
    renderBackground(context, x, y, width, height) {
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#F8F9FA';
        context.fillRect(x, y, width, height);
        
        context.strokeStyle = this.accessibilitySettings.highContrast ? '#000000' : '#DEE2E6';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height);
    }
    
    /**
     * 実績コンテンツを描画
     */
    renderAchievementsContent(context, x, y, width, height) {
        const contentX = x + this.contentPadding;
        const contentWidth = width - this.contentPadding * 2 - 20; // スクロールバー分を除く
        let currentY = y + this.contentPadding - this.scrollPosition;
        
        // 実績データが存在しない場合
        if (!this.filteredAchievements || this.filteredAchievements.length === 0) {
            this.renderNoAchievementsMessage(context, contentX, currentY, contentWidth);
            return;
        }
        
        // 解除済み実績セクション
        if (this.unlockedAchievements && this.unlockedAchievements.length > 0) {
            const unlockedHeight = this.achievementsRenderer.renderUnlockedSection(
                context,
                contentX,
                currentY,
                contentWidth,
                this.unlockedAchievements
            );
            currentY += unlockedHeight + this.sectionSpacing;
        }
        
        // 進行中実績セクション
        if (this.progressAchievements && this.progressAchievements.length > 0) {
            const progressHeight = this.achievementsRenderer.renderProgressSection(
                context,
                contentX,
                currentY,
                contentWidth,
                this.progressAchievements
            );
            currentY += progressHeight;
        }
        
        // スクロール制限を更新
        this.updateScrollLimits(currentY + this.scrollPosition, y + height);
    }
    
    /**
     * 実績データなしメッセージを描画
     */
    renderNoAchievementsMessage(context, x, y, width) {
        context.fillStyle = this.accessibilitySettings.highContrast ? '#000000' : '#6C757D';
        context.font = this.accessibilitySettings.largeText ? '18px sans-serif' : '16px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        
        const message = this.currentCategory === 'all' 
            ? '実績データがありません' 
            : `${this.categoryLabels[this.categories.indexOf(this.currentCategory)]}の実績がありません`;
            
        context.fillText(message, x + width / 2, y + 50);
    }
    
    /**
     * データの定期更新
     */
    updateDataIfNeeded() {
        const now = Date.now();
        if (now - this.lastDataUpdate > 10000) { // 10秒間隔
            this.loadAchievementsData();
        }
    }
    
    /**
     * スクロール制限を更新
     */
    updateScrollLimits(contentHeight, viewHeight) {
        this.maxScrollPosition = Math.max(0, contentHeight - viewHeight + this.contentPadding);
        this.scrollPosition = Math.max(0, Math.min(this.maxScrollPosition, this.scrollPosition));
    }
    
    /**
     * スクロールバーを描画
     */
    renderScrollbar(context, x, y, width, height) {
        if (this.maxScrollPosition <= 0) return;
        
        // スクロールバー背景
        context.fillStyle = '#E9ECEF';
        context.fillRect(x, y, width, height);
        
        // スクロールバートラック
        const trackHeight = height * (height / (height + this.maxScrollPosition));
        const trackY = y + (this.scrollPosition / this.maxScrollPosition) * (height - trackHeight);
        
        context.fillStyle = '#6C757D';
        context.fillRect(x + 2, trackY, width - 4, trackHeight);
        
        // スクロールバー枠線
        context.strokeStyle = '#CED4DA';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height);
    }
    
    /**
     * クリック処理
     */
    handleClick(x, y) {
        if (!this.isActive) return false;
        
        // カテゴリフィルターのクリック処理
        if (y <= 50) { // フィルターエリア
            return this.categoryFilter.handleClick(x, y, this.categories, this.categoryLabels);
        }
        
        // 実績アイテムのクリック処理（将来の拡張用）
        
        return false;
    }
    
    /**
     * 入力処理
     */
    handleInput(event) {
        if (!this.isActive) return false;
        
        if (event.type === 'keydown') {
            switch (event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    this.scroll(-30);
                    return true;
                    
                case 'ArrowDown':
                    event.preventDefault();
                    this.scroll(30);
                    return true;
                    
                case 'PageUp':
                    event.preventDefault();
                    this.scroll(-200);
                    return true;
                    
                case 'PageDown':
                    event.preventDefault();
                    this.scroll(200);
                    return true;
                    
                case 'Home':
                    event.preventDefault();
                    this.scrollPosition = 0;
                    return true;
                    
                case 'End':
                    event.preventDefault();
                    this.scrollPosition = this.maxScrollPosition;
                    return true;
            }
        } else if (event.type === 'wheel') {
            event.preventDefault();
            this.scroll(event.deltaY);
            return true;
        }
        
        return false;
    }
    
    /**
     * スクロール処理
     */
    scroll(delta) {
        this.scrollPosition = Math.max(0, Math.min(this.maxScrollPosition, this.scrollPosition + delta));
    }
    
    /**
     * フレーム更新処理
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.isActive) {
            // サブコンポーネントの更新
            if (this.categoryFilter) {
                this.categoryFilter.update(deltaTime);
            }
            
            if (this.progressRenderer) {
                this.progressRenderer.update(deltaTime);
            }
            
            if (this.achievementsRenderer) {
                this.achievementsRenderer.update(deltaTime);
            }
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        super.cleanup();
        
        if (this.categoryFilter) {
            this.categoryFilter.cleanup();
        }
        
        if (this.progressRenderer) {
            this.progressRenderer.cleanup();
        }
        
        if (this.achievementsRenderer) {
            this.achievementsRenderer.cleanup();
        }
        
        this.achievementsData = null;
        this.filteredAchievements = null;
        this.scrollPosition = 0;
        this.maxScrollPosition = 0;
    }
}

/**
 * 実績カテゴリフィルターコンポーネント
 * カテゴリ別のフィルタリング機能を提供
 */
class AchievementCategoryFilter {
    constructor(gameEngine, eventBus, state) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
        
        this.buttonHeight = 30;
        this.buttonSpacing = 10;
        this.hoveredButton = -1;
        
        this.textSettings = {
            font: '12px sans-serif',
            textColor: '#495057',
            activeTextColor: '#FFFFFF',
            backgroundColor: '#F8F9FA',
            activeBackgroundColor: '#007BFF',
            borderColor: '#DEE2E6',
            activeBorderColor: '#0056B3'
        };
        
        this.isInitialized = false;
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.applyAccessibilitySettings();
        this.isInitialized = true;
    }
    
    /**
     * アクセシビリティ設定を適用
     */
    applyAccessibilitySettings() {
        const settings = this.state.accessibilitySettings || {};
        
        if (settings.largeText) {
            this.textSettings.font = '14px sans-serif';
        }
        
        if (settings.highContrast) {
            this.textSettings.textColor = '#000000';
            this.textSettings.activeTextColor = '#FFFFFF';
            this.textSettings.backgroundColor = '#FFFFFF';
            this.textSettings.activeBackgroundColor = '#000000';
            this.textSettings.borderColor = '#000000';
            this.textSettings.activeBorderColor = '#000000';
        }
    }
    
    /**
     * カテゴリフィルターを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {string} currentCategory - 現在のカテゴリ
     * @param {Array<string>} categories - カテゴリ一覧
     * @param {Array<string>} categoryLabels - カテゴリラベル一覧
     * @returns {number} - 描画した高さ
     */
    render(context, x, y, width, currentCategory, categories, categoryLabels) {
        const filterHeight = 40;
        const buttonWidth = 120;
        
        // フィルターの背景
        context.fillStyle = this.textSettings.backgroundColor;
        context.fillRect(x, y, width, filterHeight);
        
        // 境界線
        context.strokeStyle = this.textSettings.borderColor;
        context.lineWidth = 1;
        context.strokeRect(x, y, width, filterHeight);
        
        // フィルターボタンを描画
        let currentX = x + 10;
        const buttonY = y + 5;
        
        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            const label = categoryLabels[i];
            const isActive = currentCategory === category;
            const isHovered = this.hoveredButton === i;
            
            this.renderFilterButton(
                context,
                currentX,
                buttonY,
                buttonWidth,
                this.buttonHeight,
                label,
                isActive,
                isHovered
            );
            
            currentX += buttonWidth + this.buttonSpacing;
            
            // 行を超える場合は改行（将来の拡張）
            if (currentX + buttonWidth > x + width - 10) {
                break; // 現在は1行のみ対応
            }
        }
        
        return filterHeight;
    }
    
    /**
     * フィルターボタンを描画
     */
    renderFilterButton(context, x, y, width, height, label, isActive, isHovered) {
        // ボタン背景色を決定
        let backgroundColor = this.textSettings.backgroundColor;
        let textColor = this.textSettings.textColor;
        let borderColor = this.textSettings.borderColor;
        
        if (isActive) {
            backgroundColor = this.textSettings.activeBackgroundColor;
            textColor = this.textSettings.activeTextColor;
            borderColor = this.textSettings.activeBorderColor;
        } else if (isHovered) {
            backgroundColor = '#E9ECEF';
        }
        
        // ボタン背景
        context.fillStyle = backgroundColor;
        context.fillRect(x, y, width, height);
        
        // ボタン枠線
        context.strokeStyle = borderColor;
        context.lineWidth = isActive ? 2 : 1;
        context.strokeRect(x, y, width, height);
        
        // ボタンテキスト
        context.fillStyle = textColor;
        context.font = this.textSettings.font;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(label, x + width / 2, y + height / 2);
    }
    
    /**
     * クリック処理
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @param {Array<string>} categories - カテゴリ一覧
     * @param {Array<string>} categoryLabels - カテゴリラベル一覧
     * @returns {boolean} - クリックが処理された場合true
     */
    handleClick(x, y, categories, categoryLabels) {
        const buttonWidth = 120;
        const buttonY = 5;
        
        if (y >= buttonY && y <= buttonY + this.buttonHeight) {
            let currentX = 10;
            
            for (let i = 0; i < categories.length; i++) {
                if (x >= currentX && x <= currentX + buttonWidth) {
                    this.eventBus.emit('achievement-category-changed', {
                        category: categories[i],
                        label: categoryLabels[i],
                        index: i
                    });
                    return true;
                }
                
                currentX += buttonWidth + this.buttonSpacing;
            }
        }
        
        return false;
    }
    
    /**
     * ホバー処理
     * @param {number} x - マウスX座標
     * @param {number} y - マウスY座標
     * @param {Array<string>} categories - カテゴリ一覧
     */
    handleHover(x, y, categories) {
        const buttonWidth = 120;
        const buttonY = 5;
        
        this.hoveredButton = -1;
        
        if (y >= buttonY && y <= buttonY + this.buttonHeight) {
            let currentX = 10;
            
            for (let i = 0; i < categories.length; i++) {
                if (x >= currentX && x <= currentX + buttonWidth) {
                    this.hoveredButton = i;
                    break;
                }
                
                currentX += buttonWidth + this.buttonSpacing;
            }
        }
    }
    
    /**
     * フレーム更新処理
     */
    update(deltaTime) {
        // 現在は特に処理なし
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.hoveredButton = -1;
        this.isInitialized = false;
    }
}

/**
 * 実績進捗レンダラーコンポーネント
 * 進捗バーの描画を専門に担当
 */
class AchievementProgressRenderer {
    constructor(gameEngine, eventBus, state) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
        
        this.isInitialized = false;
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.isInitialized = true;
    }
    
    /**
     * 拡張進捗バーを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {Object} progress - 進捗データ
     */
    renderEnhancedProgressBar(context, x, y, width, progress) {
        const barHeight = 8;
        const current = progress.current || 0;
        const target = progress.target || 1;
        const percentage = Math.min(100, (current / target) * 100);
        
        // 背景（グラデーション）
        const bgGradient = context.createLinearGradient(x, y, x, y + barHeight);
        bgGradient.addColorStop(0, '#2a2a2a');
        bgGradient.addColorStop(1, '#1a1a1a');
        context.fillStyle = bgGradient;
        context.fillRect(x, y, width, barHeight);
        
        // 枠線
        context.strokeStyle = '#555';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, barHeight);
        
        // 進捗（グラデーション）
        const fillWidth = (percentage / 100) * width;
        if (fillWidth > 0) {
            const progressGradient = context.createLinearGradient(x, y, x, y + barHeight);
            if (percentage >= 100) {
                progressGradient.addColorStop(0, '#4CAF50');
                progressGradient.addColorStop(1, '#2E7D32');
            } else {
                progressGradient.addColorStop(0, '#64B5F6');
                progressGradient.addColorStop(1, '#1976D2');
            }
            context.fillStyle = progressGradient;
            context.fillRect(x, y, fillWidth, barHeight);
        }
        
        // 進捗テキスト
        context.fillStyle = '#ffffff';
        context.font = '11px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText(`${current}/${target} (${percentage.toFixed(0)}%)`, x + width / 2, y + barHeight + 2);
    }
    
    /**
     * 基本進捗バーを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {Object} progress - 進捗データ
     */
    renderProgressBar(context, x, y, width, progress) {
        const barHeight = 6;
        const current = progress.current || 0;
        const target = progress.target || 1;
        const percentage = Math.min(100, (current / target) * 100);
        
        // 背景
        context.fillStyle = '#333';
        context.fillRect(x, y, width, barHeight);
        
        // 進捗
        const fillWidth = (percentage / 100) * width;
        context.fillStyle = percentage >= 100 ? '#00aa00' : '#4a90e2';
        context.fillRect(x, y, fillWidth, barHeight);
        
        // 進捗テキスト
        context.fillStyle = '#ffffff';
        context.font = '11px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText(`${current}/${target} (${percentage.toFixed(0)}%)`, x + width / 2, y + barHeight + 2);
    }
    
    /**
     * フレーム更新処理
     */
    update(deltaTime) {
        // アニメーション処理（将来の拡張）
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.isInitialized = false;
    }
}

/**
 * 実績レンダラーコンポーネント
 * 実績リストの描画を専門に担当
 */
class AchievementsRenderer {
    constructor(gameEngine, eventBus, state) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
        
        this.progressRenderer = null;
        this.itemHeight = 80;
        this.itemSpacing = 10;
        
        this.textSettings = {
            sectionTitleFont: '20px bold sans-serif',
            achievementNameFont: '16px bold sans-serif',
            achievementDescFont: '14px sans-serif',
            rewardFont: '12px sans-serif',
            dateFont: '12px sans-serif',
            unlockedColor: '#4CAF50',
            progressColor: '#FF9800',
            textColor: '#FFFFFF',
            subTextColor: '#CCCCCC',
            disabledColor: '#999999'
        };
        
        this.isInitialized = false;
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.progressRenderer = new AchievementProgressRenderer(this.gameEngine, this.eventBus, this.state);
        this.progressRenderer.initialize();
        
        this.applyAccessibilitySettings();
        this.isInitialized = true;
    }
    
    /**
     * アクセシビリティ設定を適用
     */
    applyAccessibilitySettings() {
        const settings = this.state.accessibilitySettings || {};
        
        if (settings.largeText) {
            this.textSettings.sectionTitleFont = '24px bold sans-serif';
            this.textSettings.achievementNameFont = '18px bold sans-serif';
            this.textSettings.achievementDescFont = '16px sans-serif';
            this.textSettings.rewardFont = '14px sans-serif';
            this.textSettings.dateFont = '14px sans-serif';
        }
        
        if (settings.highContrast) {
            this.textSettings.unlockedColor = '#000000';
            this.textSettings.progressColor = '#000000';
            this.textSettings.textColor = '#000000';
            this.textSettings.subTextColor = '#000000';
            this.textSettings.disabledColor = '#000000';
        }
    }
    
    /**
     * 解除済み実績セクションを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {Array} achievements - 実績データ
     * @returns {number} - 描画した高さ
     */
    renderUnlockedSection(context, x, y, width, achievements) {
        let currentY = y;
        
        // セクションタイトル
        context.fillStyle = this.textSettings.unlockedColor;
        context.font = this.textSettings.sectionTitleFont;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('解除済み実績', x, currentY);
        currentY += 35;
        
        // 実績アイテムを描画
        for (const achievement of achievements) {
            currentY = this.renderAchievementItem(context, x, currentY, width, achievement, true);
            currentY += this.itemSpacing;
        }
        
        return currentY - y;
    }
    
    /**
     * 進行中実績セクションを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {Array} achievements - 実績データ
     * @returns {number} - 描画した高さ
     */
    renderProgressSection(context, x, y, width, achievements) {
        let currentY = y;
        
        // セクションタイトル
        context.fillStyle = this.textSettings.progressColor;
        context.font = this.textSettings.sectionTitleFont;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('進行中の実績', x, currentY);
        currentY += 35;
        
        // 実績アイテムを描画
        for (const achievement of achievements) {
            currentY = this.renderAchievementItem(context, x, currentY, width, achievement, false);
            currentY += this.itemSpacing;
        }
        
        return currentY - y;
    }
    
    /**
     * 実績アイテムを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {Object} achievement - 実績データ
     * @param {boolean} isUnlocked - 解除済みかどうか
     * @returns {number} - 次のY座標
     */
    renderAchievementItem(context, x, y, width, achievement, isUnlocked) {
        // 背景
        context.fillStyle = isUnlocked ? '#2E7D32' : '#1976D2';
        if (this.state.accessibilitySettings.highContrast) {
            context.fillStyle = isUnlocked ? '#000000' : '#FFFFFF';
        }
        context.fillRect(x, y, width, this.itemHeight);
        
        // 枠線
        context.strokeStyle = isUnlocked ? this.textSettings.unlockedColor : this.textSettings.progressColor;
        if (this.state.accessibilitySettings.highContrast) {
            context.strokeStyle = '#000000';
        }
        context.lineWidth = 2;
        context.strokeRect(x, y, width, this.itemHeight);
        
        // アイコン
        context.fillStyle = this.textSettings.textColor;
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(achievement.icon || '🏆', x + 30, y + this.itemHeight / 2);
        
        // 実績名
        context.fillStyle = this.textSettings.textColor;
        context.font = this.textSettings.achievementNameFont;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText(achievement.name, x + 60, y + 15);
        
        // 実績説明
        context.fillStyle = this.textSettings.subTextColor;
        context.font = this.textSettings.achievementDescFont;
        context.fillText(achievement.description, x + 60, y + 35);
        
        // 報酬AP
        if (achievement.reward && achievement.reward.ap) {
            context.fillStyle = '#FFD700';
            if (this.state.accessibilitySettings.highContrast) {
                context.fillStyle = '#000000';
            }
            context.font = this.textSettings.rewardFont;
            context.textAlign = 'right';
            context.fillText(`${achievement.reward.ap} AP`, x + width - 10, y + 15);
        }
        
        // 進捗バー（未解除実績のみ）
        if (!isUnlocked && achievement.progress) {
            this.progressRenderer.renderEnhancedProgressBar(
                context, 
                x + 60, 
                y + 55, 
                width - 150, 
                achievement.progress
            );
        }
        
        // 獲得日時（解除済み実績のみ）
        if (isUnlocked && achievement.unlockedDate) {
            context.fillStyle = this.textSettings.subTextColor;
            context.font = this.textSettings.dateFont;
            context.textAlign = 'right';
            context.textBaseline = 'top';
            const date = new Date(achievement.unlockedDate).toLocaleDateString('ja-JP');
            context.fillText(date, x + width - 10, y + 35);
        }
        
        return y + this.itemHeight;
    }
    
    /**
     * フレーム更新処理
     */
    update(deltaTime) {
        if (this.progressRenderer) {
            this.progressRenderer.update(deltaTime);
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        if (this.progressRenderer) {
            this.progressRenderer.cleanup();
        }
        this.isInitialized = false;
    }
}