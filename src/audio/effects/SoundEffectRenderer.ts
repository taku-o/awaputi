/**
 * SoundEffectRenderer.ts
 * サウンドエフェクトレンダリングシステム
 * SoundEffectSystemから分離されたサウンド生成・レンダリング機能
 */

import { getErrorHandler  } from '../../utils/ErrorHandler';
import { getConfigurationManager  } from '../../core/ConfigurationManager';

/**
 * エンベロープ設定インターフェース
 */
interface EnvelopeConfig { attack: number,
    decay: number,
    sustain: number,
    release: number  }

/**
 * ハーモニクス設定インターフェース
 */
interface HarmonicsConfig { harmonics?: number[] }

/**
 * モジュレーション設定インターフェース
 */
interface ModulationConfig { modulation?: {
        rat,e: number,
    depth: number  }

/**
 * フィルタースイープ設定インターフェース
 */
interface FilterSweepConfig { filterSweep?: {
        start: number,
    end: number  }

/**
 * ピッチスライド設定インターフェース
 */
interface PitchSlideConfig { pitchSlide?: {
        start: number,
    end: number  }

/**
 * サウンド設定ベースインターフェース
 */
interface BaseSoundConfig { baseFreq: number,

    duration: number,
    waveType: OscillatorType | 'noise',
    envelope: EnvelopeConfig
     }

/**
 * 泡サウンド設定インターフェース
 */
interface BubbleSoundConfig extends BaseSoundConfig, HarmonicsConfig, ModulationConfig, FilterSweepConfig, PitchSlideConfig {}

/**
 * UIサウンド設定インターフェース
 */
interface UISoundConfig extends BaseSoundConfig { chord?: number[] }

/**
 * コンボサウンド設定インターフェース
 */
interface ComboSoundConfig { baseFreq: number,
    duration: number,
    harmonics: number[]  }

/**
 * 実績サウンド設定インターフェース
 */
interface AchievementSoundConfig { baseFreq: number,
    duration: number,
    waveType: OscillatorType | 'noise',
    melody: number[]  }

/**
 * サウンド生成設定インターフェース
 */
interface GenerationConfig { sampleRate: number,
    defaultDuration: number,
    fadeTime: number,
    maxFrequency: number,
    minFrequency: number }

/**
 * 泡タイプ'
 */''
type BubbleType = 'normal' | 'stone' | 'iron' | 'diamond' | 'rainbow' | 'electric' | 'golden' | 'frozen' | 'boss' | 'escaping';

/**
 * UIサウンドタイプ'
 */''
type UISoundType = 'click' | 'hover' | 'success' | 'error';

/**
 * 実績レアリティ'
 */''
type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * バリエーションオプションインターフェース
 */
interface VariationOptions { pitchShift: number,
    timeStretch: number,
    volumeVariation: number  }

/**
 * レンダリング統計インターフェース
 */
interface RenderingStatistics { supportedBubbleTypes: number,
    supportedUITypes: number,
    supportedComboLevels: number,
    supportedAchievementRarities: number,
    sampleRate: number,
    defaultDuration: number }

/**
 * ConfigurationManager インターフェース（型定義用）
 */
interface ConfigurationManager { get(category: string): any }

/**
 * ErrorHandler インターフェース（型定義用）
 */
interface ErrorHandler { handleError(error: any, context: string): void  }

export class SoundEffectRenderer {
    private audioContext: AudioContext,
    private configManager: ConfigurationManager,
    private errorHandler: ErrorHandler,
    // サウンド生成設定
    private generationConfig: GenerationConfig,
    // 泡タイプ別サウンド設定
    private, bubbleSoundConfigs: Record<BubbleType, BubbleSoundConfig>,
    
    // UIサウンド設定
    private uiSoundConfigs: Record<UISoundType, UISoundConfig>,
    
    // コンボサウンド設定
    private comboSoundConfigs: Record<number, ComboSoundConfig>,
    
    // 実績サウンド設定
    private achievementSoundConfigs: Record<AchievementRarity, AchievementSoundConfig>,

