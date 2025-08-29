import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

/**
 * オーディオビジュアル同期クラス
 * 
 * 音響エフェクトと視覚エフェクトの同期を管理し、
 * 統合されたフィードバック体験を提供します。
 */
export class AudioVisualSynchronizer {
    constructor() {
        this.errorHandler = getErrorHandler();
        this.configManager = getConfigurationManager();
        
        // システム参照
        this.audioManager = null;
        this.particleManager = null;
        this.effectManager = null;
        this.seasonalManager = null;
        
        // 同期設定
        this.syncEnabled = true;
        this.visualFeedbackEnabled = true;
        this.audioReactiveEffects = true;
        this.timingCompensation = 0; // ms
        
        // 音響解析
        this.audioAnalysisEnabled = false;
        this.frequencyData = null;
        this.audioContext = null;
        this.analyserNode = null;
        
        // エフェクト同期マッピング
        this.effectMappings = new Map();
        this.activeAudioEffects = new Map();
        this.scheduledEffects = [];
        
        // タイミング管理
        this.lastEffectTime = 0;
        this.effectQueue = [];
        this.maxQueueSize = 50;
        
        this._initializeAudioVisualSync();
        this._setupEffectMappings();
    }
    
    /**
     * オーディオビジュアル同期の初期化
     * @private
     */
    _initializeAudioVisualSync() {
        try {
            // 設定の読み込み
            this.syncEnabled = this.configManager.get('effects.audio.enabled', true);
            this.visualFeedbackEnabled = this.configManager.get('effects.audio.visualFeedback', true);
            this.audioReactiveEffects = this.configManager.get('effects.audio.reactive', true);
            this.timingCompensation = this.configManager.get('effects.audio.timingCompensation', 0);
            
            // Web Audio API の初期化（オプション）
            if (this.audioReactiveEffects && typeof AudioContext !== 'undefined') {
                this._initializeAudioAnalysis();
            }
            
            console.log('[AudioVisualSynchronizer] 初期化完了');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioVisualSynchronizer._initializeAudioVisualSync');
        }
    }
    
    /**
     * オーディオ解析の初期化
     * @private
     */
    _initializeAudioAnalysis() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = 256;
            this.frequencyData = new Uint8Array(this.analyserNode.frequencyBinCount);
            
