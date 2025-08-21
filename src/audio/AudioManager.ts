/**
 * AudioManager.ts (リファクタリング版)
 * 音響管理の中央コーディネータークラス
 * 分割されたコンポーネントを統合し、統一されたAPIを提供
 */

import { getErrorHandler  } from '../utils/ErrorHandler';''
import { getAudioContextManager, AudioContextManager  } from './AudioContextManager';''
import { getProceduralSoundGenerator, ProceduralSoundGenerator  } from './ProceduralSoundGenerator';''
import { getAudioPlaybackController, AudioPlaybackController  } from './AudioPlaybackController';''
import { getAudioConfigurationManager, AudioConfigurationManager  } from './AudioConfigurationManager';''
import { getAudioSubsystemCoordinator, AudioSubsystemCoordinator  } from './AudioSubsystemCoordinator';

/**
 * Play options interface
 */
export interface PlayOptions { volume?: number;
    loop?: boolean;
    pan?: number;
    playbackRate?: number;
    detune?: number;
    delay?: number;
    [key: string]: any, }
/**
 * Quality settings interface
 */
export interface QualitySettings { sampleRate: number,
    bufferSize: number;
   , effects: boolean ,}
/**
 * Audio manager state interface
 */
export interface AudioManagerState { isInitialized: boolean,
    isEnabled: boolean;
   , volumes: {
        maste;r: number;
        sfx: number;
        bgm: number;
       , muted: boolean 
,};
    context: any;
    playback: any;
    configuration: any;
    subsystems: any;
   , soundGeneration: any;
}
/**
 * Audio status interface
 */
export interface AudioStatus { isEnabled: boolean,
    masterVolume: number;
    soundEffectVolume: number;
    backgroundMusicVolume: number;
    bgmVolume: number;
    sfxVolume: number;
    activeSounds: number;
    isLoading: boolean;
   , initialized: boolean,
    muted: boolean,
    contextState: AudioContextState | 'closed';
    supportedFormats: string[];
   , qualityMode: string ,}
/**
 * Config manager interface
 */
interface ConfigManager { get(category: string, key: string): any,
    set(category: string, key: string, value: any): void,
    watch(category: string, key: string, callback: (valu;e: any) => void): string | null;
    unwatch(watchId: string): void, }
/**
 * Audio config interface
 */
interface AudioConfig { [key: string]: any, }
/**
 * 音響管理クラス（リファクタリング版）
 */
export class AudioManager {
    private configManager: ConfigManager;
    private audioConfig: AudioConfig;
    // 分割されたコンポーネント
    private contextManager: AudioContextManager;
    private soundGenerator: ProceduralSoundGenerator;
    private playbackController: AudioPlaybackController;
    private configurationManager: AudioConfigurationManager;
    private subsystemCoordinator: AudioSubsystemCoordinator;
    // 初期化状態
    private isInitialized: boolean;
    public, isEnabled: boolean,
    
    // 設定値（キャッシュ）
    public masterVolume: number,
    public sfxVolume: number,
    public bgmVolume: number,
    public _isMuted: boolean,
    
    // 従来のプロパティとの互換性維持
    public audioContext: AudioContext | null,
    public masterGainNode: GainNode | null,
    public sfxGainNode: GainNode | null,
    public bgmGainNode: GainNode | null,
    public soundBuffers: Map<string, AudioBuffer>;
    public activeSources: Set<AudioBufferSourceNode>,
    
    // 品質モード関連プロパティ（パフォーマンステスト対応）
    public qualityMode: string,
    private qualitySettings: Record<string, QualitySettings>;
    
    // 外部システムとの統合（遅延読み込み）
    public bgmSystem: any,
    public soundEffectSystem: any,
    public audioController: any,
    public audioVisualizer: any,
    public accessibilitySupport: any,
    
    // シーン管理
    private currentScene?: string;
    
