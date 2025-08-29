/**
 * AudioManager統合テスト
 * 
 * AudioManagerと新しいAudioConfigシステムの統合をテストします。
 * 音量設定の動的変更機能と設定システムとの連携を検証します。
 */

import { AudioManager } from '../../src/audio/AudioManager.js';
import { getAudioConfig } from '../../src/config/AudioConfig.js';
import { getConfigurationManager } from '../../src/core/ConfigurationManager.js';

// 簡単なモック関数
const mockFn = (returnValue) => {
    const fn = (...args) => returnValue;
    fn.mockReturnValue = (value) => { returnValue = value; return fn; };
    fn.mockImplementation = (impl) => { fn = impl; return fn; };
    return fn;
};

describe('AudioManager統合テスト', () => {
    let audioManager;
    let audioConfig;
    let configManager;

    beforeAll(() => {
        // Web Audio API の基本的なモック
        global.AudioContext = function() {
            return {
                createGain: () => ({
                    gain: { value: 0 },
                    connect: mockFn(),
                    disconnect: mockFn()
                }),
                createDynamicsCompressor: () => ({
                    threshold: { value: 0 },
                    knee: { value: 0 },
                    ratio: { value: 0 },
                    attack: { value: 0 },
                    release: { value: 0 },
                    connect: mockFn(),
                    disconnect: mockFn()
                }),
                createConvolver: () => ({
                    buffer: null,
                    connect: mockFn(),
                    disconnect: mockFn()
                }),
                createBufferSource: () => ({
                    buffer: null,
                    playbackRate: { value: 1 },
                    start: mockFn(),
                    stop: mockFn(),
                    connect: mockFn(),
                    addEventListener: mockFn()
                }),
                createStereoPanner: () => ({
                    pan: { value: 0 },
                    connect: mockFn()
                }),
                createBuffer: () => ({
                    getChannelData: () => new Float32Array(1024)
                }),
                destination: {},
                sampleRate: 44100,
                currentTime: 0,
                state: 'running',
                resume: mockFn(),
                close: mockFn()
            };
        };
        
        global.webkitAudioContext = global.AudioContext;
        
        // コンソールのモック
        global.console = {
            log: mockFn(),
            warn: mockFn(),
            error: mockFn(),
            info: mockFn()
        };
    });

    beforeEach(() => {
        // 新しいインスタンスを作成
        audioConfig = getAudioConfig();
        configManager = getConfigurationManager();
        audioManager = new AudioManager();
    });

    afterEach(() => {
        // リソースのクリーンアップ
        if (audioManager) {
            audioManager.dispose();
        }
    });

    describe('初期化と設定システム統合', () => {
        test('AudioManagerがAudioConfigを正しく使用すること', () => {
            expect(audioManager.audioConfig).toBeDefined();
            expect(audioManager.configManager).toBeDefined();
            
            // 初期設定値が正しく取得されていること
            const status = audioManager.getStatus();
            expect(typeof status.masterVolume).toBe('number');
            expect(typeof status.sfxVolume).toBe('number');
            expect(typeof status.bgmVolume).toBe('number');
            expect(typeof status.isMuted).toBe('boolean');
        });

        test('設定監視が正しく設定されていること', () => {
            const status = audioManager.getStatus();
            expect(status.configSync).toBeDefined();
            expect(status.configSync.audioConfig).toBe(true);
            expect(status.configSync.configManager).toBe(true);
        });
    });

    describe('音量設定の動的変更', () => {
        test('マスター音量の動的変更が正しく動作すること', () => {
            // 音量を変更
            audioManager.setVolume('master', 0.5);
            
            // AudioConfigに反映されていること
            expect(audioConfig.getMasterVolume()).toBe(0.5);
        });

        test('SFX音量の動的変更が正しく動作すること', () => {
            audioManager.setVolume('sfx', 0.3);
            expect(audioConfig.getSfxVolume()).toBe(0.3);
        });

        test('BGM音量の動的変更が正しく動作すること', () => {
            audioManager.setVolume('bgm', 0.9);
            expect(audioConfig.getBgmVolume()).toBe(0.9);
        });

        test('無効な音量タイプでエラーハンドリングが動作すること', () => {
            expect(() => {
                audioManager.setVolume('invalid', 0.5);
            }).not.toThrow();
        });

        test('音量値の範囲制限が正しく動作すること', () => {
            audioManager.setVolume('master', -0.5);
            expect(audioConfig.getMasterVolume()).toBe(0);
            
            audioManager.setVolume('master', 1.5);
            expect(audioConfig.getMasterVolume()).toBe(1);
        });
    });

    describe('ミュート機能の動的変更', () => {
        test('ミュート切り替えが正しく動作すること', () => {
            const initialState = audioConfig.isMuted();
            const newState = audioManager.toggleMute();
            expect(newState).toBe(!initialState);
            expect(audioConfig.isMuted()).toBe(newState);
        });

        test('ミュート状態の直接設定が正しく動作すること', () => {
            audioManager.setMuted(true);
            expect(audioConfig.isMuted()).toBe(true);
            
            audioManager.setMuted(false);
            expect(audioConfig.isMuted()).toBe(false);
        });
    });

    describe('音響効果設定の動的変更', () => {
        test('リバーブ効果の動的変更が正しく動作すること', () => {
            audioManager.setAudioEffect('reverb', false);
            expect(audioConfig.isReverbEnabled()).toBe(false);
            
            audioManager.setAudioEffect('reverb', true);
            expect(audioConfig.isReverbEnabled()).toBe(true);
        });

        test('コンプレッション効果の動的変更が正しく動作すること', () => {
            audioManager.setAudioEffect('compression', false);
            expect(audioConfig.isCompressionEnabled()).toBe(false);
            
            audioManager.setAudioEffect('compression', true);
            expect(audioConfig.isCompressionEnabled()).toBe(true);
        });
    });

    describe('設定システムとの同期', () => {
        test('設定システムとの強制同期が正しく動作すること', () => {
            audioConfig.setMasterVolume(0.3);
            audioConfig.setSfxVolume(0.4);
            audioConfig.setBgmVolume(0.6);
            
            audioManager.syncWithConfig();
            
            const status = audioManager.getStatus();
            expect(status.masterVolume).toBe(0.3);
            expect(status.sfxVolume).toBe(0.4);
            expect(status.bgmVolume).toBe(0.6);
        });
    });

    describe('エラーハンドリング', () => {
        test('無効な音量値でエラーハンドリングが動作すること', () => {
            expect(() => {
                audioManager.setVolume('master', 'invalid');
            }).not.toThrow();
        });

        test('無効な効果タイプでエラーハンドリングが動作すること', () => {
            expect(() => {
                audioManager.setAudioEffect('invalid', true);
            }).not.toThrow();
        });
    });
});