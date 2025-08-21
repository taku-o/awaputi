import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * ConfigurationCommands Unit Tests'
 */''
import { ConfigurationCommands } from '../../src/debug/ConfigurationCommands';
describe('ConfigurationCommands', () => {  let mockGameEngine: any,
    let mockConfigManager: any,
    let mockConsole: any,
    let configCommands: any,
    beforeEach(() => {
        // モックの設定
        mockConfigManager = {
            get: jest.fn(
            set: jest.fn(
            getDefault: jest.fn(
            getAll: jest.fn(
            getAllDefaults: jest.fn(
            validate: jest.fn() }
        validateAll: jest.fn(); }
        };
        mockGameEngine = { configurationManager: mockConfigManager,
        },
        mockConsole = { register: jest.fn() }
        };'
        configCommands = new ConfigurationCommands(mockGameEngine: any);'}');
    describe('registerCommands', (') => {  ''
        test('should register all configuration commands', () => {'
            configCommands.registerCommands(mockConsole),
            expect(mockConsole.register').toHaveBeenCalledWith('config.get', expect.any(Function), expect.any(Object),'
            expect(mockConsole.register').toHaveBeenCalledWith('config.set', expect.any(Function), expect.any(Object),'
            expect(mockConsole.register').toHaveBeenCalledWith('config.reset', expect.any(Function), expect.any(Object),'
            expect(mockConsole.register').toHaveBeenCalledWith('config.list', expect.any(Function), expect.any(Object),'
            expect(mockConsole.register').toHaveBeenCalledWith('config.validate', expect.any(Function), expect.any(Object),'
            expect(mockConsole.register').toHaveBeenCalledWith('config.export', expect.any(Function), expect.any(Object),'
            expect(mockConsole.register').toHaveBeenCalledWith('config.import', expect.any(Function), expect.any(Object),'
            expect(mockConsole.register').toHaveBeenCalledWith('config.history', expect.any(Function), expect.any(Object),'
            expect(mockConsole.register').toHaveBeenCalledWith('config.revert', expect.any(Function), expect.any(Object),' }'
            expect(mockConsole.register').toHaveBeenCalledWith('config.diff', expect.any(Function), expect.any(Object);' }'
            expect(mockConsole.register').toHaveBeenCalledWith('config.template', expect.any(Function}, expect.any(Object);'
        }'}');
    describe('getConfig', (') => {  ''
        test('should get configuration value successfully', () => {''
            mockConfigManager.get.mockReturnValue(25'),'
            const result = configCommands.getConfig(['game.scoring.baseScores.normal']),
            expect(mockConfigManager.get').toHaveBeenCalledWith('game.scoring.baseScores.normal'),' }'
            expect(result').toBe('game.scoring.baseScores.normal = 25 (number')');' }'
        }');'
        test('should handle undefined configuration path', () => {  ''
            mockConfigManager.get.mockReturnValue(undefined'),'
            const result = configCommands.getConfig(['nonexistent.path']),' }'
            expect(result').toBe("Configuration path 'nonexistent.path' not found."););" }"'
        }");""
        test('should handle object values', () => {  }'
            const objectValue = { normal: 10, stone: 20 }''
            mockConfigManager.get.mockReturnValue(objectValue');'
            const result = configCommands.getConfig(['game.scoring.baseScores']');'
            expect(result.toContain('game.scoring.baseScores = { '),' }'
            expect(result.toContain('(object')'};'}');'
    }''
    describe('setConfig', (') => {  ''
        test('should set configuration value successfully', () => {'
            mockConfigManager.get.mockReturnValue(10), // original value' }'
            mockConfigManager.set.mockReturnValue(true');' }'
            const result = configCommands.setConfig(['game.scoring.baseScores.normal', '25']});
            expect(mockConfigManager.set').toHaveBeenCalledWith('game.scoring.baseScores.normal', 25, { validate: true)'
        saveToStorage: false) }'
            }''
            expect(result').toBe('Set game.scoring.baseScores.normal = 25 (number')');'}');
        test('should convert string to boolean', () => {  mockConfigManager.get.mockReturnValue(false),
            mockConfigManager.set.mockReturnValue(true'),'
            configCommands.setConfig(['debug.enabled', 'true']),' }'
            expect(mockConfigManager.set').toHaveBeenCalledWith('debug.enabled', true, expect.any(Object);' }'
        }');'
        test('should convert string to JSON object', () => {  }'
            mockConfigManager.get.mockReturnValue({});
            mockConfigManager.set.mockReturnValue(true');'
            configCommands.setConfig(['test.object', '{"key":"value"}']);
            expect(mockConfigManager.set').toHaveBeenCalledWith('test.object', { key: 'value' }, expect.any(Object);'}');'
        test('should handle configuration set errors', () => {  ''
            mockConfigManager.set.mockImplementation((') => { }'
                throw new Error('Validation failed');' }'
            }');'
            const result = configCommands.setConfig(['invalid.path', 'value']);
            expect(result').toBe('Error setting configuration: Validation failed'),';
        }');'
        test('should store original values for revert', () => {  mockConfigManager.get.mockReturnValue(10),
            mockConfigManager.set.mockReturnValue(true'),' }'
            configCommands.setConfig(['test.path', '20']');' }'
            configCommands.setConfig(['test.path', '30']}; // 2回目')'
            // 元の値は1回目のsetConfigで保存される');'
            expect(configCommands.originalValues.get('test.path'}).toBe(10);'
        }'}');
    describe('resetConfig', (') => {  ''
        test('should reset configuration to default value', () => {
            mockConfigManager.getDefault.mockReturnValue(15),'
            mockConfigManager.get.mockReturnValue(25), // current value''
            mockConfigManager.set.mockReturnValue(true'),'
            const result = configCommands.resetConfig(['game.scoring.baseScores.normal']),
            expect(mockConfigManager.getDefault').toHaveBeenCalledWith('game.scoring.baseScores.normal'),'
            expect(mockConfigManager.set').toHaveBeenCalledWith('game.scoring.baseScores.normal', 15, {)'
                validate: true) }
        saveToStorage: false); }'
            }''
            expect(result').toBe('Reset game.scoring.baseScores.normal to default value: 15'),';
        }');'
        test('should handle path with no default value', () => {  ''
            mockConfigManager.getDefault.mockReturnValue(undefined'),'
            const result = configCommands.resetConfig(['nonexistent.path']),' }'
            expect(result').toBe("Configuration path 'nonexistent.path' not found or has no default value."););" }"'
        }");"
    }""
    describe('listConfig', (') => {  ''
        test('should list all configurations', () => {
            mockConfigManager.getAll.mockReturnValue({
                game: {
                    scoring: {
                        baseScores: { }
                            normal: 10 }
                        }
            });
            });
                audio: { volume: {
                        master: 1.0 }
            });
                }),'
            });
            const result = configCommands.listConfig([]');'
            expect(result.toContain('All configuration values: '),';'
            expect(result.toContain('game: '),';'
            expect(result.toContain('audio: '),';'
        }');'
        test('should filter configurations by prefix', () => {  mockConfigManager.getAll.mockReturnValue({
                game: {
                    scoring: {
                        baseScores: { }
                            normal: 10 }
                        }
            });
            });
                audio: { volume: {
                        master: 1.0 }
                    })'
                });'}');
            const result = configCommands.listConfig(['game']');'
            expect(result.toContain('Configuration values (prefix: game'):'),';
            expect(result.toContain('scoring: '),';'
            expect(result').not.toContain('audio: '),';
        }');'
    }''
    describe('validateConfig', (') => {  ''
        test('should validate all configuration successfully', () => {
            mockConfigManager.validateAll.mockReturnValue({)
                isValid: true) }
                errors: []); }
            });
            const result = configCommands.validateConfig([]);'
            expect(mockConfigManager.validateAll).toHaveBeenCalled();
            expect(result').toBe('All configuration is valid.');'}');'
        test('should validate specific configuration path', () => {  mockConfigManager.validate.mockReturnValue({)
                isValid: true) }'
                errors: []),' }'
            }');'
            const result = configCommands.validateConfig(['game.scoring']);
            expect(mockConfigManager.validate').toHaveBeenCalledWith('game.scoring');'
            expect(result').toBe("Configuration 'game.scoring' is valid.");""'
        }");""
        test('should handle validation errors', (') => {  mockConfigManager.validateAll.mockReturnValue({)'
                isValid: false) }'
                errors: [' }]'
                    { path: 'game.scoring.baseScores.normal', message: 'Value must be positive' })]
                ]);'
            });
            const result = configCommands.validateConfig([]');'
            expect(result.toContain('Configuration validation errors found: '),';'
            expect(result.toContain('game.scoring.baseScores.normal: Value must be positive'),';'
        }');'
    }''
    describe('exportConfig', (') => {  ''
        test('should export all configuration', () => { }
            const config = { }
                game: { scoring: { baseScores: { normal: 10 } } },
                audio: { volume: { master: 1.0 } }
            },'
            mockConfigManager.getAll.mockReturnValue(config);
            const result = configCommands.exportConfig([]');'
            expect(result.toContain('Configuration exported: '),';'
            expect(result.toContain('"game"');
            expect(result.toContain('"audio");'}');'
        test('should export specific configuration path', () => { }'
            mockConfigManager.get.mockReturnValue({ baseScores: { normal: 10 } }');'
            const result = configCommands.exportConfig(['game.scoring']);
            expect(mockConfigManager.get').toHaveBeenCalledWith('game.scoring');'
            expect(result.toContain('Configuration exported: '),';'
        }');'
    }''
    describe('importConfig', (') => {  ''
        test('should import configuration successfully', () => { }'
            mockConfigManager.get.mockReturnValue(10); // original value' }'
            mockConfigManager.set.mockReturnValue(true}');'
            const result = configCommands.importConfig(['{"game":{"scoring":{"baseScores":{"normal":25}}}']);
            expect(mockConfigManager.set').toHaveBeenCalledWith('game.scoring.baseScores.normal', 25, { validate: true,')'
        saveToStorage: false)') }'
            }''
            expect(result.toContain('Successfully imported 1 configuration values: '),';'
            expect(result.toContain('game.scoring.baseScores.normal = 25');'}');
        test('should handle invalid JSON', (') => {  ''
            const result = configCommands.importConfig(['invalid json']'),' }'
            expect(result.toContain('Invalid JSON format: '),' }'
        }');'
        test('should handle import errors', () => {  ''
            mockConfigManager.set.mockImplementation((') => { }'
                throw new Error('Validation failed');' }'
            }');'
            const result = configCommands.importConfig(['{"test":"value"}']');'
            expect(result.toContain('Errors during import: '),';'
            expect(result.toContain('test: Validation failed'),';'
        }');'
    }''
    describe('showHistory', (') => {  ''
        test('should show empty history', () => {'
            const result = configCommands.showHistory([]),' }'
            expect(result').toBe('No configuration changes made during this session.'););' }'
        }');'
        test('should show change history', () => {  // 履歴を追加するために設定変更を実行'
            mockConfigManager.get.mockReturnValue(10),
            mockConfigManager.set.mockReturnValue(true'),'
            configCommands.setConfig(['test.path', '20']'),'
            const result = configCommands.showHistory(['1']'),'
            expect(result.toContain('Recent configuration changes'),
            expect(result.toContain('test.path'),' }'
            expect(result.toContain('console');' }'
        }');'
    }''
    describe('revertChanges', (') => {  ''
        test('should revert no changes when none exist', () => {'
            const result = configCommands.revertChanges(),' }'
            expect(result').toBe('No configuration changes to revert.'););' }'
        }');'
        test('should revert all changes', () => {  // 変更を加える'
            mockConfigManager.get.mockReturnValue(10),
            mockConfigManager.set.mockReturnValue(true'),'
            configCommands.setConfig(['test.path1', '20']'),'
            configCommands.setConfig(['test.path2', '30']),
            mockConfigManager.set.mockClear(),'
            const result = configCommands.revertChanges(),
            expect(mockConfigManager.set').toHaveBeenCalledWith('test.path1', 10, {)'
                validate: true) }
        saveToStorage: false); }'
            }''
            expect(mockConfigManager.set').toHaveBeenCalledWith('test.path2', 10, { validate: true,')'
        saveToStorage: false)') }'
            }''
            expect(result.toContain('Reverted 2 configuration changes.');'}');'
    }''
    describe('applyTemplate', (') => {  ''
        test('should apply development template', () => {'
            mockConfigManager.get.mockReturnValue(60), // original value' }'
            mockConfigManager.set.mockReturnValue(true');' }'
            const result = configCommands.applyTemplate(['development']});
            expect(mockConfigManager.set').toHaveBeenCalledWith('performance.targetFPS', 60, { validate: true)'
        saveToStorage: false) }'
            }''
            expect(mockConfigManager.set').toHaveBeenCalledWith('debug.enabled', true, { validate: true,')'
        saveToStorage: false)') }'
            }''
            expect(result.toContain("Applied template 'development'");""
        }");""
        test('should handle unknown template', (') => {  ''
            const result = configCommands.applyTemplate(['unknown']'),'
            expect(result.toContain("Template 'unknown' not found"")," }"
            expect(result.toContain('Available templates: development, production, test');' }'
        }');'
    }''
    describe('convertValue', (') => {  ''
        test('should convert boolean strings', (') => { }'
            expect(configCommands.convertValue('true').toBe(true);');' }'
            expect(configCommands.convertValue('false'}).toBe(false');'
        }''
        test('should convert number strings', (') => { }'
            expect(configCommands.convertValue('123').toBe(123);');' }'
            expect(configCommands.convertValue('12.34'}).toBe(12.34');'
        }''
        test('should convert JSON strings', (') => { }'
            expect(configCommands.convertValue('{"key":"value"}')').toEqual({ key: 'value' }');
            expect(configCommands.convertValue('[1,2,3]').toEqual([1, 2, 3]);'}');
        test('should handle null and undefined', (') => { }'
            expect(configCommands.convertValue('null').toBe(null);');' }'
            expect(configCommands.convertValue('undefined'}).toBe(undefined');'
        }''
        test('should keep strings as strings', (') => { }'
            expect(configCommands.convertValue('hello'}').toBe('hello');'
        }'}');
    describe('destroy', (') => {  ''
        test('should clear all data', () => {
            // データを追加'
            mockConfigManager.get.mockReturnValue(10),
            mockConfigManager.set.mockReturnValue(true'),'
            configCommands.setConfig(['test.path', '20']),
            configCommands.destroy(),
            expect(configCommands.originalValues.size).toBe(0) }
            expect(configCommands.changeHistory.length).toBe(0);); }
        });'
    }'}');