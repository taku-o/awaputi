import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

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
            const duration = track.duration;
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            
            // スタイルに応じて異なる生成アルゴリズムを使用
            switch (track.style) {
                case 'ambient':
                    this._generateAmbientTrack(buffer, track);
                    break;
                case 'energetic':
                    this._generateEnergeticTrack(buffer, track);
                    break;
                case 'exciting':
                    this._generateExcitingTrack(buffer, track);
                    break;
                case 'dramatic':
                    this._generateDramaticTrack(buffer, track);
                    break;
                default:
                    this._generateAmbientTrack(buffer, track);
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
     * アンビエントBGMを生成
     * @param {AudioBuffer} buffer - オーディオバッファ
     * @param {Object} track - トラック情報
     * @private
     */
    _generateAmbientTrack(buffer, track) {
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);
        const sampleRate = buffer.sampleRate;
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            
            // 基音（低周波ドローン）
            const freq1 = 55; // A1
            const freq2 = 82.4; // E2
            const freq3 = 110; // A2
            
            // ゆっくりとした音量変調
            const amp1 = Math.sin(t * 0.1) * 0.3 + 0.7;
            const amp2 = Math.sin(t * 0.07) * 0.2 + 0.8;
            const amp3 = Math.sin(t * 0.13) * 0.1 + 0.9;
            
            // パッド音合成
            const pad1 = Math.sin(2 * Math.PI * freq1 * t) * amp1 * 0.15;
            const pad2 = Math.sin(2 * Math.PI * freq2 * t) * amp2 * 0.12;
            const pad3 = Math.sin(2 * Math.PI * freq3 * t) * amp3 * 0.10;
            
            // 環境音効果
            const noise = (Math.random() - 0.5) * 0.02;
            
            const sample = (pad1 + pad2 + pad3 + noise) * 0.4;
            
            leftChannel[i] = sample;
            rightChannel[i] = sample * 0.9; // わずかなステレオ効果
        }
    }
    
    /**
     * エネルギッシュなBGMを生成
     * @param {AudioBuffer} buffer - オーディオバッファ
     * @param {Object} track - トラック情報
     * @private
     */
    _generateEnergeticTrack(buffer, track) {
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);
        const sampleRate = buffer.sampleRate;
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const tempo = track.metadata.tempo;
            const beatTime = 60 / tempo; // 1拍の時間
            const beatProgress = (t % beatTime) / beatTime;
            
            // ベースライン（4拍子）
            const bassFreq = 65.4; // C2
            const bassBeat = Math.floor(t / beatTime) % 4;
            const bassAmp = bassBeat === 0 || bassBeat === 2 ? 0.3 : 0.15;
            const bass = Math.sin(2 * Math.PI * bassFreq * t) * bassAmp;
            
            // メロディライン
            const melodyFreqs = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
            const melodyIndex = Math.floor(t / (beatTime * 2)) % melodyFreqs.length;
            const melodyFreq = melodyFreqs[melodyIndex];
            const melodyAmp = Math.sin(Math.PI * beatProgress) * 0.2;
            const melody = Math.sin(2 * Math.PI * melodyFreq * t) * melodyAmp;
            
            // ハイハット風効果
            const hihat = (Math.random() - 0.5) * 0.1 * (beatProgress < 0.1 ? 1 : 0);
            
            const sample = bass + melody + hihat;
            
            leftChannel[i] = sample * 0.8;
            rightChannel[i] = sample * 0.8;
        }
    }
    
    /**
     * エキサイティングなBGMを生成
     * @param {AudioBuffer} buffer - オーディオバッファ
     * @param {Object} track - トラック情報
     * @private
     */
    _generateExcitingTrack(buffer, track) {
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);
        const sampleRate = buffer.sampleRate;
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const tempo = track.metadata.tempo;
            const beatTime = 60 / tempo;
            const beatProgress = (t % beatTime) / beatTime;
            
            // 高速アルペジオ
            const arpeggioFreqs = [293.66, 369.99, 440.00, 554.37]; // D, F#, A, C#
            const arpeggioSpeed = 8; // 1拍に8音
            const arpeggioIndex = Math.floor((t % beatTime) / (beatTime / arpeggioSpeed)) % arpeggioFreqs.length;
            const arpeggioFreq = arpeggioFreqs[arpeggioIndex];
            const arpeggioAmp = Math.exp(-(t % (beatTime / arpeggioSpeed)) * 20) * 0.25;
            const arpeggio = Math.sin(2 * Math.PI * arpeggioFreq * t) * arpeggioAmp;
            
            // 強いベース
            const bassFreq = 73.42; // D2
            const bassAmp = Math.sin(Math.PI * beatProgress * 2) * 0.4;
            const bass = Math.sin(2 * Math.PI * bassFreq * t) * bassAmp;
            
            // ドラム風効果
            const kick = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-beatProgress * 10) * 0.3;
            
            const sample = arpeggio + bass + kick;
            
            leftChannel[i] = sample * 0.9;
            rightChannel[i] = sample * 0.9;
        }
    }
    
    /**
     * ドラマチックなBGMを生成
     * @param {AudioBuffer} buffer - オーディオバッファ
     * @param {Object} track - トラック情報
     * @private
     */
    _generateDramaticTrack(buffer, track) {
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);
        const sampleRate = buffer.sampleRate;
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const progress = t / track.duration;
            
            // オーケストラ風和音（Am）
            const freq1 = 220.00; // A3
            const freq2 = 261.63; // C4
            const freq3 = 329.63; // E4
            const freq4 = 440.00; // A4
            
            // 動的な音量変化
            const dynamicAmp = Math.sin(progress * Math.PI * 4) * 0.3 + 0.7;
            
            // 弦楽器風のアタック
            const attack = Math.exp(-((t % 4) * 2));
            
            const chord = (
                Math.sin(2 * Math.PI * freq1 * t) * 0.3 +
                Math.sin(2 * Math.PI * freq2 * t) * 0.25 +
                Math.sin(2 * Math.PI * freq3 * t) * 0.2 +
                Math.sin(2 * Math.PI * freq4 * t) * 0.15
            ) * dynamicAmp * attack;
            
            // リバーブ風効果
            const delay = i > sampleRate * 0.1 ? leftChannel[i - Math.floor(sampleRate * 0.1)] * 0.2 : 0;
            
            const sample = chord + delay;
            
            leftChannel[i] = sample * 0.6;
            rightChannel[i] = sample * 0.6;
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