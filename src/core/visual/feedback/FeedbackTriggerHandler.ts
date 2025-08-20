/**
 * FeedbackTriggerHandler
 * 
 * フィードバックトリガー処理機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - Game event feedback triggering and event management
 * - Volume-based feedback triggering
 * - Edge feedback and manual feedback handling
 * - Event listener management and statistics tracking
 * 
 * @module FeedbackTriggerHandler
 * Created: Phase G.4 (Issue #103)
 */

import { getErrorHandler } from '../../../utils/ErrorHandler.js';

// 型定義
export interface VisualFeedbackManager { gameEngine: GameEngine,
    config: TriggerConfig,
    userPreferences: UserTriggerPreferences,
    feedbackElements: Map<string, HTMLElement>,
    feedbackContainer: HTMLElement,
    startAudioVisualization?: () => void;
    triggerVisualFeedback?: (options: VisualFeedbackOptions) => void;
    updateEventStats?: (eventType: string) => void }
}

export interface GameEngine { addEventListener?: (event: string, handler: (data: any) => void) => void;
    removeEventListener?: (event: string, handler?: (data: any) => void) => void;
    eventSystem?: EventSystemInterface;
    }
}

export interface EventSystemInterface { on: (event: string, handler: (data: any) => void) => void,
    off: (event: string, handler?: (data: any) => void) => void,
    emit: (event: string, data?: any) => void }
}

export interface TriggerConfig { enabled: boolean,
    globalIntensity: number,
    positioning: PositioningConfig,
    audioMapping: AudioTriggerMapping,
    feedbackTypes: Record<string, FeedbackTypeConfig>,
    throttling: ThrottlingConfig
    }
}

export interface PositioningConfig { screenEdges: boolean,
    gameArea: boolean,
    customPositions: boolean }
}

export interface AudioTriggerMapping { gameEvents: Map<string, GameEventMapping>,
    volume: Record<string, VolumeLevelMapping>,
    frequency: Record<string, FrequencyMapping>, }
}

export interface GameEventMapping { pattern: EffectPattern,
    color: string,
    intensity: number,
    duration?: number;
    target?: TargetSelection;
    conditions?: TriggerCondition[];
    }
}

export interface VolumeLevelMapping { range: [number, number],
    color: string,
    effects: VolumeEffectConfig[],
    probability: number }
}

export interface VolumeEffectConfig { type: EffectPattern,
    intensity: number,
    duration: number,
    delay?: number }
}

export interface FrequencyMapping { range: [number, number],
    color: string,
    intensity: number,
    visualType: FrequencyVisualType
    }
}

export interface FeedbackTypeConfig { duration: number,
    intensity: number,
    easing: string,
    priority: TriggerPriority
    }
}

export interface ThrottlingConfig { maxConcurrent: number,
    cooldownMs: number,
    rateLimit: RateLimitConfig
    }
}

export interface RateLimitConfig { windowMs: number,
    maxTriggers: number,
    skipProbability: number }
}

export interface UserTriggerPreferences { gameEventFeedback: boolean,
    audioVisualization: boolean,
    enabledEventTypes: GameEventType[],
    customMappings: Map<string, GameEventMapping>,
    sensitivitySettings: SensitivitySettings,
    filterSettings: FilterSettings
    }
}

export interface SensitivitySettings { volume: number,
    gameEvents: number,
    frequency: number,
    globalModifier: number }
}

export interface FilterSettings { ignoreLowIntensity: boolean,
    skipRepeatedEvents: boolean,
    eventWhitelist: GameEventType[],
    eventBlacklist: GameEventType[]
    }
}

export interface TriggerCondition { property: string,
    operator: ComparisonOperator,
    value: any,
    optional: boolean }
}

export interface VisualFeedbackOptions { type: EffectPattern,
    color: string,
    intensity: number,
    duration: number,
    target: HTMLElement,
    eventData?: any;
    position?: FeedbackPosition;
    priority?: TriggerPriority;
    }
}

export interface FeedbackPosition { x?: number;
    y?: number;
    relative?: boolean;
    anchor?: PositionAnchor;
    }
}

