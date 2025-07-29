import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { Equalizer } from './Equalizer.js';
import { PresetManager } from './PresetManager.js';
import { EnvironmentalAudioManager } from './EnvironmentalAudioManager.js';

/**
 * AudioController - 高度な音響制御システム
 * 
 * 音量制御のGainNode階層構造を管理し、リアルタイム音量調整と
 * ConfigurationManagerとの連携を提供します。
 */
export class AudioController {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.audioContext = audioManager.audioContext;
        this.configManager = getConfigurationManager();
        
        // GainNode階層構造
        this.gainNodes = {
            master: null,      // マスター音量
            bgm: null,         // BGM音量
            sfx: null,         // 効果音音量
            ui: null,          // UI音響音量
            achievement: null,  // 実績音響音量
            game: null         // ゲーム状態音響音量
        };
        
        // 音量レベル（0-1）
        this.volumeLevels = {
            master: 1.0,
            bgm: 0.7,
            sfx: 0.8,
            ui: 0.6,
            achievement: 0.9,
            game: 0.8
        };
        
        // ミュート状態
        this.muteStates = {
            master: false,
            bgm: false,
            sfx: false,
            ui: false,
            achievement: false,
            game: false
        };
        
        // フェード操作管理
        this.activeTransitions = new Map();
        
        // 高度なフェード機能
        this.fadeManager = {
            activeFades: new Map(),
            fadeTypes: {
                LINEAR: 'linear',
                EXPONENTIAL: 'exponential',
                LOGARITHMIC: 'logarithmic',
                SINE: 'sine',
                COSINE: 'cosine',
                EASE_IN: 'ease-in',
                EASE_OUT: 'ease-out',
                EASE_IN_OUT: 'ease-in-out'
            },
            defaultCurve: 'exponential'
        };
        
        // 設定監視のID管理
        this.configWatchers = new Set();
        
        // イコライザーシステム
        this.equalizer = null;
        
        // プリセット管理システム
        this.presetManager = null;
        
        // 環境音システム
        this.environmentalAudioManager = null;
        
        // 音響品質動的調整
        this.qualityManager = {
            currentQuality: 1.0,
            targetQuality: 1.0,
            adjustmentInProgress: false,
            performanceMetrics: {
                audioProcessingLoad: 0,
                activeAudioNodes: 0,
                memoryUsage: 0,
                cpuUsage: 0
            },
            qualityLevels: {
                low: 0.3,
                medium: 0.6,
                high: 1.0
            },
            adjustmentTimer: null,
            monitoringEnabled: true
        };
        
