import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * BiomeTransitionController - バイオーム遷移制御システム
 * 
 * バイオーム間の遷移、フェード処理、レイヤー管理を専門的に行います
 */
export class BiomeTransitionController {
    constructor(audioContext, audioController, soundGenerator, biomeDefinitionManager) {
        this.audioContext = audioContext;
        this.audioController = audioController;
        this.soundGenerator = soundGenerator;
        this.biomeDefinitionManager = biomeDefinitionManager;
        
        // アクティブな環境音源
        this.activeSources = new Map();
        
        // フェード管理
        this.fadeManager = {
            activeTransitions: new Map(),
            crossfadeInProgress: false
        };
    }
    
    /**
     * バイオームへの遷移を実行
     */
    async transitionToBiome(biome, options = {}) {
        try {
            const { fadeTime, weather, timeOfDay, intensity } = options;
            
            // 現在の環境音をフェードアウト
            await this._fadeOutCurrentEnvironment(fadeTime);
            
            // 新しい環境音レイヤーを準備
            const newLayers = this._prepareBiomeLayers(biome, { weather, timeOfDay, intensity });
            
            // 新しい環境音をフェードイン
            await this._fadeInEnvironment(newLayers, fadeTime);
            
            console.log(`Biome transition completed: ${biome.name}`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'transitionToBiome',
                component: 'BiomeTransitionController',
                biome: biome.name
            });
        }
    }
    
    /**
     * バイオームレイヤーを準備
     * @private
     */
    _prepareBiomeLayers(biome, options = {}) {
        try {
            const { weather, timeOfDay, intensity } = options;
            const preparedLayers = [];
            
            // 基本レイヤーを準備
            for (const layer of biome.layers) {
                const layerData = {
                    ...layer,
                    biomeId: biome.id,
                    volume: layer.volume * intensity,
                    audioBuffer: this.soundGenerator.getOrGenerateSound(layer.type)
                };
                
                preparedLayers.push(layerData);
            }
            
            // 天候効果を追加
            if (weather) {
                const weatherEffect = this.biomeDefinitionManager.getWeatherEffect(weather);
                if (weatherEffect) {
                    const weatherLayer = this._prepareWeatherLayer(weatherEffect, biome);
                    if (weatherLayer) {
                        preparedLayers.push(weatherLayer);
                    }
                }
            }
            
            // 時間帯バリエーションを追加
            if (timeOfDay) {
                const timeVariation = this.biomeDefinitionManager.getTimeVariation(timeOfDay);
                if (timeVariation && timeVariation.additionalLayers) {
                    for (const timeLayer of timeVariation.additionalLayers) {
                        if (timeLayer.biomes.includes('all') || timeLayer.biomes.includes(biome.id)) {
                            const layerData = {
                                ...timeLayer,
                                biomeId: biome.id,
                                timeOfDay: timeOfDay,
                                audioBuffer: this.soundGenerator.getOrGenerateSound(timeLayer.type)
                            };
                            preparedLayers.push(layerData);
                        }
                    }
                }
            }
            
            return preparedLayers;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_prepareBiomeLayers',
                component: 'BiomeTransitionController'
            });
            return [];
        }
    }
    
    /**
     * 天候レイヤーを準備
     * @private
     */
    _prepareWeatherLayer(weatherEffect, biome) {
        try {
            const soundProfile = weatherEffect.soundProfile;
            const biomeModifier = weatherEffect.biomeModifiers[biome.id] || { volumeMultiplier: 1.0, filterMultiplier: 1.0 };
            
            return {
                name: `${weatherEffect.name} (${biome.name})`,
                type: soundProfile.type,
                volume: soundProfile.volume * biomeModifier.volumeMultiplier * weatherEffect.intensity,
                frequency: soundProfile.frequency,
                filterCutoff: soundProfile.filterCutoff * biomeModifier.filterMultiplier,
                reverb: soundProfile.reverb,
                biomeId: biome.id,
                weather: weatherEffect.id,
                audioBuffer: this.soundGenerator.getOrGenerateSound(soundProfile.type)
            };
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_prepareWeatherLayer',
                component: 'BiomeTransitionController'
            });
            return null;
        }
    }
    
    /**
     * 現在の環境音をフェードアウト
     * @private
     */
    async _fadeOutCurrentEnvironment(fadeTime = 2.0) {
        try {
            const fadePromises = [];
            
            for (const [layerId, source] of this.activeSources) {
                if (source.gainNode) {
                    const promise = new Promise((resolve) => {
                        source.gainNode.gain.setTargetAtTime(
                            0,
                            this.audioContext.currentTime,
                            fadeTime / 3
                        );
                        
                        setTimeout(() => {
                            try {
                                source.sourceNode.stop();
                                source.sourceNode.disconnect();
                                source.gainNode.disconnect();
                                if (source.filterNode) {
                                    source.filterNode.disconnect();
                                }
                            } catch (e) {
                                // Already stopped
                            }
                            resolve();
                        }, fadeTime * 1000);
                    });
                    
                    fadePromises.push(promise);
                }
            }
            
            await Promise.all(fadePromises);
            this.activeSources.clear();
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_fadeOutCurrentEnvironment',
                component: 'BiomeTransitionController'
            });
        }
    }
    
    /**
     * 環境音をフェードイン
     * @private
     */
    async _fadeInEnvironment(layers, fadeTime = 2.0) {
        try {
            for (const layer of layers) {
                if (!layer.audioBuffer) continue;
                
                // AudioBufferSourceNodeを作成
                const sourceNode = this.audioContext.createBufferSource();
                sourceNode.buffer = layer.audioBuffer;
                sourceNode.loop = true;
                
                // GainNodeを作成
                const gainNode = this.audioContext.createGain();
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                
                // フィルターを適用（必要に応じて）
                let filterNode = null;
                if (layer.filterCutoff) {
                    filterNode = this.audioContext.createBiquadFilter();
                    filterNode.type = 'lowpass';
                    filterNode.frequency.value = layer.filterCutoff;
                }
                
                // 接続
                sourceNode.connect(gainNode);
                if (filterNode) {
                    gainNode.connect(filterNode);
                    filterNode.connect(this.audioController.gainNodes.bgm || this.audioContext.destination);
                } else {
                    gainNode.connect(this.audioController.gainNodes.bgm || this.audioContext.destination);
                }
                
                // 再生開始
                sourceNode.start();
                
                // フェードイン
                const targetVolume = (layer.volume || 0.5);
                gainNode.gain.setTargetAtTime(
                    targetVolume,
                    this.audioContext.currentTime,
                    fadeTime / 3
                );
                
                // アクティブソースに追加
                const layerId = `${layer.biomeId}_${layer.name}_${Date.now()}`;
                this.activeSources.set(layerId, {
                    sourceNode,
                    gainNode,
                    filterNode,
                    originalVolume: layer.volume || 0.5,
                    layer: layer
                });
            }
            
            console.log(`Faded in ${layers.length} environmental layers`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_fadeInEnvironment',
                component: 'BiomeTransitionController'
            });
        }
    }
    
    /**
     * すべての環境音を停止
     */
    stopAllEnvironmental() {
        try {
            for (const [layerId, source] of this.activeSources) {
                try {
                    source.sourceNode.stop();
                    source.sourceNode.disconnect();
                    source.gainNode.disconnect();
                    if (source.filterNode) {
                        source.filterNode.disconnect();
                    }
                } catch (e) {
                    // Already stopped
                }
            }
            
            this.activeSources.clear();
            console.log('All environmental audio stopped');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'stopAllEnvironmental',
                component: 'BiomeTransitionController'
            });
        }
    }
    
    /**
     * アクティブソースの音量を更新
     */
    updateVolume(globalVolume) {
        try {
            for (const [layerId, source] of this.activeSources) {
                if (source.gainNode) {
                    source.gainNode.gain.setValueAtTime(
                        globalVolume * (source.originalVolume || 1.0),
                        this.audioContext.currentTime
                    );
                }
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'updateVolume',
                component: 'BiomeTransitionController'
            });
        }
    }
    
    /**
     * アクティブレイヤー数を取得
     */
    getActiveLayerCount() {
        return this.activeSources.size;
    }
    
    /**
     * アクティブレイヤー情報を取得
     */
    getActiveLayerInfo() {
        const layers = [];
        for (const [layerId, source] of this.activeSources) {
            layers.push({
                id: layerId,
                name: source.layer.name,
                type: source.layer.type,
                volume: source.originalVolume,
                biomeId: source.layer.biomeId
            });
        }
        return layers;
    }
}