import { getErrorHandler } from '../utils/ErrorHandler';
import { getConfigurationManager } from '../core/ConfigurationManager';

// エラーハンドラー型定義
interface ErrorHandler {
    handleError(error: Error, type: string, context?: any): void;
}

// 設定管理型定義
interface ConfigurationManager {
    get(category: string, key?: string, defaultValue?: any): any;
    set(category: string, key: string, value: any): void;
    watch(category: string, key: string, callback: (value: any) => void): any;
    unwatch(watchId: any): void;
}

// 音量設定型定義
interface VolumeSettings {
    master: number;
    bgm: number;
    sfx: number;
    ui: number;
    achievement: number;
    game: number;
}

// イコライザーバンド設定型定義
interface EqualizerBands {
    bass: number;
    lowMid: number;
    mid: number;
    highMid: number;
    treble: number;
}

// イコライザー設定型定義
interface EqualizerSettings {
    enabled: boolean;
    bands: EqualizerBands;
}

// エフェクト設定型定義
interface EffectSettings {
    reverb: boolean;
    compression: boolean;
}

// プリセット設定型定義
interface PresetSettings {
    volumes: VolumeSettings;
    equalizer: EqualizerSettings;
    effects: EffectSettings;
}

// プリセットデータ型定義
interface PresetData {
    id: string;
    name: string;
    description: string;
    type: string;
    settings: PresetSettings;
    tags: string[];
    createdAt: number;
    updatedAt: number;
}

// 現在のプリセット情報型定義
interface CurrentPreset {
    id: string;
    name: string;
    type: string;
    appliedAt: number;
}

// プリセット履歴項目型定義
interface PresetHistoryItem {
    id: string;
    appliedAt: number;
    preset?: PresetData | null;
}

// プリセット数型定義
interface PresetCounts {
    builtin: number;
    user: number;
    temporary: number;
    total: number;
}

// プリセット管理状態型定義
interface PresetManagerStatus {
    initialized: boolean;
    presetCounts: PresetCounts;
    currentPreset: CurrentPreset | null;
    historySize: number;
    configWatchers: number;
}

// エクスポートデータ型定義
interface ExportData {
    version: string;
    exportedAt: number;
    preset: PresetData;
}

// インポートデータ型定義
interface ImportData {
    version?: string;
    preset: Partial<PresetData>;
}

// プリセット更新データ型定義
interface PresetUpdateData {
    name?: string;
    description?: string;
    settings?: Partial<PresetSettings>;
    tags?: string[];
}

// オーディオコントローラー型定義
interface AudioController {
    setVolume(category: string, volume: number): void;
    getAllVolumes(): { levels: VolumeSettings };
    setEqualizerEnabled(enabled: boolean): void;
    setEqualizerGains(gains: number[]): void;
    isEqualizerEnabled(): boolean;
    getEqualizerGains(): number[];
    audioManager?: {
        setAudioEffect(effectType: string, enabled: boolean): void;
    };
}

// プリセット種別
const PRESET_TYPES = {
    BUILTIN: 'builtin';
    USER: 'user';
    TEMPORARY: 'temporary'
} as const;

type PresetType = typeof PRESET_TYPES[keyof typeof PRESET_TYPES];

/**
 * PresetManager - 音響プリセット管理システム
 * 
 * 事前定義プリセットとユーザー定義プリセットの管理を行います。
 * イコライザー、音量、エフェクト設定を統合したプリセット機能を提供。
 */
export class PresetManager {
    private audioController: AudioController;
    private configManager: ConfigurationManager;
    private errorHandler: ErrorHandler;
    
    // 事前定義プリセット
    private builtinPresets: Map<string, PresetData>;
    
    // ユーザー定義プリセット
    private userPresets: Map<string, PresetData>;
    
    // 一時プリセット（セッション中のみ有効）
    private temporaryPresets: Map<string, PresetData>;
    
    // 現在適用されているプリセット
    private currentPreset: CurrentPreset | null;
    
    // プリセット適用履歴（最大10件）
    private presetHistory: PresetHistoryItem[];
    private maxHistorySize: number;
    
    // 設定監視用
    private configWatchers: Set<any>;

    constructor(audioController: AudioController) {
        this.audioController = audioController;
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        
        // 事前定義プリセット
        this.builtinPresets = new Map<string, PresetData>();
        
        // ユーザー定義プリセット
        this.userPresets = new Map<string, PresetData>();
        
        // 一時プリセット（セッション中のみ有効）
        this.temporaryPresets = new Map<string, PresetData>();
        
        // 現在適用されているプリセット
        this.currentPreset = null;
        
        // プリセット適用履歴（最大10件）
        this.presetHistory = [];
        this.maxHistorySize = 10;
        
        // 設定監視用
        this.configWatchers = new Set();
        
        this.initialize();
    }
    
