/**
 * AudioChannelManager.ts
 * オーディオチャンネル管理システム
 * AudioControllerから分離されたチャンネル管理・音量制御機能
 */

import { getErrorHandler } from '../../utils/ErrorHandler';''
import { getConfigurationManager } from '../../core/ConfigurationManager';''
import { LoggingSystem } from '../../core/LoggingSystem';

/**
 * チャンネル名の型定義'
 */''
type AudioChannel = 'master' | 'music' | 'sfx' | 'ui' | 'voice' | 'environmental';

/**
 * 音量マップインターフェース
 */
interface VolumeMap { master: number,
    music: number;
    sfx: number;
    ui: number;
    voice: number;
    environmental: number ,}

/**
 * ミュート状態マップインターフェース
 */
interface MuteStateMap { master: boolean;
    music: boolean;
    sfx: boolean;
    ui: boolean;
    voice: boolean;
    environmental: boolean }

/**
 * ゲインノードマップインターフェース
 */
interface GainNodeMap { master: GainNode | null;
    music: GainNode | null;
    sfx: GainNode | null;
    ui: GainNode | null;
    voice: GainNode | null;
    environmental: GainNode | null }

/**
 * チャンネル設定インターフェース
 */
interface ChannelConfig { defaultVolumes: VolumeMap;
    volumeStep: number;
    minVolume: number;
    maxVolume: number;
    fadeStep: number }

/**
 * マネージャー状態インターフェース
 */
interface ManagerState { volumes: VolumeMap;
    muteStates: MuteStateMap;
    effectiveVolumes: VolumeMap;
    channelConfig: ChannelConfig;
    availableChannels: string[] }

/**
 * ConfigurationManager インターフェース（型定義用）
 */
interface ConfigurationManager { get(category: string): any;
    set(category: string, path: string, value: any): void,
    watch(category: string, path: string, callback: (value: any) => void): string | null ,}
}

/**
 * ErrorHandler インターフェース（型定義用）
 */
interface ErrorHandler { handleError(error: any, context: string): void ,}

/**
 * AudioManager インターフェース（統合用）
 */
interface AudioManager { registerGainNodes?(gainNodes: GainNodeMap): void, 
export class AudioChannelManager {
    private audioContext: AudioContext;
    private configManager: ConfigurationManager;
    private errorHandler: ErrorHandler;
    private loggingSystem: LoggingSystem;
    // オーディオノード階層
    private gainNodes: GainNodeMap;
    // 音量設定
    private volumes: VolumeMap;
    // ミュート状態
    private muteStates: MuteStateMap;
    // 前回の音量（ミュート解除時の復元用）
    private previousVolumes: VolumeMap;
    // 設定監視
    private configWatchers: Set<string>;
    // チャンネル設定
    private channelConfig: ChannelConfig;
    constructor(audioContext: AudioContext) {

        this.audioContext = audioContext;
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // オーディオノード階層
        this.gainNodes = {
            master: null;
            music: null;
            sfx: null;
            ui: null;
            voice: null;
    ,}
            environmental: null }
        };
        // 音量設定
        this.volumes = { master: 1.0,
            music: 0.7;
            sfx: 0.8;
            ui: 0.6;
            voice: 1.0;
            environmental: 0.5 ,};
        // ミュート状態
        this.muteStates = { master: false,
            music: false;
            sfx: false;
            ui: false;
            voice: false;
            environmental: false ,};
        // 前回の音量（ミュート解除時の復元用）
        this.previousVolumes = { ...this.volumes;
        
        // 設定監視
        this.configWatchers = new Set();
        
        // チャンネル設定
        this.channelConfig = { defaultVolumes: {
                master: 1.0;
                music: 0.7;
                sfx: 0.8;
                ui: 0.6;
                voice: 1.0;
                environmental: 0.5 };
            volumeStep: 0.1;
            minVolume: 0.0;
            maxVolume: 2.0;
            fadeStep: 0.02;
        },
        
        this.initialize();
    }
    
