/**
 * SoundEffectSystem.ts (リファクタリング版)
 * 効果音システム - メインコントローラー
 * 各種オーディオコンポーネントを統合管理
 */

import { getErrorHandler  } from '../utils/ErrorHandler';
import { getConfigurationManager  } from '../core/ConfigurationManager';
import { AudioEffectManager  } from './effects/AudioEffectManager';
import { SoundPoolManager  } from './effects/SoundPoolManager';
import { AudioEffectContextManager  } from './effects/AudioEffectContextManager';
import { SoundEffectRenderer  } from './effects/SoundEffectRenderer';

/**
 * サウンドカテゴリ設定インターフェース
 */
interface SoundCategoryConfig { enabled: boolean,
    volume: number;

/**
 * 再生オプションインターフェース
 */
interface PlaybackOptions { volume?: number,
    pitch?: number;
    useVariation?: boolean;
    [key: string]: any;

/**
 * AudioManager インターフェース
 */
interface AudioManager { audioContext: AudioContext | null,
    sfxGainNode: GainNode | null  }

/**
 * ConfigurationManager インターフェース（型定義用）
 */
interface ConfigurationManager { watch(category: string, path: string, callback: (value: any) => void): string | null  }
}

/**
 * ErrorHandler インターフェース（型定義用）
 */'
interface ErrorHandler { ''
    handleError(error: any, context: string, details?: any): void;

/**
 * システム統計インターフェース
 */
interface SystemStatistics {
    categories: { [ke,y: string]: SoundCategoryConfig,
    bubbleTypes: number,
    comboLevels: number,
    achievementRarities: number,
    components: { pool?: any,
        effects?: any;
        context?: any;
        renderer?: any;

/**
 * 泡タイプ'
 */''
type BubbleType = 'normal' | 'stone' | 'iron' | 'diamond' | 'rainbow' |';'
    'pink' | 'clock' | 'electric' | 'poison' | 'spiky' |';'
    'escaping' | 'boss' | 'golden' | 'frozen' | 'magnetic' |';'
    'explosive' | 'phantom' | 'multiplier';

/**
 * UIサウンドタイプ'
 */''
type UISoundType = 'click' | 'hover' | 'success' | 'error';

/**
 * 実績レアリティタイプ'
 */''
type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * ゲーム状態タイプ'
 */''
type GameState = 'start' | 'pause' | 'resume' | 'gameover' | 'levelup';

/**
 * サウンドカテゴリタイプ'
 */''
type SoundCategory = 'bubble' | 'ui' | 'achievement' | 'gamestate' | 'combo';

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
    private, soundRenderer: SoundEffectRenderer | null;
    // 効果音カテゴリ管理 }
    private soundCategories: { [key in SoundCategory]: SoundCategoryConfig,
    // バリエーション管理
    private soundVariations: Map<string, any>;
    private activeSources: Set<any>,
    // 設定監視
    private configWatchers: Set<string | (() => void)>,
    
    // 泡タイプ定義
    private readonly bubbleTypes: BubbleType[],
    
    // コンボレベル定義
    private readonly comboLevels: number[],
    
    // 実績レアリティ定義
    private readonly achievementRarities: AchievementRarity[],
    
    // 無効化フラグ
    private disabled: boolean,
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

    }
        this.soundCategories = { }
            bubble: { enabled: true, volume: 1.0  };
            ui: { enabled: true, volume: 0.8  };
            achievement: { enabled: true, volume: 1.2  };
            gamestate: { enabled: true, volume: 0.9  };
            combo: { enabled: true, volume: 1.1  };
        
        // バリエーション管理
        this.soundVariations = new Map();
        this.activeSources = new Set();
        // 設定監視
        this.configWatchers = new Set('';
            'normal', 'stone', 'iron', 'diamond', 'rainbow';
            'pink', 'clock', 'electric', 'poison', 'spiky';
            'escaping', 'boss', 'golden', 'frozen', 'magnetic';
            'explosive', 'phantom', 'multiplier';
        ];
        
        // コンボレベル定義
        this.comboLevels = [1, 2, 3, 4, 5];
        // 実績レアリティ定義
        this.achievementRarities = ['common', 'rare', 'epic', 'legendary'];
        
        // 無効化フラグ
        this.disabled = false;
        );
        this.initialize();
    }
    
