import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * 代替フィードバック管理クラス
 * 触覚フィードバック、音響代替、视覚的代替手段を提供
 */
export class AlternativeFeedbackManager {
    constructor(accessibilityManager, audioManager) {
        this.accessibilityManager = accessibilityManager;
        this.audioManager = audioManager;
        this.config = null;
        this.state = {
            hapticEnabled: false,
            audioAlternativesEnabled: false,
            visualAlternativesEnabled: false,
            deviceSupportsVibration: false
        };
        
        // 触覚フィードバックパターン
        this.hapticPatterns = new Map([
            ['bubble-pop', [100, 50, 100]],
            ['combo-start', [200, 100, 200, 100, 200]],
            ['special-effect', [50, 25, 50, 25, 50, 25, 50]],
            ['error', [300, 100, 300]],
            ['success', [100, 50, 100, 50, 300]],
            ['warning', [150, 75, 150, 75, 150]],
            ['notification', [80, 40, 80]]
        ]);
        
        // 音響代替パターン
        this.audioAlternatives = new Map([
            ['flash', { type: 'tone', frequency: 800, duration: 200 }],
            ['shake', { type: 'sweep', startFreq: 200, endFreq: 400, duration: 300 }],
            ['glow', { type: 'chord', frequencies: [440, 554, 659], duration: 500 }],
            ['particle-burst', { type: 'noise', filterType: 'highpass', duration: 150 }]
        ]);
        
        // 視覚代替パターン
        this.visualAlternatives = new Map([
            ['sound-effect', { type: 'border-flash', color: '#00FF00', duration: 200 }],
            ['background-music', { type: 'corner-indicator', position: 'top-left', size: 20 }],
            ['ambient-sound', { type: 'breathing-circle', center: { x: 50, y: 50 }, radius: 30 }]
        ]);
        
        console.log('AlternativeFeedbackManager initialized');
    }
    
