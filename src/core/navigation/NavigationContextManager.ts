/**
 * NavigationContextManager - ナビゲーションコンテキスト管理システム
 * 
 * ヘルプ・設定画面統合のための汎用ナビゲーション管理機能
 * シーン間の遷移コンテキストを管理し、適切な戻り先を決定する
 * 
 * @version 1.0.0
 * @since Issue #163 - Duplicate help/settings screen consolidation
 */

import { getLoggingSystem  } from '../LoggingSystem.js';
import { ErrorHandler  } from '../../utils/ErrorHandler.js';

// 型定義
export interface NavigationContext { scene: string;
    method: AccessMethod;
    timestamp: number;
    data: ContextData;
    id: string;

export interface ContextData { [key: string]: any;
    preserveState?: boolean;

export interface ReturnContext { targetScene: string;
    contextData?: ContextData;
    preserveState?: boolean;

export interface NavigationConfig { maxStackSize: number;
    enableLogging: boolean;
    defaultReturnScene: string;
    allowCircularNavigation: boolean;

export interface DebugInfo { stackSize: number;
    maxStackSize: number;
    currentContext: NavigationContext | null;
    stack: NavigationContext[];
    config: NavigationConfig;

export interface GameEngine { sceneManager?: SceneManager;

export interface SceneManager { hasScene: (sceneName: string) => boolean;
    switchScene?: (sceneName: string, options?: any) => void;
    getCurrentScene?: () => string }

export interface LoggingSystem { info: (component: string, message: string, ...args: any[]) => void;
    debug: (component: string, message: string, ...args: any[]) => void;
    warn: (component: string, message: string, ...args: any[]) => void;
    error: (component: string, message: string, ...args: any[]) => void }
}
';'

export interface ErrorHandlerInstance {;
    handleError: (error: Error, context: string, additionalData?: any') => void }'
}

// 列挙型
export type AccessMethod = ';'
    | 'menu_click' | 'keyboard_h' | 'keyboard_s' | 'keyboard_i'';'
    | 'button_click' | 'explicit_return' | 'shortcut' | 'navigation'';'
    | 'breadcrumb' | 'back_button' | 'escape_key' | 'system';
';'

export type SceneName = ';'
    | 'menu' | 'help' | 'settings' | 'game' | 'stage_select', ';'
    | 'user_info' | 'leaderboard' | 'achievements' | 'shop'';'
    | 'tutorial' | 'credits' | 'options';

// 定数
export const DEFAULT_MAX_STACK_SIZE = 10;
export const DEFAULT_RETURN_SCENE = 'menu';
export const CIRCULAR_NAVIGATION_THRESHOLD = 3;
export const RECENT_HISTORY_LIMIT = 5;
export const CONTEXT_ID_LENGTH = 9;

// デフォルト設定
export const DEFAULT_CONFIG: NavigationConfig = { maxStackSize: DEFAULT_MAX_STACK_SIZE,
    enableLogging: true,
    defaultReturnScene: DEFAULT_RETURN_SCENE,
    allowCircularNavigation: false,
;
// 型ガード
export function isValidAccessMethod(method: string): method is AccessMethod { return [', 'menu_click', 'keyboard_h', 'keyboard_s', 'keyboard_i','
        'button_click', 'explicit_return', 'shortcut', 'navigation',]','
        'breadcrumb', 'back_button', 'escape_key', 'system'],
    ].includes(method) }

export function isValidSceneName(scene: string): scene is SceneName { return [', 'menu', 'help', 'settings', 'game', 'stage_select','
        'user_info', 'leaderboard', 'achievements', 'shop',]','
        'tutorial', 'credits', 'options'],
    ].includes(scene) }

export function isNavigationContext(context: any): context is NavigationContext { return context &&,
           typeof context.scene === 'string' &&','
           typeof context.method === 'string' &&','
           typeof context.timestamp === 'number' &&','
           typeof context.data === 'object' &&','
           typeof context.id === 'string' &&,
           context.timestamp > 0 }

export function isReturnContext(returnContext: any): returnContext is ReturnContext { return returnContext &&,
           typeof returnContext === 'object' &&','
           typeof returnContext.targetScene === 'string' &&,
           returnContext.targetScene.length > 0 }

export function hasSceneManager(engine: any): engine is GameEngine & { sceneManager: SceneManager; { return engine &&,
           engine.sceneManager &&','
           typeof engine.sceneManager.hasScene === 'function' }
}

export function isValidContextData(data: any): data is ContextData {,
    return typeof data === 'object' && data !== null }

/**
 * ナビゲーションコンテキストマネージャー
 * シーン間の遷移コンテキストを管理し、適切な戻り先を決定する
 */
export class NavigationContextManager {
    private gameEngine: GameEngine;
    private loggingSystem: LoggingSystem;
    private errorHandler: ErrorHandlerInstance;
    // ナビゲーションスタック
    private navigationStack: NavigationContext[] = [];
    // 現在のコンテキスト
    private currentContext: NavigationContext | null = null;
    // 設定
    private, config: NavigationConfig;
    constructor(gameEngine: GameEngine) {

        this.gameEngine = gameEngine;
        this.loggingSystem = getLoggingSystem();
        this.errorHandler = ErrorHandler.getInstance ? ErrorHandler.getInstance() : new ErrorHandler() }
        // 設定の初期化 }
        this.config = { ...DEFAULT_CONFIG;
        
        this.initialize() }
    
