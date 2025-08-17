import { PlayerData } from './PlayerData.js';
import { BubbleManager } from '../managers/BubbleManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import { StageManager } from './StageManager.js';
import { SceneManager } from './SceneManager.js';
import { ItemManager } from './ItemSystem.js';
import { SettingsManager } from './SettingsManager.js';
// import { getLocalizationManager } from './LocalizationManager.js';
import { CoreKeyboardShortcutManager } from './KeyboardShortcutManager.js';
import { AchievementManager } from './AchievementManager.js';
// import { AchievementEventIntegrator } from './AchievementEventIntegrator.js';
// import { AchievementNotificationSystem } from './achievements/AchievementNotificationSystem.js';
import { StatisticsManager } from './StatisticsManager.js';
// import { EventStageManager } from './EventStageManager.js';
// import { ChallengeSystem } from './ChallengeSystem.js';
// import { DailyChallengeManager } from './DailyChallengeManager.js';
// import { WeeklyChallengeManager } from './WeeklyChallengeManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { ParticleManager } from '../effects/ParticleManager.js';
import { EffectManager } from '../effects/EffectManager.js';
import { EnhancedParticleManager } from '../effects/EnhancedParticleManager.js';
import { EnhancedEffectManager } from '../effects/EnhancedEffectManager.js';
// import { getSeasonalEffectManager } from '../effects/SeasonalEffectManager.js';
// import { getEffectQualityController } from '../effects/EffectQualityController.js';
// import { getEffectPerformanceMonitor } from '../effects/EffectPerformanceMonitor.js';
// import { getEffectConfigurationIntegrator } from '../effects/EffectConfigurationIntegrator.js';
// import { getAudioVisualSynchronizer } from '../effects/AudioVisualSynchronizer.js';
// import { getPoolManager } from '../utils/ObjectPool.js';
import { RenderOptimizer, PerformanceMonitor } from '../utils/RenderOptimizer.js';
import { getMemoryManager } from '../utils/MemoryManager.js';
import { getPerformanceOptimizer } from '../utils/PerformanceOptimizer.js';
// import { getBrowserCompatibility } from '../utils/BrowserCompatibility.js';
import { ResponsiveCanvasManager } from '../utils/ResponsiveCanvasManager.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from './ConfigurationManager.js';
import { getCalculationEngine } from './CalculationEngine.js';
// import { EffectDebugInterface } from '../effects/EffectDebugInterface.js';
import { EnhancedDebugInterface } from '../debug/EnhancedDebugInterface.js';
// import { EffectProfiler } from '../effects/EffectProfiler.js';
// import { EffectOptimizationAdvisor } from '../effects/EffectOptimizationAdvisor.js';
// import { EffectPerformanceOptimizer } from '../effects/EffectPerformanceOptimizer.js';
// import { EffectErrorHandler } from '../effects/EffectErrorHandler.js';
// import { VisualPolishEnhancements } from '../effects/VisualPolishEnhancements.js';
// import { AnimationManager } from '../effects/AnimationManager.js';
// import { getHelpManager } from './help/HelpManager.js';
// import { getSEOMonitor } from '../seo/SEOMonitor.js';
import { SocialSharingManager } from './SocialSharingManager.js';
import { LeaderboardManager } from './LeaderboardManager.js';

// サブコンポーネントのインポート
import { GameEngineInitializer } from './game-engine/GameEngineInitializer.js';
import { GameEngineEventManager } from './game-engine/GameEngineEventManager.js';
import { GameEngineRenderer } from './game-engine/GameEngineRenderer.js';
import { GameEngineUtilities } from './game-engine/GameEngineUtilities.js';

// Type definitions - GameEngineConfig removed (unused)

interface GameStats {
    fps: number;
    frameTime: number;
    entities: number;
    particles: number;
    memoryUsage: number;
}

interface GameState {
    isRunning: boolean;
    isPaused: boolean;
    currentScene?: string;
    elapsedTime: number;
    frameCount: number;
}

type EventListenerCallback = (...args: any[]) => void;

/**
 * ゲームエンジンクラス - 統合版（パフォーマンス最適化 + 音響・視覚効果）
 * Main Controller Pattern: サブコンポーネントに処理を委譲し、公開APIを維持
 */
