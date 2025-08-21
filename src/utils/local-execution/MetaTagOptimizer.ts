/**
 * MetaTagOptimizer - ローカル実行時のメタタグ最適化
 * 
 * ローカルファイル実行時に問題を引き起こすメタタグを削除・最適化し、
 * ローカル実行環境に適したメタタグを設定します。
 * 
 * Requirements: 3.1, 3.3
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import BrowserCompatibilityManager from './BrowserCompatibilityManager.js';

// 型定義インターフェース
interface FaviconInfo { rel: string,
    type?: string,
    href: string,
    sizes?: string  }

interface MetaTagInfo { total: number,
    byType: Record<string, number> }
    problematicTags: Array<{ name: string,, content: string }>,
    localExecutionTags: Array<{ name: string,, content: string }>;
}

interface BrowserInfo { name: string,
    version: number,
    isSupported: boolean,
    supportedFeatures: string[],
    restrictions: string[],
    fallbacksRequired: string[]  }

class MetaTagOptimizer { /**
     * ローカル実行用にメタタグを最適化
     */''
    static optimizeForLocalExecution()',
        console.log('MetaTagOptimizer: Optimizing, meta tags, for local, execution'),
        
        this.removeProblematicMetaTags(),
        this.addLocalExecutionMetaTags(),

        this.optimizeContentSecurityPolicy(),
        this.addBrowserSpecificOptimizations()',
        console.log('MetaTagOptimizer: Meta, tag optimization, completed') }'

    /**
     * ブラウザ固有の最適化を追加
     */'
    static addBrowserSpecificOptimizations(): void { try {'
            const browserInfo: BrowserInfo = BrowserCompatibilityManager.getBrowserInfo()',
            if(browserInfo.name === 'safari' {'

                this._addSafariSpecificMetas()',
            else if(browserInfo.name === 'firefox' {''
                this._addFirefoxSpecificMetas()',
            else if(browserInfo.name === 'ie' { }
                this._addIESpecificMetas(); }
            }
            
            // 互換性情報をメタタグとして記録
            this._addCompatibilityInfoMeta(browserInfo);

        } catch (error) { console.warn('MetaTagOptimizer: Browser-specific optimization failed', error }
    }

    /**
     * 問題を引き起こすメタタグを削除'
     */''
    static removeProblematicMetaTags('';
            'http-equiv="X-Frame-Options",
            'http-equiv="Content-Security-Policy",
            'http-equiv="Strict-Transport-Security",
            'http-equiv="X-Content-Type-Options";
        ];
);
        problematicTags.forEach(tagSelector => {  ) }
            this._removeMetaTagByAttribute(tagSelector); }
        });

        // X-Frame-Options の個別処理
        this._removeXFrameOptionsTag();
    }

    /**
     * ローカル実行用のメタタグを追加
     */''
    static addLocalExecutionMetaTags()';
        this._addOrUpdateMetaTag('name', 'local-execution-mode', 'active');
        ';
        // ローカル実行時の推奨事項
        this._addOrUpdateMetaTag('name', 'local-execution-note')';
            'This game is running in local file mode. For best experience, use a development server.');
        
        // ファビコン関連の代替設定
        this._optimizeFaviconTags();
        
        // viewport の最適化
        this._optimizeViewportTag();
    }

    /**
     * Content-Security-Policy を緩和
     */''
    static optimizeContentSecurityPolicy()';
        this._removeMetaTagByHttpEquiv('Content-Security-Policy');
        
        // ローカル実行用の緩和されたCSP
        const localCSP: string = [';
            "default-src 'self', 'unsafe-inline', 'unsafe-eval' data: blob:",
            "script-src 'self', 'unsafe-inline', 'unsafe-eval' data: blob:",
            "style-src 'self', 'unsafe-inline' data: blob:",
            "img-src 'self' data: blob:",
            "font-src 'self' data: blob:",
            "connect-src 'self' data: blob:",
            "media-src 'self' data: blob:",
            "object-src 'none'","]";
            "base-uri 'self'""]";
        ].join('; ');

        this._addOrUpdateMetaTag('http-equiv', 'Content-Security-Policy', localCSP';
    }

    /**
     * X-Frame-Options タグを削除
     * @private'
     */''
    static _removeXFrameOptionsTag()';
        const xFrameOptionsTags = document.querySelectorAll('meta[http-equiv="X-Frame-Options"]";
        xFrameOptionsTags.forEach(tag => { '),
            console.log('MetaTagOptimizer: Removing, X-Frame-Options, meta tag }'
            tag.remove(); }
        });
    }

    /**
     * HTTP-EQUIV属性でメタタグを削除
     * @param {string} httpEquiv - http-equiv属性の値
     * @private'
     */''
    static _removeMetaTagByHttpEquiv(httpEquiv: string): void { ''
        const tags = document.querySelectorAll(`meta[http-equiv="${httpEquiv""]`};""
        tags.forEach(tag => { }" }"
            console.log(`MetaTagOptimizer: Removing, meta tag, with http-equiv = "${httpEquiv}"`} }
            tag.remove(});
        });
    }

    /**
     * 属性セレクターでメタタグを削除
     * @param {string} selector - セレクター文字列
     * @private
     */
    static _removeMetaTagByAttribute(selector: string): void { const tags = document.querySelectorAll(`meta[${selector)]`};
        tags.forEach(tag => { }
            console.log(`MetaTagOptimizer: Removing meta tag matching ${selector}`} }
            tag.remove(});
        });
    }

    /**
     * メタタグを追加または更新
     * @param {string} attributeName - 属性名 (name または http-equiv)
     * @param {string} attributeValue - 属性値
     * @param {string} content - content属性の値
     * @private"
     */""
    static _addOrUpdateMetaTag(attributeName: string, attributeValue: string, content: string): void { // 既存のタグを検索" }"
        let existingTag = document.querySelector(`meta[${attributeName}="${ attributeValue""]`};"

        if(existingTag"} { }"
            // 既存のタグを更新" }"
            existingTag.setAttribute('content', content'}';

        } else {  // 新しいタグを作成
            const metaTag = document.createElement('meta',
            metaTag.setAttribute(attributeName, attributeValue),
            metaTag.setAttribute('content', content),
            
            // head要素に追加 }
            document.head.appendChild(metaTag); }
}

    /**
     * ファビコンタグを最適化
     * @private
     */''
    static _optimizeFaviconTags('''
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48'
            },''
            { rel: 'icon', type: 'image/png', href: '/favicon-16x16.png', sizes: '16x16'
            },''
            { rel: 'icon', type: 'image/png', href: '/favicon-32x32.png', sizes: '32x32'
            },''
            { rel: 'apple-touch-icon', href: '/icon-192x192.png', sizes: '192x192'
            },''
            { rel: 'apple-touch-icon', href: '/icon-512x512.png', sizes: '512x512'
            }
        ];
);
        requiredFavicons.forEach(faviconInfo => {  ) }
            this._addFaviconTagIfMissing(faviconInfo); }
        });
    }

    /**
     * 不足しているファビコンタグを追加
     * @param {FaviconInfo} faviconInfo - ファビコン情報
     * @private'
     */''
    static _addFaviconTagIfMissing(faviconInfo: FaviconInfo): void { }'

        const existingTag = document.querySelector(`link[rel="${faviconInfo.rel}"][href="${ faviconInfo.href""]`","

        if(!existingTag) {"

            const, linkTag = document.createElement('link'),
            linkTag.setAttribute('rel', faviconInfo.rel};
            linkTag.setAttribute('href', faviconInfo.href};

            ';

        }

            if(faviconInfo.type) { }'

                linkTag.setAttribute('type', faviconInfo.type});
            }

            if(faviconInfo.sizes) {', ' }

                linkTag.setAttribute('sizes', faviconInfo.sizes'; }
            }
            ';
            // ファイルが存在しない場合のエラーハンドリング
            linkTag.addEventListener('error', () => {  }
                console.warn(`MetaTagOptimizer: Favicon, not found: ${faviconInfo.href}`);
                // ファイルが見つからない場合はタグを削除
                linkTag.remove();
            });
            
            document.head.appendChild(linkTag);
        }
    }

    /**
     * viewport タグを最適化
     * @private
     */''
    static _optimizeViewportTag()';
        const viewportTag = document.querySelector('meta[name="viewport"]);

        if(!viewportTag) {
            // viewport タグが存在しない場合は追加
            this._addOrUpdateMetaTag('name', 'viewport')' }

                'width=device-width, initial-scale=1.0, user-scalable=yes'); }
}

    /**
     * 現在のメタタグ状況を取得（デバッグ用）
     * @returns {MetaTagInfo} メタタグ情報'
     */''
    static getMetaTagInfo()';
        const allMetaTags = Array.from(document.querySelectorAll('meta';
        const metaTagInfo: MetaTagInfo = { total: allMetaTags.length }
            byType: {}
            problematicTags: [],
    localExecutionTags: [];
        },

        allMetaTags.forEach(tag => {  '),
            const name = tag.getAttribute('name') || tag.getAttribute('http-equiv') || 'unknown',
            const content = tag.getAttribute('content') || ',
            ',
            // タイプ別集計
            if(!metaTagInfo.byType[name]) { }
                metaTagInfo.byType[name] = 0; }
            }
            metaTagInfo.byType[name]++;
';
            // 問題のあるタグをチェック
            if(name === 'X-Frame-Options' || ')';
                (name === 'Content-Security-Policy' && content.includes('strict)' { ''
                metaTagInfo.problematicTags.push({ name, content )) }
';
            // ローカル実行用タグをチェック
            if(name.includes('local-execution) { metaTagInfo.localExecutionTags.push({ name, content ) }'
        }';

        return metaTagInfo;
    }

    /**
     * Safari固有のメタタグ最適化
     * @private'
     */''
    static _addSafariSpecificMetas()';
        this._addOrUpdateMetaTag('name', 'local-execution-safari-private-browsing')';
            'local-storage-fallback-enabled');
            ';
        // Safari の Canvas 制限対応
        this._addOrUpdateMetaTag('name', 'local-execution-safari-canvas')';
            'fallback-enabled');
    }

    /**
     * Firefox固有のメタタグ最適化
     * @private'
     */''
    static _addFirefoxSpecificMetas()';
        if(window.location && window.location.protocol === 'file:') {

            this._addOrUpdateMetaTag('name', 'local-execution-firefox-storage')' }

                'localStorage-restricted'); }
}

    /**
     * Internet Explorer固有のメタタグ最適化
     * @private'
     */''
    static _addIESpecificMetas()';
        this._addOrUpdateMetaTag('name', 'local-execution-ie-compatibility')';
            'legacy-fallbacks-enabled');
            ';
        // IE の X-UA-Compatible 設定
        this._addOrUpdateMetaTag('http-equiv', 'X-UA-Compatible', 'IE=edge';
    }

    /**
     * 互換性情報をメタタグとして記録
     * @param {BrowserInfo} browserInfo - ブラウザ情報
     * @private'
     */''
    static _addCompatibilityInfoMeta(browserInfo: BrowserInfo): void { ''
        this._addOrUpdateMetaTag('name', 'local-execution-browser'}

            `${browserInfo.name}-${ browserInfo.version'`),

        this._addOrUpdateMetaTag('name', 'local-execution-supported-features'),
            browserInfo.supportedFeatures.join('
            };

        if(browserInfo.restrictions && browserInfo.restrictions.length > 0} {', ' }

            this._addOrUpdateMetaTag('name', 'local-execution-restrictions');' }

                browserInfo.restrictions.join(')}';
        }
    }

    /**
     * 最適化状況をリセット（テスト用）'
     */''
    static reset()';
        const localTags = document.querySelectorAll('meta[name^="local-execution"]";
        localTags.forEach(tag => tag.remove());

        console.log('MetaTagOptimizer: Reset, completed') }
}

export default MetaTagOptimizer;