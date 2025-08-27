/**
 * HelpDisplayController - ヘルプ表示制御システム
 * 
 * ヘルプの表示、アニメーション、位置決定、レスポンシブ対応を管理
 */

export class HelpDisplayController {
    constructor() {
        this.displayConfig = {
            position: 'contextual',
            animation: 'slide',
            duration: 3000,
            dismissible: true,
            persistent: false,
            maxWidth: 400,
            fontSize: 'medium'
        };
        
        this.activeHelp = null;
        this.helpQueue = [];
        this.isDisplaying = false;
        this.animationInProgress = false;
        
        this.initializeDisplayElements();
        this.setupEventListeners();
    }

    /**
     * 表示要素を初期化
     */
    initializeDisplayElements() {
        this.createHelpContainer();
        this.createHelpOverlay();
        this.setupResponsiveHandling();
    }

    /**
     * ヘルプコンテナを作成
     */
    createHelpContainer() {
        this.helpContainer = document.createElement('div');
        this.helpContainer.className = 'contextual-help-container';
        this.helpContainer.setAttribute('role', 'dialog');
        this.helpContainer.setAttribute('aria-label', 'コンテキストヘルプ');
        this.helpContainer.setAttribute('aria-live', 'polite');
        
        this.helpContainer.style.cssText = `
            position: fixed;
            z-index: 10000;
            max-width: ${this.displayConfig.maxWidth}px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            font-size: ${this.getFontSize()};
            line-height: 1.4;
            display: none;
            pointer-events: auto;
        `;
        
        document.body.appendChild(this.helpContainer);
    }

