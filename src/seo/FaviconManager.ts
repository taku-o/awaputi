/**
 * ファビコン管理クラス
 * 
 * 包括的なファビコン生成・管理機能を提供
 */
import { SEOConfig, getBaseUrl } from './SEOConfig';''
import { seoLogger } from './SEOLogger';''
import { seoErrorHandler } from './SEOErrorHandler';
import { optimizeImageUrl, 
    measurePerformance,';
    generateCacheKey ' }'
} from './SEOUtils';

// ファビコン仕様インターフェース
interface FaviconSpec { size?: number;
    width?: number;
    height?: number;''
    type: 'png' | 'svg' | 'ico',
    filename: string,
    multiSize?: number[];
    vector?: boolean;
    monochrome?: boolean;
    defaultSize?: number; }
}

// 生成されたファビコンインターフェース
interface GeneratedFavicon { category: string,
    filename: string,
    size: number | string,
    type: string,
    dataUrl: string,
    spec: FaviconSpec
    }
}

// ファビコン生成結果インターフェース
interface FaviconGenerationResult { generated: GeneratedFavicon[],
    errors: Array<{
        category: string,
        filename?: string;
        error: string }
    }>;
    summary: FaviconSummary,
    }

// カテゴリ別生成結果インターフェース
interface CategoryGenerationResult { generated: GeneratedFavicon[],
    errors: Array<{
        category: string,
        filename: string,
        error: string }
    }>;
}

// ファビコンサマリーインターフェース
interface FaviconSummary { totalGenerated: number,
    totalErrors: number,
    byCategory: Record<string, number>;
    byType: Record<string, number>;
    generatedAt: string }
}

// PNGデータインターフェース
interface PngData { size: number,
    data: string }
}

// ファビコン検証結果インターフェース
interface FaviconValidationResult { isValid: boolean,
    issues: string[],
    warnings: string[],
    generatedCount: number }
}

// LocalizationManager インターフェース
interface LocalizationManager { getCurrentLanguage(): string;
    t(key: string, defaultValue?: string): string }
}

// File System Access API拡張インターフェース
interface ExtendedWindow extends Window { showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>; }
}

// FileSystemDirectoryHandle インターフェース
interface FileSystemDirectoryHandle { getFileHandle(name: string, options?: { create?: boolean ): Promise<FileSystemFileHandle>
    }
}

// FileSystemFileHandle インターフェース
interface FileSystemFileHandle { createWritable(): Promise<FileSystemWritableFileStream>;
    }
}

// FileSystemWritableFileStream インターフェース
interface FileSystemWritableFileStream { write(data: BufferSource | Blob | string): Promise<void>,
    close(): Promise<void>
    }
}

export class FaviconManager {
    private localizationManager: LocalizationManager | null;
    private baseUrl: string;
    private canvas: HTMLCanvasElement | null;
    private ctx: CanvasRenderingContext2D | null;
    private generatedFavicons: Map<string, string>;
    private faviconSpecs: Map<string, FaviconSpec[]>;
    
