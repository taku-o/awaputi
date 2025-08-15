import type { 
    ItemDefinition, 
    // ItemEffect, // 未使用のためコメントアウト
    ItemInfo, 
    ItemManager as IItemManager 
} from '../types/game';

/**
 * アイテム定義
 */
export const ITEM_DEFINITIONS: Record<string, ItemDefinition> = {
    scoreMultiplier: {
        id: 'scoreMultiplier',
        name: 'スコア倍率アップ',
        description: '獲得スコアが1.3倍になります（レベルごとに+0.2倍）',
        cost: 75, // 100 -> 75 (安く)
        maxLevel: 5,
        effect: {
            type: 'scoreMultiplier',
            value: 1.3 // 1.5 -> 1.3 (少し弱く、でもレベルアップで強化)
        }
    },
    revival: {
        id: 'revival',
        name: '復活',
        description: 'HP全損時に一度だけ満タンで復活します',
        cost: 150, // 200 -> 150 (少し安く)
        maxLevel: 2, // 1 -> 2 (2回まで購入可能に)
        effect: {
            type: 'revival',
            value: 1
        }
    },
    rareRate: {
        id: 'rareRate',
        name: 'レア率アップ',
        description: 'レア泡の出現率が上昇します（レベルごとに+30%）',
        cost: 100, // 150 -> 100 (安く)
        maxLevel: 4, // 3 -> 4 (レベル上限増加)
        effect: {
            type: 'rareRate',
            value: 1.3 // 1.5 -> 1.3 (少し弱く、でもレベルアップで強化)
        }
    },
    hpBoost: {
        id: 'hpBoost',
        name: 'HP増加',
        description: '最大HPが25増加します',
        cost: 60, // 80 -> 60 (安く)
        maxLevel: 6, // 5 -> 6 (レベル上限増加)
        effect: {
            type: 'hpBoost',
            value: 25 // 20 -> 25 (少し強く)
        }
    },
    timeExtension: {
        id: 'timeExtension',
        name: '時間延長',
        description: 'ゲーム時間が45秒延長されます',
        cost: 90, // 120 -> 90 (安く)
        maxLevel: 4, // 3 -> 4 (レベル上限増加)
        effect: {
            type: 'timeExtension',
            value: 45000 // 30000 -> 45000 (30秒 -> 45秒に強化)
        }
    },
    comboBoost: {
        id: 'comboBoost',
        name: 'コンボ強化',
        description: 'コンボ継続時間が1.5倍になります',
        cost: 80,
        maxLevel: 3,
        effect: {
            type: 'comboBoost',
            value: 1.5
        }
    },
    reset: {
        id: 'reset',
        name: 'アイテム効果リセット',
        description: '全アイテム効果をリセットし、再購入可能にします',
        cost: 30, // 50 -> 30 (安く)
        maxLevel: 1,
        effect: {
            type: 'reset',
            value: 1
        }
    }
};

/**
 * ItemManager - アイテム管理システム
 * 
 * アイテムの購入、効果適用、進捗管理を専門的に処理します
 */
