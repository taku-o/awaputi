/**
 * HelpManager ユニットテスト
 */

import { jest } from '@jest/globals';
import { HelpManager } from '../../../src/core/help/HelpManager.js';

// モック作成
const mockGameEngine = {
    localizationManager: {
        getCurrentLanguage: jest.fn(() => 'ja'),
        getString: jest.fn((key) => `translated_${key}`)
    },
    sceneManager: {
        getCurrentScene: jest.fn(() => ({ constructor: { name: 'GameScene' } }))
    },
    canvas: { width: 800, height: 600 }
};

const mockContentLoader = {
    loadHelpContent: jest.fn(),
    getCachedContent: jest.fn(),
    setCachedContent: jest.fn()
};

const mockSearchEngine = {
    search: jest.fn(),
    indexContent: jest.fn(),
    getSuggestions: jest.fn()
};

// モック設定
jest.mock('../../../src/core/help/components/ContentLoader.js', () => ({
    ContentLoader: jest.fn(() => mockContentLoader)
}));

jest.mock('../../../src/core/help/components/SearchEngine.js', () => ({
    SearchEngine: jest.fn(() => mockSearchEngine)
}));

describe('HelpManager', () => {
    let helpManager;
    
    beforeEach(() => {
        jest.clearAllMocks();
        helpManager = new HelpManager(mockGameEngine);
    });

    afterEach(() => {
        if (helpManager) {
            helpManager.cleanup();
        }
    });

    describe('初期化', () => {
        test('正常に初期化される', () => {
            expect(helpManager).toBeInstanceOf(HelpManager);
            expect(helpManager.gameEngine).toBe(mockGameEngine);
            expect(helpManager.isInitialized).toBe(true);
        });

        test('必要なコンポーネントが初期化される', () => {
            expect(helpManager.contentLoader).toBeDefined();
            expect(helpManager.searchEngine).toBeDefined();
            expect(helpManager.contextManager).toBeDefined();
        });
    });

    describe('コンテンツ管理', () => {
        const mockHelpContent = {
            id: 'test-help',
            category: 'gameplay',
            title: 'テストヘルプ',
            content: 'テスト用のヘルプコンテンツです',
            language: 'ja'
        };

        test('ヘルプコンテンツを読み込める', async () => {
            mockContentLoader.loadHelpContent.mockResolvedValue([mockHelpContent]);

            const result = await helpManager.loadHelpContent('gameplay', 'ja');

            expect(mockContentLoader.loadHelpContent).toHaveBeenCalledWith('gameplay', 'ja');
            expect(result).toEqual([mockHelpContent]);
        });

        test('読み込みエラーが適切に処理される', async () => {
            const error = new Error('読み込みエラー');
            mockContentLoader.loadHelpContent.mockRejectedValue(error);

            await expect(helpManager.loadHelpContent('gameplay', 'ja')).rejects.toThrow('読み込みエラー');
        });

        test('ヘルプセクションを取得できる', () => {
            helpManager.helpContent = new Map([
                ['test-section', mockHelpContent]
            ]);

            const result = helpManager.getHelpSection('test-section');
            expect(result).toEqual(mockHelpContent);

            const nonExistent = helpManager.getHelpSection('non-existent');
            expect(nonExistent).toBeNull();
        });
    });

    describe('検索機能', () => {
        const mockSearchResults = [
            { id: 'result1', title: 'Result 1', relevance: 0.9 },
            { id: 'result2', title: 'Result 2', relevance: 0.7 }
        ];

        test('コンテンツを検索できる', async () => {
            mockSearchEngine.search.mockResolvedValue(mockSearchResults);

            const result = await helpManager.searchContent('テスト', { category: 'gameplay' });

            expect(mockSearchEngine.search).toHaveBeenCalledWith('テスト', { category: 'gameplay' });
            expect(result).toEqual(mockSearchResults);
        });

        test('検索エラーが適切に処理される', async () => {
            const error = new Error('検索エラー');
            mockSearchEngine.search.mockRejectedValue(error);

            const result = await helpManager.searchContent('テスト');
            expect(result).toEqual([]); // エラー時は空配列を返す
        });

        test('検索提案を取得できる', async () => {
            const mockSuggestions = ['suggestion1', 'suggestion2'];
            mockSearchEngine.getSuggestions.mockResolvedValue(mockSuggestions);

            const result = await helpManager.getSearchSuggestions('テス');

            expect(mockSearchEngine.getSuggestions).toHaveBeenCalledWith('テス');
            expect(result).toEqual(mockSuggestions);
        });
    });

    describe('コンテキスト対応', () => {
        test('現在のシーンに基づくコンテキストヘルプを取得できる', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'GameScene' }
            });

            const result = helpManager.getContextualHelp('bubble_click');

            expect(result).toBeDefined();
            expect(result.context).toBe('GameScene');
        });

        test('ツールチップを表示できる', () => {
            const element = { x: 100, y: 100 };
            const content = 'ツールチップの内容';

            helpManager.showTooltip(element, content);

            expect(helpManager.currentTooltip).toBeDefined();
            expect(helpManager.currentTooltip.content).toBe(content);
        });

        test('ツールチップを非表示にできる', () => {
            helpManager.currentTooltip = { content: 'test' };

            helpManager.hideTooltip();

            expect(helpManager.currentTooltip).toBeNull();
        });
    });

    describe('ユーザー進捗', () => {
        test('ヘルプ使用状況を追跡できる', () => {
            const sectionId = 'test-section';
            const duration = 5000;

            helpManager.trackHelpUsage(sectionId, duration);

            expect(helpManager.usageStats.has(sectionId)).toBe(true);
            const stats = helpManager.usageStats.get(sectionId);
            expect(stats.totalTime).toBe(duration);
            expect(stats.viewCount).toBe(1);
        });

        test('ヘルプセクションを既読としてマークできる', () => {
            const sectionId = 'test-section';

            helpManager.markAsRead(sectionId);

            expect(helpManager.readSections.has(sectionId)).toBe(true);
        });

        test('ユーザーヘルプ進捗を取得できる', () => {
            helpManager.readSections.add('section1');
            helpManager.readSections.add('section2');
            helpManager.usageStats.set('section1', { totalTime: 1000, viewCount: 1 });

            const progress = helpManager.getUserHelpProgress();

            expect(progress.readSections).toEqual(['section1', 'section2']);
            expect(progress.totalReadSections).toBe(2);
            expect(progress.usageStats).toBeDefined();
        });
    });

    describe('エラーハンドリング', () => {
        test('不正な言語でのコンテンツ読み込みエラーを処理', async () => {
            mockContentLoader.loadHelpContent.mockRejectedValue(new Error('Invalid language'));

            const result = await helpManager.loadHelpContent('gameplay', 'invalid');
            expect(result).toEqual([]);
        });

        test('ツールチップ表示時のエラーを処理', () => {
            const invalidElement = null;
            const content = 'テスト内容';

            // エラーが発生しても例外は投げない
            expect(() => helpManager.showTooltip(invalidElement, content)).not.toThrow();
        });
    });

    describe('メモリ管理', () => {
        test('cleanup時にリソースが適切に解放される', () => {
            helpManager.helpContent = new Map([['test', 'content']]);
            helpManager.usageStats = new Map([['test', 'stats']]);
            helpManager.readSections = new Set(['section1']);

            helpManager.cleanup();

            expect(helpManager.helpContent.size).toBe(0);
            expect(helpManager.usageStats.size).toBe(0);
            expect(helpManager.readSections.size).toBe(0);
        });
    });

    describe('多言語対応', () => {
        test('言語変更時にコンテンツが再読み込みされる', async () => {
            mockGameEngine.localizationManager.getCurrentLanguage.mockReturnValue('en');
            mockContentLoader.loadHelpContent.mockResolvedValue([]);

            await helpManager.handleLanguageChange('en');

            expect(mockContentLoader.loadHelpContent).toHaveBeenCalledWith(expect.any(String), 'en');
        });

        test('フォールバック言語が適切に処理される', async () => {
            mockContentLoader.loadHelpContent
                .mockRejectedValueOnce(new Error('Language not found'))
                .mockResolvedValueOnce([{ id: 'fallback', language: 'ja' }]);

            const result = await helpManager.loadHelpContent('gameplay', 'ko');

            expect(mockContentLoader.loadHelpContent).toHaveBeenCalledTimes(2);
            expect(result).toHaveLength(1);
        });
    });
});