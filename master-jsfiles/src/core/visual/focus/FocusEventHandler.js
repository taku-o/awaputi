/**
 * Focus Event Handler
 * 
 * フォーカスイベント処理機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - Keyboard event handling
 * - Mouse event handling  
 * - Window resize handling
 * - Navigation feedback preparation
 * 
 * @module FocusEventHandler
 * Created: Phase G.3 (Issue #103)
 */

export class FocusEventHandler {
    constructor(mainController) {
        this.mainController = mainController;
        this.focusManager = mainController.focusManager;
        this.config = mainController.config;
        this.state = mainController.state;
        this.cssClasses = mainController.cssClasses;
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // FocusManagerからのイベント
        if (this.focusManager) {
            this.focusManager.addEventListener('focusChanged', (data) => {
                this.mainController.handleFocusChange(data.element, data.index, data.keyboardMode);
            });
            
            this.focusManager.addEventListener('focusLost', (data) => {
                this.mainController.handleFocusLost(data.element);
            });
        }
        
        // キーボードイベント
        document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
        document.addEventListener('keyup', this.handleKeyUp.bind(this), true);
        
        // マウスイベント
        document.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), true);
        
        // ウィンドウリサイズ
        window.addEventListener('resize', this.handleWindowResize.bind(this));
        
        // アクセシビリティマネージャーからの設定変更
        if (this.mainController.accessibilityManager) {
            this.mainController.accessibilityManager.addEventListener('configurationApplied', (data) => {
                this.mainController.applyConfig(data.config);
            });
        }
        
        console.log('Focus event listeners set up');
    }

    /**
     * キーダウン処理
     */
    handleKeyDown(event) {
        // キーボードモードの有効化
        this.mainController.focusStateManager.setKeyboardMode(true);
        
        // ヘルプキーの処理
        if (event.key === 'F1' || (event.altKey && event.key === '?')) {
            event.preventDefault();
            this.mainController.focusAccessibilitySupport.toggleKeyboardHints();
        }
        
        // ナビゲーション方向の表示
        if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            this.prepareNavigationFeedback(event.key, event.shiftKey);
        }
        
        // ショートカットキーの処理
        this.handleShortcutKeys(event);
    }

    /**
     * キーアップ処理
     */
    handleKeyUp(event) {
        // 特別な処理は不要（キーダウンで十分）
    }

    /**
     * マウスダウン処理
     */
    handleMouseDown(event) {
        // キーボードモードの無効化
        this.mainController.focusStateManager.setKeyboardMode(false);
        
        // 視覚的フィードバックを非表示
        this.mainController.focusEffectRenderer.clearAllEffects();
        this.mainController.focusAccessibilitySupport.hideKeyboardHints();
    }

    /**
     * マウス移動処理
     */
    handleMouseMove(event) {
        // マウス使用時はキーボードヒントを非表示
        if (this.state.keyboardHintVisible) {
            this.mainController.focusAccessibilitySupport.hideKeyboardHints();
        }
    }

    /**
     * ウィンドウリサイズ処理
     */
    handleWindowResize() {
        // フォーカスエフェクトの位置再調整
        this.mainController.focusEffectRenderer.handleWindowResize();
    }

    /**
     * ショートカットキーの処理
     */
    handleShortcutKeys(event) {
        // Escape キー - すべての視覚フィードバックをクリア
        if (event.key === 'Escape') {
            this.mainController.focusEffectRenderer.clearAllEffects();
            this.mainController.focusAccessibilitySupport.hideKeyboardHints();
            return;
        }
        
        // Ctrl+H - ヘルプ表示
        if (event.ctrlKey && event.key === 'h') {
            event.preventDefault();
            this.mainController.focusAccessibilitySupport.toggleKeyboardHints();
            return;
        }
        
        // Alt+C - 高コントラストモード切り替え
        if (event.altKey && event.key === 'c') {
            event.preventDefault();
            const isEnabled = !this.state.isHighContrastMode;
            this.mainController.focusStateManager.setHighContrastMode(isEnabled);
            return;
        }
        
        // Alt+F - フォーカス表示の切り替え
        if (event.altKey && event.key === 'f') {
            event.preventDefault();
            this.config.focusRing.enabled = !this.config.focusRing.enabled;
            console.log(`Focus ring ${this.config.focusRing.enabled ? 'enabled' : 'disabled'}`);
            return;
        }
    }

    /**
     * ナビゲーションフィードバックの準備
     */
    prepareNavigationFeedback(key, shiftKey) {
        const directionMap = {
            'Tab': shiftKey ? '←前へ' : '次へ→',
            'ArrowUp': '↑上へ',
            'ArrowDown': '↓下へ',
            'ArrowLeft': '←左へ',
            'ArrowRight': '→右へ'
        };
        
        const direction = directionMap[key];
        if (direction) {
            // 一時的な方向表示
            this.showTemporaryDirectionIndicator(direction);
        }
    }

    /**
     * 一時的な方向インジケータ表示
     */
    showTemporaryDirectionIndicator(direction) {
        const indicator = this.mainController.elements.navigationIndicator;
        const directionElement = indicator.querySelector('.direction');
        const statusElement = indicator.querySelector('.status');
        
        directionElement.textContent = direction;
        statusElement.textContent = 'ナビゲーション中...';
        
        indicator.classList.add('visible');
        
        // 短時間で非表示
        setTimeout(() => {
            indicator.classList.remove('visible');
        }, 1000);
    }

    /**
     * フォーカス変更の検証
     */
    validateFocusChange(element) {
        // 要素が存在し、DOMに含まれているかチェック
        if (!element || !document.contains(element)) {
            console.warn('Invalid focus element detected');
            return false;
        }
        
        // 要素が表示されているかチェック
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
            console.warn('Hidden element received focus');
            return false;
        }
        
        return true;
    }

    /**
     * アクセシビリティ対応のイベント処理
     */
    handleAccessibilityEvents(event) {
        // スクリーンリーダー使用時の特別な処理
        if (this.mainController.accessibilityManager?.isScreenReaderActive()) {
            // フォーカス変更時により詳細な情報を提供
            if (event.type === 'focusin') {
                this.announceElementDetails(event.target);
            }
        }
        
        // 高コントラストモード時の処理
        if (this.state.isHighContrastMode) {
            // より目立つフィードバックを提供
            if (['keydown', 'focusin'].includes(event.type)) {
                this.mainController.focusEffectRenderer.adjustForAccessibility();
            }
        }
    }

    /**
     * 要素詳細のアナウンス
     */
    announceElementDetails(element) {
        const details = this.getElementAccessibilityInfo(element);
        if (details) {
            // aria-live要素を使用してスクリーンリーダーに通知
            const announcement = document.getElementById('focus-announcement');
            if (announcement) {
                announcement.textContent = details;
            }
        }
    }

    /**
     * 要素のアクセシビリティ情報取得
     */
    getElementAccessibilityInfo(element) {
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        const label = element.getAttribute('aria-label') || 
                     element.getAttribute('title') || 
                     element.textContent?.trim();
        
        let info = `${role || tagName}`;
        if (label) {
            info += `: ${label}`;
        }
        
        // 追加情報
        if (element.hasAttribute('aria-expanded')) {
            const expanded = element.getAttribute('aria-expanded') === 'true';
            info += `, ${expanded ? '展開済み' : '折りたたみ済み'}`;
        }
        
        if (element.hasAttribute('aria-selected')) {
            const selected = element.getAttribute('aria-selected') === 'true';
            info += `, ${selected ? '選択済み' : '未選択'}`;
        }
        
        return info;
    }

    /**
     * イベントリスナーの削除
     */
    removeEventListeners() {
        document.removeEventListener('keydown', this.handleKeyDown.bind(this), true);
        document.removeEventListener('keyup', this.handleKeyUp.bind(this), true);
        document.removeEventListener('mousedown', this.handleMouseDown.bind(this), true);
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this), true);
        window.removeEventListener('resize', this.handleWindowResize.bind(this));
    }

    /**
     * リソースの解放
     */
    dispose() {
        // イベントリスナーを削除
        this.removeEventListeners();
        
        console.log('FocusEventHandler disposed');
    }
}