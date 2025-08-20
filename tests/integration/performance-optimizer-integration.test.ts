import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * PerformanceOptimizer統合テスト
 * 新しいPerformanceConfigシステムとの統合をテスト
 */

import { PerformanceOptimizer, getPerformanceOptimizer, reinitializePerformanceOptimizer } from '../../src/utils/PerformanceOptimizer';
import { getPerformanceConfig } from '../../src/config/PerformanceConfig';
import { getConfigurationManager } from '../../src/core/ConfigurationManager';

describe('PerformanceOptimizer統合テスト', () => {
    let performanceOptimizer: any;
    let performanceConfig: any;
    let configManager: any;

    beforeEach(() => {
        // 各テスト前にクリーンな状態を作成
        configManager = getConfigurationManager();
        performanceConfig = getPerformanceConfig();
        
        // 設定をリセット
        performanceConfig.setTargetFPS(60);
        performanceConfig.setAdaptiveModeEnabled(true);
        performanceConfig.setPerformanceLevel('high');
        performanceConfig.setMaxBubbles(20);
        performanceConfig.setMaxParticles(500);
        performanceConfig.setRenderQuality(1.0);
        performanceConfig.setParticleQuality(1.0);
        performanceConfig.setEffectQuality(1.0);
        performanceConfig.setAudioQuality(1.0);
        performanceConfig.setShadowsEnabled(true);
        performanceConfig.setBlurEnabled(true);
        performanceConfig.setAntiAliasingEnabled(true);
        
        performanceOptimizer = new PerformanceOptimizer();
    });

    afterEach(() => {
        // テスト後のクリーンアップ
        if (performanceOptimizer) {
            performanceOptimizer.reset();
        }
    });

    describe('初期化テスト', () => {
        test('PerformanceConfigから設定を正しく読み込む', () => {
            expect(performanceOptimizer.targetFPS).toBe(60);
            expect(performanceOptimizer.adaptiveMode).toBe(true);
            expect(performanceOptimizer.performanceLevel).toBe('high');
            // 実際のPerformanceConfig設定値に合わせる
            expect(performanceOptimizer.settings.maxBubbles).toBe(20);
            expect(performanceOptimizer.settings.maxParticles).toBe(500);
            expect(performanceOptimizer.settings.renderQuality).toBe(1.0);
            expect(performanceOptimizer.settings.particleQuality).toBe(1.0);
            expect(performanceOptimizer.settings.effectQuality).toBe(1.0);
            expect(performanceOptimizer.settings.audioQuality).toBe(1.0);
            expect(performanceOptimizer.settings.shadowsEnabled).toBe(true);
            expect(performanceOptimizer.settings.blurEnabled).toBe(true);
            expect(performanceOptimizer.settings.antiAliasingEnabled).toBe(true);
        });

        test('設定変更の監視が正しく設定される', async () => {
            // 設定を変更
            performanceConfig.setTargetFPS(30);
            
            // 非同期更新のため少し待機
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // PerformanceOptimizerに反映されることを確認
            expect(performanceOptimizer.targetFPS).toBe(30);
            expect(performanceOptimizer.targetFrameTime).toBe(1000 / 30);
        });

        test('無効な設定でもフォールバック設定で初期化される', () => {
            // 設定システムを一時的に無効化してフォールバックをテスト
            const originalGetOptimizationConfig = performanceConfig.getOptimizationConfig;
            performanceConfig.getOptimizationConfig = () => {
                throw new Error('設定取得エラー');
            };
            
            const optimizer = new PerformanceOptimizer();
            
            // フォールバック設定が適用されることを確認
            expect(optimizer.targetFPS).toBe(60);
            expect(optimizer.settings.maxBubbles).toBe(50); // フォールバック値
            
            // 元のメソッドを復元
            performanceConfig.getOptimizationConfig = originalGetOptimizationConfig;
        });
    });

    describe('設定変更の動的反映テスト', () => {
        test('目標FPSの動的変更', () => {
            performanceOptimizer.setTargetFPS(120);
            
            expect(performanceOptimizer.targetFPS).toBe(120);
            expect(performanceOptimizer.targetFrameTime).toBe(1000 / 120);
            expect(performanceConfig.getTargetFPS()).toBe(120);
        });

        test('適応モードの動的変更', () => {
            performanceOptimizer.setAdaptiveMode(false);
            
            expect(performanceOptimizer.adaptiveMode).toBe(false);
            expect(performanceConfig.isAdaptiveModeEnabled()).toBe(false);
            expect(performanceOptimizer.performanceLevel).toBe('high'); // 無効時は高品質に
        });

        test('最大バブル数の動的変更', () => {
            performanceOptimizer.setMaxBubbles(30);
            
            expect(performanceOptimizer.settings.maxBubbles).toBe(30);
            expect(performanceConfig.getMaxBubbles()).toBe(30);
        });

        test('最大パーティクル数の動的変更', () => {
            performanceOptimizer.setMaxParticles(1000);
            
            expect(performanceOptimizer.settings.maxParticles).toBe(1000);
            expect(performanceConfig.getMaxParticles()).toBe(1000);
        });

        test('レンダリング品質の動的変更', () => {
            performanceOptimizer.setRenderQuality(0.8);
            
            expect(performanceOptimizer.settings.renderQuality).toBe(0.8);
            expect(performanceConfig.getRenderQuality()).toBe(0.8);
        });

        test('パーティクル品質の動的変更', () => {
            performanceOptimizer.setParticleQuality(0.5);
            
            expect(performanceOptimizer.settings.particleQuality).toBe(0.5);
            expect(performanceConfig.getParticleQuality()).toBe(0.5);
        });

        test('エフェクト品質の動的変更', () => {
            performanceOptimizer.setEffectQuality(0.7);
            
            expect(performanceOptimizer.settings.effectQuality).toBe(0.7);
            expect(performanceConfig.getEffectQuality()).toBe(0.7);
        });

        test('音声品質の動的変更', () => {
            performanceOptimizer.setAudioQuality(0.6);
            
            expect(performanceOptimizer.settings.audioQuality).toBe(0.6);
            expect(performanceConfig.getAudioQuality()).toBe(0.6);
        });

        test('影エフェクトの動的変更', () => {
            performanceOptimizer.setShadowsEnabled(false);
            
            expect(performanceOptimizer.settings.enableShadows).toBe(false);
            expect(performanceConfig.areShadowsEnabled()).toBe(false);
        });

        test('ブラーエフェクトの動的変更', () => {
            performanceOptimizer.setBlurEnabled(false);
            
            expect(performanceOptimizer.settings.enableBlur).toBe(false);
            expect(performanceConfig.isBlurEnabled()).toBe(false);
        });

        test('アンチエイリアシングの動的変更', () => {
            performanceOptimizer.setAntiAliasingEnabled(false);
            
            expect(performanceOptimizer.settings.enableAntiAliasing).toBe(false);
            expect(performanceConfig.isAntiAliasingEnabled()).toBe(false);
        });
    });

    describe('パフォーマンスレベル変更テスト', () => {
        test('低品質レベルの適用', () => {
            performanceOptimizer.setPerformanceLevel('low');
            
            expect(performanceOptimizer.performanceLevel).toBe('low');
            expect(performanceConfig.getPerformanceLevel()).toBe('low');
            
            // 低品質設定が適用されることを確認
            expect(performanceOptimizer.settings.renderQuality).toBe(0.7);
            expect(performanceOptimizer.settings.particleQuality).toBe(0.3);
            expect(performanceOptimizer.settings.effectQuality).toBe(0.2);
            expect(performanceOptimizer.settings.enableShadows).toBe(false);
            expect(performanceOptimizer.settings.enableAntiAliasing).toBe(false);
        });

        test('中品質レベルの適用', () => {
            performanceOptimizer.setPerformanceLevel('medium');
            
            expect(performanceOptimizer.performanceLevel).toBe('medium');
            expect(performanceConfig.getPerformanceLevel()).toBe('medium');
            
            // 中品質設定が適用されることを確認
            expect(performanceOptimizer.settings.renderQuality).toBe(0.85);
            expect(performanceOptimizer.settings.particleQuality).toBe(0.6);
            expect(performanceOptimizer.settings.effectQuality).toBe(0.6);
            expect(performanceOptimizer.settings.enableShadows).toBe(false);
            expect(performanceOptimizer.settings.enableBlur).toBe(true);
        });

        test('高品質レベルの適用', () => {
            // まず低品質に設定
            performanceOptimizer.setPerformanceLevel('low');
            
            // 高品質に戻す
            performanceOptimizer.setPerformanceLevel('high');
            
            expect(performanceOptimizer.performanceLevel).toBe('high');
            expect(performanceConfig.getPerformanceLevel()).toBe('high');
            
            // 高品質設定が適用されることを確認
            expect(performanceOptimizer.settings.renderQuality).toBe(1.0);
            expect(performanceOptimizer.settings.particleQuality).toBe(1.0);
            expect(performanceOptimizer.settings.effectQuality).toBe(1.0);
            expect(performanceOptimizer.settings.enableShadows).toBe(true);
            expect(performanceOptimizer.settings.enableBlur).toBe(true);
            expect(performanceOptimizer.settings.enableAntiAliasing).toBe(true);
        });

        test('無効なパフォーマンスレベルの処理', () => {
            const originalLevel = performanceOptimizer.performanceLevel;
            
            performanceOptimizer.setPerformanceLevel('invalid');
            
            // レベルが変更されないことを確認
            expect(performanceOptimizer.performanceLevel).toBe(originalLevel);
        });
    });

    describe('設定監視テスト', () => {
        test('外部からの設定変更が反映される', () => {
            // 外部から設定を変更
            performanceConfig.setTargetFPS(90);
            
            // PerformanceOptimizerに反映されることを確認
            expect(performanceOptimizer.targetFPS).toBe(90);
        });

        test('複数の設定変更が正しく反映される', () => {
            // 複数の設定を同時に変更
            performanceConfig.setMaxBubbles(25);
            performanceConfig.setMaxParticles(750);
            performanceConfig.setRenderQuality(0.9);
            
            // すべての変更が反映されることを確認
            expect(performanceOptimizer.settings.maxBubbles).toBe(25);
            expect(performanceOptimizer.settings.maxParticles).toBe(750);
            expect(performanceOptimizer.settings.renderQuality).toBe(0.9);
        });

        test('品質プリセットの適用が反映される', () => {
            // 外部から品質プリセットを適用
            performanceConfig.applyQualityPreset('medium');
            
            // PerformanceOptimizerに反映されることを確認
            expect(performanceOptimizer.performanceLevel).toBe('medium');
            expect(performanceOptimizer.settings.renderQuality).toBe(0.85);
            expect(performanceOptimizer.settings.particleQuality).toBe(0.6);
        });
    });

    describe('設定同期テスト', () => {
        test('syncWithConfigで設定を再読み込み', () => {
            // 設定を変更
            performanceConfig.setTargetFPS(144);
            performanceConfig.setMaxBubbles(40);
            
            // 手動で同期
            performanceOptimizer.syncWithConfig();
            
            // 設定が同期されることを確認
            expect(performanceOptimizer.targetFPS).toBe(144);
            expect(performanceOptimizer.settings.maxBubbles).toBe(40);
        });

        test('getCurrentConfigで現在の設定を取得', () => {
            // 設定を確実にリセット
            performanceOptimizer.syncWithConfig();
            
            const config = performanceOptimizer.getCurrentConfig();
            
            expect(config.toBeDefined());
            expect(config.optimization).toBeDefined();
            expect(config.quality).toBeDefined();
            expect(config.limits).toBeDefined();
            
            expect(config.optimization.targetFPS).toBe(60);
            expect(config.quality.renderQuality).toBe(1.0);
        });
    });

    describe('グローバルインスタンステスト', () => {
        test('getPerformanceOptimizerでシングルトンインスタンスを取得', () => {
            const instance1 = getPerformanceOptimizer();
            const instance2 = getPerformanceOptimizer();
            
            expect(instance1.toBe(instance2));
            expect(instance1.toBeInstanceOf(PerformanceOptimizer));
        });

        test('reinitializePerformanceOptimizerで再初期化', () => {
            const originalInstance = getPerformanceOptimizer();
            
            // 設定を変更
            performanceConfig.setTargetFPS(75);
            
            // 再初期化
            reinitializePerformanceOptimizer();
            
            const newInstance = getPerformanceOptimizer();
            
            // 同じインスタンスだが設定が更新されている
            expect(newInstance.toBe(originalInstance));
            expect(newInstance.targetFPS).toBe(75);
        });
    });

    describe('エラーハンドリングテスト', () => {
        test('設定エラー時のフォールバック動作', () => {
            const originalTargetFPS = performanceOptimizer.targetFPS;
            
            // 無効な設定値を設定（範囲外の値）
            performanceOptimizer.setTargetFPS(999);
            
            // 無効な値は設定されない（検証により拒否される）
            expect(performanceOptimizer.targetFPS).toBe(originalTargetFPS);
        });

        test('設定取得エラー時のフォールバック', () => {
            // 設定取得でエラーを発生させる
            const originalMethod = performanceConfig.getOptimizationConfig;
            performanceConfig.getOptimizationConfig = () => {
                throw new Error('設定取得エラー');
            };
            
            const config = performanceOptimizer.getCurrentConfig();
            
            // エラーが発生した場合はnullを返す
            expect(config.toBeNull());
            
            // 元のメソッドを復元
            performanceConfig.getOptimizationConfig = originalMethod;
        });
    });

    describe('パフォーマンス最適化機能テスト', () => {
        test('適応的最適化が設定システムと連携', () => {
            // 適応モードを有効にして低FPSをシミュレート
            performanceOptimizer.setAdaptiveMode(true);
            
            // 低FPSの履歴を作成
            for (let i = 0; i < 30; i++) {
                performanceOptimizer.frameTimeHistory.push(25); // 40 FPS相当
            }
            performanceOptimizer.stats.averageFPS = 40;
            
            // 適応的最適化を実行
            performanceOptimizer.performAdaptiveOptimization();
            
            // パフォーマンスレベルが下がることを確認
            expect(performanceOptimizer.performanceLevel).toBe('medium');
            expect(performanceConfig.getPerformanceLevel()).toBe('medium');
        });

        test('Canvas リサイズ時の自動調整', () => {
            const canvasInfo = {
                actualWidth: 1920,
                actualHeight: 1080
            };
            
            // 高解像度でのリサイズをシミュレート
            performanceOptimizer.onCanvasResize(canvasInfo);
            
            // 高解像度時はパフォーマンスが調整される可能性がある
            // (具体的な動作は実装に依存)
            expect(performanceOptimizer.performanceLevel).toBeDefined();
        });

        test('リセット機能が設定システムと連携', () => {
            // 設定を変更
            performanceOptimizer.setPerformanceLevel('low');
            performanceOptimizer.stats.droppedFrames = 10;
            
            // リセット実行
            performanceOptimizer.reset();
            
            // 高品質に戻り、統計がリセットされることを確認
            expect(performanceOptimizer.performanceLevel).toBe('high');
            expect(performanceConfig.getPerformanceLevel()).toBe('high');
            expect(performanceOptimizer.stats.droppedFrames).toBe(0);
        });
    });

    describe('後方互換性テスト', () => {
        test('従来のAPIが引き続き動作する', () => {
            // 設定を確実にリセット
            performanceOptimizer.syncWithConfig();
            
            // 従来のメソッドが正常に動作することを確認
            expect(performanceOptimizer.getMaxBubbles()).toBe(20);
            expect(performanceOptimizer.getMaxParticles()).toBe(500);
            expect(performanceOptimizer.getRenderQuality()).toBe(1.0);
            expect(performanceOptimizer.getParticleQuality()).toBe(1.0);
            expect(performanceOptimizer.getEffectQuality()).toBe(1.0);
            expect(performanceOptimizer.getAudioQuality()).toBe(1.0);
            expect(performanceOptimizer.areShadowsEnabled()).toBe(true);
            expect(performanceOptimizer.isBlurEnabled()).toBe(true);
            expect(performanceOptimizer.isAntiAliasingEnabled()).toBe(true);
        });

        test('従来の設定変更メソッドが新システムと連携', () => {
            // パフォーマンスレベル変更
            performanceOptimizer.setPerformanceLevel('low');
            
            // 従来のgetterで値を確認
            expect(performanceOptimizer.getMaxBubbles()).toBe(10);
            expect(performanceOptimizer.getMaxParticles()).toBe(100);
            expect(performanceOptimizer.getRenderQuality()).toBe(0.7);
            expect(performanceOptimizer.areShadowsEnabled()).toBe(false);
        });
    });
});