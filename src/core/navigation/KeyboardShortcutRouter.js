/**
 * KeyboardShortcutRouter.js
 * 
 * 統一キーボードショートカットルーティングシステム
 * ヘルプ・設定画面統合のための統一的なショートカット処理機能
 * 
 * @version 1.0.0
 * @since Issue #163 - Duplicate help/settings screen consolidation
 */

import { NavigationContextManager } from './NavigationContextManager.js';
import { LoggingSystem } from '../logging/LoggingSystem.js';
import { ErrorHandler } from '../error/ErrorHandler.js';

/**
 * キーボードショートカットルーター
 * 統一的なキーボードショートカット処理とナビゲーション管理
 */
export class KeyboardShortcutRouter {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance();
        this.errorHandler = ErrorHandler.getInstance();
        
        // NavigationContextManagerのインスタンス
        this.navigationContext = new NavigationContextManager(gameEngine);
        
        // ショートカットマッピング
        this.shortcuts = new Map([
            ['KeyH', { action: 'help', scene: 'help', description: 'Open help screen' }],
            ['KeyS', { action: 'settings', scene: 'settings', description: 'Open settings screen' }],
            ['F1', { action: 'contextualHelp', scene: 'help', description: 'Show contextual help' }],
            ['Escape', { action: 'goBack', scene: null, description: 'Go back to previous screen' }],
            ['F11', { action: 'fullscreen', scene: null, description: 'Toggle fullscreen mode' }]
        ]);
        
        // 修飾キーの組み合わせ
        this.modifierShortcuts = new Map([
            ['Ctrl+KeyH', { action: 'documentationHelp', scene: 'help', description: 'Show documentation help' }],
            ['Ctrl+Slash', { action: 'quickHelp', scene: 'help', description: 'Show quick help' }]
        ]);
        
        // 設定
        this.config = {
            enableLogging: true,
            enableGlobalShortcuts: true,
            preventDefaultBehavior: true,
            enableContextualRouting: true,
            allowSceneOverride: false,
            debounceDelay: 100
        };
        
        // 状態管理
        this.state = {
            isActive: false,
            lastKeyTime: 0,
            pressedKeys: new Set(),
            activeModifiers: new Set()
        };
        
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    initialize() {
        try {
            this.setupEventListeners();
            this.state.isActive = true;
            
            if (this.config.enableLogging) {
                this.loggingSystem.info('KeyboardShortcutRouter', 'Keyboard shortcut router initialized');
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'KeyboardShortcutRouter.initialize');
            throw error;
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        if (typeof window !== 'undefined') {
            // キーダウンイベント
            this.keydownHandler = this.handleKeyDown.bind(this);
            window.addEventListener('keydown', this.keydownHandler);
            
            // キーアップイベント
            this.keyupHandler = this.handleKeyUp.bind(this);
            window.addEventListener('keyup', this.keyupHandler);
            
            // フォーカス管理
            this.focusHandler = this.handleFocusChange.bind(this);
            window.addEventListener('blur', this.focusHandler);
            window.addEventListener('focus', this.focusHandler);
        }
    }
    
    /**
     * キーダウンイベントの処理
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleKeyDown(event) {
        try {
            if (!this.state.isActive || !this.config.enableGlobalShortcuts) {
                return;
            }
            
            // デバウンス処理
            const now = Date.now();
            if (now - this.state.lastKeyTime < this.config.debounceDelay) {
                return;
            }
            this.state.lastKeyTime = now;
            
            // 修飾キーの追跡
            this.updateModifierKeys(event);
            
            // ショートカットキーの組み合わせを生成
            const keyCombo = this.generateKeyCombo(event);
            
            if (this.config.enableLogging) {
                this.loggingSystem.debug('KeyboardShortcutRouter', `Key combination: ${keyCombo}`);
            }
            
            // ショートカットの処理
            if (this.processShortcut(keyCombo, event)) {
                if (this.config.preventDefaultBehavior) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, 'KeyboardShortcutRouter.handleKeyDown');
        }
    }
    
    /**
     * キーアップイベントの処理
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleKeyUp(event) {
        try {
            this.updateModifierKeys(event, false);
            this.state.pressedKeys.delete(event.code);
        } catch (error) {
            this.errorHandler.handleError(error, 'KeyboardShortcutRouter.handleKeyUp');
        }
    }
    
    /**
     * フォーカス変更の処理
     * @param {Event} event - フォーカスイベント
     */
    handleFocusChange(event) {
        if (event.type === 'blur') {
            // フォーカスを失った時は修飾キーをクリア
            this.state.activeModifiers.clear();
            this.state.pressedKeys.clear();
        }
    }
    
    /**
     * 修飾キーの状態を更新
     * @param {KeyboardEvent} event - キーボードイベント
     * @param {boolean} isPressed - キーが押されているか
     */
    updateModifierKeys(event, isPressed = true) {
        const modifiers = ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'];
        
        modifiers.forEach(modifier => {
            if (event[modifier] && isPressed) {
                this.state.activeModifiers.add(modifier);
            } else if (!event[modifier] && !isPressed) {
                this.state.activeModifiers.delete(modifier);
            }
        });
        
        if (isPressed) {
            this.state.pressedKeys.add(event.code);
        }
    }
    
    /**
     * キーの組み合わせ文字列を生成
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {string} キー組み合わせ文字列
     */
    generateKeyCombo(event) {
        const parts = [];
        
        if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
        if (event.shiftKey) parts.push('Shift');
        if (event.altKey) parts.push('Alt');
        
        parts.push(event.code);
        
        return parts.join('+');
    }
    
    /**
     * ショートカットの処理
     * @param {string} keyCombo - キーの組み合わせ
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} 処理されたかどうか
     */
    processShortcut(keyCombo, event) {
        try {
            // 修飾キー付きショートカットを最初にチェック
            if (this.modifierShortcuts.has(keyCombo)) {
                return this.executeShortcut(this.modifierShortcuts.get(keyCombo), event);
            }
            
            // 単一キーショートカットをチェック
            if (this.shortcuts.has(event.code)) {
                return this.executeShortcut(this.shortcuts.get(event.code), event);
            }
            
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, 'KeyboardShortcutRouter.processShortcut');
            return false;
        }
    }
    
