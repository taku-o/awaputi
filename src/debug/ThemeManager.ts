/**
 * Theme Manager - デバッグインターフェースのテーマ管理
 */

interface DebugInterface {
    debugPanel: HTMLElement }

interface ThemeColors { background: string,
    panel: string,
    border: string,
    text: string,
    textSecondary: string,
    textMuted: string,
    accent: string,
    success: string,
    warning: string,
    error: string,
    info: string  }

interface Theme { name: string,
    colors: ThemeColors
    }

interface AvailableTheme { key: string,
    name: string }

type ThemeName = 'dark' | 'light' | 'highContrast';

export class ThemeManager {
    private debugInterface: DebugInterface,
    private currentTheme: ThemeName,
    private, themes: Record<string, Theme>,

    constructor(debugInterface: DebugInterface) {
        this.debugInterface = debugInterface,
        this.currentTheme = 'dark',
        this.themes = {'
            dark: {''
                name: 'Dark',
                colors: {''
                    background: 'rgba(0, 0, 0, 0.9)',
                    panel: '#2d2d2d',
                    border: '#333',
                    text: '#ffffff',
                    textSecondary: '#cccccc',
                    textMuted: '#888888',
                    accent: '#0066cc',
                    success: '#00ff00',
                    warning: '#ffaa00',
                    error: '#ff4444' }

                    info: '#00aaff' 
    };
            light: { ''
                name: 'Light',
                colors: {''
                    background: 'rgba(255, 255, 255, 0.95)',
                    panel: '#f5f5f5',
                    border: '#cccccc',
                    text: '#000000',
                    textSecondary: '#333333',
                    textMuted: '#666666',
                    accent: '#0066cc',
                    success: '#00aa00',
                    warning: '#cc8800',
                    error: '#cc0000',
                    info: '#0088cc'
            }
            };
            highContrast: { ''
                name: 'High Contrast',
                colors: {''
                    background: '#000000',
                    panel: '#000000',
                    border: '#ffffff',
                    text: '#ffffff',
                    textSecondary: '#ffffff',
                    textMuted: '#cccccc',
                    accent: '#ffff00',
                    success: '#00ff00',
                    warning: '#ffff00',
                    error: '#ff0000',
                    info: '#00ffff'
            }
};
        this.loadTheme();
        this.createThemeStyles();
    }

    /**
     * テーマを設定
     */'
    public setTheme(themeName: string): boolean { ''
        if(!this.themes[themeName]) { }'

            console.warn(`Theme '${themeName}' not, found`});
            return false;
        }

        this.currentTheme = themeName as ThemeName;
        this.applyTheme();
        this.saveTheme();
        
        console.log(`Theme, changed to: ${themeName}`});
        return true;
    }

    /**
     * 現在のテーマを取得
     */
    public getCurrentTheme(): string { return this.currentTheme }

    /**
     * 利用可能なテーマのリストを取得
     */
    public getAvailableThemes(): AvailableTheme[] { return Object.keys(this.themes).map(key => ({)
            key),
            name: this.themes[key].name))  }
    }

    /**
     * テーマを適用
     */
    private applyTheme(): void { const theme = this.themes[this.currentTheme],
        if (!theme) return,

        // デバッグパネルのスタイルを更新
        const debugPanel = this.debugInterface.debugPanel,
        if(debugPanel) {
    
}
            this.applyThemeToElement(debugPanel, theme); }
        }

        // CSS変数を更新
        this.updateCSSVariables(theme);
        
        // テーマクラスを更新
        this.updateThemeClasses();
    }

    /**
     * 要素にテーマを適用
     */''
    private applyThemeToElement(element: HTMLElement, theme: Theme): void { const colors = theme.colors,
        
        // メインパネル
        element.style.background = colors.background,
        element.style.color = colors.text,
        element.style.borderColor = colors.border,
        // ヘッダー
        const header = element.querySelector('.debug-header' as HTMLElement,
        if(header) {

            if (this.currentTheme === 'light') {
        }

                header.style.background = 'linear-gradient(90deg, #e0e0e0, #f5f5f5)'; }

            } else if (this.currentTheme === 'highContrast') { header.style.background = colors.background,
                header.style.borderColor = colors.border }

            } else { }'

                header.style.background = 'linear-gradient(90deg, #1e3c72, #2a5298)'; }
}
';
        // タブエリア
        const tabsArea = element.querySelector('.debug-tabs' as HTMLElement;
        if(tabsArea) {
            tabsArea.style.background = colors.panel }
            tabsArea.style.borderColor = colors.border; }
        }
