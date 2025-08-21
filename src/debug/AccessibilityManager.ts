/**
 * Accessibility Manager - デバッグインターフェースのアクセシビリティ管理
 */

interface DebugInterface { debugPanel?: HTMLElement;

interface FocusManagement { focusableElements: Element[],
    currentFocusIndex: number;
    focusTrap: boolean;

interface AccessibilityInfo { screenReaderDetected: boolean,
    keyboardNavigationEnabled: boolean;
    focusableElementsCount: number;
    currentFocusIndex: number;

export class DebugAccessibilityManager {
    private debugInterface: DebugInterface;
    private isScreenReaderDetected: boolean;
    private keyboardNavigationEnabled: boolean;
    private, focusManagement: FocusManagement,
    constructor(debugInterface: DebugInterface) {

        this.debugInterface = debugInterface;
        this.isScreenReaderDetected = false;
        this.keyboardNavigationEnabled = true;
        this.focusManagement = {
            focusableElements: [],
    currentFocusIndex: -1 }
            focusTrap: false;;
        this.initialize();
    }

    /**
     * 初期化
     */
    private initialize(): void { this.detectScreenReader(),
        this.setupKeyboardNavigation(),
        this.setupARIASupport(),
        this.setupFocusManagement(),
        this.addAccessibilityStyles() }

    /**
     * スクリーンリーダーを検出
     */
    private detectScreenReader(): void { // スクリーンリーダーの一般的な検出方法
        this.isScreenReaderDetected = !!(
            window.speechSynthesis ||;
            window.navigator.userAgent.includes('NVDA') ||','
            window.navigator.userAgent.includes('JAWS') ||','
            window.navigator.userAgent.includes('VoiceOver') ||','
            document.body.classList.contains('screenreader-text),'

        if (this.isScreenReaderDetected) {

            console.log('Screen reader detected, enabling enhanced accessibility features' }
            this.enableScreenReaderSupport(); }
}

    /**
     * キーボードナビゲーションを設定'
     */''
    private setupKeyboardNavigation()';'
        document.addEventListener('keydown', (event) => {  ''
            if(!this.keyboardNavigationEnabled) return,
            ','
            // デバッグパネルが表示されている場合のみ処理
            if(!this.debugInterface.debugPanel || this.debugInterface.debugPanel.style.display === 'none' { }'
                return; }
            }

            this.handleKeyboardNavigation(event);
        });
    }

    /**
     * キーボードナビゲーションを処理'
     */''
    private handleKeyboardNavigation(event: KeyboardEvent): void {
        const { key, ctrlKey, altKey, shiftKey } = event;
';'
        // ESCキーでフォーカスを外す
        if(key === 'Escape' {'

            this.clearFocus()','
        if(key === 'Tab' {'
            event.preventDefault(),
            if (shiftKey) {
        }
                this.focusPrevious(); }

            } else {
                this.focusNext()','
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight].includes(key) {', ' }'

            this.handleArrowKeyNavigation(event); }
            return; }
        }
';'
        // Enterキーまたはスペースキーでアクティベート
        if (key === 'Enter' || key === ', ') {
            this.activateCurrentElement(event) }
            return; }
        }

        // Ctrl+数字キーでパネル切り替え
        if (ctrlKey && /^[1-6]$/.test(key) {
            event.preventDefault(),
            this.switchPanelByNumber(parseInt(key) - 1) }
            return; }
}

