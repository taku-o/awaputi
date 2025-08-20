import { getErrorHandler } from '../utils/ErrorHandler.js';''
import { FocusStateManager } from './visual/focus/FocusStateManager.js';''
import { FocusEffectRenderer } from './visual/focus/FocusEffectRenderer.js';''
import { FocusEventHandler } from './visual/focus/FocusEventHandler.js';''
import { FocusAccessibilitySupport } from './visual/focus/FocusAccessibilitySupport.js';

/**
 * 視覚的フォーカス管理クラス - Main Controller Pattern実装
 * ハイコントラスト対応のフォーカス表示とキーボードナビゲーションフィードバックを提供
 * 
 * **Architecture**: Main Controller Pattern
 * - **FocusStateManager**: フォーカス状態管理・システム設定適用
 * - **FocusEffectRenderer**: フォーカス効果描画・ビジュアルエフェクト
 * - **FocusEventHandler**: イベント処理・ショートカット・入力制御
 * - **FocusAccessibilitySupport**: アクセシビリティサポート・キーボードヒント
 * 
 * **Features**:
 * - Visual focus ring with customizable styles
 * - High contrast mode support
 * - Keyboard navigation feedback
 * - Accessibility compliance (WCAG 2.1 AA)
 * 
 * **Usage Examples**:
 * ```javascript
 * const visualFocusManager = new VisualFocusManager(accessibilityManager, focusManager);
 * visualFocusManager.handleFocusChange(element, index, keyboardMode);
 * visualFocusManager.setHighContrastMode(true);
 * ```
 * 
 * @class VisualFocusManager
 * @version 2.0.0 (Phase G.3 - Main Controller Pattern)
 * @since Original implementation - Enhanced with component architecture
 */
