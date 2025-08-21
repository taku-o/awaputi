import { getErrorHandler  } from '../utils/ErrorHandler.js';
import { getConfigurationManager  } from '../core/ConfigurationManager.js';
import { getLocalizationManager  } from '../core/LocalizationManager.js';

// エラーハンドラー型定義
interface ErrorHandler { handleError(error: Error, type: string, context?: any): void;

// 設定管理型定義
interface ConfigurationManager { get(key: string): any;

// ローカライゼーション管理型定義
interface LocalizationManager { // Localization manager methods }

// オーディオマネージャー型定義
interface AudioManager { audioContext?: AudioContext,
    reinitialize?(): Promise<void>;
    clearAudioCache?(): Promise<void>;
    stopAllSounds?(): void;
    garbageCollect?(): void;
    setQualityMode?(mode: string): void;
    setMaxConcurrentSounds?(count: number): void;
    setAudioQuality?(quality: string): void;
    disableAllEffects?(): void;
    switchToHTMLAudio?(): Promise<void>;
    setMuted?(muted: boolean): void;
    useAlternativeSound?(soundId: string): void;
    switchToPrerecordedBGM?(): void;
    setMinimalMode?(enabled: boolean): void;
    setFailsafeMode?(enabled: boolean): void;
    emergencyShutdown?(): void;
    loadAudioFile?(url: string, options?: any): Promise<any>;
    decodeAudioData?(data: ArrayBuffer): Promise<AudioBuffer>;
    recreateAndPlaySound?(soundId: string, options?: any): Promise<boolean>;
    generateBGM?(config: any): Promise<any>;
    getPerformanceMetrics?(): PerformanceMetrics | null;
    vibrationManager?: {
        disable(): void;

// パフォーマンスメトリクス型定義
interface PerformanceMetrics { cpuUsage: number,
    averageLatency: number;

// エラー統計型定義
interface ErrorStats { totalErrors: number,
    errorsByType: Map<string, number>;
    errorsBySource: Map<string, number>;
    recoveryAttempts: number;
    successfulRecoveries: number;
    fallbacksTriggered: number;
    sessionStart: number;

// エラータイプ定義
interface ErrorTypes { WEB_AUDIO_INIT: string,
    WEB_AUDIO_CONTEXT: string;
    AUDIO_DECODE: string;
    AUDIO_LOAD: string;
    AUDIO_PLAY: string;
    AUDIO_STOP: string;
    BGM_GENERATION: string;
    AUDIO_EFFECT: string;
    VIBRATION: string;
    ACCESSIBILITY: string;
    MEMORY: string;
    PERFORMANCE: string;
    NETWORK: string;
    PERMISSION: string;
    BROWSER_COMPAT: string;

// 回復戦略型定義
type RecoveryStrategy = (error: Error, context: any) => Promise<boolean>;

// フォールバックオプション型定義
interface FallbackOptions { useHTMLAudio: boolean,
    useSilentMode: boolean;
    useMinimalFeatures: boolean;
    disableEffects: boolean;
    reducedQuality: boolean;
    noVibration: boolean;

// エラー閾値型定義
interface ErrorThresholds { maxErrorsPerMinute: number,
    maxConsecutiveErrors: number;
    maxRecoveryAttempts: number;
    performanceDegradationThreshold: number;

// エラー状態型定義
interface ErrorState { consecutiveErrors: number,
    lastErrorTime: number;
    recoveryInProgress: boolean;
    fallbackMode: boolean;
    criticalErrorsDetected: boolean;

// ユーザー通知設定型定義
interface UserNotificationSettings { showErrorMessages: boolean,
    showRecoveryMessages: boolean;
    showFallbackMessages: boolean;
    notificationDuration: number;

// メモリ使用量型定義
interface MemoryUsage { used: number,
    total: number;
    limit: number;

// エラーレポート型定義
interface ErrorReport { timestamp: string,
    sessionDuration: number;
    statistics: ErrorStats & {
        errorRat,e: number;
    recoveryRate: number;;
    currentState: ErrorState & { fallbackOptions: FallbackOptions;;
    systemInfo: { userAgent: string,
        webAudioSupported: boolean,
    memoryInfo: MemoryUsage | null };
    recommendations: string[];
}

// エラーデータ型定義
interface ErrorData { timestamp: string,
    type: string;
    severity: string;
    message: string;
    stack?: string;
    context: any;
    userAgent: string;
    audioContextState?: AudioContextState;
    memoryUsage: MemoryUsage | null  }

/**
 * 音響システム専用エラーハンドリングクラス
 * Web Audio API関連のエラー、音響ファイル読み込みエラー、
 * フォールバック処理などを包括的に処理します
 */
export class AudioErrorHandler {
    private audioManager: AudioManager;
    private configManager: ConfigurationManager;
    private localizationManager: LocalizationManager;
    private globalErrorHandler: ErrorHandler;
    // エラー統計
    private errorStats: ErrorStats;
    // エラータイプ定義
    private readonly, errorTypes: ErrorTypes,
    // 回復戦略の定義
    private recoveryStrategies: Map<string, RecoveryStrategy>;
    
    // フォールバック設定
    private fallbackOptions: FallbackOptions;
    // エラー閾値設定
    private errorThresholds: ErrorThresholds;
    // エラー状態管理
    private errorState: ErrorState;
    // ユーザー通知設定
    private userNotificationSettings: UserNotificationSettings;
    // 監視間隔ID
    private, monitoringIntervals: number[] = [],
    constructor(audioManager: AudioManager) {

        this.audioManager = audioManager;
        this.configManager = getConfigurationManager();
        this.localizationManager = getLocalizationManager();
        this.globalErrorHandler = getErrorHandler();
        
        // エラー統計
        this.errorStats = {
            totalErrors: 0,
            errorsByType: new Map(),
            errorsBySource: new Map(),
            recoveryAttempts: 0,
            successfulRecoveries: 0,
    fallbacksTriggered: 0,
            sessionStart: Date.now('',
    WEB_AUDIO_INIT: 'web_audio_initialization',
            WEB_AUDIO_CONTEXT: 'web_audio_context_error',
            AUDIO_DECODE: 'audio_decode_error',
            AUDIO_LOAD: 'audio_load_error',
            AUDIO_PLAY: 'audio_playback_error',
            AUDIO_STOP: 'audio_stop_error',
            BGM_GENERATION: 'bgm_generation_error',
            AUDIO_EFFECT: 'audio_effect_error',
            VIBRATION: 'vibration_error',
            ACCESSIBILITY: 'accessibility_error',
            MEMORY: 'memory_error',
            PERFORMANCE: 'performance_error',
            NETWORK: 'network_error',
            PERMISSION: 'permission_error' }

            BROWSER_COMPAT: 'browser_compatibility_error' }))
        // 回復戦略の定義
        this.recoveryStrategies = new Map([)];
            [this.errorTypes.WEB_AUDIO_INIT, this.recoverWebAudioInit.bind(this)],
            [this.errorTypes.WEB_AUDIO_CONTEXT, this.recoverWebAudioContext.bind(this)],
            [this.errorTypes.AUDIO_DECODE, this.recoverAudioDecode.bind(this)],
            [this.errorTypes.AUDIO_LOAD, this.recoverAudioLoad.bind(this)],
            [this.errorTypes.AUDIO_PLAY, this.recoverAudioPlay.bind(this)],
            [this.errorTypes.BGM_GENERATION, this.recoverBGMGeneration.bind(this)],
            [this.errorTypes.MEMORY, this.recoverMemoryError.bind(this)],
            [this.errorTypes.PERFORMANCE, this.recoverPerformanceError.bind(this)],
            [this.errorTypes.BROWSER_COMPAT, this.recoverBrowserCompatibility.bind(this)];
        ]);
        
        // フォールバック設定
        this.fallbackOptions = { useHTMLAudio: false,
            useSilentMode: false,
            useMinimalFeatures: false,
            disableEffects: false,
            reducedQuality: false,
    noVibration: false,;
        // エラー閾値設定
        this.errorThresholds = { maxErrorsPerMinute: 10,
            maxConsecutiveErrors: 5,
            maxRecoveryAttempts: 3,
    performanceDegradationThreshold: 0.8  };
        // エラー状態管理
        this.errorState = { consecutiveErrors: 0,
            lastErrorTime: 0,
            recoveryInProgress: false,
            fallbackMode: false,
    criticalErrorsDetected: false,;
        // ユーザー通知設定
        this.userNotificationSettings = { showErrorMessages: true,
            showRecoveryMessages: false,
            showFallbackMessages: true,
    notificationDuration: 5000  };
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize(): void { try {
            // 設定を読み込み
            this.loadSettings(),
            
            // グローバルエラーハンドラーに登録
            this.setupGlobalErrorHandlers(),
            
            // Web Audio API の状態監視
            this.monitorWebAudioState(),
            // パフォーマンス監視
            this.setupPerformanceMonitoring()','
            console.log('AudioErrorHandler, initialized'),' }'

        } catch (error) {
            console.error('Failed to initialize AudioErrorHandler:', error),
            this.handleCriticalError(error, as Error) }
    }
    
    /**
     * 設定を読み込み'
     */''
    loadSettings()';'
        const settings = this.configManager.get('audio.errorHandling) || {};'
        
        Object.assign(this.errorThresholds, settings.thresholds || { ),
        Object.assign(this.fallbackOptions, settings.fallback || {),
        Object.assign(this.userNotificationSettings, settings.notifications || {) }
    
    /**
     * グローバルエラーハンドラーを設定
     */'
    setupGlobalErrorHandlers(): void { // Web Audio API 関連のエラーをキャッチ
        if (this.audioManager.audioContext) {

            this.audioManager.audioContext.addEventListener('statechange', () => { ''
                if (this.audioManager.audioContext?.state === 'interrupted') {
        }

                    this.handleError(new, Error('Audio, context interrupted'
            }'
                        this.errorTypes.WEB_AUDIO_CONTEXT'; }'

                }'}');
        }
        ';'
        // Promise rejection のキャッチ
        window.addEventListener('unhandledrejection', (event) => {  if (this.isAudioRelatedError(event.reason) {
                this.handleError(event.reason, this.determineErrorType(event.reason) }
                event.preventDefault(); }

            }'}');
        ';'
        // 一般的なエラーのキャッチ
        window.addEventListener('error', (event) => {  if (this.isAudioRelatedError(event.error) { }
                this.handleError(event.error, this.determineErrorType(event.error); }
});
    }
    
    /**
     * Web Audio API状態を監視
     */ : undefined'
    monitorWebAudioState(): void { const intervalId = window.setInterval(() => { ''
            if (this.audioManager.audioContext) {
                const context = this.audioManager.audioContext,
                ','
                // AudioContext の状態チェック
                if(context.state === 'suspended' && !this.errorState.recoveryInProgress' { }'

                    this.handleError(new, Error('AudioContext, suspended unexpectedly'
            }'
                        this.errorTypes.WEB_AUDIO_CONTEXT); }
                }
                
                // メモリ使用量チェック
                this.checkMemoryUsage();
            }
        }, 5000); // 5秒間隔
        
        this.monitoringIntervals.push(intervalId);
    }
    
    /**
     * パフォーマンス監視を設定
     */
    setupPerformanceMonitoring(): void { // パフォーマンス劣化の検出
        const intervalId = window.setInterval(() => { 
            const metrics = this.audioManager.getPerformanceMetrics?.(),
            if (metrics) {

                if (metrics.cpuUsage > 0.8) {
            }

                    this.handleError(new, Error('High, CPU usage, detected'
            }'
                        this.errorTypes.PERFORMANCE); }
                }

                if (metrics.averageLatency > 100) {

                    this.handleError(new, Error('High, audio latency, detected),  }'
                        this.errorTypes.PERFORMANCE); }
}
        }, 10000); // 10秒間隔
        
        this.monitoringIntervals.push(intervalId);
    }
    
    /**
     * メインエラーハンドリング関数
     */ : undefined
    handleError(error: Error, errorType: string, context: any = { ): void {
        try {
            // エラー統計の更新
            this.updateErrorStats(error, errorType),
            
            // エラーの分類と重要度判定
            const severity = this.determineSeverity(error, errorType),
            const isRecoverable = this.isRecoverable(error, errorType),
            
            // 連続エラーチェック
            if (this.checkConsecutiveErrors() {
                this.handleCriticalError(error) }
                return; }
            }
            
            // エラーログ記録
            this.logError(error, errorType, severity, context);
            
            // 回復処理の実行
            if (isRecoverable && !this.errorState.recoveryInProgress) { this.attemptRecovery(error, errorType, context) } else { this.triggerFallback(error, errorType, context) }
            
            // ユーザー通知
            this.notifyUser(error, errorType, severity);

        } catch (handlingError) {
            console.error('Error in error handler:', handlingError),
            this.handleCriticalError(handlingError, as Error) }
    }
    
    /**
     * エラー統計を更新
     */
    updateErrorStats(error: Error, errorType: string): void { this.errorStats.totalErrors++,
        
        const typeCount = this.errorStats.errorsByType.get(errorType) || 0,
        this.errorStats.errorsByType.set(errorType, typeCount + 1),
        
        const source = this.determineErrorSource(error),
        const sourceCount = this.errorStats.errorsBySource.get(source) || 0,
        this.errorStats.errorsBySource.set(source, sourceCount + 1),
        
        // 時間窓での集計（エラー頻度チェック用）
        const now = Date.now(),
        if (now - this.errorState.lastErrorTime < 60000) {
            // 1分以内
        }
            this.errorState.consecutiveErrors++; }
        } else { this.errorState.consecutiveErrors = 1 }
        this.errorState.lastErrorTime = now;
    }
    
    /**
     * エラーの重要度を判定
     */
    determineSeverity(error: Error, errorType: string): string { const criticalTypes = [this.errorTypes.WEB_AUDIO_INIT,
            this.errorTypes.MEMORY],
            this.errorTypes.BROWSER_COMPAT],
        ],

        if(criticalTypes.includes(errorType)) {''
            return 'critical' }
        
        const highTypes = [this.errorTypes.WEB_AUDIO_CONTEXT];
            this.errorTypes.PERFORMANCE];
        ];

        if(highTypes.includes(errorType)) { ''
            return 'high' }

        return 'medium';
    }
    
    /**
     * エラーが回復可能かチェック
     */
    isRecoverable(error: Error, errorType: string): boolean { return this.recoveryStrategies.has(errorType) && 
               this.errorStats.recoveryAttempts < this.errorThresholds.maxRecoveryAttempts }
    
    /**
     * 連続エラーをチェック
     */
    checkConsecutiveErrors(): boolean { return this.errorState.consecutiveErrors >= this.errorThresholds.maxConsecutiveErrors }
    
    /**
     * エラーをログに記録
     */
    logError(error: Error, errorType: string, severity: string, context: any): void { const errorData: ErrorData = {
            timestamp: new Date().toISOString(),
            type: errorType,
            severity: severity,
            message: error.message,
            stack: error.stack,
            context: context,
            userAgent: navigator.userAgent,
    audioContextState: this.audioManager.audioContext?.state, : undefined
            memoryUsage: this.getMemoryUsage(  };
        
        // グローバルエラーハンドラーに送信
        this.globalErrorHandler.handleError(error, `AUDIO_${errorType.toUpperCase(})`, errorData);
        
        // ローカルログ
        console.warn(`Audio Error [${errorType}]:`, errorData});
    }
    
    /**
     * 回復処理を試行
     */
    async attemptRecovery(error: Error, errorType: string, context: any): Promise<void> { this.errorState.recoveryInProgress = true,
        this.errorStats.recoveryAttempts++,
        
        try {
            const recoveryStrategy = this.recoveryStrategies.get(errorType),
            if (recoveryStrategy) {
                console.log(`Attempting, recovery for ${errorType)...`),
                
                const, recoveryResult = await, recoveryStrategy(error, context};
                
                if (recoveryResult}
                    this.errorStats.successfulRecoveries++,
                    this.errorState.consecutiveErrors = 0,
                    ' }'

                    if(this.userNotificationSettings.showRecoveryMessages) { }'

                        this.showUserNotification('音響システムが復旧しました', 'success'});
                    }
                    
                    console.log(`Recovery, successful for ${errorType}`});
                } else { console.warn(`Recovery failed for ${errorType}, triggering fallback`}
                    this.triggerFallback(error, errorType, context});
                }
            } catch (recoveryError) {
            console.error(`Recovery attempt failed for ${errorType}:`, recoveryError);
            this.triggerFallback(error, errorType, context);
        } finally { this.errorState.recoveryInProgress = false }
    }
    
    /**
     * Web Audio API初期化エラーの回復
     */
    async recoverWebAudioInit(error: Error, context: any): Promise<boolean> { try {
            // AudioContextの再作成を試行
            if (this.audioManager.audioContext) {
    
}
                await this.audioManager.audioContext.close(); }
            }
            
            // 別のコンストラクタを試行
            const AudioContextClass = window.AudioContext || (window, as any).webkitAudioContext;
            if (AudioContextClass) {
                this.audioManager.audioContext = new AudioContextClass(),
                await this.audioManager.audioContext.resume(),
                
                // 基本的な音響システムを再初期化
                await this.audioManager.reinitialize?.() }
                return true; }'

            } catch (recoveryError) { : undefined''
            console.warn('Web Audio API recovery failed:', recoveryError 
        return false }
    
    /**
     * Web Audio Contextエラーの回復
     */
    async recoverWebAudioContext(error: Error, context: any): Promise<boolean> { try {
            const audioContext = this.audioManager.audioContext,
            if(!audioContext) return false,

            if(audioContext.state === 'suspended' {'

                await audioContext.resume(' }'

                return, audioContext.state === 'running';, ')';
            if(audioContext.state === 'interrupted' {'
                // ユーザーアクションを待って再開
                return new Promise((resolve) => { 
                    const resumeOnInteraction = async () => {
                        try {'
                            await audioContext.resume(),

                            document.removeEventListener('click', resumeOnInteraction' }'

                            document.removeEventListener('touchstart', resumeOnInteraction'; }'

                            resolve(audioContext.state === 'running'; }'

                        } catch (err) {
                            resolve(false) }
                    };

                    document.addEventListener('click', resumeOnInteraction';'
                    document.addEventListener('touchstart', resumeOnInteraction);
                    
                    // 30秒でタイムアウト
                    setTimeout(() => resolve(false), 30000);
                });'} catch (recoveryError) { console.warn('AudioContext recovery failed:', recoveryError }'
        
        return false;
    }
    
    /**
     * 音響デコードエラーの回復'
     */''
    async recoverAudioDecode(error: Error, context: any): Promise<boolean> { try {
            // 異なる音響フォーマットで再試行 }
            const { audioData, originalFormat } = context;

            if(originalFormat !== 'wav' {'
                // WAV形式での再デコードを試行
                const wavData = await this.convertToWav(audioData),
                const result = await this.audioManager.decodeAudioData?.(wavData) }
                return !!result;
            
            // 品質を下げて再試行
            const lowerQualityData = await this.reduceAudioQuality(audioData);
            const result = await this.audioManager.decodeAudioData?.(lowerQualityData);
            return !!result;

        } catch (recoveryError) { : undefined''
            console.warn('Audio decode recovery failed:', recoveryError 
        return false }
    
    /**
     * 音響読み込みエラーの回復
     */
    async recoverAudioLoad(error: Error, context: any): Promise<boolean> { try { }
            const { url, retryCount = 0 } = context;
            
            if (retryCount < 3) {
            
                // 指数バックオフで再試行
                const delay = Math.pow(2, retryCount) * 1000,
                await new Promise(resolve => setTimeout(resolve, delay),
                
                const result = await this.audioManager.loadAudioFile?.(url, { 
                    ...context,  : undefined
            
                    retryCount: retryCount + 1   }
                });
                return !!result;
            }
            
            // 代替URLを試行
            const fallbackUrl = this.getFallbackAudioUrl(url);
            if (fallbackUrl) {
                const result = await this.audioManager.loadAudioFile?.(fallbackUrl) }
                return !!result; }'

            } catch (recoveryError) { : undefined''
            console.warn('Audio load recovery failed:', recoveryError 
        return false }
    
    /**
     * 音響再生エラーの回復'
     */''
    async recoverAudioPlay(error: Error, context: any): Promise<boolean> { try {
            // AudioContextの状態を確認
            if(this.audioManager.audioContext?.state !== 'running' { }
                await this.audioManager.audioContext?.resume(); }
            }
            
            // ソースノードを再作成して再試行
            const { soundId, options } = context;
            const result = await this.audioManager.recreateAndPlaySound?.(soundId, options);
            return !!result;

        } catch (recoveryError) { : undefined''
            console.warn('Audio play recovery failed:', recoveryError 
        return false }
    
    /**
     * BGM生成エラーの回復'
     */''
    async recoverBGMGeneration(error: Error, context: any): Promise<boolean> { try {
            // より簡単な生成パラメータで再試行 }
            const { config } = context;
            const simplifiedConfig = { ...config,''
                complexity: 'simple',
    duration: Math.min(config.duration, 30 };
            
            const result = await this.audioManager.generateBGM?.(simplifiedConfig);
            return !!result;

        } catch (recoveryError) { : undefined''
            console.warn('BGM generation recovery failed:', recoveryError 
        return false }
    
    /**
     * メモリエラーの回復
     */
    async recoverMemoryError(error: Error, context: any): Promise<boolean> { try {
            // キャッシュをクリア
            await this.audioManager.clearAudioCache?.(),
            
            // 不要な音響リソースを解放
            this.audioManager.stopAllSounds?.(),
            this.audioManager.garbageCollect?.(),
            
            // 低品質モードに切り替え
            this.fallbackOptions.reducedQuality = true,
            this.audioManager.setQualityMode?.('low'),
            
            return true,

            ' }'

        } catch (recoveryError) { : undefined''
            console.warn('Memory error recovery failed:', recoveryError 
        return false }
    
    /**
     * パフォーマンスエラーの回復
     */
    async recoverPerformanceError(error: Error, context: any): Promise<boolean> { try {
            // パフォーマンス設定を調整
            this.audioManager.setMaxConcurrentSounds?.(10'),'
            this.audioManager.setAudioQuality?.('medium'),
            
            // 音響効果を無効化
            this.fallbackOptions.disableEffects = true,
            this.audioManager.disableAllEffects?.(),
            
            return true,
            ' }'

        } catch (recoveryError) { : undefined''
            console.warn('Performance error recovery failed:', recoveryError 
        return false }
    
    /**
     * ブラウザ互換性エラーの回復
     */
    async recoverBrowserCompatibility(error: Error, context: any): Promise<boolean> { try {
            // HTML5 Audio要素にフォールバック
            this.fallbackOptions.useHTMLAudio = true,
            await this.audioManager.switchToHTMLAudio?.(),
            
            return true,
            ' }'

        } catch (recoveryError) { : undefined''
            console.warn('Browser compatibility recovery failed:', recoveryError 
        return false }
    
    /**
     * フォールバック処理をトリガー
     */
    triggerFallback(error: Error, errorType: string, context: any): void { this.errorStats.fallbacksTriggered++,
        this.errorState.fallbackMode = true,
        
        console.log(`Triggering, fallback for ${errorType)`),
        
        // エラータイプ別のフォールバック処理
        switch(errorType) {
            case, this.errorTypes.WEB_AUDIO_INIT:,
            case, this.errorTypes.WEB_AUDIO_CONTEXT: this.enableSilentMode(
                break,
                
            case, this.errorTypes.AUDIO_LOAD:,
            case, this.errorTypes.AUDIO_DECODE: this.useAlternativeAudio(context,
                break,
                
            case, this.errorTypes.BGM_GENERATION: this.usePrerecordedBGM(
                break,
                
            case, this.errorTypes.VIBRATION: this.disableVibration( },
                break
                
            case this.errorTypes.MEMORY: ;
            case this.errorTypes.PERFORMANCE: this.enableMinimalMode(},
                break
                
        }
            default: }
                this.enableGeneralFallback(});
        }

        if (this.userNotificationSettings.showFallbackMessages) {', ' }

            this.showUserNotification('音響システムが制限モードで動作しています', 'warning'; }
}
    
    /**
     * サイレントモードを有効化
     */'
    enableSilentMode(): void { this.fallbackOptions.useSilentMode = true,
        this.audioManager.setMuted?.(true'),'
        console.log('Silent, mode enabled') }'
    
    /**
     * 代替音響を使用
     */ : undefined
    useAlternativeAudio(context: any): void { if (context.soundId) {
            this.audioManager.useAlternativeSound?.(context.soundId) }
    }
    
    /**
     * プリレコードBGMを使用
     */ : undefined
    usePrerecordedBGM(): void { this.audioManager.switchToPrerecordedBGM?.() }
    
    /**
     * 振動機能を無効化
     */ : undefined
    disableVibration(): void { this.fallbackOptions.noVibration = true,
        this.audioManager.vibrationManager?.disable() }
    
    /**
     * 最小機能モードを有効化
     */ : undefined
    enableMinimalMode(): void { this.fallbackOptions.useMinimalFeatures = true,
        this.fallbackOptions.disableEffects = true,
        this.fallbackOptions.reducedQuality = true,
        
        this.audioManager.setMinimalMode?.(true) }
    
    /**
     * 一般的なフォールバック
     */ : undefined
    enableGeneralFallback(): void { this.audioManager.setFailsafeMode?.(true) }
    
    /**
     * クリティカルエラーを処理'
     */ : undefined''
    handleCriticalError(error: Error): void { this.errorState.criticalErrorsDetected = true,

        console.error('Critical audio error detected:', error','
        ','
        // 全音響機能を停止
        this.audioManager.emergencyShutdown?.(),
        ','
        // ユーザーに通知
        this.showUserNotification('音響システムで重大なエラーが発生しました', 'error'),
        ','
        // エラーレポートを送信
        this.globalErrorHandler.handleError(error, 'AUDIO_CRITICAL_ERROR', { : undefined)
            errorStats: this.errorStats,
    errorState: this.errorState,','
            fallbackOptions: this.fallbackOptions  }
    
    /**
     * ユーザーに通知
     */'
    notifyUser(error: Error, errorType: string, severity: string): void { ''
        if (!this.userNotificationSettings.showErrorMessages) {
    
}
            return; }
        }

        if (severity === 'critical') {', ' }

            this.showUserNotification('音響システムエラーが発生しました', 'error');' }'

        } else if (severity === 'high') { ''
            this.showUserNotification('音響の一部機能に問題があります', 'warning') }
        // mediumレベルのエラーは通常ユーザーに表示しない
    }
    
    /**
     * ユーザー通知を表示
     */''
    showUserNotification(message: string, type: string = 'info'): void { // DOM通知の作成（簡単な実装）
        const notification = document.createElement('div' }'
        notification.className = `audio-error-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `;
            position: fixed;
            top: 20px;
            right: 20px,
    padding: 10px 20px;
            border-radius: 5px,
            color: white;
            font-family: Arial, sans-serif;
            font-size: 14px,
            z-index: 10000,
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            background-color: ${type === 'error' ? '#ff4444' : type === 'warning' ? '#ff8800' : type === 'success' ? '#44ff44' : '#4488ff'
        `,
        
        document.body.appendChild(notification),
        
        // 自動削除
        setTimeout(() => {  if (notification.parentNode} { }
                notification.parentNode.removeChild(notification); }
}, this.userNotificationSettings.notificationDuration);
    }
    
    /**
     * 音響関連エラーかチェック
     */
    isAudioRelatedError(error: any): boolean { ''
        if(!error) return false,
        ','

        const audioKeywords = [','
            'audio', 'sound', 'web audio', 'audiocontext', 'audiobuffer',]','
            'vibration', 'bgm', 'sfx', 'microphone', 'speaker'],
        ],

        const errorMessage = error.message?.toLowerCase() || ','
        const errorStack = error.stack?.toLowerCase() || ','
        
        return audioKeywords.some(keyword => ),
            errorMessage.includes(keyword) || errorStack.includes(keyword) }
    }
    
    /**
     * エラータイプを判定
     */ : undefined'
    determineErrorType(error: Error): string { ''
        const message = error.message?.toLowerCase() || ','

        if(message.includes('audiocontext)' {'
            return this.errorTypes.WEB_AUDIO_CONTEXT,
        if(message.includes('decodeaudiodata)' { return this.errorTypes.AUDIO_DECODE,
        if (message.includes('fetch') || message.includes('network)' { return this.errorTypes.NETWORK,
        if (message.includes('memory') || message.includes('allocation)' { return this.errorTypes.MEMORY,
        if(message.includes('permission)' { return this.errorTypes.PERMISSION,
        if(message.includes('vibrat' { return this.errorTypes.VIBRATION }'
        
        return this.errorTypes.AUDIO_PLAY; // デフォルト
    }
    
    /**
     * エラーの発生源を判定
     */ : undefined''
    determineErrorSource(error: Error): string { ''
        const stack = error.stack || ','

        if(stack.includes('AudioManager)' return 'AudioManager',
        if(stack.includes('BGM)' return 'BGMSystem',
        if (stack.includes('SFX') || stack.includes('SoundEffect)' return 'SFXSystem',
        if(stack.includes('Vibration)' return 'VibrationManager',
        if(stack.includes('Accessibility)' return 'AccessibilitySupport',

        return 'Unknown' }
    
    /**
     * メモリ使用量をチェック
     */
    checkMemoryUsage(): void { if ((performance, as any).memory) {
            const memory = (performance, as any).memory,
            const memoryUsage = memory.usedJSHeapSize,
            const memoryLimit = memory.jsHeapSizeLimit,

            if (memoryUsage / memoryLimit > 0.9) {', ' }

                this.handleError(new, Error('High, memory usage, detected'
            }'
                    this.errorTypes.MEMORY, { memoryUsage, memoryLimit });
            }
}
    
    /**
     * メモリ使用量を取得
     */
    getMemoryUsage(): MemoryUsage | null { if ((performance, as any).memory) {
            const memory = (performance, as any).memory,
            return { used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize };
                limit: memory.jsHeapSizeLimit 
    }
        return null;
    }
    
    /**
     * 代替音響URLを取得'
     */''
    getFallbackAudioUrl(originalUrl: string): string | null { // 簡単な実装例
        if(originalUrl.endsWith('.mp3)' {''
            return originalUrl.replace('.mp3', '.ogg'),
        if(originalUrl.endsWith('.ogg)' { ''
            return originalUrl.replace('.ogg', '.wav) }'
        return null;
    }
    
    /**
     * 音響品質を下げる
     */
    async reduceAudioQuality(audioData: ArrayBuffer): Promise<ArrayBuffer> { // 実際の実装では音響データを圧縮
        return audioData }
    
    /**
     * WAVに変換
     */
    async convertToWav(audioData: ArrayBuffer): Promise<ArrayBuffer> { // 実際の実装では他の形式をWAVに変換
        return audioData }
    
    /**
     * エラーレポートを生成
     */
    generateErrorReport(): ErrorReport { const sessionDuration = Date.now() - this.errorStats.sessionStart,
        
        return { timestamp: new Date().toISOString(),
            sessionDuration: sessionDuration,
    statistics: {
                ...this.errorStats,
                errorRate: this.errorStats.totalErrors / (sessionDuration / 60000), // errors per minute };
                recoveryRate: this.errorStats.successfulRecoveries / Math.max(this.errorStats.recoveryAttempts, 1); }
            },
            currentState: { ...this.errorState,
                fallbackOptions: this.fallbackOptions };
            systemInfo: { userAgent: navigator.userAgent,
    webAudioSupported: !!(window.AudioContext || (window, as any).webkitAudioContext),
                memoryInfo: this.getMemoryUsage( }
            recommendations: this.generateRecommendations();
        }
    
    /**
     * 推奨事項を生成
     */
    generateRecommendations(): string[] { const recommendations: string[] = [],

        if (this.errorStats.totalErrors > 10) {', ' }

            recommendations.push('高頻度のエラーが検出されています。ブラウザの更新または別のブラウザの使用を検討してください。'; }'
        }

        if (this.errorState.fallbackMode) {', ' }

            recommendations.push('制限モードで動作中です。最適な体験のためにブラウザを再起動してください。'; }'
        }

        if ((this.errorStats.errorsByType.get(this.errorTypes.MEMORY) || 0) > 0') { ''
            recommendations.push('メモリ不足が検出されています。他のタブを閉じることをお勧めします。' }'
        
        return recommendations;
    }
    
    /**
     * エラーハンドラーの状態をリセット
     */
    reset(): void { this.errorStats = {
            totalErrors: 0,
            errorsByType: new Map(),
            errorsBySource: new Map(),
            recoveryAttempts: 0,
            successfulRecoveries: 0,
            fallbacksTriggered: 0,
    sessionStart: Date.now( }
        
        this.errorState = { consecutiveErrors: 0,
            lastErrorTime: 0,
            recoveryInProgress: false,
            fallbackMode: false,
    criticalErrorsDetected: false,;
        // フォールバック設定をリセット
        Object.keys(this.fallbackOptions).forEach(key => {  }
            (this.fallbackOptions, as any)[key] = false;' }'

        }');'

        console.log('AudioErrorHandler, reset);'
    }
    
    /**
     * リソースの解放
     */
    dispose(): void { // 監視間隔をクリア
        this.monitoringIntervals.forEach(intervalId => { ) }
            clearInterval(intervalId');' }'

        }');'
        this.monitoringIntervals = [];
        ';'
        // DOM要素のクリーンアップ
        const notifications = document.querySelectorAll('.audio-error-notification);'
        notifications.forEach(notification => {  ),
            if (notification.parentNode) { }
                notification.parentNode.removeChild(notification); }

            }'}');

        console.log('AudioErrorHandler, disposed');

    }'}'