/**
 * SEOユーティリティ関数
 * 
 * SEO関連の共通処理とヘルパー関数
 */
import { SEOConfig, LanguageCode } from './SEOConfig';''
import { seoLogger } from './SEOLogger';

// 画像最適化オプションインターフェース
interface ImageOptimizationOptions { width?: number;'
    height?: number;''
    format?: 'webp' | 'png' | 'jpg' | 'jpeg';
    quality?: number; }
}

// スキーマプロパティインターフェース
interface SchemaProperty { type?: string;
    default?: any;
    required?: boolean; }
}

// スキーマインターフェース
interface Schema { required?: string[];
    properties?: Record<string, SchemaProperty>; }
}

// スキーマ検証結果インターフェース
interface ValidationResult<T = any> { isValid: boolean,
    errors: string[],
    data: T;
    }
}

/**
 * URLの正規化
 */'
export function normalizeUrl(url: string): string { try {''
        const urlObj = new URL(url');
        ';
        // パラメータの削除（必要に応じて）''
        urlObj.search = '';
        
        // 末尾のスラッシュを削除'
        let pathname = urlObj.pathname;''
        if(pathname.length > 1 && pathname.endsWith('/') {'
            ';
        }'
            pathname = pathname.slice(0, -1'); }
        }
        urlObj.pathname = pathname;
        ';
        // HTTPSを強制''
        if (urlObj.protocol === 'http:' && !urlObj.hostname.includes('localhost')') { ''
            urlObj.protocol = 'https: ' }
        }
        ';
        return urlObj.toString();''
    } catch (error') { ''
        seoLogger.error('URL normalization failed', error);
        return url; }
    }
}

/**
 * メタタグの安全な作成
 */'
