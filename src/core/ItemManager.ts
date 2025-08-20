/**
 * アイテム管理システム
 * 
 * ゲーム内のアイテムの管理、使用、在庫管理を担当します。
 * 復活アイテム、パワーアップアイテム、消耗品などの管理を行います。
 */

import { GameEngine } from './GameEngine.js';

export interface Item { id: string,
    name: string,
    type: ItemType,
    quantity: number,
    maxQuantity: number,
    description: string,
    effects?: ItemEffect[];
    cooldown?: number;
    lastUsed?: number; }
}
';'
export enum ItemType { ''
    REVIVAL = 'revival','';
    POWER_UP = 'power_up','';
    CONSUMABLE = 'consumable','';
    SPECIAL = 'special','';
    CURRENCY = 'currency' }
}

export interface ItemEffect { type: string,
    value: number,
    duration?: number }
}

export interface ItemConfig { enableRevivalItems: boolean,
    maxRevivalsPerGame: number,
    revivalHPPercentage: number,
    itemCooldowns: boolean }
}

export class ItemManager {
    private gameEngine: GameEngine | null;
    private inventory: Map<string, Item> }
    private activeEffects: Map<string, ItemEffect & { endTime: number }>;
    private config: ItemConfig;
    private revialsUsedThisGame: number;
    private itemDefinitions: Map<string, Partial<Item>>;

    constructor(gameEngine?: GameEngine) {

        this.gameEngine = gameEngine || null;
        this.inventory = new Map();
        this.activeEffects = new Map();
        this.revialsUsedThisGame = 0;
        
        this.config = {
            enableRevivalItems: true,
            maxRevivalsPerGame: 1,
            revivalHPPercentage: 50,

    }
    }
            itemCooldowns: true }
        },

        this.itemDefinitions = new Map();
        this.initializeDefaultItems();
    }

    /**
     * デフォルトアイテムを初期化'
     */''
    private initializeDefaultItems(''';
        this.itemDefinitions.set('revival_heart', { ''
            id: 'revival_heart','';
            name: '復活のハート',
            type: ItemType.REVIVAL,';
            maxQuantity: 3,'';
            description: 'HPが0になった時に自動的に復活します',';
            effects: [{')'
                type: 'revival')];
                value: 50 // HP回復率 }]
            }],')'
            cooldown: 0)'),
';
        // パワーアップアイテムの定義
        this.itemDefinitions.set('power_boost', { ''
            id: 'power_boost','';
            name: 'パワーブースト',
            type: ItemType.POWER_UP,';
            maxQuantity: 5,'';
            description: 'スコア獲得量が一定時間2倍になります',';
            effects: [{''
                type: 'score_multiplier');
                value: 2)];
                duration: 30000 // 30秒 }]
            }],')'
            cooldown: 60000 // 1分)),
';
        // 時間延長アイテムの定義
        this.itemDefinitions.set('time_extend', { ''
            id: 'time_extend','';
            name: '時間延長',
            type: ItemType.CONSUMABLE,';
            maxQuantity: 10,'';
            description: 'ゲーム時間を30秒延長します',';
            effects: [{')'
                type: 'time_extend')];
                value: 30 }]
            }],)
            cooldown: 0),
    }

    /**
     * アイテムを追加
     */
    addItem(itemId: string, quantity: number = 1): boolean { const itemDef = this.itemDefinitions.get(itemId);
        if (!itemDef) { }
            console.warn(`Item definition not found: ${itemId)`});
            return false;
        }

        let item = this.inventory.get(itemId);
        if(!item) {
            // 新しいアイテムを作成
            item = {
                ...itemDef }
                quantity: 0 }
            } as Item,
            this.inventory.set(itemId, item);
        }

        // 数量を追加（最大数量を超えない）
        const oldQuantity = item.quantity;
        item.quantity = Math.min(item.quantity + quantity, item.maxQuantity);
        
        if(item.quantity > oldQuantity) {
        
            
        
        }
            console.log(`Added ${item.quantity - oldQuantity} ${item.name)`});
            return true;
        }
        
        return false;
    }

    /**
     * アイテムを使用
     */
    useItem(itemId: string): boolean { const item = this.inventory.get(itemId);
        if(!item || item.quantity <= 0) {
            
        }
            return false; }
        }

        // クールダウンチェック
        if(this.config.itemCooldowns && item.cooldown && item.lastUsed) {
            const timeSinceLastUse = Date.now() - item.lastUsed;
            if (timeSinceLastUse < item.cooldown) {
        }
                const remainingCooldown = Math.ceil((item.cooldown - timeSinceLastUse) / 1000); }
                console.log(`Item on cooldown: ${remainingCooldown)秒`});
                return false;
            }
        }

        // アイテム効果を適用
        if(item.effects) {
            for (const effect of item.effects) {
        }
                this.applyItemEffect(effect); }
            }
        }

        // アイテムを消費
        item.quantity--;
        item.lastUsed = Date.now();

        console.log(`Used ${item.name}. Remaining: ${item.quantity)`});
        return true;
    }

    /**
     * 復活アイテムを使用
     */
    useRevival(): boolean { if (!this.config.enableRevivalItems) {
            return false; }
        }
'';
        if(this.revialsUsedThisGame >= this.config.maxRevivalsPerGame') {'
            '';
            console.log('Maximum revivals for this game reached');
        }
            return false; }
        }

        // 復活アイテムを探す
        let revivalItem: Item | null = null,
        for(const [_, item] of this.inventory) {
            if (item.type === ItemType.REVIVAL && item.quantity > 0) {
                revivalItem = item;
        }
                break; }
            }
        }

        if (!revivalItem) { return false; }
        }

        // 復活アイテムを使用
        revivalItem.quantity--;
        this.revialsUsedThisGame++;

        // HPを回復
        if(this.gameEngine && this.gameEngine.playerData) {
            const maxHP = this.gameEngine.playerData.maxHP || 100;
            const revivalHP = Math.floor(maxHP * (this.config.revivalHPPercentage / 100);
            this.gameEngine.playerData.currentHP = revivalHP;
        }
            this.gameEngine.playerData.updateUI(); }
        }

        // 復活エフェクトを再生
        if (this.gameEngine && this.gameEngine.effectManager) { this.gameEngine.effectManager.createRevivalEffect(); }
        }
;
        // 復活サウンドを再生
        if(this.gameEngine && this.gameEngine.audioManager') {'
            ';'
        }'
            this.gameEngine.audioManager.playSound('revival'); }
        }

        console.log(`Revival used! ${revivalItem.name} remaining: ${revivalItem.quantity)`});
        return true;
    }

    /**
     * アイテム効果を適用
     */'
    private applyItemEffect(effect: ItemEffect): void { ''
        switch(effect.type') {'
            '';
            case 'revival':'';
                // 復活効果は useRevival(
            case 'score_multiplier':)';
                if (this.gameEngine && this.gameEngine.scoreManager) {'
        }'
                    this.gameEngine.scoreManager.setMultiplier(effect.value, effect.duration || 0'); }
                }
                break;'
                '';
            case 'time_extend':;
                // TODO: TimeManagerが実装されたら有効化
                // if (this.gameEngine && this.gameEngine.timeManager) { //     this.gameEngine.timeManager.addTime(effect.value); }
                // }
                console.log(`Time extend effect: +${ effect.value) seconds (not implemented)`'),
                break;'
                '';
            case 'hp_restore':';
                if (this.gameEngine && this.gameEngine.playerData) {' }'
                    this.gameEngine.playerData.heal(effect.value'});
                }
                break;'
                '';
            case 'shield':'';
                if(effect.duration') {'
                    '';
                    this.activeEffects.set('shield', {)
                        ...effect);
                }
                        endTime: Date.now() + effect.duration }
                    }),
                }
                break;
                
            default:;
                console.log(`Unknown effect type: ${effect.type)`}),
        }

        // 効果の持続時間を管理
        if (effect.duration) { setTimeout(() => {  }
                this.removeItemEffect(effect.type); }
            }, effect.duration);
        }
    }

    /**
     * アイテム効果を削除
     */
    private removeItemEffect(effectType: string): void { this.activeEffects.delete(effectType);
        ;
        // 効果の終了処理
        switch(effectType') {'
            '';
            case 'score_multiplier':';
                if (this.gameEngine && this.gameEngine.scoreManager) {''
                    this.gameEngine.scoreManager.resetMultiplier()';
            case 'shield':')';
                console.log('Shield effect ended');
        }
                break; }
        }
    }

    /**
     * アクティブな効果をチェック
     */
    hasActiveEffect(effectType: string): boolean { const effect = this.activeEffects.get(effectType);
        if (!effect) return false;
        
        // 時間切れチェック
        if (Date.now() > effect.endTime) {
            this.activeEffects.delete(effectType);
            return false; }
        }
        
        return true;
    }

    /**
     * インベントリを取得
     */
    getInventory(): Item[] { return Array.from(this.inventory.values(); }
    }

    /**
     * アイテム数を取得
     */
    getItemCount(itemId: string): number { const item = this.inventory.get(itemId);
        return item ? item.quantity: 0 }
    }

    /**
     * ゲーム開始時の初期化
     */
    resetForNewGame(): void { this.revialsUsedThisGame = 0;
        this.activeEffects.clear();
        
        // クールダウンをリセット
        for(const item of this.inventory.values() {
            
        }
            item.lastUsed = undefined; }
        }
    }

    /**
     * 設定を更新
     */
    updateConfig(config: Partial<ItemConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * セーブデータを生成
     */
    getSaveData(): any { return { inventory: Array.from(this.inventory.entries(), };
            config: this.config }
        },
    }

    /**
     * セーブデータから復元
     */
    loadSaveData(data: any): void { if (data.inventory) {
            this.inventory.clear();
            for(const [id, item] of data.inventory) {
                
            }
                this.inventory.set(id, item); }
            }
        }
        '';
        if(data.config') {
            
        }
            this.config = { ...this.config, ...data.config };
        }'
    }''
}