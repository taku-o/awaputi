/**
 * MobileUIUXManager - モバイル向けUI/UX最適化マネージャー
 * モバイル向けUI/UX最適化システムを作成
 * 片手操作モードを実装
 * モバイル向け通知システムを追加
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

class MobileUIUXManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.errorHandler = ErrorHandler.getInstance();
        
        // UI/UX設定
        this.uiConfig = {
            oneHandedMode: {
                enabled: false,
                side: 'right', // 'left' or 'right'
                reachableHeight: 0.75, // 画面の75%
                adaptiveLayout: true,
                thumbReachZone: true
            },
            touchTargets: {
                minSize: 44, // 最小44px×44px
                adaptiveSize: true,
                spacing: 8, // 最小8px間隔
                hoverFeedback: true,
                pressAnimation: true
            },
            notifications: {
                position: 'top-center',
                duration: 3000,
                maxVisible: 3,
                stackable: true,
                swipeToDismiss: true,
                priorities: ['low', 'normal', 'high', 'critical']
            },
            accessibility: {
                fontSize: 'normal', // 'small', 'normal', 'large', 'xlarge'
                contrast: 'normal', // 'normal', 'high'
                reducedMotion: false,
                voiceOver: false,
                screenReader: false
            },
            hapticFeedback: {
                enabled: true,
                intensity: 'medium', // 'light', 'medium', 'heavy'
                patterns: {
                    tap: [10],
                    success: [10, 50, 10],
                    error: [50, 50, 50],
                    warning: [10, 30, 10]
                }
            }
        };
        
        // レイアウト状態
        this.layoutState = {
            orientation: 'portrait',
            screenSize: 'medium',
            safeArea: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            thumbReachArea: null,
            currentBreakpoint: 'mobile'
        };
        
        // UI要素管理
        this.uiElements = {
            buttons: new Map(),
            panels: new Map(),
            overlays: new Map(),
            notifications: []
        };
        
        // 通知システム
        this.notificationQueue = [];
        this.activeNotifications = [];
        
        // フィードバックシステム
        this.feedbackSystem = {
            haptic: null,
            visual: new VisualFeedbackManager(),
            audio: new AudioFeedbackManager()
        };
        
        this.initialize();
    }
    
    /**
     * システム初期化
     */
    initialize() {
        try {
            this.detectDeviceCapabilities();
            this.setupResponsiveBreakpoints();
            this.initializeOneHandedMode();
            this.setupTouchTargetOptimization();
            this.initializeNotificationSystem();
            this.setupHapticFeedback();
            this.setupEventListeners();
            this.loadUISettings();
            
            console.log('[MobileUIUXManager] モバイルUI/UX最適化システム初期化完了');
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileUIUXManager.initialize');
        }
    }
    
    /**
     * デバイス機能検出
     */
    detectDeviceCapabilities() {
        // タッチサポート検出
        this.capabilities = {
            touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            multiTouch: navigator.maxTouchPoints > 1,
            haptics: 'vibrate' in navigator,
            safeArea: CSS.supports('padding-top: env(safe-area-inset-top)'),
            prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            colorGamut: window.matchMedia('(color-gamut: p3)').matches ? 'p3' : 'srgb',
            hdr: window.matchMedia('(dynamic-range: high)').matches
        };
        
        // デバイス情報
        this.deviceInfo = {
            pixelRatio: window.devicePixelRatio || 1,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            orientation: this.getScreenOrientation(),
            platform: this.detectPlatform()
        };
        
        console.log('[MobileUIUXManager] デバイス機能検出完了', this.capabilities);
    }
    
    /**
     * プラットフォーム検出
     */
    detectPlatform() {
        const userAgent = navigator.userAgent;
        if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
        if (/Android/.test(userAgent)) return 'android';
        return 'web';
    }
    
    /**
     * 画面向き取得
     */
    getScreenOrientation() {
        if (screen.orientation) {
            return screen.orientation.angle === 0 || screen.orientation.angle === 180 ? 'portrait' : 'landscape';
        }
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }
    
    /**
     * レスポンシブブレークポイント設定
     */
    setupResponsiveBreakpoints() {
        this.breakpoints = {
            small: 480,   // スマートフォン縦向き
            medium: 768,  // タブレット縦向き
            large: 1024,  // タブレット横向き
            xlarge: 1440  // デスクトップ
        };
        
        this.updateBreakpoint();
    }
    
    /**
     * ブレークポイント更新
     */
    updateBreakpoint() {
        const width = window.innerWidth;
        
        if (width < this.breakpoints.small) {
            this.layoutState.currentBreakpoint = 'xsmall';
            this.layoutState.screenSize = 'small';
        } else if (width < this.breakpoints.medium) {
            this.layoutState.currentBreakpoint = 'small';
            this.layoutState.screenSize = 'small';
        } else if (width < this.breakpoints.large) {
            this.layoutState.currentBreakpoint = 'medium';
            this.layoutState.screenSize = 'medium';
        } else if (width < this.breakpoints.xlarge) {
            this.layoutState.currentBreakpoint = 'large';
            this.layoutState.screenSize = 'large';
        } else {
            this.layoutState.currentBreakpoint = 'xlarge';
            this.layoutState.screenSize = 'xlarge';
        }
        
        this.layoutState.orientation = this.getScreenOrientation();
        this.updateSafeArea();
        
        console.log(`[MobileUIUXManager] ブレークポイント更新: ${this.layoutState.currentBreakpoint}`);
    }
    
    /**
     * セーフエリア更新
     */
    updateSafeArea() {
        if (this.capabilities.safeArea) {
            const computedStyle = getComputedStyle(document.documentElement);
            this.layoutState.safeArea = {
                top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
                right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
                bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
                left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0')
            };
        }
    }
    
    /**
     * 片手操作モード初期化
     */
    initializeOneHandedMode() {
        this.oneHandedMode = {
            overlay: null,
            reachabilityZone: null,
            enabled: this.uiConfig.oneHandedMode.enabled
        };
        
        if (this.oneHandedMode.enabled) {
            this.enableOneHandedMode();
        }
    }
    
    /**
     * 片手操作モード有効化
     */
    enableOneHandedMode() {
        try {
            this.calculateThumbReachArea();
            this.createOneHandedOverlay();
            this.adaptUIForOneHanded();
            this.uiConfig.oneHandedMode.enabled = true;
            
            console.log('[MobileUIUXManager] 片手操作モード有効化');
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileUIUXManager.enableOneHandedMode');
        }
    }
    
    /**
     * 片手操作モード無効化
     */
    disableOneHandedMode() {
        try {
            this.removeOneHandedOverlay();
            this.resetUILayout();
            this.uiConfig.oneHandedMode.enabled = false;
            
            console.log('[MobileUIUXManager] 片手操作モード無効化');
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileUIUXManager.disableOneHandedMode');
        }
    }
    
    /**
     * 親指到達エリア計算
     */
    calculateThumbReachArea() {
        const screenHeight = window.innerHeight;
        const reachableHeight = screenHeight * this.uiConfig.oneHandedMode.reachableHeight;
        const isRightHanded = this.uiConfig.oneHandedMode.side === 'right';
        
        this.layoutState.thumbReachArea = {
            top: screenHeight - reachableHeight,
            bottom: screenHeight,
            left: isRightHanded ? 0 : window.innerWidth * 0.3,
            right: isRightHanded ? window.innerWidth * 0.7 : window.innerWidth,
            centerX: isRightHanded ? window.innerWidth * 0.85 : window.innerWidth * 0.15,
            centerY: screenHeight * 0.85
        };
    }
    
    /**
     * 片手操作オーバーレイ作成
     */
    createOneHandedOverlay() {
        if (this.oneHandedMode.overlay) return;
        
        this.oneHandedMode.overlay = document.createElement('div');
        this.oneHandedMode.overlay.className = 'one-handed-overlay';
        this.oneHandedMode.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
            transition: opacity 0.3s ease;
        `;
        
        // 到達エリア表示
        if (this.uiConfig.oneHandedMode.thumbReachZone) {
            this.createThumbReachIndicator();
        }
        
        document.body.appendChild(this.oneHandedMode.overlay);
    }
    
    /**
     * 親指到達インジケーター作成
     */
    createThumbReachIndicator() {
        const indicator = document.createElement('div');
        const reach = this.layoutState.thumbReachArea;
        
        indicator.className = 'thumb-reach-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: ${reach.top}px;
            left: ${reach.left}px;
            width: ${reach.right - reach.left}px;
            height: ${reach.bottom - reach.top}px;
            background: radial-gradient(
                ellipse at ${reach.centerX - reach.left}px ${reach.centerY - reach.top}px,
                rgba(0, 255, 0, 0.1) 0%,
                rgba(0, 255, 0, 0.05) 70%,
                transparent 100%
            );
            border: 2px solid rgba(0, 255, 0, 0.3);
            border-radius: 50px;
            opacity: 0.6;
        `;
        
        this.oneHandedMode.overlay.appendChild(indicator);
    }
    
    /**
     * 片手操作用UI適用
     */
    adaptUIForOneHanded() {
        // UI要素を到達可能エリアに移動
        this.repositionUIElements();
        
        // タッチターゲットサイズ調整
        this.adjustTouchTargetsForOneHanded();
        
        // ナビゲーション位置調整
        this.adjustNavigationForOneHanded();
    }
    
    /**
     * UI要素再配置
     */
    repositionUIElements() {
        const reach = this.layoutState.thumbReachArea;
        
        // ゲームUI要素の調整
        const gameUI = document.getElementById('gameUI');
        if (gameUI) {
            gameUI.style.transform = `translateY(${Math.max(0, reach.top - 20)}px)`;
        }
        
        // 重要なボタンを到達可能エリアに配置
        this.uiElements.buttons.forEach((button, id) => {
            if (button.priority === 'high') {
                this.moveToReachableArea(button.element);
            }
        });
    }
    
    /**
     * 要素を到達可能エリアに移動
     */
    moveToReachableArea(element) {
        const reach = this.layoutState.thumbReachArea;
        const rect = element.getBoundingClientRect();
        
        // 現在位置が到達範囲外の場合、移動
        if (rect.top < reach.top || rect.bottom > reach.bottom ||
            rect.left < reach.left || rect.right > reach.right) {
            
            element.style.transition = 'transform 0.3s ease';
            element.style.transform = `translate(${reach.centerX - rect.width/2}px, ${reach.centerY - rect.height/2}px)`;
        }
    }
    
    /**
     * 片手操作用タッチターゲット調整
     */
    adjustTouchTargetsForOneHanded() {
        // タッチターゲットサイズを10%拡大
        const sizeMultiplier = 1.1;
        
        this.uiElements.buttons.forEach(button => {
            const element = button.element;
            const currentSize = parseInt(getComputedStyle(element).minWidth) || this.uiConfig.touchTargets.minSize;
            const newSize = Math.max(currentSize * sizeMultiplier, this.uiConfig.touchTargets.minSize);
            
            element.style.minWidth = `${newSize}px`;
            element.style.minHeight = `${newSize}px`;
        });
    }
    
    /**
     * 片手操作用ナビゲーション調整
     */
    adjustNavigationForOneHanded() {
        // ナビゲーションを画面下部に配置
        const navigation = document.querySelector('.game-navigation');
        if (navigation) {
            navigation.style.position = 'fixed';
            navigation.style.bottom = `${this.layoutState.safeArea.bottom + 10}px`;
            navigation.style.left = '50%';
            navigation.style.transform = 'translateX(-50%)';
        }
    }
    
    /**
     * タッチターゲット最適化設定
     */
    setupTouchTargetOptimization() {
        // CSSカスタムプロパティ設定
        this.updateTouchTargetCSS();
        
        // タッチフィードバック設定
        this.setupTouchFeedback();
    }
    
    /**
     * タッチターゲットCSS更新
     */
    updateTouchTargetCSS() {
        const root = document.documentElement;
        root.style.setProperty('--touch-target-min-size', `${this.uiConfig.touchTargets.minSize}px`);
        root.style.setProperty('--touch-target-spacing', `${this.uiConfig.touchTargets.spacing}px`);
        
        // 動的サイズ調整
        if (this.uiConfig.touchTargets.adaptiveSize) {
            const scaleFactor = Math.max(1, this.deviceInfo.pixelRatio * 0.8);
            const adaptiveSize = this.uiConfig.touchTargets.minSize * scaleFactor;
            root.style.setProperty('--touch-target-adaptive-size', `${adaptiveSize}px`);
        }
    }
    
    /**
     * タッチフィードバック設定
     */
    setupTouchFeedback() {
        document.addEventListener('touchstart', (e) => {
            this.handleTouchFeedback(e.target, 'start');
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            this.handleTouchFeedback(e.target, 'end');
        }, { passive: true });
    }
    
    /**
     * タッチフィードバック処理
     */
    handleTouchFeedback(target, phase) {
        if (!this.isInteractiveElement(target)) return;
        
        if (phase === 'start') {
            // プレスアニメーション
            if (this.uiConfig.touchTargets.pressAnimation) {
                target.style.transform = 'scale(0.95)';
                target.style.transition = 'transform 0.1s ease';
            }
            
            // ハプティックフィードバック
            this.triggerHapticFeedback('tap');
            
            // 視覚フィードバック
            this.feedbackSystem.visual.showTouchFeedback(target);
            
        } else if (phase === 'end') {
            // アニメーションリセット
            setTimeout(() => {
                target.style.transform = '';
            }, 100);
        }
    }
    
    /**
     * インタラクティブ要素判定
     */
    isInteractiveElement(element) {
        const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
        const interactiveRoles = ['button', 'link', 'menuitem', 'tab'];
        
        return interactiveTags.includes(element.tagName) ||
               interactiveRoles.includes(element.getAttribute('role')) ||
               element.hasAttribute('onclick') ||
               element.classList.contains('interactive');
    }
    
    /**
     * 通知システム初期化
     */
    initializeNotificationSystem() {
        this.createNotificationContainer();
        this.setupNotificationStyles();
    }
    
    /**
     * 通知コンテナ作成
     */
    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'mobile-notification-container';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: ${this.layoutState.safeArea.top + 10}px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 400px;
            z-index: 10000;
            pointer-events: none;
        `;
        
        document.body.appendChild(this.notificationContainer);
    }
    
    /**
     * 通知スタイル設定
     */
    setupNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .mobile-notification {
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 12px 16px;
                border-radius: 12px;
                margin-bottom: 8px;
                font-size: 14px;
                line-height: 1.4;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                transform: translateY(-100px);
                opacity: 0;
                transition: all 0.3s ease;
                pointer-events: auto;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }
            
            .mobile-notification.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .mobile-notification.success {
                background: rgba(76, 175, 80, 0.9);
                border-left: 4px solid #4CAF50;
            }
            
            .mobile-notification.error {
                background: rgba(244, 67, 54, 0.9);
                border-left: 4px solid #f44336;
            }
            
            .mobile-notification.warning {
                background: rgba(255, 152, 0, 0.9);
                border-left: 4px solid #ff9800;
            }
            
            .mobile-notification.info {
                background: rgba(33, 150, 243, 0.9);
                border-left: 4px solid #2196f3;
            }
            
            .mobile-notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                transition: width linear;
            }
            
            .mobile-notification-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @media (max-width: 480px) {
                .mobile-notification {
                    font-size: 13px;
                    padding: 10px 14px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 通知表示
     */
    showNotification(message, options = {}) {
        const notification = {
            id: Date.now() + Math.random(),
            message: message,
            type: options.type || 'info',
            duration: options.duration || this.uiConfig.notifications.duration,
            priority: options.priority || 'normal',
            actions: options.actions || [],
            dismissible: options.dismissible !== false,
            persistent: options.persistent || false
        };
        
        if (this.activeNotifications.length >= this.uiConfig.notifications.maxVisible) {
            this.notificationQueue.push(notification);
        } else {
            this.displayNotification(notification);
        }
        
        return notification.id;
    }
    
    /**
     * 通知要素作成・表示
     */
    displayNotification(notification) {
        const element = document.createElement('div');
        element.className = `mobile-notification ${notification.type}`;
        element.setAttribute('data-notification-id', notification.id);
        
        // メッセージ
        const messageElement = document.createElement('div');
        messageElement.textContent = notification.message;
        element.appendChild(messageElement);
        
        // 閉じるボタン
        if (notification.dismissible) {
            const closeButton = document.createElement('button');
            closeButton.className = 'mobile-notification-close';
            closeButton.innerHTML = '×';
            closeButton.onclick = () => this.dismissNotification(notification.id);
            element.appendChild(closeButton);
        }
        
        // プログレスバー
        if (!notification.persistent) {
            const progressBar = document.createElement('div');
            progressBar.className = 'mobile-notification-progress';
            progressBar.style.width = '100%';
            element.appendChild(progressBar);
            
            // プログレス更新
            setTimeout(() => {
                progressBar.style.width = '0%';
                progressBar.style.transitionDuration = `${notification.duration}ms`;
            }, 100);
        }
        
        // スワイプ操作
        this.setupNotificationSwipe(element, notification);
        
        // DOM追加
        this.notificationContainer.appendChild(element);
        this.activeNotifications.push({ ...notification, element });
        
        // 表示アニメーション
        setTimeout(() => {
            element.classList.add('show');
        }, 50);
        
        // 自動削除
        if (!notification.persistent) {
            setTimeout(() => {
                this.dismissNotification(notification.id);
            }, notification.duration);
        }
        
        // ハプティックフィードバック
        this.triggerHapticFeedback(notification.type);
        
        console.log(`[MobileUIUXManager] 通知表示: ${notification.type} - ${notification.message}`);
    }
    
    /**
     * 通知スワイプ操作設定
     */
    setupNotificationSwipe(element, notification) {
        if (!this.uiConfig.notifications.swipeToDismiss) return;
        
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            element.style.transition = 'none';
        }, { passive: true });
        
        element.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;
            const opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 200);
            
            element.style.transform = `translateX(${deltaX}px)`;
            element.style.opacity = opacity;
        }, { passive: true });
        
        element.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            isDragging = false;
            const deltaX = currentX - startX;
            
            if (Math.abs(deltaX) > 100) {
                // スワイプで削除
                element.style.transition = 'all 0.3s ease';
                element.style.transform = `translateX(${deltaX > 0 ? '100%' : '-100%'})`;
                element.style.opacity = '0';
                
                setTimeout(() => {
                    this.dismissNotification(notification.id);
                }, 300);
            } else {
                // 元の位置に戻す
                element.style.transition = 'all 0.3s ease';
                element.style.transform = 'translateX(0)';
                element.style.opacity = '1';
            }
        }, { passive: true });
    }
    
    /**
     * 通知削除
     */
    dismissNotification(notificationId) {
        const index = this.activeNotifications.findIndex(n => n.id === notificationId);
        if (index === -1) return;
        
        const notification = this.activeNotifications[index];
        
        // 非表示アニメーション
        notification.element.classList.remove('show');
        
        setTimeout(() => {
            // DOM削除
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            
            // リストから削除
            this.activeNotifications.splice(index, 1);
            
            // キューから次の通知を表示
            if (this.notificationQueue.length > 0) {
                const nextNotification = this.notificationQueue.shift();
                this.displayNotification(nextNotification);
            }
        }, 300);
    }
    
    /**
     * 全通知削除
     */
    dismissAllNotifications() {
        this.activeNotifications.forEach(notification => {
            this.dismissNotification(notification.id);
        });
        this.notificationQueue = [];
    }
    
    /**
     * ハプティックフィードバック設定
     */
    setupHapticFeedback() {
        if (!this.capabilities.haptics) return;
        
        this.feedbackSystem.haptic = {
            vibrate: (pattern) => {
                if (this.uiConfig.hapticFeedback.enabled && navigator.vibrate) {
                    navigator.vibrate(pattern);
                }
            }
        };
    }
    
    /**
     * ハプティックフィードバック実行
     */
    triggerHapticFeedback(type) {
        if (!this.feedbackSystem.haptic || !this.uiConfig.hapticFeedback.enabled) return;
        
        const pattern = this.uiConfig.hapticFeedback.patterns[type];
        if (pattern) {
            this.feedbackSystem.haptic.vibrate(pattern);
        }
    }
    
    /**
     * イベントリスナー設定
     */
    setupEventListeners() {
        // 画面向き変更
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // ウィンドウサイズ変更
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // 可視性変更
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // キーボード表示/非表示（モバイル）
        if (this.deviceInfo.platform !== 'web') {
            this.setupVirtualKeyboardDetection();
        }
    }
    
    /**
     * 仮想キーボード検出設定
     */
    setupVirtualKeyboardDetection() {
        let initialViewportHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            if (heightDifference > 150) {
                // キーボード表示
                this.handleVirtualKeyboardShow(heightDifference);
            } else {
                // キーボード非表示
                this.handleVirtualKeyboardHide();
            }
        });
    }
    
    /**
     * 仮想キーボード表示処理
     */
    handleVirtualKeyboardShow(keyboardHeight) {
        document.body.classList.add('keyboard-visible');
        document.body.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
        
        // 通知位置調整
        if (this.notificationContainer) {
            this.notificationContainer.style.top = '10px';
        }
        
        console.log('[MobileUIUXManager] 仮想キーボード表示検出');
    }
    
    /**
     * 仮想キーボード非表示処理
     */
    handleVirtualKeyboardHide() {
        document.body.classList.remove('keyboard-visible');
        document.body.style.removeProperty('--keyboard-height');
        
        // 通知位置復元
        if (this.notificationContainer) {
            this.notificationContainer.style.top = `${this.layoutState.safeArea.top + 10}px`;
        }
        
        console.log('[MobileUIUXManager] 仮想キーボード非表示検出');
    }
    
    /**
     * 画面向き変更処理
     */
    handleOrientationChange() {
        try {
            this.updateBreakpoint();
            this.detectDeviceCapabilities();
            
            if (this.uiConfig.oneHandedMode.enabled) {
                this.calculateThumbReachArea();
                this.adaptUIForOneHanded();
            }
            
            // 通知コンテナ位置更新
            if (this.notificationContainer) {
                this.notificationContainer.style.top = `${this.layoutState.safeArea.top + 10}px`;
            }
            
            console.log('[MobileUIUXManager] 画面向き変更処理完了');
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileUIUXManager.handleOrientationChange');
        }
    }
    
    /**
     * ウィンドウサイズ変更処理
     */
    handleResize() {
        try {
            this.updateBreakpoint();
            this.updateTouchTargetCSS();
            
            if (this.uiConfig.oneHandedMode.enabled) {
                this.calculateThumbReachArea();
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileUIUXManager.handleResize');
        }
    }
    
    /**
     * 可視性変更処理
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // バックグラウンド移行時は通知を一時停止
            this.pauseNotifications();
        } else {
            // フォアグラウンド復帰時は通知を再開
            this.resumeNotifications();
        }
    }
    
    /**
     * 通知一時停止
     */
    pauseNotifications() {
        this.notificationsPaused = true;
    }
    
    /**
     * 通知再開
     */
    resumeNotifications() {
        this.notificationsPaused = false;
        
        // キューにある通知を処理
        while (this.notificationQueue.length > 0 && 
               this.activeNotifications.length < this.uiConfig.notifications.maxVisible) {
            const notification = this.notificationQueue.shift();
            this.displayNotification(notification);
        }
    }
    
    /**
     * UI設定読み込み
     */
    loadUISettings() {
        try {
            const savedSettings = localStorage.getItem('bubblepop_mobile_ui_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.uiConfig = { ...this.uiConfig, ...settings };
            }
        } catch (error) {
            console.warn('[MobileUIUXManager] UI設定読み込みエラー:', error);
        }
    }
    
    /**
     * UI設定保存
     */
    saveUISettings() {
        try {
            localStorage.setItem('bubblepop_mobile_ui_settings', JSON.stringify(this.uiConfig));
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileUIUXManager.saveUISettings');
        }
    }
    
    /**
     * 片手操作モード切り替え
     */
    toggleOneHandedMode() {
        if (this.uiConfig.oneHandedMode.enabled) {
            this.disableOneHandedMode();
        } else {
            this.enableOneHandedMode();
        }
        this.saveUISettings();
    }
    
    /**
     * アクセシビリティ設定適用
     */
    applyAccessibilitySettings() {
        const root = document.documentElement;
        
        // フォントサイズ
        const fontSizeMap = {
            small: '0.9em',
            normal: '1em',
            large: '1.2em',
            xlarge: '1.4em'
        };
        root.style.setProperty('--font-size-base', fontSizeMap[this.uiConfig.accessibility.fontSize]);
        
        // コントラスト
        if (this.uiConfig.accessibility.contrast === 'high') {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        
        // モーション削減
        if (this.uiConfig.accessibility.reducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
    }
    
    /**
     * UI統計取得
     */
    getUIStatistics() {
        return {
            oneHandedModeEnabled: this.uiConfig.oneHandedMode.enabled,
            currentBreakpoint: this.layoutState.currentBreakpoint,
            activeNotifications: this.activeNotifications.length,
            queuedNotifications: this.notificationQueue.length,
            deviceCapabilities: this.capabilities,
            layoutState: this.layoutState
        };
    }
    
    /**
     * UI要素登録
     */
    registerUIElement(id, element, options = {}) {
        this.uiElements.buttons.set(id, {
            element: element,
            priority: options.priority || 'normal',
            type: options.type || 'button',
            touchTarget: options.touchTarget !== false
        });
        
        // タッチターゲット最適化適用
        if (options.touchTarget !== false) {
            this.optimizeElementForTouch(element);
        }
    }
    
    /**
     * 要素タッチ最適化
     */
    optimizeElementForTouch(element) {
        element.style.minWidth = `${this.uiConfig.touchTargets.minSize}px`;
        element.style.minHeight = `${this.uiConfig.touchTargets.minSize}px`;
        element.style.padding = `${this.uiConfig.touchTargets.spacing}px`;
        
        // タッチフィードバック有効化
        element.classList.add('touch-optimized');
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        try {
            this.dismissAllNotifications();
            this.disableOneHandedMode();
            this.saveUISettings();
            
            // DOM要素削除
            if (this.notificationContainer && this.notificationContainer.parentNode) {
                this.notificationContainer.parentNode.removeChild(this.notificationContainer);
            }
            
            console.log('[MobileUIUXManager] クリーンアップ完了');
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileUIUXManager.cleanup');
        }
    }
}

/**
 * 視覚フィードバックマネージャー
 */
class VisualFeedbackManager {
    showTouchFeedback(element) {
        // タッチリップル効果
        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
}

/**
 * 音声フィードバックマネージャー
 */
class AudioFeedbackManager {
    constructor() {
        this.sounds = new Map();
        this.enabled = true;
    }
    
    playFeedback(type) {
        if (!this.enabled) return;
        
        // 音声フィードバック実装（オプション）
        console.log(`[AudioFeedbackManager] 音声フィードバック: ${type}`);
    }
}

// シングルトンインスタンス
let mobileUIUXManagerInstance = null;

export function getMobileUIUXManager(gameEngine = null) {
    if (!mobileUIUXManagerInstance && gameEngine) {
        mobileUIUXManagerInstance = new MobileUIUXManager(gameEngine);
    }
    return mobileUIUXManagerInstance;
}

export { MobileUIUXManager };