    /**
     * 初期化
     */
    async initialize() {
        try {
            // デバイス機能の検出
            await this.detectDeviceCapabilities();
            
            // アクセシビリティ設定の取得
            if (this.accessibilityManager) {
                this.config = this.accessibilityManager.getConfiguration();
                await this.applyConfiguration();
            }
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            console.log('AlternativeFeedbackManager initialized successfully');
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_ERROR', {
                operation: 'initialize',
                component: 'AlternativeFeedbackManager'
            });
            return false;
        }
    }
    
    /**
     * デバイス機能の検出
     */
    async detectDeviceCapabilities() {
        // 触覚フィードバック対応の検出
        this.state.deviceSupportsVibration = !!(navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate);
        
        // Web Audio API対応の検出
        this.state.audioContextSupported = !!(window.AudioContext || window.webkitAudioContext);
        
        // Speech Synthesis API対応の検出
        this.state.speechSynthesisSupported = !!window.speechSynthesis;
        
        console.log('Device capabilities detected:', {
            vibration: this.state.deviceSupportsVibration,
            audioContext: this.state.audioContextSupported,
            speechSynthesis: this.state.speechSynthesisSupported
        });
    }
    
    /**
     * 触覚フィードバックの実行
     */
    triggerHapticFeedback(patternName, intensity = 1.0) {
        if (!this.state.hapticEnabled || !this.state.deviceSupportsVibration) {
            return false;
        }
        
        const pattern = this.hapticPatterns.get(patternName);
        if (!pattern) {
            console.warn(`Unknown haptic pattern: ${patternName}`);
            return false;
        }
        
        try {
            // 強度を適用
            const adjustedPattern = pattern.map(duration => Math.round(duration * intensity));
            
            // 振動を実行
            if (navigator.vibrate) {
                navigator.vibrate(adjustedPattern);
            } else if (navigator.webkitVibrate) {
                navigator.webkitVibrate(adjustedPattern);
            } else if (navigator.mozVibrate) {
                navigator.mozVibrate(adjustedPattern);
            }
            
            console.log(`Haptic feedback triggered: ${patternName} with intensity ${intensity}`);
            return true;
        } catch (error) {
            console.warn('Failed to trigger haptic feedback:', error);
            return false;
        }
    }
    
    /**
     * 音響代替フィードバックの実行
     */
    async triggerAudioAlternative(visualEffectType, options = {}) {
        if (!this.state.audioAlternativesEnabled || !this.state.audioContextSupported) {
            return false;
        }
        
        const alternative = this.audioAlternatives.get(visualEffectType);
        if (!alternative) {
            console.warn(`No audio alternative for visual effect: ${visualEffectType}`);
            return false;
        }
        
        try {
            await this.playAudioAlternative(alternative, options);
            console.log(`Audio alternative played for: ${visualEffectType}`);
            return true;
        } catch (error) {
            console.warn('Failed to play audio alternative:', error);
            return false;
        }
    }
    
    /**
     * 音響代替の再生
     */
    async playAudioAlternative(alternative, options = {}) {
        // AudioManagerが利用可能な場合は連携
        if (this.audioManager && this.audioManager.playTone) {
            return this.playViaAudioManager(alternative, options);
        }
        
        // Web Audio APIを直接使用
        return this.playViaWebAudio(alternative, options);
    }
    
    /**
     * AudioManager経由での音響代替再生
     */
    async playViaAudioManager(alternative, options) {
        const { type, frequency, frequencies, duration } = alternative;
        const volume = options.volume || 0.5;
        
        switch (type) {
            case 'tone':
                return this.audioManager.playTone(frequency, duration, volume);
                
            case 'chord':
                // 複数の音を同時に再生
                const promises = frequencies.map(freq => 
                    this.audioManager.playTone(freq, duration, volume * 0.7)
                );
                return Promise.all(promises);
                
            case 'sweep':
                // 周波数スイープ（AudioManagerで対応していない場合はWeb Audio APIを使用）
                return this.playFrequencySweep(alternative.startFreq, alternative.endFreq, duration, volume);
                
            default:
                console.warn(`Unknown audio alternative type: ${type}`);
                return false;
        }
    }
    
    /**
     * Web Audio API経由での音響代替再生
     */
    async playViaWebAudio(alternative, options) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const { type, frequency, frequencies, duration, filterType } = alternative;
        const volume = options.volume || 0.5;
        
        const gainNode = this.audioContext.createGain();
        gainNode.connect(this.audioContext.destination);
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        switch (type) {
            case 'tone':
                return this.playTone(frequency, duration, gainNode);
                
            case 'chord':
                const promises = frequencies.map(freq => 
                    this.playTone(freq, duration, gainNode)
                );
                return Promise.all(promises);
                
            case 'sweep':
                return this.playFrequencySweep(alternative.startFreq, alternative.endFreq, duration, volume);
                
            case 'noise':
                return this.playNoise(duration, filterType, gainNode);
                
            default:
                console.warn(`Unknown audio alternative type: ${type}`);
                return false;
        }
    }
    
    /**
     * トーンの再生
     */
    playTone(frequency, duration, gainNode) {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.connect(gainNode);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
        
        return new Promise(resolve => {
            oscillator.onended = resolve;
        });
    }
    
    /**
     * 周波数スイープの再生
     */
    playFrequencySweep(startFreq, endFreq, duration, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration / 1000);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
        
        return new Promise(resolve => {
            oscillator.onended = resolve;
        });
    }
    
    /**
     * ノイズの再生
     */
    playNoise(duration, filterType, gainNode) {
        const bufferSize = this.audioContext.sampleRate * duration / 1000;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // ホワイトノイズ生成
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // フィルター適用
        if (filterType) {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = filterType;
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            
            source.connect(filter);
            filter.connect(gainNode);
        } else {
            source.connect(gainNode);
        }
        
        source.start(this.audioContext.currentTime);
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }
    
    /**
     * 視覚代替フィードバックの実行
     */
    triggerVisualAlternative(audioEffectType, canvasContext, options = {}) {
        if (!this.state.visualAlternativesEnabled || !canvasContext) {
            return false;
        }
        
        const alternative = this.visualAlternatives.get(audioEffectType);
        if (!alternative) {
            console.warn(`No visual alternative for audio effect: ${audioEffectType}`);
            return false;
        }
        
        try {
            this.renderVisualAlternative(canvasContext, alternative, options);
            console.log(`Visual alternative rendered for: ${audioEffectType}`);
            return true;
        } catch (error) {
            console.warn('Failed to render visual alternative:', error);
            return false;
        }
    }
    
    /**
     * 視覚代替の描画
     */
    renderVisualAlternative(context, alternative, options) {
        const { type, color, duration, position, size, center, radius } = alternative;
        
        context.save();
        
        switch (type) {
            case 'border-flash':
                this.renderBorderFlash(context, color, duration);
                break;
                
            case 'corner-indicator':
                this.renderCornerIndicator(context, position, size, color);
                break;
                
            case 'breathing-circle':
                this.renderBreathingCircle(context, center, radius, color);
                break;
                
            default:
                console.warn(`Unknown visual alternative type: ${type}`);
        }
        
        context.restore();
    }
    
    /**
     * ボーダーフラッシュの描画
     */
    renderBorderFlash(context, color, duration) {
        const canvas = context.canvas;
        const borderWidth = 5;
        
        // アニメーション強度を時間に基づいて計算
        const intensity = 0.3 + 0.7 * Math.sin(Date.now() * 0.01);
        
        context.strokeStyle = color;
        context.lineWidth = borderWidth;
        context.globalAlpha = intensity;
        
        context.strokeRect(0, 0, canvas.width, canvas.height);
        
        // 指定時間後にフラッシュを停止
        setTimeout(() => {
            context.clearRect(0, 0, borderWidth, canvas.height); // 左
            context.clearRect(canvas.width - borderWidth, 0, borderWidth, canvas.height); // 右
            context.clearRect(0, 0, canvas.width, borderWidth); // 上
            context.clearRect(0, canvas.height - borderWidth, canvas.width, borderWidth); // 下
        }, duration);
    }
    
    /**
     * コーナーインジケーターの描画
     */
    renderCornerIndicator(context, position, size, color) {
        const canvas = context.canvas;
        let x, y;
        
        switch (position) {
            case 'top-left':
                x = size / 2;
                y = size / 2;
                break;
            case 'top-right':
                x = canvas.width - size / 2;
                y = size / 2;
                break;
            case 'bottom-left':
                x = size / 2;
                y = canvas.height - size / 2;
                break;
            case 'bottom-right':
                x = canvas.width - size / 2;
                y = canvas.height - size / 2;
                break;
            default:
                x = size / 2;
                y = size / 2;
        }
        
        context.fillStyle = color || '#FFD700';
        context.beginPath();
        context.arc(x, y, size / 2, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * 呼吸する円の描画
     */
    renderBreathingCircle(context, center, radius, color) {
        const canvas = context.canvas;
        const x = center ? center.x * canvas.width / 100 : canvas.width / 2;
        const y = center ? center.y * canvas.height / 100 : canvas.height / 2;
        
        // 呼吸のようなアニメーション
        const breathingScale = 0.8 + 0.4 * Math.sin(Date.now() * 0.003);
        const adjustedRadius = radius * breathingScale;
        
        context.fillStyle = color || '#00BFFF';
        context.globalAlpha = 0.6;
        context.beginPath();
        context.arc(x, y, adjustedRadius, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * 音声合成による説明の提供
     */
    announceVisualEffect(effectDescription, options = {}) {
        if (!this.state.speechSynthesisSupported || !this.config?.screenReader?.enabled) {
            return false;
        }
        
        try {
            const utterance = new SpeechSynthesisUtterance(effectDescription);
            utterance.rate = options.rate || this.config.screenReader.speechRate || 1.0;
            utterance.volume = options.volume || 0.8;
            utterance.pitch = options.pitch || 1.0;
            
            if (options.language) {
                utterance.lang = options.language;
            }
            
            window.speechSynthesis.speak(utterance);
            console.log(`Announced: ${effectDescription}`);
            return true;
        } catch (error) {
            console.warn('Failed to announce visual effect:', error);
            return false;
        }
    }
    
    /**
     * 統合フィードバックの提供
     */
    provideIntegratedFeedback(effectType, visualEffect, options = {}) {
        const feedbacks = [];
        
        // 触覚フィードバック
        if (this.state.hapticEnabled) {
            const hapticResult = this.triggerHapticFeedback(effectType, options.hapticIntensity);
            feedbacks.push({ type: 'haptic', success: hapticResult });
        }
        
        // 音響代替
        if (this.state.audioAlternativesEnabled) {
            this.triggerAudioAlternative(effectType, options).then(result => {
                feedbacks.push({ type: 'audio', success: result });
            });
        }
        
        // 視覚代替（音響効果の場合）
        if (this.state.visualAlternativesEnabled && options.canvasContext) {
            const visualResult = this.triggerVisualAlternative(effectType, options.canvasContext, options);
            feedbacks.push({ type: 'visual', success: visualResult });
        }
        
        // 音声説明
        if (options.description) {
            const speechResult = this.announceVisualEffect(options.description, options);
            feedbacks.push({ type: 'speech', success: speechResult });
        }
        
        return feedbacks;
    }
    
    /**
     * 設定の適用
     */
    async applyConfiguration() {
        if (!this.config) return;
        
        // 触覚フィードバック設定
        this.state.hapticEnabled = this.config.audio?.vibration?.enabled || false;
        
        // 音響代替設定
        this.state.audioAlternativesEnabled = this.config.audio?.visualFeedback?.enabled || false;
        
        // 視覚代替設定（聴覚障害者向け）
        this.state.visualAlternativesEnabled = this.config.audio?.captions?.enabled || false;
        
        console.log('Alternative feedback configuration applied:', this.state);
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        if (this.accessibilityManager) {
            this.accessibilityManager.addEventListener('configurationApplied', (event) => {
                this.config = event.config;
                this.applyConfiguration();
            });
        }
    }
    
    /**
     * カスタムパターンの追加
     */
    addHapticPattern(name, pattern) {
        this.hapticPatterns.set(name, pattern);
        console.log(`Custom haptic pattern added: ${name}`);
    }
    
    addAudioAlternative(visualEffect, audioConfig) {
        this.audioAlternatives.set(visualEffect, audioConfig);
        console.log(`Custom audio alternative added for: ${visualEffect}`);
    }
    
    addVisualAlternative(audioEffect, visualConfig) {
        this.visualAlternatives.set(audioEffect, visualConfig);
        console.log(`Custom visual alternative added for: ${audioEffect}`);
    }
    
    /**
     * レポート生成
     */
    generateReport() {
        return {
            component: 'AlternativeFeedbackManager',
            state: { ...this.state },
            deviceCapabilities: {
                vibration: this.state.deviceSupportsVibration,
                audioContext: this.state.audioContextSupported,
                speechSynthesis: this.state.speechSynthesisSupported
            },
            patterns: {
                hapticPatterns: this.hapticPatterns.size,
                audioAlternatives: this.audioAlternatives.size,
                visualAlternatives: this.visualAlternatives.size
            },
            features: {
                hapticFeedback: this.state.hapticEnabled,
                audioAlternatives: this.state.audioAlternativesEnabled,
                visualAlternatives: this.state.visualAlternativesEnabled,
                speechAnnouncements: this.state.speechSynthesisSupported
            }
        };
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying AlternativeFeedbackManager...');
        
        // AudioContextのクリーンアップ
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        // 音声合成の停止
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        
        // 参照のクリア
        this.accessibilityManager = null;
        this.audioManager = null;
        this.config = null;
        
        console.log('AlternativeFeedbackManager destroyed');
    }
}