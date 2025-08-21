/**
 * SoundEffectSystem.ts (リファクタリング版)
 * 効果音システム - メインコントローラー
 * 各種オーディオコンポーネントを統合管理
 */

import { getErrorHandler } from '../utils/ErrorHandler',
import { getConfigurationManager } from '../core/ConfigurationManager',
import { AudioEffectManager } from './effects/AudioEffectManager',
import { SoundPoolManager } from './effects/SoundPoolManager',
import { AudioEffectContextManager } from './effects/AudioEffectContextManager',
import { SoundEffectRenderer } from './effects/SoundEffectRenderer',

/**
 * サウンドカテゴリ設定インターフェース
 */
interface SoundCategoryConfig {
    enabled: boolean,
    volume: number,
}

/**
 * 再生オプションインターフェース
 */
interface PlaybackOptions {
    volume?: number,
    pitch?: number,
    useVariation?: boolean,
    [key: string]: any,
}

/**
 * AudioManager インターフェース
 */
interface AudioManager {
    audioContext: AudioContext | null;
    sfxGainNode: GainNode | null;
}

/**
 * ConfigurationManager インターフェース（型定義用）
 */
interface ConfigurationManager {
    watch(category: string, path: string, callback: (value: any) => void): string | null;
}

/**
 * ErrorHandler インターフェース（型定義用）
 */
interface ErrorHandler {
    handleError(error: any, context: string, details?: any): void;
}

/**
 * システム統計インターフェース
 */
interface SystemStatistics {
    categories: { [key: string]: SoundCategoryConfig };
    bubbleTypes: number;
    comboLevels: number;
    achievementRarities: number;
    components: {
        pool?: any;
        effects?: any;
        context?: any;
        renderer?: any;
    };
}

/**
 * 泡タイプ
 */
type BubbleType = 'normal' | 'stone' | 'iron' | 'diamond' | 'rainbow' |
    'pink' | 'clock' | 'electric' | 'poison' | 'spiky' |
    'escaping' | 'boss' | 'golden' | 'frozen' | 'magnetic' |
    'explosive' | 'phantom' | 'multiplier',

/**
 * UIサウンドタイプ
 */
type UISoundType = 'click' | 'hover' | 'success' | 'error',

/**
 * 実績レアリティタイプ
 */
type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary',

/**
 * ゲーム状態タイプ
 */
type GameState = 'start' | 'pause' | 'resume' | 'gameover' | 'levelup',

/**
 * サウンドカテゴリタイプ
 */
type SoundCategory = 'bubble' | 'ui' | 'achievement' | 'gamestate' | 'combo',

export class SoundEffectSystem {
    private audioManager: AudioManager;
    private audioContext: AudioContext | null;
    private sfxGainNode: GainNode | null;
    private configManager: ConfigurationManager;
    private errorHandler: ErrorHandler;
    
    // 専用コンポーネント（初期化後に設定）
    private audioContextManager: AudioEffectContextManager | null;
    private effectManager: AudioEffectManager | null;
    private poolManager: SoundPoolManager | null;
    private soundRenderer: SoundEffectRenderer | null;
    
    // 効果音カテゴリ管理
    private soundCategories: { [key in SoundCategory]: SoundCategoryConfig };
    
    // バリエーション管理
    private soundVariations: Map<string, any>;
    private activeSources: Set<any>;
    
    // 設定監視
    private configWatchers: Set<string | (() => void)>;
    
    // 泡タイプ定義
    private readonly bubbleTypes: BubbleType[];
    
    // コンボレベル定義
    private readonly comboLevels: number[];
    
    // 実績レアリティ定義
    private readonly achievementRarities: AchievementRarity[];
    
    // 無効化フラグ
    private disabled: boolean;

