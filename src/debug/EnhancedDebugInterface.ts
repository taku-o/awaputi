/**
 * Enhanced Debug Interface
 * 既存のEffectDebugInterfaceを拡張した包括的なデバッグツール統合環境
 * Main Controller Pattern適用版
 */

import { EffectDebugInterface } from '../effects/EffectDebugInterface.js';
import { ComponentErrorHandler } from './ComponentErrorHandler.js';
import { DebugPanelManager } from './interface/DebugPanelManager.js';
import { DebugCommandProcessor } from './interface/DebugCommandProcessor.js';
import { DebugVisualization } from './interface/DebugVisualization.js';
import { DebugDataExporter } from './interface/DebugDataExporter.js';

interface GameEngine {
    // Game engine interface
}

interface ErrorHandler {
    handleComponentError: (error: Error, component: string, operation: string) => any;
}

interface DebugComponent {
    initialized?: boolean;
    setErrorHandler?: (handler: ErrorHandler['handleComponentError']) => void;
    initialize?: () => Promise<void> | void;
    cleanup?: () => void;
    switchPanel?: (panelId: string) => void;
    registerShortcut?: (shortcut: string, callback: () => void, options?: any) => void;
    setTheme?: (theme: string) => void;
    exportData?: (data: any, filename: string, format?: string) => void;
    getActivePanel?: () => string;
    getPanelHistory?: () => string[];
    getRegisteredPanels?: () => any[];
    getShortcuts?: () => Map<string, any>;
    getShortcutConflicts?: () => any[];
    getCurrentTheme?: () => string | null;
    getAvailableThemes?: () => string[];
    getCurrentBreakpoint?: () => string;
    isTouchDevice?: () => boolean;
    getOrientation?: () => string;
    getIntegrationTestResults?: () => any;
    exportIntegrationTestResults?: (format?: string) => void;
    getRequirementsValidationResults?: () => any;
    exportRequirementsValidationResults?: (format?: string) => void;
    getFinalValidationResults?: () => any;
    exportFinalValidationResults?: (format?: string) => void;
    updatePanelUI?: () => void;
    applyResponsiveLayout?: () => void;
    setShortcutsEnabled?: (enabled: boolean) => void;
}

interface ComponentDefinition {
    name: string;
    class: new (debugInterface: EnhancedDebugInterface) => DebugComponent;
}

interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

interface Settings {
    theme: string;
    autoSave: boolean;
    keyboardNavigation: boolean;
    shortcuts: boolean;
    performanceMonitoring: boolean;
}

interface SessionData {
    sessionId: string;
    position?: Position;
    size?: Size;
    activePanel: string;
    settings?: Settings;
    timestamp: number;
    history?: string[];
}

interface PanelConfig {
    title?: string;
    component?: any;
    icon?: string;
    shortcut?: string;
}

export class EnhancedDebugInterface extends EffectDebugInterface {
    private components: Map<string, DebugComponent>;
    private initialized: boolean;
    private errorHandler: ErrorHandler;
    private sessionId: string;
    public activePanel: string;
    private panelHistory: string[];
    private layout: string;
    private position: Position;
    private size: Size;
    private settings: Settings;
    protected container?: HTMLElement | null;

    constructor(gameEngine: GameEngine) {
        super(gameEngine);
        // Main Controller Pattern用の設定
        this.components = new Map();
        this.initialized = false;
        this.errorHandler = ComponentErrorHandler;
        this.sessionId = this.generateSessionId();
        this.activePanel = 'console';
        this.panelHistory = [];
        this.layout = 'docked';
        this.position = { x: 10, y: 10 };
        this.size = { width: 800, height: 600 };

        this.settings = {
            theme: 'default',
            autoSave: true,
            keyboardNavigation: true,
            shortcuts: true,
            performanceMonitoring: true
        };
        this.initializeEnhancedFeatures();
    }

