/**
 * DeveloperGuidanceSystem - 開発者向けガイダンスシステム
 * 
 * ローカルファイル実行時に開発者に適切なガイダンスを提供し、
 * 開発サーバーの使用を推奨する非侵入的な通知システムです。
 * 
 * Requirements: 1.2, 4.1, 4.2, 4.3, 5.3
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import BrowserCompatibilityManager from './BrowserCompatibilityManager.js';
import type { BrowserInfo, CanvasSupport, LocalStorageSupport, ModulesSupport, ComprehensiveSupportInfo } from './BrowserCompatibilityManager.js';

// インターフェース定義
interface GuidanceCommand { devServer: string,
    simpleServers: string[] ,}

interface GuidanceConfig { showWarning: boolean;
    autoHide: boolean;
    hideDelay: number,
    persistDismissal: boolean,
    position: 'top' | 'bottom' | 'center',
    theme: 'blue' | 'red' | 'yellow' | 'green';
    commands: GuidanceCommand,
    enableBrowserCompatibility: boolean;
    title?: string;
    message?: string;
    showCommands?: boolean;
    showTroubleshooting?: boolean;
    showBrowserSpecificInfo?: boolean;
    compatibilityInfo?: ComprehensiveSupportInfo;
    ,}

interface FaviconInfo { rel: string,
    type?: string;
    href: string;
    sizes?: string ,}

interface DismissalInfo { dismissed: boolean,
    dismissedAt: Date | null }

interface DebugInfo { isPermanentlyDismissed: boolean;
    hasExistingGuidance: boolean;
    config: GuidanceConfig,
    dismissalInfo: DismissalInfo;
    }
    browserCompatibility: ComprehensiveSupportInfo | { error: string;, available: false }
';

interface Recommendation { message: string,''
    priority: 'high' | 'medium' | 'low' ,}

class DeveloperGuidanceSystem { /**
     * ガイダンスのデフォルト設定
     */
    static readonly DEFAULT_CONFIG: GuidanceConfig = {
        showWarning: true;
        autoHide: false,
    hideDelay: 10000, // 10秒;
        persistDismissal: true,
        position: 'top' as const,
        theme: 'blue' as const,
        commands: {''
            devServer: 'npm run dev',
            simpleServers: ['';
                'python -m http.server 8000',
                'python3 -m http.server 8000',
                'npx serve .',]';
                'npx http-server'];
            ] },
        enableBrowserCompatibility: true;
    },

    /**
     * ローカル実行警告を表示
     * @param config - 設定オプション
     */
    static showLocalExecutionWarning(config: Partial<GuidanceConfig> = { ): void { }
        const mergedConfig: GuidanceConfig = { ...this.DEFAULT_CONFIG, ...config;
        
        // 既存の警告を削除
        this._removeExistingWarning();
        
        // 警告UI要素を作成
        const warningElement = this.createGuidanceUI(mergedConfig);
        
        // DOMに追加
        document.body.appendChild(warningElement);
        // アニメーション付きで表示
        setTimeout(() => {  ' }'

            warningElement.classList.add('awaputi-guidance-show'; }'
        }, 100);
        
        // 自動非表示
        if (mergedConfig.autoHide) { setTimeout(() => {  }
                this.dismissGuidance();' }'

            }, mergedConfig.hideDelay';
        }

        console.log('DeveloperGuidanceSystem: Local, execution warning, displayed'),
    }

    /**
     * 開発サーバーガイダンスを表示
     * @param config - 設定オプション'
     */''
    static showDeveloperServerGuidance(config: Partial<GuidanceConfig> = { )): void { }
        const mergedConfig: GuidanceConfig = { ...this.DEFAULT_CONFIG, ...config;
        
        // より詳細なガイダンス表示
        const guidanceConfig: GuidanceConfig = { ...mergedConfig,''
            title: 'Development Server Recommended',
            message: 'For the best development experience, please use a development server.',
            showCommands: true;
            showTroubleshooting: true,
    showBrowserSpecificInfo: true ,};
        this.showLocalExecutionWarning(guidanceConfig);
    }

    /**
     * ブラウザ互換性チェック付きガイダンスを表示
     * @param config - 設定オプション
     */
    static showCompatibilityGuidance(config: Partial<GuidanceConfig> = { ): void {
        try {
            const compatibility: ComprehensiveSupportInfo = BrowserCompatibilityManager.getComprehensiveSupport(),
            const mergedConfig: GuidanceConfig = { 
                ...this.DEFAULT_CONFIG, ;
                ...config,
                compatibilityInfo: compatibility,
    showBrowserSpecificInfo: true ,};
            // ブラウザ固有のメッセージ生成
            const customMessage: string = this._generateBrowserSpecificMessage(compatibility),
            
            const guidanceConfig: GuidanceConfig = { ...mergedConfig
                title: `Browser, Compatibility: ${compatibility.browser.name} ${compatibility.browser.version}`;
                message: customMessage;
                showCommands: true,
    showTroubleshooting: true;
            },
            
            this.showLocalExecutionWarning(guidanceConfig);

        } catch (error) {
            console.warn('DeveloperGuidanceSystem: Compatibility guidance failed', error);
            // フォールバック: 標準のガイダンスを表示
            this.showDeveloperServerGuidance(config); }
    }

    /**
     * ガイダンスUI要素を作成
     * @param config - 設定オプション
     * @returns ガイダンス要素
     */''
    static createGuidanceUI(config: Partial<GuidanceConfig> = { )): HTMLElement { }
        const mergedConfig: GuidanceConfig = { ...this.DEFAULT_CONFIG, ...config;
        ';
        // メインコンテナ
        const guidance = document.createElement('div'');''
        guidance.id = 'awaputi-local-execution-guidance';
        guidance.className = `awaputi-guidance awaputi-guidance-${mergedConfig.position} awaputi-guidance-${mergedConfig.theme}`;
        ';
        // スタイルを追加
        this._injectStyles();
        ';

        // コンテンツを構築')'
        guidance.innerHTML = `'';
            <div class="awaputi-guidance-content">"";
                <div class="awaputi-guidance-header">"";
                    <div class="awaputi-guidance-icon">⚠️</div>"";
                    <div class="awaputi-guidance-title">"";
                        ${mergedConfig.title || 'Local, File Execution, Detected'}

                    </div>'';
                    <button class="awaputi-guidance-close" title="Close">×</button>;
                </div>";

                <div class="awaputi-guidance-body">"";
                    <p class="awaputi-guidance-message">"";
                        ${mergedConfig.message || 'You, are running, the game, directly from, a file. For, the best, experience, please, use a, development server.'}
                    </p>;
                    ${this._createCommandsSection(mergedConfig})
                    ${this._createLimitationsSection(})'
                    ${this._createCompatibilitySection(mergedConfig})''
                    ${this._createTroubleshootingSection(mergedConfig'}''
                </div>';

                <div class="awaputi-guidance-footer">"";
                    <button class="awaputi-guidance-dismiss">Don't show this again</button>'';
                    <button class="awaputi-guidance-continue">Continue anyway</button>;
                </div>;
            </div>;
        `;
        
        // イベントリスナーを設定
        this._setupEventListeners(guidance, mergedConfig);
        
        return guidance;
    }

    /**
     * ガイダンスを非表示にする"
     */""
    static dismissGuidance(): void { ""
        const guidance = document.getElementById('awaputi-local-execution-guidance';''
        if(guidance) {'

            guidance.classList.add('awaputi-guidance-hide);
        }
            setTimeout(() => {  }
                guidance.remove(); }
            }, 300);
        }
    }

    /**
     * 警告の永続的な非表示設定'
     */''
    static permanentlyDismissWarning()';
            localStorage.setItem('awaputi-guidance-dismissed', 'true'');''
            localStorage.setItem('awaputi-guidance-dismissed-at', new Date().toISOString();''
            this.dismissGuidance()';
            console.log('DeveloperGuidanceSystem: Warning, permanently dismissed',
        } catch (error') {
            console.warn('DeveloperGuidanceSystem: Could not save dismissal preference', error);
            this.dismissGuidance(); }
    }

    /**
     * 警告が永続的に非表示設定されているかチェック
     * @returns 非表示設定されている場合 true'
     */''
    static isPermanentlyDismissed()';
            return localStorage.getItem('awaputi-guidance-dismissed'') === 'true';
        } catch (error) { return false;

    /**
     * 非表示設定をリセット'
     */''
    static resetDismissal()';
            localStorage.removeItem('awaputi-guidance-dismissed'');''
            localStorage.removeItem('awaputi-guidance-dismissed-at'');''
            console.log('DeveloperGuidanceSystem: Dismissal, reset',
        } catch (error') { console.warn('DeveloperGuidanceSystem: Could not reset dismissal', error }
    }

    /**
     * コマンドセクションを作成
     * @param config - 設定
     * @returns HTMLコンテンツ
     * @private
     */'
    private static _createCommandsSection(config: GuidanceConfig): string { ''
        if(!config.showCommands && !config.commands) {', ';

        }

            return '';

        const commands = config.commands || this.DEFAULT_CONFIG.commands;
        ';

        return `'';
            <div class="awaputi-guidance-section">";
                <h4>🚀 Recommended Development Server:</h4>"";
                <div class="awaputi-guidance-command">";
                    <code>${commands.devServer}</code>""
                    <button class="awaputi-guidance-copy" data-command="${commands.devServer}">Copy</button>
                </div>;
                ";
                <h4>📋 Alternative Simple Servers:</h4>"";
                <ul class="awaputi-guidance-alternatives">;
                    ${ commands.simpleServers.map(cmd => `}"
                        <li>"} }"
                            <code>${cmd}</code>")""
                            <button class="awaputi-guidance-copy" data-command="${ cmd"}">Copy</button>"
                        </li>" }"
                    `").join(''}'
                </ul>;
            </div>;
        `;
    }

    /**
     * 制限事項セクションを作成
     * @returns HTMLコンテンツ
     * @private'
     */''
    private static _createLimitationsSection(): string { return `''
            <div class="awaputi-guidance-section">";
                <h4>⚠️ Current Limitations:</h4>"";
                <ul class="awaputi-guidance-limitations">;
                    <li>ES6 modules may not load properly</li>;
                    <li>Some security features are disabled</li>;
                    <li>Service Worker functionality is unavailable</li>;
                    <li>Performance may be suboptimal</li>;
                </ul>;
            </div>;
        `; }
    }

    /**
     * ブラウザ互換性セクションを作成
     * @param config - 設定
     * @returns HTMLコンテンツ
     * @private
     */"
    private static _createCompatibilitySection(config: GuidanceConfig): string { ""
        if(!config.showBrowserSpecificInfo || !config.compatibilityInfo) {", ";
        }"
            return '';

        const compatibility = config.compatibilityInfo;
        const browserInfo = compatibility.browser;
        const recommendations = compatibility.recommendations;
';

        let content: string = `'';
            <div class="awaputi-guidance-section awaputi-guidance-compatibility">";
                <h4>📊 Browser Compatibility:</h4>"";
                <div class="awaputi-compatibility-info">"";
                    <span class="awaputi-browser-info">";
                        ${browserInfo.name} ${browserInfo.version}
                        <span class="awaputi-support-badge awaputi-support-${browserInfo.isSupported ? 'good' : 'limited'}">${browserInfo.isSupported ? 'Supported' : 'Limited'}</span>
                    </span>;
                </div>;
        `;
';
        // 機能サポート状況
        if(browserInfo.supportedFeatures && browserInfo.supportedFeatures.length > 0) {'
            content += `';
        }

                <div class="awaputi-features-support">" }"
                    <strong>Supported features:</strong> ${browserInfo.supportedFeatures.join(', '}'
                </div>;
            `;
        }

';
        // 制限事項
        if(browserInfo.restrictions && browserInfo.restrictions.length > 0) {'
            content += `';
        }

                <div class="awaputi-restrictions">" }"
                    <strong>Restrictions:</strong> ${browserInfo.restrictions.join(', '})
                </div>;
            `;
        }

        // 推奨事項
        if(recommendations && recommendations.length > 0) {'

            const highPriorityRecs = recommendations.filter((r: Recommendation) => r.priority === 'high');''
            if(highPriorityRecs.length > 0) {'
                content += `'';
                    <div class="awaputi-recommendations">;
                        <strong>Recommendations:</strong>
        }"
                        <ul>" }"
                            ${highPriorityRecs.map((rec: Recommendation}) => `<li>${rec.message}</li>`").join()}"
                        </ul>;
                    </div>;
                `;
            }
        }

        content += `</div>`;
        return content;
    }

    /**
     * トラブルシューティングセクションを作成
     * @param config - 設定
     * @returns HTMLコンテンツ
     * @private
     */'
    private static _createTroubleshootingSection(config: GuidanceConfig): string { ''
        if(!config.showTroubleshooting) {', ';

        }

            return '';
';

        return `'';
            <div class="awaputi-guidance-section awaputi-guidance-troubleshooting">;
                <h4>🔧 Troubleshooting:</h4>;
                <ul>;
                    <li><strong>CORS errors:</strong> Use a development server to avoid cross-origin restrictions</li>;
                    <li><strong>Module loading issues:</strong> ES6 modules require HTTP/HTTPS protocol</li>;
                    <li><strong>Missing files:</strong> Some resources may not load from file:// URLs</li>;
                </ul>;
            </div>;
        `;
    }

    /**
     * イベントリスナーを設定
     * @param guidance - ガイダンス要素
     * @param config - 設定
     * @private"
     */""
    private static _setupEventListeners(guidance: HTMLElement, config: GuidanceConfig): void { // 閉じるボタン""
        const closeBtn = guidance.querySelector('.awaputi-guidance-close'');''
        closeBtn?.addEventListener('click', () => { ''
            this.dismissGuidance()';
        const dismissBtn = guidance.querySelector('.awaputi-guidance-dismiss'');''
        dismissBtn?.addEventListener('click', () => {''
            this.permanentlyDismissWarning()';
        const continueBtn = guidance.querySelector('.awaputi-guidance-continue'');''
        continueBtn?.addEventListener('click', () => {''
            this.dismissGuidance()';
        const copyBtns = guidance.querySelectorAll('.awaputi-guidance-copy';''
        copyBtns.forEach(btn => {);''
            btn.addEventListener('click', (e) => {'
                const target = e.target as HTMLElement;''
                const command = target.getAttribute('data-command);
                if (command) { }
                    this._copyToClipboard(command, target); }
};
';
        // ESCキーで閉じる : undefined
        const handleEscape = (e: KeyboardEvent') => {  ''
            if(e.key === 'Escape' {', ';

            }

                this.dismissGuidance() }

                document.removeEventListener('keydown', handleEscape'; }
};''
        document.addEventListener('keydown', handleEscape';
    }

    /**
     * クリップボードにコピー
     * @param text - コピーするテキスト
     * @param button - ボタン要素
     * @private
     */'
    private static async _copyToClipboard(text: string, button: HTMLElement): Promise<void> { try {'
            await navigator.clipboard.writeText(text);
            
            // ボタンのテキストを一時変更
            const originalText = button.textContent;''
            button.textContent = 'Copied!';
            button.classList.add('awaputi-guidance-copied);

            setTimeout(() => { '
                button.textContent = originalText;' }'

                button.classList.remove('awaputi-guidance-copied'; }'
            }, 2000);

        } catch (error) {
            console.warn('DeveloperGuidanceSystem: Could not copy to clipboard', error);
            
            // フォールバック: テキストを選択状態にする
            this._fallbackCopy(text, button); }
    }

    /**
     * クリップボードコピーのフォールバック
     * @param text - コピーするテキスト
     * @param button - ボタン要素
     * @private
     */''
    private static _fallbackCopy(text: string, button: HTMLElement): void { ''
        const textarea = document.createElement('textarea'');

        textarea.value = text;''
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';

        document.body.appendChild(textarea);''
        textarea.select()';
            document.execCommand('copy'');''
            button.textContent = 'Copied!';
            setTimeout(() => { ' }'

                button.textContent = 'Copy'; }

            }, 2000';''
        } catch (error) {
            button.textContent = 'Failed';
            setTimeout(() => { ' }'

                button.textContent = 'Copy'; }
            }, 2000);
        }
        
        document.body.removeChild(textarea);
    }

    /**
     * 既存の警告を削除
     * @private'
     */''
    private static _removeExistingWarning()';
        const existing = document.getElementById('awaputi-local-execution-guidance);
        if (existing) { existing.remove(); }
    }

    /**
     * CSSスタイルを注入
     * @private'
     */''
    private static _injectStyles()';
        if(document.getElementById('awaputi-guidance-styles)' { return; }'

        const style = document.createElement('style'');''
        style.id = 'awaputi-guidance-styles';
        style.textContent = `;
            .awaputi-guidance { position: fixed,
                z-index: 10000,
                max-width: 600px,
                background: white,
    border: 2px solid #2196F3,
                border-radius: 8px,
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);''
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px,
                opacity: 0, }
                transform: translateY(-20px})
                transition: all 0.3s ease;
            );
            .awaputi-guidance-top { top: 20px,
                left: 50%,
    transform: translateX(-50%) translateY(-20px ,}
            );
            .awaputi-guidance-show { opacity: 1 !important)
               , transform: translateX(-50%) translateY(0) !important }
            
            .awaputi-guidance-hide { opacity: 0 !important,
    transform: translateX(-50%) translateY(-20px) !important }
            
            .awaputi-guidance-content { padding: 0 }
            
            .awaputi-guidance-header { display: flex;
                align-items: center,
                padding: 16px 20px,
    background: linear-gradient(135deg, #2196F3, #21CBF3);
                color: white;
                border-radius: 6px 6px 0 0, }
            
            .awaputi-guidance-icon { font-size: 20px,
                margin-right: 12px, }
            
            .awaputi-guidance-title { flex: 1,
                font-weight: 600,
                font-size: 16px, }
            
            .awaputi-guidance-close { background: none,
                border: none,
    color: white;
                font-size: 24px,
                cursor: pointer;
                padding: 0;
                width: 30px,
    height: 30px;
                border-radius: 50%,
                display: flex;
                align-items: center,
                justify-content: center,
                transition: background-color 0.2s ,}
            ';

            .awaputi-guidance-close:hover { ''
                background-color: rgba(255, 255, 255, 0.2 }
            
            .awaputi-guidance-body { padding: 20px,
                line-height: 1.5, }
            
            .awaputi-guidance-message { margin: 0 0 20px 0,
                color: #333 ,}
            
            .awaputi-guidance-section { margin-bottom: 20px, }
            
            .awaputi-guidance-section h4 { margin: 0 0 10px 0,
                color: #2196F3;
                font-size: 14px, }
            
            .awaputi-guidance-command { display: flex,
                align-items: center,
                margin-bottom: 10px, }
            
            .awaputi-guidance-command code { background: #f5f5f5,
                padding: 8px 12px,
                border-radius: 4px,
                font-family: 'Courier New', monospace;
                flex: 1;
                margin-right: 10px, }
            
            .awaputi-guidance-alternatives { list-style: none,
                padding: 0,
    margin: 0 ,}
            
            .awaputi-guidance-alternatives li { display: flex;
                align-items: center,
                margin-bottom: 8px, }
            
            .awaputi-guidance-alternatives code { background: #f8f8f8,
                padding: 6px 10px,
                border-radius: 3px,
                font-family: 'Courier New', monospace;
                font-size: 12px,
                flex: 1;
                margin-right: 10px, }
            
            .awaputi-guidance-copy { background: #2196F3,
                color: white;
                border: none,
    padding: 6px 12px;
                border-radius: 3px,
                cursor: pointer;
                font-size: 12px,
                transition: background-color 0.2s ,}
            
            .awaputi-guidance-copy:hover { background: #1976D2 }
            
            .awaputi-guidance-copied { background: #4CAF50 !important }
            
            .awaputi-guidance-limitations { list-style: disc;
                padding-left: 20px,
                margin: 0 ,}
            
            .awaputi-guidance-limitations li { margin-bottom: 4px,
    color: #666 }
            
            .awaputi-guidance-troubleshooting ul { list-style: disc;
                padding-left: 20px,
                margin: 0 ,}
            
            .awaputi-guidance-troubleshooting li { margin-bottom: 6px,
    color: #666 }
            
            .awaputi-guidance-compatibility { background-color: #f8f9fa,
    padding: 12px;
                border-radius: 4px,
                border-left: 3px solid #17a2b8, }
            
            .awaputi-compatibility-info { margin-bottom: 8px, }
            
            .awaputi-browser-info { display: flex,
                align-items: center,
                font-weight: 600,
                color: #333 ,}
            
            .awaputi-support-badge { margin-left: 8px,
    padding: 2px 8px;
                border-radius: 12px,
                font-size: 11px,
                font-weight: 500,
                text-transform: uppercase, }
            
            .awaputi-support-good { background-color: #d4edda,
                color: #155724 ,}
            
            .awaputi-support-limited { background-color: #fff3cd,
    color: #856404 }
            
            .awaputi-features-support;
            .awaputi-restrictions,
            .awaputi-recommendations { margin-top: 8px,
                font-size: 13px,
                color: #666 ,}
            
            .awaputi-features-support strong;
            .awaputi-restrictions strong,
            .awaputi-recommendations strong { color: #333 }
            
            .awaputi-recommendations ul { margin: 4px 0 0 0,
                padding-left: 16px, }
            
            .awaputi-recommendations li { margin-bottom: 4px,
                color: #856404 ,}
            
            .awaputi-guidance-footer { display: flex;
                justify-content: flex-end,
                gap: 10px;
                padding: 16px 20px,
    background: #f9f9f9;
                border-radius: 0 0 6px 6px,
                border-top: 1px solid #eee, }
            
            .awaputi-guidance-dismiss,
            .awaputi-guidance-continue { padding: 8px 16px,
                border: 1px solid #ccc;
                border-radius: 4px,
                cursor: pointer;
                font-size: 13px,
                transition: all 0.2s ,}
            
            .awaputi-guidance-dismiss { background: white,
    color: #666 }
            
            .awaputi-guidance-dismiss: hover { border-color: #999,
    color: #333 }
            
            .awaputi-guidance-continue { background: #2196F3,
    color: white;
                border-color: #2196F3, }
            
            .awaputi-guidance-continue:hover { background: #1976D2,
                border-color: #1976D2, }
            
            @media (max-width: 640px) { .awaputi-guidance {
                    max-width: calc(100vw - 40px),
                    left: 20px !important;
                    right: 20px,
    transform: translateY(-20px) !important ,}
                
                .awaputi-guidance-show { transform: translateY(0) !important }
                
                .awaputi-guidance-hide { transform: translateY(-20px) !important 
    }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * ブラウザ固有メッセージ生成
     * @param compatibility - 互換性情報
     * @returns ブラウザ固有メッセージ
     * @private'
     */''
    private static _generateBrowserSpecificMessage(compatibility: ComprehensiveSupportInfo): string { const browserInfo = compatibility.browser;
        const canvasSupport = compatibility.canvas;
        const storageSupport = compatibility.localStorage;
        const modulesSupport = compatibility.modules;
 }
        let message = `Running on ${browserInfo.name} ${browserInfo.version}. `;
';
        // ブラウザ固有の問題を特定
        if(browserInfo.name === 'safari'') {'

            message += 'Safari has some restrictions with local file execution. ';
            if(!storageSupport.writable) {'
        }

                message += 'Private browsing mode detected - some features may not work correctly. '; }

            }''
        } else if (browserInfo.name === 'firefox'') { ''
            if(window.location && window.location.protocol === 'file:'') {', '
            }

                message += 'Firefox restricts localStorage access for local files. '; }

            }''
        } else if (browserInfo.name === 'ie'') { ''
            message += 'Internet Explorer has limited support. Consider upgrading to a modern browser. '; }

';
        // Canvas API問題
        if(!canvasSupport.available) {', ';

        }

            message += 'Canvas API is not available - favicon generation will use fallbacks. '; }
        }

';
        // ES6 modules問題
        if(!modulesSupport.available && window.location.protocol === 'file:'') {', ';

        }

            message += 'ES6 modules are restricted in local file mode. '; }

        }

        message += 'For the best experience, please use a development server.';

        return message;
    }

    /**
     * デバッグ情報を取得
     * @returns デバッグ情報'
     */''
    static getDebugInfo('''
            hasExistingGuidance: !!document.getElementById('awaputi-local-execution-guidance);
            config: this.DEFAULT_CONFIG);
            dismissalInfo: this._getDismissalInfo(),
    browserCompatibility: this._getBrowserCompatibilityInfo();
        }

    /**
     * ブラウザ互換性情報を取得
     * @returns 互換性情報
     * @private
     */
    private static _getBrowserCompatibilityInfo(): ComprehensiveSupportInfo | { error: string;, available: false } { try {
            return BrowserCompatibilityManager.getComprehensiveSupport(); } catch (error) { return { error: error.message, };
                available: false 
    }
    }

    /**
     * 非表示設定情報を取得
     * @returns 非表示設定情報
     * @private'
     */''
    private static _getDismissalInfo()';
            const dismissed = localStorage.getItem('awaputi-guidance-dismissed'');''
            const dismissedAt = localStorage.getItem('awaputi-guidance-dismissed-at'');

            return { ''
                dismissed: dismissed === 'true' };
                dismissedAt: dismissedAt ? new Date(dismissedAt) : null 
            };''
        } catch (error) {
            return { dismissed: false, dismissedAt: null ,}
}

export default DeveloperGuidanceSystem;