export class GameEngine {
    // Core properties
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public isRunning: boolean;
    private lastTime: number;
    private frameCount: number;
    private elapsedTime: number;
    
    // Event system
    private eventListeners: Map<string, Set<EventListenerCallback>>;
    
    // Sub-components
    private initializer!: GameEngineInitializer;
    private eventManager!: GameEngineEventManager;
    private renderer!: GameEngineRenderer;
    private utilities!: GameEngineUtilities;
    
    // Core managers
    public configManager: any; // ConfigurationManager type
    public calculationEngine: any; // CalculationEngine type
    public responsiveCanvasManager: ResponsiveCanvasManager;
    public errorHandler: any; // ErrorHandler type
    public memoryManager: any; // MemoryManager type
    public performanceOptimizer: any; // PerformanceOptimizer type
    
    // Game systems
    public playerData!: PlayerData;
    public bubbleManager!: BubbleManager;
    public scoreManager!: ScoreManager;
    public stageManager!: StageManager;
    public sceneManager!: SceneManager;
    public itemManager!: ItemManager;
    public settingsManager!: SettingsManager;
    public statisticsManager!: StatisticsManager;
    
    // Audio and effects
    public audioManager!: AudioManager;
    public particleManager!: ParticleManager;
    public effectManager!: EffectManager;
    public enhancedParticleManager!: EnhancedParticleManager;
    public enhancedEffectManager!: EnhancedEffectManager;
    
    // Other managers
    public achievementManager!: AchievementManager;
    public keyboardShortcutManager!: CoreKeyboardShortcutManager;
    public socialSharingManager!: SocialSharingManager;
    public leaderboardManager!: LeaderboardManager;
    
    // Performance and debug
    public renderOptimizer!: RenderOptimizer;
    public performanceMonitor!: PerformanceMonitor;
    public debugInterface?: EnhancedDebugInterface;
    
    // Game state
    private gameState!: GameState;
    
    // Special effects state
    public bonusTimeRemaining: number = 0;
    public timeStopRemaining: number = 0;
    public isTimeStopActive: boolean = false;
    public isScreenShakeActive: boolean = false;
    public inputDisabled: boolean = false;
    
    constructor(canvas: HTMLCanvasElement) {
        console.log('[DEBUG] GameEngine: コンストラクター開始');
        
        try {
            this.canvas = canvas;
            const context = canvas.getContext('2d');
            if (!context) {
                throw new Error('Failed to get 2D rendering context');
            }
            this.context = context;
            
            this.isRunning = false;
            this.lastTime = 0;
            this.frameCount = 0;
            this.elapsedTime = 0;
            
            console.log('[DEBUG] GameEngine: 基本プロパティ設定完了');
            
            // シンプルなイベントエミッター機能
            this.eventListeners = new Map<string, Set<EventListenerCallback>>();
            
            // ゲーム状態初期化
            this.gameState = {
                isRunning: false,
                isPaused: false,
                elapsedTime: 0,
                frameCount: 0
            };
            
            // サブコンポーネントの初期化
            console.log('[DEBUG] GameEngine: サブコンポーネント初期化開始');
            this._initializeSubComponents();
            console.log('[DEBUG] GameEngine: サブコンポーネント初期化完了');
            
            // ブラウザ互換性チェック
            this.initializer.checkBrowserCompatibility();
            
        } catch (error) {
            getErrorHandler().handleError(error, 'CANVAS_ERROR', { 
                canvasElement: canvas,
                contextType: '2d'
            });
            throw error;
        }
        
        // 設定管理システム
        this.configManager = getConfigurationManager();
        this.calculationEngine = getCalculationEngine();
        
        // レスポンシブCanvas管理
        this.responsiveCanvasManager = new ResponsiveCanvasManager(canvas);
        
        // エラーハンドラー
        this.errorHandler = getErrorHandler();
        
        // パフォーマンス最適化システム
        this.memoryManager = getMemoryManager();
        this.performanceOptimizer = getPerformanceOptimizer();
        
        // Core managers initialization
        this._initializeCoreManagers();
        
        // Game systems initialization
        this._initializeGameSystems();
        
        // Audio and effects initialization
        this._initializeAudioAndEffects();
        
        // Performance and debug initialization
        this._initializePerformanceAndDebug();
        
        console.log('[DEBUG] GameEngine: 初期化完了');
    }
    
