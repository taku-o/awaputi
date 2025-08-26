import { getErrorHandler } from '../utils/ErrorHandler.js';
import { FeedbackConfigManager } from './visual/feedback/FeedbackConfigManager.js';
import { FeedbackAnimationManager } from './visual/feedback/FeedbackAnimationManager.js';
import { FeedbackEffectRenderer } from './visual/feedback/FeedbackEffectRenderer.js';
import { FeedbackTriggerHandler } from './visual/feedback/FeedbackTriggerHandler.js';

/**
 * 視覚フィードバック管理クラス（Main Controller）
 * 
 * Phase G.4で分割されたMain Controller Pattern実装
 * 聴覚情報の視覚的表現とカスタマイズ可能なフィードバックパターンを統制します。
 * 
 * アーキテクチャ構成：
 * - FeedbackAnimationManager: アニメーション効果の管理
 * - FeedbackEffectRenderer: 視覚効果の描画処理
 * - FeedbackTriggerHandler: トリガーとイベント処理
 * - FeedbackConfigManager: 設定と要素管理
 * 
 * 主な責任：
 * - サブコンポーネントの統制と調整
 * - 公開APIの維持（後方互換性保証）
 * - アクセシビリティ機能との統合
 * - リアルタイム音響データの視覚化
 * 
 * @class VisualFeedbackManager
 * @implements {MainControllerPattern}
 * @since Phase G.4
 * @author Claude Code
 * 
 * @example
 * const manager = new VisualFeedbackManager(audioAccessibilityManager);
 * await manager.initialize()
 * manager.showFeedback('bubble_pop', { intensity: 0.8 })
 */
export class VisualFeedbackManager {
    // private _audioAccessibilityManager: any;
    // private accessibilityManager: any;
    // private _gameEngine: any;
    private config: any;
    private userPreferences: any;
    private activeEffects: Map<string, any>;
    private effectQueue: any[];
    private feedbackElements: Map<string, any>;
    // private _audioContext: AudioContext | null;
    // private _analyser: AnalyserNode | null;
    // private _dataArray: Uint8Array | null;
    private visualCanvas: HTMLCanvasElement | null;
    // private _canvasContext: CanvasRenderingContext2D | null;
    private animationFrameId: number | null;
    private stats: any;
    private configManager: FeedbackConfigManager;
    private animationManager: FeedbackAnimationManager;
    private effectRenderer: FeedbackEffectRenderer;
    private triggerHandler: FeedbackTriggerHandler;
    private effectPatterns: Map<string, (options: any) => any>;
    private feedbackContainer: HTMLElement | undefined;