    constructor(audioManager: AudioManager) {
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
        
        // 無効化フラグ
        this.disabled = false;
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    async initialize(): Promise<boolean> {
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
    private async initializeComponents(): Promise<void> {
        try {
            console.log('[SoundEffectSystem] Initializing audio components...');
            
            // AudioContextManagerは既存のコンテキストを使用
            this.audioContextManager = new AudioEffectContextManager();
            if (this.audioContext && this.sfxGainNode) {
                (this.audioContextManager as any).audioContext = this.audioContext;
                (this.audioContextManager as any).sfxGainNode = this.sfxGainNode;
                (this.audioContextManager as any).isInitialized = true;
            }
            
            // エフェクトマネージャーを初期化
            if (this.audioContext && this.sfxGainNode) {
                this.effectManager = new AudioEffectManager(this.audioContext, this.sfxGainNode);
            }
            
            // プールマネージャーを初期化
            if (this.audioContext && this.sfxGainNode) {
                this.poolManager = new SoundPoolManager(this.audioContext, this.sfxGainNode);
            }
            
            // サウンドレンダラーを初期化
            if (this.audioContext) {
                this.soundRenderer = new SoundEffectRenderer(this.audioContext);
            }

            console.log('[SoundEffectSystem] All audio components initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.initializeComponents');
        }
    }
    
    /**
     * コンポーネント間の統合を設定
     */
    private setupComponentIntegration(): void {
        try {
            console.log('[SoundEffectSystem] Component integration setup completed');
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.setupComponentIntegration');
        }
    }
    
    /**
     * 設定変更の監視を設定
     */
    private setupConfigWatchers(): void {
        try {
            const sfxVolumeWatcher = this.configManager.watch('audio', 'volumes.sfx', (newValue) => {
                console.log(`[SoundEffectSystem] SFX volume changed to ${newValue}`);
                if (this.audioContextManager) {
                    (this.audioContextManager as any).setVolume('sfx', newValue);
                }
            });

            if (sfxVolumeWatcher) {
                this.configWatchers.add(sfxVolumeWatcher);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.setupConfigWatchers');
        }
    }
    
    /**
     * 全ての効果音を生成
     */
    private async generateAllSounds(): Promise<void> {
        try {
            console.log('[SoundEffectSystem] Generating all sound effects...');
            
            // 泡タイプ別効果音を生成
            await this.generateBubbleSounds();
            
            // UI効果音を生成
            await this.generateUISounds();
            
            // 実績効果音を生成
            await this.generateAchievementSounds();
            
            // ゲーム状態効果音を生成
            await this.generateGameStateSounds();
            
            // コンボ効果音を生成
            await this.generateComboSounds();
            
            console.log('[SoundEffectSystem] All sound effects generated');
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateAllSounds');
        }
    }
    
    /**
     * 泡タイプ別効果音を生成
     */
    private async generateBubbleSounds(): Promise<void> {
        try {
            if (!this.soundRenderer) return;
            
            for (const bubbleType of this.bubbleTypes) {
                const soundId = `bubble_${bubbleType}`;
                const variations = await this.generateBubbleVariations(bubbleType);
                this.soundVariations.set(soundId, variations);
            }
            
            console.log(`[SoundEffectSystem] Generated sounds for ${this.bubbleTypes.length} bubble types`);
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateBubbleSounds');
        }
    }
    
    /**
     * 泡タイプのバリエーションを生成
     */
    private async generateBubbleVariations(bubbleType: BubbleType): Promise<any[]> {
        const variations = []
        const variationCount = this.getBubbleVariationCount(bubbleType);
        
        for (let i = 0; i < variationCount; i++) {
            const variation = await this.createBubbleSound(bubbleType, i);
            variations.push(variation);
        }
        
        return variations;
    }
    
    /**
     * 泡タイプのバリエーション数を取得
     */
    private getBubbleVariationCount(bubbleType: BubbleType): number {
        const variationCounts: { [key in BubbleType]: number } = {
            'normal': 3;
            'stone': 2;
            'iron': 2;
            'diamond': 3;
            'rainbow': 4;
            'pink': 3;
            'clock': 2;
            'electric': 3;
            'poison': 2;
            'spiky': 2;
            'escaping': 3;
            'boss': 4;
            'golden': 3;
            'frozen': 2;
            'magnetic': 2;
            'explosive': 3;
            'phantom': 2;
            'multiplier': 3
        }
        
        return variationCounts[bubbleType] || 2;
    }
    
    /**
     * 泡の効果音を作成
     */
    private async createBubbleSound(bubbleType: BubbleType, variation: number): Promise<any> {
        if (!this.soundRenderer) return null;
        
        const soundParams = this.getBubbleSoundParams(bubbleType, variation);
        return await this.soundRenderer.createSound(soundParams);
    }
    
    /**
     * 泡の効果音パラメータを取得
     */
    private getBubbleSoundParams(bubbleType: BubbleType, variation: number): any {
        const baseParams = {
            frequency: 440;
            duration: 0.2;
            type: 'sine' as OscillatorType;
            volume: 0.5
        }
        
        // 泡タイプ別のパラメータ調整
        switch (bubbleType) {
            case 'normal':
                return {
                    ...baseParams;
                    frequency: 440 + (variation * 50);
                    duration: 0.15
                }
            case 'stone':
                return {
                    ...baseParams;
                    frequency: 200 + (variation * 30);
                    type: 'square' as OscillatorType;
                    duration: 0.3
                }
            case 'diamond':
                return {
                    ...baseParams;
                    frequency: 800 + (variation * 100);
                    duration: 0.25;
                    volume: 0.7
                }
            case 'electric':
                return {
                    ...baseParams;
                    frequency: 1000 + (variation * 200);
                    type: 'sawtooth' as OscillatorType;
                    duration: 0.1
                }
            default:
                return {
                    ...baseParams;
                    frequency: baseParams.frequency + (variation * 50)
                }
        }
    }
    
    /**
     * UI効果音を生成
     */
    private async generateUISounds(): Promise<void> {
        try {
            if (!this.soundRenderer) return;
            
            const uiSounds: UISoundType[] = ['click', 'hover', 'success', 'error']
            
            for (const soundType of uiSounds) {
                const soundId = `ui_${soundType}`;
                const sound = await this.createUISound(soundType);
                this.soundVariations.set(soundId, [sound]);
            }
            
            console.log(`[SoundEffectSystem] Generated ${uiSounds.length} UI sounds`);
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateUISounds');
        }
    }
    
    /**
     * UI効果音を作成
     */
    private async createUISound(soundType: UISoundType): Promise<any> {
        if (!this.soundRenderer) return null;
        
        const soundParams = this.getUISoundParams(soundType);
        return await this.soundRenderer.createSound(soundParams);
    }
    
    /**
     * UI効果音パラメータを取得
     */
    private getUISoundParams(soundType: UISoundType): any {
        const baseParams = {
            frequency: 440;
            duration: 0.1;
            type: 'sine' as OscillatorType;
            volume: 0.3
        }
        
        switch (soundType) {
            case 'click':
                return {
                    ...baseParams;
                    frequency: 600;
                    duration: 0.05
                }
            case 'hover':
                return {
                    ...baseParams;
                    frequency: 400;
                    duration: 0.03;
                    volume: 0.2
                }
            case 'success':
                return {
                    ...baseParams;
                    frequency: 800;
                    duration: 0.2;
                    volume: 0.5
                }
            case 'error':
                return {
                    ...baseParams;
                    frequency: 200;
                    type: 'square' as OscillatorType;
                    duration: 0.3;
                    volume: 0.4
                }
        }
    }
    
    /**
     * 実績効果音を生成
     */
    private async generateAchievementSounds(): Promise<void> {
        try {
            if (!this.soundRenderer) return;
            
            for (const rarity of this.achievementRarities) {
                const soundId = `achievement_${rarity}`;
                const sound = await this.createAchievementSound(rarity);
                this.soundVariations.set(soundId, [sound]);
            }
            
            console.log(`[SoundEffectSystem] Generated ${this.achievementRarities.length} achievement sounds`);
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateAchievementSounds');
        }
    }
    
    /**
     * 実績効果音を作成
     */
    private async createAchievementSound(rarity: AchievementRarity): Promise<any> {
        if (!this.soundRenderer) return null;
        
        const soundParams = this.getAchievementSoundParams(rarity);
        return await this.soundRenderer.createSound(soundParams);
    }
    
    /**
     * 実績効果音パラメータを取得
     */
    private getAchievementSoundParams(rarity: AchievementRarity): any {
        const baseParams = {
            frequency: 440;
            duration: 0.5;
            type: 'sine' as OscillatorType;
            volume: 0.6
        }
        
        switch (rarity) {
            case 'common':
                return {
                    ...baseParams;
                    frequency: 500;
                    duration: 0.3
                }
            case 'rare':
                return {
                    ...baseParams;
                    frequency: 650;
                    duration: 0.4
                }
            case 'epic':
                return {
                    ...baseParams;
                    frequency: 800;
                    duration: 0.6
                }
            case 'legendary':
                return {
                    ...baseParams;
                    frequency: 1000;
                    duration: 0.8;
                    volume: 0.8
                }
        }
    }
    
    /**
     * ゲーム状態効果音を生成
     */
    private async generateGameStateSounds(): Promise<void> {
        try {
            if (!this.soundRenderer) return;
            
            const gameStates: GameState[] = ['start', 'pause', 'resume', 'gameover', 'levelup']
            
            for (const state of gameStates) {
                const soundId = `gamestate_${state}`;
                const sound = await this.createGameStateSound(state);
                this.soundVariations.set(soundId, [sound]);
            }
            
            console.log(`[SoundEffectSystem] Generated ${gameStates.length} game state sounds`);
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateGameStateSounds');
        }
    }
    
    /**
     * ゲーム状態効果音を作成
     */
    private async createGameStateSound(state: GameState): Promise<any> {
        if (!this.soundRenderer) return null;
        
        const soundParams = this.getGameStateSoundParams(state);
        return await this.soundRenderer.createSound(soundParams);
    }
    
    /**
     * ゲーム状態効果音パラメータを取得
     */
    private getGameStateSoundParams(state: GameState): any {
        const baseParams = {
            frequency: 440;
            duration: 0.4;
            type: 'sine' as OscillatorType;
            volume: 0.5
        }
        
        switch (state) {
            case 'start':
                return {
                    ...baseParams;
                    frequency: 523, // C note
                    duration: 0.6
                }
            case 'pause':
                return {
                    ...baseParams;
                    frequency: 349, // F note
                    duration: 0.3
                }
            case 'resume':
                return {
                    ...baseParams;
                    frequency: 392, // G note
                    duration: 0.4
                }
            case 'gameover':
                return {
                    ...baseParams;
                    frequency: 261, // Low C
                    duration: 0.8;
                    type: 'triangle' as OscillatorType
                }
            case 'levelup':
                return {
                    ...baseParams;
                    frequency: 659, // E note
                    duration: 0.7;
                    volume: 0.7
                }
        }
    }
    
    /**
     * コンボ効果音を生成
     */
    private async generateComboSounds(): Promise<void> {
        try {
            if (!this.soundRenderer) return;
            
            for (const level of this.comboLevels) {
                const soundId = `combo_${level}`;
                const sound = await this.createComboSound(level);
                this.soundVariations.set(soundId, [sound]);
            }
            
            console.log(`[SoundEffectSystem] Generated ${this.comboLevels.length} combo sounds`);
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateComboSounds');
        }
    }
    
    /**
     * コンボ効果音を作成
     */
    private async createComboSound(level: number): Promise<any> {
        if (!this.soundRenderer) return null;
        
        const soundParams = this.getComboSoundParams(level);
        return await this.soundRenderer.createSound(soundParams);
    }
    
    /**
     * コンボ効果音パラメータを取得
     */
    private getComboSoundParams(level: number): any {
        return {
            frequency: 440 + (level * 100);
            duration: 0.2 + (level * 0.05);
            type: 'sine' as OscillatorType;
            volume: 0.4 + (level * 0.1)
        }
    }
    
    /**
     * 泡効果音を再生
     */
    playBubbleSound(bubbleType: BubbleType, options?: PlaybackOptions): void {
        if (this.disabled || !this.soundCategories.bubble.enabled) return;
        
        try {
            const soundId = `bubble_${bubbleType}`;
            const variations = this.soundVariations.get(soundId);
            
            if (variations && variations.length > 0) {
                const variation = options?.useVariation !== false 
                    ? variations[Math.floor(Math.random() * variations.length)]
                    : variations[0]
                
                this.playSound(variation, 'bubble', options);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playBubbleSound', { bubbleType, options });
        }
    }
    
    /**
     * UI効果音を再生
     */
    playUISound(soundType: UISoundType, options?: PlaybackOptions): void {
        if (this.disabled || !this.soundCategories.ui.enabled) return;
        
        try {
            const soundId = `ui_${soundType}`;
            const variations = this.soundVariations.get(soundId);
            
            if (variations && variations.length > 0) {
                this.playSound(variations[0], 'ui', options);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playUISound', { soundType, options });
        }
    }
    
    /**
     * 実績効果音を再生
     */
    playAchievementSound(rarity: AchievementRarity, options?: PlaybackOptions): void {
        if (this.disabled || !this.soundCategories.achievement.enabled) return;
        
        try {
            const soundId = `achievement_${rarity}`;
            const variations = this.soundVariations.get(soundId);
            
            if (variations && variations.length > 0) {
                this.playSound(variations[0], 'achievement', options);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playAchievementSound', { rarity, options });
        }
    }
    
    /**
     * ゲーム状態効果音を再生
     */
    playGameStateSound(state: GameState, options?: PlaybackOptions): void {
        if (this.disabled || !this.soundCategories.gamestate.enabled) return;
        
        try {
            const soundId = `gamestate_${state}`;
            const variations = this.soundVariations.get(soundId);
            
            if (variations && variations.length > 0) {
                this.playSound(variations[0], 'gamestate', options);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playGameStateSound', { state, options });
        }
    }
    
    /**
     * コンボ効果音を再生
     */
    playComboSound(level: number, options?: PlaybackOptions): void {
        if (this.disabled || !this.soundCategories.combo.enabled) return;
        
        try {
            const soundId = `combo_${level}`;
            const variations = this.soundVariations.get(soundId);
            
            if (variations && variations.length > 0) {
                this.playSound(variations[0], 'combo', options);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playComboSound', { level, options });
        }
    }
    
    /**
     * 効果音を再生
     */
    private playSound(sound: any, category: SoundCategory, options?: PlaybackOptions): void {
        if (!this.poolManager || !sound) return;
        
        try {
            const categoryConfig = this.soundCategories[category]
            const volume = (options?.volume ?? 1.0) * categoryConfig.volume;
            const pitch = options?.pitch ?? 1.0;
            
            const playbackOptions = {
                ...options;
                volume;
                pitch
            }
            
            const source = this.poolManager.playSound(sound, playbackOptions);
            if (source) {
                this.activeSources.add(source);
                source.onended = () => {
                    this.activeSources.delete(source);
                }
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playSound', { category, options });
        }
    }
    
    /**
     * カテゴリ音量を設定
     */
    setCategoryVolume(category: SoundCategory, volume: number): void {
        if (this.soundCategories[category]) {
            this.soundCategories[category].volume = Math.max(0, Math.min(1, volume));
        }
    }
    
    /**
     * カテゴリを有効/無効化
     */
    setCategoryEnabled(category: SoundCategory, enabled: boolean): void {
        if (this.soundCategories[category]) {
            this.soundCategories[category].enabled = enabled;
        }
    }
    
    /**
     * 全ての効果音を停止
     */
    stopAllSounds(): void {
        try {
            for (const source of this.activeSources) {
                if (source.stop) {
                    source.stop();
                }
            }
            this.activeSources.clear();
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.stopAllSounds');
        }
    }
    
    /**
     * システム統計を取得
     */
    getSystemStatistics(): SystemStatistics {
        return {
            categories: { ...this.soundCategories }
            bubbleTypes: this.bubbleTypes.length;
            comboLevels: this.comboLevels.length;
            achievementRarities: this.achievementRarities.length;
            components: {
                pool: this.poolManager;
                effects: this.effectManager;
                context: this.audioContextManager;
                renderer: this.soundRenderer
            }
        }
    }
    
    /**
     * リソースを解放
     */
    dispose(): void {
        try {
            // 全ての効果音を停止
            this.stopAllSounds();
            
            // 設定監視を解除
            for (const watcher of this.configWatchers) {
                if (typeof watcher === 'function') {
                    watcher();
                }
            }
            this.configWatchers.clear();
            
            // コンポーネントを解放
            if (this.poolManager) {
                this.poolManager.dispose?.();
            }
            if (this.effectManager) {
                this.effectManager.dispose?.();
            }
            if (this.soundRenderer) {
                this.soundRenderer.dispose?.();
            }
            if (this.audioContextManager) {
                this.audioContextManager.dispose?.();
            }
            
            // バリエーションをクリア
            this.soundVariations.clear();
            
            console.log('[SoundEffectSystem] Disposed');
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.dispose');
        }
    }
}