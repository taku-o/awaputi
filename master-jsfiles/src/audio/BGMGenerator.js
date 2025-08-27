import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * BGM生成クラス - 音楽理論ベースのプロシージャルBGM生成
 */
export class BGMGenerator {
    constructor(audioContext) {
        this.audioContext = audioContext;
        
        // 音楽理論定義
        this.scales = {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            pentatonic: [0, 2, 4, 7, 9],
            blues: [0, 3, 5, 6, 7, 10]
        };
        
        this.chordProgressions = {
            pop: ['I', 'V', 'vi', 'IV'],
            jazz: ['ii', 'V', 'I', 'vi'],
            classical: ['I', 'IV', 'V', 'I'],
            ambient: ['i', 'VII', 'VI', 'VII']
        };
        
        this.rhythmPatterns = {
            simple: [1, 0, 1, 0, 1, 0, 1, 0],
            complex: [1, 0, 1, 1, 0, 1, 0, 1],
            syncopated: [1, 0, 0, 1, 0, 1, 1, 0],
            ambient: [1, 0, 0, 0, 1, 0, 0, 0]
        };
        
        // 基音周波数 (A4 = 440Hz)
        this.baseFrequency = 440;
        
        console.log('BGMGenerator initialized');
    }
    
    /**
     * BGMトラックを生成
     * @param {Object} trackConfig - トラック設定
     * @returns {AudioBuffer} 生成されたオーディオバッファ
     */
    generateTrack(trackConfig) {
        try {
            const {
                style = 'ambient',
                duration = 30,
                tempo = 120,
                key = 'C',
                timeSignature = '4/4'
            } = trackConfig;
            
            console.log(`Generating ${style} track: ${duration}s, ${tempo}BPM, key=${key}`);
            
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
            
            // スタイルに応じた生成
            switch (style) {
                case 'ambient':
                    return this.generateAmbientTrack(buffer, trackConfig);
                case 'energetic':
                    return this.generateEnergeticTrack(buffer, trackConfig);
                case 'exciting':
                    return this.generateExcitingTrack(buffer, trackConfig);
                case 'dramatic':
                    return this.generateDramaticTrack(buffer, trackConfig);
                default:
                    return this.generateAmbientTrack(buffer, trackConfig);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'BGM_GENERATOR_ERROR', {
                operation: 'generateTrack',
                trackConfig: trackConfig
            });
            return null;
        }
    }
    
    /**
     * アンビエントトラックを生成
     * @param {AudioBuffer} buffer - オーディオバッファ
     * @param {Object} config - 設定
     * @returns {AudioBuffer} 生成されたバッファ
     */
    generateAmbientTrack(buffer, config) {
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);
        const sampleRate = buffer.sampleRate;
        
        // アンビエント用の和声進行
        const progression = this.chordProgressions.ambient;
        const scale = this.scales.minor;
        const rootFreq = this.getFrequencyFromNote(config.key || 'C', 2); // 低いオクターブ
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const progress = t / config.duration;
            
            // 現在の和音を計算
            const chordIndex = Math.floor(progress * progression.length * 4) % progression.length;
            const chord = this.getChordFrequencies(progression[chordIndex], rootFreq, scale);
            
            // パッド音合成
            let sample = 0;
            chord.forEach((freq, index) => {
                const amplitude = 0.15 / (index + 1); // 高次倍音ほど小さく
                const modulation = 1 + Math.sin(t * 0.1 + index) * 0.1; // ゆっくりとした変調
                sample += Math.sin(2 * Math.PI * freq * t * modulation) * amplitude;
            });
            
            // 空間的な広がりを表現するリバーブ風効果
            const delay = i > sampleRate * 0.2 ? leftChannel[i - Math.floor(sampleRate * 0.2)] * 0.15 : 0;
            sample += delay;
            
            // 環境ノイズ
            const noise = (Math.random() - 0.5) * 0.03;
            sample += noise;
            
