/**
 * FaviconDOMManager - FaviconDOM操作専用クラス
 * HTML要素への動的favicon追加とブラウザ互換性管理
 * 
 * @author Claude Code
 * @version 1.0.0
 */

// Type definitions
interface FaviconData {
    size: number | 'ico';
    dataURL: string;
    type: string;
}

interface BrowserCompatibility {
    browser: {
        name: string;
        version?: string;
    };
}

interface ValidationResult {
    hasIcoFavicon: boolean;
    hasPngFavicons: boolean;
    hasAppleTouchIcon: boolean;
    totalLinks: number;
    sizes: string[];
    issues: string[];
}

interface FaviconMetadata {
    manifestURL?: string;
    themeColor?: string;
    msTileColor?: string;
}

export default class FaviconDOMManager {
    /**
     * 既存のfavicon link要素を削除
     */
    static removeExistingFavicons(): void {
        const existingLinks = document.querySelectorAll('link[rel*="icon"]');
        existingLinks.forEach(link => link.remove());
    }
    
    /**
     * favicon link要素をDOMに追加
     * @param faviconData - ファビコンデータ配列
     */
    static addFaviconsToDOM(faviconData: FaviconData[]): void {
        const head = document.head;
        
        faviconData.forEach(({ size, dataURL, type }) => {
            const link = document.createElement('link');
            
            if (size === 'ico') {
                // favicon.ico
                link.rel = 'icon';
                link.type = 'image/x-icon';
                link.href = dataURL;
            } else {
                // PNG favicons
                link.rel = 'icon';
                link.type = 'image/png';
                link.sizes = `${size}x${size}`;
                link.href = dataURL;
            }
            
            head.appendChild(link);
        });
        
        // Apple Touch Icon（最大サイズを使用）
        const largestFavicon = faviconData
            .filter(favicon => typeof favicon.size === 'number')
            .sort((a, b) => (b.size as number) - (a.size as number))[0];
            
        if (largestFavicon) {
            const appleLink = document.createElement('link');
            appleLink.rel = 'apple-touch-icon';
            appleLink.href = largestFavicon.dataURL;
            head.appendChild(appleLink);
        }
    }
    
    /**
     * ブラウザ互換性に応じたfavicon追加
     * @param faviconMap - サイズごとのfavicon Map
     * @param browserCompatibility - ブラウザ互換性情報
     */
    static addBrowserSpecificFavicons(faviconMap: Map<number, string>, browserCompatibility: BrowserCompatibility): void {
        const head = document.head;
        
        // 標準的なfavicon.ico
        if (faviconMap.has(32)) {
            const icoLink = document.createElement('link');
            icoLink.rel = 'shortcut icon';
            icoLink.type = 'image/x-icon';
            icoLink.href = faviconMap.get(32)!;
            head.appendChild(icoLink);
        }
        
        // ブラウザ固有の対応
        if (browserCompatibility.browser.name === 'Safari') {
            this._addSafariFavicons(faviconMap, head);
        } else if (browserCompatibility.browser.name === 'Chrome') {
            this._addChromeFavicons(faviconMap, head);
        } else if (browserCompatibility.browser.name === 'Firefox') {
            this._addFirefoxFavicons(faviconMap, head);
        }
        
        // PWA対応のfavicon
        this._addPWAFavicons(faviconMap, head);
    }
    
    /**
     * 既存のfaviconリンクを検証
     * @returns 検証結果
     */
    static validateExistingFavicons(): ValidationResult {
        const existingLinks = document.querySelectorAll('link[rel*="icon"]');
        const validation: ValidationResult = {
            hasIcoFavicon: false,
            hasPngFavicons: false,
            hasAppleTouchIcon: false,
            totalLinks: existingLinks.length,
            sizes: [],
            issues: []
        };
        
        existingLinks.forEach(link => {
            const linkElement = link as HTMLLinkElement;
            const rel = linkElement.rel;
            const href = linkElement.href;
            const type = linkElement.type;
            const sizes = linkElement.sizes;
            
            if (rel === 'icon' || rel === 'shortcut icon') {
                if (type === 'image/x-icon' || href.endsWith('.ico')) {
                    validation.hasIcoFavicon = true;
                } else if (type === 'image/png' || href.includes('png')) {
                    validation.hasPngFavicons = true;
                    if (sizes) {
                        validation.sizes.push(sizes);
                    }
                }
            } else if (rel === 'apple-touch-icon') {
                validation.hasAppleTouchIcon = true;
            }
            
            // 問題のチェック
            if (!href || href === '') {
                validation.issues.push('Empty href attribute found');
            }
            
            if (href.startsWith('file://')) {
                validation.issues.push('File:// protocol detected - may cause CORS issues');
            }
        });
        
        return validation;
    }
    
