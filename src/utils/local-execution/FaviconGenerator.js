/**
 * FaviconGenerator - Canvas APIを使用した動的ファビコン生成
 * 
 * 不足しているファビコンファイルをCanvas APIを使用して動的に生成し、
 * ローカルファイル実行時のファビコンエラーを解決します。
 * 
 * Requirements: 2.1, 2.2, 6.1, 6.2, 6.3
 * 
 * @author Claude Code
 * @version 1.0.0
 */

class FaviconGenerator {
    /**
     * キャッシュキーのプレフィックス
     */
    static CACHE_PREFIX = 'awaputi_favicon_';
    
    /**
     * デフォルトのファビコン設定
     */
    static DEFAULT_CONFIG = {
        sizes: [16, 32, 48, 192, 512],
        backgroundColor: '#2196F3',
        textColor: '#FFFFFF',
        fontFamily: 'Arial, sans-serif',
        text: 'B',
        cacheEnabled: true
    };

    /**
     * 不足しているファビコンを生成
     * @param {Object} config - 設定オプション
     * @returns {Promise<void>}
     */
    static async generateMissingFavicons(config = {}) {
        const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
        
        console.log('FaviconGenerator: Starting favicon generation');
        
        try {
            const missingFavicons = this.checkMissingFavicons();
            
            if (missingFavicons.length === 0) {
                console.log('FaviconGenerator: All favicons already exist');
                return;
            }

            console.log('FaviconGenerator: Missing favicons:', missingFavicons);
            
            // Canvas API サポートチェック
            if (!this._supportsCanvas()) {
                console.warn('FaviconGenerator: Canvas API not supported');
                return;
            }

            // 各サイズのPNGファビコンを生成
            for (const size of mergedConfig.sizes) {
                await this._generatePNGFavicon(size, mergedConfig);
            }

            // favicon.ico を生成
            await this._generateICOFavicon(mergedConfig);
            
            console.log('FaviconGenerator: Favicon generation completed');
            
        } catch (error) {
            console.error('FaviconGenerator: Generation failed', error);
            throw error;
        }
    }

