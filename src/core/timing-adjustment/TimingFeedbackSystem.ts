/**
 * TimingFeedbackSystem - タイミングフィードバックシステム
 * 
 * ユーザーフィードバック収集、パフォーマンス監視、フィードバック分析、ユーザーガイダンスの専門管理システム
 */

// TimingCalibrator.ts からの共通型をインポート
import type { TimingAdjustmentManager, 
    TimingConfiguration,
    TimingState,
    AdaptiveLearningConfig,
    TimingProfile,
    ProfileType  } from './TimingCalibrator.js';

// 型定義
export interface TimingFeedbackManager extends TimingAdjustmentManager {
    timers: TimerManager;
    emitEvent: (eventName: string, data: any) => void;
    algorithms: TimingAlgorithms;
}

export interface TimerManager {
    active: Map<string, ActiveTimer>;
    paused: Map<string, PausedTimer>;
}

export interface ActiveTimer {
    id: string;
    startTime: number;
    adjustedDuration: number;
    pausedTime: number;
    type: TimerType;
    priority: TimerPriority;
}

export interface PausedTimer {
    id: string;
    pausedAt: number;
    remainingTime: number;
    type: TimerType;
}

export interface TimingAlgorithms {
    scheduleAutoExtension: (timerId: string) => void;
    extendTimer: (timerId: string) => void;
    applyProfile: (profileName: string) => void;
}

export interface WarningState {
    shown: boolean;
    remainingTime: number;
    timestamp: number;
    acknowledged?: boolean;
    extensionRequested?: boolean;
}

export interface FeedbackEntry {
    type: FeedbackType;
    timestamp: number;
    currentProfile: ProfileType;
    data: FeedbackData;
}

export interface FeedbackData {
    [key: string]: any;
    timerId?: string;
    remainingTime?: number;
    actionTaken?: string;
    userRating?: number;
    responseTime?: number;
}

export interface PerformanceMetrics {
    warningCount: number;
    extensionRequests: number;
    pauseFrequency: number;
    averageResponseTime: number;
    feedbackAnalysis: FeedbackAnalysis;
    systemLoad: SystemLoad;
}

export interface FeedbackAnalysis {
    totalFeedback: number;
    recentFeedback: number;
    typeAnalysis: Record<string, number>;
    profileAnalysis: Record<string, number>;
    mostCommonType: string;
    trends: FeedbackTrends;
}

export interface FeedbackTrends {
    increasing: string[];
    decreasing: string[];
    stable: string[];
}

export interface SystemLoad {
    overall: number;
    timers: number;
    warnings: number;
    status: LoadStatus;
}

export interface UserGuidance {
    type: GuidanceType;
    message: string;
    action: GuidanceAction;
    priority?: GuidancePriority;
}

export interface ProfileRecommendationEvent {
    recommended: ProfileType;
    current: ProfileType;
}

export interface TimingSettingsEvent {
    currentProfile: ProfileType;
    availableProfiles: string[];
}

export interface AudioManager {
    playSound: (soundName: string, options?: AudioOptions) => void;
}

export interface AudioOptions {
    volume?: number;
    loop?: boolean;
    fade?: boolean;
}

export interface GameEngine {
    audioManager?: AudioManager;
}

export interface WarningUIElement extends HTMLDivElement {
    timerId?: string;
    autoRemoveTimeout?: number;
}

export interface FeedbackUIElement extends HTMLDivElement {
    feedbackType?: FeedbackType;
    createdAt?: number;
}

// 列挙型
export type TimerType = 'game' | 'level' | 'bonus' | 'warning' | 'tutorial' | 'menu';
export type TimerPriority = 'low' | 'normal' | 'high' | 'critical';
export type FeedbackType = 
    | 'warning_shown' | 'warning_dismissed' | 'time_extended' | 'profile_changed'
    | 'auto_extension' | 'manual_extension' | 'timer_expired' | 'user_rating'
    | 'adaptation_accepted' | 'adaptation_rejected' | 'settings_opened';
export type LoadStatus = 'low' | 'medium' | 'high' | 'critical';
export type GuidanceType = 
    | 'profile_recommendation' | 'usage_pattern' | 'performance_concern'
    | 'system_load' | 'accessibility_tip' | 'efficiency_tip';
