import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

/**
 * 音響視覚化クラス - 音響の視覚的表現（アクセシビリティ対応）
 */
export class AudioVisualizer {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        
        // AnalyserNode
        this.analyser = null;
        this.bufferLength = 1024;
        this.dataArray = null;
        this.frequencyData = null;
        this.timeDomainData = null;
        
        // Canvas要素
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        
        // 視覚化設定
        this.visualizationTypes = {
            frequencyBars: { enabled: true, label: '周波数バー' },
            waveform: { enabled: true, label: '波形' },
            spectrogram: { enabled: false, label: 'スペクトログラム' },
            volumeIndicator: { enabled: true, label: '音量インジケーター' },
            stereoScope: { enabled: false, label: 'ステレオスコープ' }
        };
        this.currentVisualization = 'frequencyBars';
        
        // アニメーション
        this.animationId = null;
        this.isRunning = false;
        
        // 色設定
        this.colorSchemes = {
            neon: {
                primary: '#00ffff',
                secondary: '#ff00ff',
                background: 'rgba(0, 0, 0, 0.1)',
                gradient: ['#00ffff', '#0080ff', '#8000ff', '#ff00ff']
            },
            fire: {
                primary: '#ff4400',
                secondary: '#ffff00',
                background: 'rgba(0, 0, 0, 0.1)',
                gradient: ['#ff0000', '#ff4400', '#ff8800', '#ffff00']
            },
            ocean: {
                primary: '#0080ff',
                secondary: '#00ffff',
                background: 'rgba(0, 0, 50, 0.1)',
                gradient: ['#000080', '#0040ff', '#0080ff', '#00ffff']
            },
            nature: {
                primary: '#40ff40',
                secondary: '#80ff00',
                background: 'rgba(0, 50, 0, 0.1)',
                gradient: ['#008000', '#40ff40', '#80ff00', '#ffff40']
            }
        };
        this.currentColorScheme = 'neon';
        
        // 音響イベントの視覚表現
        this.audioEvents = [];
        this.eventHistory = [];
        this.maxEvents = 20;
        
        // パフォーマンス設定
        this.performanceMode = 'high'; // 'low', 'medium', 'high'
        this.targetFPS = 60;
        this.lastFrameTime = 0;
        
        // アクセシビリティ機能
        this.accessibilityMode = false;
        this.highContrast = false;
        this.motionReduction = false;
        this.textualDescription = false;
        
        // 初期化
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // AudioContextがない場合は無効化
            if (!this.audioManager.audioContext) {
                console.warn('AudioContext not available, AudioVisualizer disabled');
                return;
            }
            
            // AnalyserNodeを作成
            this.createAnalyser();
            
            // Canvas要素を作成
            this.createCanvas();
            
            // 設定を監視
            this.setupConfigWatchers();
            
