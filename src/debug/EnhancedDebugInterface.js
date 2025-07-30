/**
 * Enhanced Debug Interface
 * 既存のEffectDebugInterfaceを拡張した包括的なデバッグツール統合環境
 */

import { EffectDebugInterface } from '../effects/EffectDebugInterface.js';
import { PanelManager } from './PanelManager.js';
import { KeyboardShortcutManager } from './KeyboardShortcutManager.js';
import { ResponsiveDebugLayout } from './ResponsiveDebugLayout.js';
import { ThemeManager } from './ThemeManager.js';
import { AccessibilityManager } from './AccessibilityManager.js';

export class EnhancedDebugInterface extends EffectDebugInterface {
    constructor(gameEngine) {
        super(gameEngine);
        
        // パネル管理システム
        this.panelManager = new PanelManager(this);
        this.panels = new Map(); // 後方互換性のため保持
        this.activePanel = 'overview';
        this.panelHistory = [];
        
        // レイアウト管理
        this.layout = 'docked'; // 'docked', 'floating', 'fullscreen'
        this.position = { x: 10, y: 10 };
        this.size = { width: 400, height: 600 };
        
        // キーボードショートカット管理システム
        this.keyboardShortcutManager = new KeyboardShortcutManager(this);
        this.shortcuts = new Map(); // 後方互換性のため保持
        this.shortcutConflicts = new Map(); // 後方互換性のため保持
        
        // デバッグセッション管理
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();
        this.sessionData = {
            commands: [],
            errors: [],
            metrics: [],
            panels: []
        };
        
        // 設定管理
        this.settings = {
            autoSave: true,
            theme: 'dark',
            fontSize: 12,
            updateInterval: 100,
            maxHistorySize: 1000
        };
        
        // レスポンシブレイアウト管理
        this.responsiveLayout = null;
        
        // テーマ管理
        this.themeManager = null;
        
        // アクセシビリティ管理
        this.accessibilityManager = null;
        
        this.initializeEnhancedFeatures();
    }

    initializeEnhancedFeatures() {
        this.setupEnhancedUI();
        this.registerDefaultPanels();
        this.setupDefaultShortcuts();
        this.loadSettings();
        this.initializeResponsiveLayout();
        this.initializeThemeManager();
        this.initializeAccessibilityManager();
    }

    initializeResponsiveLayout() {
        // ResponsiveDebugLayoutを初期化
        this.responsiveLayout = new ResponsiveDebugLayout(this);
        console.log('Responsive debug layout initialized');
    }

    initializeThemeManager() {
        // ThemeManagerを初期化
        this.themeManager = new ThemeManager(this);
        console.log('Theme manager initialized');
    }

    initializeAccessibilityManager() {
        // AccessibilityManagerを初期化
        this.accessibilityManager = new AccessibilityManager(this);
        console.log('Accessibility manager initialized');
    }

    setupEnhancedUI() {
        // 既存のデバッグパネルを拡張
        if (this.debugPanel) {
            this.debugPanel.remove();
        }
        
        this.createEnhancedDebugPanel();
        this.setupDraggableInterface();
        this.setupResizableInterface();
    }

