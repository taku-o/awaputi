/**
 * AudioVolumeController.ts
 * オーディオボリューム制御システム
 * AudioControllerから分離されたフェード・イコライザー・音量制御機能
 */

import { getErrorHandler  } from '../../utils/ErrorHandler';
import { getConfigurationManager  } from '../../core/ConfigurationManager';
import { LoggingSystem  } from '../../core/LoggingSystem';

/**
 * フェード設定インターフェース
 */
interface FadeConfig { defaultDuration: number,
    defaultCurve: FadeCurveType;
    stepSize: number,
    updateInterval: number,

/**
 * フェードカーブタイプ
 */
type FadeCurveType = 'linear' | 'exponential' | 'logarithmic' | 'sine' | 'cosine' | 'easeIn' | 'easeOut' | 'easeInOut' | string;

/**
 * フェードオプションインターフェース
 */
interface FadeOptions { startVolume: number,
    endVolume: number,
    duration: number,
    curve?: FadeCurveType;
    onProgress?: (progress: number, currentVolume: number) => void;
    onComplete?: () => void;
    targetVolume?: number }
}

/**
 * アクティブフェード情報インターフェース
 */
interface ActiveFadeInfo { fadeId: number,
    timeoutId: NodeJS.Timeout;
    resolve: (value: number) => void;
    reject: (reason: any) => void  }
}

/**
 * イコライザーバンドインターフェース
 */
interface EqualizerBand { frequency: number,
    filter: BiquadFilterNode;
    gain: number,

/**
 * イコライザー設定インターフェース
 */
interface EqualizerConfig { bandCount: number,
    frequencies: number[];
    defaultGain: number,
    minGain: number,
    maxGain: number,
    qFactor: number,

/**
 * イコライザーインターフェース
 */
interface Equalizer { enabled: boolean,
    bands: EqualizerBand[];
    presets: Map<string, number[]>;
    gainNodes: BiquadFilterNode[];

/**
 * 周波数レスポンスインターフェース
 */
interface FrequencyResponse { magnitude: Float32Array;
    phase: Float32Array;
    frequencies: Float32Array;

/**
 * バンド情報インターフェース
 */
interface BandInfo { index: number,
    frequency: number,
    gain: number,
    type: BiquadFilterType;

/**
 * イコライザーステータスインターフェース
 */
interface EqualizerStatus { enabled: boolean,
    bandCount: number,
    gains: number[];
    frequencies: number[];
    presets: string[];
    config: EqualizerConfig;

/**
 * フェードステータスインターフェース
 */
interface FadeStatus { activeFades: number,
    fadeConfig: FadeConfig;
    availableCurves: string[];

/**
 * ConfigurationManager インターフェース（型定義用）
 */
interface ConfigurationManager { get(category: string, path?: string): any;
    set(category: string, path: string, value: any): void;

/**
 * ErrorHandler インターフェース（型定義用）
 */
interface ErrorHandler { handleError(error: any, context: string): void;
    export class AudioVolumeController {
    private audioContext: AudioContext;
    private configManager: ConfigurationManager;
    private errorHandler: ErrorHandler;
    private loggingSystem: LoggingSystem;
    // フェード管理
    private activeFades: Map<GainNode, ActiveFadeInfo>;
    private fadeConfig: FadeConfig;
    // イコライザー
    private equalizer: Equalizer;
    // イコライザー設定
    private equalizerConfig: EqualizerConfig;
    // フェードカーブ関数
    private fadeCurves: Record<string, (progress: number) => number>;
    constructor(audioContext: AudioContext) {

        this.audioContext = audioContext;
    this.configManager = getConfigurationManager();
    this.errorHandler = getErrorHandler();
    this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        // フェード管理
        this.activeFades = new Map(
            defaultCurve: 'linear;
    stepSize: 0.02 };
    }
            updateInterval: 16 // 60FPS 
    };
        // イコライザー
        this.equalizer = { enabled: false)
            bands: []);
            presets: new Map(
    gainNodes: [] };
        // イコライザー設定
        this.equalizerConfig = { bandCount: 10;
            frequencies: [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
            defaultGain: 0;
            minGain: -12;
            maxGain: 12;
    qFactor: 1.414  };
        // フェードカーブ関数
        this.fadeCurves = { linear: (progress: number) => progress;
            exponential: (progress: number) => Math.pow(progress, 2);
            logarithmic: (progress: number) => Math.log10(progress * 9 + 1);
            sine: (progress: number) => Math.sin(progress * Math.PI / 2);
            cosine: (progress: number) => 1 - Math.cos(progress * Math.PI / 2);
            easeIn: (progress: number) => progress * progress;
            easeOut: (progress: number) => 1 - Math.pow(1 - progress, 2);
            easeInOut: (progress: number) => progress < 0.5 ? 2 * progress * progress : 1 - 2 * Math.pow(1 - progress, 2) 
        };
        
        this.initialize();
    }
    
