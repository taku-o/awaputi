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
export interface VisualFeedbackManager {
    gameEngine: GameEngine;
    config: TriggerConfig;
    userPreferences: UserTriggerPreferences;
    feedbackElements: Map<string, HTMLElement>;
    feedbackContainer: HTMLElement;
    startAudioVisualization?: () => void;
    triggerVisualFeedback?: (options: VisualFeedbackOptions) => void;
    updateEventStats?: (eventType: string) => void;
}

export interface GameEngine {
    addEventListener?: (event: string, handler: (data: any) => void) => void;
    removeEventListener?: (event: string, handler?: (data: any) => void) => void;
    eventSystem?: EventSystemInterface;
}

export interface EventSystemInterface {
    on: (event: string, handler: (data: any) => void) => void;
    off: (event: string, handler?: (data: any) => void) => void;
    emit: (event: string, data?: any) => void;
}

export interface TriggerConfig {
    enabled: boolean;
    globalIntensity: number;
    positioning: PositioningConfig;
    audioMapping: AudioTriggerMapping;
    feedbackTypes: Record<string, FeedbackTypeConfig>;
    throttling: ThrottlingConfig;
}

export interface PositioningConfig {
    screenEdges: boolean;
    gameArea: boolean;
    customPositions: boolean;
}

export interface AudioTriggerMapping {
    gameEvents: Map<string, GameEventMapping>;
    volume: Record<string, VolumeLevelMapping>;
    frequency: Record<string, FrequencyMapping>;
}

export interface GameEventMapping {
    pattern: EffectPattern;
    color: string;
    intensity: number;
    duration?: number;
    target?: TargetSelection;
    conditions?: TriggerCondition[];
}

export interface VolumeLevelMapping {
    range: [number, number];
    color: string;
    effects: VolumeEffectConfig[];
    probability: number;
}

export interface VolumeEffectConfig {
    type: EffectPattern;
    intensity: number;
    duration: number;
    delay?: number;
}

export interface FrequencyMapping {
    range: [number, number];
    color: string;
    intensity: number;
    visualType: FrequencyVisualType;
}

export interface FeedbackTypeConfig {
    duration: number;
    intensity: number;
    easing: string;
    priority: TriggerPriority;
}

export interface ThrottlingConfig {
    maxConcurrent: number;
    cooldownMs: number;
    rateLimit: RateLimitConfig;
}

export interface RateLimitConfig {
    windowMs: number;
    maxTriggers: number;
    skipProbability: number;
}

export interface UserTriggerPreferences {
    gameEventFeedback: boolean;
    audioVisualization: boolean;
    enabledEventTypes: GameEventType[];
    customMappings: Map<string, GameEventMapping>;
    sensitivitySettings: SensitivitySettings;
    filterSettings: FilterSettings;
}

export interface SensitivitySettings {
    volume: number;
    gameEvents: number;
    frequency: number;
    globalModifier: number;
}

export interface FilterSettings {
    ignoreLowIntensity: boolean;
    skipRepeatedEvents: boolean;
    eventWhitelist: GameEventType[];
    eventBlacklist: GameEventType[];
}

export interface TriggerCondition {
    property: string;
    operator: ComparisonOperator;
    value: any;
    optional: boolean;
}

export interface VisualFeedbackOptions {
    type: EffectPattern;
    color: string;
    intensity: number;
    duration: number;
    target: HTMLElement;
    eventData?: any;
    position?: FeedbackPosition;
    priority?: TriggerPriority;
}

export interface FeedbackPosition {
    x?: number;
    y?: number;
    relative?: boolean;
    anchor?: PositionAnchor;
}

export interface GameEventData {
    type: GameEventType;
    position?: { x: number; y: number };
    bubble?: HTMLElement;
    score?: number;
    combo?: number;
    level?: number;
    health?: number;
    powerUpType?: string;
    timestamp: number;
    metadata?: Record<string, any>;
}

export interface TriggerStatistics {
    gameEventTriggers: number;
    volumeTriggers: number;
    edgeTriggers: number;
    manualTriggers: number;
    total: number;
    byEventType: Record<GameEventType, number>;
    averageIntensity: number;
    averageDuration: number;
}

export interface TriggerPerformanceMetrics {
    triggerLatency: number;
    processingTime: number;
    queueSize: number;
    droppedTriggers: number;
    memoryUsage: number;
}