    /**
     * 初期化処理
     */
    private initialize(): void { try {
            // 初期状態の設定
            this.clear();
            if (this.config.enableLogging) {', ' }

                this.loggingSystem.info('NavigationContextManager', 'Navigation context manager initialized); }'

            } catch (error) {
            const err = error instanceof Error ? error: new Error(String(error);
            this.errorHandler.handleError(err, 'NavigationContextManager.initialize',
            throw err }
    }
    
    /**
     * ナビゲーションコンテキストをプッシュ'
     */''
    pushContext(fromScene: string, accessMethod: string, additionalData: ContextData = { )): boolean {
        try {
            // 入力値の検証
            if (!fromScene || typeof, fromScene !== 'string') {', ' }

                throw new Error('Invalid, fromScene parameter'); }
            }

            if (!accessMethod || typeof, accessMethod !== 'string') {', ' }

                throw new Error('Invalid, accessMethod parameter'; }'
            }

            if(!isValidAccessMethod(accessMethod)) { ''
                this.loggingSystem.warn('NavigationContextManager }'
                    `Unknown access method: ${accessMethod}, continuing anyway`};
            }

            if(!isValidContextData(additionalData)) { ''
                throw new Error('Invalid, additionalData parameter' }'
            
            const context: NavigationContext = { scene: fromScene,
                method: accessMethod as AccessMethod,
                timestamp: Date.now(),
                data: additionalData,
    id: this.generateContextId(  },
            
            // 循環ナビゲーションのチェック
            if (!this.config.allowCircularNavigation && this.isCircularNavigation(fromScene) {

                if (this.config.enableLogging) {
            }

                    this.loggingSystem.warn('NavigationContextManager' }'
                        `Circular navigation detected: ${fromScene}`};
                }
                return false;
            }
            
            // スタックサイズの管理
            while(this.navigationStack.length >= this.config.maxStackSize) {
                const removed = this.navigationStack.shift();
                if (removed && this.config.enableLogging) {
            }

                    this.loggingSystem.debug('NavigationContextManager' }'
                        `Removed oldest context: ${removed.scene}`};
                }
            }
            
            // コンテキストをスタックに追加
            this.navigationStack.push(context);
            this.currentContext = context;

            if (this.config.enableLogging) {', ' }

                this.loggingSystem.debug('NavigationContextManager' }'
                    `Context pushed: ${fromScene} via ${accessMethod} (ID: ${ context.id }`};
            }
            
