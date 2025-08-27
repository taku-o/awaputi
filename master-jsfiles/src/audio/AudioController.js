/**
 * AudioController.js (リファクタリング版)
 * 高度な音響制御システム - メインコントローラー
 * 各専用コンポーネントを統合管理
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { Equalizer } from './Equalizer.js';
import { AudioChannelManager } from './components/AudioChannelManager.js';
import { AudioVolumeController } from './components/AudioVolumeController.js';
import { AudioFormatHandler } from './components/AudioFormatHandler.js';
import { AudioComponentPerformanceMonitor } from './components/AudioComponentPerformanceMonitor.js';

/**
 * AudioController - 高度な音響制御システムのメインコントローラー
 * 音量制御、フェード、イコライザー、プリセット、環境音響、パフォーマンス監視を統合管理
 */
export class AudioController {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.audioContext = audioManager.audioContext;
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        
        // 専用コンポーネント（初期化後に設定）
        this.channelManager = null;
        this.volumeController = null;
        this.formatHandler = null;
        this.performanceMonitor = null;
        
        // レガシーシステム（互換性維持）
        this.equalizer = null;
        
        // フェード操作管理（簡易版）
        this.activeTransitions = new Map();
        
        // 設定監視のID管理
        this.configWatchers = new Set();
        
        // 統合状態
        this.isInitialized = false;
        this.initializationPromise = null;
        
