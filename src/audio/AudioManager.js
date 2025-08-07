/**
 * AudioManager.js (リファクタリング版)
 * 音響管理の中央コーディネータークラス
 * 分割されたコンポーネントを統合し、統一されたAPIを提供
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getAudioContextManager } from './AudioContextManager.js';
import { getProceduralSoundGenerator } from './ProceduralSoundGenerator.js';
import { getAudioPlaybackController } from './AudioPlaybackController.js';
import { getAudioConfigurationManager } from './AudioConfigurationManager.js';
import { getAudioSubsystemCoordinator } from './AudioSubsystemCoordinator.js';

/**
 * 音響管理クラス（リファクタリング版）
 */
export class AudioManager {
    constructor(configManager, audioConfig) {
        this.configManager = configManager;
        this.audioConfig = audioConfig;
        
        // 分割されたコンポーネントを初期化
        this.contextManager = getAudioContextManager();
        this.soundGenerator = getProceduralSoundGenerator();
        this.playbackController = getAudioPlaybackController();
        this.configurationManager = getAudioConfigurationManager();
        this.subsystemCoordinator = getAudioSubsystemCoordinator();
        
        // 初期化状態
        this.isInitialized = false;
        this.isEnabled = true;
        
        // 設定値（キャッシュ）
        this.masterVolume = 0.8;
        this.sfxVolume = 0.7;
        this.bgmVolume = 0.5;
        this.isMuted = false;
        
        // 従来のプロパティとの互換性維持
        this.audioContext = null;
        this.masterGainNode = null;
        this.sfxGainNode = null;
        this.bgmGainNode = null;
        this.soundBuffers = new Map();
        this.activeSources = new Set();
        
        // 外部システムとの統合（遅延読み込み）
        this.bgmSystem = null;
        this.soundEffectSystem = null;
        this.audioController = null;
        this.audioVisualizer = null;
        this.accessibilitySupport = null;
    }

