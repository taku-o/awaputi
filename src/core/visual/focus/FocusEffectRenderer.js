/**
 * Focus Effect Renderer
 * 
 * フォーカス効果描画機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - Focus ring positioning and animation
 * - Focus overlay rendering
 * - Landmark element highlighting
 * - Group indicator management
 * 
 * @module FocusEffectRenderer
 * Created: Phase G.3 (Issue #103)
 */

export class FocusEffectRenderer {
    constructor(mainController) {
        this.mainController = mainController;
        this.config = mainController.config;
        this.state = mainController.state;
        this.elements = mainController.elements;
    }

    /**
     * フォーカスリングの位置調整
     */
    positionFocusRing(element) {
        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        const ring = this.elements.focusRing;
        const offset = this.config.focusRing.offset;
        
        ring.style.left = `${rect.left + scrollX - offset}px`;
        ring.style.top = `${rect.top + scrollY - offset}px`;
        ring.style.width = `${rect.width + offset * 2}px`;
        ring.style.height = `${rect.height + offset * 2}px`;
        
        // アニメーション付きで表示
        ring.classList.add('active');
        
        // 前のタイマーをクリア
        if (this.state.animationTimers.has('focusRing')) {
            clearTimeout(this.state.animationTimers.get('focusRing'));
        }
        
        // 自動非表示タイマー
        const timer = setTimeout(() => {
            ring.classList.remove('active');
        }, this.config.navigationFeedback.fadeTimeout);
        
        this.state.animationTimers.set('focusRing', timer);
    }

    /**
     * フォーカスオーバーレイの更新
     */
    updateFocusOverlay(element) {
        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        const overlay = this.elements.focusOverlay;
        
        overlay.style.left = `${rect.left + scrollX}px`;
        overlay.style.top = `${rect.top + scrollY}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        
        overlay.classList.add('active');
        
        // フェードアウトタイマー
        setTimeout(() => {
            overlay.classList.remove('active');
        }, this.config.focusRing.animationDuration * 3);
    }

    /**
     * ランドマーク要素のハイライト
     */
    highlightLandmarks(element) {
        // 前のハイライトをクリア
        document.querySelectorAll('.visual-focus-landmark.highlighted').forEach(el => {
            el.classList.remove('highlighted');
        });
        
        // ランドマーク要素を検出
        const landmarks = ['main', 'nav', 'aside', 'header', 'footer', 'section', 'article'];
        let current = element;
        
        while (current && current !== document.body) {
            if (landmarks.includes(current.tagName.toLowerCase()) || 
                current.getAttribute('role') && landmarks.includes(current.getAttribute('role'))) {
                current.classList.add('visual-focus-landmark', 'highlighted');
                break;
            }
            current = current.parentElement;
        }
    }

    /**
     * グループインジケータの更新
     */
    updateGroupIndicators(element) {
        // 前のグループインジケータをクリア
        document.querySelectorAll('.visual-focus-group.active').forEach(el => {
            el.classList.remove('active');
        });
        
        // 現在の要素のグループを検出
        const groups = ['form', 'fieldset', 'section', 'nav', 'aside'];
        let current = element.parentElement;
        
        while (current && current !== document.body) {
            if (groups.includes(current.tagName.toLowerCase()) ||
                current.getAttribute('role') === 'group' ||
                current.getAttribute('role') === 'radiogroup') {
                current.classList.add('visual-focus-group', 'active');
                break;
            }
            current = current.parentElement;
        }
    }

    /**
     * すべての視覚エフェクトをクリア
     */
    clearAllEffects() {
        // フォーカスリング
        this.elements.focusRing.classList.remove('active');
        
        // フォーカスオーバーレイ
        this.elements.focusOverlay.classList.remove('active');
        
        // ランドマークハイライト
        document.querySelectorAll('.visual-focus-landmark.highlighted').forEach(el => {
            el.classList.remove('highlighted');
        });
        
        // グループインジケータ
        document.querySelectorAll('.visual-focus-group.active').forEach(el => {
            el.classList.remove('active');
        });
    }

    /**
     * エフェクトのフェードアウト
     */
    fadeOutEffects() {
        const fadeDelay = this.config.navigationFeedback.fadeTimeout;
        
        setTimeout(() => {
            this.clearAllEffects();
        }, fadeDelay);
    }

    /**
     * ウィンドウリサイズ時の位置再計算
     */
    handleWindowResize() {
        // フォーカスリングの位置を再計算
        if (this.state.currentFocusElement && 
            document.body.classList.contains(this.mainController.cssClasses.keyboardMode)) {
            this.positionFocusRing(this.state.currentFocusElement);
        }
    }

    /**
     * カスタムエフェクトの作成
     */
    createCustomEffect(element, effectType = 'pulse') {
        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        const effect = document.createElement('div');
        effect.className = `visual-focus-custom-effect ${effectType}`;
        effect.style.cssText = `
            position: absolute;
            left: ${rect.left + scrollX}px;
            top: ${rect.top + scrollY}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            pointer-events: none;
            z-index: 9998;
        `;
        
        // エフェクトタイプに応じたスタイル
        switch (effectType) {
            case 'pulse':
                effect.style.cssText += `
                    border: 2px solid ${this.config.focusRing.color};
                    border-radius: ${this.config.focusRing.borderRadius}px;
                    animation: custom-pulse 1s ease-in-out;
                `;
                break;
            case 'glow':
                effect.style.cssText += `
                    box-shadow: 0 0 20px ${this.config.focusRing.color};
                    border-radius: ${this.config.focusRing.borderRadius}px;
                    animation: custom-glow 1.5s ease-in-out;
                `;
                break;
        }
        
        document.body.appendChild(effect);
        
        // 自動削除
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 2000);
    }

    /**
     * パフォーマンス最適化のための描画制御
     */
    optimizeRendering() {
        // 要素が画面外にある場合はスキップ
        if (this.state.currentFocusElement) {
            const rect = this.state.currentFocusElement.getBoundingClientRect();
            const viewport = {
                top: 0,
                left: 0,
                bottom: window.innerHeight,
                right: window.innerWidth
            };
            
            // 要素が画面外の場合
            if (rect.bottom < viewport.top || rect.top > viewport.bottom ||
                rect.right < viewport.left || rect.left > viewport.right) {
                return false; // 描画をスキップ
            }
        }
        
        return true; // 描画を実行
    }

    /**
     * アクセシビリティ対応の描画調整
     */
    adjustForAccessibility() {
        // 高コントラストモード対応
        if (this.state.isHighContrastMode) {
            // より太い境界線と明確な色を使用
            this.elements.focusRing.style.borderWidth = this.config.highContrast.width + 'px';
            this.elements.focusRing.style.borderColor = this.config.highContrast.color;
        }
        
        // 縮小モーション設定対応
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // アニメーションを無効化
            this.elements.focusRing.style.animation = 'none';
            this.elements.focusOverlay.style.animation = 'none';
        }
    }

    /**
     * リソースの解放
     */
    dispose() {
        // すべてのエフェクトをクリア
        this.clearAllEffects();
        
        // カスタムエフェクトを削除
        document.querySelectorAll('.visual-focus-custom-effect').forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        
        console.log('FocusEffectRenderer disposed');
    }
}