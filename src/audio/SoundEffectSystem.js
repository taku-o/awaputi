import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

/**
 * 効果音システム - 多様な効果音の生成、バリエーション管理、再生
 */
export class SoundEffectSystem {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.audioContext = audioManager.audioContext;
        this.sfxGainNode = audioManager.sfxGainNode;
        this.configManager = getConfigurationManager();
        
        // 効果音カテゴリ別管理
        this.bubbleSounds = new Map(); // 泡破壊音（泡タイプ別）
        this.uiSounds = new Map(); // UI操作音
        this.achievementSounds = new Map(); // 実績解除音
        this.gameStateSounds = new Map(); // ゲーム状態音
        this.comboSounds = new Map(); // コンボ音
        
        // バリエーション管理
        this.soundVariations = new Map();
        this.activeSources = new Set();
        
        // 設定監視
        this.configWatchers = new Set();
        
        // 泡タイプ定義（10種類以上）
        this.bubbleTypes = [
            'normal', 'stone', 'iron', 'diamond', 'rainbow', 
            'pink', 'clock', 'electric', 'poison', 'spiky', 
            'escaping', 'boss', 'golden', 'frozen', 'magnetic', 
            'explosive', 'phantom', 'multiplier'
        ];
        
        // コンボレベル定義（5段階）
        this.comboLevels = [1, 2, 3, 4, 5];
        
        // 実績レアリティ定義
        this.achievementRarities = ['common', 'rare', 'epic', 'legendary'];
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            if (!this.audioContext) {
                throw new Error('AudioContext is not available');
            }
            
            // 設定変更の監視を設定
            this._setupConfigWatchers();
            
            // 効果音を生成
            this.generateAllSounds();
            
