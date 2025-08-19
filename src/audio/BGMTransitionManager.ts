import { getErrorHandler } from '../utils/ErrorHandler.js';

// トランジションオプション型定義
interface TransitionOptions {
    type?: string;
    duration?: number;
    curve?: string;
    delay?: number;
    volume?: number;
    fadeOutDuration?: number;
    fadeInDuration?: number;
}

// トランジション情報型定義
interface TransitionInfo {
    fromTrack: string;
    toTrack: string;
    type: string;
    duration: number;
    curve: string;
}

// キューエントリ型定義
interface QueueEntry {
    fromTrack: string;
    toTrack: string;
    options: TransitionOptions;
}

// BGMシステム型定義
interface BGMSystem {
    isPlaying: boolean;
    tracks: Map<string, TrackInfo>;
    playBGM(trackName: string, options?: any): Promise<void>;
    stopBGM(options?: any): Promise<void>;
    setVolume(volume: number, fadeTime?: number): void;
    getCurrentBGMInfo(): BGMInfo | null;
}

// トラック情報型定義
interface TrackInfo {
    metadata: {
        tempo: number;
        key: string;
    };
    style: string;
}

// BGM情報型定義
interface BGMInfo {
    volume: number;
    isPlaying: boolean;
}

// エラーハンドラー型定義
interface ErrorHandler {
    handleError(error: Error, type: string, context?: any): void;
}

// 設定型定義
interface TransitionSettings {
    defaultFadeInDuration?: number;
    defaultFadeOutDuration?: number;
    defaultCrossfadeDuration?: number;
}

// トランジション状態型定義
interface TransitionState {
    isTransitioning: boolean;
    currentTransition: TransitionInfo | null;
    queueLength: number;
    settings: {
        defaultFadeInDuration: number;
        defaultFadeOutDuration: number;
        defaultCrossfadeDuration: number;
    };
}

/**
 * BGMトランジション管理クラス - 高度なBGM遷移制御とフェード機能
 */
export class BGMTransitionManager {
    private audioContext: AudioContext;
    private bgmSystem: BGMSystem;
    
    // トランジション状態
    private isTransitioning: boolean = false;
    private currentTransition: TransitionInfo | null = null;
    private transitionQueue: QueueEntry[] = [];
    
    // フェード設定
    private defaultFadeInDuration: number = 2.0;
    private defaultFadeOutDuration: number = 2.0;
    private defaultCrossfadeDuration: number = 3.0;
    
    // トランジションタイプ
    private readonly transitionTypes = {
        FADE_OUT_IN: 'fade_out_in',
        CROSSFADE: 'crossfade',
        CUT: 'cut',
        SMART_CROSSFADE: 'smart_crossfade'
    } as const;
    
    // 音量カーブタイプ
    private readonly curveTypes = {
        LINEAR: 'linear',
        EXPONENTIAL: 'exponential',
        LOGARITHMIC: 'logarithmic',
        SMOOTH: 'smooth'
    } as const;

    constructor(audioContext: AudioContext, bgmSystem: BGMSystem) {
        this.audioContext = audioContext;
        this.bgmSystem = bgmSystem;
        
        console.log('BGMTransitionManager initialized');
    }
    
