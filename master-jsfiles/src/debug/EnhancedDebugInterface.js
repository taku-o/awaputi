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

export class EnhancedDebugInterface extends EffectDebugInterface {
    constructor(gameEngine) {
        super(gameEngine);
        
        // Main Controller Pattern用の設定
        this.components = new Map();
        this.initialized = false;
        this.errorHandler = ComponentErrorHandler;
        this.sessionId = this.generateSessionId();
        
        // 後方互換性のための既存フィールド
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

    async initializeEnhancedFeatures() {
        try {
            await this.initializeComponents();
            this.setupEnhancedUI();
            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleComponentError(error, 'EnhancedDebugInterface', 'initialization');
        }
    }

    async initializeComponents() {
        // コンポーネントの作成と初期化
        const components = [
            { name: 'panelManager', class: DebugPanelManager },
            { name: 'commandProcessor', class: DebugCommandProcessor },
            { name: 'visualizer', class: DebugVisualization },
            { name: 'dataExporter', class: DebugDataExporter }
        ];

        for (const { name, class: ComponentClass } of components) {
            try {
                const component = new ComponentClass(this);
                component.setErrorHandler(this.errorHandler.handleComponentError);
                await component.initialize();
                this.components.set(name, component);
            } catch (error) {
                console.error(`Failed to initialize ${name}:`, error);
                // フォールバック機能で継続
                this.components.set(name, this.createFallbackComponent(name));
            }
        }
    }

    createFallbackComponent(name) {
        return {
            initialized: false,
            // 基本的なフォールバック実装
            switchPanel: () => {},
            registerShortcut: () => {},
            setTheme: () => {},
            exportData: () => {}
        };
    }

    setupEnhancedUI() {
        if (!this.container) {
            this.createEnhancedDebugPanel();
        }
        
        this.setupDraggableInterface();
        this.setupResizableInterface();
        this.bindEnhancedEvents();
    }

    createEnhancedDebugPanel() {
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

    initializeComponentUI() {
        // パネルマネージャーにデフォルトパネルを作成させる
        const panelManager = this.getComponent('panelManager');
        if (panelManager) {
            // デフォルトパネルは既にregisterDefaultPanelsで登録済み
            panelManager.switchPanel('console');
        }
    }

    bindEnhancedEvents() {
        if (!this.container) return;

        // ヘッダーボタンのイベント
        const minimizeBtn = this.container.querySelector('.minimize-btn');
        const settingsBtn = this.container.querySelector('.settings-btn');
        const closeBtn = this.container.querySelector('.close-btn');

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

    setupDraggableInterface() {
        this.makeDraggable(this.container.querySelector('.debug-header'));
    }

    setupResizableInterface() {
        this.makeResizable(this.container);
    }

    getComponent(name) {
        return this.components.get(name);
    }

    // === 公開API（後方互換性維持） ===

    /**
     * パネルを登録（後方互換性）
     * @param {string} id - パネルID
     * @param {Object} config - パネル設定
     */
    registerPanel(id, config) {
        const panelManager = this.getComponent('panelManager');
        if (panelManager) {
            panelManager.registerPanel(id, config);
        }
    }

    /**
     * パネルを切り替え（後方互換性）
     * @param {string} panelId - パネルID
     */
    switchPanel(panelId) {
        const panelManager = this.getComponent('panelManager');
        if (panelManager) {
            panelManager.switchPanel(panelId);
            this.activePanel = panelId;
        }
    }

    /**
     * ショートカットを登録（後方互換性）
     * @param {string} shortcut - ショートカット
     * @param {Function} callback - コールバック
     * @param {Object} options - オプション
     */
    registerShortcut(shortcut, callback, options = {}) {
        const commandProcessor = this.getComponent('commandProcessor');
        if (commandProcessor) {
            commandProcessor.registerShortcut(shortcut, callback, options);
        }
    }

    /**
     * テーマを設定（後方互換性）
     * @param {string} theme - テーマ名
     */
    setTheme(theme) {
        const visualizer = this.getComponent('visualizer');
        if (visualizer) {
            visualizer.setTheme(theme);
            this.settings.theme = theme;
        }
    }

    /**
     * データをエクスポート（後方互換性）
     * @param {*} data - データ
     * @param {string} filename - ファイル名
     * @param {string} format - 形式
     */
    exportData(data, filename, format = 'json') {
        const dataExporter = this.getComponent('dataExporter');
        if (dataExporter) {
            dataExporter.exportData(data, filename, format);
        }
    }

    // === ウィンドウ操作 ===

    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.saveSessionData();
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.saveSessionData();
        }
    }

    toggle() {
        if (this.container) {
            const isVisible = this.container.style.display !== 'none';
            if (isVisible) {
                this.hide();
            } else {
                this.show();
            }
        }
    }

    minimize() {
        if (this.container) {
            this.container.classList.toggle('minimized');
            const body = this.container.querySelector('.debug-body');
            const footer = this.container.querySelector('.debug-footer');
            
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

    restore() {
        if (this.container && this.container.classList.contains('minimized')) {
            this.minimize(); // toggles minimized state
        }
    }

    showSettings() {
        // 設定モーダルの表示（簡略版）
        const modal = document.createElement('div');
        modal.className = 'debug-settings-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Debug Interface Settings</h3>
                <div class="setting-group">
                    <label>Theme:</label>
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
        modal.querySelector('#save-settings').addEventListener('click', () => {
            const theme = modal.querySelector('#theme-select').value;
            const shortcuts = modal.querySelector('#shortcuts-enabled').checked;
            
            this.setTheme(theme);
            this.settings.shortcuts = shortcuts;
            
            const commandProcessor = this.getComponent('commandProcessor');
            if (commandProcessor) {
                commandProcessor.setShortcutsEnabled(shortcuts);
            }
            
            this.saveSettings();
            modal.remove();
        });

        modal.querySelector('#cancel-settings').addEventListener('click', () => {
            modal.remove();
        });
    }

    // === ドラッグ&リサイズ機能 ===

    makeDraggable(handle) {
        if (!handle || !this.container) return;

        let isDragging = false;
        let startX, startY, startLeft, startTop;

        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(this.container.style.left, 10);
            startTop = parseInt(this.container.style.top, 10);
            
            handle.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            this.position.x = startLeft + deltaX;
            this.position.y = startTop + deltaY;
            
            this.container.style.left = `${this.position.x}px`;
            this.container.style.top = `${this.position.y}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                handle.style.cursor = 'grab';
                this.saveSessionData();
            }
        });
    }

    makeResizable(element) {
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
        let startX, startY, startWidth, startHeight;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(element.style.width, 10);
            startHeight = parseInt(element.style.height, 10);
        });

        document.addEventListener('mousemove', (e) => {
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

    generateSessionId() {
        return `debug_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    saveSessionData() {
        const sessionData = {
            sessionId: this.sessionId,
            position: this.position,
            size: this.size,
            activePanel: this.activePanel,
            settings: this.settings,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem('debug_session', JSON.stringify(sessionData));
        } catch (error) {
            console.warn('Failed to save session data:', error);
        }
    }

    loadSettings() {
        try {
            const sessionData = localStorage.getItem('debug_session');
            if (sessionData) {
                const data = JSON.parse(sessionData);
                
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

    saveSettings() {
        this.saveSessionData();
    }

    // === API取得メソッド（後方互換性） ===

    getActivePanel() {
        const panelManager = this.getComponent('panelManager');
        return panelManager ? panelManager.getActivePanel() : this.activePanel;
    }

    getPanelHistory() {
        const panelManager = this.getComponent('panelManager');
        return panelManager ? panelManager.getPanelHistory() : this.panelHistory;
    }

    getSessionData() {
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

    getRegisteredPanels() {
        const panelManager = this.getComponent('panelManager');
        return panelManager ? panelManager.getRegisteredPanels() : [];
    }

    getShortcuts() {
        const commandProcessor = this.getComponent('commandProcessor');
        return commandProcessor ? commandProcessor.getShortcuts() : new Map();
    }

    getShortcutConflicts() {
        const commandProcessor = this.getComponent('commandProcessor');
        return commandProcessor ? commandProcessor.getShortcutConflicts() : [];
    }

    getCurrentTheme() {
        const visualizer = this.getComponent('visualizer');
        return visualizer ? visualizer.getCurrentTheme() : null;
    }

    getAvailableThemes() {
        const visualizer = this.getComponent('visualizer');
        return visualizer ? visualizer.getAvailableThemes() : [];
    }

    getCurrentBreakpoint() {
        const visualizer = this.getComponent('visualizer');
        return visualizer ? visualizer.getCurrentBreakpoint() : 'desktop';
    }

    isTouchDevice() {
        const visualizer = this.getComponent('visualizer');
        return visualizer ? visualizer.isTouchDevice() : false;
    }

    getOrientation() {
        const visualizer = this.getComponent('visualizer');
        return visualizer ? visualizer.getOrientation() : 'landscape';
    }

    // === テスト関連API（後方互換性） ===

    getIntegrationTestResults() {
        const dataExporter = this.getComponent('dataExporter');
        return dataExporter ? dataExporter.getIntegrationTestResults() : null;
    }

    exportIntegrationTestResults(format = 'json') {
        const dataExporter = this.getComponent('dataExporter');
        if (dataExporter) {
            dataExporter.exportIntegrationTestResults(format);
        }
    }

    getRequirementsValidationResults() {
        const dataExporter = this.getComponent('dataExporter');
        return dataExporter ? dataExporter.getRequirementsValidationResults() : null;
    }

    exportRequirementsValidationResults(format = 'json') {
        const dataExporter = this.getComponent('dataExporter');
        if (dataExporter) {
            dataExporter.exportRequirementsValidationResults(format);
        }
    }

    getFinalValidationResults() {
        const dataExporter = this.getComponent('dataExporter');
        return dataExporter ? dataExporter.getFinalValidationResults() : null;
    }

    exportFinalValidationResults(format = 'json') {
        const dataExporter = this.getComponent('dataExporter');
        if (dataExporter) {
            dataExporter.exportFinalValidationResults(format);
        }
    }

    // === クリーンアップ ===

    destroy() {
        // コンポーネントのクリーンアップ
        for (const component of this.components.values()) {
            if (component.cleanup) {
                component.cleanup();
            }
        }
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

    refresh() {
        // パネルマネージャーのリフレッシュ
        const panelManager = this.getComponent('panelManager');
        if (panelManager) {
            panelManager.updatePanelUI();
        }

        // ビジュアライザーのリフレッシュ
        const visualizer = this.getComponent('visualizer');
        if (visualizer) {
            visualizer.applyResponsiveLayout();
        }

        console.log('Debug interface refreshed');
    }

    // === ステータス更新 ===

    updateStatus(message) {
        const statusElement = this.container?.querySelector('.debug-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
}