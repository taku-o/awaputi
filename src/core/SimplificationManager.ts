/**
 * SimplificationManager - UI複雑さ軽減管理システム
 * 
 * Main Controller Pattern実装により、専門化されたサブコンポーネントを統制します。
 * WCAG 2.1 AAガイドラインに準拠した認知アクセシビリティ機能を実装します。
 */

import { SimplificationModeController } from './simplification-manager/SimplificationModeController.js';
import { UIComplexityAnalyzer } from './simplification-manager/UIComplexityAnalyzer.js';
import { InterfaceSimplifier } from './simplification-manager/InterfaceSimplifier.js';
import { AdaptiveSimplificationEngine } from './simplification-manager/AdaptiveSimplificationEngine.js';

// 型定義
interface GameEngine {
    [key: string]: any;
}

interface SimplificationConfig {
    defaultMode: string;
    autoSimplification: boolean;
    adaptiveComplexity: boolean;
}

interface CurrentSimplification {
    id: string;
    level: string;
    options: any;
    timestamp: number;
}

interface SessionMetrics {
    startTime: number;
    simplificationCount: number;
    userSatisfaction: number | null;
}

interface SimplificationState {
    currentSimplification: CurrentSimplification | null;
    activeAdaptations: any[];
    userPreferences: Record<string, any>;
    sessionMetrics: SessionMetrics;
}

interface ModeConfig {
    level: string;
    combined: {
        settings: any;
        complexity: any;
    };
}

interface SimplificationResult {
    success: boolean;
    id?: string;
    operationsApplied?: number;
    error?: string;
}

interface ComplexityAnalysis {
    overallComplexity: {
        score: number;
        level: string;
    };
    recommendations: Recommendation[];
}

interface Recommendation {
    priority: string;
    level: string;
    reason: string;
    confidence: number;
}

interface InitializeOptions {
    adaptiveSettings?: any;
    [key: string]: any;
}

interface AutoCriteria {
    analysisInterval?: number;
}

interface GameAnalytics {
    trackEvent: (category: string, data: any) => void;
}

declare global {
    interface Window {
        gameAnalytics?: GameAnalytics;
    }
}

export class SimplificationManager {
    private gameEngine: GameEngine;
    private isInitialized: boolean;
    private config: SimplificationConfig;
    private modeController: SimplificationModeController;
    private complexityAnalyzer: UIComplexityAnalyzer;
    private interfaceSimplifier: InterfaceSimplifier;
    private adaptiveEngine: AdaptiveSimplificationEngine;
    private state: SimplificationState;
    private autoAnalysisTimer: NodeJS.Timeout | null;

    /**
     * SimplificationManagerを初期化
     * @param gameEngine - ゲームエンジンインスタンス
     */
    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        this.isInitialized = false;
        
        // デフォルト設定
        this.config = {
            defaultMode: 'standard',
            autoSimplification: false,
            adaptiveComplexity: true
        };
        
        // サブコンポーネントを初期化
        this.modeController = new SimplificationModeController();
        this.complexityAnalyzer = new UIComplexityAnalyzer();
        this.interfaceSimplifier = new InterfaceSimplifier();
        this.adaptiveEngine = new AdaptiveSimplificationEngine();
        
        // 状態管理
        this.state = {
            currentSimplification: null,
            activeAdaptations: [],
            userPreferences: {},
            sessionMetrics: {
                startTime: Date.now(),
                simplificationCount: 0,
                userSatisfaction: null
            }
        };
        
