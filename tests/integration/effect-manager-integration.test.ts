import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * EffectManager統合テスト
 * 
 * EffectManagerと新しい設定システムの統合をテストします。
 * 設定変更の動的反映、EffectsConfigとの連携を検証します。
 */
import { EffectManager } from '../../src/effects/EffectManager';
import { getEffectsConfig } from '../../src/config/EffectsConfig';
import { getConfigurationManager } from '../../src/core/ConfigurationManager';
// Jest モック関数を使用
describe('EffectManager統合テスト', () => {
    let effectManager: any,
    let effectsConfig: any,
    let configManager: any,
    let mockCanvas: any,
    beforeAll(() => {
        // コンソールのモック
        global.console = {
            log: jest.fn(
            warn: jest.fn(
            error: jest.fn(
        info: jest.fn( };
    );
    beforeEach(() => {
        // モックキャンバスの作成
        mockCanvas = {
            width: 800,
            height: 600,
            getContext: mockFn(() => ({
                save: jest.fn(
                restore: jest.fn(
                translate: jest.fn(
                scale: jest.fn(
                rotate: jest.fn(
                setTransform: jest.fn(
                fillRect: jest.fn(','
                globalAlpha: 1,
                fillStyle: '#000000',
                globalCompositeOperation: 'source-over',
                filter: 'none'
            });
        };
        // 設定システムの初期化
        effectsConfig = getEffectsConfig();
        configManager = getConfigurationManager();
        // EffectManagerの作成
        effectManager = new EffectManager(mockCanvas);
    });
    afterEach(() => {
        // クリーンアップ
        if (effectManager) {
            effectManager.dispose(') }'
        
        // 設定をリセット（存在する場合のみ）
        if (configManager && typeof configManager.reset === 'function') {
            configManager.reset('effects') }
    }');'
    describe('設定システムとの基本連携', (') => {'
        test('EffectManagerが設定システムと正しく連携している', () => {
            expect(effectManager.effectsConfig).toBeDefined(),
            expect(effectManager.configWatchers).toBeDefined(),
            expect(effectManager.configWatchers.size).toBeGreaterThan(0) }');'
        test('設定値を正しく取得できる', (') => {'
            const shakeIntensity = effectManager.getConfigValue('shakeIntensity'),
            const flashDuration = effectManager.getConfigValue('flashDuration'),
            const zoomSensitivity = effectManager.getConfigValue('zoomSensitivity'),
            const enabled = effectManager.getConfigValue('enabled'),
            expect(typeof shakeIntensity').toBe('number'),'
            expect(typeof flashDuration').toBe('number'),'
            expect(typeof zoomSensitivity').toBe('number'),'
            expect(typeof enabled').toBe('boolean') }');
        test('設定値を正しく変更できる', (') => {'
            const newShakeIntensity = 1.5,
            const newFlashDuration = 300,
            const newZoomSensitivity = 0.8,
            expect(effectManager.setConfigValue('shakeIntensity', newShakeIntensity).toBe(true'),'
            expect(effectManager.setConfigValue('flashDuration', newFlashDuration).toBe(true'),'
            expect(effectManager.setConfigValue('zoomSensitivity', newZoomSensitivity).toBe(true'),'
            expect(effectManager.getConfigValue('shakeIntensity').toBe(newShakeIntensity'),'
            expect(effectManager.getConfigValue('flashDuration').toBe(newFlashDuration'),'
            expect(effectManager.getConfigValue('zoomSensitivity').toBe(newZoomSensitivity) }');'
        test('無効な設定キーに対して適切に処理する', (') => {'
            expect(effectManager.setConfigValue('invalidKey', 123).toBe(false'),'
            expect(effectManager.getConfigValue('invalidKey').toBe(null) }');'
    }
    describe('画面効果の設定適用', (') => {'
        test('画面揺れ効果に設定が適用される', (') => {'
            // 設定値を変更
            effectManager.setConfigValue('shakeIntensity', 2.0),
            // 効果を追加
            const effectId = effectManager.addScreenShake(10, 500),
            expect(effectId.toBeGreaterThanOrEqual(0),
            expect(effectManager.effects.length).toBe(1),
            const effect = effectManager.effects[0],
            expect(effect.intensity).toBe(20), // 10 * 2.0
            expect(effect.damping).toBe(0.9), // 設定から取得
        }');'
        test('フラッシュ効果に設定が適用される', (') => {'
            // 設定値を変更
            const setResult = effectManager.setConfigValue('flashDuration', 400),
            expect(setResult.toBe(true)'),'
            // 設定が正しく更新されているか確認
            const currentDuration = effectManager.getConfigValue('flashDuration'),
            expect(currentDuration.toBe(400)'),'
            // 効果を追加（durationを指定しない）
            const effectId = effectManager.addFlash('#FF0000', 0.5, undefined),
            expect(effectId.toBeGreaterThanOrEqual(0),
            expect(effectManager.effects.length).toBe(1),
            const effect = effectManager.effects[0],
            expect(effect.duration).toBe(400), // 設定から取得
        }');'
        test('ズーム効果に設定が適用される', (') => {'
            // 設定値を変更
            effectManager.setConfigValue('zoomSensitivity', 0.5),
            // 効果を追加
            const effectId = effectManager.addZoom(1.2, 300),
            expect(effectId.toBeGreaterThanOrEqual(0),
            expect(effectManager.effects.length).toBe(1),
            const effect = effectManager.effects[0],
            // 1 + (1.2 - 1) * 0.5 = 1.1
            expect(effect.targetZoom).toBe(1.1) }');'
        test('色調効果に設定が適用される', (') => {'
            // 効果を追加（durationを指定しない）
            const effectId = effectManager.addTint('#00FF00', 0.4),
            expect(effectId.toBeGreaterThanOrEqual(0),
            expect(effectManager.effects.length).toBe(1),
            const effect = effectManager.effects[0],
            expect(effect.duration).toBe(500), // デフォルト設定から取得
        }');'
    }
    describe('画面効果の有効/無効制御', (') => {'
        test('画面効果が無効な場合、効果が追加されない', (') => {'
            // 画面効果を無効にする
            effectManager.setConfigValue('enabled', false),
            // 各種効果を追加
            const shakeId = effectManager.addScreenShake(10, 500'),'
            const flashId = effectManager.addFlash('#FF0000', 0.5, 200),
            const zoomId = effectManager.addZoom(1.2, 300'),'
            const tintId = effectManager.addTint('#00FF00', 0.4, 400),
            // 全て無効なIDが返される
            expect(shakeId.toBe(-1),
            expect(flashId.toBe(-1),
            expect(zoomId.toBe(-1),
            expect(tintId.toBe(-1),
            // 効果が追加されていない
            expect(effectManager.effects.length).toBe(0) }');'
        test('画面効果を無効にすると既存の効果がクリアされる', () => {
            // 効果を追加
            effectManager.addScreenShake(10, 500'),'
            effectManager.addFlash('#FF0000', 0.5, 200),
            expect(effectManager.effects.length).toBe(2'),'
            // 画面効果を無効にする
            effectManager.setConfigValue('enabled', false),
            // 効果がクリアされる
            expect(effectManager.effects.length).toBe(0) }');'
    }
    describe('動的設定変更', (') => {'
        test('設定変更が動的に反映される', () => {
            // 初期設定で効果を追加
            const initialShakeId = effectManager.addScreenShake(10, 500),
            expect(effectManager.effects[0].intensity).toBe(10'), // 1.0 * 10'
            
            // 設定を変更
            effectManager.setConfigValue('shakeIntensity', 1.5),
            // 新しい効果を追加
            const newShakeId = effectManager.addScreenShake(10, 500),
            expect(effectManager.effects[1].intensity).toBe(15), // 1.5 * 10
        }');'
        test('updateConfigurationメソッドが正しく動作する', () => {
            // 効果を追加
            effectManager.addScreenShake(10, 500),
            expect(effectManager.effects.length).toBe(1),
            // 直接設定を変更（EffectManagerを通さない）
            effectsConfig.setScreenEffectEnabled(false),
            // 設定を更新
            effectManager.updateConfiguration(),
            // 効果がクリアされる
            expect(effectManager.effects.length).toBe(0) }');'
    }
    describe('EffectsConfigとの連携', (') => {'
        test('EffectsConfigからEffectManagerに設定を適用できる', () => {
            // 設定を変更
            effectsConfig.setShakeIntensity(1.8),
            effectsConfig.setFlashDuration(350),
            // EffectManagerに適用
            effectsConfig.applyToEffectManager(effectManager'),'
            // 設定が反映されている
            expect(effectManager.getConfigValue('shakeIntensity').toBe(1.8'),'
            expect(effectManager.getConfigValue('flashDuration').toBe(350) }');'
        test('EffectManagerからEffectsConfigに設定を同期できる', (') => {'
            // EffectManagerで設定を変更
            effectManager.setConfigValue('shakeIntensity', 1.3'),'
            effectManager.setConfigValue('zoomSensitivity', 0.7),
            // EffectsConfigに同期
            effectsConfig.syncFromEffectManager(effectManager),
            // 設定が同期されている
            expect(effectsConfig.getShakeIntensity().toBe(1.3),
            expect(effectsConfig.getZoomSensitivity().toBe(0.7) }');'
    }
    describe('複合効果のテスト', (') => {'
        test('時間停止効果が設定を考慮して動作する', (') => {'
            // 設定を変更
            effectManager.setConfigValue('shakeIntensity', 0.5'),'
            effectManager.setConfigValue('zoomSensitivity', 0.8),
            // 時間停止効果を追加
            effectManager.addTimeStopEffect(2000),
            // 複数の効果が追加される
            expect(effectManager.effects.length).toBeGreaterThan(1'),'
            // 各効果に設定が適用されている
            const effects = effectManager.effects,
            const hasShake = effects.some(e => e.type === 'shake'),
            const hasZoom = effects.some(e => e.type === 'zoom'),
            const hasFlash = effects.some(e => e.type === 'flash'),
            const hasTint = effects.some(e => e.type === 'tint'),
            expect(hasShake || hasZoom || hasFlash || hasTint).toBe(true) }');'
        test('爆発効果が設定を考慮して動作する', (') => {'
            // 設定を変更
            effectManager.setConfigValue('shakeIntensity', 2.0),
            // 爆発効果を追加
            effectManager.addExplosionEffect(400, 300, 1.5),
            // 複数の効果が追加される
            expect(effectManager.effects.length).toBeGreaterThan(1'),'
            // 画面揺れ効果が含まれ、設定が適用されている
            const shakeEffect = effectManager.effects.find(e => e.type === 'shake'),
            expect(shakeEffect.toBeDefined(),
            expect(shakeEffect.intensity).toBeGreaterThan(15), // 15 * 1.5 * 2.0
        }');'
    }
    describe('エラーハンドリング', (') => {'
        test('設定取得エラーに対して適切に処理する', () => {
            // 設定システムを無効にする
            effectManager.effectsConfig = null,
            
            // 効果を追加してもエラーにならない
            const effectId = effectManager.addScreenShake(10, 500),
            expect(effectId.toBe(-1) }');'
        test('設定変更エラーに対して適切に処理する', (') => {'
            // 設定システムを無効にする
            effectManager.effectsConfig = null,
            
            // 設定変更してもエラーにならない
            const result = effectManager.setConfigValue('shakeIntensity', 1.5),
            expect(result.toBe(false) }');'
    }
    describe('リソース管理', (') => {'
        test('disposeメソッドが正しく動作する', () => {
            // 効果を追加
            effectManager.addScreenShake(10, 500'),'
            effectManager.addFlash('#FF0000', 0.5, 200),
            expect(effectManager.effects.length).toBe(2),
            // 設定監視が設定されている
            expect(effectManager.configWatchers.size).toBeGreaterThan(0),
            // リソースを解放
            effectManager.dispose(),
            // 効果がクリアされる
            expect(effectManager.effects.length).toBe(0),
            // 設定監視がクリアされる
            expect(effectManager.configWatchers.size).toBe(0) }');'
    }
    describe('レガシー互換性', (') => {'
        test('既存のAPIが引き続き動作する', () => {
            // 既存のメソッドが動作する
            const flashId = effectManager.addScreenFlash(0.5, 300),
            const tintId = effectManager.addScreenTint(0.3, 400),
            const vignetteId = effectManager.addVignette(0.4, 500),
            expect(flashId.toBeGreaterThanOrEqual(0),
            expect(tintId.toBeGreaterThanOrEqual(0),
            expect(vignetteId.toBeGreaterThanOrEqual(0),
            expect(effectManager.effects.length).toBe(3) }');'
        test('既存の効果メソッドが設定を考慮する', (') => {'
            // 設定を変更
            effectManager.setConfigValue('shakeIntensity', 1.5),
            // 既存のメソッドを使用
            const flashId = effectManager.addScreenFlash(0.6, 250),
            expect(effectManager.effects.length).toBe(1),
            const effect = effectManager.effects[0],
            
            // 設定が適用されている
            expect(effect.intensity).toBeLessThan(0.6), // flash.intensityが適用される
        });
    }
}');'