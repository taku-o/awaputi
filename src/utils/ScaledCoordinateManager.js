/**
 * ScaledCoordinateManager - キャンバススケーリングに対応した座標管理システム
 * ResponsiveCanvasManagerと統合して一貫した座標変換を提供
 */

export class ScaledCoordinateManager {
    constructor(responsiveCanvasManager) {
        this.responsiveCanvasManager = responsiveCanvasManager;
        this.scaleChangeCallbacks = [];
        
        // ベースデザインサイズ（800x600）
        this.baseWidth = 800;
        this.baseHeight = 600;
        
        this.setupEventListeners();
    }
    
    /**
     * ベース座標をスケーリング済み座標に変換
     * @param {number} baseX - ベースX座標
     * @param {number} baseY - ベースY座標
     * @returns {Object} {x, y} - スケーリング済み座標
     */
    getScaledPosition(baseX, baseY) {
        try {
            if (this.responsiveCanvasManager && this.responsiveCanvasManager.getScaledCoordinates) {
                return this.responsiveCanvasManager.getScaledCoordinates(baseX, baseY);
            }
            
            // フォールバック: スケール係数を直接計算
            const scaleFactor = this.getScaleFactor();
            return {
                x: baseX * scaleFactor,
                y: baseY * scaleFactor
            };
        } catch (error) {
            console.warn('ScaledCoordinateManager: Position conversion failed, using base coordinates', error);
            return { x: baseX, y: baseY };
        }
    }
    
    /**
     * ベースサイズをスケーリング済みサイズに変換
     * @param {number} baseWidth - ベース幅
     * @param {number} baseHeight - ベース高さ
     * @returns {Object} {width, height} - スケーリング済みサイズ
     */
    getScaledSize(baseWidth, baseHeight) {
        try {
            if (this.responsiveCanvasManager && this.responsiveCanvasManager.getScaledSize) {
                return this.responsiveCanvasManager.getScaledSize(baseWidth, baseHeight);
            }
            
            // フォールバック: スケール係数を直接計算
            const scaleFactor = this.getScaleFactor();
            return {
                width: baseWidth * scaleFactor,
                height: baseHeight * scaleFactor
            };
        } catch (error) {
            console.warn('ScaledCoordinateManager: Size conversion failed, using base size', error);
            return { width: baseWidth, height: baseHeight };
        }
    }
    
    /**
     * キャンバス情報を取得
     * @returns {Object} キャンバス情報
     */
    getCanvasInfo() {
        try {
            if (this.responsiveCanvasManager && this.responsiveCanvasManager.getCanvasInfo) {
                return this.responsiveCanvasManager.getCanvasInfo();
            }
            
            // フォールバック: 基本情報を返す
            return {
                scaleFactor: 1,
                displayWidth: this.baseWidth,
                displayHeight: this.baseHeight,
                actualWidth: this.baseWidth,
                actualHeight: this.baseHeight,
                pixelRatio: window.devicePixelRatio || 1,
                baseWidth: this.baseWidth,
                baseHeight: this.baseHeight
            };
        } catch (error) {
            console.warn('ScaledCoordinateManager: Canvas info retrieval failed, using defaults', error);
            return {
                scaleFactor: 1,
                displayWidth: this.baseWidth,
                displayHeight: this.baseHeight,
                actualWidth: this.baseWidth,
                actualHeight: this.baseHeight,
                pixelRatio: 1,
                baseWidth: this.baseWidth,
                baseHeight: this.baseHeight
            };
        }
    }
    
    /**
     * スケーリング済み座標をベース座標に逆変換
     * @param {number} scaledX - スケーリング済みX座標
     * @param {number} scaledY - スケーリング済みY座標
     * @returns {Object} {x, y} - ベース座標
     */
    getBasePosition(scaledX, scaledY) {
        try {
            const scaleFactor = this.getScaleFactor();
            if (scaleFactor === 0) {
                console.warn('ScaledCoordinateManager: Scale factor is 0, using original coordinates');
                return { x: scaledX, y: scaledY };
            }
            
            return {
                x: scaledX / scaleFactor,
                y: scaledY / scaleFactor
            };
        } catch (error) {
            console.warn('ScaledCoordinateManager: Base position conversion failed, using original coordinates', error);
            return { x: scaledX, y: scaledY };
        }
    }
    
    /**
     * 座標の妥当性を検証
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {boolean} 妥当な座標かどうか
     */
    validateCoordinates(x, y) {
        if (typeof x !== 'number' || typeof y !== 'number') {
            return false;
        }
        
        if (!isFinite(x) || !isFinite(y)) {
            return false;
        }
        
        if (isNaN(x) || isNaN(y)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * デバッグ情報を取得
     * @returns {Object} デバッグ用の座標システム情報
     */
    getDebugInfo() {
        const canvasInfo = this.getCanvasInfo();
        const scaleFactor = this.getScaleFactor();
        
        return {
            canvasInfo,
            scaleFactor,
            baseSize: { width: this.baseWidth, height: this.baseHeight },
            scaleChangeCallbacksCount: this.scaleChangeCallbacks.length,
            timestamp: Date.now()
        };
    }
    
    /**
     * 現在のスケール係数を取得
     * @returns {number} スケール係数
     */
    getScaleFactor() {
        try {
            const canvasInfo = this.getCanvasInfo();
            return canvasInfo.scaleFactor || 1;
        } catch (error) {
            console.warn('ScaledCoordinateManager: Scale factor retrieval failed, using 1.0', error);
            return 1;
        }
    }
    
    /**
     * スケール変更イベントのリスナーを登録
     * @param {Function} callback - コールバック関数
     */
    onScaleChange(callback) {
        if (typeof callback === 'function') {
            this.scaleChangeCallbacks.push(callback);
        }
    }
    
    /**
     * スケール更新を実行
     */
    updateScale() {
        try {
            // ResponsiveCanvasManagerの更新を促す
            if (this.responsiveCanvasManager && typeof this.responsiveCanvasManager.handleResize === 'function') {
                this.responsiveCanvasManager.handleResize();
            }
            
            // 登録されたコールバックを実行
            this.scaleChangeCallbacks.forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.warn('ScaledCoordinateManager: Scale change callback failed', error);
                }
            });
        } catch (error) {
            console.warn('ScaledCoordinateManager: Scale update failed', error);
        }
    }
    
    /**
     * イベントリスナーをセットアップ
     */
    setupEventListeners() {
        // ResponsiveCanvasManagerのイベントにフック
        if (this.responsiveCanvasManager) {
            // ResponsiveCanvasManagerが既にリサイズイベントを処理しているので
            // ここでは追加のイベント処理のみ行う
            window.addEventListener('orientationchange', () => {
                setTimeout(() => this.updateScale(), 100);
            });
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.scaleChangeCallbacks = [];
    }
}