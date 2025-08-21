/**
 * AudioManager統合テスト
 * TypeScript移行 - Task 25対応
 * 
 * AudioManagerと新しいAudioConfigシステムの統合をテストします。
 * 音量設定の動的変更機能と設定システムとの連携を検証します。
 */
// import { jest  } from '@jest/globals';
import { AudioManager  } from '../../src/audio/AudioManager.js';
import { getAudioConfig  } from '../../src/config/AudioConfig.js';
import { getConfigurationManager  } from '../../src/core/ConfigurationManager.js';
// TODO: Mock types need to be properly exported from test types
// import { MockAudioContext, MockAudioNode  } from '../../src/types/test.js';
interface MockFunction<T = any> extends Function {
    mockReturnValue: (value: T) => MockFunction<T>,
    mockImplementation: (impl: Function) => MockFunction<T> }
interface AudioManagerStatus {
    masterVolume: number,
    sfxVolume: number;
    bgmVolume: number;
    isMuted: boolean;
    configSync: {
        audioConfi,g: boolean,
        configManager: boolean,;
}
// 簡単なモック関数
const mockFn = <T = any>(returnValue?: T): MockFunction<T> => {
    let currentReturnValue = returnValue,
    const fn = (..._args: any[]) => currentReturnValue,
    (fn.mockReturnValue = (value: T) => { 
        currentReturnValue = value, 
        return fn as unknown as MockFunction<T> };
    (fn.mockImplementation = (impl: Function) => { 
        Object.assign(fn, impl'),'
        return fn as unknown as MockFunction<T> };
    return fn as unknown as MockFunction<T>;
};
describe('AudioManager統合テスト', () => {
    let audioManager: AudioManager,
    let audioConfig: any,
    let _configManager: any,
    beforeAll(() => {
        // Web Audio API の基本的なモック
        (global: any).AudioContext = function(this {
            this.createGain = () => ({
                gain: { value: 0 };
                connect: mockFn(
        disconnect: mockFn( } as any);
            this.createDynamicsCompressor = () => ({
                threshold: { value: 0 };
                knee: { value: 0 };
                ratio: { value: 0 };
                attack: { value: 0 };
                release: { value: 0 },
                connect: mockFn(
        disconnect: mockFn( } as any);
            this.createConvolver = () => ({
                buffer: null,
                connect: mockFn(
        disconnect: mockFn( } as any);
            this.createBufferSource = () => ({
                buffer: null,
                playbackRate: { value: 1 };
                start: mockFn(
                stop: mockFn(
                connect: mockFn(
        addEventListener: mockFn( } as any);
            this.createStereoPanner = () => ({
                pan: { value: 0 };
        connect: mockFn( } as any);
            this.createBuffer = () => ({
                getChannelData: () => new Float32Array(1024) } as any');'
            this.destination = {} as any;
            this.sampleRate = 44100;
            this.currentTime = 0;
            this.state = 'running' as AudioContextState;
            this.resume = mockFn();
            this.close = mockFn();
            return this;
        } as any;
        
        (global: any).webkitAudioContext = (global: any).AudioContext;
        
        // コンソールのモック
        (global: any).console = {
            log: mockFn(
            warn: mockFn(
            error: mockFn(
        info: mockFn( };
    });
    beforeEach(() => {
        // 新しいインスタンスを作成
        audioConfig = getAudioConfig(),
        _configManager = getConfigurationManager(),
        audioManager = new AudioManager(_configManager, audioConfig) });
    afterEach((') => {'
        // リソースのクリーンアップ
        if (audioManager && typeof audioManager.dispose === 'function') {
            audioManager.dispose() }
    }');'
    describe('初期化と設定システム統合', (') => {'
        test('AudioManagerがAudioConfigを正しく使用すること', () => {
            expect(audioManager.audioConfig).toBeDefined(),
            expect(audioManager.configManager).toBeDefined(),
            // 初期設定値が正しく取得されていること
            const status: AudioManagerStatus = audioManager.getStatus() as unknown as AudioManagerStatus,
            expect(typeof status.masterVolume').toBe('number'),'
            expect(typeof status.sfxVolume').toBe('number'),'
            expect(typeof status.bgmVolume').toBe('number'),'
            expect(typeof status.isMuted').toBe('boolean') }');
        test('設定監視が正しく設定されていること', () => {
            const status: AudioManagerStatus = audioManager.getStatus() as unknown as AudioManagerStatus,
            expect(status.configSync).toBeDefined(),
            expect(status.configSync.audioConfig).toBe(true),
            expect(status.configSync.configManager).toBe(true) }');'
    }
    describe('音量設定の動的変更', (') => {'
        test('マスター音量の動的変更が正しく動作すること', (') => {'
            // 音量を変更
            audioManager.setVolume('master', 0.5),
            // AudioConfigに反映されていること
            expect(audioConfig.getMasterVolume().toBe(0.5) }');'
        test('SFX音量の動的変更が正しく動作すること', (') => {'
            audioManager.setVolume('sfx', 0.3),
            expect(audioConfig.getSfxVolume().toBe(0.3) }');'
        test('BGM音量の動的変更が正しく動作すること', (') => {'
            audioManager.setVolume('bgm', 0.9),
            expect(audioConfig.getBgmVolume().toBe(0.9) }');'
        test('無効な音量タイプでエラーハンドリングが動作すること', () => {
            expect((') => {'
                audioManager.setVolume('invalid' as any, 0.5) }).not.toThrow(');'
        }
        test('音量値の範囲制限が正しく動作すること', (') => {'
            audioManager.setVolume('master', -0.5),
            expect(audioConfig.getMasterVolume().toBe(0'),'
            audioManager.setVolume('master', 1.5),
            expect(audioConfig.getMasterVolume().toBe(1) }');'
    }
    describe('ミュート機能の動的変更', (') => {'
        test('ミュート切り替えが正しく動作すること', () => {
            const initialState: boolean = audioConfig.isMuted(
            const newState: boolean = audioManager.toggleMute(
            expect(newState).toBe(!initialState),
            expect(audioConfig.isMuted().toBe(newState) }');'
        test('ミュート状態の直接設定が正しく動作すること', () => {
            audioManager.setMuted(true),
            expect(audioConfig.isMuted().toBe(true),
            audioManager.setMuted(false),
            expect(audioConfig.isMuted().toBe(false) }');'
    }
    describe('音響効果設定の動的変更', (') => {'
        test('リバーブ効果の動的変更が正しく動作すること', (') => {'
            audioManager.setAudioEffect('reverb', false),
            expect(audioConfig.isReverbEnabled().toBe(false'),'
            audioManager.setAudioEffect('reverb', true),
            expect(audioConfig.isReverbEnabled().toBe(true) }');'
        test('コンプレッション効果の動的変更が正しく動作すること', (') => {'
            audioManager.setAudioEffect('compression', false),
            expect(audioConfig.isCompressionEnabled().toBe(false'),'
            audioManager.setAudioEffect('compression', true),
            expect(audioConfig.isCompressionEnabled().toBe(true) }');'
    }
    describe('設定システムとの同期', (') => {'
        test('設定システムとの強制同期が正しく動作すること', () => {
            audioConfig.setMasterVolume(0.3),
            audioConfig.setSfxVolume(0.4),
            audioConfig.setBgmVolume(0.6),
            (audioManager.syncWithConfig(),
            const status: AudioManagerStatus = audioManager.getStatus() as unknown as AudioManagerStatus,
            expect(status.masterVolume).toBe(0.3),
            expect(status.sfxVolume).toBe(0.4),
            expect(status.bgmVolume).toBe(0.6) }');'
    }
    describe('エラーハンドリング', (') => {'
        test('無効な音量値でエラーハンドリングが動作すること', () => {
            expect((') => {'
                audioManager.setVolume('master', 'invalid' as any) }).not.toThrow(');'
        }
        test('無効な効果タイプでエラーハンドリングが動作すること', () => {
            expect((') => {'
                audioManager.setAudioEffect('invalid' as any, true) }).not.toThrow();
        }
    }');'
}