    /**
     * プリセットマネージャーを初期化
     */
    initialize(): void {
        try {
            // 事前定義プリセットを初期化
            this._initializeBuiltinPresets();
            
            // ユーザー定義プリセットを読み込み
            this._loadUserPresets();
            
            // 設定変更の監視を開始
            this._setupConfigWatchers();
            
            // 最後に適用されたプリセットを復元
            this._restoreLastPreset();
            
            console.log('PresetManager initialized successfully');
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {
                operation: 'initialize';
                component: 'PresetManager'
            });
        }
    }
    
    /**
     * 事前定義プリセットを初期化
     * @private
     */
    private _initializeBuiltinPresets(): void {
        try {
            // ゲーミングプリセット
            this.builtinPresets.set('gaming', {
                id: 'gaming';
                name: 'ゲーミング';
                description: 'ゲームプレイ用に最適化された音響設定';
                type: PRESET_TYPES.BUILTIN;
                settings: {
                    volumes: {
                        master: 0.8;
                        bgm: 0.6;
                        sfx: 0.9;
                        ui: 0.7;
                        achievement: 0.8;
                        game: 0.8
                    };
                    equalizer: {
                        enabled: true;
                        bands: {
                            bass: 2;
                            lowMid: 1;
                            mid: 0;
                            highMid: 2;
                            treble: 3
                        }
                    };
                    effects: {
                        reverb: false;
                        compression: true
                    }
                };
                tags: ['ゲーム', 'アクション', '集中'];
                createdAt: Date.now();
                updatedAt: Date.now()
            });
            
            // 音楽鑑賞プリセット
            this.builtinPresets.set('music', {
                id: 'music';
                name: '音楽鑑賞';
                description: '音楽を楽しむための音響設定';
                type: PRESET_TYPES.BUILTIN;
                settings: {
                    volumes: {
                        master: 0.7;
                        bgm: 0.8;
                        sfx: 0.4;
                        ui: 0.3;
                        achievement: 0.5;
                        game: 0.6
                    };
                    equalizer: {
                        enabled: true;
                        bands: {
                            bass: 1;
                            lowMid: 0;
                            mid: -1;
                            highMid: 0;
                            treble: 1
                        }
                    };
                    effects: {
                        reverb: true;
                        compression: false
                    }
                };
                tags: ['音楽', 'リラックス', 'BGM'];
                createdAt: Date.now();
                updatedAt: Date.now()
            });
            
            // 静音プリセット
            this.builtinPresets.set('quiet', {
                id: 'quiet';
                name: '静音モード';
                description: '夜間や集中作業に適した低音量設定';
                type: PRESET_TYPES.BUILTIN;
                settings: {
                    volumes: {
                        master: 0.3;
                        bgm: 0.2;
                        sfx: 0.4;
                        ui: 0.5;
                        achievement: 0.3;
                        game: 0.3
                    };
                    equalizer: {
                        enabled: true;
                        bands: {
                            bass: -2;
                            lowMid: -1;
                            mid: 1;
                            highMid: 0;
                            treble: -1
                        }
                    };
                    effects: {
                        reverb: false;
                        compression: true
                    }
                };
                tags: ['静音', '夜間', '集中'];
                createdAt: Date.now();
                updatedAt: Date.now()
            });
            
            // デフォルトプリセット
            this.builtinPresets.set('default', {
                id: 'default';
                name: 'デフォルト';
                description: '標準的な音響設定';
                type: PRESET_TYPES.BUILTIN;
                settings: {
                    volumes: {
                        master: 0.7;
                        bgm: 0.7;
                        sfx: 0.7;
                        ui: 0.7;
                        achievement: 0.7;
                        game: 0.7
                    };
                    equalizer: {
                        enabled: false;
                        bands: {
                            bass: 0;
                            lowMid: 0;
                            mid: 0;
                            highMid: 0;
                            treble: 0
                        }
                    };
                    effects: {
                        reverb: false;
                        compression: false
                    }
                };
                tags: ['デフォルト', 'バランス'];
                createdAt: Date.now();
                updatedAt: Date.now()
            });
            
            console.log(`Initialized ${this.builtinPresets.size} builtin presets`);
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {
                operation: '_initializeBuiltinPresets';
                component: 'PresetManager'
            });
        }
    }
    
    /**
     * ユーザー定義プリセットを読み込み
     * @private
     */
    private _loadUserPresets(): void {
        try {
            const savedPresets = this.configManager.get('audio', 'userPresets', {});
            
            for (const [id, presetData] of Object.entries(savedPresets)) {
                if (this._isValidPresetData(presetData)) {
                    this.userPresets.set(id, presetData as PresetData);
                }
            }
            
            console.log(`Loaded ${this.userPresets.size} user presets`);
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {
                operation: '_loadUserPresets';
                component: 'PresetManager'
            });
        }
    }
    
    /**
     * 設定変更の監視を開始
     * @private
     */
    private _setupConfigWatchers(): void {
        try {
            // ユーザープリセットの変更監視
            const userPresetsWatcher = this.configManager.watch(
                'audio';
                'userPresets';
                (newPresets: any) => {
                    this._onUserPresetsChanged(newPresets);
                }
            );
            this.configWatchers.add(userPresetsWatcher);
            
            console.log('Config watchers set up successfully');
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {
                operation: '_setupConfigWatchers';
                component: 'PresetManager'
            });
        }
    }
    
    /**
     * 最後に適用されたプリセットを復元
     * @private
     */
    private _restoreLastPreset(): void {
        try {
            const lastPresetId = this.configManager.get('audio', 'lastPresetId', 'default');
            
            if (lastPresetId && this.hasPreset(lastPresetId)) {
                this.applyPreset(lastPresetId);
            } else {
                // デフォルトプリセットを適用
                this.applyPreset('default');
            }
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {
                operation: '_restoreLastPreset';
                component: 'PresetManager'
            });
        }
    }
    
    /**
     * プリセットデータの妥当性を検証
     * @private
     */
    private _isValidPresetData(data: any): boolean {
        return data && 
               typeof data.id === 'string' &&
               typeof data.name === 'string' &&
               typeof data.type === 'string' &&
               data.settings &&
               data.settings.volumes &&
               data.settings.equalizer &&
               data.settings.effects;
    }
    
    /**
     * ユーザープリセット変更時の処理
     * @private
     */
    private _onUserPresetsChanged(newPresets: any): void {
        try {
            this.userPresets.clear();
            
            for (const [id, presetData] of Object.entries(newPresets)) {
                if (this._isValidPresetData(presetData)) {
                    this.userPresets.set(id, presetData as PresetData);
                }
            }
            
            console.log(`User presets updated: ${this.userPresets.size} presets`);
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {
                operation: '_onUserPresetsChanged';
                component: 'PresetManager'
            });
        }
    }
    
    /**
     * プリセットを適用
     */
    applyPreset(presetId: string): boolean {
        try {
            const preset = this.getPreset(presetId);
            if (!preset) {
                throw new Error(`Preset not found: ${presetId}`);
            }
            
            // 音量設定を適用
            this._applyVolumeSettings(preset.settings.volumes);
            
            // イコライザー設定を適用
            this._applyEqualizerSettings(preset.settings.equalizer);
            
            // エフェクト設定を適用
            this._applyEffectSettings(preset.settings.effects);
            
            // 現在のプリセットを更新
            this.currentPreset = {
                id: preset.id;
                name: preset.name;
                type: preset.type;
                appliedAt: Date.now()
            };
            
            // 履歴に追加
            this._addToHistory(preset);
            
            // 最後に適用されたプリセットとして保存
            this.configManager.set('audio', 'lastPresetId', presetId);
            
            console.log(`Applied preset: ${preset.name} (${presetId})`);
            return true;
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {
                operation: 'applyPreset';
                component: 'PresetManager';
                presetId
            });
            return false;
        }
    }
    
    /**
     * 音量設定を適用
     * @private
     */
    private _applyVolumeSettings(volumes: VolumeSettings): void {
        for (const [category, volume] of Object.entries(volumes)) {
            this.audioController.setVolume(category, volume);
        }
    }
    
    /**
     * イコライザー設定を適用
     * @private
     */
    private _applyEqualizerSettings(equalizer: EqualizerSettings): void {
        this.audioController.setEqualizerEnabled(equalizer.enabled);
        
        if (equalizer.enabled) {
            const gains = Object.values(equalizer.bands);
            this.audioController.setEqualizerGains(gains);
        }
    }
    
    /**
     * エフェクト設定を適用
     * @private
     */
    private _applyEffectSettings(effects: EffectSettings): void {
        if (this.audioController.audioManager) {
            this.audioController.audioManager.setAudioEffect('reverb', effects.reverb);
            this.audioController.audioManager.setAudioEffect('compression', effects.compression);
        }
    }
    
    /**
     * 履歴に追加
     * @private
     */
    private _addToHistory(preset: PresetData): void {
        const historyItem: PresetHistoryItem = {
            id: preset.id;
            appliedAt: Date.now();
            preset
        };
        
        this.presetHistory.unshift(historyItem);
        
        if (this.presetHistory.length > this.maxHistorySize) {
            this.presetHistory = this.presetHistory.slice(0, this.maxHistorySize);
        }
    }
    
    /**
     * プリセットの存在確認
     */
    hasPreset(presetId: string): boolean {
        return this.builtinPresets.has(presetId) ||
               this.userPresets.has(presetId) ||
               this.temporaryPresets.has(presetId);
    }
    
    /**
     * プリセットを取得
     */
    getPreset(presetId: string): PresetData | null {
        return this.builtinPresets.get(presetId) ||
               this.userPresets.get(presetId) ||
               this.temporaryPresets.get(presetId) ||
               null;
    }
    
    /**
     * 全プリセットを取得
     */
    getAllPresets(): PresetData[] {
        const allPresets: PresetData[] = [];
        
        // 事前定義プリセット
        allPresets.push(...this.builtinPresets.values());
        
        // ユーザー定義プリセット
        allPresets.push(...this.userPresets.values());
        
        // 一時プリセット
        allPresets.push(...this.temporaryPresets.values());
        
        return allPresets;
    }
    
    /**
     * タイプ別プリセット取得
     */
    getPresetsByType(type: PresetType): PresetData[] {
        switch (type) {
            case PRESET_TYPES.BUILTIN:
                return Array.from(this.builtinPresets.values());
            case PRESET_TYPES.USER:
                return Array.from(this.userPresets.values());
            case PRESET_TYPES.TEMPORARY:
                return Array.from(this.temporaryPresets.values());
            default:
                return [];
        }
    }
    
    /**
     * ユーザープリセットを作成
     */
    createUserPreset(id: string, name: string, description: string = '', tags: string[] = []): boolean {
        try {
            if (this.hasPreset(id)) {
                throw new Error(`Preset already exists: ${id}`);
            }
            
            // 現在の設定を取得
            const currentSettings = this._getCurrentSettings();
            
            const preset: PresetData = {
                id;
                name;
                description;
                type: PRESET_TYPES.USER;
                settings: currentSettings;
                tags;
                createdAt: Date.now();
                updatedAt: Date.now()
            };
            
            this.userPresets.set(id, preset);
            this._saveUserPresets();
            
            console.log(`Created user preset: ${name} (${id})`);
            return true;
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {
                operation: 'createUserPreset';
                component: 'PresetManager';
                presetId: id
            });
            return false;
        }
    }
    
    /**
     * 現在の設定を取得
     * @private
     */
    private _getCurrentSettings(): PresetSettings {
        const volumes = this.audioController.getAllVolumes().levels;
        const equalizerEnabled = this.audioController.isEqualizerEnabled();
        const equalizerGains = this.audioController.getEqualizerGains();
        
        return {
            volumes;
            equalizer: {
                enabled: equalizerEnabled;
                bands: {
                    bass: equalizerGains[0] || 0;
                    lowMid: equalizerGains[1] || 0;
                    mid: equalizerGains[2] || 0;
                    highMid: equalizerGains[3] || 0;
                    treble: equalizerGains[4] || 0
                }
            };
            effects: {
                reverb: false, // デフォルト値
                compression: false // デフォルト値
            }
        };
    }
    
    /**
     * ユーザープリセットを保存
     * @private
     */
    private _saveUserPresets(): void {
        try {
            const presetsData: { [key: string]: PresetData } = {};
            
            for (const [id, preset] of this.userPresets) {
                presetsData[id] = preset;
            }
            
            this.configManager.set('audio', 'userPresets', presetsData);
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {
                operation: '_saveUserPresets';
                component: 'PresetManager'
            });
        }
    }
    
    /**
     * ユーザープリセットを更新
     */
    updateUserPreset(presetId: string, updateData: PresetUpdateData): boolean {
        try {
            const preset = this.userPresets.get(presetId);
            if (!preset || preset.type !== PRESET_TYPES.USER) {
                throw new Error(`User preset not found: ${presetId}`);
            }
            
            if (updateData.name) preset.name = updateData.name;
            if (updateData.description !== undefined) preset.description = updateData.description;
            if (updateData.tags) preset.tags = updateData.tags;
            if (updateData.settings) {
                preset.settings = { ...preset.settings, ...updateData.settings };
            }
            
            preset.updatedAt = Date.now();
            
            this._saveUserPresets();
            
            console.log(`Updated user preset: ${preset.name} (${presetId})`);
            return true;
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {
                operation: 'updateUserPreset';
                component: 'PresetManager';
                presetId
            });
            return false;
        }
    }
    
    /**
     * ユーザープリセットを削除
     */
    deleteUserPreset(presetId: string): boolean {
        try {
            const preset = this.userPresets.get(presetId);
            if (!preset || preset.type !== PRESET_TYPES.USER) {
                throw new Error(`User preset not found: ${presetId}`);
            }
            
            this.userPresets.delete(presetId);
            this._saveUserPresets();
            
            // 現在適用中のプリセットが削除された場合はデフォルトに戻す
            if (this.currentPreset && this.currentPreset.id === presetId) {
                this.applyPreset('default');
            }
            
            console.log(`Deleted user preset: ${preset.name} (${presetId})`);
            return true;
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {
                operation: 'deleteUserPreset';
                component: 'PresetManager';
                presetId
            });
            return false;
        }
    }
    
    /**
     * 現在のプリセットを取得
     */
    getCurrentPreset(): CurrentPreset | null {
        return this.currentPreset;
    }
    
    /**
     * プリセット適用履歴を取得
     */
    getPresetHistory(): PresetHistoryItem[] {
        return [...this.presetHistory];
    }
    
    /**
     * プリセット数を取得
     */
    getPresetCounts(): PresetCounts {
        return {
            builtin: this.builtinPresets.size;
            user: this.userPresets.size;
            temporary: this.temporaryPresets.size;
            total: this.builtinPresets.size + this.userPresets.size + this.temporaryPresets.size
        };
    }
    
    /**
     * プリセットマネージャーの状態を取得
     */
    getStatus(): PresetManagerStatus {
        return {
            initialized: this.builtinPresets.size > 0;
            presetCounts: this.getPresetCounts();
            currentPreset: this.currentPreset;
            historySize: this.presetHistory.length;
            configWatchers: this.configWatchers.size
        };
    }
    
    /**
     * プリセットをエクスポート
     */
    exportPreset(presetId: string): ExportData | null {
        try {
            const preset = this.getPreset(presetId);
            if (!preset) {
                throw new Error(`Preset not found: ${presetId}`);
            }
            
            return {
                version: '1.0';
                exportedAt: Date.now();
                preset
            };
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {
                operation: 'exportPreset';
                component: 'PresetManager';
                presetId
            });
            return null;
        }
    }
    
    /**
     * プリセットをインポート
     */
    importPreset(importData: ImportData): boolean {
        try {
            if (!importData.preset || !importData.preset.id || !importData.preset.name) {
                throw new Error('Invalid import data');
            }
            
            const preset: PresetData = {
                id: importData.preset.id;
                name: importData.preset.name;
                description: importData.preset.description || '';
                type: PRESET_TYPES.USER;
                settings: importData.preset.settings || this._getDefaultSettings();
                tags: importData.preset.tags || [];
                createdAt: importData.preset.createdAt || Date.now();
                updatedAt: Date.now()
            };
            
            this.userPresets.set(preset.id, preset);
            this._saveUserPresets();
            
            console.log(`Imported preset: ${preset.name} (${preset.id})`);
            return true;
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {
                operation: 'importPreset';
                component: 'PresetManager'
            });
            return false;
        }
    }
    
    /**
     * デフォルト設定を取得
     * @private
     */
    private _getDefaultSettings(): PresetSettings {
        return {
            volumes: {
                master: 0.7;
                bgm: 0.7;
                sfx: 0.7;
                ui: 0.7;
                achievement: 0.7;
                game: 0.7
            };
            equalizer: {
                enabled: false;
                bands: {
                    bass: 0;
                    lowMid: 0;
                    mid: 0;
                    highMid: 0;
                    treble: 0
                }
            };
            effects: {
                reverb: false;
                compression: false
            }
        };
    }
    
    /**
     * リソースをクリーンアップ
     */
    dispose(): void {
        try {
            // 設定監視を停止
            for (const watcherId of this.configWatchers) {
                this.configManager.unwatch(watcherId);
            }
            this.configWatchers.clear();
            
            // プリセットデータをクリア
            this.builtinPresets.clear();
            this.userPresets.clear();
            this.temporaryPresets.clear();
            
            // 履歴をクリア
            this.presetHistory = [];
            this.currentPreset = null;
            
            console.log('PresetManager disposed successfully');
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'AUDIO_ERROR', {
                operation: 'dispose';
                component: 'PresetManager'
            });
        }
    }
}

export { PRESET_TYPES };
export type {
    PresetData;
    PresetSettings;
    VolumeSettings;
    EqualizerSettings;
    EffectSettings;
    CurrentPreset;
    PresetManagerStatus;
    ExportData;
    ImportData;
    PresetUpdateData
};