/**
 * Focus Accessibility Support
 * 
 * アクセシビリティサポート機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - Navigation feedback display
 * - Keyboard hints management
 * - Breadcrumb trail updates
 * - Accessibility announcements
 * 
 * @module FocusAccessibilitySupport
 * Created: Phase G.3 (Issue #103)
 */

export class FocusAccessibilitySupport {
    constructor(mainController) {
        this.mainController = mainController;
        this.config = mainController.config;
        this.state = mainController.state;
        this.elements = mainController.elements;
    }

    /**
     * ナビゲーションフィードバックの表示
     */
    showNavigationFeedback(element, index) {
        if (!this.config.navigationFeedback.enabled) return;
        
        const indicator = this.elements.navigationIndicator;
        const direction = this.mainController.focusStateManager.getNavigationDirection();
        const position = this.mainController.focusStateManager.getElementPosition(element, index);
        
        // 方向インジケータ
        if (this.config.navigationFeedback.showDirection && direction) {
            indicator.querySelector('.direction').textContent = direction.icon;
            indicator.querySelector('.status').textContent = direction.text;
        }
        
        // 位置情報
        if (this.config.navigationFeedback.showPosition && position) {
            indicator.querySelector('.position').textContent = position;
        }
        
        // 表示
        indicator.classList.add('visible');
        
        // 自動非表示タイマー
        if (this.state.animationTimers.has('navigation')) {
            clearTimeout(this.state.animationTimers.get('navigation'));
        }
        
        const timer = setTimeout(() => {
            indicator.classList.remove('visible');
        }, this.config.navigationFeedback.fadeTimeout);
        
        this.state.animationTimers.set('navigation', timer);
    }

    /**
     * キーボードヒントの表示
     */
    showKeyboardHints(element) {
        if (!this.config.keyboardHints.enabled) return;
        
        const hints = this.generateKeyboardHints(element);
        if (!hints.length) return;
        
        const hint = this.elements.keyboardHint;
        const shortcutsContainer = hint.querySelector('.shortcuts');
        
        // ショートカット情報を更新
        shortcutsContainer.innerHTML = hints.map(hint => `
            <div class="shortcut">
                <span class="description">${hint.description}</span>
                <span class="key">${hint.key}</span>
            </div>
        `).join('');
        
        // 表示
        hint.classList.add('visible');
        this.state.keyboardHintVisible = true;
        
        // 自動非表示タイマー
        if (this.config.keyboardHints.autoHide) {
            if (this.state.animationTimers.has('keyboardHint')) {
                clearTimeout(this.state.animationTimers.get('keyboardHint'));
            }
            
            const timer = setTimeout(() => {
                this.hideKeyboardHints();
            }, this.config.keyboardHints.hideDelay);
            
            this.state.animationTimers.set('keyboardHint', timer);
        }
    }

    /**
     * キーボードヒントの非表示
     */
    hideKeyboardHints() {
        const hint = this.elements.keyboardHint;
        hint.classList.remove('visible');
        this.state.keyboardHintVisible = false;
    }

    /**
     * キーボードヒントの切り替え
     */
    toggleKeyboardHints() {
        if (this.state.keyboardHintVisible) {
            this.hideKeyboardHints();
        } else {
            // 現在フォーカスされている要素のヒントを表示
            if (this.state.currentFocusElement) {
                this.showKeyboardHints(this.state.currentFocusElement);
            }
        }
    }

    /**
     * パンくずリストの更新
     */
    updateBreadcrumbTrail(element) {
        const path = this.generateElementPath(element);
        const breadcrumb = this.elements.breadcrumbTrail;
        const pathContainer = breadcrumb.querySelector('.path');
        
        pathContainer.innerHTML = path.map(item => `
            <span class="item">${item}</span>
        `).join('<span class="separator">›</span>');
        
        breadcrumb.classList.add('visible');
        
        // 自動非表示
        if (this.state.animationTimers.has('breadcrumb')) {
            clearTimeout(this.state.animationTimers.get('breadcrumb'));
        }
        
        const timer = setTimeout(() => {
            breadcrumb.classList.remove('visible');
        }, this.config.navigationFeedback.fadeTimeout);
        
        this.state.animationTimers.set('breadcrumb', timer);
    }

