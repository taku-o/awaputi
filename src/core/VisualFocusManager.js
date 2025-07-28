import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * 視覚的フォーカス管理クラス
 * ハイコントラスト対応のフォーカス表示とキーボードナビゲーションフィードバックを提供
 */
export class VisualFocusManager {
    constructor(accessibilityManager, focusManager) {
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
            keyboardHintVisible: false,
            isHighContrastMode: false
        };
        
        // DOM要素管理
        this.elements = {
            focusRing: null,
            navigationIndicator: null,
            keyboardHint: null,
            breadcrumbTrail: null,
            focusOverlay: null
        };
        
        // CSSクラス管理
        this.cssClasses = {
            focusVisible: 'visual-focus-visible',
            highContrast: 'visual-focus-high-contrast',
            navigationActive: 'visual-focus-navigation-active',
            keyboardMode: 'visual-focus-keyboard-mode',
            animating: 'visual-focus-animating'
        };
        
        console.log('VisualFocusManager initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // CSS スタイルの設定
            this.setupVisualStyles();
            
            // DOM 要素の作成
            this.createVisualElements();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // システム設定の検出と適用
            this.detectAndApplySystemSettings();
            
            console.log('VisualFocusManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'VISUAL_FOCUS_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * 視覚的スタイルの設定
     */
    setupVisualStyles() {
        const styleId = 'visual-focus-manager-styles';
        
        // 既存のスタイルを削除
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = this.generateVisualCSS();
        
        document.head.appendChild(style);
        console.log('Visual focus styles applied');
    }
    
    /**
     * 視覚的CSS生成
     */
    generateVisualCSS() {
        const { focusRing, highContrast, navigationFeedback } = this.config;
        
        return `
            /* フォーカスリングの基本スタイル */
            .${this.cssClasses.focusVisible} {
                position: relative;
                outline: ${focusRing.width}px solid ${focusRing.color} !important;
                outline-offset: ${focusRing.offset}px !important;
                border-radius: ${focusRing.borderRadius}px !important;
                ${focusRing.customShadow ? `box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.3), 0 0 8px rgba(74, 144, 226, 0.2) !important;` : ''}
                ${focusRing.pulseAnimation ? `animation: focus-pulse ${focusRing.animationDuration * 2}ms ease-in-out infinite alternate;` : ''}
                transition: all ${focusRing.animationDuration}ms ease-out !important;
                z-index: 1000;
            }
            
            /* フォーカス中のパルスアニメーション */
            @keyframes focus-pulse {
                0% { 
                    outline-color: ${focusRing.color};
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
                outline: ${highContrast.width}px solid ${highContrast.color} !important;
                background-color: ${highContrast.backgroundColor} !important;
                color: ${highContrast.textColor} !important;
                box-shadow: 0 0 0 2px ${highContrast.shadowColor}, 0 0 4px ${highContrast.shadowColor} !important;
                animation: none !important;
            }
            
            /* キーボードモード専用表示 */
            body:not(.${this.cssClasses.keyboardMode}) .${this.cssClasses.focusVisible} {
                outline: none !important;
                box-shadow: none !important;
                animation: none !important;
            }
            
            /* フォーカスリング要素 */
            .visual-focus-ring {
                position: absolute;
                pointer-events: none;
                z-index: 9999;
                border: ${focusRing.width}px solid ${focusRing.color};
                border-radius: ${focusRing.borderRadius}px;
                ${focusRing.customShadow ? `box-shadow: 0 0 8px rgba(74, 144, 226, 0.3);` : ''}
                transition: all ${focusRing.animationDuration}ms ease-out;
                opacity: 0;
            }
            
            .visual-focus-ring.active {
                opacity: 1;
            }
            
            /* ナビゲーションインジケータ */
            .visual-focus-navigation {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transform: translateY(-10px);
                transition: all ${navigationFeedback.animationSpeed}ms ease-out;
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .visual-focus-navigation.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .visual-focus-navigation .direction {
                font-size: 18px;
                margin-right: 8px;
            }
            
            .visual-focus-navigation .position {
                font-size: 12px;
                opacity: 0.8;
                margin-top: 4px;
            }
            
            /* キーボードヒント */
            .visual-focus-keyboard-hint {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 20px;
                border-radius: 12px;
                font-size: 13px;
                line-height: 1.4;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transform: translateY(20px);
                transition: all ${navigationFeedback.animationSpeed}ms ease-out;
                max-width: 300px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            
            .visual-focus-keyboard-hint.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .visual-focus-keyboard-hint .title {
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 14px;
            }
            
            .visual-focus-keyboard-hint .shortcuts {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .visual-focus-keyboard-hint .shortcut {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .visual-focus-keyboard-hint .key {
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
            }
            
            /* パンくずリスト */
            .visual-focus-breadcrumb {
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(255, 255, 255, 0.95);
                color: #333;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transform: translateY(-10px);
                transition: all ${navigationFeedback.animationSpeed}ms ease-out;
                backdrop-filter: blur(4px);
                border: 1px solid rgba(0, 0, 0, 0.1);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .visual-focus-breadcrumb.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .visual-focus-breadcrumb .path {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .visual-focus-breadcrumb .separator {
                opacity: 0.5;
            }
            
            /* フォーカスオーバーレイ */
            .visual-focus-overlay {
                position: absolute;
                pointer-events: none;
                z-index: 999;
                background: linear-gradient(45deg, transparent 49%, rgba(74, 144, 226, 0.1) 50%, rgba(74, 144, 226, 0.1) 51%, transparent 52%);
                opacity: 0;
                transition: opacity ${focusRing.animationDuration}ms ease-out;
            }
            
            .visual-focus-overlay.active {
                opacity: 1;
            }
            
            /* アニメーション中の状態 */
            .${this.cssClasses.animating} {
                transition: all ${focusRing.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            
            /* ランドマーク要素のハイライト */
            .visual-focus-landmark {
                position: relative;
            }
            
            .visual-focus-landmark::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(90deg, #4A90E2, #667eea);
                border-radius: 4px;
                opacity: 0;
                z-index: -1;
                transition: opacity 200ms ease-out;
            }
            
            .visual-focus-landmark.highlighted::before {
                opacity: 0.1;
            }
            
            /* グループインジケータ */
            .visual-focus-group {
                position: relative;
                border-left: 3px solid transparent;
                transition: border-color 200ms ease-out;
            }
            
            .visual-focus-group.active {
                border-left-color: #4A90E2;
            }
            
            /* レスポンシブ対応 */
            @media (max-width: 768px) {
                .visual-focus-navigation,
                .visual-focus-keyboard-hint {
                    position: fixed;
                    bottom: 10px;
                    left: 10px;
                    right: 10px;
                    top: auto;
                    max-width: none;
                }
                
                .visual-focus-breadcrumb {
                    top: 10px;
                    left: 10px;
                    right: 10px;
                }
            }
            
            /* 印刷時は非表示 */
            @media print {
                .visual-focus-ring,
                .visual-focus-navigation,
                .visual-focus-keyboard-hint,
                .visual-focus-breadcrumb,
                .visual-focus-overlay {
                    display: none !important;
                }
            }
            
            /* Reduced motion 対応 */
            @media (prefers-reduced-motion: reduce) {
                .${this.cssClasses.focusVisible},
                .visual-focus-ring,
                .visual-focus-navigation,
                .visual-focus-keyboard-hint,
                .visual-focus-breadcrumb,
                .visual-focus-overlay {
                    animation: none !important;
                    transition: none !important;
                }
            }
        `;
    }
    
    /**
     * 視覚要素の作成
     */
    createVisualElements() {
        // フォーカスリング要素
        this.elements.focusRing = document.createElement('div');
        this.elements.focusRing.className = 'visual-focus-ring';
        this.elements.focusRing.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.elements.focusRing);
        
        // ナビゲーションインジケータ
        this.elements.navigationIndicator = document.createElement('div');
        this.elements.navigationIndicator.className = 'visual-focus-navigation';
        this.elements.navigationIndicator.setAttribute('aria-hidden', 'true');
        this.elements.navigationIndicator.innerHTML = `
            <div class="direction"></div>
            <div class="status"></div>
            <div class="position"></div>
        `;
        document.body.appendChild(this.elements.navigationIndicator);
        
        // キーボードヒント
        this.elements.keyboardHint = document.createElement('div');
        this.elements.keyboardHint.className = 'visual-focus-keyboard-hint';
        this.elements.keyboardHint.setAttribute('aria-hidden', 'true');
        this.elements.keyboardHint.innerHTML = `
            <div class="title">キーボードショートカット</div>
            <div class="shortcuts"></div>
        `;
        document.body.appendChild(this.elements.keyboardHint);
        
        // パンくずリスト
        this.elements.breadcrumbTrail = document.createElement('div');
        this.elements.breadcrumbTrail.className = 'visual-focus-breadcrumb';
        this.elements.breadcrumbTrail.setAttribute('aria-hidden', 'true');
        this.elements.breadcrumbTrail.innerHTML = `<div class="path"></div>`;
        document.body.appendChild(this.elements.breadcrumbTrail);
        
        // フォーカスオーバーレイ
        this.elements.focusOverlay = document.createElement('div');
        this.elements.focusOverlay.className = 'visual-focus-overlay';
        this.elements.focusOverlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.elements.focusOverlay);
        
