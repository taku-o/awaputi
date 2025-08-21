import { describe, test, expect, beforeEach, afterEach, jest  } from '@jest/globals';
/**
 * shop-button-main-menu-integration.test.js
 * 
 * ショップボタンメインメニュー追加の統合テスト
 * Issue #171 - Shop button main menu addition
 * Task 10 - Integration tests
 */
import { MainMenuScene  } from '../../src/scenes/MainMenuScene';
import { StageSelectDataManager  } from '../../src/scenes/stage-select/StageSelectDataManager';
// DOM APIのモック
const mockDocument = {
    fullscreenElement: null,
    documentElement: {
        requestFullscreen: jest.fn( },
        exitFullscreen: jest.fn()' };
// グローバル変数のモック
global.document = mockDocument;
global.navigator = {
    userAgent: 'test-agent'
};
global.window = {
    innerWidth: 1920,
    innerHeight: 1080
};
describe('Shop Button Main Menu Integration Tests', () => {
    let mainMenuScene: any,
    let stageSelectDataManager: any,
    let mockGameEngine: any,
    let mockStageSelectScene: any,
    let mockCanvas: any,
    let mockContext: any,
    
    beforeEach(() => {
        // Mock Canvas
        mockCanvas = {
            width: 1920,
            height: 1080
        };
        
        // Mock CanvasRenderingContext2D
        mockContext = {
            save: jest.fn(
            restore: jest.fn(
            fillText: jest.fn(
            fillRect: jest.fn(
            strokeRect: jest.fn(
            measureText: jest.fn((text) => ({ width: text.length * 10 ))',
            font: ',
            fillStyle: ',
            strokeStyle: ',
            textAlign: ',
            textBaseline: ',
            lineWidth: 0
    });
        // Mock GameEngine
        mockGameEngine = {
            canvas: mockCanvas,
            sceneManager: {
                hasScene: jest.fn().mockReturnValue(true),
               , switchScene: jest.fn(').mockReturnValue(true,
                currentScene: {
                    constructor: { name: 'MainMenuScene' }
                }),
            localizationManager: {
                getCurrentLanguage: jest.fn(').mockReturnValue('ja',
                t: jest.fn((key') => {
                    const translations = {
                        'menu.start': 'ゲーム開始',
                        'menu.shop': 'ショップ',
                        'menu.settings': '設定',
                        'menu.userInfo': 'ユーザー情報',
                        'menu.help': 'ヘルプ'
                    ),
                    return translations[key] || key,
                ')}
            },
            playerData: {
                username: 'TestPlayer',
                ap: 100,
                tap: 50,
        save: jest.fn( } },
            responsiveCanvas: {
                onResizeCallbacks: []
            },
            stageManager: {
                getUnlockedStages: jest.fn(').mockReturnValue([
                    { id: 'stage1', name: 'ステージ1', description: 'テストステージ1' }')
                    { id: 'stage2', name: 'ステージ2', description: 'テストステージ2' )
                ]),
                getLockedStages: jest.fn().mockReturnValue([')
                    { id: 'stage3', name: 'ステージ3', description: 'テストステージ3', unlockMessage: 'ロック中' )
                ]),
                startStage: jest.fn().mockReturnValue(true
            },
            bubbleManager: {});
        
        // Mock StageSelectScene
        mockStageSelectScene = {
            gameEngine: mockGameEngine,
            sceneManager: {
                switchScene: jest.fn().mockReturnValue(true
            );
        
        // シーンとデータマネージャーの初期化
        mainMenuScene = new MainMenuScene(mockGameEngine);
        stageSelectDataManager = new StageSelectDataManager(mockStageSelectScene);
        stageSelectDataManager.initialize();
    }');
    describe('メインメニューからショップへの遷移テスト', (') => {
        describe('キーボードナビゲーション', (') => {
            test('キーボードでショップメニューに移動してEnterで遷移できる', (') => {
                // ゲーム開始（index 0）から下に移動してショップ（index 1）に移動
                mainMenuScene.selectedMenuIndex = 0,
                
                const downKeyEvent = {
                    type: 'keydown',
                    code: 'ArrowDown'
                };
                
                mainMenuScene.handleMainMenuInput(downKeyEvent);
                expect(mainMenuScene.selectedMenuIndex).toBe(1');
                // Enterキーでショップを選択
                const enterKeyEvent = {
                    type: 'keydown',
                    code: 'Enter'
    });
                mainMenuScene.handleMainMenuInput(enterKeyEvent);
                expect(mockGameEngine.sceneManager.switchScene').toHaveBeenCalledWith('shop');
            }');
            test('上下キーナビゲーションでショップメニュー項目が正しく選択される', () => {
                mainMenuScene.selectedMenuIndex = 0, // start
                
                // 下に移動してショップに
                mainMenuScene.moveSelection(1),
                expect(mainMenuScene.selectedMenuIndex).toBe(1),
                // さらに下に移動して設定に
                mainMenuScene.moveSelection(1),
                expect(mainMenuScene.selectedMenuIndex).toBe(2),
                // 上に移動してショップに戻る
                mainMenuScene.moveSelection(-1),
                expect(mainMenuScene.selectedMenuIndex).toBe(1) }');
            test('循環ナビゲーションでショップメニューが正しく処理される', () => {
                const menuItemsLength = mainMenuScene.menuItems.length,
                
                // 最初から上に移動（最後に循環）
                mainMenuScene.selectedMenuIndex = 0,
                mainMenuScene.moveSelection(-1),
                expect(mainMenuScene.selectedMenuIndex).toBe(menuItemsLength - 1),
                // 最後から下に移動（最初に循環）
                mainMenuScene.selectedMenuIndex = menuItemsLength - 1,
                mainMenuScene.moveSelection(1),
                expect(mainMenuScene.selectedMenuIndex).toBe(0) }');
        }
        describe('マウスクリック（シミュレーション）', (') => {
            test('ショップメニュー項目のactionが正しく呼ばれる', (') => {
                const shopMenuItem = mainMenuScene.menuItems.find(item => item.id === 'shop'),
                const spy = jest.spyOn(mainMenuScene, 'openShop'),
                // ショップメニューのアクションを直接呼び出し（マウスクリックをシミュレート）
                shopMenuItem.action(),
                expect(spy.toHaveBeenCalled(),
                expect(mockGameEngine.sceneManager.switchScene').toHaveBeenCalledWith('shop'),
                spy.mockRestore() }');
            test('selectMenuItemでショップインデックスが選択された場合の動作', (') => {
                mainMenuScene.selectedMenuIndex = 1, // ショップのインデックス
                const spy = jest.spyOn(mainMenuScene, 'openShop'),
                mainMenuScene.selectMenuItem(),
                expect(spy.toHaveBeenCalled(),
                spy.mockRestore() }');
        }
        describe('エラーハンドリングの統合テスト', (') => {
            test('ショップシーンが存在しない場合のエラーハンドリング', () => {
                mockGameEngine.sceneManager.switchScene.mockReturnValue(false'),
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation(),
                mainMenuScene.openShop('),
                expect(consoleSpy.toHaveBeenCalledWith('[MainMenuScene] Failed to switch to shop scene'),
                consoleSpy.mockRestore() });
        }
    }');
    describe('ステージ選択画面でのキーボード操作テスト', (') => {
        test('Sキーが無効になっていることを確認', (') => {
            const sKeyEvent = {
                code: 'KeyS'
            };
            
            const result = stageSelectDataManager.handleStageKeyInput(sKeyEvent);
            expect(result.toBe(false);
            expect(mockStageSelectScene.sceneManager.switchScene).not.toHaveBeenCalled();
        }');
        test('他のキーボードショートカットが正常に動作する', (') => {
            // ArrowUp
            stageSelectDataManager.selectedStageIndex = 1,
            const upResult = stageSelectDataManager.handleStageKeyInput({ code: 'ArrowUp' });
            expect(upResult.toBe(true);
            expect(stageSelectDataManager.selectedStageIndex).toBe(0');
            // ArrowDown
            stageSelectDataManager.selectedStageIndex = 0;
            const downResult = stageSelectDataManager.handleStageKeyInput({ code: 'ArrowDown' ,
            expect(downResult.toBe(true),
            expect(stageSelectDataManager.selectedStageIndex).toBe(1'),
            // Enter
            stageSelectDataManager.selectedStageIndex = 0,
            const enterResult = stageSelectDataManager.handleStageKeyInput({ code: 'Enter' ,
            expect(enterResult.toBe(true),
            expect(mockGameEngine.stageManager.startStage').toHaveBeenCalledWith('stage1') }');
        test('無効なキーが適切に処理される', (') => {
            const invalidKeys = ['KeyA', 'KeyZ', 'Space', 'KeyH'],
            
            invalidKeys.forEach(keyCode => {),
                const result = stageSelectDataManager.handleStageKeyInput({ code: keyCode });
                expect(result.toBe(false);
            });
        }
    }');
    describe('シーン間の連携テスト', (') => {
        test('メインメニューからショップに遷移後、ステージ選択に遷移してもSキーは無効', () => {
            // メインメニューからショップに遷移
            mainMenuScene.selectedMenuIndex = 1, // ショップ
            mainMenuScene.selectMenuItem(),
            expect(mockGameEngine.sceneManager.switchScene').toHaveBeenCalledWith('shop'),
            // ステージ選択画面でSキーが無効であることを確認
            const sKeyEvent = { code: 'KeyS' };
            const result = stageSelectDataManager.handleStageKeyInput(sKeyEvent);
            expect(result.toBe(false);
        }');
        test('多言語環境でのショップメニューアイテム表示', () => {
            // 日本語
            mainMenuScene.updateMenuLabels('),
            const shopMenuItem = mainMenuScene.menuItems.find(item => item.id === 'shop'),
            expect(shopMenuItem.label').toBe('ショップ'),
            // 英語に変更
            mockGameEngine.localizationManager.t.mockImplementation((key') => {
                const translations = {
                    'menu.start': 'Start Game',
                    'menu.shop': 'Shop',
                    'menu.settings': 'Settings',
                    'menu.userInfo': 'User Info',
                    'menu.help': 'Help'
                ),
                return translations[key] || key });
            mainMenuScene.updateMenuLabels();
            expect(shopMenuItem.label').toBe('Shop');
        }');
    }
    describe('データ整合性テスト', (') => {
        test('メニュー項目数が正しい', () => {
            expect(mainMenuScene.menuItems).toHaveLength(5) }');
        test('メニュー項目の順序が要件通り', (') => {
            const expectedOrder = ['start', 'shop', 'settings', 'userInfo', 'help'],
            const actualOrder = mainMenuScene.menuItems.map(item => item.id),
            expect(actualOrder.toEqual(expectedOrder) }');
        test('ショップメニュー項目のプロパティが正しく設定されている', (') => {
            const shopMenuItem = mainMenuScene.menuItems.find(item => item.id === 'shop'),
            expect(shopMenuItem.id').toBe('shop'),
            expect(shopMenuItem.key').toBe('menu.shop'),
            expect(typeof shopMenuItem.action').toBe('function') });
    }
}');