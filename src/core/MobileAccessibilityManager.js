/**
 * MobileAccessibilityManager - モバイル向けアクセシビリティ強化マネージャー
 * モバイル向けアクセシビリティ機能を実装
 * スクリーンリーダー対応を強化
 * 色覚サポートとコントラスト調整を追加
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

class MobileAccessibilityManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.errorHandler = ErrorHandler.getInstance();
        
        // アクセシビリティ設定
        this.accessibilityConfig = {
            screenReader: {
                enabled: false,
                announcements: true,
                liveRegions: true,
                roleDescriptions: true,
                keyboardNavigation: true,
                focusManagement: true
            },
            visualSupport: {
                highContrast: false,
                colorBlindnessSupport: false,
                colorBlindnessType: 'none', // 'protanopia', 'deuteranopia', 'tritanopia'
                fontSize: 'normal', // 'small', 'normal', 'large', 'xlarge'
                lineHeight: 'normal', // 'normal', 'relaxed', 'loose'
                letterSpacing: 'normal' // 'normal', 'wide', 'wider'
            },
            motorSupport: {
                touchAreaEnlarged: false,
                hoverAlternatives: true,
                gestureAlternatives: true,
                voiceControl: false,
                switchControl: false
            },
            cognitiveSupport: {
                reducedMotion: false,
                simplifiedUI: false,
                contentPausing: true,
                timeExtensions: false,
                readingMode: false
            },
            auditorySupport: {
                visualIndicators: true,
                hapticFeedback: true,
                captions: false,
                signLanguage: false
            }
        };
        
        // スクリーンリーダー状態
        this.screenReaderState = {
            active: false,
            currentFocus: null,
            announceQueue: [],
            liveRegions: new Map(),
            navigationMode: 'normal' // 'normal', 'explore', 'reading'
        };
        
        // 色覚支援設定
        this.colorSupport = {
            filters: new Map(),
            contrastRatios: new Map(),
            colorPalettes: new Map(),
            currentFilter: null
        };
        
        // フォーカス管理
        this.focusManager = {
            focusableElements: [],
            currentIndex: -1,
            focusHistory: [],
            trapStack: []
        };
        
        // 音声・触覚フィードバック
        this.feedbackSystems = {
            speechSynthesis: null,
            haptics: null,
            audioBeeps: new Map()
        };
        
        this.initialize();
    }
    
    /**
     * システム初期化
     */
    initialize() {
        try {
            this.detectAccessibilityCapabilities();
            this.setupScreenReaderSupport();
            this.initializeColorSupport();
            this.setupKeyboardNavigation();
            this.initializeFeedbackSystems();
            this.setupAccessibilityEventListeners();
            this.loadAccessibilitySettings();
            this.applyInitialSettings();
            
            console.log('[MobileAccessibilityManager] モバイルアクセシビリティシステム初期化完了');
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileAccessibilityManager.initialize');
        }
    }
    
    /**
     * アクセシビリティ機能検出
     */
    detectAccessibilityCapabilities() {
        this.capabilities = {
            // スクリーンリーダー検出
            screenReader: this.detectScreenReader(),
            
            // 音声合成サポート
            speechSynthesis: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
            
            // CSS色フィルターサポート
            cssFilters: CSS.supports('filter', 'hue-rotate(0deg)'),
            
            // 振動API
            haptics: 'vibrate' in navigator,
            
            // プリファレンス検出
            prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
            prefersReducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
            
            // デバイス機能
            hasKeyboard: this.detectKeyboardSupport(),
            hasTouch: 'ontouchstart' in window,
            hasPointer: 'PointerEvent' in window
        };
        
        console.log('[MobileAccessibilityManager] アクセシビリティ機能検出完了', this.capabilities);
    }
    
    /**
     * スクリーンリーダー検出
     */
    detectScreenReader() {
        // iOS VoiceOver検出
        if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
            return window.speechSynthesis && window.speechSynthesis.speaking !== undefined ? 'voiceover' : null;
        }
        
        // Android TalkBack検出
        if (navigator.userAgent.includes('Android')) {
            return window.speechSynthesis ? 'talkback' : null;
        }
        
        // その他スクリーンリーダー
        if (window.navigator.userAgent.includes('NVDA') || 
            window.navigator.userAgent.includes('JAWS') ||
            window.speechSynthesis) {
            return 'generic';
        }
        
        return null;
    }
    
    /**
     * キーボードサポート検出
     */
    detectKeyboardSupport() {
        // Bluetooth キーボードや外部キーボードの存在を推測
        return window.innerWidth > 768 || // タブレットサイズ以上
               navigator.keyboard !== undefined || // Keyboard API
               navigator.userAgent.includes('iPad'); // iPadは外部キーボード想定
    }
    
    /**
     * スクリーンリーダーサポート設定
     */
    setupScreenReaderSupport() {
        if (!this.capabilities.screenReader) return;
        
        // ARIA ライブリージョン作成
        this.createLiveRegions();
        
        // フォーカス管理設定
        this.setupFocusManagement();
        
        // キーボードナビゲーション
        this.setupScreenReaderKeyboardShortcuts();
        
        // 動的コンテンツアナウンス
        this.setupDynamicAnnouncements();
        
        console.log('[MobileAccessibilityManager] スクリーンリーダーサポート設定完了');
    }
    
    /**
     * ARIAライブリージョン作成
     */
    createLiveRegions() {
        // ゲーム状態アナウンス用
        this.createLiveRegion('game-status', 'polite', 'ゲーム状態');
        
        // スコア・時間アナウンス用
        this.createLiveRegion('score-updates', 'polite', 'スコア更新');
        
        // 重要な通知用
        this.createLiveRegion('announcements', 'assertive', '重要な通知');
        
        // エラー・警告用
        this.createLiveRegion('errors', 'assertive', 'エラーと警告');
    }
    
    /**
     * ライブリージョン作成
     */
    createLiveRegion(id, politeness, description) {
        const region = document.createElement('div');
        region.id = `sr-${id}`;
        region.className = 'screen-reader-only';
        region.setAttribute('aria-live', politeness);
        region.setAttribute('aria-label', description);
        region.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        
        document.body.appendChild(region);
        this.screenReaderState.liveRegions.set(id, region);
    }
    
    /**
     * フォーカス管理設定
     */
    setupFocusManagement() {
        // フォーカス可能要素の自動検出
        this.updateFocusableElements();
        
        // フォーカストラップ設定
        this.setupFocusTrap();
        
        // フォーカスインジケーター強化
        this.enhanceFocusIndicators();
        
        // タッチデバイスでのフォーカス管理
        this.setupTouchFocusManagement();
    }
    
    /**
     * フォーカス可能要素更新
     */
    updateFocusableElements() {
        const selectors = [
            'button',
            'input',
            'select',
            'textarea',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])',
            '[role="button"]',
            '[role="link"]',
            '[role="menuitem"]',
            '.focusable'
        ];
        
        this.focusManager.focusableElements = Array.from(
            document.querySelectorAll(selectors.join(', '))
        ).filter(el => {
            return !el.disabled && 
                   !el.hasAttribute('aria-hidden') &&
                   el.offsetParent !== null; // 表示されている要素のみ
        });
        
        // ゲーム固有のフォーカス可能要素を追加
        this.addGameSpecificFocusableElements();
    }
    
    /**
     * ゲーム固有フォーカス要素追加
     */
    addGameSpecificFocusableElements() {
        // ゲームCanvas
        const canvas = this.gameEngine.canvas;
        if (canvas && !canvas.hasAttribute('tabindex')) {
            canvas.setAttribute('tabindex', '0');
            canvas.setAttribute('role', 'application');
            canvas.setAttribute('aria-label', 'BubblePop ゲーム領域');
            this.focusManager.focusableElements.push(canvas);
        }
        
        // ゲームUI要素
        const gameUI = document.getElementById('gameUI');
        if (gameUI) {
            const uiElements = gameUI.querySelectorAll('.interactive, .button, .control');
            this.focusManager.focusableElements.push(...uiElements);
        }
    }
    
    /**
     * フォーカストラップ設定
     */
    setupFocusTrap() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.focusManager.trapStack.length > 0) {
                this.handleTrappedTabNavigation(e);
            }
        });
    }
    
    /**
     * トラップされたTab ナビゲーション処理
     */
    handleTrappedTabNavigation(e) {
        const currentTrap = this.focusManager.trapStack[this.focusManager.trapStack.length - 1];
        const focusableInTrap = currentTrap.querySelectorAll(
            'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableInTrap.length === 0) return;
        
        const firstElement = focusableInTrap[0];
        const lastElement = focusableInTrap[focusableInTrap.length - 1];
        
        if (e.shiftKey) {
            // Shift+Tab: 後方移動
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab: 前方移動
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    /**
     * フォーカスインジケーター強化
     */
    enhanceFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            .enhanced-focus {
                outline: 3px solid #4CAF50 !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 6px rgba(76, 175, 80, 0.3) !important;
                position: relative !important;
                z-index: 1000 !important;
            }
            
            .enhanced-focus::after {
                content: '';
                position: absolute;
                top: -4px;
                left: -4px;
                right: -4px;
                bottom: -4px;
                border: 2px solid #ffffff;
                border-radius: 4px;
                pointer-events: none;
            }
            
            @media (prefers-reduced-motion: no-preference) {
                .enhanced-focus {
                    animation: focusPulse 2s infinite;
                }
                
                @keyframes focusPulse {
                    0%, 100% { box-shadow: 0 0 0 6px rgba(76, 175, 80, 0.3); }
                    50% { box-shadow: 0 0 0 8px rgba(76, 175, 80, 0.5); }
                }
            }
        `;
        document.head.appendChild(style);
        
        // フォーカスイベントリスナー
        document.addEventListener('focusin', (e) => {
            e.target.classList.add('enhanced-focus');
            this.announceElementFocus(e.target);
        });
        
        document.addEventListener('focusout', (e) => {
            e.target.classList.remove('enhanced-focus');
        });
    }
    
    /**
     * タッチデバイスフォーカス管理
     */
    setupTouchFocusManagement() {
        // タッチ操作時の疑似フォーカス
        document.addEventListener('touchstart', (e) => {
            const target = e.target;
            if (this.isInteractiveElement(target)) {
                this.setVirtualFocus(target);
            }
        }, { passive: true });
        
        // タッチ終了時のフォーカス解除
        document.addEventListener('touchend', () => {
            setTimeout(() => {
                this.clearVirtualFocus();
            }, 100);
        }, { passive: true });
    }
    
    /**
     * 仮想フォーカス設定
     */
    setVirtualFocus(element) {
        this.clearVirtualFocus();
        element.classList.add('virtual-focus');
        this.announceElementFocus(element);
    }
    
    /**
     * 仮想フォーカス解除
     */
    clearVirtualFocus() {
        document.querySelectorAll('.virtual-focus').forEach(el => {
            el.classList.remove('virtual-focus');
        });
    }
    
    /**
     * 要素フォーカスアナウンス
     */
    announceElementFocus(element) {
        if (!this.accessibilityConfig.screenReader.enabled) return;
        
        let announcement = '';
        
        // 要素の説明を構築
        const label = element.getAttribute('aria-label') || 
                     element.getAttribute('title') || 
                     element.textContent || 
                     element.value ||
                     element.alt;
        
        const role = element.getAttribute('role') || 
                    element.tagName.toLowerCase();
        
        const state = this.getElementState(element);
        
        announcement = `${label}, ${this.translateRole(role)}${state}`;
        
        this.announceToScreenReader(announcement, 'polite');
    }
    
    /**
     * 要素状態取得
     */
    getElementState(element) {
        const states = [];
        
        if (element.disabled) states.push('無効');
        if (element.checked) states.push('チェック済み');
        if (element.selected) states.push('選択済み');
        if (element.getAttribute('aria-expanded') === 'true') states.push('展開済み');
        if (element.getAttribute('aria-expanded') === 'false') states.push('折りたたみ済み');
        if (element.required) states.push('必須');
        
        return states.length > 0 ? `, ${states.join(', ')}` : '';
    }
    
    /**
     * ロール翻訳
     */
    translateRole(role) {
        const roleTranslations = {
            'button': 'ボタン',
            'link': 'リンク',
            'textbox': 'テキストボックス',
            'checkbox': 'チェックボックス',
            'radio': 'ラジオボタン',
            'menuitem': 'メニュー項目',
            'tab': 'タブ',
            'slider': 'スライダー',
            'application': 'アプリケーション',
            'canvas': 'キャンバス'
        };
        
        return roleTranslations[role] || role;
    }
    
    /**
     * スクリーンリーダーキーボードショートカット
     */
    setupScreenReaderKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.accessibilityConfig.screenReader.enabled) return;
            
            // ゲーム固有のショートカット
            if (e.target === this.gameEngine.canvas) {
                this.handleGameKeyboardShortcuts(e);
            }
            
            // 一般的なスクリーンリーダーショートカット
            this.handleScreenReaderShortcuts(e);
        });
    }
    
    /**
     * ゲームキーボードショートカット処理
     */
    handleGameKeyboardShortcuts(e) {
        switch (e.key) {
            case 'h':
            case 'H':
                e.preventDefault();
                this.announceGameHelp();
                break;
                
            case 's':
            case 'S':
                e.preventDefault();
                this.announceGameStatus();
                break;
                
            case 'r':
            case 'R':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.announceGameRules();
                }
                break;
                
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.handleGameAction(e);
                break;
        }
    }
    
    /**
     * スクリーンリーダーショートカット処理
     */
    handleScreenReaderShortcuts(e) {
        // Ctrl+; で読み上げモード切り替え
        if (e.ctrlKey && e.key === ';') {
            e.preventDefault();
            this.toggleReadingMode();
        }
        
        // Ctrl+. で現在位置アナウンス
        if (e.ctrlKey && e.key === '.') {
            e.preventDefault();
            this.announceCurrentPosition();
        }
    }
    
    /**
     * 動的アナウンス設定
     */
    setupDynamicAnnouncements() {
        // ゲーム状態変更の監視
        this.setupGameStateAnnouncements();
        
        // UI変更の監視
        this.setupUIChangeAnnouncements();
        
        // エラー・成功メッセージの監視
        this.setupNotificationAnnouncements();
    }
    
    /**
     * ゲーム状態アナウンス設定
     */
    setupGameStateAnnouncements() {
        // スコア変更時
        if (this.gameEngine.scoreManager) {
            const originalUpdateScore = this.gameEngine.scoreManager.updateScore;
            this.gameEngine.scoreManager.updateScore = (points) => {
                const result = originalUpdateScore.call(this.gameEngine.scoreManager, points);
                this.announceScoreUpdate(points, this.gameEngine.scoreManager.getScore());
                return result;
            };
        }
        
        // HP変更時
        if (this.gameEngine.playerData) {
            const originalSetHP = this.gameEngine.playerData.setHP;
            this.gameEngine.playerData.setHP = (hp) => {
                const oldHP = this.gameEngine.playerData.getHP();
                const result = originalSetHP.call(this.gameEngine.playerData, hp);
                this.announceHPChange(oldHP, hp);
                return result;
            };
        }
    }
    
    /**
     * UI変更アナウンス設定
     */
    setupUIChangeAnnouncements() {
        // MutationObserver でDOM変更を監視
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.handleDOMChanges(mutation);
                } else if (mutation.type === 'attributes') {
                    this.handleAttributeChanges(mutation);
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['aria-label', 'aria-describedby', 'aria-live']
        });
    }
    
    /**
     * DOM変更処理
     */
    handleDOMChanges(mutation) {
        // 新しく追加された要素のアナウンス
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                this.announceNewElement(node);
            }
        });
        
        // 削除された要素のアナウンス
        mutation.removedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                this.announceRemovedElement(node);
            }
        });
    }
    
    /**
     * 属性変更処理
     */
    handleAttributeChanges(mutation) {
        if (mutation.attributeName === 'aria-live') {
            // ライブリージョンの更新
            this.updateLiveRegion(mutation.target);
        }
    }
    
    /**
     * 通知アナウンス設定
     */
    setupNotificationAnnouncements() {
        // カスタムイベントリスナー
        document.addEventListener('notification:show', (e) => {
            this.announceNotification(e.detail);
        });
        
        // エラーイベントリスナー
        document.addEventListener('error:show', (e) => {
            this.announceError(e.detail);
        });
    }
    
    /**
     * 色覚支援初期化
     */
    initializeColorSupport() {
        this.setupColorFilters();
        this.setupContrastControls();
        this.setupColorPalettes();
        
        console.log('[MobileAccessibilityManager] 色覚支援システム初期化完了');
    }
    
    /**
     * 色フィルター設定
     */
    setupColorFilters() {
        // Protanopia (赤色盲) フィルター
        this.colorSupport.filters.set('protanopia', {
            filter: 'hue-rotate(120deg) saturate(0.8)',
            description: '赤色盲補正フィルター'
        });
        
        // Deuteranopia (緑色盲) フィルター  
        this.colorSupport.filters.set('deuteranopia', {
            filter: 'hue-rotate(-120deg) saturate(0.8)',
            description: '緑色盲補正フィルター'
        });
        
        // Tritanopia (青色盲) フィルター
        this.colorSupport.filters.set('tritanopia', {
            filter: 'hue-rotate(180deg) saturate(0.9)',
            description: '青色盲補正フィルター'
        });
        
        // 高コントラストフィルター
        this.colorSupport.filters.set('high-contrast', {
            filter: 'contrast(1.5) brightness(1.2)',
            description: '高コントラストフィルター'
        });
    }
    
    /**
     * コントラスト制御設定
     */
    setupContrastControls() {
        // コントラスト比計算
        this.colorSupport.contrastRatios.set('normal', 4.5);
        this.colorSupport.contrastRatios.set('enhanced', 7.0);
        
        // 動的コントラスト調整
        this.setupDynamicContrast();
    }
    
    /**
     * 動的コントラスト設定
     */
    setupDynamicContrast() {
        // 背景色に基づく自動調整
        const observer = new MutationObserver(() => {
            if (this.accessibilityConfig.visualSupport.highContrast) {
                this.adjustContrastForElements();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
    
    /**
     * 要素コントラスト調整
     */
    adjustContrastForElements() {
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            this.adjustElementContrast(element);
        });
    }
    
    /**
     * 個別要素コントラスト調整
     */
    adjustElementContrast(element) {
        const style = getComputedStyle(element);
        const backgroundColor = style.backgroundColor;
        const textColor = style.color;
        
        if (backgroundColor && textColor) {
            const contrastRatio = this.calculateContrastRatio(backgroundColor, textColor);
            const targetRatio = this.colorSupport.contrastRatios.get('enhanced');
            
            if (contrastRatio < targetRatio) {
                this.enhanceElementContrast(element, contrastRatio, targetRatio);
            }
        }
    }
    
    /**
     * コントラスト比計算
     */
    calculateContrastRatio(backgroundColor, textColor) {
        const bgLuminance = this.calculateLuminance(backgroundColor);
        const textLuminance = this.calculateLuminance(textColor);
        
        const lighter = Math.max(bgLuminance, textLuminance);
        const darker = Math.min(bgLuminance, textLuminance);
        
        return (lighter + 0.05) / (darker + 0.05);
    }
    
    /**
     * 輝度計算
     */
    calculateLuminance(color) {
        // RGB値を取得
        const rgb = this.parseColor(color);
        if (!rgb) return 0;
        
        // 相対輝度計算
        const [r, g, b] = rgb.map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    
    /**
     * 色値解析
     */
    parseColor(color) {
        // RGB形式の解析
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
        }
        
        // 16進数形式の解析
        const hexMatch = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (hexMatch) {
            return [
                parseInt(hexMatch[1], 16),
                parseInt(hexMatch[2], 16),
                parseInt(hexMatch[3], 16)
            ];
        }
        
        return null;
    }
    
    /**
     * 要素コントラスト強化
     */
    enhanceElementContrast(element, currentRatio, targetRatio) {
        const adjustment = targetRatio / currentRatio;
        
        if (adjustment > 1.2) {
            element.style.filter = `contrast(${adjustment})`;
            element.classList.add('contrast-enhanced');
        }
    }
    
    /**
     * 色パレット設定
     */
    setupColorPalettes() {
        // アクセシブルカラーパレット
        this.colorSupport.colorPalettes.set('accessible', {
            primary: '#0066CC',      // アクセシブルブルー
            secondary: '#FF6600',    // アクセシブルオレンジ
            success: '#008844',      // アクセシブルグリーン
            warning: '#FF9900',      // アクセシブルイエロー
            error: '#CC0000',        // アクセシブルレッド
            text: '#000000',         // 黒
            background: '#FFFFFF'    // 白
        });
        
        // 高コントラストパレット
        this.colorSupport.colorPalettes.set('high-contrast', {
            primary: '#FFFFFF',
            secondary: '#FFFF00',
            success: '#00FF00',
            warning: '#FFFF00',
            error: '#FF0000',
            text: '#FFFFFF',
            background: '#000000'
        });
    }
    
    /**
     * キーボードナビゲーション設定
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
        
        // フォーカス移動のショートカット
        this.setupFocusNavigationShortcuts();
    }
    
    /**
     * キーボードナビゲーション処理
     */
    handleKeyboardNavigation(e) {
        switch (e.key) {
            case 'Tab':
                this.handleTabNavigation(e);
                break;
                
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                this.handleArrowNavigation(e);
                break;
                
            case 'Home':
            case 'End':
                this.handleHomeEndNavigation(e);
                break;
                
            case 'Escape':
                this.handleEscapeNavigation(e);
                break;
        }
    }
    
    /**
     * Tabナビゲーション処理
     */
    handleTabNavigation(e) {
        // カスタムTab順序
        if (this.focusManager.focusableElements.length > 0) {
            e.preventDefault();
            
            let nextIndex;
            if (e.shiftKey) {
                nextIndex = this.focusManager.currentIndex - 1;
                if (nextIndex < 0) {
                    nextIndex = this.focusManager.focusableElements.length - 1;
                }
            } else {
                nextIndex = this.focusManager.currentIndex + 1;
                if (nextIndex >= this.focusManager.focusableElements.length) {
                    nextIndex = 0;
                }
            }
            
            this.focusManager.currentIndex = nextIndex;
            this.focusManager.focusableElements[nextIndex].focus();
        }
    }
    
    /**
     * 矢印キーナビゲーション処理
     */
    handleArrowNavigation(e) {
        // ゲーム領域での矢印キー操作
        if (e.target === this.gameEngine.canvas) {
            e.preventDefault();
            this.handleGameArrowNavigation(e.key);
        }
    }
    
    /**
     * ゲーム矢印キーナビゲーション
     */
    handleGameArrowNavigation(key) {
        // ゲーム内での移動やフォーカス
        switch (key) {
            case 'ArrowUp':
                this.announceToScreenReader('上方向に移動', 'polite');
                break;
            case 'ArrowDown':
                this.announceToScreenReader('下方向に移動', 'polite');
                break;
            case 'ArrowLeft':
                this.announceToScreenReader('左方向に移動', 'polite');
                break;
            case 'ArrowRight':
                this.announceToScreenReader('右方向に移動', 'polite');
                break;
        }
    }
    
    /**
     * フィードバックシステム初期化
     */
    initializeFeedbackSystems() {
        // 音声合成初期化
        if (this.capabilities.speechSynthesis) {
            this.feedbackSystems.speechSynthesis = window.speechSynthesis;
            this.setupSpeechSynthesis();
        }
        
        // 触覚フィードバック初期化
        if (this.capabilities.haptics) {
            this.setupHapticFeedback();
        }
        
        // 音声ビープ初期化
        this.setupAudioBeeps();
    }
    
    /**
     * 音声合成設定
     */
    setupSpeechSynthesis() {
        // 日本語音声の選択
        this.selectedVoice = null;
        
        const voices = this.feedbackSystems.speechSynthesis.getVoices();
        this.selectedVoice = voices.find(voice => voice.lang.startsWith('ja')) || voices[0];
        
        // 音声が読み込まれていない場合の対応
        if (voices.length === 0) {
            this.feedbackSystems.speechSynthesis.addEventListener('voiceschanged', () => {
                const newVoices = this.feedbackSystems.speechSynthesis.getVoices();
                this.selectedVoice = newVoices.find(voice => voice.lang.startsWith('ja')) || newVoices[0];
            });
        }
    }
    
    /**
     * 音声ビープ設定
     */
    setupAudioBeeps() {
        // AudioContext を使用した音声ビープ
        if (window.AudioContext || window.webkitAudioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // 各種ビープ音を作成
            this.createAudioBeeps();
        }
    }
    
    /**
     * ビープ音作成
     */
    createAudioBeeps() {
        const beepTypes = {
            focus: { frequency: 800, duration: 100 },
            success: { frequency: 1000, duration: 200 },
            error: { frequency: 400, duration: 300 },
            navigation: { frequency: 600, duration: 100 }
        };
        
        Object.entries(beepTypes).forEach(([type, config]) => {
            this.feedbackSystems.audioBeeps.set(type, config);
        });
    }
    
    /**
     * ビープ音再生
     */
    playAudioBeep(type) {
        if (!this.audioContext || !this.feedbackSystems.audioBeeps.has(type)) return;
        
        const config = this.feedbackSystems.audioBeeps.get(type);
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + config.duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + config.duration / 1000);
    }
    
    /**
     * アクセシビリティイベントリスナー設定
     */
    setupAccessibilityEventListeners() {
        // メディアクエリ変更の監視
        this.setupMediaQueryListeners();
        
        // フォーカス状態の監視
        this.setupFocusListeners();
        
        // カスタムアクセシビリティイベント
        this.setupCustomAccessibilityEvents();
    }
    
    /**
     * メディアクエリリスナー設定
     */
    setupMediaQueryListeners() {
        // モーション設定変更
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        motionQuery.addListener((e) => {
            this.accessibilityConfig.cognitiveSupport.reducedMotion = e.matches;
            this.applyMotionSettings();
        });
        
        // コントラスト設定変更
        const contrastQuery = window.matchMedia('(prefers-contrast: high)');
        contrastQuery.addListener((e) => {
            this.accessibilityConfig.visualSupport.highContrast = e.matches;
            this.applyContrastSettings();
        });
    }
    
    /**
     * フォーカスリスナー設定
     */
    setupFocusListeners() {
        document.addEventListener('focusin', (e) => {
            this.playAudioBeep('focus');
        });
        
        document.addEventListener('focusout', (e) => {
            // フォーカス履歴に追加
            this.focusManager.focusHistory.push(e.target);
            if (this.focusManager.focusHistory.length > 10) {
                this.focusManager.focusHistory.shift();
            }
        });
    }
    
    /**
     * スクリーンリーダーアナウンス
     */
    announceToScreenReader(message, priority = 'polite') {
        if (!this.accessibilityConfig.screenReader.enabled) return;
        
        const regionId = priority === 'assertive' ? 'announcements' : 'game-status';
        const region = this.screenReaderState.liveRegions.get(regionId);
        
        if (region) {
            // 既存の内容をクリア
            region.textContent = '';
            
            // 少し遅延してからメッセージを設定（再読み上げを確実にする）
            setTimeout(() => {
                region.textContent = message;
            }, 10);
        }
        
        // 音声合成でも読み上げ
        if (this.capabilities.speechSynthesis && this.selectedVoice) {
            this.speakMessage(message);
        }
        
        console.log(`[MobileAccessibilityManager] アナウンス (${priority}): ${message}`);
    }
    
    /**
     * 音声メッセージ読み上げ
     */
    speakMessage(message) {
        // 既存の読み上げを停止
        this.feedbackSystems.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = this.selectedVoice;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        this.feedbackSystems.speechSynthesis.speak(utterance);
    }
    
    /**
     * ゲーム固有のアナウンス関数群
     */
    announceGameHelp() {
        const helpMessage = `
            BubblePop ゲームへようこそ。
            スペースキーまたはエンターキーでバブルをポップできます。
            Sキーで現在のゲーム状態を確認できます。
            Hキーでヘルプを再生できます。
            矢印キーで画面内を移動できます。
        `;
        this.announceToScreenReader(helpMessage, 'polite');
    }
    
    announceGameStatus() {
        if (!this.gameEngine.scoreManager || !this.gameEngine.playerData) return;
        
        const score = this.gameEngine.scoreManager.getScore();
        const hp = this.gameEngine.playerData.getHP();
        const status = `現在のスコア: ${score}点、残りHP: ${hp}`;
        
        this.announceToScreenReader(status, 'polite');
    }
    
    announceScoreUpdate(points, totalScore) {
        const message = `${points}点獲得。合計スコア: ${totalScore}点`;
        this.announceToScreenReader(message, 'polite');
        this.playAudioBeep('success');
    }
    
    announceHPChange(oldHP, newHP) {
        const change = newHP - oldHP;
        const message = change > 0 ? 
            `HP回復: ${Math.abs(change)}。現在のHP: ${newHP}` :
            `HPダメージ: ${Math.abs(change)}。現在のHP: ${newHP}`;
        
        this.announceToScreenReader(message, 'polite');
        this.playAudioBeep(change > 0 ? 'success' : 'error');
    }
    
    /**
     * 設定関連メソッド
     */
    enableScreenReader() {
        this.accessibilityConfig.screenReader.enabled = true;
        this.announceToScreenReader('スクリーンリーダーサポートが有効になりました', 'assertive');
        this.saveAccessibilitySettings();
    }
    
    disableScreenReader() {
        this.accessibilityConfig.screenReader.enabled = false;
        this.saveAccessibilitySettings();
    }
    
    setColorBlindnessSupport(type) {
        this.accessibilityConfig.visualSupport.colorBlindnessType = type;
        this.applyColorFilter(type);
        this.saveAccessibilitySettings();
    }
    
    applyColorFilter(type) {
        const filter = this.colorSupport.filters.get(type);
        if (filter && type !== 'none') {
            document.body.style.filter = filter.filter;
            this.colorSupport.currentFilter = type;
        } else {
            document.body.style.filter = '';
            this.colorSupport.currentFilter = null;
        }
    }
    
    setFontSize(size) {
        this.accessibilityConfig.visualSupport.fontSize = size;
        this.applyFontSettings();
        this.saveAccessibilitySettings();
    }
    
    applyFontSettings() {
        const sizeMap = {
            small: '0.8em',
            normal: '1em',
            large: '1.2em',
            xlarge: '1.5em'
        };
        
        const size = sizeMap[this.accessibilityConfig.visualSupport.fontSize];
        document.documentElement.style.fontSize = size;
    }
    
    /**
     * 設定の保存と読み込み
     */
    loadAccessibilitySettings() {
        try {
            const saved = localStorage.getItem('bubblepop_accessibility_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.accessibilityConfig = { ...this.accessibilityConfig, ...settings };
            }
        } catch (error) {
            console.warn('[MobileAccessibilityManager] 設定読み込みエラー:', error);
        }
    }
    
    saveAccessibilitySettings() {
        try {
            localStorage.setItem('bubblepop_accessibility_settings', 
                JSON.stringify(this.accessibilityConfig));
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileAccessibilityManager.saveAccessibilitySettings');
        }
    }
    
    applyInitialSettings() {
        this.applyFontSettings();
        this.applyColorFilter(this.accessibilityConfig.visualSupport.colorBlindnessType);
        
        if (this.accessibilityConfig.visualSupport.highContrast) {
            this.applyContrastSettings();
        }
        
        if (this.accessibilityConfig.cognitiveSupport.reducedMotion) {
            this.applyMotionSettings();
        }
    }
    
    applyContrastSettings() {
        if (this.accessibilityConfig.visualSupport.highContrast) {
            document.body.classList.add('high-contrast');
            this.applyColorFilter('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }
    
    applyMotionSettings() {
        if (this.accessibilityConfig.cognitiveSupport.reducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
    }
    
    /**
     * アクセシビリティ統計取得
     */
    getAccessibilityStatistics() {
        return {
            screenReaderEnabled: this.accessibilityConfig.screenReader.enabled,
            colorBlindnessSupport: this.accessibilityConfig.visualSupport.colorBlindnessType,
            currentFilter: this.colorSupport.currentFilter,
            fontSize: this.accessibilityConfig.visualSupport.fontSize,
            capabilities: this.capabilities,
            focusableElementsCount: this.focusManager.focusableElements.length
        };
    }
    
    /**
     * ユーティリティメソッド
     */
    isInteractiveElement(element) {
        const interactiveTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'];
        const interactiveRoles = ['button', 'link', 'menuitem', 'tab'];
        
        return interactiveTags.includes(element.tagName) ||
               interactiveRoles.includes(element.getAttribute('role')) ||
               element.hasAttribute('onclick') ||
               element.classList.contains('interactive');
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        try {
            this.saveAccessibilitySettings();
            
            // 音声合成停止
            if (this.feedbackSystems.speechSynthesis) {
                this.feedbackSystems.speechSynthesis.cancel();
            }
            
            // AudioContext クローズ
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
            }
            
            // ライブリージョン削除
            this.screenReaderState.liveRegions.forEach(region => {
                if (region.parentNode) {
                    region.parentNode.removeChild(region);
                }
            });
            
            console.log('[MobileAccessibilityManager] クリーンアップ完了');
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileAccessibilityManager.cleanup');
        }
    }
}

// シングルトンインスタンス
let mobileAccessibilityManagerInstance = null;

export function getMobileAccessibilityManager(gameEngine = null) {
    if (!mobileAccessibilityManagerInstance && gameEngine) {
        mobileAccessibilityManagerInstance = new MobileAccessibilityManager(gameEngine);
    }
    return mobileAccessibilityManagerInstance;
}

export { MobileAccessibilityManager };