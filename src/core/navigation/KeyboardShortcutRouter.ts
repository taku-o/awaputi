/**
 * KeyboardShortcutRouter - 統一キーボードショートカットルーティングシステム
 * 
 * ヘルプ・設定画面統合のための統一的なショートカット処理機能
 * 統一的なキーボードショートカット処理とナビゲーション管理
 * 
 * @version 1.0.0
 * @since Issue #163 - Duplicate help/settings screen consolidation
 */

import { NavigationContextManager  } from './NavigationContextManager.js';
import { getLoggingSystem  } from '../LoggingSystem.js';
import { ErrorHandler  } from '../../utils/ErrorHandler.js';

// NavigationContextManager.ts からの型をインポート
import type { GameEngine, 
    LoggingSystem, ;
    ErrorHandlerInstance, ;
    ContextData,

    SceneName ' }'

} from './NavigationContextManager.js';

// 型定義
export interface ShortcutDefinition { action: ShortcutAction,
    scene: SceneName | null,
    description: string;
    enabled?: boolean;
    priority?: ShortcutPriority;
    ,}

export interface KeyboardShortcutConfig { enableLogging: boolean,
    enableGlobalShortcuts: boolean;
    preventDefaultBehavior: boolean;
    enableContextualRouting: boolean;
    allowSceneOverride: boolean,
    debounceDelay: number ,}

export interface RouterState { isActive: boolean;
    lastKeyTime: number;
    pressedKeys: Set<string>;
    activeModifiers: Set<ModifierKey>
    }

export interface ShortcutExecutionContext { currentScene: string;
    event: KeyboardEvent;
    keyCombo: string,
    timestamp: number }

export interface NavigationOptions { contextual?: boolean;
    documentation?: boolean;
    quick?: boolean;
    sourceScene?: string;
    preserveState?: boolean;
    [key: string]: any, }

export interface ShortcutDebugInfo { shortcuts: Array<[string, ShortcutDefinition]>,
    modifierShortcuts: Array<[string, ShortcutDefinition]>,
    state: RouterState;
    config: KeyboardShortcutConfig,
    navigationContext: any ,}

export interface SceneManager { switchScene: (sceneName: string, options?: any) => boolean,
    currentScene?: {
        constructor: {
            nam;e: string ,}
        };''
    getCurrentScene?: () => string;
}

export interface ExtendedGameEngine extends GameEngine { sceneManager?: SceneManager;
    }

// 列挙型
export type ShortcutAction = '';
    | 'contextualHelp' | 'documentationHelp' | 'quickHelp', '';
    | 'goBack' | 'fullscreen' | 'toggleSettings', '';
    | 'openUserInfo' | 'showMenu' | 'pauseGame', '';
    | 'screenshot' | 'debugMode' | 'customAction';

export type ModifierKey = 'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey';
';

export type KeyCode = '';
    | 'F1' | 'F11' | 'Escape' | 'Enter' | 'Space' | 'Tab''';
    | 'KeyH' | 'KeyS' | 'KeyI' | 'Slash' | 'Backquote''';
    | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

export type ShortcutPriority = 'low' | 'normal' | 'high' | 'critical';

// 定数
export const DEFAULT_DEBOUNCE_DELAY = 100;''
export const MODIFIER_KEYS: ModifierKey[] = ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'];

// デフォルト設定
export const DEFAULT_SHORTCUT_CONFIG: KeyboardShortcutConfig = { enableLogging: true,
    enableGlobalShortcuts: true;
    preventDefaultBehavior: true;
    enableContextualRouting: true;
    allowSceneOverride: false,
    debounceDelay: DEFAULT_DEBOUNCE_DELAY ,};
// デフォルトショートカット
export const DEFAULT_SHORTCUTS: Array<[string, ShortcutDefinition]> = [']';
    ['F1', { action: 'contextualHelp', scene: 'help', description: 'Show contextual help' ,}],''
    ['Escape', { action: 'goBack', scene: null, description: 'Go back to previous screen' ,}],''
    ['F11', { action: 'fullscreen', scene: null, description: 'Toggle fullscreen mode' ,}]
];
';

