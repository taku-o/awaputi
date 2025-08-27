/**
 * StageSelectDataManager
 * ステージ選択関連のデータ管理と描画調整を担当
 */
export class StageSelectDataManager {
    constructor(stageSelectScene) {
        this.stageSelectScene = stageSelectScene;
        this.gameEngine = stageSelectScene.gameEngine;
        
        // ステージ関連の状態
        this.selectedStageIndex = 0;
        this.unlockedStages = [];
        this.lockedStages = [];
        this.scrollOffset = 0;
        this.maxVisibleStages = 8;
    }

    /**
     * ステージデータ管理の初期化
     */
    initialize() {
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
                this.stageSelectScene.sceneManager.switchScene('game');
            } else {
                console.error('Failed to start stage');
            }
        } else {
            // ロック済みステージを選択（何もしない）
            console.log('This stage is locked');
        }
    }

    /**
     * ステージクリック処理
     */
    handleStageClick(x, y) {
        const startY = 340;
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
        context.fillText('↑↓: 選択  Enter: 決定  H: ヘルプ  ESC: 戻る', canvas.width / 2, controlsY);
        context.fillText('クリックでも操作できます', canvas.width / 2, controlsY + 20);
        
        context.restore();
    }

    /**
     * ステージデータの取得
     */
    getStageData() {
        return {
            selectedStageIndex: this.selectedStageIndex,
            unlockedStages: this.unlockedStages,
            lockedStages: this.lockedStages,
            scrollOffset: this.scrollOffset,
            maxVisibleStages: this.maxVisibleStages
        };
    }

    /**
     * ステージ状態の設定
     */
    setStageState(state) {
        if (state.selectedStageIndex !== undefined) {
            this.selectedStageIndex = state.selectedStageIndex;
        }
        if (state.scrollOffset !== undefined) {
            this.scrollOffset = state.scrollOffset;
        }
    }

    /**
     * キーボード入力処理（ステージ関連）
     */
    handleStageKeyInput(event) {
        switch (event.code) {
            case 'ArrowUp':
                this.moveSelection(-1);
                return true;
            case 'ArrowDown':
                this.moveSelection(1);
                return true;
            case 'Enter':
                this.selectStage();
                return true;
            default:
                return false;
        }
    }

    /**
     * デバッグ情報の取得
     */
    getDebugInfo() {
        return {
            selectedStageIndex: this.selectedStageIndex,
            totalUnlockedStages: this.unlockedStages.length,
            totalLockedStages: this.lockedStages.length,
            scrollOffset: this.scrollOffset,
            maxVisibleStages: this.maxVisibleStages,
            visibleRange: {
                start: this.scrollOffset,
                end: Math.min(this.scrollOffset + this.maxVisibleStages, this.unlockedStages.length + this.lockedStages.length)
            }
        };
    }

    /**
     * ステージ選択状態のリセット
     */
    resetStageSelection() {
        this.selectedStageIndex = 0;
        this.scrollOffset = 0;
    }

    /**
     * ステージリストの更新チェック
     */
    checkForStageUpdates() {
        const currentUnlockedCount = this.unlockedStages.length;
        const currentLockedCount = this.lockedStages.length;
        
        this.updateStageList();
        
        const newUnlockedCount = this.unlockedStages.length;
        const newLockedCount = this.lockedStages.length;
        
        // 新しいステージが解放された場合の処理
        if (newUnlockedCount > currentUnlockedCount) {
            console.log(`New stages unlocked: ${newUnlockedCount - currentUnlockedCount}`);
            
            // 新解放ステージの通知
            if (this.gameEngine.achievementNotificationSystem) {
                this.gameEngine.achievementNotificationSystem.queueNotification({
                    type: 'success',
                    title: 'ステージ解放！',
                    message: `新しいステージが解放されました`,
                    icon: '🔓',
                    duration: 4000
                });
            }
        }
        
        return {
            unlockedChanged: newUnlockedCount !== currentUnlockedCount,
            lockedChanged: newLockedCount !== currentLockedCount,
            unlockedCount: newUnlockedCount,
            lockedCount: newLockedCount
        };
    }

    /**
     * ステージ選択範囲の制約チェック
     */
    validateStageSelection() {
        const totalStages = this.unlockedStages.length + this.lockedStages.length;
        
        // 選択インデックスの制約
        if (this.selectedStageIndex < 0) {
            this.selectedStageIndex = 0;
        } else if (this.selectedStageIndex >= totalStages) {
            this.selectedStageIndex = Math.max(0, totalStages - 1);
        }
        
        // スクロールオフセットの制約
        if (this.scrollOffset < 0) {
            this.scrollOffset = 0;
        } else if (this.scrollOffset > totalStages - this.maxVisibleStages) {
            this.scrollOffset = Math.max(0, totalStages - this.maxVisibleStages);
        }
        
        // 選択がスクロール範囲外の場合の調整
        if (this.selectedStageIndex < this.scrollOffset) {
            this.scrollOffset = this.selectedStageIndex;
        } else if (this.selectedStageIndex >= this.scrollOffset + this.maxVisibleStages) {
            this.scrollOffset = this.selectedStageIndex - this.maxVisibleStages + 1;
        }
    }
}