    /**
     * ショートカットアクションの実行
     * @param {Object} shortcut - ショートカット設定
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} 実行されたかどうか
     */
    executeShortcut(shortcut, event) {
        try {
            const currentScene = this.getCurrentScene();
            
            if (this.config.enableLogging) {
                this.loggingSystem.info('KeyboardShortcutRouter', 
                    `Executing shortcut: ${shortcut.action} from scene: ${currentScene}`);
            }
            
            switch (shortcut.action) {
                case 'help':
                    return this.handleHelpShortcut(currentScene);
                    
                case 'settings':
                    return this.handleSettingsShortcut(currentScene);
                    
                case 'contextualHelp':
                    return this.handleContextualHelp(currentScene);
                    
                case 'documentationHelp':
                    return this.handleDocumentationHelp(currentScene);
                    
                case 'quickHelp':
                    return this.handleQuickHelp(currentScene);
                    
                case 'goBack':
                    return this.handleGoBack();
                    
                case 'fullscreen':
                    return this.handleFullscreen();
                    
                default:
                    if (shortcut.scene) {
                        return this.navigateToScene(shortcut.scene, currentScene, shortcut.action);
                    }
                    return false;
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'KeyboardShortcutRouter.executeShortcut');
            return false;
        }
    }
    
    /**
     * ヘルプショートカットの処理
     * @param {string} currentScene - 現在のシーン
     * @returns {boolean} 処理されたかどうか
     */
    handleHelpShortcut(currentScene) {
        if (currentScene === 'help') {
            // 既にヘルプ画面にいる場合は戻る
            return this.handleGoBack();
        }
        
        return this.navigateToScene('help', currentScene, 'keyboard_h');
    }
    
    /**
     * 設定ショートカットの処理
     * @param {string} currentScene - 現在のシーン
     * @returns {boolean} 処理されたかどうか
     */
    handleSettingsShortcut(currentScene) {
        if (currentScene === 'settings') {
            // 既に設定画面にいる場合は戻る
            return this.handleGoBack();
        }
        
        return this.navigateToScene('settings', currentScene, 'keyboard_s');
    }
    
    /**
     * コンテキストヘルプの処理
     * @param {string} currentScene - 現在のシーン
     * @returns {boolean} 処理されたかどうか
     */
    handleContextualHelp(currentScene) {
        // F1キーでのコンテキストヘルプ
        return this.navigateToScene('help', currentScene, 'keyboard_f1', {
            contextual: true,
            sourceScene: currentScene
        });
    }
    
    /**
     * ドキュメントヘルプの処理
     * @param {string} currentScene - 現在のシーン
     * @returns {boolean} 処理されたかどうか
     */
    handleDocumentationHelp(currentScene) {
        return this.navigateToScene('help', currentScene, 'keyboard_ctrl_h', {
            documentation: true,
            sourceScene: currentScene
        });
    }
    
    /**
     * クイックヘルプの処理
     * @param {string} currentScene - 現在のシーン
     * @returns {boolean} 処理されたかどうか
     */
    handleQuickHelp(currentScene) {
        return this.navigateToScene('help', currentScene, 'keyboard_ctrl_slash', {
            quick: true,
            sourceScene: currentScene
        });
    }
    