    /**
     * チャンネルマネージャーを初期化
     */
    async initialize(): Promise<void> { try {
            // ゲインノード階層を作成
            this.createGainNodeHierarchy();
            
            // 初期音量を読み込み
            this.loadInitialVolumes();
            // 設定監視を設定
            this.setupConfigWatchers()';
            this.loggingSystem.info('AudioChannelManager', 'Audio channel manager initialized);' }

        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.initialize); }'
    }
    
    /**
     * ゲインノード階層を作成
     */
    private createGainNodeHierarchy(): void { try {
            // マスターゲインノード
            this.gainNodes.master = this.audioContext.createGain();
            this.gainNodes.master.connect(this.audioContext.destination);
            // 各チャンネルのゲインノード
            (Object.keys(this.gainNodes) as AudioChannel[]).forEach(channel => { ');''
                if(channel !== 'master) {'
                    
                }
                    this.gainNodes[channel] = this.audioContext.createGain(); }
                    this.gainNodes[channel]!.connect(this.gainNodes.master!); }
});
            ';
            // 初期音量を設定
            this.applyVolumeToGainNodes()';
            this.loggingSystem.debug('AudioChannelManager', 'Gain node hierarchy created);''
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.createGainNodeHierarchy); }'
    }
    
    /**
     * 初期音量を読み込み'
     */''
    private loadInitialVolumes()';
            const audioConfig = this.configManager.get('audio);
            
            if(audioConfig && audioConfig.volumes) {
            
                (Object.keys(this.volumes) as AudioChannel[]).forEach(channel => { );
            
            }
                    if (audioConfig.volumes[channel] !== undefined) { }
                        this.volumes[channel] = audioConfig.volumes[channel]; }
});
            }
            
            if(audioConfig && audioConfig.mute) {
            
                (Object.keys(this.muteStates) as AudioChannel[]).forEach(channel => { );
            
            }
                    if (audioConfig.mute[channel] !== undefined) { }
                        this.muteStates[channel] = audioConfig.mute[channel]; }
});
            }

            this.applyVolumeToGainNodes()';
            this.loggingSystem.debug('AudioChannelManager', 'Initial volumes loaded', this.volumes);''
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.loadInitialVolumes); }'
    }
    
    /**
     * 音量をゲインノードに適用
     */
    private applyVolumeToGainNodes(): void { try {
            (Object.keys(this.gainNodes) as AudioChannel[]).forEach(channel => { );
                if(this.gainNodes[channel]) {
                    
                }
                    const volume = this.muteStates[channel] ? 0 : this.volumes[channel]; }
                    this.gainNodes[channel]!.gain.value = Math.max(0, Math.min(2, volume); }
});''
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.applyVolumeToGainNodes); }'
    }
    
    /**
     * 設定監視を設定
     */
    private setupConfigWatchers(): void { try {
            // 音量設定の監視
            (Object.keys(this.volumes) as AudioChannel[]).forEach(channel => { ');''
                const watcher = this.configManager.watch('audio', `volumes.${channel}`, (newValue: number} => { }
                    if (newValue !== undefined) { }
                        this.setVolume(channel, newValue, false}); // 設定保存をスキップ
                    }
                });
                if (watcher) this.configWatchers.add(watcher);
            });
            // ミュート設定の監視
            (Object.keys(this.muteStates) as AudioChannel[]).forEach(channel => {  ');''
                const watcher = this.configManager.watch('audio', `mute.${channel}`, (newValue: boolean} => { }
                    if (newValue !== undefined) { }
                        this.setMute(channel, newValue, false}); // 設定保存をスキップ
                    }
                });
                if (watcher) this.configWatchers.add(watcher);''
            }');

            this.loggingSystem.debug('AudioChannelManager', 'Config watchers setup completed);''
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.setupConfigWatchers); }'
    }
    
    /**
     * 音量を設定
     * @param channel - チャンネル名
     * @param volume - 音量 (0.0-2.0)
     * @param saveToConfig - 設定に保存するかどうか
     */
    setVolume(channel: AudioChannel, volume: number, saveToConfig: boolean = true): number { try {
            if(!(channel, in this.volumes) { }
                throw new Error(`Unknown, audio channel: ${channel}`});
            }
            
            const clampedVolume = Math.max(this.channelConfig.minVolume, Math.min(this.channelConfig.maxVolume, volume);
            this.volumes[channel] = clampedVolume;
            
            // ミュートされていない場合のみゲインノードに適用
            if (!this.muteStates[channel] && this.gainNodes[channel]) { this.gainNodes[channel]!.gain.value = clampedVolume; }
            
            // 設定に保存
            if(saveToConfig) {
                ';

            }

                this.saveVolumeToConfig(channel, clampedVolume); }
            }

            this.loggingSystem.debug('AudioChannelManager', `Volume set: ${channel} = ${clampedVolume}`});
            ';

            return clampedVolume;''
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.setVolume);
            return this.volumes[channel] || 0;
    
    /**
     * 音量を取得
     * @param channel - チャンネル名
     * @returns 音量
     */
    getVolume(channel: AudioChannel): number { try {
            if(!(channel, in this.volumes) { ,}
                throw new Error(`Unknown, audio channel: ${channel}`});
            }
            ';

            return this.volumes[channel];''
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.getVolume);
            return 0;
    
    /**
     * ミュート状態を設定
     * @param channel - チャンネル名
     * @param muted - ミュート状態
     * @param saveToConfig - 設定に保存するかどうか
     */
    setMute(channel: AudioChannel, muted: boolean, saveToConfig: boolean = true): boolean { try {
            if(!(channel, in this.muteStates) { ,}
                throw new Error(`Unknown, audio channel: ${channel}`});
            }
            
            // 現在の音量を保存（ミュート解除時の復元用）
            if (muted && !this.muteStates[channel]) { this.previousVolumes[channel] = this.volumes[channel]; }
            
            this.muteStates[channel] = muted;
            
            // ゲインノードに適用
            if (this.gainNodes[channel]) { this.gainNodes[channel]!.gain.value = muted ? 0 : this.volumes[channel]; }
            
            // 設定に保存
            if(saveToConfig) {
                ';

            }

                this.saveMuteToConfig(channel, muted); }
            }

            this.loggingSystem.debug('AudioChannelManager', `Mute set: ${channel} = ${muted}`});
            ';

            return muted;''
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.setMute);
            return this.muteStates[channel] || false;
    
    /**
     * ミュート状態を取得
     * @param channel - チャンネル名
     * @returns ミュート状態
     */
    getMute(channel: AudioChannel): boolean { try {
            if(!(channel, in this.muteStates) { ,}
                throw new Error(`Unknown, audio channel: ${channel}`});
            }
            ';

            return this.muteStates[channel];''
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.getMute);
            return false;
    
    /**
     * 全チャンネルの音量を取得
     * @returns 全チャンネルの音量
     */
    getAllVolumes(): VolumeMap {
        return { ...this.volumes;
    }
    
    /**
     * 全チャンネルのミュート状態を取得
     * @returns 全チャンネルのミュート状態
     */
    getAllMuteStates(): MuteStateMap {
        return { ...this.muteStates;
    }
    
    /**
     * 実効音量を取得（ミュート状態を考慮）
     * @returns 実効音量
     */
    getEffectiveVolumes(): VolumeMap {
        const effectiveVolumes = {} as VolumeMap;
        (Object.keys(this.volumes) as AudioChannel[]).forEach(channel => {  )
            effectiveVolumes[channel] = this.muteStates[channel] ? 0 : this.volumes[channel]); }
        return effectiveVolumes;
    
    /**
     * チャンネルの音量を段階的に変更
     * @param channel - チャンネル名
     * @param increase - 音量を上げるかどうか
     */
    adjustVolumeByStep(channel: AudioChannel, increase: boolean): number { try {
            const currentVolume = this.getVolume(channel);
            const step = this.channelConfig.volumeStep;
            const newVolume = increase ? currentVolume + step: currentVolume - step,

            return this.setVolume(channel, newVolume);' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.adjustVolumeByStep);
            return this.getVolume(channel);
    
    /**
     * 音量をリセット
     * @param channel - チャンネル名（指定しない場合は全チャンネル）
     */
    resetVolume(channel: AudioChannel | null = null): void { try {
            if(channel) {
                // 特定チャンネルをリセット
                const defaultVolume = this.channelConfig.defaultVolumes[channel];
                if (defaultVolume !== undefined) {
            ,}
                    this.setVolume(channel, defaultVolume); }
} else {  // 全チャンネルをリセット }
                (Object.keys(this.channelConfig.defaultVolumes) as AudioChannel[]).forEach(ch => { ); }
                    this.setVolume(ch, this.channelConfig.defaultVolumes[ch]);' }'

                }');
            }

            this.loggingSystem.info('AudioChannelManager', `Volume reset: ${channel || 'all channels'}`);''
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.resetVolume); }'
    }
    
    /**
     * ミュート状態をリセット
     * @param channel - チャンネル名（指定しない場合は全チャンネル）
     */
    resetMute(channel: AudioChannel | null = null): void { try {
            if(channel) {
                // 特定チャンネルをリセット
            }
                this.setMute(channel, false); }
            } else {  // 全チャンネルをリセット }
                (Object.keys(this.muteStates) as AudioChannel[]).forEach(ch => { ); }
                    this.setMute(ch, false);' }'

                }');
            }

            this.loggingSystem.info('AudioChannelManager', `Mute reset: ${channel || 'all channels'}`);''
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.resetMute); }'
    }
    
    /**
     * チャンネルのゲインノードを取得
     * @param channel - チャンネル名
     * @returns ゲインノード
     */
    getGainNode(channel: AudioChannel): GainNode | null { return this.gainNodes[channel] || null; }
    
    /**
     * 全チャンネルのゲインノードを取得
     * @returns 全チャンネルのゲインノード
     */
    getAllGainNodes(): GainNodeMap {
        return { ...this.gainNodes;
    }
    
    /**
     * チャンネルマネージャーの状態を取得
     * @returns 状態情報
     */
    getManagerState(): ManagerState { return { volumes: this.getAllVolumes(),
            muteStates: this.getAllMuteStates();
            effectiveVolumes: this.getEffectiveVolumes();
            channelConfig: this.channelConfig, };
            availableChannels: Object.keys(this.gainNodes); }
        }
    
    /**
     * 音量を設定に保存
     * @param channel - チャンネル名
     * @param volume - 音量'
     */''
    private saveVolumeToConfig(channel: AudioChannel, volume: number): void { try { }

            this.configManager.set('audio', `volumes.${channel}`, volume});''
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.saveVolumeToConfig); }'
    }
    
    /**
     * ミュート状態を設定に保存
     * @param channel - チャンネル名
     * @param muted - ミュート状態'
     */''
    private saveMuteToConfig(channel: AudioChannel, muted: boolean): void { try { }

            this.configManager.set('audio', `mute.${channel}`, muted});''
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.saveMuteToConfig); }'
    }
    
    /**
     * チャンネル設定を更新
     * @param newConfig - 新しい設定
     */'
    updateChannelConfig(newConfig: Partial<ChannelConfig>): void { ''
        Object.assign(this.channelConfig, newConfig);''
        this.loggingSystem.debug('AudioChannelManager', 'Channel configuration updated', newConfig); }
    
    /**
     * オーディオコンテキストとの統合
     * @param audioManager - AudioManagerインスタンス'
     */''
    integrateWithAudioManager(audioManager: AudioManager): void { try {'
            if(audioManager && typeof, audioManager.registerGainNodes === 'function) {'
                ';

            }

                audioManager.registerGainNodes(this.gainNodes); }
            }

            this.loggingSystem.debug('AudioChannelManager', 'Integrated with AudioManager);''
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.integrateWithAudioManager); }'
    }
    
    /**
     * チャンネルマネージャーを破棄
     */
    dispose(): void { try {
            // 設定監視を停止
            this.configWatchers.forEach(watcher => { ');''
                if(typeof, watcher === 'function) { }'
                    watcher(); // アンサブスクライブ }
});
            this.configWatchers.clear();
            
            // ゲインノードを切断
            Object.values(this.gainNodes).forEach(gainNode => {  );
                if (gainNode && gainNode.disconnect) { }
                    gainNode.disconnect(); }
});
            
            // 状態をクリア
            (Object.keys(this.gainNodes) as AudioChannel[]).forEach(channel => {  }
                this.gainNodes[channel] = null);' }'

            }');

            this.loggingSystem.info('AudioChannelManager', 'Audio channel manager disposed);''
        } catch (error) {
            this.errorHandler.handleError(error, 'AudioChannelManager.dispose''); }

    }''
}