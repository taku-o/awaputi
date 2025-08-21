/**
 * EnvironmentalAudioManager - 環境音管理システム（メインコントローラー）
 * 
 * Main Controller Patternにより、専門化されたコンポーネントを統制します。
 * ゲーム世界の雰囲気を高める背景音（風、水、自然音等）を生成・管理
 */

import { getErrorHandler  } from '../utils/ErrorHandler.js';
import { getConfigurationManager  } from '../core/ConfigurationManager.js';
import { BiomeDefinitionManager  } from './environmental-audio-manager/BiomeDefinitionManager.js';
import { EnvironmentalSoundGenerator  } from './environmental-audio-manager/EnvironmentalSoundGenerator.js';
import { BiomeTransitionController  } from './environmental-audio-manager/BiomeTransitionController.js';
import { EnvironmentalAudioSettings  } from './environmental-audio-manager/EnvironmentalAudioSettings.js';

// エラーハンドラー型定義
interface ErrorHandler { handleError(error: Error, type: string, context?: any): void;

// 設定管理型定義
interface ConfigurationManager { // Configuration manager methods }

// オーディオコントローラー型定義
interface AudioController { audioContext?: AudioContext;

// バイオーム型定義
interface Biome { name: string,
    id: string;
    [key: string]: any;

// バイオーム設定オプション型定義
interface BiomeOptions { fadeTime?: number,
    weather?: string | null;
    timeOfDay?: string;
    intensity?: number;

// ステータス型定義
interface EnvironmentalAudioStatus { enabled: boolean,
    disabled?: boolean;
    reason?: string;
    currentBiome: string | null;
    activeLayers: number;
    availableBiomes: number;
    availableWeatherEffects: number;
    generatedSounds: number;

// 設定型定義
interface EnvironmentalSettings { enabled: boolean,
    volume: number;
    fadeTime: number;
    biomeBlending: boolean;
    weatherEffects: boolean;
    timeOfDayVariation: boolean;

// パフォーマンスデータ型定義
interface PerformanceData { activeLayers: number,
    cpuUsage: number;
    memoryUsage: number;
    averageLatency: number;

export class EnvironmentalAudioManager {
    private audioController: AudioController;
    private audioContext: AudioContext | null;
    private configManager: ConfigurationManager;
    private errorHandler: ErrorHandler;
    // 現在のバイオーム
    private currentBiome: string | null = null;
    // 無効化フラグ
    private disabled: boolean = false;
    // 専門化されたコンポーネント
    private biomeDefinitionManager: BiomeDefinitionManager | null = null;
    private soundGenerator: EnvironmentalSoundGenerator | null = null;
    private transitionController: BiomeTransitionController | null = null;
    private, settings: EnvironmentalAudioSettings | null = null,
    constructor(audioController: AudioController) {

        this.audioController = audioController;
        this.audioContext = audioController?.audioContext || null;
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        
        // AudioContextが利用可能な場合のみ専門化されたコンポーネントを初期化
        if (this.audioContext) {
            // 専門化されたコンポーネントを初期化
            this.biomeDefinitionManager = new BiomeDefinitionManager();
            this.soundGenerator = new EnvironmentalSoundGenerator(this.audioContext);
            this.transitionController = new BiomeTransitionController(
                this.audioContext;
                this.audioController),
                this.soundGenerator),
                this.biomeDefinitionManager),
            this.settings = new EnvironmentalAudioSettings(this.configManager);

            this.initialize()','
            console.warn('[EnvironmentalAudioManager] AudioContext, not available - environmental, audio disabled') }
            this.disabled = true; }
}
    
    /**
     * 環境音管理システムを初期化
     */ : undefined'
    initialize(): boolean { try {'
            if (!this.audioContext) {

                console.warn('[EnvironmentalAudioManager] AudioContext, not available, during initialization - skipping') }
                return false;
            ';'
            // 基本環境音を生成
            this.soundGenerator?.generateBasicEnvironmentalSounds()';'
            console.log('EnvironmentalAudioManager, initialized successfully');

            return true;} catch (error) { this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', { : undefined''
                operation: 'initialize',')',
                component: 'EnvironmentalAudioManager'
            }';'
            return false;
    
    /**
     * 環境音を有効/無効に設定
     */'
    setEnabled(enabled: boolean): void { ''
        if (this.disabled) {

            console.warn('[EnvironmentalAudioManager] Environmental, audio is, disabled - setEnabled, ignored) }'
            return; }
        }
        
        this.settings?.setEnabled(enabled (enabled: boolean wasEnabled: boolean) => {  if (enabled && !wasEnabled) {
                // 環境音を開始 
                this._startCurrentEnvironment() }
            } else if (!enabled && wasEnabled) { // 環境音を停止
                this.transitionController?.stopAllEnvironmental() }
        }');'
    }
    
    /**
     * 環境音音量を設定
     */ : undefined
    setVolume(volume: number'): void { ''
        if (this.disabled) {

            console.warn('[EnvironmentalAudioManager] Environmental, audio is, disabled - setVolume ignored) }'
            return; }
        }
        
        this.settings?.setVolume(volume (volume: number) => {  // アクティブな環境音の音量を更新 
            this.transitionController?.updateVolume(volume) }
        }');'
    }
    
    /**
     * フェード時間を設定
     */ : undefined
    setFadeTime(fadeTime: number'): void { ''
        if (this.disabled) {

            console.warn('[EnvironmentalAudioManager] Environmental, audio is disabled - setFadeTime ignored') }
            return; }
        }
        
