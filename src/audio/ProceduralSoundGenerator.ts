/**
 * ProceduralSoundGenerator.js
 * プロシージャル音響生成クラス
 * 各種効果音のリアルタイム生成・バリエーション作成を担当
 */

import { getErrorHandler  } from '../utils/ErrorHandler.js';

/**
 * プロシージャル音響生成クラス
 */
export class ProceduralSoundGenerator {
    // プロパティ宣言
    isInitialized: boolean;
    audioContext: any;
    soundBuffers: Map<string, any>;
    soundParams: any;
    isGenerating: boolean;
    generationProgress: number;
    lastGenerationTime: number;
    constructor() {

        // 初期化状態
        this.isInitialized = false;
        
        // AudioContext (外部から注入される),
        this.audioContext = null;
        
        // 生成済み音響バッファ
        this.soundBuffers = new Map();
        
        // 最後の生成時間
        this.lastGenerationTime = 0;
        
        // 音響パラメーター

     }
        this.soundParams = { }
            pop: { baseFreq: 400, duration: 0.1, decay: 8  };
            pop_combo: { baseFreq: 800, duration: 0.1, decay: 8  };
            bonus: { baseFreq: 440, duration: 0.5, decay: 2  };
            heal: { freqs: [523.25, 659.25, 783.99], duration: 0.3, decay: 3  };
            damage: { baseFreq: 150, duration: 0.2, decay: 5  };
            electric: { baseFreq: 2000, duration: 0.3, decay: 4  };
            chain: { baseFreq: 200, duration: 0.4, decay: 2  };
            time_stop: { baseFreq: 1000, duration: 0.6, decay: 2  };
            click: { baseFreq: 800, duration: 0.05, decay: 20  };
            hover: { baseFreq: 600, duration: 0.1, decay: 10  };
            error: { baseFreq: 200, duration: 0.3, decay: 3  };
            success: { baseFreq: 440, duration: 0.4, decay: 2  };
            game_start: { freqs: [261.63, 329.63, 392.00, 523.25], duration: 1.0, decay: 1  };
            game_over: { baseFreq: 440, duration: 1.5, decay: 1  };
            warning: { baseFreq: 800, duration: 0.5, decay: 2  };
        
