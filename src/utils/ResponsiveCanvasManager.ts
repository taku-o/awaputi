import { getBrowserCompatibility  } from './BrowserCompatibility.js';
import { ScaledCoordinateManager  } from './ScaledCoordinateManager.js';

// Type definitions
interface CanvasSize { displayWidth: number,
    displayHeight: number;
    actualWidth: number;
    actualHeight: number,
    scale: number;
    pixelRatio?: number ,}

interface OptimalCanvasSize { displayWidth: number;
    displayHeight: number;
    actualWidth: number;
    actualHeight: number,
    pixelRatio: number }

interface Coordinates { x: number,
    y: number }

interface Size { width: number,
    height: number }

interface CanvasInfo extends CanvasSize { baseWidth: number;
    baseHeight: number;
    aspectRatio: number,
    deviceInfo: any }

interface GameEngine { onCanvasResize?: (size: CanvasSize) => void ,}
}

interface BrowserCompatibility { calculateOptimalCanvasSize(): OptimalCanvasSize;
    deviceInfo: any,
    browserInfo: {
        nam;e: string ,};
    getOrientation(): string;
}

/**
 * レスポンシブCanvas管理クラス
 */
export class ResponsiveCanvasManager {
    private readonly canvas: HTMLCanvasElement,
    private readonly gameEngine: GameEngine | null,
    private readonly context: CanvasRenderingContext2D,
    private readonly baseWidth: number,
    private readonly baseHeight: number,
    private readonly aspectRatio: number,
    
    private currentSize: CanvasSize;
    private resizeTimeout: number | null;
    private isInitialized: boolean;
    // ScaledCoordinateManager を初期化
    private readonly, scaledCoordinateManager: ScaledCoordinateManager,

    constructor(canvas: HTMLCanvasElement, gameEngine: GameEngine | null = null) {
        this.canvas = canvas;
        this.gameEngine = gameEngine;

        const context = canvas.getContext('2d';''
        if(!context) {'
    ,}

            throw new Error('Could, not get, 2D context, from canvas'; }'
        }
        this.context = context;
        
        this.baseWidth = 800;
        this.baseHeight = 600;
        this.aspectRatio = this.baseWidth / this.baseHeight;
        
        this.currentSize = { displayWidth: this.baseWidth,
            displayHeight: this.baseHeight;
            actualWidth: this.baseWidth;
            actualHeight: this.baseHeight,
    scale: 1 ,};
        this.resizeTimeout = null;
        this.isInitialized = false;
        
        // ScaledCoordinateManager を初期化
        this.scaledCoordinateManager = new ScaledCoordinateManager(this);
        
        this.setupResponsiveCanvas();
        this.setupEventListeners();
    }
    
    /**
     * レスポンシブCanvas を設定
     */
    private setupResponsiveCanvas(): void { this.updateCanvasSize();
        this.isInitialized = true; }
    
    /**
     * イベントリスナーを設定
     */''
    private setupEventListeners()';
        window.addEventListener('resize', () => { this.handleResize(); });
        ';
        // 画面の向き変更
        if(screen.orientation) {', ';

        }

