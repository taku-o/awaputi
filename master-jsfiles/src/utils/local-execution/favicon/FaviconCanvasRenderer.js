/**
 * FaviconCanvasRenderer - Faviconレンダリング専用クラス
 * Canvas描画処理を担当
 * 
 * @author Claude Code
 * @version 1.0.0
 */

export default class FaviconCanvasRenderer {
    /**
     * Canvas要素とコンテキストを作成
     * @param {number} size - キャンバスサイズ
     * @returns {Object} Canvas要素とコンテキスト
     */
    static createCanvas(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        return { canvas, ctx };
    }

    /**
     * ファビコンをCanvas上に描画
     * @param {CanvasRenderingContext2D} ctx - Canvas コンテキスト
     * @param {number} size - サイズ
     * @param {Object} config - 設定オブジェクト
     */
    static renderFavicon(ctx, size, config) {
        const {
            backgroundColor = '#2196F3',
            textColor = '#FFFFFF',
            fontFamily = 'Arial, sans-serif',
            text = 'B'
        } = config;

        // 背景を描画
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size, size);

        // 泡のような円を描画
        ctx.fillStyle = '#64B5F6';
        ctx.beginPath();
        ctx.arc(size * 0.3, size * 0.3, size * 0.15, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#90CAF9';
        ctx.beginPath();
        ctx.arc(size * 0.7, size * 0.4, size * 0.1, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#BBDEFB';
        ctx.beginPath();
        ctx.arc(size * 0.5, size * 0.7, size * 0.08, 0, 2 * Math.PI);
        ctx.fill();

        // テキストを描画
        const fontSize = Math.floor(size * 0.5);
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, size / 2, size / 2);
    }

    /**
     * CanvasをData URLに変換
     * @param {HTMLCanvasElement} canvas - Canvas要素
     * @param {string} format - 画像フォーマット ('png' または 'ico')
     * @returns {string} Data URL
     */
    static canvasToDataURL(canvas, format = 'png') {
        if (format === 'ico') {
            // ICO形式の場合はPNGに変換してからICOヘッダーを付加
            return this._convertToICO(canvas);
        }
        return canvas.toDataURL(`image/${format}`);
    }

    /**
     * Canvas要素をICO形式に変換
     * @private
     * @param {HTMLCanvasElement} canvas - Canvas要素
     * @returns {string} ICO形式のData URL
     */
    static _convertToICO(canvas) {
        // 簡易ICO変換（実際の実装では複数サイズを含むICOを作成）
        const pngData = canvas.toDataURL('image/png');
        
        // ICOヘッダーを付加（簡易版）
        const base64Data = pngData.replace(/^data:image\/png;base64,/, '');
        const icoHeader = 'data:image/x-icon;base64,';
        
        return icoHeader + base64Data;
    }

    /**
     * SVGフォールバック生成
     * @param {number} size - サイズ
     * @param {Object} config - 設定オブジェクト
     * @returns {string} SVG Data URL
     */
    static generateSVGFallback(size, config) {
        const {
            backgroundColor = '#2196F3',
            textColor = '#FFFFFF',
            text = 'B'
        } = config;

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                <rect width="${size}" height="${size}" fill="${backgroundColor}"/>
                <circle cx="${size * 0.3}" cy="${size * 0.3}" r="${size * 0.15}" fill="#64B5F6" opacity="0.8"/>
                <circle cx="${size * 0.7}" cy="${size * 0.4}" r="${size * 0.1}" fill="#90CAF9" opacity="0.6"/>
                <circle cx="${size * 0.5}" cy="${size * 0.7}" r="${size * 0.08}" fill="#BBDEFB" opacity="0.4"/>
                <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="central" 
                      fill="${textColor}" font-family="Arial, sans-serif" font-weight="bold" 
                      font-size="${Math.floor(size * 0.5)}">${text}</text>
            </svg>
        `;

        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    /**
     * 複数サイズのファビコンを一括生成
     * @param {Array<number>} sizes - サイズ配列
     * @param {Object} config - 設定オブジェクト
     * @returns {Map<number, string>} サイズごとのData URL マップ
     */
    static generateMultipleSizes(sizes, config) {
        const results = new Map();
        
        for (const size of sizes) {
            try {
                const { canvas, ctx } = this.createCanvas(size);
                this.renderFavicon(ctx, size, config);
                const dataURL = this.canvasToDataURL(canvas, 'png');
                results.set(size, dataURL);
            } catch (error) {
                console.warn(`Failed to generate favicon for size ${size}:`, error);
                // フォールバックとしてSVGを生成
                const svgDataURL = this.generateSVGFallback(size, config);
                results.set(size, svgDataURL);
            }
        }
        
        return results;
    }
}