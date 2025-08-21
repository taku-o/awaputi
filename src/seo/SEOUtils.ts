/**
 * SEOユーティリティ関数
 * 
 * SEO関連の共通処理とヘルパー関数
 */
import { SEOConfig, LanguageCode } from './SEOConfig.js';
import { seoLogger } from './SEOLogger.js';

// 画像最適化オプションインターフェース
interface ImageOptimizationOptions {
    width?: number;
    height?: number;
    format?: 'webp' | 'png' | 'jpg' | 'jpeg';
    quality?: number;
}

// スキーマプロパティインターフェース
interface SchemaProperty {
    type?: string;
    default?: any;
    required?: boolean;
}

// スキーマインターフェース
interface Schema {
    required?: string[];
    properties?: Record<string, SchemaProperty>;
}

// スキーマ検証結果インターフェース
interface ValidationResult<T = any> {
    isValid: boolean;
    errors: string[];
    data: T;
}

/**
 * URLの正規化
 */
export function normalizeUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        
        // パラメータの削除（必要に応じて）
        urlObj.search = '';
        
        // 末尾のスラッシュを削除
        let pathname = urlObj.pathname;
        if (pathname.length > 1 && pathname.endsWith('/')) {
            pathname = pathname.slice(0, -1);
        }
        urlObj.pathname = pathname;
        
        // HTTPSを強制
        if (urlObj.protocol === 'http:' && !urlObj.hostname.includes('localhost')) {
            urlObj.protocol = 'https:';
        }

        return urlObj.toString();
    } catch (error) {
        seoLogger.error('URL normalization failed', error);
        return url;
    }
}

/**
 * メタタグの安全な作成
 */
export function createMetaTag(property: string, content: string): HTMLMetaElement | null {
    if (!property || !content) {
        seoLogger.warn('Invalid meta tag parameters', { property, content });
        return null;
    }

    const meta = document.createElement('meta');

    if (property.startsWith('og:') || property.startsWith('article:')) {
        meta.setAttribute('property', property);
    } else {
        meta.setAttribute('name', property);
    }

    meta.setAttribute('content', sanitizeMetaContent(content));
    
    return meta;
}

/**
 * メタコンテンツのサニタイズ
 */
export function sanitizeMetaContent(content: string | number | boolean): string {
    if (typeof content !== 'string') {
        return String(content);
    }

    return content
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .trim();
}

/**
 * 言語コードの検証と正規化
 */
export function normalizeLanguageCode(lang: string): LanguageCode {
    if (!lang) return SEOConfig.defaultLanguage;
    
    // サポートされている言語コードかチェック
    const normalizedLang = lang.toLowerCase() as LanguageCode;
    if (SEOConfig.supportedLanguages.includes(normalizedLang)) {
        return normalizedLang;
    }
    
    // 部分マッチング（例：'en-US' -> 'en'）
    const baseLang = normalizedLang.split('-')[0] as LanguageCode;
    if (SEOConfig.supportedLanguages.includes(baseLang)) {
        return baseLang;
    }
    
    return SEOConfig.defaultLanguage;
}

/**
 * テキストの長さ制限
 */
