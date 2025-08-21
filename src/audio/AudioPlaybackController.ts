/**
 * AudioPlaybackController.ts
 * 音響再生・制御クラス
 * 効果音再生エンジン、音量・ピッチ制御、アクティブソース管理を担当
 */

import { getErrorHandler  } from '../utils/ErrorHandler';

/**
 * 再生オプションインターフェース
 */
interface PlaybackOptions { volume?: number;
    pitch?: number;
    pan?: number;
    delay?: number;
    fadeIn?: boolean;
    fadeOut?: boolean;
    loop?: boolean;
    category?: string; }
/**
 * 音響カテゴリ設定インターフェース
 */
interface SoundCategoryConfig { volume: number,
    priority: number ,}
/**
 * 再生統計インターフェース
 */
interface PlaybackStats { totalPlayed: number,
    activeCount: number;
    peakConcurrency: number,
    errors: number ,}
/**
 * エフェクト設定インターフェース
 */
interface EffectConfig { maxPitchShift: number,
    maxVolumeScale: number;
    maxPan: number;
    fadeInDuration: number,
    fadeOutDuration: number ,}
/**
 * 音響エフェクトインターフェース
 */
interface AudioEffects { reverb?: boolean;
    delay?: boolean;
    filter?: any;
    distortion?: boolean; }
/**
 * 泡タイプ
 */
type BubbleType = string;

/**
 * UIアクションタイプ'
 */''
type UIActionType = 'click' | 'hover' | 'error' | 'success' | 'button' | 'switch' | 'tab' | 'menu_open' | 'menu_close';

/**
 * 実績レアリティタイプ'
 */''
type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * ゲーム状態タイプ'
 */''
type GameStateType = 'game_start' | 'game_over' | 'warning' | 'levelup' | 'timeup' | '';
    'stageclear' | 'bonus_start' | 'health_low' | 'powerup' | 'pause' | 'resume';

/**
 * 音響再生制御クラス
 */
export class AudioPlaybackController {
    // AudioContext・ノード（外部から注入される）
    private audioContext: AudioContext | null;
    private sfxGainNode: GainNode | null;
    private masterGainNode: GainNode | null;
    // 音響バッファ（外部から注入される）
    private, soundBuffers: Map<string, AudioBuffer> | null;
    
    // アクティブソース管理
    private activeSources: Set<AudioBufferSourceNode>;
    private maxConcurrentSounds: number;
    // 再生統計
    private playbackStats: PlaybackStats;
    // エフェクト設定
    private effectConfig: EffectConfig;
    // 音響カテゴリ設定 ,}
    private soundCategories: { [key: string]: SoundCategoryConfig 
    };
    constructor() {
        // AudioContext・ノード（外部から注入される）
        this.audioContext = null;
        this.sfxGainNode = null;
        this.masterGainNode = null;
        
        // 音響バッファ（外部から注入される）
        this.soundBuffers = null;
        
        // アクティブソース管理
        this.activeSources = new Set();
        this.maxConcurrentSounds = 32;
        
        // 再生統計
        this.playbackStats = {
            totalPlayed: 0;
            activeCount: 0,
    peakConcurrency: 0
}
            errors: 0 ;
    },
        