    /**
     * 戻るアクションの処理
     * @returns {boolean} 処理されたかどうか
     */
    handleGoBack() {
        const returnScene = this.navigationContext.getReturnDestination();
        this.navigationContext.popContext();
        
        if (returnScene && this.gameEngine && this.gameEngine.sceneManager) {
            const success = this.gameEngine.sceneManager.switchScene(returnScene);
            
            if (this.config.enableLogging) {
                this.loggingSystem.info('KeyboardShortcutRouter', 
                    `Navigated back to: ${returnScene}, success: ${success}`);
            }
            
            return success;
        }
        
        return false;
    }
    
    /**
     * フルスクリーン切り替えの処理
     * @returns {boolean} 処理されたかどうか
     */
    handleFullscreen() {
        try {
            if (typeof document !== 'undefined') {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen?.();
                } else {
                    document.exitFullscreen?.();
                }
                return true;
            }
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, 'KeyboardShortcutRouter.handleFullscreen');
            return false;
        }
    }
    
    /**
     * シーンへのナビゲーション
     * @param {string} targetScene - 目標シーン
     * @param {string} currentScene - 現在のシーン
     * @param {string} accessMethod - アクセス方法
     * @param {Object} additionalData - 追加データ
     * @returns {boolean} ナビゲーションが成功したか
     */
    navigateToScene(targetScene, currentScene, accessMethod, additionalData = {}) {
        try {
            // ナビゲーションコンテキストをプッシュ
            this.navigationContext.pushContext(currentScene, accessMethod, additionalData);
            
            // シーンを切り替え
            if (this.gameEngine && this.gameEngine.sceneManager) {
                const success = this.gameEngine.sceneManager.switchScene(targetScene);
                
                if (this.config.enableLogging) {
                    this.loggingSystem.info('KeyboardShortcutRouter', 
                        `Navigated to: ${targetScene}, success: ${success}`);
                }
                
                return success;
            }
            
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, 'KeyboardShortcutRouter.navigateToScene');
            return false;
        }
    }
    
    /**
     * 現在のシーン名を取得
     * @returns {string} 現在のシーン名
     */
    getCurrentScene() {
        try {
            if (this.gameEngine && this.gameEngine.sceneManager && this.gameEngine.sceneManager.currentScene) {
                return this.gameEngine.sceneManager.currentScene.constructor.name.replace('Scene', '').toLowerCase();
            }
            return 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }
    
    /**
     * ショートカットの追加
     * @param {string} key - キーコード
     * @param {Object} shortcut - ショートカット設定
     */
    addShortcut(key, shortcut) {
        if (key.includes('+')) {
            this.modifierShortcuts.set(key, shortcut);
        } else {
            this.shortcuts.set(key, shortcut);
        }
        
        if (this.config.enableLogging) {
            this.loggingSystem.debug('KeyboardShortcutRouter', `Added shortcut: ${key}`);
        }
    }
    
    /**
     * ショートカットの削除
     * @param {string} key - キーコード
     */
    removeShortcut(key) {
        const removed = this.shortcuts.delete(key) || this.modifierShortcuts.delete(key);
        
        if (removed && this.config.enableLogging) {
            this.loggingSystem.debug('KeyboardShortcutRouter', `Removed shortcut: ${key}`);
        }
        
        return removed;
    }
    
    /**
     * 設定の更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (this.config.enableLogging) {
            this.loggingSystem.debug('KeyboardShortcutRouter', 'Configuration updated');
        }
    }
    
    /**
     * アクティブ状態の切り替え
     * @param {boolean} active - アクティブかどうか
     */
    setActive(active) {
        this.state.isActive = active;
        
        if (this.config.enableLogging) {
            this.loggingSystem.debug('KeyboardShortcutRouter', `Router ${active ? 'activated' : 'deactivated'}`);
        }
    }
    
    /**
     * デバッグ情報の取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo() {
        return {
            shortcuts: Array.from(this.shortcuts.entries()),
            modifierShortcuts: Array.from(this.modifierShortcuts.entries()),
            state: { ...this.state },
            config: { ...this.config },
            navigationContext: this.navigationContext.getDebugInfo()
        };
    }
    
    /**
     * クリーンアップ処理
     */
    cleanup() {
        try {
            // イベントリスナーの削除
            if (typeof window !== 'undefined') {
                window.removeEventListener('keydown', this.keydownHandler);
                window.removeEventListener('keyup', this.keyupHandler);
                window.removeEventListener('blur', this.focusHandler);
                window.removeEventListener('focus', this.focusHandler);
            }
            
            // 状態のクリア
            this.state.pressedKeys.clear();
            this.state.activeModifiers.clear();
            this.state.isActive = false;
            
            // ナビゲーションコンテキストのクリーンアップ
            this.navigationContext.cleanup();
            
            if (this.config.enableLogging) {
                this.loggingSystem.info('KeyboardShortcutRouter', 'Keyboard shortcut router cleaned up');
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'KeyboardShortcutRouter.cleanup');
        }
    }
}