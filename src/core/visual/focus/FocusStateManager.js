/**
 * Focus State Manager
 * 
 * フォーカス状態管理機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - Focus state tracking and management
 * - Navigation path updates
 * - System settings detection and application
 * - High contrast mode handling
 * 
 * @module FocusStateManager
 * Created: Phase G.3 (Issue #103)
 */

export class FocusStateManager {
    constructor(mainController) {
        this.mainController = mainController;
        this.accessibilityManager = mainController.accessibilityManager;
        this.focusManager = mainController.focusManager;
        this.config = mainController.config;
        this.cssClasses = mainController.cssClasses;
        
        // 状態管理
        this.state = mainController.state;
    }

    /**
     * 視覚的フォーカス表示の更新
     */
    updateFocusVisuals(element, index) {
        if (!this.config.focusRing.enabled) return;
        
        // 要素にフォーカスクラスを追加
        element.classList.add(this.cssClasses.focusVisible);
        
        // カスタムフォーカスリングの位置調整
        this.mainController.focusEffectRenderer.positionFocusRing(element);
        
        // フォーカスオーバーレイの更新
        this.mainController.focusEffectRenderer.updateFocusOverlay(element);
        
        // ランドマーク要素のハイライト
        if (this.config.visualCues.landmarkHighlight) {
            this.mainController.focusEffectRenderer.highlightLandmarks(element);
        }
        
        // グループインジケータの更新
        if (this.config.visualCues.groupIndicators) {
            this.mainController.focusEffectRenderer.updateGroupIndicators(element);
        }
    }

    /**
     * ナビゲーションパスの更新
     */
    updateNavigationPath(element) {
        this.state.navigationPath.push({
            element: element,
            timestamp: Date.now(),
            position: this.getElementPosition(element)
        });
        
        // パス履歴の制限
        if (this.state.navigationPath.length > 10) {
            this.state.navigationPath.shift();
        }
    }

    /**
     * 要素位置情報の取得
     */
    getElementPosition(element, index) {
        if (typeof index === 'number' && this.focusManager.focusableElements) {
            const total = this.focusManager.focusableElements.length;
            return `${index + 1} / ${total}`;
        }
        
        // フォールバック：セクション内での位置
        const section = element.closest('section, main, nav, aside');
        if (section) {
            const sectionElements = section.querySelectorAll('[tabindex], button, input, select, textarea, a[href]');
            const elementIndex = Array.from(sectionElements).indexOf(element);
            if (elementIndex !== -1) {
                return `${elementIndex + 1} / ${sectionElements.length}`;
            }
        }
        
        return null;
    }

    /**
     * システム設定の検出と適用
     */
    detectAndApplySystemSettings() {
        // ハイコントラストモードの検出
        if (window.matchMedia) {
            const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
            this.state.isHighContrastMode = highContrastQuery.matches;
            
            highContrastQuery.addEventListener('change', (e) => {
                this.setHighContrastMode(e.matches);
            });
        }
        
        // 初期状態の適用
        if (this.state.isHighContrastMode) {
            this.setHighContrastMode(true);
        }
    }

    /**
     * ハイコントラストモードの設定
     */
    setHighContrastMode(enabled) {
        this.state.isHighContrastMode = enabled;
        this.config.highContrast.enabled = enabled;
        
        if (enabled) {
            document.body.classList.add(this.cssClasses.highContrast);
        } else {
            document.body.classList.remove(this.cssClasses.highContrast);
        }
        
        // スタイルの再適用
        this.mainController.setupVisualStyles();
        
        console.log(`High contrast mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * フォーカス状態のクリア
     */
    clearFocusState() {
        // フォーカスクラスを削除
        document.querySelectorAll(`.${this.cssClasses.focusVisible}`).forEach(el => {
            el.classList.remove(this.cssClasses.focusVisible);
        });
        
        // 状態をリセット
        this.state.currentFocusElement = null;
        this.state.previousFocusElement = null;
        this.state.keyboardHintVisible = false;
    }

    /**
     * ナビゲーション方向の取得
     */
    getNavigationDirection() {
        if (!this.state.previousFocusElement || !this.state.currentFocusElement) {
            return { icon: '🎯', text: 'フォーカス' };
        }
        
        const prevRect = this.state.previousFocusElement.getBoundingClientRect();
        const currRect = this.state.currentFocusElement.getBoundingClientRect();
        
        const dx = currRect.left - prevRect.left;
        const dy = currRect.top - prevRect.top;
        
        // 主要な方向を判定
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 
                ? { icon: '→', text: '右へ移動' }
                : { icon: '←', text: '左へ移動' };
        } else {
            return dy > 0 
                ? { icon: '↓', text: '下へ移動' }
                : { icon: '↑', text: '上へ移動' };
        }
    }

    /**
     * キーボードモードの状態管理
     */
    setKeyboardMode(enabled) {
        if (enabled) {
            document.body.classList.add(this.cssClasses.keyboardMode);
        } else {
            document.body.classList.remove(this.cssClasses.keyboardMode);
            this.clearFocusState();
        }
    }

    /**
     * フォーカス状態の検証
     */
    validateFocusState() {
        // 現在のフォーカス要素が存在し、DOMに含まれているかチェック
        if (this.state.currentFocusElement && 
            !document.contains(this.state.currentFocusElement)) {
            this.clearFocusState();
            return false;
        }
        
        return true;
    }

    /**
     * レポート生成
     */
    generateStateReport() {
        return {
            currentFocusElement: this.state.currentFocusElement?.tagName || null,
            previousFocusElement: this.state.previousFocusElement?.tagName || null,
            navigationPathLength: this.state.navigationPath.length,
            isHighContrastMode: this.state.isHighContrastMode,
            keyboardMode: document.body.classList.contains(this.cssClasses.keyboardMode),
            keyboardHintVisible: this.state.keyboardHintVisible
        };
    }

    /**
     * リソースの解放
     */
    dispose() {
        // フォーカス状態をクリア
        this.clearFocusState();
        
        // ナビゲーションパスをクリア
        this.state.navigationPath = [];
        
        console.log('FocusStateManager disposed');
    }
}