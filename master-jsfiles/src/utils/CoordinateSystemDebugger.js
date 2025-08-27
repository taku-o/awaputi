/**
 * CoordinateSystemDebugger - 座標システムデバッグユーティリティ
 * Issue #177 Canvas Scale UI Positioning デバッグツール
 */

export class CoordinateSystemDebugger {
    constructor(scaledCoordinateManager, uiPositionCalculator, inputCoordinateConverter) {
        this.scaledCoordinateManager = scaledCoordinateManager;
        this.uiPositionCalculator = uiPositionCalculator;
        this.inputCoordinateConverter = inputCoordinateConverter;
        
        this.debugPanel = null;
        this.overlayCanvas = null;
        this.overlayContext = null;
        this.isEnabled = false;
        this.showOverlays = false;
        this.logLevel = 'info'; // 'debug', 'info', 'warn', 'error'
        
        this.trackedElements = new Map();
        this.coordinateHistory = [];
        this.maxHistorySize = 100;
        
        this.setupEventListeners();
    }
    
    /**
     * デバッグ機能を有効化
     */
    enable() {
        this.isEnabled = true;
        this.createDebugPanel();
        this.createOverlayCanvas();
        this.log('info', 'CoordinateSystemDebugger enabled');
    }
    
    /**
     * デバッグ機能を無効化
     */
    disable() {
        this.isEnabled = false;
        this.removeDebugPanel();
        this.removeOverlayCanvas();
        this.log('info', 'CoordinateSystemDebugger disabled');
    }
    