export const DEFAULT_MODIFIER_SHORTCUTS: Array<[string, ShortcutDefinition]> = [']';
    ['Ctrl+KeyH', { action: 'documentationHelp', scene: 'help', description: 'Show documentation help' ,}],''
    ['Ctrl+Slash', { action: 'quickHelp', scene: 'help', description: 'Show quick help' ,}]
];
';
// 型ガード
export function isValidShortcutAction(action: string): action is ShortcutAction { return ['', 'contextualHelp', 'documentationHelp', 'quickHelp',
        'goBack', 'fullscreen', 'toggleSettings',
        'openUserInfo', 'showMenu', 'pauseGame',]';
        'screenshot', 'debugMode', 'customAction'];
    ].includes(action); }

export function isShortcutDefinition(shortcut: any): shortcut is ShortcutDefinition { return shortcut &&''
           typeof shortcut === 'object' &&'';
           typeof shortcut.action === 'string' &&'';
           typeof shortcut.description === 'string' &&'';
           (shortcut.scene === null || typeof, shortcut.scene === 'string'); }

export function isModifierKey(key: string): key is ModifierKey { return MODIFIER_KEYS.includes(key, as ModifierKey); }

export function hasSceneManager(engine: any): engine is ExtendedGameEngine & { sceneManager: SceneManager } { return engine &&;
           engine.sceneManager &&'';
           typeof engine.sceneManager.switchScene === 'function'; }
}

export function isKeyboardEvent(event: any): event is KeyboardEvent { return event instanceof KeyboardEvent; }

export function isValidKeyCode(code: string): code is KeyCode { return /^(Key[A-Z]|Digit[0-9]|F[0-9]+|Arrow(Up|Down|Left|Right)|Enter|Escape|Space|Tab|Slash|Backquote)$/.test(code); }

/**
 * キーボードショートカットルーター
 * 統一的なキーボードショートカット処理とナビゲーション管理
 */
export class KeyboardShortcutRouter {
    private gameEngine: ExtendedGameEngine;
    private loggingSystem: LoggingSystem;
    private errorHandler: ErrorHandlerInstance;
    // NavigationContextManagerのインスタンス
    private navigationContext: NavigationContextManager;
    // ショートカットマッピング
    private, shortcuts: Map<string, ShortcutDefinition>;
    private modifierShortcuts: Map<string, ShortcutDefinition>;
    
    // 設定
    private config: KeyboardShortcutConfig;
    // 状態管理
    private, state: RouterState;
    // イベントハンドラー
    private keydownHandler!: (event: KeyboardEvent) => void;
    private keyupHandler!: (event: KeyboardEvent) => void;
    private focusHandler!: (event: Event) => void;