            this.audioAnalysisEnabled = true;
            console.log('[AudioVisualSynchronizer] オーディオ解析初期化完了');
            
        } catch (error) {
            console.warn('[AudioVisualSynchronizer] オーディオ解析初期化失敗:', error.message);
            this.audioAnalysisEnabled = false;
        }
    }
    
    /**
     * エフェクトマッピングの設定
     * @private
     */
    _setupEffectMappings() {
        // バブル破壊エフェクトマッピング
        this.effectMappings.set('bubble_pop', {
            audioEvent: 'pop',
            visualEffects: ['particle_burst', 'screen_flash'],
            timing: {
                delay: 0,
                duration: 500,
                fadeOut: 200
            },
            parameters: {
                particleCount: 'audio_volume',
                flashIntensity: 'audio_frequency',
                colorVariation: 'audio_pitch'
            }
        });
        
        // コンボエフェクトマッピング
        this.effectMappings.set('combo_effect', {
            audioEvent: 'combo',
            visualEffects: ['combo_particles', 'screen_zoom', 'color_shift'],
            timing: {
                delay: 50,
                duration: 1000,
                fadeOut: 300
            },
            parameters: {
                particleIntensity: 'combo_count',
                zoomStrength: 'audio_bass',
                colorSaturation: 'audio_treble'
            }
        });
        
        // 特殊バブルエフェクトマッピング
        this.effectMappings.set('special_bubble', {
            audioEvent: 'special',
            visualEffects: ['lightning_effect', 'shock_wave', 'aura_glow'],
            timing: {
                delay: 25,
                duration: 750,
                fadeOut: 250
            },
            parameters: {
                lightningBranches: 'audio_volume',
                shockWaveRadius: 'audio_frequency',
                auraColor: 'bubble_type'
            }
        });
        
        // 背景音楽同期エフェクト
        this.effectMappings.set('background_sync', {
            audioEvent: 'music',
            visualEffects: ['ambient_particles', 'color_pulse', 'gentle_movement'],
            timing: {
                delay: 0,
                duration: -1, // 継続
                fadeOut: 500
            },
            parameters: {
                ambientDensity: 'audio_volume',
                pulseFrequency: 'audio_beat',
                movementSpeed: 'audio_tempo'
            }
        });
    }
    
    /**
     * システムの登録
     * @param {Object} systems - システム群
     */
    registerSystems(systems) {
        if (systems.audioManager) {
            this.audioManager = systems.audioManager;
            this._setupAudioManagerIntegration();
        }
        
        if (systems.particleManager) {
            this.particleManager = systems.particleManager;
        }
        
        if (systems.effectManager) {
            this.effectManager = systems.effectManager;
        }
        
        if (systems.seasonalManager) {
            this.seasonalManager = systems.seasonalManager;
        }
        
        console.log('[AudioVisualSynchronizer] システム登録完了');
    }
    
    /**
     * AudioManagerとの統合設定
     * @private
     */
    _setupAudioManagerIntegration() {
        if (!this.audioManager) return;
        
        // AudioManagerにオーディオ解析ノードを接続（可能な場合）
        if (this.audioAnalysisEnabled && this.analyserNode) {
            try {
                // AudioManagerの音声出力を解析ノードに接続
                this.audioManager.connectAnalyser?.(this.analyserNode);
            } catch (error) {
                console.warn('[AudioVisualSynchronizer] AudioManager統合失敗:', error.message);
            }
        }
    }
    
    /**
     * 同期エフェクトの作成
     * @param {string} effectType - エフェクトタイプ
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} parameters - パラメータ
     */
    createSyncedEffect(effectType, x, y, parameters = {}) {
        if (!this.syncEnabled) return;
        
        try {
            const mapping = this.effectMappings.get(effectType);
            if (!mapping) {
                console.warn(`[AudioVisualSynchronizer] 未知のエフェクトタイプ: ${effectType}`);
                return;
            }
            
            // オーディオエフェクトの実行
            this._executeAudioEffect(mapping.audioEvent, parameters);
            
            // 視覚エフェクトの実行（タイミング調整あり）
            if (this.visualFeedbackEnabled) {
                const delay = mapping.timing.delay + this.timingCompensation;
                
                if (delay > 0) {
                    setTimeout(() => {
                        this._executeVisualEffects(mapping, x, y, parameters);
                    }, delay);
                } else {
                    this._executeVisualEffects(mapping, x, y, parameters);
                }
            }
            
            // アクティブエフェクトの追跡
            const effectId = `${effectType}_${Date.now()}`;
            this.activeAudioEffects.set(effectId, {
                type: effectType,
                startTime: performance.now(),
                duration: mapping.timing.duration,
                parameters
            });
            
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioVisualSynchronizer.createSyncedEffect');
        }
    }
    
    /**
     * オーディオエフェクトの実行
     * @param {string} audioEvent - オーディオイベント
     * @param {Object} parameters - パラメータ
     * @private
     */
    _executeAudioEffect(audioEvent, parameters) {
        if (!this.audioManager) return;
        
        try {
            switch (audioEvent) {
                case 'pop':
                    this.audioManager.playPopSound?.(false, parameters.bubbleType);
                    break;
                case 'combo':
                    this.audioManager.playComboSound?.(parameters.comboCount);
                    break;
                case 'special':
                    this.audioManager.playSpecialSound?.(parameters.specialType);
                    break;
                case 'music':
                    // 背景音楽の調整
                    this.audioManager.adjustBackgroundMusic?.(parameters);
                    break;
            }
        } catch (error) {
            console.warn(`[AudioVisualSynchronizer] オーディオエフェクト実行失敗: ${audioEvent}`, error);
        }
    }
    
    /**
     * 視覚エフェクトの実行
     * @param {Object} mapping - エフェクトマッピング
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} parameters - パラメータ
     * @private
     */
    _executeVisualEffects(mapping, x, y, parameters) {
        const resolvedParams = this._resolveParameters(mapping.parameters, parameters);
        
        for (const visualEffect of mapping.visualEffects) {
            this._executeVisualEffect(visualEffect, x, y, resolvedParams);
        }
    }
    
    /**
     * 個別視覚エフェクトの実行
     * @param {string} effectType - エフェクトタイプ
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} parameters - パラメータ
     * @private
     */
    _executeVisualEffect(effectType, x, y, parameters) {
        try {
            switch (effectType) {
                case 'particle_burst':
                    if (this.particleManager) {
                        this.particleManager.createAdvancedBubbleEffect?.(
                            x, y, 
                            parameters.bubbleType, 
                            parameters.bubbleSize,
                            { 
                                particleCount: parameters.particleCount,
                                intensity: parameters.intensity 
                            }
                        );
                    }
                    break;
                    
                case 'screen_flash':
                    if (this.effectManager) {
                        this.effectManager.addScreenFlash?.(
                            parameters.flashIntensity || 0.1,
                            100,
                            parameters.flashColor || '#FFFFFF'
                        );
                    }
                    break;
                    
                case 'combo_particles':
                    if (this.particleManager) {
                        this.particleManager.createEnhancedComboEffect?.(
                            x, y,
                            parameters.comboCount,
                            parameters.comboType
                        );
                    }
                    break;
                    
                case 'screen_zoom':
                    if (this.effectManager) {
                        this.effectManager.addScreenZoom?.(
                            parameters.zoomStrength || 1.05,
                            parameters.zoomDuration || 200
                        );
                    }
                    break;
                    
                case 'lightning_effect':
                    if (this.particleManager) {
                        this.particleManager.createSpecialBubbleEffect?.(
                            x, y,
                            'lightning',
                            {
                                branches: parameters.lightningBranches,
                                intensity: parameters.intensity
                            }
                        );
                    }
                    break;
                    
                case 'ambient_particles':
                    if (this.seasonalManager) {
                        // 季節に応じた背景パーティクル
                        this.seasonalManager.createSeasonalBubbleEffect?.(
                            x, y,
                            'ambient',
                            parameters.ambientDensity
                        );
                    }
                    break;
            }
        } catch (error) {
            console.warn(`[AudioVisualSynchronizer] 視覚エフェクト実行失敗: ${effectType}`, error);
        }
    }
    
    /**
     * パラメータの解決
     * @param {Object} parameterMapping - パラメータマッピング
     * @param {Object} inputParameters - 入力パラメータ
     * @returns {Object} 解決されたパラメータ
     * @private
     */
    _resolveParameters(parameterMapping, inputParameters) {
        const resolved = { ...inputParameters };
        
        for (const [param, source] of Object.entries(parameterMapping)) {
            switch (source) {
                case 'audio_volume':
                    resolved[param] = this._getAudioVolume();
                    break;
                case 'audio_frequency':
                    resolved[param] = this._getAudioFrequency();
                    break;
                case 'audio_bass':
                    resolved[param] = this._getAudioBass();
                    break;
                case 'audio_treble':
                    resolved[param] = this._getAudioTreble();
                    break;
                case 'combo_count':
                    resolved[param] = Math.min(inputParameters.comboCount || 1, 20);
                    break;
                case 'bubble_type':
                    resolved[param] = inputParameters.bubbleType || 'normal';
                    break;
            }
        }
        
        return resolved;
    }
    
    /**
     * オーディオボリュームの取得
     * @returns {number} ボリュームレベル
     * @private
     */
    _getAudioVolume() {
        if (this.audioAnalysisEnabled && this.frequencyData) {
            this.analyserNode.getByteFrequencyData(this.frequencyData);
            const average = this.frequencyData.reduce((sum, value) => sum + value, 0) / this.frequencyData.length;
            return average / 255; // 0-1の範囲に正規化
        }
        return 0.5; // デフォルト値
    }
    
    /**
     * オーディオ周波数の取得
     * @returns {number} 周波数レベル
     * @private
     */
    _getAudioFrequency() {
        if (this.audioAnalysisEnabled && this.frequencyData) {
            this.analyserNode.getByteFrequencyData(this.frequencyData);
            // 中域周波数の平均
            const midRange = this.frequencyData.slice(20, 80);
            const average = midRange.reduce((sum, value) => sum + value, 0) / midRange.length;
            return average / 255;
        }
        return 0.5;
    }
    
    /**
     * オーディオ低音の取得
     * @returns {number} 低音レベル
     * @private
     */
    _getAudioBass() {
        if (this.audioAnalysisEnabled && this.frequencyData) {
            this.analyserNode.getByteFrequencyData(this.frequencyData);
            // 低域周波数の平均
            const bassRange = this.frequencyData.slice(0, 20);
            const average = bassRange.reduce((sum, value) => sum + value, 0) / bassRange.length;
            return average / 255;
        }
        return 0.5;
    }
    
    /**
     * オーディオ高音の取得
     * @returns {number} 高音レベル
     * @private
     */
    _getAudioTreble() {
        if (this.audioAnalysisEnabled && this.frequencyData) {
            this.analyserNode.getByteFrequencyData(this.frequencyData);
            // 高域周波数の平均
            const trebleRange = this.frequencyData.slice(80, 128);
            const average = trebleRange.reduce((sum, value) => sum + value, 0) / trebleRange.length;
            return average / 255;
        }
        return 0.5;
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 経過時間
     */
    update(deltaTime) {
        // アクティブエフェクトの管理
        this._updateActiveEffects(deltaTime);
        
        // スケジュールされたエフェクトの処理
        this._processScheduledEffects();
        
        // オーディオ解析データの更新
        if (this.audioAnalysisEnabled) {
            this._updateAudioAnalysis();
        }
    }
    
    /**
     * アクティブエフェクトの更新
     * @param {number} deltaTime - 経過時間
     * @private
     */
    _updateActiveEffects(deltaTime) {
        const currentTime = performance.now();
        const toRemove = [];
        
        for (const [effectId, effect] of this.activeAudioEffects) {
            const elapsed = currentTime - effect.startTime;
            
            if (effect.duration > 0 && elapsed >= effect.duration) {
                toRemove.push(effectId);
            }
        }
        
        // 完了したエフェクトを削除
        toRemove.forEach(id => {
            this.activeAudioEffects.delete(id);
        });
    }
    
    /**
     * スケジュールされたエフェクトの処理
     * @private
     */
    _processScheduledEffects() {
        const currentTime = performance.now();
        const toExecute = [];
        
        for (let i = this.scheduledEffects.length - 1; i >= 0; i--) {
            const scheduled = this.scheduledEffects[i];
            
            if (currentTime >= scheduled.executeTime) {
                toExecute.push(scheduled);
                this.scheduledEffects.splice(i, 1);
            }
        }
        
        // スケジュールされたエフェクトを実行
        toExecute.forEach(scheduled => {
            this.createSyncedEffect(
                scheduled.effectType,
                scheduled.x,
                scheduled.y,
                scheduled.parameters
            );
        });
    }
    
    /**
     * オーディオ解析データの更新
     * @private
     */
    _updateAudioAnalysis() {
        if (this.analyserNode && this.frequencyData) {
            this.analyserNode.getByteFrequencyData(this.frequencyData);
        }
    }
    
    /**
     * エフェクトのスケジュール
     * @param {string} effectType - エフェクトタイプ
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} delay - 遅延時間（ms）
     * @param {Object} parameters - パラメータ
     */
    scheduleEffect(effectType, x, y, delay, parameters = {}) {
        const executeTime = performance.now() + delay;
        
        this.scheduledEffects.push({
            effectType,
            x,
            y,
            executeTime,
            parameters
        });
        
        // キューサイズの制限
        if (this.scheduledEffects.length > this.maxQueueSize) {
            this.scheduledEffects.shift();
        }
    }
    
    /**
     * 同期の有効/無効設定
     * @param {boolean} enabled - 有効にするか
     */
    setSyncEnabled(enabled) {
        this.syncEnabled = enabled;
        this.configManager.set('effects.audio.enabled', enabled);
    }
    
    /**
     * 視覚フィードバックの有効/無効設定
     * @param {boolean} enabled - 有効にするか
     */
    setVisualFeedbackEnabled(enabled) {
        this.visualFeedbackEnabled = enabled;
        this.configManager.set('effects.audio.visualFeedback', enabled);
    }
    
    /**
     * 統計情報の取得
     * @returns {Object} 統計情報
     */
    getStats() {
        return {
            syncEnabled: this.syncEnabled,
            visualFeedbackEnabled: this.visualFeedbackEnabled,
            audioAnalysisEnabled: this.audioAnalysisEnabled,
            activeEffects: this.activeAudioEffects.size,
            scheduledEffects: this.scheduledEffects.length,
            effectMappings: this.effectMappings.size,
            currentVolume: this._getAudioVolume(),
            currentFrequency: this._getAudioFrequency()
        };
    }
    
    /**
     * リソースのクリーンアップ
     */
    dispose() {
        // スケジュールされたエフェクトをクリア
        this.scheduledEffects = [];
        
        // アクティブエフェクトをクリア
        this.activeAudioEffects.clear();
        
        // オーディオコンテキストのクリーンアップ
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close().catch(console.warn);
        }
        
        // システム参照のクリア
        this.audioManager = null;
        this.particleManager = null;
        this.effectManager = null;
        this.seasonalManager = null;
        
        console.log('[AudioVisualSynchronizer] クリーンアップ完了');
    }
}

// シングルトンインスタンスの作成と管理
let audioVisualSynchronizerInstance = null;

/**
 * AudioVisualSynchronizerのシングルトンインスタンスを取得
 * @returns {AudioVisualSynchronizer} シングルトンインスタンス
 */
export function getAudioVisualSynchronizer() {
    if (!audioVisualSynchronizerInstance) {
        audioVisualSynchronizerInstance = new AudioVisualSynchronizer();
    }
    return audioVisualSynchronizerInstance;
}