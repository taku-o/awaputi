/**
 * VolumeControlComponent統合例
 * SettingsSceneでの実装パターンを示します
 */

import { VolumeControlComponent } from '../VolumeControlComponent.js';

interface GameEngine {
    settingsManager?: {
        save: () => void;
    };
    keyboardShortcutManager?: {
        addShortcut: (name: string, keys: string[], handler: () => void) => void;
    };
    sceneManager?: {
        switchScene: (sceneName: string) => void;
    };
}

interface UsageStatistics {
    componentEnabled: boolean;
    currentVolume: number;
    isAtMinimum: boolean;
    isAtMaximum: boolean;
    timestamp: string;
}

/**
 * 設定画面でのVolumeControlComponent使用例
 */
export class VolumeControlIntegrationExample {
    private gameEngine: GameEngine;
    private volumeControl: VolumeControlComponent | null;
    private container: HTMLElement | null;
    
    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        this.volumeControl = null;
        this.container = null;
    }
    
    /**
     * 設定画面の初期化例
     */
    initializeSettingsScene(): boolean {
        // 設定画面のDOM構造を作成
        this.createSettingsUI();
        
        // VolumeControlComponentを初期化
        this.volumeControl = new VolumeControlComponent(this.gameEngine);
        
        // 音響設定セクションに追加
        const audioSection = document.getElementById('audio-settings-section');
        if (!audioSection) {
            console.error('Audio settings section not found');
            return false;
        }
        
        const success = this.volumeControl.initialize(audioSection);
        
        if (!success) {
            console.error('Failed to initialize volume control');
            return false;
        }
        
        console.log('Volume control initialized successfully');
        return true;
    }
    
    /**
     * 設定画面のDOM構造作成例
     */
    createSettingsUI(): void {
        this.container = document.createElement('div');
        this.container.className = 'settings-container';
        this.container.innerHTML = `
            <div class="settings-header">
                <h2>ゲーム設定</h2>
            </div>
            <div class="settings-content">
                <div class="settings-section" id="audio-settings-section">
                    <h3>🔊 音響設定</h3>
                    <!-- VolumeControlComponentがここに挿入されます -->
                </div>
                <div class="settings-section" id="display-settings-section">
                    <h3>🖥️ 表示設定</h3>
                </div>
                <div class="settings-section" id="accessibility-settings-section">
                    <h3>♿ アクセシビリティ</h3>
                </div>
            </div>
            <div class="settings-footer">
                <button id="settings-back-button">戻る</button>
                <button id="settings-reset-button">リセット</button>
                <button id="settings-apply-button">適用</button>
            </div>
        `;
        
        document.body.appendChild(this.container);
        this.setupEventListeners();
    }
    
    /**
     * イベントリスナーの設定例
     */
    setupEventListeners(): void {
        // 戻るボタン
        const backButton = document.getElementById('settings-back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.closeSettings();
            });
        }
        
        // リセットボタン
        const resetButton = document.getElementById('settings-reset-button');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetSettings();
            });
        }
        
        // 適用ボタン
        const applyButton = document.getElementById('settings-apply-button');
        if (applyButton) {
            applyButton.addEventListener('click', () => {
                this.applySettings();
            });
        }
    }
    
    /**
     * KeyboardShortcutManagerとの統合例
     */
    integrateWithKeyboardShortcuts(): void {
        if (!this.gameEngine.keyboardShortcutManager || !this.volumeControl) {
            return;
        }
        
        // 既存のキーボードショートカットをVolumeControlComponentに転送
        this.gameEngine.keyboardShortcutManager.addShortcut(
            'volumeUp', 
            ['ArrowUp+ControlLeft'], 
            () => this.volumeControl!.handleVolumeUp()
        );
        
        this.gameEngine.keyboardShortcutManager.addShortcut(
            'volumeDown', 
            ['ArrowDown+ControlLeft'], 
            () => this.volumeControl!.handleVolumeDown()
        );
        
        console.log('Volume control integrated with keyboard shortcuts');
    }
    
    /**
     * 設定リセット処理
     */
    resetSettings(): void {
        if (this.volumeControl) {
            // デフォルト音量（50%）にリセット
            this.volumeControl.setVolume(0.5);
            
            // 他の設定もリセット...
            
            console.log('Settings reset to defaults');
        }
    }
    
    /**
     * 設定適用処理
     */
    applySettings(): void {
        if (this.volumeControl) {
            const currentVolume = this.volumeControl.getCurrentVolume();
            
            // 設定を永続化
            if (this.gameEngine.settingsManager) {
                this.gameEngine.settingsManager.save();
            }
            
            console.log(`Settings applied - Volume: ${Math.round(currentVolume * 100)}%`);
        }
    }
    
    /**
     * 設定画面を閉じる
     */
    closeSettings(): void {
        if (this.volumeControl) {
            this.volumeControl.dispose();
            this.volumeControl = null;
        }
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
            this.container = null;
        }
        
        console.log('Settings scene closed');
    }
    
    /**
     * 外部から音量変更を処理する例
     */
    handleExternalVolumeChange(newVolume: number): void {
        if (this.volumeControl) {
            this.volumeControl.onVolumeChanged(newVolume);
            console.log(`External volume change: ${Math.round(newVolume * 100)}%`);
        }
    }
    
    /**
     * デバッグ情報表示例
     */
    showDebugInfo(): void {
        if (this.volumeControl) {
            const stats = this.volumeControl.getStats();
            console.table(stats);
        }
    }
    
    /**
     * アクセシビリティ機能の更新例
     */
    updateAccessibilityFeatures(): void {
        if (this.volumeControl) {
            this.volumeControl.updateAccessibility();
            console.log('Accessibility features updated');
        }
    }
    
    /**
     * 使用状況の統計取得例
     */
    getUsageStatistics(): UsageStatistics | null {
        if (!this.volumeControl) {
            return null;
        }
        
        return {
            componentEnabled: this.volumeControl.isEnabled(),
            currentVolume: this.volumeControl.getCurrentVolume(),
            isAtMinimum: this.volumeControl.getCurrentVolume() === 0,
            isAtMaximum: this.volumeControl.getCurrentVolume() === 1,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * 使用例の実行
 */
export function runVolumeControlExample(gameEngine: GameEngine): VolumeControlIntegrationExample | null {
    const example = new VolumeControlIntegrationExample(gameEngine);
    
    // 設定画面を初期化
    if (example.initializeSettingsScene()) {
        // キーボードショートカットと統合
        example.integrateWithKeyboardShortcuts();
        
        // デバッグ情報を表示
        example.showDebugInfo();
        
        return example;
    }
    
    return null;
}

/**
 * SettingsSceneでの実装パターン例
 */
export class EnhancedSettingsScene {
    private gameEngine: GameEngine;
    private volumeControl: VolumeControlComponent;
    private isInitialized: boolean;
    private settingsContainer: HTMLElement | null = null;
    
    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        this.volumeControl = new VolumeControlComponent(gameEngine);
        this.isInitialized = false;
    }
    
    /**
     * シーン初期化
     */
    initialize(): boolean {
        if (this.isInitialized) {
            return true;
        }
        
        try {
            // DOM要素を作成
            this.createSettingsInterface();
            
            // VolumeControlを初期化
            const audioSection = document.getElementById('audio-section');
            if (!audioSection) {
                throw new Error('Audio section not found');
            }
            
            if (!this.volumeControl.initialize(audioSection)) {
                throw new Error('Failed to initialize volume control');
            }
            
            // イベントリスナーを設定
            this.setupEventHandlers();
            
            this.isInitialized = true;
            return true;
            
        } catch (error) {
            console.error('Failed to initialize enhanced settings scene:', error);
            return false;
        }
    }
    
    /**
     * 設定インターフェース作成
     */
    createSettingsInterface(): void {
        const settingsHTML = `
            <div class="enhanced-settings">
                <header class="settings-header">
                    <h1>ゲーム設定</h1>
                    <button class="close-button" id="close-settings">×</button>
                </header>
                
                <main class="settings-main">
                    <section class="settings-section" id="audio-section">
                        <h2>🔊 音響設定</h2>
                        <p>ゲームの音量や音響効果を調整します。</p>
                        <!-- VolumeControlComponent will be inserted here -->
                    </section>
                    
                    <section class="settings-section" id="display-section">
                        <h2>🖥️ 表示設定</h2>
                        <!-- Other settings... -->
                    </section>
                </main>
                
                <footer class="settings-footer">
                    <button class="btn btn-secondary" id="reset-defaults">初期値に戻す</button>
                    <button class="btn btn-primary" id="save-settings">設定を保存</button>
                </footer>
            </div>
        `;
        
        const settingsContainer = document.createElement('div');
        settingsContainer.innerHTML = settingsHTML;
        document.body.appendChild(settingsContainer);
        this.settingsContainer = settingsContainer.querySelector('.enhanced-settings');
    }
    
    /**
     * イベントハンドラー設定
     */
    setupEventHandlers(): void {
        // 閉じるボタン
        const closeButton = document.getElementById('close-settings');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.close();
            });
        }
        
        // 初期値リセット
        const resetButton = document.getElementById('reset-defaults');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.volumeControl.setVolume(0.5); // デフォルト50%
            });
        }
        
        // 設定保存
        const saveButton = document.getElementById('save-settings');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveSettings();
            });
        }
        
        // ESCキーで閉じる
        document.addEventListener('keydown', this.handleKeyDown);
    }
    
    /**
     * キーボードイベントハンドラー
     */
    private handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            this.close();
        }
    }
    
    /**
     * 設定保存
     */
    saveSettings(): void {
        try {
            const currentVolume = this.volumeControl.getCurrentVolume();
            
            // 設定を保存
            if (this.gameEngine.settingsManager) {
                this.gameEngine.settingsManager.save();
            }
            
            // 保存成功のフィードバック
            this.showNotification(`設定を保存しました（音量: ${Math.round(currentVolume * 100)}%）`);
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showNotification('設定の保存に失敗しました', 'error');
        }
    }
    
    /**
     * 通知表示
     */
    showNotification(message: string, type: 'success' | 'error' = 'success'): void {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    /**
     * シーン終了
     */
    close(): void {
        if (this.volumeControl) {
            this.volumeControl.dispose();
        }
        
        // イベントリスナー削除
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // DOM要素を削除
        const settingsContainer = document.querySelector('.enhanced-settings');
        if (settingsContainer && settingsContainer.parentElement) {
            settingsContainer.parentElement.remove();
        }
        
        this.isInitialized = false;
        
        // 元のシーンに戻る
        if (this.gameEngine.sceneManager) {
            this.gameEngine.sceneManager.switchScene('menu');
        }
    }
    
    /**
     * フレーム更新（必要に応じて）
     */
    update(_deltaTime: number): void {
        // 設定画面での更新処理
        if (this.volumeControl && this.volumeControl.isEnabled()) {
            // 必要に応じてUIの更新
        }
    }
    
    /**
     * クリーンアップ
     */
    dispose(): void {
        this.close();
    }
}