export interface EventListenerState {
    registered: Set<GameEventType>;
    handlers: Map<GameEventType, (data: any) => void>;
    active: boolean;
}

export interface TargetSelectionResult {
    element: HTMLElement;
    confidence: number;
    fallbackUsed: boolean;
    reason: string;
}

export interface TriggerValidationResult {
    isValid: boolean;
    errors: TriggerError[];
    warnings: TriggerWarning[];
}

export interface TriggerError {
    code: string;
    message: string;
    context?: any;
}

export interface TriggerWarning {
    code: string;
    message: string;
    suggestion?: string;
}

// 列挙型
export type EffectPattern = 'flash' | 'glow' | 'pulse' | 'ripple' | 'shake' | 'border' | 'scale';
export type GameEventType = 'bubble-pop' | 'combo' | 'level-up' | 'power-up' | 'game-over' | 'pause' | 'resume';
export type TriggerPriority = 'low' | 'normal' | 'high' | 'critical';
export type FrequencyVisualType = 'bar' | 'wave' | 'circle' | 'particle';
export type ComparisonOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
export type TargetSelection = 'auto' | 'source' | 'edges' | 'center' | 'custom';
export type PositionAnchor = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

// 定数
export const DEFAULT_TRIGGER_CONFIG: TriggerConfig = {
    enabled: true,
    globalIntensity: 1.0,
    positioning: {
        screenEdges: true,
        gameArea: true,
        customPositions: false
    },
    audioMapping: {
        gameEvents: new Map(),
        volume: {},
        frequency: {}
    },
    feedbackTypes: {
        'bubble-pop': {
            duration: 300,
            intensity: 0.8,
            easing: 'ease-out',
            priority: 'normal'
        },
        'combo': {
            duration: 500,
            intensity: 1.2,
            easing: 'ease-in-out',
            priority: 'high'
        }
    },
    throttling: {
        maxConcurrent: 5,
        cooldownMs: 100,
        rateLimit: {
            windowMs: 1000,
            maxTriggers: 10,
            skipProbability: 0.1
        }
    }
} as const;

export const GAME_EVENT_COLORS: Record<GameEventType, string> = {
    'bubble-pop': '#4CAF50',
    'combo': '#FF9800',
    'level-up': '#2196F3',
    'power-up': '#9C27B0',
    'game-over': '#F44336',
    'pause': '#607D8B',
    'resume': '#8BC34A'
} as const;

