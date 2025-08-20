/**
 * SoundPoolManager.ts
 * サウンドプール管理システム
 * SoundEffectSystemから分離されたサウンドプール機能
 */

import { getErrorHandler } from '../../utils/ErrorHandler';''
import { getConfigurationManager } from '../../core/ConfigurationManager';

/**
 * オーディオソースラッパーインターフェース
 */
interface AudioSourceWrapper { source: AudioBufferSourceNode | null,
    gainNode: GainNode,
    isInUse: boolean,
    createdAt: number,
    lastUsed: number }
}

/**
 * サウンドバリエーションインターフェース
 */
interface SoundVariation { buffer: AudioBuffer,
    playCount: number,
    weight: number }
}

/**
 * サウンドエントリーインターフェース
 */
interface SoundEntry { buffer: AudioBuffer,
    variations: Map<string, SoundVariation>;
    playCount: number,
    lastPlayed: number }
}

/**
 * カテゴリプールインターフェース
 */
interface CategoryPool { sounds: Map<string, SoundEntry>;
    maxSize: number }
}

/**
 * プール設定インターフェース
 */
interface PoolConfig { maxPoolSize: number,
    maxActiveSources: number,
    poolCleanupInterval: number,
    sourceReuseDelay: number,
    preloadedSounds: number }
}

/**
 * 再生オプションインターフェース
 */
interface PlaybackOptions { volume?: number;
    pitch?: number;
    loop?: boolean;
    loopStart?: number;
    loopEnd?: number;
    fadeIn?: number;
    startTime?: number;
    useVariation?: boolean; }
}

/**
 * 再生インスタンスインターフェース
 */'
interface PlaybackInstance { sourceWrapper: AudioSourceWrapper,''
    stop: (') => void,
    category: string,
    soundKey: string,
    startTime: number }
}

/**
 * カテゴリ統計インターフェース
 */
interface CategoryStatistics { soundCount: number,
    maxSize: number,
    totalPlayCount: number }
}

/**
 * プール統計インターフェース
 */
interface PoolStatistics { activeSources: number,
    maxActiveSources: number,
    poolSize: number,
    maxPoolSize: number,
    categories: Record<string, CategoryStatistics>;
    availableSources: number }
}

/**
 * サウンドカテゴリタイプ'
 */''
type SoundCategory = 'bubble' | 'ui' | 'combo' | 'achievement' | 'gamestate';

/**
 * ConfigurationManager インターフェース（型定義用）
 */
interface ConfigurationManager { get(category: string): any }
}

/**
 * ErrorHandler インターフェース（型定義用）
 */
interface ErrorHandler { handleError(error: any, context: string): void }
}

export class SoundPoolManager {
    private audioContext: AudioContext;
    private sfxGainNode: GainNode;
    private configManager: ConfigurationManager;
    private errorHandler: ErrorHandler;
    // サウンドプール管理
    private soundPools: Map<string, any>;
    private activeSources: Set<AudioSourceWrapper>;
    private sourcePool: AudioSourceWrapper[];
    // プール設定
    private poolConfig: PoolConfig;
    // サウンドカテゴリ別プール
    private categoryPools: Record<SoundCategory, CategoryPool>;
    
    // バリエーション管理
    private soundVariations: Map<string, any>;
    private variationCounters: Map<string, number>;
    
    // クリーンアップタイマー
    private cleanupTimerId?: NodeJS.Timeout;