        this.initialize();
    }
    
    /**
     * AudioControllerを初期化
     */
    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        this.initializationPromise = this._performInitialization();
        return this.initializationPromise;
    }
    
    /**
     * 実際の初期化処理
     */
    async _performInitialization() {
        try {
            // 専用コンポーネントを初期化
            await this.initializeComponents();
            
            // レガシーシステムを初期化（互換性）
            this.initializeLegacySystems();
            
            // 設定監視を設定
            this.setupConfigWatchers();
            
            // コンポーネント間の統合を設定
            this.setupComponentIntegration();
            
            this.isInitialized = true;
            console.log('AudioController initialized successfully');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioController.initialize');
            throw error;
        }
    }
    
    /**
     * 専用コンポーネントを初期化
     */
    async initializeComponents() {
        try {
            // チャンネルマネージャーを初期化
            this.channelManager = new AudioChannelManager(this.audioContext);
            await this.channelManager.initialize();
            
            // ボリュームコントローラーを初期化
            this.volumeController = new AudioVolumeController(this.audioContext);
            
            // フォーマットハンドラーを初期化
            this.formatHandler = new AudioFormatHandler(this.audioContext, this.audioManager);
            
            // パフォーマンス監視を初期化
            this.performanceMonitor = new AudioComponentPerformanceMonitor(this.audioContext, this.audioManager);
            
            console.log('Audio components initialized successfully');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioController.initializeComponents');
        }
    }
    
    /**
     * レガシーシステムを初期化（互換性維持）
     */
    initializeLegacySystems() {
        try {
            // イコライザーシステム
            this.equalizer = new Equalizer(this.audioContext);
            
            console.log('Legacy systems initialized for compatibility');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioController.initializeLegacySystems');
        }
    }
    
    /**
     * 設定監視を設定
     */
    setupConfigWatchers() {
        try {
            // マスター音量の監視
            const masterVolumeWatcher = this.configManager.watch('audio', 'volumes.master', (newValue) => {
                if (newValue !== undefined) {
                    this.setVolume('master', newValue, false); // 設定保存をスキップ
                }
            });
            if (masterVolumeWatcher) this.configWatchers.add(masterVolumeWatcher);
            
            console.log('Config watchers setup completed');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioController.setupConfigWatchers');
        }
    }
    
    /**
     * コンポーネント間の統合を設定
     */
    setupComponentIntegration() {
        try {
            // チャンネルマネージャーとオーディオマネージャーを統合
            if (this.channelManager) {
                this.channelManager.integrateWithAudioManager(this.audioManager);
            }
            
            // パフォーマンス監視とフォーマットハンドラーを連携
            if (this.performanceMonitor && this.formatHandler) {
                // パフォーマンスメトリクスの更新イベントを設定
                const originalUpdateMetrics = this.performanceMonitor.updatePerformanceMetrics.bind(this.performanceMonitor);
                this.performanceMonitor.updatePerformanceMetrics = () => {
                    originalUpdateMetrics();
                    const metrics = this.performanceMonitor.getCurrentMetrics();
                    this.formatHandler.updatePerformanceMetrics(metrics);
                };
            }
            
            console.log('Component integration setup completed');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioController.setupComponentIntegration');
        }
    }
    
    // ============================================================
    // 音量制御 API（チャンネルマネージャーに委譲）
    // ============================================================
    
    /**
     * 音量を設定
     * @param {string} channel - チャンネル名
     * @param {number} volume - 音量 (0.0-2.0)
     * @param {boolean} saveToConfig - 設定に保存するかどうか
     */
    setVolume(channel, volume, saveToConfig = true) {
        if (!this.channelManager) {
            console.warn('ChannelManager is not initialized');
            return 0;
        }
        return this.channelManager.setVolume(channel, volume, saveToConfig);
    }
    
    /**
     * 音量を取得
     * @param {string} channel - チャンネル名
     * @returns {number} 音量
     */
    getVolume(channel) {
        if (!this.channelManager) {
            return 0;
        }
        return this.channelManager.getVolume(channel);
    }
    
    /**
     * ミュート状態を設定
     * @param {string} channel - チャンネル名
     * @param {boolean} muted - ミュート状態
     * @param {boolean} saveToConfig - 設定に保存するかどうか
     */
    setMute(channel, muted, saveToConfig = true) {
        if (!this.channelManager) {
            console.warn('ChannelManager is not initialized');
            return false;
        }
        return this.channelManager.setMute(channel, muted, saveToConfig);
    }
    
    /**
     * ミュート状態を取得
     * @param {string} channel - チャンネル名
     * @returns {boolean} ミュート状態
     */
    getMute(channel) {
        if (!this.channelManager) {
            return false;
        }
        return this.channelManager.getMute(channel);
    }
    
    /**
     * チャンネルのゲインノードを取得
     * @param {string} channel - チャンネル名
     * @returns {GainNode} ゲインノード
     */
    getGainNode(channel) {
        if (!this.channelManager) {
            return null;
        }
        return this.channelManager.getGainNode(channel);
    }
    
    // ============================================================
    // フェード制御 API（ボリュームコントローラーに委譲）
    // ============================================================
    
    /**
     * フェードイン
     * @param {GainNode} gainNode - 対象のゲインノード
     * @param {number} duration - フェード時間（ミリ秒）
     * @param {string} curve - フェードカーブ
     * @param {Object} options - オプション
     */
    fadeIn(gainNode, duration = 1000, curve = 'linear', options = {}) {
        if (!this.volumeController) {
            console.warn('VolumeController is not initialized');
            return Promise.resolve();
        }
        return this.volumeController.fadeIn(gainNode, duration, curve, options);
    }
    
    /**
     * フェードアウト
     * @param {GainNode} gainNode - 対象のゲインノード
     * @param {number} duration - フェード時間（ミリ秒）
     * @param {string} curve - フェードカーブ
     * @param {Object} options - オプション
     */
    fadeOut(gainNode, duration = 1000, curve = 'linear', options = {}) {
        if (!this.volumeController) {
            console.warn('VolumeController is not initialized');
            return Promise.resolve();
        }
        return this.volumeController.fadeOut(gainNode, duration, curve, options);
    }
    
    /**
     * クロスフェード
     * @param {GainNode} fadeOutNode - フェードアウトするノード
     * @param {GainNode} fadeInNode - フェードインするノード
     * @param {number} duration - フェード時間（ミリ秒）
     * @param {string} curve - フェードカーブ
     */
    crossFade(fadeOutNode, fadeInNode, duration = 1000, curve = 'linear') {
        if (!this.volumeController) {
            console.warn('VolumeController is not initialized');
            return Promise.resolve();
        }
        return this.volumeController.crossFade(fadeOutNode, fadeInNode, duration, curve);
    }
    
    // ============================================================
    // イコライザー API（ボリュームコントローラーと互換性レイヤー）
    // ============================================================
    
    /**
     * イコライザーを有効/無効化
     * @param {boolean} enabled - 有効化フラグ
     */
    setEqualizerEnabled(enabled) {
        if (this.volumeController) {
            this.volumeController.setEqualizerEnabled(enabled);
        } else if (this.equalizer) {
            // レガシー互換性
            this.equalizer.setEnabled(enabled);
        }
    }
    
    /**
     * イコライザープリセットを適用
     * @param {string} presetName - プリセット名
     */
    applyEqualizerPreset(presetName) {
        if (this.volumeController) {
            this.volumeController.applyEqualizerPreset(presetName);
        } else if (this.equalizer) {
            // レガシー互換性
            this.equalizer.applyPreset(presetName);
        }
    }
    
    /**
     * イコライザープリセット一覧を取得
     * @returns {Array} プリセット名配列
     */
    getEqualizerPresets() {
        if (this.volumeController) {
            return this.volumeController.getEqualizerPresets();
        } else if (this.equalizer) {
            // レガシー互換性
            return this.equalizer.getPresets();
        }
        return [];
    }
    
    // ============================================================
    // プリセット管理 API（フォーマットハンドラーに委譲）
    // ============================================================
    
    /**
     * プリセットを適用
     * @param {string} presetId - プリセットID
     * @param {boolean} saveAsLast - 最後に使用したプリセットとして保存するか
     * @returns {boolean} 適用結果
     */
    applyPreset(presetId, saveAsLast = true) {
        if (!this.formatHandler) {
            console.warn('FormatHandler is not initialized');
            return false;
        }
        return this.formatHandler.applyPreset(presetId, saveAsLast);
    }
    
    /**
     * 現在の設定をプリセットとして保存
     * @param {string} name - プリセット名
     * @param {string} description - 説明
     * @param {Array} tags - タグ
     * @param {boolean} isTemporary - 一時プリセットか
     * @returns {string|null} 保存されたプリセットID
     */
    saveCurrentAsPreset(name, description = '', tags = [], isTemporary = false) {
        if (!this.formatHandler) {
            console.warn('FormatHandler is not initialized');
            return null;
        }
        return this.formatHandler.saveCurrentAsPreset(name, description, tags, isTemporary);
    }
    
    /**
     * プリセットを取得
     * @param {string} presetId - プリセットID
     * @returns {Object|null} プリセットデータ
     */
    getPreset(presetId) {
        if (!this.formatHandler) {
            console.warn('FormatHandler is not initialized');
            return null;
        }
        return this.formatHandler.getPreset(presetId);
    }
    
    /**
     * 全プリセットを取得
     * @param {string} filterType - フィルタータイプ
     * @returns {Array} プリセット一覧
     */
    getAllPresets(filterType = null) {
        if (!this.formatHandler) {
            console.warn('FormatHandler is not initialized');
            return [];
        }
        return this.formatHandler.getAllPresets(filterType);
    }
    
    // ============================================================
    // 環境音響 API（フォーマットハンドラーに委譲）
    // ============================================================
    
    /**
     * 環境音響を開始
     * @param {string} biomeId - バイオームID
     * @param {string} weatherId - 天候ID
     * @param {string} timeOfDay - 時間帯
     * @returns {Promise<boolean>} 開始結果
     */
    async startEnvironmentalAudio(biomeId, weatherId = 'clear', timeOfDay = 'day') {
        if (!this.formatHandler) {
            console.warn('FormatHandler is not initialized');
            return false;
        }
        return this.formatHandler.startEnvironmentalAudio(biomeId, weatherId, timeOfDay);
    }
    
    /**
     * 環境音響を停止
     * @param {number} fadeOutTime - フェードアウト時間（ミリ秒）
     */
    stopEnvironmentalAudio(fadeOutTime = 1000) {
        if (!this.formatHandler) {
            console.warn('FormatHandler is not initialized');
            return;
        }
        this.formatHandler.stopEnvironmentalAudio(fadeOutTime);
    }
    
    // ============================================================
    // 品質制御 API（フォーマットハンドラーに委譲）
    // ============================================================
    
    /**
     * 音質を設定
     * @param {number} quality - 品質レベル (0-1)
     */
    async setAudioQuality(quality) {
        if (!this.formatHandler) {
            console.warn('FormatHandler is not initialized');
            return;
        }
        return this.formatHandler.setAudioQuality(quality);
    }
    
    /**
     * 現在の音質を取得
     * @returns {number} 現在の品質レベル
     */
    getAudioQuality() {
        if (!this.formatHandler) {
            return 1.0;
        }
        return this.formatHandler.getAudioQuality();
    }
    
    /**
     * 自動品質調整を有効/無効化
     * @param {boolean} enabled - 有効化フラグ
     */
    setAutoQualityAdjustment(enabled) {
        if (!this.formatHandler) {
            console.warn('FormatHandler is not initialized');
            return;
        }
        this.formatHandler.setAutoQualityAdjustment(enabled);
    }
    
    // ============================================================
    // パフォーマンス監視 API（パフォーマンスモニターに委譲）
    // ============================================================
    
    /**
     * パフォーマンス監視を開始
     */
    startPerformanceMonitoring() {
        if (!this.performanceMonitor) {
            console.warn('PerformanceMonitor is not initialized');
            return;
        }
        this.performanceMonitor.startMonitoring();
    }
    
    /**
     * パフォーマンス監視を停止
     */
    stopPerformanceMonitoring() {
        if (!this.performanceMonitor) {
            console.warn('PerformanceMonitor is not initialized');
            return;
        }
        this.performanceMonitor.stopMonitoring();
    }
    
    /**
     * 現在のパフォーマンスメトリクスを取得
     * @returns {Object} 現在のメトリクス
     */
    getCurrentPerformanceMetrics() {
        if (!this.performanceMonitor) {
            return {};
        }
        return this.performanceMonitor.getCurrentMetrics();
    }
    
    /**
     * パフォーマンスレポートを生成
     * @returns {Object} パフォーマンスレポート
     */
    generatePerformanceReport() {
        if (!this.performanceMonitor) {
            return null;
        }
        return this.performanceMonitor.generatePerformanceReport();
    }
    
    // ============================================================
    // 統合API
    // ============================================================
    
    /**
     * オーディオコントローラーの統合ステータスを取得
     * @returns {Object} 統合ステータス
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            channels: this.channelManager ? this.channelManager.getManagerState() : null,
            volume: this.volumeController ? this.volumeController.getFadeStatus() : null,
            format: this.formatHandler ? this.formatHandler.getStatus() : null,
            performance: this.performanceMonitor ? this.performanceMonitor.getStatus() : null
        };
    }
    
    /**
     * 全体の品質パフォーマンス情報を取得
     * @returns {Object} パフォーマンス情報
     */
    getQualityPerformanceInfo() {
        if (!this.formatHandler) {
            return null;
        }
        return this.formatHandler.getQualityPerformanceInfo();
    }
    
    /**
     * 設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfiguration(newConfig) {
        try {
            if (newConfig.channels && this.channelManager) {
                this.channelManager.updateChannelConfig(newConfig.channels);
            }
            
            if (newConfig.fade && this.volumeController) {
                this.volumeController.updateFadeConfig(newConfig.fade);
            }
            
            if (newConfig.performance && this.performanceMonitor) {
                this.performanceMonitor.updateConfiguration(newConfig.performance);
            }
            
            console.log('Audio configuration updated', newConfig);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioController.updateConfiguration');
        }
    }
    
    /**
     * 全システムをリセット
     */
    reset() {
        try {
            if (this.channelManager) {
                this.channelManager.resetVolume();
                this.channelManager.resetMute();
            }
            
            if (this.volumeController) {
                this.volumeController.cancelAllFades();
                this.volumeController.resetEqualizer();
            }
            
            if (this.performanceMonitor) {
                this.performanceMonitor.reset();
            }
            
            console.log('Audio controller reset completed');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioController.reset');
        }
    }
    
    /**
     * AudioControllerを破棄
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
            
            // 専用コンポーネントを破棄
            this.channelManager?.dispose();
            this.volumeController?.dispose();
            this.formatHandler?.dispose();
            this.performanceMonitor?.dispose();
            
            // レガシーシステムを破棄
            this.equalizer?.dispose();
            
            // アクティブトランジションをクリア
            this.activeTransitions.clear();
            
            // 状態をクリア
            this.channelManager = null;
            this.volumeController = null;
            this.formatHandler = null;
            this.performanceMonitor = null;
            this.equalizer = null;
            this.isInitialized = false;
            
            console.log('AudioController disposed successfully');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioController.dispose');
        }
    }
}