export function truncateText(text: string, maxLength: number, ellipsis: string = '...'): string {
    if (!text || text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * JSON-LD スキーマの生成
 */
export function generateJsonLd(data: Record<string, any>): string {
    try {
        return JSON.stringify(data, null, 2);
    } catch (error) {
        seoLogger.error('JSON-LD generation failed', error);
        return '{}';
    }
}

/**
 * スキーマの検証
 */
export function validateSchema<T>(data: T, schema: Schema): ValidationResult<T> {
    const result: ValidationResult<T> = {
        isValid: true,
        errors: [],
        data
    };
    
    try {
        // 必須フィールドのチェック
        if (schema.required) {
            for (const requiredField of schema.required) {
                if (!(requiredField in (data as any))) {
                    result.errors.push(`Missing required field: ${requiredField}`);
                }
            }
        }
        
        // プロパティの検証
        if (schema.properties && data && typeof data === 'object') {
            for (const [key, property] of Object.entries(schema.properties)) {
                const value = (data as any)[key];
                
                if (value !== undefined && property.type) {
                    const actualType = typeof value;
                    const expectedType = property.type;
                    
                    if (actualType !== expectedType) {
                        result.errors.push(`Field '${key}' should be of type '${expectedType}', got '${actualType}'`);
                    }
                }
            }
        }
        
        result.isValid = result.errors.length === 0;
    } catch (error) {
        result.errors.push(`Schema validation error: ${(error as Error).message}`);
        result.isValid = false;
    }
    
    return result;
}

/**
 * パフォーマンス測定
 */
export function measurePerformance<T>(
    fn: () => T | Promise<T>,
    label: string
): T | Promise<T> {
    const start = performance.now();
    
    try {
        const result = fn();
        
        if (result instanceof Promise) {
            return result.finally(() => {
                const duration = performance.now() - start;
                seoLogger.performance(label, duration);
            });
        } else {
            const duration = performance.now() - start;
            seoLogger.performance(label, duration);
            return result;
        }
    } catch (error) {
        const duration = performance.now() - start;
        seoLogger.performance(label, duration, { error: (error as Error).message });
        throw error;
    }
}

/**
 * デバウンス関数
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    
    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

/**
 * スロットル関数
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;
    
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * キャッシュキーの生成
 */
export function generateCacheKey(prefix: string, data: any): string {
    try {
        const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
        const hash = btoa(dataString).replace(/[^a-zA-Z0-9]/g, '');
        return `${prefix}_${hash.substring(0, 16)}`;
    } catch (error) {
        const fallback = Math.random().toString(36).substring(2, 15);
        return `${prefix}_${fallback}`;
    }
}

/**
 * 画像URLの最適化
 */
export function optimizeImageUrl(url: string, options: ImageOptimizationOptions = {}): string {
    try {
        const urlObj = new URL(url);
        
        // クエリパラメータで最適化オプションを追加
        if (options.width) {
            urlObj.searchParams.set('w', String(options.width));
        }
        
        if (options.height) {
            urlObj.searchParams.set('h', String(options.height));
        }
        
        if (options.format) {
            urlObj.searchParams.set('f', options.format);
        }
        
        if (options.quality) {
            urlObj.searchParams.set('q', String(options.quality));
        }
        
        return urlObj.toString();
    } catch (error) {
        seoLogger.warn('Image URL optimization failed', error);
        return url;
    }
}

/**
 * リダイレクトチェーン解決
 */
export async function resolveRedirects(url: string, maxRedirects: number = 5): Promise<string> {
    let currentUrl = url;
    let redirectCount = 0;
    
    while (redirectCount < maxRedirects) {
        try {
            const response = await fetch(currentUrl, { 
                method: 'HEAD',
                redirect: 'manual'
            });
            
            if (response.status >= 300 && response.status < 400) {
                const location = response.headers.get('location');
                if (location) {
                    currentUrl = new URL(location, currentUrl).toString();
                    redirectCount++;
                    continue;
                }
            }
            
            break;
        } catch (error) {
            seoLogger.error('Redirect resolution failed', error);
            break;
        }
    }
    
    return currentUrl;
}

/**
 * ソーシャルプラットフォーム判定
 */
export function detectSocialPlatform(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('facebookexternalhit') || ua.includes('facebot')) {
        return 'facebook';
    }
    
    if (ua.includes('twitterbot')) {
        return 'twitter';
    }
    
    if (ua.includes('linkedinbot')) {
        return 'linkedin';
    }
    
    if (ua.includes('pinterest')) {
        return 'pinterest';
    }
    
    if (ua.includes('slackbot')) {
        return 'slack';
    }
    
    if (ua.includes('whatsapp')) {
        return 'whatsapp';
    }
    
    return 'unknown';
}

/**
 * OGP画像のサイズ検証
 */
export async function validateImageSize(imageUrl: string): Promise<{ width: number; height: number; isValid: boolean }> {
    return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
            const isValid = img.width >= 200 && img.height >= 200 &&
                           img.width <= 1200 && img.height <= 630;
            
            resolve({
                width: img.width,
                height: img.height,
                isValid
            });
        };
        
        img.onerror = () => {
            resolve({ width: 0, height: 0, isValid: false });
        };
        
        img.src = imageUrl;
    });
}

/**
 * 構造化データのminify
 */
export function minifyJsonLd(jsonLd: string): string {
    try {
        const parsed = JSON.parse(jsonLd);
        return JSON.stringify(parsed);
    } catch (error) {
        seoLogger.warn('JSON-LD minification failed', error);
        return jsonLd;
    }
}

/**
 * レスポンス時間測定
 */
export async function measureResponseTime(url: string): Promise<number> {
    const start = performance.now();
    
    try {
        await fetch(url, { method: 'HEAD' });
        return performance.now() - start;
    } catch (error) {
        seoLogger.error('Response time measurement failed', error);
        return -1;
    }
}

/**
 * 安全なデータアクセス
 */
export function safeGet<T>(obj: any, path: string, defaultValue?: T): T | undefined {
    try {
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current == null || !(key in current)) {
                return defaultValue;
            }
            current = current[key];
        }
        
        return current;
    } catch (error) {
        return defaultValue;
    }
}

/**
 * エラー分類
 */
export function categorizeError(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
        return 'network';
    }
    
    if (message.includes('timeout')) {
        return 'timeout';
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
        return 'permission';
    }
    
    if (message.includes('not found') || message.includes('404')) {
        return 'notfound';
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
        return 'validation';
    }
    
    return 'unknown';
}