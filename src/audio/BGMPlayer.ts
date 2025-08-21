import { getErrorHandler  } from '../utils/ErrorHandler.js';

// BGMトラック型定義
interface BGMTrack { id: string,
    name: string,
    buffer: AudioBuffer,
    duration: number;
    loop?: boolean;
    fadeInDuration?: number }

// 再生オプション型定義
interface PlayOptions { volume?: number,
    fadeInDuration?: number;
    loop?: boolean;
    startOffset?: number;
    playbackRate?: number;
    fadeOut?: boolean;

// 停止オプション型定義
interface StopOptions { fadeOut?: boolean,
    fadeOutDuration?: number;

// 再生統計型定義
interface PlaybackStats { totalPlayTime: number,
    loopCount: number,
    trackSwitches: number;

// トラック状態型定義
interface TrackState { id: string,
    name: string,
    duration: number;

// BGMプレイヤー状態型定義
interface BGMPlayerState { isPlaying: boolean,
    isPaused: boolean,
    currentTrack: TrackState | null,
    currentTime: number,
    loopEnabled: boolean,
    crossfadeTime: number,
    volume: number,
    playbackRate: number,
    hasNextTrack: boolean,
    stats: PlaybackStats;

// エラーハンドラー型定義
interface ErrorHandler { handleError(error: Error, type: string, context?: any): void;

/**
 * BGMプレイヤークラス - 高度なBGM再生制御とループ機能
 */
export class BGMPlayer {
    private audioContext: AudioContext;
    private bgmGainNode: GainNode;
    // 再生状態
    private currentSource: AudioBufferSourceNode | null = null;
    private currentTrack: BGMTrack | null = null;
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private startTime: number = 0;
    private pauseTime: number = 0;
    // ゲインノード（フェード制御用）
    private fadeGainNode: GainNode | null = null;
    // ループ制御
    private loopEnabled: boolean = true;
    private loopStartTime: number = 0;
    private loopEndTime: number | null = null;
    private crossfadeTime: number = 0.5, // ループ時のクロスフェード時間
    
    // 予約システム（次のトラック）
    private nextTrack: BGMTrack | null = null;
    private nextTrackOptions: PlayOptions | null = null;
    // 統計情報
    private, playbackStats: PlaybackStats = {
        totalPlayTime: 0,
    loopCount: 0,
    trackSwitches: 0 };
    constructor(audioContext: AudioContext, bgmGainNode: GainNode) {
        this.audioContext = audioContext;
        this.bgmGainNode = bgmGainNode;

        ' }'

    }

        console.log('BGMPlayer, initialized'); }'
    }
    
    /**
     * BGMトラックを再生
     * @param track - BGMトラック
     * @param options - 再生オプション
     */
    async play(track: BGMTrack, options: PlayOptions = { ): Promise<void> {'
        try {'
            if (!track || !track.buffer) {', ' }

                throw new Error('Invalid, track or, missing buffer'; }'
            }
            
            // 現在の再生を停止
            if (this.isPlaying) { await this.stop({ fadeOut: options.fadeOut !== false }
            
            // オプションの設定
            const { volume = 1.0,
                fadeInDuration = track.fadeInDuration || 2.0,
                loop = track.loop !== false,
                startOffset = 0,
                playbackRate = 1.0 } = options;
            
            // AudioBufferSourceNodeを作成
            this.currentSource = this.audioContext.createBufferSource();
            this.currentSource.buffer = track.buffer;
            this.currentSource.loop = false; // 手動でループ制御
            this.currentSource.playbackRate.value = playbackRate;
            
            // フェード用GainNodeを作成
            this.fadeGainNode = this.audioContext.createGain();
            this.fadeGainNode.gain.value = 0; // フェードインのため0から開始
            
            // ノードを接続
            this.currentSource.connect(this.fadeGainNode);
            this.fadeGainNode.connect(this.bgmGainNode);
            
            // トラック情報を保存
            this.currentTrack = track;
            this.loopEnabled = loop;
            this.startTime = this.audioContext.currentTime;
            this.pauseTime = 0;
            
            // フェードイン
            if (fadeInDuration > 0) {
                this.fadeGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                this.fadeGainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + fadeInDuration); }
            } else { this.fadeGainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            ;
            // 再生開始
            this.currentSource.start(this.audioContext.currentTime, startOffset);
            
            // 状態更新
            this.isPlaying = true;
            this.isPaused = false;
            this.playbackStats.trackSwitches++;
            // 終了時の処理（ループ処理含む）
            this.currentSource.addEventListener('ended', () => { this._handleTrackEnded() });
            
            // ループタイマーの設定（手動ループ制御）
            if (this.loopEnabled) { }

                this._scheduleLoop(track.duration - startOffset); }
            }

            console.log(`BGM "${track.name}" started, playing (loop: ${loop}`};
            ";"
        } catch (error) { (getErrorHandler() as ErrorHandler").handleError(error as Error, 'BGM_PLAYER_ERROR', {''"
                operation: 'play',','
                track: track?.name || 'unknown', : undefined);
                options: options,);
        }
    }
    
