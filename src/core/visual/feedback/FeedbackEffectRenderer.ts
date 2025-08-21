/**
 * FeedbackEffectRenderer
 * 
 * フィードバックエフェクト描画機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - Color, Border, Scale effects rendering
 * - Audio visualization effect management
 * - Canvas 2D API visual effects implementation
 * - Real-time audio data visual representation
 * 
 * @module FeedbackEffectRenderer
 * Created: Phase G.4 (Issue #103)
 */

// 型定義
export interface VisualFeedbackManager { config: FeedbackRenderConfig;
    userPreferences: UserRenderPreferences;
    feedbackElements: Map<string, HTMLElement>;
    dataArray: Uint8Array;
    analyser: AnalyserNode;
    canvasContext: CanvasRenderingContext2D;
    visualCanvas: HTMLCanvasElement;
    animationFrameId: number | null;
    triggerVisualFeedback: (options: FeedbackTriggerOptions) => void  }
}

export interface FeedbackRenderConfig { enabled: boolean;
    globalIntensity: number;
    audioMapping: AudioMappingConfig;
    effects: EffectRenderConfig;
    performance: RenderPerformanceConfig;

export interface AudioMappingConfig { frequency: Record<string, FrequencyMappingConfig>,
    volume: Record<string, VolumeMappingConfig> }

export interface FrequencyMappingConfig { range: [number, number],
    color: string;
    intensity: number;

export interface VolumeMappingConfig { range: [number, number],
    color: string;
    feedback: VolumeFeedbackConfig;

export interface VolumeFeedbackConfig { enabled: boolean;
    threshold: number;
    effects: VolumeEffectType[];

export interface EffectRenderConfig { color: ColorEffectConfig;
    border: BorderEffectConfig;
    scale: ScaleEffectConfig;

export interface ColorEffectConfig { enabled: boolean;
    duration: number;
    easing: string;
    opacity: OpacityConfig;

export interface BorderEffectConfig { enabled: boolean;
    minWidth: number;
    maxWidth: number;
    duration: number;
    easing: string;

export interface ScaleEffectConfig { enabled: boolean;
    minScale: number;
    maxScale: number;
    duration: number;
    easing: string;

export interface OpacityConfig { start: number;
    peak: number;
    end: number;

export interface RenderPerformanceConfig { maxFrameRate: number;
    skipFrames: number;
    batchSize: number;
    memoryThreshold: number;

export interface UserRenderPreferences { audioVisualization: boolean;
    enabledEffects: EffectType[];
    colorScheme: ColorSchemePreference;
    animationSpeed: AnimationSpeedPreference;
    reducedMotion: boolean;

export interface ColorSchemePreference { primary: string;
    secondary: string;
    accent: string;
    background: string;

export interface AnimationSpeedPreference { multiplier: number;
    enableTransitions: boolean;
    smoothing: boolean;

export interface EffectOptions { id: string;
    target: HTMLElement;
    color: string;
    intensity: number;
    duration: number;
    delay?: number;
    easing?: string;

export interface ColorEffectOptions extends EffectOptions { backgroundOverride?: string,
    blendMode?: string;

export interface BorderEffectOptions extends EffectOptions { width?: number,
    style?: BorderStyle;
    radius?: number;

export interface ScaleEffectOptions extends EffectOptions { scaleX?: number,
    scaleY?: number;
    origin?: TransformOrigin;

export interface EffectResult { id: string;
    target: HTMLElement;
    type: EffectType;
    cleanup: (() => void) | null;
    animation: Animation;
    startTime: number;
    duration: number;
}

export interface FeedbackTriggerOptions { type: EffectType;
    color: string;
    intensity: number;
    duration: number;
    target: HTMLElement;
    position?: EffectPosition;

export interface EffectPosition { x: number;
    y: number;
    relative: boolean;

export interface AudioVisualizationData { frequencyData: Uint8Array;
    timeData: Uint8Array;
    averageVolume: number;
    peakFrequency: number;
    dominantFrequencyRange: FrequencyRange;

export interface FrequencyRange { min: number;
    max: number;
    dominantFreq: number;

export interface VisualizationBarData { height: number;
    color: string;
    frequency: number;
    intensity: number;

export interface EdgeFeedbackData { edge: EdgeType;
    element: HTMLElement;
    color: string;
    intensity: number;
    lastTriggered: number;

export interface EffectValidationResult { isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];

export interface ValidationError { field: string;
    message: string;
    code: string;

export interface ValidationWarning { field: string;
    message: string;
    suggestion: string;

export interface RenderReport { timestamp: string;
    component: string;
    audioVisualization: AudioVisualizationReport;
    effectTypes: Record<EffectType, EffectTypeStatus>;
    configuration: ConfigurationReport;
    performance: PerformanceReport;
    errors: ErrorReport[];

export interface AudioVisualizationReport { enabled: boolean;
    hasAnalyser: boolean;
    hasCanvas: boolean;
    canvasSize: CanvasSize | null;
    frameRate: number;
    lastUpdate: number;

export interface CanvasSize { width: number;
    height: number;

export interface ConfigurationReport { enabled: boolean;
    globalIntensity: number;
    effectsEnabled: number;
    audioMappings: number;

export interface PerformanceReport { activeEffects: number;
    memoryUsage: number;
    averageFrameTime: number;
    droppedFrames: number;

export interface ErrorReport { timestamp: number;
    operation: string;
    error: string;
    stack?: string;

// 列挙型
export type EffectType = 'color' | 'border' | 'scale' | 'flash' | 'glow' | 'pulse';
export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge';
export type TransformOrigin = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type EdgeType = 'top' | 'bottom' | 'left' | 'right';
export type VolumeEffectType = 'edge' | 'flash' | 'border' | 'scale';
export type EffectTypeStatus = 'Available' | 'Disabled' | 'Error';
export type VolumeLevel = 'quiet' | 'medium' | 'loud' | 'very-loud';

// 定数
export const DEFAULT_EFFECT_CONFIG: EffectRenderConfig = { color: {
        enabled: true;
    duration: 500;
        easing: 'ease-in-out'
            }
        opacity: { start: 0, peak: 1, end: 0  };
    border: { enabled: true;
        minWidth: 1;
    maxWidth: 5;
        duration: 800;
        easing: 'ease-out'
            };
    scale: { enabled: true;
        minScale: 1.0;
    maxScale: 1.3;
        duration: 600;
        easing: 'ease-in-out'
            }
} as const;
';'

export const FREQUENCY_COLOR_MAPPING: Record<string, FrequencyMappingConfig> = { }'