            return true;

        } catch (error) {
            const err = error instanceof Error ? error: new Error(String(error);
            this.errorHandler.handleError(err, 'NavigationContextManager.pushContext),'
            return false,
    
    /**
     * ナビゲーションコンテキストをポップ
     */
    popContext(): NavigationContext | null { try {
            if (this.navigationStack.length === 0) {

                if (this.config.enableLogging) {
            }

                    this.loggingSystem.debug('NavigationContextManager', 'No navigation context to pop - using default fallback); }'
                }
                return null;
            }
            
            const poppedContext = this.navigationStack.pop();
            this.currentContext = this.navigationStack.length > 0 ;
                ? this.navigationStack[this.navigationStack.length - 1] ;
                : null;

            if (poppedContext && this.config.enableLogging) {', ' }

                this.loggingSystem.debug('NavigationContextManager' }'
                    `Context popped: ${poppedContext.scene} (ID: ${ poppedContext.id }`};
            }
            
            return poppedContext || null;

        } catch (error) {
            const err = error instanceof Error ? error: new Error(String(error);
            this.errorHandler.handleError(err, 'NavigationContextManager.popContext',
            return null,
    
    /**
     * 戻り先コンテキストを設定
     */'
    setReturnContext(returnContext: ReturnContext): boolean { try {'
            if(!isReturnContext(returnContext)) {''
                throw new Error('Invalid, return context, parameter'),  }
            
            // 現在のコンテキストを上書きする形で戻り先を設定
            const context: NavigationContext = { scene: returnContext.targetScene,''
                method: 'explicit_return',
                timestamp: Date.now(
    data: {
                    ...returnContext.contextData,
                    preserveState: returnContext.preserveState || false  },
                id: this.generateContextId(),
            };
            
            // スタックの最上位を置換（新しいコンテキストがない場合は追加）
            if (this.navigationStack.length > 0) { this.navigationStack[this.navigationStack.length - 1] = context } else { this.navigationStack.push(context) }
            
            this.currentContext = context;

            if (this.config.enableLogging) {', ' }

                this.loggingSystem.debug('NavigationContextManager' }'
                    `Return context set: ${returnContext.targetScene} (ID: ${ context.id }`};
            }
            
            return true;

        } catch (error) {
            const err = error instanceof Error ? error: new Error(String(error);
            this.errorHandler.handleError(err, 'NavigationContextManager.setReturnContext),'
            return false,
    
    /**
     * 戻り先シーンを取得
     */
    getReturnDestination(): string { try {
            if (this.navigationStack.length === 0) {
    
}
                return this.config.defaultReturnScene;
            
            const lastContext = this.navigationStack[this.navigationStack.length - 1];
            const returnScene = lastContext.scene;
            
            // シーンの存在確認
            if (hasSceneManager(this.gameEngine) {
                if (!this.gameEngine.sceneManager.hasScene(returnScene) {''
                    if (this.config.enableLogging) {
            }

                        this.loggingSystem.warn('NavigationContextManager' }'
                            `Return scene not found: ${returnScene}, using default`};
                    }
                    return this.config.defaultReturnScene;
            
            return returnScene;

        } catch (error) {
            const err = error instanceof Error ? error: new Error(String(error);
            this.errorHandler.handleError(err, 'NavigationContextManager.getReturnDestination),'
            return this.config.defaultReturnScene,
    
    /**
     * 現在のコンテキストを取得
     */
    getCurrentContext(): NavigationContext | null { return this.currentContext }
    
    /**
     * ナビゲーションスタックの深度を取得
     */
    getStackDepth(): number { return this.navigationStack.length }
    
    /**
     * 特定のアクセス方法でのコンテキストが存在するかチェック
     */
    hasContextByMethod(accessMethod: string): boolean { return this.navigationStack.some(context => context.method === accessMethod);
    /**
     * 特定のシーンからのコンテキストが存在するかチェック
     */
    hasContextFromScene(scene: string): boolean { return this.navigationStack.some(context => context.scene === scene);
    /**
     * コンテキストスタックをクリア
     */
    clear(): void { this.navigationStack = [];
        this.currentContext = null;

        if (this.config.enableLogging) {', ' }

            this.loggingSystem.debug('NavigationContextManager', 'Navigation stack cleared); }'
}
    
    /**
     * コンテキストの履歴を取得
     */
    getHistory(limit?: number | null): NavigationContext[] { const history = [...this.navigationStack],
        return limit ? history.slice(-limit) : history;
    
    /**
     * 設定を更新
     */
    updateConfig(newConfig: Partial<NavigationConfig>): void { try {
            // 設定値の検証
            if (newConfig.maxStackSize !== undefined && newConfig.maxStackSize < 1) {', ' }

                throw new Error('maxStackSize, must be, at least, 1'; }'
            }

            if (newConfig.defaultReturnScene !== undefined && !newConfig.defaultReturnScene) {', ' }

                throw new Error('defaultReturnScene, cannot be, empty'; }'
            }

            this.config = { ...this.config, ...newConfig,

            if (this.config.enableLogging) {', ' }

                this.loggingSystem.debug('NavigationContextManager', 'Configuration updated); }'

            } catch (error) {
            const err = error instanceof Error ? error: new Error(String(error);
            this.errorHandler.handleError(err, 'NavigationContextManager.updateConfig' }'
    }
    
    /**
     * デバッグ情報を取得
     */
    getDebugInfo(): DebugInfo { return { stackSize: this.navigationStack.length,
            maxStackSize: this.config.maxStackSize,
    currentContext: this.currentContext },
            stack: [...this.navigationStack], // 防御的コピー }
            config: { ...this.config // 防御的コピー
        }
    
    /**
     * 循環ナビゲーションの検出
     */
    private isCircularNavigation(scene: string): boolean { // 直前のコンテキストと同じシーンかチェック
        if (this.currentContext && this.currentContext.scene === scene) {
    
}
            return true;
        
        // 最近の履歴で同じシーンが頻繁に出現するかチェック
        const recentHistory = this.getHistory(RECENT_HISTORY_LIMIT);
        const sceneCount = recentHistory.filter(context => context.scene === scene).length;
        
        return sceneCount >= CIRCULAR_NAVIGATION_THRESHOLD; // 5件中3件以上同じシーンがあれば循環とみなす
    }
    
    /**
     * コンテキストIDを生成
     */
    private generateContextId(): string {
        return `nav_${Date.now())_${Math.random().toString(36).substr(2, CONTEXT_ID_LENGTH}`;
    }

    /**
     * 最後のコンテキストのアクセス方法を取得
     */
    getLastAccessMethod(): AccessMethod | null { if (this.currentContext) {
            return this.currentContext.method }
        return null;
    }

    /**
     * 特定のシーンへの直接戻りパスを設定
     */''
    setDirectReturnPath(targetScene: string, preserveState = false): boolean { ''
        if(!targetScene || typeof, targetScene !== 'string' { }
            return false;

        // 現在のスタックをクリアして直接パスを設定
        this.clear();
        
        return this.setReturnContext({
                targetScene
            preserveState }
            contextData: { directReturn: true,);
    }

    /**
     * スタック内の特定コンテキストまで戻る
     */
    popToContext(contextId: string): NavigationContext[] { const poppedContexts: NavigationContext[] = [],
        
        try {
            while(this.navigationStack.length > 0) {
                const context = this.navigationStack[this.navigationStack.length - 1],
                
                if (context.id === contextId) {
            }
                    break; // 指定されたコンテキストに到達 }
                }
                
                const popped = this.popContext();
                if (popped) { poppedContexts.push(popped) } else { break }
            }

            if (this.config.enableLogging) {', ' }

                this.loggingSystem.debug('NavigationContextManager' }'
                    `Popped ${poppedContexts.length} contexts to reach context: ${contextId}`};
            } catch (error) {
            const err = error instanceof Error ? error: new Error(String(error);
            this.errorHandler.handleError(err, 'NavigationContextManager.popToContext' }'

        return poppedContexts;
    }

    /**
     * コンテキストの検索
     */
    findContext(predicate: (context: NavigationContext) => boolean): NavigationContext | null { return this.navigationStack.find(predicate) || null }

    /**
     * コンテキストフィルタリング
     */
    filterContexts(predicate: (context: NavigationContext) => boolean): NavigationContext[] { return this.navigationStack.filter(predicate) }

    /**
     * 統計情報の取得
     */
    getStatistics(): { totalContexts: number,
        uniqueScenes: number,
    accessMethods: Record<string, number>,
        averageStackDepth: number,
    oldestContext: NavigationContext | null  } {
        const accessMethods: Record<string, number> = {};
        const uniqueScenes = new Set<string>();

        this.navigationStack.forEach(context => {  );
            uniqueScenes.add(context.scene) }
            accessMethods[context.method] = (accessMethods[context.method] || 0) + 1; }
        };

        return { totalContexts: this.navigationStack.length,
            uniqueScenes: uniqueScenes.size,
            accessMethods,
            averageStackDepth: this.navigationStack.length, // 簡単な実装 };
            oldestContext: this.navigationStack.length > 0 ? this.navigationStack[0] : null,
    
    /**
     * クリーンアップ処理
     */
    cleanup(): void { try {
            this.clear();
            if (this.config.enableLogging) {', ' }

                this.loggingSystem.info('NavigationContextManager', 'Navigation context manager cleaned up); }'

            } catch (error) {
            const err = error instanceof Error ? error: new Error(String(error);
            this.errorHandler.handleError(err, 'NavigationContextManager.cleanup') }

    }'}'