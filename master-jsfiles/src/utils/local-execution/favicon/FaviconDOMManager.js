/**
 * FaviconDOMManager - FaviconDOM操作専用クラス
 * HTML要素への動的favicon追加とブラウザ互換性管理
 * 
 * @author Claude Code
 * @version 1.0.0
 */

export default class FaviconDOMManager {
    /**
     * 既存のfavicon link要素を削除
     */
    static removeExistingFavicons() {
        const existingLinks = document.querySelectorAll('link[rel*="icon"]');
        existingLinks.forEach(link => link.remove());
    }
    
    /**
     * favicon link要素をDOMに追加
     * @param {Array<Object>} faviconData - ファビコンデータ配列
     */
    static addFaviconsToDOM(faviconData) {
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
            .sort((a, b) => b.size - a.size)[0];
            
        if (largestFavicon) {
            const appleLink = document.createElement('link');
            appleLink.rel = 'apple-touch-icon';
            appleLink.href = largestFavicon.dataURL;
            head.appendChild(appleLink);
        }
    }
    
    /**
     * ブラウザ互換性に応じたfavicon追加
     * @param {Map<number, string>} faviconMap - サイズごとのfavicon Map
     * @param {Object} browserCompatibility - ブラウザ互換性情報
     */
    static addBrowserSpecificFavicons(faviconMap, browserCompatibility) {
        const head = document.head;
        
        // 標準的なfavicon.ico
        if (faviconMap.has(32)) {
            const icoLink = document.createElement('link');
            icoLink.rel = 'shortcut icon';
            icoLink.type = 'image/x-icon';
            icoLink.href = faviconMap.get(32);
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
     * @returns {Object} 検証結果
     */
    static validateExistingFavicons() {
        const existingLinks = document.querySelectorAll('link[rel*="icon"]');
        const validation = {
            hasIcoFavicon: false,
            hasPngFavicons: false,
            hasAppleTouchIcon: false,
            totalLinks: existingLinks.length,
            sizes: [],
            issues: []
        };
        
        existingLinks.forEach(link => {
            const rel = link.rel;
            const href = link.href;
            const type = link.type;
            const sizes = link.sizes;
            
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
     * @param {Object} metadata - メタデータ
     */
    static updateFaviconMetadata(metadata) {
        // マニフェストファイルへの参照を追加/更新
        let manifestLink = document.querySelector('link[rel="manifest"]');
        if (!manifestLink && metadata.manifestURL) {
            manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            manifestLink.href = metadata.manifestURL;
            document.head.appendChild(manifestLink);
        }
        
        // theme-colorメタタグの追加
        if (metadata.themeColor) {
            let themeColorMeta = document.querySelector('meta[name="theme-color"]');
            if (!themeColorMeta) {
                themeColorMeta = document.createElement('meta');
                themeColorMeta.name = 'theme-color';
                document.head.appendChild(themeColorMeta);
            }
            themeColorMeta.content = metadata.themeColor;
        }
        
        // MSタイル設定
        if (metadata.msTileColor) {
            let msTileMeta = document.querySelector('meta[name="msapplication-TileColor"]');
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
     * @param {Map} faviconMap - favicon Map
     * @param {HTMLElement} head - head要素
     */
    static _addSafariFavicons(faviconMap, head) {
        // Safari用のapple-touch-iconを複数サイズで追加
        const safariSizes = [57, 60, 72, 76, 114, 120, 144, 152, 180];
        
        safariSizes.forEach(size => {
            if (faviconMap.has(size)) {
                const link = document.createElement('link');
                link.rel = 'apple-touch-icon';
                link.sizes = `${size}x${size}`;
                link.href = faviconMap.get(size);
                head.appendChild(link);
            }
        });
    }
    
    /**
     * Chrome固有のfavicon追加
     * @private
     * @param {Map} faviconMap - favicon Map
     * @param {HTMLElement} head - head要素
     */
    static _addChromeFavicons(faviconMap, head) {
        // Chrome用のicon追加
        [16, 32, 48, 96, 192].forEach(size => {
            if (faviconMap.has(size)) {
                const link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/png';
                link.sizes = `${size}x${size}`;
                link.href = faviconMap.get(size);
                head.appendChild(link);
            }
        });
    }
    
    /**
     * Firefox固有のfavicon追加
     * @private
     * @param {Map} faviconMap - favicon Map
     * @param {HTMLElement} head - head要素
     */
    static _addFirefoxFavicons(faviconMap, head) {
        // Firefox用のicon追加
        [16, 32, 48].forEach(size => {
            if (faviconMap.has(size)) {
                const link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/png';
                link.sizes = `${size}x${size}`;
                link.href = faviconMap.get(size);
                head.appendChild(link);
            }
        });
    }
    
    /**
     * PWA対応のfavicon追加
     * @private
     * @param {Map} faviconMap - favicon Map
     * @param {HTMLElement} head - head要素
     */
    static _addPWAFavicons(faviconMap, head) {
        // PWA用の大きなアイコン
        [192, 512].forEach(size => {
            if (faviconMap.has(size)) {
                const link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/png';
                link.sizes = `${size}x${size}`;
                link.href = faviconMap.get(size);
                head.appendChild(link);
            }
        });
        
        // Android Chrome用
        if (faviconMap.has(192)) {
            const link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/png';
            link.sizes = '192x192';
            link.href = faviconMap.get(192);
            head.appendChild(link);
        }
    }
}