    /**
     * キーボードヒント生成
     */
    generateKeyboardHints(element) {
        const hints = [];
        
        // 基本ナビゲーション
        hints.push(
            { key: 'Tab', description: '次の要素' },
            { key: 'Shift+Tab', description: '前の要素' },
            { key: 'Enter', description: '実行' },
            { key: 'Escape', description: 'キャンセル' }
        );
        
        // コンテキスト固有のヒント
        const role = element.getAttribute('role') || element.tagName.toLowerCase();
        
        switch (role) {
            case 'button':
                hints.push({ key: 'Space', description: 'クリック' });
                break;
            case 'input':
                if (element.type === 'checkbox' || element.type === 'radio') {
                    hints.push({ key: 'Space', description: '切り替え' });
                }
                break;
            case 'select':
                hints.push(
                    { key: '↑↓', description: '選択' },
                    { key: 'Space', description: '開く' }
                );
                break;
        }
        
        // 2Dナビゲーションが有効な場合
        if (this.mainController.accessibilityManager?.config.keyboard.navigationMode === '2d') {
            hints.push({ key: '↑↓←→', description: '2D移動' });
        }
        
        // グローバルショートカット
        hints.push(
            { key: 'F1', description: 'ヘルプ' },
            { key: 'Alt+C', description: 'コントラスト' },
            { key: 'Alt+F', description: 'フォーカス表示' }
        );
        
        return hints.slice(0, 8); // 最大8個まで
    }

    /**
     * 要素パスの生成
     */
    generateElementPath(element) {
        const path = [];
        let current = element;
        
        while (current && current !== document.body) {
            let label = '';
            
            // ラベルの取得優先順位
            if (current.getAttribute('aria-label')) {
                label = current.getAttribute('aria-label');
            } else if (current.getAttribute('title')) {
                label = current.getAttribute('title');
            } else if (current.tagName === 'BUTTON' || current.tagName === 'A') {
                label = current.textContent?.trim() || current.tagName.toLowerCase();
            } else if (current.id) {
                label = current.id;
            } else if (current.className) {
                label = current.className.split(' ')[0];
            } else {
                label = current.tagName.toLowerCase();
            }
            
            if (label && label.length > 0) {
                path.unshift(label.substring(0, 20)); // 最大20文字
            }
            
            current = current.parentElement;
            
            // パスの長さ制限
            if (path.length >= 4) break;
        }
        
        return path;
    }

    /**
     * アクセシビリティアナウンス
     */
    announceToScreenReader(message, priority = 'polite') {
        // aria-live要素を使用してスクリーンリーダーに通知
        let announcer = document.getElementById('focus-announcer');
        
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'focus-announcer';
            announcer.className = 'sr-only';
            announcer.setAttribute('aria-live', priority);
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.cssText = `
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            `;
            document.body.appendChild(announcer);
        }
        
        // メッセージを設定（短時間後にクリア）
        announcer.textContent = message;
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }

    /**
     * フォーカス可能要素の検証
     */
    validateFocusableElement(element) {
        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ];
        
        return focusableSelectors.some(selector => element.matches(selector)) ||
               element.getAttribute('tabindex') !== null;
    }

    /**
     * 要素の可視性チェック
     */
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        
        return rect.width > 0 && 
               rect.height > 0 &&
               style.visibility !== 'hidden' &&
               style.display !== 'none' &&
               style.opacity !== '0';
    }

    /**
     * アクセシビリティ設定の適用
     */
    applyAccessibilitySettings(settings) {
        if (settings.announcements !== undefined) {
            this.config.announcements.enabled = settings.announcements;
        }
        
        if (settings.detailedHints !== undefined) {
            this.config.keyboardHints.detailed = settings.detailedHints;
        }
        
        if (settings.breadcrumbs !== undefined) {
            this.config.visualCues.breadcrumbs = settings.breadcrumbs;
        }
        
        console.log('Focus accessibility settings applied:', settings);
    }

    /**
     * レポート生成
     */
    generateAccessibilityReport() {
        const focusableElements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]');
        const visibleElements = Array.from(focusableElements).filter(el => this.isElementVisible(el));
        
        return {
            totalFocusableElements: focusableElements.length,
            visibleFocusableElements: visibleElements.length,
            keyboardHintsEnabled: this.config.keyboardHints.enabled,
            navigationFeedbackEnabled: this.config.navigationFeedback.enabled,
            breadcrumbsEnabled: this.config.visualCues.breadcrumbs,
            currentFocusPath: this.state.currentFocusElement ? 
                this.generateElementPath(this.state.currentFocusElement) : null
        };
    }

    /**
     * リソースの解放
     */
    dispose() {
        // キーボードヒントを非表示
        this.hideKeyboardHints();
        
        // すべてのフィードバック要素を非表示
        this.elements.navigationIndicator.classList.remove('visible');
        this.elements.breadcrumbTrail.classList.remove('visible');
        
        // アナウンサー要素を削除
        const announcer = document.getElementById('focus-announcer');
        if (announcer && announcer.parentNode) {
            announcer.parentNode.removeChild(announcer);
        }
        
        console.log('FocusAccessibilitySupport disposed');
    }
}