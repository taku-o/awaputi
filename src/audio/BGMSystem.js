import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { BGMGenerator } from './BGMGenerator.js';
import { BGMPlayer } from './BGMPlayer.js';

/**
 * BGMシステム - 包括的なBGM管理・生成・再生システム
 */
export class BGMSystem {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.audioContext = audioManager.audioContext;
        this.configManager = getConfigurationManager();
        
        // BGMトラック管理
        this.tracks = new Map();
        this.currentTrack = null;
        
        // 状態管理（BGMPlayerと同期）
        this.isPlaying = false;
        this.isPaused = false;
        this.currentVolume = 1.0;
        
        // 設定監視のID管理
        this.configWatchers = new Set();
        
        // BGMタイプ定義
        this.bgmTypes = {
            menu: { style: 'ambient', tempo: 60, key: 'C', duration: 45 },
            gameplay: { style: 'energetic', tempo: 120, key: 'G', duration: 60 },
            bonus: { style: 'exciting', tempo: 140, key: 'D', duration: 30 },
            gameover: { style: 'dramatic', tempo: 80, key: 'Am', duration: 40 }
        };
        
        // BGM生成器とプレイヤー
        this.bgmGenerator = null;
        this.bgmPlayer = null;
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            if (!this.audioContext) {
                throw new Error('AudioContext is not available');
            }
            
            // BGM生成器を初期化
            this.bgmGenerator = new BGMGenerator(this.audioContext);
            
            // BGMプレイヤーを初期化
            this.bgmPlayer = new BGMPlayer(this.audioContext, this.audioManager.bgmGainNode);
            
            // 設定変更の監視
            this._setupConfigWatchers();
            
