import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

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
        
        // 設定監視のID管理
        this.configWatchers = new Set();
        
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
     * フェードイン効果
     * @param {string} category - 音量カテゴリ
     * @param {number} duration - フェード時間（秒）
     * @param {number} targetVolume - 目標音量レベル (0-1)
     */
    async fadeIn(category, duration = 1.0, targetVolume = null) {
        try {
            if (!this.gainNodes[category]) {
                throw new Error(`Unknown volume category: ${category}`);
            }
            
            const finalVolume = targetVolume !== null ? targetVolume : this.volumeLevels[category];
            const gainNode = this.gainNodes[category];
            const currentTime = this.audioContext.currentTime;
            
            // 現在の音量から開始
            const currentVolume = gainNode.gain.value;
            
            // フェードイン実行
            gainNode.gain.setValueAtTime(currentVolume, currentTime);
            gainNode.gain.linearRampToValueAtTime(finalVolume, currentTime + duration);
            
            // フェード完了を待機
            await new Promise(resolve => setTimeout(resolve, duration * 1000));
            
            console.log(`Fade in completed for ${category}: ${currentVolume} -> ${finalVolume} (${duration}s)`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'fadeIn',
                category: category,
                duration: duration,
                targetVolume: targetVolume
            });
        }
    }
    
    /**
     * フェードアウト効果
     * @param {string} category - 音量カテゴリ
     * @param {number} duration - フェード時間（秒）
     * @param {number} targetVolume - 目標音量レベル (0-1)
     */
    async fadeOut(category, duration = 1.0, targetVolume = 0) {
        try {
            if (!this.gainNodes[category]) {
                throw new Error(`Unknown volume category: ${category}`);
            }
            
            const gainNode = this.gainNodes[category];
            const currentTime = this.audioContext.currentTime;
            
            // 現在の音量から開始
            const currentVolume = gainNode.gain.value;
            
            // フェードアウト実行
            gainNode.gain.setValueAtTime(currentVolume, currentTime);
            gainNode.gain.linearRampToValueAtTime(targetVolume, currentTime + duration);
            
            // フェード完了を待機
            await new Promise(resolve => setTimeout(resolve, duration * 1000));
            
            console.log(`Fade out completed for ${category}: ${currentVolume} -> ${targetVolume} (${duration}s)`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'fadeOut',
                category: category,
                duration: duration,
                targetVolume: targetVolume
            });
        }
    }
    
    /**
     * 指数関数的フェード効果
     * @param {string} category - 音量カテゴリ
     * @param {number} startVolume - 開始音量
     * @param {number} endVolume - 終了音量
     * @param {number} duration - フェード時間（秒）
     */
    async exponentialFade(category, startVolume, endVolume, duration = 1.0) {
        try {
            if (!this.gainNodes[category]) {
                throw new Error(`Unknown volume category: ${category}`);
            }
            
            const gainNode = this.gainNodes[category];
            const currentTime = this.audioContext.currentTime;
            
            // 指数関数的フェード実行
            gainNode.gain.setValueAtTime(startVolume, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                Math.max(endVolume, 0.001), // 0は指数関数的に到達できないので最小値を設定
                currentTime + duration
            );
            
            // フェード完了を待機
            await new Promise(resolve => setTimeout(resolve, duration * 1000));
            
            console.log(`Exponential fade completed for ${category}: ${startVolume} -> ${endVolume} (${duration}s)`);
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
    
    /**
     * リソースの解放
     */
    dispose() {
        try {
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
            
            console.log('AudioController disposed');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONTROLLER_ERROR', {
                operation: 'dispose'
            });
        }
    }
}