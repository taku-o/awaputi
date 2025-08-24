/**
 * ErrorPreventionHandler
 * 
 * エラー防止処理システム機能を担当
 * Proactive Error Prevention Patternの一部として設計
 * 
 * **Features**:
 * - Double-click and rapid-click prevention
 * - Critical action confirmation dialogs
 * - Game state warning detection
 * - Safety delay mechanisms for destructive actions
 * 
 * @module ErrorPreventionHandler
 * Created: Phase G.9 (Issue #103)
 */

// 型定義
export interface SafetyDelayConfig {
    gameReset: number;
    destructiveAction: number;
    criticalAction: number;
    settingsChange: number;
}

export interface WarningThresholdConfig {
    lowHP: number;
    lowScore: number;
    timeRunningOut: number;
    highErrorRate: number;
}

export interface PreventionConfig {
    doubleClickPrevention: number;
    confirmCriticalActions: boolean;
    safetyDelays: SafetyDelayConfig;
    warningThresholds: WarningThresholdConfig;
    rapidClickThreshold: number;
    maxClickHistorySize: number;
}

export interface ConfirmationContext {
    title: string;
    description: string;
    warning?: string;
    element: HTMLElement;
    onConfirm: () => void;
    onCancel: () => void;
    timestamp: number;
    priority: ConfirmationPriority;
}

export interface PreventionState {
    lastClickTimes: Map<string, number>;
    clickHistories: Map<string, number[]>;
    pendingConfirmations: Map<string, ConfirmationContext>;
    warningThresholds: WarningThresholdConfig;
}

export interface CriticalActionDefinition {
    classes: string[];
    attributes: string[];
    patterns: string[];
    selectors: string[];
}

export interface UIComponents {
    confirmDialog: HTMLElement;
    warningBanner?: HTMLElement;
    progressIndicator?: HTMLElement;
}

export interface GameStateWarning {
    type: WarningType;
    severity: WarningSeverity;
    message: string;
    suggestion?: string;
    timestamp: number;
    acknowledged: boolean;
}

export interface GameState {
    hp: number;
    maxHp: number;
    score: number;
    timeRemaining: number;
    combo: number;
    level: number;
    errors: number;
    totalActions: number;
}

export interface PreventionActionInfo {
    type: PreventionType;
    subtype: string;
    severity: WarningSeverity;
    element: HTMLElement;
    message: string;
    timestamp: number;
    preventionTime?: number;
    metadata?: Record<string, any>;
}

export interface DialogOptions {
    title: string;
    description: string;
    warning?: string;
    element: HTMLElement;
    onConfirm: () => void;
    onCancel: () => void;
    priority?: ConfirmationPriority;
    timeout?: number;
    showIcon?: boolean;
}

export interface PreventionStatistics {
    preventedDoubleClicks: number;
    preventedRapidClicks: number;
    pendingConfirmations: number;
    warningsGenerated: number;
    actionsConfirmed: number;
    actionsCancelled: number;
    averageConfirmationTime: number;
}

export interface ElementIdentifier {
    id?: string;
    className?: string;
    tagName: string;
    position: { x: number; y: number };
    textContent?: string;
}

export interface ClickAnalysis {
    isDoubleClick: boolean;
    isRapidClick: boolean;
    timeSinceLastClick: number;
    clickFrequency: number;
    pattern: ClickPattern;
}

export interface ConfirmationResult {
    confirmed: boolean;
    timestamp: number;
    responseTime: number;
    element: HTMLElement;
}

// 列挙型
export type PreventionType = 'input' | 'interface' | 'gameplay' | 'system';
export type WarningSeverity = 'low' | 'medium' | 'high' | 'critical';
export type WarningType = 'gameplay' | 'system' | 'performance' | 'data';
export type ConfirmationPriority = 'low' | 'normal' | 'high' | 'critical';
export type ClickPattern = 'normal' | 'double' | 'rapid' | 'spam' | 'accidental';

// 定数
export const DEFAULT_PREVENTION_CONFIG: PreventionConfig = {
    doubleClickPrevention: 300,
    confirmCriticalActions: true,
    safetyDelays: {
        gameReset: 1000,
        destructiveAction: 500,
        criticalAction: 200,
        settingsChange: 100
    },
    warningThresholds: {
        lowHP: 20,
        lowScore: 100,
        timeRunningOut: 10000,
        highErrorRate: 0.3
    },
    rapidClickThreshold: 5,
    maxClickHistorySize: 10
} as const;