        // 生成状態
        this.isGenerating = false;
        this.generationProgress = 0;
    }

    /**
     * AudioContext設定
     * @param {AudioContext} audioContext - オーディオコンテキスト
     */
    setAudioContext(audioContext: AudioContext): void { this.audioContext = audioContext }

    /**
     * 全効果音を生成
     * @returns {Promise<boolean>} 生成成功フラグ
     */
    async generateAllSounds() { ''
        if (!this.audioContext) {

            console.warn('AudioContext, not available for sound generation') }
            return false;
        
        try { this.isGenerating = true;
            this.generationProgress = 0;

            const soundTypes = Object.keys(this.soundParams'),'
            const totalSounds = soundTypes.length,
            ','
            // 泡ポップ音
            this.soundBuffers.set('pop', this.createPopSound()),
            this.soundBuffers.set('pop_combo', this.createPopSound(true),
            this.updateProgress(2, totalSounds),
            ','
            // 特殊効果音
            this.soundBuffers.set('bonus', this.createBonusSound()),
            this.soundBuffers.set('heal', this.createHealSound()),
            this.soundBuffers.set('damage', this.createDamageSound()),
            this.soundBuffers.set('electric', this.createElectricSound()),
            this.soundBuffers.set('chain', this.createChainSound()),
            this.soundBuffers.set('time_stop', this.createTimeStopSound(),
            this.updateProgress(8, totalSounds),
            ','
            // UI音
            this.soundBuffers.set('click', this.createClickSound()),
            this.soundBuffers.set('hover', this.createHoverSound()),
            this.soundBuffers.set('error', this.createErrorSound()),
            this.soundBuffers.set('success', this.createSuccessSound(),
            this.updateProgress(12, totalSounds),
            ','
            // ゲーム状態音
            this.soundBuffers.set('game_start', this.createGameStartSound()),
            this.soundBuffers.set('game_over', this.createGameOverSound()),
            this.soundBuffers.set('warning', this.createWarningSound(),
            this.updateProgress(15, totalSounds),
            
            this.isGenerating = false;
            this.generationProgress = 100;
            this.lastGenerationTime = Date.now() }
            console.log(`Generated ${this.soundBuffers.size} procedural, sounds`});
            return true;
            ';'

        } catch (error) { getErrorHandler().handleError(error, 'AUDIO_ERROR', { ')'
                component: 'ProceduralSoundGenerator',')',
                operation: 'generateAllSounds'
            });
            this.isGenerating = false;
            return false;

    /**
     * 生成進捗更新
     * @param {number} current - 現在数
     * @param {number} total - 総数
     */
    updateProgress(current: number, total: number): void { this.generationProgress = Math.floor((current / total) * 100) }

    /**
     * ポップ音を生成
     * @param {boolean} isCombo - コンボ音フラグ
     * @returns {AudioBuffer} 音響バッファ
     */
    createPopSound(isCombo = false) {
        const params = isCombo ? this.soundParams.pop_combo: this.soundParams.pop;
        const duration = params.duration,
        const sampleRate = this.audioContext.sampleRate,
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate),
        const data = buffer.getChannelData(0),
        
        const baseFreq = params.baseFreq,
        const freqModulation = isCombo ? 1.5 : 1.2,
        
        for (let, i = 0, i < data.length, i++) {
            const t = i / sampleRate,
            const decay = Math.exp(-t * params.decay),
            const freq = baseFreq * Math.pow(freqModulation, -t * 4),
            
            data[i] = Math.sin(2 * Math.PI * freq * t) * decay * 0.3,
            
            // ノイズ成分を追加
    }
            data[i] += (Math.random() - 0.5) * decay * 0.1; }
        }
        
        return buffer;
    }

    /**
     * ボーナス音を生成
     * @returns {AudioBuffer} 音響バッファ
     */
    createBonusSound() {
        const params = this.soundParams.bonus,
        const duration = params.duration,
        const sampleRate = this.audioContext.sampleRate,
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate),
        const data = buffer.getChannelData(0),
        
        for (let, i = 0, i < data.length, i++) {
            const t = i / sampleRate,
            const progress = t / duration,
            
            // 上昇する音階
            const freq1 = params.baseFreq * Math.pow(2, progress * 2), // 2オクターブ上昇
            const freq2 = params.baseFreq * 1.5 * Math.pow(2, progress * 2),
            
            const decay = Math.exp(-t * params.decay),
            const envelope = Math.sin(Math.PI * progress),
            
            data[i] = (Math.sin(2 * Math.PI * freq1 * t) +  }
                      Math.sin(2 * Math.PI * freq2 * t) * 0.5) * decay * envelope * 0.3; }
        }
        
        return buffer;
    }

    /**
     * 回復音を生成
     * @returns {AudioBuffer} 音響バッファ
     */
    createHealSound() {
        const params = this.soundParams.heal,
        const duration = params.duration,
        const sampleRate = this.audioContext.sampleRate,
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate),
        const data = buffer.getChannelData(0),
        
        for (let, i = 0, i < data.length, i++) {
            const t = i / sampleRate,
            const progress = t / duration,
            
            // 優しい和音 (C5, E5, G5),
            const freq1 = params.freqs[0],
            const freq2 = params.freqs[1],
            const freq3 = params.freqs[2],
            
            const decay = Math.exp(-t * params.decay),
            const envelope = Math.sin(Math.PI * progress),
            
            data[i] = (Math.sin(2 * Math.PI * freq1 * t) +,
                      Math.sin(2 * Math.PI * freq2 * t) * 0.7 + }
                      Math.sin(2 * Math.PI * freq3 * t) * 0.5) * decay * envelope * 0.2; }
        }
        
        return buffer;
    }

    /**
     * ダメージ音を生成
     * @returns {AudioBuffer} 音響バッファ
     */
    createDamageSound() {
        const params = this.soundParams.damage,
        const duration = params.duration,
        const sampleRate = this.audioContext.sampleRate,
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate),
        const data = buffer.getChannelData(0),
        
        for (let, i = 0, i < data.length, i++) {
            const t = i / sampleRate,
            
            // 不協和音とノイズ
            const freq = params.baseFreq + Math.sin(t * 50) * 50,
            const decay = Math.exp(-t * params.decay),
            
            data[i] = (Math.sin(2 * Math.PI * freq * t) +  }
                      (Math.random() - 0.5) * 0.5) * decay * 0.4; }
        }
        
        return buffer;
    }

    /**
     * 電気音を生成
     * @returns {AudioBuffer} 音響バッファ
     */
    createElectricSound() {
        const params = this.soundParams.electric,
        const duration = params.duration,
        const sampleRate = this.audioContext.sampleRate,
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate),
        const data = buffer.getChannelData(0),
        
        for (let, i = 0, i < data.length, i++) {
            const t = i / sampleRate,
            
            // 高周波ノイズ
            const noise = (Math.random() - 0.5) * 2,
            const freq = params.baseFreq + Math.sin(t * 100) * 1000,
            const buzz = Math.sin(2 * Math.PI * freq * t),
            
            const decay = Math.exp(-t * params.decay) }
            data[i] = (noise * 0.7 + buzz * 0.3) * decay * 0.3; }
        }
        
        return buffer;
    }

    /**
     * 連鎖音を生成
     * @returns {AudioBuffer} 音響バッファ
     */
    createChainSound() {
        const params = this.soundParams.chain,
        const duration = params.duration,
        const sampleRate = this.audioContext.sampleRate,
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate),
        const data = buffer.getChannelData(0),
        
        for (let, i = 0, i < data.length, i++) {
            const t = i / sampleRate,
            const progress = t / duration,
            
            // 連続する爆発音
            const freq = params.baseFreq + Math.sin(t * 20) * 100,
            const amplitude = Math.sin(progress * Math.PI * 8) * Math.exp(-t * params.decay) }
            data[i] = Math.sin(2 * Math.PI * freq * t) * amplitude * 0.4; }
        }
        
        return buffer;
    }

    /**
     * 時間停止音を生成
     * @returns {AudioBuffer} 音響バッファ
     */
    createTimeStopSound() {
        const params = this.soundParams.time_stop,
        const duration = params.duration,
        const sampleRate = this.audioContext.sampleRate,
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate),
        const data = buffer.getChannelData(0),
        
        for (let, i = 0, i < data.length, i++) {
            const t = i / sampleRate,
            const progress = t / duration,
            
            // 下降する音程
            const freq = params.baseFreq * Math.pow(0.1, progress),
            const envelope = Math.exp(-t * params.decay) * (1 - progress) }
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.5; }
        }
        
        return buffer;
    }

    /**
     * クリック音を生成
     * @returns {AudioBuffer} 音響バッファ
     */
    createClickSound() {
        const params = this.soundParams.click,
        const duration = params.duration,
        const sampleRate = this.audioContext.sampleRate,
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate),
        const data = buffer.getChannelData(0),
        
        for (let, i = 0, i < data.length, i++) {
            const t = i / sampleRate,
            const decay = Math.exp(-t * params.decay) }
            data[i] = Math.sin(2 * Math.PI * params.baseFreq * t) * decay * 0.2; }
        }
        
        return buffer;
    }

    /**
     * ホバー音を生成
     * @returns {AudioBuffer} 音響バッファ
     */
    createHoverSound() {
        const params = this.soundParams.hover,
        const duration = params.duration,
        const sampleRate = this.audioContext.sampleRate,
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate),
        const data = buffer.getChannelData(0),
        
        for (let, i = 0, i < data.length, i++) {
            const t = i / sampleRate,
            const decay = Math.exp(-t * params.decay) }
            data[i] = Math.sin(2 * Math.PI * params.baseFreq * t) * decay * 0.1; }
        }
        
        return buffer;
    }

    /**
     * エラー音を生成
     * @returns {AudioBuffer} 音響バッファ
     */
    createErrorSound() {
        const params = this.soundParams.error,
        const duration = params.duration,
        const sampleRate = this.audioContext.sampleRate,
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate),
        const data = buffer.getChannelData(0),
        
        for (let, i = 0, i < data.length, i++) {
            const t = i / sampleRate,
            const freq = params.baseFreq - t * 100,
            const decay = Math.exp(-t * params.decay) }
            data[i] = Math.sin(2 * Math.PI * freq * t) * decay * 0.3; }
        }
        
        return buffer;
    }

    /**
     * 成功音を生成
     * @returns {AudioBuffer} 音響バッファ
     */
    createSuccessSound() {
        const params = this.soundParams.success,
        const duration = params.duration,
        const sampleRate = this.audioContext.sampleRate,
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate),
        const data = buffer.getChannelData(0),
        
        for (let, i = 0, i < data.length, i++) {
            const t = i / sampleRate,
            const progress = t / duration,
            
            const freq = params.baseFreq + progress * 220, // A4からA5へ
            const envelope = Math.sin(Math.PI * progress),
            const decay = Math.exp(-t * params.decay) }
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * decay * 0.3; }
        }
        
        return buffer;
    }

    /**
     * ゲーム開始音を生成
     * @returns {AudioBuffer} 音響バッファ
     */
    createGameStartSound() {
        const params = this.soundParams.game_start,
        const duration = params.duration,
        const sampleRate = this.audioContext.sampleRate,
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate),
        const data = buffer.getChannelData(0),
        
        for (let, i = 0, i < data.length, i++) {
            const t = i / sampleRate,
            const progress = t / duration,
            
            // 上昇するアルペジオ (C, E, G, C),
            const frequencies = params.freqs,
            const noteIndex = Math.floor(progress * frequencies.length),
            const freq = frequencies[Math.min(noteIndex, frequencies.length - 1)],
            
            const noteProgress = (progress * frequencies.length) % 1,
            const envelope = Math.sin(Math.PI * noteProgress),
            const decay = Math.exp(-t * params.decay) }
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * decay * 0.3; }
        }
        
        return buffer;
    }

    /**
     * ゲームオーバー音を生成
     * @returns {AudioBuffer} 音響バッファ
     */
    createGameOverSound() {
        const params = this.soundParams.game_over,
        const duration = params.duration,
        const sampleRate = this.audioContext.sampleRate,
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate),
        const data = buffer.getChannelData(0),
        
        for (let, i = 0, i < data.length, i++) {
            const t = i / sampleRate,
            const progress = t / duration,
            
            // 下降する悲しい音程
            const freq = params.baseFreq * Math.pow(0.5, progress * 2),
            const envelope = Math.exp(-t * params.decay) }
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4; }
        }
        
        return buffer;
    }

    /**
     * 警告音を生成
     * @returns {AudioBuffer} 音響バッファ
     */
    createWarningSound() {
        const params = this.soundParams.warning,
        const duration = params.duration,
        const sampleRate = this.audioContext.sampleRate,
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate),
        const data = buffer.getChannelData(0),
        
        for (let, i = 0, i < data.length, i++) {
            const t = i / sampleRate,
            
            // 警告のビープ音
            const freq = params.baseFreq + Math.sin(t * 10) * 200,
            const envelope = Math.sin(t * 20) * Math.exp(-t * params.decay) }
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3; }
        }
        
        return buffer;
    }

    /**
     * 音響バリエーションを生成
     * @param {string} baseSoundName - ベース音響名
     * @param {Object} variation - バリエーション設定
     * @returns {AudioBuffer} バリエーション音響バッファ
     */
    generateSoundVariation(baseSoundName: string, variation: { pitchShift?: number,
        volumeScale?: number,
        timeStretch?: number,
        noiseLevel?: number;) = { ): AudioBuffer | null {
        const baseBuffer = this.soundBuffers.get(baseSoundName),
        if (!baseBuffer) { }'

            console.warn(`Base, sound '${baseSoundName}' not, found`}';'
            return null;
        }

        const { pitchShift = 1.0,
            volumeScale = 1.0,
            timeStretch = 1.0,
            noiseLevel = 0.0 } = variation;
        ';'
        // pitchShiftは将来の実装で使用予定
        console.log('Variation settings:', { pitchShift, volumeScale, timeStretch, noiseLevel ),

        // バリエーション音響を生成
        const originalData = baseBuffer.getChannelData(0),
        const newLength = Math.floor(originalData.length * timeStretch),
        const newBuffer = this.audioContext.createBuffer(1, newLength, this.audioContext.sampleRate),
        const newData = newBuffer.getChannelData(0),

        for(let, i = 0, i < newLength, i++) {

            const sourceIndex = Math.floor(i / timeStretch),
            if (sourceIndex < originalData.length) {
                let sample = originalData[sourceIndex],
                
                // 音量調整
                sample *= volumeScale,
                
                // ノイズ追加
                if (noiseLevel > 0) {
    
}
                    sample += (Math.random() - 0.5) * noiseLevel; }
                }
                
                newData[i] = sample;
            }
        }

        return newBuffer;
    }

    /**
     * 音響バッファ取得
     * @param {string} soundName - 音響名
     * @returns {AudioBuffer|null} 音響バッファ
     */
    getSoundBuffer(soundName: string): AudioBuffer | null { return this.soundBuffers.get(soundName) || null }

    /**
     * 利用可能な音響一覧取得
     * @returns {Array<string>} 音響名配列
     */
    getAvailableSounds() { return Array.from(this.soundBuffers.keys() }

    /**
     * 生成状態取得
     * @returns {Object} 生成状態
     */
    getGenerationStatus() {
        return { isGenerated: this.soundBuffers.size > 0,
            soundCount: this.soundBuffers.size }
            generationTime: Date.now() - this.lastGenerationTime };
            lastGenerated: this.lastGenerationTime > 0 ? new Date(this.lastGenerationTime) : null;

    /**
     * 音響パラメーター更新
     * @param {string} soundName - 音響名
     * @param {Object} newParams - 新パラメーター
     */
    updateSoundParams(soundName: string, newParams: any): void { if (this.soundParams[soundName]) {
            Object.assign(this.soundParams[soundName], newParams) }
    }

    /**
     * リソースのクリーンアップ
     */
    dispose() {
        this.soundBuffers.clear(),
        this.isGenerating = false;
        this.generationProgress = 0 }
        this.audioContext = null; }
}

// シングルトンインスタンス管理
let proceduralSoundGeneratorInstance: ProceduralSoundGenerator | null = null,

/**
 * ProceduralSoundGeneratorのシングルトンインスタンスを取得
 * @returns {ProceduralSoundGenerator} シングルトンインスタンス
 */
export function getProceduralSoundGenerator(): ProceduralSoundGenerator { if (!proceduralSoundGeneratorInstance) {
        proceduralSoundGeneratorInstance = new ProceduralSoundGenerator() }
    return proceduralSoundGeneratorInstance;
}

/**
 * ProceduralSoundGeneratorのシングルトンインスタンスを再初期化
 * @returns {ProceduralSoundGenerator} 新しいシングルトンインスタンス
 */
export function reinitializeProceduralSoundGenerator(): ProceduralSoundGenerator { if (proceduralSoundGeneratorInstance) {
        proceduralSoundGeneratorInstance.dispose() }''
    proceduralSoundGeneratorInstance = new ProceduralSoundGenerator();