    /**
     * デバッグパネルを作成
     */
    createDebugPanel() {
        if (this.debugPanel) {
            return;
        }
        
        this.debugPanel = document.createElement('div');
        this.debugPanel.id = 'coordinate-debug-panel';
        this.debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 320px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 12px;
            padding: 15px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            max-height: 500px;
            overflow-y: auto;
        `;
        
        document.body.appendChild(this.debugPanel);
        this.updateDebugPanel();
        
        // 定期更新
        this.debugUpdateInterval = setInterval(() => {
            if (this.isEnabled && this.debugPanel) {
                this.updateDebugPanel();
            }
        }, 100);
    }
    
    /**
     * デバッグパネルを削除
     */
    removeDebugPanel() {
        if (this.debugPanel) {
            this.debugPanel.remove();
            this.debugPanel = null;
        }
        
        if (this.debugUpdateInterval) {
            clearInterval(this.debugUpdateInterval);
            this.debugUpdateInterval = null;
        }
    }
    
    /**
     * デバッグパネルの内容を更新
     */
    updateDebugPanel() {
        if (!this.debugPanel || !this.scaledCoordinateManager) {
            return;
        }
        
        const debugInfo = this.scaledCoordinateManager.getDebugInfo();
        const canvasInfo = debugInfo.canvasInfo;
        const scaleFactor = debugInfo.scaleFactor;
        
        const deviceType = this.uiPositionCalculator ? 
            this.uiPositionCalculator.getDeviceType() : 'unknown';
        
        const html = `
            <h3>🎯 Coordinate System Debug</h3>
            
            <div style="margin-bottom: 15px;">
                <h4>📊 Canvas Information</h4>
                <div>Base Size: ${canvasInfo.baseWidth} × ${canvasInfo.baseHeight}</div>
                <div>Display Size: ${canvasInfo.displayWidth} × ${canvasInfo.displayHeight}</div>
                <div>Actual Size: ${canvasInfo.actualWidth} × ${canvasInfo.actualHeight}</div>
                <div>Scale Factor: <span style="color: #4CAF50; font-weight: bold;">${scaleFactor.toFixed(3)}</span></div>
                <div>Pixel Ratio: ${canvasInfo.pixelRatio}</div>
                <div>Device Type: <span style="color: #2196F3;">${deviceType}</span></div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4>🎮 Control Panel</h4>
                <button onclick="window.coordinateDebugger.toggleOverlays()" 
                        style="background: ${this.showOverlays ? '#4CAF50' : '#757575'}; 
                               color: white; border: none; padding: 5px 10px; 
                               border-radius: 4px; margin-right: 5px; cursor: pointer;">
                    ${this.showOverlays ? 'Hide' : 'Show'} Overlays
                </button>
                <button onclick="window.coordinateDebugger.logCurrentState()" 
                        style="background: #FF9800; color: white; border: none; 
                               padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                    Log State
                </button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4>📍 Tracked Elements (${this.trackedElements.size})</h4>
                <div style="max-height: 120px; overflow-y: auto; font-size: 11px;">
                    ${Array.from(this.trackedElements.entries()).map(([id, element]) => `
                        <div style="margin: 3px 0; padding: 3px; background: rgba(255,255,255,0.1); border-radius: 3px;">
                            <strong>${id}</strong>: (${element.x.toFixed(1)}, ${element.y.toFixed(1)}) 
                            ${element.width}×${element.height}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div>
                <h4>📋 Recent Coordinates (${this.coordinateHistory.length})</h4>
                <div style="max-height: 100px; overflow-y: auto; font-size: 11px;">
                    ${this.coordinateHistory.slice(-5).map(entry => `
                        <div style="margin: 2px 0; color: #E0E0E0;">
                            ${entry.timestamp.toLocaleTimeString()}: 
                            Base(${entry.baseX.toFixed(1)}, ${entry.baseY.toFixed(1)}) → 
                            Scaled(${entry.scaledX.toFixed(1)}, ${entry.scaledY.toFixed(1)})
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.debugPanel.innerHTML = html;
        
        // グローバルアクセス用
        window.coordinateDebugger = this;
    }
    
    /**
     * オーバーレイキャンバスを作成
     */
    createOverlayCanvas() {
        if (this.overlayCanvas) {
            return;
        }
        
        const gameCanvas = document.getElementById('gameCanvas');
        if (!gameCanvas) {
            this.log('warn', 'Game canvas not found, cannot create overlay');
            return;
        }
        
        this.overlayCanvas = document.createElement('canvas');
        this.overlayCanvas.id = 'coordinate-debug-overlay';
        this.overlayCanvas.style.cssText = `
            position: absolute;
            top: ${gameCanvas.offsetTop}px;
            left: ${gameCanvas.offsetLeft}px;
            width: ${gameCanvas.offsetWidth}px;
            height: ${gameCanvas.offsetHeight}px;
            pointer-events: none;
            z-index: 9999;
        `;
        
        this.overlayCanvas.width = gameCanvas.width;
        this.overlayCanvas.height = gameCanvas.height;
        this.overlayContext = this.overlayCanvas.getContext('2d');
        
        document.body.appendChild(this.overlayCanvas);
        this.log('debug', 'Debug overlay canvas created');
    }
    
    /**
     * オーバーレイキャンバスを削除
     */
    removeOverlayCanvas() {
        if (this.overlayCanvas) {
            this.overlayCanvas.remove();
            this.overlayCanvas = null;
            this.overlayContext = null;
        }
    }
    
    /**
     * オーバーレイ表示を切り替え
     */
    toggleOverlays() {
        this.showOverlays = !this.showOverlays;
        if (this.showOverlays) {
            this.renderOverlays();
        } else {
            this.clearOverlays();
        }
        this.log('info', `Overlays ${this.showOverlays ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * オーバーレイを描画
     */
    renderOverlays() {
        if (!this.overlayContext || !this.showOverlays) {
            return;
        }
        
        this.clearOverlays();
        
        const scaleFactor = this.scaledCoordinateManager.getScaleFactor();
        
        // グリッド線を描画
        this.drawGrid(scaleFactor);
        
        // トラッキングされている要素の境界を描画
        this.drawTrackedElements(scaleFactor);
        
        // 座標軸を描画
        this.drawCoordinateAxes(scaleFactor);
        
        // スケール情報を描画
        this.drawScaleInfo(scaleFactor);
    }
    
    /**
     * オーバーレイをクリア
     */
    clearOverlays() {
        if (this.overlayContext) {
            this.overlayContext.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        }
    }
    
    /**
     * グリッド線を描画
     */
    drawGrid(scaleFactor) {
        if (!this.overlayContext) return;
        
        const ctx = this.overlayContext;
        const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
        
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        const gridSize = 50 * scaleFactor;
        
        // 垂直線
        for (let x = 0; x <= canvasInfo.displayWidth; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasInfo.displayHeight);
            ctx.stroke();
        }
        
        // 水平線
        for (let y = 0; y <= canvasInfo.displayHeight; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasInfo.displayWidth, y);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
    }
    
    /**
     * トラッキング要素の境界を描画
     */
    drawTrackedElements(scaleFactor) {
        if (!this.overlayContext) return;
        
        const ctx = this.overlayContext;
        
        this.trackedElements.forEach((element, id) => {
            const scaledX = element.x * scaleFactor;
            const scaledY = element.y * scaleFactor;
            const scaledWidth = element.width * scaleFactor;
            const scaledHeight = element.height * scaleFactor;
            
            // 境界矩形
            ctx.strokeStyle = element.color || '#FF5722';
            ctx.lineWidth = 2;
            ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
            
            // ラベル
            ctx.fillStyle = element.color || '#FF5722';
            ctx.font = '12px Arial';
            ctx.fillText(id, scaledX + 2, scaledY - 5);
            
            // 中心点
            ctx.fillStyle = 'rgba(255, 87, 34, 0.8)';
            ctx.beginPath();
            ctx.arc(scaledX + scaledWidth/2, scaledY + scaledHeight/2, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
    
    /**
     * 座標軸を描画
     */
    drawCoordinateAxes(scaleFactor) {
        if (!this.overlayContext) return;
        
        const ctx = this.overlayContext;
        
        // X軸
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(100 * scaleFactor, 20);
        ctx.stroke();
        
        // Y軸
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(20, 100 * scaleFactor);
        ctx.stroke();
        
        // ラベル
        ctx.fillStyle = '#4CAF50';
        ctx.font = '14px Arial';
        ctx.fillText('X', 105 * scaleFactor, 25);
        ctx.fillText('Y', 25, 105 * scaleFactor);
    }
    
    /**
     * スケール情報を描画
     */
    drawScaleInfo(scaleFactor) {
        if (!this.overlayContext) return;
        
        const ctx = this.overlayContext;
        const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, canvasInfo.displayHeight - 80, 200, 70);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.fillText(`Scale: ${scaleFactor.toFixed(3)}`, 15, canvasInfo.displayHeight - 60);
        ctx.fillText(`Base: ${canvasInfo.baseWidth}×${canvasInfo.baseHeight}`, 15, canvasInfo.displayHeight - 45);
        ctx.fillText(`Display: ${canvasInfo.displayWidth}×${canvasInfo.displayHeight}`, 15, canvasInfo.displayHeight - 30);
        ctx.fillText(`Pixel Ratio: ${canvasInfo.pixelRatio}`, 15, canvasInfo.displayHeight - 15);
    }
    
    /**
     * UI要素をトラッキング
     */
    trackElement(id, x, y, width, height, color = '#FF5722') {
        this.trackedElements.set(id, {
            x: x,
            y: y,
            width: width,
            height: height,
            color: color,
            timestamp: Date.now()
        });
        
        if (this.showOverlays) {
            this.renderOverlays();
        }
        
        this.log('debug', `Tracking element: ${id} at (${x}, ${y}) size ${width}×${height}`);
    }
    
    /**
     * トラッキングを停止
     */
    untrackElement(id) {
        this.trackedElements.delete(id);
        if (this.showOverlays) {
            this.renderOverlays();
        }
        this.log('debug', `Stopped tracking element: ${id}`);
    }
    
    /**
     * 座標変換をログ
     */
    logCoordinateConversion(baseX, baseY, scaledX, scaledY, context = '') {
        const entry = {
            baseX: baseX,
            baseY: baseY,
            scaledX: scaledX,
            scaledY: scaledY,
            context: context,
            timestamp: new Date()
        };
        
        this.coordinateHistory.push(entry);
        
        // 履歴サイズ制限
        if (this.coordinateHistory.length > this.maxHistorySize) {
            this.coordinateHistory.shift();
        }
        
        this.log('debug', `Coordinate conversion: Base(${baseX.toFixed(2)}, ${baseY.toFixed(2)}) → Scaled(${scaledX.toFixed(2)}, ${scaledY.toFixed(2)}) [${context}]`);
    }
    
    /**
     * 現在の状態をコンソールに出力
     */
    logCurrentState() {
        const debugInfo = this.scaledCoordinateManager.getDebugInfo();
        const state = {
            timestamp: new Date().toISOString(),
            canvasInfo: debugInfo.canvasInfo,
            scaleFactor: debugInfo.scaleFactor,
            trackedElements: Array.from(this.trackedElements.entries()),
            coordinateHistory: this.coordinateHistory.slice(-10),
            overlaysEnabled: this.showOverlays
        };
        
        console.group('🎯 Coordinate System Debug State');
        console.table(debugInfo.canvasInfo);
        console.log('Tracked Elements:', this.trackedElements);
        console.log('Recent Coordinate Conversions:', this.coordinateHistory.slice(-5));
        console.log('Full State Object:', state);
        console.groupEnd();
        
        this.log('info', 'Current state logged to console');
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // キーボードショートカット (Ctrl+Shift+C)
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.code === 'KeyC') {
                event.preventDefault();
                if (this.isEnabled) {
                    this.disable();
                } else {
                    this.enable();
                }
            }
        });
        
        // ウィンドウリサイズ時にオーバーレイを更新
        window.addEventListener('resize', () => {
            if (this.overlayCanvas && this.showOverlays) {
                setTimeout(() => {
                    this.removeOverlayCanvas();
                    this.createOverlayCanvas();
                    this.renderOverlays();
                }, 100);
            }
        });
    }
    
    /**
     * ログ出力
     */
    log(level, message, ...args) {
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        const currentLevel = levels[this.logLevel] || 1;
        const messageLevel = levels[level] || 1;
        
        if (messageLevel >= currentLevel) {
            const timestamp = new Date().toLocaleTimeString();
            const prefix = `[CoordinateDebugger ${timestamp}]`;
            
            switch (level) {
                case 'debug':
                    console.debug(`%c${prefix} ${message}`, 'color: #2196F3', ...args);
                    break;
                case 'info':
                    console.info(`%c${prefix} ${message}`, 'color: #4CAF50', ...args);
                    break;
                case 'warn':
                    console.warn(`%c${prefix} ${message}`, 'color: #FF9800', ...args);
                    break;
                case 'error':
                    console.error(`%c${prefix} ${message}`, 'color: #F44336', ...args);
                    break;
            }
        }
    }
    
    /**
     * ログレベルを設定
     */
    setLogLevel(level) {
        const validLevels = ['debug', 'info', 'warn', 'error'];
        if (validLevels.includes(level)) {
            this.logLevel = level;
            this.log('info', `Log level set to: ${level}`);
        } else {
            this.log('warn', `Invalid log level: ${level}. Valid levels: ${validLevels.join(', ')}`);
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.disable();
        this.trackedElements.clear();
        this.coordinateHistory = [];
        
        // グローバル参照を削除
        if (window.coordinateDebugger === this) {
            delete window.coordinateDebugger;
        }
        
        this.log('info', 'CoordinateSystemDebugger cleaned up');
    }
}