            console.log('AudioVisualizer initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'AUDIO_VISUALIZER_ERROR', {
                component: 'AudioVisualizer',
                operation: 'initialize'
            });
        }
    }
    
    /**
     * AnalyserNodeを作成
     * @private
     */
    createAnalyser() {
        if (!this.audioManager.audioContext) return;
        
        this.analyser = this.audioManager.audioContext.createAnalyser();
        this.analyser.fftSize = this.bufferLength * 2;
        this.analyser.smoothingTimeConstant = 0.8;
        
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.frequencyData = new Uint8Array(this.bufferLength);
        this.timeDomainData = new Uint8Array(this.bufferLength);
        
        // マスター出力に接続
        if (this.audioManager.masterGainNode) {
            this.audioManager.masterGainNode.connect(this.analyser);
        }
    }
    
    /**
     * Canvas要素を作成
     * @private
     */
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'audio-visualizer-canvas';
        this.canvas.style.cssText = `
            display: none;
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            height: 200px;
            background-color: rgba(0, 0, 0, 0.8);
            border: 2px solid #00ffff;
            border-radius: 10px;
            z-index: 9999;
            pointer-events: none;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        this.updateCanvasSize();
        
        // Canvas要素にアクセシビリティ属性を追加
        this.canvas.setAttribute('role', 'img');
        this.canvas.setAttribute('aria-label', '音響視覚化表示');
        
        document.body.appendChild(this.canvas);
    }
    
    /**
     * Canvasサイズを更新
     * @private
     */
    updateCanvasSize() {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width * window.devicePixelRatio;
        this.height = rect.height * window.devicePixelRatio;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        if (this.ctx) {
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
    }
    
    /**
     * 設定監視を設定
     * @private
     */
    setupConfigWatchers() {
        // アクセシビリティ設定の監視
        this.configManager.watch('audio', 'accessibility.visualFeedback', (enabled) => {
            this.setEnabled(enabled);
        });
        
        this.configManager.watch('audio', 'accessibility.highContrast', (enabled) => {
            this.highContrast = enabled;
            this.updateColorScheme();
        });
        
        this.configManager.watch('audio', 'accessibility.motionReduction', (enabled) => {
            this.motionReduction = enabled;
            this.updateAnimationSettings();
        });
    }
    
    /**
     * 視覚化を有効/無効化
     * @param {boolean} enabled - 有効状態
     */
    setEnabled(enabled) {
        if (enabled && !this.isRunning) {
            this.start();
        } else if (!enabled && this.isRunning) {
            this.stop();
        }
    }
    
    /**
     * 視覚化を開始
     */
    start() {
        if (this.isRunning || !this.analyser) return;
        
        this.isRunning = true;
        this.canvas.style.display = 'block';
        this.updateCanvasSize();
        this.animate();
        
        console.log('AudioVisualizer started');
    }
    
    /**
     * 視覚化を停止
     */
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.canvas.style.display = 'none';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        console.log('AudioVisualizer stopped');
    }
    
    /**
     * アニメーションループ
     * @private
     */
    animate() {
        if (!this.isRunning) return;
        
        const now = performance.now();
        const deltaTime = now - this.lastFrameTime;
        
        // フレームレート制限
        const targetInterval = 1000 / this.targetFPS;
        if (deltaTime >= targetInterval) {
            this.update();
            this.render();
            this.lastFrameTime = now - (deltaTime % targetInterval);
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    /**
     * データを更新
     * @private
     */
    update() {
        if (!this.analyser) return;
        
        // 周波数データを取得
        this.analyser.getByteFrequencyData(this.frequencyData);
        
        // 時間領域データを取得
        this.analyser.getByteTimeDomainData(this.timeDomainData);
        
        // 音響イベントを更新
        this.updateAudioEvents();
    }
    
    /**
     * 描画
     * @private
     */
    render() {
        // 必要な要素の存在確認
        if (!this.ctx || !this.canvas) {
            console.warn('[AudioVisualizer] Canvas context not available for rendering');
            return;
        }
        
        if (!this.isRunning) {
            return;
        }
        
        try {
            // 背景をクリア
            this.clearCanvas();
            
            // 現在の視覚化タイプに応じて描画
            switch (this.currentVisualization) {
                case 'frequencyBars':
                    this.renderFrequencyBars();
                    break;
                case 'waveform':
                    this.renderWaveform();
                    break;
                case 'spectrogram':
                    this.renderSpectrogram();
                    break;
                case 'volumeIndicator':
                    this.renderVolumeIndicator();
                    break;
                case 'stereoScope':
                    this.renderStereoScope();
                    break;
            }
            
            // 音響イベントを描画
            this.renderAudioEvents();
            
            // アクセシビリティ情報を描画
            if (this.accessibilityMode) {
                this.renderAccessibilityInfo();
            }
        } catch (error) {
            console.error('[AudioVisualizer] Error during rendering:', error);
            // レンダリングエラーが発生してもシステムを停止しない
        }
    }
    
    /**
     * Canvasをクリア
     * @private
     */
    clearCanvas() {
        const colorScheme = this.colorSchemes[this.currentColorScheme];
        this.ctx.fillStyle = colorScheme.background;
        this.ctx.fillRect(0, 0, this.width / window.devicePixelRatio, this.height / window.devicePixelRatio);
    }
    
    /**
     * 周波数バーを描画
     * @private
     */
    renderFrequencyBars() {
        if (!this.frequencyData) return;
        
        const colorScheme = this.colorSchemes[this.currentColorScheme];
        const canvasWidth = this.width / window.devicePixelRatio;
        const canvasHeight = this.height / window.devicePixelRatio;
        
        const barWidth = canvasWidth / this.bufferLength * 2.5;
        let barHeight;
        let x = 0;
        
        // グラデーションを作成
        const gradient = this.ctx.createLinearGradient(0, 0, 0, canvasHeight);
        colorScheme.gradient.forEach((color, index) => {
            gradient.addColorStop(index / (colorScheme.gradient.length - 1), color);
        });
        
        for (let i = 0; i < this.bufferLength; i++) {
            barHeight = (this.frequencyData[i] / 255) * canvasHeight * 0.8;
            
            // 高コントラストモード
            if (this.highContrast) {
                this.ctx.fillStyle = barHeight > canvasHeight * 0.5 ? '#ffffff' : '#000000';
            } else {
                this.ctx.fillStyle = gradient;
            }
            
            this.ctx.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
    
    /**
     * 波形を描画
     * @private
     */
    renderWaveform() {
        if (!this.timeDomainData) return;
        
        const colorScheme = this.colorSchemes[this.currentColorScheme];
        const canvasWidth = this.width / window.devicePixelRatio;
        const canvasHeight = this.height / window.devicePixelRatio;
        
        this.ctx.lineWidth = this.highContrast ? 3 : 2;
        this.ctx.strokeStyle = this.highContrast ? '#ffffff' : colorScheme.primary;
        this.ctx.beginPath();
        
        const sliceWidth = canvasWidth / this.bufferLength;
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.timeDomainData[i] / 128.0;
            const y = v * canvasHeight / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.stroke();
    }
    
    /**
     * スペクトログラムを描画
     * @private
     */
    renderSpectrogram() {
        // 複雑な実装のため、基本的な実装のみ
        this.renderFrequencyBars();
        
        // オーバーレイとして時間軸情報を追加
        const canvasWidth = this.width / window.devicePixelRatio;
        const canvasHeight = this.height / window.devicePixelRatio;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(0, canvasHeight - 20, canvasWidth, 20);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('Spectrogram Mode', 10, canvasHeight - 5);
    }
    
    /**
     * 音量インジケーターを描画
     * @private
     */
    renderVolumeIndicator() {
        if (!this.frequencyData) return;
        
        const colorScheme = this.colorSchemes[this.currentColorScheme];
        const canvasWidth = this.width / window.devicePixelRatio;
        const canvasHeight = this.height / window.devicePixelRatio;
        
        // 全体の音量を計算
        let sum = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            sum += this.frequencyData[i];
        }
        const average = sum / this.bufferLength;
        const volume = average / 255;
        
        // 円形インジケーター
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const maxRadius = Math.min(canvasWidth, canvasHeight) / 3;
        const currentRadius = maxRadius * volume;
        
        // 外枠
        this.ctx.strokeStyle = this.highContrast ? '#ffffff' : colorScheme.primary;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, maxRadius, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        // 音量インジケーター
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, currentRadius);
        if (this.highContrast) {
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
        } else {
            colorScheme.gradient.forEach((color, index) => {
                gradient.addColorStop(index / (colorScheme.gradient.length - 1), color.replace(')', ', 0.6)').replace('#', 'rgba(').replace('#', ''));
            });
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, currentRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 音量レベルテキスト
        this.ctx.fillStyle = this.highContrast ? '#000000' : '#ffffff';
        this.ctx.font = 'bold 16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${Math.round(volume * 100)}%`, centerX, centerY + 5);
    }
    
    /**
     * ステレオスコープを描画
     * @private
     */
    renderStereoScope() {
        // 簡易実装：左右チャンネルの視覚化
        this.renderWaveform();
        
        const canvasWidth = this.width / window.devicePixelRatio;
        const canvasHeight = this.height / window.devicePixelRatio;
        
        // ステレオ情報表示
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(0, 0, canvasWidth, 30);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('L', 10, 20);
        this.ctx.fillText('R', canvasWidth - 20, 20);
    }
    
    /**
     * 音響イベントを更新
     * @private
     */
    updateAudioEvents() {
        // 音響レベルの変化を検出
        if (!this.frequencyData) return;
        
        let sum = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            sum += this.frequencyData[i];
        }
        const currentLevel = sum / this.bufferLength;
        
        // 前回のレベルと比較してイベントを生成
        if (this.lastAudioLevel !== undefined) {
            const change = currentLevel - this.lastAudioLevel;
            if (Math.abs(change) > 10) { // 閾値
                this.addAudioEvent({
                    type: change > 0 ? 'increase' : 'decrease',
                    intensity: Math.abs(change),
                    timestamp: performance.now()
                });
            }
        }
        
        this.lastAudioLevel = currentLevel;
        
        // 古いイベントを削除
        const now = performance.now();
        this.audioEvents = this.audioEvents.filter(event => 
            now - event.timestamp < 2000 // 2秒間表示
        );
    }
    
    /**
     * 音響イベントを追加
     * @private
     * @param {Object} event - イベント情報
     */
    addAudioEvent(event) {
        this.audioEvents.push(event);
        this.eventHistory.push(event);
        
        // 履歴の制限
        if (this.eventHistory.length > this.maxEvents) {
            this.eventHistory.shift();
        }
    }
    
    /**
     * 音響イベントを描画
     * @private
     */
    renderAudioEvents() {
        if (this.motionReduction) return; // モーション削減モード
        
        const canvasWidth = this.width / window.devicePixelRatio;
        const canvasHeight = this.height / window.devicePixelRatio;
        const now = performance.now();
        
        this.audioEvents.forEach(event => {
            const age = now - event.timestamp;
            const opacity = 1 - (age / 2000); // 2秒でフェードアウト
            
            if (opacity <= 0) return;
            
            const size = event.intensity * 2;
            const x = Math.random() * canvasWidth;
            const y = Math.random() * canvasHeight;
            
            this.ctx.save();
            this.ctx.globalAlpha = opacity;
            
            if (event.type === 'increase') {
                this.ctx.fillStyle = this.highContrast ? '#ffffff' : '#00ff00';
            } else {
                this.ctx.fillStyle = this.highContrast ? '#000000' : '#ff0000';
            }
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, 2 * Math.PI);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    /**
     * アクセシビリティ情報を描画
     * @private
     */
    renderAccessibilityInfo() {
        const canvasWidth = this.width / window.devicePixelRatio;
        const canvasHeight = this.height / window.devicePixelRatio;
        
        // 情報パネル
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, canvasHeight - 80, canvasWidth, 80);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        
        // 現在の音響レベル
        let sum = 0;
        if (this.frequencyData) {
            for (let i = 0; i < this.bufferLength; i++) {
                sum += this.frequencyData[i];
            }
        }
        const level = Math.round((sum / this.bufferLength / 255) * 100);
        this.ctx.fillText(`Audio Level: ${level}%`, 10, canvasHeight - 60);
        
        // 視覚化タイプ
        this.ctx.fillText(`Visualization: ${this.currentVisualization}`, 10, canvasHeight - 45);
        
        // 色スキーム
        this.ctx.fillText(`Color Scheme: ${this.currentColorScheme}`, 10, canvasHeight - 30);
        
        // イベント数
        this.ctx.fillText(`Active Events: ${this.audioEvents.length}`, 10, canvasHeight - 15);
    }
    
    /**
     * 視覚化タイプを設定
     * @param {string} type - 視覚化タイプ
     */
    setVisualizationType(type) {
        if (type in this.visualizationTypes) {
            this.currentVisualization = type;
            console.log(`Visualization type changed to: ${type}`);
        }
    }
    
    /**
     * 色スキームを設定
     * @param {string} scheme - 色スキーム
     */
    setColorScheme(scheme) {
        if (scheme in this.colorSchemes) {
            this.currentColorScheme = scheme;
            this.updateColorScheme();
            console.log(`Color scheme changed to: ${scheme}`);
        }
    }
    
    /**
     * 色スキームを更新
     * @private
     */
    updateColorScheme() {
        if (this.highContrast) {
            // 高コントラストモードでは白黒のみ
            return;
        }
        
        // 色スキームに基づいてCanvas枠の色を更新
        const colorScheme = this.colorSchemes[this.currentColorScheme];
        if (this.canvas) {
            this.canvas.style.borderColor = colorScheme.primary;
        }
    }
    
    /**
     * アニメーション設定を更新
     * @private
     */
    updateAnimationSettings() {
        if (this.motionReduction) {
            this.targetFPS = 30; // フレームレートを下げる
        } else {
            this.targetFPS = 60;
        }
    }
    
    /**
     * パフォーマンスモードを設定
     * @param {string} mode - パフォーマンスモード ('low', 'medium', 'high')
     */
    setPerformanceMode(mode) {
        this.performanceMode = mode;
        
        switch (mode) {
            case 'low':
                this.targetFPS = 30;
                this.analyser.fftSize = 512;
                break;
            case 'medium':
                this.targetFPS = 45;
                this.analyser.fftSize = 1024;
                break;
            case 'high':
                this.targetFPS = 60;
                this.analyser.fftSize = 2048;
                break;
        }
        
        // バッファを再初期化
        if (this.analyser) {
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.frequencyData = new Uint8Array(this.bufferLength);
            this.timeDomainData = new Uint8Array(this.bufferLength);
        }
        
        console.log(`Performance mode changed to: ${mode}`);
    }
    
    /**
     * アクセシビリティモードを設定
     * @param {boolean} enabled - 有効状態
     */
    setAccessibilityMode(enabled) {
        this.accessibilityMode = enabled;
        
        if (enabled) {
            this.canvas.style.width = '400px';
            this.canvas.style.height = '300px';
            this.updateCanvasSize();
        } else {
            this.canvas.style.width = '300px';
            this.canvas.style.height = '200px';
            this.updateCanvasSize();
        }
    }
    
    /**
     * 音響イベントを手動で追加（テスト用）
     * @param {string} eventType - イベントタイプ
     * @param {number} intensity - 強度
     */
    triggerAudioEvent(eventType, intensity = 50) {
        this.addAudioEvent({
            type: eventType,
            intensity: intensity,
            timestamp: performance.now()
        });
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    getStatistics() {
        return {
            isRunning: this.isRunning,
            currentVisualization: this.currentVisualization,
            colorScheme: this.currentColorScheme,
            performanceMode: this.performanceMode,
            targetFPS: this.targetFPS,
            bufferLength: this.bufferLength,
            activeEvents: this.audioEvents.length,
            eventHistory: this.eventHistory.length,
            accessibilityMode: this.accessibilityMode,
            highContrast: this.highContrast,
            motionReduction: this.motionReduction
        };
    }
    
    /**
     * Canvasを設定
     * @param {HTMLCanvasElement} canvas - Canvas要素
     */
    setCanvas(canvas) {
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            console.warn('[AudioVisualizer] Invalid canvas element provided');
            return false;
        }
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        if (!this.ctx) {
            console.error('[AudioVisualizer] Failed to get 2D context from canvas');
            return false;
        }
        
        // Canvas サイズを更新
        this.updateCanvasSize();
        
        console.log('[AudioVisualizer] Canvas set successfully');
        return true;
    }
    
    /**
     * Canvas サイズを更新
     * @private
     */
    updateCanvasSize() {
        if (!this.canvas) return;
        
        // デフォルトサイズまたは親要素のサイズに合わせる
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width || 300;
        this.height = rect.height || 200;
        
        // デバイスピクセル比を考慮
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        
        // CSS サイズを設定
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        
        // コンテキストのスケールを調整
        if (this.ctx) {
            this.ctx.scale(dpr, dpr);
        }
    }
    
    /**
     * リソースの解放
     */
    dispose() {
        this.stop();
        
        if (this.analyser) {
            this.analyser.disconnect();
            this.analyser = null;
        }
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        this.canvas = null;
        this.ctx = null;
        this.audioEvents = [];
        this.eventHistory = [];
        
        console.log('AudioVisualizer disposed');
    }
}