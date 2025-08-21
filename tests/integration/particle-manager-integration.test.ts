import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * ParticleManager統合テスト
 * 
 * ParticleManagerとEffectsConfigの統合、
 * 設定の動的変更機能をテストします。
 */
import { ParticleManager } from '../../src/effects/ParticleManager';
import { getEffectsConfig } from '../../src/config/EffectsConfig';
import { getConfigurationManager } from '../../src/core/ConfigurationManager';
describe('ParticleManager統合テスト', () => {
    let particleManager: any,
    let effectsConfig: any,
    let configManager: any,
    beforeEach(() => {
        // 設定をリセット
        configManager = getConfigurationManager(),
        configManager.reset(),
        effectsConfig = getEffectsConfig(),
        particleManager = new ParticleManager() });
    afterEach(() => {
        if (particleManager) {
            particleManager.clear() }
        configManager.reset();
    }');'
    describe('初期化テスト', (') => {'
        test('EffectsConfigから設定を正しく読み込む', () => {
            const particleConfig = effectsConfig.getParticleConfig(),
            expect(particleManager.maxParticles).toBe(particleConfig.maxCount),
            expect(particleManager.poolSize).toBe(particleConfig.poolSize),
            expect(particleManager.quality).toBe(particleConfig.quality),
            expect(particleManager.enabled).toBe(particleConfig.enabled) }');'
        test('パーティクルプールが正しく初期化される', () => {
            expect(particleManager.particlePool).toBeDefined(),
            expect(particleManager.particlePool.length).toBe(particleManager.poolSize) }');'
        test('設定変更監視が正しく設定される', () => {
            // 設定変更監視の存在確認（内部実装のため間接的にテスト）
            expect(particleManager.effectsConfig).toBeDefined(),
            expect(particleManager.effectsConfig.configManager).toBeDefined() }');'
    }
    describe('設定の動的変更テスト', (') => {'
        test('最大パーティクル数の動的変更', async () => {
            const initialMaxParticles = particleManager.maxParticles,
            const newMaxParticles = 300,
            // 設定を変更
            effectsConfig.setMaxParticleCount(newMaxParticles),
            // 少し待って変更が反映されるのを確認
            await new Promise(resolve => setTimeout(resolve, 10),
            expect(particleManager.maxParticles).toBe(newMaxParticles),
            expect(particleManager.maxParticles).not.toBe(initialMaxParticles) }');'
        test('プールサイズの動的変更', async () => {
            const initialPoolSize = particleManager.poolSize,
            const newPoolSize = 150,
            // 設定を変更
            effectsConfig.setParticlePoolSize(newPoolSize),
            // 少し待って変更が反映されるのを確認
            await new Promise(resolve => setTimeout(resolve, 10),
            expect(particleManager.poolSize).toBe(newPoolSize),
            expect(particleManager.particlePool.length).toBe(newPoolSize) }');'
        test('品質の動的変更', async () => {
            const initialQuality = particleManager.quality,
            const newQuality = 0.5,
            // 設定を変更
            effectsConfig.setParticleQuality(newQuality),
            // 少し待って変更が反映されるのを確認
            await new Promise(resolve => setTimeout(resolve, 10),
            expect(particleManager.quality).toBe(newQuality),
            expect(particleManager.quality).not.toBe(initialQuality) }');'
        test('有効状態の動的変更', async (') => {'
            // パーティクルを作成
            particleManager.createBubblePopEffect(100, 100, 'normal', 20),
            expect(particleManager.particles.length).toBeGreaterThan(0),
            // 無効に変更
            effectsConfig.setParticleEnabled(false),
            // 少し待って変更が反映されるのを確認
            await new Promise(resolve => setTimeout(resolve, 10),
            expect(particleManager.enabled).toBe(false),
            expect(particleManager.particles.length).toBe(0), // パーティクルがクリアされる
        }');'
    }
    describe('パーティクル生成テスト', (') => {'
        test('泡ポップエフェクトが設定に基づいて生成される', () => {
            const particleConfig = effectsConfig.getParticleConfig('),'
            const bubbleSize = 20,
            
            particleManager.createBubblePopEffect(100, 100, 'normal', bubbleSize),
            expect(particleManager.particles.length).toBeGreaterThan(0),
            // 品質に基づいてパーティクル数が調整されているか確認
            const expectedBaseCount = Math.floor(bubbleSize / 5) + particleConfig.bubble.count,
            const expectedCount = Math.floor(expectedBaseCount * particleManager.quality),
            expect(particleManager.particles.length).toBeCloseTo(expectedCount, 5) }');'
        test('コンボエフェクトが設定に基づいて生成される', () => {
            const particleConfig = effectsConfig.getParticleConfig(),
            const comboCount = 5,
            
            particleManager.createComboEffect(100, 100, comboCount),
            expect(particleManager.particles.length).toBeGreaterThan(0),
            // 品質に基づいてパーティクル数が調整されているか確認
            const expectedBaseCount = Math.min(comboCount, particleConfig.star.count * 2),
            const expectedCount = Math.floor(expectedBaseCount * particleManager.quality),
            expect(particleManager.particles.length).toBeCloseTo(expectedCount, 2) }');'
        test('パーティクルが無効な場合は生成されない', async () => {
            // パーティクルを無効にする
            effectsConfig.setParticleEnabled(false),
            await new Promise(resolve => setTimeout(resolve, 10)'),'
            particleManager.createBubblePopEffect(100, 100, 'normal', 20),
            expect(particleManager.particles.length).toBe(0),
            particleManager.createComboEffect(100, 100, 5),
            expect(particleManager.particles.length).toBe(0) }');'
    }
    describe('設定管理メソッドテスト', (') => {'
        test('updateConfiguration メソッド', () => {
            const newConfig = {
                maxParticles: 400,
                poolSize: 80,
                quality: 0.8,
                enabled: false,;
            particleManager.updateConfiguration(newConfig);
            // 設定が EffectsConfig に反映されているか確認
            expect(effectsConfig.getMaxParticleCount().toBe(newConfig.maxParticles);
            expect(effectsConfig.getParticlePoolSize().toBe(newConfig.poolSize);
            expect(effectsConfig.getParticleQuality().toBe(newConfig.quality);
            expect(effectsConfig.isParticleEnabled().toBe(newConfig.enabled);
        }');'
        test('getCurrentConfiguration メソッド', () => {
            const config = particleManager.getCurrentConfiguration('),'
            expect(config.toHaveProperty('maxParticles')'),'
            expect(config.toHaveProperty('poolSize')'),'
            expect(config.toHaveProperty('quality')'),'
            expect(config.toHaveProperty('enabled')'),'
            expect(config.toHaveProperty('currentParticleCount')'),'
            expect(config.toHaveProperty('poolUsage'),
            expect(typeof config.maxParticles').toBe('number'),'
            expect(typeof config.poolSize').toBe('number'),'
            expect(typeof config.quality').toBe('number'),'
            expect(typeof config.enabled').toBe('boolean'),'
            expect(typeof config.currentParticleCount').toBe('number'),'
            expect(typeof config.poolUsage').toBe('number') }');
        test('getPerformanceStats メソッド', () => {
            const stats = particleManager.getPerformanceStats('),'
            expect(stats.toHaveProperty('activeParticles')'),'
            expect(stats.toHaveProperty('maxParticles')'),'
            expect(stats.toHaveProperty('poolSize')'),'
            expect(stats.toHaveProperty('availableInPool')'),'
            expect(stats.toHaveProperty('poolUsagePercent')'),'
            expect(stats.toHaveProperty('particleUtilizationPercent')'),'
            expect(stats.toHaveProperty('quality')'),'
            expect(stats.toHaveProperty('enabled'),
            expect(typeof stats.poolUsagePercent').toBe('string'),'
            expect(typeof stats.particleUtilizationPercent').toBe('string') }');
    }
    describe('パフォーマンステスト', (') => {'
        test('最大パーティクル数制限が正しく動作する', () => {
            const maxParticles = 10,
            effectsConfig.setMaxParticleCount(maxParticles),
            // 制限を超えるパーティクルを生成しようとする
            for (let i = 0, i < 5, i++') {'
                particleManager.createBubblePopEffect(100 + i * 10, 100, 'normal', 20) }
            // 更新処理を実行してパーティクル数制限を適用
            particleManager.update(16); // 16ms (60fps);
            expect(particleManager.particles.length).toBeLessThanOrEqual(maxParticles);
        }');'
        test('プールサイズ変更時のメモリ効率', () => {
            const initialPoolSize = particleManager.poolSize,
            const newPoolSize = initialPoolSize * 2,
            // プールサイズを増加
            effectsConfig.setParticlePoolSize(newPoolSize),
            expect(particleManager.particlePool.length).toBe(newPoolSize),
            // プールサイズを減少
            const smallerPoolSize = Math.floor(initialPoolSize / 2),
            effectsConfig.setParticlePoolSize(smallerPoolSize),
            expect(particleManager.particlePool.length).toBe(smallerPoolSize) }');'
        test('品質設定がパーティクル生成に影響する', () => {
            // 高品質設定
            effectsConfig.setParticleQuality(2.0'),'
            particleManager.createBubblePopEffect(100, 100, 'normal', 20),
            const highQualityCount = particleManager.particles.length,
            particleManager.clear(),
            // 低品質設定
            effectsConfig.setParticleQuality(0.5'),'
            particleManager.createBubblePopEffect(100, 100, 'normal', 20),
            const lowQualityCount = particleManager.particles.length,
            expect(highQualityCount.toBeGreaterThan(lowQualityCount) }');'
    }
    describe('エラーハンドリングテスト', (') => {'
        test('無効な設定値でもエラーが発生しない', () => {
            expect(() => {
                particleManager.updateConfiguration({
                    maxParticles: -1,
                    poolSize: -1,
                    quality: -1 });
            }).not.toThrow(');'
        }
        test('nullやundefinedの設定でもエラーが発生しない', () => {
            expect(() => {
                particleManager.updateConfiguration({
                    maxParticles: null,
                    poolSize: undefined,
                    quality: null,);
            }).not.toThrow();
        }
    }');'
    describe('同期テスト', (') => {'
        test('syncWithEffectsConfig メソッド', () => {
            // ParticleManagerの内部状態を変更
            particleManager.maxParticles = 999,
            particleManager.poolSize = 199,
            // 同期を実行
            expect(() => {
                particleManager.syncWithEffectsConfig() }).not.toThrow();
        }
    }');'
    describe('デバッグ機能テスト', (') => {'
        test('debugInfo メソッドがエラーなく実行される', () => {
            // コンソール出力をモック
            const originalGroup = console.group,
            const originalLog = console.log,
            const originalGroupEnd = console.groupEnd,
            
            let groupCalled = false,
            let logCalled = false,
            let groupEndCalled = false,
            
            console.group = () => { groupCalled = true };
            console.log = () => { logCalled = true };
            console.groupEnd = () => { groupEndCalled = true };
            expect(() => {
                particleManager.debugInfo() }).not.toThrow();
            expect(groupCalled.toBe(true);
            expect(logCalled.toBe(true);
            expect(groupEndCalled.toBe(true);
            // モックを復元
            console.group = originalGroup;
            console.log = originalLog;
            console.groupEnd = originalGroupEnd;
        });
    }
}');'