export type GuidanceAction = 
    | 'consider_motor_or_cognitive_profile' | 'check_auto_pause_settings'
    | 'optimize_system_performance' | 'cleanup_timers' | 'adjust_preferences'
    | 'enable_shortcuts' | 'update_profile';
export type GuidancePriority = 'low' | 'medium' | 'high' | 'urgent';

// 定数
export const MAX_FEEDBACK_ENTRIES = 100;
export const FEEDBACK_ANALYSIS_DAYS = 7;
export const WARNING_AUTO_REMOVE_TIMEOUT = 5000;
export const EXTENSION_FEEDBACK_DURATION = 2000;
export const SUGGESTION_AUTO_REMOVE_TIMEOUT = 10000;
export const MAX_SYSTEM_TIMERS = 50;
export const MAX_SYSTEM_WARNINGS = 10;
export const HIGH_EXTENSION_THRESHOLD = 5;
export const HIGH_PAUSE_THRESHOLD = 10;
export const HIGH_RESPONSE_TIME_THRESHOLD = 3000;
export const HIGH_SYSTEM_LOAD_THRESHOLD = 0.8;
export const LOAD_LOW_THRESHOLD = 0.3;
export const LOAD_MEDIUM_THRESHOLD = 0.6;
export const LOAD_HIGH_THRESHOLD = 0.8;
export const MILLISECONDS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

// CSS クラス名
export const CSS_CLASSES = {
    TIMING_WARNING: 'timing-warning',
    WARNING_CONTENT: 'warning-content',
    WARNING_ICON: 'warning-icon',
    WARNING_TEXT: 'warning-text',
    WARNING_ACTIONS: 'warning-actions',
    EXTEND_TIME_BTN: 'extend-time-btn',
    DISMISS_WARNING_BTN: 'dismiss-warning-btn',
    EXTENSION_FEEDBACK: 'extension-feedback',
    FEEDBACK_CONTENT: 'feedback-content',
    FEEDBACK_ICON: 'feedback-icon',
    FEEDBACK_TEXT: 'feedback-text',
    ADAPTATION_SUGGESTION: 'adaptation-suggestion',
    SUGGESTION_CONTENT: 'suggestion-content',
    SUGGESTION_ICON: 'suggestion-icon',
    SUGGESTION_TEXT: 'suggestion-text',
    SUGGESTION_ACTIONS: 'suggestion-actions',
    ACCEPT_SUGGESTION_BTN: 'accept-suggestion-btn',
    DISMISS_SUGGESTION_BTN: 'dismiss-suggestion-btn'
} as const;

export const STYLE_IDS = {
    TIMING_WARNING_STYLES: 'timing-warning-styles'
} as const;

// 型ガード
export function isValidTimerId(id: any): id is string {
    return typeof id === 'string' && id.length > 0;
}

export function isActiveTimer(timer: any): timer is ActiveTimer {
    return timer &&
           typeof timer.id === 'string' &&
           typeof timer.startTime === 'number' &&
           typeof timer.adjustedDuration === 'number' &&
           typeof timer.pausedTime === 'number' &&
           timer.startTime > 0 &&
           timer.adjustedDuration > 0;
}

export function isValidFeedbackEntry(entry: any): entry is FeedbackEntry {
    return entry &&
           typeof entry.type === 'string' &&
           typeof entry.timestamp === 'number' &&
           typeof entry.currentProfile === 'string' &&
           typeof entry.data === 'object' &&
           entry.timestamp > 0;
}

export function isWarningState(state: any): state is WarningState {
    return state &&
           typeof state.shown === 'boolean' &&
           typeof state.remainingTime === 'number' &&
           typeof state.timestamp === 'number';
}

export function hasAudioManager(engine: any): engine is GameEngine & { audioManager: AudioManager } {
    return engine &&
           engine.audioManager &&
           typeof engine.audioManager.playSound === 'function';
}

export function isLoadStatus(status: string): status is LoadStatus {
    return ['low', 'medium', 'high', 'critical'].includes(status);
}

