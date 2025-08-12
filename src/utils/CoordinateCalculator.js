/**
 * CoordinateCalculator - 統一的な座標計算ユーティリティクラス
 * 
 * ベース座標系（1920x1080）から実際のCanvas座標系への変換を担当し、
 * 要素の中央配置、スケーリング、テキスト境界の検証などを提供
 */
export class CoordinateCalculator {
    constructor(canvasWidth, canvasHeight, baseWidth = 1920, baseHeight = 1080) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.baseWidth = baseWidth;
        this.baseHeight = baseHeight;
        
        // スケール係数の計算
        this.scaleX = canvasWidth / baseWidth;
        this.scaleY = canvasHeight / baseHeight;
        
        // アスペクト比を保持したスケール
        this.uniformScale = Math.min(this.scaleX, this.scaleY);
    }
    
    /**
     * Canvas寸法の更新
     */
    updateCanvasDimensions(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.scaleX = width / this.baseWidth;
        this.scaleY = height / this.baseHeight;
        this.uniformScale = Math.min(this.scaleX, this.scaleY);
    }
    
    /**
     * ベース座標系から実際のCanvas座標系への変換
     */
    toCanvasCoordinates(baseX, baseY) {
        return {
            x: baseX * this.scaleX,
            y: baseY * this.scaleY
        };
    }
    
    /**
     * ベース座標系のサイズを実際のCanvasサイズに変換
     */
    toCanvasSize(baseWidth, baseHeight) {
        return {
            width: baseWidth * this.scaleX,
            height: baseHeight * this.scaleY
        };
    }
    
    /**
     * 要素を水平中央に配置するためのX座標を計算
     */
    getCenterX(elementWidth) {
        const scaledWidth = elementWidth * this.scaleX;
        return (this.canvasWidth - scaledWidth) / 2;
    }
    
    /**
     * 要素を垂直中央に配置するためのY座標を計算
     */
    getCenterY(elementHeight) {
        const scaledHeight = elementHeight * this.scaleY;
        return (this.canvasHeight - scaledHeight) / 2;
    }
    
    /**
     * テキストを水平中央に配置するためのX座標を計算
     * @param {CanvasRenderingContext2D} context - Canvas 2Dコンテキスト
     * @param {string} text - 描画するテキスト
     */
    getTextCenterX(context, text) {
        const metrics = context.measureText(text);
        return (this.canvasWidth - metrics.width) / 2;
    }
    
    /**
     * フォントサイズをスケーリング
     */
    scaleFontSize(baseFontSize) {
        return Math.floor(baseFontSize * this.uniformScale);
    }
    
    /**
     * テキストの境界を検証し、Canvas内に収まるか確認
     * @returns {boolean} テキストがCanvas内に収まる場合true
     */
    validateTextBounds(context, text, x, y, maxWidth = null) {
        const metrics = context.measureText(text);
        const textWidth = metrics.width;
        
        // 水平方向の検証
        if (x < 0 || x + textWidth > this.canvasWidth) {
            return false;
        }
        
        // 最大幅の検証
        if (maxWidth && textWidth > maxWidth) {
            return false;
        }
        
        // 垂直方向の検証（概算）
        const fontSize = parseInt(context.font);
        if (y - fontSize < 0 || y > this.canvasHeight) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 矩形要素の境界を検証
     */
    validateElementBounds(x, y, width, height) {
        return x >= 0 && 
               y >= 0 && 
               x + width <= this.canvasWidth && 
               y + height <= this.canvasHeight;
    }
    
    /**
     * マージンを考慮した安全な配置領域を取得
     */
    getSafeArea(margin = 20) {
        const scaledMargin = margin * this.uniformScale;
        return {
            x: scaledMargin,
            y: scaledMargin,
            width: this.canvasWidth - (scaledMargin * 2),
            height: this.canvasHeight - (scaledMargin * 2)
        };
    }
    
    /**
     * 複数要素を垂直方向に均等配置するための位置を計算
     */
    distributeVertically(itemCount, itemHeight, startY, endY) {
        const totalHeight = endY - startY;
        const scaledItemHeight = itemHeight * this.scaleY;
        const totalItemsHeight = itemCount * scaledItemHeight;
        const totalSpacing = totalHeight - totalItemsHeight;
        const spacing = totalSpacing / (itemCount + 1);
        
        const positions = [];
        let currentY = startY + spacing;
        
        for (let i = 0; i < itemCount; i++) {
            positions.push({
                y: currentY,
                height: scaledItemHeight
            });
            currentY += scaledItemHeight + spacing;
        }
        
        return positions;
    }
    
    /**
     * デバッグ情報の取得
     */
    getDebugInfo() {
        return {
            canvasSize: { width: this.canvasWidth, height: this.canvasHeight },
            baseSize: { width: this.baseWidth, height: this.baseHeight },
            scale: { x: this.scaleX, y: this.scaleY, uniform: this.uniformScale }
        };
    }
}