        console.log('Visual focus elements created');
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // FocusManagerからのイベント
        if (this.focusManager) {
            this.focusManager.addEventListener('focusChanged', (data) => {
                this.handleFocusChange(data.element, data.index, data.keyboardMode);
            });
            
            this.focusManager.addEventListener('focusLost', (data) => {
                this.handleFocusLost(data.element);
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
        if (this.accessibilityManager) {
            this.accessibilityManager.addEventListener('configurationApplied', (data) => {
                this.applyConfig(data.config);
            });
        }
        
        console.log('Visual focus event listeners set up');
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
     * フォーカス変更の処理
     */
    handleFocusChange(element, index, keyboardMode) {
        if (!element) return;
        
        try {
            // 前の状態を保存
            this.state.previousFocusElement = this.state.currentFocusElement;
            this.state.currentFocusElement = element;
            
            // キーボードモードの設定
            if (keyboardMode) {
                document.body.classList.add(this.cssClasses.keyboardMode);
                
                // 視覚的フォーカス表示の更新
                this.updateFocusVisuals(element, index);
                
                // ナビゲーションフィードバックの表示
                this.showNavigationFeedback(element, index);
                
                // キーボードヒントの表示（必要に応じて）
                if (this.config.keyboardHints.showOnFocus) {
                    this.showKeyboardHints(element);
                }
                
                // パンくずリストの更新
                if (this.config.visualCues.breadcrumbs) {
                    this.updateBreadcrumbTrail(element);
                }
            } else {
                document.body.classList.remove(this.cssClasses.keyboardMode);
                this.hideFocusVisuals();
            }
            
            // ナビゲーションパスの更新
            this.updateNavigationPath(element);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'VISUAL_FOCUS_ERROR', {
                operation: 'handleFocusChange',
                element: element.tagName
            });
        }
    }
    
    /**
     * フォーカス失去の処理
     */
    handleFocusLost(element) {
        // 視覚要素のフェードアウト
        this.fadeOutVisualElements();
    }
    
    /**
     * 視覚的フォーカス表示の更新
     */
    updateFocusVisuals(element, index) {
        if (!this.config.focusRing.enabled) return;
        
        // 要素にフォーカスクラスを追加
        element.classList.add(this.cssClasses.focusVisible);
        
        // カスタムフォーカスリングの位置調整
        this.positionFocusRing(element);
        
        // フォーカスオーバーレイの更新
        this.updateFocusOverlay(element);
        
        // ランドマーク要素のハイライト
        if (this.config.visualCues.landmarkHighlight) {
            this.highlightLandmarks(element);
        }
        
        // グループインジケータの更新
        if (this.config.visualCues.groupIndicators) {
            this.updateGroupIndicators(element);
        }
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
     * ナビゲーションフィードバックの表示
     */
    showNavigationFeedback(element, index) {
        if (!this.config.navigationFeedback.enabled) return;
        
        const indicator = this.elements.navigationIndicator;
        const direction = this.getNavigationDirection();
        const position = this.getElementPosition(element, index);
        
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
                hint.classList.remove('visible');
                this.state.keyboardHintVisible = false;
            }, this.config.keyboardHints.hideDelay);
            
            this.state.animationTimers.set('keyboardHint', timer);
        }
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
        if (this.accessibilityManager.config.keyboard.navigationMode === '2d') {
            hints.push({ key: '↑↓←→', description: '2D移動' });
        }
        
        return hints.slice(0, 6); // 最大6個まで
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
     * キーダウン処理
     */
    handleKeyDown(event) {
        // キーボードモードの有効化
        document.body.classList.add(this.cssClasses.keyboardMode);
        
        // ヘルプキーの処理
        if (event.key === 'F1' || (event.altKey && event.key === '?')) {
            event.preventDefault();
            this.toggleKeyboardHints();
        }
        
        // ナビゲーション方向の表示
        if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            this.prepareNavigationFeedback(event.key, event.shiftKey);
        }
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
        document.body.classList.remove(this.cssClasses.keyboardMode);
        
        // 視覚的フィードバックを非表示
        this.hideFocusVisuals();
    }
    
