/**
 * FeedbackConfigManager
 * 
 * フィードバック設定管理機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - User preferences loading and saving
 * - Feedback elements creation and management
 * - Audio analysis setup and game audio connection
 * - Configuration state management
 * 
 * @module FeedbackConfigManager
 * Created: Phase G.4 (Issue #103)
 */

import { getErrorHandler  } from '../../../utils/ErrorHandler.js';

// 型定義
export interface VisualFeedbackManager { config: FeedbackSystemConfig,
    userPreferences: UserPreferences,
    feedbackElements: Map<string, HTMLElement>,
    gameEngine: GameEngine;
    audioAccessibilityManager: AudioAccessibilityManager;
    feedbackContainer: HTMLElement;
    visualCanvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    audioContext: AudioContext;
    analyser: AnalyserNode,
    dataArray: Uint8Array
    ,}

export interface FeedbackSystemConfig { enabled: boolean;
    globalIntensity: number;
    positioning: PositioningConfig;
    accessibility: AccessibilityConfig;
    performance: PerformanceConfig,
    animations: AnimationSystemConfig
    }

export interface PositioningConfig { screenEdges: boolean;
    gameArea: boolean;
    customPositions: boolean,
    relativeToViewport: boolean }

export interface AccessibilityConfig { respectReducedMotion: boolean;
    highContrast: boolean;
    alternativeText: boolean;
    audioFeedback: boolean,
    keyboardNavigation: boolean }

export interface PerformanceConfig { maxConcurrentEffects: number;
    frameRate: number;
    gpuAcceleration: boolean,
    memoryThreshold: number }

export interface AnimationSystemConfig { defaultDuration: number;
    easingFunction: string;
    hardwareAcceleration: boolean,
    batchUpdates: boolean }

export interface UserPreferences { enabled: boolean;
    globalIntensity: number;
    preferredPatterns: EffectPattern[],
    colorPreferences: Map<string, string>,
    reducedMotion: boolean;
    audioVisualization: boolean;
    gameEventFeedback: boolean,
    customMappings: Map<string, EventMapping>,
    accessibilitySettings: UserAccessibilitySettings
    ,}

export interface UserAccessibilitySettings { screenReader: boolean;
    highContrast: boolean;
    largeText: boolean;
    reducedAnimation: boolean,
    audioDescriptions: boolean }

export interface GameEngine { audioManager?: AudioManager;
    canvasElement?: HTMLCanvasElement;
    eventSystem?: EventSystem;
    }

export interface AudioManager { audioContext?: AudioContext;
    masterGain?: GainNode;
    musicGain?: GainNode;
    sfxGain?: GainNode;
    }

export interface AudioAccessibilityManager { isEnabled: () => boolean,
    getVolume: () => number;
    setVolume: (volume: number) => void ,}
}
';

