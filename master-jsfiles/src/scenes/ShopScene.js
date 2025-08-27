import { Scene } from '../core/Scene.js';
import { ITEM_DEFINITIONS } from '../core/ItemSystem.js';

/**
 * ショップシーン
 */
export class ShopScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        this.selectedItemIndex = 0;
        this.scrollOffset = 0;
        this.maxVisibleItems = 6;
        this.availableItems = [];
    }
    
    /**
     * シーン開始時の処理
     */
    enter() {
        this.updateItemList();
        this.selectedItemIndex = 0;
        this.scrollOffset = 0;
    }
    
    /**
     * アイテムリストを更新
     */
    updateItemList() {
        this.availableItems = this.gameEngine.itemManager.getAvailableItems();
        // リセットアイテムを最後に追加
        this.availableItems.push(ITEM_DEFINITIONS.reset);
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
        context.fillText('アイテムショップ', canvas.width / 2, 20);
        context.restore();
        
        // プレイヤー情報
        this.renderPlayerInfo(context);
        
        // アイテムリスト
        this.renderItemList(context);
        
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
        context.font = '18px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        const infoY = 70;
        context.fillText(`プレイヤー: ${playerData.username || '名無し'}`, 20, infoY);
        context.fillText(`所持AP: ${playerData.ap}`, 20, infoY + 25);
        context.fillText(`総TAP: ${playerData.tap}`, 20, infoY + 50);
        
        context.restore();
    }
    
    /**
     * アイテムリストを描画
     */
    renderItemList(context) {
        const canvas = this.gameEngine.canvas;
        const startY = 150;
        const itemHeight = 80;
        const itemWidth = canvas.width - 40;
        const itemX = 20;
        
        let currentY = startY;
        
        for (let i = this.scrollOffset; i < Math.min(this.scrollOffset + this.maxVisibleItems, this.availableItems.length); i++) {
            const item = this.availableItems[i];
            const isSelected = i === this.selectedItemIndex;
            const itemInfo = this.gameEngine.itemManager.getItemInfo(item.id);
            
            this.renderItemCard(context, itemInfo, itemX, currentY, itemWidth, itemHeight, isSelected);
            currentY += itemHeight + 10;
        }
    }
    
    /**
     * アイテムカードを描画
     */
    renderItemCard(context, itemInfo, x, y, width, height, isSelected) {
        context.save();
        
        // 背景色の決定
        let bgColor = '#333333';
        if (isSelected) {
            bgColor = itemInfo.canPurchase ? '#0066CC' : '#CC6600';
        } else if (!itemInfo.canPurchase) {
            bgColor = '#222222';
        }
        
        // 背景
        context.fillStyle = bgColor;
        context.fillRect(x, y, width, height);
        
        // 枠線
        context.strokeStyle = isSelected ? '#FFFFFF' : '#666666';
        context.lineWidth = 2;
        context.strokeRect(x, y, width, height);
        
        // アイテム名
        context.fillStyle = itemInfo.canPurchase ? '#FFFFFF' : '#888888';
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        let itemName = itemInfo.name;
        if (itemInfo.currentLevel > 0) {
            itemName += ` (Lv.${itemInfo.currentLevel})`;
        }
        if (itemInfo.isMaxLevel) {
            itemName += ' [MAX]';
        }
        
        context.fillText(itemName, x + 15, y + 10);
        
        // 説明文
        context.font = '14px Arial';
        context.fillStyle = itemInfo.canPurchase ? '#CCCCCC' : '#666666';
        context.fillText(itemInfo.description, x + 15, y + 35);
        
        // コスト表示
        if (!itemInfo.isMaxLevel) {
            context.font = 'bold 16px Arial';
            context.textAlign = 'right';
            context.fillStyle = itemInfo.canPurchase ? '#00FF00' : '#FF6666';
            context.fillText(`${itemInfo.cost} AP`, x + width - 15, y + 10);
        } else {
            context.font = 'bold 16px Arial';
            context.textAlign = 'right';
            context.fillStyle = '#FFD700';
            context.fillText('購入済み', x + width - 15, y + 10);
        }
        
        // 最大レベル表示
        if (itemInfo.maxLevel > 1) {
            context.font = '12px Arial';
            context.textAlign = 'right';
            context.fillStyle = '#AAAAAA';
            context.fillText(`最大Lv.${itemInfo.maxLevel}`, x + width - 15, y + height - 20);
        }
        
        // 効果値表示（現在のレベルでの効果）
        if (itemInfo.currentLevel > 0) {
            context.font = '12px Arial';
            context.textAlign = 'left';
            context.fillStyle = '#00CCFF';
            
            let effectText = '';
            switch (itemInfo.effect.type) {
                case 'scoreMultiplier':
                    const multiplier = this.gameEngine.itemManager.getEffectValue('scoreMultiplier');
                    effectText = `現在の倍率: x${multiplier.toFixed(1)}`;
                    break;
                case 'revival':
                    const revivalCount = this.gameEngine.itemManager.getEffectValue('revival');
                    effectText = `残り復活回数: ${revivalCount}`;
                    break;
                case 'rareRate':
                    const rareRate = this.gameEngine.itemManager.getEffectValue('rareRate');
                    effectText = `現在のレア率: x${rareRate.toFixed(1)}`;
                    break;
                case 'hpBoost':
                    const hpBoost = this.gameEngine.itemManager.getEffectValue('hpBoost');
                    effectText = `現在のHP増加: +${hpBoost}`;
                    break;
                case 'timeExtension':
                    const timeExt = this.gameEngine.itemManager.getEffectValue('timeExtension');
                    effectText = `現在の時間延長: +${timeExt / 1000}秒`;
                    break;
            }
            
            if (effectText) {
                context.fillText(effectText, x + 15, y + height - 20);
            }
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
        context.fillText('↑↓: 選択  Enter: 購入  H: ヘルプ  ESC: 戻る', canvas.width / 2, controlsY);
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
                    this.purchaseSelectedItem();
                    break;
                case 'KeyH':
                    this.gameEngine.sceneManager.switchScene('help');
                    break;
                case 'Escape':
                    this.sceneManager.switchScene('stageSelect');
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
        
        const startY = 150;
        const itemHeight = 80;
        const itemSpacing = 10;
        
        // クリックされたアイテムを特定
        for (let i = this.scrollOffset; i < Math.min(this.scrollOffset + this.maxVisibleItems, this.availableItems.length); i++) {
            const itemY = startY + (i - this.scrollOffset) * (itemHeight + itemSpacing);
            
            if (y >= itemY && y <= itemY + itemHeight) {
                this.selectedItemIndex = i;
                this.purchaseSelectedItem();
                break;
            }
        }
    }
    
    /**
     * 選択を移動
     */
    moveSelection(direction) {
        this.selectedItemIndex += direction;
        
        if (this.selectedItemIndex < 0) {
            this.selectedItemIndex = 0;
        } else if (this.selectedItemIndex >= this.availableItems.length) {
            this.selectedItemIndex = this.availableItems.length - 1;
        }
        
        // スクロール調整
        if (this.selectedItemIndex < this.scrollOffset) {
            this.scrollOffset = this.selectedItemIndex;
        } else if (this.selectedItemIndex >= this.scrollOffset + this.maxVisibleItems) {
            this.scrollOffset = this.selectedItemIndex - this.maxVisibleItems + 1;
        }
    }
    
    /**
     * 選択されたアイテムを購入
     */
    purchaseSelectedItem() {
        if (this.selectedItemIndex >= 0 && this.selectedItemIndex < this.availableItems.length) {
            const selectedItem = this.availableItems[this.selectedItemIndex];
            
            if (selectedItem.id === 'reset') {
                // リセットアイテムの場合
                if (this.gameEngine.itemManager.resetAllItems()) {
                    console.log('All items have been reset');
                    this.updateItemList(); // リストを更新
                } else {
                    console.log('Failed to reset items (not enough AP)');
                }
            } else {
                // 通常アイテムの場合
                if (this.gameEngine.itemManager.purchaseItem(selectedItem.id)) {
                    console.log(`Purchased ${selectedItem.name}`);
                    this.updateItemList(); // リストを更新
                } else {
                    console.log(`Failed to purchase ${selectedItem.name}`);
                }
            }
        }
    }
}