export function isFeedbackType(type: "single" | "batch"): type is FeedbackType {
    return ['warning_shown', 'warning_dismissed', 'time_extended', 'profile_changed',
        'auto_extension', 'manual_extension', 'timer_expired', 'user_rating',
        'adaptation_accepted', 'adaptation_rejected', 'settings_opened'
    ].includes(type);
}

export class TimingFeedbackSystem {
    private manager: TimingFeedbackManager;
    private gameEngine: GameEngine;
    private config: TimingConfiguration;
    private state: TimingState;
    private timers: TimerManager;
    private adaptiveLearning: AdaptiveLearningConfig;

    constructor(timingAdjustmentManager: TimingFeedbackManager) {
        this.manager = timingAdjustmentManager;
        this.gameEngine = timingAdjustmentManager.gameEngine;
        this.config = timingAdjustmentManager.config;
        this.state = timingAdjustmentManager.state;
        this.timers = timingAdjustmentManager.timers;
        this.adaptiveLearning = timingAdjustmentManager.adaptiveLearning;

        console.log('[TimingFeedbackSystem] Component initialized');
    }
    
    /**
     * 時間警告を表示
     */
    showTimeWarning(timerId: string): void {
        if(!isValidTimerId(timerId)) {
            console.warn('[TimingFeedbackSystem] Invalid timer ID provided');
            return;
        }

        const timer = this.timers.active.get(timerId);
        if (!timer) {
            console.warn(`[TimingFeedbackSystem] Timer not found: ${timerId}`);
            return;
        }
        
        const profile = this.manager.getCurrentProfile();
        const remainingTime = timer.adjustedDuration - (Date.now() - timer.startTime - timer.pausedTime);
        
        // 警告状態を設定
        this.state.warningStates.set(timerId, {
            shown: true,
            remainingTime: remainingTime,
            timestamp: Date.now()
        });
        
        // 視覚的警告
        this.showVisualWarning(timerId, remainingTime);
        
        // 音響警告（オプション）
        if(hasAudioManager(this.gameEngine)) {
            this.gameEngine.audioManager.playSound('timeWarning', { volume: 0.3 });
        }
        
        // 自動延長の確認
        if ((profile.preferences as any).autoExtend) {
            this.manager.algorithms.scheduleAutoExtension(timerId);
        }
        
        // フィードバックを収集
        this.collectUserFeedback('warning_shown', {
            timerId,
            remainingTime,
            profileUsed: profile.adjustmentLevel
        });
    }
    
    /**
     * 視覚的警告を表示
     */
    private showVisualWarning(timerId: string, remainingTime: number): void {
        const timer = this.timers.active.get(timerId);
        const profile = this.manager.getCurrentProfile();
        
        if(!timer) return;
        
        // 警告UI要素を作成
        const warningElement = document.createElement('div') as WarningUIElement;
        warningElement.className = CSS_CLASSES.TIMING_WARNING;
        warningElement.timerId = timerId;

        const remainingSeconds = Math.ceil(remainingTime / 1000);
        const hasExtensions = (profile as any).timeoutExtensions === true;

        warningElement.innerHTML = `
            <div class="${CSS_CLASSES.WARNING_CONTENT}">
                <div class="${CSS_CLASSES.WARNING_ICON}">⏰</div>
                <div class="${CSS_CLASSES.WARNING_TEXT}">
                    <h3>時間制限の警告</h3>
                    <p>残り時間: ${remainingSeconds}秒</p>
                    ${hasExtensions ? '<p>Tキーで時間を延長できます</p>' : ''}
                </div>
                <div class="${CSS_CLASSES.WARNING_ACTIONS}">
                    ${hasExtensions ? `<button class="${CSS_CLASSES.EXTEND_TIME_BTN}">時間延長</button>` : ''}
                    <button class="${CSS_CLASSES.DISMISS_WARNING_BTN}">閉じる</button>
                </div>
            </div>
        `;
        
        // スタイルを適用
        this.applyWarningStyles(warningElement, profile);
        
        // ボタンイベントを設定
        this.setupWarningButtons(warningElement, timerId);
        
        // 画面に表示
        document.body.appendChild(warningElement);
        
        // 自動削除タイマー
        const gracePeriod = (profile.preferences as any).gracePeriod || WARNING_AUTO_REMOVE_TIMEOUT;
        warningElement.autoRemoveTimeout = window.setTimeout(() => {
            if (warningElement.parentNode) {
                warningElement.parentNode.removeChild(warningElement);
                this.collectUserFeedback('warning_dismissed', {
                    timerId,
                    autoRemoved: true
                });
            }
        }, gracePeriod);
    }
    