    /**
     * BGMトラック間の遷移を実行
     * @param fromTrack - 現在のトラック名
     * @param toTrack - 次のトラック名
     * @param options - 遷移オプション
     */
    async transitionTo(fromTrack: string, toTrack: string, options: TransitionOptions = {}): Promise<void> {
        try {
            if (this.isTransitioning) {
                // 既に遷移中の場合はキューに追加
                this.transitionQueue.push({ fromTrack, toTrack, options });
                console.log(`Transition queued: ${fromTrack} -> ${toTrack}`);
                return;
            }
            
            const {
                type = this.transitionTypes.CROSSFADE,
                duration = this.defaultCrossfadeDuration,
                curve = this.curveTypes.SMOOTH,
                delay = 0,
                volume = 1.0
            } = options;
            
            this.isTransitioning = true;
            this.currentTransition = { fromTrack, toTrack, type, duration, curve };
            
            console.log(`Starting transition: ${fromTrack} -> ${toTrack} (${type})`);
            
            // 遅延がある場合は待機
            if (delay > 0) {
                await this._wait(delay);
            }
            
            // トランジションタイプに応じて実行
            switch (type) {
                case this.transitionTypes.FADE_OUT_IN:
                    await this._fadeOutInTransition(fromTrack, toTrack, options);
                    break;
                case this.transitionTypes.CROSSFADE:
                    await this._crossfadeTransition(fromTrack, toTrack, options);
                    break;
                case this.transitionTypes.CUT:
                    await this._cutTransition(fromTrack, toTrack, options);
                    break;
                case this.transitionTypes.SMART_CROSSFADE:
                    await this._smartCrossfadeTransition(fromTrack, toTrack, options);
                    break;
                default:
                    throw new Error(`Unknown transition type: ${type}`);
            }
            
            this.isTransitioning = false;
            this.currentTransition = null;
            
            console.log(`Transition completed: ${fromTrack} -> ${toTrack}`);
            
            // キューに次の遷移がある場合は実行
            if (this.transitionQueue.length > 0) {
                const nextTransition = this.transitionQueue.shift()!;
                setTimeout(() => {
                    this.transitionTo(nextTransition.fromTrack, nextTransition.toTrack, nextTransition.options);
                }, 100); // 短い遅延を入れて処理を安定させる
            }
            
        } catch (error) {
            this.isTransitioning = false;
            this.currentTransition = null;
            
            (getErrorHandler() as ErrorHandler).handleError(error as Error, 'BGM_TRANSITION_ERROR', {
                operation: 'transitionTo',
                fromTrack: fromTrack,
                toTrack: toTrack,
                options: options
            });
        }
    }
    
    /**
     * フェードアウト → フェードイン遷移
     * @param fromTrack - 現在のトラック名
     * @param toTrack - 次のトラック名
     * @param options - オプション
     */
    private async _fadeOutInTransition(fromTrack: string, toTrack: string, options: TransitionOptions): Promise<void> {
        const {
            fadeOutDuration = this.defaultFadeOutDuration,
            fadeInDuration = this.defaultFadeInDuration,
            curve = this.curveTypes.SMOOTH,
            volume = 1.0
        } = options;
        
        // 現在のBGMをフェードアウト
        if (this.bgmSystem.isPlaying) {
            await this.fadeOut(fadeOutDuration, curve);
        }
        
        // 新しいBGMをフェードインで開始
        await this.bgmSystem.playBGM(toTrack, {
            volume: volume,
            fadeInDuration: fadeInDuration
        });
    }
    
    /**
     * クロスフェード遷移
     * @param fromTrack - 現在のトラック名
     * @param toTrack - 次のトラック名
     * @param options - オプション
     */
    private async _crossfadeTransition(fromTrack: string, toTrack: string, options: TransitionOptions): Promise<void> {
        const {
            duration = this.defaultCrossfadeDuration,
            curve = this.curveTypes.SMOOTH,
            volume = 1.0
        } = options;
        
        const currentBGMInfo = this.bgmSystem.getCurrentBGMInfo();
        const currentVolume = currentBGMInfo ? currentBGMInfo.volume : 0;
        
        // 新しいBGMを無音で開始
        await this.bgmSystem.playBGM(toTrack, {
            volume: 0,
            fadeInDuration: 0
        });
        
        // クロスフェードを実行
        await this._performCrossfade(currentVolume, volume, duration, curve);
    }
    
    /**
     * カット遷移（即座に切り替え）
     * @param fromTrack - 現在のトラック名
     * @param toTrack - 次のトラック名
     * @param options - オプション
     */
    private async _cutTransition(fromTrack: string, toTrack: string, options: TransitionOptions): Promise<void> {
        const { volume = 1.0 } = options;
        
        // 現在のBGMを即座に停止
        if (this.bgmSystem.isPlaying) {
            await this.bgmSystem.stopBGM({ fadeOutDuration: 0 });
        }
        
        // 新しいBGMを即座に開始
        await this.bgmSystem.playBGM(toTrack, {
            volume: volume,
            fadeInDuration: 0
        });
    }
    