export const CRITICAL_ACTIONS: CriticalActionDefinition = {
    classes: ['reset-btn', 'delete-btn', 'clear-btn', 'new-game-btn', 'quit-btn', 'logout-btn'],
    attributes: ['data-confirm-action', 'data-destructive', 'data-critical'],
    patterns: ['reset', 'delete', 'clear', 'newgame', 'quit', 'logout', 'restart'],
    selectors: ['.danger-action', '.critical-button', '[role="button"][aria-describedby*="warning"]']
} as const;

export const WARNING_MESSAGES = {
    reset: 'この操作により、現在の進行状況が失われます。',
    delete: 'このデータは削除すると復元できません。',
    clear: 'すべてのデータがクリアされます。',
    newGame: '現在のゲームが終了し、新しいゲームが開始されます。',
    quit: 'ゲームを終了します。進行状況は保存されます。',
    logout: 'ログアウトします。未保存のデータは失われる可能性があります。'
} as const;

export const DIALOG_TEXTS = {
    confirmTitle: '操作の確認',
    cancelButton: 'キャンセル',
    proceedButton: '実行',
    warningPrefix: '⚠️ 注意: '
} as const;

export const CLICK_THRESHOLDS = {
    DOUBLE_CLICK_MAX: 500,
    RAPID_CLICK_WINDOW: 1000,
    RAPID_CLICK_COUNT: 5,
    SPAM_CLICK_COUNT: 10,
    ACCIDENTAL_CLICK_THRESHOLD: 50
} as const;

// ユーティリティ関数
export function generateElementId(element: HTMLElement): string {
    if (element.id) return element.id;
    
    const className = element.className ? element.className.replace(/\s+/g, '.') : '';
    const position = `${element.offsetTop},${element.offsetLeft}`;
    
    if (className) {
        return `${element.tagName}.${className}@${position}`;
    }
    
    return `${element.tagName}@${position}`;
}

export function analyzeClickPattern(clickHistory: number[], currentTime: number): ClickAnalysis {
    if (clickHistory.length === 0) {
        return {
            isDoubleClick: false,
            isRapidClick: false,
            timeSinceLastClick: 0,
            clickFrequency: 0,
            pattern: 'normal'
        };
    }
    
    const lastClickTime = clickHistory[clickHistory.length - 1];
    const timeSinceLastClick = currentTime - lastClickTime;
    
    // 最近1秒間のクリック数
    const recentClicks = clickHistory.filter(time => currentTime - time < CLICK_THRESHOLDS.RAPID_CLICK_WINDOW);
    const clickFrequency = recentClicks.length;
    
    // パターン判定
    let pattern: ClickPattern = 'normal';
    const isDoubleClick = timeSinceLastClick < CLICK_THRESHOLDS.DOUBLE_CLICK_MAX;
    const isRapidClick = clickFrequency >= CLICK_THRESHOLDS.RAPID_CLICK_COUNT;
    
    if (clickFrequency >= CLICK_THRESHOLDS.SPAM_CLICK_COUNT) {
        pattern = 'spam';
    } else if (isRapidClick) {
        pattern = 'rapid';
    } else if (isDoubleClick) {
        pattern = 'double';
    } else if (timeSinceLastClick < CLICK_THRESHOLDS.ACCIDENTAL_CLICK_THRESHOLD) {
        pattern = 'accidental';
    }
    
    return {
        isDoubleClick,
        isRapidClick,
        timeSinceLastClick,
        clickFrequency,
        pattern
    };
}

export function isCriticalElement(element: HTMLElement): boolean {
    // クラス名チェック
    const hasCriticalClass = CRITICAL_ACTIONS.classes.some(cls =>
        element.classList.contains(cls)
    );
    if (hasCriticalClass) return true;
    
    // 属性チェック
    const hasCriticalAttribute = CRITICAL_ACTIONS.attributes.some(attr =>
        element.hasAttribute(attr)
    );
    if (hasCriticalAttribute) return true;
    
    // セレクターチェック
    const matchesCriticalSelector = CRITICAL_ACTIONS.selectors.some(selector => {
        try {
            return element.matches(selector);
        } catch {
            return false;
        }
    });
    
    if (matchesCriticalSelector) return true;
    
    // テキストパターンチェック
    const elementText = (element.textContent || '').toLowerCase().replace(/\s/g, '');
    const hasPattern = CRITICAL_ACTIONS.patterns.some(pattern =>
        elementText.includes(pattern.toLowerCase())
    );
    
    return hasPattern;
}