            // ステレオ分離
            leftChannel[i] = sample * 0.7;
            rightChannel[i] = sample * 0.6; // 右チャンネルを少し小さく
        }
        
        return buffer;
    }
    
    /**
     * エネルギッシュなトラックを生成
     * @param {AudioBuffer} buffer - オーディオバッファ
     * @param {Object} config - 設定
     * @returns {AudioBuffer} 生成されたバッファ
     */
    generateEnergeticTrack(buffer, config) {
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);
        const sampleRate = buffer.sampleRate;
        const tempo = config.tempo || 120;
        const beatDuration = 60 / tempo; // 1拍の長さ（秒）
        
        // エネルギッシュな和声進行
        const progression = this.chordProgressions.pop;
        const scale = this.scales.major;
        const rootFreq = this.getFrequencyFromNote(config.key || 'G', 3);
        const bassRootFreq = this.getFrequencyFromNote(config.key || 'G', 2);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const beatPosition = (t % beatDuration) / beatDuration;
            const currentBeat = Math.floor(t / beatDuration) % 4;
            
            // 現在の和音
            const chordIndex = Math.floor(t / (beatDuration * 4)) % progression.length;
            const chord = this.getChordFrequencies(progression[chordIndex], rootFreq, scale);
            const bassFreq = this.getChordFrequencies(progression[chordIndex], bassRootFreq, scale)[0];
            
            let sample = 0;
            
            // ベースライン（4拍子のリズム）
            const bassAmp = (currentBeat === 0 || currentBeat === 2) ? 0.4 : 0.2;
            const bassEnvelope = Math.exp(-beatPosition * 8);
            sample += Math.sin(2 * Math.PI * bassFreq * t) * bassAmp * bassEnvelope;
            
            // アルペジオメロディ
            const arpeggioSpeed = 8; // 1拍に8音
            const arpeggioIndex = Math.floor(beatPosition * arpeggioSpeed) % chord.length;
            const arpeggioFreq = chord[arpeggioIndex];
            const arpeggioEnvelope = Math.exp(-(beatPosition % (1/arpeggioSpeed)) * arpeggioSpeed * 4);
            sample += Math.sin(2 * Math.PI * arpeggioFreq * t) * 0.25 * arpeggioEnvelope;
            
            // パッド（和音）
            chord.forEach((freq, index) => {
                const padAmp = 0.1 / (index + 1);
                sample += Math.sin(2 * Math.PI * freq * t) * padAmp;
            });
            
            // ハイハット風効果
            if (beatPosition < 0.05) {
                const hihat = (Math.random() - 0.5) * 0.15;
                sample += hihat;
            }
            
            leftChannel[i] = sample * 0.8;
            rightChannel[i] = sample * 0.8;
        }
        
        return buffer;
    }
    
    /**
     * エキサイティングなトラックを生成
     * @param {AudioBuffer} buffer - オーディオバッファ
     * @param {Object} config - 設定
     * @returns {AudioBuffer} 生成されたバッファ
     */
    generateExcitingTrack(buffer, config) {
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);
        const sampleRate = buffer.sampleRate;
        const tempo = config.tempo || 140;
        const beatDuration = 60 / tempo;
        
        // 高エネルギーな進行
        const progression = ['i', 'VI', 'III', 'VII']; // マイナーキーでのドラマチックな進行
        const scale = this.scales.minor;
        const rootFreq = this.getFrequencyFromNote(config.key || 'D', 3);
        const bassRootFreq = this.getFrequencyFromNote(config.key || 'D', 2);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const beatPosition = (t % beatDuration) / beatDuration;
            const measureProgress = (t % (beatDuration * 4)) / (beatDuration * 4);
            
            // 現在の和音
            const chordIndex = Math.floor(t / (beatDuration * 2)) % progression.length;
            const chord = this.getChordFrequencies(progression[chordIndex], rootFreq, scale);
            const bassFreq = this.getChordFrequencies(progression[chordIndex], bassRootFreq, scale)[0];
            
            let sample = 0;
            
            // 強力なベース（シンコペーション）
            const syncopatedPattern = [1, 0, 1, 1, 0, 1, 0, 1];
            const patternIndex = Math.floor(beatPosition * 8) % syncopatedPattern.length;
            if (syncopatedPattern[patternIndex]) {
                const bassEnv = Math.exp(-beatPosition * 12);
                sample += Math.sin(2 * Math.PI * bassFreq * t) * 0.5 * bassEnv;
                // サブベース
                sample += Math.sin(2 * Math.PI * bassFreq * 0.5 * t) * 0.3 * bassEnv;
            }
            
            // 高速アルペジオ
            const arpeggioSpeed = 16; // より高速
            const arpeggioIndex = Math.floor(beatPosition * arpeggioSpeed) % chord.length;
            const arpeggioFreq = chord[arpeggioIndex] * 2; // 1オクターブ上
            const arpeggioEnv = Math.exp(-(beatPosition % (1/arpeggioSpeed)) * arpeggioSpeed * 2);
            sample += Math.sin(2 * Math.PI * arpeggioFreq * t) * 0.3 * arpeggioEnv;
            
            // ドラム風キック
            if (beatPosition < 0.1) {
                const kick = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-beatPosition * 20) * 0.4;
                sample += kick;
            }
            
            // 空間的効果（ステレオパン）
            const panPosition = Math.sin(t * 2) * 0.3; // ゆっくりとしたパン
            
            leftChannel[i] = sample * (0.7 + panPosition);
            rightChannel[i] = sample * (0.7 - panPosition);
        }
        
        return buffer;
    }
    
    /**
     * ドラマチックなトラックを生成
     * @param {AudioBuffer} buffer - オーディオバッファ
     * @param {Object} config - 設定
     * @returns {AudioBuffer} 生成されたバッファ
     */
    generateDramaticTrack(buffer, config) {
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);
        const sampleRate = buffer.sampleRate;
        const duration = config.duration;
        
        // ドラマチックな進行（オーケストラ風）
        const progression = ['i', 'iv', 'V', 'i']; // 典型的なマイナーキーの進行
        const scale = this.scales.minor;
        const rootFreq = this.getFrequencyFromNote(config.key || 'Am', 3);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            // 段階的な盛り上がり
            const intensity = Math.sin(progress * Math.PI) * 0.5 + 0.5; // 0から1へ増加後減少
            
            // 現在の和音
            const chordIndex = Math.floor(progress * progression.length * 2) % progression.length;
            const chord = this.getChordFrequencies(progression[chordIndex], rootFreq, scale);
            
            let sample = 0;
            
            // 弦楽器風の和音（複数オクターブ）
            [1, 2, 4].forEach((octave, octaveIndex) => {
                chord.forEach((freq, chordIndex) => {
                    const harmonicFreq = freq * octave;
                    const amplitude = (0.2 / (octaveIndex + 1)) * intensity;
                    
                    // アタックエンベロープ（弦楽器風）
                    const noteLength = 4; // 4秒のノート
                    const noteProgress = (t % noteLength) / noteLength;
                    const envelope = noteProgress < 0.1 ? 
                        noteProgress * 10 : // 0.1秒でアタック
                        Math.exp(-(noteProgress - 0.1) * 2); // その後指数減衰
                    
                    sample += Math.sin(2 * Math.PI * harmonicFreq * t) * amplitude * envelope;
                });
            });
            
            // ブラス風のメロディ（最高潮部分）
            if (intensity > 0.7) {
                const melodyScale = this.scales.minor;
                const melodyIndex = Math.floor(t * 0.5) % melodyScale.length;
                const melodyFreq = rootFreq * Math.pow(2, melodyScale[melodyIndex] / 12) * 2;
                const melodyAmp = (intensity - 0.7) * 0.3;
                sample += Math.sin(2 * Math.PI * melodyFreq * t) * melodyAmp;
            }
            
            // ティンパニ風の低音
            if (Math.floor(t * 2) % 8 === 0 && (t % 0.5) < 0.1) {
                const timpani = Math.sin(2 * Math.PI * 80 * t) * Math.exp(-(t % 0.5) * 10) * 0.3;
                sample += timpani;
            }
            
            // リバーブ効果
            const reverbDelay = sampleRate * 0.3;
            if (i > reverbDelay) {
                const reverbSample = leftChannel[i - reverbDelay] * 0.25;
                sample += reverbSample;
            }
            
            leftChannel[i] = sample * 0.6;
            rightChannel[i] = sample * 0.6;
        }
        
        return buffer;
    }
    
    /**
     * ノート名から周波数を取得
     * @param {string} note - ノート名 (例: 'C', 'G', 'Am')
     * @param {number} octave - オクターブ
     * @returns {number} 周波数 (Hz)
     */
    getFrequencyFromNote(note, octave = 4) {
        // ノート名をセミトーン数に変換
        const noteMap = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
            'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };
        
        // マイナーキーの処理（'Am' -> 'A'）
        const baseNote = note.replace('m', '');
        const semitones = noteMap[baseNote];
        
        if (semitones === undefined) {
            console.warn(`Unknown note: ${note}, using C`);
            return 261.63; // C4
        }
        
        // A4 = 440Hzを基準に計算
        const semitonesFromA4 = (octave - 4) * 12 + (semitones - 9);
        return 440 * Math.pow(2, semitonesFromA4 / 12);
    }
    
    /**
     * 和音の周波数を取得
     * @param {string} chordSymbol - 和音記号 ('I', 'ii', 'V' など)
     * @param {number} rootFreq - 根音の周波数
     * @param {Array} scale - 使用するスケール
     * @returns {Array} 和音の周波数配列
     */
    getChordFrequencies(chordSymbol, rootFreq, scale) {
        // ローマ数字を度数に変換
        const romanToNumber = {
            'I': 0, 'i': 0, 'II': 1, 'ii': 1, 'III': 2, 'iii': 2,
            'IV': 3, 'iv': 3, 'V': 4, 'v': 4, 'VI': 5, 'vi': 5,
            'VII': 6, 'vii': 6
        };
        
        const degree = romanToNumber[chordSymbol];
        if (degree === undefined) {
            console.warn(`Unknown chord symbol: ${chordSymbol}`);
            return [rootFreq];
        }
        
        // 三和音を構成（根音、三度、五度）
        const chordTones = [
            scale[degree % scale.length],                    // 根音
            scale[(degree + 2) % scale.length],              // 三度
            scale[(degree + 4) % scale.length]               // 五度
        ];
        
        return chordTones.map(semitones => {
            return rootFreq * Math.pow(2, semitones / 12);
        });
    }
    
    /**
     * メロディを生成
     * @param {Array} scale - 使用するスケール
     * @param {Array} rhythm - リズムパターン
     * @param {number} rootFreq - 根音の周波数
     * @returns {Object} メロディデータ
     */
    generateMelody(scale, rhythm, rootFreq) {
        const melody = [];
        const noteCount = rhythm.length;
        
        for (let i = 0; i < noteCount; i++) {
            if (rhythm[i]) {
                // 確率的にスケール音を選択（隣接音を優遇）
                const previousNote = i > 0 ? melody[i - 1]?.scaleIndex || 0 : 0;
                const scaleIndex = this.selectNextNote(previousNote, scale.length);
                const frequency = rootFreq * Math.pow(2, scale[scaleIndex] / 12);
                
                melody.push({
                    frequency: frequency,
                    scaleIndex: scaleIndex,
                    duration: 1, // 相対的な長さ
                    velocity: 0.7 + Math.random() * 0.3 // ランダムなベロシティ
                });
            } else {
                melody.push(null); // 休符
            }
        }
        
        return melody;
    }
    
    /**
     * 次の音符を確率的に選択
     * @param {number} currentNote - 現在の音符のスケールインデックス
     * @param {number} scaleLength - スケールの長さ
     * @returns {number} 次の音符のスケールインデックス
     */
    selectNextNote(currentNote, scaleLength) {
        // 隣接音を優遇する確率分布
        const weights = [];
        for (let i = 0; i < scaleLength; i++) {
            const distance = Math.abs(i - currentNote);
            weights[i] = distance === 0 ? 0.3 :      // 同じ音
                        distance === 1 ? 0.4 :       // 隣接音
                        distance === 2 ? 0.2 :       // 2度音程
                        0.1;                          // その他
        }
        
        // 重み付き乱数選択
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return i;
            }
        }
        
        return 0; // フォールバック
    }
    
    /**
     * ハーモニーを生成
     * @param {Array} melody - メロディデータ
     * @param {Array} chordProgression - 和音進行
     * @param {Array} scale - スケール
     * @returns {Object} ハーモニーデータ
     */
    generateHarmony(melody, chordProgression, scale) {
        const harmony = [];
        
        melody.forEach((note, index) => {
            if (note) {
                const chordIndex = Math.floor(index / (melody.length / chordProgression.length));
                const currentChord = chordProgression[chordIndex % chordProgression.length];
                
                // メロディに対するハーモニー音を選択
                const harmonyNote = this.findHarmonyNote(note.scaleIndex, currentChord, scale);
                
                harmony.push({
                    frequency: note.frequency * Math.pow(2, (harmonyNote - note.scaleIndex) / 12),
                    scaleIndex: harmonyNote,
                    duration: note.duration,
                    velocity: note.velocity * 0.7 // ハーモニーは少し小さく
                });
            } else {
                harmony.push(null);
            }
        });
        
        return harmony;
    }
    
    /**
     * メロディに対するハーモニー音を見つける
     * @param {number} melodyNote - メロディのスケールインデックス
     * @param {string} chord - 現在の和音
     * @param {Array} scale - スケール
     * @returns {number} ハーモニー音のスケールインデックス
     */
    findHarmonyNote(melodyNote, chord, scale) {
        // 簡単なハーモニー規則：三度下または三度上を選択
        const harmonyOptions = [
            (melodyNote + 2) % scale.length, // 三度上
            (melodyNote - 2 + scale.length) % scale.length, // 三度下
            (melodyNote + 4) % scale.length  // 五度上
        ];
        
        // 現在の和音に含まれる音を優先
        const chordTones = this.getChordTones(chord, scale);
        const validOptions = harmonyOptions.filter(option => 
            chordTones.includes(scale[option] % 12)
        );
        
        if (validOptions.length > 0) {
            return validOptions[Math.floor(Math.random() * validOptions.length)];
        }
        
        return harmonyOptions[0]; // フォールバック
    }
    
    /**
     * 和音の構成音を取得
     * @param {string} chord - 和音記号
     * @param {Array} scale - スケール
     * @returns {Array} 和音の構成音（セミトーン）
     */
    getChordTones(chord, scale) {
        const romanToNumber = {
            'I': 0, 'i': 0, 'ii': 1, 'III': 2, 'iv': 3, 'V': 4, 'vi': 5, 'VII': 6
        };
        
        const degree = romanToNumber[chord] || 0;
        return [
            scale[degree % scale.length],
            scale[(degree + 2) % scale.length],
            scale[(degree + 4) % scale.length]
        ];
    }
}