    constructor(gameEngine: ExtendedGameEngine) {

        this.gameEngine = gameEngine;
        this.loggingSystem = getLoggingSystem();
        this.errorHandler = ErrorHandler.getInstance ? ErrorHandler.getInstance() : new ErrorHandler();
        
        // NavigationContextManagerのインスタンス
        this.navigationContext = new NavigationContextManager(gameEngine);
        
        // ショートカットマッピングの初期化
        this.shortcuts = new Map(DEFAULT_SHORTCUTS);
        this.modifierShortcuts = new Map(DEFAULT_MODIFIER_SHORTCUTS);
        

    ,}
    }
        // 設定の初期化 }
        this.config = { ...DEFAULT_SHORTCUT_CONFIG;
        
        // 状態管理の初期化
        this.state = { isActive: false,
            lastKeyTime: 0;
            pressedKeys: new Set<string>();
            activeModifiers: new Set<ModifierKey>( ,};
        
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    private initialize(): void { try {
            this.setupEventListeners();
            this.state.isActive = true;

            if(this.config.enableLogging) {', ';

            }

                this.loggingSystem.info('KeyboardShortcutRouter', 'Keyboard shortcut router initialized); }

            } catch (error) {
            const err = error instanceof Error ? error: new Error(String(error)),
            this.errorHandler.handleError(err, 'KeyboardShortcutRouter.initialize';
            throw err; }
    }
    
    /**
     * イベントリスナーの設定'
     */''
    private setupEventListeners()';
        if(typeof, window !== 'undefined' {'
            // キーダウンイベント
            this.keydownHandler = this.handleKeyDown.bind(this);''
            window.addEventListener('keydown', this.keydownHandler';
            ';
            // キーアップイベント
            this.keyupHandler = this.handleKeyUp.bind(this);''
            window.addEventListener('keyup', this.keyupHandler';
            ';
            // フォーカス管理
            this.focusHandler = this.handleFocusChange.bind(this);''
            window.addEventListener('blur', this.focusHandler';

        }

            window.addEventListener('focus', this.focusHandler); }
}
    
    /**
     * キーダウンイベントの処理
     */
    private handleKeyDown(event: KeyboardEvent): void { try {
            if(!this.state.isActive || !this.config.enableGlobalShortcuts) {
                
            }
                return; }
            }
            
            // デバウンス処理
            const now = Date.now();
            if (now - this.state.lastKeyTime < this.config.debounceDelay) { return; }
            this.state.lastKeyTime = now;
            
            // 修飾キーの追跡
            this.updateModifierKeys(event);
            
            // ショートカットキーの組み合わせを生成
            const keyCombo = this.generateKeyCombo(event);

            if(this.config.enableLogging) { ' }'

                this.loggingSystem.debug('KeyboardShortcutRouter', `Key combination: ${keyCombo}`});
            }
            
            // ショートカットの処理
            if(this.processShortcut(keyCombo, event) {
                if (this.config.preventDefaultBehavior) {
                    event.preventDefault();
            }
                    event.stopPropagation(); }
} catch (error) {
            const err = error instanceof Error ? error: new Error(String(error)),
            this.errorHandler.handleError(err, 'KeyboardShortcutRouter.handleKeyDown'; }'
    }
    
    /**
     * キーアップイベントの処理
     */
    private handleKeyUp(event: KeyboardEvent): void { try {
            this.updateModifierKeys(event, false);
            this.state.pressedKeys.delete(event.code); }

        } catch (error) {
            const err = error instanceof Error ? error: new Error(String(error)),
            this.errorHandler.handleError(err, 'KeyboardShortcutRouter.handleKeyUp'; }'
    }
    
    /**
     * フォーカス変更の処理'
     */''
    private handleFocusChange(event: Event): void { ''
        if(event.type === 'blur' {'
            // フォーカスを失った時は修飾キーをクリア
            this.state.activeModifiers.clear();
        }
            this.state.pressedKeys.clear(); }
}
    
    /**
     * 修飾キーの状態を更新
     */
    private updateModifierKeys(event: KeyboardEvent, isPressed = true): void { MODIFIER_KEYS.forEach(modifier => { );
            if (event[modifier] && isPressed) { }
                this.state.activeModifiers.add(modifier); }
            } else if (!event[modifier] && !isPressed) { this.state.activeModifiers.delete(modifier); }
        });
        
        if (isPressed) { this.state.pressedKeys.add(event.code); }
    }
    
    /**
     * キーの組み合わせ文字列を生成
     */
    private generateKeyCombo(event: KeyboardEvent): string { const parts: string[] = [],

        if(event.ctrlKey || event.metaKey) parts.push('Ctrl';''
        if(event.shiftKey) parts.push('Shift';''
        if(event.altKey) parts.push('Alt);

        parts.push(event.code);

        return parts.join('+'; }'
    
    /**
     * ショートカットの処理
     */
    private processShortcut(keyCombo: string, event: KeyboardEvent): boolean { try {
            // 修飾キー付きショートカットを最初にチェック
            if(this.modifierShortcuts.has(keyCombo) {
                const shortcut = this.modifierShortcuts.get(keyCombo);
            }
                return shortcut ? this.executeShortcut(shortcut, event) : false;
            
            // 単一キーショートカットをチェック
            if(this.shortcuts.has(event.code) {
                const shortcut = this.shortcuts.get(event.code);
            }
                return shortcut ? this.executeShortcut(shortcut, event) : false;
            
            return false;
        } catch (error) {
            const err = error instanceof Error ? error: new Error(String(error)),
            this.errorHandler.handleError(err, 'KeyboardShortcutRouter.processShortcut);
            return false;
    
    /**
     * ショートカットアクションの実行
     */
    private executeShortcut(shortcut: ShortcutDefinition, event: KeyboardEvent): boolean { try {
            // ショートカットが無効化されている場合はスキップ
            if(shortcut.enabled === false) {
                
            ,}
                return false;

            const currentScene = this.getCurrentScene();

            if(this.config.enableLogging) {', ';

            }

                this.loggingSystem.info('KeyboardShortcutRouter' }'
                    `Executing shortcut: ${shortcut.action} from scene: ${currentScene}`});
            }

            const context: ShortcutExecutionContext = { currentScene,
                event,
                keyCombo: this.generateKeyCombo(event),
    timestamp: Date.now( ,};

            switch(shortcut.action) {'

                case 'contextualHelp':'';
                    return this.handleContextualHelp(context);

                case 'documentationHelp':'';
                    return this.handleDocumentationHelp(context);

                case 'quickHelp':'';
                    return this.handleQuickHelp(context);

                case 'goBack':'';
                    return this.handleGoBack('''
                case 'fullscreen': '';
                    return, this.handleFullscreen()';
                case 'toggleSettings':')';
                    return this.handleToggleSettings(context);

                case 'openUserInfo':'';
                    return this.handleOpenUserInfo(context);

                case 'showMenu':'';
                    return this.handleShowMenu(context);

                case 'pauseGame':;
                    return this.handlePauseGame(context);
                    
                default:;
                    if (shortcut.scene) {
            ,}
                        return this.navigateToScene(shortcut.scene, context.currentScene, shortcut.action);
                    return false;

            } catch (error) {
            const err = error instanceof Error ? error: new Error(String(error)),
            this.errorHandler.handleError(err, 'KeyboardShortcutRouter.executeShortcut';
            return false;
    
    /**
     * コンテキストヘルプの処理'
     */''
    private handleContextualHelp(context: ShortcutExecutionContext): boolean { // F1キーでのコンテキストヘルプ
        return this.navigateToScene('help', context.currentScene, 'keyboard_f1', {)
            contextual: true,';
            sourceScene: context.currentScene ,}
    
    /**
     * ドキュメントヘルプの処理'
     */''
    private handleDocumentationHelp(context: ShortcutExecutionContext): boolean { ''
        return this.navigateToScene('help', context.currentScene, 'keyboard_ctrl_h', {)
            documentation: true,';
            sourceScene: context.currentScene ,}
    
    /**
     * クイックヘルプの処理'
     */''
    private handleQuickHelp(context: ShortcutExecutionContext): boolean { ''
        return this.navigateToScene('help', context.currentScene, 'keyboard_ctrl_slash', {)
            quick: true,);
            sourceScene: context.currentScene ,}
    
    /**
     * 戻るアクションの処理
     */
    private handleGoBack(): boolean { const returnScene = this.navigationContext.getReturnDestination();
        this.navigationContext.popContext();
        
        if(returnScene && hasSceneManager(this.gameEngine) {
        
            const success = this.gameEngine.sceneManager.switchScene(returnScene);

            if(this.config.enableLogging) {'
        
        }

                this.loggingSystem.info('KeyboardShortcutRouter' }'
                    `Navigated back to: ${returnScene}, success: ${success}`}';
            }
            
            return success;
        }
        
        return false;
    }
    
    /**
     * フルスクリーン切り替えの処理'
     */''
    private handleFullscreen()';
            if(typeof, document !== 'undefined' {'
                if (!document.fullscreenElement) {
            }
                    document.documentElement.requestFullscreen?.(); }
                } else { document.exitFullscreen?.(); }
                return true;
            }
            return false;

        } catch (error) { : undefined''
            const err = error instanceof Error ? error: new Error(String(error)),
            this.errorHandler.handleError(err, 'KeyboardShortcutRouter.handleFullscreen';
            return false;

    /**
     * 設定画面切り替えの処理'
     */''
    private handleToggleSettings(context: ShortcutExecutionContext): boolean { ''
        return this.navigateToScene('settings', context.currentScene, 'keyboard_shortcut', {'
            sourceScene: context.currentScene ,}

    /**
     * ユーザー情報画面の処理'
     */''
    private handleOpenUserInfo(context: ShortcutExecutionContext): boolean { ''
        return this.navigateToScene('user_info', context.currentScene, 'keyboard_shortcut', {'
            sourceScene: context.currentScene ,}

    /**
     * メニュー表示の処理'
     */''
    private handleShowMenu(context: ShortcutExecutionContext): boolean { ''
        return this.navigateToScene('menu', context.currentScene, 'keyboard_shortcut', {'
            sourceScene: context.currentScene ,}

    /**
     * ゲーム一時停止の処理'
     */''
    private handlePauseGame(context: ShortcutExecutionContext): boolean { // ゲーム一時停止の実装は gameEngine に依存
        if(this.gameEngine && 'pauseGame' in, this.gameEngine) {
            try {
                (this.gameEngine, as any).pauseGame();
        }
                return true; catch (error) {
                const err = error instanceof Error ? error: new Error(String(error)),
                this.errorHandler.handleError(err, 'KeyboardShortcutRouter.handlePauseGame'; }'
        }
        return false;
    }
    
    /**
     * シーンへのナビゲーション
     */
    private navigateToScene(;
        targetScene: SceneName;
        currentScene: string );
        accessMethod: string | ShortcutAction),
    additionalData: NavigationOptions = { ): boolean {
        try {
            // ナビゲーションコンテキストをプッシュ
            this.navigationContext.pushContext(currentScene, accessMethod, additionalData);
            
            // シーンを切り替え
            if(hasSceneManager(this.gameEngine) {
                const success = this.gameEngine.sceneManager.switchScene(targetScene);

                if(this.config.enableLogging) {'
            }

                    this.loggingSystem.info('KeyboardShortcutRouter' }'
                        `Navigated to: ${targetScene}, success: ${success}`});
                }
                
                return success;
            }
            
            return false;

        } catch (error) {
            const err = error instanceof Error ? error: new Error(String(error)),
            this.errorHandler.handleError(err, 'KeyboardShortcutRouter.navigateToScene';
            return false;
    
    /**
     * 現在のシーン名を取得
     */'
    private getCurrentScene(): string { try {'
            if (hasSceneManager(this.gameEngine) && this.gameEngine.sceneManager.currentScene) {'
                return this.gameEngine.sceneManager.currentScene.constructor.name'';
                    .replace('Scene', '').toLowerCase()';
            return 'unknown';' }

        } catch (error) {
            return 'unknown';
    
    /**
     * ショートカットの追加
     */'
    addShortcut(key: string, shortcut: ShortcutDefinition): boolean { if(!isShortcutDefinition(shortcut) {''
            if(this.config.enableLogging) {' ,}'

                this.loggingSystem.warn('KeyboardShortcutRouter', `Invalid shortcut definition for key: ${key}`'}';
            }
            return false;
        }

        if(key.includes('+) { this.modifierShortcuts.set(key, shortcut); } else { this.shortcuts.set(key, shortcut); }'

        if(this.config.enableLogging) { ' }'

            this.loggingSystem.debug('KeyboardShortcutRouter', `Added shortcut: ${key}`});
        }

        return true;
    }
    
    /**
     * ショートカットの削除
     */
    removeShortcut(key: string): boolean { const removed = this.shortcuts.delete(key) || this.modifierShortcuts.delete(key);

        if(removed && this.config.enableLogging) {' }'

            this.loggingSystem.debug('KeyboardShortcutRouter', `Removed shortcut: ${key}`});
        }
        
        return removed;
    }

    /**
     * ショートカットの有効/無効化
     */
    setShortcutEnabled(key: string, enabled: boolean): boolean { const shortcut = this.shortcuts.get(key) || this.modifierShortcuts.get(key);
        if(shortcut) {'
            shortcut.enabled = enabled;''
            if(this.config.enableLogging) {'
        }

                this.loggingSystem.debug('KeyboardShortcutRouter'')' }

                    `Shortcut ${key} ${enabled ? 'enabled' : 'disabled'}`});
            }
            return true;
        }
        return false;
    }

    /**
     * すべてのショートカットを取得
     */
    getAllShortcuts(): { key: string;, shortcut: ShortcutDefinition }[] {
        const all: { key: string;, shortcut: ShortcutDefinition }[] = [];
        
        this.shortcuts.forEach((shortcut, key) => {  }
            all.push({ key, shortcut });
        });
        
        this.modifierShortcuts.forEach((shortcut, key) => {  }
            all.push({ key, shortcut });
        });
        
        return all.sort((a, b) => a.key.localeCompare(b.key);
    }

    /**
     * ショートカットの存在確認
     */
    hasShortcut(key: string): boolean { return this.shortcuts.has(key) || this.modifierShortcuts.has(key); }

    /**
     * 特定のアクションのショートカットを取得
     */
    getShortcutsByAction(action: ShortcutAction): { key: string;, shortcut: ShortcutDefinition }[] { return this.getAllShortcuts().filter(item => item.shortcut.action === action);
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<KeyboardShortcutConfig>): void { // 設定値の検証
        if(newConfig.debounceDelay !== undefined && newConfig.debounceDelay < 0) {
            
        }
            newConfig.debounceDelay = DEFAULT_DEBOUNCE_DELAY; }
        }

        this.config = { ...this.config, ...newConfig;

        if(this.config.enableLogging) {', ';

        }

            this.loggingSystem.debug('KeyboardShortcutRouter', 'Configuration updated); }
}
    
    /**
     * アクティブ状態の切り替え
     */
    setActive(active: boolean): void { this.state.isActive = active;

        if(this.config.enableLogging) {' }'

            this.loggingSystem.debug('KeyboardShortcutRouter', `Router ${active ? 'activated' : 'deactivated}`});
        }
    }

    /**
     * アクティブ状態の確認
     */
    isActive(): boolean { return this.state.isActive; }

    /**
     * 現在押されているキーを取得
     */
    getPressedKeys(): string[] { return Array.from(this.state.pressedKeys); }

    /**
     * アクティブな修飾キーを取得
     */
    getActiveModifiers(): ModifierKey[] { return Array.from(this.state.activeModifiers); }

    /**
     * ナビゲーションコンテキストマネージャーを取得
     */
    getNavigationContext(): NavigationContextManager { return this.navigationContext; }
    
    /**
     * デバッグ情報の取得
     */
    getDebugInfo(): ShortcutDebugInfo { return { shortcuts: Array.from(this.shortcuts.entries(),
            modifierShortcuts: Array.from(this.modifierShortcuts.entries(),
    state: {
                ...this.state;
                pressedKeys: new Set(this.state.pressedKeys), };
                activeModifiers: new Set(this.state.activeModifiers); 
    },
            config: { ...this.config;
            navigationContext: this.navigationContext.getDebugInfo();
        }
    
    /**
     * クリーンアップ処理'
     */''
    cleanup()';
            if(typeof, window !== 'undefined' {'

                if(this.keydownHandler) {'
    }

                    window.removeEventListener('keydown', this.keydownHandler'; }

                }''
                if(this.keyupHandler) {', ';

                }

                    window.removeEventListener('keyup', this.keyupHandler'; }

                }''
                if(this.focusHandler) {'

                    window.removeEventListener('blur', this.focusHandler';

                }

                    window.removeEventListener('focus', this.focusHandler); }
}
            
            // 状態のクリア
            this.state.pressedKeys.clear();
            this.state.activeModifiers.clear();
            this.state.isActive = false;
            
            // ナビゲーションコンテキストのクリーンアップ
            this.navigationContext.cleanup();

            if(this.config.enableLogging) {', ';

            }

                this.loggingSystem.info('KeyboardShortcutRouter', 'Keyboard shortcut router cleaned up); }

            } catch (error) {
            const err = error instanceof Error ? error: new Error(String(error)),
            this.errorHandler.handleError(err, 'KeyboardShortcutRouter.cleanup''); }

    }''
}