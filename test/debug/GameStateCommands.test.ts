/**
 * Game State Commands Tests
 * GameStateCommands クラスのユニットテスト
 */
import { jest  } from '@jest/globals';
// DOM environment setup''
import { JSDOM  } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global: any).document = dom.window.document;
(global: any).window = dom.window;
(global: any).localStorage = dom.window.localStorage;'
(global: any).performance = { ''
    now: jest.fn(() => Date.now()'),',
// Mock ErrorHandler''
jest.mock('../src/utils/ErrorHandler.js', () => ({ getErrorHandler: jest.fn(() => ({ }
        handleError: jest.fn(), }
    ))
));
// Mock game engine and components
const mockGameEngine = { isRunning: false,
    isPaused: false,
    pause: jest.fn(
    resume: jest.fn(),','
    reset: jest.fn(),','
    stop: jest.fn(')',
       , currentScene: 'game') }
    ),
    performanceOptimizer: { getCurrentFPS: jest.fn(() => 60) }
    ),
    scoreManager: { getScore: jest.fn(() => 1500,
        setScore: jest.fn(
        getCurrentCombo: jest.fn(() => 3,
        resetCombo: jest.fn()),
    bubbleManager: {
        getActiveBubbleCount: jest.fn(() => 25,
        spawnBubble: jest.fn(
        clearAllBubbles: jest.fn(
        getBubbleCountByType: jest.fn(() => ({
            normal: 15,
            stone: 5,
            rainbow: 3),
           , boss: 2 }
            });
    ),';'
    playerData: { ''
        getName: jest.fn((') => 'TestPlayer','
        getLevel: jest.fn(() => 5,
        getAP: jest.fn(() => 2500,
        getTAP: jest.fn(() => 15000,
        getHighScore: jest.fn(() => 12000,
        setAP: jest.fn(
        setLevel: jest.fn(
        reset: jest.fn()),','
    stageManager: {''
        getCurrentStage: jest.fn((') => 'normal'),',
        setCurrentStage: jest.fn(),','
        getDifficulty: jest.fn((') => 'normal'),',
        setDifficulty: jest.fn(),','
        getAvailableStages: jest.fn((') => ['tutorial', 'normal', 'hard', 'expert', 'boss']) }'
            });
);
// Mock console
const mockConsole = { registerCommand: jest.fn(),','
        print: jest.fn()','
'),',
// Import after mocking' }'
const { GameStateCommands } = await import('../../src/debug/GameStateCommands.js');
describe('GameStateCommands', () => {  let gameStateCommands: any,
    let consoleLogSpy: any,','
    let consoleWarnSpy: any,','
    beforeEach((') => { }'
        // Console spies' }'
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {}');'
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        // Reset mocks
        jest.clearAllMocks();
        // Create instance
        gameStateCommands = new GameStateCommands(mockGameEngine, mockConsole);
    });
    afterEach(() => {  if (gameStateCommands) { }
            gameStateCommands.destroy(); }
        }
        // Restore console
        consoleLogSpy.mockRestore();'
        consoleWarnSpy.mockRestore();'}');
    describe('Initialization', (') => {  ''
        test('should initialize with game engine and console', () => {
            expect(gameStateCommands.gameEngine).toBe(mockGameEngine: any),
            expect(gameStateCommands.console).toBe(mockConsole),
            expect(gameStateCommands.executionState).toBeDefined() }'
            expect(gameStateCommands.safetyChecks).toBeDefined();' }'
        }');'
        test('should register all command categories', () => {  expect(mockConsole.registerCommand).toHaveBeenCalledTimes(23), // Total commands registered
            ','
            // Check some key commands are registered''
            const registeredCommands = mockConsole.registerCommand.mock.calls.map(call => call[0]'),'
            expect(registeredCommands.toContain('pause'),
            expect(registeredCommands.toContain('resume'),
            expect(registeredCommands.toContain('reset'),
            expect(registeredCommands.toContain('set-score'),
            expect(registeredCommands.toContain('spawn-bubble'),' }'
            expect(registeredCommands.toContain('player-info');' }'
        }');'
        test('should setup safety checks', () => {  expect(gameStateCommands.safetyChecks.confirmDestructive).toBe(true),
            expect(gameStateCommands.safetyChecks.preventDataLoss).toBe(true),
            expect(gameStateCommands.safetyChecks.validateInputs).toBe(true) }'
            expect(gameStateCommands.safetyChecks.logAllChanges).toBe(true););' }'
        }');'
    }''
    describe('Game Control Commands', () => {  let pauseCommand, resumeCommand, resetCommand, statusCommand,
        beforeEach(() => { }
            // Extract registered commands }
            const commands: Record<string, any> = {};
            mockConsole.registerCommand.mock.calls.forEach(([name, config]) => { commands[name] = config }
            });
            pauseCommand = commands.pause;
            resumeCommand = commands.resume;
            resetCommand = commands.reset;'
            statusCommand = commands.status;'}');
        test('should pause game', () => {  mockGameEngine.isPaused = false,
            
            const result = pauseCommand.execute([]),'
            expect(mockGameEngine.pause).toHaveBeenCalled(),' }'
            expect(result').toBe('Game paused'););' }'
        }');'
        test('should handle already paused game', () => {  mockGameEngine.isPaused = true,
            
            const result = pauseCommand.execute([]),'
            expect(mockGameEngine.pause).not.toHaveBeenCalled(),' }'
            expect(result').toBe('Game is already paused'););' }'
        }');'
        test('should resume game', () => {  mockGameEngine.isPaused = true,
            
            const result = resumeCommand.execute([]),'
            expect(mockGameEngine.resume).toHaveBeenCalled(),' }'
            expect(result').toBe('Game resumed'););' }'
        }');'
        test('should handle game not paused', () => {  mockGameEngine.isPaused = false,
            
            const result = resumeCommand.execute([]),'
            expect(mockGameEngine.resume).not.toHaveBeenCalled(),' }'
            expect(result').toBe('Game is not paused'););' }'
        }');'
        test('should require confirmation for reset', () => {  const result = resetCommand.execute([]),
            expect(result').toContain('Use "reset --confirm" to proceed') }'
            expect(mockGameEngine.reset).not.toHaveBeenCalled();' }'
        }');'
        test('should reset game with confirmation', (') => {  ''
            const result = resetCommand.execute(['--confirm']),'
            expect(mockGameEngine.reset).toHaveBeenCalled(),' }'
            expect(result').toBe('Game reset successfully'););' }'
        }');'
        test('should show game status', () => {  mockGameEngine.isRunning = true,
            mockGameEngine.isPaused = false,
            ','
            const result = statusCommand.execute([]),
            expect(result').toContain('Game Status'),'
            expect(result').toContain('Running: true'),',
            expect(result').toContain('Paused: false'),',
            expect(result').toContain('Current Scene: game'),' }'
            expect(result').toContain('FPS: 60'),' }'
        }');'
        test('should handle missing game engine', () => {  gameStateCommands.gameEngine = null,
            ','
            const result = pauseCommand.execute([]),' }'
            expect(result').toBe('Game engine not available'););' }'
        }');'
    }''
    describe('Score Commands', () => {  let setScoreCommand, addScoreCommand, resetComboCommand, highScoreCommand }
        beforeEach(() => { }
            const commands: Record<string, any> = {};'
            mockConsole.registerCommand.mock.calls.forEach(([name, config]) => { commands[name] = config,' }'
            }');'
            setScoreCommand = commands['set-score'];
            addScoreCommand = commands['add-score'];
            resetComboCommand = commands['reset-combo'];
            highScoreCommand = commands['high-score'];'}');
        test('should set score', (') => {  ''
            const result = setScoreCommand.execute(['5000']),'
            expect(mockGameEngine.scoreManager.setScore).toHaveBeenCalledWith(5000),
            expect(result').toContain('Score set to 5000'),' }'
            expect(result').toContain('was 1500');' }'
        }');'
        test('should validate score input', () => {  let result = setScoreCommand.execute([]),
            expect(result').toBe('Usage: set-score <value>'),',
            result = setScoreCommand.execute(['invalid']),
            expect(result').toBe('Invalid score value'),'
            result = setScoreCommand.execute(['-100']),' }'
            expect(result').toBe('Invalid score value'););' }'
        }');'
        test('should add to score', (') => {  ''
            const result = addScoreCommand.execute(['1000']),'
            expect(mockGameEngine.scoreManager.setScore).toHaveBeenCalledWith(2500), // 1500 + 1000''
            expect(result').toContain('Added 1000 to score'),' }'
            expect(result').toContain('1500 → 2500');' }'
        }');'
        test('should handle negative addition', (') => {  ''
            const result = addScoreCommand.execute(['-2000']) }'
            expect(mockGameEngine.scoreManager.setScore).toHaveBeenCalledWith(0); // Max(0, 1500 - 2000);' }'
        }');'
        test('should reset combo', () => {  const result = resetComboCommand.execute([]),'
            expect(mockGameEngine.scoreManager.resetCombo).toHaveBeenCalled(),
            expect(result').toContain('Combo reset'),' }'
            expect(result').toContain('was 3');' }'
        }');'
        test('should show high score', () => {  const result = highScoreCommand.execute([]),
            expect(result').toContain('High Score: 12000'),' }'
            expect(result').toContain('Current Score: 1500'),' }'
        }');'
        test('should provide score completions', () => {  ''
            const completions = setScoreCommand.getCompletions([]'),'
            expect(completions.toContain('1000'),
            expect(completions.toContain('5000'),
            expect(completions.toContain('10000'),' }'
            expect(completions.toContain('50000');' }'
        }');'
    }''
    describe('Bubble Commands', () => {  let spawnBubbleCommand, clearBubblesCommand, bubbleInfoCommand }
        beforeEach(() => { }
            const commands: Record<string, any> = {};'
            mockConsole.registerCommand.mock.calls.forEach(([name, config]) => { commands[name] = config,' }'
            }');'
            spawnBubbleCommand = commands['spawn-bubble'];
            clearBubblesCommand = commands['clear-bubbles'];
            bubbleInfoCommand = commands['bubble-info'];'}');
        test('should spawn bubbles', (') => {  ''
            const result = spawnBubbleCommand.execute(['normal', '5']),'
            expect(mockGameEngine.bubbleManager.spawnBubble).toHaveBeenCalledTimes(5),
            expect(mockGameEngine.bubbleManager.spawnBubble').toHaveBeenCalledWith('normal', null),' }'
            expect(result').toBe('Spawned 5 normal bubble(s'););' }'
        }');'
        test('should spawn bubble with position', (') => { }'
            const result = spawnBubbleCommand.execute(['rainbow', '1', '100', '200']})';'
            );
            expect(mockGameEngine.bubbleManager.spawnBubble').toHaveBeenCalledWith('rainbow', { x: 100, y: 200 });'
            expect(result').toBe('Spawned 1 rainbow bubble(s');'}');'
        test('should default to single normal bubble', () => {  const result = spawnBubbleCommand.execute([]),
            expect(mockGameEngine.bubbleManager.spawnBubble').toHaveBeenCalledWith('normal', null),' }'
            expect(result').toBe('Spawned 1 normal bubble(s'););' }'
        }');'
        test('should limit bubble count', (') => {  ''
            let result = spawnBubbleCommand.execute(['normal', '0']),
            expect(result').toBe('Count must be between 1 and 50'),'
            result = spawnBubbleCommand.execute(['normal', '100']),' }'
            expect(result').toBe('Count must be between 1 and 50'););' }'
        }');'
        test('should provide bubble type completions', (') => {  ''
            const completions = spawnBubbleCommand.getCompletions([']'),
            expect(completions.toContain('normal'),
            expect(completions.toContain('stone'),
            expect(completions.toContain('rainbow'),
            expect(completions.toContain('boss'),
            const countCompletions = spawnBubbleCommand.getCompletions(['normal', ']'),
            expect(countCompletions.toContain('1'),
            expect(countCompletions.toContain('5'),
            expect(countCompletions.toContain('10'),' }'
            expect(countCompletions.toContain('20');' }'
        }');'
        test('should require confirmation to clear bubbles', () => {  const result = clearBubblesCommand.execute([]),
            expect(result').toContain('Use "clear-bubbles --confirm" to proceed') }'
            expect(mockGameEngine.bubbleManager.clearAllBubbles).not.toHaveBeenCalled();' }'
        }');'
        test('should clear all bubbles with confirmation', (') => {  ''
            const result = clearBubblesCommand.execute(['--confirm']),'
            expect(mockGameEngine.bubbleManager.clearAllBubbles).toHaveBeenCalled(),' }'
            expect(result').toBe('Cleared 25 bubbles'););' }'
        }');'
        test('should show bubble information', () => {  const result = bubbleInfoCommand.execute([]),
            expect(result').toContain('Bubble Information'),'
            expect(result').toContain('Active Bubbles: 25'),',
            expect(result').toContain('normal: 15'),',
            expect(result').toContain('stone: 5'),',
            expect(result').toContain('rainbow: 3'),' }'
            expect(result').toContain('boss: 2'),' }'
        }');'
    }''
    describe('Player Data Commands', () => {  let setAPCommand, setLevelCommand, playerInfoCommand, resetPlayerCommand }
        beforeEach(() => { }
            const commands: Record<string, any> = {};'
            mockConsole.registerCommand.mock.calls.forEach(([name, config]) => { commands[name] = config,' }'
            }');'
            setAPCommand = commands['set-ap'];
            setLevelCommand = commands['set-level'];
            playerInfoCommand = commands['player-info'];
            resetPlayerCommand = commands['reset-player'];'}');
        test('should set AP', (') => {  ''
            const result = setAPCommand.execute(['5000']),'
            expect(mockGameEngine.playerData.setAP).toHaveBeenCalledWith(5000),
            expect(result').toContain('AP set to 5000'),' }'
            expect(result').toContain('was 2500');' }'
        }');'
        test('should validate AP input', () => {  let result = setAPCommand.execute([]),
            expect(result').toBe('Usage: set-ap <value>'),',
            result = setAPCommand.execute(['invalid']),
            expect(result').toBe('Invalid AP value'),'
            result = setAPCommand.execute(['-100']),' }'
            expect(result').toBe('Invalid AP value'););' }'
        }');'
        test('should set level', (') => {  ''
            const result = setLevelCommand.execute(['10']),'
            expect(mockGameEngine.playerData.setLevel).toHaveBeenCalledWith(10),
            expect(result').toContain('Level set to 10'),' }'
            expect(result').toContain('was 5');' }'
        }');'
        test('should validate level range', (') => {  ''
            let result = setLevelCommand.execute(['0']),
            expect(result').toBe('Level must be between 1 and 100'),'
            result = setLevelCommand.execute(['101']),' }'
            expect(result').toBe('Level must be between 1 and 100'););' }'
        }');'
        test('should show player information', () => {  const result = playerInfoCommand.execute([]),
            expect(result').toContain('Player Information'),'
            expect(result').toContain('Name: TestPlayer'),',
            expect(result').toContain('Level: 5'),',
            expect(result').toContain('AP: 2500'),',
            expect(result').toContain('TAP: 15000'),' }'
            expect(result').toContain('High Score: 12000'),' }'
        }');'
        test('should require confirmation to reset player', () => {  const result = resetPlayerCommand.execute([]),
            expect(result').toContain('Use "reset-player --confirm" to proceed') }'
            expect(mockGameEngine.playerData.reset).not.toHaveBeenCalled();' }'
        }');'
        test('should reset player data with confirmation', (') => {  ''
            const result = resetPlayerCommand.execute(['--confirm']),'
            expect(mockGameEngine.playerData.reset).toHaveBeenCalled(),' }'
            expect(result').toBe('Player data reset successfully'););' }'
        }');'
        test('should create backup when requested', (') => { }'
            const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {}');'
            const result = resetPlayerCommand.execute(['--confirm', '--backup']);'
            expect(setItemSpy.toHaveBeenCalled();
            expect(mockConsole.print).toHaveBeenCalledWith(')';
                expect.stringContaining('Backup created:'),';'
                'info';
            );'
            setItemSpy.mockRestore();'}');
        test('should provide AP completions', () => {  ''
            const completions = setAPCommand.getCompletions([]'),'
            expect(completions.toContain('100'),
            expect(completions.toContain('500'),
            expect(completions.toContain('1000'),' }'
            expect(completions.toContain('5000');' }'
        }');'
        test('should provide level completions', () => {  ''
            const completions = setLevelCommand.getCompletions([]'),'
            expect(completions.toContain('10'),
            expect(completions.toContain('20'),
            expect(completions.toContain('50'),' }'
            expect(completions.toContain('100');' }'
        }');'
    }''
    describe('Level Commands', () => {  let gotoStageCommand, listStagesCommand, setDifficultyCommand }
        beforeEach(() => { }
            const commands: Record<string, any> = {};'
            mockConsole.registerCommand.mock.calls.forEach(([name, config]) => { commands[name] = config,' }'
            }');'
            gotoStageCommand = commands['goto-stage'];
            listStagesCommand = commands['list-stages'];
            setDifficultyCommand = commands['set-difficulty'];'}');
        test('should switch stage', (') => {  ''
            const result = gotoStageCommand.execute(['hard']),
            expect(mockGameEngine.stageManager.setCurrentStage').toHaveBeenCalledWith('hard'),' }'
            expect(result').toBe('Switched to stage: hard'););' }'
        }');'
        test('should require stage name', () => {  const result = gotoStageCommand.execute([]),' }'
            expect(result').toBe('Usage: goto-stage <stage-name>'););' }'
        }');'
        test('should list available stages', () => {  const result = listStagesCommand.execute([]),
            expect(result').toContain('Available stages: '),',
            expect(result').toContain('tutorial'),'
            expect(result').toContain('normal'),'
            expect(result').toContain('hard'),'
            expect(result').toContain('expert'),' }'
            expect(result').toContain('boss');' }'
        }');'
        test('should set difficulty', (') => {  ''
            const result = setDifficultyCommand.execute(['hard']),
            expect(mockGameEngine.stageManager.setDifficulty').toHaveBeenCalledWith('hard'),' }'
            expect(result').toBe('Difficulty set to: hard'););' }'
        }');'
        test('should validate difficulty', (') => {  ''
            const result = setDifficultyCommand.execute(['invalid']),
            expect(result').toContain('Invalid difficulty'),' }'
            expect(result').toContain('easy, normal, hard, expert');' }'
        }');'
        test('should provide stage completions', () => {  ''
            const completions = gotoStageCommand.getCompletions([]'),'
            expect(completions.toContain('tutorial'),
            expect(completions.toContain('normal'),
            expect(completions.toContain('hard'),
            expect(completions.toContain('expert'),
            expect(completions.toContain('boss'),' }'
            expect(completions.toContain('endless');' }'
        }');'
        test('should provide difficulty completions', () => {  ''
            const completions = setDifficultyCommand.getCompletions([]'),'
            expect(completions.toContain('easy'),
            expect(completions.toContain('normal'),
            expect(completions.toContain('hard'),' }'
            expect(completions.toContain('expert');' }'
        }');'
    }''
    describe('Debug Commands', () => {  let runTestCommand, dumpStateCommand, undoCommand }
        beforeEach(() => { }
            const commands: Record<string, any> = {};'
            mockConsole.registerCommand.mock.calls.forEach(([name, config]) => { commands[name] = config,' }'
            }');'
            runTestCommand = commands['run-test'];
            dumpStateCommand = commands['dump-state'];
            undoCommand = commands['undo'];'}');
        test('should run stress test', (') => {  ''
            const result = runTestCommand.execute(['stress']),'
            expect(mockGameEngine.bubbleManager.spawnBubble).toHaveBeenCalledTimes(100),' }'
            expect(result').toBe('Stress test: Spawned 100 bubbles'););' }'
        }');'
        test('should run memory test', () => {  ''
            global.window.gc = jest.fn(')',
            const result = runTestCommand.execute(['memory']),'
            expect(global.window.gc).toHaveBeenCalled(),
            expect(result').toBe('Memory test: Forced garbage collection') }'
            delete global.window.gc;);' }'
        }');'
        test('should run performance test', (') => {  ''
            const result = runTestCommand.execute(['performance']),
            expect(result').toContain('Performance test: '),' }'
            expect(result').toContain('ms for 10k operations');' }'
        }');'
        test('should handle unknown test scenario', (') => {  ''
            const result = runTestCommand.execute(['unknown']),' }'
            expect(result').toBe('Unknown test scenario: unknown'););' }'
        }');'
        test('should provide test completions', () => {  ''
            const completions = runTestCommand.getCompletions([]'),'
            expect(completions.toContain('stress'),
            expect(completions.toContain('memory'),
            expect(completions.toContain('performance'),
            expect(completions.toContain('bubbles'),' }'
            expect(completions.toContain('scoring');' }'
        }');'
        test('should dump game state', () => {  const result = dumpStateCommand.execute([]),
            expect(result').toContain('Game State'),'
            expect(result').toContain('Running: false'),',
            expect(result').toContain('Paused: false'),',
            expect(result').toContain('Scene: game'),',
            expect(result').toContain('Score: 1500'),' }'
            expect(result').toContain('Bubbles: 25'),' }'
        }');'
        test('should dump state as JSON', (') => { }'
            const result = dumpStateCommand.execute(['--json']});
            );
            expect(() => JSON.parse(result}).not.toThrow();
            const parsed = JSON.parse(result);
            expect(parsed.running).toBe(false);'
            expect(parsed.paused).toBe(false);
            expect(parsed.currentScene').toBe('game');'}');'
        test('should handle undo with empty stack', () => {  const result = undoCommand.execute([]),' }'
            expect(result').toBe('No commands to undo'););' }'
        }');'
        test('should undo last command', (') => {  // First execute a command that adds to undo stack'
            const setScoreCommand = mockConsole.registerCommand.mock.calls.find(')',
                call => call[0] === 'set-score')','
            ')[1],'
            setScoreCommand.execute(['5000']),
            // Now undo should work'
            const result = undoCommand.execute([]),' }'
            expect(result').toContain('Undid: '),' }'
        }');'
    }''
    describe('State Management', (') => {  ''
        test('should capture game state', () => {
            const state = gameStateCommands.captureGameState(),
            expect(state.timestamp).toBeDefined(),
            expect(state.running).toBe(false),'
            expect(state.paused).toBe(false),
            expect(state.currentScene').toBe('game'),'
            expect(state.score.current).toBe(1500),
            expect(state.score.combo).toBe(3) }'
            expect(state.bubbles.count).toBe(25););' }'
        }');'
        test('should capture player data', () => {  const data = gameStateCommands.capturePlayerData(),
            expect(data.name').toBe('TestPlayer'),'
            expect(data.level).toBe(5),
            expect(data.ap).toBe(2500),
            expect(data.tap).toBe(15000) }'
            expect(data.highScore).toBe(12000););' }'
        }');'
        test('should create player data backup', (') => { }'
            const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
            const backup = gameStateCommands.createPlayerDataBackup();
            expect(backup.id).toMatch(/^backup_\d+$/);
            expect(backup.timestamp).toBeDefined();
            expect(backup.data).toBeDefined();
            expect(setItemSpy.toHaveBeenCalled();'
            setItemSpy.mockRestore();'}');
        test('should log commands', (') => { }'
            gameStateCommands.logCommand('test-command', { param: 'value' });'
            expect(gameStateCommands.executionState.commandHistory).toHaveLength(1);
            expect(gameStateCommands.executionState.lastCommand').toBe('test-command');'
            const log = gameStateCommands.executionState.commandHistory[0];
            expect(log.command').toBe('test-command');'
            expect(log.params').toEqual({ param: 'value' )') }'
        }''
        test('should add to undo stack', (') => { }'
            const state = { test: 'state' }';'
            gameStateCommands.addToUndoStack('test-command', state);
            expect(gameStateCommands.executionState.undoStack).toHaveLength(1);'
            const undoItem = gameStateCommands.executionState.undoStack[0];
            expect(undoItem.command').toBe('test-command');'
            expect(undoItem.state).toEqual(state);'}');
        test('should limit undo stack size', (') => {  gameStateCommands.safetyChecks.maxUndoSize = 2 }', ' }'
            gameStateCommands.addToUndoStack('cmd1', {}');'
            gameStateCommands.addToUndoStack('cmd2', {}');'
            gameStateCommands.addToUndoStack('cmd3', {});'
            expect(gameStateCommands.executionState.undoStack).toHaveLength(2);
            expect(gameStateCommands.executionState.undoStack[0].command').toBe('cmd2');'
            expect(gameStateCommands.executionState.undoStack[1].command').toBe('cmd3');'}');'
    }''
    describe('Safety Features', (') => {  ''
        test('should update safety settings', () => {
            const newSettings = {
                confirmDestructive: false,
                preventDataLoss: false,
                maxUndoSize: 5 }
            },
            ;
            gameStateCommands.updateSafetySettings(newSettings);
            expect(gameStateCommands.safetyChecks.confirmDestructive).toBe(false);
            expect(gameStateCommands.safetyChecks.preventDataLoss).toBe(false);'
            expect(gameStateCommands.safetyChecks.maxUndoSize).toBe(5);'}');
        test('should bypass confirmation when disabled', (') => {  gameStateCommands.safetyChecks.confirmDestructive = false,'
            ','
            const resetCommand = mockConsole.registerCommand.mock.calls.find(')',
                call => call[0] === 'reset')[1],
            
            const result = resetCommand.execute([]),'
            expect(mockGameEngine.reset).toHaveBeenCalled(),' }'
            expect(result').toBe('Game reset successfully');' }'
        }');'
    }''
    describe('Statistics and Information', (') => { }'
        test('should get execution statistics', (') => { }'
            gameStateCommands.logCommand('test1', {}');'
            gameStateCommands.logCommand('test2', {}');'
            gameStateCommands.addToUndoStack('test1', {});
            const stats = gameStateCommands.getExecutionStatistics();'
            expect(stats.totalCommands).toBe(2);
            expect(stats.lastCommand').toBe('test2');'
            expect(stats.undoStackSize).toBe(1);'
            expect(stats.availableUndos).toBe(1);'}');
        test('should format game state', () => {  const state = {''
                timestamp: Date.now(' }'
                currentScene: 'game'
            }
                score: { current: 5000, combo: 10 })
                bubbles: { count: 30
            });
            })', ')';'
            const formatted = gameStateCommands.formatGameState(state');'
            expect(formatted.toContain('Game State');
            expect(formatted.toContain('Running: true'),';'
            expect(formatted.toContain('Paused: false'),';'
            expect(formatted.toContain('Scene: game'),';'
            expect(formatted.toContain('Score: 5000'),';'
            expect(formatted.toContain('Combo: 10'),';'
            expect(formatted.toContain('Bubbles: 30'),';'
        }');'
    }''
    describe('Error Handling', (') => { }'
        test('should handle missing game managers', (') => { }'
            gameStateCommands.gameEngine = {};
            ';'
            const setScoreCommand = mockConsole.registerCommand.mock.calls.find(')';
                call => call[0] === 'set-score')';'
            ')[1];', ';'
            const result = setScoreCommand.execute(['1000']);
            expect(result').toBe('Score manager not available');'}');'
        test('should handle command execution errors', () => {  ''
            mockGameEngine.scoreManager.setScore.mockImplementationOnce((') => { }'
                throw new Error('Score setting failed');' }'
            }');'
            const setScoreCommand = mockConsole.registerCommand.mock.calls.find(')';
                call => call[0] === 'set-score')';'
            ')[1];', ';'
            const result = setScoreCommand.execute(['1000']);
            expect(result').toContain('Failed to set score');'}');'
        test('should handle test scenario errors', () => {  ''
            mockGameEngine.bubbleManager.spawnBubble.mockImplementationOnce((') => { }'
                throw new Error('Spawn failed');' }'
            }');'
            const runTestCommand = mockConsole.registerCommand.mock.calls.find(')';
                call => call[0] === 'run-test')';'
            ')[1];', ';'
            const result = runTestCommand.execute(['stress']);
            expect(result').toContain('Test failed');'}');'
    }''
    describe('Cleanup', (') => { }'
        test('should destroy cleanly', (') => { }'
            gameStateCommands.logCommand('test', {}');'
            gameStateCommands.addToUndoStack('test', {});
            expect(gameStateCommands.executionState.commandHistory).toHaveLength(1);
            expect(gameStateCommands.executionState.undoStack).toHaveLength(1);
            gameStateCommands.destroy();
            expect(gameStateCommands.executionState.commandHistory).toHaveLength(0);'
            expect(gameStateCommands.executionState.undoStack).toHaveLength(0);'}');
        test('should log destruction', () => {  ''
            gameStateCommands.destroy(') }'
            expect(consoleLogSpy.toHaveBeenCalledWith('[GameStateCommands] Destroyed'); }
        });'
    }'}');))))))))))))