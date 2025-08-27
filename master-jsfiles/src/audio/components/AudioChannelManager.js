/**
 * AudioChannelManager.js
 * オーディオチャンネル管理システム
 * AudioControllerから分離されたチャンネル管理・音量制御機能
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { getConfigurationManager } from '../../core/ConfigurationManager.js';
import { LoggingSystem } from '../../core/LoggingSystem.js';

export class AudioChannelManager {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // オーディオノード階層
        this.gainNodes = {
            master: null,
            music: null,
            sfx: null,
            ui: null,
            voice: null,
            environmental: null
        };
        
        // 音量設定
        this.volumes = {
            master: 1.0,
            music: 0.7,
            sfx: 0.8,
            ui: 0.6,
            voice: 1.0,
            environmental: 0.5
        };
        
        // ミュート状態
        this.muteStates = {
            master: false,
            music: false,
            sfx: false,
            ui: false,
            voice: false,
            environmental: false
        };
        
        // 前回の音量（ミュート解除時の復元用）
        this.previousVolumes = { ...this.volumes };
        
        // 設定監視
        this.configWatchers = new Set();
        
        // チャンネル設定
        this.channelConfig = {
            defaultVolumes: {
                master: 1.0,
                music: 0.7,
                sfx: 0.8,
                ui: 0.6,
                voice: 1.0,
                environmental: 0.5
            },
            volumeStep: 0.1,
            minVolume: 0.0,
            maxVolume: 2.0,
            fadeStep: 0.02
        };
        
        this.initialize();
    }
    
    /**
     * チャンネルマネージャーを初期化
     */
    async initialize() {
        try {
            // ゲインノード階層を作成
            this.createGainNodeHierarchy();
            
            // 初期音量を読み込み
            this.loadInitialVolumes();
            
            // 設定監視を設定
            this.setupConfigWatchers();
            
            this.loggingSystem.info('AudioChannelManager', 'Audio channel manager initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.initialize');
        }
    }
    
    /**
     * ゲインノード階層を作成
     */
    createGainNodeHierarchy() {
        try {
            // マスターゲインノード
            this.gainNodes.master = this.audioContext.createGain();
            this.gainNodes.master.connect(this.audioContext.destination);
            
            // 各チャンネルのゲインノード
            Object.keys(this.gainNodes).forEach(channel => {
                if (channel !== 'master') {
                    this.gainNodes[channel] = this.audioContext.createGain();
                    this.gainNodes[channel].connect(this.gainNodes.master);
                }
            });
            
            // 初期音量を設定
            this.applyVolumeToGainNodes();
            
            this.loggingSystem.debug('AudioChannelManager', 'Gain node hierarchy created');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.createGainNodeHierarchy');
        }
    }
    
    /**
     * 初期音量を読み込み
     */
    loadInitialVolumes() {
        try {
            const audioConfig = this.configManager.get('audio');
            
            if (audioConfig && audioConfig.volumes) {
                Object.keys(this.volumes).forEach(channel => {
                    if (audioConfig.volumes[channel] !== undefined) {
                        this.volumes[channel] = audioConfig.volumes[channel];
                    }
                });
            }
            
            if (audioConfig && audioConfig.mute) {
                Object.keys(this.muteStates).forEach(channel => {
                    if (audioConfig.mute[channel] !== undefined) {
                        this.muteStates[channel] = audioConfig.mute[channel];
                    }
                });
            }
            
            this.applyVolumeToGainNodes();
            
            this.loggingSystem.debug('AudioChannelManager', 'Initial volumes loaded', this.volumes);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.loadInitialVolumes');
        }
    }
    
    /**
     * 音量をゲインノードに適用
     */
    applyVolumeToGainNodes() {
        try {
            Object.keys(this.gainNodes).forEach(channel => {
                if (this.gainNodes[channel]) {
                    const volume = this.muteStates[channel] ? 0 : this.volumes[channel];
                    this.gainNodes[channel].gain.value = Math.max(0, Math.min(2, volume));
                }
            });
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.applyVolumeToGainNodes');
        }
    }
    
    /**
     * 設定監視を設定
     */
    setupConfigWatchers() {
        try {
            // 音量設定の監視
            Object.keys(this.volumes).forEach(channel => {
                const watcher = this.configManager.watch('audio', `volumes.${channel}`, (newValue) => {
                    if (newValue !== undefined) {
                        this.setVolume(channel, newValue, false); // 設定保存をスキップ
                    }
                });
                if (watcher) this.configWatchers.add(watcher);
            });
            
            // ミュート設定の監視
            Object.keys(this.muteStates).forEach(channel => {
                const watcher = this.configManager.watch('audio', `mute.${channel}`, (newValue) => {
                    if (newValue !== undefined) {
                        this.setMute(channel, newValue, false); // 設定保存をスキップ
                    }
                });
                if (watcher) this.configWatchers.add(watcher);
            });
            
            this.loggingSystem.debug('AudioChannelManager', 'Config watchers setup completed');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.setupConfigWatchers');
        }
    }
    
    /**
     * 音量を設定
     * @param {string} channel - チャンネル名
     * @param {number} volume - 音量 (0.0-2.0)
     * @param {boolean} saveToConfig - 設定に保存するかどうか
     */
    setVolume(channel, volume, saveToConfig = true) {
        try {
            if (!this.volumes.hasOwnProperty(channel)) {
                throw new Error(`Unknown audio channel: ${channel}`);
            }
            
            const clampedVolume = Math.max(this.channelConfig.minVolume, Math.min(this.channelConfig.maxVolume, volume));
            this.volumes[channel] = clampedVolume;
            
            // ミュートされていない場合のみゲインノードに適用
            if (!this.muteStates[channel] && this.gainNodes[channel]) {
                this.gainNodes[channel].gain.value = clampedVolume;
            }
            
            // 設定に保存
            if (saveToConfig) {
                this.saveVolumeToConfig(channel, clampedVolume);
            }
            
            this.loggingSystem.debug('AudioChannelManager', `Volume set: ${channel} = ${clampedVolume}`);
            
            return clampedVolume;
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.setVolume');
            return this.volumes[channel] || 0;
        }
    }
    
    /**
     * 音量を取得
     * @param {string} channel - チャンネル名
     * @returns {number} 音量
     */
    getVolume(channel) {
        try {
            if (!this.volumes.hasOwnProperty(channel)) {
                throw new Error(`Unknown audio channel: ${channel}`);
            }
            
            return this.volumes[channel];
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.getVolume');
            return 0;
        }
    }
    
    /**
     * ミュート状態を設定
     * @param {string} channel - チャンネル名
     * @param {boolean} muted - ミュート状態
     * @param {boolean} saveToConfig - 設定に保存するかどうか
     */
    setMute(channel, muted, saveToConfig = true) {
        try {
            if (!this.muteStates.hasOwnProperty(channel)) {
                throw new Error(`Unknown audio channel: ${channel}`);
            }
            
            // 現在の音量を保存（ミュート解除時の復元用）
            if (muted && !this.muteStates[channel]) {
                this.previousVolumes[channel] = this.volumes[channel];
            }
            
            this.muteStates[channel] = muted;
            
            // ゲインノードに適用
            if (this.gainNodes[channel]) {
                this.gainNodes[channel].gain.value = muted ? 0 : this.volumes[channel];
            }
            
            // 設定に保存
            if (saveToConfig) {
                this.saveMuteToConfig(channel, muted);
            }
            
            this.loggingSystem.debug('AudioChannelManager', `Mute set: ${channel} = ${muted}`);
            
            return muted;
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.setMute');
            return this.muteStates[channel] || false;
        }
    }
    
    /**
     * ミュート状態を取得
     * @param {string} channel - チャンネル名
     * @returns {boolean} ミュート状態
     */
    getMute(channel) {
        try {
            if (!this.muteStates.hasOwnProperty(channel)) {
                throw new Error(`Unknown audio channel: ${channel}`);
            }
            
            return this.muteStates[channel];
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.getMute');
            return false;
        }
    }
    
    /**
     * 全チャンネルの音量を取得
     * @returns {Object} 全チャンネルの音量
     */
    getAllVolumes() {
        return { ...this.volumes };
    }
    
    /**
     * 全チャンネルのミュート状態を取得
     * @returns {Object} 全チャンネルのミュート状態
     */
    getAllMuteStates() {
        return { ...this.muteStates };
    }
    
    /**
     * 実効音量を取得（ミュート状態を考慮）
     * @returns {Object} 実効音量
     */
    getEffectiveVolumes() {
        const effectiveVolumes = {};
        Object.keys(this.volumes).forEach(channel => {
            effectiveVolumes[channel] = this.muteStates[channel] ? 0 : this.volumes[channel];
        });
        return effectiveVolumes;
    }
    
    /**
     * チャンネルの音量を段階的に変更
     * @param {string} channel - チャンネル名
     * @param {boolean} increase - 音量を上げるかどうか
     */
    adjustVolumeByStep(channel, increase) {
        try {
            const currentVolume = this.getVolume(channel);
            const step = this.channelConfig.volumeStep;
            const newVolume = increase ? currentVolume + step : currentVolume - step;
            
            return this.setVolume(channel, newVolume);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.adjustVolumeByStep');
            return this.getVolume(channel);
        }
    }
    
    /**
     * 音量をリセット
     * @param {string} channel - チャンネル名（指定しない場合は全チャンネル）
     */
    resetVolume(channel = null) {
        try {
            if (channel) {
                // 特定チャンネルをリセット
                const defaultVolume = this.channelConfig.defaultVolumes[channel];
                if (defaultVolume !== undefined) {
                    this.setVolume(channel, defaultVolume);
                }
            } else {
                // 全チャンネルをリセット
                Object.keys(this.channelConfig.defaultVolumes).forEach(ch => {
                    this.setVolume(ch, this.channelConfig.defaultVolumes[ch]);
                });
            }
            
            this.loggingSystem.info('AudioChannelManager', `Volume reset: ${channel || 'all channels'}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.resetVolume');
        }
    }
    
    /**
     * ミュート状態をリセット
     * @param {string} channel - チャンネル名（指定しない場合は全チャンネル）
     */
    resetMute(channel = null) {
        try {
            if (channel) {
                // 特定チャンネルをリセット
                this.setMute(channel, false);
            } else {
                // 全チャンネルをリセット
                Object.keys(this.muteStates).forEach(ch => {
                    this.setMute(ch, false);
                });
            }
            
            this.loggingSystem.info('AudioChannelManager', `Mute reset: ${channel || 'all channels'}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.resetMute');
        }
    }
    
    /**
     * チャンネルのゲインノードを取得
     * @param {string} channel - チャンネル名
     * @returns {GainNode} ゲインノード
     */
    getGainNode(channel) {
        return this.gainNodes[channel] || null;
    }
    
    /**
     * 全チャンネルのゲインノードを取得
     * @returns {Object} 全チャンネルのゲインノード
     */
    getAllGainNodes() {
        return { ...this.gainNodes };
    }
    
    /**
     * チャンネルマネージャーの状態を取得
     * @returns {Object} 状態情報
     */
    getManagerState() {
        return {
            volumes: this.getAllVolumes(),
            muteStates: this.getAllMuteStates(),
            effectiveVolumes: this.getEffectiveVolumes(),
            channelConfig: this.channelConfig,
            availableChannels: Object.keys(this.gainNodes)
        };
    }
    
    /**
     * 音量を設定に保存
     * @param {string} channel - チャンネル名
     * @param {number} volume - 音量
     */
    saveVolumeToConfig(channel, volume) {
        try {
            this.configManager.set('audio', `volumes.${channel}`, volume);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.saveVolumeToConfig');
        }
    }
    
    /**
     * ミュート状態を設定に保存
     * @param {string} channel - チャンネル名
     * @param {boolean} muted - ミュート状態
     */
    saveMuteToConfig(channel, muted) {
        try {
            this.configManager.set('audio', `mute.${channel}`, muted);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.saveMuteToConfig');
        }
    }
    
    /**
     * チャンネル設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateChannelConfig(newConfig) {
        Object.assign(this.channelConfig, newConfig);
        this.loggingSystem.debug('AudioChannelManager', 'Channel configuration updated', newConfig);
    }
    
    /**
     * オーディオコンテキストとの統合
     * @param {Object} audioManager - AudioManagerインスタンス
     */
    integrateWithAudioManager(audioManager) {
        try {
            if (audioManager && typeof audioManager.registerGainNodes === 'function') {
                audioManager.registerGainNodes(this.gainNodes);
            }
            
            this.loggingSystem.debug('AudioChannelManager', 'Integrated with AudioManager');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.integrateWithAudioManager');
        }
    }
    
    /**
     * チャンネルマネージャーを破棄
     */
    dispose() {
        try {
            // 設定監視を停止
            this.configWatchers.forEach(watcher => {
                if (typeof watcher === 'function') {
                    watcher(); // アンサブスクライブ
                }
            });
            this.configWatchers.clear();
            
            // ゲインノードを切断
            Object.values(this.gainNodes).forEach(gainNode => {
                if (gainNode && gainNode.disconnect) {
                    gainNode.disconnect();
                }
            });
            
            // 状態をクリア
            Object.keys(this.gainNodes).forEach(channel => {
                this.gainNodes[channel] = null;
            });
            
            this.loggingSystem.info('AudioChannelManager', 'Audio channel manager disposed');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.dispose');
        }
    }
}