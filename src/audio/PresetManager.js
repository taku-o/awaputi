import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

/**
 * PresetManager - 音響プリセット管理システム
 * 
 * 事前定義プリセットとユーザー定義プリセットの管理を行います。
 * イコライザー、音量、エフェクト設定を統合したプリセット機能を提供。
 */
export class PresetManager {
    constructor(audioController) {
        this.audioController = audioController;
        this.configManager = getConfigurationManager();
        
        // プリセット種別
        this.presetTypes = {
            BUILTIN: 'builtin',      // システム定義プリセット
            USER: 'user',            // ユーザー定義プリセット
            TEMPORARY: 'temporary'    // 一時プリセット
        };
        
        // 事前定義プリセット
        this.builtinPresets = new Map();
        
        // ユーザー定義プリセット
        this.userPresets = new Map();
        
        // 一時プリセット（セッション中のみ有効）
        this.temporaryPresets = new Map();
        
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
    initialize() {
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
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'initialize',
                component: 'PresetManager'
            });
        }
    }
    
    /**
     * 事前定義プリセットを初期化
     * @private
     */
    _initializeBuiltinPresets() {
        try {
            // ゲーム用プリセット
            this.builtinPresets.set('gaming', {
                id: 'gaming',
                name: 'ゲーム',
                description: 'ゲームプレイに最適化された音響設定',
                type: this.presetTypes.BUILTIN,
                settings: {
                    volumes: {
                        master: 0.8,
                        bgm: 0.6,
                        sfx: 0.9,
                        ui: 0.7,
                        achievement: 1.0,
                        game: 0.8
                    },
                    equalizer: {
                        enabled: true,
                        bands: {
                            bass: 3,      // 低音強化（爆発音等）
                            lowMid: 1,    // 中低音軽微強化
                            mid: 0,       // 中音フラット
                            highMid: 4,   // 中高音強化（UI音等）
                            treble: 5     // 高音強化（効果音等）
                        }
                    },
                    effects: {
                        reverb: true,
                        compression: true
                    }
                },
                tags: ['gaming', 'action', 'immersive'],
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            
            // 音楽鑑賞用プリセット
            this.builtinPresets.set('music', {
                id: 'music',
                name: '音楽',
                description: '音楽鑑賞に最適化された音響設定',
                type: this.presetTypes.BUILTIN,
                settings: {
                    volumes: {
                        master: 0.7,
                        bgm: 0.9,
                        sfx: 0.3,
                        ui: 0.4,
                        achievement: 0.6,
                        game: 0.3
                    },
                    equalizer: {
                        enabled: true,
                        bands: {
                            bass: 4,      // 低音重視
                            lowMid: 2,    // 中低音強化
                            mid: -1,      // 中音軽微カット
                            highMid: 3,   // 中高音強化
                            treble: 5     // 高音強化（クリア感）
                        }
                    },
                    effects: {
                        reverb: true,
                        compression: false  // 音楽では圧縮を避ける
                    }
                },
                tags: ['music', 'audio', 'quality'],
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            
            // 映画・動画鑑賞用プリセット
            this.builtinPresets.set('movie', {
                id: 'movie',
                name: '映画',
                description: '映画・動画鑑賞に最適化された音響設定',
                type: this.presetTypes.BUILTIN,
                settings: {
                    volumes: {
                        master: 0.8,
                        bgm: 0.8,
                        sfx: 0.7,
                        ui: 0.3,
                        achievement: 0.5,
                        game: 0.6
                    },
                    equalizer: {
                        enabled: true,
                        bands: {
                            bass: 6,      // 低音大幅強化（迫力）
                            lowMid: 3,    // 中低音強化
                            mid: -2,      // 中音カット（クリア感）
                            highMid: 2,   // 中高音軽微強化
                            treble: 4     // 高音強化（臨場感）
                        }
                    },
                    effects: {
                        reverb: true,
                        compression: true
                    }
                },
                tags: ['movie', 'cinematic', 'immersive'],
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            
            // 音声会話用プリセット
            this.builtinPresets.set('vocal', {
                id: 'vocal',
                name: 'ボーカル',
                description: '音声・会話の明瞭度を重視した設定',
                type: this.presetTypes.BUILTIN,
                settings: {
                    volumes: {
                        master: 0.8,
                        bgm: 0.4,
                        sfx: 0.5,
                        ui: 0.6,
                        achievement: 0.7,
                        game: 0.6
                    },
                    equalizer: {
                        enabled: true,
                        bands: {
                            bass: -3,     // 低音カット
                            lowMid: 1,    // 中低音軽微強化
                            mid: 5,       // 中音大幅強化（音声帯域）
                            highMid: 4,   // 中高音強化（子音明瞭化）
                            treble: 1     // 高音軽微強化
                        }
                    },
                    effects: {
                        reverb: false,  // リバーブは音声を不明瞭にする
                        compression: true
                    }
                },
                tags: ['vocal', 'speech', 'clarity'],
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            
            // 低音ブーストプリセット
            this.builtinPresets.set('bass_boost', {
                id: 'bass_boost',
                name: '低音ブースト',
                description: '低音を大幅に強化したパワフルな設定',
                type: this.presetTypes.BUILTIN,
                settings: {
                    volumes: {
                        master: 0.7,  // マスター音量を下げて歪みを防止
                        bgm: 0.8,
                        sfx: 0.8,
                        ui: 0.6,
                        achievement: 0.8,
                        game: 0.7
                    },
                    equalizer: {
                        enabled: true,
                        bands: {
                            bass: 8,      // 低音最大レベル強化
                            lowMid: 4,    // 中低音強化
                            mid: 0,       // 中音フラット
                            highMid: -1,  // 中高音軽微カット
                            treble: 1     // 高音軽微強化
                        }
                    },
                    effects: {
                        reverb: true,
                        compression: true  // 歪みを抑制
                    }
                },
                tags: ['bass', 'powerful', 'enhanced'],
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            
            // 高音ブーストプリセット
            this.builtinPresets.set('treble_boost', {
                id: 'treble_boost',
                name: '高音ブースト',
                description: '高音域を強化したクリアで鮮明な設定',
                type: this.presetTypes.BUILTIN,
                settings: {
                    volumes: {
                        master: 0.8,
                        bgm: 0.7,
                        sfx: 0.8,
                        ui: 0.8,
                        achievement: 0.9,
                        game: 0.7
                    },
                    equalizer: {
                        enabled: true,
                        bands: {
                            bass: 0,      // 低音フラット
                            lowMid: -1,   // 中低音軽微カット
                            mid: 1,       // 中音軽微強化
                            highMid: 4,   // 中高音強化
                            treble: 8     // 高音最大レベル強化
                        }
                    },
                    effects: {
                        reverb: false,  // リバーブは高音の明瞭度を下げる
                        compression: false
                    }
                },
                tags: ['treble', 'bright', 'clear'],
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            
            // フラット（中立）プリセット
            this.builtinPresets.set('flat', {
                id: 'flat',
                name: 'フラット',
                description: 'すべての周波数を均等にした中立的な設定',
                type: this.presetTypes.BUILTIN,
                settings: {
                    volumes: {
                        master: 0.7,
                        bgm: 0.7,
                        sfx: 0.7,
                        ui: 0.7,
                        achievement: 0.7,
                        game: 0.7
                    },
                    equalizer: {
                        enabled: false,  // イコライザーは無効
                        bands: {
                            bass: 0,
                            lowMid: 0,
                            mid: 0,
                            highMid: 0,
                            treble: 0
                        }
                    },
                    effects: {
                        reverb: false,
                        compression: false
                    }
                },
                tags: ['neutral', 'flat', 'original'],
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            
            console.log(`${this.builtinPresets.size} builtin presets initialized`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_initializeBuiltinPresets',
                component: 'PresetManager'
            });
        }
    }
    
    /**
     * ユーザー定義プリセットを読み込み
     * @private
     */
    _loadUserPresets() {
        try {
            const savedPresets = this.configManager.get('audio', 'presets.user') || {};
            
            for (const [id, presetData] of Object.entries(savedPresets)) {
                if (this._validatePresetData(presetData)) {
                    this.userPresets.set(id, {
                        ...presetData,
                        type: this.presetTypes.USER
                    });
                } else {
                    console.warn(`Invalid user preset data for ID: ${id}`);
                }
            }
            
            console.log(`${this.userPresets.size} user presets loaded`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_loadUserPresets',
                component: 'PresetManager'
            });
        }
    }
    
    /**
     * 設定変更の監視を設定
     * @private
     */
    _setupConfigWatchers() {
        try {
            // ユーザープリセットの変更監視
            const userPresetsWatcher = this.configManager.watch('audio', 'presets.user', (newValue) => {
                this._loadUserPresets();
            });
            if (userPresetsWatcher) this.configWatchers.add(userPresetsWatcher);
            
            console.log('Preset config watchers set up successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_setupConfigWatchers',
                component: 'PresetManager'
            });
        }
    }
    
    /**
     * 最後に適用されたプリセットを復元
     * @private
     */
    _restoreLastPreset() {
        try {
            const lastPresetId = this.configManager.get('audio', 'presets.lastApplied');
            
            if (lastPresetId) {
                const preset = this.getPreset(lastPresetId);
                if (preset) {
                    this.applyPreset(lastPresetId, false); // 保存はしない（復元なので）
                    console.log(`Last preset restored: ${lastPresetId}`);
                }
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_restoreLastPreset',
                component: 'PresetManager'
            });
        }
    }
    
    /**
     * プリセットデータの妥当性を検証
     * @param {Object} presetData - プリセットデータ
     * @returns {boolean} 妥当性
     * @private
     */
    _validatePresetData(presetData) {
        try {
            if (!presetData || typeof presetData !== 'object') {
                return false;
            }
            
            // 必須フィールドの確認
            if (!presetData.id || !presetData.name || !presetData.settings) {
                return false;
            }
            
            // 設定構造の確認
            const settings = presetData.settings;
            if (!settings.volumes || !settings.equalizer) {
                return false;
            }
            
            // 音量設定の確認
            const volumes = settings.volumes;
            const requiredVolumeKeys = ['master', 'bgm', 'sfx', 'ui', 'achievement', 'game'];
            for (const key of requiredVolumeKeys) {
                if (typeof volumes[key] !== 'number' || volumes[key] < 0 || volumes[key] > 1) {
                    return false;
                }
            }
            
            // イコライザー設定の確認
            const equalizer = settings.equalizer;
            if (typeof equalizer.enabled !== 'boolean' || !equalizer.bands) {
                return false;
            }
            
            const bands = equalizer.bands;
            const requiredBandKeys = ['bass', 'lowMid', 'mid', 'highMid', 'treble'];
            for (const key of requiredBandKeys) {
                if (typeof bands[key] !== 'number' || bands[key] < -20 || bands[key] > 20) {
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_validatePresetData',
                component: 'PresetManager'
            });
            return false;
        }
    }
    
    /**
     * プリセットを適用
     * @param {string} presetId - プリセットID
     * @param {boolean} saveAsLast - 最後に適用したプリセットとして保存するか（デフォルト: true）
     * @returns {boolean} 適用成功
     */
    applyPreset(presetId, saveAsLast = true) {
        try {
            const preset = this.getPreset(presetId);
            if (!preset) {
                throw new Error(`Preset not found: ${presetId}`);
            }
            
            console.log(`Applying preset: ${preset.name} (${presetId})`);
            
            const settings = preset.settings;
            
            // 音量設定を適用
            if (settings.volumes) {
                for (const [category, volume] of Object.entries(settings.volumes)) {
                    this.audioController.setVolume(category, volume);
                }
            }
            
            // イコライザー設定を適用
            if (settings.equalizer) {
                // イコライザーの有効/無効を設定
                this.audioController.setEqualizerEnabled(settings.equalizer.enabled);
                
                // バンドゲインを適用
                if (settings.equalizer.bands) {
                    const gains = [
                        settings.equalizer.bands.bass,
                        settings.equalizer.bands.lowMid,
                        settings.equalizer.bands.mid,
                        settings.equalizer.bands.highMid,
                        settings.equalizer.bands.treble
                    ];
                    this.audioController.setEqualizerGains(gains);
                }
            }
            
            // エフェクト設定を適用
            if (settings.effects) {
                if (typeof settings.effects.reverb === 'boolean') {
                    this.audioController.audioManager.setAudioEffect('reverb', settings.effects.reverb);
                }
                if (typeof settings.effects.compression === 'boolean') {
                    this.audioController.audioManager.setAudioEffect('compression', settings.effects.compression);
                }
            }
            
            // 現在のプリセットを更新
            this.currentPreset = {
                id: presetId,
                name: preset.name,
                type: preset.type,
                appliedAt: Date.now()
            };
            
            // 履歴に追加
            this._addToHistory(presetId);
            
            // 最後に適用したプリセットとして保存
            if (saveAsLast) {
                this.configManager.set('audio', 'presets.lastApplied', presetId);
            }
            
            console.log(`Preset applied successfully: ${preset.name}`);
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'applyPreset',
                component: 'PresetManager',
                presetId: presetId
            });
            return false;
        }
    }
    
    /**
     * 現在の設定をプリセットとして保存
     * @param {string} name - プリセット名
     * @param {string} description - プリセット説明
     * @param {Array<string>} tags - タグ配列
     * @param {boolean} isTemporary - 一時プリセットとして保存するか（デフォルト: false）
     * @returns {string|null} 作成されたプリセットID
     */
    saveCurrentAsPreset(name, description = '', tags = [], isTemporary = false) {
        try {
            // 現在の設定を取得
            const currentSettings = this._getCurrentSettings();
            
            // プリセットIDを生成
            const presetId = this._generatePresetId(name);
            
            // プリセットデータを作成
            const presetData = {
                id: presetId,
                name: name,
                description: description,
                type: isTemporary ? this.presetTypes.TEMPORARY : this.presetTypes.USER,
                settings: currentSettings,
                tags: tags,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            // プリセットを保存
            if (isTemporary) {
                this.temporaryPresets.set(presetId, presetData);
            } else {
                this.userPresets.set(presetId, presetData);
                this._saveUserPresets();
            }
            
            console.log(`Preset saved: ${name} (${presetId})`);
            return presetId;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'saveCurrentAsPreset',
                component: 'PresetManager',
                name: name
            });
            return null;
        }
    }
    
    /**
     * 現在の設定を取得
     * @returns {Object} 現在の設定
     * @private
     */
    _getCurrentSettings() {
        try {
            // 音量設定を取得
            const volumes = this.audioController.getAllVolumes().levels;
            
            // イコライザー設定を取得
            const equalizerEnabled = this.audioController.isEqualizerEnabled();
            const equalizerGains = this.audioController.getEqualizerGains();
            
            // エフェクト設定を取得
            const reverbEnabled = this.configManager.get('audio', 'effects.reverb', false);
            const compressionEnabled = this.configManager.get('audio', 'effects.compression', false);
            
            return {
                volumes: volumes,
                equalizer: {
                    enabled: equalizerEnabled,
                    bands: {
                        bass: equalizerGains[0] || 0,
                        lowMid: equalizerGains[1] || 0,
                        mid: equalizerGains[2] || 0,
                        highMid: equalizerGains[3] || 0,
                        treble: equalizerGains[4] || 0
                    }
                },
                effects: {
                    reverb: reverbEnabled,
                    compression: compressionEnabled
                }
            };
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_getCurrentSettings',
                component: 'PresetManager'
            });
            return null;
        }
    }
    
    /**
     * プリセットIDを生成
     * @param {string} name - プリセット名
     * @returns {string} プリセットID
     * @private
     */
    _generatePresetId(name) {
        // 名前をベースにIDを生成
        const baseName = name.toLowerCase()
            .replace(/[^a-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        
        let id = `user_${baseName}`;
        let counter = 1;
        
        // 重複IDを回避
        while (this.hasPreset(id)) {
            id = `user_${baseName}_${counter}`;
            counter++;
        }
        
        return id;
    }
    
    /**
     * ユーザー定義プリセットを設定に保存
     * @private
     */
    _saveUserPresets() {
        try {
            const userPresetsData = {};
            
            for (const [id, preset] of this.userPresets) {
                userPresetsData[id] = preset;
            }
            
            this.configManager.set('audio', 'presets.user', userPresetsData);
            console.log(`${this.userPresets.size} user presets saved to config`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_saveUserPresets',
                component: 'PresetManager'
            });
        }
    }
    
    /**
     * 履歴に追加
     * @param {string} presetId - プリセットID
     * @private
     */
    _addToHistory(presetId) {
        try {
            // 既存の履歴から同じIDを削除
            this.presetHistory = this.presetHistory.filter(item => item.id !== presetId);
            
            // 新しい履歴項目を先頭に追加
            this.presetHistory.unshift({
                id: presetId,
                appliedAt: Date.now()
            });
            
            // 履歴サイズを制限
            if (this.presetHistory.length > this.maxHistorySize) {
                this.presetHistory = this.presetHistory.slice(0, this.maxHistorySize);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: '_addToHistory',
                component: 'PresetManager',
                presetId: presetId
            });
        }
    }
    
    /**
     * プリセットを取得
     * @param {string} presetId - プリセットID
     * @returns {Object|null} プリセットデータ
     */
    getPreset(presetId) {
        try {
            // 事前定義プリセットを確認
            if (this.builtinPresets.has(presetId)) {
                return this.builtinPresets.get(presetId);
            }
            
            // ユーザー定義プリセットを確認
            if (this.userPresets.has(presetId)) {
                return this.userPresets.get(presetId);
            }
            
            // 一時プリセットを確認
            if (this.temporaryPresets.has(presetId)) {
                return this.temporaryPresets.get(presetId);
            }
            
            return null;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'getPreset',
                component: 'PresetManager',
                presetId: presetId
            });
            return null;
        }
    }
    
    /**
     * プリセットの存在を確認
     * @param {string} presetId - プリセットID
     * @returns {boolean} 存在フラグ
     */
    hasPreset(presetId) {
        return this.builtinPresets.has(presetId) || 
               this.userPresets.has(presetId) || 
               this.temporaryPresets.has(presetId);
    }
    
    /**
     * 全プリセット一覧を取得
     * @param {string} filterType - フィルタータイプ（省略可）
     * @returns {Array} プリセット一覧
     */
    getAllPresets(filterType = null) {
        try {
            const presets = [];
            
            // 事前定義プリセットを追加
            if (!filterType || filterType === this.presetTypes.BUILTIN) {
                for (const preset of this.builtinPresets.values()) {
                    presets.push(preset);
                }
            }
            
            // ユーザー定義プリセットを追加
            if (!filterType || filterType === this.presetTypes.USER) {
                for (const preset of this.userPresets.values()) {
                    presets.push(preset);
                }
            }
            
            // 一時プリセットを追加
            if (!filterType || filterType === this.presetTypes.TEMPORARY) {
                for (const preset of this.temporaryPresets.values()) {
                    presets.push(preset);
                }
            }
            
            // 作成日時でソート（新しい順）
            return presets.sort((a, b) => b.createdAt - a.createdAt);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'getAllPresets',
                component: 'PresetManager',
                filterType: filterType
            });
            return [];
        }
    }
    
    /**
     * プリセットを削除
     * @param {string} presetId - プリセットID
     * @returns {boolean} 削除成功
     */
    deletePreset(presetId) {
        try {
            // 事前定義プリセットは削除できない
            if (this.builtinPresets.has(presetId)) {
                throw new Error(`Cannot delete builtin preset: ${presetId}`);
            }
            
            let deleted = false;
            
            // ユーザー定義プリセットを削除
            if (this.userPresets.has(presetId)) {
                this.userPresets.delete(presetId);
                this._saveUserPresets();
                deleted = true;
            }
            
            // 一時プリセットを削除
            if (this.temporaryPresets.has(presetId)) {
                this.temporaryPresets.delete(presetId);
                deleted = true;
            }
            
            if (deleted) {
                // 現在適用されているプリセットの場合はクリア
                if (this.currentPreset && this.currentPreset.id === presetId) {
                    this.currentPreset = null;
                }
                
                // 履歴から削除
                this.presetHistory = this.presetHistory.filter(item => item.id !== presetId);
                
                console.log(`Preset deleted: ${presetId}`);
                return true;
            }
            
            return false;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'deletePreset',
                component: 'PresetManager',
                presetId: presetId
            });
            return false;
        }
    }
    
    /**
     * プリセットを更新
     * @param {string} presetId - プリセットID
     * @param {Object} updateData - 更新データ
     * @returns {boolean} 更新成功
     */
    updatePreset(presetId, updateData) {
        try {
            // 事前定義プリセットは更新できない
            if (this.builtinPresets.has(presetId)) {
                throw new Error(`Cannot update builtin preset: ${presetId}`);
            }
            
            let preset = null;
            let presetMap = null;
            
            // プリセットを特定
            if (this.userPresets.has(presetId)) {
                preset = this.userPresets.get(presetId);
                presetMap = this.userPresets;
            } else if (this.temporaryPresets.has(presetId)) {
                preset = this.temporaryPresets.get(presetId);
                presetMap = this.temporaryPresets;
            } else {
                throw new Error(`Preset not found: ${presetId}`);
            }
            
            // 更新データをマージ
            const updatedPreset = {
                ...preset,
                ...updateData,
                id: presetId, // IDは変更不可
                type: preset.type, // タイプも変更不可
                updatedAt: Date.now()
            };
            
            // 妥当性を検証
            if (!this._validatePresetData(updatedPreset)) {
                throw new Error('Invalid preset data for update');
            }
            
            // プリセットを更新
            presetMap.set(presetId, updatedPreset);
            
            // ユーザープリセットの場合は設定に保存
            if (presetMap === this.userPresets) {
                this._saveUserPresets();
            }
            
            console.log(`Preset updated: ${presetId}`);
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'updatePreset',
                component: 'PresetManager',
                presetId: presetId
            });
            return false;
        }
    }
    
    /**
     * プリセットを複製
     * @param {string} sourcePresetId - 複製元プリセットID
     * @param {string} newName - 新しいプリセット名
     * @param {boolean} isTemporary - 一時プリセットとして作成するか
     * @returns {string|null} 作成されたプリセットID
     */
    duplicatePreset(sourcePresetId, newName, isTemporary = false) {
        try {
            const sourcePreset = this.getPreset(sourcePresetId);
            if (!sourcePreset) {
                throw new Error(`Source preset not found: ${sourcePresetId}`);
            }
            
            // 新しいプリセットIDを生成
            const newPresetId = this._generatePresetId(newName);
            
            // プリセットデータを複製
            const newPresetData = {
                ...sourcePreset,
                id: newPresetId,
                name: newName,
                description: `${sourcePreset.description} (コピー)`,
                type: isTemporary ? this.presetTypes.TEMPORARY : this.presetTypes.USER,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            // プリセットを保存
            if (isTemporary) {
                this.temporaryPresets.set(newPresetId, newPresetData);
            } else {
                this.userPresets.set(newPresetId, newPresetData);
                this._saveUserPresets();
            }
            
            console.log(`Preset duplicated: ${sourcePresetId} -> ${newPresetId}`);
            return newPresetId;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'duplicatePreset',
                component: 'PresetManager',
                sourcePresetId: sourcePresetId,
                newName: newName
            });
            return null;
        }
    }
    
    /**
     * プリセット適用履歴を取得
     * @returns {Array} 履歴一覧
     */
    getPresetHistory() {
        return this.presetHistory.map(item => ({
            ...item,
            preset: this.getPreset(item.id)
        })).filter(item => item.preset !== null);
    }
    
    /**
     * 現在適用されているプリセット情報を取得
     * @returns {Object|null} 現在のプリセット情報
     */
    getCurrentPreset() {
        return this.currentPreset;
    }
    
    /**
     * プリセットをエクスポート
     * @param {string} presetId - プリセットID
     * @returns {Object|null} エクスポートデータ
     */
    exportPreset(presetId) {
        try {
            const preset = this.getPreset(presetId);
            if (!preset) {
                throw new Error(`Preset not found: ${presetId}`);
            }
            
            return {
                version: '1.0',
                exportedAt: Date.now(),
                preset: {
                    ...preset,
                    type: this.presetTypes.USER // エクスポート時はユーザータイプに変換
                }
            };
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'exportPreset',
                component: 'PresetManager',
                presetId: presetId
            });
            return null;
        }
    }
    
    /**
     * プリセットをインポート
     * @param {Object} importData - インポートデータ
     * @param {string} newName - 新しいプリセット名（省略可）
     * @returns {string|null} インポートされたプリセットID
     */
    importPreset(importData, newName = null) {
        try {
            if (!importData || !importData.preset) {
                throw new Error('Invalid import data');
            }
            
            const presetData = importData.preset;
            
            // プリセット名を決定
            const name = newName || presetData.name || 'インポートされたプリセット';
            
            // 新しいプリセットIDを生成
            const presetId = this._generatePresetId(name);
            
            // プリセットデータを準備
            const newPresetData = {
                ...presetData,
                id: presetId,
                name: name,
                type: this.presetTypes.USER,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            // 妥当性を検証
            if (!this._validatePresetData(newPresetData)) {
                throw new Error('Invalid preset data for import');
            }
            
            // プリセットを保存
            this.userPresets.set(presetId, newPresetData);
            this._saveUserPresets();
            
            console.log(`Preset imported: ${name} (${presetId})`);
            return presetId;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'importPreset',
                component: 'PresetManager'
            });
            return null;
        }
    }
    
    /**
     * プリセット管理システムの状態を取得
     * @returns {Object} 状態情報
     */
    getStatus() {
        return {
            initialized: true,
            presetCounts: {
                builtin: this.builtinPresets.size,
                user: this.userPresets.size,
                temporary: this.temporaryPresets.size,
                total: this.builtinPresets.size + this.userPresets.size + this.temporaryPresets.size
            },
            currentPreset: this.currentPreset,
            historySize: this.presetHistory.length,
            configWatchers: this.configWatchers.size
        };
    }
    
    /**
     * リソースの解放
     */
    dispose() {
        try {
            // 設定監視の解除
            if (this.configWatchers) {
                this.configWatchers.forEach(watchId => {
                    this.configManager.unwatch(watchId);
                });
                this.configWatchers.clear();
            }
            
            // プリセットデータをクリア
            this.builtinPresets.clear();
            this.userPresets.clear();
            this.temporaryPresets.clear();
            
            // 履歴をクリア
            this.presetHistory = [];
            this.currentPreset = null;
            
            console.log('PresetManager disposed');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_ERROR', {
                operation: 'dispose',
                component: 'PresetManager'
            });
        }
    }
}