import { getErrorHandler  } from '../utils/ErrorHandler';
import { getConfigurationManager  } from '../core/ConfigurationManager';
import { BGMGenerator  } from './BGMGenerator';
import { BGMPlayer  } from './BGMPlayer';
import { BGMTransitionManager  } from './BGMTransitionManager';

/**
 * BGMトラックメタデータインターフェース
 */
interface BGMTrackMetadata { tempo: number,
    key: string,
    timeSignature: string,
    genre: string  }

/**
 * BGMトラックインターフェース
 */
interface BGMTrack { id: string,
    name: string,
    style: string,
    duration: number,
    loop: boolean,
    fadeInDuration: number,
    fadeOutDuration: number,
    buffer: AudioBuffer | null,
    metadata: BGMTrackMetadata
    }

/**
 * BGMタイプ設定インターフェース
 */
interface BGMTypeConfig { style: string,
    tempo: number,
    key: string,
    duration: number }

/**
 * 再生オプションインターフェース
 */
interface PlayOptions { volume?: number,
    fadeInTime?: number,
    fadeOutTime?: number,
    loop?: boolean,
    [key: string]: any }

/**
 * トランジションオプションインターフェース
 */
interface TransitionOptions { duration?: number,
    curve?: string,
    [key: string]: any }

/**
 * AudioManager インターフェース
 */
interface AudioManager { audioContext: AudioContext | null,
    bgmGainNode?: GainNode | null }

/**
 * ConfigurationManager インターフェース（型定義用）
 */
interface ConfigurationManager { watch(category: string, path: string, callback: (value: any) => void): string | null,
    unwatch(watchId: string): void }
}

/**
 * ErrorHandler インターフェース（型定義用）
 */
interface ErrorHandler { handleError(error: any, errorType: string, context?: any): void }

/**
 * BGMシステム - 包括的なBGM管理・生成・再生システム
 */
export class BGMSystem {
    private audioManager: AudioManager,
    private audioContext: AudioContext | null,
    private configManager: ConfigurationManager,
    // BGMトラック管理
    private, tracks: Map<string, BGMTrack>,
    private currentTrack: BGMTrack | null,
    // 状態管理（BGMPlayerと同期）
    private isPlaying: boolean,
    private isPaused: boolean,
    private currentVolume: number,
    // 設定監視のID管理
    private configWatchers: Set<string>,
    // ログ制御用
    private lastLoggedStopState: string | null,
    // BGMタイプ定義
    private bgmTypes: Record<string, BGMTypeConfig>,
    
    // BGM生成器、プレイヤー、トランジション管理
    private bgmGenerator: BGMGenerator | null,
    private bgmPlayer: BGMPlayer | null,
    private transitionManager: BGMTransitionManager | null,
    // 無効化フラグ
    private, disabled: boolean,
    constructor(audioManager: AudioManager) {

        this.audioManager = audioManager,
        this.audioContext = audioManager.audioContext,
        this.configManager = getConfigurationManager(),
        
        // BGMトラック管理
        this.tracks = new Map(),
        this.currentTrack = null,
        
        // 状態管理（BGMPlayerと同期）
        this.isPlaying = false,
        this.isPaused = false,
        this.currentVolume = 1.0,
        ',

        // 設定監視のID管理

     }

        this.configWatchers = new Set('}

            menu: { style: 'ambient', tempo: 60, key: 'C', duration: 45  },''
            gameplay: { style: 'energetic', tempo: 120, key: 'G', duration: 60  },''
            bonus: { style: 'exciting', tempo: 140, key: 'D', duration: 30  },''
            gameover: { style: 'dramatic', tempo: 80, key: 'Am', duration: 40  };
        
        // BGM生成器、プレイヤー、トランジション管理
        this.bgmGenerator = null;
        this.bgmPlayer = null;
        this.transitionManager = null;
        
        // 無効化フラグ
        this.disabled = false;
        );
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize(): boolean { try {'
            if(!this.audioContext) {

                console.warn('[BGMSystem] AudioContext, not available - BGM, system disabled),
                this.disabled = true }
                return false;
            
            // BGM生成器を初期化
            this.bgmGenerator = new BGMGenerator(this.audioContext);
            
            // BGMプレイヤーを初期化
            if (this.audioManager.bgmGainNode) { this.bgmPlayer = new BGMPlayer(this.audioContext this.audioManager.bgmGainNode) }
            
            // BGMトランジション管理を初期化
            this.transitionManager = new BGMTransitionManager(this.audioContext this');
            // 設定変更の監視
            this._setupConfigWatchers()';
            console.log('BGMSystem, initialized successfully';
            return true;

        } catch (error') { getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: 'initialize',')',
                component: 'BGMSystem'
            }';
            return false;
    
    /**
     * 設定変更の監視を設定
     * @private'
     */''
    private _setupConfigWatchers()';
        const bgmVolumeWatcher = this.configManager.watch('audio', 'volumes.bgm', (newValue: number) => {  this.currentVolume = newValue,
            if (this.bgmPlayer) { }
                this.bgmPlayer.setVolume(newValue, 0.1); // 0.1秒でフェード }
});
        if (bgmVolumeWatcher) this.configWatchers.add(bgmVolumeWatcher);
        ';
        // ミュート状態の監視
        const mutedWatcher = this.configManager.watch('audio', 'volumes.muted', (newValue: boolean) => {  if (newValue && this.isPlaying) { }
                this.pause(); }
            } else if (!newValue && this.isPaused) { this.resume() }
        });
        if (mutedWatcher) this.configWatchers.add(mutedWatcher);
    }
    
