/**
 * ユーザー情報画面シーン
 */
import { Scene } from '../core/Scene.js';

export class UserInfoScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        
        // タブ状態管理
        this.currentTab = 'statistics'; // 'statistics', 'achievements', 'management'
        this.tabs = ['statistics', 'achievements', 'management'];
        this.tabLabels = ['統計', '実績', '管理'];
        
        // ダイアログ状態管理
        this.showingDialog = null; // null, 'username', 'export', 'import'
        this.dialogData = {};
        
        // UI状態管理
        this.scrollPosition = 0;
        this.selectedItem = -1;
        this.focusedElement = 0; // キーボードナビゲーション用
        
        // レイアウト設定
        this.tabHeight = 60;
        this.headerHeight = 120;
        this.contentPadding = 20;
        
        // 統計・実績データ
        this.statisticsData = null;
        this.achievementsData = null;
        
        // エラーハンドリング
        this.errorMessage = null;
        this.errorTimeout = null;
    }

    enter() {
        console.log('User info scene entered');
        
        // データを初期化
        this.loadUserData();
        
        // フォーカスをリセット
        this.focusedElement = 0;
        this.scrollPosition = 0;
    }

    exit() {
        console.log('User info scene exited');
        
        // エラータイマーをクリア
        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
            this.errorTimeout = null;
        }
    }

    update(deltaTime) {
        // 定期的にデータを更新（5秒間隔）
        if (!this.lastDataUpdate || Date.now() - this.lastDataUpdate > 5000) {
            this.loadUserData();
            this.lastDataUpdate = Date.now();
        }
    }

    render(context) {
        try {
            const canvas = this.gameEngine.canvas;
            
            // Clear background
            context.fillStyle = '#001122';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            // タイトルを描画
            this.renderTitle(context);
            
            // タブを描画
            this.renderTabs(context);
            
            // コンテンツを描画
            this.renderContent(context);
            
            // エラーメッセージを描画
            if (this.errorMessage) {
                this.renderErrorMessage(context);
            }
            
            // 戻るボタンを描画
            this.renderBackButton(context);
            
        } catch (error) {
            console.error('UserInfoScene render error:', error);
            this.showError('描画エラーが発生しました');
        }
    }

    handleInput(event) {
        try {
            if (event.type === 'click') {
                this.handleClick(event);
            } else if (event.type === 'keydown') {
                this.handleKeyboard(event);
            }
        } catch (error) {
            console.error('UserInfoScene input error:', error);
            this.showError('入力処理エラーが発生しました');
        }
    }

    /**
     * ユーザーデータを読み込む
     */
    loadUserData() {
        try {
            // StatisticsManagerから統計データを取得
            if (this.gameEngine.statisticsManager) {
                this.statisticsData = this.gameEngine.statisticsManager.getDetailedStatistics();
            }
            
            // AchievementManagerから実績データを取得
            if (this.gameEngine.achievementManager) {
                this.achievementsData = this.gameEngine.achievementManager.getAchievements();
            }
            
            this.errorMessage = null;
        } catch (error) {
            console.error('Failed to load user data:', error);
            this.showError('データの読み込みに失敗しました');
        }
    }

    /**
     * タイトルを描画
     */
    renderTitle(context) {
        const canvas = this.gameEngine.canvas;
        
        context.fillStyle = '#ffffff';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.fillText('ユーザー情報', canvas.width / 2, 50);
    }

    /**
     * タブを描画
     */
    renderTabs(context) {
        const canvas = this.gameEngine.canvas;
        const tabWidth = canvas.width / this.tabs.length;
        const tabY = this.headerHeight - this.tabHeight;
        
        for (let i = 0; i < this.tabs.length; i++) {
            const tabX = i * tabWidth;
            const isActive = this.tabs[i] === this.currentTab;
            const isFocused = this.focusedElement === i;
            
            // タブ背景
            context.fillStyle = isActive ? '#4a90e2' : '#1a1a2e';
            if (isFocused) {
                context.fillStyle = isActive ? '#6bb0ff' : '#2a2a3e';
            }
            context.fillRect(tabX, tabY, tabWidth, this.tabHeight);
            
            // タブ枠線
            context.strokeStyle = '#333';
            context.lineWidth = 1;
            context.strokeRect(tabX, tabY, tabWidth, this.tabHeight);
            
            // タブテキスト
            context.fillStyle = '#ffffff';
            context.font = '18px Arial';
            context.textAlign = 'center';
            context.fillText(
                this.tabLabels[i], 
                tabX + tabWidth / 2, 
                tabY + this.tabHeight / 2 + 6
            );
        }
    }

    /**
     * コンテンツを描画
     */
    renderContent(context) {
        const canvas = this.gameEngine.canvas;
        const contentY = this.headerHeight;
        const contentHeight = canvas.height - contentY - 80; // 戻るボタン分を除く
        
        // コンテンツエリアの背景
        context.fillStyle = '#1a1a2e';
        context.fillRect(0, contentY, canvas.width, contentHeight);
        
        // 現在のタブに応じてコンテンツを描画
        switch (this.currentTab) {
            case 'statistics':
                this.renderStatistics(context, contentY, contentHeight);
                break;
            case 'achievements':
                this.renderAchievements(context, contentY, contentHeight);
                break;
            case 'management':
                this.renderUserManagement(context, contentY, contentHeight);
                break;
        }
    }

    /**
     * 統計データを描画
     */
    renderStatistics(context, y, height) {
        if (!this.statisticsData) {
            context.fillStyle = '#cccccc';
            context.font = '20px Arial';
            context.textAlign = 'center';
            context.fillText('まだ記録がありません', 
                this.gameEngine.canvas.width / 2, y + height / 2);
            return;
        }
        
        const canvas = this.gameEngine.canvas;
        const contentWidth = canvas.width - this.contentPadding * 2;
        const sectionHeight = 180;
        const columnWidth = contentWidth / 2;
        
        // スクロール対応
        const scrollOffset = this.scrollPosition;
        
        let currentY = y + this.contentPadding - scrollOffset;
        
        // 基本統計セクション
        currentY = this.renderBasicStatsSection(context, this.contentPadding, currentY, columnWidth, sectionHeight);
        
        // 泡統計セクション
        currentY = this.renderBubbleStatsSection(context, this.contentPadding + columnWidth, currentY - sectionHeight - 20, columnWidth, sectionHeight);
        
        // コンボ統計セクション
        currentY = this.renderComboStatsSection(context, this.contentPadding, currentY, columnWidth, sectionHeight);
        
        // ステージ統計セクション
        this.renderStageStatsSection(context, this.contentPadding + columnWidth, currentY - sectionHeight - 20, columnWidth, sectionHeight);
    }

    /**
     * 基本統計セクションを描画
     */
    renderBasicStatsSection(context, x, y, width, height) {
        if (!this.statisticsData || !this.statisticsData.basic) {
            return y + height + 20;
        }
        
        const basic = this.statisticsData.basic;
        
        // セクション背景
        context.fillStyle = '#1a1a2e';
        context.fillRect(x, y, width - 10, height);
        
        // セクション枠線
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(x, y, width - 10, height);
        
        // セクションタイトル
        context.fillStyle = '#4a90e2';
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillText('基本統計', x + 15, y + 25);
        
        // 統計項目を描画
        const items = [
            { label: '総プレイ回数', value: `${basic.totalGamesPlayed}回` },
            { label: '総プレイ時間', value: basic.totalPlayTime },
            { label: '総スコア', value: basic.totalScore.toLocaleString() },
            { label: '最高スコア', value: basic.highestScore.toLocaleString() },
            { label: '平均スコア', value: basic.averageScore.toLocaleString() },
            { label: '完了率', value: `${isNaN(basic.completionRate) ? 0 : basic.completionRate.toFixed(1)}%` }
        ];
        
        context.font = '14px Arial';
        let itemY = y + 50;
        const lineHeight = 20;
        
        for (const item of items) {
            // ラベル
            context.fillStyle = '#cccccc';
            context.textAlign = 'left';
            context.fillText(item.label, x + 15, itemY);
            
            // 値
            context.fillStyle = '#ffffff';
            context.textAlign = 'right';
            context.fillText(item.value, x + width - 25, itemY);
            
            itemY += lineHeight;
        }
        
        return y + height + 20;
    }

    /**
     * 泡統計セクションを描画
     */
    renderBubbleStatsSection(context, x, y, width, height) {
        if (!this.statisticsData || !this.statisticsData.bubbles) {
            return y + height + 20;
        }
        
        const bubbles = this.statisticsData.bubbles;
        
        // セクション背景
        context.fillStyle = '#1a1a2e';
        context.fillRect(x, y, width - 10, height);
        
        // セクション枠線
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(x, y, width - 10, height);
        
        // セクションタイトル
        context.fillStyle = '#4a90e2';
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillText('泡統計', x + 15, y + 25);
        
        // 基本泡統計
        const items = [
            { label: '総破壊数', value: bubbles.totalPopped.toLocaleString() },
            { label: '総未破壊数', value: bubbles.totalMissed.toLocaleString() },
            { label: '精度', value: bubbles.accuracy },
            { label: '平均反応時間', value: bubbles.averageReactionTime },
            { label: 'お気に入り泡', value: this.getBubbleTypeName(bubbles.favoriteType?.type) || 'なし' }
        ];
        
        context.font = '14px Arial';
        let itemY = y + 50;
        const lineHeight = 18;
        
        for (let i = 0; i < Math.min(5, items.length); i++) {
            const item = items[i];
            
            // ラベル
            context.fillStyle = '#cccccc';
            context.textAlign = 'left';
            context.fillText(item.label, x + 15, itemY);
            
            // 値
            context.fillStyle = '#ffffff';
            context.textAlign = 'right';
            context.fillText(item.value, x + width - 25, itemY);
            
            itemY += lineHeight;
        }
        
        // 泡タイプ別詳細（上位3つ）
        if (bubbles.typeBreakdown && Object.keys(bubbles.typeBreakdown).length > 0) {
            // 小見出し
            context.fillStyle = '#4a90e2';
            context.font = 'bold 14px Arial';
            context.textAlign = 'left';
            context.fillText('上位泡タイプ', x + 15, itemY + 10);
            
            // 泡タイプをソート
            const sortedTypes = Object.entries(bubbles.typeBreakdown)
                .filter(([type, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);
            
            context.font = '12px Arial';
            itemY += 30;
            const typeLineHeight = 16;
            
            for (const [type, count] of sortedTypes) {
                // 泡タイプ名
                context.fillStyle = '#cccccc';
                context.textAlign = 'left';
                const typeName = this.getBubbleTypeName(type);
                context.fillText(typeName, x + 15, itemY);
                
                // カウント
                context.fillStyle = '#ffffff';
                context.textAlign = 'right';
                context.fillText(count.toLocaleString(), x + width - 25, itemY);
                
                itemY += typeLineHeight;
            }
        }
        
        return y + height + 20;
    }

    /**
     * 泡タイプの日本語名を取得
     */
    getBubbleTypeName(type) {
        const typeNames = {
            normal: '通常',
            stone: '石',
            iron: '鉄',
            diamond: 'ダイヤ',
            pink: 'ピンク',
            poison: '毒',
            spiky: 'トゲ',
            rainbow: '虹',
            clock: '時計',
            score: 'スコア',
            electric: '電気',
            escaping: '逃走',
            cracked: 'ひび',
            boss: 'ボス',
            golden: '金',
            frozen: '氷',
            magnetic: '磁力',
            explosive: '爆発',
            phantom: '幻影',
            multiplier: '倍率'
        };
        
        return typeNames[type] || type || 'unknown';
    }

    /**
     * コンボ統計セクションを描画（プレースホルダー）
     */
    renderComboStatsSection(context, x, y, width, height) {
        // セクション背景
        context.fillStyle = '#1a1a2e';
        context.fillRect(x, y, width - 10, height);
        
        // セクション枠線
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(x, y, width - 10, height);
        
        // セクションタイトル
        context.fillStyle = '#4a90e2';
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillText('コンボ統計', x + 15, y + 25);
        
        // プレースホルダーテキスト
        context.fillStyle = '#cccccc';
        context.font = '14px Arial';
        context.fillText('実装中...', x + 15, y + 50);
        
        return y + height + 20;
    }

    /**
     * ステージ統計セクションを描画（プレースホルダー）
     */
    renderStageStatsSection(context, x, y, width, height) {
        // セクション背景
        context.fillStyle = '#1a1a2e';
        context.fillRect(x, y, width - 10, height);
        
        // セクション枠線
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(x, y, width - 10, height);
        
        // セクションタイトル
        context.fillStyle = '#4a90e2';
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillText('ステージ統計', x + 15, y + 25);
        
        // プレースホルダーテキスト
        context.fillStyle = '#cccccc';
        context.font = '14px Arial';
        context.fillText('実装中...', x + 15, y + 50);
        
        return y + height + 20;
    }

    /**
     * 実績データを描画
     */
    renderAchievements(context, y, height) {
        if (!this.achievementsData) {
            context.fillStyle = '#cccccc';
            context.font = '20px Arial';
            context.textAlign = 'center';
            context.fillText('実績データがありません', 
                this.gameEngine.canvas.width / 2, y + height / 2);
            return;
        }
        
        // プレースホルダー実装
        context.fillStyle = '#ffffff';
        context.font = '18px Arial';
        context.textAlign = 'left';
        context.fillText('実績情報（実装中）', this.contentPadding, y + 40);
    }

    /**
     * ユーザー管理画面を描画
     */
    renderUserManagement(context, y, height) {
        context.fillStyle = '#ffffff';
        context.font = '18px Arial';
        context.textAlign = 'left';
        context.fillText('ユーザー管理（実装中）', this.contentPadding, y + 40);
    }

    /**
     * 戻るボタンを描画
     */
    renderBackButton(context) {
        const canvas = this.gameEngine.canvas;
        const buttonY = canvas.height - 70;
        const isFocused = this.focusedElement === this.tabs.length;
        
        context.fillStyle = isFocused ? '#6bb0ff' : '#4a90e2';
        context.fillRect(50, buttonY, 120, 50);
        
        context.fillStyle = '#ffffff';
        context.font = '18px Arial';
        context.textAlign = 'center';
        context.fillText('戻る', 110, buttonY + 30);
    }

    /**
     * エラーメッセージを描画
     */
    renderErrorMessage(context) {
        const canvas = this.gameEngine.canvas;
        
        // 背景
        context.fillStyle = 'rgba(204, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, 60);
        
        // エラーテキスト
        context.fillStyle = '#ffffff';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText(this.errorMessage, canvas.width / 2, 35);
    }

    /**
     * クリック処理
     */
    handleClick(event) {
        const canvas = this.gameEngine.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // タブクリック処理
        if (y >= this.headerHeight - this.tabHeight && y <= this.headerHeight) {
            const tabIndex = Math.floor(x / (canvas.width / this.tabs.length));
            if (tabIndex >= 0 && tabIndex < this.tabs.length) {
                this.switchTab(this.tabs[tabIndex]);
                this.focusedElement = tabIndex;
                return;
            }
        }
        
        // 戻るボタンクリック処理
        if (x >= 50 && x <= 170 && y >= canvas.height - 70 && y <= canvas.height - 20) {
            this.sceneManager.switchScene('menu');
            return;
        }
    }

    /**
     * キーボード処理
     */
    handleKeyboard(event) {
        switch (event.key) {
            case 'Escape':
                this.sceneManager.switchScene('menu');
                break;
            case 'ArrowLeft':
                this.navigateTab(-1);
                break;
            case 'ArrowRight':
                this.navigateTab(1);
                break;
            case 'Tab':
                event.preventDefault();
                this.navigateFocus(event.shiftKey ? -1 : 1);
                break;
            case 'Enter':
                this.activateFocusedElement();
                break;
        }
    }

    /**
     * タブを切り替える
     */
    switchTab(tabName) {
        if (this.tabs.includes(tabName)) {
            this.currentTab = tabName;
            this.scrollPosition = 0;
            this.selectedItem = -1;
        }
    }

    /**
     * タブナビゲーション
     */
    navigateTab(direction) {
        if (this.focusedElement < this.tabs.length) {
            const currentIndex = this.tabs.indexOf(this.currentTab);
            const newIndex = (currentIndex + direction + this.tabs.length) % this.tabs.length;
            this.switchTab(this.tabs[newIndex]);
            this.focusedElement = newIndex;
        }
    }

    /**
     * フォーカスナビゲーション
     */
    navigateFocus(direction) {
        const maxFocus = this.tabs.length; // タブ数 + 戻るボタン
        this.focusedElement = (this.focusedElement + direction + maxFocus + 1) % (maxFocus + 1);
    }

    /**
     * フォーカスされた要素を実行
     */
    activateFocusedElement() {
        if (this.focusedElement < this.tabs.length) {
            this.switchTab(this.tabs[this.focusedElement]);
        } else if (this.focusedElement === this.tabs.length) {
            this.sceneManager.switchScene('menu');
        }
    }

    /**
     * エラーメッセージを表示
     */
    showError(message) {
        this.errorMessage = message;
        
        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
        }
        
        this.errorTimeout = setTimeout(() => {
            this.errorMessage = null;
            this.errorTimeout = null;
        }, 3000);
    }
}