    /**
     * スマートクロスフェード遷移（音楽的な調和を考慮）
     * @param fromTrack - 現在のトラック名
     * @param toTrack - 次のトラック名
     * @param options - オプション
     */
    private async _smartCrossfadeTransition(fromTrack: string, toTrack: string, options: TransitionOptions): Promise<void> {
        const {
            duration = this.defaultCrossfadeDuration,
            volume = 1.0
        } = options;
        
        // トラック情報を取得
        const fromTrackInfo = this.bgmSystem.tracks.get(fromTrack);
        const toTrackInfo = this.bgmSystem.tracks.get(toTrack);
        
        if (!fromTrackInfo || !toTrackInfo) {
            // 情報が不十分な場合は通常のクロスフェードにフォールバック
            return this._crossfadeTransition(fromTrack, toTrack, options);
        }
        
        // 音楽的な調和度を計算
        const harmonyScore = this._calculateHarmonyScore(fromTrackInfo, toTrackInfo);
        
        // 調和度に基づいてトランジション調整
        let adjustedDuration = duration;
        let curve = this.curveTypes.SMOOTH;
        
        if (harmonyScore > 0.8) {
            // 高い調和 - 短いクロスフェード
            adjustedDuration = duration * 0.6;
            curve = this.curveTypes.LINEAR;
        } else if (harmonyScore < 0.3) {
            // 低い調和 - 長いクロスフェード
            adjustedDuration = duration * 1.5;
            curve = this.curveTypes.EXPONENTIAL;
        }
        
        console.log(`Smart crossfade: harmony score ${harmonyScore.toFixed(2)}, duration ${adjustedDuration.toFixed(1)}s`);
        
        // 調整されたクロスフェードを実行
        await this._crossfadeTransition(fromTrack, toTrack, {
            ...options,
            duration: adjustedDuration,
            curve: curve
        });
    }
    
    /**
     * 音楽的調和度を計算
     * @param fromTrack - 現在のトラック
     * @param toTrack - 次のトラック
     * @returns 調和度 (0-1)
     */
    private _calculateHarmonyScore(fromTrack: TrackInfo, toTrack: TrackInfo): number {
        let score = 0;
        
        // テンポの調和度（差が小さいほど高い）
        const tempoDiff = Math.abs(fromTrack.metadata.tempo - toTrack.metadata.tempo);
        const tempoScore = Math.max(0, 1 - tempoDiff / 60); // 60BPM差で0点
        score += tempoScore * 0.4;
        
        // スタイルの調和度
        const styleCompatibility = this._getStyleCompatibility(fromTrack.style, toTrack.style);
        score += styleCompatibility * 0.3;
        
        // キーの調和度（音楽理論に基づく）
        const keyCompatibility = this._getKeyCompatibility(fromTrack.metadata.key, toTrack.metadata.key);
        score += keyCompatibility * 0.3;
        
        return Math.max(0, Math.min(1, score));
    }
    
    /**
     * スタイル間の相性を取得
     * @param style1 - スタイル1
     * @param style2 - スタイル2
     * @returns 相性度 (0-1)
     */
    private _getStyleCompatibility(style1: string, style2: string): number {
        const compatibilityMatrix: Record<string, Record<string, number>> = {
            ambient: { ambient: 1.0, dramatic: 0.7, energetic: 0.3, exciting: 0.2 },
            dramatic: { dramatic: 1.0, ambient: 0.7, exciting: 0.6, energetic: 0.4 },
            energetic: { energetic: 1.0, exciting: 0.8, dramatic: 0.4, ambient: 0.3 },
            exciting: { exciting: 1.0, energetic: 0.8, dramatic: 0.6, ambient: 0.2 }
        };
        
        return compatibilityMatrix[style1]?.[style2] ?? 0.5;
    }
    
