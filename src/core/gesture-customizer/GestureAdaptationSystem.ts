/**
 * GestureAdaptationSystem - 適応学習システム
 * 
 * ユーザープロファイル、適応学習、片手操作、フィードバックを専門的に管理します
 */

// 型定義
export interface GestureAdaptationConfig { oneHandedMode: boolean,
    touchSensitivity: number;
    alternativeGestures: AlternativeGesturesConfig
    ,}

export interface AlternativeGesturesConfig { singleFingerOnly: boolean;
    dwellActivation: boolean;
    simplifiedMode: boolean;
    edgeGestures: boolean }

export interface GameEngine { audioManager?: AudioManager;
    }

export interface AudioManager {
    playSound: (soundId: string, options?: { volume?: number }) => void,
}

export interface AdaptationSystem { learningEnabled: boolean,
    userProfile: UserProfile;
    adaptiveThresholds: AdaptiveThresholds;
    suggestions: ImprovementSuggestion[]
    ,}

export interface UserProfile { dominantHand: DominantHand;
    reachability: ReachabilityLevel;
    precision: PrecisionLevel;
    speed: SpeedLevel;
    endurance: EnduranceLevel
    }

export interface AdaptiveThresholds { errorRate: number;
    successRate: number;
    responseTime: number;
    gestureCompletion: number }

export interface ImprovementSuggestion { type: SuggestionType;
    message: string;
    action: SuggestionAction;
    priority?: SuggestionPriority;
    automated?: boolean; }

export interface UserPreferences { oneHandedMode: boolean,
    preferredHand: PreferredHand;
    gestureComplexity: GestureComplexity;
    touchSensitivity: number;
    gestureTimeout: number;
    visualFeedback: boolean;
    audioFeedback: boolean;
    hapticFeedback: boolean;
    customGestures: Map<string, CustomGesture>,
    disabledGestures: Set<string>;
    alternativeBindings: Map<string, string>, }

export interface CustomGesture { name: string,
    pattern: GesturePattern;
    action: string;
    createdAt: number;
    usageCount: number ,}

export interface GesturePattern { type: string;
    points: TouchPoint[];
    duration: number;
    distance: number;
    velocity: number;
    direction?: number }

export interface TouchPoint { x: number;
    y: number;
    timestamp: number;
    pressure?: number }

export interface GestureStats { gesturesRecognized: number;
    gesturesByType: Map<string, number>,
    successfulGestures: number;
    failedGestures: number;
    averageGestureTime: number;
    customizationChanges: number;
    adaptationTriggers: number;
    sessionStart: number ,}

export interface GestureData { type?: string;
    duration?: number;
    distance?: number;
    velocity?: number;
    direction?: number;
    startPosition?: Position;
    endPosition?: Position;
    touchPoints?: TouchPoint[];
    fingers?: number;
    timestamp?: number; }

export interface Position { x: number,
    y: number ,}

export interface AdaptationStatus { learningEnabled: boolean;
    userProfile: UserProfile;
    adaptiveThresholds: AdaptiveThresholds;
    suggestions: ImprovementSuggestion[];
    oneHandedMode: boolean;
    gestureComplexity: GestureComplexity
    }

export interface UnrecognizedGestureRecord { timestamp: number;
    gestureData: GestureData;
    userProfile: UserProfile;
    context?: GestureContext
    }

export interface GestureContext { gameState?: string;
    uiElement?: string;
    attemptCount?: number;
    previousGesture?: string; }

export interface FeedbackElement { element: HTMLElement,
    type: FeedbackType;
    timestamp: number ,}

export interface FeedbackOptions { duration?: number;
    position?: Position;
    style?: FeedbackStyle;
    intensity?: FeedbackIntensity;
    }

export interface FeedbackStyle { color?: string;
    backgroundColor?: string;
    fontSize?: string;
    borderRadius?: string;
    animation?: string; }

export interface LearningData { gesture: string,
    success: boolean;
    confidence: number;
    adjustments: ThresholdAdjustment[];
    timestamp: number ,}

export interface ThresholdAdjustment { parameter: string;
    oldValue: number;
    newValue: number;
    improvement: number }

export interface PreferencesSerialized { oneHandedMode: boolean;
    preferredHand: PreferredHand;
    gestureComplexity: GestureComplexity;
    touchSensitivity: number;
    gestureTimeout: number;
    visualFeedback: boolean;
    audioFeedback: boolean;
    hapticFeedback: boolean;
    customGestures: [string, CustomGesture][],
    disabledGestures: string[];
    alternativeBindings: [string, string][], }

