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