    /**
     * favicon要素のメタデータを更新
     * @param metadata - メタデータ
     */
    static updateFaviconMetadata(metadata: FaviconMetadata): void {
        // マニフェストファイルへの参照を追加/更新
        let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
        if (!manifestLink && metadata.manifestURL) {
            manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            manifestLink.href = metadata.manifestURL;
            document.head.appendChild(manifestLink);
        }
        
        // theme-colorメタタグの追加
        if (metadata.themeColor) {
            let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
            if (!themeColorMeta) {
                themeColorMeta = document.createElement('meta');
                themeColorMeta.name = 'theme-color';
                document.head.appendChild(themeColorMeta);
            }
            themeColorMeta.content = metadata.themeColor;
        }
        
        // MSタイル設定
        if (metadata.msTileColor) {
            let msTileMeta = document.querySelector('meta[name="msapplication-TileColor"]') as HTMLMetaElement;
            if (!msTileMeta) {
                msTileMeta = document.createElement('meta');
                msTileMeta.name = 'msapplication-TileColor';
                msTileMeta.content = metadata.msTileColor;
                document.head.appendChild(msTileMeta);
            }
        }
    }
    
    /**
     * Safari固有のfavicon追加
     * @private
     * @param faviconMap - favicon Map
     * @param head - head要素
     */
    private static _addSafariFavicons(faviconMap: Map<number, string>, head: HTMLHeadElement): void {
        // Safari用のapple-touch-iconを複数サイズで追加
        const safariSizes: number[] = [57, 60, 72, 76, 114, 120, 144, 152, 180];
        
        safariSizes.forEach(size => {
            if (faviconMap.has(size)) {
                const link = document.createElement('link');
                link.rel = 'apple-touch-icon';
                link.sizes = `${size}x${size}`;
                link.href = faviconMap.get(size)!;
                head.appendChild(link);
            }
        });
    }
    
    /**
     * Chrome固有のfavicon追加
     * @private
     * @param faviconMap - favicon Map
     * @param head - head要素
     */
    private static _addChromeFavicons(faviconMap: Map<number, string>, head: HTMLHeadElement): void {
        // Chrome用のicon追加
        const chromeSizes: number[] = [16, 32, 48, 96, 192];
        
        chromeSizes.forEach(size => {
            if (faviconMap.has(size)) {
                const link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/png';
                link.sizes = `${size}x${size}`;
                link.href = faviconMap.get(size)!;
                head.appendChild(link);
            }
        });
    }
    
    /**
     * Firefox固有のfavicon追加
     * @private
     * @param faviconMap - favicon Map
     * @param head - head要素
     */
    private static _addFirefoxFavicons(faviconMap: Map<number, string>, head: HTMLHeadElement): void {
        // Firefox用のicon追加
        const firefoxSizes: number[] = [16, 32, 48];
        
        firefoxSizes.forEach(size => {
            if (faviconMap.has(size)) {
                const link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/png';
                link.sizes = `${size}x${size}`;
                link.href = faviconMap.get(size)!;
                head.appendChild(link);
            }
        });
    }
    
    /**
     * PWA対応のfavicon追加
     * @private
     * @param faviconMap - favicon Map
     * @param head - head要素
     */
    private static _addPWAFavicons(faviconMap: Map<number, string>, head: HTMLHeadElement): void {
        // PWA用の大きなアイコン
        const pwaLargeSizes: number[] = [192, 512];
        
        pwaLargeSizes.forEach(size => {
            if (faviconMap.has(size)) {
                const link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/png';
                link.sizes = `${size}x${size}`;
                link.href = faviconMap.get(size)!;
                head.appendChild(link);
            }
        });
        
        // Android Chrome用
        if (faviconMap.has(192)) {
            const link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/png';
            link.sizes = '192x192';
            link.href = faviconMap.get(192)!;
            head.appendChild(link);
        }
    }
}