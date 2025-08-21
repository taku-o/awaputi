/**
 * Developer Console Tests
 * DeveloperConsole クラスのユニットテスト
 * TypeScript移行 - Task 27対応
 */
import { jest  } from '@jest/globals';
import { JSDOM  } from 'jsdom';
// DOM environment setup''
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global: any).document = dom.window.document;
(global: any).window = dom.window;
// Mock function type
interface MockFunction<T = any> extends Function { mockReturnValue: (value: T) => MockFunction<T>,
    mockImplementation: (impl: Function) => MockFunction<T>;
    toHaveBeenCalledWith: (...args: any[]) => void;
    toHaveBeenCalled: () => void,';'
    mockRestore: () => void,';'
    mockClear: (') => void }'
}'
// Mock ErrorHandler''
jest.mock('../src/utils/ErrorHandler.js', () => ({ getErrorHandler: jest.fn(() => ({ }
        handleError: jest.fn(); }
    ))
));
// Configuration interfaces
interface ConfigurationManager { get: MockFunction<any>,
    set: MockFunction<boolean>;
    getDefault: MockFunction<any>;
    getAll: MockFunction<any>;
    getAllDefaults: MockFunction<any>;
    validate: MockFunction<boolean>;
    validateAll: MockFunction<boolean>;
    });
interface PerformanceOptimizer { getCurrentFPS: MockFunction<number>;
    }
}
// Game engine interface
interface MockGameEngine {
    canvas: { moc,k: string,
    sceneManager: { mock: string,
    inputManager: { mock: string,
    performanceOptimizer: PerformanceOptimizer,
    configurationManager: ConfigurationManager,
// Console interfaces
interface ConsoleState { visible: boolean,
    focused: boolean;
    history: string[];
    historyIndex: number;
    maxHistorySize?: number;
}
interface OutputLine { text: string,
    type: string;
}
interface ConsoleOutput { lines: OutputLine[],
    maxLines: number;
    timestampFormat?: string;
}
interface CommandConfig { description?: string,
    usage?: string;
    aliases?: string[];
    category?: string;
    hidden?: boolean;
    execute: (arg,s: string[]) => any;
    getCompletions?: (arg,s: string[]) => string[] }
}
interface ParsedInput { command: string | null,
    args: string[];
}
interface ConsoleLike { print: MockFunction<void>,
    printError: MockFunction<void>;
}
interface DeveloperConsole { gameEngine: MockGameEngine,
    element: HTMLDivElement;
    inputElement: HTMLInputElement;
    outputElement: HTMLDivElement;
    commandRegistry: CommandRegistry;
    state: ConsoleState;
    output: ConsoleOutput;
    configurationCommands: { destroy: MockFunction<void>,
    show(): void,
    hide(): void;
    toggle(): void;
    print(message: string): void,
    printError(message: string): void,
    printWarning(message: string): void,
    printInfo(message: string): void,
    printSuccess(message: string): void,
    clear(): void;
    formatTimestamp(date: Date): string,
    executeCommand(): void;
    navigateHistory(direction: number): void,
    handleKeyDown(event: KeyboardEvent): void,
    handleTabCompletion(): void;
    updateSettings(settings: any): void,
    getState(): any;
    registerCommand(name: string, config: CommandConfig): boolean,
    unregisterCommand(name: string): boolean,
    execute(command: string): Promise<void>,
    getCommands(): string[];
    getOutput(): any[];
    destroy(): void;
}
interface CommandRegistry { commands: Map<string, CommandConfig>,
    aliases: Map<string, string>;
    middleware: Function[];
    
    register(name: string, config: CommandConfig): boolean;
    unregister(name: string): boolean;
    execute(input: string): any;
    parseInput(input: string): ParsedInput;
    getCompletions(input: string): string[];
    getCommandList(): string;
    getCommandHelp(name: string): string;
    getCommandNames(): string[],'
    addMiddleware(middleware: Function): void,';'
    destroy(' }'
    canvas: { mock: 'canvas' }''
    sceneManager: { mock: 'sceneManager' }')'
    inputManager: { mock: 'inputManager'
            });
    performanceOptimizer: { getCurrentFPS: jest.fn(() => 60) as unknown as MockFunction<number> }
    }),
    configurationManager: { get: jest.fn() as unknown as MockFunction<any>,
        set: jest.fn() as unknown as MockFunction<boolean>,
        getDefault: jest.fn() as unknown as MockFunction<any>,
        getAll: jest.fn() as unknown as MockFunction<any>,
        getAllDefaults: jest.fn() as unknown as MockFunction<any>,
        validate: jest.fn() as unknown as MockFunction<boolean>,
        validateAll: jest.fn() as unknown as MockFunction<boolean> }'
    })', '),';'
