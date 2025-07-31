import { Scene } from '../core/Scene.js';

/**
 * ステージ選択シーン
 */
export class StageSelectScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        this.selectedStageIndex = 0;
        this.unlockedStages = [];
        this.lockedStages = [];
        this.scrollOffset = 0;
        this.maxVisibleStages = 8;
        
        // イベント関連の状態
        this.availableEvents = [];
        this.selectedEventIndex = -1;
        this.showingEvents = false;
        this.eventScrollOffset = 0;
        this.maxVisibleEvents = 4;
    }
    
    /**
     * シーン開始時の処理
     */
    enter() {
        this.updateStageList();
        this.updateEventList();
        this.selectedStageIndex = 0;
        this.scrollOffset = 0;
        this.selectedEventIndex = -1;
        this.eventScrollOffset = 0;
    }
    
    /**
     * ステージリストを更新
     */
    updateStageList() {
        const stageManager = this.gameEngine.stageManager;
        this.unlockedStages = stageManager.getUnlockedStages();
        this.lockedStages = stageManager.getLockedStages();
    }

    /**
     * 利用可能なイベントリストを更新
     */
    updateEventList() {
        if (this.gameEngine.eventStageManager) {
            this.availableEvents = this.gameEngine.eventStageManager.getAvailableEvents();
        } else {
            this.availableEvents = [];
        }
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
        
        // タイトル
        context.save();
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText('ステージ選択', canvas.width / 2, 20);
        context.restore();
        
        // プレイヤー情報
        this.renderPlayerInfo(context);
        
        // イベントセクション
        this.renderEventSection(context);
        
        // 通常ステージリスト
        this.renderStageList(context);
        
        // ショップボタン
        this.renderShopButton(context);
        
        // 操作説明
        this.renderControls(context);
    }
    
    /**
     * プレイヤー情報を描画
     */
    renderPlayerInfo(context) {
        const canvas = this.gameEngine.canvas;
        const playerData = this.gameEngine.playerData;
        
        context.save();
        context.fillStyle = '#CCCCCC';
        context.font = '16px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        const infoY = 70;
        context.fillText(`プレイヤー: ${playerData.username || '名無し'}`, 20, infoY);
        context.fillText(`AP: ${playerData.ap}`, 20, infoY + 25);
        context.fillText(`TAP: ${playerData.tap}`, 20, infoY + 50);
        
        context.restore();
    }

    /**
     * イベント専用セクションを描画
     */
    renderEventSection(context) {
        const canvas = this.gameEngine.canvas;
        const sectionStartY = 120;
        const sectionHeight = 200;
        const sectionWidth = canvas.width - 40;
        const sectionX = 20;
        
        // イベントセクションの背景
        context.save();
        context.fillStyle = 'rgba(255, 215, 0, 0.1)';
        context.strokeStyle = '#FFD700';
        context.lineWidth = 2;
        context.fillRect(sectionX, sectionStartY, sectionWidth, sectionHeight);
        context.strokeRect(sectionX, sectionStartY, sectionWidth, sectionHeight);
        
        // イベントセクションタイトル
        context.fillStyle = '#FFD700';
        context.font = 'bold 24px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('🎉 期間限定イベント', sectionX + 10, sectionStartY + 10);
        
        context.restore();
        
        // イベントがない場合のメッセージ
        if (this.availableEvents.length === 0) {
            context.save();
            context.fillStyle = '#CCCCCC';
            context.font = '18px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('現在開催中のイベントはありません', 
                canvas.width / 2, sectionStartY + sectionHeight / 2);
            context.fillText('次回イベントをお楽しみに！', 
                canvas.width / 2, sectionStartY + sectionHeight / 2 + 25);
            context.restore();
            return;
        }
        
        // イベントアイテムを描画
        const itemHeight = 40;
        const itemSpacing = 5;
        let currentY = sectionStartY + 50;
        
        this.availableEvents.forEach((event, index) => {
            if (index < this.eventScrollOffset) return;
            if (index >= this.eventScrollOffset + this.maxVisibleEvents) return;
            if (currentY + itemHeight > sectionStartY + sectionHeight - 10) return;
            
            const isSelected = index === this.selectedEventIndex;
            this.renderEventStageItem(context, event, sectionX + 10, currentY, 
                sectionWidth - 20, itemHeight, isSelected);
            currentY += itemHeight + itemSpacing;
        });
    }

    /**
     * イベントステージアイテムを描画
     */
    renderEventStageItem(context, event, x, y, width, height, isSelected) {
        context.save();
        
        // アイテム背景
        if (isSelected) {
            context.fillStyle = 'rgba(255, 215, 0, 0.3)';
            context.strokeStyle = '#FFD700';
            context.lineWidth = 2;
        } else {
            context.fillStyle = 'rgba(255, 255, 255, 0.1)';
            context.strokeStyle = '#888888';
            context.lineWidth = 1;
        }
        
        context.fillRect(x, y, width, height);
        context.strokeRect(x, y, width, height);
        
        // イベントタイプアイコン
        const iconSize = 24;
        const iconX = x + 10;
        const iconY = y + (height - iconSize) / 2;
        
        context.font = `${iconSize}px Arial`;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        
        // タイプに応じたアイコン
        let icon = '🎪';
        if (event.type === 'seasonal') {
            if (event.season === 'spring') icon = '🌸';
            else if (event.season === 'summer') icon = '🎆';
            else if (event.season === 'autumn') icon = '🍂';
            else if (event.season === 'winter') icon = '❄️';
        } else if (event.type === 'special') {
            icon = '⭐';
        } else if (event.type === 'challenge') {
            icon = '🏆';
        }
        
        context.fillText(icon, iconX, iconY + iconSize / 2);
        
        // イベント名
        const nameX = iconX + iconSize + 10;
        const nameY = y + height / 2 - 5;
        
        context.fillStyle = isSelected ? '#FFD700' : '#FFFFFF';
        context.font = 'bold 16px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText(event.name, nameX, nameY);
        
        // 残り時間表示
        const timeRemaining = this.gameEngine.eventStageManager.getEventTimeRemaining(event.id);
        if (timeRemaining > 0) {
            this.renderEventTimer(context, timeRemaining, x + width - 120, y + height / 2 + 5, 110, 15);
        }
        
        // 新規バッジ（最近開始されたイベント）
        const now = Date.now();
        const eventStartTime = event.schedule?.activatedAt || event.activatedAt;
        if (eventStartTime && (now - eventStartTime) < 24 * 60 * 60 * 1000) { // 24時間以内
            context.fillStyle = '#FF4444';
            context.font = 'bold 12px Arial';
            context.textAlign = 'right';
            context.textBaseline = 'top';
            context.fillText('NEW!', x + width - 10, y + 5);
        }
        
        context.restore();
    }

    /**
     * イベント残り時間を表示
     */
    renderEventTimer(context, timeRemaining, x, y, width, height) {
        context.save();
        
        // 残り時間の計算
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        let timeText = '';
        let urgencyLevel = 'normal'; // normal, warning, critical
        
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            timeText = `残り ${days}日`;
        } else if (hours > 0) {
            timeText = `残り ${hours}:${minutes.toString().padStart(2, '0')}`;
            if (hours < 6) urgencyLevel = 'warning';
        } else {
            timeText = `残り ${minutes}:${seconds.toString().padStart(2, '0')}`;
            urgencyLevel = 'critical';
        }
        
        // 背景色（緊急度に応じて）
        let bgColor, textColor;
        switch (urgencyLevel) {
            case 'critical':
                bgColor = 'rgba(255, 68, 68, 0.8)';
                textColor = '#FFFFFF';
                break;
            case 'warning':
                bgColor = 'rgba(255, 165, 0, 0.8)';
                textColor = '#FFFFFF';
                break;
            default:
                bgColor = 'rgba(34, 197, 94, 0.8)';
                textColor = '#FFFFFF';
        }
        
        // タイマー背景
        context.fillStyle = bgColor;
        context.fillRect(x, y, width, height);
        
        // タイマーテキスト
        context.fillStyle = textColor;
        context.font = 'bold 12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(timeText, x + width / 2, y + height / 2);
        
        context.restore();
    }
    
    /**
     * ステージリストを描画
     */
    renderStageList(context) {
        const canvas = this.gameEngine.canvas;
        const startY = 340; // イベントセクション分下にずらす
        const itemHeight = 60;
        const itemWidth = canvas.width - 40;
        const itemX = 20;
        
        // セクションタイトル
        context.save();
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 20px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('通常ステージ', itemX, startY - 30);
        context.restore();
        
        // 開放済みステージ
        let currentY = startY;
        this.unlockedStages.forEach((stage, index) => {
            if (index < this.scrollOffset) return;
            if (index >= this.scrollOffset + this.maxVisibleStages) return;
            
            const isSelected = index === this.selectedStageIndex && !this.showingEvents;
            this.renderStageItem(context, stage, itemX, currentY, itemWidth, itemHeight, isSelected, false);
            currentY += itemHeight + 10;
        });
        
        // ロック済みステージ
        this.lockedStages.forEach((stage, index) => {
            const adjustedIndex = this.unlockedStages.length + index;
            if (adjustedIndex < this.scrollOffset) return;
            if (adjustedIndex >= this.scrollOffset + this.maxVisibleStages) return;
            
            const isSelected = adjustedIndex === this.selectedStageIndex && !this.showingEvents;
            this.renderStageItem(context, stage, itemX, currentY, itemWidth, itemHeight, isSelected, true);
            currentY += itemHeight + 10;
        });
    }
    
    /**
     * ステージアイテムを描画
     */
    renderStageItem(context, stage, x, y, width, height, isSelected, isLocked) {
        context.save();
        
        // 背景
        if (isSelected) {
            context.fillStyle = isLocked ? '#444444' : '#0066CC';
        } else {
            context.fillStyle = isLocked ? '#222222' : '#333333';
        }
        context.fillRect(x, y, width, height);
        
        // 枠線
        context.strokeStyle = isSelected ? '#FFFFFF' : '#666666';
        context.lineWidth = 2;
        context.strokeRect(x, y, width, height);
        
        // テキスト色
        context.fillStyle = isLocked ? '#888888' : '#FFFFFF';
        
        // ステージ名
        context.font = 'bold 20px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        const stageName = isLocked ? `🔒 ${stage.name}` : stage.name;
        context.fillText(stageName, x + 15, y + 10);
        
        // 説明文
        context.font = '14px Arial';
        context.fillStyle = isLocked ? '#666666' : '#CCCCCC';
        const description = isLocked ? stage.unlockMessage : stage.description;
        context.fillText(description, x + 15, y + 35);
        
        // 時間表示（開放済みのみ）
        if (!isLocked && stage.duration) {
            context.font = '12px Arial';
            context.textAlign = 'right';
            context.fillStyle = '#AAAAAA';
            const minutes = Math.floor(stage.duration / 60000);
            const seconds = Math.floor((stage.duration % 60000) / 1000);
            const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            context.fillText(timeText, x + width - 15, y + 10);
        }
        
        context.restore();
    }
    
    /**
     * ショップボタンを描画
     */
    renderShopButton(context) {
        const canvas = this.gameEngine.canvas;
        const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonX = canvas.width - buttonWidth - 20;
        const buttonY = 70;
        
        context.save();
        
        // ボタン背景
        context.fillStyle = '#0066CC';
        context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // ボタン枠線
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // ボタンテキスト
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('ショップ (S)', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        context.restore();
    }
    
    /**
     * 操作説明を描画
     */
    renderControls(context) {
        const canvas = this.gameEngine.canvas;
        
        context.save();
        context.fillStyle = '#AAAAAA';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        
        const controlsY = canvas.height - 40;
        context.fillText('↑↓: 選択  Enter: 決定  S: ショップ  H: ヘルプ  ESC: 戻る', canvas.width / 2, controlsY);
        context.fillText('クリックでも操作できます', canvas.width / 2, controlsY + 20);
        
        context.restore();
    }
    
    /**
     * 入力処理
     */
    handleInput(event) {
        if (event.type === 'keydown') {
            switch (event.code) {
                case 'ArrowUp':
                    this.moveSelection(-1);
                    break;
                case 'ArrowDown':
                    this.moveSelection(1);
                    break;
                case 'Enter':
                    this.selectStage();
                    break;
                case 'KeyS':
                    this.sceneManager.switchScene('shop');
                    break;
                case 'KeyH':
                    this.gameEngine.sceneManager.switchScene('help');
                    break;
                case 'Escape':
                    this.sceneManager.switchScene('menu');
                    break;
            }
        } else if (event.type === 'click') {
            this.handleClick(event);
        }
    }
    
    /**
     * クリック処理
     */
    handleClick(event) {
        const canvas = this.gameEngine.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // ショップボタンのクリック判定
        const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonX = canvas.width - buttonWidth - 20;
        const buttonY = 70;
        
        if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            this.sceneManager.switchScene('shop');
            return;
        }
        
        const startY = 150;
        const itemHeight = 60;
        const itemSpacing = 10;
        
        // クリックされたアイテムを特定
        const totalStages = this.unlockedStages.length + this.lockedStages.length;
        for (let i = this.scrollOffset; i < Math.min(this.scrollOffset + this.maxVisibleStages, totalStages); i++) {
            const itemY = startY + (i - this.scrollOffset) * (itemHeight + itemSpacing);
            
            if (y >= itemY && y <= itemY + itemHeight) {
                this.selectedStageIndex = i;
                this.selectStage();
                break;
            }
        }
    }
    
    /**
     * 選択を移動
     */
    moveSelection(direction) {
        const totalStages = this.unlockedStages.length + this.lockedStages.length;
        
        this.selectedStageIndex += direction;
        
        if (this.selectedStageIndex < 0) {
            this.selectedStageIndex = 0;
        } else if (this.selectedStageIndex >= totalStages) {
            this.selectedStageIndex = totalStages - 1;
        }
        
        // スクロール調整
        if (this.selectedStageIndex < this.scrollOffset) {
            this.scrollOffset = this.selectedStageIndex;
        } else if (this.selectedStageIndex >= this.scrollOffset + this.maxVisibleStages) {
            this.scrollOffset = this.selectedStageIndex - this.maxVisibleStages + 1;
        }
    }
    
    /**
     * ステージを選択
     */
    selectStage() {
        if (this.selectedStageIndex < this.unlockedStages.length) {
            // 開放済みステージを選択
            const selectedStage = this.unlockedStages[this.selectedStageIndex];
            console.log(`Selected stage: ${selectedStage.name} (ID: ${selectedStage.id})`);
            
            // BubbleManagerの存在確認
            if (!this.gameEngine.bubbleManager) {
                console.error('BubbleManager not initialized');
                return;
            }
            
            // ゲームシーンに切り替えてステージ開始
            console.log('Attempting to start stage...');
            const success = this.gameEngine.stageManager.startStage(selectedStage.id);
            console.log(`Stage start result: ${success}`);
            
            if (success) {
                console.log('Switching to game scene...');
                this.sceneManager.switchScene('game');
            } else {
                console.error('Failed to start stage');
            }
        } else {
            // ロック済みステージを選択（何もしない）
            console.log('This stage is locked');
        }
    }
}