// 列挙型
export type DominantHand = 'left' | 'right' | 'both';''
export type PreferredHand = 'left' | 'right';''
export type ReachabilityLevel = 'limited' | 'normal' | 'extended';''
export type PrecisionLevel = 'low' | 'normal' | 'high';''
export type SpeedLevel = 'slow' | 'normal' | 'fast';''
export type EnduranceLevel = 'low' | 'normal' | 'high';''
export type GestureComplexity = 'simple' | 'normal' | 'advanced';''
export type SuggestionType = 'precision' | 'speed' | 'accessibility' | 'efficiency' | 'comfort';

export type SuggestionAction = '';
    | 'adjustSensitivity' | 'enableSimpleMode' | 'enableOneHanded' '';
    | 'customizeGesture' | 'changeComplexity' | 'addAlternative';''
export type SuggestionPriority = 'low' | 'medium' | 'high' | 'critical';''
export type FeedbackType = 'visual' | 'audio' | 'haptic' | 'combined';''
export type FeedbackIntensity = 'subtle' | 'normal' | 'strong';

// 定数
export const DEFAULT_TOUCH_SENSITIVITY = 1.0;
export const DEFAULT_GESTURE_TIMEOUT = 1000;
export const MAX_UNRECOGNIZED_GESTURES = 100;
export const LEARNING_RATE = 0.01;
export const ADAPTATION_THRESHOLD = 0.1;
// 型ガード
export function isValidUserProfile(profile: any): profile is UserProfile { return profile &&''
           typeof profile.dominantHand === 'string' &&'';
           typeof profile.reachability === 'string' &&'';
           typeof profile.precision === 'string' &&'';
           typeof profile.speed === 'string' &&'';
           typeof profile.endurance === 'string'; }

export function isValidGestureData(data: any): data is GestureData { return data && (''
        typeof, data.duration === 'number' ||'';
        typeof, data.distance === 'number' ||'';
        typeof, data.velocity === 'number';
    ); }

export class GestureAdaptationSystem {
    private config: GestureAdaptationConfig;
    private gameEngine: GameEngine | null;
    private adaptationSystem: AdaptationSystem;
    private userPreferences: UserPreferences;
    private stats: GestureStats;
    private feedbackElements: Set<HTMLElement>';

