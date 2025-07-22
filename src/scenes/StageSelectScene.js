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
    }
    
    /**
     * シーン開始時の処理
     */
    enter() {
        this.updateStageList();
        this.selectedStageIndex = 0;
        this.scrollOffset = 0;
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
        
        // ステージリスト
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
     * ステージリストを描画
     */
    renderStageList(context) {
        const canvas = this.gameEngine.canvas;
        const startY = 150;
        const itemHeight = 60;
        const itemWidth = canvas.width - 40;
        const itemX = 20;
        
        // 開放済みステージ
        let currentY = startY;
        this.unlockedStages.forEach((stage, index) => {
            if (index < this.scrollOffset) return;
            if (index >= this.scrollOffset + this.maxVisibleStages) return;
            
            const isSelected = index === this.selectedStageIndex;
            this.renderStageItem(context, stage, itemX, currentY, itemWidth, itemHeight, isSelected, false);
            currentY += itemHeight + 10;
        });
        
        // ロック済みステージ
        this.lockedStages.forEach((stage, index) => {
            const adjustedIndex = this.unlockedStages.length + index;
            if (adjustedIndex < this.scrollOffset) return;
            if (adjustedIndex >= this.scrollOffset + this.maxVisibleStages) return;
            
            const isSelected = adjustedIndex === this.selectedStageIndex;
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
        context.fillText('↑↓: 選択  Enter: 決定  S: ショップ  ESC: 戻る', canvas.width / 2, controlsY);
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