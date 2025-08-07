/**
 * フィードバックエフェクト描画クラス
 * 視覚フィードバックの描画・エフェクト処理を担当
 * Main Controller Pattern: VisualFeedbackManagerから描画機能を分離
 */
export class FeedbackEffectRenderer {
    /**
     * コンストラクター
     * @param {VisualFeedbackManager} mainController - メインコントローラー参照
     */
    constructor(mainController) {
        this.mainController = mainController;
        this.config = mainController.config;
        this.userPreferences = mainController.userPreferences;
        this.dataArray = mainController.dataArray;
        this.analyser = mainController.analyser;
        this.canvasContext = mainController.canvasContext;
        this.visualCanvas = mainController.visualCanvas;
        this.animationFrameId = mainController.animationFrameId;
        
        console.log('FeedbackEffectRenderer initialized');
    }

    /**
     * カラーエフェクトの作成
     * 背景色の変化による視覚フィードバック
     * @param {Object} options - エフェクトオプション
     * @param {string} options.id - エフェクトID
     * @param {HTMLElement} options.target - 対象要素
     * @param {string} options.color - エフェクト色
     * @param {number} options.intensity - 強度
     * @param {number} options.duration - 持続時間
     * @returns {Object} エフェクトオブジェクト
     */
    createColorEffect({ id, target, color, intensity, duration }) {
        try {
            if (!target || !color) {
                console.warn('Invalid parameters for color effect:', { target, color });
                return null;
            }

            const originalBackground = target.style.background;
            
            const animation = target.animate([
                { backgroundColor: 'transparent' },
                { backgroundColor: color },
                { backgroundColor: 'transparent' }
            ], {
                duration: duration,
                easing: 'ease-in-out'
            });

            animation.addEventListener('finish', () => {
                target.style.background = originalBackground;
            });
            
            return { 
                id, 
                target, 
                type: 'color', 
                cleanup: null,
                animation: animation
            };
        } catch (error) {
            console.error('Error creating color effect:', error);
            return null;
        }
    }

    /**
     * ボーダーエフェクトの作成
     * ボーダーの表示・アニメーションによる視覚フィードバック
     * @param {Object} options - エフェクトオプション
     * @param {string} options.id - エフェクトID
     * @param {HTMLElement} options.target - 対象要素
     * @param {string} options.color - エフェクト色
     * @param {number} options.intensity - 強度
     * @param {number} options.duration - 持続時間
     * @returns {Object} エフェクトオブジェクト
     */
    createBorderEffect({ id, target, color, intensity, duration }) {
        try {
            if (!target || !color) {
                console.warn('Invalid parameters for border effect:', { target, color });
                return null;
            }

            const borderWidth = Math.max(1, 3 * intensity);
            const originalBorder = target.style.border;
            
            target.style.border = `${borderWidth}px solid ${color}`;
            target.style.opacity = '1';
            
            const animation = target.animate([
                { borderWidth: `${borderWidth}px`, opacity: 1 },
                { borderWidth: '0px', opacity: 0 }
            ], {
                duration: duration,
                easing: 'ease-out'
            });

            animation.addEventListener('finish', () => {
                target.style.border = originalBorder;
                target.style.opacity = '0';
            });
            
            return { 
                id, 
                target, 
                type: 'border', 
                cleanup: null,
                animation: animation
            };
        } catch (error) {
            console.error('Error creating border effect:', error);
            return null;
        }
    }

    /**
     * スケールエフェクトの作成
     * 要素のスケール変更による視覚フィードバック
     * @param {Object} options - エフェクトオプション
     * @param {string} options.id - エフェクトID
     * @param {HTMLElement} options.target - 対象要素
     * @param {string} options.color - エフェクト色
     * @param {number} options.intensity - 強度
     * @param {number} options.duration - 持続時間
     * @returns {Object} エフェクトオブジェクト
     */
    createScaleEffect({ id, target, color, intensity, duration }) {
        try {
            if (!target || !color) {
                console.warn('Invalid parameters for scale effect:', { target, color });
                return null;
            }

            const scaleAmount = 1 + (intensity * 0.3);
            const originalTransform = target.style.transform;
            
            target.style.background = color;
            target.style.opacity = '0.5';
            
            const animation = target.animate([
                { transform: 'scale(1)', opacity: 0 },
                { transform: `scale(${scaleAmount})`, opacity: 0.5 },
                { transform: 'scale(1)', opacity: 0 }
            ], {
                duration: duration,
                easing: 'ease-in-out'
            });

            animation.addEventListener('finish', () => {
                target.style.transform = originalTransform;
                target.style.background = '';
                target.style.opacity = '0';
            });
            
            return { 
                id, 
                target, 
                type: 'scale', 
                cleanup: null,
                animation: animation
            };
        } catch (error) {
            console.error('Error creating scale effect:', error);
            return null;
        }
    }