    constructor(config: GestureAdaptationConfig, gameEngine?: GameEngine) {
        this.config = config;
        this.gameEngine = gameEngine || null;
        
        // 入力適応システム
        this.adaptationSystem = {
            learningEnabled: true;
            userProfile: {''
                dominantHand: 'right',
                reachability: 'normal',
                precision: 'normal',
                speed: 'normal';
    ,}

                endurance: 'normal' }
            };
            adaptiveThresholds: { errorRate: 0.1;
                successRate: 0.9;
                responseTime: 1000;
                gestureCompletion: 0.8 };
            suggestions: [];
        },
        
        // ユーザー設定
        this.userPreferences = { oneHandedMode: false,''
            preferredHand: 'right',
            gestureComplexity: 'normal';
            touchSensitivity: DEFAULT_TOUCH_SENSITIVITY;
            gestureTimeout: DEFAULT_GESTURE_TIMEOUT;
            visualFeedback: true;
            audioFeedback: true;
            hapticFeedback: true;
            customGestures: new Map<string, CustomGesture>(),
            disabledGestures: new Set<string>();
            alternativeBindings: new Map<string, string>( };
        
        // 統計情報
        this.stats = { gesturesRecognized: 0,
            gesturesByType: new Map<string, number>(),
            successfulGestures: 0;
            failedGestures: 0;
            averageGestureTime: 0;
            customizationChanges: 0;
            adaptationTriggers: 0;
            sessionStart: Date.now( ,};
        
        // フィードバック関連
        this.feedbackElements = new Set<HTMLElement>();
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    private initialize(): void { // ユーザー設定の読み込み
        this.loadUserPreferences();
        // ユーザープロファイルの初期化
        this.initializeUserProfile()';
        console.log('GestureAdaptationSystem, initialized'); }'
    
    /**
     * ユーザー設定の読み込み'
     */''
    private loadUserPreferences()';
            const saved = localStorage.getItem('gestureCustomizer_preferences);
            if(saved) {
                const preferences: PreferencesSerialized = JSON.parse(saved),
                
                // 基本設定のコピー
                this.userPreferences.oneHandedMode = preferences.oneHandedMode;
                this.userPreferences.preferredHand = preferences.preferredHand;
                this.userPreferences.gestureComplexity = preferences.gestureComplexity;
                this.userPreferences.touchSensitivity = preferences.touchSensitivity;
                this.userPreferences.gestureTimeout = preferences.gestureTimeout;
                this.userPreferences.visualFeedback = preferences.visualFeedback;
                this.userPreferences.audioFeedback = preferences.audioFeedback;
                this.userPreferences.hapticFeedback = preferences.hapticFeedback;
                
                // Map/Set の復元
                if (preferences.customGestures) {
            }
                    this.userPreferences.customGestures = new Map(preferences.customGestures); }
                }
                if (preferences.disabledGestures) { this.userPreferences.disabledGestures = new Set(preferences.disabledGestures); }
                if (preferences.alternativeBindings) { this.userPreferences.alternativeBindings = new Map(preferences.alternativeBindings); }
                
                // 設定を適用
                this.applyUserPreferences();''
            } catch (error) { console.warn('Failed to load gesture customizer preferences:', error }
    }
    
    /**
     * ユーザー設定の保存
     */
    private saveUserPreferences(): void { try {
            const preferences: PreferencesSerialized = {
                oneHandedMode: this.userPreferences.oneHandedMode;
                preferredHand: this.userPreferences.preferredHand;
                gestureComplexity: this.userPreferences.gestureComplexity;
                touchSensitivity: this.userPreferences.touchSensitivity;
                gestureTimeout: this.userPreferences.gestureTimeout;
                visualFeedback: this.userPreferences.visualFeedback;
                audioFeedback: this.userPreferences.audioFeedback;
                hapticFeedback: this.userPreferences.hapticFeedback;
                customGestures: Array.from(this.userPreferences.customGestures.entries(),
                disabledGestures: Array.from(this.userPreferences.disabledGestures),
                alternativeBindings: Array.from(this.userPreferences.alternativeBindings.entries() ,};

            localStorage.setItem('gestureCustomizer_preferences);

                JSON.stringify(preferences);''
        } catch (error) { console.warn('Failed to save gesture customizer preferences:', error }
    }
    
    /**
     * ユーザー設定の適用
     */
    private applyUserPreferences(): void { // 基本設定
        this.config.oneHandedMode = this.userPreferences.oneHandedMode;
        this.config.touchSensitivity = this.userPreferences.touchSensitivity;
        
        // 片手モードの適応
        if(this.userPreferences.oneHandedMode) {
            
        }
            this.enableOneHandedMode(this.userPreferences.preferredHand); }
        }
        
        // ジェスチャー複雑度の適応
        this.adaptGestureComplexity(this.userPreferences.gestureComplexity);
    }
    
    /**
     * ユーザープロファイルの初期化
     */
    private initializeUserProfile(): void { // 既存の統計から推測
        this.analyzeUserBehavior();
        // 適応的閾値の設定
        this.setAdaptiveThresholds()';
        console.log('User profile initialized:', this.adaptationSystem.userProfile }
    
    /**
     * ユーザー行動の分析'
     */''
    private analyzeUserBehavior()';
        console.log('Analyzing, user behavior, patterns...');
    
    /**
     * 適応的閾値の設定'
     */''
    private setAdaptiveThresholds()';
        if(profile.precision === 'low'') {
            this.adaptationSystem.adaptiveThresholds.errorRate = 0.2;
        }

            this.adaptationSystem.adaptiveThresholds.gestureCompletion = 0.6;' }'

        } else if (profile.precision === 'high'') { this.adaptationSystem.adaptiveThresholds.errorRate = 0.05;
            this.adaptationSystem.adaptiveThresholds.gestureCompletion = 0.95; }
        ';
        // 速度に基づく閾値調整
        if (profile.speed === 'slow'') { this.adaptationSystem.adaptiveThresholds.responseTime = 2000;' }

        } else if(profile.speed === 'fast) { this.adaptationSystem.adaptiveThresholds.responseTime = 500; }'
    }
    
    /**
     * 適応学習の更新
     */
    updateAdaptiveLearning(gestureName: string, gestureData: GestureData, success: boolean): void { if (!this.adaptationSystem.learningEnabled) return;
        
        // 成功/失敗パターンの学習
        this.learnGesturePattern(gestureName, gestureData, success);
        
        // ユーザープロファイルの更新
        this.updateUserProfile(gestureData, success);
        
        // 適応的閾値の調整
        this.adjustAdaptiveThresholds(success);
        
        // 改善提案の生成
        this.generateImprovementSuggestions();
        
        // 統計更新
        this.updateGestureStats(gestureName, success); }
    
    /**
     * ジェスチャーパターンの学習
     */
    private learnGesturePattern(gestureName: string, gestureData: GestureData, success: boolean): void { // 成功したパターンを記録
        if(success) {
            
        }
            // 閾値の微調整は上位で実行 }
            console.log(`Learning, successful pattern, for: ${gestureName}`});
        }
        
        // 学習データの記録
        const learningData: LearningData = { gesture: gestureName,
            success,
            confidence: success ? 0.9 : 0.3, // 簡略化された信頼度;
            adjustments: [];
            timestamp: Date.now( ,};
        
        this.storeLearningData(learningData);
    }
    
    /**
     * 学習データの保存
     */''
    private storeLearningData(data: LearningData): void { try {'
            const stored = JSON.parse(localStorage.getItem('gesture_learning_data'') || '[]');
            stored.push(data);
            
            // 最大1000件まで保持
            if(stored.length > 1000) {
                ';

            }

                stored.splice(0, stored.length - 1000); }
            }

            localStorage.setItem('gesture_learning_data', JSON.stringify(stored);''
        } catch (error) { console.warn('Failed to store learning data:', error }
    }
    
    /**
     * ユーザープロファイルの更新
     */
    private updateUserProfile(gestureData: GestureData, success: boolean): void { const profile = this.adaptationSystem.userProfile;
        
        // 精度の更新
        if(gestureData.distance !== undefined) {

            if(gestureData.distance < 10) {'
        }

                profile.precision = 'high';' }

            } else if(gestureData.distance > 50) { ''
                profile.precision = 'low'; }
        }
        
        // 速度の更新
        if(gestureData.duration !== undefined) {

            if(gestureData.duration < 200) {'
        }

                profile.speed = 'fast';' }

            } else if(gestureData.duration > 1000) { ''
                profile.speed = 'slow'; }
        }
        
        // 利き手の推測（タッチ位置から）
        if(gestureData.startPosition) {
            const screenWidth = window.innerWidth;''
            if(gestureData.startPosition.x > screenWidth * 0.6) {'
        }

                profile.dominantHand = 'right';' }

            } else if(gestureData.startPosition.x < screenWidth * 0.4) { ''
                profile.dominantHand = 'left'; }
}
    
    /**
     * 適応的閾値の調整
     */
    private adjustAdaptiveThresholds(success: boolean): void { const thresholds = this.adaptationSystem.adaptiveThresholds;
        
        if(success) {
        
            // 成功率が高い場合、より厳しい基準に
        
        }
            thresholds.successRate = Math.min(0.95, thresholds.successRate + LEARNING_RATE); }
        } else {  // 失敗が続く場合、基準を緩和 }
            thresholds.errorRate = Math.min(0.3, thresholds.errorRate + LEARNING_RATE); }
        }
        
        this.stats.adaptationTriggers++;
    }
    
    /**
     * 改善提案の生成
     */''
    private generateImprovementSuggestions()';
        if(profile.precision === 'low'') { '
            suggestions.push({''
                type: 'precision',
                message: 'ジェスチャーをよりゆっくりと正確に行うことをお勧めします',)';
                action: 'adjustSensitivity',' }

                priority: 'medium')'); }
        }
        ';
        // 速度が遅い場合の提案
        if(profile.speed === 'slow'') { '
            suggestions.push({''
                type: 'speed',
                message: '簡単なジェスチャーモードに切り替えることをお勧めします',)';
                action: 'enableSimpleMode',' }

                priority: 'high')'); }
        }
        ';
        // 片手操作の提案
        if(profile.reachability === 'limited'') { '
            suggestions.push({''
                type: 'accessibility',
                message: '片手操作モードを有効にすることをお勧めします',)';
                action: 'enableOneHanded',' }

                priority: 'high'); }
        }
        
        // 成功率が低い場合の提案
        const successRate = this.getSuccessRate();''
        if(successRate < 0.7) { '
            suggestions.push({''
                type: 'efficiency',
                message: 'ジェスチャーの複雑度を下げることをお勧めします',)';
                action: 'changeComplexity',' }

                priority: 'medium'); }
        }
        
        this.adaptationSystem.suggestions = suggestions;
    }
    
    /**
     * 成功率の計算
     */
    private getSuccessRate(): number { const total = this.stats.successfulGestures + this.stats.failedGestures;
        return total > 0 ? this.stats.successfulGestures / total: 0 
    /**
     * ジェスチャー複雑度の適応
     */'
    private adaptGestureComplexity(complexity: GestureComplexity): void { ''
        switch(complexity) {'

            case 'simple':'';
                this.enableSimpleGestures(''';
            case 'advanced':'';
                this.enableAdvancedGestures()';
            case 'normal':);
            default: this.enableNormalGestures();
        }
                break; }
}
    
    /**
     * 簡単なジェスチャーの有効化'
     */''
    private enableSimpleGestures()';
        console.log('Simple, gesture mode, enabled');
    }
    
    /**
     * 通常ジェスチャーの有効化'
     */''
    private enableNormalGestures()';
        console.log('Normal, gesture mode, enabled);
    }
    
    /**
     * 高度なジェスチャーの有効化
     */
    private enableAdvancedGestures(): void { // すべてのジェスチャーを有効化
        this.config.alternativeGestures.singleFingerOnly = false;
        this.config.alternativeGestures.simplifiedMode = false;
        // カスタムジェスチャーの推奨
        this.suggestAdvancedGestures(')';
        console.log('Advanced, gesture mode, enabled'); }'
    
    /**
     * 高度なジェスチャーの提案'
     */''
    private suggestAdvancedGestures()';
        console.log('Suggesting, advanced gesture, options...'');
        
        // 高度なジェスチャーの提案例
        const suggestions: ImprovementSuggestion[] = [{ ''
                type: 'efficiency',
                message: 'カスタムジェスチャーを作成して効率を向上させましょう',
                action: 'customizeGesture',
                priority: 'low' ,};
            { ''
                type: 'comfort',
                message: '代替バインディングでより快適な操作が可能です',
                action: 'addAlternative',
                priority: 'low' ,}]
            }]
        ],

        this.adaptationSystem.suggestions.push(...suggestions);
    
    /**
     * 片手操作モードの有効化'
     */''
    enableOneHandedMode(preferredHand: PreferredHand = 'right): void { this.config.oneHandedMode = true;
        this.userPreferences.oneHandedMode = true;
        this.userPreferences.preferredHand = preferredHand;
        
        // UIの調整
        this.adjustUIForOneHanded(preferredHand);
         }
        console.log(`One-handed, mode enabled, for ${preferredHand} hand`});
    }
    
    /**
     * 片手操作モードの無効化
     */
    disableOneHandedMode(): void { this.config.oneHandedMode = false;
        this.userPreferences.oneHandedMode = false;
        // UIを元に戻す
        this.resetUILayout()';
        console.log('One-handed, mode disabled'); }'
    
    /**
     * UIの片手操作調整'
     */''
    private adjustUIForOneHanded(preferredHand: PreferredHand): void { // UI要素を操作しやすい位置に移動
        const uiElements = document.querySelectorAll('[data-ui-adjustable]);
        ';

        uiElements.forEach(element => { ')'
            const htmlElement = element as HTMLElement');''
            if (preferredHand === 'right'') {' }

                htmlElement.style.transform = 'translateX(-20%)'; }

            } else { }'

                htmlElement.style.transform = 'translateX(20%)'; }

            }''
            htmlElement.classList.add('one-handed-adjusted);
        });
    }
    
    /**
     * UIレイアウトのリセット'
     */''
    private resetUILayout()';
        const uiElements = document.querySelectorAll('[data-ui-adjustable]'');
        ';

        uiElements.forEach(element => {  const, htmlElement = element, as HTMLElement;)'
            htmlElement.style.transform = ''');' }

            htmlElement.classList.remove('one-handed-adjusted); }'
        });
    }
    
    /**
     * ジェスチャーフィードバックの提供
     */
    provideGestureFeedback(gestureName: string, gestureData: GestureData): void { // 視覚フィードバック
        if(this.userPreferences.visualFeedback) {
            
        }
            this.showVisualFeedback(gestureName, gestureData); }
        }
        
        // 音声フィードバック
        if (this.userPreferences.audioFeedback) { this.playGestureFeedbackSound(gestureName); }
        
        // 触覚フィードバック
        if (this.userPreferences.hapticFeedback) { this.triggerHapticFeedback(gestureName); }
    }
    
    /**
     * 視覚フィードバックの表示
     */
    private showVisualFeedback(gestureName: string, gestureData: GestureData, options?: FeedbackOptions): void { ''
        if(!gestureData.endPosition) return;
        ';
        // 一時的な視覚効果
        const feedback = document.createElement('div'');''
        feedback.className = 'gesture-feedback';
        feedback.textContent = gestureName;
        ';

        const defaultStyle: FeedbackStyle = {''
            backgroundColor: 'rgba(0, 255, 0, 0.8)',
            color: 'white',
            borderRadius: '15px',
            fontSize: '12px' ,};
        const style = Object.assign(defaultStyle, options? .style || { );
        
        feedback.style.cssText = ` : undefined
            position: fixed 
            left: ${gestureData.endPosition.x,}px;
            top: ${gestureData.endPosition.y}px;
            background: ${style.backgroundColor};
            color: ${style.color};
            padding: 5px 10px;
            border-radius: ${style.borderRadius}
            font-size: ${style.fontSize}
            z-index: 10000,
            pointer-events: none,
            animation: fadeOut 1s ease-out forwards;
        `;
        
        document.body.appendChild(feedback);
        this.feedbackElements.add(feedback);
        
        const duration = options? .duration || 1000;
        setTimeout(() => {  if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback); }
                this.feedbackElements.delete(feedback); }
}, duration);
    }
    
    /**
     * 予測フィードバックの提供
     */ : undefined'
    providePredictiveFeedback(prediction: { gesture: string; confidence: number ): void {''
        if(!this.userPreferences.visualFeedback) return;

        const feedback = document.createElement('div'');''
        feedback.className = 'gesture-prediction'; }
        feedback.textContent = `${prediction.gesture}? `;
        feedback.style.cssText = ` : undefined
            position: fixed;
            left: 50%;
            top: 20px;
            transform: translateX(-50%);
            background: rgba(255, 165, 0, 0.8),
            color: white;
            padding: 5px 10px;
            border-radius: 15px,
            font-size: 12px,
            z-index: 10000,
            pointer-events: none,
            opacity: ${prediction.confidence}
        `;
        document.body.appendChild(feedback);
        this.feedbackElements.add(feedback);
        
        setTimeout(() => {  if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback); }
                this.feedbackElements.delete(feedback); }
}, 500);
    }
    
    /**
     * 未認識ジェスチャーのフィードバック
     */'
    provideUnrecognizedGestureFeedback(): void { ''
        if(!this.userPreferences.visualFeedback) return;

        const feedback = document.createElement('div'');''
        feedback.className = 'gesture-unrecognized';''
        feedback.textContent = 'ジェスチャーを認識できませんでした';
        feedback.style.cssText = `;
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%),
            background: rgba(255, 0, 0, 0.8),
            color: white;
            padding: 10px 15px;
            border-radius: 15px,
            font-size: 14px,
            z-index: 10000,
            pointer-events: none,
        `;
        
        document.body.appendChild(feedback);
        this.feedbackElements.add(feedback);
        
        setTimeout(() => { 
            if(feedback.parentNode) {
                
            }
                feedback.parentNode.removeChild(feedback); }
                this.feedbackElements.delete(feedback); }
}, 2000);
    }
    
    /**
     * ジェスチャー音声フィードバック
     */'
    private playGestureFeedbackSound(gestureName: string): void { ''
        if(this.gameEngine? .audioManager) {
            : undefined';
            const soundMap: Record<string, string> = {''
                'tap': 'gesture_tap',
                'swipe': 'gesture_swipe',
                'pinch': 'gesture_pinch',
        }

                'longPress': 'gesture_long' }
            };

            const soundId = soundMap[gestureName] || 'gesture_generic';
            this.gameEngine.audioManager.playSound(soundId, { volume: 0.3 }
    }
    
    /**
     * 触覚フィードバック
     */'
    private triggerHapticFeedback(gestureName: string): void { ''
        if(navigator.vibrate) {'
            const vibrationPatterns: Record<string, number[]> = {''
                'tap': [50],
                'longPress': [100, 50, 100],
                'swipe': [30, 10, 30],
        }

                'pinch': [80] }
            };
            
            const pattern = vibrationPatterns[gestureName] || [50];
            navigator.vibrate(pattern);
        }
    }
    
    /**
     * 未認識ジェスチャーの記録
     */
    recordUnrecognizedGesture(gestureData: GestureData, context?: GestureContext): void { // 学習データとして保存
        const unrecognizedData: UnrecognizedGestureRecord = {''
            timestamp: Date.now()';
            const saved = JSON.parse(localStorage.getItem('unrecognized_gestures'') || '[]'),
            saved.push(unrecognizedData);
            
            // 最大件数まで保持
            if(saved.length > MAX_UNRECOGNIZED_GESTURES) {
                ';

            }

                saved.splice(0, saved.length - MAX_UNRECOGNIZED_GESTURES); }
            }

            localStorage.setItem('unrecognized_gestures', JSON.stringify(saved);''
        } catch (error) { console.warn('Failed to record unrecognized gesture:', error }
    }
    
    /**
     * ジェスチャー代替案の提案'
     */''
    suggestGestureAlternatives(gestureData: GestureData): string[] { const suggestions: string[] = [],

        console.log('Suggesting gesture alternatives based on:', gestureData);
        ';
        // 類似パターンの提案
        if(gestureData.type === 'touch' && gestureData.duration && gestureData.duration > 500) {'

            suggestions.push('longPress'');

        }

            console.log('Consider, using a, long press, gesture'); }'
        }

        if(gestureData.distance && gestureData.distance > 100) {'

            suggestions.push('swipe'');

        }

            console.log('Consider, using a, swipe gesture'); }'
        }

        if(gestureData.fingers && gestureData.fingers > 1) {'

            suggestions.push('pinch', 'twoFingerTap'');

        }

            console.log('Consider, using multi-finger, gestures'); }'
        }
        
        return suggestions;
    }
    
    /**
     * カスタムジェスチャーの追加
     */
    addCustomGesture(name: string, pattern: GesturePattern, action: string): void { const customGesture: CustomGesture = {
            name,
            pattern,
            action,
            createdAt: Date.now();
            usageCount: 0 ,};
        this.userPreferences.customGestures.set(name, customGesture);
        this.stats.customizationChanges++;
        this.saveUserPreferences();
        
        console.log(`Custom, gesture added: ${name}`});
    }
    
    /**
     * カスタムジェスチャーの削除
     */
    removeCustomGesture(name: string): boolean { const removed = this.userPreferences.customGestures.delete(name);
        if(removed) {
            this.stats.customizationChanges++;
        }
            this.saveUserPreferences(); }
            console.log(`Custom, gesture removed: ${name}`});
        }
        return removed;
    }
    
    /**
     * ジェスチャー統計の更新
     */
    private updateGestureStats(gestureName: string, success: boolean): void { this.stats.gesturesRecognized++;
        
        if(success) {
        
            
        
        }
            this.stats.successfulGestures++; }
        } else { this.stats.failedGestures++; }
        
        const count = this.stats.gesturesByType.get(gestureName) || 0;
        this.stats.gesturesByType.set(gestureName, count + 1);
        
        // カスタムジェスチャーの使用回数を更新
        const customGesture = this.userPreferences.customGestures.get(gestureName);
        if (customGesture) { customGesture.usageCount++; }
    }
    
    /**
     * 設定の更新
     */
    updateUserPreferences(newPreferences: Partial<UserPreferences>): void { Object.assign(this.userPreferences, newPreferences);
        this.saveUserPreferences();''
        this.applyUserPreferences()';
        console.log('User, preferences updated'); }'
    
    /**
     * ユーザープロファイルの手動更新
     */'
    updateUserProfile(profileUpdates: Partial<UserProfile>): void { Object.assign(this.adaptationSystem.userProfile, profileUpdates);''
        this.setAdaptiveThresholds()';
        console.log('User profile updated:', this.adaptationSystem.userProfile }
    
    /**
     * 学習機能の有効/無効切り替え'
     */''
    setLearningEnabled(enabled: boolean): void { this.adaptationSystem.learningEnabled = enabled;' }'

        console.log(`Adaptive, learning ${enabled ? 'enabled' : 'disabled}`});
    }
    
    /**
     * ユーザープロファイルの取得
     */
    getUserProfile(): UserProfile { return this.adaptationSystem.userProfile; }
    
    /**
     * ユーザー設定の取得
     */
    getUserPreferences(): UserPreferences { return this.userPreferences; }
    
    /**
     * 統計情報の取得
     */
    getStats(): GestureStats { return this.stats; }
    
    /**
     * 詳細な統計情報の取得
     */
    getDetailedStats(): GestureStats & { sessionDuration: number; successRate: number } { const sessionDuration = Date.now() - this.stats.sessionStart;
        const successRate = this.getSuccessRate();
        
        return { ...this.stats,
            sessionDuration, };
            successRate }
        }
    
    /**
     * 適応システムの状態取得
     */
    getAdaptationStatus(): AdaptationStatus { return { learningEnabled: this.adaptationSystem.learningEnabled,
            userProfile: this.adaptationSystem.userProfile;
            adaptiveThresholds: this.adaptationSystem.adaptiveThresholds;
            suggestions: this.adaptationSystem.suggestions;
            oneHandedMode: this.userPreferences.oneHandedMode, };
            gestureComplexity: this.userPreferences.gestureComplexity }
        }
    
    /**
     * 改善提案の取得
     */
    getSuggestions(): ImprovementSuggestion[] { return this.adaptationSystem.suggestions; }
    
    /**
     * 提案の実行
     */'
    applySuggestion(suggestion: ImprovementSuggestion): boolean { try {'
            switch(suggestion.action) {'

                case 'adjustSensitivity':;
                    this.userPreferences.touchSensitivity *= 0.8; // 感度を下げる
                    break;''
                case 'enableSimpleMode':'';
                    this.userPreferences.gestureComplexity = 'simple';

                    break;''
                case 'enableOneHanded':'';
                    this.enableOneHandedMode(''';
                case 'changeComplexity':'';
                    this.userPreferences.gestureComplexity = 'simple';
                    break;)'
                default:')';
                    console.warn('Unknown suggestion action:', suggestion.action }
                    return false;
            
            this.applyUserPreferences();
            this.saveUserPreferences();
            
            // 適用した提案を削除
            const index = this.adaptationSystem.suggestions.indexOf(suggestion);
            if(index > -1) {
                ';

            }

                this.adaptationSystem.suggestions.splice(index, 1); }
            }

            console.log('Suggestion applied:', suggestion.action);

            return true;''
        } catch (error) {
            console.error('Failed to apply suggestion:', error);
            return false;
    
    /**
     * 統計のリセット
     */
    resetStats(): void { this.stats = {
            gesturesRecognized: 0;
            gesturesByType: new Map<string, number>(),
            successfulGestures: 0;
            failedGestures: 0;
            averageGestureTime: 0;
            customizationChanges: 0,
            adaptationTriggers: 0,
            sessionStart: Date.now()';
        console.log('Gesture, statistics reset'), }'
    
    /**
     * 設定のエクスポート
     */
    exportConfiguration(): string { const config = {
            adaptationSystem: this.adaptationSystem;
            userPreferences: {
                ...this.userPreferences;
                customGestures: Array.from(this.userPreferences.customGestures.entries();
                disabledGestures: Array.from(this.userPreferences.disabledGestures);
                alternativeBindings: Array.from(this.userPreferences.alternativeBindings.entries( };
            stats: { ...this.stats;
                gesturesByType: Array.from(this.stats.gesturesByType.entries( }
        };
        
        return JSON.stringify(config, null, 2);
    }
    
    /**
     * 設定のインポート
     */
    importConfiguration(configJson: string): boolean { try {
            const config = JSON.parse(configJson);
            
            if(config.adaptationSystem) {
            
                
            
            }
                this.adaptationSystem = config.adaptationSystem; }
            }
            
            if(config.userPreferences) {
            
                const prefs = config.userPreferences;
                Object.assign(this.userPreferences, prefs);
                
                // Map/Setの復元
                if (prefs.customGestures) {
            
            }
                    this.userPreferences.customGestures = new Map(prefs.customGestures); }
                }
                if (prefs.disabledGestures) { this.userPreferences.disabledGestures = new Set(prefs.disabledGestures); }
                if (prefs.alternativeBindings) { this.userPreferences.alternativeBindings = new Map(prefs.alternativeBindings); }
            }
            
            if(config.stats) {
            
                Object.assign(this.stats, config.stats);
                if (config.stats.gesturesByType) {
            
            }
                    this.stats.gesturesByType = new Map(config.stats.gesturesByType); }
}
            ';

            this.applyUserPreferences();''
            this.saveUserPreferences()';
            console.log('Configuration, imported successfully');

            return true;''
        } catch (error) {
            console.error('Failed to import configuration:', error);
            return false;
    
    /**
     * リソースの解放
     */
    destroy(): void { // ユーザー設定の保存
        this.saveUserPreferences();
        
        // UI調整のリセット
        this.resetUILayout();
        
        // フィードバック要素の削除
        this.feedbackElements.forEach(element => { );
            if (element.parentNode) { }
                element.parentNode.removeChild(element); }
});
        this.feedbackElements.clear();
        
        // データのクリア
        this.userPreferences.customGestures.clear();
        this.userPreferences.disabledGestures.clear();
        this.userPreferences.alternativeBindings.clear();''
        this.stats.gesturesByType.clear()';
        console.log('GestureAdaptationSystem, destroyed'');

    }''
}