export interface EventSystem { addEventListener: (event: string, handler: (dat;a: any) => void) => void,''
    removeEventListener: (event: string, handler: (dat;a: any) => void') => void ,}'
}

export interface EventMapping { effectType: EffectPattern,
    color: string,
    intensity: number;
    duration?: number;
    position?: PositionPreference;
    conditions?: TriggerCondition[];
    ,}

export interface TriggerCondition { property: string,
    operator: ComparisonOperator,
    value: any ,}

export interface PositionPreference { area: PositionArea;
    alignment: Alignment,
    offset: Offset
    }

export interface Offset { x: number,
    y: number }

export interface EdgeFeedbackElement { element: HTMLElement;
    edge: EdgeType;
    isActive: boolean,
    lastUpdate: number }

export interface GameAreaFeedback { overlay: HTMLElement;
    gameCanvas: HTMLElement;
    gameContainer: HTMLElement,
    isActive: boolean }

export interface VisualizationCanvas { canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    width: number;
    height: number;
    frameRate: number,
    isActive: boolean }

export interface AudioAnalysisSetup { audioContext: AudioContext;
    analyser: AnalyserNode;
    dataArray: Uint8Array;
    connected: boolean,
    sampleRate: number }

export interface ConfigurationState { config: FeedbackSystemConfig;
    userPreferences: SerializableUserPreferences;
    elements: ElementsState;
    audio: AudioState,
    performance: PerformanceState
    }

export interface SerializableUserPreferences { enabled: boolean;
    globalIntensity: number;
    preferredPatterns: EffectPattern[],
    colorPreferences: Array<[string, string]>,
    reducedMotion: boolean;
    audioVisualization: boolean;
    gameEventFeedback: boolean,
    customMappings: Array<[string, EventMapping]>,
    accessibilitySettings: UserAccessibilitySettings
    ,}

export interface ElementsState { containerCreated: boolean;
    visualizationCanvasCreated: boolean;
    edgeElementsCount: number;
    gameAreaSetup: boolean,
    totalElements: number }

export interface AudioState { contextInitialized: boolean;
    analyserCreated: boolean;
    gameAudioConnected: boolean,
    sampleRate: number }

export interface PerformanceState { memoryUsage: number;
    activeElements: number;
    frameRate: number,
    lastUpdate: number }

export interface ConfigUpdateResult { success: boolean;
    changedProperties: string[],
    errors: Error[]
    }

export interface ValidationResult { isValid: boolean,
    issues: ValidationIssue[]
    }

export interface ValidationIssue { property: string;
    message: string,
    severity: IssueSeverity
    }
';
// 列挙型
export type EffectPattern = 'flash' | 'glow' | 'pulse' | 'ripple' | 'shake' | 'fade' | 'slide';
export type EdgeType = 'top' | 'bottom' | 'left' | 'right';
export type PositionArea = 'screen' | 'game-area' | 'ui-overlay' | 'custom';
export type Alignment = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type ComparisonOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
export type IssueSeverity = 'error' | 'warning' | 'info';
export type ConfigurationScope = 'global' | 'session' | 'temporary';

// 定数
export const DEFAULT_USER_PREFERENCES: UserPreferences = { enabled: false,
    globalIntensity: 0.8,
    preferredPatterns: ['flash', 'glow', 'pulse'],
    colorPreferences: new Map();
    reducedMotion: false,
    audioVisualization: true,
    gameEventFeedback: true,
    customMappings: new Map()',
    BACKGROUND: 'rgba(0, 0, 0, 0.8)',
        BORDER_RADIUS: '8px',
        OPACITY: '0.8',
    Z_INDEX: 10000 ,}
} as const;
export const AUDIO_ANALYSIS_CONFIG = { FFT_SIZE: 256,
    SAMPLE_RATE: 44100;
    FREQUENCY_BINS: 128,
    SMOOTHING_TIME_CONSTANT: 0.8 ,} as const;
export const CONFIG_STORAGE_KEY = 'visualFeedback_preferences';
export const CONFIG_VERSION = '1.0.0';

