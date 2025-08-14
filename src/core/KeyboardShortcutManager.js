import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * キーボードショートカット管理クラス
 */
export class CoreKeyboardShortcutManager {
    constructor(gameEngine) {
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
    initializeDefaultShortcuts() {
        // ゲーム操作
        this.addShortcut('pause', ['Space'], () => this.handlePause());
        this.addShortcut('menu', ['Escape'], () => this.handleMenu());
        this.addShortcut('fullscreen', ['KeyF'], () => this.handleFullscreen());
        this.addShortcut('mute', ['KeyM'], () => this.handleMute());
        
        // UI操作
        this.addShortcut('contextualHelp', ['F1'], () => this.handleContextualHelp());
        this.addShortcut('documentationHelp', ['ControlLeft+KeyH'], () => this.handleDocumentationHelp());
        
        // デバッグ操作（開発時のみ）
        this.addShortcut('debug', ['F12'], () => this.handleDebug());
        this.addShortcut('debugToggle', ['ControlLeft+ShiftLeft+KeyD'], () => this.handleDebugToggle());
        
        // アクセシビリティ
        this.addShortcut('highContrast', ['ControlLeft+AltLeft+KeyH'], () => this.handleHighContrast());
        this.addShortcut('largeText', ['ControlLeft+AltLeft+KeyT'], () => this.handleLargeText());
        this.addShortcut('reducedMotion', ['ControlLeft+AltLeft+KeyM'], () => this.handleReducedMotion());
        
        // ゲーム内操作（UIボタンから実行）
        // GキーとRキーのショートカットは削除されました（Issue #172）
        // Give UpとRestartはゲーム画面のUIボタンから利用可能です
        
        // 音量調整
        this.addShortcut('volumeUp', ['ArrowUp+ControlLeft'], () => this.handleVolumeUp());
        this.addShortcut('volumeDown', ['ArrowDown+ControlLeft'], () => this.handleVolumeDown());
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
        
        // フォーカス管理
        window.addEventListener('blur', () => this.handleWindowBlur());
        window.addEventListener('focus', () => this.handleWindowFocus());
    }
    
    /**
     * ショートカットを追加
     */
    addShortcut(name, keys, callback, options = {}) {
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
    removeShortcut(name) {
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
    setShortcutEnabled(name, enabled) {
        if (this.shortcuts.has(name)) {
            this.shortcuts.get(name).enabled = enabled;
            return true;
        }
        return false;
    }
    
    /**
     * キーコンビネーションを正規化
     */
    normalizeKeyCombo(keyCombo) {
        return keyCombo.split('+').map(key => key.trim()).sort().join('+');
    }
    
    /**
     * キー押下処理
     */
    handleKeyDown(event) {
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
    handleKeyUp(event) {
        this.activeKeys.delete(event.code);
    }
    
    /**
     * ウィンドウフォーカス喪失処理
     */
    handleWindowBlur() {
        this.activeKeys.clear();
    }
    
    /**
     * ウィンドウフォーカス取得処理
     */
    handleWindowFocus() {
        this.activeKeys.clear();
    }
    
    /**
     * 現在のキーコンビネーションを取得
     */
    getCurrentKeyCombo() {
        return Array.from(this.activeKeys).sort().join('+');
    }
    
    /**
     * コンテキストが有効かチェック
     */
    isContextValid(context) {
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
    notifyShortcutTriggered(name, keyCombo) {
        if (this.listeners.has('shortcutTriggered')) {
            this.listeners.get('shortcutTriggered').forEach(callback => {
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
    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }
    
    /**
     * イベントリスナーを削除
     */
    removeEventListener(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }
    
    // ショートカットハンドラー
    
    /**
     * 一時停止処理
     */
    handlePause() {
        const currentScene = this.gameEngine.sceneManager.getCurrentScene();
        if (currentScene && typeof currentScene.togglePause === 'function') {
            currentScene.togglePause();
        }
    }
    
    /**
     * メニュー処理
     */
    handleMenu() {
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
     * フルスクリーン処理
     */
    handleFullscreen() {
        if (this.gameEngine.responsiveCanvasManager) {
            this.gameEngine.responsiveCanvasManager.toggleFullscreen();
        }
    }
    
    /**
     * ミュート処理
     */
    handleMute() {
        if (this.gameEngine.audioManager) {
            const isMuted = this.gameEngine.audioManager.toggleMute();
            
            // 設定に反映
            if (this.gameEngine.settingsManager) {
                this.gameEngine.settingsManager.set('isMuted', isMuted);
            }
            
            console.log(`Audio ${isMuted ? 'muted' : 'unmuted'}`);
        }
    }
    
    
    
    /**
     * コンテキスト依存ヘルプ処理（F1キー）
     */
    handleContextualHelp() {
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
    handleDocumentationHelp() {
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
    handleDebug() {
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
    handleDebugToggle() {
        const isDebug = localStorage.getItem('debug') === 'true';
        localStorage.setItem('debug', isDebug ? 'false' : 'true');
        console.log('Debug mode:', !isDebug ? 'enabled' : 'disabled');
        
        // 必要に応じてリロード
        if (confirm('デバッグモードを変更しました。ページを再読み込みしますか？')) {
            location.reload();
        }
    }
    
    /**
     * ハイコントラスト切り替え
     */
    handleHighContrast() {
        if (this.gameEngine.settingsManager) {
            const current = this.gameEngine.settingsManager.get('accessibility.highContrast');
            this.gameEngine.settingsManager.set('accessibility.highContrast', !current);
        }
    }
    
    /**
     * 大きなテキスト切り替え
     */
    handleLargeText() {
        if (this.gameEngine.settingsManager) {
            const current = this.gameEngine.settingsManager.get('accessibility.largeText');
            this.gameEngine.settingsManager.set('accessibility.largeText', !current);
        }
    }
    
    /**
     * モーション軽減切り替え
     */
    handleReducedMotion() {
        if (this.gameEngine.settingsManager) {
            const current = this.gameEngine.settingsManager.get('accessibility.reducedMotion');
            this.gameEngine.settingsManager.set('accessibility.reducedMotion', !current);
        }
    }
    
    // handleGiveUp() と handleRestart() メソッドは削除されました（Issue #172）
    // これらの機能はゲーム画面のUIボタンから利用できます
    
    /**
     * 音量アップ処理
     */
    handleVolumeUp() {
        if (this.gameEngine.settingsManager) {
            const current = this.gameEngine.settingsManager.get('masterVolume');
            const newVolume = Math.min(1, current + 0.1);
            this.gameEngine.settingsManager.set('masterVolume', newVolume);
            console.log(`Volume: ${Math.round(newVolume * 100)}%`);
        }
    }
    
    /**
     * 音量ダウン処理
     */
    handleVolumeDown() {
        if (this.gameEngine.settingsManager) {
            const current = this.gameEngine.settingsManager.get('masterVolume');
            const newVolume = Math.max(0, current - 0.1);
            this.gameEngine.settingsManager.set('masterVolume', newVolume);
            console.log(`Volume: ${Math.round(newVolume * 100)}%`);
        }
    }
    
    /**
     * ショートカット一覧を取得
     */
    getShortcuts() {
        const shortcuts = {};
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
    generateHelpText() {
        const shortcuts = this.getShortcuts();
        const helpSections = {
            'ゲーム操作': [],
            'UI操作': [],
            'アクセシビリティ': [],
            'その他': []
        };
        
        for (const [name, shortcut] of Object.entries(shortcuts)) {
            if (!shortcut.enabled) continue;
            
            const keyText = shortcut.keys.join(' または ');
            const description = shortcut.description || name;
            
            if (['pause', 'giveUp', 'restart'].includes(name)) {
                helpSections['ゲーム操作'].push(`${keyText}: ${description}`);
            } else if (['menu', 'fullscreen'].includes(name)) {
                helpSections['UI操作'].push(`${keyText}: ${description}`);
            } else if (name.startsWith('accessibility') || ['highContrast', 'largeText', 'reducedMotion'].includes(name)) {
                helpSections['アクセシビリティ'].push(`${keyText}: ${description}`);
            } else {
                helpSections['その他'].push(`${keyText}: ${description}`);
            }
        }
        
        return helpSections;
    }
    
    /**
     * 統計情報を取得
     */
    getStats() {
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
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`Keyboard shortcuts ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.activeKeys.clear();
        this.listeners.clear();
        
        // イベントリスナーを削除
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('blur', this.handleWindowBlur);
        window.removeEventListener('focus', this.handleWindowFocus);
    }
}