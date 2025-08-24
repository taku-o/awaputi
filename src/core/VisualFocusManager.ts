import { getErrorHandler } from '../utils/ErrorHandler.js';
import { FocusStateManager } from './visual/focus/FocusStateManager.js';
import { FocusEffectRenderer } from './visual/focus/FocusEffectRenderer.js';
import { FocusEventHandler } from './visual/focus/FocusEventHandler.js';
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
export class VisualFocusManager {
    private accessibilityManager: any;
    private focusManager: any;
    private gameEngine: any;
    private config: any;
    private state: any;
    private focusStateManager: FocusStateManager;
    private focusEffectRenderer: FocusEffectRenderer;
    private focusEventHandler: FocusEventHandler;
    private focusAccessibilitySupport: FocusAccessibilitySupport;

    constructor(accessibilityManager: any, focusManager: any) {
        this.accessibilityManager = accessibilityManager;
        this.focusManager = focusManager;
        this.gameEngine = accessibilityManager.gameEngine;
        
        // 視覚フィードバック設定
        this.config = {
            focusRing: {
                enabled: true,
                width: 3,
                color: '#4A90E2',
                offset: 2,
                borderRadius: 4,
                animationDuration: 200,
                pulseAnimation: true,
                customShadow: true
            },
            highContrast: {
                enabled: false,
                width: 4,
                color: '#FFFF00',
                backgroundColor: '#000000',
                textColor: '#FFFFFF',
                shadowColor: '#000000'
            },
            navigationFeedback: {
                enabled: true,
                showDirection: true,
                showPosition: true,
                fadeTimeout: 2000,
                animationSpeed: 300
            },
            keyboardHints: {
                enabled: true,
                showOnFocus: true,
                autoHide: true,
                hideDelay: 3000,
                position: 'bottom-right'
            },
            visualCues: {
                breadcrumbs: true,
                pathHighlight: true,
                groupIndicators: true,
                landmarkHighlight: true
            }
        };
        
        // 状態管理
        this.state = {
            currentFocusElement: null,
            previousFocusElement: null,
            navigationPath: [],
            activeVisualCues: new Set(),
            animationTimers: new Map(),
            cssClasses: {
                focusVisible: 'visual-focus-visible',
                highContrast: 'visual-focus-high-contrast',
                navigationActive: 'visual-focus-navigation-active',
                keyboardMode: 'visual-focus-keyboard-mode',
                animating: 'visual-focus-animating'
            }
        };
        
        // Main Controller Pattern: サブコンポーネント管理
        this.focusStateManager = new FocusStateManager(this);
        this.focusEffectRenderer = new FocusEffectRenderer(this);
        this.focusEventHandler = new FocusEventHandler(this);
        this.focusAccessibilitySupport = new FocusAccessibilitySupport(this);

        console.log('VisualFocusManager initialized with component architecture');
        this.initialize();
    }
    