    /**
     * キー間の調和度を取得
     * @param key1 - キー1
     * @param key2 - キー2
     * @returns 調和度 (0-1)
     */
    private _getKeyCompatibility(key1: string, key2: string): number {
        if (key1 === key2) return 1.0;
        
        // 簡単な調和度計算（完全5度、4度関係を重視）
        const keyMap: Record<string, number> = {
            'C': 0, 'G': 7, 'D': 2, 'A': 9, 'E': 4, 'B': 11,
            'F#': 6, 'Db': 1, 'Ab': 8, 'Eb': 3, 'Bb': 10, 'F': 5,
            'Am': 9, 'Em': 4, 'Bm': 11, 'F#m': 6, 'C#m': 1, 'G#m': 8,
            'D#m': 3, 'A#m': 10, 'Fm': 5, 'Cm': 0, 'Gm': 7, 'Dm': 2
        };
        
        const interval = Math.abs((keyMap[key1] ?? 0) - (keyMap[key2] ?? 0));
        const circleInterval = Math.min(interval, 12 - interval);
        
        // 完全5度(7)、完全4度(5)、短3度(3)関係を高く評価
        const harmonyWeights: Record<number, number> = { 
            0: 1.0, 7: 0.9, 5: 0.9, 3: 0.7, 4: 0.7, 8: 0.6, 9: 0.6 
        };
        return harmonyWeights[circleInterval] ?? 0.3;
    }
    