    createEnhancedDebugPanel() {
        this.debugPanel = document.createElement('div');
        this.debugPanel.id = 'enhanced-debug-panel';
        this.debugPanel.className = 'enhanced-debug-interface';
        this.debugPanel.style.cssText = `
            position: fixed;
            top: ${this.position.y}px;
            right: ${this.position.x}px;
            width: ${this.size.width}px;
            height: ${this.size.height}px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            border: 2px solid #333;
            border-radius: 8px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: ${this.settings.fontSize}px;
            z-index: 10000;
            display: none;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
        `;

        this.debugPanel.innerHTML = `
            <div class="debug-header" style="
                background: linear-gradient(90deg, #1e3c72, #2a5298);
                padding: 8px 15px;
                border-bottom: 1px solid #444;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: move;
                user-select: none;
            ">
                <div class="debug-title">
                    <h3 style="margin: 0; color: #00ff00; font-size: 14px;">Enhanced Debug Interface</h3>
                    <span style="font-size: 10px; color: #888;">Session: ${this.sessionId.substring(0, 8)}</span>
                </div>
                <div class="debug-controls">
                    <button id="debug-minimize" style="background: #555; border: none; color: white; padding: 2px 8px; margin-right: 5px; border-radius: 3px;">−</button>
                    <button id="debug-settings" style="background: #555; border: none; color: white; padding: 2px 8px; margin-right: 5px; border-radius: 3px;">⚙</button>
                    <button id="debug-close" style="background: #d32f2f; border: none; color: white; padding: 2px 8px; border-radius: 3px;">×</button>
                </div>
            </div>

            <div class="debug-tabs" style="
                background: #2d2d2d;
                padding: 5px;
                border-bottom: 1px solid #444;
                display: flex;
                gap: 2px;
                overflow-x: auto;
            ">
                <button class="debug-tab active" data-panel="overview">Overview</button>
                <button class="debug-tab" data-panel="performance">Performance</button>
                <button class="debug-tab" data-panel="console">Console</button>
                <button class="debug-tab" data-panel="errors">Errors</button>
                <button class="debug-tab" data-panel="tests">Tests</button>
                <button class="debug-tab" data-panel="effects">Effects</button>
            </div>

            <div class="debug-content" style="
                height: calc(100% - 80px);
                overflow-y: auto;
                padding: 10px;
            ">
                <div id="panel-overview" class="debug-panel active">
                    <div class="panel-loading">Loading Overview Panel...</div>
                </div>
                <div id="panel-performance" class="debug-panel">
                    <div class="panel-loading">Loading Performance Panel...</div>
                </div>
                <div id="panel-console" class="debug-panel">
                    <div class="panel-loading">Loading Console Panel...</div>
                </div>
                <div id="panel-errors" class="debug-panel">
                    <div class="panel-loading">Loading Errors Panel...</div>
                </div>
                <div id="panel-tests" class="debug-panel">
                    <div class="panel-loading">Loading Tests Panel...</div>
                </div>
                <div id="panel-effects" class="debug-panel">
                    <div class="panel-loading">Loading Effects Panel...</div>
                </div>
            </div>

            <div class="debug-status" style="
                background: #1a1a1a;
                padding: 4px 10px;
                border-top: 1px solid #444;
                font-size: 10px;
                color: #888;
                display: flex;
                justify-content: space-between;
            ">
                <span id="debug-status-text">Ready</span>
                <span id="debug-fps-mini">FPS: --</span>
            </div>
        `;

        // CSS スタイルの追加
        this.addDebugStyles();
        this.addResponsiveStyles();
        
        document.body.appendChild(this.debugPanel);
        this.bindEnhancedEvents();
    }