    bass: { range: [20, 250], color: '#ff4444', intensity: 1.0  },''
    lowMid: { range: [250, 500], color: '#ff8844', intensity: 0.8  },''
    mid: { range: [500, 2000], color: '#ffff44', intensity: 0.9  },''
    highMid: { range: [2000, 4000], color: '#44ff44', intensity: 0.7  },''
    presence: { range: [4000, 8000], color: '#4444ff', intensity: 0.8  },''
    brilliance: { range: [8000, 20000], color: '#8844ff', intensity: 0.6  } as const;

export const VOLUME_LEVEL_MAPPING: Record<VolumeLevel, VolumeMappingConfig> = { quiet: {'
        range: [0, 0.2],
        color: '#333333'
            }
        feedback: { enabled: false, threshold: 0.1, effects: []  };

    medium: { range: [0.2, 0.5],''
        color: '#666666',' }'

        feedback: { enabled: true, threshold: 0.3, effects: ['border]  },'

    loud: { range: [0.5, 0.8],''
        color: '#ff6b6b',' }'

        feedback: { enabled: true, threshold: 0.6, effects: ['edge', 'flash] }'

    },', 'very-loud': { range: [0.8, 1.0],''
        color: '#ff0000',' }'

        feedback: { enabled: true, threshold: 0.8, effects: ['edge', 'flash', 'scale] }'
} as const;
';'

export const ANIMATION_EASING = {;
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    LINEAR: 'linear',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' } as const;

export const VISUALIZATION_CONFIG = { MIN_BAR_HEIGHT: 2,
    MAX_BAR_HEIGHT_RATIO: 0.8,
    BAR_SPACING: 1,
    SMOOTHING_FACTOR: 0.8  } as const,
';'
// ユーティリティ関数
export function validateEffectOptions(options: Partial<EffectOptions>): EffectValidationResult { const errors: ValidationError[] = [],
    const warnings: ValidationWarning[] = [],

    if (!options.id || typeof, options.id !== 'string') {
        errors.push({''
            field: 'id',','
            message: 'Effect ID is required and must be a string',' }'

            code: 'INVALID_ID'); 
    }

    if (!options.target || !options.target.style) {
        errors.push({''
            field: 'target',','
            message: 'Target element is required and must have style property',' }'

            code: 'INVALID_TARGET')'); '
    }

    if (!options.color || typeof, options.color !== 'string') {
        errors.push({''
            field: 'color',','
            message: 'Color is required and must be a valid CSS color string',' }'

            code: 'INVALID_COLOR')'); '
    }

    if(typeof, options.intensity !== 'number' || options.intensity < 0 || options.intensity > 2' { '
        errors.push({''
            field: 'intensity',','
            message: 'Intensity must be a number between 0 and 2',' }'

            code: 'INVALID_INTENSITY')'); '
    }

    if(typeof, options.duration !== 'number' || options.duration < 0' { '
        errors.push({''
            field: 'duration',','
            message: 'Duration must be a positive number',' }'

            code: 'INVALID_DURATION'); 
    }

    if (options.duration && options.duration > 5000) {
        warnings.push({)'
            field: 'duration',
            message: 'Duration is very long(>5s)' }

            suggestion: 'Consider shorter durations for better user experience' 
    }';'
    }
    
    return { isValid: errors.length === 0,
        errors };
        warnings }
    }
';'

export function getFrequencyColor(frequency: number): string { for(const [range, config] of Object.entries(FREQUENCY_COLOR_MAPPING) {''
        if (frequency >= config.range[0] && frequency <= config.range[1]) {
    
}
            return config.color;
    return '#ffffff';
}
';'

export function getVolumeLevel(volume: number): VolumeLevel { for(const [level, config] of Object.entries(VOLUME_LEVEL_MAPPING) {''
        if (volume >= config.range[0] && volume <= config.range[1]) {
    
}
            return level as VolumeLevel;
    return 'quiet';
}

export function calculateScaleAmount(intensity: number, config: ScaleEffectConfig): number { const range = config.maxScale - config.minScale,
    return config.minScale + (intensity * range) }

export function calculateBorderWidth(intensity: number, config: BorderEffectConfig): number { const range = config.maxWidth - config.minWidth,
    return Math.max(config.minWidth, config.minWidth + (intensity * range) }

export function normalizeFrequencyData(data: Uint8Array): number[] { return Array.from(data).map(value => value / 255);
export class FeedbackEffectRenderer {
    private mainController: VisualFeedbackManager;
    private config: FeedbackRenderConfig;
    private userPreferences: UserRenderPreferences;
    private dataArray: Uint8Array;
    private analyser: AnalyserNode;
    private canvasContext: CanvasRenderingContext2D;
    private visualCanvas: HTMLCanvasElement;
    // Performance tracking
    private lastFrameTime: number = 0;
    private frameCount: number = 0;
    private, errorLog: ErrorReport[] = [];

    constructor(mainController: VisualFeedbackManager) {
        this.mainController = mainController;
        this.config = mainController.config;
        this.userPreferences = mainController.userPreferences;
        this.dataArray = mainController.dataArray;
        this.analyser = mainController.analyser;
        this.canvasContext = mainController.canvasContext;
        this.visualCanvas = mainController.visualCanvas;

        ' }'

    }

        console.log('FeedbackEffectRenderer, initialized'); }'
    }

    /**
     * カラーエフェクトの作成
     */
    createColorEffect(options: ColorEffectOptions): EffectResult | null { try {
            const validation = validateEffectOptions(options);
            if (!validation.isValid) {

                console.warn('Invalid parameters for color effect:', validation.errors }
                return null;

            const originalBackground = options.target.style.background;
            const config = this.config.effects.color;
            ';'

            const keyframes = [';'
                { backgroundColor: 'transparent', opacity: config.opacity.start  },

                { backgroundColor: options.color, opacity: config.opacity.peak  },]'
                { backgroundColor: 'transparent', opacity: config.opacity.end  }]
            ];
            
            const animation = options.target.animate(keyframes, { duration: options.duration || config.duration)
               , easing: options.easing || config.easing,

            const cleanup = () => {  }'
                options.target.style.background = originalBackground; }
            };

            animation.addEventListener('finish', cleanup';'
            
            return { id: options.id,

                target: options.target,
                type: 'color',
                cleanup,
                animation,
                startTime: Date.now() },
                duration: options.duration || config.duration 
    };'} catch (error) {'
            this.logError('createColorEffect', error as Error);
            return null,

    /**
     * ボーダーエフェクトの作成
     */
    createBorderEffect(options: BorderEffectOptions): EffectResult | null { try {
            const validation = validateEffectOptions(options);
            if (!validation.isValid) {

                console.warn('Invalid parameters for border effect:', validation.errors }
                return null;
';'

            const config = this.config.effects.border;
            const borderWidth = options.width || calculateBorderWidth(options.intensity, config);
            const originalBorder = options.target.style.border;

            options.target.style.border = `${borderWidth}px ${options.style || 'solid'} ${options.color}`;
            options.target.style.opacity = '1';
            ';'

            const keyframes = [{ borderWidth: `${borderWidth}px`, opacity: 1 },]'
                { borderWidth: '0px', opacity: 0  }]
            ];
            
            const animation = options.target.animate(keyframes, { duration: options.duration || config.duration)
               , easing: options.easing || config.easing,

            const cleanup = () => { '
                options.target.style.border = originalBorder,' }'

                options.target.style.opacity = '; }'
            };

            animation.addEventListener('finish', cleanup';'
            
            return { id: options.id,

                target: options.target,
                type: 'border',
                cleanup,
                animation,
                startTime: Date.now() },
                duration: options.duration || config.duration 
    };'} catch (error) {'
            this.logError('createBorderEffect', error as Error);
            return null,

    /**
     * スケールエフェクトの作成
     */
    createScaleEffect(options: ScaleEffectOptions): EffectResult | null { try {
            const validation = validateEffectOptions(options);
            if (!validation.isValid) {

                console.warn('Invalid parameters for scale effect:', validation.errors }
                return null;
';'

            const config = this.config.effects.scale;
            const scaleAmount = calculateScaleAmount(options.intensity, config);
            const scaleX = options.scaleX || scaleAmount;
            const scaleY = options.scaleY || scaleAmount;
            const originalTransform = options.target.style.transform;
            ';'

            options.target.style.background = options.color;
            options.target.style.opacity = '0.5';

            if (options.origin) { options.target.style.transformOrigin = options.origin }
            ';'

            const keyframes = [';'
                { transform: 'scale(1)', opacity: 0  },''
                { transform: `scale(${scaleX}, ${scaleY}'}'`, opacity: 0.5 },]'
                { transform: 'scale(1)', opacity: 0  }]
            ];
            
            const animation = options.target.animate(keyframes, { duration: options.duration || config.duration)
               , easing: options.easing || config.easing,

            const cleanup = () => { '
                options.target.style.transform = originalTransform,
                options.target.style.background = ','
                options.target.style.opacity = ',' }

                options.target.style.transformOrigin = '; }'
            };

            animation.addEventListener('finish', cleanup';'
            
            return { id: options.id,

                target: options.target,
                type: 'scale',
                cleanup,
                animation,
                startTime: Date.now() },
                duration: options.duration || config.duration 
    };'} catch (error) {'
            this.logError('createScaleEffect', error as Error','
            return null,

    /**
     * オーディオ視覚化の開始
     */'
    startAudioVisualization(): void { try {'
            if (!this.analyser || !this.canvasContext) {

                console.warn('Audio, visualization cannot, start: missing, analyser or canvas context) }'
                return; }
            }
            
            const drawVisualization = (timestamp: number) => {  if (!this.config.enabled || !this.userPreferences.audioVisualization) {
                    this.mainController.animationFrameId = requestAnimationFrame(drawVisualization') }'
                    return; }
                }
                
                // Performance tracking
                if (this.lastFrameTime === 0) { this.lastFrameTime = timestamp }
                const deltaTime = timestamp - this.lastFrameTime;
                this.lastFrameTime = timestamp;
                this.frameCount++;

                this.analyser.getByteFrequencyData(this.dataArray');'
                
                const canvas = this.visualCanvas;
                const ctx = this.canvasContext;
                const width = canvas.width;
                const height = canvas.height;
                ';'
                // クリア
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(0, 0, width, height);
                
                // 周波数データの描画
                const normalizedData = normalizeFrequencyData(this.dataArray);
                const barWidth = width / this.dataArray.length;
                
                normalizedData.forEach((value, i) => {  const barHeight = Math.max(
                        VISUALIZATION_CONFIG.MIN_BAR_HEIGHT);
                        value * height * VISUALIZATION_CONFIG.MAX_BAR_HEIGHT_RATIO),
                    
                    // 周波数に基づく色の決定
                    const frequency = (i / this.dataArray.length) * 20000, // 0-20kHz
                    const color = getFrequencyColor(frequency);
                    ctx.fillStyle = color,
                    const x = i * (barWidth + VISUALIZATION_CONFIG.BAR_SPACING) }
                    ctx.fillRect(x, height - barHeight, barWidth, barHeight); }
                };
                
                // 音量レベルの処理
                const avgVolume = normalizedData.reduce((a, b) => a + b) / normalizedData.length;
                this.triggerVolumeBasedFeedback(avgVolume);
                
                this.mainController.animationFrameId = requestAnimationFrame(drawVisualization);
            };
            ';'

            drawVisualization(0);'} catch (error) {'
            this.logError('startAudioVisualization', error as Error) }
    }

    /**
     * 音量ベースフィードバックのトリガー
     */
    private triggerVolumeBasedFeedback(volume: number): void { try {
            const volumeLevel = getVolumeLevel(volume);
            const volumeConfig = VOLUME_LEVEL_MAPPING[volumeLevel],
            ','
            // 高音量時のエッジフィードバック
            if (volumeConfig.feedback.enabled && volume >= volumeConfig.feedback.threshold) {

                if(volumeConfig.feedback.effects.includes('edge) && Math.random() < 0.1) {'
            }
                    this.triggerEdgeFeedback(volumeConfig.color, volume); }

                }'} catch (error) {'
            this.logError('triggerVolumeBasedFeedback', error as Error' }'
    }

    /**
     * エッジフィードバックのトリガー'
     */''
    private triggerEdgeFeedback(color: string, intensity: number): void { try {'
            const edges: EdgeType[] = ['top', 'bottom', 'left', 'right'],
            const randomEdge = edges[Math.floor(Math.random() * edges.length)],
            const edgeElement = this.mainController.feedbackElements.get(`edge-${randomEdge)`),

            if (edgeElement) {
                this.mainController.triggerVisualFeedback({''
                    type: 'flash',
    color: color,
                    intensity: intensity * 0.5
    }
                    duration: 200) }

                    target: edgeElement)}';} catch (error) {'
            this.logError('triggerEdgeFeedback', error as Error) }
    }

    /**
     * エフェクトのクリーンアップ
     */
    cleanupEffect(effect: EffectResult): void { try {
            if (!effect) return,
            
            // アニメーションの停止
            if (effect.animation) {
    
}
                effect.animation.cancel(); }
            }
            
            // カスタムクリーンアップの実行
            if (effect.cleanup) { effect.cleanup(),' }'

            } catch (error) {
            this.logError('cleanupEffect', error as Error' }'
    }

    /**
     * レポート生成'
     */''
    generateReport('''
                color: this.config.effects.color.enabled ? 'Available' : 'Disabled',
                border: this.config.effects.border.enabled ? 'Available' : 'Disabled',
                scale: this.config.effects.scale.enabled ? 'Available' : 'Disabled',
                flash: 'Available',
                glow: 'Available',
                pulse: 'Available);'
            }''
            return { ''
                timestamp: new Date().toISOString('''
                component: 'FeedbackEffectRenderer',
    audioVisualization: {
                    enabled: this.userPreferences.audioVisualization,
                    hasAnalyser: !!this.analyser),
                    hasCanvas: !!this.visualCanvas,
    canvasSize: this.visualCanvas ? { : undefined
                        width: this.visualCanvas.width },
                        height: this.visualCanvas.height 
    } : null)
                    frameRate: this.calculateFrameRate(
    lastUpdate: this.lastFrameTime,
                },
                effectTypes,
                configuration: { enabled: this.config.enabled,
    globalIntensity: this.config.globalIntensity,
                    effectsEnabled: Object.values(effectTypes).filter(status => status === 'Available).length,'
                    audioMappings: Object.keys(this.config.audioMapping.frequency).length  }
                };
                performance: { activeEffects: 0, // 実装では実際のアクティブエフェクト数を使用
                    memoryUsage: (performance, as any).memory?.usedJSHeapSize || 0, : undefined
                    averageFrameTime: this.calculateAverageFrameTime(
    droppedFrames: 0  },
                errors: [...this.errorLog], } catch (error) { return { ''
                timestamp: new Date().toISOString('''
                component: 'FeedbackEffectRenderer',
    audioVisualization: {
                    enabled: false,
                    hasAnalyser: false,
                    hasCanvas: false,
                    canvasSize: null,
    frameRate: 0 },
                    lastUpdate: 0 
    };
                effectTypes: {} as any,
                configuration: { enabled: false,
                    globalIntensity: 0,
                    effectsEnabled: 0,
    audioMappings: 0 },
                performance: { activeEffects: 0,
                    memoryUsage: 0,
                    averageFrameTime: 0,
    droppedFrames: 0
            };
                errors: [{ ''
                    timestamp: Date.now()','
    operation: 'generateReport'),
                    error: (error, as Error).message],
                    stack: (error, as Error).stack  }]
                }]
            }
    }

    /**
     * フレームレートの計算
     */
    private calculateFrameRate(): number { // 簡易実装 - 実際の実装では移動平均を使用
        return this.frameCount > 0 ? Math.min(60, 1000 / (this.lastFrameTime / this.frameCount) : 0 }

    /**
     * 平均フレーム時間の計算
     */
    private calculateAverageFrameTime(): number { return this.frameCount > 0 ? this.lastFrameTime / this.frameCount: 0, 
    /**
     * エラーログ
     */
    private logError(operation: string, error: Error): void { const errorReport: ErrorReport = {
            timestamp: Date.now();
            operation,
            error: error.message,
    stack: error.stack  },
        this.errorLog.push(errorReport);
        
        // ログサイズ制限
        if (this.errorLog.length > 100) { this.errorLog = this.errorLog.slice(-50) }
        
        console.error(`Error in ${operation}:`, error};
    }

    /**
     * リソースの解放
     */
    destroy(): void { try {
            // アニメーションフレームのキャンセル
            if (this.mainController.animationFrameId) {

                cancelAnimationFrame(this.mainController.animationFrameId) }
                this.mainController.animationFrameId = null; }
            }
            
            // 参照のクリア
            this.mainController = null as any;
            this.config = null as any;
            this.userPreferences = null as any;
            this.dataArray = null as any;
            this.analyser = null as any;
            this.canvasContext = null as any;
            this.visualCanvas = null as any;
            this.errorLog = [];

            console.log('FeedbackEffectRenderer, destroyed');
        } catch (error) { console.error('Error destroying FeedbackEffectRenderer:', error }

    }'}'