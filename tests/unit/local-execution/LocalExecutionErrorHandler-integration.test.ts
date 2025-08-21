/**
 * LocalExecutionErrorHandler Integration Tests
 * 既存ErrorHandlerシステムとの統合テスト
 * 
 * @author Claude Code
 * @version 1.0.0
 */
import { jest  } from '@jest/globals';
import LocalExecutionErrorHandler from '../../../src/utils/local-execution/LocalExecutionErrorHandler.js';
import { ErrorHandler  } from '../../../src/utils/ErrorHandler.js';
// Type definitions
interface MockWindow {
    location: { protoco,l: string,;
    addEventListener: jest.Mock<void, [string, EventListener]>;
    removeEventListener: jest.Mock<void, [string, EventListener]>;
    performance: { now: (') => number };'
}
interface MockDocument {
    addEventListener: jest.Mock<void, [string, EventListener]>;
    createElement: jest.Mock<any, [string]>;
    querySelector: jest.Mock<any, [string]>;
    body: {
        appendChil,d: jest.Mock<void, [any]> };
}
interface MockSessionStorage {
    getItem: jest.Mock<string | null, [string]>;
    setItem: jest.Mock<void, [string, string]>;
    removeItem: jest.Mock<void, [string]> }
interface MockErrorHandler {
    handleError: jest.Mock<void, [Error, string, any? ]>, : undefined
    configure: jest.Mock<void, [any]>;
    getErrorStats: jest.Mock<ErrorStats, []> }
interface ErrorStats {
    total: number,
    byType: Map<string, number>;
    byContext: Map<string, number> }
interface ErrorCategory {
    name: string,
    severity: string;
    recoverable: boolean;
interface ErrorAnalysis {
    category: string,
    severity: string;
    recoverable: boolean;
interface DebugInfo {
    isInitialized: boolean,
    config: any;
    errorCategories: Record<string, ErrorCategory>;
    handledGuidanceTypes: string[];
// モック設定
const mockWindow: MockWindow = {
    location: { protocol: 'file:' };
    addEventListener: jest.fn(
    removeEventListener: jest.fn(
    performance: { now: () => Date.now() }
};
const mockDocument: MockDocument = {
    addEventListener: jest.fn(
    createElement: jest.fn((') => ({'
        type: ','
        remove: jest.fn()
    )),
    querySelector: jest.fn(
    body: {
        appendChild: jest.fn(),
);
const mockSessionStorage: MockSessionStorage = {
    getItem: jest.fn(
    setItem: jest.fn(
        removeItem: jest.fn( };
// グローバルモック
(global: any).window = mockWindow,
(global: any).document = mockDocument,
(global: any).sessionStorage = mockSessionStorage,
(global as any').navigator = { userAgent: 'Test Browser' };'
describe('LocalExecutionErrorHandler Integration Tests', () => {
    let mockErrorHandler: MockErrorHandler,
    beforeEach(() => {
        jest.clearAllMocks(),
        // ErrorHandlerのモック
        mockErrorHandler = {
            handleError: jest.fn(
            configure: jest.fn(
            getErrorStats: jest.fn(() => ({
                total: 0,
                byType: new Map(
        byContext: new Map(
    )
            ))
        ),
        // LocalExecutionErrorHandlerをリセット
        LocalExecutionErrorHandler.isInitialized = false,
        LocalExecutionErrorHandler.errorHandlerInstance = null,
        LocalExecutionErrorHandler.config = null });
    afterEach(() => {
        // クリーンアップ
        if (LocalExecutionErrorHandler.isInitialized) {
            LocalExecutionErrorHandler.isInitialized = false }
    }');'
    describe('Initialization Integration', (') => {'
        test('should initialize with main ErrorHandler integration', async () => {
            const config = {
                enableMainErrorHandlerIntegration: true,
                enableDebugLogging: true,;
            LocalExecutionErrorHandler.initialize(config, mockErrorHandler);
            expect(LocalExecutionErrorHandler.isInitialized).toBe(true);
            expect(LocalExecutionErrorHandler.errorHandlerInstance).toBe(mockErrorHandler);
            expect(mockErrorHandler.configure).toHaveBeenCalled();
        }');'
        test('should initialize without main ErrorHandler integration when disabled', async () => {
            const config = {
                enableMainErrorHandlerIntegration: false,;
            LocalExecutionErrorHandler.initialize(config);
            expect(LocalExecutionErrorHandler.isInitialized).toBe(true);
            expect(LocalExecutionErrorHandler.errorHandlerInstance).toBeNull();
        }');'
        test('should fallback gracefully when main ErrorHandler fails', async () => {
            const failingErrorHandler = {
                configure: jest.fn((') => { throw new Error('Configuration failed'))) }') as unknown as MockErrorHandler;
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            LocalExecutionErrorHandler.initialize({
                enableMainErrorHandlerIntegration: true,, failingErrorHandler);
            expect(LocalExecutionErrorHandler.isInitialized).toBe(true);
            expect(consoleSpy).toHaveBeenCalledWith(');'
                expect.stringContaining('Failed to integrate with main ErrorHandler');
            consoleSpy.mockRestore();
        }');'
    }
    describe('Error Reporting Integration', () => {
        beforeEach(() => {
            LocalExecutionErrorHandler.initialize({
                enableMainErrorHandlerIntegration: true,
                enableDebugLogging: false,, mockErrorHandler);
        }');'
        test('should report CORS errors to main ErrorHandler', (') => {'
            const error = new Error('CORS policy blocked'),
            const resource = 'test-resource.js',
            LocalExecutionErrorHandler.handleResourceError(error, resource),
            expect(mockErrorHandler.handleError').toHaveBeenCalledWith('
                error,
                'LOCAL_EXECUTION_RESOURCE',
                expect.objectContaining({
                    resource,
                    category: 'cors',
                    localExecution: true,);
            );
        }');'
        test('should report compatibility errors to main ErrorHandler', (') => {'
            const error = new Error('Canvas not supported'),
            const feature = 'canvas',
            LocalExecutionErrorHandler.handleCompatibilityError(error, feature),
            expect(mockErrorHandler.handleError').toHaveBeenCalledWith('
                error,
                'LOCAL_EXECUTION_COMPATIBILITY',
                expect.objectContaining({
                    feature,
                    localExecution: true,);
            );
        }');'
        test('should report security errors to main ErrorHandler', (') => {'
            const error = new Error('X-Frame-Options blocked'),
            const policy = 'X-Frame-Options',
            LocalExecutionErrorHandler.handleSecurityError(error, policy),
            expect(mockErrorHandler.handleError').toHaveBeenCalledWith('
                error,
                'LOCAL_EXECUTION_SECURITY',
                expect.objectContaining({
                    policy,
                    localExecution: true,);
            );
        }');'
    }
    describe('Configuration Integration', (') => {'
        test('should register local execution error categories', () => {
            LocalExecutionErrorHandler.initialize({
                enableMainErrorHandlerIntegration: true,, mockErrorHandler);
            expect(mockErrorHandler.configure').toHaveBeenCalledWith('
                expect.objectContaining({
                    localExecution: expect.objectContaining({
                        errorCategories: expect.objectContaining({
                            LOCAL_EXECUTION_CORS: expect.objectContaining({
                                name: 'Local Execution CORS Error',
                                severity: 'HIGH',
                                recoverable: true,);
    }
    });
    }
            );
        }');'
        test('should register local execution user messages', () => {
            LocalExecutionErrorHandler.initialize({
                enableMainErrorHandlerIntegration: true,, mockErrorHandler);
            const configCalls = mockErrorHandler.configure.mock.calls;
            expect(configCalls.length).toBeGreaterThan(0);
            const messageConfigCall = configCalls.find(call => 
                call[0] && call[0].messages && call[0].messages.userMessages);
            expect(messageConfigCall).toBeDefined();
        }');'
    }
    describe('Fallback Behavior', (') => {'
        test('should work without main ErrorHandler when integration is disabled', () => {
            LocalExecutionErrorHandler.initialize({
                enableMainErrorHandlerIntegration: false,');'
            const error = new Error('Test error');
            // エラーが発生しないことを確認
            expect((') => {'
                LocalExecutionErrorHandler.handleResourceError(error, 'test.js') }).not.toThrow(');'
        }
        test('should handle main ErrorHandler reporting failures gracefully', () => {
            mockErrorHandler.handleError = jest.fn((') => {'
                throw new Error('Reporting failed')),
            LocalExecutionErrorHandler.initialize({
                enableMainErrorHandlerIntegration: true,
                enableDebugLogging: false,), mockErrorHandler');'
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {),
            expect(() => {
                LocalExecutionErrorHandler.handleResourceError('),'
                    new Error('Test error'), 
                    'test.js'
                ) }).not.toThrow();
            consoleSpy.mockRestore();
        }');'
        test('should use static ErrorHandler methods when instance is not available', () => {
            // ErrorHandlerクラスのモック
            const originalErrorHandler = LocalExecutionErrorHandler.errorHandlerInstance,
            LocalExecutionErrorHandler.errorHandlerInstance = null,
            // ErrorHandlerの静的メソッドをモック
            const staticHandleError = jest.fn(),
            (LocalExecutionErrorHandler.constructor as any).ErrorHandler = {
                handleError: staticHandleError,;
            LocalExecutionErrorHandler.initialize({
                enableMainErrorHandlerIntegration: true,');'
            const error = new Error('Test error');
            LocalExecutionErrorHandler.handleResourceError(error, 'test.js');
            // クリーンアップ
            LocalExecutionErrorHandler.errorHandlerInstance = originalErrorHandler;
        }');'
    }
    describe('Debug Information Integration', (') => {'
        test('should provide comprehensive debug information', () => {
            LocalExecutionErrorHandler.initialize({
                enableMainErrorHandlerIntegration: true,
                enableDebugLogging: true,, mockErrorHandler);
            const debugInfo = LocalExecutionErrorHandler.getDebugInfo();
            expect(debugInfo).toMatchObject({
                isInitialized: true,
                config: expect.objectContaining({
                    enableMainErrorHandlerIntegration: true,
                errorCategories: LocalExecutionErrorHandler.ERROR_CATEGORIES,
        handledGuidanceTypes: expect.any(Array) }
        }');'
    }
    describe('User-Friendly Message Generation', () => {
        beforeEach(() => {
            LocalExecutionErrorHandler.initialize({
                enableMainErrorHandlerIntegration: true,
                enableUserNotifications: true,, mockErrorHandler);
        }');'
        test('should generate appropriate CORS error messages', (') => {'
            const message = LocalExecutionErrorHandler._generateCompatibilityMessage('modules'),
            expect(message').toContain('ES6 modules are not supported') }');
        test('should generate appropriate security policy messages', (') => {'
            const message = LocalExecutionErrorHandler._generateSecurityMessage('X-Frame-Options'),
            expect(message').toContain('X-Frame-Options policy') }');
    }
    describe('Error Analysis Integration', (') => {'
        test('should analyze and categorize errors correctly', () => {
            const corsError = LocalExecutionErrorHandler._analyzeError('),'
                new Error('CORS policy blocked this request'),
            expect(corsError').toMatchObject({'
                category: 'cors',
                severity: 'high',
                recoverable: false,');'
        }
        test('should handle unknown error types gracefully', () => {
            const unknownError = LocalExecutionErrorHandler._analyzeError('),'
                new Error('Some random error'),
            expect(unknownError').toMatchObject({'
                category: 'unknown',
                severity: 'medium',
                recoverable: true,);
        }
    }');'
    describe('Performance and Memory Management', (') => {'
        test('should not cause memory leaks in integration', () => {
            const initialErrorHandlerInstance = LocalExecutionErrorHandler.errorHandlerInstance,
            
            // 複数回の初期化
            for (let i = 0, i < 10, i++) {
                LocalExecutionErrorHandler.initialize({
                    enableMainErrorHandlerIntegration: true,, mockErrorHandler);
            }
            
            // インスタンスが適切に管理されていることを確認
            expect(LocalExecutionErrorHandler.errorHandlerInstance).toBe(mockErrorHandler);
        }');'
        test('should handle rapid error reporting without issues', () => {
            LocalExecutionErrorHandler.initialize({
                enableMainErrorHandlerIntegration: true,, mockErrorHandler);
            // 大量のエラーレポート
            for (let i = 0; i < 100; i++) {
                LocalExecutionErrorHandler.handleResourceError(),
                    new Error(`Error ${i)`}),
                    `resource${i}.js`
                );
            }
            expect(mockErrorHandler.handleError).toHaveBeenCalledTimes(100);
        });
    }
}');'