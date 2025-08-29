/**
 * AudioConfig クラスのユニットテスト
 */

import { AudioConfig, getAudioConfig } from '../../src/config/AudioConfig.js';

describe('AudioConfig', () => {
    let audioConfig;
    
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
            const volumeConfig = audioConfig.getVolumeConfig();
            
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
            const volume = audioConfig.getMasterVolume();
            expect(typeof volume).toBe('number');
            expect(volume).toBeGreaterThanOrEqual(0);
            expect(volume).toBeLessThanOrEqual(1);
        });
        
        test('getSfxVolume が数値を返すこと', () => {
            const volume = audioConfig.getSfxVolume();
            expect(typeof volume).toBe('number');
            expect(volume).toBeGreaterThanOrEqual(0);
            expect(volume).toBeLessThanOrEqual(1);
        });
        
        test('getBgmVolume が数値を返すこと', () => {
            const volume = audioConfig.getBgmVolume();
            expect(typeof volume).toBe('number');
            expect(volume).toBeGreaterThanOrEqual(0);
            expect(volume).toBeLessThanOrEqual(1);
        });
        
        test('isMuted がブール値を返すこと', () => {
            const muted = audioConfig.isMuted();
            expect(typeof muted).toBe('boolean');
        });
        
        test('setMasterVolume が正しく動作すること', () => {
            const result = audioConfig.setMasterVolume(0.5);
            expect(typeof result).toBe('boolean');
        });
        
        test('setSfxVolume が正しく動作すること', () => {
            const result = audioConfig.setSfxVolume(0.6);
            expect(typeof result).toBe('boolean');
        });
        
        test('setBgmVolume が正しく動作すること', () => {
            const result = audioConfig.setBgmVolume(0.7);
            expect(typeof result).toBe('boolean');
        });
        
        test('setMuted が正しく動作すること', () => {
            const result = audioConfig.setMuted(true);
            expect(typeof result).toBe('boolean');
        });
        
        test('toggleMute が正しく動作すること', () => {
            const result = audioConfig.toggleMute();
            expect(typeof result).toBe('boolean');
        });
    });
    
    describe('音質設定', () => {
        test('getQualityConfig が正しい音質設定を返すこと', () => {
            const qualityConfig = audioConfig.getQualityConfig();
            
            expect(qualityConfig).toHaveProperty('sampleRate');
            expect(qualityConfig).toHaveProperty('bufferSize');
            expect(qualityConfig).toHaveProperty('channels');
            expect(qualityConfig).toHaveProperty('bitDepth');
            expect(typeof qualityConfig.sampleRate).toBe('number');
            expect(typeof qualityConfig.bufferSize).toBe('number');
        });
        
        test('getSampleRate が数値を返すこと', () => {
            const sampleRate = audioConfig.getSampleRate();
            expect(typeof sampleRate).toBe('number');
            expect(sampleRate).toBeGreaterThan(0);
        });
        
        test('getBufferSize が数値を返すこと', () => {
            const bufferSize = audioConfig.getBufferSize();
            expect(typeof bufferSize).toBe('number');
            expect(bufferSize).toBeGreaterThan(0);
        });
        
        test('setSampleRate が正しく動作すること', () => {
            const result = audioConfig.setSampleRate(48000);
            expect(typeof result).toBe('boolean');
        });
        
        test('setBufferSize が正しく動作すること', () => {
            const result = audioConfig.setBufferSize(2048);
            expect(typeof result).toBe('boolean');
        });
    });
    
    describe('音響効果設定', () => {
        test('getEffectConfig が正しい音響効果設定を返すこと', () => {
            const effectConfig = audioConfig.getEffectConfig();
            
            expect(effectConfig).toHaveProperty('reverb');
            expect(effectConfig).toHaveProperty('compression');
            expect(effectConfig).toHaveProperty('compressor');
            expect(typeof effectConfig.compression).toBe('boolean');
            expect(effectConfig.compressor).toHaveProperty('threshold');
            expect(effectConfig.compressor).toHaveProperty('knee');
        });
        
        test('isReverbEnabled がブール値を返すこと', () => {
            const enabled = audioConfig.isReverbEnabled();
            expect(typeof enabled).toBe('boolean');
        });
        
        test('isCompressionEnabled がブール値を返すこと', () => {
            const enabled = audioConfig.isCompressionEnabled();
            expect(typeof enabled).toBe('boolean');
        });
        
        test('setReverbEnabled が正しく動作すること', () => {
            const result = audioConfig.setReverbEnabled(false);
            expect(typeof result).toBe('boolean');
        });
        
        test('setCompressionEnabled が正しく動作すること', () => {
            const result = audioConfig.setCompressionEnabled(false);
            expect(typeof result).toBe('boolean');
        });
        
        test('getCompressorConfig が正しい設定を返すこと', () => {
            const compressorConfig = audioConfig.getCompressorConfig();
            
            expect(compressorConfig).toHaveProperty('threshold');
            expect(compressorConfig).toHaveProperty('knee');
            expect(compressorConfig).toHaveProperty('ratio');
            expect(compressorConfig).toHaveProperty('attack');
            expect(compressorConfig).toHaveProperty('release');
        });
        
        test('getReverbConfig が正しい設定を返すこと', () => {
            const reverbConfig = audioConfig.getReverbConfig();
            
            expect(reverbConfig).toHaveProperty('duration');
            expect(reverbConfig).toHaveProperty('decay');
            expect(reverbConfig).toHaveProperty('wet');
        });
    });
    
    describe('AudioManager連携', () => {
        test('applyToAudioManager がエラーなく実行されること', () => {
            // AudioManagerのモック
            const mockAudioManager = {
                setVolume: () => {},
                toggleMute: () => {},
                isMuted: false
            };
            
            expect(() => {
                audioConfig.applyToAudioManager(mockAudioManager);
            }).not.toThrow();
        });
        
        test('syncFromAudioManager がエラーなく実行されること', () => {
            // AudioManagerのモック
            const mockAudioManager = {
                getStatus: () => ({
                    masterVolume: 0.5,
                    sfxVolume: 0.6,
                    bgmVolume: 0.7,
                    isMuted: true
                })
            };
            
            expect(() => {
                audioConfig.syncFromAudioManager(mockAudioManager);
            }).not.toThrow();
        });
    });
    
    describe('シングルトンパターン', () => {
        test('getAudioConfig が常に同じインスタンスを返すこと', () => {
            const instance1 = getAudioConfig();
            const instance2 = getAudioConfig();
            
            expect(instance1).toBe(instance2);
        });
    });
});