export class ItemManager implements IItemManager {
    public gameEngine: any;
    public ownedItems: Map<string, number> = new Map();
    public activeEffects: Map<string, number> = new Map();

    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
    }
    
    /**
     * 初期化
     */
    initialize(): void {
        this.loadOwnedItems();
        this.applyAllEffects();
    }
    
    /**
     * 所持アイテムを読み込み
     */
    loadOwnedItems(): void {
        const playerData = this.gameEngine.playerData;
        this.ownedItems.clear();
        
        if (playerData.ownedItems) {
            playerData.ownedItems.forEach((item: any) => {
                this.ownedItems.set(item.id, item.level || 1);
            });
        }
    }
    
    /**
     * 所持アイテムを保存
     */
    saveOwnedItems(): void {
        const playerData = this.gameEngine.playerData;
        playerData.ownedItems = Array.from(this.ownedItems.entries()).map(([id, level]) => ({
            id,
            level
        }));
        playerData.save();
    }
    
    /**
     * アイテムを購入
     */
    purchaseItem(itemId: string): boolean {
        const itemDef = ITEM_DEFINITIONS[itemId];
        if (!itemDef) {
            console.error(`Unknown item: ${itemId}`);
            return false;
        }
        
        const currentLevel = this.ownedItems.get(itemId) || 0;
        
        // 最大レベルチェック
        if (currentLevel >= itemDef.maxLevel) {
            console.log(`Item ${itemId} is already at max level`);
            return false;
        }
        
        // コスト計算（レベルが上がるごとに1.3倍に緩和）
        const cost = Math.floor(itemDef.cost * Math.pow(1.3, currentLevel));
        
        // AP不足チェック
        if (this.gameEngine.playerData.ap < cost) {
            console.log(`Not enough AP. Required: ${cost}, Have: ${this.gameEngine.playerData.ap}`);
            return false;
        }
        
        // 購入処理
        this.gameEngine.playerData.ap -= cost;
        this.ownedItems.set(itemId, currentLevel + 1);
        this.saveOwnedItems();
        
        // 効果を適用
        this.applyItemEffect(itemId);
        
        console.log(`Purchased ${itemDef.name} (Level ${currentLevel + 1})`);
        return true;
    }
    
    /**
     * アイテム効果をリセット
     */
    resetAllItems(): boolean {
        if (!this.purchaseItem('reset')) {
            return false;
        }
        
        // 全アイテムをクリア（リセットアイテム以外）
        this.ownedItems.clear();
        this.activeEffects.clear();
        this.saveOwnedItems();
        
        console.log('All item effects have been reset');
        return true;
    }
    
    /**
     * 単一アイテムの効果を適用
     */
    applyItemEffect(itemId: string): void {
        const itemDef = ITEM_DEFINITIONS[itemId];
        const level = this.ownedItems.get(itemId) || 0;
        
        if (!itemDef || level === 0) return;
        
        const effect = itemDef.effect;
        
        switch (effect.type) {
            case 'scoreMultiplier':
                // スコア倍率は累積
                const currentMultiplier = this.activeEffects.get('scoreMultiplier') || 1;
                const newMultiplier = currentMultiplier + (effect.value - 1) * level;
                this.activeEffects.set('scoreMultiplier', newMultiplier);
                break;
                
            case 'revival':
                this.activeEffects.set('revival', level);
                break;
                
            case 'rareRate':
                // レア率は累積
                const currentRareRate = this.activeEffects.get('rareRate') || 1;
                const newRareRate = currentRareRate + (effect.value - 1) * level;
                this.activeEffects.set('rareRate', newRareRate);
                break;
                
            case 'hpBoost':
                // HP増加は累積
                const hpBoost = effect.value * level;
                this.activeEffects.set('hpBoost', hpBoost);
                // 最大HPを更新
                this.gameEngine.playerData.maxHP = 100 + hpBoost;
                break;
                
            case 'timeExtension':
                // 時間延長は累積
                const timeExtension = effect.value * level;
                this.activeEffects.set('timeExtension', timeExtension);
                break;
                
            case 'comboBoost':
                // コンボ強化は累積
                const currentComboBoost = this.activeEffects.get('comboBoost') || 1;
                const newComboBoost = currentComboBoost + (effect.value - 1) * level;
                this.activeEffects.set('comboBoost', newComboBoost);
                break;
        }
    }
    
    /**
     * 全アイテム効果を適用
     */
    applyAllEffects(): void {
        this.activeEffects.clear();
        
        // 基本値を設定
        this.activeEffects.set('scoreMultiplier', 1);
        this.activeEffects.set('rareRate', 1);
        this.activeEffects.set('hpBoost', 0);
        this.activeEffects.set('timeExtension', 0);
        this.activeEffects.set('revival', 0);
        this.activeEffects.set('comboBoost', 1);
        
        // 各アイテムの効果を適用
        for (const [itemId] of this.ownedItems) {
            this.applyItemEffect(itemId);
        }
    }
    
    /**
     * 効果値を取得
     */
    getEffectValue(effectType: string): number {
        return this.activeEffects.get(effectType) || 0;
    }
    
    /**
     * アイテムの所持レベルを取得
     */
    getItemLevel(itemId: string): number {
        return this.ownedItems.get(itemId) || 0;
    }
    
    /**
     * アイテムの購入コストを取得
     */
    getItemCost(itemId: string): number {
        const itemDef = ITEM_DEFINITIONS[itemId];
        if (!itemDef) return 0;
        
        const currentLevel = this.getItemLevel(itemId);
        return Math.floor(itemDef.cost * Math.pow(1.3, currentLevel));
    }
    
    /**
     * アイテムが購入可能かチェック
     */
    canPurchaseItem(itemId: string): boolean {
        const itemDef = ITEM_DEFINITIONS[itemId];
        if (!itemDef) return false;
        
        const currentLevel = this.getItemLevel(itemId);
        if (currentLevel >= itemDef.maxLevel) return false;
        
        const cost = this.getItemCost(itemId);
        return this.gameEngine.playerData.ap >= cost;
    }
    
    /**
     * 復活効果を使用
     */
    useRevival(): boolean {
        const revivalCount = this.getEffectValue('revival');
        if (revivalCount > 0) {
            // 復活効果を1回分消費
            this.activeEffects.set('revival', revivalCount - 1);
            
            // HPを満タンに回復
            this.gameEngine.playerData.currentHP = this.gameEngine.playerData.maxHP;
            this.gameEngine.playerData.updateUI();
            
            console.log('Revival effect used!');
            return true;
        }
        return false;
    }
    
    /**
     * 購入可能なアイテム一覧を取得
     */
    getAvailableItems(): ItemDefinition[] {
        return Object.values(ITEM_DEFINITIONS).filter(item => item.id !== 'reset');
    }
    
    /**
     * アイテム情報を取得
     */
    getItemInfo(itemId: string): ItemInfo | null {
        const itemDef = ITEM_DEFINITIONS[itemId];
        if (!itemDef) return null;
        
        const currentLevel = this.getItemLevel(itemId);
        const cost = this.getItemCost(itemId);
        const canPurchase = this.canPurchaseItem(itemId);
        
        return {
            ...itemDef,
            currentLevel,
            cost,
            canPurchase,
            isMaxLevel: currentLevel >= itemDef.maxLevel
        };
    }
}