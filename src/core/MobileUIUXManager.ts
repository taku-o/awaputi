/**
 * MobileUIUXManager - モバイル向けUI/UX最適化マネージャー
 * モバイル向けUI/UX最適化システムを作成
 * 片手操作モードを実装
 * モバイル向け通知システムを追加
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

interface UIConfig {
    oneHandedMode: {
        enabled: boolean;
        side: 'left' | 'right';
        reachableHeight: number;
        adaptiveLayout: boolean;
        thumbReachZone: boolean;
    };
    touchTargets: {
        minSize: number;
        adaptiveSize: boolean;
        spacing: number;
        hoverFeedback: boolean;
        pressAnimation: boolean;
    };
    notifications: {
        position: string;
        duration: number;
        maxVisible: number;
        stackable: boolean;
        swipeToDismiss: boolean;
        priorities: string[];
    };
    accessibility: {
        fontSize: 'small' | 'normal' | 'large' | 'xlarge';
        contrast: 'normal' | 'high';
        reducedMotion: boolean;
        voiceOver: boolean;
        screenReader: boolean;
    };
    hapticFeedback: {
        enabled: boolean;
        intensity: 'light' | 'medium' | 'heavy';
        patterns: {
            tap: number[];
            success: number[];
            error: number[];
            warning: number[];
        };
    };
}

interface LayoutState {
    orientation: 'portrait' | 'landscape';
    screenSize: 'small' | 'medium' | 'large';
    safeArea: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    thumbReachArea: DOMRect | null;
    currentBreakpoint: string;
}

interface UIElements {
    buttons: Map<string, HTMLElement>;
    panels: Map<string, HTMLElement>;
    overlays: Map<string, HTMLElement>;
    notifications: any[];
}

interface NotificationData {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
    duration?: number;
    actions?: Array<{
        label: string;
        action: () => void;
    }>;
    timestamp: number;
}

interface DeviceCapabilities {
    touch: boolean;
    multiTouch: boolean;
    haptic: boolean;
    orientation: boolean;
    devicePixelRatio: number;
    maxTouchPoints: number;
    screenSize: {
        width: number;
        height: number;
        diagonal: number;
    };
}

export class MobileUIUXManager {
    private gameEngine: any;
    private errorHandler: any;
    private config: UIConfig;
    private layoutState: LayoutState;
    private uiElements: UIElements;
    private notificationQueue: NotificationData[];
    private activeNotifications: NotificationData[];
    private feedbackSystem: any;
    private deviceCapabilities: DeviceCapabilities;

    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        this.errorHandler = ErrorHandler.getInstance();
        
        // 設定
        this.config = {
            oneHandedMode: {
                enabled: false,
                side: 'right',
                reachableHeight: 0.75,
                adaptiveLayout: true,
                thumbReachZone: true
            },
            touchTargets: {
                minSize: 44,
                adaptiveSize: true,
                spacing: 8,
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
                fontSize: 'normal',
                contrast: 'normal',
                reducedMotion: false,
                voiceOver: false,
                screenReader: false
            },
            hapticFeedback: {
                enabled: true,
                intensity: 'medium',
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
            visual: null,
            audio: null
        };
        
        // デバイス機能
        this.deviceCapabilities = {
            touch: false,
            multiTouch: false,
            haptic: false,
            orientation: false,
            devicePixelRatio: 1,
            maxTouchPoints: 0,
            screenSize: {
                width: 0,
                height: 0,
                diagonal: 0
            }
        };
        
        this.initialize();
    }
    
    /**
     * システム初期化
     */
    private initialize(): void {
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
    private detectDeviceCapabilities(): void {
        this.deviceCapabilities = {
            touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            multiTouch: navigator.maxTouchPoints > 1,
            haptic: 'vibrate' in navigator,
            orientation: 'orientation' in window || 'onorientationchange' in window,
            devicePixelRatio: window.devicePixelRatio || 1,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight,
                diagonal: Math.sqrt(
                    Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)
                ) / this.deviceCapabilities?.devicePixelRatio || 1
            }
        };

        // 画面サイズの分類
        const diagonal = this.deviceCapabilities.screenSize.diagonal;
        if (diagonal < 5) {
            this.layoutState.screenSize = 'small';
        } else if (diagonal < 7) {
            this.layoutState.screenSize = 'medium';
        } else {
            this.layoutState.screenSize = 'large';
        }

        console.log('[MobileUIUXManager] デバイス機能検出完了:', this.deviceCapabilities);
    }

    /**
     * レスポンシブブレークポイントの設定
     */
    private setupResponsiveBreakpoints(): void {
        const width = window.innerWidth;
        
        if (width < 480) {
            this.layoutState.currentBreakpoint = 'mobile';
        } else if (width < 768) {
            this.layoutState.currentBreakpoint = 'mobile-large';
        } else if (width < 1024) {
            this.layoutState.currentBreakpoint = 'tablet';
        } else {
            this.layoutState.currentBreakpoint = 'desktop';
        }

        // セーフエリアの検出
        this.detectSafeArea();
        
        console.log(`[MobileUIUXManager] ブレークポイント設定: ${this.layoutState.currentBreakpoint}`);
    }

    /**
     * セーフエリアの検出
     */
    private detectSafeArea(): void {
        const style = getComputedStyle(document.documentElement);
        
        this.layoutState.safeArea = {
            top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
            right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
            bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
            left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
        };
    }

    /**
     * 片手操作モードの初期化
     */
    private initializeOneHandedMode(): void {
        if (!this.config.oneHandedMode.enabled) return;

        // 親指到達エリアの計算
        this.calculateThumbReachArea();
        
        // UI要素の再配置
        this.applyOneHandedLayout();
        
        console.log('[MobileUIUXManager] 片手操作モード初期化完了');
    }

    /**
     * 親指到達エリアの計算
     */
    private calculateThumbReachArea(): void {
        const screenHeight = window.innerHeight;
        const reachableHeight = screenHeight * this.config.oneHandedMode.reachableHeight;
        const side = this.config.oneHandedMode.side;
        
        const thumbReach = {
            x: side === 'right' ? window.innerWidth * 0.7 : window.innerWidth * 0.3,
            y: screenHeight - reachableHeight,
            width: window.innerWidth * 0.3,
            height: reachableHeight
        };
        
        this.layoutState.thumbReachArea = new DOMRect(
            thumbReach.x,
            thumbReach.y,
            thumbReach.width,
            thumbReach.height
        );
    }

    /**
     * 片手操作レイアウトの適用
     */
    private applyOneHandedLayout(): void {
        const rootElement = document.documentElement;
        const side = this.config.oneHandedMode.side;
        
        rootElement.classList.add('one-handed-mode');
        rootElement.classList.add(`one-handed-${side}`);
        
        // CSS カスタムプロパティの設定
        rootElement.style.setProperty('--thumb-reach-height', 
            `${this.config.oneHandedMode.reachableHeight * 100}%`);
        rootElement.style.setProperty('--thumb-side', side);
    }

    /**
     * タッチターゲット最適化の設定
     */
    private setupTouchTargetOptimization(): void {
        const minSize = this.config.touchTargets.minSize;
        const spacing = this.config.touchTargets.spacing;
        
        // CSS カスタムプロパティの設定
        document.documentElement.style.setProperty('--touch-target-min-size', `${minSize}px`);
        document.documentElement.style.setProperty('--touch-target-spacing', `${spacing}px`);
        
        // 動的サイズ調整が有効な場合
        if (this.config.touchTargets.adaptiveSize) {
            this.applyAdaptiveTouchTargets();
        }
        
        console.log('[MobileUIUXManager] タッチターゲット最適化設定完了');
    }

    /**
     * アダプティブタッチターゲットの適用
     */
    private applyAdaptiveTouchTargets(): void {
        // デバイスサイズに基づいてタッチターゲットサイズを調整
        const baseSize = this.config.touchTargets.minSize;
        let scaleFactor = 1;
        
        switch (this.layoutState.screenSize) {
            case 'small':
                scaleFactor = 0.9;
                break;
            case 'medium':
                scaleFactor = 1.0;
                break;
            case 'large':
                scaleFactor = 1.1;
                break;
        }
        
        const adaptiveSize = Math.round(baseSize * scaleFactor);
        document.documentElement.style.setProperty('--adaptive-touch-size', `${adaptiveSize}px`);
    }

    /**
     * 通知システムの初期化
     */
    private initializeNotificationSystem(): void {
        // 通知コンテナの作成
        this.createNotificationContainer();
        
        // 通知処理の開始
        this.startNotificationProcessor();
        
        console.log('[MobileUIUXManager] 通知システム初期化完了');
    }

    /**
     * 通知コンテナの作成
     */
    private createNotificationContainer(): void {
        const container = document.createElement('div');
        container.id = 'mobile-notification-container';
        container.className = `notification-container ${this.config.notifications.position}`;
        
        container.style.cssText = `
            position: fixed;
            z-index: 10000;
            pointer-events: none;
            max-width: 90vw;
            width: 100%;
            box-sizing: border-box;
        `;
        
        // 位置の設定
        this.setNotificationPosition(container);
        
        document.body.appendChild(container);
    }

    /**
     * 通知位置の設定
     */
    private setNotificationPosition(container: HTMLElement): void {
        const position = this.config.notifications.position;
        const safeArea = this.layoutState.safeArea;
        
        switch (position) {
            case 'top-center':
                container.style.top = `${safeArea.top + 20}px`;
                container.style.left = '50%';
                container.style.transform = 'translateX(-50%)';
                break;
                
            case 'top-left':
                container.style.top = `${safeArea.top + 20}px`;
                container.style.left = `${safeArea.left + 20}px`;
                break;
                
            case 'top-right':
                container.style.top = `${safeArea.top + 20}px`;
                container.style.right = `${safeArea.right + 20}px`;
                break;
                
            case 'bottom-center':
                container.style.bottom = `${safeArea.bottom + 20}px`;
                container.style.left = '50%';
                container.style.transform = 'translateX(-50%)';
                break;
                
            case 'center':
                container.style.top = '50%';
                container.style.left = '50%';
                container.style.transform = 'translate(-50%, -50%)';
                break;
                
            default:
                // デフォルトはトップセンター
                container.style.top = `${safeArea.top + 20}px`;
                container.style.left = '50%';
                container.style.transform = 'translateX(-50%)';
        }
    }

    /**
     * 通知処理の開始
     */
    private startNotificationProcessor(): void {
        setInterval(() => {
            this.processNotificationQueue();
        }, 100);
    }

    /**
     * 通知キューの処理
     */
    private processNotificationQueue(): void {
        if (this.notificationQueue.length === 0) return;
        if (this.activeNotifications.length >= this.config.notifications.maxVisible) return;
        
        // 優先度順でソート
        this.notificationQueue.sort((a, b) => {
            const priorities = { critical: 4, high: 3, normal: 2, low: 1 };
            return priorities[b.priority] - priorities[a.priority];
        });
        
        const notification = this.notificationQueue.shift();
        if (notification) {
            this.displayNotification(notification);
        }
    }

    /**
     * 通知の表示
     */
    private displayNotification(notification: NotificationData): void {
        const element = this.createNotificationElement(notification);
        const container = document.getElementById('mobile-notification-container');
        
        if (!container) return;
        
        container.appendChild(element);
        this.activeNotifications.push(notification);
        
        // アニメーション
        requestAnimationFrame(() => {
            element.classList.add('show');
        });
        
        // 自動削除
        const duration = notification.duration || this.config.notifications.duration;
        setTimeout(() => {
            this.dismissNotification(notification.id);
        }, duration);
        
        // ハプティックフィードバック
        this.triggerHapticFeedback(notification.type);
    }

    /**
     * 通知要素の作成
     */
    private createNotificationElement(notification: NotificationData): HTMLElement {
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.dataset.notificationId = notification.id;
        
        element.style.cssText = `
            background: var(--notification-bg, #fff);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin: 8px 0;
            padding: 16px;
            pointer-events: auto;
            transform: translateY(-100%);
            opacity: 0;
            transition: all 0.3s ease;
            max-width: 300px;
            position: relative;
        `;
        
        // コンテンツの作成
        const content = `
            <div class="notification-header">
                <div class="notification-title">${notification.title}</div>
                <button class="notification-close" onclick="this.closest('.notification').remove()">×</button>
            </div>
            <div class="notification-message">${notification.message}</div>
            ${notification.actions ? this.createNotificationActions(notification.actions) : ''}
        `;
        
        element.innerHTML = content;
        
        // スワイプで削除
        if (this.config.notifications.swipeToDismiss) {
            this.setupSwipeToDismiss(element, notification.id);
        }
        
        return element;
    }

    /**
     * 通知アクションの作成
     */
    private createNotificationActions(actions: Array<{ label: string; action: () => void }>): string {
        const actionElements = actions.map((action, index) => 
            `<button class="notification-action" data-action="${index}">${action.label}</button>`
        ).join('');
        
        return `<div class="notification-actions">${actionElements}</div>`;
    }

    /**
     * スワイプで削除の設定
     */
    private setupSwipeToDismiss(element: HTMLElement, notificationId: string): void {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            element.style.transition = 'none';
        });
        
        element.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;
            
            element.style.transform = `translateX(${deltaX}px)`;
            element.style.opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 200).toString();
        });
        
        element.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const deltaX = currentX - startX;
            isDragging = false;
            
            element.style.transition = 'all 0.3s ease';
            
            if (Math.abs(deltaX) > 100) {
                // スワイプで削除
                element.style.transform = `translateX(${deltaX > 0 ? '100%' : '-100%'})`;
                element.style.opacity = '0';
                setTimeout(() => {
                    this.dismissNotification(notificationId);
                }, 300);
            } else {
                // 元の位置に戻す
                element.style.transform = 'translateX(0)';
                element.style.opacity = '1';
            }
        });
    }

    /**
     * ハプティックフィードバックの設定
     */
    private setupHapticFeedback(): void {
        if (!this.config.hapticFeedback.enabled || !this.deviceCapabilities.haptic) {
            return;
        }
        
        this.feedbackSystem.haptic = {
            vibrate: (pattern: number[]) => {
                if (navigator.vibrate) {
                    navigator.vibrate(pattern);
                }
            }
        };
        
        console.log('[MobileUIUXManager] ハプティックフィードバック設定完了');
    }

    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void {
        // 画面向き変更
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // ウィンドウリサイズ
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
        
        // タッチイベント
        if (this.deviceCapabilities.touch) {
            document.addEventListener('touchstart', (e) => {
                this.handleTouchStart(e);
            });
        }
        
        console.log('[MobileUIUXManager] イベントリスナー設定完了');
    }

    /**
     * UI設定の読み込み
     */
    private loadUISettings(): void {
        try {
            const savedSettings = localStorage.getItem('mobile-ui-settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.config = { ...this.config, ...settings };
            }
        } catch (error) {
            console.warn('[MobileUIUXManager] UI設定の読み込みに失敗:', error);
        }
    }

    // ========================================
    // 公開API
    // ========================================

    /**
     * 通知の表示
     */
    public showNotification(notification: Omit<NotificationData, 'id' | 'timestamp'>): string {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const fullNotification: NotificationData = {
            ...notification,
            id,
            timestamp: Date.now()
        };
        
        this.notificationQueue.push(fullNotification);
        
        return id;
    }

    /**
     * 通知の削除
     */
    public dismissNotification(notificationId: string): void {
        const element = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (element) {
            element.classList.remove('show');
            setTimeout(() => {
                element.remove();
            }, 300);
        }
        
        this.activeNotifications = this.activeNotifications.filter(n => n.id !== notificationId);
    }

    /**
     * 全通知の削除
     */
    public dismissAllNotifications(): void {
        this.activeNotifications.forEach(notification => {
            this.dismissNotification(notification.id);
        });
        
        this.notificationQueue.length = 0;
    }

    /**
     * 片手操作モードの切り替え
     */
    public toggleOneHandedMode(): void {
        this.config.oneHandedMode.enabled = !this.config.oneHandedMode.enabled;
        
        if (this.config.oneHandedMode.enabled) {
            this.initializeOneHandedMode();
        } else {
            this.disableOneHandedMode();
        }
        
        this.saveUISettings();
    }

    /**
     * 片手操作モードの無効化
     */
    private disableOneHandedMode(): void {
        const rootElement = document.documentElement;
        rootElement.classList.remove('one-handed-mode', 'one-handed-left', 'one-handed-right');
        
        // CSS カスタムプロパティのリセット
        rootElement.style.removeProperty('--thumb-reach-height');
        rootElement.style.removeProperty('--thumb-side');
        
        this.layoutState.thumbReachArea = null;
    }

    /**
     * ハプティックフィードバックのトリガー
     */
    public triggerHapticFeedback(type: 'tap' | 'success' | 'error' | 'warning'): void {
        if (!this.config.hapticFeedback.enabled || !this.feedbackSystem.haptic) {
            return;
        }
        
        const pattern = this.config.hapticFeedback.patterns[type];
        if (pattern) {
            this.feedbackSystem.haptic.vibrate(pattern);
        }
    }

    /**
     * タッチターゲットの登録
     */
    public registerTouchTarget(element: HTMLElement, options: any = {}): void {
        if (!element) return;
        
        // 最小サイズの適用
        const minSize = options.minSize || this.config.touchTargets.minSize;
        element.style.minWidth = `${minSize}px`;
        element.style.minHeight = `${minSize}px`;
        
        // スペーシングの適用
        const spacing = options.spacing || this.config.touchTargets.spacing;
        element.style.margin = `${spacing}px`;
        
        // フィードバックの設定
        if (this.config.touchTargets.hoverFeedback) {
            element.classList.add('touch-target-hover');
        }
        
        if (this.config.touchTargets.pressAnimation) {
            element.classList.add('touch-target-press');
        }
    }

    /**
     * 画面向き変更の処理
     */
    private handleOrientationChange(): void {
        this.layoutState.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        
        // デバイス機能の再検出
        this.detectDeviceCapabilities();
        
        // レスポンシブブレークポイントの更新
        this.setupResponsiveBreakpoints();
        
        // 片手操作モードが有効な場合は再計算
        if (this.config.oneHandedMode.enabled) {
            this.calculateThumbReachArea();
            this.applyOneHandedLayout();
        }
        
        console.log(`[MobileUIUXManager] 画面向き変更: ${this.layoutState.orientation}`);
    }

    /**
     * ウィンドウリサイズの処理
     */
    private handleWindowResize(): void {
        // レスポンシブブレークポイントの更新
        this.setupResponsiveBreakpoints();
        
        // タッチターゲットの再計算
        if (this.config.touchTargets.adaptiveSize) {
            this.applyAdaptiveTouchTargets();
        }
        
        // 通知位置の更新
        const container = document.getElementById('mobile-notification-container');
        if (container) {
            this.setNotificationPosition(container);
        }
    }

    /**
     * タッチ開始の処理
     */
    private handleTouchStart(event: TouchEvent): void {
        // タッチフィードバック
        this.triggerHapticFeedback('tap');
        
        // マルチタッチの検出
        if (event.touches.length > 1) {
            console.log(`[MobileUIUXManager] マルチタッチ検出: ${event.touches.length} points`);
        }
    }

    /**
     * 設定の更新
     */
    public updateConfig(newConfig: Partial<UIConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        // 設定に応じてシステムを再初期化
        if (newConfig.oneHandedMode) {
            if (this.config.oneHandedMode.enabled) {
                this.initializeOneHandedMode();
            } else {
                this.disableOneHandedMode();
            }
        }
        
        if (newConfig.touchTargets) {
            this.setupTouchTargetOptimization();
        }
        
        if (newConfig.notifications) {
            const container = document.getElementById('mobile-notification-container');
            if (container) {
                container.className = `notification-container ${this.config.notifications.position}`;
                this.setNotificationPosition(container);
            }
        }
        
        this.saveUISettings();
    }

    /**
     * UI設定の保存
     */
    private saveUISettings(): void {
        try {
            localStorage.setItem('mobile-ui-settings', JSON.stringify(this.config));
        } catch (error) {
            console.warn('[MobileUIUXManager] UI設定の保存に失敗:', error);
        }
    }

    /**
     * 現在の設定を取得
     */
    public getConfig(): UIConfig {
        return { ...this.config };
    }

    /**
     * レイアウト状態を取得
     */
    public getLayoutState(): LayoutState {
        return { ...this.layoutState };
    }

    /**
     * デバイス機能情報を取得
     */
    public getDeviceCapabilities(): DeviceCapabilities {
        return { ...this.deviceCapabilities };
    }

    /**
     * 統計情報の取得
     */
    public getStatistics(): any {
        return {
            activeNotifications: this.activeNotifications.length,
            queuedNotifications: this.notificationQueue.length,
            oneHandedModeEnabled: this.config.oneHandedMode.enabled,
            currentBreakpoint: this.layoutState.currentBreakpoint,
            orientation: this.layoutState.orientation,
            screenSize: this.layoutState.screenSize
        };
    }

    /**
     * クリーンアップ
     */
    public dispose(): void {
        // イベントリスナーの削除
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        window.removeEventListener('resize', this.handleWindowResize);
        
        // 通知の削除
        this.dismissAllNotifications();
        
        // 通知コンテナの削除
        const container = document.getElementById('mobile-notification-container');
        if (container) {
            container.remove();
        }
        
        // 片手操作モードの無効化
        this.disableOneHandedMode();
        
        console.log('[MobileUIUXManager] クリーンアップ完了');
    }
}