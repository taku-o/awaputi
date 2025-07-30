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
                const timeout = options.timeout || 30000; // 30秒タイムアウト
                
                // タイムアウト設定
                const timeoutId = setTimeout(() => {
                    this.removeInteractionHandler(actionType);
                    reject(new Error(`User action timeout: ${actionType}`));
                }, timeout);

                // アクションハンドラー設定
                const handler = (event) => {
                    clearTimeout(timeoutId);
                    this.removeInteractionHandler(actionType);
                    resolve(event);
                };

                this.addInteractionHandler(actionType, handler);
                
                this.loggingSystem.debug('TutorialManager', `Waiting for user action: ${actionType}`);
            } catch (error) {
                reject(error);
            }
        });
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
            
            // ステップ指示の表示
            this.showStepInstructions(step);
            
            // 要素のハイライト
            if (step.targetElement) {
                this.highlightElement(step.targetElement, step.instructions);
            }
            
            // ユーザーアクションの待機
            if (step.waitForAction) {
                try {
                    await this.waitForUserAction(step.waitForAction);
                    
                    // バリデーション実行
                    if (step.validationFunction && !this.validateStep(step)) {
                        this.loggingSystem.warn('TutorialManager', `Step validation failed: ${step.id}`);
                        return;
                    }
                    
                    // 次のステップに自動進行
                    setTimeout(() => this.nextStep(), 1000);
                    
                } catch (error) {
                    this.loggingSystem.error('TutorialManager', `Step execution failed: ${step.id}`, error);
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
     * @returns {boolean} バリデーション結果
     */
    validateStep(step) {
        try {
            const validationFunc = this.validationFunctions.get(step.validationFunction);
            if (validationFunc) {
                return validationFunc();
            }
            return true;
        } catch (error) {
            this.loggingSystem.error('TutorialManager', `Step validation error: ${step.id}`, error);
            return false;
        }
    }

    /**
     * インタラクションハンドラーの設定
     */
    setupInteractionHandlers() {
        // バリデーション関数の登録
        this.validationFunctions.set('validateBubblePop', () => {
            // 泡が割られたかの検証
            return true; // プレースホルダー
        });
        
        this.validationFunctions.set('validateBubbleDrag', () => {
            // 泡がドラッグされたかの検証
            return true; // プレースホルダー
        });
        
        this.validationFunctions.set('validateSpecialBubblePop', () => {
            // 特殊泡が割られたかの検証
            return true; // プレースホルダー
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
     */
    updateStepStats(stepId, duration) {
        try {
            const currentAvg = this.tutorialStats.averageStepTime.get(stepId) || 0;
            const newAvg = currentAvg > 0 ? (currentAvg + duration) / 2 : duration;
            this.tutorialStats.averageStepTime.set(stepId, newAvg);
            
            this.tutorialStats.totalTime += duration;
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