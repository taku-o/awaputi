/**
 * TutorialManager.js
 * チュートリアルシステムの中央管理クラス（リファクタリング版）
 * チュートリアルの実行、進捗管理、ユーザーインタラクション検出を担当
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { LoggingSystem } from '../LoggingSystem.js';
import { CacheSystem } from '../CacheSystem.js';
import { ContentLoader, getContentLoader } from './ContentLoader.js';
import { TutorialModel } from './DataModels.js';
import { TutorialOverlay, getTutorialOverlay } from './TutorialOverlay.js';

// 分割されたコンポーネントをインポート
import { getTutorialAccessibilityManager } from './TutorialAccessibilityManager.js';
import { getTutorialStatsManager } from './TutorialStatsManager.js';
import { getTutorialProgressManager } from './TutorialProgressManager.js';
import { getTutorialValidationEngine } from './TutorialValidationEngine.js';

/**
 * チュートリアル管理クラス（リファクタリング版）
 */
export class TutorialManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        this.cacheSystem = CacheSystem.getInstance ? CacheSystem.getInstance() : new CacheSystem();
        this.contentLoader = getContentLoader();
        this.tutorialOverlay = getTutorialOverlay(gameEngine, gameEngine?.eventBus, gameEngine?.state);
        
        // 分割されたコンポーネントを初期化
        this.accessibilityManager = getTutorialAccessibilityManager(gameEngine?.accessibilityManager, this.loggingSystem);
        this.statsManager = getTutorialStatsManager(this.loggingSystem);
        this.progressManager = getTutorialProgressManager(this.loggingSystem);
        this.validationEngine = getTutorialValidationEngine(gameEngine, this.loggingSystem);
        
        // チュートリアル状態
        this.currentTutorial = null;
        this.currentStep = 0;
        this.tutorialData = new Map();
        
        // チュートリアル設定
        this.config = {
            autoAdvance: true,
            autoAdvanceDelay: 1000,
            showProgress: true,
            allowSkip: true,
            allowBackNavigation: true,
            defaultTimeout: 30000,
            highlightEnabled: true
        };
        
        this.initialize();
    }

    /**
     * チュートリアルマネージャーの初期化
     */
    async initialize() {
        try {
            this.loggingSystem.info('TutorialManager', 'Initializing tutorial system...');
            
            // チュートリアルデータの読み込み
            await this.loadTutorialData();
            
            // オーバーレイ統合の設定
            this.setupOverlayIntegration();
            
            this.loggingSystem.info('TutorialManager', 'Tutorial system initialized successfully');
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to initialize tutorial system', error);
            ErrorHandler.handleError(error, 'TutorialManager', 'Critical initialization error');
        }
    }

    /**
     * チュートリアルを開始
     * @param {string} tutorialId - チュートリアルID
     * @returns {Promise<boolean>} 開始成功フラグ
     */
    async startTutorial(tutorialId) {
        try {
            const tutorial = this.tutorialData.get(tutorialId);
            if (!tutorial) {
                this.loggingSystem.error('TutorialManager', `Tutorial not found: ${tutorialId}`);
                return false;
            }

            // 前提条件のチェック
            if (!this.checkPrerequisites(tutorial)) {
                return false;
            }

            this.currentTutorial = tutorial;
            this.currentStep = 0;
            
            // 進捗管理にチュートリアル開始を通知
            this.progressManager.startTutorial(tutorialId);
            
            // アクセシビリティ設定を適用
            this.config = this.accessibilityManager.applyToTutorial(this.tutorialOverlay, this.config);
            
            // 簡素化モードが有効な場合、チュートリアルを簡素化
            if (this.accessibilityManager.getConfig().simplifiedMode) {
                this.currentTutorial = this.accessibilityManager.applySimplifiedMode(this.currentTutorial);
            }

            // TutorialOverlayにチュートリアルを表示
            await this.showTutorialOverlay();
            
            // 最初のステップを実行
            await this.executeStep(0);
            
            this.loggingSystem.info('TutorialManager', `Started tutorial: ${tutorialId}`);
            return true;
            
        } catch (error) {
            this.loggingSystem.error('TutorialManager', `Failed to start tutorial: ${tutorialId}`, error);
            return false;
        }
    }

    /**
     * チュートリアルを一時停止
     */
    pauseTutorial() {
        try {
            this.progressManager.pauseTutorial();
            
            if (this.tutorialOverlay) {
                this.tutorialOverlay.pause();
            }
            
            this.loggingSystem.info('TutorialManager', 'Tutorial paused');
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to pause tutorial', error);
        }
    }

    /**
     * チュートリアルを再開
     */
    resumeTutorial() {
        try {
            this.progressManager.resumeTutorial();
            
            if (this.tutorialOverlay) {
                this.tutorialOverlay.resume();
            }
            
            this.loggingSystem.info('TutorialManager', 'Tutorial resumed');
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to resume tutorial', error);
        }
    }

    /**
     * チュートリアルをスキップ
     */
    skipTutorial() {
        try {
            const tutorialId = this.currentTutorial?.id;
            if (tutorialId) {
                this.statsManager.recordTutorialAttempt(tutorialId, 'skip');
            }
            
            this.stopTutorial();
            this.loggingSystem.info('TutorialManager', 'Tutorial skipped');
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to skip tutorial', error);
        }
    }

    /**
     * 次のステップに進む
     */
    nextStep() {
        try {
            if (!this.currentTutorial) {
                this.loggingSystem.warn('TutorialManager', 'No tutorial is currently running');
                return;
            }

            if (this.currentStep < this.currentTutorial.steps.length - 1) {
                this.currentStep++;
                this.progressManager.advanceToStep(this.currentStep);
                this.executeStep(this.currentStep);
            } else {
                this.completeTutorial();
            }
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to advance to next step', error);
        }
    }

    /**
     * 前のステップに戻る
     */
    previousStep() {
        try {
            if (!this.currentTutorial || !this.config.allowBackNavigation) {
                return;
            }

            if (this.currentStep > 0) {
                this.currentStep--;
                this.progressManager.advanceToStep(this.currentStep);
                this.executeStep(this.currentStep);
            }
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to go to previous step', error);
        }
    }

    /**
     * 現在のステップを取得
     * @returns {Object|null} 現在のステップ
     */
    getCurrentStep() {
        if (!this.currentTutorial || this.currentStep >= this.currentTutorial.steps.length) {
            return null;
        }
        return this.currentTutorial.steps[this.currentStep];
    }

    /**
     * チュートリアル進捗を取得
     * @returns {Object} 進捗情報
     */
    getTutorialProgress() {
        const progress = this.progressManager.getProgress();
        return {
            ...progress,
            currentStep: this.currentStep,
            totalSteps: this.currentTutorial?.steps.length || 0
        };
    }

    /**
     * ステップを実行
     * @param {number} stepIndex - ステップインデックス
     */
    async executeStep(stepIndex) {
        try {
            const step = this.currentTutorial.steps[stepIndex];
            if (!step) {
                this.loggingSystem.error('TutorialManager', `Step not found: ${stepIndex}`);
                return;
            }

            // ステップ開始統計を記録
            const stepStartTime = Date.now();

            // ステップ指示を表示
            this.showStepInstructions(step);

            // ハイライト表示
            if (this.config.highlightEnabled && step.highlight) {
                this.highlightElement(step.highlight);
            }

            // バリデーション関数を決定
            const validationFunction = this.validationEngine.determineValidationFunction(step);
            if (validationFunction) {
                step.validationFunction = validationFunction;
            }

            // ユーザーアクションを待機
            const actionResult = await this.waitForUserAction(step);

            // ステップバリデーション
            const validationResult = await this.validationEngine.validateStep(step, actionResult);

            if (validationResult.success) {
                // 成功時の統計更新
                const duration = Date.now() - stepStartTime;
                this.statsManager.updateStepStats(step.id, this.currentTutorial.id, duration, true, false);

                // 自動進行の処理
                if (this.config.autoAdvance) {
                    setTimeout(() => {
                        this.nextStep();
                    }, this.config.autoAdvanceDelay);
                }
            } else {
                // バリデーション失敗時
                const duration = Date.now() - stepStartTime;
                this.statsManager.updateStepStats(step.id, this.currentTutorial.id, duration, false, false);
                
                await this.validationEngine.showValidationError(
                    validationResult.error, 
                    this.tutorialOverlay, 
                    this.currentTutorial, 
                    this.currentStep
                );
                
                // ステップを再実行
                await this.executeStep(stepIndex);
            }

        } catch (error) {
            this.loggingSystem.error('TutorialManager', `Step execution error: ${stepIndex}`, error);
        }
    }

    /**
     * ユーザーアクションを待機
     * @param {Object} step - ステップデータ
     * @returns {Promise<Object>} アクション結果
     */
    async waitForUserAction(step) {
        return new Promise((resolve) => {
            const timeout = step.timeout || this.config.defaultTimeout;
            
            // タイムアウト設定
            this.validationEngine.setStepTimer(timeout, async () => {
                await this.validationEngine.showTimeoutMessage(step, this.tutorialOverlay, this.currentTutorial);
                resolve({ timeout: true });
            });

            // アクション待機の設定
            const waitAction = this.validationEngine.determineWaitAction(step);
            
            // イベントリスナーを設定してユーザーアクションを待機
            const handleAction = (actionResult) => {
                this.validationEngine.clearStepTimer();
                resolve(actionResult);
            };

            // ゲームエンジンのイベントバスにリスナーを追加
            if (this.gameEngine && this.gameEngine.eventBus) {
                this.gameEngine.eventBus.once(waitAction, handleAction);
            }
        });
    }

    /**
     * ステップ指示を表示
     * @param {Object} step - ステップデータ
     */
    showStepInstructions(step) {
        try {
            if (this.tutorialOverlay) {
                this.tutorialOverlay.showStep(step);
            }
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to show step instructions', error);
        }
    }

    /**
     * 要素をハイライト
     * @param {string|Object} highlightData - ハイライト対象
     */
    highlightElement(highlightData) {
        try {
            if (this.tutorialOverlay) {
                this.tutorialOverlay.highlightElement(highlightData);
            }
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to highlight element', error);
        }
    }

    /**
     * チュートリアルオーバーレイを表示
     */
    async showTutorialOverlay() {
        try {
            if (this.tutorialOverlay && this.currentTutorial) {
                await this.tutorialOverlay.show(this.currentTutorial);
            }
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to show tutorial overlay', error);
        }
    }

    /**
     * 前提条件をチェック
     * @param {Object} tutorial - チュートリアルデータ
     * @returns {boolean} 前提条件満足フラグ
     */
    checkPrerequisites(tutorial) {
        if (!tutorial.prerequisites || tutorial.prerequisites.length === 0) {
            return true;
        }

        // 前提チュートリアルの完了チェック
        for (const prerequisite of tutorial.prerequisites) {
            if (!this.progressManager.isCompleted(prerequisite)) {
                this.loggingSystem.warn('TutorialManager', `Prerequisite not met: ${prerequisite}`);
                return false;
            }
        }

        return true;
    }

    /**
     * チュートリアルを完了
     */
    completeTutorial() {
        try {
            const tutorialId = this.currentTutorial?.id;
            if (tutorialId) {
                this.progressManager.completeTutorial(tutorialId);
                this.statsManager.recordTutorialAttempt(tutorialId, 'complete');
            }

            // オーバーレイを非表示
            if (this.tutorialOverlay) {
                this.tutorialOverlay.hide();
            }

            // ハイライトをクリア
            this.clearHighlight();

            this.currentTutorial = null;
            this.currentStep = 0;

            this.loggingSystem.info('TutorialManager', `Tutorial completed: ${tutorialId}`);
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to complete tutorial', error);
        }
    }

    /**
     * チュートリアルを停止
     */
    stopTutorial() {
        try {
            if (this.tutorialOverlay) {
                this.tutorialOverlay.hide();
            }

            this.clearHighlight();
            this.validationEngine.clearStepTimer();
            this.validationEngine.clearInteractionHandlers();

            this.currentTutorial = null;
            this.currentStep = 0;

            this.loggingSystem.info('TutorialManager', 'Tutorial stopped');
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to stop tutorial', error);
        }
    }

    /**
     * ハイライトをクリア
     */
    clearHighlight() {
        try {
            if (this.tutorialOverlay) {
                this.tutorialOverlay.clearHighlight();
            }
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to clear highlight', error);
        }
    }

    /**
     * チュートリアルデータを読み込み
     */
    async loadTutorialData() {
        try {
            const tutorialIds = ['basic-tutorial', 'advanced-bubbles'];
            
            for (const tutorialId of tutorialIds) {
                const tutorial = await this.contentLoader.loadTutorial(tutorialId);
                if (tutorial) {
                    this.tutorialData.set(tutorialId, tutorial);
                }
            }

            // ガイドツアーデータも読み込み
            await this.loadGuidedTourData();
            
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to load tutorial data', error);
        }
    }

    /**
     * ガイドツアーデータを読み込み
     */
    async loadGuidedTourData() {
        try {
            const guidedTours = await this.contentLoader.loadGuidedTours();
            if (guidedTours) {
                for (const [tourId, tourData] of Object.entries(guidedTours)) {
                    const tutorial = this.convertTourToTutorial(tourData);
                    this.tutorialData.set(tourId, tutorial);
                }
            }
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to load guided tour data', error);
        }
    }

    /**
     * ツアーデータをチュートリアルデータに変換
     * @param {Object} tourData - ツアーデータ
     * @returns {Object} チュートリアルデータ
     */
    convertTourToTutorial(tourData) {
        return {
            ...tourData,
            tourType: 'guided_tour'
        };
    }

    /**
     * オーバーレイ統合を設定
     */
    setupOverlayIntegration() {
        try {
            if (this.gameEngine && this.gameEngine.eventBus) {
                this.gameEngine.eventBus.on('tutorial_navigate', (data) => {
                    this.handleOverlayNavigation(data);
                });
            }
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to setup overlay integration', error);
        }
    }

    /**
     * オーバーレイナビゲーションを処理
     * @param {Object} data - ナビゲーションデータ
     */
    handleOverlayNavigation(data) {
        try {
            const { direction } = data;
            
            switch (direction) {
                case 'next':
                    this.nextStep();
                    break;
                case 'previous':
                    this.previousStep();
                    break;
                case 'skip':
                    this.skipTutorial();
                    break;
                default:
                    this.loggingSystem.warn('TutorialManager', `Unknown navigation direction: ${direction}`);
                    break;
            }
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to handle overlay navigation', error);
        }
    }

    /**
     * 利用可能なチュートリアル一覧を取得
     * @returns {Array} チュートリアル一覧
     */
    getAvailableTutorials() {
        try {
            const tutorials = [];
            for (const [id, tutorial] of this.tutorialData) {
                if (this.checkPrerequisites(tutorial)) {
                    tutorials.push({
                        id,
                        title: tutorial.title,
                        description: tutorial.description,
                        difficulty: tutorial.difficulty || 'beginner',
                        estimatedTime: tutorial.estimatedTime || 300000,
                        isCompleted: this.progressManager.isCompleted(id)
                    });
                }
            }
            return tutorials;
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to get available tutorials', error);
            return [];
        }
    }

    /**
     * チュートリアル統計を取得
     * @returns {Object} 統計情報
     */
    getTutorialStatistics() {
        try {
            const progress = this.progressManager.getProgress();
            return this.statsManager.getTutorialStatistics(
                this.tutorialData,
                new Set(progress.completedTutorials),
                progress.currentTutorialId,
                this.currentTutorial
            );
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to get tutorial statistics', error);
            return {};
        }
    }

    /**
     * アクセシビリティ設定を更新
     * @param {Object} accessibilityConfig - アクセシビリティ設定
     */
    updateAccessibilityConfig(accessibilityConfig) {
        try {
            this.accessibilityManager.updateConfig(accessibilityConfig);
            
            // 現在実行中のチュートリアルに設定を適用
            if (this.currentTutorial && this.tutorialOverlay) {
                this.config = this.accessibilityManager.applyToTutorial(this.tutorialOverlay, this.config);
                
                if (this.accessibilityManager.getConfig().simplifiedMode) {
                    this.currentTutorial = this.accessibilityManager.applySimplifiedMode(this.currentTutorial);
                }
            }
            
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to update accessibility config', error);
        }
    }

    /**
     * リソースをクリーンアップ
     */
    destroy() {
        try {
            this.stopTutorial();
            
            // 分割されたコンポーネントをクリーンアップ
            this.accessibilityManager?.destroy();
            this.statsManager?.destroy();
            this.progressManager?.destroy();
            this.validationEngine?.destroy();
            
            this.loggingSystem.info('TutorialManager', 'Tutorial manager destroyed');
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to destroy tutorial manager', error);
        }
    }
}

// シングルトンインスタンス管理
let tutorialManagerInstance = null;

/**
 * TutorialManagerのシングルトンインスタンスを取得
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {TutorialManager} シングルトンインスタンス
 */
export function getTutorialManager(gameEngine) {
    if (!tutorialManagerInstance) {
        tutorialManagerInstance = new TutorialManager(gameEngine);
    }
    return tutorialManagerInstance;
}

/**
 * TutorialManagerのシングルトンインスタンスを再初期化
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {TutorialManager} 新しいシングルトンインスタンス
 */
export function reinitializeTutorialManager(gameEngine) {
    if (tutorialManagerInstance) {
        tutorialManagerInstance.destroy();
    }
    tutorialManagerInstance = new TutorialManager(gameEngine);
    return tutorialManagerInstance;
}

export default TutorialManager;