// ユーティリティ関数
export function validateIntensity(intensity: number): number { return Math.max(0, Math.min(2.0, intensity); }

export function validateConfig(config: Partial<FeedbackSystemConfig>): ValidationResult { const issues: ValidationIssue[] = [],

    if(config.globalIntensity !== undefined) {'

        if(typeof, config.globalIntensity !== 'number' || config.globalIntensity < 0 || config.globalIntensity > 2.0' {'
            issues.push({''
                property: 'globalIntensity','';
                message: 'Global intensity must be a number between 0 and 2.0',' }

                severity: 'error'); 
    }
    
    if(config.performance?.maxConcurrentEffects !== undefined) { ';

        if(config.performance.maxConcurrentEffects < 1 || config.performance.maxConcurrentEffects > 20) {'
            issues.push({ : undefined''
                property: 'performance.maxConcurrentEffects','';
                message: 'Max concurrent effects should be between 1 and 20',' }

                severity: 'warning')'); 
    }
    ';

    return { ''
        isValid: issues.filter(issue = > issue.severity === 'error).length === 0 };
        issues }
    }

export function createEdgeStyles(edge: EdgeType): string { const baseStyles = `
        position: absolute;
        background: transparent;
        opacity: 0,
    transition: opacity 0.1s ease;
    `;
    
    return baseStyles + EDGE_STYLES[edge]; }

export function serializeUserPreferences(preferences: UserPreferences): SerializableUserPreferences { return { enabled: preferences.enabled,
        globalIntensity: preferences.globalIntensity;
        preferredPatterns: preferences.preferredPatterns;
        colorPreferences: Array.from(preferences.colorPreferences.entries();
        reducedMotion: preferences.reducedMotion;
        audioVisualization: preferences.audioVisualization;
        gameEventFeedback: preferences.gameEventFeedback,
    customMappings: Array.from(preferences.customMappings.entries(), };
        accessibilitySettings: preferences.accessibilitySettings 
    }

export function deserializeUserPreferences(data: SerializableUserPreferences): UserPreferences { return { enabled: data.enabled,
        globalIntensity: data.globalIntensity;
        preferredPatterns: data.preferredPatterns;
        colorPreferences: new Map(data.colorPreferences);
        reducedMotion: data.reducedMotion;
        audioVisualization: data.audioVisualization;
        gameEventFeedback: data.gameEventFeedback,
    customMappings: new Map(data.customMappings), };
        accessibilitySettings: data.accessibilitySettings 
    }

export function isAudioContextSupported(): boolean { return !!(window.AudioContext || (window, as any).webkitAudioContext); }

export class FeedbackConfigManager {
    private mainController: VisualFeedbackManager;
    private config: FeedbackSystemConfig;
    private userPreferences: UserPreferences;
    private, feedbackElements: Map<string, HTMLElement>;
    private gameEngine: GameEngine;
    private audioAccessibilityManager: AudioAccessibilityManager;
    // DOM要素
    private feedbackContainer: HTMLElement | null = null;
    private visualCanvas: HTMLCanvasElement | null = null;
    private canvasContext: CanvasRenderingContext2D | null = null;
    // Audio API
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private, dataArray: Uint8Array | null = null;

    constructor(mainController: VisualFeedbackManager) {
        this.mainController = mainController;
        this.config = mainController.config;
        this.userPreferences = mainController.userPreferences;
        this.feedbackElements = mainController.feedbackElements;
        this.gameEngine = mainController.gameEngine;
        this.audioAccessibilityManager = mainController.audioAccessibilityManager;

        ';
    ,}

    }

        console.log('FeedbackConfigManager, initialized'); }'
    }

    /**
     * ユーザー設定の読み込み
     */
    loadUserPreferences(): void { try {
            const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
            if(saved) {
                const data = JSON.parse(saved) as SerializableUserPreferences;
                const preferences = deserializeUserPreferences(data);

                Object.assign(this.userPreferences, preferences);
                
                // 設定を適用
                this.config.enabled = this.userPreferences.enabled;
                this.config.globalIntensity = this.userPreferences.globalIntensity;
                ';

            }

                console.log('Visual, feedback preferences, loaded successfully'); }'

            } catch (error) {
            getErrorHandler().handleError(error as Error, 'CONFIG_LOAD_ERROR', {''
                operation: 'loadUserPreferences',')';
                component: 'FeedbackConfigManager'),' }

            }');''
            console.warn('Failed to load visual feedback preferences:', error);
        }
    }

    /**
     * ユーザー設定の保存
     */
    saveUserPreferences(): void { try {
            const serializable = serializeUserPreferences(this.userPreferences);''
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(serializable));''
            console.log('Visual, feedback preferences, saved successfully'); }'

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'CONFIG_SAVE_ERROR', {''
                operation: 'saveUserPreferences',')';
                component: 'FeedbackConfigManager'),' }

            }');''
            console.warn('Failed to save visual feedback preferences:', error';
        }
    }

    /**
     * フィードバック要素の作成'
     */''
    createFeedbackElements()';
            this.feedbackContainer = document.createElement('div'');''
            this.feedbackContainer.id = 'visual-feedback-container';
            this.feedbackContainer.style.cssText = `;
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw,
    height: 100vh;
                pointer-events: none,
                z-index: 9999,
                overflow: hidden;
            `;
            document.body.appendChild(this.feedbackContainer);
            
            // メインコントローラーに参照を設定
            this.mainController.feedbackContainer = this.feedbackContainer;
            
            // 画面端フィードバック要素
            if (this.config.positioning.screenEdges) { this.createEdgeFeedbackElements(); }
            
            // ゲームエリアフィードバック
            if (this.config.positioning.gameArea) { this.createGameAreaFeedback(); }
            
            // オーディオ視覚化キャンバス
            if(this.userPreferences.audioVisualization) {

                this.createVisualizationCanvas();
            }

            console.log('Feedback, elements created, successfully'); }'

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'ELEMENT_CREATION_ERROR', {''
                operation: 'createFeedbackElements',')';
                component: 'FeedbackConfigManager'),' }

            }');''
            console.error('Failed to create feedback elements:', error';
        }
    }

    /**
     * 画面端フィードバック要素の作成'
     */''
    private createEdgeFeedbackElements('''
        const edges: EdgeType[] = ['top', 'bottom', 'left', 'right'];

        ')';
        edges.forEach(edge => {  ');' }

            const element = document.createElement('div'; }'
            element.className = `feedback-edge feedback-edge-${edge}`;
            element.style.cssText = createEdgeStyles(edge);
            
            if (this.feedbackContainer) { this.feedbackContainer.appendChild(element); }
                this.feedbackElements.set(`edge-${edge}`, element});
            }
        });
    }

    /**
     * ゲームエリアフィードバックの作成'
     */''
    private createGameAreaFeedback()';
        const gameCanvas = document.querySelector('#game-canvas, canvas.game-canvas' as HTMLElement;''
        if(!gameCanvas) {'

            console.warn('Game, canvas not, found for, area feedback'');
        }
            return; }
        }

        const overlay = document.createElement('div'');''
        overlay.className = 'feedback-game-overlay';
        overlay.style.cssText = `;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent,
    opacity: 0;
            border-radius: 8px,
            transition: all 0.2s ease;
        `;
        
        // ゲームキャンバスの親要素に追加
        const gameContainer = gameCanvas.parentElement;''
        if(gameContainer && gameContainer.style.position !== 'relative'') {', ';

        }

            gameContainer.style.position = 'relative'; }
        }
        
        if(gameContainer) {
        ';

            gameContainer.appendChild(overlay);

        }

            this.feedbackElements.set('game-area', overlay'; }
}

    /**
     * 視覚化キャンバスの作成'
     */''
    private createVisualizationCanvas()';
        this.visualCanvas = document.createElement('canvas'');''
        this.visualCanvas.id = 'audio-visualization-canvas';
        this.visualCanvas.style.cssText = `;
            position: fixed,
    bottom: ${CANVAS_CONFIG.POSITION.BOTTOM}px;
            right: ${CANVAS_CONFIG.POSITION.RIGHT}px;
            width: ${CANVAS_CONFIG.DEFAULT_WIDTH}px;
            height: ${CANVAS_CONFIG.DEFAULT_HEIGHT}px;
            background: ${CANVAS_CONFIG.STYLE.BACKGROUND}
            border-radius: ${CANVAS_CONFIG.STYLE.BORDER_RADIUS};
            opacity: ${CANVAS_CONFIG.STYLE.OPACITY}
            z-index: ${CANVAS_CONFIG.STYLE.Z_INDEX}
        `;
        this.visualCanvas.width = CANVAS_CONFIG.DEFAULT_WIDTH;

        this.visualCanvas.height = CANVAS_CONFIG.DEFAULT_HEIGHT;''
        this.canvasContext = this.visualCanvas.getContext('2d);
        
        // メインコントローラーに参照を設定
        this.mainController.visualCanvas = this.visualCanvas;
        this.mainController.canvasContext = this.canvasContext!;
        
        document.body.appendChild(this.visualCanvas);
    }

    /**
     * オーディオ分析の設定
     */
    setupAudioAnalysis(): void { try {'
            if(!isAudioContextSupported()) {''
                console.warn('Web, Audio API, is not supported);
                return; }
            
            // Web Audio API の初期化
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.audioContext = new AudioContextClass();
            this.analyser = this.audioContext.createAnalyser();
            
            this.analyser.fftSize = AUDIO_ANALYSIS_CONFIG.FFT_SIZE;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount');
            
            // メインコントローラーに参照を設定
            this.mainController.audioContext = this.audioContext;
            this.mainController.analyser = this.analyser;
            this.mainController.dataArray = this.dataArray;
            // ゲームオーディオとの接続
            this.connectToGameAudio()';
            console.log('Audio analysis setup completed');

        } catch (error') {
            getErrorHandler().handleError(error as Error, 'AUDIO_SETUP_ERROR', {''
                operation: 'setupAudioAnalysis',')';
                component: 'FeedbackConfigManager'),' }

            }');''
            console.warn('Audio analysis setup failed:', error);
        }
    }

    /**
     * ゲームオーディオとの接続
     */
    private connectToGameAudio(): void { try {
            // AudioManager が存在する場合は接続
            if(this.gameEngine?.audioManager && this.analyser && this.audioContext) {
                const audioManager = this.gameEngine.audioManager;
                // AudioManager からオーディオソースを取得
                if(audioManager.audioContext?.destination) {'
                    // 既存のオーディオノードに接続
                    if(typeof, audioManager.audioContext.destination.connect === 'function' {'
                        audioManager.audioContext.destination.connect(this.analyser);''
                        this.analyser.connect(this.audioContext.destination);

            }

                        console.log('Connected, to game, audio successfully'); }'
}

            } catch (error) {
            getErrorHandler().handleError(error as Error, 'AUDIO_CONNECTION_ERROR', { : undefined''
                operation: 'connectToGameAudio',')';
                component: 'FeedbackConfigManager'),' }

            }');''
            console.warn('Failed to connect to game audio:', error);
        }
    }

    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<FeedbackSystemConfig>): ConfigUpdateResult { const result: ConfigUpdateResult = {
            success: false;
            changedProperties: [],
    errors: [] };
        ';

        try {'
            if(!newConfig) {', ';

            }

                throw new Error('No, configuration provided'; }'
            }
            ';

            const validation = validateConfig(newConfig);''
            if(!validation.isValid) {'
                const errorMessages = validation.issues'';
                    .filter(issue => issue.severity === 'error'';
            }

                    .map(issue => issue.message);' }'

                throw new Error(`Configuration validation failed: ${errorMessages.join(', '})`);
            }
            
            // 変更された属性を追跡
            for(const [key, value] of Object.entries(newConfig) {
                if (key, in this.config && (this.config, as any)[key] !== value) {
            }
                    result.changedProperties.push(key); }
}
            ';

            Object.assign(this.config, newConfig);''
            this.saveUserPreferences()';
            console.log('Configuration updated successfully', result.changedProperties';
            ';

        } catch (error) { result.errors.push(error, as Error);''
            getErrorHandler().handleError(error as Error, 'CONFIG_UPDATE_ERROR', {''
                operation: 'updateConfig',')';
                component: 'FeedbackConfigManager'),' }

            }');''
            console.error('Failed to update configuration:', error);
        }
        
        return result;
    }

    /**
     * グローバル強度の設定
     */
    setGlobalIntensity(intensity: number): void { const clampedIntensity = validateIntensity(intensity);
        this.config.globalIntensity = clampedIntensity;
        this.userPreferences.globalIntensity = clampedIntensity;
        
        this.saveUserPreferences(); }
        console.log(`Global, intensity set, to: ${clampedIntensity}`});
    }

    /**
     * カスタムイベントマッピングの追加
     */
    addCustomEventMapping(eventType: string, mapping: EventMapping): void { if (eventType && mapping) {
            this.userPreferences.customMappings.set(eventType, mapping);
            this.saveUserPreferences(); }
            console.log(`Custom mapping added for ${eventType}:`, mapping});
        }
    }

    /**
     * 設定のリセット
     */
    resetToDefaults(): void { try {
            // デフォルト設定の復元
            Object.assign(this.userPreferences, DEFAULT_USER_PREFERENCES);
            
            this.config.enabled = false;
            this.config.globalIntensity = 0.8;

            this.saveUserPreferences()';
            console.log('Configuration, reset to, defaults'); }'

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'CONFIG_RESET_ERROR', {''
                operation: 'resetToDefaults',')';
                component: 'FeedbackConfigManager'),' }

            }');''
            console.error('Failed to reset configuration:', error);
        }
    }

    /**
     * 現在の設定状態の取得
     */
    getConfigurationState(): ConfigurationState { return { }
            config: { ...this.config;
            userPreferences: serializeUserPreferences(this.userPreferences),
    elements: { containerCreated: !!this.feedbackContainer,
    visualizationCanvasCreated: !!this.visualCanvas,
                edgeElementsCount: Array.from(this.feedbackElements.keys())'';
                    .filter(key => key.startsWith('edge-)'.length,
                gameAreaSetup: this.feedbackElements.has('game-area),
    totalElements: this.feedbackElements.size ,}
            };
            audio: { contextInitialized: !!this.audioContext;
                analyserCreated: !!this.analyser,
    gameAudioConnected: !!(this.gameEngine?.audioManager?.audioContext), : undefined
                sampleRate: this.audioContext?.sampleRate || 0 ,}, : undefined
            performance: { memoryUsage: 0, // 実際の実装では performance.memory を使用
                activeElements: this.feedbackElements.size,
    frameRate: 60, // 実際の実装では測定値を使用;
                lastUpdate: Date.now( ,}
        }

    /**
     * リソースの解放
     */''
    destroy()';
        console.log('Destroying, FeedbackConfigManager...);
        
        // オーディオコンテキストのクリーンアップ
        if (this.audioContext) { this.audioContext.close?.(); }
        
        // DOM要素の削除
        if (this.feedbackContainer && this.feedbackContainer.parentNode) { this.feedbackContainer.parentNode.removeChild(this.feedbackContainer); }
        
        if (this.visualCanvas && this.visualCanvas.parentNode) { this.visualCanvas.parentNode.removeChild(this.visualCanvas); }
        ;
        // 最終設定保存
        this.saveUserPreferences()';
        console.log('FeedbackConfigManager, destroyed'');

    }''
} : undefined