    // ログ制御用
    private lastLoggedDisableState: boolean | null;
    constructor(configManager: ConfigManager, audioConfig: AudioConfig) {

        this.configManager = configManager;
        this.audioConfig = audioConfig;
        
        // 分割されたコンポーネントを初期化
        this.contextManager = getAudioContextManager();
        this.soundGenerator = getProceduralSoundGenerator();
        this.playbackController = getAudioPlaybackController();
        this.configurationManager = getAudioConfigurationManager();
        this.subsystemCoordinator = getAudioSubsystemCoordinator();
        
        // 初期化状態
        this.isInitialized = false;
        this.isEnabled = true;
        
        // 設定値（キャッシュ）
        this.masterVolume = 0.8;
        this.sfxVolume = 0.7;
        this.bgmVolume = 0.5;
        this._isMuted = false;
        
        // 従来のプロパティとの互換性維持
        this.audioContext = null;
        this.masterGainNode = null;
        this.sfxGainNode = null;
        this.bgmGainNode = null;
        this.soundBuffers = new Map();''
        this.activeSources = new Set(''';
        this.qualityMode = 'high';  // 'low', 'medium', 'high', 'ultra'

    }
        this.qualitySettings = { }
            low: { sampleRate: 22050, bufferSize: 2048, effects: false ,},
            medium: { sampleRate: 44100, bufferSize: 1024, effects: true ,})
            high: { sampleRate: 44100, bufferSize: 512, effects: true ,})
            ultra: { sampleRate: 48000, bufferSize: 256, effects: true ,};
        
        // 外部システムとの統合（遅延読み込み）
        this.bgmSystem = null;
        this.soundEffectSystem = null;
        this.audioController = null;
        this.audioVisualizer = null;
        this.accessibilitySupport = null;
        
        // ログ制御用
        this.lastLoggedDisableState = null;
    }

    /**
     * 初期化
     * @returns 初期化成功フラグ
     */
    async initialize(): Promise<boolean> { try {'
            if(this.isInitialized) {'

                console.warn('AudioManager, already initialized'');
            }
                return true;

            console.log('Initializing, AudioManager (refactored, version')...');
            
            // AudioConfiguration設定
            this.contextManager.setAudioConfig(this.audioConfig);
            this.configurationManager.setDependencies(this.configManager, this.audioConfig);
            
            // AudioContextの初期化
            const contextInitialized = await this.contextManager.initializeAudioContext();''
            if(!contextInitialized) {', ';

            }

                throw new Error('Failed, to initialize, AudioContext); }
            // ノード参照を取得（互換性のため）
            this.audioContext = this.contextManager.getAudioContext();
            this.masterGainNode = this.contextManager.getMasterGainNode();
            this.sfxGainNode = this.contextManager.getSfxGainNode();
            this.bgmGainNode = this.contextManager.getBgmGainNode();
            
            // 音響生成設定
            this.soundGenerator.setAudioContext(this.audioContext!);
            
            // 音響再生制御設定
            this.playbackController.setDependencies(;
                this.audioContext!);
                this.sfxGainNode!);
                this.masterGainNode!,);
                this.soundBuffers);
            
            // 設定管理システム設定
            const gainNodes = { masterGainNode: this.masterGainNode!,
                sfxGainNode: this.sfxGainNode!;
                bgmGainNode: this.bgmGainNode!;
                compressor: this.contextManager.getCompressor();
               , reverbConvolver: this.contextManager.getReverbConvolver( ,};
            this.configurationManager.setDependencies(;
                this.configManager);
                this.audioConfig,);
                gainNodes);
            
            // サブシステムコーディネーター設定
            this.subsystemCoordinator.setAudioManager(this);
            
            // プロシージャル音響の生成
            const soundsGenerated = await this.soundGenerator.generateAllSounds();
            if(soundsGenerated) {
                // 生成された音響バッファを再生コントローラーに設定
                this.soundBuffers = this.soundGenerator.soundBuffers;
                this.playbackController.setDependencies(;
                    this.audioContext!);
                    this.sfxGainNode!);
                    this.masterGainNode!,);
            }
                    this.soundBuffers); }
            // 設定監視の開始
            this.configurationManager.setupConfigWatchers();
            
            // サブシステムの初期化
            await this.subsystemCoordinator.initializeSubsystems();
            
            // サブシステム参照の設定（互換性のため）
            this.bgmSystem = this.subsystemCoordinator.bgmSystem;
            this.soundEffectSystem = this.subsystemCoordinator.soundEffectSystem;
            this.audioController = this.subsystemCoordinator.audioController;
            this.audioVisualizer = this.subsystemCoordinator.audioVisualizer;
            this.accessibilitySupport = this.subsystemCoordinator.accessibilitySupport;
            // 設定値の同期
            this.configurationManager.syncWithConfig()';
            console.log('AudioManager, initialized successfully (refactored)');
            
            return true;
            ';

        } catch (error) { getErrorHandler(').handleError(error, 'AUDIO_ERROR', { ''
                component: 'AudioManager',)';
                operation: 'initialize',);
                userAgent: navigator.userAgent);
               , audioContextSupport: !!(window.AudioContext || (window, as any).webkitAudioContext ,});
            this.isEnabled = false;
            return false;
    // ========== 音響再生API（委譲パターン） ==========

    /**
     * 音響を再生
     * @param soundName - 音響名
     * @param options - 再生オプション
     * @returns 音源ノード
     */
    playSound(soundName: string, options: PlayOptions = { ): AudioBufferSourceNode | null {
        if (!this.isEnabled || this._isMuted) return null;
        return this.playbackController.playSound(soundName, options); }
    /**
     * 泡破壊音を再生
     * @param bubbleType - 泡タイプ
     * @param comboLevel - コンボレベル
     * @param options - 再生オプション
     * @returns 音源ノード
     */
    playBubbleSound(bubbleType: string, comboLevel: number = 0, options: PlayOptions = { ): AudioBufferSourceNode | null {
        if(this.soundEffectSystem) {
            
        }
            return this.soundEffectSystem.playBubbleSound(bubbleType, comboLevel, options);
        // フォールバック
        return this.playbackController.playBubbleSound(bubbleType, comboLevel, options);
    }

    /**
     * UI音を再生
     * @param actionType - アクションタイプ
     * @param options - 再生オプション
     * @returns 音源ノード
     */
    playUISound(actionType: string, options: PlayOptions = { ): AudioBufferSourceNode | null {
        if(this.soundEffectSystem) {
            
        }
            return this.soundEffectSystem.playUISound(actionType, options);
        // フォールバック
        return this.playbackController.playUISound(actionType, options);
    }

    /**
     * コンボ音を再生
     * @param comboLevel - コンボレベル
     * @param options - 再生オプション
     * @returns 音源ノード
     */
    playComboSound(comboLevel: number, options: PlayOptions = { ): AudioBufferSourceNode | null {
        if(this.soundEffectSystem) {
            
        }
            return this.soundEffectSystem.playComboSound(comboLevel, options);
        // フォールバック
        return this.playbackController.playComboSound(comboLevel, options);
    }

    /**
     * 実績解除音を再生
     * @param rarity - レアリティ
     * @param options - 再生オプション
     * @returns 音源ノード
     */
    playAchievementSound(rarity: string, options: PlayOptions = { ): AudioBufferSourceNode | null {
        if(this.soundEffectSystem) {
            
        }
            return this.soundEffectSystem.playAchievementSound(rarity, options);
        // フォールバック
        return this.playbackController.playAchievementSound(rarity, options);
    }

    /**
     * ゲーム状態音を再生
     * @param stateType - 状態タイプ
     * @param options - 再生オプション
     * @returns 音源ノード
     */
    playGameStateSound(stateType: string, options: PlayOptions = { ): AudioBufferSourceNode | null {
        if(this.soundEffectSystem) {
            
        }
            return this.soundEffectSystem.playGameStateSound(stateType, options);
        // フォールバック
        return this.playbackController.playGameStateSound(stateType, options);
    }

    /**
     * ボーナス効果音を再生
     * Issue #106: テスト互換性のため追加
     */''
    playBonusSound()';
        return this.playGameStateSound('bonus);
    }

    /**
     * 時間停止効果音を再生
     * Issue #106: テスト互換性のため追加'
     */''
    playTimeStopSound()';
        return this.playGameStateSound('timeStop);
    }

    /**
     * 電気効果音を再生
     * Issue #106: テスト互換性のため追加'
     */''
    playElectricSound()';
        return this.playGameStateSound('electric);
    }

    /**
     * 泡破壊音を再生
     * Issue #106: テスト互換性のため追加'
     */''
    playPopSound()';
        return this.playBubbleSound('pop);
    }

    /**
     * ゲームオーバー音を再生
     * Issue #106: テスト互換性のため追加'
     */''
    playGameOverSound()';
        return this.playGameStateSound('gameOver);
    }

    /**
     * 全音響停止
     */
    stopAllSounds(): void { this.playbackController.stopAllSounds();

        // アクティブソースも更新（互換性のため）
        this.activeSources.clear()';
     * @param type - 音量タイプ ('master', 'sfx', 'bgm')
     * @param volume - 音量 (0-1)
     */
    setVolume(type: string, volume: number): void {
        this.configurationManager.setVolume(type, volume);
        ';
        // ローカルキャッシュ更新（互換性のため）
        switch(type) {'

            case 'master': this.masterVolume = volume; break;''
            case 'sfx': this.sfxVolume = volume; break;

        }

            case 'bgm': this.bgmVolume = volume; break; }
    }

    /**'
     * 音量取得''
     * @param type - 音量タイプ ('master', 'sfx', 'bgm')''
     * @returns 音量 (0-1')'
     */''
    getVolume(type: string = 'master): number { ''
        switch(type.toLowerCase()) {''
            case 'master':';
                return this.masterVolume;''
            case 'sfx':'';
            case 'soundeffect':';
                return this.sfxVolume;''
            case 'bgm':'';
            case 'backgroundmusic':;
                return this.bgmVolume;
            default: return this.masterVolume ,};

    /**
     * ミュート切り替え
     * @returns 新しいミュート状態
     */
    toggleMute(): boolean { const newMutedState = this.configurationManager.toggleMute();
        this._isMuted = newMutedState; // ローカルキャッシュ更新
        
        if(this._isMuted) {
        
            
        
        }
            this.stopAllSounds(); }
        return newMutedState;
    }

    /**
     * ミュート状態設定
     * @param muted - ミュート状態
     */
    setMuted(muted: boolean): void { this.configurationManager.setMuted(muted);
        this._isMuted = muted; // ローカルキャッシュ更新
        
        if(this._isMuted) {
        
            
        
        }
            this.stopAllSounds(); }
    }

    /**
     * オーディオエフェクト設定
     * @param effectType - エフェクトタイプ
     * @param enabled - 有効フラグ
     */
    setAudioEffect(effectType: string, enabled: boolean): void { this.configurationManager.setAudioEffect(effectType, enabled); }
    /**
     * 品質設定更新
     * @param qualityConfig - 品質設定
     */
    updateQualitySettings(qualityConfig: any): void { this.configurationManager.updateQualitySettings(qualityConfig); }
    /**
     * シーンを設定
     * @param scene - シーン名
     */
    setScene(scene: string): void { this.currentScene = scene; }
        console.log(`AudioManager: Scene, set to ${scene}`});
    }

    /**
     * BGMのフェードアウト
     * @param duration - フェード時間（ミリ秒）
     */
    async fadeOutBGM(duration: number = 1000): Promise<void> { return new Promise((resolve) => { }
            console.log(`AudioManager: Fading, out BGM, over ${duration}ms`);
            setTimeout(resolve, duration);
        });
    }

    /**
     * ミュート状態を取得
     * @returns ミュート状態
     */
    isMuted(): boolean { return this._isMuted || false; }
    // ========== シーン管理API（委譲パターン） ==========

    /**
     * シーン変更処理
     * @param sceneName - シーン名
     * @param options - シーンオプション
     * @returns 処理成功フラグ
     */
    async onSceneChange(sceneName: string, options: any = {}): Promise<boolean> {
        return await this.subsystemCoordinator.onSceneChange(sceneName, options); }
    // ========== AudioContextコントロール ==========

    /**
     * AudioContextの再開
     */
    async resumeContext(): Promise<void> { await this.contextManager.resumeAudioContext(); }
    // ========== サブシステム委譲メソッド ==========

    /**
     * BGMシステムメソッド委譲
     */''
    playBGM(trackName: string, options: any = { )): any {''
        return this.subsystemCoordinator.delegateToBGMSystem('playBGM', [trackName, options]); }

    stopBGM()';
        return this.subsystemCoordinator.delegateToBGMSystem('stopBGM', []);
    }

    setBGMVolume(volume: number): any { ''
        return this.subsystemCoordinator.delegateToBGMSystem('setVolume', [volume]); }
    /**
     * AudioControllerメソッド委譲'
     */''
    setVolumeLevel(category: string, volume: number, fadeTime: number = 0): any { ''
        return this.subsystemCoordinator.delegateToController('setVolume', [category, volume, fadeTime]); }

    getVolumeLevel(category: string): any { ''
        return this.subsystemCoordinator.delegateToController('getVolume', [category]); }

    fadeInVolume(category: string, duration: number = 1.0, targetVolume: number | null = null): any { ''
        return this.subsystemCoordinator.delegateToController('fadeIn', [category, duration, targetVolume]); }

    fadeOutVolume(category: string, duration: number = 1.0, targetVolume: number = 0): any { ''
        return this.subsystemCoordinator.delegateToController('fadeOut', [category, duration, targetVolume]); }
    /**
     * AudioVisualizerメソッド委譲'
     */''
    enableVisualization(enabled: boolean): any { ''
        return this.subsystemCoordinator.delegateToVisualizer('setEnabled', [enabled]); }

    setVisualizationStyle(style: string): any { ''
        return this.subsystemCoordinator.delegateToVisualizer('setStyle', [style]); }
    // ========== 状態・統計取得 ==========

    /**
     * AudioManagerの状態取得
     * @returns 状態情報
     */
    getAudioManagerState(): AudioManagerState { return { isInitialized: this.isInitialized,
            isEnabled: this.isEnabled;
           , volumes: {
                master: this.masterVolume;
                sfx: this.sfxVolume;
               , bgm: this.bgmVolume, };
                muted: this._isMuted ;
}
            },
            context: this.contextManager.getContextStatus();
            playback: this.playbackController.getPlaybackStats();
            configuration: this.configurationManager.getAllSettings();
            subsystems: this.subsystemCoordinator.getSubsystemStatus();
           , soundGeneration: this.soundGenerator.getGenerationStatus();
        }

    /**
     * ステータス取得（テストで期待されるメソッド）
     * @returns ステータス情報
     */''
    getStatus(''';
            supportedFormats: ['wav', 'mp3', 'ogg'],
            qualityMode: this.qualityMode || 'medium);
        })