        // エフェクト設定
        this.effectConfig = { maxPitchShift: 2.0,
            maxVolumeScale: 2.0;
            maxPan: 1.0;
            fadeInDuration: 0.01,
    fadeOutDuration: 0.1 
,};
        // 音響カテゴリ設定
        this.soundCategories = {
            bubble: { volume: 1.0, priority: 3 ,},
            ui: { volume: 0.8, priority: 2 ,},
            combo: { volume: 1.2, priority: 4 ,},
            achievement: { volume: 1.1, priority: 5 ,},
            gamestate: { volume: 1.0, priority: 3 ,},
            ambient: { volume: 0.6, priority: 1 ,}

    /**
     * 依存関係設定
     * @param audioContext - オーディオコンテキスト
     * @param sfxGainNode - SFXゲインノード
     * @param masterGainNode - マスターゲインノード
     * @param soundBuffers - 音響バッファマップ
     */
    setDependencies(;
        audioContext: AudioContext;
        sfxGainNode: GainNode
    );
        masterGainNode: GainNode),
    soundBuffers: Map<string, AudioBuffer>;
    ): void { this.audioContext = audioContext;
        this.sfxGainNode = sfxGainNode;
        this.masterGainNode = masterGainNode;
        this.soundBuffers = soundBuffers; }
    /**
     * 音響を再生
     * @param soundName - 音響名
     * @param options - 再生オプション
     * @returns 音源ノード
     */
    playSound(soundName: string, options: PlaybackOptions = { ): AudioBufferSourceNode | null {
        try {
            if(!this.audioContext || !this.soundBuffers) {
                
            }
                return null;
';

            const buffer = this.soundBuffers.get(soundName);''
            if(!buffer) { ' }'

                console.warn(`Sound '${soundName}' not, found`});
                return null;
            }

            // 同時再生数制限チェック
            if (this.activeSources.size >= this.maxConcurrentSounds) { this.stopOldestSound(); }
            return this._playSound(buffer, options);
';

        } catch (error) { this.playbackStats.errors++;''
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {''
                component: 'AudioPlaybackController','';
                operation: 'playSound',);
                soundName); });
            return null;
    /**
     * 内部音響再生メソッド
     * @param buffer - 音響バッファ
     * @param options - 再生オプション
     * @returns 音源ノード
     */
    private _playSound(buffer: AudioBuffer, options: PlaybackOptions = { ): AudioBufferSourceNode | null {'
        try {'
            if(!this.audioContext || !this.sfxGainNode) {
                
            }
                return null;
            const { volume = 1.0,
                pitch = 1.0,
                pan = 0.0,
                delay = 0,
                fadeIn = false,
                fadeOut = false,
                loop = false,
                category = 'default' } = options;

            // ソースノード作成
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = loop;

            // ゲインノード作成
            const gainNode = this.audioContext.createGain();
            
            // カテゴリ別音量調整
            const categoryConfig = this.soundCategories[category] || { volume: 1.0 }
            const finalVolume = volume * categoryConfig.volume;
            
            gainNode.gain.value = fadeIn ? 0 : finalVolume;

            // パンナー作成（ステレオパン）
            let pannerNode: StereoPannerNode | null = null,
            if(pan !== 0) {
                pannerNode = this.audioContext.createStereoPanner();
            }
                pannerNode.pan.value = Math.max(-1, Math.min(1, pan); }
            // ピッチシフト（playbackRateで近似）
            if (pitch !== 1.0) { source.playbackRate.value = Math.max(0.25, Math.min(4.0, pitch); }
            // ノード接続
            source.connect(gainNode);
            if(pannerNode) {
                gainNode.connect(pannerNode);
            }
                pannerNode.connect(this.sfxGainNode); }
            } else { gainNode.connect(this.sfxGainNode); }
            // フェードイン処理
            if(fadeIn) {
                gainNode.gain.exponentialRampToValueAtTime(;
                    finalVolume );
            }
                    this.audioContext.currentTime + this.effectConfig.fadeInDuration); }
            // フェードアウト処理
            if(fadeOut && buffer.duration > this.effectConfig.fadeOutDuration) {
                const fadeStartTime = this.audioContext.currentTime + buffer.duration - this.effectConfig.fadeOutDuration + delay;
                gainNode.gain.setValueAtTime(finalVolume, fadeStartTime);
            }
                gainNode.gain.exponentialRampToValueAtTime(0.001, fadeStartTime + this.effectConfig.fadeOutDuration); }
            // 再生開始
            const startTime = this.audioContext.currentTime + delay;
            source.start(startTime);

            // アクティブソース管理
            this.activeSources.add(source);
            this.playbackStats.totalPlayed++;
            this.playbackStats.activeCount = this.activeSources.size;''
            this.playbackStats.peakConcurrency = Math.max(this.playbackStats.peakConcurrency, this.activeSources.size);
';
            // 終了時クリーンアップ
            source.addEventListener('ended', () => {  this.activeSources.delete(source);
                this.playbackStats.activeCount = this.activeSources.size;
                try {
                    source.disconnect();
                    gainNode.disconnect(); }
                    if (pannerNode) pannerNode.disconnect(); }
                } catch (disconnectError) { // 既に切断済みの場合は無視 }
            });

            return source;