// ユーティリティ関数
export function validateTriggerOptions(options: Partial<VisualFeedbackOptions>): TriggerValidationResult {
    const errors: TriggerError[] = [];
    const warnings: TriggerWarning[] = [];

    if (!options.type) {
        errors.push({
            code: 'MISSING_TYPE',
            message: 'Effect type is required'
        });
    }

    if (!options.color || typeof options.color !== 'string') {
        errors.push({
            code: 'INVALID_COLOR',
            message: 'Color must be a valid CSS color string'
        });
    }

    if (typeof options.intensity !== 'number' || options.intensity < 0 || options.intensity > 2) {
        errors.push({
            code: 'INVALID_INTENSITY',
            message: 'Intensity must be a number between 0 and 2'
        });
    }

    if (typeof options.duration !== 'number' || options.duration <= 0) {
        errors.push({
            code: 'INVALID_DURATION',
            message: 'Duration must be a positive number'
        });
    }

    if (!options.target || !options.target.style) {
        errors.push({
            code: 'INVALID_TARGET',
            message: 'Target must be a valid HTMLElement'
        });
    }

    if (options.duration && options.duration > 5000) {
        warnings.push({
            code: 'LONG_DURATION',
            message: 'Duration is very long (>5s)',
            suggestion: 'Consider shorter durations for better user experience'
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

export function selectTarget(selection: TargetSelection, eventData: GameEventData, feedbackElements: Map<string, HTMLElement>): TargetSelectionResult {
    switch (selection) {
        case 'source':
            if (eventData.bubble) {
                return {
                    element: eventData.bubble,
                    confidence: 1.0,
                    fallbackUsed: false,
                    reason: 'Source element found'
                };
            }
            break;

        case 'edges':
            const edgeElement = feedbackElements.get('edge-top');
            if (edgeElement) {
                return {
                    element: edgeElement,
                    confidence: 0.8,
                    fallbackUsed: false,
                    reason: 'Edge element selected'
                };
            }
            break;

        case 'center':
            const centerElement = feedbackElements.get('game-area');
            if (centerElement) {
                return {
                    element: centerElement,
                    confidence: 0.9,
                    fallbackUsed: false,
                    reason: 'Center area selected'
                };
            }
            break;

        case 'auto':
        default:
            // Try source first, then center, then edges
            if (eventData.bubble) {
                return {
                    element: eventData.bubble,
                    confidence: 1.0,
                    fallbackUsed: false,
                    reason: 'Auto-selected source element'
                };
            }
            
            const gameArea = feedbackElements.get('game-area');
            if (gameArea) {
                return {
                    element: gameArea,
                    confidence: 0.7,
                    fallbackUsed: true,
                    reason: 'Auto-selected game area fallback'
                };
            }
            
            const edge = feedbackElements.get('edge-top');
            if (edge) {
                return {
                    element: edge,
                    confidence: 0.5,
                    fallbackUsed: true,
                    reason: 'Auto-selected edge fallback'
                };
            }
            break;
    }

    // Final fallback - use document body
    return {
        element: document.body,
        confidence: 0.1,
        fallbackUsed: true,
        reason: 'No suitable target found, using document body'
    };
}

export class FeedbackTriggerHandler {
    private mainController: VisualFeedbackManager;
    private config: TriggerConfig;
    private userPreferences: UserTriggerPreferences;
    private gameEngine: GameEngine;
    private feedbackElements: Map<string, HTMLElement>;

    // State tracking
    private eventListeners: EventListenerState;
    private statistics: TriggerStatistics;
    private performanceMetrics: TriggerPerformanceMetrics;
    private activeTimestamp: number = 0;

    constructor(mainController: VisualFeedbackManager) {
        this.mainController = mainController;
        this.config = mainController.config;
        this.userPreferences = mainController.userPreferences;
        this.gameEngine = mainController.gameEngine;
        this.feedbackElements = mainController.feedbackElements;

        this.eventListeners = {
            registered: new Set(),
            handlers: new Map(),
            active: false
        };

        this.statistics = {
            gameEventTriggers: 0,
            volumeTriggers: 0,
            edgeTriggers: 0,
            manualTriggers: 0,
            total: 0,
            byEventType: {} as Record<GameEventType, number>,
            averageIntensity: 0,
            averageDuration: 0
        };

        this.performanceMetrics = {
            triggerLatency: 0,
            processingTime: 0,
            queueSize: 0,
            droppedTriggers: 0,
            memoryUsage: 0
        };

        console.log('FeedbackTriggerHandler initialized');
    }

    /**
     * イベントリスナーの開始
     */
    startEventListeners(): void {
        try {
            if (!this.userPreferences.gameEventFeedback || this.eventListeners.active) {
                return;
            }

            this.userPreferences.enabledEventTypes.forEach(eventType => {
                const handler = (data: any) => this.handleGameEvent(eventType, data);
                
                if (this.gameEngine.addEventListener) {
                    this.gameEngine.addEventListener(eventType, handler);
                } else if (this.gameEngine.eventSystem) {
                    this.gameEngine.eventSystem.on(eventType, handler);
                }

                this.eventListeners.handlers.set(eventType, handler);
                this.eventListeners.registered.add(eventType);
            });

            this.eventListeners.active = true;
            console.log('Event listeners started for feedback triggers');
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'TRIGGER_START_ERROR', {
                operation: 'startEventListeners',
                component: 'FeedbackTriggerHandler'
            });
        }
    }

    /**
     * ゲームイベントハンドラー
     */
    private handleGameEvent(eventType: GameEventType, data: any): void {
        try {
            const startTime = performance.now();

            if (!this.config.enabled || !this.userPreferences.gameEventFeedback) {
                return;
            }

            // Get event mapping
            const mapping = this.config.audioMapping.gameEvents.get(eventType);
            if (!mapping) {
                return;
            }

            // Validate conditions if present
            if (mapping.conditions && !this.evaluateConditions(mapping.conditions, data)) {
                return;
            }

            // Select target element
            const targetResult = selectTarget(mapping.target || 'auto', data, this.feedbackElements);
            
            // Create feedback options
            const feedbackOptions: VisualFeedbackOptions = {
                type: mapping.pattern,
                color: mapping.color,
                intensity: mapping.intensity * this.config.globalIntensity,
                duration: mapping.duration || this.config.feedbackTypes[eventType]?.duration || 300,
                target: targetResult.element,
                eventData: data,
                priority: this.config.feedbackTypes[eventType]?.priority || 'normal'
            };

            // Trigger the feedback
            if (this.mainController.triggerVisualFeedback) {
                this.mainController.triggerVisualFeedback(feedbackOptions);
            }

            // Update statistics
            this.updateStatistics('game', eventType, feedbackOptions);

            // Update performance metrics
            const endTime = performance.now();
            this.performanceMetrics.triggerLatency = endTime - startTime;

            console.log(`Triggered ${eventType} feedback:`, feedbackOptions);
        } catch (error) {
            this.performanceMetrics.droppedTriggers++;
            getErrorHandler().handleError(error as Error, 'GAME_EVENT_ERROR', {
                eventType,
                data,
                component: 'FeedbackTriggerHandler'
            });
        }
    }

    /**
     * 条件評価
     */
    private evaluateConditions(conditions: TriggerCondition[], data: any): boolean {
        return conditions.every(condition => {
            const value = this.getNestedValue(data, condition.property);
            
            if (value === undefined && !condition.optional) {
                return false;
            }
            
            if (value === undefined) {
                return true;
            }

            switch (condition.operator) {
                case 'eq': return value === condition.value;
                case 'ne': return value !== condition.value;
                case 'gt': return value > condition.value;
                case 'gte': return value >= condition.value;
                case 'lt': return value < condition.value;
                case 'lte': return value <= condition.value;
                case 'in': return Array.isArray(condition.value) && condition.value.includes(value);
                case 'contains': return typeof value === 'string' && value.includes(condition.value);
                default: return false;
            }
        });
    }

    /**
     * ネストした値の取得
     */
    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * 統計情報の更新
     */
    private updateStatistics(triggerType: string, eventType: GameEventType, options: VisualFeedbackOptions): void {
        this.statistics.total++;
        
        switch (triggerType) {
            case 'game':
                this.statistics.gameEventTriggers++;
                break;
            case 'volume':
                this.statistics.volumeTriggers++;
                break;
            case 'edge':
                this.statistics.edgeTriggers++;
                break;
            case 'manual':
                this.statistics.manualTriggers++;
                break;
        }

        if (!this.statistics.byEventType[eventType]) {
            this.statistics.byEventType[eventType] = 0;
        }
        this.statistics.byEventType[eventType]++;

        // Update averages (simplified calculation)
        const total = this.statistics.total;
        this.statistics.averageIntensity = (
            (this.statistics.averageIntensity * (total - 1)) + options.intensity
        ) / total;
        
        this.statistics.averageDuration = (
            (this.statistics.averageDuration * (total - 1)) + options.duration
        ) / total;

        // Update controller stats if available
        if (this.mainController.updateEventStats) {
            this.mainController.updateEventStats(eventType);
        }
    }

    /**
     * イベントリスナーの停止
     */
    stopEventListeners(): void {
        try {
            if (!this.eventListeners.active) {
                return;
            }

            this.eventListeners.handlers.forEach((handler, eventType) => {
                if (this.gameEngine.removeEventListener) {
                    this.gameEngine.removeEventListener(eventType, handler);
                } else if (this.gameEngine.eventSystem) {
                    this.gameEngine.eventSystem.off(eventType, handler);
                }
            });

            this.eventListeners.handlers.clear();
            this.eventListeners.registered.clear();
            this.eventListeners.active = false;

            console.log('Event listeners stopped');
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'TRIGGER_STOP_ERROR', {
                operation: 'stopEventListeners',
                component: 'FeedbackTriggerHandler'
            });
        }
    }

    /**
     * 統計情報の取得
     */
    getStatistics(): TriggerStatistics {
        return { ...this.statistics };
    }

    /**
     * パフォーマンスメトリクスの取得
     */
    getPerformanceMetrics(): TriggerPerformanceMetrics {
        return { ...this.performanceMetrics };
    }

    /**
     * リソースの解放
     */
    destroy(): void {
        console.log('Destroying FeedbackTriggerHandler...');
        
        // イベントリスナーの停止
        this.stopEventListeners();
        
        console.log('FeedbackTriggerHandler destroyed');
    }
}