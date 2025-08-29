/**
 * ScaledRenderingContext - キャンバス描画コンテキストの自動スケーリングラッパー
 * ScaledCoordinateManagerと統合して一貫したスケーリング描画を提供
 */

export class ScaledRenderingContext {
    constructor(context, scaledCoordinateManager) {
        this.context = context;
        this.scaledCoordinateManager = scaledCoordinateManager;
        
        // 元のコンテキストの状態を保存するスタック
        this.stateStack = [];
    }
    
    /**
     * スケーリング済みテキストを描画
     * @param {string} text - 描画するテキスト
     * @param {number} baseX - ベースX座標
     * @param {number} baseY - ベースY座標
     */
    fillText(text, baseX, baseY) {
        try {
            const scaledPosition = this.scaledCoordinateManager.getScaledPosition(baseX, baseY);
            this.context.fillText(text, scaledPosition.x, scaledPosition.y);
        } catch (error) {
            console.warn('ScaledRenderingContext: fillText failed, using fallback', error);
            this.context.fillText(text, baseX, baseY);
        }
    }
    
    /**
     * スケーリング済み矩形を塗りつぶし
     * @param {number} baseX - ベースX座標
     * @param {number} baseY - ベースY座標
     * @param {number} baseWidth - ベース幅
     * @param {number} baseHeight - ベース高さ
     */
    fillRect(baseX, baseY, baseWidth, baseHeight) {
        try {
            const scaledPosition = this.scaledCoordinateManager.getScaledPosition(baseX, baseY);
            const scaledSize = this.scaledCoordinateManager.getScaledSize(baseWidth, baseHeight);
            this.context.fillRect(scaledPosition.x, scaledPosition.y, scaledSize.width, scaledSize.height);
        } catch (error) {
            console.warn('ScaledRenderingContext: fillRect failed, using fallback', error);
            this.context.fillRect(baseX, baseY, baseWidth, baseHeight);
        }
    }
    
    /**
     * スケーリング済み矩形の輪郭を描画
     * @param {number} baseX - ベースX座標
     * @param {number} baseY - ベースY座標
     * @param {number} baseWidth - ベース幅
     * @param {number} baseHeight - ベース高さ
     */
    strokeRect(baseX, baseY, baseWidth, baseHeight) {
        try {
            const scaledPosition = this.scaledCoordinateManager.getScaledPosition(baseX, baseY);
            const scaledSize = this.scaledCoordinateManager.getScaledSize(baseWidth, baseHeight);
            this.context.strokeRect(scaledPosition.x, scaledPosition.y, scaledSize.width, scaledSize.height);
        } catch (error) {
            console.warn('ScaledRenderingContext: strokeRect failed, using fallback', error);
            this.context.strokeRect(baseX, baseY, baseWidth, baseHeight);
        }
    }
    
    /**
     * スケーリング済み画像を描画
     * @param {HTMLImageElement} image - 描画する画像
     * @param {number} baseX - ベースX座標
     * @param {number} baseY - ベースY座標
     * @param {number} baseWidth - ベース幅（省略可能）
     * @param {number} baseHeight - ベース高さ（省略可能）
     */
    drawImage(image, baseX, baseY, baseWidth = null, baseHeight = null) {
        try {
            const scaledPosition = this.scaledCoordinateManager.getScaledPosition(baseX, baseY);
            
            if (baseWidth !== null && baseHeight !== null) {
                const scaledSize = this.scaledCoordinateManager.getScaledSize(baseWidth, baseHeight);
                this.context.drawImage(image, scaledPosition.x, scaledPosition.y, scaledSize.width, scaledSize.height);
            } else {
                this.context.drawImage(image, scaledPosition.x, scaledPosition.y);
            }
        } catch (error) {
            console.warn('ScaledRenderingContext: drawImage failed, using fallback', error);
            if (baseWidth !== null && baseHeight !== null) {
                this.context.drawImage(image, baseX, baseY, baseWidth, baseHeight);
            } else {
                this.context.drawImage(image, baseX, baseY);
            }
        }
    }
    
    /**
     * スケーリング済みフォントを設定
     * @param {number} baseFontSize - ベースフォントサイズ
     * @param {string} fontFamily - フォントファミリー
     */
    setScaledFont(baseFontSize, fontFamily = 'Arial') {
        try {
            const scaleFactor = this.scaledCoordinateManager.getScaleFactor();
            const scaledFontSize = baseFontSize * scaleFactor;
            
            // フォントの最小・最大サイズを制限
            const minFontSize = 8;
            const maxFontSize = 72;
            const clampedFontSize = Math.max(minFontSize, Math.min(maxFontSize, scaledFontSize));
            
            this.context.font = `${clampedFontSize}px ${fontFamily}`;
        } catch (error) {
            console.warn('ScaledRenderingContext: setScaledFont failed, using fallback', error);
            this.context.font = `${baseFontSize}px ${fontFamily}`;
        }
    }
    