    /**
     * 警告スタイルを適用
     */
    private applyWarningStyles(_element: HTMLDivElement, profile: TimingProfile): void {
        const largeTimers = (profile.preferences as any).largeTimers || false;
        const iconSize = largeTimers ? '48px' : '32px';
        const titleSize = largeTimers ? '20px' : '16px';
        const textSize = largeTimers ? '16px' : '14px';

        const styles = `
            .${CSS_CLASSES.TIMING_WARNING} {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                border: 3px solid #ff6b35;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 400px;
                animation: warningPulse 1s ease-in-out infinite alternate;
            }
            
            .${CSS_CLASSES.WARNING_CONTENT} {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            
            .${CSS_CLASSES.WARNING_ICON} {
                font-size: ${iconSize};
                margin-bottom: 10px;
            }
            
            .${CSS_CLASSES.WARNING_TEXT} h3 {
                color: #d63031;
                margin: 0 0 10px 0;
                font-size: ${titleSize};
            }
            
            .${CSS_CLASSES.WARNING_TEXT} p {
                color: #2d3436;
                margin: 5px 0;
                font-size: ${textSize};
            }
            
            .${CSS_CLASSES.WARNING_ACTIONS} {
                margin-top: 15px;
                display: flex;
                gap: 10px;
            }
            
            .${CSS_CLASSES.WARNING_ACTIONS} button {
                padding: 8px 16px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            }
            
            .${CSS_CLASSES.EXTEND_TIME_BTN} {
                background: #00b894;
                color: white;
            }
            
            .${CSS_CLASSES.EXTEND_TIME_BTN}:hover {
                background: #00a085;
            }
            
            .${CSS_CLASSES.DISMISS_WARNING_BTN} {
                background: #636e72;
                color: white;
            }
            
            .${CSS_CLASSES.DISMISS_WARNING_BTN}:hover {
                background: #2d3436;
            }
            
            @keyframes warningPulse {
                from { transform: translate(-50%, -50%) scale(1); }
                to { transform: translate(-50%, -50%) scale(1.02); }
            }
        `;
        
        // スタイルシートを追加
        if(!document.getElementById(STYLE_IDS.TIMING_WARNING_STYLES)) {
            const styleSheet = document.createElement('style');
            styleSheet.id = STYLE_IDS.TIMING_WARNING_STYLES;
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
    }
    
    /**
     * 警告ボタンを設定
     */
    private setupWarningButtons(element: WarningUIElement, timerId: string): void {
        const extendBtn = element.querySelector(`.${CSS_CLASSES.EXTEND_TIME_BTN}`) as HTMLButtonElement | null;
        const dismissBtn = element.querySelector(`.${CSS_CLASSES.DISMISS_WARNING_BTN}`) as HTMLButtonElement | null;

        if(extendBtn) {
            extendBtn.addEventListener('click', () => {
                this.manager.algorithms.extendTimer(timerId);
                this.collectUserFeedback('manual_extension', { timerId });
                element.remove();
                
                // 自動削除タイマーをクリア
                if (element.autoRemoveTimeout) {
                    clearTimeout(element.autoRemoveTimeout);
                }
            });
        }

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                this.collectUserFeedback('warning_dismissed', {
                    timerId,
                    manuallyDismissed: true
                });
                element.remove();
                
                // 自動削除タイマーをクリア
                if (element.autoRemoveTimeout) {
                    clearTimeout(element.autoRemoveTimeout);
                }
            });
        }
    }
    
    /**
     * 延長フィードバックを表示
     */
    showExtensionFeedback(timerId: string, remainingTime: number): void {
        const feedbackElement = document.createElement('div') as FeedbackUIElement;

        feedbackElement.className = CSS_CLASSES.EXTENSION_FEEDBACK;
        feedbackElement.feedbackType = 'time_extended';
        feedbackElement.createdAt = Date.now();

        feedbackElement.innerHTML = `
            <div class="${CSS_CLASSES.FEEDBACK_CONTENT}">
                <div class="${CSS_CLASSES.FEEDBACK_ICON}">✓</div>
                <div class="${CSS_CLASSES.FEEDBACK_TEXT}">時間を延長しました</div>
            </div>
        `;
        
        feedbackElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00b894;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(feedbackElement);

        setTimeout(() => {
            feedbackElement.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => feedbackElement.remove(), 300);
        }, EXTENSION_FEEDBACK_DURATION);
        
        // フィードバックを収集
        this.collectUserFeedback('time_extended', {
            timerId,
            remainingTime,
            extensionMethod: 'user_requested'
        });
    }
    
    /**
     * 適応提案を表示
     */
    suggestAdaptation(type: 'increase' | 'decrease', averageResponseTime: number): void {
        // const __currentProfile = this.manager.getCurrentProfile(); // Removed: unused variable
        let suggestedProfile: ProfileType | null = null;
        
        if (type === 'increase') {
            // より時間を必要とする場合
            if (this.state.currentProfile === 'standard') {
                suggestedProfile = 'motor';
            } else if (this.state.currentProfile === 'motor') {
                suggestedProfile = 'cognitive';
            }
        } else if (type === 'decrease') {
            // 時間を短縮できる場合
            if (this.state.currentProfile === 'cognitive') {
                suggestedProfile = 'motor';
            } else if (this.state.currentProfile === 'motor') {
                suggestedProfile = 'standard';
            }
        }
        
        if (suggestedProfile && suggestedProfile !== this.state.currentProfile) {
            this.showAdaptationSuggestion(suggestedProfile, averageResponseTime);
        }
    }
    
    /**
     * 適応提案UIを表示
     */
    private showAdaptationSuggestion(suggestedProfile: ProfileType, averageResponseTime: number): void {
        const profile = this.config.profiles[suggestedProfile];

        if (!profile) {
            console.warn(`[TimingFeedbackSystem] Profile not found: ${suggestedProfile}`);
            return;
        }

        const suggestionElement = document.createElement('div');
        suggestionElement.className = CSS_CLASSES.ADAPTATION_SUGGESTION;

        const profileName = (profile as any).name || suggestedProfile;

        suggestionElement.innerHTML = `
            <div class="${CSS_CLASSES.SUGGESTION_CONTENT}">
                <div class="${CSS_CLASSES.SUGGESTION_ICON}">🎯</div>
                <div class="${CSS_CLASSES.SUGGESTION_TEXT}">
                    <h3>タイミング調整の提案</h3>
                    <p>あなたの操作パターンに基づいて、「${profileName}」プロファイルをお勧めします。</p>
                    <p><small>平均レスポンス時間: ${Math.round(averageResponseTime)}ms</small></p>
                </div>
                <div class="${CSS_CLASSES.SUGGESTION_ACTIONS}">
                    <button class="${CSS_CLASSES.ACCEPT_SUGGESTION_BTN}">適用する</button>
                    <button class="${CSS_CLASSES.DISMISS_SUGGESTION_BTN}">今回は見送る</button>
                </div>
            </div>
        `;
        
        // スタイルを適用
        suggestionElement.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border: 2px solid #0984e3;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 350px;
            animation: slideInUp 0.3s ease-out;
        `;
        
        // ボタンイベントを設定
        const acceptBtn = suggestionElement.querySelector(`.${CSS_CLASSES.ACCEPT_SUGGESTION_BTN}`) as HTMLButtonElement;
        const dismissBtn = suggestionElement.querySelector(`.${CSS_CLASSES.DISMISS_SUGGESTION_BTN}`) as HTMLButtonElement;

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                this.manager.algorithms.applyProfile(suggestedProfile);
                this.collectUserFeedback('adaptation_accepted', {
                    suggestedProfile,
                    averageResponseTime
                });
                suggestionElement.remove();
            });
        }

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                this.collectUserFeedback('adaptation_rejected', {
                    suggestedProfile,
                    averageResponseTime
                });
                suggestionElement.remove();
            });
        }
        
        document.body.appendChild(suggestionElement);
        
        // 自動削除
        setTimeout(() => {
            if (suggestionElement.parentNode) {
                this.collectUserFeedback('adaptation_rejected', {
                    suggestedProfile,
                    autoRemoved: true
                });
                suggestionElement.remove();
            }
        }, SUGGESTION_AUTO_REMOVE_TIMEOUT);
    }
    
    /**
     * プロファイル変更を提案
     */
    suggestProfileChange(recommendedProfile: ProfileType): void {
        const profile = this.config.profiles[recommendedProfile];
        
        if (!profile) {
            console.warn(`[TimingFeedbackSystem] Profile not found: ${recommendedProfile}`);
            return;
        }

        // 非侵入的な提案を表示
        const profileName = (profile as any).name || recommendedProfile;
        console.log(`[TimingFeedbackSystem] 「${profileName}」プロファイルを推奨します`);
        
        // 設定画面で推奨マークを表示するためのイベント
        const eventData: ProfileRecommendationEvent = {
            recommended: recommendedProfile,
            current: this.state.currentProfile
        };
        this.manager.emitEvent('profileRecommendation', eventData);
    }
    
    /**
     * 時間調整設定を開く
     */
    openTimingSettings(): void {
        // 設定UI表示のイベントを発火
        const eventData: TimingSettingsEvent = {
            currentProfile: this.state.currentProfile,
            availableProfiles: Object.keys(this.config.profiles)
        };

        this.manager.emitEvent('openTimingSettings', eventData);
        
        // フィードバックを収集
        this.collectUserFeedback('settings_opened', {
            currentProfile: this.state.currentProfile,
            triggeredBy: 'feedback_system'
        });
    }
    
    /**
     * フィードバック収集
     */
    collectUserFeedback(feedbackType: FeedbackType, data: FeedbackData): FeedbackEntry {
        if (!isFeedbackType(feedbackType)) {
            console.warn(`[TimingFeedbackSystem] Invalid feedback type: ${feedbackType}`);
            return {
                type: 'warning_dismissed',
                timestamp: Date.now(),
                currentProfile: this.state.currentProfile,
                data: {}
            };
        }

        const feedbackEntry: FeedbackEntry = {
            type: feedbackType,
            timestamp: Date.now(),
            currentProfile: this.state.currentProfile,
            data: data
        };
        
        // フィードバックデータを保存
        try {
            const existingFeedback = JSON.parse(
                localStorage.getItem('timingAdjustmentFeedback') || '[]'
            ) as FeedbackEntry[];
            
            existingFeedback.push(feedbackEntry);
            
            // 最新100件のみ保持
            if (existingFeedback.length > MAX_FEEDBACK_ENTRIES) {
                existingFeedback.splice(0, existingFeedback.length - MAX_FEEDBACK_ENTRIES);
            }

            localStorage.setItem('timingAdjustmentFeedback', JSON.stringify(existingFeedback));
        } catch (error) {
            console.error('[TimingFeedbackSystem] Failed to save feedback:', error);
        }
        
        console.log(`[TimingFeedbackSystem] フィードバック収集 - ${feedbackType}`);
        return feedbackEntry;
    }
    
    /**
     * フィードバック分析
     */
    analyzeFeedback(): FeedbackAnalysis {
        let feedbackData: FeedbackEntry[] = [];

        try {
            feedbackData = JSON.parse(
                localStorage.getItem('timingAdjustmentFeedback') || '[]'
            );
        } catch (error) {
            console.error('[TimingFeedbackSystem] Failed to parse feedback data:', error);
            return {
                totalFeedback: 0,
                recentFeedback: 0,
                typeAnalysis: {},
                profileAnalysis: {},
                mostCommonType: '',
                trends: { increasing: [], decreasing: [], stable: [] }
            };
        }

        if (feedbackData.length === 0) {
            return {
                totalFeedback: 0,
                recentFeedback: 0,
                typeAnalysis: {},
                profileAnalysis: {},
                mostCommonType: '',
                trends: { increasing: [], decreasing: [], stable: [] }
            };
        }
        
        // フィードバックタイプ別の分析
        const typeAnalysis: Record<string, number> = {};
        feedbackData.forEach(feedback => {
            typeAnalysis[feedback.type] = (typeAnalysis[feedback.type] || 0) + 1;
        });
        
        // 最近のフィードバック（過去7日間）
        const sevenDaysAgo = Date.now() - FEEDBACK_ANALYSIS_DAYS * 24 * 60 * 60 * 1000;
        const recentFeedback = feedbackData.filter(f => f.timestamp >= sevenDaysAgo);
        
        // プロファイル別の分析
        const profileAnalysis: Record<string, number> = {};
        feedbackData.forEach(feedback => {
            profileAnalysis[feedback.currentProfile] = (profileAnalysis[feedback.currentProfile] || 0) + 1;
        });

        // 最も多いタイプを特定
        const mostCommonType = Object.keys(typeAnalysis).length > 0
            ? Object.keys(typeAnalysis).reduce((a, b) => typeAnalysis[a] > typeAnalysis[b] ? a : b)
            : '';
        
        return {
            totalFeedback: feedbackData.length,
            recentFeedback: recentFeedback.length,
            typeAnalysis,
            profileAnalysis,
            mostCommonType,
            trends: this.identifyFeedbackTrends(feedbackData)
        };
    }
    
    /**
     * フィードバックトレンドを特定
     */
    private identifyFeedbackTrends(feedbackData: FeedbackEntry[]): FeedbackTrends {
        const trends: FeedbackTrends = {
            increasing: [],
            decreasing: [],
            stable: []
        };
        
        // 週単位でのトレンド分析
        const weeklyData: Record<number, number> = {};
        feedbackData.forEach(feedback => {
            const week = Math.floor(feedback.timestamp / MILLISECONDS_PER_WEEK);
            weeklyData[week] = (weeklyData[week] || 0) + 1;
        });
        
        const weeks = Object.keys(weeklyData).map(Number).sort((a, b) => a - b);
        if (weeks.length >= 3) {
            const recent = weeklyData[weeks[weeks.length - 1]];
            const previous = weeklyData[weeks[weeks.length - 2]];
            const beforePrevious = weeklyData[weeks[weeks.length - 3]];

            if (recent > previous && previous > beforePrevious) {
                trends.increasing.push('overall_feedback');
            } else if (recent < previous && previous < beforePrevious) {
                trends.decreasing.push('overall_feedback');
            } else {
                trends.stable.push('overall_feedback');
            }
        }
        
        return trends;
    }
    
    /**
     * パフォーマンス監視メトリクスを取得
     */
    getPerformanceMetrics(): PerformanceMetrics {
        return {
            warningCount: this.state.warningStates.size,
            extensionRequests: this.adaptiveLearning.data.extensionRequests,
            pauseFrequency: this.adaptiveLearning.data.pauseFrequency,
            averageResponseTime: this.state.userInteractionData.averageResponseTime,
            feedbackAnalysis: this.analyzeFeedback(),
            systemLoad: this.calculateSystemLoad()
        };
    }
    
    /**
     * システム負荷を計算
     */
    private calculateSystemLoad(): SystemLoad {
        const activeTimers = this.timers.active.size;
        const pausedTimers = this.timers.paused.size;
        const totalTimers = activeTimers + pausedTimers;
        
        // 簡単な負荷指標（0-1）
        const timerLoad = Math.min(totalTimers / MAX_SYSTEM_TIMERS, 1.0);
        const warningLoad = Math.min(this.state.warningStates.size / MAX_SYSTEM_WARNINGS, 1.0);
        const overallLoad = (timerLoad + warningLoad) / 2;
        
        return {
            overall: overallLoad,
            timers: timerLoad,
            warnings: warningLoad,
            status: this.getLoadStatus(overallLoad)
        };
    }
    
    /**
     * 負荷状態を取得
     */
    private getLoadStatus(load: number): LoadStatus {
        if(load <= LOAD_LOW_THRESHOLD) return 'low';
        if(load <= LOAD_MEDIUM_THRESHOLD) return 'medium';
        if(load <= LOAD_HIGH_THRESHOLD) return 'high';
        return 'critical';
    }
    
    /**
     * ユーザーガイダンスを生成
     */
    generateUserGuidance(): UserGuidance[] {
        const metrics = this.getPerformanceMetrics();
        const guidance: UserGuidance[] = [];
        
        // 高い延長要求率への対応
        if (metrics.extensionRequests > HIGH_EXTENSION_THRESHOLD) {
            guidance.push({
                type: 'profile_recommendation',
                message: 'より長いタイミング設定のプロファイルをお勧めします',
                action: 'consider_motor_or_cognitive_profile',
                priority: 'medium'
            });
        }
        
        // 高い一時停止頻度への対応
        if (metrics.pauseFrequency > HIGH_PAUSE_THRESHOLD) {
            guidance.push({
                type: 'usage_pattern',
                message: '頻繁な一時停止が検出されました。自動一時停止設定を確認してください',
                action: 'check_auto_pause_settings',
                priority: 'medium'
            });
        }
        
        // レスポンス時間の問題
        if (metrics.averageResponseTime > HIGH_RESPONSE_TIME_THRESHOLD) {
            guidance.push({
                type: 'performance_concern',
                message: 'レスポンス時間が長くなっています。システム負荷を確認してください',
                action: 'optimize_system_performance',
                priority: 'high'
            });
        }
        
        // システム負荷の警告
        if (metrics.systemLoad.overall > HIGH_SYSTEM_LOAD_THRESHOLD) {
            guidance.push({
                type: 'system_load',
                message: 'システム負荷が高くなっています。不要なタイマーを削除することをお勧めします',
                action: 'cleanup_timers',
                priority: 'high'
            });
        }
        
        return guidance;
    }

    /**
     * 警告の状態を取得
     */
    getWarningState(timerId: string): WarningState | undefined {
        return this.state.warningStates.get(timerId);
    }

    /**
     * 警告を手動で削除
     */
    dismissWarning(timerId: string): void {
        const warningState = this.state.warningStates.get(timerId);
        if (warningState) {
            this.state.warningStates.delete(timerId);
            this.collectUserFeedback('warning_dismissed', {
                timerId,
                manuallyDismissed: true
            });
        }
    }

    /**
     * 全ての警告をクリア
     */
    clearAllWarnings(): void {
        const warningElements = document.querySelectorAll(`.${CSS_CLASSES.TIMING_WARNING}`);
        warningElements.forEach(element => {
            const warningEl = element as WarningUIElement;
            if (warningEl.autoRemoveTimeout) {
                clearTimeout(warningEl.autoRemoveTimeout);
            }
            element.remove();
        });

        this.state.warningStates.clear();
        this.collectUserFeedback('warning_dismissed', {
            allWarnings: true,
            count: warningElements.length
        });
    }

    /**
     * フィードバックデータをエクスポート
     */
    exportFeedbackData(): string {
        try {
            const feedbackData = localStorage.getItem('timingAdjustmentFeedback') || '[]';
            const parsedData = JSON.parse(feedbackData);
            return JSON.stringify(parsedData, null, 2);
        } catch (error) {
            console.error('[TimingFeedbackSystem] Failed to export feedback data:', error);
            return '[]';
        }
    }

    /**
     * フィードバックデータをリセット
     */
    resetFeedbackData(): void {
        try {
            localStorage.removeItem('timingAdjustmentFeedback');
            console.log('[TimingFeedbackSystem] Feedback data reset');
        } catch (error) {
            console.error('[TimingFeedbackSystem] Failed to reset feedback data:', error);
        }
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy(): void {
        // UI要素のクリーンアップ
        const warningElements = document.querySelectorAll(
            `.${CSS_CLASSES.TIMING_WARNING}, .${CSS_CLASSES.EXTENSION_FEEDBACK}, .${CSS_CLASSES.ADAPTATION_SUGGESTION}`
        );
        warningElements.forEach(element => {
            const warningEl = element as WarningUIElement;
            if (warningEl.autoRemoveTimeout) {
                clearTimeout(warningEl.autoRemoveTimeout);
            }
            element.remove();
        });
        
        // スタイルシートの削除
        const styleSheet = document.getElementById(STYLE_IDS.TIMING_WARNING_STYLES);
        if (styleSheet) {
            styleSheet.remove();
        }
        
        // 警告状態をクリア
        this.state.warningStates.clear();
        
        console.log('[TimingFeedbackSystem] Component destroyed');
    }
}