/**
 * AudioConfig クラスのユニットテスト
 */
import { describe, test, beforeEach, expect } from '@jest/globals';
import { AudioConfig, getAudioConfig } from '../../src/config/AudioConfig.js';

// Type definitions for test objects
interface VolumeConfig {
    master: number;
    sfx: number;
    bgm: number;
    muted: boolean;
}

interface QualityConfig {
    sampleRate: number;
    bufferSize: number;
    channels: number;
    bitDepth: number;
}

interface CompressorConfig {
    threshold: number;
    knee: number;
    ratio: number;
    attack: number;
    release: number;
}

interface ReverbConfig {
    duration: number;
    decay: number;
    wet: number;
}

interface EffectConfig {
    reverb: boolean;
    compression: boolean;
    compressor: CompressorConfig;
    reverbConfig: ReverbConfig;
}

interface MockAudioManager {
    setVolume?: () => void;
    toggleMute?: () => void;
    isMuted: boolean;
    getStatus?: () => {
        masterVolume: number;
        sfxVolume: number;
        bgmVolume: number;
        isMuted: boolean;
    };
}

describe('AudioConfig', () => {
    let audioConfig: AudioConfig;
    
    beforeEach(() => {
        // 新しいインスタンスを作成
        audioConfig = new AudioConfig();
    });

    describe('初期化', () => {
        test('コンストラクタが正しく初期化されること', () => {
            expect(audioConfig).toBeDefined();
            expect(audioConfig).toBeInstanceOf(AudioConfig);
        });
    });
    
    describe('音量設定', () => {
        test('getVolumeConfig が正しい音量設定を返すこと', () => {
            const volumeConfig: VolumeConfig = audioConfig.getVolumeConfig();
            
            expect(volumeConfig).toHaveProperty('master');
            expect(volumeConfig).toHaveProperty('sfx');
            expect(volumeConfig).toHaveProperty('bgm');
            expect(volumeConfig).toHaveProperty('muted');
            expect(typeof volumeConfig.master).toBe('number');
            expect(typeof volumeConfig.sfx).toBe('number');
            expect(typeof volumeConfig.bgm).toBe('number');
            expect(typeof volumeConfig.muted).toBe('boolean');
        });

        test('getMasterVolume が数値を返すこと', () => {
            const volume: number = audioConfig.getMasterVolume();
            
            expect(typeof volume).toBe('number');
            expect(volume).toBeGreaterThanOrEqual(0);
            expect(volume).toBeLessThanOrEqual(1);
        });
        
        test('getSfxVolume が数値を返すこと', () => {
            const volume: number = audioConfig.getSfxVolume();
            
            expect(typeof volume).toBe('number');
            expect(volume).toBeGreaterThanOrEqual(0);
            expect(volume).toBeLessThanOrEqual(1);
        });
        
        test('getBgmVolume が数値を返すこと', () => {
            const volume: number = audioConfig.getBgmVolume();
            
            expect(typeof volume).toBe('number');
            expect(volume).toBeGreaterThanOrEqual(0);
            expect(volume).toBeLessThanOrEqual(1);
        });

        test('setMasterVolume で音量が設定されること', () => {
            const testVolume = 0.7;
            audioConfig.setMasterVolume(testVolume);
            
            const currentVolume = audioConfig.getMasterVolume();
            expect(currentVolume).toBe(testVolume);
        });

        test('setSfxVolume で効果音音量が設定されること', () => {
            const testVolume = 0.5;
            audioConfig.setSfxVolume(testVolume);
            
            const currentVolume = audioConfig.getSfxVolume();
            expect(currentVolume).toBe(testVolume);
        });

        test('setBgmVolume で背景音音量が設定されること', () => {
            const testVolume = 0.3;
            audioConfig.setBgmVolume(testVolume);
            
            const currentVolume = audioConfig.getBgmVolume();
            expect(currentVolume).toBe(testVolume);
        });

        test('音量範囲が正しく制限されること', () => {
            // 上限テスト
            audioConfig.setMasterVolume(1.5);
            expect(audioConfig.getMasterVolume()).toBeLessThanOrEqual(1);
            
            // 下限テスト
            audioConfig.setMasterVolume(-0.5);
            expect(audioConfig.getMasterVolume()).toBeGreaterThanOrEqual(0);
        });
    });

    describe('ミュート機能', () => {
        test('isMuted が正しく動作すること', () => {
            const isMuted: boolean = audioConfig.isMuted();
            expect(typeof isMuted).toBe('boolean');
        });

        test('setMuted でミュート状態が設定されること', () => {
            audioConfig.setMuted(true);
            expect(audioConfig.isMuted()).toBe(true);
            
            audioConfig.setMuted(false);
            expect(audioConfig.isMuted()).toBe(false);
        });

        test('toggleMute でミュート状態が切り替わること', () => {
            const initialState = audioConfig.isMuted();
            audioConfig.toggleMute();
            
            expect(audioConfig.isMuted()).toBe(!initialState);
            
            audioConfig.toggleMute();
            expect(audioConfig.isMuted()).toBe(initialState);
        });
    });

    describe('音質設定', () => {
        test('getQualityConfig が正しい設定を返すこと', () => {
            const qualityConfig: QualityConfig = audioConfig.getQualityConfig();
            
            expect(qualityConfig).toHaveProperty('sampleRate');
            expect(qualityConfig).toHaveProperty('bufferSize');
            expect(qualityConfig).toHaveProperty('channels');
            expect(qualityConfig).toHaveProperty('bitDepth');
            expect(typeof qualityConfig.sampleRate).toBe('number');
            expect(typeof qualityConfig.bufferSize).toBe('number');
            expect(typeof qualityConfig.channels).toBe('number');
            expect(typeof qualityConfig.bitDepth).toBe('number');
        });

        test('setSampleRate でサンプルレートが設定されること', () => {
            const testSampleRate = 48000;
            audioConfig.setSampleRate(testSampleRate);
            
            const qualityConfig = audioConfig.getQualityConfig();
            expect(qualityConfig.sampleRate).toBe(testSampleRate);
        });

        test('setBufferSize でバッファサイズが設定されること', () => {
            const testBufferSize = 1024;
            audioConfig.setBufferSize(testBufferSize);
            
            const qualityConfig = audioConfig.getQualityConfig();
            expect(qualityConfig.bufferSize).toBe(testBufferSize);
        });
    });

    describe('エフェクト設定', () => {
        test('getEffectConfig が正しい設定を返すこと', () => {
            const effectConfig: EffectConfig = audioConfig.getEffectConfig();
            
            expect(effectConfig).toHaveProperty('reverb');
            expect(effectConfig).toHaveProperty('compression');
            expect(effectConfig).toHaveProperty('compressor');
            expect(effectConfig).toHaveProperty('reverbConfig');
            expect(typeof effectConfig.reverb).toBe('boolean');
            expect(typeof effectConfig.compression).toBe('boolean');
        });

        test('setReverbEnabled でリバーブが有効化されること', () => {
            audioConfig.setReverbEnabled(true);
            
            const effectConfig = audioConfig.getEffectConfig();
            expect(effectConfig.reverb).toBe(true);
        });

        test('setCompressionEnabled で圧縮が有効化されること', () => {
            audioConfig.setCompressionEnabled(true);
            
            const effectConfig = audioConfig.getEffectConfig();
            expect(effectConfig.compression).toBe(true);
        });

        test('コンプレッサー設定が正しく動作すること', () => {
            const compressorConfig: CompressorConfig = {
                threshold: -24,
                knee: 30,
                ratio: 12,
                attack: 0.003,
                release: 0.25
            };

            audioConfig.setCompressorConfig(compressorConfig);
            
            const effectConfig = audioConfig.getEffectConfig();
            expect(effectConfig.compressor).toEqual(compressorConfig);
        });

        test('リバーブ設定が正しく動作すること', () => {
            const reverbConfig: ReverbConfig = {
                duration: 2.0,
                decay: 0.8,
                wet: 0.3
            };

            audioConfig.setReverbConfig(reverbConfig);
            
            const effectConfig = audioConfig.getEffectConfig();
            expect(effectConfig.reverbConfig).toEqual(reverbConfig);
        });
    });

    describe('設定保存・復元', () => {
        test('saveConfig で設定が保存されること', () => {
            // テスト設定を適用
            audioConfig.setMasterVolume(0.8);
            audioConfig.setSfxVolume(0.6);
            audioConfig.setBgmVolume(0.4);
            audioConfig.setMuted(true);
            
            expect(() => {
                audioConfig.saveConfig();
            }).not.toThrow();
        });

        test('loadConfig で設定が復元されること', () => {
            // 初期設定を保存
            audioConfig.setMasterVolume(0.7);
            audioConfig.setSfxVolume(0.5);
            audioConfig.setBgmVolume(0.3);
            audioConfig.saveConfig();
            
            // 設定を変更
            audioConfig.setMasterVolume(1.0);
            audioConfig.setSfxVolume(1.0);
            audioConfig.setBgmVolume(1.0);
            
            // 設定を復元
            audioConfig.loadConfig();
            
            expect(audioConfig.getMasterVolume()).toBe(0.7);
            expect(audioConfig.getSfxVolume()).toBe(0.5);
            expect(audioConfig.getBgmVolume()).toBe(0.3);
        });

        test('resetToDefault でデフォルト設定にリセットされること', () => {
            // 設定を変更
            audioConfig.setMasterVolume(0.2);
            audioConfig.setSfxVolume(0.1);
            audioConfig.setBgmVolume(0.05);
            audioConfig.setMuted(true);
            
            // デフォルトにリセット
            audioConfig.resetToDefault();
            
            // デフォルト値の確認
            expect(audioConfig.getMasterVolume()).toBe(1.0);
            expect(audioConfig.getSfxVolume()).toBe(1.0);
            expect(audioConfig.getBgmVolume()).toBe(1.0);
            expect(audioConfig.isMuted()).toBe(false);
        });
    });

    describe('AudioManager統合', () => {
        test('applyToAudioManager でオーディオマネージャーに設定が適用されること', () => {
            const mockAudioManager: MockAudioManager = {
                isMuted: false,
                setVolume: jest.fn(),
                toggleMute: jest.fn(),
                getStatus: jest.fn(() => ({
                    masterVolume: 0.8,
                    sfxVolume: 0.6,
                    bgmVolume: 0.4,
                    isMuted: false
                }))
            };

            audioConfig.setMasterVolume(0.8);
            audioConfig.setSfxVolume(0.6);
            audioConfig.setBgmVolume(0.4);
            
            expect(() => {
                audioConfig.applyToAudioManager(mockAudioManager as any);
            }).not.toThrow();
            
            expect(mockAudioManager.setVolume).toHaveBeenCalled();
        });

        test('syncFromAudioManager でオーディオマネージャーから設定が同期されること', () => {
            const mockAudioManager: MockAudioManager = {
                isMuted: true,
                getStatus: jest.fn(() => ({
                    masterVolume: 0.7,
                    sfxVolume: 0.5,
                    bgmVolume: 0.3,
                    isMuted: true
                }))
            };

            audioConfig.syncFromAudioManager(mockAudioManager as any);
            
            expect(audioConfig.getMasterVolume()).toBe(0.7);
            expect(audioConfig.getSfxVolume()).toBe(0.5);
            expect(audioConfig.getBgmVolume()).toBe(0.3);
            expect(audioConfig.isMuted()).toBe(true);
        });
    });

    describe('シングルトンパターン', () => {
        test('getAudioConfig で同じインスタンスが返されること', () => {
            const instance1 = getAudioConfig();
            const instance2 = getAudioConfig();
            
            expect(instance1).toBe(instance2);
        });

        test('getAudioConfig で返されるインスタンスが AudioConfig であること', () => {
            const instance = getAudioConfig();
            expect(instance).toBeInstanceOf(AudioConfig);
        });
    });

    describe('バリデーション', () => {
        test('無効な音量値が適切に処理されること', () => {
            // NaN
            audioConfig.setMasterVolume(NaN);
            expect(audioConfig.getMasterVolume()).toBeGreaterThanOrEqual(0);
            expect(audioConfig.getMasterVolume()).toBeLessThanOrEqual(1);
            
            // Infinity
            audioConfig.setMasterVolume(Infinity);
            expect(audioConfig.getMasterVolume()).toBeLessThanOrEqual(1);
            
            // -Infinity
            audioConfig.setMasterVolume(-Infinity);
            expect(audioConfig.getMasterVolume()).toBeGreaterThanOrEqual(0);
        });

        test('無効な設定オブジェクトが適切に処理されること', () => {
            expect(() => {
                audioConfig.setCompressorConfig(null as any);
            }).not.toThrow();
            
            expect(() => {
                audioConfig.setReverbConfig(undefined as any);
            }).not.toThrow();
        });
    });
});