export interface GameEventData { type: GameEventType,
    }
    position?: { x: number; y: number }
    bubble?: HTMLElement;
    score?: number;
    combo?: number;
    level?: number;
    health?: number;
    powerUpType?: string;
    timestamp: number,
    metadata?: Record<string, any>;
}

export interface TriggerStatistics { gameEventTriggers: number,
    volumeTriggers: number,
    edgeTriggers: number,
    manualTriggers: number,
    total: number,
    byEventType: Record<GameEventType, number>,
    averageIntensity: number,
    averageDuration: number }
}

export interface TriggerPerformanceMetrics { triggerLatency: number,
    processingTime: number,
    queueSize: number,
    droppedTriggers: number,
    memoryUsage: number }
}
';'
export interface EventListenerState { registered: Set<GameEventType>,''
    handlers: Map<GameEventType, (data: any') => void>,
    active: boolean }
}

export interface TargetSelectionResult { element: HTMLElement,
    confidence: number,
    fallbackUsed: boolean,
    reason: string }
}

export interface TriggerValidationResult { isValid: boolean,
    errors: TriggerError[],
    warnings: TriggerWarning[]
    }
}

export interface TriggerError { code: string,
    message: string,
    field?: string }
}

export interface TriggerWarning { code: string,
    message: string,
    suggestion: string }
}
';
// 列挙型
export type GameEventType = 'bubblePop' | 'combo' | 'bonus' | 'damage' | 'powerUp' | 'gameOver' | 'levelUp' | 'warning' | 'pause' | 'resume';''
export type EffectPattern = 'flash' | 'glow' | 'pulse' | 'ripple' | 'shake' | 'border' | 'scale' | 'color';''
export type TargetSelection = 'game-area' | 'edge-random' | 'edge-top' | 'edge-bottom' | 'edge-left' | 'edge-right' | 'container' | 'bubble' | 'custom';''
export type FrequencyVisualType = 'bar' | 'circle' | 'wave' | 'particle';''
export type TriggerPriority = 'low' | 'normal' | 'high' | 'critical';''
export type ComparisonOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';''
export type PositionAnchor = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';''
export type VolumeLevel = 'quiet' | 'medium' | 'loud' | 'very-loud';

// 定数
export const DEFAULT_GAME_EVENT_MAPPINGS: Record<GameEventType, GameEventMapping> = { bubblePop: {''
        pattern: 'flash','';
        color: '#4CAF50',
        intensity: 0.8,';
        duration: 300,'';
        target: 'bubble' }
    },'
    combo: { ''
        pattern: 'glow','';
        color: '#FF9800',
        intensity: 1.0,';
        duration: 500,'';
        target: 'game-area' }
    },'
    bonus: { ''
        pattern: 'pulse','';
        color: '#FFD700',
        intensity: 1.2,';
        duration: 600,'';
        target: 'game-area' }
    },'
    damage: { ''
        pattern: 'shake','';
        color: '#F44336',
        intensity: 1.5,';
        duration: 400,'';
        target: 'edge-top' }
    },'
    powerUp: { ''
        pattern: 'ripple','';
        color: '#2196F3',
        intensity: 1.0,';
        duration: 800,'';
        target: 'game-area' }
    },'
    gameOver: { ''
        pattern: 'flash','';
        color: '#9C27B0',
        intensity: 2.0,';
        duration: 1000,'';
        target: 'container' }
    },'
    levelUp: { ''
        pattern: 'glow','';
        color: '#00E676',
        intensity: 1.5,';
        duration: 1000,'';
        target: 'game-area' }
    },'
    warning: { ''
        pattern: 'pulse','';
        color: '#FF5722',
        intensity: 1.3,';
        duration: 500,'';
        target: 'edge-top' }
    },'
    pause: { ''
        pattern: 'fade','';
        color: '#607D8B',
        intensity: 0.5,';
        duration: 300,'';
        target: 'container' }
    },'
    resume: { ''
        pattern: 'flash','';
        color: '#8BC34A',
        intensity: 0.7,';
        duration: 200,'';
        target: 'container' }
    }
} as const,

