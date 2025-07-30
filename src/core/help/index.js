/**
 * Help System Index
 * ヘルプシステムの統合エクスポートファイル
 */

// Core Help System Components
export { HelpManager, getHelpManager, reinitializeHelpManager } from './HelpManager.js';
export { TutorialManager, getTutorialManager, reinitializeTutorialManager } from './TutorialManager.js';
export { ContextManager, getContextManager, reinitializeContextManager } from './ContextManager.js';
export { HelpErrorHandler, getHelpErrorHandler, reinitializeHelpErrorHandler } from './HelpErrorHandler.js';

/**
 * ヘルプシステム全体の初期化
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {Object} 初期化されたヘルプシステム
 */
export function initializeHelpSystem(gameEngine) {
    try {
        const helpManager = getHelpManager(gameEngine);
        const tutorialManager = getTutorialManager(gameEngine);
        const contextManager = getContextManager(gameEngine);
        const helpErrorHandler = getHelpErrorHandler(gameEngine);

        return {
            helpManager,
            tutorialManager,
            contextManager,
            helpErrorHandler,
            initialized: true,
            version: '1.0.0'
        };
    } catch (error) {
        console.error('Failed to initialize help system:', error);
        return {
            initialized: false,
            error: error.message
        };
    }
}

/**
 * ヘルプシステム全体の破棄
 */
export function destroyHelpSystem() {
    try {
        // 各マネージャーの破棄処理を実行
        const managers = [
            'helpManagerInstance',
            'tutorialManagerInstance', 
            'contextManagerInstance',
            'helpErrorHandlerInstance'
        ];

        // インスタンスが存在する場合は破棄
        managers.forEach(managerName => {
            if (global[managerName]) {
                if (typeof global[managerName].destroy === 'function') {
                    global[managerName].destroy();
                }
                global[managerName] = null;
            }
        });

        console.log('Help system destroyed successfully');
        return true;
    } catch (error) {
        console.error('Failed to destroy help system:', error);
        return false;
    }
}