export function getActionWarningMessage(element: HTMLElement): string | null {
    for (const [action, message] of Object.entries(WARNING_MESSAGES)) {
        if (element.classList.contains(`${action}-btn`) ||
            element.textContent?.toLowerCase().includes(action.toLowerCase())) {
            return message;
        }
    }
    
    // データ属性から警告メッセージを取得
    const customWarning = element.getAttribute('data-warning');
    if (customWarning) return customWarning;
    
    return null;
}

export function createConfirmationEvent(element: HTMLElement, confirmed: boolean): CustomEvent {
    return new CustomEvent('confirmation-result', {
        detail: {
            element,
            confirmed,
            timestamp: Date.now()
        },
        bubbles: true,
        cancelable: false
    });
}

export class ErrorPreventionHandler {
    private config: PreventionConfig;
    private ui: UIComponents;
    private state: PreventionState;
    private criticalActions: CriticalActionDefinition;
    private statistics: PreventionStatistics;
    
    // コールバック関数
    public onPreventionAction?: (actionInfo: PreventionActionInfo) => void;
    public onWarningGenerated?: (warning: GameStateWarning) => void;
    public onConfirmationResult?: (result: ConfirmationResult) => void;

    constructor(config: PreventionConfig, uiComponents: UIComponents) {
        this.config = { ...DEFAULT_PREVENTION_CONFIG, ...config };
        this.ui = uiComponents;
        this.criticalActions = { ...CRITICAL_ACTIONS };
        
        // 状態管理初期化
        this.state = {
            lastClickTimes: new Map(),
            clickHistories: new Map(),
            pendingConfirmations: new Map(),
            warningThresholds: { ...config.warningThresholds }
        };
        
        // 統計情報初期化
        this.statistics = {
            preventedDoubleClicks: 0,
            preventedRapidClicks: 0,
            pendingConfirmations: 0,
            warningsGenerated: 0,
            actionsConfirmed: 0,
            actionsCancelled: 0,
            averageConfirmationTime: 0
        };
        
        console.log('[ErrorPreventionHandler] Component initialized');
    }

    /**
     * クリック防止処理
     */
    handleClickPrevention(event: MouseEvent): boolean {
        const element = event.target as HTMLElement;
        const now = Date.now();
        const elementId = generateElementId(element);
        
        // クリック履歴を取得・更新
        const clickHistory = this.state.clickHistories.get(elementId) || [];
        clickHistory.push(now);
        
        // 履歴サイズを制限
        if (clickHistory.length > this.config.maxClickHistorySize) {
            clickHistory.shift();
        }
        this.state.clickHistories.set(elementId, clickHistory);
        
        // クリックパターン分析
        const analysis = analyzeClickPattern(clickHistory, now);
        
        // ダブルクリック防止
        if (this.config.doubleClickPrevention > 0 && analysis.isDoubleClick) {
            event.preventDefault();
            event.stopPropagation();
            
            this.reportPreventionAction({
                type: 'input',
                subtype: 'doubleClick',
                severity: 'low',
                element,
                message: '同じ要素を短時間で複数回クリックしました',
                timestamp: now,
                preventionTime: analysis.timeSinceLastClick,
                metadata: { pattern: analysis.pattern }
            });
            
            this.statistics.preventedDoubleClicks++;
            return false;
        }
        
        // 連続クリック防止
        if (analysis.isRapidClick) {
            event.preventDefault();
            event.stopPropagation();
            
            this.reportPreventionAction({
                type: 'input',
                subtype: 'rapidClicks',
                severity: analysis.pattern === 'spam' ? 'high' : 'medium',
                element,
                message: analysis.pattern === 'spam' ? 'スパムクリックが検出されました' : 'クリックが速すぎます',
                timestamp: now,
                metadata: {
                    pattern: analysis.pattern,
                    frequency: analysis.clickFrequency
                }
            });
            
            this.statistics.preventedRapidClicks++;
            return false;
        }
        
        // 重要なアクションの確認
        if (this.shouldConfirmAction(element)) {
            event.preventDefault();
            event.stopPropagation();
            this.requestActionConfirmation(element);
            return false;
        }
        
        // 最終クリック時刻を記録
        this.state.lastClickTimes.set(elementId, now);
        
        return true;
    }

