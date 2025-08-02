/**
 * 実績管理クラス - Main Achievement Management System
 * 分割されたコンポーネントを統合し、実績システムの中央制御を行う
 */
// AchievementProgressEngine import removed - functionality integrated into ProgressTracker
import { AchievementDefinitions } from './achievements/AchievementDefinitions.js';
import { AchievementNotificationSystem } from './achievements/AchievementNotificationSystem.js';
import { AchievementProgressTracker } from './achievements/AchievementProgressTracker.js';
import { AchievementPerformanceOptimizer } from './achievements/AchievementPerformanceOptimizer.js';

export class AchievementManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // コンポーネント初期化
        this.definitions = new AchievementDefinitions();
        this.notificationSystem = new AchievementNotificationSystem();
        this.progressTracker = new AchievementProgressTracker();
        this.performanceOptimizer = new AchievementPerformanceOptimizer();
        
        // 進捗計算エンジン機能はprogressTrackerに統合済み
        
        // 統合設定
        this.config = {
            enableNotifications: true,
            enablePerformanceOptimization: true,
            autoSave: true,
            debugMode: false
        };
        
        this.initializeAchievementManager();
    }
    
    /**
     * 実績管理システムを初期化
     */
    initializeAchievementManager() {
        // パフォーマンス最適化を初期化
        this.performanceOptimizer.initialize();
        
        // 進捗追跡イベントリスナーを設定
        this.setupEventListeners();
        
        // 通知システム設定
        this.configureNotificationSystem();
        
        console.log('[AchievementManager] Achievement management system initialized');
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // 進捗追跡からの実績解除イベント
        this.progressTracker.addEventListener('achievementUnlocked', (data) => {
            this.handleAchievementUnlocked(data);
        });
        
        // 進捗更新イベント
        this.progressTracker.addEventListener('progressUpdated', (data) => {
            this.handleProgressUpdated(data);
        });
    }
    
    /**
     * 通知システムを設定
     */
    configureNotificationSystem() {
        if (this.config.enableNotifications) {
            this.notificationSystem.updateConfig({
                position: 'top-right',
                fadeIn: true,
                slideIn: true,
                sound: true
            });
        }
    }
    
    /**
     * 実績を初期化（後方互換性）
     */
    initializeAchievements() {
        return this.definitions.getAllAchievements();
    }
    
    /**
     * 進捗を更新
     * @param {string} eventType - イベントタイプ
     * @param {object} data - イベントデータ
     */
    updateProgress(eventType, data) {
        if (this.config.enablePerformanceOptimization) {
            // パフォーマンス最適化ありで処理
            this.performanceOptimizer.processUpdate(eventType, data, (type, eventData) => {
                return this.processUpdateEvent(type, eventData);
            });
        } else {
            // 直接処理
            this.processUpdateEvent(eventType, data);
        }
    }
    
    /**
     * 更新イベントを処理
     * @param {string} eventType - イベントタイプ
     * @param {object} data - イベントデータ
     */
    async processUpdateEvent(eventType, data) {
        // 進捗追跡を更新
        this.progressTracker.updateProgress(eventType, data);
        
        // 全実績をチェック
        const achievements = this.definitions.getAllAchievements();
        
        for (const achievement of Object.values(achievements)) {
            // 既に解除済みの実績はスキップ
            if (this.progressTracker.isAchievementUnlocked(achievement.id)) {
                continue;
            }
            
            // キャッシュチェック
            const cacheKey = `achievement_${achievement.id}_${eventType}`;
            let progressResult = this.performanceOptimizer.getFromCache(cacheKey);
            
            if (!progressResult) {
                // 実績条件を評価
                progressResult = this.progressTracker.evaluateAchievementCondition(achievement);
                
                // キャッシュに保存
                this.performanceOptimizer.setCache(cacheKey, progressResult);
            }
            
            // 実績解除チェック
            if (progressResult && progressResult.isComplete) {
                this.unlockAchievement(achievement);
            }
        }
    }
    
    /**
     * 実績を解除
     * @param {object} achievement - 実績オブジェクト
     */
    unlockAchievement(achievement) {
        // 進捗追跡に解除を記録
        this.progressTracker.unlockAchievement(achievement.id, achievement);
        
        // 通知を表示
        if (this.config.enableNotifications) {
            this.notificationSystem.createAchievementNotification(achievement);
        }
        
        // ゲームエンジンに通知（AP獲得など）
        if (this.gameEngine && this.gameEngine.handleAchievementUnlocked) {
            this.gameEngine.handleAchievementUnlocked(achievement);
        }
        
        console.log(`[AchievementManager] Achievement unlocked: ${achievement.name}`);
    }
    
    /**
     * 実績解除イベントを処理
     * @param {object} data - イベントデータ
     */
    handleAchievementUnlocked(data) {
        // 追加の処理が必要な場合はここに記述
        if (this.config.debugMode) {
            console.log('[AchievementManager] Achievement unlocked event:', data);
        }
    }
    
    /**
     * 進捗更新イベントを処理
     * @param {object} data - イベントデータ
     */
    handleProgressUpdated(data) {
        // 追加の処理が必要な場合はここに記述
        if (this.config.debugMode) {
            console.log('[AchievementManager] Progress updated event:', data);
        }
    }
    
    /**
     * 実績進捗を高度に更新（既存メソッドとの互換性）
     * @param {object} achievement - 実績オブジェクト
     * @param {string} eventType - イベントタイプ
     * @param {object} data - イベントデータ
     */
    updateAchievementProgressAdvanced(achievement, eventType, data) {
        const progressResult = this.progressTracker.evaluateAchievementCondition(achievement);
        
        if (progressResult && progressResult.isComplete) {
            this.unlockAchievement(achievement);
        }
        
        return progressResult;
    }
    
    /**
     * 実績条件を最適化チェック（既存メソッドとの互換性）
     * @param {object} achievement - 実績オブジェクト
     * @param {string} eventType - イベントタイプ
     * @param {object} data - イベントデータ
     * @returns {boolean} 条件を満たすかどうか
     */
    checkAchievementConditionOptimized(achievement, eventType, data) {
        const progressResult = this.progressTracker.evaluateAchievementCondition(achievement);
        return progressResult && progressResult.isComplete;
    }
    
    /**
     * 実績一覧を取得
     * @returns {object} 実績一覧
     */
    getAchievements() {
        return this.definitions.getAllAchievements();
    }
    
    /**
     * カテゴリ別実績を取得
     * @param {string} category - カテゴリ名
     * @returns {Array} カテゴリ内の実績配列
     */
    getAchievementsByCategory(category) {
        return this.definitions.getAchievementsByCategory(category);
    }
    
    /**
     * 実績進捗を取得
     * @param {string} achievementId - 実績ID
     * @returns {object} 進捗情報
     */
    getAchievementProgress(achievementId) {
        const achievement = this.definitions.getAchievement(achievementId);
        if (!achievement) return null;
        
        return this.progressTracker.evaluateAchievementCondition(achievement);
    }
    
    /**
     * 解除済み実績を取得
     * @returns {Array} 解除済み実績ID配列
     */
    getUnlockedAchievements() {
        return this.progressTracker.getUnlockedAchievements();
    }
    
    /**
     * 実績が解除済みかチェック
     * @param {string} achievementId - 実績ID
     * @returns {boolean} 解除済みかどうか
     */
    isUnlocked(achievementId) {
        return this.progressTracker.isAchievementUnlocked(achievementId);
    }
    
    /**
     * 実績統計を取得
     * @returns {object} 実績統計
     */
    getStatistics() {
        const definitions = this.definitions.getStatistics();
        const unlocked = this.progressTracker.getUnlockedAchievements();
        const performance = this.performanceOptimizer.getPerformanceStats();
        
        return {
            total: definitions.total,
            unlocked: unlocked.length,
            unlockedPercentage: (unlocked.length / definitions.total) * 100,
            categories: definitions.byCategory,
            performance,
            ...definitions
        };
    }
    
    /**
     * 通知履歴を取得
     * @param {number} limit - 取得件数制限
     * @returns {Array} 通知履歴
     */
    getNotificationHistory(limit = 10) {
        return this.notificationSystem.getNotificationHistory(limit);
    }
    
    /**
     * 進捗データを取得
     * @returns {object} 進捗データ
     */
    getProgressData() {
        return this.progressTracker.getProgressData();
    }
    
    /**
     * 設定を更新
     * @param {object} config - 新しい設定
     */
    updateConfig(config) {
        Object.assign(this.config, config);
        
        // コンポーネントの設定も更新
        if (config.notifications) {
            this.notificationSystem.updateConfig(config.notifications);
        }
        
        if (config.performance) {
            this.performanceOptimizer.updateConfig(config.performance);
        }
    }
    
    /**
     * デバッグ情報を取得
     * @returns {object} デバッグ情報
     */
    getDebugInfo() {
        return {
            config: this.config,
            statistics: this.getStatistics(),
            progressData: this.progressTracker.getProgressData(),
            performance: this.performanceOptimizer.getPerformanceStats(),
            notificationHistory: this.notificationSystem.getNotificationHistory(5),
            progressHistory: this.progressTracker.getProgressHistory(10)
        };
    }
    
    /**
     * データをリセット
     */
    resetData() {
        this.progressTracker.resetProgress();
        this.notificationSystem.clearAllNotifications();
        this.performanceOptimizer.resetPerformanceStats();
        
        console.log('[AchievementManager] All achievement data reset');
    }
    
    /**
     * 実績管理システムを破棄
     */
    destroy() {
        this.performanceOptimizer.destroy();
        this.notificationSystem.destroy();
        
        console.log('[AchievementManager] Achievement management system destroyed');
    }
}