import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

/**
 * EnvironmentalAudioManager - 環境音管理システム
 * 
 * ゲーム世界の雰囲気を高める背景音（風、水、自然音等）を生成・管理します。
 * BGMとの調和を考慮した環境音システムを提供。
 */
export class EnvironmentalAudioManager {
    constructor(audioController) {
        this.audioController = audioController;
        this.audioContext = audioController.audioContext;
        this.configManager = getConfigurationManager();
        
        // 環境音の種類
        this.environmentTypes = {
            AMBIENT: 'ambient',           // 基本環境音
            NATURE: 'nature',             // 自然音
            MECHANICAL: 'mechanical',     // 機械音
            ATMOSPHERIC: 'atmospheric'    // 雰囲気音
        };
        
        // 生成済み環境音バッファ
        this.environmentBuffers = new Map();
        
        // アクティブな環境音源
        this.activeSources = new Map();
        
        // 環境音設定
        this.settings = {
            enabled: false,
            volume: 0.3,
            fadeTime: 2.0,
            layerCount: 3,
            biomeBlending: true,
            weatherEffects: true,
            timeOfDayVariation: true
        };
        
        // 環境音レイヤー
        this.layers = new Map();
        
        // バイオーム（環境タイプ）定義
        this.biomes = new Map();
        
        // 天候効果
        this.weatherEffects = new Map();
        
        // 時間帯バリエーション
        this.timeVariations = new Map();
        
        // フェード管理
        this.fadeManager = {
            activeTransitions: new Map(),
            crossfadeInProgress: false
        };
        
        // パフォーマンス監視
        this.performanceData = {
            activeLayers: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            lastUpdate: 0
        };
        
        // 設定監視用
        this.configWatchers = new Set();
        
        this.initialize();
    }
    