    /**
     * オーディオ視覚化の開始
     * オーディオデータをリアルタイムで視覚化
     * @returns {void}
     */
    startAudioVisualization() {
        try {
            if (!this.analyser || !this.canvasContext) {
                console.warn('Audio visualization cannot start: missing analyser or canvas context');
                return;
            }
            
            const drawVisualization = () => {
                if (!this.config.enabled || !this.userPreferences.audioVisualization) {
                    this.mainController.animationFrameId = requestAnimationFrame(drawVisualization);
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
                
                this.mainController.animationFrameId = requestAnimationFrame(drawVisualization);
            };
            
            drawVisualization();
        } catch (error) {
            console.error('Error starting audio visualization:', error);
        }
    }

    /**
     * 周波数に基づく色の取得
     * 音響周波数を視覚色に変換
     * @param {number} frequency - 周波数（Hz）
     * @returns {string} カラーコード
     */
    getFrequencyColor(frequency) {
        try {
            const mapping = this.config.audioMapping.frequency;
            
            for (const [range, config] of Object.entries(mapping)) {
                if (frequency >= config.range[0] && frequency <= config.range[1]) {
                    return config.color;
                }
            }
            
            return '#ffffff';
        } catch (error) {
            console.error('Error getting frequency color:', error);
            return '#ffffff';
        }
    }

    /**
     * 音量ベースフィードバックのトリガー
     * 音量レベルに基づく視覚フィードバックの実行
     * @param {number} volume - 音量レベル（0-1）
     */
    triggerVolumeBasedFeedback(volume) {
        try {
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
        } catch (error) {
            console.error('Error triggering volume-based feedback:', error);
        }
    }

    /**
     * エッジフィードバックのトリガー
     * 画面端での視覚フィードバック実行
     * @param {string} color - エフェクト色
     * @param {number} intensity - 強度
     */
    triggerEdgeFeedback(color, intensity) {
        try {
            const edges = ['top', 'bottom', 'left', 'right'];
            const randomEdge = edges[Math.floor(Math.random() * edges.length)];
            const edgeElement = this.mainController.feedbackElements.get(`edge-${randomEdge}`);
            
            if (edgeElement) {
                this.mainController.triggerVisualFeedback({
                    type: 'flash',
                    color: color,
                    intensity: intensity * 0.5,
                    duration: 200,
                    target: edgeElement
                });
            }
        } catch (error) {
            console.error('Error triggering edge feedback:', error);
        }
    }

    /**
     * エフェクトのバリデーション
     * エフェクトパラメーターの妥当性を検証
     * @param {Object} options - エフェクトオプション
     * @returns {boolean} 妥当性
     */
    validateEffectOptions(options) {
        try {
            const { id, target, color, intensity, duration } = options;
            
            if (!id || typeof id !== 'string') {
                console.warn('Invalid effect ID:', id);
                return false;
            }
            
            if (!target || !target.style) {
                console.warn('Invalid effect target:', target);
                return false;
            }
            
            if (!color || typeof color !== 'string') {
                console.warn('Invalid effect color:', color);
                return false;
            }
            
            if (typeof intensity !== 'number' || intensity < 0 || intensity > 2) {
                console.warn('Invalid effect intensity:', intensity);
                return false;
            }
            
            if (typeof duration !== 'number' || duration < 0) {
                console.warn('Invalid effect duration:', duration);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error validating effect options:', error);
            return false;
        }
    }

    /**
     * エフェクトのクリーンアップ
     * 未完了のアニメーションや一時的なスタイルをクリーンアップ
     * @param {Object} effect - エフェクトオブジェクト
     */
    cleanupEffect(effect) {
        try {
            if (!effect) return;
            
            // アニメーションの停止
            if (effect.animation) {
                effect.animation.cancel();
            }
            
            // スタイルのリセット
            if (effect.target && effect.target.style) {
                const target = effect.target;
                
                switch (effect.type) {
                    case 'color':
                        target.style.background = '';
                        break;
                    case 'border':
                        target.style.border = '';
                        target.style.opacity = '';
                        break;
                    case 'scale':
                        target.style.transform = '';
                        target.style.background = '';
                        target.style.opacity = '';
                        break;
                }
            }
            
        } catch (error) {
            console.error('Error cleaning up effect:', error);
        }
    }

    /**
     * レポート生成
     * エフェクト描画に関する統計情報を生成
     * @returns {Object} レポートデータ
     */
    generateReport() {
        try {
            return {
                timestamp: new Date().toISOString(),
                component: 'FeedbackEffectRenderer',
                audioVisualization: {
                    enabled: this.userPreferences.audioVisualization,
                    hasAnalyser: !!this.analyser,
                    hasCanvas: !!this.visualCanvas,
                    canvasSize: this.visualCanvas ? {
                        width: this.visualCanvas.width,
                        height: this.visualCanvas.height
                    } : null
                },
                effectTypes: {
                    color: 'Available',
                    border: 'Available', 
                    scale: 'Available'
                },
                configuration: {
                    enabled: this.config.enabled,
                    globalIntensity: this.config.globalIntensity
                }
            };
        } catch (error) {
            console.error('Error generating report:', error);
            return {
                timestamp: new Date().toISOString(),
                component: 'FeedbackEffectRenderer',
                error: error.message
            };
        }
    }

    /**
     * デストラクター
     * リソースのクリーンアップ
     */
    destroy() {
        try {
            // アニメーションフレームのキャンセル
            if (this.mainController.animationFrameId) {
                cancelAnimationFrame(this.mainController.animationFrameId);
                this.mainController.animationFrameId = null;
            }
            
            // 参照のクリア
            this.mainController = null;
            this.config = null;
            this.userPreferences = null;
            this.dataArray = null;
            this.analyser = null;
            this.canvasContext = null;
            this.visualCanvas = null;
            
            console.log('FeedbackEffectRenderer destroyed');
        } catch (error) {
            console.error('Error destroying FeedbackEffectRenderer:', error);
        }
    }
}