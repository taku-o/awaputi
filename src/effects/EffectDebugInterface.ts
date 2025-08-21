/**
 * Effect Debug Interface
 * リアルタイムエフェクトパフォーマンス表示とパラメータ調整ツール
 */

// Type definitions for debug interface system
interface PerformanceMetrics { fps: number,
    particleCount: number,
    effectCount: number,
    memoryUsage: number,
    renderTime: number;
    interface QualityLevel { readonly LOW: 'low',''
    readonly MEDIUM: 'medium';
    readonly HIGH: 'high';
    readonly ULTRA: 'ultra'
            }

type QualityLevelType = 'low' | 'medium' | 'high' | 'ultra';
';'

interface EffectType { ''
    readonly BUBBLE_NORMAL: 'bubble-normal';
    readonly BUBBLE_RAINBOW: 'bubble-rainbow';
    readonly BUBBLE_ELECTRIC: 'bubble-electric';
    readonly BUBBLE_SPIKY: 'bubble-spiky';
    readonly BUBBLE_DIAMOND: 'bubble-diamond';
    readonly COMBO_BASIC: 'combo-basic';
    readonly COMBO_ENHANCED: 'combo-enhanced';
    readonly COMBO_SPECTACULAR: 'combo-spectacular';
    readonly SCREEN_FLASH: 'screen-flash';
    readonly SCREEN_SHAKE: 'screen-shake'
            }

type EffectTypeString = 'bubble-normal' | 'bubble-rainbow' | 'bubble-electric' | 'bubble-spiky' | 'bubble-diamond' | 'combo-basic' | 'combo-enhanced' | 'combo-spectacular' | 'screen-flash' | 'screen-shake';

type BubbleEffectType = 'normal' | 'rainbow' | 'electric' | 'spiky' | 'diamond';
type ComboEffectType = 'basic' | 'enhanced' | 'spectacular';
type ScreenEffectType = 'flash' | 'shake';
type ToggleEffectType = 'particles' | 'screenEffects' | 'animations' | 'seasonal';

interface GameEngine { canvas?: HTMLCanvasElement,
    performanceOptimizer?: {
        getCurrentFPS(): number | null;
    getAverageRenderTime(): number | null };
    enhancedParticleManager?: { getActiveParticleCount(): number | null,
        setParticleMultiplier(multiplier: number): void;
        createBubbleDestructionEffect(x: number, y: number, type: BubbleEffectType): void;
        createComboEffect(comboValue: number): void;
        setEnabled(enabled: boolean): void;
        clearAllParticles(): void;;
    enhancedEffectManager?: { getActiveEffectCount(): number | null,
        setEffectIntensity(intensity: number): void;
        screenFlash(duration: number, color: string): void;
        screenShake(duration: number, intensity: number): void;
        setEnabled(enabled: boolean): void;
        clearAllEffects(): void;;
    animationManager?: { setEnabled(enabled: boolean): void;
        clearAllAnimations(): void;;
    seasonalEffectManager?: { setEnabled(enabled: boolean): void;
    effectQualityController?: { getCurrentQualityLevel(): QualityLevelType,
        setQualityLevel(level: QualityLevelType): void };

interface BenchmarkResult { fps: number,
    duration: number,
    duration: number;
        };
interface BenchmarkResults { particleStress: BenchmarkResult,
    effectStress: BenchmarkResult,
    animationStress: BenchmarkResult,
    animationStress: BenchmarkResult;
        };
interface DebugUIElements { fpsValue: HTMLElement | null,
    particleValue: HTMLElement | null,
    effectValue: HTMLElement | null,
    memoryValue: HTMLElement | null,
    renderValue: HTMLElement | null,
    qualitySelect: HTMLSelectElement | null,
    particleMultiplier: HTMLInputElement | null,
    particleMultiplierValue: HTMLElement | null,
    effectIntensity: HTMLInputElement | null,
    effectIntensityValue: HTMLElement | null,
    previewEffectType: HTMLSelectElement | null,
    triggerPreview: HTMLButtonElement | null,
    toggleParticles: HTMLInputElement | null,
    toggleScreenEffects: HTMLInputElement | null,
    toggleAnimations: HTMLInputElement | null,
    toggleSeasonal: HTMLInputElement | null,
    clearEffects: HTMLButtonElement | null,
    benchmarkEffects: HTMLButtonElement | null,
    closeDebug: HTMLButtonElement | null }

export class EffectDebugInterface {
    private gameEngine: GameEngine;
    private isVisible: boolean = false;
    private debugPanel: HTMLElement | null = null;
    private updateInterval: number | null = null;
    private, metrics: PerformanceMetrics = {
        fps: 0,
        particleCount: 0,
        effectCount: 0,
        memoryUsage: 0,
    renderTime: 0 };
    constructor(gameEngine: GameEngine) {

        this.gameEngine = gameEngine }
        this.initialize(); }
    }

    private initialize(): void { this.createDebugPanel();
        this.bindEvents();

    private createDebugPanel()';'
        this.debugPanel = document.createElement('div');
        this.debugPanel.id = 'effect-debug-panel';
        this.debugPanel.className = 'effect-debug-panel';
        this.debugPanel.style.cssText = `;
            position: fixed,
            top: 10px,
    right: 10px,
            width: 300px,
            background: rgba(0, 0, 0, 0.8);
            color: white,
    padding: 15px;
            border-radius: 8px,
            font-family: monospace,
            font-size: 12px,
            z-index: 10000,
            display: none;
            max-height: 80vh,
            overflow-y: auto,
        `;
';'

        this.debugPanel.innerHTML = `';'
            <div class="debug-header">"";
                <h3 style="margin: 0 0 10px 0, color: #00ff00;">Effect Debug Interface</h3>""
                <button id="close-debug" style="float: right; margin-top: -25px;">×</button>
            </div>";"

            <div class="metrics-section">"";
                <h4 style="color: #ffff00, margin: 5px 0;">Real-time Metrics</h4>""
                <div id="fps-display">FPS: <span id="fps-value">--</span></div>",
                <div id="particle-count">Particles: <span id="particle-value">--</span></div>",
                <div id="effect-count">Effects: <span id="effect-value">--</span></div>",
                <div id="memory-usage">Memory: <span id="memory-value">-- MB</span></div>",
                <div id="render-time">Render Time: <span id="render-value">-- ms</span></div>,
            </div>";"

            <div class="quality-controls">"";
                <h4 style="color: #ffff00, margin: 15px 0 5px 0;">Quality Controls</h4>
                <div>";"
                    <label>Quality Level: </label>",
                    <select id="quality-select">"";
                        <option value="low">Low</option>"";
                        <option value="medium">Medium</option>"";
                        <option value="high">High</option>"";
                        <option value="ultra">Ultra</option>;
                    </select>";"
                </div>"";
                <div style="margin-top: 5px;">"
                    <label>Particle Multiplier: </label>",
                    <input type="range" id="particle-multiplier" min="0.1" max="2.0" step="0.1" value="1.0">"";
                    <span id="particle-multiplier-value">1.0</span>";"
                </div>"";
                <div style="margin-top: 5px;">"
                    <label>Effect Intensity: </label>",
                    <input type="range" id="effect-intensity" min="0.1" max="2.0" step="0.1" value="1.0">"";
                    <span id="effect-intensity-value">1.0</span>;
                </div>;
            </div>";"

            <div class="effect-preview">"";
                <h4 style="color: #ffff00, margin: 15px 0 5px 0;">Effect Preview</h4>
                <div>";"
                    <label>Effect Type: </label>",
                    <select id="preview-effect-type">"";
                        <option value="bubble-normal">Normal Bubble</option>"";
                        <option value="bubble-rainbow">Rainbow Bubble</option>"";
                        <option value="bubble-electric">Electric Bubble</option>"";
                        <option value="bubble-spiky">Spiky Bubble</option>"";
                        <option value="bubble-diamond">Diamond Bubble</option>"";
                        <option value="combo-basic">Basic Combo</option>"";
                        <option value="combo-enhanced">Enhanced Combo</option>"";
                        <option value="combo-spectacular">Spectacular Combo</option>"";
                        <option value="screen-flash">Screen Flash</option>"";
                        <option value="screen-shake">Screen Shake</option>;
                    </select>";"
                </div>"";
                <button id="trigger-preview" style="margin-top: 5px, width: 100%;">Trigger Effect</button>
            </div>";"

            <div class="toggle-controls">"";
                <h4 style="color: #ffff00, margin: 15px 0 5px 0;">Effect Toggles</h4>"
                <div>"";
                    <input type="checkbox" id="toggle-particles" checked>"";
                    <label for="toggle-particles">Particles</label>;
                </div>";"
                <div>"";
                    <input type="checkbox" id="toggle-screen-effects" checked>"";
                    <label for="toggle-screen-effects">Screen Effects</label>;
                </div>";"
                <div>"";
                    <input type="checkbox" id="toggle-animations" checked>"";
                    <label for="toggle-animations">Animations</label>;
                </div>";"
                <div>"";
                    <input type="checkbox" id="toggle-seasonal" checked>"";
                    <label for="toggle-seasonal">Seasonal Effects</label>;
                </div>;
            </div>";"

            <div class="performance-controls">"";
                <h4 style="color: #ffff00, margin: 15px 0 5px 0;">Performance</h4>""
                <button id="clear-effects" style="width: 100%; margin-bottom: 5px;">Clear All Effects</button>""
                <button id="benchmark-effects" style="width: 100%;">Run Benchmark</button>
            </div>;
        `;

        document.body.appendChild(this.debugPanel);
    }

    private bindEvents(): void { // 閉じるボタン""
        const closeButton = document.getElementById('close-debug') as HTMLButtonElement,
        closeButton?.addEventListener('click', () => {  }

            this.hide();' }'

        }');'
';'
        // 品質設定
        const qualitySelect = document.getElementById('quality-select') as HTMLSelectElement; : undefined''
        qualitySelect?.addEventListener('change', (e: Event) => {  const target = e.target as HTMLSelectElement }

            this.updateQualityLevel(target.value, as QualityLevelType);' }'

        }');'
';'
        // パーティクル倍率
        const particleMultiplier = document.getElementById('particle-multiplier') as HTMLInputElement;
        particleMultiplier?.addEventListener('input', (e: Event) => {  const target = e.target as HTMLInputElement,
            const value = parseFloat(target.value);
            const valueDisplay = document.getElementById('particle-multiplier-value),'
            if (valueDisplay) { }
                valueDisplay.textContent = value.toFixed(1); }
            }

            this.updateParticleMultiplier(value);'}');
';'
        // エフェクト強度
        const effectIntensity = document.getElementById('effect-intensity') as HTMLInputElement;
        effectIntensity?.addEventListener('input', (e: Event) => {  const target = e.target as HTMLInputElement,
            const value = parseFloat(target.value);
            const valueDisplay = document.getElementById('effect-intensity-value),'
            if (valueDisplay) { }
                valueDisplay.textContent = value.toFixed(1); }
            }

            this.updateEffectIntensity(value);'}');
';'
        // エフェクトプレビュー
        const triggerPreview = document.getElementById('trigger-preview') as HTMLButtonElement;
        triggerPreview?.addEventListener('click', () => {  ''
            const effectTypeSelect = document.getElementById('preview-effect-type) as HTMLSelectElement,'
            const effectType = effectTypeSelect?.value as EffectTypeString,
            if (effectType) { }
                this.triggerPreviewEffect(effectType); }

            }'}');
';'
        // エフェクトトグル
        const toggleParticles = document.getElementById('toggle-particles') as HTMLInputElement; : undefined''
        toggleParticles?.addEventListener('change', (e: Event) => {  const target = e.target as HTMLInputElement,' }'

            this.toggleEffectType('particles', target.checked'; }'

        }');'

        const toggleScreenEffects = document.getElementById('toggle-screen-effects') as HTMLInputElement;
        toggleScreenEffects?.addEventListener('change', (e: Event) => {  const target = e.target as HTMLInputElement,' }'

            this.toggleEffectType('screenEffects', target.checked'; }'

        }');'

        const toggleAnimations = document.getElementById('toggle-animations') as HTMLInputElement;
        toggleAnimations?.addEventListener('change', (e: Event) => {  const target = e.target as HTMLInputElement,' }'

            this.toggleEffectType('animations', target.checked'; }'

        }');'

        const toggleSeasonal = document.getElementById('toggle-seasonal') as HTMLInputElement;
        toggleSeasonal?.addEventListener('change', (e: Event) => {  const target = e.target as HTMLInputElement,' }'

            this.toggleEffectType('seasonal', target.checked'; }'

        }');'
';'
        // パフォーマンス制御
        const clearEffects = document.getElementById('clear-effects') as HTMLButtonElement;
        clearEffects?.addEventListener('click', () => { this.clearAllEffects(),' }'

        }');'

        const benchmarkEffects = document.getElementById('benchmark-effects') as HTMLButtonElement;
        benchmarkEffects?.addEventListener('click', () => { this.runBenchmark(),' }'

        }');'
';'
        // キーボードショートカット（Ctrl+Shift+E でトグル） : undefined
        document.addEventListener('keydown', (e: KeyboardEvent) => {  ''
            if(e.ctrlKey && e.shiftKey && e.key === 'E' {'
                
            
                this.toggle();
                e.preventDefault();     }
}
';'

    public show(): void { this.isVisible = true;
        if (this.debugPanel) {', ' }

            this.debugPanel.style.display = 'block'; }
        }
        this.startMetricsUpdate();
        this.loadCurrentSettings();
    }
';'

    public hide(): void { this.isVisible = false;
        if (this.debugPanel) {', ' }

            this.debugPanel.style.display = 'none'; }
        }
        this.stopMetricsUpdate();
    }

    public toggle(): void { if (this.isVisible) {
            this.hide() } else { this.show();
    }

    private startMetricsUpdate(): void { this.updateInterval = window.setInterval(() => {  }
            this.updateMetrics(); }
        }, 100); // 100ms毎に更新
    }

    private stopMetricsUpdate(): void { if (this.updateInterval !== null) {
            clearInterval(this.updateInterval);
            this.updateInterval = null }
    }

    private updateMetrics(): void { // FPS計算
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

    private updateMetricsDisplay()';'
            fpsValue: document.getElementById('fps-value,
            particleValue: document.getElementById('particle-value,
            effectValue: document.getElementById('effect-value,
            memoryValue: document.getElementById('memory-value,
            renderValue: document.getElementById('render-value);'
        };

        if (elements.fpsValue) { elements.fpsValue.textContent = this.metrics.fps.toFixed(1);
        if (elements.particleValue) { elements.particleValue.textContent = this.metrics.particleCount.toString();
        if (elements.effectValue) { elements.effectValue.textContent = this.metrics.effectCount.toString();
        if (elements.memoryValue) { elements.memoryValue.textContent = this.metrics.memoryUsage.toFixed(1);
        if (elements.renderValue) { elements.renderValue.textContent = this.metrics.renderTime.toFixed(2);
    }

    private calculateFPS(): number { // GameEngineからFPS情報を取得
        if (this.gameEngine?.performanceOptimizer) {
    
}
            return this.gameEngine.performanceOptimizer.getCurrentFPS() || 0;
        return 0;
    }
 : undefined
    private getParticleCount(): number { let count = 0,
        if (this.gameEngine?.enhancedParticleManager) {
    
}
            count += this.gameEngine.enhancedParticleManager.getActiveParticleCount() || 0; }
        }
        return count;
    }
 : undefined
    private getEffectCount(): number { let count = 0,
        if (this.gameEngine?.enhancedEffectManager) {
    
}
            count += this.gameEngine.enhancedEffectManager.getActiveEffectCount() || 0; }
        }
        return count;
    }
 : undefined
    private getMemoryUsage(): number { // ブラウザのメモリAPI使用（利用可能な場合）
        if (performance.memory) {
            
        
            return (performance.memory, as any).usedJSHeapSize / 1024 / 1024, // MB }
        }
        return 0;
    }

    private getRenderTime(): number { // パフォーマンス測定から取得
        if (this.gameEngine?.performanceOptimizer) {
    
}
            return this.gameEngine.performanceOptimizer.getAverageRenderTime() || 0;
        return 0;
    }
 : undefined
    private loadCurrentSettings(): void { // 現在の設定をUIに反映
        const qualityController = this.gameEngine?.effectQualityController,
        if (qualityController) {

            const currentQuality = qualityController.getCurrentQualityLevel()','
            const qualitySelect = document.getElementById('quality-select) as HTMLSelectElement,'
            if (qualitySelect) {
        }
                qualitySelect.value = currentQuality;     }
}
 : undefined
    private updateQualityLevel(level: QualityLevelType): void { if (this.gameEngine?.effectQualityController) {
            this.gameEngine.effectQualityController.setQualityLevel(level);
    }
 : undefined
    private updateParticleMultiplier(multiplier: number): void { if (this.gameEngine?.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.setParticleMultiplier(multiplier);
    }
 : undefined
    private updateEffectIntensity(intensity: number): void { if (this.gameEngine?.enhancedEffectManager) {
            this.gameEngine.enhancedEffectManager.setEffectIntensity(intensity);
    }

 : undefined';'
    private triggerPreviewEffect(effectType: EffectTypeString): void { ''
        const [category, type] = effectType.split('-),'

        switch(category) {

            case 'bubble':','
                this.triggerBubbleEffect(type, as BubbleEffectType);
                break,
            case 'combo':','
                this.triggerComboEffect(type, as ComboEffectType);
                break,
            case 'screen':,
                this.triggerScreenEffect(type, as ScreenEffectType);
                break; }
}

    private triggerBubbleEffect(type: BubbleEffectType): void { const canvas = this.gameEngine?.canvas,
        if (!canvas) return,

        const x = canvas.width / 2,
        const y = canvas.height / 2,

        if (this.gameEngine?.enhancedParticleManager) {
    
}
            this.gameEngine.enhancedParticleManager.createBubbleDestructionEffect(x, y, type); }
}

 : undefined';'
    private triggerComboEffect(type: ComboEffectType): void { ''
        const comboValue = type === 'basic' ? 3 : type === 'enhanced' ? 7 : 15,
        
        if (this.gameEngine?.enhancedParticleManager) {
    
}
            this.gameEngine.enhancedParticleManager.createComboEffect(comboValue); }
}
 : undefined';'
    private triggerScreenEffect(type: ScreenEffectType): void { ''
        if (this.gameEngine?.enhancedEffectManager) {

            if (type === 'flash') {
        }

                this.gameEngine.enhancedEffectManager.screenFlash(1000, 'rgba(255, 255, 255, 0.8)');' }'

            } else if (type === 'shake) { this.gameEngine.enhancedEffectManager.screenShake(500, 10) }'
}
 : undefined';'
    private toggleEffectType(effectType: ToggleEffectType, enabled: boolean): void { ''
        switch(effectType) {

            case 'particles':','
                if (this.gameEngine?.enhancedParticleManager) {
        }

                    this.gameEngine.enhancedParticleManager.setEnabled(enabled); }
                }

                break; : undefined''
            case 'screenEffects':
                if (this.gameEngine?.enhancedEffectManager) {', ' }

                    this.gameEngine.enhancedEffectManager.setEnabled(enabled); }
                }

                break; : undefined''
            case 'animations':
                if (this.gameEngine?.animationManager) {', ' }

                    this.gameEngine.animationManager.setEnabled(enabled); }
                }

                break; : undefined''
            case 'seasonal':
                if (this.gameEngine?.seasonalEffectManager) { this.gameEngine.seasonalEffectManager.setEnabled(enabled);
                break;
        }
    }
 : undefined
    private clearAllEffects(): void { if (this.gameEngine?.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.clearAllParticles();
        if (this.gameEngine?.enhancedEffectManager) { this.gameEngine.enhancedEffectManager.clearAllEffects();
        if (this.gameEngine?.animationManager) { this.gameEngine.animationManager.clearAllAnimations();
    }

 : undefined';'
    private runBenchmark()';'
        console.log('Starting, effect benchmark...);'
        
        Promise.all([);
            this.benchmarkParticles();
            Promise.resolve(this.benchmarkEffects()]';'
            Promise.resolve(this.benchmarkAnimations()']';
        ]).then(([particleStress, effectStress, animationStress]) => {  const benchmarkResults: BenchmarkResults = {
                particleStress,
                effectStress }
                animationStress }
            };

            console.log('Benchmark Results:', benchmarkResults);
            
            // 結果をUIに表示
            alert(`Benchmark, Results: );
Particle, Stress: ${benchmarkResults.particleStress.fps.toFixed(1} FPS
Effect Stress: ${benchmarkResults.effectStress.fps.toFixed(1} FPS
Animation Stress: ${benchmarkResults.animationStress.fps.toFixed(1} FPS`) }
    }

    private benchmarkParticles(): Promise<BenchmarkResult>;
        // パーティクルストレステスト
        const startTime = performance.now();
        let frameCount = 0;
        // 大量のパーティクル生成
        for(let, i = 0; i < 100; i++) {', ' }

            this.triggerBubbleEffect('normal'; }'
        }
        
        // 1秒間のFPS測定
        return new Promise((resolve) => {  const measureFrames = (): void => {
                frameCount++;
                if (performance.now() - startTime < 1000) { }
                    requestAnimationFrame(measureFrames); }
                } else { resolve({)
                        fps: frameCount,
                        duration: performance.now() - startTime 
    }
                }
            };
            requestAnimationFrame(measureFrames);
        }
    }
;
    private benchmarkEffects(): BenchmarkResult { // スクリーンエフェクトストレステスト
        const startTime = performance.now()','
        this.triggerScreenEffect('flash');
        this.triggerScreenEffect('shake),'
        
        return { fps: this.calculateFPS( }
            duration: performance.now() - startTime 
    }

    private benchmarkAnimations(): BenchmarkResult { // アニメーションストレステスト
        const startTime = performance.now();
        // 複数のアニメーションを同時実行
        for(let, i = 0, i < 20, i++) {', ' }

            this.triggerComboEffect('spectacular'; }'
        }
        
        return { fps: this.calculateFPS() ,
            duration: performance.now() - startTime 
    }

    public destroy(): void { this.stopMetricsUpdate();
        if (this.debugPanel?.parentNode) {
    
}
            this.debugPanel.parentNode.removeChild(this.debugPanel);     }
}
';'
// グローバルアクセス用（デバッグ目的）
(window, as any').EffectDebugInterface = EffectDebugInterface; : undefined'