    /**
     * アクションの確認が必要かチェック
     */
    private shouldConfirmAction(element: HTMLElement): boolean {
        if (!this.config.confirmCriticalActions) return false;
        
        // 確認済みイベントの場合はスキップ
        if ((event as any)?._confirmed) return false;
        
        // 既に確認待ちの場合はスキップ
        const elementId = generateElementId(element);
        if (this.state.pendingConfirmations.has(elementId)) return false;
        
        return isCriticalElement(element);
    }

    /**
     * アクション確認を要求
     */
    private requestActionConfirmation(element: HTMLElement): void {
        const actionName = element.textContent?.trim() ||
                          element.getAttribute('aria-label') ||
                          element.getAttribute('title') ||
                          '操作';
        
        const warningText = getActionWarningMessage(element);
        
        const confirmationContext: ConfirmationContext = {
            title: `${actionName}の確認`,
            description: `「${actionName}」を実行してもよろしいですか？`,
            warning: warningText || undefined,
            element,
            onConfirm: () => this.executeConfirmedAction(element),
            onCancel: () => this.cancelAction(element),
            timestamp: Date.now(),
            priority: this.getActionPriority(element)
        };
        
        this.showConfirmDialog(confirmationContext);
    }

    /**
     * アクションの優先度を取得
     */
    private getActionPriority(element: HTMLElement): ConfirmationPriority {
        if (element.classList.contains('reset-btn') ||
            element.classList.contains('delete-btn')) {
            return 'critical';
        }
        
        if (element.classList.contains('clear-btn') ||
            element.classList.contains('new-game-btn')) {
            return 'high';
        }
        
        return 'normal';
    }

    /**
     * 確認ダイアログを表示
     */
    private showConfirmDialog(context: ConfirmationContext): void {
        const dialog = this.ui.confirmDialog;
        if (!dialog) {
            console.error('[ErrorPreventionHandler] Confirm dialog element not found');
            return;
        }
        
        // コンテンツを設定
        const titleElement = dialog.querySelector('.confirm-title');
        const descriptionElement = dialog.querySelector('.confirm-description');
        const warningElement = dialog.querySelector('.confirm-warning');
        
        if (titleElement) titleElement.textContent = context.title;
        if (descriptionElement) descriptionElement.textContent = context.description;
        
        // 警告メッセージ
        if (warningElement) {
            if (context.warning) {
                warningElement.style.display = 'block';
                const warningText = warningElement.querySelector('.confirm-warning-text');
                if (warningText) {
                    warningText.textContent = `${DIALOG_TEXTS.warningPrefix}${context.warning}`;
                }
            } else {
                warningElement.style.display = 'none';
            }
        }
        
        // 優先度に応じたスタイル設定
        dialog.className = `confirm-dialog priority-${context.priority}`;
        
        // ボタンイベント
        this.setupConfirmDialogEvents(dialog, context);
        
        // ダイアログを表示
        dialog.classList.remove('hidden');
        
        // フォーカス管理（キャンセルボタンから開始）
        const cancelBtn = dialog.querySelector('.confirm-btn.cancel') as HTMLButtonElement;
        if (cancelBtn) {
            setTimeout(() => cancelBtn.focus(), 100);
        }
        
        // アクセシビリティ
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('role', 'alertdialog');
        
        // 確認待ちに追加
        const elementId = generateElementId(context.element);
        this.state.pendingConfirmations.set(elementId, context);
        this.statistics.pendingConfirmations++;
    }

    /**
     * 確認ダイアログのイベントを設定
     */
    private setupConfirmDialogEvents(dialog: HTMLElement, context: ConfirmationContext): void {
        const cancelBtn = dialog.querySelector('.confirm-btn.cancel') as HTMLButtonElement;
        const proceedBtn = dialog.querySelector('.confirm-btn.proceed') as HTMLButtonElement;
        
        if (!cancelBtn || !proceedBtn) {
            console.error('[ErrorPreventionHandler] Dialog buttons not found');
            return;
        }
        
        // ボタンテキストを設定
        cancelBtn.textContent = DIALOG_TEXTS.cancelButton;
        proceedBtn.textContent = DIALOG_TEXTS.proceedButton;
        
        // 既存のイベントリスナーを削除して新しいものを設定
        const newCancelBtn = cancelBtn.cloneNode(true) as HTMLButtonElement;
        const newProceedBtn = proceedBtn.cloneNode(true) as HTMLButtonElement;
        
        cancelBtn.parentNode?.replaceChild(newCancelBtn, cancelBtn);
        proceedBtn.parentNode?.replaceChild(newProceedBtn, proceedBtn);
        
        // イベントリスナー設定
        const startTime = Date.now();
        
        newCancelBtn.addEventListener('click', () => {
            this.hideConfirmDialog();
            this.recordConfirmationResult(context, false, Date.now() - startTime);
            context.onCancel();
        });
        
        newProceedBtn.addEventListener('click', () => {
            this.hideConfirmDialog();
            this.recordConfirmationResult(context, true, Date.now() - startTime);
            context.onConfirm();
        });
        
        // キーボードイベント
        const keyHandler = (e: KeyboardEvent): void => {
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    this.hideConfirmDialog();
                    this.recordConfirmationResult(context, false, Date.now() - startTime);
                    context.onCancel();
                    document.removeEventListener('keydown', keyHandler);
                    break;
                    
                case 'Enter':
                    if (document.activeElement === newProceedBtn) {
                        e.preventDefault();
                        newProceedBtn.click();
                    }
                    break;
            }
        };
        
