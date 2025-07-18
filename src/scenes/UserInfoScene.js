import { Scene } from '../core/SceneManager.js';

/**
 * ユーザー情報管理シーン
 * より詳細なユーザー情報表示、スコア確認、統計情報、データ管理機能を提供
 */
export class UserInfoScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        this.selectedTabIndex = 0;
        this.tabs = [
            { id: 'profile', label: 'プロフィール' },
            { id: 'scores', label: 'スコア' },
            { id: 'statistics', label: '統計' },
            { id: 'data', label: 'データ管理' }
        ];
        this.showingDataClearConfirmation = false;
        this.showingDataExport = false;
        this.exportData = '';
        this.importData = '';
        this.scrollOffset = 0;
        this.maxScrollOffset = 0;
    }
    
    /**
     * シーン開始時の処理
     */
    enter() {
        this.selectedTabIndex = 0;
        this.showingDataClearConfirmation = false;
        this.showingDataExport = false;
        this.scrollOffset = 0;
        this.calculateScrollLimit();
    }
    
    /**
     * スクロール制限を計算
     */
    calculateScrollLimit() {
        const currentTab = this.tabs[this.selectedTabIndex];
        let contentHeight = 0;
        
        if (currentTab.id === 'scores') {
            const playerData = this.gameEngine.playerData;
            const scoreCount = Object.keys(playerData.highScores).length;
            contentHeight = Math.max(0, scoreCount * 30 - 300); // 表示領域を超える分
        } else if (currentTab.id === 'statistics') {
            contentHeight = Math.max(0, 400 - 300); // 統計表示の高さ
        }
        
        this.maxScrollOffset = Math.max(0, contentHeight);
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // 特に更新処理は不要
    }
    
    /**
     * 描画処理
     */
    render(context) {
        const canvas = this.gameEngine.canvas;
        
        // 背景
        context.fillStyle = '#001122';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.showingDataClearConfirmation) {
            this.renderDataClearConfirmation(context);
        } else if (this.showingDataExport) {
            this.renderDataExport(context);
        } else {
            this.renderMainContent(context);
        }
    }
    
    /**
     * メインコンテンツを描画
     */
    renderMainContent(context) {
        const canvas = this.gameEngine.canvas;
        
        // タイトル
        context.save();
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('ユーザー情報管理', canvas.width / 2, 50);
        context.restore();
        
        // タブを描画
        this.renderTabs(context);
        
        // タブコンテンツを描画
        this.renderTabContent(context);
        
        // 戻るボタン
        this.renderBackButton(context);
        
        // 操作説明
        this.renderControls(context);
    }
    
    /**
     * タブを描画
     */
    renderTabs(context) {
        const canvas = this.gameEngine.canvas;
        const tabWidth = 150;
        const tabHeight = 40;
        const startX = (canvas.width - (tabWidth * this.tabs.length)) / 2;
        const tabY = 80;
        
        this.tabs.forEach((tab, index) => {
            const x = startX + index * tabWidth;
            const isSelected = index === this.selectedTabIndex;
            
            context.save();
            
            // タブ背景
            context.fillStyle = isSelected ? '#0066CC' : '#333333';
            context.fillRect(x, tabY, tabWidth, tabHeight);
            
            // タブ枠線
            context.strokeStyle = isSelected ? '#FFFFFF' : '#666666';
            context.lineWidth = 2;
            context.strokeRect(x, tabY, tabWidth, tabHeight);
            
            // タブテキスト
            context.fillStyle = '#FFFFFF';
            context.font = 'bold 14px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(tab.label, x + tabWidth / 2, tabY + tabHeight / 2);
            
            context.restore();
        });
    }
    
    /**
     * タブコンテンツを描画
     */
    renderTabContent(context) {
        const currentTab = this.tabs[this.selectedTabIndex];
        
        switch (currentTab.id) {
            case 'profile':
                this.renderProfileTab(context);
                break;
            case 'scores':
                this.renderScoresTab(context);
                break;
            case 'statistics':
                this.renderStatisticsTab(context);
                break;
            case 'data':
                this.renderDataTab(context);
                break;
        }
    }
    
    /**
     * プロフィールタブを描画
     */
    renderProfileTab(context) {
        const canvas = this.gameEngine.canvas;
        const playerData = this.gameEngine.playerData;
        
        context.save();
        context.fillStyle = '#FFFFFF';
        context.font = '20px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        const infoX = 100;
        let infoY = 150;
        const lineHeight = 35;
        
        // 基本情報
        context.fillText(`プレイヤー名: ${playerData.username || '未設定'}`, infoX, infoY);
        infoY += lineHeight;
        
        context.fillText(`所持AP: ${playerData.ap.toLocaleString()}`, infoX, infoY);
        infoY += lineHeight;
        
        context.fillText(`総TAP: ${playerData.tap.toLocaleString()}`, infoX, infoY);
        infoY += lineHeight;
        
        context.fillText(`開放済みステージ: ${playerData.unlockedStages.length}`, infoX, infoY);
        infoY += lineHeight;
        
        context.fillText(`所持アイテム: ${playerData.ownedItems.length}`, infoX, infoY);
        infoY += lineHeight + 20;
        
        // アイテム詳細
        if (playerData.ownedItems.length > 0) {
            context.fillStyle = '#CCCCCC';
            context.font = 'bold 18px Arial';
            context.fillText('所持アイテム詳細:', infoX, infoY);
            infoY += 30;
            
            context.font = '16px Arial';
            playerData.ownedItems.forEach(itemId => {
                const item = this.gameEngine.itemSystem.getItem(itemId);
                if (item) {
                    context.fillText(`• ${item.name}: ${item.description}`, infoX + 20, infoY);
                    infoY += 25;
                }
            });
        } else {
            context.fillStyle = '#AAAAAA';
            context.font = '16px Arial';
            context.fillText('アイテムを所持していません', infoX, infoY);
        }
        
        context.restore();
    }
    
    /**
     * スコアタブを描画
     */
    renderScoresTab(context) {
        const canvas = this.gameEngine.canvas;
        const playerData = this.gameEngine.playerData;
        
        context.save();
        
        // スクロール領域設定
        context.rect(50, 140, canvas.width - 100, 350);
        context.clip();
        
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        const infoX = 100;
        let infoY = 150 - this.scrollOffset;
        const lineHeight = 30;
        
        context.fillText('ステージ別ハイスコア', infoX, infoY);
        infoY += 40;
        
        if (Object.keys(playerData.highScores).length > 0) {
            context.font = '16px Arial';
            context.fillStyle = '#CCCCCC';
            
            // ヘッダー
            context.fillText('ステージ名', infoX, infoY);
            context.fillText('ハイスコア', infoX + 200, infoY);
            context.fillText('達成日時', infoX + 350, infoY);
            infoY += 25;
            
            // 区切り線
            context.strokeStyle = '#666666';
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(infoX, infoY);
            context.lineTo(infoX + 500, infoY);
            context.stroke();
            infoY += 15;
            
            // スコア一覧
            Object.entries(playerData.highScores).forEach(([stageId, scoreData]) => {
                const stageConfig = this.gameEngine.stageManager.getStageConfig(stageId);
                const stageName = stageConfig ? stageConfig.name : stageId;
                
                context.fillStyle = '#FFFFFF';
                context.fillText(stageName, infoX, infoY);
                
                const score = typeof scoreData === 'object' ? scoreData.score : scoreData;
                context.fillText(score.toLocaleString(), infoX + 200, infoY);
                
                if (typeof scoreData === 'object' && scoreData.date) {
                    const date = new Date(scoreData.date);
                    context.fillText(date.toLocaleDateString('ja-JP'), infoX + 350, infoY);
                } else {
                    context.fillText('-', infoX + 350, infoY);
                }
                
                infoY += lineHeight;
            });
        } else {
            context.fillStyle = '#AAAAAA';
            context.font = '16px Arial';
            context.fillText('まだスコア記録がありません', infoX, infoY);
        }
        
        context.restore();
        
        // スクロールバー
        if (this.maxScrollOffset > 0) {
            this.renderScrollBar(context);
        }
    }
    
    /**
     * 統計タブを描画
     */
    renderStatisticsTab(context) {
        const canvas = this.gameEngine.canvas;
        const playerData = this.gameEngine.playerData;
        
        context.save();
        
        // スクロール領域設定
        context.rect(50, 140, canvas.width - 100, 350);
        context.clip();
        
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        const infoX = 100;
        let infoY = 150 - this.scrollOffset;
        const lineHeight = 25;
        
        // プレイ統計
        context.fillText('プレイ統計', infoX, infoY);
        infoY += 35;
        
        context.font = '16px Arial';
        context.fillStyle = '#CCCCCC';
        
        // 総プレイ時間（推定）
        const estimatedPlayTime = Math.floor(playerData.tap / 1000); // 大雑把な推定
        context.fillText(`推定プレイ時間: ${estimatedPlayTime}分`, infoX, infoY);
        infoY += lineHeight;
        
        // 総獲得スコア
        const totalScore = Object.values(playerData.highScores).reduce((sum, scoreData) => {
            const score = typeof scoreData === 'object' ? scoreData.score : scoreData;
            return sum + score;
        }, 0);
        context.fillText(`総獲得スコア: ${totalScore.toLocaleString()}`, infoX, infoY);
        infoY += lineHeight;
        
        // 平均スコア
        const scoreCount = Object.keys(playerData.highScores).length;
        const averageScore = scoreCount > 0 ? Math.floor(totalScore / scoreCount) : 0;
        context.fillText(`平均スコア: ${averageScore.toLocaleString()}`, infoX, infoY);
        infoY += lineHeight;
        
        // 最高スコア
        const highestScore = Math.max(0, ...Object.values(playerData.highScores).map(scoreData => {
            return typeof scoreData === 'object' ? scoreData.score : scoreData;
        }));
        context.fillText(`最高スコア: ${highestScore.toLocaleString()}`, infoX, infoY);
        infoY += lineHeight + 20;
        
        // アイテム統計
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 18px Arial';
        context.fillText('アイテム統計', infoX, infoY);
        infoY += 35;
        
        context.font = '16px Arial';
        context.fillStyle = '#CCCCCC';
        
        const totalItemsSpent = this.calculateTotalItemsSpent(playerData);
        context.fillText(`アイテム購入総額: ${totalItemsSpent.toLocaleString()}AP`, infoX, infoY);
        infoY += lineHeight;
        
        context.fillText(`所持アイテム効果値: ${this.calculateItemEffectValue(playerData)}`, infoX, infoY);
        infoY += lineHeight + 20;
        
        // ステージ統計
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 18px Arial';
        context.fillText('ステージ統計', infoX, infoY);
        infoY += 35;
        
        context.font = '16px Arial';
        context.fillStyle = '#CCCCCC';
        
        const totalStages = Object.keys(this.gameEngine.stageManager.stageConfigs).length;
        const unlockedCount = playerData.unlockedStages.length;
        const completionRate = Math.floor((unlockedCount / totalStages) * 100);
        
        context.fillText(`ステージ開放率: ${completionRate}% (${unlockedCount}/${totalStages})`, infoX, infoY);
        infoY += lineHeight;
        
        const clearedStages = Object.keys(playerData.highScores).length;
        context.fillText(`クリア済みステージ: ${clearedStages}`, infoX, infoY);
        infoY += lineHeight;
        
        // ランク計算
        const rank = this.calculatePlayerRank(playerData);
        context.fillStyle = rank.color;
        context.font = 'bold 18px Arial';
        context.fillText(`プレイヤーランク: ${rank.name}`, infoX, infoY);
        
        context.restore();
        
        // スクロールバー
        if (this.maxScrollOffset > 0) {
            this.renderScrollBar(context);
        }
    }
    
    /**
     * データ管理タブを描画
     */
    renderDataTab(context) {
        const canvas = this.gameEngine.canvas;
        
        context.save();
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 18px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('データ管理', canvas.width / 2, 160);
        
        // ボタン
        const buttonWidth = 200;
        const buttonHeight = 45;
        const buttonX = (canvas.width - buttonWidth) / 2;
        let currentY = 200;
        const buttonSpacing = 20;
        
        // データエクスポートボタン
        this.renderDataButton(context, buttonX, currentY, buttonWidth, buttonHeight, 'データをエクスポート', '#006600');
        currentY += buttonHeight + buttonSpacing;
        
        // データインポートボタン
        this.renderDataButton(context, buttonX, currentY, buttonWidth, buttonHeight, 'データをインポート', '#0066CC');
        currentY += buttonHeight + buttonSpacing;
        
        // データクリアボタン
        currentY += 20; // 少し間隔を空ける
        this.renderDataButton(context, buttonX, currentY, buttonWidth, buttonHeight, '全データクリア', '#CC0000');
        
        // 説明文
        context.fillStyle = '#CCCCCC';
        context.font = '14px Arial';
        context.textAlign = 'center';
        currentY += buttonHeight + 40;
        
        context.fillText('エクスポート: データをテキストとして出力', canvas.width / 2, currentY);
        currentY += 20;
        context.fillText('インポート: エクスポートしたデータを読み込み', canvas.width / 2, currentY);
        currentY += 20;
        context.fillText('クリア: すべてのデータを削除（復元不可）', canvas.width / 2, currentY);
        
        context.restore();
    }
    
    /**
     * データ管理ボタンを描画
     */
    renderDataButton(context, x, y, width, height, text, color) {
        // ボタン背景
        context.fillStyle = color;
        context.fillRect(x, y, width, height);
        
        // ボタン枠線
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(x, y, width, height);
        
        // ボタンテキスト
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, x + width / 2, y + height / 2);
    }
    
    /**
     * スクロールバーを描画
     */
    renderScrollBar(context) {
        const canvas = this.gameEngine.canvas;
        const scrollBarX = canvas.width - 20;
        const scrollBarY = 140;
        const scrollBarHeight = 350;
        const scrollBarWidth = 10;
        
        // スクロールバー背景
        context.fillStyle = '#333333';
        context.fillRect(scrollBarX, scrollBarY, scrollBarWidth, scrollBarHeight);
        
        // スクロールバーハンドル
        const handleHeight = Math.max(20, scrollBarHeight * (350 / (350 + this.maxScrollOffset)));
        const handleY = scrollBarY + (this.scrollOffset / this.maxScrollOffset) * (scrollBarHeight - handleHeight);
        
        context.fillStyle = '#666666';
        context.fillRect(scrollBarX, handleY, scrollBarWidth, handleHeight);
    }
    
    /**
     * 戻るボタンを描画
     */
    renderBackButton(context) {
        const canvas = this.gameEngine.canvas;
        const buttonWidth = 100;
        const buttonHeight = 40;
        const buttonX = 50;
        const buttonY = canvas.height - 60;
        
        context.save();
        context.fillStyle = '#666666';
        context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('戻る', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        context.restore();
    }
    
    /**
     * 操作説明を描画
     */
    renderControls(context) {
        const canvas = this.gameEngine.canvas;
        
        context.save();
        context.fillStyle = '#AAAAAA';
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        
        const currentTab = this.tabs[this.selectedTabIndex];
        let controlText = '←→: タブ切替  ESC: 戻る';
        
        if (currentTab.id === 'scores' || currentTab.id === 'statistics') {
            controlText += '  ↑↓: スクロール';
        }
        
        context.fillText(controlText, canvas.width / 2, canvas.height - 20);
        context.restore();
    }
    
    /**
     * データクリア確認画面を描画
     */
    renderDataClearConfirmation(context) {
        const canvas = this.gameEngine.canvas;
        
        // 半透明オーバーレイ
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.9)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // 警告アイコン
        context.fillStyle = '#FF6666';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('⚠️', canvas.width / 2, 150);
        
        // タイトル
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 28px Arial';
        context.fillText('データクリア確認', canvas.width / 2, 200);
        
        // 警告メッセージ
        context.font = '18px Arial';
        context.fillStyle = '#FFCCCC';
        context.fillText('すべてのデータが削除されます。', canvas.width / 2, 250);
        context.fillText('この操作は取り消せません。', canvas.width / 2, 280);
        
        // ボタン
        const buttonWidth = 120;
        const buttonHeight = 45;
        const buttonY = 350;
        
        // 削除実行ボタン
        const deleteButtonX = canvas.width / 2 - buttonWidth - 15;
        context.fillStyle = '#CC0000';
        context.fillRect(deleteButtonX, buttonY, buttonWidth, buttonHeight);
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(deleteButtonX, buttonY, buttonWidth, buttonHeight);
        
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 16px Arial';
        context.fillText('削除実行', deleteButtonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        // キャンセルボタン
        const cancelButtonX = canvas.width / 2 + 15;
        context.fillStyle = '#666666';
        context.fillRect(cancelButtonX, buttonY, buttonWidth, buttonHeight);
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(cancelButtonX, buttonY, buttonWidth, buttonHeight);
        
        context.fillStyle = '#FFFFFF';
        context.fillText('キャンセル', cancelButtonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        context.restore();
    }
    
    /**
     * データエクスポート画面を描画
     */
    renderDataExport(context) {
        const canvas = this.gameEngine.canvas;
        
        // 半透明オーバーレイ
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // タイトル
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('データエクスポート', canvas.width / 2, 80);
        
        // 説明
        context.font = '16px Arial';
        context.fillStyle = '#CCCCCC';
        context.fillText('以下のデータをコピーして保存してください', canvas.width / 2, 120);
        
        // データ表示エリア
        const textAreaX = 50;
        const textAreaY = 150;
        const textAreaWidth = canvas.width - 100;
        const textAreaHeight = 250;
        
        context.fillStyle = '#FFFFFF';
        context.fillRect(textAreaX, textAreaY, textAreaWidth, textAreaHeight);
        
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.strokeRect(textAreaX, textAreaY, textAreaWidth, textAreaHeight);
        
        // エクスポートデータ
        context.fillStyle = '#000000';
        context.font = '12px monospace';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        const lines = this.exportData.split('\n');
        const maxLines = Math.floor(textAreaHeight / 15);
        
        for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
            context.fillText(lines[i].substring(0, 80), textAreaX + 10, textAreaY + 10 + i * 15);
        }
        
        // 閉じるボタン
        const buttonWidth = 100;
        const buttonHeight = 40;
        const buttonX = (canvas.width - buttonWidth) / 2;
        const buttonY = 430;
        
        context.fillStyle = '#666666';
        context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('閉じる', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        context.restore();
    }
    
    /**
     * 入力処理
     */
    handleInput(event) {
        if (this.showingDataClearConfirmation) {
            this.handleDataClearConfirmationInput(event);
        } else if (this.showingDataExport) {
            this.handleDataExportInput(event);
        } else {
            this.handleMainInput(event);
        }
    }
    
    /**
     * メイン画面の入力処理
     */
    handleMainInput(event) {
        if (event.type === 'keydown') {
            switch (event.code) {
                case 'ArrowLeft':
                    this.moveTab(-1);
                    break;
                case 'ArrowRight':
                    this.moveTab(1);
                    break;
                case 'ArrowUp':
                    this.scroll(-30);
                    break;
                case 'ArrowDown':
                    this.scroll(30);
                    break;
                case 'Escape':
                    this.goBack();
                    break;
            }
        } else if (event.type === 'click') {
            this.handleMainClick(event);
        }
    }
    
    /**
     * メイン画面のクリック処理
     */
    handleMainClick(event) {
        const canvas = this.gameEngine.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // タブクリック判定
        const tabWidth = 150;
        const tabHeight = 40;
        const startX = (canvas.width - (tabWidth * this.tabs.length)) / 2;
        const tabY = 80;
        
        for (let i = 0; i < this.tabs.length; i++) {
            const tabX = startX + i * tabWidth;
            if (x >= tabX && x <= tabX + tabWidth && y >= tabY && y <= tabY + tabHeight) {
                this.selectedTabIndex = i;
                this.scrollOffset = 0;
                this.calculateScrollLimit();
                return;
            }
        }
        
        // 戻るボタンクリック判定
        const backButtonX = 50;
        const backButtonY = canvas.height - 60;
        const backButtonWidth = 100;
        const backButtonHeight = 40;
        
        if (x >= backButtonX && x <= backButtonX + backButtonWidth && 
            y >= backButtonY && y <= backButtonY + backButtonHeight) {
            this.goBack();
            return;
        }
        
        // データ管理タブの場合のボタンクリック判定
        if (this.tabs[this.selectedTabIndex].id === 'data') {
            this.handleDataTabClick(x, y);
        }
    }
    
    /**
     * データタブのクリック処理
     */
    handleDataTabClick(x, y) {
        const canvas = this.gameEngine.canvas;
        const buttonWidth = 200;
        const buttonHeight = 45;
        const buttonX = (canvas.width - buttonWidth) / 2;
        const buttonSpacing = 20;
        
        let currentY = 200;
        
        // データエクスポートボタン
        if (x >= buttonX && x <= buttonX + buttonWidth && y >= currentY && y <= currentY + buttonHeight) {
            this.exportPlayerData();
            return;
        }
        currentY += buttonHeight + buttonSpacing;
        
        // データインポートボタン
        if (x >= buttonX && x <= buttonX + buttonWidth && y >= currentY && y <= currentY + buttonHeight) {
            this.importPlayerData();
            return;
        }
        currentY += buttonHeight + buttonSpacing + 20;
        
        // データクリアボタン
        if (x >= buttonX && x <= buttonX + buttonWidth && y >= currentY && y <= currentY + buttonHeight) {
            this.showDataClearConfirmation();
            return;
        }
    }
    
    /**
     * データクリア確認画面の入力処理
     */
    handleDataClearConfirmationInput(event) {
        if (event.type === 'keydown') {
            if (event.code === 'Escape') {
                this.showingDataClearConfirmation = false;
            }
        } else if (event.type === 'click') {
            const canvas = this.gameEngine.canvas;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const buttonWidth = 120;
            const buttonHeight = 45;
            const buttonY = 350;
            
            // 削除実行ボタン
            const deleteButtonX = canvas.width / 2 - buttonWidth - 15;
            if (x >= deleteButtonX && x <= deleteButtonX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                this.executeDataClear();
                return;
            }
            
            // キャンセルボタン
            const cancelButtonX = canvas.width / 2 + 15;
            if (x >= cancelButtonX && x <= cancelButtonX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                this.showingDataClearConfirmation = false;
                return;
            }
        }
    }
    
    /**
     * データエクスポート画面の入力処理
     */
    handleDataExportInput(event) {
        if (event.type === 'keydown') {
            if (event.code === 'Escape') {
                this.showingDataExport = false;
            }
        } else if (event.type === 'click') {
            const canvas = this.gameEngine.canvas;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const buttonWidth = 100;
            const buttonHeight = 40;
            const buttonX = (canvas.width - buttonWidth) / 2;
            const buttonY = 430;
            
            if (x >= buttonX && x <= buttonX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                this.showingDataExport = false;
            }
        }
    }
    
    /**
     * タブを移動
     */
    moveTab(direction) {
        this.selectedTabIndex += direction;
        
        if (this.selectedTabIndex < 0) {
            this.selectedTabIndex = this.tabs.length - 1;
        } else if (this.selectedTabIndex >= this.tabs.length) {
            this.selectedTabIndex = 0;
        }
        
        this.scrollOffset = 0;
        this.calculateScrollLimit();
    }
    
    /**
     * スクロール
     */
    scroll(amount) {
        const currentTab = this.tabs[this.selectedTabIndex];
        
        if (currentTab.id === 'scores' || currentTab.id === 'statistics') {
            this.scrollOffset += amount;
            this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, this.maxScrollOffset));
        }
    }
    
    /**
     * プレイヤーデータをエクスポート
     */
    exportPlayerData() {
        const playerData = this.gameEngine.playerData;
        const exportData = {
            username: playerData.username,
            ap: playerData.ap,
            tap: playerData.tap,
            highScores: playerData.highScores,
            unlockedStages: playerData.unlockedStages,
            ownedItems: playerData.ownedItems,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        this.exportData = JSON.stringify(exportData, null, 2);
        this.showingDataExport = true;
        
        // クリップボードにコピー（可能な場合）
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.exportData).then(() => {
                console.log('Data copied to clipboard');
            }).catch(err => {
                console.log('Failed to copy to clipboard:', err);
            });
        }
    }
    
    /**
     * プレイヤーデータをインポート
     */
    importPlayerData() {
        // 実際の実装では、ファイル選択ダイアログやテキスト入力エリアを表示
        // ここでは簡単な実装として、プロンプトを使用
        const importText = prompt('エクスポートしたデータを貼り付けてください:');
        
        if (importText) {
            try {
                const importData = JSON.parse(importText);
                
                // データの妥当性をチェック
                if (this.validateImportData(importData)) {
                    // データを復元
                    const playerData = this.gameEngine.playerData;
                    playerData.username = importData.username || '';
                    playerData.ap = importData.ap || 0;
                    playerData.tap = importData.tap || 0;
                    playerData.highScores = importData.highScores || {};
                    playerData.unlockedStages = importData.unlockedStages || ['tutorial', 'normal'];
                    playerData.ownedItems = importData.ownedItems || [];
                    
                    playerData.save();
                    
                    alert('データのインポートが完了しました。');
                } else {
                    alert('無効なデータ形式です。');
                }
            } catch (error) {
                alert('データの読み込みに失敗しました。');
                console.error('Import error:', error);
            }
        }
    }
    
    /**
     * インポートデータの妥当性チェック
     */
    validateImportData(data) {
        if (!data || typeof data !== 'object') return false;
        
        // 必須フィールドのチェック
        const requiredFields = ['username', 'ap', 'tap', 'highScores', 'unlockedStages', 'ownedItems'];
        
        for (const field of requiredFields) {
            if (!(field in data)) return false;
        }
        
        // 型チェック
        if (typeof data.username !== 'string') return false;
        if (typeof data.ap !== 'number' || data.ap < 0) return false;
        if (typeof data.tap !== 'number' || data.tap < 0) return false;
        if (!Array.isArray(data.unlockedStages)) return false;
        if (!Array.isArray(data.ownedItems)) return false;
        if (typeof data.highScores !== 'object') return false;
        
        return true;
    }
    
    /**
     * データクリア確認画面を表示
     */
    showDataClearConfirmation() {
        this.showingDataClearConfirmation = true;
    }
    
    /**
     * データクリアを実行
     */
    executeDataClear() {
        // プレイヤーデータをリセット
        const playerData = this.gameEngine.playerData;
        playerData.username = '';
        playerData.ap = 0;
        playerData.tap = 0;
        playerData.highScores = {};
        playerData.unlockedStages = ['tutorial', 'normal'];
        playerData.ownedItems = [];
        
        // ローカルストレージからも削除
        localStorage.removeItem('bubblePop_playerData');
        
        this.showingDataClearConfirmation = false;
        alert('すべてのデータがクリアされました。');
        
        // メインメニューに戻る
        this.sceneManager.switchScene('mainMenu');
    }
    
    /**
     * アイテム購入総額を計算
     */
    calculateTotalItemsSpent(playerData) {
        let total = 0;
        
        playerData.ownedItems.forEach(itemId => {
            const item = this.gameEngine.itemSystem.getItem(itemId);
            if (item) {
                total += item.price;
            }
        });
        
        return total;
    }
    
    /**
     * アイテム効果値を計算
     */
    calculateItemEffectValue(playerData) {
        const effects = [];
        
        playerData.ownedItems.forEach(itemId => {
            const item = this.gameEngine.itemSystem.getItem(itemId);
            if (item) {
                if (item.effect.type === 'scoreMultiplier') {
                    effects.push(`スコア×${item.effect.value}`);
                } else if (item.effect.type === 'revival') {
                    effects.push('復活');
                } else if (item.effect.type === 'rareBubbleRate') {
                    effects.push(`レア率+${Math.floor((item.effect.value - 1) * 100)}%`);
                }
            }
        });
        
        return effects.length > 0 ? effects.join(', ') : 'なし';
    }
    
    /**
     * プレイヤーランクを計算
     */
    calculatePlayerRank(playerData) {
        const tap = playerData.tap;
        
        if (tap >= 1000000) {
            return { name: 'マスター', color: '#FFD700' };
        } else if (tap >= 500000) {
            return { name: 'エキスパート', color: '#FF6600' };
        } else if (tap >= 100000) {
            return { name: 'アドバンス', color: '#9966FF' };
        } else if (tap >= 50000) {
            return { name: 'インターミディエート', color: '#0066FF' };
        } else if (tap >= 10000) {
            return { name: 'ビギナー', color: '#00CC00' };
        } else {
            return { name: 'ノービス', color: '#CCCCCC' };
        }
    }
    
    /**
     * 前の画面に戻る
     */
    goBack() {
        this.sceneManager.switchScene('mainMenu');
    }
}