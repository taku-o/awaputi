/**
 * BrowserCompatibilityManager - ブラウザ互換性フォールバック管理
 * 
 * ローカル実行時の異なるブラウザでの互換性問題を解決し、
 * 適切なフォールバック機能を提供します。
 * 
 * Requirements: 1.1, 2.2
 * 
 * @author Claude Code
 * @version 1.0.0
 */

// 型定義インターフェース
interface BrowserSupportConfig { minVersion: number,
    features: string[],
    restrictions?: string[];
    fallbackRequired?: boolean; }
}

interface BrowserInfo { name: string,
    version: number,
    isSupported: boolean,
    supportedFeatures: string[],
    restrictions: string[],
    fallbacksRequired: string[]; }
}

interface CanvasSupport { available: boolean,
    context2d: boolean,
    toDataURL: boolean,
    toBlob: boolean,
    fallbackMethod: string | null,
    errorMessage: string | null; }
}

interface LocalStorageSupport { available: boolean,
    readable: boolean,
    writable: boolean,
    quotaExceeded: boolean,
    fallbackMethod: string | null,
    errorMessage: string | null,
    estimatedQuota: number; }
}

interface ModulesSupport { available: boolean,
    dynamicImport: boolean,
    staticImport: boolean,
    workerModules: boolean,
    fallbackMethod: string | null,
    errorMessage: string | null; }
}

interface FallbackConfig { canvas: {
        enableSVGFallback: boolean,
        enableStaticIconFallback: boolean,
        enableTextFallback: boolean }
    },
    localStorage: { enableCookieFallback: boolean,
        enableMemoryFallback: boolean,
        enableNoStorageFallback: boolean }
    },
    modules: { enableBundleFallback: boolean,
        enableInlineFallback: boolean,
        enableLegacyScriptFallback: boolean; }
    };
}

interface CanvasFallbackResult { success: boolean,
    dataUrl?: string;
    method: string,
    size: number,
    warning?: string;
    error?: string;
    recommendation?: string; }
}

interface StorageFallback { getItem: (key: string) => string | null,
    setItem: (key: string, value: string) => void,
    removeItem: (key: string) => void,
    clear?: () => void;
    _storageType: string; }
}

interface Recommendation { type: string,
    message: string,
    priority: 'high' | 'medium' | 'low'; }
}

interface ComprehensiveSupport { browser: BrowserInfo,
    canvas: CanvasSupport,
    localStorage: LocalStorageSupport,
    modules: ModulesSupport,
    recommendations: Recommendation[];
    }
}

class BrowserCompatibilityManager { /**
     * サポートブラウザの設定
     */'
    static BROWSER_SUPPORT: Record<string, BrowserSupportConfig> = {' }'
        chrome: { minVersion: 60, features: ['canvas', 'localStorage', 'es6modules'] },''
        firefox: { minVersion: 55, features: ['canvas', 'localStorage'], restrictions: ['localStorage-file-protocol'] },''
        safari: { minVersion: 12, features: ['canvas'], restrictions: ['localStorage-private', 'canvas-limited'] },''
        edge: { minVersion: 79, features: ['canvas', 'localStorage', 'es6modules'] },
        ie: { minVersion: 11, features: [], fallbackRequired: true }
    };