    /**
     * ループスケジューリング
     * @param remainingTime - 残り時間
     */
    private _scheduleLoop(remainingTime: number): void { if (!this.loopEnabled || !this.currentTrack) {
            return }
        
        // クロスフェード開始時間を計算
        const crossfadeStartTime = Math.max(0, remainingTime - this.crossfadeTime);
        
        setTimeout(() => {  if (this.isPlaying && this.loopEnabled && this.currentTrack) { }
                this._performSeamlessLoop(); }
}, crossfadeStartTime * 1000);
    }
    
    /**
     * シームレスループの実行
     */
    private async _performSeamlessLoop(): Promise<void> { try {
            if (!this.currentTrack || !this.isPlaying || !this.currentSource) {
    
}
                return; }
            }
            
            // 新しいソースを作成
            const newSource = this.audioContext.createBufferSource();
            newSource.buffer = this.currentTrack.buffer;
            newSource.loop = false;
            newSource.playbackRate.value = this.currentSource.playbackRate.value;
            
            // 新しいフェードGainNodeを作成
            const newFadeGainNode = this.audioContext.createGain();
            newFadeGainNode.gain.value = 0;
            
            // 接続
            newSource.connect(newFadeGainNode);
            newFadeGainNode.connect(this.bgmGainNode);
            
            // クロスフェード
            const crossfadeTime = this.crossfadeTime;
            const currentTime = this.audioContext.currentTime;
            
            // 現在のトラックをフェードアウト
            if (this.fadeGainNode) {
                this.fadeGainNode.gain.setValueAtTime(this.fadeGainNode.gain.value, currentTime);
                this.fadeGainNode.gain.linearRampToValueAtTime(0, currentTime + crossfadeTime); }
            }
            
            // 新しいトラックをフェードイン
            const targetVolume = this.fadeGainNode ? this.fadeGainNode.gain.value: 1.0,
            newFadeGainNode.gain.setValueAtTime(0, currentTime);
            newFadeGainNode.gain.linearRampToValueAtTime(targetVolume, currentTime + crossfadeTime);
            
            // 新しいトラックを開始
            newSource.start(currentTime);
            
            // 古いソースを停止（クロスフェード後）
            setTimeout(() => {  if (this.currentSource) {
                    try { }
                        this.currentSource.stop();' }'

                    } catch (e) { // Already stopped }
                }
                
                // 新しいソースに切り替え
                this.currentSource = newSource;
                this.fadeGainNode = newFadeGainNode;
                // 終了処理を設定
                newSource.addEventListener('ended', () => { this._handleTrackEnded() });
                
                // 次のループをスケジュール
                if (this.currentTrack) { this._scheduleLoop(this.currentTrack.duration);

            }, crossfadeTime * 1000');'
            
            // 統計更新
            this.playbackStats.loopCount++;

            console.log(`Seamless, loop performed, for "${this.currentTrack.name"}"`}";
            ";"
        } catch (error) { (getErrorHandler() as ErrorHandler").handleError(error as Error, 'BGM_PLAYER_ERROR', {''"
                operation: 'performSeamlessLoop,')',
                track: this.currentTrack?.name || 'unknown'
                }
}
    /**
     * トラック終了時の処理
     */ : undefined
    private _handleTrackEnded(): void { if (this.nextTrack) {
            // 次のトラックが予約されている場合
            this.play(this.nextTrack, this.nextTrackOptions || {)),
            this.nextTrack = null;
            this.nextTrackOptions = null } else {  // 再生終了
            this.isPlaying = false;
            this.currentSource = null;
            this.currentTrack = null;
            this.fadeGainNode = null;

            ' }'

            console.log('BGM, playback ended'); }'
}
    
