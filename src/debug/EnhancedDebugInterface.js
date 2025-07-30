/**
 * Enhanced Debug Interface
 * 既存のEffectDebugInterfaceを拡張した包括的なデバッグツール統合環境
 */

import { EffectDebugInterface } from '../effects/EffectDebugInterface.js';

export class EnhancedDebugInterface extends EffectDebugInterface {
    constructor(gameEngine) {
        super(gameEngine);
        
        // パネル管理システム
        this.panels = new Map();
        this.activePanel = 'overview';
        this.panelHistory = [];
        
        // レイアウト管理
        this.layout = 'docked'; // 'docked', 'floating', 'fullscreen'
        this.position = { x: 10, y: 10 };
        this.size = { width: 400, height: 600 };
        
        // キーボードショートカット
        this.shortcuts = new Map();
        this.shortcutConflicts = new Map();
        
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
        
        this.initializeEnhancedFeatures();
    }

    initializeEnhancedFeatures() {
        this.setupEnhancedUI();
        this.registerDefaultPanels();
        this.setupDefaultShortcuts();
        this.loadSettings();
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
        this.debugPanel.className = 'enhanced-debug-panel';
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

    registerPanel(name, panelClass) {
        if (this.panels.has(name)) {
            console.warn(`Panel '${name}' is already registered`);
            return false;
        }

        try {
            const panelInstance = new panelClass(this.gameEngine, this);
            this.panels.set(name, panelInstance);
            
            // パネルタブの追加
            this.addPanelTab(name, panelInstance.getDisplayName());
            
            // パネルコンテンツエリアの追加
            this.addPanelContent(name);
            
            console.log(`Panel '${name}' registered successfully`);
            return true;
        } catch (error) {
            console.error(`Failed to register panel '${name}':`, error);
            return false;
        }
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
        const panel = this.panels.get(panelName);
        if (panel && typeof panel.activate === 'function') {
            panel.activate();
        }
    }

    registerDefaultPanels() {
        // デフォルトパネルの登録（後で個別クラスで実装）
        console.log('Registering default panels...');
    }

    setupDefaultShortcuts() {
        this.registerShortcut('ctrl+shift+d', () => this.toggle(), 'Toggle Debug Interface');
        this.registerShortcut('ctrl+shift+p', () => this.switchPanel('performance'), 'Switch to Performance Panel');
        this.registerShortcut('ctrl+shift+c', () => this.switchPanel('console'), 'Switch to Console Panel');
        this.registerShortcut('ctrl+shift+e', () => this.switchPanel('errors'), 'Switch to Errors Panel');
        this.registerShortcut('ctrl+shift+t', () => this.switchPanel('tests'), 'Switch to Tests Panel');
        this.registerShortcut('escape', () => this.hide(), 'Hide Debug Interface');
    }

    registerShortcut(shortcut, callback, description = '') {
        const normalizedShortcut = this.normalizeShortcut(shortcut);
        
        // 競合チェック
        if (this.shortcuts.has(normalizedShortcut)) {
            const existing = this.shortcuts.get(normalizedShortcut);
            this.shortcutConflicts.set(normalizedShortcut, [existing, { callback, description }]);
            console.warn(`Shortcut conflict detected for '${shortcut}':`, description);
            return false;
        }

        this.shortcuts.set(normalizedShortcut, { callback, description });
        return true;
    }

    normalizeShortcut(shortcut) {
        return shortcut.toLowerCase().replace(/\s+/g, '');
    }

    handleKeyboardEvent(event) {
        const shortcut = this.buildShortcutString(event);
        const handler = this.shortcuts.get(shortcut);
        
        if (handler) {
            event.preventDefault();
            handler.callback();
            return true;
        }
        
        return false;
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
        // 設定パネルの表示（後で実装）
        alert('Settings panel will be implemented in the next phase');
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
        
        // パネルの破棄
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
        return new Map(this.shortcuts);
    }

    getShortcutConflicts() {
        return new Map(this.shortcutConflicts);
    }
}

// グローバルアクセス用（デバッグ目的）
window.EnhancedDebugInterface = EnhancedDebugInterface;