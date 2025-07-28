/**
 * ユーザー情報画面シーン
 */
import { Scene } from '../core/Scene.js';
import { AchievementStatsUI } from '../core/AchievementStatsUI.js';
import { AchievementHelpSystem } from '../ui/AchievementHelpSystem.js';

export class UserInfoScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        
        // タブ状態管理
        this.currentTab = 'statistics'; // 'statistics', 'achievements', 'management', 'help'
        this.tabs = ['statistics', 'achievements', 'management', 'help'];
        this.tabLabels = ['統計', '実績', '管理', 'ヘルプ'];
        
        // 実績カテゴリフィルター
        this.achievementCategories = ['all', 'score', 'play', 'technique', 'collection', 'special'];
        this.achievementCategoryLabels = ['全て', 'スコア系', 'プレイ系', 'テクニック系', 'コレクション系', '特殊'];
        this.currentAchievementCategory = 'all';
        
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
        
        // ヘルプシステム
        this.helpSystem = null;
        
        // エラーハンドリング
        this.errorMessage = null;
        this.errorTimeout = null;
        
        // アクセシビリティ設定
        this.accessibilitySettings = {
            highContrast: false,
            largeText: false,
            reducedMotion: false
        };
        
        // アクセシビリティ設定を読み込み
        this.loadAccessibilitySettings();
        
        // 実績統計UI
        this.achievementStatsUI = null;
        
        // ヘルプシステム初期化
        this.initializeHelpSystem();
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
            
            // ヘルプシステムを描画
            if (this.helpSystem) {
                this.helpSystem.render(context, canvas);
            }
            
        } catch (error) {
            console.error('UserInfoScene render error:', error);
            this.showError('描画エラーが発生しました');
        }
    }

    handleInput(event) {
        try {
            // ヘルプシステムが入力を処理する場合は早期リターン
            if (this.helpSystem && event.type === 'click') {
                const canvas = this.gameEngine.canvas;
                const rect = canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                
                if (this.helpSystem.handleClick(x, y, canvas)) {
                    return; // ヘルプシステムが処理した場合
                }
            }
            
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
                this.achievementsByCategory = this.gameEngine.achievementManager.getAchievementsByCategory();
                
                // 実績統計UIを初期化（遅延初期化）
                if (!this.achievementStatsUI) {
                    this.achievementStatsUI = new AchievementStatsUI(this.gameEngine.achievementManager);
                }
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
            case 'help':
                this.renderHelp(context, contentY, contentHeight);
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
        
        // レスポンシブレイアウト判定
        const layout = this.getResponsiveLayout(canvas.width);
        
        // スクロール対応
        const scrollOffset = this.scrollPosition;
        let currentY = y + this.contentPadding - scrollOffset;
        
        if (layout.columns === 1) {
            // 小画面: 1列レイアウト
            currentY = this.renderBasicStatsSection(context, this.contentPadding, currentY, contentWidth, sectionHeight);
            currentY = this.renderBubbleStatsSection(context, this.contentPadding, currentY + 20, contentWidth, sectionHeight);
            currentY = this.renderComboStatsSection(context, this.contentPadding, currentY + 20, contentWidth, sectionHeight);
            currentY = this.renderStageStatsSection(context, this.contentPadding, currentY + 20, contentWidth, sectionHeight);
            
            // 実績統計セクションを追加
            if (this.achievementStatsUI) {
                currentY = this.renderAchievementStatsSection(context, this.contentPadding, currentY + 20, contentWidth);
            }
        } else {
            // 中画面・大画面: 2列レイアウト
            const columnWidth = contentWidth / 2;
            currentY = this.renderBasicStatsSection(context, this.contentPadding, currentY, columnWidth, sectionHeight);
            currentY = this.renderBubbleStatsSection(context, this.contentPadding + columnWidth, currentY - sectionHeight - 20, columnWidth, sectionHeight);
            currentY = this.renderComboStatsSection(context, this.contentPadding, currentY, columnWidth, sectionHeight);
            currentY = this.renderStageStatsSection(context, this.contentPadding + columnWidth, currentY - sectionHeight - 20, columnWidth, sectionHeight);
            
            // 実績統計セクションを追加（フルワイド）
            if (this.achievementStatsUI) {
                currentY = this.renderAchievementStatsSection(context, this.contentPadding, currentY + 20, contentWidth);
            }
        }
    }

    /**
     * レスポンシブレイアウト設定を取得
     */
    getResponsiveLayout(screenWidth) {
        if (screenWidth < 600) {
            return { columns: 1, fontSize: 'small' };
        } else if (screenWidth < 800) {
            return { columns: 2, fontSize: 'medium' };
        } else {
            return { columns: 2, fontSize: 'large' };
        }
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
     * コンボ統計セクションを描画
     */
    renderComboStatsSection(context, x, y, width, height) {
        if (!this.statisticsData || !this.statisticsData.combos) {
            return y + height + 20;
        }
        
        const combos = this.statisticsData.combos;
        
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
        
        // コンボ統計項目
        const items = [
            { label: '最高コンボ', value: `${combos.highestCombo}連鎖` },
            { label: '平均コンボ', value: `${combos.averageCombo}連鎖` },
            { label: '総コンボ数', value: combos.totalCombos.toLocaleString() },
            { label: 'コンボブレイク', value: combos.comboBreaks.toLocaleString() },
            { label: 'コンボ成功率', value: combos.comboSuccessRate }
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
        
        // コンボ成功率の視覚的表示
        if (combos.totalCombos > 0) {
            const successRate = parseFloat(combos.comboSuccessRate);
            const barY = itemY + 10;
            const barWidth = width - 50;
            const barHeight = 8;
            
            // プログレスバー背景
            context.fillStyle = '#333';
            context.fillRect(x + 15, barY, barWidth, barHeight);
            
            // プログレスバー（成功率）
            const fillWidth = (successRate / 100) * barWidth;
            const color = successRate >= 70 ? '#00aa00' : successRate >= 40 ? '#cc6600' : '#cc0000';
            context.fillStyle = color;
            context.fillRect(x + 15, barY, fillWidth, barHeight);
            
            // パーセンテージテキスト
            context.fillStyle = '#ffffff';
            context.font = '12px Arial';
            context.textAlign = 'center';
            context.fillText(`${successRate}%`, x + 15 + barWidth / 2, barY + barHeight + 15);
        }
        
        return y + height + 20;
    }

    /**
     * ステージ統計セクションを描画
     */
    renderStageStatsSection(context, x, y, width, height) {
        if (!this.statisticsData || !this.statisticsData.stages) {
            return y + height + 20;
        }
        
        const stages = this.statisticsData.stages;
        
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
        
        // ステージ統計項目
        const totalStages = stages.completed + stages.failed;
        const clearRate = totalStages > 0 ? (stages.completed / totalStages * 100).toFixed(1) : 0;
        
        const items = [
            { label: 'クリア数', value: `${stages.completed}回` },
            { label: '失敗数', value: `${stages.failed}回` },
            { label: 'クリア率', value: `${clearRate}%` },
            { label: 'お気に入り', value: this.getStageName(stages.favoriteStage?.stage) || 'なし' }
        ];
        
        context.font = '14px Arial';
        let itemY = y + 50;
        const lineHeight = 18;
        
        for (let i = 0; i < Math.min(4, items.length); i++) {
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
        
        // ステージ別詳細（上位3つ）
        if (stages.stageBreakdown && Object.keys(stages.stageBreakdown).length > 0) {
            // 小見出し
            context.fillStyle = '#4a90e2';
            context.font = 'bold 14px Arial';
            context.textAlign = 'left';
            context.fillText('上位ステージ', x + 15, itemY + 10);
            
            // ステージをプレイ回数でソート
            const sortedStages = Object.entries(stages.stageBreakdown)
                .filter(([stage, data]) => data.played > 0)
                .sort((a, b) => b[1].played - a[1].played)
                .slice(0, 3);
            
            context.font = '12px Arial';
            itemY += 30;
            const stageLineHeight = 16;
            
            for (const [stage, data] of sortedStages) {
                // ステージ名
                context.fillStyle = '#cccccc';
                context.textAlign = 'left';
                const stageName = this.getStageName(stage);
                context.fillText(stageName, x + 15, itemY);
                
                // プレイ回数
                context.fillStyle = '#ffffff';
                context.textAlign = 'right';
                context.fillText(`${data.played}回`, x + width - 25, itemY);
                
                itemY += stageLineHeight;
            }
        }
        
        return y + height + 20;
    }

    /**
     * ステージ名の日本語名を取得
     */
    getStageName(stage) {
        const stageNames = {
            tutorial: 'チュートリアル',
            normal: '通常',
            hard: 'ハード',
            extreme: 'エクストリーム',
            bonus: 'ボーナス',
            challenge: 'チャレンジ',
            special: 'スペシャル',
            endless: 'エンドレス',
            awaputi: 'アワプチ',
            mixed: 'ミックス'
        };
        
        return stageNames[stage] || stage || 'unknown';
    }

    /**
     * 実績データを描画
     */
    renderAchievements(context, y, height) {
        if (!this.achievementsData || !Array.isArray(this.achievementsData)) {
            context.fillStyle = '#cccccc';
            context.font = '20px Arial';
            context.textAlign = 'center';
            context.fillText('実績データがありません', 
                this.gameEngine.canvas.width / 2, y + height / 2);
            return;
        }
        
        // カテゴリフィルターを描画
        y = this.renderAchievementCategoryFilter(context, y);
        height -= 50; // フィルター分の高さを減算
        
        const canvas = this.gameEngine.canvas;
        const contentWidth = canvas.width - this.contentPadding * 2;
        const achievementHeight = 80;
        const spacing = 10;
        
        // スクロール対応
        const scrollOffset = this.scrollPosition;
        let currentY = y + this.contentPadding - scrollOffset;
        
        // カテゴリフィルターを適用
        const filteredAchievements = this.getFilteredAchievements();
        
        // 解除済み実績と未解除実績を分離
        const unlockedAchievements = filteredAchievements.filter(a => a.unlocked);
        const lockedAchievements = filteredAchievements.filter(a => !a.unlocked);
        
        // 解除済み実績セクション
        if (unlockedAchievements.length > 0) {
            currentY = this.renderUnlockedAchievements(context, this.contentPadding, currentY, contentWidth, unlockedAchievements);
        }
        
        // 未解除実績セクション
        if (lockedAchievements.length > 0) {
            currentY = this.renderProgressAchievements(context, this.contentPadding, currentY + 20, contentWidth, lockedAchievements);
        }
    }

    /**
     * 解除済み実績を描画
     */
    renderUnlockedAchievements(context, x, y, width, achievements) {
        // セクションタイトル
        context.fillStyle = '#00aa00';
        context.font = 'bold 20px Arial';
        context.textAlign = 'left';
        context.fillText('解除済み実績', x, y + 25);
        
        let currentY = y + 40;
        const achievementHeight = 70;
        const spacing = 10;
        
        for (const achievement of achievements) {
            currentY = this.renderAchievementItem(context, x, currentY, width, achievement, true);
            currentY += spacing;
        }
        
        return currentY;
    }

    /**
     * 未解除実績の進捗を描画
     */
    renderProgressAchievements(context, x, y, width, achievements) {
        // セクションタイトル
        context.fillStyle = '#cc6600';
        context.font = 'bold 20px Arial';
        context.textAlign = 'left';
        context.fillText('進行中の実績', x, y + 25);
        
        let currentY = y + 40;
        const achievementHeight = 70;
        const spacing = 10;
        
        for (const achievement of achievements) {
            currentY = this.renderAchievementItem(context, x, currentY, width, achievement, false);
            currentY += spacing;
        }
        
        return currentY;
    }
    
    /**
     * 実績統計セクションを描画
     */
    renderAchievementStatsSection(context, x, y, width) {
        if (!this.achievementStatsUI) return y;
        
        const sectionHeight = 300;
        let currentY = y;
        
        // セクションタイトル
        context.fillStyle = '#4CAF50';
        context.font = 'bold 20px Arial';
        context.textAlign = 'left';
        context.fillText('実績統計', x, currentY + 25);
        
        // セクション背景
        context.fillStyle = '#16213e';
        context.fillRect(x, currentY + 35, width, sectionHeight);
        
        // セクション枠線
        context.strokeStyle = '#4CAF50';
        context.lineWidth = 2;
        context.strokeRect(x, currentY + 35, width, sectionHeight);
        
        // 統計内容を描画（3つのサブセクション）
        const subSectionWidth = width / 3;
        const contentY = currentY + 45;
        const contentHeight = sectionHeight - 20;
        
        // 全体統計
        this.achievementStatsUI.renderOverallStats(
            context, 
            x + 10, 
            contentY, 
            subSectionWidth - 20, 
            contentHeight
        );
        
        // カテゴリ別統計（簡略版）
        this.renderCompactCategoryStats(
            context,
            x + subSectionWidth + 10,
            contentY,
            subSectionWidth - 20,
            contentHeight
        );
        
        // 最近の解除実績
        this.achievementStatsUI.renderRecentUnlocks(
            context,
            x + subSectionWidth * 2 + 10,
            contentY,
            subSectionWidth - 20,
            contentHeight
        );
        
        return currentY + sectionHeight + 50;
    }
    
    /**
     * コンパクトなカテゴリ統計を描画
     */
    renderCompactCategoryStats(context, x, y, width, height) {
        if (!this.achievementStatsUI) return;
        
        const stats = this.achievementStatsUI.getStatistics();
        const categoryStats = stats.categories;
        
        context.save();
        
        // サブタイトル
        context.fillStyle = '#ffffff';
        context.font = 'bold 16px Arial';
        context.textAlign = 'left';
        context.fillText('カテゴリ別達成率', x, y + 20);
        
        let currentY = y + 40;
        const itemHeight = 25;
        
        Object.entries(categoryStats).forEach(([key, category]) => {
            if (currentY + itemHeight > y + height) return; // 範囲外は描画しない
            
            // カテゴリ名
            context.fillStyle = '#cccccc';
            context.font = '12px Arial';
            context.textAlign = 'left';
            context.fillText(category.name, x, currentY + 15);
            
            // 達成率
            context.fillStyle = '#ffffff';
            context.font = 'bold 12px Arial';
            context.textAlign = 'right';
            context.fillText(`${category.completionRate.toFixed(0)}%`, x + width, currentY + 15);
            
            // ミニ進捗バー
            const barWidth = 80;
            const barHeight = 4;
            const barX = x + width - barWidth;
            const barY = currentY + 18;
            
            context.fillStyle = '#333';
            context.fillRect(barX, barY, barWidth, barHeight);
            
            const fillWidth = (category.completionRate / 100) * barWidth;
            context.fillStyle = category.completionRate >= 100 ? '#4CAF50' : '#64B5F6';
            context.fillRect(barX, barY, fillWidth, barHeight);
            
            currentY += itemHeight;
        });
        
        context.restore();
    }
    
    /**
     * 実績カテゴリフィルターを描画
     */
    renderAchievementCategoryFilter(context, y) {
        const canvas = this.gameEngine.canvas;
        const filterHeight = 40;
        const buttonWidth = 120;
        const buttonHeight = 30;
        const spacing = 10;
        
        // フィルターの背景
        context.fillStyle = '#1a1a2e';
        context.fillRect(this.contentPadding, y, canvas.width - this.contentPadding * 2, filterHeight);
        
        // フィルターボタンを描画
        let currentX = this.contentPadding + 10;
        const buttonY = y + 5;
        
        for (let i = 0; i < this.achievementCategories.length; i++) {
            const category = this.achievementCategories[i];
            const label = this.achievementCategoryLabels[i];
            const isActive = this.currentAchievementCategory === category;
            
            // ボタンの背景
            context.fillStyle = isActive ? '#4CAF50' : '#333';
            context.fillRect(currentX, buttonY, buttonWidth, buttonHeight);
            
            // ボタンの枠線
            context.strokeStyle = isActive ? '#4CAF50' : '#666';
            context.lineWidth = 1;
            context.strokeRect(currentX, buttonY, buttonWidth, buttonHeight);
            
            // ボタンのテキスト
            context.fillStyle = isActive ? '#ffffff' : '#cccccc';
            context.font = '12px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(label, currentX + buttonWidth / 2, buttonY + buttonHeight / 2);
            
            currentX += buttonWidth + spacing;
            
            // 行を超える場合は改行
            if (currentX + buttonWidth > canvas.width - this.contentPadding) {
                currentX = this.contentPadding + 10;
                // 複数行対応（必要に応じて実装）
            }
        }
        
        return y + filterHeight + 10;
    }
    
    /**
     * フィルターされた実績を取得
     */
    getFilteredAchievements() {
        if (!this.achievementsData) return [];
        
        if (this.currentAchievementCategory === 'all') {
            return this.achievementsData;
        }
        
        return this.achievementsData.filter(achievement => 
            achievement.category === this.currentAchievementCategory
        );
    }

    /**
     * 実績アイテムを描画
     */
    renderAchievementItem(context, x, y, width, achievement, isUnlocked) {
        const itemHeight = 70;
        
        // 背景
        context.fillStyle = isUnlocked ? '#1a2e1a' : '#1a1a2e';
        context.fillRect(x, y, width, itemHeight);
        
        // 枠線
        context.strokeStyle = isUnlocked ? '#00aa00' : '#333';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, itemHeight);
        
        // アイコン
        context.fillStyle = '#ffffff';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText(achievement.icon || '🏆', x + 30, y + 35);
        
        // 実績名
        context.fillStyle = isUnlocked ? '#ffffff' : '#cccccc';
        context.font = 'bold 16px Arial';
        context.textAlign = 'left';
        context.fillText(achievement.name, x + 60, y + 25);
        
        // 実績説明
        context.fillStyle = isUnlocked ? '#cccccc' : '#999999';
        context.font = '14px Arial';
        context.fillText(achievement.description, x + 60, y + 45);
        
        // 報酬AP
        if (achievement.reward && achievement.reward.ap) {
            context.fillStyle = '#4a90e2';
            context.font = '12px Arial';
            context.textAlign = 'right';
            context.fillText(`${achievement.reward.ap} AP`, x + width - 10, y + 25);
        }
        
        // 進捗バー（未解除実績のみ）
        if (!isUnlocked && achievement.progress) {
            this.renderEnhancedProgressBar(context, x + 60, y + 55, width - 150, achievement.progress);
        }
        
        // 獲得日時（解除済み実績のみ）
        if (isUnlocked && achievement.unlockedDate) {
            context.fillStyle = '#888888';
            context.font = '12px Arial';
            context.textAlign = 'right';
            const date = new Date(achievement.unlockedDate).toLocaleDateString('ja-JP');
            context.fillText(date, x + width - 10, y + 45);
        }
        
        return y + itemHeight;
    }

    /**
     * 進捗バーを描画
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
        context.fillText(`${current}/${target} (${percentage.toFixed(0)}%)`, x + width / 2, y + barHeight + 12);
    }
    
    /**
     * 拡張進捗バーを描画
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
            
            // 光る効果
            if (percentage < 100) {
                context.save();
                context.globalAlpha = 0.3;
                context.fillStyle = '#ffffff';
                context.fillRect(x, y, fillWidth, barHeight / 2);
                context.restore();
            }
        }
        
        // 進捗テキスト（右側に配置）
        context.fillStyle = '#ffffff';
        context.font = '12px Arial';
        context.textAlign = 'right';
        context.textBaseline = 'middle';
        context.fillText(`${current}/${target}`, x + width + 40, y + barHeight / 2);
        
        // パーセンテージ（小さく表示）
        context.fillStyle = '#cccccc';
        context.font = '10px Arial';
        context.fillText(`${percentage.toFixed(0)}%`, x + width + 40, y + barHeight / 2 + 12);
    }
    
    /**
     * 実績カテゴリフィルターのクリック処理
     */
    handleAchievementCategoryClick(x, y) {
        // フィルターボタンの位置を計算
        const filterY = this.headerHeight + 50; // タブの下のフィルターエリア
        const buttonWidth = 120;
        const buttonHeight = 30;
        const spacing = 10;
        
        // フィルターエリア内かチェック
        if (y >= filterY + 5 && y <= filterY + 5 + buttonHeight) {
            let currentX = this.contentPadding + 10;
            
            for (let i = 0; i < this.achievementCategories.length; i++) {
                // ボタンの範囲内かチェック
                if (x >= currentX && x <= currentX + buttonWidth) {
                    this.currentAchievementCategory = this.achievementCategories[i];
                    this.scrollPosition = 0; // スクロール位置をリセット
                    return;
                }
                
                currentX += buttonWidth + spacing;
                
                // 行を超える場合は改行（複数行対応）
                if (currentX + buttonWidth > this.gameEngine.canvas.width - this.contentPadding) {
                    break; // 現在は1行のみ対応
                }
            }
        }
    }

    /**
     * ユーザー管理画面を描画
     */
    renderUserManagement(context, y, height) {
        const canvas = this.gameEngine.canvas;
        const contentWidth = canvas.width - this.contentPadding * 2;
        
        let currentY = y + this.contentPadding;
        
        // 現在のユーザー名表示
        this.renderCurrentUserInfo(context, this.contentPadding, currentY, contentWidth);
        currentY += 100;
        
        // ユーザー名変更ボタン
        currentY = this.renderUsernameChangeButton(context, this.contentPadding, currentY, contentWidth);
        currentY += 20;
        
        // データ管理セクション
        this.renderDataManagementSection(context, this.contentPadding, currentY, contentWidth);
        
        // ダイアログを描画
        if (this.showingDialog) {
            this.renderDialog(context);
        }
    }

    /**
     * 現在のユーザー情報を描画
     */
    renderCurrentUserInfo(context, x, y, width) {
        // セクション背景
        context.fillStyle = '#1a1a2e';
        context.fillRect(x, y, width, 80);
        
        // セクション枠線
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, 80);
        
        // セクションタイトル
        context.fillStyle = '#4a90e2';
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillText('ユーザー情報', x + 15, y + 25);
        
        // 現在のユーザー名
        const currentUsername = this.gameEngine.playerData?.username || '未設定';
        context.fillStyle = '#ffffff';
        context.font = '16px Arial';
        context.fillText(`ユーザー名: ${currentUsername}`, x + 15, y + 50);
        
        // AP情報
        const currentAP = this.gameEngine.playerData?.ap || 0;
        const totalAP = this.gameEngine.playerData?.tap || 0;
        context.fillStyle = '#cccccc';
        context.font = '14px Arial';
        context.fillText(`現在AP: ${currentAP} / 総AP: ${totalAP}`, x + 15, y + 70);
    }

    /**
     * ユーザー名変更ボタンを描画
     */
    renderUsernameChangeButton(context, x, y, width) {
        const buttonWidth = 200;
        const buttonHeight = 40;
        const isFocused = this.focusedElement === this.tabs.length + 1;
        
        // ボタン背景
        context.fillStyle = isFocused ? '#6bb0ff' : '#4a90e2';
        context.fillRect(x, y, buttonWidth, buttonHeight);
        
        // ボタン枠線
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(x, y, buttonWidth, buttonHeight);
        
        // ボタンテキスト
        context.fillStyle = '#ffffff';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText('ユーザー名変更', x + buttonWidth / 2, y + 25);
        
        return y + buttonHeight + 20;
    }

    /**
     * データ管理セクションを描画
     */
    renderDataManagementSection(context, x, y, width) {
        // セクション背景
        context.fillStyle = '#1a1a2e';
        context.fillRect(x, y, width, 120);
        
        // セクション枠線
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, 120);
        
        // セクションタイトル
        context.fillStyle = '#4a90e2';
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillText('データ管理', x + 15, y + 25);
        
        // エクスポートボタン
        const exportButtonWidth = 150;
        const exportButtonHeight = 35;
        const exportButtonX = x + 15;
        const exportButtonY = y + 40;
        const isExportFocused = this.focusedElement === this.tabs.length + 2;
        
        context.fillStyle = isExportFocused ? '#6bb0ff' : '#4a90e2';
        context.fillRect(exportButtonX, exportButtonY, exportButtonWidth, exportButtonHeight);
        
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(exportButtonX, exportButtonY, exportButtonWidth, exportButtonHeight);
        
        context.fillStyle = '#ffffff';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('データエクスポート', exportButtonX + exportButtonWidth / 2, exportButtonY + 22);
        
        // インポートボタン
        const importButtonWidth = 150;
        const importButtonHeight = 35;
        const importButtonX = x + 15 + exportButtonWidth + 20;
        const importButtonY = y + 40;
        const isImportFocused = this.focusedElement === this.tabs.length + 3;
        
        context.fillStyle = isImportFocused ? '#6bb0ff' : '#4a90e2';
        context.fillRect(importButtonX, importButtonY, importButtonWidth, importButtonHeight);
        
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(importButtonX, importButtonY, importButtonWidth, importButtonHeight);
        
        context.fillStyle = '#ffffff';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('データインポート', importButtonX + importButtonWidth / 2, importButtonY + 22);
        
        // 説明テキスト
        context.fillStyle = '#cccccc';
        context.font = '12px Arial';
        context.textAlign = 'left';
        context.fillText('※ データのバックアップと復元が可能です', x + 15, y + 100);
    }

    /**
     * ダイアログを描画
     */
    renderDialog(context) {
        const canvas = this.gameEngine.canvas;
        
        // オーバーレイ背景
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // ダイアログサイズ
        const dialogWidth = Math.min(500, canvas.width - 40);
        const dialogHeight = 250;
        const dialogX = (canvas.width - dialogWidth) / 2;
        const dialogY = (canvas.height - dialogHeight) / 2;
        
        // ダイアログ背景
        context.fillStyle = '#2a2a3e';
        context.fillRect(dialogX, dialogY, dialogWidth, dialogHeight);
        
        // ダイアログ枠線
        context.strokeStyle = '#4a90e2';
        context.lineWidth = 2;
        context.strokeRect(dialogX, dialogY, dialogWidth, dialogHeight);
        
        switch (this.showingDialog) {
            case 'username':
                this.renderUsernameDialog(context, dialogX, dialogY, dialogWidth, dialogHeight);
                break;
            case 'export':
                this.renderExportDialog(context, dialogX, dialogY, dialogWidth, dialogHeight);
                break;
            case 'import':
                this.renderImportDialog(context, dialogX, dialogY, dialogWidth, dialogHeight);
                break;
        }
    }

    /**
     * ユーザー名変更ダイアログを描画
     */
    renderUsernameDialog(context, x, y, width, height) {
        // タイトル
        context.fillStyle = '#ffffff';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.fillText('ユーザー名変更', x + width / 2, y + 30);
        
        // 現在のユーザー名
        const currentUsername = this.gameEngine.playerData?.username || '未設定';
        context.fillStyle = '#cccccc';
        context.font = '14px Arial';
        context.fillText(`現在: ${currentUsername}`, x + width / 2, y + 55);
        
        // 入力フィールド（シミュレーション）
        const fieldX = x + 20;
        const fieldY = y + 80;
        const fieldWidth = width - 40;
        const fieldHeight = 30;
        
        context.fillStyle = '#ffffff';
        context.fillRect(fieldX, fieldY, fieldWidth, fieldHeight);
        
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(fieldX, fieldY, fieldWidth, fieldHeight);
        
        // 入力テキスト表示
        context.fillStyle = '#000000';
        context.font = '16px Arial';
        context.textAlign = 'left';
        const inputText = this.dialogData.newUsername || '';
        context.fillText(inputText + '|', fieldX + 10, fieldY + 20);
        
        // エラーメッセージ
        if (this.dialogData.error) {
            context.fillStyle = '#cc0000';
            context.font = '12px Arial';
            context.textAlign = 'center';
            context.fillText(this.dialogData.error, x + width / 2, y + 130);
        }
        
        // ボタン
        this.renderDialogButtons(context, x, y + height - 60, width);
    }

    /**
     * エクスポートダイアログを描画
     */
    renderExportDialog(context, x, y, width, height) {
        // タイトル
        context.fillStyle = '#ffffff';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.fillText('データエクスポート', x + width / 2, y + 30);
        
        if (this.dialogData.exportData) {
            // エクスポート完了
            context.fillStyle = '#00aa00';
            context.font = '16px Arial';
            context.fillText('エクスポート完了！', x + width / 2, y + 70);
            
            context.fillStyle = '#cccccc';
            context.font = '14px Arial';
            context.fillText('データをクリップボードにコピーしました', x + width / 2, y + 95);
        } else {
            // エクスポート処理中
            context.fillStyle = '#cccccc';
            context.font = '16px Arial';
            context.fillText('データを準備中...', x + width / 2, y + 70);
        }
        
        // ボタン
        this.renderDialogButtons(context, x, y + height - 60, width);
    }

    /**
     * インポートダイアログを描画
     */
    renderImportDialog(context, x, y, width, height) {
        // タイトル
        context.fillStyle = '#ffffff';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.fillText('データインポート', x + width / 2, y + 30);
        
        switch (this.dialogData.step) {
            case 'select':
                this.renderImportSelectStep(context, x, y, width, height);
                break;
            case 'confirm':
                this.renderImportConfirmStep(context, x, y, width, height);
                break;
            case 'processing':
                this.renderImportProcessingStep(context, x, y, width, height);
                break;
        }
    }

    /**
     * インポート方法選択ステップを描画
     */
    renderImportSelectStep(context, x, y, width, height) {
        // 説明
        context.fillStyle = '#cccccc';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('インポート方法を選択してください', x + width / 2, y + 60);
        
        // ファイル選択ボタン
        const fileButtonWidth = 200;
        const fileButtonHeight = 40;
        const fileButtonX = x + (width - fileButtonWidth) / 2;
        const fileButtonY = y + 90;
        
        context.fillStyle = this.dialogData.importMethod === 'file' ? '#4a90e2' : '#666666';
        context.fillRect(fileButtonX, fileButtonY, fileButtonWidth, fileButtonHeight);
        
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(fileButtonX, fileButtonY, fileButtonWidth, fileButtonHeight);
        
        context.fillStyle = '#ffffff';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText('📁 ファイルを選択', fileButtonX + fileButtonWidth / 2, fileButtonY + 25);
        
        // テキスト入力ボタン
        const textButtonY = fileButtonY + 60;
        
        context.fillStyle = this.dialogData.importMethod === 'text' ? '#4a90e2' : '#666666';
        context.fillRect(fileButtonX, textButtonY, fileButtonWidth, fileButtonHeight);
        
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(fileButtonX, textButtonY, fileButtonWidth, fileButtonHeight);
        
        context.fillStyle = '#ffffff';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText('📝 テキスト入力', fileButtonX + fileButtonWidth / 2, textButtonY + 25);
        
        // テキスト入力エリア（テキストモード時のみ）
        if (this.dialogData.importMethod === 'text') {
            const fieldX = x + 20;
            const fieldY = textButtonY + 60;
            const fieldWidth = width - 40;
            const fieldHeight = 60;
            
            context.fillStyle = '#ffffff';
            context.fillRect(fieldX, fieldY, fieldWidth, fieldHeight);
            
            context.strokeStyle = '#333';
            context.lineWidth = 1;
            context.strokeRect(fieldX, fieldY, fieldWidth, fieldHeight);
            
            // 入力テキスト表示
            context.fillStyle = '#000000';
            context.font = '12px Arial';
            context.textAlign = 'left';
            const inputText = this.dialogData.importData || 'JSONデータを貼り付けてください...';
            const maxLength = 50;
            const displayText = inputText.length > maxLength ? inputText.substring(0, maxLength) + '...' : inputText;
            context.fillText(displayText, fieldX + 10, fieldY + 20);
        }
        
        // エラーメッセージ
        if (this.dialogData.error) {
            context.fillStyle = '#cc0000';
            context.font = '12px Arial';
            context.textAlign = 'center';
            context.fillText(this.dialogData.error, x + width / 2, y + height - 80);
        }
        
        // ボタン
        this.renderImportDialogButtons(context, x, y + height - 60, width);
    }

    /**
     * インポート確認ステップを描画
     */
    renderImportConfirmStep(context, x, y, width, height) {
        // 確認メッセージ
        context.fillStyle = '#ffaa00';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText('⚠️ データをインポートしますか？', x + width / 2, y + 70);
        
        context.fillStyle = '#cccccc';
        context.font = '14px Arial';
        context.fillText('現在のデータは上書きされます', x + width / 2, y + 95);
        
        // データプレビュー
        if (this.dialogData.parsedData) {
            const preview = this.dialogData.parsedData;
            context.fillStyle = '#ffffff';
            context.font = '12px Arial';
            context.textAlign = 'left';
            
            let previewY = y + 120;
            const lineHeight = 16;
            
            if (preview.playerData) {
                context.fillText(`ユーザー名: ${preview.playerData.username || '未設定'}`, x + 20, previewY);
                previewY += lineHeight;
                context.fillText(`AP: ${preview.playerData.ap || 0}`, x + 20, previewY);
                previewY += lineHeight;
            }
            
            if (preview.statistics) {
                context.fillText(`統計データ: あり`, x + 20, previewY);
                previewY += lineHeight;
            }
            
            if (preview.achievements) {
                context.fillText(`実績データ: あり`, x + 20, previewY);
                previewY += lineHeight;
            }
            
            if (preview.exportDate) {
                const date = new Date(preview.exportDate).toLocaleDateString('ja-JP');
                context.fillText(`エクスポート日時: ${date}`, x + 20, previewY);
            }
        }
        
        // エラーメッセージ
        if (this.dialogData.error) {
            context.fillStyle = '#cc0000';
            context.font = '12px Arial';
            context.textAlign = 'center';
            context.fillText(this.dialogData.error, x + width / 2, y + height - 80);
        }
        
        // ボタン
        this.renderImportDialogButtons(context, x, y + height - 60, width);
    }

    /**
     * インポート処理中ステップを描画
     */
    renderImportProcessingStep(context, x, y, width, height) {
        // 処理中メッセージ
        context.fillStyle = '#4a90e2';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText('データを復元中...', x + width / 2, y + 70);
        
        if (this.dialogData.success) {
            context.fillStyle = '#00aa00';
            context.fillText('✅ インポート完了！', x + width / 2, y + 110);
            
            context.fillStyle = '#cccccc';
            context.font = '14px Arial';
            context.fillText('データが正常に復元されました', x + width / 2, y + 135);
        } else if (this.dialogData.error) {
            context.fillStyle = '#cc0000';
            context.fillText('❌ インポート失敗', x + width / 2, y + 110);
            
            context.font = '12px Arial';
            context.fillText(this.dialogData.error, x + width / 2, y + 135);
        }
        
        // ボタン
        this.renderImportDialogButtons(context, x, y + height - 60, width);
    }

    /**
     * インポートダイアログボタンを描画
     */
    renderImportDialogButtons(context, x, y, width) {
        const buttonWidth = 80;
        const buttonHeight = 35;
        const buttonSpacing = 20;
        
        if (this.dialogData.step === 'select') {
            // 次へとキャンセルボタン
            const totalButtonWidth = buttonWidth * 2 + buttonSpacing;
            const buttonStartX = x + (width - totalButtonWidth) / 2;
            
            // 次へボタン（データがある場合のみ有効）
            const canProceed = (this.dialogData.importMethod === 'file' && this.dialogData.importData) ||
                             (this.dialogData.importMethod === 'text' && this.dialogData.importData.trim().length > 0);
            
            context.fillStyle = canProceed ? '#4a90e2' : '#666666';
            context.fillRect(buttonStartX, y, buttonWidth, buttonHeight);
            
            context.strokeStyle = '#333';
            context.lineWidth = 1;
            context.strokeRect(buttonStartX, y, buttonWidth, buttonHeight);
            
            context.fillStyle = '#ffffff';
            context.font = '14px Arial';
            context.textAlign = 'center';
            context.fillText('次へ', buttonStartX + buttonWidth / 2, y + 22);
            
            // キャンセルボタン
            const cancelButtonX = buttonStartX + buttonWidth + buttonSpacing;
            context.fillStyle = '#666666';
            context.fillRect(cancelButtonX, y, buttonWidth, buttonHeight);
            
            context.strokeStyle = '#333';
            context.lineWidth = 1;
            context.strokeRect(cancelButtonX, y, buttonWidth, buttonHeight);
            
            context.fillStyle = '#ffffff';
            context.font = '14px Arial';
            context.textAlign = 'center';
            context.fillText('キャンセル', cancelButtonX + buttonWidth / 2, y + 22);
            
        } else if (this.dialogData.step === 'confirm') {
            // 実行と戻るボタン
            const totalButtonWidth = buttonWidth * 2 + buttonSpacing;
            const buttonStartX = x + (width - totalButtonWidth) / 2;
            
            // 実行ボタン
            context.fillStyle = '#cc6600';
            context.fillRect(buttonStartX, y, buttonWidth, buttonHeight);
            
            context.strokeStyle = '#333';
            context.lineWidth = 1;
            context.strokeRect(buttonStartX, y, buttonWidth, buttonHeight);
            
            context.fillStyle = '#ffffff';
            context.font = '14px Arial';
            context.textAlign = 'center';
            context.fillText('実行', buttonStartX + buttonWidth / 2, y + 22);
            
            // 戻るボタン
            const backButtonX = buttonStartX + buttonWidth + buttonSpacing;
            context.fillStyle = '#666666';
            context.fillRect(backButtonX, y, buttonWidth, buttonHeight);
            
            context.strokeStyle = '#333';
            context.lineWidth = 1;
            context.strokeRect(backButtonX, y, buttonWidth, buttonHeight);
            
            context.fillStyle = '#ffffff';
            context.font = '14px Arial';
            context.textAlign = 'center';
            context.fillText('戻る', backButtonX + buttonWidth / 2, y + 22);
            
        } else {
            // 完了ボタン
            const buttonStartX = x + (width - buttonWidth) / 2;
            
            context.fillStyle = '#4a90e2';
            context.fillRect(buttonStartX, y, buttonWidth, buttonHeight);
            
            context.strokeStyle = '#333';
            context.lineWidth = 1;
            context.strokeRect(buttonStartX, y, buttonWidth, buttonHeight);
            
            context.fillStyle = '#ffffff';
            context.font = '14px Arial';
            context.textAlign = 'center';
            context.fillText('完了', buttonStartX + buttonWidth / 2, y + 22);
        }
    }

    /**
     * ダイアログボタンを描画
     */
    renderDialogButtons(context, x, y, width) {
        const buttonWidth = 80;
        const buttonHeight = 35;
        const buttonSpacing = 20;
        const totalButtonWidth = buttonWidth * 2 + buttonSpacing;
        const buttonStartX = x + (width - totalButtonWidth) / 2;
        
        // OKボタン
        context.fillStyle = '#4a90e2';
        context.fillRect(buttonStartX, y, buttonWidth, buttonHeight);
        
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(buttonStartX, y, buttonWidth, buttonHeight);
        
        context.fillStyle = '#ffffff';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('OK', buttonStartX + buttonWidth / 2, y + 22);
        
        // キャンセルボタン
        const cancelButtonX = buttonStartX + buttonWidth + buttonSpacing;
        context.fillStyle = '#666666';
        context.fillRect(cancelButtonX, y, buttonWidth, buttonHeight);
        
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(cancelButtonX, y, buttonWidth, buttonHeight);
        
        context.fillStyle = '#ffffff';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('キャンセル', cancelButtonX + buttonWidth / 2, y + 22);
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
        
        // ダイアログが表示されている場合はダイアログの処理を優先
        if (this.showingDialog) {
            this.handleDialogClick(x, y);
            return;
        }
        
        // タブクリック処理
        if (y >= this.headerHeight - this.tabHeight && y <= this.headerHeight) {
            const tabIndex = Math.floor(x / (canvas.width / this.tabs.length));
            if (tabIndex >= 0 && tabIndex < this.tabs.length) {
                this.switchTab(this.tabs[tabIndex]);
                this.focusedElement = tabIndex;
                return;
            }
        }
        
        // 実績画面のカテゴリフィルタークリック処理
        if (this.currentTab === 'achievements') {
            this.handleAchievementCategoryClick(x, y);
        }
        
        // ユーザー管理画面のボタンクリック処理
        if (this.currentTab === 'management') {
            this.handleManagementClick(x, y);
        }
        
        // ヘルプ画面のセクション選択クリック処理
        if (this.currentTab === 'help') {
            this.handleHelpSectionClick(x, y);
        }
        
        // 戻るボタンクリック処理
        if (x >= 50 && x <= 170 && y >= canvas.height - 70 && y <= canvas.height - 20) {
            this.sceneManager.switchScene('menu');
            return;
        }
    }

    /**
     * ユーザー管理画面のクリック処理
     */
    handleManagementClick(x, y) {
        const canvas = this.gameEngine.canvas;
        const contentY = this.headerHeight + this.contentPadding;
        
        // ユーザー名変更ボタン
        const usernameButtonY = contentY + 100;
        if (x >= this.contentPadding && x <= this.contentPadding + 200 && 
            y >= usernameButtonY && y <= usernameButtonY + 40) {
            this.showUsernameChangeDialog();
            return;
        }
        
        // データエクスポートボタン
        const dataManagementY = contentY + 160;
        const exportButtonY = dataManagementY + 40;
        if (x >= this.contentPadding + 15 && x <= this.contentPadding + 15 + 150 && 
            y >= exportButtonY && y <= exportButtonY + 35) {
            this.showDataExportDialog();
            return;
        }
        
        // データインポートボタン
        const importButtonX = this.contentPadding + 15 + 150 + 20;
        if (x >= importButtonX && x <= importButtonX + 150 && 
            y >= exportButtonY && y <= exportButtonY + 35) {
            this.showDataImportDialog();
            return;
        }
    }

    /**
     * ダイアログのクリック処理
     */
    handleDialogClick(x, y) {
        const canvas = this.gameEngine.canvas;
        const dialogWidth = Math.min(500, canvas.width - 40);
        const dialogHeight = 250;
        const dialogX = (canvas.width - dialogWidth) / 2;
        const dialogY = (canvas.height - dialogHeight) / 2;
        
        // ダイアログ外をクリックした場合は閉じる
        if (x < dialogX || x > dialogX + dialogWidth || y < dialogY || y > dialogY + dialogHeight) {
            this.closeDialog();
            return;
        }
        
        // インポートダイアログの特別処理
        if (this.showingDialog === 'import') {
            this.handleImportDialogClick(x, y, dialogX, dialogY, dialogWidth, dialogHeight);
            return;
        }
        
        // その他のダイアログのボタンクリック処理
        const buttonY = dialogY + dialogHeight - 60;
        const buttonWidth = 80;
        const buttonHeight = 35;
        const buttonSpacing = 20;
        const totalButtonWidth = buttonWidth * 2 + buttonSpacing;
        const buttonStartX = dialogX + (dialogWidth - totalButtonWidth) / 2;
        
        // OKボタン
        if (x >= buttonStartX && x <= buttonStartX + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
            this.handleDialogOK();
            return;
        }
        
        // キャンセルボタン
        const cancelButtonX = buttonStartX + buttonWidth + buttonSpacing;
        if (x >= cancelButtonX && x <= cancelButtonX + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
            this.closeDialog();
            return;
        }
    }

    /**
     * インポートダイアログのクリック処理
     */
    handleImportDialogClick(x, y, dialogX, dialogY, dialogWidth, dialogHeight) {
        if (this.dialogData.step === 'select') {
            // ファイル選択ボタン
            const fileButtonWidth = 200;
            const fileButtonHeight = 40;
            const fileButtonX = dialogX + (dialogWidth - fileButtonWidth) / 2;
            const fileButtonY = dialogY + 90;
            
            if (x >= fileButtonX && x <= fileButtonX + fileButtonWidth && 
                y >= fileButtonY && y <= fileButtonY + fileButtonHeight) {
                this.selectImportMethod('file');
                this.openFileSelector();
                return;
            }
            
            // テキスト入力ボタン
            const textButtonY = fileButtonY + 60;
            if (x >= fileButtonX && x <= fileButtonX + fileButtonWidth && 
                y >= textButtonY && y <= textButtonY + fileButtonHeight) {
                this.selectImportMethod('text');
                return;
            }
            
            // ボタンクリック処理
            const buttonY = dialogY + dialogHeight - 60;
            const buttonWidth = 80;
            const buttonHeight = 35;
            const buttonSpacing = 20;
            const totalButtonWidth = buttonWidth * 2 + buttonSpacing;
            const buttonStartX = dialogX + (dialogWidth - totalButtonWidth) / 2;
            
            // 次へボタン
            if (x >= buttonStartX && x <= buttonStartX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                this.proceedToConfirmStep();
                return;
            }
            
            // キャンセルボタン
            const cancelButtonX = buttonStartX + buttonWidth + buttonSpacing;
            if (x >= cancelButtonX && x <= cancelButtonX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                this.closeDialog();
                return;
            }
            
        } else if (this.dialogData.step === 'confirm') {
            // ボタンクリック処理
            const buttonY = dialogY + dialogHeight - 60;
            const buttonWidth = 80;
            const buttonHeight = 35;
            const buttonSpacing = 20;
            const totalButtonWidth = buttonWidth * 2 + buttonSpacing;
            const buttonStartX = dialogX + (dialogWidth - totalButtonWidth) / 2;
            
            // 実行ボタン
            if (x >= buttonStartX && x <= buttonStartX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                this.executeImport();
                return;
            }
            
            // 戻るボタン
            const backButtonX = buttonStartX + buttonWidth + buttonSpacing;
            if (x >= backButtonX && x <= backButtonX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                this.dialogData.step = 'select';
                this.dialogData.error = null;
                return;
            }
            
        } else if (this.dialogData.step === 'processing') {
            // 完了ボタン
            const buttonWidth = 80;
            const buttonStartX = dialogX + (dialogWidth - buttonWidth) / 2;
            const buttonY = dialogY + dialogHeight - 60;
            const buttonHeight = 35;
            
            if (x >= buttonStartX && x <= buttonStartX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                this.closeDialog();
                return;
            }
        }
    }

    /**
     * インポート方法を選択
     */
    selectImportMethod(method) {
        this.dialogData.importMethod = method;
        if (method === 'file') {
            this.dialogData.importData = '';
        }
        this.dialogData.error = null;
    }

    /**
     * ファイル選択ダイアログを開く
     */
    openFileSelector() {
        try {
            // HTML5 File APIを使用
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,application/json';
            input.style.display = 'none';
            
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    this.readImportFile(file);
                }
                document.body.removeChild(input);
            };
            
            input.oncancel = () => {
                document.body.removeChild(input);
            };
            
            document.body.appendChild(input);
            input.click();
            
        } catch (error) {
            console.error('File selector error:', error);
            this.dialogData.error = 'ファイル選択に失敗しました';
        }
    }

    /**
     * インポートファイルを読み込み
     */
    readImportFile(file) {
        try {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    this.dialogData.importData = event.target.result;
                    this.dialogData.error = null;
                } catch (error) {
                    this.dialogData.error = 'ファイルの読み込みに失敗しました';
                }
            };
            
            reader.onerror = () => {
                this.dialogData.error = 'ファイルの読み込みに失敗しました';
            };
            
            reader.readAsText(file);
            
        } catch (error) {
            console.error('File read error:', error);
            this.dialogData.error = 'ファイルの読み込みに失敗しました';
        }
    }

    /**
     * 確認ステップに進む
     */
    proceedToConfirmStep() {
        // データの有無チェック
        const canProceed = (this.dialogData.importMethod === 'file' && this.dialogData.importData) ||
                         (this.dialogData.importMethod === 'text' && this.dialogData.importData.trim().length > 0);
        
        if (!canProceed) {
            this.dialogData.error = 'インポートするデータを選択してください';
            return;
        }
        
        // データをバリデーション
        if (this.validateImportData()) {
            this.dialogData.step = 'confirm';
            this.dialogData.error = null;
        }
    }

    /**
     * インポート実行
     */
    executeImport() {
        this.dialogData.step = 'processing';
        this.dialogData.error = null;
        
        // 非同期でインポート処理を実行
        setTimeout(() => {
            this.processDataImport();
        }, 500);
    }

    /**
     * ユーザー名変更ダイアログを表示
     */
    showUsernameChangeDialog() {
        this.showingDialog = 'username';
        this.dialogData = {
            newUsername: this.gameEngine.playerData?.username || '',
            error: null
        };
    }

    /**
     * データエクスポートダイアログを表示
     */
    showDataExportDialog() {
        this.showingDialog = 'export';
        this.dialogData = {
            exportData: null,
            error: null
        };
        
        // データエクスポート処理を開始
        setTimeout(() => {
            this.exportUserData();
        }, 500);
    }

    /**
     * データインポートダイアログを表示
     */
    showDataImportDialog() {
        this.showingDialog = 'import';
        this.dialogData = {
            importData: '',
            importMethod: 'file', // 'file' or 'text'
            error: null,
            step: 'select' // 'select', 'confirm', 'processing'
        };
    }

    /**
     * ダイアログを閉じる
     */
    closeDialog() {
        this.showingDialog = null;
        this.dialogData = {};
    }

    /**
     * ダイアログのOKボタン処理
     */
    handleDialogOK() {
        switch (this.showingDialog) {
            case 'username':
                this.processUsernameChange();
                break;
            case 'export':
                this.closeDialog();
                break;
            case 'import':
                this.processDataImport();
                break;
        }
    }

    /**
     * ユーザー名変更処理
     */
    processUsernameChange() {
        const newUsername = this.dialogData.newUsername || '';
        
        // バリデーション
        if (!this.validateUsername(newUsername)) {
            return; // エラーメッセージは validateUsername 内で設定
        }
        
        // ユーザー名を更新
        if (this.gameEngine.playerData) {
            this.updateUsername(newUsername);
            this.closeDialog();
            this.showError('ユーザー名を更新しました');
        } else {
            this.dialogData.error = 'プレイヤーデータが見つかりません';
        }
    }

    /**
     * ユーザー名バリデーション
     */
    validateUsername(username) {
        // 長さチェック
        if (username.length > 10) {
            this.dialogData.error = 'ユーザー名は10文字以下で入力してください';
            return false;
        }
        
        // 空文字チェック
        if (username.trim().length === 0) {
            this.dialogData.error = 'ユーザー名を入力してください';
            return false;
        }
        
        // 有効文字チェック（英数字、ひらがな、カタカナ、漢字、一部記号）
        const validPattern = /^[a-zA-Z0-9あ-んア-ン一-龯ー・\-_]+$/;
        if (!validPattern.test(username)) {
            this.dialogData.error = '使用できない文字が含まれています';
            return false;
        }
        
        this.dialogData.error = null;
        return true;
    }

    /**
     * ユーザー名更新
     */
    updateUsername(newUsername) {
        try {
            // PlayerDataのユーザー名を更新
            this.gameEngine.playerData.username = newUsername;
            
            // データを保存
            this.gameEngine.playerData.save();
            
        } catch (error) {
            console.error('Failed to update username:', error);
            this.showError('ユーザー名の更新に失敗しました');
        }
    }

    /**
     * データエクスポート処理
     */
    exportUserData() {
        try {
            const exportData = {
                playerData: {
                    username: this.gameEngine.playerData?.username || '',
                    ap: this.gameEngine.playerData?.ap || 0,
                    tap: this.gameEngine.playerData?.tap || 0,
                    highScores: this.gameEngine.playerData?.highScores || {},
                    unlockedStages: this.gameEngine.playerData?.unlockedStages || [],
                    ownedItems: this.gameEngine.playerData?.ownedItems || []
                },
                statistics: this.statisticsData,
                achievements: this.achievementsData,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const jsonData = JSON.stringify(exportData, null, 2);
            
            // クリップボードにコピー
            navigator.clipboard.writeText(jsonData).then(() => {
                this.dialogData.exportData = jsonData;
            }).catch(() => {
                // フォールバック：ダウンロードリンクを作成
                this.createDownloadLink(jsonData);
                this.dialogData.exportData = jsonData;
            });
            
        } catch (error) {
            console.error('Export error:', error);
            this.dialogData.error = 'エクスポートに失敗しました';
        }
    }

    /**
     * ダウンロードリンクを作成
     */
    createDownloadLink(data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bubblepop_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * インポートデータをバリデーション
     */
    validateImportData() {
        try {
            const jsonData = this.dialogData.importData.trim();
            
            // JSON構文チェック
            let parsedData;
            try {
                parsedData = JSON.parse(jsonData);
            } catch (error) {
                this.dialogData.error = 'JSONデータの形式が正しくありません';
                return false;
            }
            
            // 必須フィールドの存在確認
            if (!this.validateDataStructure(parsedData)) {
                return false;
            }
            
            // データ型チェック
            if (!this.validateDataTypes(parsedData)) {
                return false;
            }
            
            // バリデーション済みデータを保存
            this.dialogData.parsedData = parsedData;
            return true;
            
        } catch (error) {
            console.error('Validation error:', error);
            this.dialogData.error = 'データの検証中にエラーが発生しました';
            return false;
        }
    }

    /**
     * データ構造をバリデーション
     */
    validateDataStructure(data) {
        // 最低限必要なフィールドをチェック
        if (!data || typeof data !== 'object') {
            this.dialogData.error = 'データが正しい形式ではありません';
            return false;
        }
        
        // バージョンチェック
        if (!data.version) {
            this.dialogData.error = 'バージョン情報が見つかりません';
            return false;
        }
        
        // プレイヤーデータのチェック
        if (!data.playerData || typeof data.playerData !== 'object') {
            this.dialogData.error = 'プレイヤーデータが見つかりません';
            return false;
        }
        
        return true;
    }

    /**
     * データ型をバリデーション
     */
    validateDataTypes(data) {
        const playerData = data.playerData;
        
        // ユーザー名のチェック
        if (playerData.username !== undefined && typeof playerData.username !== 'string') {
            this.dialogData.error = 'ユーザー名のデータ型が正しくありません';
            return false;
        }
        
        // APのチェック
        if (playerData.ap !== undefined && (typeof playerData.ap !== 'number' || playerData.ap < 0)) {
            this.dialogData.error = 'APのデータ型が正しくありません';
            return false;
        }
        
        // TAPのチェック
        if (playerData.tap !== undefined && (typeof playerData.tap !== 'number' || playerData.tap < 0)) {
            this.dialogData.error = 'TAPのデータ型が正しくありません';
            return false;
        }
        
        // ハイスコアのチェック
        if (playerData.highScores !== undefined && typeof playerData.highScores !== 'object') {
            this.dialogData.error = 'ハイスコアのデータ型が正しくありません';
            return false;
        }
        
        // アンロックステージのチェック
        if (playerData.unlockedStages !== undefined && !Array.isArray(playerData.unlockedStages)) {
            this.dialogData.error = 'アンロックステージのデータ型が正しくありません';
            return false;
        }
        
        // 所有アイテムのチェック
        if (playerData.ownedItems !== undefined && !Array.isArray(playerData.ownedItems)) {
            this.dialogData.error = '所有アイテムのデータ型が正しくありません';
            return false;
        }
        
        return true;
    }

    /**
     * データ復元処理
     */
    restoreData(jsonData) {
        try {
            const parsedData = JSON.parse(jsonData);
            
            // プレイヤーデータを復元
            this.restorePlayerData(parsedData.playerData);
            
            // 統計データを復元（存在する場合）
            if (parsedData.statistics) {
                this.restoreStatisticsData(parsedData.statistics);
            }
            
            // 実績データを復元（存在する場合）
            if (parsedData.achievements) {
                this.restoreAchievementsData(parsedData.achievements);
            }
            
            // データを保存
            this.saveRestoredData();
            
            // UI更新
            this.loadUserData();
            
        } catch (error) {
            console.error('Data restore error:', error);
            throw error;
        }
    }

    /**
     * データインポート処理
     */
    processDataImport() {
        try {
            const importData = this.dialogData.parsedData;
            
            // プレイヤーデータを復元
            this.restorePlayerData(importData.playerData);
            
            // 統計データを復元（存在する場合）
            if (importData.statistics) {
                this.restoreStatisticsData(importData.statistics);
            }
            
            // 実績データを復元（存在する場合）
            if (importData.achievements) {
                this.restoreAchievementsData(importData.achievements);
            }
            
            // データを保存
            this.saveRestoredData();
            
            // UI更新
            this.loadUserData();
            
            // 成功メッセージ
            this.dialogData.success = true;
            this.dialogData.error = null;
            
        } catch (error) {
            console.error('Import processing error:', error);
            this.dialogData.error = 'データの復元中にエラーが発生しました';
            this.dialogData.success = false;
        }
    }

    /**
     * プレイヤーデータを復元
     */
    restorePlayerData(playerData) {
        if (!this.gameEngine.playerData) {
            throw new Error('PlayerDataが見つかりません');
        }
        
        const player = this.gameEngine.playerData;
        
        // 各フィールドを安全に復元
        if (playerData.username !== undefined) {
            player.username = playerData.username;
        }
        
        if (playerData.ap !== undefined) {
            player.ap = Math.max(0, Math.floor(playerData.ap));
        }
        
        if (playerData.tap !== undefined) {
            player.tap = Math.max(0, Math.floor(playerData.tap));
        }
        
        if (playerData.highScores !== undefined) {
            player.highScores = { ...playerData.highScores };
        }
        
        if (playerData.unlockedStages !== undefined) {
            player.unlockedStages = [...playerData.unlockedStages];
        }
        
        if (playerData.ownedItems !== undefined) {
            player.ownedItems = [...playerData.ownedItems];
        }
    }

    /**
     * 統計データを復元
     */
    restoreStatisticsData(statisticsData) {
        // StatisticsManagerが存在する場合のみ復元
        if (this.gameEngine.statisticsManager && statisticsData) {
            // 注意: 統計データの復元は既存データとの整合性を考慮する必要がある
            // ここでは基本的な復元のみ実装
            console.log('Statistics data restore is planned for future implementation');
        }
    }

    /**
     * 実績データを復元
     */
    restoreAchievementsData(achievementsData) {
        // AchievementManagerが存在する場合のみ復元
        if (this.gameEngine.achievementManager && achievementsData) {
            const manager = this.gameEngine.achievementManager;
            
            // 解除済み実績を復元
            if (achievementsData.unlockedAchievements && Array.isArray(achievementsData.unlockedAchievements)) {
                manager.unlockedAchievements = new Set(achievementsData.unlockedAchievements);
            }
            
            // 進捗データを復元
            if (achievementsData.progressData && typeof achievementsData.progressData === 'object') {
                manager.progressData = { ...achievementsData.progressData };
            }
        }
    }

    /**
     * 復元されたデータを保存
     */
    saveRestoredData() {
        try {
            // プレイヤーデータを保存
            if (this.gameEngine.playerData) {
                this.gameEngine.playerData.save();
            }
            
            // 統計データを保存
            if (this.gameEngine.statisticsManager) {
                this.gameEngine.statisticsManager.save();
            }
            
            // 実績データを保存
            if (this.gameEngine.achievementManager) {
                this.gameEngine.achievementManager.save();
            }
            
        } catch (error) {
            console.error('Save error:', error);
            throw new Error('データの保存に失敗しました');
        }
    }

    /**
     * キーボード処理
     */
    handleKeyboard(event) {
        // ダイアログが表示されている場合
        if (this.showingDialog) {
            this.handleDialogKeyboard(event);
            return;
        }
        
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
            case 'ArrowUp':
                if (this.currentTab === 'achievements') {
                    this.scrollPosition = Math.max(0, this.scrollPosition - 30);
                }
                break;
            case 'ArrowDown':
                if (this.currentTab === 'achievements') {
                    this.scrollPosition += 30;
                }
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
     * ダイアログのキーボード処理
     */
    handleDialogKeyboard(event) {
        switch (event.key) {
            case 'Escape':
                this.closeDialog();
                break;
            case 'Enter':
                this.handleDialogOK();
                break;
            default:
                // ユーザー名変更ダイアログでの文字入力
                if (this.showingDialog === 'username') {
                    this.handleUsernameInput(event);
                }
                // データインポートのテキスト入力モードでの文字入力
                else if (this.showingDialog === 'importMethod' && this.dialogData.importMethod === 'text') {
                    this.handleImportTextInput(event);
                }
                break;
        }
    }

    /**
     * ユーザー名入力処理
     */
    handleUsernameInput(event) {
        event.preventDefault();
        
        const currentUsername = this.dialogData.newUsername || '';
        
        if (event.key === 'Backspace') {
            // バックスペース処理
            this.dialogData.newUsername = currentUsername.slice(0, -1);
        } else if (event.key.length === 1) {
            // 通常の文字入力
            const newChar = event.key;
            
            // 長さ制限チェック
            if (currentUsername.length >= 10) {
                this.dialogData.error = 'ユーザー名は10文字以下で入力してください';
                return;
            }
            
            // 有効文字チェック
            const validPattern = /^[a-zA-Z0-9あ-んア-ン一-龯ー・\-_]$/;
            if (validPattern.test(newChar)) {
                this.dialogData.newUsername = currentUsername + newChar;
                this.dialogData.error = null;
            } else {
                this.dialogData.error = '使用できない文字が含まれています';
            }
        }
    }

    /**
     * インポートテキスト入力処理
     */
    handleImportTextInput(event) {
        event.preventDefault();
        
        const currentText = this.dialogData.importData || '';
        
        if (event.key === 'Backspace') {
            // バックスペース処理
            this.dialogData.importData = currentText.slice(0, -1);
        } else if (event.key === 'Enter') {
            // 改行処理
            this.dialogData.importData = currentText + '\n';
        } else if (event.key.length === 1) {
            // 通常の文字入力
            this.dialogData.importData = currentText + event.key;
        }
        
        // エラーメッセージをクリア
        this.dialogData.error = null;
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
        let maxFocus = this.tabs.length; // タブ数 + 戻るボタン
        
        // ユーザー管理画面では追加のフォーカス可能要素がある
        if (this.currentTab === 'management') {
            maxFocus += 3; // ユーザー名変更、エクスポート、インポートボタン
        }
        
        this.focusedElement = (this.focusedElement + direction + maxFocus + 1) % (maxFocus + 1);
    }

    /**
     * フォーカスされた要素を実行
     */
    activateFocusedElement() {
        if (this.focusedElement < this.tabs.length) {
            this.switchTab(this.tabs[this.focusedElement]);
        } else if (this.currentTab === 'management') {
            // ユーザー管理画面のボタン処理
            const buttonIndex = this.focusedElement - this.tabs.length;
            switch (buttonIndex) {
                case 0: // 戻るボタン
                    this.sceneManager.switchScene('menu');
                    break;
                case 1: // ユーザー名変更ボタン
                    this.showUsernameChangeDialog();
                    break;
                case 2: // エクスポートボタン
                    this.showDataExportDialog();
                    break;
                case 3: // インポートボタン
                    this.showDataImportDialog();
                    break;
            }
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

    /**
     * アクセシビリティ設定を読み込み
     */
    loadAccessibilitySettings() {
        try {
            // ブラウザのメディアクエリから設定を検出
            this.accessibilitySettings.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            this.accessibilitySettings.highContrast = window.matchMedia('(prefers-contrast: high)').matches;
            
            // ローカルストレージから設定を読み込み
            const saved = localStorage.getItem('bubblePop_accessibility');
            if (saved) {
                const settings = JSON.parse(saved);
                this.accessibilitySettings = { ...this.accessibilitySettings, ...settings };
            }
        } catch (error) {
            console.warn('Failed to load accessibility settings:', error);
        }
    }

    /**
     * アクセシビリティ対応の色を取得
     */
    getAccessibleColor(normalColor, highContrastColor) {
        return this.accessibilitySettings.highContrast ? highContrastColor : normalColor;
    }

    /**
     * アクセシビリティ対応のフォントサイズを取得
     */
    getAccessibleFontSize(normalSize) {
        const multiplier = this.accessibilitySettings.largeText ? 1.5 : 1;
        return Math.round(normalSize * multiplier);
    }

    /**
     * タッチデバイス対応のボタンサイズを計算
     */
    getTouchFriendlySize(normalSize) {
        // タッチデバイスの場合は最小44pxのタップ領域を確保
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        return isTouchDevice ? Math.max(normalSize, 44) : normalSize;
    }
    
    /**
     * ヘルプシステムを初期化
     */
    initializeHelpSystem() {
        try {
            // 実績マネージャーが利用可能な場合のみヘルプシステムを初期化
            if (this.gameEngine.achievementManager) {
                this.helpSystem = new AchievementHelpSystem(this.gameEngine.achievementManager);
            }
        } catch (error) {
            console.warn('Failed to initialize help system:', error);
            this.helpSystem = null;
        }
    }
    
    /**
     * ヘルプコンテンツを描画
     */
    renderHelp(context, y, height) {
        const canvas = this.gameEngine.canvas;
        const contentWidth = canvas.width - this.contentPadding * 2;
        
        let currentY = y + this.contentPadding;
        
        // ヘルプシステムが利用可能かチェック
        if (!this.helpSystem) {
            context.fillStyle = '#cccccc';
            context.font = '18px Arial';
            context.textAlign = 'center';
            context.fillText('ヘルプシステムは利用できません', canvas.width / 2, currentY + 50);
            return;
        }
        
        // ヘルプセクション選択UI
        currentY = this.renderHelpSectionSelector(context, this.contentPadding, currentY, contentWidth);
        currentY += 20;
        
        // 選択されたヘルプコンテンツ表示
        this.renderHelpContent(context, this.contentPadding, currentY, contentWidth, height - (currentY - y) - 20);
    }
    
    /**
     * ヘルプセクション選択UIを描画
     */
    renderHelpSectionSelector(context, x, y, width) {
        const helpSections = ['overview', 'categories', 'progress', 'rewards', 'tips', 'faq'];
        const sectionLabels = ['概要', 'カテゴリ', '進捗', '報酬', 'コツ', 'FAQ'];
        
        const buttonWidth = Math.min(100, width / helpSections.length - 10);
        const buttonHeight = 35;
        
        let currentX = x;
        
        for (let i = 0; i < helpSections.length; i++) {
            const section = helpSections[i];
            const label = sectionLabels[i];
            const isActive = this.helpSystem.currentHelpSection === section;
            
            // ボタン背景
            context.fillStyle = isActive ? '#4CAF50' : '#2196F3';
            context.fillRect(currentX, y, buttonWidth, buttonHeight);
            
            // ボタン枠線
            context.strokeStyle = '#333';
            context.lineWidth = 1;
            context.strokeRect(currentX, y, buttonWidth, buttonHeight);
            
            // ボタンテキスト
            context.fillStyle = '#ffffff';
            context.font = '12px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(label, currentX + buttonWidth / 2, y + buttonHeight / 2);
            
            currentX += buttonWidth + 10;
            
            // 改行処理（必要に応じて）
            if (currentX + buttonWidth > x + width) {
                currentX = x;
                y += buttonHeight + 10;
            }
        }
        
        return y + buttonHeight;
    }
    
    /**
     * ヘルプコンテンツを描画
     */
    renderHelpContent(context, x, y, width, height) {
        if (!this.helpSystem.helpContent) return;
        
        const currentSection = this.helpSystem.currentHelpSection;
        const content = this.helpSystem.helpContent[currentSection];
        
        if (!content) return;
        
        // セクション背景
        context.fillStyle = '#16213e';
        context.fillRect(x, y, width, height);
        
        // セクション枠線
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height);
        
        const padding = 15;
        const textX = x + padding;
        let currentY = y + padding;
        
        // セクションタイトル
        context.fillStyle = '#FFD700';
        context.font = 'bold 20px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText(`${content.icon} ${content.title}`, textX, currentY);
        currentY += 35;
        
        // コンテンツ描画
        const lineHeight = 20;
        const maxY = y + height - padding;
        
        for (const line of content.content) {
            if (currentY + lineHeight > maxY) break;
            
            if (line === '') {
                currentY += lineHeight / 2;
                continue;
            }
            
            // 文字色とフォントを設定
            if (line.startsWith('🎯 ') || line.startsWith('⏰ ') || 
                line.startsWith('🎮 ') || line.startsWith('🎨 ') || 
                line.startsWith('⭐ ') || line.startsWith('💰 ') || 
                line.startsWith('🛍️ ') || line.startsWith('📊 ') ||
                line.startsWith('🎁 ')) {
                context.fillStyle = '#FFD700';
                context.font = 'bold 14px Arial';
            } else if (line.startsWith('• ')) {
                context.fillStyle = '#cccccc';
                context.font = '13px Arial';
            } else if (line.startsWith('Q: ')) {
                context.fillStyle = '#4CAF50';
                context.font = 'bold 14px Arial';
            } else if (line.startsWith('A: ')) {
                context.fillStyle = '#ffffff';
                context.font = '14px Arial';
            } else {
                context.fillStyle = '#ffffff';
                context.font = '14px Arial';
            }
            
            // 文字列の折り返し描画
            this.renderWrappedHelpText(context, line, textX, currentY, width - padding * 2, lineHeight);
            currentY += lineHeight;
        }
    }
    
    /**
     * ヘルプテキストの折り返し描画
     */
    renderWrappedHelpText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line.trim(), x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line.trim(), x, currentY);
    }
    
    /**
     * ヘルプセクション選択のクリック処理
     */
    handleHelpSectionClick(x, y) {
        const helpSections = ['overview', 'categories', 'progress', 'rewards', 'tips', 'faq'];
        const canvas = this.gameEngine.canvas;
        const contentWidth = canvas.width - this.contentPadding * 2;
        const buttonWidth = Math.min(100, contentWidth / helpSections.length - 10);
        const buttonHeight = 35;
        const selectorY = this.headerHeight + this.contentPadding;
        
        // セクション選択ボタンの範囲内かチェック
        if (y >= selectorY && y <= selectorY + buttonHeight) {
            let currentX = this.contentPadding;
            
            for (let i = 0; i < helpSections.length; i++) {
                // ボタンの範囲内かチェック
                if (x >= currentX && x <= currentX + buttonWidth) {
                    if (this.helpSystem) {
                        this.helpSystem.changeHelpSection(helpSections[i]);
                    }
                    return;
                }
                
                currentX += buttonWidth + 10;
                
                // 改行処理（必要に応じて）
                if (currentX + buttonWidth > this.contentPadding + contentWidth) {
                    break; // 現在は1行のみ対応
                }
            }
        }
    }
}