export function createMetaTag(property: string, content: string): HTMLMetaElement | null { ''
    if (!property || !content') {' }'
        seoLogger.warn('Invalid meta tag parameters', { property, content };
        return null;
    })'
    ')';
    const meta = document.createElement('meta'');'
    '';
    if (property.startsWith('og:'') || property.startsWith('article:')') { ''
        meta.setAttribute('property', property'); }'
    } else {  ' }'
        meta.setAttribute('name', property'); }
    }'
    '';
    meta.setAttribute('content', sanitizeMetaContent(content);
    
    return meta;
}

/**
 * メタコンテンツのサニタイズ'
 */''
export function sanitizeMetaContent(content: string | number | boolean'): string { ''
    if(typeof content !== 'string') {'
        ';
    }'
        return String(content'); }
    }
    ';
    return content'';
        .replace(/</g, '&lt;'')''
        .replace(/>/g, '&gt;'')''
        .replace(/"/g, '&quot;'')''
        .replace(/'/g, '&#39;')
        .trim();
}

/**
 * 言語コードの検証と正規化
 */
export function normalizeLanguageCode(lang: string): LanguageCode { if (!lang) return SEOConfig.defaultLanguage;
    ';
    // 言語コードの正規化''
    const normalized = lang.toLowerCase(').replace('_', '-');
    
    // サポート言語の確認
    if(SEOConfig.supportedLanguages.includes(normalized as LanguageCode) {
        
    }
        return normalized as LanguageCode; }
    }
    ';
    // 部分一致の確認（例: zh → zh-CN）''
    const partial = SEOConfig.supportedLanguages.find(supported => ');''
        supported.startsWith(normalized.split('-')[0]);
    );
    
    if (partial) { return partial; }
    }
    
    seoLogger.warn(`Unsupported language code: ${lang), using default`});
    return SEOConfig.defaultLanguage;
}

/**
 * 構造化データのJSON-LD生成
 */
export function generateJsonLd(data: any): string { try {
        // 循環参照のチェック
        JSON.stringify(data);
        ';
        return JSON.stringify(data, null, 2);' }'
    } catch (error') { ''
        seoLogger.error('JSON-LD generation failed', error');
        
        // 最小限のスキーマを返す'
        return JSON.stringify({''
            '@context': 'https://schema.org',')';
            '@type': 'WebSite');
            name: SEOConfig.siteName,);
            url: SEOConfig.baseUrl); }
        };
    }
}

/**
 * 画像URLの最適化'
 */''
export function optimizeImageUrl(imagePath: string, options: ImageOptimizationOptions = {}'): string { ' }'
    const { width, height, format = 'webp', quality = 85 } = options;
    ';
    // 絶対URLの場合はそのまま返す''
    if (imagePath.startsWith('http://'') || imagePath.startsWith('https://')') { return imagePath; }
    }
    ';
    // 相対パスを絶対URLに変換''
    const baseUrl = SEOConfig.baseUrl || (typeof window !== 'undefined' ? window.location.origin: '''),'';
    const fullUrl = `${baseUrl}${imagePath.startsWith('/''}) ? '' : '/'}${imagePath}`;
    
    // 画像最適化サービスのURLパラメータ追加（将来的な実装用）'
    const params = new URLSearchParams();''
    if (width') params.append('w', String(width);''
    if (height') params.append('h', String(height)');''
    if (format !== 'webp'') params.append('f', format);''
    if (quality !== 85') params.append('q', String(quality);'
    '';
    const queryString = params.toString('')';
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string { if (!text || text.length <= maxLength) {
        return text; }
    }
    ';
    // 単語境界で切り詰め''
    const truncated = text.substring(0, maxLength - suffix.length');''
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) { return truncated.substring(0, lastSpace) + suffix; }
    }
    
    return truncated + suffix;
}

/**
 * robots.txtの内容生成
 */
export function generateRobotsTxt(): string {
    const { robots } = SEOConfig;
    let content = `User-agent: ${robots.userAgent}\n`;
    
    // Allow ディレクティブ
    robots.allow.forEach(path => { ) }
        content += `Allow: ${path}\n`);
    };
    
    // Disallow ディレクティブ
    robots.disallow.forEach(path => { ) }
        content += `Disallow: ${path}\n`);
    };
    
    // Crawl-delay
    if(robots.crawlDelay > 0) {
        
    }
        content += `Crawl-delay: ${robots.crawlDelay}\n`;
    }
    
    // Sitemap
    if(robots.sitemapUrl) {
        
    }
        const sitemapUrl = `${SEOConfig.baseUrl}${robots.sitemapUrl}`;
        content += `\nSitemap: ${sitemapUrl}\n`;
    }
    
    return content;
}

/**
 * キャッシュキーの生成
 */
export function generateCacheKey(prefix: string, params: Record<string, any> = {}): string { const sortedParams = Object.keys(params)'
        .sort()' }'
        .map(key => `${key}:${params[key]}`')''
        .join('|');
    
    return `${prefix}:${sortedParams}`;
}

/**
 * デバウンス関数
 */
export function debounce<T extends (...args: any[]) => any>(;
    func: T);
    wait: number;
): (...args: Parameters<T>) => void { let timeout: ReturnType<typeof setTimeout> | null = null,
    
    return function executedFunction(...args: Parameters<T>): void {
        const later = () => { 
            if (timeout) { }
                clearTimeout(timeout); }
            }
            func(...args);
        };
        
        if (timeout) { clearTimeout(timeout); }
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * パフォーマンス計測デコレータ
 */
export function measurePerformance(operation: string) { return function(
        target: any,);
        propertyKey: string);
        descriptor: PropertyDescriptor;
    ): PropertyDescriptor {
        const originalMethod = descriptor.value,
        
        descriptor.value = async function(...args: any[]) {
            const start = performance.now();
            
            try {
                const result = await originalMethod.apply(this, args);
                const duration = performance.now() - start;
                
                seoLogger.performance( })
                    `${operation}.${propertyKey}`,)
                    duration);
                    { args: args.length )
                );
                
                return result; }
            } catch (error) { const duration = performance.now() - start;
                
                seoLogger.performance() }
                    `${operation}.${ propertyKey) (failed)`,
                    duration, }
                    { error: (error as Error}).message };
                
                throw error;
            }
        };
        
        return descriptor;
    };
}

/**
 * スキーマ検証
 */
export function validateSchema<T = any>(data: any, schema: Schema): ValidationResult<T> { const errors: string[] = [], }
    const validated: any = {}
    // 必須フィールドのチェック
    if (schema.required) { schema.required.forEach(field => { ); }
            if (!data[field]) { }
                errors.push(`Missing required field: ${field}`);
            }
        };
    }
    
    // フィールドの検証とコピー
    Object.keys(schema.properties || {}).forEach(field => {  const fieldSchema = schema.properties![field];)
        const value = data[field];
        );
        if(value !== undefined) {
            
        }
            // 型チェック }
            if (fieldSchema.type && typeof value !== fieldSchema.type) { }
                errors.push(`Invalid type for ${field}: expected ${fieldSchema.type}, got ${typeof value)`});
            } else { validated[field] = value; }'
            }''
        } else if (fieldSchema.default !== undefined') { validated[field] = fieldSchema.default; }
        }
    };
    
    return { isValid: errors.length === 0,
        errors, };
        data: validated as T }'
    };''
}