/**
 * TutorialManager ユニットテスト
 */
import { jest, describe, test, expect, beforeEach, afterEach  } from '@jest/globals';
import { TutorialManager  } from '../../../src/core/help/TutorialManager';
// Type definitions
interface MockGameEngine {
    localizationManager: {
        getCurrentLanguag,e: jest.Mock<() => string>;
        getString: jest.Mock<(ke,y: string) => string>
    },
    sceneManager: {
        getCurrentScene: jest.Mock<() => MockScene>
    },
    canvas: { width: number,, height: number;
    playerData: {
        getTutorialProgress: jest.Mock<() => Record<string, any>>;
        saveTutorialProgress: jest.Mock<(progress: TutorialProgress) => void> };
}
interface MockScene {
    constructor: { nam,e: string;
}
interface MockContentLoader {
    loadTutorialData: jest.Mock<(i,d?: string) => Promise<Tutorial[]>>;
    getCachedContent: jest.Mock }
interface TutorialStep {
    id: string;
    title: string;
    instructions?: string;
    targetElement?: string;
    waitForAction?: string;
    validationFunction?: string;
    skipAllowed?: boolean;
interface Tutorial {
    id: string;
    title?: string;
    steps: TutorialStep[];
interface TutorialProgress {
    tutorialId: string;
    currentStep: number;
    completedSteps: string[];
    isCompleted: boolean;
interface ProgressInfo {
    currentStep: number;
    totalSteps: number;
    percentage: number;
interface MockDOMRect {
    left: number;
    top: number;
    width: number;
    height: number;
    right?: number;
    bottom?: number;
interface MockElement {
    getBoundingClientRect: () => MockDOMRect }
interface MockDocument {
    querySelector: jest.Mock<(selecto,r: string) => MockElement | null>;
    createElement: jest.Mock<(tagNam,e: string) => {}>;
}
// Mock creation
const mockGameEngine: MockGameEngine = {
    localizationManager: {
        getCurrentLanguage: jest.fn((') => 'ja'),'
        getString: jest.fn((key: string) => `translated_${key)`),
    }),
    sceneManager: {
        getCurrentScene: jest.fn((') => ({ constructor: { name: 'GameScene' ) )) },'
    canvas: { width: 800, height: 600 },
    playerData: {
        getTutorialProgress: jest.fn(() => ({)),
        saveTutorialProgress: jest.fn(),
);
const mockContentLoader: MockContentLoader = {
    loadTutorialData: jest.fn(
        getCachedContent: jest.fn()' };'
// Mock existing class
jest.mock('../../../src/core/LocalizationManager', () => ({
    LocalizationManager: jest.fn(() => ({
        getCurrentLanguage: jest.fn((') => 'ja'),'
        getString: jest.fn((key: string) => `translated_${key)`),
    }))
))');'
describe('TutorialManager', () => {
    let tutorialManager: TutorialManager,
    
    beforeEach(() => {
        jest.clearAllMocks();
        tutorialManager = new TutorialManager(mockGameEngine) };
    afterEach(() => {
        if (tutorialManager) {
            tutorialManager.destroy() }
    }');'
    describe('初期化', (') => {'
        test('正常に初期化される', () => {
            expect(tutorialManager).toBeInstanceOf(TutorialManager);
            expect(tutorialManager.gameEngine).toBe(mockGameEngine);
            expect(tutorialManager.isInitialized).toBe(true) }');'
        test('初期状態が正しく設定される', () => {
            expect(tutorialManager.currentTutorial).toBeNull();
            expect(tutorialManager.currentStep).toBe(0);
            expect(tutorialManager.isActive).toBe(false);
            expect(tutorialManager.isPaused).toBe(false) }');'
    }
    describe('チュートリアル制御', (') => {'
        const mockTutorial: Tutorial = {
            id: 'basic-tutorial',
            title: '基本チュートリアル',
            steps: [
                {
                    id: 'step1',
                    title: 'ステップ1',
                    instructions: '最初のステップです',
                    targetElement: '.bubble',
                    waitForAction: 'click',
                    validationFunction: 'validateBubbleClick'
                },
                {
                    id: 'step2',
                    title: 'ステップ2', 
                    instructions: '2番目のステップです',
                    targetElement: '.score',
                    waitForAction: 'none'
                }
            ]
        };
        beforeEach((') => {'
            jest.spyOn(tutorialManager.contentLoader, 'loadTutorialData').mockResolvedValue([mockTutorial]) }');'
        test('チュートリアルを開始できる', async (') => {'
            const result = await tutorialManager.startTutorial('basic-tutorial');
            expect(result).toBe(true);
            expect(tutorialManager.currentTutorial).toEqual(mockTutorial);
            expect(tutorialManager.currentStep).toBe(0);
            expect(tutorialManager.isActive).toBe(true);
            expect(tutorialManager.isPaused).toBe(false) }');'
        test('存在しないチュートリアルの開始は失敗する', async (') => {'
            jest.spyOn(tutorialManager.contentLoader, 'loadTutorialData').mockResolvedValue([]'),'
            const result = await tutorialManager.startTutorial('non-existent');
            expect(result).toBe(false);
            expect(tutorialManager.currentTutorial).toBeNull();
            expect(tutorialManager.isActive).toBe(false) }');'
        test('チュートリアルを一時停止できる', async (') => {'
            await tutorialManager.startTutorial('basic-tutorial');
            tutorialManager.pauseTutorial();
            expect(tutorialManager.isPaused).toBe(true);
            expect(tutorialManager.isActive).toBe(true) }');'
        test('チュートリアルを再開できる', async (') => {'
            await tutorialManager.startTutorial('basic-tutorial');
            tutorialManager.pauseTutorial();
            tutorialManager.resumeTutorial();
            expect(tutorialManager.isPaused).toBe(false);
            expect(tutorialManager.isActive).toBe(true) }');'
        test('チュートリアルをスキップできる', async (') => {'
            await tutorialManager.startTutorial('basic-tutorial');
            const result = tutorialManager.skipTutorial();
            expect(result).toBe(true);
            expect(tutorialManager.isActive).toBe(false);
            expect(tutorialManager.currentTutorial).toBeNull() }');'
    }
    describe('ステップ管理', (') => {'
        const mockTutorial: Tutorial = {
            id: 'step-tutorial',
            steps: [
                { id: 'step1', title: 'Step 1', skipAllowed: true,,
                { id: 'step2', title: 'Step 2', skipAllowed: false,,
                { id: 'step3', title: 'Step 3', skipAllowed: true,
            ]
        };
        beforeEach(async (') => {'
            jest.spyOn(tutorialManager.contentLoader, 'loadTutorialData').mockResolvedValue([mockTutorial]'),'
            await tutorialManager.startTutorial('step-tutorial') }');'
        test('次のステップに進むことができる', () => {
            const result = tutorialManager.nextStep();
            expect(result).toBe(true);
            expect(tutorialManager.currentStep).toBe(1) }');'
        test('前のステップに戻ることができる', () => {
            tutorialManager.currentStep = 1,
            const result = tutorialManager.previousStep();
            expect(result).toBe(true);
            expect(tutorialManager.currentStep).toBe(0) }');'
        test('最初のステップから前に戻ることはできない', () => {
            const result = tutorialManager.previousStep();
            expect(result).toBe(false);
            expect(tutorialManager.currentStep).toBe(0) }');'
        test('最後のステップを超えて進むことはできない', () => {
            tutorialManager.currentStep = 2,
            const result = tutorialManager.nextStep();
            expect(result).toBe(false);
            expect(tutorialManager.currentStep).toBe(2) }');'
        test('現在のステップを取得できる', () => {
            const step = tutorialManager.getCurrentStep();
            expect(step).toEqual(mockTutorial.steps[0]) }');'
        test('チュートリアル進捗を取得できる', () => {
            tutorialManager.currentStep = 1,
            const progress = tutorialManager.getTutorialProgress() as ProgressInfo,
            expect(progress.currentStep).toBe(1);
            expect(progress.totalSteps).toBe(3);
            expect(progress.percentage).toBe(33.33) }');'
    }
    describe('インタラクション', () => {
        const mockElement: MockElement = {
            getBoundingClientRect: () => ({ left: 100, top: 100, width: 50,
        height: 50 }
    };
        beforeEach(() => {
            // Mock DOM elements
            global.document = {
                querySelector: jest.fn(() => mockElement),
                createElement: jest.fn(() => ({)) }') as MockDocument as any;'
        }
        test('要素をハイライトできる', (') => {'
            const result = tutorialManager.highlightElement('.test-element', 'テストメッセージ');
            expect(result).toBe(true);
            expect(tutorialManager.highlightedElement).toBe(mockElement) }');'
        test('存在しない要素のハイライトは失敗する', () => {
            (global.document.querySelector as jest.Mock).mockReturnValue(null'),'
            const result = tutorialManager.highlightElement('.non-existent', 'メッセージ');
            expect(result).toBe(false);
            expect(tutorialManager.highlightedElement).toBeNull() }');'
        test('ユーザーアクションを待つことができる', async (') => {'
            const actionPromise = tutorialManager.waitForUserAction('click');
            // Simulate user action
            setTimeout((') => {'
                tutorialManager.handleUserAction('click') }, 100);
            const result = await actionPromise;
            expect(result).toBe(true);
        }');'
        test('ステップの指示を表示できる', (') => {'
            const step: TutorialStep = {
                id: 'test-step',
                title: 'テストステップ',
                instructions: 'これはテスト指示です'
            };
            const result = tutorialManager.showStepInstructions(step);
            expect(result).toBe(true);
            expect(tutorialManager.currentInstructions).toEqual(step);
        }');'
    }
    describe('進捗保存', (') => {'
        test('チュートリアル進捗が保存される', async (') => {'
            const mockTutorial: Tutorial = {
                id: 'save-tutorial',
                steps: [{ id: 'step1', title: 'Step 1' }, { id: 'step2', title: 'Step 2' }]
            };
            jest.spyOn(tutorialManager.contentLoader, 'loadTutorialData').mockResolvedValue([mockTutorial]');'
            await tutorialManager.startTutorial('save-tutorial');
            tutorialManager.nextStep();
            tutorialManager.saveTutorialProgress();
            expect(mockGameEngine.playerData.saveTutorialProgress').toHaveBeenCalledWith({'
                tutorialId: 'save-tutorial',
                currentStep: 1,
                completedSteps: ['step1'],
                isCompleted: false)') }'
        test('完了したチュートリアル進捗が保存される', async (') => {'
            const mockTutorial: Tutorial = {
                id: 'complete-tutorial',
                steps: [{ id: 'step1', title: 'Step 1' }]
            };
            jest.spyOn(tutorialManager.contentLoader, 'loadTutorialData').mockResolvedValue([mockTutorial]');'
            await tutorialManager.startTutorial('complete-tutorial');
            tutorialManager.nextStep(); // Go beyond last step
            tutorialManager.saveTutorialProgress();
            expect(mockGameEngine.playerData.saveTutorialProgress).toHaveBeenCalledWith(
                expect.objectContaining({
                    isCompleted: true)) }');'
    }
    describe('バリデーション', (') => {'
        test('ステップバリデーションが実行される', (') => {'
            const step: TutorialStep = {
                id: 'validation-step',
                title: 'Validation Step',
                validationFunction: 'testValidation'
            };
            // Mock validation function
            tutorialManager.validationFunctions = {
                testValidation: jest.fn(() => true)) }');'
            const result = tutorialManager.validateStep(step, 'test-data');
            expect(tutorialManager.validationFunctions.testValidation').toHaveBeenCalledWith('test-data');'
            expect(result).toBe(true);
        )');'
        test('存在しないバリデーション関数の場合は常にtrue', (') => {'
            const step: TutorialStep = {
                id: 'no-validation',
                title: 'No Validation',
                validationFunction: 'nonExistentValidation'
    }');'
            const result = tutorialManager.validateStep(step, 'test-data');
            expect(result).toBe(true);
        }');'
    }
    describe('エラーハンドリング', (') => {'
        test('チュートリアル読み込みエラーが処理される', async (') => {'
            jest.spyOn(tutorialManager.contentLoader, 'loadTutorialData').mockRejectedValue(new Error('Load error')'),'
            const result = await tutorialManager.startTutorial('error-tutorial');
            expect(result).toBe(false);
            expect(tutorialManager.currentTutorial).toBeNull() }');'
        test('DOM操作エラーが処理される', () => {
            (global.document.querySelector as jest.Mock).mockImplementation((') => {'
                throw new Error('DOM error') }');'
            const result = tutorialManager.highlightElement('.error-element', 'message');
            expect(result).toBe(false);
            expect(tutorialManager.highlightedElement).toBeNull();
        }');'
    }
    describe('クリーンアップ', (') => {'
        test('cleanup時にリソースが適切に解放される', async (') => {'
            const mockTutorial: Tutorial = { id: 'cleanup-test', steps: [] },
            jest.spyOn(tutorialManager.contentLoader, 'loadTutorialData').mockResolvedValue([mockTutorial]');'
            await tutorialManager.startTutorial('cleanup-test');
            tutorialManager.highlightedElement = {} as any;
            tutorialManager.currentInstructions = {} as TutorialStep;
            tutorialManager.destroy();
            expect(tutorialManager.currentTutorial).toBeNull();
            expect(tutorialManager.highlightedElement).toBeNull();
            expect(tutorialManager.currentInstructions).toBeNull();
            expect(tutorialManager.isActive).toBe(false);
        };
    }
}');'