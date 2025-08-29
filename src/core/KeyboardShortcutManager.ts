import { getErrorHandler } from '../utils/ErrorHandler.js';

export interface ShortcutData {
    keys: string[];
    callback: Function;
    context?: string;
    description?: string;
    enabled?: boolean;
    preventDefault?: boolean;
    stopPropagation?: boolean;
}

/**
 * キーボードショートカット管理クラス
 */
export class CoreKeyboardShortcutManager {
    private gameEngine: any;
    private shortcuts: Map<string, ShortcutData>;
    private activeKeys: Set<string>;
    private isEnabled: boolean;
    private listeners: Map<string, Set<Function>>;

    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        this.shortcuts = new Map();
        this.activeKeys = new Set();
        this.isEnabled = true;
        this.listeners = new Map();
        
        // デフォルトショートカットを設定
        this.initializeDefaultShortcuts();
        // イベントリスナーを設定
        this.setupEventListeners();
    }
    
    /**
     * デフォルトショートカットを初期化
     */
    initializeDefaultShortcuts(): void {
        this.addShortcut('pause', ['Space'], () => this.handlePause());
        this.addShortcut('menu', ['Escape'], () => this.handleMenu());
        
        // UI操作
        this.addShortcut('fullscreen', ['F11'], () => this.handleFullscreen());
        this.addShortcut('contextualHelp', ['F1'], () => this.handleContextualHelp());
        this.addShortcut('documentationHelp', ['ControlLeft+KeyH'], () => this.handleDocumentationHelp());
        
        // デバッグ操作（開発時のみ）
        this.addShortcut('debug', ['F12'], () => this.handleDebug());
        this.addShortcut('debugToggle', ['ControlLeft+ShiftLeft+KeyD'], () => this.handleDebugToggle());
        
        // ゲーム内操作（UIボタンから実行）
        // GキーとRキーのショートカットは削除されました（Issue #172）
        // Give UpとRestartはゲーム画面のUIボタンから利用可能です
        
        // 注記: 以下の機能は設定画面のUIから利用できます（Issue #170）
        // - 音声ミュート（元Mキー）
        // - 音量調整（元Ctrl+↑/↓キー）
        // - アクセシビリティ機能（元Ctrl+Alt+H/T/Mキー）
        // 
        // フルスクリーン機能はF11キーで復活しました
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners(): void {
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
        
        // フォーカス管理
        window.addEventListener('blur', () => this.handleWindowBlur());
        window.addEventListener('focus', () => this.handleWindowFocus());
    }
    
    /**
     * ショートカットを追加
     */
    addShortcut(name: string, keys: string[], callback: Function, options: any = {}): boolean {
        try {
            // 入力値を検証
            const nameValidation = getErrorHandler().validateInput(name, 'string', {
                maxLength: 50,
                pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/
            });

            if (!nameValidation.isValid) {
                throw new Error(`Invalid shortcut name: ${nameValidation.errors.join(', ')}`);
            }

            if (!Array.isArray(keys) || keys.length === 0) {
                throw new Error('Keys must be a non-empty array');
            }

            if (typeof callback !== 'function') {
                throw new Error('Callback must be a function');
            }
            
            // ショートカットを正規化
            const normalizedKeys = keys.map(keyCombo => this.normalizeKeyCombo(keyCombo));
            
            this.shortcuts.set(name, {
                keys: normalizedKeys,
                callback: callback,
                description: options.description || '',
                context: options.context || 'global',
                enabled: options.enabled !== false,
                preventDefault: options.preventDefault !== false,
                stopPropagation: options.stopPropagation !== false
            });

            console.log(`Added keyboard shortcut: ${name} (${keys.join(', ')})`);
            return true;

        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_ERROR', {
                operation: 'addShortcut',
                name: name,
                keys: keys
            });
            return false;
        }
    }
    
    /**
     * ショートカットを削除
     */
    removeShortcut(name: string): boolean {
        if (this.shortcuts.has(name)) {
            this.shortcuts.delete(name);
            console.log(`Removed keyboard shortcut: ${name}`);
            return true;
        }
        return false;
    }
    
    /**
     * ショートカットを有効/無効化
     */
    setShortcutEnabled(name: string, enabled: boolean): boolean {
        if (this.shortcuts.has(name)) {
            this.shortcuts.get(name)!.enabled = enabled;
            return true;
        }
        return false;
    }
    
    /**
     * キーコンビネーションを正規化
     */
    normalizeKeyCombo(keyCombo: string): string {
        return keyCombo.split('+').map(key => key.trim()).sort().join('+');
    }
    
    /**
     * キー押下処理
     */
    handleKeyDown(event: KeyboardEvent): void {
        if (!this.isEnabled) return;
        
        // アクティブキーを追加
        this.activeKeys.add(event.code);

        // 現在のキーコンビネーションを生成
        const currentCombo = this.getCurrentKeyCombo();

        // ショートカットをチェック
        for (const [name, shortcut] of this.shortcuts) {
            if (!shortcut.enabled) continue;
            
            // コンテキストチェック
            if (!this.isContextValid(shortcut.context)) continue;
            
            // キーマッチング
            if (shortcut.keys.some(keyCombo => keyCombo === currentCombo)) {
                try {
                    // イベントの制御
                    if (shortcut.preventDefault) {
                        event.preventDefault();
                    }
                    if (shortcut.stopPropagation) {
                        event.stopPropagation();
                    }
                    
                    // コールバック実行
                    shortcut.callback(event, name);
                    
                    // リスナーに通知
                    this.notifyShortcutTriggered(name, currentCombo);
                    
                    break; // 最初にマッチしたショートカットのみ実行
                } catch (error) {
                    getErrorHandler().handleError(error, 'KEYBOARD_ERROR', {
                        operation: 'executeShortcut',
                        shortcut: name,
                        keyCombo: currentCombo
                    });
                }
            }
        }
    }

    /**
     * キー離上処理
     */
    handleKeyUp(event: KeyboardEvent): void {
        this.activeKeys.delete(event.code);
    }
    
    /**
     * ウィンドウフォーカス喪失処理
     */
    handleWindowBlur(): void {
        this.activeKeys.clear();
    }
    
    /**
     * ウィンドウフォーカス取得処理
     */
    handleWindowFocus(): void {
        this.activeKeys.clear();
    }
    
    /**
     * 現在のキーコンビネーションを取得
     */
    getCurrentKeyCombo(): string {
        return Array.from(this.activeKeys).sort().join('+');
    }
    
    /**
     * コンテキストが有効かチェック
     */
    isContextValid(context?: string): boolean {
        switch (context) {
            case 'global':
                return true;
            case 'game':
                return this.gameEngine.sceneManager.getCurrentScene()?.constructor.name === 'GameScene';
            case 'menu':
                return this.gameEngine.sceneManager.getCurrentScene()?.constructor.name === 'MainMenuScene';
            case 'settings':
                return this.gameEngine.sceneManager.getCurrentScene()?.showingSettings === true;
            default:
                return true;
        }
    }
    
    /**
     * ショートカットトリガーを通知
     */
    notifyShortcutTriggered(name: string, keyCombo: string): void {
        if (this.listeners.has('shortcutTriggered')) {
            this.listeners.get('shortcutTriggered')!.forEach(callback => {
                try {
                    callback(name, keyCombo);
                } catch (error) {
                    getErrorHandler().handleError(error, 'KEYBOARD_ERROR', {
                        operation: 'notifyShortcutTriggered',
                        shortcut: name,
                        keyCombo: keyCombo
                    });
                }
            });
        }
    }
    
    /**
     * イベントリスナーを追加
     */
    addEventListener(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }
    
    /**
     * イベントリスナーを削除
     */
    removeEventListener(event: string, callback: Function): void {
        if (this.listeners.has(event)) {
            this.listeners.get(event)!.delete(callback);
        }
    }
    
    // ショートカットハンドラー
    
    /**
     * 一時停止処理
     */
    handlePause(): void {
        const currentScene = this.gameEngine.sceneManager.getCurrentScene();
        if (currentScene && typeof currentScene.togglePause === 'function') {
            currentScene.togglePause();
        }
    }
    
    /**
     * メニュー処理
     */
    handleMenu(): void {
        const currentScene = this.gameEngine.sceneManager.getCurrentScene();
        if (currentScene) {
            if (currentScene.constructor.name === 'GameScene') {
                // ゲーム中はメインメニューに戻る
                this.gameEngine.sceneManager.switchScene('menu');
            } else if (currentScene.showingSettings) {
                // 設定画面を閉じる
                currentScene.closeSettings?.();
            }
        }
    }
    
    /**
     * フルスクリーン切り替え処理（F11キー）
     */
    handleFullscreen(): void {
        try {
            if (this.gameEngine && this.gameEngine.responsiveCanvasManager) {
                this.gameEngine.responsiveCanvasManager.toggleFullscreen();
            } else {
                console.warn('[KeyboardShortcutManager] ResponsiveCanvasManager not available');
            }
        } catch (error) {
            console.error('[KeyboardShortcutManager] Error toggling fullscreen:', error);
        }
    }
    
    // handleMute() メソッドは削除されました（Issue #170）
    // 音声ミュート機能は設定画面のUIから利用できます
    
    /**
     * コンテキスト依存ヘルプ処理（F1キー）
     */
    handleContextualHelp(): void {
        try {
            const currentScene = this.gameEngine.sceneManager.getCurrentScene();
            const contextData = {
                accessMethod: 'keyboard_f1',
                sourceScene: currentScene?.constructor.name || 'unknown',
                contextual: true // コンテキスト依存ヘルプモード
            };

            // 統一されたHelpSceneに遷移（コンテキスト依存モード）
            const success = this.gameEngine.sceneManager.switchScene('help', contextData);

            if (!success) {
                console.warn('Contextual help navigation failed');
            }

            console.log('[KeyboardShortcutManager] Contextual help opened via F1 key');
        } catch (error) {
            console.error('[KeyboardShortcutManager] Failed to open contextual help:', error);
        }
    }
    
    /**
     * ドキュメントヘルプ処理（Ctrl+Hキー）
     */
    handleDocumentationHelp(): void {
        try {
            const currentScene = this.gameEngine.sceneManager.getCurrentScene();
            const contextData = {
                accessMethod: 'keyboard_ctrl_h',
                sourceScene: currentScene?.constructor.name || 'unknown',
                documentation: true // ドキュメントヘルプモード
            };

            // 統一されたHelpSceneに遷移（ドキュメントモード）
            const success = this.gameEngine.sceneManager.switchScene('help', contextData);

            if (!success) {
                console.warn('Documentation help navigation failed');
            }

            console.log('[KeyboardShortcutManager] Documentation help opened via Ctrl+H keys');
        } catch (error) {
            console.error('[KeyboardShortcutManager] Failed to open documentation help:', error);
        }
    }
    
    /**
     * デバッグ処理
     */
    handleDebug(): void {
        if (this.gameEngine.isDebugMode()) {
            console.log('Debug info:', {
                scene: this.gameEngine.sceneManager.getCurrentScene()?.constructor.name,
                performance: this.gameEngine.performanceStats,
                settings: this.gameEngine.settingsManager?.settings
            });
        }
    }

    /**
     * デバッグモード切り替え
     */
    handleDebugToggle(): void {
        const isDebug = localStorage.getItem('debug') === 'true';
        localStorage.setItem('debug', isDebug ? 'false' : 'true');
        console.log('Debug mode:', !isDebug ? 'enabled' : 'disabled');
        
        // 必要に応じてリロード
        if (confirm('デバッグモードを変更しました。ページを再読み込みしますか？')) {
            location.reload();
        }
    }
    
    // handleHighContrast(), handleLargeText(), handleReducedMotion() メソッドは削除されました（Issue #170）
    // これらの機能は設定画面のアクセシビリティUIから利用できます
    
    // handleGiveUp() と handleRestart() メソッドは削除されました（Issue #172）
    // これらの機能はゲーム画面のUIボタンから利用できます
    
    // handleVolumeUp() と handleVolumeDown() メソッドは削除されました（Issue #170）
    // これらの機能は設定画面の音量調整UIから利用できます
    
    /**
     * ショートカット一覧を取得
     */
    getShortcuts(): any {
        const shortcuts: any = {};
        for (const [name, shortcut] of this.shortcuts) {
            shortcuts[name] = {
                keys: shortcut.keys,
                description: shortcut.description,
                context: shortcut.context,
                enabled: shortcut.enabled
            };
        }
        return shortcuts;
    }
    
    /**
     * ヘルプテキストを生成
     */
    generateHelpText(): any {
        const shortcuts = this.getShortcuts();
        const helpSections: any = {
            'ゲーム操作': [],
            'UI操作': [],
            'アクセシビリティ': [],
            'その他': []
        };

        for (const [name, shortcut] of Object.entries(shortcuts)) {
            if (!(shortcut as any).enabled) continue;

            const keyText = (shortcut as any).keys.join(' または ');
            const description = (shortcut as any).description || name;

            if (['pause'].includes(name)) {
                helpSections['ゲーム操作'].push(`${keyText}: ${description}`);
            } else if (['menu', 'contextualHelp', 'documentationHelp'].includes(name)) {
                helpSections['UI操作'].push(`${keyText}: ${description}`);
            } else if (name.startsWith('debug')) {
                helpSections['その他'].push(`${keyText}: ${description}`);
            } else {
                helpSections['その他'].push(`${keyText}: ${description}`);
            }
        }
        
        return helpSections;
    }
    
    /**
     * 統計情報を取得
     */
    getStats(): any {
        return {
            totalShortcuts: this.shortcuts.size,
            enabledShortcuts: Array.from(this.shortcuts.values()).filter(s => s.enabled).length,
            activeKeys: this.activeKeys.size,
            isEnabled: this.isEnabled,
            contexts: [...new Set(Array.from(this.shortcuts.values()).map(s => s.context))]
        };
    }
    
    /**
     * キーボードショートカットを有効/無効化
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        console.log(`Keyboard shortcuts ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void {
        this.activeKeys.clear();
        this.listeners.clear();
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('blur', this.handleWindowBlur);
        window.removeEventListener('focus', this.handleWindowFocus);
    }
}