    /**
     * ヘルプオーバーレイを作成
     */
    createHelpOverlay() {
        this.helpOverlay = document.createElement('div');
        this.helpOverlay.className = 'contextual-help-overlay';
        this.helpOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: none;
            pointer-events: auto;
        `;
        
        this.helpOverlay.addEventListener('click', () => {
            if (this.displayConfig.dismissible) {
                this.hideHelp();
            }
        });
        
        document.body.appendChild(this.helpOverlay);
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // キーボードイベント
        document.addEventListener('keydown', (e) => {
            if (this.isDisplaying) {
                if (e.key === 'Escape' && this.displayConfig.dismissible) {
                    this.hideHelp();
                }
                if (e.key === 'Tab') {
                    this.handleTabNavigation(e);
                }
            }
        });

        // リサイズイベント
        window.addEventListener('resize', () => {
            if (this.isDisplaying) {
                this.updatePosition();
            }
        });

        // スクロールイベント
        window.addEventListener('scroll', () => {
            if (this.isDisplaying && this.displayConfig.position === 'contextual') {
                this.updatePosition();
            }
        });
    }

    /**
     * レスポンシブ対応を設定
     */
    setupResponsiveHandling() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        mediaQuery.addListener(() => this.handleResponsiveChange());
        this.handleResponsiveChange();
    }

    /**
     * レスポンシブ変更を処理
     */
    handleResponsiveChange() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            this.displayConfig.maxWidth = Math.min(320, window.innerWidth - 32);
            this.displayConfig.position = 'fixed';
        } else {
            this.displayConfig.maxWidth = 400;
            this.displayConfig.position = 'contextual';
        }
        
        if (this.helpContainer) {
            this.helpContainer.style.maxWidth = `${this.displayConfig.maxWidth}px`;
        }
    }

    /**
     * ヘルプを表示
     */
    async showHelp(content, options = {}) {
        if (this.animationInProgress) {
            this.helpQueue.push({ content, options });
            return;
        }

        this.activeHelp = { content, options };
        this.isDisplaying = true;
        this.animationInProgress = true;

        // コンテンツを設定
        this.renderHelpContent(content, options);
        
        // 位置を計算
        this.calculatePosition(options.targetElement);
        
        // 表示アニメーション
        await this.showAnimation();
        
        this.animationInProgress = false;

        // 自動非表示タイマー
        if (!this.displayConfig.persistent && this.displayConfig.duration > 0) {
            this.setupAutoHide();
        }
    }

    /**
     * ヘルプコンテンツをレンダリング
     */
    renderHelpContent(content, options) {
        let html = '';
        
        // タイトル
        if (content.title) {
            html += `<h3 style="margin: 0 0 12px 0; font-size: 1.2em; color: #fff;">${content.title}</h3>`;
        }
        
        // 説明
        if (content.description) {
            html += `<p style="margin: 0 0 12px 0; color: #ccc;">${content.description}</p>`;
        }
        
        // ステップ
        if (content.steps) {
            html += '<ol style="margin: 0; padding-left: 20px;">';
            content.steps.forEach(step => {
                html += `<li style="margin-bottom: 8px;">
                    <strong>${step.title}</strong><br>
                    <span style="color: #ccc;">${step.description}</span>
                `;
                if (step.keyboardAlternative) {
                    html += `<br><small style="color: #aaa;">キーボード: ${step.keyboardAlternative}</small>`;
                }
                html += '</li>';
            });
            html += '</ol>';
        }
        
        // セクション
        if (content.sections) {
            content.sections.forEach(section => {
                html += `<div style="margin-bottom: 12px;">
                    <h4 style="margin: 0 0 4px 0; color: #fff;">${section.title}</h4>
                    <p style="margin: 0; color: #ccc;">${section.content}</p>
                `;
                if (section.tips) {
                    html += '<ul style="margin: 4px 0 0 20px;">';
                    section.tips.forEach(tip => {
                        html += `<li style="color: #aaa;">${tip}</li>`;
                    });
                    html += '</ul>';
                }
                html += '</div>';
            });
        }
        
        // 閉じるボタン
        if (this.displayConfig.dismissible) {
            html += `<button 
                style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: #ccc; font-size: 18px; cursor: pointer; padding: 4px;"
                onclick="this.closest('.contextual-help-container').style.display='none'"
                aria-label="ヘルプを閉じる"
            >×</button>`;
        }
        
        this.helpContainer.innerHTML = html;
    }

    /**
     * 位置を計算
     */
    calculatePosition(targetElement) {
        if (this.displayConfig.position === 'fixed') {
            this.setFixedPosition();
        } else if (this.displayConfig.position === 'contextual' && targetElement) {
            this.setContextualPosition(targetElement);
        } else {
            this.setCenterPosition();
        }
    }

    /**
     * 固定位置を設定
     */
    setFixedPosition() {
        Object.assign(this.helpContainer.style, {
            top: '20px',
            right: '20px',
            left: 'auto',
            bottom: 'auto',
            transform: 'none'
        });
    }

    /**
     * コンテキスト位置を設定
     */
    setContextualPosition(targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const containerRect = this.helpContainer.getBoundingClientRect();
        
        let top = rect.bottom + 10;
        let left = rect.left;
        
        // 画面外チェック
        if (left + this.displayConfig.maxWidth > window.innerWidth) {
            left = window.innerWidth - this.displayConfig.maxWidth - 20;
        }
        
        if (top + containerRect.height > window.innerHeight) {
            top = rect.top - containerRect.height - 10;
        }
        
        Object.assign(this.helpContainer.style, {
            top: `${top}px`,
            left: `${left}px`,
            right: 'auto',
            bottom: 'auto',
            transform: 'none'
        });
    }

    /**
     * 中央位置を設定
     */
    setCenterPosition() {
        Object.assign(this.helpContainer.style, {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)'
        });
    }

    /**
     * 表示アニメーション
     */
    async showAnimation() {
        this.helpContainer.style.display = 'block';
        
        if (this.displayConfig.position === 'overlay') {
            this.helpOverlay.style.display = 'block';
        }
        
        switch (this.displayConfig.animation) {
            case 'slide':
                await this.slideInAnimation();
                break;
            case 'fade':
                await this.fadeInAnimation();
                break;
            case 'scale':
                await this.scaleInAnimation();
                break;
            default:
                this.helpContainer.style.opacity = '1';
        }
    }

    /**
     * スライドイン アニメーション
     */
    async slideInAnimation() {
        this.helpContainer.style.transform += ' translateY(-20px)';
        this.helpContainer.style.opacity = '0';
        
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                this.helpContainer.style.transition = 'all 0.3s ease-out';
                this.helpContainer.style.transform = this.helpContainer.style.transform.replace('translateY(-20px)', '');
                this.helpContainer.style.opacity = '1';
                setTimeout(resolve, 300);
            });
        });
    }

    /**
     * フェードイン アニメーション
     */
    async fadeInAnimation() {
        this.helpContainer.style.opacity = '0';
        
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                this.helpContainer.style.transition = 'opacity 0.3s ease-out';
                this.helpContainer.style.opacity = '1';
                setTimeout(resolve, 300);
            });
        });
    }

    /**
     * スケールイン アニメーション
     */
    async scaleInAnimation() {
        this.helpContainer.style.transform += ' scale(0.8)';
        this.helpContainer.style.opacity = '0';
        
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                this.helpContainer.style.transition = 'all 0.3s ease-out';
                this.helpContainer.style.transform = this.helpContainer.style.transform.replace('scale(0.8)', '');
                this.helpContainer.style.opacity = '1';
                setTimeout(resolve, 300);
            });
        });
    }

    /**
     * ヘルプを非表示
     */
    async hideHelp() {
        if (!this.isDisplaying || this.animationInProgress) return;
        
        this.animationInProgress = true;
        
        await this.hideAnimation();
        
        this.helpContainer.style.display = 'none';
        this.helpOverlay.style.display = 'none';
        
        this.isDisplaying = false;
        this.activeHelp = null;
        this.animationInProgress = false;
        
        // キューの次のヘルプを表示
        if (this.helpQueue.length > 0) {
            const next = this.helpQueue.shift();
            setTimeout(() => this.showHelp(next.content, next.options), 100);
        }
    }

    /**
     * 非表示アニメーション
     */
    async hideAnimation() {
        return new Promise(resolve => {
            this.helpContainer.style.transition = 'all 0.2s ease-in';
            this.helpContainer.style.opacity = '0';
            this.helpContainer.style.transform += ' translateY(-10px)';
            setTimeout(resolve, 200);
        });
    }

    /**
     * 自動非表示を設定
     */
    setupAutoHide() {
        this.autoHideTimer = setTimeout(() => {
            this.hideHelp();
        }, this.displayConfig.duration);
    }

    /**
     * 位置を更新
     */
    updatePosition() {
        if (this.activeHelp && this.activeHelp.options.targetElement) {
            this.calculatePosition(this.activeHelp.options.targetElement);
        }
    }

    /**
     * フォントサイズを取得
     */
    getFontSize() {
        const sizes = {
            small: '12px',
            medium: '14px',
            large: '16px',
            xl: '18px'
        };
        return sizes[this.displayConfig.fontSize] || sizes.medium;
    }

    /**
     * Tabナビゲーションを処理
     */
    handleTabNavigation(e) {
        const focusableElements = this.helpContainer.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * 設定を更新
     */
    updateConfig(newConfig) {
        Object.assign(this.displayConfig, newConfig);
        
        if (this.helpContainer) {
            this.helpContainer.style.maxWidth = `${this.displayConfig.maxWidth}px`;
            this.helpContainer.style.fontSize = this.getFontSize();
        }
        
        if (this.isDisplaying) {
            this.updatePosition();
        }
    }

    /**
     * アクティブヘルプを取得
     */
    getActiveHelp() {
        return this.activeHelp;
    }

    /**
     * 表示状態を取得
     */
    isHelp() {
        return this.isDisplaying;
    }

    /**
     * キューをクリア
     */
    clearQueue() {
        this.helpQueue = [];
    }

    /**
     * 自動非表示タイマーをクリア
     */
    clearAutoHideTimer() {
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
            this.autoHideTimer = null;
        }
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.clearAutoHideTimer();
        this.clearQueue();
        
        if (this.helpContainer) {
            this.helpContainer.remove();
        }
        
        if (this.helpOverlay) {
            this.helpOverlay.remove();
        }
    }
}