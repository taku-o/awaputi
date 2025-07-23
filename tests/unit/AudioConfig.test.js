/**
 * AudioConfig クラスのユニットテスト
 */

// モックの設定
const mockGet = jest.fn();
const mockSet = jest.fn().mockReturnValue(true);
const mockSetValidationRule = jest.fn();
const mockGetCategory = jest.fn().mockReturnValue({});

const mockConfigManager = {
    get: mockGet,
    set: mockSet,
    setValidationRule: mockSetValidationRule,
    getCategory: mockGetCategory
};

// ConfigurationManagerのモック
const mockGetConfigurationManager = jest.fn().mockReturnValue(mockConfigManager);
jest.mock('../../src/core/ConfigurationManager.js', () => {
    return {
        ConfigurationManager: jest.fn(),
        getConfigurationManager: mockGetConfigurationManager
    };
});

// ErrorHandlerのモック
jest.mock('../../src/utils/ErrorHandler.js', () => {
    return {
        getErrorHandler: jest.fn().mockReturnValue({
            handleError: jest.fn()
        })
    };
});

const { AudioConfig, getAudioConfig } = require('../../src/config/AudioConfig.js');

describe('AudioConfig', () => {
    let audioConfig;
    
    beforeEach(() => {
        // テスト前にモックをリセット
        jest.clearAllMocks();
        
        // 新しいインスタンスを作成
        audioConfig = new AudioConfig();
    });
    
    describe('初期化', () => {
        test('コンストラクタが正しく初期化されること', () => {
            expect(audioConfig).toBeDefined();
            expect(mockGetConfigurationManager).toHaveBeenCalled();
        });
        
        test('初期化時に音量設定が登録されること', () => {
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'volumes.master', 0.7);
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'volumes.sfx', 0.8);
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'volumes.bgm', 0.5);
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'volumes.muted', false);
        });
        
        test('初期化時に音質設定が登録されること', () => {
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'quality.sampleRate', 44100);
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'quality.bufferSize', 4096);
        });
        
        test('初期化時に音響効果設定が登録されること', () => {
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'effects.reverb', true);
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'effects.compression', true);
        });
        
        test('初期化時に検証ルールが設定されること', () => {
            expect(mockConfigManager.setValidationRule).toHaveBeenCalledWith('audio', 'volumes.master', expect.any(Object));
            expect(mockConfigManager.setValidationRule).toHaveBeenCalledWith('audio', 'volumes.sfx', expect.any(Object));
            expect(mockConfigManager.setValidationRule).toHaveBeenCalledWith('audio', 'volumes.bgm', expect.any(Object));
        });
    });
    
    describe('音量設定', () => {
        test('getVolumeConfig が正しい音量設定を返すこと', () => {
            mockConfigManager.get
                .mockReturnValueOnce(0.5) // master
                .mockReturnValueOnce(0.6) // sfx
                .mockReturnValueOnce(0.7) // bgm
                .mockReturnValueOnce(true); // muted
                
            const volumeConfig = audioConfig.getVolumeConfig();
            
            expect(volumeConfig).toEqual({
                master: 0.5,
                sfx: 0.6,
                bgm: 0.7,
                muted: true
            });
            
            expect(mockConfigManager.get).toHaveBeenCalledWith('audio', 'volumes.master', 0.7);
            expect(mockConfigManager.get).toHaveBeenCalledWith('audio', 'volumes.sfx', 0.8);
            expect(mockConfigManager.get).toHaveBeenCalledWith('audio', 'volumes.bgm', 0.5);
            expect(mockConfigManager.get).toHaveBeenCalledWith('audio', 'volumes.muted', false);
        });
        
        test('getMasterVolume が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(0.5);
            
            expect(audioConfig.getMasterVolume()).toBe(0.5);
            expect(mockConfigManager.get).toHaveBeenCalledWith('audio', 'volumes.master', 0.7);
        });
        
        test('getSfxVolume が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(0.6);
            
            expect(audioConfig.getSfxVolume()).toBe(0.6);
            expect(mockConfigManager.get).toHaveBeenCalledWith('audio', 'volumes.sfx', 0.8);
        });
        
        test('getBgmVolume が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(0.7);
            
            expect(audioConfig.getBgmVolume()).toBe(0.7);
            expect(mockConfigManager.get).toHaveBeenCalledWith('audio', 'volumes.bgm', 0.5);
        });
        
        test('isMuted が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(true);
            
            expect(audioConfig.isMuted()).toBe(true);
            expect(mockConfigManager.get).toHaveBeenCalledWith('audio', 'volumes.muted', false);
        });
        
        test('setMasterVolume が正しく設定されること', () => {
            audioConfig.setMasterVolume(0.5);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'volumes.master', 0.5);
        });
        
        test('setSfxVolume が正しく設定されること', () => {
            audioConfig.setSfxVolume(0.6);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'volumes.sfx', 0.6);
        });
        
        test('setBgmVolume が正しく設定されること', () => {
            audioConfig.setBgmVolume(0.7);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'volumes.bgm', 0.7);
        });
        
        test('setMuted が正しく設定されること', () => {
            audioConfig.setMuted(true);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'volumes.muted', true);
        });
        
        test('toggleMute が現在の状態を反転させること', () => {
            mockConfigManager.get.mockReturnValueOnce(false);
            
            const result = audioConfig.toggleMute();
            
            expect(result).toBe(true);
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'volumes.muted', true);
        });
    });
    
    describe('音質設定', () => {
        test('getQualityConfig が正しい音質設定を返すこと', () => {
            mockConfigManager.get
                .mockReturnValueOnce(48000) // sampleRate
                .mockReturnValueOnce(2048)  // bufferSize
                .mockReturnValueOnce(2)     // channels
                .mockReturnValueOnce(24);   // bitDepth
                
            const qualityConfig = audioConfig.getQualityConfig();
            
            expect(qualityConfig).toEqual({
                sampleRate: 48000,
                bufferSize: 2048,
                channels: 2,
                bitDepth: 24
            });
        });
        
        test('getSampleRate が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(48000);
            
            expect(audioConfig.getSampleRate()).toBe(48000);
            expect(mockConfigManager.get).toHaveBeenCalledWith('audio', 'quality.sampleRate', 44100);
        });
        
        test('getBufferSize が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(2048);
            
            expect(audioConfig.getBufferSize()).toBe(2048);
            expect(mockConfigManager.get).toHaveBeenCalledWith('audio', 'quality.bufferSize', 4096);
        });
        
        test('setSampleRate が正しく設定されること', () => {
            audioConfig.setSampleRate(48000);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'quality.sampleRate', 48000);
        });
        
        test('setBufferSize が正しく設定されること', () => {
            audioConfig.setBufferSize(2048);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'quality.bufferSize', 2048);
        });
    });
    
    describe('音響効果設定', () => {
        test('getEffectConfig が正しい音響効果設定を返すこと', () => {
            // モックの戻り値を設定
            mockConfigManager.get
                .mockReturnValueOnce(true)  // reverb
                .mockReturnValueOnce(true)  // compression
                .mockReturnValueOnce(-30)   // threshold
                .mockReturnValueOnce(30)    // knee
                .mockReturnValueOnce(10)    // ratio
                .mockReturnValueOnce(0.005) // attack
                .mockReturnValueOnce(0.3)   // release
                .mockReturnValueOnce(1.5)   // duration
                .mockReturnValueOnce(0.4)   // decay
                .mockReturnValueOnce(0.2);  // wet
                
            const effectConfig = audioConfig.getEffectConfig();
            
            expect(effectConfig).toEqual({
                reverb: true,
                compression: true,
                compressor: {
                    threshold: -30,
                    knee: 30,
                    ratio: 10,
                    attack: 0.005,
                    release: 0.3
                },
                reverb: {
                    duration: 1.5,
                    decay: 0.4,
                    wet: 0.2
                }
            });
        });
        
        test('isReverbEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(true);
            
            expect(audioConfig.isReverbEnabled()).toBe(true);
            expect(mockConfigManager.get).toHaveBeenCalledWith('audio', 'effects.reverb', true);
        });
        
        test('isCompressionEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(false);
            
            expect(audioConfig.isCompressionEnabled()).toBe(false);
            expect(mockConfigManager.get).toHaveBeenCalledWith('audio', 'effects.compression', true);
        });
        
        test('setReverbEnabled が正しく設定されること', () => {
            audioConfig.setReverbEnabled(false);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'effects.reverb', false);
        });
        
        test('setCompressionEnabled が正しく設定されること', () => {
            audioConfig.setCompressionEnabled(false);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'effects.compression', false);
        });
        
        test('getCompressorConfig が正しい値を返すこと', () => {
            mockConfigManager.get
                .mockReturnValueOnce(-30)   // threshold
                .mockReturnValueOnce(30)    // knee
                .mockReturnValueOnce(10)    // ratio
                .mockReturnValueOnce(0.005) // attack
                .mockReturnValueOnce(0.3);  // release
                
            const compressorConfig = audioConfig.getCompressorConfig();
            
            expect(compressorConfig).toEqual({
                threshold: -30,
                knee: 30,
                ratio: 10,
                attack: 0.005,
                release: 0.3
            });
        });
        
        test('getReverbConfig が正しい値を返すこと', () => {
            mockConfigManager.get
                .mockReturnValueOnce(1.5)   // duration
                .mockReturnValueOnce(0.4)   // decay
                .mockReturnValueOnce(0.2);  // wet
                
            const reverbConfig = audioConfig.getReverbConfig();
            
            expect(reverbConfig).toEqual({
                duration: 1.5,
                decay: 0.4,
                wet: 0.2
            });
        });
    });
    
    describe('AudioManager連携', () => {
        test('applyToAudioManager がAudioManagerに設定を適用すること', () => {
            // AudioManagerのモック
            const mockAudioManager = {
                setVolume: jest.fn(),
                toggleMute: jest.fn(),
                isMuted: false
            };
            
            // 音量設定のモック
            mockConfigManager.get
                .mockReturnValueOnce(0.5) // master
                .mockReturnValueOnce(0.6) // sfx
                .mockReturnValueOnce(0.7) // bgm
                .mockReturnValueOnce(true); // muted
            
            audioConfig.applyToAudioManager(mockAudioManager);
            
            expect(mockAudioManager.setVolume).toHaveBeenCalledWith('master', 0.5);
            expect(mockAudioManager.setVolume).toHaveBeenCalledWith('sfx', 0.6);
            expect(mockAudioManager.setVolume).toHaveBeenCalledWith('bgm', 0.7);
            expect(mockAudioManager.toggleMute).toHaveBeenCalled();
        });
        
        test('syncFromAudioManager がAudioManagerから設定を同期すること', () => {
            // AudioManagerのモック
            const mockAudioManager = {
                getStatus: jest.fn().mockReturnValue({
                    masterVolume: 0.5,
                    sfxVolume: 0.6,
                    bgmVolume: 0.7,
                    isMuted: true
                })
            };
            
            audioConfig.syncFromAudioManager(mockAudioManager);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'volumes.master', 0.5);
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'volumes.sfx', 0.6);
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'volumes.bgm', 0.7);
            expect(mockConfigManager.set).toHaveBeenCalledWith('audio', 'volumes.muted', true);
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