        document.addEventListener('keydown', keyHandler);
        
        // ダイアログ外クリックで閉じる
        const outsideClickHandler = (e: MouseEvent): void => {
            if (!dialog.contains(e.target as Node)) {
                this.hideConfirmDialog();
                this.recordConfirmationResult(context, false, Date.now() - startTime);
                context.onCancel();
                document.removeEventListener('click', outsideClickHandler);
            }
        };
        
        // 少し遅れて設定（現在のクリックイベントを避けるため）
        setTimeout(() => {
            document.addEventListener('click', outsideClickHandler);
        }, 100);
    }

    /**
     * 確認結果を記録
     */
    private recordConfirmationResult(context: ConfirmationContext, confirmed: boolean, responseTime: number): void {
        const result: ConfirmationResult = {
            confirmed,
            timestamp: Date.now(),
            responseTime,
            element: context.element
        };
        
        if (confirmed) {
            this.statistics.actionsConfirmed++;
        } else {
            this.statistics.actionsCancelled++;
        }
        
        // 平均確認時間を更新
        const totalConfirmations = this.statistics.actionsConfirmed + this.statistics.actionsCancelled;
        this.statistics.averageConfirmationTime =
            (this.statistics.averageConfirmationTime * (totalConfirmations - 1) + responseTime) / totalConfirmations;
        
        // コールバック呼び出し
        if (this.onConfirmationResult) {
            this.onConfirmationResult(result);
        }
        
        // カスタムイベント発火
        const event = createConfirmationEvent(context.element, confirmed);
        context.element.dispatchEvent(event);
    }

    /**
     * 確認ダイアログを非表示
     */
    private hideConfirmDialog(): void {
        const dialog = this.ui.confirmDialog;
        if (dialog) {
            dialog.classList.add('hidden');
            dialog.removeAttribute('aria-modal');
            this.statistics.pendingConfirmations = Math.max(0, this.statistics.pendingConfirmations - 1);
        }
    }

    /**
     * 確認されたアクションを実行
     */
    private executeConfirmedAction(element: HTMLElement): void {
        const delay = this.getSafetyDelay(element);
        
        setTimeout(() => {
            // 確認済みクリックイベントを作成
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            
            // 確認済みフラグを設定
            (clickEvent as any)._confirmed = true;
            
            // イベントを発火
            element.dispatchEvent(clickEvent);
            
            // 確認完了を記録
            const elementId = generateElementId(element);
            this.state.pendingConfirmations.delete(elementId);
            
            console.log(`[ErrorPreventionHandler] Confirmed action executed for element: ${elementId}`);
        }, delay);
    }

    /**
     * アクションをキャンセル
     */
    private cancelAction(element: HTMLElement): void {
        const elementId = generateElementId(element);
        this.state.pendingConfirmations.delete(elementId);
        
        this.reportPreventionAction({
            type: 'interface',
            subtype: 'actionCancelled',
            severity: 'low',
            element,
            message: 'ユーザーがアクションをキャンセルしました',
            timestamp: Date.now()
        });
    }

    /**
     * セーフティ遅延時間を取得
     */
    private getSafetyDelay(element: HTMLElement): number {
        if (element.classList.contains('reset-btn')) {
            return this.config.safetyDelays.gameReset;
        }
        
        if (element.classList.contains('delete-btn')) {
            return this.config.safetyDelays.destructiveAction;
        }
        
        if (element.hasAttribute('data-settings')) {
            return this.config.safetyDelays.settingsChange;
        }
        
        return this.config.safetyDelays.criticalAction;
    }

    /**
     * ゲーム状態の警告チェック
     */
    checkGameStateWarnings(gameState: GameState): GameStateWarning[] {
        const warnings: GameStateWarning[] = [];
        const now = Date.now();
        
        // HP警告
        if (gameState.hp <= this.state.warningThresholds.lowHP) {
            warnings.push({
                type: 'gameplay',
                severity: gameState.hp <= this.state.warningThresholds.lowHP / 2 ? 'critical' : 'high',
                message: 'HPが危険レベルです',
                suggestion: 'ピンクバブルでHP回復を推奨',
                timestamp: now,
                acknowledged: false
            });
        }
        
        // スコア警告
        if (gameState.score <= this.state.warningThresholds.lowScore) {
            warnings.push({
                type: 'gameplay',
                severity: 'medium',
                message: 'スコアが低めです',
                suggestion: 'コンボを狙ってスコアアップ',
                timestamp: now,
                acknowledged: false
            });
        }
        
        // 時間警告
        if (gameState.timeRemaining <= this.state.warningThresholds.timeRunningOut) {
            const severity: WarningSeverity = gameState.timeRemaining <= 5000 ? 'critical' : 'high';
            warnings.push({
                type: 'gameplay',
                severity,
                message: '残り時間が少なくなっています',
                suggestion: '集中してプレイしてください',
                timestamp: now,
                acknowledged: false
            });
        }
        
        // エラー率警告
        const errorRate = gameState.totalActions > 0 ? gameState.errors / gameState.totalActions : 0;
        if (errorRate >= this.state.warningThresholds.highErrorRate) {
            warnings.push({
                type: 'gameplay',
                severity: errorRate >= 0.5 ? 'high' : 'medium',
                message: 'エラー率が高くなっています',
                suggestion: 'ゆっくりと正確な操作を心がけてください',
                timestamp: now,
                acknowledged: false
            });
        }
        
        // 統計更新
        this.statistics.warningsGenerated += warnings.length;
        
        // コールバック呼び出し
        warnings.forEach(warning => {
            if (this.onWarningGenerated) {
                this.onWarningGenerated(warning);
            }
        });
        
        return warnings;
    }

    /**
     * 防止アクションを報告
     */
    private reportPreventionAction(actionInfo: PreventionActionInfo): void {
        // イベントを発火
        if (this.onPreventionAction) {
            this.onPreventionAction(actionInfo);
        }
        
        console.log('[ErrorPreventionHandler] Prevention action executed:', actionInfo);
    }

    /**
     * 設定を更新
     */
    updateConfig(newConfig: Partial<PreventionConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        if (newConfig.warningThresholds) {
            this.state.warningThresholds = { ...this.state.warningThresholds, ...newConfig.warningThresholds };
        }
        
        console.log('[ErrorPreventionHandler] Configuration updated');
    }

    /**
     * 重要アクション定義を更新
     */
    updateCriticalActions(newActions: Partial<CriticalActionDefinition>): void {
        this.criticalActions = { ...this.criticalActions, ...newActions };
        console.log('[ErrorPreventionHandler] Critical actions updated');
    }

    /**
     * 統計情報を取得
     */
    getStatistics(): PreventionStatistics {
        return { ...this.statistics };
    }

    /**
     * 状態情報を取得
     */
    getState(): Readonly<PreventionState> {
        return {
            lastClickTimes: new Map(this.state.lastClickTimes),
            clickHistories: new Map(this.state.clickHistories),
            pendingConfirmations: new Map(this.state.pendingConfirmations),
            warningThresholds: { ...this.state.warningThresholds }
        };
    }

    /**
     * 統計情報をリセット
     */
    resetStatistics(): void {
        this.statistics = {
            preventedDoubleClicks: 0,
            preventedRapidClicks: 0,
            pendingConfirmations: 0,
            warningsGenerated: 0,
            actionsConfirmed: 0,
            actionsCancelled: 0,
            averageConfirmationTime: 0
        };
        
        console.log('[ErrorPreventionHandler] Statistics reset');
    }

    /**
     * クリック履歴をクリア
     */
    clearClickHistories(): void {
        this.state.lastClickTimes.clear();
        this.state.clickHistories.clear();
        console.log('[ErrorPreventionHandler] Click histories cleared');
    }

    /**
     * リソースの解放
     */
    destroy(): void {
        // 確認待ちダイアログを全て閉じる
        this.state.pendingConfirmations.clear();
        this.hideConfirmDialog();
        
        // 状態をクリア
        this.clearClickHistories();
        
        console.log('[ErrorPreventionHandler] Component destroyed');
    }
}