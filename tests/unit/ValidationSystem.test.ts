/**
 * ValidationSystem 単体テスト
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ValidationSystem, getValidationSystem } from '../../src/core/ValidationSystem.js';

// 型定義
interface ValidationRule {
    type?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    enum?: string[];
    validator?: (value => boolean | string;
}

interface ValidationResult {
    isValid: boolean;
    value: any;
    message?: string;
}

interface ValidationError {
    category: string;
    key: string;
    value: any;
    message?: string;
    timestamp?: number;
}

interface RuleSet {
    [key: string]: ValidationRule;
}

interface DefaultValues {
    [key: string]: any;
}

describe('ValidationSystem', () => {
    let validationSystem: ValidationSystem;
    
    beforeEach(() => {
        validationSystem = new ValidationSystem();
    });
    
    describe('基本機能', () => {
        test('ValidationSystemクラスが正しく初期化される', () => {
            expect(validationSystem.rules).toBeInstanceOf(Map);
            expect(validationSystem.defaultValues).toBeInstanceOf(Map);
            expect(validationSystem.validationErrors).toEqual([]);
        });
        
        test('シングルトンインスタンスが正しく動作する', () => {
            const instance1 = getValidationSystem();
            const instance2 = getValidationSystem();
            
            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(ValidationSystem);
        });
    });
    
    describe('ルール設定', () => {
        test('単一のルールを設定できる', () => {
            validationSystem.setRule('game', 'score', { type: 'number', min: 0 });
            
            expect(validationSystem.rules.has('game.score')).toBe(true);
            expect(validationSystem.rules.get('game.score')).toEqual({ type: 'number', min: 0 });
        });
        
        test('複数のルールを一括設定できる', () => {
            const rules: RuleSet = {
                volume: { type: 'number', min: 0, max: 1 },
                muted: { type: 'boolean' }
            };
            
            validationSystem.setRules('audio', rules);
            
            expect(validationSystem.rules.has('audio.volume')).toBe(true);
            expect(validationSystem.rules.has('audio.muted')).toBe(true);
            expect(validationSystem.rules.get('audio.volume')).toEqual({ type: 'number', min: 0, max: 1 });
            expect(validationSystem.rules.get('audio.muted')).toEqual({ type: 'boolean' });
        });
    });
    
    describe('デフォルト値設定', () => {
        test('単一のデフォルト値を設定できる', () => {
            validationSystem.setDefaultValue('game', 'score', 100);
            
            expect(validationSystem.defaultValues.has('game.score')).toBe(true);
            expect(validationSystem.defaultValues.get('game.score')).toBe(100);
        });
        
        test('複数のデフォルト値を一括設定できる', () => {
            const defaults: DefaultValues = {
                volume: 0.5,
                muted: false
            };
            
            validationSystem.setDefaultValues('audio', defaults);
            
            expect(validationSystem.defaultValues.has('audio.volume')).toBe(true);
            expect(validationSystem.defaultValues.has('audio.muted')).toBe(true);
            expect(validationSystem.defaultValues.get('audio.volume')).toBe(0.5);
            expect(validationSystem.defaultValues.get('audio.muted')).toBe(false);
        });
    });
    
    describe('型チェック', () => {
        beforeEach(() => {
            validationSystem.setRule('game', 'score', { type: 'number' });
            validationSystem.setRule('game', 'name', { type: 'string' });
            validationSystem.setRule('game', 'active', { type: 'boolean' });
            validationSystem.setDefaultValue('game', 'score', 0);
            validationSystem.setDefaultValue('game', 'name', '');
            validationSystem.setDefaultValue('game', 'active', false);
        });
        
        test('正しい型の値は検証に成功する', () => {
            expect(validationSystem.validate('game', 'score', 100).isValid).toBe(true);
            expect(validationSystem.validate('game', 'name', 'Player').isValid).toBe(true);
            expect(validationSystem.validate('game', 'active', true).isValid).toBe(true);
        });
        
        test('不正な型の値は検証に失敗し、デフォルト値を返す', () => {
            const numberResult = validationSystem.validate('game', 'score', 'invalid');
            expect(numberResult.isValid).toBe(false);
            expect(numberResult.value).toBe(0);
            
            const stringResult = validationSystem.validate('game', 'name', 123);
            expect(stringResult.isValid).toBe(false);
            expect(stringResult.value).toBe('');
            
            const booleanResult = validationSystem.validate('game', 'active', 'true');
            expect(booleanResult.isValid).toBe(false);
            expect(booleanResult.value).toBe(false);
        });
    });
    
    describe('範囲チェック', () => {
        beforeEach(() => {
            validationSystem.setRule('game', 'score', { type: 'number', min: 0, max: 1000 });
            validationSystem.setDefaultValue('game', 'score', 500);
        });
        
        test('範囲内の値は検証に成功する', () => {
            expect(validationSystem.validate('game', 'score', 0).isValid).toBe(true);
            expect(validationSystem.validate('game', 'score', 500).isValid).toBe(true);
            expect(validationSystem.validate('game', 'score', 1000).isValid).toBe(true);
        });
        
        test('範囲外の値は検証に失敗し、範囲内に調整される', () => {
            const tooSmallResult = validationSystem.validate('game', 'score', -100);
            expect(tooSmallResult.isValid).toBe(false);
            expect(tooSmallResult.value).toBe(0);
            
            const tooLargeResult = validationSystem.validate('game', 'score', 2000);
            expect(tooLargeResult.isValid).toBe(false);
            expect(tooLargeResult.value).toBe(1000);
        });
    });
    
    describe('文字列チェック', () => {
        beforeEach(() => {
            const rule: ValidationRule = { 
                type: 'string', 
                minLength: 3, 
                maxLength: 20,
                pattern: /^[A-Za-z0-9_]+$/
            };
            validationSystem.setRule('game', 'name', rule);
            validationSystem.setDefaultValue('game', 'name', 'Player');
        });
        
        test('有効な文字列は検証に成功する', () => {
            expect(validationSystem.validate('game', 'name', 'Player123').isValid).toBe(true);
            expect(validationSystem.validate('game', 'name', 'User_Name').isValid).toBe(true);
        });
        
        test('短すぎる文字列は検証に失敗する', () => {
            const result = validationSystem.validate('game', 'name', 'AB');
            expect(result.isValid).toBe(false);
            expect(result.value).toBe('Player');
        });
        
        test('長すぎる文字列は検証に失敗し、切り詰められる', () => {
            const result = validationSystem.validate('game', 'name', 'ThisIsAReallyLongUsernameThatExceedsTheMaximumLength');
            expect(result.isValid).toBe(false);
            expect(result.value.length).toBe(20);
            expect(result.value).toBe('ThisIsAReallyLongUse');
        });
        
        test('パターンに一致しない文字列は検証に失敗する', () => {
            const result = validationSystem.validate('game', 'name', 'User Name!');
            expect(result.isValid).toBe(false);
            expect(result.value).toBe('Player');
        });
    });
    
    describe('列挙値チェック', () => {
        beforeEach(() => {
            const rule: ValidationRule = { 
                type: 'string', 
                enum: ['easy', 'normal', 'hard']
            };
            validationSystem.setRule('game', 'difficulty', rule);
            validationSystem.setDefaultValue('game', 'difficulty', 'normal');
        });
        
        test('列挙値に含まれる値は検証に成功する', () => {
            expect(validationSystem.validate('game', 'difficulty', 'easy').isValid).toBe(true);
            expect(validationSystem.validate('game', 'difficulty', 'normal').isValid).toBe(true);
            expect(validationSystem.validate('game', 'difficulty', 'hard').isValid).toBe(true);
        });
        
        test('列挙値に含まれない値は検証に失敗する', () => {
            const result = validationSystem.validate('game', 'difficulty', 'expert');
            expect(result.isValid).toBe(false);
            expect(result.value).toBe('normal');
        });
    });
    
    describe('カスタム検証', () => {
        beforeEach(() => {
            const rule: ValidationRule = { 
                type: 'number',
                validator: (value: number) => value % 2 === 0 || '偶数である必要があります'
            };
            validationSystem.setRule('game', 'evenNumber', rule);
            validationSystem.setDefaultValue('game', 'evenNumber', 0);
        });
        
        test('カスタム検証に成功する値は検証に成功する', () => {
            expect(validationSystem.validate('game', 'evenNumber', 2).isValid).toBe(true);
            expect(validationSystem.validate('game', 'evenNumber', 100).isValid).toBe(true);
        });
        
        test('カスタム検証に失敗する値は検証に失敗する', () => {
            const result = validationSystem.validate('game', 'evenNumber', 3);
            expect(result.isValid).toBe(false);
            expect(result.value).toBe(0);
            expect(result.message).toBe('偶数である必要があります');
        });
        
        test('カスタム検証でエラーが発生した場合は検証に失敗する', () => {
            const buggyRule: ValidationRule = { 
                validator: () => { throw new Error('検証エラー'); }
            };
            validationSystem.setRule('game', 'buggyValidator', buggyRule);
            
            const result = validationSystem.validate('game', 'buggyValidator', 'any');
            expect(result.isValid).toBe(false);
        });
    });
    
    describe('validateAndAdjust', () => {
        beforeEach(() => {
            validationSystem.setRule('game', 'score', { type: 'number', min: 0, max: 1000 });
            validationSystem.setDefaultValue('game', 'score', 500);
        });
        
        test('有効な値はそのまま返される', () => {
            expect(validationSystem.validateAndAdjust('game', 'score', 100)).toBe(100);
        });
        
        test('無効な値は調整されて返される', () => {
            expect(validationSystem.validateAndAdjust('game', 'score', -100)).toBe(0);
            expect(validationSystem.validateAndAdjust('game', 'score', 2000)).toBe(1000);
            expect(validationSystem.validateAndAdjust('game', 'score', 'invalid')).toBe(500);
        });
    });
    
    describe('エラー履歴', () => {
        beforeEach(() => {
            validationSystem.setRule('game', 'score', { type: 'number', min: 0 });
            validationSystem.clearValidationErrors();
        });
        
        test('検証エラーが記録される', () => {
            validationSystem.validate('game', 'score', -100);
            validationSystem.validate('game', 'score', 'invalid');
            
            const errors = validationSystem.getValidationErrors();
            expect(errors.length).toBe(2);
            expect(errors[0].category).toBe('game');
            expect(errors[0].key).toBe('score');
            expect(errors[0].value).toBe(-100);
            expect(errors[1].value).toBe('invalid');
        });
        
        test('エラー履歴をクリアできる', () => {
            validationSystem.validate('game', 'score', -100);
            expect(validationSystem.getValidationErrors().length).toBe(1);
            
            validationSystem.clearValidationErrors();
            expect(validationSystem.getValidationErrors().length).toBe(0);
        });
    });
    
    describe('ルールなしの検証', () => {
        test('ルールがない場合は常に検証に成功する', () => {
            const result = validationSystem.validate('unknown', 'key', 'any value');
            expect(result.isValid).toBe(true);
            expect(result.value).toBe('any value');
        });
    });
});