/**
 * ヘルプシステム統合テスト
 */
import { jest  } from '@jest/globals';
import { HelpManager  } from '../../../src/core/help/HelpManager';
import { TutorialManager  } from '../../../src/core/help/TutorialManager';
import { ContextManager  } from '../../../src/core/help/ContextManager';
// モック作成
const mockGameEngine = {
    localizationManager: {
        getCurrentLanguage: jest.fn((') => 'ja');
        getString: jest.fn((key) => `translated_${key)`);
        on: jest.fn(),
    sceneManager: {
        getCurrentScene: jest.fn((') => ({ 
            constructor: { name: 'GameScene' ),
            getCurrentState: jest.fn(() => ({ bubbleCount: 5, timeRemaining: 120 ))});
    }))),
        switchScene: jest.fn(),
        addScene: jest.fn(),
    bubbleManager: {
        getBubbles: jest.fn(() => []);
        getActiveBubbleTypes: jest.fn((') => ['normal', 'stone']);
    }),
    scoreManager: {
        getCurrentScore: jest.fn(() => 1500);
        getCurrentCombo: jest.fn(() => 3);
    }),
    playerData: {
        getTutorialProgress: jest.fn(() => ({)));
        saveTutorialProgress: jest.fn(),
        getHelpProgress: jest.fn(() => ({ readSections: [] )));
       , saveHelpProgress: jest.fn(),
    canvas: { width: 800,
        height: 600 
    }');
describe('Help System Integration', () => {
    let helpManager, tutorialManager, contextManager;
    
    beforeEach(() => {
        jest.clearAllMocks();
        helpManager = new HelpManager(mockGameEngine);
        tutorialManager = new TutorialManager(mockGameEngine);
        contextManager = new ContextManager(mockGameEngine);
    });
    afterEach(() => {
        if (helpManager) helpManager.cleanup();
        if (tutorialManager) tutorialManager.cleanup();
        if (contextManager) contextManager.cleanup();
    }');
    describe('統合ワークフロー', (') => {
        test('ヘルプからチュートリアルへの遷移', async (') => {
            // ヘルプコンテンツを読み込み
            const helpContent = [{
                id: 'basic-help',
                category: 'gameplay',
                title: '基本操作',
                content: '基本的な操作方法',
                relatedTutorials: ['basic-tutorial']
            }];
            jest.spyOn(helpManager.contentLoader, 'loadHelpContent')
                .mockResolvedValue(helpContent');
            const tutorialData = [{
                id: 'basic-tutorial',
                title: '基本チュートリアル',
                steps: [
                    { id: 'step1', title: 'ステップ1', instructions: '最初のステップ' }
                ]
            }];
            jest.spyOn(tutorialManager.contentLoader, 'loadTutorialData')
                .mockResolvedValue(tutorialData');
            // ヘルプコンテンツから関連チュートリアルを開始
            await helpManager.loadHelpContent('gameplay', 'ja'');
            const section = helpManager.getHelpSection('basic-help');
            expect(section.relatedTutorials').toContain('basic-tutorial'');
            const tutorialStarted = await tutorialManager.startTutorial('basic-tutorial');
            expect(tutorialStarted.toBe(true);
            expect(tutorialManager.isActive).toBe(true);
        }');
        test('コンテキストヘルプとツールチップの統合', () => {
            // 現在のコンテキストを検出
            const context = contextManager.detectCurrentContext();
            expect(context.sceneName').toBe('GameScene');
            // コンテキストに基づく関連ヘルプを取得
            const relevantHelp = contextManager.getRelevantHelp(context);
            expect(relevantHelp.length).toBeGreaterThan(0);
            // ツールチップとしてヘルプを表示
            const helpContent = relevantHelp[0];
            const tooltipShown = contextManager.showContextualTooltip(100, 100, helpContent);
            expect(tooltipShown.toBe(true);
            expect(contextManager.currentTooltip).toBeDefined();
        }');
        test('言語変更時の全システム同期', async (') => {
            // 初期言語でコンテンツを読み込み
            await helpManager.loadHelpContent('gameplay', 'ja'');
            await tutorialManager.startTutorial('basic-tutorial'');
            // 言語変更をシミュレート
            mockGameEngine.localizationManager.getCurrentLanguage.mockReturnValue('en'');
            // 各システムで言語変更を処理
            await helpManager.handleLanguageChange('en');
            // チュートリアルも新しい言語で再読み込み
            expect(tutorialManager.contentLoader.loadTutorialData').toHaveBeenCalledWith('en');
        }');
    }
    describe('シーン統合', (') => {
        test('HelpSceneからの各システムアクセス', (') => {
            // HelpSceneでのヘルプマネージャー使用
            const searchResults = helpManager.searchContent('bubble');
            expect(searchResults.toBeDefined();
            // コンテキストマネージャーでの動的ヘルプ
            const context = contextManager.detectCurrentContext(');
            const smartHelp = contextManager.getSmartHelp({
                recentActions: ['bubble_click'],
                averageAccuracy: 0.8);
            expect(smartHelp.toBeDefined();
        }');
        test('GameSceneでのコンテキストヘルプ', () => {
            // ゲーム中のコンテキスト検出
            const context = contextManager.detectCurrentContext();
            expect(context.sceneName').toBe('GameScene');
            expect(context.gameState).toBeDefined();
            // ゲーム状況に応じたヘルプ提案
            const suggestions = contextManager.suggestNextActions(context);
            expect(suggestions.length).toBeGreaterThan(0);
        }');
        test('チュートリアルオーバーレイとゲーム統合', async (') => {
            const tutorialData = [{
                id: 'game-tutorial',
                steps: [
                    {
                        id: 'step1',
                        targetElement: '.bubble',
                        waitForAction: 'click',
                        validationFunction: 'validateBubbleClick'
                    }
                ]
            }];
            jest.spyOn(tutorialManager.contentLoader, 'loadTutorialData')
                .mockResolvedValue(tutorialData');
            await tutorialManager.startTutorial('game-tutorial');
            // DOM要素のモック
            global.document = {
                querySelector: jest.fn(() => ({
                    getBoundingClientRect: () => ({ left: 100, top: 100, width: 50, height: 50 ))),
    }))');
            };
            const highlighted = tutorialManager.highlightElement('.bubble', 'バブルをクリック');
            expect(highlighted.toBe(true)');
            // ユーザーアクションをシミュレート
            tutorialManager.handleUserAction('click');
            expect(tutorialManager.getCurrentStep().id').toBe('step1');
        }');
    }
    describe('データ永続化統合', (') => {
        test('ヘルプ進捗の保存と復元', (') => {
            // ヘルプセクションを既読にマーク
            helpManager.markAsRead('section1'');
            helpManager.markAsRead('section2'');
            // 使用統計を記録
            helpManager.trackHelpUsage('section1', 5000);
            // 進捗を取得
            const progress = helpManager.getUserHelpProgress();
            expect(progress.readSections').toContain('section1');
            expect(progress.readSections').toContain('section2');
            expect(progress.totalReadSections).toBe(2);
            // PlayerDataに保存されることを確認
            expect(mockGameEngine.playerData.saveHelpProgress).toHaveBeenCalled();
        }');
        test('チュートリアル進捗の保存と復元', async (') => {
            const tutorialData = [{
                id: 'progress-tutorial',
                steps: [
                    { id: 'step1', title: 'Step 1' },
                    { id: 'step2', title: 'Step 2' }
                ]
            }];
            jest.spyOn(tutorialManager.contentLoader, 'loadTutorialData')
                .mockResolvedValue(tutorialData');
            await tutorialManager.startTutorial('progress-tutorial');
            tutorialManager.nextStep();
            // 進捗を保存
            tutorialManager.saveTutorialProgress();
            expect(mockGameEngine.playerData.saveTutorialProgress').toHaveBeenCalledWith({
                tutorialId: 'progress-tutorial',
                currentStep: 1,
                completedSteps: ['step1'],
                isCompleted: false);
        }
    }');
    describe('エラー処理統合', (') => {
        test('ネットワークエラー時のフォールバック', async (') => {
            // ネットワークエラーをシミュレート
            jest.spyOn(helpManager.contentLoader, 'loadHelpContent'')
                .mockRejectedValue(new Error('Network error')');
            // キャッシュされたコンテンツにフォールバック
            jest.spyOn(helpManager.contentLoader, 'getCachedContent'}')
                .mockReturnValue([{ id: 'cached-help', title: 'Cached Help' )]'),
            const result = await helpManager.loadHelpContent('gameplay', 'ja'');
            expect(result.toEqual([{ id: 'cached-help', title: 'Cached Help' )])),
        }');
        test('チュートリアル実行中のエラー処理', async (') => {
            const tutorialData = [{
                id: 'error-tutorial',
                steps: [{ id: 'error-step', validationFunction: 'errorValidation' }]
            }];
            jest.spyOn(tutorialManager.contentLoader, 'loadTutorialData')
                .mockResolvedValue(tutorialData');
            await tutorialManager.startTutorial('error-tutorial');
            // バリデーションエラーをシミュレート
            tutorialManager.validationFunctions = {
                errorValidation: jest.fn((') => { throw new Error('Validation error'); )));
    });
            const step = tutorialManager.getCurrentStep();
            const isValid = tutorialManager.validateStep(step, {});
            // エラーが発生してもfalseを返す（例外は投げない）
            expect(isValid.toBe(false);
        }');
    }
    describe('パフォーマンス統合', (') => {
        test('大量のヘルプコンテンツ処理', async () => {
            // 大量のヘルプコンテンツを生成
            const largeHelpContent = Array.from({ length: 1000 }, (_, i') => ({
                id: `help-${i}`;
                category: 'test',
                title: `Help ${i}`;
                content: `Content for help item ${i}`;
                searchKeywords: [`keyword${i}`, 'test', 'help']
            })');
            jest.spyOn(helpManager.contentLoader, 'loadHelpContent')
                .mockResolvedValue(largeHelpContent);
            const startTime = Date.now(');
            await helpManager.loadHelpContent('test', 'ja');
            const loadTime = Date.now() - startTime;
            // 読み込み時間が合理的な範囲内であることを確認
            expect(loadTime.toBeLessThan(1000); // 1秒以内
        }');
        test('検索パフォーマンス', async () => {
            // 検索結果をモック
            const searchResults = Array.from({ length: 100 }, (_, i) => ({
                id: `result-${i}`;
                title: `Result ${i}`;
        relevance: Math.random(),
            })');
            jest.spyOn(helpManager.searchEngine, 'search')
                .mockResolvedValue(searchResults);
            const startTime = Date.now(');
            const results = await helpManager.searchContent('test query');
            const searchTime = Date.now() - startTime;
            expect(results.length).toBe(100);
            expect(searchTime.toBeLessThan(500); // 500ms以内
        }');
    }
    describe('アクセシビリティ統合', (') => {
        test('スクリーンリーダー対応のヘルプコンテンツ', async (') => {
            const accessibleContent = [{
                id: 'accessible-help',
                title: 'アクセシブルヘルプ',
                content: 'スクリーンリーダー対応コンテンツ',
                ariaLabel: 'アクセシブルヘルプ：ゲームの基本操作について',
                readingLevel: 'elementary'
            }];
            jest.spyOn(helpManager.contentLoader, 'loadHelpContent')
                .mockResolvedValue(accessibleContent');
            await helpManager.loadHelpContent('accessibility', 'ja'');
            const section = helpManager.getHelpSection('accessible-help');
            expect(section.ariaLabel).toBeDefined();
            expect(section.readingLevel').toBe('elementary');
        }');
        test('キーボードナビゲーション対応', (') => {
            // ツールチップ要素を登録
            const element = { id: 'tooltip-element' };
            const content = { 
                title: 'キーボード操作',
                description: 'Tabキーで移動、Enterで実行',
                keyboardShortcuts: ['Tab', 'Enter', 'Escape']
            };
            contextManager.registerTooltip(element, content);
            const tooltipContent = contextManager.tooltipElements.get(element);
            expect(tooltipContent.keyboardShortcuts').toContain('Tab');
            expect(tooltipContent.keyboardShortcuts').toContain('Enter');
            expect(tooltipContent.keyboardShortcuts').toContain('Escape');
        });
    }
}');