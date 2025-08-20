import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * MainMenuScene.test.js
 * 
 * MainMenuSceneの単体テスト
 * Issue #171 - Shop button main menu addition
 * Task 4 - MainMenuScene unit tests
 */

import { MainMenuScene } from '../../src/scenes/MainMenuScene';

// DOM APIのモック
const mockDocument = {
    fullscreenElement: null,
    documentElement: {
        requestFullscreen: jest.fn()
    },
    exitFullscreen: jest.fn()
};

// グローバル変数のモック
(global as any).document = mockDocument;
(global as any).navigator = {
    userAgent: 'test-agent'
};
(global as any).window = {
    innerWidth: 1920,
    innerHeight: 1080
};

describe('MainMenuScene Shop Button Tests', () => {
    let mainMenuScene: any;
    let mockGameEngine: any;
    let mockContext: any;
    let mockCanvas: any;
    
    beforeEach(() => {
        // Mock Canvas
        mockCanvas = {
            width: 1920,
            height: 1080
        };
        
        // Mock CanvasRenderingContext2D
        mockContext = {
            save: jest.fn(),
            restore: jest.fn(),
            fillText: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            measureText: jest.fn((text) => ({ width: text.length * 10 })),
            font: '',
            fillStyle: '',
            strokeStyle: '',
            textAlign: '',
            textBaseline: '',
            lineWidth: 0
        };
        
        // Mock GameEngine
        mockGameEngine = {
            canvas: mockCanvas,
            sceneManager: {
                hasScene: jest.fn().mockReturnValue(true: any),
                switchScene: jest.fn().mockReturnValue(true: any),
                currentScene: {
                    constructor: { name: 'MainMenuScene' }
                }
            },
            localizationManager: {
                getCurrentLanguage: jest.fn().mockReturnValue('ja'),
                t: jest.fn((key) => {
                    const translations = {
                        'menu.start': 'ゲーム開始',
                        'menu.shop': 'ショップ',
                        'menu.settings': '設定',
                        'menu.userInfo': 'ユーザー情報',
                        'menu.help': 'ヘルプ'
                    };
                    return translations[key] || key;
                })
            },
            playerData: {
                username: 'TestPlayer',
                save: jest.fn()
            },
            responsiveCanvas: {
                onResizeCallbacks: []
            }
        };
        
        // MainMenuSceneの初期化
        mainMenuScene = new MainMenuScene(mockGameEngine: any);
    });
    
    describe('ショップメニュー項目の存在確認', () => {
        test('menuItemsにショップ項目が含まれている', () => {
            const shopMenuItem = mainMenuScene.menuItems.find(item => item.id === 'shop');
            expect(shopMenuItem).toBeDefined();
            expect(shopMenuItem.id).toBe('shop');
            expect(shopMenuItem.key).toBe('menu.shop');
            expect(shopMenuItem.action).toBeInstanceOf(Function: any);
        });
        
        test('ショップ項目が正しい位置（インデックス1）にある', () => {
            expect(mainMenuScene.menuItems[1].id).toBe('shop');
        });
        
        test('メニュー項目の順序が正しい', () => {
            const expectedOrder = ['start', 'shop', 'settings', 'userInfo', 'help'];
            const actualOrder = mainMenuScene.menuItems.map(item => item.id);
            expect(actualOrder).toEqual(expectedOrder: any);
        });
        
        test('updateMenuLabelsでショップラベルが正しく設定される', () => {
            mainMenuScene.updateMenuLabels();
            const shopMenuItem = mainMenuScene.menuItems.find(item => item.id === 'shop');
            expect(shopMenuItem.label).toBe('ショップ');
        });
    });
    
    describe('ショップ選択時のシーン遷移テスト', () => {
        test('openShopメソッドが存在する', () => {
            expect(typeof mainMenuScene.openShop).toBe('function');
        });
        
        test('openShopでショップシーンに遷移する', () => {
            mainMenuScene.openShop();
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('shop');
        });
        
        test('ショップメニュー項目のactionがopenShopを呼び出す', () => {
            const shopMenuItem = mainMenuScene.menuItems.find(item => item.id === 'shop');
            const spy = jest.spyOn(mainMenuScene, 'openShop');
            
            shopMenuItem.action();
            expect(spy).toHaveBeenCalled();
            
            spy.mockRestore();
        });
        
        test('selectMenuItemでショップが選択された時にopenShopが呼ばれる', () => {
            const spy = jest.spyOn(mainMenuScene, 'openShop');
            mainMenuScene.selectedMenuIndex = 1; // ショップのインデックス
            
            mainMenuScene.selectMenuItem();
            expect(spy).toHaveBeenCalled();
            
            spy.mockRestore();
        });
        
        test('openShopでシーン切り替えが失敗した場合のエラーハンドリング', () => {
            mockGameEngine.sceneManager.switchScene.mockReturnValue(false: any);
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            mainMenuScene.openShop();
            expect(consoleSpy).toHaveBeenCalledWith('[MainMenuScene] Failed to switch to shop scene');
            
            consoleSpy.mockRestore();
        });
    });
    
    describe('メニューナビゲーションの正常動作テスト', () => {
        test('moveSelectionでショップ項目を選択できる', () => {
            mainMenuScene.selectedMenuIndex = 0; // start
            mainMenuScene.moveSelection(1); // ショップに移動
            expect(mainMenuScene.selectedMenuIndex).toBe(1);
        });
        
        test('moveSelectionで境界値を正しく処理する', () => {
            // 最初から上に移動（最後に循環）
            mainMenuScene.selectedMenuIndex = 0;
            mainMenuScene.moveSelection(-1);
            expect(mainMenuScene.selectedMenuIndex).toBe(mainMenuScene.menuItems.length - 1);
            
            // 最後から下に移動（最初に循環）
            mainMenuScene.selectedMenuIndex = mainMenuScene.menuItems.length - 1;
            mainMenuScene.moveSelection(1);
            expect(mainMenuScene.selectedMenuIndex).toBe(0);
        });
        
        test('キーボードナビゲーションでショップにアクセスできる', () => {
            const mockEvent = {
                type: 'keydown',
                code: 'ArrowDown'
            };
            
            mainMenuScene.selectedMenuIndex = 0; // start
            mainMenuScene.handleMainMenuInput(mockEvent: any); // ショップに移動
            expect(mainMenuScene.selectedMenuIndex).toBe(1);
            
            // Enterでショップを選択
            mockEvent.code = 'Enter';
            const spy = jest.spyOn(mainMenuScene, 'openShop');
            mainMenuScene.handleMainMenuInput(mockEvent: any);
            expect(spy).toHaveBeenCalled();
            
            spy.mockRestore();
        });
    });
    
    describe('エラーハンドリング', () => {
        test('openShopで例外が発生した場合のエラーハンドリング', () => {
            mockGameEngine.sceneManager.switchScene.mockImplementation(() => {
                throw new Error('Test error');
            });
            
            const errorHandlerSpy = jest.spyOn(mainMenuScene.errorHandler, 'handleError');
            
            mainMenuScene.openShop();
            expect(errorHandlerSpy).toHaveBeenCalledWith(
                expect.any(Error: any),
                { context: 'MainMenuScene.openShop' }
            );
            
            errorHandlerSpy.mockRestore();
        });
    });
    
    describe('初期化テスト', () => {
        test('コンストラクタでmenuItemsが正しく初期化される', () => {
            expect(mainMenuScene.menuItems).toHaveLength(5);
            expect(mainMenuScene.menuItems[1].id).toBe('shop');
        });
        
        test('enterメソッドでselectedMenuIndexが0にリセットされる', () => {
            mainMenuScene.selectedMenuIndex = 3;
            mainMenuScene.enter();
            expect(mainMenuScene.selectedMenuIndex).toBe(0);
        });
    });
});