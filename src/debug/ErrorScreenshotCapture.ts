/**
 * Error Screenshot Capture
 * エラー発生時の自動スクリーンショット機能
 */

interface GameEngine { canvas?: HTMLCanvasElement;
    }
}

interface CaptureSettings { format: string,
    quality: number,
    maxWidth: number,
    maxHeight: number,
    includeCanvas: boolean,
    includeDOM: boolean }
}

interface Screenshot { id: string,
    timestamp: number,
    metadata: ScreenshotMetadata,
    data: string,
    size: number }
}

interface ScreenshotMetadata { errorId?: string;
    errorMessage?: string;
    timestamp?: number;
    gameState?: any;
    viewport: {
        width: number,
        height: number }
    },
    devicePixelRatio: number,
}

interface CaptureContext { errorId?: string;
    gameState?: any; }
}

interface FilterOptions { since?: number;
    until?: number;
    errorId?: string; }
}

interface StorageInfo { count: number,
    totalSize: number,
    maxSize: number,
    utilizationPercent: string,
    oldestTimestamp: number | null,
    newestTimestamp: number | null }
}

interface StoredScreenshot { id: string,
    timestamp: number,
    metadata: ScreenshotMetadata,
    size: number,
    hasData: boolean }
}

export class ErrorScreenshotCapture {
    private gameEngine?: GameEngine;
    private isEnabled: boolean;
    private compressionQuality: number;
    private maxScreenshots: number;
    private storedScreenshots: Screenshot[];
    private captureSettings: CaptureSettings;
    private storageKey: string;
    private maxStorageSize: number;
    constructor(gameEngine?: GameEngine) {

        this.gameEngine = gameEngine;
        this.isEnabled = true;
        this.compressionQuality = 0.8;
        this.maxScreenshots = 10;
        this.storedScreenshots = [];
        
        // スクリーンショット設定
        this.captureSettings = {
            format: 'image/jpeg',
            quality: 0.8,
            maxWidth: 1920,
            maxHeight: 1080,
            includeCanvas: true,

    }
    }
            includeDOM: false // プライバシー保護のため基本無効 }
        },
        ;
        // ストレージ設定
        this.storageKey = 'errorReporter_screenshots';
        this.maxStorageSize = 5 * 1024 * 1024; // 5MB制限
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    private initialize(): void { this.loadStoredScreenshots();''
        this.setupStorageCleanup()';
        console.log('ErrorScreenshotCapture initialized'); }
    }
    
    /**
     * クリティカルエラー時のスクリーンショット自動キャプチャ
     */'
    public async captureOnCriticalError(error: Error, context: CaptureContext = { ): Promise<Screenshot | null> {''
        if (!this.isEnabled') return null;
        
        try {
            const screenshot = await this.captureScreenshot({')'
                errorId: context.errorId || 'unknown',);
                errorMessage: error.message),
                timestamp: Date.now(),
                gameState: context.gameState }
            }),
            
            if(screenshot) {
            
                ;
            
            }
                console.log(`Screenshot captured for error: ${error.message)`});'
                return screenshot;''
            } catch (captureError) { ''
            console.warn('Failed to capture error screenshot:', (captureError as Error).message) }
        }
        
        return null;
    }
    
    /**
     * スクリーンショットのキャプチャ
     */
    public async captureScreenshot(metadata: Partial<ScreenshotMetadata> = { ): Promise<Screenshot | null> {
        try {
            let screenshotData: string | null = null,
            
            if(this.captureSettings.includeCanvas && this.gameEngine? .canvas) {
            
                // Canvasからスクリーンショットを取得
            
            }
                screenshotData = await this.captureCanvasScreenshot(); }
            } else if (this.captureSettings.includeDOM) { // DOM全体からスクリーンショットを取得（html2canvasなどが必要）
                screenshotData = await this.captureDOMScreenshot(); }
            }
            
            if (!screenshotData) return null;
             : undefined;
            const screenshot: Screenshot = { id: this.generateScreenshotId(),
                timestamp: Date.now(),
                metadata: {
                    ...metadata,
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight }
                    },
                    devicePixelRatio: window.devicePixelRatio || 1;
                },
                data: screenshotData,
                size: this.estimateDataSize(screenshotData),
            };
            
            // ストレージに保存
            this.storeScreenshot(screenshot);
            
            return screenshot;
            '';
        } catch (error) { ''
            console.warn('Screenshot capture failed:', (error as Error).message);
            return null; }
        }
    }
    
    /**
     * Canvasからスクリーンショットを取得
     */'
    private async captureCanvasScreenshot(): Promise<string> { ''
        if(!this.gameEngine? .canvas') {'
            ';'
        }'
            throw new Error('Canvas not available''); }
        }
        ';'
        try { const canvas = this.gameEngine.canvas;''
            const ctx = canvas.getContext('2d');
            
            // Canvasのサイズを取得
            const originalWidth = canvas.width;
            const originalHeight = canvas.height;
            
            // リサイズが必要かチェック
            const needsResize = originalWidth > this.captureSettings.maxWidth || ;
                              originalHeight > this.captureSettings.maxHeight;
            '';
            if(needsResize') {'
                // 一時的なCanvasでリサイズ
                const tempCanvas = document.createElement('canvas'');''
                const tempCtx = tempCanvas.getContext('2d');'
                '';
                if (!tempCtx') {'
            }'
                    throw new Error('Cannot get 2D context for temporary canvas'); }
                }
                
                const scale = Math.min(;
                    this.captureSettings.maxWidth / originalWidth);
                    this.captureSettings.maxHeight / originalHeight);
                
                tempCanvas.width = originalWidth * scale;
                tempCanvas.height = originalHeight * scale;
                
                tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
                
                return tempCanvas.toDataURL(;
                    this.captureSettings.format);
                    this.captureSettings.quality);
            } else {  return canvas.toDataURL(
                    this.captureSettings.format) }
                    this.captureSettings.quality); }
            } catch (error) { : undefined }
            throw new Error(`Canvas screenshot failed: ${(error as Error}).message}`);
        }
    }
    
    /**
     * DOM全体からスクリーンショットを取得
     * 注意: この機能はプライバシー上の理由で基本的に無効
     */'
    private async captureDOMScreenshot(): Promise<string> { // html2canvasライブラリが必要
        if (typeof (window as any').html2canvas === 'undefined'') {''
            throw new Error('html2canvas library not available'); }
        }
        
        try { const canvas = await (window as any).html2canvas(document.body, {
                width: this.captureSettings.maxWidth);
                height: this.captureSettings.maxHeight);
                useCORS: true,);
                allowTaint: false),
            
            return canvas.toDataURL(;
                this.captureSettings.format);
                this.captureSettings.quality); }
        } catch (error) {
            throw new Error(`DOM screenshot failed: ${(error as Error}).message}`);
        }
    }
    
    /**
     * スクリーンショットをストレージに保存
     */
    private storeScreenshot(screenshot: Screenshot): void { try {
            // サイズ制限チェック
            if(screenshot.size > this.maxStorageSize') {'
                '';
                console.warn('Screenshot too large, skipping storage');
            }
                return; }
            }
            
            // 配列に追加
            this.storedScreenshots.push(screenshot);
            
            // 最大数制限の適用
            while (this.storedScreenshots.length > this.maxScreenshots) { this.storedScreenshots.shift(); }
            }
            
            // 合計サイズの制限
            this.enforceStorageSizeLimit();
            
            // LocalStorageに保存（バイナリデータは除く）
            this.saveToLocalStorage();
            '';
        } catch (error) { ''
            console.warn('Failed to store screenshot:', (error as Error).message) }
        }
    }
    
    /**
     * ストレージサイズ制限の適用
     */
    private enforceStorageSizeLimit(): void { let totalSize = this.storedScreenshots.reduce((sum, screenshot) => sum + screenshot.size, 0);
        
        while(totalSize > this.maxStorageSize && this.storedScreenshots.length > 0) {
        
            const removed = this.storedScreenshots.shift();
            if (removed) {
        
        }
                totalSize -= removed.size; }
            }
        }
    }
    
    /**
     * LocalStorageに保存
     */
    private saveToLocalStorage(): void { try {
            // データサイズを考慮してメタデータのみ保存
            const metadataOnly: StoredScreenshot[] = this.storedScreenshots.map(screenshot => ({
                id: screenshot.id,
                timestamp: screenshot.timestamp);
                metadata: screenshot.metadata);
                size: screenshot.size,);
                hasData: !!screenshot.data))),
            
            localStorage.setItem(this.storageKey, JSON.stringify({)
                screenshots: metadataOnly),
                lastUpdated: Date.now() }
            });
        } catch (error) { ''
            if ((error as Error').name === 'QuotaExceededError'') {''
                console.warn('LocalStorage quota exceeded, clearing old screenshots');''
                this.clearOldScreenshots()';
                console.warn('Failed to save screenshots to localStorage:', (error as Error).message) }
            }
        }
    }
    
    /**
     * 保存されたスクリーンショットの読み込み
     */
    private loadStoredScreenshots(): void { try {
            const stored = localStorage.getItem(this.storageKey);
            if(stored) {
                const data = JSON.parse(stored);'
                // メタデータのみ復元（実際の画像データは除く）
                this.storedScreenshots = (data.screenshots || []).map((item: StoredScreenshot') => ({'
                    ...item,'
            }'
                    data: '' // 実際のデータは復元しない }
                });''
            } catch (error) { ''
            console.warn('Failed to load stored screenshots:', (error as Error).message);
            this.storedScreenshots = []; }
        }
    }
    
    /**
     * 古いスクリーンショットのクリア
     */
    public clearOldScreenshots(): void { const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        this.storedScreenshots = this.storedScreenshots.filter();
            screenshot => screenshot.timestamp > oneHourAgo);
        
        this.saveToLocalStorage(); }
    }
    
    /**
     * ストレージクリーンアップの設定
     */
    private setupStorageCleanup(): void { // 30分ごとにクリーンアップを実行
        setInterval(() => {  }
            this.clearOldScreenshots(); }
        }, 30 * 60 * 1000);
    }
    
    /**
     * データサイズの推定
     */
    private estimateDataSize(dataUrl: string): number { ''
        if (!dataUrl') return 0;
        ';
        // Base64エンコードされたデータのサイズを推定
        const base64Data = dataUrl.split(','')[1] || '';
        return Math.ceil(base64Data.length * 3 / 4); // Base64のオーバーヘッドを考慮 }
    }
    
    /**
     * スクリーンショットIDの生成
     */''
    private generateScreenshotId()';
        return 'screenshot_' + Date.now(') + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * スクリーンショット一覧の取得
     */
    public getScreenshots(filter: FilterOptions = { ): Screenshot[] {
        return this.storedScreenshots.filter(screenshot => { );
            if (filter.since && screenshot.timestamp < filter.since) return false;
            if (filter.until && screenshot.timestamp > filter.until) return false;
            if (filter.errorId && screenshot.metadata.errorId !== filter.errorId) return false; }
            return true; }
        });
    }
    
    /**
     * 特定のスクリーンショットの取得
     */
    public getScreenshot(id: string): Screenshot | undefined { return this.storedScreenshots.find(screenshot => screenshot.id === id); }
    }
    
    /**
     * スクリーンショット機能の有効/無効切り替え'
     */''
    public setEnabled(enabled: boolean'): void { this.isEnabled = enabled;' }'
        console.log(`Screenshot capture ${enabled ? 'enabled' : 'disabled')`});
    }
    
    /**
     * キャプチャ設定の更新'
     */''
    public updateSettings(newSettings: Partial<CaptureSettings>'): void { this.captureSettings = {
            ...this.captureSettings,
            ...newSettings }'
        };''
        console.log('Screenshot capture settings updated:', newSettings);
    }
    
    /**
     * スクリーンショットの手動削除
     */
    public deleteScreenshot(id: string): Screenshot | null { const index = this.storedScreenshots.findIndex(screenshot => screenshot.id === id);
        if(index !== -1) {
            const removed = this.storedScreenshots.splice(index, 1)[0];
        }
            this.saveToLocalStorage(); }
            console.log(`Screenshot deleted: ${id)`});
            return removed;
        }
        return null;
    }
    
    /**
     * 全スクリーンショットのクリア
     */'
    public clearAllScreenshots(): void { this.storedScreenshots = [];''
        this.saveToLocalStorage()';
        console.log('All screenshots cleared'); }
    }
    
    /**
     * ストレージ使用状況の取得
     */
    public getStorageInfo(): StorageInfo { const totalSize = this.storedScreenshots.reduce((sum, screenshot) => sum + screenshot.size, 0);
        
        return { count: this.storedScreenshots.length,
            totalSize,
            maxSize: this.maxStorageSize,
            utilizationPercent: (totalSize / this.maxStorageSize * 100).toFixed(2),
            oldestTimestamp: this.storedScreenshots.length > 0 ?   : undefined;
                Math.min(...this.storedScreenshots.map(s => s.timestamp) : null,
            newestTimestamp: this.storedScreenshots.length > 0 ?   : undefined };
                Math.max(...this.storedScreenshots.map(s => s.timestamp) : null }
        },
    }
    
    /**
     * クリーンアップ
     */'
    public destroy(): void { ''
        this.clearAllScreenshots()';
        console.log('ErrorScreenshotCapture destroyed''); }
    }
}'
'';
export default ErrorScreenshotCapture;