    /**
     * 初期化（Main Controller Pattern）
     */
    initialize(): void {
        try {
            // 依存コンポーネントの初期化
            this.focusStateManager.initialize();
            this.focusEffectRenderer.initialize();
            this.focusEventHandler.initialize();
            this.focusAccessibilitySupport.initialize();

            // システム設定の適用
            this.applySystemSettings();
            
            console.log('VisualFocusManager: 初期化完了');
        } catch (error) {
            getErrorHandler().handleError(error, 'VISUAL_FOCUS_MANAGER_INIT_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * システム設定の適用（State Managerに委任）
     */
    applySystemSettings(): void {
        this.focusStateManager.applySystemSettings();
    }
    
    /**
     * フォーカス変更の処理（メインAPI）
     */
    handleFocusChange(element: HTMLElement, index?: number, keyboardMode?: boolean): void {
        try {
            // 状態管理の更新
            this.focusStateManager.updateFocusState(element, index, keyboardMode);
            
            // 視覚エフェクトの適用
            this.focusEffectRenderer.renderFocusEffect(element, index, keyboardMode);
            
            // アクセシビリティサポートの適用
            this.focusAccessibilitySupport.provideFocusSupport(element, index, keyboardMode);
            
            // イベントハンドリング
            this.focusEventHandler.handleFocusEvent(element, index, keyboardMode);
            
            console.log('VisualFocusManager: フォーカス変更処理完了', { element, index, keyboardMode });
        } catch (error) {
            getErrorHandler().handleError(error, 'VISUAL_FOCUS_CHANGE_ERROR', {
                operation: 'handleFocusChange',
                element: element?.tagName,
                index,
                keyboardMode
            });
        }
    }
    
    /**
     * ハイコントラストモードの設定（State Managerに委任）
     */
    setHighContrastMode(enabled: boolean): void {
        this.focusStateManager.setHighContrastMode(enabled);
    }
    
    /**
     * フォーカスリングの表示（Effect Rendererに委任）
     */
    showFocusRing(element: HTMLElement): void {
        this.focusEffectRenderer.showFocusRing(element);
    }
    
    /**
     * フォーカスリングの非表示（Effect Rendererに委任）
     */
    hideFocusRing(element?: HTMLElement): void {
        this.focusEffectRenderer.hideFocusRing(element);
    }
    
    /**
     * ナビゲーションフィードバックの表示（Effect Rendererに委任）
     */
    showNavigationFeedback(direction: string, position?: { x: number; y: number }): void {
        this.focusEffectRenderer.showNavigationFeedback(direction, position);
    }
    
    /**
     * キーボードヒントの表示（Accessibility Supportに委任）
     */
    showKeyboardHints(element: HTMLElement): void {
        this.focusAccessibilitySupport.showKeyboardHints(element);
    }
    
    /**
     * キーボードヒントの非表示（Accessibility Supportに委任）
     */
    hideKeyboardHints(): void {
        this.focusAccessibilitySupport.hideKeyboardHints();
    }
    
    /**
     * ビジュアルキューの追加（Effect Rendererに委任）
     */
    addVisualCue(type: string, element: HTMLElement, options?: any): void {
        this.focusEffectRenderer.addVisualCue(type, element, options);
    }
    
    /**
     * ビジュアルキューの削除（Effect Rendererに委任）
     */
    removeVisualCue(type: string, element?: HTMLElement): void {
        this.focusEffectRenderer.removeVisualCue(type, element);
    }
    
    /**
     * フォーカスパスの更新（State Managerに委任）
     */
    updateFocusPath(path: any[]): void {
        this.focusStateManager.updateFocusPath(path);
    }
    
    /**
     * アニメーション開始（Effect Rendererに委任）
     */
    startAnimation(type: string, element: HTMLElement, options?: any): void {
        this.focusEffectRenderer.startAnimation(type, element, options);
    }
    
    /**
     * アニメーション停止（Effect Rendererに委任）
     */
    stopAnimation(type: string, element?: HTMLElement): void {
        this.focusEffectRenderer.stopAnimation(type, element);
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig: any): void {
        try {
            // 設定のマージ
            this.config = { ...this.config, ...newConfig };
            
            // 各コンポーネントに設定を通知
            this.focusStateManager.updateConfig(this.config);
            this.focusEffectRenderer.updateConfig(this.config);
            this.focusEventHandler.updateConfig(this.config);
            this.focusAccessibilitySupport.updateConfig(this.config);
            
            console.log('VisualFocusManager: 設定更新完了', this.config);
        } catch (error) {
            getErrorHandler().handleError(error, 'VISUAL_FOCUS_CONFIG_UPDATE_ERROR', {
                operation: 'updateConfig',
                newConfig
            });
        }
    }
    
    /**
     * 現在の状態取得
     */
    getState(): any {
        return { ...this.state };
    }
    
    /**
     * 現在の設定取得
     */
    getConfig(): any {
        return { ...this.config };
    }
    
    /**
     * 統計情報の取得
     */
    getStatistics(): any {
        return {
            focusStateManager: this.focusStateManager.getStatistics(),
            focusEffectRenderer: this.focusEffectRenderer.getStatistics(),
            focusEventHandler: this.focusEventHandler.getStatistics(),
            focusAccessibilitySupport: this.focusAccessibilitySupport.getStatistics()
        };
    }
    
    /**
     * レポート生成
     */
    generateReport(): any {
        return {
            timestamp: new Date().toISOString(),
            configuration: this.getConfig(),
            state: this.getState(),
            statistics: this.getStatistics(),
            componentStatus: {
                focusStateManager: this.focusStateManager.isInitialized(),
                focusEffectRenderer: this.focusEffectRenderer.isInitialized(),
                focusEventHandler: this.focusEventHandler.isInitialized(),
                focusAccessibilitySupport: this.focusAccessibilitySupport.isInitialized()
            }
        };
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled: boolean): void {
        try {
            this.config.focusRing.enabled = enabled;
            
            if (enabled) {
                this.initialize();
            } else {
                this.disable();
            }
            
            console.log(`VisualFocusManager ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            getErrorHandler().handleError(error, 'VISUAL_FOCUS_ENABLE_ERROR', {
                operation: 'setEnabled',
                enabled
            });
        }
    }
    
    /**
     * 無効化
     */
    disable(): void {
        try {
            // すべてのビジュアルエフェクトを停止
            this.focusEffectRenderer.clearAllEffects();
            
            // イベントリスナーを削除
            this.focusEventHandler.removeEventListeners();
            
            // アクセシビリティサポートを停止
            this.focusAccessibilitySupport.disable();
            
            console.log('VisualFocusManager: 無効化完了');
        } catch (error) {
            getErrorHandler().handleError(error, 'VISUAL_FOCUS_DISABLE_ERROR', {
                operation: 'disable'
            });
        }
    }
    
    /**
     * クリーンアップ（Main Controller Pattern）
     */
    destroy(): void {
        try {
            console.log('VisualFocusManager: クリーンアップ開始');
            
            // 無効化
            this.disable();
            
            // サブコンポーネントのクリーンアップ
            this.focusStateManager?.destroy();
            this.focusEffectRenderer?.destroy();
            this.focusEventHandler?.destroy();
            this.focusAccessibilitySupport?.destroy();
            
            // 状態とタイマーのクリア
            this.state.activeVisualCues.clear();
            this.state.animationTimers.forEach((timer: number) => clearTimeout(timer));
            this.state.animationTimers.clear();
            this.state.navigationPath = [];
            
            console.log('VisualFocusManager: クリーンアップ完了');
        } catch (error) {
            getErrorHandler().handleError(error, 'VISUAL_FOCUS_DESTROY_ERROR', {
                operation: 'destroy'
            });
        }
    }
}