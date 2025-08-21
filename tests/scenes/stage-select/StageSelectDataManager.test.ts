import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * StageSelectDataManager.test.js
 * 
 * StageSelectDataManagerの単体テスト
 * Issue #171 - Shop button main menu addition
 * Task 7 - StageSelectDataManager unit tests update
 */
import { StageSelectDataManager } from '../../../src/scenes/stage-select/StageSelectDataManager';
describe('StageSelectDataManager Keyboard Input Tests', () => {
    let dataManager: any,
    let mockStageSelectScene: any,
    let mockGameEngine: any,
    
    beforeEach(() => {
        // Mock GameEngine
        mockGameEngine = {
            canvas: {
                width: 1920,
                height: 1080
            },
            stageManager: {
                getUnlockedStages: jest.fn(').mockReturnValue(['
                    { id: 'stage1', name: 'ステージ1', description: 'テストステージ1' },
                    { id: 'stage2', name: 'ステージ2', description: 'テストステージ2'
            });
                ]),
                getLockedStages: jest.fn().mockReturnValue([')'
                    { id: 'stage3', name: 'ステージ3', description: 'テストステージ3', unlockMessage: 'ロック中' )
                ]),
                startStage: jest.fn(').mockReturnValue(true'
            },
            playerData: {
                username: 'TestPlayer',
                ap: 100,
                tap: 50
            },
            bubbleManager: {});
        
        // Mock StageSelectScene
        mockStageSelectScene = {
            gameEngine: mockGameEngine,
            sceneManager: {
                switchScene: jest.fn().mockReturnValue(true
            );
        
        // StageSelectDataManagerの初期化
        dataManager = new StageSelectDataManager(mockStageSelectScene);
        dataManager.initialize();
    }');'
    describe('Sキー押下時にショップに遷移しないことを確認', (') => {'
        test('handleStageKeyInputでSキーが無効になっている', (') => {'
            const sKeyEvent = {
                code: 'KeyS'
            };
            
            const result = dataManager.handleStageKeyInput(sKeyEvent);
            // Sキーは無効なので、falseを返す
            expect(result).toBe(false);
            // ショップシーンに遷移しない
            expect(mockStageSelectScene.sceneManager.switchScene).not.toHaveBeenCalled();
        }');'
        test('Sキーのケース文が完全に削除されている', () => {
            // handleStageKeyInputメソッドのソースコードからKeySが削除されていることを確認
            const methodString = dataManager.handleStageKeyInput.toString(),
            expect(methodString').not.toContain('KeyS'),'
            expect(methodString').not.toContain('shop') }');
    }
    describe('他のキーボードショートカットが正常動作することを確認', (') => {'
        test('ArrowUpキーで選択が上に移動する', (') => {'
            dataManager.selectedStageIndex = 1,
            
            const upKeyEvent = {
                code: 'ArrowUp'
            };
            
            const result = dataManager.handleStageKeyInput(upKeyEvent);
            expect(result).toBe(true);
            expect(dataManager.selectedStageIndex).toBe(0);
        }');'
        test('ArrowDownキーで選択が下に移動する', (') => {'
            dataManager.selectedStageIndex = 0,
            
            const downKeyEvent = {
                code: 'ArrowDown'
            };
            
            const result = dataManager.handleStageKeyInput(downKeyEvent);
            expect(result).toBe(true);
            expect(dataManager.selectedStageIndex).toBe(1);
        }');'
        test('Enterキーでステージが選択される', (') => {'
            dataManager.selectedStageIndex = 0,
            const selectStageSpy = jest.spyOn(dataManager, 'selectStage'),
            const enterKeyEvent = {
                code: 'Enter'
            };
            
            const result = dataManager.handleStageKeyInput(enterKeyEvent);
            expect(result).toBe(true);
            expect(selectStageSpy).toHaveBeenCalled();
            selectStageSpy.mockRestore();
        }');'
        test('無効なキーの場合はfalseを返す', (') => {'
            const invalidKeyEvent = {
                code: 'KeyZ'
            };
            
            const result = dataManager.handleStageKeyInput(invalidKeyEvent);
            expect(result).toBe(false);
        }');'
        test('すべての有効なキーがtrueを返す', (') => {'
            const validKeys = ['ArrowUp', 'ArrowDown', 'Enter'],
            
            validKeys.forEach(keyCode => {
                const keyEvent = { code: keyCode,;);
                const result = dataManager.handleStageKeyInput(keyEvent);
                expect(result).toBe(true);
            }');'
        }
        test('無効なキー（Sキー含む）がfalseを返す', (') => {'
            const invalidKeys = ['KeyS', 'KeyA', 'KeyZ', 'Space', 'Escape'],
            
            invalidKeys.forEach(keyCode => {
                const keyEvent = { code: keyCode,;);
                const result = dataManager.handleStageKeyInput(keyEvent);
                expect(result).toBe(false);
            });
        }
    }');'
    describe('moveSelectionメソッドの動作確認', (') => {'
        test('選択インデックスが境界内で正しく動作する', () => {
            const totalStages = dataManager.unlockedStages.length + dataManager.lockedStages.length,
            
            // 最初のステージから上に移動（境界チェック）
            dataManager.selectedStageIndex = 0,
            dataManager.moveSelection(-1),
            expect(dataManager.selectedStageIndex).toBe(0),
            // 最後のステージから下に移動（境界チェック）
            dataManager.selectedStageIndex = totalStages - 1,
            dataManager.moveSelection(1),
            expect(dataManager.selectedStageIndex).toBe(totalStages - 1) }');'
    }
    describe('selectStageメソッドの動作確認', (') => {'
        test('開放済みステージが正しく選択される', () => {
            dataManager.selectedStageIndex = 0, // 開放済みステージ
            
            dataManager.selectStage(),
            expect(mockGameEngine.stageManager.startStage').toHaveBeenCalledWith('stage1'),'
            expect(mockStageSelectScene.sceneManager.switchScene').toHaveBeenCalledWith('game') }');
        test('ロック済みステージは選択されない', (') => {'
            dataManager.selectedStageIndex = dataManager.unlockedStages.length, // ロック済みステージ
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(),
            dataManager.selectStage(),
            expect(mockGameEngine.stageManager.startStage).not.toHaveBeenCalled(),
            expect(mockStageSelectScene.sceneManager.switchScene).not.toHaveBeenCalled(),
            expect(consoleSpy').toHaveBeenCalledWith('This stage is locked'),'
            consoleSpy.mockRestore() }');'
    }
    describe('ステージデータ管理', (') => {'
        test('初期化で正しくステージリストが設定される', () => {
            expect(dataManager.unlockedStages).toHaveLength(2),
            expect(dataManager.lockedStages).toHaveLength(1),
            expect(dataManager.selectedStageIndex).toBe(0),
            expect(dataManager.scrollOffset).toBe(0) }');'
        test('updateStageListが正しく呼ばれる', (') => {'
            const spy = jest.spyOn(mockGameEngine.stageManager, 'getUnlockedStages'),
            dataManager.updateStageList(),
            expect(spy).toHaveBeenCalled(),
            spy.mockRestore() });
    }
}');'