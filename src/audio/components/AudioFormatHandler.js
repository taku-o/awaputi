/**
 * AudioFormatHandler.js
 * オーディオフォーマット・プリセット・環境音響処理システム
 * AudioControllerから分離されたプリセット管理・環境音響・品質制御機能
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { getConfigurationManager } from '../../core/ConfigurationManager.js';
import { LoggingSystem } from '../../core/LoggingSystem.js';
import { PresetManager } from '../PresetManager.js';
import { EnvironmentalAudioManager } from '../EnvironmentalAudioManager.js';

export class AudioFormatHandler {
    constructor(audioContext, audioManager) {
        this.audioContext = audioContext;
        this.audioManager = audioManager;
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // プリセット管理
        this.presetManager = null;
        
        // 環境音響管理
        this.environmentalAudioManager = null;
        
        // 品質管理
        this.qualityManager = {
            currentQuality: 1.0,
            targetQuality: 1.0,
            adjustmentInProgress: false,
            monitoringEnabled: false,
            adjustmentTimer: null,
            qualityLevels: {
                low: 0.25,
                medium: 0.6,
                high: 1.0
            },
            performanceMetrics: {
                cpuUsage: 0,
                memoryUsage: 0,
                audioProcessingLoad: 0,
                activeAudioNodes: 0
            }
        };
        
        // 品質調整設定
        this.qualityConfig = {
            adjustmentSteps: 10,
            adjustmentDelay: 100, // ms
            performanceThreshold: {
                high: 0.8,
                medium: 0.6,
                low: 0.4
            },
            stabilityWindow: 5000 // ms
        };
        
        this.initialize();
    }
    
    /**
     * フォーマットハンドラーを初期化
     */
    async initialize() {
        try {
            // プリセットマネージャーを初期化
            this.initializePresetManager();
            
            // 環境音響マネージャーを初期化
            this.initializeEnvironmentalAudio();
            
            // 品質管理を初期化
            this.initializeQualityManagement();
            
            this.loggingSystem.info('AudioFormatHandler', 'Audio format handler initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.initialize');
        }
    }
    
    /**
     * プリセットマネージャーを初期化
     */
    initializePresetManager() {
        try {
            this.presetManager = new PresetManager(this.audioManager);
            
            this.loggingSystem.debug('AudioFormatHandler', 'PresetManager initialized successfully');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.initializePresetManager');
        }
    }
    
    /**
     * 環境音響マネージャーを初期化
     */
    initializeEnvironmentalAudio() {
        try {
            this.environmentalAudioManager = new EnvironmentalAudioManager(
                this.audioContext,
                this.audioManager
            );
            
            this.loggingSystem.debug('AudioFormatHandler', 'Environmental audio manager initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.initializeEnvironmentalAudio');
        }
    }
    
    /**
     * 品質管理を初期化
     */
    initializeQualityManagement() {
        try {
            const audioQuality = this.configManager.get('performance', 'quality.audioQuality') || 1.0;
            const performanceLevel = this.configManager.get('performance', 'level') || 'medium';
            const adaptiveMode = this.configManager.get('performance', 'adaptive') || false;
            
            this.qualityManager.currentQuality = audioQuality;
            this.qualityManager.targetQuality = audioQuality;
            this.qualityManager.monitoringEnabled = adaptiveMode;
            
            // 設定監視
            this.setupQualityWatchers();
            
            this.loggingSystem.debug('AudioFormatHandler', `Quality management initialized: quality=${audioQuality}, level=${performanceLevel}, adaptive=${adaptiveMode}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.initializeQualityManagement');
        }
    }
    
    /**
     * 品質設定監視を設定
     */
    setupQualityWatchers() {
        try {
            const audioQualityWatcher = this.configManager.watch('performance', 'quality.audioQuality', (newValue) => {
                if (newValue !== undefined) {
                    this.setAudioQuality(newValue);
                }
            });
            
            const adaptiveModeWatcher = this.configManager.watch('performance', 'adaptive', (newValue) => {
                if (newValue !== undefined) {
                    this.qualityManager.monitoringEnabled = newValue;
                }
            });
            
            this.loggingSystem.debug('AudioFormatHandler', 'Quality watchers setup completed');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.setupQualityWatchers');
        }
    }
    
    // ============================================================
    // プリセット管理機能
    // ============================================================
    
    /**
     * プリセットを適用
     * @param {string} presetId - プリセットID
     * @param {boolean} saveAsLast - 最後に使用したプリセットとして保存するか
     * @returns {boolean} 適用結果
     */
    applyPreset(presetId, saveAsLast = true) {
        try {
            if (!this.presetManager) {
                this.loggingSystem.warn('AudioFormatHandler', 'PresetManager is not initialized');
                return false;
            }
            
            return this.presetManager.applyPreset(presetId, saveAsLast);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.applyPreset');
            return false;
        }
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
        try {
            if (!this.presetManager) {
                this.loggingSystem.warn('AudioFormatHandler', 'PresetManager is not initialized');
                return null;
            }
            
            return this.presetManager.saveCurrentAsPreset(name, description, tags, isTemporary);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.saveCurrentAsPreset');
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
                this.loggingSystem.warn('AudioFormatHandler', 'PresetManager is not initialized');
                return null;
            }
            
            return this.presetManager.getPreset(presetId);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.getPreset');
            return null;
        }
    }
    
    /**
     * 全プリセットを取得
     * @param {string} filterType - フィルタータイプ
     * @returns {Array} プリセット一覧
     */
    getAllPresets(filterType = null) {
        try {
            if (!this.presetManager) {
                this.loggingSystem.warn('AudioFormatHandler', 'PresetManager is not initialized');
                return [];
            }
            
            return this.presetManager.getAllPresets(filterType);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.getAllPresets');
            return [];
        }
    }
    
    /**
     * プリセットを削除
     * @param {string} presetId - プリセットID
     * @returns {boolean} 削除結果
     */
    deletePreset(presetId) {
        try {
            if (!this.presetManager) {
                this.loggingSystem.warn('AudioFormatHandler', 'PresetManager is not initialized');
                return false;
            }
            
            return this.presetManager.deletePreset(presetId);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.deletePreset');
            return false;
        }
    }
    
    /**
     * プリセットを更新
     * @param {string} presetId - プリセットID
     * @param {Object} updateData - 更新データ
     * @returns {boolean} 更新結果
     */
    updatePreset(presetId, updateData) {
        try {
            if (!this.presetManager) {
                this.loggingSystem.warn('AudioFormatHandler', 'PresetManager is not initialized');
                return false;
            }
            
            return this.presetManager.updatePreset(presetId, updateData);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.updatePreset');
            return false;
        }
    }
    
    /**
     * プリセットを複製
     * @param {string} sourcePresetId - 元プリセットID
     * @param {string} newName - 新しい名前
     * @param {boolean} isTemporary - 一時プリセットか
     * @returns {string|null} 新しいプリセットID
     */
    duplicatePreset(sourcePresetId, newName, isTemporary = false) {
        try {
            if (!this.presetManager) {
                this.loggingSystem.warn('AudioFormatHandler', 'PresetManager is not initialized');
                return null;
            }
            
            return this.presetManager.duplicatePreset(sourcePresetId, newName, isTemporary);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.duplicatePreset');
            return null;
        }
    }
    
    /**
     * プリセット履歴を取得
     * @returns {Array} プリセット履歴
     */
    getPresetHistory() {
        try {
            if (!this.presetManager) {
                this.loggingSystem.warn('AudioFormatHandler', 'PresetManager is not initialized');
                return [];
            }
            
            return this.presetManager.getPresetHistory();
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.getPresetHistory');
            return [];
        }
    }
    
    /**
     * 現在のプリセットを取得
     * @returns {Object|null} 現在のプリセット
     */
    getCurrentPreset() {
        try {
            if (!this.presetManager) {
                return null;
            }
            
            return this.presetManager.getCurrentPreset();
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.getCurrentPreset');
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
                this.loggingSystem.warn('AudioFormatHandler', 'PresetManager is not initialized');
                return null;
            }
            
            return this.presetManager.exportPreset(presetId);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.exportPreset');
            return null;
        }
    }
    
    /**
     * プリセットをインポート
     * @param {Object} importData - インポートデータ
     * @param {string} newName - 新しい名前
     * @returns {string|null} インポートされたプリセットID
     */
    importPreset(importData, newName = null) {
        try {
            if (!this.presetManager) {
                this.loggingSystem.warn('AudioFormatHandler', 'PresetManager is not initialized');
                return null;
            }
            
            return this.presetManager.importPreset(importData, newName);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.importPreset');
            return null;
        }
    }
    
    /**
     * プリセットマネージャーのステータスを取得
     * @returns {Object} ステータス情報
     */
    getPresetManagerStatus() {
        try {
            if (!this.presetManager) {
                return {
                    initialized: false,
                    presetCount: 0,
                    currentPreset: null,
                    lastError: 'PresetManager is not initialized'
                };
            }
            
            return this.presetManager.getStatus();
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.getPresetManagerStatus');
            return null;
        }
    }
    
    // ============================================================
    // 環境音響機能
    // ============================================================
    
    /**
     * 環境音響を開始
     * @param {string} biomeId - バイオームID
     * @param {string} weatherId - 天候ID
     * @param {string} timeOfDay - 時間帯
     * @returns {Promise<boolean>} 開始結果
     */
    async startEnvironmentalAudio(biomeId, weatherId = 'clear', timeOfDay = 'day') {
        try {
            if (!this.environmentalAudioManager) {
                this.loggingSystem.warn('AudioFormatHandler', 'Environmental audio manager not initialized');
                return false;
            }
            
            return this.environmentalAudioManager.start(biomeId, weatherId, timeOfDay);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.startEnvironmentalAudio');
            return false;
        }
    }
    
    /**
     * 環境音響を停止
     * @param {number} fadeOutTime - フェードアウト時間（ミリ秒）
     */
    stopEnvironmentalAudio(fadeOutTime = 1000) {
        try {
            if (!this.environmentalAudioManager) {
                this.loggingSystem.warn('AudioFormatHandler', 'Environmental audio manager not initialized');
                return;
            }
            
            this.environmentalAudioManager.stop(fadeOutTime);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.stopEnvironmentalAudio');
        }
    }
    
    /**
     * 環境音響の再生状態を取得
     * @returns {boolean} 再生中かどうか
     */
    isEnvironmentalAudioPlaying() {
        try {
            if (!this.environmentalAudioManager) {
                return false;
            }
            
            return this.environmentalAudioManager.isPlaying();
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.isEnvironmentalAudioPlaying');
            return false;
        }
    }
    
    /**
     * 環境音響の音量を設定
     * @param {number} volume - 音量（0-1）
     */
    setEnvironmentalAudioVolume(volume) {
        try {
            if (!this.environmentalAudioManager) {
                this.loggingSystem.warn('AudioFormatHandler', 'Environmental audio manager not initialized');
                return;
            }
            
            this.environmentalAudioManager.setVolume(volume);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.setEnvironmentalAudioVolume');
        }
    }
    
    /**
     * 環境音響の音量を取得
     * @returns {number} 音量
     */
    getEnvironmentalAudioVolume() {
        try {
            if (!this.environmentalAudioManager) {
                return 0;
            }
            
            return this.environmentalAudioManager.getVolume();
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.getEnvironmentalAudioVolume');
            return 0;
        }
    }
    
    /**
     * バイオームを変更
     * @param {string} newBiomeId - 新しいバイオームID
     * @param {number} transitionTime - トランジション時間（ミリ秒）
     * @returns {Promise<boolean>} 変更結果
     */
    async changeEnvironmentalBiome(newBiomeId, transitionTime = 2000) {
        try {
            if (!this.environmentalAudioManager) {
                this.loggingSystem.warn('AudioFormatHandler', 'Environmental audio manager not initialized');
                return false;
            }
            
            return this.environmentalAudioManager.changeBiome(newBiomeId, transitionTime);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.changeEnvironmentalBiome');
            return false;
        }
    }
    
    /**
     * 天候を変更
     * @param {string} weatherId - 天候ID
     * @param {number} transitionTime - トランジション時間（ミリ秒）
     * @returns {Promise<boolean>} 変更結果
     */
    async changeEnvironmentalWeather(weatherId, transitionTime = 1500) {
        try {
            if (!this.environmentalAudioManager) {
                this.loggingSystem.warn('AudioFormatHandler', 'Environmental audio manager not initialized');
                return false;
            }
            
            return this.environmentalAudioManager.changeWeather(weatherId, transitionTime);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.changeEnvironmentalWeather');
            return false;
        }
    }
    
    /**
     * 時間帯を変更
     * @param {string} timeOfDay - 時間帯
     * @param {number} transitionTime - トランジション時間（ミリ秒）
     * @returns {Promise<boolean>} 変更結果
     */
    async changeEnvironmentalTimeOfDay(timeOfDay, transitionTime = 3000) {
        try {
            if (!this.environmentalAudioManager) {
                this.loggingSystem.warn('AudioFormatHandler', 'Environmental audio manager not initialized');
                return false;
            }
            
            return this.environmentalAudioManager.changeTimeOfDay(timeOfDay, transitionTime);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.changeEnvironmentalTimeOfDay');
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
            this.errorHandler.handleError(error, 'AudioFormatHandler.getAvailableBiomes');
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
            this.errorHandler.handleError(error, 'AudioFormatHandler.getAvailableWeatherEffects');
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
            this.errorHandler.handleError(error, 'AudioFormatHandler.getAvailableTimesOfDay');
            return [];
        }
    }
    
    /**
     * 環境音響の現在設定を取得
     * @returns {Object} 現在設定
     */
    getEnvironmentalAudioSettings() {
        try {
            if (!this.environmentalAudioManager) {
                return {
                    biome: null,
                    weather: null,
                    timeOfDay: null,
                    volume: 0,
                    isPlaying: false
                };
            }
            
            return this.environmentalAudioManager.getCurrentSettings();
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.getEnvironmentalAudioSettings');
            return null;
        }
    }
    
    // ============================================================
    // 品質制御機能
    // ============================================================
    
    /**
     * 音質を設定
     * @param {number} quality - 品質レベル (0-1)
     */
    async setAudioQuality(quality) {
        try {
            if (quality < 0 || quality > 1) {
                throw new Error(`Audio quality must be between 0 and 1, got: ${quality}`);
            }
            
            await this.adjustAudioQuality(quality);
            
            this.loggingSystem.info('AudioFormatHandler', `Audio quality set to: ${quality}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.setAudioQuality');
        }
    }
    
    /**
     * 現在の音質を取得
     * @returns {number} 現在の品質レベル
     */
    getAudioQuality() {
        return this.qualityManager.currentQuality;
    }
    
    /**
     * 品質パフォーマンス情報を取得
     * @returns {Object} パフォーマンス情報
     */
    getQualityPerformanceInfo() {
        return {
            current: { ...this.qualityManager.performanceMetrics },
            quality: {
                current: this.qualityManager.currentQuality,
                target: this.qualityManager.targetQuality,
                adjustmentInProgress: this.qualityManager.adjustmentInProgress
            },
            monitoring: {
                enabled: this.qualityManager.monitoringEnabled,
                adjustmentTimer: this.qualityManager.adjustmentTimer !== null
            }
        };
    }
    
    /**
     * 自動品質調整を有効/無効化
     * @param {boolean} enabled - 有効化フラグ
     */
    setAutoQualityAdjustment(enabled) {
        try {
            this.qualityManager.monitoringEnabled = enabled;
            
            if (!enabled && this.qualityManager.adjustmentTimer) {
                clearTimeout(this.qualityManager.adjustmentTimer);
                this.qualityManager.adjustmentTimer = null;
            }
            
            this.configManager.set('performance', 'adaptive', enabled);
            
            this.loggingSystem.info('AudioFormatHandler', `Automatic quality adjustment ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.setAutoQualityAdjustment');
        }
    }
    
    /**
     * パフォーマンスメトリクスを更新
     * @param {Object} metrics - メトリクス
     */
    updatePerformanceMetrics(metrics) {
        try {
            if (!this.qualityManager.monitoringEnabled) {
                return;
            }
            
            Object.assign(this.qualityManager.performanceMetrics, metrics);
            
            // 自動品質調整をトリガー
            this.triggerQualityAdjustment();
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.updatePerformanceMetrics');
        }
    }
    
    /**
     * パフォーマンスメトリクスを計算
     * @returns {Object} 計算されたメトリクス
     */
    calculatePerformanceMetrics() {
        try {
            // CPU使用率の計算（簡易版）
            const processingLoad = this.qualityManager.performanceMetrics.audioProcessingLoad;
            const nodeLoad = this.qualityManager.performanceMetrics.activeAudioNodes / 20; // 20ノードで50%と仮定
            
            const totalLoad = Math.max(processingLoad, nodeLoad);
            
            return {
                ...this.qualityManager.performanceMetrics,
                totalLoad: totalLoad,
                recommendation: this.getQualityRecommendation(totalLoad)
            };
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.calculatePerformanceMetrics');
            return this.qualityManager.performanceMetrics;
        }
    }
    
    /**
     * 品質推奨値を取得
     * @param {number} load - 負荷レベル
     * @returns {string} 推奨品質レベル
     */
    getQualityRecommendation(load) {
        if (load > this.qualityConfig.performanceThreshold.high) {
            return 'low';
        } else if (load > this.qualityConfig.performanceThreshold.medium) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    /**
     * 品質調整をトリガー
     */
    triggerQualityAdjustment() {
        try {
            if (!this.qualityManager.monitoringEnabled || this.qualityManager.adjustmentInProgress) {
                return;
            }
            
            const metrics = this.qualityManager.performanceMetrics;
            const totalLoad = Math.max(
                metrics.audioProcessingLoad || 0,
                (metrics.activeAudioNodes || 0) / 20
            );
            
            // 品質レベルの決定
            let targetQuality = this.qualityManager.currentQuality;
            
            if (totalLoad > this.qualityConfig.performanceThreshold.high) {
                if (totalLoad > 0.9) {
                    targetQuality = this.qualityManager.qualityLevels.low;
                } else {
                    targetQuality = this.qualityManager.qualityLevels.medium;
                }
            } else if (totalLoad < this.qualityConfig.performanceThreshold.medium) {
                if (totalLoad < 0.3) {
                    targetQuality = this.qualityManager.qualityLevels.high;
                } else {
                    targetQuality = this.qualityManager.qualityLevels.medium;
                }
            }
            
            // 品質変更が必要かチェック
            if (Math.abs(targetQuality - this.qualityManager.currentQuality) > 0.1) {
                this.adjustAudioQuality(targetQuality);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.triggerQualityAdjustment');
        }
    }
    
    /**
     * 音質を段階的に調整
     * @param {number} targetQuality - 目標品質
     * @param {number} adjustmentSteps - 調整ステップ数
     */
    async adjustAudioQuality(targetQuality, adjustmentSteps = this.qualityConfig.adjustmentSteps) {
        try {
            if (this.qualityManager.adjustmentInProgress) {
                return;
            }
            
            this.qualityManager.adjustmentInProgress = true;
            this.qualityManager.targetQuality = targetQuality;
            
            const currentQuality = this.qualityManager.currentQuality;
            const qualityDifference = targetQuality - currentQuality;
            
            const stepSize = qualityDifference / adjustmentSteps;
            
            this.loggingSystem.debug('AudioFormatHandler', `Adjusting audio quality: ${currentQuality.toFixed(2)} -> ${targetQuality.toFixed(2)}`);
            
            // 段階的に品質を調整
            for (let step = 1; step <= adjustmentSteps; step++) {
                const intermediateQuality = currentQuality + (stepSize * step);
                await this.applyQualitySettings(intermediateQuality);
                
                if (step < adjustmentSteps) {
                    await new Promise(resolve => setTimeout(resolve, this.qualityConfig.adjustmentDelay));
                }
            }
            
            // 最終的な品質を設定に保存
            this.configManager.set('performance', 'quality.audioQuality', targetQuality);
            this.qualityManager.currentQuality = targetQuality;
            
            this.loggingSystem.info('AudioFormatHandler', `Audio quality adjustment completed: ${targetQuality.toFixed(2)}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.adjustAudioQuality');
        } finally {
            this.qualityManager.adjustmentInProgress = false;
        }
    }
    
    /**
     * 品質設定を適用
     * @param {number} quality - 品質レベル (0-1)
     */
    async applyQualitySettings(quality) {
        try {
            // サウンドエフェクトシステムの品質を調整
            if (this.audioManager.soundEffectSystem && typeof this.audioManager.soundEffectSystem.setQuality === 'function') {
                const maxVariations = Math.ceil(quality * 5); // 最大5バリエーション
                this.audioManager.soundEffectSystem.setVariationLimit(maxVariations);
                this.audioManager.soundEffectSystem.setQuality(quality);
            }
            
            // BGMシステムの品質を調整
            if (this.audioManager.bgmSystem && typeof this.audioManager.bgmSystem.setQuality === 'function') {
                this.audioManager.bgmSystem.setQuality(quality);
            }
            
            // 低品質時はいくつかの機能を無効化
            if (quality < 0.5) {
                // リバーブやエコーエフェクトを減らす
                // 同時再生数を制限
                // サンプリングレートを下げる
            }
            
            this.loggingSystem.debug('AudioFormatHandler', 'Quality settings applied', {
                quality: quality
            });
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.applyQualitySettings');
        }
    }
    
    /**
     * 品質プリセットを適用
     * @param {string} level - 品質レベル ('low', 'medium', 'high')
     */
    async applyQualityPreset(level) {
        try {
            const qualityPresets = {
                low: this.configManager.get('performance', 'quality.presets.low'),
                medium: this.configManager.get('performance', 'quality.presets.medium'),
                high: this.configManager.get('performance', 'quality.presets.high')
            };
            
            const preset = qualityPresets[level];
            if (!preset) {
                throw new Error(`Unknown quality preset: ${level}`);
            }
            
            await this.setAudioQuality(preset.audioQuality || this.qualityManager.qualityLevels[level]);
            
            this.loggingSystem.info('AudioFormatHandler', `Quality preset applied: ${level}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.applyQualityPreset');
        }
    }
    
    /**
     * フォーマットハンドラーの統合ステータスを取得
     * @returns {Object} 統合ステータス
     */
    getStatus() {
        return {
            preset: this.getPresetManagerStatus(),
            environmental: {
                initialized: this.environmentalAudioManager !== null,
                playing: this.isEnvironmentalAudioPlaying(),
                settings: this.getEnvironmentalAudioSettings(),
                ...this.environmentalAudioManager?.getStatus()
            },
            quality: this.getQualityPerformanceInfo()
        };
    }
    
    /**
     * フォーマットハンドラーを破棄
     */
    dispose() {
        try {
            // プリセットマネージャーを破棄
            if (this.presetManager) {
                this.presetManager.dispose();
                this.presetManager = null;
            }
            
            // 環境音響マネージャーを破棄
            if (this.environmentalAudioManager) {
                this.environmentalAudioManager.dispose();
                this.environmentalAudioManager = null;
            }
            
            // 品質調整タイマーをクリア
            if (this.qualityManager.adjustmentTimer) {
                clearTimeout(this.qualityManager.adjustmentTimer);
                this.qualityManager.adjustmentTimer = null;
            }
            
            // 状態をクリア
            this.qualityManager = null;
            
            this.loggingSystem.info('AudioFormatHandler', 'Audio format handler disposed');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioFormatHandler.dispose');
        }
    }
}