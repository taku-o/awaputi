/**
 * ScaledCoordinateManager - キャンバススケーリングに対応した座標管理システム
 * ResponsiveCanvasManagerと統合して一貫した座標変換を提供
 */

// 型定義
interface ScaledPosition { x: number,
    y: number  }

interface ScaledSize { width: number,
    height: number }

interface CanvasInfo { scaleFactor?: number,
    scale?: number,
    displayWidth: number,
    displayHeight: number,
    actualWidth: number,
    actualHeight: number,
    pixelRatio: number,
    baseWidth: number,
    baseHeight: number  }

interface ResponsiveCanvasManager { getScaledCoordinates?(baseX: number, baseY: number): ScaledPosition,
    getScaledSize?(baseWidth: number, baseHeight: number): ScaledSize,
    getCanvasInfo?(): CanvasInfo
    
interface DebugInfo { canvasInfo: CanvasInfo,
    scaleFactor: number }
    baseSize: { width: number,, height: number },
    scaleChangeCallbacksCount: number,
    timestamp: number;
}

type ScaleChangeCallback = () => void;

export class ScaledCoordinateManager {
    private responsiveCanvasManager: ResponsiveCanvasManager | null,
    private scaleChangeCallbacks: ScaleChangeCallback[],
    private baseWidth: number,
    private baseHeight: number,
    private, coordinateCache: Map<string, ScaledPosition>,
    private sizeCache: Map<string, ScaledSize>,
    private cacheMaxSize: number,
    private, lastScaleFactor: number | null,
    constructor(responsiveCanvasManager: ResponsiveCanvasManager | null) {

        this.responsiveCanvasManager = responsiveCanvasManager,
        this.scaleChangeCallbacks = [],
        
        // ベースデザインサイズ（800x600）
        this.baseWidth = 800,
        this.baseHeight = 600,
        
        // パフォーマンス最適化: 座標変換キャッシュ
        this.coordinateCache = new Map<string, ScaledPosition>(),
        this.sizeCache = new Map<string, ScaledSize>(),
        this.cacheMaxSize = 1000,
        this.lastScaleFactor = null }
        this.setupEventListeners(); }
    }
    
    /**
     * ベース座標をスケーリング済み座標に変換
     * @param baseX - ベースX座標
     * @param baseY - ベースY座標
     * @returns スケーリング済み座標
     */
    getScaledPosition(baseX: number, baseY: number): ScaledPosition { try {
            // キャッシュキーを生成 }
            const cacheKey = `${baseX},${baseY}`;
            const currentScaleFactor = this.getScaleFactor();
            
            // スケールファクターが変更された場合、キャッシュをクリア
            if(this.lastScaleFactor !== currentScaleFactor) {
                this.coordinateCache.clear() }
                this.lastScaleFactor = currentScaleFactor; }
            }
            
            // キャッシュから結果を確認
            if(this.coordinateCache.has(cacheKey) { return this.coordinateCache.get(cacheKey) }
            
            let result: ScaledPosition,
            if (this.responsiveCanvasManager && this.responsiveCanvasManager.getScaledCoordinates) { result = this.responsiveCanvasManager.getScaledCoordinates(baseX, baseY) } else {  // フォールバック: スケール係数を直接計算
                result = {
                    x: baseX * currentScaleFactor  }
                    y: baseY * currentScaleFactor 
    }
            
            // 結果をキャッシュに保存（サイズ制限を考慮）
            if (this.coordinateCache.size < this.cacheMaxSize) { this.coordinateCache.set(cacheKey, result) }
            
            return result;
        } catch (error) { console.warn('ScaledCoordinateManager: Position conversion failed, using base coordinates', error }
            return { x: baseX, y: baseY  }
    }
    
    /**
     * ベースサイズをスケーリング済みサイズに変換
     * @param baseWidth - ベース幅
     * @param baseHeight - ベース高さ
     * @returns スケーリング済みサイズ
     */
    getScaledSize(baseWidth: number, baseHeight: number): ScaledSize { try {
            // キャッシュキーを生成 }
            const cacheKey = `${baseWidth}x${baseHeight}`;
            const currentScaleFactor = this.getScaleFactor();
            
            // スケールファクターが変更された場合、キャッシュをクリア
            if (this.lastScaleFactor !== currentScaleFactor) { this.sizeCache.clear() }
            
            // キャッシュから結果を確認
            if(this.sizeCache.has(cacheKey) { return this.sizeCache.get(cacheKey) }
            
            let result: ScaledSize,
            if (this.responsiveCanvasManager && this.responsiveCanvasManager.getScaledSize) { result = this.responsiveCanvasManager.getScaledSize(baseWidth, baseHeight) } else {  // フォールバック: スケール係数を直接計算
                result = {
                    width: baseWidth * currentScaleFactor  }
                    height: baseHeight * currentScaleFactor 
    }
            
            // 結果をキャッシュに保存（サイズ制限を考慮）
            if (this.sizeCache.size < this.cacheMaxSize) { this.sizeCache.set(cacheKey, result) }
            ';

            return result;} catch (error) { console.warn('ScaledCoordinateManager: Size conversion failed, using base size', error }
            return { width: baseWidth, height: baseHeight  }
    }
    
    /**
     * キャンバス情報を取得
     * @returns キャンバス情報
     */
    getCanvasInfo(): CanvasInfo { try {
            if(this.responsiveCanvasManager && this.responsiveCanvasManager.getCanvasInfo) {
    
}
                return this.responsiveCanvasManager.getCanvasInfo();
            
            // フォールバック: 基本情報を返す
            return { scaleFactor: 1,
                displayWidth: this.baseWidth,
                displayHeight: this.baseHeight,
                actualWidth: this.baseWidth,
                actualHeight: this.baseHeight,
                pixelRatio: window.devicePixelRatio || 1,
    baseWidth: this.baseWidth };
                baseHeight: this.baseHeight 
    };'} catch (error) {
            console.warn('ScaledCoordinateManager: Canvas info retrieval failed, using defaults', error),
            return { scaleFactor: 1,
                displayWidth: this.baseWidth,
                displayHeight: this.baseHeight,
                actualWidth: this.baseWidth,
                actualHeight: this.baseHeight,
                pixelRatio: 1,
    baseWidth: this.baseWidth };
                baseHeight: this.baseHeight 
    }
    }
    
    /**
     * スケーリング済み座標をベース座標に逆変換
     * @param scaledX - スケーリング済みX座標
     * @param scaledY - スケーリング済みY座標
     * @returns ベース座標
     */
    getBasePosition(scaledX: number, scaledY: number): ScaledPosition { try {
            const scaleFactor = this.getScaleFactor(),
            if(scaleFactor === 0) {', ' }

                console.warn('ScaledCoordinateManager: Scale factor is 0, using original coordinates'); }'
                return { x: scaledX, y: scaledY  }
            
            return { x: scaledX / scaleFactor };
                y: scaledY / scaleFactor 
    };'} catch (error) { console.warn('ScaledCoordinateManager: Base position conversion failed, using original coordinates', error }
            return { x: scaledX, y: scaledY  }
    }
    
    /**
     * 座標の妥当性を検証
     * @param x - X座標
     * @param y - Y座標
     * @returns 妥当な座標かどうか'
     */''
    validateCoordinates(x: number, y: number): boolean { ''
        if(typeof, x !== 'number' || typeof, y !== 'number) {
    
}
            return false;
        
        if (!isFinite(x) || !isFinite(y) { return false }
        
        if (isNaN(x) || isNaN(y) { return false }
        
        return true;
    }
    
    /**
     * デバッグ情報を取得
     * @returns デバッグ用の座標システム情報
     */
    getDebugInfo(): DebugInfo { const canvasInfo = this.getCanvasInfo(),
        const scaleFactor = this.getScaleFactor(),
        
        return { canvasInfo };
            scaleFactor }
            baseSize: { width: this.baseWidth, height: this.baseHeight  },
            scaleChangeCallbacksCount: this.scaleChangeCallbacks.length,
    timestamp: Date.now();
        }
    
    /**
     * 現在のスケール係数を取得
     * @returns スケール係数
     */'
    getScaleFactor(): number { try {'
            const canvasInfo = this.getCanvasInfo('',
            // ResponsiveCanvasManagerは'scale'プロパティを使用するので、それを優先''
            return canvasInfo.scale || canvasInfo.scaleFactor || 1,' }'

        } catch (error) {
            console.warn('ScaledCoordinateManager: Scale factor retrieval failed, using 1.0', error',
            return 1,
    
    /**
     * スケール変更イベントのリスナーを登録
     * @param callback - コールバック関数'
     */''
    onScaleChange(callback: ScaleChangeCallback): void { ''
        if(typeof, callback === 'function' { }
            this.scaleChangeCallbacks.push(callback); }
}
    
    /**
     * スケール更新を実行
     */
    updateScale(): void { try {
            // ResponsiveCanvasManagerの直接呼び出しを避けて無限ループを防ぐ
            // ResponsiveCanvasManager自体がupdateCanvasSizeでこのメソッドを呼んでいるため
            
            // 登録されたコールバックを実行
            this.scaleChangeCallbacks.forEach(callback => { )
                try {) }
                    callback();' }'

                } catch (error) { console.warn('ScaledCoordinateManager: Scale change callback failed', error }

            }';} catch (error) { console.warn('ScaledCoordinateManager: Scale update failed', error }
    }
    
    /**
     * イベントリスナーをセットアップ
     */'
    private setupEventListeners(): void { // ResponsiveCanvasManagerのイベントにフック
        if(this.responsiveCanvasManager) {
            // ResponsiveCanvasManagerが既にリサイズイベントを処理しているので
            // ここでは追加のイベント処理のみ行う
        }

            window.addEventListener('orientationchange', () => {  }
                setTimeout(() => this.updateScale(), 100); }
            });
        }
    }
    
    /**
     * クリーンアップ'
     */''
    cleanup();