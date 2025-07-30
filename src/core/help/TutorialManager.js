/**
 * TutorialManager.js
 * チュートリアルシステムの中央管理クラス
 * チュートリアルの実行、進捗管理、ユーザーインタラクション検出を担当
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { LoggingSystem } from '../LoggingSystem.js';
import { CacheSystem } from '../CacheSystem.js';
import { ContentLoader, getContentLoader } from './ContentLoader.js';
import { TutorialModel } from './DataModels.js';
import { TutorialOverlay, getTutorialOverlay } from './TutorialOverlay.js';

/**
 * チュートリアル管理クラス
 */
export class TutorialManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        this.cacheSystem = CacheSystem.getInstance ? CacheSystem.getInstance() : new CacheSystem();
        this.contentLoader = getContentLoader();
        this.tutorialOverlay = getTutorialOverlay(gameEngine, gameEngine?.eventBus, gameEngine?.state);
        
        // チュートリアル状態
        this.currentTutorial = null;
        this.currentStep = 0;
        this.tutorialData = new Map();
        this.userProgress = {
            completedTutorials: new Set(),
            currentTutorialId: null,
            currentStepIndex: 0,
            startTime: null,
            pausedTime: null
        };
        
        // インタラクション検出
        this.interactionHandlers = new Map();
        this.validationFunctions = new Map();
        this.stepTimer = null;
        
        // チュートリアル統計
        this.tutorialStats = {
            totalTime: 0,
            averageStepTime: new Map(),
            skipCount: new Map(),
            failureCount: new Map(),
            attemptCount: new Map(),
            completionRate: 0,
            lastUpdated: Date.now()
        };
        
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
            
            // チュートリアルデータの読み込み（ContentLoaderから）
            await this.loadTutorialData();
            
            // ユーザー進捗の復元
            this.loadUserProgress();
            
            // チュートリアル統計の読み込み
            this.loadTutorialStats();
            
            // インタラクション検出ハンドラーの設定
            this.setupInteractionHandlers();
            
            // TutorialOverlayとのイベント連携
            this.setupOverlayIntegration();
            
            this.loggingSystem.info('TutorialManager', 'Tutorial system initialized successfully');
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to initialize tutorial system', error);
            ErrorHandler.handle(error, 'TutorialManager.initialize');
        }
    }

    /**
     * チュートリアルの開始
     * @param {string} tutorialId - チュートリアルID
     * @returns {Promise<boolean>} 開始成功フラグ
     */
    async startTutorial(tutorialId) {
        try {
            // 既存のチュートリアルが実行中の場合は停止
            if (this.currentTutorial) {
                await this.stopTutorial();
            }

            const tutorialData = this.tutorialData.get(tutorialId);
            if (!tutorialData) {
                this.loggingSystem.error('TutorialManager', `Tutorial not found: ${tutorialId}`);
                return false;
            }

            // 前提条件チェック
            if (!this.checkPrerequisites(tutorialData)) {
                this.loggingSystem.warn('TutorialManager', `Prerequisites not met for tutorial: ${tutorialId}`);
                return false;
            }

            this.currentTutorial = tutorialData;
            this.currentStep = 0;
            this.userProgress.currentTutorialId = tutorialId;
            this.userProgress.currentStepIndex = 0;
            this.userProgress.startTime = Date.now();
            this.userProgress.pausedTime = null;

            // TutorialOverlayにチュートリアルを表示
            await this.showTutorialOverlay();
            
            // 最初のステップを実行
            await this.executeStep(0);
            
            this.loggingSystem.info('TutorialManager', `Tutorial started: ${tutorialId}`);
            this.saveUserProgress();
            
            return true;
        } catch (error) {
            this.loggingSystem.error('TutorialManager', `Failed to start tutorial: ${tutorialId}`, error);
            return false;
        }
    }

    /**
     * チュートリアルの一時停止
     */
    pauseTutorial() {
        try {
            if (!this.currentTutorial) {
                this.loggingSystem.warn('TutorialManager', 'No tutorial is currently running');
                return;
            }

            this.userProgress.pausedTime = Date.now();
            this.clearStepTimer();
            
            this.loggingSystem.info('TutorialManager', 'Tutorial paused');
            this.saveUserProgress();
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to pause tutorial', error);
        }
    }

    /**
     * チュートリアルの再開
     */
    resumeTutorial() {
        try {
            if (!this.currentTutorial) {
                this.loggingSystem.warn('TutorialManager', 'No tutorial to resume');
                return;
            }

            if (!this.userProgress.pausedTime) {
                this.loggingSystem.warn('TutorialManager', 'Tutorial is not paused');
                return;
            }

            this.userProgress.pausedTime = null;
            
            // 現在のステップを再実行
            this.executeStep(this.currentStep);
            
            this.loggingSystem.info('TutorialManager', 'Tutorial resumed');
            this.saveUserProgress();
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to resume tutorial', error);
        }
    }

    /**
     * チュートリアルのスキップ
     */
    skipTutorial() {
        try {
            if (!this.currentTutorial) {
                this.loggingSystem.warn('TutorialManager', 'No tutorial is currently running');
                return;
            }

            const tutorialId = this.userProgress.currentTutorialId;
            this.stopTutorial();
            
            // スキップとして記録（完了にはしない）
            this.loggingSystem.info('TutorialManager', `Tutorial skipped: ${tutorialId}`);
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

            const nextStepIndex = this.currentStep + 1;
            
            if (nextStepIndex >= this.currentTutorial.steps.length) {
                // チュートリアル完了
                this.completeTutorial();
                return;
            }

            this.currentStep = nextStepIndex;
            this.userProgress.currentStepIndex = nextStepIndex;
            
            this.executeStep(nextStepIndex);
            this.saveUserProgress();
            
            this.loggingSystem.debug('TutorialManager', `Advanced to step ${nextStepIndex}`);
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to advance to next step', error);
        }
    }

    /**
     * 前のステップに戻る
     */
    previousStep() {
        try {
            if (!this.currentTutorial) {
                this.loggingSystem.warn('TutorialManager', 'No tutorial is currently running');
                return;
            }

            if (this.currentStep <= 0) {
                this.loggingSystem.warn('TutorialManager', 'Already at first step');
                return;
            }

            const prevStepIndex = this.currentStep - 1;
            this.currentStep = prevStepIndex;
            this.userProgress.currentStepIndex = prevStepIndex;
            
            this.executeStep(prevStepIndex);
            this.saveUserProgress();
            
            this.loggingSystem.debug('TutorialManager', `Returned to step ${prevStepIndex}`);
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to return to previous step', error);
        }
    }

    /**
     * 現在のステップ情報を取得
     * @returns {Object|null} 現在のステップ
     */
    getCurrentStep() {
        if (!this.currentTutorial || this.currentStep >= this.currentTutorial.steps.length) {
            return null;
        }

        return {
            tutorial: this.currentTutorial,
            step: this.currentTutorial.steps[this.currentStep],
            stepIndex: this.currentStep,
            totalSteps: this.currentTutorial.steps.length,
            progress: ((this.currentStep + 1) / this.currentTutorial.steps.length) * 100
        };
    }

    /**
     * チュートリアルの進捗を取得
     * @returns {Object} 進捗情報
     */
    getTutorialProgress() {
        return {
            currentTutorialId: this.userProgress.currentTutorialId,
            currentStepIndex: this.userProgress.currentStepIndex,
            completedTutorials: Array.from(this.userProgress.completedTutorials),
            totalTutorials: this.tutorialData.size,
            isRunning: !!this.currentTutorial,
            isPaused: !!this.userProgress.pausedTime,
            elapsedTime: this.getElapsedTime()
        };
    }

    /**
     * 要素のハイライト表示
     * @param {string} selector - CSS セレクター
     * @param {string} message - 表示メッセージ
     * @param {Object} options - ハイライトオプション
     */
    highlightElement(selector, message, options = {}) {
        try {
            const element = document.querySelector(selector);
            if (!element) {
                this.loggingSystem.warn('TutorialManager', `Element not found: ${selector}`);
                return;
            }

            // ハイライト要素の作成
            const highlight = document.createElement('div');
            highlight.className = 'tutorial-highlight';
            highlight.style.cssText = `
                position: absolute;
                border: 3px solid #ff6b6b;
                border-radius: 8px;
                background: rgba(255, 107, 107, 0.1);
                pointer-events: none;
                z-index: 9999;
                animation: pulse 2s infinite;
            `;

            // 要素の位置に合わせて配置
            const rect = element.getBoundingClientRect();
            highlight.style.top = `${rect.top - 5}px`;
            highlight.style.left = `${rect.left - 5}px`;
            highlight.style.width = `${rect.width + 10}px`;
            highlight.style.height = `${rect.height + 10}px`;

            document.body.appendChild(highlight);

            // メッセージ表示
            if (message) {
                this.showStepMessage(message, {
                    x: rect.left + rect.width / 2,
                    y: rect.top - 20
                });
            }

            // 既存のハイライトをクリア
            this.clearHighlight();
            this.currentHighlight = highlight;

            this.loggingSystem.debug('TutorialManager', `Element highlighted: ${selector}`);
        } catch (error) {
            this.loggingSystem.error('TutorialManager', `Failed to highlight element: ${selector}`, error);
        }
    }

    /**
     * ユーザーアクションの待機
     * @param {string} actionType - アクションタイプ
     * @param {Object} options - 待機オプション
     * @returns {Promise} アクション完了Promise
     */
    waitForUserAction(actionType, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const timeout = options.timeout || this.config.defaultTimeout;
                const stepId = options.stepId;
                
                // タイムアウト設定
                const timeoutId = setTimeout(() => {
                    this.removeInteractionHandler(actionType);
                    reject(new Error(`User action timeout: ${actionType}`));
                }, timeout);

                // アクションハンドラー設定
                const handler = (event) => {
                    clearTimeout(timeoutId);
                    this.removeInteractionHandler(actionType);
                    
                    // アクション結果の構築
                    const actionResult = this.buildActionResult(actionType, event, stepId);
                    resolve(actionResult);
                };

                this.addInteractionHandler(actionType, handler);
                
                // ゲームイベントの監視設定
                this.setupActionListeners(actionType, handler);
                
                this.loggingSystem.debug('TutorialManager', `Waiting for user action: ${actionType}`);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * アクション結果の構築
     * @param {string} actionType - アクションタイプ
     * @param {Event} event - イベントオブジェクト
     * @param {string} stepId - ステップID
     * @returns {Object} アクション結果
     */
    buildActionResult(actionType, event, stepId) {
        const result = {
            actionType,
            stepId,
            timestamp: Date.now(),
            event: event
        };
        
        switch (actionType) {
            case 'bubble_pop':
                result.bubbleId = event.bubbleId;
                result.bubbleType = event.bubbleType;
                result.position = event.position;
                result.score = event.score;
                break;
                
            case 'bubble_drag':
                result.bubbleId = event.bubbleId;
                result.dragDistance = event.dragDistance;
                result.dragDirection = event.dragDirection;
                result.startPosition = event.startPosition;
                result.endPosition = event.endPosition;
                break;
                
            case 'special_bubble_pop':
                result.bubbleId = event.bubbleId;
                result.bubbleType = event.bubbleType;
                result.specialEffect = event.specialEffect;
                result.affectedBubbles = event.affectedBubbles;
                break;
                
            case 'click':
                result.position = { x: event.clientX, y: event.clientY };
                result.target = event.target;
                break;
                
            case 'combo_achieved':
                result.comboCount = event.comboCount;
                result.comboScore = event.comboScore;
                break;
                
            case 'score_reached':
                result.score = event.score;
                result.milestone = event.milestone;
                break;
                
            default:
                // カスタムアクションタイプ
                Object.assign(result, event);
                break;
        }
        
        return result;
    }

    /**
     * アクションリスナーの設定
     * @param {string} actionType - アクションタイプ
     * @param {Function} handler - ハンドラー関数
     */
    setupActionListeners(actionType, handler) {
        if (!this.gameEngine || !this.gameEngine.eventBus) {
            return;
        }
        
        const eventBus = this.gameEngine.eventBus;
        
        switch (actionType) {
            case 'bubble_pop':
                eventBus.once('bubble_popped', handler);
                break;
                
            case 'bubble_drag':
                eventBus.once('bubble_dragged', handler);
                break;
                
            case 'special_bubble_pop':
                eventBus.once('special_bubble_popped', handler);
                break;
                
            case 'click':
                document.addEventListener('click', handler, { once: true });
                break;
                
            case 'combo_achieved':
                eventBus.once('combo_achieved', handler);
                break;
                
            case 'score_reached':
                eventBus.once('score_milestone', handler);
                break;
                
            default:
                // カスタムイベントタイプ
                eventBus.once(actionType, handler);
                break;
        }
    }

    /**
     * TutorialOverlayの表示
     */
    async showTutorialOverlay() {
        try {
            if (this.currentTutorial && this.currentStep !== null) {
                const step = this.currentTutorial.steps[this.currentStep];
                await this.tutorialOverlay.showTutorial(this.currentTutorial, step, this.currentStep);
            }
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to show tutorial overlay', error);
        }
    }

    /**
     * TutorialOverlayの更新
     */
    async updateTutorialOverlay() {
        try {
            if (this.currentTutorial && this.currentStep !== null && this.currentStep < this.currentTutorial.steps.length) {
                const step = this.currentTutorial.steps[this.currentStep];
                await this.tutorialOverlay.updateStep(step, this.currentStep);
            }
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to update tutorial overlay', error);
        }
    }

    /**
     * ステップ指示の表示
     * @param {Object} step - ステップデータ
     */
    showStepInstructions(step) {
        try {
            // TutorialOverlayに委譲
            this.updateTutorialOverlay();
            
            this.loggingSystem.info('TutorialManager', `Step instructions: ${step.title}`);
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to show step instructions', error);
        }
    }

    // ---- プライベートメソッド ----

    /**
     * チュートリアルデータの読み込み
     */
    async loadTutorialData() {
        try {
            // ContentLoaderから各言語のチュートリアルデータを読み込み
            const currentLanguage = this.gameEngine?.localizationManager?.getCurrentLanguage() || 'ja';
            const tutorials = await this.contentLoader.loadTutorialData(currentLanguage);
            
            // TutorialModelインスタンスとしてデータを格納
            for (const tutorialData of tutorials) {
                const tutorialModel = new TutorialModel(tutorialData);
                if (tutorialModel.validate()) {
                    this.tutorialData.set(tutorialModel.id, tutorialModel);
                } else {
                    this.loggingSystem.warn('TutorialManager', `Invalid tutorial data: ${tutorialData.id}`);
                }
            }
            
            // 基本チュートリアルが存在しない場合はデフォルトを作成
            if (!this.tutorialData.has('basic_tutorial')) {
                const basicTutorial = await this.createBasicTutorial();
                this.tutorialData.set('basic_tutorial', basicTutorial);
            }
            
            this.loggingSystem.info('TutorialManager', `Tutorial data loaded: ${this.tutorialData.size} tutorials`);
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to load tutorial data', error);
            
            // フォールバック: 基本チュートリアルのみ作成
            try {
                const basicTutorial = await this.createBasicTutorial();
                this.tutorialData.set('basic_tutorial', basicTutorial);
            } catch (fallbackError) {
                this.loggingSystem.error('TutorialManager', 'Failed to create fallback tutorial', fallbackError);
            }
        }
    }

    /**
     * 基本チュートリアルの作成
     * @returns {TutorialModel} 基本チュートリアルデータ
     */
    async createBasicTutorial() {
        const tutorialData = {
            id: 'basic_tutorial',
            title: '基本操作チュートリアル',
            description: 'ゲームの基本的な操作方法を学びます',
            category: 'gameplay',
            estimatedDuration: 120000, // 2分
            language: 'ja',
            steps: [
                {
                    id: 'welcome',
                    title: 'ようこそ',
                    instructions: 'awaputi（泡割りゲーム）へようこそ！基本操作を学んでいきましょう。',
                    targetElement: null,
                    highlightArea: null,
                    waitForAction: 'click',
                    validationFunction: null,
                    skipAllowed: true
                },
                {
                    id: 'bubble_click',
                    title: '泡をクリック',
                    instructions: '画面に表示される泡をクリックして割ってみましょう。',
                    targetElement: '.bubble',
                    highlightArea: { type: 'circle', radius: 50 },
                    waitForAction: 'bubble_pop',
                    validationFunction: 'validateBubblePop',
                    skipAllowed: true
                },
                {
                    id: 'drag_action',
                    title: '泡をドラッグ',
                    instructions: '泡をドラッグして押し退けることもできます。',
                    targetElement: '.bubble',
                    highlightArea: { type: 'circle', radius: 50 },
                    waitForAction: 'bubble_drag',
                    validationFunction: 'validateBubbleDrag',
                    skipAllowed: true
                },
                {
                    id: 'special_bubbles',
                    title: '特殊な泡',
                    instructions: '色の違う特殊な泡には様々な効果があります。',
                    targetElement: '.special-bubble',
                    highlightArea: { type: 'circle', radius: 60 },
                    waitForAction: 'special_bubble_pop',
                    validationFunction: 'validateSpecialBubblePop',
                    skipAllowed: true
                },
                {
                    id: 'completion',
                    title: 'チュートリアル完了',
                    instructions: 'お疲れ様でした！基本操作をマスターしました。',
                    targetElement: null,
                    highlightArea: null,
                    waitForAction: 'click',
                    validationFunction: null,
                    skipAllowed: false
                }
            ],
            prerequisites: []
        };
        
        return new TutorialModel(tutorialData);
    }

    /**
     * ステップの実行
     * @param {number} stepIndex - ステップインデックス
     */
    async executeStep(stepIndex) {
        try {
            if (!this.currentTutorial || stepIndex >= this.currentTutorial.steps.length) {
                return;
            }

            const step = this.currentTutorial.steps[stepIndex];
            const stepStartTime = Date.now();
            
            // ステップ開始イベント
            if (this.gameEngine && this.gameEngine.eventBus) {
                this.gameEngine.eventBus.emit('tutorial_step_start', {
                    tutorialId: this.currentTutorial.id,
                    stepId: step.id,
                    stepIndex: stepIndex
                });
            }
            
            // ステップ指示の表示
            this.showStepInstructions(step);
            
            // 要素のハイライト
            if (step.targetElement) {
                this.highlightElement(step.targetElement, step.instructions, {
                    highlightArea: step.highlightArea
                });
            }
            
            // ユーザーアクションの待機
            if (step.waitForAction) {
                try {
                    const actionResult = await this.waitForUserAction(step.waitForAction, {
                        timeout: step.timeout || this.config.defaultTimeout,
                        stepId: step.id
                    });
                    
                    // バリデーション実行
                    if (step.validationFunction) {
                        const validationResult = await this.validateStep(step, actionResult);
                        if (!validationResult.success) {
                            this.loggingSystem.warn('TutorialManager', `Step validation failed: ${step.id}`, validationResult.error);
                            
                            // バリデーション失敗時の処理
                            if (step.retryOnFailure !== false) {
                                await this.showValidationError(validationResult.error);
                                // 同じステップを再実行
                                setTimeout(() => this.executeStep(stepIndex), 1500);
                                return;
                            }
                        }
                    }
                    
                    // ステップ完了の記録
                    const stepDuration = Date.now() - stepStartTime;
                    this.updateStepStats(step.id, stepDuration);
                    
                    // ステップ完了イベント
                    if (this.gameEngine && this.gameEngine.eventBus) {
                        this.gameEngine.eventBus.emit('tutorial_step_complete', {
                            tutorialId: this.currentTutorial.id,
                            stepId: step.id,
                            stepIndex: stepIndex,
                            duration: stepDuration
                        });
                    }
                    
                    // 次のステップに自動進行
                    if (this.config.autoAdvance) {
                        setTimeout(() => this.nextStep(), this.config.autoAdvanceDelay);
                    }
                    
                } catch (error) {
                    if (error.message.includes('timeout')) {
                        this.loggingSystem.warn('TutorialManager', `Step timeout: ${step.id}`);
                        
                        // タイムアウト時の処理
                        if (step.skipOnTimeout) {
                            this.nextStep();
                        } else {
                            await this.showTimeoutMessage(step);
                        }
                    } else {
                        this.loggingSystem.error('TutorialManager', `Step execution failed: ${step.id}`, error);
                    }
                }
            } else {
                // アクション待機なしのステップ
                const stepDuration = Date.now() - stepStartTime;
                this.updateStepStats(step.id, stepDuration);
                
                if (this.config.autoAdvance) {
                    setTimeout(() => this.nextStep(), this.config.autoAdvanceDelay);
                }
            }
            
        } catch (error) {
            this.loggingSystem.error('TutorialManager', `Failed to execute step: ${stepIndex}`, error);
        }
    }

    /**
     * チュートリアルの完了
     */
    completeTutorial() {
        try {
            if (!this.currentTutorial) {
                return;
            }

            const tutorialId = this.userProgress.currentTutorialId;
            this.userProgress.completedTutorials.add(tutorialId);
            
            this.stopTutorial();
            this.saveUserProgress();
            
            this.loggingSystem.info('TutorialManager', `Tutorial completed: ${tutorialId}`);
            
            // 完了イベントの発火
            if (this.gameEngine && this.gameEngine.eventBus) {
                this.gameEngine.eventBus.emit('tutorial_completed', { tutorialId });
            }
            
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to complete tutorial', error);
        }
    }

    /**
     * チュートリアルの停止
     */
    stopTutorial() {
        try {
            // TutorialOverlayを非表示
            this.tutorialOverlay.hideTutorial();
            
            this.clearHighlight();
            this.clearStepTimer();
            this.clearInteractionHandlers();
            
            this.currentTutorial = null;
            this.currentStep = 0;
            this.userProgress.currentTutorialId = null;
            this.userProgress.currentStepIndex = 0;
            this.userProgress.startTime = null;
            this.userProgress.pausedTime = null;
            
            this.loggingSystem.info('TutorialManager', 'Tutorial stopped');
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to stop tutorial', error);
        }
    }

    /**
     * 前提条件のチェック
     * @param {Object} tutorialData - チュートリアルデータ
     * @returns {boolean} 前提条件満たしフラグ
     */
    checkPrerequisites(tutorialData) {
        if (!tutorialData.prerequisites || tutorialData.prerequisites.length === 0) {
            return true;
        }

        return tutorialData.prerequisites.every(prereq => 
            this.userProgress.completedTutorials.has(prereq)
        );
    }

    /**
     * ステップのバリデーション
     * @param {Object} step - ステップデータ
     * @param {any} actionResult - アクション結果
     * @returns {Object} バリデーション結果
     */
    async validateStep(step, actionResult) {
        try {
            const validationFunc = this.validationFunctions.get(step.validationFunction);
            if (!validationFunc) {
                return { success: true };
            }
            
            // バリデーション実行
            const result = await validationFunc(actionResult, step, this.gameEngine);
            
            // 結果の正規化
            if (typeof result === 'boolean') {
                return { success: result, error: result ? null : 'Validation failed' };
            }
            
            return {
                success: result.success || false,
                error: result.error || null,
                details: result.details || null
            };
            
        } catch (error) {
            this.loggingSystem.error('TutorialManager', `Step validation error: ${step.id}`, error);
            return {
                success: false,
                error: error.message || 'Validation error occurred'
            };
        }
    }

    /**
     * バリデーションエラーメッセージの表示
     * @param {string} error - エラーメッセージ
     */
    async showValidationError(error) {
        try {
            if (this.tutorialOverlay) {
                await this.tutorialOverlay.showError(error);
            }
            
            // エラーイベントの発火
            if (this.gameEngine && this.gameEngine.eventBus) {
                this.gameEngine.eventBus.emit('tutorial_validation_error', {
                    tutorialId: this.currentTutorial?.id,
                    stepId: this.currentTutorial?.steps[this.currentStep]?.id,
                    error: error
                });
            }
        } catch (err) {
            this.loggingSystem.error('TutorialManager', 'Failed to show validation error', err);
        }
    }

    /**
     * タイムアウトメッセージの表示
     * @param {Object} step - ステップデータ
     */
    async showTimeoutMessage(step) {
        try {
            const message = step.timeoutMessage || 'このステップの制限時間を超過しました。もう一度お試しください。';
            if (this.tutorialOverlay) {
                await this.tutorialOverlay.showTimeout(message);
            }
            
            // タイムアウトイベントの発火
            if (this.gameEngine && this.gameEngine.eventBus) {
                this.gameEngine.eventBus.emit('tutorial_step_timeout', {
                    tutorialId: this.currentTutorial?.id,
                    stepId: step.id,
                    stepIndex: this.currentStep
                });
            }
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to show timeout message', error);
        }
    }

    /**
     * インタラクションハンドラーの設定
     */
    setupInteractionHandlers() {
        // バリデーション関数の登録
        this.validationFunctions.set('validateBubblePop', async (actionResult, step, gameEngine) => {
            // 泡が割られたかの検証
            const bubbleManager = gameEngine?.bubbleManager;
            if (!bubbleManager) {
                return { success: false, error: 'BubbleManager not available' };
            }
            
            // アクション結果から泡IDを取得
            const bubbleId = actionResult?.bubbleId;
            if (!bubbleId) {
                return { success: false, error: '泡を正しくクリックしてください' };
            }
            
            // 泡が正常に破壊されたか確認
            const bubble = bubbleManager.getBubbleById(bubbleId);
            if (bubble && bubble.isPopped) {
                return { success: true };
            }
            
            return { success: false, error: '泡が正しく割れませんでした' };
        });
        
        this.validationFunctions.set('validateBubbleDrag', async (actionResult, step, gameEngine) => {
            // 泡がドラッグされたかの検証
            if (!actionResult || !actionResult.dragDistance) {
                return { success: false, error: 'ドラッグ操作が検出されませんでした' };
            }
            
            // 最小ドラッグ距離の確認
            const minDistance = step.minDragDistance || 50;
            if (actionResult.dragDistance < minDistance) {
                return { 
                    success: false, 
                    error: `もう少し長くドラッグしてください（最小: ${minDistance}px）` 
                };
            }
            
            return { success: true };
        });
        
        this.validationFunctions.set('validateSpecialBubblePop', async (actionResult, step, gameEngine) => {
            // 特殊泡が割られたかの検証
            const bubbleType = actionResult?.bubbleType;
            if (!bubbleType) {
                return { success: false, error: '泡の情報が取得できません' };
            }
            
            // 特殊泡のタイプを確認
            const specialTypes = ['rainbow', 'pink', 'clock', 'electric', 'golden', 'frozen', 'magnetic', 'explosive', 'phantom', 'multiplier'];
            if (!specialTypes.includes(bubbleType)) {
                return { 
                    success: false, 
                    error: '特殊な泡をクリックしてください',
                    details: { expectedTypes: specialTypes, actualType: bubbleType }
                };
            }
            
            return { success: true, details: { bubbleType } };
        });
        
        this.validationFunctions.set('validateCombo', async (actionResult, step, gameEngine) => {
            // コンボが達成されたかの検証
            const scoreManager = gameEngine?.scoreManager;
            if (!scoreManager) {
                return { success: false, error: 'ScoreManager not available' };
            }
            
            const requiredCombo = step.requiredCombo || 3;
            const currentCombo = scoreManager.getCurrentCombo();
            
            if (currentCombo >= requiredCombo) {
                return { success: true, details: { combo: currentCombo } };
            }
            
            return { 
                success: false, 
                error: `${requiredCombo}連続コンボを達成してください（現在: ${currentCombo}）` 
            };
        });
        
        this.validationFunctions.set('validateScore', async (actionResult, step, gameEngine) => {
            // 指定スコアに到達したかの検証
            const scoreManager = gameEngine?.scoreManager;
            if (!scoreManager) {
                return { success: false, error: 'ScoreManager not available' };
            }
            
            const requiredScore = step.requiredScore || 100;
            const currentScore = scoreManager.getCurrentScore();
            
            if (currentScore >= requiredScore) {
                return { success: true, details: { score: currentScore } };
            }
            
            return { 
                success: false, 
                error: `スコア ${requiredScore} に到達してください（現在: ${currentScore}）` 
            };
        });
        
        this.validationFunctions.set('validateCustom', async (actionResult, step, gameEngine) => {
            // カスタムバリデーション
            if (step.customValidation && typeof step.customValidation === 'function') {
                return await step.customValidation(actionResult, step, gameEngine);
            }
            return { success: true };
        });
    }

    /**
     * インタラクションハンドラーの追加
     * @param {string} actionType - アクションタイプ
     * @param {Function} handler - ハンドラー関数
     */
    addInteractionHandler(actionType, handler) {
        this.interactionHandlers.set(actionType, handler);
    }

    /**
     * インタラクションハンドラーの削除
     * @param {string} actionType - アクションタイプ
     */
    removeInteractionHandler(actionType) {
        this.interactionHandlers.delete(actionType);
    }

    /**
     * 全インタラクションハンドラーのクリア
     */
    clearInteractionHandlers() {
        this.interactionHandlers.clear();
    }

    /**
     * ハイライトのクリア
     */
    clearHighlight() {
        if (this.currentHighlight) {
            this.currentHighlight.remove();
            this.currentHighlight = null;
        }
    }

    /**
     * ステップタイマーのクリア
     */
    clearStepTimer() {
        if (this.stepTimer) {
            clearTimeout(this.stepTimer);
            this.stepTimer = null;
        }
    }

    /**
     * ステップメッセージの表示
     * @param {string} message - メッセージ
     * @param {Object} position - 表示位置
     */
    showStepMessage(message, position) {
        // TutorialOverlayとの連携は後続のタスクで実装
        console.log(`チュートリアルメッセージ: ${message}`);
    }

    /**
     * 経過時間の取得
     * @returns {number} 経過時間（ミリ秒）
     */
    getElapsedTime() {
        if (!this.userProgress.startTime) return 0;
        
        const endTime = this.userProgress.pausedTime || Date.now();
        return endTime - this.userProgress.startTime;
    }

    /**
     * ユーザー進捗の読み込み
     */
    loadUserProgress() {
        try {
            const saved = localStorage.getItem('awaputi_tutorial_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                this.userProgress.completedTutorials = new Set(progress.completedTutorials || []);
                this.userProgress.currentTutorialId = progress.currentTutorialId;
                this.userProgress.currentStepIndex = progress.currentStepIndex || 0;
            }
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to load user progress', error);
        }
    }

    /**
     * ユーザー進捗の保存
     */
    saveUserProgress() {
        try {
            const progress = {
                completedTutorials: Array.from(this.userProgress.completedTutorials),
                currentTutorialId: this.userProgress.currentTutorialId,
                currentStepIndex: this.userProgress.currentStepIndex
            };
            localStorage.setItem('awaputi_tutorial_progress', JSON.stringify(progress));
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to save user progress', error);
        }
    }

    /**
     * 利用可能なチュートリアル一覧を取得
     * @param {Object} options - フィルタオプション
     * @returns {Array} チュートリアル一覧
     */
    getAvailableTutorials(options = {}) {
        try {
            const tutorials = Array.from(this.tutorialData.values());
            
            // フィルタリング
            let filteredTutorials = tutorials;
            
            if (options.category) {
                filteredTutorials = filteredTutorials.filter(t => t.category === options.category);
            }
            
            if (options.difficulty) {
                filteredTutorials = filteredTutorials.filter(t => t.difficulty === options.difficulty);
            }
            
            if (options.showOnlyAvailable) {
                filteredTutorials = filteredTutorials.filter(t => this.checkPrerequisites(t));
            }
            
            if (options.showOnlyIncomplete) {
                filteredTutorials = filteredTutorials.filter(t => !this.userProgress.completedTutorials.has(t.id));
            }
            
            // ソート
            const sortBy = options.sortBy || 'order';
            switch (sortBy) {
                case 'difficulty':
                    const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
                    filteredTutorials.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
                    break;
                case 'duration':
                    filteredTutorials.sort((a, b) => a.estimatedDuration - b.estimatedDuration);
                    break;
                case 'alphabetical':
                    filteredTutorials.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                default:
                    // デフォルトは定義順
                    break;
            }
            
            return filteredTutorials.map(tutorial => ({
                id: tutorial.id,
                title: tutorial.title,
                description: tutorial.description,
                category: tutorial.category,
                difficulty: tutorial.difficulty,
                estimatedDuration: tutorial.estimatedDuration,
                steps: tutorial.steps.length,
                isCompleted: this.userProgress.completedTutorials.has(tutorial.id),
                isAvailable: this.checkPrerequisites(tutorial),
                prerequisites: tutorial.prerequisites
            }));
            
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to get available tutorials', error);
            return [];
        }
    }

    /**
     * チュートリアル統計の取得
     * @returns {Object} 統計情報
     */
    getTutorialStatistics() {
        try {
            const totalTutorials = this.tutorialData.size;
            const completedTutorials = this.userProgress.completedTutorials.size;
            const completionRate = totalTutorials > 0 ? (completedTutorials / totalTutorials) * 100 : 0;
            
            return {
                totalTutorials,
                completedTutorials,
                completionRate,
                totalTime: this.tutorialStats.totalTime,
                averageStepTimes: Object.fromEntries(this.tutorialStats.averageStepTime),
                skipCounts: Object.fromEntries(this.tutorialStats.skipCount),
                lastUpdated: this.tutorialStats.lastUpdated,
                currentTutorial: this.userProgress.currentTutorialId,
                isRunning: !!this.currentTutorial
            };
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to get tutorial statistics', error);
            return {};
        }
    }

    /**
     * チュートリアル設定の更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        try {
            this.config = { ...this.config, ...newConfig };
            this.loggingSystem.info('TutorialManager', 'Tutorial config updated', newConfig);
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to update tutorial config', error);
        }
    }

    /**
     * 特定のステップに移動
     * @param {number} stepIndex - ステップインデックス
     * @returns {boolean} 移動成功フラグ
     */
    goToStep(stepIndex) {
        try {
            if (!this.currentTutorial) {
                this.loggingSystem.warn('TutorialManager', 'No tutorial is currently running');
                return false;
            }
            
            if (stepIndex < 0 || stepIndex >= this.currentTutorial.steps.length) {
                this.loggingSystem.warn('TutorialManager', `Invalid step index: ${stepIndex}`);
                return false;
            }
            
            this.currentStep = stepIndex;
            this.userProgress.currentStepIndex = stepIndex;
            
            this.executeStep(stepIndex);
            this.saveUserProgress();
            
            this.loggingSystem.info('TutorialManager', `Moved to step ${stepIndex}`);
            return true;
            
        } catch (error) {
            this.loggingSystem.error('TutorialManager', `Failed to go to step ${stepIndex}`, error);
            return false;
        }
    }

    /**
     * チュートリアルの再起動
     * @param {string} tutorialId - チュートリアルID（省略時は現在のチュートリアル）
     * @returns {Promise<boolean>} 再起動成功フラグ
     */
    async restartTutorial(tutorialId = null) {
        try {
            const targetTutorialId = tutorialId || this.userProgress.currentTutorialId;
            
            if (!targetTutorialId) {
                this.loggingSystem.warn('TutorialManager', 'No tutorial to restart');
                return false;
            }
            
            // 現在のチュートリアルを停止
            this.stopTutorial();
            
            // 指定されたチュートリアルを開始
            return await this.startTutorial(targetTutorialId);
            
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to restart tutorial', error);
            return false;
        }
    }

    /**
     * チュートリアル統計の読み込み
     */
    loadTutorialStats() {
        try {
            const saved = localStorage.getItem('awaputi_tutorial_stats');
            if (saved) {
                const stats = JSON.parse(saved);
                this.tutorialStats = {
                    totalTime: stats.totalTime || 0,
                    averageStepTime: new Map(stats.averageStepTime || []),
                    skipCount: new Map(stats.skipCount || []),
                    failureCount: new Map(stats.failureCount || []),
                    attemptCount: new Map(stats.attemptCount || []),
                    completionRate: stats.completionRate || 0,
                    lastUpdated: stats.lastUpdated || Date.now()
                };
            }
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to load tutorial statistics', error);
        }
    }

    /**
     * チュートリアル統計の保存
     */
    saveTutorialStats() {
        try {
            const stats = {
                totalTime: this.tutorialStats.totalTime,
                averageStepTime: Array.from(this.tutorialStats.averageStepTime.entries()),
                skipCount: Array.from(this.tutorialStats.skipCount.entries()),
                failureCount: Array.from(this.tutorialStats.failureCount.entries()),
                attemptCount: Array.from(this.tutorialStats.attemptCount.entries()),
                completionRate: this.tutorialStats.completionRate,
                lastUpdated: Date.now()
            };
            localStorage.setItem('awaputi_tutorial_stats', JSON.stringify(stats));
            this.tutorialStats.lastUpdated = Date.now();
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to save tutorial statistics', error);
        }
    }

    /**
     * ステップ統計の更新
     * @param {string} stepId - ステップID
     * @param {number} duration - 所要時間
     * @param {boolean} success - 成功フラグ
     * @param {boolean} skipped - スキップフラグ
     */
    updateStepStats(stepId, duration, success = true, skipped = false) {
        try {
            const tutorialId = this.currentTutorial?.id;
            if (!tutorialId) return;
            
            const stepKey = `${tutorialId}_${stepId}`;
            
            // 平均時間の更新
            const currentAvg = this.tutorialStats.averageStepTime.get(stepKey) || 0;
            const newAvg = currentAvg > 0 ? (currentAvg + duration) / 2 : duration;
            this.tutorialStats.averageStepTime.set(stepKey, newAvg);
            
            // 試行回数の更新
            const currentAttempts = this.tutorialStats.attemptCount.get(stepKey) || 0;
            this.tutorialStats.attemptCount.set(stepKey, currentAttempts + 1);
            
            // スキップ回数の更新
            if (skipped) {
                const currentSkips = this.tutorialStats.skipCount.get(stepKey) || 0;
                this.tutorialStats.skipCount.set(stepKey, currentSkips + 1);
            }
            
            // 失敗回数の更新
            if (!success) {
                const currentFailures = this.tutorialStats.failureCount.get(stepKey) || 0;
                this.tutorialStats.failureCount.set(stepKey, currentFailures + 1);
            }
            
            this.tutorialStats.totalTime += duration;
            
            // 統計の自動保存（5分間隔）
            const now = Date.now();
            if (now - this.tutorialStats.lastUpdated > 300000) { // 5分
                this.saveTutorialStats();
            }
            
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to update step statistics', error);
        }
    }

    /**
     * TutorialOverlayとの統合設定
     */
    setupOverlayIntegration() {
        try {
            // チュートリアルナビゲーションイベントの監視
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
     * オーバーレイナビゲーションの処理
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
     * チュートリアル進捗の詳細を取得
     * @param {string} tutorialId - チュートリアルID（省略時は現在のチュートリアル）
     * @returns {Object} 詳細な進捗情報
     */
    getTutorialProgressDetails(tutorialId = null) {
        try {
            const targetId = tutorialId || this.userProgress.currentTutorialId;
            if (!targetId) {
                return null;
            }
            
            const tutorial = this.tutorialData.get(targetId);
            if (!tutorial) {
                return null;
            }
            
            const isCompleted = this.userProgress.completedTutorials.has(targetId);
            const stepStats = this.getStepStatistics(targetId);
            
            return {
                tutorialId: targetId,
                title: tutorial.title,
                totalSteps: tutorial.steps.length,
                currentStep: targetId === this.userProgress.currentTutorialId ? this.currentStep : 0,
                isCompleted,
                isRunning: targetId === this.userProgress.currentTutorialId && !!this.currentTutorial,
                isPaused: !!this.userProgress.pausedTime,
                completionRate: this.calculateCompletionRate(targetId),
                estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(targetId),
                stepStatistics: stepStats,
                lastAttempt: this.getLastAttemptInfo(targetId),
                prerequisites: tutorial.prerequisites,
                difficulty: tutorial.difficulty || 'beginner'
            };
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to get tutorial progress details', error);
            return null;
        }
    }

    /**
     * ステップ統計の取得
     * @param {string} tutorialId - チュートリアルID
     * @returns {Object} ステップ統計
     */
    getStepStatistics(tutorialId) {
        try {
            const tutorial = this.tutorialData.get(tutorialId);
            if (!tutorial) {
                return {};
            }
            
            const stats = {};
            tutorial.steps.forEach((step, index) => {
                const stepKey = `${tutorialId}_${step.id}`;
                stats[step.id] = {
                    index,
                    title: step.title,
                    averageTime: this.tutorialStats.averageStepTime.get(stepKey) || 0,
                    skipCount: this.tutorialStats.skipCount.get(stepKey) || 0,
                    failureCount: this.tutorialStats.failureCount?.get(stepKey) || 0,
                    successRate: this.calculateStepSuccessRate(stepKey)
                };
            });
            
            return stats;
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to get step statistics', error);
            return {};
        }
    }

    /**
     * 完了率の計算
     * @param {string} tutorialId - チュートリアルID
     * @returns {number} 完了率（0-100）
     */
    calculateCompletionRate(tutorialId) {
        if (this.userProgress.completedTutorials.has(tutorialId)) {
            return 100;
        }
        
        if (tutorialId !== this.userProgress.currentTutorialId) {
            return 0;
        }
        
        const tutorial = this.tutorialData.get(tutorialId);
        if (!tutorial || !tutorial.steps.length) {
            return 0;
        }
        
        return Math.round((this.currentStep / tutorial.steps.length) * 100);
    }

    /**
     * 推定残り時間の計算
     * @param {string} tutorialId - チュートリアルID
     * @returns {number} 推定残り時間（ミリ秒）
     */
    calculateEstimatedTimeRemaining(tutorialId) {
        try {
            const tutorial = this.tutorialData.get(tutorialId);
            if (!tutorial) {
                return 0;
            }
            
            if (this.userProgress.completedTutorials.has(tutorialId)) {
                return 0;
            }
            
            let remainingTime = 0;
            const startIndex = tutorialId === this.userProgress.currentTutorialId ? this.currentStep : 0;
            
            for (let i = startIndex; i < tutorial.steps.length; i++) {
                const step = tutorial.steps[i];
                const stepKey = `${tutorialId}_${step.id}`;
                const avgTime = this.tutorialStats.averageStepTime.get(stepKey);
                
                // 平均時間がある場合はそれを使用、なければデフォルト値
                remainingTime += avgTime || (step.estimatedDuration || 30000);
            }
            
            return remainingTime;
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to calculate estimated time remaining', error);
            return 0;
        }
    }

    /**
     * ステップ成功率の計算
     * @param {string} stepKey - ステップキー
     * @returns {number} 成功率（0-100）
     */
    calculateStepSuccessRate(stepKey) {
        const attempts = (this.tutorialStats.attemptCount?.get(stepKey) || 0);
        const failures = (this.tutorialStats.failureCount?.get(stepKey) || 0);
        
        if (attempts === 0) {
            return 0;
        }
        
        const successes = attempts - failures;
        return Math.round((successes / attempts) * 100);
    }

    /**
     * 最後の試行情報を取得
     * @param {string} tutorialId - チュートリアルID
     * @returns {Object|null} 最後の試行情報
     */
    getLastAttemptInfo(tutorialId) {
        const key = `awaputi_tutorial_last_attempt_${tutorialId}`;
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * チュートリアル試行の記録
     * @param {string} tutorialId - チュートリアルID
     * @param {Object} attemptInfo - 試行情報
     */
    recordTutorialAttempt(tutorialId, attemptInfo) {
        try {
            const key = `awaputi_tutorial_last_attempt_${tutorialId}`;
            const record = {
                tutorialId,
                timestamp: Date.now(),
                completed: attemptInfo.completed || false,
                stepsCompleted: attemptInfo.stepsCompleted || 0,
                totalTime: attemptInfo.totalTime || 0,
                skipped: attemptInfo.skipped || false
            };
            
            localStorage.setItem(key, JSON.stringify(record));
        } catch (error) {
            this.loggingSystem.error('TutorialManager', 'Failed to record tutorial attempt', error);
        }
    }

    /**
     * リソースのクリーンアップ
     */
    destroy() {
        try {
            this.stopTutorial();
            this.saveUserProgress();
            this.saveTutorialStats();
            this.tutorialData.clear();
            this.interactionHandlers.clear();
            this.validationFunctions.clear();
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
 * @returns {TutorialManager} TutorialManagerインスタンス
 */
export function getTutorialManager(gameEngine) {
    if (!tutorialManagerInstance) {
        tutorialManagerInstance = new TutorialManager(gameEngine);
    }
    return tutorialManagerInstance;
}

/**
 * TutorialManagerインスタンスを再初期化
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {TutorialManager} 新しいTutorialManagerインスタンス
 */
export function reinitializeTutorialManager(gameEngine) {
    if (tutorialManagerInstance) {
        tutorialManagerInstance.destroy();
    }
    tutorialManagerInstance = new TutorialManager(gameEngine);
    return tutorialManagerInstance;
}