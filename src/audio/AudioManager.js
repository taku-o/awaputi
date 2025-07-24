import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getAudioConfig } from '../config/AudioConfig.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

/**
 * 音響管理クラス - Web Audio API を使用した高度な音響システム
 */
export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.isEnabled = true;
        this.isMuted = false;
        
        // 設定管理
        this.audioConfig = getAudioConfig();
        this.configManager = getConfigurationManager();
        
        // 設定値を取得
        const volumeConfig = this.audioConfig.getVolumeConfig();
        this.masterVolume = volumeConfig.master;
        this.sfxVolume = volumeConfig.sfx;
        this.bgmVolume = volumeConfig.bgm;
        this.isMuted = volumeConfig.muted;
        
        // オーディオノード
        this.masterGainNode = null;
        this.sfxGainNode = null;
        this.bgmGainNode = null;
        this.compressor = null;
        
        // BGM関連
        this.currentBGM = null;
        this.bgmSource = null;
        this.bgmBuffer = null;
        
        // 効果音バッファ
        this.soundBuffers = new Map();
        this.activeSources = new Set();
        
        // 音響効果
        this.reverbBuffer = null;
        this.reverbConvolver = null;
        
        // 設定監視のID管理
        this.configWatchers = new Set();
        
        // 設定変更の監視
        this._setupConfigWatchers();
        
        this.initialize();
    }
    
    /**
     * 設定変更の監視を設定
     * @private
     */
    _setupConfigWatchers() {
        // マスター音量の監視
        const masterVolumeWatcher = this.configManager.watch('audio', 'volumes.master', (newValue) => {
            this.masterVolume = newValue;
            if (this.masterGainNode) {
                this.masterGainNode.gain.value = newValue;
            }
        });
        if (masterVolumeWatcher) this.configWatchers.add(masterVolumeWatcher);
        
        // SFX音量の監視
        const sfxVolumeWatcher = this.configManager.watch('audio', 'volumes.sfx', (newValue) => {
            this.sfxVolume = newValue;
            if (this.sfxGainNode) {
                this.sfxGainNode.gain.value = newValue;
            }
        });
        if (sfxVolumeWatcher) this.configWatchers.add(sfxVolumeWatcher);
        
        // BGM音量の監視
        const bgmVolumeWatcher = this.configManager.watch('audio', 'volumes.bgm', (newValue) => {
            this.bgmVolume = newValue;
            if (this.bgmGainNode) {
                this.bgmGainNode.gain.value = newValue;
            }
        });
        if (bgmVolumeWatcher) this.configWatchers.add(bgmVolumeWatcher);
        
        // ミュート状態の監視
        const mutedWatcher = this.configManager.watch('audio', 'volumes.muted', (newValue) => {
            if (this.isMuted !== newValue) {
                this.isMuted = newValue;
                if (this.isMuted) {
                    this.stopAllSounds();
                }
            }
        });
        if (mutedWatcher) this.configWatchers.add(mutedWatcher);
        
        // コンプレッサー設定の監視
        const compressionWatcher = this.configManager.watch('audio', 'effects.compression', (newValue) => {
            // コンプレッサーの有効/無効を切り替え
            if (this.compressor) {
                if (newValue) {
                    // コンプレッサーを接続
                    this.reconnectCompressor();
                } else {
                    // コンプレッサーをバイパス
                    this.bypassCompressor();
                }
            }
        });
        if (compressionWatcher) this.configWatchers.add(compressionWatcher);
        
        // リバーブ設定の監視
        const reverbWatcher = this.configManager.watch('audio', 'effects.reverb', (newValue) => {
            // リバーブの有効/無効を切り替え
            if (this.reverbConvolver) {
                if (newValue) {
                    // リバーブを接続
                    this.reconnectReverb();
                } else {
                    // リバーブをバイパス
                    this.bypassReverb();
                }
            }
        });
        if (reverbWatcher) this.configWatchers.add(reverbWatcher);
    }
    
    /**
     * 初期化
     */
    async initialize() {
        try {
            // AudioContextの作成
            if (!window.AudioContext && !window.webkitAudioContext) {
                throw new Error('Web Audio API is not supported');
            }
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // AudioContextの状態を確認
            if (this.audioContext.state === 'suspended') {
                console.warn('AudioContext is suspended, will need user interaction to resume');
            }
            
            // マスターゲインノード
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.value = this.masterVolume;
            this.masterGainNode.connect(this.audioContext.destination);
            
            // コンプレッサー（音量の均一化）
            const compressorConfig = this.audioConfig.getCompressorConfig();
            this.compressor = this.audioContext.createDynamicsCompressor();
            this.compressor.threshold.value = compressorConfig.threshold;
            this.compressor.knee.value = compressorConfig.knee;
            this.compressor.ratio.value = compressorConfig.ratio;
            this.compressor.attack.value = compressorConfig.attack;
            this.compressor.release.value = compressorConfig.release;
            
            // コンプレッサーの接続（設定に基づく）
            if (this.audioConfig.isCompressionEnabled()) {
                this.compressor.connect(this.masterGainNode);
            } else {
                // コンプレッサーをバイパス
                this.compressor.connect(this.masterGainNode);
                this.compressor.threshold.value = -100; // 実質的に無効化
            }
            
            // SFXゲインノード
            this.sfxGainNode = this.audioContext.createGain();
            this.sfxGainNode.gain.value = this.sfxVolume;
            this.sfxGainNode.connect(this.compressor);
            
            // BGMゲインノード
            this.bgmGainNode = this.audioContext.createGain();
            this.bgmGainNode.gain.value = this.bgmVolume;
            this.bgmGainNode.connect(this.compressor);
            
            // リバーブエフェクトの初期化
            try {
                await this.initializeReverb();
            } catch (reverbError) {
                getErrorHandler().handleError(reverbError, 'AUDIO_ERROR', { 
                    component: 'reverb',
                    operation: 'initialize'
                });
                // リバーブなしで続行
            }
            
            // プロシージャル効果音の生成
            try {
                this.generateProceduralSounds();
            } catch (soundError) {
                getErrorHandler().handleError(soundError, 'AUDIO_ERROR', { 
                    component: 'proceduralSounds',
                    operation: 'generate'
                });
                // 効果音なしで続行
            }
            
            console.log('AudioManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', { 
                operation: 'initialize',
                userAgent: navigator.userAgent,
                audioContextSupport: !!(window.AudioContext || window.webkitAudioContext)
            });
            this.isEnabled = false;
        }
    }
    
    /**
     * リバーブエフェクトの初期化
     */
    async initializeReverb() {
        if (!this.audioContext) return;
        
        const reverbConfig = this.audioConfig.getReverbConfig();
        
        this.reverbConvolver = this.audioContext.createConvolver();
        this.reverbBuffer = this.createReverbBuffer(
            2, 
            this.audioContext.sampleRate * reverbConfig.duration, 
            this.audioContext.sampleRate,
            reverbConfig.decay
        );
        this.reverbConvolver.buffer = this.reverbBuffer;
        
        // リバーブの接続（設定に基づく）
        if (this.audioConfig.isReverbEnabled()) {
            this.reverbConvolver.connect(this.compressor);
        }
    }
    
    /**
     * リバーブバッファを作成
     * @param {number} channels - チャンネル数
     * @param {number} length - バッファ長
     * @param {number} sampleRate - サンプルレート
     * @param {number} decayFactor - 減衰係数
     * @returns {AudioBuffer} リバーブバッファ
     */
    createReverbBuffer(channels, length, sampleRate, decayFactor = 0.5) {
        const buffer = this.audioContext.createBuffer(channels, length, sampleRate);
        
        for (let channel = 0; channel < channels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const decay = Math.pow(1 - (i / length), 2) * decayFactor;
                channelData[i] = (Math.random() * 2 - 1) * decay * 0.5;
            }
        }
        
        return buffer;
    }
    
    /**
     * コンプレッサーを再接続
     */
    reconnectCompressor() {
        if (!this.audioContext || !this.compressor) return;
        
        // 一旦切断
        this.compressor.disconnect();
        
        // 再接続
        this.compressor.connect(this.masterGainNode);
        
        // コンプレッサー設定を適用
        const compressorConfig = this.audioConfig.getCompressorConfig();
        this.compressor.threshold.value = compressorConfig.threshold;
        this.compressor.knee.value = compressorConfig.knee;
        this.compressor.ratio.value = compressorConfig.ratio;
        this.compressor.attack.value = compressorConfig.attack;
        this.compressor.release.value = compressorConfig.release;
    }
    
    /**
     * コンプレッサーをバイパス
     */
    bypassCompressor() {
        if (!this.audioContext || !this.compressor) return;
        
        // コンプレッサーを実質的に無効化
        this.compressor.threshold.value = -100;
        this.compressor.ratio.value = 1;
    }
    
    /**
     * リバーブを再接続
     */
    reconnectReverb() {
        if (!this.audioContext || !this.reverbConvolver) return;
        
        // 一旦切断
        this.reverbConvolver.disconnect();
        
        // 再接続
        this.reverbConvolver.connect(this.compressor);
    }
    
    /**
     * リバーブをバイパス
     */
    bypassReverb() {
        if (!this.audioContext || !this.reverbConvolver) return;
        
        // 切断
        this.reverbConvolver.disconnect();
    }
    
    /**
     * プロシージャル効果音の生成
     */
    generateProceduralSounds() {
        if (!this.audioContext) return;
        
        // 泡ポップ音
        this.soundBuffers.set('pop', this.createPopSound());
        this.soundBuffers.set('pop_combo', this.createPopSound(true));
        
        // 特殊効果音
        this.soundBuffers.set('bonus', this.createBonusSound());
        this.soundBuffers.set('heal', this.createHealSound());
        this.soundBuffers.set('damage', this.createDamageSound());
        this.soundBuffers.set('electric', this.createElectricSound());
        this.soundBuffers.set('chain', this.createChainSound());
        this.soundBuffers.set('time_stop', this.createTimeStopSound());
        
        // UI音
        this.soundBuffers.set('click', this.createClickSound());
        this.soundBuffers.set('hover', this.createHoverSound());
        this.soundBuffers.set('error', this.createErrorSound());
        this.soundBuffers.set('success', this.createSuccessSound());
        
        // ゲーム状態音
        this.soundBuffers.set('game_start', this.createGameStartSound());
        this.soundBuffers.set('game_over', this.createGameOverSound());
        this.soundBuffers.set('warning', this.createWarningSound());
    }
    
    /**
     * ポップ音を生成
     */
    createPopSound(isCombo = false) {
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        const baseFreq = isCombo ? 800 : 400;
        const freqModulation = isCombo ? 1.5 : 1.2;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const decay = Math.exp(-t * 8);
            const freq = baseFreq * Math.pow(freqModulation, -t * 4);
            
            data[i] = Math.sin(2 * Math.PI * freq * t) * decay * 0.3;
            
            // ノイズ成分を追加
            data[i] += (Math.random() - 0.5) * decay * 0.1;
        }
        
        return buffer;
    }
    
    /**
     * ボーナス音を生成
     */
    createBonusSound() {
        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            // 上昇する音階
            const freq1 = 440 * Math.pow(2, progress * 2); // 2オクターブ上昇
            const freq2 = 440 * 1.5 * Math.pow(2, progress * 2);
            
            const decay = Math.exp(-t * 2);
            const envelope = Math.sin(Math.PI * progress);
            
            data[i] = (Math.sin(2 * Math.PI * freq1 * t) + 
                      Math.sin(2 * Math.PI * freq2 * t) * 0.5) * decay * envelope * 0.3;
        }
        
        return buffer;
    }
    
    /**
     * 回復音を生成
     */
    createHealSound() {
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            // 優しい和音
            const freq1 = 523.25; // C5
            const freq2 = 659.25; // E5
            const freq3 = 783.99; // G5
            
            const decay = Math.exp(-t * 3);
            const envelope = Math.sin(Math.PI * progress);
            
            data[i] = (Math.sin(2 * Math.PI * freq1 * t) +
                      Math.sin(2 * Math.PI * freq2 * t) * 0.7 +
                      Math.sin(2 * Math.PI * freq3 * t) * 0.5) * decay * envelope * 0.2;
        }
        
        return buffer;
    }
    
    /**
     * ダメージ音を生成
     */
    createDamageSound() {
        const duration = 0.2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            // 不協和音とノイズ
            const freq = 150 + Math.sin(t * 50) * 50;
            const decay = Math.exp(-t * 5);
            
            data[i] = (Math.sin(2 * Math.PI * freq * t) + 
                      (Math.random() - 0.5) * 0.5) * decay * 0.4;
        }
        
        return buffer;
    }
    
    /**
     * 電気音を生成
     */
    createElectricSound() {
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            
            // 高周波ノイズ
            const noise = (Math.random() - 0.5) * 2;
            const freq = 2000 + Math.sin(t * 100) * 1000;
            const buzz = Math.sin(2 * Math.PI * freq * t);
            
            const decay = Math.exp(-t * 4);
            data[i] = (noise * 0.7 + buzz * 0.3) * decay * 0.3;
        }
        
        return buffer;
    }
    
    /**
     * 連鎖音を生成
     */
    createChainSound() {
        const duration = 0.4;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            // 連続する爆発音
            const freq = 200 + Math.sin(t * 20) * 100;
            const amplitude = Math.sin(progress * Math.PI * 8) * Math.exp(-t * 2);
            
            data[i] = Math.sin(2 * Math.PI * freq * t) * amplitude * 0.4;
        }
        
        return buffer;
    }
    
    /**
     * 時間停止音を生成
     */
    createTimeStopSound() {
        const duration = 0.6;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            // 下降する音程
            const freq = 1000 * Math.pow(0.1, progress);
            const envelope = Math.exp(-t * 2) * (1 - progress);
            
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.5;
        }
        
        return buffer;
    }
    
    /**
     * クリック音を生成
     */
    createClickSound() {
        const duration = 0.05;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const decay = Math.exp(-t * 20);
            
            data[i] = Math.sin(2 * Math.PI * 800 * t) * decay * 0.2;
        }
        
        return buffer;
    }
    
    /**
     * ホバー音を生成
     */
    createHoverSound() {
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const decay = Math.exp(-t * 10);
            
            data[i] = Math.sin(2 * Math.PI * 600 * t) * decay * 0.1;
        }
        
        return buffer;
    }
    
    /**
     * エラー音を生成
     */
    createErrorSound() {
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const freq = 200 - t * 100;
            const decay = Math.exp(-t * 3);
            
            data[i] = Math.sin(2 * Math.PI * freq * t) * decay * 0.3;
        }
        
        return buffer;
    }
    
    /**
     * 成功音を生成
     */
    createSuccessSound() {
        const duration = 0.4;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            const freq = 440 + progress * 220; // A4からA5へ
            const envelope = Math.sin(Math.PI * progress);
            const decay = Math.exp(-t * 2);
            
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * decay * 0.3;
        }
        
        return buffer;
    }
    
    /**
     * ゲーム開始音を生成
     */
    createGameStartSound() {
        const duration = 1.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            // 上昇するアルペジオ
            const frequencies = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
            const noteIndex = Math.floor(progress * frequencies.length);
            const freq = frequencies[Math.min(noteIndex, frequencies.length - 1)];
            
            const noteProgress = (progress * frequencies.length) % 1;
            const envelope = Math.sin(Math.PI * noteProgress);
            const decay = Math.exp(-t * 1);
            
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * decay * 0.3;
        }
        
        return buffer;
    }
    
    /**
     * ゲームオーバー音を生成
     */
    createGameOverSound() {
        const duration = 1.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            // 下降する悲しい音程
            const freq = 440 * Math.pow(0.5, progress * 2);
            const envelope = Math.exp(-t * 1);
            
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
        }
        
        return buffer;
    }
    
    /**
     * 警告音を生成
     */
    createWarningSound() {
        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            
            // 警告のビープ音
            const freq = 800 + Math.sin(t * 10) * 200;
            const envelope = Math.sin(t * 20) * Math.exp(-t * 2);
            
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
        }
        
        return buffer;
    }
    
    /**
     * 効果音を再生
     */
    playSound(soundName, options = {}) {
        if (!this.isEnabled || this.isMuted || !this.audioContext || !this.soundBuffers.has(soundName)) {
            return null;
        }
        
        try {
            // 入力値を検証
            const nameValidation = getErrorHandler().validateInput(soundName, 'string', {
                maxLength: 50,
                pattern: /^[a-zA-Z_]+$/
            });
            
            if (!nameValidation.isValid) {
                getErrorHandler().handleError(new Error(`Invalid sound name: ${nameValidation.errors.join(', ')}`), 'VALIDATION_ERROR', {
                    input: soundName,
                    errors: nameValidation.errors
                });
                return null;
            }
            
            // オプションを検証
            const optionsValidation = getErrorHandler().validateInput(options, 'object', {
                properties: {
                    volume: { type: 'number', min: 0, max: 2 },
                    pitch: { type: 'number', min: 0.1, max: 4 },
                    pan: { type: 'number', min: -1, max: 1 },
                    reverb: { type: 'number', min: 0, max: 1 },
                    delay: { type: 'number', min: 0, max: 10 }
                }
            });
            
            if (!optionsValidation.isValid) {
                getErrorHandler().handleError(new Error(`Invalid sound options: ${optionsValidation.errors.join(', ')}`), 'VALIDATION_ERROR', {
                    input: options,
                    errors: optionsValidation.errors
                });
                // サニタイズされたオプションを使用
                options = optionsValidation.sanitizedValue;
            }
            
            const buffer = this.soundBuffers.get(soundName);
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            
            // ゲインノード（音量調整）
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = options.volume || 1.0;
            
            // ピッチ調整
            if (options.pitch) {
                source.playbackRate.value = options.pitch;
            }
            
            // パン（左右の音の位置）
            let destination = this.sfxGainNode;
            if (options.pan !== undefined) {
                const panNode = this.audioContext.createStereoPanner();
                panNode.pan.value = Math.max(-1, Math.min(1, options.pan));
                gainNode.connect(panNode);
                panNode.connect(this.sfxGainNode);
            } else {
                gainNode.connect(destination);
            }
            
            // リバーブ効果
            if (options.reverb) {
                const reverbGain = this.audioContext.createGain();
                reverbGain.gain.value = options.reverb;
                gainNode.connect(reverbGain);
                reverbGain.connect(this.reverbConvolver);
            }
            
            source.connect(gainNode);
            
            // 再生
            const startTime = this.audioContext.currentTime + (options.delay || 0);
            source.start(startTime);
            
            // 管理用
            this.activeSources.add(source);
            source.addEventListener('ended', () => {
                this.activeSources.delete(source);
            });
            
            return source;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', { 
                operation: 'playSound',
                soundName: soundName,
                options: options,
                contextState: this.audioContext ? this.audioContext.state : 'none'
            });
            return null;
        }
    }
    
    /**
     * プロシージャルBGMを生成・再生
     */
    startProceduralBGM() {
        if (!this.isEnabled || this.isMuted || !this.audioContext) {
            return;
        }
        
        this.stopBGM();
        
        // シンプルなアンビエントBGMを生成
        const duration = 30; // 30秒ループ
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        // 低周波のドローン音
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            
            const freq1 = 55; // A1
            const freq2 = 82.4; // E2
            const freq3 = 110; // A2
            
            const amp1 = Math.sin(t * 0.1) * 0.3 + 0.7;
            const amp2 = Math.sin(t * 0.07) * 0.2 + 0.8;
            const amp3 = Math.sin(t * 0.13) * 0.1 + 0.9;
            
            data[i] = (Math.sin(2 * Math.PI * freq1 * t) * amp1 * 0.1 +
                      Math.sin(2 * Math.PI * freq2 * t) * amp2 * 0.08 +
                      Math.sin(2 * Math.PI * freq3 * t) * amp3 * 0.06) * 0.3;
        }
        
        // BGM再生
        this.bgmSource = this.audioContext.createBufferSource();
        this.bgmSource.buffer = buffer;
        this.bgmSource.loop = true;
        this.bgmSource.connect(this.bgmGainNode);
        this.bgmSource.start();
        
        console.log('Procedural BGM started');
    }
    
    /**
     * BGMを停止
     */
    stopBGM() {
        if (this.bgmSource) {
            try {
                this.bgmSource.stop();
            } catch (e) {
                // Already stopped
            }
            this.bgmSource = null;
        }
    }
    
    /**
     * 全ての音を停止
     */
    stopAllSounds() {
        this.stopBGM();
        
        this.activeSources.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                // Already stopped
            }
        });
        this.activeSources.clear();
    }
    
    /**
     * 音量設定
     * @param {string} type - 音量タイプ ('master', 'sfx', 'bgm')
     * @param {number} volume - 音量 (0-1)
     */
    setVolume(type, volume) {
        volume = Math.max(0, Math.min(1, volume));
        
        switch (type) {
            case 'master':
                this.audioConfig.setMasterVolume(volume);
                // 設定変更の監視により自動的に適用される
                break;
            case 'sfx':
                this.audioConfig.setSfxVolume(volume);
                // 設定変更の監視により自動的に適用される
                break;
            case 'bgm':
                this.audioConfig.setBgmVolume(volume);
                // 設定変更の監視により自動的に適用される
                break;
        }
    }
    
    /**
     * 音量を取得
     * @param {string} type - 音量タイプ ('master', 'sfx', 'bgm')
     * @returns {number} 音量 (0-1)
     */
    getVolume(type) {
        switch (type) {
            case 'master':
                return this.audioConfig.getMasterVolume();
            case 'sfx':
                return this.audioConfig.getSfxVolume();
            case 'bgm':
                return this.audioConfig.getBgmVolume();
            default:
                return 0;
        }
    }
    
    /**
     * ミュート切り替え
     * @returns {boolean} 新しいミュート状態
     */
    toggleMute() {
        const newMutedState = this.audioConfig.toggleMute();
        // 設定変更の監視により自動的に適用される
        return newMutedState;
    }
    
    /**
     * ミュート状態を設定
     * @param {boolean} muted - ミュート状態
     */
    setMuted(muted) {
        this.audioConfig.setMuted(muted);
        // 設定変更の監視により自動的に適用される
    }
    
    /**
     * AudioContextの再開（ユーザー操作後）
     */
    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('AudioContext resumed');
            } catch (error) {
                console.warn('Failed to resume AudioContext:', error);
            }
        }
    }
    
    /**
     * リソースの解放
     */
    dispose() {
        this.stopAllSounds();
        
        // 設定監視の解除
        if (this.configWatchers) {
            this.configWatchers.forEach(watchId => {
                this.configManager.unwatch(watchId);
            });
            this.configWatchers.clear();
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.soundBuffers.clear();
        this.activeSources.clear();
    }
    
    /**
     * 状態情報を取得
     */
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            isMuted: this.isMuted,
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            bgmVolume: this.bgmVolume,
            contextState: this.audioContext ? this.audioContext.state : 'none',
            activeSources: this.activeSources.size,
            soundBuffers: this.soundBuffers.size
        };
    }
}