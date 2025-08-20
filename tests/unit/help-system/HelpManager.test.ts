/**
 * HelpManager ユニットテスト
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { HelpManager } from '../../../src/core/help/HelpManager';

// Type definitions
interface MockGameEngine {
    localizationManager: {
        getCurrentLanguage: jest.Mock<() => string>;
        getString: jest.Mock<(key: string) => string>;
    };
    sceneManager: {
        getCurrentScene: jest.Mock<() => MockScene>;
    };
    canvas: { width: number; height: number };
}

interface MockScene {
    constructor: { name: string };
}

interface MockContentLoader {
    loadHelpContent: jest.Mock<(category: string, language: string) => Promise<HelpContent[]>>;
    getCachedContent: jest.Mock;
    setCachedContent: jest.Mock;
}

interface MockSearchEngine {
    search: jest.Mock<(query: string, options?: any) => Promise<SearchResult[]>>;
    indexContent: jest.Mock;
    getSuggestions: jest.Mock<(query: string) => Promise<string[]>>;
}

interface HelpContent {
    id: string;
    category: string;
    title: string;
    content: string;
    language: string;
}

interface SearchResult {
    id: string;
    title: string;
    relevance: number;
}

interface UsageStats {
    totalTime: number;
    viewCount: number;
}

interface UserProgress {
    readSections: string[];
    totalReadSections: number;
    usageStats: Map<string, UsageStats>;
}

interface Tooltip {
    content: string;
    element?: any;
}

interface ContextualHelp {
    context: string;
    content?: string;
}

// Mock creation
const mockGameEngine: MockGameEngine = {
    localizationManager: {
        getCurrentLanguage: jest.fn(() => 'ja'),
        getString: jest.fn((key: string) => `translated_${key}`)
    },
    sceneManager: {
        getCurrentScene: jest.fn(() => ({ constructor: { name: 'GameScene' } }))
    },
    canvas: { width: 800, height: 600 }
};

const mockContentLoader: MockContentLoader = {
    loadHelpContent: jest.fn(),
    getCachedContent: jest.fn(),
    setCachedContent: jest.fn()
};

const mockSearchEngine: MockSearchEngine = {
    search: jest.fn(),
    indexContent: jest.fn(),
    getSuggestions: jest.fn()
};

// Mock setup removed since we're using actual classes

describe('HelpManager', () => {
    let helpManager: HelpManager;
    
    beforeEach(() => {
        jest.clearAllMocks();
        helpManager = new HelpManager(mockGameEngine);
    });

    afterEach(() => {
        if (helpManager) {
            helpManager.destroy();
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
        const mockHelpContent: HelpContent = {
            id: 'test-help',
            category: 'gameplay',
            title: 'テストヘルプ',
            content: 'テスト用のヘルプコンテンツです',
            language: 'ja'
        };

        test('ヘルプコンテンツを読み込める', async () => {
            jest.spyOn(helpManager.contentLoader, 'loadHelpContent').mockResolvedValue([mockHelpContent]);

            const result = await helpManager.loadHelpContent('gameplay', 'ja');

            expect(helpManager.contentLoader.loadHelpContent).toHaveBeenCalledWith('gameplay', 'ja');
            expect(result).toEqual([mockHelpContent]);
        });

        test('読み込みエラーが適切に処理される', async () => {
            const error = new Error('読み込みエラー');
            jest.spyOn(helpManager.contentLoader, 'loadHelpContent').mockRejectedValue(error);

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
        const mockSearchResults: SearchResult[] = [
            { id: 'result1', title: 'Result 1', relevance: 0.9 },
            { id: 'result2', title: 'Result 2', relevance: 0.7 }
        ];

        test('コンテンツを検索できる', async () => {
            jest.spyOn(helpManager.searchEngine, 'search').mockResolvedValue(mockSearchResults);

            const result = await helpManager.searchContent('テスト', { category: 'gameplay' });

            expect(helpManager.searchEngine.search).toHaveBeenCalledWith('テスト', { category: 'gameplay' });
            expect(result).toEqual(mockSearchResults);
        });

        test('検索エラーが適切に処理される', async () => {
            const error = new Error('検索エラー');
            jest.spyOn(helpManager.searchEngine, 'search').mockRejectedValue(error);

            const result = await helpManager.searchContent('テスト');
            expect(result).toEqual([]); // Error returns empty array
        });

        test('検索提案を取得できる', async () => {
            const mockSuggestions = ['suggestion1', 'suggestion2'];
            jest.spyOn(helpManager.searchEngine, 'getSuggestions').mockResolvedValue(mockSuggestions);

            const result = await helpManager.getSearchSuggestions('テス');

            expect(helpManager.searchEngine.getSuggestions).toHaveBeenCalledWith('テス');
            expect(result).toEqual(mockSuggestions);
        });
    });

    describe('コンテキスト対応', () => {
        test('現在のシーンに基づくコンテキストヘルプを取得できる', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'GameScene' }
            });

            const result = helpManager.getContextualHelp('bubble_click') as ContextualHelp;

            expect(result).toBeDefined();
            expect(result.context).toBe('GameScene');
        });

        test('ツールチップを表示できる', () => {
            const element = { x: 100, y: 100 };
            const content = 'ツールチップの内容';

            helpManager.showTooltip(element, content);

            expect(helpManager.currentTooltip).toBeDefined();
            expect(helpManager.currentTooltip!.content).toBe(content);
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
            const stats = helpManager.usageStats.get(sectionId)!;
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

            const progress = helpManager.getUserHelpProgress() as UserProgress;

            expect(progress.readSections).toEqual(['section1', 'section2']);
            expect(progress.totalReadSections).toBe(2);
            expect(progress.usageStats).toBeDefined();
        });
    });

    describe('エラーハンドリング', () => {
        test('不正な言語でのコンテンツ読み込みエラーを処理', async () => {
            jest.spyOn(helpManager.contentLoader, 'loadHelpContent').mockRejectedValue(new Error('Invalid language'));

            const result = await helpManager.loadHelpContent('gameplay', 'invalid');
            expect(result).toEqual([]);
        });

        test('ツールチップ表示時のエラーを処理', () => {
            const invalidElement = null;
            const content = 'テスト内容';

            // Should not throw exception even with error
            expect(() => helpManager.showTooltip(invalidElement, content)).not.toThrow();
        });
    });

    describe('メモリ管理', () => {
        test('cleanup時にリソースが適切に解放される', () => {
            helpManager.helpContent = new Map([['test', { id: 'test' } as HelpContent]]);
            helpManager.usageStats = new Map([['test', { totalTime: 0, viewCount: 0 }]]);
            helpManager.readSections = new Set(['section1']);

            helpManager.destroy();

            expect(helpManager.helpContent.size).toBe(0);
            expect(helpManager.usageStats.size).toBe(0);
            expect(helpManager.readSections.size).toBe(0);
        });
    });

    describe('多言語対応', () => {
        test('言語変更時にコンテンツが再読み込みされる', async () => {
            mockGameEngine.localizationManager.getCurrentLanguage.mockReturnValue('en');
            jest.spyOn(helpManager.contentLoader, 'loadHelpContent').mockResolvedValue([]);

            await helpManager.handleLanguageChange('en');

            expect(helpManager.contentLoader.loadHelpContent).toHaveBeenCalledWith(expect.any(String), 'en');
        });

        test('フォールバック言語が適切に処理される', async () => {
            jest.spyOn(helpManager.contentLoader, 'loadHelpContent')
                .mockRejectedValueOnce(new Error('Language not found'))
                .mockResolvedValueOnce([{ id: 'fallback', language: 'ja' } as HelpContent]);

            const result = await helpManager.loadHelpContent('gameplay', 'ko');

            expect(helpManager.contentLoader.loadHelpContent).toHaveBeenCalledTimes(2);
            expect(result).toHaveLength(1);
        });
    });
});