/**
 * Developer Console Tests
 * DeveloperConsole クラスのユニットテスト
 */

import { jest } from '@jest/globals';

// DOM environment setup
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Mock ErrorHandler
jest.mock('../src/utils/ErrorHandler.js', () => ({
    getErrorHandler: jest.fn(() => ({
        handleError: jest.fn()
    }))
}));

// Mock game engine
const mockGameEngine = {
    canvas: { mock: 'canvas' },
    sceneManager: { mock: 'sceneManager' },
    inputManager: { mock: 'inputManager' },
    performanceOptimizer: {
        getCurrentFPS: jest.fn(() => 60)
    }
};

// Import after mocking
const { DeveloperConsole, CommandRegistry } = await import('../../src/debug/DeveloperConsole.js');

describe('DeveloperConsole', () => {
    let console;
    let consoleLogSpy;
    let consoleWarnSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        // Console spies
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Reset DOM
        document.body.innerHTML = '';

        // Reset mocks
        jest.clearAllMocks();

        // Create instance
        console = new DeveloperConsole(mockGameEngine);
    });

    afterEach(() => {
        if (console) {
            console.destroy();
        }

        // Restore console
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('Initialization', () => {
        test('should initialize with default values', () => {
            expect(console.gameEngine).toBe(mockGameEngine);
            expect(console.element).toBeDefined();
            expect(console.inputElement).toBeDefined();
            expect(console.outputElement).toBeDefined();
            expect(console.commandRegistry).toBeInstanceOf(CommandRegistry);
        });

        test('should create DOM elements', () => {
            expect(console.element.className).toBe('developer-console');
            expect(console.outputElement.className).toBe('console-output');
            expect(console.inputElement.className).toBe('console-input');
            expect(console.element.parentNode).toBe(document.body);
        });

        test('should have correct initial state', () => {
            expect(console.state.visible).toBe(false);
            expect(console.state.focused).toBe(false);
            expect(console.state.history).toEqual([]);
            expect(console.state.historyIndex).toBe(-1);
        });

        test('should be initially hidden', () => {
            expect(console.element.style.display).toBe('none');
        });

        test('should register default commands', () => {
            const commandNames = console.commandRegistry.getCommandNames();
            expect(commandNames).toContain('help');
            expect(commandNames).toContain('clear');
            expect(commandNames).toContain('history');
            expect(commandNames).toContain('echo');
            expect(commandNames).toContain('date');
            expect(commandNames).toContain('engine');
        });
    });

    describe('Display Control', () => {
        test('should show console', () => {
            console.show();
            expect(console.element.style.display).toBe('block');
            expect(console.state.visible).toBe(true);
        });

        test('should hide console', () => {
            console.show();
            console.hide();
            expect(console.element.style.display).toBe('none');
            expect(console.state.visible).toBe(false);
        });

        test('should toggle console visibility', () => {
            expect(console.state.visible).toBe(false);
            
            console.toggle();
            expect(console.state.visible).toBe(true);
            
            console.toggle();
            expect(console.state.visible).toBe(false);
        });

        test('should focus input when shown', () => {
            const focusSpy = jest.spyOn(console.inputElement, 'focus');
            console.show();
            expect(focusSpy).toHaveBeenCalled();
        });
    });

    describe('Output System', () => {
        test('should print normal text', () => {
            console.print('Test message');
            expect(console.output.lines).toHaveLength(6); // 5 welcome messages + 1 test message
            expect(console.output.lines[5].text).toBe('Test message');
            expect(console.output.lines[5].type).toBe('normal');
        });

        test('should print different message types', () => {
            console.printError('Error message');
            console.printWarning('Warning message');
            console.printInfo('Info message');
            console.printSuccess('Success message');

            const lines = console.output.lines;
            expect(lines[lines.length - 4].type).toBe('error');
            expect(lines[lines.length - 3].type).toBe('warning');
            expect(lines[lines.length - 2].type).toBe('info');
            expect(lines[lines.length - 1].type).toBe('success');
        });

        test('should limit output lines', () => {
            console.output.maxLines = 3;
            
            console.print('Line 1');
            console.print('Line 2');
            console.print('Line 3');
            console.print('Line 4');
            
            expect(console.output.lines).toHaveLength(3);
            expect(console.output.lines[0].text).toBe('Line 2');
            expect(console.output.lines[2].text).toBe('Line 4');
        });

        test('should escape HTML in output', () => {
            console.print('<script>alert("xss")</script>');
            const html = console.outputElement.innerHTML;
            expect(html).toContain('&lt;script&gt;');
            expect(html).not.toContain('<script>');
        });

        test('should clear output', () => {
            console.print('Test message');
            expect(console.output.lines.length).toBeGreaterThan(0);
            
            console.clear();
            expect(console.output.lines).toHaveLength(0);
            expect(console.outputElement.innerHTML).toBe('');
        });

        test('should format timestamps', () => {
            const date = new Date('2023-01-01T12:34:56Z');
            const formatted = console.formatTimestamp(date);
            expect(formatted).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        });
    });

    describe('Command Execution', () => {
        test('should execute help command', () => {
            console.inputElement.value = 'help';
            console.executeCommand();
            
            const lastLine = console.output.lines[console.output.lines.length - 1];
            expect(lastLine.text).toContain('Available commands');
        });

        test('should execute clear command', () => {
            console.print('Test message');
            console.inputElement.value = 'clear';
            console.executeCommand();
            
            expect(console.output.lines).toHaveLength(0);
        });

        test('should execute echo command', () => {
            console.inputElement.value = 'echo Hello World';
            console.executeCommand();
            
            const lastLine = console.output.lines[console.output.lines.length - 1];
            expect(lastLine.text).toBe('Hello World');
        });

        test('should execute date command', () => {
            console.inputElement.value = 'date';
            console.executeCommand();
            
            const lastLine = console.output.lines[console.output.lines.length - 1];
            expect(lastLine.text).toMatch(/\d{4}/); // Should contain year
        });

        test('should execute engine command', () => {
            console.inputElement.value = 'engine';
            console.executeCommand();
            
            const lastLine = console.output.lines[console.output.lines.length - 1];
            expect(lastLine.text).toContain('Game Engine Information');
        });

        test('should handle unknown command', () => {
            console.inputElement.value = 'unknown';
            console.executeCommand();
            
            const lastLine = console.output.lines[console.output.lines.length - 1];
            expect(lastLine.text).toContain('Unknown command');
            expect(lastLine.type).toBe('error');
        });

        test('should handle empty command', () => {
            console.inputElement.value = '';
            console.executeCommand();
            
            // Should not add anything to output or history
            expect(console.state.history).toHaveLength(0);
        });

        test('should handle command execution errors', () => {
            console.commandRegistry.register('error-command', {
                execute: () => {
                    throw new Error('Test error');
                }
            });
            
            console.inputElement.value = 'error-command';
            console.executeCommand();
            
            const lastLine = console.output.lines[console.output.lines.length - 1];
            expect(lastLine.text).toContain('Command error');
            expect(lastLine.type).toBe('error');
        });
    });

    describe('Command History', () => {
        test('should add commands to history', () => {
            console.inputElement.value = 'test command';
            console.executeCommand();
            
            expect(console.state.history).toContain('test command');
        });

        test('should navigate history with arrow keys', () => {
            console.inputElement.value = 'command1';
            console.executeCommand();
            console.inputElement.value = 'command2';
            console.executeCommand();
            
            // Navigate up (to previous command)
            console.navigateHistory(-1);
            expect(console.inputElement.value).toBe('command2');
            
            console.navigateHistory(-1);
            expect(console.inputElement.value).toBe('command1');
            
            // Navigate down (to next command)
            console.navigateHistory(1);
            expect(console.inputElement.value).toBe('command2');
        });

        test('should limit history size', () => {
            console.state.maxHistorySize = 3;
            
            console.inputElement.value = 'command1';
            console.executeCommand();
            console.inputElement.value = 'command2';
            console.executeCommand();
            console.inputElement.value = 'command3';
            console.executeCommand();
            console.inputElement.value = 'command4';
            console.executeCommand();
            
            expect(console.state.history).toHaveLength(3);
            expect(console.state.history[0]).toBe('command2');
            expect(console.state.history[2]).toBe('command4');
        });

        test('should remove duplicate history entries', () => {
            console.inputElement.value = 'same command';
            console.executeCommand();
            console.inputElement.value = 'same command';
            console.executeCommand();
            
            expect(console.state.history.filter(cmd => cmd === 'same command')).toHaveLength(1);
        });

        test('should show command history', () => {
            console.inputElement.value = 'command1';
            console.executeCommand();
            console.inputElement.value = 'command2';
            console.executeCommand();
            
            console.inputElement.value = 'history';
            console.executeCommand();
            
            const lastLine = console.output.lines[console.output.lines.length - 1];
            expect(lastLine.text).toContain('command1');
            expect(lastLine.text).toContain('command2');
        });
    });

    describe('Keyboard Shortcuts', () => {
        test('should handle F12 key to toggle console', () => {
            const event = new KeyboardEvent('keydown', { key: 'F12' });
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
            
            document.dispatchEvent(event);
            
            expect(preventDefaultSpy).toHaveBeenCalled();
            expect(console.state.visible).toBe(true);
        });

        test('should handle Ctrl+Shift+C to toggle console', () => {
            const event = new KeyboardEvent('keydown', { 
                key: 'C', 
                ctrlKey: true, 
                shiftKey: true 
            });
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
            
            document.dispatchEvent(event);
            
            expect(preventDefaultSpy).toHaveBeenCalled();
            expect(console.state.visible).toBe(true);
        });

        test('should handle Escape key to hide console', () => {
            console.show();
            
            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
            
            document.dispatchEvent(event);
            
            expect(preventDefaultSpy).toHaveBeenCalled();
            expect(console.state.visible).toBe(false);
        });

        test('should handle Enter key to execute command', () => {
            console.inputElement.value = 'echo test';
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
            
            console.handleKeyDown(event);
            
            expect(preventDefaultSpy).toHaveBeenCalled();
            expect(console.inputElement.value).toBe('');
            expect(console.state.history).toContain('echo test');
        });

        test('should handle Tab key for completion', () => {
            console.inputElement.value = 'hel';
            const event = new KeyboardEvent('keydown', { key: 'Tab' });
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
            
            console.handleKeyDown(event);
            
            expect(preventDefaultSpy).toHaveBeenCalled();
            expect(console.inputElement.value).toBe('help');
        });
    });

    describe('Tab Completion', () => {
        test('should complete single command', () => {
            console.inputElement.value = 'hel';
            console.handleTabCompletion();
            
            expect(console.inputElement.value).toBe('help');
        });

        test('should show multiple completions', () => {
            console.inputElement.value = 'h';
            console.handleTabCompletion();
            
            const lastLines = console.output.lines.slice(-3);
            expect(lastLines.some(line => line.text.includes('Available completions'))).toBe(true);
        });

        test('should handle no completions', () => {
            console.inputElement.value = 'xyz';
            const originalLines = console.output.lines.length;
            
            console.handleTabCompletion();
            
            expect(console.output.lines.length).toBe(originalLines);
        });
    });

    describe('Settings and Configuration', () => {
        test('should update settings', () => {
            const newSettings = {
                maxHistorySize: 50,
                maxOutputLines: 200,
                timestampFormat: 'HH:mm',
                styles: {
                    console: { backgroundColor: 'red' }
                }
            };
            
            console.updateSettings(newSettings);
            
            expect(console.state.maxHistorySize).toBe(50);
            expect(console.output.maxLines).toBe(200);
            expect(console.output.timestampFormat).toBe('HH:mm');
            expect(console.element.style.backgroundColor).toBe('red');
        });

        test('should get console state', () => {
            const state = console.getState();
            
            expect(state.visible).toBeDefined();
            expect(state.focused).toBeDefined();
            expect(state.historySize).toBeDefined();
            expect(state.outputLines).toBeDefined();
            expect(state.availableCommands).toBeDefined();
            expect(Array.isArray(state.availableCommands)).toBe(true);
        });
    });

    describe('Custom Commands', () => {
        test('should register custom command', () => {
            const result = console.registerCommand('test', {
                description: 'Test command',
                execute: (args) => `Test result: ${args.join(' ')}`
            });
            
            expect(result).toBe(true);
            expect(console.commandRegistry.getCommandNames()).toContain('test');
        });

        test('should execute custom command', () => {
            console.registerCommand('custom', {
                description: 'Custom command',
                execute: (args) => `Custom: ${args[0]}`
            });
            
            console.inputElement.value = 'custom arg1';
            console.executeCommand();
            
            const lastLine = console.output.lines[console.output.lines.length - 1];
            expect(lastLine.text).toBe('Custom: arg1');
        });

        test('should unregister command', () => {
            console.registerCommand('temp', {
                execute: () => 'temp'
            });
            
            expect(console.commandRegistry.getCommandNames()).toContain('temp');
            
            const result = console.unregisterCommand('temp');
            expect(result).toBe(true);
            expect(console.commandRegistry.getCommandNames()).not.toContain('temp');
        });
    });

    describe('Cleanup', () => {
        test('should destroy cleanly', () => {
            const element = console.element;
            expect(element.parentNode).toBe(document.body);
            
            console.destroy();
            
            expect(element.parentNode).toBeNull();
        });

        test('should log destruction', () => {
            console.destroy();
            expect(consoleLogSpy).toHaveBeenCalledWith('[DeveloperConsole] Destroyed');
        });
    });
});