    /**
     * 初期化
     */
    async initialize(): Promise<boolean> { try {'
            if (!this.audioContext) {

                console.warn('[SoundEffectSystem] AudioContext, not available - sound effect system disabled),'
                this.disabled = true }
                return false;
            
            // 専用コンポーネントを初期化
            await this.initializeComponents();
            
            // コンポーネント間の統合を設定
            this.setupComponentIntegration();
            
            // 設定変更の監視を設定
            this.setupConfigWatchers();
            // 効果音を生成
            await this.generateAllSounds();

            console.log('[SoundEffectSystem] Sound, effect system, initialized successfully');

            return true;} catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.initialize',
            this.disabled = true;
            return false,
    
    /**
     * 専用コンポーネントを初期化'
     */''
    private async initializeComponents()','
            console.log('[SoundEffectSystem] Initializing, audio components...),'
            
            // AudioContextManagerは既存のコンテキストを使用
            this.audioContextManager = new AudioEffectContextManager();
            if (this.audioContext && this.sfxGainNode) {
                (this.audioContextManager, as any).audioContext = this.audioContext,
                (this.audioContextManager, as any).sfxGainNode = this.sfxGainNode }
                (this.audioContextManager, as any).isInitialized = true; }
            }
            
            // エフェクトマネージャーを初期化
            if (this.audioContext && this.sfxGainNode) { this.effectManager = new AudioEffectManager(this.audioContext this.sfxGainNode) }
            
            // プールマネージャーを初期化
            if (this.audioContext && this.sfxGainNode) { this.poolManager = new SoundPoolManager(this.audioContext this.sfxGainNode') }'
            
            // サウンドレンダラーを初期化
            if (this.audioContext') { }'

                this.soundRenderer = new SoundEffectRenderer(this.audioContext); }
            }

            console.log('[SoundEffectSystem] All, audio components, initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.initializeComponents' }'
    }
    
    /**
     * コンポーネント間の統合を設定'
     */''
    private setupComponentIntegration()';'
            console.log('[SoundEffectSystem] Component, integration setup, completed');
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.setupComponentIntegration' }'
    }
    
    /**
     * 設定変更の監視を設定'
     */''
    private setupConfigWatchers()';'
            const sfxVolumeWatcher = this.configManager.watch('audio', 'volumes.sfx', (newValue) => {  }
                console.log(`[SoundEffectSystem] SFX, volume changed, to ${newValue}`);
                if (this.audioContextManager) {', ' }

                    (this.audioContextManager, as any').setVolume('sfx', newValue); }'
};

            if (sfxVolumeWatcher) this.configWatchers.add(sfxVolumeWatcher);'} catch (error) {'
            this.errorHandler.handleError(error, 'SoundEffectSystem.setupConfigWatchers' }'
    }
    
    /**
     * 全ての効果音を生成'
     */''
    private async generateAllSounds()';'
            console.log('[SoundEffectSystem] Generating all sound effects...);'
            
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

            console.log('[SoundEffectSystem] All, sound effects, generated successfully');
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateAllSounds' }'
    }
    