    constructor(audioContext: AudioContext, sfxGainNode: GainNode) {

        this.audioContext = audioContext;
        this.sfxGainNode = sfxGainNode;
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        
        // サウンドプール管理
        this.soundPools = new Map();
        this.activeSources = new Set();
        this.sourcePool = [];
        
        // プール設定
        this.poolConfig = {
            maxPoolSize: 100,
            maxActiveSources: 32,
            poolCleanupInterval: 30000, // 30秒;
            sourceReuseDelay: 100, // 100ms
    }
    }
            preloadedSounds: 50 }
        },
        
        // サウンドカテゴリ別プール
        this.categoryPools = {
            bubble: { sounds: new Map(), maxSize: 20 },
            ui: { sounds: new Map(), maxSize: 15 },
            combo: { sounds: new Map(), maxSize: 10 },
            achievement: { sounds: new Map(), maxSize: 8 },
            gamestate: { sounds: new Map(), maxSize: 12 }
        };
        
        // バリエーション管理
        this.soundVariations = new Map();
        this.variationCounters = new Map();
        
        this.initializePools();
    }
    
    /**
     * プールシステムを初期化
     */
    private initializePools(): void { try {
            this.createSourcePool();
            this.setupPoolCleanup()';
            console.log('[SoundPoolManager] Sound pool manager initialized');' }'
        } catch (error) { ''
            this.errorHandler.handleError(error, 'SoundPoolManager.initializePools'); }
        }
    }
    
    /**
     * ソースプールを作成
     */
    private createSourcePool(): void { // 事前にAudioBufferSourceNodeを作成してプールに保存
        for(let i = 0; i < this.poolConfig.preloadedSounds; i++) {
            
        }
            this.sourcePool.push(this.createNewSource(); }
        }
        
        console.log(`[SoundPoolManager] Created source pool with ${this.sourcePool.length) sources`});
    }
    
    /**
     * 新しいオーディオソースを作成
     */
    private createNewSource(): AudioSourceWrapper { return { source: null,
            gainNode: this.audioContext.createGain(),
            isInUse: false,
            createdAt: Date.now(), };
            lastUsed: 0 }
        },
    }
    
    /**
     * サウンドをプールに追加
     */
    addToPool(category: SoundCategory, soundKey: string, audioBuffer: AudioBuffer, variations: AudioBuffer[] = []): void { try {
            if (!this.categoryPools[category]) { }
                console.warn(`[SoundPoolManager] Unknown category: ${category)`});
                return;
            }
            
            const pool = this.categoryPools[category];
            
            // メインサウンドを追加
            pool.sounds.set(soundKey, { )
                buffer: audioBuffer),
                variations: new Map(),
                playCount: 0,
                lastPlayed: 0 }
            }),
            
            // バリエーションを追加
            variations.forEach((variation, index) => {  }
                const variationKey = `${soundKey}_var${index}`;
                const soundEntry = pool.sounds.get(soundKey);
                if(soundEntry) {
                    soundEntry.variations.set(variationKey, {)
                        buffer: variation);
                        playCount: 0,)
                }
                        weight: 1.0 // 再生重み); }
                    });
                }
            });
            
            // バリエーションカウンターを初期化
            this.variationCounters.set(soundKey, 0);
            
            console.log(`[SoundPoolManager] Added sound to pool: ${category}/${soundKey} with ${variations.length) variations`});
            '';
        } catch (error) { ''
            this.errorHandler.handleError(error, 'SoundPoolManager.addToPool'); }
        }
    }
    
    /**
     * プールからサウンドを取得
     */
    private getFromPool(category: SoundCategory, soundKey: string, useVariation: boolean = true): AudioBuffer | null { try {
            const pool = this.categoryPools[category];
            if(!pool || !pool.sounds.has(soundKey) { }
                console.warn(`[SoundPoolManager] Sound not found: ${category}/${soundKey)`});
                return null;
            }
            
            const soundEntry = pool.sounds.get(soundKey);
            if (!soundEntry) { return null; }
            }
            
            let selectedBuffer = soundEntry.buffer;
            
            // バリエーションを使用する場合
            if (useVariation && soundEntry.variations.size > 0) { selectedBuffer = this.selectVariation(soundKey, soundEntry); }
            }
            
            // 使用統計を更新
            soundEntry.playCount++;
            soundEntry.lastPlayed = Date.now();
            
            return selectedBuffer;
            '';
        } catch (error) { ''
            this.errorHandler.handleError(error, 'SoundPoolManager.getFromPool');
            return null; }
        }
    }
    
    /**
     * バリエーションを選択
     */
    private selectVariation(soundKey: string, soundEntry: SoundEntry): AudioBuffer { const variations = Array.from(soundEntry.variations.values();
        if(variations.length === 0) {
            
        }
            return soundEntry.buffer; }
        }
        
        // ラウンドロビン方式でバリエーションを選択
        const counter = this.variationCounters.get(soundKey) || 0;
        const selectedIndex = counter % variations.length;
        this.variationCounters.set(soundKey, counter + 1);
        
        return variations[selectedIndex].buffer;
    }
    
    /**
     * オーディオソースを取得（プールから）
     */
    private getAudioSource(): AudioSourceWrapper | null { try {
            // プールから利用可能なソースを探す
            let sourceWrapper = this.sourcePool.find(wrapper => !wrapper.isInUse);
            
            // プールが空の場合、新しいソースを作成
            if(!sourceWrapper) {
                if (this.sourcePool.length < this.poolConfig.maxPoolSize) {
                    sourceWrapper = this.createNewSource();
            }
                    this.sourcePool.push(sourceWrapper); }
                } else {  // プールが満杯の場合、最も古いソースを再利用
                    sourceWrapper = this.sourcePool.reduce((oldest, current) => ;
                        current.lastUsed < oldest.lastUsed ? current : oldest;
                    ); }
                    this.stopSourceWrapper(sourceWrapper); }
                }
            }
            
            // 新しいAudioBufferSourceNodeを作成
            sourceWrapper.source = this.audioContext.createBufferSource();
            sourceWrapper.isInUse = true;
            sourceWrapper.lastUsed = Date.now();
            
            // ゲインノードに接続
            sourceWrapper.source.connect(sourceWrapper.gainNode);
            
            this.activeSources.add(sourceWrapper);
            
            return sourceWrapper;
            '';
        } catch (error) { ''
            this.errorHandler.handleError(error, 'SoundPoolManager.getAudioSource');
            return null; }
        }
    }
    
    /**
     * オーディオソースを返却
     */
    private returnAudioSource(sourceWrapper: AudioSourceWrapper): void { try {
            if(sourceWrapper && this.activeSources.has(sourceWrapper) {
                this.stopSourceWrapper(sourceWrapper);
                this.activeSources.delete(sourceWrapper);
                
                // 少し待ってから再利用可能にする
            }
                setTimeout(() => {  }
                    sourceWrapper.isInUse = false; }
                }, this.poolConfig.sourceReuseDelay);''
            } catch (error) { ''
            this.errorHandler.handleError(error, 'SoundPoolManager.returnAudioSource'); }
        }
    }
    
    /**
     * ソースラッパーを停止
     */
    private stopSourceWrapper(sourceWrapper: AudioSourceWrapper): void { try {
            if(sourceWrapper.source) {
                sourceWrapper.source.stop();
                sourceWrapper.source.disconnect();
            }
                sourceWrapper.source = null; }
            } catch (error) { // 既に停止済みの場合のエラーは無視 }
        }
    }
    
    /**
     * サウンドを再生
     */
    playSound(category: SoundCategory, soundKey: string, options: PlaybackOptions = {}): PlaybackInstance | null { try {
            // アクティブソース数をチェック
            if(this.activeSources.size >= this.poolConfig.maxActiveSources') {'
                '';
                console.warn('[SoundPoolManager] Maximum active sources reached');
            }
                return null; }
            }
            
            // サウンドバッファを取得
            const audioBuffer = this.getFromPool(category, soundKey, options.useVariation !== false);
            if (!audioBuffer) { return null; }
            }
            
            // オーディオソースを取得
            const sourceWrapper = this.getAudioSource();
            if (!sourceWrapper || !sourceWrapper.source) { return null; }
            }
            
            // オーディオを設定
            sourceWrapper.source.buffer = audioBuffer;
            
            // オプションを適用
            this.applyPlaybackOptions(sourceWrapper, options);
            
            // 再生完了時のクリーンアップを設定
            sourceWrapper.source.onended = () => { this.returnAudioSource(sourceWrapper); }
            };
            
            // 出力に接続
            sourceWrapper.gainNode.connect(this.sfxGainNode);
            
            // 再生開始
            const startTime = options.startTime || this.audioContext.currentTime;
            sourceWrapper.source.start(startTime);
            
            return { sourceWrapper,
                stop: () => this.returnAudioSource(sourceWrapper),
                category,
                soundKey, };
                startTime }
            };
            '';
        } catch (error) { ''
            this.errorHandler.handleError(error, 'SoundPoolManager.playSound');
            return null; }
        }
    }
    
    /**
     * 再生オプションを適用
     */
    private applyPlaybackOptions(sourceWrapper: AudioSourceWrapper, options: PlaybackOptions): void { if (!sourceWrapper.source) return;
        
        // 音量設定
        if(options.volume !== undefined) {
            
        }
            sourceWrapper.gainNode.gain.value = Math.max(0, Math.min(1, options.volume); }
        }
        
        // ピッチ設定
        if (options.pitch !== undefined) { sourceWrapper.source.playbackRate.value = Math.max(0.1, Math.min(4, options.pitch); }
        }
        
        // ループ設定
        if(options.loop) {
            sourceWrapper.source.loop = true;
            if (options.loopStart !== undefined) {
        }
                sourceWrapper.source.loopStart = options.loopStart; }
            }
            if (options.loopEnd !== undefined) { sourceWrapper.source.loopEnd = options.loopEnd; }
            }
        }
        
        // フェードイン効果
        if(options.fadeIn) {
            const currentGain = sourceWrapper.gainNode.gain.value;
            sourceWrapper.gainNode.gain.value = 0;
            sourceWrapper.gainNode.gain.linearRampToValueAtTime(;
                currentGain );
        }
                this.audioContext.currentTime + options.fadeIn); }
        }
    }
    
    /**
     * カテゴリ内の全サウンドを停止
     */
    stopCategory(category: SoundCategory): number { const stoppedSounds: AudioSourceWrapper[] = [],
        
        this.activeSources.forEach(sourceWrapper => { )
            // カテゴリが一致する場合は停止)
            // 実際の実装では、ソースにカテゴリ情報を保存する必要がある);
            this.returnAudioSource(sourceWrapper); }
            stoppedSounds.push(sourceWrapper); }
        });
        
        console.log(`[SoundPoolManager] Stopped ${stoppedSounds.length} sounds in category: ${category}`);
        return stoppedSounds.length;
    }
    
    /**
     * 全サウンドを停止
     */
    stopAllSounds(): number { const stoppedCount = this.activeSources.size;
        
        this.activeSources.forEach(sourceWrapper => { ); }
            this.returnAudioSource(sourceWrapper); }
        });
        
        console.log(`[SoundPoolManager] Stopped all ${stoppedCount} active sounds`);
        return stoppedCount;
    }
    
    /**
     * プールクリーンアップを設定
     */
    private setupPoolCleanup(): void { this.cleanupTimerId = setInterval(() => {  }
            this.cleanupPool(); }
        }, this.poolConfig.poolCleanupInterval);
    }
    
    /**
     * プールのクリーンアップ
     */
    private cleanupPool(): void { try {
            const currentTime = Date.now();
            const cleanupThreshold = 300000; // 5分
            
            // 使用されていない古いソースを削除
            this.sourcePool = this.sourcePool.filter(sourceWrapper => { )
                if (!sourceWrapper.isInUse && );
                    currentTime - sourceWrapper.lastUsed > cleanupThreshold) {
                    this.stopSourceWrapper(sourceWrapper); }
                    return false; }
                }
                return true;
            });
            
            // プールサイズを調整
            while(this.sourcePool.length > this.poolConfig.maxPoolSize) {
                const sourceWrapper = this.sourcePool.pop();
                if (sourceWrapper) {
            }
                    this.stopSourceWrapper(sourceWrapper); }
                }
            }
            
            console.log(`[SoundPoolManager] Pool cleanup completed. Active sources: ${this.activeSources.size}, Pool size: ${this.sourcePool.length)`});
            '';
        } catch (error) { ''
            this.errorHandler.handleError(error, 'SoundPoolManager.cleanupPool'); }
        }
    }
    
    /**
     * プール統計を取得
     */
    getPoolStatistics(): PoolStatistics {
        const categoryStats: Record<string, CategoryStatistics> = {};
        
        Object.keys(this.categoryPools).forEach(category => {  const pool = this.categoryPools[category as SoundCategory];
            categoryStats[category] = {)
                soundCount: pool.sounds.size,);
                maxSize: pool.maxSize),
                totalPlayCount: Array.from(pool.sounds.values() }
                    .reduce((sum, sound) => sum + sound.playCount, 0); }
            };
        });
        
        return { activeSources: this.activeSources.size,
            maxActiveSources: this.poolConfig.maxActiveSources,
            poolSize: this.sourcePool.length,
            maxPoolSize: this.poolConfig.maxPoolSize,
            categories: categoryStats, };
            availableSources: this.sourcePool.filter(wrapper => !wrapper.isInUse).length }
        },
    }
    
    /**
     * プール設定を更新
     */'
    updatePoolConfig(newConfig: Partial<PoolConfig>): void { ''
        Object.assign(this.poolConfig, newConfig');''
        console.log('[SoundPoolManager] Pool configuration updated:', newConfig) }
    }
    
    /**
     * カテゴリプールサイズを設定
     */
    setCategoryPoolSize(category: SoundCategory, maxSize: number): void { if (this.categoryPools[category]) {
            this.categoryPools[category].maxSize = maxSize; }
            console.log(`[SoundPoolManager] ${category} pool max size set to: ${maxSize)`});
        }
    }
    
    /**
     * サウンドプールマネージャーを破棄
     */
    dispose(): void { try {
            // クリーンアップタイマーを停止
            if(this.cleanupTimerId) {
                
            }
                clearInterval(this.cleanupTimerId); }
            }
            
            // 全サウンドを停止
            this.stopAllSounds();
            
            // ソースプールをクリーンアップ
            this.sourcePool.forEach(sourceWrapper => {  ); }
                this.stopSourceWrapper(sourceWrapper); }
            });
            
            // データをクリア
            this.sourcePool = [];
            this.activeSources.clear();
            this.soundPools.clear();
            this.soundVariations.clear();
            this.variationCounters.clear();
            
            // カテゴリプールをクリア
            Object.keys(this.categoryPools).forEach(category => {  ); }
                this.categoryPools[category as SoundCategory].sounds.clear();' }'
            }');'
            '';
            console.log('[SoundPoolManager] Sound pool manager disposed');''
        } catch (error) { ''
            this.errorHandler.handleError(error, 'SoundPoolManager.dispose''); }
        }'
    }''
}