    private async initializeEnhancedFeatures(): Promise<void> {
        try {
            await this.initializeComponents();
            this.setupEnhancedUI();
            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleComponentError(error as Error, 'EnhancedDebugInterface', 'initialization');
        }
    }

    private async initializeComponents(): Promise<void> {
        const components: ComponentDefinition[] = [
            { name: 'panelManager', class: DebugPanelManager as any },
            { name: 'commandProcessor', class: DebugCommandProcessor as any },
            { name: 'visualizer', class: DebugVisualization as any },
            { name: 'dataExporter', class: DebugDataExporter as any }
        ];

        for (const { name, class: ComponentClass } of components) {
            try {
                const component = new ComponentClass(this);
                if (component.setErrorHandler) {
                    component.setErrorHandler(this.errorHandler.handleComponentError);
                }
                if (component.initialize) {
                    await component.initialize();
                }
                this.components.set(name, component);
            } catch (error) {
                console.error(`Failed to initialize ${name}:`, error);
                // フォールバック機能で継続
                this.components.set(name, this.createFallbackComponent(name));
            }
        }
    }

    private createFallbackComponent(name: string): DebugComponent {
        return {
            initialized: false,
            // 基本的なフォールバック実装
            switchPanel: () => {},
            registerShortcut: () => {},
            setTheme: () => {},
            exportData: () => {}
        };
    }

    private setupEnhancedUI(): void {
        if (!this.container) {
            this.createEnhancedDebugPanel();
        }
        this.setupDraggableInterface();
        this.setupResizableInterface();
        this.bindEnhancedEvents();
    }

    private createEnhancedDebugPanel(): void {
        // 基本的なコンテナを作成（EffectDebugInterfaceの拡張）
        if (this.container) {
            this.container.remove();
        }
        this.container = document.createElement('div');
        this.container.id = 'enhanced-debug-interface';
        this.container.className = 'debug-interface enhanced';
        this.container.style.cssText = `
            position: fixed;
            top: ${this.position.y}px;
            left: ${this.position.x}px;
            width: ${this.size.width}px;
            height: ${this.size.height}px;
            z-index: 10000;
            display: none;
        `;

        // 基本構造を作成
        this.container.innerHTML = `
            <div class="debug-header">
                <div class="debug-title">Enhanced Debug Interface</div>
                <div class="debug-controls">
                    <button class="debug-btn minimize-btn" title="Minimize">−</button>
                    <button class="debug-btn settings-btn" title="Settings">⚙</button>
                    <button class="debug-btn close-btn" title="Close">×</button>
                </div>
            </div>
            <div class="debug-body">
                <div class="debug-tabs"></div>
                <div class="debug-content"></div>
            </div>
            <div class="debug-footer">
                <div class="debug-status">Ready</div>
                <div class="panel-statistics"></div>
            </div>
        `;

        document.body.appendChild(this.container);
        
        // コンポーネントにコンテナを通知
        this.initializeComponentUI();
    }

    private initializeComponentUI(): void {
        // パネルマネージャーにデフォルトパネルを作成させる
        const panelManager = this.getComponent('panelManager');
        if (panelManager && panelManager.switchPanel) {
            // デフォルトパネルは既にregisterDefaultPanelsで登録済み
            panelManager.switchPanel('console');
        }
    }