    /**
     * スケーリング済み線幅を設定
     * @param {number} baseWidth - ベース線幅
     */
    setScaledLineWidth(baseWidth) {
        try {
            const scaleFactor = this.scaledCoordinateManager.getScaleFactor();
            const scaledWidth = baseWidth * scaleFactor;
            
            // 線幅の最小・最大を制限
            const minWidth = 0.5;
            const maxWidth = 20;
            const clampedWidth = Math.max(minWidth, Math.min(maxWidth, scaledWidth));
            
            this.context.lineWidth = clampedWidth;
        } catch (error) {
            console.warn('ScaledRenderingContext: setScaledLineWidth failed, using fallback', error);
            this.context.lineWidth = baseWidth;
        }
    }
    
    /**
     * コンテキスト状態を保存
     */
    save() {
        try {
            this.context.save();
            
            // 追加の状態情報を保存
            this.stateStack.push({
                timestamp: Date.now(),
                scaleFactor: this.scaledCoordinateManager.getScaleFactor()
            });
        } catch (error) {
            console.warn('ScaledRenderingContext: save failed', error);
        }
    }
    
    /**
     * コンテキスト状態を復元
     */
    restore() {
        try {
            this.context.restore();
            
            // 状態スタックからポップ
            if (this.stateStack.length > 0) {
                this.stateStack.pop();
            }
        } catch (error) {
            console.warn('ScaledRenderingContext: restore failed', error);
        }
    }
    
    /**
     * 元のコンテキストを取得
     * @returns {CanvasRenderingContext2D} 元のコンテキスト
     */
    getOriginalContext() {
        return this.context;
    }
    
    /**
     * コンテキストのプロパティを直接設定
     * @param {string} property - プロパティ名
     * @param {any} value - 設定値
     */
    setProperty(property, value) {
        try {
            this.context[property] = value;
        } catch (error) {
            console.warn(`ScaledRenderingContext: Setting property '${property}' failed`, error);
        }
    }
    
    /**
     * コンテキストのプロパティを取得
     * @param {string} property - プロパティ名
     * @returns {any} プロパティ値
     */
    getProperty(property) {
        try {
            return this.context[property];
        } catch (error) {
            console.warn(`ScaledRenderingContext: Getting property '${property}' failed`, error);
            return undefined;
        }
    }
    
    /**
     * パスベースの描画メソッド（座標変換付き）
     */
    
    /**
     * スケーリング済みパス開始点に移動
     * @param {number} baseX - ベースX座標
     * @param {number} baseY - ベースY座標
     */
    moveTo(baseX, baseY) {
        try {
            const scaledPosition = this.scaledCoordinateManager.getScaledPosition(baseX, baseY);
            this.context.moveTo(scaledPosition.x, scaledPosition.y);
        } catch (error) {
            console.warn('ScaledRenderingContext: moveTo failed, using fallback', error);
            this.context.moveTo(baseX, baseY);
        }
    }
    
    /**
     * スケーリング済み線を描画
     * @param {number} baseX - ベースX座標
     * @param {number} baseY - ベースY座標
     */
    lineTo(baseX, baseY) {
        try {
            const scaledPosition = this.scaledCoordinateManager.getScaledPosition(baseX, baseY);
            this.context.lineTo(scaledPosition.x, scaledPosition.y);
        } catch (error) {
            console.warn('ScaledRenderingContext: lineTo failed, using fallback', error);
            this.context.lineTo(baseX, baseY);
        }
    }
    
    /**
     * スケーリング済み円弧を描画
     * @param {number} baseX - ベース中心X座標
     * @param {number} baseY - ベース中心Y座標
     * @param {number} baseRadius - ベース半径
     * @param {number} startAngle - 開始角度
     * @param {number} endAngle - 終了角度
     * @param {boolean} counterclockwise - 反時計回り
     */
    arc(baseX, baseY, baseRadius, startAngle, endAngle, counterclockwise = false) {
        try {
            const scaledPosition = this.scaledCoordinateManager.getScaledPosition(baseX, baseY);
            const scaledSize = this.scaledCoordinateManager.getScaledSize(baseRadius, baseRadius);
            this.context.arc(scaledPosition.x, scaledPosition.y, scaledSize.width, startAngle, endAngle, counterclockwise);
        } catch (error) {
            console.warn('ScaledRenderingContext: arc failed, using fallback', error);
            this.context.arc(baseX, baseY, baseRadius, startAngle, endAngle, counterclockwise);
        }
    }
    
    // パスメソッドの代理
    beginPath() { this.context.beginPath(); }
    closePath() { this.context.closePath(); }
    fill() { this.context.fill(); }
    stroke() { this.context.stroke(); }
    
    /**
     * 現在のスケール情報を取得（デバッグ用）
     * @returns {Object} スケール情報
     */
    getScaleInfo() {
        return this.scaledCoordinateManager.getDebugInfo();
    }
}