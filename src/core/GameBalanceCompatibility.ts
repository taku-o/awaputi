// TypeScript conversion - basic types
interface BasicConfig {
    [key: string]: any;
}

/**
 * GameBalanceとの互換性レイヤー
 * 
 * 既存のBALANCE_CONFIGとBalanceHelperとの互換性を保ちながら、
 * 新しい設定システムへの段階的な移行を促進します。
 */

import { getGameConfig } from '../config/GameConfig.js';
import { getConfigurationManager } from './ConfigurationManager.js';
import { getLoggingSystem } from './LoggingSystem.js';

// 警告表示の制御
const SHOW_DEPRECATION_WARNINGS = true;
const WARNING_INTERVAL = 60000; // 同じ警告は1分に1回だけ表示
const lastWarningTime = new Map();

/**
 * 非推奨警告を表示
 * @param {string} message - 警告メッセージ
 * @param {string} caller - 呼び出し元
 * @private
 */
function _showDeprecationWarning(message: string, caller: string) {
    if (!SHOW_DEPRECATION_WARNINGS) return;
    
    const now = Date.now();
    const key = `${caller}:${message}`;
    
    if (!lastWarningTime.has(key) || (now - lastWarningTime.get(key) > WARNING_INTERVAL)) {
        console.warn(`[非推奨] ${message}`);
        console.warn(`代わりに新しい設定システムを使用してください。詳細は開発者ドキュメントを参照してください。`);
        console.warn(`呼び出し元: ${caller}`);
        
        // ログに記録
        const loggingSystem = getLoggingSystem();
        loggingSystem.warn(`非推奨APIの使用: ${message}`, { caller });
        
        // 最終警告時間を更新
        lastWarningTime.set(key, now);
    }
}

/**
 * 呼び出し元情報を取得
 * @returns {string} 呼び出し元情報
 * @private
 */
function _getCallerInfo(): string {
    try {
        const err = new Error();
        const stack = err.stack?.split('\n') || [];
        
        // スタックトレースから呼び出し元を特定（3つ上のスタックフレーム）
        if (stack.length >= 4) {
            const callerLine = stack[3].trim();
            const match = callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
            
            if (match) {
                const [, fnName, file, line] = match;
                return `${file.split('/').pop()}:${line} (${fnName})`;
            }
            
            return callerLine;
        }
        
        return '不明';
    } catch (error) {
        return '不明';
    }
}

/**
 * BALANCE_CONFIGの互換性プロキシ
 * 
 * 既存のBALANCE_CONFIGへのアクセスを新しい設定システムにリダイレクトし、
 * 非推奨警告を表示します。
 */
const BALANCE_CONFIG_PROXY = new Proxy({}, {
    get(target, prop) {
        const gameConfig = getGameConfig();
        const configManager = getConfigurationManager();
        const caller = _getCallerInfo();
        
        _showDeprecationWarning(`BALANCE_CONFIG.${String(prop)}へのアクセスは非推奨です`, caller);
        
        // カテゴリに基づいて適切な設定を返す
        switch(prop) {
            case 'scoring':
                return gameConfig.getScoreConfig();
            case 'stages':
                return gameConfig.getStageConfig();
            case 'items':
                return gameConfig.getItemConfig();
            case 'bubbles':
                return gameConfig.getBubbleConfig();
            case 'changelog':
                // 変更履歴は新システムでは別の方法で管理
                return configManager.getChangeHistory();
            default:
                console.warn(`[互換性レイヤー] 未知のプロパティ: ${String(prop)}`);
                return undefined;
        }
    },
    
    set(target, prop, value) {
        const configManager = getConfigurationManager();
        const caller = _getCallerInfo();
        
        _showDeprecationWarning(`BALANCE_CONFIG.${String(prop)}への直接設定は非推奨です`, caller);
        
        // 設定の変更を許可しない（読み取り専用）
        console.error(`[互換性レイヤー] BALANCE_CONFIGへの直接設定は許可されていません。代わりにConfigurationManagerを使用してください。`);
        return true; // プロキシのsetトラップはtrueを返す必要がある
    }
});

/**
 * BalanceHelperの互換性クラス
 * 
 * 既存のBalanceHelperメソッドを新しい設定システムにリダイレクトし、
 * 非推奨警告を表示します。
 */
class BalanceHelperCompatibility {
    /**
     * スコア計算（互換性メソッド）
     * @param {string} bubbleType - 泡タイプ
     * @param {number} ageRatio - 年齢比率
     * @returns {number} 計算されたスコア
     */
    static calculateScore(bubbleType: string, ageRatio: number = 0): number {
        const gameConfig = getGameConfig();
        const caller = _getCallerInfo();
        _showDeprecationWarning('BalanceHelper.calculateScoreは非推奨です', caller);
        return gameConfig.calculateScore(bubbleType, ageRatio);
    }
    
    /**
     * コンボ倍率計算（互換性メソッド）
     * @param {number} comboCount - コンボ数
     * @returns {number} コンボ倍率
     */
    static calculateComboMultiplier(comboCount: number): number {
        const gameConfig = getGameConfig();
        const caller = _getCallerInfo();
        _showDeprecationWarning('BalanceHelper.calculateComboMultiplierは非推奨です', caller);
        return gameConfig.calculateComboMultiplier(comboCount);
    }
    
    /**
     * アイテムコスト計算（互換性メソッド）
     * @param {string} itemId - アイテムID
     * @param {number} currentLevel - 現在のレベル
     * @returns {number} 計算されたコスト
     */
    static calculateItemCost(itemId: string, currentLevel: number): number {
        const gameConfig = getGameConfig();
        const caller = _getCallerInfo();
        _showDeprecationWarning('BalanceHelper.calculateItemCostは非推奨です', caller);
        return gameConfig.calculateItemCost(itemId, currentLevel);
    }
    
    /**
     * ステージ開放チェック（互換性メソッド）
     * @param {string} stageId - ステージID
     * @param {number} playerTAP - プレイヤーのTAP値
     * @returns {boolean} 開放状態
     */
    static isStageUnlocked(stageId: string, playerTAP: number): boolean {
        const gameConfig = getGameConfig();
        const caller = _getCallerInfo();
        _showDeprecationWarning('BalanceHelper.isStageUnlockedは非推奨です', caller);
        return gameConfig.isStageUnlocked(stageId, playerTAP);
    }
}
// 既存のBALANCE_CONFIGとBalanceHelperをエクスポート
export const BALANCE_CONFIG = BALANCE_CONFIG_PROXY;
export const BalanceHelper = BalanceHelperCompatibility;

// 新しいAPIも同時にエクスポート（移行を促進）
export { getGameConfig } from '../config/GameConfig.js';
export { getConfigurationManager } from './ConfigurationManager.js';