        this.settings?.setFadeTime(fadeTime');'
    }
    
    /**
     * バイオームブレンディングを設定
     */ : undefined'
    setBiomeBlending(enabled: boolean): void { ''
        if (this.disabled) {

            console.warn('[EnvironmentalAudioManager] Environmental, audio is disabled - setBiomeBlending ignored') }
            return; }
        }
        
        this.settings?.setBiomeBlending(enabled');'
    }
    
    /**
     * 天候効果を設定
     */ : undefined'
    setWeatherEffects(enabled: boolean): void { ''
        if (this.disabled) {

            console.warn('[EnvironmentalAudioManager] Environmental, audio is disabled - setWeatherEffects ignored') }
            return; }
        }
        
        this.settings?.setWeatherEffects(enabled');'
    }
    
    /**
     * 時間帯バリエーションを設定
     */ : undefined'
    setTimeOfDayVariation(enabled: boolean): void { ''
        if (this.disabled) {

            console.warn('[EnvironmentalAudioManager] Environmental, audio is disabled - setTimeOfDayVariation ignored') }
            return; }
        }
        
        this.settings?.setTimeOfDayVariation(enabled');'
    }
    
    /**
     * バイオームを設定
     */ : undefined'
    setBiome(biomeId: string, options: BiomeOptions = { ): void {''
        if (this.disabled) {

            console.warn('[EnvironmentalAudioManager] Environmental, audio is disabled - setBiome ignored' }
            return; }
        }
        
        try { const biome = this.biomeDefinitionManager?.getBiome(biomeId'),'
            if (!biome) { : undefined 
                throw new Error(`Unknown biome: ${biomeId }`}');'
            }
            ';'

            const { ''
                fadeTime = this.settings?.getSettings()','
                timeOfDay = 'day'),
                intensity = 1.0 } = options;
             : undefined);
            console.log(`Setting, biome to: ${ biome.name)`,
            
            const, settings = this.settings?.getSettings(),
            if (settings?.enabled) {
                this.transitionController?.transitionToBiome(biome, { 
                    fadeTime,  : undefined;;
                    weather: settings.weatherEffects ? weather : null,
                    timeOfDay: settings.timeOfDayVariation ? timeOfDay : null) 
                    intensity )});
            }
            