    /**
     * 初期化
     * @returns {Promise<boolean>} 初期化成功フラグ
     */
    async initialize() {
        try {
            if (this.isInitialized) {
                console.warn('AudioManager already initialized');
                return true;
            }

            console.log('Initializing AudioManager (refactored version)...');
            
            // AudioConfiguration設定
            this.contextManager.setAudioConfig(this.audioConfig);
            this.configurationManager.setDependencies(this.configManager, this.audioConfig);
            
            // AudioContextの初期化
            const contextInitialized = await this.contextManager.initializeAudioContext();
            if (!contextInitialized) {
                throw new Error('Failed to initialize AudioContext');
            }
            
            // ノード参照を取得（互換性のため）
            this.audioContext = this.contextManager.getAudioContext();
            this.masterGainNode = this.contextManager.getMasterGainNode();
            this.sfxGainNode = this.contextManager.getSfxGainNode();
            this.bgmGainNode = this.contextManager.getBgmGainNode();
            
            // 音響生成設定
            this.soundGenerator.setAudioContext(this.audioContext);
            
            // 音響再生制御設定
            this.playbackController.setDependencies(
                this.audioContext,
                this.sfxGainNode,
                this.masterGainNode,
                this.soundBuffers
            );
            
            // 設定管理システム設定
            this.configurationManager.setDependencies(
                this.configManager,
                this.audioConfig,
                {
                    masterGainNode: this.masterGainNode,
                    sfxGainNode: this.sfxGainNode,
                    bgmGainNode: this.bgmGainNode,
                    compressor: this.contextManager.getCompressor(),
                    reverbConvolver: this.contextManager.getReverbConvolver()
                }
            );
            
            // サブシステムコーディネーター設定
            this.subsystemCoordinator.setAudioManager(this);
            
            // プロシージャル音響の生成
            const soundsGenerated = await this.soundGenerator.generateAllSounds();
            if (soundsGenerated) {
                // 生成された音響バッファを再生コントローラーに設定
                this.soundBuffers = this.soundGenerator.soundBuffers;
                this.playbackController.setDependencies(
                    this.audioContext,
                    this.sfxGainNode,
                    this.masterGainNode,
                    this.soundBuffers
                );
            }
            
            // 設定監視の開始
            this.configurationManager.setupConfigWatchers();
            
            // サブシステムの初期化
            await this.subsystemCoordinator.initializeSubsystems();
            
            // サブシステム参照の設定（互換性のため）
            this.bgmSystem = this.subsystemCoordinator.bgmSystem;
            this.soundEffectSystem = this.subsystemCoordinator.soundEffectSystem;
            this.audioController = this.subsystemCoordinator.audioController;
            this.audioVisualizer = this.subsystemCoordinator.audioVisualizer;
            this.accessibilitySupport = this.subsystemCoordinator.accessibilitySupport;
            
            // 設定値の同期
            this.configurationManager.syncWithConfig();
            
            this.isInitialized = true;
            console.log('AudioManager initialized successfully (refactored)');
            
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', { 
                component: 'AudioManager',
                operation: 'initialize',
                userAgent: navigator.userAgent,
                audioContextSupport: !!(window.AudioContext || window.webkitAudioContext)
            });
            this.isEnabled = false;
            return false;
        }
    }

    // ========== 音響再生API（委譲パターン） ==========

    /**
     * 音響を再生
     * @param {string} soundName - 音響名
     * @param {Object} options - 再生オプション
     * @returns {AudioBufferSourceNode|null} 音源ノード
     */
    playSound(soundName, options = {}) {
        if (!this.isEnabled || this.isMuted) return null;
        return this.playbackController.playSound(soundName, options);
    }

    /**
     * 泡破壊音を再生
     * @param {string} bubbleType - 泡タイプ
     * @param {number} comboLevel - コンボレベル
     * @param {Object} options - 再生オプション
     * @returns {AudioBufferSourceNode|null} 音源ノード
     */
    playBubbleSound(bubbleType, comboLevel = 0, options = {}) {
        if (this.soundEffectSystem) {
            return this.soundEffectSystem.playBubbleSound(bubbleType, comboLevel, options);
        }
        // フォールバック
        return this.playbackController.playBubbleSound(bubbleType, comboLevel, options);
    }

    /**
     * UI音を再生
     * @param {string} actionType - アクションタイプ
     * @param {Object} options - 再生オプション
     * @returns {AudioBufferSourceNode|null} 音源ノード
     */
    playUISound(actionType, options = {}) {
        if (this.soundEffectSystem) {
            return this.soundEffectSystem.playUISound(actionType, options);
        }
        // フォールバック
        return this.playbackController.playUISound(actionType, options);
    }

    /**
     * コンボ音を再生
     * @param {number} comboLevel - コンボレベル
     * @param {Object} options - 再生オプション
     * @returns {AudioBufferSourceNode|null} 音源ノード
     */
    playComboSound(comboLevel, options = {}) {
        if (this.soundEffectSystem) {
            return this.soundEffectSystem.playComboSound(comboLevel, options);
        }
        // フォールバック
        return this.playbackController.playComboSound(comboLevel, options);
    }

    /**
     * 実績解除音を再生
     * @param {string} rarity - レアリティ
     * @param {Object} options - 再生オプション
     * @returns {AudioBufferSourceNode|null} 音源ノード
     */
    playAchievementSound(rarity, options = {}) {
        if (this.soundEffectSystem) {
            return this.soundEffectSystem.playAchievementSound(rarity, options);
        }
        // フォールバック
        return this.playbackController.playAchievementSound(rarity, options);
    }

    /**
     * ゲーム状態音を再生
     * @param {string} stateType - 状態タイプ
     * @param {Object} options - 再生オプション
     * @returns {AudioBufferSourceNode|null} 音源ノード
     */
    playGameStateSound(stateType, options = {}) {
        if (this.soundEffectSystem) {
            return this.soundEffectSystem.playGameStateSound(stateType, options);
        }
        // フォールバック
        return this.playbackController.playGameStateSound(stateType, options);
    }

    /**
     * ボーナス効果音を再生
     * Issue #106: テスト互換性のため追加
     */
    playBonusSound() {
        return this.playGameStateSound('bonus');
    }

    /**
     * 時間停止効果音を再生
     * Issue #106: テスト互換性のため追加
     */
    playTimeStopSound() {
        return this.playGameStateSound('timeStop');
    }

    /**
     * 電気効果音を再生
     * Issue #106: テスト互換性のため追加
     */
    playElectricSound() {
        return this.playGameStateSound('electric');
    }

    /**
     * 泡破壊音を再生
     * Issue #106: テスト互換性のため追加
     */
    playPopSound() {
        return this.playBubbleSound('pop');
    }

    /**
     * 全音響停止
     */
    stopAllSounds() {
        this.playbackController.stopAllSounds();
        // アクティブソースも更新（互換性のため）
        this.activeSources.clear();
    }

    // ========== 設定管理API（委譲パターン） ==========

    /**
     * 音量設定
     * @param {string} type - 音量タイプ ('master', 'sfx', 'bgm')
     * @param {number} volume - 音量 (0-1)
     */
    setVolume(type, volume) {
        this.configurationManager.setVolume(type, volume);
        
        // ローカルキャッシュ更新（互換性のため）
        switch (type) {
            case 'master': this.masterVolume = volume; break;
            case 'sfx': this.sfxVolume = volume; break;
            case 'bgm': this.bgmVolume = volume; break;
        }
    }

    /**
     * 音量取得
     * @param {string} type - 音量タイプ ('master', 'sfx', 'bgm')
     * @returns {number} 音量 (0-1)
     */
    getVolume(type) {
        return this.configurationManager.getVolume(type);
    }

    /**
     * ミュート切り替え
     * @returns {boolean} 新しいミュート状態
     */
    toggleMute() {
        const newMutedState = this.configurationManager.toggleMute();
        this.isMuted = newMutedState; // ローカルキャッシュ更新
        
        if (this.isMuted) {
            this.stopAllSounds();
        }
        
        return newMutedState;
    }

    /**
     * ミュート状態設定
     * @param {boolean} muted - ミュート状態
     */
    setMuted(muted) {
        this.configurationManager.setMuted(muted);
        this.isMuted = muted; // ローカルキャッシュ更新
        
        if (this.isMuted) {
            this.stopAllSounds();
        }
    }

    /**
     * オーディオエフェクト設定
     * @param {string} effectType - エフェクトタイプ
     * @param {boolean} enabled - 有効フラグ
     */
    setAudioEffect(effectType, enabled) {
        this.configurationManager.setAudioEffect(effectType, enabled);
    }

    /**
     * 品質設定更新
     * @param {Object} qualityConfig - 品質設定
     */
    updateQualitySettings(qualityConfig) {
        this.configurationManager.updateQualitySettings(qualityConfig);
    }

    // ========== シーン管理API（委譲パターン） ==========

    /**
     * シーン変更処理
     * @param {string} sceneName - シーン名
     * @param {Object} options - シーンオプション
     * @returns {Promise<boolean>} 処理成功フラグ
     */
    async onSceneChange(sceneName, options = {}) {
        return await this.subsystemCoordinator.onSceneChange(sceneName, options);
    }

    // ========== AudioContextコントロール ==========

    /**
     * AudioContextの再開
     */
    async resumeContext() {
        await this.contextManager.resumeAudioContext();
    }

    // ========== サブシステム委譲メソッド ==========

    /**
     * BGMシステムメソッド委譲
     */
    playBGM(trackName, options = {}) {
        return this.subsystemCoordinator.delegateToBGMSystem('playBGM', [trackName, options]);
    }

    stopBGM() {
        return this.subsystemCoordinator.delegateToBGMSystem('stopBGM', []);
    }

    setBGMVolume(volume) {
        return this.subsystemCoordinator.delegateToBGMSystem('setVolume', [volume]);
    }

    /**
     * AudioControllerメソッド委譲
     */
    setVolumeLevel(category, volume, fadeTime = 0) {
        return this.subsystemCoordinator.delegateToController('setVolume', [category, volume, fadeTime]);
    }

    getVolumeLevel(category) {
        return this.subsystemCoordinator.delegateToController('getVolume', [category]);
    }

    fadeInVolume(category, duration = 1.0, targetVolume = null) {
        return this.subsystemCoordinator.delegateToController('fadeIn', [category, duration, targetVolume]);
    }

    fadeOutVolume(category, duration = 1.0, targetVolume = 0) {
        return this.subsystemCoordinator.delegateToController('fadeOut', [category, duration, targetVolume]);
    }

    /**
     * AudioVisualizerメソッド委譲
     */
    enableVisualization(enabled) {
        return this.subsystemCoordinator.delegateToVisualizer('setEnabled', [enabled]);
    }

    setVisualizationStyle(style) {
        return this.subsystemCoordinator.delegateToVisualizer('setStyle', [style]);
    }

    // ========== 状態・統計取得 ==========

    /**
     * AudioManagerの状態取得
     * @returns {Object} 状態情報
     */
    getAudioManagerState() {
        return {
            isInitialized: this.isInitialized,
            isEnabled: this.isEnabled,
            volumes: {
                master: this.masterVolume,
                sfx: this.sfxVolume,
                bgm: this.bgmVolume,
                muted: this.isMuted
            },
            context: this.contextManager.getContextStatus(),
            playback: this.playbackController.getPlaybackStats(),
            configuration: this.configurationManager.getAllSettings(),
            subsystems: this.subsystemCoordinator.getSubsystemStatus(),
            soundGeneration: this.soundGenerator.getGenerationStatus()
        };
    }

    /**
     * ステータス取得（テストで期待されるメソッド）
     * @returns {Object} ステータス情報
     */
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            masterVolume: this.masterVolume,
            soundEffectVolume: this.sfxVolume,
            backgroundMusicVolume: this.bgmVolume,
            activeSounds: this.activeSources.size,
            isLoading: false,
            initialized: this.isInitialized,
            muted: this.isMuted,
            contextState: this.state,
            supportedFormats: ['wav', 'mp3', 'ogg']
        };
    }

    /**
     * 音量取得（汎用メソッド）
     * @param {string} category - 音量カテゴリ ('master', 'sfx', 'bgm')
     * @returns {number} 音量値 (0.0-1.0)
     */
    getVolume(category = 'master') {
        switch (category.toLowerCase()) {
            case 'master':
                return this.masterVolume;
            case 'sfx':
            case 'soundeffect':
                return this.sfxVolume;
            case 'bgm':
            case 'backgroundmusic':
                return this.bgmVolume;
            default:
                return this.masterVolume;
        }
    }

    /**
     * マスター音量取得
     * @returns {number} マスター音量
     */
    getMasterVolume() {
        return this.masterVolume;
    }

    /**
     * 音響効果音量取得
     * @returns {number} 音響効果音量
     */
    getSoundEffectVolume() {
        return this.sfxVolume;
    }

    /**
     * 背景音楽音量取得
     * @returns {number} 背景音楽音量
     */
    getBackgroundMusicVolume() {
        return this.bgmVolume;
    }

    /**
     * 利用可能な音響一覧取得
     * @returns {Array<string>} 音響名配列
     */
    getAvailableSounds() {
        return this.soundGenerator.getAvailableSounds();
    }

    /**
     * 音響テスト
     * @param {string} soundName - テスト音響名
     * @returns {boolean} テスト成功フラグ
     */
    testSound(soundName = 'click') {
        return this.playbackController.testSound(soundName);
    }

    // ========== リソース管理 ==========

    /**
     * リソースの解放
     */
    dispose() {
        console.log('Disposing AudioManager (refactored)...');
        
        // 全音響停止
        this.stopAllSounds();
        
        // サブシステムの破棄
        this.subsystemCoordinator.disposeSubsystems();
        
        // 設定管理の破棄
        this.configurationManager.dispose();
        
        // 再生制御の破棄
        this.playbackController.dispose();
        
        // 音響生成の破棄
        this.soundGenerator.dispose();
        
        // コンテキスト管理の破棄
        this.contextManager.dispose();
        
        // ローカル状態のリセット
        this.isInitialized = false;
        this.isEnabled = false;
        this.audioContext = null;
        this.masterGainNode = null;
        this.sfxGainNode = null;
        this.bgmGainNode = null;
        this.soundBuffers.clear();
        this.activeSources.clear();
        
        // サブシステム参照クリア
        this.bgmSystem = null;
        this.soundEffectSystem = null;
        this.audioController = null;
        this.audioVisualizer = null;
        this.accessibilitySupport = null;
        
        console.log('AudioManager disposed successfully');
    }

    // ========== 互換性メソッド ==========

    /**
     * 従来のAPIとの互換性維持のためのプロパティ
     */
    get currentTime() {
        return this.audioContext ? this.audioContext.currentTime : 0;
    }

    get sampleRate() {
        return this.audioContext ? this.audioContext.sampleRate : 44100;
    }

    get state() {
        return this.audioContext ? this.audioContext.state : 'closed';
    }
}

// シングルトンインスタンス管理
let audioManagerInstance = null;

/**
 * AudioManagerのシングルトンインスタンスを取得
 * @param {Object} configManager - 設定管理オブジェクト
 * @param {Object} audioConfig - 音響設定オブジェクト
 * @returns {AudioManager} シングルトンインスタンス
 */
export function getAudioManager(configManager, audioConfig) {
    if (!audioManagerInstance) {
        audioManagerInstance = new AudioManager(configManager, audioConfig);
    }
    return audioManagerInstance;
}

/**
 * AudioManagerのシングルトンインスタンスを再初期化
 * @param {Object} configManager - 設定管理オブジェクト
 * @param {Object} audioConfig - 音響設定オブジェクト
 * @returns {AudioManager} 新しいシングルトンインスタンス
 */
export function reinitializeAudioManager(configManager, audioConfig) {
    if (audioManagerInstance) {
        audioManagerInstance.dispose();
    }
    audioManagerInstance = new AudioManager(configManager, audioConfig);
    return audioManagerInstance;
}

export default AudioManager;