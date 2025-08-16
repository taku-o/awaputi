/**
 * CoordinateCalculator - 統一的な座標計算ユーティリティクラス
 * 
 * ベース座標系（1920x1080）から実際のCanvas座標系への変換を担当し、
 * 要素の中央配置、スケーリング、テキスト境界の検証などを提供
 */

// 型定義
interface Coordinates {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

interface SafeArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface VerticalPosition {
    y: number;
    height: number;
}

interface DebugInfo {
    canvasSize: Size;
    baseSize: Size;
    scale: {
        x: number;
        y: number;
        uniform: number;
    };
}

export class CoordinateCalculator {
    private canvasWidth: number;
    private canvasHeight: number;
    private baseWidth: number;
    private baseHeight: number;
    
    // スケール係数
    private scaleX: number;
    private scaleY: number;
    private uniformScale: number;

    constructor(canvasWidth: number, canvasHeight: number, baseWidth: number = 1920, baseHeight: number = 1080) {
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
    updateCanvasDimensions(width: number, height: number): void {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.scaleX = width / this.baseWidth;
        this.scaleY = height / this.baseHeight;
        this.uniformScale = Math.min(this.scaleX, this.scaleY);
    }
    
    /**
     * ベース座標系から実際のCanvas座標系への変換
     */
    toCanvasCoordinates(baseX: number, baseY: number): Coordinates {
        return {
            x: baseX * this.scaleX,
            y: baseY * this.scaleY
        };
    }
    
    /**
     * ベース座標系のサイズを実際のCanvasサイズに変換
     */
    toCanvasSize(baseWidth: number, baseHeight: number): Size {
        return {
            width: baseWidth * this.scaleX,
            height: baseHeight * this.scaleY
        };
    }
    
    /**
     * 要素を水平中央に配置するためのX座標を計算
     */
    getCenterX(elementWidth: number): number {
        const scaledWidth = elementWidth * this.scaleX;
        return (this.canvasWidth - scaledWidth) / 2;
    }
    
    /**
     * 要素を垂直中央に配置するためのY座標を計算
     */
    getCenterY(elementHeight: number): number {
        const scaledHeight = elementHeight * this.scaleY;
        return (this.canvasHeight - scaledHeight) / 2;
    }
    
    /**
     * テキストを水平中央に配置するためのX座標を計算
     * textAlign = 'center'と併用することを想定
     * @param {CanvasRenderingContext2D} context - Canvas 2Dコンテキスト
     * @param {string} text - 描画するテキスト
     */
    getTextCenterX(context: CanvasRenderingContext2D, text: string): number {
        // textAlign = 'center'の場合、Canvas表示領域の実際の中央座標を返す
        // transform scaleに関係なく、常に表示領域の中央を指定
        const canvas = context.canvas;
        const displayWidth = (canvas as HTMLCanvasElement).clientWidth || this.canvasWidth;
        
        // 表示座標系での中央位置を計算
        return displayWidth / 2;
    }
    
    /**
     * フォントサイズをスケーリング
     */
    scaleFontSize(baseFontSize: number): number {
        return Math.floor(baseFontSize * this.uniformScale);
    }
    
    /**
     * テキストの境界を検証し、Canvas内に収まるか確認
     * textAlign = 'center'を想定した境界チェック
     * @returns {boolean} テキストがCanvas内に収まる場合true
     */
    validateTextBounds(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number | null = null): boolean {
        const metrics = context.measureText(text);
        const textWidth = metrics.width;
        
        // textAlign = 'center'の場合、xは中央座標なので左右に半分ずつ伸びる
        const textLeft = x - textWidth / 2;
        const textRight = x + textWidth / 2;
        
        // 水平方向の検証
        if (textLeft < 0 || textRight > this.canvasWidth) {
            return false;
        }
        
        // 最大幅の検証
        if (maxWidth && textWidth > maxWidth) {
            return false;
        }
        
        // 垂直方向の検証（概算）
        const fontMatch = context.font.match(/(\d+)/);
        const fontSize = fontMatch ? parseInt(fontMatch[1]) : 16;
        if (y - fontSize < 0 || y > this.canvasHeight) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 矩形要素の境界を検証
     */
    validateElementBounds(x: number, y: number, width: number, height: number): boolean {
        return x >= 0 && 
               y >= 0 && 
               x + width <= this.canvasWidth && 
               y + height <= this.canvasHeight;
    }
    
    /**
     * マージンを考慮した安全な配置領域を取得
     */
    getSafeArea(margin: number = 20): SafeArea {
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
    distributeVertically(itemCount: number, itemHeight: number, startY: number, endY: number): VerticalPosition[] {
        const totalHeight = endY - startY;
        const scaledItemHeight = itemHeight * this.scaleY;
        const totalItemsHeight = itemCount * scaledItemHeight;
        const totalSpacing = totalHeight - totalItemsHeight;
        const spacing = totalSpacing / (itemCount + 1);
        
        const positions: VerticalPosition[] = [];
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
    getDebugInfo(): DebugInfo {
        return {
            canvasSize: { width: this.canvasWidth, height: this.canvasHeight },
            baseSize: { width: this.baseWidth, height: this.baseHeight },
            scale: { x: this.scaleX, y: this.scaleY, uniform: this.uniformScale }
        };
    }

    // Getters for external access
    getCanvasWidth(): number {
        return this.canvasWidth;
    }

    getCanvasHeight(): number {
        return this.canvasHeight;
    }

    getScaleX(): number {
        return this.scaleX;
    }

    getScaleY(): number {
        return this.scaleY;
    }

    getUniformScale(): number {
        return this.uniformScale;
    }
}