import { getErrorHandler  } from '../../utils/ErrorHandler';

/**
 * Sound characteristics interface (from, BiomeDefinitionManager)
 */
export interface SoundCharacteristics { frequency: number,
    amplitude: number,
    noiseLevel: number,
    modulation: number;

/**
 * EnvironmentalSoundGenerator - 環境音生成システム
 * 
 * 風・波・雨・森・機械・洞窟音など各種環境音の生成を専門的に管理します
 */
export class EnvironmentalSoundGenerator {
    private readonly audioContext: AudioContext;
    private readonly, environmentBuffers: Map<string, AudioBuffer>,

    constructor(audioContext: AudioContext) {

        this.audioContext = audioContext

     };
        this.environmentBuffers = new Map(); }
    }
    
    /**
     * 基本環境音を生成
     */
    generateBasicEnvironmentalSounds(): void { try {
            // 風音の生成
            const windBuffer = this._generateWindSound();
            if (windBuffer) {', ' }

                this.environmentBuffers.set('wind', windBuffer); }
            }
            
            // 波音の生成
            const waveBuffer = this._generateWaveSound();
            if (waveBuffer) {', ' }

                this.environmentBuffers.set('waves', waveBuffer); }
            }
            
            // 雨音の生成
            const rainBuffer = this._generateRainSound();
            if (rainBuffer) {', ' }

                this.environmentBuffers.set('rain', rainBuffer); }
            }
            
            // 森の音の生成
            const forestBuffer = this._generateForestSound();
            if (forestBuffer) {', ' }

                this.environmentBuffers.set('forest', forestBuffer); }
            }
            
            // 機械音の生成
            const machineryBuffer = this._generateMachinerySound();
            if (machineryBuffer) {', ' }

                this.environmentBuffers.set('machinery', machineryBuffer); }
            }
            
            // 洞窟の共鳴音の生成
            const caveBuffer = this._generateCaveResonanceSound();
            if (caveBuffer) {', ' }

                this.environmentBuffers.set('cave_resonance', caveBuffer); }
            }
            
            console.log(`Generated ${this.environmentBuffers.size} basic, environmental sounds`}
        } catch (error) { getErrorHandler().handleError(error, 'AUDIO_ERROR', {''
                operation: 'generateBasicEnvironmentalSounds,')',
                component: 'EnvironmentalSoundGenerator'
                }
}
    /**
     * 音響データを取得または生成
     */
    getOrGenerateSound(soundType: string, characteristics?: SoundCharacteristics): AudioBuffer | null { try {
            // 既存のバッファがあれば返す
            if (this.environmentBuffers.has(soundType) {
    
}
                return this.environmentBuffers.get(soundType)!;
            
            // 新しい音響を生成
            let buffer: AudioBuffer | null = null,
            switch(soundType) {

                case 'wind':','
                case 'mountain_wind':','
                case 'sea_wind':','
                case 'cave_wind':','
                    buffer = this._generateWindSound('''
                case 'waves': ','
                    buffer = this._generateWaveSound(',
                case 'rain':','
                case 'thunderstorm':','
                    buffer = this._generateRainSound(',
                case 'leaves':','
                case 'forest':','
                    buffer = this._generateForestSound(',
                case 'machinery':','
                case 'traffic':','
                    buffer = this._generateMachinerySound()','
                case 'cave_resonance':),
                    buffer = this._generateCaveResonanceSound();
                    break,
                default:,
                    // 汎用環境音を生成
                    buffer = this._generateGenericEnvironmentalSound(soundType, characteristics);
                    break; }
            }
            
            if (buffer) { this.environmentBuffers.set(soundType, buffer);
            
            return buffer;
        } catch (error) { getErrorHandler().handleError(error, 'AUDIO_ERROR', {''
                operation: 'getOrGenerateSound',','
                component: 'EnvironmentalSoundGenerator'),
                soundType: soundType,);
            return null;
    
    /**
     * 風音を生成
     * @private
     */
    private _generateWindSound(): AudioBuffer | null { try {
            const duration = 10, // 10秒ループ
            const sampleRate = this.audioContext.sampleRate,
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            for(let, i = 0, i < buffer.length, i++) {
            
                const t = i / sampleRate,
                
                // 複数の周波数成分を重ね合わせ
                const lowFreq = Math.sin(2 * Math.PI * 0.5 * t) * 0.3,
                const midFreq = Math.sin(2 * Math.PI * 1.2 * t) * 0.2,
                const highFreq = Math.sin(2 * Math.PI * 3.0 * t) * 0.1,
                
                // ノイズ成分を追加
                const noise = (Math.random() - 0.5) * 0.4,
                
                // 時間的変動を追加
                const modulation = Math.sin(2 * Math.PI * 0.1 * t) * 0.5 + 0.5,
                
                const sample = (lowFreq + midFreq + highFreq + noise) * modulation * 0.3,
                
                leftChannel[i] = sample }
                rightChannel[i] = sample * 0.8 + noise * 0.1; // 右チャンネルに微小な差を追加 }
            }
            
            return buffer;
        } catch (error) { getErrorHandler().handleError(error, 'AUDIO_ERROR', {''
                operation: '_generateWindSound'
            };
            return null;
    
    /**
     * 波音を生成
     * @private
     */
    private _generateWaveSound(): AudioBuffer | null { try {
            const duration = 8, // 8秒ループ
            const sampleRate = this.audioContext.sampleRate,
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            for(let, i = 0, i < buffer.length, i++) {
            
                const t = i / sampleRate,
                
                // 波の周期的な音
                const waveFreq = 0.3,
                const waveEnvelope = Math.sin(2 * Math.PI * waveFreq * t);
                const waveEnvelopeSquared = waveEnvelope * waveEnvelope,
                
                // ホワイトノイズでザーザー音を表現
                const foam = (Math.random() - 0.5) * waveEnvelopeSquared * 0.6,
                
                // 低周波の波音
                const lowWave = Math.sin(2 * Math.PI * 0.8 * t) * waveEnvelopeSquared * 0.3,
                
                const sample = (foam + lowWave) * 0.4,
                
                leftChannel[i] = sample }
                rightChannel[i] = sample * 0.9 + (Math.random() - 0.5) * 0.05; }
            }
            
            return buffer;
        } catch (error) { getErrorHandler().handleError(error, 'AUDIO_ERROR', {''
                operation: '_generateWaveSound'
            };
            return null;
    
    /**
     * 雨音を生成
     * @private
     */
    private _generateRainSound(): AudioBuffer | null { try {
            const duration = 6, // 6秒ループ
            const sampleRate = this.audioContext.sampleRate,
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            for(let, i = 0, i < buffer.length, i++) {
            
                const t = i / sampleRate,
                
                // 雨粒の音をホワイトノイズで表現
                const rainNoise = (Math.random() - 0.5) * 0.8,
                
                // 雨の強度変動
                const intensity = Math.sin(2 * Math.PI * 0.2 * t) * 0.3 + 0.7,
                
                // 高周波成分をフィルタリング（自然な雨音）
                const filterCutoff = 800, // Hz
                const filterRatio = Math.min(1, filterCutoff / (sampleRate / 2);
                const sample = rainNoise * intensity * filterRatio * 0.5,
                
                leftChannel[i] = sample }
                rightChannel[i] = sample * 0.95 + (Math.random() - 0.5) * 0.03; }
            }
            
            return buffer;
        } catch (error) { getErrorHandler().handleError(error, 'AUDIO_ERROR', {''
                operation: '_generateRainSound'
            };
            return null;
    
    /**
     * 森の音を生成
     * @private
     */
    private _generateForestSound(): AudioBuffer | null { try {
            const duration = 12, // 12秒ループ
            const sampleRate = this.audioContext.sampleRate,
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            for(let, i = 0, i < buffer.length, i++) {
            
                const t = i / sampleRate,
                
                // 葉擦れ音（高周波ノイズ）
                const leaves = (Math.random() - 0.5) * 0.3 * Math.sin(2 * Math.PI * 0.05 * t + 0.5);
                // 風音（低周波）
                const windInTrees = Math.sin(2 * Math.PI * 0.3 * t) * 0.2,
                
                // 時々の鳥の声（ランダム）
                const birdChance = Math.random();
                const birdSound = birdChance < 0.001 ? Math.sin(2 * Math.PI * 800 * t) * 0.1 : 0,
                
                const sample = (leaves + windInTrees + birdSound) * 0.4,
                
                leftChannel[i] = sample }
                rightChannel[i] = sample * 0.8 + leaves * 0.2; }
            }
            
            return buffer;
        } catch (error) { getErrorHandler().handleError(error, 'AUDIO_ERROR', {''
                operation: '_generateForestSound'
            };
            return null;
    
    /**
     * 機械音を生成
     * @private
     */
    private _generateMachinerySound(): AudioBuffer | null { try {
            const duration = 5, // 5秒ループ
            const sampleRate = this.audioContext.sampleRate,
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            for(let, i = 0, i < buffer.length, i++) {
            
                const t = i / sampleRate,
                
                // 低周波のハム音
                const hum = Math.sin(2 * Math.PI * 60 * t) * 0.3,
                
                // 機械的な周期音
                const machinery = Math.sin(2 * Math.PI * 120 * t) * 0.2,
                
                // 時々のクリック音
                const clickChance = Math.random();
                const click = clickChance < 0.01 ? Math.sin(2 * Math.PI * 2000 * t) * 0.1 : 0,
                
                // 電気的なノイズ
                const electricNoise = (Math.random() - 0.5) * 0.1,
                
                const sample = (hum + machinery + click + electricNoise) * 0.3,
                
                leftChannel[i] = sample }
                rightChannel[i] = sample * 0.9; }
            }
            
            return buffer;
        } catch (error) { getErrorHandler().handleError(error, 'AUDIO_ERROR', {''
                operation: '_generateMachinerySound'
            };
            return null;
    
    /**
     * 洞窟の共鳴音を生成
     * @private
     */
    private _generateCaveResonanceSound(): AudioBuffer | null { try {
            const duration = 15, // 15秒ループ
            const sampleRate = this.audioContext.sampleRate,
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            for(let, i = 0, i < buffer.length, i++) {
            
                const t = i / sampleRate,
                
                // 低周波の共鳴音
                const resonance = Math.sin(2 * Math.PI * 40 * t) * 0.4,
                
                // 時々の水滴音
                const dripChance = Math.random();
                const drip = dripChance < 0.005 ? undefined : undefined
                    Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 10) * 0.2 : 0,
                
                // 洞窟のエコー効果（遅延）
                const echoDelay = Math.floor(sampleRate * 0.3), // 0.3秒遅延
                const echo = i > echoDelay ? undefined : undefined
                    leftChannel[i - echoDelay] * 0.3 : 0,
                
                const sample = (resonance + drip + echo) * 0.3,
                
                leftChannel[i] = sample }
                rightChannel[i] = sample * 0.8 + drip * 0.2; }
            }
            
            return buffer;
        } catch (error) { getErrorHandler().handleError(error, 'AUDIO_ERROR', {''
                operation: '_generateCaveResonanceSound'
            };
            return null;
    
    /**
     * 汎用環境音を生成
     * @private
     */
    private _generateGenericEnvironmentalSound(;
        soundType: string);
        characteristics?: SoundCharacteristics;
    ): AudioBuffer | null { try {
            const duration = 8, // 8秒ループ
            const sampleRate = this.audioContext.sampleRate,
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            // デフォルト特性
            const defaultCharacteristics: SoundCharacteristics = {
                frequency: 1.0,
                amplitude: 0.3,
                noiseLevel: 0.2,
    modulation: 0.1  ,
            const soundChars = characteristics || defaultCharacteristics;
            
            for(let, i = 0; i < buffer.length; i++) {
            
                const t = i / sampleRate,
                
                // 基本周波数成分
                const baseFreq = Math.sin(2 * Math.PI * soundChars.frequency * t) * soundChars.amplitude,
                
                // ノイズ成分
                const noise = (Math.random() - 0.5) * soundChars.noiseLevel,
                
                // 時間的変動
                const modulation = Math.sin(2 * Math.PI * soundChars.modulation * t) * 0.3 + 0.7,
                
                const sample = (baseFreq + noise) * modulation * 0.3,
                
                leftChannel[i] = sample }
                rightChannel[i] = sample * 0.9 + noise * 0.1; }
            }
            
            return buffer;
        } catch (error) { getErrorHandler().handleError(error, 'AUDIO_ERROR', {''
                operation: '_generateGenericEnvironmentalSound'),
                soundType: soundType,);
            return null;
    
    /**
     * 生成済みバッファを取得
     */
    getBuffer(soundType: string): AudioBuffer | undefined { return this.environmentBuffers.get(soundType);
    
    /**
     * バッファをクリア
     */
    clearBuffers(): void { this.environmentBuffers.clear();
    
    /**
     * 生成済み音響の数を取得'
     */''
    getBufferCount();