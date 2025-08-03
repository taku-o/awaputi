import { getErrorHandler } from './ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { QualityDecisionAnalyzer } from './adaptive-quality-controller/QualityDecisionAnalyzer.js';
import { QualityTransitionController } from './adaptive-quality-controller/QualityTransitionController.js';
import { QualityValidationManager } from './adaptive-quality-controller/QualityValidationManager.js';

/**
 * Adaptive Quality Control System (Main Controller)
 * 適応的品質制御システム - Main Controller Pattern で各サブコンポーネントを統制
 * 
 * Main Controller Pattern:
 * - 公開APIを維持し、後方互換性を保証
 * - 専門化されたサブコンポーネントに処理を委譲
 * - 統一されたエラーハンドリングと設定管理
 * 
 * サブコンポーネント:
 * - QualityDecisionAnalyzer: 品質決定分析
 * - QualityTransitionController: 品質遷移制御
 * - QualityValidationManager: 品質検証管理
 */
export class AdaptiveQualityController {
    constructor() {
        this.errorHandler = getErrorHandler();
        this.configManager = getConfigurationManager();
        
        // サブコンポーネントを初期化
        this.decisionAnalyzer = new QualityDecisionAnalyzer();
        this.transitionController = new QualityTransitionController();
        this.validationManager = new QualityValidationManager();
        
        // 統合品質制御設定（簡素化）
        this.qualityConfig = {
            enabled: true,
            autoAdjustment: true,
            userOverride: false,
            adjustmentSensitivity: 'balanced',
            transitionDuration: 2000,
            stabilizationTime: 5000
        };
        
        // 品質レベル定義（簡素化）
        this.qualityLevels = {
            'ultra': { index: 4, label: 'Ultra High', targetFPS: 60, minFPS: 55 },
            'high': { index: 3, label: 'High', targetFPS: 60, minFPS: 50 },
            'medium': { index: 2, label: 'Medium', targetFPS: 60, minFPS: 45 },
            'low': { index: 1, label: 'Low', targetFPS: 50, minFPS: 35 },
            'minimal': { index: 0, label: 'Minimal', targetFPS: 30, minFPS: 25 }
        };
        
        // 現在の品質状態（簡素化）
        this.qualityState = {
            currentLevel: 'high',
            targetLevel: 'high',
            isTransitioning: false,
            performanceHistory: [],
            lastAdjustmentTime: 0,
            userOverrideActive: false
        };
        
        // パフォーマンス監視設定（簡素化）
        this.performanceMonitoring = {
            enabled: true,
            sampleInterval: 500,
            historySize: 60
        };
        
        // 調整アルゴリズム設定（簡素化）
        this.adjustmentAlgorithms = {
            sensitivity: this.qualityConfig.adjustmentSensitivity,
            smoothTransitions: true
        };
        
        // 視覚的一貫性設定（簡素化）
        this.visualConsistency = {
            enabled: true,
            gradualTransitions: true
        };
        
        // 統計情報（簡素化）
        this.stats = {
            totalAdjustments: 0,
            rollbacks: 0,
            userOverrides: 0
        };
        
        this.initializeQualityController();
        
        console.log('[AdaptiveQualityController] Main Controller initialized with sub-components');
    }
    
    /**
     * 品質コントローラーを初期化（委譲版）
     */
    initializeQualityController() {
        this.loadUserPreferences();
        this.startPerformanceMonitoring();
        this.initializeQualityState();
        console.log('[AdaptiveQualityController] Controller 初期化完了');
    }
    
