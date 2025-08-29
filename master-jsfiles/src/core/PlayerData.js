import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * プレイヤーデータクラス
 */
export class PlayerData {
    constructor(gameEngine = null) {
        this.gameEngine = gameEngine;
        this.username = '';
        this.currentHP = 100;
        this.maxHP = 100;
        this.currentScore = 0;
        this.ap = 0;
        this.tap = 0;
        this.combo = 0;
        this.highScores = {};
        this.unlockedStages = ['tutorial', 'normal'];
        this.ownedItems = [];
    }
    
    /**
     * スコアを追加
     */
    addScore(points) {
        try {
            // 入力値を検証
            const validation = getErrorHandler().validateInput(points, 'number', {
                min: 0,
                max: 1000000,
                integer: true
            });
            
            if (!validation.isValid) {
                getErrorHandler().handleError(new Error(`Invalid score points: ${validation.errors.join(', ')}`), 'VALIDATION_ERROR', {
                    input: points,
                    errors: validation.errors
                });
                return;
            }
            
            this.currentScore += validation.sanitizedValue;
            this.updateUI();
            
        } catch (error) {
            getErrorHandler().handleError(error, 'PLAYER_DATA_ERROR', { operation: 'addScore', points });
        }
    }
    
    /**
     * ダメージを受ける
     */
    takeDamage(amount) {
        try {
            // 入力値を検証
            const validation = getErrorHandler().validateInput(amount, 'number', {
                min: 0,
                max: this.maxHP,
                integer: true
            });
            
            if (!validation.isValid) {
                getErrorHandler().handleError(new Error(`Invalid damage amount: ${validation.errors.join(', ')}`), 'VALIDATION_ERROR', {
                    input: amount,
                    errors: validation.errors
                });
                return false;
            }
            
            this.currentHP = Math.max(0, this.currentHP - validation.sanitizedValue);
            this.updateUI();
            
            if (this.currentHP <= 0) {
                // 復活アイテムをチェック
                try {
                    if (this.gameEngine && this.gameEngine.itemManager && this.gameEngine.itemManager.useRevival()) {
                        console.log('Revival item activated!');
                        return false; // 復活したのでゲームオーバーではない
                    }
                } catch (error) {
                    getErrorHandler().handleError(error, 'ITEM_SYSTEM_ERROR', { operation: 'useRevival' });
                }
                return true; // ゲームオーバー
            }
            return false;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'PLAYER_DATA_ERROR', { operation: 'takeDamage', amount });
            return false;
        }
    }
    
    /**
     * HPを回復
     */
    heal(amount) {
        try {
            // 入力値を検証
            const validation = getErrorHandler().validateInput(amount, 'number', {
                min: 0,
                max: this.maxHP,
                integer: true
            });
            
            if (!validation.isValid) {
                getErrorHandler().handleError(new Error(`Invalid heal amount: ${validation.errors.join(', ')}`), 'VALIDATION_ERROR', {
                    input: amount,
                    errors: validation.errors
                });
                return;
            }
            
            this.currentHP = Math.min(this.maxHP, this.currentHP + validation.sanitizedValue);
            this.updateUI();
            
        } catch (error) {
            getErrorHandler().handleError(error, 'PLAYER_DATA_ERROR', { operation: 'heal', amount });
        }
    }
    
    /**
     * UIを更新
     */
    updateUI() {
        const scoreElement = document.getElementById('score');
        const hpElement = document.getElementById('hp');
        
        if (scoreElement) {
            scoreElement.textContent = this.currentScore;
        }
        
        if (hpElement) {
            hpElement.textContent = this.currentHP;
        }
    }
    
    /**
     * データをリセット
     */
    reset() {
        this.currentHP = this.maxHP;
        this.currentScore = 0;
        this.combo = 0;
        this.updateUI();
    }
    
    /**
     * データを保存
     */
    save() {
        try {
            // データを検証
            const validation = getErrorHandler().validateInput(this.username, 'string', {
                maxLength: 50,
                escapeHtml: true
            });
            
            if (!validation.isValid) {
                getErrorHandler().handleError(new Error(`Invalid username: ${validation.errors.join(', ')}`), 'VALIDATION_ERROR', {
                    input: this.username,
                    errors: validation.errors
                });
                // サニタイズされた値を使用
                this.username = validation.sanitizedValue;
            }
            
            const data = {
                username: this.username,
                ap: Math.max(0, Math.floor(this.ap)),
                tap: Math.max(0, Math.floor(this.tap)),
                highScores: this.highScores || {},
                unlockedStages: Array.isArray(this.unlockedStages) ? this.unlockedStages : ['tutorial', 'normal'],
                ownedItems: Array.isArray(this.ownedItems) ? this.ownedItems : []
            };
            
            // LocalStorageに保存を試行
            try {
                localStorage.setItem('bubblePop_playerData', JSON.stringify(data));
            } catch (storageError) {
                // LocalStorageが利用できない場合はフォールバックストレージを使用
                if (window.fallbackStorage) {
                    window.fallbackStorage.setItem('bubblePop_playerData', JSON.stringify(data));
                } else {
                    throw storageError;
                }
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'STORAGE_ERROR', { 
                operation: 'save',
                data: 'playerData',
                username: this.username,
                ap: this.ap,
                tap: this.tap
            });
        }
    }
    
    /**
     * データを読み込み
     */
    load() {
        try {
            let savedData = null;
            
            // LocalStorageから読み込みを試行
            try {
                savedData = localStorage.getItem('bubblePop_playerData');
            } catch (storageError) {
                // LocalStorageが利用できない場合はフォールバックストレージを使用
                if (window.fallbackStorage) {
                    savedData = window.fallbackStorage.getItem('bubblePop_playerData');
                } else {
                    throw storageError;
                }
            }
            
            if (savedData) {
                let data;
                try {
                    data = JSON.parse(savedData);
                } catch (parseError) {
                    getErrorHandler().handleError(parseError, 'STORAGE_ERROR', { 
                        operation: 'parse',
                        data: 'playerData',
                        savedData: savedData.substring(0, 100) // 最初の100文字のみログ
                    });
                    return; // パースエラーの場合はデフォルト値を使用
                }
                
                // データを検証して読み込み
                this.loadValidatedData(data);
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'STORAGE_ERROR', { 
                operation: 'load',
                data: 'playerData'
            });
            // エラーの場合はデフォルト値を使用
        }
    }
    
    /**
     * 検証済みデータを読み込み
     */
    loadValidatedData(data) {
        try {
            // ユーザー名を検証
            const usernameValidation = getErrorHandler().validateInput(data.username, 'string', {
                maxLength: 50,
                escapeHtml: true
            });
            this.username = usernameValidation.isValid ? usernameValidation.sanitizedValue : '';
            
            // APを検証
            const apValidation = getErrorHandler().validateInput(data.ap, 'number', {
                min: 0,
                max: 999999999,
                integer: true
            });
            this.ap = apValidation.isValid ? apValidation.sanitizedValue : 0;
            
            // TAPを検証
            const tapValidation = getErrorHandler().validateInput(data.tap, 'number', {
                min: 0,
                max: 999999999,
                integer: true
            });
            this.tap = tapValidation.isValid ? tapValidation.sanitizedValue : 0;
            
            // ハイスコアを検証
            const highScoresValidation = getErrorHandler().validateInput(data.highScores, 'object', {});
            this.highScores = highScoresValidation.isValid ? highScoresValidation.sanitizedValue : {};
            
            // 開放済みステージを検証
            const stagesValidation = getErrorHandler().validateInput(data.unlockedStages, 'array', {
                itemType: 'string',
                itemConstraints: { maxLength: 20 }
            });
            this.unlockedStages = stagesValidation.isValid ? 
                stagesValidation.sanitizedValue : ['tutorial', 'normal'];
            
            // 所持アイテムを検証
            const itemsValidation = getErrorHandler().validateInput(data.ownedItems, 'array', {
                itemType: 'string',
                itemConstraints: { maxLength: 30 }
            });
            this.ownedItems = itemsValidation.isValid ? itemsValidation.sanitizedValue : [];
            
        } catch (error) {
            getErrorHandler().handleError(error, 'VALIDATION_ERROR', { 
                operation: 'loadValidatedData',
                data: data
            });
            // エラーの場合はデフォルト値を使用
            this.resetToDefaults();
        }
    }
    
    /**
     * デフォルト値にリセット
     */
    resetToDefaults() {
        this.username = '';
        this.ap = 0;
        this.tap = 0;
        this.highScores = {};
        this.unlockedStages = ['tutorial', 'normal'];
        this.ownedItems = [];
    }
}