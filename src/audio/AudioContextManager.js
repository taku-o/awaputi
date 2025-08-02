/**
 * AudioContextManager.js
 * Web Audio APIコンテキスト・ノード管理クラス
 * AudioContextの初期化、ゲインノード管理、エフェクト管理を担当
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * AudioContext・ノード管理クラス
 */
export class AudioContextManager {
    constructor() {
        // Audio Context
        this.audioContext = null;
        
        // Main Nodes
        this.masterGainNode = null;
        this.sfxGainNode = null;
        this.bgmGainNode = null;
        
        // Effect Nodes
        this.compressor = null;
        this.reverbConvolver = null;
        this.reverbBuffer = null;
        
        // Status
        this.isInitialized = false;
        this.isEnabled = true;
        
        // Audio Configuration (注入される)
        this.audioConfig = null;
    }

    /**
     * Audio Configuration設定
     * @param {Object} audioConfig - 音響設定オブジェクト
     */
    setAudioConfig(audioConfig) {
        this.audioConfig = audioConfig;
    }

    /**
     * AudioContextの初期化
     * @returns {Promise<boolean>} 初期化成功フラグ
     */
    async initializeAudioContext() {
        try {
            // Web Audio API対応確認
            if (!window.AudioContext && !window.webkitAudioContext) {
                throw new Error('Web Audio API is not supported');
            }
            
            // AudioContext作成
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // AudioContextの状態を確認
            if (this.audioContext.state === 'suspended') {
                console.warn('AudioContext is suspended, will need user interaction to resume');
            }
            
            // 基本ノード作成
            this.createAudioNodes();
            
            // オーディオグラフの構築
            this.setupAudioGraph();
            
            // リバーブエフェクトの初期化
            await this.initializeReverb();
            
            this.isInitialized = true;
            console.log('AudioContextManager initialized successfully');
            
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', { 
                component: 'AudioContextManager',
                operation: 'initializeAudioContext',
                userAgent: navigator.userAgent,
                audioContextSupport: !!(window.AudioContext || window.webkitAudioContext)
            });
            this.isEnabled = false;
            return false;
        }
    }

    /**
     * 基本オーディオノードの作成
     */
    createAudioNodes() {
        if (!this.audioContext) {
            throw new Error('AudioContext not initialized');
        }

        // マスターゲインノード
        this.masterGainNode = this.audioContext.createGain();
        this.masterGainNode.gain.value = 0.8; // デフォルト音量
        this.masterGainNode.connect(this.audioContext.destination);

        // コンプレッサー（音量の均一化）
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.setupCompressor();

        // SFXゲインノード
        this.sfxGainNode = this.audioContext.createGain();
        this.sfxGainNode.gain.value = 0.7; // デフォルトSFX音量

        // BGMゲインノード
        this.bgmGainNode = this.audioContext.createGain();
        this.bgmGainNode.gain.value = 0.5; // デフォルトBGM音量
    }

    /**
     * コンプレッサーの設定
     */
    setupCompressor() {
        if (!this.compressor) return;

        const compressorConfig = this.getCompressorConfig();
        
        this.compressor.threshold.value = compressorConfig.threshold;
        this.compressor.knee.value = compressorConfig.knee;
        this.compressor.ratio.value = compressorConfig.ratio;
        this.compressor.attack.value = compressorConfig.attack;
        this.compressor.release.value = compressorConfig.release;
    }

    /**
     * コンプレッサー設定取得
     * @returns {Object} コンプレッサー設定
     */
    getCompressorConfig() {
        if (this.audioConfig && this.audioConfig.getCompressorConfig) {
            return this.audioConfig.getCompressorConfig();
        }
        
        // デフォルト設定
        return {
            threshold: -24,
            knee: 30,
            ratio: 12,
            attack: 0.003,
            release: 0.25
        };
    }

    /**
     * リバーブ設定取得
     * @returns {Object} リバーブ設定
     */
    getReverbConfig() {
        if (this.audioConfig && this.audioConfig.getReverbConfig) {
            return this.audioConfig.getReverbConfig();
        }
        
        // デフォルト設定
        return {
            duration: 2,
            decay: 2
        };
    }

    /**
     * オーディオグラフの構築
     */
    setupAudioGraph() {
        if (!this.masterGainNode || !this.compressor || !this.sfxGainNode || !this.bgmGainNode) {
            throw new Error('Audio nodes not created');
        }

        // コンプレッサーの接続（設定に基づく）
        if (this.isCompressionEnabled()) {
            this.compressor.connect(this.masterGainNode);
        } else {
            this.bypassCompressor();
        }

        // ゲインノードをコンプレッサーに接続
        this.sfxGainNode.connect(this.compressor);
        this.bgmGainNode.connect(this.compressor);
    }

    /**
     * リバーブエフェクトの初期化
     */
    async initializeReverb() {
        try {
            if (!this.audioContext) return;
            
            const reverbConfig = this.getReverbConfig();
            
            this.reverbConvolver = this.audioContext.createConvolver();
            this.reverbBuffer = this.createReverbBuffer(
                2, 
                this.audioContext.sampleRate * reverbConfig.duration, 
                this.audioContext.sampleRate,
                reverbConfig.decay
            );
            this.reverbConvolver.buffer = this.reverbBuffer;
            
            // リバーブの接続（設定に基づく）
            if (this.isReverbEnabled()) {
                this.reverbConvolver.connect(this.compressor);
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', { 
                component: 'AudioContextManager',
                operation: 'initializeReverb'
            });
            // リバーブなしで続行
        }
    }

    /**
     * リバーブバッファの作成
     * @param {number} channels - チャンネル数
     * @param {number} length - バッファ長
     * @param {number} sampleRate - サンプルレート
     * @param {number} decay - 減衰率
     * @returns {AudioBuffer} リバーブバッファ
     */
    createReverbBuffer(channels, length, sampleRate, decay) {
        const buffer = this.audioContext.createBuffer(channels, length, sampleRate);
        
        for (let channel = 0; channel < channels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const sample = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
                channelData[i] = sample;
            }
        }
        
        return buffer;
    }

    /**
     * コンプレッサーを再接続
     */
    reconnectCompressor() {
        if (!this.compressor || !this.masterGainNode) return;
        
        try {
            this.compressor.disconnect();
            this.compressor.connect(this.masterGainNode);
            this.setupCompressor();
        } catch (error) {
            console.warn('Failed to reconnect compressor:', error);
        }
    }

    /**
     * コンプレッサーをバイパス
     */
    bypassCompressor() {
        if (!this.compressor) return;
        
        try {
            this.compressor.disconnect();
            this.compressor.connect(this.masterGainNode);
            this.compressor.threshold.value = -100; // 実質的に無効化
        } catch (error) {
            console.warn('Failed to bypass compressor:', error);
        }
    }

    /**
     * リバーブを再接続
     */
    reconnectReverb() {
        if (!this.reverbConvolver || !this.compressor) return;
        
        try {
            this.reverbConvolver.disconnect();
            this.reverbConvolver.connect(this.compressor);
        } catch (error) {
            console.warn('Failed to reconnect reverb:', error);
        }
    }

    /**
     * リバーブをバイパス
     */
    bypassReverb() {
        if (!this.reverbConvolver) return;
        
        try {
            this.reverbConvolver.disconnect();
        } catch (error) {
            console.warn('Failed to bypass reverb:', error);
        }
    }

    /**
     * AudioContextを再開
     * @returns {Promise<void>}
     */
    async resumeAudioContext() {
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
     * ゲインノードの音量設定
     * @param {string} type - ノードタイプ ('master', 'sfx', 'bgm')
     * @param {number} volume - 音量 (0.0-1.0)
     */
    setGainNodeVolume(type, volume) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        
        switch (type) {
            case 'master':
                if (this.masterGainNode) {
                    this.masterGainNode.gain.value = clampedVolume;
                }
                break;
            case 'sfx':
                if (this.sfxGainNode) {
                    this.sfxGainNode.gain.value = clampedVolume;
                }
                break;
            case 'bgm':
                if (this.bgmGainNode) {
                    this.bgmGainNode.gain.value = clampedVolume;
                }
                break;
        }
    }

    /**
     * ゲインノードの音量取得
     * @param {string} type - ノードタイプ
     * @returns {number} 音量
     */
    getGainNodeVolume(type) {
        switch (type) {
            case 'master':
                return this.masterGainNode ? this.masterGainNode.gain.value : 0;
            case 'sfx':
                return this.sfxGainNode ? this.sfxGainNode.gain.value : 0;
            case 'bgm':
                return this.bgmGainNode ? this.bgmGainNode.gain.value : 0;
            default:
                return 0;
        }
    }

    /**
     * コンプレッション有効確認
     * @returns {boolean} 有効フラグ
     */
    isCompressionEnabled() {
        if (this.audioConfig && this.audioConfig.isCompressionEnabled) {
            return this.audioConfig.isCompressionEnabled();
        }
        return true; // デフォルト有効
    }

    /**
     * リバーブ有効確認
     * @returns {boolean} 有効フラグ
     */
    isReverbEnabled() {
        if (this.audioConfig && this.audioConfig.isReverbEnabled) {
            return this.audioConfig.isReverbEnabled();
        }
        return false; // デフォルト無効
    }

    /**
     * AudioContextの状態取得
     * @returns {Object} コンテキスト状態
     */
    getContextStatus() {
        return {
            isInitialized: this.isInitialized,
            isEnabled: this.isEnabled,
            contextState: this.audioContext ? this.audioContext.state : 'not-created',
            sampleRate: this.audioContext ? this.audioContext.sampleRate : 0,
            currentTime: this.audioContext ? this.audioContext.currentTime : 0,
            volumes: {
                master: this.getGainNodeVolume('master'),
                sfx: this.getGainNodeVolume('sfx'),
                bgm: this.getGainNodeVolume('bgm')
            },
            effects: {
                compression: this.isCompressionEnabled(),
                reverb: this.isReverbEnabled()
            }
        };
    }

    /**
     * リソースのクリーンアップ
     */
    dispose() {
        try {
            // ノードの切断
            if (this.reverbConvolver) {
                this.reverbConvolver.disconnect();
                this.reverbConvolver = null;
            }
            
            if (this.compressor) {
                this.compressor.disconnect();
                this.compressor = null;
            }
            
            if (this.sfxGainNode) {
                this.sfxGainNode.disconnect();
                this.sfxGainNode = null;
            }
            
            if (this.bgmGainNode) {
                this.bgmGainNode.disconnect();
                this.bgmGainNode = null;
            }
            
            if (this.masterGainNode) {
                this.masterGainNode.disconnect();
                this.masterGainNode = null;
            }
            
            // AudioContextのクローズ
            if (this.audioContext) {
                this.audioContext.close();
                this.audioContext = null;
            }
            
            this.isInitialized = false;
            
        } catch (error) {
            console.warn('Error disposing AudioContextManager:', error);
        }
    }

    // ゲッター
    getAudioContext() {
        return this.audioContext;
    }

    getMasterGainNode() {
        return this.masterGainNode;
    }

    getSfxGainNode() {
        return this.sfxGainNode;
    }

    getBgmGainNode() {
        return this.bgmGainNode;
    }

    getCompressor() {
        return this.compressor;
    }

    getReverbConvolver() {
        return this.reverbConvolver;
    }
}

// シングルトンインスタンス管理
let audioContextManagerInstance = null;

/**
 * AudioContextManagerのシングルトンインスタンスを取得
 * @returns {AudioContextManager} シングルトンインスタンス
 */
export function getAudioContextManager() {
    if (!audioContextManagerInstance) {
        audioContextManagerInstance = new AudioContextManager();
    }
    return audioContextManagerInstance;
}

/**
 * AudioContextManagerのシングルトンインスタンスを再初期化
 * @returns {AudioContextManager} 新しいシングルトンインスタンス
 */
export function reinitializeAudioContextManager() {
    if (audioContextManagerInstance) {
        audioContextManagerInstance.dispose();
    }
    audioContextManagerInstance = new AudioContextManager();
    return audioContextManagerInstance;
}

export default AudioContextManager;