    /**
     * マスター音量取得
     * @returns マスター音量
     */
    getMasterVolume(): number { return this.masterVolume; }
    /**
     * 音響効果音量取得
     * @returns 音響効果音量
     */
    getSoundEffectVolume(): number { return this.sfxVolume; }
    /**
     * 背景音楽音量取得
     * @returns 背景音楽音量
     */
    getBackgroundMusicVolume(): number { return this.bgmVolume; }
    /**
     * 利用可能な音響一覧取得
     * @returns 音響名配列
     */'
    getAvailableSounds(): string[] { ''
        return this.soundGenerator.getAvailableSounds()';
    testSound(soundName: string = 'click): boolean {'
        return this.playbackController.testSound(soundName }
    // ========== リソース管理 ==========

    /**
     * リソースの解放
     */''
    dispose()';
        console.log('Disposing, AudioManager (refactored')...');
        
        // 全音響停止
        this.stopAllSounds();
        
        // サブシステムの破棄
        this.subsystemCoordinator.disposeSubsystems();
        
        // 設定管理の破棄
        this.configurationManager.dispose();
        
        // 再生制御の破棄
        this.playbackController.dispose();
        
        // 音響生成の破棄
        this.soundGenerator.dispose();
        
        // コンテキスト管理の破棄
        this.contextManager.dispose();
        
        // ローカル状態のリセット
        this.isInitialized = false;
        this.isEnabled = false;
        this.audioContext = null;
        this.masterGainNode = null;
        this.sfxGainNode = null;
        this.bgmGainNode = null;
        this.soundBuffers.clear();''
        this.activeSources.clear()';
        console.log('AudioManager, disposed successfully);
    }

    // ========== 互換性メソッド ==========

    /**
     * 従来のAPIとの互換性維持のためのプロパティ
     */
    get currentTime(): number { return this.audioContext ? this.audioContext.currentTime: 0, }
    get sampleRate('): number { return this.audioContext ? this.audioContext.sampleRate: 44100, 
    get state('): AudioContextState | 'closed' { ''
        return this.audioContext ? this.audioContext.state: 'closed', }
    // ========== 品質モード管理（パフォーマンステスト対応） ==========
    
    /**
     * 品質モードを設定''
     * @param mode - 品質モード ('low', 'medium', 'high', 'ultra')
     */
    setQualityMode(mode: string): void { if (this.qualitySettings[mode]) {
            this.qualityMode = mode;
            const settings = this.qualitySettings[mode];
            
            // 品質設定を適用
            try {
                if(this.audioContext) {
                    
                }
                    // 実際の設定適用は実装に依存 }
                    console.log(`[AudioManager] 品質モードを${mode}に変更`});''
                } catch (error) {
                console.warn('[AudioManager] 品質モードの変更に失敗:', error); }
        }
    /**
     * 現在の品質モードを取得
     * @returns 現在の品質モード
     */
    getQualityMode(): string { return this.qualityMode; }
    /**
     * 品質設定を取得
     * @param mode - 品質モード（省略時は現在のモード）
     * @returns 品質設定オブジェクト
     */
    getQualitySettings(mode: string = this.qualityMode): QualitySettings { return this.qualitySettings[mode] || this.qualitySettings.high; }
    /**
     * オーディオシステムを無効化
     * エラー復旧やセーフモード時に使用
     */
    disable(): void { try {
            // 全ての再生中音声を停止
            this.stopAllSounds();
            
            // BGMを停止
            this.stopBGM();
            // ミュート状態にする
            this.setMuted(true);
            ';
            // AudioContextを中断
            if(this.audioContext && this.audioContext.state !== 'closed) {'
                
            }
                this.audioContext.suspend(); }
            ';
            // ログ出力頻度を制御（前回と異なる状態の場合のみ）
            if(this.lastLoggedDisableState !== true) {'

                console.log('[AudioManager] オーディオシステムを無効化しました');
            }

                this.lastLoggedDisableState = true;' }'

            } catch (error) {
            console.warn('[AudioManager] 無効化中にエラー:', error); }
    }
    
    /**
     * オーディオシステムを有効化'
     */''
    enable()';
            if(this.audioContext && this.audioContext.state === 'suspended) { this.audioContext.resume(); }
            ';
            // ミュート解除
            this.setMuted(false);

            console.log('[AudioManager] オーディオシステムを有効化しました');''
        } catch (error) {
            console.warn('[AudioManager] 有効化中にエラー:', error); }
    }
// シングルトンインスタンス管理
let audioManagerInstance: AudioManager | null = null,

/**
 * AudioManagerのシングルトンインスタンスを取得
 * @param configManager - 設定管理オブジェクト
 * @param audioConfig - 音響設定オブジェクト
 * @returns シングルトンインスタンス
 */
export function getAudioManager(configManager: ConfigManager, audioConfig: AudioConfig): AudioManager { if (!audioManagerInstance) {
        audioManagerInstance = new AudioManager(configManager, audioConfig); }
    return audioManagerInstance;
}

/**
 * AudioManagerのシングルトンインスタンスを再初期化
 * @param configManager - 設定管理オブジェクト
 * @param audioConfig - 音響設定オブジェクト
 * @returns 新しいシングルトンインスタンス
 */
export function reinitializeAudioManager(configManager: ConfigManager, audioConfig: AudioConfig): AudioManager { if (audioManagerInstance) {
        audioManagerInstance.dispose(); }''
    audioManagerInstance = new AudioManager(configManager, audioConfig);
    return audioManagerInstance;
}

export default AudioManager;