';

        } catch (error) { this.playbackStats.errors++;''
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {''
                component: 'AudioPlaybackController',')';
                operation: '_playSound' ,}';
            return null;
    /**
     * 泡破壊音を再生
     * @param bubbleType - 泡タイプ
     * @param comboLevel - コンボレベル
     * @param options - 再生オプション
     * @returns 音源ノード'
     */''
    playBubbleSound(bubbleType: BubbleType, comboLevel: number = 0, options: PlaybackOptions = { )): AudioBufferSourceNode | null {''
        const soundName = comboLevel > 0 ? 'pop_combo' : 'pop';
        
        // コンボレベルに応じた音響調整
        const comboOptions: PlaybackOptions = {
            ...options,
            category: 'bubble';
            pitch: 1.0 + (comboLevel * 0.1),
    volume: (options.volume || 1.0) * (1.0 + comboLevel * 0.2 ,};
        
        return this.playSound(soundName, comboOptions);
    }

    /**
     * UI音を再生
     * @param actionType - アクションタイプ
     * @param options - 再生オプション
     * @returns 音源ノード'
     */''
    playUISound(actionType: UIActionType, options: PlaybackOptions = { )): AudioBufferSourceNode | null { }

        const uiSoundMap: { [key in UIActionType]: string } = { '', 'click': 'click',
            'hover': 'hover',
            'error': 'error',
            'success': 'success',
            'button': 'click',
            'switch': 'click',
            'tab': 'click',
            'menu_open': 'success',
            'menu_close': 'click' };

        const soundName = uiSoundMap[actionType] || 'click';
        ';

        return this.playSound(soundName, { ...options,)'
            category: 'ui' ,}
    /**
     * コンボ音を再生
     * @param comboLevel - コンボレベル
     * @param options - 再生オプション
     * @returns 音源ノード'
     */''
    playComboSound(comboLevel: number, options: PlaybackOptions = { )): AudioBufferSourceNode | null {
        const comboOptions: PlaybackOptions = {'
            ...options,
            category: 'combo',
            pitch: 1.0 + (comboLevel * 0.15,
            volume: (options.volume || 1.0) * Math.min(2.0, 1.0 + comboLevel * 0.3 };

        return this.playSound('pop_combo', comboOptions';
    }

    /**
     * 実績解除音を再生
     * @param rarity - レアリティ
     * @param options - 再生オプション
     * @returns 音源ノード'
     */''
    playAchievementSound(rarity: AchievementRarity, options: PlaybackOptions = { )): AudioBufferSourceNode | null { }

        const rarityMap: { [key in AchievementRarity]: { sound: string; pitch: number;, volume: number ,} = { ' }', 'common': { sound: 'success', pitch: 1.0, volume: 1.0 ,},'', 'rare': { sound: 'bonus', pitch: 1.1, volume: 1.2 ,},'', 'epic': { sound: 'bonus', pitch: 1.2, volume: 1.4 ,},'', 'legendary': { sound: 'bonus', pitch: 1.3, volume: 1.6 ,};

        const config = rarityMap[rarity] || rarityMap.common;
        ';

        return this.playSound(config.sound, { ...options,)'
            category: 'achievement');
            pitch: (options.pitch || 1.0) * config.pitch,
    volume: (options.volume || 1.0) * config.volume 
,});
    }

    /**
     * ゲーム状態音を再生
     * @param stateType - 状態タイプ
     * @param options - 再生オプション
     * @returns 音源ノード'
     */''
    playGameStateSound(stateType: GameStateType, options: PlaybackOptions = { )): AudioBufferSourceNode | null { }

        const stateMap: { [key in GameStateType]: string } = { '', 'game_start': 'game_start',
            'game_over': 'game_over',
            'warning': 'warning',
            'levelup': 'success',
            'timeup': 'error',
            'stageclear': 'success',
            'bonus_start': 'bonus',
            'health_low': 'warning',
            'powerup': 'success',
            'pause': 'click',
            'resume': 'click' };

        const soundName = stateMap[stateType] || 'success';
        ';

        return this.playSound(soundName, { ...options,)'
            category: 'gamestate' ,}
    /**
     * 全音響停止
     */
    stopAllSounds(): void { try {
            this.activeSources.forEach(source => { )
                try {); }
                    source.stop(); }
                } catch (error) { // 既に停止済みの場合は無視 }
            });
            this.activeSources.clear();
            this.playbackStats.activeCount = 0;
        } catch (error) { getErrorHandler().handleError(error, 'AUDIO_ERROR', {''
                component: 'AudioPlaybackController',')';
                operation: 'stopAllSounds' ,});
        }
    /**
     * 最古の音響を停止
     */
    private stopOldestSound(): void { if (this.activeSources.size > 0) {
            const oldestSource = this.activeSources.values().next().value;
            try {
                oldestSource.stop();
                this.activeSources.delete(oldestSource);
                this.playbackStats.activeCount = this.activeSources.size; } catch (error) { // 既に停止済みの場合は無視 }
        }
    /**
     * カテゴリ別音響停止
     * @param category - カテゴリ
     */
    stopSoundsByCategory(category: string): void { // Note: より高度な実装では、各ソースにカテゴリ情報を付与して管理
        // 現在は簡易実装として全停止
        this.stopAllSounds( }
    /**
     * 音響エフェクト適用
     * @param source - 音源ノード
     * @param effects - エフェクト設定
     */
    applyAudioEffects(source: AudioBufferSourceNode, effects: AudioEffects = { ): void {
        try {
            const { reverb = false,
                delay = false,
                filter = null,
                distortion = false } = effects;

            // Note: 高度なエフェクト実装は将来の拡張で対応
            // 現在は基本的なゲイン・パン・ピッチのみサポート
            ';

        } catch (error) { getErrorHandler().handleError(error, 'AUDIO_ERROR', {''
                component: 'AudioPlaybackController',')';
                operation: 'applyAudioEffects' ,});
        }
    /**
     * アクティブソース管理
     */
    manageActiveSources(): void { // 無効なソースをクリーンアップ
        const invalidSources: AudioBufferSourceNode[] = [],
        this.activeSources.forEach(source => { )
            try {)
                // プレイバック状態チェック);
                if((source, as any).playbackState === 'finished') { }
                    invalidSources.push(source); }
                } catch (error) { invalidSources.push(source); }
        });

        invalidSources.forEach(source => {  ); }
            this.activeSources.delete(source); }
        });

        this.playbackStats.activeCount = this.activeSources.size;
    }

    /**
     * 音量設定
     * @param category - カテゴリ
     * @param volume - 音量 (0.0-1.0)
     */
    setCategoryVolume(category: string, volume: number): void { if (this.soundCategories[category]) {
            this.soundCategories[category].volume = Math.max(0, Math.min(1, volume); }
    }

    /**
     * 最大同時再生数設定
     * @param maxCount - 最大数
     */
    setMaxConcurrentSounds(maxCount: number): void { this.maxConcurrentSounds = Math.max(1, Math.min(64, maxCount);
        
        // 現在のアクティブソース数が制限を超えている場合は調整
        while(this.activeSources.size > this.maxConcurrentSounds) {
            
        }
            this.stopOldestSound(); }
    }

    /**
     * 再生統計取得
     * @returns 再生統計
     */
    getPlaybackStats(): PlaybackStats & { maxConcurrent: number,  }
        categories: Array<{ name: string; volume: number;, priority: number }> 
    } { return { ...this.playbackStats,
            activeCount: this.activeSources.size;
            maxConcurrent: this.maxConcurrentSounds,
    categories: Object.keys(this.soundCategories).map(category => ({)
                name: category),
    volume: this.soundCategories[category].volume,') };

                priority: this.soundCategories[category].priority)''); }'
        }

    /**
     * 音響テスト再生
     * @param soundName - テスト音響名
     * @returns テスト成功フラグ'
     */''
    testSound(soundName: string = 'click': boolean { try {'
            const source = this.playSound(soundName, { volume: 0.5 ),
            return source !== null } catch (error) { return false;

    /**
     * 再生状態リセット
     */
    resetPlaybackState(): void { this.stopAllSounds();
        this.playbackStats = {
            totalPlayed: 0;
            activeCount: 0;
            peakConcurrency: 0,
    errors: 0 
,}

    /**
     * リソースのクリーンアップ
     */
    dispose(): void { this.stopAllSounds();
        this.audioContext = null;
        this.sfxGainNode = null;
        this.masterGainNode = null;
        this.soundBuffers = null; }
}

// シングルトンインスタンス管理
let audioPlaybackControllerInstance: AudioPlaybackController | null = null,

/**
 * AudioPlaybackControllerのシングルトンインスタンスを取得
 * @returns シングルトンインスタンス
 */
export function getAudioPlaybackController(): AudioPlaybackController { if (!audioPlaybackControllerInstance) {
        audioPlaybackControllerInstance = new AudioPlaybackController(); }
    return audioPlaybackControllerInstance;
}

/**
 * AudioPlaybackControllerのシングルトンインスタンスを再初期化
 * @returns 新しいシングルトンインスタンス
 */
export function reinitializeAudioPlaybackController(): AudioPlaybackController { if (audioPlaybackControllerInstance) {
        audioPlaybackControllerInstance.dispose(); }''
    audioPlaybackControllerInstance = new AudioPlaybackController();