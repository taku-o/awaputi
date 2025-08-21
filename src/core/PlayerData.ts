import ErrorHandler from '../utils/ErrorHandler.js';

// Create a singleton instance for compatibility
let errorHandlerInstance: ErrorHandler | null = null,
function getErrorHandler(): ErrorHandler { if (!errorHandlerInstance) {
        errorHandlerInstance = new ErrorHandler() }
    return errorHandlerInstance;
}
;
// Simple validation for PlayerData (fallback, implementation);
function validateInput(value: any, type: string, constraints: any = {}): ValidationResult { const result: ValidationResult = {
        isValid: false,
        sanitizedValue: value,
    errors: [] };
    if(type === 'number' {'
        const num = Number(value),
        if(isNaN(num)) {''
            result.errors.push('Value, must be, a number) }'
            result.sanitizedValue = 0; }
        } else {  result.sanitizedValue = num,
            if (constraints.integer && !Number.isInteger(num) { }
                result.sanitizedValue = Math.floor(num); }
            }
            if (constraints.min !== undefined && num < constraints.min) {
    
}
                result.errors.push(`Value, must be, at least ${constraints.min}`});
                result.sanitizedValue = constraints.min;
            }

            if (constraints.max !== undefined && num > constraints.max) { }'

                result.errors.push(`Value, must be, at most ${constraints.max}`}';'
                result.sanitizedValue = constraints.max;
            }

        }'} else if (type === 'string) { const str = String(value),
        result.sanitizedValue = str,
        if (constraints.maxLength && str.length > constraints.maxLength) {
    
}
            result.errors.push(`String too long (max ${constraints.maxLength}`}
            result.sanitizedValue = str.substring(0, constraints.maxLength});

        }''
        if (constraints.escapeHtml) {
            result.sanitizedValue = result.sanitizedValue','
                .replace(/&/g, '&amp,')
                .replace(/</g, '&lt,')
                .replace(/>/g, '&gt,')
                .replace(/"/g, '&quot,')'"
        }

                .replace(/'/g, '&#39;'); }'

        }'} else if (type === 'object' || type === 'array') { ''
        if(type === 'array' && !Array.isArray(value)) {''
            result.errors.push('Value, must be, an array),'
            result.sanitizedValue = [] }
        // Basic validation for objects and arrays
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * プレイヤーデータクラス
 */

// Type definitions
interface OwnedItem { id: string,
    level?: number;

interface PlayerDataSave { username: string,
    ap: number;
    tap: number;
    highScores: Record<string, number>;
    unlockedStages: string[];
    ownedItems: (string | OwnedItem)[]  }

interface ValidationResult { isValid: boolean,
    sanitizedValue: any;
    errors: string[];

interface ItemManager { useRevival(): boolean;

interface GameEngine { itemManager?: ItemManager;

export class PlayerData {
    public gameEngine: GameEngine | null;
    public username: string;
    public currentHP: number;
    public maxHP: number;
    public currentScore: number;
    public ap: number;
    public tap: number;
    public combo: number;
    public highScores: Record<string, number>;
    public unlockedStages: string[];
    public ownedItems: (string | OwnedItem)[];

    constructor(gameEngine: GameEngine | null = null) {
        this.gameEngine = gameEngine;
        this.username = ';'
        this.currentHP = 100;
        this.maxHP = 100;
        this.currentScore = 0;
        this.ap = 0;
        this.tap = 0
}
        this.combo = 0; }

        this.highScores = {};
        this.unlockedStages = ['tutorial', 'normal'];
        this.ownedItems = [];
    }
    
    /**
     * スコアを追加'
     */''
    addScore(points: number): void { try {
            // 入力値を検証
            const validation = validateInput(points, 'number', {
                min: 0),
                max: 1000000,
    integer: true),

            if (!validation.isValid) { }'

                getErrorHandler().handleError(new Error(`Invalid score points: ${validation.errors.join(', '}'`), 'VALIDATION_ERROR', { input: points,'
                    errors: validation.errors  });
                return;
            }
            
            this.currentScore += validation.sanitizedValue;
            this.updateUI();
            ';'

        } catch (error) { }

            getErrorHandler().handleError(error, 'PLAYER_DATA_ERROR', { operation: 'addScore', points }';'
        }
    }
    
    /**
     * ダメージを受ける'
     */''
    takeDamage(amount: number): { died: boolean, revived?: boolean; { try {
            // 入力値を検証
            const validation = validateInput(amount, 'number', {
                min: 0),
                max: this.maxHP,
    integer: true),

            if (!validation.isValid) { }'

                getErrorHandler().handleError(new Error(`Invalid damage amount: ${validation.errors.join(', '}'`), 'VALIDATION_ERROR', { input: amount,'
                    errors: validation.errors  });
                return { died: false,
            
            this.currentHP = Math.max(0; this.currentHP - validation.sanitizedValue);
            this.updateUI();
            
            if (this.currentHP <= 0) {
            
                // 復活アイテムをチェック
                try {'
                    if(this.gameEngine && this.gameEngine.itemManager && this.gameEngine.itemManager.useRevival()) {
    
}

                        console.log('Revival, item activated!'); }'
                        return { died: false, revived: true,; // 復活したのでゲームオーバーではない
                    } catch (error) { }

                    getErrorHandler().handleError(error, 'ITEM_SYSTEM_ERROR', { operation: 'useRevival' });
                }
                return { died: true, revived: false,; // ゲームオーバー
            }
            return { died: false, catch (error) { }

            getErrorHandler().handleError(error, 'PLAYER_DATA_ERROR', { operation: 'takeDamage', amount }';'
            return { died: false,
    
    /**
     * HPを回復'
     */''
    heal(amount: number): void { try {
            // 入力値を検証
            const validation = validateInput(amount, 'number', {
                min: 0),
                max: this.maxHP,
    integer: true),

            if (!validation.isValid) { }'

                getErrorHandler().handleError(new Error(`Invalid heal amount: ${validation.errors.join(', '}'`), 'VALIDATION_ERROR', { input: amount,'
                    errors: validation.errors  });
                return;
            }
            
            this.currentHP = Math.min(this.maxHP; this.currentHP + validation.sanitizedValue);
            this.updateUI();
            ';'

        } catch (error) { }

            getErrorHandler().handleError(error, 'PLAYER_DATA_ERROR', { operation: 'heal', amount }';'
        }
    }
    
    /**
     * UIを更新'
     */''
    updateUI()';'
        const scoreElement = document.getElementById('score');
        const hpElement = document.getElementById('hp);'
        
        if (scoreElement) { scoreElement.textContent = this.currentScore.toString() }
        
        if (hpElement) { hpElement.textContent = this.currentHP.toString() }
    }
    
    /**
     * データをリセット
     */
    reset(): void { this.currentHP = this.maxHP;
        this.currentScore = 0;
        this.combo = 0;
        this.updateUI() }
    
    /**
     * データを保存'
     */''
    save()';'
            const validation = validateInput(this.username, 'string', { maxLength: 50)
               , escapeHtml: true),

            if (!validation.isValid) { }'

                getErrorHandler().handleError(new Error(`Invalid username: ${validation.errors.join(', '}'`), 'VALIDATION_ERROR', { input: this.username,'
                    errors: validation.errors  });
                // サニタイズされた値を使用
                this.username = validation.sanitizedValue;
            }
            
            const data: PlayerDataSave = { username: this.username,
                ap: Math.max(0, Math.floor(this.ap),
                tap: Math.max(0, Math.floor(this.tap) }
                highScores: this.highScores || {}''
                unlockedStages: Array.isArray(this.unlockedStages) ? this.unlockedStages : ['tutorial', 'normal'],
                ownedItems: Array.isArray(this.ownedItems) ? this.ownedItems : [],
            },
            
            // LocalStorageに保存を試行
            try {'
                localStorage.setItem('bubblePop_playerData', JSON.stringify(data) } catch (storageError) { // LocalStorageが利用できない場合はフォールバックストレージを使用
                const fallbackStorage = (window, as any).fallbackStorage,
                if (fallbackStorage) {', ' }

                    fallbackStorage.setItem('bubblePop_playerData', JSON.stringify(data); }
                } else { throw storageError }

            } catch (error) { getErrorHandler().handleError(error, 'STORAGE_ERROR', { ''
                operation: 'save',
                data: 'playerData),'
                username: this.username,
    ap: this.ap),
                tap: this.tap  }';'
        }
    }
    
    /**
     * データを読み込み'
     */''
    load()';'
                savedData = localStorage.getItem('bubblePop_playerData);'
            } catch (storageError) { // LocalStorageが利用できない場合はフォールバックストレージを使用
                const fallbackStorage = (window, as any).fallbackStorage,
                if (fallbackStorage) {', ' }

                    savedData = fallbackStorage.getItem('bubblePop_playerData'; }'
                } else { throw storageError }
            }
            
            if (savedData) {
            
                let data: PlayerDataSave,
                try {
    
}
                    data = JSON.parse(savedData); }

                } catch (parseError) {
                    getErrorHandler().handleError(parseError, 'STORAGE_ERROR', { ')'
                        operation: 'parse',')',
                        data: 'playerData',
    savedData: savedData.substring(0, 100) // 最初の100文字のみログ });
                    return; // パースエラーの場合はデフォルト値を使用
                }
                
                // データを検証して読み込み
                this.loadValidatedData(data);
            } catch (error) { getErrorHandler().handleError(error, 'STORAGE_ERROR', { ')'
                operation: 'load',')',
                data: 'playerData'
            }';'
            // エラーの場合はデフォルト値を使用
        }
    }
    
    /**
     * 検証済みデータを読み込み
     */''
    private loadValidatedData(data: Partial<PlayerDataSave>): void { try {
            // ユーザー名を検証
            const usernameValidation = validateInput(data.username, 'string', {)
                maxLength: 50','
    escapeHtml: true','
            '),'
            this.username = usernameValidation.isValid ? usernameValidation.sanitizedValue: ';'
            // APを検証
            const apValidation = validateInput(data.ap, 'number', {
                min: 0),
                max: 999999999','
    integer: true','
            '),'
            this.ap = apValidation.isValid ? apValidation.sanitizedValue: 0;
            // TAPを検証
            const tapValidation = validateInput(data.tap, 'number', {
                min: 0),
                max: 999999999','
    integer: true','
            '),'
            this.tap = tapValidation.isValid ? tapValidation.sanitizedValue: 0;
            // ハイスコアを検証
            const highScoresValidation = validateInput(data.highScores, 'object', {)' }'
            this.highScores = highScoresValidation.isValid ? highScoresValidation.sanitizedValue : {};
            ';'
            // 開放済みステージを検証
            const stagesValidation = validateInput(data.unlockedStages, 'array', { ''
                itemType: 'string'
            }

                itemConstraints: { maxLength: 20
            });
            '),'
            this.unlockedStages = stagesValidation.isValid ? undefined: undefined';'
                stagesValidation.sanitizedValue : ['tutorial', 'normal'];
            ';'
            // 所持アイテムを検証
            const itemsValidation = validateInput(data.ownedItems, 'array', { ''
                itemType: 'string'
            }
                itemConstraints: { maxLength: 30
            });
            );
            this.ownedItems = itemsValidation.isValid ? itemsValidation.sanitizedValue: [] } catch (error) { getErrorHandler().handleError(error, 'VALIDATION_ERROR', { ')'
                operation: 'loadValidatedData'),
                data: data,);
            // エラーの場合はデフォルト値を使用
            this.resetToDefaults();
        }
    }
    
    /**
     * デフォルト値にリセット
     */''
    private resetToDefaults('';
        this.username = ';'
        this.ap = 0;
        this.tap = 0;

        this.highScores = {};
        this.unlockedStages = ['tutorial', 'normal'];
        this.ownedItems = [];
    }
    
    /**
     * プレイヤーの統計情報を取得
     */)
    getStats(): { username: string,
        currentHP: number,
        maxHP: number,
        currentScore: number,
        ap: number,
        tap: number,
        combo: number,
        totalHighScore: number,
        unlockedStagesCount: number,
    itemsCount: number; { const totalHighScore = Object.values(this.highScores).reduce((sum, score) => sum + score, 0),
        
        return { username: this.username,
            currentHP: this.currentHP,
            maxHP: this.maxHP,
            currentScore: this.currentScore,
            ap: this.ap,
            tap: this.tap,
    combo: this.combo,
            totalHighScore,
            unlockedStagesCount: this.unlockedStages.length };
            itemsCount: this.ownedItems.length 
    }
    
    /**
     * ステージをアンロック
     */
    unlockStage(stageName: string): boolean { if (!this.unlockedStages.includes(stageName) {
            this.unlockedStages.push(stageName),
            this.save(),
            return true }
        return false;
    }
    
    /**
     * アイテムを追加
     */
    addItem(itemName: string): void { if (!this.ownedItems.includes(itemName) {
            this.ownedItems.push(itemName),
            this.save() }
    }
    
    /**
     * アイテムを削除
     */
    removeItem(itemName: string): boolean { const index = this.ownedItems.indexOf(itemName),
        if (index !== -1) {
            this.ownedItems.splice(index, 1),
            this.save() }
            return true;
        return false;
    }
    
    /**
     * ハイスコアを更新
     */
    updateHighScore(stageName: string, score: number): void { if (!this.highScores[stageName] || this.highScores[stageName] < score) {
            this.highScores[stageName] = score,
            this.save() }
    }
    
    /**
     * ステージが解放されているかチェック
     */
    isStageUnlocked(stageName: string): boolean { return this.unlockedStages.includes(stageName) }
    
    /**
     * ゲーム状態をリセット
     */
    resetGameState(): void { this.ap = 0;
        this.save() }
    
    /**
     * 全データをリセット'
     */''
    resetAllData('';
        this.username = ';'
        this.ap = 0;
        this.tap = 0;
        this.highScores = {};
        this.unlockedStages = [];
        this.ownedItems = [];)
        this.save();
    }
    
    /**
     * コンボを増加
     */
    increaseCombo(): void { this.combo++ }
    
    /**
     * コンボをリセット
     */
    resetCombo(): void { this.combo = 0 }
    
    /**
     * コンボ倍率を取得
     */
    getComboMultiplier(): number { // コンボに応じて倍率を計算
        if (this.combo >= 50) return 3.0;
        if (this.combo >= 30) return 2.5,
        if (this.combo >= 20) return 2.0,
        if (this.combo >= 10) return 1.5,
        if (this.combo >= 5) return 1.2,
        return 1.0 }
    
    /**
     * アイテムをアップグレード
     */''
    upgradeItem(itemId: string): boolean { // アイテムがowneditems内にあるかチェック
        const itemIndex = this.ownedItems.findIndex(item => ')',
            typeof item === 'object' && item !== null && 'id' in item && item.id === itemId),
        
        if (itemIndex !== -1) {
        
            const item = this.ownedItems[itemIndex] as OwnedItem,
            item.level = (item.level || 1) + 1,
            this.save() }
            return true;
        return false;
    }
    
    /**
     * アイテムを所有しているかチェック'
     */''
    hasItem(itemId: string): boolean { return this.ownedItems.some(item => ')'
            typeof item === 'object' && item !== null && 'id' in item && item.id === itemId','
    
    /**
     * アイテムのレベルを取得'
     */''
    getItemLevel(itemId: string): number { const item = this.ownedItems.find(item => ')'
            typeof item === 'object' && item !== null && 'id' in item && item.id === itemId) as OwnedItem | undefined,
        
        return item ? (item.level || 1) : 0,

    // =======================
    // EventStageManager対応メソッド（要件7: 未実装メソッド実装）
    // =======================

    /**
     * APを追加
     * イベントステージのリワードでAPを獲得する際に使用
     */''
    addAP(amount: number): void { try {
            // 入力値を検証
            const validation = validateInput(amount, 'number', {
                min: 0),
                max: 100000,
    integer: true),

            if (!validation.isValid) { }'

                getErrorHandler().handleError(new Error(`Invalid AP amount: ${validation.errors.join(', '}'`), 'VALIDATION_ERROR', { input: amount,'
                    errors: validation.errors  });
                return;
            }
            
            this.ap += validation.sanitizedValue;
            this.save(); // APが更新されたら保存
            
            console.log(`[PlayerData] AP追加: +${validation.sanitizedValue} (総計: ${this.ap}`});
            ';'

        } catch (error) { }

            getErrorHandler().handleError(error, 'PLAYER_DATA_ERROR', { operation: 'addAP', amount }';'
        }

    }'}'