    /**
     * サブコンポーネントを初期化
     */
    private _initializeSubComponents(): void {
        try {
            // 初期化コンポーネント
            this.initializer = new GameEngineInitializer(this);
            
            // イベント管理コンポーネント
            this.eventManager = new GameEngineEventManager(this as any);
            
            // レンダリングコンポーネント
            this.renderer = new GameEngineRenderer(this as any);
            
            // ユーティリティコンポーネント
            this.utilities = new GameEngineUtilities(this as any);
            
            console.log('[GameEngine] All sub-components initialized successfully');
            
        } catch (error) {
            console.error('[GameEngine] Failed to initialize sub-components:', error);
            throw error;
        }
    }
    
    /**
     * コア管理システムを初期化
     */
    private _initializeCoreManagers(): void {
        // Initialize core managers here
        // This is a placeholder - actual initialization would depend on specific manager implementations
        console.log('[GameEngine] Core managers initialized');
    }
    
    /**
     * ゲームシステムを初期化
     */
    private _initializeGameSystems(): void {
        try {
            // Player data
            this.playerData = new PlayerData();
            
            // Game managers
            this.bubbleManager = new BubbleManager(this.canvas);
            this.scoreManager = new ScoreManager(this);
            this.sceneManager = new SceneManager(this);
            this.settingsManager = new SettingsManager();
            this.statisticsManager = new StatisticsManager(this);
            
            // Achievement system
            this.achievementManager = new AchievementManager(this);
            
            // Keyboard shortcuts
            this.keyboardShortcutManager = new CoreKeyboardShortcutManager();
            
            // Social features
            this.socialSharingManager = new SocialSharingManager();
            this.leaderboardManager = new LeaderboardManager();
            
            console.log('[GameEngine] Game systems initialized');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'GAME_SYSTEM_ERROR', {
                component: 'GameEngine',
                operation: 'initializeGameSystems'
            });
            throw error;
        }
    }
    
    /**
     * オーディオとエフェクトシステムを初期化
     */
    private _initializeAudioAndEffects(): void {
        try {
            // Audio system
            const audioConfig = {
                volumes: {
                    master: 0.8,
                    sfx: 0.8,
                    bgm: 0.7,
                    muted: false
                },
                effects: {
                    compression: false,
                    reverb: false
                },
                quality: 'medium' as const,
                getCompressorConfig: () => ({ threshold: -24, knee: 30, ratio: 12, attack: 0.003, release: 0.25 }),
                getReverbConfig: () => ({ duration: 2, decay: 2, reverse: false }),
                isCompressionEnabled: () => false,
                isReverbEnabled: () => false
            };
            this.audioManager = new AudioManager(this.configManager, audioConfig);
            
            // Effect systems
            this.particleManager = new ParticleManager();
            this.effectManager = new EffectManager(this.canvas);
            this.enhancedParticleManager = new EnhancedParticleManager();
            this.enhancedEffectManager = new EnhancedEffectManager();
            
            console.log('[GameEngine] Audio and effects initialized');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'AUDIO_EFFECTS_ERROR', {
                component: 'GameEngine',
                operation: 'initializeAudioAndEffects'
            });
            // Non-critical error - continue without audio/effects
            console.warn('[GameEngine] Audio/Effects initialization failed, continuing without them');
        }
    }
    
    /**
     * パフォーマンスとデバッグシステムを初期化
     */
    private _initializePerformanceAndDebug(): void {
        try {
            // Performance systems
            this.renderOptimizer = new RenderOptimizer(this.canvas);
            this.performanceMonitor = new PerformanceMonitor();
            
            // Debug interface (only in development)
            if (process.env.NODE_ENV === 'development') {
                this.debugInterface = new EnhancedDebugInterface(this);
            }
            
            console.log('[GameEngine] Performance and debug systems initialized');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_DEBUG_ERROR', {
                component: 'GameEngine',
                operation: 'initializePerformanceAndDebug'
            });
            // Non-critical error - continue without debug features
            console.warn('[GameEngine] Performance/Debug initialization failed, continuing without them');
        }
    }
    
    /**
     * ゲームループを開始
     */
    start(): void {
        if (this.isRunning) {
            console.log('[GameEngine] Already running');
            return;
        }
        
        try {
            this.isRunning = true;
            this.gameState.isRunning = true;
            this.lastTime = performance.now();
            
            // Start game systems
            this._startGameSystems();
            
            // Start game loop
            this._gameLoop();
            
            console.log('[GameEngine] Started successfully');
            this.emit('started');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'START_ERROR', {
                component: 'GameEngine',
                operation: 'start'
            });
            this.stop();
            throw error;
        }
    }
    
    /**
     * ゲームループを停止
     */
    stop(): void {
        if (!this.isRunning) {
            console.log('[GameEngine] Already stopped');
            return;
        }
        
        try {
            this.isRunning = false;
            this.gameState.isRunning = false;
            
            // Stop game systems
            this._stopGameSystems();
            
            console.log('[GameEngine] Stopped successfully');
            this.emit('stopped');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'STOP_ERROR', {
                component: 'GameEngine',
                operation: 'stop'
            });
        }
    }
    
    /**
     * ゲームループを一時停止
     */
    pause(): void {
        if (!this.isRunning || this.gameState.isPaused) {
            console.log('[GameEngine] Cannot pause - not running or already paused');
            return;
        }
        
        this.gameState.isPaused = true;
        console.log('[GameEngine] Paused');
        this.emit('paused');
    }
    
    /**
     * ゲームループを再開
     */
    resume(): void {
        if (!this.isRunning || !this.gameState.isPaused) {
            console.log('[GameEngine] Cannot resume - not running or not paused');
            return;
        }
        
        this.gameState.isPaused = false;
        this.lastTime = performance.now(); // Reset timing
        console.log('[GameEngine] Resumed');
        this.emit('resumed');
    }
    
    /**
     * メインゲームループ
     */
    private _gameLoop(): void {
        if (!this.isRunning) {
            return;
        }
        
        try {
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            // Update frame count and elapsed time
            this.frameCount++;
            this.elapsedTime += deltaTime;
            this.gameState.frameCount = this.frameCount;
            this.gameState.elapsedTime = this.elapsedTime;
            
            // Performance monitoring
            this.performanceOptimizer.recordFrameTime(deltaTime);
            
            if (!this.gameState.isPaused) {
                // Update game systems
                this.update(deltaTime);
                
                // Render frame
                this.render();
            }
            
            // Continue loop
            requestAnimationFrame(() => this._gameLoop());
            
        } catch (error) {
            this.errorHandler.handleError(error, 'GAME_LOOP_ERROR', {
                component: 'GameEngine',
                operation: 'gameLoop'
            });
            
            // Try to continue the loop unless it's a critical error
            if (this.isRunning) {
                requestAnimationFrame(() => this._gameLoop());
            }
        }
    }
    
    /**
     * ゲーム状態を更新
     */
    update(deltaTime: number): void {
        try {
            // Delegate to sub-components
            if (this.eventManager.update) this.eventManager.update(deltaTime);
            if (this.renderer.update) this.renderer.update(deltaTime);
            
            // Update game systems
            if (this.bubbleManager) this.bubbleManager.update(deltaTime);
            if (this.particleManager) this.particleManager.update(deltaTime);
            if (this.effectManager) this.effectManager.update(deltaTime);
            if (this.sceneManager) this.sceneManager.update(deltaTime);
            
            // Update performance systems
            if (this.memoryManager) this.memoryManager.update?.(deltaTime);
            
            // Emit update event
            this.emit('update', deltaTime);
            
        } catch (error) {
            this.errorHandler.handleError(error, 'UPDATE_ERROR', {
                component: 'GameEngine',
                operation: 'update',
                deltaTime
            });
        }
    }
    
    /**
     * 画面をレンダリング
     */
    render(): void {
        try {
            // Clear canvas
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Delegate main rendering to renderer component
            this.renderer.render();
            
            // Render debug info if available
            if (this.debugInterface && (this.debugInterface as any).render) {
                (this.debugInterface as any).render(this.context);
            }
            
            // Emit render event
            this.emit('render');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'RENDER_ERROR', {
                component: 'GameEngine',
                operation: 'render'
            });
        }
    }
    
    /**
     * ゲームシステムを開始
     */
    private _startGameSystems(): void {
        // Start systems that need explicit startup
        if (this.sceneManager && typeof this.sceneManager.start === 'function') {
            this.sceneManager.start();
        }
        
        if (this.audioManager && typeof this.audioManager.start === 'function') {
            this.audioManager.start();
        }
    }
    
    /**
     * ゲームシステムを停止
     */
    private _stopGameSystems(): void {
        // Stop systems that need explicit cleanup
        if (this.sceneManager && typeof this.sceneManager.stop === 'function') {
            this.sceneManager.stop();
        }
        
        if (this.audioManager && typeof this.audioManager.stop === 'function') {
            this.audioManager.stop();
        }
    }
    
    /**
     * 現在のゲーム統計を取得
     */
    getStats(): GameStats {
        const fps = this.elapsedTime > 0 ? (this.frameCount * 1000) / this.elapsedTime : 0;
        
        return {
            fps: Math.round(fps),
            frameTime: this.lastTime,
            entities: (this.bubbleManager?.bubbles?.length || 0),
            particles: (this.particleManager?.getParticles?.()?.length || 0),
            memoryUsage: this.memoryManager?.getStats?.()?.currentMemoryUsage || 0
        };
    }
    
    /**
     * 現在のゲーム状態を取得
     */
    getState(): GameState {
        return { ...this.gameState };
    }
    
    /**
     * イベントリスナーを追加
     */
    addEventListener(event: string, callback: EventListenerCallback): void {
        let listeners = this.eventListeners.get(event);
        if (!listeners) {
            listeners = new Set<EventListenerCallback>();
            this.eventListeners.set(event, listeners);
        }
        listeners.add(callback);
    }
    
    /**
     * イベントリスナーを削除
     */
    removeEventListener(event: string, callback: EventListenerCallback): boolean {
        const listeners = this.eventListeners.get(event);
        if (!listeners) {
            return false;
        }
        return listeners.delete(callback);
    }
    
    /**
     * イベントを発火
     */
    emit(event: string, ...args: any[]): void {
        const listeners = this.eventListeners.get(event);
        if (!listeners) {
            return;
        }
        
        listeners.forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                this.errorHandler.handleError(error, 'EVENT_CALLBACK_ERROR', {
                    event,
                    callback: callback.name || 'anonymous'
                });
            }
        });
    }
    
    /**
     * リソースをクリーンアップして破棄
     */
    destroy(): void {
        try {
            this.stop();
            
            // Cleanup sub-components
            if (this.initializer?.destroy) this.initializer.destroy();
            if (this.eventManager?.destroy) this.eventManager.destroy();
            if (this.renderer?.destroy) this.renderer.destroy();
            if (this.utilities?.destroy) this.utilities.destroy();
            
            // Cleanup systems
            this.memoryManager?.destroy?.();
            this.performanceOptimizer?.destroy?.();
            this.audioManager?.destroy?.();
            if (this.particleManager?.destroy) this.particleManager.destroy();
            if (this.effectManager?.destroy) this.effectManager.destroy();
            
            // Clear event listeners
            this.eventListeners.clear();
            
            console.log('[GameEngine] Destroyed successfully');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'DESTROY_ERROR', {
                component: 'GameEngine',
                operation: 'destroy'
            });
        }
    }

    /**
     * 時間停止効果を開始
     * @param {number} duration - 効果持続時間（ミリ秒）
     */
    startTimeStop(duration: number): void {
        this.isTimeStopActive = true;
        this.timeStopRemaining = duration;
        this.emit('timeStopStarted', { duration });
    }

    /**
     * 画面揺れ効果を開始
     * @param {number} duration - 効果持続時間（ミリ秒）
     * @param {number} intensity - 揺れの強度
     */
    startScreenShake(duration: number, intensity: number = 10): void {
        this.isScreenShakeActive = true;
        this.inputDisabled = true;
        
        if (this.renderer) {
            this.renderer.startScreenShake(duration, intensity);
        }
        
        setTimeout(() => {
            this.isScreenShakeActive = false;
            this.inputDisabled = false;
        }, duration);
        
        this.emit('screenShakeStarted', { duration, intensity });
    }
}