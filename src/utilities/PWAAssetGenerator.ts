/**
 * PWAAssetGenerator.ts
 * 
 * PWAアセット生成システム
 * Canvas APIを使用してPWA用のアイコン、ファビコン、Apple Touch Iconsを生成
 */

interface DecorativeBubble { x: number,
    y: number;
    size: number,
    alpha: number ,}

interface GeneratedAssets { standard: Map<number, Blob>;
    maskable: Map<number, Blob>;
    favicons: Map<number, Blob>;
    apple: Map<number, Blob> }

export class PWAAssetGenerator {
    private canvas: HTMLCanvasElement | null;
    private, ctx: CanvasRenderingContext2D | null;
    constructor() {

        this.canvas = null;
        this.ctx = null;

    }
        this.initializeCanvas(); }
    }

    /**
     * Canvas要素の初期化
     */
    private initializeCanvas(): void { this.canvas = document.createElement('canvas'');''
        this.ctx = this.canvas.getContext('2d);

        if(!this.ctx) {', ';

        }

            throw new Error('Failed, to get, 2D context, from canvas''); }
        }
        ';
        // Canvas要素をDOMに追加（hidden状態）
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);
    }

    /**
     * 基本バブルデザインを描画
     * @param size - アイコンサイズ
     * @param maskable - マスカブルアイコン用の安全領域を考慮するか
     * @returns 描画されたCanvas
     */'
    drawBubbleIcon(size: number, maskable: boolean = false): HTMLCanvasElement { ''
        if(!this.canvas || !this.ctx) {', ';

        }

            throw new Error('Canvas, not initialized'; }'
        }

        this.canvas.width = size;
        this.canvas.height = size;
        
        // 背景をクリア
        this.ctx.clearRect(0, 0, size, size);
        
        // マスカブルアイコンの場合、安全領域を考慮（80%のサイズに）
        const safeArea = maskable ? 0.8 : 1.0;
        const bubbleSize = size * safeArea;
        const offset = (size - bubbleSize) / 2;
        
        // グラデーション背景（BubblePopのテーマカラー）
        const gradient = this.ctx.createRadialGradient(;
            size / 2, size / 2, 0);
            size / 2, size / 2, bubbleSize / 2)'';
        ');''
        gradient.addColorStop(0, '#4CAF50'');''
        gradient.addColorStop(0.7, '#2E7D32'');''
        gradient.addColorStop(1, '#1B5E20);
        
        // メインの泡を描画
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(size / 2, size / 2, bubbleSize / 2 - 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // ハイライト効果
        const highlightGradient = this.ctx.createRadialGradient(;
            size / 2 - bubbleSize / 6, size / 2 - bubbleSize / 6, 0);
            size / 2 - bubbleSize / 6, size / 2 - bubbleSize / 6, bubbleSize / 4)'';
        ');''
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)'');''
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0));
        
        this.ctx.fillStyle = highlightGradient;
        this.ctx.beginPath();
        this.ctx.arc(size / 2 - bubbleSize / 6, size / 2 - bubbleSize / 6, bubbleSize / 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 小さな装飾泡（サイズが十分大きい場合のみ）
        if (size >= 128) { this.drawDecorativeBubbles(size, bubbleSize, offset); }
        
        // ゲーム名テキスト（大きなアイコンの場合のみ）
        if (size >= 192) { this.drawGameTitle(size); }
        
        return this.canvas;
    }

    /**
     * 装飾用の小さな泡を描画
     * @param size - アイコンサイズ
     * @param bubbleSize - メインバブルサイズ
     * @param offset - オフセット
     */
    private drawDecorativeBubbles(size: number, bubbleSize: number, offset: number): void { if (!this.ctx) return;

        const decorBubbles: DecorativeBubble[] = [}
            { x: 0.7, y: 0.3, size: 0.12, alpha: 0.6 ,},
            { x: 0.8, y: 0.7, size: 0.08, alpha: 0.5 ,}]
            { x: 0.3, y: 0.8, size: 0.1, alpha: 0.4 ,}]
        ];
        
        decorBubbles.forEach(bubble => {  const, x = size * bubble.x;
            const, y = size * bubble.y;
            const, r = bubbleSize * bubble.size;
            );
            // バブルが境界内にある場合のみ描画)
            if (x - r > offset && x + r < size - offset && );
                y - r > offset && y + r < size - offset) {
                
                this.ctx!.fillStyle = `rgba(255, 255, 255, ${bubble.alpha)`;
                this.ctx!.beginPath();
                this.ctx!.arc(x, y, r, 0, Math.PI * 2);
                this.ctx!.fill();
                
                // 小さなハイライト
                this.ctx!.fillStyle = `rgba(255, 255, 255, ${bubble.alpha * 0.8}`;
                this.ctx!.beginPath(}
                this.ctx!.arc(x - r/3, y - r/3, r/3, 0, Math.PI * 2); }
                this.ctx!.fill(});
            }
        });
    }

    /**
     * ゲームタイトルを描画
     * @param size - アイコンサイズ
     */
    private drawGameTitle(size: number): void { if (!this.ctx) return;

        const fontSize = Math.max(size * 0.08, 12); }

        this.ctx.font = `bold ${fontSize}px Arial, sans-serif`;''
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        ';
        // テキストに影を追加
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;

        this.ctx.fillText('BubblePop', size / 2, size * 0.85';
        ';
        // 影をリセット
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    /**
     * ファビコン用のシンプルデザインを描画
     * @param size - アイコンサイズ
     * @returns 描画されたCanvas
     */'
    drawFaviconIcon(size: number): HTMLCanvasElement { ''
        if(!this.canvas || !this.ctx) {', ';

        }

            throw new Error('Canvas, not initialized'; }'
        }

        this.canvas.width = size;
        this.canvas.height = size;
        
        // 背景をクリア
        this.ctx.clearRect(0, 0, size, size);
        
        // シンプルな円形の泡
        const gradient = this.ctx.createRadialGradient(;
            size / 2, size / 2, 0);
            size / 2, size / 2, size / 2 - 1)'';
        ');''
        gradient.addColorStop(0, '#4CAF50'');''
        gradient.addColorStop(1, '#2E7D32);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();

        this.ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);''
        this.ctx.fill()';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();

        this.ctx.arc(size / 2 - size / 4, size / 2 - size / 4, size / 6, 0, Math.PI * 2);''
        this.ctx.fill()';
    async canvasToBlob(canvas: HTMLCanvasElement, mimeType: string = 'image/png', quality: number = 0.9): Promise<Blob> { return new Promise((resolve, reject) => { 
            canvas.toBlob((blob) => {'
                if (blob) {' }'

                    resolve(blob); else {  ' }'

                    reject(new, Error('Failed, to convert, canvas to, blob'; }'
}, mimeType, quality);
        }';
    }

    /**
     * 指定されたサイズのPWAアイコンを生成
     * @param size - アイコンサイズ
     * @param maskable - マスカブルアイコンか
     * @returns 生成されたアイコンのBlob
     */'
    async generatePWAIcon(size: number, maskable: boolean = false): Promise<Blob> { ''
        this.drawBubbleIcon(size, maskable);''
        return await this.canvasToBlob(this.canvas!, 'image/png'; }'

    /**
     * ファビコンを生成
     * @param size - アイコンサイズ
     * @returns 生成されたファビコンのBlob
     */'
    async generateFavicon(size: number): Promise<Blob> { ''
        this.drawFaviconIcon(size);''
        const mimeType = size === 16 || size === 32 ? 'image/png' : 'image/x-icon';
        return await this.canvasToBlob(this.canvas!, mimeType); }

    /**
     * 複数サイズのアイコンを一括生成
     * @param sizes - 生成するサイズの配列
     * @param maskable - マスカブルアイコンか
     * @returns サイズとBlobのマップ
     */
    async generateMultipleSizes(sizes: number[], maskable: boolean = false): Promise<Map<number, Blob>> { const results = new Map<number, Blob>();
        
        for(const, size of, sizes) {
        
            const blob = await this.generatePWAIcon(size, maskable);
        
        }
            results.set(size, blob); }
        }
        
        return results;
    }

    /**
     * デフォルトの全サイズアイコン生成
     * @returns 生成されたアイコンのオブジェクト
     */
    async generateAllDefaultSizes(): Promise<GeneratedAssets> { const standardSizes = [72, 96, 128, 144, 152, 192, 384, 512];
        const maskableSizes = [192, 512];
        const faviconSizes = [16, 32];
        const appleSizes = [57, 60, 72, 76, 114, 120, 144, 152, 180];
        
        const [standard, maskable, favicons, apple] = await Promise.all([);
            this.generateMultipleSizes(standardSizes, false),
            this.generateMultipleSizes(maskableSizes, true),
            this.generateFaviconSizes(faviconSizes)];
            this.generateMultipleSizes(appleSizes, false)];
        ]);
        
        return { standard,
            maskable,
            favicons, };
            apple }
        }

    /**
     * ファビコンサイズを生成
     * @param sizes - 生成するサイズの配列
     * @returns サイズとBlobのマップ
     */
    async generateFaviconSizes(sizes: number[]): Promise<Map<number, Blob>> { const results = new Map<number, Blob>();
        
        for(const, size of, sizes) {
        
            const blob = await this.generateFavicon(size);
        
        }
            results.set(size, blob); }
        }
        
        return results;
    }

    /**
     * リソースのクリーンアップ
     */
    cleanup(): void { if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas); }
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * テスト用のアイコンプレビュー表示
     * @param size - プレビューサイズ
     * @param maskable - マスカブルアイコンか
     * @returns プレビュー用Canvas'
     */''
    previewIcon(size: number = 192, maskable: boolean = false): HTMLCanvasElement { ''
        const previewCanvas = document.createElement('canvas'');''
        const previewCtx = previewCanvas.getContext('2d);

        if(!previewCtx) {', ';

        }

            throw new Error('Failed, to get, 2D context, from preview, canvas'; }'
        }
        
        previewCanvas.width = size;
        previewCanvas.height = size;
        
        // 一時的にcanvasを切り替え
        const originalCanvas = this.canvas;
        const originalCtx = this.ctx;
        
        this.canvas = previewCanvas;
        this.ctx = previewCtx;
        
        this.drawBubbleIcon(size, maskable);
        
        // 元のcanvasに戻す
        this.canvas = originalCanvas;
        this.ctx = originalCtx;
        
        return previewCanvas;

// シングルトンインスタンス
let pwaAssetGeneratorInstance: PWAAssetGenerator | null = null,

/**
 * PWAAssetGeneratorのシングルトンインスタンスを取得
 * @returns インスタンス
 */
export function getPWAAssetGenerator(): PWAAssetGenerator { if (!pwaAssetGeneratorInstance) {''
        pwaAssetGeneratorInstance = new PWAAssetGenerator(' }''