// Import after mocking''
const { DeveloperConsole, CommandRegistry } = await import('../../src/debug/DeveloperConsole.js') as unknown as { DeveloperConsole: new (gameEngine: MockGameEngine) => DeveloperConsole,'}'
    CommandRegistry: new (console: ConsoleLike') => CommandRegistry; }'
};
describe('DeveloperConsole', () => {  let devConsole: DeveloperConsole,
    let consoleLogSpy: MockFunction<void>,
    let consoleWarnSpy: MockFunction<void>,','
    let consoleErrorSpy: MockFunction<void>,','
    beforeEach((') => { }'
        // Console spies' }'
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {}') as unknown as MockFunction<void>;'
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {}') as unknown as MockFunction<void>;'
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}') as unknown as MockFunction<void>;'
        // Reset DOM''
        document.body.innerHTML = ';'
        // Reset mocks
        jest.clearAllMocks();
        // Create instance
        devConsole = new DeveloperConsole(mockGameEngine);
    });
    afterEach(() => {  if (devConsole) { }
            devConsole.destroy(); }
        }
        // Restore console
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();'
        consoleErrorSpy.mockRestore();'}');
    describe('Initialization', (') => {  ''
        test('should initialize with default values', () => {
            expect(devConsole.gameEngine).toBe(mockGameEngine),
            expect(devConsole.element).toBeDefined(),
            expect(devConsole.inputElement).toBeDefined(),
            expect(devConsole.outputElement).toBeDefined() }'
            expect(devConsole.commandRegistry).toBeDefined();' }'
        }');'
        test('should create DOM elements', () => {  ''
            expect(devConsole.element.className').toBe('developer-console'),'
            expect(devConsole.outputElement.className').toBe('console-output'),'
            expect(devConsole.inputElement.className').toBe('console-input') }'
            expect(devConsole.element.parentNode).toBe(document.body););' }'
        }');'
        test('should have correct initial state', () => {  expect(devConsole.state.visible).toBe(false),
            expect(devConsole.state.focused).toBe(false),
            expect(devConsole.state.history).toEqual([]) }'
            expect(devConsole.state.historyIndex).toBe(-1););' }'
        }');'
        test('should be initially hidden', () => { }'
            expect(devConsole.element.style.display').toBe('none'););' }'
        }');'
        test('should register default commands', () => {  const commandNames: string[] = devConsole.commandRegistry.getCommandNames(),''
            expect(commandNames').toContain('help'),'
            expect(commandNames').toContain('clear'),'
            expect(commandNames').toContain('history'),'
            expect(commandNames').toContain('echo'),'
            expect(commandNames').toContain('date'),' }'
            expect(commandNames').toContain('engine');' }'
        }');'
    }''
    describe('Display Control', (') => {  ''
        test('should show console', () => {'
            devConsole.show(),
            expect(devConsole.element.style.display').toBe('block') }'
            expect(devConsole.state.visible).toBe(true););' }'
        }');'
        test('should hide console', () => {  devConsole.show(),'
            devConsole.hide(),
            expect(devConsole.element.style.display').toBe('none') }'
            expect(devConsole.state.visible).toBe(false););' }'
        }');'
        test('should toggle console visibility', () => {  expect(devConsole.state.visible).toBe(false),
            devConsole.toggle(),
            expect(devConsole.state.visible).toBe(true),
            devConsole.toggle() }'
            expect(devConsole.state.visible).toBe(false););' }'
        }');'
        test('should focus input when shown', (') => {  ''
            const focusSpy = jest.spyOn(devConsole.inputElement, 'focus'),
            devConsole.show() }'
            expect(focusSpy.toHaveBeenCalled();' }'
        }');'
    }''
    describe('Output System', (') => {  ''
        test('should print normal text', (') => {''
            devConsole.print('Test message'),'
            expect(devConsole.output.lines).toHaveLength(6), // 5 welcome messages + 1 test message''
            expect(devConsole.output.lines[5].text').toBe('Test message'),' }'
            expect(devConsole.output.lines[5].type').toBe('normal'););' }'
        }');'
        test('should print different message types', (') => {  ''
            devConsole.printError('Error message'),
            devConsole.printWarning('Warning message'),
            devConsole.printInfo('Info message'),
            devConsole.printSuccess('Success message'),'
            const lines: OutputLine[] = devConsole.output.lines,','
            expect(lines[lines.length - 4].type').toBe('error'),'
            expect(lines[lines.length - 3].type').toBe('warning'),'
            expect(lines[lines.length - 2].type').toBe('info'),' }'
            expect(lines[lines.length - 1].type').toBe('success'););' }'
        }');'
        test('should limit output lines', (') => {  devConsole.output.maxLines = 3,', ','
            devConsole.print('Line 1'),
            devConsole.print('Line 2'),
            devConsole.print('Line 3'),
            devConsole.print('Line 4'),'
            expect(devConsole.output.lines).toHaveLength(3),
            expect(devConsole.output.lines[0].text').toBe('Line 2'),' }'
            expect(devConsole.output.lines[2].text').toBe('Line 4'););' }'
        }');'
        test('should escape HTML in output', (') => {  ''
            devConsole.print('<script>alert("xss"")</script>'),'"'
            const html: string = devConsole.outputElement.innerHTML,','
            expect(html.toContain('&lt,script&gt,'),' }'
            expect(html').not.toContain('<script>');' }'
        }');'
        test('should clear output', (') => {  ''
            devConsole.print('Test message'),
            expect(devConsole.output.lines.length).toBeGreaterThan(0),
            devConsole.clear(),'
            expect(devConsole.output.lines).toHaveLength(0),' }'
            expect(devConsole.outputElement.innerHTML').toBe('););' }'
        }');'
        test('should format timestamps', (') => { }'
            const date = new Date('2023-01-01T12: 34:56Z') };
            const formatted: string = devConsole.formatTimestamp(date});'
            expect(formatted.toMatch(/^\d{2}:\d{2}:\d{2}$/);'}');'
    }''
    describe('Command Execution', (') => {  ''
        test('should execute help command', (') => {''
            devConsole.inputElement.value = 'help',
            devConsole.executeCommand(),'
            const lastLine: OutputLine = devConsole.output.lines[devConsole.output.lines.length - 1],' }'
            expect(lastLine.text').toContain('Available commands');' }'
        }');'
        test('should execute clear command', (') => {  ''
            devConsole.print('Test message'),
            devConsole.inputElement.value = 'clear',
            devConsole.executeCommand() }'
            expect(devConsole.output.lines).toHaveLength(0);' }'
        }');'
        test('should execute echo command', (') => {  ''
            devConsole.inputElement.value = 'echo Hello World',
            devConsole.executeCommand(),'
            const lastLine: OutputLine = devConsole.output.lines[devConsole.output.lines.length - 1],' }'
            expect(lastLine.text').toBe('Hello World'););' }'
        }');'
        test('should execute date command', (') => { }'
            devConsole.inputElement.value = 'date'; }
            devConsole.executeCommand(};)
            );
            const lastLine: OutputLine = devConsole.output.lines[devConsole.output.lines.length - 1]),';'
            expect(lastLine.text).toMatch(/\d{ 4)/), // Should contain year' }'
        }');'
        test('should execute engine command', (') => {  ''
            devConsole.inputElement.value = 'engine',
            devConsole.executeCommand(),'
            const lastLine: OutputLine = devConsole.output.lines[devConsole.output.lines.length - 1],' }'
            expect(lastLine.text').toContain('Game Engine Information');' }'
        }');'
        test('should handle unknown command', (') => {  ''
            devConsole.inputElement.value = 'unknown',
            devConsole.executeCommand(),'
            const lastLine: OutputLine = devConsole.output.lines[devConsole.output.lines.length - 1],','
            expect(lastLine.text').toContain('Unknown command'),' }'
            expect(lastLine.type').toBe('error'););' }'
        }');'
        test('should handle empty command', (') => {  ''
            devConsole.inputElement.value = ','
            devConsole.executeCommand(),
            // Should not add anything to output or history }'
            expect(devConsole.state.history).toHaveLength(0);' }'
        }');'
        test('should handle command execution errors', (') => {  ''
            devConsole.commandRegistry.register('error-command', {),
                execute: (') => { }'
                    throw new Error('Test error') }'
                }'}');
            devConsole.inputElement.value = 'error-command';
            devConsole.executeCommand();'
            const lastLine: OutputLine = devConsole.output.lines[devConsole.output.lines.length - 1],';'
            expect(lastLine.text').toContain('Command error');'
            expect(lastLine.type').toBe('error');'}');'
    }''
    describe('Command History', (') => {  ''
        test('should add commands to history', (') => {''
            devConsole.inputElement.value = 'test command','
            devConsole.executeCommand(),' }'
            expect(devConsole.state.history').toContain('test command');' }'
        }');'
        test('should navigate history with arrow keys', (') => {  ''
            devConsole.inputElement.value = 'command1',
            devConsole.executeCommand(')',
            devConsole.inputElement.value = 'command2')
            devConsole.executeCommand(),
            // Navigate up (to previous command),'
            devConsole.navigateHistory(-1),
            expect(devConsole.inputElement.value').toBe('command2'),'
            devConsole.navigateHistory(-1),
            expect(devConsole.inputElement.value').toBe('command1'),'
            // Navigate down (to next command),'
            devConsole.navigateHistory(1),' }'
            expect(devConsole.inputElement.value').toBe('command2'););' }'
        }');'
        test('should limit history size', (') => {  devConsole.state.maxHistorySize = 3,', ','
            devConsole.inputElement.value = 'command1',
            devConsole.executeCommand('',
            devConsole.inputElement.value = 'command2',
            devConsole.executeCommand('',
            devConsole.inputElement.value = 'command3',')'
            devConsole.executeCommand(')',
            devConsole.inputElement.value = 'command4')
            devConsole.executeCommand(),'
            expect(devConsole.state.history).toHaveLength(3),
            expect(devConsole.state.history[0]').toBe('command2'),' }'
            expect(devConsole.state.history[2]').toBe('command4'););' }'
        }');'
        test('should remove duplicate history entries', (') => {  ''
            devConsole.inputElement.value = 'same command',
            devConsole.executeCommand('}')
            devConsole.inputElement.value = 'same command'; })'
            devConsole.executeCommand(}')', ');'
            expect(devConsole.state.history.filter(cmd => cmd === 'same command').toHaveLength(1');'
        }''
        test('should show command history', (') => {  ''
            devConsole.inputElement.value = 'command1',
            devConsole.executeCommand('',
            devConsole.inputElement.value = 'command2',')'
            devConsole.executeCommand(')',
            devConsole.inputElement.value = 'history')
            devConsole.executeCommand(),'
            const lastLine: OutputLine = devConsole.output.lines[devConsole.output.lines.length - 1],','
            expect(lastLine.text').toContain('command1'),' }'
            expect(lastLine.text').toContain('command2');' }'
        }');'
    }''
    describe('Keyboard Shortcuts', (') => { }'
        test('should handle F12 key to toggle console', (') => { }'
            const event = new KeyboardEvent('keydown', { key: 'F12' }');'
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
            document.dispatchEvent(event);
            expect(preventDefaultSpy.toHaveBeenCalled();'
            expect(devConsole.state.visible).toBe(true);'}');
        test('should handle Ctrl+Shift+C to toggle console', (') => {  ''
            const event = new KeyboardEvent('keydown', { '),'
                key: 'C'),
                ctrlKey: true) }'
                shiftKey: true' }'
            }');'
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
            document.dispatchEvent(event);
            expect(preventDefaultSpy.toHaveBeenCalled();'
            expect(devConsole.state.visible).toBe(true);'}');
        test('should handle Escape key to hide console', () => {  }'
            devConsole.show(}')', ');'
            const event = new KeyboardEvent('keydown', { key: 'Escape' }');'
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
            document.dispatchEvent(event);
            expect(preventDefaultSpy.toHaveBeenCalled();'
            expect(devConsole.state.visible).toBe(false);'}');
        test('should handle Enter key to execute command', (') => { }'
            devConsole.inputElement.value = 'echo test'; }'
            const event = new KeyboardEvent('keydown', { key: 'Enter' }');'
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
            devConsole.handleKeyDown(event);'
            expect(preventDefaultSpy.toHaveBeenCalled();
            expect(devConsole.inputElement.value').toBe(');
            expect(devConsole.state.history').toContain('echo test');'}');'
        test('should handle Tab key for completion', (') => { }'
            devConsole.inputElement.value = 'hel'; }'
            const event = new KeyboardEvent('keydown', { key: 'Tab' }');'
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
            devConsole.handleKeyDown(event);'
            expect(preventDefaultSpy.toHaveBeenCalled();
            expect(devConsole.inputElement.value').toBe('help');'}');'
    }''
    describe('Tab Completion', (') => {  ''
        test('should complete single command', (') => {''
            devConsole.inputElement.value = 'hel','
            devConsole.handleTabCompletion(),' }'
            expect(devConsole.inputElement.value').toBe('help'););' }'
        }');'
        test('should show multiple completions', (') => {  ''
            devConsole.inputElement.value = 'h' }'
            devConsole.handleTabCompletion();' }'
            const lastLines: OutputLine[] = devConsole.output.lines.slice(-3}');'
            expect(lastLines.some(line => line.text.includes('Available completions')}).toBe(true');'
        }''
        test('should handle no completions', (') => {  ''
            devConsole.inputElement.value = 'xyz',
            const originalLines = devConsole.output.lines.length,
            
            devConsole.handleTabCompletion() }'
            expect(devConsole.output.lines.length).toBe(originalLines););' }'
        }');'
    }''
    describe('Settings and Configuration', (') => {  ''
        test('should update settings', (') => {'
            const newSettings = {
                maxHistorySize: 50,','
                maxOutputLines: 200,','
                timestampFormat: 'HH:mm'
            }'
                styles: { }'
                    console: { backgroundColor: 'red' }
                }
            },
            
            devConsole.updateSettings(newSettings);
            expect(devConsole.state.maxHistorySize).toBe(50);'
            expect(devConsole.output.maxLines).toBe(200);
            expect(devConsole.output.timestampFormat').toBe('HH: mm'),';
            expect(devConsole.element.style.backgroundColor').toBe('red');'}');'
        test('should get console state', () => {  const state = devConsole.getState(),
            expect(state.visible).toBeDefined(),
            expect(state.focused).toBeDefined(),
            expect(state.historySize).toBeDefined(),
            expect(state.outputLines).toBeDefined(),
            expect(state.availableCommands).toBeDefined() }
            expect(Array.isArray(state.availableCommands).toBe(true); }'
        }'}');
    describe('Custom Commands', (') => {  ''
        test('should register custom command', (') => {''
            const result: boolean = devConsole.registerCommand('test', {') }'
                description: 'Test command'),' }'
                execute: (args: string[]') => `Test result: ${args.join(', '})}`'
            }),'
            expect(result).toBe(true);
            expect(devConsole.commandRegistry.getCommandNames()').toContain('test');'}');'
        test('should execute custom command', (') => {  ''
            devConsole.registerCommand('custom', {') }'
                description: 'Custom command') }'
                execute: (args: string[]) => `Custom: ${args[0]}`'}');
            devConsole.inputElement.value = 'custom arg1';
            devConsole.executeCommand();'
            const lastLine: OutputLine = devConsole.output.lines[devConsole.output.lines.length - 1],';'
            expect(lastLine.text').toBe('Custom: arg1'),';
        }');'
        test('should unregister command', (') => {  ''
            devConsole.registerCommand('temp', {),' }'
                execute: (') => 'temp' }'
            });
            expect(devConsole.commandRegistry.getCommandNames()').toContain('temp');'
            const result: boolean = devConsole.unregisterCommand('temp'),';'
            expect(result).toBe(true);
            expect(devConsole.commandRegistry.getCommandNames()').not.toContain('temp');'}');'
    }''
    describe('Cleanup', (') => {  ''
        test('should destroy cleanly', () => {
            const element = devConsole.element,
            expect(element.parentNode).toBe(document.body),
            devConsole.destroy() }'
            expect(element.parentNode).toBeNull();' }'
        }');'
        test('should log destruction', () => {  ''
            devConsole.destroy(') }'
            expect(consoleLogSpy.toHaveBeenCalledWith('[DeveloperConsole] Destroyed'); }
        });'
    }'}');
describe('CommandRegistry', () => {  let registry: CommandRegistry,
    let mockConsole: ConsoleLike,
    beforeEach(() => {
        mockConsole = {
            print: jest.fn() as unknown as MockFunction<void> }
            printError: jest.fn() as unknown as MockFunction<void> }
        },
        registry = new CommandRegistry(mockConsole);
    });
    afterEach(() => {  if (registry) { }
            registry.destroy(); }'
        }'}');
    describe('Command Registration', (') => {  ''
        test('should register command', (') => {''
            const result: boolean = registry.register('test', {')'
                description: 'Test command'),' }'
                execute: (') => 'test result' }'
            });
            expect(result).toBe(true');'
            expect(registry.commands.has('test').toBe(true);'}');
        test('should register command with aliases', (') => {  ''
            registry.register('test', {')'
                description: 'Test command',')',
                aliases: ['t', 'tst']),' }'
                execute: (') => 'test result' }'
            }');'
            expect(registry.aliases.get('t')').toBe('test');'
            expect(registry.aliases.get('tst')').toBe('test');'}');'
        test('should fail to register invalid command', () => { }'
            expect((') => { }'
                registry.register('invalid', { description: 'No execute function' } as any);'}').toThrow('Invalid command configuration');'
        }''
        test('should unregister command', (') => {  ''
            registry.register('temp', {')'
                aliases: ['tmp']),' }'
                execute: (') => 'temp' }'
            }');'
            expect(registry.commands.has('temp').toBe(true');'
            expect(registry.aliases.has('tmp').toBe(true');'
            const result: boolean = registry.unregister('temp'),';'
            expect(result).toBe(true');'
            expect(registry.commands.has('temp').toBe(false');'
            expect(registry.aliases.has('tmp').toBe(false);'}');
        test('should fail to unregister non-existent command', (') => {  ''
            const result: boolean = registry.unregister('nonexistent') }'
            expect(result).toBe(false););' }'
        }');'
    }''
    describe('Command Execution', () => {  ''
        beforeEach((') => { }'
            registry.register('echo', {),' }'
                execute: (args: string[]') => args.join(', '}'),'
            }''
            registry.register('add', { ),
                execute: (args: string[]) => {  }
                    const a = parseInt(args[0]) };
                    const b = parseInt(args[1]};
                    return a + b;)
                }')'
            }');'
        }''
        test('should execute simple command', (') => {  ''
            const result: string = registry.execute('echo hello world'),' }'
            expect(result').toBe('hello world'););' }'
        }');'
        test('should execute command with arguments', (') => {  ''
            const result: number = registry.execute('add 5 3') }'
            expect(result).toBe(8););' }'
        }');'
        test('should execute command via alias', (') => {  ''
            registry.register('test', {')'
                aliases: ['t']),' }'
                execute: (') => 'test executed' }'
            }');'
            const result: string = registry.execute('t'),';'
            expect(result').toBe('test executed');'}');'
        test('should handle empty command', () => { }'
            expect((') => { }'
                registry.execute('});'}').toThrow('Empty command');'
        }''
        test('should handle unknown command', () => { }'
            expect((') => { }'
                registry.execute('unknown'});'}').toThrow('Unknown command: unknown'),'
        }''
        test('should handle command execution error', (') => {  ''
            registry.register('error', {),
                execute: (') => { }'
                    throw new Error('Command failed') }
                }'
            });
            expect((') => { }'
                registry.execute('error'});'}').toThrow('Command execution failed: Command failed'),'
        }'}');
    describe('Input Parsing', (') => {  ''
        test('should parse simple command', (') => {''
            const parsed: ParsedInput = registry.parseInput('help'),','
            expect(parsed.command').toBe('help') }'
            expect(parsed.args).toEqual([]);' }'
        }');'
        test('should parse command with arguments', (') => {  ''
            const parsed: ParsedInput = registry.parseInput('echo hello world'),','
            expect(parsed.command').toBe('echo'),' }'
            expect(parsed.args').toEqual(['hello', 'world']);' }'
        }');'
        test('should parse command with quoted arguments', (') => {  ''
            const parsed: ParsedInput = registry.parseInput('echo "hello world" test'),','
            expect(parsed.command').toBe('echo'),' }'
            expect(parsed.args').toEqual(['hello world', 'test']);' }'
        }');'
        test('should parse command with single quotes', (') => {  ''
            const parsed: ParsedInput = registry.parseInput("echo 'hello world' test"),"",
            expect(parsed.command").toBe('echo'),' }'"
            expect(parsed.args').toEqual(['hello world', 'test']);' }'
        }');'
        test('should handle empty input', (') => {  ''
            const parsed: ParsedInput = registry.parseInput(','
            expect(parsed.command).toBeNull() }'
            expect(parsed.args).toEqual([]);' }'
        }');'
        test('should handle whitespace-only input', (') => {  ''
            const parsed: ParsedInput = registry.parseInput(', '),
            expect(parsed.command).toBeNull() }'
            expect(parsed.args).toEqual([]);' }'
        }');'
    }''
    describe('Completions', () => { }'
        beforeEach((') => { }'
            registry.register('help', { execute: () => {} }');'
            registry.register('hello', { execute: () => {} }');'
            registry.register('history', { execute: () => {} }');'
            registry.register('test', { ')'
                aliases: ['t']) }'
                execute: () => {},''
                getCompletions: (__args: string[]') => ['option1', 'option2']';
            }');'
        }''
        test('should get command completions', (') => {  ''
            const completions: string[] = registry.getCompletions('he'),','
            expect(completions').toContain('help'),'
            expect(completions').toContain('hello'),' }'
            expect(completions').not.toContain('history');' }'
        }');'
        test('should get all commands when no input', (') => {  ''
            const completions: string[] = registry.getCompletions('),',
            expect(completions.length).toBeGreaterThan(0),
            expect(completions').toContain('help'),' }'
            expect(completions').toContain('t'); // alias' }'
        }');'
        test('should get argument completions', (') => { }'
            const completions: string[] = registry.getCompletions('test arg'),' }'
            expect(completions').toEqual(['option1', 'option2']});'}');'
        test('should return empty array for unknown command arguments', (') => {  ''
            const completions: string[] = registry.getCompletions('help arg') }'
            expect(completions).toEqual([]); }'
        }');'
    }''
    describe('Command Information', () => {  ''
        beforeEach((') => {''
            registry.register('test1', {')'
                description: 'Test command 1',') }'
                category: 'testing') }'
                execute: () => {}'}');
            registry.register('test2', { ')'
                description: 'Test command 2',')',
                category: 'testing'),
                hidden: true) }'
                execute: () => {}'}');
            registry.register('help', { ')'
                description: 'Help command',')',
                usage: 'help [command]',')',
                aliases: ['h', '? ']), : undefined;'
                execute: () => {}'}'),'
        }''
        test('should get command list', () => {  const list: string = registry.getCommandList(),''
            expect(list').toContain('test1'),'
            expect(list').not.toContain('test2'), // hidden' }'
            expect(list').toContain('TESTING: '),' }'
        }');'
        test('should get command help', (') => {  ''
            const help: string = registry.getCommandHelp('help'),','
            expect(help').toContain('Command: help'),',
            expect(help').toContain('Description: Help command'),',
            expect(help').toContain('Usage: help [command]'),' }'
            expect(help').toContain('Aliases: h, ? ');' }'
        }');'
        test('should handle help for unknown command', (') => {  : undefined''
            const help: string = registry.getCommandHelp('unknown'),' }'
            expect(help').toBe('Unknown command: unknown'););' }'
        }');'
        test('should get command names', () => {  const names: string[] = registry.getCommandNames(),''
            expect(names').toContain('test1'),'
            expect(names').toContain('test2'),'
            expect(names').toContain('help'),'
            // Check if array is sorted }'
            const sortedNames = [...names].sort();' }'
            expect(names).toEqual(sortedNames})');'
    }''
    describe('Middleware', (') => {  ''
        test('should add and execute middleware', () => {''
            const middleware = jest.fn((command: string, __args: string[]') => {',
                return command !== 'blocked','),' }'
            registry.addMiddleware(middleware'); }'
            registry.register('test', { execute: (') => 'success' )}');
            registry.register('blocked', { execute: (') => 'blocked' }');
            const result: string = registry.execute('test'),';'
            expect(result').toBe('success');'
            expect(middleware.toHaveBeenCalledWith('test', []);
            expect((') => { }'
                registry.execute('blocked');' }'
            }').toThrow('Command blocked by middleware');'
        }'}');
    describe('Cleanup', (') => { }'
        test('should destroy cleanly', (') => { }'
            registry.register('test', { execute: () => {} });
            expect(registry.commands.size).toBeGreaterThan(0);
            registry.destroy();
            expect(registry.commands.size).toBe(0);
            expect(registry.aliases.size).toBe(0);'
            expect(registry.middleware).toEqual([]);'}');'
    }''
    describe('Configuration Commands Integration', (') => {  ''
        test('should register configuration commands', async () => {
            const devConsole = new DeveloperConsole(mockGameEngine),
            // Check that config commands are registered'
            const commands: string[] = devConsole.getCommands(),','
            expect(commands').toContain('config.get'),'
            expect(commands').toContain('config.set'),'
            expect(commands').toContain('config.reset'),'
            expect(commands').toContain('config.list'),'
            expect(commands').toContain('config.validate'),'
            expect(commands').toContain('config.export'),'
            expect(commands').toContain('config.import'),'
            expect(commands').toContain('config.history'),'
            expect(commands').toContain('config.revert'),'
            expect(commands').toContain('config.diff'),' }'
            expect(commands').toContain('config.template');' }'
        }');'
        test('should execute config.get command', async () => {  mockGameEngine.configurationManager.get.mockReturnValue(25),
            const devConsole = new DeveloperConsole(mockGameEngine'),'
            await devConsole.execute('config.get game.scoring.baseScores.normal'),
            expect(mockGameEngine.configurationManager.get').toHaveBeenCalledWith('game.scoring.baseScores.normal') }'
            const output = devConsole.getOutput();' }'
            expect(output.some((line: any') => line.message.includes('game.scoring.baseScores.normal = 25')}).toBe(true');'
        }''
        test('should execute config.set command', async () => {  mockGameEngine.configurationManager.get.mockReturnValue(10), // original value'
            mockGameEngine.configurationManager.set.mockReturnValue(true),
            const devConsole = new DeveloperConsole(mockGameEngine'),'
            await devConsole.execute('config.set game.scoring.baseScores.normal 25'),', ',
            expect(mockGameEngine.configurationManager.set').toHaveBeenCalledWith(')','
                'game.scoring.baseScores.normal'),
                25,
                { validate: true, saveToStorage: false )
            ),'
            const output = devConsole.getOutput(),' }'
            expect(output.some((line: any') => line.message.includes('Set game.scoring.baseScores.normal = 25')).toBe(true);' }'
        }');'
        test('should execute config.template command', async () => {  mockGameEngine.configurationManager.get.mockReturnValue(30), // original value'
            mockGameEngine.configurationManager.set.mockReturnValue(true),
            const devConsole = new DeveloperConsole(mockGameEngine'),'
            await devConsole.execute('config.template development'),
            ','
            // development テンプレートの設定が適用されることを確認''
            expect(mockGameEngine.configurationManager.set').toHaveBeenCalledWith(')','
                'performance.targetFPS'),
                60,
                { validate: true, saveToStorage: false )'
            ),
            expect(mockGameEngine.configurationManager.set').toHaveBeenCalledWith(')','
                'debug.enabled'),
                true,
                { validate: true, saveToStorage: false )
            ),'
            const output = devConsole.getOutput(),' }'
            expect(output.some((line: any') => line.message.includes("Applied template 'development'")).toBe(true);" }"'
        }");"""
        test('should handle config command errors gracefully', async () => {  ''
            mockGameEngine.configurationManager.set.mockImplementation((') => { }'
                throw new Error('Validation failed'); }'
            });
            const devConsole = new DeveloperConsole(mockGameEngine');'
            await devConsole.execute('config.set invalid.path invalidValue');'
            const output = devConsole.getOutput();
            expect(output.some((line: any') => ';
                line.type === 'result' && ';'
                line.message.includes('Error setting configuration: Validation failed')).toBe(true);'}');
        test('should clean up configuration commands on destroy', () => {  ''
            const devConsole = new DeveloperConsole(mockGameEngine'),'
            const destroySpy = jest.spyOn(devConsole.configurationCommands as any, 'destroy'),
            devConsole.destroy() }
            expect(destroySpy.toHaveBeenCalled(); }
        });'
    }'}');