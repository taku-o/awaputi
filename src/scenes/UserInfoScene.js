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
        
        // アクセシビリティ設定
        this.accessibilitySettings = {
            highContrast: false,
            largeText: false,
            reducedMotion: false
        };
        
        // アクセシビリティ設定を読み込み
        this.loadAccessibilitySettings();
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
            this.renderStageStatsSection(context, this.contentPadding, currentY + 20, contentWidth, sectionHeight);
        } else {
            // 中画面・大画面: 2列レイアウト
            const columnWidth = contentWidth / 2;
            currentY = this.renderBasicStatsSection(context, this.contentPadding, currentY, columnWidth, sectionHeight);
            currentY = this.renderBubbleStatsSection(context, this.contentPadding + columnWidth, currentY - sectionHeight - 20, columnWidth, sectionHeight);
            currentY = this.renderComboStatsSection(context, this.contentPadding, currentY, columnWidth, sectionHeight);
            this.renderStageStatsSection(context, this.contentPadding + columnWidth, currentY - sectionHeight - 20, columnWidth, sectionHeight);
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
        
        const canvas = this.gameEngine.canvas;
        const contentWidth = canvas.width - this.contentPadding * 2;
        const achievementHeight = 80;
        const spacing = 10;
        
        // スクロール対応
        const scrollOffset = this.scrollPosition;
        let currentY = y + this.contentPadding - scrollOffset;
        
        // 解除済み実績と未解除実績を分離
        const unlockedAchievements = this.achievementsData.filter(a => a.unlocked);
        const lockedAchievements = this.achievementsData.filter(a => !a.unlocked);
        
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
            this.renderProgressBar(context, x + 60, y + 55, width - 80, achievement.progress);
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
        
        // 説明
        context.fillStyle = '#cccccc';
        context.font = '14px Arial';
        context.fillText('JSONデータを貼り付けてください', x + width / 2, y + 55);
        
        // 入力エリア（シミュレーション）
        const fieldX = x + 20;
        const fieldY = y + 80;
        const fieldWidth = width - 40;
        const fieldHeight = 80;
        
        context.fillStyle = '#ffffff';
        context.fillRect(fieldX, fieldY, fieldWidth, fieldHeight);
        
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(fieldX, fieldY, fieldWidth, fieldHeight);
        
        // エラーメッセージ
        if (this.dialogData.error) {
            context.fillStyle = '#cc0000';
            context.font = '12px Arial';
            context.textAlign = 'center';
            context.fillText(this.dialogData.error, x + width / 2, y + 180);
        }
        
        // ボタン
        this.renderDialogButtons(context, x, y + height - 60, width);
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
        
        // ユーザー管理画面のボタンクリック処理
        if (this.currentTab === 'management') {
            this.handleManagementClick(x, y);
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
        
        // ボタンクリック処理
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
            error: null
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
     * データインポート処理
     */
    processDataImport() {
        // 実際の実装では、クリップボードから読み取りまたはファイル選択を行う
        // ここではプレースホルダー実装
        this.dialogData.error = 'インポート機能は実装中です';
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
}