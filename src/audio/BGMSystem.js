import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { BGMGenerator } from './BGMGenerator.js';

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
        this.currentSource = null;
        
        // 状態管理
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
        
        // BGM生成器
        this.bgmGenerator = null;
        
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
            if (this.currentSource && this.currentSource.gainNode) {
                this.currentSource.gainNode.gain.value = newValue;
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
            // 現在再生中のBGMを停止
            if (this.isPlaying) {
                await this.stopBGM();
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
            }
            
            // AudioBufferSourceNodeを作成
            const source = this.audioContext.createBufferSource();
            source.buffer = track.buffer;
            source.loop = track.loop;
            
            // GainNodeを作成（フェード用）
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0; // フェードインのため0から開始
            
            // 接続
            source.connect(gainNode);
            gainNode.connect(this.audioManager.bgmGainNode);
            
            // ソース情報を保存
            this.currentSource = {
                source: source,
                gainNode: gainNode,
                track: track
            };
            this.currentTrack = track;
            
            // フェードイン
            const fadeInDuration = options.fadeInDuration || track.fadeInDuration;
            const targetVolume = options.volume || this.currentVolume;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(targetVolume, this.audioContext.currentTime + fadeInDuration);
            
            // 再生開始
            source.start();
            
            // 状態更新
            this.isPlaying = true;
            this.isPaused = false;
            
            // 終了時の処理
            source.addEventListener('ended', () => {
                if (this.currentSource && this.currentSource.source === source) {
                    this.isPlaying = false;
                    this.currentSource = null;
                    this.currentTrack = null;
                }
            });
            
            console.log(`BGM "${trackName}" started playing`);
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
            if (!this.isPlaying || !this.currentSource) {
                return;
            }
            
            const fadeOutDuration = options.fadeOutDuration || this.currentTrack?.fadeOutDuration || 1.0;
            
            if (fadeOutDuration > 0) {
                // フェードアウト
                const gainNode = this.currentSource.gainNode;
                gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeOutDuration);
                
                // フェードアウト完了後に停止
                setTimeout(() => {
                    if (this.currentSource) {
                        try {
                            this.currentSource.source.stop();
                        } catch (e) {
                            // 既に停止済み
                        }
                    }
                }, fadeOutDuration * 1000);
            } else {
                // 即座に停止
                this.currentSource.source.stop();
            }
            
            // 状態更新
            this.isPlaying = false;
            this.isPaused = false;
            this.currentSource = null;
            this.currentTrack = null;
            
            console.log('BGM stopped');
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
            if (!this.isPlaying || this.isPaused) {
                return;
            }
            
            if (this.currentSource && this.currentSource.gainNode) {
                // 音量を0にして一時停止をシミュレート
                this.currentSource.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                this.isPaused = true;
                console.log('BGM paused');
            }
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
            if (!this.isPlaying || !this.isPaused) {
                return;
            }
            
            if (this.currentSource && this.currentSource.gainNode) {
                // 音量を復元
                this.currentSource.gainNode.gain.setValueAtTime(this.currentVolume, this.audioContext.currentTime);
                this.isPaused = false;
                console.log('BGM resumed');
            }
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
        if (!this.currentTrack) {
            return null;
        }
        
        return {
            id: this.currentTrack.id,
            name: this.currentTrack.name,
            style: this.currentTrack.style,
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            volume: this.currentVolume,
            metadata: this.currentTrack.metadata
        };
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
            // BGMを停止
            if (this.isPlaying) {
                this.stopBGM({ fadeOutDuration: 0 });
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
            
            console.log('BGMSystem disposed');
        } catch (error) {
            getErrorHandler().handleError(error, 'BGM_ERROR', {
                operation: 'dispose'
            });
        }
    }
}