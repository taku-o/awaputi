/**
 * AudioEffectManager.js
 * オーディオエフェクト管理システム
 * SoundEffectSystemから分離されたエフェクト管理機能
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { getConfigurationManager } from '../../core/ConfigurationManager.js';

export class AudioEffectManager {
    constructor(audioContext, sfxGainNode) {
        this.audioContext = audioContext;
        this.sfxGainNode = sfxGainNode;
        
        // AudioContextが利用できない場合は無効化
        if (!this.audioContext) {
            console.warn('[AudioEffectManager] AudioContext not available - effects disabled');
            this.disabled = true;
            return;
        }
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        
        // エフェクト管理
        this.effectNodes = new Map();
        this.activeEffects = new Set();
        this.effectChains = new Map();
        
        // 設定
        this.effectConfig = {
            enabled: true,
            quality: 'high', // 'low', 'medium', 'high'
            maxConcurrentEffects: 32,
            effectTypes: {
                reverb: { enabled: true, intensity: 0.3 },
                delay: { enabled: true, intensity: 0.2 },
                filter: { enabled: true, intensity: 0.5 },
                distortion: { enabled: true, intensity: 0.1 },
                chorus: { enabled: true, intensity: 0.2 },
                compressor: { enabled: true, intensity: 0.3 }
            }
        };
        
        // エフェクトバリエーション
        this.effectVariations = {
            bubble: {
                normal: { reverb: 0.1, filter: 200 },
                stone: { distortion: 0.2, filter: 150 },
                electric: { delay: 0.3, filter: 400 },
                rainbow: { chorus: 0.4, reverb: 0.3 }
            },
            ui: {
                click: { filter: 800, compression: 0.2 },
                hover: { reverb: 0.1, filter: 600 },
                success: { delay: 0.2, chorus: 0.3 },
                error: { distortion: 0.3, filter: 100 }
            },
            combo: {
                level1: { reverb: 0.1 },
                level2: { reverb: 0.2, delay: 0.1 },
                level3: { reverb: 0.3, delay: 0.2, chorus: 0.1 },
                level4: { reverb: 0.4, delay: 0.3, chorus: 0.2 },
                level5: { reverb: 0.5, delay: 0.4, chorus: 0.3, distortion: 0.1 }
            }
        };
        
        this.initializeEffects();
    }
    
    /**
     * エフェクトシステムを初期化
     */
    initializeEffects() {
        try {
            this.createEffectNodes();
            this.setupEffectChains();
            
            console.log('[AudioEffectManager] Audio effects initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioEffectManager.initializeEffects');
        }
    }
    
    /**
     * エフェクトノードを作成
     */
    createEffectNodes() {
        // リバーブエフェクト
        this.createReverbEffect();
        
        // ディレイエフェクト
        this.createDelayEffect();
        
        // フィルターエフェクト
        this.createFilterEffect();
        
        // ディストーションエフェクト
        this.createDistortionEffect();
        
        // コーラスエフェクト
        this.createChorusEffect();
        
        // コンプレッサーエフェクト
        this.createCompressorEffect();
    }
    
    /**
     * リバーブエフェクトを作成
     */
    createReverbEffect() {
        if (this.disabled || !this.audioContext) {
            console.warn('[AudioEffectManager] Cannot create reverb effect - audio context not available');
            return;
        }
        
        try {
            const convolver = this.audioContext.createConvolver();
            const sampleRate = this.audioContext.sampleRate || 44100; // Use AudioContext sample rate
            const impulseResponse = this.createImpulseResponse(2, sampleRate, false);
            convolver.buffer = impulseResponse;
            
            const wetGain = this.audioContext.createGain();
            const dryGain = this.audioContext.createGain();
            const outputGain = this.audioContext.createGain();
            
            wetGain.gain.value = 0.3;
            dryGain.gain.value = 0.7;
            
            this.effectNodes.set('reverb', {
                input: this.audioContext.createGain(),
                convolver,
                wetGain,
                dryGain,
                output: outputGain,
                type: 'reverb'
            });
            
            // ルーティング設定
            const reverbEffect = this.effectNodes.get('reverb');
            reverbEffect.input.connect(convolver);
            reverbEffect.input.connect(dryGain);
            convolver.connect(wetGain);
            wetGain.connect(outputGain);
            dryGain.connect(outputGain);
            
        } catch (error) {
            console.error('[AudioEffectManager] Failed to create reverb effect:', error);
            this.errorHandler.handleError(error, 'AUDIO_ERROR', {
                operation: 'createReverbEffect',
                component: 'AudioEffectManager',
                context: 'ConvolverNode buffer creation',
                sampleRate: this.audioContext.sampleRate
            });
            
            // Create a fallback bypass effect
            const inputGain = this.audioContext.createGain();
            const outputGain = this.audioContext.createGain();
            inputGain.connect(outputGain);
            
            this.effectNodes.set('reverb', {
                input: inputGain,
                output: outputGain,
                type: 'reverb',
                disabled: true
            });
        }
    }
    
    /**
     * インパルスレスポンスを作成
     */
    createImpulseResponse(duration, sampleRate, reverse) {
        try {
            // Ensure valid parameters
            const validSampleRate = Math.max(sampleRate, 8000); // Minimum sample rate
            const validDuration = Math.max(Math.min(duration, 60), 0.1); // Between 0.1 and 60 seconds
            const length = Math.floor(validSampleRate * validDuration);
            
            console.log(`[AudioEffectManager] Creating impulse response: sampleRate=${validSampleRate}, duration=${validDuration}, length=${length}`);
            
            const impulse = this.audioContext.createBuffer(2, length, validSampleRate);
            
            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    const n = reverse ? length - i : i;
                    channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, 2);
                }
            }
            
            return impulse;
        } catch (error) {
            console.error('[AudioEffectManager] Failed to create impulse response:', error);
            console.error('Parameters:', { duration, sampleRate, reverse });
            
            // Create a minimal fallback buffer
            try {
                const fallbackBuffer = this.audioContext.createBuffer(2, 1024, this.audioContext.sampleRate || 44100);
                return fallbackBuffer;
            } catch (fallbackError) {
                console.error('[AudioEffectManager] Fallback buffer creation also failed:', fallbackError);
                throw error; // Re-throw original error
            }
        }
    }
    
    /**
     * ディレイエフェクトを作成
     */
    createDelayEffect() {
        if (this.disabled || !this.audioContext) {
            console.warn('[AudioEffectManager] Cannot create delay effect - audio context not available');
            return;
        }
        
        const delay = this.audioContext.createDelay(1.0);
        const feedback = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        const outputGain = this.audioContext.createGain();
        
        delay.delayTime.value = 0.3;
        feedback.gain.value = 0.4;
        wetGain.gain.value = 0.3;
        dryGain.gain.value = 0.7;
        
        this.effectNodes.set('delay', {
            input: this.audioContext.createGain(),
            delay,
            feedback,
            wetGain,
            dryGain,
            output: outputGain,
            type: 'delay'
        });
        
        // ルーティング設定
        const delayEffect = this.effectNodes.get('delay');
        delayEffect.input.connect(delay);
        delayEffect.input.connect(dryGain);
        delay.connect(feedback);
        delay.connect(wetGain);
        feedback.connect(delay);
        wetGain.connect(outputGain);
        dryGain.connect(outputGain);
    }
    
    /**
     * フィルターエフェクトを作成
     */
    createFilterEffect() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1;
        
        this.effectNodes.set('filter', {
            input: filter,
            filter,
            output: filter,
            type: 'filter'
        });
    }
    
    /**
     * ディストーションエフェクトを作成
     */
    createDistortionEffect() {
        const waveshaper = this.audioContext.createWaveShaper();
        waveshaper.curve = this.createDistortionCurve(400);
        waveshaper.oversample = '4x';
        
        this.effectNodes.set('distortion', {
            input: waveshaper,
            waveshaper,
            output: waveshaper,
            type: 'distortion'
        });
    }
    
    /**
     * ディストーションカーブを作成
     */
    createDistortionCurve(amount) {
        const samples = Math.max(this.audioContext.sampleRate || 44100, 44100);
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        
        return curve;
    }
    
    /**
     * コーラスエフェクトを作成
     */
    createChorusEffect() {
        if (this.disabled || !this.audioContext) {
            console.warn('[AudioEffectManager] Cannot create chorus effect - audio context not available');
            return;
        }
        
        const delay = this.audioContext.createDelay(0.05);
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        const outputGain = this.audioContext.createGain();
        
        lfo.frequency.value = 0.5;
        lfoGain.gain.value = 0.01;
        delay.delayTime.value = 0.02;
        wetGain.gain.value = 0.5;
        dryGain.gain.value = 0.5;
        
        this.effectNodes.set('chorus', {
            input: this.audioContext.createGain(),
            delay,
            lfo,
            lfoGain,
            wetGain,
            dryGain,
            output: outputGain,
            type: 'chorus'
        });
        
        // ルーティング設定
        const chorusEffect = this.effectNodes.get('chorus');
        lfo.connect(lfoGain);
        lfoGain.connect(delay.delayTime);
        chorusEffect.input.connect(delay);
        chorusEffect.input.connect(dryGain);
        delay.connect(wetGain);
        wetGain.connect(outputGain);
        dryGain.connect(outputGain);
        
        lfo.start();
    }
    
    /**
     * コンプレッサーエフェクトを作成
     */
    createCompressorEffect() {
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        
        this.effectNodes.set('compressor', {
            input: compressor,
            compressor,
            output: compressor,
            type: 'compressor'
        });
    }
    
    /**
     * エフェクトチェーンを設定
     */
    setupEffectChains() {
        // 泡破壊音用チェーン
        this.effectChains.set('bubble', ['filter', 'reverb']);
        
        // UI音用チェーン
        this.effectChains.set('ui', ['filter', 'compressor']);
        
        // コンボ音用チェーン
        this.effectChains.set('combo', ['reverb', 'delay', 'chorus']);
        
        // 実績音用チェーン
        this.effectChains.set('achievement', ['reverb', 'delay']);
        
        // ゲーム状態音用チェーン
        this.effectChains.set('gamestate', ['filter', 'reverb']);
    }
    
    /**
     * エフェクトを適用
     */
    applyEffect(sourceNode, effectType, variation = {}) {
        try {
            const chain = this.effectChains.get(effectType) || [];
            let currentNode = sourceNode;
            const appliedNodes = [];
            
            for (const effectName of chain) {
                const effect = this.effectNodes.get(effectName);
                if (effect && this.effectConfig.effectTypes[effectName]?.enabled) {
                    // エフェクトパラメータを適用
                    this.applyEffectParameters(effect, effectName, variation);
                    
                    // 接続
                    currentNode.connect(effect.input);
                    currentNode = effect.output;
                    appliedNodes.push(effect);
                }
            }
            
            // 最終出力に接続
            currentNode.connect(this.sfxGainNode);
            
            // アクティブエフェクトとして追跡
            const effectInstance = {
                id: Date.now() + Math.random(),
                nodes: appliedNodes,
                type: effectType,
                startTime: this.audioContext.currentTime
            };
            
            this.activeEffects.add(effectInstance);
            
            return effectInstance;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioEffectManager.applyEffect');
            // フォールバック: 直接接続
            sourceNode.connect(this.sfxGainNode);
            return null;
        }
    }
    
    /**
     * エフェクトパラメータを適用
     */
    applyEffectParameters(effect, effectName, variation) {
        const config = this.effectConfig.effectTypes[effectName];
        const intensity = config.intensity;
        
        switch (effectName) {
            case 'reverb':
                if (effect.wetGain && variation.reverb !== undefined) {
                    effect.wetGain.gain.value = variation.reverb * intensity;
                    effect.dryGain.gain.value = 1 - (variation.reverb * intensity);
                }
                break;
                
            case 'delay':
                if (effect.delay && variation.delay !== undefined) {
                    effect.delay.delayTime.value = variation.delay * intensity;
                    effect.wetGain.gain.value = variation.delay * intensity * 0.5;
                }
                break;
                
            case 'filter':
                if (effect.filter && variation.filter !== undefined) {
                    effect.filter.frequency.value = variation.filter * intensity;
                }
                break;
                
            case 'distortion':
                if (effect.waveshaper && variation.distortion !== undefined) {
                    const amount = variation.distortion * intensity * 1000;
                    effect.waveshaper.curve = this.createDistortionCurve(amount);
                }
                break;
                
            case 'chorus':
                if (effect.wetGain && variation.chorus !== undefined) {
                    effect.wetGain.gain.value = variation.chorus * intensity;
                    effect.dryGain.gain.value = 1 - (variation.chorus * intensity);
                }
                break;
                
            case 'compressor':
                if (effect.compressor && variation.compression !== undefined) {
                    effect.compressor.ratio.value = 1 + (variation.compression * intensity * 20);
                }
                break;
        }
    }
    
    /**
     * エフェクトバリエーションを取得
     */
    getEffectVariation(category, type) {
        return this.effectVariations[category]?.[type] || {};
    }
    
    /**
     * エフェクトを停止
     */
    stopEffect(effectInstance) {
        if (effectInstance && this.activeEffects.has(effectInstance)) {
            try {
                // エフェクトノードを切断
                effectInstance.nodes.forEach(node => {
                    if (node.input && node.input.disconnect) {
                        node.input.disconnect();
                    }
                    if (node.output && node.output.disconnect) {
                        node.output.disconnect();
                    }
                });
                
                this.activeEffects.delete(effectInstance);
            } catch (error) {
                this.errorHandler.handleError(error, 'AudioEffectManager.stopEffect');
            }
        }
    }
    
    /**
     * 期限切れエフェクトをクリーンアップ
     */
    cleanupExpiredEffects() {
        const currentTime = this.audioContext.currentTime;
        const expiredEffects = [];
        
        this.activeEffects.forEach(effect => {
            // 5秒経過したエフェクトをクリーンアップ
            if (currentTime - effect.startTime > 5) {
                expiredEffects.push(effect);
            }
        });
        
        expiredEffects.forEach(effect => {
            this.stopEffect(effect);
        });
    }
    
    /**
     * エフェクト品質を設定
     */
    setEffectQuality(quality) {
        this.effectConfig.quality = quality;
        
        // 品質に基づいてエフェクトを調整
        switch (quality) {
            case 'low':
                this.effectConfig.maxConcurrentEffects = 16;
                this.effectConfig.effectTypes.reverb.enabled = false;
                this.effectConfig.effectTypes.chorus.enabled = false;
                break;
                
            case 'medium':
                this.effectConfig.maxConcurrentEffects = 24;
                this.effectConfig.effectTypes.reverb.enabled = true;
                this.effectConfig.effectTypes.chorus.enabled = false;
                break;
                
            case 'high':
                this.effectConfig.maxConcurrentEffects = 32;
                Object.keys(this.effectConfig.effectTypes).forEach(key => {
                    this.effectConfig.effectTypes[key].enabled = true;
                });
                break;
        }
        
        console.log(`[AudioEffectManager] Effect quality set to: ${quality}`);
    }
    
    /**
     * エフェクトタイプの有効/無効を切り替え
     */
    setEffectEnabled(effectType, enabled) {
        if (this.effectConfig.effectTypes[effectType]) {
            this.effectConfig.effectTypes[effectType].enabled = enabled;
            console.log(`[AudioEffectManager] ${effectType} effect ${enabled ? 'enabled' : 'disabled'}`);
        }
    }
    
    /**
     * エフェクト統計を取得
     */
    getEffectStatistics() {
        return {
            activeEffects: this.activeEffects.size,
            maxConcurrentEffects: this.effectConfig.maxConcurrentEffects,
            quality: this.effectConfig.quality,
            enabledEffects: Object.keys(this.effectConfig.effectTypes)
                .filter(key => this.effectConfig.effectTypes[key].enabled),
            effectTypes: Object.keys(this.effectNodes).length
        };
    }
    
    /**
     * エフェクトマネージャーを破棄
     */
    dispose() {
        try {
            // アクティブエフェクトを停止
            this.activeEffects.forEach(effect => {
                this.stopEffect(effect);
            });
            
            // エフェクトノードを切断
            this.effectNodes.forEach(effect => {
                if (effect.input && effect.input.disconnect) {
                    effect.input.disconnect();
                }
                if (effect.output && effect.output.disconnect) {
                    effect.output.disconnect();
                }
            });
            
            // クリーンアップ
            this.effectNodes.clear();
            this.activeEffects.clear();
            this.effectChains.clear();
            
            console.log('[AudioEffectManager] Audio effect manager disposed');
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioEffectManager.dispose');
        }
    }
}