import { getErrorHandler } from '../utils/ErrorHandler';''
import { getConfigurationManager } from '../core/ConfigurationManager';

/**
 * バンド設定インターフェース
 */
interface BandConfig { name: string,
    frequency: number,
    type: BiquadFilterType,
    gain: number }
}

/**
 * フィルターデータインターフェース
 */
interface FilterData extends BandConfig { filter: BiquadFilterNode,
    index: number }
}

/**
 * イコライザー設定インターフェース
 */
interface EqualizerSettings { enabled?: boolean;
    bands?: {
        [key: string]: number, }
    };
}

/**
 * プリセット定義インターフェース
 */
interface PresetDefinition { name: string,
    description: string,
    gains: number[] }
}

/**
 * バンド情報インターフェース
 */
interface BandInfo { index: number,
    name: string,
    frequency: number,
    type: BiquadFilterType,
    gain: number,
    displayName: string }
}

/**
 * 周波数レスポンスデータインターフェース
 */
interface FrequencyResponseData { frequencies: number[],
    magnitude: number[],
    phase: number[],
    magnitudeDB: number[] }
}

/**
 * イコライザー状態インターフェース
 */
interface EqualizerStatus { isEnabled: boolean,
    bands: BandInfo[],
    presets: string[],
    configWatchers: number }
}

/**
 * ConfigurationManager インターフェース（型定義用）
 */
interface ConfigurationManager { get(category: string, path: string): any,
    set(category: string, path: string, value: any): void,
    watch(category: string, path: string, callback: (value: any) => void): string | null;
    unwatch(watchId: string): void, }
}

/**
 * イコライザーシステム - 5バンドイコライザー実装
 * Web Audio API の BiquadFilterNode を使用した周波数帯域制御
 */
