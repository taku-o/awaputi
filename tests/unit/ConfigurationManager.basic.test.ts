/**
 * ConfigurationManager 基本テスト
 * TypeScript移行 - Task 24対応
 */

import { ConfigurationManager, getConfigurationManager } from '../../src/core/ConfigurationManager.js';

describe('ConfigurationManager', () => {
    describe('基本機能', () => {
        test('ConfigurationManagerクラスが正しく初期化される', () => {
            const configManager = new ConfigurationManager();
            
            // 基本カテゴリの存在確認
            expect(configManager.configurations.has('game')).toBe(true);
            expect(configManager.configurations.has('audio')).toBe(true);
            expect(configManager.configurations.has('effects')).toBe(true);
            expect(configManager.configurations.has('performance')).toBe(true);
        });
        
        test('設定値の設定と取得が正しく動作する', () => {
            const configManager = new ConfigurationManager();
            
            // 設定値の設定
            const result = configManager.set('game', 'testKey', 'testValue');
            expect(result).toBe(true);
            
            // 設定値の取得
            const value = configManager.get('game', 'testKey');
            expect(value).toBe('testValue');
        });
        
        test('存在しない設定値はデフォルト値を返す', () => {
            const configManager = new ConfigurationManager();
            
            const value = (configManager as any).get('game', 'nonExistentKey', 'defaultValue');
            expect(value).toBe('defaultValue');
        });
        
        test('検証機能が正しく動作する', () => {
            const configManager = new ConfigurationManager();
            
            // 検証ルールなしの場合
            expect((configManager as any).validate('game', 'testKey', 'anyValue')).toBe(true);
            
            // 型チェック
            (configManager as any).setValidationRule('game', 'stringKey', { type: 'string' });
            expect((configManager as any).validate('game', 'stringKey', 'validString')).toBe(true);
            expect((configManager as any).validate('game', 'stringKey', 123)).toBe(false);
        });
    });
    
    describe('シングルトン機能', () => {
        test('同じインスタンスを返す', () => {
            const instance1 = getConfigurationManager();
            const instance2 = getConfigurationManager();
            
            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(ConfigurationManager);
        });
    });
});