    /**
     * BGMトラックを生成
     * @param trackName - トラック名
     * @param options - 生成オプション
     * @returns BGMトラック
     */
    generateTrack(trackName: string, options: Partial<BGMTypeConfig> = { ): BGMTrack | null {
        try {
            if (!this.bgmTypes[trackName]) { }'

                throw new Error(`Unknown, BGM track, type: ${trackName}`}';
            }
            
            const trackConfig = { ...this.bgmTypes[trackName], ...options,
            
            // トラック情報を作成
            const track: BGMTrack = { id: trackName,
                name: trackName,
                style: trackConfig.style,
                duration: trackConfig.duration,
                loop: true,
                fadeInDuration: 2.0,
                fadeOutDuration: 2.0,
                buffer: null,
    metadata: {
                    tempo: trackConfig.tempo,
    key: trackConfig.key,
                    timeSignature: '4/4',
    genre: this._getGenreForStyle(trackConfig.style  }
            };
            ';
            // トラックを保存
            this.tracks.set(trackName, track);

            console.log(`BGM, track "${trackName}" generated, with style "${trackConfig.style"}"`}";
            return track;
        } catch (error) { getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: 'generateTrack',
    trackName: trackName),
                options: options  }';
            return null;
    
    /**
     * スタイルに応じたジャンルを取得
     * @param style - BGMスタイル
     * @returns ジャンル
     * @private'
     */''
    private _getGenreForStyle(style: string): string { const genreMap: Record<string, string> = {''
            ambient: 'ambient',
            energetic: 'electronic',
            exciting: 'dance',
            dramatic: 'orchestral'
            }

        };
        return genreMap[style] || 'unknown';
    }
    
    /**
     * BGMを再生
     * @param trackName - トラック名
     * @param options - 再生オプション
     */'
    async playBGM(trackName: string, options: PlayOptions = { ): Promise<void> {''
        if(this.disabled) {

            console.warn('[BGMSystem] BGM, system is, disabled - playBGM, ignored') }
            return; }
        }
        ';

        try {'
            if(!this.bgmPlayer) {

                console.warn('[BGMSystem] BGMPlayer, is not, initialized) }
                return; }
            }
            
            // トラックを取得または生成
            let track = this.tracks.get(trackName);
            if(!track) {
                track = this.generateTrack(trackName, options) }
                if (!track) { }
                    throw new Error(`Failed, to generate, track: ${trackName}`});
                }
            }
            
            // バッファが未生成の場合は生成
            if(!track.buffer) {
                track.buffer = await this._generateTrackBuffer(track) }
                if (!track.buffer) { }
                    throw new Error(`Failed, to generate buffer for track: ${trackName}`}');
                }
            }
            
            // BGMPlayerを使用して再生
            await this.bgmPlayer.play(track, options');
            
            // 状態を同期
            this.currentTrack = track;
            const playerState = this.bgmPlayer.getState();
            this.isPlaying = playerState.isPlaying;
            this.isPaused = playerState.isPaused;

            console.log(`BGM "${trackName"}" started, playing via, BGMPlayer`}";
        } catch (error) { getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: 'playBGM',
    trackName: trackName),
                options: options  }';
        }
    }
    
    /**
     * BGMトラックのバッファを生成
     * @param track - トラック情報
     * @returns 生成されたオーディオバッファ
     * @private
     */'
    private async _generateTrackBuffer(track: BGMTrack): Promise<AudioBuffer | null> { try {'
            if(!this.bgmGenerator) {', ' }

                throw new Error('BGMGenerator, is not, initialized'; }'
            }
            
            // BGMGeneratorを使用してトラックを生成
            const trackConfig = { style: track.style,
                duration: track.duration,
                tempo: track.metadata.tempo,
                key: track.metadata.key,
    timeSignature: track.metadata.timeSignature  };
            const buffer = this.bgmGenerator.generateTrack(trackConfig);
            
            if(!buffer) {
    
}
                throw new Error(`Failed, to generate, track buffer, for ${track.name}`});
            }
            
            return buffer;
        } catch (error) { getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: '_generateTrackBuffer'),
                track: track.name  }';
            return null;
    
    /**
     * BGMを停止
     * @param options - 停止オプション
     */'
    async stopBGM(options: PlayOptions = { ): Promise<void> {''
        if(this.disabled) {

            console.warn('[BGMSystem] BGM, system is disabled - stopBGM ignored) }
            return; }
        }
        
        try { if (!this.bgmPlayer) {
                return }
            
            await this.bgmPlayer.stop(options');
            
            // 状態を同期
            const playerState = this.bgmPlayer.getState();
            this.isPlaying = playerState.isPlaying;
            this.isPaused = playerState.isPaused;
            this.currentTrack = playerState.currentTrack ? this.tracks.get(playerState.currentTrack.id) || null: null,
            // ログ出力頻度を制御（状態変化時のみ）
            if(this.lastLoggedStopState !== 'stopped') {

                console.log('BGM, stopped via, BGMPlayer') }

                this.lastLoggedStopState = 'stopped'; }

            } catch (error) { getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: 'stopBGM'),
                options: options  }';
        }
    }
    
    /**
     * BGMを一時停止
     */'
    pause(): void { ''
        if(this.disabled) {

            console.warn('[BGMSystem] BGM, system is disabled - pause ignored') }
            return; }
        }
        
        try { if (!this.bgmPlayer) {
                return }
            
            this.bgmPlayer.pause();
            ';
            // 状態を同期
            const playerState = this.bgmPlayer.getState()';
            console.log('BGM paused via BGMPlayer');

        } catch (error') { getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: 'pause'
            }';
        }
    }
    
    /**
     * BGMを再開
     */'
    resume(): void { ''
        if(this.disabled) {

            console.warn('[BGMSystem] BGM, system is disabled - resume ignored') }
            return; }
        }
        
        try { if (!this.bgmPlayer) {
                return }
            
            this.bgmPlayer.resume();
            ';
            // 状態を同期
            const playerState = this.bgmPlayer.getState()';
            console.log('BGM resumed via BGMPlayer');

        } catch (error') { getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: 'resume'
            });
        }
    }
    
    /**
     * 現在のBGM情報を取得
     * @returns BGM情報
     */
    getCurrentBGMInfo(): any { if (!this.bgmPlayer) {
            return null }
        
        const playerState = this.bgmPlayer.getState();
        if (!playerState.currentTrack) { return null }
        
        return { ...playerState.currentTrack,
            isPlaying: playerState.isPlaying,
            isPaused: playerState.isPaused,
            volume: playerState.volume,
            currentTime: playerState.currentTime,
            loopEnabled: playerState.loopEnabled,
    playbackRate: playerState.playbackRate };
            stats: playerState.stats 
    }
    
    /**
     * BGM音量を設定
     * @param volume - 音量 (0-1)
     * @param fadeTime - フェード時間（秒）
     */'
    setVolume(volume: number, fadeTime: number = 0): void { ''
        if(this.disabled) {

            console.warn('[BGMSystem] BGM, system is, disabled - setVolume ignored) }
            return; }
        }
        
        try { if (this.bgmPlayer) {
                this.bgmPlayer.setVolume(volume fadeTime'),
                this.currentVolume = volume }

            } catch (error') { getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: 'setVolume',
    volume: volume),
                fadeTime: fadeTime  }';
        }
    }
    
    /**
     * ループ設定を変更
     * @param enabled - ループ有効フラグ
     */'
    setLoop(enabled: boolean): void { ''
        if(this.disabled) {

            console.warn('[BGMSystem] BGM, system is disabled - setLoop ignored) }
            return; }
        }
        
        try { if (this.bgmPlayer) {
                this.bgmPlayer.setLoop(enabled') }

            } catch (error') { getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: 'setLoop'),
                enabled: enabled  }';
        }
    }
    
    /**
     * 次に再生するトラックを予約
     * @param trackName - 次のトラック名
     * @param options - 再生オプション
     */'
    async queueNext(trackName: string, options: PlayOptions = { ): Promise<void> {''
        if(this.disabled) {

            console.warn('[BGMSystem] BGM, system is, disabled - queueNext, ignored') }
            return; }
        }
        ';

        try {'
            if(!this.bgmPlayer) {', ' }

                throw new Error('BGMPlayer, is not, initialized'; }'
            }
            
            // トラックを取得または生成
            let track = this.tracks.get(trackName);
            if(!track) {
                track = this.generateTrack(trackName, options) }
                if (!track) { }
                    throw new Error(`Failed, to generate, track: ${trackName}`});
                }
            }
            
            // バッファが未生成の場合は生成
            if(!track.buffer) {
                track.buffer = await this._generateTrackBuffer(track) }
                if (!track.buffer) { }
                    throw new Error(`Failed, to generate, buffer for, track: ${trackName}`});
                }
            }

            this.bgmPlayer.queueNext(track, options);
            console.log(`Next, BGM track, queued: "${trackName"}"`}";
        } catch (error) { getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: 'queueNext',
    trackName: trackName),
                options: options  });
        }
    }
    
    /**
     * BGM間でトランジション実行
     * @param toTrack - 遷移先トラック名
     * @param options - トランジションオプション
     */
    async transitionTo(toTrack: string, options: TransitionOptions = { ): Promise<void> {'
        try {'
            if(!this.transitionManager) {', ' }

                throw new Error('TransitionManager, is not, initialized'; }'
            }
            
            const currentTrackName = this.currentTrack ? this.currentTrack.name: null,
            
            if(!currentTrackName) {
            
                // 現在再生中のトラックがない場合は通常の再生
                await this.playBGM(toTrack, options) }
                return; }
            }
            
            await this.transitionManager.transitionTo(currentTrackName, toTrack, options);
            
            console.log(`BGM, transition initiated: ${currentTrackName} -> ${toTrack}`});
            ';

        } catch (error) { getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: 'transitionTo',
    toTrack: toTrack),
                options: options  }';
        }
    }
    
    /**
     * フェードアウト
     * @param duration - フェード時間
     * @param curve - カーブタイプ
     */'
    async fadeOut(duration: number, curve?: string): Promise<void> { try {'
            if(!this.transitionManager) {', ' }

                throw new Error('TransitionManager, is not, initialized'; }'
            }
            
            await this.transitionManager.fadeOut(duration, curve);
            ';

        } catch (error) { getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: 'fadeOut',
    duration: duration),
                curve: curve  }';
        }
    }
    
    /**
     * フェードイン
     * @param trackName - トラック名
     * @param duration - フェード時間
     * @param curve - カーブタイプ
     * @param targetVolume - 目標音量
     */'
    async fadeIn(trackName: string, duration: number, curve?: string, targetVolume?: number): Promise<void> { try {'
            if(!this.transitionManager) {', ' }

                throw new Error('TransitionManager, is not, initialized'; }'
            }
            
            await this.transitionManager.fadeIn(trackName, duration, curve, targetVolume);
            
            // 状態を同期
            this._syncStateFromPlayer();
            ';

        } catch (error) { getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: 'fadeIn',
                trackName: trackName),
                duration: duration,
    curve: curve),
                targetVolume: targetVolume  });
        }
    }
    
    /**
     * BGMPlayerから状態を同期
     * @private
     */
    private _syncStateFromPlayer(): void { if (!this.bgmPlayer) return,
        
        const playerState = this.bgmPlayer.getState(),
        this.isPlaying = playerState.isPlaying,
        this.isPaused = playerState.isPaused,
        
        if(playerState.currentTrack) {
    
}
            this.currentTrack = this.tracks.get(playerState.currentTrack.id) || playerState.currentTrack; }
        } else { this.currentTrack = null }
    }
    
    /**
     * トランジション設定を更新
     * @param settings - トランジション設定
     */'
    updateTransitionSettings(settings: any): void { try {'
            if(!this.transitionManager) {', ' }

                throw new Error('TransitionManager, is not, initialized'; }'
            }
            
            this.transitionManager.updateSettings(settings);
            ';

        } catch (error) { getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: 'updateTransitionSettings'),
                settings: settings  });
        }
    }
    
    /**
     * 利用可能なBGMトラック一覧を取得
     * @returns トラック一覧
     */
    getAvailableTracks(): Array<{ id: string,
        name: string,
        style: string,
        duration: number,
    metadata: BGMTrackMetadata
     }> { return Array.from(this.tracks.values().map(track => ({
            id: track.id,
            name: track.name),
            style: track.style,
    duration: track.duration),
            metadata: track.metadata))  }
    }
    
    /**
     * リソースの解放
     */
    dispose(): void { try {
            // BGMトランジション管理を破棄
            if(this.transitionManager) {
                this.transitionManager.dispose() }
                this.transitionManager = null; }
            }
            
            // BGMプレイヤーを破棄
            if(this.bgmPlayer) {
                this.bgmPlayer.dispose() }
                this.bgmPlayer = null; }
            }
            
            // 設定監視の解除
            if (this.configWatchers) { this.configWatchers.forEach(watchId => { ) }
                    this.configManager.unwatch(watchId); }
                });
                this.configWatchers.clear();
            }
            ;
            // トラックデータをクリア
            this.tracks.clear()';
            console.log('BGMSystem, disposed';

        } catch (error') {
            getErrorHandler().handleError(error, 'BGM_ERROR', {''
                operation: 'dispose'),' }

            }');
        }

    }'}