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
        const uiSoundTypes = [
            'click', 'hover', 'error', 'success', 'select', 'back', 'confirm', 'cancel',
            'button_press', 'button_release', 'tab_switch', 'dropdown_open', 'dropdown_close',
            'modal_open', 'modal_close', 'notification', 'toggle_on', 'toggle_off',
            'slider_move', 'focus_in', 'focus_out', 'drag_start', 'drag_end', 'drop',
            'menu_open', 'menu_close', 'scroll', 'page_turn', 'typing'
        ];
        
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
        const profile = this.getUISoundProfile(type);
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
            
            // プロファイル別のエンベロープ生成
            const envelope = this.generateUIEnvelope(progress, profile.envelope || 'default');
            const decay = Math.exp(-t * profile.decay);
            
            let sample = Math.sin(2 * Math.PI * freq * t) * decay * envelope;
            
            // 特殊効果の追加
            sample += this.generateUISpecialEffects(t, progress, freq, envelope, profile);
            
            data[i] = sample * profile.volume;
        }
        
        return buffer;
    }
    
    /**
     * UI音響プロファイルを取得
     * @param {string} type - UI音タイプ
     * @returns {Object} UI音響プロファイル
     */
    getUISoundProfile(type) {
        const profiles = {
            // 基本操作音
            click: { 
                freq: 800, duration: 0.05, decay: 20, volume: 0.2, 
                envelope: 'sharp', category: 'button' 
            },
            hover: { 
                freq: 600, duration: 0.1, decay: 10, volume: 0.1, 
                envelope: 'soft', category: 'feedback' 
            },
            error: { 
                freq: 200, duration: 0.3, decay: 3, freqSlide: -100, volume: 0.3, 
                envelope: 'error', category: 'alert' 
            },
            success: { 
                freq: 440, duration: 0.4, decay: 2, freqSlide: 220, volume: 0.3, 
                envelope: 'success', category: 'confirmation' 
            },
            select: { 
                freq: 700, duration: 0.08, decay: 15, volume: 0.2, 
                envelope: 'crisp', category: 'selection' 
            },
            back: { 
                freq: 500, duration: 0.12, decay: 8, volume: 0.25, 
                envelope: 'backward', category: 'navigation' 
            },
            confirm: { 
                freq: 523, duration: 0.2, decay: 5, volume: 0.3, 
                envelope: 'confirm', category: 'confirmation' 
            },
            cancel: { 
                freq: 350, duration: 0.15, decay: 6, volume: 0.25, 
                envelope: 'cancel', category: 'cancellation' 
            },
            
            // 高度なUI音
            button_press: { 
                freq: 750, duration: 0.04, decay: 25, volume: 0.2, 
                envelope: 'press', category: 'button' 
            },
            button_release: { 
                freq: 650, duration: 0.06, decay: 18, volume: 0.15, 
                envelope: 'release', category: 'button' 
            },
            tab_switch: { 
                freq: 600, duration: 0.1, decay: 12, volume: 0.2, 
                envelope: 'switch', category: 'navigation' 
            },
            dropdown_open: { 
                freq: 500, duration: 0.15, freqSlide: 100, decay: 8, volume: 0.2, 
                envelope: 'expand', category: 'control' 
            },
            dropdown_close: { 
                freq: 600, duration: 0.1, freqSlide: -50, decay: 12, volume: 0.15, 
                envelope: 'collapse', category: 'control' 
            },
            modal_open: { 
                freq: 440, duration: 0.3, decay: 4, volume: 0.25, 
                envelope: 'modal_open', category: 'overlay' 
            },
            modal_close: { 
                freq: 440, duration: 0.2, decay: 6, volume: 0.2, 
                envelope: 'modal_close', category: 'overlay' 
            },
            notification: { 
                freq: 880, duration: 0.4, decay: 3, volume: 0.3, 
                envelope: 'notification', category: 'alert' 
            },
            toggle_on: { 
                freq: 700, duration: 0.08, freqSlide: 200, decay: 15, volume: 0.2, 
                envelope: 'on', category: 'toggle' 
            },
            toggle_off: { 
                freq: 500, duration: 0.08, freqSlide: -100, decay: 15, volume: 0.15, 
                envelope: 'off', category: 'toggle' 
            },
            slider_move: { 
                freq: 400, duration: 0.03, decay: 30, volume: 0.1, 
                envelope: 'slide', category: 'control' 
            },
            focus_in: { 
                freq: 650, duration: 0.06, decay: 18, volume: 0.1, 
                envelope: 'focus_in', category: 'feedback' 
            },
            focus_out: { 
                freq: 550, duration: 0.06, decay: 18, volume: 0.08, 
                envelope: 'focus_out', category: 'feedback' 
            },
            drag_start: { 
                freq: 600, duration: 0.08, decay: 15, volume: 0.15, 
                envelope: 'drag_start', category: 'interaction' 
            },
            drag_end: { 
                freq: 500, duration: 0.1, decay: 12, volume: 0.15, 
                envelope: 'drag_end', category: 'interaction' 
            },
            drop: { 
                freq: 400, duration: 0.12, decay: 10, volume: 0.2, 
                envelope: 'drop', category: 'interaction' 
            },
            menu_open: { 
                freq: 523, duration: 0.15, freqSlide: 50, decay: 8, volume: 0.2, 
                envelope: 'menu_open', category: 'navigation' 
            },
            menu_close: { 
                freq: 523, duration: 0.1, freqSlide: -30, decay: 12, volume: 0.15, 
                envelope: 'menu_close', category: 'navigation' 
            },
            scroll: { 
                freq: 300, duration: 0.02, decay: 50, volume: 0.05, 
                envelope: 'scroll', category: 'feedback' 
            },
            page_turn: { 
                freq: 450, duration: 0.2, decay: 6, volume: 0.2, 
                envelope: 'page_turn', category: 'navigation' 
            },
            typing: { 
                freq: 800, duration: 0.02, decay: 40, volume: 0.08, 
                envelope: 'typing', category: 'input' 
            }
        };
        
        return profiles[type] || profiles.click;
    }
    
    /**
     * UI音響用エンベロープを生成
     * @param {number} progress - 進行度 (0-1)
     * @param {string} envelopeType - エンベロープタイプ
     * @returns {number} エンベロープ値
     */
    generateUIEnvelope(progress, envelopeType) {
        switch (envelopeType) {
            case 'sharp':
                return Math.exp(-progress * 20);
            case 'soft':
                return Math.exp(-progress * 10) * Math.sin(Math.PI * progress);
            case 'error':
                return Math.exp(-progress * 3) * (1 + Math.sin(progress * 20) * 0.2);
            case 'success':
                return Math.sin(Math.PI * progress) * Math.exp(-progress * 2);
            case 'crisp':
                return Math.exp(-progress * 15);
            case 'backward':
                return (1 - progress) * Math.exp(-progress * 8);
            case 'confirm':
                return Math.sin(Math.PI * progress * 0.7) * Math.exp(-progress * 5);
            case 'cancel':
                return Math.exp(-progress * 6) * (1 - progress * 0.3);
            case 'press':
                return Math.exp(-progress * 25) * (progress < 0.1 ? progress / 0.1 : 1);
            case 'release':
                return Math.exp(-progress * 18) * (1 - progress * 0.2);
            case 'switch':
                return Math.exp(-progress * 12) * Math.sin(Math.PI * progress);
            case 'expand':
                return progress < 0.3 ? progress / 0.3 : Math.exp(-(progress - 0.3) * 10);
            case 'collapse':
                return Math.exp(-progress * 12) * (1 - progress * 0.5);
            case 'modal_open':
                return Math.sin(Math.PI * progress * 0.5) * Math.exp(-progress * 4);
            case 'modal_close':
                return Math.exp(-progress * 6);
            case 'notification':
                return Math.sin(Math.PI * progress) * Math.exp(-progress * 3);
            case 'on':
                return progress < 0.2 ? progress / 0.2 : Math.exp(-(progress - 0.2) * 12);
            case 'off':
                return Math.exp(-progress * 15) * (1 - progress);
            case 'slide':
                return Math.exp(-progress * 30);
            case 'focus_in':
                return progress < 0.3 ? progress / 0.3 : Math.exp(-(progress - 0.3) * 15);
            case 'focus_out':
                return Math.exp(-progress * 18) * (1 - progress * 0.3);
            case 'drag_start':
                return Math.exp(-progress * 15) * (1 + Math.sin(progress * 10) * 0.1);
            case 'drag_end':
                return Math.exp(-progress * 12);
            case 'drop':
                return progress < 0.1 ? progress / 0.1 : Math.exp(-(progress - 0.1) * 8);
            case 'menu_open':
                return Math.sin(Math.PI * progress * 0.6) * Math.exp(-progress * 8);
            case 'menu_close':
                return Math.exp(-progress * 12);
            case 'scroll':
                return Math.exp(-progress * 50);
            case 'page_turn':
                return Math.sin(Math.PI * progress * 0.8) * Math.exp(-progress * 6);
            case 'typing':
                return Math.exp(-progress * 40);
            default:
                return Math.exp(-progress * 15);
        }
    }
    
    /**
     * UI音響用特殊効果を生成
     * @param {number} t - 時間
     * @param {number} progress - 進行度
     * @param {number} freq - 基本周波数
     * @param {number} envelope - エンベロープ値
     * @param {Object} profile - 音響プロファイル
     * @returns {number} 特殊効果値
     */
    generateUISpecialEffects(t, progress, freq, envelope, profile) {
        let effects = 0;
        
        switch (profile.category) {
            case 'button':
                // ボタン音にはわずかなクリック感
                if (progress < 0.1) {
                    effects += Math.sin(2 * Math.PI * freq * 2 * t) * envelope * 0.1;
                }
                break;
                
            case 'alert':
                // アラート音には注意を引く変調
                effects += Math.sin(2 * Math.PI * freq * 0.5 * t + Math.sin(t * 20)) * envelope * 0.1;
                break;
                
            case 'confirmation':
                // 確認音には安心感のある和音
                effects += Math.sin(2 * Math.PI * freq * 1.25 * t) * envelope * 0.3;
                break;
                
            case 'toggle':
                // トグル音にはON/OFF感のある倍音
                effects += Math.sin(2 * Math.PI * freq * 1.5 * t) * envelope * 0.2;
                break;
                
            case 'interaction':
                // インタラクション音には動的な要素
                effects += Math.sin(2 * Math.PI * freq * (1 + progress * 0.2) * t) * envelope * 0.15;
                break;
                
            case 'overlay':
                // オーバーレイ音には空間的な広がり
                effects += Math.sin(2 * Math.PI * freq * 0.5 * t) * envelope * envelope * 0.2;
                break;
        }
        
        return effects;
    }
    
    /**
     * UIイベントとの自動連携機能
     * @param {HTMLElement} element - 対象要素
     * @param {Object} soundMap - 音響マッピング
     */
    setupUIEventListeners(element, soundMap = {}) {
        try {
            const defaultSoundMap = {
                'click': 'click',
                'mouseenter': 'hover',
                'focus': 'focus_in',
                'blur': 'focus_out',
                'dragstart': 'drag_start',
                'dragend': 'drag_end',
                'drop': 'drop',
                'input': 'typing',
                'change': 'select'
            };
            
            const finalSoundMap = { ...defaultSoundMap, ...soundMap };
            
            Object.entries(finalSoundMap).forEach(([eventType, soundType]) => {
                element.addEventListener(eventType, (event) => {
                    this.playUISound(soundType, { volume: 0.5 });
                });
            });
            
            console.log(`UI event listeners set up for element:`, element);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'setupUIEventListeners',
                element: element?.tagName
            });
        }
    }
    
    /**
     * UI要素タイプ別の自動音響設定
     * @param {HTMLElement} element - 対象要素
     */
    setupElementTypeSounds(element) {
        try {
            const tagName = element.tagName.toLowerCase();
            const role = element.getAttribute('role');
            const type = element.getAttribute('type');
            
            let soundMap = {};
            
            // 要素タイプ別の音響マッピング
            switch (tagName) {
                case 'button':
                    soundMap = {
                        'mousedown': 'button_press',
                        'mouseup': 'button_release',
                        'click': 'confirm',
                        'mouseenter': 'hover'
                    };
                    break;
                    
                case 'input':
                    if (type === 'checkbox' || type === 'radio') {
                        soundMap = {
                            'change': element.checked ? 'toggle_on' : 'toggle_off',
                            'mouseenter': 'hover'
                        };
                    } else if (type === 'range') {
                        soundMap = {
                            'input': 'slider_move',
                            'mouseenter': 'hover'
                        };
                    } else {
                        soundMap = {
                            'input': 'typing',
                            'focus': 'focus_in',
                            'blur': 'focus_out'
                        };
                    }
                    break;
                    
                case 'select':
                    soundMap = {
                        'click': 'dropdown_open',
                        'change': 'select',
                        'blur': 'dropdown_close'
                    };
                    break;
                    
                case 'a':
                    soundMap = {
                        'click': 'select',
                        'mouseenter': 'hover'
                    };
                    break;
                    
                default:
                    // role属性による判定
                    if (role === 'tab') {
                        soundMap = {
                            'click': 'tab_switch',
                            'mouseenter': 'hover'
                        };
                    } else if (role === 'button') {
                        soundMap = {
                            'click': 'button_press',
                            'mouseenter': 'hover'
                        };
                    }
            }
            
            if (Object.keys(soundMap).length > 0) {
                this.setupUIEventListeners(element, soundMap);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'setupElementTypeSounds',
                element: element?.tagName
            });
        }
    }
    
    /**
     * ページ全体のUI音響を自動設定
     * @param {Document|HTMLElement} container - 対象コンテナ（デフォルト: document）
     */
    setupGlobalUISounds(container = document) {
        try {
            // 主要なUI要素を取得して音響を設定
            const selectors = [
                'button',
                'input[type="button"]',
                'input[type="submit"]',
                'input[type="reset"]',
                'input[type="checkbox"]',
                'input[type="radio"]',
                'input[type="range"]',
                'input[type="text"]',
                'input[type="email"]',
                'input[type="password"]',
                'select',
                'textarea',
                'a[href]',
                '[role="button"]',
                '[role="tab"]',
                '[role="menuitem"]'
            ];
            
            selectors.forEach(selector => {
                const elements = container.querySelectorAll(selector);
                elements.forEach(element => {
                    this.setupElementTypeSounds(element);
                });
            });
            
            console.log(`Global UI sounds set up for ${selectors.length} element types`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'setupGlobalUISounds'
            });
        }
    }
    
    /**
     * 実績解除音を生成
     */
    generateAchievementSounds() {
        this.achievementRarities.forEach(rarity => {
            const buffer = this.createAchievementSound(rarity);
            this.achievementSounds.set(rarity, buffer);
        });
        
        // 実績カテゴリ別音響も生成
        this.generateAchievementCategorySounds();
    }
    
    /**
     * 実績カテゴリ別音響を生成
     */
    generateAchievementCategorySounds() {
        const categories = [
            'score', 'combo', 'bubble', 'time', 'survival', 'collection', 
            'progression', 'mastery', 'special', 'secret'
        ];
        
        categories.forEach(category => {
            this.achievementRarities.forEach(rarity => {
                const key = `${category}_${rarity}`;
                const buffer = this.createCategoryAchievementSound(category, rarity);
                this.achievementSounds.set(key, buffer);
            });
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
            
            // コンボレベル別エンベロープの強化
            const envelope = this.generateComboEnvelope(progress, comboLevel);
            
            // 基本音
            let sample = Math.sin(2 * Math.PI * freq * Math.pow(freqModulation, -t * 4) * t) * envelope;
            
            // 和音追加（コンボレベルが高いほど豊か）
            for (let h = 1; h <= harmonics; h++) {
                const harmonicFreq = freq * (1 + h * 0.5);
                const harmonicAmp = 1 / (h + 1);
                sample += Math.sin(2 * Math.PI * harmonicFreq * t) * envelope * harmonicAmp;
            }
            
            // コンボレベル別特殊効果
            sample += this.generateComboSpecialEffects(t, progress, freq, envelope, comboLevel, variation);
            
            data[i] = sample * this.getComboVolumeMultiplier(comboLevel);
        }
        
        return buffer;
    }
    
    /**
     * コンボレベル別エンベロープを生成
     * @param {number} progress - 進行度 (0-1)
     * @param {number} comboLevel - コンボレベル
     * @returns {number} エンベロープ値
     */
    generateComboEnvelope(progress, comboLevel) {
        const baseDecay = 8 + comboLevel;
        let envelope = Math.exp(-progress * baseDecay) * (1 + comboLevel * 0.1);
        
        // コンボレベル別エンベロープ特性
        switch (comboLevel) {
            case 1:
                // シンプルな減衰
                break;
            case 2:
                // 軽いパルス
                envelope *= (1 + Math.sin(progress * Math.PI * 2) * 0.1);
                break;
            case 3:
                // 複数パルス
                envelope *= (1 + Math.sin(progress * Math.PI * 4) * 0.15);
                break;
            case 4:
                // 複雑な変調
                envelope *= (1 + Math.sin(progress * Math.PI * 6) * 0.2 + 
                           Math.cos(progress * Math.PI * 8) * 0.1);
                break;
            case 5:
                // 最大の変調と持続
                envelope *= (1 + Math.sin(progress * Math.PI * 8) * 0.25 + 
                           Math.cos(progress * Math.PI * 12) * 0.15);
                // より長い持続
                envelope = Math.max(envelope, Math.exp(-progress * 4) * 0.3);
                break;
        }
        
        return envelope;
    }
    
    /**
     * コンボレベル別特殊効果を生成
     * @param {number} t - 時間
     * @param {number} progress - 進行度
     * @param {number} freq - 基本周波数
     * @param {number} envelope - エンベロープ値
     * @param {number} comboLevel - コンボレベル
     * @param {number} variation - バリエーション番号
     * @returns {number} 特殊効果値
     */
    generateComboSpecialEffects(t, progress, freq, envelope, comboLevel, variation) {
        let effects = 0;
        
        // レベル3以上：キラキラ効果
        if (comboLevel >= 3) {
            const sparkleFreq = freq * 3 + variation * 50;
            const sparkle = Math.sin(2 * Math.PI * sparkleFreq * t) * envelope * envelope * 0.1;
            effects += sparkle;
        }
        
        // レベル4以上：和音アルペジオ
        if (comboLevel >= 4) {
            const arpeggioNotes = [1, 1.25, 1.5, 2]; // メジャーコード + オクターブ
            const noteIndex = Math.floor(progress * arpeggioNotes.length);
            const arpeggioFreq = freq * arpeggioNotes[noteIndex];
            const arpeggio = Math.sin(2 * Math.PI * arpeggioFreq * t) * envelope * 0.15;
            effects += arpeggio;
        }
        
        // レベル5：グリッサンド効果
        if (comboLevel === 5) {
            const glissandoFreq = freq * (1 + progress * 0.5); // 50%音程上昇
            const glissando = Math.sin(2 * Math.PI * glissandoFreq * t) * envelope * 0.2;
            effects += glissando;
            
            // 超高音キラキラ
            const highSparkle = Math.sin(2 * Math.PI * freq * 8 * t) * 
                              envelope * envelope * envelope * 0.05;
            effects += highSparkle;
        }
        
        return effects;
    }
    
    /**
     * コンボレベル別音量倍率を取得
     * @param {number} comboLevel - コンボレベル
     * @returns {number} 音量倍率
     */
    getComboVolumeMultiplier(comboLevel) {
        const baseVolume = 0.3;
        const levelMultiplier = 1 + (comboLevel - 1) * 0.1; // 10%ずつ増加
        const maxMultiplier = 1.5; // 最大50%増
        
        return Math.min(baseVolume * levelMultiplier, baseVolume * maxMultiplier);
    }
    
    /**
     * 連続コンボ用の連鎖音響を生成
     * @param {number} comboCount - 連続コンボ数
     * @param {number} comboLevel - 現在のコンボレベル
     * @returns {AudioBuffer} 連鎖音響バッファ
     */
    generateComboChainSound(comboCount, comboLevel) {
        try {
            const duration = 0.05 + Math.min(comboCount * 0.01, 0.15); // 最大0.2秒
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            const baseFreq = 600 + (comboLevel * 100) + (comboCount * 25);
            
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                const progress = t / duration;
                
                // 急速な減衰
                const envelope = Math.exp(-t * 15);
                
                // 基本音
                let sample = Math.sin(2 * Math.PI * baseFreq * t) * envelope;
                
                // 連続コンボのエコー効果
                if (comboCount > 3) {
                    const echoDelay = 0.01;
                    const echoT = t - echoDelay;
                    if (echoT > 0) {
                        const echoSample = Math.sin(2 * Math.PI * baseFreq * 1.2 * echoT) * 
                                         Math.exp(-echoT * 20) * 0.3;
                        sample += echoSample;
                    }
                }
                
                // 高コンボ時のハーモニー
                if (comboCount > 5) {
                    const harmonyFreq = baseFreq * 1.5;
                    const harmony = Math.sin(2 * Math.PI * harmonyFreq * t) * envelope * 0.4;
                    sample += harmony;
                }
                
                data[i] = sample * 0.2;
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'generateComboChainSound',
                comboCount: comboCount,
                comboLevel: comboLevel
            });
            return null;
        }
    }
    
    /**
     * コンボブレイク時の音響を生成
     * @param {number} maxComboLevel - 達成した最大コンボレベル
     * @param {number} comboCount - 最終コンボ数
     * @returns {AudioBuffer} コンボブレイク音響バッファ
     */
    generateComboBreakSound(maxComboLevel, comboCount) {
        try {
            const duration = 0.3 + (maxComboLevel * 0.1); // レベルに応じて長く
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            const baseFreq = 300; // 低めの音から開始
            
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                const progress = t / duration;
                
                // 下降する音程（コンボが終わる感じ）
                const freq = baseFreq * Math.pow(0.5, progress); // 1オクターブ下降
                
                // 徐々に消える
                const envelope = Math.exp(-t * 3) * (1 - progress * 0.5);
                
                // 基本音
                let sample = Math.sin(2 * Math.PI * freq * t) * envelope;
                
                // 高コンボの場合は和音でリッチに
                if (maxComboLevel >= 3) {
                    const harmony1 = Math.sin(2 * Math.PI * freq * 1.25 * t) * envelope * 0.6;
                    const harmony2 = Math.sin(2 * Math.PI * freq * 1.5 * t) * envelope * 0.4;
                    sample += harmony1 + harmony2;
                }
                
                // 最高レベルの場合は特別な残響
                if (maxComboLevel === 5) {
                    const reverb = Math.sin(2 * Math.PI * freq * 0.5 * t) * envelope * 0.3;
                    sample += reverb;
                }
                
                data[i] = sample * 0.4;
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'generateComboBreakSound',
                maxComboLevel: maxComboLevel,
                comboCount: comboCount
            });
            return null;
        }
    }
    
    /**
     * コンボミルストーン達成音を生成
     * @param {number} milestone - マイルストーン（10, 25, 50, 100など）
     * @returns {AudioBuffer} マイルストーン音響バッファ
     */
    generateComboMilestoneSound(milestone) {
        try {
            const duration = 1.0 + Math.log10(milestone / 10) * 0.5; // ログスケールで長く
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            // マイルストーンに応じた和音
            const chordNotes = this.getMilestoneChord(milestone);
            
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                const progress = t / duration;
                
                // 美しいエンベロープ
                const envelope = Math.sin(Math.PI * progress) * Math.exp(-t * 1);
                
                let sample = 0;
                
                // 和音演奏
                chordNotes.forEach((noteRatio, index) => {
                    const freq = 440 * noteRatio; // A4基準
                    const noteEnvelope = envelope * Math.exp(-index * 0.1); // 高音ほど早く減衰
                    sample += Math.sin(2 * Math.PI * freq * t) * noteEnvelope;
                });
                
                // 高マイルストーン時の装飾
                if (milestone >= 50) {
                    const decoration = Math.sin(2 * Math.PI * 880 * 3 * t) * envelope * envelope * 0.1;
                    sample += decoration;
                }
                
                data[i] = sample * (0.3 / chordNotes.length); // 正規化
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                component: 'SoundEffectSystem',
                operation: 'generateComboMilestoneSound',
                milestone: milestone
            });
            return null;
        }
    }
    
    /**
     * マイルストーンに応じた和音を取得
     * @param {number} milestone - マイルストーン数
     * @returns {number[]} 音程比率の配列
     */
    getMilestoneChord(milestone) {
        if (milestone >= 100) {
            // 100以上：豪華な7th和音
            return [1, 1.25, 1.5, 1.875, 2]; // C, E, G, Bb, C
        } else if (milestone >= 50) {
            // 50以上：6th和音
            return [1, 1.25, 1.5, 1.667]; // C, E, G, A
        } else if (milestone >= 25) {
            // 25以上：メジャー7th
            return [1, 1.25, 1.5, 1.875]; // C, E, G, Bb
        } else if (milestone >= 10) {
            // 10以上：基本三和音
            return [1, 1.25, 1.5]; // C, E, G
        } else {
            // 10未満：単音
            return [1];
        }
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