            console.log('SoundEffectSystem initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'initialize'
            });
        }
    }
    
    /**
     * 設定変更の監視を設定
     * @private
     */
    _setupConfigWatchers() {
        // SFX音量の監視
        const sfxVolumeWatcher = this.configManager.watch('audio', 'volumes.sfx', (newValue) => {
            // 新しい音量値を適用
            console.log(`SFX volume changed to ${newValue}`);
        });
        if (sfxVolumeWatcher) this.configWatchers.add(sfxVolumeWatcher);
    }
    
    /**
     * 全ての効果音を生成
     */
    generateAllSounds() {
        try {
            // 泡破壊音を生成
            this.generateBubbleSounds();
            
            // UI操作音を生成
            this.generateUISounds();
            
            // 実績解除音を生成
            this.generateAchievementSounds();
            
            // ゲーム状態音を生成
            this.generateGameStateSounds();
            
            // コンボ音を生成
            this.generateComboSounds();
            
            console.log('All sound effects generated successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'generateAllSounds'
            });
        }
    }
    
    /**
     * 泡破壊音を生成（10種類以上の泡タイプ別）
     */
    generateBubbleSounds() {
        this.bubbleTypes.forEach(bubbleType => {
            const soundVariations = this.generateBubbleSoundVariations(bubbleType, 3);
            this.bubbleSounds.set(bubbleType, soundVariations);
        });
    }
    
    /**
     * 泡タイプ別音響バリエーションを生成
     * @param {string} bubbleType - 泡タイプ
     * @param {number} variationCount - バリエーション数
     * @returns {AudioBuffer[]} 音響バリエーション配列
     */
    generateBubbleSoundVariations(bubbleType, variationCount = 3) {
        const variations = [];
        
        for (let i = 0; i < variationCount; i++) {
            const buffer = this.createBubbleSound(bubbleType, i);
            variations.push(buffer);
        }
        
        return variations;
    }
    
    /**
     * 泡タイプ別の音響特性に基づいて音を生成
     * @param {string} bubbleType - 泡タイプ
     * @param {number} variation - バリエーション番号
     * @returns {AudioBuffer} 生成された音響バッファ
     */
    createBubbleSound(bubbleType, variation = 0) {
        const soundProfile = this.getBubbleSoundProfile(bubbleType);
        const duration = soundProfile.duration + (variation * 0.02); // バリエーションで微調整
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            // 基本周波数にバリエーションを追加
            const baseFreq = soundProfile.frequency * (1 + variation * 0.1);
            const freqModulation = soundProfile.modulation * (1 + variation * 0.05);
            
            // エンベロープ（音量変化）
            const envelope = this.generateEnvelope(progress, soundProfile.envelope);
            
            // 周波数変調
            const freq = baseFreq * Math.pow(freqModulation, -t * soundProfile.decayRate);
            
            // 基本波形
            let sample = Math.sin(2 * Math.PI * freq * t) * envelope;
            
            // 音色の特徴を追加
            if (soundProfile.harmonics) {
                soundProfile.harmonics.forEach((harmonic, index) => {
                    const harmonicFreq = freq * (index + 2);
                    sample += Math.sin(2 * Math.PI * harmonicFreq * t) * envelope * harmonic;
                });
            }
            
            // ノイズ成分（泡の材質感）
            if (soundProfile.noise > 0) {
                sample += (Math.random() - 0.5) * envelope * soundProfile.noise;
            }
            
            data[i] = sample * soundProfile.volume;
        }
        
        return buffer;
    }
    
    /**
     * 泡タイプ別の音響プロファイルを取得
     * @param {string} bubbleType - 泡タイプ
     * @returns {Object} 音響プロファイル
     */
    getBubbleSoundProfile(bubbleType) {
        const profiles = {
            normal: {
                frequency: 400,
                modulation: 1.2,
                duration: 0.1,
                decayRate: 8,
                envelope: 'exponential',
                volume: 0.3,
                noise: 0.1,
                harmonics: [0.3, 0.1]
            },
            stone: {
                frequency: 300,
                modulation: 1.1,
                duration: 0.15,
                decayRate: 6,
                envelope: 'linear',
                volume: 0.4,
                noise: 0.2,
                harmonics: [0.5, 0.2, 0.1]
            },
            iron: {
                frequency: 250,
                modulation: 1.05,
                duration: 0.2,
                decayRate: 4,
                envelope: 'linear',
                volume: 0.5,
                noise: 0.15,
                harmonics: [0.6, 0.3, 0.1]
            },
            diamond: {
                frequency: 800,
                modulation: 1.3,
                duration: 0.25,
                decayRate: 3,
                envelope: 'bell',
                volume: 0.6,
                noise: 0.05,
                harmonics: [0.4, 0.2, 0.1, 0.05]
            },
            rainbow: {
                frequency: 500,
                modulation: 2.0,
                duration: 0.3,
                decayRate: 5,
                envelope: 'rising-fall',
                volume: 0.4,
                noise: 0.1,
                harmonics: [0.3, 0.4, 0.2, 0.1]
            },
            pink: {
                frequency: 523.25, // C5
                modulation: 1.2,
                duration: 0.2,
                decayRate: 6,
                envelope: 'soft',
                volume: 0.3,
                noise: 0.05,
                harmonics: [0.5, 0.3]
            },
            clock: {
                frequency: 440,
                modulation: 1.0,
                duration: 0.1,
                decayRate: 12,
                envelope: 'tick',
                volume: 0.35,
                noise: 0.02,
                harmonics: [0.2]
            },
            electric: {
                frequency: 2000,
                modulation: 1.5,
                duration: 0.15,
                decayRate: 10,
                envelope: 'buzz',
                volume: 0.4,
                noise: 0.4,
                harmonics: [0.3, 0.2]
            },
            poison: {
                frequency: 150,
                modulation: 0.8,
                duration: 0.25,
                decayRate: 3,
                envelope: 'menacing',
                volume: 0.45,
                noise: 0.3,
                harmonics: [0.4, 0.3, 0.2]
            },
            spiky: {
                frequency: 600,
                modulation: 1.8,
                duration: 0.12,
                decayRate: 15,
                envelope: 'sharp',
                volume: 0.4,
                noise: 0.25,
                harmonics: [0.4, 0.2]
            },
            escaping: {
                frequency: 350,
                modulation: 2.5,
                duration: 0.08,
                decayRate: 20,
                envelope: 'escape',
                volume: 0.25,
                noise: 0.1,
                harmonics: [0.2]
            },
            boss: {
                frequency: 100,
                modulation: 1.1,
                duration: 0.4,
                decayRate: 2,
                envelope: 'boss',
                volume: 0.7,
                noise: 0.2,
                harmonics: [0.8, 0.5, 0.3, 0.1]
            },
            golden: {
                frequency: 880,
                modulation: 1.4,
                duration: 0.35,
                decayRate: 4,
                envelope: 'golden',
                volume: 0.5,
                noise: 0.05,
                harmonics: [0.3, 0.2, 0.1]
            },
            frozen: {
                frequency: 700,
                modulation: 0.9,
                duration: 0.18,
                decayRate: 8,
                envelope: 'crystalline',
                volume: 0.35,
                noise: 0.08,
                harmonics: [0.4, 0.3, 0.1]
            },
            magnetic: {
                frequency: 450,
                modulation: 1.6,
                duration: 0.22,
                decayRate: 6,
                envelope: 'magnetic',
                volume: 0.4,
                noise: 0.15,
                harmonics: [0.3, 0.2]
            },
            explosive: {
                frequency: 200,
                modulation: 3.0,
                duration: 0.3,
                decayRate: 8,
                envelope: 'explosive',
                volume: 0.6,
                noise: 0.4,
                harmonics: [0.5, 0.3, 0.2]
            },
            phantom: {
                frequency: 300,
                modulation: 1.3,
                duration: 0.25,
                decayRate: 10,
                envelope: 'ethereal',
                volume: 0.2,
                noise: 0.1,
                harmonics: [0.2, 0.1]
            },
            multiplier: {
                frequency: 600,
                modulation: 2.2,
                duration: 0.2,
                decayRate: 7,
                envelope: 'multiplicative',
                volume: 0.45,
                noise: 0.1,
                harmonics: [0.4, 0.3, 0.1]
            }
        };
        
        return profiles[bubbleType] || profiles.normal;
    }
    
    /**
     * エンベロープ（音量変化）を生成
     * @param {number} progress - 進行度 (0-1)
     * @param {string} envelopeType - エンベロープタイプ
     * @returns {number} エンベロープ値
     */
    generateEnvelope(progress, envelopeType) {
        switch (envelopeType) {
            case 'exponential':
                return Math.exp(-progress * 8);
            case 'linear':
                return 1 - progress;
            case 'bell':
                return Math.sin(Math.PI * progress);
            case 'rising-fall':
                return progress < 0.3 ? progress / 0.3 : Math.exp(-(progress - 0.3) * 8);
            case 'soft':
                return Math.exp(-progress * 6) * Math.sin(Math.PI * progress);
            case 'tick':
                return Math.exp(-progress * 12);
            case 'buzz':
                return Math.exp(-progress * 10) * (1 + Math.sin(progress * 50) * 0.1);
            case 'menacing':
                return Math.exp(-progress * 3) * (1 + Math.sin(progress * 20) * 0.2);
            case 'sharp':
                return Math.exp(-progress * 15);
            case 'escape':
                return Math.exp(-progress * 20) * Math.sin(Math.PI * progress * 2);
            case 'boss':
                return Math.exp(-progress * 2) * (1 + Math.sin(progress * 10) * 0.1);
            case 'golden':
                return Math.exp(-progress * 4) * Math.sin(Math.PI * progress);
            case 'crystalline':
                return Math.exp(-progress * 8) * (1 + Math.sin(progress * 30) * 0.1);
            case 'magnetic':
                return Math.exp(-progress * 6) * (1 + Math.sin(progress * 15) * 0.2);
            case 'explosive':
                return progress < 0.1 ? progress / 0.1 : Math.exp(-(progress - 0.1) * 8);
            case 'ethereal':
                return Math.exp(-progress * 10) * Math.sin(Math.PI * progress) * 0.7;
            case 'multiplicative':
                return Math.exp(-progress * 7) * (1 + Math.sin(progress * 25) * 0.15);
            default:
                return Math.exp(-progress * 8);
        }
    }
    
    /**
     * UI操作音を生成
     */
    generateUISounds() {
        const uiSoundTypes = ['click', 'hover', 'error', 'success', 'select', 'back', 'confirm', 'cancel'];
        
        uiSoundTypes.forEach(type => {
            const buffer = this.createUISound(type);
            this.uiSounds.set(type, buffer);
        });
    }
    
    /**
     * UI操作音を作成
     * @param {string} type - UI音タイプ
     * @returns {AudioBuffer} 生成された音響バッファ
     */
    createUISound(type) {
        const profiles = {
            click: { freq: 800, duration: 0.05, decay: 20 },
            hover: { freq: 600, duration: 0.1, decay: 10 },
            error: { freq: 200, duration: 0.3, decay: 3, freqSlide: -100 },
            success: { freq: 440, duration: 0.4, decay: 2, freqSlide: 220 },
            select: { freq: 700, duration: 0.08, decay: 15 },
            back: { freq: 500, duration: 0.12, decay: 8 },
            confirm: { freq: 523, duration: 0.2, decay: 5 },
            cancel: { freq: 350, duration: 0.15, decay: 6 }
        };
        
        const profile = profiles[type] || profiles.click;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, profile.duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const progress = t / profile.duration;
            
            let freq = profile.freq;
            if (profile.freqSlide) {
                freq += profile.freqSlide * progress;
            }
            
            const decay = Math.exp(-t * profile.decay);
            const envelope = type === 'success' ? Math.sin(Math.PI * progress) : 1;
            
            data[i] = Math.sin(2 * Math.PI * freq * t) * decay * envelope * 0.2;
        }
        
        return buffer;
    }
    
    /**
     * 実績解除音を生成
     */
    generateAchievementSounds() {
        this.achievementRarities.forEach(rarity => {
            const buffer = this.createAchievementSound(rarity);
            this.achievementSounds.set(rarity, buffer);
        });
    }
    
    /**
     * 実績レアリティ別音響を作成
     * @param {string} rarity - レアリティ
     * @returns {AudioBuffer} 生成された音響バッファ
     */
    createAchievementSound(rarity) {
        const profiles = {
            common: { 
                frequencies: [523, 659], // C, E
                duration: 0.5, 
                complexity: 2 
            },
            rare: { 
                frequencies: [523, 659, 784], // C, E, G
                duration: 0.8, 
                complexity: 3 
            },
            epic: { 
                frequencies: [523, 659, 784, 1047], // C, E, G, C
                duration: 1.2, 
                complexity: 4 
            },
            legendary: { 
                frequencies: [523, 659, 784, 988, 1175, 1397], // C, E, G, B, D, F
                duration: 2.0, 
                complexity: 6 
            }
        };
        
        const profile = profiles[rarity] || profiles.common;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, profile.duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const progress = t / profile.duration;
            
            let sample = 0;
            
            // 複数周波数の和音
            profile.frequencies.forEach((freq, index) => {
                const delay = (index * 0.1); // 音符の時間差
                if (t >= delay) {
                    const noteProgress = (t - delay) / (profile.duration - delay);
                    const envelope = Math.exp(-noteProgress * 3) * Math.sin(Math.PI * noteProgress);
                    sample += Math.sin(2 * Math.PI * freq * (t - delay)) * envelope;
                }
            });
            
            // レアリティに応じた装飾
            if (rarity === 'legendary') {
                // キラキラ効果
                sample += Math.sin(2 * Math.PI * 2000 * t) * Math.exp(-t * 5) * 0.1;
            }
            
            data[i] = sample * 0.15 / profile.complexity;
        }
        
        return buffer;
    }
    
    /**
     * ゲーム状態音を生成
     */
    generateGameStateSounds() {
        const gameStateTypes = ['levelup', 'warning', 'timeup', 'stageclear', 'bonus_start', 'bonus_end'];
        
        gameStateTypes.forEach(type => {
            const buffer = this.createGameStateSound(type);
            this.gameStateSounds.set(type, buffer);
        });
    }
    
    /**
     * ゲーム状態音を作成
     * @param {string} type - ゲーム状態タイプ
     * @returns {AudioBuffer} 生成された音響バッファ
     */
    createGameStateSound(type) {
        const sampleRate = this.audioContext.sampleRate;
        let buffer, data;
        
        switch (type) {
            case 'levelup':
                buffer = this.audioContext.createBuffer(1, 1.0 * sampleRate, sampleRate);
                data = buffer.getChannelData(0);
                
                for (let i = 0; i < data.length; i++) {
                    const t = i / sampleRate;
                    const progress = t / 1.0;
                    
                    // 上昇するアルペジオ
                    const frequencies = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
                    const noteIndex = Math.floor(progress * frequencies.length);
                    const freq = frequencies[Math.min(noteIndex, frequencies.length - 1)];
                    
                    const noteProgress = (progress * frequencies.length) % 1;
                    const envelope = Math.sin(Math.PI * noteProgress) * Math.exp(-t * 1);
                    
                    data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
                }
                break;
                
            case 'warning':
                buffer = this.audioContext.createBuffer(1, 0.5 * sampleRate, sampleRate);
                data = buffer.getChannelData(0);
                
                for (let i = 0; i < data.length; i++) {
                    const t = i / sampleRate;
                    const freq = 800 + Math.sin(t * 10) * 200;
                    const envelope = Math.sin(t * 20) * Math.exp(-t * 2);
                    
                    data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
                }
                break;
                
            default:
                // デフォルト音
                buffer = this.audioContext.createBuffer(1, 0.3 * sampleRate, sampleRate);
                data = buffer.getChannelData(0);
                
                for (let i = 0; i < data.length; i++) {
                    const t = i / sampleRate;
                    const decay = Math.exp(-t * 5);
                    data[i] = Math.sin(2 * Math.PI * 440 * t) * decay * 0.2;
                }
        }
        
        return buffer;
    }
    
    /**
     * コンボ音を生成（5段階）
     */
    generateComboSounds() {
        this.comboLevels.forEach(level => {
            const variations = this.generateComboSoundVariations(level, 2);
            this.comboSounds.set(level, variations);
        });
    }
    
    /**
     * コンボレベル別音響バリエーションを生成
     * @param {number} comboLevel - コンボレベル
     * @param {number} variationCount - バリエーション数
     * @returns {AudioBuffer[]} 音響バリエーション配列
     */
    generateComboSoundVariations(comboLevel, variationCount = 2) {
        const variations = [];
        
        for (let i = 0; i < variationCount; i++) {
            const buffer = this.createComboSound(comboLevel, i);
            variations.push(buffer);
        }
        
        return variations;
    }
    
    /**
     * コンボレベル別の音響を作成
     * @param {number} comboLevel - コンボレベル (1-5)
     * @param {number} variation - バリエーション番号
     * @returns {AudioBuffer} 生成された音響バッファ
     */
    createComboSound(comboLevel, variation = 0) {
        const baseFreq = 400 + (comboLevel * 100); // コンボレベルで音程上昇
        const duration = 0.1 + (comboLevel * 0.02); // コンボレベルで長さ微増
        const harmonics = Math.min(comboLevel, 4); // 和音の複雑さ
        
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            // バリエーションによる微調整
            const freq = baseFreq * (1 + variation * 0.05);
            const freqModulation = 1.2 + (comboLevel * 0.1);
            
            // エンベロープ
            const envelope = Math.exp(-t * (8 + comboLevel)) * (1 + comboLevel * 0.1);
            
            // 基本音
            let sample = Math.sin(2 * Math.PI * freq * Math.pow(freqModulation, -t * 4) * t) * envelope;
            
            // 和音追加（コンボレベルが高いほど豊か）
            for (let h = 1; h <= harmonics; h++) {
                const harmonicFreq = freq * (1 + h * 0.5);
                const harmonicAmp = 1 / (h + 1);
                sample += Math.sin(2 * Math.PI * harmonicFreq * t) * envelope * harmonicAmp;
            }
            
            // キラキラ効果（高コンボ時）
            if (comboLevel >= 3) {
                const sparkle = Math.sin(2 * Math.PI * (freq * 3) * t) * envelope * 0.1;
                sample += sparkle;
            }
            
            data[i] = sample * (0.3 + comboLevel * 0.05);
        }
        
        return buffer;
    }
    
    /**
     * 泡破壊音を再生
     * @param {string} bubbleType - 泡タイプ
     * @param {number} comboLevel - コンボレベル (optional)
     * @param {Object} options - 再生オプション
     * @returns {AudioBufferSourceNode|null} 音源ノード
     */
    playBubbleSound(bubbleType, comboLevel = 0, options = {}) {
        try {
            if (!this.audioContext || !this.bubbleSounds.has(bubbleType)) {
                return null;
            }
            
            const variations = this.bubbleSounds.get(bubbleType);
            const variationIndex = Math.floor(Math.random() * variations.length);
            const buffer = variations[variationIndex];
            
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            
            // ゲインノード
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = options.volume || 1.0;
            
            // コンボレベルによるピッチ調整
            if (comboLevel > 0) {
                source.playbackRate.value = 1.0 + (comboLevel * 0.05);
            }
            
            source.connect(gainNode);
            gainNode.connect(this.sfxGainNode);
            
            source.start(this.audioContext.currentTime + (options.delay || 0));
            
            // 管理
            this.activeSources.add(source);
            source.addEventListener('ended', () => {
                this.activeSources.delete(source);
            });
            
            return source;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'playBubbleSound',
                bubbleType: bubbleType
            });
            return null;
        }
    }
    
    /**
     * コンボ音を再生
     * @param {number} comboLevel - コンボレベル
     * @param {Object} options - 再生オプション
     * @returns {AudioBufferSourceNode|null} 音源ノード
     */
    playComboSound(comboLevel, options = {}) {
        try {
            if (!this.audioContext || !this.comboSounds.has(comboLevel)) {
                return null;
            }
            
            const variations = this.comboSounds.get(comboLevel);
            const variationIndex = Math.floor(Math.random() * variations.length);
            const buffer = variations[variationIndex];
            
            return this._playSound(buffer, options);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'playComboSound',
                comboLevel: comboLevel
            });
            return null;
        }
    }
    
    /**
     * UI操作音を再生
     * @param {string} actionType - アクションタイプ
     * @param {Object} options - 再生オプション
     * @returns {AudioBufferSourceNode|null} 音源ノード
     */
    playUISound(actionType, options = {}) {
        try {
            if (!this.audioContext || !this.uiSounds.has(actionType)) {
                return null;
            }
            
            const buffer = this.uiSounds.get(actionType);
            return this._playSound(buffer, options);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'playUISound',
                actionType: actionType
            });
            return null;
        }
    }
    
    /**
     * 実績解除音を再生
     * @param {string} rarity - レアリティ
     * @param {Object} options - 再生オプション
     * @returns {AudioBufferSourceNode|null} 音源ノード
     */
    playAchievementSound(rarity, options = {}) {
        try {
            if (!this.audioContext || !this.achievementSounds.has(rarity)) {
                return null;
            }
            
            const buffer = this.achievementSounds.get(rarity);
            return this._playSound(buffer, options);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'playAchievementSound',
                rarity: rarity
            });
            return null;
        }
    }
    
    /**
     * ゲーム状態音を再生
     * @param {string} stateType - 状態タイプ
     * @param {Object} options - 再生オプション
     * @returns {AudioBufferSourceNode|null} 音源ノード
     */
    playGameStateSound(stateType, options = {}) {
        try {
            if (!this.audioContext || !this.gameStateSounds.has(stateType)) {
                return null;
            }
            
            const buffer = this.gameStateSounds.get(stateType);
            return this._playSound(buffer, options);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'playGameStateSound',
                stateType: stateType
            });
            return null;
        }
    }
    
    /**
     * 音響バッファを再生する共通メソッド
     * @param {AudioBuffer} buffer - 音響バッファ
     * @param {Object} options - 再生オプション
     * @returns {AudioBufferSourceNode|null} 音源ノード
     * @private
     */
    _playSound(buffer, options = {}) {
        try {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = options.volume || 1.0;
            
            if (options.pitch) {
                source.playbackRate.value = options.pitch;
            }
            
            source.connect(gainNode);
            gainNode.connect(this.sfxGainNode);
            
            source.start(this.audioContext.currentTime + (options.delay || 0));
            
            this.activeSources.add(source);
            source.addEventListener('ended', () => {
                this.activeSources.delete(source);
            });
            
            return source;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: '_playSound'
            });
            return null;
        }
    }
    
    /**
     * 音響バリエーションを動的生成
     * @param {string} baseSound - ベース音名
     * @param {number} variation - バリエーション番号
     * @returns {AudioBuffer} 生成された音響バッファ
     */
    generateSoundVariation(baseSound, variation) {
        try {
            // 泡タイプの場合
            if (this.bubbleTypes.includes(baseSound)) {
                return this.generateDynamicBubbleVariation(baseSound, variation);
            }
            
            // その他の音響の場合
            return this.generateGenericVariation(baseSound, variation);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'generateSoundVariation',
                baseSound: baseSound,
                variation: variation
            });
            return null;
        }
    }
    
    /**
     * 動的な泡バリエーションを生成
     * @param {string} bubbleType - 泡タイプ
     * @param {number} variation - バリエーション番号
     * @returns {AudioBuffer} 生成された音響バッファ
     */
    generateDynamicBubbleVariation(bubbleType, variation) {
        const profile = this.getBubbleSoundProfile(bubbleType);
        
        // バリエーション固有のパラメータ
        const variationParams = this.calculateVariationParameters(variation);
        
        // 泡サイズと種類に応じた音響特性調整
        const adjustedProfile = this.adjustSoundProfileForVariation(profile, variationParams);
        
        return this.createBubbleSoundWithProfile(adjustedProfile, variation);
    }
    
    /**
     * バリエーションパラメータを計算
     * @param {number} variation - バリエーション番号
     * @returns {Object} バリエーションパラメータ
     */
    calculateVariationParameters(variation) {
        const variationSeed = variation * 0.618034; // 黄金比ベースのシード
        
        return {
            pitchOffset: Math.sin(variationSeed * Math.PI * 2) * 0.15, // ±15%のピッチ変化
            durationMultiplier: 1 + Math.cos(variationSeed * Math.PI * 3) * 0.1, // ±10%の長さ変化
            harmonicShift: Math.sin(variationSeed * Math.PI * 5) * 0.2, // 倍音の変化
            noiseLevel: Math.abs(Math.sin(variationSeed * Math.PI * 7)) * 0.1, // ノイズレベル変化
            envelopeVariation: Math.sin(variationSeed * Math.PI * 11) * 0.3, // エンベロープ変化
            volumeOffset: 1 + Math.cos(variationSeed * Math.PI * 13) * 0.1 // ±10%の音量変化
        };
    }
    
    /**
     * バリエーションに応じて音響プロファイルを調整
     * @param {Object} profile - 元の音響プロファイル
     * @param {Object} variationParams - バリエーションパラメータ
     * @returns {Object} 調整された音響プロファイル
     */
    adjustSoundProfileForVariation(profile, variationParams) {
        return {
            ...profile,
            frequency: profile.frequency * (1 + variationParams.pitchOffset),
            duration: profile.duration * variationParams.durationMultiplier,
            volume: profile.volume * variationParams.volumeOffset,
            noise: Math.min(profile.noise + variationParams.noiseLevel, 0.5),
            harmonics: profile.harmonics ? 
                profile.harmonics.map(h => h * (1 + variationParams.harmonicShift)) : 
                profile.harmonics,
            envelopeVariation: variationParams.envelopeVariation
        };
    }
    
    /**
     * 調整された音響プロファイルで泡音を作成
     * @param {Object} profile - 調整された音響プロファイル
     * @param {number} variation - バリエーション番号
     * @returns {AudioBuffer} 生成された音響バッファ
     */
    createBubbleSoundWithProfile(profile, variation) {
        const duration = profile.duration;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            // 基本周波数とモジュレーション
            const freq = profile.frequency * Math.pow(profile.modulation, -t * profile.decayRate);
            
            // バリエーション固有のエンベロープ調整
            let envelope = this.generateEnvelope(progress, profile.envelope);
            if (profile.envelopeVariation) {
                envelope *= (1 + profile.envelopeVariation * Math.sin(progress * Math.PI * 3));
            }
            
            // 基本波形
            let sample = Math.sin(2 * Math.PI * freq * t) * envelope;
            
            // 調整された倍音
            if (profile.harmonics) {
                profile.harmonics.forEach((harmonic, index) => {
                    const harmonicFreq = freq * (index + 2);
                    sample += Math.sin(2 * Math.PI * harmonicFreq * t) * envelope * harmonic;
                });
            }
            
            // バリエーション固有のマイクロディテール
            sample += this.generateMicroDetails(t, progress, freq, envelope, variation);
            
            // ノイズ成分
            if (profile.noise > 0) {
                sample += (Math.random() - 0.5) * envelope * profile.noise;
            }
            
            data[i] = sample * profile.volume;
        }
        
        return buffer;
    }
    
    /**
     * バリエーション固有のマイクロディテールを生成
     * @param {number} t - 時間
     * @param {number} progress - 進行度
     * @param {number} freq - 基本周波数
     * @param {number} envelope - エンベロープ値
     * @param {number} variation - バリエーション番号
     * @returns {number} マイクロディテール値
     */
    generateMicroDetails(t, progress, freq, envelope, variation) {
        const variationSeed = variation * 0.314159; // π/10 ベースのシード
        let details = 0;
        
        // 微細な周波数変調
        const microFM = Math.sin(t * freq * 0.1 + variationSeed) * envelope * 0.02;
        details += microFM;
        
        // パルス的なアクセント
        if (variation % 3 === 0) {
            const pulse = Math.sin(t * 100 + variationSeed) * envelope * 0.05;
            details += pulse;
        }
        
        // 高周波キラキラ効果（特定のバリエーションのみ）
        if (variation % 5 === 0) {
            const sparkle = Math.sin(2 * Math.PI * freq * 4 * t + variationSeed) * 
                           envelope * envelope * 0.03; // envelope^2で急速減衰
            details += sparkle;
        }
        
        return details;
    }
    
    /**
     * 一般的な音響のバリエーションを生成
     * @param {string} baseSound - ベース音名
     * @param {number} variation - バリエーション番号
     * @returns {AudioBuffer} 生成された音響バッファ
     */
    generateGenericVariation(baseSound, variation) {
        // UI音や実績音などの基本的なバリエーション
        const variationParams = this.calculateVariationParameters(variation);
        
        // 元の音を取得
        let originalBuffer = null;
        if (this.uiSounds.has(baseSound)) {
            originalBuffer = this.uiSounds.get(baseSound);
        } else if (this.achievementSounds.has(baseSound)) {
            originalBuffer = this.achievementSounds.get(baseSound);
        } else if (this.gameStateSounds.has(baseSound)) {
            originalBuffer = this.gameStateSounds.get(baseSound);
        }
        
        if (!originalBuffer) {
            return null;
        }
        
        // バリエーションを適用した新しいバッファを作成
        return this.applyVariationToBuffer(originalBuffer, variationParams);
    }
    
    /**
     * 既存バッファにバリエーションを適用
     * @param {AudioBuffer} originalBuffer - 元のバッファ
     * @param {Object} variationParams - バリエーションパラメータ
     * @returns {AudioBuffer} バリエーション適用後のバッファ
     */
    applyVariationToBuffer(originalBuffer, variationParams) {
        const originalData = originalBuffer.getChannelData(0);
        const newDuration = originalBuffer.duration * variationParams.durationMultiplier;
        const newBuffer = this.audioContext.createBuffer(
            1, 
            newDuration * this.audioContext.sampleRate, 
            this.audioContext.sampleRate
        );
        const newData = newBuffer.getChannelData(0);
        
        for (let i = 0; i < newData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const originalIndex = Math.floor(t / variationParams.durationMultiplier * this.audioContext.sampleRate);
            
            if (originalIndex < originalData.length) {
                let sample = originalData[originalIndex];
                
                // ピッチシフト効果をシミュレート（簡易版）
                if (variationParams.pitchOffset !== 0) {
                    const pitchShiftedIndex = Math.floor(originalIndex * (1 + variationParams.pitchOffset));
                    if (pitchShiftedIndex < originalData.length && pitchShiftedIndex >= 0) {
                        sample = originalData[pitchShiftedIndex];
                    }
                }
                
                // 音量調整
                sample *= variationParams.volumeOffset;
                
                // ノイズ追加
                if (variationParams.noiseLevel > 0) {
                    sample += (Math.random() - 0.5) * variationParams.noiseLevel;
                }
                
                newData[i] = sample;
            }
        }
        
        return newBuffer;
    }
    
    /**
     * 泡サイズによる音響特性調整
     * @param {string} bubbleType - 泡タイプ
     * @param {number} size - 泡サイズ (0.5-2.0)
     * @returns {AudioBuffer} サイズ調整された音響バッファ
     */
    generateBubbleSoundBySize(bubbleType, size = 1.0) {
        try {
            const profile = this.getBubbleSoundProfile(bubbleType);
            
            // サイズに応じた音響特性調整
            const sizeAdjustedProfile = {
                ...profile,
                frequency: profile.frequency * Math.pow(size, -0.5), // 大きいほど低音
                duration: profile.duration * Math.pow(size, 0.3), // 大きいほど長い
                volume: profile.volume * Math.pow(size, 0.2), // 大きいほど大きい音
                decayRate: profile.decayRate * Math.pow(size, -0.2) // 大きいほど減衰が遅い
            };
            
            return this.createBubbleSoundWithProfile(sizeAdjustedProfile, 0);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'generateBubbleSoundBySize',
                bubbleType: bubbleType,
                size: size
            });
            return null;
        }
    }
    
    /**
     * コンテキスト依存の泡音生成
     * @param {string} bubbleType - 泡タイプ
     * @param {Object} context - コンテキスト情報
     * @returns {AudioBuffer} コンテキスト調整された音響バッファ
     */
    generateContextualBubbleSound(bubbleType, context = {}) {
        try {
            const {
                depth = 0, // 水深（0-1）
                pressure = 1, // 圧力
                temperature = 0.5, // 温度（0-1）
                velocity = 0, // 移動速度
                age = 0 // 泡の年齢（0-1）
            } = context;
            
            const profile = this.getBubbleSoundProfile(bubbleType);
            
            // コンテキストに応じた調整
            const contextProfile = {
                ...profile,
                frequency: profile.frequency * 
                    (1 + depth * 0.2) * // 深いほど高音
                    Math.pow(pressure, 0.1) * // 圧力による影響
                    (1 - temperature * 0.1), // 温度による影響
                duration: profile.duration * 
                    (1 + age * 0.3) * // 古いほど長い音
                    Math.pow(pressure, -0.1),
                volume: profile.volume * 
                    Math.pow(pressure, 0.2) * // 圧力で音量変化
                    (1 + velocity * 0.1), // 速度で音量変化
                noise: profile.noise + 
                    depth * 0.1 + // 深いほどノイジー
                    age * 0.05 // 古いほどノイジー
            };
            
            return this.createBubbleSoundWithProfile(contextProfile, Math.floor(depth * 10));
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'generateContextualBubbleSound',
                bubbleType: bubbleType,
                context: context
            });
            return null;
        }
    }
    
    /**
     * 動的バリエーションキャッシュを管理
     * @param {string} key - キャッシュキー
     * @param {AudioBuffer} buffer - 音響バッファ
     */
    cacheSoundVariation(key, buffer) {
        // LRUキャッシュの実装（簡易版）
        if (this.soundVariations.size > 100) {
            const firstKey = this.soundVariations.keys().next().value;
            this.soundVariations.delete(firstKey);
        }
        this.soundVariations.set(key, buffer);
    }
    
    /**
     * キャッシュから音響バリエーションを取得
     * @param {string} key - キャッシュキー
     * @returns {AudioBuffer|null} 音響バッファまたはnull
     */
    getCachedSoundVariation(key) {
        if (this.soundVariations.has(key)) {
            // アクセス順更新のためにre-set
            const buffer = this.soundVariations.get(key);
            this.soundVariations.delete(key);
            this.soundVariations.set(key, buffer);
            return buffer;
        }
        return null;
    }
    
    /**
     * 全ての効果音を停止
     */
    stopAllSounds() {
        this.activeSources.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                // Already stopped
            }
        });
        this.activeSources.clear();
    }
    
    /**
     * システムの統計情報を取得
     * @returns {Object} 統計情報
     */
    getSystemStats() {
        return {
            bubbleSoundTypes: this.bubbleSounds.size,
            uiSoundTypes: this.uiSounds.size,
            achievementSoundTypes: this.achievementSounds.size,
            gameStateSoundTypes: this.gameStateSounds.size,
            comboSoundLevels: this.comboSounds.size,
            activeSources: this.activeSources.size,
            totalSounds: this.bubbleSounds.size + this.uiSounds.size + 
                        this.achievementSounds.size + this.gameStateSounds.size + 
                        this.comboSounds.size
        };
    }
    
    /**
     * リソース解放
     */
    dispose() {
        this.stopAllSounds();
        
        // 設定監視を解除
        this.configWatchers.forEach(watchId => {
            this.configManager.unwatch(watchId);
        });
        this.configWatchers.clear();
        
        // バッファをクリア
        this.bubbleSounds.clear();
        this.uiSounds.clear();
        this.achievementSounds.clear();
        this.gameStateSounds.clear();
        this.comboSounds.clear();
        this.soundVariations.clear();
    }
}