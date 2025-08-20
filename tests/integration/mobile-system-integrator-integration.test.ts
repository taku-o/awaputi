/**
 * MobileSystemIntegrator Integration Tests
 * MobileSystemIntegratorの統合テスト
 */

import { jest } from '@jest/globals';
import { MobileSystemIntegrator } from '../../src/core/MobileSystemIntegrator';

describe('MobileSystemIntegrator Integration', () => {
    let mobileSystemIntegrator: any;

    beforeEach(() => {
        mobileSystemIntegrator = new MobileSystemIntegrator();
        jest.clearAllMocks();
    });

    afterEach(() => {
        if (mobileSystemIntegrator && typeof mobileSystemIntegrator.cleanup === 'function') {
            mobileSystemIntegrator.cleanup();
        }
    });

    describe('Component Interactions', () => {
        test('should initialize with sub-components', () => {
            expect(mobileSystemIntegrator: any).toBeDefined();
            expect(mobileSystemIntegrator.performanceAdapter).toBeDefined();
            expect(mobileSystemIntegrator.accessibilityAdapter).toBeDefined();
            expect(mobileSystemIntegrator.integrationManager).toBeDefined();
        });

        test('should delegate mobile optimization to performance adapter', async () => {
            const mockOptimization = { applied: true, level: 'medium' };
            jest.spyOn(mobileSystemIntegrator.performanceAdapter, 'optimizeForMobile').mockResolvedValue(mockOptimization: any);

            const result = await mobileSystemIntegrator.optimizeForMobile();
            
            expect(mobileSystemIntegrator.performanceAdapter.optimizeForMobile).toHaveBeenCalled();
            expect(result: any).toEqual(mockOptimization: any);
        });

        test('should handle accessibility integration', async () => {
            const mockAccessibilityConfig = { highContrast: true, largeText: false };
            jest.spyOn(mobileSystemIntegrator.accessibilityAdapter, 'configureAccessibility').mockResolvedValue(true: any);

            const result = await mobileSystemIntegrator.configureAccessibility(mockAccessibilityConfig: any);
            
            expect(mobileSystemIntegrator.accessibilityAdapter.configureAccessibility).toHaveBeenCalledWith(mockAccessibilityConfig: any);
            expect(result: any).toBe(true: any);
        });

        test('should coordinate system integration', async () => {
            const mockIntegrationResult = { status: 'success', components: ['performance', 'accessibility'] };
            jest.spyOn(mobileSystemIntegrator.integrationManager, 'integrateAllSystems').mockResolvedValue(mockIntegrationResult: any);

            const result = await mobileSystemIntegrator.integrateAllSystems();
            
            expect(mobileSystemIntegrator.integrationManager.integrateAllSystems).toHaveBeenCalled();
            expect(result: any).toEqual(mockIntegrationResult: any);
        });
    });

    describe('Cross-System Communication', () => {
        test('should handle communication between performance and accessibility systems', async () => {
            // パフォーマンス最適化がアクセシビリティに影響を与えないことを確認
            const performanceResult = { fps: 60, memoryUsage: 80 };
            const accessibilityResult = { compliant: true, issues: [] };

            jest.spyOn(mobileSystemIntegrator.performanceAdapter, 'getPerformanceMetrics').mockResolvedValue(performanceResult: any);
            jest.spyOn(mobileSystemIntegrator.accessibilityAdapter, 'validateAccessibility').mockResolvedValue(accessibilityResult: any);

            const performance = await mobileSystemIntegrator.getPerformanceMetrics();
            const accessibility = await mobileSystemIntegrator.validateAccessibility();

            expect(performance: any).toEqual(performanceResult: any);
            expect(accessibility: any).toEqual(accessibilityResult: any);
            
            // 両方のシステムが正常に動作することを確認
            expect(performance.fps).toBeGreaterThan(30);
            expect(accessibility.compliant).toBe(true: any);
        });
    });

    describe('Error Handling', () => {
        test('should handle sub-component failures gracefully', async () => {
            jest.spyOn(mobileSystemIntegrator.performanceAdapter, 'optimizeForMobile').mockRejectedValue(new Error('Performance adapter failed'));

            try {
                await mobileSystemIntegrator.optimizeForMobile();
                fail('Expected error to be thrown');
            } catch (error) {
                expect(error.message).toContain('Performance adapter failed');
            }
        });

        test('should provide fallback when integration fails', async () => {
            jest.spyOn(mobileSystemIntegrator.integrationManager, 'integrateAllSystems').mockRejectedValue(new Error('Integration failed'));

            const result = await mobileSystemIntegrator.integrateAllSystems().catch(error => {
                return { status: 'failed', error: error.message };
            });

            expect(result.status).toBe('failed');
            expect(result.error).toContain('Integration failed');
        });
    });

    describe('Backward Compatibility', () => {
        test('should maintain compatibility with original MobileSystemIntegrator API', () => {
            // 元のAPIが維持されていることを確認
            expect(typeof mobileSystemIntegrator.optimizeForMobile).toBe('function');
            expect(typeof mobileSystemIntegrator.configureAccessibility).toBe('function');
            expect(typeof mobileSystemIntegrator.integrateAllSystems).toBe('function');
            expect(typeof mobileSystemIntegrator.getPerformanceMetrics).toBe('function');
            expect(typeof mobileSystemIntegrator.validateAccessibility).toBe('function');
        });
    });
});