    addDebugStyles() {
        if (document.getElementById('enhanced-debug-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'enhanced-debug-styles';
        style.textContent = `
            .debug-tab {
                background: #404040;
                border: none;
                color: #ccc;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 11px;
                white-space: nowrap;
                transition: all 0.2s;
            }
            .debug-tab:hover {
                background: #505050;
                color: white;
            }
            .debug-tab.active {
                background: #0066cc;
                color: white;
            }
            .debug-panel {
                display: none;
                height: 100%;
            }
            .debug-panel.active {
                display: block;
            }
            .panel-loading {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 200px;
                color: #888;
                font-style: italic;
            }
            .enhanced-debug-panel .debug-content::-webkit-scrollbar {
                width: 8px;
            }
            .enhanced-debug-panel .debug-content::-webkit-scrollbar-track {
                background: #2d2d2d;
            }
            .enhanced-debug-panel .debug-content::-webkit-scrollbar-thumb {
                background: #555;
                border-radius: 4px;
            }
            .enhanced-debug-panel .debug-content::-webkit-scrollbar-thumb:hover {
                background: #777;
            }
        `;
        document.head.appendChild(style);
    }

    addResponsiveStyles() {
        if (document.getElementById('responsive-debug-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'responsive-debug-styles';
        style.textContent = `
            /* Mobile Layout */
            .enhanced-debug-interface.layout-mobile {
                font-size: 16px;
            }
            
            .enhanced-debug-interface.layout-mobile .mobile-tab-nav {
                position: sticky;
                top: 0;
                background: rgba(0, 0, 0, 0.9);
                z-index: 1000;
                margin: -10px -10px 10px -10px;
                padding: 10px;
            }
            
            .enhanced-debug-interface.layout-mobile .tab-buttons {
                display: flex;
                gap: 5px;
                overflow-x: auto;
            }
            
            .enhanced-debug-interface.layout-mobile .tab-btn {
                flex: 1;
                min-width: 60px;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .enhanced-debug-interface.layout-mobile .tab-btn.active {
                background: rgba(0, 255, 0, 0.3);
                border-color: rgba(0, 255, 0, 0.5);
            }
            
            /* Touch Optimizations */
            .enhanced-debug-interface.touch-optimized button,
            .enhanced-debug-interface.touch-optimized input,
            .enhanced-debug-interface.touch-optimized select {
                min-height: 44px;
                padding: 8px 16px;
            }
            
            /* Tablet Layout */
            .enhanced-debug-interface.layout-tablet {
                font-size: 14px;
            }
            
            /* Desktop Layout */ 
            .enhanced-debug-interface.layout-desktop {
                font-size: 12px;
            }
            
            /* Large Layout */
            .enhanced-debug-interface.layout-large {
                font-size: 12px;
            }
            
            /* Orientation Classes */
            .enhanced-debug-interface.orientation-portrait {
                /* Portrait-specific styles */
            }
            
            .enhanced-debug-interface.orientation-landscape {
                /* Landscape-specific styles */
            }
            
            /* Responsive Debug Tab Styles */
            @media (max-width: 480px) {
                .enhanced-debug-interface .debug-tabs {
                    flex-wrap: wrap;
                }
                
                .enhanced-debug-interface .debug-tab {
                    font-size: 12px;
                    padding: 6px 8px;
                }
            }
            
            @media (max-width: 768px) {
                .enhanced-debug-interface {
                    font-size: 13px;
                }
                
                .enhanced-debug-interface .debug-header h3 {
                    font-size: 12px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    bindEnhancedEvents() {
        // 基本コントロール
        document.getElementById('debug-close').addEventListener('click', () => this.hide());
        document.getElementById('debug-minimize').addEventListener('click', () => this.minimize());
        document.getElementById('debug-settings').addEventListener('click', () => this.showSettings());

        // タブ切り替え
        document.querySelectorAll('.debug-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchPanel(e.target.dataset.panel);
            });
        });

        // ドラッグ可能なヘッダー
        const header = this.debugPanel.querySelector('.debug-header');
        this.makeDraggable(header);
        
        // パネル固有のイベント処理は各パネルクラスで実装
    }

    registerPanel(name, panelClass, config = {}) {
        // PanelManagerに委譲
        const result = this.panelManager.registerPanel(name, panelClass, config);
        
        // 後方互換性のため、古いpanelsマップも更新
        if (result) {
            const panelInfo = this.panelManager.getPanelInfo(name);
            if (panelInfo && panelInfo.instance) {
                this.panels.set(name, panelInfo.instance);
            }
        }
        
        return result;
    }

    addPanelTab(name, displayName) {
        const tabsContainer = this.debugPanel.querySelector('.debug-tabs');
        const newTab = document.createElement('button');
        newTab.className = 'debug-tab';
        newTab.dataset.panel = name;
        newTab.textContent = displayName;
        newTab.addEventListener('click', () => this.switchPanel(name));
        tabsContainer.appendChild(newTab);
    }

    addPanelContent(name) {
        const contentContainer = this.debugPanel.querySelector('.debug-content');
        const newPanel = document.createElement('div');
        newPanel.id = `panel-${name}`;
        newPanel.className = 'debug-panel';
        newPanel.innerHTML = '<div class="panel-loading">Loading...</div>';
        contentContainer.appendChild(newPanel);
    }

    switchPanel(panelName) {
        if (!this.panels.has(panelName) && !['overview', 'performance', 'console', 'errors', 'tests', 'effects'].includes(panelName)) {
            console.warn(`Panel '${panelName}' not found`);
            return;
        }

        // 履歴に追加
        if (this.activePanel !== panelName) {
            this.panelHistory.push(this.activePanel);
            if (this.panelHistory.length > 10) {
                this.panelHistory.shift();
            }
        }

        // アクティブパネルの変更
        this.activePanel = panelName;

        // UI更新
        this.updatePanelUI(panelName);
        
        // パネルのアクティベート
        this.activatePanel(panelName);

        // セッションデータに記録
        this.sessionData.panels.push({
            panel: panelName,
            timestamp: Date.now(),
            duration: Date.now() - this.sessionStartTime
        });

        // アクセシビリティ管理に通知
        if (this.accessibilityManager) {
            this.accessibilityManager.onPanelSwitch(panelName);
        }

        this.updateStatus(`Switched to ${panelName} panel`);
    }

    updatePanelUI(panelName) {
        // タブの更新
        document.querySelectorAll('.debug-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.panel === panelName) {
                tab.classList.add('active');
            }
        });

        // パネルの更新
        document.querySelectorAll('.debug-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(`panel-${panelName}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }

    activatePanel(panelName) {
        // PanelManagerのshowPanelを使用
        this.panelManager.showPanel(panelName);
        
        // 後方互換性
        const panel = this.panels.get(panelName);
        if (panel && typeof panel.activate === 'function') {
            panel.activate();
        }
    }

    registerDefaultPanels() {
        // デフォルトパネルのimportと登録
        Promise.all([
            import('./panels/OverviewPanel.js'),
            import('./panels/PerformancePanel.js'),
            import('./panels/ConsolePanel.js'),
            import('./panels/ErrorPanel.js'),
            import('./panels/TestPanel.js')
        ]).then(([
            { OverviewPanel },
            { PerformancePanel },
            { ConsolePanel },
            { ErrorPanel },
            { TestPanel }
        ]) => {
            // パネルを登録
            this.registerPanel('overview', OverviewPanel);
            this.registerPanel('performance', PerformancePanel);
            this.registerPanel('console', ConsolePanel);
            this.registerPanel('error', ErrorPanel);
            this.registerPanel('test', TestPanel);
            
            // デフォルトで概要パネルを表示
            this.switchPanel('overview');
            
            console.log('Default debug panels registered successfully');
        }).catch(error => {
            console.error('Failed to load debug panels:', error);
        });
    }

    setupDefaultShortcuts() {
        // KeyboardShortcutManagerがデフォルトショートカットを処理
        // 追加のカスタムショートカットがあればここで登録
    }

    registerShortcut(shortcut, callback, description = '') {
        // KeyboardShortcutManagerに委譲
        const result = this.keyboardShortcutManager.register(shortcut, callback, {
            description,
            group: 'custom'
        });
        
        // 後方互換性のため古いマップも更新
        if (result) {
            const normalizedShortcut = this.normalizeShortcut(shortcut);
            this.shortcuts.set(normalizedShortcut, { callback, description });
        }
        
        return result;
    }

    normalizeShortcut(shortcut) {
        return shortcut.toLowerCase().replace(/\s+/g, '');
    }

    handleKeyboardEvent(event) {
        // KeyboardShortcutManagerに委譲
        return this.keyboardShortcutManager.execute(event);
    }

    buildShortcutString(event) {
        const parts = [];
        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        if (event.metaKey) parts.push('meta');
        
        const key = event.key.toLowerCase();
        if (key !== 'control' && key !== 'alt' && key !== 'shift' && key !== 'meta') {
            parts.push(key);
        }
        
        return parts.join('+');
    }

    makeDraggable(element) {
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragOffset.x = e.clientX - this.debugPanel.offsetLeft;
            dragOffset.y = e.clientY - this.debugPanel.offsetTop;
            element.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            
            this.debugPanel.style.left = `${Math.max(0, newX)}px`;
            this.debugPanel.style.top = `${Math.max(0, newY)}px`;
            this.debugPanel.style.right = 'auto';
            
            this.position.x = newX;
            this.position.y = newY;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'move';
                this.saveSettings();
            }
        });
    }

    setupDraggableInterface() {
        // ドラッグ機能は createEnhancedDebugPanel で実装済み
    }

    setupResizableInterface() {
        // リサイズハンドルの追加
        const resizeHandle = document.createElement('div');
        resizeHandle.style.cssText = `
            position: absolute;
            bottom: 0;
            right: 0;
            width: 15px;
            height: 15px;
            background: linear-gradient(-45deg, transparent 40%, #666 40%, #666 60%, transparent 60%);
            cursor: se-resize;
        `;
        
        this.debugPanel.appendChild(resizeHandle);
        this.makeResizable(resizeHandle);
    }

    makeResizable(handle) {
        let isResizing = false;
        
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const rect = this.debugPanel.getBoundingClientRect();
            const newWidth = Math.max(300, e.clientX - rect.left);
            const newHeight = Math.max(200, e.clientY - rect.top);
            
            this.debugPanel.style.width = `${newWidth}px`;
            this.debugPanel.style.height = `${newHeight}px`;
            
            this.size.width = newWidth;
            this.size.height = newHeight;
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                this.saveSettings();
            }
        });
    }

    minimize() {
        if (this.debugPanel.classList.contains('minimized')) {
            this.restore();
        } else {
            this.debugPanel.classList.add('minimized');
            this.debugPanel.style.height = '40px';
            this.debugPanel.querySelector('.debug-content').style.display = 'none';
            this.debugPanel.querySelector('.debug-tabs').style.display = 'none';
            document.getElementById('debug-minimize').textContent = '+';
        }
    }

    restore() {
        this.debugPanel.classList.remove('minimized');
        this.debugPanel.style.height = `${this.size.height}px`;
        this.debugPanel.querySelector('.debug-content').style.display = 'block';
        this.debugPanel.querySelector('.debug-tabs').style.display = 'flex';
        document.getElementById('debug-minimize').textContent = '−';
    }

    showSettings() {
        this.createSettingsModal();
    }

    createSettingsModal() {
        // 既存のモーダルがあれば削除
        const existingModal = document.getElementById('debug-settings-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'debug-settings-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: var(--debug-bg, rgba(0, 0, 0, 0.9));
            color: var(--debug-text, white);
            border: 2px solid var(--debug-border, #333);
            border-radius: 8px;
            padding: 20px;
            width: 400px;
            max-width: 90vw;
            max-height: 80vh;
            overflow-y: auto;
        `;

        const availableThemes = this.themeManager.getAvailableThemes();
        const currentTheme = this.themeManager.getCurrentTheme();
        const accessibilityInfo = this.accessibilityManager.getAccessibilityInfo();

        dialog.innerHTML = `
            <h3 style="margin-top: 0;">Debug Interface Settings</h3>
            
            <div style="margin-bottom: 20px;">
                <h4>Theme</h4>
                <select id="theme-selector" style="width: 100%; padding: 5px;">
                    ${availableThemes.map(theme => 
                        `<option value="${theme.key}" ${theme.key === currentTheme ? 'selected' : ''}>${theme.name}</option>`
                    ).join('')}
                </select>
            </div>

            <div style="margin-bottom: 20px;">
                <h4>Accessibility</h4>
                <label style="display: block; margin-bottom: 10px;">
                    <input type="checkbox" id="keyboard-nav" ${accessibilityInfo.keyboardNavigationEnabled ? 'checked' : ''}> 
                    Enable keyboard navigation
                </label>
                <div style="font-size: 12px; color: var(--debug-text-muted, #888);">
                    Screen reader detected: ${accessibilityInfo.screenReaderDetected ? 'Yes' : 'No'}
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <h4>Layout</h4>
                <div style="font-size: 12px; color: var(--debug-text-muted, #888);">
                    Current breakpoint: ${this.getCurrentBreakpoint()}<br>
                    Touch device: ${this.isTouchDevice() ? 'Yes' : 'No'}<br>
                    Orientation: ${this.getOrientation()}
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <h4>Session Info</h4>
                <div style="font-size: 12px; color: var(--debug-text-muted, #888);">
                    Session ID: ${this.sessionId}<br>
                    Uptime: ${Math.floor((Date.now() - this.sessionStartTime) / 1000)}s<br>
                    Active panel: ${this.activePanel}
                </div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="settings-apply" style="background: var(--debug-accent, #0066cc); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Apply</button>
                <button id="settings-cancel" style="background: var(--debug-panel, #333); color: var(--debug-text, white); border: 1px solid var(--debug-border, #555); padding: 8px 16px; border-radius: 4px; cursor: pointer;">Cancel</button>
            </div>
        `;

        modal.appendChild(dialog);
        document.body.appendChild(modal);

        // イベントバインド
        document.getElementById('theme-selector').addEventListener('change', (e) => {
            this.themeManager.setTheme(e.target.value);
        });

        document.getElementById('keyboard-nav').addEventListener('change', (e) => {
            this.accessibilityManager.setKeyboardNavigationEnabled(e.target.checked);
        });

        document.getElementById('settings-apply').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        document.getElementById('settings-cancel').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        // ESCキーで閉じる
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSettingsModal();
            }
        });

        // モーダル外クリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeSettingsModal();
            }
        });

        // フォーカス管理
        const firstFocusable = dialog.querySelector('select, input, button');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    closeSettingsModal() {
        const modal = document.getElementById('debug-settings-modal');
        if (modal) {
            modal.remove();
        }
    }

    updateStatus(message) {
        const statusElement = document.getElementById('debug-status-text');
        if (statusElement) {
            statusElement.textContent = message;
            setTimeout(() => {
                statusElement.textContent = 'Ready';
            }, 3000);
        }
    }

    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveSettings() {
        if (!this.settings.autoSave) return;
        
        const settings = {
            ...this.settings,
            position: this.position,
            size: this.size,
            layout: this.layout,
            activePanel: this.activePanel
        };
        
        localStorage.setItem('enhanced-debug-settings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('enhanced-debug-settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.settings = { ...this.settings, ...settings };
                this.position = settings.position || this.position;
                this.size = settings.size || this.size;
                this.layout = settings.layout || this.layout;
                this.activePanel = settings.activePanel || this.activePanel;
            } catch (error) {
                console.warn('Failed to load debug settings:', error);
            }
        }
    }

    // 既存のメソッドをオーバーライド
    show() {
        super.show();
        this.updateStatus('Debug interface activated');
        
        // キーボードイベントリスナーの追加
        document.addEventListener('keydown', this.handleKeyboardEvent.bind(this));
    }

    hide() {
        super.hide();
        
        // キーボードイベントリスナーの削除
        document.removeEventListener('keydown', this.handleKeyboardEvent.bind(this));
    }

    destroy() {
        // セッションデータの保存
        if (this.settings.autoSave) {
            this.saveSessionData();
        }
        
        // PanelManagerの破棄
        if (this.panelManager) {
            this.panelManager.destroy();
        }
        
        // KeyboardShortcutManagerの破棄
        if (this.keyboardShortcutManager) {
            this.keyboardShortcutManager.destroy();
        }
        
        // ResponsiveDebugLayoutの破棄
        if (this.responsiveLayout) {
            this.responsiveLayout.destroy();
        }
        
        // ThemeManagerの破棄
        if (this.themeManager) {
            this.themeManager.destroy();
        }
        
        // AccessibilityManagerの破棄
        if (this.accessibilityManager) {
            this.accessibilityManager.destroy();
        }
        
        // パネルの破棄（後方互換性）
        for (const [name, panel] of this.panels) {
            if (typeof panel.destroy === 'function') {
                panel.destroy();
            }
        }
        
        // スタイルの削除
        const styles = document.getElementById('enhanced-debug-styles');
        if (styles) {
            styles.remove();
        }
        
        super.destroy();
    }

    saveSessionData() {
        const sessionData = {
            ...this.sessionData,
            sessionId: this.sessionId,
            startTime: this.sessionStartTime,
            endTime: Date.now(),
            duration: Date.now() - this.sessionStartTime
        };
        
        localStorage.setItem('enhanced-debug-session', JSON.stringify(sessionData));
    }

    // パブリックAPI
    getActivePanel() {
        return this.activePanel;
    }

    getPanelHistory() {
        return [...this.panelHistory];
    }

    getSessionData() {
        return {
            ...this.sessionData,
            sessionId: this.sessionId,
            startTime: this.sessionStartTime,
            currentTime: Date.now(),
            duration: Date.now() - this.sessionStartTime
        };
    }

    getRegisteredPanels() {
        return Array.from(this.panels.keys());
    }

    getShortcuts() {
        // KeyboardShortcutManagerから取得（後方互換性も保持）
        return this.keyboardShortcutManager.getAllShortcuts();
    }

    getShortcutConflicts() {
        // KeyboardShortcutManagerから取得（後方互換性も保持）
        return this.keyboardShortcutManager.getConflicts();
    }

    // PanelManager API の公開
    getPanelManager() {
        return this.panelManager;
    }

    getPanelInfo(name) {
        return this.panelManager.getPanelInfo(name);
    }

    getAllPanels() {
        return this.panelManager.getAllPanels();
    }

    getVisiblePanels() {
        return this.panelManager.getVisiblePanels();
    }

    getPanelStatistics() {
        return this.panelManager.getPanelStatistics();
    }

    addLifecycleHook(hookName, callback) {
        return this.panelManager.addLifecycleHook(hookName, callback);
    }

    removeLifecycleHook(hookName, callback) {
        return this.panelManager.removeLifecycleHook(hookName, callback);
    }

    // KeyboardShortcutManager API の公開
    getKeyboardShortcutManager() {
        return this.keyboardShortcutManager;
    }

    getShortcutsByGroup(group) {
        return this.keyboardShortcutManager.getShortcutsByGroup(group);
    }

    getShortcutsByContext(context) {
        return this.keyboardShortcutManager.getShortcutsByContext(context);
    }

    switchShortcutContext(context) {
        return this.keyboardShortcutManager.switchContext(context);
    }

    getShortcutStatistics() {
        return this.keyboardShortcutManager.getStatistics();
    }

    setShortcutsEnabled(enabled) {
        return this.keyboardShortcutManager.setEnabled(enabled);
    }

    setSuspendShortcuts(suspended) {
        return this.keyboardShortcutManager.setSuspended(suspended);
    }

    // ResponsiveDebugLayout API の公開
    getResponsiveLayout() {
        return this.responsiveLayout;
    }

    getCurrentBreakpoint() {
        return this.responsiveLayout ? this.responsiveLayout.getCurrentBreakpoint() : 'desktop';
    }
    
    isTouchDevice() {
        return this.responsiveLayout ? this.responsiveLayout.touchDevice : false;
    }
    
    getOrientation() {
        return this.responsiveLayout ? this.responsiveLayout.getOrientation() : 'landscape';
    }

    // ThemeManager API の公開
    getThemeManager() {
        return this.themeManager;
    }

    setTheme(themeName) {
        return this.themeManager ? this.themeManager.setTheme(themeName) : false;
    }

    getCurrentTheme() {
        return this.themeManager ? this.themeManager.getCurrentTheme() : 'dark';
    }

    getAvailableThemes() {
        return this.themeManager ? this.themeManager.getAvailableThemes() : [];
    }

    // AccessibilityManager API の公開
    getAccessibilityManager() {
        return this.accessibilityManager;
    }

    getAccessibilityInfo() {
        return this.accessibilityManager ? this.accessibilityManager.getAccessibilityInfo() : {};
    }

    setKeyboardNavigationEnabled(enabled) {
        if (this.accessibilityManager) {
            this.accessibilityManager.setKeyboardNavigationEnabled(enabled);
        }
    }

    announceToScreenReader(message, priority = 'polite') {
        if (this.accessibilityManager) {
            this.accessibilityManager.announceToScreenReader(message, priority);
        }
    }
}

// グローバルアクセス用（デバッグ目的）
window.EnhancedDebugInterface = EnhancedDebugInterface;