export class VisualFocusManager {'
    '';
    constructor(accessibilityManager, focusManager') {
        this.accessibilityManager = accessibilityManager;
        this.focusManager = focusManager;
        this.gameEngine = accessibilityManager.gameEngine;
        
        // 視覚フィードバック設定
        this.config = {
            focusRing: {
                enabled: true,';
                width: 3,'';
                color: '#4A90E2',
                offset: 2,
                borderRadius: 4,
                animationDuration: 200,
                pulseAnimation: true,
    }
    }
                customShadow: true }
            },
            highContrast: { enabled: false,'
                width: 4,'';
                color: '#FFFF00','';
                backgroundColor: '#000000','';
                textColor: '#FFFFFF','';
                shadowColor: '#000000' }
            },
            navigationFeedback: { enabled: true,
                showDirection: true,
                showPosition: true,
                fadeTimeout: 2000,
                animationSpeed: 300 }
            },
            keyboardHints: { enabled: true,
                showOnFocus: true,
                autoHide: true,';
                hideDelay: 3000,'';
                position: 'bottom-right' }
            },
            visualCues: { breadcrumbs: true,
                pathHighlight: true,
                groupIndicators: true,
                landmarkHighlight: true }
            }
        },
        
        // 状態管理
        this.state = { currentFocusElement: null,
            previousFocusElement: null,
            navigationPath: [],';
            activeVisualCues: new Set(),'';
            animationTimers: new Map(''';
            focusVisible: 'visual-focus-visible','';
            highContrast: 'visual-focus-high-contrast','';
            navigationActive: 'visual-focus-navigation-active','';
            keyboardMode: 'visual-focus-keyboard-mode','';
            animating: 'visual-focus-animating' })
        })
        // Main Controller Pattern: サブコンポーネント管理
        this.focusStateManager = new FocusStateManager(this);
        this.focusEffectRenderer = new FocusEffectRenderer(this);'
        this.focusEventHandler = new FocusEventHandler(this);''
        this.focusAccessibilitySupport = new FocusAccessibilitySupport(this');'
        '';
        console.log('VisualFocusManager initialized with component architecture');
        this.initialize();
    }
    
    /**
     * 初期化（Main Controller Pattern）
     */
    initialize() {
        try {
            // CSS スタイルの設定
            this.setupVisualStyles();
            
            // DOM 要素の作成
            this.createVisualElements();
            
            // イベントリスナーの設定
            this.focusEventHandler.setupEventListeners();
            ';
            // システム設定の検出と適用''
            this.focusStateManager.detectAndApplySystemSettings('');
    }'
            console.log('VisualFocusManager initialized successfully'); }'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'VISUAL_FOCUS_ERROR', {')'
                operation: 'initialize'); }
            });
        }
    }
    
    /**
     * 視覚的スタイルの設定'
     */''
    setupVisualStyles(''';
        const styleId = 'visual-focus-manager-styles';
        
        // 既存のスタイルを削除)
        const existingStyle = document.getElementById(styleId);
        if(existingStyle) {'
            '';
            existingStyle.remove('')';
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = this.generateVisualCSS();'
        '';
        document.head.appendChild(style');'
        }'
        console.log('Visual focus styles applied'); }
    }
    
    /**
     * 視覚的CSS生成
     */
    generateVisualCSS() {
        
    }
        const { focusRing, highContrast, navigationFeedback } = this.config;
        
        return `;
            /* フォーカスリングの基本スタイル */
            .${this.cssClasses.focusVisible} { position: relative, }
                outline: ${focusRing.width}px solid ${focusRing.color} !important,
                outline-offset: ${focusRing.offset}px !important;'
                border-radius: ${focusRing.borderRadius}px !important;''
                ${focusRing.customShadow ? `box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.3), 0 0 8px rgba(74, 144, 226, 0.2'}) !important;` : ''}''
                ${focusRing.pulseAnimation ? `animation: focus-pulse ${focusRing.animationDuration * 2}ms ease-in-out infinite alternate;` : ''}
                transition: all ${focusRing.animationDuration}ms ease-out !important,
                z-index: 1000,
            }
            
            /* フォーカス中のパルスアニメーション */
            @keyframes focus-pulse { 0% {  }
                    outline-color: ${focusRing.color}
                    box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.3), 0 0 8px rgba(74, 144, 226, 0.2);
                }
                100% { 
                    outline-color: ${focusRing.color}dd;
                    box-shadow: 0 0 0 6px rgba(74, 144, 226, 0.4), 0 0 12px rgba(74, 144, 226, 0.3);
                }
            }
            
            /* ハイコントラストモード */
            .${this.cssClasses.highContrast} .${this.cssClasses.focusVisible},
            body.high-contrast .${this.cssClasses.focusVisible} {
                outline: ${highContrast.width}px solid ${highContrast.color} !important,
                background-color: ${highContrast.backgroundColor} !important;
                color: ${highContrast.textColor} !important,
                box-shadow: 0 0 0 2px ${highContrast.shadowColor}, 0 0 4px ${highContrast.shadowColor} !important;
                animation: none !important,
            }
            
            /* キーボードモード専用表示 */
            body:not(.${this.cssClasses.keyboardMode)}) .${this.cssClasses.focusVisible} { outline: none !important,
                box-shadow: none !important,
                animation: none !important; }
            }
            
            /* フォーカスリング要素 */
            .visual-focus-ring { position: absolute,
                pointer-events: none,
                z-index: 9999, }
                border: ${focusRing.width}px solid ${focusRing.color}'
                border-radius: ${focusRing.borderRadius}px;''
                ${focusRing.customShadow ? `box-shadow: 0 0 8px rgba(74, 144, 226, 0.3'});` : ''}
                transition: all ${focusRing.animationDuration}ms ease-out,
                opacity: 0,
            }
            
            .visual-focus-ring.active { opacity: 1; }
            }
            
            /* ナビゲーションインジケータ */
            .visual-focus-navigation { position: fixed,
                top: 20px,
                right: 20px,
                background: rgba(0, 0, 0, 0.8),
                color: white,
                padding: 12px 16px,
                border-radius: 8px,
                font-size: 14px,
                font-weight: 500,
                z-index: 10000,
                pointer-events: none,
                opacity: 0, }
                transform: translateY(-10px},)
                transition: all ${navigationFeedback.animationSpeed}ms ease-out)
                backdrop-filter: blur(8px),
                border: 1px solid rgba(255, 255, 255, 0.1),
            }
            
            .visual-focus-navigation.visible { opacity: 1,
                transform: translateY(0); }
            }
            
            /* キーボードヒント */
            .visual-focus-keyboard-hint { position: fixed,
                bottom: 20px,
                right: 20px,
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%),
                color: white,
                padding: 16px 20px,
                border-radius: 12px,
                font-size: 13px,
                line-height: 1.4,
                z-index: 10000,
                pointer-events: none,
                opacity: 0, }
                transform: translateY(20px})
                transition: all ${ navigationFeedback.animationSpeed)ms ease-out,
                max-width: 300px, }
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3});
            }
            
            .visual-focus-keyboard-hint.visible { opacity: 1,
                transform: translateY(0); }
            }
            
            /* パンくずリスト */
            .visual-focus-breadcrumb { position: fixed,
                top: 20px,
                left: 20px,
                background: rgba(255, 255, 255, 0.95),
                color: #333,
                padding: 8px 12px,
                border-radius: 6px,
                font-size: 12px,
                z-index: 10000,
                pointer-events: none,
                opacity: 0, }
                transform: translateY(-10px},)
                transition: all ${navigationFeedback.animationSpeed}ms ease-out)
                backdrop-filter: blur(4px),
                border: 1px solid rgba(0, 0, 0, 0.1),
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .visual-focus-breadcrumb.visible { opacity: 1,
                transform: translateY(0); }
            }
            
            /* フォーカスオーバーレイ */
            .visual-focus-overlay { position: absolute,
                pointer-events: none,
                z-index: 999,
                background: linear-gradient(45deg, transparent 49%, rgba(74, 144, 226, 0.1) 50%, rgba(74, 144, 226, 0.1) 51%, transparent 52%),
                opacity: 0, }
                transition: opacity ${focusRing.animationDuration}ms ease-out,
            }
            
            .visual-focus-overlay.active { opacity: 1; }
            }
            
            /* レスポンシブ対応 */
            @media (max-width: 768px) { .visual-focus-navigation,
                .visual-focus-keyboard-hint {
                    position: fixed,
                    bottom: 10px,
                    left: 10px,
                    right: 10px,
                    top: auto,
                    max-width: none, }
                }
                
                .visual-focus-breadcrumb { top: 10px,
                    left: 10px,
                    right: 10px; }
                }
            }
            
            /* Reduced motion 対応 */
            @media (prefers-reduced-motion: reduce) {
                .${this.cssClasses.focusVisible},
                .visual-focus-ring,
                .visual-focus-navigation,
                .visual-focus-keyboard-hint,
                .visual-focus-breadcrumb,
                .visual-focus-overlay { animation: none !important,
                    transition: none !important; }
                }
            }
        `;
    }
    
    /**
     * 視覚要素の作成'
     */''
    createVisualElements('')';
        this.elements.focusRing = document.createElement('div'');''
        this.elements.focusRing.className = 'visual-focus-ring';''
        this.elements.focusRing.setAttribute('aria-hidden', 'true');''
        document.body.appendChild(this.elements.focusRing');
        ';
        // ナビゲーションインジケータ''
        this.elements.navigationIndicator = document.createElement('div'');''
        this.elements.navigationIndicator.className = 'visual-focus-navigation';''
        this.elements.navigationIndicator.setAttribute('aria-hidden', 'true'');'
        this.elements.navigationIndicator.innerHTML = `'';
            <div class="direction"></div>"";
            <div class="status"></div>"";
            <div class="position"></div>";
        `;""
        document.body.appendChild(this.elements.navigationIndicator");
        ";
        // キーボードヒント""
        this.elements.keyboardHint = document.createElement('div'');''
        this.elements.keyboardHint.className = 'visual-focus-keyboard-hint';''
        this.elements.keyboardHint.setAttribute('aria-hidden', 'true'');'
        this.elements.keyboardHint.innerHTML = `'';
            <div class="title">キーボードショートカット</div>"";
            <div class="shortcuts"></div>";
        `;""
        document.body.appendChild(this.elements.keyboardHint");
        ";
        // パンくずリスト""
        this.elements.breadcrumbTrail = document.createElement('div'');''
        this.elements.breadcrumbTrail.className = 'visual-focus-breadcrumb';''
        this.elements.breadcrumbTrail.setAttribute('aria-hidden', 'true'');''
        this.elements.breadcrumbTrail.innerHTML = `<div class="path"></div>`;""
        document.body.appendChild(this.elements.breadcrumbTrail");
        ";
        // フォーカスオーバーレイ""
        this.elements.focusOverlay = document.createElement('div'');''
        this.elements.focusOverlay.className = 'visual-focus-overlay';''
        this.elements.focusOverlay.setAttribute('aria-hidden', 'true');''
        document.body.appendChild(this.elements.focusOverlay');'
        '';
        console.log('Visual focus elements created');
    }
    
    // Delegated methods to components
    
    /**
     * フォーカス変更の処理（FocusStateManagerへ委託）
     */
    handleFocusChange(element, index, keyboardMode) {
        if (!element) return;
        
        try {
            // 前の状態を保存
            this.state.previousFocusElement = this.state.currentFocusElement;
            this.state.currentFocusElement = element;
            
            // キーボードモードの設定
            if (keyboardMode) {
                this.focusStateManager.setKeyboardMode(true);
                
                // 視覚的フォーカス表示の更新
                this.focusStateManager.updateFocusVisuals(element, index);
                
                // ナビゲーションフィードバックの表示
                this.focusAccessibilitySupport.showNavigationFeedback(element, index);
                
                // キーボードヒントの表示（必要に応じて）
                if (this.config.keyboardHints.showOnFocus) {
    }
                    this.focusAccessibilitySupport.showKeyboardHints(element); }
                }
                
                // パンくずリストの更新
                if (this.config.visualCues.breadcrumbs) { this.focusAccessibilitySupport.updateBreadcrumbTrail(element); }
                }
            } else { this.focusStateManager.setKeyboardMode(false); }
            }
            
            // ナビゲーションパスの更新
            this.focusStateManager.updateNavigationPath(element);
            ';
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'VISUAL_FOCUS_ERROR', {')'
                operation: 'handleFocusChange',);
                element: element.tagName); }
            });
        }
    }
    
    /**
     * フォーカス失去の処理（FocusEffectRendererへ委託）
     */
    handleFocusLost(element) { this.focusEffectRenderer.fadeOutEffects(); }
    }
    
    /**
     * ハイコントラストモードの設定（FocusStateManagerへ委託）
     */
    setHighContrastMode(enabled) { return this.focusStateManager.setHighContrastMode(enabled); }
    }

    /**
     * フォーカス要素の設定
     * @param {string} elementId - 要素ID
     * @param {Object} bounds - 要素の境界 {x, y, width, height}
     */
    setFocusedElement(elementId, bounds) {
        this.currentFocusedElement = {
            id: elementId,
            bounds: bounds,
    }
            timestamp: Date.now(); }
        };
        this.handleFocusChange();
    }

    /**
     * フォーカス表示のレンダリング
     * @param {CanvasRenderingContext2D} context - レンダリングコンテキスト
     */
    render(context) {
        if (!this.currentFocusedElement || !context) return;
    }
 }
        const { bounds } = this.currentFocusedElement;'
        '';
        context.save(''';
        context.strokeStyle = this.config? .focusColor || '#0066cc';)
        context.lineWidth = 2;)
        context.setLineDash([5, 5]);
        
        context.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        context.restore();
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.visual) {
            // ハイコントラスト設定
            if (config.visual.highContrast) {
    }
                this.setHighContrastMode(config.visual.highContrast.enabled); }
            }
            
            // 視覚設定の更新
            if(config.visual.motion) {'
                '';
                if (config.visual.motion.reduced') {'
            }'
                    document.body.classList.add('reduced-motion''); }'
                } else {  ' }'
                    document.body.classList.remove('reduced-motion'); }
                }
            }
        }
        
        // 設定の反映
        if(config.keyboard) {'
            ';
        }'
            Object.assign(this.config.keyboardHints, config.keyboard'); }
        }'
        '';
        console.log('VisualFocusManager configuration applied');
    }
    
    /**
     * レポート生成
     */
    generateReport() {
        return { : undefined
            isActive: document.body.classList.contains(this.cssClasses.keyboardMode),
            highContrastMode: this.state.isHighContrastMode,
            currentFocusElement: this.state.currentFocusElement? .tagName || null, : undefined;
            navigationPathLength: this.state.navigationPath.length,
            activeVisualCues: this.state.activeVisualCues.size,
            keyboardHintVisible: this.state.keyboardHintVisible,
            activeTimers: this.state.animationTimers.size,
    }
            stateReport: this.focusStateManager.generateStateReport(), };
            accessibilityReport: this.focusAccessibilitySupport.generateAccessibilityReport(); }
        };
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        this.config.focusRing.enabled = enabled;
        this.config.navigationFeedback.enabled = enabled;
        this.config.keyboardHints.enabled = enabled;
        
        if (!enabled) {'
            this.focusEffectRenderer.clearAllEffects();'
    }'
            this.focusAccessibilitySupport.hideKeyboardHints('') }'
        console.log(`VisualFocusManager ${enabled ? 'enabled' : 'disabled')`});
    }
    
    /**
     * フォーカススタイルの更新
     * @param {Object} style - スタイル設定オブジェクト
     */
    updateStyle(style = { ) {
        // スタイル設定を更新
        if (style.color) {
    }
            this.config.focusRing.color = style.color; }
        }
        if (style.width) { this.config.focusRing.width = style.width; }
        }
        if (style.offset !== undefined) { this.config.focusRing.offset = style.offset; }
        }
        if (style.borderRadius !== undefined) { this.config.focusRing.borderRadius = style.borderRadius; }
        }
        
        // CSSスタイルを再生成して適用
        this.setupVisualStyles();
        
        // 現在のフォーカスがある場合は再描画
        if(this.state.currentFocusElement && this.focusEffectRenderer) {'
            ';
        }'
            this.focusEffectRenderer.render(this.state.currentFocusElement'); }
        }'
        '';
        console.log('Visual focus style updated:', style);
    }
    
    /**
     * キー押下の処理
     * @param {string} key - 押されたキー
     */
    handleKeyPress(key) {
        // イベントハンドラーに委譲'
        if (this.focusEventHandler) {'
    }'
            this.focusEventHandler.handleKeyPress(key'); }
        }'
        '';
        console.log('Visual focus key press handled:', key);
    }
    
    /**
     * クリーンアップ（Main Controller Pattern）'
     */''
    destroy('')';
        console.log('Destroying VisualFocusManager...');
        
        // コンポーネントの解放
        if (this.focusStateManager) { this.focusStateManager.dispose(); }
        }
        
        if (this.focusEffectRenderer) { this.focusEffectRenderer.dispose(); }
        }
        
        if (this.focusEventHandler) { this.focusEventHandler.dispose(); }
        }
        
        if (this.focusAccessibilitySupport) { this.focusAccessibilitySupport.dispose(); }
        }
        
        // タイマーのクリア
        this.state.animationTimers.forEach(timer => clearTimeout(timer);
        this.state.animationTimers.clear();
        
        // DOM要素の削除
        Object.values(this.elements).forEach(element => {  );
            if (element && element.parentNode) { }
                element.parentNode.removeChild(element); }'
            }''
        }');
        ';
        // スタイル要素の削除''
        const styleElement = document.getElementById('visual-focus-manager-styles');
        if (styleElement) { styleElement.remove(); }
        }
        
        // CSSクラスの削除
        document.body.classList.remove(;
            this.cssClasses.keyboardMode,);
            this.cssClasses.highContrast);
        
        // 全てのフォーカス関連クラスを削除
        document.querySelectorAll(`.${ this.cssClasses.focusVisible)`).forEach(el => {); }'
            el.classList.remove(this.cssClasses.focusVisible});''
        }');'
        '';
        document.querySelectorAll('.visual-focus-landmark').forEach(el => {  ');' }'
            el.classList.remove('visual-focus-landmark', 'highlighted');' }'
        }');'
        '';
        document.querySelectorAll('.visual-focus-group').forEach(el => {  ');' }'
            el.classList.remove('visual-focus-group', 'active'); }
        });
        
        // データのクリア'
        this.state.navigationPath = [];''
        this.state.activeVisualCues.clear('')';
        console.log('VisualFocusManager destroyed with component architecture'');'
    }''
}