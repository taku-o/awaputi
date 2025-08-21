/**
 * TutorialValidationEngine.ts
 * チュートリアルバリデーション・実行エンジンクラス
 * ステップ検証、インタラクション検出、タイムアウト処理を担当
 */

import { ErrorHandler  } from '../../utils/ErrorHandler.js';
import { LoggingSystem  } from '../LoggingSystem.js';

// 型定義
export interface GameEngine { bubbleManager?: BubbleManager,
    scoreManager?: ScoreManager;
    sceneManager?: SceneManager;
    settingsManager?: SettingsManager;
    eventBus?: EventBus;

export interface BubbleManager { getBubbleById(id: string): Bubble | null }

export interface Bubble { id: string,
    type: string;
    isPopped: boolean;

export interface ScoreManager { getCurrentCombo(): number,
    getCurrentScore(): number;

export interface SceneManager { currentScene?: Scene;

export interface Scene {
    constructor: { nam,e: string,

export interface SettingsManager { getSetting(key: string): any;

export interface EventBus { emit(event: string, data: any): void;

export interface StepAction {
    type: string;

export interface TutorialStep { id: string,
    index?: number;
    validationFunction?: string;
    action?: StepAction;
    minDragDistance?: number;
    requiredCombo?: number;
    targetScene?: string;
    requiredScore?: number;
    targetSetting?: string;
    targetValue?: any;
    timeoutMessage?: string;

export interface ActionResult { bubbleId?: string,
    bubbleType?: string;
    dragDistance?: number;
    [key: string]: any;

export interface ValidationResult { success: boolean,
    error?: string | null;
    details?: any;

export interface TutorialData { id: string,
    steps: TutorialStep[];

export interface TutorialOverlay { showError(error: string): Promise<void>,
    showTimeout(message: string): Promise<void>;

export type ValidationFunction = (actionResult: ActionResult, step: TutorialStep, gameEngine: GameEngine) => Promise<ValidationResult>;
export type InteractionHandler = (...args: any[]) => void;

/**
 * チュートリアルバリデーション・実行エンジンクラス
 */
export class TutorialValidationEngine {
    private gameEngine: GameEngine;
    private loggingSystem: LoggingSystem;
    private, interactionHandlers: Map<string, InteractionHandler>,
    private validationFunctions: Map<string, ValidationFunction>;
    private stepTimer: number | null;
    constructor(gameEngine: GameEngine, loggingSystem?: LoggingSystem) {

        this.gameEngine = gameEngine;
        this.loggingSystem = loggingSystem || (LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // インタラクション検出
        this.interactionHandlers = new Map<string, InteractionHandler>(),
        this.validationFunctions = new Map<string, ValidationFunction>(),
        this.stepTimer = null }
        this.initialize(); }
    }
    
    /**
     * バリデーションエンジンを初期化
     */
    initialize(): void { try {'
            this.setupValidationFunctions()','
            this.loggingSystem.log('TutorialValidationEngineが初期化されました', 'info', 'TutorialValidationEngine) }'

        } catch (error) { }

            this.loggingSystem.log(`バリデーションエンジン初期化エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialValidationEngine');
        }
    }
    
    /**
     * バリデーション関数をセットアップ'
     */''
    setupValidationFunctions()';'
        this.validationFunctions.set('validateBubblePop', async (actionResult, step, gameEngine) => {  const bubbleManager = gameEngine?.bubbleManager,' }'

            if (!bubbleManager) { : undefined', '
                return { success: false, error: 'BubbleManager not available'
            }
            ';'

            const bubbleId = actionResult?.bubbleId;
            if (!bubbleId) { : undefined', '
                return { success: false, error: '泡を正しくクリックしてください'
            }
            ';'

            const bubble = bubbleManager.getBubbleById(bubbleId);
            if (bubble && bubble.isPopped) {
    
}
                return { success: true,

            return { success: false, error: '泡が正しく割れませんでした'
            }'}');
        ';'
        // 泡をドラッグするバリデーション
        this.validationFunctions.set('validateBubbleDrag', async (actionResult, step, gameEngine) => { }

            if (!actionResult || !actionResult.dragDistance) { }'

                return { success: false, error: 'ドラッグ操作が検出されませんでした'
            }
            
            const minDistance = step.minDragDistance || 50;
            if (actionResult.dragDistance < minDistance) { return {  };
                    success: false;
                    error: `もう少し長くドラッグしてください（最小: ${minDistance}px）` 
                }
            ';'

            return { success: true;'}');
        ';'
        // 特殊泡を割るバリデーション
        this.validationFunctions.set('validateSpecialBubblePop', async (actionResult, step, gameEngine) => {  const bubbleType = actionResult?.bubbleType,' }'

            if (!bubbleType) { : undefined', '
                return { success: false, error: '泡の情報が取得できません'
            }

            const specialTypes = ['rainbow', 'pink', 'clock', 'electric', 'golden', 'frozen', 'magnetic', 'explosive', 'phantom', 'multiplier'];
            if(!specialTypes.includes(bubbleType)) { return { success: false, ' };'

                    error: '特殊な泡をクリックしてください'
            }
                    details: { expectedTypes: specialTypes, actualType: bubbleType,
            ';'

            return { success: true, details: { bubbleType  }'}');
        ';'
        // コンボ達成バリデーション
        this.validationFunctions.set('validateCombo', async (actionResult, step, gameEngine) => {  const scoreManager = gameEngine?.scoreManager,' }'

            if (!scoreManager) { : undefined', '
                return { success: false, error: 'ScoreManager not available'
            }
            
            const currentCombo = scoreManager.getCurrentCombo();
            const requiredCombo = step.requiredCombo || 3;
            
            if (currentCombo >= requiredCombo) {
    
}
                return { success: true, details: { combo: currentCombo,
            }
            
            return { success: false,
                error: `${requiredCombo}コンボ以上を達成してください（現在: ${currentCombo}）`};}');'
        ';'
        // メニューナビゲーションバリデーション
        this.validationFunctions.set('validateMenuNavigation', async (actionResult, step, gameEngine) => {  const targetScene = step.targetScene,
            const currentScene = gameEngine?.sceneManager?.currentScene?.constructor?.name,

            ' }'

            if (!targetScene) { : undefined', '
                return { success: false, error: 'ターゲットシーンが指定されていません'
            }
            
            if (currentScene === targetScene) {
    
}
                return { success: true, details: { scene: currentScene,
            }
            
            return { success: false,
                error: `${targetScene}画面に移動してください`};}');'
        ';'
        // スコア達成バリデーション
        this.validationFunctions.set('validateScore', async (actionResult, step, gameEngine) => {  const scoreManager = gameEngine?.scoreManager,' }'

            if (!scoreManager) { : undefined', '
                return { success: false, error: 'ScoreManager not available'
            }
            
            const currentScore = scoreManager.getCurrentScore();
            const requiredScore = step.requiredScore || 100;
            
            if (currentScore >= requiredScore) {
    
}
                return { success: true, details: { score: currentScore,
            }
            
            return { success: false,
                error: `${requiredScore}点以上を達成してください（現在: ${currentScore}点）`};}');'
        ';'
        // 設定変更バリデーション
        this.validationFunctions.set('validateSettingsChange', async (actionResult, step, gameEngine) => {  const targetSetting = step.targetSetting,
            const targetValue = step.targetValue,

            ' }'

            if (!targetSetting) { }'

                return { success: false, error: '変更する設定が指定されていません'
            }
            ';'

            const settingsManager = gameEngine?.settingsManager;
            if (!settingsManager) { : undefined', '
                return { success: false, error: 'SettingsManager not available'
            }
            
            const currentValue = settingsManager.getSetting(targetSetting);
            if (currentValue === targetValue) {
    
}
                return { success: true, details: { setting: targetSetting, value: currentValue,
            }
            
            return { success: false,
                error: `${targetSetting}設定を${targetValue}に変更してください` 
            });
    }
    
    /**
     * ステップの検証を実行
     * @param step - ステップデータ
     * @param actionResult - アクション結果
     * @returns 検証結果'
     */''
    async validateStep(step: TutorialStep, actionResult: ActionResult): Promise<ValidationResult> { try {'
            const validationFunc = this.validationFunctions.get(step.validationFunction || '),'
            if (!validationFunc) { }
                return { success: true,
            ';'
            // バリデーション実行
            const result = await validationFunc(actionResult, step, this.gameEngine);
            ';'
            // 結果の正規化
            if (typeof, result === 'boolean') { }

                return { success: result, error: result ? null : 'Validation failed' 
            return { success: result.success || false,
                error: result.error || null };
                details: result.details || null 
    };
            ';'

        } catch (error) { }

            this.loggingSystem.log(`ステップ検証エラー: ${step.id} - ${(error, as, Error'}'.message}`, 'error', 'TutorialValidationEngine');

            return { success: false,' };'

                error: (error, as Error').message || 'Validation error occurred' }'
            }
    }
    
    /**
     * バリデーション関数を動的に決定
     * @param step - ステップデータ
     * @returns バリデーション関数名
     */
    determineValidationFunction(step: TutorialStep): string | null { try {
            if (step.validationFunction) {
    
}
                return step.validationFunction;
            
            // アクションタイプに基づいて自動決定
            const actionType = step.action?.type;
            if(!actionType) return null;
             : undefined';'
            const actionToValidation: Record<string, string> = { ', 'click_bubble': 'validateBubblePop','
                'drag_bubble': 'validateBubbleDrag',
                'click_special_bubble': 'validateSpecialBubblePop',
                'achieve_combo': 'validateCombo',
                'navigate_menu': 'validateMenuNavigation',
                'achieve_score': 'validateScore',
                'change_setting': 'validateSettingsChange' };
            
            return actionToValidation[actionType] || null;

        } catch (error) { }

            this.loggingSystem.log(`バリデーション関数決定エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialValidationEngine');
            return null;
    
    /**
     * 待機アクションを決定
     * @param step - ステップデータ
     * @returns 待機アクション
     */
    determineWaitAction(step: TutorialStep): string { try {
            if ((step, as any).waitAction) {
                return (step, as any).waitAction }
            ';'

            const actionType = step.action?.type;
            if(!actionType) return 'wait_click';
             : undefined';'
            const actionToWait: Record<string, string> = { ', 'click_bubble': 'wait_bubble_click','
                'drag_bubble': 'wait_bubble_drag',
                'click_special_bubble': 'wait_special_bubble_click',
                'achieve_combo': 'wait_combo',
                'navigate_menu': 'wait_scene_change',
                'achieve_score': 'wait_score_change',
                'change_setting': 'wait_setting_change' };

            return actionToWait[actionType] || 'wait_click';

        } catch (error) { }

            this.loggingSystem.log(`待機アクション決定エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialValidationEngine');
            return 'wait_click';
    
    /**
     * インタラクションハンドラーを追加
     * @param eventType - イベントタイプ
     * @param handler - ハンドラー関数
     */
    addInteractionHandler(eventType: string, handler: InteractionHandler): void { this.interactionHandlers.set(eventType, handler) }
    
    /**
     * インタラクションハンドラーを削除
     * @param eventType - イベントタイプ
     */
    removeInteractionHandler(eventType: string): void { this.interactionHandlers.delete(eventType) }
    
    /**
     * すべてのインタラクションハンドラーをクリア
     */
    clearInteractionHandlers(): void { this.interactionHandlers.clear() }
    
    /**
     * ステップタイマーをセット
     * @param timeout - タイムアウト時間（ミリ秒）
     * @param callback - タイムアウト時のコールバック
     */
    setStepTimer(timeout: number, callback: () => void): void { this.clearStepTimer(),
        
        if (timeout && timeout > 0) {
    
}
            this.stepTimer = setTimeout(() => {  }
                callback(); }
            }, timeout) as any;
        }
    }
    
    /**
     * ステップタイマーをクリア
     */
    clearStepTimer(): void { if (this.stepTimer) {
            clearTimeout(this.stepTimer),
            this.stepTimer = null }
    }
    
    /**
     * バリデーションエラーメッセージを表示
     * @param error - エラーメッセージ
     * @param tutorialOverlay - チュートリアルオーバーレイ
     * @param currentTutorial - 現在のチュートリアル
     * @param currentStep - 現在のステップ
     */
    async showValidationError(error: string, tutorialOverlay?: TutorialOverlay, currentTutorial?: TutorialData, currentStep?: number): Promise<void>;
        try { if (tutorialOverlay) {
                await tutorialOverlay.showError(error) }
            ';'
            // エラーイベントの発火
            if (this.gameEngine && this.gameEngine.eventBus) {

                this.gameEngine.eventBus.emit('tutorial_validation_error', {
                    tutorialId: currentTutorial?.id, : undefined),
                    stepId: currentTutorial?.steps[currentStep || 0]?.id, : undefined 
                    error: error) }

            } catch (err) { }

            this.loggingSystem.log(`バリデーションエラー表示失敗: ${(err, as, Error'}'.message}`, 'error', 'TutorialValidationEngine');
        }
    }
    
    /**
     * タイムアウトメッセージを表示
     * @param step - ステップデータ
     * @param tutorialOverlay - チュートリアルオーバーレイ
     * @param currentTutorial - 現在のチュートリアル'
     */''
    async showTimeoutMessage(step: TutorialStep, tutorialOverlay?: TutorialOverlay, currentTutorial?: TutorialData): Promise<void>;

        try {'
            const message = step.timeoutMessage || 'このステップの制限時間を超過しました。もう一度お試しください。',
            if (tutorialOverlay) {
    
}
                await tutorialOverlay.showTimeout(message); }
            }
            ';'
            // タイムアウトイベントの発火
            if (this.gameEngine && this.gameEngine.eventBus) {

                this.gameEngine.eventBus.emit('tutorial_step_timeout', {
                    tutorialId: currentTutorial?.id, : undefined),
                    stepId: step.id }
                    stepIndex: step.index); 
    } catch (error) { }

            this.loggingSystem.log(`タイムアウトメッセージ表示失敗: ${(error, as, Error'}'.message}`, 'error', 'TutorialValidationEngine');
        }
    }
    
    /**
     * カスタムバリデーション関数を登録
     * @param name - バリデーション関数名
     * @param func - バリデーション関数
     */
    registerValidationFunction(name: string, func: ValidationFunction): void { try {
            this.validationFunctions.set(name, func),' }'

            this.loggingSystem.log(`カスタムバリデーション関数が登録されました: ${name}`, 'info', 'TutorialValidationEngine'});

        } catch (error) { }

            this.loggingSystem.log(`バリデーション関数登録エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialValidationEngine');
        }
    }
    
    /**
     * バリデーション関数を削除
     * @param name - バリデーション関数名
     */
    unregisterValidationFunction(name: string): void { try {
            this.validationFunctions.delete(name),' }'

            this.loggingSystem.log(`バリデーション関数が削除されました: ${name}`, 'info', 'TutorialValidationEngine'});

        } catch (error) { }

            this.loggingSystem.log(`バリデーション関数削除エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialValidationEngine');
        }
    }
    
    /**
     * 登録されているバリデーション関数一覧を取得
     * @returns バリデーション関数名の配列
     */
    getRegisteredValidationFunctions(): string[] { return Array.from(this.validationFunctions.keys() }
    
    /**
     * リソースをクリーンアップ
     */
    destroy(): void { try {
            this.clearStepTimer(),

            this.clearInteractionHandlers(),
            this.validationFunctions.clear()','
            this.loggingSystem.log('TutorialValidationEngineがクリーンアップされました', 'info', 'TutorialValidationEngine) }'

        } catch (error) { }

            this.loggingSystem.log(`クリーンアップエラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialValidationEngine');
        }
}

// シングルトンインスタンス管理
let tutorialValidationEngineInstance: TutorialValidationEngine | null = null,

/**
 * TutorialValidationEngineのシングルトンインスタンスを取得
 * @param gameEngine - ゲームエンジン
 * @param loggingSystem - ロギングシステム
 * @returns シングルトンインスタンス
 */
export function getTutorialValidationEngine(gameEngine: GameEngine, loggingSystem?: LoggingSystem): TutorialValidationEngine { if (!tutorialValidationEngineInstance) {
        tutorialValidationEngineInstance = new TutorialValidationEngine(gameEngine, loggingSystem) }
    return tutorialValidationEngineInstance;
}

/**
 * TutorialValidationEngineのシングルトンインスタンスを再初期化
 * @param gameEngine - ゲームエンジン
 * @param loggingSystem - ロギングシステム
 * @returns 新しいシングルトンインスタンス
 */
export function reinitializeTutorialValidationEngine(gameEngine: GameEngine, loggingSystem?: LoggingSystem): TutorialValidationEngine { if (tutorialValidationEngineInstance) {
        tutorialValidationEngineInstance.destroy() }''
    tutorialValidationEngineInstance = new TutorialValidationEngine(gameEngine, loggingSystem);
    return tutorialValidationEngineInstance;
}

export default TutorialValidationEngine;