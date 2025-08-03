import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * BiomeDefinitionManager - バイオーム定義管理システム
 * 
 * バイオーム、天候効果、時間帯バリエーションの定義と管理を専門的に行います
 */
export class BiomeDefinitionManager {
    constructor() {
        this.biomes = new Map();
        this.weatherEffects = new Map();
        this.timeVariations = new Map();
        
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    initialize() {
        try {
            this._initializeBiomes();
            this._initializeWeatherEffects();
            this._initializeTimeVariations();
            
            console.log('BiomeDefinitionManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'initialize',
                component: 'BiomeDefinitionManager'
            });
        }
    }
    
    /**
     * バイオーム定義を初期化
     * @private
     */
    _initializeBiomes() {
        try {
            // 森林バイオーム
            this.biomes.set('forest', {
                id: 'forest',
                name: '森林',
                description: '豊かな森の環境音',
                layers: [
                    {
                        name: '風音',
                        type: 'wind',
                        volume: 0.6,
                        frequency: 0.3,
                        modulation: { rate: 0.1, depth: 0.2 }
                    },
                    {
                        name: '葉擦れ音',
                        type: 'leaves',
                        volume: 0.4,
                        frequency: 0.8,
                        modulation: { rate: 0.05, depth: 0.3 }
                    },
                    {
                        name: '鳥のさえずり',
                        type: 'birds',
                        volume: 0.3,
                        frequency: 0.2,
                        modulation: { rate: 0.03, depth: 0.5 }
                    }
                ],
                characteristics: {
                    baseFrequency: 200,
                    richness: 0.8,
                    dynamics: 0.6
                }
            });
            
            // 海洋バイオーム
            this.biomes.set('ocean', {
                id: 'ocean',
                name: '海洋',
                description: '波と海風の環境音',
                layers: [
                    {
                        name: '波音',
                        type: 'waves',
                        volume: 0.8,
                        frequency: 0.2,
                        modulation: { rate: 0.08, depth: 0.4 }
                    },
                    {
                        name: '海風',
                        type: 'sea_wind',
                        volume: 0.5,
                        frequency: 0.4,
                        modulation: { rate: 0.12, depth: 0.3 }
                    },
                    {
                        name: '水泡音',
                        type: 'bubbles',
                        volume: 0.2,
                        frequency: 1.2,
                        modulation: { rate: 0.15, depth: 0.6 }
                    }
                ],
                characteristics: {
                    baseFrequency: 100,
                    richness: 0.9,
                    dynamics: 0.8
                }
            });
            
            // 都市バイオーム
            this.biomes.set('urban', {
                id: 'urban',
                name: '都市',
                description: '都市の喧騒と機械音',
                layers: [
                    {
                        name: '交通音',
                        type: 'traffic',
                        volume: 0.4,
                        frequency: 0.6,
                        modulation: { rate: 0.2, depth: 0.4 }
                    },
                    {
                        name: '機械音',
                        type: 'machinery',
                        volume: 0.3,
                        frequency: 0.8,
                        modulation: { rate: 0.1, depth: 0.2 }
                    },
                    {
                        name: '人の声',
                        type: 'crowd',
                        volume: 0.2,
                        frequency: 0.4,
                        modulation: { rate: 0.05, depth: 0.3 }
                    }
                ],
                characteristics: {
                    baseFrequency: 150,
                    richness: 0.6,
                    dynamics: 0.9
                }
            });
            
            // 山岳バイオーム
            this.biomes.set('mountain', {
                id: 'mountain',
                name: '山岳',
                description: '山の静寂と風音',
                layers: [
                    {
                        name: '高山風',
                        type: 'mountain_wind',
                        volume: 0.7,
                        frequency: 0.2,
                        modulation: { rate: 0.08, depth: 0.5 }
                    },
                    {
                        name: '遠い谷のこだま',
                        type: 'echo',
                        volume: 0.3,
                        frequency: 0.1,
                        modulation: { rate: 0.03, depth: 0.4 }
                    },
                    {
                        name: '岩の軋み',
                        type: 'rock_creaking',
                        volume: 0.2,
                        frequency: 0.05,
                        modulation: { rate: 0.02, depth: 0.3 }
                    }
                ],
                characteristics: {
                    baseFrequency: 80,
                    richness: 0.5,
                    dynamics: 0.4
                }
            });
            
            // 洞窟バイオーム
            this.biomes.set('cave', {
                id: 'cave',
                name: '洞窟',
                description: '洞窟の静寂と水滴音',
                layers: [
                    {
                        name: '水滴音',
                        type: 'drips',
                        volume: 0.4,
                        frequency: 0.3,
                        modulation: { rate: 0.1, depth: 0.8 }
                    },
                    {
                        name: '洞窟の共鳴',
                        type: 'cave_resonance',
                        volume: 0.6,
                        frequency: 0.1,
                        modulation: { rate: 0.05, depth: 0.3 }
                    },
                    {
                        name: '微かな風音',
                        type: 'cave_wind',
                        volume: 0.3,
                        frequency: 0.2,
                        modulation: { rate: 0.07, depth: 0.4 }
                    }
                ],
                characteristics: {
                    baseFrequency: 60,
                    richness: 0.7,
                    dynamics: 0.3
                }
            });
            
            console.log(`Initialized ${this.biomes.size} biome definitions`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_initializeBiomes',
                component: 'BiomeDefinitionManager'
            });
        }
    }
    
    /**
     * 天候効果を初期化
     * @private
     */
    _initializeWeatherEffects() {
        try {
            // 雨効果
            this.weatherEffects.set('rain', {
                id: 'rain',
                name: '雨',
                description: '雨音効果',
                intensity: 0.5,
                soundProfile: {
                    type: 'rain',
                    volume: 0.6,
                    frequency: 1.0,
                    filterCutoff: 800,
                    reverb: 0.3
                },
                biomeModifiers: {
                    forest: { volumeMultiplier: 0.8, filterMultiplier: 0.9 },
                    urban: { volumeMultiplier: 1.2, filterMultiplier: 1.1 },
                    mountain: { volumeMultiplier: 0.6, filterMultiplier: 0.8 }
                }
            });
            
            // 風効果
            this.weatherEffects.set('wind', {
                id: 'wind',
                name: '風',
                description: '風音効果',
                intensity: 0.7,
                soundProfile: {
                    type: 'wind',
                    volume: 0.5,
                    frequency: 0.3,
                    filterCutoff: 400,
                    reverb: 0.2
                },
                biomeModifiers: {
                    forest: { volumeMultiplier: 1.1, filterMultiplier: 0.9 },
                    ocean: { volumeMultiplier: 1.3, filterMultiplier: 1.2 },
                    mountain: { volumeMultiplier: 1.5, filterMultiplier: 0.8 }
                }
            });
            
            // 雷雨効果
            this.weatherEffects.set('thunderstorm', {
                id: 'thunderstorm',
                name: '雷雨',
                description: '雷と激しい雨音',
                intensity: 0.9,
                soundProfile: {
                    type: 'thunderstorm',
                    volume: 0.8,
                    frequency: 0.6,
                    filterCutoff: 1200,
                    reverb: 0.5
                },
                biomeModifiers: {
                    urban: { volumeMultiplier: 1.1, filterMultiplier: 1.0 },
                    mountain: { volumeMultiplier: 1.4, filterMultiplier: 1.2 }
                }
            });
            
            console.log(`Initialized ${this.weatherEffects.size} weather effects`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_initializeWeatherEffects',
                component: 'BiomeDefinitionManager'
            });
        }
    }
    
    /**
     * 時間帯バリエーションを初期化
     * @private
     */
    _initializeTimeVariations() {
        try {
            // 夜間バリエーション
            this.timeVariations.set('night', {
                id: 'night',
                name: '夜間',
                timeRange: { start: 20, end: 6 }, // 20:00-06:00
                modifiers: {
                    volumeMultiplier: 0.7,
                    frequencyShift: -0.2,
                    reverbIncrease: 0.3,
                    filterCutoff: 0.8
                },
                additionalLayers: [
                    {
                        name: '夜虫の声',
                        type: 'night_insects',
                        volume: 0.3,
                        biomes: ['forest', 'grassland']
                    },
                    {
                        name: '遠くの音',
                        type: 'distant_sounds',
                        volume: 0.2,
                        biomes: ['urban', 'mountain']
                    }
                ]
            });
            
            // 早朝バリエーション
            this.timeVariations.set('dawn', {
                id: 'dawn',
                name: '早朝',
                timeRange: { start: 5, end: 8 }, // 05:00-08:00
                modifiers: {
                    volumeMultiplier: 0.8,
                    frequencyShift: 0.1,
                    reverbIncrease: 0.2,
                    filterCutoff: 1.1
                },
                additionalLayers: [
                    {
                        name: '鳥のさえずり',
                        type: 'morning_birds',
                        volume: 0.4,
                        biomes: ['forest', 'mountain']
                    }
                ]
            });
            
            // 日中バリエーション
            this.timeVariations.set('day', {
                id: 'day',
                name: '日中',
                timeRange: { start: 8, end: 18 }, // 08:00-18:00
                modifiers: {
                    volumeMultiplier: 1.0,
                    frequencyShift: 0.0,
                    reverbIncrease: 0.0,
                    filterCutoff: 1.0
                },
                additionalLayers: []
            });
            
            // 夕方バリエーション
            this.timeVariations.set('evening', {
                id: 'evening',
                name: '夕方',
                timeRange: { start: 17, end: 21 }, // 17:00-21:00
                modifiers: {
                    volumeMultiplier: 0.9,
                    frequencyShift: -0.1,
                    reverbIncrease: 0.1,
                    filterCutoff: 0.9
                },
                additionalLayers: [
                    {
                        name: '夕暮れの音',
                        type: 'evening_sounds',
                        volume: 0.2,
                        biomes: ['all']
                    }
                ]
            });
            
            console.log(`Initialized ${this.timeVariations.size} time variations`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_initializeTimeVariations',
                component: 'BiomeDefinitionManager'
            });
        }
    }
    
    /**
     * バイオーム定義を取得
     */
    getBiome(biomeId) {
        return this.biomes.get(biomeId);
    }
    
    /**
     * 天候効果を取得
     */
    getWeatherEffect(weatherId) {
        return this.weatherEffects.get(weatherId);
    }
    
    /**
     * 時間帯バリエーションを取得
     */
    getTimeVariation(timeId) {
        return this.timeVariations.get(timeId);
    }
    
    /**
     * 利用可能なバイオーム一覧を取得
     */
    getAvailableBiomes() {
        return Array.from(this.biomes.values()).map(biome => ({
            id: biome.id,
            name: biome.name,
            description: biome.description,
            layerCount: biome.layers.length
        }));
    }
    
    /**
     * 利用可能な天候効果一覧を取得
     */
    getAvailableWeatherEffects() {
        return Array.from(this.weatherEffects.values()).map(weather => ({
            id: weather.id,
            name: weather.name,
            description: weather.description,
            intensity: weather.intensity
        }));
    }
    
    /**
     * 利用可能な時間帯バリエーション一覧を取得
     */
    getAvailableTimeVariations() {
        return Array.from(this.timeVariations.values()).map(time => ({
            id: time.id,
            name: time.name,
            timeRange: time.timeRange,
            layerCount: time.additionalLayers.length
        }));
    }
    
    /**
     * 音の特性を取得
     */
    getSoundCharacteristics(soundType) {
        const defaultCharacteristics = {
            frequency: 1.0,
            amplitude: 0.3,
            noiseLevel: 0.2,
            modulation: 0.1
        };
        
        const specificCharacteristics = {
            'night_insects': { frequency: 0.8, amplitude: 0.2, noiseLevel: 0.4, modulation: 0.05 },
            'morning_birds': { frequency: 2.0, amplitude: 0.3, noiseLevel: 0.1, modulation: 0.08 },
            'distant_sounds': { frequency: 0.3, amplitude: 0.1, noiseLevel: 0.3, modulation: 0.03 },
            'evening_sounds': { frequency: 0.5, amplitude: 0.2, noiseLevel: 0.2, modulation: 0.06 },
            'drips': { frequency: 0.2, amplitude: 0.4, noiseLevel: 0.1, modulation: 0.15 },
            'bubbles': { frequency: 3.0, amplitude: 0.2, noiseLevel: 0.3, modulation: 0.20 },
            'echo': { frequency: 0.1, amplitude: 0.3, noiseLevel: 0.1, modulation: 0.02 },
            'crowd': { frequency: 1.5, amplitude: 0.2, noiseLevel: 0.5, modulation: 0.12 }
        };
        
        return specificCharacteristics[soundType] || defaultCharacteristics;
    }
}