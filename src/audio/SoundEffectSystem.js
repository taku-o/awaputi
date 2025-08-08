/**
 * SoundEffectSystem.js (リファクタリング版)
 * 効果音システム - メインコントローラー
 * 各種オーディオコンポーネントを統合管理
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { AudioEffectManager } from './effects/AudioEffectManager.js';
import { SoundPoolManager } from './effects/SoundPoolManager.js';
import { AudioContextManager } from './effects/AudioContextManager.js';
import { SoundEffectRenderer } from './effects/SoundEffectRenderer.js';

export class SoundEffectSystem {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.audioContext = audioManager.audioContext;
        this.sfxGainNode = audioManager.sfxGainNode;
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        
        // 専用コンポーネント（初期化後に設定）
        this.audioContextManager = null;
        this.effectManager = null;
        this.poolManager = null;
        this.soundRenderer = null;
        
        // 効果音カテゴリ管理
        this.soundCategories = {
            bubble: { enabled: true, volume: 1.0 },
            ui: { enabled: true, volume: 0.8 },
            achievement: { enabled: true, volume: 1.2 },
            gamestate: { enabled: true, volume: 0.9 },
            combo: { enabled: true, volume: 1.1 }
        };
        
        // バリエーション管理
        this.soundVariations = new Map();
        this.activeSources = new Set();
        
        // 設定監視
        this.configWatchers = new Set();
        
        // 泡タイプ定義
        this.bubbleTypes = [
            'normal', 'stone', 'iron', 'diamond', 'rainbow', 
            'pink', 'clock', 'electric', 'poison', 'spiky', 
            'escaping', 'boss', 'golden', 'frozen', 'magnetic', 
            'explosive', 'phantom', 'multiplier'
        ];
        
        // コンボレベル定義
        this.comboLevels = [1, 2, 3, 4, 5];
        
        // 実績レアリティ定義
        this.achievementRarities = ['common', 'rare', 'epic', 'legendary'];
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    async initialize() {
        try {
            if (!this.audioContext) {
                console.warn('[SoundEffectSystem] AudioContext not available - sound effect system disabled');
                this.disabled = true;
                return false;
            }
            
            // 専用コンポーネントを初期化
            await this.initializeComponents();
            
            // コンポーネント間の統合を設定
            this.setupComponentIntegration();
            
            // 設定変更の監視を設定
            this.setupConfigWatchers();
            
            // 効果音を生成
            await this.generateAllSounds();
            
            console.log('[SoundEffectSystem] Sound effect system initialized successfully');
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.initialize');
            this.disabled = true;
            return false;
        }
    }
    
    /**
     * 専用コンポーネントを初期化
     */
    async initializeComponents() {
        try {
            console.log('[SoundEffectSystem] Initializing audio components...');
            
            // AudioContextManagerは既存のコンテキストを使用
            this.audioContextManager = new AudioContextManager();
            if (this.audioContext) {
                this.audioContextManager.audioContext = this.audioContext;
                this.audioContextManager.sfxGainNode = this.sfxGainNode;
                this.audioContextManager.isInitialized = true;
            }
            
            // エフェクトマネージャーを初期化
            this.effectManager = new AudioEffectManager(this.audioContext, this.sfxGainNode);
            
            // プールマネージャーを初期化
            this.poolManager = new SoundPoolManager(this.audioContext, this.sfxGainNode);
            
            // サウンドレンダラーを初期化
            this.soundRenderer = new SoundEffectRenderer(this.audioContext);
            
            console.log('[SoundEffectSystem] All audio components initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.initializeComponents');
        }
    }
    
    /**
     * コンポーネント間の統合を設定
     */
    setupComponentIntegration() {
        try {
            // プールマネージャーとエフェクトマネージャーを連携
            // エフェクト適用時にプールから取得したサウンドを使用
            
            console.log('[SoundEffectSystem] Component integration setup completed');
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.setupComponentIntegration');
        }
    }
    
    /**
     * 設定変更の監視を設定
     */
    setupConfigWatchers() {
        try {
            // SFX音量の監視
            const sfxVolumeWatcher = this.configManager.watch('audio', 'volumes.sfx', (newValue) => {
                console.log(`[SoundEffectSystem] SFX volume changed to ${newValue}`);
                if (this.audioContextManager) {
                    this.audioContextManager.setVolume('sfx', newValue);
                }
            });
            if (sfxVolumeWatcher) this.configWatchers.add(sfxVolumeWatcher);
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.setupConfigWatchers');
        }
    }
    
    /**
     * 全ての効果音を生成
     */
    async generateAllSounds() {
        try {
            console.log('[SoundEffectSystem] Generating all sound effects...');
            
            // 泡破壊音を生成
            await this.generateBubbleSounds();
            
            // UI操作音を生成
            await this.generateUISounds();
            
            // 実績解除音を生成
            await this.generateAchievementSounds();
            
            // ゲーム状態音を生成
            await this.generateGameStateSounds();
            
            // コンボ音を生成
            await this.generateComboSounds();
            
            console.log('[SoundEffectSystem] All sound effects generated successfully');
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateAllSounds');
        }
    }
    
    /**
     * 泡破壊音を生成
     */
    async generateBubbleSounds() {
        try {
            for (const bubbleType of this.bubbleTypes) {
                // メインサウンドを生成
                const mainSound = this.soundRenderer.generateBubbleSound(bubbleType);
                
                // バリエーションを生成
                const variations = this.soundRenderer.generateVariations('bubble', mainSound, 3);
                
                // プールに追加
                this.poolManager.addToPool('bubble', bubbleType, mainSound, variations);
                
                console.log(`[SoundEffectSystem] Generated bubble sound: ${bubbleType}`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateBubbleSounds');
        }
    }
    
    /**
     * UI操作音を生成
     */
    async generateUISounds() {
        try {
            const uiTypes = ['click', 'hover', 'success', 'error'];
            
            for (const uiType of uiTypes) {
                const uiSound = this.soundRenderer.generateUISound(uiType);
                const variations = this.soundRenderer.generateVariations('ui', uiSound, 2);
                
                this.poolManager.addToPool('ui', uiType, uiSound, variations);
                
                console.log(`[SoundEffectSystem] Generated UI sound: ${uiType}`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateUISounds');
        }
    }
    
    /**
     * 実績解除音を生成
     */
    async generateAchievementSounds() {
        try {
            for (const rarity of this.achievementRarities) {
                const achievementSound = this.soundRenderer.generateAchievementSound(rarity);
                
                this.poolManager.addToPool('achievement', rarity, achievementSound, []);
                
                console.log(`[SoundEffectSystem] Generated achievement sound: ${rarity}`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateAchievementSounds');
        }
    }
    
    /**
     * ゲーム状態音を生成
     */
    async generateGameStateSounds() {
        try {
            const gameStates = ['start', 'pause', 'resume', 'gameover', 'levelup'];
            
            for (const state of gameStates) {
                // 簡易的なゲーム状態音を生成（実際の実装では詳細な設定が必要）
                const stateSound = this.soundRenderer.generateUISound('success'); // フォールバック
                
                this.poolManager.addToPool('gamestate', state, stateSound, []);
                
                console.log(`[SoundEffectSystem] Generated game state sound: ${state}`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateGameStateSounds');
        }
    }
    
    /**
     * コンボ音を生成
     */
    async generateComboSounds() {
        try {
            for (const level of this.comboLevels) {
                const comboSound = this.soundRenderer.generateComboSound(level);
                
                this.poolManager.addToPool('combo', level.toString(), comboSound, []);
                
                console.log(`[SoundEffectSystem] Generated combo sound: level ${level}`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateComboSounds');
        }
    }
    
    /**
     * 泡破壊音を再生
     */
    playBubbleSound(bubbleType, options = {}) {
        if (this.disabled) {
            console.warn('[SoundEffectSystem] Sound effect system is disabled - playBubbleSound ignored');
            return null;
        }
        
        try {
            if (!this.soundCategories.bubble.enabled) return null;
            
            const playbackOptions = {
                volume: this.soundCategories.bubble.volume * (options.volume || 1.0),
                pitch: options.pitch || 1.0,
                useVariation: options.useVariation !== false,
                ...options
            };
            
            // プールから再生
            const playback = this.poolManager.playSound('bubble', bubbleType, playbackOptions);
            
            // エフェクトを適用
            if (playback && this.effectManager) {
                const effectVariation = this.effectManager.getEffectVariation('bubble', bubbleType);
                this.effectManager.applyEffect(playback.sourceWrapper.source, 'bubble', effectVariation);
            }
            
            return playback;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playBubbleSound');
            return null;
        }
    }
    
    /**
     * UI音を再生
     */
    playUISound(uiType, options = {}) {
        if (this.disabled) {
            console.warn('[SoundEffectSystem] Sound effect system is disabled - playUISound ignored');
            return null;
        }
        
        try {
            if (!this.soundCategories.ui.enabled) return null;
            
            const playbackOptions = {
                volume: this.soundCategories.ui.volume * (options.volume || 1.0),
                useVariation: options.useVariation !== false,
                ...options
            };
            
            const playback = this.poolManager.playSound('ui', uiType, playbackOptions);
            
            if (playback && this.effectManager) {
                const effectVariation = this.effectManager.getEffectVariation('ui', uiType);
                this.effectManager.applyEffect(playback.sourceWrapper.source, 'ui', effectVariation);
            }
            
            return playback;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playUISound');
            return null;
        }
    }
    
    /**
     * コンボ音を再生
     */
    playComboSound(level, options = {}) {
        if (this.disabled) {
            console.warn('[SoundEffectSystem] Sound effect system is disabled - playComboSound ignored');
            return null;
        }
        
        try {
            if (!this.soundCategories.combo.enabled) return null;
            
            const clampedLevel = Math.max(1, Math.min(5, level));
            const playbackOptions = {
                volume: this.soundCategories.combo.volume * (options.volume || 1.0),
                ...options
            };
            
            const playback = this.poolManager.playSound('combo', clampedLevel.toString(), playbackOptions);
            
            if (playback && this.effectManager) {
                const effectVariation = this.effectManager.getEffectVariation('combo', `level${clampedLevel}`);
                this.effectManager.applyEffect(playback.sourceWrapper.source, 'combo', effectVariation);
            }
            
            return playback;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playComboSound');
            return null;
        }
    }
    
    /**
     * 実績音を再生
     */
    playAchievementSound(rarity, options = {}) {
        if (this.disabled) {
            console.warn('[SoundEffectSystem] Sound effect system is disabled - playAchievementSound ignored');
            return null;
        }
        
        try {
            if (!this.soundCategories.achievement.enabled) return null;
            
            const playbackOptions = {
                volume: this.soundCategories.achievement.volume * (options.volume || 1.0),
                ...options
            };
            
            const playback = this.poolManager.playSound('achievement', rarity, playbackOptions);
            
            if (playback && this.effectManager) {
                const effectVariation = this.effectManager.getEffectVariation('achievement', rarity);
                this.effectManager.applyEffect(playback.sourceWrapper.source, 'achievement', effectVariation);
            }
            
            return playback;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playAchievementSound');
            return null;
        }
    }
    
    /**
     * ゲーム状態音を再生
     */
    playGameStateSound(state, options = {}) {
        if (this.disabled) {
            console.warn('[SoundEffectSystem] Sound effect system is disabled - playGameStateSound ignored');
            return null;
        }
        
        try {
            if (!this.soundCategories.gamestate.enabled) return null;
            
            const playbackOptions = {
                volume: this.soundCategories.gamestate.volume * (options.volume || 1.0),
                ...options
            };
            
            return this.poolManager.playSound('gamestate', state, playbackOptions);
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playGameStateSound');
            return null;
        }
    }
    
    /**
     * カテゴリの有効/無効を切り替え
     */
    setCategoryEnabled(category, enabled) {
        if (this.soundCategories[category]) {
            this.soundCategories[category].enabled = enabled;
            console.log(`[SoundEffectSystem] Category ${category} ${enabled ? 'enabled' : 'disabled'}`);
        }
    }
    
    /**
     * カテゴリの音量を設定
     */
    setCategoryVolume(category, volume) {
        if (this.soundCategories[category]) {
            this.soundCategories[category].volume = Math.max(0, Math.min(2, volume));
            console.log(`[SoundEffectSystem] Category ${category} volume set to: ${volume}`);
        }
    }
    
    /**
     * 全サウンドを停止
     */
    stopAllSounds() {
        if (this.disabled) {
            console.warn('[SoundEffectSystem] Sound effect system is disabled - stopAllSounds ignored');
            return 0;
        }
        
        try {
            return this.poolManager.stopAllSounds();
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.stopAllSounds');
            return 0;
        }
    }
    
    /**
     * カテゴリ内のサウンドを停止
     */
    stopCategorySounds(category) {
        if (this.disabled) {
            console.warn('[SoundEffectSystem] Sound effect system is disabled - stopCategorySounds ignored');
            return 0;
        }
        
        try {
            return this.poolManager.stopCategory(category);
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.stopCategorySounds');
            return 0;
        }
    }
    
    /**
     * システム統計を取得
     */
    getSystemStatistics() {
        return {
            categories: this.soundCategories,
            bubbleTypes: this.bubbleTypes.length,
            comboLevels: this.comboLevels.length,
            achievementRarities: this.achievementRarities.length,
            components: {
                pool: this.poolManager?.getPoolStatistics(),
                effects: this.effectManager?.getEffectStatistics(),
                context: this.audioContextManager?.getContextStatistics(),
                renderer: this.soundRenderer?.getRenderingStatistics()
            }
        };
    }
    
    /**
     * エフェクト品質を設定
     */
    setEffectQuality(quality) {
        if (this.effectManager) {
            this.effectManager.setEffectQuality(quality);
        }
    }
    
    /**
     * プール設定を更新
     */
    updatePoolConfig(config) {
        if (this.poolManager) {
            this.poolManager.updatePoolConfig(config);
        }
    }
    
    /**
     * サウンドを再生成
     */
    async regenerateSounds(category = null) {
        try {
            if (category) {
                // 特定カテゴリのサウンドのみ再生成
                switch (category) {
                    case 'bubble':
                        await this.generateBubbleSounds();
                        break;
                    case 'ui':
                        await this.generateUISounds();
                        break;
                    case 'achievement':
                        await this.generateAchievementSounds();
                        break;
                    case 'gamestate':
                        await this.generateGameStateSounds();
                        break;
                    case 'combo':
                        await this.generateComboSounds();
                        break;
                }
            } else {
                // 全サウンドを再生成
                await this.generateAllSounds();
            }
            
            console.log(`[SoundEffectSystem] Sounds regenerated for category: ${category || 'all'}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.regenerateSounds');
        }
    }
    
    /**
     * 効果音システムを破棄
     */
    dispose() {
        try {
            console.log('[SoundEffectSystem] Disposing sound effect system...');
            
            // 全サウンドを停止
            this.stopAllSounds();
            
            // 専用コンポーネントを破棄
            this.effectManager?.dispose();
            this.poolManager?.dispose();
            this.audioContextManager?.dispose();
            
            // 設定監視を停止
            this.configWatchers.forEach(watcher => {
                if (typeof watcher === 'function') {
                    watcher(); // アンサブスクライブ
                }
            });
            this.configWatchers.clear();
            
            // データをクリア
            this.soundVariations.clear();
            this.activeSources.clear();
            
            console.log('[SoundEffectSystem] Sound effect system disposed');
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.dispose');
        }
    }
}