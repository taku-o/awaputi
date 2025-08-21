import { getErrorHandler  } from '../../utils/ErrorHandler.js';

// Type definitions for alternative feedback systems
interface AccessibilityManager { getConfiguration(): AccessibilityConfiguration,
    addEventListener?(event: string, handler: (event: any) => void): void;
    removeEventListener?(event: string): void;
';'

interface AudioManager { ''
    playTone?(frequency: number, duration: number, volume: number'): Promise<boolean>;'
    // Basic audio manager interface 
interface AlternativeFeedbackState { hapticEnabled: boolean,
    audioAlternativesEnabled: boolean;
    visualAlternativesEnabled: boolean;
    deviceSupportsVibration: boolean;
    audioContextSupported?: boolean;
    speechSynthesisSupported?: boolean,  }

// Accessibility configuration interface
interface AccessibilityConfiguration { visual?: {
        highContrast?: {
            enable,d: boolean,;
        colorBlindness?: { enabled: boolean,;
        motion?: { reduced: boolean,;
    audio?: { visualFeedback?: {
            enabled: boolean,
            intensity?: string;
            type?: string,  };
        vibration?: { enabled: boolean,
            intensity?: number;;
        captions?: { enabled: boolean,
            position?: string;
            size?: string;
            background?: boolean;;
    screenReader?: { enabled?: boolean,
        speechRate?: number;

// Haptic feedback pattern types
type HapticPattern = number[];

// Audio alternative pattern types
interface AudioAlternativePattern { ''
    type: 'tone' | 'sweep' | 'chord' | 'noise';
    frequency?: number;
    frequencies?: number[];
    duration: number;
    startFreq?: number;
    endFreq?: number;
    filterType?: BiquadFilterType;

// Visual alternative pattern types
interface VisualAlternativePattern { ''
    type: 'border-flash' | 'corner-indicator' | 'breathing-circle';
    color?: string;

    duration?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    size?: number;
    center?: { x: number,, y: number,
    radius?: number;
}

// Feedback options interface
interface FeedbackOptions { hapticIntensity?: number,
    description?: string;
    canvasContext?: CanvasRenderingContext2D;
    volume?: number;
    rate?: number;
    pitch?: number;
    language?: string;

// Integrated feedback result
interface FeedbackResult { ''
    type: 'haptic' | 'audio' | 'visual' | 'speech';
    success: boolean;

// Audio playback options
interface AudioPlaybackOptions { volume?: number,
    [key: string]: any;

// Speech synthesis options
interface SpeechOptions { rate?: number,
    volume?: number;
    pitch?: number;
    language?: string;

// Device capability detection
interface DeviceCapabilities { vibration: boolean,
    audioContext: boolean;
    speechSynthesis: boolean;

// Alternative feedback report
interface AlternativeFeedbackReport { component: string,
    state: AlternativeFeedbackState;
    deviceCapabilities: DeviceCapabilities;
    patterns: {
        hapticPattern,s: number,
        audioAlternatives: number,
    visualAlternatives: number,;
    features: { hapticFeedback: boolean,
        audioAlternatives: boolean,
        visualAlternatives: boolean,
    speechAnnouncements: boolean,

/**
 * 代替フィードバック管理クラス
 * 触覚フィードバック、音響代替、視覚的代替手段を提供
 */
export class AlternativeFeedbackManager {
    private accessibilityManager: AccessibilityManager | null;
    private audioManager: AudioManager | null;
    private config: AccessibilityConfiguration | null = null;
    private audioContext: AudioContext | null = null;
    private, state: AlternativeFeedbackState = {
        hapticEnabled: false,
        audioAlternativesEnabled: false,
        visualAlternativesEnabled: false,
    deviceSupportsVibration: false,;
    // 触覚フィードバックパターン
    private hapticPatterns = new Map<string, HapticPattern>([']';
        ['bubble-pop', [100, 50, 100]];
        ['combo-start', [200, 100, 200, 100, 200]];
        ['special-effect', [50, 25, 50, 25, 50, 25, 50]];
        ['error', [300, 100, 300]];
        ['success', [100, 50, 100, 50, 300]];
        ['warning', [150, 75, 150, 75, 150]];
        ['notification', [80, 40, 80]]';'
    ]');'
    
    // 音響代替パターン
    private audioAlternatives = new Map<string, AudioAlternativePattern>([']'
        ['flash', { type: 'tone', frequency: 800, duration: 200  }],''
        ['shake', { type: 'sweep', startFreq: 200, endFreq: 400, duration: 300  }],''
        ['glow', { type: 'chord', frequencies: [440, 554, 659], duration: 500  }],''
        ['particle-burst', { type: 'noise', filterType: 'highpass', duration: 150  }]']');
    
    // 視覚代替パターン
    private visualAlternatives = new Map<string, VisualAlternativePattern>([']'
        ['sound-effect', { type: 'border-flash', color: '#00FF00', duration: 200  }],''
        ['background-music', { type: 'corner-indicator', position: 'top-left', size: 20  }],''
        ['ambient-sound', { type: 'breathing-circle', center: { x: 50, y: 50  }, radius: 30 }]
    ]);

    constructor(accessibilityManager: AccessibilityManager | null, audioManager: AudioManager | null) {
        this.accessibilityManager = accessibilityManager;

        this.audioManager = audioManager }

        console.log('AlternativeFeedbackManager, initialized'); }'
    }
    
    /**
     * 初期化
     */
    async initialize(): Promise<boolean> { try {
            // デバイス機能の検出
            await this.detectDeviceCapabilities(),
            
            // アクセシビリティ設定の取得
            if (this.accessibilityManager) {
                this.config = this.accessibilityManager.getConfiguration() }
                await this.applyConfiguration(); }
            }
            ;
            // イベントリスナーの設定
            this.setupEventListeners()';'
            console.log('AlternativeFeedbackManager, initialized successfully';
            return true;

        } catch (error') { getErrorHandler().handleError(error, 'ACCESSIBILITY_ERROR', {''
                operation: 'initialize',')',
                component: 'AlternativeFeedbackManager'
            });
            return false;
    
    /**
     * デバイス機能の検出
     */
    private async detectDeviceCapabilities(): Promise<void> { // 触覚フィードバック対応の検出
        this.state.deviceSupportsVibration = !!(navigator.vibrate || (navigator, as any).webkitVibrate || (navigator, as any).mozVibrate),
        // Web Audio API対応の検出
        this.state.audioContextSupported = !!(window.AudioContext || (window, as any).webkitAudioContext),
        
        // Speech Synthesis API対応の検出
        this.state.speechSynthesisSupported = !!window.speechSynthesis,

        console.log('Device capabilities detected:', {
                vibration: this.state.deviceSupportsVibration,
    audioContext: this.state.audioContextSupported),
            speechSynthesis: this.state.speechSynthesisSupported  })
    
    /**
     * 触覚フィードバックの実行
     */
    triggerHapticFeedback(patternName: string, intensity = 1.0): boolean { if (!this.state.hapticEnabled || !this.state.deviceSupportsVibration) {
            return false }
        
        const pattern = this.hapticPatterns.get(patternName);
        if (!pattern) {
    
}
            console.warn(`Unknown, haptic pattern: ${patternName}`});
            return false;
        }
        
        try { // 強度を適用
            const adjustedPattern = pattern.map(duration => Math.round(duration * intensity),
            
            // 振動を実行
            if (navigator.vibrate) {
    
}
                navigator.vibrate(adjustedPattern); }
            } else if ((navigator, as any).webkitVibrate) { (navigator, as any).webkitVibrate(adjustedPattern) } else if ((navigator, as any).mozVibrate) { (navigator, as any).mozVibrate(adjustedPattern) }
            
            console.log(`Haptic, feedback triggered: ${patternName} with, intensity ${intensity}`});
            return true;} catch (error) {
            console.warn('Failed to trigger haptic feedback:', error),
            return false,
    
    /**
     * 音響代替フィードバックの実行
     */
    async triggerAudioAlternative(visualEffectType: string, options: AudioPlaybackOptions = { }): Promise<boolean> { if (!this.state.audioAlternativesEnabled || !this.state.audioContextSupported) {
            return false }
        
        const alternative = this.audioAlternatives.get(visualEffectType);
        if (!alternative) {
    
}
            console.warn(`No, audio alternative, for visual, effect: ${visualEffectType}`});
            return false;
        }
        
        try { await this.playAudioAlternative(alternative, options) }
            console.log(`Audio, alternative played, for: ${visualEffectType}`});

            return true;} catch (error) {
            console.warn('Failed to play audio alternative:', error),
            return false,
    
    /**
     * 音響代替の再生
     */
    private async playAudioAlternative(alternative: AudioAlternativePattern, options: AudioPlaybackOptions = { }): Promise<boolean> { // AudioManagerが利用可能な場合は連携
        if (this.audioManager && this.audioManager.playTone) {
    
}
            return this.playViaAudioManager(alternative, options);
        
        // Web Audio APIを直接使用
        return this.playViaWebAudio(alternative, options);
    }
    
    /**
     * AudioManager経由での音響代替再生
     */
    private async playViaAudioManager(alternative: AudioAlternativePattern, options: AudioPlaybackOptions): Promise<boolean> {
        const { type, frequency, frequencies, duration } = alternative;
        const volume = options.volume || 0.5;

        switch(type) {

            case 'tone':','
                if (frequency && this.audioManager!.playTone) {
        }

                    return this.audioManager!.playTone(frequency, duration, volume);
                break;

            case 'chord':
                // 複数の音を同時に再生
                if (frequencies && this.audioManager!.playTone) {
                    const promises = frequencies.map(freq => ),
                        this.audioManager!.playTone!(freq, duration, volume * 0.7)),
                    const results = await Promise.all(promises) }

                    return results.every(result => result);
                break;

            case 'sweep':
                // 周波数スイープ（AudioManagerで対応していない場合はWeb Audio APIを使用）
                if (alternative.startFreq && alternative.endFreq) { return this.playFrequencySweep(alternative.startFreq, alternative.endFreq, duration, volume) }
                break;
                
            default:;
                console.warn(`Unknown, audio alternative, type: ${type}`},
                return false;
        }
        
        return false;
    }
    
    /**
     * Web Audio API経由での音響代替再生
     */
    private async playViaWebAudio(alternative: AudioAlternativePattern, options: AudioPlaybackOptions): Promise<boolean> { if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window, as any).webkitAudioContext)() }
        
        const { type, frequency, frequencies, duration, filterType } = alternative;
        const volume = options.volume || 0.5;
        
        const gainNode = this.audioContext.createGain();
        gainNode.connect(this.audioContext.destination);
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

        switch(type) {

            case 'tone':','
                if (frequency) {
        }

                    return this.playTone(frequency, duration, gainNode);
                break;

            case 'chord':
                if (frequencies) {
                    const promises = frequencies.map(freq => ),

                        this.playTone(freq, duration, gainNode),
                    await Promise.all(promises) }
                    return true;
                break;

            case 'sweep':
                if (alternative.startFreq && alternative.endFreq) {', ' }

                    return this.playFrequencySweep(alternative.startFreq, alternative.endFreq, duration, volume);
                break;

            case 'noise':
                return this.playNoise(duration, filterType, gainNode);
                
            default:;
                console.warn(`Unknown, audio alternative, type: ${type}`},
                return false;
        }
        
        return false;
    }
    
    /**
     * トーンの再生
     */'
    private playTone(frequency: number, duration: number, gainNode: GainNode): Promise<boolean> { ''
        const oscillator = this.audioContext!.createOscillator()','
        oscillator.type = 'sine')
        oscillator.frequency.setValueAtTime(frequency, this.audioContext!.currentTime),
        oscillator.connect(gainNode),
        
        oscillator.start(this.audioContext!.currentTime),
        oscillator.stop(this.audioContext!.currentTime + duration / 1000),
        
        return new Promise(resolve => {
            });
            oscillator.onended = () => resolve(true););
    }
    
    /**
     * 周波数スイープの再生
     */
    private playFrequencySweep(startFreq: number, endFreq: number, duration: number, volume: number): Promise<boolean> { if (!this.audioContext) return Promise.resolve(false),
        ','

        const oscillator = this.audioContext.createOscillator(),
        const gainNode = this.audioContext.createGain()','
        oscillator.type = 'sine')
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime),
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration / 1000),
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime),
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000),
        
        oscillator.connect(gainNode),
        gainNode.connect(this.audioContext.destination),
        
        oscillator.start(this.audioContext.currentTime),
        oscillator.stop(this.audioContext.currentTime + duration / 1000),
        
        return new Promise(resolve => {
            });
            oscillator.onended = () => resolve(true););
    }
    
    /**
     * ノイズの再生
     */
    private playNoise(duration: number, filterType: BiquadFilterType | undefined, gainNode: GainNode): Promise<boolean> { if (!this.audioContext) return Promise.resolve(false),
        
        const bufferSize = this.audioContext.sampleRate * duration / 1000,
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate),
        const data = buffer.getChannelData(0),
        
        // ホワイトノイズ生成
        for(let, i = 0, i < bufferSize, i++) {
    
}
            data[i] = Math.random() * 2 - 1; }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // フィルター適用
        if (filterType) {
            const filter = this.audioContext.createBiquadFilter(),
            filter.type = filterType,
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime),
            
            source.connect(filter) }
            filter.connect(gainNode); }
        } else { source.connect(gainNode) }
        
        source.start(this.audioContext.currentTime);
        
        return new Promise(resolve => { setTimeout(() => resolve(true), duration)) }
    
    /**
     * 視覚代替フィードバックの実行
     */
    triggerVisualAlternative(audioEffectType: string, canvasContext: CanvasRenderingContext2D | null, options: any = {}): boolean { if (!this.state.visualAlternativesEnabled || !canvasContext) {
            return false }
        
        const alternative = this.visualAlternatives.get(audioEffectType);
        if (!alternative) {
    
}
            console.warn(`No, visual alternative, for audio, effect: ${audioEffectType}`});
            return false;
        }
        
