/**
 * Effect Debug Interface
 * リアルタイムエフェクトパフォーマンス表示とパラメータ調整ツール
 */

export class EffectDebugInterface {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.isVisible = false;
        this.debugPanel = null;
        this.updateInterval = null;
        this.metrics = {
            fps: 0,
            particleCount: 0,
            effectCount: 0,
            memoryUsage: 0,
            renderTime: 0
        };
        
        this.initialize();
    }

    initialize() {
        this.createDebugPanel();
        this.bindEvents();
    }

    createDebugPanel() {
        // デバッグパネルのHTML構造を作成
        this.debugPanel = document.createElement('div');
        this.debugPanel.id = 'effect-debug-panel';
        this.debugPanel.className = 'effect-debug-panel';
        this.debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            display: none;
            max-height: 80vh;
            overflow-y: auto;
        `;

        this.debugPanel.innerHTML = `
            <div class="debug-header">
                <h3 style="margin: 0 0 10px 0; color: #00ff00;">Effect Debug Interface</h3>
                <button id="close-debug" style="float: right; margin-top: -25px;">×</button>
            </div>
            
            <div class="metrics-section">
                <h4 style="color: #ffff00; margin: 5px 0;">Real-time Metrics</h4>
                <div id="fps-display">FPS: <span id="fps-value">--</span></div>
                <div id="particle-count">Particles: <span id="particle-value">--</span></div>
                <div id="effect-count">Effects: <span id="effect-value">--</span></div>
                <div id="memory-usage">Memory: <span id="memory-value">-- MB</span></div>
                <div id="render-time">Render Time: <span id="render-value">-- ms</span></div>
            </div>

            <div class="quality-controls">
                <h4 style="color: #ffff00; margin: 15px 0 5px 0;">Quality Controls</h4>
                <div>
                    <label>Quality Level:</label>
                    <select id="quality-select">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="ultra">Ultra</option>
                    </select>
                </div>
                <div style="margin-top: 5px;">
                    <label>Particle Multiplier:</label>
                    <input type="range" id="particle-multiplier" min="0.1" max="2.0" step="0.1" value="1.0">
                    <span id="particle-multiplier-value">1.0</span>
                </div>
                <div style="margin-top: 5px;">
                    <label>Effect Intensity:</label>
                    <input type="range" id="effect-intensity" min="0.1" max="2.0" step="0.1" value="1.0">
                    <span id="effect-intensity-value">1.0</span>
                </div>
            </div>

            <div class="effect-preview">
                <h4 style="color: #ffff00; margin: 15px 0 5px 0;">Effect Preview</h4>
                <div>
                    <label>Effect Type:</label>
                    <select id="preview-effect-type">
                        <option value="bubble-normal">Normal Bubble</option>
                        <option value="bubble-rainbow">Rainbow Bubble</option>
                        <option value="bubble-electric">Electric Bubble</option>
                        <option value="bubble-spiky">Spiky Bubble</option>
                        <option value="bubble-diamond">Diamond Bubble</option>
                        <option value="combo-basic">Basic Combo</option>
                        <option value="combo-enhanced">Enhanced Combo</option>
                        <option value="combo-spectacular">Spectacular Combo</option>
                        <option value="screen-flash">Screen Flash</option>
                        <option value="screen-shake">Screen Shake</option>
                    </select>
                </div>
                <button id="trigger-preview" style="margin-top: 5px; width: 100%;">Trigger Effect</button>
            </div>

            <div class="toggle-controls">
                <h4 style="color: #ffff00; margin: 15px 0 5px 0;">Effect Toggles</h4>
                <div>
                    <input type="checkbox" id="toggle-particles" checked>
                    <label for="toggle-particles">Particles</label>
                </div>
                <div>
                    <input type="checkbox" id="toggle-screen-effects" checked>
                    <label for="toggle-screen-effects">Screen Effects</label>
                </div>
                <div>
                    <input type="checkbox" id="toggle-animations" checked>
                    <label for="toggle-animations">Animations</label>
                </div>
                <div>
                    <input type="checkbox" id="toggle-seasonal" checked>
                    <label for="toggle-seasonal">Seasonal Effects</label>
                </div>
            </div>

            <div class="performance-controls">
                <h4 style="color: #ffff00; margin: 15px 0 5px 0;">Performance</h4>
                <button id="clear-effects" style="width: 100%; margin-bottom: 5px;">Clear All Effects</button>
                <button id="benchmark-effects" style="width: 100%;">Run Benchmark</button>
            </div>
        `;

        document.body.appendChild(this.debugPanel);
    }

    bindEvents() {
        // 閉じるボタン
        document.getElementById('close-debug').addEventListener('click', () => {
            this.hide();
        });

        // 品質設定
        document.getElementById('quality-select').addEventListener('change', (e) => {
            this.updateQualityLevel(e.target.value);
        });

        // パーティクル倍率
        const particleMultiplier = document.getElementById('particle-multiplier');
        particleMultiplier.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            document.getElementById('particle-multiplier-value').textContent = value.toFixed(1);
            this.updateParticleMultiplier(value);
        });

        // エフェクト強度
        const effectIntensity = document.getElementById('effect-intensity');
        effectIntensity.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            document.getElementById('effect-intensity-value').textContent = value.toFixed(1);
            this.updateEffectIntensity(value);
        });

        // エフェクトプレビュー
        document.getElementById('trigger-preview').addEventListener('click', () => {
            const effectType = document.getElementById('preview-effect-type').value;
            this.triggerPreviewEffect(effectType);
        });

        // エフェクトトグル
        document.getElementById('toggle-particles').addEventListener('change', (e) => {
            this.toggleEffectType('particles', e.target.checked);
        });

        document.getElementById('toggle-screen-effects').addEventListener('change', (e) => {
            this.toggleEffectType('screenEffects', e.target.checked);
        });

        document.getElementById('toggle-animations').addEventListener('change', (e) => {
            this.toggleEffectType('animations', e.target.checked);
        });

        document.getElementById('toggle-seasonal').addEventListener('change', (e) => {
            this.toggleEffectType('seasonal', e.target.checked);
        });

        // パフォーマンス制御
        document.getElementById('clear-effects').addEventListener('click', () => {
            this.clearAllEffects();
        });

        document.getElementById('benchmark-effects').addEventListener('click', () => {
            this.runBenchmark();
        });

        // キーボードショートカット（Ctrl+Shift+E でトグル）
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                this.toggle();
                e.preventDefault();
            }
        });
    }

    show() {
        this.isVisible = true;
        this.debugPanel.style.display = 'block';
        this.startMetricsUpdate();
        this.loadCurrentSettings();
    }

    hide() {
        this.isVisible = false;
        this.debugPanel.style.display = 'none';
        this.stopMetricsUpdate();
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    startMetricsUpdate() {
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
        }, 100); // 100ms毎に更新
    }

    stopMetricsUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    updateMetrics() {
        // FPS計算
        this.metrics.fps = this.calculateFPS();
        
        // パーティクル数取得
        this.metrics.particleCount = this.getParticleCount();
        
        // エフェクト数取得
        this.metrics.effectCount = this.getEffectCount();
        
        // メモリ使用量取得
        this.metrics.memoryUsage = this.getMemoryUsage();
        
        // レンダリング時間取得
        this.metrics.renderTime = this.getRenderTime();

        // UI更新
        this.updateMetricsDisplay();
    }

    updateMetricsDisplay() {
        document.getElementById('fps-value').textContent = this.metrics.fps.toFixed(1);
        document.getElementById('particle-value').textContent = this.metrics.particleCount;
        document.getElementById('effect-value').textContent = this.metrics.effectCount;
        document.getElementById('memory-value').textContent = this.metrics.memoryUsage.toFixed(1);
        document.getElementById('render-value').textContent = this.metrics.renderTime.toFixed(2);
    }

    calculateFPS() {
        // GameEngineからFPS情報を取得
        if (this.gameEngine && this.gameEngine.performanceOptimizer) {
            return this.gameEngine.performanceOptimizer.getCurrentFPS() || 0;
        }
        return 0;
    }

    getParticleCount() {
        let count = 0;
        if (this.gameEngine && this.gameEngine.enhancedParticleManager) {
            count += this.gameEngine.enhancedParticleManager.getActiveParticleCount() || 0;
        }
        return count;
    }

    getEffectCount() {
        let count = 0;
        if (this.gameEngine && this.gameEngine.enhancedEffectManager) {
            count += this.gameEngine.enhancedEffectManager.getActiveEffectCount() || 0;
        }
        return count;
    }

    getMemoryUsage() {
        // ブラウザのメモリAPI使用（利用可能な場合）
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
    }

    getRenderTime() {
        // パフォーマンス測定から取得
        if (this.gameEngine && this.gameEngine.performanceOptimizer) {
            return this.gameEngine.performanceOptimizer.getAverageRenderTime() || 0;
        }
        return 0;
    }

    loadCurrentSettings() {
        // 現在の設定をUIに反映
        const qualityController = this.gameEngine?.effectQualityController;
        if (qualityController) {
            const currentQuality = qualityController.getCurrentQualityLevel();
            document.getElementById('quality-select').value = currentQuality;
        }
    }

    updateQualityLevel(level) {
        if (this.gameEngine?.effectQualityController) {
            this.gameEngine.effectQualityController.setQualityLevel(level);
        }
    }

    updateParticleMultiplier(multiplier) {
        if (this.gameEngine?.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.setParticleMultiplier(multiplier);
        }
    }

    updateEffectIntensity(intensity) {
        if (this.gameEngine?.enhancedEffectManager) {
            this.gameEngine.enhancedEffectManager.setEffectIntensity(intensity);
        }
    }

    triggerPreviewEffect(effectType) {
        const [category, type] = effectType.split('-');
        
        switch (category) {
            case 'bubble':
                this.triggerBubbleEffect(type);
                break;
            case 'combo':
                this.triggerComboEffect(type);
                break;
            case 'screen':
                this.triggerScreenEffect(type);
                break;
        }
    }

    triggerBubbleEffect(type) {
        const canvas = this.gameEngine?.canvas;
        if (!canvas) return;

        const x = canvas.width / 2;
        const y = canvas.height / 2;

        if (this.gameEngine?.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.createBubbleDestructionEffect(x, y, type);
        }
    }

    triggerComboEffect(type) {
        const comboValue = type === 'basic' ? 3 : type === 'enhanced' ? 7 : 15;
        
        if (this.gameEngine?.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.createComboEffect(comboValue);
        }
    }

    triggerScreenEffect(type) {
        if (this.gameEngine?.enhancedEffectManager) {
            if (type === 'flash') {
                this.gameEngine.enhancedEffectManager.screenFlash(1000, 'rgba(255, 255, 255, 0.8)');
            } else if (type === 'shake') {
                this.gameEngine.enhancedEffectManager.screenShake(500, 10);
            }
        }
    }

    toggleEffectType(effectType, enabled) {
        switch (effectType) {
            case 'particles':
                if (this.gameEngine?.enhancedParticleManager) {
                    this.gameEngine.enhancedParticleManager.setEnabled(enabled);
                }
                break;
            case 'screenEffects':
                if (this.gameEngine?.enhancedEffectManager) {
                    this.gameEngine.enhancedEffectManager.setEnabled(enabled);
                }
                break;
            case 'animations':
                if (this.gameEngine?.animationManager) {
                    this.gameEngine.animationManager.setEnabled(enabled);
                }
                break;
            case 'seasonal':
                if (this.gameEngine?.seasonalEffectManager) {
                    this.gameEngine.seasonalEffectManager.setEnabled(enabled);
                }
                break;
        }
    }

    clearAllEffects() {
        if (this.gameEngine?.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.clearAllParticles();
        }
        if (this.gameEngine?.enhancedEffectManager) {
            this.gameEngine.enhancedEffectManager.clearAllEffects();
        }
        if (this.gameEngine?.animationManager) {
            this.gameEngine.animationManager.clearAllAnimations();
        }
    }

    runBenchmark() {
        console.log('Starting effect benchmark...');
        
        const benchmarkResults = {
            particleStress: this.benchmarkParticles(),
            effectStress: this.benchmarkEffects(),
            animationStress: this.benchmarkAnimations()
        };

        console.log('Benchmark Results:', benchmarkResults);
        
        // 結果をUIに表示
        alert(`Benchmark Results:
Particle Stress: ${benchmarkResults.particleStress.fps.toFixed(1)} FPS
Effect Stress: ${benchmarkResults.effectStress.fps.toFixed(1)} FPS
Animation Stress: ${benchmarkResults.animationStress.fps.toFixed(1)} FPS`);
    }

    benchmarkParticles() {
        // パーティクルストレステスト
        const startTime = performance.now();
        let frameCount = 0;
        
        // 大量のパーティクル生成
        for (let i = 0; i < 100; i++) {
            this.triggerBubbleEffect('normal');
        }
        
        // 1秒間のFPS測定
        return new Promise((resolve) => {
            const measureFrames = () => {
                frameCount++;
                if (performance.now() - startTime < 1000) {
                    requestAnimationFrame(measureFrames);
                } else {
                    resolve({
                        fps: frameCount,
                        duration: performance.now() - startTime
                    });
                }
            };
            requestAnimationFrame(measureFrames);
        });
    }

    benchmarkEffects() {
        // スクリーンエフェクトストレステスト
        const startTime = performance.now();
        
        // 複数のスクリーンエフェクトを同時実行
        this.triggerScreenEffect('flash');
        this.triggerScreenEffect('shake');
        
        return {
            fps: this.calculateFPS(),
            duration: performance.now() - startTime
        };
    }

    benchmarkAnimations() {
        // アニメーションストレステスト
        const startTime = performance.now();
        
        // 複数のアニメーションを同時実行
        for (let i = 0; i < 20; i++) {
            this.triggerComboEffect('spectacular');
        }
        
        return {
            fps: this.calculateFPS(),
            duration: performance.now() - startTime
        };
    }

    destroy() {
        this.stopMetricsUpdate();
        if (this.debugPanel && this.debugPanel.parentNode) {
            this.debugPanel.parentNode.removeChild(this.debugPanel);
        }
    }
}

// グローバルアクセス用（デバッグ目的）
window.EffectDebugInterface = EffectDebugInterface;