    constructor(localizationManager: LocalizationManager | null = null) {
    
        this.localizationManager = localizationManager;
        this.baseUrl = getBaseUrl();
        this.canvas = null;
        this.ctx = null;
        this.generatedFavicons = new Map();
        this.faviconSpecs = new Map();
        
    
    }
    }
        this._initialize(); }
    }
    
    /**
     * 初期化処理
     */
    private _initialize(): void { try {
            // ファビコン仕様の設定
            this._setupFaviconSpecs();
            ;
            // Canvas要素の作成（ファビコン生成用）
            this._setupCanvas()';
            seoLogger.info('FaviconManager initialized successfully');' }'
        } catch (error) { ''
            seoErrorHandler.handle(error as Error, 'faviconManagerInit'); }
        }
    }
    
    /**
     * ファビコン仕様の設定'
     */''
    private _setupFaviconSpecs(''';
        this.faviconSpecs.set('standard', ['';
            { size: 16, type: 'png', filename: 'favicon-16x16.png' },''
            { size: 32, type: 'png', filename: 'favicon-32x32.png' },'])'
            { size: 48, type: 'png', filename: 'favicon-48x48.png' },')]'
            { size: 0, type: 'ico', filename: 'favicon.ico', multiSize: [16, 32, 48] }')''
            { size: 0, type: 'svg', filename: 'favicon.svg', vector: true )''
        ]');
        ';
        // Apple Touch Icons
        this.faviconSpecs.set('apple', [' }'
            { size: 57, type: 'png', filename: 'apple-touch-icon-57x57.png' },''
            { size: 60, type: 'png', filename: 'apple-touch-icon-60x60.png' },''
            { size: 72, type: 'png', filename: 'apple-touch-icon-72x72.png' },''
            { size: 76, type: 'png', filename: 'apple-touch-icon-76x76.png' },''
            { size: 114, type: 'png', filename: 'apple-touch-icon-114x114.png' },''
            { size: 120, type: 'png', filename: 'apple-touch-icon-120x120.png' },''
            { size: 144, type: 'png', filename: 'apple-touch-icon-144x144.png' },')'
            { size: 152, type: 'png', filename: 'apple-touch-icon-152x152.png' },')'
            { size: 180, type: 'png', filename: 'apple-touch-icon-180x180.png' }')']'
            { size: 0, type: 'png', filename: 'apple-touch-icon.png', defaultSize: 180 )']'
        ]');
        ';
        // Android Chrome Icons
        this.faviconSpecs.set('android', [' }'
            { size: 36, type: 'png', filename: 'android-chrome-36x36.png' },''
            { size: 48, type: 'png', filename: 'android-chrome-48x48.png' },''
            { size: 72, type: 'png', filename: 'android-chrome-72x72.png' },''
            { size: 96, type: 'png', filename: 'android-chrome-96x96.png' },''
            { size: 144, type: 'png', filename: 'android-chrome-144x144.png' },''
            { size: 192, type: 'png', filename: 'android-chrome-192x192.png' },')'
            { size: 256, type: 'png', filename: 'android-chrome-256x256.png' },')'
            { size: 384, type: 'png', filename: 'android-chrome-384x384.png' }')']'
            { size: 512, type: 'png', filename: 'android-chrome-512x512.png' )']'
        ]');
        ';
        // Microsoft Windows Tiles
        this.faviconSpecs.set('microsoft', [' }'
            { size: 70, type: 'png', filename: 'mstile-70x70.png' },''
            { width: 150, height: 150, type: 'png', filename: 'mstile-150x150.png' },')'
            { width: 310, height: 150, type: 'png', filename: 'mstile-310x150.png' },')'
            { width: 310, height: 310, type: 'png', filename: 'mstile-310x310.png' }')']'
            { size: 144, type: 'png', filename: 'mstile-144x144.png' )']'
        ]');
        ';
        // Safari特化
        this.faviconSpecs.set('safari', [')']';
            { size: 0, type: 'svg', filename: 'safari-pinned-tab.svg', monochrome: true )']'
        ]');
        ';
        // 古いiOS向け（precomposed）
        this.faviconSpecs.set('iosLegacy', [' }'
            { size: 57, type: 'png', filename: 'apple-touch-icon-57x57-precomposed.png' },')'
            { size: 72, type: 'png', filename: 'apple-touch-icon-72x72-precomposed.png' },')'
            { size: 114, type: 'png', filename: 'apple-touch-icon-114x114-precomposed.png' }')']'
            { size: 144, type: 'png', filename: 'apple-touch-icon-144x144-precomposed.png' )]
        ]) }
    }
    
    /**
     * Canvas要素の設定'
     */''
    private _setupCanvas()';
        if(typeof document !== 'undefined'') {'
            '';
            this.canvas = document.createElement('canvas'');'
        }'
            this.ctx = this.canvas.getContext('2d'); }
        }
    }
    
    /**
     * 全ファビコンアセットの生成'
     */''
    async generateAllFavicons(options: { forceRegenerate?: boolean } = { )'): Promise<FaviconGenerationResult> {
        try {
            const results: FaviconGenerationResult = {
                generated: [],
                errors: [],
                summary: {
                    totalGenerated: 0,
                    totalErrors: 0, }
                    byCategory: {}'
                    byType: {}''
                    generatedAt: '';
                }
            },
            
            // 各カテゴリのファビコンを生成
            for(const [category, specs] of this.faviconSpecs) {
                try {
                    const categoryResults = await this._generateFaviconCategory(category, specs, options);
                    results.generated.push(...categoryResults.generated);
            }
                    results.errors.push(...categoryResults.errors); }
                } catch (error) {
                    seoLogger.error(`Failed to generate ${category} favicons`, error as Error);
                    results.errors.push({ category, error: (error as Error).message });
                }
            }
            
            // サマリーの生成
            results.summary = this._generateFaviconSummary(results);
            
            seoLogger.info(`Generated ${results.generated.length} favicons with ${results.errors.length) errors`});
            ';'
            return results;''
        } catch (error) { ''
            return seoErrorHandler.handle(error as Error, 'generateAllFavicons', options); }
        }
    }
    
    /**
     * カテゴリ別ファビコン生成
     */
    private async _generateFaviconCategory(;
        category: string );
        specs: FaviconSpec[]);
        options: { forceRegenerate?: boolean }
    ): Promise<CategoryGenerationResult>,
        const results: CategoryGenerationResult = { generated: [],
            errors: [] }
        },
        
        for(const spec of specs) {
        
            try {
                const faviconData = await this._generateSingleFavicon(spec, options);
                if (faviconData) {
                    results.generated.push({
                        category,
        
        }
                        filename: spec.filename, }
                        size: spec.size || `${spec.width}x${spec.height}`)
                        type: spec.type);
                        dataUrl: faviconData,);
                        spec);
                } catch (error) { results.errors.push({)
                    category,);
                    filename: spec.filename),
                    error: (error as Error).message }
                }),
            }
        }
        
        return results;
    }
    
    /**
     * 単一ファビコンの生成
     */'
    private async _generateSingleFavicon(spec: FaviconSpec, options: { forceRegenerate?: boolean ): Promise<string | null> {''
        if(!this.canvas || !this.ctx') {'
            '';
            seoLogger.warn('Canvas not available for favicon generation'');
        }
            return null; }
        }
        ';
        // 生成キャッシュをチェック
        const cacheKey = generateCacheKey('favicon', spec);'
        if (this.generatedFavicons.has(cacheKey) && !options.forceRegenerate) { ''
            return this.generatedFavicons.get(cacheKey')!; }
        }
        
        try { let faviconData: string,'
            '';
            if(spec.type === 'svg') {'
                ';'
            }'
                faviconData = await this._generateSVGFavicon(spec, options');' }'
            } else if (spec.type === 'ico') { faviconData = await this._generateICOFavicon(spec, options); }
            } else { faviconData = await this._generatePNGFavicon(spec, options); }
            }
            
            // キャッシュに保存
            this.generatedFavicons.set(cacheKey, faviconData);
            
            return faviconData;
        } catch (error) {
            seoLogger.error(`Failed to generate favicon: ${spec.filename}`, error as Error);
            throw error;
        }
    }
    
    /**
     * PNGファビコンの生成
     */
    private async _generatePNGFavicon(spec: FaviconSpec, options: { forceRegenerate?: boolean }): Promise<string> { const size = spec.size || Math.max(spec.width || 0, spec.height || 0);
        const width = spec.width || size;
        const height = spec.height || size;
        
        // Canvasサイズの設定
        this.canvas!.width = width;
        this.canvas!.height = height;
        
        // 背景のクリア
        this.ctx!.clearRect(0, 0, width, height);
        ;
        // ファビコンのデザインを描画
        await this._drawFaviconDesign(width, height, spec');
        ';
        // PNG形式で出力
        return this.canvas!.toDataURL('image/png'); }
    }
    
    /**
     * SVGファビコンの生成'
     */''
    private async _generateSVGFavicon(spec: FaviconSpec, options: { forceRegenerate?: boolean )'): Promise<string> {
        const size = spec.size || 32;
        const isMonochrome = spec.monochrome || false;
        ';'
        // SVGテンプレートの生成' }'
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;"
        "";
        if (isMonochrome") { // Safari pinned tab用のモノクローム版" }"
            svg += `<circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="black"/>`;""
            svg += `<circle cx="${size/2-size/8}" cy="${size/2-size/8}" r="${size/8}" fill="white"/>`;""
            svg += `<circle cx="${size/2+size/8}" cy="${size/2-size/8}" r="${size/8}" fill="white"/>`;"
        } else {  // カラー版""
            const gradient = `<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">"";
                <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />""
                <stop offset="100%" style="stop-color:#2E7D32;stop-opacity:1" /> }"
            </linearGradient></defs>`;" }"
            svg = svg.replace('>', `>${gradient)`'});''
            svg += `<circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="url(#grad")"/>`;""
            svg += `<circle cx="${size/2-size/8}" cy="${size/2-size/8}" r="${size/8}" fill="white" opacity="0.9"/>`;""
            svg += `<circle cx="${size/2+size/8}" cy="${size/2-size/8}" r="${size/8}" fill="white" opacity="0.9"/>`;
        }"
        "";
        svg += '</svg>';
        
        // SVGをData URLとして返す
        return `data:image/svg+xml;base64,${btoa(svg})}`;
    }
    
    /**
     * ICOファビコンの生成
     */
    private async _generateICOFavicon(spec: FaviconSpec, options: { forceRegenerate?: boolean ): Promise<string> {
        // ICOは複数サイズを含むフォーマット
        const sizes = spec.multiSize || [16, 32, 48];
        
        // 各サイズのPNGデータを生成
        const pngDataList: PngData[] = [],'';
        for (const size of sizes') {' }'
            const pngSpec: FaviconSpec = { ...spec, size, type: 'png' }
            const pngData = await this._generatePNGFavicon(pngSpec, options);
            pngDataList.push({ size)
                data: pngData) }
        }
        
        // ICOファイルの構築（簡易版、実際のプロダクションでは適切なICOライブラリを使用）
        // ここでは最大サイズのPNGをICOとして返す
        const largestPng = pngDataList.reduce((prev, current) => ;
            (prev.size > current.size) ? prev : current;
        );
        
        return largestPng.data;
    }
    
    /**
     * ファビコンデザインの描画
     */
    private async _drawFaviconDesign(width: number, height: number, spec: FaviconSpec): Promise<void> { const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        ;
        // グラデーション背景
        const gradient = this.ctx!.createLinearGradient(0, 0, width, height');''
        gradient.addColorStop(0, '#4CAF50'');''
        gradient.addColorStop(1, '#2E7D32');
        
        // メインの泡
        this.ctx!.fillStyle = gradient;
        this.ctx!.beginPath();
        this.ctx!.arc(centerX, centerY, radius, 0, Math.PI * 2);''
        this.ctx!.fill()';
        this.ctx!.fillStyle = 'rgba(255, 255, 255, 0.9')';
        const highlightRadius = radius / 4;
        
        // 左上のハイライト
        this.ctx!.beginPath();
        this.ctx!.arc(centerX - radius/3, centerY - radius/3, highlightRadius, 0, Math.PI * 2);
        this.ctx!.fill();
        
        // 右上のハイライト
        this.ctx!.beginPath();
        this.ctx!.arc(centerX + radius/4, centerY - radius/4, highlightRadius/2, 0, Math.PI * 2);''
        this.ctx!.fill()';
        if(spec.filename && spec.filename.includes('mstile') {'
            ';'
        }'
            this._drawMicrosoftTileDesign(width, height'); }
        }
        ';
        // Apple Touch Icon用の丸角処理（視覚的効果）
        if(spec.filename && spec.filename.includes('apple-touch-icon') { this._applyRoundedCorners(width, height); }
        }
    }
    
    /**
     * Microsoft Tile用デザイン'
     */''
    private _drawMicrosoftTileDesign(width: number, height: number'): void { // Windows 10のフラットデザインスタイル
        this.ctx!.fillStyle = '#4CAF50';
        this.ctx!.fillRect(0, 0, width, height);
        
        // 中央のアイコン
        const iconSize = Math.min(width, height) * 0.6;
        const x = (width - iconSize) / 2;''
        const y = (height - iconSize') / 2;'
        '';
        this.ctx!.fillStyle = 'white';
        this.ctx!.beginPath();
        this.ctx!.arc(x + iconSize/2, y + iconSize/2, iconSize/3, 0, Math.PI * 2);
        this.ctx!.fill(); }
    }
    
    /**
     * 丸角処理の適用'
     */''
    private _applyRoundedCorners(width: number, height: number'): void { // Apple Touch Iconは自動的にiOSによって丸角処理されるため、
        // ここでは視覚的な効果のみ適用
        const cornerRadius = width * 0.1;
        '';
        this.ctx!.globalCompositeOperation = 'destination-in';
        this.ctx!.beginPath();'
        (this.ctx! as any).roundRect(0, 0, width, height, cornerRadius);''
        this.ctx!.fill(''';
        this.ctx!.globalCompositeOperation = 'source-over'; }
    }
    
    /**
     * ファビコンファイルの書き込み)'
     */')'
    async writeFaviconFiles(faviconList: GeneratedFavicon[]'): Promise<void> { try {
            const extWindow = window as ExtendedWindow;''
            if(typeof window === 'undefined' || !extWindow.showDirectoryPicker') {'
                '';
                seoLogger.warn('File System Access API not available');
            }
                return this._fallbackFaviconDownload(faviconList); }
            }
            
            // ディレクトリ選択
            const dirHandle = await extWindow.showDirectoryPicker();
            
            // 各ファビコンファイルを書き込み
            for(const favicon of faviconList) {
                try {
                    const fileHandle = await dirHandle.getFileHandle(favicon.filename, { create: true ),
                    const writable = await fileHandle.createWritable();
                    
                    // Data URLからBlobに変換
                    const response = await fetch(favicon.dataUrl);
                    const blob = await response.blob();
                    
                    await writable.write(blob);
                    await writable.close();
            }
                     }
                    seoLogger.info(`Favicon saved: ${favicon.filename)`});
                } catch (error) {
                    seoLogger.error(`Failed to save ${favicon.filename}`, error as Error);
                }''
            } catch (error) { ' }'
            seoErrorHandler.handle(error as Error, 'writeFaviconFiles', { count: faviconList.length });
        }
    }
    
    /**
     * フォールバックダウンロード
     */'
    private async _fallbackFaviconDownload(faviconList: GeneratedFavicon[]): Promise<void> { // ZIPファイルの作成（簡易版）
        for(const favicon of faviconList') {'
            try {'
                const link = document.createElement('a');
                link.href = favicon.dataUrl;
                link.download = favicon.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // ダウンロード間隔を空ける
        }
                await new Promise(resolve => setTimeout(resolve, 100); }
            } catch (error) {
                seoLogger.error(`Failed to download ${favicon.filename}`, error as Error);
            }
        }
    }
    
    /**
     * HTMLメタタグの生成
     */''
    generateFaviconMetaTags(''';
        let html = '    <!-- Favicons and Icons -->\n';
        ';
        // 標準ファビコン
        html += '    <link rel="icon" type="image/svg+xml" href="/favicon.svg">\n';''
        html += '    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n';''
        html += '    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n';''
        html += '    <link rel="shortcut icon" href="/favicon.ico">\n';
        ';
        // Apple Touch Icons
        html += '\n    <!-- Apple Touch Icons -->\n';
        const appleSizes = [57, 60, 72, 76, 114, 120, 144, 152, 180];)'
        appleSizes.forEach(size => { ') }'
            html += `    <link rel="apple-touch-icon" sizes="${size}x${size}" href="/apple-touch-icon-${size}x${size}.png">\n`)");""
        html += '    <link rel="apple-touch-icon" href="/apple-touch-icon.png">\n';
        ';
        // Safari
        html += '\n    <!-- Safari -->\n';''
        html += '    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#4CAF50">\n';
        ';
        // Microsoft
        html += '\n    <!-- Microsoft -->\n';''
        html += '    <meta name="msapplication-TileColor" content="#4CAF50">\n';''
        html += '    <meta name="msapplication-square70x70logo" content="/mstile-70x70.png">\n';''
        html += '    <meta name="msapplication-square150x150logo" content="/mstile-150x150.png">\n';''
        html += '    <meta name="msapplication-wide310x150logo" content="/mstile-310x150.png">\n';''
        html += '    <meta name="msapplication-square310x310logo" content="/mstile-310x310.png">\n';
        ';
        // Android
        html += '\n    <!-- Android -->\n';''
        html += '    <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">\n';''
        html += '    <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">\n';
        
        return html;
    }
    
    /**
     * ファビコンサマリーの生成
     */
    private _generateFaviconSummary(results: FaviconGenerationResult): FaviconSummary { const summary: FaviconSummary = {
            totalGenerated: results.generated.length,
            totalErrors: results.errors.length, }
            byCategory: {}
            byType: {}
            generatedAt: new Date().toISOString(),
        };
        
        // カテゴリ別集計
        results.generated.forEach(favicon => {  );
            summary.byCategory[favicon.category] = (summary.byCategory[favicon.category] || 0) + 1; }
            summary.byType[favicon.type] = (summary.byType[favicon.type] || 0) + 1; }
        });
        
        return summary;
    }
    
    /**
     * ファビコン設定の検証
     */''
    validateFaviconSetup(''';
            'favicon.ico','';
            'favicon-32x32.png','';
            'favicon-16x16.png','';
            'apple-touch-icon-180x180.png','';
            'safari-pinned-tab.svg';
        ];
        );
        requiredFavicons.forEach(filename => {  ); }
            if(!this.generatedFavicons.has(filename) { }
                issues.push(`Missing required favicon: ${filename}`);'
            }''
        }');
        
        // 推奨ファビコンの存在チェック
        const recommendedFavicons = ['';
            'android-chrome-192x192.png','';
            'android-chrome-512x512.png',']';
            'mstile-150x150.png'];
        ];
        
        recommendedFavicons.forEach(filename => {  ); }
            if(!this.generatedFavicons.has(filename) { }
                warnings.push(`Missing recommended favicon: ${filename}`);'
            }''
        }');
        
        const isValid = issues.length === 0;'
        '';
        seoLogger.validation('favicon', isValid, issues);
        
        return { isValid,
            issues,
            warnings, };
            generatedCount: this.generatedFavicons.size }
        },
    }
    
    /**
     * リソースのクリーンアップ
     */
    cleanup(): void { this.generatedFavicons.clear();
        this.faviconSpecs.clear();'
        '';
        if(this.canvas') {
            this.canvas = null;
        }
            this.ctx = null; }
        }'
        '';
        seoLogger.info('FaviconManager cleaned up'');'
    }''
}