export class Equalizer {
    private audioContext: AudioContext;
    private inputNode: AudioNode;
    private outputNode: AudioNode;
    // 設定管理
    private configManager: ConfigurationManager;
    // 5バンドイコライザーの周波数設定
    private bands: BandConfig[];
    // BiquadFilterNodeの配列
    private filters: FilterData[];
    // イコライザーの有効状態
    private isEnabled: boolean;
    // バイパス用ゲインノード
    private bypassGain: GainNode | null;
    private eqGain: GainNode | null;
    // 設定監視用
    private configWatchers: Set<string>;
    constructor(audioContext: AudioContext, inputNode: AudioNode, outputNode: AudioNode) {

        this.audioContext = audioContext;
        this.inputNode = inputNode;
        this.outputNode = outputNode;
        ';'
        // 設定管理

    }
    }'
        this.configManager = getConfigurationManager('' })'
            { name: 'bass', frequency: 60, type: 'lowshelf' as BiquadFilterType, gain: 0 },       // 低音 (60Hz')''
            { name: 'lowMid', frequency: 250, type: 'peaking' as BiquadFilterType, gain: 0 },    // 中低音 (250Hz')''
            { name: 'mid', frequency: 1000, type: 'peaking' as BiquadFilterType, gain: 0 },      // 中音 (1kHz')''
            { name: 'highMid', frequency: 4000, type: 'peaking' as BiquadFilterType, gain: 0 },  // 中高音 (4kHz')''
            { name: 'treble', frequency: 16000, type: 'highshelf' as BiquadFilterType, gain: 0 } // 高音 (16kHz)
        ];
        
        // BiquadFilterNodeの配列
        this.filters = [];
        
        // イコライザーの有効状態
        this.isEnabled = false;
        
        // バイパス用ゲインノード
        this.bypassGain = null;
        this.eqGain = null;
        
        // 設定監視用
        this.configWatchers = new Set();
        
        this.initialize();
    }
    
    /**
     * イコライザーシステムを初期化
     */
    private initialize(): void { try {
            // AudioContextの存在確認
            if(!this.audioContext') {'
                ';'
            }'
                throw new Error('AudioContext not provided'); }
            }
            
            // バイパス制御用のゲインノード
            this.bypassGain = this.audioContext.createGain();
            this.eqGain = this.audioContext.createGain();
            
            // ゲインノードの初期設定
            if (this.bypassGain) { this.bypassGain.gain.value = 1.0; }
            }
            if (this.eqGain) { this.eqGain.gain.value = 0.0; }
            }
            
            // 各周波数帯域のフィルターを作成
            this.filters = this.bands.map((band, index) => {  ''
                const filter = this.audioContext.createBiquadFilter(''';
                filter.Q.value = band.type === 'peaking' ? 1.0 : 0.7; // ピーキングフィルターはQ値を高く
                );
                return { ...band) }
                    filter, };
                    index }
                };)
            });
            
            // フィルターチェーンを構築
            this.connectFilters();
            
            // 設定からイコライザー状態を読み込み
            this.loadEqualizerSettings();
            ;
            // 設定変更の監視を開始
            this.setupConfigWatchers()';
            console.log('Equalizer initialized successfully');'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {')'
                operation: 'equalizer_initialize',')';
                component: 'Equalizer') }
            });
        }
    }
    
    /**
     * フィルターチェーンを接続
     */
    private connectFilters(): void { try {
            // AudioNode の存在確認
            if(!this.inputNode || !this.eqGain || !this.bypassGain') {'
                '';
                console.warn('Equalizer: Required AudioNodes not initialized'),
            }
                return; }
            }
            
            // 入力 -> 最初のフィルター
            if(this.filters.length > 0) {
                this.inputNode.connect(this.filters[0].filter);
                
                // フィルター間の接続
                for (let i = 0; i < this.filters.length - 1; i++) {
                    if (this.filters[i].filter && this.filters[i + 1].filter) {
            }
                        this.filters[i].filter.connect(this.filters[i + 1].filter); }
                    }
                }
                
                // 最後のフィルター -> EQゲイン -> 出力
                const lastFilter = this.filters[this.filters.length - 1];
                if (lastFilter && lastFilter.filter) { lastFilter.filter.connect(this.eqGain); }
                }
            } else {  // フィルターがない場合は直接接続 }
                this.inputNode.connect(this.eqGain); }
            }
            
            // バイパス経路: 入力 -> バイパスゲイン -> 出力
            this.inputNode.connect(this.bypassGain);
            
            // 初期状態の接続を設定
            this.updateBypassState();
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {')'
                operation: 'connect_filters',')';
                component: 'Equalizer') }
            });
        }
    }
    
    /**
     * 設定システムからイコライザー設定を読み込み'
     */''
    private loadEqualizerSettings()';
            const eqSettings = this.configManager.get('audio', 'effects.equalizer') as EqualizerSettings || {};
            
            // 有効状態を読み込み
            this.isEnabled = eqSettings.enabled || false;
            
            // 各バンドのゲイン値を読み込み
            if(eqSettings.bands) {
                '';
                this.bands.forEach((band, index') => { '
                    const savedGain = eqSettings.bands![band.name];'
            }'
                    if (typeof savedGain === 'number') { }
                        this.setBandGain(index, savedGain, false); // 保存はしない }
                    }
                });
            }
            
            this.updateBypassState();
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {')'
                operation: 'load_equalizer_settings',')';
                component: 'Equalizer') }
            });
        }
    }
    
    /**
     * 設定変更の監視を設定'
     */''
    private setupConfigWatchers()';
            const enabledWatcher = this.configManager.watch('audio', 'effects.equalizer.enabled', (newValue) => { this.setEnabled(newValue, false); // 保存はしない（設定システムから来ているため） }
            });
            if (enabledWatcher) this.configWatchers.add(enabledWatcher);
            ;
            // 各バンドのゲイン監視
            this.bands.forEach((band, index') => { ' }'
                const gainWatcher = this.configManager.watch('audio', `effects.equalizer.bands.${band.name}`, (newValue') => {  ''
                    if (typeof newValue === 'number') { }
                        this.setBandGain(index, newValue, false); // 保存はしない }
                    }
                });
                if (gainWatcher) this.configWatchers.add(gainWatcher);
            });
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {')'
                operation: 'setup_config_watchers',')';
                component: 'Equalizer') }
            });
        }
    }
    
    /**
     * イコライザーの有効/無効を設定
     * @param enabled - 有効状態
     * @param saveToConfig - 設定に保存するか（デフォルト: true）'
     */''
    setEnabled(enabled: boolean, saveToConfig: boolean = true'): void { try {'
            if (typeof enabled !== 'boolean') { }
                throw new Error(`Invalid enabled value: ${enabled)`});
            }
            
            this.isEnabled = enabled;
            this.updateBypassState();'
            '';
            if(saveToConfig') {'
                ';'
            }'
                this.configManager.set('audio', 'effects.equalizer.enabled', enabled'); }
            }'
            '';
            console.log(`Equalizer ${enabled ? 'enabled' : 'disabled')`});'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {''
                operation: 'set_enabled',')';
                component: 'Equalizer',);
                enabled); }
            });
        }
    }
    
    /**
     * バイパス状態を更新
     */
    private updateBypassState(): void { try {
            if (!this.bypassGain || !this.eqGain) return;

            // 既存の接続を切断
            this.bypassGain.disconnect();
            this.eqGain.disconnect();
            
            if(this.isEnabled) {
            
                // イコライザー有効: EQ経路を使用
                if (this.eqGain && this.outputNode) {
                    this.eqGain.gain.value = 1.0;
                    this.bypassGain.gain.value = 0.0;
            
            }
                    this.eqGain.connect(this.outputNode); }
                }
            } else {  // イコライザー無効: バイパス経路を使用
                if(this.bypassGain && this.outputNode) {
                    this.eqGain.gain.value = 0.0;
                }
                    this.bypassGain.gain.value = 1.0; }
                    this.bypassGain.connect(this.outputNode); }
                }
            } catch (error) { ''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {')'
                operation: 'update_bypass_state',')';
                component: 'Equalizer') }
            });
        }
    }
    
    /**
     * 特定のバンドのゲインを設定
     * @param bandIndex - バンドインデックス (0-4)
     * @param gain - ゲイン値 (dB, -20 to +20)
     * @param saveToConfig - 設定に保存するか（デフォルト: true）
     */
    setBandGain(bandIndex: number, gain: number, saveToConfig: boolean = true): void { try {
            if (bandIndex < 0 || bandIndex >= this.filters.length) {' }'
                throw new Error(`Invalid band index: ${bandIndex)`'});
            }'
            '';
            if(typeof gain !== 'number' || isNaN(gain) {
                
            }
                throw new Error(`Invalid gain value: ${gain)`});
            }
            
            // ゲイン値を制限
            gain = Math.max(-20, Math.min(20, gain);
            
            const filter = this.filters[bandIndex];
            filter.filter.gain.value = gain;
            filter.gain = gain;
            '';
            if (saveToConfig') { const bandName = this.bands[bandIndex].name;' }'
                this.configManager.set('audio', `effects.equalizer.bands.${bandName)`, gain});
            }
            
            console.log(`Equalizer band ${this.bands[bandIndex].name} gain set to ${gain)dB`});'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {''
                operation: 'set_band_gain',')';
                component: 'Equalizer');
                bandIndex,);
                gain); }
            });
        }
    }
    
    /**
     * 特定のバンドのゲインを取得
     * @param bandIndex - バンドインデックス (0-4)
     * @returns ゲイン値 (dB)
     */
    getBandGain(bandIndex: number): number { try {
            if (bandIndex < 0 || bandIndex >= this.filters.length) { }
                throw new Error(`Invalid band index: ${bandIndex)`});
            }
            
            return this.filters[bandIndex].gain;'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {''
                operation: 'get_band_gain',')';
                component: 'Equalizer',);
                bandIndex); }
            });
            return 0;
        }
    }
    
    /**
     * 全てのバンドのゲイン値を設定
     * @param gains - ゲイン値の配列 [bass, lowMid, mid, highMid, treble]
     * @param saveToConfig - 設定に保存するか（デフォルト: true）
     */
    setAllBandGains(gains: number[], saveToConfig: boolean = true): void { try {
            if (!Array.isArray(gains) || gains.length !== this.bands.length) { }
                throw new Error(`Invalid gains array: expected ${this.bands.length) values`});
            }
            
            gains.forEach((gain, index) => { this.setBandGain(index, gain, saveToConfig); }
            });'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {''
                operation: 'set_all_band_gains',')';
                component: 'Equalizer',);
                gains); }
            });
        }
    }
    
    /**
     * 全てのバンドのゲイン値を取得
     * @returns ゲイン値の配列
     */
    getAllBandGains(): number[] { try {
            return this.filters.map(filter => filter.gain); }'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {')'
                operation: 'get_all_band_gains',')';
                component: 'Equalizer') }
            });
            return new Array(this.bands.length).fill(0);
        }
    }
    
    /**
     * イコライザーをリセット（全バンドを0dBに）
     * @param saveToConfig - 設定に保存するか（デフォルト: true）
     */
    reset(saveToConfig: boolean = true): void { try {
            const zeroGains = new Array(this.bands.length).fill(0);''
            this.setAllBandGains(zeroGains, saveToConfig');'
            '';
            console.log('Equalizer reset to flat response'); }'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {')'
                operation: 'reset',')';
                component: 'Equalizer') }
            });
        }
    }
    
    /**
     * プリセットを適用
     * @param presetName - プリセット名
     * @param saveToConfig - 設定に保存するか（デフォルト: true）
     */
    applyPreset(presetName: string, saveToConfig: boolean = true): void { try {
            const presets = this.getPresets();
            const preset = presets[presetName];
            
            if (!preset) { }
                throw new Error(`Unknown preset: ${presetName)`});
            }
            
            this.setAllBandGains(preset.gains, saveToConfig);
            
            console.log(`Applied equalizer preset: ${presetName)`});'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {''
                operation: 'apply_preset',')';
                component: 'Equalizer',);
                presetName); }
            });
        }
    }
    
    /**
     * 利用可能なプリセットを取得
     * @returns プリセット定義'
     */''
    getPresets(''';
                name: 'フラット','';
                description: '全周波数均等',
                gains: [0, 0, 0, 0, 0];
            },'
            gaming: { ''
                name: 'ゲーム','';
                description: 'ゲーム用最適化',
                gains: [2, 1, 0, 3, 4] // 低音と高音を強調 }
            },
            music: { ''
                name: '音楽','';
                description: '音楽鑑賞用',
                gains: [3, 1, -1, 2, 4] // V字カーブ }
            },
            movie: { ''
                name: '映画','';
                description: '映画鑑賞用',
                gains: [4, 2, -2, 1, 3] // 低音重視 }
            },
            vocal: { ''
                name: 'ボーカル','';
                description: '音声明瞭化',
                gains: [-2, 1, 4, 3, 0] // 中音域強化 }
            },
            bass_boost: { ''
                name: '低音ブースト','';
                description: '低音強化',
                gains: [6, 3, 0, -1, 0] }
            },'
            treble_boost: { ''
                name: '高音ブースト',')';
                description: '高音強化');
                gains: [0, -1, 0, 3, 6] }
            }
        };
    }
    
    /**
     * バンド情報を取得
     * @returns バンド情報の配列
     */
    getBandInfo(): BandInfo[] { return this.bands.map((band, index) => ({
            index,
            name: band.name,
            frequency: band.frequency,
            type: band.type,
            gain: this.filters[index].gain);
            displayName: this.getBandDisplayName(band.name) }
        });
    }
    
    /**
     * バンドの表示名を取得
     * @param bandName - バンド名
     * @returns 表示名'
     */''
    private getBandDisplayName(bandName: string'): string {'
        const displayNames: { [key: string]: string } = { ''
            bass: '低音','';
            lowMid: '中低音','';
            mid: '中音','';
            highMid: '中高音','';
            treble: '高音' }
        },
        return displayNames[bandName] || bandName;
    }
    
    /**
     * 周波数レスポンスデータを生成（視覚化用）
     * @param samplePoints - サンプルポイント数（デフォルト: 256）
     * @returns 周波数レスポンスデータ
     */
    getFrequencyResponse(samplePoints: number = 256): FrequencyResponseData | null { try {
            const frequencies = new Float32Array(samplePoints);
            const magResponse = new Float32Array(samplePoints);
            const phaseResponse = new Float32Array(samplePoints);
            
            // 周波数範囲を設定（20Hz - 20kHz）
            const minFreq = 20;
            const maxFreq = 20000;
            const logMinFreq = Math.log(minFreq);
            const logMaxFreq = Math.log(maxFreq);
            
            for(let i = 0; i < samplePoints; i++) {
            
                const logFreq = logMinFreq + (logMaxFreq - logMinFreq) * i / (samplePoints - 1);
            
            }
                frequencies[i] = Math.exp(logFreq); }
            }
            
            // 各フィルターの周波数レスポンスを合成
            let totalMagResponse = new Float32Array(samplePoints);
            let totalPhaseResponse = new Float32Array(samplePoints);
            
            // 全フィルターを通して合成レスポンスを計算
            this.filters.forEach(filterData => {  );
                filterData.filter.getFrequencyResponse(frequencies, magResponse, phaseResponse);
                
                for(let i = 0; i < samplePoints; i++) {
                
                    if (totalMagResponse[i] === 0) {
                
                }
                        totalMagResponse[i] = magResponse[i]; }
                        totalPhaseResponse[i] = phaseResponse[i]; }
                    } else {  totalMagResponse[i] *= magResponse[i]; }
                        totalPhaseResponse[i] += phaseResponse[i]; }
                    }
                }
            });
            
            return { frequencies: Array.from(frequencies),
                magnitude: Array.from(totalMagResponse),
                phase: Array.from(totalPhaseResponse), };
                magnitudeDB: Array.from(totalMagResponse).map(mag => 20 * Math.log10(mag); }
            };
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {''
                operation: 'get_frequency_response',')';
                component: 'Equalizer',);
                samplePoints); }
            });
            return null;
        }
    }
    
    /**
     * イコライザーの状態情報を取得
     * @returns 状態情報
     */
    getStatus(): EqualizerStatus { return { isEnabled: this.isEnabled,
            bands: this.getBandInfo(),
            presets: Object.keys(this.getPresets(), };
            configWatchers: this.configWatchers.size }
        },
    }
    
    /**
     * リソースの解放
     */
    dispose(): void { try {
            // 設定監視の解除
            if(this.configWatchers) {
                this.configWatchers.forEach(watchId => { )
            }
                    try {); }
                        this.configManager.unwatch(watchId);' }'
                    } catch (error: any') { ''
                        console.warn('Failed to unwatch config:', error.message) }
                    }
                });
                this.configWatchers.clear();
            }
            
            // フィルターを切断
            if(this.filters && Array.isArray(this.filters) {
                this.filters.forEach(filterData => { )
                    try {);
            }
                        if (filterData && filterData.filter) { }
                            filterData.filter.disconnect();' }'
                        } catch (error: any') { ''
                        console.warn('Failed to disconnect filter:', error.message) }
                    }
                });
            }
            
            // ゲインノードを切断
            if(this.bypassGain) {
                try {
            }
                    this.bypassGain.disconnect();' }'
                } catch (error: any') { ''
                    console.warn('Failed to disconnect bypassGain:', error.message) }
                }
            }
            if(this.eqGain) {
                try {
            }'
                    this.eqGain.disconnect();' }'
                } catch (error: any') { ''
                    console.warn('Failed to disconnect eqGain:', error.message') }
                }
            }
            
            this.filters = [];
            this.bypassGain = null;
            this.eqGain = null;'
            '';
            console.log('Equalizer disposed');'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {')'
                operation: 'dispose',')';
                component: 'Equalizer'),' }'
            }');
        }'
    }''
}