    /**
     * 環境音管理システムを初期化
     */
    initialize() {
        try {
            if (!this.audioContext) {
                throw new Error('AudioContext is not available');
            }
            
            // 設定を読み込み
            this._loadSettings();
            
            // バイオーム定義を初期化
            this._initializeBiomes();
            
            // 天候効果を初期化
            this._initializeWeatherEffects();
            
            // 時間帯バリエーションを初期化
            this._initializeTimeVariations();
            
            // 基本環境音を生成
            this._generateBasicEnvironmentalSounds();
            
            // 設定変更の監視を開始
            this._setupConfigWatchers();
            
            console.log('EnvironmentalAudioManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'initialize',
                component: 'EnvironmentalAudioManager'
            });
        }
    }
    
    /**
     * 設定を読み込み
     * @private
     */
    _loadSettings() {
        try {
            const envSettings = this.configManager.get('audio', 'environmental') || {};
            
            this.settings = {
                enabled: envSettings.enabled || false,
                volume: envSettings.volume || 0.3,
                fadeTime: envSettings.fadeTime || 2.0,
                layerCount: envSettings.layerCount || 3,
                biomeBlending: envSettings.biomeBlending !== false,
                weatherEffects: envSettings.weatherEffects !== false,
                timeOfDayVariation: envSettings.timeOfDayVariation !== false
            };
            
            console.log('Environmental audio settings loaded:', this.settings);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_loadSettings',
                component: 'EnvironmentalAudioManager'
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
                component: 'EnvironmentalAudioManager'
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
                component: 'EnvironmentalAudioManager'
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
                component: 'EnvironmentalAudioManager'
            });
        }
    }
    
    /**
     * 基本環境音を生成
     * @private
     */
    _generateBasicEnvironmentalSounds() {
        try {
            // 風音の生成
            this.environmentBuffers.set('wind', this._generateWindSound());
            
            // 波音の生成
            this.environmentBuffers.set('waves', this._generateWaveSound());
            
            // 雨音の生成
            this.environmentBuffers.set('rain', this._generateRainSound());
            
            // 森の音の生成
            this.environmentBuffers.set('forest', this._generateForestSound());
            
            // 機械音の生成
            this.environmentBuffers.set('machinery', this._generateMachinerySound());
            
            // 洞窟の共鳴音の生成
            this.environmentBuffers.set('cave_resonance', this._generateCaveResonanceSound());
            
            console.log(`Generated ${this.environmentBuffers.size} basic environmental sounds`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_generateBasicEnvironmentalSounds',
                component: 'EnvironmentalAudioManager'
            });
        }
    }
    
    /**
     * 風音を生成
     * @returns {AudioBuffer} 風音バッファ
     * @private
     */
    _generateWindSound() {
        try {
            const duration = 10; // 10秒ループ
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            
            for (let i = 0; i < buffer.length; i++) {
                const t = i / sampleRate;
                
                // 複数の周波数成分を重ね合わせ
                const lowFreq = Math.sin(2 * Math.PI * 0.5 * t) * 0.3;
                const midFreq = Math.sin(2 * Math.PI * 1.2 * t) * 0.2;
                const highFreq = Math.sin(2 * Math.PI * 3.0 * t) * 0.1;
                
                // ノイズ成分を追加
                const noise = (Math.random() - 0.5) * 0.4;
                
                // 時間的変動を追加
                const modulation = Math.sin(2 * Math.PI * 0.1 * t) * 0.5 + 0.5;
                
                const sample = (lowFreq + midFreq + highFreq + noise) * modulation * 0.3;
                
                leftChannel[i] = sample;
                rightChannel[i] = sample * 0.8 + noise * 0.1; // 右チャンネルに微小な差を追加
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_generateWindSound'
            });
            return null;
        }
    }
    
    /**
     * 波音を生成
     * @returns {AudioBuffer} 波音バッファ
     * @private
     */
    _generateWaveSound() {
        try {
            const duration = 8; // 8秒ループ
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            
            for (let i = 0; i < buffer.length; i++) {
                const t = i / sampleRate;
                
                // 波の周期的な音
                const waveFreq = 0.3;
                const waveEnvelope = Math.sin(2 * Math.PI * waveFreq * t);
                const waveEnvelopeSquared = waveEnvelope * waveEnvelope;
                
                // ホワイトノイズでザーザー音を表現
                const foam = (Math.random() - 0.5) * waveEnvelopeSquared * 0.6;
                
                // 低周波の波音
                const lowWave = Math.sin(2 * Math.PI * 0.8 * t) * waveEnvelopeSquared * 0.3;
                
                const sample = (foam + lowWave) * 0.4;
                
                leftChannel[i] = sample;
                rightChannel[i] = sample * 0.9 + (Math.random() - 0.5) * 0.05;
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_generateWaveSound'
            });
            return null;
        }
    }
    
    /**
     * 雨音を生成
     * @returns {AudioBuffer} 雨音バッファ
     * @private
     */
    _generateRainSound() {
        try {
            const duration = 6; // 6秒ループ
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            
            for (let i = 0; i < buffer.length; i++) {
                const t = i / sampleRate;
                
                // 雨粒の音をホワイトノイズで表現
                const rainNoise = (Math.random() - 0.5) * 0.8;
                
                // 雨の強度変動
                const intensity = Math.sin(2 * Math.PI * 0.2 * t) * 0.3 + 0.7;
                
                // 高周波成分をフィルタリング（自然な雨音）
                const filterCutoff = 800; // Hz
                const filterRatio = Math.min(1, filterCutoff / (sampleRate / 2));
                
                const sample = rainNoise * intensity * filterRatio * 0.5;
                
                leftChannel[i] = sample;
                rightChannel[i] = sample * 0.95 + (Math.random() - 0.5) * 0.03;
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_generateRainSound'
            });
            return null;
        }
    }
    
    /**
     * 森の音を生成
     * @returns {AudioBuffer} 森の音バッファ
     * @private
     */
    _generateForestSound() {
        try {
            const duration = 12; // 12秒ループ
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            
            for (let i = 0; i < buffer.length; i++) {
                const t = i / sampleRate;
                
                // 葉擦れ音（高周波ノイズ）
                const leaves = (Math.random() - 0.5) * 0.3 * Math.sin(2 * Math.PI * 0.05 * t + 0.5);
                
                // 風音（低周波）
                const windInTrees = Math.sin(2 * Math.PI * 0.3 * t) * 0.2;
                
                // 時々の鳥の声（ランダム）
                const birdChance = Math.random();
                const birdSound = birdChance < 0.001 ? Math.sin(2 * Math.PI * 800 * t) * 0.1 : 0;
                
                const sample = (leaves + windInTrees + birdSound) * 0.4;
                
                leftChannel[i] = sample;
                rightChannel[i] = sample * 0.8 + leaves * 0.2;
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_generateForestSound'
            });
            return null;
        }
    }
    
    /**
     * 機械音を生成
     * @returns {AudioBuffer} 機械音バッファ
     * @private
     */
    _generateMachinerySound() {
        try {
            const duration = 5; // 5秒ループ
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            
            for (let i = 0; i < buffer.length; i++) {
                const t = i / sampleRate;
                
                // 低周波のハム音
                const hum = Math.sin(2 * Math.PI * 60 * t) * 0.3;
                
                // 機械的な周期音
                const machinery = Math.sin(2 * Math.PI * 120 * t) * 0.2;
                
                // 時々のクリック音
                const clickChance = Math.random();
                const click = clickChance < 0.01 ? Math.sin(2 * Math.PI * 2000 * t) * 0.1 : 0;
                
                // 電気的なノイズ
                const electricNoise = (Math.random() - 0.5) * 0.1;
                
                const sample = (hum + machinery + click + electricNoise) * 0.3;
                
                leftChannel[i] = sample;
                rightChannel[i] = sample * 0.9;
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_generateMachinerySound'
            });
            return null;
        }
    }
    
    /**
     * 洞窟の共鳴音を生成
     * @returns {AudioBuffer} 洞窟共鳴音バッファ
     * @private
     */
    _generateCaveResonanceSound() {
        try {
            const duration = 15; // 15秒ループ
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            
            for (let i = 0; i < buffer.length; i++) {
                const t = i / sampleRate;
                
                // 低周波の共鳴音
                const resonance = Math.sin(2 * Math.PI * 40 * t) * 0.4;
                
                // 時々の水滴音
                const dripChance = Math.random();
                const drip = dripChance < 0.005 ? 
                    Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 10) * 0.2 : 0;
                
                // 洞窟のエコー効果（遅延）
                const echoDelay = Math.floor(sampleRate * 0.3); // 0.3秒遅延
                const echo = i > echoDelay ? 
                    leftChannel[i - echoDelay] * 0.3 : 0;
                
                const sample = (resonance + drip + echo) * 0.3;
                
                leftChannel[i] = sample;
                rightChannel[i] = sample * 0.8 + drip * 0.2;
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_generateCaveResonanceSound'
            });
            return null;
        }
    }
    
    /**
     * 設定変更の監視を設定
     * @private
     */
    _setupConfigWatchers() {
        try {
            // 環境音有効状態の監視
            const enabledWatcher = this.configManager.watch('audio', 'environmental.enabled', (newValue) => {
                this.setEnabled(newValue);
            });
            if (enabledWatcher) this.configWatchers.add(enabledWatcher);
            
            // 環境音音量の監視
            const volumeWatcher = this.configManager.watch('audio', 'environmental.volume', (newValue) => {
                this.setVolume(newValue);
            });
            if (volumeWatcher) this.configWatchers.add(volumeWatcher);
            
            console.log('Environmental audio config watchers set up successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_setupConfigWatchers',
                component: 'EnvironmentalAudioManager'
            });
        }
    }
    
    /**
     * 環境音を有効/無効に設定
     * @param {boolean} enabled - 有効フラグ
     */
    setEnabled(enabled) {
        try {
            const wasEnabled = this.settings.enabled;
            this.settings.enabled = enabled;
            
            if (enabled && !wasEnabled) {
                // 環境音を開始
                this._startCurrentEnvironment();
            } else if (!enabled && wasEnabled) {
                // 環境音を停止
                this._stopAllEnvironmental();
            }
            
            // 設定に保存
            this.configManager.set('audio', 'environmental.enabled', enabled);
            
            console.log(`Environmental audio ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'setEnabled',
                component: 'EnvironmentalAudioManager',
                enabled: enabled
            });
        }
    }
    
    /**
     * 環境音音量を設定
     * @param {number} volume - 音量 (0-1)
     */
    setVolume(volume) {
        try {
            if (volume < 0 || volume > 1) {
                throw new Error(`Volume must be between 0 and 1, got: ${volume}`);
            }
            
            this.settings.volume = volume;
            
            // アクティブな環境音の音量を更新
            for (const [layerId, source] of this.activeSources) {
                if (source.gainNode) {
                    source.gainNode.gain.setValueAtTime(
                        volume * (source.originalVolume || 1.0),
                        this.audioContext.currentTime
                    );
                }
            }
            
            // 設定に保存
            this.configManager.set('audio', 'environmental.volume', volume);
            
            console.log(`Environmental audio volume set to ${volume}`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'setVolume',
                component: 'EnvironmentalAudioManager',
                volume: volume
            });
        }
    }
    
    /**
     * バイオームを設定
     * @param {string} biomeId - バイオームID
     * @param {Object} options - オプション
     */
    setBiome(biomeId, options = {}) {
        try {
            const biome = this.biomes.get(biomeId);
            if (!biome) {
                throw new Error(`Unknown biome: ${biomeId}`);
            }
            
            const {
                fadeTime = this.settings.fadeTime,
                weather = null,
                timeOfDay = 'day',
                intensity = 1.0
            } = options;
            
            console.log(`Setting biome to: ${biome.name}`);
            
            if (this.settings.enabled) {
                this._transitionToBiome(biome, { fadeTime, weather, timeOfDay, intensity });
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
     * バイオームへの遷移を実行
     * @param {Object} biome - バイオームデータ
     * @param {Object} options - オプション
     * @private
     */
    async _transitionToBiome(biome, options = {}) {
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
                operation: '_transitionToBiome',
                component: 'EnvironmentalAudioManager',
                biome: biome.name
            });
        }
    }
    
    /**
     * バイオームレイヤーを準備
     * @param {Object} biome - バイオームデータ
     * @param {Object} options - オプション
     * @returns {Array} 準備されたレイヤー配列
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
                    audioBuffer: this._getOrGenerateSound(layer.type)
                };
                
                preparedLayers.push(layerData);
            }
            
            // 天候効果を追加
            if (weather && this.settings.weatherEffects) {
                const weatherEffect = this.weatherEffects.get(weather);
                if (weatherEffect) {
                    const weatherLayer = this._prepareWeatherLayer(weatherEffect, biome);
                    if (weatherLayer) {
                        preparedLayers.push(weatherLayer);
                    }
                }
            }
            
            // 時間帯バリエーションを追加
            if (timeOfDay && this.settings.timeOfDayVariation) {
                const timeVariation = this.timeVariations.get(timeOfDay);
                if (timeVariation && timeVariation.additionalLayers) {
                    for (const timeLayer of timeVariation.additionalLayers) {
                        if (timeLayer.biomes.includes('all') || timeLayer.biomes.includes(biome.id)) {
                            const layerData = {
                                ...timeLayer,
                                biomeId: biome.id,
                                timeOfDay: timeOfDay,
                                audioBuffer: this._getOrGenerateSound(timeLayer.type)
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
                component: 'EnvironmentalAudioManager'
            });
            return [];
        }
    }
    
    /**
     * 天候レイヤーを準備
     * @param {Object} weatherEffect - 天候効果データ
     * @param {Object} biome - バイオームデータ
     * @returns {Object|null} 天候レイヤー
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
                audioBuffer: this._getOrGenerateSound(soundProfile.type)
            };
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_prepareWeatherLayer',
                component: 'EnvironmentalAudioManager'
            });
            return null;
        }
    }
    
    /**
     * 音響データを取得または生成
     * @param {string} soundType - 音の種類
     * @returns {AudioBuffer|null} 音響バッファ
     * @private
     */
    _getOrGenerateSound(soundType) {
        try {
            // 既存のバッファがあれば返す
            if (this.environmentBuffers.has(soundType)) {
                return this.environmentBuffers.get(soundType);
            }
            
            // 新しい音響を生成
            let buffer = null;
            switch (soundType) {
                case 'wind':
                case 'mountain_wind':
                case 'sea_wind':
                case 'cave_wind':
                    buffer = this._generateWindSound();
                    break;
                case 'waves':
                    buffer = this._generateWaveSound();
                    break;
                case 'rain':
                case 'thunderstorm':
                    buffer = this._generateRainSound();
                    break;
                case 'leaves':
                case 'forest':
                    buffer = this._generateForestSound();
                    break;
                case 'machinery':
                case 'traffic':
                    buffer = this._generateMachinerySound();
                    break;
                case 'cave_resonance':
                    buffer = this._generateCaveResonanceSound();
                    break;
                default:
                    // 汎用環境音を生成
                    buffer = this._generateGenericEnvironmentalSound(soundType);
                    break;
            }
            
            if (buffer) {
                this.environmentBuffers.set(soundType, buffer);
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_getOrGenerateSound',
                component: 'EnvironmentalAudioManager',
                soundType: soundType
            });
            return null;
        }
    }
    
    /**
     * 汎用環境音を生成
     * @param {string} soundType - 音の種類
     * @returns {AudioBuffer|null} 音響バッファ
     * @private
     */
    _generateGenericEnvironmentalSound(soundType) {
        try {
            const duration = 8; // 8秒ループ
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            
            // サウンドタイプに基づく基本特性
            const characteristics = this._getSoundCharacteristics(soundType);
            
            for (let i = 0; i < buffer.length; i++) {
                const t = i / sampleRate;
                
                // 基本周波数成分
                const baseFreq = Math.sin(2 * Math.PI * characteristics.frequency * t) * characteristics.amplitude;
                
                // ノイズ成分
                const noise = (Math.random() - 0.5) * characteristics.noiseLevel;
                
                // 時間的変動
                const modulation = Math.sin(2 * Math.PI * characteristics.modulation * t) * 0.3 + 0.7;
                
                const sample = (baseFreq + noise) * modulation * 0.3;
                
                leftChannel[i] = sample;
                rightChannel[i] = sample * 0.9 + noise * 0.1;
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_generateGenericEnvironmentalSound',
                soundType: soundType
            });
            return null;
        }
    }
    
    /**
     * 音の特性を取得
     * @param {string} soundType - 音の種類
     * @returns {Object} 音の特性
     * @private
     */
    _getSoundCharacteristics(soundType) {
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
    
    /**
     * 現在の環境音をフェードアウト
     * @param {number} fadeTime - フェード時間
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
                component: 'EnvironmentalAudioManager'
            });
        }
    }
    
    /**
     * 環境音をフェードイン
     * @param {Array} layers - レイヤー配列
     * @param {number} fadeTime - フェード時間
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
                const targetVolume = (layer.volume || 0.5) * this.settings.volume;
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
                component: 'EnvironmentalAudioManager'
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
     * すべての環境音を停止
     * @private
     */
    _stopAllEnvironmental() {
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
                operation: '_stopAllEnvironmental',
                component: 'EnvironmentalAudioManager'
            });
        }
    }
    
    /**
     * 利用可能なバイオーム一覧を取得
     * @returns {Array} バイオーム一覧
     */
    getAvailableBiomes() {
        try {
            return Array.from(this.biomes.values()).map(biome => ({
                id: biome.id,
                name: biome.name,
                description: biome.description,
                layerCount: biome.layers.length
            }));
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
     * @returns {Array} 天候効果一覧
     */
    getAvailableWeatherEffects() {
        try {
            return Array.from(this.weatherEffects.values()).map(weather => ({
                id: weather.id,
                name: weather.name,
                description: weather.description,
                intensity: weather.intensity
            }));
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'getAvailableWeatherEffects',
                component: 'EnvironmentalAudioManager'
            });
            return [];
        }
    }
    
    /**
     * システム状態を取得
     * @returns {Object} 状態情報
     */
    getStatus() {
        return {
            enabled: this.settings.enabled,
            volume: this.settings.volume,
            currentBiome: this.currentBiome,
            activeLayers: this.activeSources.size,
            availableBiomes: this.biomes.size,
            availableWeatherEffects: this.weatherEffects.size,
            generatedSounds: this.environmentBuffers.size,
            configWatchers: this.configWatchers.size,
            performance: {
                ...this.performanceData,
                memoryUsageMB: (this.environmentBuffers.size * 0.5).toFixed(1) // 推定値
            }
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
            
            // アクティブな環境音を停止
            this._stopAllEnvironmental();
            
            // バッファをクリア
            this.environmentBuffers.clear();
            
            // その他のデータをクリア
            this.biomes.clear();
            this.weatherEffects.clear();
            this.timeVariations.clear();
            this.layers.clear();
            
            console.log('EnvironmentalAudioManager disposed');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'dispose',
                component: 'EnvironmentalAudioManager'
            });
        }
    }
}