    constructor(audioContext: AudioContext) {

        this.audioContext = audioContext,
        this.configManager = getConfigurationManager(),
        this.errorHandler = getErrorHandler('}

                waveType: 'sine'
            }
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.15  },
            stone: { baseFreq: 300,
    duration: 0.4,
                waveType: 'sawtooth'
            }
                envelope: { attack: 0.1, decay: 0.2, sustain: 0.2, release: 0.2  },
            iron: { baseFreq: 250,
    duration: 0.5,
                waveType: 'square'
            }
                envelope: { attack: 0.1, decay: 0.15, sustain: 0.25, release: 0.25  },
            diamond: { baseFreq: 1200,
    duration: 0.6,
                waveType: 'triangle'
            }
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.4, release: 0.3  },
            rainbow: { baseFreq: 600,
    duration: 0.8,
                waveType: 'sine'
            }
                envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.4  },
                harmonics: [1, 1.5, 2, 2.5, 3];
            },
            electric: { baseFreq: 1000,
    duration: 0.2,
                waveType: 'sawtooth'
            }
                envelope: { attack: 0.01, decay: 0.05, sustain: 0.1, release: 0.1  },
                modulation: { rate: 20, depth: 0.3  },
            golden: { baseFreq: 900,
    duration: 0.7,
                waveType: 'triangle'
            }
                envelope: { attack: 0.1, decay: 0.2, sustain: 0.35, release: 0.35  },
                harmonics: [1, 2, 3];
            },
            frozen: { baseFreq: 400,
    duration: 0.4,
                waveType: 'sine'
            }
                envelope: { attack: 0.2, decay: 0.1, sustain: 0.1, release: 0.2  },
                filterSweep: { start: 2000, end: 200  },
            boss: { baseFreq: 150,
    duration: 1.0,
                waveType: 'square'
            }
                envelope: { attack: 0.15, decay: 0.3, sustain: 0.4, release: 0.4  },
                harmonics: [1, 0.5, 0.25, 0.125],
                modulation: { rate: 5, depth: 0.2  },
            escaping: { baseFreq: 1200,
    duration: 0.15,
                waveType: 'sine'
            }
                envelope: { attack: 0.01, decay: 0.05, sustain: 0.05, release: 0.05  },
                pitchSlide: { start: 1200, end: 1800  }
        };
        
        // UIサウンド設定
        this.uiSoundConfigs = { click: { 
                baseFreq: 1000,

                duration: 0.1,
                waveType: 'square'
            }
                envelope: { attack: 0.01, decay: 0.02, sustain: 0.05, release: 0.03  },
            hover: { baseFreq: 800,
    duration: 0.15,
                waveType: 'sine'
            }
                envelope: { attack: 0.02, decay: 0.03, sustain: 0.08, release: 0.05  },
            success: { baseFreq: 600,
    duration: 0.4,
                waveType: 'triangle'
            }
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.15, release: 0.2  },
                chord: [1, 1.25, 1.5] // メジャーコード;
            },
            error: { baseFreq: 200,
    duration: 0.3,
                waveType: 'sawtooth'
            }
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.1, release: 0.15  }
        };
        
        // コンボサウンド設定
        this.comboSoundConfigs = {
            1: { baseFreq: 500, duration: 0.2, harmonics: [1]  },
            2: { baseFreq: 600, duration: 0.25, harmonics: [1, 1.5] },
            3: { baseFreq: 700, duration: 0.3, harmonics: [1, 1.5, 2] },
            4: { baseFreq: 800, duration: 0.35, harmonics: [1, 1.5, 2, 2.5] },
            5: { baseFreq: 900, duration: 0.4, harmonics: [1, 1.5, 2, 2.5, 3] };
        
        // 実績サウンド設定
        this.achievementSoundConfigs = { common: { 
                baseFreq: 600,

                duration: 0.8,
                waveType: 'triangle',
    melody: [1, 1.25, 1.5, 2] },
            rare: { baseFreq: 700,
    duration: 1.0,
                waveType: 'sine',
    melody: [1, 1.33, 1.67, 2, 2.5] },
            epic: { baseFreq: 800,
    duration: 1.2,
                waveType: 'triangle',
    melody: [1, 1.25, 1.5, 1.75, 2, 2.5, 3] },
            legendary: { baseFreq: 900,
    duration: 1.5, ')',
                waveType: 'sine',
    melody: [1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.5, 3] }
        }
    
    /**
     * 泡破壊音を生成
     */
    generateBubbleSound(bubbleType: BubbleType, variation: number = 0): AudioBuffer | null { try {
            const config = this.bubbleSoundConfigs[bubbleType],
            if(!config) {', ' }

                console.warn(`[SoundEffectRenderer] Unknown bubble type: ${bubbleType}`},' }

                return this.generateBubbleSound('normal', variation});
            }
            
            const duration = config.duration;
            const buffer = this.audioContext.createBuffer(1, this.generationConfig.sampleRate * duration, this.generationConfig.sampleRate);
            const channelData = buffer.getChannelData(0);
            
            // バリエーションによる周波数調整
            const baseFreq = config.baseFreq * (1 + (variation * 0.1));
            
            // エンベロープパラメータ
            const envelope = config.envelope;
            const attackSamples = envelope.attack * this.generationConfig.sampleRate;
            const decaySamples = envelope.decay * this.generationConfig.sampleRate;
            const sustainSamples = envelope.sustain * this.generationConfig.sampleRate;
            const releaseSamples = envelope.release * this.generationConfig.sampleRate;
            
            // サウンド生成
            for(let, i = 0; i < channelData.length; i++) {
                const time = i / this.generationConfig.sampleRate,
                let amplitude = this.calculateEnvelope(i, attackSamples, decaySamples, sustainSamples, releaseSamples, channelData.length),
                
                // 基本波形
                let sample = this.generateWaveform(config.waveType, baseFreq, time),
                
                // ハーモニクス追加
                if (config.harmonics) {
                    config.harmonics.forEach((harmonic, index) => { 
                        if (index > 0) { // 基音は既に追加済み
                            const harmonicFreq = baseFreq * harmonic }
                            const harmonicAmp = 1 / (index + 1); // 高次倍音ほど小さく }
                            sample += this.generateWaveform(config.waveType, harmonicFreq, time) * harmonicAmp; }
});
                    sample /= config.harmonics.length; // 正規化
                }
                
                // モジュレーション追加
                if(config.modulation) {
                    const modValue = Math.sin(2 * Math.PI * config.modulation.rate * time) * config.modulation.depth }
                    amplitude *= (1 + modValue); }
                }
                
                // フィルタースイープ
                if(config.filterSweep) {
                    const progress = time / duration,
                    const cutoffFreq = config.filterSweep.start + (config.filterSweep.end - config.filterSweep.start) * progress,
                    // 簡易ローパスフィルター効果をシミュレート
                    if (baseFreq > cutoffFreq) {
                }
                        amplitude *= cutoffFreq / baseFreq; }
}
                
                channelData[i] = sample * amplitude * 0.3; // 全体音量調整
            }
            
            return buffer;

        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectRenderer.generateBubbleSound),
            return this.generateFallbackSound(0.3),
    
    /**
     * UIサウンドを生成
     */
    generateUISound(uiType: UISoundType): AudioBuffer | null { try {
            const config = this.uiSoundConfigs[uiType],
            if(!config) {
    
}
                console.warn(`[SoundEffectRenderer] Unknown UI sound type: ${uiType}`} }
                return this.generateFallbackSound(0.1});
            }
            
            const duration = config.duration;
            const buffer = this.audioContext.createBuffer(1, this.generationConfig.sampleRate * duration, this.generationConfig.sampleRate);
            const channelData = buffer.getChannelData(0);
            
            for(let, i = 0; i < channelData.length; i++) {
            
                const time = i / this.generationConfig.sampleRate,
                let amplitude = this.calculateSimpleEnvelope(i, channelData.length, config.envelope),
                
                let sample = 0,
                
                // コード音の場合
                if (config.chord) {
    
}
                    config.chord.forEach(ratio => { ) }
                        sample += this.generateWaveform(config.waveType, config.baseFreq * ratio, time); }
                    });
                    sample /= config.chord.length;
                } else { sample = this.generateWaveform(config.waveType, config.baseFreq, time) }
                
                channelData[i] = sample * amplitude * 0.2;
            }
            
            return buffer;

        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectRenderer.generateUISound),
            return this.generateFallbackSound(0.1),
    
    /**
     * コンボサウンドを生成
     */
    generateComboSound(level: number): AudioBuffer | null { try {
            const config = this.comboSoundConfigs[level] || this.comboSoundConfigs[5],
            const duration = config.duration,
            const buffer = this.audioContext.createBuffer(1, this.generationConfig.sampleRate * duration, this.generationConfig.sampleRate),
            const channelData = buffer.getChannelData(0),
            
            for(let, i = 0, i < channelData.length, i++) {
            
                const time = i / this.generationConfig.sampleRate,
                let amplitude = this.calculateSimpleEnvelope(i, channelData.length),
                
                let sample = 0,
                
                // ハーモニクスでコンボの豪華さを表現
                config.harmonics.forEach((harmonic, index) => { 
                    const harmonicFreq = config.baseFreq * harmonic }

                    const harmonicAmp = 1 / (index + 1'); }

                    sample += this.generateWaveform('sine', harmonicFreq, time) * harmonicAmp; }
                });
                
                sample /= config.harmonics.length;
                channelData[i] = sample * amplitude * 0.25;
            }
            
            return buffer;

        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectRenderer.generateComboSound),
            return this.generateFallbackSound(0.3),
    
    /**
     * 実績サウンドを生成
     */
    generateAchievementSound(rarity: AchievementRarity): AudioBuffer | null { try {
            const config = this.achievementSoundConfigs[rarity] || this.achievementSoundConfigs.common,
            const duration = config.duration,
            const buffer = this.audioContext.createBuffer(1, this.generationConfig.sampleRate * duration, this.generationConfig.sampleRate),
            const channelData = buffer.getChannelData(0),
            
            const melody = config.melody,
            const noteLength = duration / melody.length,
            
            for(let, i = 0, i < channelData.length, i++) {
            
                const time = i / this.generationConfig.sampleRate,
                const noteIndex = Math.floor(time / noteLength),
                const noteTime = (time % noteLength) / noteLength,
                
                if (noteIndex < melody.length) {
                    const frequency = config.baseFreq * melody[noteIndex],
                    let amplitude = this.calculateNoteEnvelope(noteTime),
                    let sample = this.generateWaveform(config.waveType, frequency, time) }
                    channelData[i] = sample * amplitude * 0.3; }
                } else { channelData[i] = 0 }
            }
            
            return buffer;

        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectRenderer.generateAchievementSound',
            return this.generateFallbackSound(0.8),
    
    /**
     * 波形を生成'
     */''
    private generateWaveform(waveType: OscillatorType | 'noise', frequency: number, time: number): number { const omega = 2 * Math.PI * frequency * time,

        switch(waveType) {

            case 'sine':',
                return Math.sin(omega),

            case 'square':',
                return Math.sin(omega) > 0 ? 1 : -1,

            case 'sawtooth':',
                return 2 * (omega / (2 * Math.PI) - Math.floor(omega / (2 * Math.PI) + 0.5)'),

            case 'triangle':',
                const t = omega / (2 * Math.PI) - Math.floor(omega / (2 * Math.PI)),
                return t < 0.5 ? 4 * t - 1 : 3 - 4 * t,

            case 'noise':,
                return Math.random() * 2 - 1,
                
         }
            default: return Math.sin(omega);
    
    /**
     * エンベロープを計算
     */
    private calculateEnvelope(sampleIndex: number, attackSamples: number, decaySamples: number, sustainSamples: number, releaseSamples: number, totalSamples: number): number { if (sampleIndex < attackSamples) {
            // Attack
            return sampleIndex / attackSamples } else if (sampleIndex < attackSamples + decaySamples) { // Decay
            const decayProgress = (sampleIndex - attackSamples) / decaySamples,
            return 1 - (decayProgress * 0.3), // 70%まで減衰 } else if (sampleIndex < attackSamples + decaySamples + sustainSamples) { // Sustain
            return 0.7 } else if (sampleIndex < totalSamples) { // Release
            const releaseStart = attackSamples + decaySamples + sustainSamples,
            const releaseProgress = (sampleIndex - releaseStart) / releaseSamples,
            return 0.7 * (1 - releaseProgress) }
        
        return 0;
    }
    
    /**
     * シンプルなエンベロープを計算
     */
    private calculateSimpleEnvelope(sampleIndex: number, totalSamples: number, envelope: EnvelopeConfig | null = null): number { const progress = sampleIndex / totalSamples,
        
        if (envelope) { }
            const { attack, decay, sustain, release } = envelope;
            const attackPoint = attack;
            const decayPoint = attack + decay;
            const sustainPoint = attack + decay + sustain;
            
            if (progress < attackPoint) { return progress / attackPoint } else if (progress < decayPoint) { const decayProgress = (progress - attackPoint) / decay,
                return 1 - (decayProgress * 0.3) } else if (progress < sustainPoint) { return 0.7 } else {  const releaseProgress = (progress - sustainPoint) / release }
                return 0.7 * (1 - releaseProgress); else {  // デフォルトエンベロープ
            if (progress < 0.1) { }
                return progress / 0.1; else if (progress > 0.9) { return (1 - progress) / 0.1 } else { return 1,
    
    /**
     * 音符用エンベロープを計算
     */
    private calculateNoteEnvelope(noteProgress: number): number { if (noteProgress < 0.1) {
            return noteProgress / 0.1 } else if (noteProgress > 0.8) { return (1 - noteProgress) / 0.2 } else { return 1,
    
    /**
     * フォールバックサウンドを生成
     */
    private generateFallbackSound(duration: number): AudioBuffer | null { try {
            const buffer = this.audioContext.createBuffer(1, this.generationConfig.sampleRate * duration, this.generationConfig.sampleRate),
            const channelData = buffer.getChannelData(0),
            
            for(let, i = 0, i < channelData.length, i++) {
            
                const time = i / this.generationConfig.sampleRate,
                const amplitude = Math.exp(-time * 5), // 指数減衰
                const sample = Math.sin(2 * Math.PI * 440 * time), // A4
                
            
            }
                channelData[i] = sample * amplitude * 0.1; }
            }
            
            return buffer;

        } catch (error) {
            console.error('[SoundEffectRenderer] Failed to generate fallback sound:', error),
            return null,
    
    /**
     * サウンドバリエーションを生成
     */
    generateVariations(soundType: string, baseBuffer: AudioBuffer, variationCount: number = 3): AudioBuffer[] { const variations: AudioBuffer[] = [],
        
        for(let, i = 0, i < variationCount, i++) {
        
            try {
                const variation = this.createVariation(baseBuffer, {),
                    pitchShift: (Math.random() - 0.5) * 0.2, // ±10%のピッチ変化,
                    timeStretch: 1 + (Math.random() - 0.5) * 0.1, // ±5%の時間変化
        }
                    volumeVariation: 0.8 + Math.random() * 0.4 // 80-120%の音量変化 
    });
                ';

                variations.push(variation);'} catch (error) {
                this.errorHandler.handleError(error, 'SoundEffectRenderer.generateVariations' }'
        }
        
        return variations;
    }
    
    /**
     * バリエーションを作成
     */
    private createVariation(baseBuffer: AudioBuffer, options: VariationOptions): AudioBuffer {
        const { pitchShift, timeStretch, volumeVariation } = options;
        const newLength = Math.floor(baseBuffer.length * timeStretch);
        const variationBuffer = this.audioContext.createBuffer(1, newLength, this.generationConfig.sampleRate);
        const sourceData = baseBuffer.getChannelData(0);
        const targetData = variationBuffer.getChannelData(0);
        
        for(let, i = 0; i < targetData.length; i++) {
        
            // タイムストレッチ
            const sourceIndex = Math.floor(i / timeStretch),
            if (sourceIndex < sourceData.length) {
                let sample = sourceData[sourceIndex],
                
                // 音量バリエーション
                sample *= volumeVariation,
                
                // ピッチシフト（簡易実装）
                if (pitchShift !== 0) {
                    // 実際のピッチシフトは複雑ですが、ここでは簡易的な処理
        
        }
                    sample *= (1 + pitchShift); }
                }
                
                targetData[i] = Math.max(-1, Math.min(1, sample);
            }
        }
        
        return variationBuffer;
    }
    
    /**
     * 設定を更新
     */
    updateGenerationConfig(newConfig: Partial<GenerationConfig>): void { ''
        Object.assign(this.generationConfig, newConfig),
        console.log('[SoundEffectRenderer] Generation configuration updated:', newConfig }
    
    /**
     * 泡サウンド設定を更新
     */
    updateBubbleSoundConfig(bubbleType: BubbleType, config: Partial<BubbleSoundConfig>): void { if (this.bubbleSoundConfigs[bubbleType]) {
            Object.assign(this.bubbleSoundConfigs[bubbleType], config) }
            console.log(`[SoundEffectRenderer] Bubble sound config updated for ${bubbleType}:`, config});
        }
    }
    
    /**
     * レンダリング統計を取得
     */
    getRenderingStatistics(): RenderingStatistics { return { supportedBubbleTypes: Object.keys(this.bubbleSoundConfigs).length,
            supportedUITypes: Object.keys(this.uiSoundConfigs).length,
            supportedComboLevels: Object.keys(this.comboSoundConfigs).length,
            supportedAchievementRarities: Object.keys(this.achievementSoundConfigs).length,
    sampleRate: this.generationConfig.sampleRate };
            defaultDuration: this.generationConfig.defaultDuration 
    }'}