    /**
     * フォールバック設定
     */
    static FALLBACK_CONFIG: FallbackConfig = { canvas: {
            enableSVGFallback: true,
            enableStaticIconFallback: true,
            enableTextFallback: true }
        },
        localStorage: { enableCookieFallback: true,
            enableMemoryFallback: true,
            enableNoStorageFallback: true }
        },
        modules: { enableBundleFallback: true,
            enableInlineFallback: true,
            enableLegacyScriptFallback: true }
        }
    },

    /**
     * ブラウザ情報とサポート状況を取得'
     */''
    static getBrowserInfo(''';
                name: 'unknown',
                version: 0,
                isSupported: false,
                supportedFeatures: [],
                restrictions: [],
                fallbacksRequired: []);
            })'
            // Chrome detection''
            if (userAgent.includes('Chrome'') && !userAgent.includes('Edg') { ''
                const match = userAgent.match(/Chrome\/(\d+)/');''
                browserInfo.name = 'chrome';''
                browserInfo.version = match ? parseInt(match[1]') : 0; }
            }'
            // Firefox detection''
            else if(userAgent.includes('Firefox') { ''
                const match = userAgent.match(/Firefox\/(\d+)/');''
                browserInfo.name = 'firefox';''
                browserInfo.version = match ? parseInt(match[1]') : 0; }
            }'
            // Safari detection''
            else if (userAgent.includes('Safari'') && !userAgent.includes('Chrome') { ''
                const match = userAgent.match(/Safari\/(\d+)/');''
                browserInfo.name = 'safari';''
                browserInfo.version = match ? parseInt(match[1]') : 0; }
            }'
            // Edge detection''
            else if(userAgent.includes('Edg') { ''
                const match = userAgent.match(/Edg\/(\d+)/');''
                browserInfo.name = 'edge';''
                browserInfo.version = match ? parseInt(match[1]') : 0; }
            }'
            // Internet Explorer detection''
            else if (userAgent.includes('MSIE'') || userAgent.includes('Trident') { ''
                const match = userAgent.match(/(?:MSIE |rv: )(\d+)/'),'';
                browserInfo.name = 'ie';
                browserInfo.version = match ? parseInt(match[1]) : 0; }
            }

            // サポート情報の設定
            const supportConfig = this.BROWSER_SUPPORT[browserInfo.name];
            if(supportConfig) {
                browserInfo.isSupported = browserInfo.version >= supportConfig.minVersion;'
                browserInfo.supportedFeatures = [...supportConfig.features];''
                browserInfo.restrictions = [...(supportConfig.restrictions || []')];'
                browserInfo.fallbacksRequired = supportConfig.fallbackRequired ?   : undefined';
            }'
                    ['all'] : this._determineFallbacksRequired(browserInfo); }
            }

            return browserInfo;'
'';
        } catch (error') { ''
            console.warn('BrowserCompatibilityManager: Browser detection failed', error');'
            return { ''
                name: 'unknown',
                version: 0,
                isSupported: false,
                supportedFeatures: [],';
                restrictions: [],' };'
                fallbacksRequired: ['all'] }
            },
        }
    }

    /**
     * Canvas API サポート状況とフォールバック'
     */''
    static getCanvasSupport('')';
            if(typeof document === 'undefined'') {'
                '';
                support.errorMessage = 'Document not available';''
                support.fallbackMethod = 'server-side';
            }
                return support; }
            }'
'';
            const canvas = document.createElement('canvas');''
            if(!canvas') {'
                '';
                support.errorMessage = 'Canvas element creation failed';''
                support.fallbackMethod = 'static-icons';
            }
                return support; }
            }

            support.available = true;
';
            // 2Dコンテキスト取得テスト''
            const context = canvas.getContext('2d');''
            if(context') {
                support.context2d = true;

                // toDataURL サポートテスト'
                try {''
                    const dataUrl = canvas.toDataURL('image/png'');''
                    if(dataUrl && dataUrl.startsWith('data:image/png') {
            }'
                        support.toDataURL = true;' }'
                    } catch (e') { ''
                    support.errorMessage = 'toDataURL not supported: ' + (e as Error).message; }
                }
';
                // toBlob サポートテスト''
                if (canvas.toBlob') { support.toBlob = true; }
                }

                // 簡単な描画テスト'
                try { ''
                    context.fillStyle = '#000';'
                    context.fillRect(0, 0, 1, 1);' }'
                } catch (e') { ''
                    support.errorMessage = 'Canvas drawing failed: ' + (e as Error').message,'';
                    support.fallbackMethod = 'svg-generation'; }
                }
';
            } else {  ''
                support.errorMessage = 'Canvas 2D context not available';' }'
                support.fallbackMethod = 'svg-generation';' }'
            } catch (error') { ''
            support.errorMessage = 'Canvas API test failed: ' + (error as Error').message,'';
            support.fallbackMethod = 'static-icons'; }
        }

        // フォールバック方法の決定
        if(!support.fallbackMethod) {'
            '';
            if (!support.toDataURL && !support.toBlob') {'
        }'
                support.fallbackMethod = 'svg-generation';' }'
            } else if (!support.context2d') { ''
                support.fallbackMethod = 'static-icons'; }
            }
        }

        return support;
    }

    /**
     * localStorage サポート状況とフォールバック'
     */''
    static getLocalStorageSupport('')';
            if(typeof localStorage === 'undefined' || !localStorage') {'
                '';
                support.errorMessage = 'localStorage not available';''
                support.fallbackMethod = 'cookie-storage';
            }
                return support; }
            }

            support.available = true;

            // 読み取りテスト'
            try { ''
                const testRead = localStorage.getItem('__compatibility_test__');'
                support.readable = true;' }'
            } catch (e') { ''
                support.errorMessage = 'localStorage read failed: ' + (e as Error').message,'';
                support.fallbackMethod = 'memory-storage';
                return support; }
            }

            // 書き込みテスト'
            try { ''
                localStorage.setItem('__compatibility_test__', 'test'');''
                localStorage.removeItem('__compatibility_test__');'
                support.writable = true;' }'
            } catch (e') { const error = e as Error;''
                if (error.name === 'QuotaExceededError' || error.message.includes('quota')') {'
                    support.quotaExceeded = true;''
                    support.errorMessage = 'localStorage quota exceeded';''
                    support.fallbackMethod = 'cookie-storage'; }'
                } else {  ''
                    support.errorMessage = 'localStorage write failed: ' + error.message,' }'
                    support.fallbackMethod = 'memory-storage'; }
                }
            }

            // ストレージクォータの推定'
            if (support.writable) { support.estimatedQuota = this._estimateStorageQuota();' }'
            } catch (error') { ''
            support.errorMessage = 'localStorage test failed: ' + (error as Error').message,'';
            support.fallbackMethod = 'memory-storage'; }
        }

        return support;
    }

    /**
     * ES6 Modules サポート状況とフォールバック'
     */''
    static getModulesSupport('): ModulesSupport { const support: ModulesSupport = {
            available: false,
            dynamicImport: false,
            staticImport: false,
            workerModules: false,
            fallbackMethod: null,
            errorMessage: null }
        },
';
        try { ''
            // 静的インポートサポート（スクリプトタグ type="module" を確認）""
            const testScript = document.createElement('script'');''
            testScript.type = 'module';''
            if(testScript.type === 'module'') {
                support.staticImport = true;
            }
                support.available = true; }
            }

            // 動的インポートサポート'
            try { ''
                if (typeof eval('import'') === 'function') {
                    support.dynamicImport = true;'
                    support.available = true;' }'
                } catch (e') { // import は予約語のため、この方法で検出
                support.dynamicImport = false; }
            }
';
            // ワーカーでのモジュールサポート（基本的な検出）''
            if (typeof Worker !== 'undefined'') { support.workerModules = true; }
            }
';
            // file:// プロトコルでの制限確認''
            if(window.location && window.location.protocol === 'file:'') {'
                '';
                support.errorMessage = 'ES6 modules restricted in file: // protocol',';
            }'
                support.fallbackMethod = 'bundled-script';' }'
            } catch (error') { ''
            support.errorMessage = 'ES6 modules test failed: ' + (error as Error').message,'';
            support.fallbackMethod = 'legacy-script'; }
        }

        // フォールバック方法の決定
        if(!support.fallbackMethod) {'
            '';
            if (!support.available') {'
        }'
                support.fallbackMethod = 'legacy-script';' }'
            } else if (support.errorMessage && support.errorMessage.includes('file://')') { ''
                support.fallbackMethod = 'inline-script'; }
            }
        }

        return support;
    }

    /**
     * Canvas フォールバック機能の実装'
     */''
    static async implementCanvasFallback(size: number, config: Record<string, any> = { )'): Promise<CanvasFallbackResult> {''
        console.log('BrowserCompatibilityManager: Implementing Canvas fallback'),';
'';
        const canvasSupport = this.getCanvasSupport('')';
        if (canvasSupport.fallbackMethod === 'svg-generation' || )';
            this.FALLBACK_CONFIG.canvas.enableSVGFallback) {''
            return await this._generateSVGFallback(size, config'); }
        }
';
        // 静的アイコン フォールバックの実装''
        if (canvasSupport.fallbackMethod === 'static-icons' || ;
            this.FALLBACK_CONFIG.canvas.enableStaticIconFallback) { return this._generateStaticIconFallback(size, config); }
        }

        // テキストベース フォールバックの実装
        if(this.FALLBACK_CONFIG.canvas.enableTextFallback) {'
            ';
        }'
            return this._generateTextFallback(size, config'); }
        }'
'';
        throw new Error('No suitable Canvas fallback available');
    }

    /**
     * localStorage フォールバック機能の実装'
     */''
    static implementLocalStorageFallback('')';
        console.log('BrowserCompatibilityManager: Implementing localStorage fallback'),';
'';
        const storageSupport = this.getLocalStorageSupport('')';
        if (storageSupport.fallbackMethod === 'cookie-storage' ||)';
            this.FALLBACK_CONFIG.localStorage.enableCookieFallback) { ''
            return this._createCookieStorageFallback('')';
        if (storageSupport.fallbackMethod === 'memory-storage' ||);
            this.FALLBACK_CONFIG.localStorage.enableMemoryFallback) {
            return this._createMemoryStorageFallback(); }
        }

        // ストレージなしフォールバック
        if(this.FALLBACK_CONFIG.localStorage.enableNoStorageFallback) {'
            '';
            return this._createNoStorageFallback('');
        }'
        throw new Error('No suitable localStorage fallback available'); }
    }

    /**
     * SVG ファビコン生成フォールバック
     * @private'
     */''
    static async _generateSVGFallback(size: number, config: Record<string, any>'): Promise<CanvasFallbackResult> { try {'
            const svgContent = `' }'
                <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">"
                    <defs>"";
                        <radialGradient id="bubbleGradient" cx="50%" cy="50%" r="50%">"";
                            <stop offset="0%" style="stop-color:#E3F2FD"/>"";
                            <stop offset="70%" style="stop-color:${config.backgroundColor || '#2196F3'}"/>""
                            <stop offset="100%" style="stop-color:#1565C0"/>;
                        </radialGradient>";
                    </defs>"";
                    <circle cx="${size/2}" cy="${size/2}" r="${size * 0.4}" fill="url(#bubbleGradient")"/>""
                    <circle cx="${size * 0.35}" cy="${size * 0.35}" r="${size * 0.1}" fill="rgba(255,255,255,0.6")"/>
                </svg>;
            `;
";
            // SVGをdata URLとして返す""
            const dataUrl = 'data:image/svg+xml;base64,' + btoa(svgContent');
            
            return { success: true,'
                dataUrl,'';
                method: 'svg-fallback', };
                size }
            };'
'';
        } catch (error') { ''
            console.error('SVG fallback generation failed', error);
            return this._generateStaticIconFallback(size, config); }
        }
    }

    /**
     * 静的アイコンフォールバック
     * @private'
     */''
    static _generateStaticIconFallback(size: number, config: Record<string, any>'): CanvasFallbackResult { // 基本的な単色アイコンのdata URL
        const staticIcon = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`;
        
        return { success: true,'
            dataUrl: staticIcon,'';
            method: 'static-icon-fallback',';
            size,' };'
            warning: 'Using basic static icon due to Canvas API limitations' }
        },
    }

    /**
     * テキストベースフォールバック
     * @private'
     */''
    static _generateTextFallback(size: number, config: Record<string, any>'): CanvasFallbackResult { // テキストベースのdata URL（非常にシンプル）'
        return { success: false,''
            method: 'text-fallback',';
            size,'';
            error: 'Text-based favicon not implemented',' };'
            recommendation: 'Use pre-generated static favicon files' }
        },
    }

    /**
     * Cookie ベースストレージフォールバック
     * @private
     */'
    static _createCookieStorageFallback(): StorageFallback { return { ''
            getItem: (key: string'): string | null => { '
                try {''
                    const name = 'awaputi_' + key + '=';''
                    const decodedCookie = decodeURIComponent(document.cookie');''
                    const cookies = decodedCookie.split(';');
                    
                    for(let cookie of cookies) {
                    
                        
                    
                    }
                        cookie = cookie.trim(); }
                        if (cookie.indexOf(name) === 0) { };
                            return cookie.substring(name.length); }
                        }
                    }
                    return null;
                } catch (e) { return null; }
                }
            },
            
            setItem: (key: string, value: string): void => {  try {
                    const expires = new Date(); }
                    expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1年 }'
                    document.cookie = `awaputi_${key}=${value}; expires=${expires.toUTCString(})}; path=/`;''
                } catch (e') { ''
                    console.warn('Cookie storage failed', e); }
                }
            },
            
            removeItem: (key: string): void => { try { }'
                    document.cookie = `awaputi_${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;''
                } catch (e') { ''
                    console.warn('Cookie removal failed', e'); }
                }
            },'
            '';
            _storageType: 'cookie-fallback';
        },
    }

    /**
     * メモリベースストレージフォールバック
     * @private
     */
    static _createMemoryStorageFallback(): StorageFallback { const memoryStorage = new Map<string, string>();
        
        return { getItem: (key: string): string | null = > memoryStorage.get(key) || null };
            setItem: (key: string, value: string): void => memoryStorage.set(key, value), }'
            removeItem: (key: string): void => { memoryStorage.delete(key); },''
            clear: ('): void => memoryStorage.clear(,'';
            _storageType: 'memory-fallback');
        })
    }

    /**
     * ストレージなしフォールバック
     * @private
     */)
    static _createNoStorageFallback(): StorageFallback { return {  };
            getItem: (): null = > null }
            setItem: (): void => {}'
            removeItem: (): void => {}''
            clear: ('): void => {}''
            _storageType: 'no-storage-fallback';
        },
    }

    /**
     * ストレージクォータ推定
     * @private'
     */''
    static _estimateStorageQuota('')';
            const testData = 'a'.repeat(1024); // 1KB
            
            for (let i = 0; i < 100; i++) { try { }
                    localStorage.setItem(`__quota_test_${i)__`, testData});
                    estimate += 1024;
                } catch (e) { break; }
                }
            }
            
            // クリーンアップ
            for (let i = 0; i < 100; i++) { try { }
                    localStorage.removeItem(`__quota_test_${i}__`);
                } catch (e) { break; }
                }
            }
            
            return estimate;
            
        } catch (error) { return 0; }
        }
    }

    /**
     * 必要なフォールバックの決定
     * @private'
     */''
    static _determineFallbacksRequired(browserInfo: BrowserInfo'): string[] { const fallbacks: string[] = [],
        ';
        // 古いブラウザ向けの包括的フォールバック''
        if(browserInfo.name === 'ie' || browserInfo.version < 50') {'
            ';
        }'
            fallbacks.push('canvas', 'localStorage', 'modules''); }
        }
        ';
        // Safari の制限対応''
        if(browserInfo.name === 'safari'') {'
            '';
            if (browserInfo.restrictions.includes('localStorage-private')') {'
        }'
                fallbacks.push('localStorage''); }'
            }''
            if (browserInfo.restrictions.includes('canvas-limited')') { ''
                fallbacks.push('canvas''); }
            }
        }
        ';
        // Firefox の file:// プロトコル制限''
        if(browserInfo.name === 'firefox' && window.location && window.location.protocol === 'file:'') {'
            '';
            if (browserInfo.restrictions.includes('localStorage-file-protocol')') {'
        }'
                fallbacks.push('localStorage'); }
            }
        }
        
        return fallbacks;
    }

    /**
     * 包括的ブラウザサポート情報の取得
     */
    static getComprehensiveSupport(): ComprehensiveSupport { return { browser: this.getBrowserInfo(,
            canvas: this.getCanvasSupport(,);
            localStorage: this.getLocalStorageSupport();
            modules: this.getModulesSupport(,) };
            recommendations: this._generateRecommendations(); }
        };
    }

    /**
     * 推奨事項の生成
     * @private
     */
    static _generateRecommendations(): Recommendation[] { const recommendations: Recommendation[] = [],
        const browserInfo = this.getBrowserInfo();
        const canvasSupport = this.getCanvasSupport();
        const storageSupport = this.getLocalStorageSupport();
        const modulesSupport = this.getModulesSupport();'
'';
        if(!browserInfo.isSupported') {'
            recommendations.push({'
        }'
                type: 'browser-upgrade', })'
                message: `Consider upgrading ${browserInfo.name} for better compatibility`;')'
                priority: 'high'),
        }'
'';
        if(!canvasSupport.available') {'
            recommendations.push({''
                type: 'canvas-fallback',')';
                message: 'Canvas API not supported, using SVG fallback',');
        }'
                priority: 'medium'); }
        }'
'';
        if(!storageSupport.writable') {'
            recommendations.push({''
                type: 'storage-fallback',')';
                message: 'localStorage not available, using alternative storage',');
        }'
                priority: 'low')'); }
        }'
'';
        if(!modulesSupport.available && window.location.protocol === 'file:'') {'
            recommendations.push({''
                type: 'local-execution',')';
                message: 'Use development server for better ES6 modules support',');
        }'
                priority: 'high')'); }
        }

        return recommendations;
    }
}'
'';
export default BrowserCompatibilityManager;