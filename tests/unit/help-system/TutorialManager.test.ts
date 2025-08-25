/**
 * TutorialManager ユニットテスト
 */
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { TutorialManager } from '../../../src/core/help/TutorialManager';

// Type definitions
interface MockGameEngine {
    localizationManager: {
        getCurrentLanguage: jest.Mock<() => string>;
        getString: jest.Mock<(key: string) => string>;
    };
    sceneManager: {
        getCurrentScene: jest.Mock<() => MockScene>;
    };
    canvas: { width: number; height: number; };
    playerData: {
        getTutorialProgress: jest.Mock<() => Record<string, any>>;
        saveTutorialProgress: jest.Mock<(progress: TutorialProgress) => void>;
    };
}

interface MockScene {
    constructor: { name: string; };
}

interface MockContentLoader {
    loadTutorialData: jest.Mock<(id?: string) => Promise<Tutorial[]>>;
    getCachedContent: jest.Mock;
}

interface TutorialStep {
    id: string;
    title: string;
    instructions?: string;
    targetElement?: string;
    waitForAction?: string;
    validationFunction?: string;
    skipAllowed?: boolean;
}

interface Tutorial {
    id: string;
    title?: string;
    steps: TutorialStep[];
}

interface TutorialProgress {
    tutorialId: string;
    currentStep: number;
    completedSteps: string[];
    isCompleted: boolean;
}

interface ProgressInfo {
    currentStep: number;
    totalSteps: number;
    percentage: number;
}

interface MockDOMRect {
    left: number;
    top: number;
    width: number;
    height: number;
    right?: number;
    bottom?: number;
}

interface MockElement {
    getBoundingClientRect: () => MockDOMRect;
}

interface MockDocument {
    querySelector: jest.Mock<(selector: string) => MockElement | null>;
    createElement: jest.Mock<(tagName: string) => {}>;
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
    canvas: { width: 800, height: 600 },
    playerData: {
        getTutorialProgress: jest.fn(() => ({})),
        saveTutorialProgress: jest.fn()
    }
};

const mockContentLoader: MockContentLoader = {
    loadTutorialData: jest.fn(),
    getCachedContent: jest.fn()
};

// Mock existing class
jest.mock('../../../src/core/LocalizationManager', () => ({
    LocalizationManager: jest.fn(() => ({
        getCurrentLanguage: jest.fn(() => 'ja'),
        getString: jest.fn((key: string) => `translated_${key}`)
    }))
}));

describe('TutorialManager', () => {
    let tutorialManager: TutorialManager;
    
    beforeEach(() => {
        jest.clearAllMocks();
        tutorialManager = new TutorialManager(mockGameEngine);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('初期化', () => {
        test('正常に初期化される', () => {
            expect(tutorialManager).toBeDefined();
            expect(tutorialManager).toBeInstanceOf(TutorialManager);
        });

        test('ゲームエンジンが正しく設定される', () => {
            expect(tutorialManager.gameEngine).toBe(mockGameEngine);
        });
    });

    describe('チュートリアル管理', () => {
        const mockTutorial: Tutorial = {
            id: 'basic_tutorial',
            title: 'Basic Tutorial',
            steps: [
                {
                    id: 'step1',
                    title: 'Step 1',
                    instructions: 'First step instructions'
                },
                {
                    id: 'step2',
                    title: 'Step 2',
                    instructions: 'Second step instructions'
                }
            ]
        };

        test('チュートリアルを開始できる', () => {
            expect(() => {
                tutorialManager.startTutorial(mockTutorial.id);
            }).not.toThrow();
        });

        test('チュートリアルの進行状況を取得できる', () => {
            const progress = tutorialManager.getProgress(mockTutorial.id);
            expect(progress).toBeDefined();
        });

        test('チュートリアルを完了できる', () => {
            expect(() => {
                tutorialManager.completeTutorial(mockTutorial.id);
            }).not.toThrow();
        });
    });

    describe('ステップ管理', () => {
        test('次のステップに進める', () => {
            expect(() => {
                tutorialManager.nextStep();
            }).not.toThrow();
        });

        test('前のステップに戻れる', () => {
            expect(() => {
                tutorialManager.previousStep();
            }).not.toThrow();
        });

        test('特定のステップにジャンプできる', () => {
            expect(() => {
                tutorialManager.goToStep(1);
            }).not.toThrow();
        });
    });

    describe('UI表示', () => {
        test('チュートリアルUIを表示できる', () => {
            expect(() => {
                tutorialManager.showUI();
            }).not.toThrow();
        });

        test('チュートリアルUIを非表示にできる', () => {
            expect(() => {
                tutorialManager.hideUI();
            }).not.toThrow();
        });
    });

    describe('エラーハンドリング', () => {
        test('存在しないチュートリアルIDでもエラーが発生しない', () => {
            expect(() => {
                tutorialManager.startTutorial('non-existent');
            }).not.toThrow();
        });

        test('無効なステップ番号でもエラーが発生しない', () => {
            expect(() => {
                tutorialManager.goToStep(-1);
            }).not.toThrow();
        });
    });
});