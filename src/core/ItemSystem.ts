import type { ItemDefinition, 
    ItemInfo,
    ItemManager as IItemManager  } from '../types/game.js';

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
        maxLevel: 2, // 1 -> 2(2回まで購入可能に)
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
        maxLevel: 4, // 3 -> 4(レベル上限増加)
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
        maxLevel: 6, // 5 -> 6(レベル上限増加)
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
        maxLevel: 4, // 3 -> 4(レベル上限増加)
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
        // 初期化処理
        console.log('ItemManager initialized');
    }

    /**
     * アイテムを購入する
     */
    purchaseItem(itemId: string): boolean {
        const itemDef = ITEM_DEFINITIONS[itemId];
        if (!itemDef) {
            console.warn(`Item definition not found: ${itemId}`);
            return false;
        }

        const currentLevel = this.ownedItems.get(itemId) || 0;
        if (currentLevel >= itemDef.maxLevel) {
            console.warn(`Item ${itemId} is already at max level`);
            return false;
        }

        // コスト計算 (レベルに応じて上昇)
        const cost = this.calculateItemCost(itemId, currentLevel + 1);
        
        if (!this.gameEngine.playerData || this.gameEngine.playerData.ap < cost) {
            console.warn(`Not enough AP to purchase ${itemId}. Required: ${cost}, Available: ${this.gameEngine.playerData?.ap || 0}`);
            return false;
        }

        // AP消費
        this.gameEngine.playerData.ap -= cost;
        
        // アイテムレベル上昇
        this.ownedItems.set(itemId, currentLevel + 1);

        // 効果を適用
        this.applyItemEffect(itemId, currentLevel + 1);

        console.log(`Purchased ${itemId} (Level ${currentLevel + 1}) for ${cost} AP`);
        return true;
    }

    /**
     * アイテムの効果を適用する
     */
    applyItemEffect(itemId: string, level: number): void {
        const itemDef = ITEM_DEFINITIONS[itemId];
        if (!itemDef) return;

        const effect = itemDef.effect;
        let effectValue = effect.value;

        // レベルに応じて効果を調整
        if (level > 1) {
            switch (effect.type) {
                case 'scoreMultiplier':
                    effectValue = effect.value + (level - 1) * 0.2; // レベルごとに+0.2倍
                    break;
                case 'rareRate':
                    effectValue = effect.value + (level - 1) * 0.3; // レベルごとに+30%
                    break;
                case 'hpBoost':
                    effectValue = effect.value * level; // レベルごとに基本値×レベル
                    break;
                case 'timeExtension':
                    effectValue = effect.value * level; // レベルごとに基本値×レベル
                    break;
                case 'comboBoost':
                    effectValue = effect.value + (level - 1) * 0.2; // レベルごとに+0.2倍
                    break;
                case 'revival':
                    effectValue = level; // レベル = 復活回数
                    break;
                default:
                    effectValue = effect.value;
            }
        }

        this.activeEffects.set(effect.type, effectValue);

        // ゲームエンジンに効果を適用
        this.applyEffectToGame(effect.type, effectValue);
    }

    /**
     * ゲームに効果を適用する
     */
    private applyEffectToGame(effectType: string, value: number): void {
        if (!this.gameEngine) return;

        switch (effectType) {
            case 'scoreMultiplier':
                if (this.gameEngine.scoreManager) {
                    this.gameEngine.scoreManager.setScoreMultiplier(value);
                }
                break;

            case 'hpBoost':
                if (this.gameEngine.playerData) {
                    this.gameEngine.playerData.maxHP += value;
                    this.gameEngine.playerData.currentHP += value;
                }
                break;

            case 'timeExtension':
                if (this.gameEngine.timeManager) {
                    this.gameEngine.timeManager.addTime(value);
                }
                break;

            case 'rareRate':
                if (this.gameEngine.bubbleManager) {
                    this.gameEngine.bubbleManager.setRareRate(value);
                }
                break;

            case 'comboBoost':
                if (this.gameEngine.comboManager) {
                    this.gameEngine.comboManager.setComboMultiplier(value);
                }
                break;

            case 'revival':
                if (this.gameEngine.playerData) {
                    this.gameEngine.playerData.revivalCount = value;
                }
                break;

            case 'reset':
                this.resetAllEffects();
                break;

            default:
                console.warn(`Unknown effect type: ${effectType}`);
        }
    }

    /**
     * アイテムのコストを計算する
     */
    calculateItemCost(itemId: string, level: number): number {
        const itemDef = ITEM_DEFINITIONS[itemId];
        if (!itemDef) return 0;

        // 基本コスト + (レベル-1) * 基本コストの50%
        return Math.floor(itemDef.cost + (level - 1) * itemDef.cost * 0.5);
    }

    /**
     * アイテム情報を取得する
     */
    getItemInfo(itemId: string): ItemInfo | null {
        const itemDef = ITEM_DEFINITIONS[itemId];
        if (!itemDef) return null;

        const currentLevel = this.ownedItems.get(itemId) || 0;
        const nextLevel = currentLevel + 1;
        const cost = this.calculateItemCost(itemId, nextLevel);
        const canPurchase = currentLevel < itemDef.maxLevel && 
                           this.gameEngine.playerData && 
                           this.gameEngine.playerData.ap >= cost;

        return {
            id: itemId,
            name: itemDef.name,
            description: itemDef.description,
            currentLevel,
            maxLevel: itemDef.maxLevel,
            nextLevelCost: currentLevel < itemDef.maxLevel ? cost : 0,
            canPurchase,
            isMaxLevel: currentLevel >= itemDef.maxLevel
        };
    }

    /**
     * 全アイテム情報を取得する
     */
    getAllItemsInfo(): ItemInfo[] {
        return Object.keys(ITEM_DEFINITIONS).map(itemId => this.getItemInfo(itemId)).filter(Boolean) as ItemInfo[];
    }

    /**
     * アイテムを所有しているかチェック
     */
    hasItem(itemId: string): boolean {
        return (this.ownedItems.get(itemId) || 0) > 0;
    }

    /**
     * アイテムのレベルを取得
     */
    getItemLevel(itemId: string): number {
        return this.ownedItems.get(itemId) || 0;
    }

    /**
     * 効果値を取得
     */
    getEffectValue(effectType: string): number {
        return this.activeEffects.get(effectType) || 0;
    }

    /**
     * 全効果をリセット
     */
    resetAllEffects(): void {
        this.ownedItems.clear();
        this.activeEffects.clear();

        // ゲームエンジンの効果もリセット
        if (this.gameEngine) {
            if (this.gameEngine.scoreManager) {
                this.gameEngine.scoreManager.setScoreMultiplier(1.0);
            }
            if (this.gameEngine.playerData) {
                this.gameEngine.playerData.revivalCount = 0;
                // HPは初期値にリセット（効果分を引く）
                const hpBoost = this.activeEffects.get('hpBoost') || 0;
                this.gameEngine.playerData.maxHP -= hpBoost;
                this.gameEngine.playerData.currentHP = Math.min(
                    this.gameEngine.playerData.currentHP, 
                    this.gameEngine.playerData.maxHP
                );
            }
            if (this.gameEngine.bubbleManager) {
                this.gameEngine.bubbleManager.setRareRate(1.0);
            }
            if (this.gameEngine.comboManager) {
                this.gameEngine.comboManager.setComboMultiplier(1.0);
            }
        }

        console.log('All item effects have been reset');
    }

    /**
     * セーブデータを生成
     */
    getSaveData(): any {
        return {
            ownedItems: Array.from(this.ownedItems.entries()),
            activeEffects: Array.from(this.activeEffects.entries())
        };
    }

    /**
     * セーブデータから復元
     */
    loadSaveData(data: any): void {
        if (data.ownedItems) {
            this.ownedItems = new Map(data.ownedItems);
        }
        if (data.activeEffects) {
            this.activeEffects = new Map(data.activeEffects);
        }

        // 効果を再適用
        for (const [itemId, level] of this.ownedItems) {
            this.applyItemEffect(itemId, level);
        }
    }

    /**
     * デバッグ用：全アイテムを最大レベルで付与
     */
    giveAllItemsMax(): void {
        for (const itemId of Object.keys(ITEM_DEFINITIONS)) {
            const itemDef = ITEM_DEFINITIONS[itemId];
            this.ownedItems.set(itemId, itemDef.maxLevel);
            this.applyItemEffect(itemId, itemDef.maxLevel);
        }
        console.log('All items set to maximum level (DEBUG)');
    }

    /**
     * デバッグ用：アイテム状態をログ出力
     */
    debugLogState(): void {
        console.log('=== ItemManager State ===');
        console.log('Owned Items:', Array.from(this.ownedItems.entries()));
        console.log('Active Effects:', Array.from(this.activeEffects.entries()));
        console.log('========================');
    }
}