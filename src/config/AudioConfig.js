/**
 * 音声設定クラス
 * 
 * 音量、音質、音響効果設定を統合し、
 * AudioManagerとの連携インターフェースを提供します。
 */

import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';

class AudioConfig {
    constructor() {
        this.configManager = getConfigurationManager();
        this._initialize();
    }

    /**
     * 初期化処理 - デフォルト設定の登録
     * @private
     */
    _initialize() {
        try {
            // 音量設定の初期化
            this._initializeVolumeConfig();
            
            // 音質設定の初期化
            this._initializeQualityConfig();
            
            // 音響効果設定の初期化
            this._initializeEffectConfig();
            
            // 検証ルールの設定
            this._setupValidationRules();
            
            console.log('[AudioConfig] 初期化完了');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'AudioConfig._initialize'
            });
        }
    }

    /**
     * 音量設定の初期化
     * @private
     */
    _initializeVolumeConfig() {
        // デフォルト音量設定
        this.configManager.set('audio', 'volumes.master', 0.7);
        this.configManager.set('audio', 'volumes.sfx', 0.8);
        this.configManager.set('audio', 'volumes.bgm', 0.5);
        this.configManager.set('audio', 'volumes.muted', false);
    }

    /**
     * 音質設定の初期化
     * @private
     */
    _initializeQualityConfig() {
        // デフォルト音質設定
        this.configManager.set('audio', 'quality.sampleRate', 44100);
        this.configManager.set('audio', 'quality.bufferSize', 4096);
        this.configManager.set('audio', 'quality.channels', 1);
        this.configManager.set('audio', 'quality.bitDepth', 16);
    }

    /**
     * 音響効果設定の初期化
     * @private
     */
    _initializeEffectConfig() {
        // デフォルト音響効果設定
        this.configManager.set('audio', 'effects.reverb', true);
        this.configManager.set('audio', 'effects.compression', true);
        
        // コンプレッサー設定
        this.configManager.set('audio', 'effects.compressor.threshold', -20);
        this.configManager.set('audio', 'effects.compressor.knee', 40);
        this.configManager.set('audio', 'effects.compressor.ratio', 12);
        this.configManager.set('audio', 'effects.compressor.attack', 0.003);
        this.configManager.set('audio', 'effects.compressor.release', 0.25);
        
        // リバーブ設定
        this.configManager.set('audio', 'effects.reverb.duration', 2.0);
        this.configManager.set('audio', 'effects.reverb.decay', 0.5);
        this.configManager.set('audio', 'effects.reverb.wet', 0.3);
        
        // イコライザー設定
        this.configManager.set('audio', 'effects.equalizer.enabled', false);
        this.configManager.set('audio', 'effects.equalizer.bands.bass', 0);
        this.configManager.set('audio', 'effects.equalizer.bands.lowMid', 0);
        this.configManager.set('audio', 'effects.equalizer.bands.mid', 0);
        this.configManager.set('audio', 'effects.equalizer.bands.highMid', 0);
        this.configManager.set('audio', 'effects.equalizer.bands.treble', 0);
    }

    /**
     * 検証ルールの設定
     * @private
     */
    _setupValidationRules() {
        // 音量設定の検証ルール
        this.configManager.setValidationRule('audio', 'volumes.master', {
            type: 'number',
            min: 0,
            max: 1
        });
        
        this.configManager.setValidationRule('audio', 'volumes.sfx', {
            type: 'number',
            min: 0,
            max: 1
        });
        
        this.configManager.setValidationRule('audio', 'volumes.bgm', {
            type: 'number',
            min: 0,
            max: 1
        });
        
        this.configManager.setValidationRule('audio', 'volumes.muted', {
            type: 'boolean'
        });
        
        // 音質設定の検証ルール
        this.configManager.setValidationRule('audio', 'quality.sampleRate', {
            type: 'number',
            validator: (value) => [8000, 11025, 22050, 44100, 48000, 96000].includes(value)
        });
        
        this.configManager.setValidationRule('audio', 'quality.bufferSize', {
            type: 'number',
            validator: (value) => [256, 512, 1024, 2048, 4096, 8192, 16384].includes(value)
        });
        
        // 音響効果設定の検証ルール
        this.configManager.setValidationRule('audio', 'effects.compressor.threshold', {
            type: 'number',
            min: -100,
            max: 0
        });
        
        this.configManager.setValidationRule('audio', 'effects.compressor.knee', {
            type: 'number',
            min: 0,
            max: 40
        });
        
        this.configManager.setValidationRule('audio', 'effects.compressor.ratio', {
            type: 'number',
            min: 1,
            max: 20
        });
        
        // イコライザー設定の検証ルール
        this.configManager.setValidationRule('audio', 'effects.equalizer.enabled', {
            type: 'boolean'
        });
        
        // 各バンドのゲイン検証ルール（-20dB to +20dB）
        const bandValidation = {
            type: 'number',
            min: -20,
            max: 20
        };
        
        this.configManager.setValidationRule('audio', 'effects.equalizer.bands.bass', bandValidation);
        this.configManager.setValidationRule('audio', 'effects.equalizer.bands.lowMid', bandValidation);
        this.configManager.setValidationRule('audio', 'effects.equalizer.bands.mid', bandValidation);
        this.configManager.setValidationRule('audio', 'effects.equalizer.bands.highMid', bandValidation);
        this.configManager.setValidationRule('audio', 'effects.equalizer.bands.treble', bandValidation);
    }

    /**
     * 音量設定を取得
     * @returns {Object} 音量設定
     */
    getVolumeConfig() {
        return {
            master: this.configManager.get('audio', 'volumes.master', 0.7),
            sfx: this.configManager.get('audio', 'volumes.sfx', 0.8),
            bgm: this.configManager.get('audio', 'volumes.bgm', 0.5),
            muted: this.configManager.get('audio', 'volumes.muted', false)
        };
    }

    /**
     * マスター音量を取得
     * @returns {number} マスター音量 (0-1)
     */
    getMasterVolume() {
        return this.configManager.get('audio', 'volumes.master', 0.7);
    }

    /**
     * SFX音量を取得
     * @returns {number} SFX音量 (0-1)
     */
    getSfxVolume() {
        return this.configManager.get('audio', 'volumes.sfx', 0.8);
    }

    /**
     * BGM音量を取得
     * @returns {number} BGM音量 (0-1)
     */
    getBgmVolume() {
        return this.configManager.get('audio', 'volumes.bgm', 0.5);
    }

    /**
     * ミュート状態を取得
     * @returns {boolean} ミュート状態
     */
    isMuted() {
        return this.configManager.get('audio', 'volumes.muted', false);
    }

    /**
     * マスター音量を設定
     * @param {number} volume - マスター音量 (0-1)
     * @returns {boolean} 設定成功フラグ
     */
    setMasterVolume(volume) {
        return this.configManager.set('audio', 'volumes.master', volume);
    }

    /**
     * SFX音量を設定
     * @param {number} volume - SFX音量 (0-1)
     * @returns {boolean} 設定成功フラグ
     */
    setSfxVolume(volume) {
        return this.configManager.set('audio', 'volumes.sfx', volume);
    }

    /**
     * BGM音量を設定
     * @param {number} volume - BGM音量 (0-1)
     * @returns {boolean} 設定成功フラグ
     */
    setBgmVolume(volume) {
        return this.configManager.set('audio', 'volumes.bgm', volume);
    }

    /**
     * ミュート状態を設定
     * @param {boolean} muted - ミュート状態
     * @returns {boolean} 設定成功フラグ
     */
    setMuted(muted) {
        return this.configManager.set('audio', 'volumes.muted', muted);
    }

    /**
     * ミュート状態を切り替え
     * @returns {boolean} 新しいミュート状態
     */
    toggleMute() {
        const currentState = this.isMuted();
        this.setMuted(!currentState);
        return !currentState;
    }

    /**
     * 音質設定を取得
     * @returns {Object} 音質設定
     */
    getQualityConfig() {
        return {
            sampleRate: this.configManager.get('audio', 'quality.sampleRate', 44100),
            bufferSize: this.configManager.get('audio', 'quality.bufferSize', 4096),
            channels: this.configManager.get('audio', 'quality.channels', 1),
            bitDepth: this.configManager.get('audio', 'quality.bitDepth', 16)
        };
    }

    /**
     * サンプルレートを取得
     * @returns {number} サンプルレート (Hz)
     */
    getSampleRate() {
        return this.configManager.get('audio', 'quality.sampleRate', 44100);
    }

    /**
     * バッファサイズを取得
     * @returns {number} バッファサイズ
     */
    getBufferSize() {
        return this.configManager.get('audio', 'quality.bufferSize', 4096);
    }

    /**
     * サンプルレートを設定
     * @param {number} sampleRate - サンプルレート (Hz)
     * @returns {boolean} 設定成功フラグ
     */
    setSampleRate(sampleRate) {
        return this.configManager.set('audio', 'quality.sampleRate', sampleRate);
    }

    /**
     * バッファサイズを設定
     * @param {number} bufferSize - バッファサイズ
     * @returns {boolean} 設定成功フラグ
     */
    setBufferSize(bufferSize) {
        return this.configManager.set('audio', 'quality.bufferSize', bufferSize);
    }

    /**
     * 音響効果設定を取得
     * @returns {Object} 音響効果設定
     */
    getEffectConfig() {
        return {
            reverb: this.configManager.get('audio', 'effects.reverb', true),
            compression: this.configManager.get('audio', 'effects.compression', true),
            compressor: {
                threshold: this.configManager.get('audio', 'effects.compressor.threshold', -20),
                knee: this.configManager.get('audio', 'effects.compressor.knee', 40),
                ratio: this.configManager.get('audio', 'effects.compressor.ratio', 12),
                attack: this.configManager.get('audio', 'effects.compressor.attack', 0.003),
                release: this.configManager.get('audio', 'effects.compressor.release', 0.25)
            },
            reverb: {
                duration: this.configManager.get('audio', 'effects.reverb.duration', 2.0),
                decay: this.configManager.get('audio', 'effects.reverb.decay', 0.5),
                wet: this.configManager.get('audio', 'effects.reverb.wet', 0.3)
            }
        };
    }

    /**
     * リバーブ効果の有効状態を取得
     * @returns {boolean} リバーブ効果の有効状態
     */
    isReverbEnabled() {
        return this.configManager.get('audio', 'effects.reverb', true);
    }

    /**
     * コンプレッション効果の有効状態を取得
     * @returns {boolean} コンプレッション効果の有効状態
     */
    isCompressionEnabled() {
        return this.configManager.get('audio', 'effects.compression', true);
    }

    /**
     * リバーブ効果の有効状態を設定
     * @param {boolean} enabled - 有効状態
     * @returns {boolean} 設定成功フラグ
     */
    setReverbEnabled(enabled) {
        return this.configManager.set('audio', 'effects.reverb', enabled);
    }

    /**
     * コンプレッション効果の有効状態を設定
     * @param {boolean} enabled - 有効状態
     * @returns {boolean} 設定成功フラグ
     */
    setCompressionEnabled(enabled) {
        return this.configManager.set('audio', 'effects.compression', enabled);
    }

    /**
     * コンプレッサー設定を取得
     * @returns {Object} コンプレッサー設定
     */
    getCompressorConfig() {
        return {
            threshold: this.configManager.get('audio', 'effects.compressor.threshold', -20),
            knee: this.configManager.get('audio', 'effects.compressor.knee', 40),
            ratio: this.configManager.get('audio', 'effects.compressor.ratio', 12),
            attack: this.configManager.get('audio', 'effects.compressor.attack', 0.003),
            release: this.configManager.get('audio', 'effects.compressor.release', 0.25)
        };
    }

    /**
     * リバーブ設定を取得
     * @returns {Object} リバーブ設定
     */
    getReverbConfig() {
        return {
            duration: this.configManager.get('audio', 'effects.reverb.duration', 2.0),
            decay: this.configManager.get('audio', 'effects.reverb.decay', 0.5),
            wet: this.configManager.get('audio', 'effects.reverb.wet', 0.3)
        };
    }

    /**
     * AudioManagerとの連携インターフェース
     * AudioManagerに現在の設定を適用する
     * @param {AudioManager} audioManager - AudioManagerインスタンス
     */
    applyToAudioManager(audioManager) {
        try {
            if (!audioManager) {
                throw new Error('AudioManagerが指定されていません');
            }
            
            // 音量設定の適用
            const volumeConfig = this.getVolumeConfig();
            audioManager.setVolume('master', volumeConfig.master);
            audioManager.setVolume('sfx', volumeConfig.sfx);
            audioManager.setVolume('bgm', volumeConfig.bgm);
            
            // ミュート状態の適用
            if (volumeConfig.muted !== audioManager.isMuted) {
                audioManager.toggleMute();
            }
            
            // 音響効果設定の適用は、AudioManagerの実装に依存するため
            // 必要に応じて拡張する
            
            console.log('[AudioConfig] AudioManagerに設定を適用しました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'AudioConfig.applyToAudioManager'
            });
        }
    }

    /**
     * AudioManagerから設定を同期
     * @param {AudioManager} audioManager - AudioManagerインスタンス
     */
    syncFromAudioManager(audioManager) {
        try {
            if (!audioManager) {
                throw new Error('AudioManagerが指定されていません');
            }
            
            // AudioManagerの状態を取得
            const status = audioManager.getStatus();
            
            // 音量設定の同期
            this.setMasterVolume(status.masterVolume);
            this.setSfxVolume(status.sfxVolume);
            this.setBgmVolume(status.bgmVolume);
            this.setMuted(status.isMuted);
            
            console.log('[AudioConfig] AudioManagerから設定を同期しました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'AudioConfig.syncFromAudioManager'
            });
        }
    }
}

// シングルトンインスタンス
let instance = null;

/**
 * AudioConfigのシングルトンインスタンスを取得
 * @returns {AudioConfig} インスタンス
 */
function getAudioConfig() {
    if (!instance) {
        instance = new AudioConfig();
    }
    return instance;
}

export {
    AudioConfig,
    getAudioConfig
};