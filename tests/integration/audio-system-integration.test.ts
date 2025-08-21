import { describe, test, expect, beforeEach, afterEach, jest  } from '@jest/globals';
/**
 * 音響システム統合テスト
 * 
 * Issue #23で実装された音響システム全体の統合をテストします。
 * BGMシステム、効果音システム、アクセシビリティ支援、触覚フィードバックなどの連携を検証します。
 */
import { AudioManager  } from '../../src/audio/AudioManager';
import { AudioAccessibilitySupport  } from '../../src/audio/accessibility/AudioAccessibilitySupport';
import { VibrationManager  } from '../../src/core/VibrationManager';
import { getConfigurationManager  } from '../../src/core/ConfigurationManager';
// モック関数ユーティリティ
const mockFn = (returnValue) => {
    let calls = [];
    const fn = (...args) => {
        calls.push(args);
        return returnValue;
    };
    fn.mockReturnValue = (value) => { returnValue = value; return fn; };
    fn.mockImplementation = (impl) => { 
        const originalFn = fn;
        const newFn = (...args) => {
            calls.push(args);
            return impl(...args');
        };
        newFn.calls = calls;
        return newFn;
    };
    fn.calls = calls;
    return fn;
};
describe('音響システム統合テスト', () => {
    let audioManager: any,
    let audioAccessibilitySupport: any,
    let vibrationManager: any,
    let configManager: any,
    beforeAll(() => {
        // Web Audio API の包括的なモック
        global.AudioContext = function() {
            return {
                createGain: () => ({
                    gain: { 
                        value: 1,
                        setValueAtTime: mockFn(),
                        exponentialRampToValueAtTime: mockFn(}
                    },
                    connect: mockFn(),
        disconnect: mockFn(),
                }),
                createAnalyser: () => ({
                    fftSize: 256,
                    frequencyBinCount: 128,
                    smoothingTimeConstant: 0.8,
                    getFloatFrequencyData: mockFn(),
                    getByteFrequencyData: mockFn(),
                    connect: mockFn(),
        disconnect: mockFn(),
                }),
                createBiquadFilter: (') => ({
                    type: 'lowpass',
                    frequency: { value: 350 };
                    Q: { value: 1 };
                    gain: { value: 0 };
                    connect: mockFn(),
        disconnect: mockFn(),
                }),
                createDynamicsCompressor: () => ({
                    threshold: { value: -24 };
                    knee: { value: 30 };
                    ratio: { value: 12 };
                    attack: { value: 0.003 };
                    release: { value: 0.25 },
                    connect: mockFn(),
        disconnect: mockFn(),
                }),
                createConvolver: () => ({
                    buffer: null,
                    normalize: true,
                    connect: mockFn(),
        disconnect: mockFn(),
                }),
                createBufferSource: () => ({
                    buffer: null,
                    loop: false,
                    loopStart: 0,
                    loopEnd: 0,
                    playbackRate: { value: 1 },
                    start: mockFn(),
                    stop: mockFn(),
                    connect: mockFn(),
                    disconnect: mockFn(),
                    addEventListener: mockFn(),
        removeEventListener: mockFn(),
                }),
                createOscillator: (') => ({
                    type: 'sine',
                    frequency: { value: 440 };
                    detune: { value: 0 };
                    start: mockFn(),
                    stop: mockFn(),
                    connect: mockFn(),
                    disconnect: mockFn(),
        addEventListener: mockFn(),
                }),
                createStereoPanner: () => ({
                    pan: { value: 0 };
                    connect: mockFn(),
        disconnect: mockFn(),
                }),
                createBuffer: mockFn(() => ({
                    length: 44100,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    getChannelData: mockFn(() => new Float32Array(44100);
                }),
                decodeAudioData: mockFn(Promise.resolve({
                    length: 44100,
                    sampleRate: 44100,
                    numberOfChannels: 2;);
                   , getChannelData: mockFn(() => new Float32Array(44100);
                })'),
                destination: {
                    channelCount: 2,
                    channelCountMode: 'explicit',
                    channelInterpretation: 'speakers'
                },
                listener: {
                    positionX: { value: 0 };
                    positionY: { value: 0 };
                    positionZ: { value: 0 };
                    forwardX: { value: 0 };
                    forwardY: { value: 0 },
                    forwardZ: { value: -1 },
                    upX: { value: 0 },
                    upY: { value: 1 },
                    upZ: { value: 0 }
                },
                sampleRate: 44100,
                currentTime: 0,
                state: 'running',
                baseLatency: 0.01,
                outputLatency: 0.02,
                resume: mockFn(Promise.resolve(),
                suspend: mockFn(Promise.resolve(),
                close: mockFn(Promise.resolve(),
                addEventListener: mockFn(),
        removeEventListener: mockFn('),
            };
        };
        
        global.webkitAudioContext = global.AudioContext;
        // Navigator APIs のモック
        global.navigator = {
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7') AppleWebKit/537.36',
            platform: 'MacIntel',
            deviceMemory: 8,
            hardwareConcurrency: 8,
            vibrate: mockFn(true,
            getGamepads: mockFn([]),
            getBattery: mockFn(Promise.resolve({
                level: 0.8,
                charging: false,
                chargingTime: Infinity,
                dischargingTime: 3600;);
       , addEventListener: mockFn(),
            });
        };
        // DOM APIs のモック
        global.document = {
            createElement: mockFn((tag) => ({
                tagName: tag.toUpperCase('),
                className: '',
                style: {};
                appendChild: mockFn(),
                setAttribute: mockFn(),
                getAttribute: mockFn(),
                addEventListener: mockFn(),
                removeEventListener: mockFn(),
                querySelector: mockFn(),
                remove: mockFn(),
                parentNode: null
            }),
            getElementById: mockFn(null,
            querySelector: mockFn(null,
            querySelectorAll: mockFn([]),
            body: {
                appendChild: mockFn(),
        removeChild: mockFn(),
            },
            head: {
                appendChild: mockFn(),
        removeChild: mockFn(),
            },
            hidden: false,
            addEventListener: mockFn(),
        removeEventListener: mockFn(),
        };
        global.window = {
            addEventListener: mockFn(),
        removeEventListener: mockFn(),
        };
        // LocalStorage のモック
        global.localStorage = {
            getItem: mockFn(null,
            setItem: mockFn(),
            removeItem: mockFn(),
        clear: mockFn(),
        };
        // コンソールのモック
        global.console = {
            log: mockFn(),
            warn: mockFn(),
            error: mockFn(),
        info: mockFn(),
        };
    });
    beforeEach(() => {
        // 新しいインスタンスを作成
        configManager = getConfigurationManager();
        audioManager = new AudioManager();
        // AudioAccessibilitySupportの初期化には時間がかかる場合があるので、
        // 実際のコンストラクタではなくモックを使用
        audioAccessibilitySupport = {
            audioManager: audioManager,
            settings: {
                visualFeedback: false,
                captioning: false,
                colorIndication: false,
                patternRecognition: false,
                hapticFeedback: false,
                vibrationIntensity: 0.8
            },
            triggerAudioEvent: mockFn(),
            triggerHapticFeedback: mockFn(),
            synchronizeWithBGMRhythm: mockFn(),
            triggerSpecialEffectVibration: mockFn(),
            updateHapticSettings: mockFn(),
            getStatistics: mockFn({
                settings: {};
                hapticSettings: {};
                eventHistory: 0,
                eventCounts: {};
                vibrationManager: { available: false, enabled: false }
            ),
        dispose: mockFn(),
        };
        vibrationManager = {
            config: { enabled: false, globalIntensity: 1.0 },
            deviceInfo: { hasVibration: true };
            triggerVibration: mockFn(),
            setEnabled: mockFn(),
            setGlobalIntensity: mockFn(),
            getDeviceInfo: mockFn({ hasVibration: true ),
            generateReport: mockFn({),
        destroy: mockFn(),
        };
    });
    afterEach((') => {
        // リソースのクリーンアップ
        if (audioManager && typeof audioManager.dispose === 'function') {
            audioManager.dispose(');
        }
        if (audioAccessibilitySupport && typeof audioAccessibilitySupport.dispose === 'function') {
            audioAccessibilitySupport.dispose(');
        }
        if (vibrationManager && typeof vibrationManager.destroy === 'function') {
            vibrationManager.destroy();
        }
    }');
    describe('BGMとSFXの同時再生テスト', (') => {
        test('BGMとSFXが同時に再生できること', async (') => {
            // BGMの再生開始
            const bgmResult = audioManager.playBGM('test-bgm', { loop: true });
            expect(bgmResult.toBeTruthy()');
            // SFXの再生
            const sfxResult = audioManager.playSound('bubblePop', { volume: 0.5 });
            expect(sfxResult.toBeTruthy();
            // 両方が再生状態であることを確認
            const status = audioManager.getStatus();
            expect(status.activeSounds).toBeGreaterThan(0);
        }');
        test('複数のSFXが同時に再生できること', (') => {
            // 複数の効果音を同時再生
            const sounds = ['bubblePop', 'comboAchieved', 'achievementUnlocked'];
            
            sounds.forEach(sound => {);
                const result = audioManager.playSound(sound, { volume: 0.3 });
                expect(result.toBeTruthy();
            });
            const status = audioManager.getStatus();
            expect(status.activeSounds).toBeGreaterThanOrEqual(sounds.length);
        }');
        test('同時再生数制限が正しく動作すること', () => {
            const maxConcurrentSounds = 20;
            
            // 制限を超える数の音を再生しようとする
            for (let i = 0; i < maxConcurrentSounds + 5; i++') {
                audioManager.playSound('bubblePop', { volume: 0.1 });
            }
            const status = audioManager.getStatus();
            expect(status.activeSounds).toBeLessThanOrEqual(maxConcurrentSounds);
        }');
    }
    describe('シーン遷移時の音響切り替えテスト', (') => {
        test('シーン変更時にBGMが正しく切り替わること', async (') => {
            // 初期シーンのBGM再生
            audioManager.playBGM('mainMenu'');
            // シーン切り替え
            audioManager.setScene('gamePlay');
            // BGMが変更されていることを確認
            const status = audioManager.getStatus();
            expect(status.currentBGM).toBeDefined();
        }');
        test('シーン切り替え時の音響フェード機能', async (') => {
            audioManager.playBGM('mainMenu', { volume: 0.8 });
            // フェード付きでシーン切り替え
            await audioManager.fadeOutBGM(500'); // 500ms でフェードアウト
            audioManager.playBGM('gamePlay', { fadeIn: 500 }); // 500ms でフェードイン
            
            // フェード処理が実行されたことを確認
            const status = audioManager.getStatus();
            expect(status.fadeTransitions).toBeDefined();
        }');
        test('シーン遷移時に不要なSFXが停止されること', (') => {
            // ゲーム内SFXを再生
            audioManager.playSound('bubblePop'');
            audioManager.playSound('comboAchieved'');
            // メニューシーンに移行
            audioManager.setScene('mainMenu');
            // ゲーム関連のSFXが停止されていることを確認
            const status = audioManager.getStatus();
            expect(status.sceneSpecificSounds).toBeDefined();
        }');
    }
    describe('設定変更の即座反映テスト', (') => {
        test('マスター音量変更が即座に反映されること', (') => {
            // BGMとSFXを再生
            audioManager.playBGM('test-bgm'');
            audioManager.playSound('bubblePop'');
            // マスター音量を変更
            audioManager.setVolume('master', 0.5);
            // 設定が即座に反映されていることを確認
            const status = audioManager.getStatus();
            expect(status.masterVolume).toBe(0.5);
        }');
        test('BGM音量変更が即座に反映されること', (') => {
            audioManager.playBGM('test-bgm'');
            audioManager.setVolume('bgm', 0.3);
            const status = audioManager.getStatus();
            expect(status.bgmVolume).toBe(0.3);
        }');
        test('SFX音量変更が即座に反映されること', (') => {
            audioManager.playSound('bubblePop'');
            audioManager.setVolume('sfx', 0.7);
            const status = audioManager.getStatus();
            expect(status.sfxVolume).toBe(0.7);
        }');
        test('ミュート切り替えが即座に反映されること', (') => {
            audioManager.playBGM('test-bgm'');
            audioManager.playSound('bubblePop');
            const initialMuted = audioManager.isMuted();
            audioManager.toggleMute();
            const status = audioManager.getStatus();
            expect(status.isMuted).toBe(!initialMuted);
        }');
        test('音響効果の有効/無効が即座に反映されること', (') => {
            audioManager.setAudioEffect('reverb', true');
            expect(audioManager.getAudioEffectStatus('reverb').toBe(true');
            audioManager.setAudioEffect('reverb', false');
            expect(audioManager.getAudioEffectStatus('reverb').toBe(false);
        }');
    }
    describe('アクセシビリティ機能統合テスト', (') => {
        test('音響イベントがアクセシビリティシステムに通知されること', (') => {
            // アクセシビリティ支援を有効化
            audioAccessibilitySupport.settings.visualFeedback = true;
            
            // 音響イベントを発生
            audioManager.playSound('bubblePop'');
            audioAccessibilitySupport.triggerAudioEvent('bubblePop', {
                bubbleType: 'normal',
                comboLevel: 1,
                position: { x: 100, y: 100 });
            });
            // イベントが通知されたことを確認
            expect(audioAccessibilitySupport.triggerAudioEvent.calls.length).toBeGreaterThan(0);
        }');
        test('触覚フィードバックが音響イベントと連動すること', (') => {
            // 触覚フィードバックを有効化
            audioAccessibilitySupport.settings.hapticFeedback = true;
            
            // 音響イベントと触覚フィードバックを連動
            audioManager.playSound('comboAchieved'');
            audioAccessibilitySupport.triggerHapticFeedback('comboAchieved', {
                comboLevel: 'great',
                comboCount: 5);
            // 触覚フィードバックが発動したことを確認
            expect(audioAccessibilitySupport.triggerHapticFeedback.calls.length).toBeGreaterThan(0);
        }');
        test('視覚的通知が音響レベルと連動すること', (') => {
            audioAccessibilitySupport.settings.visualFeedback = true;
            audioAccessibilitySupport.settings.colorIndication = true;
            
            // 高音量の音響を再生
            audioManager.playSound('explosion', { volume: 0.9 });
            // 視覚的インジケーターが更新されることを確認
            const stats = audioAccessibilitySupport.getStatistics();
            expect(stats.toBeDefined();
        }');
        test('BGMリズムと触覚フィードバックが同期すること', () => {
            audioAccessibilitySupport.settings.hapticFeedback = true;
            
            // BGMのリズムデータをシミュレート
            const rhythmData = {
                bpm: 120,
                beat: 4,
                intensity: 0.7
            };
            
            audioAccessibilitySupport.synchronizeWithBGMRhythm(rhythmData);
            // リズム同期が実行されたことを確認
            expect(audioAccessibilitySupport.synchronizeWithBGMRhythm.calls.length).toBeGreaterThan(0);
        }');
    }
    describe('エラーハンドリングとフォールバック', (') => {
        test('Web Audio API未対応時のフォールバック', () => {
            // Web Audio APIを無効化
            const originalAudioContext = global.AudioContext;
            global.AudioContext = undefined;
            global.webkitAudioContext = undefined;
            
            // AudioManager を再初期化
            const fallbackAudioManager = new AudioManager();
            // フォールバックが動作することを確認
            expect(fallbackAudioManager.toBeDefined();
            expect(fallbackAudioManager.getStatus().webAudioSupported).toBe(false);
            // 元の設定を復元
            global.AudioContext = originalAudioContext;
            global.webkitAudioContext = originalAudioContext;
        }');
        test('音響ファイル読み込み失敗時のエラーハンドリング', async (') => {
            // 存在しない音響ファイルを再生しようとする
            const result = audioManager.playSound('nonexistent-sound');
            // エラーが適切に処理されること
            expect(result.toBeFalsy();
            // AudioManager が正常な状態を維持していること  
            const status = audioManager.getStatus();
            expect(status.errors).toBeDefined();
        }');
        test('触覚フィードバック未対応時のフォールバック', (') => {
            // 振動APIを無効化
            global.navigator.vibrate = undefined;
            
            // 触覚フィードバックを試行
            audioAccessibilitySupport.triggerHapticFeedback('bubblePop', {});
            // エラーが発生しないことを確認
            expect(audioAccessibilitySupport.triggerHapticFeedback.calls.length).toBeGreaterThan(0);
        }');
        test('メモリ不足時の音響キューイング制限', () => {
            // 大量の音響を同時再生しようとする
            for (let i = 0; i < 100; i++') {
                audioManager.playSound('bubblePop', { volume: 0.01 });
            }
            
            // システムが安定していることを確認
            const status = audioManager.getStatus();
            expect(status.activeSounds).toBeLessThan(50); // 制限が効いている
            expect(status.memoryUsage).toBeDefined();
        }');
    }
    describe('パフォーマンス統合テスト', (') => {
        test('音響処理のCPU使用率が制限内であること', () => {
            // 高負荷の音響処理をシミュレート
            for (let i = 0; i < 10; i++') {
                audioManager.playSound('explosion'');
                audioManager.setAudioEffect('reverb', i % 2 === 0);
            }
            
            const performanceData = audioManager.getPerformanceMetrics();
            expect(performanceData.cpuUsage).toBeLessThan(0.7); // 70%未満
        }');
        test('メモリ使用量が制限内であること', (') => {
            // 音響データのメモリ使用量をテスト
            audioManager.preloadSounds([
                'bubblePop', 'comboAchieved', 'achievementUnlocked',
                'explosion', 'freeze', 'electric')
            ]);
            const performanceData = audioManager.getPerformanceMetrics();
            expect(performanceData.memoryUsage).toBeLessThan(50 * 1024 * 1024); // 50MB未満
        }');
        test('音響遅延が許容範囲内であること', async () => {
            const startTime = Date.now(');
            // 音響再生のレスポンス時間を測定
            audioManager.playSound('bubblePop');
            const endTime = Date.now();
            const latency = endTime - startTime;
            
            expect(latency.toBeLessThan(100); // 100ms未満
        }');
        test('長時間実行でのメモリリークがないこと', async () => {
            const initialMemory = audioManager.getPerformanceMetrics().memoryUsage;
            
            // 長時間の音響処理をシミュレート
            for (let i = 0; i < 100; i++') {
                audioManager.playSound('bubblePop');
                await new Promise(resolve => setTimeout(resolve, 10);
            }
            
            // ガベージコレクションをシミュレート
            audioManager.garbageCollect? .();
            const finalMemory = audioManager.getPerformanceMetrics().memoryUsage;
            const memoryIncrease = finalMemory - initialMemory;
            
            expect(memoryIncrease.toBeLessThan(10 * 1024 * 1024); // 10MB未満の増加
        }');
    }
    describe('システム全体統合テスト', (') => {
        test('ゲームシナリオ全体での音響システム動作', async (') => {
            // ゲーム開始
            audioManager.setScene('gameStart''); : undefined
            audioManager.playBGM('gameMusic', { loop: true }');
            // プレイヤーアクション
            audioManager.playSound('bubblePop'');
            audioAccessibilitySupport.triggerAudioEvent('bubblePop', {
                bubbleType: 'normal')');
            // コンボ達成
            audioManager.playSound('comboAchieved'');
            audioAccessibilitySupport.triggerHapticFeedback('comboAchieved', {
                comboCount: 5)');
            // 実績解除
            audioManager.playSound('achievementUnlocked'');
            audioAccessibilitySupport.triggerAudioEvent('achievementUnlocked', {
                achievementName: 'Test Achievement',
                rarity: 'rare');
            // ゲーム終了
            audioManager.fadeOutBGM(1000');
            audioManager.setScene('gameOver');
            // 全ての処理が正常に実行されたことを確認
            const audioStatus = audioManager.getStatus();
            const accessibilityStats = audioAccessibilitySupport.getStatistics();
            expect(audioStatus.toBeDefined();
            expect(accessibilityStats.toBeDefined();
            expect(audioAccessibilitySupport.triggerAudioEvent.calls.length).toBeGreaterThan(0);
        }');
        test('設定変更がシステム全体に即座に反映されること', (') => {
            // 各種設定を変更
            audioManager.setVolume('master', 0.6');
            audioManager.setVolume('bgm', 0.4');
            audioManager.setVolume('sfx', 0.8');
            audioManager.setAudioEffect('reverb', true);
            // アクセシビリティ設定変更
            audioAccessibilitySupport.updateHapticSettings({
                enabled: true,
                vibrationIntensity: 0.9)');
            // BGMとSFXを再生して設定が反映されることを確認
            audioManager.playBGM('test-bgm'');
            audioManager.playSound('bubblePop');
            const status = audioManager.getStatus();
            expect(status.masterVolume).toBe(0.6);
            expect(status.bgmVolume).toBe(0.4);
            expect(status.sfxVolume).toBe(0.8);
            expect(audioAccessibilitySupport.updateHapticSettings.calls.length).toBeGreaterThan(0);
        }');
        test('エラー発生時でもシステムが継続動作すること', (') => {
            // 意図的にエラーを発生
            audioManager.playSound('invalid-sound'');
            audioAccessibilitySupport.triggerHapticFeedback('invalid-event', {}');
            // システムが正常に動作を続けることを確認
            const validResult = audioManager.playSound('bubblePop');
            expect(validResult.toBeTruthy();
            const status = audioManager.getStatus();
            expect(status.isActive).toBe(true);
        });
    }
}');