export const VOLUME_LEVEL_MAPPINGS: Record<VolumeLevel, VolumeLevelMapping> = { quiet: {'
        range: [0, 0.2],'';
        color: '#E0E0E0',
        effects: [],
        probability: 0 }
    },'
    medium: { range: [0.2, 0.5],''
        color: '#FFC107',';
        effects: [' }]'
            { type: 'border', intensity: 0.3, duration: 200 }]
        ],
        probability: 0.05;
    },'
    loud: { range: [0.5, 0.8],''
        color: '#FF9800',';
        effects: [' }'
            { type: 'flash', intensity: 0.5, duration: 150 },']'
            { type: 'border', intensity: 0.7, duration: 300 }]
        ],
        probability: 0.1';
    },''
    'very-loud': { range: [0.8, 1.0],''
        color: '#F44336',';
        effects: [' }'
            { type: 'shake', intensity: 1.0, duration: 200 },']'
            { type: 'flash', intensity: 0.8, duration: 100 }]
        ],
        probability: 0.2;
    }
} as const,'
'';
export const EDGE_TYPES = ['top', 'bottom', 'left', 'right'] as const;

export const TRIGGER_PRIORITIES: Record<TriggerPriority, number> = { low: 1,
    normal: 2,
    high: 3,
    critical: 4 }
} as const,

export const DEFAULT_THROTTLING_CONFIG: ThrottlingConfig = { maxConcurrent: 3,
    cooldownMs: 100,
    rateLimit: {
        windowMs: 1000,
        maxTriggers: 10,
        skipProbability: 0.1 }
    }
} as const,

// ユーティリティ関数
export function validateTriggerOptions(options: Partial<VisualFeedbackOptions>): TriggerValidationResult { const errors: TriggerError[] = [],
    const warnings: TriggerWarning[] = [],
    '';
    if(!options.type') {'
        errors.push({''
            code: 'MISSING_TYPE',')';
            message: 'Effect type is required',')
    }'
            field: 'type'); }
    }'
    '';
    if(!options.color') {'
        errors.push({''
            code: 'MISSING_COLOR',')';
            message: 'Color is required',')
    }'
            field: 'color')'); }
    }'
    '';
    if(typeof options.intensity !== 'number' || options.intensity < 0') {'
        errors.push({''
            code: 'INVALID_INTENSITY',')';
            message: 'Intensity must be a non-negative number',')
    }'
            field: 'intensity')'); }
    }'
    '';
    if(typeof options.duration !== 'number' || options.duration <= 0') {'
        errors.push({''
            code: 'INVALID_DURATION',')';
            message: 'Duration must be a positive number',')
    }'
            field: 'duration'); }
    }'
    '';
    if(!options.target') {'
        errors.push({''
            code: 'MISSING_TARGET',')';
            message: 'Target element is required',')
    }'
            field: 'target'); }
    }'
    '';
    if(options.intensity && options.intensity > 2.0') {'
        warnings.push({')'
            code: 'HIGH_INTENSITY''),'';
            message: 'Intensity is very high (>2.0')','
    }'
            suggestion: 'Consider using lower intensity for better user experience' }
        }),
    }'
    '';
    if(options.duration && options.duration > 2000') {'
        warnings.push({')'
            code: 'LONG_DURATION''),'';
            message: 'Duration is very long (>2s')','
    }'
            suggestion: 'Consider shorter durations to avoid overwhelming users' }
        }),
    }
    
    return { isValid: errors.length === 0,
        errors, };
        warnings }
    };
}
';'
export function getVolumeLevel(volume: number): VolumeLevel { for(const [level, config] of Object.entries(VOLUME_LEVEL_MAPPINGS) {''
        if(volume >= config.range[0] && volume <= config.range[1]') {
            
        }
            return level as VolumeLevel; }
        }'
    }''
    return 'quiet';
}

export function calculateTriggerProbability(baseProb: number, intensity: number, volume: number): number { const intensityFactor = Math.min(2.0, Math.max(0.1, intensity);
    const volumeFactor = Math.min(1.0, Math.max(0.1, volume);
    return Math.min(1.0, baseProb * intensityFactor * volumeFactor); }
}

export function selectRandomEdge(): string { return EDGE_TYPES[Math.floor(Math.random() * EDGE_TYPES.length)]; }
}