    /**
     * マウス移動処理
     */
    handleMouseMove(event) {
        // マウス使用時はキーボードヒントを非表示
        if (this.state.keyboardHintVisible) {
            this.elements.keyboardHint.classList.remove('visible');
            this.state.keyboardHintVisible = false;
        }
    }
    
    /**
     * ウィンドウリサイズ処理
     */
    handleWindowResize() {
        // フォーカスリングの位置を再計算
        if (this.state.currentFocusElement && document.body.classList.contains(this.cssClasses.keyboardMode)) {
            this.positionFocusRing(this.state.currentFocusElement);
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
        const indicator = this.elements.navigationIndicator;
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
     * キーボードヒントの切り替え
     */
    toggleKeyboardHints() {
        const hint = this.elements.keyboardHint;
        
        if (this.state.keyboardHintVisible) {
            hint.classList.remove('visible');
            this.state.keyboardHintVisible = false;
        } else {
            // 現在フォーカスされている要素のヒントを表示
            if (this.state.currentFocusElement) {
                this.showKeyboardHints(this.state.currentFocusElement);
            }
        }
    }
    
    /**
     * フォーカス視覚要素の非表示
     */
    hideFocusVisuals() {
        // フォーカスクラスを削除
        document.querySelectorAll(`.${this.cssClasses.focusVisible}`).forEach(el => {
            el.classList.remove(this.cssClasses.focusVisible);
        });
        
        // カスタム視覚要素を非表示
        this.elements.focusRing.classList.remove('active');
        this.elements.navigationIndicator.classList.remove('visible');
        this.elements.keyboardHint.classList.remove('visible');
        this.elements.breadcrumbTrail.classList.remove('visible');
        this.elements.focusOverlay.classList.remove('active');
        
        // ランドマークハイライトをクリア
        document.querySelectorAll('.visual-focus-landmark.highlighted').forEach(el => {
            el.classList.remove('highlighted');
        });
        
        // グループインジケータをクリア
        document.querySelectorAll('.visual-focus-group.active').forEach(el => {
            el.classList.remove('active');
        });
        
        this.state.keyboardHintVisible = false;
    }
    
    /**
     * 視覚要素のフェードアウト
     */
    fadeOutVisualElements() {
        const fadeDelay = this.config.navigationFeedback.fadeTimeout;
        
        setTimeout(() => {
            this.hideFocusVisuals();
        }, fadeDelay);
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
        this.setupVisualStyles();
        
        console.log(`High contrast mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.visual) {
            // ハイコントラスト設定
            if (config.visual.highContrast) {
                this.setHighContrastMode(config.visual.highContrast.enabled);
            }
            
            // 視覚設定の更新
            if (config.visual.motion) {
                if (config.visual.motion.reduced) {
                    document.body.classList.add('reduced-motion');
                } else {
                    document.body.classList.remove('reduced-motion');
                }
            }
        }
        
        // 設定の反映
        if (config.keyboard) {
            Object.assign(this.config.keyboardHints, config.keyboard);
        }
        
        console.log('VisualFocusManager configuration applied');
    }
    
    /**
     * レポート生成
     */
    generateReport() {
        return {
            isActive: document.body.classList.contains(this.cssClasses.keyboardMode),
            highContrastMode: this.state.isHighContrastMode,
            currentFocusElement: this.state.currentFocusElement?.tagName || null,
            navigationPathLength: this.state.navigationPath.length,
            activeVisualCues: this.state.activeVisualCues.size,
            keyboardHintVisible: this.state.keyboardHintVisible,
            activeTimers: this.state.animationTimers.size
        };
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        this.config.focusRing.enabled = enabled;
        this.config.navigationFeedback.enabled = enabled;
        this.config.keyboardHints.enabled = enabled;
        
        if (!enabled) {
            this.hideFocusVisuals();
        }
        
        console.log(`VisualFocusManager ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying VisualFocusManager...');
        
        // 全ての視覚要素を非表示
        this.hideFocusVisuals();
        
        // タイマーのクリア
        this.state.animationTimers.forEach(timer => clearTimeout(timer));
        this.state.animationTimers.clear();
        
        // DOM要素の削除
        Object.values(this.elements).forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        // スタイル要素の削除
        const styleElement = document.getElementById('visual-focus-manager-styles');
        if (styleElement) {
            styleElement.remove();
        }
        
        // CSSクラスの削除
        document.body.classList.remove(
            this.cssClasses.keyboardMode,
            this.cssClasses.highContrast
        );
        
        // 全てのフォーカス関連クラスを削除
        document.querySelectorAll(`.${this.cssClasses.focusVisible}`).forEach(el => {
            el.classList.remove(this.cssClasses.focusVisible);
        });
        
        document.querySelectorAll('.visual-focus-landmark').forEach(el => {
            el.classList.remove('visual-focus-landmark', 'highlighted');
        });
        
        document.querySelectorAll('.visual-focus-group').forEach(el => {
            el.classList.remove('visual-focus-group', 'active');
        });
        
        // データのクリア
        this.state.navigationPath = [];
        this.state.activeVisualCues.clear();
        
        console.log('VisualFocusManager destroyed');
    }
}