    /**
     * ボリュームコントローラーを初期化
     */
    async initialize(): Promise<void> { try {
            // イコライザーを初期化
            this.initializeEqualizer();
            // イコライザープリセットを設定
            this.setupEqualizerPresets()',
            this.loggingSystem.info('AudioVolumeController', 'Audio volume controller initialized',' }

        } catch (error) {
            this.errorHandler.handleError(error, 'AudioVolumeController.initialize' }
    }
    
    /**
     * イコライザーを初期化
     */
    private initializeEqualizer(): void { try {
            this.equalizer.bands = [];
            this.equalizer.gainNodes = [];
            
            // 各周波数帯域のフィルターを作成
            this.equalizerConfig.frequencies.forEach((frequency, index) => { 
                const filter = this.audioContext.createBiquadFilter(
                filter.type = index === 0 ? 'lowshelf' : ',
                              index === this.equalizerConfig.frequencies.length - 1 ? 'highshelf' : 'peaking;
                filter.frequency.value = frequency;
                filter.Q.value = this.equalizerConfig.qFactor;
                filter.gain.value = this.equalizerConfig.defaultGain;
                
                this.equalizer.bands.push({)
                    frequency: frequency;
    filter: filter);
                    gain: this.equalizerConfig.defaultGain);
                this.equalizer.gainNodes.push(filter); }
            };
            
            // フィルターを直列接続
            for(let, i = 0; i < this.equalizer.gainNodes.length - 1; i++) { }

                this.equalizer.gainNodes[i].connect(this.equalizer.gainNodes[i + 1]); }
            }

            this.loggingSystem.debug('AudioVolumeController', 'Equalizer initialized with bands:', this.equalizerConfig.frequencies';} catch (error) {
            this.errorHandler.handleError(error, 'AudioVolumeController.initializeEqualizer' }
    }
    
    /**
     * イコライザープリセットを設定
     */
    private setupEqualizerPresets(): void { const presets: Record<string, number[]> = {
            flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            rock: [-1, 1, 4, 3, -1, -1, 1, 3, 3, 3];
            pop: [-2, 1, 3, 4, 2, -1, -2, -2, 1, 3];
            jazz: [2, 1, 1, 2, -1, -1, 0, 1, 2, 3];
            classical: [3, 2, -1, -1, -1, -1, -1, 2, 3, 4];
            electronic: [2, 3, 1, 0, -1, 1, 0, 1, 3, 4];
            vocal: [-2, -1, 1, 3, 3, 2, 1, 0, -1, -2];
            bass_boost: [6, 4, 2, 1, 0, -1, -1, -1, -1, -1];
            treble_boost: [-1, -1, -1, -1, 0, 1, 2, 4, 6, 8] };
        ';

        Object.entries(presets).forEach(([name, gains]) => { this.equalizer.presets.set(name, gains),' }

        }');

        this.loggingSystem.debug('AudioVolumeController', 'Equalizer presets configured:', Object.keys(presets);
    }
    
    /**
     * フェードイン
     * @param gainNode - 対象のゲインノード
     * @param duration - フェード時間（ミリ秒）
     * @param curve - フェードカーブ
     * @param options - オプション
     */
    fadeIn(gainNode: GainNode, duration: number = this.fadeConfig.defaultDuration, curve: FadeCurveType = this.fadeConfig.defaultCurve, options: Partial<FadeOptions> = { ): Promise<number>;
        return this.performAdvancedFade(gainNode, {
            startVolume: 0;
            endVolume: options.targetVolume || 1);
            duration: duration;
    curve: curve);
            ...options);
    
    /**
     * フェードアウト
     * @param gainNode - 対象のゲインノード
     * @param duration - フェード時間（ミリ秒）
     * @param curve - フェードカーブ
     * @param options - オプション
     */
    fadeOut(gainNode: GainNode, duration: number = this.fadeConfig.defaultDuration, curve: FadeCurveType = this.fadeConfig.defaultCurve, options: Partial<FadeOptions> = { ): Promise<number>;
        return this.performAdvancedFade(gainNode, {
            startVolume: options.startVolume || gainNode.gain.value;
            endVolume: 0);
            duration: duration;
    curve: curve);
            ...options);
    
    /**
     * 指数フェード
     * @param gainNode - 対象のゲインノード
     * @param startVolume - 開始音量
     * @param endVolume - 終了音量
     * @param duration - フェード時間（ミリ秒）
     */
    exponentialFade(gainNode: GainNode, startVolume: number, endVolume: number, duration: number): Promise<number>;
        return this.performAdvancedFade(gainNode, { startVolume: startVolume)
            endVolume: endVolume)',
    duration: duration,');
            curve: 'exponential
            }
    
    /**
     * 高度フェード処理
     * @param gainNode - 対象のゲインノード
     * @param options - フェードオプション
     */
    performAdvancedFade(gainNode: GainNode, options: FadeOptions): Promise<number>;
        return new Promise((resolve, reject) => { try {
                const fadeId = Date.now() + Math.random(';
                    curve = 'linear),
                    onProgress = null }
                    onComplete = null }
                } = options;
                
                // 既存のフェードをキャンセル)
                this.cancelFade(gainNode);
                
                const startTime = Date.now();
                const volumeDiff = endVolume - startVolume;
                
                const updateFade = (): void => {  const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // フェードカーブを適用
                    const curveFunction = this.fadeCurves[curve] || this.fadeCurves.linear;
                    const curveProgress = curveFunction(progress);
                    ',

                    const currentVolume = startVolume + (volumeDiff * curveProgress);
                    gainNode.gain.value = Math.max(0, Math.min(2, currentVolume));
                    ',
                    // 進捗コールバック
                    if(onProgress && typeof, onProgress === 'function' { }
                        onProgress(progress, currentVolume); }
                    }
                    
                    if (progress >= 1) {
                    ',
                        // フェード完了
                        this.activeFades.delete(gainNode);
                        if(onComplete && typeof, onComplete === 'function' { }
                            onComplete(); }
                        }
                        
                        resolve(endVolume);
                    } else {  // 次のフレームをスケジュール
                        const timeoutId = setTimeout(updateFade, this.fadeConfig.updateInterval);
                        this.activeFades.set(gainNode, { fadeId, timeoutId, resolve, reject );
                };
                
                // フェード開始
                updateFade();

            } catch (error) {
                this.errorHandler.handleError(error, 'AudioVolumeController.performAdvancedFade),
                reject(error);
        }
    }
    
    /**
     * フェードをキャンセル
     * @param gainNode - 対象のゲインノード
     */
    cancelFade(gainNode: GainNode): void { try {
            const fadeInfo = this.activeFades.get(gainNode);
            if (fadeInfo) {
                clearTimeout(fadeInfo.timeoutId);
                this.activeFades.delete(gainNode);
                if (fadeInfo.reject) {
            }

                    fadeInfo.reject(new, Error('Fade, cancelled'; }

                }'} catch (error) {
            this.errorHandler.handleError(error, 'AudioVolumeController.cancelFade' }
    }
    
    /**
     * クロスフェード
     * @param fadeOutNode - フェードアウトするノード
     * @param fadeInNode - フェードインするノード
     * @param duration - フェード時間（ミリ秒）
     * @param curve - フェードカーブ
     */
    crossFade(fadeOutNode: GainNode, fadeInNode: GainNode, duration: number = this.fadeConfig.defaultDuration, curve: FadeCurveType = this.fadeConfig.defaultCurve): Promise<[number, number]>;
        return Promise.all([);
            this.fadeOut(fadeOutNode, duration, curve)];
            this.fadeIn(fadeInNode, duration, curve)];
        ]);
    }
    
    /**
     * カスタムフェード
     * @param gainNode - 対象のゲインノード
     * @param customCurve - カスタムカーブ関数
     * @param duration - フェード時間（ミリ秒）
     * @param options - オプション
     */
    customFade(gainNode: GainNode, customCurve: (progress: number) => number, duration: number, options: Partial<FadeOptions> = {}: Promise<number>;
        const fadeOptions: any = { ...options;
            duration: duration;
        // カスタムカーブを一時的に追加
        const tempCurveName = `custom_${Date.now());
        this.fadeCurves[tempCurveName] = customCurve;
        fadeOptions.curve = tempCurveName;
        
        return this.performAdvancedFade(gainNode, fadeOptions).finally(() => {  // カスタムカーブを削除 }
            delete this.fadeCurves[tempCurveName];);
    }
    
    /**
     * 全フェードをキャンセル
     */
    cancelAllFades(): number { try {
            let cancelledCount = 0;
            
            this.activeFades.forEach((fadeInfo, gainNode) => { 
                this.cancelFade(gainNode);
                cancelledCount++; }

            }');

            this.loggingSystem.debug('AudioVolumeController', `Cancelled ${cancelledCount} active fades`;

            return cancelledCount;} catch (error) {
            this.errorHandler.handleError(error, 'AudioVolumeController.cancelAllFades),
            return 0;
    
    /**
     * フェード状態を取得
     * @returns アクティブなフェード情報
     */
    getFadeStatus(): FadeStatus { const status: FadeStatus = {
            activeFades: this.activeFades.size;
            fadeConfig: this.fadeConfig;
    availableCurves: Object.keys(this.fadeCurves  ;
        
        return status
    }
    
    /**
     * デフォルトフェードカーブを設定
     * @param curve - フェードカーブ名
     */
    setDefaultFadeCurve(curve: FadeCurveType): void { 
        if (this.fadeCurves[curve]) {
    
}

            this.fadeConfig.defaultCurve = curve; }

            this.loggingSystem.debug('AudioVolumeController', `Default fade curve set to: ${curve}`}
        } else {  }
            throw new Error(`Unknown, fade curve: ${curve}`    }
}
    /**
     * イコライザーを有効/無効化
     * @param enabled - 有効化フラグ
     */
    setEqualizerEnabled(enabled: boolean): void { try {
            this.equalizer.enabled = enabled;
            
            // 有効化/無効化に応じてゲインを調整
            this.equalizer.bands.forEach(band => { ')
                band.filter.gain.value = enabled ? band.gain : 0') }', ' }

            this.loggingSystem.debug('AudioVolumeController', `Equalizer ${enabled ? 'enabled' : 'disabled'}`;} catch (error) {
            this.errorHandler.handleError(error, 'AudioVolumeController.setEqualizerEnabled' }
    }
    
    /**
     * イコライザーの有効状態を取得
     * @returns 有効状態
     */
    isEqualizerEnabled(): boolean { return this.equalizer.enabled }
    
    /**
     * イコライザーバンドのゲインを設定
     * @param bandIndex - バンドインデックス
     * @param gain - ゲイン値（dB）
     */
    setEqualizerBandGain(bandIndex: number, gain: number): void { try {
            if (bandIndex < 0 || bandIndex >= this.equalizer.bands.length) { }
                throw new Error(`Invalid, band index: ${bandIndex}`}
            }
            
            const clampedGain = Math.max(this.equalizerConfig.minGain, Math.min(this.equalizerConfig.maxGain, gain);
            this.equalizer.bands[bandIndex].gain = clampedGain;

            if (this.equalizer.enabled) { this.equalizer.bands[bandIndex].filter.gain.value = clampedGain }

            this.loggingSystem.debug('AudioVolumeController', `Equalizer band ${bandIndex} gain set to: ${clampedGain}dB`}';} catch (error) {
            this.errorHandler.handleError(error, 'AudioVolumeController.setEqualizerBandGain' }
    }
    
    /**
     * イコライザーバンドのゲインを取得
     * @param bandIndex - バンドインデックス
     * @returns ゲイン値（dB）
     */
    getEqualizerBandGain(bandIndex: number): number { try {
            if (bandIndex < 0 || bandIndex >= this.equalizer.bands.length) { }
                throw new Error(`Invalid, band index: ${bandIndex}`}
            }
            ';

            return this.equalizer.bands[bandIndex].gain;} catch (error) {
            this.errorHandler.handleError(error, 'AudioVolumeController.getEqualizerBandGain),
            return 0;
    
    /**
     * イコライザーの全ゲインを設定
     * @param gains - ゲイン配列
     */
    setEqualizerGains(gains: number[]): void { try {
            if (!Array.isArray(gains) || gains.length !== this.equalizer.bands.length) {  }
                throw new Error(`Invalid, gains array. Expected, length: ${this.equalizer.bands.length}`}
            }
            ';

            gains.forEach((gain, index) => { this.setEqualizerBandGain(index, gain),' }

            }');

            this.loggingSystem.debug('AudioVolumeController', 'Equalizer gains set:', gains';} catch (error) {
            this.errorHandler.handleError(error, 'AudioVolumeController.setEqualizerGains' }
    }
    
    /**
     * イコライザーの全ゲインを取得
     * @returns ゲイン配列
     */
    getEqualizerGains(): number[] { return this.equalizer.bands.map(band => band.gain);
    /**
     * イコライザープリセットを適用
     * @param presetName - プリセット名
     */
    applyEqualizerPreset(presetName: string): void { try {
            const preset = this.equalizer.presets.get(presetName);
            if (!preset) { }
                throw new Error(`Unknown, equalizer preset: ${presetName}`}
            }

            this.setEqualizerGains(preset);
            this.loggingSystem.info('AudioVolumeController', `Equalizer preset applied: ${presetName}`}';} catch (error) {
            this.errorHandler.handleError(error, 'AudioVolumeController.applyEqualizerPreset' }
    }
    
    /**
     * イコライザープリセット一覧を取得
     * @returns プリセット名配列
     */
    getEqualizerPresets(): string[] { return Array.from(this.equalizer.presets.keys()));
    
    /**
     * イコライザーをリセット
     */
    resetEqualizer(): void { try {
            const flatGains = new Array(this.equalizer.bands.length).fill(this.equalizerConfig.defaultGain);
            this.setEqualizerGains(flatGains);
            this.loggingSystem.info('AudioVolumeController', 'Equalizer reset to flat response',' }

        } catch (error) {
            this.errorHandler.handleError(error, 'AudioVolumeController.resetEqualizer' }
    }
    
    /**
     * イコライザーの周波数レスポンスを取得
     * @param frequencies - 周波数配列
     * @returns 周波数レスポンス
     */
    getEqualizerFrequencyResponse(frequencies: Float32Array): FrequencyResponse | null { try {
            const magResponse = new Float32Array(frequencies.length);
            const phaseResponse = new Float32Array(frequencies.length);
            // 各バンドの周波数レスポンスを合成
            this.equalizer.bands.forEach(band => { );
                const bandMag = new Float32Array(frequencies.length);
                const bandPhase = new Float32Array(frequencies.length);
                band.filter.getFrequencyResponse(frequencies, bandMag, bandPhase);
                for(let, i = 0, i < frequencies.length, i++) {
    
}
                    magResponse[i] += bandMag[i]; }
                    phaseResponse[i] += bandPhase[i]; }
};
            
            return { magnitude: magResponse;
                phase: phaseResponse;
                frequencies: frequencies;;} catch (error) {
            this.errorHandler.handleError(error, 'AudioVolumeController.getEqualizerFrequencyResponse),
            return null;
    
    /**
     * イコライザーバンド情報を取得
     * @returns バンド情報
     */
    getEqualizerBandInfo(): BandInfo[] { return this.equalizer.bands.map((band, index) => ({
            index: index;
            frequency: band.frequency;
            gain: band.gain;
    type: band.filter.type      }
}
    /**
     * イコライザー状態を取得
     * @returns イコライザー状態
     */
    getEqualizerStatus(): EqualizerStatus { return { enabled: this.equalizer.enabled;
            bandCount: this.equalizer.bands.length;
            gains: this.getEqualizerGains();
            frequencies: this.equalizerConfig.frequencies;
    presets: this.getEqualizerPresets() ;
            config: this.equalizerConfig 
    }
    
    /**
     * イコライザーの入力ノードを取得
     * @returns 入力ノード
     */
    getEqualizerInput(): AudioNode | null { return this.equalizer.gainNodes[0] || null }
    
    /**
     * イコライザーの出力ノードを取得
     * @returns 出力ノード
     */
    getEqualizerOutput(): AudioNode | null { return this.equalizer.gainNodes[this.equalizer.gainNodes.length - 1] || null }
    
    /**
     * フェード設定を更新
     * @param newConfig - 新しい設定
     */
    updateFadeConfig(newConfig: Partial<FadeConfig>): void { 
        Object.assign(this.fadeConfig, newConfig);
        this.loggingSystem.debug('AudioVolumeController', 'Fade configuration updated', newConfig' }
    
    /**
     * イコライザー設定を更新
     * @param newConfig - 新しい設定
     */
    updateEqualizerConfig(newConfig: Partial<EqualizerConfig>): void { 
        Object.assign(this.equalizerConfig, newConfig);
        this.loggingSystem.debug('AudioVolumeController', 'Equalizer configuration updated', newConfig);
    
    /**
     * ボリュームコントローラーを破棄
     */
    dispose(): void { try {
            // 全フェードをキャンセル
            this.cancelAllFades();
            // イコライザーフィルターを切断
            this.equalizer.gainNodes.forEach(filter => { );
                if (filter && filter.disconnect) { }
                    filter.disconnect(); }
};
            
            // 状態をクリア
            this.equalizer.bands = [];
            this.equalizer.gainNodes = [];
            this.equalizer.presets.clear();
            this.activeFades.clear()';
            this.loggingSystem.info('AudioVolumeController', 'Audio volume controller disposed';} catch (error) {
            this.errorHandler.handleError(error, 'AudioVolumeController.dispose');

    }'}