    /**
     * クロスフェードを実行
     * @param fromVolume - 開始音量
     * @param toVolume - 終了音量
     * @param duration - 時間
     * @param curve - カーブタイプ
     */
    private async _performCrossfade(fromVolume: number, toVolume: number, duration: number, curve: string): Promise<void> {
        const steps = Math.ceil(duration * 30); // 30fps相当
        const stepDuration = duration / steps;
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const easedProgress = this._applyCurve(progress, curve);
            
            // 現在のBGMを減衰
            const currentVolume = fromVolume * (1 - easedProgress);
            
            // 新しいBGMを増幅
            const newVolume = toVolume * easedProgress;
            
            // 音量を設定（実際の実装では前のBGMの音量制御が必要）
            this.bgmSystem.setVolume(newVolume, 0);
            
            if (i < steps) {
                await this._wait(stepDuration);
            }
        }
    }
    
    /**
     * カーブを適用
     * @param progress - 進行度 (0-1)
     * @param curveType - カーブタイプ
     * @returns 調整された進行度
     */
    private _applyCurve(progress: number, curveType: string): number {
        switch (curveType) {
            case this.curveTypes.LINEAR:
                return progress;
            case this.curveTypes.EXPONENTIAL:
                return Math.pow(progress, 2);
            case this.curveTypes.LOGARITHMIC:
                return Math.sqrt(progress);
            case this.curveTypes.SMOOTH:
                return progress * progress * (3 - 2 * progress); // smoothstep
            default:
                return progress;
        }
    }
    
    /**
     * フェードアウト
     * @param duration - フェード時間
     * @param curve - カーブタイプ
     */
    async fadeOut(duration: number = this.defaultFadeOutDuration, curve: string = this.curveTypes.SMOOTH): Promise<void> {
        try {
            const currentInfo = this.bgmSystem.getCurrentBGMInfo();
            if (!currentInfo || !currentInfo.isPlaying) {
                return;
            }
            
            const startVolume = currentInfo.volume;
            const steps = Math.ceil(duration * 30);
            const stepDuration = duration / steps;
            
            for (let i = 0; i <= steps; i++) {
                const progress = i / steps;
                const easedProgress = this._applyCurve(progress, curve);
                const volume = startVolume * (1 - easedProgress);
                
                this.bgmSystem.setVolume(volume, 0);
                
                if (i < steps) {
                    await this._wait(stepDuration);
                }
            }
            
            // 完全に停止
            await this.bgmSystem.stopBGM({ fadeOutDuration: 0 });
            
        } catch (error) {
            (getErrorHandler() as ErrorHandler).handleError(error as Error, 'BGM_TRANSITION_ERROR', {
                operation: 'fadeOut',
                duration: duration,
                curve: curve
            });
        }
    }
    
    /**
     * フェードイン
     * @param trackName - トラック名
     * @param duration - フェード時間
     * @param curve - カーブタイプ
     * @param targetVolume - 目標音量
     */
    async fadeIn(trackName: string, duration: number = this.defaultFadeInDuration, curve: string = this.curveTypes.SMOOTH, targetVolume: number = 1.0): Promise<void> {
        try {
            // 無音で開始
            await this.bgmSystem.playBGM(trackName, {
                volume: 0,
                fadeInDuration: 0
            });
            
            const steps = Math.ceil(duration * 30);
            const stepDuration = duration / steps;
            
            for (let i = 0; i <= steps; i++) {
                const progress = i / steps;
                const easedProgress = this._applyCurve(progress, curve);
                const volume = targetVolume * easedProgress;
                
                this.bgmSystem.setVolume(volume, 0);
                
                if (i < steps) {
                    await this._wait(stepDuration);
                }
            }
            
        } catch (error) {
            (getErrorHandler() as ErrorHandler).handleError(error as Error, 'BGM_TRANSITION_ERROR', {
                operation: 'fadeIn',
                trackName: trackName,
                duration: duration,
                curve: curve,
                targetVolume: targetVolume
            });
        }
    }
    
    /**
     * 即座にトランジションを停止
     */
    stopTransition(): void {
        try {
            this.isTransitioning = false;
            this.currentTransition = null;
            this.transitionQueue = [];
            
            console.log('All transitions stopped');
            
        } catch (error) {
            (getErrorHandler() as ErrorHandler).handleError(error as Error, 'BGM_TRANSITION_ERROR', {
                operation: 'stopTransition'
            });
        }
    }
    
    /**
     * トランジション設定を更新
     * @param settings - 設定
     */
    updateSettings(settings: TransitionSettings): void {
        try {
            if (settings.defaultFadeInDuration !== undefined) {
                this.defaultFadeInDuration = Math.max(0.1, Math.min(10, settings.defaultFadeInDuration));
            }
            
            if (settings.defaultFadeOutDuration !== undefined) {
                this.defaultFadeOutDuration = Math.max(0.1, Math.min(10, settings.defaultFadeOutDuration));
            }
            
            if (settings.defaultCrossfadeDuration !== undefined) {
                this.defaultCrossfadeDuration = Math.max(0.5, Math.min(20, settings.defaultCrossfadeDuration));
            }
            
            console.log('Transition settings updated', settings);
            
        } catch (error) {
            (getErrorHandler() as ErrorHandler).handleError(error as Error, 'BGM_TRANSITION_ERROR', {
                operation: 'updateSettings',
                settings: settings
            });
        }
    }
    
    /**
     * 待機
     * @param seconds - 秒数
     * @returns プロミス
     */
    private _wait(seconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
    
    /**
     * 現在のトランジション状態を取得
     * @returns トランジション状態
     */
    getTransitionState(): TransitionState {
        return {
            isTransitioning: this.isTransitioning,
            currentTransition: this.currentTransition,
            queueLength: this.transitionQueue.length,
            settings: {
                defaultFadeInDuration: this.defaultFadeInDuration,
                defaultFadeOutDuration: this.defaultFadeOutDuration,
                defaultCrossfadeDuration: this.defaultCrossfadeDuration
            }
        };
    }
    
    /**
     * リソースの解放
     */
    dispose(): void {
        try {
            this.stopTransition();
            console.log('BGMTransitionManager disposed');
            
        } catch (error) {
            (getErrorHandler() as ErrorHandler).handleError(error as Error, 'BGM_TRANSITION_ERROR', {
                operation: 'dispose'
            });
        }
    }
}