    /**
     * 指定サイズのPNGファビコンを生成
     * @param {number} size - ファビコンサイズ
     * @param {Object} config - 設定オプション
     * @returns {Promise<Blob>}
     */
    static async createPNGFavicon(size, config = {}) {
        const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
        
        try {
            // キャッシュをチェック
            if (mergedConfig.cacheEnabled) {
                const cached = await this._getCachedFavicon(size);
                if (cached) {
                    return cached;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // 背景を描画
            ctx.fillStyle = mergedConfig.backgroundColor;
            ctx.fillRect(0, 0, size, size);

            // 角を丸くする（オプション）
            this._drawRoundedRect(ctx, 0, 0, size, size, size * 0.1);

            // テキストを描画
            this._drawText(ctx, mergedConfig.text, size, mergedConfig.textColor, mergedConfig.fontFamily);

            // Blobに変換
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    // キャッシュに保存
                    if (mergedConfig.cacheEnabled) {
                        this._cacheFavicon(size, blob);
                    }
                    resolve(blob);
                }, 'image/png');
            });

        } catch (error) {
            console.error(`FaviconGenerator: Failed to create PNG favicon (${size}px)`, error);
            throw error;
        }
    }

    /**
     * ICOファイル形式のファビコンを生成
     * @param {number[]} sizes - ICOに含めるサイズ配列
     * @param {Object} config - 設定オプション
     * @returns {Promise<Blob>}
     */
    static async createFaviconICO(sizes = [16, 32, 48], config = {}) {
        try {
            console.log(`FaviconGenerator: Creating ICO favicon with sizes: ${sizes.join(', ')}`);
            
            // 各サイズのPNGデータを生成
            const pngBlobs = [];
            for (const size of sizes) {
                const blob = await this.createPNGFavicon(size, config);
                pngBlobs.push({
                    size,
                    data: await blob.arrayBuffer()
                });
            }

            // ICOファイルのバイナリデータを生成
            const icoData = this._createICOFile(pngBlobs);
            
            return new Blob([icoData], { type: 'image/x-icon' });
            
        } catch (error) {
            console.error('FaviconGenerator: Failed to create ICO favicon', error);
            throw error;
        }
    }

    /**
     * 不足しているファビコンファイルをチェック
     * @returns {string[]} 不足しているファビコンファイルのリスト
     */
    static checkMissingFavicons() {
        const requiredFavicons = [
            '/favicon.ico',
            '/favicon-16x16.png', 
            '/favicon-32x32.png',
            '/icon-192x192.png',
            '/icon-512x512.png'
        ];

        const missingFavicons = [];
        
        requiredFavicons.forEach(faviconPath => {
            if (!this._faviconExists(faviconPath)) {
                missingFavicons.push(faviconPath);
            }
        });

        return missingFavicons;
    }

    /**
     * 指定サイズのPNGファビコンを生成して適用
     * @param {number} size - サイズ
     * @param {Object} config - 設定
     * @private
     */
    static async _generatePNGFavicon(size, config) {
        try {
            const blob = await this.createPNGFavicon(size, config);
            const url = URL.createObjectURL(blob);
            
            // HTMLにリンクタグを追加
            this._addFaviconLink(size, url);
            
        } catch (error) {
            console.error(`FaviconGenerator: Failed to generate PNG favicon (${size}px)`, error);
        }
    }

    /**
     * ICOファビコンを生成して適用
     * @param {Object} config - 設定
     * @private
     */
    static async _generateICOFavicon(config) {
        try {
            const blob = await this.createFaviconICO([16, 32, 48], config);
            const url = URL.createObjectURL(blob);
            
            // HTMLにリンクタグを追加
            this._addFaviconLink('ico', url);
            
        } catch (error) {
            console.error('FaviconGenerator: Failed to generate ICO favicon', error);
        }
    }

    /**
     * ファビコンリンクタグをHTMLに追加
     * @param {number|string} size - サイズまたは'ico'
     * @param {string} url - Blob URL
     * @private
     */
    static _addFaviconLink(size, url) {
        const link = document.createElement('link');
        
        if (size === 'ico') {
            link.rel = 'icon';
            link.type = 'image/x-icon';
            link.href = url;
        } else {
            link.rel = size >= 192 ? 'apple-touch-icon' : 'icon';
            link.type = 'image/png';
            link.sizes = `${size}x${size}`;
            link.href = url;
        }
        
        document.head.appendChild(link);
        console.log(`FaviconGenerator: Added favicon link for size ${size}`);
    }

    /**
     * ファビコンファイルが存在するかチェック
     * @param {string} path - ファイルパス
     * @returns {boolean}
     * @private
     */
    static _faviconExists(path) {
        // 実際のファイル存在チェックは困難なため、
        // リンクタグの存在で代用
        return !!document.querySelector(`link[href="${path}"]`);
    }

    /**
     * Canvas APIサポートをチェック
     * @returns {boolean}
     * @private
     */
    static _supportsCanvas() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (error) {
            return false;
        }
    }

    /**
     * 角の丸い四角形を描画
     * @param {CanvasRenderingContext2D} ctx - Canvas コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {number} radius - 角の半径
     * @private
     */
    static _drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * テキストを描画
     * @param {CanvasRenderingContext2D} ctx - Canvas コンテキスト
     * @param {string} text - テキスト
     * @param {number} size - キャンバスサイズ
     * @param {string} color - テキスト色
     * @param {string} fontFamily - フォントファミリー
     * @private
     */
    static _drawText(ctx, text, size, color, fontFamily) {
        const fontSize = Math.floor(size * 0.6);
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText(text, size / 2, size / 2);
    }

    /**
     * キャッシュからファビコンを取得
     * @param {number} size - サイズ
     * @returns {Promise<Blob|null>}
     * @private
     */
    static async _getCachedFavicon(size) {
        try {
            const cached = localStorage.getItem(`${this.CACHE_PREFIX}${size}`);
            if (cached) {
                const binaryString = atob(cached);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return new Blob([bytes], { type: 'image/png' });
            }
        } catch (error) {
            console.warn(`FaviconGenerator: Cache retrieval failed for size ${size}`, error);
        }
        return null;
    }

    /**
     * ファビコンをキャッシュに保存
     * @param {number} size - サイズ
     * @param {Blob} blob - ファビコンBlob
     * @private
     */
    static async _cacheFavicon(size, blob) {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            const binaryString = String.fromCharCode(...bytes);
            const base64 = btoa(binaryString);
            
            localStorage.setItem(`${this.CACHE_PREFIX}${size}`, base64);
            localStorage.setItem(`${this.CACHE_PREFIX}${size}_timestamp`, Date.now().toString());
            
        } catch (error) {
            console.warn(`FaviconGenerator: Cache storage failed for size ${size}`, error);
        }
    }

    /**
     * ICOファイルのバイナリデータを生成
     * @param {Array} pngBlobs - PNGデータ配列
     * @returns {ArrayBuffer}
     * @private
     */
    static _createICOFile(pngBlobs) {
        // ICO ファイルヘッダー（6バイト）
        const iconDir = new ArrayBuffer(6);
        const iconDirView = new DataView(iconDir);
        iconDirView.setUint16(0, 0, true);      // Reserved
        iconDirView.setUint16(2, 1, true);      // Type (1 = ICO)
        iconDirView.setUint16(4, pngBlobs.length, true); // Number of images

        // アイコンディレクトリエントリー（16バイト × 画像数）
        const entries = new ArrayBuffer(16 * pngBlobs.length);
        const entriesView = new DataView(entries);
        
        let imageOffset = 6 + (16 * pngBlobs.length); // ヘッダー + エントリー
        
        pngBlobs.forEach((png, index) => {
            const offset = index * 16;
            entriesView.setUint8(offset + 0, png.size);     // Width
            entriesView.setUint8(offset + 1, png.size);     // Height
            entriesView.setUint8(offset + 2, 0);            // Color count
            entriesView.setUint8(offset + 3, 0);            // Reserved
            entriesView.setUint16(offset + 4, 1, true);     // Color planes
            entriesView.setUint16(offset + 6, 32, true);    // Bits per pixel
            entriesView.setUint32(offset + 8, png.data.byteLength, true); // Image size
            entriesView.setUint32(offset + 12, imageOffset, true);        // Image offset
            
            imageOffset += png.data.byteLength;
        });

        // 全体を結合
        const totalSize = 6 + (16 * pngBlobs.length) + pngBlobs.reduce((sum, png) => sum + png.data.byteLength, 0);
        const icoFile = new Uint8Array(totalSize);
        
        let pos = 0;
        icoFile.set(new Uint8Array(iconDir), pos);
        pos += iconDir.byteLength;
        
        icoFile.set(new Uint8Array(entries), pos);
        pos += entries.byteLength;
        
        pngBlobs.forEach(png => {
            icoFile.set(new Uint8Array(png.data), pos);
            pos += png.data.byteLength;
        });

        return icoFile.buffer;
    }

    /**
     * キャッシュをクリア
     */
    static clearCache() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.CACHE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('FaviconGenerator: Cache cleared');
        } catch (error) {
            console.error('FaviconGenerator: Failed to clear cache', error);
        }
    }

    /**
     * デバッグ情報を取得
     * @returns {Object}
     */
    static getDebugInfo() {
        return {
            canvasSupport: this._supportsCanvas(),
            missingFavicons: this.checkMissingFavicons(),
            cacheKeys: Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_PREFIX)),
            config: this.DEFAULT_CONFIG
        };
    }
}

export default FaviconGenerator;