        // パフォーマンス監視
        this.performanceMonitor = {
            lastUpdateTime: 0,
            updateInterval: 1000, // 1秒間隔
            metrics: new Map(),
            thresholds: {
                cpuHigh: 0.8,
                memoryHigh: 0.8,
                audioNodesHigh: 20,
                processingLoadHigh: 0.7
            }
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
            
            // GainNode階層構造を作成
            this._createGainNodeHierarchy();
            
            // 既存のAudioManagerのGainNodeと統合
            this._integrateWithAudioManager();
            
            // 設定から初期音量を読み込み
            this._loadInitialVolumes();
            
            // 設定変更の監視を設定
            this._setupConfigWatchers();
            
            // 音響品質動的調整の初期化
            this._initializeQualityAdjustment();
            
            // パフォーマンス監視の開始
            this._startPerformanceMonitoring();
            
            // イコライザーシステムの初期化
            this._initializeEqualizer();
            
            // プリセット管理システムの初期化
            this._initializePresetManager();
            
            // 環境音システムの初期化
            this._initializeEnvironmentalAudio();
            
            console.log('AudioController initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'initialize',
                component: 'AudioController'
            });
        }
    }
    
    /**
     * GainNode階層構造を作成
     * @private
     */
    _createGainNodeHierarchy() {
        try {
            // マスターGainNodeを作成
            this.gainNodes.master = this.audioContext.createGain();
            this.gainNodes.master.gain.setValueAtTime(this.volumeLevels.master, this.audioContext.currentTime);
            
            // 各カテゴリのGainNodeを作成し、マスターに接続
            const categories = ['bgm', 'sfx', 'ui', 'achievement', 'game'];
            
            categories.forEach(category => {
                this.gainNodes[category] = this.audioContext.createGain();
                this.gainNodes[category].gain.setValueAtTime(
                    this.volumeLevels[category], 
                    this.audioContext.currentTime
                );
                
                // マスターGainNodeに接続
                this.gainNodes[category].connect(this.gainNodes.master);
            });
            
            // マスターを最終出力に接続
            this.gainNodes.master.connect(this.audioContext.destination);
            
            console.log('GainNode hierarchy created successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_createGainNodeHierarchy'
            });
        }
    }
    
    /**
     * 既存のAudioManagerのGainNodeと統合
     * @private
     */
    _integrateWithAudioManager() {
        try {
            if (this.audioManager.masterGainNode) {
                // 既存のマスターGainNodeがある場合は切断して新しい階層に統合
                this.audioManager.masterGainNode.disconnect();
                this.audioManager.masterGainNode.connect(this.gainNodes.master);
            }
            
            if (this.audioManager.bgmGainNode) {
                // BGM GainNodeを新しい階層に統合
                this.audioManager.bgmGainNode.disconnect();
                this.audioManager.bgmGainNode.connect(this.gainNodes.bgm);
            }
            
            if (this.audioManager.sfxGainNode) {
                // SFX GainNodeを新しい階層に統合
                this.audioManager.sfxGainNode.disconnect();
                this.audioManager.sfxGainNode.connect(this.gainNodes.sfx);
            }
            
            console.log('AudioManager GainNodes integrated successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_integrateWithAudioManager'
            });
        }
    }
    
    /**
     * 設定から初期音量を読み込み
     * @private
     */
    _loadInitialVolumes() {
        try {
            // 設定から音量レベルを読み込み
            const audioConfig = this.configManager.get('audio', 'volumes') || {};
            
            if (audioConfig.master !== undefined) {
                this.volumeLevels.master = audioConfig.master;
            }
            if (audioConfig.bgm !== undefined) {
                this.volumeLevels.bgm = audioConfig.bgm;
            }
            if (audioConfig.sfx !== undefined) {
                this.volumeLevels.sfx = audioConfig.sfx;
            }
            if (audioConfig.ui !== undefined) {
                this.volumeLevels.ui = audioConfig.ui;
            }
            if (audioConfig.achievement !== undefined) {
                this.volumeLevels.achievement = audioConfig.achievement;
            }
            if (audioConfig.game !== undefined) {
                this.volumeLevels.game = audioConfig.game;
            }
            
            // ミュート状態を読み込み
            this.muteStates.master = audioConfig.muted || false;
            
            // GainNodeに音量を適用
            this._applyVolumeToGainNodes();
            
            console.log('Initial volumes loaded from configuration');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_loadInitialVolumes'
            });
        }
    }
    
    /**
     * GainNodeに音量を適用
     * @private
     */
    _applyVolumeToGainNodes() {
        try {
            const currentTime = this.audioContext.currentTime;
            
            Object.keys(this.gainNodes).forEach(category => {
                if (this.gainNodes[category]) {
                    const volume = this.muteStates.master || this.muteStates[category] 
                        ? 0 
                        : this.volumeLevels[category];
                    
                    this.gainNodes[category].gain.setValueAtTime(volume, currentTime);
                }
            });
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_applyVolumeToGainNodes'
            });
        }
    }
    
    /**
     * 設定変更の監視を設定
     * @private
     */
    _setupConfigWatchers() {
        try {
            // マスター音量の監視
            const masterVolumeWatcher = this.configManager.watch('audio', 'volumes.master', (newValue) => {
                this.setVolume('master', newValue);
            });
            if (masterVolumeWatcher) this.configWatchers.add(masterVolumeWatcher);
            
            // BGM音量の監視
            const bgmVolumeWatcher = this.configManager.watch('audio', 'volumes.bgm', (newValue) => {
                this.setVolume('bgm', newValue);
            });
            if (bgmVolumeWatcher) this.configWatchers.add(bgmVolumeWatcher);
            
            // SFX音量の監視
            const sfxVolumeWatcher = this.configManager.watch('audio', 'volumes.sfx', (newValue) => {
                this.setVolume('sfx', newValue);
            });
            if (sfxVolumeWatcher) this.configWatchers.add(sfxVolumeWatcher);
            
            // UI音響音量の監視
            const uiVolumeWatcher = this.configManager.watch('audio', 'volumes.ui', (newValue) => {
                this.setVolume('ui', newValue);
            });
            if (uiVolumeWatcher) this.configWatchers.add(uiVolumeWatcher);
            
            // 実績音響音量の監視
            const achievementVolumeWatcher = this.configManager.watch('audio', 'volumes.achievement', (newValue) => {
                this.setVolume('achievement', newValue);
            });
            if (achievementVolumeWatcher) this.configWatchers.add(achievementVolumeWatcher);
            
            // ゲーム状態音響音量の監視
            const gameVolumeWatcher = this.configManager.watch('audio', 'volumes.game', (newValue) => {
                this.setVolume('game', newValue);
            });
            if (gameVolumeWatcher) this.configWatchers.add(gameVolumeWatcher);
            
            // ミュート状態の監視
            const mutedWatcher = this.configManager.watch('audio', 'volumes.muted', (newValue) => {
                this.setMute('master', newValue);
            });
            if (mutedWatcher) this.configWatchers.add(mutedWatcher);
            
            // 音響品質の監視
            const audioQualityWatcher = this.configManager.watch('performance', 'quality.audioQuality', (newValue) => {
                this.setAudioQuality(newValue);
            });
            if (audioQualityWatcher) this.configWatchers.add(audioQualityWatcher);
            
            // パフォーマンスレベルの監視
            const performanceLevelWatcher = this.configManager.watch('performance', 'optimization.performanceLevel', (newValue) => {
                this._applyPerformanceLevel(newValue);
            });
            if (performanceLevelWatcher) this.configWatchers.add(performanceLevelWatcher);
            
            // 適応モードの監視
            const adaptiveModeWatcher = this.configManager.watch('performance', 'optimization.adaptiveMode', (newValue) => {
                this.qualityManager.monitoringEnabled = newValue;
                if (!newValue) {
                    this._stopPerformanceMonitoring();
                } else {
                    this._startPerformanceMonitoring();
                }
            });
            if (adaptiveModeWatcher) this.configWatchers.add(adaptiveModeWatcher);
            
            console.log('Config watchers set up successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_setupConfigWatchers'
            });
        }
    }
    
    /**
     * 音量を設定
     * @param {string} category - 音量カテゴリ ('master', 'bgm', 'sfx', 'ui', 'achievement', 'game')
     * @param {number} volume - 音量レベル (0-1)
     * @param {number} fadeTime - フェード時間（秒、省略可）
     */
    setVolume(category, volume, fadeTime = 0) {
        try {
            if (!this.gainNodes[category]) {
                throw new Error(`Unknown volume category: ${category}`);
            }
            
            if (volume < 0 || volume > 1) {
                throw new Error(`Volume must be between 0 and 1, got: ${volume}`);
            }
            
            // 音量レベルを更新
            this.volumeLevels[category] = volume;
            
            // ミュート状態でない場合のみGainNodeに適用
            if (!this.muteStates.master && !this.muteStates[category]) {
                const gainNode = this.gainNodes[category];
                const currentTime = this.audioContext.currentTime;
                
                if (fadeTime > 0) {
                    // フェードで音量変更
                    gainNode.gain.setTargetAtTime(volume, currentTime, fadeTime / 3);
                } else {
                    // 即座に音量変更
                    gainNode.gain.setValueAtTime(volume, currentTime);
                }
            }
            
            // 設定に保存
            this._saveVolumeToConfig(category, volume);
            
            console.log(`Volume set for ${category}: ${volume} (fade: ${fadeTime}s)`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'setVolume',
                category: category,
                volume: volume,
                fadeTime: fadeTime
            });
        }
    }
    
    /**
     * 音量を取得
     * @param {string} category - 音量カテゴリ
     * @returns {number} 現在の音量レベル (0-1)
     */
    getVolume(category) {
        try {
            if (!this.volumeLevels.hasOwnProperty(category)) {
                throw new Error(`Unknown volume category: ${category}`);
            }
            
            return this.volumeLevels[category];
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getVolume',
                category: category
            });
            return 0;
        }
    }
    
    /**
     * ミュート状態を設定
     * @param {string} category - 音量カテゴリ
     * @param {boolean} muted - ミュート状態
     */
    setMute(category, muted) {
        try {
            if (!this.gainNodes[category]) {
                throw new Error(`Unknown volume category: ${category}`);
            }
            
            this.muteStates[category] = muted;
            
            const gainNode = this.gainNodes[category];
            const currentTime = this.audioContext.currentTime;
            
            if (muted) {
                // ミュート: 音量を0に
                gainNode.gain.setValueAtTime(0, currentTime);
            } else {
                // ミュート解除: 元の音量に戻す
                const volume = this.volumeLevels[category];
                gainNode.gain.setValueAtTime(volume, currentTime);
            }
            
            // マスターミュートの場合は設定に保存
            if (category === 'master') {
                this._saveMuteToConfig(muted);
            }
            
            console.log(`Mute state set for ${category}: ${muted}`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'setMute',
                category: category,
                muted: muted
            });
        }
    }
    
    /**
     * ミュート状態を取得
     * @param {string} category - 音量カテゴリ
     * @returns {boolean} ミュート状態
     */
    getMute(category) {
        try {
            if (!this.muteStates.hasOwnProperty(category)) {
                throw new Error(`Unknown volume category: ${category}`);
            }
            
            return this.muteStates[category];
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getMute',
                category: category
            });
            return false;
        }
    }
    
    /**
     * 高度なフェードイン効果
     * @param {string} category - 音量カテゴリ
     * @param {number} duration - フェード時間（秒）
     * @param {number} targetVolume - 目標音量レベル (0-1)
     * @param {string} curve - フェードカーブタイプ
     * @param {Function} callback - 完了時のコールバック
     */
    async fadeIn(category, duration = 1.0, targetVolume = null, curve = null, callback = null) {
        try {
            if (!this.gainNodes[category]) {
                throw new Error(`Unknown volume category: ${category}`);
            }
            
            const finalVolume = targetVolume !== null ? targetVolume : this.volumeLevels[category];
            const fadeType = curve || this.fadeManager.defaultCurve;
            const startVolume = this.gainNodes[category].gain.value;
            
            console.log(`Starting fade in for ${category}: ${startVolume.toFixed(3)} -> ${finalVolume.toFixed(3)} (${duration}s, ${fadeType})`);
            
            // 高度なフェード実行
            await this._performAdvancedFade(category, startVolume, finalVolume, duration, fadeType, callback);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'fadeIn',
                category: category,
                duration: duration,
                targetVolume: targetVolume,
                curve: curve
            });
        }
    }
    
    /**
     * 高度なフェードアウト効果
     * @param {string} category - 音量カテゴリ
     * @param {number} duration - フェード時間（秒）
     * @param {number} targetVolume - 目標音量レベル (0-1)
     * @param {string} curve - フェードカーブタイプ
     * @param {Function} callback - 完了時のコールバック
     */
    async fadeOut(category, duration = 1.0, targetVolume = 0, curve = null, callback = null) {
        try {
            if (!this.gainNodes[category]) {
                throw new Error(`Unknown volume category: ${category}`);
            }
            
            const fadeType = curve || this.fadeManager.defaultCurve;
            const startVolume = this.gainNodes[category].gain.value;
            
            console.log(`Starting fade out for ${category}: ${startVolume.toFixed(3)} -> ${targetVolume.toFixed(3)} (${duration}s, ${fadeType})`);
            
            // 高度なフェード実行
            await this._performAdvancedFade(category, startVolume, targetVolume, duration, fadeType, callback);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'fadeOut',
                category: category,
                duration: duration,
                targetVolume: targetVolume,
                curve: curve
            });
        }
    }
    
    /**
     * 指数関数的フェード効果（下位互換のため保持）
     * @param {string} category - 音量カテゴリ
     * @param {number} startVolume - 開始音量
     * @param {number} endVolume - 終了音量
     * @param {number} duration - フェード時間（秒）
     */
    async exponentialFade(category, startVolume, endVolume, duration = 1.0) {
        try {
            return await this._performAdvancedFade(category, startVolume, endVolume, duration, 'exponential');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'exponentialFade',
                category: category,
                startVolume: startVolume,
                endVolume: endVolume,
                duration: duration
            });
        }
    }
    
    // ================================
    // 高度なフェード機能の実装
    // ================================
    
    /**
     * 高度なフェード処理の実行
     * @param {string} category - 音量カテゴリ
     * @param {number} startVolume - 開始音量
     * @param {number} endVolume - 終了音量
     * @param {number} duration - フェード時間（秒）
     * @param {string} curveType - フェードカーブタイプ
     * @param {Function} callback - 完了時のコールバック
     * @private
     */
    async _performAdvancedFade(category, startVolume, endVolume, duration, curveType, callback = null) {
        try {
            if (!this.gainNodes[category]) {
                throw new Error(`Unknown volume category: ${category}`);
            }
            
            const fadeId = `${category}_${Date.now()}`;
            const gainNode = this.gainNodes[category];
            const currentTime = this.audioContext.currentTime;
            
            // 既存のフェードをキャンセル
            if (this.fadeManager.activeFades.has(category)) {
                await this._cancelFade(category);
            }
            
            // フェード情報を登録
            this.fadeManager.activeFades.set(category, {
                id: fadeId,
                startTime: currentTime,
                duration: duration,
                startVolume: startVolume,
                endVolume: endVolume,
                curveType: curveType,
                callback: callback
            });
            
            // フェードカーブに応じた処理
            switch (curveType) {
                case 'linear':
                    await this._performLinearFade(gainNode, startVolume, endVolume, duration, currentTime);
                    break;
                case 'exponential':
                    await this._performExponentialFade(gainNode, startVolume, endVolume, duration, currentTime);
                    break;
                case 'logarithmic':
                    await this._performLogarithmicFade(gainNode, startVolume, endVolume, duration, currentTime);
                    break;
                case 'sine':
                    await this._performSineFade(gainNode, startVolume, endVolume, duration, currentTime);
                    break;
                case 'cosine':
                    await this._performCosineFade(gainNode, startVolume, endVolume, duration, currentTime);
                    break;
                case 'ease-in':
                    await this._performEaseInFade(gainNode, startVolume, endVolume, duration, currentTime);
                    break;
                case 'ease-out':
                    await this._performEaseOutFade(gainNode, startVolume, endVolume, duration, currentTime);
                    break;
                case 'ease-in-out':
                    await this._performEaseInOutFade(gainNode, startVolume, endVolume, duration, currentTime);
                    break;
                default:
                    await this._performExponentialFade(gainNode, startVolume, endVolume, duration, currentTime);
                    break;
            }
            
            // フェード完了処理
            this.fadeManager.activeFades.delete(category);
            
            // コールバック実行
            if (callback && typeof callback === 'function') {
                try {
                    callback({
                        category: category,
                        startVolume: startVolume,
                        endVolume: endVolume,
                        duration: duration,
                        curveType: curveType,
                        success: true
                    });
                } catch (callbackError) {
                    console.warn('Fade callback error:', callbackError);
                }
            }
            
            console.log(`Advanced fade completed for ${category}: ${startVolume.toFixed(3)} -> ${endVolume.toFixed(3)} (${duration}s, ${curveType})`);
            
        } catch (error) {
            // フェード情報をクリア
            this.fadeManager.activeFades.delete(category);
            
            // エラーコールバック実行
            if (callback && typeof callback === 'function') {
                try {
                    callback({
                        category: category,
                        startVolume: startVolume,
                        endVolume: endVolume,
                        duration: duration,
                        curveType: curveType,
                        success: false,
                        error: error.message
                    });
                } catch (callbackError) {
                    console.warn('Fade error callback error:', callbackError);
                }
            }
            
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_performAdvancedFade',
                category: category,
                startVolume: startVolume,
                endVolume: endVolume,
                duration: duration,
                curveType: curveType
            });
        }
    }
    
    /**
     * リニアフェードの実行
     * @private
     */
    async _performLinearFade(gainNode, startVolume, endVolume, duration, currentTime) {
        gainNode.gain.setValueAtTime(startVolume, currentTime);
        gainNode.gain.linearRampToValueAtTime(endVolume, currentTime + duration);
        await new Promise(resolve => setTimeout(resolve, duration * 1000));
    }
    
    /**
     * 指数関数的フェードの実行
     * @private
     */
    async _performExponentialFade(gainNode, startVolume, endVolume, duration, currentTime) {
        gainNode.gain.setValueAtTime(startVolume, currentTime);
        // 指数関数的フェードでは0に到達できないため最小値を設定
        const safeEndVolume = Math.max(endVolume, 0.001);
        gainNode.gain.exponentialRampToValueAtTime(safeEndVolume, currentTime + duration);
        await new Promise(resolve => setTimeout(resolve, duration * 1000));
        
        // 目標が0の場合は最後に0に設定
        if (endVolume === 0) {
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        }
    }
    
    /**
     * 対数フェードの実行
     * @private
     */
    async _performLogarithmicFade(gainNode, startVolume, endVolume, duration, currentTime) {
        const steps = 50;
        const stepDuration = duration / steps;
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const logProgress = Math.log(1 + progress * (Math.E - 1)) / Math.log(Math.E);
            const volume = startVolume + (endVolume - startVolume) * logProgress;
            
            gainNode.gain.setValueAtTime(volume, currentTime + (i * stepDuration));
        }
        
        await new Promise(resolve => setTimeout(resolve, duration * 1000));
    }
    
    /**
     * サインカーブフェードの実行
     * @private
     */
    async _performSineFade(gainNode, startVolume, endVolume, duration, currentTime) {
        const steps = 50;
        const stepDuration = duration / steps;
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const sineProgress = Math.sin(progress * Math.PI / 2);
            const volume = startVolume + (endVolume - startVolume) * sineProgress;
            
            gainNode.gain.setValueAtTime(volume, currentTime + (i * stepDuration));
        }
        
        await new Promise(resolve => setTimeout(resolve, duration * 1000));
    }
    
    /**
     * コサインカーブフェードの実行
     * @private
     */
    async _performCosineFade(gainNode, startVolume, endVolume, duration, currentTime) {
        const steps = 50;
        const stepDuration = duration / steps;
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const cosineProgress = 1 - Math.cos(progress * Math.PI / 2);
            const volume = startVolume + (endVolume - startVolume) * cosineProgress;
            
            gainNode.gain.setValueAtTime(volume, currentTime + (i * stepDuration));
        }
        
        await new Promise(resolve => setTimeout(resolve, duration * 1000));
    }
    
    /**
     * Ease-Inフェードの実行
     * @private
     */
    async _performEaseInFade(gainNode, startVolume, endVolume, duration, currentTime) {
        const steps = 50;
        const stepDuration = duration / steps;
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const easeProgress = progress * progress * progress; // cubic ease-in
            const volume = startVolume + (endVolume - startVolume) * easeProgress;
            
            gainNode.gain.setValueAtTime(volume, currentTime + (i * stepDuration));
        }
        
        await new Promise(resolve => setTimeout(resolve, duration * 1000));
    }
    
    /**
     * Ease-Outフェードの実行
     * @private
     */
    async _performEaseOutFade(gainNode, startVolume, endVolume, duration, currentTime) {
        const steps = 50;
        const stepDuration = duration / steps;
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic ease-out
            const volume = startVolume + (endVolume - startVolume) * easeProgress;
            
            gainNode.gain.setValueAtTime(volume, currentTime + (i * stepDuration));
        }
        
        await new Promise(resolve => setTimeout(resolve, duration * 1000));
    }
    
    /**
     * Ease-In-Outフェードの実行
     * @private
     */
    async _performEaseInOutFade(gainNode, startVolume, endVolume, duration, currentTime) {
        const steps = 50;
        const stepDuration = duration / steps;
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            let easeProgress;
            
            if (progress < 0.5) {
                easeProgress = 4 * progress * progress * progress;
            } else {
                easeProgress = 1 - Math.pow(-2 * progress + 2, 3) / 2;
            }
            
            const volume = startVolume + (endVolume - startVolume) * easeProgress;
            gainNode.gain.setValueAtTime(volume, currentTime + (i * stepDuration));
        }
        
        await new Promise(resolve => setTimeout(resolve, duration * 1000));
    }
    
    /**
     * フェードをキャンセル
     * @param {string} category - 音量カテゴリ
     * @private
     */
    async _cancelFade(category) {
        try {
            if (this.fadeManager.activeFades.has(category)) {
                const fadeInfo = this.fadeManager.activeFades.get(category);
                
                // 現在の音量を取得して固定
                const currentVolume = this.gainNodes[category].gain.value;
                this.gainNodes[category].gain.cancelScheduledValues(this.audioContext.currentTime);
                this.gainNodes[category].gain.setValueAtTime(currentVolume, this.audioContext.currentTime);
                
                // フェード情報を削除
                this.fadeManager.activeFades.delete(category);
                
                console.log(`Fade cancelled for ${category} at volume ${currentVolume.toFixed(3)}`);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_cancelFade',
                category: category
            });
        }
    }
    
    // ================================
    // 公開メソッド（高度なフェード制御）
    // ================================
    
    /**
     * カスタムフェード効果
     * @param {string} category - 音量カテゴリ
     * @param {number} targetVolume - 目標音量レベル (0-1)
     * @param {number} duration - フェード時間（秒）
     * @param {string} curve - フェードカーブタイプ
     * @param {Function} callback - 完了時のコールバック
     */
    async customFade(category, targetVolume, duration = 1.0, curve = 'exponential', callback = null) {
        try {
            if (!this.gainNodes[category]) {
                throw new Error(`Unknown volume category: ${category}`);
            }
            
            const startVolume = this.gainNodes[category].gain.value;
            
            await this._performAdvancedFade(category, startVolume, targetVolume, duration, curve, callback);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'customFade',
                category: category,
                targetVolume: targetVolume,
                duration: duration,
                curve: curve
            });
        }
    }
    
    /**
     * クロスフェード効果
     * @param {string} fromCategory - フェードアウトするカテゴリ
     * @param {string} toCategory - フェードインするカテゴリ
     * @param {number} duration - フェード時間（秒）
     * @param {string} curve - フェードカーブタイプ
     * @param {Function} callback - 完了時のコールバック
     */
    async crossFade(fromCategory, toCategory, duration = 2.0, curve = 'exponential', callback = null) {
        try {
            if (!this.gainNodes[fromCategory] || !this.gainNodes[toCategory]) {
                throw new Error(`Unknown volume categories: ${fromCategory} or ${toCategory}`);
            }
            
            const fromStartVolume = this.gainNodes[fromCategory].gain.value;
            const toStartVolume = this.gainNodes[toCategory].gain.value;
            const toTargetVolume = this.volumeLevels[toCategory];
            
            console.log(`Starting crossfade: ${fromCategory}(${fromStartVolume.toFixed(3)}) -> ${toCategory}(${toTargetVolume.toFixed(3)}) (${duration}s, ${curve})`);
            
            // 並行してフェードアウトとフェードインを実行
            const fadePromises = [
                this._performAdvancedFade(fromCategory, fromStartVolume, 0, duration, curve),
                this._performAdvancedFade(toCategory, toStartVolume, toTargetVolume, duration, curve)
            ];
            
            await Promise.all(fadePromises);
            
            // コールバック実行
            if (callback && typeof callback === 'function') {
                callback({
                    fromCategory: fromCategory,
                    toCategory: toCategory,
                    duration: duration,
                    curve: curve,
                    success: true
                });
            }
            
            console.log(`Crossfade completed: ${fromCategory} -> ${toCategory}`);
            
        } catch (error) {
            // エラーコールバック実行
            if (callback && typeof callback === 'function') {
                callback({
                    fromCategory: fromCategory,
                    toCategory: toCategory,
                    duration: duration,
                    curve: curve,
                    success: false,
                    error: error.message
                });
            }
            
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'crossFade',
                fromCategory: fromCategory,
                toCategory: toCategory,
                duration: duration,
                curve: curve
            });
        }
    }
    
    /**
     * すべてのアクティブなフェードをキャンセル
     */
    cancelAllFades() {
        try {
            const categories = Array.from(this.fadeManager.activeFades.keys());
            
            for (const category of categories) {
                this._cancelFade(category);
            }
            
            console.log(`Cancelled ${categories.length} active fades`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'cancelAllFades'
            });
        }
    }
    
    /**
     * フェード状態を取得
     * @returns {Object} フェード状態情報
     */
    getFadeStatus() {
        try {
            const activeStates = {};
            
            for (const [category, fadeInfo] of this.fadeManager.activeFades) {
                const elapsed = this.audioContext.currentTime - fadeInfo.startTime;
                const progress = Math.min(elapsed / fadeInfo.duration, 1.0);
                
                activeStates[category] = {
                    id: fadeInfo.id,
                    startVolume: fadeInfo.startVolume,
                    endVolume: fadeInfo.endVolume,
                    duration: fadeInfo.duration,
                    curveType: fadeInfo.curveType,
                    progress: progress,
                    remaining: Math.max(0, fadeInfo.duration - elapsed)
                };
            }
            
            return {
                activeFades: activeStates,
                totalActiveFades: this.fadeManager.activeFades.size,
                availableCurves: Object.values(this.fadeManager.fadeTypes),
                defaultCurve: this.fadeManager.defaultCurve
            };
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getFadeStatus'
            });
            return null;
        }
    }
    
    /**
     * デフォルトのフェードカーブを設定
     * @param {string} curve - フェードカーブタイプ
     */
    setDefaultFadeCurve(curve) {
        try {
            if (!Object.values(this.fadeManager.fadeTypes).includes(curve)) {
                throw new Error(`Unknown fade curve type: ${curve}`);
            }
            
            this.fadeManager.defaultCurve = curve;
            console.log(`Default fade curve set to: ${curve}`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'setDefaultFadeCurve',
                curve: curve
            });
        }
    }
    
    /**
     * 音量設定を設定ファイルに保存
     * @param {string} category - 音量カテゴリ
     * @param {number} volume - 音量レベル
     * @private
     */
    _saveVolumeToConfig(category, volume) {
        try {
            const configPath = `audio.volumes.${category}`;
            this.configManager.set('audio', `volumes.${category}`, volume);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_saveVolumeToConfig',
                category: category,
                volume: volume
            });
        }
    }
    
    /**
     * ミュート状態を設定ファイルに保存
     * @param {boolean} muted - ミュート状態
     * @private
     */
    _saveMuteToConfig(muted) {
        try {
            this.configManager.set('audio', 'volumes.muted', muted);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_saveMuteToConfig',
                muted: muted
            });
        }
    }
    
    /**
     * 全音量情報を取得
     * @returns {Object} 音量情報
     */
    getAllVolumes() {
        return {
            levels: { ...this.volumeLevels },
            mutes: { ...this.muteStates },
            effective: this._getEffectiveVolumes()
        };
    }
    
    /**
     * 実効音量を取得（ミュート状態を考慮）
     * @returns {Object} 実効音量
     * @private
     */
    _getEffectiveVolumes() {
        const effective = {};
        
        Object.keys(this.volumeLevels).forEach(category => {
            if (this.muteStates.master || this.muteStates[category]) {
                effective[category] = 0;
            } else {
                effective[category] = this.volumeLevels[category];
            }
        });
        
        return effective;
    }
    
    /**
     * 音響制御システムの状態を取得
     * @returns {Object} システム状態
     */
    getControllerState() {
        return {
            initialized: !!this.audioContext,
            gainNodesReady: Object.values(this.gainNodes).every(node => node !== null),
            configWatchers: this.configWatchers.size,
            activeTransitions: this.activeTransitions.size,
            volumes: this.getAllVolumes()
        };
    }
    
    // ================================
    // イコライザーシステム初期化
    // ================================
    
    /**
     * イコライザーシステムの初期化
     * @private
     */
    _initializeEqualizer() {
        try {
            if (!this.audioContext) {
                console.warn('AudioContext is not available for equalizer initialization');
                return;
            }
            
            // イコライザーを作成（マスターGainNodeの前段に挿入）
            const inputNode = this.gainNodes.master;
            const outputNode = this.audioContext.destination;
            
            this.equalizer = new Equalizer(this.audioContext, inputNode, outputNode);
            
            console.log('Equalizer system initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_initializeEqualizer',
                component: 'AudioController'
            });
        }
    }
    
    // ================================
    // イコライザー制御メソッド
    // ================================
    
    /**
     * イコライザーの有効/無効を設定
     * @param {boolean} enabled - 有効状態
     */
    setEqualizerEnabled(enabled) {
        try {
            if (!this.equalizer) {
                console.warn('Equalizer is not initialized');
                return;
            }
            
            this.equalizer.setEnabled(enabled);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'setEqualizerEnabled',
                enabled: enabled
            });
        }
    }
    
    /**
     * イコライザーの有効状態を取得
     * @returns {boolean} 有効状態
     */
    isEqualizerEnabled() {
        try {
            if (!this.equalizer) {
                return false;
            }
            
            return this.equalizer.isEnabled;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'isEqualizerEnabled'
            });
            return false;
        }
    }
    
    /**
     * イコライザーのバンドゲインを設定
     * @param {number} bandIndex - バンドインデックス (0-4)
     * @param {number} gain - ゲイン値 (dB, -20 to +20)
     */
    setEqualizerBandGain(bandIndex, gain) {
        try {
            if (!this.equalizer) {
                console.warn('Equalizer is not initialized');
                return;
            }
            
            this.equalizer.setBandGain(bandIndex, gain);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'setEqualizerBandGain',
                bandIndex: bandIndex,
                gain: gain
            });
        }
    }
    
    /**
     * イコライザーのバンドゲインを取得
     * @param {number} bandIndex - バンドインデックス (0-4)
     * @returns {number} ゲイン値 (dB)
     */
    getEqualizerBandGain(bandIndex) {
        try {
            if (!this.equalizer) {
                console.warn('Equalizer is not initialized');
                return 0;
            }
            
            return this.equalizer.getBandGain(bandIndex);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getEqualizerBandGain',
                bandIndex: bandIndex
            });
            return 0;
        }
    }
    
    /**
     * イコライザーの全バンドゲインを設定
     * @param {number[]} gains - ゲイン値の配列 [bass, lowMid, mid, highMid, treble]
     */
    setEqualizerGains(gains) {
        try {
            if (!this.equalizer) {
                console.warn('Equalizer is not initialized');
                return;
            }
            
            this.equalizer.setAllBandGains(gains);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'setEqualizerGains',
                gains: gains
            });
        }
    }
    
    /**
     * イコライザーの全バンドゲインを取得
     * @returns {number[]} ゲイン値の配列
     */
    getEqualizerGains() {
        try {
            if (!this.equalizer) {
                console.warn('Equalizer is not initialized');
                return [0, 0, 0, 0, 0];
            }
            
            return this.equalizer.getAllBandGains();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getEqualizerGains'
            });
            return [0, 0, 0, 0, 0];
        }
    }
    
    /**
     * イコライザープリセットを適用
     * @param {string} presetName - プリセット名
     */
    applyEqualizerPreset(presetName) {
        try {
            if (!this.equalizer) {
                console.warn('Equalizer is not initialized');
                return;
            }
            
            this.equalizer.applyPreset(presetName);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'applyEqualizerPreset',
                presetName: presetName
            });
        }
    }
    
    /**
     * イコライザープリセット一覧を取得
     * @returns {Object} プリセット定義
     */
    getEqualizerPresets() {
        try {
            if (!this.equalizer) {
                console.warn('Equalizer is not initialized');
                return {};
            }
            
            return this.equalizer.getPresets();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getEqualizerPresets'
            });
            return {};
        }
    }
    
    /**
     * イコライザーをリセット
     */
    resetEqualizer() {
        try {
            if (!this.equalizer) {
                console.warn('Equalizer is not initialized');
                return;
            }
            
            this.equalizer.reset();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'resetEqualizer'
            });
        }
    }
    
    /**
     * イコライザーの周波数レスポンスを取得
     * @param {number} samplePoints - サンプルポイント数
     * @returns {Object} 周波数レスポンスデータ
     */
    getEqualizerFrequencyResponse(samplePoints = 256) {
        try {
            if (!this.equalizer) {
                console.warn('Equalizer is not initialized');
                return null;
            }
            
            return this.equalizer.getFrequencyResponse(samplePoints);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getEqualizerFrequencyResponse',
                samplePoints: samplePoints
            });
            return null;
        }
    }
    
    /**
     * イコライザーのバンド情報を取得
     * @returns {Array} バンド情報の配列
     */
    getEqualizerBandInfo() {
        try {
            if (!this.equalizer) {
                console.warn('Equalizer is not initialized');
                return [];
            }
            
            return this.equalizer.getBandInfo();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getEqualizerBandInfo'
            });
            return [];
        }
    }
    
    /**
     * イコライザーの状態情報を取得
     * @returns {Object} 状態情報
     */
    getEqualizerStatus() {
        try {
            if (!this.equalizer) {
                return {
                    initialized: false,
                    isEnabled: false,
                    bands: [],
                    presets: []
                };
            }
            
            return {
                initialized: true,
                ...this.equalizer.getStatus()
            };
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getEqualizerStatus'
            });
            return {
                initialized: false,
                isEnabled: false,
                bands: [],
                presets: []
            };
        }
    }
    
    // ================================
    // プリセット管理システム初期化
    // ================================
    
    /**
     * プリセット管理システムの初期化
     * @private
     */
    _initializePresetManager() {
        try {
            if (!this.audioContext) {
                console.warn('AudioContext is not available for preset manager initialization');
                return;
            }
            
            this.presetManager = new PresetManager(this);
            
            console.log('PresetManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_initializePresetManager',
                component: 'AudioController'
            });
        }
    }
    
    // ================================
    // プリセット制御メソッド
    // ================================
    
    /**
     * プリセットを適用
     * @param {string} presetId - プリセットID
     * @param {boolean} saveAsLast - 最後に適用したプリセットとして保存するか
     * @returns {boolean} 適用成功
     */
    applyPreset(presetId, saveAsLast = true) {
        try {
            if (!this.presetManager) {
                console.warn('PresetManager is not initialized');
                return false;
            }
            
            return this.presetManager.applyPreset(presetId, saveAsLast);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'applyPreset',
                presetId: presetId
            });
            return false;
        }
    }
    
    /**
     * 現在の設定をプリセットとして保存
     * @param {string} name - プリセット名
     * @param {string} description - プリセット説明
     * @param {Array<string>} tags - タグ配列
     * @param {boolean} isTemporary - 一時プリセットとして保存するか
     * @returns {string|null} 作成されたプリセットID
     */
    saveCurrentAsPreset(name, description = '', tags = [], isTemporary = false) {
        try {
            if (!this.presetManager) {
                console.warn('PresetManager is not initialized');
                return null;
            }
            
            return this.presetManager.saveCurrentAsPreset(name, description, tags, isTemporary);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'saveCurrentAsPreset',
                name: name
            });
            return null;
        }
    }
    
    /**
     * プリセットを取得
     * @param {string} presetId - プリセットID
     * @returns {Object|null} プリセットデータ
     */
    getPreset(presetId) {
        try {
            if (!this.presetManager) {
                console.warn('PresetManager is not initialized');
                return null;
            }
            
            return this.presetManager.getPreset(presetId);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getPreset',
                presetId: presetId
            });
            return null;
        }
    }
    
    /**
     * 全プリセット一覧を取得
     * @param {string} filterType - フィルタータイプ
     * @returns {Array} プリセット一覧
     */
    getAllPresets(filterType = null) {
        try {
            if (!this.presetManager) {
                console.warn('PresetManager is not initialized');
                return [];
            }
            
            return this.presetManager.getAllPresets(filterType);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getAllPresets',
                filterType: filterType
            });
            return [];
        }
    }
    
    /**
     * プリセットを削除
     * @param {string} presetId - プリセットID
     * @returns {boolean} 削除成功
     */
    deletePreset(presetId) {
        try {
            if (!this.presetManager) {
                console.warn('PresetManager is not initialized');
                return false;
            }
            
            return this.presetManager.deletePreset(presetId);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'deletePreset',
                presetId: presetId
            });
            return false;
        }
    }
    
    /**
     * プリセットを更新
     * @param {string} presetId - プリセットID
     * @param {Object} updateData - 更新データ
     * @returns {boolean} 更新成功
     */
    updatePreset(presetId, updateData) {
        try {
            if (!this.presetManager) {
                console.warn('PresetManager is not initialized');
                return false;
            }
            
            return this.presetManager.updatePreset(presetId, updateData);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'updatePreset',
                presetId: presetId
            });
            return false;
        }
    }
    
    /**
     * プリセットを複製
     * @param {string} sourcePresetId - 複製元プリセットID
     * @param {string} newName - 新しいプリセット名
     * @param {boolean} isTemporary - 一時プリセットとして作成するか
     * @returns {string|null} 作成されたプリセットID
     */
    duplicatePreset(sourcePresetId, newName, isTemporary = false) {
        try {
            if (!this.presetManager) {
                console.warn('PresetManager is not initialized');
                return null;
            }
            
            return this.presetManager.duplicatePreset(sourcePresetId, newName, isTemporary);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'duplicatePreset',
                sourcePresetId: sourcePresetId,
                newName: newName
            });
            return null;
        }
    }
    
    /**
     * プリセット適用履歴を取得
     * @returns {Array} 履歴一覧
     */
    getPresetHistory() {
        try {
            if (!this.presetManager) {
                console.warn('PresetManager is not initialized');
                return [];
            }
            
            return this.presetManager.getPresetHistory();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getPresetHistory'
            });
            return [];
        }
    }
    
    /**
     * 現在適用されているプリセット情報を取得
     * @returns {Object|null} 現在のプリセット情報
     */
    getCurrentPreset() {
        try {
            if (!this.presetManager) {
                return null;
            }
            
            return this.presetManager.getCurrentPreset();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getCurrentPreset'
            });
            return null;
        }
    }
    
    /**
     * プリセットをエクスポート
     * @param {string} presetId - プリセットID
     * @returns {Object|null} エクスポートデータ
     */
    exportPreset(presetId) {
        try {
            if (!this.presetManager) {
                console.warn('PresetManager is not initialized');
                return null;
            }
            
            return this.presetManager.exportPreset(presetId);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'exportPreset',
                presetId: presetId
            });
            return null;
        }
    }
    
    /**
     * プリセットをインポート
     * @param {Object} importData - インポートデータ
     * @param {string} newName - 新しいプリセット名
     * @returns {string|null} インポートされたプリセットID
     */
    importPreset(importData, newName = null) {
        try {
            if (!this.presetManager) {
                console.warn('PresetManager is not initialized');
                return null;
            }
            
            return this.presetManager.importPreset(importData, newName);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'importPreset'
            });
            return null;
        }
    }
    
    /**
     * プリセット管理システムの状態を取得
     * @returns {Object} 状態情報
     */
    getPresetManagerStatus() {
        try {
            if (!this.presetManager) {
                return {
                    initialized: false,
                    presetCounts: { builtin: 0, user: 0, temporary: 0, total: 0 },
                    currentPreset: null,
                    historySize: 0
                };
            }
            
            return this.presetManager.getStatus();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getPresetManagerStatus'
            });
            return {
                initialized: false,
                presetCounts: { builtin: 0, user: 0, temporary: 0, total: 0 },
                currentPreset: null,
                historySize: 0
            };
        }
    }
    
    /**
     * 事前定義プリセット一覧を取得
     * @returns {Array} 事前定義プリセット一覧
     */
    getBuiltinPresets() {
        return this.getAllPresets('builtin');
    }
    
    /**
     * ユーザー定義プリセット一覧を取得
     * @returns {Array} ユーザー定義プリセット一覧
     */
    getUserPresets() {
        return this.getAllPresets('user');
    }
    
    /**
     * 一時プリセット一覧を取得
     * @returns {Array} 一時プリセット一覧
     */
    getTemporaryPresets() {
        return this.getAllPresets('temporary');
    }
    
    // ================================
    // 環境音システム初期化
    // ================================
    
    /**
     * 環境音システムの初期化
     * @private
     */
    _initializeEnvironmentalAudio() {
        try {
            if (!this.audioContext) {
                console.warn('AudioContext is not available for environmental audio initialization');
                return;
            }
            
            // 環境音システムを作成（マスターGainNodeに接続）
            this.environmentalAudioManager = new EnvironmentalAudioManager(
                this.audioContext,
                this.gainNodes.bgm // BGMカテゴリに環境音を接続
            );
            
            console.log('Environmental audio system initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_initializeEnvironmentalAudio',
                component: 'AudioController'
            });
        }
    }
    
    // ================================
    // 環境音制御メソッド
    // ================================
    
    /**
     * 環境音を開始
     * @param {string} biomeId - バイオームID
     * @param {string} weatherId - 天候ID（オプション）
     * @param {string} timeOfDay - 時間帯ID（オプション）
     */
    startEnvironmentalAudio(biomeId, weatherId = null, timeOfDay = null) {
        try {
            if (!this.environmentalAudioManager) {
                console.warn('Environmental audio manager is not initialized');
                return false;
            }
            
            return this.environmentalAudioManager.start(biomeId, weatherId, timeOfDay);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'startEnvironmentalAudio',
                biomeId: biomeId,
                weatherId: weatherId,
                timeOfDay: timeOfDay
            });
            return false;
        }
    }
    
    /**
     * 環境音を停止
     * @param {number} fadeOutTime - フェードアウト時間（秒）
     */
    stopEnvironmentalAudio(fadeOutTime = 2.0) {
        try {
            if (!this.environmentalAudioManager) {
                console.warn('Environmental audio manager is not initialized');
                return;
            }
            
            this.environmentalAudioManager.stop(fadeOutTime);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'stopEnvironmentalAudio',
                fadeOutTime: fadeOutTime
            });
        }
    }
    
    /**
     * 環境音の再生状態を取得
     * @returns {boolean} 再生中かどうか
     */
    isEnvironmentalAudioPlaying() {
        try {
            if (!this.environmentalAudioManager) {
                return false;
            }
            
            return this.environmentalAudioManager.isPlaying();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'isEnvironmentalAudioPlaying'
            });
            return false;
        }
    }
    
    /**
     * 環境音の音量を設定
     * @param {number} volume - 音量 (0-1)
     */
    setEnvironmentalAudioVolume(volume) {
        try {
            if (!this.environmentalAudioManager) {
                console.warn('Environmental audio manager is not initialized');
                return;
            }
            
            this.environmentalAudioManager.setVolume(volume);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'setEnvironmentalAudioVolume',
                volume: volume
            });
        }
    }
    
    /**
     * 環境音の現在の音量を取得
     * @returns {number} 現在の音量 (0-1)
     */
    getEnvironmentalAudioVolume() {
        try {
            if (!this.environmentalAudioManager) {
                return 0;
            }
            
            return this.environmentalAudioManager.getVolume();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getEnvironmentalAudioVolume'
            });
            return 0;
        }
    }
    
    /**
     * バイオームを変更
     * @param {string} newBiomeId - 新しいバイオームID
     * @param {number} transitionTime - 遷移時間（秒）
     */
    changeBiome(newBiomeId, transitionTime = 3.0) {
        try {
            if (!this.environmentalAudioManager) {
                console.warn('Environmental audio manager is not initialized');
                return false;
            }
            
            return this.environmentalAudioManager.changeBiome(newBiomeId, transitionTime);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'changeBiome',
                newBiomeId: newBiomeId,
                transitionTime: transitionTime
            });
            return false;
        }
    }
    
    /**
     * 天候効果を変更
     * @param {string} weatherId - 天候ID（nullで天候効果なし）
     * @param {number} transitionTime - 遷移時間（秒）
     */
    changeWeather(weatherId, transitionTime = 2.0) {
        try {
            if (!this.environmentalAudioManager) {
                console.warn('Environmental audio manager is not initialized');
                return false;
            }
            
            return this.environmentalAudioManager.changeWeather(weatherId, transitionTime);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'changeWeather',
                weatherId: weatherId,
                transitionTime: transitionTime
            });
            return false;
        }
    }
    
    /**
     * 時間帯を変更
     * @param {string} timeOfDay - 時間帯ID
     * @param {number} transitionTime - 遷移時間（秒）
     */
    changeTimeOfDay(timeOfDay, transitionTime = 5.0) {
        try {
            if (!this.environmentalAudioManager) {
                console.warn('Environmental audio manager is not initialized');
                return false;
            }
            
            return this.environmentalAudioManager.changeTimeOfDay(timeOfDay, transitionTime);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'changeTimeOfDay',
                timeOfDay: timeOfDay,
                transitionTime: transitionTime
            });
            return false;
        }
    }
    
    /**
     * 利用可能なバイオーム一覧を取得
     * @returns {Array} バイオーム一覧
     */
    getAvailableBiomes() {
        try {
            if (!this.environmentalAudioManager) {
                return [];
            }
            
            return this.environmentalAudioManager.getAvailableBiomes();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getAvailableBiomes'
            });
            return [];
        }
    }
    
    /**
     * 利用可能な天候効果一覧を取得
     * @returns {Array} 天候効果一覧
     */
    getAvailableWeatherEffects() {
        try {
            if (!this.environmentalAudioManager) {
                return [];
            }
            
            return this.environmentalAudioManager.getAvailableWeatherEffects();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getAvailableWeatherEffects'
            });
            return [];
        }
    }
    
    /**
     * 利用可能な時間帯一覧を取得
     * @returns {Array} 時間帯一覧
     */
    getAvailableTimesOfDay() {
        try {
            if (!this.environmentalAudioManager) {
                return [];
            }
            
            return this.environmentalAudioManager.getAvailableTimesOfDay();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getAvailableTimesOfDay'
            });
            return [];
        }
    }
    
    /**
     * 現在の環境音設定を取得
     * @returns {Object} 現在の環境音設定
     */
    getCurrentEnvironmentalSettings() {
        try {
            if (!this.environmentalAudioManager) {
                return {
                    isPlaying: false,
                    currentBiome: null,
                    currentWeather: null,
                    currentTimeOfDay: null,
                    volume: 0
                };
            }
            
            return this.environmentalAudioManager.getCurrentSettings();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getCurrentEnvironmentalSettings'
            });
            return {
                isPlaying: false,
                currentBiome: null,
                currentWeather: null,
                currentTimeOfDay: null,
                volume: 0
            };
        }
    }
    
    /**
     * 環境音システムの詳細ステータスを取得
     * @returns {Object} 詳細ステータス
     */
    getEnvironmentalAudioStatus() {
        try {
            if (!this.environmentalAudioManager) {
                return {
                    initialized: false,
                    isPlaying: false,
                    availableBiomes: [],
                    availableWeatherEffects: [],
                    availableTimesOfDay: [],
                    currentSettings: {
                        biome: null,
                        weather: null,
                        timeOfDay: null,
                        volume: 0
                    }
                };
            }
            
            return {
                initialized: true,
                ...this.environmentalAudioManager.getStatus()
            };
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'getEnvironmentalAudioStatus'
            });
            return {
                initialized: false,
                isPlaying: false,
                availableBiomes: [],
                availableWeatherEffects: [],
                availableTimesOfDay: [],
                currentSettings: {
                    biome: null,
                    weather: null,
                    timeOfDay: null,
                    volume: 0
                }
            };
        }
    }

    // ================================
    // 音響品質動的調整機能
    // ================================
    
    /**
     * 音響品質動的調整の初期化
     * @private
     */
    _initializeQualityAdjustment() {
        try {
            // 設定から初期品質を読み込み
            const audioQuality = this.configManager.get('performance', 'quality.audioQuality') || 1.0;
            const performanceLevel = this.configManager.get('performance', 'optimization.performanceLevel') || 'high';
            const adaptiveMode = this.configManager.get('performance', 'optimization.adaptiveMode') || true;
            
            this.qualityManager.currentQuality = audioQuality;
            this.qualityManager.targetQuality = audioQuality;
            this.qualityManager.monitoringEnabled = adaptiveMode;
            
            // パフォーマンスレベルに応じた初期設定
            this._applyPerformanceLevel(performanceLevel);
            
            console.log(`Quality adjustment initialized: quality=${audioQuality}, level=${performanceLevel}, adaptive=${adaptiveMode}`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_initializeQualityAdjustment'
            });
        }
    }
    
    /**
     * パフォーマンス監視の開始
     * @private
     */
    _startPerformanceMonitoring() {
        try {
            if (!this.qualityManager.monitoringEnabled) {
                return;
            }
            
            // 既存の監視を停止
            this._stopPerformanceMonitoring();
            
            // 監視間隔を設定から取得
            const interval = this.configManager.get('performance', 'optimization.optimizationInterval') || 1000;
            this.performanceMonitor.updateInterval = interval;
            
            // 定期的なパフォーマンス監視を開始
            this.performanceMonitor.intervalId = setInterval(() => {
                this._updatePerformanceMetrics();
                this._evaluateQualityAdjustment();
            }, this.performanceMonitor.updateInterval);
            
            console.log(`Performance monitoring started (interval: ${interval}ms)`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_startPerformanceMonitoring'
            });
        }
    }
    
    /**
     * パフォーマンス監視の停止
     * @private
     */
    _stopPerformanceMonitoring() {
        try {
            if (this.performanceMonitor.intervalId) {
                clearInterval(this.performanceMonitor.intervalId);
                this.performanceMonitor.intervalId = null;
            }
            
            // 品質調整タイマーも停止
            if (this.qualityManager.adjustmentTimer) {
                clearTimeout(this.qualityManager.adjustmentTimer);
                this.qualityManager.adjustmentTimer = null;
            }
            
            console.log('Performance monitoring stopped');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_stopPerformanceMonitoring'
            });
        }
    }
    
    /**
     * パフォーマンスメトリクスの更新
     * @private
     */
    _updatePerformanceMetrics() {
        try {
            const currentTime = performance.now();
            
            // 音響処理負荷の測定
            const audioProcessingLoad = this._measureAudioProcessingLoad();
            
            // アクティブなオーディオノード数の計測
            const activeAudioNodes = this._countActiveAudioNodes();
            
            // メモリ使用量の推定
            const memoryUsage = this._estimateAudioMemoryUsage();
            
            // CPU使用率の推定（簡易的）
            const cpuUsage = this._estimateAudioCPUUsage();
            
            // メトリクスを更新
            this.qualityManager.performanceMetrics = {
                audioProcessingLoad,
                activeAudioNodes,
                memoryUsage,
                cpuUsage,
                timestamp: currentTime
            };
            
            // メトリクス履歴に追加
            this.performanceMonitor.metrics.set(currentTime, {
                ...this.qualityManager.performanceMetrics
            });
            
            // 古いメトリクスを削除（最大30秒間保持）
            const maxAge = 30000; // 30秒
            const cutoffTime = currentTime - maxAge;
            for (const [timestamp] of this.performanceMonitor.metrics) {
                if (timestamp < cutoffTime) {
                    this.performanceMonitor.metrics.delete(timestamp);
                } else {
                    break; // Map は挿入順で順序が保証されているため
                }
            }
            
            this.performanceMonitor.lastUpdateTime = currentTime;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_updatePerformanceMetrics'
            });
        }
    }
    
    /**
     * 音響処理負荷を測定
     * @returns {number} 処理負荷 (0-1)
     * @private
     */
    _measureAudioProcessingLoad() {
        try {
            if (!this.audioContext) return 0;
            
            // 現在の音響処理負荷を推定
            // Web Audio APIの制限により、実際のCPU使用率は取得できないため推定値を使用
            const activeNodes = this._countActiveAudioNodes();
            const maxNodes = 50; // 想定される最大ノード数
            
            const baseLoad = Math.min(activeNodes / maxNodes, 1.0);
            
            // ランダムファクターを追加してより現実的な値にする
            const randomFactor = 0.1 * (Math.random() - 0.5);
            
            return Math.max(0, Math.min(1, baseLoad + randomFactor));
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_measureAudioProcessingLoad'
            });
            return 0;
        }
    }
    
    /**
     * アクティブなオーディオノード数を計測
     * @returns {number} ノード数
     * @private
     */
    _countActiveAudioNodes() {
        try {
            let nodeCount = 0;
            
            // GainNodeの数
            nodeCount += Object.values(this.gainNodes).filter(node => node !== null).length;
            
            // AudioManagerのアクティブソース数を推定
            if (this.audioManager && this.audioManager.activeSources) {
                nodeCount += this.audioManager.activeSources.size;
            }
            
            // BGMシステムのノード数を推定
            if (this.audioManager && this.audioManager.bgmSystem) {
                nodeCount += 5; // BGM再生用の推定ノード数
            }
            
            return nodeCount;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_countActiveAudioNodes'
            });
            return 0;
        }
    }
    
    /**
     * 音響メモリ使用量を推定
     * @returns {number} メモリ使用量 (0-1)
     * @private
     */
    _estimateAudioMemoryUsage() {
        try {
            // Web Audio APIのメモリ使用量は直接取得できないため推定
            const activeNodes = this._countActiveAudioNodes();
            const estimatedMemoryPerNode = 0.1; // MB per node (推定値)
            const totalEstimatedMemory = activeNodes * estimatedMemoryPerNode;
            
            // メモリ制限を設定から取得
            const memoryLimit = this.configManager.get('performance', 'limits.memoryThreshold') || 100; // MB
            
            return Math.min(totalEstimatedMemory / memoryLimit, 1.0);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_estimateAudioMemoryUsage'
            });
            return 0;
        }
    }
    
    /**
     * 音響CPU使用率を推定
     * @returns {number} CPU使用率 (0-1)
     * @private
     */
    _estimateAudioCPUUsage() {
        try {
            // 簡易的なCPU使用率推定
            const processingLoad = this.qualityManager.performanceMetrics.audioProcessingLoad;
            const nodeLoad = this.qualityManager.performanceMetrics.activeAudioNodes / 20; // 20ノードで50%と仮定
            
            return Math.min((processingLoad + nodeLoad) / 2, 1.0);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_estimateAudioCPUUsage'
            });
            return 0;
        }
    }
    
    /**
     * 品質調整の評価と実行
     * @private
     */
    _evaluateQualityAdjustment() {
        try {
            if (!this.qualityManager.monitoringEnabled || this.qualityManager.adjustmentInProgress) {
                return;
            }
            
            const metrics = this.qualityManager.performanceMetrics;
            const thresholds = this.performanceMonitor.thresholds;
            
            // パフォーマンス問題の検出
            const hasPerformanceIssue = 
                metrics.cpuUsage > thresholds.cpuHigh ||
                metrics.memoryUsage > thresholds.memoryHigh ||
                metrics.activeAudioNodes > thresholds.audioNodesHigh ||
                metrics.audioProcessingLoad > thresholds.processingLoadHigh;
            
            // 目標品質を決定
            let targetQuality = this.qualityManager.currentQuality;
            
            if (hasPerformanceIssue) {
                // パフォーマンス問題がある場合は品質を下げる
                if (metrics.cpuUsage > 0.9 || metrics.memoryUsage > 0.9) {
                    targetQuality = this.qualityManager.qualityLevels.low;
                } else if (metrics.cpuUsage > 0.8 || metrics.memoryUsage > 0.8) {
                    targetQuality = this.qualityManager.qualityLevels.medium;
                }
            } else {
                // パフォーマンスに余裕がある場合は品質を上げる
                if (metrics.cpuUsage < 0.4 && metrics.memoryUsage < 0.4) {
                    targetQuality = this.qualityManager.qualityLevels.high;
                } else if (metrics.cpuUsage < 0.6 && metrics.memoryUsage < 0.6) {
                    targetQuality = this.qualityManager.qualityLevels.medium;
                }
            }
            
            // 品質調整が必要な場合のみ実行
            if (Math.abs(targetQuality - this.qualityManager.currentQuality) > 0.1) {
                this._adjustAudioQuality(targetQuality);
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_evaluateQualityAdjustment'
            });
        }
    }
    
    /**
     * 音響品質を調整
     * @param {number} targetQuality - 目標品質 (0-1)
     * @private
     */
    async _adjustAudioQuality(targetQuality) {
        try {
            if (this.qualityManager.adjustmentInProgress) {
                return;
            }
            
            this.qualityManager.adjustmentInProgress = true;
            this.qualityManager.targetQuality = targetQuality;
            
            const currentQuality = this.qualityManager.currentQuality;
            const qualityDifference = targetQuality - currentQuality;
            const adjustmentSteps = 10;
            const stepSize = qualityDifference / adjustmentSteps;
            const stepDelay = 100; // ms
            
            console.log(`Adjusting audio quality: ${currentQuality.toFixed(2)} -> ${targetQuality.toFixed(2)}`);
            
            // 段階的に品質を調整
            for (let step = 1; step <= adjustmentSteps; step++) {
                const intermediateQuality = currentQuality + (stepSize * step);
                
                // 品質設定を適用
                await this._applyQualitySettings(intermediateQuality);
                
                // 次のステップまで待機
                if (step < adjustmentSteps) {
                    await new Promise(resolve => setTimeout(resolve, stepDelay));
                }
            }
            
            // 最終品質を設定に保存
            this.configManager.set('performance', 'quality.audioQuality', targetQuality);
            this.qualityManager.currentQuality = targetQuality;
            
            console.log(`Audio quality adjustment completed: ${targetQuality.toFixed(2)}`);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_adjustAudioQuality',
                targetQuality: targetQuality
            });
        } finally {
            this.qualityManager.adjustmentInProgress = false;
        }
    }
    
    /**
     * 品質設定を適用
     * @param {number} quality - 品質レベル (0-1)
     * @private
     */
    async _applyQualitySettings(quality) {
        try {
            // SoundEffectSystemの品質設定を調整
            if (this.audioManager.soundEffectSystem) {
                // バリエーション数を品質に応じて調整
                const maxVariations = Math.ceil(quality * 5); // 最大5バリエーション
                if (typeof this.audioManager.soundEffectSystem.setMaxVariations === 'function') {
                    this.audioManager.soundEffectSystem.setMaxVariations(maxVariations);
                }
                
                // 効果音の品質を調整
                if (typeof this.audioManager.soundEffectSystem.setQuality === 'function') {
                    this.audioManager.soundEffectSystem.setQuality(quality);
                }
            }
            
            // BGMSystemの品質設定を調整
            if (this.audioManager.bgmSystem) {
                // BGM生成品質を調整
                if (typeof this.audioManager.bgmSystem.setQuality === 'function') {
                    this.audioManager.bgmSystem.setQuality(quality);
                }
            }
            
            // 低品質モードでの処理軽減
            if (quality < 0.5) {
                // 一部のエフェクトを無効化
                this._disableNonEssentialEffects();
            } else {
                // エフェクトを再有効化
                this._enableAllEffects();
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_applyQualitySettings',
                quality: quality
            });
        }
    }
    
    /**
     * 非必須エフェクトを無効化
     * @private
     */
    _disableNonEssentialEffects() {
        try {
            // リバーブの無効化
            if (this.audioManager.reverbConvolver) {
                this.audioManager.bypassReverb();
            }
            
            // コンプレッサーの軽量化
            if (this.audioManager.compressor) {
                this.audioManager.compressor.threshold.value = -30; // 軽い圧縮
                this.audioManager.compressor.ratio.value = 2;
            }
            
            console.log('Non-essential audio effects disabled for performance');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_disableNonEssentialEffects'
            });
        }
    }
    
    /**
     * 全エフェクトを有効化
     * @private
     */
    _enableAllEffects() {
        try {
            // リバーブの有効化
            if (this.audioManager.reverbConvolver && this.configManager.get('audio', 'effects.reverb')) {
                this.audioManager.reconnectReverb();
            }
            
            // コンプレッサーの復元
            if (this.audioManager.compressor) {
                const compressorConfig = this.audioManager.audioConfig.getCompressorConfig();
                this.audioManager.compressor.threshold.value = compressorConfig.threshold;
                this.audioManager.compressor.ratio.value = compressorConfig.ratio;
            }
            
            console.log('All audio effects enabled');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_enableAllEffects'
            });
        }
    }
    
    /**
     * パフォーマンスレベルを適用
     * @param {string} level - パフォーマンスレベル ('low', 'medium', 'high')
     * @private
     */
    _applyPerformanceLevel(level) {
        try {
            const qualityPresets = {
                low: this.configManager.get('performance', 'quality.presets.low'),
                medium: this.configManager.get('performance', 'quality.presets.medium'),
                high: this.configManager.get('performance', 'quality.presets.high')
            };
            
            const preset = qualityPresets[level];
            if (!preset) {
                console.warn(`Unknown performance level: ${level}`);
                return;
            }
            
            // 音響品質を設定
            this.setAudioQuality(preset.audioQuality);
            
            // 監視間隔を調整
            if (level === 'low') {
                this.performanceMonitor.updateInterval = 2000; // 2秒間隔
            } else if (level === 'medium') {
                this.performanceMonitor.updateInterval = 1500; // 1.5秒間隔
            } else {
                this.performanceMonitor.updateInterval = 1000; // 1秒間隔
            }
            
            // 閾値を調整
            if (level === 'low') {
                this.performanceMonitor.thresholds.cpuHigh = 0.9;
                this.performanceMonitor.thresholds.memoryHigh = 0.9;
            } else if (level === 'medium') {
                this.performanceMonitor.thresholds.cpuHigh = 0.8;
                this.performanceMonitor.thresholds.memoryHigh = 0.8;
            } else {
                this.performanceMonitor.thresholds.cpuHigh = 0.7;
                this.performanceMonitor.thresholds.memoryHigh = 0.7;
            }
            
            console.log(`Performance level applied: ${level}`, preset);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: '_applyPerformanceLevel',
                level: level
            });
        }
    }
    
    // ================================
    // 公開メソッド（音響品質制御）
    // ================================
    
    /**
     * 音響品質を設定
     * @param {number} quality - 品質レベル (0-1)
     */
    async setAudioQuality(quality) {
        try {
            if (quality < 0 || quality > 1) {
                throw new Error(`Audio quality must be between 0 and 1, got: ${quality}`);
            }
            
            await this._adjustAudioQuality(quality);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'setAudioQuality',
                quality: quality
            });
        }
    }
    
    /**
     * 現在の音響品質を取得
     * @returns {number} 品質レベル (0-1)
     */
    getAudioQuality() {
        return this.qualityManager.currentQuality;
    }
    
    /**
     * パフォーマンスメトリクスを取得
     * @returns {Object} パフォーマンスメトリクス
     */
    getPerformanceMetrics() {
        return {
            current: { ...this.qualityManager.performanceMetrics },
            quality: {
                current: this.qualityManager.currentQuality,
                target: this.qualityManager.targetQuality,
                adjustmentInProgress: this.qualityManager.adjustmentInProgress
            },
            monitoring: {
                enabled: this.qualityManager.monitoringEnabled,
                interval: this.performanceMonitor.updateInterval,
                lastUpdate: this.performanceMonitor.lastUpdateTime
            },
            history: Array.from(this.performanceMonitor.metrics.values())
        };
    }
    
    /**
     * 音響品質の自動調整を有効/無効化
     * @param {boolean} enabled - 有効フラグ
     */
    setAutomaticQualityAdjustment(enabled) {
        try {
            this.qualityManager.monitoringEnabled = enabled;
            
            if (enabled) {
                this._startPerformanceMonitoring();
            } else {
                this._stopPerformanceMonitoring();
            }
            
            // 設定に保存
            this.configManager.set('performance', 'optimization.adaptiveMode', enabled);
            
            console.log(`Automatic quality adjustment ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'setAutomaticQualityAdjustment',
                enabled: enabled
            });
        }
    }
    
    /**
     * パフォーマンス監視の強制更新
     */
    forcePerformanceUpdate() {
        try {
            this._updatePerformanceMetrics();
            this._evaluateQualityAdjustment();
            
            console.log('Performance metrics updated manually');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'forcePerformanceUpdate'
            });
        }
    }
    
    /**
     * リソースの解放
     */
    dispose() {
        try {
            // パフォーマンス監視の停止
            this._stopPerformanceMonitoring();
            
            // 設定監視の解除
            if (this.configWatchers) {
                this.configWatchers.forEach(watchId => {
                    this.configManager.unwatch(watchId);
                });
                this.configWatchers.clear();
            }
            
            // アクティブなトランジションをクリア
            if (this.activeTransitions) {
                this.activeTransitions.clear();
            }
            
            // アクティブなフェードをキャンセル
            this.cancelAllFades();
            
            // パフォーマンス監視データをクリア
            if (this.performanceMonitor.metrics) {
                this.performanceMonitor.metrics.clear();
            }
            
            // イコライザーシステムを破棄
            if (this.equalizer) {
                this.equalizer.dispose();
                this.equalizer = null;
            }
            
            // プリセット管理システムを破棄
            if (this.presetManager) {
                this.presetManager.dispose();
                this.presetManager = null;
            }
            
            // 環境音システムを破棄
            if (this.environmentalAudioManager) {
                this.environmentalAudioManager.dispose();
                this.environmentalAudioManager = null;
            }
            
            // GainNodeを切断
            Object.values(this.gainNodes).forEach(gainNode => {
                if (gainNode) {
                    gainNode.disconnect();
                }
            });
            
            // 参照をクリア
            this.gainNodes = {};
            this.volumeLevels = {};
            this.muteStates = {};
            this.qualityManager = null;
            this.performanceMonitor = null;
            
            console.log('AudioController disposed');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'dispose'
            });
        }
    }
}