            console.log('BGMSystem initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'BGM_ERROR', {
                operation: 'initialize',
                component: 'BGMSystem'
            });
        }
    }
    
    /**
     * 設定変更の監視を設定
     * @private
     */
    _setupConfigWatchers() {
        // BGM音量の監視
        const bgmVolumeWatcher = this.configManager.watch('audio', 'volumes.bgm', (newValue) => {
            this.currentVolume = newValue;
            if (this.bgmPlayer) {
                this.bgmPlayer.setVolume(newValue, 0.1); // 0.1秒でフェード
            }
        });
        if (bgmVolumeWatcher) this.configWatchers.add(bgmVolumeWatcher);
        
        // ミュート状態の監視
        const mutedWatcher = this.configManager.watch('audio', 'volumes.muted', (newValue) => {
            if (newValue && this.isPlaying) {
                this.pause();
            } else if (!newValue && this.isPaused) {
                this.resume();
            }
        });
        if (mutedWatcher) this.configWatchers.add(mutedWatcher);
    }
    
    /**
     * BGMトラックを生成
     * @param {string} trackName - トラック名
     * @param {Object} options - 生成オプション
     * @returns {Object} BGMトラック
     */
    generateTrack(trackName, options = {}) {
        try {
            if (!this.bgmTypes[trackName]) {
                throw new Error(`Unknown BGM track type: ${trackName}`);
            }
            
            const trackConfig = { ...this.bgmTypes[trackName], ...options };
            
            // トラック情報を作成
            const track = {
                id: trackName,
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
                    genre: this._getGenreForStyle(trackConfig.style)
                }
            };
            
            // トラックを保存
            this.tracks.set(trackName, track);
            
            console.log(`BGM track "${trackName}" generated with style "${trackConfig.style}"`);
            return track;
        } catch (error) {
            getErrorHandler().handleError(error, 'BGM_ERROR', {
                operation: 'generateTrack',
                trackName: trackName,
                options: options
            });
            return null;
        }
    }
    
    /**
     * スタイルに応じたジャンルを取得
     * @param {string} style - BGMスタイル
     * @returns {string} ジャンル
     * @private
     */
    _getGenreForStyle(style) {
        const genreMap = {
            ambient: 'ambient',
            energetic: 'electronic',
            exciting: 'dance',
            dramatic: 'orchestral'
        };
        return genreMap[style] || 'unknown';
    }
    
    /**
     * BGMを再生
     * @param {string} trackName - トラック名
     * @param {Object} options - 再生オプション
     */
    async playBGM(trackName, options = {}) {
        try {
            if (!this.bgmPlayer) {
                throw new Error('BGMPlayer is not initialized');
            }
            
            // トラックを取得または生成
            let track = this.tracks.get(trackName);
            if (!track) {
                track = this.generateTrack(trackName, options);
                if (!track) {
                    throw new Error(`Failed to generate track: ${trackName}`);
                }
            }
            
            // バッファが未生成の場合は生成
            if (!track.buffer) {
                track.buffer = await this._generateTrackBuffer(track);
                if (!track.buffer) {
                    throw new Error(`Failed to generate buffer for track: ${trackName}`);
                }
            }
            
            // BGMPlayerを使用して再生
            await this.bgmPlayer.play(track, options);
            
            // 状態を同期
            this.currentTrack = track;
            this.isPlaying = this.bgmPlayer.getState().isPlaying;
            this.isPaused = this.bgmPlayer.getState().isPaused;
            
            console.log(`BGM "${trackName}" started playing via BGMPlayer`);
        } catch (error) {
            getErrorHandler().handleError(error, 'BGM_ERROR', {
                operation: 'playBGM',
                trackName: trackName,
                options: options
            });
        }
    }
    
    /**
     * BGMトラックのバッファを生成
     * @param {Object} track - トラック情報
     * @returns {AudioBuffer} 生成されたオーディオバッファ
     * @private
     */
    async _generateTrackBuffer(track) {
        try {
            if (!this.bgmGenerator) {
                throw new Error('BGMGenerator is not initialized');
            }
            
            // BGMGeneratorを使用してトラックを生成
            const trackConfig = {
                style: track.style,
                duration: track.duration,
                tempo: track.metadata.tempo,
                key: track.metadata.key,
                timeSignature: track.metadata.timeSignature
            };
            
            const buffer = this.bgmGenerator.generateTrack(trackConfig);
            
            if (!buffer) {
                throw new Error(`Failed to generate track buffer for ${track.name}`);
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'BGM_ERROR', {
                operation: '_generateTrackBuffer',
                track: track.name
            });
            return null;
        }
    }
    
    /**
     * BGMを停止
     * @param {Object} options - 停止オプション
     */
    async stopBGM(options = {}) {
        try {
            if (!this.bgmPlayer) {
                return;
            }
            
            await this.bgmPlayer.stop(options);
            
            // 状態を同期
            const playerState = this.bgmPlayer.getState();
            this.isPlaying = playerState.isPlaying;
            this.isPaused = playerState.isPaused;
            this.currentTrack = playerState.currentTrack;
            
            console.log('BGM stopped via BGMPlayer');
        } catch (error) {
            getErrorHandler().handleError(error, 'BGM_ERROR', {
                operation: 'stopBGM',
                options: options
            });
        }
    }
    
    /**
     * BGMを一時停止
     */
    pause() {
        try {
            if (!this.bgmPlayer) {
                return;
            }
            
            this.bgmPlayer.pause();
            
            // 状態を同期
            const playerState = this.bgmPlayer.getState();
            this.isPlaying = playerState.isPlaying;
            this.isPaused = playerState.isPaused;
            
            console.log('BGM paused via BGMPlayer');
        } catch (error) {
            getErrorHandler().handleError(error, 'BGM_ERROR', {
                operation: 'pause'
            });
        }
    }
    
    /**
     * BGMを再開
     */
    resume() {
        try {
            if (!this.bgmPlayer) {
                return;
            }
            
            this.bgmPlayer.resume();
            
            // 状態を同期
            const playerState = this.bgmPlayer.getState();
            this.isPlaying = playerState.isPlaying;
            this.isPaused = playerState.isPaused;
            
            console.log('BGM resumed via BGMPlayer');
        } catch (error) {
            getErrorHandler().handleError(error, 'BGM_ERROR', {
                operation: 'resume'
            });
        }
    }
    
    /**
     * 現在のBGM情報を取得
     * @returns {Object} BGM情報
     */
    getCurrentBGMInfo() {
        if (!this.bgmPlayer) {
            return null;
        }
        
        const playerState = this.bgmPlayer.getState();
        if (!playerState.currentTrack) {
            return null;
        }
        
        return {
            ...playerState.currentTrack,
            isPlaying: playerState.isPlaying,
            isPaused: playerState.isPaused,
            volume: playerState.volume,
            currentTime: playerState.currentTime,
            loopEnabled: playerState.loopEnabled,
            playbackRate: playerState.playbackRate,
            stats: playerState.stats
        };
    }
    
    /**
     * BGM音量を設定
     * @param {number} volume - 音量 (0-1)
     * @param {number} fadeTime - フェード時間（秒）
     */
    setVolume(volume, fadeTime = 0) {
        try {
            if (this.bgmPlayer) {
                this.bgmPlayer.setVolume(volume, fadeTime);
                this.currentVolume = volume;
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'BGM_ERROR', {
                operation: 'setVolume',
                volume: volume,
                fadeTime: fadeTime
            });
        }
    }
    
    /**
     * ループ設定を変更
     * @param {boolean} enabled - ループ有効フラグ
     */
    setLoop(enabled) {
        try {
            if (this.bgmPlayer) {
                this.bgmPlayer.setLoop(enabled);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'BGM_ERROR', {
                operation: 'setLoop',
                enabled: enabled
            });
        }
    }
    
    /**
     * 次に再生するトラックを予約
     * @param {string} trackName - 次のトラック名
     * @param {Object} options - 再生オプション
     */
    async queueNext(trackName, options = {}) {
        try {
            if (!this.bgmPlayer) {
                throw new Error('BGMPlayer is not initialized');
            }
            
            // トラックを取得または生成
            let track = this.tracks.get(trackName);
            if (!track) {
                track = this.generateTrack(trackName, options);
                if (!track) {
                    throw new Error(`Failed to generate track: ${trackName}`);
                }
            }
            
            // バッファが未生成の場合は生成
            if (!track.buffer) {
                track.buffer = await this._generateTrackBuffer(track);
                if (!track.buffer) {
                    throw new Error(`Failed to generate buffer for track: ${trackName}`);
                }
            }
            
            this.bgmPlayer.queueNext(track, options);
            console.log(`Next BGM track queued: "${trackName}"`);
        } catch (error) {
            getErrorHandler().handleError(error, 'BGM_ERROR', {
                operation: 'queueNext',
                trackName: trackName,
                options: options
            });
        }
    }
    
    /**
     * 利用可能なBGMトラック一覧を取得
     * @returns {Array} トラック一覧
     */
    getAvailableTracks() {
        return Array.from(this.tracks.values()).map(track => ({
            id: track.id,
            name: track.name,
            style: track.style,
            duration: track.duration,
            metadata: track.metadata
        }));
    }
    
    /**
     * リソースの解放
     */
    dispose() {
        try {
            // BGMプレイヤーを破棄
            if (this.bgmPlayer) {
                this.bgmPlayer.dispose();
                this.bgmPlayer = null;
            }
            
            // 設定監視の解除
            if (this.configWatchers) {
                this.configWatchers.forEach(watchId => {
                    this.configManager.unwatch(watchId);
                });
                this.configWatchers.clear();
            }
            
            // トラックデータをクリア
            this.tracks.clear();
            
            // BGM生成器をクリア
            this.bgmGenerator = null;
            
            console.log('BGMSystem disposed');
        } catch (error) {
            getErrorHandler().handleError(error, 'BGM_ERROR', {
                operation: 'dispose'
            });
        }
    }
}