    /**
     * 泡破壊音を生成
     */
    private async generateBubbleSounds(): Promise<void> { try {
            if (!this.soundRenderer || !this.poolManager) return,

            for (const bubbleType of this.bubbleTypes) {

                // メインサウンドを生成
                const mainSound = (this.soundRenderer, as any).generateBubbleSound(bubbleType),
                // バリエーションを生成
                const variations = (this.soundRenderer, as any').generateVariations('bubble', mainSound, 3',
                ','
                // プールに追加
                (this.poolManager, as any').addToPool('bubble', bubbleType, mainSound, variations) }'

                console.log(`[SoundEffectSystem] Generated, bubble sound: ${bubbleType}`});
            } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateBubbleSounds' }'
    }
    
    /**
     * UI操作音を生成
     */'
    private async generateUISounds(): Promise<void> { try {'
            if(!this.soundRenderer || !this.poolManager) return,

            const uiTypes: UISoundType[] = ['click', 'hover', 'success', 'error'],
            
            for (const uiType of uiTypes) {
            ','

                const uiSound = (this.soundRenderer, as any).generateUISound(uiType),
                const variations = (this.soundRenderer, as any').generateVariations('ui', uiSound, 2',

                (this.poolManager, as any').addToPool('ui', uiType, uiSound, variations) }'

                console.log(`[SoundEffectSystem] Generated, UI sound: ${uiType}`});
            } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateUISounds' }'
    }
    
    /**
     * 実績解除音を生成
     */
    private async generateAchievementSounds(): Promise<void> { try {
            if (!this.soundRenderer || !this.poolManager) return,

            for (const rarity of this.achievementRarities) {

                const achievementSound = (this.soundRenderer, as any).generateAchievementSound(rarity),

                (this.poolManager, as any').addToPool('achievement', rarity, achievementSound, []) }'

                console.log(`[SoundEffectSystem] Generated, achievement sound: ${rarity}`});
            } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateAchievementSounds' }'
    }
    
    /**
     * ゲーム状態音を生成
     */'
    private async generateGameStateSounds(): Promise<void> { try {'
            if(!this.soundRenderer || !this.poolManager) return,

            const gameStates: GameState[] = ['start', 'pause', 'resume', 'gameover', 'levelup'],
            
            for (const state of gameStates) {
            ','
                // 簡易的なゲーム状態音を生成（実際の実装では詳細な設定が必要）
                const stateSound = (this.soundRenderer, as any').generateUISound('success', // フォールバック'

                (this.poolManager, as any').addToPool('gamestate', state, stateSound, []) }'

                console.log(`[SoundEffectSystem] Generated, game state, sound: ${state}`});
            } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateGameStateSounds' }'
    }
    
    /**
     * コンボ音を生成
     */
    private async generateComboSounds(): Promise<void> { try {
            if (!this.soundRenderer || !this.poolManager) return,

            for (const level of this.comboLevels) {

                const comboSound = (this.soundRenderer, as any).generateComboSound(level),

                (this.poolManager, as any').addToPool('combo', level.toString(), comboSound, []) }'

                console.log(`[SoundEffectSystem] Generated, combo sound: level ${level}`});
            } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.generateComboSounds' }'
    }
    
    /**
     * 泡破壊音を再生
     */'
    playBubbleSound(bubbleType: BubbleType, options: PlaybackOptions = {}): any { ''
        if (this.disabled) {

            console.warn('[SoundEffectSystem] Sound, effect system is disabled - playBubbleSound ignored') }
            return null;
        
        try { if (!this.soundCategories.bubble.enabled) return null,
            
            const playbackOptions = {
                volume: this.soundCategories.bubble.volume * (options.volume || 1.0
                pitch: options.pitch || 1.0,
    useVariation: options.useVariation !== false'),'
                ...options,
            ','
            // プールから再生
            const playback = this.poolManager ? (this.poolManager, as any').playSound('bubble', bubbleType, playbackOptions) : null,'
            
            // エフェクトを適用
            if (playback && this.effectManager) {

                const effectVariation = (this.effectManager, as any').getEffectVariation('bubble', bubbleType' }

                (this.effectManager, as any').applyEffect(playback.sourceWrapper.source, 'bubble', effectVariation); }'
            }
            
            return playback;

        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playBubbleSound',
            return null,
    
    /**
     * UI音を再生
     */'
    playUISound(uiType: UISoundType, options: PlaybackOptions = { }): any { ''
        if (this.disabled) {

            console.warn('[SoundEffectSystem] Sound, effect system is disabled - playUISound ignored') }
            return null;
        
        try { if (!this.soundCategories.ui.enabled) return null,
            
            const playbackOptions = {
                volume: this.soundCategories.ui.volume * (options.volume || 1.0,
    useVariation: options.useVariation !== false'),'
                ...options,

            const playback = this.poolManager ? (this.poolManager, as any').playSound('ui', uiType, playbackOptions) : null,'
            
            if (playback && this.effectManager) {
            ','

                const effectVariation = (this.effectManager, as any').getEffectVariation('ui', uiType' }

                (this.effectManager, as any').applyEffect(playback.sourceWrapper.source, 'ui', effectVariation); }'
            }
            
            return playback;

        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playUISound',
            return null,
    
    /**
     * コンボ音を再生
     */'
    playComboSound(level: number, options: PlaybackOptions = { }): any { ''
        if (this.disabled) {

            console.warn('[SoundEffectSystem] Sound, effect system, is disabled - playComboSound, ignored) }'
            return null;
        
        try { if (!this.soundCategories.combo.enabled) return null,
            
            const clampedLevel = Math.max(1 Math.min(5 level'),'
            const playbackOptions = {
                volume: this.soundCategories.combo.volume * (options.volume || 1.0'),'
                ...options,

            const playback = this.poolManager ? (this.poolManager, as any').playSound('combo', clampedLevel.toString(), playbackOptions) : null,'
            
            if (playback && this.effectManager) {
            ','

                ' }'

                const effectVariation = (this.effectManager, as any').getEffectVariation('combo', `level${clampedLevel}`}; }'

                (this.effectManager as any').applyEffect(playback.sourceWrapper.source, 'combo', effectVariation});'
            }
            
            return playback;

        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playComboSound',
            return null,
    
    /**
     * 実績音を再生
     */'
    playAchievementSound(rarity: AchievementRarity, options: PlaybackOptions = { }): any { ''
        if (this.disabled) {

            console.warn('[SoundEffectSystem] Sound, effect system is disabled - playAchievementSound ignored') }
            return null;
        
        try { if (!this.soundCategories.achievement.enabled) return null,
            
            const playbackOptions = {
                volume: this.soundCategories.achievement.volume * (options.volume || 1.0'),'
                ...options,

            const playback = this.poolManager ? (this.poolManager, as any').playSound('achievement', rarity, playbackOptions) : null,'
            
            if (playback && this.effectManager) {
            ','

                const effectVariation = (this.effectManager, as any').getEffectVariation('achievement', rarity' }

                (this.effectManager, as any').applyEffect(playback.sourceWrapper.source, 'achievement', effectVariation); }'
            }
            
            return playback;

        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.playAchievementSound',
            return null,
    
    /**
     * ゲーム状態音を再生
     */'
    playGameStateSound(state: GameState, options: PlaybackOptions = { }): any { ''
        if (this.disabled) {

            console.warn('[SoundEffectSystem] Sound, effect system is disabled - playGameStateSound ignored') }
            return null;
        
        try { if (!this.soundCategories.gamestate.enabled) return null,
            
            const playbackOptions = {
                volume: this.soundCategories.gamestate.volume * (options.volume || 1.0'),'
                ...options,

            return this.poolManager ? (this.poolManager, as any').playSound('gamestate', state, playbackOptions) : null; catch (error) {'
            this.errorHandler.handleError(error, 'SoundEffectSystem.playGameStateSound',
            return null,
    
    /**
     * カテゴリの有効/無効を切り替え
     */'
    setCategoryEnabled(category: SoundCategory, enabled: boolean): void { ''
        if (this.soundCategories[category]) {
    
}

            this.soundCategories[category].enabled = enabled; }'

            console.log(`[SoundEffectSystem] Category ${category} ${enabled ? 'enabled' : 'disabled}`});'
        }
    }
    
    /**
     * カテゴリの音量を設定
     */
    setCategoryVolume(category: SoundCategory, volume: number): void { if (this.soundCategories[category]) {
            this.soundCategories[category].volume = Math.max(0, Math.min(2, volume) }
            console.log(`[SoundEffectSystem] Category ${category} volume, set to: ${volume}`});
        }
    }
    
    /**
     * 全サウンドを停止
     */'
    stopAllSounds(): number { ''
        if (this.disabled) {

            console.warn('[SoundEffectSystem] Sound, effect system, is disabled - stopAllSounds, ignored') }
            return 0;
        ';'

        try { return this.poolManager ? (this.poolManager, as any).stopAllSounds() : 0,' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.stopAllSounds',
            return 0,
    
    /**
     * カテゴリ内のサウンドを停止
     */'
    stopCategorySounds(category: SoundCategory): number { ''
        if (this.disabled) {

            console.warn('[SoundEffectSystem] Sound, effect system, is disabled - stopCategorySounds, ignored')
}
            return 0;
        ';'

        try { return this.poolManager ? (this.poolManager, as any).stopCategory(category) : 0,' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.stopCategorySounds),'
            return 0,
    
    /**
     * システム統計を取得
     */
    getSystemStatistics(): SystemStatistics { return { categories: this.soundCategories,
            bubbleTypes: this.bubbleTypes.length,
            comboLevels: this.comboLevels.length,
            achievementRarities: this.achievementRarities.length,
    components: {
                pool: this.poolManager ? (this.poolManager, as any).getPoolStatistics() : undefined,
                effects: this.effectManager ? (this.effectManager, as any).getEffectStatistics() : undefined,
                context: this.audioContextManager ? (this.audioContextManager, as any).getContextStatistics() : undefined;;
                renderer: this.soundRenderer ? (this.soundRenderer, as any).getRenderingStatistics() : undefined;
    
    /**
     * エフェクト品質を設定
     */
    setEffectQuality(quality: string): void { if (this.effectManager) {
            (this.effectManager, as any).setEffectQuality(quality) }
    }
    
    /**
     * プール設定を更新
     */
    updatePoolConfig(config: any): void { if (this.poolManager) {
            (this.poolManager, as any).updatePoolConfig(config) }
    }
    
    /**
     * サウンドを再生成
     */
    async regenerateSounds(category: SoundCategory | null = null): Promise<void> { try {
            if (category) {
                // 特定カテゴリのサウンドのみ再生成
                switch(category) {''
                    case 'bubble':','
                        await this.generateBubbleSounds('''
                    case 'ui': ','
                        await, this.generateUISounds('',
                    case 'achievement':','
                        await, this.generateAchievementSounds('',
                    case 'gamestate':','
                        await, this.generateGameStateSounds()','
                    case 'combo':),
                        await this.generateComboSounds() }
                        break; }
} else {  // 全サウンドを再生成' }'

                await this.generateAllSounds() };

            console.log(`[SoundEffectSystem] Sounds, regenerated for, category: ${category || 'all}`}';} catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.regenerateSounds' }'
    }
    
    /**
     * 効果音システムを破棄'
     */''
    dispose()';'
            console.log('[SoundEffectSystem] Disposing sound effect system...);'
            
            // 全サウンドを停止
            this.stopAllSounds();
            
            // 専用コンポーネントを破棄
            this.effectManager?.dispose();
            this.poolManager?.dispose();
            this.audioContextManager?.dispose();
            // 設定監視を停止
            this.configWatchers.forEach(watcher => {  '),'
                if(typeof, watcher === 'function' { }'
                    watcher(); // アンサブスクライブ }
};
            this.configWatchers.clear();
            
            // データをクリア
            this.soundVariations.clear();
            this.activeSources.clear()';'
            console.log('[SoundEffectSystem] Sound, effect system, disposed');
        } catch (error) {
            this.errorHandler.handleError(error, 'SoundEffectSystem.dispose') }

    }'} : undefined'