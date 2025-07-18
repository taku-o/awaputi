import { browserCompatibility } from './BrowserCompatibility.js';

/**
 * レスポンシブCanvas管理クラス
 */
export class ResponsiveCanvasManager {
    constructor(canvas, gameEngine) {
        this.canvas = canvas;
        this.gameEngine = gameEngine;
        this.context = canvas.getContext('2d');
        
        this.baseWidth = 800;
        this.baseHeight = 600;
        this.aspectRatio = this.baseWidth / this.baseHeight;
        
        this.currentSize = {
            displayWidth: this.baseWidth,
            displayHeight: this.baseHeight,
            actualWidth: this.baseWidth,
            actualHeight: this.baseHeight,
            scale: 1
        };
        
        this.resizeTimeout = null;
        this.isInitialized = false;
        
        this.setupResponsiveCanvas();
        this.setupEventListeners();
    }
    
    /**
     * レスポンシブCanvas を設定
     */
    setupResponsiveCanvas() {
        this.updateCanvasSize();
        this.isInitialized = true;
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // ウィンドウリサイズ
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // 画面の向き変更
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                this.handleOrientationChange();
            });
        } else {
            window.addEventListener('orientationchange', () => {
                this.handleOrientationChange();
            });
        }
        
        // ビューポート変更（モバイルブラウザ）
        window.addEventListener('scroll', () => {
            this.handleViewportChange();
        });
        
        // フルスクリーン変更
        document.addEventListener('fullscreenchange', () => {
            this.handleFullscreenChange();
        });
    }
    
    /**
     * Canvas サイズを更新
     */
    updateCanvasSize() {
        const optimalSize = browserCompatibility.calculateOptimalCanvasSize();
        
        // 表示サイズを設定
        this.canvas.style.width = optimalSize.displayWidth + 'px';
        this.canvas.style.height = optimalSize.displayHeight + 'px';
        
        // 実際のCanvas サイズを設定（高DPI対応）
        this.canvas.width = optimalSize.actualWidth;
        this.canvas.height = optimalSize.actualHeight;
        
        // コンテキストのスケールを調整
        const pixelRatio = optimalSize.pixelRatio;
        if (pixelRatio > 1) {
            this.context.scale(pixelRatio, pixelRatio);
        }
        
        // スケール比を計算
        const scale = Math.min(
            optimalSize.displayWidth / this.baseWidth,
            optimalSize.displayHeight / this.baseHeight
        );
        
        this.currentSize = {
            displayWidth: optimalSize.displayWidth,
            displayHeight: optimalSize.displayHeight,
            actualWidth: optimalSize.actualWidth,
            actualHeight: optimalSize.actualHeight,
            scale: scale,
            pixelRatio: pixelRatio
        };
        
        // Canvas の位置を中央に調整
        this.centerCanvas();
        
        // ゲームエンジンに変更を通知
        if (this.isInitialized && this.gameEngine) {
            this.gameEngine.onCanvasResize?.(this.currentSize);
        }
        
        console.log('Canvas resized:', this.currentSize);
    }
    
    /**
     * Canvas を中央に配置
     */
    centerCanvas() {
        const container = this.canvas.parentElement;
        if (!container) return;
        
        // Canvas を中央に配置するスタイルを適用
        this.canvas.style.position = 'relative';
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        
        // コンテナのスタイルも調整
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.minHeight = '100vh';
    }
    
    /**
     * リサイズ処理
     */
    handleResize() {
        // デバウンス処理
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = setTimeout(() => {
            this.updateCanvasSize();
            this.resizeTimeout = null;
        }, 100);
    }
    
    /**
     * 画面の向き変更処理
     */
    handleOrientationChange() {
        // 向き変更後に少し待ってからリサイズ
        setTimeout(() => {
            this.updateCanvasSize();
            this.showOrientationMessage();
        }, 500);
    }
    
    /**
     * ビューポート変更処理（モバイル）
     */
    handleViewportChange() {
        if (browserCompatibility.deviceInfo.isMobile) {
            // モバイルブラウザのアドレスバー表示/非表示に対応
            this.handleResize();
        }
    }
    
    /**
     * フルスクリーン変更処理
     */
    handleFullscreenChange() {
        setTimeout(() => {
            this.updateCanvasSize();
        }, 100);
    }
    
    /**
     * 画面座標をCanvas座標に変換
     */
    screenToCanvas(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (screenX - rect.left) * scaleX,
            y: (screenY - rect.top) * scaleY
        };
    }
    
    /**
     * Canvas座標を画面座標に変換
     */
    canvasToScreen(canvasX, canvasY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = rect.width / this.canvas.width;
        const scaleY = rect.height / this.canvas.height;
        
        return {
            x: canvasX * scaleX + rect.left,
            y: canvasY * scaleY + rect.top
        };
    }
    
    /**
     * スケール済み座標を取得
     */
    getScaledCoordinates(x, y) {
        return {
            x: x * this.currentSize.scale,
            y: y * this.currentSize.scale
        };
    }
    
    /**
     * スケール済みサイズを取得
     */
    getScaledSize(width, height) {
        return {
            width: width * this.currentSize.scale,
            height: height * this.currentSize.scale
        };
    }
    
    /**
     * 現在のCanvas情報を取得
     */
    getCanvasInfo() {
        return {
            ...this.currentSize,
            baseWidth: this.baseWidth,
            baseHeight: this.baseHeight,
            aspectRatio: this.aspectRatio,
            deviceInfo: browserCompatibility.deviceInfo
        };
    }
    
    /**
     * 向き変更メッセージを表示
     */
    showOrientationMessage() {
        if (!browserCompatibility.deviceInfo.isMobile) return;
        
        const orientation = browserCompatibility.getOrientation();
        const isLandscape = orientation.includes('landscape');
        
        // 縦向きの場合は横向きを推奨
        if (!isLandscape && this.currentSize.displayWidth < 500) {
            this.showTemporaryMessage('横向きでのプレイを推奨します', 3000);
        }
    }
    
    /**
     * 一時的なメッセージを表示
     */
    showTemporaryMessage(message, duration = 2000) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 1000;
            pointer-events: none;
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, duration);
    }
    
    /**
     * フルスクリーンモードを切り替え
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (this.canvas.requestFullscreen) {
                this.canvas.requestFullscreen();
            } else if (this.canvas.webkitRequestFullscreen) {
                this.canvas.webkitRequestFullscreen();
            } else if (this.canvas.msRequestFullscreen) {
                this.canvas.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    /**
     * 高DPI対応の描画コンテキストを取得
     */
    getHighDPIContext() {
        const pixelRatio = this.currentSize.pixelRatio;
        
        if (pixelRatio > 1) {
            // 既にスケールが適用されている場合は、元のコンテキストを返す
            return this.context;
        }
        
        return this.context;
    }
    
    /**
     * デバイス固有の最適化を適用
     */
    applyDeviceOptimizations() {
        const deviceInfo = browserCompatibility.deviceInfo;
        
        // iOS Safari 固有の最適化
        if (browserCompatibility.browserInfo.name === 'safari' && deviceInfo.isMobile) {
            // タッチ操作の最適化
            this.canvas.style.touchAction = 'none';
            this.canvas.style.webkitTouchCallout = 'none';
            this.canvas.style.webkitUserSelect = 'none';
        }
        
        // Android Chrome 固有の最適化
        if (browserCompatibility.browserInfo.name === 'chrome' && deviceInfo.isMobile) {
            // ハードウェアアクセラレーションの有効化
            this.canvas.style.willChange = 'transform';
            this.canvas.style.transform = 'translateZ(0)';
        }
        
        // 低解像度デバイスでの最適化
        if (deviceInfo.screenInfo.pixelRatio < 1.5) {
            // アンチエイリアシングを無効化してパフォーマンス向上
            this.context.imageSmoothingEnabled = false;
        }
        
        // 高解像度デバイスでの最適化
        if (deviceInfo.screenInfo.pixelRatio > 2) {
            // 描画品質を調整
            this.context.imageSmoothingQuality = 'high';
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        // イベントリスナーを削除
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        window.removeEventListener('scroll', this.handleViewportChange);
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        
        if (screen.orientation) {
            screen.orientation.removeEventListener('change', this.handleOrientationChange);
        }
    }
}