describe('CommandRegistry', () => {
    let registry;
    let mockConsole;

    beforeEach(() => {
        mockConsole = {
            print: jest.fn(),
            printError: jest.fn()
        };
        registry = new CommandRegistry(mockConsole);
    });

    afterEach(() => {
        if (registry) {
            registry.destroy();
        }
    });

    describe('Command Registration', () => {
        test('should register command', () => {
            const result = registry.register('test', {
                description: 'Test command',
                execute: () => 'test result'
            });
            
            expect(result).toBe(true);
            expect(registry.commands.has('test')).toBe(true);
        });

        test('should register command with aliases', () => {
            registry.register('test', {
                description: 'Test command',
                aliases: ['t', 'tst'],
                execute: () => 'test result'
            });
            
            expect(registry.aliases.get('t')).toBe('test');
            expect(registry.aliases.get('tst')).toBe('test');
        });

        test('should fail to register invalid command', () => {
            expect(() => {
                registry.register('invalid', { description: 'No execute function' });
            }).toThrow('Invalid command configuration');
        });

        test('should unregister command', () => {
            registry.register('temp', {
                aliases: ['tmp'],
                execute: () => 'temp'
            });
            
            expect(registry.commands.has('temp')).toBe(true);
            expect(registry.aliases.has('tmp')).toBe(true);
            
            const result = registry.unregister('temp');
            expect(result).toBe(true);
            expect(registry.commands.has('temp')).toBe(false);
            expect(registry.aliases.has('tmp')).toBe(false);
        });

        test('should fail to unregister non-existent command', () => {
            const result = registry.unregister('nonexistent');
            expect(result).toBe(false);
        });
    });

    describe('Command Execution', () => {
        beforeEach(() => {
            registry.register('echo', {
                execute: (args) => args.join(' ')
            });
            
            registry.register('add', {
                execute: (args) => {
                    const a = parseInt(args[0]);
                    const b = parseInt(args[1]);
                    return a + b;
                }
            });
        });

        test('should execute simple command', () => {
            const result = registry.execute('echo hello world');
            expect(result).toBe('hello world');
        });

        test('should execute command with arguments', () => {
            const result = registry.execute('add 5 3');
            expect(result).toBe(8);
        });

        test('should execute command via alias', () => {
            registry.register('test', {
                aliases: ['t'],
                execute: () => 'test executed'
            });
            
            const result = registry.execute('t');
            expect(result).toBe('test executed');
        });

        test('should handle empty command', () => {
            expect(() => {
                registry.execute('');
            }).toThrow('Empty command');
        });

        test('should handle unknown command', () => {
            expect(() => {
                registry.execute('unknown');
            }).toThrow('Unknown command: unknown');
        });

        test('should handle command execution error', () => {
            registry.register('error', {
                execute: () => {
                    throw new Error('Command failed');
                }
            });
            
            expect(() => {
                registry.execute('error');
            }).toThrow('Command execution failed: Command failed');
        });
    });

    describe('Input Parsing', () => {
        test('should parse simple command', () => {
            const parsed = registry.parseInput('help');
            expect(parsed.command).toBe('help');
            expect(parsed.args).toEqual([]);
        });

        test('should parse command with arguments', () => {
            const parsed = registry.parseInput('echo hello world');
            expect(parsed.command).toBe('echo');
            expect(parsed.args).toEqual(['hello', 'world']);
        });

        test('should parse command with quoted arguments', () => {
            const parsed = registry.parseInput('echo "hello world" test');
            expect(parsed.command).toBe('echo');
            expect(parsed.args).toEqual(['hello world', 'test']);
        });

        test('should parse command with single quotes', () => {
            const parsed = registry.parseInput("echo 'hello world' test");
            expect(parsed.command).toBe('echo');
            expect(parsed.args).toEqual(['hello world', 'test']);
        });

        test('should handle empty input', () => {
            const parsed = registry.parseInput('');
            expect(parsed.command).toBeNull();
            expect(parsed.args).toEqual([]);
        });

        test('should handle whitespace-only input', () => {
            const parsed = registry.parseInput('   ');
            expect(parsed.command).toBeNull();
            expect(parsed.args).toEqual([]);
        });
    });

    describe('Completions', () => {
        beforeEach(() => {
            registry.register('help', { execute: () => {} });
            registry.register('hello', { execute: () => {} });
            registry.register('history', { execute: () => {} });
            registry.register('test', { 
                aliases: ['t'],
                execute: () => {},
                getCompletions: (args) => ['option1', 'option2']
            });
        });

        test('should get command completions', () => {
            const completions = registry.getCompletions('he');
            expect(completions).toContain('help');
            expect(completions).toContain('hello');
            expect(completions).not.toContain('history');
        });

        test('should get all commands when no input', () => {
            const completions = registry.getCompletions('');
            expect(completions.length).toBeGreaterThan(0);
            expect(completions).toContain('help');
            expect(completions).toContain('t'); // alias
        });

        test('should get argument completions', () => {
            const completions = registry.getCompletions('test arg');
            expect(completions).toEqual(['option1', 'option2']);
        });

        test('should return empty array for unknown command arguments', () => {
            const completions = registry.getCompletions('help arg');
            expect(completions).toEqual([]);
        });
    });

    describe('Command Information', () => {
        beforeEach(() => {
            registry.register('test1', {
                description: 'Test command 1',
                category: 'testing',
                execute: () => {}
            });
            
            registry.register('test2', {
                description: 'Test command 2',
                category: 'testing',
                hidden: true,
                execute: () => {}
            });
            
            registry.register('help', {
                description: 'Help command',
                usage: 'help [command]',
                aliases: ['h', '?'],
                execute: () => {}
            });
        });

        test('should get command list', () => {
            const list = registry.getCommandList();
            expect(list).toContain('test1');
            expect(list).not.toContain('test2'); // hidden
            expect(list).toContain('TESTING:');
        });

        test('should get command help', () => {
            const help = registry.getCommandHelp('help');
            expect(help).toContain('Command: help');
            expect(help).toContain('Description: Help command');
            expect(help).toContain('Usage: help [command]');
            expect(help).toContain('Aliases: h, ?');
        });

        test('should handle help for unknown command', () => {
            const help = registry.getCommandHelp('unknown');
            expect(help).toBe('Unknown command: unknown');
        });

        test('should get command names', () => {
            const names = registry.getCommandNames();
            expect(names).toContain('test1');
            expect(names).toContain('test2');
            expect(names).toContain('help');
            expect(names).toBeSorted();
        });
    });

    describe('Middleware', () => {
        test('should add and execute middleware', () => {
            const middleware = jest.fn((command, args) => {
                return command !== 'blocked';
            });
            
            registry.addMiddleware(middleware);
            registry.register('test', { execute: () => 'success' });
            registry.register('blocked', { execute: () => 'blocked' });
            
            const result = registry.execute('test');
            expect(result).toBe('success');
            expect(middleware).toHaveBeenCalledWith('test', []);
            
            expect(() => {
                registry.execute('blocked');
            }).toThrow('Command blocked by middleware');
        });
    });

    describe('Cleanup', () => {
        test('should destroy cleanly', () => {
            registry.register('test', { execute: () => {} });
            expect(registry.commands.size).toBeGreaterThan(0);
            
            registry.destroy();
            
            expect(registry.commands.size).toBe(0);
            expect(registry.aliases.size).toBe(0);
            expect(registry.middleware).toEqual([]);
        });
    });
});