    constructor(audioAccessibilityManager: any) {
        // this._audioAccessibilityManager = audioAccessibilityManager;
        // this.accessibilityManager = audioAccessibilityManager.accessibilityManager;
        // this._gameEngine = this.accessibilityManager?.gameEngine;
        
        // 視覚フィードバック設定
        this.config = {
            enabled: false,
            globalIntensity: 1.0,
            feedbackTypes: {
                flash: { enabled: true, intensity: 1.0, duration: 300 },
                glow: { enabled: true, intensity: 0.8, duration: 500 },
                pulse: { enabled: true, intensity: 0.9, duration: 800 },
                ripple: { enabled: true, intensity: 0.7, duration: 1000 },
                shake: { enabled: true, intensity: 0.6, duration: 200 },
                color: { enabled: true, intensity: 1.0, duration: 400 },
                border: { enabled: true, intensity: 0.8, duration: 350 },
                scale: { enabled: true, intensity: 0.5, duration: 600 }
            },
            audioMapping: {
                frequency: {
                    low: { range: [20, 250], color: '#ff6b6b', pattern: 'pulse' },
                    midLow: { range: [250, 500], color: '#4ecdc4', pattern: 'glow' },
                    mid: { range: [500, 2000], color: '#45b7d1', pattern: 'flash' },
                    midHigh: { range: [2000, 4000], color: '#96ceb4', pattern: 'ripple' },
                    high: { range: [4000, 8000], color: '#ffeaa7', pattern: 'shake' },
                    veryHigh: { range: [8000, 20000], color: '#dda0dd', pattern: 'scale' }
                },
                volume: {
                    quiet: { range: [0, 0.3], intensity: 0.3 },
                    normal: { range: [0.3, 0.7], intensity: 0.7 },
                    loud: { range: [0.7, 1.0], intensity: 1.0 }
                },
                gameEvents: new Map([
                    ['bubblePop', { color: '#4ecdc4', pattern: 'flash', intensity: 0.8 }],
                    ['combo', { color: '#ffd93d', pattern: 'pulse', intensity: 1.0 }],
                    ['bonus', { color: '#6c5ce7', pattern: 'glow', intensity: 0.9 }],
                    ['damage', { color: '#ff6b6b', pattern: 'shake', intensity: 1.0 }],
                    ['powerUp', { color: '#00cec9', pattern: 'ripple', intensity: 0.8 }],
                    ['gameOver', { color: '#fd79a8', pattern: 'flash', intensity: 1.0 }],
                    ['levelUp', { color: '#fdcb6e', pattern: 'scale', intensity: 0.9 }],
                    ['warning', { color: '#e17055', pattern: 'border', intensity: 0.7 }]
                ])
            },
            positioning: {
                screenEdges: true,
                gameArea: true,
                uiElements: true,
                fullScreen: false
            },
            performance: {
                maxConcurrentEffects: 10,
                reducedMotion: false,
                gpuAcceleration: true
            }
        };
        
        // ユーザー設定
        this.userPreferences = {
            enabled: false,
            globalIntensity: 1.0,
            preferredPatterns: ['flash', 'glow', 'pulse'],
            colorPreferences: new Map(),
            reducedMotion: false,
            audioVisualization: true,
            gameEventFeedback: true,
            customMappings: new Map()
        };
        
        // 視覚効果管理
        this.activeEffects = new Map();
        this.effectQueue = [];
        this.feedbackElements = new Map();
        // this._audioContext = null;
        // this._analyser = null;
        // this._dataArray = null;
        
        // Canvas とコンテキスト
        this.visualCanvas = null;
        // this._canvasContext = null;
        this.animationFrameId = null;
        
        // 統計情報
        this.stats = {
            effectsTriggered: 0,
            effectsByType: new Map(),
            effectsByEvent: new Map(),
            averageIntensity: 0,
            totalDuration: 0,
            sessionStart: Date.now()
        };
        
        // サブコンポーネントの初期化（依存注入）
        this.configManager = new FeedbackConfigManager(this as any);
        this.animationManager = new FeedbackAnimationManager(this as any);
        this.effectRenderer = new FeedbackEffectRenderer(this as any);
        this.triggerHandler = new FeedbackTriggerHandler(this as any);
        
        // エフェクトパターンマッピング（サブコンポーネントへの委任）
        this.effectPatterns = new Map([
            ['flash', (options: any) => (this.animationManager as any).createFlashEffect?.(options)],
            ['glow', (options: any) => (this.animationManager as any).createGlowEffect?.(options)],
            ['pulse', (options: any) => (this.animationManager as any).createPulseEffect?.(options)],
            ['ripple', (options: any) => (this.animationManager as any).createRippleEffect?.(options)],
            ['shake', (options: any) => (this.animationManager as any).createShakeEffect?.(options)],
            ['color', (options: any) => (this.effectRenderer as any).createColorEffect?.(options)],
            ['border', (options: any) => (this.effectRenderer as any).createBorderEffect?.(options)],
            ['scale', (options: any) => (this.effectRenderer as any).createScaleEffect?.(options)]
        ]);

        console.log('VisualFeedbackManager initialized with sub-components');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize(): void {
        try {
            // ユーザー設定の読み込み（委任）
            this.configManager.loadUserPreferences();
            // 視覚フィードバック要素の作成（委任）
            this.configManager.createFeedbackElements();
            // オーディオ分析の設定（委任）
            this.configManager.setupAudioAnalysis();
            // イベントリスナーの設定（委任）
            if ((this.triggerHandler as any).setupEventListeners) {
                (this.triggerHandler as any).setupEventListeners();
            }

            console.log('VisualFeedbackManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'VISUAL_FEEDBACK_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * ゲームイベントフィードバックのトリガー（委任）
     */
    triggerGameEventFeedback(eventType: string, eventData: any): void {
        if ((this.triggerHandler as any).triggerGameEventFeedback) {
            (this.triggerHandler as any).triggerGameEventFeedback(eventType, eventData);
        }
    }
    
    /**
     * フィードバックターゲットの選択（委任）
     */
    selectFeedbackTarget(eventType: string, eventData: any): HTMLElement | null {
        return (this.triggerHandler as any).selectFeedbackTarget?.(eventType, eventData) || null;
    }
    
    /**
     * 視覚フィードバックのトリガー
     */
    triggerVisualFeedback(options: any): void {
        const {
            type = 'flash',
            color = '#ffffff',
            intensity = 1.0,
            duration = 300,
            target = this.feedbackContainer,
            eventData = null
        } = options;
        
        // 同時エフェクト数の制限
        if (this.activeEffects.size >= this.config.performance.maxConcurrentEffects) {
            this.effectQueue.push(options);
            return;
        }
        
        // エフェクトパターンの実行
        const patternFunction = this.effectPatterns.get(type);
        if (!patternFunction) {
            console.warn(`Unknown effect pattern: ${type}`);
            return;
        }
        
        const effectId = this.generateEffectId();
        const effect = patternFunction({
            id: effectId,
            target,
            color,
            intensity: intensity * this.userPreferences.globalIntensity,
            duration,
            eventData
        });
        
        if (effect) {
            this.activeEffects.set(effectId, effect);
            
            // エフェクト終了時の処理
            setTimeout(() => {
                this.cleanupEffect(effectId);
                this.processEffectQueue();
            }, duration);
            
            this.stats.effectsTriggered++;
            this.updateTypeStats(type);
        }
    }
    
    /**
     * エフェクトIDの生成
     */
    generateEffectId(): string {
        return `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * オーディオ視覚化の開始（委任）
     */
    startAudioVisualization(): void {
        if ((this.effectRenderer as any).startAudioVisualization) {
            (this.effectRenderer as any).startAudioVisualization();
        }
    }
    
    /**
     * 周波数に基づく色の取得（委任）
     */
    getFrequencyColor(frequency: number): string {
        return (this.effectRenderer as any).getFrequencyColor?.(frequency) || '#ffffff';
    }
    
    /**
     * 音量ベースフィードバックのトリガー（委任）
     */
    triggerVolumeBasedFeedback(volume: number): void {
        if ((this.effectRenderer as any).triggerVolumeBasedFeedback) {
            (this.effectRenderer as any).triggerVolumeBasedFeedback(volume);
        }
    }
    
    /**
     * エッジフィードバックのトリガー（委任）
     */
    triggerEdgeFeedback(color: string, intensity: number): void {
        if ((this.effectRenderer as any).triggerEdgeFeedback) {
            (this.effectRenderer as any).triggerEdgeFeedback(color, intensity);
        }
    }
    
    /**
     * エフェクトキューの処理
     */
    processEffectQueue(): void {
        if (this.effectQueue.length > 0 && 
            this.activeEffects.size < this.config.performance.maxConcurrentEffects) {
            const nextEffect = this.effectQueue.shift();
            this.triggerVisualFeedback(nextEffect);
        }
    }
    
    /**
     * エフェクトのクリーンアップ
     */
    cleanupEffect(effectId: string): void {
        const effect = this.activeEffects.get(effectId);
        if (effect) {
            if (effect.cleanup && typeof effect.cleanup === 'function') {
                effect.cleanup();
            }
            this.activeEffects.delete(effectId);
        }
    }
    
    /**
     * 統計更新
     */
    updateEventStats(eventType: string): void {
        const count = this.stats.effectsByEvent.get(eventType) || 0;
        this.stats.effectsByEvent.set(eventType, count + 1);
    }
    
    updateTypeStats(type: "single" | "batch"): void {
        const count = this.stats.effectsByType.get(type) || 0;
        this.stats.effectsByType.set(type, count + 1);
    }
    
    // パブリックAPI
    
    /**
     * 視覚フィードバックの有効化
     */
    enable(): void {
        this.config.enabled = true;
        this.userPreferences.enabled = true;
        
        // 視覚化の開始
        if (this.userPreferences.audioVisualization && !this.animationFrameId) {
            this.startAudioVisualization();
        }

        this.configManager.saveUserPreferences();
        console.log('Visual feedback enabled');
    }
    
    /**
     * 視覚フィードバックの無効化
     */
    disable(): void {
        this.config.enabled = false;
        this.userPreferences.enabled = false;
        
        // すべてのアクティブエフェクトをクリア
        for (const effectId of this.activeEffects.keys()) {
            this.cleanupEffect(effectId);
        }
        
        // 視覚化の停止
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        this.configManager.saveUserPreferences();
        console.log('Visual feedback disabled');
    }
    
    /**
     * グローバル強度の設定（委任）
     */
    setGlobalIntensity(intensity: number): void {
        this.configManager.setGlobalIntensity(intensity);
    }
    
    /**
     * カスタムイベントマッピングの追加（委任）
     */
    addCustomEventMapping(eventType: string, mapping: any): void {
        this.configManager.addCustomEventMapping(eventType, mapping);
    }
    
    /**
     * 手動フィードバックのトリガー（委任）
     */
    triggerManualFeedback(type: "single" | "batch", options: any = {}): void {
        if ((this.triggerHandler as any).triggerManualFeedback) {
            (this.triggerHandler as any).triggerManualFeedback(type, options);
        }
    }

    /**
     * フィードバックの表示
     * @param {string} type - フィードバックタイプ
     * @param {Object} position - 位置 {x, y}
     */
    showFeedback(type: "single" | "batch", position?: { x: number; y: number }): void {
        this.triggerVisualFeedback({ type, position });
    }

    /**
     * フィードバックの更新
     * @param {number} deltaTime - 経過時間
     */
    update(_deltaTime: number): void {
        this.processEffectQueue();
        // エフェクトの時間経過処理などを実行
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config: any): void {
        if (config.visual?.feedback) {
            Object.assign(this.config, config.visual.feedback);
        }
        console.log('VisualFeedbackManager configuration applied');
    }
    
    /**
     * レポートの生成
     */
    generateReport(): any {
        const sessionDuration = Date.now() - this.stats.sessionStart;
        
        return {
            timestamp: new Date().toISOString(),
            configuration: {
                enabled: this.config.enabled,
                globalIntensity: this.config.globalIntensity,
                audioVisualization: this.userPreferences.audioVisualization
            },
            statistics: {
                ...this.stats,
                sessionDuration,
                effectsPerMinute: this.stats.effectsTriggered / (sessionDuration / 60000),
                activeEffects: this.activeEffects.size,
                queuedEffects: this.effectQueue.length
            },
            userPreferences: this.userPreferences,
            performance: {
                maxConcurrentEffects: this.config.performance.maxConcurrentEffects,
                averageActiveEffects: this.stats.effectsTriggered / (sessionDuration / 1000)
            }
        };
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled: boolean): void {
        if (enabled) {
            this.enable();
        } else {
            this.disable();
        }
        console.log(`VisualFeedbackManager ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ（サブコンポーネントのクリーンアップを含む）
     */
    destroy(): void {
        console.log('Destroying VisualFeedbackManager...');
        
        // 視覚フィードバックを無効化
        this.disable();
        
        // フィードバック要素の削除
        if (this.feedbackContainer && this.feedbackContainer.parentNode) {
            this.feedbackContainer.parentNode.removeChild(this.feedbackContainer);
        }
        
        if (this.visualCanvas && this.visualCanvas.parentNode) {
            this.visualCanvas.parentNode.removeChild(this.visualCanvas);
        }
        
        // サブコンポーネントのクリーンアップ
        if (this.configManager) {
            this.configManager?.destroy?.();
        }
        
        if (this.animationManager) {
            this.animationManager?.destroy?.();
        }
        
        if (this.effectRenderer) {
            this.effectRenderer?.destroy?.();
        }
        
        if (this.triggerHandler) {
            this.triggerHandler?.destroy?.();
        }
        
        // データのクリア
        this.activeEffects.clear();
        this.feedbackElements.clear();
        this.effectQueue.length = 0;
        this.effectPatterns.clear();
        console.log('VisualFeedbackManager destroyed');
    }
}