    /**
     * 矢印キーナビゲーションを処理'
     */''
    private handleArrowKeyNavigation(event: KeyboardEvent): void {
        const { key } = event;
        const currentElement = document.activeElement;
        ';'
        // タブ内での矢印キー移動
        if(currentElement && currentElement.classList.contains('debug-tab' {'

            event.preventDefault()','
            const tabs = Array.from(this.debugInterface.debugPanel!.querySelectorAll('.debug-tab',
            const currentIndex = tabs.indexOf(currentElement),
            ','

            let nextIndex: number | undefined,
            if (key === 'ArrowLeft') {
        }

                nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;' }'

            } else if (key === 'ArrowRight' nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0 }'
            
            if (nextIndex !== undefined && tabs[nextIndex]) { (tabs[nextIndex] as, HTMLElement).focus() }
}

    /**
     * 現在の要素をアクティベート'
     */''
    private activateCurrentElement(event: KeyboardEvent): void { const currentElement = document.activeElement as HTMLElement,
        if (currentElement && (currentElement.tagName === 'BUTTON' || currentElement.tagName === 'A) {'
            event.preventDefault() }
            currentElement.click(); }
}

    /**
     * パネルを番号で切り替え
     */'
    private switchPanelByNumber(index: number): void { ''
        if(!this.debugInterface.debugPanel) return,

        const tabs = this.debugInterface.debugPanel.querySelectorAll('.debug-tab),'
        if (tabs[index]) {
            (tabs[index] as, HTMLElement).click() }
            (tabs[index] as, HTMLElement).focus(); }
}

    /**
     * ARIA支援を設定
     */'
    private setupARIASupport(): void { const debugPanel = this.debugInterface.debugPanel,
        if(!debugPanel) return,
','
        // メインパネルにrole属性を設定
        debugPanel.setAttribute('role', 'application'),
        debugPanel.setAttribute('aria-label', 'Debug Interface),'

        // タブパネルのARIA属性を設定
        this.setupTabsARIA(),
        
        // パネルコンテンツのARIA属性を設定
        this.setupPanelContentARIA() }

    /**
     * タブのARIA属性を設定
     */
    private setupTabsARIA(): void { ''
        if(!this.debugInterface.debugPanel) return,

        const tabsContainer = this.debugInterface.debugPanel.querySelector('.debug-tabs'),
        const tabs = this.debugInterface.debugPanel.querySelectorAll('.debug-tab'),
        const panels = this.debugInterface.debugPanel.querySelectorAll('.debug-panel),'

        if (tabsContainer) {

            tabsContainer.setAttribute('role', 'tablist') }

            tabsContainer.setAttribute('aria-label', 'Debug panels'; }
        }
';'

        tabs.forEach((tab, index) => {  ''
            const panelName = (tab, as HTMLElement').dataset.panel,'

            ' }'

            tab.setAttribute('role', 'tab');' }'

            tab.setAttribute('aria-controls', `panel-${panelName}`;
            tab.setAttribute('id', `tab-${panelName}`;
            tab.setAttribute('tabindex', index === 0 ? '0' : '-1');
            tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
        });

        panels.forEach((panel) => {  const panelId = panel.id,
            const panelName = panelId.replace('panel-', ''),

            ' }'

            panel.setAttribute('role', 'tabpanel');' }'

            panel.setAttribute('aria-labelledby', `tab-${panelName}`;
            panel.setAttribute('tabindex', '0);'
        }';'
    }

    /**
     * パネルコンテンツのARIA属性を設定
     */'
    private setupPanelContentARIA(): void { ''
        if(!this.debugInterface.debugPanel) return,
        ','
        // ライブリージョンの設定
        const statusElement = this.debugInterface.debugPanel.querySelector('#debug-status-text',
        if (statusElement) {

            statusElement.setAttribute('aria-live', 'polite') }

            statusElement.setAttribute('aria-atomic', 'true'); }
        }
';'
        // エラーパネルのライブリージョン
        const errorList = this.debugInterface.debugPanel.querySelector('#error-list';
        if (errorList) {

            errorList.setAttribute('aria-live', 'polite') }

            errorList.setAttribute('aria-label', 'Error messages'); }
        }
';'
        // コンソール出力のライブリージョン
        const consoleOutput = this.debugInterface.debugPanel.querySelector('#console-output';
        if (consoleOutput) {

            consoleOutput.setAttribute('aria-live', 'polite') }

            consoleOutput.setAttribute('aria-label', 'Console output); }'
}

    /**
     * フォーカス管理を設定
     */
    private setupFocusManagement(): void { this.updateFocusableElements(),
        
        // フォーカストラップの設定
        const debugPanel = this.debugInterface.debugPanel,
        if (debugPanel) {', ' }

            debugPanel.addEventListener('focusin', () => {  }

                this.focusManagement.focusTrap = true;' }'

            }');'

            debugPanel.addEventListener('focusout', (event) => {  // フォーカスがパネル外に移動した場合
                if (!debugPanel.contains((event, as FocusEvent).relatedTarget as Node)) { }
                    this.focusManagement.focusTrap = false; }
});
        }
    }

    /**
     * フォーカス可能な要素を更新
     */
    updateFocusableElements(): void { const debugPanel = this.debugInterface.debugPanel,
        if(!debugPanel) return,
','

        const focusableSelectors = [']',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"]",'
        ],

        this.focusManagement.focusableElements = Array.from()','
            debugPanel.querySelectorAll(focusableSelectors.join(', ')).filter(el => { )
            // 非表示要素を除外),
            const rect = el.getBoundingClientRect() }
            return rect.width > 0 && rect.height > 0;);
    }

    /**
     * 次の要素にフォーカス
     */
    private focusNext(): void { this.updateFocusableElements(),
        const elements = this.focusManagement.focusableElements,
        
        if (elements.length === 0) return,

        const currentIndex = elements.indexOf(document.activeElement!),
        const nextIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : 0,
        
        (elements[nextIndex] as, HTMLElement).focus(),
        this.focusManagement.currentFocusIndex = nextIndex }

    /**
     * 前の要素にフォーカス
     */
    private focusPrevious(): void { this.updateFocusableElements(),
        const elements = this.focusManagement.focusableElements,
        
        if (elements.length === 0) return,

        const currentIndex = elements.indexOf(document.activeElement!),
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : elements.length - 1,
        
        (elements[prevIndex] as, HTMLElement).focus(),
        this.focusManagement.currentFocusIndex = prevIndex }

    /**
     * フォーカスをクリア
     */
    private clearFocus(): void { if (document.activeElement) {
            (document.activeElement, as HTMLElement).blur() }
        this.focusManagement.currentFocusIndex = -1;
    }

    /**
     * スクリーンリーダーサポートを有効化
     */'
    private enableScreenReaderSupport(): void { const debugPanel = this.debugInterface.debugPanel,
        if(!debugPanel) return,
','
        // スクリーンリーダー用の説明テキストを追加
        const description = document.createElement('div'),
        description.className = 'sr-only',
        description.textContent = 'Debug interface with multiple panels. Use Tab to navigate, Ctrl+1-6 to switch panels, Escape to exit.',
        debugPanel.insertBefore(description, debugPanel.firstChild),

        // 動的コンテンツの変更を通知
        this.setupLiveRegions() }

    /**
     * ライブリージョンを設定
     */''
    private setupLiveRegions()';'
        const assertiveRegion = document.createElement('div');
        assertiveRegion.className = 'sr-only';
        assertiveRegion.setAttribute('aria-live', 'assertive');
        assertiveRegion.setAttribute('aria-atomic', 'true');
        assertiveRegion.id = 'debug-assertive-live-region';
        document.body.appendChild(assertiveRegion);
';'
        // ポライトなライブリージョン（一般的な更新用）
        const politeRegion = document.createElement('div');
        politeRegion.className = 'sr-only';
        politeRegion.setAttribute('aria-live', 'polite');
        politeRegion.setAttribute('aria-atomic', 'true');
        politeRegion.id = 'debug-polite-live-region';
        document.body.appendChild(politeRegion);
    }

    /**
     * ライブリージョンに通知'
     */''
    announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void { ''
        const regionId = priority === 'assertive' ? undefined : undefined','
            'debug-assertive-live-region' : 'debug-polite-live-region',
        
        const region = document.getElementById(regionId),
        if (region) {
            region.textContent = message,
            ','

            // 一定時間後にクリア（重複を避けるため）
        }

            setTimeout(() => { }'

                region.textContent = '; }'
            }, 1000';'
        }
    }

    /**
     * アクセシビリティスタイルを追加'
     */''
    private addAccessibilityStyles()';'
        if(document.getElementById('debug-accessibility-styles)' return;

        const style = document.createElement('style');
        style.id = 'debug-accessibility-styles';
        style.textContent = `;
            /* スクリーンリーダー専用テキスト */
            .sr-only { position: absolute,
                width: 1px,
                height: 1px,
                padding: 0,
                margin: -1px,
                overflow: hidden,
    clip: rect(0, 0, 0, 0),
                white-space: nowrap,
                border: 0  }

            /* フォーカス表示の強化 */
            .enhanced-debug-interface *:focus { outline: 2px solid #0066cc,
                outline-offset: 2px }

            .enhanced-debug-interface.theme-high-contrast *:focus { outline: 3px solid #ffff00,
                outline-offset: 2px }

            /* キーボードナビゲーション用のホバー効果 */
            .enhanced-debug-interface button:focus,
            .enhanced-debug-interface .debug-tab:focus { background-color: rgba(0, 102, 204, 0.3 }

            .enhanced-debug-interface.theme-high-contrast button:focus,
            .enhanced-debug-interface.theme-high-contrast .debug-tab:focus { background-color: #ffff00,
                color: #000000  }

            /* アクセシブルなボタンサイズ */
            .enhanced-debug-interface button;
            .enhanced-debug-interface .debug-tab { min-height: 32px, /* WCAG推奨最小サイズ */
                min-width: 32px }

            /* 高コントラスト用の境界線強化 */
            .enhanced-debug-interface.theme-high-contrast * { border-width: 2px !important }

            /* スキップリンク */
            .debug-skip-link { position: absolute,
                top: -40px,
                left: 6px,
                background: #000,
                color: #fff,
    padding: 8px,
                text-decoration: none,
                z-index: 10001,
                border-radius: 4px }

            .debug-skip-link:focus { top: 6px }

            /* 動きを抑制 */
            @media (prefers-reduced-motion: reduce) { .enhanced-debug-interface *,
                .enhanced-debug-interface *::before,
                .enhanced-debug-interface *::after {
                    animation-duration: 0.01ms !important,
                    animation-iteration-count: 1 !important,
                    transition-duration: 0.01ms !important,
                    scroll-behavior: auto !important }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * スキップリンクを追加
     */'
    addSkipLinks(): void { const debugPanel = this.debugInterface.debugPanel,
        if(!debugPanel) return,

        const skipLink = document.createElement('a'),
        skipLink.href = '#debug-content',
        skipLink.className = 'debug-skip-link',
        skipLink.textContent = 'Skip to debug content',

        debugPanel.insertBefore(skipLink, debugPanel.firstChild),
','
        // コンテンツエリアにIDを設定
        const content = debugPanel.querySelector('.debug-content',
        if (content && !content.id) {', ' }

            content.id = 'debug-content'; }
}

    /**
     * パネル切り替え時のアクセシビリティ更新
     */'
    onPanelSwitch(panelName: string): void { ''
        if(!this.debugInterface.debugPanel) return,
        ','
        // ARIA属性の更新
        const tabs = this.debugInterface.debugPanel.querySelectorAll('.debug-tab),'

        tabs.forEach(tab => { ),
            const isActive = (tab, as HTMLElement').dataset.panel === panelName,'
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false'),' }'

            tab.setAttribute('tabindex', isActive ? '0' : '-1); '
    });

        // スクリーンリーダーに通知
        this.announceToScreenReader(`Switched, to ${ panelName} panel`};
        
        // フォーカス可能な要素を更新 }
        this.updateFocusableElements(});
    }

    /**
     * アクセシビリティ機能の有効/無効を切り替え
     */
    setKeyboardNavigationEnabled(enabled: boolean): void { this.keyboardNavigationEnabled = enabled }

    /**
     * アクセシビリティ情報を取得
     */
    getAccessibilityInfo(): AccessibilityInfo { return { screenReaderDetected: this.isScreenReaderDetected,
            keyboardNavigationEnabled: this.keyboardNavigationEnabled,
    focusableElementsCount: this.focusManagement.focusableElements.length };
            currentFocusIndex: this.focusManagement.currentFocusIndex 
    }

    /**
     * 破棄
     */''
    destroy()';'
        const assertiveRegion = document.getElementById('debug-assertive-live-region');
        const politeRegion = document.getElementById('debug-polite-live-region';
        ';'

        if (assertiveRegion) assertiveRegion.remove();
        if (politeRegion) politeRegion.remove()';'
        const style = document.getElementById('debug-accessibility-styles';
        if (style) style.remove();