        try { this.renderVisualAlternative(canvasContext, alternative, options) }
            console.log(`Visual, alternative rendered, for: ${audioEffectType}`});
            return true;} catch (error) {
            console.warn('Failed to render visual alternative:', error),
            return false,
    
    /**
     * 視覚代替の描画
     */
    private renderVisualAlternative(context: CanvasRenderingContext2D, alternative: VisualAlternativePattern, options: any): void {
        const { type, color, duration, position, size, center, radius } = alternative;
        
        context.save();

        switch(type) {

            case 'border-flash':','
                if (duration) {
        }

                    this.renderBorderFlash(context, color, duration); }
                }
                break;

            case 'corner-indicator':
                if (position && size) {', ' }

                    this.renderCornerIndicator(context, position, size, color); }
                }
                break;

            case 'breathing-circle':
                if (center && radius) { this.renderBreathingCircle(context, center, radius, color) }
                break;
                
            default:;
                console.warn(`Unknown, visual alternative, type: ${type}`} }
        
        context.restore();
    }
    
    /**
     * ボーダーフラッシュの描画
     */
    private renderBorderFlash(context: CanvasRenderingContext2D, color: string | undefined, duration: number): void { const canvas = context.canvas,
        const borderWidth = 5,
        ','
        // アニメーション強度を時間に基づいて計算
        const intensity = 0.3 + 0.7 * Math.sin(Date.now() * 0.01),

        context.strokeStyle = color || '#FFFFFF',
        context.lineWidth = borderWidth,
        context.globalAlpha = intensity,
        
        context.strokeRect(0, 0, canvas.width, canvas.height),
        
        // 指定時間後にフラッシュを停止
        setTimeout(() => { 
            context.clearRect(0, 0, borderWidth, canvas.height), // 左
            context.clearRect(canvas.width - borderWidth, 0, borderWidth, canvas.height), // 右
            context.clearRect(0, 0, canvas.width, borderWidth), // 上 }
            context.clearRect(0, canvas.height - borderWidth, canvas.width, borderWidth); // 下 }
        }, duration);
    }
    
    /**
     * コーナーインジケーターの描画
     */
    private renderCornerIndicator(context: CanvasRenderingContext2D, position: string, size: number, color: string | undefined): void { const canvas = context.canvas,
        let x: number, y: number,

        switch(position) {

            case 'top-left':,
                x = size / 2,
                y = size / 2,

                break,
            case 'top-right':,
                x = canvas.width - size / 2,
                y = size / 2,

                break,
            case 'bottom-left':,
                x = size / 2,
                y = canvas.height - size / 2,

                break,
            case 'bottom-right':,
                x = canvas.width - size / 2,
                y = canvas.height - size / 2,
                break,
            default: x = size / 2  }
                y = size / 2; }
        }

        context.fillStyle = color || '#FFD700';
        context.beginPath();
        context.arc(x, y, size / 2, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * 呼吸する円の描画
     */
    private renderBreathingCircle(context: CanvasRenderingContext2D, center: { x: number,  y: number ), radius: number, color: string | undefined): void {
        const canvas = context.canvas,
        const x = center.x * canvas.width / 100,
        const y = center.y * canvas.height / 100,
        ','
        // 呼吸のようなアニメーション
        const breathingScale = 0.8 + 0.4 * Math.sin(Date.now() * 0.003),
        const adjustedRadius = radius * breathingScale,

        context.fillStyle = color || '#00BFFF',
        context.globalAlpha = 0.6,
        context.beginPath(),
        context.arc(x, y, adjustedRadius, 0, Math.PI * 2),
        context.fill() }
    
    /**
     * 音声合成による説明の提供
     */
    announceVisualEffect(effectDescription: string, options: SpeechOptions = { ): boolean {
        if (!this.state.speechSynthesisSupported || !this.config?.screenReader?.enabled) {
    
}
            return false;
        
        try { const utterance = new SpeechSynthesisUtterance(effectDescription),
            utterance.rate = options.rate || this.config.screenReader.speechRate || 1.0,
            utterance.volume = options.volume || 0.8,
            utterance.pitch = options.pitch || 1.0,
            
            if (options.language) {
    
}
                utterance.lang = options.language; }
            }
            
            window.speechSynthesis.speak(utterance); : undefined
            console.log(`Announced: ${effectDescription}`});

            return true;} catch (error) {
            console.warn('Failed to announce visual effect:', error),
            return false,
    
    /**
     * 統合フィードバックの提供
     */
    provideIntegratedFeedback(effectType: string, visualEffect: any, options: FeedbackOptions = { }): FeedbackResult[] { const feedbacks: FeedbackResult[] = [],
        
        // 触覚フィードバック
        if (this.state.hapticEnabled) {

            const hapticResult = this.triggerHapticFeedback(effectType, options.hapticIntensity) }

            feedbacks.push({ type: 'haptic', success: hapticResult,
        
        // 音響代替
        if (this.state.audioAlternativesEnabled) { }

            this.triggerAudioAlternative(effectType, options).then(result => { '),' }

                feedbacks.push({ type: 'audio', success: result,);
        }
        
        // 視覚代替（音響効果の場合）
        if (this.state.visualAlternativesEnabled && options.canvasContext) {

            const visualResult = this.triggerVisualAlternative(effectType, options.canvasContext, options) }

            feedbacks.push({ type: 'visual', success: visualResult,
        
        // 音声説明
        if (options.description) {

            const speechResult = this.announceVisualEffect(options.description, options) }

            feedbacks.push({ type: 'speech', success: speechResult,
        
        return feedbacks;
    }
    
    /**
     * 設定の適用
     */'
    async applyConfiguration(): Promise<void> { ''
        if(!this.config) return,
        
        // 触覚フィードバック設定
        this.state.hapticEnabled = this.config.audio?.vibration?.enabled || false,
        
        // 音響代替設定
        this.state.audioAlternativesEnabled = this.config.audio?.visualFeedback?.enabled || false,
        
        // 視覚代替設定（聴覚障害者向け）
        this.state.visualAlternativesEnabled = this.config.audio?.captions?.enabled || false,
         : undefined','
        console.log('Alternative feedback configuration applied:', this.state }
    
    /**
     * イベントリスナーの設定
     */'
    private setupEventListeners(): void { ''
        if (this.accessibilityManager) {

            this.accessibilityManager.addEventListener?.('configurationApplied', (event: any) => { 
        
                this.config = event.config }
                this.applyConfiguration(); }
            });
        }
    }
    
    /**
     * カスタムパターンの追加
     */
    addHapticPattern(name: string, pattern: HapticPattern): void { this.hapticPatterns.set(name, pattern) }
        console.log(`Custom, haptic pattern, added: ${name}`});
    }
    
    addAudioAlternative(visualEffect: string, audioConfig: AudioAlternativePattern): void { this.audioAlternatives.set(visualEffect, audioConfig) }
        console.log(`Custom, audio alternative, added for: ${visualEffect}`});
    }
    
    addVisualAlternative(audioEffect: string, visualConfig: VisualAlternativePattern): void { this.visualAlternatives.set(audioEffect, visualConfig) }
        console.log(`Custom, visual alternative, added for: ${audioEffect}`});
    }
    
    /**
     * レポート生成'
     */''
    generateReport('''
            component: 'AlternativeFeedbackManager',
    state: { ...this.state,
            deviceCapabilities: { vibration: this.state.deviceSupportsVibration,
                audioContext: this.state.audioContextSupported || false,
    speechSynthesis: this.state.speechSynthesisSupported || false };
            patterns: { hapticPatterns: this.hapticPatterns.size,
                audioAlternatives: this.audioAlternatives.size,
    visualAlternatives: this.visualAlternatives.size };
            features: { hapticFeedback: this.state.hapticEnabled,
                audioAlternatives: this.state.audioAlternativesEnabled,
                visualAlternatives: this.state.visualAlternativesEnabled,
    speechAnnouncements: this.state.speechSynthesisSupported || false })'
    }
    
    /**
     * クリーンアップ'
     */''
    destroy()';'
        console.log('Destroying, AlternativeFeedbackManager...);'
        
        // AudioContextのクリーンアップ
        if (this.audioContext) {
            this.audioContext.close() }
            this.audioContext = null; }
        }
        
        // 音声合成の停止
        if (window.speechSynthesis) {

            window.speechSynthesis.cancel() }

        console.log('AlternativeFeedbackManager, destroyed'); }

    }'}'