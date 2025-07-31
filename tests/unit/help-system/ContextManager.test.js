/**
 * ContextManager ユニットテスト
 */

import { jest } from '@jest/globals';
import { ContextManager } from '../../../src/core/help/ContextManager.js';

// モック作成
const mockGameEngine = {
    sceneManager: {
        getCurrentScene: jest.fn(() => ({ 
            constructor: { name: 'GameScene' },
            getCurrentState: jest.fn(() => ({ bubbleCount: 5, timeRemaining: 120 }))
        }))
    },
    bubbleManager: {
        getBubbles: jest.fn(() => []),
        getActiveBubbleTypes: jest.fn(() => ['normal', 'stone'])
    },
    scoreManager: {
        getCurrentScore: jest.fn(() => 1500),
        getCurrentCombo: jest.fn(() => 3)
    },
    canvas: { width: 800, height: 600 }
};

describe('ContextManager', () => {
    let contextManager;
    
    beforeEach(() => {
        jest.clearAllMocks();
        contextManager = new ContextManager(mockGameEngine);
    });

    afterEach(() => {
        if (contextManager) {
            contextManager.destroy();
        }
    });

    describe('初期化', () => {
        test('正常に初期化される', () => {
            expect(contextManager).toBeInstanceOf(ContextManager);
            expect(contextManager.gameEngine).toBe(mockGameEngine);
            expect(contextManager.tooltipElements).toBeInstanceOf(Map);
        });

        test('初期状態が正しく設定される', () => {
            expect(contextManager.currentTooltip).toBeNull();
            expect(contextManager.contextCache).toBeInstanceOf(Map);
            expect(contextManager.tooltipElements.size).toBe(0);
        });
    });

    describe('コンテキスト検出', () => {
        test('現在のコンテキストを検出できる', () => {
            const context = contextManager.detectCurrentContext();

            expect(context).toBeDefined();
            expect(context.sceneName).toBe('GameScene');
            expect(context.sceneState).toBeDefined();
            expect(context.gameState).toBeDefined();
        });

        test('GameSceneの詳細コンテキストを検出', () => {
            const context = contextManager.detectCurrentContext();

            expect(context.gameState.bubbleCount).toBe(5);
            expect(context.gameState.timeRemaining).toBe(120);
            expect(context.gameState.currentScore).toBe(1500);
            expect(context.gameState.currentCombo).toBe(3);
            expect(context.gameState.activeBubbleTypes).toEqual(['normal', 'stone']);
        });

        test('異なるシーンのコンテキストを検出', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'MainMenuScene' },
                getCurrentState: jest.fn(() => ({ menuSelection: 'start' }))
            });

            const context = contextManager.detectCurrentContext();

            expect(context.sceneName).toBe('MainMenuScene');
            expect(context.sceneState.menuSelection).toBe('start');
        });

        test('コンテキストキャッシュが機能する', () => {
            const context1 = contextManager.detectCurrentContext();
            const context2 = contextManager.detectCurrentContext();

            // 同じフレーム内では同じコンテキストオブジェクトを返す
            expect(context1).toBe(context2);
        });
    });

    describe('関連ヘルプ取得', () => {
        test('GameSceneでの関連ヘルプを取得', () => {
            const context = {
                sceneName: 'GameScene',
                gameState: {
                    bubbleCount: 10,
                    timeRemaining: 30,
                    currentCombo: 0
                }
            };

            const help = contextManager.getRelevantHelp(context);

            expect(help).toBeDefined();
            expect(help.length).toBeGreaterThan(0);
            expect(help[0].priority).toBeDefined();
        });

        test('高優先度のヘルプが最初に来る', () => {
            const context = {
                sceneName: 'GameScene',
                gameState: {
                    bubbleCount: 0, // 緊急状況
                    timeRemaining: 10
                }
            };

            const help = contextManager.getRelevantHelp(context);

            expect(help[0].priority).toBe('high');
            expect(help[0].category).toBe('urgent');
        });

        test('MainMenuSceneでの関連ヘルプを取得', () => {
            const context = {
                sceneName: 'MainMenuScene',
                sceneState: { menuSelection: 'start' }
            };

            const help = contextManager.getRelevantHelp(context);

            expect(help).toBeDefined();
            expect(help.some(h => h.category === 'navigation')).toBe(true);
        });

        test('存在しないシーンでは基本ヘルプを返す', () => {
            const context = {
                sceneName: 'UnknownScene',
                sceneState: {}
            };

            const help = contextManager.getRelevantHelp(context);

            expect(help).toBeDefined();
            expect(help.length).toBeGreaterThan(0);
            expect(help.some(h => h.category === 'basic')).toBe(true);
        });
    });

    describe('ツールチップ管理', () => {
        const mockElement = {
            getBoundingClientRect: () => ({ left: 100, top: 100, width: 50, height: 50 })
        };

        test('ツールチップを登録できる', () => {
            const content = {
                title: 'テストツールチップ',
                description: 'これはテスト用のツールチップです'
            };

            contextManager.registerTooltip(mockElement, content);

            expect(contextManager.tooltipElements.has(mockElement)).toBe(true);
            expect(contextManager.tooltipElements.get(mockElement)).toEqual(content);
        });

        test('コンテキストツールチップを表示できる', () => {
            const content = {
                title: 'コンテキストツールチップ',
                description: 'コンテキストに応じたヘルプ'
            };

            const result = contextManager.showContextualTooltip(200, 150, content);

            expect(result).toBe(true);
            expect(contextManager.currentTooltip).toBeDefined();
            expect(contextManager.currentTooltip.x).toBe(200);
            expect(contextManager.currentTooltip.y).toBe(150);
            expect(contextManager.currentTooltip.content).toEqual(content);
        });

        test('ツールチップ位置が画面境界に調整される', () => {
            const content = { title: 'テスト', description: 'テスト' };
            
            // 画面右端近くに表示しようとする
            contextManager.showContextualTooltip(750, 150, content);

            const tooltip = contextManager.currentTooltip;
            // 自動的に左側に調整される
            expect(tooltip.x).toBeLessThan(750);
        });

        test('ツールチップを非表示にできる', () => {
            const content = { title: 'テスト', description: 'テスト' };
            contextManager.showContextualTooltip(100, 100, content);

            contextManager.hideTooltip();

            expect(contextManager.currentTooltip).toBeNull();
        });

        test('複数のツールチップ要素を管理できる', () => {
            const element1 = { id: 'element1' };
            const element2 = { id: 'element2' };
            const content1 = { title: 'ツールチップ1' };
            const content2 = { title: 'ツールチップ2' };

            contextManager.registerTooltip(element1, content1);
            contextManager.registerTooltip(element2, content2);

            expect(contextManager.tooltipElements.size).toBe(2);
            expect(contextManager.tooltipElements.get(element1)).toEqual(content1);
            expect(contextManager.tooltipElements.get(element2)).toEqual(content2);
        });
    });

    describe('動的ヘルプ', () => {
        test('次のアクションを提案できる', () => {
            const currentState = {
                sceneName: 'GameScene',
                bubbleCount: 5,
                timeRemaining: 60,
                currentScore: 1000,
                currentCombo: 2
            };

            const suggestions = contextManager.suggestNextActions(currentState);

            expect(suggestions).toBeDefined();
            expect(Array.isArray(suggestions)).toBe(true);
            expect(suggestions.length).toBeGreaterThan(0);
            expect(suggestions[0].action).toBeDefined();
            expect(suggestions[0].reason).toBeDefined();
        });

        test('コンボ継続の提案', () => {
            const currentState = {
                sceneName: 'GameScene',
                currentCombo: 5,
                bubbleCount: 3
            };

            const suggestions = contextManager.suggestNextActions(currentState);

            expect(suggestions.some(s => s.action === 'maintain_combo')).toBe(true);
        });

        test('時間切れ警告の提案', () => {
            const currentState = {
                sceneName: 'GameScene',
                timeRemaining: 15,
                bubbleCount: 8
            };

            const suggestions = contextManager.suggestNextActions(currentState);

            expect(suggestions.some(s => s.priority === 'urgent')).toBe(true);
        });

        test('ユーザー行動に基づくスマートヘルプ', () => {
            const userBehavior = {
                recentActions: ['bubble_click', 'bubble_miss', 'bubble_click'],
                averageAccuracy: 0.67,
                preferredBubbleTypes: ['normal'],
                sessionTime: 300
            };

            const smartHelp = contextManager.getSmartHelp(userBehavior);

            expect(smartHelp).toBeDefined();
            expect(smartHelp.category).toBeDefined();
            expect(smartHelp.suggestions).toBeDefined();
            expect(Array.isArray(smartHelp.suggestions)).toBe(true);
        });

        test('高精度ユーザーへの高度なヘルプ', () => {
            const userBehavior = {
                averageAccuracy: 0.95,
                preferredBubbleTypes: ['normal', 'stone', 'electric'],
                sessionTime: 600
            };

            const smartHelp = contextManager.getSmartHelp(userBehavior);

            expect(smartHelp.category).toBe('advanced');
        });

        test('低精度ユーザーへの基本ヘルプ', () => {
            const userBehavior = {
                averageAccuracy: 0.45,
                recentActions: ['bubble_miss', 'bubble_miss', 'bubble_click'],
                sessionTime: 120
            };

            const smartHelp = contextManager.getSmartHelp(userBehavior);

            expect(smartHelp.category).toBe('basic');
            expect(smartHelp.suggestions.some(s => s.includes('基本操作'))).toBe(true);
        });
    });

    describe('パフォーマンス', () => {
        test('コンテキスト検出のキャッシュ機能', () => {
            const spy = jest.spyOn(mockGameEngine.sceneManager, 'getCurrentScene');

            // 同じフレーム内で複数回呼び出し
            contextManager.detectCurrentContext();
            contextManager.detectCurrentContext();
            contextManager.detectCurrentContext();

            // キャッシュにより実際の呼び出しは1回のみ
            expect(spy).toHaveBeenCalledTimes(1);
        });

        test('フレーム更新時にキャッシュがクリアされる', () => {
            contextManager.detectCurrentContext();
            
            // フレーム更新をシミュレート
            contextManager.clearContextCache();
            
            expect(contextManager.contextCache.size).toBe(0);
        });
    });

    describe('エラーハンドリング', () => {
        test('シーン取得エラーが処理される', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockImplementation(() => {
                throw new Error('Scene error');
            });

            const context = contextManager.detectCurrentContext();

            expect(context).toBeDefined();
            expect(context.sceneName).toBe('unknown');
            expect(context.error).toBe(true);
        });

        test('ツールチップ表示エラーが処理される', () => {
            const invalidContent = null;

            const result = contextManager.showContextualTooltip(100, 100, invalidContent);

            expect(result).toBe(false);
            expect(contextManager.currentTooltip).toBeNull();
        });

        test('不正な座標でのツールチップ表示', () => {
            const content = { title: 'テスト' };

            const result = contextManager.showContextualTooltip(-100, -100, content);

            expect(result).toBe(true);
            // 座標は自動的に調整される
            expect(contextManager.currentTooltip.x).toBeGreaterThanOrEqual(0);
            expect(contextManager.currentTooltip.y).toBeGreaterThanOrEqual(0);
        });
    });

    describe('クリーンアップ', () => {
        test('cleanup時にリソースが適切に解放される', () => {
            const element = { id: 'test' };
            const content = { title: 'テスト' };

            contextManager.registerTooltip(element, content);
            contextManager.showContextualTooltip(100, 100, content);

            contextManager.destroy();

            expect(contextManager.tooltipElements.size).toBe(0);
            expect(contextManager.currentTooltip).toBeNull();
            expect(contextManager.contextCache.size).toBe(0);
        });
    });
});