    /**
     * ユーザー設定読み込み（簡素化）
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('adaptiveQuality_userPreferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                if (preferences.lastQualityLevel) {
                    this.qualityState.currentLevel = preferences.lastQualityLevel;
                    this.qualityState.targetLevel = preferences.lastQualityLevel;
                }
            }
        } catch (error) {
            console.warn('[AdaptiveQualityController] 設定読み込みエラー:', error);
        }
    }
    
    /**
     * ユーザー設定保存（簡素化）
     */
    saveUserPreferences() {
        try {
            const preferences = {
                lastQualityLevel: this.qualityState.currentLevel,
                lastSaved: Date.now()
            };
            localStorage.setItem('adaptiveQuality_userPreferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('[AdaptiveQualityController] 設定保存エラー:', error);
        }
    }
    
    /**
     * パフォーマンス監視開始（簡素化）
     */
    startPerformanceMonitoring() {
        if (!this.performanceMonitoring.enabled) return;
        
        this.monitoringInterval = setInterval(() => {
            this.updatePerformanceMetrics();
        }, this.performanceMonitoring.sampleInterval);
        
        console.log('[AdaptiveQualityController] パフォーマンス監視開始');
    }
    
    /**
     * パフォーマンス指標更新（委譲）
     */
    updatePerformanceMetrics() {
        try {
            const currentMetrics = this.gatherPerformanceMetrics();
            this.qualityState.performanceHistory.push({
                timestamp: Date.now(),
                ...currentMetrics
            });
            
            if (this.qualityState.performanceHistory.length > this.performanceMonitoring.historySize) {
                this.qualityState.performanceHistory.shift();
            }
        } catch (error) {
            this.errorHandler.handleError(error, { context: 'updatePerformanceMetrics' });
        }
    }
    
    /**
     * パフォーマンス指標収集（簡素化）
     */
    gatherPerformanceMetrics() {
        return {
            fps: 60,
            frameTime: 16.67,
            memoryUsage: 0.5,
            droppedFrames: 0
        };
    }
    
    /**
     * 初期品質状態設定
     */
    initializeQualityState() {
        this.qualityState.currentLevel = 'high';
        this.qualityState.targetLevel = 'high';
        console.log('[AdaptiveQualityController] 品質状態初期化');
    }
    
    // ========================================
    // 公開API - 品質調整（委譲パターン）
    // ========================================
    
    /**
     * 品質調整の評価と実行（委譲）
     * @param {Object} performanceMetrics - パフォーマンス指標
     * @returns {Object} 調整結果
     */
    evaluateQualityAdjustment(performanceMetrics) {
        if (!this.qualityConfig.autoAdjustment || this.qualityState.userOverrideActive) {
            return { needsAdjustment: false, reason: 'disabled_or_override' };
        }
        
        const currentQuality = {
            level: this.qualityState.currentLevel,
            index: this.qualityLevels[this.qualityState.currentLevel]?.index || 2
        };
        
        // QualityDecisionAnalyzer に委譲
        return this.decisionAnalyzer.evaluateQualityAdjustment(performanceMetrics, currentQuality);
    }
    
    /**
     * 品質レベル変更の実行（委譲）
     * @param {string} targetLevel - 目標品質レベル
     * @param {Object} options - オプション
     * @returns {Promise<Object>} 変更結果
     */
    async changeQualityLevel(targetLevel, options = {}) {
        if (!this.qualityLevels[targetLevel]) {
            return { success: false, reason: 'invalid_level' };
        }
        
        const fromLevel = this.qualityState.currentLevel;
        
        // QualityTransitionController に委譲
        const transitionResult = await this.transitionController.executeQualityTransition(
            fromLevel, 
            targetLevel, 
            options
        );
        
        if (transitionResult.success) {
            this.qualityState.currentLevel = targetLevel;
            this.qualityState.targetLevel = targetLevel;
            this.qualityState.lastAdjustmentTime = Date.now();
            this.stats.totalAdjustments++;
            
            this.saveUserPreferences();
        }
        
        return transitionResult;
    }
    
    /**
     * 品質調整の検証開始（委譲）
     * @param {Object} baseline - ベースライン指標
     * @param {Object} adjustmentData - 調整データ
     * @returns {Promise<Object>} 検証結果
     */
    async validateQualityAdjustment(baseline, adjustmentData) {
        // QualityValidationManager に委譲
        return await this.validationManager.startQualityValidation(baseline, adjustmentData);
    }
    
    /**
     * 品質を手動設定
     * @param {string} level - 品質レベル
     * @param {boolean} permanent - 永続的な設定かどうか
     */
    setQualityLevel(level, permanent = false) {
        if (!this.qualityLevels[level]) {
            console.warn(`[AdaptiveQualityController] Invalid quality level: ${level}`);
            return false;
        }
        
        this.qualityState.currentLevel = level;
        this.qualityState.targetLevel = level;
        this.qualityState.userOverrideActive = permanent;
        this.qualityState.lastAdjustmentTime = Date.now();
        
        if (permanent) {
            this.stats.userOverrides++;
        }
        
        this.saveUserPreferences();
        console.log(`[AdaptiveQualityController] Quality level set to: ${level}`);
        return true;
    }
    
    /**
     * 自動調整を有効/無効化
     * @param {boolean} enabled - 有効フラグ
     */
    setAutoAdjustment(enabled) {
        this.qualityConfig.autoAdjustment = enabled;
        console.log(`[AdaptiveQualityController] Auto adjustment: ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    // ========================================
    // 公開API - 状態取得
    // ========================================
    
    /**
     * 現在の品質レベルを取得
     * @returns {string} 現在の品質レベル
     */
    getCurrentQualityLevel() {
        return this.qualityState.currentLevel;
    }
    
    /**
     * 品質レベル一覧を取得
     * @returns {Object} 品質レベル一覧
     */
    getQualityLevels() {
        return { ...this.qualityLevels };
    }
    
    /**
     * パフォーマンス統計を取得
     * @returns {Object} パフォーマンス統計
     */
    getPerformanceStats() {
        return this.decisionAnalyzer.getPerformanceStats();
    }
    
    /**
     * 品質調整統計を取得
     * @returns {Object} 調整統計
     */
    getQualityStats() {
        return {
            ...this.stats,
            transitionStats: this.transitionController.getTransitionStats(),
            validationStats: this.validationManager.getValidationStats()
        };
    }
    
    /**
     * システム設定を取得
     * @returns {Object} システム設定
     */
    getConfiguration() {
        return {
            qualityConfig: { ...this.qualityConfig },
            performanceMonitoring: { ...this.performanceMonitoring },
            adjustmentAlgorithms: { ...this.adjustmentAlgorithms },
            visualConsistency: { ...this.visualConsistency }
        };
    }
    
    /**
     * 現在の状態を取得
     * @returns {Object} 現在の状態
     */
    getCurrentState() {
        return {
            qualityState: { ...this.qualityState },
            isTransitioning: this.transitionController.isTransitionInProgress(),
            isValidating: this.validationManager.isValidationInProgress(),
            currentTransition: this.transitionController.getCurrentTransition(),
            currentValidation: this.validationManager.getCurrentValidation()
        };
    }
    
    // ========================================
    // 公開API - システム制御
    // ========================================
    
    /**
     * システムを停止
     */
    stop() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        this.transitionController.clearAllTimers();
        this.validationManager.clearValidationTimers();
        
        console.log('[AdaptiveQualityController] System stopped');
    }
    
    /**
     * システムをリセット
     */
    reset() {
        this.stop();
        
        this.qualityState = {
            currentLevel: 'high',
            targetLevel: 'high',
            isTransitioning: false,
            performanceHistory: [],
            lastAdjustmentTime: 0,
            userOverrideActive: false
        };
        
        this.stats = {
            totalAdjustments: 0,
            rollbacks: 0,
            userOverrides: 0
        };
        
        this.decisionAnalyzer.resetStats();
        this.transitionController.resetTransitionHistory();
        
        this.startPerformanceMonitoring();
        
        console.log('[AdaptiveQualityController] System reset');
    }
    
    /**
     * システムを破棄
     */
    dispose() {
        this.stop();
        
        // リソースをクリア
        this.qualityState.performanceHistory = [];
        this.decisionAnalyzer = null;
        this.transitionController = null;
        this.validationManager = null;
        
        console.log('[AdaptiveQualityController] System disposed');
    }
}

/**
 * グローバルインスタンス管理
 */
let adaptiveQualityControllerInstance = null;

/**
 * グローバル適応品質コントローラーを取得
 * @returns {AdaptiveQualityController} 適応品質コントローラーインスタンス
 */
export function getAdaptiveQualityController() {
    if (!adaptiveQualityControllerInstance) {
        adaptiveQualityControllerInstance = new AdaptiveQualityController();
    }
    return adaptiveQualityControllerInstance;
}