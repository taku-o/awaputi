/**
 * FaviconCanvasRenderer - Faviconレンダリング専用クラス
 * Canvas描画処理を担当
 * 
 * @author Claude Code
 * @version 1.0.0
 */

// Type definitions
interface CanvasContext { canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D;
    }
}

interface FaviconConfig { backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    text?: string; }
}

interface FaviconRenderConfig { backgroundColor: string,
    textColor: string,
    fontFamily: string,
    text: string; }
}

type ImageFormat = 'png' | 'ico';

export default class FaviconCanvasRenderer { /**
     * Canvas要素とコンテキストを作成
     * @param size - キャンバスサイズ
     * @returns Canvas要素とコンテキスト'
     */''
    static createCanvas(size: number'): CanvasContext {''
        const canvas = document.createElement('canvas'');
        canvas.width = size;'
        canvas.height = size;''
        const ctx = canvas.getContext('2d');'
        '';
        if(!ctx') {'
            ';
        }'
            throw new Error('Could not get 2D context from canvas'); }
        }
        
        return { canvas, ctx };
    }

    /**
     * ファビコンをCanvas上に描画
     * @param ctx - Canvas コンテキスト
     * @param size - サイズ
     * @param config - 設定オブジェクト'
     */''
    static renderFavicon(ctx: CanvasRenderingContext2D, size: number, config: FaviconConfig'): void { const renderConfig: FaviconRenderConfig = {''
            backgroundColor: config.backgroundColor || '#2196F3','';
            textColor: config.textColor || '#FFFFFF','';
            fontFamily: config.fontFamily || 'Arial, sans-serif','';
            text: config.text || 'B' }
        },

        // 背景を描画'
        ctx.fillStyle = renderConfig.backgroundColor;''
        ctx.fillRect(0, 0, size, size');
';
        // 泡のような円を描画''
        ctx.fillStyle = '#64B5F6';
        ctx.beginPath();'
        ctx.arc(size * 0.3, size * 0.3, size * 0.15, 0, 2 * Math.PI);''
        ctx.fill('')';
        ctx.fillStyle = '#90CAF9';)
        ctx.beginPath();'
        ctx.arc(size * 0.7, size * 0.4, size * 0.1, 0, 2 * Math.PI);''
        ctx.fill('')';
        ctx.fillStyle = '#BBDEFB';)
        ctx.beginPath();
        ctx.arc(size * 0.5, size * 0.7, size * 0.08, 0, 2 * Math.PI);
        ctx.fill();
';
        // テキストを描画''
        const fontSize = Math.floor(size * 0.5');
        ctx.font = `bold ${fontSize}px ${renderConfig.fontFamily}`;'
        ctx.fillStyle = renderConfig.textColor;''
        ctx.textAlign = 'center';''
        ctx.textBaseline = 'middle';''
        ctx.fillText(renderConfig.text, size / 2, size / 2');
    }

    /**
     * CanvasをData URLに変換'
     * @param canvas - Canvas要素''
     * @param format - 画像フォーマット ('png' または 'ico'')
     * @returns Data URL'
     */''
    static canvasToDataURL(canvas: HTMLCanvasElement, format: ImageFormat = 'png''): string { ''
        if(format === 'ico') {
            // ICO形式の場合はPNGに変換してからICOヘッダーを付加
        }
            return this._convertToICO(canvas); }
        }
        return canvas.toDataURL(`image/${format)`});
    }

    /**
     * Canvas要素をICO形式に変換
     * @private
     * @param canvas - Canvas要素
     * @returns ICO形式のData URL'
     */''
    private static _convertToICO(canvas: HTMLCanvasElement'): string { // 簡易ICO変換（実際の実装では複数サイズを含むICOを作成）''
        const pngData = canvas.toDataURL('image/png'');
        ';
        // ICOヘッダーを付加（簡易版）''
        const base64Data = pngData.replace(/^data:image\/png;base64,/, ''');''
        const icoHeader = 'data:image/x-icon;base64,';
        
        return icoHeader + base64Data; }
    }

    /**
     * SVGフォールバック生成
     * @param size - サイズ
     * @param config - 設定オブジェクト
     * @returns SVG Data URL'
     */''
    static generateSVGFallback(size: number, config: FaviconConfig'): string { const renderConfig: FaviconRenderConfig = {''
            backgroundColor: config.backgroundColor || '#2196F3','';
            textColor: config.textColor || '#FFFFFF','';
            fontFamily: config.fontFamily || 'Arial, sans-serif','';
            text: config.text || 'B' }
        },
';
        const svg = `'';
            <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">""
                <rect width="${size}" height="${size}" fill="${renderConfig.backgroundColor}"/>""
                <circle cx="${size * 0.3}" cy="${size * 0.3}" r="${size * 0.15}" fill="#64B5F6" opacity="0.8"/>""
                <circle cx="${size * 0.7}" cy="${size * 0.4}" r="${size * 0.1}" fill="#90CAF9" opacity="0.6"/>""
                <circle cx="${size * 0.5}" cy="${size * 0.7}" r="${size * 0.08}" fill="#BBDEFB" opacity="0.4"/>""
                <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="central" ""
                      fill="${renderConfig.textColor}" font-family="Arial, sans-serif" font-weight="bold" ""
                      font-size="${Math.floor(size * 0.5"})}">${renderConfig.text}</text>
            </svg>;
        `;"
"";
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    /**
     * 複数サイズのファビコンを一括生成
     * @param sizes - サイズ配列
     * @param config - 設定オブジェクト
     * @returns サイズごとのData URL マップ
     */
    static generateMultipleSizes(sizes: number[], config: FaviconConfig): Map<number, string> { const results = new Map<number, string>();
        
        for(const size of sizes) {
        
            
        
        }
            try { }'
                const { canvas, ctx } = this.createCanvas(size);''
                this.renderFavicon(ctx, size, config');''
                const dataURL = this.canvasToDataURL(canvas, 'png');
                results.set(size, dataURL);
            } catch (error) {
                console.warn(`Failed to generate favicon for size ${size}:`, error);
                // フォールバックとしてSVGを生成'
                const svgDataURL = this.generateSVGFallback(size, config);''
                results.set(size, svgDataURL');
            }
        }
        
        return results;'
    }''
}