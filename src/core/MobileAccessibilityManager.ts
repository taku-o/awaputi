/**
 * MobileAccessibilityManager (Main, Controller)
 * モバイル向けアクセシビリティ強化マネージャーの軽量オーケストレーター
 * Main Controller Patternに従い、サブコンポーネントに処理を委譲
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';
import { MobileAccessibilityValidator } from './mobile-accessibility/MobileAccessibilityValidator.js';

interface AccessibilityConfig {
    screenReader: {
        enabled: boolean;
        announcements: boolean;
        liveRegions: boolean;
        roleDescriptions: boolean;
        keyboardNavigation: boolean;
        focusManagement: boolean;
    };
    visualSupport: {
        highContrast: boolean;
        colorBlindnessSupport: boolean;
        colorBlindnessType: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
        fontSize: 'small' | 'normal' | 'large' | 'xlarge';
        lineHeight: 'normal' | 'relaxed' | 'loose';
        letterSpacing: 'normal' | 'wide' | 'wider';
    };
    motorSupport: {
        touchAreaEnlarged: boolean;
        hoverAlternatives: boolean;
        gestureAlternatives: boolean;
        voiceControl: boolean;
        switchControl: boolean;
    };
    cognitiveSupport: {
        reducedMotion: boolean;
        simplifiedUI: boolean;
        contentPausing: boolean;
        timeExtensions: boolean;
        readingMode: boolean;
    };
    auditorySupport: {
        visualIndicators: boolean;
        hapticFeedback: boolean;
        captions: boolean;
        signLanguage: boolean;
    };
}

interface ScreenReaderState {
    active: boolean;
    currentFocus: HTMLElement | null;
    announceQueue: string[];
    liveRegions: Map<string, HTMLElement>;
    navigationMode: 'normal' | 'explore' | 'reading';
}

interface ColorSupport {
    filters: Map<string, string>;
    contrastRatios: Map<string, number>;
    colorPalettes: Map<string, string[]>;
    currentFilter: string | null;
}

interface FocusManager {
    focusableElements: HTMLElement[];
    currentIndex: number;
    focusHistory: HTMLElement[];
    trapStack: HTMLElement[];
}

interface FeedbackSystems {
    speechSynthesis: SpeechSynthesis | null;
    haptics: any | null;
    audioBeeps: Map<string, HTMLAudioElement>;
}

export class MobileAccessibilityManager {
    private gameEngine: any;
    private errorHandler: any;
    private validator: MobileAccessibilityValidator;
    private accessibilityConfig: AccessibilityConfig;
    private screenReaderState: ScreenReaderState;
    private colorSupport: ColorSupport;
    private focusManager: FocusManager;
    private feedbackSystems: FeedbackSystems;

    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        this.errorHandler = ErrorHandler.getInstance();
        
        // サブコンポーネントの初期化（依存性注入）
        this.validator = new MobileAccessibilityValidator(this);
        
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
                colorBlindnessType: 'none',
                fontSize: 'normal',
                lineHeight: 'normal',
                letterSpacing: 'normal'
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
            navigationMode: 'normal'
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
     * システム初期化（軽量化）
     */
    private initialize(): void {
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
    
    // ========================================
    // 公開API - サブコンポーネントへの委譲
    // ========================================
    
    /**
     * モバイルアクセシビリティ検証（MobileAccessibilityValidatorに委譲）
     */
    public async validateAccessibility(): Promise<any> {
        return await this.validator.validateMobileAccessibility();
    }

    public async checkWCAGCompliance(level: string = 'AA'): Promise<any> {
        return await this.validator.checkWCAGCompliance(level);
    }

    /**
     * アクセシビリティ機能の有効化
     */
    public enableFeature(feature: string, options: any = {}): void {
        try {
            switch (feature) {
                case 'screenReader':
                    this.enableScreenReader(options);
                    break;
                case 'highContrast':
                    this.enableHighContrast(options);
                    break;
                case 'colorBlindnessSupport':
                    this.enableColorBlindnessSupport(options);
                    break;
                case 'touchAreaEnlargement':
                    this.enableTouchAreaEnlargement(options);
                    break;
                case 'hapticFeedback':
                    this.enableHapticFeedback(options);
                    break;
                default:
                    console.warn(`Unknown accessibility feature: ${feature}`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, `MobileAccessibilityManager.enableFeature.${feature}`);
        }
    }

    /**
     * アクセシビリティ機能の無効化
     */
    public disableFeature(feature: string): void {
        try {
            switch (feature) {
                case 'screenReader':
                    this.disableScreenReader();
                    break;
                case 'highContrast':
                    this.disableHighContrast();
                    break;
                case 'colorBlindnessSupport':
                    this.disableColorBlindnessSupport();
                    break;
                case 'touchAreaEnlargement':
                    this.disableTouchAreaEnlargement();
                    break;
                case 'hapticFeedback':
                    this.disableHapticFeedback();
                    break;
                default:
                    console.warn(`Unknown accessibility feature: ${feature}`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, `MobileAccessibilityManager.disableFeature.${feature}`);
        }
    }

    // ========================================
    // プライベートメソッド
    // ========================================

    /**
     * アクセシビリティ機能の検出
     */
    private detectAccessibilityCapabilities(): void {
        // スクリーンリーダーの検出
        const hasScreenReader = 'speechSynthesis' in window || 
                               navigator.userAgent.includes('NVDA') ||
                               navigator.userAgent.includes('JAWS') ||
                               navigator.userAgent.includes('VoiceOver');
        
        if (hasScreenReader) {
            this.accessibilityConfig.screenReader.enabled = true;
        }

        // ハプティックフィードバックの検出
        if ('vibrate' in navigator) {
            this.accessibilityConfig.auditorySupport.hapticFeedback = true;
        }
    }

    /**
     * スクリーンリーダーサポートのセットアップ
     */
    private setupScreenReaderSupport(): void {
        if ('speechSynthesis' in window) {
            this.feedbackSystems.speechSynthesis = window.speechSynthesis;
        }

        // ARIAライブリージョンの設定
        this.setupLiveRegions();
    }

    /**
     * ARIAライブリージョンの設定
     */
    private setupLiveRegions(): void {
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;

        // スコア表示用ライブリージョン
        const scoreRegion = document.createElement('div');
        scoreRegion.setAttribute('aria-live', 'polite');
        scoreRegion.setAttribute('aria-label', 'Score updates');
        scoreRegion.style.position = 'absolute';
        scoreRegion.style.left = '-9999px';
        gameContainer.appendChild(scoreRegion);
        this.screenReaderState.liveRegions.set('score', scoreRegion);

        // ゲーム状態用ライブリージョン
        const statusRegion = document.createElement('div');
        statusRegion.setAttribute('aria-live', 'assertive');
        statusRegion.setAttribute('aria-label', 'Game status');
        statusRegion.style.position = 'absolute';
        statusRegion.style.left = '-9999px';
        gameContainer.appendChild(statusRegion);
        this.screenReaderState.liveRegions.set('status', statusRegion);
    }

    /**
     * 色覚支援の初期化
     */
    private initializeColorSupport(): void {
        // 色覚異常用フィルターの設定
        this.colorSupport.filters.set('protanopia', 'grayscale(50%) sepia(50%) hue-rotate(-50deg)');
        this.colorSupport.filters.set('deuteranopia', 'grayscale(50%) sepia(50%) hue-rotate(50deg)');
        this.colorSupport.filters.set('tritanopia', 'grayscale(50%) sepia(50%) hue-rotate(180deg)');

        // コントラスト比の設定
        this.colorSupport.contrastRatios.set('normal', 4.5);
        this.colorSupport.contrastRatios.set('large', 3.0);
        this.colorSupport.contrastRatios.set('enhanced', 7.0);
    }

    /**
     * キーボードナビゲーションのセットアップ
     */
    private setupKeyboardNavigation(): void {
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
        this.updateFocusableElements();
    }

    /**
     * フォーカス可能な要素の更新
     */
    private updateFocusableElements(): void {
        const focusableSelectors = [
            'button:not([disabled])',
            '[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(',');

        this.focusManager.focusableElements = Array.from(
            document.querySelectorAll(focusableSelectors)
        ) as HTMLElement[];
    }

    /**
     * キーボードナビゲーションの処理
     */
    private handleKeyboardNavigation(event: KeyboardEvent): void {
        if (!this.accessibilityConfig.screenReader.keyboardNavigation) return;

        switch (event.key) {
            case 'Tab':
                this.handleTabNavigation(event);
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                this.handleArrowNavigation(event);
                break;
            case 'Enter':
            case ' ':
                this.handleActivation(event);
                break;
        }
    }

    /**
     * Tabナビゲーションの処理
     */
    private handleTabNavigation(event: KeyboardEvent): void {
        const direction = event.shiftKey ? -1 : 1;
        const currentIndex = this.focusManager.currentIndex;
        const nextIndex = (currentIndex + direction) % this.focusManager.focusableElements.length;
        
        if (nextIndex >= 0 && nextIndex < this.focusManager.focusableElements.length) {
            this.focusManager.focusableElements[nextIndex].focus();
            this.focusManager.currentIndex = nextIndex;
        }
    }

    /**
     * 矢印キーナビゲーションの処理
     */
    private handleArrowNavigation(event: KeyboardEvent): void {
        // ゲーム内での方向キーナビゲーション
        event.preventDefault();
        this.announceDirection(event.key);
    }

    /**
     * アクティベーション処理
     */
    private handleActivation(event: KeyboardEvent): void {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && typeof activeElement.click === 'function') {
            activeElement.click();
        }
    }

    /**
     * フィードバックシステムの初期化
     */
    private initializeFeedbackSystems(): void {
        // 音声フィードバック用の音源を設定
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // 基本的な効果音の生成
        this.generateAudioBeeps(audioContext);
    }

    /**
     * オーディオビープ音の生成
     */
    private generateAudioBeeps(audioContext: AudioContext): void {
        const frequencies = {
            success: 800,
            warning: 600,
            error: 400,
            focus: 1000
        };

        Object.entries(frequencies).forEach(([type, frequency]) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // AudioElementとして保存（実際の実装では音声ファイルを使用）
            const audio = document.createElement('audio');
            this.feedbackSystems.audioBeeps.set(type, audio);
        });
    }

    /**
     * アクセシビリティイベントリスナーのセットアップ
     */
    private setupAccessibilityEventListeners(): void {
        // フォーカス変更の監視
        document.addEventListener('focusin', this.handleFocusChange.bind(this));
        document.addEventListener('focusout', this.handleFocusLoss.bind(this));
        
        // 画面向きの変更
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
        
        // ウィンドウリサイズ
        window.addEventListener('resize', this.handleWindowResize.bind(this));
    }

    /**
     * フォーカス変更の処理
     */
    private handleFocusChange(event: FocusEvent): void {
        const target = event.target as HTMLElement;
        this.screenReaderState.currentFocus = target;
        this.focusManager.focusHistory.push(target);
        
        // フォーカス音の再生
        this.playAudioBeep('focus');
        
        // スクリーンリーダー向けの説明
        this.announceElement(target);
    }

    /**
     * フォーカス喪失の処理
     */
    private handleFocusLoss(event: FocusEvent): void {
        this.screenReaderState.currentFocus = null;
    }

    /**
     * 画面向き変更の処理
     */
    private handleOrientationChange(): void {
        setTimeout(() => {
            this.updateFocusableElements();
            this.announceOrientationChange();
        }, 100);
    }

    /**
     * ウィンドウリサイズの処理
     */
    private handleWindowResize(): void {
        this.updateFocusableElements();
    }

    /**
     * アクセシビリティ設定の読み込み
     */
    private loadAccessibilitySettings(): void {
        const savedSettings = localStorage.getItem('accessibilitySettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.accessibilityConfig = { ...this.accessibilityConfig, ...settings };
            } catch (error) {
                console.warn('Failed to load accessibility settings:', error);
            }
        }
    }

    /**
     * 初期設定の適用
     */
    private applyInitialSettings(): void {
        // 高コントラストモードの適用
        if (this.accessibilityConfig.visualSupport.highContrast) {
            this.enableHighContrast();
        }
        
        // 色覚異常サポートの適用
        if (this.accessibilityConfig.visualSupport.colorBlindnessSupport) {
            this.enableColorBlindnessSupport({
                type: this.accessibilityConfig.visualSupport.colorBlindnessType
            });
        }
        
        // フォントサイズの適用
        this.applyFontSize(this.accessibilityConfig.visualSupport.fontSize);
    }

    // ========================================
    // 機能実装メソッド
    // ========================================

    /**
     * スクリーンリーダーの有効化
     */
    private enableScreenReader(options: any = {}): void {
        this.accessibilityConfig.screenReader.enabled = true;
        this.screenReaderState.active = true;
        
        // スクリーンリーダー用のスタイルを追加
        this.addScreenReaderStyles();
        
        this.announce('Screen reader enabled');
    }

    /**
     * スクリーンリーダーの無効化
     */
    private disableScreenReader(): void {
        this.accessibilityConfig.screenReader.enabled = false;
        this.screenReaderState.active = false;
        
        this.removeScreenReaderStyles();
        
        this.announce('Screen reader disabled');
    }

    /**
     * 高コントラストモードの有効化
     */
    private enableHighContrast(options: any = {}): void {
        this.accessibilityConfig.visualSupport.highContrast = true;
        document.body.classList.add('high-contrast');
    }

    /**
     * 高コントラストモードの無効化
     */
    private disableHighContrast(): void {
        this.accessibilityConfig.visualSupport.highContrast = false;
        document.body.classList.remove('high-contrast');
    }

    /**
     * 色覚異常サポートの有効化
     */
    private enableColorBlindnessSupport(options: any = {}): void {
        this.accessibilityConfig.visualSupport.colorBlindnessSupport = true;
        const type = options.type || 'protanopia';
        this.accessibilityConfig.visualSupport.colorBlindnessType = type;
        
        const filter = this.colorSupport.filters.get(type);
        if (filter) {
            document.body.style.filter = filter;
            this.colorSupport.currentFilter = type;
        }
    }

    /**
     * 色覚異常サポートの無効化
     */
    private disableColorBlindnessSupport(): void {
        this.accessibilityConfig.visualSupport.colorBlindnessSupport = false;
        document.body.style.filter = '';
        this.colorSupport.currentFilter = null;
    }

    /**
     * タッチ領域拡大の有効化
     */
    private enableTouchAreaEnlargement(options: any = {}): void {
        this.accessibilityConfig.motorSupport.touchAreaEnlarged = true;
        document.body.classList.add('enlarged-touch-targets');
    }

    /**
     * タッチ領域拡大の無効化
     */
    private disableTouchAreaEnlargement(): void {
        this.accessibilityConfig.motorSupport.touchAreaEnlarged = false;
        document.body.classList.remove('enlarged-touch-targets');
    }

    /**
     * ハプティックフィードバックの有効化
     */
    private enableHapticFeedback(options: any = {}): void {
        this.accessibilityConfig.auditorySupport.hapticFeedback = true;
    }

    /**
     * ハプティックフィードバックの無効化
     */
    private disableHapticFeedback(): void {
        this.accessibilityConfig.auditorySupport.hapticFeedback = false;
    }

    // ========================================
    // ユーティリティメソッド
    // ========================================

    /**
     * 音声アナウンス
     */
    private announce(text: string, priority: 'polite' | 'assertive' = 'polite'): void {
        if (!this.screenReaderState.active) return;

        const liveRegion = priority === 'assertive' 
            ? this.screenReaderState.liveRegions.get('status')
            : this.screenReaderState.liveRegions.get('score');

        if (liveRegion) {
            liveRegion.textContent = text;
        }

        // 音声合成での読み上げ
        if (this.feedbackSystems.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            this.feedbackSystems.speechSynthesis.speak(utterance);
        }
    }

    /**
     * 要素の説明をアナウンス
     */
    private announceElement(element: HTMLElement): void {
        if (!element) return;

        const label = element.getAttribute('aria-label') || 
                     element.getAttribute('title') ||
                     element.textContent ||
                     element.tagName.toLowerCase();

        this.announce(`Focused on ${label}`);
    }

    /**
     * 方向のアナウンス
     */
    private announceDirection(key: string): void {
        const directions: { [key: string]: string } = {
            'ArrowUp': 'Moving up',
            'ArrowDown': 'Moving down',
            'ArrowLeft': 'Moving left',
            'ArrowRight': 'Moving right'
        };

        const direction = directions[key];
        if (direction) {
            this.announce(direction);
        }
    }

    /**
     * 画面向き変更のアナウンス
     */
    private announceOrientationChange(): void {
        const orientation = window.screen && (window.screen as any).orientation 
            ? (window.screen as any).orientation.type
            : window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

        this.announce(`Screen orientation changed to ${orientation}`);
    }

    /**
     * オーディオビープの再生
     */
    private playAudioBeep(type: string): void {
        const audio = this.feedbackSystems.audioBeeps.get(type);
        if (audio && audio.play) {
            audio.play().catch(error => {
                console.warn('Audio beep playback failed:', error);
            });
        }
    }

    /**
     * フォントサイズの適用
     */
    private applyFontSize(size: string): void {
        const fontSizes: { [key: string]: string } = {
            'small': '12px',
            'normal': '16px',
            'large': '20px',
            'xlarge': '24px'
        };

        const fontSize = fontSizes[size] || fontSizes['normal'];
        document.documentElement.style.fontSize = fontSize;
    }

    /**
     * スクリーンリーダー用スタイルの追加
     */
    private addScreenReaderStyles(): void {
        const styleId = 'accessibility-screen-reader-styles';
        if (document.getElementById(styleId)) return;

        const styles = document.createElement('style');
        styles.id = styleId;
        styles.textContent = `
            .sr-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }
            
            .sr-only:focus,
            .sr-only:active {
                position: static !important;
                width: auto !important;
                height: auto !important;
                padding: inherit !important;
                margin: inherit !important;
                overflow: visible !important;
                clip: auto !important;
                white-space: inherit !important;
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * スクリーンリーダー用スタイルの削除
     */
    private removeScreenReaderStyles(): void {
        const styleElement = document.getElementById('accessibility-screen-reader-styles');
        if (styleElement) {
            styleElement.remove();
        }
    }

    /**
     * バイブレーション（ハプティック）フィードバック
     */
    public vibrate(pattern: number | number[] = 100): void {
        if (this.accessibilityConfig.auditorySupport.hapticFeedback && 'vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    /**
     * 設定の保存
     */
    public saveSettings(): void {
        try {
            localStorage.setItem('accessibilitySettings', JSON.stringify(this.accessibilityConfig));
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileAccessibilityManager.saveSettings');
        }
    }

    /**
     * 現在の設定を取得
     */
    public getConfig(): AccessibilityConfig {
        return { ...this.accessibilityConfig };
    }

    /**
     * クリーンアップ
     */
    public dispose(): void {
        // イベントリスナーの削除
        document.removeEventListener('keydown', this.handleKeyboardNavigation);
        document.removeEventListener('focusin', this.handleFocusChange);
        document.removeEventListener('focusout', this.handleFocusLoss);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        window.removeEventListener('resize', this.handleWindowResize);

        // ライブリージョンの削除
        this.screenReaderState.liveRegions.forEach(region => {
            if (region.parentNode) {
                region.parentNode.removeChild(region);
            }
        });

        // スタイルの削除
        this.removeScreenReaderStyles();

        console.log('[MobileAccessibilityManager] クリーンアップ完了');
    }
}