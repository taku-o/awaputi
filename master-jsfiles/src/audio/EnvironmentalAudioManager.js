/**
 * EnvironmentalAudioManager - 環境音管理システム（メインコントローラー）
 * 
 * Main Controller Patternにより、専門化されたコンポーネントを統制します。
 * ゲーム世界の雰囲気を高める背景音（風、水、自然音等）を生成・管理
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { BiomeDefinitionManager } from './environmental-audio-manager/BiomeDefinitionManager.js';
import { EnvironmentalSoundGenerator } from './environmental-audio-manager/EnvironmentalSoundGenerator.js';
import { BiomeTransitionController } from './environmental-audio-manager/BiomeTransitionController.js';
import { EnvironmentalAudioSettings } from './environmental-audio-manager/EnvironmentalAudioSettings.js';

export class EnvironmentalAudioManager {
    constructor(audioController) {
        this.audioController = audioController;
        this.audioContext = audioController?.audioContext || null;
        this.configManager = getConfigurationManager();
        
        // 現在のバイオーム
        this.currentBiome = null;
        
        // AudioContextが利用可能な場合のみ専門化されたコンポーネントを初期化
        if (this.audioContext) {
            // 専門化されたコンポーネントを初期化
            this.biomeDefinitionManager = new BiomeDefinitionManager();
            this.soundGenerator = new EnvironmentalSoundGenerator(this.audioContext);
            this.transitionController = new BiomeTransitionController(
                this.audioContext,
                this.audioController,
                this.soundGenerator,
                this.biomeDefinitionManager
            );
            this.settings = new EnvironmentalAudioSettings(this.configManager);
            
            this.initialize();
        } else {
            console.warn('[EnvironmentalAudioManager] AudioContext not available - environmental audio disabled');
            this.disabled = true;
        }
    }
    
    /**
     * 環境音管理システムを初期化
     */
    initialize() {
        try {
            if (!this.audioContext) {
                console.warn('[EnvironmentalAudioManager] AudioContext not available during initialization - skipping');
                return false;
            }
            
            // 基本環境音を生成
            this.soundGenerator.generateBasicEnvironmentalSounds();
            
            console.log('EnvironmentalAudioManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'initialize',
                component: 'EnvironmentalAudioManager'
            });
        }
    }
    
    /**
     * 環境音を有効/無効に設定
     */
    setEnabled(enabled) {
        if (this.disabled) {
            console.warn('[EnvironmentalAudioManager] Environmental audio is disabled - setEnabled ignored');
            return;
        }
        
        this.settings.setEnabled(enabled, (enabled, wasEnabled) => {
            if (enabled && !wasEnabled) {
                // 環境音を開始
                this._startCurrentEnvironment();
            } else if (!enabled && wasEnabled) {
                // 環境音を停止
                this.transitionController.stopAllEnvironmental();
            }
        });
    }
    
    /**
     * 環境音音量を設定
     */
    setVolume(volume) {
        if (this.disabled) {
            console.warn('[EnvironmentalAudioManager] Environmental audio is disabled - setVolume ignored');
            return;
        }
        
        this.settings.setVolume(volume, (volume) => {
            // アクティブな環境音の音量を更新
            this.transitionController.updateVolume(volume);
        });
    }
    
    /**
     * フェード時間を設定
     */
    setFadeTime(fadeTime) {
        if (this.disabled) {
            console.warn('[EnvironmentalAudioManager] Environmental audio is disabled - setFadeTime ignored');
            return;
        }
        
        this.settings.setFadeTime(fadeTime);
    }
    
    /**
     * バイオームブレンディングを設定
     */
    setBiomeBlending(enabled) {
        if (this.disabled) {
            console.warn('[EnvironmentalAudioManager] Environmental audio is disabled - setBiomeBlending ignored');
            return;
        }
        
        this.settings.setBiomeBlending(enabled);
    }
    
    /**
     * 天候効果を設定
     */
    setWeatherEffects(enabled) {
        if (this.disabled) {
            console.warn('[EnvironmentalAudioManager] Environmental audio is disabled - setWeatherEffects ignored');
            return;
        }
        
        this.settings.setWeatherEffects(enabled);
    }
    
    /**
     * 時間帯バリエーションを設定
     */
    setTimeOfDayVariation(enabled) {
        if (this.disabled) {
            console.warn('[EnvironmentalAudioManager] Environmental audio is disabled - setTimeOfDayVariation ignored');
            return;
        }
        
        this.settings.setTimeOfDayVariation(enabled);
    }
    
    /**
     * バイオームを設定
     */
    setBiome(biomeId, options = {}) {
        if (this.disabled) {
            console.warn('[EnvironmentalAudioManager] Environmental audio is disabled - setBiome ignored');
            return;
        }
        
        try {
            const biome = this.biomeDefinitionManager.getBiome(biomeId);
            if (!biome) {
                throw new Error(`Unknown biome: ${biomeId}`);
            }
            
            const {
                fadeTime = this.settings.getSettings().fadeTime,
                weather = null,
                timeOfDay = 'day',
                intensity = 1.0
            } = options;
            
            console.log(`Setting biome to: ${biome.name}`);
            
            if (this.settings.getSettings().enabled) {
                this.transitionController.transitionToBiome(biome, { 
                    fadeTime, 
                    weather: this.settings.getSettings().weatherEffects ? weather : null, 
                    timeOfDay: this.settings.getSettings().timeOfDayVariation ? timeOfDay : null, 
                    intensity 
                });
            }
            
            // 現在のバイオームを記録
            this.currentBiome = biomeId;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'setBiome',
                component: 'EnvironmentalAudioManager',
                biomeId: biomeId
            });
        }
    }
    
    /**
     * 現在の環境音を開始
     * @private
     */
    _startCurrentEnvironment() {
        try {
            if (this.currentBiome) {
                this.setBiome(this.currentBiome);
            } else {
                // デフォルトバイオームを設定
                this.setBiome('forest');
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_startCurrentEnvironment',
                component: 'EnvironmentalAudioManager'
            });
        }
    }
    
    /**
     * 利用可能なバイオーム一覧を取得
     */
    getAvailableBiomes() {
        if (this.disabled) {
            console.warn('[EnvironmentalAudioManager] Environmental audio is disabled - returning empty array');
            return [];
        }
        
        try {
            return this.biomeDefinitionManager.getAvailableBiomes();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'getAvailableBiomes',
                component: 'EnvironmentalAudioManager'
            });
            return [];
        }
    }
    
    /**
     * 利用可能な天候効果一覧を取得
     */
    getAvailableWeatherEffects() {
        if (this.disabled) {
            console.warn('[EnvironmentalAudioManager] Environmental audio is disabled - returning empty array');
            return [];
        }
        
        try {
            return this.biomeDefinitionManager.getAvailableWeatherEffects();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'getAvailableWeatherEffects',
                component: 'EnvironmentalAudioManager'
            });
            return [];
        }
    }
    
    /**
     * 利用可能な時間帯バリエーション一覧を取得
     */
    getAvailableTimeVariations() {
        if (this.disabled) {
            console.warn('[EnvironmentalAudioManager] Environmental audio is disabled - returning empty array');
            return [];
        }
        
        try {
            return this.biomeDefinitionManager.getAvailableTimeVariations();
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'getAvailableTimeVariations',
                component: 'EnvironmentalAudioManager'
            });
            return [];
        }
    }
    
    /**
     * システム状態を取得
     */
    getStatus() {
        if (this.disabled) {
            return {
                enabled: false,
                disabled: true,
                reason: 'AudioContext not available',
                currentBiome: null,
                activeLayers: 0,
                availableBiomes: 0,
                availableWeatherEffects: 0,
                generatedSounds: 0
            };
        }
        
        const additionalData = {
            currentBiome: this.currentBiome,
            activeLayers: this.transitionController.getActiveLayerCount(),
            availableBiomes: this.biomeDefinitionManager.getAvailableBiomes().length,
            availableWeatherEffects: this.biomeDefinitionManager.getAvailableWeatherEffects().length,
            generatedSounds: this.soundGenerator.getBufferCount()
        };
        
        // パフォーマンスデータを更新
        this.settings.updatePerformanceData(
            this.transitionController.getActiveLayerCount(),
            0, // CPU使用率（実装により計測）
            0  // メモリ使用量（実装により計測）
        );
        
        return this.settings.getStatus(additionalData);
    }
    
    /**
     * アクティブレイヤー情報を取得
     */
    getActiveLayerInfo() {
        if (this.disabled) {
            console.warn('[EnvironmentalAudioManager] Environmental audio is disabled - returning empty layer info');
            return [];
        }
        
        return this.transitionController.getActiveLayerInfo();
    }
    
    /**
     * 設定を取得
     */
    getSettings() {
        if (this.disabled) {
            return {
                enabled: false,
                volume: 0,
                fadeTime: 0,
                biomeBlending: false,
                weatherEffects: false,
                timeOfDayVariation: false
            };
        }
        
        return this.settings.getSettings();
    }
    
    /**
     * パフォーマンスデータを取得
     */
    getPerformanceData() {
        if (this.disabled) {
            return {
                activeLayers: 0,
                cpuUsage: 0,
                memoryUsage: 0,
                averageLatency: 0
            };
        }
        
        return this.settings.getPerformanceData();
    }
    
    /**
     * すべての設定を保存
     */
    saveAllSettings() {
        if (this.disabled) {
            console.warn('[EnvironmentalAudioManager] Environmental audio is disabled - settings not saved');
            return;
        }
        
        this.settings.saveAllSettings();
    }
    
    /**
     * 設定をリセット
     */
    resetSettings() {
        if (this.disabled) {
            console.warn('[EnvironmentalAudioManager] Environmental audio is disabled - settings not reset');
            return;
        }
        
        this.settings.resetSettings();
    }
    
    /**
     * リソースの解放
     */
    dispose() {
        try {
            if (!this.disabled) {
                // 設定監視の解除
                this.settings.dispose();
                
                // アクティブな環境音を停止
                this.transitionController.stopAllEnvironmental();
                
                // バッファをクリア
                this.soundGenerator.clearBuffers();
            }
            
            console.log('EnvironmentalAudioManager disposed');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'dispose',
                component: 'EnvironmentalAudioManager'
            });
        }
    }
}