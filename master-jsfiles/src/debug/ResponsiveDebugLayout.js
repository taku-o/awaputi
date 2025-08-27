/**
 * Responsive Debug Layout - デバッグインターフェースのレスポンシブレイアウト管理
 */
export class ResponsiveDebugLayout {
    constructor(debugInterface) {
        this.debugInterface = debugInterface;
        this.currentBreakpoint = null;
        this.breakpoints = {
            mobile: 480,
            tablet: 768,
            desktop: 1024,
            large: 1440
        };
        this.orientationLock = false;
        this.touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        this.initialize();
    }

    /**
     * 初期化
     */
    initialize() {
        this.setupMediaQueries();
        this.bindResizeEvents();
        this.detectInitialLayout();
        this.setupOrientationHandling();
        
        if (this.touchDevice) {
            this.setupTouchOptimizations();
        }
    }

    /**
     * メディアクエリを設定
     */
    setupMediaQueries() {
        this.mediaQueries = {
            mobile: window.matchMedia(`(max-width: ${this.breakpoints.mobile}px)`),
            tablet: window.matchMedia(`(min-width: ${this.breakpoints.mobile + 1}px) and (max-width: ${this.breakpoints.tablet}px)`),
            desktop: window.matchMedia(`(min-width: ${this.breakpoints.tablet + 1}px) and (max-width: ${this.breakpoints.desktop}px)`),
            large: window.matchMedia(`(min-width: ${this.breakpoints.desktop + 1}px)`)
        };

        // メディアクエリの変更を監視
        Object.entries(this.mediaQueries).forEach(([breakpoint, mq]) => {
            mq.addListener(() => this.handleBreakpointChange(breakpoint, mq.matches));
        });
    }

