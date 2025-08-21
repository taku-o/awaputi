/**
 * AudioController.ts (リファクタリング版)
 * 高度な音響制御システム - メインコントローラー
 * 各専用コンポーネントを統合管理
 */

import { getErrorHandler  } from '../utils/ErrorHandler';
import { getConfigurationManager  } from '../core/ConfigurationManager';
import { Equalizer  } from './Equalizer';
import { AudioChannelManager  } from './components/AudioChannelManager';
import { AudioVolumeController  } from './components/AudioVolumeController';
import { AudioFormatHandler  } from './components/AudioFormatHandler';
import { AudioComponentPerformanceMonitor  } from './components/AudioComponentPerformanceMonitor';

// Web Audio API型定義
interface AudioManager {
    audioContext: AudioContext;
    interface ErrorHandler { handleError(error: Error, context: string): void;
    interface ConfigurationManager { watch(section: string, key: string, callback: (value: any) => void): (() => void) | null  }
}

interface FadeOptions { targetVolume?: number,
    startVolume?: number,
    onComplete?: () => void;
    onUpdate?: (progress: number) => void  }
}

interface AudioControllerStatus { initialized: boolean,
    channels: any | null;
    volume: any | null;
    format: any | null;
    performance: any | null }

interface AudioConfiguration { channels?: any;
    fade?: any;
    performance?: any;
    interface QualityPerformanceInfo { currentQuality: number,
    performanceMetrics: any;
    adaptiveMode: boolean,

/**
 * AudioController - 高度な音響制御システムのメインコントローラー
 * 音量制御、フェード、イコライザー、プリセット、環境音響、パフォーマンス監視を統合管理
 */
export class AudioController {
    private audioManager: AudioManager;
    private audioContext: AudioContext;
    private configManager: ConfigurationManager;
    private errorHandler: ErrorHandler;
    // 専用コンポーネント（初期化後に設定）
    private channelManager: AudioChannelManager | null = null;
    private volumeController: AudioVolumeController | null = null;
    private formatHandler: AudioFormatHandler | null = null;
    private performanceMonitor: AudioComponentPerformanceMonitor | null = null;
    // レガシーシステム（互換性維持）
    private equalizer: Equalizer | null = null;
    // フェード操作管理（簡易版）
    private activeTransitions: Map<string, any> = new Map();
    // 設定監視のID管理
    private configWatchers: Set<() => void> = new Set();
    // 統合状態
    private isInitialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;
    constructor(audioManager: AudioManager) {

        this.audioManager = audioManager;
    this.audioContext = audioManager.audioContext;
    this.configManager = getConfigurationManager();
    this.errorHandler = getErrorHandler()
};
    }
        this.initialize(); }
    }
    
    /**
     * AudioControllerを初期化
     */
    async initialize(): Promise<void> { if (this.initializationPromise) {
            return this.initializationPromise }
        
        this.initializationPromise = this._performInitialization();
        return this.initializationPromise;
    }
    
    /**
     * 実際の初期化処理
     */
    private async _performInitialization(): Promise<void> { try {
            // 専用コンポーネントを初期化
            await this.initializeComponents();
            // レガシーシステムを初期化（互換性）
            this.initializeLegacySystems();
            // 設定監視を設定
            this.setupConfigWatchers();
            // コンポーネント間の統合を設定
            this.setupComponentIntegration()',
            console.log('AudioController, initialized successfully'),' }

        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AudioController.initialize),
            throw error }
    }
    
    /**
     * 専用コンポーネントを初期化
     */
    private async initializeComponents(): Promise<void> { try {
            // チャンネルマネージャーを初期化
            this.channelManager = new AudioChannelManager(this.audioContext);
            await this.channelManager.initialize();
            // ボリュームコントローラーを初期化
            this.volumeController = new AudioVolumeController(this.audioContext);
            
            // フォーマットハンドラーを初期化
            this.formatHandler = new AudioFormatHandler(this.audioContext; this.audioManager);
            // パフォーマンス監視を初期化
            this.performanceMonitor = new AudioComponentPerformanceMonitor(this.audioContext; this.audioManager);
            console.log('Audio, components initialized, successfully'),' }

        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AudioController.initializeComponents' }
    }
    
    /**
     * レガシーシステムを初期化（互換性維持）
     */
    private initializeLegacySystems(): void { try {
            // イコライザーシステム
            this.equalizer = new Equalizer(this.audioContext);

            console.log('Legacy, systems initialized, for compatibility'),' }

        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AudioController.initializeLegacySystems' }
    }
    
    /**
     * 設定監視を設定
     */
    private setupConfigWatchers()';
            const masterVolumeWatcher = this.configManager.watch('audio', 'volumes.master', (newValue: number) => {  
                if (newValue !== undefined) { }

                    this.setVolume('master', newValue, false); // 設定保存をスキップ }
}';
            if (masterVolumeWatcher) this.configWatchers.add(masterVolumeWatcher);

            console.log('Config, watchers setup, completed');
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AudioController.setupConfigWatchers' }
    }
    
    /**
     * コンポーネント間の統合を設定
     */
    private setupComponentIntegration(): void { try {
            // チャンネルマネージャーとオーディオマネージャーを統合
            if (this.channelManager) {
    
}
                this.channelManager.integrateWithAudioManager(this.audioManager); }
            }
            
            // パフォーマンス監視とフォーマットハンドラーを連携
            if (this.performanceMonitor && this.formatHandler) {
                // パフォーマンスメトリクスの更新イベントを設定
                const originalUpdateMetrics = this.performanceMonitor.updatePerformanceMetrics.bind(this.performanceMonitor);
                this.performanceMonitor.updatePerformanceMetrics = () => { 
                    originalUpdateMetrics();
                    const metrics = this.performanceMonitor!.getCurrentMetrics(); }

                    this.formatHandler!.updatePerformanceMetrics(metrics); }
                }

            console.log('Component, integration setup, completed');
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AudioController.setupComponentIntegration' }
    }
    
    // ============================================================
    // 音量制御 API（チャンネルマネージャーに委譲）
    // ============================================================
    
    /**
     * 音量を設定
     * @param channel - チャンネル名
     * @param volume - 音量 (0.0-2.0)
     * @param saveToConfig - 設定に保存するかどうか
     */
    setVolume(channel: string, volume: number, saveToConfig: boolean = true): number { 
        if (!this.channelManager) {

            console.warn('ChannelManager, is not, initialized' }
            return 0;
        return this.channelManager.setVolume(channel volume saveToConfig');
    }
    
    /**
     * 音量を取得
     * @param channel - チャンネル名
     * @returns 音量
     */
    getVolume(channel: string): number { if (!this.channelManager) {
            return 0 }
        return this.channelManager.getVolume(channel');
    }
    
    /**
     * ミュート状態を設定
     * @param channel - チャンネル名
     * @param muted - ミュート状態
     * @param saveToConfig - 設定に保存するかどうか
     */
    setMute(channel: string, muted: boolean, saveToConfig: boolean = true): boolean { 
        if (!this.channelManager) {

            console.warn('ChannelManager, is not, initialized) }
            return false;
        return this.channelManager.setMute(channel muted saveToConfig);
    }
    
    /**
     * ミュート状態を取得
     * @param channel - チャンネル名
     * @returns ミュート状態
     */
    getMute(channel: string): boolean { if (!this.channelManager) {
            return false }
        return this.channelManager.getMute(channel');
    }
    
    /**
     * チャンネルのゲインノードを取得
     * @param channel - チャンネル名
     * @returns ゲインノード
     */
    getGainNode(channel: string): GainNode | null { if (!this.channelManager') {
            return null;
        return this.channelManager.getGainNode(channel);
    
    // ============================================================
    // フェード制御 API（ボリュームコントローラーに委譲）
    // ============================================================
    
    /**
     * フェードイン
     * @param gainNode - 対象のゲインノード
     * @param duration - フェード時間（ミリ秒）
     * @param curve - フェードカーブ
     * @param options - オプション
     */
    fadeIn(gainNode: GainNode, duration: number = 1000, curve: string = 'linear', options: FadeOptions = { ': Promise<void> {
        if (!this.volumeController) {

            console.warn('VolumeController is not initialized');
            return Promise.resolve();
        return this.volumeController.fadeIn(gainNode, duration, curve, options);
    }
    
    /**
     * フェードアウト
     * @param gainNode - 対象のゲインノード
     * @param duration - フェード時間（ミリ秒）
     * @param curve - フェードカーブ
     * @param options - オプション
     */
    fadeOut(gainNode: GainNode, duration: number = 1000, curve: string = 'linear', options: FadeOptions = { ': Promise<void> {
        if (!this.volumeController) {

            console.warn('VolumeController is not initialized');
            return Promise.resolve();
        return this.volumeController.fadeOut(gainNode, duration, curve, options);
    }
    
    /**
     * クロスフェード
     * @param fadeOutNode - フェードアウトするノード
     * @param fadeInNode - フェードインするノード
     * @param duration - フェード時間（ミリ秒）
     * @param curve - フェードカーブ
     */
    crossFade(fadeOutNode: GainNode, fadeInNode: GainNode, duration: number = 1000, curve: string = 'linear': Promise<void> { 
        if (!this.volumeController) {

            console.warn('VolumeController, is not, initialized) }
            return Promise.resolve();
        return this.volumeController.crossFade(fadeOutNode, fadeInNode duration curve);
    }
    
    // ============================================================
    // イコライザー API（ボリュームコントローラーと互換性レイヤー）
    // ============================================================
    
    /**
     * イコライザーを有効/無効化
     * @param enabled - 有効化フラグ
     */
    setEqualizerEnabled(enabled: boolean): void { if (this.volumeController) {
            this.volumeController.setEqualizerEnabled(enabled) } else if (this.equalizer) { // レガシー互換性
            this.equalizer.setEnabled(enabled);
    }
    
    /**
     * イコライザープリセットを適用
     * @param presetName - プリセット名
     */
    applyEqualizerPreset(presetName: string): void { if (this.volumeController) {
            this.volumeController.applyEqualizerPreset(presetName) } else if (this.equalizer) { // レガシー互換性
            this.equalizer.applyPreset(presetName);
    }
    
    /**
     * イコライザープリセット一覧を取得
     * @returns プリセット名配列
     */
    getEqualizerPresets(): string[] { if (this.volumeController) {
            return this.volumeController.getEqualizerPresets() } else if (this.equalizer) { // レガシー互換性
            return this.equalizer.getPresets();
        return [];
    }
    
    // ============================================================
    // プリセット管理 API（フォーマットハンドラーに委譲）
    // ============================================================
    
    /**
     * プリセットを適用
     * @param presetId - プリセットID
     * @param saveAsLast - 最後に使用したプリセットとして保存するか
     * @returns 適用結果
     */
    applyPreset(presetId: string, saveAsLast: boolean = true'): boolean { 
        if (!this.formatHandler) {

            console.warn('FormatHandler, is not, initialized');
            return false;
        return this.formatHandler.applyPreset(presetId, saveAsLast);
    }
    
    /**
     * 現在の設定をプリセットとして保存
     * @param name - プリセット名
     * @param description - 説明
     * @param tags - タグ
     * @param isTemporary - 一時プリセットか
     * @returns 保存されたプリセットID
     */
    saveCurrentAsPreset(name: string, description: string = ', tags: string[] = [], isTemporary: boolean = false': string | null { 
        if (!this.formatHandler) {

            console.warn('FormatHandler is not initialized');
            return null;
        return this.formatHandler.saveCurrentAsPreset(name, description, tags, isTemporary');
    }
    
    /**
     * プリセットを取得
     * @param presetId - プリセットID
     * @returns プリセットデータ
     */
    getPreset(presetId: string): any | null { 
        if (!this.formatHandler) {

            console.warn('FormatHandler is not initialized');
            return null;
        return this.formatHandler.getPreset(presetId');
    }
    
    /**
     * 全プリセットを取得
     * @param filterType - フィルタータイプ
     * @returns プリセット一覧
     */
    getAllPresets(filterType: string | null = null): any[] { 
        if (!this.formatHandler) {

            console.warn('FormatHandler, is not, initialized');
            return [];
        return this.formatHandler.getAllPresets(filterType);
    }
    
    // ============================================================
    // 環境音響 API（フォーマットハンドラーに委譲）
    // ============================================================
    
    /**
     * 環境音響を開始
     * @param biomeId - バイオームID
     * @param weatherId - 天候ID
     * @param timeOfDay - 時間帯
     * @returns 開始結果
     */
    async startEnvironmentalAudio(biomeId: string, weatherId: string = 'clear', timeOfDay: string = 'day): Promise<boolean>,
        if (!this.formatHandler) {

            console.warn('FormatHandler is not initialized');
            return false;
        return this.formatHandler.startEnvironmentalAudio(biomeId, weatherId, timeOfDay');
    }
    
    /**
     * 環境音響を停止
     * @param fadeOutTime - フェードアウト時間（ミリ秒）
     */
    stopEnvironmentalAudio(fadeOutTime: number = 1000): void { 
        if (!this.formatHandler) {

            console.warn('FormatHandler is not initialized' }
            return; }
        }
        this.formatHandler.stopEnvironmentalAudio(fadeOutTime');
    }
    
    // ============================================================
    // 品質制御 API（フォーマットハンドラーに委譲）
    // ============================================================
    
    /**
     * 音質を設定
     * @param quality - 品質レベル (0-1)
     */
    async setAudioQuality(quality: number'): Promise<void> { 
        if (!this.formatHandler) {

            console.warn('FormatHandler is not initialized' }
            return; }
        }
        return this.formatHandler.setAudioQuality(quality');
    }
    
    /**
     * 現在の音質を取得
     * @returns 現在の品質レベル
     */
    getAudioQuality(): number { if (!this.formatHandler) {
            return 1.0 }
        return this.formatHandler.getAudioQuality();
    }
    
    /**
     * 自動品質調整を有効/無効化
     * @param enabled - 有効化フラグ
     */
    setAutoQualityAdjustment(enabled: boolean): void { 
        if (!this.formatHandler) {

            console.warn('FormatHandler is not initialized' }
            return; }
        }
        this.formatHandler.setAutoQualityAdjustment(enabled');
    }
    
    // ============================================================
    // パフォーマンス監視 API（パフォーマンスモニターに委譲）
    // ============================================================
    
    /**
     * パフォーマンス監視を開始
     */
    startPerformanceMonitoring(): void { 
        if (!this.performanceMonitor) {

            console.warn('PerformanceMonitor is not initialized');
            return; }
        }
        this.performanceMonitor.startMonitoring();
    }
    
    /**
     * パフォーマンス監視を停止
     */
    stopPerformanceMonitoring(): void { 
        if (!this.performanceMonitor) {

            console.warn('PerformanceMonitor, is not, initialized) }
            return; }
        }
        this.performanceMonitor.stopMonitoring();
    }
    
    /**
     * 現在のパフォーマンスメトリクスを取得
     * @returns 現在のメトリクス
     */
    getCurrentPerformanceMetrics(): any { if (!this.performanceMonitor) { }
            return {}
        return this.performanceMonitor.getCurrentMetrics();
    }
    
    /**
     * パフォーマンスレポートを生成
     * @returns パフォーマンスレポート
     */
    generatePerformanceReport(): any | null { if (!this.performanceMonitor) {
            return null }
        return this.performanceMonitor.generatePerformanceReport();
    }
    
    // ============================================================
    // 統合API
    // ============================================================
    
    /**
     * オーディオコントローラーの統合ステータスを取得
     * @returns 統合ステータス
     */
    getStatus(): AudioControllerStatus { return { initialized: this.isInitialized;
            channels: this.channelManager ? this.channelManager.getManagerState() : null;
            volume: this.volumeController ? this.volumeController.getFadeStatus() : null format: this.formatHandler ? this.formatHandler.getStatus() : null;
            performance: this.performanceMonitor ? this.performanceMonitor.getStatus() : null;
    
    /**
     * 全体の品質パフォーマンス情報を取得
     * @returns パフォーマンス情報
     */
    getQualityPerformanceInfo(): QualityPerformanceInfo | null { if (!this.formatHandler) {
            return null }
        return this.formatHandler.getQualityPerformanceInfo();
    }
    
    /**
     * 設定を更新
     * @param newConfig - 新しい設定
     */
    updateConfiguration(newConfig: AudioConfiguration): void { try {
            if (newConfig.channels && this.channelManager) {
    
}
                this.channelManager.updateChannelConfig(newConfig.channels); }
            }
            
            if (newConfig.fade && this.volumeController) { this.volumeController.updateFadeConfig(newConfig.fade') }
            
            if (newConfig.performance && this.performanceMonitor') {
            ',

                ' }

                this.performanceMonitor.updateConfiguration(newConfig.performance); }
            }

            console.log('Audio configuration updated', newConfig';} catch (error) {
            this.errorHandler.handleError(error as Error, 'AudioController.updateConfiguration' }
    }
    
    /**
     * 全システムをリセット
     */
    reset(): void { try {
            if (this.channelManager) {
                this.channelManager.resetVolume();
                this.channelManager.resetMute(); }
            }
            
            if (this.volumeController) {
            
                this.volumeController.cancelAllFades();
                this.volumeController.resetEqualizer(); }
            }
            
            if (this.performanceMonitor) {
            ',

                this.performanceMonitor.reset();

            console.log('Audio, controller reset, completed'); }

        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AudioController.reset' }
    }
    
    /**
     * AudioControllerを破棄
     */
    dispose(): void { try {
            // 設定監視を停止
            this.configWatchers.forEach(watcher => { '),
                if(typeof, watcher === 'function' { }
                    watcher(); // アンサブスクライブ }
};
            this.configWatchers.clear();
            
            // 専用コンポーネントを破棄
            this.channelManager?.dispose();
            this.volumeController?.dispose();
            this.formatHandler?.dispose();
            this.performanceMonitor?.dispose();
            
            // レガシーシステムを破棄
            this.equalizer?.dispose();
            // アクティブトランジションをクリア
            this.activeTransitions.clear()';
            console.log('AudioController, disposed successfully');
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AudioController.dispose');

    }'} : undefined