export function normalizeIntensity(intensity: number, globalIntensity: number): number { return Math.min(2.0, Math.max(0, intensity * globalIntensity); }
}

export class FeedbackTriggerHandler {
    private mainController: VisualFeedbackManager;
    private gameEngine: GameEngine;
    private config: TriggerConfig;
    private userPreferences: UserTriggerPreferences;
    private feedbackElements: Map<string, HTMLElement>;
    private feedbackContainer: HTMLElement;
    // 統計とメトリクス
    private triggerStats: TriggerStatistics;
    private performanceMetrics: TriggerPerformanceMetrics;
    private eventListenerState: EventListenerState;
    // レート制限とスロットリング
    private lastTriggerTimes: Map<string, number>;
    private triggerQueue: VisualFeedbackOptions[];
    constructor(mainController: VisualFeedbackManager) {

        this.mainController = mainController;
        this.gameEngine = mainController.gameEngine;
        this.config = mainController.config;
        this.userPreferences = mainController.userPreferences;
        this.feedbackElements = mainController.feedbackElements;
        this.feedbackContainer = mainController.feedbackContainer;
        
        // 統計の初期化
        this.triggerStats = {
            gameEventTriggers: 0,
            volumeTriggers: 0,
            edgeTriggers: 0,
            manualTriggers: 0,

    }
    }
            total: 0, }
            byEventType: {} as Record<GameEventType, number>,
            averageIntensity: 0,
            averageDuration: 0;
        },
        
        this.performanceMetrics = { triggerLatency: 0,
            processingTime: 0,
            queueSize: 0,
            droppedTriggers: 0,
            memoryUsage: 0 }
        },
        
        this.eventListenerState = { registered: new Set(),
            handlers: new Map(),
            active: false }
        },
        
        this.lastTriggerTimes = new Map();
        this.triggerQueue = [];
        
        // イベントタイプごとの統計初期化
        Object.values(DEFAULT_GAME_EVENT_MAPPINGS).forEach((_, key) => { this.triggerStats.byEventType[key as GameEventType] = 0;' }'
        }');'
        '';
        console.log('FeedbackTriggerHandler initialized');
    }

    /**
     * イベントリスナーの設定
     */'
    setupEventListeners(): void { try {'
            if(!this.gameEngine || this.eventListenerState.active') {'
                '';
                console.warn('Cannot setup event listeners: game engine missing or already active''),
            }
                return; }
            }
            ';'
            const eventTypes: GameEventType[] = ['';
                'bubblePop', 'combo', 'bonus', 'damage',']';
                'powerUp', 'gameOver', 'levelUp', 'warning'];
            ];
            
            eventTypes.forEach(eventType => {  );
                const handler = (eventData: GameEventData) => { }
                    this.triggerGameEventFeedback(eventType, eventData); }
                };
                
                this.eventListenerState.handlers.set(eventType, handler);
                this.gameEngine.addEventListener? .(eventType, handler);
                this.eventListenerState.registered.add(eventType);
            });
            
            this.eventListenerState.active = true;
            
            // オーディオ視覚化の開始
            if (this.userPreferences.audioVisualization && this.mainController.startAudioVisualization) { this.mainController.startAudioVisualization(); }
            }
            
            console.log(`Game event listeners set up for ${this.eventListenerState.registered.size) events`});
            ';'
        } catch (error) { ''
            getErrorHandler(').handleError(error as Error, 'TRIGGER_HANDLER_ERROR', { : undefined')'
                operation: 'setupEventListeners',);
                hasGameEngine: !!this.gameEngine) }
            });
        }
    }

    /**
     * ゲームイベントフィードバックのトリガー
     */
    private triggerGameEventFeedback(eventType: GameEventType, eventData: GameEventData): void { try {
            const startTime = performance.now();
            
            if(!this.config.enabled || !this.userPreferences.gameEventFeedback) {
            
                
            
            }
                return; }
            }
            
            // イベントフィルタリング
            if(!this.shouldTriggerEvent(eventType, eventData) { return; }
            }
            
            const mapping = this.config.audioMapping.gameEvents.get(eventType) || ;
                           DEFAULT_GAME_EVENT_MAPPINGS[eventType];
            
            if(!mapping) {
            
                
            
            }
                console.warn(`No feedback mapping for event: ${eventType)`});
                return;
            }
            
            // カスタムマッピングの確認
            const customMapping = this.userPreferences.customMappings.get(eventType);
            const finalMapping = customMapping || mapping;
            
            // 強度の計算
            const intensity = normalizeIntensity(finalMapping.intensity, this.config.globalIntensity);
            
            // フィードバックオプションの構築
            const feedbackOptions: VisualFeedbackOptions = { type: finalMapping.pattern,
                color: finalMapping.color,
                intensity,;
                duration: finalMapping.duration || this.config.feedbackTypes[finalMapping.pattern]? .duration || 500, : undefined'';
                target: this.selectFeedbackTarget(eventType, eventData').element,';
                eventData,'';
                priority: this.config.feedbackTypes[finalMapping.pattern]? .priority || 'normal' }
            },
            
            // バリデーション
            const validation = validateTriggerOptions(feedbackOptions);''
            if(!validation.isValid') {'
                : undefined'';
                console.warn('Invalid feedback options:', validation.errors)
            }
                return; }
            }
            
            // メインコントローラーのフィードバック実行
            if (this.mainController.triggerVisualFeedback) { this.mainController.triggerVisualFeedback(feedbackOptions); }
            }
            
            // 統計更新
            this.updateStatistics(eventType, feedbackOptions, startTime);
            ';'
        } catch (error) { ''
            getErrorHandler(').handleError(error as Error, 'GAME_EVENT_FEEDBACK_ERROR', {)
                eventType,) }
                eventData: eventData ? { type: typeof eventData } : null),
            });
        }
    }

    /**
     * イベントトリガーの可否判定
     */
    private shouldTriggerEvent(eventType: GameEventType, eventData: GameEventData): boolean { // ユーザー設定のフィルタリング
        if(this.userPreferences.filterSettings.eventBlacklist.includes(eventType) {
            
        }
            return false; }
        }
        
        if(this.userPreferences.filterSettings.eventWhitelist.length > 0 &&);
            !this.userPreferences.filterSettings.eventWhitelist.includes(eventType) { return false; }
        }
        
        // レート制限チェック
        const now = Date.now();
        const lastTrigger = this.lastTriggerTimes.get(eventType) || 0;
        const cooldown = this.config.throttling.cooldownMs;
        
        if (now - lastTrigger < cooldown) { return false; }
        }
        
        // 低強度フィルタリング
        if(this.userPreferences.filterSettings.ignoreLowIntensity) {
            const mapping = this.config.audioMapping.gameEvents.get(eventType) || ;
                           DEFAULT_GAME_EVENT_MAPPINGS[eventType];
            if (mapping && mapping.intensity < 0.3) {
        }
                return false; }
            }
        }
        
        this.lastTriggerTimes.set(eventType, now);
        return true;
    }

    /**
     * フィードバックターゲットの選択
     */''
    private selectFeedbackTarget(eventType: GameEventType, eventData: GameEventData'): TargetSelectionResult { try {
            let element: HTMLElement | null = null,
            let confidence = 1.0;'
            let fallbackUsed = false;''
            let reason = '';
            ';
            // イベントタイプに基づいてターゲットを決定
            switch(eventType') {'
                '';
                case 'bubblePop':'';
                    element = eventData? .bubble || this.feedbackElements.get('game-area''); : undefined''
                    reason = eventData?.bubble ? 'bubble element' : 'game area fallback';
                    confidence = eventData?.bubble ? 1.0 : 0.8;
                    break;'
                    '';
                case 'damage':'';
                    element = this.feedbackElements.get('edge-top'') || this.feedbackContainer;''
                    reason = 'top edge for damage indication';
                    break;'
                    '';
                case 'combo':'';
                case 'bonus':'';
                case 'powerUp':'';
                case 'levelUp':'';
                    element = this.feedbackElements.get('game-area'') || this.feedbackContainer;''
                    reason = 'game area for positive events';
                    break;'
                    '';
                case 'gameOver':';
                    element = this.feedbackContainer;''
                    reason = 'full container for game over';
                    break;'
                    '';
                case 'warning':'';
                    element = this.feedbackElements.get('edge-top'') || '';
                             this.feedbackElements.get('game-area'') || ';'
                             this.feedbackContainer;''
                    reason = 'top edge or game area for warnings';
                    confidence = 0.9;
                    break;'
                    '';
                default: element = this.feedbackElements.get('game-area'') || this.feedbackContainer,'';
                    reason = 'default game area';
                    confidence = 0.7;
            }
                    break; }
            }
            ';
            // フォールバック処理
            if(!element') {
                element = this.feedbackContainer;
                fallbackUsed = true;'
                confidence = 0.5;'
            }'
                reason = 'fallback to container'; }
            }
            
            return { element,
                confidence,
                fallbackUsed, };
                reason }
            };
            ';'
        } catch (error) { ''
            getErrorHandler(').handleError(error as Error, 'TARGET_SELECTION_ERROR', {)
                eventType);'
                availableElements: Array.from(this.feedbackElements? .keys() || []),' }'
            }');
            
            return { : undefined
                element: this.feedbackContainer,
                confidence: 0.1,';
                fallbackUsed: true,' };'
                reason: 'error fallback to container' }
            },
        }
    }

    /**
     * 音量ベースフィードバックのトリガー
     */
    triggerVolumeBasedFeedback(volume: number): void { try {
            if(!this.config.enabled || !this.userPreferences.audioVisualization) {
                
            }
                return; }
            }
            
            const volumeLevel = getVolumeLevel(volume);
            const volumeConfig = VOLUME_LEVEL_MAPPINGS[volumeLevel];
            
            if (!volumeConfig.effects.length) { return; }
            }
            
            // 確率に基づく実行判定
            const probability = calculateTriggerProbability(;
                volumeConfig.probability);
                this.userPreferences.sensitivitySettings.volume);
                volume;
            );
            
            if (Math.random() > probability) { return; }
            }
            
            // エフェクトの実行
            volumeConfig.effects.forEach(effectConfig => {  ); }
                this.triggerEdgeFeedback(volumeConfig.color, volume * effectConfig.intensity); }
            });
            
            this.triggerStats.volumeTriggers++;
            ';'
        } catch (error) { ''
            getErrorHandler(').handleError(error as Error, 'VOLUME_FEEDBACK_ERROR', {)
                volume);
                enabled: this.config.enabled,);
                audioVisualization: this.userPreferences.audioVisualization) }
            });
        }
    }

    /**
     * エッジフィードバックのトリガー
     */
    triggerEdgeFeedback(color: string, intensity: number): void { try {
            if(!this.config.enabled || !this.config.positioning.screenEdges) {
                
            }
                return; }
            }
            
            const randomEdge = selectRandomEdge();
            const edgeElement = this.feedbackElements.get(`edge-${ randomEdge)`);'
            ' }'
            if(edgeElement && this.mainController.triggerVisualFeedback'}) {'
                const feedbackOptions: VisualFeedbackOptions = {''
                    type: 'flash',
                    color,
                    intensity: intensity * 0.5, // エッジフィードバックは少し弱く;
                    duration: 200,
                    target: edgeElement,'
            }'
                    priority: 'low' }
                },
                
                this.mainController.triggerVisualFeedback(feedbackOptions);
                this.triggerStats.edgeTriggers++;'
            } catch (error) { ''
            getErrorHandler(').handleError(error as Error, 'EDGE_FEEDBACK_ERROR', {)
                color);
                intensity,);
                enabledEdges: this.config.positioning.screenEdges),
                availableElements: Array.from(this.feedbackElements? .keys() || []) }
            });
        }
    }

    /**
     * 手動フィードバックトリガー
     */ : undefined
    triggerManualFeedback(type: EffectPattern, options: Partial<VisualFeedbackOptions> = { ): void {'
        try {'
            if(!this.config.enabled') {'
                '';
                console.warn('Visual feedback is disabled'');
            }
                return; }
            }
            ';'
            const feedbackOptions: VisualFeedbackOptions = { type,''
                color: options.color || '#ffffff',
                intensity: options.intensity || 1.0,
                duration: options.duration || 300,
                target: options.target || this.feedbackContainer,';
                eventData: options.eventData || null,'';
                priority: options.priority || 'normal' }
            },
            ';'
            const validation = validateTriggerOptions(feedbackOptions);''
            if(!validation.isValid') {'
                '';
                console.warn('Invalid manual feedback options:', validation.errors)
            }
                return; }
            }
            
            if (this.mainController.triggerVisualFeedback) { this.mainController.triggerVisualFeedback(feedbackOptions); }
            }
            
            this.triggerStats.manualTriggers++;
            this.triggerStats.total++;
            
            console.log(`Manual feedback triggered: ${type)`, options});
            ';'
        } catch (error) { ''
            getErrorHandler(').handleError(error as Error, 'MANUAL_FEEDBACK_ERROR', {)
                type,);
                options); }
            });
        }
    }

    /**
     * 統計の更新
     */
    private updateStatistics(eventType: GameEventType, options: VisualFeedbackOptions, startTime: number): void { this.triggerStats.gameEventTriggers++;
        this.triggerStats.total++;
        this.triggerStats.byEventType[eventType]++;
        
        // 平均値の更新
        const totalTriggers = this.triggerStats.total;
        this.triggerStats.averageIntensity = ;
            (this.triggerStats.averageIntensity * (totalTriggers - 1) + options.intensity) / totalTriggers;
        this.triggerStats.averageDuration = ;
            (this.triggerStats.averageDuration * (totalTriggers - 1) + options.duration) / totalTriggers;
        
        // パフォーマンスメトリクス
        this.performanceMetrics.processingTime = performance.now() - startTime;
        this.performanceMetrics.queueSize = this.triggerQueue.length;
        
        // メインコントローラーの統計更新
        this.mainController.updateEventStats? .(eventType); }
    }

    /**
     * イベントリスナーの削除
     */ : undefined
    removeEventListeners(): void { try {
            if(!this.eventListenerState.active) {
                
            }
                return; }
            }
            
            for (const [eventType, handler] of this.eventListenerState.handlers) { this.gameEngine.removeEventListener? .(eventType, handler); }
            }
            ';'
            this.eventListenerState.registered.clear();''
            this.eventListenerState.handlers.clear()';
            console.log('Event listeners removed');'
        } catch (error) { ''
            getErrorHandler(').handleError(error as Error, 'REMOVE_LISTENERS_ERROR'); }
        }
    }

    /**
     * トリガー統計の取得
     */ : undefined
    getTriggerStats(): TriggerStatistics {
        return { ...this.triggerStats };
    }

    /**
     * パフォーマンスメトリクスの取得
     */
    getPerformanceMetrics(): TriggerPerformanceMetrics {
        return { ...this.performanceMetrics };
    }

    /**
     * トリガー統計のリセット
     */
    resetTriggerStats(): void { this.triggerStats = {
            gameEventTriggers: 0,
            volumeTriggers: 0,
            edgeTriggers: 0,
            manualTriggers: 0,
            total: 0, }
            byEventType: {} as Record<GameEventType, number>,
            averageIntensity: 0,
            averageDuration: 0;
        },
        
        // イベントタイプごとの統計初期化
        Object.keys(DEFAULT_GAME_EVENT_MAPPINGS).forEach(key => {  ')'
            this.triggerStats.byEventType[key as GameEventType] = 0)');'
        ' }'
        console.log('Trigger stats reset'); }
    }

    /**
     * 設定の更新'
     */''
    updateConfig()';
        console.log('FeedbackTriggerHandler config updated');
    }

    /**
     * リソースの解放'
     */''
    destroy()';
        console.log('Destroying FeedbackTriggerHandler...');
        
        // イベントリスナーの削除
        this.removeEventListeners();
        
        // キューのクリア
        this.triggerQueue = [];''
        this.lastTriggerTimes.clear()';
        console.log('FeedbackTriggerHandler destroyed'');'
    }''
}