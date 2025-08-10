/**
 * AudioContextManager.js
 * オーディオコンテキスト管理システム
 * SoundEffectSystemから分離されたオーディオコンテキスト管理機能
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { getConfigurationManager } from '../../core/ConfigurationManager.js';

export class AudioContextManager {
    constructor() {
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        
        // オーディオコンテキスト管理
        this.audioContext = null;
        this.audioWorklet = null;
        this.isInitialized = false;
        this.isSuspended = false;
        
        // オーディオノード管理
        this.masterGainNode = null;
        this.musicGainNode = null;
        this.sfxGainNode = null;
        this.analyser = null;
        this.compressor = null;
        
        // 設定
        this.contextConfig = {
            sampleRate: 44100,
            latencyHint: 'interactive', // 'balanced', 'interactive', 'playback'
            enableAnalyser: true,
            enableCompressor: true,
            enableWorklet: false,
            maxChannels: 32
        };
        
        // オーディオワークレット設定
        this.workletConfig = {
            enabled: false,
            processorName: 'sound-effect-processor',
            bufferSize: 256
        };
        
        // ブラウザ互換性チェック
        this.browserSupport = {
            audioContext: false,
            audioWorklet: false,
            mediaDevices: false,
            webAudio: false
        };
        
        // 状態管理
        this.contextState = 'created'; // 'created', 'running', 'suspended', 'closed'
        this.initializationPromise = null;
        
        this.checkBrowserSupport();
    }
    
    /**
     * ブラウザサポートをチェック
     */
    checkBrowserSupport() {
        try {
            // AudioContext サポート
            this.browserSupport.audioContext = !!(window.AudioContext || window.webkitAudioContext);
            
            // AudioWorklet サポート
            this.browserSupport.audioWorklet = !!(window.AudioContext && AudioContext.prototype.audioWorklet);
            // 修正箇所: インスタンスを作成してからプロパティをチェック
            if (this.browserSupport.audioContext) {
                const tempAudioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.browserSupport.audioWorklet = !!tempAudioContext.audioWorklet;
                tempAudioContext.close(); // インスタンスを閉じる
            } else {
                this.browserSupport.audioWorklet = false;
            }
            
            // MediaDevices サポート
            this.browserSupport.mediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
            
            // WebAudio API サポート
            this.browserSupport.webAudio = this.browserSupport.audioContext;
            
            console.log('[AudioContextManager] Browser support:', this.browserSupport);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioContextManager.checkBrowserSupport');
        }
    }
    
    /**
     * オーディオコンテキストを初期化
     */
    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        this.initializationPromise = this._doInitialize();
        return this.initializationPromise;
    }
    
    /**
     * 初期化の実装
     */
    async _doInitialize() {
        try {
            if (!this.browserSupport.audioContext) {
                console.warn('[AudioContextManager] AudioContext is not supported in this browser - audio context manager disabled');
                this.disabled = true;
                this.isInitialized = false;
                this.contextState = 'unavailable';
                return false;
            }
            
            // AudioContext を作成
            await this.createAudioContext();
            
            // オーディオノードを設定
            this.setupAudioNodes();
            
            // オーディオワークレットを設定（オプション）
            if (this.workletConfig.enabled && this.browserSupport.audioWorklet) {
                await this.setupAudioWorklet();
            }
            
            // イベントリスナーを設定
            this.setupEventListeners();
            
            this.isInitialized = true;
            this.contextState = 'running';
            
            console.log('[AudioContextManager] Audio context initialized successfully');
            console.log(`[AudioContextManager] Sample rate: ${this.audioContext.sampleRate}Hz, State: ${this.audioContext.state}`);
            
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioContextManager._doInitialize');
            this.isInitialized = false;
            throw error;
        }
    }
    
    /**
     * AudioContext を作成
     */
    async createAudioContext() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        
        const contextOptions = {
            sampleRate: this.contextConfig.sampleRate,
            latencyHint: this.contextConfig.latencyHint
        };
        
        this.audioContext = new AudioContextClass(contextOptions);
        
        // コンテキストが一時停止状態の場合は再開
        if (this.audioContext.state === 'suspended') {
            await this.resume();
        }
        
        console.log(`[AudioContextManager] AudioContext created with sample rate: ${this.audioContext.sampleRate}Hz`);
    }
    
    /**
     * オーディオノードを設定
     */
    setupAudioNodes() {
        if (this.disabled || !this.audioContext) {
            console.warn('[AudioContextManager] Audio context manager is disabled or context unavailable - setupAudioNodes skipped');
            return;
        }
        
        try {
            // マスターゲインノード
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.value = 1.0;
            this.masterGainNode.connect(this.audioContext.destination);
            
            // 音楽用ゲインノード
            this.musicGainNode = this.audioContext.createGain();
            this.musicGainNode.gain.value = 0.7;
            
            // 効果音用ゲインノード
            this.sfxGainNode = this.audioContext.createGain();
            this.sfxGainNode.gain.value = 0.8;
            
            // コンプレッサー（オプション）
            if (this.contextConfig.enableCompressor) {
                this.compressor = this.audioContext.createDynamicsCompressor();
                this.compressor.threshold.value = -24;
                this.compressor.knee.value = 30;
                this.compressor.ratio.value = 12;
                this.compressor.attack.value = 0.003;
                this.compressor.release.value = 0.25;
                
                // ルーティング: 各ゲインノード → コンプレッサー → マスター
                this.musicGainNode.connect(this.compressor);
                this.sfxGainNode.connect(this.compressor);
                this.compressor.connect(this.masterGainNode);
            } else {
                // 直接接続
                this.musicGainNode.connect(this.masterGainNode);
                this.sfxGainNode.connect(this.masterGainNode);
            }
            
            // アナライザー（オプション）
            if (this.contextConfig.enableAnalyser) {
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 2048;
                this.analyser.smoothingTimeConstant = 0.8;
                
                // マスターゲインノードをアナライザーにも接続
                this.masterGainNode.connect(this.analyser);
            }
            
            console.log('[AudioContextManager] Audio nodes setup completed');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioContextManager.setupAudioNodes');
        }
    }
    
    /**
     * オーディオワークレットを設定
     */
    async setupAudioWorklet() {
        try {
            if (!this.audioContext.audioWorklet) {
                console.warn('[AudioContextManager] AudioWorklet not supported');
                return;
            }
            
            // ワークレットプロセッサーを登録
            await this.audioContext.audioWorklet.addModule('/src/audio/worklets/sound-effect-processor.js');
            
            // ワークレットノードを作成
            this.audioWorklet = new AudioWorkletNode(this.audioContext, this.workletConfig.processorName, {
                numberOfInputs: 1,
                numberOfOutputs: 1,
                channelCount: 2,
                processorOptions: {
                    bufferSize: this.workletConfig.bufferSize
                }
            });
            
            // ワークレットを音声チェーンに接続
            this.sfxGainNode.disconnect();
            this.sfxGainNode.connect(this.audioWorklet);
            
            if (this.compressor) {
                this.audioWorklet.connect(this.compressor);
            } else {
                this.audioWorklet.connect(this.masterGainNode);
            }
            
            console.log('[AudioContextManager] AudioWorklet setup completed');
            
        } catch (error) {
            console.warn('[AudioContextManager] AudioWorklet setup failed:', error);
            // フォールバック: 通常の接続を維持
            this.workletConfig.enabled = false;
        }
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        try {
            // AudioContext 状態変化を監視
            this.audioContext.addEventListener('statechange', () => {
                this.contextState = this.audioContext.state;
                console.log(`[AudioContextManager] AudioContext state changed to: ${this.contextState}`);
                
                if (this.contextState === 'suspended') {
                    this.isSuspended = true;
                } else if (this.contextState === 'running') {
                    this.isSuspended = false;
                }
            });
            
            // ページの可視性変化を監視
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.handlePageHidden();
                } else {
                    this.handlePageVisible();
                }
            });
            
            // ウィンドウフォーカス変化を監視
            window.addEventListener('blur', () => {
                this.handleWindowBlur();
            });
            
            window.addEventListener('focus', () => {
                this.handleWindowFocus();
            });
            
            console.log('[AudioContextManager] Event listeners setup completed');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioContextManager.setupEventListeners');
        }
    }
    
    /**
     * オーディオコンテキストを再開
     */
    async resume() {
        try {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                this.isSuspended = false;
                console.log('[AudioContextManager] AudioContext resumed');
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioContextManager.resume');
        }
    }
    
    /**
     * オーディオコンテキストを一時停止
     */
    async suspend() {
        try {
            if (this.audioContext && this.audioContext.state === 'running') {
                await this.audioContext.suspend();
                this.isSuspended = true;
                console.log('[AudioContextManager] AudioContext suspended');
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioContextManager.suspend');
        }
    }
    
    /**
     * ページが非表示になった時の処理
     */
    async handlePageHidden() {
        console.log('[AudioContextManager] Page hidden - suspending audio context');
        await this.suspend();
    }
    
    /**
     * ページが表示された時の処理
     */
    async handlePageVisible() {
        console.log('[AudioContextManager] Page visible - resuming audio context');
        await this.resume();
    }
    
    /**
     * ウィンドウがフォーカスを失った時の処理
     */
    handleWindowBlur() {
        // 必要に応じて音量を下げる
        if (this.masterGainNode) {
            this.masterGainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        }
    }
    
    /**
     * ウィンドウがフォーカスを得た時の処理
     */
    handleWindowFocus() {
        // 音量を元に戻す
        if (this.masterGainNode) {
            this.masterGainNode.gain.linearRampToValueAtTime(1.0, this.audioContext.currentTime + 0.1);
        }
    }
    
    /**
     * 音量を設定
     */
    setVolume(type, volume) {
        if (this.disabled) {
            console.warn('[AudioContextManager] Audio context manager is disabled - setVolume ignored');
            return;
        }
        
        const clampedVolume = Math.max(0, Math.min(1, volume));
        
        try {
            switch (type) {
                case 'master':
                    if (this.masterGainNode) {
                        this.masterGainNode.gain.value = clampedVolume;
                    }
                    break;
                    
                case 'music':
                    if (this.musicGainNode) {
                        this.musicGainNode.gain.value = clampedVolume;
                    }
                    break;
                    
                case 'sfx':
                    if (this.sfxGainNode) {
                        this.sfxGainNode.gain.value = clampedVolume;
                    }
                    break;
                    
                default:
                    console.warn(`[AudioContextManager] Unknown volume type: ${type}`);
            }
            
            console.log(`[AudioContextManager] ${type} volume set to: ${clampedVolume}`);
            
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioContextManager.setVolume');
        }
    }
    
    /**
     * 音量を取得
     */
    getVolume(type) {
        if (this.disabled) {
            console.warn('[AudioContextManager] Audio context manager is disabled - getVolume returning 0');
            return 0;
        }
        
        try {
            switch (type) {
                case 'master':
                    return this.masterGainNode?.gain.value || 0;
                case 'music':
                    return this.musicGainNode?.gain.value || 0;
                case 'sfx':
                    return this.sfxGainNode?.gain.value || 0;
                default:
                    console.warn(`[AudioContextManager] Unknown volume type: ${type}`);
                    return 0;
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioContextManager.getVolume');
            return 0;
        }
    }
    
    /**
     * オーディオ分析データを取得
     */
    getAnalyserData() {
        if (this.disabled) {
            console.warn('[AudioContextManager] Audio context manager is disabled - getAnalyserData returning null');
            return null;
        }
        
        if (!this.analyser) {
            return null;
        }
        
        try {
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            this.analyser.getByteFrequencyData(dataArray);
            
            return {
                frequencyData: dataArray,
                bufferLength: bufferLength,
                sampleRate: this.audioContext.sampleRate
            };
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioContextManager.getAnalyserData');
            return null;
        }
    }
    
    /**
     * コンテキストの統計情報を取得
     */
    getContextStatistics() {
        return {
            isInitialized: this.isInitialized,
            contextState: this.contextState,
            isSuspended: this.isSuspended,
            sampleRate: this.audioContext?.sampleRate || 0,
            currentTime: this.audioContext?.currentTime || 0,
            browserSupport: this.browserSupport,
            volumes: {
                master: this.getVolume('master'),
                music: this.getVolume('music'),
                sfx: this.getVolume('sfx')
            },
            workletEnabled: this.workletConfig.enabled,
            analyserEnabled: this.contextConfig.enableAnalyser,
            compressorEnabled: this.contextConfig.enableCompressor
        };
    }
    
    /**
     * オーディオコンテキストが利用可能かチェック
     */
    isAvailable() {
        return this.isInitialized && 
               this.audioContext && 
               this.audioContext.state !== 'closed' &&
               this.browserSupport.audioContext;
    }
    
    /**
     * 設定を更新
     */
    updateConfig(newConfig) {
        Object.assign(this.contextConfig, newConfig);
        console.log('[AudioContextManager] Configuration updated:', newConfig);
    }
    
    /**
     * オーディオコンテキストマネージャーを破棄
     */
    async dispose() {
        try {
            console.log('[AudioContextManager] Disposing audio context manager...');
            
            // オーディオワークレットを停止
            if (this.audioWorklet) {
                this.audioWorklet.disconnect();
                this.audioWorklet = null;
            }
            
            // オーディオノードを切断
            if (this.masterGainNode) {
                this.masterGainNode.disconnect();
            }
            if (this.musicGainNode) {
                this.musicGainNode.disconnect();
            }
            if (this.sfxGainNode) {
                this.sfxGainNode.disconnect();
            }
            if (this.analyser) {
                this.analyser.disconnect();
            }
            if (this.compressor) {
                this.compressor.disconnect();
            }
            
            // AudioContext を閉じる
            if (this.audioContext && this.audioContext.state !== 'closed') {
                await this.audioContext.close();
            }
            
            // 状態をリセット
            this.isInitialized = false;
            this.contextState = 'closed';
            this.audioContext = null;
            this.masterGainNode = null;
            this.musicGainNode = null;
            this.sfxGainNode = null;
            this.analyser = null;
            this.compressor = null;
            
            console.log('[AudioContextManager] Audio context manager disposed');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioContextManager.dispose');
        }
    }
}