    /**
     * リサイズイベントをバインド
     */
    bindResizeEvents() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 150); // デバウンス
        });
    }

    /**
     * 初期レイアウトを検出
     */
    detectInitialLayout() {
        const currentBreakpoint = this.getCurrentBreakpoint();
        this.applyBreakpointLayout(currentBreakpoint);
    }

    /**
     * 画面向き処理を設定
     */
    setupOrientationHandling() {
        if ('orientation' in window) {
            window.addEventListener('orientationchange', () => {
                // 画面向き変更後に少し待ってからレイアウト更新
                setTimeout(() => {
                    this.handleOrientationChange();
                }, 100);
            });
        }
    }

    /**
     * タッチ最適化を設定
     */
    setupTouchOptimizations() {
        const debugPanel = this.debugInterface.debugPanel;
        if (debugPanel) {
            debugPanel.classList.add('touch-optimized');
            
            // タッチターゲットサイズを調整
            this.optimizeTouchTargets();
            
            // スワイプジェスチャーを追加
            this.setupSwipeGestures();
        }
    }

    /**
     * 現在のブレークポイントを取得
     */
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width <= this.breakpoints.mobile) {
            return 'mobile';
        } else if (width <= this.breakpoints.tablet) {
            return 'tablet';
        } else if (width <= this.breakpoints.desktop) {
            return 'desktop';
        } else {
            return 'large';
        }
    }

    /**
     * ブレークポイント変更を処理
     */
    handleBreakpointChange(breakpoint, matches) {
        if (matches) {
            this.applyBreakpointLayout(breakpoint);
        }
    }

    /**
     * リサイズを処理
     */
    handleResize() {
        const newBreakpoint = this.getCurrentBreakpoint();
        if (newBreakpoint !== this.currentBreakpoint) {
            this.applyBreakpointLayout(newBreakpoint);
        }
        
        this.updatePanelSizes();
    }

    /**
     * 画面向き変更を処理
     */
    handleOrientationChange() {
        const orientation = this.getOrientation();
        this.applyOrientationLayout(orientation);
        
        // 強制的にレイアウト更新
        setTimeout(() => {
            this.handleResize();
        }, 300);
    }

    /**
     * ブレークポイントレイアウトを適用
     */
    applyBreakpointLayout(breakpoint) {
        this.currentBreakpoint = breakpoint;
        const debugPanel = this.debugInterface.debugPanel;
        
        if (!debugPanel) return;

        // 既存のブレークポイントクラスを削除
        debugPanel.classList.remove('layout-mobile', 'layout-tablet', 'layout-desktop', 'layout-large');
        
        // 新しいブレークポイントクラスを追加
        debugPanel.classList.add(`layout-${breakpoint}`);

        switch (breakpoint) {
            case 'mobile':
                this.applyMobileLayout();
                break;
            case 'tablet':
                this.applyTabletLayout();
                break;
            case 'desktop':
                this.applyDesktopLayout();
                break;
            case 'large':
                this.applyLargeLayout();
                break;
        }

        console.log(`Debug interface layout changed to: ${breakpoint}`);
    }

    /**
     * モバイルレイアウトを適用
     */
    applyMobileLayout() {
        const debugPanel = this.debugInterface.debugPanel;
        
        // フルスクリーン表示
        Object.assign(debugPanel.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            maxHeight: '100vh',
            fontSize: '16px',
            padding: '10px'
        });

        // パネル切り替えをタブ形式に
        this.setupMobileTabs();
        
        // スクロール可能にする
        debugPanel.style.overflowY = 'auto';
    }

    /**
     * タブレットレイアウトを適用
     */
    applyTabletLayout() {
        const debugPanel = this.debugInterface.debugPanel;
        
        Object.assign(debugPanel.style, {
            position: 'fixed',
            top: '10px',
            right: '10px',
            width: '400px',
            height: '80vh',
            maxHeight: '80vh',
            fontSize: '14px',
            padding: '15px'
        });

        this.setupTabletLayout();
    }

    /**
     * デスクトップレイアウトを適用
     */
    applyDesktopLayout() {
        const debugPanel = this.debugInterface.debugPanel;
        
        Object.assign(debugPanel.style, {
            position: 'fixed',
            top: '10px',
            right: '10px',
            width: '350px',
            height: '70vh',
            maxHeight: '70vh',
            fontSize: '12px',
            padding: '15px'
        });

        this.setupDesktopLayout();
    }

    /**
     * 大画面レイアウトを適用
     */
    applyLargeLayout() {
        const debugPanel = this.debugInterface.debugPanel;
        
        Object.assign(debugPanel.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '400px',
            height: '60vh',
            maxHeight: '60vh',
            fontSize: '12px',
            padding: '20px'
        });

        this.setupLargeLayout();
    }

    /**
     * モバイルタブを設定
     */
    setupMobileTabs() {
        // 既存のタブナビゲーションがあれば更新
        let tabNav = this.debugInterface.debugPanel.querySelector('.mobile-tab-nav');
        
        if (!tabNav) {
            tabNav = document.createElement('div');
            tabNav.className = 'mobile-tab-nav';
            tabNav.innerHTML = `
                <div class="tab-buttons">
                    <button class="tab-btn active" data-panel="overview">概要</button>
                    <button class="tab-btn" data-panel="performance">性能</button>
                    <button class="tab-btn" data-panel="console">コンソール</button>
                    <button class="tab-btn" data-panel="error">エラー</button>
                    <button class="tab-btn" data-panel="test">テスト</button>
                </div>
            `;
            
            this.debugInterface.debugPanel.insertBefore(tabNav, this.debugInterface.debugPanel.firstChild);
        }

        // タブボタンイベント
        tabNav.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const panelName = btn.dataset.panel;
                this.debugInterface.switchPanel(panelName);
                
                // アクティブボタンを更新
                tabNav.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    /**
     * タブレットレイアウトを設定
     */
    setupTabletLayout() {
        // タブレット用の調整
        this.optimizeTouchTargets();
    }

    /**
     * デスクトップレイアウトを設定
     */
    setupDesktopLayout() {
        // デスクトップ用の標準レイアウト
    }

    /**
     * 大画面レイアウトを設定
     */
    setupLargeLayout() {
        // 大画面用の拡張レイアウト
    }

    /**
     * タッチターゲットを最適化
     */
    optimizeTouchTargets() {
        const debugPanel = this.debugInterface.debugPanel;
        const buttons = debugPanel.querySelectorAll('button, input, select');
        
        buttons.forEach(element => {
            const currentHeight = parseInt(window.getComputedStyle(element).height);
            if (currentHeight < 44) { // iOS推奨最小タッチターゲットサイズ
                element.style.minHeight = '44px';
                element.style.padding = '8px 16px';
            }
        });
    }

    /**
     * スワイプジェスチャーを設定
     */
    setupSwipeGestures() {
        const debugPanel = this.debugInterface.debugPanel;
        let startX = 0;
        let startY = 0;
        
        debugPanel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        debugPanel.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // 水平スワイプでパネル切り替え
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
                if (deltaX > 0) {
                    this.switchToPreviousPanel();
                } else {
                    this.switchToNextPanel();
                }
            }
        });
    }

    /**
     * 前のパネルに切り替え
     */
    switchToPreviousPanel() {
        const panels = ['overview', 'performance', 'console', 'error', 'test'];
        const currentIndex = panels.indexOf(this.debugInterface.activePanel);
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : panels.length - 1;
        this.debugInterface.switchPanel(panels[previousIndex]);
    }

    /**
     * 次のパネルに切り替え
     */
    switchToNextPanel() {
        const panels = ['overview', 'performance', 'console', 'error', 'test'];
        const currentIndex = panels.indexOf(this.debugInterface.activePanel);
        const nextIndex = currentIndex < panels.length - 1 ? currentIndex + 1 : 0;
        this.debugInterface.switchPanel(panels[nextIndex]);
    }

    /**
     * パネルサイズを更新
     */
    updatePanelSizes() {
        // 各パネルのサイズを現在のレイアウトに合わせて調整
        const panels = this.debugInterface.getAllPanels();
        panels.forEach(panel => {
            if (panel.element && typeof panel.updateSize === 'function') {
                panel.updateSize();
            }
        });
    }

    /**
     * 画面向きを取得
     */
    getOrientation() {
        if (screen.orientation) {
            return screen.orientation.angle === 0 || screen.orientation.angle === 180 ? 'portrait' : 'landscape';
        } else if (window.orientation !== undefined) {
            return window.orientation === 0 || window.orientation === 180 ? 'portrait' : 'landscape';
        } else {
            return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        }
    }

    /**
     * 画面向きレイアウトを適用
     */
    applyOrientationLayout(orientation) {
        const debugPanel = this.debugInterface.debugPanel;
        
        debugPanel.classList.remove('orientation-portrait', 'orientation-landscape');
        debugPanel.classList.add(`orientation-${orientation}`);

        if (this.currentBreakpoint === 'mobile') {
            if (orientation === 'landscape') {
                // 横向きの場合は高さを調整
                debugPanel.style.height = '100vh';
                debugPanel.style.padding = '5px';
            } else {
                // 縦向きの場合は標準設定
                debugPanel.style.height = '100vh';
                debugPanel.style.padding = '10px';
            }
        }
    }

    /**
     * レスポンシブCSSルールを追加
     */
    addResponsiveStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile Layout */
            .enhanced-debug-interface.layout-mobile {
                font-size: 16px;
            }
            
            .enhanced-debug-interface.layout-mobile .mobile-tab-nav {
                position: sticky;
                top: 0;
                background: rgba(0, 0, 0, 0.9);
                z-index: 1000;
                margin: -10px -10px 10px -10px;
                padding: 10px;
            }
            
            .enhanced-debug-interface.layout-mobile .tab-buttons {
                display: flex;
                gap: 5px;
                overflow-x: auto;
            }
            
            .enhanced-debug-interface.layout-mobile .tab-btn {
                flex: 1;
                min-width: 60px;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .enhanced-debug-interface.layout-mobile .tab-btn.active {
                background: rgba(0, 255, 0, 0.3);
                border-color: rgba(0, 255, 0, 0.5);
            }
            
            /* Touch Optimizations */
            .enhanced-debug-interface.touch-optimized button,
            .enhanced-debug-interface.touch-optimized input,
            .enhanced-debug-interface.touch-optimized select {
                min-height: 44px;
                padding: 8px 16px;
            }
            
            /* Tablet Layout */
            .enhanced-debug-interface.layout-tablet {
                font-size: 14px;
            }
            
            /* Desktop Layout */ 
            .enhanced-debug-interface.layout-desktop {
                font-size: 12px;
            }
            
            /* Large Layout */
            .enhanced-debug-interface.layout-large {
                font-size: 12px;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * 破棄
     */
    destroy() {
        // メディアクエリリスナーを削除
        Object.values(this.mediaQueries).forEach(mq => {
            mq.removeListener(this.handleBreakpointChange);
        });
        
        // イベントリスナーを削除
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
    }
}