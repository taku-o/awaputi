/**
 * Help System Index
 * ヘルプシステムの統合エクスポートファイル
 */

// Core Help System Components
export { HelpManager, getHelpManager, reinitializeHelpManager } from './HelpManager.js';
export { TutorialManager, getTutorialManager, reinitializeTutorialManager } from './TutorialManager.js';
export { ContextManager, getContextManager, reinitializeContextManager } from './ContextManager.js';
export { HelpErrorHandler, getHelpErrorHandler, reinitializeHelpErrorHandler } from './HelpErrorHandler.js';

// UI Components
export { TutorialOverlay, getTutorialOverlay, reinitializeTutorialOverlay } from './TutorialOverlay.js';

// Content Management System Components
export { ContentLoader, getContentLoader, reinitializeContentLoader } from './ContentLoader.js';
export { HelpContentModel, TutorialModel, FAQModel, UserProgressModel, DataModelFactory } from './DataModels.js';
export { ContentValidation, getContentValidation, reinitializeContentValidation } from './ContentValidation.js';
export { SearchEngine, getSearchEngine, reinitializeSearchEngine } from './SearchEngine.js';
export { MultilingualContentManager, getMultilingualContentManager, reinitializeMultilingualContentManager } from './MultilingualContentManager.js';

// 型定義
export interface GameEngine {
    eventBus?: any;
    state?: any;
}

export interface HelpSystemComponents {
    helpManager: any;
    tutorialManager: any;
    contextManager: any;
    helpErrorHandler: any;
    tutorialOverlay: any;
    contentLoader: any;
    contentValidation: any;
    searchEngine: any;
    multilingualContentManager: any;
    initialized: boolean;
    version: string;
}

export interface HelpSystemInitResult {
    initialized: boolean;
    error?: string;
    helpManager?: any;
    tutorialManager?: any;
    contextManager?: any;
    helpErrorHandler?: any;
    tutorialOverlay?: any;
    contentLoader?: any;
    contentValidation?: any;
    searchEngine?: any;
    multilingualContentManager?: any;
    version?: string;
}

/**
 * ヘルプシステム全体の初期化
 * @param gameEngine - ゲームエンジン
 * @returns 初期化されたヘルプシステム
 */
export function initializeHelpSystem(gameEngine: GameEngine): HelpSystemInitResult {
    try {
        const helpManager = getHelpManager(gameEngine);
        const tutorialManager = getTutorialManager(gameEngine);
        const contextManager = getContextManager(gameEngine);
        const helpErrorHandler = getHelpErrorHandler(gameEngine);
        
        // UI Components
        const tutorialOverlay = getTutorialOverlay(gameEngine, gameEngine?.eventBus, gameEngine?.state);
        
        // Content Management System
        const contentLoader = getContentLoader();
        const contentValidation = getContentValidation();
        const searchEngine = getSearchEngine();
        const multilingualContentManager = getMultilingualContentManager();

        return {
            helpManager,
            tutorialManager,
            contextManager,
            helpErrorHandler,
            tutorialOverlay,
            contentLoader,
            contentValidation,
            searchEngine,
            multilingualContentManager,
            initialized: true,
            version: '1.0.0'
        };
    } catch (error) {
        console.error('Failed to initialize help system:', error);
        return {
            initialized: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * ヘルプシステム全体の破棄
 */
export function destroyHelpSystem(): boolean {
    try {
        // 各マネージャーの破棄処理を実行
        const managers = [
            'helpManagerInstance',
            'tutorialManagerInstance', 
            'contextManagerInstance',
            'helpErrorHandlerInstance'
        ];

        // 全コンポーネントの破棄
        const components = [
            getHelpManager(),
            getTutorialManager(),
            getContextManager(),
            getHelpErrorHandler(),
            getTutorialOverlay(),
            getContentLoader(),
            getContentValidation(),
            getSearchEngine(),
            getMultilingualContentManager()
        ];

        components.forEach(component => {
            if (component && typeof component.destroy === 'function') {
                try {
                    component.destroy();
                } catch (error) {
                    console.warn('Failed to destroy component:', error);
                }
            }
        });

        console.log('Help system destroyed successfully');
        return true;
    } catch (error) {
        console.error('Failed to destroy help system:', error);
        return false;
    }
}