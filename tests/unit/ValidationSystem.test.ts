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
    validator?: (value: any) => boolean | string;
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
            validationSystem.setRule('game', 'score', { type: 'number', min: 0 
});
expect(validationSystem.rules.has('game.score')).toBe(true);
            expect(validationSystem.rules.get('game.score')).toEqual({ type: 'number', min: 0 
})
        });

        test('複数のルールを一括設定できる', () => {
            const rules: RuleSet = {
                username: { type: 'string', minLength: 3, maxLength: 20 },
                email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
                age: { type: 'number', min: 0, max: 120 }
            };

            validationSystem.setRules('user', rules);

            expect(validationSystem.rules.has('user.username')).toBe(true);
            expect(validationSystem.rules.has('user.email')).toBe(true);
            expect(validationSystem.rules.has('user.age')).toBe(true)
        });

        test('ルールの更新ができる', () => {

            validationSystem.setRule('game', 'level', { type: 'number', min: 1 
});
validationSystem.setRule('game', 'level', { type: 'number', min: 1, max: 100 
});
            
            const rule = validationSystem.rules.get('game.level');
            expect(rule?.max).toBe(100)
        });

        test('ルールの削除ができる', () => {

            validationSystem.setRule('temp', 'value', { type: 'string' 
});
expect(validationSystem.rules.has('temp.value')).toBe(true);
            
            validationSystem.removeRule('temp', 'value');
            expect(validationSystem.rules.has('temp.value')).toBe(false)
        
})
    });

    describe('デフォルト値設定', () => {
        test('デフォルト値を設定できる', () => {
            validationSystem.setDefaultValue('game', 'score', 0);
            expect(validationSystem.defaultValues.get('game.score')).toBe(0)
        });

        test('複数のデフォルト値を一括設定できる', () => {
            const defaults: DefaultValues = {
                username: 'Guest',
                score: 0,
                level: 1
            };

            validationSystem.setDefaultValues('game', defaults);

            expect(validationSystem.defaultValues.get('game.username')).toBe('Guest');
            expect(validationSystem.defaultValues.get('game.score')).toBe(0);
            expect(validationSystem.defaultValues.get('game.level')).toBe(1)
        });

        test('デフォルト値の取得ができる', () => {

            validationSystem.setDefaultValue('settings', 'volume', 0.8);
            
            const value = validationSystem.getDefaultValue('settings', 'volume');
            expect(value).toBe(0.8)
        
});
test('存在しないデフォルト値はundefinedを返す', () => {
            const value = validationSystem.getDefaultValue('nonexistent', 'key');
            expect(value).toBeUndefined()
        
})
    });

    describe('バリデーション実行', () => {

        beforeEach(() => {
            validationSystem.setRule('test', 'number', { type: 'number', min: 0, max: 100 
});
validationSystem.setRule('test', 'string', { type: 'string', minLength: 1, maxLength: 50 
});
            validationSystem.setRule('test', 'email', { 
                type: 'string', 
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
            });
            validationSystem.setRule('test', 'enum', { enum: ['small', 'medium', 'large'] })
        });

        test('数値の範囲チェックが正常に動作する', () => {

            expect(validationSystem.validate('test', 'number', 50).isValid).toBe(true);
            expect(validationSystem.validate('test', 'number', -10).isValid).toBe(false);
            expect(validationSystem.validate('test', 'number', 150).isValid).toBe(false)
        
});
test('文字列の長さチェックが正常に動作する', () => {
            expect(validationSystem.validate('test', 'string', 'hello').isValid).toBe(true);
            expect(validationSystem.validate('test', 'string', '').isValid).toBe(false);
            expect(validationSystem.validate('test', 'string', 'a'.repeat(60)).isValid).toBe(false)
        
});

        test('正規表現パターンチェックが正常に動作する', () => {

            expect(validationSystem.validate('test', 'email', 'test@example.com').isValid).toBe(true);
            expect(validationSystem.validate('test', 'email', 'invalid-email').isValid).toBe(false)
        
});
test('列挙値チェックが正常に動作する', () => {
            expect(validationSystem.validate('test', 'enum', 'medium').isValid).toBe(true);
            expect(validationSystem.validate('test', 'enum', 'extra-large').isValid).toBe(false)
        
});

        test('存在しないルールに対してはtrueを返す', () => {

            const result = validationSystem.validate('nonexistent', 'key', 'value');
            expect(result.isValid).toBe(true)
        
})
 
});

    describe('カスタムバリデーター', () => {

        test('カスタムバリデーター関数が正常に動作する', () => {
            validationSystem.setRule('custom', 'even', {
                validator: (value: number) => value % 2 === 0 || 'Value must be even'
            
});
expect(validationSystem.validate('custom', 'even', 4).isValid).toBe(true);
            expect(validationSystem.validate('custom', 'even', 3).isValid).toBe(false);
            expect(validationSystem.validate('custom', 'even', 3).message).toBe('Value must be even')
        
});

        test('カスタムバリデーターでtrueを返すとバリデーション成功', () => {

            validationSystem.setRule('custom', 'always-true', {
                validator: () => true
            
});
expect(validationSystem.validate('custom', 'always-true', 'anything').isValid).toBe(true)
        
});

        test('カスタムバリデーターでfalseを返すとバリデーション失敗', () => {

            validationSystem.setRule('custom', 'always-false', {
                validator: () => false
            
});
expect(validationSystem.validate('custom', 'always-false', 'anything').isValid).toBe(false)
        
})
    });

    describe('バッチバリデーション', () => {
        beforeEach(() => {
            validationSystem.setRules('user', {
                name: { type: 'string', minLength: 2 },
                age: { type: 'number', min: 0, max: 120 },
                email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
            })
        });

        test('複数の値を一括でバリデーションできる', () => {
            const data = {
                name: 'John Doe',
                age: 30,
                email: 'john@example.com'
            };

            const results = validationSystem.validateAll('user', data);
            
            expect(results.name.isValid).toBe(true);
            expect(results.age.isValid).toBe(true);
            expect(results.email.isValid).toBe(true)
        });

        test('一部のバリデーションが失敗した場合も正しく結果を返す', () => {
            const data = {
                name: 'J',
                age: -5,
                email: 'invalid-email'
            };

            const results = validationSystem.validateAll('user', data);
            
            expect(results.name.isValid).toBe(false);
            expect(results.age.isValid).toBe(false);
            expect(results.email.isValid).toBe(false)
        })
    });

    describe('エラー記録', () => {

        test('バリデーションエラーが記録される', () => {
            validationSystem.setRule('test', 'value', { type: 'number', min: 10 
});
validationSystem.validate('test', 'value', 5);
            
            expect(validationSystem.validationErrors.length).toBeGreaterThan(0);
            expect(validationSystem.validationErrors[0].category).toBe('test');
            expect(validationSystem.validationErrors[0].key).toBe('value')
        
});

        test('エラー履歴をクリアできる', () => {

            validationSystem.setRule('test', 'value', { type: 'number', min: 10 
});
validationSystem.validate('test', 'value', 5);
            
            expect(validationSystem.validationErrors.length).toBeGreaterThan(0);
            
            validationSystem.clearErrors();
            expect(validationSystem.validationErrors.length).toBe(0)
        
});

        test('特定カテゴリのエラーのみクリアできる', () => {

            validationSystem.setRule('category1', 'value', { type: 'number', min: 10 
});
validationSystem.setRule('category2', 'value', { type: 'number', min: 10 
});
            
            validationSystem.validate('category1', 'value', 5);
            validationSystem.validate('category2', 'value', 5);
            
            expect(validationSystem.validationErrors.length).toBe(2);
            
            validationSystem.clearErrors('category1');
            expect(validationSystem.validationErrors.length).toBe(1);
            expect(validationSystem.validationErrors[0].category).toBe('category2')
        })
    });

    describe('型チェック', () => {

        test('数値型のチェックが正常に動作する', () => {
            validationSystem.setRule('type', 'number', { type: 'number' 
});
expect(validationSystem.validate('type', 'number', 123).isValid).toBe(true);
            expect(validationSystem.validate('type', 'number', '123').isValid).toBe(false);
            expect(validationSystem.validate('type', 'number', true).isValid).toBe(false)
        
});

        test('文字列型のチェックが正常に動作する', () => {

            validationSystem.setRule('type', 'string', { type: 'string' 
});
expect(validationSystem.validate('type', 'string', 'hello').isValid).toBe(true);
            expect(validationSystem.validate('type', 'string', 123).isValid).toBe(false);
            expect(validationSystem.validate('type', 'string', true).isValid).toBe(false)
        
});

        test('ブール型のチェックが正常に動作する', () => {

            validationSystem.setRule('type', 'boolean', { type: 'boolean' 
});
expect(validationSystem.validate('type', 'boolean', true).isValid).toBe(true);
            expect(validationSystem.validate('type', 'boolean', false).isValid).toBe(true);
            expect(validationSystem.validate('type', 'boolean', 'true').isValid).toBe(false);
            expect(validationSystem.validate('type', 'boolean', 1).isValid).toBe(false)
        
});

        test('配列型のチェックが正常に動作する', () => {
            validationSystem.setRule('type', 'array', { type: 'array' });
            
            expect(validationSystem.validate('type', 'array', [1, 2, 3]).isValid).toBe(true);
            expect(validationSystem.validate('type', 'array', []).isValid).toBe(true);
            expect(validationSystem.validate('type', 'array', 'not array').isValid).toBe(false);
            expect(validationSystem.validate('type', 'array', {}).isValid).toBe(false)
        })
    });

    describe('統合テスト', () => {
        test('実際のゲーム設定のバリデーション', () => {
            // ゲーム設定のルールを定義
            validationSystem.setRules('game', {
                playerName: { type: 'string', minLength: 1, maxLength: 20 },
                difficulty: { enum: ['easy', 'normal', 'hard', 'expert'] },
                volume: { type: 'number', min: 0, max: 1 },
                enableEffects: { type: 'boolean' },
                controls: { type: 'array' }
            });

            const validConfig = {
                playerName: 'Player1',
                difficulty: 'normal',
                volume: 0.8,
                enableEffects: true,
                controls: ['mouse', 'keyboard']
            };

            const results = validationSystem.validateAll('game', validConfig);
            
            Object.values(results).forEach(result => {

                expect(result.isValid).toBe(true)
            
})
 
});

        test('無効なゲーム設定のバリデーション', () => {
            validationSystem.setRules('game', {
                playerName: { type: 'string', minLength: 1, maxLength: 20 },
                difficulty: { enum: ['easy', 'normal', 'hard', 'expert'] },
                volume: { type: 'number', min: 0, max: 1 }
            });

            const invalidConfig = {
                playerName: '', // 空文字列は無効
                difficulty: 'impossible', // 列挙値にない
                volume: 1.5 // 範囲外
            };

            const results = validationSystem.validateAll('game', invalidConfig);
            
            expect(results.playerName.isValid).toBe(false);
            expect(results.difficulty.isValid).toBe(false);
            expect(results.volume.isValid).toBe(false)
        })
    });

    describe('エラーハンドリング', () => {
        test('ルール設定時のエラーハンドリング', () => {
            expect(() => {
                validationSystem.setRule('', '', {})
            }).not.toThrow();

            expect(() => {
                validationSystem.setRule('category', 'key', null as any)
            }).not.toThrow()
        });

        test('バリデーション実行時のエラーハンドリング', () => {
            expect(() => {
                validationSystem.validate('', '', null)
            }).not.toThrow();

            expect(() => {
                validationSystem.validate('category', 'key', undefined)
            }).not.toThrow()
        });

        test('カスタムバリデーターでの例外処理', () => {
            validationSystem.setRule('error', 'test', {
                validator: () => {
                    throw new Error('Validator error')
                }
            });

            expect(() => {
                validationSystem.validate('error', 'test', 'value')
            }).not.toThrow();

            const result = validationSystem.validate('error', 'test', 'value');
            expect(result.isValid).toBe(false);
        })
    })
});