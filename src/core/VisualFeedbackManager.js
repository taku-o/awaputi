import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * 視覚フィードバック管理クラス
 * 聴覚情報の視覚的表現とカスタマイズ可能なフィードバックパターン
 */
export class VisualFeedbackManager {
    constructor(audioAccessibilityManager) {
        this.audioAccessibilityManager = audioAccessibilityManager;
        this.accessibilityManager = audioAccessibilityManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager?.gameEngine;
        
        // 視覚フィードバック設定
        this.config = {
            enabled: false,
            globalIntensity: 1.0,
            feedbackTypes: {
                flash: { enabled: true, intensity: 1.0, duration: 300 },
                glow: { enabled: true, intensity: 0.8, duration: 500 },
                pulse: { enabled: true, intensity: 0.9, duration: 800 },
                ripple: { enabled: true, intensity: 0.7, duration: 1000 },
                shake: { enabled: true, intensity: 0.6, duration: 200 },
                color: { enabled: true, intensity: 1.0, duration: 400 },
                border: { enabled: true, intensity: 0.8, duration: 350 },
                scale: { enabled: true, intensity: 0.5, duration: 600 }
            },
            audioMapping: {
                frequency: {
                    low: { range: [20, 250], color: '#ff6b6b', pattern: 'pulse' },
                    midLow: { range: [250, 500], color: '#4ecdc4', pattern: 'glow' },
                    mid: { range: [500, 2000], color: '#45b7d1', pattern: 'flash' },
                    midHigh: { range: [2000, 4000], color: '#96ceb4', pattern: 'ripple' },
                    high: { range: [4000, 8000], color: '#ffeaa7', pattern: 'shake' },
                    veryHigh: { range: [8000, 20000], color: '#dda0dd', pattern: 'scale' }
                },
                volume: {
                    quiet: { range: [0, 0.3], intensity: 0.3 },
                    normal: { range: [0.3, 0.7], intensity: 0.7 },
                    loud: { range: [0.7, 1.0], intensity: 1.0 }
                },
                gameEvents: new Map([
                    ['bubblePop', { color: '#4ecdc4', pattern: 'flash', intensity: 0.8 }],
                    ['combo', { color: '#ffd93d', pattern: 'pulse', intensity: 1.0 }],
                    ['bonus', { color: '#6c5ce7', pattern: 'glow', intensity: 0.9 }],
                    ['damage', { color: '#ff6b6b', pattern: 'shake', intensity: 1.0 }],
                    ['powerUp', { color: '#00cec9', pattern: 'ripple', intensity: 0.8 }],
                    ['gameOver', { color: '#fd79a8', pattern: 'flash', intensity: 1.0 }],
                    ['levelUp', { color: '#fdcb6e', pattern: 'scale', intensity: 0.9 }],
                    ['warning', { color: '#e17055', pattern: 'border', intensity: 0.7 }]
                ])
            },
            positioning: {
                screenEdges: true,
                gameArea: true,
                uiElements: true,
                fullScreen: false
            },
            performance: {
                maxConcurrentEffects: 10,
                reducedMotion: false,
                gpuAcceleration: true
            }
        };
        
        // 視覚効果管理
        this.activeEffects = new Map();
        this.effectQueue = [];
        this.feedbackElements = new Map();
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        
        // Canvas とコンテキスト
        this.visualCanvas = null;
        this.canvasContext = null;
        this.animationFrameId = null;
        
        // エフェクトパターン
        this.effectPatterns = new Map([
            ['flash', this.createFlashEffect.bind(this)],
            ['glow', this.createGlowEffect.bind(this)],
            ['pulse', this.createPulseEffect.bind(this)],
            ['ripple', this.createRippleEffect.bind(this)],
            ['shake', this.createShakeEffect.bind(this)],
            ['color', this.createColorEffect.bind(this)],
            ['border', this.createBorderEffect.bind(this)],
            ['scale', this.createScaleEffect.bind(this)]
        ]);
        
        // 統計情報
        this.stats = {
            effectsTriggered: 0,
            effectsByType: new Map(),
            effectsByEvent: new Map(),
            averageIntensity: 0,
            totalDuration: 0,
            sessionStart: Date.now()
        };
        
        // ユーザー設定
        this.userPreferences = {
            enabled: false,
            globalIntensity: 0.8,
            preferredPatterns: ['flash', 'glow', 'pulse'],
            colorPreferences: new Map(),
            reducedMotion: false,
            audioVisualization: true,
            gameEventFeedback: true,
            customMappings: new Map()
        };
        
        console.log('VisualFeedbackManager initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // ユーザー設定の読み込み
            this.loadUserPreferences();
            
            // 視覚フィードバック要素の作成
            this.createFeedbackElements();
            
            // オーディオ分析の設定
            this.setupAudioAnalysis();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            console.log('VisualFeedbackManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'VISUAL_FEEDBACK_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * ユーザー設定の読み込み
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('visualFeedback_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.userPreferences, preferences);
                
                // Map の復元
                if (preferences.colorPreferences) {
                    this.userPreferences.colorPreferences = new Map(preferences.colorPreferences);
                }
                if (preferences.customMappings) {
                    this.userPreferences.customMappings = new Map(preferences.customMappings);
                }
                
                // 設定を適用
                this.config.enabled = this.userPreferences.enabled;
                this.config.globalIntensity = this.userPreferences.globalIntensity;
            }
        } catch (error) {
            console.warn('Failed to load visual feedback preferences:', error);
        }
    }
    
    /**
     * ユーザー設定の保存
     */
    saveUserPreferences() {
        try {
            const preferences = {
                ...this.userPreferences,
                colorPreferences: Array.from(this.userPreferences.colorPreferences.entries()),
                customMappings: Array.from(this.userPreferences.customMappings.entries())
            };
            
            localStorage.setItem('visualFeedback_preferences', 
                JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save visual feedback preferences:', error);
        }
    }
    
    /**
     * フィードバック要素の作成
     */
    createFeedbackElements() {
        // メインフィードバックコンテナ
        this.feedbackContainer = document.createElement('div');
        this.feedbackContainer.id = 'visual-feedback-container';
        this.feedbackContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
        `;
        document.body.appendChild(this.feedbackContainer);
        
        // 画面端フィードバック要素
        if (this.config.positioning.screenEdges) {
            this.createEdgeFeedbackElements();
        }
        
        // ゲームエリアフィードバック
        if (this.config.positioning.gameArea) {
            this.createGameAreaFeedback();
        }
        
        // オーディオ視覚化キャンバス
        if (this.userPreferences.audioVisualization) {
            this.createVisualizationCanvas();
        }
        
        console.log('Feedback elements created');
    }
    
    /**
     * 画面端フィードバック要素の作成
     */
    createEdgeFeedbackElements() {
        const edges = ['top', 'bottom', 'left', 'right'];
        
        edges.forEach(edge => {
            const element = document.createElement('div');
            element.className = `feedback-edge feedback-edge-${edge}`;
            element.style.cssText = this.getEdgeStyles(edge);
            
            this.feedbackContainer.appendChild(element);
            this.feedbackElements.set(`edge-${edge}`, element);
        });
    }
    
    /**
     * エッジスタイルの取得
     */
    getEdgeStyles(edge) {
        const baseStyles = `
            position: absolute;
            background: transparent;
            opacity: 0;
            transition: opacity 0.1s ease;
        `;
        
        switch (edge) {
            case 'top':
                return baseStyles + `
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 5px;
                `;
            case 'bottom':
                return baseStyles + `
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 5px;
                `;
            case 'left':
                return baseStyles + `
                    top: 0;
                    left: 0;
                    bottom: 0;
                    width: 5px;
                `;
            case 'right':
                return baseStyles + `
                    top: 0;
                    right: 0;
                    bottom: 0;
                    width: 5px;
                `;
        }
    }
    
    /**
     * ゲームエリアフィードバックの作成
     */
    createGameAreaFeedback() {
        const gameCanvas = document.querySelector('#game-canvas, canvas.game-canvas');
        if (!gameCanvas) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'feedback-game-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            opacity: 0;
            border-radius: 8px;
            transition: all 0.2s ease;
        `;
        
        // ゲームキャンバスの親要素に追加
        const gameContainer = gameCanvas.parentElement;
        if (gameContainer.style.position !== 'relative') {
            gameContainer.style.position = 'relative';
        }
        gameContainer.appendChild(overlay);
        
        this.feedbackElements.set('game-area', overlay);
    }
    
    /**
     * 視覚化キャンバスの作成
     */
    createVisualizationCanvas() {
        this.visualCanvas = document.createElement('canvas');
        this.visualCanvas.id = 'audio-visualization-canvas';
        this.visualCanvas.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 200px;
            height: 100px;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 8px;
            opacity: 0.8;
            z-index: 10000;
        `;
        
        this.visualCanvas.width = 200;
        this.visualCanvas.height = 100;
        this.canvasContext = this.visualCanvas.getContext('2d');
        
        document.body.appendChild(this.visualCanvas);
    }
    
    /**
     * オーディオ分析の設定
     */
    setupAudioAnalysis() {
        try {
            // Web Audio API の初期化
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            
            this.analyser.fftSize = 256;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            // ゲームオーディオとの接続
            this.connectToGameAudio();
            
        } catch (error) {
            console.warn('Audio analysis setup failed:', error);
        }
    }
    
    /**
     * ゲームオーディオとの接続
     */
    connectToGameAudio() {
        // AudioManager が存在する場合は接続
        if (this.gameEngine?.audioManager) {
            const audioManager = this.gameEngine.audioManager;
            
            // AudioManager からオーディオソースを取得
            if (audioManager.audioContext) {
                try {
                    // 既存のオーディオノードに接続
                    audioManager.audioContext.destination.connect?.(this.analyser);
                    this.analyser.connect(this.audioContext.destination);
                } catch (error) {
                    console.warn('Failed to connect to game audio:', error);
                }
            }
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ゲームイベントの監視
        if (this.gameEngine) {
            // バブルポップ
            this.gameEngine.addEventListener?.('bubblePopped', (event) => {
                this.triggerGameEventFeedback('bubblePop', event);
            });
            
            // コンボ
            this.gameEngine.addEventListener?.('comboAchieved', (event) => {
                this.triggerGameEventFeedback('combo', event);
            });
            
            // ボーナス
            this.gameEngine.addEventListener?.('bonusTriggered', (event) => {
                this.triggerGameEventFeedback('bonus', event);
            });
            
            // ダメージ
            this.gameEngine.addEventListener?.('playerDamaged', (event) => {
                this.triggerGameEventFeedback('damage', event);
            });
            
            // パワーアップ
            this.gameEngine.addEventListener?.('powerUpCollected', (event) => {
                this.triggerGameEventFeedback('powerUp', event);
            });
            
            // ゲームオーバー
            this.gameEngine.addEventListener?.('gameOver', (event) => {
                this.triggerGameEventFeedback('gameOver', event);
            });
            
            // レベルアップ
            this.gameEngine.addEventListener?.('levelUp', (event) => {
                this.triggerGameEventFeedback('levelUp', event);
            });
            
            // 警告
            this.gameEngine.addEventListener?.('warning', (event) => {
                this.triggerGameEventFeedback('warning', event);
            });
        }
        
        // オーディオ分析の開始
        if (this.userPreferences.audioVisualization) {
            this.startAudioVisualization();
        }
    }
    
    /**
     * ゲームイベントフィードバックのトリガー
     */
    triggerGameEventFeedback(eventType, eventData) {
        if (!this.config.enabled || !this.userPreferences.gameEventFeedback) {
            return;
        }
        
        const mapping = this.config.audioMapping.gameEvents.get(eventType);
        if (!mapping) {
            console.warn(`No feedback mapping for event: ${eventType}`);
            return;
        }
        
        // カスタムマッピングの確認
        const customMapping = this.userPreferences.customMappings.get(eventType);
        const finalMapping = customMapping || mapping;
        
        this.triggerVisualFeedback({
            type: finalMapping.pattern,
            color: finalMapping.color,
            intensity: finalMapping.intensity * this.config.globalIntensity,
            duration: this.config.feedbackTypes[finalMapping.pattern]?.duration || 500,
            target: this.selectFeedbackTarget(eventType, eventData),
            eventData
        });
        
        // 統計更新
        this.updateEventStats(eventType);
    }
    
    /**
     * フィードバックターゲットの選択
     */
    selectFeedbackTarget(eventType, eventData) {
        // イベントタイプに基づいてターゲットを決定
        switch (eventType) {
            case 'bubblePop':
                return eventData.bubble || this.feedbackElements.get('game-area');
            case 'damage':
                return this.feedbackElements.get('edge-top');
            case 'combo':
            case 'bonus':
                return this.feedbackElements.get('game-area');
            case 'gameOver':
                return this.feedbackContainer;
            default:
                return this.feedbackElements.get('game-area');
        }
    }
    
    /**
     * 視覚フィードバックのトリガー
     */
    triggerVisualFeedback(options) {
        const {
            type = 'flash',
            color = '#ffffff',
            intensity = 1.0,
            duration = 300,
            target = this.feedbackContainer,
            eventData = null
        } = options;
        
        // 同時エフェクト数の制限
        if (this.activeEffects.size >= this.config.performance.maxConcurrentEffects) {
            this.effectQueue.push(options);
            return;
        }
        
        // エフェクトパターンの実行
        const patternFunction = this.effectPatterns.get(type);
        if (!patternFunction) {
            console.warn(`Unknown effect pattern: ${type}`);
            return;
        }
        
        const effectId = this.generateEffectId();
        const effect = patternFunction({
            id: effectId,
            target,
            color,
            intensity: intensity * this.userPreferences.globalIntensity,
            duration,
            eventData
        });
        
        if (effect) {
            this.activeEffects.set(effectId, effect);
            
            // エフェクト終了時の処理
            setTimeout(() => {
                this.cleanupEffect(effectId);
                this.processEffectQueue();
            }, duration);
            
            this.stats.effectsTriggered++;
            this.updateTypeStats(type);
        }
    }
    
    /**
     * エフェクトIDの生成
     */
    generateEffectId() {
        return `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * フラッシュエフェクトの作成
     */
    createFlashEffect({ id, target, color, intensity, duration }) {
        const originalBackground = target.style.background;
        const flashIntensity = Math.min(intensity, 1.0);
        
        target.style.background = color;
        target.style.opacity = flashIntensity.toString();
        
        // アニメーション
        target.animate([
            { opacity: flashIntensity },
            { opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-out',
            fill: 'forwards'
        }).addEventListener('finish', () => {
            target.style.background = originalBackground;
            target.style.opacity = '0';
        });
        
        return { id, target, type: 'flash', cleanup: null };
    }
    
    /**
     * グローエフェクトの作成
     */
    createGlowEffect({ id, target, color, intensity, duration }) {
        const glowSize = 10 * intensity;
        const originalBoxShadow = target.style.boxShadow;
        
        target.style.boxShadow = `0 0 ${glowSize}px ${color}`;
        target.style.opacity = '0.8';
        
        const animation = target.animate([
            { boxShadow: `0 0 ${glowSize}px ${color}`, opacity: 0.8 },
            { boxShadow: `0 0 0px ${color}`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-out',
            fill: 'forwards'
        });
        
        animation.addEventListener('finish', () => {
            target.style.boxShadow = originalBoxShadow;
            target.style.opacity = '0';
        });
        
        return { id, target, type: 'glow', cleanup: null };
    }
    
    /**
     * パルスエフェクトの作成
     */
    createPulseEffect({ id, target, color, intensity, duration }) {
        const originalBackground = target.style.background;
        const pulseIntensity = 0.3 + (intensity * 0.7);
        
        target.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
        
        const animation = target.animate([
            { opacity: 0, transform: 'scale(0.8)' },
            { opacity: pulseIntensity, transform: 'scale(1.1)' },
            { opacity: 0, transform: 'scale(1.3)' }
        ], {
            duration: duration,
            easing: 'ease-out',
            iterations: Math.ceil(duration / 400)
        });
        
        animation.addEventListener('finish', () => {
            target.style.background = originalBackground;
            target.style.opacity = '0';
            target.style.transform = '';
        });
        
        return { id, target, type: 'pulse', cleanup: null };
    }
    
    /**
     * リップルエフェクトの作成
     */
    createRippleEffect({ id, target, color, intensity, duration }) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            border: 2px solid ${color};
            border-radius: 50%;
            width: 20px;
            height: 20px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: ${intensity};
            pointer-events: none;
        `;
        
        target.appendChild(ripple);
        
        const animation = ripple.animate([
            { width: '20px', height: '20px', opacity: intensity },
            { width: '200px', height: '200px', opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-out'
        });
        
        animation.addEventListener('finish', () => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        });
        
        return { id, target, type: 'ripple', cleanup: () => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }};
    }
    
    /**
     * シェイクエフェクトの作成
     */
    createShakeEffect({ id, target, color, intensity, duration }) {
        const shakeDistance = 5 * intensity;
        const originalTransform = target.style.transform;
        
        target.style.background = color;
        target.style.opacity = '0.6';
        
        const keyframes = [];
        const steps = Math.floor(duration / 50);
        
        for (let i = 0; i <= steps; i++) {
            const x = (Math.random() - 0.5) * shakeDistance * 2;
            const y = (Math.random() - 0.5) * shakeDistance * 2;
            keyframes.push({
                transform: `translate(${x}px, ${y}px)`,
                opacity: 0.6 * (1 - i / steps)
            });
        }
        
        const animation = target.animate(keyframes, {
            duration: duration,
            easing: 'ease-out'
        });
        
        animation.addEventListener('finish', () => {
            target.style.transform = originalTransform;
            target.style.background = '';
            target.style.opacity = '0';
        });
        
        return { id, target, type: 'shake', cleanup: null };
    }
    
    /**
     * カラーエフェクトの作成
     */
    createColorEffect({ id, target, color, intensity, duration }) {
        const originalBackground = target.style.background;
        
        target.animate([
            { backgroundColor: 'transparent' },
            { backgroundColor: color },
            { backgroundColor: 'transparent' }
        ], {
            duration: duration,
            easing: 'ease-in-out'
        }).addEventListener('finish', () => {
            target.style.background = originalBackground;
        });
        
        return { id, target, type: 'color', cleanup: null };
    }
    
    /**
     * ボーダーエフェクトの作成
     */
    createBorderEffect({ id, target, color, intensity, duration }) {
        const borderWidth = Math.max(1, 3 * intensity);
        const originalBorder = target.style.border;
        
        target.style.border = `${borderWidth}px solid ${color}`;
        target.style.opacity = '1';
        
        target.animate([
            { borderWidth: `${borderWidth}px`, opacity: 1 },
            { borderWidth: '0px', opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-out'
        }).addEventListener('finish', () => {
            target.style.border = originalBorder;
            target.style.opacity = '0';
        });
        
        return { id, target, type: 'border', cleanup: null };
    }
    
    /**
     * スケールエフェクトの作成
     */
    createScaleEffect({ id, target, color, intensity, duration }) {
        const scaleAmount = 1 + (intensity * 0.3);
        const originalTransform = target.style.transform;
        
        target.style.background = color;
        target.style.opacity = '0.5';
        
        target.animate([
            { transform: 'scale(1)', opacity: 0 },
            { transform: `scale(${scaleAmount})`, opacity: 0.5 },
            { transform: 'scale(1)', opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-in-out'
        }).addEventListener('finish', () => {
            target.style.transform = originalTransform;
            target.style.background = '';
            target.style.opacity = '0';
        });
        
        return { id, target, type: 'scale', cleanup: null };
    }
    
    /**
     * オーディオ視覚化の開始
     */
    startAudioVisualization() {
        if (!this.analyser || !this.canvasContext) return;
        
        const drawVisualization = () => {
            if (!this.config.enabled || !this.userPreferences.audioVisualization) {
                this.animationFrameId = requestAnimationFrame(drawVisualization);
                return;
            }
            
            this.analyser.getByteFrequencyData(this.dataArray);
            
            const canvas = this.visualCanvas;
            const ctx = this.canvasContext;
            const width = canvas.width;
            const height = canvas.height;
            
            // クリア
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, width, height);
            
            // 周波数データの描画
            const barWidth = width / this.dataArray.length;
            let x = 0;
            
            for (let i = 0; i < this.dataArray.length; i++) {
                const barHeight = (this.dataArray[i] / 255) * height * 0.8;
                
                // 周波数に基づく色の決定
                const frequency = (i / this.dataArray.length) * 20000; // 0-20kHz
                const color = this.getFrequencyColor(frequency);
                
                ctx.fillStyle = color;
                ctx.fillRect(x, height - barHeight, barWidth, barHeight);
                
                x += barWidth;
            }
            
            // 音量レベルの描画
            const avgVolume = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
            this.triggerVolumeBasedFeedback(avgVolume / 255);
            
            this.animationFrameId = requestAnimationFrame(drawVisualization);
        };
        
        drawVisualization();
    }
    
    /**
     * 周波数に基づく色の取得
     */
    getFrequencyColor(frequency) {
        const mapping = this.config.audioMapping.frequency;
        
        for (const [range, config] of Object.entries(mapping)) {
            if (frequency >= config.range[0] && frequency <= config.range[1]) {
                return config.color;
            }
        }
        
        return '#ffffff';
    }
    
    /**
     * 音量ベースフィードバックのトリガー
     */
    triggerVolumeBasedFeedback(volume) {
        const volumeMapping = this.config.audioMapping.volume;
        let volumeLevel = 'quiet';
        
        for (const [level, config] of Object.entries(volumeMapping)) {
            if (volume >= config.range[0] && volume <= config.range[1]) {
                volumeLevel = level;
                break;
            }
        }
        
        // 高音量時のエッジフィードバック
        if (volumeLevel === 'loud' && Math.random() < 0.1) { // 10%の確率
            this.triggerEdgeFeedback('#ff6b6b', volume);
        }
    }
    
    /**
     * エッジフィードバックのトリガー
     */
    triggerEdgeFeedback(color, intensity) {
        const edges = ['top', 'bottom', 'left', 'right'];
        const randomEdge = edges[Math.floor(Math.random() * edges.length)];
        const edgeElement = this.feedbackElements.get(`edge-${randomEdge}`);
        
        if (edgeElement) {
            this.triggerVisualFeedback({
                type: 'flash',
                color: color,
                intensity: intensity * 0.5,
                duration: 200,
                target: edgeElement
            });
        }
    }
    
    /**
     * エフェクトキューの処理
     */
    processEffectQueue() {
        if (this.effectQueue.length > 0 && 
            this.activeEffects.size < this.config.performance.maxConcurrentEffects) {
            const nextEffect = this.effectQueue.shift();
            this.triggerVisualFeedback(nextEffect);
        }
    }
    
    /**
     * エフェクトのクリーンアップ
     */
    cleanupEffect(effectId) {
        const effect = this.activeEffects.get(effectId);
        if (effect) {
            if (effect.cleanup && typeof effect.cleanup === 'function') {
                effect.cleanup();
            }
            this.activeEffects.delete(effectId);
        }
    }
    
    /**
     * 統計更新
     */
    updateEventStats(eventType) {
        const count = this.stats.effectsByEvent.get(eventType) || 0;
        this.stats.effectsByEvent.set(eventType, count + 1);
    }
    
    updateTypeStats(type) {
        const count = this.stats.effectsByType.get(type) || 0;
        this.stats.effectsByType.set(type, count + 1);
    }
    
    // パブリックAPI
    
    /**
     * 視覚フィードバックの有効化
     */
    enable() {
        this.config.enabled = true;
        this.userPreferences.enabled = true;
        
        // 視覚化の開始
        if (this.userPreferences.audioVisualization && !this.animationFrameId) {
            this.startAudioVisualization();
        }
        
        this.saveUserPreferences();
        console.log('Visual feedback enabled');
    }
    
    /**
     * 視覚フィードバックの無効化
     */
    disable() {
        this.config.enabled = false;
        this.userPreferences.enabled = false;
        
        // すべてのアクティブエフェクトをクリア
        for (const effectId of this.activeEffects.keys()) {
            this.cleanupEffect(effectId);
        }
        
        // 視覚化の停止
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        this.saveUserPreferences();
        console.log('Visual feedback disabled');
    }
    
    /**
     * グローバル強度の設定
     */
    setGlobalIntensity(intensity) {
        this.config.globalIntensity = Math.max(0, Math.min(2.0, intensity));
        this.userPreferences.globalIntensity = this.config.globalIntensity;
        
        this.saveUserPreferences();
        console.log(`Global intensity set to: ${this.config.globalIntensity}`);
    }
    
    /**
     * カスタムイベントマッピングの追加
     */
    addCustomEventMapping(eventType, mapping) {
        this.userPreferences.customMappings.set(eventType, mapping);
        this.saveUserPreferences();
        
        console.log(`Custom mapping added for ${eventType}:`, mapping);
    }
    
    /**
     * 手動フィードバックのトリガー
     */
    triggerManualFeedback(type, options = {}) {
        this.triggerVisualFeedback({
            type,
            color: options.color || '#ffffff',
            intensity: options.intensity || 1.0,
            duration: options.duration || 300,
            target: options.target || this.feedbackContainer
        });
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.visual?.feedback) {
            Object.assign(this.config, config.visual.feedback);
        }
        
        console.log('VisualFeedbackManager configuration applied');
    }
    
    /**
     * レポートの生成
     */
    generateReport() {
        const sessionDuration = Date.now() - this.stats.sessionStart;
        
        return {
            timestamp: new Date().toISOString(),
            configuration: {
                enabled: this.config.enabled,
                globalIntensity: this.config.globalIntensity,
                audioVisualization: this.userPreferences.audioVisualization
            },
            statistics: {
                ...this.stats,
                sessionDuration,
                effectsPerMinute: this.stats.effectsTriggered / (sessionDuration / 60000),
                activeEffects: this.activeEffects.size,
                queuedEffects: this.effectQueue.length
            },
            userPreferences: this.userPreferences,
            performance: {
                maxConcurrentEffects: this.config.performance.maxConcurrentEffects,
                averageActiveEffects: this.stats.effectsTriggered / (sessionDuration / 1000)
            }
        };
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        if (enabled) {
            this.enable();
        } else {
            this.disable();
        }
        
        console.log(`VisualFeedbackManager ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying VisualFeedbackManager...');
        
        // 視覚フィードバックを無効化
        this.disable();
        
        // フィードバック要素の削除
        if (this.feedbackContainer && this.feedbackContainer.parentNode) {
            this.feedbackContainer.parentNode.removeChild(this.feedbackContainer);
        }
        
        if (this.visualCanvas && this.visualCanvas.parentNode) {
            this.visualCanvas.parentNode.removeChild(this.visualCanvas);
        }
        
        // オーディオコンテキストのクリーンアップ
        if (this.audioContext) {
            this.audioContext.close?.();
        }
        
        // ユーザー設定の保存
        this.saveUserPreferences();
        
        // データのクリア
        this.activeEffects.clear();
        this.feedbackElements.clear();
        this.effectQueue.length = 0;
        this.effectPatterns.clear();
        
        console.log('VisualFeedbackManager destroyed');
    }
}