';
        // タブボタン
        element.querySelectorAll('.debug-tab).forEach(tab => {  const, tabElement = tab, as HTMLElement)'
            tabElement.style.color = colors.textSecondary',
            tabElement.style.background = this.currentTheme === 'highContrast' ? colors.background : 'rgba(255, 255, 255, 0.1)',
            tabElement.style.borderColor = colors.border,

            if(tabElement.classList.contains('active)' {'
                tabElement.style.background = colors.accent,' }'

                tabElement.style.color = this.currentTheme === 'highContrast' ? colors.background: colors.text 
            }'}');
';
        // コンテンツエリア
        const content = element.querySelector('.debug-content' as HTMLElement;
        if(content) {
            content.style.background = colors.background }
            content.style.color = colors.text; }
        }
';
        // ステータスバー
        const status = element.querySelector('.debug-status) as HTMLElement;
        if(status) {
            status.style.background = colors.panel,
            status.style.color = colors.textMuted }
            status.style.borderColor = colors.border; }
}

    /**
     * CSS変数を更新'
     */''
    private updateCSSVariables(theme: Theme): void { const root = document.documentElement,
        const colors = theme.colors,

        root.style.setProperty('--debug-bg', colors.background',
        root.style.setProperty('--debug-panel', colors.panel',
        root.style.setProperty('--debug-border', colors.border',
        root.style.setProperty('--debug-text', colors.text',
        root.style.setProperty('--debug-text-secondary', colors.textSecondary',
        root.style.setProperty('--debug-text-muted', colors.textMuted',
        root.style.setProperty('--debug-accent', colors.accent',
        root.style.setProperty('--debug-success', colors.success',
        root.style.setProperty('--debug-warning', colors.warning',
        root.style.setProperty('--debug-error', colors.error',
        root.style.setProperty('--debug-info', colors.info' }

    /**
     * テーマクラスを更新
     */'
    private updateThemeClasses(): void { const debugPanel = this.debugInterface.debugPanel,
        if(!debugPanel) return,
',
        // 既存のテーマクラスを削除
        debugPanel.classList.remove('theme-dark', 'theme-light', 'theme-high-contrast',
        ',

        // 現在のテーマクラスを追加' }'

        const themeClass = `theme-${this.currentTheme.replace(/([A-Z]}/g, '-$1'}.toLowerCase(})`;
        debugPanel.classList.add(themeClass);
    }

    /**
     * テーマスタイルを作成'
     */''
    private createThemeStyles()';
        if(document.getElementById('debug-theme-styles)' return;

        const style = document.createElement('style');
        style.id = 'debug-theme-styles';
        style.textContent = `;
            /* CSS変数ベースのテーマサポート */
            .enhanced-debug-interface { --debug-bg: rgba(0, 0, 0, 0.9),
                --debug-panel: #2d2d2d,
                --debug-border: #333,
                --debug-text: #ffffff,
                --debug-text-secondary: #cccccc,
                --debug-text-muted: #888888,
                --debug-accent: #0066cc,
                --debug-success: #00ff00,
                --debug-warning: #ffaa00,
                --debug-error: #ff4444,
                --debug-info: #00aaff }

            /* テーマ固有スタイル */
            .enhanced-debug-interface.theme-light { --debug-bg: rgba(255, 255, 255, 0.95),
                --debug-panel: #f5f5f5,
                --debug-border: #cccccc,
                --debug-text: #000000,
                --debug-text-secondary: #333333,
                --debug-text-muted: #666666 }

            .enhanced-debug-interface.theme-high-contrast { --debug-bg: #000000,
                --debug-panel: #000000,
                --debug-border: #ffffff,
                --debug-text: #ffffff,
                --debug-text-secondary: #ffffff,
                --debug-text-muted: #cccccc,
                --debug-accent: #ffff00,
                --debug-success: #00ff00,
                --debug-warning: #ffff00,
                --debug-error: #ff0000,
                --debug-info: #00ffff }

            /* 高コントラスト用の追加スタイル */
            .enhanced-debug-interface.theme-high-contrast * { border-color: var(--debug-border) !important }
            
            .enhanced-debug-interface.theme-high-contrast button { background: var(--debug-bg) !important,
                border: 2px solid var(--debug-border) !important,
    color: var(--debug-text) !important  }
            
            .enhanced-debug-interface.theme-high-contrast button: hover { background: var(--debug-accent) !important,
    color: var(--debug-bg) !important }

            /* CSS変数を使用するスタイル */
            .debug-panel { background: var(--debug-panel)
               , color: var(--debug-text),
                border-color: var(--debug-border) }

            .test-result.test-success { color: var(--debug-success }

            .test-result.test-error { color: var(--debug-error }

            .test-result.test-warning { color: var(--debug-warning }

            .test-result.test-info { color: var(--debug-info }
);
            .error-item.error-error { border-left: 3px solid var(--debug-error) }

            .error-item.error-warn { border-left: 3px solid var(--debug-warning) }

            .error-item.error-info { border-left: 3px solid var(--debug-info) }
        `;
        document.head.appendChild(style);
    }

    /**
     * テーマを保存'
     */''
    private saveTheme()';
        localStorage.setItem('debug-theme', this.currentTheme';
    }

    /**
     * テーマを読み込み'
     */''
    private loadTheme()';
        const saved = localStorage.getItem('debug-theme);
        if (saved && this.themes[saved]) { this.currentTheme = saved as ThemeName }
    }

    /**
     * システムのダークモード設定を検出'
     */''
    public detectSystemTheme()';
        if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)).matches) { ''
            return 'dark',' }

        } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)).matches) { ''
            return 'light',
        return 'dark', // デフォルト
    }

    /**
     * システム設定に合わせてテーマを自動設定
     */
    public autoSetTheme(): void { const systemTheme = this.detectSystemTheme(),
        this.setTheme(systemTheme) }

    /**
     * カスタムテーマを追加
     */
    public addCustomTheme(name: string, colors: ThemeColors): void { this.themes[name] = {
            name: name,
    colors: colors }

    /**
     * 破棄
     */''
    public destroy()';
        const style = document.getElementById('debug-theme-styles);
        if(style) {', ' }

            style.remove() }'