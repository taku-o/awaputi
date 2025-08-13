/**
 * NavigationContextManager.js
 * 
 * ナビゲーションコンテキスト管理システム
 * ヘルプ・設定画面統合のための汎用ナビゲーション管理機能
 * 
 * @version 1.0.0
 * @since Issue #163 - Duplicate help/settings screen consolidation
 */

import { getLoggingSystem } from '../LoggingSystem.js';
import { ErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * ナビゲーションコンテキストマネージャー
 * シーン間の遷移コンテキストを管理し、適切な戻り先を決定する
 */
export class NavigationContextManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.loggingSystem = getLoggingSystem();
        this.errorHandler = ErrorHandler.getInstance ? ErrorHandler.getInstance() : new ErrorHandler();
        
        // ナビゲーションスタック
        this.navigationStack = [];
        
        // 現在のコンテキスト
        this.currentContext = null;
        
        // 設定
        this.config = {
            maxStackSize: 10,        // スタックの最大サイズ
            enableLogging: true,     // ログ出力の有効化
            defaultReturnScene: 'menu',  // デフォルト戻り先
            allowCircularNavigation: false  // 循環ナビゲーションの許可
        };
        
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    initialize() {
        try {
            // 初期状態の設定
            this.clear();
            
            if (this.config.enableLogging) {
                this.loggingSystem.info('NavigationContextManager', 'Navigation context manager initialized');
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'NavigationContextManager.initialize');
            throw error;
        }
    }
    
    /**
     * ナビゲーションコンテキストをプッシュ
     * @param {string} fromScene - 遷移元シーン名
     * @param {string} accessMethod - アクセス方法（'menu_click', 'keyboard_h', etc.）
     * @param {Object} additionalData - 追加のコンテキストデータ
     */
    pushContext(fromScene, accessMethod, additionalData = {}) {
        try {
            // 入力値の検証
            if (!fromScene || typeof fromScene !== 'string') {
                throw new Error('Invalid fromScene parameter');
            }
            
            if (!accessMethod || typeof accessMethod !== 'string') {
                throw new Error('Invalid accessMethod parameter');
            }
            
            const context = {
                scene: fromScene,
                method: accessMethod,
                timestamp: Date.now(),
                data: additionalData,
                id: this.generateContextId()
            };
            
            // 循環ナビゲーションのチェック
            if (!this.config.allowCircularNavigation && this.isCircularNavigation(fromScene)) {
                if (this.config.enableLogging) {
                    this.loggingSystem.warn('NavigationContextManager', 
                        `Circular navigation detected: ${fromScene}`);
                }
                return false;
            }
            
            // スタックサイズの管理
            while (this.navigationStack.length >= this.config.maxStackSize) {
                const removed = this.navigationStack.shift();
                if (this.config.enableLogging) {
                    this.loggingSystem.debug('NavigationContextManager', 
                        `Removed oldest context: ${removed.scene}`);
                }
            }
            
            // コンテキストをスタックに追加
            this.navigationStack.push(context);
            this.currentContext = context;
            
            if (this.config.enableLogging) {
                this.loggingSystem.debug('NavigationContextManager', 
                    `Context pushed: ${fromScene} via ${accessMethod} (ID: ${context.id})`);
            }
            
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'NavigationContextManager.pushContext');
            return false;
        }
    }
    
    /**
     * ナビゲーションコンテキストをポップ
     * @returns {Object|null} ポップされたコンテキスト
     */
    popContext() {
        try {
            if (this.navigationStack.length === 0) {
                if (this.config.enableLogging) {
                    this.loggingSystem.warn('NavigationContextManager', 'Cannot pop from empty stack');
                }
                return null;
            }
            
            const poppedContext = this.navigationStack.pop();
            this.currentContext = this.navigationStack.length > 0 
                ? this.navigationStack[this.navigationStack.length - 1] 
                : null;
            
            if (this.config.enableLogging) {
                this.loggingSystem.debug('NavigationContextManager', 
                    `Context popped: ${poppedContext.scene} (ID: ${poppedContext.id})`);
            }
            
            return poppedContext;
        } catch (error) {
            this.errorHandler.handleError(error, 'NavigationContextManager.popContext');
            return null;
        }
    }
    
    /**
     * 戻り先シーンを取得
     * @returns {string} 戻り先シーン名
     */
    getReturnDestination() {
        try {
            if (this.navigationStack.length === 0) {
                return this.config.defaultReturnScene;
            }
            
            const lastContext = this.navigationStack[this.navigationStack.length - 1];
            const returnScene = lastContext.scene;
            
            // シーンの存在確認
            if (this.gameEngine && this.gameEngine.sceneManager) {
                if (!this.gameEngine.sceneManager.hasScene(returnScene)) {
                    if (this.config.enableLogging) {
                        this.loggingSystem.warn('NavigationContextManager', 
                            `Return scene not found: ${returnScene}, using default`);
                    }
                    return this.config.defaultReturnScene;
                }
            }
            
            return returnScene;
        } catch (error) {
            this.errorHandler.handleError(error, 'NavigationContextManager.getReturnDestination');
            return this.config.defaultReturnScene;
        }
    }
    
    /**
     * 現在のコンテキストを取得
     * @returns {Object|null} 現在のコンテキスト
     */
    getCurrentContext() {
        return this.currentContext;
    }
    
    /**
     * ナビゲーションスタックの深度を取得
     * @returns {number} スタックの深度
     */
    getStackDepth() {
        return this.navigationStack.length;
    }
    
    /**
     * 特定のアクセス方法でのコンテキストが存在するかチェック
     * @param {string} accessMethod - アクセス方法
     * @returns {boolean} 存在するかどうか
     */
    hasContextByMethod(accessMethod) {
        return this.navigationStack.some(context => context.method === accessMethod);
    }
    
    /**
     * 特定のシーンからのコンテキストが存在するかチェック
     * @param {string} scene - シーン名
     * @returns {boolean} 存在するかどうか
     */
    hasContextFromScene(scene) {
        return this.navigationStack.some(context => context.scene === scene);
    }
    
    /**
     * コンテキストスタックをクリア
     */
    clear() {
        this.navigationStack = [];
        this.currentContext = null;
        
        if (this.config.enableLogging) {
            this.loggingSystem.debug('NavigationContextManager', 'Navigation stack cleared');
        }
    }
    
    /**
     * コンテキストの履歴を取得
     * @param {number} limit - 取得する履歴の最大数
     * @returns {Array} コンテキスト履歴
     */
    getHistory(limit = null) {
        const history = [...this.navigationStack];
        return limit ? history.slice(-limit) : history;
    }
    
    /**
     * 設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        try {
            this.config = { ...this.config, ...newConfig };
            
            if (this.config.enableLogging) {
                this.loggingSystem.debug('NavigationContextManager', 'Configuration updated');
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'NavigationContextManager.updateConfig');
        }
    }
    
    /**
     * デバッグ情報を取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo() {
        return {
            stackSize: this.navigationStack.length,
            maxStackSize: this.config.maxStackSize,
            currentContext: this.currentContext,
            stack: this.navigationStack,
            config: this.config
        };
    }
    
    /**
     * 循環ナビゲーションの検出
     * @param {string} scene - チェックするシーン名
     * @returns {boolean} 循環ナビゲーションかどうか
     */
    isCircularNavigation(scene) {
        // 直前のコンテキストと同じシーンかチェック
        if (this.currentContext && this.currentContext.scene === scene) {
            return true;
        }
        
        // 最近の履歴で同じシーンが頻繁に出現するかチェック
        const recentHistory = this.getHistory(5);
        const sceneCount = recentHistory.filter(context => context.scene === scene).length;
        
        return sceneCount >= 3; // 5件中3件以上同じシーンがあれば循環とみなす
    }
    
    /**
     * コンテキストIDを生成
     * @returns {string} 一意のコンテキストID
     */
    generateContextId() {
        return `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * クリーンアップ処理
     */
    cleanup() {
        try {
            this.clear();
            
            if (this.config.enableLogging) {
                this.loggingSystem.info('NavigationContextManager', 'Navigation context manager cleaned up');
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'NavigationContextManager.cleanup');
        }
    }
}