    private bindEnhancedEvents(): void {
        if (!this.container) return;

        // ヘッダーボタンのイベント
        const minimizeBtn = this.container.querySelector('.minimize-btn') as HTMLButtonElement;
        const settingsBtn = this.container.querySelector('.settings-btn') as HTMLButtonElement;
        const closeBtn = this.container.querySelector('.close-btn') as HTMLButtonElement;

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.minimize());
        }
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
    }

    private setupDraggableInterface(): void {
        const header = this.container?.querySelector('.debug-header') as HTMLElement;
        if (header) {
            this.makeDraggable(header);
        }
    }

    private setupResizableInterface(): void {
        if (this.container) {
            this.makeResizable(this.container);
        }
    }

    public getComponent(name: string): DebugComponent | undefined {
        return this.components.get(name);
    }

    // === 公開API（後方互換性維持） ===

    /**
     * パネルを登録（後方互換性）
     */
    public registerPanel(id: string, config: PanelConfig): void {
        const panelManager = this.getComponent('panelManager');
        if (panelManager && panelManager.switchPanel) {
            // Assume panelManager has registerPanel method
            (panelManager as any).registerPanel(id, config);
        }
    }

    /**
     * パネルを切り替え（後方互換性）
     */
    public switchPanel(panelId: string): void {
        const panelManager = this.getComponent('panelManager');
        if (panelManager && panelManager.switchPanel) {
            panelManager.switchPanel(panelId);
            this.activePanel = panelId;
        }
    }

    /**
     * ショートカットを登録（後方互換性）
     */
    public registerShortcut(shortcut: string, callback: () => void, options: any = {}): void {
        const commandProcessor = this.getComponent('commandProcessor');
        if (commandProcessor && commandProcessor.registerShortcut) {
            commandProcessor.registerShortcut(shortcut, callback, options);
        }
    }

    /**
     * テーマを設定（後方互換性）
     */
    public setTheme(theme: string): void {
        const visualizer = this.getComponent('visualizer');
        if (visualizer && visualizer.setTheme) {
            visualizer.setTheme(theme);
            this.settings.theme = theme;
        }
    }

    /**
     * データをエクスポート（後方互換性）
     */
    public exportData(data: any, filename: string, format: string = 'json'): void {
        const dataExporter = this.getComponent('dataExporter');
        if (dataExporter && dataExporter.exportData) {
            dataExporter.exportData(data, filename, format);
        }
    }

    // === ウィンドウ操作 ===

    public show(): void {
        if (this.container) {
            this.container.style.display = 'block';
            this.saveSessionData();
        }
    }

    public hide(): void {
        if (this.container) {
            this.container.style.display = 'none';
            this.saveSessionData();
        }
    }

    public toggle(): void {
        if (this.container) {
            const isVisible = this.container.style.display !== 'none';
            if (isVisible) {
                this.hide();
            } else {
                this.show();
            }
        }
    }

    public minimize(): void {
        if (this.container) {
            this.container.classList.toggle('minimized');
            const body = this.container.querySelector('.debug-body') as HTMLElement;
            const footer = this.container.querySelector('.debug-footer') as HTMLElement;

            if (this.container.classList.contains('minimized')) {
                body.style.display = 'none';
                footer.style.display = 'none';
                this.container.style.height = '40px';
            } else {
                body.style.display = 'block';
                footer.style.display = 'block';
                this.container.style.height = `${this.size.height}px`;
            }
        }
    }

    public restore(): void {
        if (this.container && this.container.classList.contains('minimized')) {
            this.minimize(); // toggles minimized state
        }
    }

    public showSettings(): void {
        const modal = document.createElement('div');
        modal.className = 'debug-settings-modal';

        modal.innerHTML = `
            <div class="modal-content">
                <h3>Debug Interface Settings</h3>
                <div class="setting-group">
                    <label>Theme: </label>
                    <select id="theme-select">
                        <option value="default">Default</option>
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="shortcuts-enabled" ${this.settings.shortcuts ? 'checked' : ''}>
                        Enable Shortcuts
                    </label>
                </div>
                <div class="modal-actions">
                    <button id="save-settings">Save</button>
                    <button id="cancel-settings">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // イベントハンドラー
        const saveBtn = modal.querySelector('#save-settings') as HTMLButtonElement;
        const cancelBtn = modal.querySelector('#cancel-settings') as HTMLButtonElement;

        saveBtn.addEventListener('click', () => {
            const themeSelect = modal.querySelector('#theme-select') as HTMLSelectElement;
            const shortcutsCheck = modal.querySelector('#shortcuts-enabled') as HTMLInputElement;
            
            const theme = themeSelect.value;
            const shortcuts = shortcutsCheck.checked;

            this.setTheme(theme);
            this.settings.shortcuts = shortcuts;

            const commandProcessor = this.getComponent('commandProcessor');
            if (commandProcessor && commandProcessor.setShortcutsEnabled) {
                commandProcessor.setShortcutsEnabled(shortcuts);
            }

            this.saveSettings();
            modal.remove();
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
    }

    // === ドラッグ&リサイズ機能 ===

    private makeDraggable(handle: HTMLElement): void {
        if (!handle || !this.container) return;

        let isDragging = false;
        let startX: number, startY: number, startLeft: number, startTop: number;

        handle.addEventListener('mousedown', (e: MouseEvent) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            startLeft = parseInt(this.container!.style.left, 10);
            startTop = parseInt(this.container!.style.top, 10);

            handle.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e: MouseEvent) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            this.position.x = startLeft + deltaX;
            this.position.y = startTop + deltaY;
            this.container!.style.left = `${this.position.x}px`;
            this.container!.style.top = `${this.position.y}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                handle.style.cursor = 'grab';
                this.saveSessionData();
            }
        });
    }

    private makeResizable(element: HTMLElement): void {
        if (!element) return;

        const resizer = document.createElement('div');
        resizer.className = 'debug-resizer';
        resizer.style.cssText = `
            position: absolute;
            bottom: 0;
            right: 0;
            width: 20px;
            height: 20px;
            background: linear-gradient(-45deg, transparent 30%, #666 30%, #666 70%, transparent 70%);
            cursor: se-resize;
        `;

        element.appendChild(resizer);
        let isResizing = false;
        let startX: number, startY: number, startWidth: number, startHeight: number;

        resizer.addEventListener('mousedown', (e: MouseEvent) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;

            startWidth = parseInt(element.style.width, 10);
            startHeight = parseInt(element.style.height, 10);
        });

        document.addEventListener('mousemove', (e: MouseEvent) => {
            if (!isResizing) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            this.size.width = Math.max(400, startWidth + deltaX);
            this.size.height = Math.max(300, startHeight + deltaY);
            element.style.width = `${this.size.width}px`;
            element.style.height = `${this.size.height}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                this.saveSessionData();
            }
        });
    }

    // === セッション管理 ===

    private generateSessionId(): string {
        return `debug_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private saveSessionData(): void {
        try {
            const sessionData: SessionData = {
                sessionId: this.sessionId,
                position: this.position,
                size: this.size,
                activePanel: this.activePanel,
                settings: this.settings,
                timestamp: Date.now()
            };
            localStorage.setItem('debug_session', JSON.stringify(sessionData));
        } catch (error) {
            console.warn('Failed to save session data:', error);
        }
    }

    public loadSettings(): void {
        try {
            const sessionData = localStorage.getItem('debug_session');
            if (sessionData) {
                const data: SessionData = JSON.parse(sessionData);
                
                if (data.position) {
                    this.position = data.position;
                }
                if (data.size) {
                    this.size = data.size;
                }
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                }
                if (data.activePanel) {
                    this.activePanel = data.activePanel;
                }
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    public saveSettings(): void {
        this.saveSessionData();
    }

    // === API取得メソッド（後方互換性） ===

    public getActivePanel(): string {
        const panelManager = this.getComponent('panelManager');
        return panelManager?.getActivePanel ? panelManager.getActivePanel() : this.activePanel;
    }

    public getPanelHistory(): string[] {
        const panelManager = this.getComponent('panelManager');
        return panelManager?.getPanelHistory ? panelManager.getPanelHistory() : this.panelHistory;
    }

    public getSessionData(): SessionData {
        return {
            sessionId: this.sessionId,
            activePanel: this.getActivePanel(),
            history: this.getPanelHistory(),
            settings: this.settings,
            position: this.position,
            size: this.size,
            timestamp: Date.now()
        };
    }

    public getRegisteredPanels(): any[] {
        const panelManager = this.getComponent('panelManager');
        return panelManager?.getRegisteredPanels ? panelManager.getRegisteredPanels() : [];
    }

    public getShortcuts(): Map<string, any> {
        const commandProcessor = this.getComponent('commandProcessor');
        return commandProcessor?.getShortcuts ? commandProcessor.getShortcuts() : new Map();
    }

    public getShortcutConflicts(): any[] {
        const commandProcessor = this.getComponent('commandProcessor');
        return commandProcessor?.getShortcutConflicts ? commandProcessor.getShortcutConflicts() : [];
    }

    public getCurrentTheme(): string | null {
        const visualizer = this.getComponent('visualizer');
        return visualizer?.getCurrentTheme ? visualizer.getCurrentTheme() : null;
    }

    public getAvailableThemes(): string[] {
        const visualizer = this.getComponent('visualizer');
        return visualizer?.getAvailableThemes ? visualizer.getAvailableThemes() : [];
    }

    public getCurrentBreakpoint(): string {
        const visualizer = this.getComponent('visualizer');
        return visualizer?.getCurrentBreakpoint ? visualizer.getCurrentBreakpoint() : 'desktop';
    }

    public isTouchDevice(): boolean {
        const visualizer = this.getComponent('visualizer');
        return visualizer?.isTouchDevice ? visualizer.isTouchDevice() : false;
    }

    public getOrientation(): string {
        const visualizer = this.getComponent('visualizer');
        return visualizer?.getOrientation ? visualizer.getOrientation() : 'landscape';
    }

    // === テスト関連API（後方互換性） ===

    public getIntegrationTestResults(): any {
        const dataExporter = this.getComponent('dataExporter');
        return dataExporter?.getIntegrationTestResults ? dataExporter.getIntegrationTestResults() : undefined;
    }

    public exportIntegrationTestResults(format: string = 'json'): void {
        const dataExporter = this.getComponent('dataExporter');
        if (dataExporter?.exportIntegrationTestResults) {
            dataExporter.exportIntegrationTestResults(format);
        }
    }

    public getRequirementsValidationResults(): any {
        const dataExporter = this.getComponent('dataExporter');
        return dataExporter?.getRequirementsValidationResults ? dataExporter.getRequirementsValidationResults() : undefined;
    }

    public exportRequirementsValidationResults(format: string = 'json'): void {
        const dataExporter = this.getComponent('dataExporter');
        if (dataExporter?.exportRequirementsValidationResults) {
            dataExporter.exportRequirementsValidationResults(format);
        }
    }

    public getFinalValidationResults(): any {
        const dataExporter = this.getComponent('dataExporter');
        return dataExporter?.getFinalValidationResults ? dataExporter.getFinalValidationResults() : undefined;
    }

    public exportFinalValidationResults(format: string = 'json'): void {
        const dataExporter = this.getComponent('dataExporter');
        if (dataExporter?.exportFinalValidationResults) {
            dataExporter.exportFinalValidationResults(format);
        }
    }

    // === クリーンアップ ===

    public destroy(): void {
        // コンポーネントのクリーンアップ
        this.components.forEach((component) => {
            if (component.cleanup) {
                component.cleanup();
            }
        });
        this.components.clear();

        // DOM要素の削除
        if (this.container) {
            this.container.remove();
            this.container = null;
        }

        // 親クラスのクリーンアップ
        if (super.destroy) {
            super.destroy();
        }

        this.initialized = false;
    }

    // === リフレッシュ機能 ===

    public refresh(): void {
        const panelManager = this.getComponent('panelManager');
        if (panelManager?.updatePanelUI) {
            panelManager.updatePanelUI();
        }

        const visualizer = this.getComponent('visualizer');
        if (visualizer?.applyResponsiveLayout) {
            visualizer.applyResponsiveLayout();
        }

        console.log('Debug interface refreshed');
    }

    // === ステータス更新 ===

    public updateStatus(message: string): void {
        const statusElement = this.container?.querySelector('.debug-status') as HTMLElement;
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
}