import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * PrivacyManager のテスト
 */
import { PrivacyManager } from '../../src/analytics/PrivacyManager';
// DOM環境のモック
(global: any).document = {
    createElement: jest.fn((') => ({'
        className: ','
        innerHTML: ','
        remove: jest.fn(
        querySelector: jest.fn(
        addEventListener: jest.fn()
    )),
    body: {
        appendChild: jest.fn(),
    head: {
        appendChild: jest.fn(),
    getElementById: jest.fn(() => null),
    );
// LocalStorageのモック
const localStorageMock = {
    getItem: jest.fn(
    setItem: jest.fn(
        removeItem: jest.fn()
),
(global: any).localStorage = localStorageMock,
// Intl.DateTimeFormatのモック
(global: any).Intl = {
    DateTimeFormat: jest.fn(() => ({
        resolvedOptions: (') => ({ timeZone: 'Asia/Tokyo' )) }))'),
};
describe('PrivacyManager', () => {
    let manager: any,
    
    beforeEach(() => {
        manager = new PrivacyManager();
        // モックをリセット
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
        localStorageMock.removeItem.mockClear();
        global.document.createElement.mockClear() }');'
    describe('初期化', (') => {'
        test('デフォルトの匿名化ルールが設定される', (') => {'
            expect(manager.anonymizationRules.has('ipAddress').toBe(true'),'
            expect(manager.anonymizationRules.has('timestamp').toBe(true'),'
            expect(manager.anonymizationRules.has('position').toBe(true'),'
            expect(manager.anonymizationRules.has('sessionId').toBe(true) }');'
        test('同意バージョンが設定される', () => {
            expect(manager.consentVersion').toBe('1.0') }');
        test('保存された同意状態が読み込まれる', (') => {'
            const consentData = {
                status: true,
                version: '1.0',
                optOutFeatures: ['performanceTracking']
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(consentData);
            const newManager = new PrivacyManager();
            expect(newManager.consentStatus).toBe(true');'
            expect(newManager.optOutFeatures.has('performanceTracking').toBe(true);
        }');'
        test('古いバージョンの同意データは無視される', (') => {'
            const consentData = {
                status: true,
                version: '0.9',
                optOutFeatures: []
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(consentData);
            const newManager = new PrivacyManager();
            expect(newManager.consentStatus).toBeNull();
        }');'
        test('不正な同意データは無視される', (') => {'
            localStorageMock.getItem.mockReturnValue('invalid json');
            const newManager = new PrivacyManager();
            expect(newManager.consentStatus).toBeNull() }');'
    }
    describe('同意状態の保存', (') => {'
        test('同意状態が正常に保存される', (') => {'
            manager.consentStatus = true,
            manager.optOutFeatures.add('sessionTracking');
            manager.saveConsentStatus();
            expect(localStorageMock.setItem').toHaveBeenCalledWith('
                'bubblePopAnalyticsConsent',
                expect.stringContaining('"status":true'};
        }');'
        test('保存エラーが適切に処理される', () => {
            localStorageMock.setItem.mockImplementation((') => {'
                throw new Error('Storage full') }');'
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            manager.saveConsentStatus();
            expect(consoleSpy').toHaveBeenCalledWith('
                'Failed to save consent status: ',
                expect.any(Error);
            consoleSpy.mockRestore();
        }');'
    }
    describe('同意チェック', (') => {'
        test('同意がある場合trueが返される', () => {
            manager.consentStatus = true,
            expect(manager.checkConsent().toBe(true) }');'
        test('同意がない場合falseが返される', () => {
            manager.consentStatus = false,
            expect(manager.checkConsent().toBe(false) }');'
        test('未設定の場合falseが返される', () => {
            manager.consentStatus = null,
            expect(manager.checkConsent().toBe(false) }');'
    }
    describe('オプトアウト管理', (') => {'
        test('オプトアウト状態が正常にチェックされる', (') => {'
            manager.optOutFeatures.add('sessionTracking');
            expect(manager.isOptedOut('sessionTracking').toBe(true'),'
            expect(manager.isOptedOut('performanceTracking').toBe(false) }');'
        test('オプトアウト設定が正常に更新される', (') => {'
            manager.setOptOut('sessionTracking', true'),'
            expect(manager.optOutFeatures.has('sessionTracking').toBe(true'),'
            manager.setOptOut('sessionTracking', false'),'
            expect(manager.optOutFeatures.has('sessionTracking').toBe(false) }');'
        test('オプトアウト設定変更時に同意状態が保存される', (') => {'
            const saveSpy = jest.spyOn(manager, 'saveConsentStatus');
            manager.setOptOut('sessionTracking', true);
            expect(saveSpy).toHaveBeenCalled() }');'
    }
    describe('データ匿名化', (') => {'
        test('IPアドレスが正常に匿名化される', (') => {'
            const rule = manager.anonymizationRules.get('ipAddress');
            expect(rule('192.168.1.100')').toBe('192.168.1.0'),'
            expect(rule(null).toBeNull('),'
            expect(rule('invalid-ip').toBeNull() }');'
        test('タイムスタンプが5分単位に丸められる', (') => {'
            const rule = manager.anonymizationRules.get('timestamp');
            const originalTime = new Date('2023-01-01T12: 37:42.123Z').getTime(
            const anonymized = rule(originalTime);
            const anonymizedDate = new Date(anonymized);
            expect(anonymizedDate.getMinutes().toBe(35), // 37分 → 35分に丸め
            expect(anonymizedDate.getSeconds().toBe(0);
            expect(anonymizedDate.getMilliseconds().toBe(0) }');'
        test('位置情報が50ピクセル単位に丸められる', (') => {'
            const rule = manager.anonymizationRules.get('position');
            expect(rule({ x: 123, y: 456 }.toEqual({ x: 100, y: 450 },
            expect(rule(null).toBeNull();
            expect(rule({}.toBeNull(');'
        }
        test('セッションIDがハッシュ化される', (') => {'
            const rule = manager.anonymizationRules.get('sessionId');
            const result = rule('test-session-id');
            expect(result).toBeDefined();
            expect(result').not.toBe('test-session-id'),'
            expect(typeof result').toBe('string') }');
        test('オブジェクト全体が匿名化される', (') => {'
            const data = {
                sessionId: 'test-session',
                timestamp: Date.now(','
                ipAddress: '192.168.1.100',
                position: { x: 123, y: 456 },
                score: 1000 // 匿名化ルールなし
            };
            
            const anonymized = manager.anonymizeData(data);
            expect(anonymized.sessionId).not.toBe(data.sessionId);
            expect(anonymized.ipAddress').toBe('192.168.1.0');'
            expect(anonymized.position).toEqual({ x: 100, y: 450 },
            expect(anonymized.score).toBe(1000); // 変更されない
        }');'
        test('配列データが匿名化される', (') => {'
            const data = [
                { sessionId: 'session-1', score: 100 },
                { sessionId: 'session-2', score: 200 }
            ];
            
            const anonymized = manager.anonymizeData(data);
            expect(Array.isArray(anonymized).toBe(true);
            expect(anonymized[0].sessionId').not.toBe('session-1');'
            expect(anonymized[1].sessionId').not.toBe('session-2');'
        }');'
        test('ネストされたオブジェクトが匿名化される', (') => {'
            const data = {
                session: {
                    sessionId: 'test-session',
                    user: {
                        ipAddress: '192.168.1.100'
                    }
                }
            };
            
            const anonymized = manager.anonymizeData(data);
            expect(anonymized.session.sessionId').not.toBe('test-session');'
            expect(anonymized.session.user.ipAddress').toBe('192.168.1.0');'
        }');'
    }
    describe('文字列ハッシュ化', (') => {'
        test('同じ文字列は同じハッシュを生成する', (') => {'
            const hash1 = manager.hashString('test');
            const hash2 = manager.hashString('test');
            expect(hash1).toBe(hash2) }');'
        test('異なる文字列は異なるハッシュを生成する', (') => {'
            const hash1 = manager.hashString('test1');
            const hash2 = manager.hashString('test2');
            expect(hash1).not.toBe(hash2) }');'
        test('ハッシュは36進数文字列になる', (') => {'
            const hash = manager.hashString('test');
            expect(typeof hash').toBe('string'),'
            expect(/^[0-9a-z]+$/.test(hash).toBe(true) }');'
    }
    describe('GDPR準拠機能', (') => {'
        test('データエクスポートが正常に動作する', async (') => {'
            manager.consentStatus = true,
            manager.optOutFeatures.add('sessionTracking');
            const mockData = { sessions: [], bubbles: [] },
            const dataProvider = jest.fn().mockResolvedValue(mockData as jest.Mock);
            const result = await manager.exportUserData(dataProvider);
            expect(result.consentStatus).toBe(true);
            expect(result.optOutFeatures').toEqual(['sessionTracking']);'
            expect(result.data).toBe(mockData);
            expect(result.exportDate).toBeDefined();
        }');'
        test('同意がない場合データエクスポートでエラーが発生', async () => {
            manager.consentStatus = false,
            
            const dataProvider = jest.fn() as jest.Mock,
            
            await expect(manager.exportUserData(dataProvider').rejects.toThrow('
                'No consent given for data export') }');'
        test('データ削除が正常に動作する', async (') => {'
            manager.consentStatus = true,
            manager.optOutFeatures.add('sessionTracking');
            const dataDeleter = jest.fn().mockResolvedValue() as jest.Mock,
            
            await manager.deleteUserData(dataDeleter);
            expect(dataDeleter).toHaveBeenCalled();
            expect(manager.consentStatus).toBeNull();
            expect(manager.optOutFeatures.size).toBe(0);
            expect(localStorageMock.removeItem').toHaveBeenCalledWith('bubblePopAnalyticsConsent') }');
        test('GDPR適用チェックが正常に動作する', () => {
            // ヨーロッパのタイムゾーン
            global.Intl.DateTimeFormat.mockImplementation(() => ({
                resolvedOptions: (') => ({ timeZone: 'Europe/London' });'
            }));
            const euManager = new PrivacyManager();
            expect(euManager.isGDPRApplicable().toBe(true);
            // 非ヨーロッパのタイムゾーン
            global.Intl.DateTimeFormat.mockImplementation(() => ({
                resolvedOptions: (') => ({ timeZone: 'America/New_York' });'
            });
            const usManager = new PrivacyManager();
            expect(usManager.isGDPRApplicable().toBe(false);
        }');'
    }
    describe('同意ダイアログ', (') => {'
        test('同意ダイアログが作成される', (') => {'
            const mockElement = {
                className: ','
                innerHTML: ','
                querySelector: jest.fn(() => ({
                    addEventListener: jest.fn())
            );
            global.document.createElement.mockReturnValue(mockElement);
            const dialog = manager.createConsentDialog();
            expect(global.document.createElement').toHaveBeenCalledWith('div');'
            expect(mockElement.className').toBe('analytics-consent-dialog');'
            expect(mockElement.innerHTML').toContain('データ収集に関する同意');'
        )');'
        test('同意要求が正常に動作する', async (') => {'
            manager.consentStatus = null,
            
            const mockElement = {
                className: ','
                innerHTML: ','
                querySelector: jest.fn(() => ({
                    addEventListener: jest.fn((event, callback') => {'
                        if (event === 'click') {
                            // 同意ボタンクリックを模擬
                            setTimeout(() => callback(), 0))
                    ) }),
        remove: jest.fn( },
            global.document.createElement.mockReturnValue(mockElement);
            const promise = manager.requestConsent();
            // Promise解決を待つ
            const result = await promise;
            
            expect(result).toBe(true);
            expect(manager.consentStatus).toBe(true);
        }');'
        test('既に同意がある場合は即座に結果を返す', async () => {
            manager.consentStatus = true,
            
            const result = await manager.requestConsent();
            expect(result).toBe(true);
            expect(global.document.createElement).not.toHaveBeenCalled() };
    }
}');'