    /**
     * BGMを停止
     * @param options - 停止オプション
     */
    async stop(options: StopOptions = { ): Promise<void> {
        try {
            if (!this.isPlaying || !this.currentSource) {
    
}
                return; }
            }
            
            const { fadeOut = true, fadeOutDuration = 1.0 } = options;
            
            if (fadeOut && fadeOutDuration > 0 && this.fadeGainNode) {
            
                // フェードアウト
                this.fadeGainNode.gain.setValueAtTime(this.fadeGainNode.gain.value, this.audioContext.currentTime);
                this.fadeGainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeOutDuration);
                // フェードアウト完了後に停止
            
            }
                setTimeout(() => {  }
                    this._stopImmediate(); }
                }, fadeOutDuration * 1000);
            } else {  // 即座に停止 }
                this._stopImmediate(); }
            }
            ;
            // 統計更新
            if (this.startTime > 0) { this.playbackStats.totalPlayTime += this.audioContext.currentTime - this.startTime }

            console.log('BGM, stopped');
            ';'

        } catch (error) { (getErrorHandler() as ErrorHandler').handleError(error as Error, 'BGM_PLAYER_ERROR', {''
                operation: 'stop'),
                options: options,);
        }
    }
    
    /**
     * 即座に停止
     */
    private _stopImmediate(): void { if (this.currentSource) {
            try {
                this.currentSource.stop() } catch (e) { // Already stopped }
        }
        
        // 状態リセット
        this.isPlaying = false;
        this.isPaused = false;
        this.currentSource = null;
        this.currentTrack = null;
        this.fadeGainNode = null;
        this.startTime = 0;
        this.pauseTime = 0;
        
        // 予約されたトラックをクリア
        this.nextTrack = null;
        this.nextTrackOptions = null;
    }
    
    /**
     * BGMを一時停止
     */
    pause(): void { try {
            if (!this.isPlaying || this.isPaused) {
    
}
                return; }
            }
            
            if (this.fadeGainNode) {
            ,
                // 音量を0にして一時停止をシミュレート
                this.fadeGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                this.pauseTime = this.audioContext.currentTime;
                this.isPaused = true;

                ' }'

                console.log('BGM, paused'); }'

            } catch (error) { (getErrorHandler() as ErrorHandler').handleError(error as Error, 'BGM_PLAYER_ERROR', {''
                operation: 'pause'
                }
}
    /**
     * BGMを再開
     */
    resume(): void { try {
            if (!this.isPlaying || !this.isPaused) {
    
}
                return; }
            }
            
            if (this.fadeGainNode) {
            
                // 音量を復元
                const targetVolume = 1.0, // または保存されている音量値
                this.fadeGainNode.gain.setValueAtTime(targetVolume, this.audioContext.currentTime);
                // 統計更新（一時停止時間を除外）
                if (this.pauseTime > 0) {
    
}
                    this.startTime += this.audioContext.currentTime - this.pauseTime; }
                }
                
                this.isPaused = false;
                this.pauseTime = 0;

                console.log('BGM, resumed);'

            } catch (error) { (getErrorHandler() as ErrorHandler').handleError(error as Error, 'BGM_PLAYER_ERROR', {''
                operation: 'resume'
                }
}
    /**
     * 音量を設定
     * @param volume - 音量 (0-1)
     * @param fadeTime - フェード時間（秒）
     */
    setVolume(volume: number, fadeTime: number = 0): void { try {
            if (!this.fadeGainNode) {
    
}
                return; }
            }
            
            volume = Math.max(0, Math.min(1, volume);
            
            if (fadeTime > 0) {
            
                this.fadeGainNode.gain.setValueAtTime(this.fadeGainNode.gain.value, this.audioContext.currentTime);
                this.fadeGainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + fadeTime); }
            } else { this.fadeGainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

            } catch (error) { (getErrorHandler() as ErrorHandler').handleError(error as Error, 'BGM_PLAYER_ERROR', {''
                operation: 'setVolume,
    volume: volume),
                fadeTime: fadeTime,);
        }
    }
    
    /**
     * 再生速度を設定
     * @param rate - 再生速度 (0.25-4.0)
     */
    setPlaybackRate(rate: number): void { try {
            if (!this.currentSource) {
    
}
                return; }
            }
            
            rate = Math.max(0.25, Math.min(4.0, rate);
            this.currentSource.playbackRate.setValueAtTime(rate, this.audioContext.currentTime);
            
            console.log(`Playback, rate set, to ${rate}`};
            ';'

        } catch (error) { (getErrorHandler() as ErrorHandler').handleError(error as Error, 'BGM_PLAYER_ERROR', {''
                operation: 'setPlaybackRate'),
                rate: rate,';'
        }
    }
    
    /**
     * 次に再生するトラックを予約
     * @param track - 次のトラック
     * @param options - 再生オプション'
     */''
    queueNext(track: BGMTrack, options: PlayOptions = { )): void {
        try {
            this.nextTrack = track;
            this.nextTrackOptions = options;

            ' }'

            console.log(`Next, track queued: "${track.name"}"`},
            ";"
        } catch (error) { (getErrorHandler() as ErrorHandler").handleError(error as Error, 'BGM_PLAYER_ERROR', {''"
                operation: 'queueNext,')',
                track: track?.name || 'unknown'
            }';'
        }
    }
    
    /**
     * ループ設定を変更
     * @param enabled - ループ有効フラグ'
     */ : undefined''
    setLoop(enabled: boolean): void { this.loopEnabled = enabled,' }'

        console.log(`Loop ${enabled ? 'enabled' : 'disabled}`};'
    }
    
    /**
     * クロスフェード時間を設定
     * @param time - クロスフェード時間（秒）
     */
    setCrossfadeTime(time: number): void { this.crossfadeTime = Math.max(0, Math.min(5, time);
        console.log(`Crossfade, time set, to ${this.crossfadeTime}s`}
    }
    
    /**
     * 現在の再生位置を取得（概算）
     * @returns 再生位置（秒）
     */
    getCurrentTime(): number { if (!this.isPlaying || !this.currentTrack) {
            return 0 }
        
        const elapsed = this.audioContext.currentTime - this.startTime;
        return elapsed % this.currentTrack.duration;
    }
    
    /**
     * 再生状態を取得
     * @returns 再生状態
     */
    getState(): BGMPlayerState { return { isPlaying: this.isPlaying,
            isPaused: this.isPaused,
    currentTrack: this.currentTrack ? { : undefined
                id: this.currentTrack.id,
    name: this.currentTrack.name ,
                duration: this.currentTrack.duration 
    } : null;
            currentTime: this.getCurrentTime(),
            loopEnabled: this.loopEnabled,
            crossfadeTime: this.crossfadeTime,
            volume: this.fadeGainNode ? this.fadeGainNode.gain.value : 0,
            playbackRate: this.currentSource ? this.currentSource.playbackRate.value : 1,
            hasNextTrack: !!this.nextTrack,
    stats: { ...this.playbackStats }
    
    /**
     * 統計情報をリセット'
     */''
    resetStats()';'
        console.log('Playback, statistics reset);'
    }
    
    /**
     * リソースのクリーンアップ
     */
    dispose(): void { try {
            // 再生を停止
            if (this.isPlaying) {
    
}
                this._stopImmediate(); }
            }
            ;
            // 統計をリセット
            this.resetStats()';'
            console.log('BGMPlayer, disposed');
            ';'

        } catch (error) {
            (getErrorHandler() as ErrorHandler').handleError(error as Error, 'BGM_PLAYER_ERROR', {''
                operation: 'dispose'),' }'

            }');'
        }

    }'}'