        this.autoAnalysisTimer = null;
        this.setupEventListeners();
    }

    /**
     * イベントリスナーを設定
     */
    private setupEventListeners(): void {
        // 適応推奨イベント
        document.addEventListener('simplificationAdaptation', (e) => {
            this.handleAdaptiveRecommendation((e as CustomEvent).detail);
        });

        // 複雑度変化イベント
        document.addEventListener('complexityChanged', (e) => {
            this.handleComplexityChange((e as CustomEvent).detail);
        });
    }

    /**
     * SimplificationManagerを初期化
     * @param options - 初期化オプション
     */
    async initialize(options: InitializeOptions = {}): Promise<void> {
        if (this.isInitialized) return;
        
        try {
            // 設定をマージ
            Object.assign(this.config, options);
            
            // サブコンポーネント設定
            if (options.adaptiveSettings) {
                this.adaptiveEngine.updateAdaptationSettings(options.adaptiveSettings);
            }
            
            // 保存された設定を読み込み
            this.modeController.loadFromStorage();
            
            // 初期複雑度分析
            this.complexityAnalyzer.analyzeComplexity();
            
            this.isInitialized = true;
            this.logEvent('initialized', { config: this.config });

        } catch (error) {
            console.error('SimplificationManager initialization failed:', error);
            throw error;
        }
    }

    /**
     * 簡素化モードを変更
     */
    changeMode(newMode: string, reason: string = 'manual'): ModeConfig {
        try {
            const modeConfig = this.modeController.changeMode(newMode, reason);
            
            // 現在の簡素化を適用
            this.applySimplification(modeConfig.level, {
                ...modeConfig.combined.settings,
                reason
            });
            
            // 設定を保存
            this.modeController.saveToStorage();
            
            this.logEvent('mode_changed', {
                newMode,
                reason,
                complexity: modeConfig.combined.complexity
            });
            
            return modeConfig;

        } catch (error) {
            console.error('Failed to change mode:', error);
            throw error;
        }
    }

    /**
     * 簡素化レベルを変更
     */
    changeLevel(newLevel: string, reason: string = 'manual'): any {
        try {
            const customMode = this.modeController.changeLevel(newLevel, reason);
            
            this.applySimplification(newLevel, {
                reason,
                customMode: true
            });

            this.logEvent('level_changed', { newLevel, reason });
            
            return customMode;

        } catch (error) {
            console.error('Failed to change level:', error);
            throw error;
        }
    }

    /**
     * 簡素化を適用
     */
    async applySimplification(level: string, options: any = {}): Promise<SimplificationResult> {
        try {
            // 前の簡素化を元に戻す
            if (this.state.currentSimplification) {
                await this.revertCurrentSimplification();
            }
            
            // 新しい簡素化を適用
            const result = this.interfaceSimplifier.applySimplification(level, options);
            
            if (result.success) {
                this.state.currentSimplification = {
                    id: result.id!,
                    level,
                    options,
                    timestamp: Date.now()
                };
                
                this.logEvent('simplification_applied', {
                    level,
                    operationsCount: result.operationsApplied
                });
                
                return result;
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Failed to apply simplification:', error);
            throw error;
        }
    }

    /**
     * 現在の簡素化を元に戻す
     */
    async revertCurrentSimplification(): Promise<SimplificationResult> {
        if (!this.state.currentSimplification) return { success: true };
        
        try {
            const result = this.interfaceSimplifier.revertSimplification(
                this.state.currentSimplification.id
            );

            if (result.success) {
                this.state.currentSimplification = null;
                this.logEvent('simplification_reverted');
                return result;
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Failed to revert simplification:', error);
            throw error;
        }
    }

    /**
     * 複雑度を分析
     */
    analyzeComplexity(container: HTMLElement = document.body): ComplexityAnalysis | null {
        const analysis = this.complexityAnalyzer.analyzeComplexity(container);
        
        if (analysis) {
            this.logEvent('complexity_analyzed', {
                overallScore: analysis.overallComplexity.score,
                level: analysis.overallComplexity.level,
                recommendationsCount: analysis.recommendations.length
            });
            
            // 自動簡素化が有効な場合
            if (this.config.autoSimplification) {
                this.handleComplexityRecommendations(analysis.recommendations);
            }
        }
        
        return analysis;
    }

    /**
     * 複雑度推奨を処理
     */
    private handleComplexityRecommendations(recommendations: Recommendation[]): void {
        const highPriorityRecommendations = recommendations.filter(r => r.priority === 'high');
        
        if (highPriorityRecommendations.length > 0) {
            // 自動的により高い簡素化レベルを推奨
            const currentLevel = this.modeController.currentLevel;
            const nextLevel = this.getNextSimplificationLevel(currentLevel);
            
            if (nextLevel) {
                this.changeLevel(nextLevel, 'auto_complexity_recommendation');
            }
        }
    }

    /**
     * 次の簡素化レベルを取得
     */
    private getNextSimplificationLevel(currentLevel: string): string | null {
        const levelOrder = ['none', 'minimal', 'moderate', 'significant', 'extreme'];
        const currentIndex = levelOrder.indexOf(currentLevel);
        
        if (currentIndex >= 0 && currentIndex < levelOrder.length - 1) {
            return levelOrder[currentIndex + 1];
        }
        
        return null;
    }

    /**
     * 適応推奨を処理
     */
    private handleAdaptiveRecommendation(recommendation: Recommendation): void {
        if (!this.config.adaptiveComplexity) return;

        this.logEvent('adaptive_recommendation', recommendation);
        
        // 推奨を自動適用するかユーザーに確認
        if (recommendation.confidence > 0.8) {
            this.changeLevel(recommendation.level, `adaptive: ${recommendation.reason}`);
        } else {
            this.notifyUserOfRecommendation(recommendation);
        }
    }

    /**
     * ユーザーに推奨を通知
     */
    private notifyUserOfRecommendation(recommendation: Recommendation): void {
        const event = new CustomEvent('simplificationRecommendation', {
            detail: {
                ...recommendation,
                actions: {
                    accept: () => this.changeLevel(recommendation.level, `accepted: ${recommendation.reason}`),
                    decline: () => this.logEvent('recommendation_declined', recommendation),
                    postpone: () => this.logEvent('recommendation_postponed', recommendation)
                }
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * 複雑度変化を処理
     */
    private handleComplexityChange(complexityData: any): void {
        this.logEvent('complexity_changed', complexityData);
        
        // 必要に応じて再分析
        if (complexityData.significant) {
            setTimeout(() => {
                this.analyzeComplexity();
            }, 1000);
        }
    }

    /**
     * ユーザー設定を更新
     */
    updateUserPreferences(preferences: Record<string, any>): void {
        Object.assign(this.state.userPreferences, preferences);
        
        // モードコントローラーに反映
        if (preferences.defaultMode) {
            this.modeController.currentMode = preferences.defaultMode;
        }
        
        // 適応エンジンに反映
        if (preferences.adaptiveSettings) {
            this.adaptiveEngine.updateAdaptationSettings(preferences.adaptiveSettings);
        }

        this.logEvent('preferences_updated', preferences);
    }

    /**
     * 自動簡素化を有効/無効
     */
    setAutoSimplification(enabled: boolean, criteria: AutoCriteria = {}): void {
        this.config.autoSimplification = enabled;
        
        if (enabled) {
            // 複雑度分析の自動実行を開始
            this.startAutoAnalysis(criteria);
        } else {
            this.stopAutoAnalysis();
        }

        this.logEvent('auto_simplification_toggled', { enabled, criteria });
    }

    /**
     * 自動分析を開始
     */
    private startAutoAnalysis(criteria: AutoCriteria = {}): void {
        const interval = criteria.analysisInterval || 30000; // 30秒ごと
        
        this.autoAnalysisTimer = setInterval(() => {
            this.analyzeComplexity();
        }, interval);
    }

    /**
     * 自動分析を停止
     */
    private stopAutoAnalysis(): void {
        if (this.autoAnalysisTimer) {
            clearInterval(this.autoAnalysisTimer);
            this.autoAnalysisTimer = null;
        }
    }

    /**
     * 利用可能なモードを取得
     */
    getAvailableModes(): any[] {
        return this.modeController.getAvailableModes();
    }

    /**
     * 利用可能なレベルを取得
     */
    getAvailableLevels(): any[] {
        return this.modeController.getAvailableLevels();
    }

    /**
     * 現在の設定を取得
     */
    getCurrentSettings(): any {
        return {
            mode: this.modeController.getCurrentModeConfig(),
            complexity: this.complexityAnalyzer.getCurrentMetrics(),
            simplification: this.state.currentSimplification,
            config: { ...this.config },
            userPreferences: { ...this.state.userPreferences }
        };
    }

    /**
     * 統計情報を取得
     */
    getStats(): any {
        return {
            session: {
                ...this.state.sessionMetrics,
                duration: Date.now() - this.state.sessionMetrics.startTime
            },
            mode: this.modeController.getStats(),
            complexity: this.complexityAnalyzer.getStats(),
            simplification: this.interfaceSimplifier.getStats(),
            adaptive: this.adaptiveEngine.getStats()
        };
    }

    /**
     * エラーを報告
     */
    reportError(error: Error, context: any = {}): void {
        this.adaptiveEngine.recordError(error);
        this.logEvent('error_reported', { error, context });
    }

    /**
     * ヘルプリクエストを報告
     */
    reportHelpRequest(context: any = {}): void {
        this.adaptiveEngine.recordHelpRequest(context);
        this.logEvent('help_requested', context);
    }

    /**
     * ユーザー満足度を設定
     */
    setUserSatisfaction(satisfaction: number): void {
        this.state.sessionMetrics.userSatisfaction = satisfaction;
        this.logEvent('satisfaction_reported', { satisfaction });
    }

    /**
     * 設定を保存
     */
    saveSettings(): void {
        this.modeController.saveToStorage();

        const settingsData = {
            config: this.config,
            userPreferences: this.state.userPreferences,
            sessionMetrics: this.state.sessionMetrics
        };

        localStorage.setItem('bubblePop_simplificationSettings', JSON.stringify(settingsData));
    }

    /**
     * 設定を読み込み
     */
    loadSettings(): void {
        try {
            const stored = localStorage.getItem('bubblePop_simplificationSettings');
            if (stored) {
                const data = JSON.parse(stored);
                Object.assign(this.config, data.config || {});
                Object.assign(this.state.userPreferences, data.userPreferences || {});
                
                if (data.sessionMetrics) {
                    this.state.sessionMetrics = {
                        ...this.state.sessionMetrics,
                        ...data.sessionMetrics,
                        startTime: Date.now() // 新しいセッション
                    };
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    /**
     * 設定をリセット
     */
    resetSettings(): void {
        this.modeController.reset();
        this.adaptiveEngine.reset();
        
        this.config = {
            defaultMode: 'standard',
            autoSimplification: false,
            adaptiveComplexity: true
        };
        
        this.state = {
            currentSimplification: null,
            activeAdaptations: [],
            userPreferences: {},
            sessionMetrics: {
                startTime: Date.now(),
                simplificationCount: 0,
                userSatisfaction: null
            }
        };
        
        localStorage.removeItem('bubblePop_simplificationSettings');
        this.logEvent('settings_reset');
    }

    /**
     * イベントをログ
     */
    private logEvent(type: string, data: any = {}): void {
        if (console && console.log) {
            console.log(`[SimplificationManager] ${type}:`, data);
        }
        
        // アナリティクスに送信（実装されている場合）
        if (window.gameAnalytics && window.gameAnalytics.trackEvent) {
            window.gameAnalytics.trackEvent('simplification', {
                event_type: type,
                ...data
            });
        }
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        this.stopAutoAnalysis();
        this.interfaceSimplifier.destroy();
        this.complexityAnalyzer.destroy();
        this.adaptiveEngine.destroy();
        this.isInitialized = false;
        
        this.state = {
            currentSimplification: null,
            activeAdaptations: [],
            userPreferences: {},
            sessionMetrics: {
                startTime: Date.now(),
                simplificationCount: 0,
                userSatisfaction: null
            }
        };
    }
}