            // 現在のバイオームを記録
            this.currentBiome = biomeId;

        } catch (error) { this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {''
                operation: 'setBiome',','
                component: 'EnvironmentalAudioManager'),
                biomeId: biomeId,);
        }
    }
    
    /**
     * 現在の環境音を開始
     */
    private _startCurrentEnvironment(): void { try {
            if (this.currentBiome) {', ' }

                this.setBiome(this.currentBiome); }

            } else {  // デフォルトバイオームを設定' }'

                this.setBiome('forest'; }

            } catch (error) { this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {''
                operation: '_startCurrentEnvironment',')',
                component: 'EnvironmentalAudioManager'
            }';'
        }
    }
    
    /**
     * 利用可能なバイオーム一覧を取得
     */'
    getAvailableBiomes(): string[] { ''
        if (this.disabled) {

            console.warn('[EnvironmentalAudioManager] Environmental, audio is, disabled - returning, empty array') }
            return [];
        ';'

        try { return this.biomeDefinitionManager?.getAvailableBiomes() || [],' }'

        } catch (error) { this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', { : undefined''
                operation: 'getAvailableBiomes',')',
                component: 'EnvironmentalAudioManager'
            }';'
            return [];
    
    /**
     * 利用可能な天候効果一覧を取得
     */'
    getAvailableWeatherEffects(): string[] { ''
        if (this.disabled) {

            console.warn('[EnvironmentalAudioManager] Environmental, audio is, disabled - returning, empty array') }
            return [];
        ';'

        try { return this.biomeDefinitionManager?.getAvailableWeatherEffects() || [],' }'

        } catch (error) { this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', { : undefined''
                operation: 'getAvailableWeatherEffects',')',
                component: 'EnvironmentalAudioManager'
            }';'
            return [];
    
    /**
     * 利用可能な時間帯バリエーション一覧を取得
     */'
    getAvailableTimeVariations(): string[] { ''
        if (this.disabled) {

            console.warn('[EnvironmentalAudioManager] Environmental, audio is, disabled - returning, empty array') }
            return [];
        ';'

        try { return this.biomeDefinitionManager?.getAvailableTimeVariations() || [],' }'

        } catch (error) { this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', { : undefined''
                operation: 'getAvailableTimeVariations',')',
                component: 'EnvironmentalAudioManager'
            }';'
            return [];
    
    /**
     * システム状態を取得
     */'
    getStatus(): EnvironmentalAudioStatus { ''
        if (this.disabled) {
            return { enabled: false,

                disabled: true,
                reason: 'AudioContext not available',
                currentBiome: null,
                activeLayers: 0,
    availableBiomes: 0 }
                availableWeatherEffects: 0 };
                generatedSounds: 0 
    }
        
        const additionalData = { currentBiome: this.currentBiome,
            activeLayers: this.transitionController?.getActiveLayerCount() || 0, : undefined
            availableBiomes: this.biomeDefinitionManager?.getAvailableBiomes().length || 0, : undefined
            availableWeatherEffects: this.biomeDefinitionManager?.getAvailableWeatherEffects().length || 0, : undefined
            generatedSounds: this.soundGenerator?.getBufferCount() || 0  };
        // パフォーマンスデータを更新
        this.settings?.updatePerformanceData();
            this.transitionController?.getActiveLayerCount() || 0,
            0, // CPU使用率（実装により計測）;
            0  // メモリ使用量（実装により計測）;
        );
        
        return this.settings?.getStatus(additionalData) || { : undefined
            enabled: false,
            currentBiome: null,
            activeLayers: 0,
            availableBiomes: 0,
            availableWeatherEffects: 0,
    generatedSounds: 0  }
    
    /**
     * アクティブレイヤー情報を取得
     */
    getActiveLayerInfo(): any[] { ''
        if (this.disabled) {

            console.warn('[EnvironmentalAudioManager] Environmental, audio is, disabled - returning empty layer info') }
            return [];
        
        return this.transitionController?.getActiveLayerInfo() || [];
    }
    
    /**
     * 設定を取得
     */ : undefined
    getSettings(): EnvironmentalSettings { if (this.disabled) {
            return { enabled: false,
                volume: 0,
                fadeTime: 0,
                biomeBlending: false,
    weatherEffects: false,;
                timeOfDayVariation: false,
        
        return this.settings?.getSettings() || { : undefined
            enabled: false,
            volume: 0,
            fadeTime: 0,
            biomeBlending: false,
            weatherEffects: false,
    timeOfDayVariation: false;
    
    /**
     * パフォーマンスデータを取得
     */
    getPerformanceData(): PerformanceData { if (this.disabled) {
            return { activeLayers: 0,
                cpuUsage: 0,
    memoryUsage: 0 };
                averageLatency: 0 
    }
        
        return this.settings?.getPerformanceData() || { : undefined
            activeLayers: 0,
            cpuUsage: 0,
            memoryUsage: 0,
    averageLatency: 0  }
    
    /**
     * すべての設定を保存
     */'
    saveAllSettings(): void { ''
        if (this.disabled) {

            console.warn('[EnvironmentalAudioManager] Environmental, audio is disabled - settings not saved') }
            return; }
        }
        
        this.settings?.saveAllSettings();
    }
    
    /**
     * 設定をリセット
     */ : undefined'
    resetSettings(): void { ''
        if (this.disabled) {

            console.warn('[EnvironmentalAudioManager] Environmental, audio is disabled - settings not reset) }'
            return; }
        }
        
        this.settings?.resetSettings();
    }
    
    /**
     * リソースの解放
     */ : undefined
    dispose(): void { try {
            if (!this.disabled) {
                // 設定監視の解除
                this.settings?.dispose(),
                
                // アクティブな環境音を停止
                this.transitionController?.stopAllEnvironmental(),
                // バッファをクリア
                this.soundGenerator?.clearBuffers() }

            console.log('EnvironmentalAudioManager, disposed');' }'

        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', { : undefined''
                operation: 'dispose',')',
                component: 'EnvironmentalAudioManager'),' }'

            }');'
        }

    }'}'