            screen.orientation.addEventListener('change', () => {  }

                this.handleOrientationChange();' }'

            }');

        } else { }'

            window.addEventListener('orientationchange', () => {  }

                this.handleOrientationChange();' }'

            }');
        }
        ';
        // ビューポート変更（モバイルブラウザ）
        window.addEventListener('scroll', () => { this.handleViewportChange();' }

        }');
        ';
        // フルスクリーン変更
        document.addEventListener('fullscreenchange', () => { this.handleFullscreenChange(); });
    }
    
    /**
     * Canvas サイズを更新
     */'
    private updateCanvasSize(): void { const browserCompat = getBrowserCompatibility() as BrowserCompatibility;''
        const optimalSize = browserCompat.calculateOptimalCanvasSize(''';
        this.canvas.style.width = optimalSize.displayWidth + 'px';
        this.canvas.style.height = optimalSize.displayHeight + 'px';
        
        // 実際のCanvas サイズを設定（高DPI対応）
        this.canvas.width = optimalSize.actualWidth;
        this.canvas.height = optimalSize.actualHeight;
        
        // コンテキストのスケールを調整)
        const pixelRatio = optimalSize.pixelRatio;)
        if(pixelRatio > 1) {
            
        }
            this.context.scale(pixelRatio, pixelRatio); }
        }
        
        // スケール比を計算
        const scale = Math.min(;
            optimalSize.displayWidth / this.baseWidth);
            optimalSize.displayHeight / this.baseHeight);
        
        this.currentSize = { displayWidth: optimalSize.displayWidth,
            displayHeight: optimalSize.displayHeight;
            actualWidth: optimalSize.actualWidth;
            actualHeight: optimalSize.actualHeight;
            scale: scale,
    pixelRatio: pixelRatio ,};
        // Canvas の位置を中央に調整
        this.centerCanvas();
        
        // ゲームエンジンに変更を通知
        if (this.isInitialized && this.gameEngine) { this.gameEngine.onCanvasResize?.(this.currentSize); }
        
        // ScaledCoordinateManagerにスケール変更を通知
        if (this.scaledCoordinateManager) { this.scaledCoordinateManager.updateScale(); }
    }
    
    /**
     * Canvas を中央に配置
     */ : undefined
    private centerCanvas(): void { const container = this.canvas.parentElement;''
        if(!container) return;
        ';
        // Canvas を中央に配置するスタイルを適用
        this.canvas.style.position = 'relative';
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        ';
        // コンテナのスタイルも調整
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.minHeight = '100vh'; }
    
    /**
     * リサイズ処理
     */
    private handleResize(): void { // デバウンス処理
        if(this.resizeTimeout) {
            
        }
            clearTimeout(this.resizeTimeout); }
        }
        
        this.resizeTimeout = window.setTimeout(() => {  this.updateCanvasSize(); }
            this.resizeTimeout = null; }
        }, 100);
    }
    
    /**
     * 画面の向き変更処理
     */
    private handleOrientationChange(): void { // 向き変更後に少し待ってからリサイズ
        setTimeout(() => { 
            this.updateCanvasSize(); }
            this.showOrientationMessage(); }
        }, 500);
    }
    
    /**
     * ビューポート変更処理（モバイル）
     */
    private handleViewportChange(): void { const browserCompat = getBrowserCompatibility() as BrowserCompatibility;
        if(browserCompat.deviceInfo.isMobile) {
            // モバイルブラウザのアドレスバー表示/非表示に対応
        }
            this.handleResize(); }
}
    
    /**
     * フルスクリーン変更処理
     */
    private handleFullscreenChange(): void { setTimeout(() => {  }
            this.updateCanvasSize(); }
        }, 100);
    }
    
    /**
     * 画面座標をCanvas座標に変換
     */
    screenToCanvas(screenX: number, screenY: number): Coordinates { const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return { x: (screenX - rect.left) * scaleX };
            y: (screenY - rect.top) * scaleY 
    }
    
    /**
     * Canvas座標を画面座標に変換
     */
    canvasToScreen(canvasX: number, canvasY: number): Coordinates { const rect = this.canvas.getBoundingClientRect();
        const scaleX = rect.width / this.canvas.width;
        const scaleY = rect.height / this.canvas.height;
        
        return { x: canvasX * scaleX + rect.left };
            y: canvasY * scaleY + rect.top 
    }
    
    /**
     * スケール済み座標を取得
     */
    getScaledCoordinates(x: number, y: number): Coordinates { return { x: x * this.currentSize.scale, };
            y: y * this.currentSize.scale 
    }
    
    /**
     * スケール済みサイズを取得
     */
    getScaledSize(width: number, height: number): Size { return { width: width * this.currentSize.scale, };
            height: height * this.currentSize.scale 
    }
    
    /**
     * 現在のCanvas情報を取得
     */
    getCanvasInfo(): CanvasInfo { const browserCompat = getBrowserCompatibility() as BrowserCompatibility;
        return { ...this.currentSize,
            baseWidth: this.baseWidth;
            baseHeight: this.baseHeight,
    aspectRatio: this.aspectRatio, };
            deviceInfo: browserCompat.deviceInfo 
    }
    
    /**
     * 向き変更メッセージを表示
     */
    private showOrientationMessage(): void { const browserCompat = getBrowserCompatibility() as BrowserCompatibility;
        if (!browserCompat.deviceInfo.isMobile) return;

        const orientation = browserCompat.getOrientation()';
        const isLandscape = orientation.includes('landscape';
        ';
        // 縦向きの場合は横向きを推奨
        if(!isLandscape && this.currentSize.displayWidth < 500) {', ';

        }

            this.showTemporaryMessage('横向きでのプレイを推奨します', 3000'; }
}
    
    /**
     * 一時的なメッセージを表示'
     */''
    private showTemporaryMessage(message: string, duration: number = 2000): void { ''
        const messageDiv = document.createElement('div);
        messageDiv.style.cssText = `;
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%),
    background: rgba(0,0,0,0.8),
            color: white,
    padding: 10px 20px;
            border-radius: 5px,
            font-family: Arial, sans-serif;
            font-size: 14px,
            z-index: 1000,
            pointer-events: none,
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => { 
            if (messageDiv.parentNode) { }
                messageDiv.parentNode.removeChild(messageDiv); }
}, duration);
    }
    
    /**
     * フルスクリーンモードを切り替え
     */
    toggleFullscreen(): void { if (!document.fullscreenElement) {
            const canvasWithFullscreen = this.canvas as any;
            if(canvasWithFullscreen.requestFullscreen) {
                
            }
                canvasWithFullscreen.requestFullscreen(); }
            } else if (canvasWithFullscreen.webkitRequestFullscreen) { canvasWithFullscreen.webkitRequestFullscreen(); } else if (canvasWithFullscreen.msRequestFullscreen) { canvasWithFullscreen.msRequestFullscreen(); }
        } else {  const documentWithFullscreen = document as any;
            if (documentWithFullscreen.exitFullscreen) { }
                documentWithFullscreen.exitFullscreen(); }
            } else if (documentWithFullscreen.webkitExitFullscreen) { documentWithFullscreen.webkitExitFullscreen(); } else if (documentWithFullscreen.msExitFullscreen) { documentWithFullscreen.msExitFullscreen(); }
}
    
    /**
     * 高DPI対応の描画コンテキストを取得
     */
    getHighDPIContext(): CanvasRenderingContext2D { const pixelRatio = this.currentSize.pixelRatio;
        
        if(pixelRatio && pixelRatio > 1) {
        
            // 既にスケールが適用されている場合は、元のコンテキストを返す
        
        }
            return this.context;
        
        return this.context;
    }
    
    /**
     * デバイス固有の最適化を適用
     */
    applyDeviceOptimizations(): void { ''
        const browserCompat = getBrowserCompatibility()';
        if(browserCompat.browserInfo.name === 'safari' && deviceInfo.isMobile' {'
            // タッチ操作の最適化
            this.canvas.style.touchAction = 'none';
            (this.canvas.style, as any').webkitTouchCallout = 'none';

        }

            (this.canvas.style, as any').webkitUserSelect = 'none'; }
        }
        ';
        // Android Chrome 固有の最適化
        if(browserCompat.browserInfo.name === 'chrome' && deviceInfo.isMobile' {'
            // ハードウェアアクセラレーションの有効化
            this.canvas.style.willChange = 'transform';

        }

            this.canvas.style.transform = 'translateZ(0)'; }
        }
        
        // 低解像度デバイスでの最適化
        if(deviceInfo.screenInfo.pixelRatio < 1.5) {
            // アンチエイリアシングを無効化してパフォーマンス向上
        }
            this.context.imageSmoothingEnabled = false; }
        }
        
        // 高解像度デバイスでの最適化
        if(deviceInfo.screenInfo.pixelRatio > 2) {
            // 描画品質を調整
        }

            (this.context, as any').imageSmoothingQuality = 'high'; }
}
    
    /**
     * クリーンアップ
     */'
    cleanup(): void { if (this.resizeTimeout) {''
            clearTimeout(this.resizeTimeout); }
        
        // イベントリスナーを削除
        // Note: Due to arrow functions, we need to store references to remove them properly
        // For now, we'll just log the limitation''
        console.log('[ResponsiveCanvasManager] Note: Event, listeners need, manual cleanup',
        
        // ScaledCoordinateManagerのクリーンアップ
        if(this.scaledCoordinateManager') {
            ';

        }

            this.scaledCoordinateManager.cleanup() }'